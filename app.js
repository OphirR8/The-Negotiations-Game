let timerInterval;
let secondsElapsed = 0;
let tacticsData = [];
let allScenarios = [];
let currentScenarioIndex = 0;
let score = 0;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  return `Time: ${minutes.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`;
}

fetch('data/tactics.json')
  .then((response) => response.json())
  .then((data) => {
    tacticsData = data;
  })
  .catch((error) => console.error('Error loading tactics data:', error));

function flattenScenarios() {
  allScenarios = [];
  tacticsData.forEach((tactic) => {
    tactic.scenarios.forEach((scenario) => {
      allScenarios.push({
        tacticID: tactic.tacticID,
        tactic: tactic.tactic,
        scenarioID: scenario.scenarioID,
        scenario: scenario.scenario,
        correctOption: scenario.correctOption,
        wrongOptions: scenario.wrongOptions,
      });
    });
  });
}

function shuffleScenarios() {
  for (let i = allScenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
  }
}

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
  const isCorrect = selectedOption === scenarioObj.correctOption;

  if (isCorrect) {
    score += 10;
  }

  document.getElementById('score').textContent = `Score: ${score}`;
  currentScenarioIndex++;
  loadScenario();
}

function endGame() {
  clearInterval(timerInterval);
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

function showLearnPage() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('learn-page').classList.remove('hidden');
  loadTactics();
}

function loadTactics() {
  const tacticList = document.getElementById('tactic-list');
  tacticList.innerHTML = '';
  tacticsData.forEach((tacticObj) => {
    const tacticDiv = document.createElement('div');
    tacticDiv.innerHTML = `
      <h3>${tacticObj.tactic}</h3>
      <p>${tacticObj.description}</p>
      <p><strong>Purpose:</strong> ${tacticObj.purpose}</p>
    `;
    tacticList.appendChild(tacticDiv);
  });
}

function backToMenu() {
  document.getElementById('learn-page').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}
