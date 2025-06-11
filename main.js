import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { initLessons } from './lessons.js';
import { initProgress } from './progress.js';
import { initLanguage } from './i18n.js';

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase'ni ishga tushirish
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initAuth(db);
    initNavigation();
    await initLessons(db);
    await initProgress(db);
    await initLanguage(db);
  } catch (error) {
    console.error('Ilovani ishga tushirishda xato:', error);
    window.Telegram.WebApp.showAlert('Ilova yuklanishida xatolik yuz berdi.');
  }
});