import * as THREE from 'three';

export class Skill {
    constructor(config) {
        this.name = config.name || 'Unknown Skill';
        this.description = config.description || '';
        this.type = config.type || 'ranged';
        this.damage = config.damage || 0;
        this.manaCost = config.manaCost || 0;
        this.cooldown = config.cooldown || 0;
        this.range = config.range || 0;
        this.radius = config.radius || 0;
        this.duration = config.duration || 0;
        this.color = config.color || 0xffffff;
        this.hits = config.hits || 1;
        
        // Skill state
        this.currentCooldown = 0;
        this.isActive = false;
        this.elapsedTime = 0;
        
        // Skill effect
        this.effect = null;
        this.position = new THREE.Vector3();
        this.direction = new THREE.Vector3();
    }
    
    createEffect(playerPosition, playerRotation) {
        // Set skill position
        this.position.copy(playerPosition);
        this.position.y += 1; // Adjust height
        
        // Set skill direction based on player rotation
        this.direction.set(
            Math.sin(playerRotation.y),
            0,
            Math.cos(playerRotation.y)
        );
        
        // Create effect based on skill type
        switch (this.type) {
            case 'ranged':
                return this.createRangedEffect();
            case 'aoe':
                return this.createAoeEffect();
            case 'multi':
                return this.createMultiEffect();
            case 'buff':
                return this.createBuffEffect();
            case 'wave':
                return this.createWaveEffect();
            default:
                return this.createDefaultEffect();
        }
    }
    
    createRangedEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // For Wave Strike, create a complex water wave effect
        if (this.name === 'Wave Strike') {
            // Create main wave body - a curved plane
            const waveGroup = new THREE.Group();
            
            // Create the main wave shape using a torus segment
            const waveWidth = 2.5;
            const waveHeight = 1.8;
            const waveDepth = 3.0;
            
            // Create the main wave body using a custom shape
            const waveGeometry = new THREE.TorusGeometry(waveWidth, waveHeight/2, 16, 32, Math.PI);
            const waveMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7,
                metalness: 0.2,
                roughness: 0.3,
                side: THREE.DoubleSide
            });
            
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = Math.PI / 2;
            wave.rotation.y = Math.PI;
            wave.scale.z = 0.5;
            waveGroup.add(wave);
            
            // Add water droplets/particles around the wave
            const dropletCount = 25;
            for (let i = 0; i < dropletCount; i++) {
                // Random position around the wave
                const angle = (Math.random() * Math.PI) - (Math.PI/2);
                const radius = waveWidth * 0.8 * Math.random();
                const height = (Math.random() * waveHeight) - (waveHeight/2);
                
                // Create water droplet
                const dropletSize = 0.05 + (Math.random() * 0.15);
                const dropletGeometry = new THREE.SphereGeometry(dropletSize, 8, 8);
                const dropletMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.6 + (Math.random() * 0.4),
                    metalness: 0.3,
                    roughness: 0.2
                });
                
                const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
                droplet.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                // Store initial position for animation
                droplet.userData = {
                    initialPos: droplet.position.clone(),
                    speed: 0.5 + (Math.random() * 1.5),
                    direction: new THREE.Vector3(
                        (Math.random() * 2) - 1,
                        (Math.random() * 2) - 1,
                        (Math.random() * 2) - 1
                    ).normalize()
                };
                
                waveGroup.add(droplet);
            }
            
            // Add foam/splash at the base of the wave
            const foamGeometry = new THREE.TorusGeometry(waveWidth * 0.9, 0.3, 16, 32, Math.PI);
            const foamMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                metalness: 0.1,
                roughness: 0.9
            });
            
            const foam = new THREE.Mesh(foamGeometry, foamMaterial);
            foam.rotation.x = Math.PI / 2;
            foam.rotation.y = Math.PI;
            foam.position.y = -waveHeight/2 + 0.1;
            foam.scale.z = 0.3;
            waveGroup.add(foam);
            
            // Add energy core in the center of the wave
            const coreGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const coreMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.color,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.9
            });
            
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            core.position.set(0, 0, 0);
            waveGroup.add(core);
            
            // Add energy tendrils emanating from the core
            const tendrilCount = 6;
            for (let i = 0; i < tendrilCount; i++) {
                const angle = (i / tendrilCount) * Math.PI;
                const tendrilGeometry = new THREE.CylinderGeometry(0.05, 0.02, waveWidth * 1.5, 8);
                const tendrilMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.6,
                    emissive: this.color,
                    emissiveIntensity: 0.5
                });
                
                const tendril = new THREE.Mesh(tendrilGeometry, tendrilMaterial);
                tendril.position.set(
                    Math.cos(angle) * (waveWidth * 0.3),
                    Math.sin(angle) * (waveHeight * 0.3),
                    0
                );
                tendril.rotation.z = angle + (Math.PI/2);
                
                // Store rotation data for animation
                tendril.userData = {
                    rotationSpeed: 0.5 + (Math.random() * 1.5),
                    initialAngle: angle
                };
                
                waveGroup.add(tendril);
            }
            
            // Add trailing wake behind the wave
            const wakeGeometry = new THREE.PlaneGeometry(waveWidth * 2, waveDepth * 1.5);
            const wakeMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const wake = new THREE.Mesh(wakeGeometry, wakeMaterial);
            wake.rotation.x = Math.PI / 2;
            wake.position.z = -waveDepth/2;
            wake.position.y = -0.1;
            waveGroup.add(wake);
            
            // Add the wave group to the effect group
            effectGroup.add(waveGroup);
            
            // Store animation state
            this.waveState = {
                phase: 'growing', // 'growing', 'stable', 'dissipating'
                age: 0,
                droplets: []
            };
            
            // Store droplet references for animation
            for (let i = 0; i < waveGroup.children.length; i++) {
                const child = waveGroup.children[i];
                if (child.userData && child.userData.initialPos) {
                    this.waveState.droplets.push(child);
                }
            }
        } else {
            // Default ranged effect (fallback for other ranged skills)
            // Create a projectile (cone)
            const projectileGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
            const projectileMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.8
            });
            
            const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
            projectile.rotation.x = Math.PI / 2;
            
            // Add projectile to group
            effectGroup.add(projectile);
            
            // Add trail particles
            const trailCount = 10;
            for (let i = 0; i < trailCount; i++) {
                const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.5
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.z = -i * 0.1;
                
                effectGroup.add(particle);
            }
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        effectGroup.rotation.y = Math.atan2(this.direction.x, this.direction.z);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    createAoeEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Special handling for Cyclone Strike
        if (this.name === 'Cyclone Strike') {
            // Create a tornado/cyclone effect
            const cycloneGroup = new THREE.Group();
            
            // Create the base of the cyclone
            const baseRadius = this.radius;
            const baseHeight = 0.2;
            const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius * 1.2, baseHeight, 32);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7,
                metalness: 0.2,
                roughness: 0.8,
                side: THREE.DoubleSide
            });
            
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = baseHeight / 2;
            cycloneGroup.add(base);
            
            // Create the main cyclone body with multiple layers
            const layerCount = 8;
            const maxHeight = 4;
            const spiralFactor = 0.2; // Controls how much the cyclone spirals
            
            for (let i = 0; i < layerCount; i++) {
                const layerHeight = 0.4;
                const heightPosition = baseHeight + (i * layerHeight);
                const layerRadius = baseRadius * (1 - (i / layerCount) * 0.7); // Gradually decrease radius
                
                const layerGeometry = new THREE.TorusGeometry(layerRadius, 0.2, 16, 32);
                const layerMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.6 - (i * 0.05), // Gradually decrease opacity
                    metalness: 0.3,
                    roughness: 0.7,
                    side: THREE.DoubleSide
                });
                
                const layer = new THREE.Mesh(layerGeometry, layerMaterial);
                layer.position.y = heightPosition;
                layer.rotation.x = Math.PI / 2; // Lay flat
                layer.rotation.z = i * spiralFactor; // Create spiral effect
                
                // Store initial position and rotation for animation
                layer.userData = {
                    initialHeight: heightPosition,
                    rotationSpeed: 2 + (i * 0.5), // Layers rotate at different speeds
                    verticalSpeed: 0.5 + (Math.random() * 0.5)
                };
                
                cycloneGroup.add(layer);
            }
            
            // Add wind/dust particles swirling around the cyclone
            const particleCount = 50;
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Random position around the cyclone
                const angle = Math.random() * Math.PI * 2;
                const distance = (Math.random() * baseRadius * 1.2) + (baseRadius * 0.2);
                const height = Math.random() * maxHeight;
                
                // Create particle
                const particleSize = 0.05 + (Math.random() * 0.15);
                let particleGeometry;
                
                // Mix of different particle shapes
                const shapeType = Math.floor(Math.random() * 3);
                switch (shapeType) {
                    case 0:
                        particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
                        break;
                    case 1:
                        particleGeometry = new THREE.BoxGeometry(particleSize, particleSize, particleSize);
                        break;
                    case 2:
                        particleGeometry = new THREE.TetrahedronGeometry(particleSize);
                        break;
                }
                
                // Vary particle colors slightly
                const colorVariation = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
                const particleColor = new THREE.Color(this.color);
                particleColor.r = Math.min(1, Math.max(0, particleColor.r + colorVariation));
                particleColor.g = Math.min(1, Math.max(0, particleColor.g + colorVariation));
                particleColor.b = Math.min(1, Math.max(0, particleColor.b + colorVariation));
                
                const particleMaterial = new THREE.MeshStandardMaterial({
                    color: particleColor,
                    transparent: true,
                    opacity: 0.4 + (Math.random() * 0.4),
                    metalness: 0.1,
                    roughness: 0.9
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    Math.cos(angle) * distance,
                    height,
                    Math.sin(angle) * distance
                );
                
                // Store particle animation data
                particle.userData = {
                    angle: angle,
                    distance: distance,
                    height: height,
                    rotationSpeed: 1 + (Math.random() * 2),
                    verticalSpeed: 0.2 + (Math.random() * 0.8),
                    scaleSpeed: 0.95 + (Math.random() * 0.05)
                };
                
                cycloneGroup.add(particle);
                particles.push(particle);
            }
            
            // Add energy core at the center of the cyclone
            const coreGeometry = new THREE.SphereGeometry(baseRadius * 0.3, 16, 16);
            const coreMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.color,
                emissiveIntensity: 1.5,
                transparent: true,
                opacity: 0.8
            });
            
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            core.position.y = maxHeight / 2;
            cycloneGroup.add(core);
            
            // Add energy beams emanating from the core
            const beamCount = 5;
            for (let i = 0; i < beamCount; i++) {
                const angle = (i / beamCount) * Math.PI * 2;
                const beamLength = baseRadius * 0.8;
                
                const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, beamLength, 8);
                const beamMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.7
                });
                
                const beam = new THREE.Mesh(beamGeometry, beamMaterial);
                beam.position.set(
                    Math.cos(angle) * (baseRadius * 0.5),
                    maxHeight / 2,
                    Math.sin(angle) * (baseRadius * 0.5)
                );
                beam.rotation.z = Math.PI / 2;
                beam.rotation.y = angle;
                
                // Store beam animation data
                beam.userData = {
                    angle: angle,
                    rotationSpeed: 3 + (Math.random() * 2),
                    pulseSpeed: 5 + (Math.random() * 3)
                };
                
                cycloneGroup.add(beam);
            }
            
            // Add the cyclone group to the effect group
            effectGroup.add(cycloneGroup);
            
            // Store animation state
            this.cycloneState = {
                age: 0,
                rotationSpeed: 2,
                particles: particles
            };
        } else {
            // Default AOE effect
            // Create a ring
            const ringGeometry = new THREE.RingGeometry(this.radius - 0.2, this.radius, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.1;
            
            // Add ring to group
            effectGroup.add(ring);
            
            // Create particles
            const particleCount = 20;
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const radius = this.radius * 0.8;
                
                const particleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.7
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    Math.cos(angle) * radius,
                    0.5,
                    Math.sin(angle) * radius
                );
                
                effectGroup.add(particle);
            }
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    createMultiEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create multiple strike effects
        for (let i = 0; i < this.hits; i++) {
            const angle = (i / this.hits) * Math.PI * 2;
            const radius = this.range * 0.5;
            
            const strikeGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
            const strikeMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.8
            });
            
            const strike = new THREE.Mesh(strikeGeometry, strikeMaterial);
            strike.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            
            // Rotate strike to face center
            strike.lookAt(new THREE.Vector3(0, 0.5, 0));
            
            effectGroup.add(strike);
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    createBuffEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create a cylinder for the buff area
        const cylinderGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 0.1, 32);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.3
        });
        
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.y = 0.05;
        
        // Add cylinder to group
        effectGroup.add(cylinder);
        
        // Create particles
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * this.radius;
            
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                Math.random() * 2,
                Math.sin(angle) * radius
            );
            
            effectGroup.add(particle);
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    createWaveEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create the bell - using a combination of shapes to form a bell
        const bellGroup = new THREE.Group();
        
        // Bell top (dome)
        const bellTopGeometry = new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bellMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Gold color for the bell
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        
        const bellTop = new THREE.Mesh(bellTopGeometry, bellMaterial);
        bellTop.position.y = 2.5;
        bellGroup.add(bellTop);
        
        // Bell body (inverted cone)
        const bellBodyGeometry = new THREE.CylinderGeometry(1.2, 2, 2.5, 16, 1, true);
        const bellBody = new THREE.Mesh(bellBodyGeometry, bellMaterial);
        bellBody.position.y = 1.25;
        bellGroup.add(bellBody);
        
        // Bell rim (torus)
        const bellRimGeometry = new THREE.TorusGeometry(2, 0.2, 16, 32);
        const bellRim = new THREE.Mesh(bellRimGeometry, bellMaterial);
        bellRim.position.y = 0;
        bellRim.rotation.x = Math.PI / 2;
        bellGroup.add(bellRim);
        
        // Bell striker (small sphere inside)
        const strikerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const strikerMaterial = new THREE.MeshStandardMaterial({
            color: 0xAA7722,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const striker = new THREE.Mesh(strikerGeometry, strikerMaterial);
        striker.position.y = 0.8;
        bellGroup.add(striker);
        
        // Position the bell above the player
        bellGroup.position.y = 8;
        
        // Add bell to effect group
        effectGroup.add(bellGroup);
        
        // Create impact area (circle on the ground)
        const impactGeometry = new THREE.CircleGeometry(this.radius, 32);
        const impactMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const impactArea = new THREE.Mesh(impactGeometry, impactMaterial);
        impactArea.rotation.x = -Math.PI / 2;
        impactArea.position.y = 0.05;
        
        // Add impact area to effect group
        effectGroup.add(impactArea);
        
        // Create light rays emanating from impact point
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            
            const rayGeometry = new THREE.BoxGeometry(0.2, 0.2, this.radius);
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.5
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.set(
                Math.cos(angle) * (this.radius / 2),
                0.2,
                Math.sin(angle) * (this.radius / 2)
            );
            
            ray.rotation.y = angle;
            
            effectGroup.add(ray);
        }
        
        // Create particles for visual effect
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * this.radius;
            
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                Math.random() * 0.5,
                Math.sin(angle) * radius
            );
            
            effectGroup.add(particle);
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        // Store animation state
        this.bellState = {
            phase: 'descending', // 'descending', 'impact', 'ascending'
            initialHeight: 8,
            impactTime: 0
        };
        
        return effectGroup;
    }
    
    createDefaultEffect() {
        // Create a simple effect (sphere)
        const effectGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const effectMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.7
        });
        
        const effect = new THREE.Mesh(effectGeometry, effectMaterial);
        
        // Position effect
        effect.position.copy(this.position);
        
        // Store effect
        this.effect = effect;
        this.isActive = true;
        
        return effect;
    }
    
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        // Update elapsed time
        this.elapsedTime += delta;
        
        // Update effect based on skill type
        switch (this.type) {
            case 'ranged':
                this.updateRangedEffect(delta);
                break;
            case 'aoe':
                this.updateAoeEffect(delta);
                break;
            case 'multi':
                this.updateMultiEffect(delta);
                break;
            case 'buff':
                this.updateBuffEffect(delta);
                break;
            case 'wave':
                this.updateWaveEffect(delta);
                break;
            default:
                this.updateDefaultEffect(delta);
                break;
        }
    }
    
    updateRangedEffect(delta) {
        // Special handling for Wave Strike
        if (this.name === 'Wave Strike' && this.waveState) {
            // Move wave forward
            const speed = 8;
            this.effect.position.x += this.direction.x * speed * delta;
            this.effect.position.z += this.direction.z * speed * delta;
            
            // Update position for collision detection
            this.position.copy(this.effect.position);
            
            // Update wave state
            this.waveState.age += delta;
            
            // Get the wave group (first child of effect group)
            const waveGroup = this.effect.children[0];
            
            // Animate based on phase
            if (this.waveState.age < 0.3) {
                // Growing phase - scale up
                const growScale = this.waveState.age / 0.3;
                waveGroup.scale.set(growScale, growScale, growScale);
            } else if (this.waveState.age > this.duration * 0.7) {
                // Dissipating phase - fade out
                const fadeRatio = 1 - ((this.waveState.age - (this.duration * 0.7)) / (this.duration * 0.3));
                
                // Fade out all materials
                waveGroup.traverse(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = Math.max(0, mat.opacity * fadeRatio);
                            });
                        } else {
                            child.material.opacity = Math.max(0, child.material.opacity * fadeRatio);
                        }
                    }
                });
            }
            
            // Animate water droplets
            for (const droplet of this.waveState.droplets) {
                // Move droplets outward and slightly upward
                droplet.position.add(
                    droplet.userData.direction.clone().multiplyScalar(delta * droplet.userData.speed)
                );
                
                // Scale down droplets over time
                droplet.scale.multiplyScalar(0.98);
            }
            
            // Animate energy tendrils
            for (let i = 0; i < waveGroup.children.length; i++) {
                const child = waveGroup.children[i];
                if (child.userData && child.userData.rotationSpeed) {
                    // Rotate tendrils
                    child.rotation.z += child.userData.rotationSpeed * delta;
                    
                    // Pulse tendrils
                    const pulseScale = 0.9 + (Math.sin(this.waveState.age * 5) * 0.1);
                    child.scale.set(pulseScale, 1, pulseScale);
                }
            }
            
            // Animate core (pulsing)
            const core = waveGroup.children.find(child => 
                child.geometry && child.geometry.type === 'SphereGeometry' && 
                child.position.x === 0 && child.position.z === 0
            );
            
            if (core) {
                const pulseScale = 0.8 + (Math.sin(this.waveState.age * 8) * 0.2);
                core.scale.set(pulseScale, pulseScale, pulseScale);
                
                if (core.material) {
                    core.material.emissiveIntensity = 1 + (Math.sin(this.waveState.age * 10) * 0.5);
                }
            }
            
            // Animate wake (stretching behind)
            const wake = waveGroup.children.find(child => 
                child.geometry && child.geometry.type === 'PlaneGeometry'
            );
            
            if (wake) {
                // Stretch wake as wave moves
                wake.scale.y = 1 + (this.waveState.age * 0.5);
                wake.position.z = -(wake.scale.y / 2);
                
                // Fade wake over time
                if (wake.material) {
                    wake.material.opacity = Math.max(0, 0.3 - (this.waveState.age * 0.05));
                }
            }
        } else {
            // Default ranged effect behavior
            // Move projectile forward
            const speed = 10;
            this.effect.position.x += this.direction.x * speed * delta;
            this.effect.position.z += this.direction.z * speed * delta;
            
            // Update position for collision detection
            this.position.copy(this.effect.position);
            
            // Scale down trail particles
            for (let i = 1; i < this.effect.children.length; i++) {
                const particle = this.effect.children[i];
                particle.scale.multiplyScalar(0.95);
            }
        }
    }
    
    updateAoeEffect(delta) {
        // Special handling for Cyclone Strike
        if (this.name === 'Cyclone Strike' && this.cycloneState) {
            // Update cyclone state
            this.cycloneState.age += delta;
            
            // Get the cyclone group (first child of effect group)
            const cycloneGroup = this.effect.children[0];
            
            // Rotate the entire cyclone
            cycloneGroup.rotation.y += this.cycloneState.rotationSpeed * delta;
            
            // Find the base, layers, core, and beams
            const base = cycloneGroup.children[0]; // First child is the base
            
            // Animate the cyclone layers (torus rings)
            for (let i = 1; i <= 8; i++) { // Layers are children 1-8
                if (cycloneGroup.children[i] && cycloneGroup.children[i].userData && 
                    cycloneGroup.children[i].userData.initialHeight !== undefined) {
                    
                    const layer = cycloneGroup.children[i];
                    
                    // Rotate each layer at its own speed
                    layer.rotation.z += layer.userData.rotationSpeed * delta;
                    
                    // Oscillate layers vertically
                    const verticalOffset = Math.sin(this.cycloneState.age * layer.userData.verticalSpeed) * 0.2;
                    layer.position.y = layer.userData.initialHeight + verticalOffset;
                    
                    // Pulse the layers
                    const pulseScale = 0.9 + (Math.sin(this.cycloneState.age * 3 + i) * 0.1);
                    layer.scale.set(pulseScale, pulseScale, 1);
                }
            }
            
            // Animate particles
            for (const particle of this.cycloneState.particles) {
                // Update particle angle (rotate around center)
                particle.userData.angle += particle.userData.rotationSpeed * delta;
                
                // Move particle in a spiral pattern
                particle.position.set(
                    Math.cos(particle.userData.angle) * particle.userData.distance,
                    particle.userData.height + (this.cycloneState.age * particle.userData.verticalSpeed) % 4,
                    Math.sin(particle.userData.angle) * particle.userData.distance
                );
                
                // Rotate particle
                particle.rotation.x += delta * 3;
                particle.rotation.y += delta * 3;
                particle.rotation.z += delta * 3;
                
                // Scale particle (gradually shrink)
                particle.scale.multiplyScalar(particle.userData.scaleSpeed);
                
                // Reset particles that get too small or move too high
                if (particle.scale.x < 0.2 || particle.position.y > 4) {
                    // Reset size
                    particle.scale.set(1, 1, 1);
                    
                    // Reset position - start from bottom
                    const newAngle = Math.random() * Math.PI * 2;
                    const newDistance = (Math.random() * this.radius * 1.2) + (this.radius * 0.2);
                    
                    particle.position.set(
                        Math.cos(newAngle) * newDistance,
                        Math.random() * 0.5, // Start near the bottom
                        Math.sin(newAngle) * newDistance
                    );
                    
                    // Update userData
                    particle.userData.angle = newAngle;
                    particle.userData.distance = newDistance;
                    particle.userData.height = particle.position.y;
                }
            }
            
            // Find and animate the core
            const core = cycloneGroup.children.find(child => 
                child.geometry && child.geometry.type === 'SphereGeometry' && 
                child.position.y > 1
            );
            
            if (core) {
                // Pulse the core
                const pulseScale = 0.8 + (Math.sin(this.cycloneState.age * 5) * 0.2);
                core.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Adjust emissive intensity
                if (core.material) {
                    core.material.emissiveIntensity = 1 + (Math.sin(this.cycloneState.age * 8) * 0.5);
                }
            }
            
            // Animate energy beams
            for (let i = 0; i < cycloneGroup.children.length; i++) {
                const child = cycloneGroup.children[i];
                if (child.userData && child.userData.rotationSpeed && child.userData.angle !== undefined) {
                    // Rotate beam around core
                    child.userData.angle += child.userData.rotationSpeed * delta;
                    
                    // Update beam position
                    const baseRadius = this.radius;
                    child.position.set(
                        Math.cos(child.userData.angle) * (baseRadius * 0.5),
                        child.position.y,
                        Math.sin(child.userData.angle) * (baseRadius * 0.5)
                    );
                    
                    // Update beam rotation to always point outward
                    child.rotation.y = child.userData.angle;
                    
                    // Pulse beam length
                    const pulseScale = 0.8 + (Math.sin(this.cycloneState.age * child.userData.pulseSpeed) * 0.2);
                    child.scale.y = pulseScale;
                }
            }
            
            // Handle fade-out near the end of duration
            if (this.elapsedTime > this.duration * 0.7) {
                const fadeRatio = 1 - ((this.elapsedTime - (this.duration * 0.7)) / (this.duration * 0.3));
                
                // Fade out all materials
                cycloneGroup.traverse(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = Math.max(0, mat.opacity * fadeRatio);
                            });
                        } else {
                            child.material.opacity = Math.max(0, child.material.opacity * fadeRatio);
                        }
                    }
                });
                
                // Slow down rotation as it fades
                this.cycloneState.rotationSpeed *= 0.98;
            }
            
            // Pull effect - move nearby objects toward the cyclone
            // This is just visual - actual gameplay logic would be handled elsewhere
            const pullRadius = this.radius * 2;
            const pullStrength = 5 * delta;
            
            // The pull effect could be implemented in the game's physics system
            // Here we're just animating the cyclone itself
        } else {
            // Default AOE effect behavior
            // Pulse the ring
            const ring = this.effect.children[0];
            const pulseSpeed = 2;
            const pulseScale = 0.2;
            
            ring.scale.set(
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
                1
            );
            
            // Rotate particles
            for (let i = 1; i < this.effect.children.length; i++) {
                const particle = this.effect.children[i];
                const angle = (i / (this.effect.children.length - 1)) * Math.PI * 2;
                const radius = this.radius * 0.8;
                
                particle.position.x = Math.cos(angle + this.elapsedTime * 2) * radius;
                particle.position.z = Math.sin(angle + this.elapsedTime * 2) * radius;
                particle.rotation.y += delta * 5;
            }
        }
    }
    
    updateMultiEffect(delta) {
        // Rotate strikes around center
        const rotationSpeed = 2;
        this.effect.rotation.y += rotationSpeed * delta;
        
        // Scale strikes based on elapsed time
        const scalePattern = Math.sin(this.elapsedTime * 10) * 0.2 + 0.8;
        
        for (let i = 0; i < this.effect.children.length; i++) {
            const strike = this.effect.children[i];
            strike.scale.set(scalePattern, scalePattern, scalePattern);
        }
    }
    
    updateBuffEffect(delta) {
        // Pulse the cylinder
        const cylinder = this.effect.children[0];
        const pulseSpeed = 1;
        const pulseScale = 0.1;
        
        cylinder.scale.set(
            1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
            1,
            1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale
        );
        
        // Move particles up and respawn at bottom
        for (let i = 1; i < this.effect.children.length; i++) {
            const particle = this.effect.children[i];
            particle.position.y += delta * 1.5;
            
            // Reset particle if it goes too high
            if (particle.position.y > 2) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.radius;
                
                particle.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
            }
        }
    }
    
    updateWaveEffect(delta) {
        // Get bell group (first child of effect group)
        const bellGroup = this.effect.children[0];
        
        // Get impact area (second child of effect group)
        const impactArea = this.effect.children[1];
        
        // Animation phases for the bell
        switch (this.bellState.phase) {
            case 'descending':
                // Bell descends from the sky
                const descentSpeed = 15; // Speed of descent
                bellGroup.position.y -= descentSpeed * delta;
                
                // When bell reaches near ground level, switch to impact phase
                if (bellGroup.position.y <= 0.5) {
                    bellGroup.position.y = 0.5; // Ensure bell doesn't go below ground
                    this.bellState.phase = 'impact';
                    this.bellState.impactTime = 0;
                    
                    // Make impact area visible and expand it
                    impactArea.material.opacity = 0.7;
                    impactArea.scale.set(0.1, 0.1, 0.1); // Start small
                }
                break;
                
            case 'impact':
                // Bell impact phase - create shockwave and visual effects
                this.bellState.impactTime += delta;
                
                // Expand impact area
                const expansionSpeed = 5;
                const maxScale = 1.5;
                const currentScale = Math.min(this.bellState.impactTime * expansionSpeed, maxScale);
                impactArea.scale.set(currentScale, currentScale, currentScale);
                
                // Fade impact area as it expands
                impactArea.material.opacity = 0.7 * (1 - (currentScale / maxScale));
                
                // Make bell vibrate during impact
                const vibrationIntensity = 0.2 * (1 - (this.bellState.impactTime / 0.5));
                bellGroup.rotation.z = Math.sin(this.bellState.impactTime * 40) * vibrationIntensity;
                
                // Animate light rays
                for (let i = 2; i < 2 + 8; i++) { // Rays are children 2-9
                    if (this.effect.children[i]) {
                        const ray = this.effect.children[i];
                        ray.scale.z = 1 + Math.sin(this.bellState.impactTime * 10) * 0.5;
                        ray.material.opacity = 0.5 * (1 - (this.bellState.impactTime / 0.5));
                    }
                }
                
                // After impact time, switch to ascending phase
                if (this.bellState.impactTime >= 0.5) {
                    this.bellState.phase = 'ascending';
                }
                break;
                
            case 'ascending':
                // Bell ascends back to the sky
                const ascentSpeed = 10;
                bellGroup.position.y += ascentSpeed * delta;
                
                // Gradually fade out the bell as it ascends
                if (bellGroup.children.length > 0) {
                    for (let i = 0; i < bellGroup.children.length; i++) {
                        const part = bellGroup.children[i];
                        if (part.material) {
                            part.material.opacity = Math.max(0, part.material.opacity - delta);
                        }
                    }
                }
                
                // Fade out impact area and rays
                impactArea.material.opacity = Math.max(0, impactArea.material.opacity - delta);
                
                for (let i = 2; i < 2 + 8; i++) { // Rays are children 2-9
                    if (this.effect.children[i]) {
                        const ray = this.effect.children[i];
                        ray.material.opacity = Math.max(0, ray.material.opacity - delta);
                    }
                }
                
                // Animate particles (last children of effect group)
                for (let i = 2 + 8; i < this.effect.children.length; i++) {
                    const particle = this.effect.children[i];
                    
                    // Move particles outward and upward
                    const directionToCenter = new THREE.Vector3(
                        particle.position.x,
                        0,
                        particle.position.z
                    ).normalize();
                    
                    particle.position.x += directionToCenter.x * delta * 2;
                    particle.position.z += directionToCenter.z * delta * 2;
                    particle.position.y += delta * 3;
                    
                    // Fade out particles
                    particle.material.opacity = Math.max(0, particle.material.opacity - delta);
                }
                break;
        }
    }
    
    updateDefaultEffect(delta) {
        // Pulse the effect
        const pulseSpeed = 3;
        const pulseScale = 0.2;
        
        this.effect.scale.set(
            1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
            1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
            1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale
        );
    }
    
    updateCooldown(delta) {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= delta;
            if (this.currentCooldown < 0) {
                this.currentCooldown = 0;
            }
        }
    }
    
    startCooldown() {
        this.currentCooldown = this.cooldown;
    }
    
    isOnCooldown() {
        return this.currentCooldown > 0;
    }
    
    getCooldownPercent() {
        if (this.cooldown === 0) return 0;
        return this.currentCooldown / this.cooldown;
    }
    
    isExpired() {
        return this.elapsedTime >= this.duration;
    }
    
    remove() {
        // Clean up effect
        if (this.effect && this.effect.parent) {
            this.effect.parent.remove(this.effect);
        }
        
        this.effect = null;
        this.isActive = false;
        this.elapsedTime = 0;
    }
    
    getPosition() {
        return this.position;
    }
    
    getRadius() {
        return this.radius;
    }
    
    getDamage() {
        return this.damage;
    }
}