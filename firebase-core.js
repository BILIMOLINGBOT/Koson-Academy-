// firebase-core.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// 1. Firebase konfiguratsiyasi (O'zingizning Firebase loyihangiz qiymatlarini qo'ying)

const firebaseConfig = {
  apiKey: "AIzaSyD0gBUJNcrgvvntcrfKK7Ky8t6_9Qb96Io",
  authDomain: "bilimilova-64833.firebaseapp.com",
  databaseURL: "https://bilimilova-64833-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bilimilova-64833",
  storageBucket: "bilimilova-64833.firebasestorage.app",
  messagingSenderId: "890689414502",
  appId: "1:890689414502:web:8141d7aab413495c0c14a7",
  measurementId: "G-ZBC8X1VVMZ"
};


const AUTH_API_URL = "/api/auth"; // Vercel Custom Token endpoint

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 2. Telegram WebApp ishga tushirish va Dark Mode (#000000)
export const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#000000");
  tg.setBackgroundColor("#000000");
}

// Joriy Telegram foydalanuvchisini olish (brauzerda test uchun fallback bilan)
export function getCurrentTgUser() {
  const user = tg?.initDataUnsafe?.user;
  if (user && user.id) {
    return {
      tgId: String(user.id),
      firstName: user.first_name || "Foydalanuvchi",
      lastName: user.last_name || "",
      username: (user.username || "").toLowerCase(),
      photoUrl: user.photo_url || ""
    };
  }
  return null;
}

// 3. Yagona Avtorizatsiya (Timeout himoyasi bilan)
let authPromise = null;

export function ensureAuth() {
  if (authPromise) return authPromise;

  authPromise = (async () => {
    const tgUser = getCurrentTgUser();
    if (!tgUser) {
      console.warn("Telegram initData topilmadi. Anonim rejimda ulanilmoqda.");
      await signInAnonymously(auth);
      return null;
    }

    try {
      // 6 soniyalik timeout bilan Vercel serverless orqali Custom Token olish
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          await signInWithCustomToken(auth, data.token);
        }
      } else if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.error("Auth server xatosi, zaxira ulanish ishga tushdi:", err.message);
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    }

    await syncCurrentUser(tgUser);
    return tgUser;
  })();

  return authPromise;
}

// 4. Foydalanuvchi profilini 'users/{tgId}' bilan avtomatik sinxronlash
async function syncCurrentUser(tgUser) {
  const userRef = doc(db, "users", tgUser.tgId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      tgId: tgUser.tgId,
      firstName: tgUser.firstName,
      lastName: tgUser.lastName,
      username: tgUser.username,
      photoUrl: tgUser.photoUrl,
      bio: "",
      isVerified: false,
      isAdmin: false,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else {
    // Faqat Telegramdan keladigan asosiy ma'lumotlarni yangilash
    await updateDoc(userRef, {
      firstName: tgUser.firstName,
      lastName: tgUser.lastName,
      username: tgUser.username,
      ...(tgUser.photoUrl ? { photoUrl: tgUser.photoUrl } : {}),
      updatedAt: serverTimestamp()
    });
  }
}

// 5. Umumiy Harakatlar (Like, Save, View, Notification)
export async function toggleLike(postId, postAuthorId, previewText = "") {
  const me = getCurrentTgUser();
  if (!me) return false;

  const likeId = `${postId}_${me.tgId}`;
  const likeRef = doc(db, "likes", likeId);
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(likeRef);

  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likesCount: increment(-1) });
    return false;
  } else {
    await setDoc(likeRef, {
      postId,
      userId: me.tgId,
      createdAt: serverTimestamp()
    });
    await updateDoc(postRef, { likesCount: increment(1) });

    if (postAuthorId && postAuthorId !== me.tgId) {
      await addDoc(collection(db, "luz_notifications"), {
        toUserId: String(postAuthorId),
        fromUserId: me.tgId,
        fromName: me.firstName,
        fromPhoto: me.photoUrl,
        type: "like",
        postId,
        previewText: previewText.slice(0, 60),
        isRead: false,
        createdAt: serverTimestamp()
      });
    }
    return true;
  }
}

export async function toggleSave(postId) {
  const me = getCurrentTgUser();
  if (!me) return false;

  const saveId = `${postId}_${me.tgId}`;
  const saveRef = doc(db, "saves", saveId);
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(saveRef);

  if (snap.exists()) {
    await deleteDoc(saveRef);
    await updateDoc(postRef, { savesCount: increment(-1) });
    return false;
  } else {
    await setDoc(saveRef, {
      postId,
      userId: me.tgId,
      createdAt: serverTimestamp()
    });
    await updateDoc(postRef, { savesCount: increment(1) });
    return true;
  }
}

export async function recordUniqueView(postId) {
  const me = getCurrentTgUser();
  if (!me) return;

  const viewId = `${postId}_${me.tgId}`;
  const viewRef = doc(db, "views", viewId);
  const snap = await getDoc(viewRef);

  if (!snap.exists()) {
    await setDoc(viewRef, {
      postId,
      userId: me.tgId,
      createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, "posts", postId), {
      viewsCount: increment(1)
    });
  }
}

// 6. Yordamchi funksiyalar (Vaqt formati va XSS himoyasi)
export function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatTimeAgo(ts) {
  if (!ts) return "Hozirgina";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) return "Hozirgina";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} daq`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} soat`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} kun`;
  return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });
}
