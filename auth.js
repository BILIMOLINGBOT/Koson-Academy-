// auth.js
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export function handleAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      callback(user);
    } else {
      const tg = window.Telegram.WebApp;
      const telegramUser = tg.initDataUnsafe.user;
      const email = telegramUser.id + "@telegramuser.com";
      const password = telegramUser.id + "_telegram";

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      }
    }
  });
}