// Battle system implementation

// Initialize battle system
function initBattleSystem() {
  // Don't initialize if already done
  if (state.battle.initialized) return;

  if (!realms[10].unlocked) {
    return;
  }

  // Initialize enemy if none exists
  if (!state.battle.currentEnemy) {
    state.battle.currentEnemy = getNextEnemy();
    saveState();
  }

  // Start battle loop if there's an enemy
  if (state.battle.currentEnemy) {
    startBattleLoop();
  }

  state.battle.initialized = true;
}

// Calculate attack power for a card
function calculateAttackPower(card) {
  // If this is a battle slot card, use the stored attack
  if (card.attack) {
    return card.attack;
  }
  // Otherwise calculate normally
  return Math.floor(card.power * card.tier * Math.sqrt(card.level) * state.battle.globalAttackMult);
}

// Calculate HP for a card
function calculateHP(card) {
  return Math.floor(card.defense * Math.sqrt(card.quantity) * state.battle.globalHPMult);
}

// Lock a card for sacrificeLockoutTime hours
function lockCard(cardId) {
  const card = cardMap[cardId];
  if (!card) return;
  
  card.locked = true;
  state.battle.lockoutTimers[cardId] = Date.now() + (state.sacrificeLockoutTime * 60 * 60 * 1000 / state.achievementRewards.sacrificeTimeDivider); // sacrificeLockoutTime is in hours
  saveState();
}

// Get next available enemy
function getNextEnemy() {
  const greekGodsCards = cards.filter(c => c.realm === state.battle.currentBattleRealm);
  // Find the first card that hasn't been battled yet
  const enemy = greekGodsCards.find(c => c.locked && !state.battle.lockoutTimers[c.id]);
  if (enemy) {
    // Initialize enemy properties
    enemy.attack = enemy.power * 10;
    enemy.maxHp = enemy.defense * (state.battle.currentBattleRealm === 11 ? 100000 : 400000);
    enemy.currentHp = enemy.maxHp;
    enemy.stunTurns = 0;
  }
  return enemy;
}

// Show damage number animation
function showDamageNumber(damage, target = 'enemy', specialType = null) {
  // 1) Pick the correct element based on target
  let targetEl;
  if (target === 'enemy') {
    targetEl = document.querySelector('.enemy-card .battle-card-face');
  } else {
    // target might be "slot0", "slot1", ... or even just "0"
    let idx;
    if (typeof target === 'string' && target.startsWith('slot')) {
      idx = target.slice(4);           // "slot3" → "3"
    } else {
      idx = target;
    }
    targetEl = document.querySelector(
      `.battle-slot[data-slot="${idx}"] .battle-card-face`
    );
  }
  if (!targetEl) return;

  // 2) Create the number
  const damageEl = document.createElement('div');
  damageEl.className = 'damage-number' + (specialType ? ` ${specialType}` : '');
  
  if (specialType === 'dodge') {
    damageEl.textContent = 'Dodge';
  } else if (specialType === 'stun') {
    damageEl.textContent = 'Stun';
  } else if (specialType === 'snap') {
    damageEl.textContent = 'Snap';
  } else if (specialType === 'revived') {
    damageEl.textContent = 'Revived';
  } else {
    damageEl.textContent = formatNumber(damage);
  }

  // 3) Position it randomly within that card face
  const bounds = targetEl.getBoundingClientRect();
  const offsetX = bounds.width * (0.15 + Math.random() * 0.35);
  const offsetY = bounds.height * (0.3 + Math.random() * 0.35);
  damageEl.style.left = `${offsetX}px`;
  damageEl.style.top  = `${offsetY}px`;
  damageEl.style.position = 'absolute';

  // 4) Append & clean up
  targetEl.appendChild(damageEl);
  damageEl.addEventListener('animationend', () => damageEl.remove(), { once: true });
}



// Remove top card from battle
function removeSlotCard(slotToRemove = 0) {
  // 1) Clear any running battle interval
  if (state.battle.battleInterval) {
    clearInterval(state.battle.battleInterval);
    state.battle.battleInterval = null;
  }

  // 2) Don’t do anything if that slot is already empty
  if (state.battle.slots[slotToRemove] === null) return;

  // 3) Figure out if we’ll still have cards left AFTER removal
  const totalCardsBefore = state.battle.slots.filter(c => c !== null).length;
  const willHaveRemainingCards = (totalCardsBefore - 1) > 0;

  // 4) Remove that slot and shift everything down, then add an empty slot at the end
  state.battle.slots.splice(slotToRemove, 1);
  state.battle.slots.push(null);

  // 5) If no cards left, pause the battle
  if (!willHaveRemainingCards) {
    state.battle.paused = true;
  }

  // 6) Play a removal animation on the exact slot you removed
  const cardEl = document.querySelector(
    `.battle-slot[data-slot="${slotToRemove}"] .card-outer`
  );
  if (cardEl) {
    cardEl.classList.add('removing');
    cardEl.addEventListener('animationend', () => {
      // 7) Re-render UI
      updateBattleUI();

      // 8) Update the pause button if we're out of cards
      if (!willHaveRemainingCards) {
        const pauseBtn = document.querySelector('.battle-pause-btn');
        if (pauseBtn) {
          pauseBtn.classList.add('paused');
          pauseBtn.textContent = 'Start Battle';
        }
      }
      // 9) Otherwise, restart the loop now that slots have shifted
      else {
        startBattleLoop();
      }
    }, { once: true });
  }
}


// Defeat current enemy
function defeatEnemy() {
  clearInterval(state.battle.battleInterval);
  state.battle.battleInterval = null;
  state.battle.paused = true; // Auto-pause after victory

  // Show victory animation if we're on battle tab
  const enemyEl = document.querySelector('.enemy-card');
  if (enemyEl) {
    enemyEl.classList.add('defeated');
    
    enemyEl.addEventListener('animationend', () => {
      processVictory();
    }, { once: true });
  } else {
    // Process victory immediately if not on battle tab
    processVictory();
  }
}

// Split out victory processing
function processVictory() {
  // Unlock the actual card (not the battle copy)
  const defeatedCard = cardMap[state.battle.currentEnemy.id];
  if (defeatedCard) {
    defeatedCard.locked = false;
  }
  
  // Clear battle slots
  state.battle.slots = Array(state.battle.slotLimit).fill(null);

  // Give Rewards for Enemies that have rewards
  if (state.battle.currentEnemy.name === 'Cronus') {
    state.battle.globalAttackMult += 0.005;
  } else if (state.battle.currentEnemy.name === 'Typhon') {
    state.battle.globalMaxCardsMult += 0.005;
  } else if (state.battle.currentEnemy.name === 'Gaia') {
    state.battle.globalHPMult += 0.005;
  } else if (state.battle.currentEnemy.name === 'Nyx') {
    state.battle.globalHPMult += 0.02;
  } else if (state.battle.currentEnemy.name === 'Chaos') {
    state.battle.globalAttackMult += 0.02;
  } else if (state.battle.currentEnemy.name === 'Zeus') {
    state.battle.globalMaxCardsMult += 0.25;
  } else if (state.battle.currentEnemy.name === 'Papa Smurf') {
    state.battle.globalAttackMult += 0.001;
  } else if (state.battle.currentEnemy.name === 'Dr Wily') {
    state.battle.globalHPMult += 0.001;
  } else if (state.battle.currentEnemy.name === 'Michael Scott') {
    state.battle.globalAttackMult += 0.003;
  } else if (state.battle.currentEnemy.name === 'Bowser') {
    state.battle.globalHPMult += 0.003;
  } else if (state.battle.currentEnemy.name === 'Genghis Khan') {
    state.battle.globalAttackMult += 0.005;
  } else if (state.battle.currentEnemy.name === 'Dracula') {
    state.battle.globalHPMult += 0.005;
  } else if (state.battle.currentEnemy.name === 'Cartman') {
    state.battle.globalMaxCardsMult += 0.01;
  } else if (state.battle.currentEnemy.name === 'Agent Smith') {
    state.battle.globalHPMult += 0.01;
  } else if (state.battle.currentEnemy.name === 'Sephiroth') {
    state.battle.globalAttackMult += 0.01;
  } else if (state.battle.currentEnemy.name === 'Galactus') {
    state.battle.globalAttackMult += 0.02;
  } else if (state.battle.currentEnemy.name === 'T800') {
    state.battle.globalHPMult += 0.02;
  } else if (state.battle.currentEnemy.name === 'Godzilla') {
    state.battle.globalMaxCardsMult += 0.02;
  } else if (state.battle.currentEnemy.name === 'Darth Vader') {
    state.battle.globalHPMult += 0.03;
  } else if (state.battle.currentEnemy.name === 'Shao Kahn') {
    state.battle.globalAttackMult += 0.03;
  } else if (state.battle.currentEnemy.name === 'Hal9000') {
    state.battle.globalMaxCardsMult += 0.03;
  } else if (state.battle.currentEnemy.name === 'Sauron') {
    state.battle.globalHPMult += 0.05;
  } else if (state.battle.currentEnemy.name === 'Pudge') {
    state.battle.globalMaxCardsMult += 0.05;
  } else if (state.battle.currentEnemy.name === 'Doctor Manhattan') {
    state.battle.globalMaxCardsMult += 0.06;
  } else if (state.battle.currentEnemy.name === 'Aizen') {
    state.battle.globalAttackMult += 0.08;
  } else if (state.battle.currentEnemy.name === 'Thanos') {
    state.battle.globalMaxCardsMult += 0.08;
  } else if (state.battle.currentEnemy.name === 'Isshin') {
    state.battle.globalAttackMult += 0.1;
  } else if (state.battle.currentEnemy.name === 'Deadpool') {
    state.battle.globalHPMult += 0.1;
  } else if (state.battle.currentEnemy.name === 'Kratos') {
    state.battle.globalAttackMult += 0.1;
  } else if (state.battle.currentEnemy.name === 'Arceus') {
    state.battle.globalHPMult += 0.1;
  } else if (state.battle.currentEnemy.name === 'Rick') {
    state.battle.globalMaxCardsMult += 0.1;
  } else if (state.battle.currentEnemy.name === 'Vegeta') {
    state.battle.globalAttackMult += 0.15;
  } else if (state.battle.currentEnemy.name === 'Chuck Norris') {
    state.battle.globalHPMult += 0.15;
  } else if (state.battle.currentEnemy.name === 'Kaguya') {
    state.battle.globalAttackMult += 0.5;
  } else if (state.battle.currentEnemy.name === 'One Above All') {
    state.battle.globalMaxCardsMult += 0.5;
  } else if (state.battle.currentEnemy.name === 'Saitama') {
    state.battle.globalHPMult += 0.5;
  } else if (state.battle.currentEnemy.name === 'Kuzzi') {
    state.battle.globalAttackMult += 1;
  } else if (state.battle.currentEnemy.name === 'Your Ego') {
    state.battle.globalMaxCardsMult += 5;
  }

  checkAchievements('battleMilestone', state.battle.currentEnemy.name);

  // Get next enemy
  state.battle.currentEnemy = getNextEnemy();
  
  saveState();
  
  // Only update UI if we're on battle tab
  if (currentTab === 'battles') {
    updateBattleUI();
  }
  renderCardsCollection(); // Update collection view
}

// Update battle stats
function updateBattleStats() {
  // Enemy
  const enemyCard = document.querySelector('.enemy-card');
  if (!enemyCard || !state.battle.currentEnemy) return;

  // 1) HP bar + text
  const hpBar    = enemyCard.querySelector('.hp-bar');
  const hpText   = enemyCard.querySelector('.hp-text');
  if (hpBar && hpText) {
    const pct = (state.battle.currentEnemy.currentHp / state.battle.currentEnemy.maxHp) * 100;
    hpBar.style.width = `${pct}%`;
    hpText.textContent = formatNumber(state.battle.currentEnemy.currentHp);
  }

  // 2) Attack stat
  const atkStat = enemyCard.querySelector('.battle-combat-stats .stats-row .battle-combat-stat:first-child');
  if (atkStat) {
    atkStat.innerHTML = `<i class="fas fa-gavel"></i> ${formatNumber(floorTo3SigDigits(state.battle.currentEnemy.attack))}`;
  }

  if (state.battle.currentEnemy.name === 'Vegeta') {
    const maxHpStat = enemyCard.querySelector('.battle-combat-stats .stats-row .battle-combat-stat:nth-child(2)');
    if (maxHpStat) {
      maxHpStat.innerHTML = `<i class="fas fa-heart"></i> ${formatNumber(floorTo3SigDigits(state.battle.currentEnemy.maxHp))}`;
    }
  }

  // Slot cards
  state.battle.slots.forEach((card, index) => {
    const slot = document.querySelector(`.battle-slot[data-slot="${index}"]`);
    if (!slot || !card) return;

    // a) HP bar + text
    const slotHpBar  = slot.querySelector('.hp-bar');
    const slotHpText = slot.querySelector('.hp-text');
    if (slotHpBar && slotHpText) {
      const pct = (card.currentHp / card.maxHp) * 100;
      slotHpBar.style.width = `${pct}%`;
      slotHpText.textContent = formatNumber(card.currentHp);
    }

    // b) Attack stat
    const slotAtkStat = slot.querySelector('.battle-combat-stats .stats-row .battle-combat-stat:first-child');
    if (slotAtkStat) {
      slotAtkStat.innerHTML = `<i class="fas fa-gavel"></i> ${formatNumber(floorTo3SigDigits(card.attack))}`;
    }
  });
}


// Update battle UI
function updateBattleUI() {
  const battleContent = document.getElementById('tab-content-battles');
  if (!battleContent) return;

  // Check if Greek Gods realm is unlocked
  const greekGodsRealm = realms.find(r => r.id === state.battle.currentBattleRealm);
  if (!greekGodsRealm?.unlocked) {
    battleContent.innerHTML = `
      <div class="battle-locked-message">
        You must unlock Greek Gods realm to access Battles
      </div>
    `;
    return;
  }

  // Get current enemy
  const currentEnemy = state.battle.currentEnemy;

  const switcher = realms.find(r => r.id === 12)?.unlocked
  ? `
    <div class="battle-realm-switch">
      <button class="realm-btn ${state.battle.currentBattleRealm === 11 ? 'active' : ''}" data-realm="11">
        Greek Gods
      </button>
      <button class="realm-btn ${state.battle.currentBattleRealm === 12 ? 'active' : ''}" data-realm="12">
        Bosses
      </button>
    </div>
  `
  : '';

  // Update battle arena
  battleContent.innerHTML = `
    ${switcher}
    <div class="battle-arena">
      <div class="battle-slots-container">
        <div class="battle-slots">
          ${(() => {
            const limit = state.battle.slotLimit;

            // exactly your existing slot markup
            const renderSlot = idx => {
              const c = state.battle.slots[idx];
              return `
                <div class="battle-slot" data-slot="${idx}">
                  ${c ? `
                    <div class="card-outer">
                      <div class="battle-card-face">
                        <img class="card-frame"
                            src="assets/images/frames/${c.rarity}_frame.jpg" />
                        <img class="card-image"
                            src="assets/images/cards/${c.realm}/${slugify(c.name)}.jpg" />
                        ${c.tier > 0 ? `
                          <img class="tier-badge"
                              src="assets/images/tiers/tier_${c.tier}.png"
                              alt="Tier ${c.tier}" />` : ''}
                        <div class="hp-container">
                          <div class="hp-bar"
                              style="width:${(c.currentHp/c.maxHp)*100}%"></div>
                          <div class="hp-text">${formatNumber(c.currentHp)}</div>
                        </div>
                           <div class="battle-combat-stats">
                          <div class="stats-row">
                            <div class="battle-combat-stat">
                              <i class="fas fa-gavel"></i> ${formatNumber(floorTo3SigDigits(c.attack))}
                            </div>
                            <div class="battle-combat-stat">
                              <i class="fas fa-heart"></i> ${formatNumber(floorTo3SigDigits(c.maxHp))}
                            </div>
                          </div>
                          ${renderBattleCardSpecialEffects(c)
                            ? `<div class="effects-row">${renderBattleCardSpecialEffects(c)}</div>`
                            : ``}
                        </div>
                      </div>
                    </div>
                  ` : '<div class="empty-slot">Empty Slot</div>'}
                </div>`;
            };

            // 1) First row: slots 2→1→0
            const baseRow = [2, 1, 0].slice(0, limit);
            const firstRow = baseRow
              .map((idx, i) =>
                renderSlot(idx) +
                (i < baseRow.length - 1 ? '<div class="slot-arrow">➡️</div>' : '')
              ).join('');

            // 2) Middle row: an ↑ under slot 2
            let arrowUpRow = '';
            if (limit > 3) {
              arrowUpRow = baseRow
                .map((_, i) =>
                  i === 0
                    ? `<div class="arrow-cell"><div class="slot-arrow arrow-up">⬆️</div></div>`
                    : `<div class="arrow-cell"></div>`
                ).join('');
            }

            // 3) Bottom row: slots 3←4←5…
            let secondRow = '';
            if (limit > 3) {
              secondRow = Array.from({ length: limit - 3 }, (_, k) => 3 + k)
                .map((idx, k) =>
                  (k > 0 ? '<div class="slot-arrow arrow-left">⬅️</div>' : '') +
                  renderSlot(idx)
                ).join('');
            }

            return `
              <div class="slots-row">${firstRow}</div>
              ${arrowUpRow ? `<div class="slots-row arrow-up-row">${arrowUpRow}</div>` : ''}
              ${secondRow  ? `<div class="slots-row bottom-row">${secondRow}</div>` : ''}
            `;
          })()}
        </div>
        <div class="battle-controls">
          <button class="battle-pause-btn ${state.battle.paused ? 'paused' : ''}"
                  ${state.battle.slots.every(slot => slot === null) ? 'disabled' : ''}>
            ${state.battle.paused ? 'Start Battle' : 'Pause Battle'}
          </button>
        </div>
      </div>
      <div class="enemy-section">
        <div class="enemy-card">
          <div class="battle-card-face">
            ${ currentEnemy ? `
              <img class="card-frame" src="assets/images/frames/${currentEnemy.rarity}_frame.jpg" />
              <img class="card-image" src="assets/images/cards/${currentEnemy.realm}/${slugify(currentEnemy.name)}.jpg" />
              <div class="hp-container">
                <div class="hp-bar" style="width: ${(currentEnemy.currentHp / currentEnemy.maxHp) * 100}%"></div>
                <div class="hp-text">${formatNumber(currentEnemy.currentHp)}</div>
              </div>
              <div class="battle-combat-stats">
                <div class="stats-row">
                  <div class="battle-combat-stat">
                    <i class="fas fa-gavel"></i> ${formatNumber(floorTo3SigDigits(currentEnemy.attack))}
                  </div>
                  <div class="battle-combat-stat">
                    <i class="fas fa-heart"></i> ${formatNumber(floorTo3SigDigits(currentEnemy.maxHp))}
                  </div>
                </div>
              </div>
            ` : `` }
          </div>
        </div>
        ${ currentEnemy ? `
          <div class="enemy-details">
            <h3 style="color: var(--rarity-${currentEnemy.rarity.trim()})">
              ${currentEnemy.name}
            </h3>
            <p>
              ${currentEnemy.description || 
                'A powerful enemy that must be defeated to unlock their card.'}
            </p>

            ${Object.prototype.hasOwnProperty.call(bossMechanicsByName, currentEnemy.name) ? (() => {
              const mech = bossMechanicsByName[currentEnemy.name];
              return `
                <div class="boss-mechanics">
                  <div>
                    <strong>Special Powers:</strong>
                    ${mech.specialPowers}
                  </div>
                  <div>
                    <strong>Kill Reward:</strong>
                    ${mech.killReward}
                  </div>
                </div>
              `;
            })() : ''}
          </div>
        ` : `
          <!-- overlay when no currentEnemy -->
          <div class="no-enemy-overlay">
            No enemy to battle
          </div> 
          ` }
      </div>
    </div>
    <div class="battle-filters-header">
      <div class="battle-filters">
        <div class="battle-filter-group">
          <button class="battle-filter-btn ${state.battle.sortBy === 'power' ? 'active' : ''}" data-sort="power">
            Sort by Power
            ${state.battle.sortBy === 'power' ? 
              `<span class="sort-direction">${state.battle.sortDirection === 'desc' ? '↓' : '↑'}</span>` : 
              ''}
          </button>
          <button class="battle-filter-btn ${state.battle.sortBy === 'hp' ? 'active' : ''}" data-sort="hp">
            Sort by HP
            ${state.battle.sortBy === 'hp' ? 
              `<span class="sort-direction">${state.battle.sortDirection === 'desc' ? '↓' : '↑'}</span>` : 
              ''}
          </button>
        </div>
        <div class="battle-filter-group">
          <button
            class="battle-filter-btn ${state.battle.filterRealms.length?'active':''}"
            data-filter="realm"
          >
            Realm
            ${ state.battle.filterRealms.length
              ? `<span class="filter-badge">
                    ${state.battle.filterRealms
                      .map(id => realmMap[id].name)
                      .join(', ')}
                  </span>`
              : ''
            }
          </button>
          <button
            class="battle-filter-btn ${state.battle.filterRarities.length?'active':''}"
            data-filter="rarity"
          >
            Rarity
            ${ state.battle.filterRarities.length
              ? `<span class="filter-badge">
                    ${state.battle.filterRarities
                      .map(r => r.toUpperCase())
                      .join(', ')}
                  </span>`
              : ''
            }
          </button>
        </div>
      </div>
      <div class="battle-header-buttons">
        <button class="battle-help-btn">
          <i class="fas fa-question-circle"></i>
          How do Battles work?
        </button>
        <button class="battle-reset-btn">
          <i class="fas fa-redo"></i>
          Reset Battles
        </button>
      </div>
    </div>
    <div class="battle-card-grid"></div>
  `;

  // battles.js (inside updateBattleUI, after setting innerHTML)
  document.querySelectorAll('.battle-slot').forEach(slotEl => {
    const idx = Number(slotEl.dataset.slot);
    const cardOuter = slotEl.querySelector('.card-outer');
    if (!cardOuter) return; // skip empty slots

    // Click to remove
    cardOuter.addEventListener('click', () => {
      const ok = confirm(
        "Are you sure you want to remove this card from battle? " +
        "The card will still remain sacrificed."
      );
      if (!ok) return;

      // 1) Stop the battle loop
      if (state.battle.battleInterval) {
        clearInterval(state.battle.battleInterval);
        state.battle.battleInterval = null;
      }

      // 2) Remove the card and shift later cards down
      state.battle.slots.splice(idx, 1);
      state.battle.slots.push(null);

      // 3) Pause battles (no cards → paused), save & re-render
      state.battle.paused = true;
      saveState();
      updateBattleUI();
      updateBattleStats();  
    });
  });


  document.querySelectorAll('.realm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.realm);

      // Check if switching to a different realm
      if (target !== state.battle.currentBattleRealm) {
        showRealmSwitchWarning(target);
      }
    });
  });



  // Add pause button handler
  const pauseBtn = document.querySelector('.battle-pause-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!state.battle.slots.some(slot => slot !== null)) return;
      
      state.battle.paused = !state.battle.paused;
      if (!state.battle.paused) {
        startBattleLoop();
      }
      
      pauseBtn.classList.toggle('paused', state.battle.paused);
      pauseBtn.textContent = state.battle.paused ? 'Start Battle' : 'Pause Battle';
    });
  }

  // Add filter button handlers
  const filterButtons = document.querySelectorAll('.battle-filter-btn');
  filterButtons.forEach(btn => {
    if (btn.dataset.sort) {
      // Sort buttons
      btn.addEventListener('click', () => {
        const sort = btn.dataset.sort;
        if (state.battle.sortBy === sort) {
          // Toggle direction if clicking same sort
          state.battle.sortDirection = state.battle.sortDirection === 'desc' ? 'asc' : 'desc';
        } else {
          // Set new sort and reset direction to desc
          state.battle.sortBy = sort;
          state.battle.sortDirection = 'desc';
        }
        updateBattleUI();
      });
    } else if (btn.dataset.filter) {
      // Filter buttons
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        if (filter === 'realm') {
          showRealmFilterMenu(btn);
        } else if (filter === 'rarity') {
          showRarityFilterMenu(btn);
        }
      });
    }
  });

  // Add help button handler
  const helpBtn = document.querySelector('.battle-help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', showBattleHelp);
  }

  // Add reset battles button handler
  const resetBtn = document.querySelector('.battle-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', showResetBattlesDialog);
  }

  // Update card grid after filters are set
  const cardGrid = document.querySelector('.battle-card-grid');
  if (cardGrid) {
    updateBattleCardGrid(cardGrid);
  }

}

// Show warning dialog before switching realms
function showRealmSwitchWarning(targetRealm) {
  // 1) Prevent switching if player has cards in slots
  if (state.battle.slots.some(s => s !== null)) {
    return alert('You must empty all battle slots before switching realms.');
  }

  const currentRealmName = targetRealm === 11 ? 'Greek Gods' : 'Bosses';
  const hasCurrentEnemy = state.battle.currentEnemy && state.battle.currentEnemy.currentHp < state.battle.currentEnemy.maxHp;

  // If no current enemy or enemy is at full health, switch directly
  if (!hasCurrentEnemy) {
    switchBattleRealm(targetRealm);
    return;
  }

  const dialog = document.createElement('div');
  dialog.className = 'sacrifice-dialog';
  dialog.innerHTML = `
    <div class="sacrifice-content battle-help-modal">
      <h2>Switch to ${currentRealmName}?</h2>
      <p><strong>Warning:</strong> Switching realms will reset the current enemy's HP to full.</p>
      <p>Your current enemy will be healed back to maximum health. Are you sure you want to continue?</p>
      <div class="reset-buttons">
        <button class="reset-confirm-btn">Switch Realm</button>
        <button class="reset-cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  // Add click handlers
  const confirmBtn = dialog.querySelector('.reset-confirm-btn');
  const cancelBtn = dialog.querySelector('.reset-cancel-btn');

  confirmBtn.addEventListener('click', () => {
    switchBattleRealm(targetRealm);
    dialog.remove();
  });

  cancelBtn.addEventListener('click', () => {
    dialog.remove();
  });

  // Handle click outside to close
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.remove();
    }
  });

  document.body.appendChild(dialog);
}

function switchBattleRealm(targetRealm) {
  // Change realm and heal the current enemy
  state.battle.currentBattleRealm = targetRealm;
  if (state.battle.currentEnemy) {
    state.battle.currentEnemy.currentHp = state.battle.currentEnemy.maxHp;
  }

  // (Re)load next enemy for the new realm if needed
  if (!state.battle.currentEnemy || state.battle.currentEnemy.realm !== targetRealm) {
    state.battle.currentEnemy = getNextEnemy();
  }

  saveState();
  updateBattleUI();
}


// Separate function to update card grid
function updateBattleCardGrid(cardGrid) {
  // Get all owned cards and apply filters
  let filteredCards = cards.filter(c => c.quantity > 0);

  if (state.battle.filterRealms.length) {
    filteredCards = filteredCards.filter(c =>
      state.battle.filterRealms.includes(c.realm)
    );
  }

  // Apply rarity filter if any are selected
  if (state.battle.filterRarities.length) {
    filteredCards = filteredCards.filter(c =>
      state.battle.filterRarities.includes(c.rarity)
    );
  }

  // Sort cards
  filteredCards.sort((a, b) => {
    const aValue = state.battle.sortBy === 'power' ? 
      calculateAttackPower(a) : calculateHP(a);
    const bValue = state.battle.sortBy === 'power' ? 
      calculateAttackPower(b) : calculateHP(b);
    
    return state.battle.sortDirection === 'desc' ? 
      bValue - aValue : 
      aValue - bValue;
  });

  // Render filtered and sorted cards
  cardGrid.innerHTML = filteredCards.map(card => {
    const attack = calculateAttackPower(card);
    const maxHp = calculateHP(card);

    return `      <div class="battle-card-grid-item" data-id="${card.id}">
        <div class="battle-card-face" style="border-color: ${realmColors[card.realm]}">
          <img class="battle-card-image" 
               src="assets/images/cards/${card.realm}/${slugify(card.name)}.jpg" 
               alt="${card.name}"
               loading="lazy" />
          <img class="battle-card-frame" 
               src="assets/images/frames/${card.rarity}_frame.jpg" 
               alt="${card.rarity} frame"/>
          ${card.tier > 0 ? `
            <img class="battle-tier-badge" 
                 src="assets/images/tiers/tier_${card.tier}.png" 
                 alt="Tier ${card.tier}" />
          ` : ''}
          <div class="battle-card-name">${card.name}</div>
          <div class="battle-combat-stats">
            <div class="stats-row">
              <div class="battle-combat-stat">
                <i class="fas fa-gavel"></i> ${formatNumber(floorTo3SigDigits(attack))}
              </div>
              <div class="battle-combat-stat">
                <i class="fas fa-heart"></i> ${formatNumber(floorTo3SigDigits(maxHp))}
              </div>
            </div>
            ${renderBattleCardSpecialEffects(card)
              ? `<div class="effects-row">${renderBattleCardSpecialEffects(card)}</div>`
              : ``}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-add click handlers and scaling
  cardGrid.querySelectorAll('.battle-card-grid-item').forEach(cardEl => {
    cardEl.addEventListener('click', () => {
      const cardId = parseInt(cardEl.dataset.id);
      showSacrificeDialog(cardId);
    });
  });

  // Scale card names and stats to fit
  cardGrid.querySelectorAll('.battle-card-grid-item').forEach(card => {
    // Scale card name
    const nameEl = card.querySelector('.battle-card-name');
    if (nameEl) {
      const containerWidth = nameEl.parentElement.offsetWidth - 16; // Account for padding
      const textWidth = nameEl.scrollWidth;
      const scale = Math.min(1, containerWidth / textWidth);
      nameEl.style.setProperty('--text-scale', scale);
    }

    // Scale combat stats
    const statsEl = card.querySelector('.battle-combat-stats');
    if (statsEl) {
      const containerWidth = statsEl.offsetWidth - 8; // Account for padding
      const statsWidth = Array.from(statsEl.children).reduce((w, stat) => w + stat.scrollWidth, 0);
      const scale = Math.min(1, containerWidth / statsWidth);
      statsEl.querySelectorAll('.battle-combat-stat').forEach(stat => {
        stat.style.setProperty('--stat-scale', scale);
      });
    }
  });
}

// Helper function to render effects
function renderCardEffects(c, isSpecial = false) {
  const effectsList = isSpecial ? c.specialEffects : c.baseEffects;
  if (!effectsList || !effectsList.length) return '';
  
  return effectsList.map(def => {
    // Skip special effects that don't meet requirements
    if (isSpecial) {
      if (def.requires) {
        const required = cardMap[def.requires.card];
        if (!required || required.tier < def.requires.tier) {
          return '';
        }
      }
      // Add level requirement check
      if (def.requirement?.type === 'level' && c.level < def.requirement.amount) {
        return '';
      }
    }

    // For effects label
    let label;
    switch (def.type) {
      case "currencyPerPoke":
      case "currencyPerSec":
      case "flatCurrencyPerPoke":
      case "flatCurrencyPerSecond":
      case "currencyPerPokeMultiplier":
      case "currencyPerSecMultiplier": {
        const currency = currencies.find(cur => cur.id === def.currency);
        const icon = currency ? 
          `<img class="currency-effect-icon" src="assets/images/currencies/${currency.icon}" alt="${currency.name}"/>` : '';
        const verb = def.type.includes('PerPoke') ? '/ Poke' : '/ Sec';
        if (def.type.includes('Multiplier')) {
          label = `Global ${icon} ${verb} Multiplier`;
        } else {
          label = `${icon} ${verb}`;
        }
        break;
      }
      case "rarityOddsDivider": {
        const realmObj = realmMap[def.realm];
        const realmColor = realmColors[def.realm];
        const rarityColor = getComputedStyle(document.documentElement)
          .getPropertyValue(`--rarity-${def.rarity}`);
        label = [
          `<span style="color:${realmColor}">${realmObj.name}</span>`,
          `<span style="color:${rarityColor}">${def.rarity.toUpperCase()}</span> odds divider`
        ].join(' ');
        break;
      }
      default:
        label = SPECIAL_EFFECT_NAMES[def.type] || EFFECT_NAMES[def.type] || def.type;
    }

    // Calculate value based on effect type
    let valueHtml;
    switch (def.type) {
      case "merchantPriceDivider":
        valueHtml = `×${formatNumber(def.value)}`;
        break;
      case "flatCurrencyPerPoke":
      case "flatCurrencyPerSecond":
        valueHtml = `+${formatNumber(def.value)}`;
        break;
      case "currencyPerPokeMultiplier":
      case "currencyPerSecMultiplier":
        valueHtml = `×${formatNumber(def.value)}`;
        break;
      case "allGeneratorMultiplier":
        valueHtml = `×${formatNumber(def.value)}`;
        break;
      case "flatMaxCardsPerPoke":
      case "flatMinCardsPerPoke":
      case "flatCooldownDivider":
      case "flatExtraMerchantRarityScaling":
        valueHtml = `+${formatNumber(def.value)}`;
        break;
      case "rarityOddsDivider":
        const baseDivider = def.value || def.amount || 0.01;
        total = baseDivider * c.level * Math.pow(EFFECT_SCALES[def.type] || 2, c.tier - 1);
        const cap = EFFECTS_RARITY_VALUES[c.rarity]?.oddsDividerCap;
        const cappedTotal = Math.min(total, cap);
        valueHtml = `${formatNumber(cappedTotal)}`;
        break;
      case "cooldownDivider":
        baseValue = EFFECTS_RARITY_VALUES[c.rarity]?.cooldownDividerBaseValue || 0;
        const tierContribution = (c.tier * (c.tier + 1)) / 2;
        total = baseValue * c.level * tierContribution;
        valueHtml = `+${formatNumber(total)}`;
        break;
      default:
        if (def.type === "minCardsPerPoke") {
          baseValue = EFFECTS_RARITY_VALUES[c.rarity]?.minCardsPerPokeBaseValue || 0;
        } else if (def.type === "maxCardsPerPoke") {
          baseValue = EFFECTS_RARITY_VALUES[c.rarity]?.maxCardsPerPokeBaseValue || 0;
        } else {
          baseValue = def.value || def.amount || 0;
        }
        total = baseValue * c.level * Math.pow(EFFECT_SCALES[def.type] || 2, c.tier - 1);
        valueHtml = `+${formatNumber(total)}`;
    }

    return `<div class="effect-line">
      ${label}: <strong>${valueHtml}</strong>
    </div>`;
  }).filter(Boolean).join('');
}

// Perform the actual sacrifice action
function performSacrifice(cardId) {
  // Find first available slot
  const limit = state.battle.slotLimit;
  // grow the slots array up to the current limit
  while (state.battle.slots.length < limit) {
    state.battle.slots.push(null);
  }

  const availableSlot = state.battle.slots.findIndex(slot => slot === null);
  if (availableSlot === -1) {
    alert('No available battle slots!');
    return false;
  }

  if (!state.battle.currentEnemy) {
    alert('No enemy to battle!');
    return false;
  }

  // Create battle copy of the card
  const card = cardMap[cardId];
  const battleCard = {
    ...card,
    attack: calculateAttackPower(card),
    currentHp: calculateHP(card),
    maxHp: calculateHP(card),
    quantity: card.quantity,
    originalQuantity: card.quantity
  };

  // Reset the original card
  card.level = 1;
  card.tier = 0;
  card.quantity = 0;
  if (card.lastAppliedEffects) {
    applyEffectsDelta(card.lastAppliedEffects, -1);
  }
  if (card.lastAppliedSpecialEffects) {
    applyEffectsDelta(card.lastAppliedSpecialEffects, -1);
  }
  card.lastAppliedEffects = null;
  card.lastAppliedSpecialEffects = null;

  // Place battle copy in slot
  state.battle.slots[availableSlot] = battleCard;

  // Check for and apply battle tricks synchronously
  if (state.battle.currentEnemy) {
    checkBattleTrick(cardId, state.battle.currentEnemy);

    if(cardId === 833){
      triggerQuickGlitch();
      setTimeout(() => showMatrixRain(), 2000);
      setTimeout(() => unlockAchievement('secret8'), 10100);
    }
  }

  // Lock the card
  lockCard(cardId);

  processNewCardDiscovered();

  saveState();
  updateBattleUI();
  renderCardsCollection(); // Update collection view
  return true;
}

// Show sacrifice dialog
function showSacrificeDialog(cardId) {
  // Check if skip sacrifice dialog is enabled and realms[10] is unlocked
  if (state.skipSacrificeDialog && realms[10].unlocked) {
    performSacrifice(cardId);
    return;
  }
  const c = cardMap[cardId];
  if (!c) return;

  const attack = calculateAttackPower(c);
  const maxHp = calculateHP(c);
  const rr = realmMap[c.realm];
  const color = realmColors[c.realm];

  const dialog = document.createElement('div');
  dialog.className = 'sacrifice-dialog';
  dialog.innerHTML = `
    <div class="sacrifice-content">
      <div class="sacrifice-left">
        <div class="sacrifice-card-preview">
          <img class="modal-frame-img" src="assets/images/frames/${c.rarity}_frame.jpg" />
          ${c.tier > 0 ? `
            <img class="modal-tier-icon" src="assets/images/tiers/tier_${c.tier}.png" alt="Tier ${c.tier}" />
          ` : ''}
          <div class="battle-card-name">${c.name}</div>
          <img class="modal-image" src="assets/images/cards/${c.realm}/${slugify(c.name)}.jpg" />
          <div class="battle-combat-stats">
            <div class="stats-row">
              <div class="battle-combat-stat">
                <i class="fas fa-gavel"></i> ${formatNumber(floorTo3SigDigits(attack))}
              </div>
              <div class="battle-combat-stat">
                <i class="fas fa-heart"></i> ${formatNumber(floorTo3SigDigits(maxHp))}
              </div>
            </div>
            ${renderBattleCardSpecialEffects(c)
              ? `<div class="effects-row">${renderBattleCardSpecialEffects(c)}</div>`
              : ``}
          </div>
        </div>
        <button class="sacrifice-btn">Sacrifice Card</button>
      </div>
      <div class="sacrifice-right">
          <div class="sacrifice-warning">
            <strong>Warning:</strong> Sacrificing this card will:
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Remove it from your collection (${formatQuantity(c.quantity)} → 0) </li>
              <li>Reset its tier (${c.tier} → 0) and level (${c.level} → 1)</li>
              <li>Remove all its effects</li>
              <li>Lock it for ${formatDuration(state.sacrificeLockoutTime * 60 * 60 / state.achievementRewards.sacrificeTimeDivider)}</li>
            </ul>
          </div>
          <div class="sacrifice-stats">
          <span>Realm:</span> <strong style="color:${color}">${rr.name}</strong>
          ${cards.filter(c2 => c2.realm === c.realm).every(c2 => c2.quantity > 0) ? `
            <span>Realm Conqueror:</span> 
            <strong><span class="stat-change">→ -1</span></strong>
          ` : ''} 
          <span>Rarity:</span> <strong style="color:var(--rarity-${c.rarity})">${c.rarity.toUpperCase()}</strong>
          <span>Power:</span> <strong>${formatNumber(c.power)}</strong>
          <span>Defense:</span> <strong>${formatNumber(c.defense)}</strong>
        </div>
        ${c.baseEffects ? `
          <h4>Effects <span class="effect-removed">→ removed</span></h4>
          <div class="sacrifice-modal-effects">
            ${renderCardEffects(c)}
          </div>
        ` : ''}
        ${c.specialEffects ? `
          <h4>Special Effects <span class="effect-removed">→ removed</span></h4>
          <div class="sacrifice-modal-effects">
            ${renderCardEffects(c, true)}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Add event listener for sacrifice button
  const sacrificeBtn = dialog.querySelector('.sacrifice-btn');
  if (sacrificeBtn) {
    sacrificeBtn.addEventListener('click', () => {
      if (performSacrifice(cardId)) {
        dialog.remove();
      }
    });
  }

  // Handle click outside to close
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.remove();
    }
  });

  document.body.appendChild(dialog);
}

// Helper function to render special battle effects for a card
function renderBattleCardSpecialEffects(card) {
  if (!card || !card.realm) return '';

  const battleState = state.battle;
  const effects = [];

  // helper to push one effect
  const add = (iconClass, text, color) =>
    effects.push(
      `<span style="color:${color}; display:inline-flex; align-items:center; gap:4px;">
         <i class="fas ${iconClass}"></i>
         ${text}
       </span>`
    );

  if (battleState.damageAbsorption > 0 && battleState.damageAbsorptionRealms.has(card.realm)) {
    add(
      'fa-shield-alt',
      `${formatNumber(battleState.damageAbsorption * 100)}%`,
      '#CCCCCC'               // light gray
    );
  }
  if (battleState.protectionChance > 0 && battleState.protectionRealms.has(card.realm)) {
    add(
      'fa-shield-virus',
      `${formatNumber(battleState.protectionChance * 100)}%`,
      '#BDE8F6'               // light blue
    );
  }
  if (battleState.extraAttackChance > 0 && battleState.extraAttackRealms.has(card.realm)) {
    add(
      'fa-bolt',
      `${formatNumber(battleState.extraAttackChance * 100)}%`,
      '#FFCC99'               // light orange
    );
  }
  if (battleState.empowerment > 0 && battleState.empowermentRealms.has(card.realm)) {
    add(
      'fa-fire',
      `${formatNumber(battleState.empowerment * 100)}%`,
      '#DDA0DD'               // light purple
    );
  }
  if (battleState.evolutionChance > 0 && battleState.evolutionRealms.has(card.realm)) {
    add(
      'fa-dna',
      `${formatNumber(battleState.evolutionChance * 100)}%`,
      '#FFFF99'               // light yellow
    );
  }
  if (battleState.stunChance > 0 && battleState.stunRealms.has(card.realm)) {
    add(
      'fa-hammer',
      `${formatNumber(battleState.stunChance * 100)}%`,
      '#A0C4FF'               // light gray-blue
    );
  }
  if (battleState.weakPointChance > 0 && battleState.weakPointRealms.has(card.realm)) {
    add(
      'fa-bullseye',
      `${formatNumber(battleState.weakPointChance * 100)}%`,
      '#FFAFAF'               // light red
    );
  }
  if (battleState.resourcefulAttack > 0 && battleState.resourcefulAttackRealms.has(card.realm)) {
    add(
      'fa-coins',
      `${formatNumber(battleState.resourcefulAttack)}`,
      '#3ACDB1'               // lightened #1abc9c
    );
  }
  if (battleState.dodgeChance > 0 && battleState.dodgeRealms.has(card.realm)) {
    add(
      'fa-cat',
      `${formatNumber(battleState.dodgeChance * 100)}%`,
      '#FFB6C1'               // light pink
    );
  }
  if (battleState.dismemberChance > 0 && battleState.dismemberRealms.has(card.realm)) {
    add(
      'fa-skull-crossbones',
      `${formatNumber(battleState.dismemberChance * 100)}%`,
      '#6AA48F'               // lightened #0e4b37
    );
  }

  return effects.length ? effects.join(' ') : '';
}


function clearExpiredLockouts() {
  const now = Date.now();
  Object.entries(state.battle.lockoutTimers).forEach(([cardId, endTime]) => {
    if (endTime <= now) {
      delete state.battle.lockoutTimers[cardId];
      const card = cardMap[cardId];
      if (card) {
        card.locked = false;
      }
    }
  });
}

// Update battle loop section in startBattleLoop
function startBattleLoop() {
  if (state.battle.battleInterval) {
    clearInterval(state.battle.battleInterval);
    state.battle.battleInterval = null;
  }

  // Only start if not paused and has requirements
  if (!state.battle.paused && state.battle.currentEnemy && state.battle.slots.some(slot => slot !== null)) {
    state.battle.battleInterval = setInterval(() => {
      // Skip entire loop if paused
      if (state.battle.paused) {
        return;
      }
      
      // Skip if no enemy or no cards in slot 0
      if (!state.battle.currentEnemy || !state.battle.slots[0]) {
        clearInterval(state.battle.battleInterval);
        state.battle.battleInterval = null;
        state.battle.paused = true;
        
        // Update pause button immediately if it exists
        const pauseBtn = document.querySelector('.battle-pause-btn');
        if (pauseBtn) {
          pauseBtn.classList.add('paused');
          pauseBtn.textContent = 'Start Battle';
        }
        
        updateBattleUI();
        return;
      }

      // Check enemy HP first
      if (state.battle.currentEnemy.currentHp <= 0) {
        defeatEnemy();
        return;
      }      
      
      if (state.battle.currentEnemy.name === 'Sephiroth' && Math.random() < 0.33) {
          showDamageNumber(0, 'enemy', 'dodge');
      }
      else {
        // Each card attacks
        state.battle.slots.forEach((card, index) => {
          if (!card) return;

          let numAttacks = 1;

          if(state.battle.extraAttackRealms.has(card.realm)) {
            while(Math.random() < state.battle.extraAttackChance) {
              numAttacks += 1;
            }
          }

          for (let i = 0; i < numAttacks; i++) {
            let isCrit = false;
            let isDodge = false;
            
            let specialDamageType = null;

            if (Math.random() < state.battle.critChance) {
              isCrit = true;
              damage = Math.ceil(card.attack * state.battle.critDamage);
            } else {
              damage = card.attack;
            }

            if (index != 0 && state.battle.empowermentRealms.has(state.battle.slots[index-1].realm) && state.battle.empowerment > 0) {
              damage = Math.ceil(damage * (1 + state.battle.empowerment));
              specialDamageType = 'empowerment';
            }

            if (state.battle.currentEnemy.name === 'Darth Vader' && Math.random() < 0.98) {
              damage *= 0.03;
            }

            if (state.battle.currentEnemy.name === 'Typhon' && Math.random() < 0.025) {
              state.battle.currentEnemy.currentHp += damage;
              showDamageNumber(damage, 'enemy', 'heal');
            } else if ((state.battle.currentEnemy.name === 'Dr Wily' && Math.random() < 0.25) ||
                      (state.battle.currentEnemy.name === 'Agent Smith' && Math.random() < 0.75) ||
                      (state.battle.currentEnemy.name === 'Your Ego' && Math.random() < 0.5)) {
              isDodge = true;
              showDamageNumber(0, 'enemy', 'dodge');
            } else if (state.battle.currentEnemy.name === 'Arceus' && Math.random() < 0.05) {
              const filledSlots = state.battle.slots
                .map((c, idx) => c ? idx : -1)
                .filter(idx => idx !== -1);
              if (filledSlots.length) {
                const slotIdx = filledSlots[Math.floor(Math.random() * filledSlots.length)];
                const targetCard = state.battle.slots[slotIdx];

                targetCard.currentHp -= damage;
                showDamageNumber(damage, `slot${slotIdx}`, 'confused');

                if (targetCard.currentHp <= 0) {
                  removeSlotCard(slotIdx);
                }
              }
            } else {
              if (!(state.battle.currentEnemy.name === 'Kaguya') || index === 0) {

                if (card.id === '1032' && damage >= state.battle.currentEnemy.maxHp && state.battle.currentEnemy.currentHp === state.battle.currentEnemy.maxHp) {
                  unlockAchievement('secret10');
                }

                state.battle.currentEnemy.currentHp -= damage;
                showDamageNumber(damage, 'enemy', isCrit ? 'crit' : specialDamageType);
              }
            }

            if (isCrit || !isDodge) {
              if (state.battle.weakPointRealms.has(card.realm) && Math.random() < state.battle.weakPointChance) {
                const weakPointDamage = Math.floor(state.battle.currentEnemy.currentHp * 0.01);
                state.battle.currentEnemy.currentHp -= weakPointDamage;
                showDamageNumber(weakPointDamage, 'enemy', 'weakPoint');
              }
              if (state.battle.dismemberRealms.has(card.realm) && Math.random() < state.battle.dismemberChance) {
                state.battle.currentEnemy.attack = Math.floor(state.battle.currentEnemy.attack * 0.99);
                updateBattleStats();
              }
            }

            if (state.battle.currentEnemy.name === 'Bowser') {
              const reflect = Math.floor(damage * 0.1);
              card.currentHp -= reflect;
              showDamageNumber(reflect, `slot${index}`, 'reflect');

              if (card.currentHp <= 0) {
                removeSlotCard(index);
              }
            } else if (state.battle.currentEnemy.name === 'Godzilla') {
              const reflect = Math.floor(damage * 0.15);
              card.currentHp -= reflect;
              showDamageNumber(reflect, `slot${index}`, 'reflect');

              if (card.currentHp <= 0) {
                removeSlotCard(index);
              }
            } else if (state.battle.currentEnemy.name === 'Cartman' && Math.random() < 0.1) {

              // target slot 0 if exists
              if (state.battle.slots[0]) {
                const fartDamage = Math.floor(state.battle.slots[0].maxHp * 0.05);
                state.battle.slots[0].currentHp -= fartDamage;
                showDamageNumber(fartDamage, 'slot0', 'fart');
                if (state.battle.slots[0].currentHp <= 0) {
                  removeSlotCard(0);
                }
              }
              // also target slot 1 if there's a card there
              if (state.battle.slots[1]) {
                const fartDamage = Math.floor(state.battle.slots[1].maxHp * 0.05);
                state.battle.slots[1].currentHp -= fartDamage;
                showDamageNumber(fartDamage, 'slot1', 'fart');
                if (state.battle.slots[1].currentHp <= 0) {
                  removeSlotCard(1);
                }
              }
            }

            if (state.battle.stunRealms.has(card.realm) && Math.random() < state.battle.stunChance) {
              state.battle.currentEnemy.stunTurns += 1;
              showDamageNumber(0, 'enemy', 'stun');
            }

            if (state.battle.evolutionRealms.has(card.realm) && Math.random() < state.battle.evolutionChance) {
              card.attack = Math.ceil(card.attack * (1 + (state.battle.evolutionChance / 2)));
              updateBattleStats();
            }

            if (state.battle.resourcefulAttackRealms.has(card.realm) && state.battle.resourcefulAttack > 0) {
                Object.entries(state.effects.currencyPerPoke).forEach(([curId, rate]) => {
                  if (!rate || state.currencies[curId] == null) return;
                  const gain = new Decimal(rate * state.effects.currencyPerPokeMultiplier[curId] * state.battle.resourcefulAttack);
                  state.currencies[curId] = state.currencies[curId].plus(gain);
                });
            }
          }
        });

        // Check for enemy defeat after all attacks
        if (state.battle.currentEnemy.currentHp <= 0) {
          if (state.battle.currentEnemy.name === 'Deadpool' && Math.random() < 0.69) {
            state.battle.currentEnemy.currentHp = state.battle.currentEnemy.maxHp;
            updateBattleStats();
            showDamageNumber(0, 'enemy', 'revived');
          } else {
            defeatEnemy();
            return;
          }
        }   
      }


      
      let numAttacks = 1;
      if (state.battle.currentEnemy.name === 'Cronus') {
        if (Math.random() < 0.5) {
          numAttacks = 2;
        }
      } else if (state.battle.currentEnemy.name === 'Chaos') {
        numAttacks = 2;
      } else if (state.battle.currentEnemy.name === 'Zeus' || state.battle.currentEnemy.name === 'Isshin') {
        numAttacks = 3;
      } else if(state.battle.currentEnemy.name === 'Aizen') {
        while(Math.random() < 0.5) {
          numAttacks += 1;
        }
      } else if(state.battle.currentEnemy.name === 'One Above All') {
        // build a list of filled slot indices once
        const filled = state.battle.slots
          .map((c, i) => c !== null ? i : -1)
          .filter(i => i !== -1);
        numAttacks = filled.length;
      }

      
      // 2) handle stun
      if (state.battle.currentEnemy.stunTurns > 0) {
        state.battle.currentEnemy.stunTurns--;
      } else {
        for (let i = 0; i < numAttacks; i++) {
          // don't attack if battle paused or no enemy
          if (state.battle.paused || !state.battle.currentEnemy) break;

          if (state.battle.currentEnemy.name === 'Pudge' && Math.random() < 0.25) {
            const filled = state.battle.slots.filter(c => c !== null);

            if (filled.length > 0) {
              const pulledCard = filled.pop();
              filled.unshift(pulledCard);

              const pullDamage = Math.floor(pulledCard.currentHp * 0.5);
              pulledCard.currentHp -= pullDamage;

              state.battle.slots = [
                ...filled,
                ...Array(state.battle.slotLimit - filled.length).fill(null)
              ];

              updateBattleUI();

              showDamageNumber(pullDamage, `slot0`, 'crit');
            }
          }
          
          // 1) pick which slot to hit
          let targetIdx = 0;
          if (state.battle.currentEnemy.name === 'Zeus' || (state.battle.currentEnemy.name === 'Isshin' && i != 0)) {
            // gather filled slots
            const filled = state.battle.slots
              .map((c, idx) => c !== null ? idx : -1)
              .filter(idx => idx !== -1);
            if (filled.length === 0) break;             // no cards to hit
            targetIdx = filled[Math.floor(Math.random() * filled.length)];
          }

          if (state.battle.currentEnemy.name === 'One Above All') {
            const filled = state.battle.slots
              .map((c, idx) => c !== null ? idx : -1)
              .filter(idx => idx !== -1);
            targetIdx = filled[filled.length - 1 - i];
          }

          const targetCard = state.battle.slots[targetIdx];
          if (!targetCard) continue;                   // safety

          // 3) dodge check
          if (
            state.battle.dodgeRealms.has(targetCard.realm) &&
            Math.random() < state.battle.dodgeChance
          ) {
            showDamageNumber(0, `slot${targetIdx}`, 'dodge');
            continue;
          }

          // 4) compute damage (absorb / protect)
          let damage = state.battle.currentEnemy.attack;
          let specialType = null;

          // absorb
          if (
            state.battle.damageAbsorptionRealms.has(targetCard.realm) &&
            state.battle.damageAbsorption > 0
          ) {
            damage *= (1 - state.battle.damageAbsorption);
            specialType = 'absorb';
          }

          // protection from the next card
          const nextCard = state.battle.slots[targetIdx + 1];
          if (
            nextCard &&
            state.battle.protectionRealms.has(nextCard.realm) &&
            Math.random() < state.battle.protectionChance
          ) {
            damage *= 0.5;
            specialType = 'protect';
          }

          if (state.battle.currentEnemy.name === 'Genghis Khan' && Math.random() < 0.25) {
            damage *= 3;
            specialType = 'empowerment';
          }

          if (state.battle.currentEnemy.name === 'Your Ego' && Math.random() < 0.05) {
            damage *= 5;
            specialType = 'empowerment';
          }

          if (state.battle.currentEnemy.name === 'Sauron' && Math.random() < 0.1) {
            damage = targetCard.maxHp * 1.01;
            specialType = 'empowerment';
          }

          // 5) apply damage
          targetCard.currentHp -= damage;
          showDamageNumber(damage, `slot${targetIdx}`, specialType);

          if ((state.battle.currentEnemy.name === 'Shao Kahn' || state.battle.currentEnemy.name === 'Kaguya') && Math.random() < 0.4) {
            const filled = state.battle.slots
              .map((c, idx) => c !== null ? idx : -1)
              .filter(idx => idx !== -1);

            if (filled.length) {
              const lastIdx = filled[filled.length - 1];
              const lastCard = state.battle.slots[lastIdx];

              lastCard.currentHp -= damage;
              showDamageNumber(damage, `slot${lastIdx}`, specialType);

              if (lastCard.currentHp <= 0) {
                removeSlotCard(lastIdx);
              }
            }
          }

          if (state.battle.currentEnemy.name === 'Hal9000') {
            // 1) Build sorted list of filled slots
            const filled = state.battle.slots
              .map((c, i) => c !== null ? i : -1)
              .filter(i => i !== -1);

            // 2) Find where our original hit landed
            const startPos = filled.indexOf(targetIdx);
            if (startPos !== -1) {
              // 3) Propagate half each time
              let splash = damage / 2;
              for (let p = startPos + 1; p < filled.length; p++) {
                const idx = filled[p];
                const splashAmt = Math.floor(splash);
                if (splashAmt <= 0) break;

                const card2 = state.battle.slots[idx];
                card2.currentHp -= splashAmt;
                showDamageNumber(splashAmt, `slot${idx}`, specialType);

                if (card2.currentHp <= 0) {
                  removeSlotCard(idx);
                }
                splash /= 2;
              }
            }
          }

          if (state.battle.currentEnemy.name === 'Thanos' && Math.random() < 0.04) {
            const filled = state.battle.slots
              .map((c,i) => c ? i : -1)
              .filter(i => i !== -1);
            if (filled.length) {
              const toKill = Math.ceil(filled.length/2);
              const killIdx = filled.sort(() => Math.random()-0.5).slice(0,toKill);
              killIdx.forEach(idx => {
                state.battle.slots[idx] = null;
                showDamageNumber(0, `slot${idx}`, 'snap');
              });
              state.battle.slots = state.battle.slots.filter(c => c !== null)
                                        .concat(Array(state.battle.slotLimit - filled.length).fill(null));
              updateBattleUI();
            }
          }

          if ((state.battle.currentEnemy.name === 'Rick' && Math.random() < 0.17) ||
              state.battle.currentEnemy.name === 'Kuzzi') {
            const filled = state.battle.slots
              .map((c, i) => c ? i : -1)
              .filter(i => i !== -1);

            if (filled.length) {
              const idx = filled[Math.floor(Math.random() * filled.length)];

              showDamageNumber(0, `slot${idx}`, 'snap');

              state.battle.slots[idx] = null;
              state.battle.slots = state.battle.slots
                .filter(c => c !== null)
                .concat(Array(state.battle.slotLimit - filled.length).fill(null));

              updateBattleUI();
            }
          }

          if (state.battle.currentEnemy.name === 'Doctor Manhattan') {
            const currencies = Object.keys(state.currencies);
            if (currencies.length) {
              const randKey = currencies[Math.floor(Math.random() * currencies.length)];
              const currVal    = state.currencies[randKey];
              const drainAmt   = currVal.mul(0.4).floor();
              state.currencies[randKey] = currVal.minus(drainAmt);
            }
          }

          if (state.battle.currentEnemy.name === 'Your Ego') {
            const currencies = Object.keys(state.currencies);
            if (currencies.length) {
              const randKey = currencies[Math.floor(Math.random() * currencies.length)];
              const currVal    = state.currencies[randKey];
              state.currencies[randKey] = currVal.minus(currVal);
            }
          }

          if ((state.battle.currentEnemy.name === 'Dracula' || state.battle.currentEnemy.name === 'Your Ego')
              && state.battle.currentEnemy.maxHp > state.battle.currentEnemy.currentHp) {
            const healAmount = Math.min(state.battle.currentEnemy.maxHp - state.battle.currentEnemy.currentHp, damage * 3);
            state.battle.currentEnemy.currentHp += healAmount;
            showDamageNumber(healAmount, 'enemy', 'heal');
          }

          if (state.battle.currentEnemy.name === 'Michael Scott' && Math.random() < 0.5) {
            const papercutDamage = targetCard.maxHp * 0.05;
            targetCard.currentHp -= papercutDamage;
            showDamageNumber(papercutDamage, `slot${targetIdx}`, 'papercut');
          }

          // 6) if killed, remove & shift
          if (targetCard.currentHp <= 0) {
            removeSlotCard(targetIdx);

            if (state.battle.currentEnemy.name === 'Galactus') {
              state.battle.currentEnemy.attack *= 1.5;
            }
          }
        }
      }

      if (state.battle.currentEnemy.name === 'Training Dummy' && state.battle.currentEnemy.currentHp < state.battle.currentEnemy.maxHp) {
        const healAmount = Math.min(state.battle.currentEnemy.maxHp - state.battle.currentEnemy.currentHp, state.battle.currentEnemy.currentHp * 0.001);
        state.battle.currentEnemy.currentHp += healAmount;
        showDamageNumber(healAmount, 'enemy', 'heal');
      } else if ((state.battle.currentEnemy.name === 'Gaia' || state.battle.currentEnemy.name === 'Papa Smurf') && state.battle.currentEnemy.currentHp < state.battle.currentEnemy.maxHp && Math.random() < 0.05) {
        const healAmount = Math.min(state.battle.currentEnemy.maxHp - state.battle.currentEnemy.currentHp, state.battle.currentEnemy.maxHp * 0.01);
        state.battle.currentEnemy.currentHp += healAmount;
        showDamageNumber(healAmount, 'enemy', 'heal');
      } else if (state.battle.currentEnemy.name === 'T800' && state.battle.currentEnemy.currentHp >= state.battle.currentEnemy.maxHp && Math.random() < 0.02) {
        const healAmount = Math.min(state.battle.currentEnemy.maxHp - state.battle.currentEnemy.currentHp, state.battle.currentEnemy.maxHp * 0.1);
        state.battle.currentEnemy.currentHp += healAmount;
        showDamageNumber(healAmount, 'enemy', 'heal');
      } else if (state.battle.currentEnemy.name === 'Nyx' && Math.random() < 0.03) {
        const filledIndices = state.battle.slots
          .map((card, i) => card !== null ? i : -1)
          .filter(i => i !== -1);

        if (filledIndices.length > 0) {
          const idx = filledIndices[
            Math.floor(Math.random() * filledIndices.length)
          ];

          removeSlotCard(idx);
        }
      } else if (state.battle.currentEnemy.name === 'Kratos') {
        state.battle.currentEnemy.attack *= 1.04;
        updateBattleStats();
      } else if (state.battle.currentEnemy.name === 'Vegeta' && state.battle.vegetaEvolutions < 5 && Math.random() < 0.1) {
        state.battle.currentEnemy.attack *= 2;
        state.battle.currentEnemy.currentHp *= 2;
        state.battle.currentEnemy.maxHp *= 2;
        state.battle.vegetaEvolutions += 1;
        updateBattleStats();
      } else if (state.battle.currentEnemy.name === 'Chuck Norris' && Math.random() < 0.2) {
        state.battle.currentEnemy.attack *= 1.1;
        updateBattleStats();
      } else if (state.battle.currentEnemy.name === 'Saitama') {
        state.battle.currentEnemy.attack *= 1.01;
        state.battle.slots.forEach((card, idx) => {
          if (!card) return;
          card.attack = Math.floor(card.attack * 0.9);
        });
        updateBattleStats();
      }

      // Save state and update UI
      saveState();
      if (currentTab === 'battles') {
        updateBattleStats();
      }
    }, 500);
  }
}

// Add filter menu functions
function showRealmFilterMenu(btn) {
  const menu = document.createElement('div');
  menu.className = 'filter-menu';

  // Build the options as <label> so clicks anywhere toggle
  const parts = [];

  // “All Realms”
  parts.push(`
    <label class="filter-option" data-realm="null">
      <input
        type="checkbox"
        id="realm-all"
        ${state.battle.filterRealms.length === 0 ? 'checked' : ''}
      />
      All Realms
    </label>
  `);

  // One per unlocked realm
  realms.filter(r => r.unlocked).forEach(r => {
    const checked = state.battle.filterRealms.includes(r.id) ? 'checked' : '';
    parts.push(`
      <label class="filter-option" data-realm="${r.id}"
             style="color: ${realmColors[r.id]};">
        <input
          type="checkbox"
          id="realm-${r.id}"
          ${checked}
        />
        ${r.name}
      </label>
    `);
  });

  // Done button
  parts.push(`<button class="filter-done-btn">Done</button>`);

  menu.innerHTML = parts.join('');
  document.body.appendChild(menu);

  // Position under the button
  const { bottom, left } = btn.getBoundingClientRect();
  Object.assign(menu.style, {
    position: 'fixed',
    top:    `${bottom + 4}px`,
    left:   `${left}px`,
    zIndex: '1000',
  });

  // Handle checkbox changes
  menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const opt = cb.closest('.filter-option');
      const val = opt.dataset.realm;

      if (val === 'null') {
        // “All” clears everything
        state.battle.filterRealms = [];
        menu.querySelectorAll('input').forEach(other => {
          if (other !== cb) other.checked = false;
        });
      } else {
        const id = Number(val);
        if (cb.checked) {
          state.battle.filterRealms.push(id);
        } else {
          state.battle.filterRealms = state.battle.filterRealms.filter(r => r !== id);
        }
        // Sync the “All” box
        menu.querySelector('#realm-all').checked = state.battle.filterRealms.length === 0;
      }
    });
  });

  // Close on Done
  menu.querySelector('.filter-done-btn').addEventListener('click', () => {
    menu.remove();
    updateBattleUI();
  });

  // Close & apply on outside click
  document.addEventListener('click', function onDocClick(e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', onDocClick);
      updateBattleUI();
    }
  });
}


function showRarityFilterMenu(btn) {
  const menu = document.createElement('div');
  menu.className = 'filter-menu';

  // Build the options as <label> so the entire row is clickable
  const parts = [];

  // “All Rarities”
  parts.push(`
    <label class="filter-option" data-rarity="null">
      <input
        type="checkbox"
        id="rarity-all"
        ${state.battle.filterRarities.length === 0 ? 'checked' : ''}
      />
      All Rarities
    </label>
  `);

  // One per rarity
  window.rarities.forEach(rarity => {
    const checked = state.battle.filterRarities.includes(rarity) ? 'checked' : '';
    parts.push(`
      <label class="filter-option" data-rarity="${rarity}"
             style="color: var(--rarity-${rarity});">
        <input
          type="checkbox"
          id="rarity-${rarity}"
          ${checked}
        />
        ${rarity.toUpperCase()}
      </label>
    `);
  });

  // Done button
  parts.push(`<button class="filter-done-btn">Done</button>`);

  menu.innerHTML = parts.join('');
  document.body.appendChild(menu);

  // Position under the button
  const { bottom, left } = btn.getBoundingClientRect();
  Object.assign(menu.style, {
    position: 'fixed',
    top:    `${bottom + 4}px`,
    left:   `${left}px`,
    zIndex: '1000',
  });

  // Handle checkbox changes
  menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const opt = cb.closest('.filter-option');
      const val = opt.dataset.rarity;

      if (val === 'null') {
        // “All” clears everything
        state.battle.filterRarities = [];
        menu.querySelectorAll('input').forEach(other => {
          if (other !== cb) other.checked = false;
        });
      } else {
        if (cb.checked) {
          state.battle.filterRarities.push(val);
        } else {
          state.battle.filterRarities =
            state.battle.filterRarities.filter(r => r !== val);
        }
        // Sync the “All” box
        menu.querySelector('#rarity-all').checked =
          state.battle.filterRarities.length === 0;
      }
    });
  });

  // Close on Done
  menu.querySelector('.filter-done-btn').addEventListener('click', () => {
    menu.remove();
    updateBattleUI();
  });

  // Close & apply on outside click
  document.addEventListener('click', function onDocClick(e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', onDocClick);
      updateBattleUI();
    }
  });
}





function showFilterMenu(btn, menu, onSelect) {
  // Position menu below button using fixed positioning
  const rect = btn.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${rect.left}px`;
  menu.style.zIndex = '1000'; // Ensure menu appears above other content
  
  // Add click handlers
  menu.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
      onSelect(option);
      menu.remove();
    });
  });

  // Add click outside to close
  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });

  document.body.appendChild(menu);
}

// Add help modal function
function showBattleHelp() {
  const dialog = document.createElement('div');
  dialog.className = 'sacrifice-dialog';
  dialog.innerHTML = `
    <div class="sacrifice-content battle-help-modal">
      <h2>How do Battles Work?</h2>

      <h3>Overview</h3>
      <p>Battles allow you to unlock cards by defeating them in combat. Each victory permanently unlocks that card for your black hole pokes.</p>

      <h3>Battle Mechanics</h3>
      <ul>
        <li><strong>Card Stats:</strong> In battle, cards use their Power × Tier × √Level for Attack, and Defense × √Quantity for HP.</li>
        <li><strong>Combat:</strong> Every 0.5 seconds, your cards attack the enemy, and the enemy attacks your front card.</li>
        <li><strong>Card Slots:</strong> You can place up to 3 cards in battle slots. The frontmost card takes damage while all cards deal damage.</li>
      </ul>

      <h3>Sacrificing Cards</h3>
      <ul>
        <li>To place a card in battle, you must sacrifice it from your collection.</li>
        <li>Sacrificing resets the card's level, tier, and quantity to 0.</li>
        <li>The sacrificed card is locked for 24 hours (can be reduced) after the battle. This prevents you from getting it from pokes and merchants.</li>
        <li>All effects from the sacrificed card are removed on sacrifice.</li>
        <li>When enemy is defeated, all sacrificed cards are removed - so choose carefully.</li>
      </ul>

      <h3>Strategy Tips</h3>
      <ul>
        <li>Place your highest HP card in front to tank damage.</li>
        <li>Use multiple cards to increase your total damage output.</li>
        <li>Consider the lockout timer when choosing cards to sacrifice.</li>
        <li>Check the enemy's stats to plan your strategy.</li>
        <li>Enemies do not heal between battles, so don't hesitate to launch smaller attacks to chip at their HP.</li>
      </ul>

      <h3>Battle Tricks & Achievements</h3>
      <ul>
        <li>Be sure to check out <strong>Greek God Battle Tricks</strong> on the Achievements tab. It shows which bosses have special achievements.</li>
        <li>These tricks activate when you sacrifice the correct card for the achievement—usually themed around Greek myth lore—and grant a bonus to that encounter.</li>
        <li>The achievement itself only needs to be unlocked once, but you can reuse the effect multiple times (even within the same fight once the card’s lockout timer has expired).</li>
        <li>If you missed unlocking any achievements, you can hit the <strong>Reset Battles</strong> button to try again.</li>
      </ul>

      <h3>Special Battle Stats</h3>
      <ul style="list-style:none; padding:0; display:flex; flex-wrap:wrap; gap:8px;">
        <li>
          <span style="color:#CCCCCC; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-shield-alt"></i> Damage Absorption - Reduces damage taken by that percentage
          </span>
        </li>
        <li>
          <span style="color:#BDE8F6; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-shield-virus"></i> Protection - Chance to protect the card in front of this card, absorbing 50% damage
          </span>
        </li>
        <li>
          <span style="color:#FFCC99; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-bolt"></i> Extra Attack Chance - Change to attack again (can proc multiple times)
          </span>
        </li>
        <li>
          <span style="color:#DDA0DD; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-fire"></i> Empowerment - Increase damage of card behind this card by that percentage
          </span>
        </li>
        <li>
          <span style="color:#FFFF99; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-dna"></i> Evolution Chance - On each attack, that percentage represents chance to gain attack equal to half that percentage (stackining multiplicatively)
          </span>
        </li>
        <li>
          <span style="color:#A0C4FF; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-hammer"></i> Stun Chance - Chance to stun the enemy card - forcing it to miss its attack that turn. Multiple stuns (from multiple cards with this effect) will stack and persist to the next turn
          </span>
        </li>
        <li>
          <span style="color:#FFAFAF; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-bullseye"></i> Weak Point Chance - Can only trigger on Critical Hit. This is % chance to do additional damage equal to 1% of enemy current health
          </span>
        </li>
        <li>
          <span style="color:#3ACDB1; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-coins"></i> Resourceful Attack - Each attack gain all resources equal to this many pokes (stacks with other cards with this effect)
          </span>
        </li>
        <li>
          <span style="color:#FFB6C1; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-cat"></i> Dodge Chance - Chance to dodge the enemy attack
          </span>
        </li>
        <li>
          <span style="color:#6AA48F; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-skull-crossbones"></i> Dismember Chance - Can only trigger on Critical Hit. This is % chance to reduce enemy attack by 1% (stacks multiplicatively)
          </span>
        </li>
      </ul>
    </div>
  `;

  // Handle click outside to close
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.remove();
    }
  });

  document.body.appendChild(dialog);
}

// Add reset battles dialog function
function showResetBattlesDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'sacrifice-dialog';
  dialog.innerHTML = `
    <div class="sacrifice-content battle-help-modal">
      <h2>Reset Battles</h2>
      <p>This will reset all your ${state.battle.currentBattleRealm === 11 ? 'Greek Gods' : 'Bosses'} enemies to fight all of them again. You will still keep your current quantities of ${state.battle.currentBattleRealm === 11 ? 'Greek Gods' : 'Bosses'} cards you have unlocked.</p>
      <p>Why would you want to do that? (Hint: achievement hunting or farming kill rewards) </p>
      <div class="reset-buttons">
        <button class="reset-confirm-btn">Reset Battles</button>
        <button class="reset-cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  // Add click handlers
  const confirmBtn = dialog.querySelector('.reset-confirm-btn');
  const cancelBtn = dialog.querySelector('.reset-cancel-btn');

  confirmBtn.addEventListener('click', () => {
    const bossCards = cards.filter(c => c.realm === state.battle.currentBattleRealm);
    
    bossCards.forEach(card => {
      card.locked = true;
      delete state.battle.lockoutTimers[card.id];
    });
    
    const firstBossRealm = realms.find(r => r.unlocked && r.id === state.battle.currentBattleRealm);
    if (firstBossRealm) {
      const firstBoss = cards.find(c => c.realm === firstBossRealm.id && !c.cantBeEnemy);
      if (firstBoss) {
        state.battle.currentEnemy = {
          ...firstBoss,
          maxHp: firstBoss.defense * (state.battle.currentBattleRealm === 11 ? 100000 : 400000),
          currentHp: firstBoss.defense * (state.battle.currentBattleRealm === 11 ? 100000 : 400000)
        };
      }
    }
    
    state.battle.slots = Array(state.battle.slotLimit).fill(null);
    state.battle.paused = true;

    if (state.battle.currentBattleRealm === 12) {
      state.battle.vegetaEvolutions = 0;
    }
    
    saveState();
    updateBattleUI();
    dialog.remove();
  });

  cancelBtn.addEventListener('click', () => {
    dialog.remove();
  });

  // Handle click outside to close
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.remove();
    }
  });

  document.body.appendChild(dialog);
}