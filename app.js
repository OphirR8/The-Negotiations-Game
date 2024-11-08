// Variables to keep track of game state
let timerInterval;
let secondsElapsed = 0;

// Function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    return `Time: ${minutes.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`;
}

// Function to start the game
function startGame() {
    // Hide main menu
    document.getElementById('main-menu').classList.add('hidden');
    // Show game screen
    document.getElementById('game-screen').classList.remove('hidden');
    // Reset timer
    secondsElapsed = 0;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
    // Start timer
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = formatTime(secondsElapsed);
    }, 1000);
    // Load first scenario
    loadScenario();
}

let scenarios = [];
let currentScenarioIndex = 0;
let score = 0;

// Fetch scenarios from JSON file
fetch('data/scenarios.json')
    .then(response => response.json())
    .then(data => {
        scenarios = data;
    })
    .catch(error => console.error('Error loading scenarios:', error));

// Function to load a scenario
function loadScenario() {
    if (currentScenarioIndex < scenarios.length) {
        const scenarioObj = scenarios[currentScenarioIndex];
        document.getElementById('scenario').textContent = scenarioObj.scenario;
        loadTacticOptions(scenarioObj);
    } else {
        endGame();
    }
}

// Function to load tactic options
function loadTacticOptions(scenarioObj) {
    const tacticContainer = document.getElementById('tactic-options');
    tacticContainer.innerHTML = '';
    scenarioObj.tactics.forEach(tactic => {
        const button = document.createElement('button');
        button.textContent = tactic;
        button.onclick = () => selectTactic(tactic, scenarioObj);
        tacticContainer.appendChild(button);
    });
}
// Function to handle tactic selection
function selectTactic(selectedTactic, scenarioObj) {
    const isCorrectTactic = selectedTactic === scenarioObj.correctTactic;
    // Store this for feedback
    scenarioObj.selectedTactic = selectedTactic;
    scenarioObj.isCorrectTactic = isCorrectTactic;
    if (isCorrectTactic) {
        score += 5; // Add points for correct tactic
    }
    // Hide tactic selection and show response selection
    document.getElementById('tactic-selection').classList.add('hidden');
    document.getElementById('response-selection').classList.remove('hidden');
    loadResponseOptions(scenarioObj);
}

// Function to load response options
function loadResponseOptions(scenarioObj) {
    const responseContainer = document.getElementById('response-options');
    responseContainer.innerHTML = '';
    scenarioObj.responses.forEach(response => {
        const button = document.createElement('button');
        button.textContent = response.text;
        button.onclick = () => selectResponse(response, scenarioObj);
        responseContainer.appendChild(button);
    });
}
// Function to handle response selection
function selectResponse(selectedResponse, scenarioObj) {
    const isCorrectResponse = selectedResponse.isCorrect;
    // Store this for feedback
    scenarioObj.selectedResponse = selectedResponse.text;
    scenarioObj.isCorrectResponse = isCorrectResponse;
    if (isCorrectResponse) {
        score += 5; // Add points for correct response
    }
    // Hide response selection and show feedback
    document.getElementById('response-selection').classList.add('hidden');
    document.getElementById('feedback').classList.remove('hidden');
    showFeedback(scenarioObj);
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
    // Load tactics (to be implemented)
}

// Function to show high scores
function showHighScores() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('high-scores').classList.remove('hidden');
    // Load high scores (to be implemented)
}

// Function to go back to the main menu
function backToMenu() {
    // Hide all other screens
    document.getElementById('learn-page').classList.add('hidden');
    document.getElementById('high-scores').classList.add('hidden');
    // Show main menu
    document.getElementById('main-menu').classList.remove('hidden');
}

// Function to show feedback
function showFeedback(scenarioObj) {
    let feedbackText = '';
    if (!scenarioObj.isCorrectTactic) {
        feedbackText += `Incorrect tactic selected. The correct tactic is ${scenarioObj.correctTactic}. ${scenarioObj.explanation.tactic}\n`;
    } else {
        feedbackText += `Correct tactic selected! ${scenarioObj.explanation.tactic}\n`;
    }
    if (!scenarioObj.isCorrectResponse) {
        feedbackText += `Incorrect response selected. ${scenarioObj.explanation.response}`;
    } else {
        feedbackText += `Correct response selected! ${scenarioObj.explanation.response}`;
    }
    document.getElementById('feedback').textContent = feedbackText;
    // Move to the next scenario after a delay
    currentScenarioIndex++;
    setTimeout(() => {
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('tactic-selection').classList.remove('hidden');
        loadScenario();
    }, 5000);
}
