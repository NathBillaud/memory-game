export function saveToLocalStorage(userData) {
  const users = JSON.parse(localStorage.getItem("userData")) || [];
  users.push(userData);
  localStorage.setItem("userData", JSON.stringify(users));
}

export function saveGameScore({ user, theme, pairs, score }) {
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const username = userFromSession ? userFromSession.username : "Invité";
  const key = `memory_scores_${theme}_${pairs}`;
  let scores = JSON.parse(localStorage.getItem(key)) || [];

  scores.push({ user: username, score, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(scores));

  // Données utilisateur
  const userKey = `memory_user_${user}`;
  let userData = JSON.parse(localStorage.getItem(userKey)) || {
    username: username,
    preferences: {},
    lastGames: [],
  };

  userData.preferences = { theme, pairs };
  userData.lastGames.unshift({ theme, score, date: new Date().toISOString() });
  userData.lastGames = userData.lastGames.slice(0, 10);

  localStorage.setItem(userKey, JSON.stringify(userData));
}

export function displayBestScores(theme, pairs) {
  const tableBody = document.getElementById("bestScoresBody");

  if (!tableBody) {
    console.error("L'élément #bestScoresBody n'a pas été trouvé dans le DOM");
    return;
  }
  const key = `memory_scores_${theme}_${pairs}`;
  const scores = JSON.parse(localStorage.getItem(key)) || [];

  tableBody.innerHTML = "";

  if (scores.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "Aucun score enregistré.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }
  scores.slice(0, 5).forEach((s, i) => {
    scores.forEach((s, i) => {
      //créé tr pour chaque score, définit rang, user, score, date
      const row = document.createElement("tr");

      row.innerHTML = `
      <td>${s.user}</td>
      <td>${s.score}</td>
      <td>${pairs}</td>
      <td>${theme}</td>
      <td>${new Date(s.date).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(row);
    });
  });
}
