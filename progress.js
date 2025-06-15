// progress.js import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; import { getAuth, onAuthStateChanged } from "firebase/auth"; import { initializeApp } from "firebase/app";

const firebaseConfig = { apiKey: "AIzaSyD0gBUJNcrgvvntcrfKK7Ky8t6_9Qb96Io", authDomain: "bilimilova-64833.firebaseapp.com", databaseURL: "https://bilimilova-64833-default-rtdb.europe-west1.firebasedatabase.app", projectId: "bilimilova-64833", storageBucket: "bilimilova-64833.appspot.com", messagingSenderId: "890689414502", appId: "1:890689414502:web:8141d7aab413495c0c14a7", measurementId: "G-ZBC8X1VVMZ" };

const app = initializeApp(firebaseConfig); const db = getFirestore(app); const auth = getAuth(app);

export function setupProgress() { const completedLessons = new Set(); let userId = null;

const updatePoints = () => { const points = (completedLessons.size - 1) * 10; const scoreElement = document.getElementById('userPoints'); if (scoreElement) scoreElement.innerText = Ballar: ${points}; if (userId) updateUserProgressInFirestore(Array.from(completedLessons), points); };

const updateLessonAvailability = () => { const lessonButtons = document.querySelectorAll('.level-content.active .button'); lessonButtons.forEach(button => { const requiredLessonId = button.getAttribute('data-required'); if (requiredLessonId && !completedLessons.has(requiredLessonId)) { button.classList.add('closed'); button.addEventListener('click', showClosedLessonMessage); } else { button.classList.remove('closed'); button.removeEventListener('click', showClosedLessonMessage); } }); updateProgress(); };

const showClosedLessonMessage = (event) => { event.preventDefault(); alert("Darslarni ketma-ket oʻrganish kerak"); };

const markLessonAsComplete = (lessonId) => { completedLessons.add(lessonId); updateLessonAvailability(); };

const updateProgress = () => { const completedCount = completedLessons.size - 1; const totalLessons = 36; const countElement = document.getElementById('completedLessonsCount'); if (countElement) countElement.innerText = Yakunlangan darslar: ${completedCount} / ${totalLessons}; const progressBar = document.querySelector('.progress-fill'); if (progressBar) progressBar.style.width = ${(completedCount / totalLessons) * 100}%; updatePoints(); };

const loadUserProgressFromFirestore = async (uid) => { const userRef = doc(db, "users", uid); const docSnap = await getDoc(userRef); if (docSnap.exists()) { const data = docSnap.data(); (data.completedLessons || []).forEach(id => completedLessons.add(id)); updateLessonAvailability(); updatePoints(); } else { completedLessons.add("0"); await setDoc(userRef, { completedLessons: ["0"], points: 0 }); } };

const updateUserProgressInFirestore = async (lessonsArray, points) => { const userRef = doc(db, "users", userId); await updateDoc(userRef, { completedLessons: lessonsArray, points: points }); };

onAuthStateChanged(auth, (user) => { if (user) { userId = user.uid; loadUserProgressFromFirestore(userId); } }); }

