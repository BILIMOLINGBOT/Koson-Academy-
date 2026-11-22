
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("L.uz Bot Webhook faol!");
  }

  const { message } = req.body || {};

  if (message?.text?.startsWith("/start")) {
    const chatId = message.chat.id;
    const firstName = message.from?.first_name || "Foydalanuvchi";

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const MINI_APP_URL = "https://koson-academy.vercel.app";
    const CHANNEL_URL = "https://t.me/davlat_20140106";
    const SUPPORT_URL = "https://t.me/Sanhkjg";

    const payload = {
      chat_id: chatId,
      text:
        `Assalomu alaykum, ${firstName}! 👋\n\n` +
        `*L.uz* platformasiga xush kelibsiz!\n\n` +
        `L.uz — foydalanuvchilarga o‘z fikrlarini erkin ifoda etish, matnli postlar yozish, rasm va videolar joylashtirish imkonini beruvchi ijtimoiy platforma.\n\n` +
        `Platformadan foydalanishni boshlash uchun quyidagi tugmani bosing:`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Ochish",
              web_app: { url: MINI_APP_URL }
            }
          ],
          [
            {
              text: "📢 Kanalga aʼzo boʻlish",
              url: CHANNEL_URL
            }
          ],
          [
            {
              text: "💬 Yordam",
              url: SUPPORT_URL
            }
          ]
        ]
      }
    };

    try {
      if (!BOT_TOKEN) {
        throw new Error("TELEGRAM_BOT_TOKEN sozlanmagan");
      }

      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!result.ok) {
        console.error("Telegram API xatosi:", result);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    }
  }

  return res.status(200).json({ ok: true });
}
