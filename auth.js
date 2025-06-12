export function initializeAuth() {
  window.Telegram.WebApp.ready();
  const user = Telegram.WebApp.initDataUnsafe.user;
  const userPhoto = document.getElementById('userPhoto');
  const userName = document.getElementById('userName');
  if (user?.photo_url) userPhoto.src = user.photo_url;
  userName.innerText = user?.username || user?.first_name || 'Foydalanuvchi';
}