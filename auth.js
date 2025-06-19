// auth.js
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Telegram orqali foydalanuvchini aniqlab, Firebase Auth bilan tizimga kiritadi.
 * @param {Function} callback - Auth muvaffaqiyatli bo‘lsa, foydalanuvchi obyektini oladi.
 */
export function handleAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      callback(user);
    } else {
      try {
        const tg = window.Telegram.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;

        if (!telegramUser || !telegramUser.id) {
          console.error("Telegram foydalanuvchi topilmadi.");
          alert("Iltimos, Telegram Mini App orqali sahifani oching.");
          return;
        }

        const email = telegramUser.id + "@telegramuser.com";
        const password = telegramUser.id + "_telegram";

        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          if (error.code === "auth/user-not-found") {
            await createUserWithEmailAndPassword(auth, email, password);
          } else {
            console.error("Kirishda xatolik:", error);
          }
        }
      } catch (err) {
        console.error("Telegram WebApp muammosi:", err);
      }
    }
  });
}