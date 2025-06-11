import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Chart from 'chart.js/auto';

export async function initProgress(db) {
  const userId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'anonymous';
  const userDoc = doc(db, 'users', userId);

  try {
    const userSnap = await getDoc(userDoc);
    const userData = userSnap.data();
    const completedLessons = new Set(userData.completedLessons || []);
    const totalLessons = 36;
    const points = completedLessons.size * 10;

    // UI'ni yangilash
    document.getElementById('userPoints').innerText = `Ballar: ${points}`;
    document.getElementById('completedLessonsCount').innerText = `Yakunlangan darslar: ${completedLessons.size} / ${totalLessons}`;
    document.querySelector('.progress-fill').style.width = `${(completedLessons.size / totalLessons) * 100}%`;

    // Grafik
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['To be fe\'li', 'Present Continuous', 'Present Simple', 'I have/I have got', 'Past Simple', 'Past Continuous'],
        datasets: [{
          label: 'Yakunlangan darslar',
          data: Array(6).fill(0), // Dinamik ma'lumot Firebase'dan olinadi
          backgroundColor: 'rgba(52, 168, 83, 0.7)',
          borderColor: '#34A853',
          borderWidth: 1
        }]
      },
      options: {
        scales: { y: { beginAtZero: true, max: 6 } },
        plugins: { legend: { display: false } },
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    });

    // Darsni yakunlash
    document.querySelectorAll('.button').forEach(button => {
      button.addEventListener('click', async (e) => {
        const lessonId = button.getAttribute('data-lesson-id');
        const requiredLessonId = button.getAttribute('data-required');
        if (requiredLessonId && !completedLessons.has(requiredLessonId)) {
          e.preventDefault();
          window.Telegram.WebApp.showAlert('Darslarni ketma-ket o‘rganish kerak');
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
          return;
        }
        if (lessonId && !completedLessons.has(lessonId)) {
          completedLessons.add(lessonId);
          try {
            await updateDoc(userDoc, {
              completedLessons: [...completedLessons],
              points: completedLessons.size * 10,
              lastActive: new Date().toISOString()
            });
            button.classList.add('completed');
            document.getElementById('userPoints').innerText = `Ballar: ${completedLessons.size * 10}`;
            document.getElementById('completedLessonsCount').innerText = `Yakunlangan darslar: ${completedLessons.size} / ${totalLessons}`;
            document.querySelector('.progress-fill').style.width = `${(completedLessons.size / totalLessons) * 100}%`;
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          } catch (error) {
            console.error('Progressni yangilashda xato:', error);
            window.Telegram.WebApp.showAlert('Progressni saqlashda xatolik yuz berdi.');
          }
        }
      });
    });
  } catch (error) {
    console.error('Progressni yuklashda xato:', error);
    document.getElementById('completedLessonsCount').innerText = 'Xatolik yuz berdi';
    window.Telegram.WebApp.showAlert('Progressni yuklashda xatolik yuz berdi.');
  }
}