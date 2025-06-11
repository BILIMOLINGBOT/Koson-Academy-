import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function initAuth(db) {
  const auth = getAuth();
  const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
  let userId = telegramUser?.id?.toString() || 'anonymous';

  try {
    if (!telegramUser) {
      const anonymousUser = await signInAnonymously(auth);
      userId = anonymousUser.user.uid;
    }

    // Telegram initData server tomonida tekshirish (Node.js serverida)
    const response = await fetch('/api/verify-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(window.Telegram.WebApp.initData)
    });
    if (!response.ok) throw new Error('Telegram autentifikatsiyasi muvaffaqiyatsiz');

    // Foydalanuvchi ma'lumotlarini Firestore'da saqlash
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    if (!userSnap.exists()) {
      await setDoc(userDoc, {
        username: telegramUser?.username || telegramUser?.first_name || 'Foydalanuvchi',
        photo_url: telegramUser?.photo_url || '/assets/images/default-user.png',
        completedLessons: [],
        points: 0,
        lastActive: new Date().toISOString(),
        language: telegramUser?.language_code || 'uz'
      });
    }

    // UI'ni yangilash
    const userData = (await getDoc(userDoc)).data();
    document.getElementById('userPhoto').src = userData.photo_url;
    document.getElementById('userName').innerText = userData.username;
  } catch (error) {
    console.error('Autentifikatsiya xatosi:', error);
    window.Telegram.WebApp.showAlert('Autentifikatsiya xatosi yuz berdi.');
  }
}