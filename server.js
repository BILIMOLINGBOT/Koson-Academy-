require("dotenv").config(); // .env faylni o‘qish uchun

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

BOT_TOKEN=8194936404:AAFgb5tbdL7IOY5fNotRPkN0bgBFJAw3elc
CHANNEL_USERNAME=@KosonAcademy

app.use(cors());
app.use(express.static("public")); // "public" papkada frontend fayllar bo‘ladi

// Aʼzolikni tekshirish endpoint
app.get("/check-membership", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: "user_id kerak" });
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`;
    const telegramRes = await fetch(url);
    const data = await telegramRes.json();

    if (data.ok) {
      const status = data.result.status;
      res.json({ status }); // member, administrator, creator
    } else {
      res.json({ status: "not_member" });
    }
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Xatolik yuz berdi." });
  }
});

// Serverni ishga tushurish
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Server ishlayapti: " + listener.address().port);
});