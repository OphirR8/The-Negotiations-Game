let timerInterval;
let secondsElapsed = 0;
let tacticsData = [];
let currentScenarioIndex = 0;
let score = 0;

// Load Tactics Data
fetch('data/tactics.json')
  .then((response) => response.json())
  .then((data) => {
    tacticsData = data;
    console.log("Tactics data loaded:", data);
  })
  .catch((error) => console.error("Error loading tactics.json:", error));

function startGame() {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  resetGame();
}

function resetGame() {
  score = 0;
  secondsElapsed = 0;
  currentScenarioIndex = 0;
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("timer").textContent = `Time: 00:00`;

  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById("timer").textContent = `Time: ${formatTime(secondsElapsed)}`;
  }, 1000);

  loadScenario();
}

function loadScenario() {
  if (currentScenarioIndex >= tacticsData.length) {
    endGame();
    return;
  }

  const scenario = tacticsData[currentScenarioIndex];
  document.getElementById("scenario").textContent = scenario.scenario;

  const options = [scenario.correctOption, ...scenario.wrongOptions];
  shuffleArray(options);

  const optionsContainer = document.getElementById("tactic-options");
  optionsContainer.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => selectOption(option, scenario);
    optionsContainer.appendChild(button);
  });
}

function selectOption(selectedOption, scenario) {
  const feedback = document.getElementById("feedback");
  feedback.classList.remove("hidden");

  if (selectedOption === scenario.correctOption) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
    score += 10;
  } else {
    feedback.textContent = "Incorrect.";
    feedback.style.color = "red";
  }

  document.getElementById("score").textContent = `Score: ${score}`;

  setTimeout(() => {
    feedback.classList.add("hidden");
    currentScenarioIndex++;
    loadScenario();
  }, 2000);
}

function endGame() {
  clearInterval(timerInterval);
  alert(`Game over! Your final score is: ${score}`);
  backToMe
