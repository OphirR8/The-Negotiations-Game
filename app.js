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

// Function to fetch data and start the game
function fetchDataAndStartGame() {
  fetch('./data/tactics.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log('Fetch response:', response);
      return response.json();
    })
    .then((data) => {
      tacticsData = data;
      console.log('Tactics Data Loaded:', tacticsData);
      startGame(); // Start the game after data is loaded
    })
    .catch((error) => {
      console.error('Error loading tactics data:', error);
      alert('Failed to load game data. Please try again later.');
    });
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

  flattenScenarios();
  shuffleScenarios();
  loadScenario();
}

// Function to flatten all scenarios into a single array with a unique key
function flattenScenarios() {
  allScenarios = [];
  tacticsData.forEach((tactic, index) => {
    console.log(`Processing Tactic ${index + 1}:`, tactic.tactic);
    tactic.scenarios.forEach((scenario) => {
      allScenarios.push({
        ...scenario,
        tacticID: tactic.tacticID,
        tactic: tactic.tactic,
        description: tactic.description,
        purpose: tactic.purpose,
        example: tactic.example,
      });
    });
  });
  console.log('Flattened Scenarios:', allScenarios);
  console.log('Total Scenarios:', allScenarios.length);
  shuffleScenarios();
}

// Shuffle the scenarios array
function shuffleScenarios() {
  for (let i = allScenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
  }
}

// Load a scenario
function loadScenario() {
  if (currentScenarioIndex < allScenarios.length) {
    const scenarioObj = allScenarios[currentScenarioIndex];
    if (!scenarioObj) {
      console.error('Scenario object is undefined at index:', currentScenarioIndex);
      endGame();
      return;
    }
    document.getElementById('scenario').textContent = scenarioObj.scenario;
    loadOptions(scenarioObj);
  } else {
    endGame();
  }
}

// Load answer options
function loadOptions(scenarioObj) {
  if (!scenarioObj.correctOption || !scenarioObj.wrongOptions) {
    console.error('Missing correctOption or wrongOptions in scenario:', scenarioObj);
    return;
  }
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
  alert(`Game Over!\nYour score: ${score}\nTime elapsed: ${formatTime(secondsElapsed)}`);
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

// Learn Page
function showLearnPage() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics();
}

// Load tactics into Learn page with collapsible design
function loadTactics() {
  if (tacticsData.length === 0) {
    // Data not loaded yet, fetch it
    fetch('./data/tactics.json')
      .then((response) => response.json())
      .then((data) => {
        tacticsData = data;
        renderTactics();
      })
      .catch((error) => console.error('Error loading tactics data:', error));
  } else {
    renderTactics();
  }
}

function renderTactics() {
  const tacticList = document.getElementById('tactic-list');
  tacticList.innerHTML = ''; // Clear existing content

  tacticsData.forEach((tactic) => {
    const tacticDiv = document.createElement('div');
    tacticDiv.className = 'tactic';

    // Create the header for the tactic
    const header = document.createElement('h3');
    header.className = 'tactic-header';
    header.textContent = tactic.tactic;
    header.onclick = () => {
      const content = tacticDiv.querySelector('.tactic-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    };

    // Create the collapsible content
    const content = document.createElement('div');
    content.className = 'tactic-content';
    content.style.display = 'none'; // Initially hidden
    content.innerHTML = `
      <p><strong>Description:</strong> ${tactic.description}</p>
      <p><strong>Purpose:</strong> ${tactic.purpose}</p>
      <p><strong>Example:</strong></p>
      <p class="indented"><strong>Scenario:</strong> ${tactic.example.scenario}</p>
      <p class="indented"><strong>Response:</strong> ${tactic.example.response}</p>
      <p class="indented"><strong>Outcome:</strong> ${tactic.example.outcome}</p>
    `;

    tacticDiv.appendChild(header);
    tacticDiv.appendChild(content);
    tacticList.appendChild(tacticDiv);
  });
}

// Return to menu
function backToMenu() {
  document.getElementById('learn-page').classList.add('hidden');
  document.getElementById('high-scores').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

// High Scores (Placeholder function)
function showHighScores() {
  alert('High Scores feature is under development.');
}
