import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS sozlamalari
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Faqat POST so\'rov qabul qilinadi' });
  }

  const { phone_number, code } = req.body;

  if (!phone_number || !code) {
    return res.status(400).json({ error: 'Telefon raqami va kod kiritilishi shart' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Bazadan yaroqli kodni qidirish
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('code', code)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(400).json({ error: 'Kod noto\'g\'ri yoki muddati tugagan!' });
    }

    // Kodni "ishlatilgan" (is_used = true) qilib belgilab qo'yish
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', data[0].id);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, message: 'Kod tasdiqlandi' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
