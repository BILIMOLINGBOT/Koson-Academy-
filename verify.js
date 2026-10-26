const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function hashCode(phone, code) {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(`${phone}:${code}`)
    .digest('hex');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const body = req.body || {};
  const phone = '+' + String(body.phone || '').replace(/\D/g, '');
  const code = String(body.code || '').trim();

  if (phone.length < 8 || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ ok: false, error: "Ma'lumot noto'g'ri" });
  }

  const { data: rows } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('phone', phone)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1);

  const otp = rows && rows[0];
  if (!otp) return res.status(400).json({ ok: false, error: 'Kod topilmadi' });

  if (new Date(otp.expires_at) < new Date()) {
    await supabase.from('otp_codes').update({ used: true }).eq('id', otp.id);
    return res.status(400).json({ ok: false, error: 'Kod muddati tugagan' });
  }

  if (otp.attempts >= 5) {
    await supabase.from('otp_codes').update({ used: true }).eq('id', otp.id);
    return res.status(429).json({ ok: false, error: "Urinishlar ko'p. Yangi kod oling" });
  }

  const a = Buffer.from(hashCode(phone, code));
  const b = Buffer.from(otp.code_hash);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    await supabase
      .from('otp_codes')
      .update({ attempts: otp.attempts + 1 })
      .eq('id', otp.id);
    return res.status(400).json({ ok: false, error: "Kod noto'g'ri" });
  }

  await supabase.from('otp_codes').update({ used: true }).eq('id', otp.id);

  const { data: user } = await supabase
    .from('users')
    .select('telegram_id, phone, created_at')
    .eq('telegram_id', otp.telegram_id)
    .single();

  return res.status(200).json({ ok: true, user });
};
