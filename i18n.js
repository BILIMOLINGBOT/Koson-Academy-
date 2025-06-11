import { doc, updateDoc } from 'firebase/firestore';

export async function initLanguage(db) {
  const userId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'anonymous';
  const userDoc = doc(db, 'users', userId);
  const languageSelect = document.getElementById('language');
  const translations = await loadTranslations();

  // Tilni o'rnatish
  const setLanguage = async (lang) => {
    try {
      await updateDoc(userDoc, { language: lang });
      document.documentElement.lang = lang;
      // UI'ni yangilash (masalan, navigatsiya matnlari)
      document.querySelectorAll('.nav-item span').forEach((span, index) => {
        span.innerText = translations.navigation[index][lang];
      });
    } catch (error) {
      console.error('Tilni saqlashda xato:', error);
      window.Telegram.WebApp.showAlert('Til o‘zgartirishda xatolik yuz berdi.');
    }
  };

  // Tilni avtomatik aniqlash
  const userData = (await getDoc(userDoc)).data();
  const initialLang = userData.language || window.Telegram.WebApp.initDataUnsafe.language_code || 'uz';
  languageSelect.value = initialLang;
  await setLanguage(initialLang);

  // Til o'zgartirish
  languageSelect.addEventListener('change', async (e) => {
    await setLanguage(e.target.value);
    window.location.reload();
  });
}

export async function loadTranslations() {
  const lang = document.getElementById('language').value || 'uz';
  try {
    const response = await fetch(`/assets/locales/${lang}.json`);
    return await response.json();
  } catch (error) {
    console.error('Tarjimalarni yuklashda xato:', error);
    return {};
  }
}