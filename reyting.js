async function loadRatingBoard() {
  const querySnapshot = await getDocs(collection(db, "users"));
  let ratingList = [];
  querySnapshot.forEach(doc => {
    ratingList.push({ name: doc.data().name, score: doc.data().score || 0 });
  });
  ratingList.sort((a, b) => b.score - a.score);
  // Show top 10
}