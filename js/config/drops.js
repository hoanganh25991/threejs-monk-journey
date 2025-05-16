/**
 * Item drop configuration
 * Contains drop chances and loot-related settings
 */

// Drop chances for different enemy types
export const DROP_CHANCES = {
    bossDropChance: 1.0,    // 100% drop chance for bosses
    normalDropChance: 0.001   // 1% drop chance for regular enemies
};

// Item quality distribution
export const ITEM_QUALITY_CHANCES = {
    common: 0.6,      // 60% chance for common items
    magic: 0.25,      // 25% chance for magic items
    rare: 0.1,        // 10% chance for rare items
    legendary: 0.05   // 5% chance for legendary items
};

// Item type distribution
export const ITEM_TYPE_CHANCES = {
    weapon: 0.3,
    armor: 0.3,
    accessory: 0.2,
    consumable: 0.2
};

// Regular enemy drop table
export const REGULAR_DROP_TABLE = [
    { name: 'Health Potion', amount: 1, weight: 40 },
    { name: 'Mana Potion', amount: 1, weight: 30 },
    { name: 'Gold Coin', amount: Math.floor(5 + Math.random() * 20), weight: 20 },
    { name: 'Common Weapon', type: 'weapon', damage: 5 + Math.floor(Math.random() * 5), damageReduction: 0, amount: 1, weight: 5 },
    { name: 'Common Armor', type: 'armor', damage: 0, damageReduction: 0.05 + Math.random() * 0.05, amount: 1, weight: 5 }
];

// Boss drop table
export const BOSS_DROP_TABLE = [
    { name: 'Greater Health Potion', amount: 2, weight: 20 },
    { name: 'Greater Mana Potion', amount: 2, weight: 15 },
    { name: 'Gold Pile', amount: Math.floor(50 + Math.random() * 100), weight: 20 },
    { name: 'Rare Weapon', type: 'weapon', damage: 15 + Math.floor(Math.random() * 10), damageReduction: 0, amount: 1, weight: 15 },
    { name: 'Rare Armor', type: 'armor', damage: 0, damageReduction: 0.1 + Math.random() * 0.1, amount: 1, weight: 15 },
    { name: 'Rare Helmet', type: 'helmet', damage: 2 + Math.floor(Math.random() * 3), damageReduction: 0.05 + Math.random() * 0.05, amount: 1, weight: 10 },
    { name: 'Rare Boots', type: 'boots', damage: 0, damageReduction: 0.05 + Math.random() * 0.05, amount: 1, weight: 5 }
];
