export function initializeAuth() {
  try {
    if (!window.Telegram?.WebApp) {
      console.warn('Telegram Web App not detected');
      document.getElementById('userPhoto').src = 'default.jpg';
      document.getElementById('userName').innerText = 'Foydalanuvchi';
      return;
    }
    window.Telegram.WebApp.ready();
    const user = Telegram.WebApp.initDataUnsafe.user;
    const userPhoto = document.getElementById('userPhoto');
    const userName = document.getElementById('userName');
    console.log('User data:', user);
    userPhoto.src = user?.photo_url || 'default.jpg';
    userName.innerText = user?.username || user?.first_name || 'Foydalanuvchi';
  } catch (error) {
    console.error('Auth error:', error);
    document.getElementById('userPhoto').src = 'default.jpg';
    document.getElementById('userName').innerText = 'Foydalanuvchi';
  }
}