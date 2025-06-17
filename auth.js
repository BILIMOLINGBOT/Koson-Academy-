import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function initializeAuth() {
  window.Telegram.WebApp.ready();
  const user = Telegram.WebApp.initDataUnsafe.user;

  const userPhoto = document.getElementById('userPhoto');
  const userName = document.getElementById('userName');

  if (user?.photo_url) userPhoto.src = user.photo_url;
  userName.innerText = user?.username || user?.first_name || 'Foydalanuvchi';

  const auth = getAuth();
  signInAnonymously(auth)
    .then(() => {
      console.log("Firebase: Anonim kirish muvaffaqiyatli");
    })
    .catch((error) => {
      console.error("Firebase Auth xatosi:", error);
    });
}