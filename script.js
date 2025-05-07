// Fonction pour valider l'email 
import { validateEmail } from './modules/email.js';

// Fonction pour le mot de passe
 // Au moins 6 caractères, une majuscule, une minuscule, un caractère spécial
import { validatePassword } from "./modules/password.js";


// récupération pour afficher le plateau de jeu
const gameBoard = document.getElementById('gameBoard');

// affichage des variables, cartes retournées les paires et tableau
let flippedCards = []; //cartes retournées
let matchedPairs = 0; //nombre de paires trouvés
let totalPairs = 0;//total PaireTrouvées
let cards = [];//tableau de cartes
let score = 0;//score
let username = '';//nom du joueur
let currentTheme = '';//thème choisi
let nbCoups = 0;
let startTime, endTime;


// fonction mélange de manière aléatoire
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

//fonction pour créer les cartes, mélanger afficher dans le plateau de jeu
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

// Duppliquer les cartes
cards = [...selectedImages, ...selectedImages];
cards = shuffle(cards);


// 4. Créer et ajouter chaque carte au DOM
cards.forEach((content, index) => {
  const card = document.createElement('div');//nouvelle carte
  card.classList.add('card');//donne class Css card
  card.dataset.content = content; //Stockage de l'image'
  card.dataset.index = index; //stocke l'index
  card.textContent = ''; // carte face cachée

  //quand on clique sur une carte
  card.addEventListener('click', () => {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
      flipCard(card);//on la retrouve
    }
  });

  gameBoard.appendChild(card); //ajout de la carte au plateau, par script à un element parent
});

  // Ajuster la grille CSS selon la taille
  gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(pairsCount))}, 1fr)`;
}


//Fonction tirage des cartes, clique affiche puis = ou !=
function flipCard(card) {
  card.classList.add('flipped');//variable carte visible, en appelant class css flipped
  card.innerHTML = `<img src="${card.dataset.content}">`;//affiche image
  flippedCards.push(card);//ajout à liste cartes retournées

  if (flippedCards.length === 2) {
    nbCoups++; 
    //  pour compter le score dc nbCoups
    // Vérifier si c'est une paire
    if (flippedCards[0].dataset.content === flippedCards[1].dataset.content) {
      //Si c'est une paire, on ++
      matchedPairs++;
      flippedCards.forEach(c => c.classList.add('matched'));// c pour valeur temporaire ou carte reste retournée su rle plateau
      flippedCards = [];
      if (matchedPairs === totalPairs) {
        endGame();//finir le jeu si toutes les paires trouvées
      }
    } else {
      // Retourner les cartes après un court délai, 1s
      setTimeout(() => {
        flippedCards.forEach(c => {
          c.classList.remove('flipped'); //variable c carte appelant class css flipped
          c.innerHTML = '';//carte cachée
        });
        flippedCards = [];
      }, 1000);
    }
  }
}

//Fonction fin de jeu, message enregistrer le score et affichage
function endGame() {
  // arret du timer 
  const duree = stopTimer(); 
  score = calculerScore(nbCoups, totalPairs, duree);
  
  alert('Félicitations ! Vous avez trouvé toutes les paires.');
  saveScore(username, currentTheme, totalPairs, score);
  displayBestScores(currentTheme, totalPairs);
  document.getElementById('currentScore').textContent = score;
}


// Démarrer le jeu
 // theme et choix de la taille

 document.getElementById('startGameBtn').addEventListener('click', () => {
  const theme = document.getElementById('theme').value;
  const totalCards = parseInt(document.getElementById('boardSize').value, 10);

  if (!theme || isNaN(totalCards)) {
    alert("Veuillez sélectionner un thème et une taille de plateau.");
    return;
  }

  currentTheme = theme;
  createBoard(theme, totalCards);
  displayBestScores(theme, totalCards);
});


// Option : relancer la partie avec la barre d'espace
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    createBoard(theme, boardSize);
  }
});


 //calcul score temps et nb coups
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

//Fonction enregistrer les scores dans localStockage
// score
function saveScore(user, theme, pairs, score) {
    const key = `memory_scores_${theme}_${pairs}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
     // Ajouter le nouveau score global (mettre dans jouer)
    scores.push({ user, score, currentTheme, date: new Date().toISOString() });
  
    // Trier par score décroissant
    scores.sort((a,b) => b.score - a.score);
  
    // Garder seulement les 10 meilleurs
    scores = scores.slice(0, 10);
  
    localStorage.setItem(key, JSON.stringify(scores));
    
    // Sauvegarder aussi les préférences utilisateur et dernière partie jouée
    const userKey = `memory_user_${user}`;
    let userData = JSON.parse(localStorage.getItem(userKey)) || { username: user, preferences: {}, lastGames: [] };
    //données déjà stockées par user
    userData.preferences = { theme, pairs };
    
    // Ajouter la partie à l'historique
    userData.lastGames.unshift({
      theme,
      score,
      date: new Date().toISOString()
    });
  
    // Garder max 10 dernières parties
    if (userData.lastGames.length > 10) {
      userData.lastGames.pop();
    }
  
    localStorage.setItem(userKey, JSON.stringify(userData));
  }   
  

  // Afficher les meilleurs scores
  function displayBestScores(theme, pairs) {
    const bestScoresList = document.getElementById('bestScoresList');
    const key = `memory_scores_${theme}_${pairs}`;
    const scores = JSON.parse(localStorage.getItem(key)) || [];

    bestScoresList.innerHTML = '';

    if (scores.length === 0) {
      bestScoresList.innerHTML = 'Aucun score enregistré.';
      return;
    }

    scores.forEach((s, i) => {//créé li pour chaque score, définit rang, user, score, date
      const li = document.createElement('li');
      li.textContent = `${i+1}. ${s.user} - ${s.score} pts (${new Date(s.date).toLocaleDateString()})`;
      bestScoresList.appendChild(li);//ajout element li à Bestscore
    });
  }

  // Gestion du formulaire
  const form = document.getElementById('form');
  if (form) {
    
  
  form.addEventListener('submit', e => {
    e.preventDefault();})

    // const email = document.getElementById("email").value.trim();
    // const password = document.getElementById("password").value.trim();
    // const confirmPassword = document.getElementById('confirmPassword').value.trim();
    // username = document.getElementById('username').value.trim();
    // currentTheme = document.getElementById('theme').value;
    // const pairs = parseInt(document.getElementById('boardSize').value);

    
    // createBoard(currentTheme, pairs);
    // displayBestScores(currentTheme, pairs);
  };

  //Affichage erreurs
    let erreurs = [];
    
    if (!validateEmail(email)){
      erreurs.push("Email invalide.");
    }
    if (!validatePassword(password)) {
      erreurs.push("Le mot de passe doit contenir au moins 6 caractères, un chiffre et un caractère spécial.");
    }
    if (password !== confirmPassword) {
      erreurs.push("Les mots de passe ne correspondent pas.");
    }
    if (!username) {
      erreurs.push("Le nom d'utilisateur doit contenir au moins 3 caractères.");
    }
    
    
    const erreurDiv = document.getElementById('erreurMessages');
    if (erreurs.length > 0) {
      erreurDiv.innerHTML = erreurs.join("<br>");
    } else {
      const user = { username, email, password };
    localStorage.setItem('user', JSON.stringify(user));
    alert("Inscription réussie !");
    window.location.href = "Jouer.html";
    
  }


  // // formulaire

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
     
  export function saveToLocalStorage(userData) {
    // Get [users] or []
    const users = JSON.parse(localStorage.getItem('userData')) ?? []
    users.push(userData)
    // Update
    localStorage.setItem('userData', JSON.stringify(users));
}