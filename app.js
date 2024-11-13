// Variables to keep track of game state
let timerInterval;
let secondsElapsed = 0;
let tacticsData = [];
let allScenarios = [];
let currentScenarioIndex = 0;
let score = 0;

// List of tactic files
const tacticFiles = [
  './data/Tactics1-4.json',
  './data/Tactics5-9.json',
  './data/Tactics10-11.json'
];

// Function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  return `Time: ${minutes.toString().padStart(2, '0')}:${secondsPart
    .toString()
    .padStart(2, '0')}`;
}

// Function to fetch all data and start the game
function fetchDataAndStartGame() {
  console.log('Start Game button clicked');

  const filePromises = tacticFiles.map((file) =>
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error(`Error loading file ${file}:`, error);
        return []; // Return an empty array for failed fetches
      })
  );

  Promise.all(filePromises)
    .then((dataArrays) => {
      // Combine all tactic data into one array
      tacticsData = dataArrays.flat();
      console.log('All Tactics Data Loaded:', tacticsData);
      startGame(); // Start the game after all data is loaded
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
  loadScenario();
}

// Function to flatten all scenarios into a single array
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

function selectOption(selectedOption, scenarioObj) {
  console.log('Option selected:', selectedOption);
  const isCorrect = selectedOption === scenarioObj.correctOption;

  const optionsContainer = document.getElementById('tactic-options');
  Array.from(optionsContainer.children).forEach((button) => {
    if (button.textContent === selectedOption) {
      // Highlight the selected button in green if correct, red if wrong
      button.style.backgroundColor = isCorrect ? '#4caf50' : '#f44336';
      button.style.color = '#fff';
    }
    if (button.textContent === scenarioObj.correctOption) {
      // Highlight the correct answer in green
      button.style.backgroundColor = '#4caf50';
      button.style.color = '#fff';
    }
    button.disabled = true; // Disable all buttons after selection
  });

  if (isCorrect) {
    score += 10;
    console.log('Score updated to:', score);
  }

  document.getElementById('score').textContent = `Score: ${score}`;

  // Automatically load the next scenario after 0.5 seconds
  currentScenarioIndex++;
  setTimeout(() => {
    loadScenario();
  }, 800);
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

  // Save high score
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const date = new Date().toISOString().split('T')[0]; // Save only the date (YYYY-MM-DD)
  highScores.push({ score, date });
  highScores.sort((a, b) => b.score - a.score); // Sort by score
  localStorage.setItem('highScores', JSON.stringify(highScores.slice(0, 10))); // Keep top 10 scores

  alert(`Game Over!\nYour score: ${score}\nTime elapsed: ${formatTime(secondsElapsed)}`);
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}


function showHighScores() {
  console.log('High Scores button clicked');
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const scoreList = document.getElementById('score-list');
  scoreList.innerHTML = ''; // Clear existing content

  if (highScores.length === 0) {
    scoreList.innerHTML = '<p>No high scores yet. Play the game to set a record!</p>';
  } else {
    highScores.forEach((entry, index) => {
      const listItem = document.createElement('div');
      const date = new Date(entry.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      listItem.textContent = `#${index + 1} - Score: ${entry.score}, Date: ${date}`;
      listItem.style.textAlign = 'center'; // Center the text
      listItem.style.fontSize = '1.5rem'; // Make the text larger
      listItem.style.margin = '10px 0'; // Add spacing between entries
      scoreList.appendChild(listItem);
    });
  }

  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('high-scores').classList.remove('hidden');
}


// Learn Page
function showLearnPage() {
  console.log('Learn button clicked');
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics(); // Load tactics for the Learn Page
}


// Load tactics into Learn page
function loadTactics() {
  console.log('Loading tactics for Learn Page');

  // Only fetch if tacticsData is empty
  if (tacticsData.length === 0) {
    const filePromises = tacticFiles.map((file) =>
      fetch(file)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.error(`Error loading file ${file}:`, error);
          return []; // Return an empty array for failed fetches
        })
    );

    Promise.all(filePromises)
      .then((dataArrays) => {
        tacticsData = dataArrays.flat(); // Merge all tactic data
        console.log('Tactics Data Loaded for Learn Page:', tacticsData);
        renderTactics(); // Render Learn Page content after loading
      })
      .catch((error) => {
        console.error('Error loading tactics data:', error);
        alert('Failed to load tactics data. Please try again later.');
      });
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

    const header = document.createElement('h3');
    header.className = 'tactic-header';
    header.textContent = tactic.tactic;
    header.onclick = () => {
      const content = tacticDiv.querySelector('.tactic-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    };

    const content = document.createElement('div');
    content.className = 'tactic-content';
    content.style.display = 'none';

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
  document.getElementById('high-scores').classList.add('hidden'); // Ensure high scores are hidden
  document.getElementById('game-screen').classList.add('hidden'); // Ensure game screen is hidden
  document.getElementById('main-menu').classList.remove('hidden');
}

