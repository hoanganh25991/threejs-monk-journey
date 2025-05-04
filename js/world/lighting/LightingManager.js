import * as THREE from 'three';

/**
 * Manages world lighting
 */
export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        
        // Lighting collections
        this.lights = [];
        
        // Time of day
        this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
        this.dayNightCycle = true;
        this.dayNightCycleSpeed = 0.0001; // Speed of day/night cycle
    }
    
    /**
     * Initialize the lighting system
     */
    init() {
        this.createLights();
    }
    
    /**
     * Create lights for the world
     */
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        this.sunLight = directionalLight;
        
        // Add a hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3a7e4f, 0.6);
        this.scene.add(hemisphereLight);
        this.lights.push(hemisphereLight);
        this.skyLight = hemisphereLight;
    }
    
    /**
     * Update lighting based on time of day
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (this.dayNightCycle) {
            // Update time of day
            this.timeOfDay += this.dayNightCycleSpeed * deltaTime;
            if (this.timeOfDay > 1) {
                this.timeOfDay = 0;
            }
            
            // Update lighting based on time of day
            this.updateLightingForTimeOfDay();
        }
    }
    
    /**
     * Update lighting based on current time of day
     */
    updateLightingForTimeOfDay() {
        // Calculate sun position
        const sunAngle = Math.PI * 2 * this.timeOfDay - Math.PI / 2;
        const sunHeight = Math.sin(sunAngle);
        const sunDistance = 100;
        
        // Update sun position
        this.sunLight.position.set(
            Math.cos(sunAngle) * sunDistance,
            Math.max(0.1, sunHeight) * sunDistance,
            0
        );
        
        // Update sun intensity based on height
        const sunIntensity = Math.max(0, sunHeight);
        this.sunLight.intensity = sunIntensity;
        
        // Update ambient light based on time of day
        const ambientIntensity = 0.2 + sunIntensity * 0.3;
        this.lights[0].intensity = ambientIntensity;
        
        // Update sky light based on time of day
        const skyColor = new THREE.Color();
        const groundColor = new THREE.Color();
        
        if (sunHeight > 0) {
            // Day
            skyColor.setHSL(0.6, 1, 0.5 + sunHeight * 0.5);
            groundColor.setHSL(0.095, 0.5, 0.3 + sunHeight * 0.1);
        } else {
            // Night
            skyColor.setHSL(0.7, 0.8, Math.max(0.1, 0.3 + sunHeight * 0.2));
            groundColor.setHSL(0.095, 0.5, Math.max(0.1, 0.3 + sunHeight * 0.1));
        }
        
        this.skyLight.color.copy(skyColor);
        this.skyLight.groundColor.copy(groundColor);
        this.skyLight.intensity = 0.3 + sunIntensity * 0.3;
    }
    
    /**
     * Set the time of day
     * @param {number} time - Time of day (0-1)
     */
    setTimeOfDay(time) {
        this.timeOfDay = Math.max(0, Math.min(1, time));
        this.updateLightingForTimeOfDay();
    }
    
    /**
     * Toggle day/night cycle
     * @param {boolean} enabled - Whether the day/night cycle is enabled
     */
    setDayNightCycle(enabled) {
        this.dayNightCycle = enabled;
    }
    
    /**
     * Set day/night cycle speed
     * @param {number} speed - Speed of day/night cycle
     */
    setDayNightCycleSpeed(speed) {
        this.dayNightCycleSpeed = speed;
    }
    
    /**
     * Clear all lights
     */
    clear() {
        this.lights.forEach(light => {
            if (light.parent) {
                this.scene.remove(light);
            }
        });
        this.lights = [];
    }
}