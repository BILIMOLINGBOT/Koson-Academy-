// firebase.js

// Firebase SDK funksiyalarini import qilish
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase konfiguratsiyasi – sizning loyihangizga mos
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

// Auth, Firestore va Analytics xizmatlarini ulash
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Tashqariga eksport qilish
export { app, auth, db, analytics };