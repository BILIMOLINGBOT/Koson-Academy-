import { updatePoints, updateCompletedLessons } from "./auth.js";

let state = { points: 0, completedLessons: [] };

export function initProgress(data) {
  state = data;
  renderProgress();
}

export function completeLesson(lessonId, pointsEarned) {
  if (!state.completedLessons.includes(lessonId)) {
    state.completedLessons.push(lessonId);
    state.points += pointsEarned;
    updatePoints(state.points);
    updateCompletedLessons(state.completedLessons);
    renderProgress();
  }
}

function renderProgress() {
  document.getElementById('userPoints').textContent = `Ballar: ${state.points}`;
  // progress bar update...
}