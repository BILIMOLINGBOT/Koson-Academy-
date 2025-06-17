import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, getDoc, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

initializeAuth();
setupNavigation();
setupProgress();
loadLessons(db);

// Ballar (score) ni yuklash va ko‘rsatish
window.addEventListener("DOMContentLoaded", () => {
  const userPointsElement = document.getElementById("userPoints");

  // LocalStorage tekshirish
  const localScore = localStorage.getItem("toBePositiveScore");
  if (localScore !== null && userPointsElement) {
    userPointsElement.textContent = localScore;
  }

  // Firebase'dan olish
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);

      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const score = userSnap.data().score || 0;
          userPointsElement.textContent = score;
          localStorage.setItem("toBePositiveScore", score); // cache
        } else {
          // Yangi foydalanuvchi, Firestore'da hujjat yarating
          await setDoc(userRef, { score: 0 });
          userPointsElement.textContent = 0;
        }
      } catch (err) {
        console.error("Ballar yuklashda xatolik:", err);
      }
    }
  });
});