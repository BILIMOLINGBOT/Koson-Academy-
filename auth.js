
import { auth } from './firebase.js';

import {
  onAuthStateChanged,
  signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let loginStarted = false;

export function handleAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      callback(user);
      return;
    }

    if (loginStarted) return;
    loginStarted = true;

    try {
      const tg = window.Telegram?.WebApp;

      if (!tg || !tg.initData) {
        throw new Error("Telegram Mini App orqali oching.");
      }

      tg.ready();

      const response = await fetch("/api/tgAuth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initData: tg.initData
        })
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.error || "Autentifikatsiya xatosi");
      }

      await signInWithCustomToken(auth, data.token);

    } catch (error) {
      console.error("Auth xatosi:", error);
      alert(error.message || "Tizimga kirishda xatolik yuz berdi.");
      loginStarted = false;
    }
  });
}
