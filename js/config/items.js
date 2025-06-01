/**
 * Item Templates Configuration
 * Contains templates for generating different types of items
 */

import { ItemTypes } from './item-types.js';

/**
 * @type {Array<import('./item-types.js').ItemTemplate>}
 */
export const ITEM_TEMPLATES = [
    // ==================== WEAPONS ====================
    
    // Fist Weapons
    {
        id: "basicFist",
        name: "Monk's Fist",
        type: "weapon",
        subType: "fist",
        description: "A simple training weapon for monks.",
        icon: "👊",
        baseStats: {
            damage: 10,
            attackSpeed: 1.2
        },
    },
    {
        id: "tigerClaw",
        name: "Tiger Claw",
        type: "weapon",
        subType: "fist",
        description: "Sharp claws that tear through enemies.",
        icon: "🐯",
        baseStats: {
            damage: 12,
            attackSpeed: 1.3
        },
    },
    {
        id: "dragonFist",
        name: "Dragon Fist",
        type: "weapon",
        subType: "fist",
        description: "Legendary weapon said to contain the power of dragons.",
        icon: "🐉",
        baseStats: {
            damage: 15,
            attackSpeed: 1.1
        },
    },
    
    // Staves
    {
        id: "basicStaff",
        name: "Wooden Staff",
        type: "weapon",
        subType: "staff",
        description: "A simple wooden staff for training.",
        icon: "🥢",
        baseStats: {
            damage: 8,
            attackSpeed: 0.9,
            skillDamage: 10
        },
    },
    {
        id: "stormStaff",
        name: "Storm Staff",
        type: "weapon",
        subType: "staff",
        description: "A staff crackling with lightning energy.",
        icon: "⚡",
        baseStats: {
            damage: 9,
            attackSpeed: 0.8,
            skillDamage: 15
        },
    },
    
    // Daggers
    {
        id: "basicDagger",
        name: "Ceremonial Dagger",
        type: "weapon",
        subType: "dagger",
        description: "A ceremonial dagger used in ancient rituals.",
        icon: "🗡️",
        baseStats: {
            damage: 7,
            attackSpeed: 1.5
        },
    },
    
    // ==================== ARMOR ====================
    
    // Robes
    {
        id: "basicRobe",
        name: "Monk's Robe",
        type: "armor",
        subType: "robe",
        description: "Simple cloth robes worn by monks.",
        icon: "👘",
        baseStats: {
            defense: 5,
            movementSpeed: 5
        },
    },
    {
        id: "silkRobe",
        name: "Silk Robe",
        type: "armor",
        subType: "robe",
        description: "Finely woven silk robes that enhance mobility.",
        icon: "🧵",
        baseStats: {
            defense: 7,
            movementSpeed: 8
        },
    },
    
    // Helmets
    {
        id: "basicHelmet",
        name: "Monk's Headband",
        type: "armor",
        subType: "helmet",
        description: "A simple cloth headband worn by monks.",
        icon: "👑",
        baseStats: {
            defense: 3,
            wisdom: 2
        },
    },
    {
        id: "meditationCrown",
        name: "Meditation Crown",
        type: "armor",
        subType: "helmet",
        description: "A special crown that enhances focus and spiritual awareness.",
        icon: "👑",
        baseStats: {
            defense: 4,
            wisdom: 5,
            manaRegen: 2
        },
    },
    {
        id: "enlightenedHood",
        name: "Enlightened Hood",
        type: "armor",
        subType: "helmet",
        description: "A mystical hood worn by those who have achieved spiritual enlightenment.",
        icon: "🧠",
        baseStats: {
            defense: 5,
            wisdom: 8,
            skillDamage: 5
        },
    },
    
    // Gloves
    {
        id: "basicGloves",
        name: "Training Wraps",
        type: "armor",
        subType: "gloves",
        description: "Cloth wraps to protect the hands during training.",
        icon: "🧤",
        baseStats: {
            defense: 2,
            attackSpeed: 3
        },
    },
    {
        id: "ironGloves",
        name: "Iron Knuckle Gloves",
        type: "armor",
        subType: "gloves",
        description: "Reinforced gloves with iron plates over the knuckles.",
        icon: "🥊",
        baseStats: {
            defense: 4,
            attackSpeed: 2,
            damage: 5
        },
    },
    {
        id: "dragonClawGloves",
        name: "Dragon Claw Gloves",
        type: "armor",
        subType: "gloves",
        description: "Mystical gloves that transform the wearer's strikes to resemble dragon claws.",
        icon: "🐲",
        baseStats: {
            defense: 5,
            attackSpeed: 4,
            damage: 8,
            elementalDamage: 5
        },
    },
    
    // Belts
    {
        id: "basicBelt",
        name: "Monk's Sash",
        type: "armor",
        subType: "belt",
        description: "A simple cloth sash worn around the waist.",
        icon: "➰",
        baseStats: {
            defense: 2,
            resourceMax: 5
        },
    },
    
    // Boots
    {
        id: "basicBoots",
        name: "Monk's Sandals",
        type: "armor",
        subType: "boots",
        description: "Simple sandals that allow for quick movement.",
        icon: "👟",
        baseStats: {
            defense: 2,
            movementSpeed: 5
        },
    },
    {
        id: "swiftBoots",
        name: "Swift Traveler Boots",
        type: "armor",
        subType: "boots",
        description: "Lightweight boots designed for long journeys and quick movements.",
        icon: "👢",
        baseStats: {
            defense: 3,
            movementSpeed: 8
        },
    },
    {
        id: "cloudwalkers",
        name: "Cloudwalkers",
        type: "armor",
        subType: "boots",
        description: "Mystical boots that make the wearer feel as light as air.",
        icon: "☁️",
        baseStats: {
            defense: 4,
            movementSpeed: 10,
            jumpHeight: 5
        },
    },
    
    // Arms/Bracers
    {
        id: "basicBracers",
        name: "Training Bracers",
        type: "armor",
        subType: "arms",
        description: "Simple cloth bracers to protect the forearms during training.",
        icon: "🧶",
        baseStats: {
            defense: 3,
            attackSpeed: 2
        },
    },
    {
        id: "ironBracers",
        name: "Iron Bracers",
        type: "armor",
        subType: "arms",
        description: "Sturdy iron bracers that provide good protection in combat.",
        icon: "⚔️",
        baseStats: {
            defense: 5,
            attackPower: 3
        },
    },
    {
        id: "windBracers",
        name: "Wind Spirit Bracers",
        type: "armor",
        subType: "arms",
        description: "Enchanted bracers that channel the power of wind spirits.",
        icon: "🌪️",
        baseStats: {
            defense: 4,
            attackSpeed: 5,
            elementalDamage: 8
        },
    },
    
    // Shoulders
    {
        id: "basicShoulders",
        name: "Monk's Shoulder Pads",
        type: "armor",
        subType: "shoulders",
        description: "Simple padded cloth to protect the shoulders.",
        icon: "🧥",
        baseStats: {
            defense: 4,
            maxHealth: 10
        },
    },
    {
        id: "mountainShoulders",
        name: "Mountain Guardian Spaulders",
        type: "armor",
        subType: "shoulders",
        description: "Heavy spaulders that provide excellent protection.",
        icon: "🏔️",
        baseStats: {
            defense: 7,
            maxHealth: 15,
            allResistance: 3
        },
    },
    {
        id: "spiritShoulders",
        name: "Spirit Caller Mantle",
        type: "armor",
        subType: "shoulders",
        description: "A mystical mantle that enhances spiritual connection.",
        icon: "👻",
        baseStats: {
            defense: 5,
            manaBonus: 20,
            skillDamage: 8
        },
    },
    
    // Legs/Pants
    {
        id: "basicLegs",
        name: "Monk's Leggings",
        type: "armor",
        subType: "legs",
        description: "Simple cloth leggings that allow for fluid movement.",
        icon: "👖",
        baseStats: {
            defense: 4,
            movementSpeed: 3
        },
    },
    {
        id: "silkLegs",
        name: "Silk Leggings",
        type: "armor",
        subType: "legs",
        description: "Finely woven silk leggings that enhance mobility and comfort.",
        icon: "🧵",
        baseStats: {
            defense: 5,
            movementSpeed: 5,
            healthRegen: 2
        },
    },
    {
        id: "dragonLegs",
        name: "Dragon Scale Leggings",
        type: "armor",
        subType: "legs",
        description: "Leggings crafted from the scales of a dragon, offering superior protection.",
        icon: "🐉",
        baseStats: {
            defense: 8,
            movementSpeed: 2,
            allResistance: 5
        },
    },
    
    // ==================== ACCESSORIES ====================
    
    // Amulets
    {
        id: "manaAmulet",
        name: "Mana Crystal Amulet",
        type: "accessory",
        subType: "amulet",
        description: "A crystal amulet that significantly increases maximum mana.",
        icon: "🔮",
        baseStats: {
            manaBonus: 50
        },
    },
    {
        id: "basicAmulet",
        name: "Jade Pendant",
        type: "accessory",
        subType: "amulet",
        description: "A simple jade pendant that enhances spiritual energy.",
        icon: "📿",
        baseStats: {
            manaBonus: 10,
        },
    },
    {
        id: "enlightenedAmulet",
        name: "Enlightened Pendant",
        type: "accessory",
        subType: "amulet",
        description: "An ancient pendant worn by enlightened monks.",
        icon: "🔮",
        baseStats: {
            manaBonus: 15,
        },
    },
    
    // Rings
    {
        id: "basicRing",
        name: "Iron Band",
        type: "accessory",
        subType: "ring",
        description: "A simple iron ring that enhances combat abilities.",
        icon: "💍",
        baseStats: {
            critChance: 2,
            attackPower: 3
        },
    },
    {
        id: "elementalRing",
        name: "Elemental Band",
        type: "accessory",
        subType: "ring",
        description: "A ring infused with elemental energy.",
        icon: "🌀",
        baseStats: {
            elementalDamage: 10,
            attackPower: 5
        },
    },
    
    // Talismans
    {
        id: "basicTalisman",
        name: "Wooden Talisman",
        type: "accessory",
        subType: "talisman",
        description: "A wooden charm carved with ancient symbols.",
        icon: "🪵",
        baseStats: {
            allResistance: 5,
            healthRegen: 2
        },
    },
    
    // ==================== CONSUMABLES ====================
    
    // Potions
    {
        id: "minorHealthPotion",
        name: "Minor Health Potion",
        type: "consumable",
        subType: "potion",
        description: "Restores a small amount of health.",
        icon: "🧪",
        baseStats: {
            healthRestore: 50,
            effectType: "instant"
        },
        consumable: true
    },
    {
        id: "minorManaPotion",
        name: "Minor Spirit Potion",
        type: "consumable",
        subType: "potion",
        description: "Restores a small amount of spirit.",
        icon: "🧪",
        baseStats: {
            manaRestore: 30,
            effectType: "instant"
        },
        consumable: true
    },
    {
        id: "greaterManaPotion",
        name: "Greater Mana Potion",
        type: "consumable",
        subType: "potion",
        description: "Restores a significant amount of mana and temporarily increases mana regeneration.",
        icon: "🧪",
        baseStats: {
            manaRestore: 100,
            effectType: "buff",
            duration: 30,
            buffStats: {
                manaRegen: 5
            }
        },
        consumable: true
    },
    {
        id: "rejuvenationPotion",
        name: "Potion of Rejuvenation",
        type: "consumable",
        subType: "potion",
        description: "Restores health and mana over time.",
        icon: "🧪",
        baseStats: {
            healthRestore: 20,
            manaRestore: 20,
            effectType: "over_time",
            duration: 15,
            buffStats: {
                healthRegen: 5,
                manaRegen: 3
            }
        },
        consumable: true
    },
    {
        id: "elixirOfPower",
        name: "Elixir of Power",
        type: "consumable",
        subType: "potion",
        description: "Temporarily increases attack power and critical hit chance.",
        icon: "⚡",
        baseStats: {
            effectType: "buff",
            duration: 45,
            buffStats: {
                attackPower: 15,
                critChance: 10
            }
        },
        consumable: true
    },
    
    // Scrolls
    {
        id: "scrollOfStrength",
        name: "Scroll of Strength",
        type: "consumable",
        subType: "scroll",
        description: "Temporarily increases attack power.",
        icon: "📜",
        baseStats: {
            effectType: "buff",
            duration: 60,
            buffStats: {
                attackPower: 20
            }
        },
        consumable: true
    },
    {
        id: "scrollOfProtection",
        name: "Scroll of Protection",
        type: "consumable",
        subType: "scroll",
        description: "Temporarily increases defense and all resistances.",
        icon: "📜",
        baseStats: {
            effectType: "buff",
            duration: 60,
            buffStats: {
                defense: 15,
                allResistance: 10
            }
        },
        consumable: true
    },
    
    // Food
    {
        id: "riceBall",
        name: "Rice Ball",
        type: "consumable",
        subType: "food",
        description: "A simple rice ball that provides sustenance and temporarily increases maximum health.",
        icon: "🍙",
        baseStats: {
            healthRestore: 30,
            effectType: "buff",
            duration: 120,
            buffStats: {
                maxHealth: 50
            }
        },
        consumable: true
    },
    {
        id: "herbalTea",
        name: "Herbal Tea",
        type: "consumable",
        subType: "food",
        description: "A soothing tea that restores mana and increases wisdom temporarily.",
        icon: "🍵",
        baseStats: {
            manaRestore: 25,
            effectType: "buff",
            duration: 180,
            buffStats: {
                wisdom: 10
            }
        },
        consumable: true
    }
];

// Helper function to get item templates by type
export function getItemTemplatesByType(type, subType = null) {
    if (subType) {
        return ITEM_TEMPLATES.filter(template => template.type === type && template.subType === subType);
    }
    return ITEM_TEMPLATES.filter(template => template.type === type);
}

// Helper function to get a random item template
export function getRandomItemTemplate(options = {}) {
    let filteredTemplates = [...ITEM_TEMPLATES];
    
    // Filter by type if specified
    if (options.type) {
        filteredTemplates = filteredTemplates.filter(template => template.type === options.type);
    }
    
    // Filter by subType if specified
    if (options.subType) {
        filteredTemplates = filteredTemplates.filter(template => template.subType === options.subType);
    }
    
    // Return a random template from the filtered list
    if (filteredTemplates.length === 0) {
        console.warn('No item templates match the specified criteria');
        return ITEM_TEMPLATES[0];
    }
    
    return filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
}