export function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const target = item.getAttribute('data-target');
      document.getElementById(target).classList.add('active');
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    });
  });

  // Telegram orqaga qaytish tugmasi
  window.Telegram.WebApp.BackButton.show();
  window.Telegram.WebApp.BackButton.onClick(() => {
    window.history.back();
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  });
}