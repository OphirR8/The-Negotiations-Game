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

// Function to load a scenario
function loadScenario() {
    // Placeholder text
    document.getElementById('scenario').textContent = "Scenario will appear here.";
    // Load tactic options
    loadTacticOptions();
}

// Function to load tactic options
function loadTacticOptions() {
    const tacticOptions = ['Tactic 1', 'Tactic 2', 'Tactic 3']; // Placeholder tactics
    const tacticContainer = document.getElementById('tactic-options');
    tacticContainer.innerHTML = ''; // Clear previous options
    tacticOptions.forEach(tactic => {
        const button = document.createElement('button');
        button.textContent = tactic;
        button.onclick = () => selectTactic(tactic);
        tacticContainer.appendChild(button);
    });
}

// Function to handle tactic selection
function selectTactic(tactic) {
    // Hide tactic selection
    document.getElementById('tactic-selection').classList.add('hidden');
    // Show response selection
    document.getElementById('response-selection').classList.remove('hidden');
    // Load response options
    loadResponseOptions();
}

// Function to load response options
function loadResponseOptions() {
    const responseOptions = ['Response 1', 'Response 2', 'Response 3']; // Placeholder responses
    const responseContainer = document.getElementById('response-options');
    responseContainer.innerHTML = ''; // Clear previous options
    responseOptions.forEach(response => {
        const button = document.createElement('button');
        button.textContent = response;
        button.onclick = () => selectResponse(response);
        responseContainer.appendChild(button);
    });
}

// Function to handle response selection
function selectResponse(response) {
    // Hide response selection
    document.getElementById('response-selection').classList.add('hidden');
    // Show feedback
    document.getElementById('feedback').classList.remove('hidden');
    // Placeholder feedback
    document.getElementById('feedback').textContent = "Feedback will appear here.";
    // After feedback, load next scenario or end game
    // For now, we'll just reload the tactic selection
    setTimeout(() => {
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('tactic-selection').classList.remove('hidden');
        loadScenario();
    }, 3000);
}

// Function to end the game
function endGame() {
    clearInterval(timerInterval);
    // Hide game screen
    document.getElementById('game-screen').classList.add('hidden');
    // Show high scores (we'll implement this later)
    showHighScores();
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
