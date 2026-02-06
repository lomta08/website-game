import './style.css'
import Fuse from 'fuse.js'

// 1. DATA WITH BETTER PHOTOS
const allQuizData = [
  { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', answer: 'cat', category: 'Animals' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', answer: 'dog', category: 'Animals' },
  // Actors - High quality portraits
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800', answer: 'brad pitt', category: 'Actors' },
  { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', answer: 'tom holland', category: 'Actors' },
  // Movies - Thematic shots
  { url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', answer: 'joker', category: 'Movies' },
  { url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', answer: 'star wars', category: 'Movies' }
];

let activeQuizData = [...allQuizData]; 
let currentIndex = 0;
let timeLeft = 60;
let score = 0;
let wrongAnswersCount = 0; 
let isPaused = false;
let gameInterval: any;

// 2. SELECT ELEMENTS
const menuScreen = document.querySelector<HTMLDivElement>('#menu-screen')!;
const gameScreen = document.querySelector<HTMLDivElement>('#game-screen')!;
const resultsScreen = document.querySelector<HTMLDivElement>('#results-screen')!;
const imgElement = document.querySelector<HTMLImageElement>('#quiz-image')!;
const timerElement = document.querySelector<HTMLParagraphElement>('#timer-display')!;
const scoreElement = document.querySelector<HTMLParagraphElement>('#score-display')!;
const inputField = document.querySelector<HTMLInputElement>('#answer-input')!;
const categorySelect = document.querySelector<HTMLSelectElement>('#category-select')!;
const soloBtn = document.querySelector<HTMLButtonElement>('#solo-btn')!;
const skipBtn = document.querySelector<HTMLButtonElement>('#skip-btn')!;
const restartBtn = document.querySelector<HTMLButtonElement>('#restart-btn')!;

// 3. FUZZY SEARCH (Fuse.js)
function isCorrect(userInput: string) {
  const currentItem = activeQuizData[currentIndex];
  if (!currentItem) return false;
  const fuse = new Fuse([currentItem], {
    keys: ['answer'],
    threshold: 0.3 
  });
  return fuse.search(userInput).length > 0;
}

function loadPhoto() {
  if (currentIndex < activeQuizData.length) {
    imgElement.src = activeQuizData[currentIndex].url;
  } else {
    endGame("Category Cleared!");
  }
}

function startTimer() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (!isPaused && timeLeft > 0) {
      timeLeft--;
      timerElement.innerText = `Time: ${timeLeft}s`;
    } else if (timeLeft <= 0) {
      endGame("Out of time!");
    }
  }, 1000);
}

function endGame(msg: string) {
  clearInterval(gameInterval);
  gameScreen.style.display = 'none';
  resultsScreen.style.display = 'block';
  const finalScoreDisplay = document.querySelector<HTMLSpanElement>('#final-score')!;
  finalScoreDisplay.innerHTML = `Score: ${score} <br> Total Mistakes: ${wrongAnswersCount}`;
}

// 4. EVENT LISTENERS
soloBtn.addEventListener('click', () => {
  const choice = categorySelect.value;
  activeQuizData = choice === "All" 
    ? [...allQuizData] 
    : allQuizData.filter(item => item.category === choice);

  currentIndex = 0;
  score = 0;
  wrongAnswersCount = 0;
  timeLeft = 60;
  isPaused = false;
  
  menuScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  loadPhoto();
  startTimer();
});

skipBtn.addEventListener('click', () => {
  timeLeft = Math.max(0, timeLeft - 10);
  timerElement.innerText = `Time: ${timeLeft}s`;
  currentIndex++; 
  inputField.value = "";
  isPaused = false;
  loadPhoto();
});

restartBtn.addEventListener('click', () => {
  location.reload(); 
});

inputField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const userAnswer = inputField.value.trim();
    if (userAnswer.length === 0) return;

    if (isCorrect(userAnswer)) {
      isPaused = true;
      score += 10;
      scoreElement.innerText = `Score: ${score}`;
      inputField.style.backgroundColor = "#d4edda";

      setTimeout(() => {
        currentIndex++;
        inputField.value = "";
        inputField.style.backgroundColor = "";
        isPaused = false;
        loadPhoto();
      }, 1200);
    } else {
      wrongAnswersCount++;
      inputField.style.backgroundColor = "#f8d7da";
      setTimeout(() => {
        inputField.style.backgroundColor = "";
        inputField.value = ""; 
      }, 500);
    }
  }
});