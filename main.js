import { initUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await initUser();

  document.getElementById('userName').textContent = user.name;
  document.getElementById('userPoints').textContent = `Ballar: ${user.points || 0}`;
  const userPhoto = document.getElementById('userPhoto');
  userPhoto.src = user.photo || 'default.jpg';
  userPhoto.onerror = () => {
    userPhoto.src = 'default.jpg';
  };
});