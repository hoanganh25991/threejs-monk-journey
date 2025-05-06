// Character model configurations
export const CHARACTER_MODELS = [
    {
        id: 'monk',
        name: 'Monk',
        path: 'assets/models/monk.glb',
        description: 'Default monk character model',
        baseScale: 1.3, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'monk-v2',
        name: 'Monk V2',
        path: 'assets/models/monk-v2.glb',
        description: 'Enhanced monk character model',
        baseScale: 1.3, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'knight',
        name: 'Knight of Valor',
        path: 'assets/models/knight-of-valor.glb',
        description: 'Valorous knight character model',
        baseScale: 3.0, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'skeleton',
        name: 'Skeleton King',
        path: 'assets/models/skeleton-king.glb',
        description: 'Undead skeleton king character model',
        baseScale: 1.0, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    }
];

// Default character model ID
export const DEFAULT_CHARACTER_MODEL = 'skeleton';

// Available model size multipliers
export const MODEL_SIZE_MULTIPLIERS = [
    { value: 1.0, label: '1x (Normal)' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
    { value: 3.0, label: '3x' }
];
