
// Map of source cards to target enemies with their effects
const BATTLE_TRICKS = {    
    
    "1008": {
        targetEnemy: "Eros",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.5);
        },
        tidbit: "Without his bow, Eros is powerless. You feel bad looking at him hopelessly throwing arrows at your cards.<br><br>[Reduces attack by 50%]",
        achievement: "greekGodBattleTricks",
    },

    "417": {
        targetEnemy: "Prometheus",
        effect: (enemy) => {
            enemy.currentHp -= enemy.currentHp * 0.25;
        },
        tidbit: "Prometheus sees an eagle and cowers in fear, traumatized by the eternity he spent chained to a rock.<br><br>[Reduces current HP by 25%]",
        achievement: "greekGodBattleTricks2",
    },

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

    "519": {
        targetEnemy: "Hephaestus",
        effect: (enemy) => {
            enemy.stunTurns += 6;
        },
        tidbit: "Hephaestus marvels at the craftsmanship of the legendary hammer.<br><br>[Stunned for 6 turns]",
        achievement: "greekGodBattleTricks5",
    },

    "521": {
        targetEnemy: "Hermes",
        effect: (enemy) => {            
            enemy.stunTurns += 3;
            enemy.attack = Math.floor(enemy.attack * 0.8);
        },
        tidbit: "Hermes is demoralized by you having the Caduceus.<br><br>[Stunned for 3 turns and Reduces attack by 20%]",
        achievement: "greekGodBattleTricks6",
    },

    "605": {
        targetEnemy: "Ares",
        effect: (enemy) => {
            enemy.stunTurns += 5;
            enemy.currentHp -= enemy.currentHp * 0.1;
        },
        tidbit: "Ares recognizes his Roman counterpart, momentarily confused by the duality and saddened by the wrong name being chosen to name a planet.<br><br>[Stunned for 5 turns and Reduces current HP by 10%]",
        achievement: "greekGodBattleTricks7",
    },

    "706": {
        targetEnemy: "Artemis",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.65);
        },
        tidbit: "Artemis has a soft spot for wolves. She cannot use her full power against them.<br><br>[Reduces attack by 35%]",
        achievement: "greekGodBattleTricks8",
    },

    "512": {
        targetEnemy: "Apollo",
        effect: (enemy) => {
            enemy.stunTurns += 7;
        },
        tidbit: "Apollo catches his own reflection and becomes entranced by his beauty.<br><br>[Stunned for 7 turns]",
        achievement: "greekGodBattleTricks9",
    },

    "522": {
        targetEnemy: "Athena",
        effect: (enemy) => {
            enemy.stunTurns += 8;
        },
        tidbit: "Athena falls for her own party trick. Looking at the shield temporarily petrifies her.<br><br>[Stunned for 8 turns]",
        achievement: "greekGodBattleTricks10",
    },

    "719": {
        targetEnemy: "Hades",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.9);
            enemy.stunTurns += 4;
        },
        tidbit: "Hades sees his faithful hound and momentarily drops his guard. How could you turn a dog against his master? Pure evil.<br><br>[Reduces attack by 10% and Stunned for 4 turns]",
        achievement: "greekGodBattleTricks11",
    },

    "220": {
        targetEnemy: "Poseidon",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.75);
        },
        tidbit: "Poseidon reaches for his trident, realizing he's lost it. His power is diminished.<br><br>[Reduces attack by 25%]",
        achievement: "greekGodBattleTricks12",
    },

    "420": {
        targetEnemy: "Tartarus",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.8);
            enemy.currentHp -= enemy.currentHp * 0.2;
        },
        tidbit: "The Phoenix's eternal cycle of rebirth paradoxically conflicts with the depths of Tartarus.<br><br>[Reduces attack and current HP by 20%]",
        achievement: "greekGodBattleTricks13",
    },

    "731": {
        targetEnemy: "Typhon",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 1.3);
            enemy.currentHp -= enemy.currentHp * 0.3;
        },
        tidbit: "Typhon recognizes a fellow monster of the deep, and switches to a more aggressive stance.<br><br>[Increases attack by 30% but reduces current HP by 30%]",    
        achievement: "greekGodBattleTricks14",
    },
    
    "607": {
        targetEnemy: "Nyx",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.75);
        },
        tidbit: "The Sun's radiance pierces Nyx's eternal darkness, momentarily banishing the night and suppresses her nocturnal powers.<br><br>[Reduces attack by 25%]",
        achievement: "greekGodBattleTricks15",
    },

    "1018": {
        targetEnemy: "Papa Smurf",
        effect: (enemy) => {
            enemy.stunTurns += 5;
        },
        tidbit: "Papa Smurf is toast. A full size flamethrower will be too much even for Fireman Smurf to deal with. The entire village is in danger.<br><br>[Stunned for 5 turns]",
        achievement: "bossesBattleTricks",
    },

    "1026": {
        targetEnemy: "Dr Wily",
        effect: (enemy) => {
            enemy.currentHp -= enemy.currentHp * 0.5;
        },
        tidbit: "The weapon of his arch nemesis, Mega Man, unleashes a massive blast seriously injuring Dr. Wily.<br><br>[Reduces current HP by 50%]",
        achievement: "bossesBattleTricks2",
    },

    "809": {
        targetEnemy: "Cartman",
        effect: (enemy) => {
            enemy.stunTurns += 3;
        },
        tidbit: "Cartman is momentarily stunned by the sight of a banana. He tries to reach for it, but realizes it's just a card.<br><br>[Stunned for 3 turns]",
        achievement: "bossesBattleTricks3",
    },

    "1020": {
        targetEnemy: "Darth Vader",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.6);
        },
        tidbit: "A lightsaber is crucial for defending against Darth Vader's attacks.<br><br>[Reduces attack by 40%]",
        achievement: "bossesBattleTricks4",
    },

    "523": {
        targetEnemy: "Sauron",
        effect: (enemy) => {
            enemy.currentHp -= enemy.currentHp * 0.3;
        },
        tidbit: "Eye vs Eye. The Eye of Ra pierces the very fabric of Sauron's power, considerably weakening him.<br><br>[Reduces current HP by 30%]",
        achievement: "bossesBattleTricks5",
    },

    "1033": {
        targetEnemy: "Aizen",
        effect: (enemy) => {
            enemy.stunTurns += 10;
        },
        tidbit: "Ichigo's powerful weapon stuns Aizen, paralyzing his movements for a long time.<br><br>[Stunned for 10 turns]",
        achievement: "bossesBattleTricks6",
    },

    "1035": {
        targetEnemy: "Thanos",
        effect: (enemy) => {
            enemy.currentHp -= enemy.currentHp * 0.25;
            enemy.stunTurns += 5;
        },
        tidbit: "Thanos is perplexed by the existence of another Infinity Gauntlet. His very existence is threatened.<br><br>[Reduces current HP by 25% and Stunned for 5 turns]",
        achievement: "bossesBattleTricks7",
    },

    "425": {
        targetEnemy: "Arceus",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.9);
            enemy.stunTurns += 2;
        },
        tidbit: "Arceus sees Articuno - one of the legendary trio her created. His power is slightly diminished as he momentarily forgets about you.<br><br>[Reduces attack by 10% and Stunned for 2 turns]",
        achievement: "bossesBattleTricks8",
    },

    "426": {
        targetEnemy: "Arceus",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.9);
            enemy.stunTurns += 2;
        },
        tidbit: "Arceus sees Zapdos - one of the legendary trio her created. His power is slightly diminished as he momentarily forgets about you.<br><br>[Reduces attack by 10% and Stunned for 2 turns]",
        achievement: "bossesBattleTricks9",
    },

    "427": {
        targetEnemy: "Arceus",
        effect: (enemy) => {
            enemy.attack = Math.floor(enemy.attack * 0.9);
            enemy.stunTurns += 2;
        },
        tidbit: "Arceus sees Moltres - one of the legendary trio her created. His power is slightly diminished as he momentarily forgets about you.<br><br>[Reduces attack by 10% and Stunned for 2 turns]",
        achievement: "bossesBattleTricks10",
    },

    "1029": {
        targetEnemy: "Rick",
        effect: (enemy) => {
            enemy.stunTurns += 8;
        },
        tidbit: "For the first time in his life, Rick is at a loss for words. How did you get a Portal Gun?<br><br>[Stunned for 8 turns]",
        achievement: "bossesBattleTricks11",
    },

    "1036": {
        targetEnemy: "Chuck Norris",
        effect: (enemy) => {
            enemy.currentHp *= 2;
        },
        tidbit: "You quickly write the obvious name Chuck Norris in the Death Note. In classic Chuck Norris fashion, this only stengthens him.<br><br>[Doubles current HP]",
        achievement: "bossesBattleTricks12",
    },

    "851": {
        targetEnemy: "Kuzzi",
        effect: (enemy) => {
            enemy.stunTurns += 3;
        },
        tidbit: "You use his favorite game against him. Dirty! Kuzzi does not want to hurt Degens Idle.<br><br>[Stunned for 3 turns]",
        achievement: "bossesBattleTricks13",
    },


};

// Function to display a tidbit
function showTidbit(text, duration = 8000) {
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
    }, duration);
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