import { getFirestore, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

export async function addPoints(points) {
  const user = auth.currentUser;
  if (!user) {
    console.warn("Foydalanuvchi aniqlanmagan");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    // Ballarni Firestore'da yangilash
    await updateDoc(userRef, {
      score: increment(points),
    });

    // Ekrandagi ballni ham yangilash
    const userPointsElement = document.getElementById("userPoints");
    if (userPointsElement) {
      const current = parseInt(userPointsElement.textContent || "0");
      const newTotal = current + points;
      userPointsElement.textContent = newTotal;
      localStorage.setItem("toBePositiveScore", newTotal);
    }

    console.log(`${points} ball qo‘shildi`);
  } catch (err) {
    console.error("Ball qo‘shishda xatolik:", err);
  }
}