export function loadA1Lessons() {
  fetch('a1d.html')
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('lessonContainerForLessonsPage');
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('A1 darslar yuklanmadi:', error);
      const container = document.getElementById('lessonContainerForLessonsPage');
      container.innerHTML = '<p>Xatolik yuz berdi. Darslar yuklanmadi.</p>';
    });
}