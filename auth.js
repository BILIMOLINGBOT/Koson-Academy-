

import { auth } from './firebase.js';

import {
  onAuthStateChanged,
  signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase dastlabki sessiyasini tekshirish
const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

let loginPromise = null;

// Firebase autentifikatsiyasini ta'minlash
export async function ensureAuth() {
  await authReady;

  // Mavjud sessiya bo'lsa, qayta login shart emas
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // Takroriy login so'rovlarini bloklash
  if (loginPromise) {
    return loginPromise;
  }

  loginPromise = (async () => {
    const tg = window.Telegram?.WebApp;

    if (!tg || !tg.initData) {
      throw new Error("Telegram Mini App orqali oching.");
    }

    tg.ready();

    const response = await fetch("/api/auth", {
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
      throw new Error(
        data.error || "Autentifikatsiya xatosi"
      );
    }

    const credential = await signInWithCustomToken(
      auth,
      data.token
    );

    return credential.user;
  })();

  try {
    return await loginPromise;
  } finally {
    loginPromise = null;
  }
}

// Eski handleAuth funksiyasi bilan moslik
export function handleAuth(callback) {
  return ensureAuth()
    .then((user) => {
      callback(user);
      return user;
    })
    .catch((error) => {
      console.error("Auth xatosi:", error);

      alert(
        error.message ||
        "Tizimga kirishda xatolik yuz berdi."
      );

      throw error;
    });
}
