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
    const kuzziGamesButton = document.getElementById('kuzziGamesButton');
    const supporterCheckbox = document.getElementById('supporterCheckbox');
    const supporterCheckboxContainer = document.getElementById('supporterCheckboxContainer');
    
    // Game tips button
    const gameTipsBtn = document.getElementById('gameTipsBtn');

    // Welcome Message button
    const welcomeMessageBtn = document.getElementById('welcomeMessageBtn');

    // The End button
    const theEndBtn = document.getElementById('theEndBtn');

    // Create game tips modal
    const gameTipsModal = document.createElement('div');
    gameTipsModal.id = 'gameTipsModal';
    gameTipsModal.className = 'modal-overlay';
    gameTipsModal.style.display = 'none';
    gameTipsModal.innerHTML = `
        <div class="modal-content tips-modal-content">
            <h2>Game Tips</h2>
            <div class="tips-section">
                <h3>Basic Game Tips</h3>
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
                <h3>Intermediate Game Tips</h3>
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
                <h3>Advanced Tips</h3>
                <ul>
                    <li><strong>Achievement Hunting:</strong> Achievements provide permanent multipliers. It may sometimes be worth it to go after ones that are within reach.</li>
                    <li><strong>Secret Achievements:</strong> Try harvesting at exactly 69 seconds remaining, selecting only Aviary realm, or using absorber at exactly 3.00x three times in a row</li>
                    <li><strong>Battle Tricks:</strong> Bow vs Eros halves his attack. Eagle vs Prometheus deals 25% current HP damage. Many more hidden combinations exist</li>
                    <li><strong>Currency Optimization:</strong> Balance spending between skills, card levels, and saving for major unlocks. Prioritize skills that unlock new mechanics.</li>
                    <li><strong>Post-Sacrifice Automation:</strong> After sacrificed card lockout timer expires, the card counts as new. If you have interceptor activated, this can stack lots of automation time.</li>
                    <li><strong>Battle Card Positioning:</strong> Multiple strategies work:
                        <ul>
                            <li>Put tanky cards in front and high damage in back (gets more complex with Boss mechanics)</li>
                            <li>Use cards with "Resourceful Poke" first for highest gains from them (taking advantage of Realm Conqueror)</li>
                            <li>Use Dismember cards early to reduce enemy attack permanently</li>
                            <li>Use Weak Point cards when enemy has lots of HP for best percentage damage effect</li>
                        </ul>
                    </li>
                    <li><strong>Battle Card Filters:</strong> Use battle card filters to avoid sacrificing hard to get cards. Protect your most valuable cards!</li>
                </ul>
            </div>
            <div class="tips-section">
                <h3>For The Nerds</h3>
                    <ul>
                        <li><strong>Cooldown Formula:</strong> Sum of selected realm cooldowns × deselect multipliers (5x per skipped realm, can be reduced to 2.5x/2x with skills) ÷ cooldown divider effects</li>
                        <li><strong>Tier Thresholds:</strong> Each rarity has 20 tiers with differently increasing requirements. Full table available at bottom of Stats page (unlocks on realm 11)</li>
                        <li><strong>Black Hole Poke:</strong> The number of cards you draw is calculated using a <i>blended random formula</i> that combines both a logarithmic and a linear approach, weighted depending on your current range of possible draws.</li> 
                        <ul> 
                            <li><strong>Min and Max Draws:</strong> Your minimum and maximum possible card draws are determined by a mix of base values and bonuses from cards, skills, achievements, absorber, and global multipliers (like Kill Rewards from bosses). The hover info on Black Hole shows the ultimate min/max values, while the Stats page shows total Base/Multiplier values.</li> 
                            <li><strong>Weighted Random:</strong> The final draw amount is not a simple random number between min and max. Instead, it's a <i>weighted average between two types of randomness</i>: 
                                <ul> 
                                    <li><strong>Logarithmic Random:</strong> Favors lower numbers but still allows for high rolls.</li>
                                    <li><strong>Linear Random:</strong> Standard even chance of getting anything between min and max.</li> 
                                </ul> 
                                </li> 
                            <li><strong>How Weighting Works:</strong> The formula checks how large the gap is between your min and max draw values: <ul> 
                                <li>If the gap is very large (e.g. max/min ≥ 90), the draw heavily favors the logarithmic side (90% weight), since large ranges benefit from skewing toward more balanced results.</li> 
                                <li>If the gap is smaller, the formula uses a lower weight based on the ratio (e.g. a 10× gap = 10% log, 90% linear).</li> 
                                </ul> 
                            </li> 
                        </ul>
                        </li>
                        <li><strong>Merchant Pricing:</strong>
                        <ul>
                            <li><strong>Base price</strong>  
                            <ul>
                                <li>Currency is selected at random from unlocked currencies.</li>
                                <li>Base price = (<code>Currency Per Sec </code> × 10) + (<code>Currency Per Poke</code> × 2) * <code>Rarity multiplier</code> </li>
                                <li>Rarity multipliers:
                                <ul>
                                    <li>junk: 1</li>
                                    <li>basic: 5</li>
                                    <li>decent: 15</li>
                                    <li>fine: 50</li>
                                    <li>rare: 200</li>
                                    <li>epic: 1000</li>
                                    <li>legend: 5000</li>
                                    <li>mythic: 25000</li>
                                    <li>exotic: 100000</li>
                                    <li>divine: 500000</li>
                                </ul>
                                </li>
                            </ul>
                            </li>
                            <li><strong>Random &amp; global adjustments</strong>  
                            <ul>
                                <li>Price is then multiplied by a <code>Random Price Factor</code> between 0.01 (1%) and 1.99 (199%)</li>
                                <li>And divided by total <code>Merchant Price Divider</code></li>
                            </ul>
                            </li>
                            <li><strong>Bulk quantity (if you own > 9)</strong>  
                            <ul>
                                <li>Chance to trigger bulk offer (scaling 25%-100% with skills)
                                <li><code>Quantity Factor</code> (0-1) is selected and multiplied by <code>Max Bulk Offer</code> (scales up with skills)</li>
                                <li>Final price ×= <sup>3</sup>√(quantity)</li>
                            </ul>
                            </li>
                            <li><strong>Offer tags</strong> (for Merchant Pricing Intuition)  
                            <ul>
                                <li>Bad Offer: <code>Random Price Factor</code> > 1.6</li>
                                <li>Good Offer: <code>Random Price Factor</code> < 0.2</li>
                                <li>Great Offer: <code>Random Price Factor</code> < 0.1 AND <code>Quantity Factor</code> > 0.3</li>
                                <li>MUST BUY: <code>Random Price Factor</code> < 0.05 AND <code>Quantity Factor</code> > 0.6</li>
                            </ul>
                            </li>
                            <li><strong>Buy all discount</strong> (for Negotiation Tactics)  
                            <ul>
                                <li>Green Text: Less than 10% of your currency</li>
                                <li>Yellow Text: More than 10% of your currency</li>
                                <li>Red Text: Unaffordable</li>
                            </ul>
                            </li>
                        </ul>
                        </li>
                        <li><strong>Card Effect Scaling:</strong> Detailed formulas by effect type:
                            <ul>
                                <li><strong>Currency Per Poke/Second:</strong> base_value × level × (2<sup>(tier-1)</sup>)</li>
                                <li><strong>Min/Max Cards Per Poke:</strong> base_value × level × (1.5<sup>(tier-1)</sup>). Base value by rarity (Min/Max):</li>
                                    <ul>
                                        <li>Junk: 0.05 / 0.1</li>
                                        <li>Basic: 0.1 / 0.2</li>
                                        <li>Decent: 0.25 / 0.5</li>
                                        <li>Fine: 0.5 / 1</li>
                                        <li>Rare: 1 / 2</li>
                                        <li>Epic: 2.5 / 5</li>
                                        <li>Legend: 5 / 10</li>
                                        <li>Mythic: 10 / 20</li>
                                        <li>Exotic: 25 / 50</li>
                                        <li>Divine: 50 / 100</li>
                                    </ul>
                                </li>
                                <li><strong>Rarity Odds Divider:</strong> 0.01 × level × (1.25<sup>(tier-1)</sup>). Capped by rarity:</li>
                                    <ul>
                                        <li>Junk: 2x</li>
                                        <li>Basic: 2.5x</li>
                                        <li>Decent: 3x</li>
                                        <li>Fine: 4x</li>
                                        <li>Rare: 5x</li>
                                        <li>Epic: 6x</li>
                                        <li>Legend: 7x</li>
                                        <li>Mythic: 8x</li>
                                        <li>Exotic: 9x</li>
                                        <li>Divine: 10x</li>
                                    </ul>
                                </li>
                                <li><strong>Cooldown Divider:</strong> base_value × level × (tier × (tier+1) / 2). Base value by rarity:</li>
                                    <ul>
                                        <li>Junk: 0.0005</li>
                                        <li>Basic: 0.001</li>
                                        <li>Decent: 0.002</li>
                                        <li>Fine: 0.003</li>
                                        <li>Rare: 0.004</li>
                                        <li>Epic: 0.005</li>
                                        <li>Legend: 0.006</li>
                                        <li>Mythic: 0.007</li>
                                        <li>Exotic: 0.008</li>
                                        <li>Divine: 0.01</li>
                                    </ul>
                            </li>
                            </ul>
                        </li>
                    </ul>
                    <ul>
                        <li><strong>Realm Poke Starting Weights:</strong></li> 
                            <ul>
                                <li>Rocks: 1e11</li>
                                <li>Sea World: 8e10</li>
                                <li>Bugdom: 6e10</li>
                                <li>Aviary: 4e10</li>
                                <li>Ancient Relics: 2e10</li>
                                <li>Celestial Bodies: 1e10</li>
                                <li>Mythical Beasts: 8e9</li>
                                <li>Incremental Games: 6e9</li>
                                <li>Spirit Familiars: 4e9</li>
                                <li>Weapons: 1e9</li>
                                <li>Greek Gods: 2e8</li>
                                <li>Bosses: 1e7</li>
                            </ul>
                        <li><strong>Realm Weight Reduction:</strong> "Fleeting Realm" and "Forsaken Realm" skills reduce these weights by ÷5 each, making higher realms more likely</li>
                    </ul>
            </div>
            <div class="tips-section">
                <h3>Community & Updates</h3>
                <p>If you are struggling with a particular aspect of the game, hop in Discord - there is a great community there to help you!</p>
                <p>On the other hand, if you have any other tips or suggestions, please also drop them in Discord and @Kuzzi to get them included in here!</p>
                <p>Lastly, be sure to refresh game regularly as updates are frequent. Announcements channel in Discord has all the latest news!</p>
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

    // Function to update modal content based on cheat detector
    function updateUnstuckModalContent() {
        const cheatMessage = state.lastSelectedRealmsCheatDetector ? `
            <div class="cheat-detection-message">
                <p style="color: #ff4444; text-shadow: 0 0 4px #ff4444; font-weight: bold; animation: glow 1.5s ease-in-out infinite alternate;">
                    Did you deliberately use this to cheat?! I know you did and I'm disappointed. I'm not going to stop you because you can play the game however you want, but shame on you.
                </p>
            </div>
        ` : '';

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
                ${cheatMessage}
                <div class="modal-buttons">
                    <button id="confirmUnstuckBtn" class="settings-button warning-button">Confirm</button>
                    <button id="cancelUnstuckBtn" class="settings-button safe-button">Cancel</button>
                </div>
            </div>
        `;
    }

    // Initialize modal content
    updateUnstuckModalContent();
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

        // Update modal content based on current cheat detector state
        updateUnstuckModalContent();
        unstuckWarningModal.style.display = 'flex';
    });

    // Use event delegation for dynamically generated buttons
    unstuckWarningModal.addEventListener('click', function(e) {
        if (e.target.id === 'cancelUnstuckBtn') {
            unstuckWarningModal.style.display = 'none';
        } else if (e.target.id === 'confirmUnstuckBtn') {
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
        }
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

    // Initialize the show device hover info toggle
    const showDeviceHoverInfoToggle = document.getElementById('showDeviceHoverInfoToggle');
    showDeviceHoverInfoToggle.classList.toggle('active', state.showDeviceHoverInfo);
    showDeviceHoverInfoToggle.innerHTML = state.showDeviceHoverInfo ?
        '<i class="fas fa-check"></i> Show Device Hover Info' :
        '<i class="fas fa-times"></i> Show Device Hover Info';

    // Initialize auto absorber toggle
    const autoAbsorberToggle = document.getElementById('autoAbsorberToggle');
    autoAbsorberToggle.classList.toggle('active', state.autoUseAbsorber);
    autoAbsorberToggle.innerHTML = state.autoUseAbsorber ?
        '<i class="fas fa-check"></i> Auto-Use Max Absorber' :
        '<i class="fas fa-times"></i> Auto-Use Max Absorber';

    // Initialize skip sacrifice dialog toggle
    const skipSacrificeDialogToggle = document.getElementById('skipSacrificeDialogToggle');
    skipSacrificeDialogToggle.classList.toggle('active', state.skipSacrificeDialog);
    skipSacrificeDialogToggle.innerHTML = state.skipSacrificeDialog ?
        '<i class="fas fa-check"></i> Skip Sacrifice Dialog' :
        '<i class="fas fa-times"></i> Skip Sacrifice Dialog';

    // Initialize skip remove from battle dialog toggle
    const skipRemoveFromBattleDialogToggle = document.getElementById('skipRemoveFromBattleDialogToggle');
    skipRemoveFromBattleDialogToggle.classList.toggle('active', state.skipRemoveFromBattleDialog);
    skipRemoveFromBattleDialogToggle.innerHTML = state.skipRemoveFromBattleDialog ?
        '<i class="fas fa-check"></i> Skip Battle Remove Confirm' :
        '<i class="fas fa-times"></i> Skip Battle Remove Confirm';

    // Show skip sacrifice dialog toggle only if realms[10] is unlocked (Weapons realm)
    if (realms[10].unlocked) {
        skipSacrificeDialogToggle.style.display = 'flex';
        skipRemoveFromBattleDialogToggle.style.display = 'flex';
    }

    // Initialize currency spending control
    const currencySpendingControl = document.getElementById('currencySpendingControl');
    const currencySpendingSlider = document.getElementById('currencySpendingSlider');
    const currencySpendingValue = document.getElementById('currencySpendingValue');

    // Show currency spending control only if skill 25003 is purchased
    if (skillMap[25003] && skillMap[25003].purchased) {
        currencySpendingControl.style.display = 'flex';
    }

    // Initialize slider value
    const displayPercent = state.currencySpendingPercentage * 100;
    currencySpendingSlider.value = Math.log(displayPercent) / Math.log(100) * 100;
    currencySpendingValue.textContent = displayPercent < 10
                                    ? `${displayPercent.toFixed(2)}%`
                                    : `${Math.round(displayPercent)}%`;


    // Add click handler
    showDeviceHoverInfoToggle.addEventListener('click', function() {
        state.showDeviceHoverInfo = !state.showDeviceHoverInfo;
        this.classList.toggle('active');
        this.innerHTML = state.showDeviceHoverInfo ?
            '<i class="fas fa-check"></i> Show Device Hover Info' :
            '<i class="fas fa-times"></i> Show Device Hover Info';
        saveState();
    });

    // Add click handler
    autoAbsorberToggle.addEventListener('click', function() {
        state.autoUseAbsorber = !state.autoUseAbsorber;
        this.classList.toggle('active');
        this.innerHTML = state.autoUseAbsorber ?
            '<i class="fas fa-check"></i> Auto-Use Max Absorber' :
            '<i class="fas fa-times"></i> Auto-Use Max Absorber';
        saveState();
    });

    // Add click handler for skip sacrifice dialog toggle
    skipSacrificeDialogToggle.addEventListener('click', function() {
        state.skipSacrificeDialog = !state.skipSacrificeDialog;
        this.classList.toggle('active');
        this.innerHTML = state.skipSacrificeDialog ?
            '<i class="fas fa-check"></i> Skip Sacrifice Dialog' :
            '<i class="fas fa-times"></i> Skip Sacrifice Dialog';
        saveState();
    });

    // Add click handler for skip remove from battle dialog toggle
    skipRemoveFromBattleDialogToggle.addEventListener('click', function() {
        state.skipRemoveFromBattleDialog = !state.skipRemoveFromBattleDialog;
        this.classList.toggle('active');
        this.innerHTML = state.skipRemoveFromBattleDialog ?
            '<i class="fas fa-check"></i> Skip Battle Remove Confirm' :
            '<i class="fas fa-times"></i> Skip Battle Remove Confirm';
        saveState();
    });

    currencySpendingSlider.addEventListener('input', function () {
        const t = parseInt(this.value) / 100; // normalized 0.01–1
        const min = 0.0001; // 0.01%
        const max = 1.0;    // 100%
        
        // Logarithmic interpolation
        const percent = min * Math.pow(max / min, t);
        state.currencySpendingPercentage = percent;

        const displayPercent = percent * 100;
        currencySpendingValue.textContent = displayPercent < 10
            ? `${displayPercent.toFixed(2)}%`
            : `${Math.round(displayPercent)}%`;

        saveState();
    });

    // Game tips button handler
    gameTipsBtn.addEventListener('click', function() {
        gameTipsModal.style.display = 'flex';
    });

    // Welcome Message button handler
    welcomeMessageBtn.addEventListener('click', function() {
        if (typeof showWelcomeModal === 'function') {
            showWelcomeModal();
        }
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

    // Initialize Kuzzi Games button
    kuzziGamesButton.addEventListener('click', () => {
        window.open('https://kuzzigames.com/', '_blank');
        if (realms[11].unlocked) {
            unlockAchievement('secret13');
        }
    });

    // Initialize The End button
    theEndBtn.addEventListener('click', () => {
        showTheEndModal();
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

    // Initialize The End button visibility
    updateTheEndButtonVisibility();
}

// Function to update currency spending control visibility
function updateCurrencySpendingControlVisibility() {
    const currencySpendingControl = document.getElementById('currencySpendingControl');
    if (currencySpendingControl && skillMap[25003] && skillMap[25003].purchased) {
        currencySpendingControl.style.display = 'flex';
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

// Function to update The End button visibility
function updateTheEndButtonVisibility() {
    const theEndBtn = document.getElementById('theEndBtn');
    if (theEndBtn && state.achievementsUnlocked.has('endgameChecklist5')) {
        theEndBtn.style.display = 'block';
    }
}

