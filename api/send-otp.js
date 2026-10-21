import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS sozlamalari (brauzerdan so'rov kelishi uchun ruxsat)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Faqat POST so\'rov yuboring' });
  }

  const { phone_number, telegram_chat_id } = req.body;

  if (!phone_number || !telegram_chat_id) {
    return res.status(400).json({ error: 'Telefon raqam va Telegram ID kiritilishi shart!' });
  }

  try {
    // Vercel'ga kiritilgan muhit o'zgaruvchilari (Environment Variables) orqali ulanish
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Tasodifiy 6 xonali kod yaratish
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Supabase bazasiga saqlash
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert([{ phone_number, telegram_chat_id, code: otpCode }]);

    if (dbError) throw dbError;

    // 3. Telegramga xabar yuborish
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const tgResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_chat_id,
        text: `Tizimga kirish uchun tasdiqlash kodingiz: <b>${otpCode}</b>\n\nKod 3 daqiqa davomida amal qiladi.`,
        parse_mode: 'HTML'
      })
    });

    if (!tgResponse.ok) {
        throw new Error("Telegram API xatoligi: Xabar yuborilmadi");
    }

    return res.status(200).json({ success: true, message: 'Kod yuborildi' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
