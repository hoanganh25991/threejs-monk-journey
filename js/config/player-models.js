// Character model configurations
export const CHARACTER_MODELS = [
    {
        id: 'monk',
        name: 'Monk',
        path: 'assets/models/monk.glb',
        description: 'Default monk character model',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 2.05 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'monk-v3',
        name: 'Monk V3',
        path: 'assets/models/monk-v3.glb',
        description: 'Enhanced monk character model',
        baseScale: 0.7, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: -2.05, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 2.05 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'songoku',
        name: 'Son Goku',
        path: 'assets/models/songoku.glb',
        description: 'Powerful Saiyan warrior with legendary fighting skills',
        baseScale: 1.6, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: -2.0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 2.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    }
];

// Default character model ID
export const DEFAULT_CHARACTER_MODEL = 'monk-v3';

// Available model size multipliers
export const MODEL_SIZE_MULTIPLIERS = [
    { value: 1.0, label: '1x (Normal)' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
    { value: 3.0, label: '3x' }
];
