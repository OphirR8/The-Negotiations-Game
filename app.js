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
  console.log('Start Game button clicked');
  fetch('./data/tactics.json')
    .then((response) => {
      console.log('Fetch response:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
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
  console.log('Starting game');
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
  // Removed duplicate shuffleScenarios() call to prevent double shuffling
  loadScenario();
}

// Function to flatten all scenarios into a single array with a unique key
function flattenScenarios() {
  console.log('Flattening scenarios');
  allScenarios = [];
  tacticsData.forEach((tactic, index) => {
    console.log(`Processing Tactic ${index + 1}:`, tactic.tactic);
    if (Array.isArray(tactic.scenarios)) {
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
    } else {
      console.error(`Tactic ${tactic.tacticID} has no scenarios array.`);
    }
  });
  console.log('Flattened Scenarios:', allScenarios);
  console.log('Total Scenarios:', allScenarios.length);
  shuffleScenarios();
}

// Shuffle the scenarios array
function shuffleScenarios() {
  console.log('Shuffling scenarios');
  for (let i = allScenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
  }
  console.log('Shuffled Scenarios:', allScenarios);
}

// Load a scenario
function loadScenario() {
  console.log('Loading scenario at index:', currentScenarioIndex);
  if (currentScenarioIndex < allScenarios.length) {
    const scenarioObj = allScenarios[currentScenarioIndex];
    if (!scenarioObj) {
      console.error('Scenario object is undefined at index:', currentScenarioIndex);
      endGame();
      return;
    }
    console.log('Scenario Object:', scenarioObj);
    document.getElementById('scenario').textContent = scenarioObj.scenario;
    loadOptions(scenarioObj);
  } else {
    console.log('All scenarios completed');
    endGame();
  }
}

// Load answer options
function loadOptions(scenarioObj) {
  console.log('Loading options for scenario:', scenarioObj.scenario);
  if (!scenarioObj.correctOption || !scenarioObj.wrongOptions) {
    console.error('Missing correctOption or wrongOptions in scenario:', scenarioObj);
    return;
  }
  const options = [scenarioObj.correctOption, ...scenarioObj.wrongOptions];
  options.sort(() => Math.random() - 0.5);
  console.log('Shuffled Options:', options);

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
  console.log('Option selected:', selectedOption);
  const isCorrect = selectedOption === scenarioObj.correctOption;
  console.log('Is Correct:', isCorrect);

  if (isCorrect) {
    score += 10;
    console.log('Score updated to:', score);
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
  console.log('Feedback shown:', feedbackElement.textContent);
}

// End the game
function endGame() {
  console.log('Ending game');
  clearInterval(timerInterval);
  alert(`Game Over!\nYour score: ${score}\nTime elapsed: ${formatTime(secondsElapsed)}`);
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

// Learn Page
function showLearnPage() {
  console.log('Learn button clicked');
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics();
}

// Load tactics into Learn page with collapsible design
function loadTactics() {
  console.log('Loading tactics for Learn Page');
  if (tacticsData.length === 0) {
    // Data not loaded yet, fetch it
    console.log('Tactics data is empty, fetching data for Learn Page');
    fetch('./data/tactics.json')
      .then((response) => {
        console.log('Fetch response for tactics:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        tacticsData = data;
        console.log('Tactics Data Loaded for Learn Page:', tacticsData);
        renderTactics();
      })
      .catch((error) => console.error('Error loading tactics data:', error));
  } else {
    console.log('Tactics data already loaded');
    renderTactics();
  }
}

function renderTactics() {
  const tacticList = document.getElementById('tactic-list');
  tacticList.innerHTML = ''; // Clear existing content
  console.log('Rendering tactics');

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

    // Handle 'example.response' as a string
    let exampleResponse = tactic.example.response;
    if (Array.isArray(tactic.example.response)) {
      exampleResponse = tactic.example.response.join(' ');
    }

    content.innerHTML = `
      <p><strong>Description:</strong> ${tactic.description}</p>
      <p><strong>Purpose:</strong> ${tactic.purpose}</p>
      <p><strong>Example:</strong></p>
      <p class="indented"><strong>Scenario:</strong> ${tactic.example.scenario}</p>
      <p class="indented"><strong>Response:</strong> ${exampleResponse}</p>
      <p class="indented"><strong>Outcome:</strong> ${tactic.example.outcome}</p>
    `;

    tacticDiv.appendChild(header);
    tacticDiv.appendChild(content);
    tacticList.appendChild(tacticDiv);
  });
}

// Return to menu
function backToMenu() {
  console.log('Back to Menu button clicked');
  document.getElementById('learn-page').classList.add('hidden');
  document.getElementById('high-scores').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

// High Scores (Placeholder function)
function showHighScores() {
  console.log('High Scores button clicked');
  alert('High Scores feature is under development.');
}
