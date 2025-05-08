import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WorldManager } from '../../world/WorldManager.js';
import { Player } from '../../entities/player/Player.js';
import { InputHandler } from '../InputHandler.js';
import { HUDManager } from '../HUDManager.js';
import { EnemyManager } from '../../entities/EnemyManager.js';
import { CollisionManager } from '../CollisionManager.js';
import { QuestManager } from '../QuestManager.js';
import { AudioManager } from '../AudioManager.js';
import { SaveManager } from '../SaveManager.js';
import { DifficultyManager } from '../DifficultyManager.js';
import { PerformanceManager } from '../PerformanceManager.js';
import { GameState } from './GameState.js';
import { GameEvents } from './GameEvents.js';
import { SceneOptimizer } from './SceneOptimizer.js';
import { LoadingManager } from './LoadingManager.js';

/**
 * Main Game class that serves as a facade to the underlying game systems
 */
export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.debugMode = false; // Set to true to enable debug logging
        
        // Initialize sub-systems
        this.state = new GameState();
        this.events = new GameEvents();
        this.loadingManager = new LoadingManager().getManager();
    }
    
    /**
     * Add an event listener
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     */
    addEventListener(event, callback) {
        this.events.addEventListener(event, callback);
    }
    
    /**
     * Remove an event listener
     * @param {string} event - The event name
     * @param {Function} callback - The callback function to remove
     */
    removeEventListener(event, callback) {
        this.events.removeEventListener(event, callback);
    }
    
    /**
     * Check if the game is currently paused
     * @returns {boolean} True if the game is paused
     */
    get isPaused() {
        return this.state.isPaused();
    }
    
    /**
     * Check if the game is currently running
     * @returns {boolean} True if the game is running
     */
    get isRunning() {
        return this.state.isRunning();
    }
    
    /**
     * Initialize the game
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async init() {
        // Initialize renderer with GPU acceleration options
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'highp',
            stencil: false // Disable stencil buffer if not needed
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Correct color space
        
        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Light blue sky color
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.002); // Reduced fog density
        
        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 10, 20);
        
        // Initialize orbit controls (for development)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
        
        // Initialize performance manager (before other systems)
        this.performanceManager = new PerformanceManager(this);
        this.performanceManager.init();
        
        // Initialize world
        this.world = new WorldManager(this.scene, this.loadingManager);
        this.world.setGame(this);
        await this.world.init();
        
        // Initialize player
        this.player = new Player(this.scene, this.camera, this.loadingManager);
        this.player.setGame(this);
        await this.player.init();
        
        // Apply selected model and size if available from main.js
        if (window.selectedModelId) {
            await this.player.model.setModel(window.selectedModelId);
        }
        if (window.selectedSizeMultiplier) {
            this.player.model.setSizeMultiplier(window.selectedSizeMultiplier);
        }
        
        // Ensure game reference is set after initialization
        this.player.setGame(this);
        
        // Initialize input handler
        this.inputHandler = new InputHandler(this);
        
        // Initialize UI manager
        this.uiManager = new HUDManager(this);
        await this.uiManager.init();
        
        // Initialize enemy manager
        this.enemyManager = new EnemyManager(this.scene, this.player, this.loadingManager);
        this.enemyManager.setGame(this);
        await this.enemyManager.init();
        
        // Initialize collision manager
        this.collisionManager = new CollisionManager(this.player, this.enemyManager, this.world);
        
        // Initialize quest manager
        this.questManager = new QuestManager(this);
        
        // Initialize audio manager
        this.audioManager = new AudioManager(this);
        await this.audioManager.init();
        
        // Initialize save manager
        this.saveManager = new SaveManager(this);
        await this.saveManager.init();
        
        // Initialize difficulty manager
        this.difficultyManager = new DifficultyManager(this);
        this.difficultyManager.applyDifficultySettings();
        
        // Apply performance optimizations to the scene
        SceneOptimizer.optimizeScene(this.scene);
        
        // Set up event listeners
        this.setupEventListeners();
        
        return true;
    }
    
    /**
     * Set up event listeners for window and document events
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Handle visibility change events (for auto-pausing music)
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Handle mobile-specific events
        window.addEventListener('pagehide', () => this.onPageHide());
        window.addEventListener('pageshow', () => this.onPageShow());
        
        // Handle blur/focus events (additional fallback for some browsers)
        window.addEventListener('blur', () => this.onBlur());
        window.addEventListener('focus', () => this.onFocus());
    }
    
    /**
     * Start the game
     */
    start() {
        console.log("Game starting...");
        
        // Make sure the canvas is visible
        this.canvas.style.display = 'block';
        
        // Reset camera position if needed
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);
        
        // Disable orbit controls when game starts
        this.controls.enabled = false;
        
        // Reset player position
        this.player.setPosition(0, 2, 0);
        
        // Start the game loop
        this.state.setRunning();
        this.clock.start();
        this.animate();
        
        // Start background music
        this.audioManager.playMusic();
        
        // Dispatch event that game has started
        this.events.dispatch('gameStateChanged', 'running');
        
        console.log("Game started successfully");
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.state.setPaused();
        this.events.dispatch('gameStateChanged', 'paused');
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (this.state.isPaused()) {
            this.state.setRunning();
            this.events.dispatch('gameStateChanged', 'running');
        }
    }
    
    /**
     * Toggle the game's pause state
     * @returns {boolean} The new pause state (true if paused)
     */
    togglePause() {
        const isPaused = this.state.togglePause();
        this.events.dispatch('gameStateChanged', isPaused ? 'paused' : 'running');
        console.log(`Game ${isPaused ? 'paused' : 'resumed'}`);
        return isPaused;
    }
    
    /**
     * Game animation loop
     */
    animate() {
        // Always continue the animation loop regardless of pause state
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update performance manager first
        this.performanceManager.update(delta);
        
        // Update controls (only if enabled)
        if (this.controls.enabled) {
            this.controls.update();
        }
        
        // If game is paused, only render the scene but don't update game logic
        if (this.state.isPaused()) {
            // Just render the scene
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        // Update input handler for continuous skill casting
        this.inputHandler.update(delta);
        
        // Update player
        this.player.update(delta);
        
        // Update world based on player position
        // Use performance-based draw distance
        const drawDistance = this.performanceManager.getDrawDistanceMultiplier();
        this.world.updateWorldForPlayer(this.player.getPosition(), drawDistance);
        
        // Update enemies
        this.enemyManager.update(delta);
        
        // Check collisions
        this.collisionManager.update();
        
        // Update UI
        this.uiManager.update();
        
        // Render scene with potential optimizations
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Handle window resize event
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Handle visibility change event
     */
    onVisibilityChange() {
        // Handle visibility change for audio
        if (this.audioManager) {
            this.audioManager.handleVisibilityChange();
        }
        
        // Optionally pause/resume game loop
        if (document.hidden || document.visibilityState === 'hidden') {
            this.pause();
        } else {
            this.resume();
        }
    }
    
    /**
     * Handle page hide event (for mobile browsers)
     */
    onPageHide() {
        // Additional handler for mobile browsers
        if (this.audioManager && this.audioManager.isAutoPauseEnabled()) {
            const wasPlaying = this.audioManager.isMusicPlaying();
            if (wasPlaying) {
                this.audioManager.pauseMusic();
                console.log('Music paused due to page hide event');
            }
        }
        
        // Pause game loop
        this.pause();
    }
    
    /**
     * Handle page show event (for mobile browsers)
     */
    onPageShow() {
        // Resume game loop
        this.resume();
        
        // Let visibility change handler handle audio resumption
        this.onVisibilityChange();
    }
    
    /**
     * Handle window blur event
     */
    onBlur() {
        // Additional fallback for some browsers
        if (this.audioManager && this.audioManager.isAutoPauseEnabled()) {
            const wasPlaying = this.audioManager.isMusicPlaying();
            if (wasPlaying) {
                this.audioManager.pauseMusic();
                console.log('Music paused due to window blur event');
            }
        }
    }
    
    /**
     * Handle window focus event
     */
    onFocus() {
        // Let visibility change handler handle audio resumption
        this.onVisibilityChange();
    }
}