/**
 * Enemy configuration file
 * Contains zone-based enemy spawning, enemy types, and boss types
 */

// Zone-based enemy spawning
export const zoneEnemies = {
    'forest': ['skeleton', 'zombie', 'shadow_beast'],
    'ruins': ['skeleton', 'skeleton_archer', 'necromancer'],
    'swamp': ['zombie', 'zombie_brute', 'shadow_beast'],
    'mountains': ['demon', 'demon_scout', 'infernal_golem'],
    'dark_sanctum': ['necromancer', 'shadow_beast', 'infernal_golem']
};

// Enemy types
export const enemyTypes = [
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
    }
];

// Boss types
export const bossTypes = [
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
    }
];