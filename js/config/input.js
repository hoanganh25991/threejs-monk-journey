// Input configuration for UI display and documentation
export const INPUT_CONFIG = {
    movement: {
        title: 'Movement',
        controls: [
            { keys: ['KeyW', 'ArrowUp'], description: 'Move Forward' },
            { keys: ['KeyS', 'ArrowDown'], description: 'Move Backward' },
            { keys: ['KeyA', 'ArrowLeft'], description: 'Move Left' },
            { keys: ['KeyD', 'ArrowRight'], description: 'Move Right' }
        ]
    },
    actions: {
        title: 'Basic Actions',
        controls: [
            { keys: ['KeyH'], description: 'Basic Attack (Fist of Thunder)' },
            { keys: ['KeyE'], description: 'Interact with objects' },
            { keys: ['KeyY'], description: 'Toggle Inventory' },
            { keys: ['KeyT'], description: 'Toggle Skill Tree' },
            { keys: ['KeyG'], description: 'Start New Game' }
        ]
    },
    skills: {
        title: 'Skills',
        controls: [
            { keys: ['Digit1', 'KeyJ'], description: 'Skill 1' },
            { keys: ['Digit2', 'KeyK'], description: 'Skill 2' },
            { keys: ['Digit3', 'KeyL'], description: 'Skill 3' },
            { keys: ['Digit4', 'Semicolon'], description: 'Skill 4' },
            { keys: ['Digit5', 'KeyU'], description: 'Skill 5' },
            { keys: ['Digit6', 'KeyI'], description: 'Skill 6' },
            { keys: ['Digit7', 'KeyO'], description: 'Skill 7' }
        ]
    },
    ui: {
        title: 'UI Settings',
        controls: [
            { keys: ['KeyF'], description: 'Toggle HUD Visibility' },
            { keys: ['KeyM'], description: 'Toggle Mini Map' },
            { keys: ['BracketLeft'], description: 'Zoom In Mini Map' },
            { keys: ['BracketRight'], description: 'Zoom Out Mini Map' }
        ],
        joystick: {
            sizeMultiplier: 1, // Size multiplier (1 = 100% of defined size)
            baseSize: 150, // Base size in pixels
            handleSize: 60  // Handle size in pixels
        }
    }
};