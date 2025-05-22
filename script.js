// 1. Initialization
let xp = 0;
let level = 1;
let xpToNextLevel = 100;

const levelDisplay = document.getElementById('levelDisplay');
const xpDisplay = document.getElementById('xpDisplay');
const progressBar = document.getElementById('progressBar');
const gainXpButton = document.getElementById('gainXpButton');

// 2. Load Game Data
function loadGame() {
    const savedXp = localStorage.getItem('rpg_xp');
    const savedLevel = localStorage.getItem('rpg_level');

    if (savedXp !== null && savedLevel !== null) {
        xp = parseInt(savedXp, 10);
        level = parseInt(savedLevel, 10);
    } else {
        xp = 0;
        level = 1;
    }
    xpToNextLevel = Math.floor(100 * Math.pow(level, 1.5));
    updateDisplay();
}

// 3. Save Game Data
function saveGame() {
    localStorage.setItem('rpg_xp', xp);
    localStorage.setItem('rpg_level', level);
}

// 4. Update Display
function updateDisplay() {
    levelDisplay.textContent = "Level: " + level;
    xpDisplay.textContent = "XP: " + xp + " / " + xpToNextLevel;
    const progressPercentage = (xp / xpToNextLevel) * 100;
    progressBar.style.width = progressPercentage + "%";

    // Remove existing dynamic color classes
    progressBar.classList.remove('progress-low', 'progress-medium', 'progress-high');

    // Add the appropriate class based on progressPercentage
    if (progressPercentage >= 90) {
        progressBar.classList.add('progress-high');
    } else if (progressPercentage >= 70) {
        progressBar.classList.add('progress-medium');
    } else {
        progressBar.classList.add('progress-low');
    }
}

// 6. Level Up
function checkLevelUp() {
    if (xp >= xpToNextLevel) {
        level++;
        xp = xp - xpToNextLevel; // Carry over excess XP
        xpToNextLevel = Math.floor(100 * Math.pow(level, 1.5));
        updateDisplay(); // Update display after level up before checking again
        checkLevelUp(); // Recursively check for multiple level ups
    }
}

// 5. Gain XP
gainXpButton.addEventListener('click', () => {
    xp += 1; // Increment xp by 1
    checkLevelUp();
    updateDisplay();
    saveGame();
});

// 7. Initial Game Load
loadGame();
