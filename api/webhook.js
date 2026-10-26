const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

async function tg(method, body) {
  await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function hashCode(phone, code) {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(`${phone}:${code}`)
    .digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('OK');

  // Webhook secret tekshiruvi
  if (req.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const msg = req.body && req.body.message;
    if (!msg) return res.status(200).send('OK');

    const chatId = msg.chat.id;
    const fromId = msg.from.id;

    // 1) /start
    if (msg.text && msg.text.startsWith('/start')) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: '🙏 Iltimos raqamingizni yuboring',
        reply_markup: {
          keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return res.status(200).send('OK');
    }

    // 2) Kontakt keldi
    if (msg.contact) {
      // Faqat o'z raqami
      if (msg.contact.user_id !== fromId) {
        await tg('sendMessage', {
          chat_id: chatId,
          text: "❌ Iltimos, faqat o'zingizning raqamingizni yuboring (tugma orqali).",
        });
        return res.status(200).send('OK');
      }

      const phone = '+' + String(msg.contact.phone_number).replace(/\D/g, '');

      // 60 soniyalik limit
      const { data: last } = await supabase
        .from('otp_codes')
        .select('created_at')
        .eq('telegram_id', fromId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (last && last.length) {
        const diff = Date.now() - new Date(last[0].created_at).getTime();
        if (diff < 60 * 1000) {
          const wait = Math.ceil((60 * 1000 - diff) / 1000);
          await tg('sendMessage', {
            chat_id: chatId,
            text: `⏳ Iltimos ${wait} soniya kuting va qayta urinib ko'ring.`,
          });
          return res.status(200).send('OK');
        }
      }

      // Foydalanuvchini saqlash
      await supabase
        .from('users')
        .upsert({ telegram_id: fromId, phone }, { onConflict: 'telegram_id' });

      // Eski kodlarni bekor qilish
      await supabase
        .from('otp_codes')
        .update({ used: true })
        .eq('telegram_id', fromId)
        .eq('used', false);

      // Yangi kod
      const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { error } = await supabase.from('otp_codes').insert({
        telegram_id: fromId,
        phone,
        code_hash: hashCode(phone, code),
        expires_at: expires,
      });

      if (error) {
        console.error(error);
        await tg('sendMessage', { chat_id: chatId, text: "⚠️ Xatolik yuz berdi. Keyinroq urinib ko'ring." });
        return res.status(200).send('OK');
      }

      await tg('sendMessage', {
        chat_id: chatId,
        text: `🔐 Tasdiqlash kodingiz: ${code}\n\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`,
        reply_markup: { remove_keyboard: true },
      });
    }
  } catch (e) {
    console.error(e);
  }

  return res.status(200).send('OK');
};
