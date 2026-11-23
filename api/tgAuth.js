
const crypto = require("crypto");
const admin = require("firebase-admin");

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  return admin;
}

function verifyTelegramData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");

  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
    return null;
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
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
    .digest();

  const expectedHash = Buffer.from(receivedHash, "hex");

  if (!crypto.timingSafeEqual(calculatedHash, expectedHash)) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));

  if (
    !Number.isFinite(authDate) ||
    authDate > Math.floor(Date.now() / 1000) + 60 ||
    Math.floor(Date.now() / 1000) - authDate > 86400
  ) {
    return null;
  }

  try {
    const user = JSON.parse(params.get("user") || "{}");

    if (!user.id) return null;

    return user;
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken || !process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(500).json({
        error: "Server configuration missing"
      });
    }

    const { initData } = req.body || {};

    if (typeof initData !== "string" || !initData) {
      return res.status(400).json({
        error: "initData required"
      });
    }

    const telegramUser = verifyTelegramData(
      initData,
      botToken
    );

    if (!telegramUser) {
      return res.status(401).json({
        error: "Telegram verification failed"
      });
    }

    const firebase = getFirebaseAdmin();

    const uid = `tg_${telegramUser.id}`;

    const customToken = await firebase
      .auth()
      .createCustomToken(uid, {
        telegramId: String(telegramUser.id)
      });

    return res.status(200).json({
      success: true,
      token: customToken,
      uid
    });

  } catch (error) {
    console.error("tgAuth error:", error.message);

    return res.status(500).json({
      error: "Authentication failed"
    });
  }
};
