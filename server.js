const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

// .env dan token va kanal nomini olish
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;

app.use(cors());
app.use(express.static("public"));

app.get("/check-membership", async (req, res) => {
  const userId = req.query.user_id;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`;
    const telegramRes = await fetch(url);
    const data = await telegramRes.json();

    if (data.ok) {
      const status = data.result.status;
      res.json({ status });
    } else {
      res.json({ status: "not_member" });
    }
  } catch (e) {
    console.error("Xatolik:", e);
    res.status(500).json({ error: "Xatolik yuz berdi." });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Server ishlayapti " + listener.address().port);
});