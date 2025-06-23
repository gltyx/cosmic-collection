// battles.js
// — boss-specific mechanics (fill in the strings later) —
const bossMechanicsByName = {
  'Poseidon':           { 
                            specialPowers: 'Prevents Sea World Protection', 
                            killReward: '+0.1% Global Max Cards Mult' 
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
                            killReward: '+0.5% Global Max Cards Mult' 
                        },
  'Gaia':               { 
                            specialPowers: '5% Chance to Heal 1% of Max Health', 
                            killReward: '+0.5% Global HP Mult' 
                        },
  'Nyx':                { 
                            specialPowers: '3% Chance to scare a random card away (removes it)', 
                            killReward: '+2% Global HP Mult' 
                        },
  'Chaos':              { 
                            specialPowers: 'Attacks Twice', 
                            killReward: '+2% Global Attack Mult' 
                        },
  'Zeus':               { 
                            specialPowers: 'Attacks 3 times - targeting a random card', 
                            killReward: '+25% Global Max Cards Mult' 
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
                            specialPowers: '5% Chance to Heal 1% of Max Health', 
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
                            killReward: '+0.3% Global HP Mult' 
                        },
  'Genghis Khan':       { 
                            specialPowers: '25% chance to deal Triple damage',
                            killReward: '+0.5% Global Attack Mult' 
                        },
  'Dracula':            { 
                            specialPowers: '3x Lifesteal', 
                            killReward: '+0.5% Global HP Mult' 
                        },
  'Cartman':            { 
                            specialPowers: '10% to Fart each time he is hit - Deals 5% of Max Health to front 2 cards', 
                            killReward: '+1% to Global Max Cards Mult' 
                        },
  'Agent Smith':        { 
                            specialPowers: '75% Dodge Chance', 
                            killReward: '+1% Global HP Mult' 
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
                            killReward: '+2% Global HP Mult' 
                        },
  'Godzilla':           { 
                            specialPowers: 'Reflects 15% Damage to Attackers', 
                            killReward: '+2% to Global Max Cards Mult' 
                        },
  'Darth Vader':        { 
                            specialPowers: '98% Chance to only take 3% of damage', 
                            killReward: '+3% Global HP Mult' 
                        },
  'Shao Kahn':          { 
                            specialPowers: '40% chance to also attack the last card', 
                            killReward: '+3% Global Attack Mult' 
                        },
  'Hal9000':            { 
                            specialPowers: 'Each card takes 50% damage of the one in front of it', 
                            killReward: '+3% to Global Max Cards Mult' 
                        },
  'Sauron':             { 
                            specialPowers: '10% Chance to Instantly Kill', 
                            killReward: '+5% Global HP Mult' 
                        },
  'Pudge':              { 
                            specialPowers: '25% chance to pull the last card to the front and deal 50% of its Current Health as damage', 
                            killReward: '+5% to Global Max Cards Mult' 
                        },
  'Doctor Manhattan':   { 
                            specialPowers: 'Drains 40% of a random resource on each attack. 2x Lifesteal.', 
                            killReward: '+6% to Global Max Cards Mult' 
                        },
  'Aizen':              { 
                            specialPowers: '50% chance for Extra Attack (can proc multiple times)', 
                            killReward: '+8% Global Attack Mult' 
                        },
  'Thanos':             { 
                            specialPowers: '4% chance to kill half the cards (rounded up)', 
                            killReward: '+8% to Global Max Cards Mult' 
                        },
  'Isshin':             { 
                            specialPowers: 'Attacks 3 Times (2nd and 3rd attacks hit random targets)', 
                            killReward: '+10% Global Attack Mult' 
                        },
  'Deadpool':           { 
                            specialPowers: '69% chance to revive to full health instead of dying', 
                            killReward: '+10% Global HP Mult' 
                        },
  'Kratos':             { 
                            specialPowers: 'Increase Damage by 4% on each attack', 
                            killReward: '+10% Global Attack Mult' 
                        },
  'Arceus':             { 
                            specialPowers: '5% chance to confuse each attacking card and have them attack a random ally instead', 
                            killReward: '+10% Global HP Mult' 
                        },
  'Rick':               { 
                            specialPowers: '17% chance to teleport random card to another dimension (instantly kill)', 
                            killReward: '+10% to Global Max Cards Mult' 
                        },
  'Vegeta':             { 
                            specialPowers: '10% chance to evolve - doubling attack, max hp, and fully healing (max 5 evolutions)', 
                            killReward: '+15% Global Attack Mult' 
                        },
  'Chuck Norris':       { 
                            specialPowers: '20% Chance to Increase Attack by 10%', 
                            killReward: '+15% Global HP Mult' 
                        },
  'Kaguya':             { 
                            specialPowers: 'Only Takes Damage from the Front Card. 40% chance to also attack the last card.', 
                            killReward: '+50% Global Attack Mult' 
                        },
  'One Above All':      { 
                            specialPowers: 'Attacks all Cards', 
                            killReward: '+50% to Global Max Cards Mult' 
                        },
  'Saitama':            { 
                            specialPowers: 'Increases his Attack by 1%. Reduces Attack of all your cards by 10%. 1x Lifesteal.', 
                            killReward: '+50% Global HP Mult' 
                        },
  'Kuzzi':              { 
                            specialPowers: 'Uses AI to kill 1 random card after every turn', 
                            killReward: '+100% to Global Max Cards Mult' 
                        },
  'Your Ego':           { 
                            specialPowers: '50% chance to dodge all attacks. 50% chance to deal 5x damage. 50% chance to drain 100% of a random resource. 3x Lifesteal.', 
                            killReward: '+500% to Global Max Cards Mult' 
                        },
};
