document.addEventListener("DOMContentLoaded", () => {
  const levelTabs = document.querySelectorAll(".level-tab");
  const levelContents = document.querySelectorAll(".level-content");

  // Boshlang'ich holatda faqat birinchi content ko‘rsatiladi
  levelContents.forEach((content, index) => {
    content.style.display = index === 0 ? "block" : "none";
  });

  levelTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Aktiv klassni boshqalardan olib tashlash
      levelTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.dataset.target;

      // Har bir contentni tekshirib, faqat keraklisini ko‘rsatish
      levelContents.forEach((content) => {
        if (content.id === targetId) {
          content.style.display = "block";
        } else {
          content.style.display = "none";
        }
      });
    });
  });
});