
// Map of source cards to target enemies with their effects
const BATTLE_TRICKS = {    // Philosopher's Stone → Mnemosyne
    "1008": {
        targetEnemy: "Eros",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.5);
        },
        tidbit: "Without his bow, Eros is powerless. You feel bad looking at him hopelessly throwing arrows at your cards.<br><br>[Reduces attack by 50%]",
        achievement: "greekGodBattleTricks",
    },
      // Eagle → Prometheus
    "417": {
        targetEnemy: "Prometheus",
        effect: (enemy) => {
            enemy.currentHp -= enemy.currentHp * 0.25;
        },
        tidbit: "Prometheus sees an eagle and cowers in fear, traumatized by the eternity he spent chained to a rock.<br><br>[Reduces current HP by 25%]",
        achievement: "greekGodBattleTricks2",
    },
      // Earth → Atlas
    "604": {
        targetEnemy: "Atlas",
        effect: (enemy) => {
            enemy.currentHp -= enemy.currentHp * 0.2;
        },
        tidbit: "Atlas feels the weight of the world upon him once again.<br><br>[Reduces current HP by 20%]",
        achievement: "greekGodBattleTricks3",
    },
    "527": {
        targetEnemy: "Dionysus",
        effect: (enemy) => {
            enemy.stunTurns += 7;
            enemy.attack = Math.floor(enemy.attack * 1.1);
        },
        tidbit: "Dionysus is dumbfounded that the Cup of Eterenal Youth exists and gets angered by it. <br><br>[Stunned for 7 turns but Increases attack by 10%]",
        achievement: "greekGodBattleTricks4",
        
    },
      // Mjölnir → Hephaestus
    "519": {
        targetEnemy: "Hephaestus",
        effect: (enemy) => {
            enemy.stunTurns += 6;
        },
        tidbit: "Hephaestus marvels at the craftsmanship of the legendary hammer.<br><br>[Stunned for 6 turns]",
        achievement: "greekGodBattleTricks5",
    },
      // Caduceus of Hermes → Hermes
    "521": {
        targetEnemy: "Hermes",
        effect: (enemy) => {            
            enemy.stunTurns += 3;
            enemy.attack = Math.floor(enemy.attack * 0.8);
        },
        tidbit: "Hermes is demoralized by you having the Caduceus.<br><br>[Stunned for 3 turns and Reduces attack by 20%]",
        achievement: "greekGodBattleTricks6",
    },
      // Mars → Ares
    "605": {
        targetEnemy: "Ares",
        effect: (enemy) => {
            enemy.stunTurns += 5;
            enemy.currentHp -= enemy.currentHp * 0.1;
        },
        tidbit: "Ares recognizes his Roman counterpart, momentarily confused by the duality and saddened by the wrong name being chosen to name a planet.<br><br>[Stunned for 5 turns and Reduces current HP by 10%]",
        achievement: "greekGodBattleTricks7",
    },
      // Wolf → Artemis
    "706": {
        targetEnemy: "Artemis",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.65);
        },
        tidbit: "Artemis has a soft spot for wolves. She cannot use her full power against them.<br><br>[Reduces attack by 35%]",
        achievement: "greekGodBattleTricks8",
    },
      // Enchanted Mirror → Apollo
    "512": {
        targetEnemy: "Apollo",
        effect: (enemy) => {
            enemy.stunTurns += 7;
        },
        tidbit: "Apollo catches his own reflection and becomes entranced by his beauty.<br><br>[Stunned for 7 turns]",
        achievement: "greekGodBattleTricks9",
    },
      // Aegis Shield → Athena
    "522": {
        targetEnemy: "Athena",
        effect: (enemy) => {
            enemy.stunTurns += 8;
        },
        tidbit: "Athena falls for her own party trick. Looking at the shield temporarily petrifies her.<br><br>[Stunned for 8 turns]",
        achievement: "greekGodBattleTricks10",
    },
      // Cerberus → Hades
    "719": {
        targetEnemy: "Hades",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.9);
            enemy.stunTurns += 4;
        },
        tidbit: "Hades sees his faithful hound and momentarily drops his guard. How could you turn a dog against his master? Pure evil.<br><br>[Reduces attack by 10% and Stunned for 4 turns]",
        achievement: "greekGodBattleTricks11",
    },
      // Poseidon's Trident → Poseidon
    "220": {
        targetEnemy: "Poseidon",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.75);
        },
        tidbit: "Poseidon reaches for his trident, realizing he's lost it. His power is diminished.<br><br>[Reduces attack by 25%]",
        achievement: "greekGodBattleTricks12",
    },
      // Phoenix → Tartarus
    "420": {
        targetEnemy: "Tartarus",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.8);
            enemy.currentHp -= enemy.currentHp * 0.2;
        },
        tidbit: "The Phoenix's eternal cycle of rebirth paradoxically conflicts with the depths of Tartarus.<br><br>[Reduces attack and current HP by 20%]",
        achievement: "greekGodBattleTricks13",
    },
      // Kraken → Typhon
    "731": {
        targetEnemy: "Typhon",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 1.5);
            enemy.currentHp -= enemy.currentHp * 0.3;
        },
        tidbit: "Typhon recognizes a fellow monster of the deep, and switches to a more aggressive stance.[Increases attack by 50% but reduces current HP by 30%]",    
        achievement: "greekGodBattleTricks14",
    },
    
    // Sun → Nyx
    "607": {
        targetEnemy: "Nyx",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.75);
        },
        tidbit: "The Sun's radiance pierces Nyx's eternal darkness, momentarily banishing the night and suppresses her nocturnal powers.<br><br>[Reduces attack by 25%]",
        achievement: "greekGodBattleTricks15",
    }
};

// Function to display a tidbit
function showTidbit(text) {
    const tidbitEl = document.createElement('div');
    tidbitEl.className = 'battle-tidbit';
    tidbitEl.innerHTML = text;
    document.body.appendChild(tidbitEl);

    // Animate in
    tidbitEl.style.animation = 'tidbitFadeIn 0.5s ease-out forwards';

    // Remove after animation
    setTimeout(() => {
        tidbitEl.style.animation = 'tidbitFadeOut 0.5s ease-out forwards';
        setTimeout(() => tidbitEl.remove(), 500);
    }, 8000);
}

// Function to check for and apply battle tricks
function checkBattleTrick(cardId, enemy) {
    const trick = BATTLE_TRICKS[cardId];
    if (trick && enemy.name === trick.targetEnemy) {
        // Show the tidbit
        showTidbit(trick.tidbit);
        
        // Apply the effect
        trick.effect(enemy);

        unlockAchievement(trick.achievement);
        
        // Return true to indicate a trick was applied
        return true;
    }
    return false;
}