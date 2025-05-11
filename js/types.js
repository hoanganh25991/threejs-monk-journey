/**
 * @fileoverview Type definitions for the game
 */

/**
 * @typedef {import('./core/game/Game.js').Game} Game
 * Game class that serves as a facade to the underlying game systems
 * @property {THREE.Clock} clock - The game clock
 * @property {boolean} debugMode - Whether debug mode is enabled
 * @property {boolean} animationLoopStarted - Flag to prevent multiple animation loops
 * @property {GameState} state - The game state manager
 * @property {GameEvents} events - The game events manager
 * @property {THREE.LoadingManager} loadingManager - The THREE.js loading manager
 * @property {HTMLElement} loadingScreen - Reference to the loading screen element
 * @property {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @property {THREE.Scene} scene - The game scene
 * @property {THREE.PerspectiveCamera} camera - The game camera
 * @property {OrbitControls} controls - The orbit controls
 * @property {PerformanceManager} performanceManager - The performance manager
 * @property {WorldManager} world - The world manager
 * @property {Player} player - The player instance
 * @property {InputHandler} inputHandler - The input handler
 * @property {EffectsManager} effectsManager - The effects manager
 * @property {HUDManager} uiManager - The UI manager
 * @property {EnemyManager} enemyManager - The enemy manager
 * @property {CollisionManager} collisionManager - The collision manager
 * @property {QuestManager} questManager - The quest manager
 * @property {AudioManager} audioManager - The audio manager
 * @property {SaveManager} saveManager - The save manager
 * @property {DifficultyManager} difficultyManager - The difficulty manager
 * 
 * @method addEventListener - Add an event listener
 * @method removeEventListener - Remove an event listener
 * @method init - Initialize the game
 * @method updateLoadingProgress - Update loading progress in the loading screen
 * @method setupEventListeners - Set up event listeners for window and document events
 * @method start - Start the game
 * @method pause - Pause the game
 * @method resume - Resume the game
 * @method togglePause - Toggle the game's pause state
 * @method animate - Game animation loop
 */