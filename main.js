import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeAuth } from "./auth.js";
import { setupNavigation } from "./navigation.js";
import { setupProgress } from "./progress.js";
import { loadLessons } from "./lessons.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize modules
initializeAuth();
setupNavigation();
setupProgress();
loadLessons(db);

// Ballar (score) ni ekranga chiqarish (Firestore yoki localStorage orqali)
window.addEventListener("DOMContentLoaded", () => {
  const userPointsElement = document.getElementById("userPoints");

  // 1) Avval localStorage'dan tekshirib ko‘ramiz
  const localScore = localStorage.getItem("toBePositiveScore");
  if (localScore !== null && userPointsElement) {
    userPointsElement.textContent = localScore;
  }

  // 2) Agar foydalanuvchi Firebase orqali login bo‘lgan bo‘lsa, Firestore'dan ham olib yangilaymiz
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const score = data.score || 0;
          if (userPointsElement) {
            userPointsElement.textContent = score;
          }
        }
      } catch (err) {
        console.error("Ballar yuklashda xatolik:", err);
      }
    }
  });
});