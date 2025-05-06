/**
 * ModelPreview.js
 * Creates a preview of a 3D model for the settings menu
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ModelPreview {
    constructor(container, width = 300, height = 485) {
        this.container = container;
        this.width = width;
        this.height = height;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        
        // Create camera with wider field of view for better model visibility
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        // Position camera further back (z-axis) and slightly higher (y-axis) to see the whole model
        this.camera.position.set(0, 2.0, 6.0); // Zoomed out by 1.5x from original z=4 position
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Add renderer to container
        this.container.appendChild(this.renderer.domElement);
        
        // Add orbit controls with enhanced settings for better model viewing
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3; // Increased minimum distance to prevent clipping into model
        this.controls.maxDistance = 12; // Increased maximum distance for better zooming capability
        this.controls.enablePan = true; // Allow panning for better positioning
        this.controls.autoRotate = false; // Can be enabled for automatic rotation
        this.controls.autoRotateSpeed = 1.0; // Speed of auto-rotation if enabled
        
        // Add lights
        this.addLights();
        
        // Add ground plane
        this.addGround();
        
        // Start animation loop
        this.animate();
    }
    
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
    
    loadModel(modelPath, scale = 1.0) {
        // Remove existing model if any
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
        
        // Reset mixer
        this.mixer = null;
        
        // Load new model
        const loader = new GLTFLoader();
        loader.load(
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
                    
                    // Play the first animation
                    const action = this.mixer.clipAction(gltf.animations[0]);
                    action.play();
                }
                
                // Scale the model
                this.model.scale.set(scale, scale, scale);
                
                // Center the model
                this.centerModel();
                
                // Add to scene
                this.scene.add(this.model);
            },
            (xhr) => {
                console.log(`Loading model: ${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }
    
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
        if (maxDimension > 4) {
            // For larger models, move camera back proportionally
            const distanceFactor = maxDimension / 4;
            this.camera.position.z = Math.min(15, 6.0 * distanceFactor);
            this.camera.updateProjectionMatrix();
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Update animations
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Manual model rotation is now optional since we have auto-rotation in controls
        // We'll keep this commented out as we're using OrbitControls.autoRotate instead
        // if (this.model && !this.controls.autoRotate) {
        //     this.model.rotation.y += 0.005;
        // }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
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
     * Toggle auto-rotation of the model
     * @param {boolean} enabled - Whether auto-rotation should be enabled
     */
    toggleAutoRotation(enabled) {
        if (this.controls) {
            this.controls.autoRotate = enabled;
        }
    }
    
    /**
     * Set the rotation speed of the model
     * @param {number} speed - Rotation speed (default is 1.0)
     */
    setRotationSpeed(speed) {
        if (this.controls) {
            this.controls.autoRotateSpeed = speed;
        }
    }
    
    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.camera.position.set(0, 2.0, 6.0);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    dispose() {
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove renderer from container
        if (this.renderer && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        // Dispose of resources
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}