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
            alert('没有找到保存数据!');
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
                    alert('存档数据加载成功!');
                    window.location.reload();
                } catch (error) {
                    alert('无效的存档文件!');
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
            alert('未找到存档数据!');
            return;
        }

        navigator.clipboard.writeText(saveData).then(() => {
            alert('存档数据已保存到剪贴板!');
        }).catch(err => {
            alert('复制到剪贴板失败: ' + err);
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
                alert('存档数据加载成功!');
                window.location.reload();
            } catch (error) {
                alert('剪贴板中的存档数据无效!');
                // Resume the interval if load fails
                currencyInterval = setInterval(updateCurrencyAndSave, 1000);
            }
        }).catch(err => {
            alert('从剪贴板读取失败: ' + err);
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
            alert(`每日只能使用1次摆脱卡死。请在 ${hoursLeft} 小时后再试.`);
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
        alert('成功重置冷却时间和货币。您可以在24小时后再次使用此功能。');

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
    });
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