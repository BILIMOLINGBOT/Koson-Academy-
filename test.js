// Firebase import va init allaqachon qilingan deb hisoblaymiz
import { getFirestore, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();
const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe.user;

const userId = user?.id?.toString();

async function saveTestScore(score) {
  if (!userId) return;

  const userRef = doc(db, "users", userId);
  await signInAnonymously(auth);

  await updateDoc(userRef, {
    score: increment(score),
    lastTest: "To Be Positive",
    lastScore: score,
    lastUpdated: new Date()
  });
}