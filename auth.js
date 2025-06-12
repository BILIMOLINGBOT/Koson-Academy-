// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// Firebase config (sizning konfiguratsiyangiz)
const firebaseConfig = {
  apiKey: "AIzaSyD0gBUJNcrgvvntcrfKK7Ky8t6_9Qb96Io",
  authDomain: "bilimilova-64833.firebaseapp.com",
  databaseURL: "https://bilimilova-64833-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bilimilova-64833",
  storageBucket: "bilimilova-64833.appspot.com",
  messagingSenderId: "890689414502",
  appId: "1:890689414502:web:8141d7aab413495c0c14a7",
  measurementId: "G-ZBC8X1VVMZ"
};

// Firebase ilovasini ishga tushirish
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Telegram WebApp tayyor
window.Telegram.WebApp.ready();

// Foydalanuvchi ma’lumotlari
const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
export const telegramId = tgUser?.id || null;
export const userData = {
  id: telegramId,
  name: tgUser?.username || tgUser?.first_name || 'Foydalanuvchi',
  photo: tgUser?.photo_url || 'default.jpg'
};

const profileRef = ref(db, `users/${telegramId}`);

// Foydalanuvchini tekshirish yoki yaratish
export async function initUser() {
  if (!telegramId) return null;

  const snapshot = await get(profileRef);
  if (!snapshot.exists()) {
    await set(profileRef, {
      ...userData,
      points: 0,
      completedLessons: []
    });
  }
  const data = (await get(profileRef)).val();
  return data;
}

// Ballarni yangilash
export async function updatePoints(points) {
  if (!telegramId) return;
  await update(profileRef, { points });
}

// Tugallangan darslarni yangilash
export async function updateCompletedLessons(list) {
  if (!telegramId) return;
  await update(profileRef, { completedLessons: list });
}