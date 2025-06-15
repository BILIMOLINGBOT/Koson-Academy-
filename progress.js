import { db, doc, getDoc, setDoc, updateDoc, arrayUnion } from './firebase.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

export async function setupProgress(userId) {
  const auth = getAuth();
  const completedLessons = new Set();

  const progressRef = doc(db, "progress", userId);

  async function initProgress() {
    try {
      const userSnap = await getDoc(progressRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (Array.isArray(data.lessons)) {
          data.lessons.forEach(id => completedLessons.add(id));
        }
      } else {
        await setDoc(progressRef, { lessons: [], score: 0, lessons_visited: [] });
      }
    } catch (error) {
      console.error("Ma'lumotlarni olishda xato:", error);
      showToast("Ma'lumotlarni yuklashda xato yuz berdi.");
    }
  }

  function updatePoints() {
    const points = completedLessons.size * 10;
    const scoreElement = document.getElementById('score-value');
    if (scoreElement) scoreElement.innerText = points;
  }

  function updateLessonAvailability() {
    const lessonButtons = document.querySelectorAll('.lesson-btn');
    const unlocked = Array.from(completedLessons).map(Number);
    const maxUnlocked = completedLessons.size > 0 ? Math.max(...unlocked) : 0;

    lessonButtons.forEach(button => {
      const lessonId = parseInt(button.dataset.lesson);
      button.classList.toggle('visited', completedLessons.has(lessonId.toString()));
      button.removeEventListener('click', showLockedMessage);
      if (lessonId <= maxUnlocked + 1) {
        button.classList.remove('locked');
      } else {
        button.classList.add('locked');
        button.addEventListener('click', showLockedMessage, { once: true });
      }
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#28a745';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }, 10);
  }

  function showLockedMessage(e) {
    e.preventDefault();
    showToast("Darslarni ketma-ket oʻrganish kerak!");
  }

  function updateProgressUI() {
    const totalLessons = document.querySelectorAll('.lesson-btn').length;
    const completedCount = completedLessons.size;
    const percent = (completedCount / totalLessons) * 100;
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) progressBar.style.width = percent + "%";
    updatePoints();
    updateLessonAvailability();
  }

  async function completeLesson(lessonId) {
    if (!completedLessons.has(lessonId)) {
      completedLessons.add(lessonId);
      const updatedScore = completedLessons.size * 10;

      try {
        await updateDoc(progressRef, {
          lessons: arrayUnion(lessonId),
          score: updatedScore,
          lessons_visited: arrayUnion({
            lesson: lessonId,
            visited: true,
            timestamp: new Date().toISOString()
          })
        });
        showToast(`Dars ${lessonId} muvaffaqiyatli tugallandi! +10 ball`);
      } catch (error) {
        console.error("Firestore-ga yozishda xato:", error);
        showToast("Xato yuz berdi, qayta urinib ko‘ring.");
      }

      updateProgressUI();
    }
  }

  // Dars tugmalari hodisalari
  document.querySelectorAll('.lesson-btn').forEach(button => {
    button.addEventListener('click', async function (e) {
      const lessonId = this.dataset.lesson;
      const required = (parseInt(lessonId) - 1).toString();

      if (parseInt(lessonId) > 1 && !completedLessons.has(required)) {
        e.preventDefault();
        showToast("Darslarni ketma-ket oʻrganish kerak!");
        return;
      }

      await completeLesson(lessonId);
    });
  });

  // Autentifikatsiyani tekshirish
  onAuthStateChanged(auth, async user => {
    if (user && user.uid === userId) {
      await initProgress();
      updateProgressUI();
    } else {
      showToast("Iltimos, tizimga kiring!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    }
  });
}