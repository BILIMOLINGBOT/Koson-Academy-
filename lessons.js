import { collection, getDocs } from 'firebase/firestore';
import { loadTranslations } from './i18n.js';

export async function initLessons(db) {
  const translations = await loadTranslations();
  const levelContent = document.getElementById('level-content');
  const lessonContainer = document.getElementById('lessonContainerForLessonsPage');

  try {
    const querySnapshot = await getDocs(collection(db, 'lessons'));
    const lessonsByCategory = {
      'To be fe\'li': [],
      'Present Continuous': [],
      'Present Simple': [],
      'I have/I have got': [],
      'Past Simple': [],
      'Past Continuous': []
    };

    querySnapshot.forEach(doc => {
      const lesson = { id: doc.id, ...doc.data() };
      if (lesson.level === 'A1') {
        if (lesson.title.includes('To be')) lessonsByCategory['To be fe\'li'].push(lesson);
        else if (lesson.title.includes('Present continues')) lessonsByCategory['Present Continuous'].push(lesson);
        else if (lesson.title.includes('Present simple')) lessonsByCategory['Present Simple'].push(lesson);
        else if (lesson.title.includes('I have')) lessonsByCategory['I have/I have got'].push(lesson);
        else if (lesson.title.includes('Past simple')) lessonsByCategory['Past Simple'].push(lesson);
        else if (lesson.title.includes('Past continuous')) lessonsByCategory['Past Continuous'].push(lesson);
      }
    });

    const renderLessons = (level, container = levelContent) => {
      container.innerHTML = `<div class="level-title">${translations.levels[level]}</div>`;
      Object.entries(lessonsByCategory).forEach(([category, lessons]) => {
        if (lessons.length > 0) {
          const categoryDiv = document.createElement('div');
          categoryDiv.className = 'lesson-group';
          categoryDiv.innerHTML = `
            <div class="lesson-group-title">${category}</div>
            <div class="button-container"></div>
          `;
          const buttonContainer = categoryDiv.querySelector('.button-container');
          lessons.forEach(lesson => {
            const button = document.createElement('button');
            button.className = `button ${lesson.completed ? 'completed' : ''}`;
            button.innerText = lesson.title;
            button.setAttribute('data-lesson-id', lesson.id);
            button.setAttribute('data-required', lesson.requiredLessonId || '');
            button.setAttribute('aria-label', `${lesson.title} darsiga o'tish`);
            button.title = lesson.description || '';
            button.addEventListener('click', () => {
              window.location.href = `/lesson${lesson.id}.html`;
              window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            });
            buttonContainer.appendChild(button);
          });
          container.appendChild(categoryDiv);
        }
      });
    };

    // Home sahifasi uchun A1 darajasini yuklash
    renderLessons('a1');
    // Lessons sahifasi uchun barcha darslarni yuklash
    renderLessons('a1', lessonContainer);

    // Level tablarini boshqarish
    document.querySelectorAll('.level-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.level-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderLessons(tab.getAttribute('data-level'));
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      });
    });
  } catch (error) {
    console.error('Darslarni yuklashda xato:', error);
    levelContent.innerHTML = '<p>Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.</p>';
    window.Telegram.WebApp.showAlert('Darslarni yuklashda xatolik yuz berdi.');
  }
}