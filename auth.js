export function initializeAuth() {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready(() => {
      const user = Telegram.WebApp.initDataUnsafe.user;
      const userPhoto = document.getElementById('userPhoto');
      const userName = document.getElementById('userName');
      const welcomeText = document.getElementById('welcome-text');

      // 👤 Foydalanuvchi rasmi
      if (user?.photo_url && userPhoto) {
        userPhoto.src = user.photo_url;
      }

      // 🧑 Foydalanuvchi nomi
      if (userName) {
        userName.innerText = user?.username || user?.first_name || 'Foydalanuvchi';
      }

      // 👋 Salomlashuv
      if (welcomeText) {
        welcomeText.innerText = user?.first_name
          ? `Salom, ${user.first_name}! Xush kelibsiz!`
          : 'Salom, xush kelibsiz!';

        welcomeText.style.display = 'block';

        // 4 soniyadan keyin salom matnini yashirish
        setTimeout(() => {
          welcomeText.style.display = 'none';
        }, 4000);
      }
    });
  } else {
    console.warn("Telegram WebApp mavjud emas");
  }
}