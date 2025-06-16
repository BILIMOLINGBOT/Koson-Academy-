// progress.js
import { db, doc, getDoc, setDoc, updateDoc, arrayUnion } from './firebase.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

/**
 * Foydalanuvchi progressini boshqarish va UI-ni yangilash uchun asosiy funksiya
 * @param {string} userId - Foydalanuvchi UID
 */
export async function setupProgress(userId) {
  const auth = getAuth();
  const completedLessons = new Set();
  const progressRef = doc(db, 'progress', userId);

  // Toast elementini yaratish
  const createToastElement = () => {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        zIndex: '1000',
      });
      document.body.appendChild(toast);
    }
    return toast;
  };

  const showToast = (message, bgColor = '#28a745') => {
    const toast = createToastElement();
    toast.textContent = message;
    toast.style.backgroundColor = bgColor;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => (toast.textContent = ''), 300);
    }, 3000);
  };

  const initProgress = async () => {
    try {
      const userSnap = await getDoc(progressRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (Array.isArray(data.lessons)) {
          data.lessons.forEach((id) => completedLessons.add(id));
        }
      } else {
        await setDoc(progressRef, {
          lessons: [],
          score: 0,
          lessons_visited: [],
        });
      }
    } catch (error) {
      console.error('Progressni olishda xato:', error);
      showToast('Ma\'lumotlarni yuklashda xato yuz berdi.', '#dc3545');
    }
  };

  const updatePoints = () => {
    const points = completedLessons.size * 10;
    const scoreElement = document.getElementById('score-value');
    if (scoreElement) scoreElement.textContent = points;
  };

  const updateLessonAvailability = () => {
    const lessonButtons = document.querySelectorAll('.lesson-btn');
    const unlocked = Array.from(completedLessons).map(Number);
    const maxUnlocked = completedLessons.size > 0 ? Math.max(...unlocked) : 0;

    lessonButtons.forEach((button) => {
      const lessonId = button.dataset.lesson;
      button.classList.toggle('visited', completedLessons.has(lessonId));
      button.removeEventListener('click', showLockedMessage);
      if (parseInt(lessonId) <= maxUnlocked + 1) {
        button.classList.remove('locked');
      } else {
        button.classList.add('locked');
        button.addEventListener('click', showLockedMessage, { once: true });
      }
    });
  };

  const showLockedMessage = (e) => {
    e.preventDefault();
    showToast('Darslarni ketma-ket oʻrganish kerak!', '#dc3545');
  };

  const updateProgressUI = () => {
    const totalLessons = document.querySelectorAll('.lesson-btn').length;
    const completedCount = completedLessons.size;
    const percent = (completedCount / totalLessons) * 100;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = `${percent}%`;
    updatePoints();
    updateLessonAvailability();
  };

  const completeLesson = async (lessonId, href) => {
    if (!completedLessons.has(lessonId)) {
      completedLessons.add(lessonId);
      const updatedScore = completedLessons.size * 10;
      const timestamp = new Date().toISOString();

      try {
        await updateDoc(progressRef, {
          lessons: arrayUnion(lessonId),
          score: updatedScore,
          lessons_visited: arrayUnion({
            lesson: lessonId,
            visited: true,
            timestamp,
          }),
        });
        showToast(`Dars ${lessonId} muvaffaqiyatli tugallandi! +10 ball`);
        updateProgressUI();
        window.location.href = href;
      } catch (error) {
        console.error('Firestore-ga yozishda xato:', error);
        showToast('Xato yuz berdi, qayta urinib ko‘ring.', '#dc3545');
        completedLessons.delete(lessonId);
        updateProgressUI();
      }
    } else {
      window.location.href = href;
    }
  };

  const setupLessonButtons = () => {
    document.querySelectorAll('.lesson-btn').forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const lessonId = button.dataset.lesson;
        const required = (parseInt(lessonId) - 1).toString();
        const href = button.href;

        if (parseInt(lessonId) > 1 && !completedLessons.has(required)) {
          showToast('Darslarni ketma-ket oʻrganish kerak!', '#dc3545');
          return;
        }

        await completeLesson(lessonId, href);
      });
    });
  };

  // Autentifikatsiyani tekshirish va progressni boshlash
  onAuthStateChanged(auth, async (user) => {
    if (user && user.uid === userId) {
      await initProgress();
      setupLessonButtons();
      updateProgressUI();
    } else {
      showToast('Iltimos, tizimga kiring!', '#dc3545');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  });
}