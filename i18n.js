const locales = {
  uz: { home: "Asosiy", lessons: "Darslar", results: "Natijalar", settings: "Sozlamalar" },
  en: { home: "Home", lessons: "Lessons", results: "Results", settings: "Settings" },
  ru: { home: "Главная", lessons: "Уроки", results: "Результаты", settings: "Настройки" }
};

export let currentLang = localStorage.getItem('lang') || 'uz';
export function t(key) {
  return locales[currentLang][key] || key;
}
export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  window.dispatchEvent(new Event('langChanged'));
}