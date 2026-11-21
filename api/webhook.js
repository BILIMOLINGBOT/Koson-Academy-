
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Webhook holatini tekshirish
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "U Bot Webhook faol!"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN topilmadi");
    }

    // Telegram webhook xavfsizligini tekshirish
    if (
      WEBHOOK_SECRET &&
      req.headers["x-telegram-bot-api-secret-token"] !== WEBHOOK_SECRET
    ) {
      return res.status(403).json({
        ok: false,
        message: "Invalid webhook secret"
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const message = body.message;

    // Faqat /start buyrug'ini qabul qilish
    if (
      !message ||
      !message.text ||
      !/^\/start(?:@\w+)?(?:\s|$)/.test(message.text)
    ) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const firstName =
      message.from?.first_name || "Foydalanuvchi";

    const MINI_APP_URL = "https://koson-academy.vercel.app";
    const CHANNEL_URL = "https://t.me/davlat_20140106";
    const SUPPORT_URL = "https://t.me/Okkkkklllla";

    const BANNER_PHOTO_ID =
      "AgACAgIAAxkBAAEkyxhrAUoHERIxphG9D9dVnFl5yHJeZgAC-BxrGz3aCEgYdeJw6-hR2AEAAwIAA3kAAz0E";

    const payload = {
      chat_id: chatId,
      photo: BANNER_PHOTO_ID,
      caption:
        `Assalomu alaykum, ${firstName}! 👋\n\n` +
        `<b>U</b> — foydalanuvchilarga oʻz fikrlarini erkin ifoda etish, ` +
        `matnli postlar yozish, rasm va videolar joylashtirish imkonini ` +
        `beruvchi ijtimoiy platforma.`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Ochish",
              web_app: {
                url: MINI_APP_URL
              }
            }
          ],
          [
            {
              text: "Kanalga aʼzo boʻlish",
              url: CHANNEL_URL
            },
            {
              text: "Yordam",
              url: SUPPORT_URL
            }
          ]
        ]
      }
    };

    // Telegram API ga xabar yuborish
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram API xatosi:", result);

      return res.status(500).json({
        ok: false,
        error: result.description || "Telegram xatosi"
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Xabar muvaffaqiyatli yuborildi"
    });

  } catch (error) {
    console.error("Webhook xatosi:", error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
