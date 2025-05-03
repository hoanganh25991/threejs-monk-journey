import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from './World.js';
import { Player } from '../entities/Player.js';
import { InputHandler } from './InputHandler.js';
import { UIManager } from '../ui/UIManager.js';
import { EnemyManager } from '../entities/EnemyManager.js';
import { CollisionManager } from './CollisionManager.js';
import { QuestManager } from './QuestManager.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { DifficultyManager } from './DifficultyManager.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.loadingManager = new THREE.LoadingManager();
        
        // Set up loading manager events
        this.setupLoadingManager();
    }
    
    async init() {
        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
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
        
        // Initialize world
        this.world = new World(this.scene, this.loadingManager);
        await this.world.init();
        
        // Initialize player
        this.player = new Player(this.scene, this.camera, this.loadingManager);
        this.player.setGame(this);
        await this.player.init();
        
        // Initialize input handler
        this.inputHandler = new InputHandler(this);
        
        // Initialize UI manager
        this.uiManager = new UIManager(this);
        this.uiManager.init();
        
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
        this.audioManager.init();
        
        // Initialize save manager
        this.saveManager = new SaveManager(this);
        this.saveManager.init();
        
        // Initialize difficulty manager
        this.difficultyManager = new DifficultyManager(this);
        this.difficultyManager.applyDifficultySettings();
        
        // Add axes helper for debugging
        const axesHelper = new THREE.AxesHelper(10);
        this.scene.add(axesHelper);
        console.log("Added axes helper to scene");
        
        // Add a grid helper for better spatial reference
        const gridHelper = new THREE.GridHelper(100, 100);
        this.scene.add(gridHelper);
        console.log("Added grid helper to scene");
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        return true;
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
        this.isRunning = true;
        this.clock.start();
        this.animate();
        
        // Start background music
        this.audioManager.playMusic();
        
        console.log("Game started successfully");
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update controls (only if enabled)
        if (this.controls.enabled) {
            this.controls.update();
        }
        
        // Update input handler for continuous skill casting
        this.inputHandler.update(delta);
        
        // Update player
        this.player.update(delta);
        
        // Update enemies
        this.enemyManager.update(delta);
        
        // Check collisions
        this.collisionManager.update();
        
        // Update UI
        this.uiManager.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Log rendering for debugging (only once)
        if (!this.hasLoggedRendering) {
            console.log("Rendering scene:", this.scene);
            console.log("Camera:", this.camera);
            console.log("Renderer:", this.renderer);
            this.hasLoggedRendering = true;
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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