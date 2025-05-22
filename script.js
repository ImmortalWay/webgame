// 1. Initialization
let xp = 0;
let level = 1;
let xpToNextLevel = 100;
const afkXpRate = 1; // XP per second
let afkSecondsCounter = 0; // To track when to save

const levelDisplay = document.getElementById('levelDisplay');
const xpDisplay = document.getElementById('xpDisplay');
const progressBar = document.getElementById('progressBar');
const gainXpButton = document.getElementById('gainXpButton');

// 2. Load Game Data
function loadGame() {
    const savedXp = localStorage.getItem('rpg_xp');
    const savedLevel = localStorage.getItem('rpg_level');
    const lastSaveTimestamp = localStorage.getItem('rpg_lastSaveTimestamp');

    if (savedXp !== null && savedLevel !== null) {
        xp = parseInt(savedXp, 10);
        level = parseInt(savedLevel, 10);
    } else {
        xp = 0;
        level = 1;
    }

    // Calculate initial xpToNextLevel for the loaded/default level
    // This is important for checkLevelUp to work correctly if offline gains cause immediate level up
    xpToNextLevel = Math.floor(100 * Math.pow(level, 1.5));

    if (lastSaveTimestamp) {
        const timePassedInMilliseconds = Date.now() - parseInt(lastSaveTimestamp, 10);
        // Ensure afkXpRate is accessible here, it's global so it's fine.
        const timePassedInSeconds = Math.floor(timePassedInMilliseconds / 1000);
        
        if (timePassedInSeconds > 0) {
            const offlineXpGained = timePassedInSeconds * afkXpRate;
            xp += offlineXpGained;
            console.log(`Welcome back! You gained ${offlineXpGained} XP while offline.`); // User feedback
        }
    }

    checkLevelUp(); // Process any level ups from offline gains
    updateDisplay(); // Update display with final loaded state
}

// 3. Save Game Data
function saveGame() {
    localStorage.setItem('rpg_xp', xp);
    localStorage.setItem('rpg_level', level);
    localStorage.setItem('rpg_lastSaveTimestamp', Date.now());
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
    // Add shake animation
    gainXpButton.classList.add('shake-animation');

    xp += 1; // Increment xp by 1
    checkLevelUp();
    updateDisplay();
    saveGame();

    // Remove shake animation after it finishes
    setTimeout(() => {
        gainXpButton.classList.remove('shake-animation');
    }, 300); // Duration matches the CSS animation
});

// AFK Progress Handling
function handleAfkProgress() {
    xp += afkXpRate;
    checkLevelUp();
    updateDisplay();

    afkSecondsCounter++;
    if (afkSecondsCounter >= 5) { // Save every 5 seconds
        saveGame();
        afkSecondsCounter = 0;
    }
}

// 7. Initial Game Load
loadGame();
setInterval(handleAfkProgress, 1000); // Run every 1000ms (1 second)
