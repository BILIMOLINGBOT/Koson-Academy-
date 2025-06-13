
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loadLessons(db) {
  const lessonContainerForLessonsPage = document.getElementById("lessonContainerForLessonsPage");
  if (lessonContainerForLessonsPage) {
    try {
      const querySnapshot = await getDocs(collection(db, "lessons"));
      lessonContainerForLessonsPage.innerHTML = "";
      const categories = {
        "To be fe'li": [],
        "Present Continuous": [],
        "Present Simple": [],
        "I have/I have got": [],
        "Past Simple": [],
        "Past Continuous": []
      };
      querySnapshot.forEach((doc) => {
        const lesson = doc.data();
        if (lesson.level === "A1") {
          if (lesson.title.includes("To be")) categories["To be fe'li"].push(lesson);
          else if (lesson.title.includes("Present continues")) categories["Present Continuous"].push(lesson);
          else if (lesson.title.includes("Present simple")) categories["Present Simple"].push(lesson);
          else if (lesson.title.includes("I have")) categories["I have/I have got"].push(lesson);
          else if (lesson.title.includes("Past simple")) categories["Past Simple"].push(lesson);
          else if (lesson.title.includes("Past continuous")) categories["Past Continuous"].push(lesson);
        }
      });
      for (const [category, lessons] of Object.entries(categories)) {
        if (lessons.length > 0) {
          const categoryDiv = document.createElement("div");
          categoryDiv.className = "lesson-group";
          categoryDiv.innerHTML = `<div class="lesson-group-title">${category}</div><div class="button-container"></div>`;
          const buttonContainer = categoryDiv.querySelector(".button-container");
          lessons.forEach(lesson => {
            const a = document.createElement("a");
            a.href = `lesson${lesson.id}.html`;
            a.className = `button ${completedLessons.has(lesson.id.toString()) ? '' : 'closed'}`;
            a.innerText = lesson.title;
            if (!completedLessons.has(lesson.id.toString())) {
              a.addEventListener('click', showClosedLessonMessage);
            }
            buttonContainer.appendChild(a);
          });
          lessonContainerForLessonsPage.appendChild(categoryDiv);
        }
      }
    } catch (error) {
      lessonContainerForLessonsPage.innerHTML = "<p>Xatolik yuz berdi.</p>";
      console.error("Darslar yuklashda xatolik:", error);
    }
  }
}