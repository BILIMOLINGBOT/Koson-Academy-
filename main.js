import { initUser } from "./auth.js";
import { initProgress } from "./progress.js";
import { renderLessons } from "./lessons.js";

(async () => {
  const userData = await initUser();
  document.getElementById('userName').textContent = userData.name;
  document.getElementById('userPhoto').src = userData.photo;
  initProgress(userData);
  renderLessons('lessons');
})();