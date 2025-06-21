import { db, collection, getDocs } from "./firebase.js";

export async function loadRatingBoard(currentUserId) {
  const ratingContainer = document.getElementById("rating-board");
  if (!ratingContainer) {
    console.warn("❗️ rating-board elementi topilmadi!");
    return;
  }

  ratingContainer.innerHTML = "<p>⏳ Reyting yuklanmoqda...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    const ratingList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name && data.score !== undefined) {
        ratingList.push({
          id: doc.id,
          name: data.name,
          username: data.username || "",
          photo: data.photoUrl || "",
          score: data.score || 0
        });
      }
    });

    // Saralash: ball bo‘yicha kamayish tartibida
    ratingList.sort((a, b) => b.score - a.score);

    let html = `<h2>🏆 Reytinglar</h2>`;
    html += `<ol style="text-align: left; padding-left: 20px;">`;

    ratingList.slice(0, 20).forEach((user, index) => {
      const isCurrentUser = user.id === currentUserId;
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;

      html += `
        <li style="margin-bottom: 8px; background-color: ${isCurrentUser ? '#e6f7ff' : 'transparent'}; padding: 5px; border-radius: 6px;">
          ${medal}
          <img src="${user.photo}" alt="👤" width="24" height="24" style="vertical-align: middle; border-radius: 50%;" />
          <strong style="margin-left: 8px;">${user.name}</strong>
          ${user.username ? `<span style="font-size: 13px; color: gray;">@${user.username}</span>` : ""}
          – <span style="font-weight: bold;">${user.score}</span> ball
        </li>`;
    });

    html += `</ol>`;

    // Foydalanuvchining o‘z joyini ko‘rsatish (20 talikda bo‘lmasa ham)
    const userIndex = ratingList.findIndex(u => u.id === currentUserId);
    if (userIndex >= 20) {
      const user = ratingList[userIndex];
      html += `
        <div style="margin-top: 20px; padding: 10px; border-top: 1px solid #ccc;">
          <strong>Sizning o‘rningiz:</strong><br>
          <span style="font-size: 18px;">${userIndex + 1}-o‘rin – ${user.name} (${user.score} ball)</span>
        </div>
      `;
    }

    ratingContainer.innerHTML = html;

  } catch (error) {
    console.error("❌ Reytingni yuklashda xatolik:", error);
    ratingContainer.innerHTML = "<p style='color: red;'>Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.</p>";
  }
}