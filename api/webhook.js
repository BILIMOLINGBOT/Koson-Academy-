export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Brauzerdan GET so'rov bilan tekshirganda ishlashini ko'rsatadi
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'L.uz Bot Webhook faol!' });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const message = body.message;

      if (message && message.text && message.text.startsWith('/start')) {
        const chatId = message.chat.id;
        const firstName = message.from?.first_name || "Foydalanuvchi";
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        const MINI_APP_URL = "https://koson-academy.vercel.app";
        const CHANNEL_URL = "https://t.me/davlat_20140106";

        const payload = {
          chat_id: chatId,
          text: `Assalomu alaykum, ${firstName}! 👋\n\n<b>L.uz</b> platformasiga xush kelibsiz. Davom etish uchun quyidagi tugmalardan foydalaning:`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Ochish",
                  web_app: { url: MINI_APP_URL }
                }
              ],
              [
                {
                  text: "Kanalga aʼzo boʻlish",
                  url: CHANNEL_URL
                }
              ]
            ]
          }
        };

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Webhook xatosi:", error);
      return res.status(200).json({ ok: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
