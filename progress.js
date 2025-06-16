<!DOCTYPE html><html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A1 Darslari</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 20px;
      background-color: #ffffff;
      color: #333;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    body.dark-mode {
      background-color: #222;
      color: #f4f4f4;
    }
    .back-btn {
      display: inline-block;
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin-bottom: 15px;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    .back-btn:hover {
      background-color: #0056b3;
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    #progress-container {
      width: 100%;
      background-color: #ddd;
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0;
    }
    #progress-bar {
      width: 0%;
      height: 20px;
      background-color: #007bff;
      transition: width 0.3s ease;
    }
    .lesson-btn {
      display: block;
      margin: 10px 0;
      padding: 12px;
      text-align: center;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      transition: background-color 0.3s ease;
      font-size: 16px;
    }
    .lesson-btn:hover {
      background-color: #0056b3;
    }
    .lesson-btn.visited {
      background-color: #28a745 !important;
      color: white;
    }
    .locked {
      background-color: #ccc !important;
      color: #666 !important;
      cursor: not-allowed;
    }
    body.dark-mode .lesson-btn {
      background-color: #3399ff;
      color: white;
    }
    body.dark-mode .lesson-btn.visited {
      background-color: #2ecc71 !important;
    }
    body.dark-mode .lesson-btn.locked {
      background-color: #555 !important;
      color: #999 !important;
    }
    #score {
      text-align: center;
      font-weight: bold;
      font-size: 18px;
      margin: 10px 0;
    }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #28a745;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .toast.show {
      opacity: 1;
    }
  </style>
</head>
<body>
  <a href="index.html" class="back-btn">← Orqaga</a>
  <h1>A1 Darslari</h1>
  <div id="score">Ball: <span id="score-value">0</span></div>
  <div id="progress-container">
    <div id="progress-bar"></div>
  </div>
  <div id="lessons-list">
    <!-- Lessons list injected by backend or statically listed -->
  </div>
  <div id="toast" class="toast"></div>
  <script type="module">
    import { app } from './firebase.js';
    import { getFirestore, doc, getDoc, updateDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";const db = getFirestore(app);
const auth = getAuth(app);
const lessons = document.querySelectorAll('.lesson-btn');
const progressBar = document.getElementById('progress-bar');
const scoreValue = document.getElementById('score-value');
const toast = document.getElementById('toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
document.body.classList.toggle('dark-mode', prefersDark.matches);
prefersDark.addEventListener('change', e => {
  document.body.classList.toggle('dark-mode', e.matches);
});

let unlockedLesson = 1;
let score = 0;

onAuthStateChanged(auth, async user => {
  if (!user) {
    showToast("Iltimos, tizimga kiring.");
    setTimeout(() => window.location.href = "index.html", 1000);
    return;
  }

  const uid = user.uid;
  const userRef = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      unlockedLesson = data?.progress?.A1 || 1;
      score = data?.score?.A1 || 0;
      scoreValue.textContent = score;

      const lessonsVisited = data?.lessons_visited || [];
      lessons.forEach(btn => {
        const lessonNum = parseInt(btn.dataset.lesson);
        if (lessonsVisited.some(visit => visit.lesson === lessonNum && visit.visited)) {
          btn.classList.add('visited');
        }
        if (lessonNum <= unlockedLesson) {
          btn.classList.remove('locked');
        }
      });
    } else {
      await setDoc(userRef, {
        progress: { A1: 1 },
        score: { A1: 0 },
        lessons_visited: []
      });
    }

    progressBar.style.width = Math.min((unlockedLesson / lessons.length) * 100, 100) + '%';

    lessons.forEach(btn => {
      btn.addEventListener('click', async function (e) {
        const lessonNum = parseInt(this.dataset.lesson);
        if (lessonNum > unlockedLesson) {
          e.preventDefault();
          showToast("Darslarni ketma-ket oʻrganish kerak!");
          return;
        }

        if (!this.classList.contains('visited')) {
          score += 10;

          const timestamp = new Date().toISOString();
          this.classList.add('visited');

          const nextLessonNum = lessonNum + 1;
          if (nextLessonNum > unlockedLesson) {
            unlockedLesson = nextLessonNum;
          }

          scoreValue.textContent = score;
          progressBar.style.width = Math.min((unlockedLesson / lessons.length) * 100, 100) + '%';

          const nextLesson = document.querySelector(`.lesson-btn[data-lesson="${nextLessonNum}"]`);
          if (nextLesson && nextLesson.classList.contains('locked')) {
            nextLesson.classList.remove('locked');
            nextLesson.href = `dars${nextLessonNum}.html`;
          }

          try {
            await updateDoc(userRef, {
              [`progress.A1`]: unlockedLesson,
              [`score.A1`]: score,
              lessons_visited: arrayUnion({ lesson: lessonNum, visited: true, timestamp })
            });
            showToast(`Dars ${lessonNum} muvaffaqiyatli ochildi! +10 ball`);
          } catch (error) {
            console.error("Firestore-ga yozishda xato:", error);
            showToast("Xato yuz berdi, qayta urinib ko‘ring.");
          }
        }
      });
    });
  } catch (error) {
    console.error("Ma'lumotlarni olishda xato:", error);
    showToast("Ma'lumotlarni yuklashda xato yuz berdi.");
  }
});

  </script>
</body>
</html>