/**
 * Enemy configuration file
 * Contains zone-based enemy spawning, enemy types, boss types, and difficulty settings
 */

// Zone difficulty multipliers
export const ZONE_DIFFICULTY_MULTIPLIERS = {
    'forest': 1.0,
    'ruins': 1.2,
    'swamp': 1.4,
    'mountains': 1.6,
    'dark_sanctum': 1.8,
    'hellfire_peaks': 2.0,
    'frozen_wastes': 2.2
};

// Zone-based enemy spawning
export const ZONE_ENEMIES = {
    'forest': ['skeleton', 'zombie', 'shadow_beast', 'forest_spider', 'corrupted_treant', 'feral_wolf'],
    'ruins': ['skeleton', 'skeleton_archer', 'necromancer', 'ancient_guardian', 'cursed_spirit', 'ruin_crawler'],
    'swamp': ['zombie', 'zombie_brute', 'shadow_beast', 'poison_toad', 'bog_lurker', 'swamp_witch'],
    'mountains': ['demon', 'demon_scout', 'infernal_golem', 'frost_elemental', 'mountain_troll', 'harpy'],
    'dark_sanctum': ['necromancer', 'shadow_beast', 'infernal_golem', 'void_wraith', 'blood_cultist', 'shadow_stalker'],
    'hellfire_peaks': ['fire_elemental', 'lava_golem', 'ash_demon', 'flame_imp', 'hellhound'],
    'frozen_wastes': ['frost_elemental', 'ice_golem', 'snow_troll', 'frozen_revenant', 'winter_wolf']
};

// Enemy types
export const ENEMY_TYPES = [
    // Original enemies
    {
        type: 'skeleton',
        name: 'Skeleton',
        health: 50,
        damage: 10,
        speed: 3,
        attackRange: 1.5,
        attackSpeed: 1.5,
        experienceValue: 20,
        color: 0xcccccc,
        behavior: 'aggressive',
        zone: 'ruins'
    },
    {
        type: 'skeleton_archer',
        name: 'Skeleton Archer',
        health: 40,
        damage: 15,
        speed: 2.5,
        attackRange: 8,
        attackSpeed: 2,
        experienceValue: 25,
        color: 0xddccbb,
        behavior: 'ranged',
        zone: 'ruins'
    },
    {
        type: 'zombie',
        name: 'Zombie',
        health: 80,
        damage: 15,
        speed: 2,
        attackRange: 1.2,
        attackSpeed: 1,
        experienceValue: 30,
        color: 0x88aa88,
        behavior: 'slow',
        zone: 'swamp'
    },
    {
        type: 'zombie_brute',
        name: 'Zombie Brute',
        health: 120,
        damage: 25,
        speed: 1.5,
        attackRange: 1.8,
        attackSpeed: 0.8,
        experienceValue: 45,
        color: 0x668866,
        behavior: 'tank',
        zone: 'swamp'
    },
    {
        type: 'demon',
        name: 'Demon',
        health: 100,
        damage: 20,
        speed: 4,
        attackRange: 1.8,
        attackSpeed: 2,
        experienceValue: 50,
        color: 0xaa3333,
        behavior: 'aggressive',
        zone: 'mountains'
    },
    {
        type: 'demon_scout',
        name: 'Demon Scout',
        health: 70,
        damage: 15,
        speed: 5,
        attackRange: 1.5,
        attackSpeed: 2.5,
        experienceValue: 40,
        color: 0xcc5555,
        behavior: 'flanker',
        zone: 'mountains'
    },
    {
        type: 'necromancer',
        name: 'Necromancer',
        health: 80,
        damage: 18,
        speed: 2.5,
        attackRange: 6,
        attackSpeed: 1.8,
        experienceValue: 45,
        color: 0x330033,
        behavior: 'caster',
        zone: 'ruins'
    },
    {
        type: 'shadow_beast',
        name: 'Shadow Beast',
        health: 90,
        damage: 22,
        speed: 3.5,
        attackRange: 1.5,
        attackSpeed: 2.2,
        experienceValue: 55,
        color: 0x000000,
        behavior: 'ambusher',
        zone: 'forest'
    },
    {
        type: 'infernal_golem',
        name: 'Infernal Golem',
        health: 150,
        damage: 30,
        speed: 1.8,
        attackRange: 2.0,
        attackSpeed: 1.0,
        experienceValue: 70,
        color: 0x333333,
        behavior: 'tank',
        zone: 'mountains'
    },
    
    // Forest enemies
    {
        type: 'forest_spider',
        name: 'Forest Spider',
        health: 60,
        damage: 12,
        speed: 4.5,
        attackRange: 1.2,
        attackSpeed: 2.0,
        experienceValue: 25,
        color: 0x553300,
        behavior: 'ambusher',
        zone: 'forest',
        abilities: ['web_trap', 'poison_bite']
    },
    {
        type: 'corrupted_treant',
        name: 'Corrupted Treant',
        health: 140,
        damage: 18,
        speed: 1.5,
        attackRange: 2.5,
        attackSpeed: 0.8,
        experienceValue: 40,
        color: 0x336633,
        behavior: 'tank',
        zone: 'forest',
        abilities: ['root_grasp', 'thorn_spray']
    },
    {
        type: 'feral_wolf',
        name: 'Feral Wolf',
        health: 70,
        damage: 14,
        speed: 5.0,
        attackRange: 1.3,
        attackSpeed: 2.2,
        experienceValue: 30,
        color: 0x777777,
        behavior: 'pack',
        zone: 'forest',
        abilities: ['howl', 'pounce']
    },
    
    // Ruins enemies
    {
        type: 'ancient_guardian',
        name: 'Ancient Guardian',
        health: 160,
        damage: 22,
        speed: 1.8,
        attackRange: 2.0,
        attackSpeed: 1.0,
        experienceValue: 60,
        color: 0x888866,
        behavior: 'defensive',
        zone: 'ruins',
        abilities: ['stone_throw', 'ground_pound']
    },
    {
        type: 'cursed_spirit',
        name: 'Cursed Spirit',
        health: 65,
        damage: 16,
        speed: 3.0,
        attackRange: 4.0,
        attackSpeed: 1.5,
        experienceValue: 35,
        color: 0xaaaaff,
        behavior: 'caster',
        zone: 'ruins',
        abilities: ['spirit_drain', 'haunt']
    },
    {
        type: 'ruin_crawler',
        name: 'Ruin Crawler',
        health: 85,
        damage: 14,
        speed: 3.2,
        attackRange: 1.0,
        attackSpeed: 1.8,
        experienceValue: 30,
        color: 0x996633,
        behavior: 'swarm',
        zone: 'ruins',
        abilities: ['burrow', 'surprise_attack']
    },
    
    // Swamp enemies
    {
        type: 'poison_toad',
        name: 'Poison Toad',
        health: 75,
        damage: 12,
        speed: 2.5,
        attackRange: 5.0,
        attackSpeed: 1.2,
        experienceValue: 35,
        color: 0x66aa66,
        behavior: 'ranged',
        zone: 'swamp',
        abilities: ['poison_spit', 'toxic_cloud']
    },
    {
        type: 'bog_lurker',
        name: 'Bog Lurker',
        health: 110,
        damage: 20,
        speed: 1.8,
        attackRange: 2.2,
        attackSpeed: 1.0,
        experienceValue: 45,
        color: 0x445544,
        behavior: 'ambusher',
        zone: 'swamp',
        abilities: ['swamp_grab', 'mud_throw']
    },
    {
        type: 'swamp_witch',
        name: 'Swamp Witch',
        health: 70,
        damage: 18,
        speed: 2.2,
        attackRange: 7.0,
        attackSpeed: 1.5,
        experienceValue: 50,
        color: 0x559955,
        behavior: 'caster',
        zone: 'swamp',
        abilities: ['hex', 'summon_toad']
    },
    
    // Mountains enemies
    {
        type: 'frost_elemental',
        name: 'Frost Elemental',
        health: 90,
        damage: 22,
        speed: 2.5,
        attackRange: 5.0,
        attackSpeed: 1.5,
        experienceValue: 45,
        color: 0x88ccff,
        behavior: 'caster',
        zone: 'mountains',
        abilities: ['ice_shard', 'frost_armor']
    },
    {
        type: 'mountain_troll',
        name: 'Mountain Troll',
        health: 180,
        damage: 28,
        speed: 1.5,
        attackRange: 2.5,
        attackSpeed: 0.8,
        experienceValue: 65,
        color: 0x778877,
        behavior: 'tank',
        zone: 'mountains',
        abilities: ['boulder_throw', 'regeneration']
    },
    {
        type: 'harpy',
        name: 'Harpy',
        health: 75,
        damage: 16,
        speed: 4.5,
        attackRange: 1.5,
        attackSpeed: 2.0,
        experienceValue: 40,
        color: 0xddbb88,
        behavior: 'flanker',
        zone: 'mountains',
        abilities: ['dive_attack', 'screech']
    },
    
    // Dark Sanctum enemies
    {
        type: 'void_wraith',
        name: 'Void Wraith',
        health: 85,
        damage: 24,
        speed: 3.0,
        attackRange: 3.0,
        attackSpeed: 1.8,
        experienceValue: 55,
        color: 0x440088,
        behavior: 'caster',
        zone: 'dark_sanctum',
        abilities: ['void_bolt', 'phase_shift']
    },
    {
        type: 'blood_cultist',
        name: 'Blood Cultist',
        health: 70,
        damage: 18,
        speed: 2.8,
        attackRange: 1.8,
        attackSpeed: 1.6,
        experienceValue: 45,
        color: 0x880000,
        behavior: 'aggressive',
        zone: 'dark_sanctum',
        abilities: ['blood_ritual', 'life_drain']
    },
    {
        type: 'shadow_stalker',
        name: 'Shadow Stalker',
        health: 95,
        damage: 26,
        speed: 3.8,
        attackRange: 1.5,
        attackSpeed: 2.2,
        experienceValue: 60,
        color: 0x222222,
        behavior: 'ambusher',
        zone: 'dark_sanctum',
        abilities: ['shadow_step', 'darkness_cloud']
    },
    
    // Hellfire Peaks enemies
    {
        type: 'fire_elemental',
        name: 'Fire Elemental',
        health: 100,
        damage: 25,
        speed: 2.8,
        attackRange: 4.5,
        attackSpeed: 1.6,
        experienceValue: 50,
        color: 0xff6600,
        behavior: 'caster',
        zone: 'hellfire_peaks',
        abilities: ['fireball', 'flame_wave']
    },
    {
        type: 'lava_golem',
        name: 'Lava Golem',
        health: 190,
        damage: 30,
        speed: 1.5,
        attackRange: 2.2,
        attackSpeed: 0.9,
        experienceValue: 70,
        color: 0xcc3300,
        behavior: 'tank',
        zone: 'hellfire_peaks',
        abilities: ['magma_slam', 'heat_aura']
    },
    {
        type: 'ash_demon',
        name: 'Ash Demon',
        health: 120,
        damage: 22,
        speed: 3.2,
        attackRange: 2.0,
        attackSpeed: 1.8,
        experienceValue: 55,
        color: 0x666666,
        behavior: 'aggressive',
        zone: 'hellfire_peaks',
        abilities: ['ash_cloud', 'burning_touch']
    },
    {
        type: 'flame_imp',
        name: 'Flame Imp',
        health: 60,
        damage: 15,
        speed: 4.5,
        attackRange: 1.2,
        attackSpeed: 2.5,
        experienceValue: 30,
        color: 0xff9900,
        behavior: 'swarm',
        zone: 'hellfire_peaks',
        abilities: ['fire_dart', 'self_destruct']
    },
    {
        type: 'hellhound',
        name: 'Hellhound',
        health: 85,
        damage: 20,
        speed: 4.8,
        attackRange: 1.5,
        attackSpeed: 2.2,
        experienceValue: 45,
        color: 0x993300,
        behavior: 'pack',
        zone: 'hellfire_peaks',
        abilities: ['fire_breath', 'pounce']
    },
    
    // Frozen Wastes enemies
    {
        type: 'ice_golem',
        name: 'Ice Golem',
        health: 170,
        damage: 26,
        speed: 1.6,
        attackRange: 2.2,
        attackSpeed: 0.9,
        experienceValue: 65,
        color: 0xaaddff,
        behavior: 'tank',
        zone: 'frozen_wastes',
        abilities: ['ice_slam', 'frost_armor']
    },
    {
        type: 'snow_troll',
        name: 'Snow Troll',
        health: 150,
        damage: 24,
        speed: 2.0,
        attackRange: 2.0,
        attackSpeed: 1.0,
        experienceValue: 60,
        color: 0xddddee,
        behavior: 'aggressive',
        zone: 'frozen_wastes',
        abilities: ['snowball', 'frost_bite']
    },
    {
        type: 'frozen_revenant',
        name: 'Frozen Revenant',
        health: 90,
        damage: 22,
        speed: 2.5,
        attackRange: 1.8,
        attackSpeed: 1.5,
        experienceValue: 50,
        color: 0x8888ff,
        behavior: 'caster',
        zone: 'frozen_wastes',
        abilities: ['ice_lance', 'freezing_touch']
    },
    {
        type: 'winter_wolf',
        name: 'Winter Wolf',
        health: 80,
        damage: 18,
        speed: 4.5,
        attackRange: 1.5,
        attackSpeed: 2.0,
        experienceValue: 40,
        color: 0xeeeeff,
        behavior: 'pack',
        zone: 'frozen_wastes',
        abilities: ['frost_howl', 'snow_dash']
    }
];

// Boss types
export const BOSS_TYPES = [
    // Original bosses
    {
        type: 'skeleton_king',
        name: 'Skeleton King',
        health: 300,
        damage: 25,
        speed: 2.5,
        attackRange: 2,
        attackSpeed: 1.2,
        experienceValue: 200,
        color: 0xcccccc,
        scale: 2,
        isBoss: true,
        behavior: 'boss',
        zone: 'ruins',
        abilities: ['summon_minions', 'ground_slam']
    },
    {
        type: 'swamp_horror',
        name: 'Swamp Horror',
        health: 400,
        damage: 30,
        speed: 1.8,
        attackRange: 2.2,
        attackSpeed: 1,
        experienceValue: 250,
        color: 0x446644,
        scale: 2.2,
        isBoss: true,
        behavior: 'boss',
        zone: 'swamp',
        abilities: ['poison_cloud', 'tentacle_grab']
    },
    {
        type: 'demon_lord',
        name: 'Demon Lord',
        health: 500,
        damage: 35,
        speed: 3,
        attackRange: 2.5,
        attackSpeed: 1.5,
        experienceValue: 300,
        color: 0xaa3333,
        scale: 2.5,
        isBoss: true,
        behavior: 'boss',
        zone: 'mountains',
        abilities: ['fire_nova', 'teleport']
    },
    {
        type: 'frost_titan',
        name: 'Frost Titan',
        health: 600,
        damage: 40,
        speed: 2.0,
        attackRange: 3,
        attackSpeed: 1.0,
        experienceValue: 350,
        color: 0x88ccff,
        scale: 3,
        isBoss: true,
        behavior: 'boss',
        zone: 'mountains',
        abilities: ['ice_storm', 'frost_nova', 'ice_barrier']
    },
    {
        type: 'necromancer_lord',
        name: 'Necromancer Lord',
        health: 550,
        damage: 35,
        speed: 2.2,
        attackRange: 8,
        attackSpeed: 1.5,
        experienceValue: 320,
        color: 0x330033,
        scale: 2.2,
        isBoss: true,
        behavior: 'boss',
        zone: 'dark_sanctum',
        abilities: ['summon_undead', 'death_nova', 'life_drain']
    },
    
    // Forest bosses
    {
        type: 'ancient_treant',
        name: 'Ancient Treant',
        health: 450,
        damage: 30,
        speed: 1.5,
        attackRange: 3,
        attackSpeed: 0.8,
        experienceValue: 280,
        color: 0x225522,
        scale: 2.8,
        isBoss: true,
        behavior: 'boss',
        zone: 'forest',
        abilities: ['root_prison', 'nature_wrath', 'healing_sap']
    },
    {
        type: 'spider_queen',
        name: 'Spider Queen',
        health: 380,
        damage: 28,
        speed: 3.2,
        attackRange: 2.5,
        attackSpeed: 1.8,
        experienceValue: 260,
        color: 0x663300,
        scale: 2.3,
        isBoss: true,
        behavior: 'boss',
        zone: 'forest',
        abilities: ['web_prison', 'summon_spiderlings', 'venom_spray']
    },
    
    // Ruins bosses
    {
        type: 'ancient_construct',
        name: 'Ancient Construct',
        health: 520,
        damage: 38,
        speed: 1.8,
        attackRange: 2.5,
        attackSpeed: 1.0,
        experienceValue: 310,
        color: 0xbbaa88,
        scale: 2.6,
        isBoss: true,
        behavior: 'boss',
        zone: 'ruins',
        abilities: ['stone_barrage', 'earthquake', 'ancient_curse']
    },
    
    // Swamp bosses
    {
        type: 'plague_lord',
        name: 'Plague Lord',
        health: 480,
        damage: 32,
        speed: 2.0,
        attackRange: 4,
        attackSpeed: 1.2,
        experienceValue: 290,
        color: 0x557755,
        scale: 2.4,
        isBoss: true,
        behavior: 'boss',
        zone: 'swamp',
        abilities: ['plague_cloud', 'summon_flies', 'toxic_explosion']
    },
    
    // Dark Sanctum bosses
    {
        type: 'void_harbinger',
        name: 'Void Harbinger',
        health: 580,
        damage: 42,
        speed: 2.5,
        attackRange: 5,
        attackSpeed: 1.5,
        experienceValue: 340,
        color: 0x330066,
        scale: 2.7,
        isBoss: true,
        behavior: 'boss',
        zone: 'dark_sanctum',
        abilities: ['void_rift', 'shadow_tendrils', 'mind_shatter']
    },
    
    // Hellfire Peaks bosses
    {
        type: 'inferno_lord',
        name: 'Inferno Lord',
        health: 650,
        damage: 45,
        speed: 2.2,
        attackRange: 3.5,
        attackSpeed: 1.3,
        experienceValue: 380,
        color: 0xff3300,
        scale: 3.0,
        isBoss: true,
        behavior: 'boss',
        zone: 'hellfire_peaks',
        abilities: ['meteor_strike', 'flame_pillar', 'inferno_aura']
    },
    {
        type: 'molten_behemoth',
        name: 'Molten Behemoth',
        health: 700,
        damage: 48,
        speed: 1.5,
        attackRange: 2.8,
        attackSpeed: 0.9,
        experienceValue: 400,
        color: 0xcc5500,
        scale: 3.2,
        isBoss: true,
        behavior: 'boss',
        zone: 'hellfire_peaks',
        abilities: ['lava_wave', 'molten_smash', 'eruption']
    },
    
    // Frozen Wastes bosses
    {
        type: 'frost_monarch',
        name: 'Frost Monarch',
        health: 620,
        damage: 43,
        speed: 2.0,
        attackRange: 4.0,
        attackSpeed: 1.2,
        experienceValue: 370,
        color: 0x66ccff,
        scale: 2.8,
        isBoss: true,
        behavior: 'boss',
        zone: 'frozen_wastes',
        abilities: ['blizzard', 'ice_prison', 'freezing_touch']
    },
    {
        type: 'ancient_yeti',
        name: 'Ancient Yeti',
        health: 680,
        damage: 46,
        speed: 1.8,
        attackRange: 2.5,
        attackSpeed: 1.0,
        experienceValue: 390,
        color: 0xeeeeff,
        scale: 3.1,
        isBoss: true,
        behavior: 'boss',
        zone: 'frozen_wastes',
        abilities: ['avalanche', 'frost_breath', 'ice_shards']
    }
];