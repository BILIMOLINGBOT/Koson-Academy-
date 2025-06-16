<script type="module">
  import { app } from './firebase.js';
  import { getFirestore, doc, getDoc, updateDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

  const db = getFirestore(app);
  const auth = getAuth(app);
  const lessons = document.querySelectorAll('.lesson-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const scoreValue = document.getElementById('score-value');
  const toast = document.getElementById('toast');
  const visitLog = document.getElementById('visit-log');

  // Toast xabarni ko‘rsatish
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Progressni yangilash
  function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressText.textContent = Math.floor(percent) + '%';
  }

  // Dark mode sozlamasi
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  document.body.classList.toggle('dark-mode', prefersDark.matches);
  prefersDark.addEventListener('change', e => {
    document.body.classList.toggle('dark-mode', e.matches);
  });

  let unlockedLesson = 1;
  let score = 0;

  // Foydalanuvchi autentifikatsiyasini tekshirish
  onAuthStateChanged(auth, async user => {
    if (!user) {
      showToast("Iltimos, tizimga kiring.");
      setTimeout(() => window.location.href = "index.html", 1000);
      return;
    }

    const uid = user.uid;
    const userRef = doc(db, "users", uid);

    try {
      // Firestore’dan ma’lumotlarni olish
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        unlockedLesson = data?.progress?.A1 || 1;
        score = data?.score?.A1 || 0;
        scoreValue.textContent = score;

        // Dars tugmalarini yangilash
        const lessonsVisited = data?.lessons_visited || [];
        lessons.forEach(btn => {
          const lessonNum = parseInt(btn.dataset.lesson);
          const visit = lessonsVisited.find(visit => visit.lesson === lessonNum && visit.visited);
          if (visit) {
            btn.classList.add('visited');
            const time = new Date(visit.timestamp).toLocaleString('uz-UZ');
            const logItem = document.createElement('div');
            logItem.textContent = `Dars ${lessonNum}: ${time}`;
            visitLog.appendChild(logItem);
          }
          if (lessonNum <= unlockedLesson) {
            btn.classList.remove('locked');
            btn.href = `dars${lessonNum}.html`;
          }
        });
      } else {
        // Yangi foydalanuvchi uchun dastlabki ma’lumotlar
        await setDoc(userRef, {
          progress: { A1: 1 },
          score: { A1: 0 },
          lessons_visited: []
        });
        unlockedLesson = 1;
        score = 0;
        scoreValue.textContent = score;
      }

      // Progressni yangilash
      updateProgress(Math.min((unlockedLesson / lessons.length) * 100, 100));

      // Dars tugmasi bosilishi hodisasi
      lessons.forEach(btn => {
        btn.addEventListener('click', async function (e) {
          const lessonNum = parseInt(this.dataset.lesson);
          if (lessonNum > unlockedLesson) {
            e.preventDefault();
            showToast("Darslarni ketma-ket oʻrganish kerak!");
            return;
          }

          if (!this.classList.contains('visited')) {
            try {
              // Ball va progressni yangilash
              score += 10;
              const timestamp = new Date().toISOString();
              this.classList.add('visited');

              // Keyingi darsni ochish
              const nextLessonNum = lessonNum + 1;
              if (nextLessonNum > unlockedLesson) {
                unlockedLesson = nextLessonNum;
              }

              // UI ni yangilash
              scoreValue.textContent = score;
              updateProgress(Math.min((unlockedLesson / lessons.length) * 100, 100));

              const nextLesson = document.querySelector(`.lesson-btn[data-lesson="${nextLessonNum}"]`);
              if (nextLesson && nextLesson.classList.contains('locked')) {
                nextLesson.classList.remove('locked');
                nextLesson.href = `dars${nextLessonNum}.html`;
              }

              // Tashrif logini qo‘shish
              const logItem = document.createElement('div');
              logItem.textContent = `Dars ${lessonNum}: ${new Date(timestamp).toLocaleString('uz-UZ')}`;
              visitLog.appendChild(logItem);

              // Firestore’ga saqlash
              await updateDoc(userRef, {
                [`progress.A1`]: unlockedLesson,
                [`score.A1`]: score,
                lessons_visited: arrayUnion({ lesson: lessonNum, visited: true, timestamp })
              });

              console.log(`progress.A1 yangilandi: ${unlockedLesson}`);
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