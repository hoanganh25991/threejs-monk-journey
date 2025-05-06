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
        id: 'knight-of-valor',
        name: 'Knight of Valor',
        path: 'assets/models/knight-of-valor.glb',
        description: 'Valorous knight character model',
        baseScale: 3.0, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'skeleton-king',
        name: 'Skeleton King',
        path: 'assets/models/skeleton-king.glb',
        description: 'Undead skeleton king character model',
        baseScale: 1.0, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'fantasy-dark-cyborg',
        name: 'Dark Cyborg',
        path: 'assets/models/fantasy-dark-cyborg.glb',
        description: 'Futuristic dark cyborg warrior',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'scifi-robotskeleton-warrior',
        name: 'Robot Skeleton',
        path: 'assets/models/scifi-robotskeleton-warrior.glb',
        description: 'Sci-fi robotic skeleton warrior',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'black-knight',
        name: 'Black Knight',
        path: 'assets/models/black-knight.glb',
        description: 'Mysterious black knight warrior',
        baseScale: 2.0, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'ebon-knight',
        name: 'Ebon Knight',
        path: 'assets/models/ebon-knight.glb',
        description: 'Powerful ebon knight warrior',
        baseScale: 2.0, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'link',
        name: 'Link',
        path: 'assets/models/link.glb',
        description: 'Heroic adventurer with sword and shield',
        baseScale: 1.8, // Base scale to fit the model to game world
        multiplier: 1.0  // Default multiplier (1x size)
        // Preview position and rotation are handled dynamically by the adjustment system
    }
];

// Default character model ID
export const DEFAULT_CHARACTER_MODEL = 'skeleton-king';

// Available model size multipliers
export const MODEL_SIZE_MULTIPLIERS = [
    { value: 1.0, label: '1x (Normal)' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
    { value: 3.0, label: '3x' }
];
