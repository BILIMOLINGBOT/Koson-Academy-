export function setupProgress() {
  const completedLessons = new Set();
  completedLessons.add("0"); // No lesson is completed initially

  const updatePoints = () => {
    const completedCount = completedLessons.size - 1;
    const points = completedCount * 10;
    document.getElementById('userPoints').innerText = `Ballar: ${points}`;
  };

  const updateLessonAvailability = () => {
    const lessonButtons = document.querySelectorAll('.level-content.active .button');
    lessonButtons.forEach(button => {
      const requiredLessonId = button.getAttribute('data-required');
      if (requiredLessonId && !completedLessons.has(requiredLessonId)) {
        button.classList.add('closed');
        button.addEventListener('click', showClosedLessonMessage);
      } else {
        button.classList.remove('closed');
        button.removeEventListener('click', showClosedLessonMessage);
      }
    });
    updateProgress();
  };

  const showClosedLessonMessage = (event) => {
    event.preventDefault();
    alert("Darslarni ketma-ket oʻrganish kerak");
  };

  const markLessonAsComplete = (lessonId) => {
    completedLessons.add(lessonId);
    updateLessonAvailability();
  };

  const updateProgress = () => {
    const allLessonsInCurrentLevel = document.querySelectorAll('.level-content.active .button').length;
    const unlockedLessonsInCurrentLevel = document.querySelectorAll('.level-content.active .button:not(.closed)').length;
    const completedCount = completedLessons.size - 1;
    const totalLessons = 36;
    document.getElementById('completedLessonsCount').innerText = `Yakunlangan darslar: ${completedCount} / ${totalLessons}`;
    const progressPercentage = (completedCount / totalLessons) * 100;
    document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
    updatePoints();
  };

  // Simulate completing lessons for demonstration
  setTimeout(() => markLessonAsComplete("1"), 1000);
  setTimeout(() => markLessonAsComplete("2"), 2000);
  setTimeout(() => markLessonAsComplete("3"), 3000);
  setTimeout(() => markLessonAsComplete("4"), 4000);
  setTimeout(() => markLessonAsComplete("5"), 5000);
  setTimeout(() => markLessonAsComplete("6"), 6000);

  // Initial calls
  updateLessonAvailability();
  updatePoints();
}