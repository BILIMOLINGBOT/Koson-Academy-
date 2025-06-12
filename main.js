import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

// Initialize modules
initializeAuth();
setupNavigation();
setupProgress();
loadLessons(db);

import { loadA1Lessons } from './lessons.js';

document.addEventListener('DOMContentLoaded', () => {
  loadA1Lessons();
});