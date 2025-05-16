/**
 * Configuration for structure generation in the world
 */
export const STRUCTURE_CONFIG = {
    /**
     * Density values for different structure types
     * Higher values = more structures generated
     */
    structureDensity: {
        'house':       0.0008, // Reduced from 0.001 (Individual houses)
        'tower':       0.0001,  // Increased from 0.0008 (Watchtowers - more visible from distance)
        'ruins':       0.0008, // Kept the same (Ancient ruins)
        'darkSanctum': 0.0003, // Increased from 0.0002 (Rare dark sanctums - more visible)
        'mountain':    0.006, // Increased from 0.0005 (Mountains - more visible from distance)
        'bridge':      0.0003, // Kept the same (Bridges)
        'village':     0.0003  // Increased from 0.0002 (Villages - more visible from distance)
    }
};