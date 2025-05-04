import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WorldManager } from '../world/WorldManager.js';
import { Player } from '../entities/Player.js';
import { InputHandler } from './InputHandler.js';
import { UIManager } from '../ui/UIManager.js';
import { EnemyManager } from '../entities/EnemyManager.js';
import { CollisionManager } from './CollisionManager.js';
import { QuestManager } from './QuestManager.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { DifficultyManager } from './DifficultyManager.js';
import { PerformanceManager } from './PerformanceManager.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.isPaused = true; // Game starts in paused state
        this.loadingManager = new THREE.LoadingManager();
        this.debugMode = false; // Set to true to enable debug logging
        
        // Event listeners for game state changes
        this.eventListeners = {};
        
        // Set up loading manager events
        this.setupLoadingManager();
    }
    
    // Add event listener
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    // Remove event listener
    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }
    
    // Dispatch event
    dispatchEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    // Computed property - isRunning is the opposite of isPaused
    get isRunning() {
        return !this.isPaused;
    }
    
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
        
        // Initialize input handler
        this.inputHandler = new InputHandler(this);
        
        // Initialize UI manager
        this.uiManager = new UIManager(this);
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
        this.optimizeScene();
        
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
        
        return true;
    }
    
    optimizeScene() {
        // Apply scene-wide optimizations
        this.scene.traverse(object => {
            if (object.isMesh) {
                // Enable frustum culling
                object.frustumCulled = true;
                
                // Optimize shadows
                if (object.castShadow) {
                    object.castShadow = true;
                    // Only update shadow when object moves
                    object.matrixAutoUpdate = true;
                }
                
                // Optimize materials
                if (object.material) {
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    
                    materials.forEach(material => {
                        // Set precision based on device capability
                        material.precision = 'mediump';
                        
                        // Only use fog if scene has fog
                        material.fog = !!this.scene.fog;
                        
                        // Optimize textures if present
                        if (material.map) {
                            material.map.anisotropy = 1;
                        }
                    });
                }
            }
            
            // Optimize lights
            if (object.isLight) {
                if (object.shadow) {
                    // Set initial shadow map size based on performance level
                    object.shadow.mapSize.width = 1024;
                    object.shadow.mapSize.height = 1024;
                    
                    // Optimize shadow camera frustum
                    if (object.shadow.camera) {
                        // Tighten shadow camera frustum to scene size
                        const camera = object.shadow.camera;
                        if (camera.isOrthographicCamera) {
                            // Adjust based on scene size
                            const size = 20;
                            camera.left = -size;
                            camera.right = size;
                            camera.top = size;
                            camera.bottom = -size;
                            camera.updateProjectionMatrix();
                        }
                    }
                }
            }
        });
        
        console.log("Scene optimizations applied");
    }
    
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
        this.isPaused = false; // Unpause the game (isRunning becomes true)
        this.clock.start();
        this.animate();
        
        // Start background music
        this.audioManager.playMusic();
        
        // Dispatch event that game has started
        this.dispatchEvent('gameStateChanged', 'running');
        
        console.log("Game started successfully");
    }
    
    pause() {
        this.isPaused = true;
        // isRunning is now automatically false via the getter
        
        // Dispatch event that game has paused
        this.dispatchEvent('gameStateChanged', 'paused');
    }
    
    resume() {
        if (this.isPaused) {
            this.isPaused = false; // isRunning becomes true via the getter
            this.animate();
            
            // Dispatch event that game has resumed
            this.dispatchEvent('gameStateChanged', 'running');
        }
    }
    
    // Method to toggle pause state without stopping animation loop
    togglePause() {
        this.isPaused = !this.isPaused;
        
        // Dispatch event based on new state
        this.dispatchEvent('gameStateChanged', this.isPaused ? 'paused' : 'running');
        
        console.log(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
        return this.isPaused;
    }
    
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
        if (this.isPaused) {
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
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
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
    
    onPageShow() {
        // Resume game loop
        this.resume();
        
        // Let visibility change handler handle audio resumption
        this.onVisibilityChange();
    }
    
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
    
    onFocus() {
        // Let visibility change handler handle audio resumption
        this.onVisibilityChange();
    }
    
    setupLoadingManager() {
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            const loadingBar = document.getElementById('loading-bar');
            if (loadingBar) {
                loadingBar.style.width = `${progress}%`;
            }
        };
        
        this.loadingManager.onError = (url) => {
            console.error('Error loading:', url);
        };
    }
}