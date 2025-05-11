/**
 * Color configuration for the game
 * Contains color definitions for various game elements
 */

// Skill type colors in CSS hex format
export const SKILL_COLORS = {
    'teleport': '#4169e1', // Royal blue for teleport
    'ranged': '#00ffff',
    'aoe': '#ffcc00',
    'multi': '#ff0000',
    'buff': '#ffffff',
    'summon': '#00ffff',
    'wave': '#ffdd22',
    'mark': '#ff3333',
    'heal': '#ffdd99' // Golden yellow for healing abilities
};

// Convert a 0xRRGGBB format color to CSS hex format (#RRGGBB)
export function hexColorToCSS(hexColor) {
    // Convert number to hex string and remove '0x' prefix
    let hexString = hexColor.toString(16);
    
    // Ensure 6 digits with leading zeros if needed
    while (hexString.length < 6) {
        hexString = '0' + hexString;
    }
    
    return '#' + hexString;
}