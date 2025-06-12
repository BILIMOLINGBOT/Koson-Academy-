document.addEventListener("DOMContentLoaded", () => {
  const progressFill = document.querySelector(".progress-fill");
  const lessonButtons = document.querySelectorAll(".button");
  const completedText = document.getElementById("completedLessonsCount");
  const levelTabs = document.querySelectorAll(".level-tab");
  const levelContents = document.querySelectorAll(".level-content");

  // Unique ID for each lesson
  lessonButtons.forEach((btn, index) => {
    btn.dataset.lessonId = `lesson-${index + 1}`;
  });

  // Load progress from localStorage
  let completedLessons = JSON.parse(localStorage.getItem("completedLessons")) || [];

  // Mark completed lessons visually
  function updateLessonsUI() {
    lessonButtons.forEach((btn) => {
      const id = btn.dataset.lessonId;
      if (completedLessons.includes(id)) {
        btn.classList.add("completed");
        if (!btn.querySelector(".star")) {
          const star = document.createElement("span");
          star.textContent = "⭐";
          star.classList.add("star");
          star.style.marginLeft = "8px";
          btn.appendChild(star);
        }
      } else {
        btn.classList.remove("completed");
        const star = btn.querySelector(".star");
        if (star) star.remove();
      }
    });

    const total = lessonButtons.length;
    const done = completedLessons.length;
    completedText.textContent = `Yakunlangan darslar: ${done} / ${total}`;
    progressFill.style.width = `${(done / total) * 100}%`;
  }

  // Lesson button click
  lessonButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.dataset.lessonId;
      if (!completedLessons.includes(id)) {
        completedLessons.push(id);
        localStorage.setItem("completedLessons", JSON.stringify(completedLessons));
        updateLessonsUI();
      }
    });
  });

  // Tabs (if you want to activate content switching later)
  levelTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      levelTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      levelContents.forEach((content, i) => {
        content.style.display = i === index ? "block" : "none";
      });
    });
  });

  // Initial UI update
  updateLessonsUI();

  // Optional: set default visible tab
  levelTabs[0].classList.add("active");
  levelContents.forEach((content, i) => {
    content.style.display = i === 0 ? "block" : "none";
  });
});