import { initializeApp } from "https://www.gstatic.com/firebase/app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebase/database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebase/storage.js";

// Sizning Firebase konfiguratsiyangiz
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

// Firebase'ni initsializatsiya qilish
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Boshqa fayllarda foydalanish uchun eksport qilish
export { db, storage, ref, set, onValue, get, storageRef, uploadBytes, getDownloadURL };
