/**
 * SkillPreview.js
 * Creates a preview of skill effects for the settings menu
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Skill } from '../../entities/skills/Skill.js';
import { SKILLS } from '../../config/skills.js';

export class SkillPreview {
    /**
     * Create a new skill preview
     * @param {HTMLElement} container - The container element
     * @param {number} width - Width of the preview
     * @param {number} height - Height of the preview
     */
    constructor(container, width = 300, height = 485) {
        this.container = container;
        this.width = width;
        this.height = height;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.skillEffect = null;
        this.currentSkill = null;
        this.currentSkillData = null;
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.isVisible = true;
        
        // Auto-play settings
        this.autoPlayEnabled = true;
        this.autoPlayInterval = 1; // seconds between skill effects
        this.autoPlayTimer = 0;
        
        // Check if there's an existing wrapper
        const existingWrapper = this.container.querySelector('#skills-preview-wrapper');
        
        if (existingWrapper) {
            // Use the existing wrapper
            this.wrapper = existingWrapper;
            this.wrapper.style.width = `${width}px`;
            this.wrapper.style.height = `${height}px`;
        } else {
            // Create a wrapper to handle visibility
            this.wrapper = document.createElement('div');
            this.wrapper.style.width = `${width}px`;
            this.wrapper.style.height = `${height}px`;
            this.container.appendChild(this.wrapper);
        }
        
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
        this.isVisible = true;
        
        // Create an intersection observer to detect when the preview is visible
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                console.debug('SkillPreview visibility changed:', entry.isIntersecting);
                this.isVisible = entry.isIntersecting;
                
                if (this.isVisible) {
                    // Resume animation when visible
                    if (!this.animationId) {
                        console.debug('SkillPreview: Resuming animation');
                        this.animate();
                    }
                } else {
                    // Pause animation when not visible
                    if (this.animationId) {
                        console.debug('SkillPreview: Pausing animation');
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
        console.debug('SkillPreview: Visibility observer set up');
    }
    
    /**
     * Initialize the skill preview
     * @private
     */
    init() {
        console.debug('SkillPreview: Initializing with dimensions', this.width, this.height);
        
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x111111);
            
            // Create camera with 3x zoom out and 45-degree angle
            this.camera = new THREE.PerspectiveCamera(+100, this.width / this.height, 0.1, 2000);
            
            // Position camera at 45-degree angle for better skill visibility
            // Using trigonometry to calculate x and z positions for a 45-degree angle
            const distance = 27.0;
            const angle = -Math.PI / 4 * 1.2; // 45 degrees in radians
            const x = distance * Math.sin(angle);
            const z = distance * Math.cos(angle);
            this.camera.position.set(x, 6.0, z); // Angled position with same distance
            this.camera.lookAt(0, 0, 0); // Ensure camera is looking at the center where the character is
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            
            // Add renderer to wrapper
            this.wrapper.appendChild(this.renderer.domElement);
            console.debug('SkillPreview: Renderer added to wrapper');
            
            // Add orbit controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 3;
            this.controls.maxDistance = 12;
            this.controls.enablePan = true;
            this.controls.target.set(0, 0, 0); // Ensure controls orbit around the center
            
            // Add lights
            this.addLights();
            
            // Add ground plane
            this.addGround();
            
            // Add character placeholder
            this.addCharacterPlaceholder();
            
            // Start animation loop
            console.debug('SkillPreview: Starting animation loop');
            this.animate();
            
            // Automatically set up the first skill if available
            this.setDefaultSkill();
        } catch (error) {
            console.error('SkillPreview: Error during initialization:', error);
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
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
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
     * Add a simple character placeholder to the scene
     * @private
     */
    addCharacterPlaceholder() {
        // Create a simple character placeholder
        const scale = 1.5;
        const characterGroup = new THREE.Group();
        
        // Body - doubled size
        const bodyGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 1.5 * scale, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4a6fa5 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75 * scale; // Adjusted position
        body.castShadow = true;
        characterGroup.add(body);
        
        // Head - doubled size
        const headGeometry = new THREE.SphereGeometry(0.25  * scale, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf5deb3 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.75  * scale; // Adjusted position
        head.castShadow = true;
        characterGroup.add(head);
        
        // Arms - doubled size
        const armGeometry = new THREE.CylinderGeometry(0.1  * scale, 0.1  * scale, 0.8  * scale, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x4a6fa5 });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5  * scale, 0.9  * scale, 0); // Adjusted position
        leftArm.rotation.z = Math.PI / 4;
        leftArm.castShadow = true;
        characterGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5  * scale, 0.9  * scale, 0); // Adjusted position
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.castShadow = true;
        characterGroup.add(rightArm);
        
        // Legs - doubled size
        const legGeometry = new THREE.CylinderGeometry(0.12  * scale, 0.12  * scale, 0.8  * scale, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a6fa5 });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2  * scale, 0.0, 0); // Adjusted position
        leftLeg.castShadow = true;
        characterGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2  * scale, 0.0, 0); // Adjusted position
        rightLeg.castShadow = true;
        characterGroup.add(rightLeg);
        
        // Add character to scene
        this.scene.add(characterGroup);
        this.characterPlaceholder = characterGroup;
    }
    
    /**
     * Set the default skill (first available skill)
     * @private
     */
    setDefaultSkill() {
        if (SKILLS && SKILLS.length > 0) {
            console.debug('SkillPreview: Setting up default skill:', SKILLS[0].name);
            this.createSkillEffect(SKILLS[0]);
            
            // Force the skill to play immediately
            if (this.currentSkill) {
                // Ensure the skill is active
                this.currentSkill.isActive = true;
                
                // Reset the auto-play timer to ensure continuous playback
                this.autoPlayTimer = 0;
            }
        }
    }
    
    /**
     * Create and display a skill effect
     * @param {Object} skillData - The skill data from SKILLS array
     */
    createSkillEffect(skillData) {
        // Remove existing skill effect if any
        this.removeSkillEffect();
        
        // Store the current skill data for auto-play
        this.currentSkillData = skillData;
        
        // Create a skill instance
        const skill = new Skill({
            name: skillData.name,
            description: skillData.description,
            type: skillData.type,
            damage: skillData.damage,
            manaCost: skillData.manaCost,
            cooldown: skillData.cooldown,
            range: skillData.range,
            radius: skillData.radius,
            duration: skillData.duration,
            color: skillData.color,
            hits: skillData.hits || 1,
            sounds: skillData.sounds || {}
        });
        
        // Store the current skill
        this.currentSkill = skill;
        
        // Reset auto-play timer when a new skill is created
        this.autoPlayTimer = 0;
        
        // Set a mock game object to prevent errors
        skill.game = {
            audioManager: {
                playSound: (sound) => {
                    console.debug(`Playing sound: ${sound}`);
                    return true;
                }
            }
        };
        
        try {
            // Get character position and rotation
            const characterPosition = new THREE.Vector3();
            this.characterPlaceholder.getWorldPosition(characterPosition);
            
            // Add height offset to prevent skills from appearing under the ground
            // Increased to match the doubled character size
            characterPosition.y += 1.0;
            
            // Create the skill effect
            const effect = skill.createEffect(
                characterPosition,
                { y: 0 } // Forward direction
            );
            
            // Add effect to scene
            if (effect) {
                this.scene.add(effect);
                this.skillEffect = effect;
                console.debug(`Created skill effect for: ${skillData.name}`);
            }
        } catch (error) {
            console.error(`Error creating skill effect for ${skillData.name}:`, error);
        }
    }
    
    /**
     * Remove the current skill effect
     */
    removeSkillEffect() {
        if (this.skillEffect) {
            this.scene.remove(this.skillEffect);
            
            // Dispose of geometries and materials
            this.skillEffect.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            
            this.skillEffect = null;
        }
        
        // Also reset the current skill
        if (this.currentSkill) {
            this.currentSkill.remove();
            this.currentSkill = null;
        }
    }
    
    /**
     * Animation loop
     * @private
     */
    animate() {
        // Only continue animation if visible
        if (this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.animate());
            
            // Get delta time
            const delta = this.clock.getDelta();
            
            // Update controls
            this.controls.update();
            
            // Update skill effect
            if (this.currentSkill && this.currentSkill.isActive) {
                this.currentSkill.update(delta);
            } else if (this.autoPlayEnabled && this.currentSkillData) {
                // Handle auto-play functionality
                this.autoPlayTimer += delta;
                
                // If the timer exceeds the interval, replay the skill effect
                if (this.autoPlayTimer >= this.autoPlayInterval) {
                    this.autoPlayTimer = 0;
                    
                    // Recreate the skill effect to restart the animation
                    console.debug('Auto-playing skill effect:', this.currentSkillData.name);
                    this.createSkillEffect(this.currentSkillData);
                }
            }
            
            // Render scene
            try {
                this.renderer.render(this.scene, this.camera);
            } catch (error) {
                console.error('SkillPreview: Error rendering scene:', error);
            }
        } else {
            // If not visible, don't request another frame
            this.animationId = null;
        }
    }
    
    /**
     * Set the size of the preview
     * @param {number} width - New width
     * @param {number} height - New height
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
        this.camera.position.set(0, 6.0, 27.0); // Match the 3x zoomed out position
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove skill effect
        this.removeSkillEffect();
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Remove DOM elements
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}