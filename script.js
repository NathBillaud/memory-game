// // Fonction pour valider l'email 
// import { EmailValidator } from './modules/email.js';

// // Fonction pour le mot de passe
//  // Au moins 6 caractères, une majuscule, une minuscule, un caractère spécial
// import { validatePassword } from "./modules/password.js";


const theme = {
  animaux : [
    'image/animaux/1.webp', 'image/animaux/2.webp', 'image/animaux/3.webp',
    'image/animaux/4.webp', 'image/animaux/5.webp', 'image/animaux/6.webp'],
  dinosaures: [],
  chiens:[],
  alphabet:[],
}
// récupération pour afficher le plateau de jeu
const gameBoard = document.getElementById('gameBoard');

// affichage des constantes, cartes retournées les paires et tableau
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let cards = [];
let score = 0;
let username = '';
let currentTheme = '';
let themes = theme;


// fonction mélange de manière aléatoire
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//Création du plateau de jeu
function createBoard(theme, pairsCount) {
  gameBoard.innerHTML = '';
  flippedCards = [];
  matchedPairs = 0;
  score = 0;
  totalPairs = pairsCount / 2;

// 1. Sélectionner les cartes du thème, nouveau tableau extrait avec debut et fin en paramètres
cards = themes[theme].slice(0, totalPairs);
// 2. Dupliquer pour avoir les paires
cards = [...cards, ...cards];

// 3. Mélanger
cards = shuffle(cards);

// 4. Créer et ajouter chaque carte au DOM
cards.forEach((content, index) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.content = content; //Stockage de l'emoji
  card.dataset.index = index; //stocke l'index
  card.textContent = ''; // carte face cachée

  card.addEventListener('click', () => {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
      flipCard(card);
    }
  });

  gameBoard.appendChild(card); //ajout de la carte au plateau
});

  // Ajuster la grille CSS selon la taille
  gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(pairsCount))}, 1fr)`;
}

//tirage des cartes
function flipCard(card) {
  card.classList.add('flipped');//carte visible+css
  card.innerHTML = `<img src="${card.dataset.content}">`;//affiche image
  flippedCards.push(card);//ajout au tab flipCard

  if (flippedCards.length === 2) {
    // Vérifier si c'est une paire
    if (flippedCards[0].dataset.content === flippedCards[1].dataset.content) {
      matchedPairs++;
      flippedCards.forEach(c => c.classList.add('matched'));// c pour valeur temporaire ou carte reste retournée su rle plateau
      flippedCards = [];
      if (matchedPairs === totalPairs) {
        endGame();//finir le jeu
      }
    } else {
      // Retourner les cartes après un court délai
      setTimeout(() => {
        flippedCards.forEach(c => {
          c.classList.remove('flipped');
          c.innerHTML = '';
        });
        flippedCards = [];
      }, 1000);
    }
  }
}

function endGame() {
  alert('Félicitations ! Vous avez trouvé toutes les paires.');
  saveScore(username, currentTheme, totalPairs, score);
  displayBestScores(currentTheme, totalPairs);
}


// Démarrer le jeu
createBoard('animaux', 12); // 12 cartes = 6 paires

document.getElementById('startGameBtn').addEventListener('click', () => {
  createBoard('animaux', 12);
});

// Optionnel : relancer la partie avec la barre d'espace
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    createBoard('animaux', 12);
  }
});


//Rajout des fonctions pour les formulaires et les scores
// score
function saveScore(user, theme, pairs, score) {
    const key = `memory_scores_${theme}_${pairs}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];

     // Ajouter le nouveau score global
    scores.push({ user, score, date: new Date().toISOString() });
  
    // Trier par score décroissant
    scores.sort((a,b) => b.score - a.score);
  
    // Garder seulement les 10 meilleurs
    scores = scores.slice(0, 10);
  
    localStorage.setItem(key, JSON.stringify(scores));
  
    // Sauvegarder aussi les préférences utilisateur et dernière partie jouée
    const userKey = `memory_user_${user}`;
    let userData = JSON.parse(localStorage.getItem(userKey)) || { username: user, preferences: {}, lastGames: [] };

    userData.preferences = { theme, pairs };
    
    // Ajouter la partie à l'historique
    userData.lastGames.unshift({
      theme,
      pairs,
      score,
      date: new Date().toISOString()
    });
  
    // Garder max 10 dernières parties
    if (userData.lastGames.length > 10) {
      userData.lastGames.pop();
    }
  
    localStorage.setItem(userKey, JSON.stringify(userData));
  }   

  // Garder seulement les 10 meilleurs
    score = score.slice(0, 10);

    localStorage.setItem(key, JSON.stringify(scores));

    // Sauvegarder aussi les préférences utilisateur
    const userData = {
      username: user,
      theme,
      pairs,
      lastScore: score,
      lastPlayed: new Date().toISOString()
    };
    localStorage.setItem(`memory_user_${user}`, JSON.stringify(userData));
  

  // Afficher les meilleurs scores
  function displayBestScores(theme, pairs) {
    const bestScoresList = document.getElementById('bestScoresList');
    const key = `memory_scores_${theme}_${pairs}`;
    const scores = JSON.parse(localStorage.getItem(key)) || [];

    bestScoresList.innerHTML = '';

    if (scores.length === 0) {
      bestScoresList.innerHTML = '<li>Aucun score enregistré.</li>';
      return;
    }

    scores.forEach((s, i) => {
      const li = document.createElement('li');
      li.textContent = `${i+1}. ${s.user} - ${s.score} pts (${new Date(s.date).toLocaleDateString()})`;
      bestScoresList.appendChild(li);
    });
  }

  // Gestion du formulaire
  form.addEventListener('submit', e => {
    e.preventDefault();

    username = document.getElementById('username').value.trim();
    currentTheme = document.getElementById('theme').value;
    const pairs = parseInt(document.getElementById('boardSize').value);

    if (!username) {
      alert('Veuillez entrer un pseudo.');
      return;
    }

    createBoard(currentTheme, pairs);
    displayBestScores(currentTheme, pairs);
  });

  //Affichage erreurs
    let erreurs = [];

    if (!validateEmail(email)) {
      erreurs.push("Email invalide.");
    }
    if (!validatePassword(password)) {
      erreurs.push("Le mot de passe doit contenir au moins 6 caractères, un chiffre et un caractère spécial.");
    }
    
    const erreurDiv = document.getElementById('erreurMessages');
    if (erreurs.length > 0) {
      erreurDiv.innerHTML = erreurs.join("<br>");
    } else {
      erreurDiv.innerHTML = "";
  }


  // formulaire

  // Création de l'objet utilisateur
      const user = {
        email: email,
        password: password,
      };

      // Sauvegarde dans localStorage
      localStorage.setItem('user', JSON.stringify(user));

      alert("Inscription réussie !");
      reset();

        const utilisateur = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,  
  };
  
  const json = JSON.stringify(utilisateur, null,2);
  localStorage.setItem("utilisateur", json);
  const resultatDiv = document.getElementById("json-resultat");
     
  // export function saveToLocalStorage(userData) {
  //   // Get [users] or []
  //   const users = JSON.parse(localStorage.getItem('userData')) ?? []
  //   users.push(userData)
  //   // Update
  //   localStorage.setItem('userData', JSON.stringify(users));
// }