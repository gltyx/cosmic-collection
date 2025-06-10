// Achievement definitions and stats tracking
const achievements = {

    thrillOfDiscovery: {
        id: 'thrillOfDiscovery',
        name: 'Thrill of Discovery',
        type: 'thrillOfDiscovery',
        condition: 'Discover 5 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 5,
    },
    thrillOfDiscovery2: {
        id: 'thrillOfDiscovery2',
        name: 'Thrill of Discovery II',
        type: 'thrillOfDiscovery',
        condition: 'Discover 10 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        threshold: 10,
    },
    thrillOfDiscovery3: {
        id: 'thrillOfDiscovery3',
        name: 'Thrill of Discovery III',
        type: 'thrillOfDiscovery',
        condition: 'Discover 15 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 15,
    },
    thrillOfDiscovery4: {
        id: 'thrillOfDiscovery4',
        name: 'Thrill of Discovery IV',
        type: 'thrillOfDiscovery',
        condition: 'Discover 20 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 20,
    },
    thrillOfDiscovery5: {
        id: 'thrillOfDiscovery5',
        name: 'Thrill of Discovery V',
        type: 'thrillOfDiscovery',
        condition: 'Discover 25 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 25,
    },
    thrillOfDiscovery6: {
        id: 'thrillOfDiscovery6',
        name: 'Thrill of Discovery VI',
        type: 'thrillOfDiscovery',
        condition: 'Discover 50 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 50,
    },
    thrillOfDiscovery7: {
        id: 'thrillOfDiscovery7',
        name: 'Thrill of Discovery VII',
        type: 'thrillOfDiscovery',
        condition: 'Discover 100 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        threshold: 100,
    },
    thrillOfDiscovery8: {
        id: 'thrillOfDiscovery8',
        name: 'Thrill of Discovery VIII',
        type: 'thrillOfDiscovery',
        condition: 'Discover 150 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 150,
    },
    thrillOfDiscovery9: {
        id: 'thrillOfDiscovery9',
        name: 'Thrill of Discovery IX',
        type: 'thrillOfDiscovery',
        condition: 'Discover 200 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 200,
    },
    thrillOfDiscovery10: {
        id: 'thrillOfDiscovery10',
        name: 'Thrill of Discovery X',
        type: 'thrillOfDiscovery',
        condition: 'Discover 250 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.01,
        threshold: 250,
    },
    thrillOfDiscovery11: {
        id: 'thrillOfDiscovery11',
        name: 'Thrill of Discovery XI',
        type: 'thrillOfDiscovery',
        condition: 'Discover 300 cards',
        icon: '🔍',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        threshold: 300,
    },

    cosmicCollector: {
        id: 'cosmicCollector',
        name: 'Cosmic Collector',
        type: 'cosmicCollector',
        condition: 'Collect all Rocks cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        realm: 1,
    },
    cosmicCollector2: {
        id: 'cosmicCollector2',
        name: 'Cosmic Collector II',
        type: 'cosmicCollector',
        condition: 'Collect all Sea World cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        realm: 2,
    },
    cosmicCollector3: {
        id: 'cosmicCollector3',
        name: 'Cosmic Collector III',
        type: 'cosmicCollector',
        condition: 'Collect all Bugdom cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        realm: 3,
    },
    cosmicCollector4: {
        id: 'cosmicCollector4',
        name: 'Cosmic Collector IV',
        type: 'cosmicCollector',
        condition: 'Collect all Aviary cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        realm: 4,
    },
    cosmicCollector5: {
        id: 'cosmicCollector5',
        name: 'Cosmic Collector V',
        type: 'cosmicCollector',
        condition: 'Collect all Ancient Relics cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        realm: 5,
    },
    cosmicCollector6: {
        id: 'cosmicCollector6',
        name: 'Cosmic Collector VI',
        type: 'cosmicCollector',
        condition: 'Collect all Celestial Bodies cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.02,
        realm: 6,
    },
    cosmicCollector7: {
        id: 'cosmicCollector7',
        name: 'Cosmic Collector VII',
        type: 'cosmicCollector',
        condition: 'Collect all Mythical Beasts cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.03,
        realm: 7,
    },
    cosmicCollector8: {
        id: 'cosmicCollector8',
        name: 'Cosmic Collector VIII',
        type: 'cosmicCollector',
        condition: 'Collect all Incremental Games cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.04,
        realm: 8,
    },
    cosmicCollector9: {
        id: 'cosmicCollector9',
        name: 'Cosmic Collector IX',
        type: 'cosmicCollector',
        condition: 'Collect all Spirit Familiars cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.04,
        realm: 9,
    },
    cosmicCollector10: {
        id: 'cosmicCollector10',
        name: 'Cosmic Collector X',
        type: 'cosmicCollector',
        condition: 'Collect all Weapons cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.05,
        realm: 10,
    },
    cosmicCollector11: {
        id: 'cosmicCollector11',
        name: 'Cosmic Collector XI',
        type: 'cosmicCollector',
        condition: 'Collect all Greek Gods cards',
        icon: '🃏',
        rewardType: 'Max Cards Multiplier',
        reward: 1.1,
        realm: 11,
    },
    // cosmicCollector12: {
    //     id: 'cosmicCollector12',
    //     name: 'Cosmic Collector XII',
    //     type: 'cosmicCollector',
    //     condition: 'Collect all Boss cards',
    //     icon: '🃏',
    //     rewardType: 'Max Cards Multiplier',
    //     reward: 1.1,
    //     realm: 12,
    // },
    holePoker: {
        id: 'holePoker',
        name: 'Hole Poker',
        type: 'holePoker',
        condition: 'Poke the Black Hole 100 times',
        icon: '🕳️',
        rewardType: 'Min Cards Multiplier',
        reward: 1.01,
        threshold: 100,
    },
    holePoker2: {
        id: 'holePoker2',
        name: 'Hole Poker II',
        type: 'holePoker',
        condition: 'Poke the Black Hole 1K times',
        icon: '🕳️',
        rewardType: 'Min Cards Multiplier',
        reward: 1.02,
        threshold: 1000,
    },
    holePoker3: {
        id: 'holePoker3',
        name: 'Hole Poker III',
        type: 'holePoker',
        condition: 'Poke the Black Hole 10K times',
        icon: '🕳️',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        threshold: 10000,
    },
    holePoker4: {
        id: 'holePoker4',
        name: 'Hole Poker IV',
        type: 'holePoker',
        condition: 'Poke the Black Hole 100K times',
        icon: '🕳️',
        rewardType: 'Min Cards Multiplier',
        reward: 1.04,
        threshold: 100000,
    },
    holePoker5: {
        id: 'holePoker5',
        name: 'Hole Poker V',
        type: 'holePoker',
        condition: 'Poke the Black Hole 1M times',
        icon: '🕳️',
        rewardType: 'Min Cards Multiplier',
        reward: 1.05,
        threshold: 1000000,
    },
    merchantTrader: {
        id: 'merchantTrader',
        name: 'Merchant Trader',
        type: 'merchantTrader',
        condition: 'Purchase 10 offers from Merchants',
        icon: '🛒',
        rewardType: 'Merchant Price Divider',
        reward: 1.01,
        threshold: 10,
    },
    merchantTrader2: {
        id: 'merchantTrader2',
        name: 'Merchant Trader II',
        type: 'merchantTrader',
        condition: 'Purchase 100 offers from Merchants',
        icon: '🛒',
        rewardType: 'Merchant Price Divider',
        reward: 1.02,
        threshold: 100,
    },
    merchantTrader3: {
        id: 'merchantTrader3',
        name: 'Merchant Trader III',
        type: 'merchantTrader',
        condition: 'Purchase 1K offers from Merchants',
        icon: '🛒',
        rewardType: 'Merchant Price Divider',
        reward: 1.03,
        threshold: 1000,
    },
    merchantTrader4: {
        id: 'merchantTrader4',
        name: 'Merchant Trader IV',
        type: 'merchantTrader',
        condition: 'Purchase 10K offers from Merchants',
        icon: '🛒',
        rewardType: 'Merchant Price Divider',
        reward: 1.04,
        threshold: 10000,
    },
    merchantTrader5: {
        id: 'merchantTrader5',
        name: 'Merchant Trader V',
        type: 'merchantTrader',
        condition: 'Purchase 100K offers from Merchants',
        icon: '🛒',
        rewardType: 'Merchant Price Divider',
        reward: 1.05,
        threshold: 100000,
    },
    massivePoke: {
        id: 'massivePoke',
        name: 'Massive Poke',
        type: 'massivePoke',
        condition: 'Get 100 cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 1,
        threshold: 100,
    },
    massivePoke2: {
        id: 'massivePoke2',
        name: 'Massive Poke II',
        type: 'massivePoke',
        condition: 'Get 1K cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 5,
        threshold: 1000,
    },
    massivePoke3: {
        id: 'massivePoke3',
        name: 'Massive Poke III',
        type: 'massivePoke',
        condition: 'Get 10K cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 10,
        threshold: 10000,
    },
    massivePoke4: {
        id: 'massivePoke4',
        name: 'Massive Poke IV',
        type: 'massivePoke',
        condition: 'Get 100K cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 50,
        threshold: 100000,
    },
    massivePoke5: {
        id: 'massivePoke5',
        name: 'Massive Poke V',
        type: 'massivePoke',
        condition: 'Get 1M cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 100,
        threshold: 1000000,
    },
    massivePoke6: {
        id: 'massivePoke6',
        name: 'Massive Poke VI',
        type: 'massivePoke',
        condition: 'Get 10M cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 1000,
        threshold: 10000000,
    },
    massivePoke7: {
        id: 'massivePoke7',
        name: 'Massive Poke VII',
        type: 'massivePoke',
        condition: 'Get 100M cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 10000,
        threshold: 100000000,
    },
    massivePoke8: {
        id: 'massivePoke8',
        name: 'Massive Poke VIII',
        type: 'massivePoke',
        condition: 'Get 1B cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 100000,
        threshold: 1000000000,
    },
    massivePoke9: {
        id: 'massivePoke9',
        name: 'Massive Poke IX',
        type: 'massivePoke',
        condition: 'Get 10B cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 1000000,
        threshold: 10000000000,
    },
    massivePoke10: {
        id: 'massivePoke10',
        name: 'Massive Poke X',
        type: 'massivePoke',
        condition: 'Get 100B cards from a single poke',
        icon: '💥',
        rewardType: 'Min Cards Per Poke',
        reward: 10000000,
        threshold: 100000000000,
    },
    
    inItForTheLongHaul: {
        id: 'inItForTheLongHaul',
        name: 'In It For The Long Haul',
        type: 'inItForTheLongHaul',
        condition: 'Total 10K cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 1,
        threshold: 10000,
    },
    inItForTheLongHaul2: {
        id: 'inItForTheLongHaul2',
        name: 'In It For The Long Haul II',
        type: 'inItForTheLongHaul',
        condition: 'Total 100K cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 5,
        threshold: 100000,
    },
    inItForTheLongHaul3: {
        id: 'inItForTheLongHaul3',
        name: 'In It For The Long Haul III',
        type: 'inItForTheLongHaul',
        condition: 'Total 1M cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 25,
        threshold: 1000000,
    },
    inItForTheLongHaul4: {
        id: 'inItForTheLongHaul4',
        name: 'In It For The Long Haul IV',
        type: 'inItForTheLongHaul',
        condition: 'Total 10M cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 125,
        threshold: 10000000,
    },
    inItForTheLongHaul5: {
        id: 'inItForTheLongHaul5',
        name: 'In It For The Long Haul V',
        type: 'inItForTheLongHaul',
        condition: 'Total 100M cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 600,
        threshold: 100000000,
    },
    inItForTheLongHaul6: {
        id: 'inItForTheLongHaul6',
        name: 'In It For The Long Haul VI',
        type: 'inItForTheLongHaul',
        condition: 'Total 1B cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 3000,
        threshold: 1000000000,
    },
    inItForTheLongHaul7: {
        id: 'inItForTheLongHaul7',
        name: 'In It For The Long Haul VII',
        type: 'inItForTheLongHaul',
        condition: 'Total 10B cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 15000,
        threshold: 10000000000,
    },
    inItForTheLongHaul8: {
        id: 'inItForTheLongHaul8',
        name: 'In It For The Long Haul VIII',
        type: 'inItForTheLongHaul',
        condition: 'Total 100B cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 7.5e4,
        threshold: 1e11,
    },
    inItForTheLongHaul9: {
        id: 'inItForTheLongHaul9',
        name: 'In It For The Long Haul IX',
        type: 'inItForTheLongHaul',
        condition: 'Total 1T cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 3e5,
        threshold: 1e12,
    },    
    inItForTheLongHaul10: {
        id: 'inItForTheLongHaul10',
        name: 'In It For The Long Haul X',
        type: 'inItForTheLongHaul',
        condition: 'Total 10T cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 1.5e6,
        threshold: 1e13,
    },
    inItForTheLongHaul11: {
        id: 'inItForTheLongHaul11',
        name: 'In It For The Long Haul XI',
        type: 'inItForTheLongHaul',
        condition: 'Total 100T cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 7.5e6,
        threshold: 1e14,
    },
    inItForTheLongHaul12: {
        id: 'inItForTheLongHaul12',
        name: 'In It For The Long Haul XII',
        type: 'inItForTheLongHaul',
        condition: 'Total 1Q cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 3e7,
        threshold: 1e15,
    },
    inItForTheLongHaul13: {
        id: 'inItForTheLongHaul13',
        name: 'In It For The Long Haul XIII',
        type: 'inItForTheLongHaul',
        condition: 'Total 10Q cards drawn from the Black Hole',
        icon: '⏳',
        rewardType: 'Max Cards Per Poke',
        reward: 1.5e8,
        threshold: 1e16,
    },
    secret: {
        id: 'secret',
        name: 'Secret',
        type: 'secret',
        condition: 'Number 69',
        icon: '🚨',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '3'
    },
    secret2: {
        id: 'secret2',
        name: 'Secret II',
        type: 'secret',
        condition: 'Find the Easter Egg',
        icon: '🥚',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '1'
    },
    secret3: {
        id: 'secret3',
        name: 'Secret III',
        type: 'secret',
        condition: 'Birds Fly Solo',
        icon: '🐦',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '4'
    },
    secret4: {
        id: 'secret4',
        name: 'Secret IV',
        type: 'secret',
        condition: '3 x 3',
        icon: `🧲`,
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '3'
    },
    secret7: {
        id: 'secret7',
        name: 'Secret V',
        type: 'secret',
        condition: 'No Skills Left?',
        icon: '🧠',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '1'
    },
    secret5: {
        id: 'secret5',
        name: 'Secret VI',
        type: 'secret',
        condition: 'Rams is not a Realm',
        icon: '🐏',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '9'
    },
    secret6: {
        id: 'secret6',
        name: 'Secret VII',
        type: 'secret',
        condition: 'There is no spoon',
        icon: '🥄',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '10'
    },
    secret8: {
        id: 'secret8',
        name: 'Secret VIII',
        type: 'secret',
        condition: 'Delete the game',
        icon: '💀',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '11'
    },
    secret9: {
        id: 'secret9',
        name: 'Secret IX',
        type: 'secret',
        condition: 'Big Flipper',
        icon: '🔄',
        rewardType: 'Min Cards Multiplier',
        reward: 1.03,
        reqRealm: '11'
    },
    greekGodBattleTricks: {
        id: 'greekGodBattleTricks',
        name: 'Greek God Battle Tricks',
        type: 'greekGodBattleTricks',
        condition: 'Mnemosyne',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks2: {
        id: 'greekGodBattleTricks2',
        name: 'Greek God Battle Tricks II',
        type: 'greekGodBattleTricks',
        condition: 'Prometheus',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks3: {
        id: 'greekGodBattleTricks3',
        name: 'Greek God Battle Tricks III',
        type: 'greekGodBattleTricks',
        condition: 'Atlas',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks4: {
        id: 'greekGodBattleTricks4',
        name: 'Greek God Battle Tricks IV',
        type: 'greekGodBattleTricks',
        condition: 'Hephaestus',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks5: {
        id: 'greekGodBattleTricks5',
        name: 'Greek God Battle Tricks V',
        type: 'greekGodBattleTricks',
        condition: 'Ares',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks6: {
        id: 'greekGodBattleTricks6',
        name: 'Greek God Battle Tricks VI',
        type: 'greekGodBattleTricks',
        condition: 'Apollo',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks7: {
        id: 'greekGodBattleTricks7',
        name: 'Greek God Battle Tricks VII',
        type: 'greekGodBattleTricks',
        condition: 'Hades',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks8: {
        id: 'greekGodBattleTricks8',
        name: 'Greek God Battle Tricks VIII',
        type: 'greekGodBattleTricks',
        condition: 'Poseidon',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks9: {
        id: 'greekGodBattleTricks9',
        name: 'Greek God Battle Tricks IX',
        type: 'greekGodBattleTricks',
        condition: 'Tartarus',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks10: {
        id: 'greekGodBattleTricks10',
        name: 'Greek God Battle Tricks X',
        type: 'greekGodBattleTricks',
        condition: 'Typhon',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,
    },
    greekGodBattleTricks11: {
        id: 'greekGodBattleTricks11',
        name: 'Greek God Battle Tricks XI',
        type: 'greekGodBattleTricks',
        condition: 'Nyx',
        icon: '⚔️',
        rewardType: 'Battle Crit Chance',
        reward: 0.01,  
    },
    tierFanatic: {
        id: 'tierFanatic',
        name: 'Tier Fanatic',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Junk cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.05,
        rarity: 'junk',
        threshold: 20,
    },
    tierFanatic2: {
        id: 'tierFanatic2',
        name: 'Tier Fanatic II',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Basic cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.1,
        rarity: 'basic',
        threshold: 20,
    },
    tierFanatic3: {
        id: 'tierFanatic3',
        name: 'Tier Fanatic III',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Decent cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.15,
        rarity: 'decent',
        threshold: 20,
    },
    tierFanatic4: {
        id: 'tierFanatic4',
        name: 'Tier Fanatic IV',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Fine cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.2,
        rarity: 'fine',
        threshold: 20,
    },
    tierFanatic5: {
        id: 'tierFanatic5',
        name: 'Tier Fanatic V',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Rare cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.25,
        rarity: 'rare',
        threshold: 20,
    },
    tierFanatic6: {
        id: 'tierFanatic6',
        name: 'Tier Fanatic VI',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Epic cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.3,
        rarity: 'epic',
        threshold: 20,
    },
    tierFanatic7: {
        id: 'tierFanatic7',
        name: 'Tier Fanatic VII',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 20 different Legend cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.35,
        rarity: 'legend',
        threshold: 20,
    },
    tierFanatic8: {
        id: 'tierFanatic8',
        name: 'Tier Fanatic VIII',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 10 different Mythic cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.4,
        rarity: 'mythic',
        threshold: 10,
    },
    tierFanatic9: {
        id: 'tierFanatic9',
        name: 'Tier Fanatic IX',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 10 different Exotic cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.45,
        rarity: 'exotic',
        threshold: 10,
    },
    tierFanatic10: {
        id: 'tierFanatic10',
        name: 'Tier Fanatic X',
        type: 'tierFanatic',
        condition: 'Reach Tier 20 for 5 different Divine cards',
        icon: '🏅',
        rewardType: 'Max Cards Multiplier',
        reward: 1.5,
        rarity: 'divine',
        threshold: 5,
    },
};

// add an achievementsMap for accessing achievements by ID
const achievementsMap = Object.fromEntries(Object.values(achievements).map(a => [a.id, a]));

// Check and potentially unlock achievements
function checkAchievements(type, param1, param2) {
    // Filter achievements by type first
    const relevantAchievements = Object.values(achievements).filter(a => a.type === type);

    const cardsDiscovered = cards.filter(c => c.quantity > 0).length;

    relevantAchievements.forEach(achievement => {
        // Skip if already unlocked
        if (state.achievementsUnlocked.has(achievement.id)) return;

        // Check based on achievement type
        let shouldUnlock = false;
        switch(type) {
            case 'thrillOfDiscovery':
                shouldUnlock = cardsDiscovered >= achievement.threshold;
                if (!shouldUnlock) {
                    return; // Stop checking further achievements of this type
                }
                break;

            case 'cosmicCollector':
                shouldUnlock = param1 === achievement.realm && cards.filter(c => c.realm === param1).every(c => c.quantity > 0);
                break;
            
            case 'holePoker':
                shouldUnlock = state.stats.totalPokes >= achievement.threshold;
                if (!shouldUnlock) {
                    return; // Stop checking further achievements of this type
                }
                break;
                
            case 'merchantTrader':
                shouldUnlock = state.stats.merchantPurchases >= achievement.threshold;
                if (!shouldUnlock) {
                    return; // Stop checking further achievements of this type
                }
                break;

            case 'massivePoke':
                shouldUnlock = param1 >= achievement.threshold;
                if (!shouldUnlock) {
                    return; // Stop checking further achievements of this type
                }
                break;

            case 'inItForTheLongHaul':
                shouldUnlock = state.stats.totalCardsDrawn >= achievement.threshold;
                if (!shouldUnlock) {
                    return; // Stop checking further achievements of this type
                }
                break;
                
            case 'tierFanatic':
                shouldUnlock = param1 === achievement.rarity && cards.filter(c => c.rarity === achievement.rarity && c.tier === 20).length >= achievement.threshold;
                break;
        }

        if (shouldUnlock) {
            unlockAchievement(achievement.id);
        }
    });
}

// Unlock an achievement and show notification
function unlockAchievement(achievementId, duringLoad = false) {

    if (duringLoad && !achievementsMap[achievementId]) {
        console.error(`Achievement ${achievementId} not found in achievementsMap`);
        state.achievementsUnlocked.delete(achievementId);
        return;
    }

    if (!state.achievementsUnlocked.has(achievementId) || duringLoad) {
        // Process rewards based on type
        switch(achievementsMap[achievementId].rewardType) {
            case 'Max Cards Multiplier':
                state.achievementRewards.maxCardsMultiplier *= achievementsMap[achievementId].reward;
                break;

            case 'Min Cards Multiplier':
                state.achievementRewards.minCardsMultiplier *= achievementsMap[achievementId].reward;
                break;

            case 'Merchant Price Divider':
                state.achievementRewards.merchantPriceDivider *= achievementsMap[achievementId].reward;
                break;

            case 'Min Cards Per Poke':
                state.achievementRewards.minCardsPerPoke += achievementsMap[achievementId].reward;
                break;

            case 'Max Cards Per Poke':
                state.achievementRewards.maxCardsPerPoke += achievementsMap[achievementId].reward;
                break;

            case 'Battle Crit Chance':
                state.battle.critChance += achievementsMap[achievementId].reward;
                break;
        }

        if (!duringLoad) {
            state.achievementsUnlocked.add(achievementId);
            showAchievementNotification(achievementsMap[achievementId]);
            saveState();
            renderAchievements();
        }
    }
}

// Show achievement unlock notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
            </div>
        </div>
    `;
    document.body.appendChild(notification);

    // Remove notification after animation
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Render achievements grid with progress
function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    const totalAchievements = Object.keys(achievements).length;
    const unlockedCount = state.achievementsUnlocked.size;
    
    // Group achievements by type and calculate multipliers
    const achievementsByType = Object.values(achievements).reduce((acc, achievement) => {
        if (!acc[achievement.type]) {
            if (achievement.rewardType === 'Min Cards Per Poke' || achievement.rewardType === 'Max Cards Per Poke' || achievement.rewardType === 'Battle Crit Chance') {
                // Initialize with adder for min cards per poke
                acc[achievement.type] = {
                    achievements: [],
                    adder: 0,
                };
            }
            else {
                // Initialize with multiplier for other types
                acc[achievement.type] = {
                    achievements: [],
                    multiplier: 1,
                };
            }
        }
        acc[achievement.type].achievements.push(achievement);
        // If achievement is unlocked, multiply the type's multiplier
        if (state.achievementsUnlocked.has(achievement.id)) {
            if (achievement.rewardType === 'Min Cards Per Poke' || achievement.rewardType === 'Max Cards Per Poke' || achievement.rewardType === 'Battle Crit Chance') {
                acc[achievement.type].adder += achievement.reward; // Add to min cards per poke
            }
            else {
                acc[achievement.type].multiplier *= achievement.reward; // Multiply for other types
            }
        }
        return acc;
    }, {});
    
    container.innerHTML = `
        <div class="achievements-header">
            <h2>Achievements (${unlockedCount}/${totalAchievements})</h2>
            <div class="achievements-progress">
                <div class="progress-bar" style="width: ${(unlockedCount/totalAchievements) * 100}%"></div>
            </div>
        </div>
        ${Object.entries(achievementsByType).map(([type, data]) => {
            const rewardType = data.achievements[0].rewardType; // Get reward type from first achievement in group
            return `
                <div class="achievement-section">
                    <h3 class="achievement-type-header">
                        ${type.replace(/([A-Z])/g, ' $1').trim().replace(/^./, c => c.toUpperCase())}
                        ${data.hasOwnProperty('multiplier') ? 
                            (data.multiplier !== 1 ? 
                                `<span class="achievement-type-multiplier">(${rewardType}: ×${data.multiplier.toFixed(3)})</span>` : 
                                `<span class="achievement-type-multiplier">(${rewardType})</span>`) :
                            (data.adder > 0 ? 
                                `<span class="achievement-type-multiplier">(${rewardType}: +${formatNumber(data.adder)})</span>` : 
                                `<span class="achievement-type-multiplier">(${rewardType})</span>`)}
                    </h3>
                    <div class="achievements-grid">
                        ${data.achievements.map(achievement => {
                            const isUnlocked = state.achievementsUnlocked.has(achievement.id);
                            return `
                                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                    <div class="achievement-icon${achievement.id === 'secret2' ? ' easter-egg' : ''}">${achievement.icon}</div>
                                    <div class="achievement-title">${achievement.name}</div>
                                    <div class="achievement-description">${achievement.condition}</div>
                                    ${(achievement.reqRealm && !isUnlocked) ? `<div class="achievement-description">(Req: Realm ${achievement.reqRealm})</div>` : ''}
                                    <div class="achievement-reward">
                                        <span class="reward-type">${achievement.rewardType}:</span>
                                        <span class="reward-value">${data.hasOwnProperty('multiplier') ? `×${achievement.reward.toFixed(2)}`: `+${formatNumber(achievement.reward)}`}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('')}
    `;

    // Add click handler for the Easter egg
    const easterEgg = container.querySelector('.easter-egg');
    if (easterEgg) {
        easterEgg.style.cursor = 'help';
        easterEgg.addEventListener('click', () => {
            unlockAchievement('secret2');
        });
    }
}
