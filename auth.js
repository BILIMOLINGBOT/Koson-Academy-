import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

const firebaseConfig = { /* sizning config */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Telegram auth
window.Telegram.WebApp.ready();
const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
const telegramId = tgUser.id;
const profileRef = ref(db, `users/${telegramId}`);

export async function initUser() {
  const snapshot = await get(profileRef);
  if (!snapshot.exists()) {
    await set(profileRef, {
      id: telegramId,
      name: tgUser.username || tgUser.first_name,
      photo: tgUser.photo_url || '',
      points: 0,
      completedLessons: []
    });
  }
  const data = (await get(profileRef)).val();
  return data;
}

export async function updatePoints(points) {
  await update(profileRef, { points });
}

export async function updateCompletedLessons(list) {
  await update(profileRef, { completedLessons: list });
}