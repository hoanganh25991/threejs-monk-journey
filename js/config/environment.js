/**
 * Configuration for environment objects and settings
 */
export const environmentConfig = {
    // Environment object types
    objectTypes: ['tree', 'rock', 'bush', 'flower'],
    
    // Environment object densities
    objectDensity: {
        'tree':   0.005,
        'rock':   0.0008,
        'bush':   0.001,
        'flower': 0.002
    },
    
    // Default chunk size for environment generation
    chunkSize: 16
};