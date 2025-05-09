// Fonction pour valider l'email 
import { validateEmail } from './modules/email.js';

// Fonction pour le mot de passe
// Au moins 6 caractères, une majuscule, une minuscule, un caractère spécial
import { validatePassword } from "./modules/password.js";
import { saveToLocalStorage, saveGameScore, displayBestScores } from './modules/storage.js';

// Récupération pour afficher le plateau de jeu
const gameBoard = document.getElementById('gameBoard');

// Variables pour le jeu
let flippedCards = []; // cartes retournées
let matchedPairs = 0; // nombre de paires trouvées
let totalPairs = 0; // total PaireTrouvées
let cards = []; // tableau de cartes
let score = 0; // score
let currentTheme = ''; // thème choisi
let nbCoups = 0;
let startTime, endTime;

// Récupérer les variables utilisateur
const user = JSON.parse(localStorage.getItem('user'));
const username = user?.username || 'Invité';

// Fonction de mélange aléatoire
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateImagesArray(basePath, count) {
  const images = [];
  for (let i = 1; i <= count; i++) {
    const url = `${basePath}/${i}.webp`;
    images.push(url);
  }
  return images;
}

// Fonction pour créer les cartes, mélanger, afficher dans le plateau de jeu
function createBoard(theme, totalCards) {
  const pairsCount = totalCards / 2;
  const basePath = `image/${theme}`;
  const selectedImages = generateImagesArray(basePath, pairsCount);
  gameBoard.innerHTML = '';
  flippedCards = [];
  matchedPairs = 0;
  score = 0;
  nbCoups = 0;
  totalPairs = pairsCount;

  startTimer();

  // Dupliquer les cartes
  cards = [...selectedImages, ...selectedImages];
  cards = shuffle(cards);

  // 4. Créer et ajouter chaque carte au DOM
  cards.forEach((content, index) => {
    const card = document.createElement('div'); // nouvelle carte
    card.classList.add('card'); // donne class Css card
    card.dataset.content = content; // Stockage de l'image pour content, ajout info carte
    card.dataset.index = index; // stocke l'index ds tableau
    card.textContent = ''; // carte face cachée

    // Quand on clique sur une carte
    card.addEventListener('click', () => {
      if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        flipCard(card); // on la retrouve
      }
    });

    gameBoard.appendChild(card); // ajout de la carte au plateau, par script à un élément parent
  });

  // Ajuster la grille CSS selon la taille
  gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(pairsCount))}, 1fr)`;
}

// Fonction tirage des cartes, clic affiche puis = ou !=
function flipCard(card) {
  card.classList.add('flipped'); // carte visible, en appelant class css flipped
  card.innerHTML = `<img src="${card.dataset.content}">`; // affiche image
  flippedCards.push(card); // ajout à liste cartes retournées

  if (flippedCards.length === 2) {
    nbCoups++; // pour compter le score dc nbCoups
    // Vérifier si c'est une paire
    if (flippedCards[0].dataset.content === flippedCards[1].dataset.content) {
      matchedPairs++; // Si c'est une paire, on ++
      flippedCards.forEach(c => c.classList.add('matched')); // carte reste retournée sur le plateau
      flippedCards = [];
      if (matchedPairs === totalPairs) {
        endGame(); // finir le jeu si toutes les paires trouvées
      }
    } else {
      // Retourner les cartes après un court délai (1s)
      setTimeout(() => {
        flippedCards.forEach(c => {
          c.classList.remove('flipped'); // carte appelant class css flipped
          c.innerHTML = ''; // carte cachée
        });
        flippedCards = [];
      }, 1000);
    }
  }
}
console.log("currentTheme:", currentTheme);
console.log("totalPairs:", totalPairs);

// Fonction fin de jeu, message enregistrer le score et affichage
function endGame() {
  const duree = stopTimer(); // arrête le timer
  score = calculerScore(nbCoups, totalPairs, duree);
  const user = JSON.parse(sessionStorage.getItem('user'));
  const username = user ? user.username : 'Invité';

  alert('Félicitations ! Vous avez trouvé toutes les paires.');
  saveGameScore({ user: username, theme: currentTheme, pairs: totalPairs, score });
  displayBestScores(currentTheme, totalPairs);
  document.getElementById('currentScore').textContent = score;
}

// Démarrer le jeu

if (document.body.classList.contains('page-accueil') || document.body.classList.contains('page-jeu')) {
  const startGameBtn = document.getElementById('startGameBtn');
  
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {  
      const theme = document.getElementById('theme').value;
  const totalCards = parseInt(document.getElementById('boardSize').value, 10);

  if (!theme || isNaN(totalCards)) {
    alert("Veuillez sélectionner un thème et une taille de plateau.");
    return;
  }

  currentTheme = theme;
  totalPairs =totalCards/2;

  console.log("Theme choisi: ", currentTheme);
  console.log("Total Paires: ", totalPairs);

  createBoard(theme, totalCards);
  displayBestScores(theme, totalCards);
});
}}

console.log(JSON.parse(localStorage.getItem('memory_scores_animaux_6')));

// Option : relancer la partie avec la barre d'espace
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    createBoard(theme, boardSize);
  }
});

// Calcul du score, temps et nb de coups
function startTimer() {
  startTime = new Date();
}

function stopTimer() {
  endTime = new Date();
  return Math.floor((endTime - startTime) / 1000); // durée en secondes
}

function calculerScore(nbCoups, nbPaires, tempsEnSecondes) {
  const scoreMax = nbPaires * 100;
  const penaliteCoups = nbCoups - nbPaires;
  const penaliteTemps = Math.floor(tempsEnSecondes / 5);

  let scoreFinal = scoreMax - (penaliteCoups * 10) - penaliteTemps;
  return Math.max(scoreFinal, 0); // Ne jamais retourner un score négatif
}
window.displayBestScores = displayBestScores;

// Gestion du mot de passe
import { evaluatePasswordStrength } from './modules/password.js';

const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const strengthDiv = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('passwordStrengthFill');

// Mise à jour de la force du mot de passe

if (passwordInput && strengthDiv && strengthFill) {
  passwordInput.addEventListener('input', () => {
    const strength = evaluatePasswordStrength(passwordInput.value);
    strengthDiv.textContent = `Force du mot de passe : ${strength}`;

    let width = 0;
    let color = 'red';

    if (strength === 'fort') {
      width = 100;
      color = 'green';
    } else if (strength === 'moyen') {
      width = 60;
      color = 'orange';
    } else {
      width = 30;
      color = 'red';
    }

    strengthFill.style.width = `${width}%`;
    strengthFill.style.backgroundColor = color;
  });
}

// Gestion du formulaire d'inscription affichage des erreurs
const form = document.getElementById('registerForm');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const username = document.getElementById('username').value.trim();
    
    const erreurDiv = document.getElementById('erreurMessages');
    const erreurs = [];

    if (!validateEmail(email)) {
      erreurs.push("Email invalide.");
    }

    if (!validatePassword(password)) {
      erreurs.push("Le mot de passe doit contenir au moins 6 caractères, un chiffre et un caractère spécial.");
    }

    if (password !== confirmPassword) {
      erreurs.push("Les mots de passe ne correspondent pas.");
    }

    if (username.length < 3) {
      erreurs.push("Le nom d'utilisateur doit contenir au moins 3 caractères.");
    }

    if (erreurs.length > 0) {
      erreurDiv.innerHTML = '';
      erreurs.forEach(erreur => {
        const p = document.createElement('p');
        p.textContent = erreur;
        erreurDiv.appendChild(p);
      });
    } else {
      const user = { username, email, password };

      saveToLocalStorage(user); // Sauvegarde dans le tableau d’utilisateurs
      sessionStorage.setItem('user', JSON.stringify(user)); // Session en cours

      alert("Inscription réussie !");
      form.reset(); // Nettoie le formulaire
      window.location.href = "seconnecter.html"; // redirige vers la connexion
    }
  });
}
