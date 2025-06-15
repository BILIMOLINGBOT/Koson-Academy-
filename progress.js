import { db, auth, doc, getDoc, setDoc, updateDoc } from './firebase.js';

export async function setupProgress(userId) {
  const completedLessons = new Set(["0"]); // Boshlang‘ich holat

  const progressRef = doc(db, "progress", userId);
  let userProgress = await getDoc(progressRef);

  if (userProgress.exists()) {
    const data = userProgress.data();
    if (Array.isArray(data.lessons)) {
      data.lessons.forEach(id => completedLessons.add(id));
    }
    updateProgressUI();
  } else {
    await setDoc(progressRef, { lessons: ["0"], score: 0 });
  }

  function updatePoints() {
    const points = (completedLessons.size - 1) * 10;
    document.getElementById('score-value').innerText = points;
  }

  function updateLessonAvailability() {
    const lessonButtons = document.querySelectorAll('.lesson-btn');
    lessonButtons.forEach(button => {
      const lessonId = button.dataset.lesson;
      if (!completedLessons.has(lessonId)) {
        button.classList.add('locked');
        button.addEventListener('click', showLockedMessage);
      } else {
        button.classList.remove('locked');
        button.removeEventListener('click', showLockedMessage);
      }
    });
  }

  function showLockedMessage(e) {
    e.preventDefault();
    alert("Darslarni ketma-ket oʻrganish kerak");
  }

  function updateProgressUI() {
    const totalLessons = document.querySelectorAll('.lesson-btn').length;
    const completedCount = completedLessons.size - 1;
    const percent = (completedCount / totalLessons) * 100;
    document.getElementById("progress-bar").style.width = percent + "%";
    updatePoints();
    updateLessonAvailability();
  }

  async function completeLesson(lessonId) {
    if (!completedLessons.has(lessonId)) {
      completedLessons.add(lessonId);
      const updatedLessons = Array.from(completedLessons);
      const updatedScore = (completedLessons.size - 1) * 10;

      await updateDoc(progressRef, {
        lessons: updatedLessons,
        score: updatedScore,
      });

      updateProgressUI();
    }
  }

  document.querySelectorAll('.lesson-btn').forEach(button => {
    button.addEventListener('click', async function (e) {
      const lessonId = this.dataset.lesson;
      const numId = parseInt(lessonId);
      const required = (numId - 1).toString();

      if (!completedLessons.has(required)) {
        e.preventDefault();
        alert("Darslarni ketma-ket oʻrganish kerak");
        return;
      }

      await completeLesson(lessonId);
    });
  });

  updateProgressUI();
}