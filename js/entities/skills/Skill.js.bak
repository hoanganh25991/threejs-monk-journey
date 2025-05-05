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

        // Primary Skill (Basic Attack)
        this.basicAttack = config.basicAttack || false;       
    }
    
    // Utility method to validate vector values
    validateVector(vector) {
        if (!vector) return false;
        
        // Check if any component is NaN or infinite
        if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z) ||
            !isFinite(vector.x) || !isFinite(vector.y) || !isFinite(vector.z)) {
            console.warn("Invalid vector detected:", vector);
            return false;
        }
        
        return true;
    }
    
    createEffect(playerPosition, playerRotation) {
        // Validate input positions
        if (!this.validateVector(playerPosition)) {
            console.error("Invalid player position provided to skill:", this.name);
            // Use a default safe position
            playerPosition = new THREE.Vector3(0, 0, 0);
        }
        
        // Set skill position
        this.position.copy(playerPosition);
        this.position.y += 1; // Adjust height
        
        // Validate rotation
        if (!playerRotation || isNaN(playerRotation.y)) {
            console.error("Invalid player rotation provided to skill:", this.name);
            // Use a default rotation
            playerRotation = { y: 0 };
        }
        
        // Set skill direction based on player rotation
        // IMPORTANT: For Exploding Palm, we need to ensure it always moves forward
        // in the direction the player is facing
        this.direction.set(
            Math.sin(playerRotation.y),
            0,
            Math.cos(playerRotation.y)
        );
        
        // Log the direction for debugging
        console.log(`Skill ${this.name} direction set to: ${this.direction.x.toFixed(2)}, ${this.direction.z.toFixed(2)}`);
        console.log(`Based on player rotation: ${playerRotation.y.toFixed(2)} radians`);
        
        // Validate direction vector
        if (!this.validateVector(this.direction)) {
            console.error("Invalid direction calculated for skill:", this.name);
            // Use a default direction
            this.direction.set(0, 0, 1);
        }
        
        // Create effect based on skill type
        try {
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
                case 'summon':
                    return this.createSummonEffect();
                case 'mark':
                    return this.createMarkEffect();
                case 'teleport':
                    return this.createTeleportEffect();
                default:
                    return this.createDefaultEffect();
            }
        } catch (error) {
            console.error(`Error creating effect for skill ${this.name}:`, error);
            // Return a simple default effect as fallback
            const fallbackGroup = new THREE.Group();
            const fallbackGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            fallbackGroup.add(fallbackMesh);
            return fallbackGroup;
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
                        // Validate particleSize to prevent NaN values
                        if (isNaN(particleSize) || particleSize <= 0) {
                            particleSize = 0.1; // Default safe value
                            console.warn("Invalid particleSize detected, using default value");
                        }
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
                
                // Use fixed size for particle geometry to avoid potential NaN issues
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
        
        // Special handling for Seven-Sided Strike
        if (this.name === 'Seven-Sided Strike') {
            // Create a more complex and visually impressive effect for Seven-Sided Strike
            
            // Create the main monk figure (will be cloned for each strike)
            const monkGroup = new THREE.Group();
            
            // Monk body (simplified)
            const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 8);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0xcc8844, // Monk robe color
                metalness: 0.2,
                roughness: 0.8
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            monkGroup.add(body);
            
            // Monk head
            const headGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0xffcc88, // Skin color
                metalness: 0.1,
                roughness: 0.9
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 0.9;
            monkGroup.add(head);
            
            // Monk arms in striking pose
            const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
            const armMaterial = new THREE.MeshStandardMaterial({
                color: 0xffcc88, // Skin color
                metalness: 0.1,
                roughness: 0.9
            });
            
            // Right arm in striking position
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.2, 0.6, 0.2);
            rightArm.rotation.x = Math.PI / 4;
            rightArm.rotation.z = -Math.PI / 4;
            monkGroup.add(rightArm);
            
            // Left arm in balance position
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.2, 0.6, -0.1);
            leftArm.rotation.x = -Math.PI / 6;
            leftArm.rotation.z = Math.PI / 3;
            monkGroup.add(leftArm);
            
            // Monk legs in dynamic pose
            const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
            const legMaterial = new THREE.MeshStandardMaterial({
                color: 0x555555, // Dark pants
                metalness: 0.1,
                roughness: 0.9
            });
            
            // Right leg forward
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.1, 0.1, 0.1);
            rightLeg.rotation.x = Math.PI / 6;
            monkGroup.add(rightLeg);
            
            // Left leg back
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.1, 0.1, -0.1);
            leftLeg.rotation.x = -Math.PI / 6;
            monkGroup.add(leftLeg);
            
            // Add strike effect (energy around fist)
            const strikeEffectGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const strikeEffectMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.8
            });
            const strikeEffect = new THREE.Mesh(strikeEffectGeometry, strikeEffectMaterial);
            strikeEffect.position.set(0.3, 0.6, 0.3);
            monkGroup.add(strikeEffect);
            
            // Add motion blur trail
            const trailGeometry = new THREE.PlaneGeometry(0.8, 0.4);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.set(0.1, 0.5, 0.1);
            trail.rotation.y = Math.PI / 4;
            monkGroup.add(trail);
            
            // Create the seven strike positions
            const strikePositions = [];
            const radius = this.range * 0.8;
            
            // Create a pattern of positions for the seven strikes
            for (let i = 0; i < this.hits; i++) {
                // Create a more dynamic pattern than just a circle
                let angle;
                let distance;
                
                if (i === 0) {
                    // First strike at center
                    angle = 0;
                    distance = 0;
                } else if (i === this.hits - 1) {
                    // Last strike at center
                    angle = 0;
                    distance = 0;
                } else {
                    // Other strikes in a pattern
                    angle = ((i - 1) / (this.hits - 2)) * Math.PI * 2;
                    distance = radius;
                }
                
                strikePositions.push({
                    position: new THREE.Vector3(
                        Math.cos(angle) * distance,
                        0,
                        Math.sin(angle) * distance
                    ),
                    rotation: new THREE.Euler(0, angle + Math.PI, 0)
                });
            }
            
            // Create a monk figure at each strike position
            for (let i = 0; i < strikePositions.length; i++) {
                const strikeClone = monkGroup.clone();
                
                // Position and rotate the strike
                strikeClone.position.copy(strikePositions[i].position);
                strikeClone.rotation.copy(strikePositions[i].rotation);
                
                // Add a number indicator for the strike
                const textGeometry = new THREE.PlaneGeometry(0.3, 0.3);
                const textCanvas = document.createElement('canvas');
                textCanvas.width = 64;
                textCanvas.height = 64;
                const textContext = textCanvas.getContext('2d');
                textContext.fillStyle = 'rgba(0, 0, 0, 0)';
                textContext.fillRect(0, 0, 64, 64);
                textContext.font = 'bold 48px Arial';
                textContext.textAlign = 'center';
                textContext.textBaseline = 'middle';
                textContext.fillStyle = '#ffffff';
                textContext.fillText((i + 1).toString(), 32, 32);
                
                const textTexture = new THREE.CanvasTexture(textCanvas);
                const textMaterial = new THREE.MeshBasicMaterial({
                    map: textTexture,
                    transparent: true,
                    opacity: 0.9
                });
                
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.y = 1.2;
                textMesh.rotation.x = -Math.PI / 2;
                
                strikeClone.add(textMesh);
                
                // Store the original scale for animation
                strikeClone.userData = {
                    index: i,
                    originalScale: strikeClone.scale.clone(),
                    active: false,
                    activationTime: i * (this.duration / this.hits)
                };
                
                // Initially set scale to zero (will be animated in)
                strikeClone.scale.set(0, 0, 0);
                
                effectGroup.add(strikeClone);
            }
            
            // Create connecting energy lines between strikes
            for (let i = 0; i < strikePositions.length - 1; i++) {
                const start = strikePositions[i].position;
                const end = strikePositions[i + 1].position;
                
                // Calculate distance and direction
                const direction = new THREE.Vector3().subVectors(end, start);
                const distance = direction.length();
                
                // Create line geometry
                const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, distance, 8);
                const lineMaterial = new THREE.MeshBasicMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.4
                });
                
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                
                // Position at midpoint
                const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                line.position.copy(midpoint);
                
                // Orient towards end point
                line.lookAt(end);
                line.rotation.x = Math.PI / 2;
                
                // Store indices for animation
                line.userData = {
                    startIndex: i,
                    endIndex: i + 1,
                    originalOpacity: 0.4
                };
                
                effectGroup.add(line);
            }
            
            // Create central energy vortex
            const vortexGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32);
            const vortexMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.7
            });
            
            const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
            vortex.rotation.x = Math.PI / 2;
            vortex.position.y = 0.1;
            
            // Store for animation
            vortex.userData = {
                rotationSpeed: 5,
                pulseSpeed: 3
            };
            
            effectGroup.add(vortex);
            
            // Store animation state
            this.sevenSidedStrikeState = {
                currentStrike: -1,
                strikeDuration: this.duration / this.hits,
                strikeTimer: 0,
                vortex: vortex
            };
        } else {
            // Default multi-effect implementation
            // Create multiple strike effects
            for (let i = 0; i < this.hits; i++) {
                const angle = (i / this.hits) * Math.PI * 2;
                const radius = this.range * 0.5;
                
                // Use fixed size for strike geometry to avoid potential NaN issues
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
        
        // Special handling for Inner Sanctuary
        if (this.name === 'Inner Sanctuary') {
            // Create a more complex and visually impressive effect for Inner Sanctuary
            
            // Create the main sanctuary area
            const sanctuaryGroup = new THREE.Group();
            
            // Create the base sanctuary circle
            const baseGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 0.05, 32);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.4,
                metalness: 0.2,
                roughness: 0.8,
                side: THREE.DoubleSide
            });
            
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.025;
            sanctuaryGroup.add(base);
            
            // Create a glowing edge ring
            const edgeGeometry = new THREE.TorusGeometry(this.radius, 0.1, 16, 64);
            const edgeMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.8,
                metalness: 0.3,
                roughness: 0.7
            });
            
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.rotation.x = Math.PI / 2;
            edge.position.y = 0.05;
            sanctuaryGroup.add(edge);
            
            // Create protective dome (hemisphere)
            const domeGeometry = new THREE.SphereGeometry(this.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.2,
                metalness: 0.1,
                roughness: 0.9,
                side: THREE.DoubleSide
            });
            
            const dome = new THREE.Mesh(domeGeometry, domeMaterial);
            dome.position.y = 0;
            sanctuaryGroup.add(dome);
            
            // Create protective runes around the sanctuary
            const runeCount = 8;
            for (let i = 0; i < runeCount; i++) {
                const angle = (i / runeCount) * Math.PI * 2;
                const runeRadius = this.radius * 0.9;
                
                // Create rune base
                const runeGroup = new THREE.Group();
                
                // Position rune around the circle
                runeGroup.position.set(
                    Math.cos(angle) * runeRadius,
                    0.1,
                    Math.sin(angle) * runeRadius
                );
                
                // Rotate rune to face center
                runeGroup.lookAt(new THREE.Vector3(0, 0.1, 0));
                runeGroup.rotation.y += Math.PI / 2; // Adjust to face outward
                
                // Create rune symbol using custom geometry
                // We'll create a simple glyph shape
                const runeShape = new THREE.Shape();
                runeShape.moveTo(-0.1, -0.15);
                runeShape.lineTo(0.1, -0.15);
                runeShape.lineTo(0.15, 0);
                runeShape.lineTo(0.1, 0.15);
                runeShape.lineTo(-0.1, 0.15);
                runeShape.lineTo(-0.15, 0);
                runeShape.lineTo(-0.1, -0.15);
                
                const runeGeometry = new THREE.ShapeGeometry(runeShape);
                const runeMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: this.color,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });
                
                const rune = new THREE.Mesh(runeGeometry, runeMaterial);
                rune.rotation.x = Math.PI / 2;
                
                // Store animation data
                rune.userData = {
                    pulseSpeed: 2 + (i * 0.5),
                    hoverSpeed: 1 + (i * 0.3),
                    rotationSpeed: 0.5 + (i * 0.2),
                    initialY: 0.1
                };
                
                runeGroup.add(rune);
                sanctuaryGroup.add(runeGroup);
            }
            
            // Create energy pillars at cardinal points
            const pillarCount = 4;
            for (let i = 0; i < pillarCount; i++) {
                const angle = (i / pillarCount) * Math.PI * 2;
                const pillarRadius = this.radius * 0.7;
                
                // Create pillar
                const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
                const pillarMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 0.8,
                    transparent: true,
                    opacity: 0.5
                });
                
                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                pillar.position.set(
                    Math.cos(angle) * pillarRadius,
                    1,
                    Math.sin(angle) * pillarRadius
                );
                
                // Store animation data
                pillar.userData = {
                    pulseSpeed: 3 + (i * 0.5),
                    heightFactor: 0.5 + (i * 0.2)
                };
                
                sanctuaryGroup.add(pillar);
            }
            
            // Create central mandala pattern
            const mandalaGroup = new THREE.Group();
            mandalaGroup.position.y = 0.06;
            
            // Create concentric circles
            const circleCount = 3;
            for (let i = 0; i < circleCount; i++) {
                const circleRadius = (this.radius * 0.6) * ((circleCount - i) / circleCount);
                const circleGeometry = new THREE.RingGeometry(
                    circleRadius - 0.05,
                    circleRadius,
                    32
                );
                const circleMaterial = new THREE.MeshBasicMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.5 - (i * 0.1),
                    side: THREE.DoubleSide
                });
                
                const circle = new THREE.Mesh(circleGeometry, circleMaterial);
                circle.rotation.x = -Math.PI / 2;
                
                // Store animation data
                circle.userData = {
                    rotationSpeed: 0.2 + (i * 0.3),
                    direction: i % 2 === 0 ? 1 : -1 // Alternate directions
                };
                
                mandalaGroup.add(circle);
            }
            
            // Create radial lines
            const lineCount = 12;
            for (let i = 0; i < lineCount; i++) {
                const angle = (i / lineCount) * Math.PI * 2;
                const lineLength = this.radius * 0.6;
                
                const lineGeometry = new THREE.PlaneGeometry(0.02, lineLength);
                const lineMaterial = new THREE.MeshBasicMaterial({
                    color: this.color,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                });
                
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.set(
                    Math.cos(angle) * (lineLength / 2),
                    0,
                    Math.sin(angle) * (lineLength / 2)
                );
                line.rotation.x = -Math.PI / 2;
                line.rotation.z = angle;
                
                mandalaGroup.add(line);
            }
            
            // Create central lotus symbol
            const petalCount = 8;
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                
                // Create petal shape
                const petalShape = new THREE.Shape();
                petalShape.moveTo(0, 0);
                petalShape.quadraticCurveTo(0.1, 0.1, 0.2, 0);
                petalShape.quadraticCurveTo(0.1, -0.1, 0, 0);
                
                const petalGeometry = new THREE.ShapeGeometry(petalShape);
                const petalMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                petal.position.set(
                    Math.cos(angle) * 0.15,
                    0,
                    Math.sin(angle) * 0.15
                );
                petal.rotation.x = -Math.PI / 2;
                petal.rotation.z = angle;
                
                // Store animation data
                petal.userData = {
                    pulseSpeed: 2 + (i * 0.3)
                };
                
                mandalaGroup.add(petal);
            }
            
            // Create central core
            const coreGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const coreMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.color,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.9
            });
            
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            mandalaGroup.add(core);
            
            sanctuaryGroup.add(mandalaGroup);
            
            // Add floating particles inside the sanctuary
            const particleCount = 50;
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Random position within the sanctuary
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.radius * 0.9;
                const height = Math.random() * this.radius;
                
                // Create particle
                const particleSize = 0.02 + (Math.random() * 0.04);
                const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
                const particleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: this.color,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.6 + (Math.random() * 0.4)
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                // Store particle animation data
                particle.userData = {
                    orbitSpeed: 0.1 + (Math.random() * 0.3),
                    orbitRadius: radius,
                    orbitAngle: angle,
                    verticalSpeed: 0.05 + (Math.random() * 0.1),
                    initialHeight: height,
                    amplitude: 0.1 + (Math.random() * 0.2)
                };
                
                sanctuaryGroup.add(particle);
                particles.push(particle);
            }
            
            // Add sanctuary to effect group
            effectGroup.add(sanctuaryGroup);
            
            // Store animation state
            this.sanctuaryState = {
                age: 0,
                particles: particles,
                mandala: mandalaGroup
            };
        } else {
            // Default buff effect implementation
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
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    createWaveEffect() {
        // Configuration for bell size and appearance
        const config = {
            bellSizeMultiplier: this.radius / 5,  // Adjust this value to change the overall bell size
            bellHeight: 8,            // Height above the ground
            bellColor: 0xFFD700,      // Gold color for the bell
            bellOpacity: 0.9,         // Bell transparency
            bellMetalness: 0.8,       // Bell metallic appearance
            bellRoughness: 0.2,       // Bell surface roughness
            strikerColor: 0xAA7722    // Color of the striker inside the bell
        };
        
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create the bell - using a combination of shapes to form a bell
        const bellGroup = new THREE.Group();
        
        // Apply size multiplier to all dimensions
        const bellTopRadius = 1.2 * config.bellSizeMultiplier;
        const bellBottomRadius = 2 * config.bellSizeMultiplier;
        const bellHeight = 2.5 * config.bellSizeMultiplier;
        const bellRimRadius = 2 * config.bellSizeMultiplier;
        const bellRimThickness = 0.2 * config.bellSizeMultiplier;
        const strikerRadius = 0.3 * config.bellSizeMultiplier;
        
        // Bell top (dome)
        const bellTopGeometry = new THREE.SphereGeometry(bellTopRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bellMaterial = new THREE.MeshStandardMaterial({
            color: config.bellColor,
            metalness: config.bellMetalness,
            roughness: config.bellRoughness,
            transparent: true,
            opacity: config.bellOpacity
        });
        
        const bellTop = new THREE.Mesh(bellTopGeometry, bellMaterial);
        bellTop.position.y = bellHeight;
        bellGroup.add(bellTop);
        
        // Bell body (inverted cone)
        const bellBodyGeometry = new THREE.CylinderGeometry(bellTopRadius, bellBottomRadius, bellHeight, 16, 1, true);
        const bellBody = new THREE.Mesh(bellBodyGeometry, bellMaterial);
        bellBody.position.y = bellHeight/2;
        bellGroup.add(bellBody);
        
        // Bell rim (torus)
        const bellRimGeometry = new THREE.TorusGeometry(bellRimRadius, bellRimThickness, 16, 32);
        const bellRim = new THREE.Mesh(bellRimGeometry, bellMaterial);
        bellRim.position.y = 0;
        bellRim.rotation.x = Math.PI / 2;
        bellGroup.add(bellRim);
        
        // Bell striker (small sphere inside)
        const strikerGeometry = new THREE.SphereGeometry(strikerRadius, 8, 8);
        const strikerMaterial = new THREE.MeshStandardMaterial({
            color: config.strikerColor,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const striker = new THREE.Mesh(strikerGeometry, strikerMaterial);
        striker.position.y = bellHeight * 0.32; // Position striker proportionally to bell size
        bellGroup.add(striker);
        
        // Position the bell above the player
        bellGroup.position.y = config.bellHeight;
        
        // Add bell to effect group
        effectGroup.add(bellGroup);
        
        // Create impact area (circle on the ground)
        const impactRadius = this.radius * config.bellSizeMultiplier; // Scale impact area with bell size
        const impactGeometry = new THREE.CircleGeometry(impactRadius, 32);
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
            
            // Validate radius to prevent NaN values
            const safeRadius = isNaN(impactRadius) || impactRadius <= 0 ? 1.0 : impactRadius;
            const rayThickness = 0.2 * config.bellSizeMultiplier; // Scale ray thickness with bell size
            const rayGeometry = new THREE.BoxGeometry(rayThickness, rayThickness, safeRadius);
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.5
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.set(
                Math.cos(angle) * (impactRadius / 2),
                0.2,
                Math.sin(angle) * (impactRadius / 2)
            );
            
            ray.rotation.y = angle;
            
            effectGroup.add(ray);
        }
        
        // Create particles for visual effect
        const particleCount = Math.floor(30 * config.bellSizeMultiplier); // Scale particle count with bell size
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * impactRadius;
            
            const particleSize = 0.1 * config.bellSizeMultiplier; // Scale particle size with bell size
            const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
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
        
        // Position effect at the player's position
        effectGroup.position.copy(this.position);
        
        // Check if we have a game reference and can find a target enemy
        let targetPosition = null;
        
        if (this.game && this.game.enemyManager) {
            // Try to find the nearest enemy within the skill's range
            const nearestEnemy = this.game.enemyManager.findNearestEnemy(this.position, this.range);
            
            if (nearestEnemy) {
                // Get enemy position
                const enemyPosition = nearestEnemy.getPosition();
                
                // Calculate direction to enemy
                const direction = new THREE.Vector3().subVectors(enemyPosition, this.position).normalize();
                
                // Calculate target position (at the enemy's location)
                targetPosition = new THREE.Vector3(
                    enemyPosition.x,
                    this.position.y, // Keep the same Y height as the player
                    enemyPosition.z
                );
                
                // Move the effect group to the target position
                effectGroup.position.copy(targetPosition);
                
                console.log(`Wave of Light targeting enemy at position: ${targetPosition.x}, ${targetPosition.z}`);
                
                // Show notification if UI manager is available
                if (this.game.player && this.game.player.game && this.game.player.game.uiManager) {
                    this.game.player.game.uiManager.showNotification(`Wave of Light targeting ${nearestEnemy.type}`);
                }
            } else {
                console.log('No enemy in range for Wave of Light, dropping bell at current position');
            }
        }
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        // Store animation state with configuration and target position
        this.bellState = {
            phase: 'descending', // 'descending', 'impact', 'ascending'
            initialHeight: config.bellHeight,
            impactTime: 0,
            config: config, // Store config for use in update method
            targetPosition: targetPosition // Store the target position if an enemy was found
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
        // Skip update if skill is not active or effect is missing
        if (!this.isActive || !this.effect) return;
        
        // Check if the effect is still valid (not disposed)
        if (!this.effect.parent) {
            console.warn(`Skill ${this.name} effect has no parent, marking as inactive`);
            this.isActive = false;
            return;
        }
        
        // Validate delta to prevent NaN issues
        if (isNaN(delta) || delta <= 0) {
            console.warn(`Invalid delta value (${delta}) for skill ${this.name}, using default`);
            delta = 0.016; // Default to ~60fps
        }
        
        // Update elapsed time
        this.elapsedTime += delta;
        
        // Check if skill has expired and force cleanup
        if (this.elapsedTime >= this.duration) {
            console.log(`Skill ${this.name} has expired, cleaning up`);
            this.remove();
            return;
        }
        
        try {
            // Check if materials are valid before updating
            let hasInvalidMaterials = false;
            
            // Function to check if materials are valid
            const checkMaterials = (obj) => {
                if (!obj) return;
                
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        for (const material of obj.material) {
                            if (!material || material.disposed) {
                                hasInvalidMaterials = true;
                                return;
                            }
                        }
                    } else if (!obj.material || obj.material.disposed) {
                        hasInvalidMaterials = true;
                        return;
                    }
                }
                
                // Check children
                if (obj.children) {
                    for (const child of obj.children) {
                        checkMaterials(child);
                        if (hasInvalidMaterials) return;
                    }
                }
            };
            
            // Check if any materials are invalid
            checkMaterials(this.effect);
            
            // If we found invalid materials, remove the effect
            if (hasInvalidMaterials) {
                console.warn(`Skill ${this.name} has invalid materials, removing effect`);
                this.remove();
                return;
            }
            
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
                case 'summon':
                    this.updateSummonEffect(delta);
                    break;
                case 'mark':
                    this.updateMarkEffect(delta);
                    break;
                case 'teleport':
                    this.updateTeleportEffect(delta);
                    break;
                default:
                    this.updateDefaultEffect(delta);
                    break;
            }
            
            // Validate position after update to catch any issues
            if (!this.validateVector(this.position)) {
                console.warn(`Invalid position detected after updating skill ${this.name}, resetting`);
                this.position.set(0, 0, 0);
            }
        } catch (error) {
            console.error(`Error updating skill ${this.name}:`, error);
            // Mark skill as expired to remove it on next frame
            this.elapsedTime = this.duration * 2;
            // Force removal to clean up any problematic objects
            this.remove();
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
        // Special handling for Seven-Sided Strike
        if (this.name === 'Seven-Sided Strike' && this.sevenSidedStrikeState) {
            // Update the strike timer
            this.sevenSidedStrikeState.strikeTimer += delta;
            
            // Calculate which strike should be active
            const newStrikeIndex = Math.floor(this.elapsedTime / this.sevenSidedStrikeState.strikeDuration);
            
            // If we've moved to a new strike
            if (newStrikeIndex !== this.sevenSidedStrikeState.currentStrike && newStrikeIndex < this.hits) {
                // Update current strike index
                this.sevenSidedStrikeState.currentStrike = newStrikeIndex;
                this.sevenSidedStrikeState.strikeTimer = 0;
                
                // Find all monk figures (they're the ones with userData.index)
                const monkFigures = [];
                const connectingLines = [];
                
                for (let i = 0; i < this.effect.children.length; i++) {
                    const child = this.effect.children[i];
                    
                    if (child.userData && child.userData.index !== undefined) {
                        monkFigures.push(child);
                    } else if (child.userData && child.userData.startIndex !== undefined) {
                        connectingLines.push(child);
                    }
                }
                
                // Activate the current strike
                for (const figure of monkFigures) {
                    if (figure.userData.index === newStrikeIndex) {
                        // Activate this figure
                        figure.userData.active = true;
                        
                        // Animate scale from 0 to original
                        figure.scale.set(1, 1, 1);
                        
                        // Add a flash effect
                        const flashGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                        const flashMaterial = new THREE.MeshBasicMaterial({
                            color: this.color,
                            transparent: true,
                            opacity: 0.8
                        });
                        
                        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
                        flash.position.copy(figure.position);
                        flash.position.y += 0.5;
                        flash.userData = { type: 'flash', age: 0 };
                        
                        this.effect.add(flash);
                    } else if (figure.userData.index < newStrikeIndex) {
                        // Deactivate previous figures
                        figure.userData.active = false;
                        figure.scale.set(0, 0, 0);
                    }
                }
                
                // Highlight the connecting line to the next strike
                for (const line of connectingLines) {
                    if (line.userData.startIndex === newStrikeIndex) {
                        // Highlight this line
                        line.material.opacity = 0.9;
                        line.material.emissive = new THREE.Color(this.color);
                        line.material.emissiveIntensity = 1;
                    } else {
                        // Reset other lines
                        line.material.opacity = line.userData.originalOpacity;
                        line.material.emissive = undefined;
                    }
                }
            }
            
            // Update active monk figure
            for (let i = 0; i < this.effect.children.length; i++) {
                const child = this.effect.children[i];
                
                if (child.userData && child.userData.index !== undefined && child.userData.active) {
                    // Animate the active monk
                    
                    // Calculate animation progress (0 to 1)
                    const progress = this.sevenSidedStrikeState.strikeTimer / this.sevenSidedStrikeState.strikeDuration;
                    
                    // Pulse the strike effect (energy around fist)
                    const strikeEffect = child.children.find(c => 
                        c.geometry && c.geometry.type === 'SphereGeometry' && 
                        c.position.x > 0 && c.position.y > 0
                    );
                    
                    if (strikeEffect) {
                        const pulseScale = 0.8 + Math.sin(progress * Math.PI * 4) * 0.4;
                        strikeEffect.scale.set(pulseScale, pulseScale, pulseScale);
                        
                        if (strikeEffect.material) {
                            strikeEffect.material.opacity = Math.max(0.5, 1 - progress);
                        }
                    }
                    
                    // Animate the motion blur trail
                    const trail = child.children.find(c => 
                        c.geometry && c.geometry.type === 'PlaneGeometry'
                    );
                    
                    if (trail) {
                        // Fade out the trail as the strike progresses
                        if (trail.material) {
                            trail.material.opacity = Math.max(0.1, 0.5 - (progress * 0.5));
                        }
                        
                        // Stretch the trail for motion effect
                        const stretchFactor = 1 + (Math.sin(progress * Math.PI) * 0.5);
                        trail.scale.set(stretchFactor, 1, 1);
                    }
                    
                    // Rotate the monk slightly for dynamic pose
                    child.rotation.y += Math.sin(progress * Math.PI) * 0.1;
                    
                    // If near the end of this strike's duration, start fading it out
                    if (progress > 0.8) {
                        const fadeOutFactor = (progress - 0.8) / 0.2;
                        child.scale.set(
                            1 - fadeOutFactor,
                            1 - fadeOutFactor,
                            1 - fadeOutFactor
                        );
                    }
                }
            }
            
            // Update flash effects
            const flashesToRemove = [];
            
            for (let i = 0; i < this.effect.children.length; i++) {
                const child = this.effect.children[i];
                
                if (child.userData && child.userData.type === 'flash') {
                    // Update flash age
                    child.userData.age += delta;
                    
                    // Expand and fade out flash
                    const flashProgress = child.userData.age / 0.3; // 0.3 seconds duration
                    const flashScale = 1 + (flashProgress * 2);
                    
                    child.scale.set(flashScale, flashScale, flashScale);
                    
                    if (child.material) {
                        child.material.opacity = Math.max(0, 0.8 - (flashProgress * 0.8));
                    }
                    
                    // Mark for removal if too old
                    if (flashProgress >= 1) {
                        flashesToRemove.push(child);
                    }
                }
            }
            
            // Remove expired flashes
            for (const flash of flashesToRemove) {
                this.effect.remove(flash);
            }
            
            // Animate the central vortex
            if (this.sevenSidedStrikeState.vortex) {
                const vortex = this.sevenSidedStrikeState.vortex;
                
                // Rotate the vortex
                vortex.rotation.z += vortex.userData.rotationSpeed * delta;
                
                // Pulse the vortex
                const pulseScale = 0.8 + Math.sin(this.elapsedTime * vortex.userData.pulseSpeed) * 0.2;
                vortex.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Adjust opacity based on overall progress
                const overallProgress = this.elapsedTime / this.duration;
                
                if (overallProgress < 0.2) {
                    // Fade in
                    vortex.material.opacity = Math.min(0.7, overallProgress * 3.5);
                } else if (overallProgress > 0.8) {
                    // Fade out
                    vortex.material.opacity = Math.max(0, 0.7 - ((overallProgress - 0.8) * 3.5));
                }
            }
        } else {
            // Default multi-effect behavior
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
    }
    
    updateBuffEffect(delta) {
        // Special handling for Inner Sanctuary
        if (this.name === 'Inner Sanctuary' && this.sanctuaryState) {
            // Update sanctuary state
            this.sanctuaryState.age += delta;
            
            // Get the sanctuary group (first child of effect group)
            const sanctuaryGroup = this.effect.children[0];
            
            // Find the dome, edge ring, and base
            const dome = sanctuaryGroup.children.find(child => 
                child.geometry && child.geometry.type === 'SphereGeometry'
            );
            
            const edge = sanctuaryGroup.children.find(child => 
                child.geometry && child.geometry.type === 'TorusGeometry'
            );
            
            const base = sanctuaryGroup.children.find(child => 
                child.geometry && child.geometry.type === 'CylinderGeometry' && 
                child.position.y < 0.1
            );
            
            // Animate the dome
            if (dome) {
                // Pulse the dome
                const domeScale = 1 + Math.sin(this.sanctuaryState.age * 0.5) * 0.05;
                dome.scale.set(domeScale, domeScale, domeScale);
                
                // Adjust dome opacity based on damage/attacks
                // This would be connected to game logic in a real implementation
                const baseDomeOpacity = 0.2;
                const pulseOpacity = Math.sin(this.sanctuaryState.age * 3) * 0.05;
                
                // Simulate dome reacting to attacks with random flashes
                if (Math.random() < 0.01) {
                    // Random flash
                    dome.material.opacity = 0.4;
                } else {
                    // Normal state
                    dome.material.opacity = baseDomeOpacity + Math.max(0, pulseOpacity);
                }
            }
            
            // Animate the edge ring
            if (edge) {
                // Rotate the edge ring
                edge.rotation.z += delta * 0.5;
                
                // Pulse the edge
                const edgeScale = 1 + Math.sin(this.sanctuaryState.age * 2) * 0.1;
                edge.scale.set(edgeScale, edgeScale, 1);
                
                // Adjust emissive intensity
                if (edge.material) {
                    edge.material.emissiveIntensity = 1 + Math.sin(this.sanctuaryState.age * 3) * 0.5;
                }
            }
            
            // Animate the base
            if (base) {
                // Subtle pulse for the base
                const baseScale = 1 + Math.sin(this.sanctuaryState.age * 0.7) * 0.03;
                base.scale.set(baseScale, 1, baseScale);
            }
            
            // Animate runes
            for (let i = 0; i < sanctuaryGroup.children.length; i++) {
                const child = sanctuaryGroup.children[i];
                
                // Check if this is a rune group (contains a shape geometry)
                if (child.children && child.children.length > 0 && 
                    child.children[0].geometry && 
                    child.children[0].geometry.type === 'ShapeGeometry') {
                    
                    const rune = child.children[0];
                    
                    // Hover animation
                    if (rune.userData && rune.userData.initialY !== undefined) {
                        const hoverOffset = Math.sin(this.sanctuaryState.age * rune.userData.hoverSpeed) * 0.05;
                        child.position.y = rune.userData.initialY + hoverOffset;
                    }
                    
                    // Rotation animation
                    if (rune.userData && rune.userData.rotationSpeed) {
                        rune.rotation.z += rune.userData.rotationSpeed * delta;
                    }
                    
                    // Pulse animation
                    if (rune.userData && rune.userData.pulseSpeed) {
                        const pulseScale = 0.9 + Math.sin(this.sanctuaryState.age * rune.userData.pulseSpeed) * 0.1;
                        rune.scale.set(pulseScale, pulseScale, pulseScale);
                    }
                    
                    // Adjust emissive intensity
                    if (rune.material) {
                        rune.material.emissiveIntensity = 1 + Math.sin(this.sanctuaryState.age * 5) * 0.5;
                    }
                }
            }
            
            // Animate energy pillars
            const pillars = sanctuaryGroup.children.filter(child => 
                child.geometry && 
                child.geometry.type === 'CylinderGeometry' && 
                child.position.y > 0.5
            );
            
            for (const pillar of pillars) {
                if (pillar.userData) {
                    // Pulse height
                    const heightScale = 1 + Math.sin(this.sanctuaryState.age * pillar.userData.pulseSpeed) * 0.2;
                    pillar.scale.y = heightScale;
                    
                    // Adjust position to keep bottom at same level
                    pillar.position.y = 1 + ((heightScale - 1) * pillar.geometry.parameters.height / 2);
                    
                    // Pulse opacity
                    if (pillar.material) {
                        pillar.material.opacity = 0.3 + Math.abs(Math.sin(this.sanctuaryState.age * 2)) * 0.3;
                    }
                }
            }
            
            // Animate mandala
            if (this.sanctuaryState.mandala) {
                const mandala = this.sanctuaryState.mandala;
                
                // Rotate concentric circles
                for (let i = 0; i < mandala.children.length; i++) {
                    const child = mandala.children[i];
                    
                    if (child.geometry && child.geometry.type === 'RingGeometry') {
                        if (child.userData && child.userData.rotationSpeed) {
                            // Rotate at different speeds and directions
                            child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction;
                        }
                    }
                }
                
                // Pulse the central core
                const core = mandala.children.find(child => 
                    child.geometry && child.geometry.type === 'SphereGeometry'
                );
                
                if (core) {
                    const coreScale = 0.8 + Math.sin(this.sanctuaryState.age * 5) * 0.2;
                    core.scale.set(coreScale, coreScale, coreScale);
                    
                    if (core.material) {
                        core.material.emissiveIntensity = 1.5 + Math.sin(this.sanctuaryState.age * 7) * 0.5;
                    }
                }
                
                // Animate lotus petals
                const petals = mandala.children.filter(child => 
                    child.geometry && 
                    child.geometry.type === 'ShapeGeometry'
                );
                
                for (const petal of petals) {
                    if (petal.userData && petal.userData.pulseSpeed) {
                        const petalScale = 0.9 + Math.sin(this.sanctuaryState.age * petal.userData.pulseSpeed) * 0.1;
                        petal.scale.set(petalScale, petalScale, petalScale);
                    }
                }
                
                // Rotate entire mandala slowly
                mandala.rotation.z += delta * 0.1;
            }
            
            // Animate particles
            for (const particle of this.sanctuaryState.particles) {
                if (particle.userData) {
                    // Update orbit position
                    particle.userData.orbitAngle += particle.userData.orbitSpeed * delta;
                    
                    // Calculate new position
                    const newX = Math.cos(particle.userData.orbitAngle) * particle.userData.orbitRadius;
                    const newZ = Math.sin(particle.userData.orbitAngle) * particle.userData.orbitRadius;
                    
                    // Update vertical position with sine wave
                    const newY = particle.userData.initialHeight + 
                                Math.sin(this.sanctuaryState.age * particle.userData.verticalSpeed) * 
                                particle.userData.amplitude;
                    
                    // Update particle position
                    particle.position.set(newX, newY, newZ);
                    
                    // Pulse particle size
                    const particleScale = 0.8 + Math.sin(this.sanctuaryState.age * 3 + 
                                                        particle.userData.orbitAngle) * 0.2;
                    particle.scale.set(particleScale, particleScale, particleScale);
                }
            }
            
            // Handle fade-in and fade-out
            const overallProgress = this.elapsedTime / this.duration;
            
            if (overallProgress < 0.1) {
                // Fade in
                sanctuaryGroup.traverse(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                const targetOpacity = mat.opacity / 0.1;
                                mat.opacity = Math.min(targetOpacity, overallProgress * 10 * targetOpacity);
                            });
                        } else {
                            const targetOpacity = child.material.opacity;
                            child.material.opacity = Math.min(targetOpacity, overallProgress * 10 * targetOpacity);
                        }
                    }
                });
            } else if (overallProgress > 0.9) {
                // Fade out
                const fadeOutProgress = (overallProgress - 0.9) / 0.1;
                
                sanctuaryGroup.traverse(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = Math.max(0, mat.opacity * (1 - fadeOutProgress));
                            });
                        } else {
                            child.material.opacity = Math.max(0, child.material.opacity * (1 - fadeOutProgress));
                        }
                    }
                });
            }
        } else {
            // Default buff effect behavior
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
    }
    
    updateWaveEffect(delta) {
        // Get bell group (first child of effect group)
        const bellGroup = this.effect.children[0];
        
        // Get impact area (second child of effect group)
        const impactArea = this.effect.children[1];
        
        // Get config from bell state
        const config = this.bellState.config || {
            bellSizeMultiplier: 2.0,
            bellHeight: 8
        };
        
        // Animation phases for the bell
        switch (this.bellState.phase) {
            case 'descending':
                // Bell descends from the sky
                const descentSpeed = 15 * Math.sqrt(config.bellSizeMultiplier); // Scale speed with bell size
                bellGroup.position.y -= descentSpeed * delta;
                
                // When bell reaches near ground level, switch to impact phase
                const groundClearance = 0.5 * config.bellSizeMultiplier;
                if (bellGroup.position.y <= groundClearance) {
                    bellGroup.position.y = groundClearance; // Ensure bell doesn't go below ground
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
                
                // Expand impact area - scale with bell size
                const expansionSpeed = 5 * Math.sqrt(config.bellSizeMultiplier);
                const maxScale = 1.5 * config.bellSizeMultiplier;
                const currentScale = Math.min(this.bellState.impactTime * expansionSpeed, maxScale);
                impactArea.scale.set(currentScale, currentScale, currentScale);
                
                // Fade impact area as it expands
                impactArea.material.opacity = 0.7 * (1 - (currentScale / maxScale));
                
                // Make bell vibrate during impact - scale vibration with bell size
                const vibrationIntensity = 0.2 * config.bellSizeMultiplier * (1 - (this.bellState.impactTime / 0.5));
                bellGroup.rotation.z = Math.sin(this.bellState.impactTime * 40) * vibrationIntensity;
                
                // Animate light rays
                for (let i = 2; i < 2 + 8; i++) { // Rays are children 2-9
                    if (this.effect.children[i]) {
                        const ray = this.effect.children[i];
                        ray.scale.z = 1 + Math.sin(this.bellState.impactTime * 10) * 0.5 * config.bellSizeMultiplier;
                        ray.material.opacity = 0.5 * (1 - (this.bellState.impactTime / 0.5));
                    }
                }
                
                // After impact time, switch to ascending phase
                if (this.bellState.impactTime >= 0.5) {
                    this.bellState.phase = 'ascending';
                }
                break;
                
            case 'ascending':
                // Bell ascends back to the sky - scale speed with bell size
                const ascentSpeed = 10 * Math.sqrt(config.bellSizeMultiplier);
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
                    
                    // Move particles outward and upward - scale movement with bell size
                    const directionToCenter = new THREE.Vector3(
                        particle.position.x,
                        0,
                        particle.position.z
                    ).normalize();
                    
                    particle.position.x += directionToCenter.x * delta * 2 * config.bellSizeMultiplier;
                    particle.position.z += directionToCenter.z * delta * 2 * config.bellSizeMultiplier;
                    particle.position.y += delta * 3 * config.bellSizeMultiplier;
                    
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
    
    createSummonEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Special handling for Mystic Ally
        if (this.name === 'Mystic Ally') {
            // Create a more complex and visually impressive effect for Mystic Ally
            
            // Create summoning circle
            const summoningGroup = new THREE.Group();
            
            // Create base summoning circle
            const circleGeometry = new THREE.CircleGeometry(this.radius, 32);
            const circleMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
                emissive: this.color,
                emissiveIntensity: 0.5
            });
            
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            circle.rotation.x = -Math.PI / 2;
            circle.position.y = 0.01;
            summoningGroup.add(circle);
            
            // Create magical runes and symbols on the circle
            const runeCount = 5;
            for (let i = 0; i < runeCount; i++) {
                const angle = (i / runeCount) * Math.PI * 2;
                const radius = this.radius * 0.7;
                
                // Create rune shape
                const runeShape = new THREE.Shape();
                
                // Create different rune shapes
                switch (i % 5) {
                    case 0: // Triangle
                        runeShape.moveTo(0, 0.15);
                        runeShape.lineTo(-0.15, -0.15);
                        runeShape.lineTo(0.15, -0.15);
                        runeShape.lineTo(0, 0.15);
                        break;
                    case 1: // Square
                        runeShape.moveTo(-0.1, -0.1);
                        runeShape.lineTo(0.1, -0.1);
                        runeShape.lineTo(0.1, 0.1);
                        runeShape.lineTo(-0.1, 0.1);
                        runeShape.lineTo(-0.1, -0.1);
                        break;
                    case 2: // Pentagon
                        for (let j = 0; j < 5; j++) {
                            const a = (j / 5) * Math.PI * 2;
                            const x = Math.cos(a) * 0.12;
                            const y = Math.sin(a) * 0.12;
                            if (j === 0) runeShape.moveTo(x, y);
                            else runeShape.lineTo(x, y);
                        }
                        break;
                    case 3: // Star
                        for (let j = 0; j < 10; j++) {
                            const a = (j / 10) * Math.PI * 2;
                            const r = j % 2 === 0 ? 0.15 : 0.07;
                            const x = Math.cos(a) * r;
                            const y = Math.sin(a) * r;
                            if (j === 0) runeShape.moveTo(x, y);
                            else runeShape.lineTo(x, y);
                        }
                        break;
                    case 4: // Circle with inner circle
                        runeShape.absarc(0, 0, 0.12, 0, Math.PI * 2, false);
                        const hole = new THREE.Path();
                        hole.absarc(0, 0, 0.06, 0, Math.PI * 2, true);
                        runeShape.holes.push(hole);
                        break;
                }
                
                const runeGeometry = new THREE.ShapeGeometry(runeShape);
                const runeMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: this.color,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });
                
                const rune = new THREE.Mesh(runeGeometry, runeMaterial);
                rune.position.set(
                    Math.cos(angle) * radius,
                    0.02,
                    Math.sin(angle) * radius
                );
                rune.rotation.x = -Math.PI / 2;
                
                // Store animation data
                rune.userData = {
                    rotationSpeed: 1 + (i * 0.5),
                    pulseSpeed: 2 + (i * 0.3),
                    initialPosition: rune.position.clone()
                };
                
                summoningGroup.add(rune);
            }
            
            // Create magical energy rings
            const ringCount = 3;
            for (let i = 0; i < ringCount; i++) {
                const ringRadius = this.radius * (0.5 + (i * 0.2));
                const ringGeometry = new THREE.RingGeometry(
                    ringRadius - 0.05,
                    ringRadius,
                    32
                );
                const ringMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.7 - (i * 0.1),
                    side: THREE.DoubleSide
                });
                
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = -Math.PI / 2;
                ring.position.y = 0.03 + (i * 0.02);
                
                // Store animation data
                ring.userData = {
                    rotationSpeed: 0.5 + (i * 0.3),
                    direction: i % 2 === 0 ? 1 : -1 // Alternate directions
                };
                
                summoningGroup.add(ring);
            }
            
            // Create energy particles
            const particleCount = 40;
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Random position within the summoning circle
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.radius;
                const height = Math.random() * 2;
                
                // Create particle
                const particleSize = 0.03 + (Math.random() * 0.05);
                const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
                const particleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: this.color,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.6 + (Math.random() * 0.4)
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                // Store particle animation data
                particle.userData = {
                    speed: 0.5 + (Math.random() * 1.5),
                    rotationSpeed: 0.1 + (Math.random() * 0.5),
                    initialHeight: height,
                    maxHeight: 2 + (Math.random() * 1)
                };
                
                summoningGroup.add(particle);
                particles.push(particle);
            }
            
            // Create the spirit ally
            const allyGroup = new THREE.Group();
            allyGroup.position.y = 1; // Start above the summoning circle
            
            // Create the ally's body (ethereal, semi-transparent)
            const bodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.7,
                metalness: 0.2,
                roughness: 0.8
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            allyGroup.add(body);
            
            // Create swirling energy around the ally
            const energyCount = 3;
            for (let i = 0; i < energyCount; i++) {
                const curve = new THREE.EllipseCurve(
                    0, 0,                         // Center
                    0.6, 0.6,                     // X and Y radius
                    0, Math.PI * 2,               // Start and end angle
                    false,                        // Clockwise
                    i * (Math.PI / energyCount)   // Rotation
                );
                
                const points = curve.getPoints(50);
                const energyGeometry = new THREE.BufferGeometry().setFromPoints(points);
                
                // Add height to make it 3D
                const positions = energyGeometry.attributes.position.array;
                for (let j = 0; j < positions.length; j += 3) {
                    positions[j + 2] = Math.sin(j / 3 * 0.2) * 0.2;
                }
                
                const energyMaterial = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8
                });
                
                const energy = new THREE.Line(energyGeometry, energyMaterial);
                energy.rotation.x = Math.PI / 2;
                
                // Store animation data
                energy.userData = {
                    rotationSpeed: 0.5 + (i * 0.2),
                    rotationAxis: new THREE.Vector3(
                        Math.random() - 0.5,
                        Math.random() - 0.5,
                        Math.random() - 0.5
                    ).normalize()
                };
                
                allyGroup.add(energy);
            }
            
            // Create ally features (eyes, etc.)
            const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const eyeMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.9
            });
            
            // Left eye
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.15, 0.1, 0.3);
            allyGroup.add(leftEye);
            
            // Right eye
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.15, 0.1, 0.3);
            allyGroup.add(rightEye);
            
            // Create energy wisps trailing the ally
            const wispCount = 5;
            for (let i = 0; i < wispCount; i++) {
                const wispGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const wispMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.6
                });
                
                const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
                
                // Position wisps in a trail behind the ally
                const angle = (i / wispCount) * Math.PI;
                wisp.position.set(
                    Math.cos(angle) * 0.2,
                    -0.2,
                    -0.3 - (i * 0.1)
                );
                
                // Store animation data
                wisp.userData = {
                    pulseSpeed: 3 + (i * 0.5),
                    orbitSpeed: 1 + (i * 0.3),
                    orbitRadius: 0.1 + (i * 0.05),
                    initialPosition: wisp.position.clone()
                };
                
                allyGroup.add(wisp);
            }
            
            // Add ally to the summoning group
            summoningGroup.add(allyGroup);
            
            // Add summoning group to effect group
            effectGroup.add(summoningGroup);
            
            // Store animation state
            this.mysticAllyState = {
                age: 0,
                phase: 'summoning', // 'summoning', 'active', 'dissipating'
                particles: particles,
                ally: allyGroup,
                summoningCircle: summoningGroup,
                initialAllyHeight: allyGroup.position.y
            };
        } else {
            // Default summon effect implementation
            // Create a simple effect (sphere)
            const effectGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const effectMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7
            });
            
            const effect = new THREE.Mesh(effectGeometry, effectMaterial);
            effectGroup.add(effect);
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    createMarkEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Special handling for Exploding Palm
        if (this.name === 'Exploding Palm') {
            // Create a flying palm effect that moves forward from the player
            
            // Create the main palm group
            const palmGroup = new THREE.Group();
            
            // Create a 3D palm model with fingers
            const handGroup = new THREE.Group();
            
            // Create palm base (hand) - INCREASED SIZE for visibility
            const palmBaseGeometry = new THREE.BoxGeometry(1.2, 0.3, 1.5);
            const palmBaseMaterial = new THREE.MeshStandardMaterial({
                color: 0xff3333,
                emissive: 0xff3333,
                emissiveIntensity: 2, // Increased intensity
                transparent: true,
                opacity: 0.9,
            });
            
            const palmBase = new THREE.Mesh(palmBaseGeometry, palmBaseMaterial);
            palmBase.position.y = 0;
            handGroup.add(palmBase);
            
            // Create fingers (5 elongated shapes)
            const fingerCount = 5;
            const fingerPositions = [
                { x: -0.45, z: 0.6 },  // Thumb - adjusted positions
                { x: -0.225, z: 0.75 },  // Index
                { x: 0, z: 0.825 },     // Middle
                { x: 0.225, z: 0.75 },   // Ring
                { x: 0.45, z: 0.6 }     // Pinky
            ];
            
            const fingerLengths = [0.45, 0.6, 0.75, 0.6, 0.45]; // Longer fingers for visibility
            
            for (let i = 0; i < fingerCount; i++) {
                // Create finger - INCREASED SIZE for visibility
                const fingerGeometry = new THREE.BoxGeometry(0.18, 0.225, fingerLengths[i]);
                const fingerMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff3333,
                    emissive: 0xff3333,
                    emissiveIntensity: 2, // Increased intensity
                    transparent: true,
                    opacity: 0.9,
                });
                
                const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
                
                // Position finger
                finger.position.set(
                    fingerPositions[i].x,
                    0.075,
                    fingerPositions[i].z + (fingerLengths[i] / 2)
                );
                
                // Add finger joints (knuckles) - INCREASED SIZE for visibility
                const knuckleGeometry = new THREE.SphereGeometry(0.105, 8, 8);
                const knuckleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff4444,
                    emissive: 0xff4444,
                    emissiveIntensity: 2, // Increased intensity
                    transparent: true,
                    opacity: 0.9,
                });
                
                const knuckle = new THREE.Mesh(knuckleGeometry, knuckleMaterial);
                knuckle.position.set(
                    fingerPositions[i].x,
                    0.075,
                    fingerPositions[i].z
                );
                
                handGroup.add(finger);
                handGroup.add(knuckle);
                
                // Add fingernails - INCREASED SIZE for visibility
                const nailGeometry = new THREE.BoxGeometry(0.15, 0.075, 0.15);
                const nailMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffdddd,
                    emissive: 0xffaaaa,
                    emissiveIntensity: 1.5, // Increased intensity
                    transparent: true,
                    opacity: 0.9,
                });
                
                const nail = new THREE.Mesh(nailGeometry, nailMaterial);
                nail.position.set(
                    fingerPositions[i].x,
                    0.15,
                    fingerPositions[i].z + fingerLengths[i]
                );
                
                handGroup.add(nail);
            }
            
            // Add energy aura around the hand - INCREASED SIZE for visibility
            const auraGeometry = new THREE.SphereGeometry(1.5, 16, 16);
            const auraMaterial = new THREE.MeshStandardMaterial({
                color: 0xff5500,
                emissive: 0xff5500,
                emissiveIntensity: 2, // Increased intensity
                transparent: true,
                opacity: 0.5, // Increased opacity
                side: THREE.DoubleSide,
                wireframe: true
            });
            
            const aura = new THREE.Mesh(auraGeometry, auraMaterial);
            aura.scale.set(1.5, 0.75, 1.8); // Increased scale
            handGroup.add(aura);
            
            // Add energy particles around the hand - INCREASED SIZE and COUNT
            const particleCount = 45; // More particles
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Random position around the hand
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const radius = 1.2 + Math.random() * 0.6; // Larger radius
                
                const x = radius * Math.sin(theta) * Math.cos(phi);
                const y = radius * Math.sin(theta) * Math.sin(phi) * 0.5; // Flatten in Y
                const z = radius * Math.cos(theta);
                
                // Create particle - INCREASED SIZE
                const particleSize = 0.05 + Math.random() * 0.08; // Larger particles
                const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
                const particleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff3300,
                    emissive: 0xff3300,
                    emissiveIntensity: 2, // Increased intensity
                    transparent: true,
                    opacity: 0.8 + Math.random() * 0.2 // Higher opacity
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(x, y, z);
                
                // Store particle animation data
                particle.userData = {
                    orbitSpeed: 1.0 + Math.random() * 2.0, // Faster orbit
                    orbitRadius: new THREE.Vector3(x, y, z).length(),
                    orbitAxis: new THREE.Vector3(
                        Math.random() - 0.5,
                        Math.random() - 0.5,
                        Math.random() - 0.5
                    ).normalize(),
                    orbitAngle: Math.random() * Math.PI * 2,
                    initialPosition: new THREE.Vector3(x, y, z)
                };
                
                handGroup.add(particle);
                particles.push(particle);
            }
            
            // Add trailing energy effect - INCREASED SIZE
            const trailCount = 7; // More trails
            const trails = [];
            
            for (let i = 0; i < trailCount; i++) {
                const trailGeometry = new THREE.PlaneGeometry(1.2, 1.2); // Larger trails
                const trailMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff3300,
                    transparent: true,
                    opacity: 0.7 - (i * 0.1), // Higher base opacity
                    side: THREE.DoubleSide
                });
                
                const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                trail.position.z = -0.7 - (i * 0.4); // More spacing
                trail.rotation.x = Math.PI / 2;
                
                handGroup.add(trail);
                trails.push(trail);
            }
            
            // FIX: Rotate hand to face forward with fingers pointing upward (to the sky)
            // Changed rotation to make palm face forward with fingers extended upward
            handGroup.rotation.x = -Math.PI / 2; // Rotate to make fingers point up
            handGroup.rotation.z = 0; // No rotation on Z axis
            
            // Position higher for better visibility
            handGroup.position.y = 1.5; // Higher position
            
            palmGroup.add(handGroup);
            
            // Create explosion effect (initially hidden)
            const explosionGroup = new THREE.Group();
            explosionGroup.visible = false;
            
            // Create giant palm for explosion - IMPROVED SHAPE
            const giantPalmShape = new THREE.Shape();
            
            // Create a larger hand shape for the explosion
            // Palm center - INCREASED SIZE
            giantPalmShape.moveTo(0, 0);
            giantPalmShape.absarc(0, 0, 0.6, 0, Math.PI * 2, false); // Larger palm center
            
            // Fingers (5 elongated shapes) - IMPROVED SHAPE
            const giantFingerCount = 5;
            for (let i = 0; i < giantFingerCount; i++) {
                const angle = ((i / giantFingerCount) * Math.PI * 1.2) - Math.PI * 0.1;
                const length = 0.9 + (i === 2 ? 0.3 : 0); // Longer fingers, middle finger even longer
                
                const fingerShape = new THREE.Shape();
                fingerShape.moveTo(0, 0);
                fingerShape.absellipse(
                    Math.cos(angle) * 0.6, // Adjusted to match larger palm
                    Math.sin(angle) * 0.6,
                    0.22, // Wider fingers
                    length,
                    0,
                    Math.PI * 2,
                    false,
                    angle
                );
                
                giantPalmShape.holes.push(fingerShape);
            }
            
            const giantPalmGeometry = new THREE.ShapeGeometry(giantPalmShape);
            const giantPalmMaterial = new THREE.MeshStandardMaterial({
                color: 0xff3300,
                emissive: 0xff3300,
                emissiveIntensity: 3, // Increased intensity
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            
            const giantPalm = new THREE.Mesh(giantPalmGeometry, giantPalmMaterial);
            giantPalm.rotation.x = -Math.PI / 2;
            giantPalm.position.y = 0.5; // Position above ground
            giantPalm.scale.set(4, 4, 4); // Make it even larger
            
            // Store animation data
            giantPalm.userData = {
                initialScale: 0.2, // Start slightly larger
                targetScale: 4, // Grow to larger size
                rotationSpeed: 1.5 // Rotate faster
            };
            
            // Start with small scale
            giantPalm.scale.set(
                giantPalm.userData.initialScale,
                giantPalm.userData.initialScale,
                giantPalm.userData.initialScale
            );
            
            explosionGroup.add(giantPalm);
            
            // Create explosion core
            const coreGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const coreMaterial = new THREE.MeshStandardMaterial({
                color: 0xff5500,
                emissive: 0xff5500,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.9
            });
            
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            explosionGroup.add(core);
            
            // Create explosion waves
            const waveCount = 3;
            for (let i = 0; i < waveCount; i++) {
                const waveGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const waveMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff3300,
                    emissive: 0xff3300,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.7 - (i * 0.1),
                    wireframe: true
                });
                
                const wave = new THREE.Mesh(waveGeometry, waveMaterial);
                
                // Store animation data
                wave.userData = {
                    expansionSpeed: 3 - (i * 0.5),
                    initialScale: 1 + (i * 0.5)
                };
                
                // Set initial scale
                wave.scale.set(
                    wave.userData.initialScale,
                    wave.userData.initialScale,
                    wave.userData.initialScale
                );
                
                explosionGroup.add(wave);
            }
            
            // Create explosion particles
            const explosionParticleCount = 30;
            for (let i = 0; i < explosionParticleCount; i++) {
                // Random direction
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const radius = 0.3;
                
                const x = radius * Math.sin(theta) * Math.cos(phi);
                const y = radius * Math.sin(theta) * Math.sin(phi);
                const z = radius * Math.cos(theta);
                
                // Create particle
                const particleGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.05, 8, 8);
                const particleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.8
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(x, y, z);
                
                // Store particle data
                particle.userData = {
                    velocity: new THREE.Vector3(x, y, z).normalize().multiplyScalar(1 + Math.random() * 2),
                    drag: 0.92 + Math.random() * 0.05
                };
                
                explosionGroup.add(particle);
            }
            
            palmGroup.add(explosionGroup);
            
            // Add palm group to effect group
            effectGroup.add(palmGroup);
            
            // Store animation state
            this.explodingPalmState = {
                age: 0,
                phase: 'flying', // 'flying', 'exploding', 'fading'
                particles: particles,
                trails: trails,
                handGroup: handGroup,
                explosionGroup: explosionGroup,
                palmGroup: palmGroup,
                exploded: false,
                explosionTime: this.duration * 0.9, // Explode at 90% of duration (later)
                flyingSpeed: 6, // REDUCED speed of the flying palm (was 15)
                maxDistance: this.range * 1.5, // INCREASED maximum distance by 50%
                distanceTraveled: 0, // Current distance traveled
                hitTarget: false, // Whether the palm has hit a target
                targetPosition: null // Position where the palm hit a target
            };
        } else {
            // Default mark effect implementation
            // Create a simple effect (circle)
            const markGeometry = new THREE.CircleGeometry(this.radius * 0.5, 32);
            const markMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            mark.rotation.x = -Math.PI / 2;
            mark.position.y = 0.01;
            
            effectGroup.add(mark);
        }
        
        // Position effect - IMPORTANT: Set the correct orientation
        effectGroup.position.copy(this.position);
        
        // Set the correct rotation to face the direction the player is looking
        const rotationAngle = Math.atan2(this.direction.x, this.direction.z);
        effectGroup.rotation.y = rotationAngle;
        
        // For Exploding Palm, ensure the palm group is also properly rotated
        if (this.name === 'Exploding Palm' && this.explodingPalmState && this.explodingPalmState.palmGroup) {
            // Set the palm group's initial rotation to match the player's direction
            this.explodingPalmState.palmGroup.rotation.y = rotationAngle;
            
            // Ensure the hand is oriented correctly within the palm group
            if (this.explodingPalmState.handGroup) {
                // Fine-tune hand orientation if needed
                this.explodingPalmState.handGroup.rotation.y = 0; // Keep aligned with palm group
            }
            
            // Debug log to confirm direction
            console.log(`Exploding Palm initial direction: ${this.direction.x.toFixed(2)}, ${this.direction.z.toFixed(2)}`);
            console.log(`Exploding Palm rotation angle: ${rotationAngle.toFixed(2)} radians`);
        }
        
        // Debug message to confirm the skill is being created
        console.log(`Created Exploding Palm effect at position:`, this.position, 
                    `with direction:`, this.direction, 
                    `and rotation:`, effectGroup.rotation);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    updateMarkEffect(delta) {
        // Special handling for Exploding Palm
        if (this.name === 'Exploding Palm' && this.explodingPalmState) {
            // Update state
            this.explodingPalmState.age += delta;
            
            // Get the palm group
            const palmGroup = this.explodingPalmState.palmGroup;
            const handGroup = this.explodingPalmState.handGroup;
            
            // Check for explosion triggers
            const shouldExplode = 
                // Explode if reached max distance
                this.explodingPalmState.distanceTraveled >= this.explodingPalmState.maxDistance ||
                // Explode if hit a target
                this.explodingPalmState.hitTarget ||
                // Explode if reached explosion time
                this.elapsedTime >= this.explodingPalmState.explosionTime;
            
            // Log progress for debugging
            if (Math.floor(this.elapsedTime) % 2 === 0 && Math.floor(this.elapsedTime) !== this.lastLoggedTime) {
                this.lastLoggedTime = Math.floor(this.elapsedTime);
                console.log(`Exploding Palm progress: ${Math.round((this.elapsedTime / this.duration) * 100)}% complete`);
                console.log(`Distance traveled: ${Math.round(this.explodingPalmState.distanceTraveled)} / ${Math.round(this.explodingPalmState.maxDistance)}`);
            }
                
            // Transition to exploding phase if needed
            if (this.explodingPalmState.phase === 'flying' && shouldExplode) {
                console.log(`Exploding Palm is exploding! Reason: ${
                    this.explodingPalmState.distanceTraveled >= this.explodingPalmState.maxDistance ? 'Max distance reached' :
                    this.explodingPalmState.hitTarget ? 'Hit target' : 'Duration reached'
                }`);
                this.explodingPalmState.phase = 'exploding';
                this.explodingPalmState.exploded = true;
                this.explodingPalmState.explosionGroup.visible = true;
                
                // Hide the flying hand
                if (handGroup) {
                    handGroup.visible = false;
                }
            }
            
            // Handle flying phase
            if (this.explodingPalmState.phase === 'flying') {
                // COMPLETELY REVISED AUTO-TARGETING SYSTEM
                // Always use the initial direction for the first frame
                let targetDirection;
                
                // On the first frame, use the initial direction (from player facing)
                if (this.explodingPalmState.age < delta * 2) {
                    // Use the initial direction set when the skill was created
                    targetDirection = this.direction.clone();
                    console.log("Using initial direction for Exploding Palm");
                } else {
                    // After first frame, check for enemies to target
                    let targetEnemy = null;
                    
                    // Default to continuing in the current direction if no enemy found
                    targetDirection = this.direction.clone();
                    
                    if (this.game && this.game.enemies) {
                        // Find the nearest enemy within range
                        let nearestDistance = Infinity;
                        const palmPosition = new THREE.Vector3(
                            palmGroup.position.x,
                            palmGroup.position.y,
                            palmGroup.position.z
                        );
                        
                        for (const enemy of this.game.enemies) {
                            if (enemy && enemy.position && !enemy.state.isDead) {
                                const distance = palmPosition.distanceTo(enemy.position);
                                
                                // Check if this enemy is closer than the current nearest
                                if (distance < nearestDistance && distance < this.range) {
                                    nearestDistance = distance;
                                    targetEnemy = enemy;
                                }
                            }
                        }
                        
                        // If we found a target enemy, adjust direction towards it
                        if (targetEnemy) {
                            // Calculate direction to enemy - this is a direct line from palm to enemy
                            const enemyPosition = targetEnemy.position.clone();
                            targetDirection = new THREE.Vector3().subVectors(enemyPosition, palmPosition).normalize();
                            
                            // Update palm rotation to face the enemy
                            const angle = Math.atan2(targetDirection.x, targetDirection.z);
                            palmGroup.rotation.y = angle;
                            
                            console.log(`Auto-targeting enemy with Exploding Palm, distance: ${nearestDistance.toFixed(2)}`);
                        }
                    }
                }
                
                // Move the palm forward
                const moveDistance = this.explodingPalmState.flyingSpeed * delta;
                this.explodingPalmState.distanceTraveled += moveDistance;
                
                // Update palm position using the target direction
                palmGroup.position.add(targetDirection.clone().multiplyScalar(moveDistance));
                
                // Animate hand to show power
                if (handGroup) {
                    // FIX: Keep the hand oriented correctly with fingers pointing forward
                    // No need to adjust rotation.x as we fixed it in createMarkEffect
                    
                    // Add very subtle slow pulse to show power
                    const pulseFactor = 1 + Math.sin(this.explodingPalmState.age * 2) * 0.03;
                    handGroup.scale.set(pulseFactor, pulseFactor, pulseFactor);
                    
                    // Create ground effect to show heaviness - dust/debris kicked up by the palm's power
                    if (Math.random() < 0.2) { // 20% chance each frame to create effect
                        // Create dust particle
                        const dustGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 8);
                        const dustMaterial = new THREE.MeshBasicMaterial({
                            color: 0x885533,
                            transparent: true,
                            opacity: 0.3 + Math.random() * 0.3
                        });
                        
                        const dust = new THREE.Mesh(dustGeometry, dustMaterial);
                        
                        // Position dust below and slightly behind the palm
                        const offsetX = (Math.random() - 0.5) * 2;
                        const offsetZ = -1 - Math.random() * 2;
                        dust.position.set(
                            offsetX,
                            -1.2, // Below the palm
                            offsetZ
                        );
                        
                        // Store velocity for animation
                        dust.userData = {
                            velocity: new THREE.Vector3(
                                offsetX * 0.5,
                                0.5 + Math.random() * 1.0, // Upward
                                offsetZ * 0.2
                            ),
                            age: 0,
                            maxAge: 0.5 + Math.random() * 0.5
                        };
                        
                        // Add to hand group
                        handGroup.add(dust);
                        
                        // Add to a list for cleanup
                        if (!this.explodingPalmState.dustParticles) {
                            this.explodingPalmState.dustParticles = [];
                        }
                        this.explodingPalmState.dustParticles.push(dust);
                    }
                    
                    // Animate existing dust particles
                    if (this.explodingPalmState.dustParticles) {
                        for (let i = this.explodingPalmState.dustParticles.length - 1; i >= 0; i--) {
                            const dust = this.explodingPalmState.dustParticles[i];
                            if (dust && dust.userData) {
                                // Update age
                                dust.userData.age += delta;
                                
                                // Move dust
                                dust.position.add(dust.userData.velocity.clone().multiplyScalar(delta));
                                
                                // Apply gravity
                                dust.userData.velocity.y -= 2 * delta;
                                
                                // Fade out
                                if (dust.material) {
                                    dust.material.opacity = Math.max(0, 0.6 * (1 - (dust.userData.age / dust.userData.maxAge)));
                                }
                                
                                // Remove if too old
                                if (dust.userData.age >= dust.userData.maxAge) {
                                    handGroup.remove(dust);
                                    this.explodingPalmState.dustParticles.splice(i, 1);
                                }
                            }
                        }
                    }
                }
                
                // Animate particles
                for (const particle of this.explodingPalmState.particles) {
                    if (particle.userData) {
                        // Update orbit position using quaternion rotation
                        const rotationAxis = particle.userData.orbitAxis;
                        const rotationAngle = particle.userData.orbitSpeed * delta;
                        
                        // Create quaternion for rotation
                        const quaternion = new THREE.Quaternion();
                        quaternion.setFromAxisAngle(rotationAxis, rotationAngle);
                        
                        // Get initial position and apply rotation
                        const position = particle.userData.initialPosition.clone();
                        position.applyQuaternion(quaternion);
                        
                        // Update particle position
                        particle.position.copy(position);
                        
                        // Store the updated position as the new initial position
                        particle.userData.initialPosition.copy(position);
                    }
                }
                
                // Animate trailing effect
                for (let i = 0; i < this.explodingPalmState.trails.length; i++) {
                    const trail = this.explodingPalmState.trails[i];
                    
                    // Fade out trails based on distance
                    const trailFade = 1 - (i / this.explodingPalmState.trails.length);
                    trail.material.opacity = 0.5 * trailFade;
                    
                    // Scale trails for a motion blur effect
                    const trailScale = 0.8 + (i * 0.1);
                    trail.scale.set(trailScale, trailScale, 1);
                }
                
                // Create ground impact effect to show heaviness
                if (!this.explodingPalmState.lastImpactTime || 
                    this.explodingPalmState.age - this.explodingPalmState.lastImpactTime > 0.5) { // Every 0.5 seconds
                    
                    this.explodingPalmState.lastImpactTime = this.explodingPalmState.age;
                    
                    // Create impact ring on the ground
                    const ringGeometry = new THREE.RingGeometry(0.2, 0.8, 16);
                    const ringMaterial = new THREE.MeshBasicMaterial({
                        color: 0xff3300,
                        transparent: true,
                        opacity: 0.7,
                        side: THREE.DoubleSide
                    });
                    
                    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                    ring.rotation.x = Math.PI / 2; // Lay flat on ground
                    ring.position.set(
                        palmGroup.position.x,
                        0.05, // Just above ground
                        palmGroup.position.z
                    );
                    
                    // Store animation data
                    ring.userData = {
                        age: 0,
                        maxAge: 1.0,
                        initialScale: 0.5,
                        targetScale: 3.0
                    };
                    
                    // Start small
                    ring.scale.set(
                        ring.userData.initialScale,
                        ring.userData.initialScale,
                        ring.userData.initialScale
                    );
                    
                    // Add to scene (not to palm group so it stays on ground)
                    if (this.game && this.game.scene) {
                        this.game.scene.add(ring);
                    } else if (this.effect.parent) {
                        this.effect.parent.add(ring);
                    }
                    
                    // Add to a list for cleanup
                    if (!this.explodingPalmState.impactRings) {
                        this.explodingPalmState.impactRings = [];
                    }
                    this.explodingPalmState.impactRings.push(ring);
                }
                
                // Animate existing impact rings
                if (this.explodingPalmState.impactRings) {
                    for (let i = this.explodingPalmState.impactRings.length - 1; i >= 0; i--) {
                        const ring = this.explodingPalmState.impactRings[i];
                        if (ring && ring.userData) {
                            // Update age
                            ring.userData.age += delta;
                            
                            // Expand ring
                            const progress = ring.userData.age / ring.userData.maxAge;
                            const scale = ring.userData.initialScale + 
                                         (ring.userData.targetScale - ring.userData.initialScale) * progress;
                            
                            ring.scale.set(scale, scale, scale);
                            
                            // Fade out
                            if (ring.material) {
                                ring.material.opacity = Math.max(0, 0.7 * (1 - progress));
                            }
                            
                            // Remove if too old
                            if (ring.userData.age >= ring.userData.maxAge) {
                                if (this.game && this.game.scene) {
                                    this.game.scene.remove(ring);
                                } else if (ring.parent) {
                                    ring.parent.remove(ring);
                                }
                                this.explodingPalmState.impactRings.splice(i, 1);
                            }
                        }
                    }
                }
                
                // Check for collision with enemies
                if (this.game && this.game.enemies) {
                    const palmPosition = new THREE.Vector3(
                        palmGroup.position.x,
                        palmGroup.position.y,
                        palmGroup.position.z
                    );
                    
                    // Check each enemy for collision
                    for (const enemy of this.game.enemies) {
                        if (enemy && enemy.position && !enemy.state.isDead) {
                            const distance = palmPosition.distanceTo(enemy.position);
                            
                            // If palm is close enough to enemy, mark it for explosion
                            if (distance < enemy.collisionRadius + 1) {
                                this.explodingPalmState.hitTarget = true;
                                this.explodingPalmState.targetPosition = enemy.position.clone();
                                
                                // Apply mark to enemy
                                if (enemy.applyMark) {
                                    enemy.applyMark('explodingPalm', this.damage);
                                }
                                
                                break;
                            }
                        }
                    }
                }
            }
            // Handle exploding phase
            else if (this.explodingPalmState.phase === 'exploding') {
                // Get explosion group
                const explosionGroup = this.explodingPalmState.explosionGroup;
                
                // Calculate explosion progress (0 to 1)
                const explosionDuration = this.duration * 0.2; // Last 20% of total duration
                const explosionProgress = (this.elapsedTime - (this.duration - explosionDuration)) / explosionDuration;
                
                // Find the giant palm
                const giantPalm = explosionGroup.children.find(child => 
                    child.geometry && 
                    child.geometry.type === 'ShapeGeometry'
                );
                
                if (giantPalm && giantPalm.userData) {
                    // Animate the giant palm
                    
                    // Scale up the palm dramatically during explosion
                    const initialScale = giantPalm.userData.initialScale;
                    const targetScale = giantPalm.userData.targetScale;
                    
                    // Easing function for dramatic effect
                    let scaleProgress;
                    if (explosionProgress < 0.3) {
                        // Fast initial growth
                        scaleProgress = explosionProgress / 0.3;
                    } else if (explosionProgress < 0.7) {
                        // Hold at full size
                        scaleProgress = 1;
                    } else {
                        // Fade out
                        scaleProgress = 1 - ((explosionProgress - 0.7) / 0.3);
                    }
                    
                    // Apply scale with easing
                    const currentScale = initialScale + (targetScale - initialScale) * scaleProgress;
                    
                    // Add pulsing effect
                    const pulseFactor = 1 + Math.sin(explosionProgress * Math.PI * 5) * 0.1;
                    const finalScale = currentScale * pulseFactor;
                    
                    giantPalm.scale.set(finalScale, finalScale, finalScale);
                    
                    // Rotate the palm
                    giantPalm.rotation.z += delta * giantPalm.userData.rotationSpeed;
                    
                    // Adjust position - rise up and then fall
                    let heightOffset;
                    if (explosionProgress < 0.5) {
                        // Rise up
                        heightOffset = explosionProgress * 2;
                    } else {
                        // Fall down
                        heightOffset = 1 - ((explosionProgress - 0.5) * 2);
                    }
                    
                    giantPalm.position.y = 0.5 + heightOffset * 2;
                    
                    // Adjust opacity
                    if (explosionProgress < 0.2) {
                        // Fade in
                        giantPalm.material.opacity = explosionProgress / 0.2 * 0.9;
                    } else if (explosionProgress > 0.7) {
                        // Fade out
                        giantPalm.material.opacity = Math.max(0, 0.9 - ((explosionProgress - 0.7) / 0.3) * 0.9);
                    } else {
                        // Full opacity during main explosion
                        giantPalm.material.opacity = 0.9;
                    }
                    
                    // Increase emissive intensity at peak
                    const emissiveIntensity = 2 + Math.sin(explosionProgress * Math.PI) * 3;
                    giantPalm.material.emissiveIntensity = Math.max(0, emissiveIntensity);
                }
                
                // Find the core
                const core = explosionGroup.children.find(child => 
                    child.geometry && 
                    child.geometry.type === 'SphereGeometry' && 
                    !child.material.wireframe
                );
                
                if (core) {
                    // Pulse the core
                    const corePulse = 1 + Math.sin(explosionProgress * Math.PI * 10) * 0.3;
                    core.scale.set(corePulse, corePulse, corePulse);
                    
                    // Adjust core size based on explosion progress
                    const coreSize = 1 + explosionProgress * 2;
                    core.scale.multiplyScalar(coreSize);
                    
                    // Fade out core at the end
                    if (explosionProgress > 0.7) {
                        core.material.opacity = Math.max(0, 0.9 - ((explosionProgress - 0.7) / 0.3) * 0.9);
                    }
                }
                
                // Find explosion waves
                const waves = explosionGroup.children.filter(child => 
                    child.geometry && 
                    child.geometry.type === 'SphereGeometry' && 
                    child.material.wireframe
                );
                
                for (const wave of waves) {
                    if (wave.userData) {
                        // Expand the wave
                        const waveSize = wave.userData.initialScale + 
                                        (explosionProgress * wave.userData.expansionSpeed * this.radius * 2);
                        wave.scale.set(waveSize, waveSize, waveSize);
                        
                        // Fade out wave as it expands
                        wave.material.opacity = Math.max(0, wave.material.opacity - (delta * 0.5));
                    }
                }
                
                // Animate explosion particles
                const particles = explosionGroup.children.filter(child => 
                    child.geometry && 
                    child.geometry.type === 'SphereGeometry' && 
                    child !== core && 
                    !child.material.wireframe
                );
                
                for (const particle of particles) {
                    if (particle.userData) {
                        // Move particle outward
                        particle.position.add(
                            particle.userData.velocity.clone().multiplyScalar(delta)
                        );
                        
                        // Apply drag to slow particles
                        particle.userData.velocity.multiplyScalar(particle.userData.drag);
                        
                        // Shrink particles over time
                        particle.scale.multiplyScalar(0.98);
                        
                        // Fade out particles
                        if (particle.material) {
                            particle.material.opacity = Math.max(0, particle.material.opacity - (delta * 0.2));
                        }
                    }
                }
                
                // Apply damage to nearby enemies during explosion
                if (this.game && this.game.enemies && explosionProgress > 0.2 && explosionProgress < 0.4) {
                    // Only apply damage once during the explosion
                    if (!this.explodingPalmState.damageApplied) {
                        this.explodingPalmState.damageApplied = true;
                        
                        // Get explosion position
                        const explosionPosition = new THREE.Vector3(
                            palmGroup.position.x,
                            palmGroup.position.y,
                            palmGroup.position.z
                        );
                        
                        // Check each enemy for being in explosion radius
                        for (const enemy of this.game.enemies) {
                            if (enemy && enemy.position && !enemy.state.isDead) {
                                const distance = explosionPosition.distanceTo(enemy.position);
                                
                                // If enemy is within explosion radius, damage it
                                if (distance < this.radius) {
                                    // Calculate damage based on distance (more damage closer to center)
                                    const damageMultiplier = 1 - (distance / this.radius);
                                    const finalDamage = this.damage * (1 + damageMultiplier);
                                    
                                    // Apply damage to enemy
                                    if (enemy.takeDamage) {
                                        enemy.takeDamage(finalDamage);
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Transition to fading phase at the end of explosion
                if (explosionProgress >= 1) {
                    this.explodingPalmState.phase = 'fading';
                }
            }
            // Handle fading phase
            else if (this.explodingPalmState.phase === 'fading') {
                // Fade out all remaining elements
                palmGroup.traverse(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = Math.max(0, mat.opacity - (delta * 0.5));
                            });
                        } else {
                            child.material.opacity = Math.max(0, child.material.opacity - (delta * 0.5));
                        }
                    }
                });
            }
        } else {
            // Default mark effect behavior
            // Pulse the mark
            const pulseSpeed = 1;
            const pulseScale = 0.1;
            
            this.effect.children[0].scale.set(
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
                1,
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale
            );
        }
    }
    
    updateSummonEffect(delta) {
        // Special handling for Mystic Ally
        if (this.name === 'Mystic Ally' && this.mysticAllyState) {
            // Update state
            this.mysticAllyState.age += delta;
            
            // Get the summoning group and ally
            const summoningGroup = this.mysticAllyState.summoningCircle;
            const ally = this.mysticAllyState.ally;
            
            // Handle different phases of the summon
            const summonDuration = this.duration * 0.2; // First 20% is summoning
            const activeDuration = this.duration * 0.6; // Middle 60% is active
            // Last 20% is dissipating
            
            // Determine current phase
            if (this.elapsedTime < summonDuration) {
                this.mysticAllyState.phase = 'summoning';
            } else if (this.elapsedTime < summonDuration + activeDuration) {
                this.mysticAllyState.phase = 'active';
            } else {
                this.mysticAllyState.phase = 'dissipating';
            }
            
            // Handle summoning phase
            if (this.mysticAllyState.phase === 'summoning') {
                // Calculate progress through summoning phase (0 to 1)
                const summonProgress = this.elapsedTime / summonDuration;
                
                // Animate the summoning circle
                // Rotate magical rings
                for (let i = 0; i < summoningGroup.children.length; i++) {
                    const child = summoningGroup.children[i];
                    
                    // Animate rings
                    if (child.geometry && child.geometry.type === 'RingGeometry') {
                        if (child.userData && child.userData.rotationSpeed) {
                            // Rotate at different speeds and directions
                            child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction;
                        }
                        
                        // Pulse opacity during summoning
                        if (child.material) {
                            child.material.opacity = 0.3 + (Math.sin(this.mysticAllyState.age * 5) * 0.2) + (summonProgress * 0.3);
                        }
                    }
                    
                    // Animate runes
                    if (child.geometry && child.geometry.type === 'ShapeGeometry') {
                        if (child.userData && child.userData.rotationSpeed) {
                            // Rotate runes
                            child.rotation.z += child.userData.rotationSpeed * delta;
                            
                            // Move runes inward during summoning
                            if (child.userData.initialPosition) {
                                const direction = new THREE.Vector3().subVectors(
                                    new THREE.Vector3(0, child.position.y, 0),
                                    child.userData.initialPosition
                                ).normalize();
                                
                                const moveAmount = (1 - summonProgress) * delta * 0.5;
                                child.position.add(direction.multiplyScalar(moveAmount));
                            }
                            
                            // Pulse runes
                            if (child.userData.pulseSpeed) {
                                const pulseScale = 0.8 + Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed) * 0.2;
                                child.scale.set(pulseScale, pulseScale, pulseScale);
                            }
                            
                            // Increase emissive intensity
                            if (child.material) {
                                child.material.emissiveIntensity = 1 + Math.sin(this.mysticAllyState.age * 10) * 0.5 + summonProgress;
                            }
                        }
                    }
                }
                
                // Animate ally appearing
                if (ally) {
                    // Move ally down from above
                    const targetHeight = 0.5;
                    const currentHeight = this.mysticAllyState.initialAllyHeight * (1 - summonProgress) + targetHeight * summonProgress;
                    ally.position.y = currentHeight;
                    
                    // Rotate ally during summoning
                    ally.rotation.y += delta * 3;
                    
                    // Pulse ally size
                    const pulseScale = 0.5 + (summonProgress * 0.5) + Math.sin(this.mysticAllyState.age * 5) * 0.1;
                    ally.scale.set(pulseScale, pulseScale, pulseScale);
                    
                    // Increase opacity as ally forms
                    ally.traverse(child => {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.opacity = Math.min(mat.opacity, summonProgress);
                                });
                            } else {
                                child.material.opacity = Math.min(child.material.opacity, summonProgress);
                            }
                        }
                    });
                }
                
                // Animate particles converging to form the ally
                for (const particle of this.mysticAllyState.particles) {
                    if (particle.userData) {
                        // Move particles toward the center and upward
                        const direction = new THREE.Vector3(
                            -particle.position.x * 0.1,
                            (ally.position.y - particle.position.y) * 0.1,
                            -particle.position.z * 0.1
                        );
                        
                        particle.position.add(direction.multiplyScalar(particle.userData.speed * delta));
                        
                        // Rotate particles
                        particle.rotation.x += particle.userData.rotationSpeed * delta;
                        particle.rotation.y += particle.userData.rotationSpeed * delta;
                        particle.rotation.z += particle.userData.rotationSpeed * delta;
                        
                        // Fade particles as they approach the ally
                        const distanceToAlly = particle.position.distanceTo(new THREE.Vector3(0, ally.position.y, 0));
                        if (distanceToAlly < 0.5) {
                            if (particle.material) {
                                particle.material.opacity = Math.max(0, particle.material.opacity - (delta * 2));
                            }
                        }
                    }
                }
            }
            // Handle active phase
            else if (this.mysticAllyState.phase === 'active') {
                // Calculate progress through active phase (0 to 1)
                const activeProgress = (this.elapsedTime - summonDuration) / activeDuration;
                
                // Animate the summoning circle (more subtle during active phase)
                // Rotate magical rings
                for (let i = 0; i < summoningGroup.children.length; i++) {
                    const child = summoningGroup.children[i];
                    
                    // Animate rings
                    if (child.geometry && child.geometry.type === 'RingGeometry') {
                        if (child.userData && child.userData.rotationSpeed) {
                            // Rotate at different speeds and directions
                            child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction * 0.5;
                        }
                    }
                    
                    // Animate runes
                    if (child.geometry && child.geometry.type === 'ShapeGeometry') {
                        if (child.userData && child.userData.rotationSpeed) {
                            // Rotate runes slowly
                            child.rotation.z += child.userData.rotationSpeed * delta * 0.3;
                            
                            // Subtle pulse
                            if (child.userData.pulseSpeed) {
                                const pulseScale = 0.9 + Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed * 0.5) * 0.1;
                                child.scale.set(pulseScale, pulseScale, pulseScale);
                            }
                        }
                    }
                }
                
                // Animate ally in active state
                if (ally) {
                    // Hover animation
                    const hoverHeight = 0.5 + Math.sin(this.mysticAllyState.age * 0.7) * 0.1;
                    ally.position.y = hoverHeight;
                    
                    // Gentle rotation
                    ally.rotation.y += delta * 0.5;
                    
                    // Subtle breathing animation
                    const breathScale = 1 + Math.sin(this.mysticAllyState.age * 1.5) * 0.05;
                    ally.scale.set(breathScale, breathScale, breathScale);
                    
                    // Animate ally components
                    ally.traverse(child => {
                        // Animate energy wisps
                        if (child.userData && child.userData.orbitSpeed) {
                            // Update orbit position
                            child.userData.orbitAngle = (child.userData.orbitAngle || 0) + child.userData.orbitSpeed * delta;
                            
                            // Calculate new position
                            const orbitX = child.userData.initialPosition.x + 
                                          Math.cos(child.userData.orbitAngle) * child.userData.orbitRadius;
                            const orbitZ = child.userData.initialPosition.z + 
                                          Math.sin(child.userData.orbitAngle) * child.userData.orbitRadius;
                            
                            // Update position
                            child.position.x = orbitX;
                            child.position.z = orbitZ;
                            
                            // Pulse size
                            if (child.userData.pulseSpeed) {
                                const pulseScale = 0.8 + Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed) * 0.2;
                                child.scale.set(pulseScale, pulseScale, pulseScale);
                            }
                        }
                        
                        // Animate energy swirls
                        if (child.userData && child.userData.rotationAxis) {
                            // Rotate around custom axis
                            const rotationMatrix = new THREE.Matrix4();
                            rotationMatrix.makeRotationAxis(
                                child.userData.rotationAxis,
                                child.userData.rotationSpeed * delta
                            );
                            child.applyMatrix4(rotationMatrix);
                        }
                    });
                    
                    // Occasionally emit energy particles
                    if (Math.random() < 0.05) {
                        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                        const particleMaterial = new THREE.MeshStandardMaterial({
                            color: this.color,
                            emissive: this.color,
                            emissiveIntensity: 1,
                            transparent: true,
                            opacity: 0.8
                        });
                        
                        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                        
                        // Random position around ally
                        const angle = Math.random() * Math.PI * 2;
                        particle.position.set(
                            Math.cos(angle) * 0.4,
                            ally.position.y,
                            Math.sin(angle) * 0.4
                        );
                        
                        // Store particle data
                        particle.userData = {
                            age: 0,
                            maxAge: 1 + Math.random(),
                            velocity: new THREE.Vector3(
                                (Math.random() - 0.5) * 0.5,
                                Math.random() * 0.5,
                                (Math.random() - 0.5) * 0.5
                            )
                        };
                        
                        summoningGroup.add(particle);
                    }
                    
                    // Update emitted particles
                    const particlesToRemove = [];
                    for (let i = 0; i < summoningGroup.children.length; i++) {
                        const child = summoningGroup.children[i];
                        
                        if (child.userData && child.userData.age !== undefined) {
                            // Update particle age
                            child.userData.age += delta;
                            
                            // Move particle
                            child.position.add(child.userData.velocity.clone().multiplyScalar(delta));
                            
                            // Fade out particle
                            if (child.material) {
                                child.material.opacity = Math.max(0, 0.8 - (child.userData.age / child.userData.maxAge) * 0.8);
                            }
                            
                            // Shrink particle
                            const shrinkFactor = 1 - (child.userData.age / child.userData.maxAge);
                            child.scale.set(shrinkFactor, shrinkFactor, shrinkFactor);
                            
                            // Mark for removal if too old
                            if (child.userData.age >= child.userData.maxAge) {
                                particlesToRemove.push(child);
                            }
                        }
                    }
                    
                    // Remove expired particles
                    for (const particle of particlesToRemove) {
                        summoningGroup.remove(particle);
                    }
                }
            }
            // Handle dissipating phase
            else {
                // Calculate progress through dissipating phase (0 to 1)
                const dissipateProgress = (this.elapsedTime - (summonDuration + activeDuration)) / (this.duration - summonDuration - activeDuration);
                
                // Animate the summoning circle fading
                summoningGroup.traverse(child => {
                    if (child !== ally && child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = Math.max(0, mat.opacity * (1 - dissipateProgress * 0.1));
                            });
                        } else {
                            child.material.opacity = Math.max(0, child.material.opacity * (1 - dissipateProgress * 0.1));
                        }
                    }
                });
                
                // Animate ally dissipating
                if (ally) {
                    // Rise upward
                    ally.position.y = 0.5 + dissipateProgress * 2;
                    
                    // Spin faster
                    ally.rotation.y += delta * (2 + dissipateProgress * 5);
                    
                    // Fade out
                    ally.traverse(child => {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.opacity = Math.max(0, mat.opacity * (1 - dissipateProgress * 0.2));
                                });
                            } else {
                                child.material.opacity = Math.max(0, child.material.opacity * (1 - dissipateProgress * 0.2));
                            }
                        }
                    });
                    
                    // Break apart at the end
                    if (dissipateProgress > 0.7) {
                        // Create particle explosion effect
                        if (Math.random() < 0.2) {
                            const particleGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 8, 8);
                            const particleMaterial = new THREE.MeshStandardMaterial({
                                color: this.color,
                                emissive: this.color,
                                emissiveIntensity: 1,
                                transparent: true,
                                opacity: 0.8
                            });
                            
                            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                            
                            // Random position around ally
                            const angle1 = Math.random() * Math.PI * 2;
                            const angle2 = Math.random() * Math.PI * 2;
                            const radius = Math.random() * 0.3;
                            
                            particle.position.set(
                                Math.cos(angle1) * Math.sin(angle2) * radius + ally.position.x,
                                Math.cos(angle2) * radius + ally.position.y,
                                Math.sin(angle1) * Math.sin(angle2) * radius + ally.position.z
                            );
                            
                            // Store particle data
                            particle.userData = {
                                age: 0,
                                maxAge: 0.5 + Math.random() * 0.5,
                                velocity: new THREE.Vector3(
                                    (Math.random() - 0.5) * 2,
                                    (Math.random() - 0.5) * 2,
                                    (Math.random() - 0.5) * 2
                                )
                            };
                            
                            summoningGroup.add(particle);
                        }
                    }
                }
            }
        } else {
            // Default summon effect behavior
            // Pulse the effect
            const pulseSpeed = 3;
            const pulseScale = 0.2;
            
            this.effect.children[0].scale.set(
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale,
                1 + Math.sin(this.elapsedTime * pulseSpeed) * pulseScale
            );
        }
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
        // Log removal for debugging
        console.log(`Removing skill effect: ${this.name}`);
        
        // Clean up effect and all its children recursively
        if (this.effect) {
            // Function to recursively dispose of geometries and materials
            const disposeObject = (obj) => {
                if (!obj) return;
                
                try {
                    // Dispose of children first
                    if (obj.children && obj.children.length > 0) {
                        // Create a copy of the children array to avoid modification during iteration
                        const children = [...obj.children];
                        for (const child of children) {
                            disposeObject(child);
                        }
                    }
                    
                    // Dispose of geometry
                    if (obj.geometry) {
                        obj.geometry.dispose();
                        obj.geometry = null;
                    }
                    
                    // Dispose of material(s)
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            for (const material of obj.material) {
                                if (material) {  // Check if material exists
                                    // Safely dispose textures
                                    if (material.map) {
                                        material.map.dispose();
                                        material.map = null;
                                    }
                                    // Dispose of any other textures
                                    if (material.normalMap) {
                                        material.normalMap.dispose();
                                        material.normalMap = null;
                                    }
                                    if (material.specularMap) {
                                        material.specularMap.dispose();
                                        material.specularMap = null;
                                    }
                                    if (material.emissiveMap) {
                                        material.emissiveMap.dispose();
                                        material.emissiveMap = null;
                                    }
                                    
                                    // Clear uniforms to prevent "Cannot read properties of undefined (reading 'value')" error
                                    if (material.uniforms) {
                                        for (const key in material.uniforms) {
                                            if (material.uniforms[key]) {
                                                material.uniforms[key].value = null;
                                            }
                                        }
                                    }
                                    
                                    material.dispose();
                                }
                            }
                        } else if (obj.material) {  // Check if material exists
                            // Safely dispose textures
                            if (obj.material.map) {
                                obj.material.map.dispose();
                                obj.material.map = null;
                            }
                            // Dispose of any other textures
                            if (obj.material.normalMap) {
                                obj.material.normalMap.dispose();
                                obj.material.normalMap = null;
                            }
                            if (obj.material.specularMap) {
                                obj.material.specularMap.dispose();
                                obj.material.specularMap = null;
                            }
                            if (obj.material.emissiveMap) {
                                obj.material.emissiveMap.dispose();
                                obj.material.emissiveMap = null;
                            }
                            
                            // Clear uniforms to prevent "Cannot read properties of undefined (reading 'value')" error
                            if (obj.material.uniforms) {
                                for (const key in obj.material.uniforms) {
                                    if (obj.material.uniforms[key]) {
                                        obj.material.uniforms[key].value = null;
                                    }
                                }
                            }
                            
                            obj.material.dispose();
                        }
                        obj.material = null;
                    }
                    
                    // Remove from parent
                    if (obj.parent) {
                        obj.parent.remove(obj);
                    }
                    
                    // Clear any userData
                    if (obj.userData) {
                        obj.userData = {};  // Set to empty object instead of null
                    }
                } catch (error) {
                    console.error(`Error disposing object in skill ${this.name}:`, error);
                }
            };
            
            // Dispose of the entire effect tree
            try {
                // Make the object invisible first to prevent rendering issues during cleanup
                this.effect.visible = false;
                
                // Ensure the object is removed from the scene's rendering queue
                if (this.effect.parent) {
                    this.effect.parent.remove(this.effect);
                }
                
                // Now dispose of all resources
                disposeObject(this.effect);
                
                // Clear the reference
                this.effect = null;
            } catch (error) {
                console.error(`Error disposing effect in skill ${this.name}:`, error);
            }
        }
        
        // Clean up impact rings for Exploding Palm
        if (this.name === 'Exploding Palm' && this.explodingPalmState) {
            // Clean up impact rings
            if (this.explodingPalmState.impactRings) {
                for (const ring of this.explodingPalmState.impactRings) {
                    if (ring && ring.parent) {
                        if (ring.geometry) ring.geometry.dispose();
                        if (ring.material) ring.material.dispose();
                        ring.parent.remove(ring);
                    }
                }
                this.explodingPalmState.impactRings = [];
            }
            
            // Clean up dust particles
            if (this.explodingPalmState.dustParticles) {
                for (const dust of this.explodingPalmState.dustParticles) {
                    if (dust && dust.parent) {
                        if (dust.geometry) dust.geometry.dispose();
                        if (dust.material) dust.material.dispose();
                        dust.parent.remove(dust);
                    }
                }
                this.explodingPalmState.dustParticles = [];
            }
            
            // Null out the entire state
            this.explodingPalmState = null;
        }
        
        // Clean up Wave of Light bell state
        if (this.name === 'Wave of Light' && this.bellState) {
            // Clean up any specific bell elements if they exist
            if (this.bellState.bellMesh && this.bellState.bellMesh.parent) {
                if (this.bellState.bellMesh.geometry) this.bellState.bellMesh.geometry.dispose();
                if (this.bellState.bellMesh.material) this.bellState.bellMesh.material.dispose();
                this.bellState.bellMesh.parent.remove(this.bellState.bellMesh);
            }
            
            // Clean up any light effects
            if (this.bellState.light && this.bellState.light.parent) {
                this.bellState.light.parent.remove(this.bellState.light);
            }
            
            // Null out the entire state
            this.bellState = null;
        }
        
        // Clean up Cyclone Strike state
        if (this.name === 'Cyclone Strike' && this.cycloneState) {
            // Clean up any specific cyclone elements if they exist
            if (this.cycloneState.particles) {
                for (const particle of this.cycloneState.particles) {
                    if (particle && particle.parent) {
                        if (particle.geometry) particle.geometry.dispose();
                        if (particle.material) particle.material.dispose();
                        particle.parent.remove(particle);
                    }
                }
            }
            
            // Null out the entire state
            this.cycloneState = null;
        }
        
        // Clean up Seven-Sided Strike state
        if (this.name === 'Seven-Sided Strike' && this.sevenSidedStrikeState) {
            // Clean up any specific strike elements if they exist
            if (this.sevenSidedStrikeState.strikePoints) {
                for (const point of this.sevenSidedStrikeState.strikePoints) {
                    if (point.mesh && point.mesh.parent) {
                        if (point.mesh.geometry) point.mesh.geometry.dispose();
                        if (point.mesh.material) point.mesh.material.dispose();
                        point.mesh.parent.remove(point.mesh);
                    }
                }
            }
            
            // Null out the entire state
            this.sevenSidedStrikeState = null;
        }
        
        // Clean up Wave Strike state
        if (this.name === 'Wave Strike' && this.waveState) {
            // Clean up any specific wave elements if they exist
            if (this.waveState.droplets) {
                for (const droplet of this.waveState.droplets) {
                    if (droplet && droplet.parent) {
                        if (droplet.geometry) droplet.geometry.dispose();
                        if (droplet.material) droplet.material.dispose();
                        droplet.parent.remove(droplet);
                    }
                }
            }
            
            // Null out the entire state
            this.waveState = null;
        }
        
        // Clean up Mystic Ally state
        if (this.name === 'Mystic Ally' && this.mysticAllyState) {
            // Clean up any specific ally elements if they exist
            if (this.mysticAllyState.allyMesh && this.mysticAllyState.allyMesh.parent) {
                if (this.mysticAllyState.allyMesh.geometry) this.mysticAllyState.allyMesh.geometry.dispose();
                if (this.mysticAllyState.allyMesh.material) this.mysticAllyState.allyMesh.material.dispose();
                this.mysticAllyState.allyMesh.parent.remove(this.mysticAllyState.allyMesh);
            }
            
            // Null out the entire state
            this.mysticAllyState = null;
        }
        
        // Reset all state
        this.effect = null;
        this.isActive = false;
        this.elapsedTime = 0;
        
        // Clear any references that might cause memory leaks
        this.position.set(0, 0, 0);
        this.direction.set(0, 0, 0);
        
        // Force garbage collection hint (not guaranteed but can help)
        if (window.gc) window.gc();
        
        console.log(`Skill ${this.name} cleanup completed`);
    }
    
    createTeleportEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Special handling for Fist of Thunder
        if (this.name === 'Fist of Thunder') {
            // Create a lightning teleport effect
            const teleportGroup = new THREE.Group();
            
            // Create lightning trail effect
            const trailCount = 20;
            const trailSegments = [];
            
            // Create lightning segments
            for (let i = 0; i < trailCount; i++) {
                const segmentGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
                const segmentMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.8
                });
                
                const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
                
                // Random position around the player
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.5 + Math.random() * 1.5;
                
                segment.position.set(
                    Math.cos(angle) * radius,
                    Math.random() * 2 - 1,
                    Math.sin(angle) * radius
                );
                
                // Random rotation
                segment.rotation.x = Math.random() * Math.PI;
                segment.rotation.y = Math.random() * Math.PI;
                segment.rotation.z = Math.random() * Math.PI;
                
                // Store initial values for animation
                segment.userData = {
                    initialPos: segment.position.clone(),
                    initialRot: segment.rotation.clone(),
                    speed: 0.5 + Math.random() * 1.5,
                    direction: new THREE.Vector3(
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1
                    ).normalize()
                };
                
                teleportGroup.add(segment);
                trailSegments.push(segment);
            }
            
            // Create a flash effect at the center
            const flashGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            const flashMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.color,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.9
            });
            
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            teleportGroup.add(flash);
            
            // Add lightning arcs
            const arcCount = 8;
            for (let i = 0; i < arcCount; i++) {
                const angle = (i / arcCount) * Math.PI * 2;
                
                // Create a lightning arc
                const arcGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
                const arcMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.7
                });
                
                const arc = new THREE.Mesh(arcGeometry, arcMaterial);
                arc.position.set(
                    Math.cos(angle) * 1,
                    0,
                    Math.sin(angle) * 1
                );
                
                // Rotate to point outward
                arc.rotation.x = Math.PI / 2;
                arc.rotation.z = angle;
                
                teleportGroup.add(arc);
            }
            
            // Store teleport state for animation
            this.teleportState = {
                flash: flash,
                trailSegments: trailSegments,
                phase: 'appearing', // 'appearing', 'stable', 'disappearing'
                age: 0
            };
            
            // Add teleport group to effect group
            effectGroup.add(teleportGroup);
        } else {
            // Default teleport effect (fallback)
            const teleportGeometry = new THREE.SphereGeometry(1, 16, 16);
            const teleportMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7
            });
            
            const teleport = new THREE.Mesh(teleportGeometry, teleportMaterial);
            effectGroup.add(teleport);
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    getPosition() {
        return this.position;
    }
    
    getRadius() {
        return this.radius;
    }
    
    createTeleportEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Special handling for Fist of Thunder
        if (this.name === 'Fist of Thunder') {
            // Create a lightning teleport effect
            const teleportGroup = new THREE.Group();
            
            // Create lightning trail effect
            const trailCount = 20;
            const trailSegments = [];
            
            // Create lightning segments
            for (let i = 0; i < trailCount; i++) {
                const segmentGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
                const segmentMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.8
                });
                
                const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
                
                // Random position around the player
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.5 + Math.random() * 1.5;
                
                segment.position.set(
                    Math.cos(angle) * radius,
                    Math.random() * 2 - 1,
                    Math.sin(angle) * radius
                );
                
                // Random rotation
                segment.rotation.x = Math.random() * Math.PI;
                segment.rotation.y = Math.random() * Math.PI;
                segment.rotation.z = Math.random() * Math.PI;
                
                // Store initial values for animation
                segment.userData = {
                    initialPos: segment.position.clone(),
                    initialRot: segment.rotation.clone(),
                    speed: 0.5 + Math.random() * 1.5,
                    direction: new THREE.Vector3(
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1
                    ).normalize()
                };
                
                teleportGroup.add(segment);
                trailSegments.push(segment);
            }
            
            // Create a flash effect at the center
            const flashGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            const flashMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.color,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.9
            });
            
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            teleportGroup.add(flash);
            
            // Add lightning arcs
            const arcCount = 8;
            for (let i = 0; i < arcCount; i++) {
                const angle = (i / arcCount) * Math.PI * 2;
                
                // Create a lightning arc
                const arcGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
                const arcMaterial = new THREE.MeshStandardMaterial({
                    color: this.color,
                    emissive: this.color,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.7
                });
                
                const arc = new THREE.Mesh(arcGeometry, arcMaterial);
                arc.position.set(
                    Math.cos(angle) * 1,
                    0,
                    Math.sin(angle) * 1
                );
                
                // Rotate to point outward
                arc.rotation.x = Math.PI / 2;
                arc.rotation.z = angle;
                
                teleportGroup.add(arc);
            }
            
            // Store teleport state for animation
            this.teleportState = {
                flash: flash,
                trailSegments: trailSegments,
                phase: 'appearing', // 'appearing', 'stable', 'disappearing'
                age: 0
            };
            
            // Add teleport group to effect group
            effectGroup.add(teleportGroup);
        } else {
            // Default teleport effect (fallback)
            const teleportGeometry = new THREE.SphereGeometry(1, 16, 16);
            const teleportMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.7
            });
            
            const teleport = new THREE.Mesh(teleportGeometry, teleportMaterial);
            effectGroup.add(teleport);
        }
        
        // Position effect
        effectGroup.position.copy(this.position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    updateTeleportEffect(delta) {
        // Special handling for Fist of Thunder
        if (this.name === 'Fist of Thunder' && this.teleportState) {
            // Get teleport group (first child of effect group)
            const teleportGroup = this.effect.children[0];
            
            // Update teleport state
            this.teleportState.age += delta;
            
            // Handle different phases of the teleport effect
            if (this.teleportState.phase === 'appearing') {
                // Scale up the effect during appearing phase
                const scale = Math.min(1.0, this.teleportState.age * 5); // Reach full size in 0.2 seconds
                teleportGroup.scale.set(scale, scale, scale);
                
                // Flash effect
                if (this.teleportState.flash) {
                    this.teleportState.flash.material.opacity = Math.min(1.0, 2.0 - this.teleportState.age * 10);
                    this.teleportState.flash.scale.set(1 + this.teleportState.age * 5, 1 + this.teleportState.age * 5, 1 + this.teleportState.age * 5);
                }
                
                // Transition to stable phase
                if (this.teleportState.age >= 0.2) {
                    this.teleportState.phase = 'stable';
                    this.teleportState.age = 0;
                }
            } else if (this.teleportState.phase === 'stable') {
                // Animate lightning segments during stable phase
                if (this.teleportState.trailSegments) {
                    for (const segment of this.teleportState.trailSegments) {
                        if (segment.userData) {
                            // Oscillate position
                            const initialPos = segment.userData.initialPos;
                            const speed = segment.userData.speed;
                            const direction = segment.userData.direction;
                            
                            segment.position.set(
                                initialPos.x + Math.sin(this.teleportState.age * speed * 5) * direction.x * 0.3,
                                initialPos.y + Math.sin(this.teleportState.age * speed * 5) * direction.y * 0.3,
                                initialPos.z + Math.sin(this.teleportState.age * speed * 5) * direction.z * 0.3
                            );
                            
                            // Rotate
                            segment.rotation.x += delta * speed;
                            segment.rotation.y += delta * speed * 0.7;
                            segment.rotation.z += delta * speed * 0.5;
                        }
                    }
                }
                
                // Pulse the flash
                if (this.teleportState.flash) {
                    this.teleportState.flash.material.opacity = 0.5 + Math.sin(this.teleportState.age * 10) * 0.3;
                    this.teleportState.flash.material.emissiveIntensity = 1.5 + Math.sin(this.teleportState.age * 8) * 0.5;
                }
                
                // Transition to disappearing phase
                if (this.teleportState.age >= this.duration - 0.3) {
                    this.teleportState.phase = 'disappearing';
                    this.teleportState.age = 0;
                }
            } else if (this.teleportState.phase === 'disappearing') {
                // Scale down the effect during disappearing phase
                const scale = Math.max(0, 1.0 - this.teleportState.age * 3.33); // Disappear in 0.3 seconds
                teleportGroup.scale.set(scale, scale, scale);
                
                // Fade out
                if (teleportGroup.children) {
                    for (const child of teleportGroup.children) {
                        if (child.material && child.material.opacity !== undefined) {
                            child.material.opacity = Math.max(0, child.material.opacity - delta * 3);
                        }
                    }
                }
            }
            
            // Check for enemies hit by the teleport effect
            if (this.game && this.game.enemyManager && this.teleportState.phase === 'stable') {
                // Check every 0.2 seconds to avoid too frequent checks
                if (Math.floor(this.teleportState.age * 5) > Math.floor((this.teleportState.age - delta) * 5)) {
                    // Get all enemies within range
                    const hitRadius = this.radius;
                    
                    for (const enemy of this.game.enemyManager.enemies) {
                        if (enemy.isDead()) continue;
                        
                        const enemyPos = enemy.getPosition();
                        const distance = this.position.distanceTo(enemyPos);
                        
                        if (distance <= hitRadius) {
                            // Apply damage
                            enemy.takeDamage(this.damage);
                            
                            // Show hit effect
                            this.createTeleportHitEffect(enemyPos);
                        }
                    }
                }
            }
        } else {
            // Default teleport effect
            this.updateDefaultEffect(delta);
        }
    }
    
    createTeleportHitEffect(position) {
        // Create a lightning hit effect at the enemy position
        const hitGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const hitMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.8
        });
        
        const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
        hitMesh.position.copy(position);
        
        // Add to scene
        if (this.game && this.game.scene) {
            this.game.scene.add(hitMesh);
            
            // Remove after a short delay
            setTimeout(() => {
                if (hitMesh.parent) {
                    hitMesh.parent.remove(hitMesh);
                }
                if (hitMesh.geometry) hitMesh.geometry.dispose();
                if (hitMesh.material) hitMesh.material.dispose();
            }, 300);
        }
    }
    
    getDamage() {
        return this.damage;
    }
}