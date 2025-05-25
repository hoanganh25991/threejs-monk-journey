# Implementation Guide: Item System and Difficulty Scaling

This guide provides specific code changes and implementation steps to enhance your game with the item system and difficulty scaling features outlined in the plan.

## 1. Item System Implementation

### Step 1: Update Item Data Structure

First, create a more robust item data structure in `js/entities/items/Item.js`:

```javascript
export class Item {
    constructor(config) {
        // Basic properties
        this.id = config.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.name = config.name || 'Unknown Item';
        this.description = config.description || '';
        this.type = config.type || 'misc'; // weapon, armor, accessory, consumable
        this.subType = config.subType || ''; // fist, staff, robe, amulet, etc.
        this.icon = config.icon || '📦';
        this.level = config.level || 1;
        this.rarity = config.rarity || 'common'; // common, uncommon, rare, epic, legendary, mythic
        
        // Base stats
        this.baseStats = config.baseStats || {};
        
        // Secondary stats
        this.secondaryStats = config.secondaryStats || [];
        
        // Special effects
        this.specialEffects = config.specialEffects || [];
        
        // Set information
        this.setId = config.setId || null;
        
        // Visual properties
        this.visual = config.visual || {
            model: null,
            texture: null,
            particles: null
        };
        
        // Calculate effective stats based on level and rarity
        this.calculateEffectiveStats();
    }
    
    calculateEffectiveStats() {
        // Rarity multipliers
        const rarityMultipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 2.5,
            mythic: 3.0
        };
        
        // Level scaling factor
        const levelScaling = 1 + (this.level * 0.05);
        
        // Apply scaling to base stats
        this.stats = {};
        for (const [key, value] of Object.entries(this.baseStats)) {
            this.stats[key] = Math.round(value * levelScaling * rarityMultipliers[this.rarity]);
        }
        
        // Process secondary stats
        this.processedSecondaryStats = this.secondaryStats.map(stat => {
            return {
                type: stat.type,
                value: Math.round(stat.value * levelScaling * rarityMultipliers[this.rarity]),
                element: stat.element || null
            };
        });
    }
    
    // Get a specific stat value
    getStat(statName) {
        if (this.stats[statName] !== undefined) {
            return this.stats[statName];
        }
        
        // Check secondary stats
        const secondaryStat = this.processedSecondaryStats.find(stat => stat.type === statName);
        if (secondaryStat) {
            return secondaryStat.value;
        }
        
        return 0;
    }
    
    // Check if item has a specific effect
    hasEffect(effectId) {
        return this.specialEffects.some(effect => effect.id === effectId);
    }
    
    // Get a specific effect
    getEffect(effectId) {
        return this.specialEffects.find(effect => effect.id === effectId);
    }
    
    // Get item display color based on rarity
    getColorHex() {
        const rarityColors = {
            common: '#FFFFFF',
            uncommon: '#1EFF00',
            rare: '#0070DD',
            epic: '#A335EE',
            legendary: '#FF8000',
            mythic: '#FF0000'
        };
        
        return rarityColors[this.rarity] || '#FFFFFF';
    }
}
```

### Step 2: Create Item Generator

Create a new file `js/entities/items/ItemGenerator.js`:

```javascript
import { Item } from './Item.js';
import { ITEM_TEMPLATES } from '../../config/item-templates.js';

export class ItemGenerator {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Generate a random item
     * @param {Object} options - Generation options
     * @param {number} options.level - Item level (defaults to player level)
     * @param {string} options.type - Item type (weapon, armor, accessory, consumable)
     * @param {string} options.rarity - Force a specific rarity
     * @param {string} options.subType - Force a specific subType
     * @returns {Item} - The generated item
     */
    generateItem(options = {}) {
        // Default to player level if available
        const level = options.level || (this.game.player ? this.game.player.stats.getLevel() : 1);
        
        // Select item type
        const type = options.type || this.selectRandomItemType();
        
        // Select item subtype based on type
        const subType = options.subType || this.selectRandomSubType(type);
        
        // Select rarity based on level and luck
        const rarity = options.rarity || this.selectRarity(level);
        
        // Get base template for this type/subtype
        const template = this.getItemTemplate(type, subType);
        
        // Generate base stats
        const baseStats = this.generateBaseStats(template, level);
        
        // Generate secondary stats based on rarity
        const secondaryStats = this.generateSecondaryStats(template, rarity, level);
        
        // Generate special effects based on rarity
        const specialEffects = this.generateSpecialEffects(template, rarity);
        
        // Determine if it's a set item
        const setId = this.determineSetId(rarity, type, subType);
        
        // Create the item
        const item = new Item({
            name: this.generateItemName(template, rarity, setId),
            description: template.description,
            type: type,
            subType: subType,
            icon: template.icon,
            level: level,
            rarity: rarity,
            baseStats: baseStats,
            secondaryStats: secondaryStats,
            specialEffects: specialEffects,
            setId: setId,
            visual: template.visual
        });
        
        return item;
    }
    
    // Helper methods for item generation
    selectRandomItemType() {
        const types = ['weapon', 'armor', 'accessory', 'consumable'];
        const weights = [40, 30, 20, 10]; // Percentage chances
        
        return this.weightedRandom(types, weights);
    }
    
    selectRandomSubType(type) {
        const subTypes = {
            weapon: ['fist', 'staff', 'dagger'],
            armor: ['robe', 'belt', 'boots', 'gloves', 'helmet'],
            accessory: ['amulet', 'ring', 'talisman'],
            consumable: ['potion', 'scroll', 'food']
        };
        
        return this.randomElement(subTypes[type] || []);
    }
    
    selectRarity(level) {
        // Base chances adjusted by level
        let chances = {
            common: 100 - (level * 1.5),
            uncommon: 20 + (level * 0.5),
            rare: 10 + (level * 0.3),
            epic: 5 + (level * 0.2),
            legendary: 1 + (level * 0.1),
            mythic: 0 + (level * 0.05)
        };
        
        // Ensure minimum chances
        chances.common = Math.max(chances.common, 40);
        chances.uncommon = Math.max(chances.uncommon, 20);
        chances.rare = Math.max(chances.rare, 10);
        chances.epic = Math.max(chances.epic, 5);
        chances.legendary = Math.max(chances.legendary, 1);
        chances.mythic = Math.max(chances.mythic, 0.5);
        
        // Convert to weights array
        const rarities = Object.keys(chances);
        const weights = Object.values(chances);
        
        return this.weightedRandom(rarities, weights);
    }
    
    getItemTemplate(type, subType) {
        // Find matching template
        const matchingTemplates = ITEM_TEMPLATES.filter(
            template => template.type === type && template.subType === subType
        );
        
        if (matchingTemplates.length === 0) {
            console.warn(`No template found for ${type}/${subType}, using default`);
            return ITEM_TEMPLATES[0];
        }
        
        return this.randomElement(matchingTemplates);
    }
    
    generateBaseStats(template, level) {
        const baseStats = {};
        
        // Copy base stats from template
        for (const [key, value] of Object.entries(template.baseStats || {})) {
            // Add some randomness (±10%)
            const randomFactor = 0.9 + (Math.random() * 0.2);
            baseStats[key] = Math.round(value * randomFactor);
        }
        
        return baseStats;
    }
    
    generateSecondaryStats(template, rarity, level) {
        // Number of secondary stats based on rarity
        const statCounts = {
            common: 0,
            uncommon: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
            mythic: 5
        };
        
        // Add some randomness to count
        let count = statCounts[rarity];
        if (Math.random() < 0.3) {
            count += 1; // 30% chance for an extra stat
        }
        
        // Get possible secondary stats for this item type
        const possibleStats = template.possibleSecondaryStats || [];
        
        // Generate the stats
        const secondaryStats = [];
        for (let i = 0; i < count && i < possibleStats.length; i++) {
            const statType = this.randomElement(possibleStats);
            
            // Remove from possible stats to avoid duplicates
            const index = possibleStats.indexOf(statType);
            if (index > -1) {
                possibleStats.splice(index, 1);
            }
            
            // Generate value based on stat type and level
            const value = this.generateStatValue(statType, level, rarity);
            
            // Add elemental type if needed
            let stat = { type: statType, value: value };
            if (statType === 'elementalDamage') {
                stat.element = this.randomElement(['fire', 'ice', 'lightning', 'holy']);
            }
            
            secondaryStats.push(stat);
        }
        
        return secondaryStats;
    }
    
    generateStatValue(statType, level, rarity) {
        // Base values for different stat types
        const baseValues = {
            critChance: 2,
            critDamage: 10,
            attackSpeed: 5,
            cooldownReduction: 3,
            healthBonus: 5,
            manaBonus: 5,
            elementalDamage: 10,
            damageReduction: 2,
            movementSpeed: 3,
            goldFind: 10,
            magicFind: 5,
            experienceBonus: 5
        };
        
        // Rarity multipliers
        const rarityMultipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 2.5,
            mythic: 3.0
        };
        
        // Calculate base value
        let value = baseValues[statType] || 5;
        
        // Scale with level
        value *= (1 + (level * 0.03));
        
        // Apply rarity multiplier
        value *= rarityMultipliers[rarity];
        
        // Add some randomness (±15%)
        const randomFactor = 0.85 + (Math.random() * 0.3);
        value *= randomFactor;
        
        // Round to appropriate precision
        if (['critChance', 'attackSpeed', 'cooldownReduction', 'damageReduction', 'movementSpeed'].includes(statType)) {
            // These are small percentages, round to 1 decimal place
            return Math.round(value * 10) / 10;
        }
        
        return Math.round(value);
    }
    
    generateSpecialEffects(template, rarity) {
        // Only higher rarities get special effects
        if (!['rare', 'epic', 'legendary', 'mythic'].includes(rarity)) {
            return [];
        }
        
        // Number of effects based on rarity
        const effectCounts = {
            rare: 1,
            epic: 1,
            legendary: 2,
            mythic: 3
        };
        
        // Get possible effects for this template
        const possibleEffects = template.possibleEffects || [];
        if (possibleEffects.length === 0) {
            return [];
        }
        
        // Generate effects
        const effects = [];
        const count = effectCounts[rarity];
        
        for (let i = 0; i < count && i < possibleEffects.length; i++) {
            const effect = this.randomElement(possibleEffects);
            effects.push(JSON.parse(JSON.stringify(effect))); // Deep copy
        }
        
        return effects;
    }
    
    determineSetId(rarity, type, subType) {
        // Only epic+ items can be set items
        if (!['epic', 'legendary', 'mythic'].includes(rarity)) {
            return null;
        }
        
        // 20% chance for epic, 30% for legendary, 50% for mythic
        const setChances = {
            epic: 0.2,
            legendary: 0.3,
            mythic: 0.5
        };
        
        if (Math.random() < setChances[rarity]) {
            // Get possible sets for this item type/subtype
            const possibleSets = ITEM_TEMPLATES
                .filter(template => template.type === type && template.setId)
                .map(template => template.setId);
            
            if (possibleSets.length > 0) {
                return this.randomElement(possibleSets);
            }
        }
        
        return null;
    }
    
    generateItemName(template, rarity, setId) {
        if (setId) {
            // Use set name pattern
            const setInfo = ITEM_TEMPLATES.find(t => t.setId === setId);
            if (setInfo && setInfo.setName) {
                return `${setInfo.setName} ${template.subType}`;
            }
        }
        
        // Use rarity-based naming
        if (rarity === 'legendary' || rarity === 'mythic') {
            // Legendary items have unique names
            return template.uniqueNames ? this.randomElement(template.uniqueNames) : template.name;
        }
        
        // Regular items use quality + name pattern
        const qualityPrefixes = {
            common: '',
            uncommon: 'Fine ',
            rare: 'Superior ',
            epic: 'Exquisite '
        };
        
        return `${qualityPrefixes[rarity]}${template.name}`;
    }
    
    // Utility methods
    randomElement(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
    
    weightedRandom(items, weights) {
        // Calculate sum of weights
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        // Get random value within total weight
        let random = Math.random() * totalWeight;
        
        // Find the item based on weights
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random < 0) {
                return items[i];
            }
        }
        
        // Fallback
        return items[0];
    }
}
```

### Step 3: Create Item Templates Configuration

Create a new file `js/config/item-templates.js`:

```javascript
/**
 * Item templates for the item generator
 * These define the base properties for different item types
 */
export const ITEM_TEMPLATES = [
    // WEAPONS
    {
        type: 'weapon',
        subType: 'fist',
        name: 'Training Wraps',
        description: 'Simple cloth wraps to protect the hands during training.',
        icon: '👊',
        baseStats: {
            damage: 5,
            attackSpeed: 1.2
        },
        possibleSecondaryStats: [
            'critChance',
            'critDamage',
            'attackSpeed',
            'elementalDamage',
            'cooldownReduction'
        ],
        possibleEffects: [
            {
                id: 'combo-master',
                description: 'Increases combo damage by 20%',
                trigger: 'passive',
                effect: 'increaseComboDamage',
                params: { percent: 20 }
            },
            {
                id: 'elemental-fist',
                description: 'Attacks have a 15% chance to deal elemental damage',
                trigger: 'onHit',
                chance: 15,
                effect: 'elementalDamage',
                params: { damagePercent: 30, element: 'random' }
            }
        ],
        uniqueNames: [
            'Dragon\'s Fury',
            'Thunderfist',
            'Jade Striker',
            'Celestial Gauntlets'
        ],
        setId: 'monks-discipline',
        setName: 'Monk\'s Discipline',
        visual: {
            model: 'models/weapons/fist_wraps.glb'
        }
    },
    {
        type: 'weapon',
        subType: 'staff',
        name: 'Wooden Staff',
        description: 'A simple wooden staff for training and meditation.',
        icon: '🥢',
        baseStats: {
            damage: 8,
            attackSpeed: 0.9
        },
        possibleSecondaryStats: [
            'critChance',
            'critDamage',
            'elementalDamage',
            'cooldownReduction',
            'manaBonus'
        ],
        possibleEffects: [
            {
                id: 'arcane-focus',
                description: 'Increases skill damage by 15%',
                trigger: 'passive',
                effect: 'increaseSkillDamage',
                params: { percent: 15 }
            },
            {
                id: 'mana-channel',
                description: 'Reduces mana cost of skills by 10%',
                trigger: 'passive',
                effect: 'reduceManaCoast',
                params: { percent: 10 }
            }
        ],
        uniqueNames: [
            'Staff of Enlightenment',
            'Pillar of the Heavens',
            'Wisdom\'s Reach',
            'Transcendent Rod'
        ],
        setId: 'enlightened-sage',
        setName: 'Enlightened Sage\'s',
        visual: {
            model: 'models/weapons/wooden_staff.glb'
        }
    },
    
    // ARMOR
    {
        type: 'armor',
        subType: 'robe',
        name: 'Monk\'s Robe',
        description: 'A simple cloth robe worn by monks during training.',
        icon: '👘',
        baseStats: {
            defense: 5,
            healthBonus: 10
        },
        possibleSecondaryStats: [
            'healthBonus',
            'manaBonus',
            'damageReduction',
            'cooldownReduction',
            'movementSpeed'
        ],
        possibleEffects: [
            {
                id: 'meditation',
                description: 'Increases mana regeneration by 20%',
                trigger: 'passive',
                effect: 'increaseManaRegen',
                params: { percent: 20 }
            },
            {
                id: 'inner-peace',
                description: 'Reduces damage taken by 10% when standing still',
                trigger: 'passive',
                effect: 'reduceDamageWhenStill',
                params: { percent: 10 }
            }
        ],
        uniqueNames: [
            'Vestments of Serenity',
            'Enlightened Garb',
            'Celestial Shroud',
            'Mantle of Wisdom'
        ],
        setId: 'monks-discipline',
        setName: 'Monk\'s Discipline',
        visual: {
            model: 'models/armor/monk_robe.glb'
        }
    },
    
    // ACCESSORIES
    {
        type: 'accessory',
        subType: 'amulet',
        name: 'Meditation Beads',
        description: 'Prayer beads used during meditation to focus the mind.',
        icon: '📿',
        baseStats: {
            manaBonus: 15
        },
        possibleSecondaryStats: [
            'cooldownReduction',
            'manaBonus',
            'healthBonus',
            'elementalDamage',
            'experienceBonus'
        ],
        possibleEffects: [
            {
                id: 'focused-mind',
                description: 'Increases skill effect duration by 15%',
                trigger: 'passive',
                effect: 'increaseSkillDuration',
                params: { percent: 15 }
            },
            {
                id: 'spiritual-clarity',
                description: 'Critical hits restore 2% of maximum mana',
                trigger: 'onCrit',
                effect: 'restoreMana',
                params: { percent: 2 }
            }
        ],
        uniqueNames: [
            'Eye of Tranquility',
            'Heart of the Mountain',
            'Soul Tether',
            'Cosmic Resonator'
        ],
        setId: 'enlightened-sage',
        setName: 'Enlightened Sage\'s',
        visual: {
            model: 'models/accessories/meditation_beads.glb'
        }
    },
    
    // CONSUMABLES
    {
        type: 'consumable',
        subType: 'potion',
        name: 'Health Potion',
        description: 'A small vial of red liquid that restores health when consumed.',
        icon: '🧪',
        baseStats: {
            healAmount: 50
        },
        possibleSecondaryStats: [],
        possibleEffects: [
            {
                id: 'instant-heal',
                description: 'Instantly restores health',
                trigger: 'onUse',
                effect: 'restoreHealth',
                params: { amount: 50, isPercentage: false }
            }
        ],
        visual: {
            model: 'models/items/health_potion.glb'
        }
    }
];

/**
 * Item set definitions
 */
export const ITEM_SETS = [
    {
        id: 'monks-discipline',
        name: 'Monk\'s Discipline',
        description: 'Ancient training gear passed down through generations of monks.',
        pieces: ['fist', 'robe', 'belt', 'boots'],
        bonuses: [
            {
                requiredPieces: 2,
                description: 'Increases attack speed by 10%',
                effect: {
                    type: 'attackSpeed',
                    value: 10
                }
            },
            {
                requiredPieces: 4,
                description: 'Your combo punches have a 20% chance to strike twice',
                effect: {
                    type: 'special',
                    id: 'double-strike',
                    params: { chance: 20 }
                }
            }
        ]
    },
    {
        id: 'enlightened-sage',
        name: 'Enlightened Sage',
        description: 'Artifacts of a legendary monk who achieved enlightenment.',
        pieces: ['staff', 'amulet', 'helmet', 'gloves'],
        bonuses: [
            {
                requiredPieces: 2,
                description: 'Increases skill damage by 20%',
                effect: {
                    type: 'skillDamage',
                    value: 20
                }
            },
            {
                requiredPieces: 4,
                description: 'After using a skill, your next skill costs 50% less mana',
                effect: {
                    type: 'special',
                    id: 'skill-chain',
                    params: { manaReduction: 50 }
                }
            }
        ]
    }
];
```

### Step 4: Update Skill Damage Calculation

Modify `js/entities/skills/Skill.js` to incorporate player stats and equipment:

```javascript
getDamage() {
    // Base damage from skill configuration
    let damage = this.damage;
    
    // If we have access to the player's stats, use them to calculate damage
    if (this.game && this.game.player) {
        const player = this.game.player;
        
        // Base damage from attack power
        damage = damage * (player.stats.getAttackPower() / 10);
        
        // Add bonus from strength (each point adds 0.5 damage)
        damage += player.stats.strength * 0.5;
        
        // Add level bonus (each level adds 2 damage)
        damage += (player.stats.getLevel() - 1) * 2;
        
        // Add weapon damage if equipped
        const equipment = player.inventory.getEquipment();
        if (equipment.weapon) {
            damage += equipment.weapon.getStat('damage') || 0;
            
            // Apply elemental bonuses if matching
            if (this.element && equipment.weapon.getStat(`${this.element}Damage`)) {
                damage *= (1 + (equipment.weapon.getStat(`${this.element}Damage`) / 100));
            }
        }
        
        // Apply skill damage bonuses from items
        let skillDamageBonus = 0;
        
        // Check all equipped items for skill damage bonuses
        for (const slot in equipment) {
            const item = equipment[slot];
            if (item) {
                // General skill damage bonus
                skillDamageBonus += item.getStat('skillDamage') || 0;
                
                // Specific skill type bonus
                if (this.variant) {
                    skillDamageBonus += item.getStat(`${this.variant}Damage`) || 0;
                }
                
                // Specific skill bonus
                skillDamageBonus += item.getStat(`${this.name}Damage`) || 0;
            }
        }
        
        // Apply skill damage bonus
        damage *= (1 + (skillDamageBonus / 100));
        
        // Apply small random variation (±10%)
        const variation = damage * 0.2 * (Math.random() - 0.5);
        damage += variation;
        
        // Round to integer
        damage = Math.round(damage);
        console.debug(`Calculated skill damage: ${damage} (base: ${this.damage}, attackPower: ${player.stats.getAttackPower()}, strength: ${player.stats.strength})`);
    }

    return damage;
}
```

## 2. Difficulty System Implementation

### Step 1: Create Difficulty Configuration

Create a new file `js/config/difficulty-settings.js`:

```javascript
/**
 * Difficulty settings for the game
 * These control enemy scaling and rewards
 */
export const DIFFICULTY_SETTINGS = {
    basic: {
        name: 'Basic',
        description: 'A relaxed experience for casual play.',
        levelOffset: -5, // Enemy level = player level - 5
        damageMultiplier: 0.7,
        healthMultiplier: 0.7,
        experienceMultiplier: 0.8,
        itemQualityMultiplier: 0.8,
        itemDropRateMultiplier: 1.2,
        affixCount: 0, // No special affixes
        bossHealthMultiplier: 1.5,
        bossDamageMultiplier: 0.8
    },
    
    medium: {
        name: 'Medium',
        description: 'The standard game experience.',
        levelOffset: -2, // Enemy level = player level - 2
        damageMultiplier: 1.0,
        healthMultiplier: 1.0,
        experienceMultiplier: 1.0,
        itemQualityMultiplier: 1.0,
        itemDropRateMultiplier: 1.0,
        affixCount: 1, // One affix for elites and champions
        bossHealthMultiplier: 2.0,
        bossDamageMultiplier: 1.0
    },
    
    hard: {
        name: 'Hard',
        description: 'A challenging experience for skilled players.',
        levelOffset: 2, // Enemy level = player level + 2
        damageMultiplier: 1.3,
        healthMultiplier: 1.5,
        experienceMultiplier: 1.2,
        itemQualityMultiplier: 1.2,
        itemDropRateMultiplier: 1.0,
        affixCount: 2, // Two affixes for elites and champions
        bossHealthMultiplier: 2.5,
        bossDamageMultiplier: 1.3
    },
    
    hell: {
        name: 'Hell',
        description: 'An extreme challenge requiring excellent gear and skill.',
        levelOffset: 5, // Enemy level = player level + 5
        damageMultiplier: 2.0,
        healthMultiplier: 2.5,
        experienceMultiplier: 1.5,
        itemQualityMultiplier: 1.5,
        itemDropRateMultiplier: 0.8,
        affixCount: 3, // Three affixes for elites and champions
        bossHealthMultiplier: 3.0,
        bossDamageMultiplier: 1.8
    },
    
    inferno: {
        name: 'Inferno',
        description: 'The ultimate challenge for endgame players.',
        levelOffset: 10, // Enemy level = player level + 10
        damageMultiplier: 3.0,
        healthMultiplier: 4.0,
        experienceMultiplier: 2.0,
        itemQualityMultiplier: 2.0,
        itemDropRateMultiplier: 0.7,
        affixCount: 4, // Four affixes for elites and champions
        bossHealthMultiplier: 4.0,
        bossDamageMultiplier: 2.5
    }
};

/**
 * Enemy affix definitions
 */
export const ENEMY_AFFIXES = [
    {
        id: 'frozen',
        name: 'Frozen',
        description: 'Creates ice patches that slow and damage players',
        visualEffect: 'ice_aura',
        abilities: [
            {
                name: 'Ice Patch',
                cooldown: 5,
                effect: 'createIcePatch',
                params: {
                    duration: 4,
                    slowPercent: 50,
                    damagePerSecond: 5
                }
            }
        ]
    },
    {
        id: 'molten',
        name: 'Molten',
        description: 'Leaves fire trails and explodes on death',
        visualEffect: 'fire_aura',
        abilities: [
            {
                name: 'Fire Trail',
                cooldown: 0, // Passive
                effect: 'createFireTrail',
                params: {
                    duration: 3,
                    damagePerSecond: 10
                }
            },
            {
                name: 'Death Explosion',
                trigger: 'onDeath',
                effect: 'createExplosion',
                params: {
                    radius: 5,
                    damage: 50,
                    delay: 2 // Seconds before explosion
                }
            }
        ]
    },
    {
        id: 'teleporter',
        name: 'Teleporter',
        description: 'Can teleport to avoid attacks',
        visualEffect: 'teleport_aura',
        abilities: [
            {
                name: 'Teleport',
                cooldown: 8,
                effect: 'teleport',
                params: {
                    range: 10,
                    minDistance: 5
                }
            }
        ]
    },
    {
        id: 'shielded',
        name: 'Shielded',
        description: 'Periodically immune to damage',
        visualEffect: 'shield_aura',
        abilities: [
            {
                name: 'Energy Shield',
                cooldown: 15,
                effect: 'createShield',
                params: {
                    duration: 4,
                    absorptionPercent: 100
                }
            }
        ]
    },
    {
        id: 'vampiric',
        name: 'Vampiric',
        description: 'Heals from damage dealt',
        visualEffect: 'blood_aura',
        abilities: [
            {
                name: 'Life Drain',
                trigger: 'onHit',
                effect: 'drainLife',
                params: {
                    healPercent: 30 // Percent of damage dealt
                }
            }
        ]
    },
    {
        id: 'arcane',
        name: 'Arcane',
        description: 'Creates arcane beams that rotate and deal damage',
        visualEffect: 'arcane_aura',
        abilities: [
            {
                name: 'Arcane Beam',
                cooldown: 12,
                effect: 'createArcaneBeam',
                params: {
                    duration: 6,
                    damagePerSecond: 15,
                    rotationSpeed: 45 // Degrees per second
                }
            }
        ]
    },
    {
        id: 'fast',
        name: 'Fast',
        description: 'Moves and attacks more quickly',
        visualEffect: 'speed_aura',
        abilities: [
            {
                name: 'Increased Speed',
                trigger: 'passive',
                effect: 'increaseSpeed',
                params: {
                    movementSpeedPercent: 50,
                    attackSpeedPercent: 30
                }
            }
        ]
    },
    {
        id: 'waller',
        name: 'Waller',
        description: 'Creates walls to block player movement',
        visualEffect: 'earth_aura',
        abilities: [
            {
                name: 'Stone Wall',
                cooldown: 10,
                effect: 'createWall',
                params: {
                    length: 8,
                    duration: 5,
                    orientation: 'random' // 'horizontal', 'vertical', or 'random'
                }
            }
        ]
    }
];
```

### Step 2: Update Enemy Manager for Difficulty Scaling

Modify `js/entities/enemies/EnemyManager.js` to incorporate difficulty scaling:

```javascript
import { DIFFICULTY_SETTINGS, ENEMY_AFFIXES } from '../../config/difficulty-settings.js';

// Inside EnemyManager class

constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.enemies = [];
    this.enemyMeshes = [];
    this.maxEnemies = 20;
    this.spawnRadius = 20;
    this.spawnCooldown = 0;
    this.game = null;
    
    // Track current difficulty
    this.currentDifficulty = 'medium'; // Default difficulty
}

setGame(game) {
    this.game = game;
}

setDifficulty(difficulty) {
    if (DIFFICULTY_SETTINGS[difficulty]) {
        this.currentDifficulty = difficulty;
        console.log(`Difficulty set to ${DIFFICULTY_SETTINGS[difficulty].name}`);
    } else {
        console.warn(`Unknown difficulty: ${difficulty}, defaulting to medium`);
        this.currentDifficulty = 'medium';
    }
}

getDifficultySettings() {
    return DIFFICULTY_SETTINGS[this.currentDifficulty];
}

spawnEnemy(type, position, options = {}) {
    // Get player level for scaling
    const playerLevel = this.game && this.game.player ? this.game.player.stats.getLevel() : 1;
    
    // Get difficulty settings
    const difficultySettings = this.getDifficultySettings();
    
    // Calculate effective enemy level
    const effectiveLevel = Math.max(1, playerLevel + difficultySettings.levelOffset);
    
    // Create enemy with appropriate level
    const enemy = new Enemy(this.scene, position, {
        type: type,
        level: effectiveLevel,
        ...options
    });
    
    // Apply difficulty scaling
    this.applyDifficultyScaling(enemy, difficultySettings);
    
    // Add affixes for elite/champion enemies
    if ((enemy.rank === 'elite' || enemy.rank === 'champion') && difficultySettings.affixCount > 0) {
        this.assignRandomAffixes(enemy, difficultySettings.affixCount);
    }
    
    // Add to enemies array
    this.enemies.push(enemy);
    this.enemyMeshes.push(enemy.mesh);
    
    return enemy;
}

applyDifficultyScaling(enemy, difficultySettings) {
    // Scale health
    enemy.maxHealth *= difficultySettings.healthMultiplier;
    enemy.health = enemy.maxHealth;
    
    // Scale damage
    enemy.damage *= difficultySettings.damageMultiplier;
    
    // Scale boss stats further if this is a boss
    if (enemy.isBoss) {
        enemy.maxHealth *= difficultySettings.bossHealthMultiplier;
        enemy.health = enemy.maxHealth;
        enemy.damage *= difficultySettings.bossDamageMultiplier;
    }
    
    // Scale experience and item drops
    enemy.experienceValue *= difficultySettings.experienceMultiplier;
    enemy.itemDropChance *= difficultySettings.itemDropRateMultiplier;
    enemy.itemQualityBonus = (enemy.itemQualityBonus || 0) + 
        (difficultySettings.itemQualityMultiplier - 1) * 100;
}

assignRandomAffixes(enemy, count) {
    // Copy available affixes
    const availableAffixes = [...ENEMY_AFFIXES];
    
    // Assign random affixes
    enemy.affixes = [];
    
    for (let i = 0; i < count && availableAffixes.length > 0; i++) {
        // Select random affix
        const index = Math.floor(Math.random() * availableAffixes.length);
        const affix = availableAffixes[index];
        
        // Remove from available affixes
        availableAffixes.splice(index, 1);
        
        // Add to enemy
        enemy.affixes.push(affix);
        
        // Apply affix effects
        this.applyAffixToEnemy(enemy, affix);
    }
    
    // Update enemy name to reflect affixes
    if (enemy.affixes.length > 0) {
        const affixNames = enemy.affixes.map(affix => affix.name);
        enemy.name = `${affixNames.join(' ')} ${enemy.name}`;
    }
}

applyAffixToEnemy(enemy, affix) {
    // Add visual effect
    if (affix.visualEffect) {
        enemy.addVisualEffect(affix.visualEffect);
    }
    
    // Add abilities
    if (affix.abilities) {
        affix.abilities.forEach(ability => {
            enemy.addAbility(ability);
        });
    }
    
    // Apply passive effects
    if (affix.id === 'fast') {
        enemy.moveSpeed *= 1.5;
        enemy.attackSpeed *= 1.3;
    }
}
```

### Step 3: Create Difficulty Selection UI

Create a new file `js/menu-system/DifficultyMenu.js`:

```javascript
import { DIFFICULTY_SETTINGS } from '../config/difficulty-settings.js';

export class DifficultyMenu {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.isVisible = false;
        this.selectedDifficulty = 'medium';
    }
    
    create() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'difficulty-menu';
        this.container.style.display = 'none';
        
        // Create header
        const header = document.createElement('h2');
        header.textContent = 'Select Difficulty';
        this.container.appendChild(header);
        
        // Create difficulty options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'difficulty-options';
        
        // Add each difficulty option
        for (const [key, settings] of Object.entries(DIFFICULTY_SETTINGS)) {
            const option = this.createDifficultyOption(key, settings);
            optionsContainer.appendChild(option);
        }
        
        this.container.appendChild(optionsContainer);
        
        // Create buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        // Apply button
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', () => {
            this.applyDifficulty();
        });
        buttonContainer.appendChild(applyButton);
        
        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.hide();
        });
        buttonContainer.appendChild(cancelButton);
        
        this.container.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    createDifficultyOption(key, settings) {
        const option = document.createElement('div');
        option.className = 'difficulty-option';
        option.dataset.difficulty = key;
        
        // Add selected class if this is the current difficulty
        if (key === this.selectedDifficulty) {
            option.classList.add('selected');
        }
        
        // Create name
        const name = document.createElement('h3');
        name.textContent = settings.name;
        option.appendChild(name);
        
        // Create description
        const description = document.createElement('p');
        description.textContent = settings.description;
        option.appendChild(description);
        
        // Create stats
        const stats = document.createElement('div');
        stats.className = 'difficulty-stats';
        
        // Add stat items
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Enemy Level:</span>
                <span class="stat-value">Player ${settings.levelOffset >= 0 ? '+' : ''}${settings.levelOffset}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Enemy Health:</span>
                <span class="stat-value">${settings.healthMultiplier * 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Enemy Damage:</span>
                <span class="stat-value">${settings.damageMultiplier * 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Experience:</span>
                <span class="stat-value">${settings.experienceMultiplier * 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Item Quality:</span>
                <span class="stat-value">${settings.itemQualityMultiplier * 100}%</span>
            </div>
        `;
        
        option.appendChild(stats);
        
        // Add click handler
        option.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.difficulty-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to this option
            option.classList.add('selected');
            
            // Update selected difficulty
            this.selectedDifficulty = key;
        });
        
        return option;
    }
    
    show() {
        if (!this.container) {
            this.create();
        }
        
        // Pause game
        if (this.game) {
            this.game.pause();
        }
        
        // Show menu
        this.container.style.display = 'flex';
        this.isVisible = true;
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        
        // Resume game
        if (this.game) {
            this.game.resume();
        }
        
        this.isVisible = false;
    }
    
    applyDifficulty() {
        // Apply selected difficulty
        if (this.game && this.game.enemyManager) {
            this.game.enemyManager.setDifficulty(this.selectedDifficulty);
            
            // Show notification
            if (this.game.hudManager) {
                const difficultyName = DIFFICULTY_SETTINGS[this.selectedDifficulty].name;
                this.game.hudManager.showNotification(`Difficulty changed to ${difficultyName}`);
            }
        }
        
        // Hide menu
        this.hide();
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
```

### Step 4: Add CSS for Difficulty Menu

Add the following to your CSS file:

```css
/* Difficulty Menu Styles */
.difficulty-menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 800px;
    background-color: rgba(0, 0, 0, 0.9);
    border: 2px solid #444;
    border-radius: 8px;
    padding: 20px;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 1000;
}

.difficulty-menu h2 {
    text-align: center;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #444;
}

.difficulty-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.difficulty-option {
    background-color: rgba(50, 50, 50, 0.7);
    border: 1px solid #555;
    border-radius: 5px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.difficulty-option:hover {
    background-color: rgba(70, 70, 70, 0.7);
    transform: translateY(-2px);
}

.difficulty-option.selected {
    background-color: rgba(60, 100, 150, 0.7);
    border-color: #88f;
    box-shadow: 0 0 10px rgba(100, 150, 255, 0.5);
}

.difficulty-option h3 {
    margin: 0 0 10px 0;
    color: #fff;
}

.difficulty-option p {
    margin: 0 0 15px 0;
    font-size: 0.9em;
    color: #ccc;
}

.difficulty-stats {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.85em;
}

.stat-label {
    color: #aaa;
}

.button-container {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.button-container button {
    padding: 10px 20px;
    background-color: #444;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.button-container button:hover {
    background-color: #555;
}

.button-container button:first-child {
    background-color: #2a6;
}

.button-container button:first-child:hover {
    background-color: #3b7;
}
```

### Step 5: Integrate with Game Class

Update your main Game class to include the difficulty system:

```javascript
// In Game.js

import { DifficultyMenu } from './menu-system/DifficultyMenu.js';
import { ItemGenerator } from './entities/items/ItemGenerator.js';

// Inside Game class constructor
constructor() {
    // ... existing code ...
    
    // Create difficulty menu
    this.difficultyMenu = new DifficultyMenu(this);
    
    // Create item generator
    this.itemGenerator = new ItemGenerator(this);
    
    // Default difficulty
    this.difficulty = 'medium';
}

// Inside Game class init method
init() {
    // ... existing code ...
    
    // Set initial difficulty
    this.enemyManager.setDifficulty(this.difficulty);
    
    // Add difficulty menu toggle to settings menu
    this.settingsMenu.addMenuItem('Change Difficulty', () => {
        this.difficultyMenu.toggle();
    });
}

// Inside Game class update method
update(delta) {
    // ... existing code ...
    
    // Skip updates if game is paused or difficulty menu is open
    if (this.isPaused || this.difficultyMenu.isVisible) {
        return;
    }
    
    // ... rest of update code ...
}
```

## 3. Testing and Balancing

After implementing these systems, you'll need to test and balance them:

1. **Create Test Characters**: Make characters at different levels with different gear
2. **Test Against Enemies**: Fight enemies at each difficulty level
3. **Measure Performance**: Track damage output, time-to-kill, and survival time
4. **Adjust Values**: Fine-tune the balance settings in the configuration files

## Next Steps

Once the core systems are implemented, you can expand with:

1. **Crafting System**: Allow players to create and modify items
2. **Enchanting**: Add the ability to reroll or enhance item properties
3. **Paragon System**: Create post-max-level progression
4. **World Tiers**: Add an endgame difficulty system with special rewards

This implementation guide provides the foundation for a robust item and difficulty system that will make your game more engaging and replayable.