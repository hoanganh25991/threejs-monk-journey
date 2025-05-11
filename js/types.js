/**
 * @fileoverview Type definitions for the game
 */

/**
 * @typedef {import('./core/game/Game.js').Game} Game
 * Game class that serves as a facade to the underlying game systems
 * @property {HTMLCanvasElement} canvas - The game canvas element
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
 * @method isPaused - Check if the game is currently paused
 * @method isRunning - Check if the game is currently running
 * @method hasStarted - Check if the game has been started at least once
 * @method init - Initialize the game
 * @method updateLoadingProgress - Update loading progress in the loading screen
 * @method setupEventListeners - Set up event listeners for window and document events
 * @method start - Start the game
 * @method pause - Pause the game
 * @method resume - Resume the game
 * @method togglePause - Toggle the game's pause state
 * @method animate - Game animation loop
 * @method onWindowResize - Handle window resize event
 * @method onVisibilityChange - Handle visibility change event
 * @method onPageHide - Handle page hide event (for mobile browsers)
 * @method onPageShow - Handle page show event (for mobile browsers)
 * @method onBlur - Handle window blur event
 * @method onFocus - Handle window focus event
 * @method createRenderer - Create a WebGLRenderer with settings for the specified quality level
 * @method applyRendererSettings - Apply renderer settings based on quality level
 */

/**
 * @typedef {import('./core/game/GameState.js').GameState} GameState
 * Manages the game state (running, paused, etc.)
 * @property {boolean} _isPaused - Whether the game is paused
 * @property {boolean} _hasStarted - Whether the game has been started at least once
 * 
 * @method isPaused - Check if the game is currently paused
 * @method isRunning - Check if the game is currently running
 * @method hasStarted - Check if the game has been started at least once
 * @method setPaused - Set the game to paused state
 * @method setRunning - Set the game to running state
 * @method togglePause - Toggle the game's pause state
 */

/**
 * @typedef {import('./core/game/GameEvents.js').GameEvents} GameEvents
 * Handles game events and event listeners
 * @property {Object.<string, Function[]>} eventListeners - Map of event names to arrays of callback functions
 * 
 * @method addEventListener - Add an event listener
 * @method removeEventListener - Remove an event listener
 * @method dispatch - Dispatch an event
 */

/**
 * @typedef {import('./core/game/LoadingManager.js').LoadingManager} LoadingManager
 * Service for managing asset loading
 * @property {THREE.LoadingManager} loadingManager - The THREE.js loading manager instance
 * 
 * @method getManager - Get the THREE.LoadingManager instance
 * @method setupLoadingManager - Set up loading manager events
 * @method onLoad - Set a callback for when all assets are loaded
 * @method onProgress - Set a callback for loading progress
 * @method onError - Set a callback for loading errors
 */

/**
 * @typedef {import('./core/hud-manager/HUDManager.js').HUDManager} HUDManager
 * Manages all UI components and provides a central interface for UI interactions
 * @property {Game} game - Reference to the game instance
 * @property {Object.<string, UIComponent>} components - Map of UI component names to instances
 * @property {HTMLElement} uiContainer - The UI container element
 * @property {MainBackground} mainBackground - The main background instance
 * 
 * @method init - Initialize the HUD Manager and all UI components
 * @method validateUIContainer - Validate that the UI container exists in the DOM
 * @method createMainBackground - Create the main background
 * @method createUIComponents - Create all UI components
 * @method update - Update all UI components
 * @method setBackgroundImage - Set a new background image
 * @method showNotification - Show a notification message
 * @method showDialog - Show a dialog with title and text
 * @method hideDialog - Hide the dialog
 * @method toggleInventory - Toggle inventory visibility
 * @method showDeathScreen - Show the death screen
 * @method hideDeathScreen - Hide the death screen
 * @method showLevelUp - Show level up animation
 * @method updateQuestLog - Update the quest log with active quests
 * @method createBleedingEffect - Create a bleeding effect at the given position (deprecated)
 * @method getJoystickDirection - Get the current joystick direction
 * @method toggleMiniMap - Toggle mini map visibility
 * @method setMiniMapScale - Set mini map scale
 * @method increaseMiniMapScale - Increase mini map scale (zoom out)
 * @method decreaseMiniMapScale - Decrease mini map scale (zoom in)
 * @method resizeMiniMap - Resize the mini map
 * @method hideAllUI - Hide all UI elements
 * @method showAllUI - Show all UI elements
 * @method toggleHUD - Toggle the visibility of all UI elements
 * @method handleGameStateChange - Handle game state changes
 */

/**
 * @typedef {import('./core/effects/EffectsManager.js').EffectsManager} EffectsManager
 * Manages all visual effects in the game
 * @property {Game} game - Reference to the game instance
 * @property {Array.<BleedingEffect>} effects - Array of active effects
 * 
 * @method init - Initialize the EffectsManager
 * @method update - Update all effects
 * @method createBleedingEffect - Create a bleeding effect at the given position
 * @method cleanupEffects - Clean up all effects
 */

/**
 * @typedef {Object} Vector3
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 */

/**
 * @typedef {Object} Vector2
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} RenderConfig
 * @property {Object} init - Initial renderer configuration
 * @property {boolean} init.antialias - Whether to use antialiasing
 * @property {string} init.powerPreference - Power preference ('high-performance', 'low-power', or 'default')
 * @property {string} init.precision - Shader precision ('highp', 'mediump', or 'lowp')
 * @property {boolean} init.stencil - Whether to use stencil buffer
 * @property {boolean} init.logarithmicDepthBuffer - Whether to use logarithmic depth buffer
 * @property {boolean} init.depth - Whether to use depth buffer
 * @property {boolean} init.alpha - Whether to use alpha channel
 * @property {Object} settings - Renderer settings
 * @property {number} settings.pixelRatio - Pixel ratio
 * @property {boolean} settings.shadowMapEnabled - Whether shadow maps are enabled
 * @property {string} settings.shadowMapType - Shadow map type ('PCFSoftShadowMap', 'PCFShadowMap', or 'BasicShadowMap')
 * @property {string} settings.outputColorSpace - Output color space ('SRGBColorSpace' or 'LinearSRGBColorSpace')
 */