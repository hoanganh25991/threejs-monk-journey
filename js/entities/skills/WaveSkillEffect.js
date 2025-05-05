import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for wave-based skills
 */
export class WaveSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.waveSpeed = 10; // Units per second
        this.waveWidth = 3.0;
        this.waveHeight = 1.5;
        this.initialPosition = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.distanceTraveled = 0;
        this.bellCreated = false;
    }

    /**
     * Create a wave effect
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to travel
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store initial position and direction for movement
        this.initialPosition.copy(position);
        this.direction.copy(direction);
        this.distanceTraveled = 0;
        
        // Check if this is the Wave of Light skill (bell)
        if (this.skill.name === 'Wave of Light') {
            this._createBellEffect(effectGroup);
            this.bellCreated = true;
        } else {
            // Create the standard wave effect for other wave-type skills
            this._createWaveEffect(effectGroup);
        }
        
        // Position effect
        effectGroup.position.copy(position);
        effectGroup.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the bell effect for Wave of Light
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    _createBellEffect(effectGroup) {
        // Create bell group
        const bellGroup = new THREE.Group();
        
        // Create the bell shape
        const bellGeometry = new THREE.CylinderGeometry(
            1.0,  // Top radius (narrower at top)
            2.0,  // Bottom radius (wider at bottom)
            2.5,  // Height
            16,   // Radial segments
            3,    // Height segments
            false // Closed ends
        );
        
        const bellMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37, // Gold color for bell
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xD4AF37,
            emissiveIntensity: 0.3
        });
        
        const bell = new THREE.Mesh(bellGeometry, bellMaterial);
        bell.position.y = 5; // Start high above
        bellGroup.add(bell);
        
        // Create bell handle/top
        const handleGeometry = new THREE.CylinderGeometry(
            0.3, // Top radius
            0.3, // Bottom radius
            0.5, // Height
            8    // Radial segments
        );
        
        const handle = new THREE.Mesh(handleGeometry, bellMaterial);
        handle.position.y = 6.5; // Position on top of bell
        bellGroup.add(handle);
        
        // Create bell striker (inside the bell)
        const strikerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const strikerMaterial = new THREE.MeshStandardMaterial({
            color: 0xA67C00, // Darker gold
            metalness: 0.7,
            roughness: 0.3
        });
        
        const striker = new THREE.Mesh(strikerGeometry, strikerMaterial);
        striker.position.y = 4.2; // Position inside the bell
        bellGroup.add(striker);
        
        // Create glowing aura around the bell
        const auraGeometry = new THREE.SphereGeometry(2.5, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.position.y = 5; // Same height as bell
        bellGroup.add(aura);
        
        // Add particles around the bell
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.0 + (Math.random() * 1.0);
            const height = 4 + (Math.random() * 2.5);
            
            const particleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6 + (Math.random() * 0.4)
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            particle.userData = {
                initialPos: particle.position.clone(),
                speed: 0.5 + (Math.random() * 1.5),
                phase: Math.random() * Math.PI * 2
            };
            
            bellGroup.add(particle);
            particles.push(particle);
        }
        
        // Add light rays emanating from the bell
        const rayCount = 8;
        const rays = [];
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            
            const rayGeometry = new THREE.CylinderGeometry(
                0.1,  // Top radius
                0.3,  // Bottom radius
                3.0,  // Height
                8,    // Radial segments
                1,    // Height segments
                false // Closed ends
            );
            
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.5
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            
            // Position and rotate the ray to point outward
            ray.position.set(
                Math.cos(angle) * 1.5,
                5, // Same height as bell
                Math.sin(angle) * 1.5
            );
            
            ray.rotation.z = Math.PI / 2; // Lay flat
            ray.rotation.y = -angle; // Point outward
            
            // Store animation data
            ray.userData = {
                angle: angle,
                initialLength: 3.0
            };
            
            bellGroup.add(ray);
            rays.push(ray);
        }
        
        // Add shockwave ring for when the bell hits the ground
        const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.0, // Start invisible
            side: THREE.DoubleSide
        });
        
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.rotation.x = -Math.PI / 2; // Lay flat on ground
        shockwave.position.y = 0.1; // Slightly above ground
        bellGroup.add(shockwave);
        
        // Store bell animation state
        this.bellState = {
            bell: bell,
            handle: handle,
            striker: striker,
            aura: aura,
            particles: particles,
            rays: rays,
            shockwave: shockwave,
            phase: 'descending', // Initial phase: bell is descending
            impactTime: 0.8, // Time when bell hits ground
            ringingDuration: 1.5, // How long the bell rings after impact
            shockwaveStart: 0.8, // When shockwave starts (same as impact)
            shockwaveGrowDuration: 0.5 // How long shockwave expands
        };
        
        // Add bell group to effect group
        effectGroup.add(bellGroup);
    }

    /**
     * Create the wave effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    _createWaveEffect(effectGroup) {
        try {
            // Create main wave group
            const waveGroup = new THREE.Group();
            
            // Create the main wave shape
            const waveGeometry = new THREE.CylinderGeometry(
                this.waveWidth, // Top radius
                this.waveWidth * 0.8, // Bottom radius
                this.waveHeight, // Height
                32, // Radial segments
                1, // Height segments
                true // Open-ended
            );
            
            const waveMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                metalness: 0.2,
                roughness: 0.3
            });
            
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = Math.PI / 2;
            wave.scale.z = 0.3; // Make it thinner
            waveGroup.add(wave);
            
            // Add energy ring at the front of the wave
            const ringGeometry = new THREE.TorusGeometry(this.waveWidth * 0.9, 0.2, 16, 32);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.skill.color,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 0.8
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.z = this.waveHeight / 2;
            waveGroup.add(ring);
            
            // Add particles around the wave
            const particleCount = 30;
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Random position around the wave
                const angle = Math.random() * Math.PI * 2;
                const radius = this.waveWidth * (0.7 + Math.random() * 0.3);
                const height = (Math.random() * this.waveHeight) - (this.waveHeight / 2);
                
                // Create particle
                const particleSize = 0.05 + (Math.random() * 0.15);
                const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: this.skill.color,
                    transparent: true,
                    opacity: 0.6 + (Math.random() * 0.4)
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    height
                );
                
                // Store initial position for animation
                particle.userData = {
                    initialPos: particle.position.clone(),
                    speed: 0.5 + (Math.random() * 1.5),
                    direction: new THREE.Vector3(
                        (Math.random() * 2) - 1,
                        (Math.random() * 2) - 1,
                        (Math.random() * 2) - 1
                    ).normalize()
                };
                
                waveGroup.add(particle);
                particles.push(particle);
            }
            
            // Add central energy core
            const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const coreMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.skill.color,
                emissiveIntensity: 2.0,
                transparent: true,
                opacity: 0.9
            });
            
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            waveGroup.add(core);
            
            // Add trailing wake behind the wave
            const wakeGeometry = new THREE.PlaneGeometry(this.waveWidth * 2, this.waveHeight * 2);
            const wakeMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const wake = new THREE.Mesh(wakeGeometry, wakeMaterial);
            wake.rotation.x = Math.PI / 2;
            wake.position.z = -this.waveHeight;
            waveGroup.add(wake);
            
            // Add the wave group to the effect group
            effectGroup.add(waveGroup);
            
            // Store wave animation state
            this.waveState = {
                wave: wave,
                ring: ring,
                core: core,
                wake: wake,
                particles: particles,
                age: 0
            };
        } catch (error) {
            console.error(`Error in _createWaveEffect: ${error.message}`);
            
            // Create a simple fallback wave
            const fallbackGeometry = new THREE.SphereGeometry(1, 16, 16);
            const fallbackMaterial = new THREE.MeshBasicMaterial({ 
                color: this.skill.color,
                transparent: true,
                opacity: 0.7
            });
            const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            effectGroup.add(fallbackMesh);
            
            // Initialize waveState to prevent errors in update
            this.waveState = {
                age: 0,
                particles: []
            };
        }
    }

    /**
     * Update the wave effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        try {
            this.elapsedTime += delta;
            
            // Check if effect has expired
            if (this.elapsedTime >= this.skill.duration) {
                this.isActive = false;
                return;
            }
            
            // Handle different updates based on effect type
            if (this.bellCreated) {
                this._updateBellAnimation(delta);
            } else {
                // Move wave forward
                const moveDistance = this.waveSpeed * delta;
                this.effect.position.x += this.direction.x * moveDistance;
                this.effect.position.z += this.direction.z * moveDistance;
                
                // Update distance traveled
                this.distanceTraveled += moveDistance;
                
                // Check if wave has reached maximum range
                if (this.distanceTraveled >= this.skill.range) {
                    this.isActive = false;
                    return;
                }
                
                // Update standard wave animation
                this._updateWaveAnimation(delta);
            }
        } catch (error) {
            console.error(`Error updating effect: ${error.message}`);
            
            // Mark as inactive to prevent further errors
            this.isActive = false;
        }
    }

    /**
     * Update the bell animation for Wave of Light
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateBellAnimation(delta) {
        if (!this.bellState) return;
        
        const state = this.bellState;
        
        // Handle different phases of the bell animation
        if (state.phase === 'descending') {
            // Bell is falling from the sky
            const progress = Math.min(this.elapsedTime / state.impactTime, 1.0);
            const easeInQuad = progress * progress; // Ease-in for acceleration
            
            // Move bell downward
            state.bell.position.y = 5 * (1 - easeInQuad);
            state.handle.position.y = 6.5 * (1 - easeInQuad) + state.bell.position.y;
            state.striker.position.y = 4.2 * (1 - easeInQuad) + state.bell.position.y * 0.2;
            state.aura.position.y = state.bell.position.y;
            
            // Rotate bell slightly as it falls
            state.bell.rotation.x = progress * 0.2;
            
            // When bell hits the ground
            if (progress >= 1.0) {
                state.phase = 'ringing';
                
                // Make shockwave visible
                state.shockwave.material.opacity = 0.8;
            }
        } else if (state.phase === 'ringing') {
            // Bell is ringing after impact
            const ringProgress = (this.elapsedTime - state.impactTime) / state.ringingDuration;
            
            if (ringProgress <= 1.0) {
                // Bell vibration effect
                const vibrationSpeed = 20;
                const vibrationAmount = 0.05 * (1 - ringProgress); // Diminishing vibration
                state.bell.rotation.x = Math.sin(this.elapsedTime * vibrationSpeed) * vibrationAmount;
                
                // Striker movement
                const strikerSpeed = 15;
                const strikerAmount = 0.2 * (1 - ringProgress); // Diminishing movement
                state.striker.position.x = Math.sin(this.elapsedTime * strikerSpeed) * strikerAmount;
                
                // Pulse aura
                const auraPulse = 1.0 + Math.sin(this.elapsedTime * 10) * 0.2;
                state.aura.scale.set(auraPulse, auraPulse, auraPulse);
                state.aura.material.opacity = 0.3 * (1 - ringProgress * 0.5);
            } else {
                // Ringing is complete, start fading
                state.phase = 'fading';
            }
            
            // Update shockwave during ringing phase
            const shockwaveProgress = (this.elapsedTime - state.shockwaveStart) / state.shockwaveGrowDuration;
            if (shockwaveProgress <= 1.0) {
                // Expand shockwave
                const size = 0.2 + shockwaveProgress * 10.0; // Grow from 0.2 to 10.2
                state.shockwave.scale.set(size, size, 1);
                
                // Fade shockwave as it expands
                state.shockwave.material.opacity = 0.8 * (1 - shockwaveProgress);
            }
        } else if (state.phase === 'fading') {
            // Bell is fading away
            const fadeProgress = (this.elapsedTime - (state.impactTime + state.ringingDuration)) / 0.5;
            const opacity = 1.0 - Math.min(fadeProgress, 1.0);
            
            // Fade all bell components
            if (state.bell.material) state.bell.material.opacity = opacity;
            if (state.handle.material) state.handle.material.opacity = opacity;
            if (state.striker.material) state.striker.material.opacity = opacity;
            if (state.aura.material) state.aura.material.opacity = opacity * 0.3;
            
            // When fully faded, mark as inactive
            if (fadeProgress >= 1.0) {
                this.isActive = false;
            }
        }
        
        // Always update particles
        for (const particle of state.particles) {
            if (particle && particle.userData) {
                const initialPos = particle.userData.initialPos;
                const speed = particle.userData.speed;
                const phase = particle.userData.phase;
                
                // Spiral movement upward during ringing phase
                if (state.phase === 'ringing' || state.phase === 'fading') {
                    particle.position.y += delta * speed;
                    
                    // Spiral outward
                    const angle = this.elapsedTime * speed + phase;
                    const radius = initialPos.distanceTo(new THREE.Vector3(0, initialPos.y, 0)) + 
                                  (this.elapsedTime * 0.5);
                    
                    particle.position.x = Math.cos(angle) * radius;
                    particle.position.z = Math.sin(angle) * radius;
                    
                    // Fade particles over time
                    if (particle.material) {
                        particle.material.opacity = Math.max(0, particle.material.opacity - (delta * 0.2));
                    }
                }
            }
        }
        
        // Update light rays
        for (const ray of state.rays) {
            if (ray && ray.userData) {
                const angle = ray.userData.angle;
                
                if (state.phase === 'descending') {
                    // Rays follow bell down
                    ray.position.y = state.bell.position.y;
                } else if (state.phase === 'ringing') {
                    // Rays extend outward during ringing
                    const extensionFactor = 1.0 + (this.elapsedTime - state.impactTime) * 2;
                    ray.scale.y = extensionFactor;
                    
                    // Pulse rays
                    const pulse = 1.0 + Math.sin(this.elapsedTime * 10 + angle) * 0.2;
                    ray.scale.x = pulse;
                    ray.scale.z = pulse;
                } else if (state.phase === 'fading') {
                    // Fade rays
                    if (ray.material) {
                        ray.material.opacity = Math.max(0, ray.material.opacity - (delta * 0.5));
                    }
                }
            }
        }
    }

    /**
     * Update the wave animation
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateWaveAnimation(delta) {
        if (!this.waveState) return;
        
        this.waveState.age += delta;
        
        // Animate particles
        for (const particle of this.waveState.particles) {
            if (particle && particle.userData && particle.userData.initialPos) {
                const initialPos = particle.userData.initialPos;
                const speed = particle.userData.speed;
                const direction = particle.userData.direction;
                
                // Oscillate position
                particle.position.set(
                    initialPos.x + Math.sin(this.waveState.age * speed) * direction.x * 0.2,
                    initialPos.y + Math.sin(this.waveState.age * speed) * direction.y * 0.2,
                    initialPos.z + Math.sin(this.waveState.age * speed) * direction.z * 0.2
                );
            }
        }
        
        // Animate the main wave
        if (this.waveState.wave) {
            // Pulse the wave
            const pulseScale = 1.0 + Math.sin(this.waveState.age * 3) * 0.1;
            this.waveState.wave.scale.x = pulseScale;
            this.waveState.wave.scale.y = pulseScale;
        }
        
        // Animate the energy ring
        if (this.waveState.ring) {
            // Rotate the ring
            this.waveState.ring.rotation.z += delta * 2;
            
            // Pulse the ring
            const ringPulse = 1.0 + Math.sin(this.waveState.age * 5) * 0.2;
            this.waveState.ring.scale.set(ringPulse, ringPulse, 1);
        }
        
        // Animate the central core
        if (this.waveState.core) {
            // Pulse the core
            const corePulse = 1.0 + Math.sin(this.waveState.age * 8) * 0.3;
            this.waveState.core.scale.set(corePulse, corePulse, corePulse);
            
            // Pulse opacity
            if (this.waveState.core.material) {
                this.waveState.core.material.opacity = 0.7 + Math.sin(this.waveState.age * 4) * 0.3;
            }
        }
        
        // Animate the wake
        if (this.waveState.wake) {
            // Stretch the wake as the wave moves
            this.waveState.wake.scale.y = 1.0 + (this.distanceTraveled * 0.05);
            this.waveState.wake.position.z = -this.waveHeight - (this.distanceTraveled * 0.1);
            
            // Fade the wake over time
            if (this.waveState.wake.material) {
                this.waveState.wake.material.opacity = Math.max(0.1, 0.3 - (this.elapsedTime * 0.05));
            }
        }
    }
}