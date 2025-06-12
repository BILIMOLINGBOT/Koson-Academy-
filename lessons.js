export const lessons = [
  { id: 1, title: "To be affirmative" },
  // ...
];

export function renderLessons(containerId) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  lessons.forEach(lesson => {
    const btn = document.createElement('a');
    btn.href = `lesson${lesson.id}.html`;
    btn.className = 'button';
    btn.textContent = lesson.title;
    c.appendChild(btn);
  });
}