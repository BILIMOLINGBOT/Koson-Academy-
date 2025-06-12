import { initUser, userData } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await initUser();

  document.getElementById('userName').textContent = user.name;
  document.getElementById('userPhoto').src = user.photo || 'default.jpg';
  document.getElementById('userPhoto').onerror = () => {
    document.getElementById('userPhoto').src = 'default.jpg';
  };
});