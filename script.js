const changelogData = [
  {
    version: "1.2.0",
    date: "2023-10-28",
    title: "AFK & Offline Progression",
    notes: [
      "Added real-time AFK XP gain (1 XP/sec).",
      "Implemented offline progress calculation to earn XP while game is closed.",
      "Game now saves periodically during AFK and stores last save timestamp."
    ]
  },
  {
    version: "1.1.0",
    date: "2023-10-27",
    title: "UI Polish & Click Feedback",
    notes: [
      "UI made more compact for better viewing.",
      "Progress bar height significantly reduced (made slimmer).",
      "Added a shake animation to the 'Gain XP' button for tactile feedback."
    ]
  },
  {
    version: "1.0.1",
    date: "2023-10-26",
    title: "Gameplay Enhancements",
    notes: [
      "Leveling progression now has diminishing returns (XP requirement: level^1.5).",
      "Progress bar styling updated: square edges, gradient fill, dynamic color changes (green/yellow/red)."
    ]
  },
  {
    version: "1.0.0",
    date: "2023-10-25",
    title: "Initial Idle RPG Release",
    notes: [
      "Core click-to-gain-XP mechanic.",
      "Leveling system implemented (original XP requirement: level * 100).",
      "XP progress bar.",
      "Game progress (XP, level) saved to browser's localStorage."
    ]
  }
];
const currentGameVersion = changelogData[0].version;

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
const changelogButton = document.getElementById('changelogButton');
const changelogModal = document.getElementById('changelogModal');
const closeChangelogButton = document.getElementById('closeChangelogButton');
const changelogEntries = document.getElementById('changelogEntries');

// 2. Load Game Data
function loadGame() {
    const savedXp = localStorage.getItem('rpg_xp');
    const savedLevel = localStorage.getItem('rpg_level');
    const lastSaveTimestamp = localStorage.getItem('rpg_lastSaveTimestamp');
    const lastSeenVersion = localStorage.getItem('rpg_lastSeenVersion');

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

    // "What's New" logic
    if (lastSeenVersion === null || lastSeenVersion !== currentGameVersion) {
        let newEntriesToShow = [];
        if (lastSeenVersion === null) {
            newEntriesToShow.push(changelogData[0]); // Show latest for brand new players
        } else {
            for (const entry of changelogData) { // changelogData is newest to oldest
                if (entry.version === lastSeenVersion) break;
                newEntriesToShow.push(entry);
            }
            // To show oldest new entry first, uncomment the next line
            // newEntriesToShow.reverse(); 
        }

        if (newEntriesToShow.length > 0 && changelogModal) { // Ensure modal exists
            const modalTitleElement = changelogModal.querySelector('h2');
            if (modalTitleElement) { // Ensure title element exists
                 modalTitleElement.textContent = "What's New";
            }
            displayChangelog(newEntriesToShow); // Call with filtered entries
        }
    }
}

// 3. Save Game Data
function saveGame() {
    localStorage.setItem('rpg_xp', xp);
    localStorage.setItem('rpg_level', level);
    localStorage.setItem('rpg_lastSaveTimestamp', Date.now());
    localStorage.setItem('rpg_lastSeenVersion', currentGameVersion);
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

// Changelog Modal Logic
function displayChangelog(entriesToShow = changelogData) {
    if (!changelogEntries) return; // Guard if element doesn't exist
    changelogEntries.innerHTML = ''; // Clear previous entries

    entriesToShow.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');

        const titleH3 = document.createElement('h3');
        titleH3.textContent = `${entry.title} (v${entry.version})`;
        entryDiv.appendChild(titleH3);

        const dateP = document.createElement('p');
        dateP.textContent = `Date: ${entry.date}`;
        entryDiv.appendChild(dateP);

        const notesUl = document.createElement('ul');
        entry.notes.forEach(noteText => {
            const li = document.createElement('li');
            li.textContent = noteText;
            notesUl.appendChild(li);
        });
        entryDiv.appendChild(notesUl);
        changelogEntries.appendChild(entryDiv);
    });
    changelogModal.style.display = 'block';
}

if (changelogButton) { // Check if button exists before adding listener
    changelogButton.addEventListener('click', displayChangelog);
}

if (closeChangelogButton) { // Check if button exists
    closeChangelogButton.addEventListener('click', () => {
        if (changelogModal) {
            changelogModal.style.display = 'none';
            const modalTitleElement = changelogModal.querySelector('h2');
            if (modalTitleElement) {
                modalTitleElement.textContent = "Changelog"; // Reset title
            }
        }
    });
}

window.addEventListener('click', (event) => {
    if (event.target === changelogModal) {
        if (changelogModal) {
            changelogModal.style.display = 'none';
            const modalTitleElement = changelogModal.querySelector('h2');
            if (modalTitleElement) {
                modalTitleElement.textContent = "Changelog"; // Reset title
            }
        }
    }
});
