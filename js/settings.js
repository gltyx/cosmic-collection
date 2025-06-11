// Settings tab functionality
function initializeSettingsTab() {
    const resetGameButton = document.getElementById('resetGameButton');
    const resetWarningModal = document.getElementById('resetWarningModal');
    const confirmResetButton = document.getElementById('confirmResetButton');
    const cancelResetButton = document.getElementById('cancelResetButton');
    const darkThemeToggle = document.getElementById('darkThemeToggle');
    const getUnstuckBtn = document.getElementById('getUnstuckBtn');

    // Save/Load buttons
    const saveToFileBtn = document.getElementById('saveToFileBtn');
    const loadFromFileBtn = document.getElementById('loadFromFileBtn');
    const saveToClipboardBtn = document.getElementById('saveToClipboardBtn');
    const loadFromClipboardBtn = document.getElementById('loadFromClipboardBtn');

    // Community & Support buttons
    const discordButton = document.getElementById('discordButton');
    const donationButton = document.getElementById('donationButton');
    const supporterCheckbox = document.getElementById('supporterCheckbox');
    const supporterCheckboxContainer = document.getElementById('supporterCheckboxContainer');
    
    // Game tips button
    const gameTipsBtn = document.getElementById('gameTipsBtn');

    // Create game tips modal
    const gameTipsModal = document.createElement('div');
    gameTipsModal.id = 'gameTipsModal';
    gameTipsModal.className = 'modal-overlay';
    gameTipsModal.style.display = 'none';
    gameTipsModal.innerHTML = `
        <div class="modal-content tips-modal-content">
            <h2>Game Tips</h2>
            <div class="tips-section">
                <h3>Early Game Tips</h3>
                <ul>
                    <li><strong>Realm Filters:</strong> The "Per Poke" reward is not affected by realm filter selections. Early on, choosing only Rocks (and later any combination of realms with short cooldown) will speed up resource production for active play.</li>
                    <li><strong>Purchase Order Matters:</strong> Focus resource spending on skills and card effects that are most helpful to you.</li>
                    <li><strong>Offline Production:</strong> Don't underestimate offline resource production!
                        <ul>
                            <li>Before going offline, do a poke with a longer cooldown that's more likely to get you new cards.</li>
                        </ul>
                    </li>
                    <li><strong>Odds Reduction Effects:</strong> These may seem small at first, but they scale linearly with card level and exponentially with card tier. They also stack multiplicatively with other cards having the same effect!</li>
                    <li><strong>Merchant Refresh:</strong> Purchasing all merchant cards reduces time until the merchant leaves.</li>
                </ul>
            </div>
            <div class="tips-section">
                <h3>Early-Mid Game Tips</h3>
                <ul>
                    <li><strong>Absorber (bottom right):</strong> A good strategy is to charge with quick cooldowns and use on long cooldowns.</li>
                    <li><strong>Stuck before Mythical Beasts?:</strong> The easiest way to get the Rune resource is to unlock Fine/Rare cards from Rocks realm. Focus your resources on leveling cards that lower odds of low rarity Rocks cards (use the Odds filter in Collection), then swap to Rocks and get to poking.</li>
                    <li><strong>Interceptor (top left):</strong> Note that it charges fairly quickly by doing manual card flips (while it is not active).</li>
                    <li><strong>Interceptor & Harvester Combo:</strong> 
                        <ul>
                            <li>Interceptor (top left) and Harvester (bottom left) work great together when you've saved up some time.</li>
                            <li>Activate interceptor and spam harvester for best results.</li>
                        </ul>
                    </li>
                    <li><strong>Reference Stats Odds Tables:</strong> Target farming high rarity cards from previous realms can very quickly multiply both your income and cards per poke.</li>
                    <li><strong>Realm Deselect Multiplier:</strong> Keep in mind the deselect multiplier is only applied if a higher realm is selected.</li>
                </ul>
            </div>
            <div class="tips-section">
                <h3>To be continued...</h3>
                <p>If you are struggling with a particular aspect of the game, hop in Discord - there is a great community there to help you!</p>
                <p>On the other hand, if you have any other tips or suggestions, please also drop them in Discord and @Kuzzi to get them included in here!</p>
                <p>Lastly, be sure to refresh game regularly as updates are frequent. Announcments channel in Discord has all the latest news!</p>
            </div> 
            <div class="modal-buttons">
                <button id="closeTipsBtn" class="settings-button safe-button">Got it!</button>
            </div>
        </div>
    `;
    document.body.appendChild(gameTipsModal);

    // Create unstuck warning modal
    const unstuckWarningModal = document.createElement('div');
    unstuckWarningModal.id = 'unstuckWarningModal';
    unstuckWarningModal.className = 'unstuck-modal-overlay';
    unstuckWarningModal.style.display = 'none';
    unstuckWarningModal.innerHTML = `
        <div class="unstuck-modal-content">
            <h2>Get Unstuck</h2>
            <p>This feature is intended only for when you accidentally used realm filters with an astronomically high cooldown. This will:</p>
            <ul>
                <li>Remove any active cooldown</li>
                <li>Reset all currencies to 0</li>
                <li>Keep all your other progress</li>
            </ul>
            <p class="warning-text">This can only be used once per day!</p>
            <div class="modal-buttons">
                <button id="confirmUnstuckBtn" class="settings-button warning-button">Confirm</button>
                <button id="cancelUnstuckBtn" class="settings-button safe-button">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(unstuckWarningModal);

    // Initialize dark theme from localStorage
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        darkThemeToggle.classList.add('active');
        darkThemeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Theme';
    }

    // Dark theme toggle handler
    darkThemeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('darkTheme', isDark);
        darkThemeToggle.classList.toggle('active');
        darkThemeToggle.innerHTML = isDark ? 
            '<i class="fas fa-sun"></i> Light Theme' : 
            '<i class="fas fa-moon"></i> Dark Theme';
    });

    // Reset game button click handler
    resetGameButton.addEventListener('click', function() {
        resetWarningModal.style.display = 'flex';
    });

    // Cancel reset button click handler
    cancelResetButton.addEventListener('click', function() {
        resetWarningModal.style.display = 'none';
    });

    // Confirm reset button click handler
    confirmResetButton.addEventListener('click', function() {
        // Clear all game data from localStorage
        localStorage.removeItem('ccgSave');
        localStorage.removeItem('lastUnstuck');

        // Reload the page to restart the game
        window.location.reload();
    });

    // Save to File
    saveToFileBtn.addEventListener('click', function() {
        const saveData = localStorage.getItem('ccgSave');
        if (!saveData) {
            alert('No save data found!');
            return;
        }

        const ownedByR      = rarities.reduce((acc, r) => (acc[r] = 0, acc), {});
        cards.forEach(c => {
            if (c.quantity > 0) {
                ownedByR[c.rarity]      += c.quantity;
            }
        });
        const totalOwned      = Object.values(ownedByR).reduce((a,b) => a + b, 0);

        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cosmic-collection-save-${formatNumber(totalOwned)}-cards.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Load from File
    loadFromFileBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Pause the currency interval
            clearInterval(currencyInterval);
            clearInterval(blackHoleTimer);
            clearInterval(clearInterval(state.battle.battleInterval));

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const saveData = e.target.result;
                    // Validate the save data
                    JSON.parse(saveData);
                    localStorage.setItem('ccgSave', saveData);
                    alert('Save data loaded successfully!');
                    window.location.reload();
                } catch (error) {
                    alert('Invalid save file!');
                    // Resume the interval if load fails
                    currencyInterval = setInterval(updateCurrencyAndSave, 1000);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    });

    // Save to Clipboard
    saveToClipboardBtn.addEventListener('click', function() {
        const saveData = localStorage.getItem('ccgSave');
        if (!saveData) {
            alert('No save data found!');
            return;
        }

        navigator.clipboard.writeText(saveData).then(() => {
            alert('Save data copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy to clipboard: ' + err);
        });
    });

    // Load from Clipboard
    loadFromClipboardBtn.addEventListener('click', function() {
        // Pause the currency interval
        clearInterval(currencyInterval);
        clearInterval(blackHoleTimer);
        clearInterval(clearInterval(state.battle.battleInterval));

        navigator.clipboard.readText().then(text => {
            try {
                // Validate the save data
                JSON.parse(text);
                localStorage.setItem('ccgSave', text);
                alert('Save data loaded successfully!');
                window.location.reload();
            } catch (error) {
                alert('Invalid save data in clipboard!');
                // Resume the interval if load fails
                currencyInterval = setInterval(updateCurrencyAndSave, 1000);
            }
        }).catch(err => {
            alert('Failed to read from clipboard: ' + err);
            // Resume the interval if clipboard read fails
            currencyInterval = setInterval(updateCurrencyAndSave, 1000);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === resetWarningModal) {
            resetWarningModal.style.display = 'none';
        }
        if (event.target === unstuckWarningModal) {
            unstuckWarningModal.style.display = 'none';
        }
    });

    // Get Unstuck functionality
    getUnstuckBtn.addEventListener('click', function() {
        const now = Date.now();
        
        if (state.lastUnstuck && (now - parseInt(state.lastUnstuck)) < 24 * 60 * 60 * 1000) {
            const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (now - parseInt(state.lastUnstuck))) / (60 * 60 * 1000));
            alert(`You can only use Get Unstuck once per day. Please try again in ${hoursLeft} hours.`);
            return;
        }
        
        unstuckWarningModal.style.display = 'flex';
    });

    // Cancel unstuck
    document.getElementById('cancelUnstuckBtn').addEventListener('click', function() {
        unstuckWarningModal.style.display = 'none';
    });

    // Confirm unstuck
    document.getElementById('confirmUnstuckBtn').addEventListener('click', function() {
        // Clear cooldown
        state.remainingCooldown = 0;
        if (fillAnim) anime.remove(globalFill);
        clearInterval(blackHoleTimer);
        globalFill.style.width = '0%';

        state.selectedRealms = realms.filter(r => r.unlocked).map(r => r.id);
        renderRealmFilters();

        // Reset currencies
        Object.keys(state.currencies).forEach(key => {
            state.currencies[key] = new Decimal(0);
        });
        
        // Update UI
        updateCurrencyBar();
        holeBtn.disabled = false;
        holeBtn.classList.remove('disabled');
        
        // Save timestamp
        state.lastUnstuck = Date.now().toString();
        
        // Close modal
        unstuckWarningModal.style.display = 'none';
        
        // Show confirmation
        alert('Successfully reset cooldown and currencies. You can use this feature again in 24 hours.');

        saveState();
    });

    // Initialize card size slider
    const cardSizeSlider = document.getElementById('cardSizeSlider');
    if (cardSizeSlider) {
        // Load saved card size on startup
        if (state.cardSizeScale) {
            cardSizeSlider.value = state.cardSizeScale * 100;
            document.getElementById('cardSizeValue').textContent = Math.round(state.cardSizeScale * 100) + '%';
            updateCardSize();
        }

        cardSizeSlider.addEventListener('input', (e) => {
            state.cardSizeScale = e.target.value / 100;
            updateCardSize();
        });
    }

    // Initialize the toggle button
    const showTierUpsToggle = document.getElementById('showTierUpsToggle');
    showTierUpsToggle.classList.toggle('active', state.showTierUps);
    showTierUpsToggle.innerHTML = state.showTierUps ? 
        '<i class="fas fa-check"></i> Show Tier Ups in Collection' : 
        '<i class="fas fa-times"></i> Show Tier Ups in Collection';

    // Add click handler
    showTierUpsToggle.addEventListener('click', function() {
        state.showTierUps = !state.showTierUps;
        this.classList.toggle('active');
        this.innerHTML = state.showTierUps ? 
            '<i class="fas fa-check"></i> Show Tier Ups in Collection' : 
            '<i class="fas fa-times"></i> Show Tier Ups in Collection';
        saveState();
    });

    // Initialize auto absorber toggle
    const autoAbsorberToggle = document.getElementById('autoAbsorberToggle');
    autoAbsorberToggle.classList.toggle('active', state.autoUseAbsorber);
    autoAbsorberToggle.innerHTML = state.autoUseAbsorber ? 
        '<i class="fas fa-check"></i> Auto-Use Max Absorber' : 
        '<i class="fas fa-times"></i> Auto-Use Max Absorber';

    // Add click handler
    autoAbsorberToggle.addEventListener('click', function() {
        state.autoUseAbsorber = !state.autoUseAbsorber;
        this.classList.toggle('active');
        this.innerHTML = state.autoUseAbsorber ? 
            '<i class="fas fa-check"></i> Auto-Use Max Absorber' : 
            '<i class="fas fa-times"></i> Auto-Use Max Absorber';
        saveState();
    });    // Game tips button handler
    gameTipsBtn.addEventListener('click', function() {
        gameTipsModal.style.display = 'flex';
    });

    // Close game tips handlers
    document.getElementById('closeTipsBtn').addEventListener('click', function() {
        gameTipsModal.style.display = 'none';
    });

    // Close game tips modal when clicking outside
    gameTipsModal.addEventListener('click', function(event) {
        if (event.target === gameTipsModal) {
            gameTipsModal.style.display = 'none';
        }
    });

    // Initialize Discord button
    discordButton.addEventListener('click', () => {
        window.open('https://discord.gg/3r9HvqhCuJ', '_blank');
    });

    // Initialize Donation button
    donationButton.addEventListener('click', () => {
        window.open('https://coff.ee/ssiatkowski', '_blank');
        state.donationButtonClicked = true;
        supporterCheckboxContainer.style.display = 'block';
        saveState();
    });

    // Initialize Supporter checkbox
    supporterCheckbox.addEventListener('change', (e) => {
        state.supporterCheckboxClicked = e.target.checked;
        saveState();
    });

    // Initialize supporter checkbox state
    if (state.donationButtonClicked) {
        supporterCheckboxContainer.style.display = 'block';
        supporterCheckbox.checked = state.supporterCheckboxClicked;
    }
}

// Add this new function
function updateCardSize() {
  const holeDrawArea = document.querySelector('#tab-content-hole .draw-area');
  if (holeDrawArea) {
    holeDrawArea.style.setProperty('--card-scale', state.cardSizeScale);
  }
  
  // Update the slider and value display
  const slider = document.getElementById('cardSizeSlider');
  const valueDisplay = document.getElementById('cardSizeValue');
  if (slider && valueDisplay) {
    slider.value = state.cardSizeScale * 100;
    valueDisplay.textContent = Math.round(state.cardSizeScale * 100) + '%';
  }
}

