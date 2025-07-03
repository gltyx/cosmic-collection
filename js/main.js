// js/main.js

const Decimal = window.Decimal;
const anime   = window.anime;

const globalFill = document.getElementById('global-cooldown-fill');
let fillAnim = null;

const drawArea = document.getElementById('draw-area');
const cardsList = document.getElementById('cards-list');
const holeBtn  = document.getElementById('hole-button');
let revealedCount    = 0;
let currentPackCount = 0;

// Add this at the top of the file, after the state initialization
let lastTouchX = 0;
let lastTouchY = 0;
let isScrolling = false;
let lastFlippedCard = null;

let lastCollectionCardIds  = [];

let blackHoleTimer; // Declare timer in a higher scope
let countdownEl;

let loadFinished = false;

// Add these at the top with other global variables
let merchantInterval;
let currencyInterval;
let gauntletInterval;
let touchMoveHandler;
let touchEndHandler;
let resizeHandler;
let orientationHandler;

// --- LOOKUP MAPS ---
const realmMap = {}, cardMap = {}, skillMap = {};
realms.forEach(r => realmMap[r.id] = r);
cards.forEach(c => cardMap[c.id]   = c);
skills.forEach(s => skillMap[s.id] = s);

// --- GAME STATE ---
window.state = {
  currencies: {},
  unlockedCurrencies: [],
  stats: {
    totalPokes: 0,
    totalCardsDrawn: 0,
    merchantPurchases: 0,
  },
  achievementsUnlocked: new Set(),
  achievementRewards: {
    maxCardsMultiplier: 1.0, // Default multiplier for max cards
    minCardsMultiplier: 1.0, // Default multiplier for min cards
    merchantPriceDivider: 1.0, // Default price divider for merchant
    minCardsPerPoke: 0, // Default minimum cards per poke
    maxCardsPerPoke: 0, // Default maximum cards per poke
    sacrificeTimeDivider: 1,
  },
  skillAdditionalSacrificeTimeDivider: 0,
  effects: {
    minCardsPerPoke: 1,
    maxCardsPerPoke: 4,
    currencyPerPoke: {},
    currencyPerSec:   {},
    cooldownDivider: 1,
    merchantNumCards: 2,
    cooldownSkipChance: 0,
    merchantCooldownReduction: 0,
    extraMerchantRarityScaling: 0,
    merchantPriceDivider: 1,
    currencyPerPokeMultiplier: {},
    currencyPerSecMultiplier: {},
    allGeneratorMultiplier: 1,
  },
  selectedRealms: [],      // newly added
  currentMerchant: null,
  merchantOffers: [],
  flipsDone: true,        // flag
  resourceGeneratorContribution: {},  // Track contributions for each resource
  harvesterValue: 0,
  absorberValue: 1,
  interceptorValue: 0,
  interceptorActive: false,
  timeCrunchValue: 0,
  merchantBulkChance: 0.25,
  merchantBuyAllDiscount: 0.05,
  merchantBulkRoot: 3,
  merchantBulkMult: 1,
  maxOfflineHours: 4, // Maximum hours to consider for offline earnings
  sacrificeLockoutTime: 24, // 24 hours lockout for sacrifices
  pokeRaritiesOmitted: [],
  hideOmittedRarities: true,  // New variable for checkbox state
  hideLockedCards: true, // New variable for checkbox state
  hideCappedCards: true, // New variable for checkbox state
  remainingCooldown: 0,    // Add remaining cooldown to state
  timeCrunchMaxChargeTime: 300, // 5 minutes max charge time
  donationButtonClicked: false,   // Track if donation button was clicked
  supporterCheckboxClicked: false, // Track if supporter checkbox was clicked
  effectFilters: {
    activeGroups: new Set(),
    oddsRealms:      new Set(),    // <realmId>
    oddsRarities:   new Set(),    // <rarity>
    unlockedRarities: new Set(), // Track unlocked rarities
    specialEffectsMode: 'none' // 'none' | 'show' | 'locked' | 'hide' for Special Effects filter
  },
  battle: {
    currentBattleRealm: 11,
    slots: [null, null, null], // 3 slots for cards in battle
    currentEnemy: null,
    battleInterval: null,
    startTimeout: null,
    critChance: 0,
    critDamage: 1.5,
    damageAbsorption: 0,
    damageAbsorptionRealms: new Set([1]),
    protectionChance: 0,
    protectionRealms: new Set([2]),
    evolutionChance: 0,
    evolutionRealms: new Set([3]),
    extraAttackChance: 0,
    extraAttackRealms: new Set([4]),
    empowerment: 0,
    empowermentRealms: new Set([5]),
    stunChance: 0,
    stunRealms: new Set([6]),
    weakPointChance: 0,
    weakPointRealms: new Set([7]),
    resourcefulAttack: 0,
    resourcefulAttackRealms: new Set([8]),
    dodgeChance: 0,
    dodgeRealms: new Set([9]),
    dismemberChance: 0,
    dismemberRealms: new Set([10]),
    slotLimit: 3,
    lockoutTimers: {}, // Keep this for temporary lockouts
    pendingLockoutTimers: {}, // For cards that are battle-locked but have pending sacrifice lockouts
    initialized: false,
    sortBy: 'power',
    paused: true,
    autoBattle: false, // Auto-Battle toggle state
    sortBy: 'power',
    sortDirection: 'desc',
    filterRealms: [],
    filterRarities: [],
    globalAttackMult: 1,
    globalHPMult: 1,
    globalMaxCardsMult: 1,
    vegetaEvolutions: 0,
    loopDuration: 500,
  },
  showDeviceHoverInfo: true,
  showTierUps: true,  // Add this line
  autoUseAbsorber: false,  // Add this line
  skipSacrificeDialog: false,  // Add this line
  skipRemoveFromBattleDialog: false,  // Add this line
  currencySpendingPercentage: 1.0, // Percentage of currency to spend on leveling (0.01 to 1.0)
  lastUnstuck: null, // Track last unstuck time
  cardSizeScale: 1, // Track card size scale
  rocksAgainstCronus: new Set(),
  zeusSacrifices: new Set(),
  lastSelectedRealmsCheatDetector: false,
  realmsWithAllT20: new Set(), // Track realms where all cards have reached T20
  runningGauntlet: false,
  gauntletStartTime: null, // Timestamp when Gauntlet started
  gauntletNotifications: new Set(), // Track which notifications have been shown
};

// init currencies & effects
currencies.forEach(c => {
  state.currencies[c.id]              = new Decimal(0);
  state.effects.currencyPerPoke[c.id] = 0;
  state.effects.currencyPerSec[c.id]  = 0;
  state.effects.currencyPerPokeMultiplier[c.id] = 1;
  state.effects.currencyPerSecMultiplier[c.id] = 1;
});

// --- PERSISTENCE ---
const SAVE_KEY = 'ccgSave';
function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const obj = JSON.parse(raw);
    obj.unlockedRealms.forEach(rid  => realmMap[rid].unlocked = true);
    // Load achievements
    if (Array.isArray(obj.achievementsUnlocked)) {
      state.achievementsUnlocked = new Set(obj.achievementsUnlocked);
      state.achievementsUnlocked.forEach(achievementId => {
        unlockAchievement(achievementId, duringLoad=true);
      })
    }
    // First apply purchased skills
    if (Array.isArray(obj.purchasedSkills)) {
      obj.purchasedSkills.forEach(sid => {
        applySkill(Number(sid), /*skipCost=*/true);
      });
    }
    Object.entries(obj.currencies).forEach(([cid,val])=>{
      state.currencies[cid] = new Decimal(val);
    });
    state.unlockedCurrencies = obj.unlockedCurrencies || [];
    state.harvesterValue = obj.harvesterValue || 0;
    state.absorberValue = obj.absorberValue || 1;
    state.interceptorValue = obj.interceptorValue || 0;
    state.interceptorActive = obj.interceptorActive || false;
    state.timeCrunchValue = obj.timeCrunchValue || 0;  // Load Time Crunch value
    state.merchantRefreshTime = obj.merchantRefreshTime || 0;
    state.supporterCheckboxClicked = obj.supporterCheckboxClicked || false;
    state.donationButtonClicked = obj.donationButtonClicked || false;
    state.rocksAgainstCronus = new Set(obj.rocksAgainstCronus || []);
    state.zeusSacrifices = new Set(obj.zeusSacrifices || []);
    state.lastSelectedRealmsCheatDetector = obj.lastSelectedRealmsCheatDetector || false;
    state.realmsWithAllT20 = new Set(obj.realmsWithAllT20 || []);
    state.runningGauntlet = obj.runningGauntlet || false;
    state.gauntletStartTime = obj.gauntletStartTime || null;
    state.gauntletNotifications = new Set(obj.gauntletNotifications || []);
        
    // === Determine whether any saved card actually has a `locked` property ===
    const savedOwned = obj.ownedCards || {};
    const anySavedHasLocked = Object.values(savedOwned).some(data => data.hasOwnProperty('locked'));

    Object.entries(obj.ownedCards).forEach(([cid,data])=>{
      const c = cardMap[cid];
      if (c) {
        c.quantity = data.quantity;
        c.level    = data.level;
        c.tier     = data.tier;
        c.isNew    = data.isNew;
        if (anySavedHasLocked) {
          c.locked   = data.locked ?? true;
        }
      }
    });
    state.stats.totalPokes = obj.stats.totalPokes || 0;
    state.stats.totalCardsDrawn = obj.stats.totalCardsDrawn || 0;
    state.stats.merchantPurchases = obj.stats.merchantPurchases || 0;
    state.remainingCooldown = obj.remainingCooldown || 0;
    state.lastSaveTime = obj.lastSaveTime || null;
    if (obj.currentMerchantId != null) {
      const m = merchants.find(m=>m.id===obj.currentMerchantId);
      state.currentMerchant = m || null;
    }
    if (Array.isArray(obj.merchantOffers)) {
      state.merchantOffers = obj.merchantOffers.map(o => ({
        cardId:   o.cardId,
        currency: o.currency,
        price:    new Decimal(o.price),
        quantity: o.quantity || 1
      }));
    }

    // Load battle state
    if (obj.battle) {
      state.battle.currentBattleRealm = obj.battle.currentBattleRealm || 11;
      state.battle.slots = obj.battle.slots.map(slot => {
        if (!slot) return null;
        const card = cardMap[slot.id];
        if (!card) return null;
        return {
          ...card,
          attack: slot.attack,
          currentHp: slot.currentHp,
          maxHp: slot.maxHp,
          quantity: slot.quantity,
          originalQuantity: slot.originalQuantity
        };
      });
      state.battle.currentEnemy = obj.battle.currentEnemy ? cardMap[obj.battle.currentEnemy.id] : null;
      if (state.battle.currentEnemy) {
        state.battle.currentEnemy.currentHp = obj.battle.currentEnemy.currentHp;
        state.battle.currentEnemy.maxHp = obj.battle.currentEnemy.maxHp;
        state.battle.currentEnemy.attack = obj.battle.currentEnemy.attack;
        state.battle.currentEnemy.stunTurns = 0;
      }
      state.battle.lockoutTimers = obj.battle.lockoutTimers;
      state.battle.pendingLockoutTimers = obj.battle.pendingLockoutTimers || {};
      state.battle.sortBy = obj.battle.sortBy || 'power';
      state.battle.globalAttackMult = obj.battle.globalAttackMult || 1;
      state.battle.globalHPMult = obj.battle.globalHPMult || 1;
      state.battle.globalMaxCardsMult = obj.battle.globalMaxCardsMult || 1;
      state.battle.vegetaEvolutions = obj.battle.vegetaEvolutions || 0;

      // Update lockout timer checking
      const now = Date.now();
      Object.entries(obj.battle.lockoutTimers || {}).forEach(([cardId, endTime]) => {
        if (endTime <= now) {
          delete state.battle.lockoutTimers[cardId];
          const card = cardMap[cardId];
          if (card) {
            card.locked = false;
          }
        } else {
          state.battle.lockoutTimers[cardId] = endTime;
          const card = cardMap[cardId];
          if (card) {
            card.locked = true;
          }
        }
      });

      // Clean up expired pending lockout timers during load
      Object.entries(obj.battle.pendingLockoutTimers || {}).forEach(([cardId, endTime]) => {
        if (endTime <= now) {
          delete state.battle.pendingLockoutTimers[cardId];
        } else {
          state.battle.pendingLockoutTimers[cardId] = endTime;
        }
      });
    }
    state.showTierUps = obj.showTierUps ?? true; // Add this line with default true
    state.showDeviceHoverInfo = obj.showDeviceHoverInfo ?? true; // Add this line with default true
    state.autoUseAbsorber = obj.autoUseAbsorber ?? false; // Add this line with default false
    state.skipSacrificeDialog = obj.skipSacrificeDialog ?? false; // Add this line with default false
    state.skipRemoveFromBattleDialog = obj.skipRemoveFromBattleDialog ?? false; // Add this line with default false
    state.currencySpendingPercentage = obj.currencySpendingPercentage ?? 1.0; // Add this line with default 1.0
    state.cardSizeScale = obj.cardSizeScale || 1;
    state.lastUnstuck = obj.lastUnstuck || null;

    // Load effect filters
    if (obj.effectFilters) {
      state.effectFilters.activeGroups = new Set(obj.effectFilters.activeGroups || []);
      state.effectFilters.oddsRealms = new Set(obj.effectFilters.oddsRealms || []);
      state.effectFilters.oddsRarities = new Set(obj.effectFilters.oddsRarities || []);
      state.effectFilters.unlockedRarities = new Set(obj.effectFilters.unlockedRarities || []);
      // specialEffectsMode always defaults to 'none' on load
    }
  } catch(e){
    console.error("Failed to load save:", e);
  }
}
function saveState() {
  state.lastSaveTime = Date.now();
  const obj = {
    unlockedRealms:  realms.filter(r=>r.unlocked).map(r=>r.id),
    purchasedSkills: skills.filter(s=>s.purchased).map(s=>s.id),
    currencies:      {},
    unlockedCurrencies: state.unlockedCurrencies,
    achievementsUnlocked: Array.from(state.achievementsUnlocked),
    ownedCards:      {},
    stats:           { totalPokes: state.stats.totalPokes, merchantPurchases: state.stats.merchantPurchases, totalCardsDrawn: state.stats.totalCardsDrawn },
    harvesterValue: state.harvesterValue,
    absorberValue: state.absorberValue,
    interceptorValue: state.interceptorValue,
    interceptorActive: state.interceptorActive,
    timeCrunchValue: state.timeCrunchValue,
    currentMerchantId: state.currentMerchant?.id ?? null,
    supporterCheckboxClicked: state.supporterCheckboxClicked,
    donationButtonClicked: state.donationButtonClicked,
    merchantOffers: state.merchantOffers.map(o => ({
      cardId:   o.cardId,
      currency: o.currency,
      price:    o.price.toString(),
      quantity: o.quantity || 1
    })),
    merchantRefreshTime: nextRefresh ? nextRefresh - Date.now() : null,
    lastSaveTime: Date.now(),
    remainingCooldown: state.remainingCooldown,
    showTierUps: state.showTierUps,  // Add this line
    showDeviceHoverInfo: state.showDeviceHoverInfo,
    autoUseAbsorber: state.autoUseAbsorber,
    skipSacrificeDialog: state.skipSacrificeDialog,
    skipRemoveFromBattleDialog: state.skipRemoveFromBattleDialog,
    currencySpendingPercentage: state.currencySpendingPercentage,
    cardSizeScale: state.cardSizeScale,
    lastUnstuck: state.lastUnstuck,
    battle: {
      currentBattleRealm: state.battle.currentBattleRealm,
      slots: state.battle.slots.map(slot => slot ? {
        id: slot.id,
        attack: slot.attack,
        currentHp: slot.currentHp,
        maxHp: slot.maxHp,
        quantity: slot.quantity,
        originalQuantity: slot.originalQuantity
      } : null),
      currentEnemy: state.battle.currentEnemy ? {
        id: state.battle.currentEnemy.id,
        currentHp: state.battle.currentEnemy.currentHp,
        maxHp: state.battle.currentEnemy.maxHp,
        attack: state.battle.currentEnemy.attack
      } : null,
      lockoutTimers: state.battle.lockoutTimers,
      pendingLockoutTimers: state.battle.pendingLockoutTimers,
      sortBy: state.battle.sortBy,
      globalAttackMult: state.battle.globalAttackMult,
      globalHPMult: state.battle.globalHPMult,
      globalMaxCardsMult: state.battle.globalMaxCardsMult,
      vegetaEvolutions: state.battle.vegetaEvolutions
    },
    rocksAgainstCronus: Array.from(state.rocksAgainstCronus),
    zeusSacrifices: Array.from(state.zeusSacrifices),
    lastSelectedRealmsCheatDetector: state.lastSelectedRealmsCheatDetector,
    realmsWithAllT20: Array.from(state.realmsWithAllT20),
    runningGauntlet: state.runningGauntlet,
    gauntletStartTime: state.gauntletStartTime,
    gauntletNotifications: Array.from(state.gauntletNotifications),
    effectFilters: {
      activeGroups: Array.from(state.effectFilters.activeGroups),
      oddsRealms: Array.from(state.effectFilters.oddsRealms),
      oddsRarities: Array.from(state.effectFilters.oddsRarities),
      unlockedRarities: Array.from(state.effectFilters.unlockedRarities)
      // Note: specialEffectsMode is not saved, always defaults to 'none'
    }
  };
  currencies.forEach(c => {
    obj.currencies[c.id] = state.currencies[c.id].toString();
  });
  cards.forEach(c=> {
    obj.ownedCards[c.id] = {
      quantity: c.quantity,
      level:    c.level,
      tier:     c.tier,
      isNew:    c.isNew,
      locked:   c.locked
    };
  });
  localStorage.setItem(SAVE_KEY, JSON.stringify(obj));
}

// js/main.js (excerpt)

// after loading realms, cards & skills, and after your `window.rarities = […]` line:

// 1) Derive the full ordered list of rarities
const allRarities = window.rarities;  // e.g. ["junk", "basic", …, "divine"]

// 2) Initialize empty maps
const realmCardMap       = {};
const rarityCardMap      = {};
const realmRarityCardMap = {};

// 3) For each realm, set up its card lists and initialize every rarity
realms.forEach(r => {
  realmCardMap[r.id]       = [];
  realmRarityCardMap[r.id] = {};
  allRarities.forEach(rarity => {
    realmRarityCardMap[r.id][rarity] = [];
  });
});

// 4) For each rarity, initialize its global list
allRarities.forEach(rarity => {
  rarityCardMap[rarity] = [];
});

cards.forEach(c => {
  // by realm
  realmCardMap[c.realm].push(c.id);

  // by rarity
  if (!rarityCardMap[c.rarity]) {
    console.warn(`Unknown rarity on card ${c.id}: ${c.rarity}`);
    rarityCardMap[c.rarity] = [];
  }
  rarityCardMap[c.rarity].push(c.id);

  // by realm+rarity
  if (!realmRarityCardMap[c.realm][c.rarity]) {
    console.warn(`No pool for realm ${c.realm} + rarity ${c.rarity}`);
    realmRarityCardMap[c.realm][c.rarity] = [];
  }
  realmRarityCardMap[c.realm][c.rarity].push(c.id);
});


// --- HELPERS ---

// pick one key based on weights object { key: weight, ... }
function weightedPick(weights) {
  let total = 0;
  for (let w of Object.values(weights)) total += w;
  let rnd = Math.random() * total;
  for (let [key, w] of Object.entries(weights)) {
    if (rnd < w) return key;
    rnd -= w;
  }
}

// --- UI HELPERS ---
function updateCurrencyBar() {
  const bar = document.getElementById('currency-bar');
  bar.innerHTML = '';

  // unlock any new currencies
  currencies.forEach(c => {
    if (state.currencies[c.id].greaterThan(0)
        && !state.unlockedCurrencies.includes(c.id)) {
      state.unlockedCurrencies.push(c.id);
    }
  });

  // render them in the grid
  state.unlockedCurrencies.forEach(cid => {
    const meta = currencies.find(x => x.id === cid);
    if (!meta) return;

    const div = document.createElement('div');
    div.className = 'currency-item';

    // Calculate gains for tooltip
    const perPokeRate = (state.effects.currencyPerPoke[cid] || 0) * (state.effects.currencyPerPokeMultiplier[cid] || 1);
    const perSecRate = (state.effects.currencyPerSec[cid] || 0) * (state.effects.currencyPerSecMultiplier[cid] || 1);
    const generatorContribution = state.resourceGeneratorContribution[cid] || 0;
    const totalPerSecRate = perSecRate + generatorContribution;

    // Create tooltip content
    let tooltipContent = `<strong>${meta.name}</strong><br>`;
    if (perPokeRate > 0) {
      tooltipContent += `Per Poke: +${formatNumber(perPokeRate)}<br>`;
    }
    if (totalPerSecRate > 0) {
      tooltipContent += `Per Second: +${formatNumber(totalPerSecRate)}`;
      if (generatorContribution > 0) {
        tooltipContent += ` (${formatNumber(perSecRate)} + ${formatNumber(generatorContribution)} generator)`;
      }
    }
    if (perPokeRate === 0 && totalPerSecRate === 0) {
      tooltipContent += `No active generation`;
    }

    // Store tooltip data for later use
    div.setAttribute('data-currency-id', cid);
    div.setAttribute('data-currency-name', meta.name);

    const currencyPath = `assets/images/currencies/${meta.icon}`;
    imageCache.getImage('currencies', currencyPath).then(img => {
      if (img) {
        div.innerHTML = `
          <img class="icon" src="${img.src}" alt="${meta.name}" />
          <span class="amount">${formatNumber(state.currencies[cid])}</span>
        `;
      }
    });
    bar.appendChild(div);
  });

  // Setup tooltip event listeners only once
  setupCurrencyTooltips();
}

// Global tooltip element to prevent flickering
let currencyTooltip = null;
let tooltipTimeout = null;

// Setup tooltip functionality for currency items
function setupCurrencyTooltips() {
  const currencyItems = document.querySelectorAll('.currency-item');

  currencyItems.forEach(item => {
    // Skip if already has tooltip listeners
    if (item.hasAttribute('data-tooltip-setup')) return;
    item.setAttribute('data-tooltip-setup', 'true');

    const showTooltip = (e) => {
      const currencyId = item.getAttribute('data-currency-id');
      const currencyName = item.getAttribute('data-currency-name');

      if (!currencyId) return;

      // Calculate tooltip content fresh
      const perPokeRate = (state.effects.currencyPerPoke[currencyId] || 0) * (state.effects.currencyPerPokeMultiplier[currencyId] || 1);
      const perSecRate = (state.effects.currencyPerSec[currencyId] || 0) * (state.effects.currencyPerSecMultiplier[currencyId] || 1);
      const generatorContribution = state.resourceGeneratorContribution[currencyId] || 0;
      const totalPerSecRate = perSecRate + generatorContribution;

      let tooltipContent = `<strong>${currencyName}</strong><br>`;
      if (perPokeRate > 0) {
        tooltipContent += `Per Poke: +${formatNumber(perPokeRate)}<br>`;
      }
      if (totalPerSecRate > 0) {
        tooltipContent += `Per Second: +${formatNumber(totalPerSecRate)}`;
        if (generatorContribution > 0) {
          tooltipContent += `<br><small>(${formatNumber(perSecRate)} + ${formatNumber(generatorContribution)} generator)</small>`;
        }
      }
      if (perPokeRate === 0 && totalPerSecRate === 0) {
        tooltipContent += `No active generation`;
      }

      // Clear any existing timeout
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }

      // Create or update tooltip
      if (!currencyTooltip) {
        currencyTooltip = document.createElement('div');
        currencyTooltip.className = 'currency-tooltip';
        document.body.appendChild(currencyTooltip);
      }

      currencyTooltip.innerHTML = tooltipContent;

      // Position tooltip with smart bounds checking
      const rect = item.getBoundingClientRect();
      const tooltipRect = currencyTooltip.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      let top = rect.top - tooltipRect.height - 10;

      // Adjust if tooltip goes off screen
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) {
        // Show below if no room above
        top = rect.bottom + 10;
        currencyTooltip.classList.add('below');
      } else {
        currencyTooltip.classList.remove('below');
      }

      currencyTooltip.style.left = left + 'px';
      currencyTooltip.style.top = top + 'px';
      currencyTooltip.classList.add('visible');
    };

    const hideTooltip = () => {
      if (currencyTooltip) {
        tooltipTimeout = setTimeout(() => {
          if (currencyTooltip) {
            currencyTooltip.classList.remove('visible');
            setTimeout(() => {
              if (currencyTooltip && !currencyTooltip.classList.contains('visible')) {
                currencyTooltip.remove();
                currencyTooltip = null;
              }
            }, 200);
          }
        }, 100); // Small delay to prevent flickering when moving between currency items
      }
    };

    // Add event listeners
    item.addEventListener('mouseenter', showTooltip);
    item.addEventListener('mouseleave', hideTooltip);

    // Touch support for mobile
    item.addEventListener('touchstart', (e) => {
      e.preventDefault();
      showTooltip(e);
      // Hide after 3 seconds on touch
      setTimeout(hideTooltip, 3000);
    });
  });
}

let currentTab = 'hole';

let adInjected = false;

function showTab(tab) {
  const tabs = ['hole','cards','skills','merchant','battles','achievements','stats','settings'];
  tabs.forEach(t=>{
    document.getElementById(`tab-content-${t}`)
      .style.display = (t===tab ? 'block' : 'none');
    document.getElementById(`tab-btn-${t}`)
      .classList.toggle('active', t===tab);
  });
  if (tab==='cards')      { initCardsFilters(); renderCardsCollection(); }
  else if (tab==='stats') updateStatsUI();
  else if (tab==='skills'){ initSkillsFilters(); renderSkillsTab(); }
  else if (tab === 'merchant') {
    document.getElementById('tab-btn-merchant')
      .classList.remove('new-offers');
    removeMerchantIcon();
    renderMerchantTab();
  }
  else if (tab === 'battles') {
    updateBattleUI();
  } else if (tab === 'settings') {
    
    if (!adInjected) {
      adInjected = true;
      if (window.location.pathname.includes("/cosmic_collection")) {
        // Load AdSense script once
        const adsScript = document.createElement("script");
        adsScript.async = true;
        adsScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1862340236898418";
        adsScript.crossOrigin = "anonymous";
        document.head.appendChild(adsScript);

        // Wait for script to load before adding ad
        adsScript.onload = () => {
          const adContainer = document.createElement("ins");
          adContainer.className = "adsbygoogle";
          adContainer.style = "display:block; margin-top: 20px;";
          adContainer.setAttribute("data-ad-client", "ca-pub-1862340236898418");
          adContainer.setAttribute("data-ad-slot", "9994375638");
          adContainer.setAttribute("data-ad-format", "auto");
          adContainer.setAttribute("data-full-width-responsive", "true");

          document.getElementById("settings-footer-ad").appendChild(adContainer);
          (adsbygoogle = window.adsbygoogle || []).push({});
        };
      }
    }
  }
  currentTab = tab;
}

// --- POKE & REVEAL ---

const ramsSet = new Set([1,4,7,9]);

function performPoke() {
  if (!drawArea.classList.contains('hole-draw-area')) return;

  // Check and clean expired lockouts
  clearExpiredLockouts();

  holeBtn.disabled = true;
  holeBtn.classList.add('disabled');

  // Increment absorber value
  if (window.incrementAbsorber) {
    window.incrementAbsorber();
  }

  // Get absorber multiplier
  const absorberMultiplier = window.getAbsorberMultiplier ? window.getAbsorberMultiplier() : 1;

  // reset UI & state
  drawArea.innerHTML = '';
  revealedCount = 0;
  state.flipsDone = false;

  if (state.selectedRealms.length === 1 && (state.selectedRealms[0] === 11 || state.selectedRealms[0] === 12)) {
    state.lastSelectedRealmsCheatDetector = true;
  } else {
    state.lastSelectedRealmsCheatDetector = false;
  }

  // how many cards to draw this poke
  const e     = state.effects;

  const min = (e.minCardsPerPoke + state.achievementRewards.minCardsPerPoke) * state.achievementRewards.minCardsMultiplier;
  const max = (e.maxCardsPerPoke + state.achievementRewards.maxCardsPerPoke) * state.achievementRewards.maxCardsMultiplier * state.battle.globalMaxCardsMult * (state.supporterCheckboxClicked ? 1.25 : 1);

  const ratio = max / min;
  const logWeight = ratio >= 90 ? 0.9 : ratio / 100; // equivalent to ratio/10%

  // Logarithmic random: between log(min) and log(max)
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logRand = Math.exp(Math.random() * (logMax - logMin) + logMin);

  // Linear random
  const linearRand = Math.random() * (max - min) + min;

  // Blend
  const blended = logRand * logWeight + linearRand * (1 - logWeight);

  // Final draws calculation
  let draws = Math.floor(Math.floor(blended + 1) * absorberMultiplier);

  const isSpecialCondition = skillMap[30001].purchased && state.selectedRealms.includes(9) && state.selectedRealms.includes(12);

  if (isSpecialCondition) {
    draws *= 11;
  }

  // Create and animate floating number
  const floatingNumber = document.createElement('div');
  floatingNumber.className = 'floating-number';
  if (isSpecialCondition) {
    floatingNumber.classList.add('floating-number-pink');
  }
  floatingNumber.textContent = formatNumber(draws);

  state.stats.totalCardsDrawn += draws;
  checkAchievements('massivePoke', draws);
  checkAchievements('inItForTheLongHaul');
  
  // Position it at the center of the black hole, accounting for scroll
  const holeRect = holeBtn.getBoundingClientRect();
  floatingNumber.style.left = (holeRect.left + holeRect.width / 2) + 'px';
  floatingNumber.style.top = (holeRect.top + holeRect.height / 2) + 'px';
  
  document.body.appendChild(floatingNumber);
  
  // Remove the element after animation completes
  floatingNumber.addEventListener('animationend', () => {
    floatingNumber.remove();
  });

  // build realm → weight map
  const realmWeights = {};
  state.selectedRealms.forEach(rid => {
    const r = realmMap[rid];
    if (r.unlocked) realmWeights[rid] = r.pokeWeight;
  });

  if (state.selectedRealms.length === 1 && state.selectedRealms[0] === 4) {
    unlockAchievement('secret3');
  }
  if (state.selectedRealms.length === 4 && [...state.selectedRealms].every(value => ramsSet.has(value))) {
    unlockAchievement('secret5');
  }

  // ————— BULK SAMPLING —————
  const picksCounts = {};
  
  // Get realm IDs from weights
  const realmIds = Object.keys(realmWeights).map(Number);
  
  // First normalize realm weights
  const realmWeightTotal = Object.values(realmWeights).reduce((a, b) => a + b, 0);
  const normalizedRealmWeights = {};
  Object.entries(realmWeights).forEach(([realmId, weight]) => {
    normalizedRealmWeights[realmId] = weight / realmWeightTotal;
  });
  
  // Sample realms first
  const realmDraws = multinomialSample(draws, Object.values(normalizedRealmWeights));
  
  // Then for each realm, sample rarities
  realmIds.forEach((realmId, realmIdx) => {
    const count = realmDraws[realmIdx];
    if (!count) return;
    
    const rr = realmMap[realmId];
    const rarityWeights = rr.rarityWeights;
    
    // Sample rarities within this realm
    const rarityDraws = multinomialSample(count, Object.values(rarityWeights));
    
    // Process each rarity's draws
    Object.entries(rarityWeights).forEach(([rarity, _], rarityIdx) => {
      const rarityCount = rarityDraws[rarityIdx];
      if (!rarityCount) return;
      
      const pool = realmRarityCardMap[realmId][rarity];
      if (!pool || pool.length === 0) return;
      
      // For large counts, use the efficient algorithm
      if (rarityCount > 1000) {
        const expectedPerCard = rarityCount / pool.length;
        const baseCount = Math.floor(expectedPerCard);
        const remainder = rarityCount - (baseCount * pool.length);
        
        // Assign base count to all cards
        pool.forEach(cid => {
          if (cid && cardMap[cid]) {
            picksCounts[cid] = (picksCounts[cid] || 0) + baseCount;
          }
        });
        
        // Distribute remainder randomly
        if (remainder > 0) {
          const shuffled = [...pool].sort(() => Math.random() - 0.5);
          for (let i = 0; i < remainder; i++) {
            const cid = shuffled[i];
            if (cid && cardMap[cid]) {
              picksCounts[cid] = (picksCounts[cid] || 0) + 1;
            }
          }
        }
      } else {
        // For small counts, use random selection
        for (let i = 0; i < rarityCount; i++) {
          const randomIndex = Math.floor(Math.random() * pool.length);
          const cid = pool[randomIndex];
          if (cid && cardMap[cid]) {
            picksCounts[cid] = (picksCounts[cid] || 0) + 1;
          }
        }
      }
    });
  });

  //increment total pokes
  state.stats.totalPokes++;
  checkAchievements('holePoker');

  //global per-poke currencies
  Object.entries(state.effects.currencyPerPoke).forEach(([curId, rate]) => {
    if (!rate || state.currencies[curId] == null) return;
    state.currencies[curId] =
      state.currencies[curId].plus(new Decimal(rate * state.effects.currencyPerPokeMultiplier[curId] * (skillMap[30008].purchased ? 6.9 : 1) ));
  });

  // Check for affordable skills after currency update
  checkAffordableSkills();

  // how many unique cards to reveal
  currentPackCount = Object.keys(picksCounts).length;
  skippedCards = 0;

  // ————— AWARD & RENDER each unique card —————
  Object.entries(picksCounts).forEach(([cid, count]) => {
    // Safety check: skip if card ID is undefined or card doesn't exist
    if (!cid || cid === 'undefined' || !cardMap[cid]) {
      console.warn(`Skipping invalid card ID: ${cid}`);
      return;
    }

    const c       = cardMap[cid];
    const wasNew  = c.quantity === 0;
    const oldTier = c.tier;
    
    if (state.hideLockedCards && skillMap[18101].purchased && c.locked) {
      skippedCards++;
      if (currentPackCount === skippedCards) {
        state.flipsDone = true;
      }
      return;
    }

    // Check if card is locked using card.locked property
    if (!c.locked) {
      giveCard(cid, count);
    }

    if (state.hideCappedCards && skillMap[18102].purchased && oldTier === 20) {
      skippedCards++;
      if (currentPackCount === skippedCards) {
        state.flipsDone = true;
      }
      return;
    }
    
    const newTier = c.locked ? oldTier : c.tier;

    // Skip rendering if card meets omission criteria
    if (state.hideOmittedRarities && 
        state.pokeRaritiesOmitted.includes(c.rarity) && 
        !wasNew && 
        newTier === oldTier) {
      skippedCards++;
      if (currentPackCount === skippedCards) {
        state.flipsDone = true;
      }
      return;
    }

    // 4) build & append the DOM tile
    const rr    = realmMap[c.realm];
    const outer = document.createElement('div');
    outer.className = 'card-outer';

    const inner = document.createElement('div');
    inner.className = 'card-inner';
    inner.dataset.id = cid;

    // back
    const back = document.createElement('img');
    back.className = 'card-face back';
    const backPath = `assets/images/card_backs/${rr.name.toLowerCase().replace(/ /g,'_')}_card_back.jpg`;
    imageCache.getImage('cardBacks', backPath).then(img => {
        if (img) back.src = img.src;
    });

    // front
    const front = document.createElement('div');
    front.className = 'card-face front';
    front.style.borderColor = realmColors[rr.id];

    const frameImg = document.createElement('img');
    frameImg.className = 'card-frame';
    const framePath = `assets/images/frames/${c.rarity}_frame.jpg`;
    imageCache.getImage('frames', framePath).then(img => {
        if (img) frameImg.src = img.src;
    });

    const contentImg = document.createElement('img');
    contentImg.className = 'card-image';
    const cardPath = `assets/images/cards/${c.realm}/${slugify(c.name)}.jpg`;
    imageCache.getImage('cards', cardPath).then(img => {
        if (img) contentImg.src = img.src;
    });

    // Special Effects S indicator
    if (Array.isArray(c.specialEffects) && c.specialEffects.length > 0) {
      // Check if all requirements are met
      const allMet = c.specialEffects.every(def => isSpecialEffectRequirementMet(c, def.requirement));
      const sSpan = document.createElement('span');
      sSpan.className = 'special-s-indicator' + (allMet ? ' special-s-glow' : ' special-s-dull');
      sSpan.textContent = 'S';
      front.appendChild(sSpan);
    }

    front.append(frameImg, contentImg);

    if (c.locked) {
      const lockedOverlay = document.createElement('div');
      lockedOverlay.className = 'card-locked-overlay';
      const lockedImg = document.createElement('img');
      lockedImg.src = 'assets/images/card_locked.png';
      lockedOverlay.appendChild(lockedImg);
      front.append(lockedOverlay);

      // Add countdown if card is in lockoutTimers
      if (state.battle.lockoutTimers[c.id]) {
        const countdownEl = document.createElement('div');
        countdownEl.className = 'lock-countdown';
        const remainingTime = state.battle.lockoutTimers[c.id] - Date.now();
        countdownEl.innerHTML = `Locked for<br>${formatDuration(remainingTime / 1000)}`;
        front.append(countdownEl);
      }

      const badge = document.createElement('div');
      badge.className = 'count-badge';
      badge.classList.add('locked');
      badge.innerHTML = "0";
      front.append(badge);
    }
    else {
      if (c.tier > 0) {
        const tierIcon = document.createElement('img');
        tierIcon.className = 'tier-icon';
        const tierPath = `assets/images/tiers/tier_${c.tier}.png`;
        imageCache.getImage('tiers', tierPath).then(img => {
            if (img) tierIcon.src = img.src;
        });
        tierIcon.alt = `Tier ${c.tier}`;

        const lvlLabel = document.createElement('div');
        lvlLabel.className   = 'level-label';
        lvlLabel.textContent = `Lvl: ${formatNumber(c.level)}`;

        front.append(tierIcon, lvlLabel);
      }

      if (count > 1) {
        const badge = document.createElement('div');
        badge.className = 'count-badge';
        badge.innerHTML = formatQuantity(count);
        front.append(badge);
      }

      if (wasNew || c.isNew) {
        const badge = document.createElement('div');
        badge.className = 'reveal-badge new-badge';
        badge.textContent = 'NEW';
        front.append(badge);
        if (wasNew && state.interceptorActive && skillMap[12204].purchased) {
          state.interceptorValue = state.interceptorValue + 15;
          if (state.interceptorValue > 86400) {
            unlockAchievement('secret17');
          }
        }
      } else if (newTier > oldTier) {
        const badge = document.createElement('div');
        badge.className = 'reveal-badge tierup-badge';
        badge.textContent = 'TIER UP';
        front.append(badge);
        if (state.interceptorActive && skillMap[12204].purchased) {
          state.interceptorValue = state.interceptorValue + 2;
        }
      }
    }

    inner.append(back, front);
    outer.append(inner);
    drawArea.append(outer);

    // Check if interceptor is active
    if (state.interceptorActive) {
      // Auto-flip after a short delay
      setTimeout(() => {
        if (!inner.classList.contains('revealed')) {
          inner.classList.add('revealed');
          revealedCount++;

          const onFlipEnd = e => {
            if (e.propertyName === 'transform') {
              if (c.locked) {
                inner.classList.add('locked');
                inner.addEventListener('animationend', () => inner.classList.remove('locked'), { once: true });
              } else if (wasNew) {
                inner.classList.add('spin');
                inner.addEventListener('animationend', () => inner.classList.remove('spin'), { once: true });
              } else if (newTier > oldTier) {
                inner.classList.add('shake');
                inner.addEventListener('animationend', () => inner.classList.remove('shake'), { once: true });
              }
            }
            inner.removeEventListener('transitionend', onFlipEnd);
          };
          inner.addEventListener('transitionend', onFlipEnd);

          if (revealedCount === currentPackCount - skippedCards) {
            state.flipsDone = true;
            tryEnableHole();
          }
        }
      }, 100);
    } else {
      // Normal hover to flip behavior
      outer.addEventListener('mouseenter', () => {
        if (!inner.classList.contains('revealed')) {
          inner.classList.add('revealed');
          revealedCount++;

          // Increment interceptor value
          window.incrementInterceptor();

          const onFlipEnd = e => {
            if (e.propertyName === 'transform') {
              if (c.locked) {
                inner.classList.add('locked');
                inner.addEventListener('animationend', () => inner.classList.remove('locked'), { once: true });
              } else if (wasNew) {
                inner.classList.add('spin');
                inner.addEventListener('animationend', () => inner.classList.remove('spin'), { once: true });
              } else if (newTier > oldTier) {
                inner.classList.add('shake');
                inner.addEventListener('animationend', () => inner.classList.remove('shake'), { once: true });
              }
            }
            inner.removeEventListener('transitionend', onFlipEnd);
          };
          inner.addEventListener('transitionend', onFlipEnd);

          if (revealedCount === currentPackCount - skippedCards) {
            state.flipsDone = true;
            if ((currentPackCount - skippedCards) >= 250) {
              unlockAchievement('secret9');
            }
            tryEnableHole();
          }
        }
      });
    }

    // click to open modal
    outer.addEventListener('click', () => {
      if (inner.classList.contains('revealed')) openModal(cid);
    });
  });

  startCooldown();

  updateHarvesterUI();
}

// Add this after the performPoke function
document.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  
  // Check if we're scrolling
  const deltaY = Math.abs(touch.clientY - lastTouchY);
  const deltaX = Math.abs(touch.clientX - lastTouchX);
  lastTouchX = touch.clientX;
  lastTouchY = touch.clientY;

  if (deltaY > deltaX && deltaY > 10) {
    isScrolling = true;
    return;
  }

  // Check all cards in the draw area
  const cards = drawArea.querySelectorAll('.card-outer');
  cards.forEach(outer => {
    const inner = outer.querySelector('.card-inner');
    if (!inner) return;

    const rect = outer.getBoundingClientRect();
    const isOverCard = (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );

    // If we're over this card and it's not the last one we flipped
    if (isOverCard && lastFlippedCard !== outer && !inner.classList.contains('revealed')) {
      // Flip the card
      inner.classList.add('revealed');
      lastFlippedCard = outer;
      revealedCount++;

      // Increment interceptor value
      window.incrementInterceptor();

      const onFlipEnd = e => {
        if (e.propertyName === 'transform') {
          const cid = inner.dataset.id;
          const c = cardMap[cid];
          if (c.isNew) {
            inner.classList.add('spin');
            inner.addEventListener('animationend', () => inner.classList.remove('spin'), { once: true });
          } else if (c.tier > c.lastTier) {
            inner.classList.add('shake');
            inner.addEventListener('animationend', () => inner.classList.remove('shake'), { once: true });
          }
        }
        inner.removeEventListener('transitionend', onFlipEnd);
      };
      inner.addEventListener('transitionend', onFlipEnd);

      if (revealedCount === currentPackCount - skippedCards) {
        state.flipsDone = true;
        if ((currentPackCount - skippedCards) >= 250) {
          unlockAchievement('secret9');
        }
        tryEnableHole();
      }
    }
  });
}, { passive: true });

// Reset scrolling state when touch ends
document.addEventListener('touchend', () => {
  isScrolling = false;
  lastFlippedCard = null;
}, { passive: true });

function tryEnableHole() {
  if (state.remainingCooldown <= 0 && state.flipsDone) {
    holeBtn.disabled = false;
    holeBtn.classList.remove('disabled');

    // update harvester UI
    updateHarvesterUI();

    // grow from a point
    anime({
      targets: holeBtn,
      scale:   [0, 1],
      duration: 1000,
      easing:  'easeOutBack'
    });

    if (skillMap[12203].purchased && state.interceptorActive) {
      performPoke();
    }
  }
}

// Create tooltip element
let holeTooltip = null;

function createHoleTooltip() {
  if (holeTooltip) return holeTooltip;

  holeTooltip = document.createElement('div');
  holeTooltip.className = 'hole-tooltip';
  holeTooltip.style.cssText = `
    position: absolute;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9em;
    font-family: var(--ui-font);
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;
  document.body.appendChild(holeTooltip);
  return holeTooltip;
}

function updateHoleTooltipContent() {
  if (!holeTooltip) return;

  const e = state.effects;
  let minCards = Math.floor((e.minCardsPerPoke + state.achievementRewards.minCardsPerPoke) * state.achievementRewards.minCardsMultiplier);
  let maxCards = Math.floor((e.maxCardsPerPoke + state.achievementRewards.maxCardsPerPoke) * (state.achievementRewards.maxCardsMultiplier) * (state.battle.globalMaxCardsMult) * (state.supporterCheckboxClicked ? 1.25 : 1));

  // Apply absorber multiplier
  const absorberMult = getAbsorberMultiplier(tooltipInfoOnly = true);
  minCards = Math.floor(minCards * absorberMult);
  maxCards = Math.floor(maxCards * absorberMult);

  // Check for special condition (realm 9 + 12 with skill 30001)
  const isSpecialCondition = skillMap[30001].purchased && state.selectedRealms.includes(9) && state.selectedRealms.includes(12);
  if (isSpecialCondition) {
    minCards *= 11;
    maxCards *= 11;
  }

  // Determine card value colors
  let cardColor = 'white';
  if (absorberMult > 1) {
    cardColor = '#20b2aa'; // Teal-green for absorber multiplier
  } else if (isSpecialCondition) {
    cardColor = '#ff69b4'; // Pink for special condition
  }

  // Get cooldown info and color
  const cooldownSum = calculateCooldown();
  const cooldownTxt = formatDuration(cooldownSum);
  const cooldownColor = getCooldownColor(cooldownSum, forTooltip = true);
  const skipChance = Math.round((state.effects.cooldownSkipChance || 0) * 100);

  holeTooltip.innerHTML = `
    <div>Poke Cards: <span style="color: ${cardColor}">${formatNumber(minCards)} - ${formatNumber(maxCards)}</span></div>
    <div>Cooldown: <span style="color: ${cooldownColor}">${cooldownTxt}</span> (${skipChance}% skip)</div>
  `;

  if (skillMap[30008].purchased) {
    holeTooltip.innerHTML += `<div style="color: gray">♥ Get 6.9x Pokes of Currencies ♥</div>`;
  }
}

function showHoleTooltip(e) {
  if (holeBtn.disabled || holeBtn.classList.contains('disabled')) return;

  const tooltip = createHoleTooltip();
  updateHoleTooltipContent();

  const rect = holeBtn.getBoundingClientRect();
  const left = rect.left + rect.width / 2 + window.scrollX;
  const top = rect.top + window.scrollY - 10;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.opacity = '0.9';
}

function hideHoleTooltip() {
  if (holeTooltip) {
    holeTooltip.style.opacity = '0';
  }
}

// Add hover event listeners
holeBtn.addEventListener('mouseenter', showHoleTooltip);
holeBtn.addEventListener('mouseleave', hideHoleTooltip);

// Device tooltips
let deviceTooltips = {};

function createDeviceTooltip(deviceName) {
  if (deviceTooltips[deviceName]) return deviceTooltips[deviceName];

  const tooltip = document.createElement('div');
  tooltip.className = 'device-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9em;
    font-family: var(--ui-font);
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    white-space: normal;
    line-height: 1.3;
  `;
  document.body.appendChild(tooltip);
  deviceTooltips[deviceName] = tooltip;
  return tooltip;
}

function updateHarvesterTooltipContent() {
  const tooltip = deviceTooltips['harvester'];
  if (!tooltip) return;

  const isAvailable = state.harvesterValue > 1 && state.remainingCooldown > 0;

  // Base online rate: 0.01, skill 12002 doubles it
  const onlineRate = 0.01 * (skillMap[12002].purchased ? 2 : 1);
  // Offline rate: 10x slower unless skill 12003 is purchased
  const offlineRate = skillMap[12003].purchased ? onlineRate : onlineRate / 10;

  let content = `<div><strong>Hawking Radiation <em>Harvester</em></strong></div>`;

  if (isAvailable) {
    const reductionAmount = Math.min(state.harvesterValue, state.remainingCooldown);
    content += `<div>Click to reduce Black Hole cooldown by ${formatDuration(reductionAmount)}</div>`;
  } else {
    content += `<div>Used to reduce Black Hole cooldown</div>`;
  }

  // make the harvesting rate gray color
  content += `<div style="color:gray">Harvesting Rate: ${formatDuration(onlineRate, 2)} / sec</div>`;

  if (!skillMap[12003].purchased) {
    content += `<div style="color:gray">Offline Rate: ${formatDuration(offlineRate, 3)} / sec</div>`;
  }

  if (skillMap[12004].purchased) {
    content += `<div style="color:gray">Poke Bonus: +1% of cooldown time</div>`;
  }

  tooltip.innerHTML = content;
}

function updateAbsorberTooltipContent() {
  const tooltip = deviceTooltips['absorber'];
  if (!tooltip) return;

  // Check if absorber is active by looking at the button class
  const absorberButton = document.getElementById('absorber-button');
  const isAbsorberActive = absorberButton && absorberButton.classList.contains('active');
  const isAvailable = state.absorberValue > 1 && !isAbsorberActive;
  if (!isAvailable) return;

  // Calculate absorption rate display
  let absorptionRateText;
  if (skillMap[30016].purchased) {
    absorptionRateText = `+3 / poke`;
  } else if (skillMap[12104].purchased) {
    absorptionRateText = `${state.selectedRealms.length}(realms) * ${skillMap[12102].purchased ? '0.1' : '0.05'} / poke`;
  }  else {
    const absorptionRate = 0.05 * (skillMap[12102].purchased ? 2 : 1);
    absorptionRateText = `${formatNumber(absorptionRate)} / poke`;
  }

  tooltip.innerHTML = `
    <div><strong>Gravitational Wave <em>Absorber</em></strong></div>
    <div>Click for next poke to give ${formatNumber(state.absorberValue)}x cards</div>
    <div style="color:gray">Absorption Rate: ${absorptionRateText}</div>
  `;
}

function updateInterceptorTooltipContent() {
  const tooltip = deviceTooltips['interceptor'];
  if (!tooltip) return;

  // Passive rate: base 0.01, skill 12202 doubles it (only affects passive charging)
  const passiveRate = 0.01 * (skillMap[12202].purchased ? 2 : 1);

  let content = `<div><strong>Space Bending <em>Interceptor</em></strong></div>`;

  if (state.interceptorActive) {
    if (!skillMap[12206].purchased) {
      content += `<div>Cannot be turned off (until a certain skill is purchased)</div>`;
    } else {
      const reductionAmount = state.remainingCooldown + 60;
      content += `<div>Click to turn off - will lose ${formatDuration(reductionAmount)}</div>`;
    }

    if (skillMap[12204].purchased) {
      content += `<div style="color:gray">Bonus Charge: +15s / new, +2s / tier up</div>`;
    }
  } else {
    const actionText = skillMap[12203].purchased ? "poking and card flipping" : "card flipping";
    content += `<div>Click to activate automatic ${actionText} for ${formatDuration(state.interceptorValue)}</div>`;
    content += `<div style="color:gray">Passive Charge: ${formatDuration(passiveRate, 2)} / sec</div>`;

    const activeRate = passiveRate * (skillMap[12205].purchased ? 2.5 : 1);
    content += `<div style="color:gray">Manual Charge: ${formatDuration(activeRate, 2)} / card flip</div>`;
  }

  tooltip.innerHTML = content;
}

function updateTimeCrunchTooltipContent() {
  const tooltip = deviceTooltips['timeCrunch'];
  if (!tooltip) return;

  const timeUntilCharged = Math.max(0, state.timeCrunchMaxChargeTime - state.timeCrunchValue);
  const pokeMultiplier = skillMap[30008].purchased ? 690 : (skillMap[12302].purchased ? 100 : 25);

  // Calculate total currency gain
  let totalGain = 0;
  Object.entries(state.effects.currencyPerPoke).forEach(([curId, rate]) => {
    if (rate && state.currencies[curId] != null) {
      totalGain += rate * pokeMultiplier * state.effects.currencyPerPokeMultiplier[curId];
    }
  });

  tooltip.innerHTML = `
    <div><strong>Time Crunch <em>Collector</em></strong></div>
    <div>Time until charged: ${formatDuration(timeUntilCharged)}</div>
    <div>Click to gain currency equal to ${formatNumber(pokeMultiplier)} pokes</div>
  `;
}

function showDeviceTooltip(deviceName, element) {
  const tooltip = createDeviceTooltip(deviceName);

  // Update content based on device type
  switch(deviceName) {
    case 'harvester':
      updateHarvesterTooltipContent();
      break;
    case 'absorber':
      updateAbsorberTooltipContent();
      break;
    case 'interceptor':
      updateInterceptorTooltipContent();
      break;
    case 'timeCrunch':
      updateTimeCrunchTooltipContent();
      break;
  }

  // Position the tooltip
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;

  // Temporarily make tooltip visible to measure it
  tooltip.style.opacity = '0';
  tooltip.style.visibility = 'visible';
  const tooltipRect = tooltip.getBoundingClientRect();
  tooltip.style.visibility = 'hidden';

  // Calculate initial centered position
  let left = rect.left + rect.width / 2 + window.scrollX;
  const top = rect.top + window.scrollY - 10;

  // Check if tooltip would go off the left edge
  const tooltipHalfWidth = tooltipRect.width / 2;
  if (left - tooltipHalfWidth < 10) {
    // Position tooltip to the right of the left edge with some padding
    left = tooltipHalfWidth + 10;
    tooltip.style.transform = 'translateX(-50%)';
  }
  // Check if tooltip would go off the right edge
  else if (left + tooltipHalfWidth > viewportWidth - 10) {
    // Position tooltip to the left of the right edge with some padding
    left = viewportWidth - tooltipHalfWidth - 10;
    tooltip.style.transform = 'translateX(-50%)';
  }
  // Normal centered positioning
  else {
    tooltip.style.transform = 'translateX(-50%)';
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.visibility = 'visible';
  tooltip.style.opacity = '0.9';
}

function hideDeviceTooltip(deviceName) {
  const tooltip = deviceTooltips[deviceName];
  if (tooltip) {
    tooltip.style.opacity = '0';
    // Hide after transition completes
    setTimeout(() => {
      if (tooltip.style.opacity === '0') {
        tooltip.style.visibility = 'hidden';
      }
    }, 200);
  }
}

// Add mobile long press support
let longPressTimer = null;
let isLongPressing = false;

holeBtn.addEventListener('touchstart', (e) => {
  if (holeBtn.disabled || holeBtn.classList.contains('disabled')) return;

  isLongPressing = false;
  longPressTimer = setTimeout(() => {
    isLongPressing = true;
    showHoleTooltip();
  }, 500); // 500ms long press
});

holeBtn.addEventListener('touchend', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  if (isLongPressing) {
    hideHoleTooltip();
    isLongPressing = false;
  }
});

holeBtn.addEventListener('touchmove', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  if (isLongPressing) {
    hideHoleTooltip();
    isLongPressing = false;
  }
});

holeBtn.addEventListener('click', ()=>{
  if (holeBtn.disabled || holeBtn.classList.contains('animating')) return;

  // Clear long press timer and hide tooltip immediately when clicked
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  hideHoleTooltip();
  isLongPressing = false;

  holeBtn.classList.add('animating');

  const pokeAnim = anime({
    targets: holeBtn,
    scale:   [1,1.3,1],
    duration:400,
    easing: 'easeInOutQuad'
  });

  // Add CSS class for take animation
  const cardOuters = document.querySelectorAll('#draw-area .card-outer');
  cardOuters.forEach(card => {
    card.classList.add('taking');
  });

  const takeAnim = anime({
    targets: '#draw-area .card-outer',
    opacity: [1,0],
    duration: 500,
    easing: 'easeInBack',
    complete: ()=>{
      // Remove the taking class after animation
      cardOuters.forEach(card => {
        card.classList.remove('taking');
      });
      performPoke();
      updateCurrencyBar();
    }
  });

  Promise.all([ pokeAnim.finished, takeAnim.finished ])
    .then(()=> holeBtn.classList.remove('animating'));
});

// Device button event listeners
function initDeviceTooltips() {
  // Harvester tooltips
  const harvesterButton = document.getElementById('harvester-button');
  if (harvesterButton) {
    // Prevent default drag/context menu behavior
    harvesterButton.addEventListener('dragstart', (e) => e.preventDefault());
    harvesterButton.addEventListener('contextmenu', (e) => e.preventDefault());

    harvesterButton.addEventListener('mouseenter', () => {
      if (state.showDeviceHoverInfo) {
        showDeviceTooltip('harvester', harvesterButton);
      }
    });
    harvesterButton.addEventListener('mouseleave', () => hideDeviceTooltip('harvester'));
    harvesterButton.addEventListener('click', () => hideDeviceTooltip('harvester'));

    // Mobile long press for harvester
    let harvesterLongPressTimer = null;
    let harvesterIsLongPressing = false;

    harvesterButton.addEventListener('touchstart', (e) => {
      harvesterIsLongPressing = false;
      harvesterLongPressTimer = setTimeout(() => {
        harvesterIsLongPressing = true;
        if (state.showDeviceHoverInfo) {
          showDeviceTooltip('harvester', harvesterButton);
        }
      }, 500);
    });

    harvesterButton.addEventListener('touchend', () => {
      if (harvesterLongPressTimer) {
        clearTimeout(harvesterLongPressTimer);
        harvesterLongPressTimer = null;
      }
      if (harvesterIsLongPressing) {
        hideDeviceTooltip('harvester');
        harvesterIsLongPressing = false;
      }
    });
  }

  // Absorber tooltips
  const absorberButton = document.getElementById('absorber-button');
  if (absorberButton) {
    // Prevent default drag/context menu behavior
    absorberButton.addEventListener('dragstart', (e) => e.preventDefault());
    absorberButton.addEventListener('contextmenu', (e) => e.preventDefault());

    absorberButton.addEventListener('mouseenter', () => {
      const isAbsorberActive = absorberButton.classList.contains('active');
      if (state.showDeviceHoverInfo && state.absorberValue > 1 && !isAbsorberActive) {
        showDeviceTooltip('absorber', absorberButton);
      }
    });
    absorberButton.addEventListener('mouseleave', () => hideDeviceTooltip('absorber'));
    absorberButton.addEventListener('click', () => hideDeviceTooltip('absorber'));

    // Mobile long press for absorber
    let absorberLongPressTimer = null;
    let absorberIsLongPressing = false;

    absorberButton.addEventListener('touchstart', (e) => {
      const isAbsorberActive = absorberButton.classList.contains('active');
      if (!(state.absorberValue > 1 && !isAbsorberActive)) return;

      absorberIsLongPressing = false;
      absorberLongPressTimer = setTimeout(() => {
        absorberIsLongPressing = true;
        if (state.showDeviceHoverInfo) {
          showDeviceTooltip('absorber', absorberButton);
        }
      }, 500);
    });

    absorberButton.addEventListener('touchend', () => {
      if (absorberLongPressTimer) {
        clearTimeout(absorberLongPressTimer);
        absorberLongPressTimer = null;
      }
      if (absorberIsLongPressing) {
        hideDeviceTooltip('absorber');
        absorberIsLongPressing = false;
      }
    });
  }

  // Interceptor tooltips
  const interceptorButton = document.getElementById('interceptor-button');
  if (interceptorButton) {
    // Prevent default drag/context menu behavior
    interceptorButton.addEventListener('dragstart', (e) => e.preventDefault());
    interceptorButton.addEventListener('contextmenu', (e) => e.preventDefault());

    interceptorButton.addEventListener('mouseenter', () => {
      if (state.showDeviceHoverInfo) {
        showDeviceTooltip('interceptor', interceptorButton);
      }
    });
    interceptorButton.addEventListener('mouseleave', () => hideDeviceTooltip('interceptor'));
    interceptorButton.addEventListener('click', () => hideDeviceTooltip('interceptor'));

    // Mobile long press for interceptor
    let interceptorLongPressTimer = null;
    let interceptorIsLongPressing = false;

    interceptorButton.addEventListener('touchstart', (e) => {
      interceptorIsLongPressing = false;
      interceptorLongPressTimer = setTimeout(() => {
        interceptorIsLongPressing = true;
        if (state.showDeviceHoverInfo) {
          showDeviceTooltip('interceptor', interceptorButton);
        }
      }, 500);
    });

    interceptorButton.addEventListener('touchend', () => {
      if (interceptorLongPressTimer) {
        clearTimeout(interceptorLongPressTimer);
        interceptorLongPressTimer = null;
      }
      if (interceptorIsLongPressing) {
        hideDeviceTooltip('interceptor');
        interceptorIsLongPressing = false;
      }
    });
  }

  // Time Crunch tooltips - use container since button has pointer-events: none when disabled
  const timeCrunchContainer = document.getElementById('time-crunch-container');
  const timeCrunchButton = document.getElementById('time-crunch-button');
  if (timeCrunchContainer && timeCrunchButton) {
    // Prevent default drag/context menu behavior
    timeCrunchContainer.addEventListener('dragstart', (e) => e.preventDefault());
    timeCrunchContainer.addEventListener('contextmenu', (e) => e.preventDefault());
    timeCrunchButton.addEventListener('dragstart', (e) => e.preventDefault());
    timeCrunchButton.addEventListener('contextmenu', (e) => e.preventDefault());

    timeCrunchContainer.addEventListener('mouseenter', () => {
      if (state.showDeviceHoverInfo) {
        showDeviceTooltip('timeCrunch', timeCrunchButton);
      }
    });
    timeCrunchContainer.addEventListener('mouseleave', () => hideDeviceTooltip('timeCrunch'));
    timeCrunchContainer.addEventListener('click', () => hideDeviceTooltip('timeCrunch'));

    // Mobile long press for time crunch
    let timeCrunchLongPressTimer = null;
    let timeCrunchIsLongPressing = false;

    timeCrunchContainer.addEventListener('touchstart', (e) => {
      timeCrunchIsLongPressing = false;
      timeCrunchLongPressTimer = setTimeout(() => {
        timeCrunchIsLongPressing = true;
        if (state.showDeviceHoverInfo) {
          showDeviceTooltip('timeCrunch', timeCrunchButton);
        }
      }, 500);
    });

    timeCrunchContainer.addEventListener('touchend', () => {
      if (timeCrunchLongPressTimer) {
        clearTimeout(timeCrunchLongPressTimer);
        timeCrunchLongPressTimer = null;
      }
      if (timeCrunchIsLongPressing) {
        hideDeviceTooltip('timeCrunch');
        timeCrunchIsLongPressing = false;
      }
    });
  }
}

// --- CARD MODAL ---
function openModal(cardId) {
  const c     = cardMap[cardId];
  const rar   = c.rarity;
  const realm = c.realm;
  const rr    = realmMap[realm];
  const color = realmColors[realm];
  const alpha = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--modal-opacity'));

  const wasNew = c.isNew;
  const hasTierUp = c.hasTierUp;
  c.isNew = false;
  c.hasTierUp = false;  // Add this line to clear the tier up flag

  checkForNewCards();

  // OVERLAY
  const ov = document.createElement('div');
  let handleKey = null;
  ov.className = `modal-overlay modal-${rar}`;
  ov.onclick = () => {
    ov.remove();
    if (currentTab === 'cards' && (wasNew || hasTierUp)) {
      initCardsFilters();
      renderCardsCollection();
    }
  };

  // helper to tear down this modal's keyboard listener + overlay (available to all parts of modal)
  const closeThisModal = () => {
    if (ov._handleKey) document.removeEventListener('keydown', ov._handleKey);
    ov.remove();
  };

  // Add navigation arrows if we're in the cards tab
  if (currentTab === 'cards') {
    const scrollableCardsList = lastCollectionCardIds.filter(id => cardMap[id].quantity > 0);
    const idx  = scrollableCardsList.indexOf(cardId);

    // left arrow
    const leftArrow = document.createElement('div');
    leftArrow.className = 'modal-nav-arrow modal-nav-left';
    leftArrow.textContent = '←';
    if (idx > 0) {
      leftArrow.classList.add('active');
      leftArrow.addEventListener('click', e => {
        e.stopPropagation();
        closeThisModal();
        if (wasNew) {
          initCardsFilters();
          renderCardsCollection();
        }
        openModal(scrollableCardsList[idx - 1]);
      });
    }

    // right arrow
    const rightArrow = document.createElement('div');
    rightArrow.className = 'modal-nav-arrow modal-nav-right';
    rightArrow.textContent = '→';
    if (idx < scrollableCardsList.length - 1) {
      rightArrow.classList.add('active');
      rightArrow.addEventListener('click', e => {
        e.stopPropagation();
        closeThisModal();
        if (wasNew) {
          initCardsFilters();
          renderCardsCollection();
        }
        openModal(scrollableCardsList[idx + 1]);
      });
    }

    ov.append(leftArrow, rightArrow);

    // keyboard handler
    const handleKey = e => {
      // Get fresh scrollable cards list and current index
      const freshScrollableCardsList = lastCollectionCardIds.filter(id => cardMap[id].quantity > 0);
      const freshIdx = freshScrollableCardsList.indexOf(cardId);

      if (e.key === 'ArrowLeft' && freshIdx > 0) {
        closeThisModal();
        if (wasNew) {
          initCardsFilters();
          renderCardsCollection();
        }
        openModal(freshScrollableCardsList[freshIdx - 1]);
      }
      if (e.key === 'ArrowRight' && freshIdx < freshScrollableCardsList.length - 1) {
        closeThisModal();
        if (wasNew) {
          initCardsFilters();
          renderCardsCollection();
        }
        openModal(freshScrollableCardsList[freshIdx + 1]);
      }
    };
    ov._handleKey = handleKey;
    document.addEventListener('keydown', handleKey);

    // make sure clicking outside also cleans up
    const originalOvClick = ov.onclick;
    ov.onclick = e => {
      closeThisModal();
      originalOvClick && originalOvClick.call(ov, e);
    };
  }

  // MODAL CONTAINER
  const mc = document.createElement('div');
  mc.className = 'modal-content';
  mc.style.borderColor = hexToRGBA(color, alpha);
  mc.onclick = e => e.stopPropagation();

  // LEFT SIDE (image + description)
  const left = document.createElement('div');
  left.className = 'modal-left';

  const frame = document.createElement('div');
  frame.className = 'modal-frame';

  //  - TIER ICON IN MODAL -
  const modalTierIcon = document.createElement('img');
  modalTierIcon.className = 'modal-tier-icon';
  const tierPath = `assets/images/tiers/tier_${c.tier}.png`;
  imageCache.getImage('tiers', tierPath).then(img => {
      if (img) modalTierIcon.src = img.src;
  });
  modalTierIcon.alt = `Tier ${c.tier}`;
  frame.appendChild(modalTierIcon);

  const frameImg = document.createElement('img');
  frameImg.className = 'modal-frame-img';
  const framePath = `assets/images/frames/${rar}_frame.jpg`;
  imageCache.getImage('frames', framePath).then(img => {
      if (img) frameImg.src = img.src;
  });

  const nameDiv = document.createElement('div');
  nameDiv.className = 'modal-name';
  nameDiv.textContent = c.name;

  const cardImg = document.createElement('img');
  cardImg.className = 'modal-image';
  cardImg.alt       = c.name;
  const cardPath = `assets/images/cards/${c.realm}/${slugify(c.name)}.jpg`;
  imageCache.getImage('cards', cardPath).then(cachedImg => {
    if (cachedImg) cardImg.src = cachedImg.src;
    else           console.warn('card image not in cache:', cardPath);
  });

  const desc = document.createElement('div');
  desc.className = 'modal-desc';
  desc.textContent = c.description;

  frame.append(frameImg, nameDiv, cardImg, desc);

  if (c.locked) {
    const lockedOverlay = document.createElement('div');
    lockedOverlay.className = 'card-locked-overlay';
    const lockedImg = document.createElement('img');
    lockedImg.src = 'assets/images/card_locked.png';
    lockedOverlay.appendChild(lockedImg);
    frame.appendChild(lockedOverlay);
  }

  left.append(frame);

  // RIGHT SIDE (stats, level-up button)
  const right = document.createElement('div');
  right.className = 'modal-right';

  // Add lock status at the top if card is locked
  if (c.locked) {
    const lockStatus = document.createElement('p');
    lockStatus.className = 'modal-lock-status';
    
    if (state.battle.lockoutTimers[cardId]) {
      // Calculate remaining time
      const remainingTime = state.battle.lockoutTimers[cardId] - Date.now();
      lockStatus.innerHTML = `
        <i class="fas fa-lock"></i> Locked for: 
        <span>${formatDuration(remainingTime / 1000)}</span>
      `;
    } else {
      lockStatus.innerHTML = `
        <i class="fas fa-lock"></i> 
        <span>Defeat this card in battle to unlock</span>
      `;
    }
    right.appendChild(lockStatus);
  }

  const labelLine = document.createElement('p');
  labelLine.className = 'label';
  labelLine.innerHTML = `<span>Qty: ${formatQuantity(c.quantity)}</span><span>Tier: ${c.tier}</span>`;
  right.append(labelLine);

  // progress bar
  const barContainer = document.createElement('div');
  barContainer.className = 'modal-bar-container';
  const ths = tierThresholds[rar];
  const nextThresh = ths[c.tier] || ths[ths.length - 1];
  const pct = Math.min(c.quantity / nextThresh, 1) * 100;
  const bar = document.createElement('div');
  bar.className = 'modal-bar';
  bar.style.width = pct + '%';
  const thresholdLab = document.createElement('div');
  thresholdLab.className = 'threshold';
  if (c.tier === 20) {
    thresholdLab.textContent = 'Max Tier';
  } else {
    thresholdLab.textContent = `Next Tier at Qty ${formatNumber(nextThresh)}`;
  }
  barContainer.append(bar, thresholdLab);
  right.append(barContainer);

  if (c.tier > 0) {
    // level up button
    const baseCost = new Decimal(c.levelCost.amount);
    let nextLevelCost = baseCost.times(Decimal.pow(c.levelScaling, c.level - 1));
    nextLevelCost     = Decimal(floorTo3SigDigits(nextLevelCost));

    // Calculate max affordable level and total cost
    let maxLevel = c.level;
    let totalMaxCost = new Decimal(0);
    let currentCost = nextLevelCost;
    const availableCurrency = state.currencies[c.levelCost.currency] || new Decimal(0);

    while (totalMaxCost.plus(currentCost).lessThanOrEqualTo(availableCurrency)) {
      totalMaxCost = totalMaxCost.plus(currentCost);
      maxLevel++;
      currentCost = baseCost.times(Decimal.pow(c.levelScaling, maxLevel - 1));
      currentCost = Decimal(floorTo3SigDigits(currentCost));
    }
    
    const maxLevelIncrement = maxLevel - c.level;

    // look up currency icon directly
    const costCurrency = c.levelCost.currency;
    const curEntry = currencies.find(cur => cur.id === costCurrency) || {};
    const ico = curEntry.icon || 'question.png';

    const levelControls = document.createElement('div');
    levelControls.className = 'level-controls';
    
    // Create the level controls HTML with placeholder for currency icon
    levelControls.innerHTML = `
      <span>Level ${c.level}</span>
      <button class="${nextLevelCost.greaterThan(availableCurrency) ? 'unaffordable' : 'affordable'}"
              ${nextLevelCost.greaterThan(availableCurrency) ? 'disabled' : ''}>
        +1 | ${formatNumber(nextLevelCost)} <img class="icon" alt="${costCurrency}"/>
      </button>
      ${maxLevelIncrement > 0 ? `
        <button class="${totalMaxCost.greaterThan(availableCurrency) ? 'unaffordable' : 'affordable'}"
                ${totalMaxCost.greaterThan(availableCurrency) ? 'disabled' : ''}>
          Max Lvl ${maxLevel} | ${formatNumber(totalMaxCost)} <img class="icon" alt="${costCurrency}"/>
        </button>
      ` : ''}
    `;

    // Load and set currency icons
    const currencyPath = `assets/images/currencies/${ico}`;
    imageCache.getImage('currencies', currencyPath).then(img => {
      if (img) {
        const icons = levelControls.querySelectorAll('img.icon');
        icons.forEach(icon => {
          icon.src = img.src;
        });
      }
    });

    // Add click handlers
    const plusOneBtn = levelControls.querySelector('button');
    if (plusOneBtn) {
      plusOneBtn.addEventListener('click', e => {
        e.stopPropagation();
        state.currencies[costCurrency] = state.currencies[costCurrency].minus(nextLevelCost);
        levelUp(cardId, 1);
        updateCurrencyBar();
        closeThisModal();
        openModal(cardId);
      });
    }

    if (maxLevelIncrement > 0) {
      const maxBtn = levelControls.querySelectorAll('button')[1];
      if (maxBtn) {
        maxBtn.addEventListener('click', e => {
          e.stopPropagation();
          state.currencies[costCurrency] = state.currencies[costCurrency].minus(totalMaxCost);
          levelUp(cardId, maxLevelIncrement);
          updateCurrencyBar();
          closeThisModal();
          openModal(cardId);
        });
      }
    }

    right.append(levelControls);
  }

  // --- REALM DISPLAY ---
  const realmLine = document.createElement('p');
  realmLine.className = 'modal-rarity';
  realmLine.innerHTML =
    `Realm: <span style="color:${color}">${rr.name}</span>`;
  right.appendChild(realmLine);

  // --- RARITY DISPLAY ---
  const rarityLine = document.createElement('p');
  rarityLine.className = 'modal-rarity';
  // prefix, unstyled:
  rarityLine.textContent = 'Rarity: ';
  // the actual rarity in its color:
  const span = document.createElement('span');
  span.textContent = c.rarity.toUpperCase();
  span.style.color = getComputedStyle(document.documentElement)
    .getPropertyValue(`--rarity-${c.rarity.trim()}`);
  rarityLine.appendChild(span);
  right.appendChild(rarityLine);


  if (realms[9].unlocked) {
    const statsContainer = document.createElement('div');
    const attack = Math.floor(c.power * c.tier * Math.sqrt(c.level) * state.battle.globalAttackMult);
    const hp = Math.floor(c.defense * Math.sqrt(c.quantity) * state.battle.globalHPMult);
    statsContainer.className = 'modal-stats-container';

    let bonusStats = '';

    if (
      (state.battle.damageAbsorption > 0 && state.battle.damageAbsorptionRealms.has(c.realm)) ||
      (state.battle.protectionChance > 0 && state.battle.protectionRealms.has(c.realm)) ||
      (state.battle.evolutionChance > 0 && state.battle.evolutionRealms.has(c.realm)) ||
      (state.battle.extraAttackChance > 0 && state.battle.extraAttackRealms.has(c.realm)) ||
      (state.battle.empowerment > 0 && state.battle.empowermentRealms.has(c.realm)) ||
      (state.battle.stunChance > 0 && state.battle.stunRealms.has(c.realm)) ||
      (state.battle.weakPointChance > 0 && state.battle.weakPointRealms.has(c.realm)) ||
      (state.battle.resourcefulAttack > 0 && state.battle.resourcefulAttackRealms.has(c.realm)) ||
      (state.battle.dodgeChance > 0 && state.battle.dodgeRealms.has(c.realm)) ||
      (state.battle.dismemberChance > 0 && state.battle.dismemberRealms.has(c.realm))
    ) {
      if (state.battle.damageAbsorption > 0 && state.battle.damageAbsorptionRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Absorb:</div>
          <div class="combat-stat">
            <i class="fas fa-shield-alt"></i> <span>${formatNumber(state.battle.damageAbsorption * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.protectionChance > 0 && state.battle.protectionRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Protect:</div>
          <div class="combat-stat">
            <i class="fas fa-shield-virus"></i> <span>${formatNumber(state.battle.protectionChance * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.extraAttackChance > 0 && state.battle.extraAttackRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Extra Attack:</div>
          <div class="combat-stat">
            <i class="fas fa-bolt"></i> <span>${formatNumber(state.battle.extraAttackChance * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.empowerment > 0 && state.battle.empowermentRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Empower:</div>
          <div class="combat-stat">
            <i class="fas fa-fire"></i> <span>${formatNumber(state.battle.empowerment * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.evolutionChance > 0 && state.battle.evolutionRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Evolve:</div>
          <div class="combat-stat">
            <i class="fas fa-dna"></i> <span>${formatNumber(state.battle.evolutionChance * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.stunChance > 0 && state.battle.stunRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Stun:</div>
          <div class="combat-stat">
            <i class="fas fa-hammer"></i> <span>${formatNumber(state.battle.stunChance * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.weakPointChance > 0 && state.battle.weakPointRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Weak Point:</div>
          <div class="combat-stat">
            <i class="fas fa-bullseye"></i> <span>${formatNumber(state.battle.weakPointChance * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.resourcefulAttack > 0 && state.battle.resourcefulAttackRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Resourceful:</div>
          <div class="combat-stat">
            <i class="fas fa-coins"></i> <span>${formatNumber(state.battle.resourcefulAttack)} Pokes / Attack</span>
          </div>
        </div>`;
      }
      if (state.battle.dodgeChance > 0 && state.battle.dodgeRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Dodge:</div>
          <div class="combat-stat">
            <i class="fas fa-cat"></i> <span>${formatNumber(state.battle.dodgeChance * 100)}%</span>
          </div>
        </div>`;
      }
      if (state.battle.dismemberChance > 0 && state.battle.dismemberRealms.has(c.realm)) {
        bonusStats += `
        <div class="stat-column">
          <div class="base-stat">Dismember:</div>
          <div class="combat-stat">
            <i class="fas fa-skull-crossbones"></i> <span>${formatNumber(state.battle.dismemberChance * 100)}%</span>
          </div>
        </div>`;
      }
    }

    statsContainer.innerHTML = `
      <div class="stat-column">
        <div class="base-stat">Power: <span>${formatNumber(c.power)}</span></div>
        <div class="combat-stat">
          <i class="fas fa-fist-raised"></i> Attack: <span>${formatNumber(attack)}</span>
          <div class="combat-calc">(${formatNumber(c.power)} × ${c.tier} × √${c.level}${state.battle.globalAttackMult > 0 ? ` × ${formatNumber(state.battle.globalAttackMult)}` : ''})</div>
        </div>
      </div>
      <div class="stat-column">
        <div class="base-stat">Defense: <span>${formatNumber(c.defense)}</span></div>
        <div class="combat-stat">
          <i class="fas fa-heart"></i> HP: <span>${formatNumber(hp)}</span>
          <div class="combat-calc">(${formatNumber(c.defense)} × √${formatNumber(c.quantity)}${state.battle.globalHPMult > 0 ? ` × ${formatNumber(state.battle.globalHPMult)}` : ''})</div>
        </div>
      </div>
      ${bonusStats}
    `;

    right.appendChild(statsContainer);
  }


  // --- EFFECTS HEADER ---
  const effHeader = document.createElement('p');
  effHeader.className = 'modal-effects-header';
  effHeader.textContent = 'Effects';
  right.appendChild(effHeader);

  const hr = document.createElement('hr');
  hr.style.margin = '0 0 4px 0';
  right.appendChild(hr);

  // --- EFFECT LINES ---
  const effectsList = Array.isArray(c.baseEffects)
    ? c.baseEffects
    : [c.baseEffect].filter(e => e && e.type);

  if (effectsList.length) {
    const effContainer = document.createElement('div');
    effContainer.className = 'modal-effects';

    let includesSoftcapped = false;

    effectsList.forEach(def => {
      const scale = EFFECT_SCALES[def.type] ?? (skillMap[30011].purchased ? 2.5 : 2);
      const tierMult = Math.pow(scale, c.tier - 1);

      let total, breakdown;
      let valueHtml;

      if (def.type === "rarityOddsDivider") {
        const baseDivider = 0.01;
        total = baseDivider * c.level * tierMult;
        const cap = EFFECTS_RARITY_VALUES[c.rarity]?.oddsDividerCap;
        const cappedTotal = Math.min(total, cap);
        if (total < cap - 1) {
          breakdown = `(1+ base: ${formatNumber(baseDivider)} × ${formatNumber(c.level)} lvl × ${formatNumber(tierMult)} tier)`;
          valueHtml = `${formatNumber(1+cappedTotal)}`;
        } else {
          breakdown = `(Capped)`;
          valueHtml = `${formatNumber(cap)}`;
        }
      } else if (def.type === "minCardsPerPoke") {
        const baseValue = EFFECTS_RARITY_VALUES[c.rarity]?.minCardsPerPokeBaseValue || 0;
        let tierMultiplier = tierMult;
        if (skillMap[30010].purchased) {
          if (c.realm === 12) {
            tierMultiplier = Math.pow(1.8, c.tier - 1);
          } else if (c.realm === 11) {
            tierMultiplier = Math.pow(1.7, c.tier - 1);
          } else {
            tierMultiplier = Math.pow(1.6, c.tier - 1);
          }
        }
        total = baseValue * c.level * tierMultiplier;
        breakdown = `(base: ${formatNumber(baseValue)} × ${formatNumber(c.level)} lvl × ${formatNumber(tierMultiplier)} tier)`;
        valueHtml = `+${formatNumber(total)}`;
      } else if (def.type === "maxCardsPerPoke") {
        const baseValue = EFFECTS_RARITY_VALUES[c.rarity]?.maxCardsPerPokeBaseValue || 0;
        let tierMultiplier = tierMult;
        if (skillMap[30010].purchased) {
          if (c.realm === 12) {
            tierMultiplier = Math.pow(1.8, c.tier - 1);
          } else if (c.realm === 11) {
            tierMultiplier = Math.pow(1.7, c.tier - 1);
          } else {
            tierMultiplier = Math.pow(1.6, c.tier - 1);
          }
        }
        total = baseValue * c.level * tierMultiplier;
        breakdown = `(base: ${formatNumber(baseValue)} × ${formatNumber(c.level)} lvl × ${formatNumber(tierMult)} tier)`;
        valueHtml = `+${formatNumber(total)}`;
      } else if (def.type === "cooldownDivider") {
        const baseValue = EFFECTS_RARITY_VALUES[c.rarity]?.cooldownDividerBaseValue || 0;
        const tierContribution = (c.tier * (c.tier + 1)) / (skillMap[30009].purchased ? 1 : 2);
        total = baseValue * c.level * tierContribution;
        breakdown = `(base: ${formatNumber(baseValue)} × ${formatNumber(c.level)} lvl × ${formatNumber(tierContribution)} tier)`;
        valueHtml = `+${formatNumber(total)}`;
      } else if (def.type === "currencyPerPoke" || def.type === "currencyPerSec") {
        total = def.value * c.level * tierMult;
        breakdown = `(base: ${formatNumber(def.value)} × ${formatNumber(c.level)} lvl × ${formatNumber(tierMult)} tier)`;
        valueHtml = `+${formatNumber(total)}`;
      }

      // figure out the label
      let label;
      if (def.type === "currencyPerPoke" || def.type === "currencyPerSec") {
        const iconPath = `assets/images/currencies/${def.currency}.png`;
        const verb = def.type === "currencyPerPoke" ? "/ Poke" : "/ Sec";
        label = `<img class="currency-effect-icon" src="${iconPath}" alt="${def.currency}" /> ${verb}`;
      }
      else if (def.type === "rarityOddsDivider") {
        const realmObj    = realmMap[def.realm];
        const realmColor  = realmColors[def.realm];
        const rarityColor = getComputedStyle(document.documentElement)
          .getPropertyValue(`--rarity-${def.rarity.trim()}`);
        label = [
          `<span style="color:${realmColor};font-weight:bold;">${realmObj.name}</span>`,
          `<span style="color:${rarityColor};font-weight:bold;">${def.rarity.toUpperCase()}</span> odds divider`
        ].join(' ');

        if (realmObj.rarityWeights[def.rarity] !== realmObj.uncappedRarityWeights[def.rarity]) {
          label = '* ' + label;
          includesSoftcapped = true;
        }
      }
      else {
        label = EFFECT_NAMES[def.type] || def.type;
      }

      // render
      const li = document.createElement('p');
      li.className = 'effect-line';
      li.innerHTML =
        `${label}: <strong>${valueHtml}</strong>` +
        `<span class="eff-breakdown">${breakdown}</span>`;
      effContainer.appendChild(li);
    });
    
    if (includesSoftcapped) {
      const li = document.createElement('p');
      li.className = 'effect-line';
      li.innerHTML = '<span class="eff-breakdown">* indicates odds divider Softcapped by higher rarity</span>';
      effContainer.appendChild(li);
    }

    right.appendChild(effContainer);
  }

  // --- SPECIAL EFFECTS SECTION ---
  if (c.specialEffects && c.specialEffects.length > 0) {
    const specialEffHeader = document.createElement('p');
    specialEffHeader.className = 'modal-effects-header';
    specialEffHeader.textContent = 'Special Effects';
    right.appendChild(specialEffHeader);

    const hr = document.createElement('hr');
    hr.style.margin = '0 0 4px 0';
    right.appendChild(hr);

    const specialEffContainer = document.createElement('div');
    specialEffContainer.className = 'modal-effects';

    c.specialEffects.forEach(def => {
      const isUnlocked = isSpecialEffectRequirementMet(c, def.requirement);
    
      // 1) Build label & valueHtml unconditionally
      let label = SPECIAL_EFFECT_NAMES[def.type] || def.type;
      let valueHtml;
      switch (def.type) {
        case "merchantPriceDivider":
          valueHtml = `×${formatNumber(def.value )}`;
          break;
        case "flatCurrencyPerPoke":
        case "flatCurrencyPerSecond": {
          const iconPath = `assets/images/currencies/${def.currency}.png`;
          const verb = def.type === "flatCurrencyPerPoke" ? "/ Poke" : "/ Sec";
          label = `<img class="currency-effect-icon" src="${iconPath}" alt="${def.currency}" /> ${verb}`;
          valueHtml = `+${formatNumber(def.value)}`;
          break;
        }
        case "currencyPerPokeMultiplier":
        case "currencyPerSecMultiplier": {
          const iconPath = `assets/images/currencies/${def.currency}.png`;
          const verb = def.type === "currencyPerPokeMultiplier" ? "/ Poke" : "/ Sec";
          label = `Global <img class="currency-effect-icon" src="${iconPath}" alt="${def.currency}" /> ${verb} Multiplier`;
          valueHtml = `×${formatNumber(def.value)}`;
          break;
        }
        case "allGeneratorMultiplier":
          valueHtml = `×${formatNumber(def.value)}`;
          break;
        case "flatMaxCardsPerPoke":
        case "flatMinCardsPerPoke":
          valueHtml = `+${formatNumber(def.value)}`;
          break;
        case "flatCooldownDivider":
          valueHtml = `+${formatNumber(def.value)}`;
          break;
        case "flatExtraMerchantRarityScaling":
          valueHtml = `+${formatNumber(def.value)}`;
          break;
        default:
          valueHtml = def.value ?? '';
      }
    
      // 2) Create the <p> and always show the effect
      const li = document.createElement('p');
      li.className = 'effect-line';
      li.innerHTML = `${label}: <strong>${valueHtml}</strong>`;
    
      // 3) If locked, append requirement text and add the locked class
      if (!isUnlocked) {
        li.classList.add('locked');
        li.innerHTML += 
          ` <span class="unlock-note">
              (Unlocks at ${def.requirement.type} ${def.requirement.amount})
            </span>`;
      }
    
      specialEffContainer.appendChild(li);
    });    

    right.appendChild(specialEffContainer);
  }

  mc.append(left, right);
  ov.append(mc);
  document.body.append(ov);

  if(cardId === '1001') {
    //i want to use the current code, but just check the visibility of cardImg
    setTimeout(() => {
      if (ov.isConnected) {
        cardImg.style.display = 'none';
        desc.textContent = 'There is no spoon.';
        unlockAchievement('secret6');
      }
    }, 10000);
  }
}


let currentCollectionRealm = null;

function initCardsFilters() {
  const filtersContainer = document.getElementById('cards-filters');
  filtersContainer.innerHTML = '';

  realms.forEach(r => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cards-filter';
    btn.dataset.realm = r.id;
    const ownedInRealm = ownedCountInRealm(r.id);
    const totalInREalm = totalInRealm(r.id);
    const isComplete = ownedInRealm === totalInREalm;

    // Check if this realm has T20 achievement
    const hasT20Achievement = skillMap[17002] && skillMap[17002].purchased && state.realmsWithAllT20.has(r.id);

    btn.innerHTML = `
      <img class="filter-back" alt="${r.name} card back"/>
      <div class="filter-label">${r.name}</div>
      <div class="filter-count">
        ${
          isComplete
            ? `<span style="color:green;font-weight:bold;">${ownedInRealm}/${totalInREalm}</span>`
            : `${ownedInRealm}/${totalInREalm}`
        }
      </div>
      ${hasT20Achievement ? '<div class="t20-achievement-badge">★</div>' : ''}
    `;

    // Load card back image
    const backPath = `assets/images/card_backs/${slugify(r.name)}_card_back.jpg`;
    imageCache.getImage('cardBacks', backPath).then(img => {
        if (img) {
            const filterBack = btn.querySelector('.filter-back');
            if (filterBack) filterBack.src = img.src;
        }
    });

    if (!r.unlocked) {
      btn.classList.add('locked');
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        currentCollectionRealm = r.id;
        document.querySelectorAll('.cards-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCardsCollection();
      });

      // Check if any cards in this realm are new
      const hasNewCards = cards
        .filter(c => c.realm === r.id)  // Compare card's realm with realm's id
        .some(c => c.isNew);

      // Add NEW banner to card back button if there are new cards
      if (hasNewCards) {
        if (!btn.querySelector('.new-badge')) {
          const badge = document.createElement('div');
          badge.className = 'reveal-badge new-badge';
          badge.textContent = 'NEW';
          btn.appendChild(badge);
        }
      } else {
        const existingBadge = btn.querySelector('.new-badge');
        if (existingBadge) {
          existingBadge.remove();
        }
      }
    }
    filtersContainer.appendChild(btn);
  });

  // Add "All Cards" filter at the end if skill 30014 is purchased
  if (skillMap[30014] && skillMap[30014].purchased) {
    const allCardsBtn = document.createElement('button');
    allCardsBtn.type = 'button';
    allCardsBtn.className = 'cards-filter all-cards-filter';
    allCardsBtn.dataset.realm = 'all';

    const totalOwnedCards = cards.filter(c => c.quantity > 0).length;
    const totalCards = cards.length;
    const isComplete = totalOwnedCards === totalCards;

    allCardsBtn.innerHTML = `
      <div class="filter-back all-cards-background">
        <div class="all-cards-icon">🌌</div>
      </div>
      <div class="filter-label">All Cards</div>
      <div class="filter-count">
        ${
          isComplete
            ? `<span style="color:green;font-weight:bold;">${totalOwnedCards}/${totalCards}</span>`
            : `${totalOwnedCards}/${totalCards}`
        }
      </div>
    `;

    allCardsBtn.addEventListener('click', () => {
      currentCollectionRealm = 'all';
      document.querySelectorAll('.cards-filter').forEach(b => b.classList.remove('active'));
      allCardsBtn.classList.add('active');
      renderCardsCollection();
    });

    // Check if any cards are new
    const hasNewCards = cards.some(c => c.isNew);
    if (hasNewCards) {
      if (!allCardsBtn.querySelector('.new-badge')) {
        const badge = document.createElement('div');
        badge.className = 'reveal-badge new-badge';
        badge.textContent = 'NEW';
        allCardsBtn.appendChild(badge);
      }
    }

    filtersContainer.appendChild(allCardsBtn);
  }
}

function ownedCountInRealm(rid) {
  return cards.filter(c=>c.realm===rid && c.quantity>0).length;
}
function totalInRealm(rid) {
  return cards.filter(c=>c.realm===rid).length;
}

// Add to renderCardsCollection function, before the card rendering
function renderEffectFilters() {
  const container = document.getElementById('effect-filters');
  if (!container) return;

  container.innerHTML = '';

  // Create filter groups
  Object.entries(EFFECT_FILTER_GROUPS).forEach(([groupName, effectTypes]) => {
    // Special handling for Special Effects group
    if (groupName === 'Special Effects') {
      // Check if any owned cards have special effects (across all realms)
      const hasSpecialEffectsCards = cards
        .filter(c => c.quantity > 0)
        .some(c => c.specialEffects && c.specialEffects.length > 0);
      if (!hasSpecialEffectsCards) return;
    } else {
      // Check if any effects in this group are available
      const hasAvailableEffects = effectTypes.some(type => availableEffects.has(type));
      if (!hasAvailableEffects) return;
    }

    const groupEl = document.createElement('div');
    groupEl.className = 'effect-filter-group';
    if (state.effectFilters.activeGroups.has(groupName)) {
      groupEl.classList.add('active');
    }
    groupEl.textContent = groupName;

    // Special handling for Rarity group
    if (groupName === 'Odds') {
      const { oddsRealms, oddsRarities, unlockedRarities } = state.effectFilters;
      const totalSelections = oddsRealms.size + oddsRarities.size;
    
      let indicator = document.createElement('div');
      indicator.className = 'rarity-filter-indicator';
      groupEl.appendChild(indicator);
      // initialize it (blank if zero)
      indicator.textContent = totalSelections > 0 ? totalSelections : '';
      indicator.style.display = totalSelections > 0 ? 'flex' : 'none';
    
      // submenu container
      const submenu = document.createElement('div');
      submenu.className = 'rarity-filter-submenu';
      submenu.style.display = 'none';
    
      // Realms column
      const realmsColumn = document.createElement('div');
      realmsColumn.className = 'rarity-filter-column';
      realmsColumn.innerHTML = '<h4>Realms</h4>';
      realms.filter(r => r.unlocked).forEach(r => {
        const opt = document.createElement('div');
        opt.className = 'rarity-filter-option' + (oddsRealms.has(r.id) ? ' active' : '');
        opt.textContent = r.name;
        opt.onclick = e => {
          e.stopPropagation();
          oddsRealms.has(r.id) ? oddsRealms.delete(r.id) : oddsRealms.add(r.id);
          if (oddsRealms.size + oddsRarities.size > 0) {
            state.effectFilters.activeGroups.add('Odds');
          } else {
            state.effectFilters.activeGroups.delete('Odds');
          }
          renderCardsCollection();
          saveState();
          if (indicator) {
            const newCount = oddsRealms.size + oddsRarities.size;
            indicator.textContent = newCount > 0 ? newCount : '';
            indicator.style.display   = newCount > 0 ? 'flex' : 'none';
          }
        };
        realmsColumn.appendChild(opt);
      });
    
      // Rarities column
      const raritiesColumn = document.createElement('div');
      raritiesColumn.className = 'rarity-filter-column';
      raritiesColumn.innerHTML = '<h4>Rarities</h4>';
      Array.from(unlockedRarities).sort((a,b)=>{
        return window.rarities.indexOf(a) - window.rarities.indexOf(b);
      }).forEach(rarity => {
        const opt = document.createElement('div');
        opt.className = 'rarity-filter-option' + (oddsRarities.has(rarity) ? ' active' : '');
        opt.textContent = rarity.charAt(0).toUpperCase() + rarity.slice(1);
        opt.onclick = e => {
          e.stopPropagation();
          oddsRarities.has(rarity)
            ? oddsRarities.delete(rarity)
            : oddsRarities.add(rarity);
          if (oddsRealms.size + oddsRarities.size > 0) {
            state.effectFilters.activeGroups.add('Odds');
          } else {
            state.effectFilters.activeGroups.delete('Odds');
          }
          renderCardsCollection();
          saveState();
          const newCount = oddsRealms.size + oddsRarities.size;
          indicator.textContent = newCount > 0 ? newCount : '';
          indicator.style.display   = newCount > 0 ? 'flex' : 'none';
        };
        raritiesColumn.appendChild(opt);
      });
    
      submenu.append(realmsColumn, raritiesColumn);
      groupEl.append(submenu);
    
      // toggle submenu & close only when clicked outside
      const closeSubmenu = ev => {
        if (!submenu.contains(ev.target) && !groupEl.contains(ev.target)) {
          submenu.style.display = 'none';
          document.removeEventListener('click', closeSubmenu);
        }
      };
      groupEl.onclick = e => {
        e.stopPropagation();
        if (submenu.style.display === 'none') {
          submenu.style.display = 'flex';
          submenu.style.zIndex = '1000';
          setTimeout(() => document.addEventListener('click', closeSubmenu), 0);
        }
      };
    } else if (groupName === 'Special Effects') {
      // Special handling for Special Effects filter
      const { specialEffectsMode } = state.effectFilters;

      // Add indicator to show current mode (only if not 'none')
      if (specialEffectsMode !== 'none') {
        let indicator = document.createElement('div');
        indicator.className = 'special-effects-indicator';
        indicator.textContent = specialEffectsMode === 'show' ? 'All' :
                               specialEffectsMode === 'locked' ? 'Locked' : 'Hide Unlocked';
        groupEl.appendChild(indicator);
      }

      // submenu container
      const submenu = document.createElement('div');
      submenu.className = 'rarity-filter-submenu';
      submenu.style.display = 'none';

      // Single column for options
      const optionsColumn = document.createElement('div');
      optionsColumn.className = 'rarity-filter-column';
      optionsColumn.innerHTML = '<h4>Special Effects Filter</h4>';

      const options = [
        { value: 'none', label: 'No Special Effect Filtering' },
        { value: 'show', label: 'Show only Special Effects' },
        { value: 'locked', label: 'Show only Locked Special Effects' },
        { value: 'hide', label: 'Hide Unlocked Special Effects' }
      ];

      options.forEach(option => {
        const opt = document.createElement('div');
        opt.className = 'rarity-filter-option' + (specialEffectsMode === option.value ? ' active' : '');
        opt.textContent = option.label;
        opt.onclick = e => {
          e.stopPropagation();
          state.effectFilters.specialEffectsMode = option.value;
          if (option.value === 'none') {
            state.effectFilters.activeGroups.delete('Special Effects');
          } else {
            state.effectFilters.activeGroups.add('Special Effects');
          }
          renderCardsCollection();
          saveState();
        };
        optionsColumn.appendChild(opt);
      });

      submenu.appendChild(optionsColumn);
      groupEl.appendChild(submenu);

      // toggle submenu & close only when clicked outside
      const closeSubmenu = ev => {
        if (!submenu.contains(ev.target) && !groupEl.contains(ev.target)) {
          submenu.style.display = 'none';
          document.removeEventListener('click', closeSubmenu);
        }
      };
      groupEl.onclick = e => {
        e.stopPropagation();
        if (submenu.style.display === 'none') {
          submenu.style.display = 'flex';
          submenu.style.zIndex = '1000';
          setTimeout(() => document.addEventListener('click', closeSubmenu), 0);
        }
      };
    } else {
      groupEl.addEventListener('click', () => {
        if (state.effectFilters.activeGroups.has(groupName)) {
          state.effectFilters.activeGroups.delete(groupName);
        } else {
          state.effectFilters.activeGroups.add(groupName);
        }
        renderCardsCollection();
        saveState();
      });
    }

    container.appendChild(groupEl);
  });
}

// Update renderCardsCollection to call renderEffectFilters
function renderCardsCollection() {
  renderEffectFilters();
  const list = document.getElementById('cards-list');
  list.innerHTML = '';

  // Get filtered cards first
  const filteredCards = cards
    .filter(c => {
      // If "All Cards" filter is selected, show cards from all realms
      if (currentCollectionRealm === 'all') {
        return true;
      }
      // Otherwise, filter by specific realm
      return c.realm === currentCollectionRealm;
    })
    .filter(c => {
      // If no effect filters are active, show all cards
      if (state.effectFilters.activeGroups.size === 0) return true;

      // Check if card has ALL of the active effect types (intersection)
      return Array.from(state.effectFilters.activeGroups).every(group => {
        const effectTypes = EFFECT_FILTER_GROUPS[group];
        if (!effectTypes) return true;

        // Special handling for Odds group
        if (group === 'Odds') {
          // inside your .filter(c => …) for group==='Odds'
          const { oddsRealms, oddsRarities } = state.effectFilters;
          const selRealms   = Array.from(oddsRealms);
          const selRarities = Array.from(oddsRarities);
          
          // 1) nothing selected → don't filter at all
          if (selRealms.length === 0 && selRarities.length === 0) {
            return true;
          }
          
          // 2) only realms → any effect.realm in selRealms
          if (selRealms.length > 0 && selRarities.length === 0) {
            return (c.baseEffects || []).some(e =>
              e.type === 'rarityOddsDivider' && selRealms.includes(e.realm)
            );
          }
          
          // 3) only rarities → any effect.rarity in selRarities
          if (selRealms.length === 0 && selRarities.length > 0) {
            return (c.baseEffects || []).some(e =>
              e.type === 'rarityOddsDivider' && selRarities.includes(e.rarity)
            );
          }
          
          // 4) both → matching pair
          return (c.baseEffects || []).some(e =>
            e.type === 'rarityOddsDivider'
            && selRealms.includes(e.realm)
            && selRarities.includes(e.rarity)
          );
        } else if (group === 'Special Effects') {
          // Special handling for Special Effects group
          const { specialEffectsMode } = state.effectFilters;

          // If mode is 'none', this filter shouldn't be active
          if (specialEffectsMode === 'none') return true;

          // Check if card has special effects
          const hasSpecialEffects = c.specialEffects && c.specialEffects.length > 0;

          if (specialEffectsMode === 'show') {
            // Show only cards with special effects
            return hasSpecialEffects;
          } else if (specialEffectsMode === 'locked') {
            // Show only cards where at least one special effect requirement is not met
            if (!hasSpecialEffects) return false;
            return c.specialEffects.some(def => !isSpecialEffectRequirementMet(c, def.requirement));
          } else if (specialEffectsMode === 'hide') {
            // Show cards with no special effects OR cards with locked special effects
            if (!hasSpecialEffects) return true; // Show cards with no special effects
            return c.specialEffects.some(def => !isSpecialEffectRequirementMet(c, def.requirement));
          }

          return false;
        } else {
          // For other groups, check if card has any of the effect types
          return effectTypes.some(type => hasEffect(c, type));
        }
      });
    });

  // Sort cards when "All Cards" filter is active - by rarity, then realm, then card ID (decreasing)
  if (currentCollectionRealm === 'all') {
    filteredCards.sort((a, b) => {
      // First sort by rarity (reverse order - divine first)
      const rarityIndexA = rarities.indexOf(a.rarity);
      const rarityIndexB = rarities.indexOf(b.rarity);
      if (rarityIndexA !== rarityIndexB) {
        return rarityIndexB - rarityIndexA; // Reverse order (divine first)
      }

      // Then sort by realm (reverse order - higher realm numbers first)
      if (a.realm !== b.realm) {
        return b.realm - a.realm; // Reverse order (higher realm numbers first)
      }

      // Finally sort by card ID (decreasing - higher IDs first)
      return b.id - a.id;
    });
  }

  lastCollectionCardIds = filteredCards.map(c => c.id);

  // Add Level All button if skill 25001 is purchased
  if (skillMap[25001].purchased && currentCollectionRealm !== null) {
    const levelAllBtn = document.createElement('button');
    levelAllBtn.className = 'level-all-btn';
    levelAllBtn.textContent = 'Level All';
    levelAllBtn.addEventListener('click', () => {
      // Get all visible cards in current realm with quantity > 0
      const cardsToLevel = filteredCards.filter(c => c.quantity > 0);

      if (skillMap[25002]?.purchased && currentCollectionRealm !== 'all') {
        cardsToLevel.reverse();
      }

      // Level up each card to its max affordable level
      cardsToLevel.forEach(card => {
        const result = calculateMaxAffordableLevel(card.id);
        const increment = result.maxLevel - card.level;
        
        if (increment > 0 && result.totalCost.greaterThan(0)) {
          // Subtract cost and level up
          state.currencies[card.levelCost.currency] = 
            (state.currencies[card.levelCost.currency] || new Decimal(0))
              .minus(result.totalCost);
          levelUp(card.id, increment, skipRender = true);
        }
      });
      
      updateCurrencyBar();
      renderCardsCollection();
    });
    
    const clearNewandTierBtn = document.createElement('button');
    clearNewandTierBtn.className = 'level-all-btn';
    clearNewandTierBtn.textContent = 'Clear Badges';
    clearNewandTierBtn.addEventListener('click', () => {

      // Level up each card to its max affordable level
      filteredCards.forEach(card => {
        card.isNew = false;
        card.hasTierUp = false;
      });
      
      checkForNewCards();
      initCardsFilters();
      renderCardsCollection();
    });

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.appendChild(levelAllBtn);
    btnGroup.appendChild(clearNewandTierBtn);
    list.appendChild(btnGroup);
  }

  // Render the filtered cards
  filteredCards.forEach(c => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-outer';
    if (c.quantity === 0) cardEl.classList.add('unfound');

    const inner = document.createElement('div');
    inner.className = 'card-inner revealed';
    inner.dataset.id = c.id;

    const front = document.createElement('div');
    front.className = 'card-face front';
    front.style.borderColor = realmColors[c.realm];

    // frame & artwork
    const frameImg = document.createElement('img');
    frameImg.className = 'card-frame';
    const framePath = `assets/images/frames/${c.rarity}_frame.jpg`;
    imageCache.getImage('frames', framePath).then(img => {
        if (img) frameImg.src = img.src;
    });

    const contentImg = document.createElement('img');
    contentImg.className = 'card-image';
    const cardPath = `assets/images/cards/${c.realm}/${slugify(c.name)}.jpg`;
    imageCache.getImage('cards', cardPath).then(img => {
        if (img) contentImg.src = img.src;
    });

    // Special Effects S indicator
    if (Array.isArray(c.specialEffects) && c.specialEffects.length > 0) {
      // Check if all requirements are met
      const allMet = c.specialEffects.every(def => isSpecialEffectRequirementMet(c, def.requirement));
      const sSpan = document.createElement('span');
      sSpan.className = 'special-s-indicator' + (allMet ? ' special-s-glow' : ' special-s-dull');
      sSpan.textContent = 'S';
      front.appendChild(sSpan);
    }

    front.append(frameImg, contentImg);

    // tier icon + level label
    if (c.tier > 0) {
      const tierIcon = document.createElement('img');
      tierIcon.className = 'tier-icon';
      const tierPath = `assets/images/tiers/tier_${c.tier}.png`;
      imageCache.getImage('tiers', tierPath).then(img => {
          if (img) tierIcon.src = img.src;
      });
      tierIcon.alt = `Tier ${c.tier}`;
      front.appendChild(tierIcon);

      const lvlLabel = document.createElement('div');
      lvlLabel.className = 'level-label';
      lvlLabel.textContent = `Lvl: ${formatNumber(c.level)}`;
      front.appendChild(lvlLabel);
    }

    const btn = document.createElement('button');
    btn.className = 'card-level-up-btn';

    if (c.quantity > 0) {
      const baseCost  = new Decimal(c.levelCost.amount);
      const rawCost   = baseCost.times(Decimal.pow(c.levelScaling, c.level - 1));
      const cost      = floorTo3SigDigits(rawCost);
      const curAmt    = state.currencies[c.levelCost.currency] || new Decimal(0);
      const canAfford = curAmt.greaterThanOrEqualTo(cost);

      btn.classList.add(canAfford ? 'affordable' : 'unaffordable');
      btn.disabled = !canAfford;

      btn.innerHTML = `
        Level Up<br>
        <span class="level-cost">
          ${formatNumber(cost)}
          <img class="icon" alt="${c.levelCost.currency}"/>
        </span>
      `;

      const iconEl = btn.querySelector('img.icon');
      const currencyPath = `assets/images/currencies/${c.levelCost.currency}.png`;
      iconEl.src = currencyPath;                 // fallback immediately
      imageCache
        .getImage('currencies', currencyPath)
        .then(cachedImg => {
          if (cachedImg) iconEl.src = cachedImg.src;
        });

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const freshAmt  = state.currencies[c.levelCost.currency] || new Decimal(0);
        const freshCost = floorTo3SigDigits(
          new Decimal(c.levelCost.amount)
            .times(Decimal.pow(c.levelScaling, c.level - 1))
        );
        if (freshAmt.lessThan(freshCost)) return;
        state.currencies[c.levelCost.currency] = freshAmt.minus(freshCost);
        levelUp(c.id);
        updateCurrencyBar();
      });
    }
    else {
      btn.disabled = true;
      btn.textContent = 'Level Up';
    }

    front.appendChild(btn);

    // quantity badge
    if (c.quantity >= 1) {
      const badge = document.createElement('div');
      badge.className = 'count-badge';
      badge.innerHTML = formatQuantity(c.quantity);
      front.appendChild(badge);
    }

    // NEW banner persists until opened
    if (c.isNew) {
      const badge = document.createElement('div');
      badge.className = 'reveal-badge new-badge';
      badge.textContent = 'NEW';
      front.appendChild(badge);
    } else if (c.hasTierUp) {
      const badge = document.createElement('div');
      badge.className = 'reveal-badge tierup-badge';
      badge.textContent = 'TIER UP';
      front.appendChild(badge);
    }

    // Update locked overlay logic
    if (c.locked) {
      if (state.battle.currentEnemy && c.id === state.battle.currentEnemy.id) {
        // Show battle overlay for current enemy
        const battleOverlay = document.createElement('div');
        battleOverlay.className = 'card-battle-overlay';
        const battleImg = document.createElement('img');
        battleImg.src = 'assets/images/card_battle.png';
        battleOverlay.appendChild(battleImg);
        front.appendChild(battleOverlay);
      } else {
        // Show locked overlay for other locked cards
        const lockedOverlay = document.createElement('div');
        lockedOverlay.className = 'card-locked-overlay';
        const lockedImg = document.createElement('img');
        lockedImg.src = 'assets/images/card_locked.png';
        lockedOverlay.appendChild(lockedImg);
        front.appendChild(lockedOverlay);

        
        // Add countdown if card is in lockoutTimers
        if (state.battle.lockoutTimers[c.id]) {
          const countdownEl = document.createElement('div');
          countdownEl.className = 'lock-countdown';
          const remainingTime = state.battle.lockoutTimers[c.id] - Date.now();
          countdownEl.innerHTML = `Locked for<br>${formatDuration(remainingTime / 1000)}`;
          front.append(countdownEl);
        }
      }
    }

    inner.append(front);
    cardEl.append(inner);

    // open modal on click
    if (c.quantity >= 1) {
      cardEl.addEventListener('click', () => openModal(c.id));
    }

    list.appendChild(cardEl);
  });
}



// --- CARDS & SKILLS TABS ---

function updateGeneratorRates() {
  // Stone Generator (skill 10001)
  if (skillMap[10001].purchased) {
    // Count discovered Realm 1 cards
    const discoveredCount = cards.filter(c => c.realm === 1 && c.quantity > 0).length;
    // Calculate new contribution
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    // Only update the generator contribution
    state.resourceGeneratorContribution.stone = newContribution;
  }

  // Coral Generator (skill 10002)
  if (skillMap[10002].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 2 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.coral = newContribution;
  }

  // Pollen Generator (skill 10003)
  if (skillMap[10003].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 3 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.pollen = newContribution;
  }

  // Egg Generator (skill 10004)
  if (skillMap[10004].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 4 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.egg = newContribution;
  }

  // Crystal Generator 5 (skill 10005)
  if (skillMap[10005].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 5 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.crystal = newContribution;
  }

  // Rune Generator 6 (skill 10006)
  if (skillMap[10006].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 6 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.rune = newContribution;
  }

  // Resource Generator 7 (skill 10007)
  if (skillMap[10007].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 7 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.tooth = newContribution;
  }

  // Resource Generator 8 (skill 10008)

  if (skillMap[10008].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 8 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.coin = newContribution;
  }
  // Resource Generator 9 (skill 10009)
  if (skillMap[10009].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 9 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.spirit = newContribution;
  }
  // Resource Generator 10 (skill 10010)
  if (skillMap[10010].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 10 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.pearl = newContribution;
  }
  // Ultimate Resource Generator (skill 10011)
  if (skillMap[10011].purchased) {
    const discoveredCount = cards.filter(c => c.realm === 11 && c.quantity > 0).length;
    const newContribution = discoveredCount * discoveredCount * state.effects.allGeneratorMultiplier;
    state.resourceGeneratorContribution.zeal = newContribution;
    state.resourceGeneratorContribution.royal_jelly = newContribution;
    state.resourceGeneratorContribution.feather = newContribution;
    state.resourceGeneratorContribution.cosmic_ray = newContribution;
  }
}

// Add this function after updateAvailableEffects
function checkAndUpdateAvailableEffects(card) {
  // Skip if we already have all possible effects
  if (availableEffects.size === Object.keys(EFFECT_NAMES).length + Object.keys(SPECIAL_EFFECT_NAMES).length) {
    return;
  }

  // Add card's rarity to unlocked rarities
  if (card.rarity) {
    state.effectFilters.unlockedRarities.add(card.rarity);
  }

  // Check base effects
  if (card.baseEffects) {
    card.baseEffects.forEach(effect => {
      if (!availableEffects.has(effect.type)) {
        availableEffects.add(effect.type);
      }
    });
  }

  // Check special effects
  if (card.specialEffects) {
    card.specialEffects.forEach(effect => {
      if (!availableEffects.has(effect.type)) {
        availableEffects.add(effect.type);
      }
    });
  }
}

// Update the giveCard function to call checkAndUpdateAvailableEffects
function giveCard(cardId, amount = 1) {
  const c = cardMap[cardId];
  const wasNew = c.quantity === 0;  // Track if this is a new discovery
  const oldTier = c.tier;

  // --- 2. Update quantity ---
  c.quantity += amount;

  if (c.quantity >= 1e16) {
    unlockAchievement('endgameChecklist');
  }

  // --- 3. Compute new tier & new effects ---
  const thresholds = window.tierThresholds[c.rarity];
  let newTier = 1;
  while (newTier < thresholds.length && c.quantity >= thresholds[newTier]) {
    newTier++;
  }

  // Only apply new effects if tier increased
  if (newTier > oldTier) {
    // --- 1. Remove all previous effects (base + special) if present ---
    if (c.lastAppliedEffects) {
      applyEffectsDelta(c.lastAppliedEffects, -1);
    }
    if (c.lastAppliedSpecialEffects) {
      applyEffectsDelta(c.lastAppliedSpecialEffects, -1);
    }
    c.tier = newTier;
    // Only set hasTierUp if showTierUps is true
    c.hasTierUp = state.showTierUps;  // Modified this line
    const newEffs = computeCardEffects(c);
    const specialEffs = computeSpecialEffects(c);
    applyEffectsDelta(newEffs, +1);
    applyEffectsDelta(specialEffs, +1);
    c.lastAppliedEffects = newEffs;
    c.lastAppliedSpecialEffects = specialEffs;
    if (newTier === 20) {
      checkAchievements('tierFanatic', c.rarity);
      // Check if this realm now has all cards at T20
      checkAndTrackRealmT20Achievement(c.realm);
    }
  } 

  // Update generator rates if this is a new card discovery
  if (wasNew) {
    c.isNew = true;
    checkAndUpdateAvailableEffects(c);  // Add this line
    updateGeneratorRates();
    checkForNewCards();
    processNewCardDiscovered();
    checkAchievements('cosmicCollector', c.realm);
    checkAchievements('thrillOfDiscovery');
    updatePokeFilterStats();
    if (state.achievementsUnlocked.has('thrillOfDiscovery14')) {
      const cardsDiscovered = cards.filter(c => c.quantity > 0).length;
      if (cardsDiscovered == 347) {
        unlockAchievement('endgameChecklist3');
        if (state.runningGauntlet) {
          unlockAchievement('endgameChecklist4');
          state.runningGauntlet = false;
          state.gauntletStartTime = null;
          state.gauntletNotifications.clear();
          clearGauntletTimer();
          showTidbit('WOW! You have completed the Gauntlet! Did not think you would make it!');
        }
      }
    }
  }
}

// And in levelUp():
function levelUp(cardId, increment = 1, skipRender = false) {
  const c = cardMap[cardId];
  // remove old (base + special)
  if (c.lastAppliedEffects) {
    applyEffectsDelta(c.lastAppliedEffects, -1);
  }
  if (c.lastAppliedSpecialEffects) {
    applyEffectsDelta(c.lastAppliedSpecialEffects, -1);
  }

  // pay cost…
  c.level += increment;

  // recompute & apply
  const now = computeCardEffects(c);
  const specialEffs = computeSpecialEffects(c);
  applyEffectsDelta(now, +1);
  applyEffectsDelta(specialEffs, +1);
  c.lastAppliedEffects = now;
  c.lastAppliedSpecialEffects = specialEffs;

  // Check for affordable skills after spending currency
  checkAffordableSkills();

  if (currentTab === 'cards' && !skipRender) {
    renderCardsCollection();
  }
}

// Helper function to calculate max affordable level and total cost
function calculateMaxAffordableLevel(cardId) {
  const c = cardMap[cardId];
  const baseCost = new Decimal(c.levelCost.amount);
  const totalAvailableCurrency = state.currencies[c.levelCost.currency] || new Decimal(0);

  // Apply currency spending percentage limit
  const availableCurrency = totalAvailableCurrency.times(state.currencySpendingPercentage);

  let maxLevel = c.level;
  let totalCost = new Decimal(0);
  let currentCost = baseCost.times(Decimal.pow(c.levelScaling, maxLevel - 1));
  currentCost = Decimal(floorTo3SigDigits(currentCost));

  while (totalCost.plus(currentCost).lessThanOrEqualTo(availableCurrency)) {
    totalCost = totalCost.plus(currentCost);
    maxLevel++;
    currentCost = baseCost.times(Decimal.pow(c.levelScaling, maxLevel - 1));
    currentCost = Decimal(floorTo3SigDigits(currentCost));
  }

  return { maxLevel, totalCost };
}

function renderRealmFilters() {
  const container = document.getElementById('poke-filters');
  container.innerHTML = '';

  realms.forEach((r, idx) => {
    if (!r.unlocked) return;

    const enabled      = state.selectedRealms.includes(r.id);
    // any later filters enabled?
    const laterEnabled = realms
      .slice(idx + 1)
      .some(rr => state.selectedRealms.includes(rr.id));

    // decide overlay text
    let effectText;
    if (enabled) {
      effectText = '+' + formatDuration(r.cooldown);
    } else if (!laterEnabled) {
      effectText = '+0s';
    } else {
      effectText = '×' + r.deselectMultiplier;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'realm-filter-btn' + (enabled ? ' selected' : '');
    btn.innerHTML = `
      <img src="assets/images/card_backs/${slugify(r.name)}_card_back.jpg"
           alt="${r.name}" />
      <div class="filter-effect">${effectText}</div>
    `;

    btn.onclick = () => {
      const i = state.selectedRealms.indexOf(r.id);
      if (i >= 0) {
        if (state.selectedRealms.length === 1 && enabled) return;
        state.selectedRealms.splice(i, 1);
      }
      else{
        state.selectedRealms.push(r.id);
      } 
      renderRealmFilters();
      updatePokeFilterStats();
    };

    container.appendChild(btn);
  });
}

function startCooldown() {
  // 1) Check for cooldown skip
  const skipChance = state.effects.cooldownSkipChance || 0;
  if (Math.random() < skipChance) {
    const skipText = document.createElement('div');
    skipText.className = 'skip-text';
    skipText.textContent = 'Cooldown Skipped!';
    holeBtn.appendChild(skipText);
    skipText.addEventListener('animationend', () => skipText.remove());

    state.remainingCooldown = 0;
    tryEnableHole();
    return;
  }

  // 2) Begin real cooldown
  state.remainingCooldown = calculateCooldown();

  if (skillMap[12004].purchased){
    state.harvesterValue += state.remainingCooldown * 0.01;
  }

  // 3) Clear any prior animations & timers
 
  if (fillAnim) anime.remove(globalFill);
  clearInterval(blackHoleTimer);

  // 4) Reset fill bar & make sure it's at 0%
  globalFill.style.width = '0%';

  // 5) (Re)create your countdown element
  countdownEl = holeBtn.querySelector('.countdown')
    || Object.assign(document.createElement('div'), { className: 'countdown' });
  countdownEl.textContent = formatDuration(state.remainingCooldown);
  holeBtn.appendChild(countdownEl);

  // 6) Pure-JS tick for accurate timing
  let lastTick = Date.now();
  blackHoleTimer = setInterval(() => {
    const now = Date.now();
    const delta = (now - lastTick) / 1000; // Convert to seconds
    lastTick = now;
    
    state.remainingCooldown = Math.max(0, state.remainingCooldown - delta);
    countdownEl.textContent = formatDuration(state.remainingCooldown);

    if (state.remainingCooldown <= 0) {
      clearInterval(blackHoleTimer);
      countdownEl.remove();
      state.remainingCooldown = 0;
      tryEnableHole();
    }
  }, 100);

  // 7) Visual animation for the fill bar
  fillAnim = anime({
    targets: globalFill,
    width: ['0%', '100%'],
    duration: state.remainingCooldown * 1000,
    easing: 'linear'
  });
}

function resumeCooldown() {
  // 1) Disable button
  holeBtn.disabled = true;
  holeBtn.classList.add('disabled');

  clearInterval(blackHoleTimer);
  if (fillAnim) anime.remove(globalFill);

  const totalCooldown = calculateCooldown();
  const progressPercent = ((totalCooldown - state.remainingCooldown) / totalCooldown) * 100;
  
  // Set initial width to match current progress
  globalFill.style.width = `${progressPercent}%`;

  // 2) Recreate countdown
  countdownEl = holeBtn.querySelector('.countdown')
    || Object.assign(document.createElement('div'), { className: 'countdown' });
  countdownEl.textContent = formatDuration(state.remainingCooldown);
  holeBtn.appendChild(countdownEl);

  // 3) Pure-JS tick for accurate timing
  let lastTick = Date.now();
  blackHoleTimer = setInterval(() => {
    const now = Date.now();
    const delta = (now - lastTick) / 1000; // Convert to seconds
    lastTick = now;
    
    state.remainingCooldown = Math.max(0, state.remainingCooldown - delta);
    countdownEl.textContent = formatDuration(state.remainingCooldown);

    if (state.remainingCooldown <= 0) {
      clearInterval(blackHoleTimer);
      countdownEl.remove();
      holeBtn.disabled = false;
      holeBtn.classList.remove('disabled');
      state.remainingCooldown = 0;
      tryEnableHole();
    }
  }, 100);

  // 4) Visual animation for the fill bar - start from current progress
  fillAnim = anime({
    targets: globalFill,
    width: [`${progressPercent}%`, '100%'],
    duration: state.remainingCooldown * 1000,
    easing: 'linear'
  });
}


function calculateCooldown() {
  let sum = state.selectedRealms.reduce((a,id)=>a + realmMap[id].cooldown, 0);
  const maxSel = Math.max(...state.selectedRealms, 0);
  for (let id = 1; id < maxSel; id++) {
    if (!state.selectedRealms.includes(id)
      && state.selectedRealms.some(x => x > id)) {
      sum *= realmMap[id].deselectMultiplier;
    }
  }
  return Math.max(sum / state.effects.cooldownDivider, 0.5);
}

function getCooldownColor(cooldown, forTooltip = false) {
  if (cooldown <= 0.5) return 'green';
  if (cooldown < 10 * 60) return forTooltip ? 'white' : 'var(--font-color)';
  if (cooldown < 60 * 60) return 'orange';
  return 'red';
}

function updatePokeFilterStats() {
  const container = document.getElementById('poke-filter-stats');
  container.innerHTML = '';  // clear old

  // 1) Poke cooldown
  const cooldownSum = calculateCooldown();
  const cooldownTxt = formatDuration(cooldownSum);

  if (cooldownSum >= 3600) {
    holeBtn.classList.add('critical-cooldown');
  } else if (cooldownSum >= 10*60) {
    holeBtn.classList.add('long-cooldown');
  } else {
    holeBtn.classList.remove('critical-cooldown');
    holeBtn.classList.remove('long-cooldown');
  }

  // 2) Undiscovered cards
  let undiscovered = 0;
  state.selectedRealms.forEach(rid => {
    cards.forEach(c => {
      if (c.realm === rid && c.quantity === 0) undiscovered++;
    });
  });

  // 3) Realm odds
  const unlocked = realms
  .filter(r => r.unlocked && state.selectedRealms.includes(r.id))
  .map(r => r.id);
  const weights      = unlocked.map(rid => realmMap[rid].pokeWeight);
  const totalWeight  = weights.reduce((a,b) => a + b, 0);

  // — build summary table —
  const summaryTable = document.createElement('table');
  summaryTable.className = 'poke-filter-stats-table';
  const sBody = summaryTable.createTBody();
  [
    ['Poke Cooldown',      cooldownTxt],
    ['Undiscovered Cards', undiscovered]
  ].forEach(([label, val]) => {
    const row = sBody.insertRow();
    const th  = document.createElement('th');
    th.textContent = label;
    row.appendChild(th);
    const td  = document.createElement('td');
    if (label === 'Poke Cooldown') {
      td.textContent = val;
      td.style.setProperty('color', getCooldownColor(cooldownSum), 'important');
      if (cooldownSum <= 0.5 || cooldownSum >= 3600) {
        td.style.fontWeight = 'bold';
      }
    } else {
      td.textContent = val;
    }
    row.appendChild(td);
  });
  
  // — build realm odds table —
  const oddsTable = document.createElement('table');
  oddsTable.className = 'poke-filter-stats-table';
  const oHead = oddsTable.createTHead();
  const headerRow = oHead.insertRow();
  ['Realm','Chance'].forEach(txt => {
    const th = document.createElement('th');
    th.textContent = txt;
    headerRow.appendChild(th);
  });
  const oBody = oddsTable.createTBody();
  unlocked.forEach(rid => {
    const realm = realmMap[rid];
    const pct   = totalWeight > 0
      ? (realm.pokeWeight/totalWeight*100).toFixed(2) + '%'
      : '0.00%';
    const row = oBody.insertRow();

    // styled realm name
    const nameCell = document.createElement('td');
    const span     = document.createElement('span');
    span.textContent   = realm.name;
    span.style.color   = realmColors[rid];
    span.style.fontWeight = 'bold';
    nameCell.appendChild(span);
    row.appendChild(nameCell);

    const pctCell = document.createElement('td');
    pctCell.textContent = pct;
    row.appendChild(pctCell);
  });

  // — wrap in flex container —
  const flex = document.createElement('div');
  flex.className = 'poke-filter-stats-flex';
  flex.append(summaryTable, oddsTable);

  // Add hide rarities checkbox if there are omitted rarities
  if (state.pokeRaritiesOmitted.length > 0) {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'hide-rarities-checkbox';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'hide-rarities-checkbox';
    checkbox.checked = state.hideOmittedRarities;
    checkbox.addEventListener('change', (e) => {
      state.hideOmittedRarities = e.target.checked;
    });
    
    const label = document.createElement('label');
    label.htmlFor = 'hide-rarities-checkbox';
    label.textContent = 'Hide Crappy Rarities';
    
    checkboxContainer.append(checkbox, label);
    flex.appendChild(checkboxContainer);
  }

  if (skillMap[18101].purchased) {
    const hideLockedCardsCheckboxContainer = document.createElement('div');
    hideLockedCardsCheckboxContainer.className = 'hide-locked-cards-checkbox';
    const hideLockedCardsCheckbox = document.createElement('input');
    hideLockedCardsCheckbox.type = 'checkbox';
    hideLockedCardsCheckbox.id = 'hide-locked-cards-checkbox';
    hideLockedCardsCheckbox.checked = state.hideLockedCards;
    hideLockedCardsCheckbox.addEventListener('change', (e) => {
      state.hideLockedCards = e.target.checked;
    });
    const hideLockedCardsLabel = document.createElement('label');
    hideLockedCardsLabel.htmlFor = 'hide-locked-cards-checkbox';
    hideLockedCardsLabel.textContent = 'Hide Locked Cards';
    hideLockedCardsCheckboxContainer.append(hideLockedCardsCheckbox, hideLockedCardsLabel);
    flex.appendChild(hideLockedCardsCheckboxContainer);
  }

  if (skillMap[18102].purchased) {
    const hideCappedCardsCheckboxContainer = document.createElement('div');
    hideCappedCardsCheckboxContainer.className = 'hide-capped-cards-checkbox';
    const hideCappedCardsCheckbox = document.createElement('input');
    hideCappedCardsCheckbox.type = 'checkbox';
    hideCappedCardsCheckbox.id = 'hide-capped-cards-checkbox';
    hideCappedCardsCheckbox.checked = state.hideCappedCards;
    hideCappedCardsCheckbox.addEventListener('change', (e) => {
      state.hideCappedCards = e.target.checked;
    });
    const hideCappedCardsLabel = document.createElement('label');
    hideCappedCardsLabel.htmlFor = 'hide-capped-cards-checkbox';
    hideCappedCardsLabel.textContent = 'Hide Capped Cards';
    hideCappedCardsCheckboxContainer.append(hideCappedCardsCheckbox, hideCappedCardsLabel);
    flex.appendChild(hideCappedCardsCheckboxContainer);
  }

  container.appendChild(flex);
}

function checkForNewCards() {
  const cardsTab = document.getElementById('tab-btn-cards');
  if (!cardsTab) {
    console.error('Cards tab button not found!');
    return;
  }

  // Check if any card has isNew flag
  const hasNewCards = cards.some(c => c.isNew);
  
  if (hasNewCards) {
    cardsTab.classList.add('new-offers');
  } else {
    cardsTab.classList.remove('new-offers');
  }
}

let maxCardsPerDiscovered = 0;
let lastFullyDiscoveredRealms = 0;

function processNewCardDiscovered() {
  if (skillMap[16001].purchased){
    //compute total discovered cards
    let totalDiscovered = cards.filter(c => c.quantity > 0).length;
    if (skillMap[16002].purchased){
      totalDiscovered *= totalDiscovered;
    }
    //compare to maxCardsPerDiscovered and add difference to state.effects.maxCardsPerPoke
    const difference = totalDiscovered - maxCardsPerDiscovered;
    state.effects.maxCardsPerPoke += difference;
    maxCardsPerDiscovered = totalDiscovered;
  }
  if (skillMap[17001].purchased){
    //compute total # realms where all cards are discovered
    let fullyDiscoveredRealms;

    if (skillMap[17002] && skillMap[17002].purchased) {
      // With skill 17002: First check if realm had all cards T20, then check if all cards have qty>0
      fullyDiscoveredRealms = realms.filter(r => {
        if (!r.unlocked) return false;

        // If this realm already achieved all T20, it's permanently locked in
        if (state.realmsWithAllT20.has(r.id)) return true;

        // Otherwise, check if all cards have qty > 0 (original logic)
        return cards.filter(c => c.realm === r.id).every(c => c.quantity > 0);
      }).length;
    } else {
      // Original logic: just check if all cards have qty > 0
      fullyDiscoveredRealms = realms.filter(r =>
        r.unlocked &&
        cards.filter(c => c.realm === r.id).every(c => c.quantity > 0)
      ).length;
    }
    //make this only apply the difference from the last time this was applied. 
    const difference = fullyDiscoveredRealms - lastFullyDiscoveredRealms;
    if (difference > 0){  
      lastFullyDiscoveredRealms = fullyDiscoveredRealms;
      //multiply currencyPerSecMultiplier and currencyPerPokeMultiplier by 2^difference
      //apply this to all currencies
      Object.keys(state.effects.currencyPerSecMultiplier).forEach(cur => {
        state.effects.currencyPerSecMultiplier[cur] *= Math.pow(2, difference);
      });
      Object.keys(state.effects.currencyPerPokeMultiplier).forEach(cur => {
        state.effects.currencyPerPokeMultiplier[cur] *= Math.pow(2, difference);
      });
    } else if (difference < 0) {
      lastFullyDiscoveredRealms = fullyDiscoveredRealms;

      //divide currencyPerSecMultiplier and currencyPerPokeMultiplier by 2^(-difference)
      //apply this to all currencies
      Object.keys(state.effects.currencyPerSecMultiplier).forEach(cur => {
        state.effects.currencyPerSecMultiplier[cur] /= Math.pow(2, -difference);
      });
      Object.keys(state.effects.currencyPerPokeMultiplier).forEach(cur => {
        state.effects.currencyPerPokeMultiplier[cur] /= Math.pow(2, -difference);
      });
    }

  }
}

// Add this function before DOMContentLoaded
function showOfflineEarningsModal(earnings) {
  if (Object.keys(earnings).length === 0) return;

  const ov = document.createElement('div');
  ov.className = 'offline-earnings-modal';
  ov.onclick = () => ov.remove();

  const mc = document.createElement('div');
  mc.className = 'offline-earnings-content';
  mc.onclick = e => e.stopPropagation();

  const gridContainer = document.createElement('div');
  gridContainer.className = 'offline-earnings-grid';

  // Add offline time header with max hours notification if needed
  let timeDiff = Math.floor((Date.now() - state.lastSaveTime) / 1000);
  const header = document.createElement('h3');
  header.innerHTML = `Time Offline: ${formatDuration(timeDiff)}` + 
    (timeDiff > state.maxOfflineHours * 3600 ? 
      ` <span style="color:#ff8888">(Max Reached: ${state.maxOfflineHours} Hours)</span>` : 
      '');
  header.style.textAlign = 'center';
  header.style.marginBottom = '20px';
  header.style.gridColumn = '1 / -1';
  gridContainer.appendChild(header);

  // LEFT COLUMN - Currencies
  const currencyColumn = document.createElement('div');
  currencyColumn.className = 'offline-earnings-column';
  
  const currencyHeader = document.createElement('h4');
  currencyHeader.textContent = 'Resources';
  currencyColumn.appendChild(currencyHeader);

  const currencyList = document.createElement('div');
  currencyList.className = 'offline-earnings-list';
  
  Object.entries(earnings).forEach(([curId, amount]) => {
    if (amount.lessThanOrEqualTo(0) || curId === 'harvester' || curId === 'timeCrunch') return;
    
    const meta = currencies.find(c => c.id === curId);
    if (!meta) return;

    const item = document.createElement('div');
    item.className = 'offline-earnings-item';
    item.innerHTML = `
      <span class="amount">+${formatNumber(amount)}</span>
      <img class="icon" src="assets/images/currencies/${meta.icon}" alt="${meta.name}" />
      <span class="name">${meta.name}</span>
    `;
    currencyList.appendChild(item);
  });
  currencyColumn.appendChild(currencyList);

  // RIGHT COLUMN - Progress
  const progressColumn = document.createElement('div');
  progressColumn.className = 'offline-earnings-column';
  
  const progressHeader = document.createElement('h4');
  progressHeader.textContent = 'Progress';
  progressColumn.appendChild(progressHeader);

  const progressList = document.createElement('div');
  progressList.className = 'offline-earnings-list';

  // Check for cooldown progression
  if (state.remainingCooldown > 0) {
    timeDiff = Math.floor(Math.min((Date.now() - state.lastSaveTime) / 1000, state.maxOfflineHours * 3600));
    const cooldownReduction = Math.min(state.remainingCooldown, timeDiff);
    
    if (cooldownReduction > 0) {
      const cooldownItem = document.createElement('div');
      cooldownItem.className = 'offline-earnings-item';
      cooldownItem.innerHTML = `
        <span class="amount">-${formatDuration(cooldownReduction)}</span>
        <img class="icon" src="assets/images/black_hole.png" alt="Cooldown" />
        <span class="name">Cooldown</span>
      `;
      progressList.appendChild(cooldownItem);

      // Update stored cooldown and resume it
      state.remainingCooldown = state.remainingCooldown - cooldownReduction;
      if (state.remainingCooldown <= 0) {
        holeBtn.disabled = false;
        holeBtn.classList.remove('disabled');
      } else {
        resumeCooldown();
      }
    }
  }

  // Add harvester progress if applicable
  if (earnings.harvester) {
    const harvesterItem = document.createElement('div');
    harvesterItem.className = 'offline-earnings-item';
    harvesterItem.innerHTML = `
      <span class="amount">+${formatDuration(earnings.harvester)}</span>
      <img class="icon" src="assets/images/harvester.png" alt="Harvester" />
      <span class="name">Harvester</span>
    `;
    progressList.appendChild(harvesterItem);
  }

  if (earnings.interceptor) {
    const interceptorItem = document.createElement('div');
    interceptorItem.className = 'offline-earnings-item';
    interceptorItem.innerHTML = `
      <span class="amount">+${formatDuration(earnings.interceptor)}</span>
      <img class="icon" src="assets/images/interceptor.png" alt="Interceptor" />
      <span class="name">Interceptor</span>
    `;
    progressList.appendChild(interceptorItem);
  }

  // Add Time Crunch progress if applicable
  if (earnings.timeCrunch) {
    const timeCrunchItem = document.createElement('div');
    timeCrunchItem.className = 'offline-earnings-item';
    timeCrunchItem.innerHTML = `
      <span class="amount">+${formatDuration(earnings.timeCrunch)}</span>
      <img class="icon" src="assets/images/time_crunch.png" alt="Time Crunch" />
      <span class="name">Time Crunch</span>
    `;
    progressList.appendChild(timeCrunchItem);
  }
  
  progressColumn.appendChild(progressList);

  // Add columns to grid
  gridContainer.appendChild(currencyColumn);
  gridContainer.appendChild(progressColumn);

  mc.appendChild(gridContainer);
  ov.appendChild(mc);
  document.body.appendChild(ov);

  // Force a reflow to ensure proper positioning
  void ov.offsetHeight;

  setTimeout(() => ov.remove(), 10000);
}

// Preload all game assets
async function preloadGameAssets() {
  // Preload card images
  const cardPaths = cards.map(c => `assets/images/cards/${c.realm}/${slugify(c.name)}.jpg`);
  const framePaths = [...new Set(cards.map(c => `assets/images/frames/${c.rarity}_frame.jpg`))];
  const cardBackPaths = [...new Set(realms.map(r => `assets/images/card_backs/${slugify(r.name)}_card_back.jpg`))];
  
  // Preload currency images
  const currencyPaths = currencies.map(c => `assets/images/currencies/${c.icon}`);
  
  // Preload tier images
  const tierPaths = Array.from({length: 10}, (_, i) => `assets/images/tiers/tier_${i}.png`);

  // Preload merchant images
  const merchantPaths = [...new Set(merchants.map(m => `assets/images/merchants/${slugify(m.name)}.jpg`))];
  
  try {
      await Promise.all([
          imageCache.preloadImages('cards', cardPaths),
          imageCache.preloadImages('frames', framePaths),
          imageCache.preloadImages('cardBacks', cardBackPaths),
          imageCache.preloadImages('currencies', currencyPaths),
          imageCache.preloadImages('tiers', tierPaths),
          imageCache.preloadImages('merchants', merchantPaths)
      ]);
      console.log('All game assets preloaded successfully');
  } catch (error) {
      console.error('Failed to preload some game assets:', error);
  }
}

// --- INIT AFTER DOM READY ---
document.addEventListener('DOMContentLoaded', async ()=>{

  await preloadGameAssets();

  // Session variable to track if user dismissed the landscape overlay
  let landscapeOverlayDismissed = false;
  let wasInLandscape = false;

  // Check initial orientation
  const checkOrientation = () => {
    const overlay = document.getElementById('landscape-overlay');
    const isPortrait = window.innerHeight > window.innerWidth * 1.1;
    const isLandscape = !isPortrait;

    // If user goes to landscape and back to portrait, reset the dismissal
    if (isLandscape) {
      wasInLandscape = true;
    } else if (wasInLandscape && isPortrait) {
      // User went from landscape back to portrait, reset dismissal
      landscapeOverlayDismissed = false;
      wasInLandscape = false;
    }

    // Show overlay only if in portrait AND not dismissed for this session
    overlay.style.display = (isPortrait && !landscapeOverlayDismissed) ? 'flex' : 'none';
  };

  // Add dismiss button functionality
  document.getElementById('dismiss-landscape-btn').addEventListener('click', () => {
    landscapeOverlayDismissed = true;
    document.getElementById('landscape-overlay').style.display = 'none';
  });

  // Check orientation on load and resize
  checkOrientation();
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);

  loadState();

  // Show welcome modal for new users
  if (!state.lastSaveTime) {
    showWelcomeModal();
  }

  // Initialize all game data
  cards.forEach(c => {
    c.lastAppliedEffects = {};
    if (c.quantity > 0) {
      // Apply base effects
      const cur = computeCardEffects(c);
      applyEffectsDelta(cur, +1);
      c.lastAppliedEffects = cur;

      // Apply special effects
      const specialEffs = computeSpecialEffects(c);
      applyEffectsDelta(specialEffs, +1);
      c.lastAppliedEffects = { ...c.lastAppliedEffects, ...specialEffs };

      // Check and update available effects
      checkAndUpdateAvailableEffects(c);
    }
  });

  // Initialize realm weights
  for (const realmId in realmMap) {
    const realm = realmMap[realmId];
    const rarities = Object.keys(realm.rarityWeights).filter(r => realm.rarityWeights[r] > 0);
    rarities.sort((a, b) => {
        const aIndex = window.rarities.indexOf(a);
        const bIndex = window.rarities.indexOf(b);
        return bIndex - aIndex;
    });

    let highestWeight = 0;
    for (let i = 0; i < rarities.length; i++) {
        const currentRarity = rarities[i];
        const uncapped = realm.uncappedRarityWeights[currentRarity];
        
        if (uncapped < highestWeight) {
            realm.rarityWeights[currentRarity] = highestWeight;
        } else {
            realm.rarityWeights[currentRarity] = uncapped;
            highestWeight = uncapped;
        }
    }
  }

  loadFinished = true;

  // Initialize all game systems
  state.selectedRealms = realms.filter(r => r.unlocked).map(r => r.id);
  renderRealmFilters();
  showTab('hole');
  updateCurrencyBar();
  initSkillsFilters();
  updateStatsUI();
  checkForNewCards();
  updatePokeFilterStats();
  updateGeneratorRates();
  checkAffordableSkills();
  processNewCardDiscovered();
  initHarvester();
  initGravitationalWaveAbsorber();
  initSpaceBendingInterceptor();
  initTimeCrunchCollector();

  // Initialize device tooltips after all devices are initialized
  initDeviceTooltips();

  // Initialize battle system last, after all other systems
  if (realms[10].unlocked) {
    initBattleSystem();
  }

  // Calculate offline progress after all effects are computed
  if (state.lastSaveTime) {
    const timeDiff = Math.floor(Math.min((Date.now() - state.lastSaveTime) / 1000, state.maxOfflineHours * 3600));
    
    const offlineEarnings = {};
    
    // Award currency based on currencyPerSec and time difference
    Object.entries(state.effects.currencyPerSec).forEach(([curId, rate]) => {
      if (rate && state.currencies[curId] != null) {
        // Get generator contribution
        const gen = state.resourceGeneratorContribution[curId] || 0;
        // Add generator contribution to the rate
        const totalRate = rate + gen;
        if (!totalRate) return;
        const offlineGain = new Decimal(totalRate).times(timeDiff);
        state.currencies[curId] = state.currencies[curId].plus(offlineGain);
        offlineEarnings[curId] = offlineGain;
      }
    });

    if (skillMap[12001].purchased) {
      // Award harvester value based on time difference
      const harvesterGain = timeDiff / 1000 * (skillMap[12002].purchased ? 2 : 1) * (skillMap[12003].purchased ? 10 : 1);
      state.harvesterValue = state.harvesterValue + harvesterGain;
      offlineEarnings['harvester'] = new Decimal(harvesterGain);
    }

    if (skillMap[12201].purchased && !state.interceptorActive) {
      // Award interceptor value based on time difference
      const interceptorGain = timeDiff / 1000 * (skillMap[12202].purchased ? 2 : 1);
      state.interceptorValue = state.interceptorValue + interceptorGain;
      offlineEarnings['interceptor'] = new Decimal(interceptorGain);
    }

    if (skillMap[12301].purchased) {
      // Award Time Crunch value based on time difference
      const timeCrunchGain = timeDiff;  // Remove the /1000 division since we want full seconds
      const actualGain = Math.min(timeCrunchGain, state.timeCrunchMaxChargeTime - state.timeCrunchValue); // Only count what actually gets added
      state.timeCrunchValue = Math.min(state.timeCrunchValue + timeCrunchGain, state.timeCrunchMaxChargeTime); // Cap at 5 minutes
      offlineEarnings['timeCrunch'] = new Decimal(actualGain);
    }

    // Show earnings modal
    showOfflineEarningsModal(offlineEarnings);

    saveState();
  }

  ['hole','cards','skills','merchant','battles','achievements','stats','settings'].forEach(t=>{
    document.getElementById(`tab-btn-${t}`).onclick = ()=> showTab(t);
  });
  
  // Initialize sorted skills on load
  initializeSortedSkills();

  state.selectedRealms = realms.filter(r => r.unlocked).map(r => r.id);
  renderRealmFilters();
  showTab('hole');

  updateCurrencyBar();
  initSkillsFilters();
  updateStatsUI();
  checkForNewCards();
  updatePokeFilterStats();
  updateGeneratorRates();
  checkAffordableSkills();
  processNewCardDiscovered();

  initHarvester();
  initGravitationalWaveAbsorber();
  initSpaceBendingInterceptor();

  // Merchant initialization and refresh time handling
  if (state.currentMerchant) {
    // we have a saved merchant + offers,
    // so restore our refresh timer and just render
    if (state.merchantRefreshTime != null) {
      nextRefresh = Date.now() + state.merchantRefreshTime;
    } else {
      nextRefresh = Date.now() + (300 - state.effects.merchantCooldownReduction) * state.currentMerchant.refreshTime * 1000;
    }
    renderMerchantTab();
  } else {
    // first time ever, pick a new one
    state.currentMerchant = pickMerchant();
    nextRefresh = Date.now() + (300 - state.effects.merchantCooldownReduction) * state.currentMerchant.refreshTime * 1000;
    genMerchantOffers();
    renderMerchantTab();
  }

  // Store interval IDs for cleanup
  merchantInterval = setInterval(refreshMerchantIfNeeded, 100);
  currencyInterval = setInterval(updateCurrencyAndSave, 1000);

  // Store event handlers for cleanup
  touchMoveHandler = (e) => {
    if (!drawArea.classList.contains('hole-draw-area')) return;
    const touch = e.touches[0];
    // ... existing touchmove code ...
  };
  touchEndHandler = (e) => {
    if (!drawArea.classList.contains('hole-draw-area')) return;
    isScrolling = false;
    lastFlippedCard = null;
  };
  resizeHandler = checkOrientation;
  orientationHandler = checkOrientation;

  drawArea.addEventListener('touchmove', touchMoveHandler, { passive: false });
  drawArea.addEventListener('touchend', touchEndHandler);
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('orientationchange', orientationHandler);

  // Check for saved cooldown
  if (state.remainingCooldown > 0) {
    resumeCooldown();
  } else {
    holeBtn.disabled = false;
    holeBtn.classList.remove('disabled');
  }

  // Initialize Time Crunch
  if (state.timeCrunchValue > 0) {
    setTimeCrunchValue(state.timeCrunchValue);
  }
  initTimeCrunchCollector();

  renderAchievements();

  initializeSettingsTab();

  // Update The End button visibility on load
  if (typeof updateTheEndButtonVisibility === 'function') {
    updateTheEndButtonVisibility();
  }

  bossMechanicsByName = getBossMechanicsByName();

  // Check for Gauntlet on load
  checkGauntletOnLoad();

});

// Gauntlet timing functions
function startGauntletTimer() {
  state.gauntletStartTime = Date.now();
  state.gauntletNotifications.clear();

  // Start the Gauntlet interval (check every 30 seconds)
  if (gauntletInterval) {
    clearInterval(gauntletInterval);
  }

  gauntletInterval = setInterval(checkGauntletTime, 30000);
  saveState();
}

function checkGauntletTime() {
  if (!state.runningGauntlet || !state.gauntletStartTime) {
    clearGauntletTimer();
    return;
  }

  const elapsed = Date.now() - state.gauntletStartTime;
  const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const remaining = fourHours - elapsed;

  // Check if Gauntlet has failed (time expired)
  if (remaining <= 0) {
    state.runningGauntlet = false;
    clearGauntletTimer();
    showTidbit('Gauntlet failed - time expired!');
    saveState();
    return;
  }

  // Convert remaining time to minutes
  const remainingMinutes = Math.floor(remaining / (60 * 1000));

  // Define notification thresholds in minutes
  const notifications = [
    { minutes: 225, message: '3 hours and 45 minutes remaining in Gauntlet!' },
    { minutes: 210, message: '3 hours and 30 minutes remaining in Gauntlet!' },
    { minutes: 195, message: '3 hours and 15 minutes remaining in Gauntlet!' },
    { minutes: 180, message: '3 hours remaining in Gauntlet!' },
    { minutes: 165, message: '2 hours and 45 minutes remaining in Gauntlet!' },
    { minutes: 150, message: '2 hours and 30 minutes remaining in Gauntlet!' },
    { minutes: 135, message: '2 hours and 15 minutes remaining in Gauntlet!' },
    { minutes: 120, message: '2 hours remaining in Gauntlet!' },
    { minutes: 105, message: '1 hour and 45 minutes remaining in Gauntlet!' },
    { minutes: 90, message: '1 hour and 30 minutes remaining in Gauntlet!' },
    { minutes: 75, message: '1 hour and 15 minutes remaining in Gauntlet!' },
    { minutes: 60, message: '1 hour remaining in Gauntlet!' },
    { minutes: 45, message: '45 minutes remaining in Gauntlet!' },
    { minutes: 30, message: '30 minutes remaining in Gauntlet!' },
    { minutes: 20, message: '20 minutes remaining in Gauntlet!' },
    { minutes: 15, message: '15 minutes remaining in Gauntlet!' },
    { minutes: 10, message: '10 minutes remaining in Gauntlet!' },
    { minutes: 5, message: '5 minutes remaining in Gauntlet!' },
    { minutes: 4, message: '4 minutes remaining in Gauntlet!' },
    { minutes: 3, message: '3 minutes remaining in Gauntlet!' },
    { minutes: 2, message: '2 minutes remaining in Gauntlet!' },
    { minutes: 1, message: '1 minute remaining in Gauntlet!' }
  ];

  // Check each notification threshold
  notifications.forEach(notification => {
    const key = `${notification.minutes}min`;
    if (remainingMinutes <= notification.minutes && !state.gauntletNotifications.has(key)) {
      state.gauntletNotifications.add(key);
      showTidbit(notification.message);
      saveState();
    }
  });
}

function clearGauntletTimer() {
  if (gauntletInterval) {
    clearInterval(gauntletInterval);
    gauntletInterval = null;
  }
}

function checkGauntletOnLoad() {
  if (!state.runningGauntlet || !state.gauntletStartTime) {
    return;
  }

  const elapsed = Date.now() - state.gauntletStartTime;
  const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const remaining = fourHours - elapsed;

  // Check if Gauntlet has failed while offline
  if (remaining <= 0) {
    state.runningGauntlet = false;
    state.gauntletStartTime = null;
    state.gauntletNotifications.clear();
    showTidbit('Gauntlet failed - time expired while you were away!');
    saveState();
    return;
  }

  // Show remaining time message
  const remainingHours = Math.floor(remaining / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  let timeMessage;
  if (remainingHours > 0) {
    timeMessage = `${remainingHours} hour${remainingHours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining in Gauntlet`;
  } else {
    timeMessage = `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining in Gauntlet`;
  }

  showTidbit(timeMessage);

  // Restart the timer
  if (gauntletInterval) {
    clearInterval(gauntletInterval);
  }
  gauntletInterval = setInterval(checkGauntletTime, 30000);
}

// Welcome Modal Function
function showWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');
  if (!welcomeModal) return;

  welcomeModal.style.display = 'flex';

  // Remove any existing event listeners to prevent duplicates
  const closeBtn = welcomeModal.querySelector('.welcome-close-btn');
  if (closeBtn) {
    // Clone the button to remove all event listeners
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    // Add the close handler
    newCloseBtn.onclick = () => {
      welcomeModal.style.display = 'none';
    };
  }

  // Remove existing click-outside handler and add new one
  const newWelcomeModal = welcomeModal.cloneNode(true);
  welcomeModal.parentNode.replaceChild(newWelcomeModal, welcomeModal);

  // Add click outside to close
  newWelcomeModal.onclick = (e) => {
    if (e.target === newWelcomeModal) {
      newWelcomeModal.style.display = 'none';
    }
  };

  // Re-add the close button handler to the new modal
  const newCloseBtn = newWelcomeModal.querySelector('.welcome-close-btn');
  if (newCloseBtn) {
    newCloseBtn.onclick = () => {
      newWelcomeModal.style.display = 'none';
    };
  }
}

// The End Modal - Epic Finale
function showTheEndModal() {
  const overlay = document.createElement('div');
  overlay.className = 'the-end-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, rgba(138, 43, 226, 0.3), rgba(0, 0, 0, 0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: theEndFadeIn 2s ease-in-out;
    overflow: hidden;
    padding: 20px;
    box-sizing: border-box;
  `;

  const modal = document.createElement('div');
  modal.className = 'the-end-modal';
  modal.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    border: 4px solid #ffd700;
    border-radius: 20px;
    padding: 20px;
    max-width: 800px;
    width: 90vw;
    max-height: 90vh;
    text-align: center;
    position: relative;
    box-shadow:
      0 0 50px rgba(255, 215, 0, 0.8),
      inset 0 0 30px rgba(255, 215, 0, 0.2);
    animation: theEndGlow 3s ease-in-out infinite alternate;
    overflow-y: auto;
    margin: auto;
    transform-origin: center;
  `;

  // Add sparkle background
  const sparkles = document.createElement('div');
  sparkles.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      radial-gradient(circle at 60% 20%, rgba(255, 215, 0, 0.08) 1px, transparent 1px);
    background-size: 100px 100px, 150px 150px, 80px 80px, 120px 120px;
    animation: sparkleFloat 20s linear infinite;
    pointer-events: none;
  `;
  modal.appendChild(sparkles);

  const content = document.createElement('div');
  content.style.cssText = `
    position: relative;
    z-index: 2;
    color: #ffffff;
  `;

  // Title with epic styling
  const title = document.createElement('h1');
  title.textContent = 'THE END';
  title.style.cssText = `
    font-size: clamp(2.5em, 8vw, 4em);
    font-weight: bold;
    margin: 0 0 20px 0;
    background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    animation: titlePulse 2s ease-in-out infinite alternate;
  `;

  // Thank you message
  const thankYou = document.createElement('div');
  thankYou.innerHTML = `
    <p style="font-size: clamp(1.2em, 4vw, 1.5em); margin: 15px 0; line-height: 1.6; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
      🎉 <strong>CONGRATULATIONS!</strong> 🎉
    </p>
    <p style="font-size: clamp(1em, 3vw, 1.2em); margin: 15px 0; line-height: 1.6; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
      You have completed <strong>Cosmic Collection</strong>!<br>
      Thank you so much for playing through this entire journey!
    </p>
    <p style="font-size: clamp(0.9em, 2.5vw, 1.1em); margin: 20px 0; line-height: 1.6; text-shadow: 0 2px 4px rgba(0,0,0,0.5); color: #ffed4e;">
      I am incredibly grateful to the amazing <strong>Discord Community</strong> for all the feedback,
      discussions, and suggestions that shaped this game into what it is today.
      You all made this so much better!
    </p>
    <p style="font-size: clamp(0.9em, 2.5vw, 1.1em); margin: 20px 0; line-height: 1.6; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
      I really appreciate you, and if you enjoyed the progression, strategy, and luck elements of this game,
      I invite you to try my other games. (in my humble opinion as you saw in Incremental Games realm, I believe Degens Idle is way more fun and strategic)
    </p>
  `;

  // Game recommendations with styling
  const gameRecs = document.createElement('div');
  gameRecs.innerHTML = `
    <div style="
      background: rgba(255, 215, 0, 0.1);
      border: 2px solid #ffd700;
      border-radius: 15px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    ">
      <p style="font-size: clamp(0.9em, 2.5vw, 1.1em); margin: 15px 0; line-height: 1.5;">
        Play them for free at <a href="https://www.kuzzigames.com" target="_blank" style="
          color: #ffed4e;
          font-weight: bold;
          text-decoration: underline;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.color='#ffd700'; this.style.textShadow='0 0 10px rgba(255,215,0,0.8)'"
           onmouseout="this.style.color='#ffed4e'; this.style.textShadow='none'">www.kuzzigames.com</a>
      </p>
    </div>
  `;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Thank You! 💜';
  closeBtn.style.cssText = `
    background: linear-gradient(45deg, #8a2be2, #9932cc);
    color: white;
    border: 2px solid #ffd700;
    border-radius: 25px;
    padding: 12px 25px;
    font-size: clamp(1em, 3vw, 1.2em);
    font-weight: bold;
    cursor: pointer;
    margin-top: 25px;
    box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4);
    transition: all 0.3s ease;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  `;

  closeBtn.onmouseover = () => {
    closeBtn.style.transform = 'scale(1.05)';
    closeBtn.style.boxShadow = '0 6px 20px rgba(138, 43, 226, 0.6)';
  };

  closeBtn.onmouseout = () => {
    closeBtn.style.transform = 'scale(1)';
    closeBtn.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.4)';
  };

  closeBtn.onclick = () => {
    overlay.style.animation = 'theEndFadeOut 1s ease-in-out';
    setTimeout(() => overlay.remove(), 1000);
  };

  content.appendChild(title);
  content.appendChild(thankYou);
  content.appendChild(gameRecs);
  content.appendChild(closeBtn);
  modal.appendChild(content);
  overlay.appendChild(modal);

  // Add click outside to close
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.style.animation = 'theEndFadeOut 1s ease-in-out';
      setTimeout(() => overlay.remove(), 1000);
    }
  };

  document.body.appendChild(overlay);

  // Check if content overflows and adjust scrolling accordingly
  setTimeout(() => {
    const modalHeight = modal.scrollHeight;
    const viewportHeight = window.innerHeight * 0.9; // 90vh

    if (modalHeight > viewportHeight) {
      // Content overflows, enable scrolling
      overlay.style.overflow = 'auto';
      modal.style.overflowY = 'auto';
    } else {
      // Content fits, disable scrolling
      overlay.style.overflow = 'hidden';
      modal.style.overflowY = 'visible';
    }
  }, 100);
}

// Add cleanup function
function cleanup() {
  // Clear intervals
  if (merchantInterval) clearInterval(merchantInterval);
  if (currencyInterval) clearInterval(currencyInterval);
  if (blackHoleTimer) clearInterval(blackHoleTimer);
  if (timeCrunchInterval) clearInterval(timeCrunchInterval);

  // Remove event listeners
  drawArea.removeEventListener('touchmove', touchMoveHandler);
  drawArea.removeEventListener('touchend', touchEndHandler);
  window.removeEventListener('resize', resizeHandler);
  window.removeEventListener('orientationchange', orientationHandler);

  // Clear any remaining animations
  if (fillAnim) anime.remove(globalFill);
}

// Add cleanup on page unload
window.addEventListener('unload', cleanup);

// Add cleanup to reset game function if it exists
if (typeof resetGame === 'function') {
  const originalResetGame = resetGame;
  resetGame = function() {
    cleanup();
    originalResetGame();
  };
}

function updateCurrencyAndSave() {
  // First check for offline gains if enough time has passed
  const timeDiff = Math.floor(Math.min((Date.now() - state.lastSaveTime) / 1000, state.maxOfflineHours * 3600));
  
  if (timeDiff > 10) {
    // Calculate offline gains
    const offlineEarnings = {};
    
    // Award currency based on currencyPerSec and time difference
    Object.entries(state.effects.currencyPerSec).forEach(([curId, rate]) => {
      if (rate && state.currencies[curId] != null) {
        // Get generator contribution
        const gen = state.resourceGeneratorContribution[curId] || 0;
        // Add generator contribution to the rate
        const totalRate = rate * state.effects.currencyPerSecMultiplier[curId] + gen;
        if (!totalRate) return;
        const offlineGain = new Decimal(totalRate).times(timeDiff);
        state.currencies[curId] = state.currencies[curId].plus(offlineGain);
        offlineEarnings[curId] = offlineGain;
      }
    });

    if (skillMap[12001].purchased) {
      // Award harvester value based on time difference
      const harvesterGain = timeDiff / 1000 * (skillMap[12002].purchased ? 2 : 1) * (skillMap[12003].purchased ? 10 : 1);
      state.harvesterValue = state.harvesterValue + harvesterGain;
      offlineEarnings['harvester'] = new Decimal(harvesterGain);
    }

    if (skillMap[12201].purchased && !state.interceptorActive) {
      // Award interceptor value based on time difference
      const interceptorGain = timeDiff / 1000 * (skillMap[12202].purchased ? 2 : 1);
      state.interceptorValue = state.interceptorValue + interceptorGain;
      offlineEarnings['interceptor'] = new Decimal(interceptorGain);
    }

    if (skillMap[12301].purchased) {
      // Award Time Crunch value based on time difference
      const timeCrunchGain = timeDiff;
      const actualGain = Math.min(timeCrunchGain, state.timeCrunchMaxChargeTime - state.timeCrunchValue);
      state.timeCrunchValue = Math.min(state.timeCrunchValue + timeCrunchGain, state.timeCrunchMaxChargeTime);
      offlineEarnings['timeCrunch'] = new Decimal(actualGain);
    }

    // Show earnings modal
    showOfflineEarningsModal(offlineEarnings);
  }

  // Then update currency per second
  Object.entries(state.effects.currencyPerSec).forEach(([curId, rate]) => {
    if (state.currencies[curId] == null) return;
    const gen = state.resourceGeneratorContribution[curId] || 0;
    const totalRate = rate * state.effects.currencyPerSecMultiplier[curId] + gen;
    if (!totalRate) return;
    state.currencies[curId] = state.currencies[curId].plus(new Decimal(totalRate));
  });
  updateCurrencyBar();

  // Finally save the game state
  saveState();
}

// Function to check if all cards in a realm have reached T20 and track it
function checkAndTrackRealmT20Achievement(realmId) {
  // Only check if skill 17002 is purchased
  if (!skillMap[17002] || !skillMap[17002].purchased) return;

  // Skip if already tracked
  if (state.realmsWithAllT20.has(realmId)) return;

  // Get all cards in the realm
  const realmCards = cards.filter(c => c.realm === realmId);
  if (realmCards.length === 0) return;

  // Check if all cards have reached T20 (max tier)
  const allCardsT20 = realmCards.every(c => c.tier >= 20);

  if (allCardsT20) {
    state.realmsWithAllT20.add(realmId);
    showTidbit(`Realm ${realmId} has all cards at Tier 20! Realm Conqueror bonus locked in permanently.`, 4000);

    // Update UI if we're on the cards collection screen
    if (currentTab === 'cards') {
      renderCardsCollection();
    }
  }
}