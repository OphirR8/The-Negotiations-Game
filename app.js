// Variables to keep track of game state
let timerInterval;
let secondsElapsed = 0;
let tacticsData = [];
let currentTacticIndex = 0;
let currentDifficulty = 'Easy'; // Can be 'Easy', 'Medium', or 'Hard'
let score = 0;

// Function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    return `Time: ${minutes.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`;
}

// Fetch tactics data from JSON file
fetch('data/tactics.json')
  .then(response => response.json())
  .then(data => {
    tacticsData = data;
    console.log('Tactics Data Loaded:', tacticsData);
  })
  .catch(error => console.error('Error loading tactics data:', error));

function showDifficultySelection() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('difficulty-selection').classList.remove('hidden');
}

function selectDifficulty(difficulty) {
  currentDifficulty = difficulty;
  document.getElementById('difficulty-selection').classList.add('hidden');
  startGame();
}

// Function to start the game
function startGame() {
  // Hide main menu or difficulty selection
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('difficulty-selection').classList.add('hidden');
  // Show game screen
  document.getElementById('game-screen').classList.remove('hidden');
  // Reset variables
  currentTacticIndex = 0;
  score = 0;
  secondsElapsed = 0;
  document.getElementById('timer').textContent = formatTime(secondsElapsed);
  // Start timer
  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
  }, 1000);
  // Load first tactic after ensuring data is loaded
  if (tacticsData.length > 0) {
    loadTactic();
  } else {
    // Wait for data to load
    setTimeout(() => {
      loadTactic();
    }, 500);
  }
}

// Function to load a tactic
function loadTactic() {
  if (currentTacticIndex < tacticsData.length) {
    const tacticObj = tacticsData[currentTacticIndex];
    document.getElementById('scenario').textContent = tacticObj.scenario;
    loadOptions(tacticObj);
  } else {
    endGame();
  }
}

function loadOptions(tacticObj) {
  const levelData = tacticObj.levels[currentDifficulty];
  const options = [
    levelData.correctOption,
    ...levelData.wrongOptions
  ];
  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.getElementById('tactic-options');
  optionsContainer.innerHTML = '';
  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => selectOption(option, tacticObj);
    optionsContainer.appendChild(button);
  });
}

function selectOption(selectedOption, tacticObj) {
  const levelData = tacticObj.levels[currentDifficulty];
  const isCorrect = selectedOption === levelData.correctOption;

  if (isCorrect) {
    score += 10; // Adjust scoring as desired
  }

  // Show feedback
  showFeedback(isCorrect, levelData.explanation);

  // Move to the next tactic after a delay
  currentTacticIndex++;
  setTimeout(() => {
    document.getElementById('feedback').classList.add('hidden');
    loadTactic();
  }, 5000);
}

// Function to show feedback
function showFeedback(isCorrect, explanation) {
  const feedbackElement = document.getElementById('feedback');
  feedbackElement.classList.remove('hidden', 'correct', 'incorrect');
  if (isCorrect) {
    feedbackElement.classList.add('correct');
    feedbackElement.innerHTML = `<p><strong>Correct!</strong> ${explanation}</p>`;
  } else {
    feedbackElement.classList.add('incorrect');
    feedbackElement.innerHTML = `<p><strong>Incorrect.</strong> ${explanation}</p>`;
  }
}

// Function to end the game
function endGame() {
  clearInterval(timerInterval);
  // Save score if it's a high score
  saveHighScore();
  // Hide game screen
  document.getElementById('game-screen').classList.add('hidden');
  // Show high scores
  showHighScores();
}

// Function to save high score
function saveHighScore() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const newScore = {
    score: score,
    time: secondsElapsed,
    date: new Date().toLocaleDateString()
  };
  highScores.push(newScore);
  // Sort and keep top 5
  highScores.sort((a, b) => b.score - a.score || a.time - b.time);
  highScores.splice(5);
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

// Function to show high scores
function showHighScores() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('high-scores').classList.remove('hidden');
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const scoreList = document.getElementById('score-list');
  scoreList.innerHTML = '';
  highScores.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `#${index + 1} - Score: ${entry.score}, Time: ${formatTime(entry.time)}, Date: ${entry.date}`;
    scoreList.appendChild(li);
  });
}

// Function to show the learn page
function showLearnPage() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics(); // Make sure this function is called
}


// Function to load tactics into the Learn page
function loadTactics() {
  const tacticList = document.getElementById('tactic-list');
  tacticList.innerHTML = '';
  tacticsData.forEach(tacticObj => {
    const tacticDiv = document.createElement('div');
    tacticDiv.className = 'tactic';
    tacticDiv.innerHTML = `
      <h3>${tacticObj.tactic}</h3>
      <p><strong>Description:</strong> ${tacticObj.description}</p>
      <p><strong>Purpose:</strong> ${tacticObj.purpose}</p>
      <p><strong>Example Scenario:</strong> ${tacticObj.example.scenario}</p>
      <p><strong>Example Response:</strong> ${tacticObj.example.response}</p>
      <p><strong>Outcome:</strong> ${tacticObj.example.outcome}</p>
    `;
    tacticList.appendChild(tacticDiv);
  });
}


// Function to go back to the main menu
function backToMenu() {
  // Hide all other screens
  document.getElementById('learn-page').classList.add('hidden');
  document.getElementById('high-scores').classList.add('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  // Show main menu
  document.getElementById('main-menu').classList.remove('hidden');
}
