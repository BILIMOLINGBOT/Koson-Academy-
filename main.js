import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeAuth } from "./auth.js";
import { setupNavigation } from "./navigation.js";
import { setupProgress } from "./progress.js";

// Firebase konfiguratsiyasi
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
const db = getFirestore(app);

// Modul funksiyalarini ishga tushirish
initializeAuth();
setupNavigation();
setupProgress();
loadLessons();

// ✅ Darslarni yuklovchi funksiya
async function loadLessons() {
  const levels = ['a2', 'b1', 'b2'];
  const levelMap = {
    a2: 'lessons/a2-lessons.html',
    b1: 'lessons/b1-lessons.html',
    b2: 'lessons/b2-lessons.html',
  };

  for (const level of levels) {
    const container = document.getElementById(`${level}-level`);
    const url = levelMap[level];

    if (!container) continue;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fayl yuklanmadi: ${url}`);
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `<p class="error">Xatolik: ${error.message}</p>`;
    }
  }
}