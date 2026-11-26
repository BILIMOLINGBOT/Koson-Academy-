const crypto = require("crypto");
const admin = require("firebase-admin");

// Firebase Admin SDK ni faqat bir marta ishga tushirish
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel Environment Variables dagi \n belgilarini haqiqiy yangi qatorga o'girish
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

// Telegram WebApp initData haqiqiyligini HMAC-SHA256 orqali tekshirish
function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  // Parametrlarni alifbo tartibida saralab data_check_string tuzish
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const hashBuffer = Buffer.from(hash, "hex");
  const calcBuffer = Buffer.from(calculatedHash, "hex");

  if (
    hashBuffer.length !== calcBuffer.length ||
    !crypto.timingSafeEqual(hashBuffer, calcBuffer)
  ) {
    return null;
  }

  // Eskirgan sessiyalarni bloklash (24 soatdan oshgan initData qabul qilinmaydi)
  const authDate = Number(params.get("auth_date") || 0);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!authDate || nowSeconds - authDate > 86400) {
    return null;
  }

  const userRaw = params.get("user");
  if (!userRaw) return null;

  return JSON.parse(userRaw);
}

module.exports = async function handler(req, res) {
  // CORS sozlamalari
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi" });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN sozlanmagan" });
    }

    const { initData } = req.body || {};
    if (!initData || typeof initData !== "string") {
      return res.status(400).json({ error: "initData yuborilmadi" });
    }

    const tgUser = verifyTelegramInitData(initData, botToken);
    if (!tgUser || !tgUser.id) {
      return res.status(401).json({ error: "Telegram imzosi yaroqsiz yoki eskirgan" });
    }

    // Firestore Security Rules bilan mos tushishi uchun uid = String(tgUser.id)
    const uid = String(tgUser.id);

    const customToken = await admin.auth().createCustomToken(uid, {
      tgId: uid,
      username: (tgUser.username || "").toLowerCase()
    });

    return res.status(200).json({
      token: customToken,
      uid
    });
  } catch (error) {
    console.error("Auth endpoint xatosi:", error);
    return res.status(500).json({
      error: "Serverda token yaratishda xatolik yuz berdi",
      details: error.message
    });
  }
};
