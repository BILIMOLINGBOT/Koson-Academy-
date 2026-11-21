export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    // Foydalanuvchi /start bosganini tekshirish
    if (message && message.text === '/start') {
      const chatId = message.chat.id;
      const firstName = message.from.first_name || "Foydalanuvchi";
      const BOT_TOKEN = process.env.BOT_TOKEN;

      // Mini App va Kanal havolalari
      const MINI_APP_URL = "https://SIZNING-VERCEL-DOMENINGIZ.vercel.app"; // L.uz Mini App manzili
      const CHANNEL_URL = "https://t.me/SIZNING_KANALINGIZ"; // L.uz Telegram kanali

      const payload = {
        chat_id: chatId,
        text: `Assalomu alaykum, ${firstName}! 👋\n\n**L.uz** platformasiga xush kelibsiz. Davom etish uchun quyidagi tugmalardan foydalaning:`,
        parse_mode: "Markdown",
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

      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error("Xabar yuborishda xatolik:", error);
      }
    }

    // Telegram serveriga javob qaytarish (qayta-qayta yubormasligi uchun shart)
    return res.status(200).json({ ok: true });
  }

  return res.status(200).send('L.uz Bot Webhook faol!');
}
