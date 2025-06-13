import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// progress.js faylidan completedLessons va showClosedLessonMessage funksiyalarini import qilish
import { completedLessons, showClosedLessonMessage } from "./progress.js";

export async function loadLessons(db, level) {
  const lessonContainerForLessonsPage = document.getElementById("lessonContainerForLessonsPage");

  if (lessonContainerForLessonsPage) {
    try {
      const querySnapshot = await getDocs(collection(db, "lessons"));
      lessonContainerForLessonsPage.innerHTML = "";

      // Darajaga mos keladigan barcha darslarni oddiy ro‘yxatga yig‘amiz
      const lessons = [];
      querySnapshot.forEach((doc) => {
        const lesson = doc.data();
        if (lesson.level === level) {
          lessons.push(lesson);
        }
      });

      if (lessons.length === 0) {
        lessonContainerForLessonsPage.innerHTML = "<p>Bu darajaga oid darslar topilmadi.</p>";
        return;
      }

      // Har bir dars uchun tugma yaratamiz
      lessons.forEach((lesson) => {
        const a = document.createElement("a");
        a.href = `lesson${lesson.id}.html`;
        a.className = `button ${completedLessons.has(lesson.id.toString()) ? '' : 'closed'}`;
        a.innerText = lesson.title;

        if (!completedLessons.has(lesson.id.toString())) {
          a.addEventListener("click", showClosedLessonMessage);
        }

        lessonContainerForLessonsPage.appendChild(a);
      });

    } catch (error) {
      lessonContainerForLessonsPage.innerHTML = "<p>Xatolik yuz berdi.</p>";
      console.error("Darslarni yuklashda xatolik:", error);
    }
  }
}