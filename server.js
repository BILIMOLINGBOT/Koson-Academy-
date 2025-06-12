import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// .env faylni o‘qish
dotenv.config();

// Fayl yo‘llarini aniqlash
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express ilovasini yaratish
const app = express();
const PORT = process.env.PORT || 3000;

// JSON body parser
app.use(express.json());

// Statik fayllar (public papkadan xizmat ko‘rsatish)
app.use(express.static(path.join(__dirname, 'public')));

// Telegram foydalanuvchi ma’lumotlarini qabul qilish
app.post('/api/user', (req, res) => {
  const { id, name, username, photo } = req.body;

  console.log('📩 Telegram foydalanuvchisi:');
  console.log(`🆔 ID: ${id}`);
  console.log(`👤 Ismi: ${name}`);
  console.log(`🔗 Username: @${username}`);
  console.log(`🖼️ Profil rasmi: ${photo}`);

  res.status(200).json({ message: 'Foydalanuvchi maʼlumotlari qabul qilindi.' });
});

// 404 - Topilmagan sahifa uchun
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Serverni ishga tushurish
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});