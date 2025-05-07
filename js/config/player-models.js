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
        id: 'monk-v2',
        name: 'Monk V2',
        path: 'assets/models/monk-v2.glb',
        description: 'Enhanced monk character model',
        baseScale: 1.3, // Base scale to fit the model to game world
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
        id: 'knight-of-valor',
        name: 'Knight of Valor',
        path: 'assets/models/knight-of-valor.glb',
        description: 'Valorous knight character model',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 2.0, z: 0 }, // Knight needs to be raised
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 2.0 // Height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'skeleton-king',
        name: 'Skeleton King',
        path: 'assets/models/skeleton-king.glb',
        description: 'Undead skeleton king character model',
        baseScale: 1.0, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0.5, z: 0 }, // Skeleton needs slight adjustment
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.5 // Height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'fantasy-dark-cyborg',
        name: 'Dark Cyborg',
        path: 'assets/models/fantasy-dark-cyborg.glb',
        description: 'Futuristic dark cyborg warrior',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'scifi-robotskeleton-warrior',
        name: 'Robot Skeleton',
        path: 'assets/models/scifi-robotskeleton-warrior.glb',
        description: 'Sci-fi robotic skeleton warrior',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'black-knight',
        name: 'Black Knight',
        path: 'assets/models/black-knight.glb',
        description: 'Mysterious black knight warrior',
        baseScale: 1.3, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'ebon-knight',
        name: 'Ebon Knight',
        path: 'assets/models/ebon-knight.glb',
        description: 'Powerful ebon knight warrior',
        baseScale: 2.0, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 }, // Raised to prevent being half-buried
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 2.0 // Height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'link',
        name: 'Link',
        path: 'assets/models/link.glb',
        description: 'Heroic adventurer with sword and shield',
        baseScale: 20.0, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'cartoonish-skeleton',
        name: 'Cartoonish Skeleton',
        path: 'assets/models/cartoonish-skeleton-with-a-large-skull.glb',
        description: 'Playful skeleton character with an oversized skull',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'chibi-songoku',
        name: 'Chibi Son Goku',
        path: 'assets/models/chibi-songoku.glb',
        description: 'Cute chibi-style warrior with spiky hair',
        baseScale: 1.2, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'warhammer-orange-crest',
        name: 'Warhammer Knight',
        path: 'assets/models/warhammer-orange-crest.glb',
        description: 'Heavily armored knight with distinctive orange crest',
        baseScale: 2.2, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'dagger-assassin',
        name: 'Dagger Assassin',
        path: 'assets/models/dagger-assassin.glb',
        description: 'Stealthy assassin armed with deadly daggers',
        baseScale: 1.4, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'fantasy-aztec-stone',
        name: 'Aztec Stone Warrior',
        path: 'assets/models/fantasy-aztec-stone.glb',
        description: 'Ancient stone warrior with Aztec-inspired design',
        baseScale: 2.0, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'barbarian',
        name: 'Barbarian',
        path: 'assets/models/barbarian.glb',
        description: 'Powerful barbarian warrior with brute strength',
        baseScale: 1.5, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
        }
        // Preview position and rotation are handled dynamically by the adjustment system
    },
    {
        id: 'angel',
        name: 'Angel',
        path: 'assets/models/angel.glb',
        description: 'Divine angel with celestial powers',
        baseScale: 1.8, // Base scale to fit the model to game world
        multiplier: 1.0,  // Default multiplier (1x size)
        // Default position and rotation adjustments
        defaultAdjustments: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            heightOffset: 1.0 // Default height offset for movement
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
export const DEFAULT_CHARACTER_MODEL = 'songoku';

// Available model size multipliers
export const MODEL_SIZE_MULTIPLIERS = [
    { value: 1.0, label: '1x (Normal)' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
    { value: 3.0, label: '3x' }
];
