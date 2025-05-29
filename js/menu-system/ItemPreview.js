/**
 * ItemPreview.js
 * Creates a preview of an item for the settings menu
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { updateAnimation } from '../utils/AnimationUtils.js';
import { ItemGenerator } from '../entities/items/ItemGenerator.js';

export class ItemPreview {
    /**
     * Create a new item preview
     * @param {HTMLElement} container - The container element
     * @param {number} width - The width of the preview
     * @param {number} height - The height of the preview
     * @param {import('../game/Game.js').Game} game - The game instance
     */
    constructor(container, width = 300, height = 300, game = null) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.game = game;
        
        // Create an item generator
        this.itemGenerator = new ItemGenerator(game);
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.visible = true;
        this.animations = {};
        this.currentAnimation = null;
        this.currentItem = null;
        this.loader = new GLTFLoader(); // Create a single loader instance
        
        // Create a wrapper to handle visibility
        this.wrapper = document.createElement('div');
        this.wrapper.style.width = `${width}px`;
        this.wrapper.style.height = `${height}px`;
        this.container.appendChild(this.wrapper);
        
        // Set up intersection observer to pause rendering when not visible
        this.setupVisibilityObserver();
        
        this.init();
    }
    
    /**
     * Set up visibility observer to pause rendering when not visible
     * @private
     */
    setupVisibilityObserver() {
        // For debugging - always set visible to true initially
        this.visible = true;
        
        // Create an intersection observer to detect when the preview is visible
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                console.debug('ItemPreview visibility changed:', entry.isIntersecting);
                this.visible = entry.isIntersecting;
                
                if (this.visible) {
                    // Resume animation when visible
                    if (!this.animationId) {
                        console.debug('ItemPreview: Resuming animation');
                        this.animate();
                    }
                } else {
                    // Pause animation when not visible
                    if (this.animationId) {
                        console.debug('ItemPreview: Pausing animation');
                        cancelAnimationFrame(this.animationId);
                        this.animationId = null;
                    }
                }
            });
        }, {
            root: null, // Use viewport as root
            threshold: 0.1 // Trigger when at least 10% is visible
        });
        
        // Start observing the container
        this.observer.observe(this.wrapper);
        console.debug('ItemPreview: Visibility observer set up');
    }
    
    /**
     * Initialize the preview
     * @private
     */
    init() {
        console.debug('ItemPreview: Initializing with dimensions', this.width, this.height);
        
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x111111);
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
            this.camera.position.set(0, 0, 5);
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            
            // Add renderer to wrapper
            this.wrapper.appendChild(this.renderer.domElement);
            console.debug('ItemPreview: Renderer added to wrapper');
            
            // Add orbit controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 10;
            this.controls.enablePan = true;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 1.0;
            
            // Add lights
            this.addLights();
            
            // Add ground plane
            this.addGround();
            
            // Start animation loop
            console.debug('ItemPreview: Starting animation loop');
            this.animate();
        } catch (error) {
            console.error('ItemPreview: Error during initialization:', error);
        }
    }
    
    /**
     * Add lights to the scene
     * @private
     */
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        
        this.scene.add(directionalLight);
    }
    
    /**
     * Add ground plane to the scene
     * @private
     */
    addGround() {
        // Create a ground plane
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        
        // Rotate and position the ground
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
    }
    
    /**
     * Load an item model
     * @param {Object} item - The item to load
     */
    loadItemModel(item) {
        console.log({item})
        // Remove existing model if any
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
        
        // Reset mixer and animations
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        
        // Store the current item
        this.currentItem = item;
        
        // Check if item has a visual model
        if (!item || !item.visual || !item.visual.model) {
            console.warn('ItemPreview: No model available for item', item ? item.name : 'unknown');
            this.createDefaultModel(item);
            return;
        }
        
        // The model path is already set by ItemGenerator in item.visual.model
        const modelPath = item.visual.model;
        
        // Load new model
        this.loader.load(
            modelPath,
            (gltf) => {
                this.model = gltf.scene;
                
                // Apply shadows to all meshes
                this.model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                
                // Set up animations if they exist
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    
                    // Store all animations
                    this.animations = {};
                    gltf.animations.forEach(animation => {
                        // Make sure animation has a name
                        if (!animation.name || animation.name === '') {
                            animation.name = `animation_${gltf.animations.indexOf(animation)}`;
                        }
                        
                        const action = this.mixer.clipAction(animation);
                        this.animations[animation.name] = action;
                    });
                    
                    // Play the first animation if we have any
                    const animationNames = Object.keys(this.animations);
                    if (animationNames.length > 0) {
                        const firstAnimName = animationNames[0];
                        this.animations[firstAnimName].play();
                        this.currentAnimation = firstAnimName;
                    }
                }
                
                // Scale the model
                const scale = 1.0;
                this.model.scale.set(scale, scale, scale);
                
                // Center the model
                this.centerModel();
                
                // Add to scene
                this.scene.add(this.model);
            },
            (xhr) => {
                console.debug(`Loading model: ${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            (error) => {
                console.error('Error loading model:', error);
                this.createDefaultModel(item);
            }
        );
    }
    
    /**
     * Create a default model for items without a 3D model
     * @param {Object} item - The item to create a default model for
     * @private
     */
    createDefaultModel(item) {
        // Create a simple geometry based on item type
        let geometry;
        
        if (!item) {
            // Default cube if no item
            geometry = new THREE.BoxGeometry(1, 1, 1);
        } else if (item.type === 'weapon') {
            if (item.subType === 'staff') {
                geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
            } else if (item.subType === 'dagger') {
                geometry = new THREE.BoxGeometry(0.15, 0.8, 0.05);
            } else if (item.subType === 'fist') {
                geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            } else {
                geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            }
        } else if (item.type === 'armor') {
            if (item.subType === 'robe') {
                geometry = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 8);
            } else if (item.subType === 'helmet') {
                geometry = new THREE.SphereGeometry(0.3, 16, 16);
            } else if (item.subType === 'gloves') {
                geometry = new THREE.BoxGeometry(0.4, 0.2, 0.2);
            } else if (item.subType === 'belt') {
                geometry = new THREE.BoxGeometry(0.6, 0.1, 0.1);
            } else if (item.subType === 'boots') {
                geometry = new THREE.BoxGeometry(0.3, 0.3, 0.5);
            } else {
                geometry = new THREE.SphereGeometry(0.5, 16, 16);
            }
        } else if (item.type === 'accessory') {
            if (item.subType === 'amulet') {
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
            } else if (item.subType === 'ring') {
                geometry = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
            } else if (item.subType === 'talisman') {
                geometry = new THREE.TetrahedronGeometry(0.3);
            } else {
                geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
            }
        } else if (item.type === 'consumable') {
            if (item.subType === 'potion') {
                geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16);
            } else if (item.subType === 'scroll') {
                geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
            } else if (item.subType === 'food') {
                geometry = new THREE.SphereGeometry(0.2, 16, 16);
            } else {
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
            }
        } else {
            geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        }
        
        // Create material based on item rarity
        let color = 0xffffff;
        if (item) {
            switch (item.rarity) {
                case 'common': color = 0xffffff; break;
                case 'uncommon': color = 0x1eff00; break;
                case 'rare': color = 0x0070dd; break;
                case 'epic': color = 0xa335ee; break;
                case 'legendary': color = 0xff8000; break;
                case 'mythic': color = 0xff0000; break;
            }
        }
        
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.5,
            metalness: 0.5
        });
        
        // Create mesh
        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        
        // Add to scene
        this.scene.add(this.model);
    }
    
    /**
     * Center the model in the scene
     * @private
     */
    centerModel() {
        if (!this.model) return;
        
        // Create a bounding box
        const box = new THREE.Box3().setFromObject(this.model);
        
        // Get the center of the bounding box
        const center = box.getCenter(new THREE.Vector3());
        
        // Move the model so its center is at the origin
        this.model.position.x = -center.x;
        this.model.position.z = -center.z;
        
        // Position the model so it's standing on the ground
        const size = box.getSize(new THREE.Vector3());
        this.model.position.y = -box.min.y;
        
        // Adjust camera position based on model size if needed
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > 2) {
            // For larger models, move camera back proportionally
            const distanceFactor = maxDimension / 2;
            this.camera.position.z = Math.min(10, 5.0 * distanceFactor);
            this.camera.updateProjectionMatrix();
        }
    }
    
    /**
     * Animation loop
     * @private
     */
    animate() {
        // Only continue animation if visible
        if (this.visible) {
            this.animationId = requestAnimationFrame(() => this.animate());
            
            // Update controls
            this.controls.update();
            
            // Update animations
            const delta = this.clock.getDelta();
            if (this.mixer) {
                updateAnimation(this.mixer, delta);
            }
            
            // Render scene
            try {
                this.renderer.render(this.scene, this.camera);
            } catch (error) {
                console.error('ItemPreview: Error rendering scene:', error);
            }
        } else {
            // If not visible, don't request another frame
            this.animationId = null;
        }
    }
    
    /**
     * Set the size of the preview
     * @param {number} width - The width of the preview
     * @param {number} height - The height of the preview
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        
        // Update camera aspect ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(width, height);
    }
    
    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    /**
     * Toggle auto-rotation
     * @param {boolean} enabled - Whether auto-rotation should be enabled
     */
    setAutoRotation(enabled) {
        this.controls.autoRotate = enabled;
    }
    
    /**
     * Set auto-rotation speed
     * @param {number} speed - The auto-rotation speed
     */
    setAutoRotationSpeed(speed) {
        this.controls.autoRotateSpeed = speed;
    }
    
    /**
     * Force restart animation
     */
    forceRestartAnimation() {
        if (this.mixer && this.currentAnimation && this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].reset().play();
        }
    }
    
    /**
     * Generate a random item using the ItemGenerator
     * @param {Object} options - Options for item generation
     * @returns {Object} - The generated item
     */
    generateRandomItem(options = {}) {
        if (!this.itemGenerator) {
            console.error('ItemPreview: ItemGenerator not initialized');
            return null;
        }
        
        // Generate the item using ItemGenerator
        // This will handle setting the model path in item.visual.model
        const item = this.itemGenerator.generateItem(options);
        
        // Load the item model
        this.loadItemModel(item);
        
        return item;
    }
    
    /**
     * Generate an item with specific properties
     * @param {string} type - Item type
     * @param {string} subType - Item subtype
     * @param {string} rarity - Item rarity
     * @param {number} level - Item level
     * @returns {Object} - The generated item
     */
    generateSpecificItem(type, subType, rarity, level = 1) {
        if (!this.itemGenerator) {
            console.error('ItemPreview: ItemGenerator not initialized');
            return null;
        }
        
        // Create options object for ItemGenerator
        const options = {
            type: type,
            subType: subType,
            rarity: rarity,
            level: level
        };
        
        return this.generateRandomItem(options);
    }
    
    /**
     * Get the current item
     * @returns {Object} - The current item
     */
    getCurrentItem() {
        return this.currentItem;
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Dispose of observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Dispose of controls
        if (this.controls) {
            this.controls.dispose();
        }
        
        // Dispose of model
        if (this.model) {
            this.scene.remove(this.model);
            this.model.traverse((node) => {
                if (node.isMesh) {
                    node.geometry.dispose();
                    if (node.material.map) node.material.map.dispose();
                    node.material.dispose();
                }
            });
        }
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.currentItem = null;
    }
}