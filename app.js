// Variables to keep track of game state
let timerInterval;
let secondsElapsed = 0;
let tacticsData = [];
let allScenarios = []; // New array to hold all scenarios
let currentScenarioIndex = 0;
let score = 0;

// Function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  return `Time: ${minutes.toString().padStart(2, '0')}:${secondsPart
    .toString()
    .padStart(2, '0')}`;
}

// Fetch tactics data from JSON file
fetch('data/tactics.json')
  .then((response) => response.json())
  .then((data) => {
    tacticsData = data;
    console.log('Tactics Data Loaded:', tacticsData);
  })
  .catch((error) => console.error('Error loading tactics data:', error));

// Function to flatten all scenarios into a single array
function flattenScenarios() {
  allScenarios = [];
  tacticsData.forEach((tactic) => {
    tactic.scenarios.forEach((scenario) => {
      // Attach the tactic information to each scenario
      allScenarios.push({
        tacticID: tactic.tacticID,
        tactic: tactic.tactic,
        description: tactic.description,
        purpose: tactic.purpose,
        example: tactic.example,
        scenarioID: scenario.scenarioID,
        scenario: scenario.scenario,
        correctOption: scenario.correctOption,
        wrongOptions: scenario.wrongOptions,
        explanation: tactic.explanation, // Assuming explanation is the same for all scenarios of a tactic
      });
    });
  });
}

// Function to shuffle the scenarios array
function shuffleScenarios() {
  for (let i = allScenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
  }
}

function startGame() {
  // Hide main menu
  document.getElementById('main-menu').classList.add('hidden');
  // Show game screen
  document.getElementById('game-screen').classList.remove('hidden');
  // Reset variables
  currentScenarioIndex = 0;
  score = 0;
  secondsElapsed = 0;
  document.getElementById('timer').textContent = formatTime(secondsElapsed);
  document.getElementById('score').textContent = `Score: ${score}`;

  // Start timer
  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
  }, 1000);

  // Wait until tacticsData is loaded before proceeding
  function waitForDataAndStart() {
    if (tacticsData.length > 0) {
      // Data is loaded, flatten and shuffle scenarios
      flattenScenarios();
      shuffleScenarios();
      loadScenario();
    } else {
      // Data not yet loaded, wait and try again
      setTimeout(waitForDataAndStart, 100);
    }
  }

  waitForDataAndStart();
}

// Function to load a scenario
function loadScenario() {
  if (currentScenarioIndex < allScenarios.length) {
    const scenarioObj = allScenarios[currentScenarioIndex];
    document.getElementById('scenario').textContent = scenarioObj.scenario;
    loadOptions(scenarioObj);
  } else {
    endGame();
  }
}

function loadOptions(scenarioObj) {
  const options = [scenarioObj.correctOption, ...scenarioObj.wrongOptions];
  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.getElementById('tactic-options');
  optionsContainer.innerHTML = '';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => selectOption(option, scenarioObj);
    optionsContainer.appendChild(button);
  });
}

function selectOption(selectedOption, scenarioObj) {
  // Normalize the selected option and correct option
  const normalizeString = (str) => {
    return str
      .trim()
      .replace(/[“”‘’]/g, '"') // Replace curly quotes with straight quotes
      .replace(/[–—]/g, '-') // Replace en-dashes and em-dashes with hyphens
      .toLowerCase();
  };

  const normalizedSelectedOption = normalizeString(selectedOption);
  const normalizedCorrectOption = normalizeString(scenarioObj.correctOption);

  const isCorrect = normalizedSelectedOption === normalizedCorrectOption;

  if (isCorrect) {
    score += 10; // Adjust scoring as desired
  }

  // Update score display regardless of whether the answer is correct
  document.getElementById('score').textContent = `Score: ${score}`;

  // Show feedback
  showFeedback(isCorrect, scenarioObj.explanation);

  // Move to the next scenario after a delay
  currentScenarioIndex++;
  setTimeout(() => {
    document.getElementById('feedback').classList.add('hidden');
    loadScenario();
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
    date: new Date().toLocaleDateString(),
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
    li.textContent = `#${index + 1} - Score: ${entry.score}, Time: ${formatTime(
      entry.time
    )}, Date: ${entry.date}`;
    scoreList.appendChild(li);
  });
}

// Function to show the learn page
function showLearnPage() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics(); // Ensure this function is called
}

// Function to load tactics into the Learn page
function loadTactics() {
  const tacticList = document.getElementById('tactic-list');
  tacticList.innerHTML = '';
  tacticsData.forEach((tacticObj) => {
    const tacticDiv = document.createElement('div');
    tacticDiv.className = 'tactic';
    tacticDiv.innerHTML = `
      <h3>${tacticObj.tactic}</h3>
      <p><strong>Description:</strong> ${tacticObj.description}</p>
      <p><strong>Purpose:</strong> ${tacticObj.purpose}</p>
    `;

    // Add scenarios
    tacticObj.scenarios.forEach((scenarioObj) => {
      const scenarioDiv = document.createElement('div');
      scenarioDiv.className = 'scenario';
      scenarioDiv.innerHTML = `
        <p class="indented"><strong>Scenario ${scenarioObj.scenarioID}:</strong> ${scenarioObj.scenario}</p>
        <p class="indented"><strong>Correct Response:</strong> ${scenarioObj.correctOption}</p>
        <p class="indented"><strong>Wrong Options:</strong> ${scenarioObj.wrongOptions.join('; ')}</p>
      `;
      tacticDiv.appendChild(scenarioDiv);
    });

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
