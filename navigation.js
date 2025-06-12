export function setupNavigation() {
  // Section navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const target = item.getAttribute('data-target');
      document.getElementById(target).classList.add('active');
    });
  });

  // Level tabs
  document.querySelectorAll('.level-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.level-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.level-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const level = tab.getAttribute('data-level');
      document.getElementById(`${level}-level`).classList.add('active');
    });
  });
}