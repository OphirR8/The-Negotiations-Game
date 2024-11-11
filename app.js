// Variables to keep track of game state
let timerInterval;
let secondsElapsed = 0;
let tacticsData = [];
let allScenarios = [];
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
fetch('./data/tactics.json')
  .then((response) => response.json())
  .then((data) => {
    tacticsData = data;
    console.log('Tactics Data Loaded:', tacticsData);
  })
  .catch((error) => console.error('Error loading tactics data:', error));

// Function to flatten all scenarios into a single array with a unique key
function flattenScenarios() {
  allScenarios = [];
  tacticsData.forEach((tactic) => {
    tactic.scenarios.forEach((scenario) => {
      allScenarios.push({
        uniqueID: `${tactic.tacticID}-${scenario.scenarioID}`, // Combine Tactic ID and Scenario ID
        tacticID: tactic.tacticID,
        scenarioID: scenario.scenarioID,
        tactic: tactic.tactic,
        description: tactic.description,
        purpose: tactic.purpose,
        example: tactic.example,
        ...scenario, // Spread scenario properties
      });
    });
  });
  shuffleScenarios();
}

// Shuffle the scenarios array
function shuffleScenarios() {
  for (let i = allScenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
  }
}

// Start the game
function startGame() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  currentScenarioIndex = 0;
  score = 0;
  secondsElapsed = 0;
  document.getElementById('timer').textContent = formatTime(secondsElapsed);
  document.getElementById('score').textContent = `Score: ${score}`;

  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
  }, 1000);

  function waitForDataAndStart() {
    if (tacticsData.length > 0) {
      flattenScenarios();
      shuffleScenarios();
      loadScenario();
    } else {
      setTimeout(waitForDataAndStart, 100);
    }
  }
  waitForDataAndStart();
}

// Load a scenario
function loadScenario() {
  if (currentScenarioIndex < allScenarios.length) {
    const scenarioObj = allScenarios[currentScenarioIndex];
    document.getElementById('scenario').textContent = scenarioObj.scenario;
    loadOptions(scenarioObj);
  } else {
    endGame();
  }
}

// Load answer options
function loadOptions(scenarioObj) {
  const options = [scenarioObj.correctOption, ...scenarioObj.wrongOptions];
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

// Handle answer selection
function selectOption(selectedOption, scenarioObj) {
  const isCorrect = selectedOption === scenarioObj.correctOption;

  if (isCorrect) {
    score += 10;
  }

  document.getElementById('score').textContent = `Score: ${score}`;
  showFeedback(isCorrect, scenarioObj);

  currentScenarioIndex++;
  setTimeout(() => {
    document.getElementById('feedback').classList.add('hidden');
    loadScenario();
  }, 3000);
}

// Show feedback
function showFeedback(isCorrect, scenarioObj) {
  const feedbackElement = document.getElementById('feedback');
  feedbackElement.classList.remove('hidden');
  feedbackElement.textContent = isCorrect
    ? 'Correct!'
    : `Incorrect. The correct answer was: ${scenarioObj.correctOption}`;
}

// End the game
function endGame() {
  clearInterval(timerInterval);
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

// Learn Page
function showLearnPage() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics();
}

// Load tactics into Learn page
function loadTactics() {
  const tacticList = document.getElementById('tactic-list');
  tacticList.innerHTML = '';
  tacticsData.forEach((tactic) => {
    const tacticDiv = document.createElement('div');
    tacticDiv.className = 'tactic';
    tacticDiv.innerHTML = `
      <h3>${tactic.tactic}</h3>
      <p><strong>Description:</strong> ${tactic.description}</p>
      <p><strong>Purpose:</strong> ${tactic.purpose}</p>
      <p><strong>Example:</strong> ${tactic.example.scenario}</p>
      <p><strong>Response:</strong> ${tactic.example.response}</p>
      <p><strong>Outcome:</strong> ${tactic.example.outcome}</p>
    `;
    tacticList.appendChild(tacticDiv);
  });
}

// Return to menu
function backToMenu() {
  document.getElementById('learn-page').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}
