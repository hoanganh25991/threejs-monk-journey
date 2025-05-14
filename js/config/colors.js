/**
 * Color configuration for the game
 * Contains color definitions for various game elements
 * Updated for Monk Journey theme
 */

// Skill type colors in CSS hex format
export const SKILL_COLORS = {
    'teleport': '#4682B4', // Oasis Blue for teleport
    'ranged': '#B0E0E6', // Ice Blue for ranged attacks
    'aoe': '#FF4500', // Sunset Orange for area effects
    'multi': '#B22222', // Inferno Red for multi-target
    'buff': '#D8BFD8', // Soft Pink for buffs
    'summon': '#8FBC8F', // Arctic Moss for summons
    'wave': '#FFD700', // Solar Yellow for wave attacks
    'mark': '#8B0000', // Blood Red for marking
    'heal': '#2E8B57' // Pine Green for healing abilities
};

// Environment colors by zone type
export const ZONE_COLORS = {
    // Forest environment
    'Forest': {
        'foliage': '#2F4F4F', // Dark Green
        'trunk': '#8B4513', // Earth Brown
        'ground': '#8F9779', // Moss Green
        'rock': '#708090', // Slate Gray
        'structure': '#36454F', // Charcoal
        'accent': '#6B8E23' // Olive Drab - a natural forest accent
    },
    // Desert environment
    'Desert': {
        'sand': '#F4A460', // Sandy Brown
        'rock': '#A0522D', // Dark Sienna
        'vegetation': '#6B8E23', // Olive Drab
        'sky': '#87CEEB', // Sky Blue
        'structure': '#EDC9AF', // Desert Sand
        'accent': '#FF4500' // Sunset Orange
    },
    // Icy environment
    'Mountains': {
        'snow': '#FFFAFA', // Snow White
        'ice': '#B0E0E6', // Ice Blue
        'rock': '#A9A9A9', // Frost Gray
        'structure': '#ADD8E6', // Glacier Blue
        'vegetation': '#2E8B57', // Pine Green
        'accent': '#8FBC8F' // Arctic Moss
    },
    // Swamp environment
    'Swamp': {
        'water': '#4682B4', // Oasis Blue
        'vegetation': '#556B2F', // Olive Green
        'ground': '#8F9779', // Moss Green
        'structure': '#708090', // Slate Gray
        'rock': '#36454F', // Charcoal
        'accent': '#40E0D0' // Turquoise
    },
    // Ruins environment
    'Ruins': {
        'stone': '#A9A9A9', // Stone Gray
        'ground': '#8F9779', // Moss Green
        'vegetation': '#556B2F', // Olive Green
        'structure': '#708090', // Slate Gray
        'accent': '#D8BFD8' // Soft Pink
    },
    // Dark Sanctum environment
    'Dark Sanctum': {
        'structure': '#0C0C0C', // Obsidian Black
        'fire': '#FF4500', // Flame Orange
        'ground': '#5C4033', // Charred Brown
        'accent': '#8B0000', // Blood Red
        'glow': '#E3CF57' // Sulfur Yellow
    },
    // Terrant (Ground) environment
    'Terrant': {
        'soil': '#8B4513', // Rich Earth Brown
        'rock': '#696969', // Dim Gray
        'vegetation': '#228B22', // Forest Green
        'crystal': '#7B68EE', // Medium Slate Blue
        'structure': '#4A4A4A', // Dark Charcoal
        'accent': '#DAA520', // Golden Rod
        'water': '#1E90FF', // Dodger Blue
        'glow': '#32CD32'  // Lime Green
    }
};

// Hot zone colors
export const HOT_ZONE_COLORS = {
    'lava': '#FF4500', // Lava Red
    'magma': '#FF6347', // Molten Orange
    'ground': '#2F4F4F', // Charcoal Black
    'ash': '#BEBEBE', // Ash Gray
    'glow': '#FFD700', // Solar Yellow
    'ember': '#FF8C00' // Ember Glow
};

// Enemy colors for different types and rarities
export const ENEMY_COLORS = {
    // Regular enemy types
    'regular': {
        'base': '#A52A2A', // Brown - standard enemy base color
        'outline': '#8B0000', // Dark Red - outline for regular enemies
        'highlight': '#CD5C5C', // Indian Red - highlight for regular enemies
        'damaged': '#E9967A', // Dark Salmon - damaged state
        'enraged': '#FF4500'  // Orange Red - enraged state
    },
    // Elite enemy types (stronger than regular)
    'elite': {
        'base': '#9370DB', // Medium Purple - elite enemy base color
        'outline': '#483D8B', // Dark Slate Blue - outline for elite enemies
        'highlight': '#B19CD9', // Light Purple - highlight for elite enemies
        'damaged': '#D8BFD8', // Thistle - damaged state
        'enraged': '#8A2BE2'  // Blue Violet - enraged state
    },
    // Champion enemy types (mini-bosses)
    'champion': {
        'base': '#FFD700', // Gold - champion enemy base color
        'outline': '#B8860B', // Dark Golden Rod - outline for champions
        'highlight': '#FFFFE0', // Light Yellow - highlight for champions
        'damaged': '#F0E68C', // Khaki - damaged state
        'enraged': '#FFA500'  // Orange - enraged state
    },
    // Boss enemy types
    'boss': {
        'base': '#DC143C', // Crimson - boss enemy base color
        'outline': '#800000', // Maroon - outline for bosses
        'highlight': '#FF6347', // Tomato - highlight for bosses
        'damaged': '#FA8072', // Salmon - damaged state
        'enraged': '#FF0000'  // Red - enraged state
    },
    // Special enemy types by element
    'elemental': {
        'fire': '#FF4500', // Orange Red - fire elemental enemies
        'ice': '#87CEEB', // Sky Blue - ice elemental enemies
        'lightning': '#FFFF00', // Yellow - lightning elemental enemies
        'poison': '#32CD32', // Lime Green - poison elemental enemies
        'arcane': '#9932CC', // Dark Orchid - arcane elemental enemies
        'shadow': '#2F4F4F', // Dark Slate Gray - shadow elemental enemies
        'holy': '#FFFACD'  // Lemon Chiffon - holy elemental enemies
    },
    // Undead enemy types
    'undead': {
        'skeleton': '#F5F5F5', // White Smoke - skeleton enemies
        'zombie': '#556B2F', // Dark Olive Green - zombie enemies
        'ghost': '#E6E6FA', // Lavender - ghost enemies
        'vampire': '#8B0000', // Dark Red - vampire enemies
        'lich': '#6A5ACD'  // Slate Blue - lich enemies
    },
    // Demonic enemy types
    'demonic': {
        'imp': '#FF7F50', // Coral - imp enemies
        'demon': '#8B0000', // Dark Red - demon enemies
        'hellspawn': '#B22222', // Fire Brick - hellspawn enemies
        'overlord': '#800000', // Maroon - overlord enemies
        'corruption': '#4B0082'  // Indigo - corruption enemies
    }
};

