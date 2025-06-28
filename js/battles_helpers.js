// battles.js
// — boss-specific mechanics (fill in the strings later) —
function getBossMechanicsByName() {
  return {
  'Poseidon':           { 
                            specialPowers: 'Prevents Sea World Protection', 
                            killReward: skillMap[30002].purchased ? '+1% Global Max Cards Mult' : '+0.1% Global Max Cards Mult' 
                        },
  'Uranus':             { 
                            specialPowers: 'Cannot be Stunned', 
                            killReward: '+0.1% Global HP Mult' 
                        },
  'Tartarus':           { 
                            specialPowers: 'Cannot be Dodged', 
                            killReward: '+0.1% Global Attack Mult' 
                        },
  'Cronus':             { 
                            specialPowers: '50% chance to attack twice', 
                            killReward: '+0.5% Global Attack Mult' 
                        },
  'Typhon':             { 
                            specialPowers: '2.5% chance to absorb attack and heal for that amount instead', 
                            killReward: skillMap[30002].purchased ? '+5% Global Max Cards Mult' : '+0.5% Global Max Cards Mult' 
                        },
  'Gaia':               { 
                            specialPowers: '5% Chance to Heal 2% of Max Health', 
                            killReward: '+0.2% Global HP Mult' 
                        },
  'Nyx':                { 
                            specialPowers: '3% Chance to scare a random card away (removes it)', 
                            killReward: '+1% Global HP Mult' 
                        },
  'Chaos':              { 
                            specialPowers: 'Attacks Twice. Damage cannot be Absorbed.', 
                            killReward: '+2% Global Attack Mult' 
                        },
  'Zeus':               { 
                            specialPowers: 'Attacks 3 times - targeting random cards. Also cannot be stunned. ', 
                            killReward: skillMap[30002].purchased ? '+250% Global Max Cards Mult' : '+25% Global Max Cards Mult' 
                        },
  'Training Dummy':     { 
                            specialPowers: 'Heals 0.1% of Current Health', 
                            killReward: 'None' 
                        },
  'Lustre':             { 
                            specialPowers: 'None', 
                            killReward: 'None' 
                        },
  'Papa Smurf':         { 
                            specialPowers: '5% Chance to Heal 2% of Max Health', 
                            killReward: '+0.1% Global Attack Mult' 
                        },
  'Dr Wily':            { 
                            specialPowers: '25% dodge chance', 
                            killReward: '+0.1% Global HP Mult' 
                        },
  'Michael Scott':      { 
                            specialPowers: '50% chance to cause papercut - dealing additional 5% of Max Health damage', 
                            killReward: '+0.3% Global Attack Mult' 
                        },
  'Bowser':             { 
                            specialPowers: 'Reflects 10% Damage to Attackers', 
                            killReward: '+0.2% Global HP Mult' 
                        },
  'Genghis Khan':       { 
                            specialPowers: '25% chance to deal Triple damage',
                            killReward: '+0.5% Global Attack Mult' 
                        },
  'Dracula':            { 
                            specialPowers: '3x Lifesteal', 
                            killReward: '+0.3% Global HP Mult' 
                        },
  'Cartman':            { 
                            specialPowers: '10% to Fart each time he is hit - Deals 5% of Max Health to front 2 cards', 
                            killReward: skillMap[30002].purchased ? '+10% to Global Max Cards Mult' : '+1% to Global Max Cards Mult' 
                        },
  'Agent Smith':        { 
                            specialPowers: '75% Dodge Chance', 
                            killReward: '+0.5% Global HP Mult' 
                        },
  'Sephiroth':          { 
                            specialPowers: '33% Chance to Dodge all attacks/effects', 
                            killReward: '+1% Global Attack Mult' 
                        },
  'Galactus':           { 
                            specialPowers: 'Gains 50% Attack each time a card dies', 
                            killReward: '+2% Global Attack Mult' 
                        },
  'T800':               { 
                            specialPowers: '3% Chance to Heal for 10% of Max HP', 
                            killReward: '+1% Global HP Mult' 
                        },
  'Godzilla':           { 
                            specialPowers: 'Reflects 15% Damage to Attackers', 
                            killReward: skillMap[30002].purchased ? '+20% to Global Max Cards Mult' : '+2% to Global Max Cards Mult' 
                        },
  'Darth Vader':        { 
                            specialPowers: '98% Chance to only take 3% of damage', 
                            killReward: '+1.5% Global HP Mult' 
                        },
  'Shao Kahn':          { 
                            specialPowers: '40% chance to also attack the last card', 
                            killReward: '+3% Global Attack Mult' 
                        },
  'Hal9000':            { 
                            specialPowers: 'Each card takes 50% damage of the one in front of it', 
                            killReward: skillMap[30002].purchased ? '+30% to Global Max Cards Mult' : '+3% to Global Max Cards Mult' 
                        },
  'Sauron':             { 
                            specialPowers: '10% Chance to Instantly Kill', 
                            killReward: '+2% Global HP Mult' 
                        },
  'Pudge':              { 
                            specialPowers: '25% chance to pull the last card to the front and deal 50% of its Current Health as damage', 
                            killReward: skillMap[30002].purchased ? '+50% to Global Max Cards Mult' : '+5% to Global Max Cards Mult' 
                        },
  'Doctor Manhattan':   { 
                            specialPowers: 'Drains 40% of a random resource on each attack. 2x Lifesteal.', 
                            killReward: skillMap[30002].purchased ? '+60% to Global Max Cards Mult' : '+6% to Global Max Cards Mult'
                        },
  'Aizen':              { 
                            specialPowers: '50% chance for Extra Attack (can proc multiple times)', 
                            killReward: '+8% Global Attack Mult' 
                        },
  'Thanos':             { 
                            specialPowers: '4% chance to kill half the cards (rounded up)', 
                            killReward: skillMap[30002].purchased ? '+80% to Global Max Cards Mult' : '+8% to Global Max Cards Mult' 
                        },
  'Isshin':             { 
                            specialPowers: 'Attacks 3 Times (2nd and 3rd attacks hit random targets)', 
                            killReward: '+10% Global Attack Mult' 
                        },
  'Deadpool':           { 
                            specialPowers: '69% chance to revive to full health instead of dying', 
                            killReward: '+3% Global HP Mult' 
                        },
  'Kratos':             { 
                            specialPowers: 'Increase Damage by 4% on each attack', 
                            killReward: '+10% Global Attack Mult' 
                        },
  'Arceus':             { 
                            specialPowers: '5% chance to confuse each attacking card and have them attack a random ally instead', 
                            killReward: '+5% Global HP Mult' 
                        },
  'Rick':               { 
                            specialPowers: '17% chance to teleport random card to another dimension (instantly kill)', 
                            killReward: skillMap[30002].purchased ? '+100% to Global Max Cards Mult' : '+10% to Global Max Cards Mult' 
                        },
  'Vegeta':             { 
                            specialPowers: '9% chance to evolve - doubling attack, max hp, and fully healing (max 5 evolutions)', 
                            killReward: '+15% Global Attack Mult' 
                        },
  'Chuck Norris':       { 
                            specialPowers: '20% Chance to Increase Attack by 10%. Also cannot be Dodged.', 
                            killReward: '+5% Global HP Mult' 
                        },
  'Kaguya':             { 
                            specialPowers: 'Only Takes Damage from the Front Card. 40% chance to also attack the last card.', 
                            killReward: '+50% Global Attack Mult' 
                        },
  'One Above All':      { 
                            specialPowers: 'Attacks all Cards', 
                            killReward: skillMap[30002].purchased ? '+500% to Global Max Cards Mult' : '+50% to Global Max Cards Mult' 
                        },
  'Saitama':            { 
                            specialPowers: 'Increases his Attack by 1%. Reduces Attack of all your cards by 10%. 1x Lifesteal.', 
                            killReward: skillMap[30002].purchased ? '+500% to Global Max Cards Mult' : '+50% to Global Max Cards Mult' 
                        },
  'Kuzzi':              { 
                            specialPowers: '85% chance to use AI to kill 1 random card after every turn. Also cannot be Dismembered and has no Weak Point. Kills all cards on death.', 
                            killReward: skillMap[30002].purchased ? '+1000% to Global Max Cards Mult' : '+100% to Global Max Cards Mult' 
                        },
  'Your Ego':           { 
                            specialPowers: '50% chance to dodge all attacks. 50% chance to deal 5x damage. 50% chance to attack 2nd time, hitting a random target. 50% chance to drain 100% of a random resource. 3x Lifesteal. Has no Weak Point. Dismember is 75% less effective.', 
                            killReward: skillMap[30002].purchased ? '+5000% to Global Max Cards Mult' : '+500% to Global Max Cards Mult' 
                        },
  };
}


let bossMechanicsByName = getBossMechanicsByName();