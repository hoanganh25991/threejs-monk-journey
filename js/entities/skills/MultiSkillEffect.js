import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for multi-hit skills
 */
export class MultiSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.multiState = null;
        this.direction = new THREE.Vector3(0, 0, 1); // Default forward direction
        this.sevenSidedStrikeState = null;
    }

    /**
     * Create a multi-hit effect
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store the direction vector
        this.direction = direction.clone();
        
        // Special handling for Seven-Sided Strike
        if (this.skill.name === 'Seven-Sided Strike') {
            this._createSevenSidedStrikeEffect(effectGroup, position, direction);
        } else {
            // Create the default multi-hit effect
            this._createMultiHitEffect(effectGroup, position, direction);
        }
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the Seven-Sided Strike effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to face
     * @private
     */
    _createSevenSidedStrikeEffect(effectGroup, position, direction) {
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
        body.position.y = 0.5; // Position at half height
        monkGroup.add(body);
        
        // Monk head
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, // Tan skin color
            metalness: 0.1,
            roughness: 0.9
        });
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.0; // Position above body
        monkGroup.add(head);
        
        // Monk arms
        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, // Tan skin color
            metalness: 0.1,
            roughness: 0.9
        });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.25, 0.7, 0);
        leftArm.rotation.z = Math.PI / 4; // Angle arm outward
        monkGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.25, 0.7, 0);
        rightArm.rotation.z = -Math.PI / 4; // Angle arm outward
        monkGroup.add(rightArm);
        
        // Monk fist (right hand) with energy effect
        const fistGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const fistMaterial = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, // Tan skin color
            metalness: 0.1,
            roughness: 0.9
        });
        
        const fist = new THREE.Mesh(fistGeometry, fistMaterial);
        fist.position.set(0.4, 0.7, 0);
        monkGroup.add(fist);
        
        // Energy around fist
        const energyGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const energyMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            emissive: this.skill.color,
            emissiveIntensity: 1.0
        });
        
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.position.set(0.4, 0.7, 0);
        monkGroup.add(energy);
        
        // Hide the monk initially
        monkGroup.visible = false;
        
        // Create strike points in a heptagon (7-sided) pattern
        const strikePoints = [];
        const radius = this.skill.radius || 5;
        
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Create a marker for each strike point
            const markerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.5
            });
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(x, 0.1, z);
            marker.visible = false; // Hide initially
            
            effectGroup.add(marker);
            
            strikePoints.push({
                position: new THREE.Vector3(x, 0, z),
                mesh: marker,
                visited: false
            });
        }
        
        // Create a central vortex effect
        const vortexGeometry = new THREE.RingGeometry(0.5, 2, 32);
        const vortexMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
        vortex.rotation.x = -Math.PI / 2; // Lay flat
        vortex.position.y = 0.05; // Slightly above ground
        
        // Store rotation data for animation
        vortex.userData = {
            rotationSpeed: 2.0
        };
        
        effectGroup.add(vortex);
        
        // Store animation state
        this.sevenSidedStrikeState = {
            currentStrike: -1,
            strikeDuration: this.skill.duration / this.skill.hits,
            strikeTimer: 0,
            vortex: vortex,
            monkTemplate: monkGroup,
            strikePoints: strikePoints,
            activeMonks: [],
            connectingLines: [],
            flashEffects: []
        };
    }

    /**
     * Create the default multi-hit effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to face
     * @private
     */
    _createMultiHitEffect(effectGroup, position, direction) {
        // Create a multi-hit effect with multiple figures
        const figureCount = this.skill.hits || 3;
        const figures = [];
        
        // Create figures
        for (let i = 0; i < figureCount; i++) {
            const figureGroup = new THREE.Group();
            
            // Create figure body
            const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.8,
                emissive: this.skill.color,
                emissiveIntensity: 0.5
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            figureGroup.add(body);
            
            // Create figure trail
            const trailGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.5
            });
            
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.rotation.x = Math.PI / 2;
            trail.position.z = -0.5;
            figureGroup.add(trail);
            
            // Add particles
            const particleCount = 5;
            for (let j = 0; j < particleCount; j++) {
                const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: this.skill.color,
                    transparent: true,
                    opacity: 0.6
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    -j * 0.2 - 0.5
                );
                
                figureGroup.add(particle);
            }
            
            // Hide initially
            figureGroup.visible = false;
            
            // Add to effect group
            effectGroup.add(figureGroup);
            figures.push(figureGroup);
        }
        
        // Store multi-hit state
        this.multiState = {
            figures: figures,
            currentFigure: -1,
            figureCount: figureCount,
            figureDelay: this.skill.duration / figureCount,
            nextFigureTime: 0
        };
    }

    /**
     * Update the multi-hit effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            return;
        }
        
        // IMPORTANT: Update the skill's position property to match the effect's position
        // This is crucial for collision detection in CollisionManager
        this.skill.position.copy(this.effect.position);
        
        // Special handling for Seven-Sided Strike
        if (this.skill.name === 'Seven-Sided Strike' && this.sevenSidedStrikeState) {
            this._updateSevenSidedStrikeEffect(delta);
        } else if (this.multiState) {
            this._updateDefaultMultiHitEffect(delta);
        }
    }
    
    /**
     * Update the Seven-Sided Strike effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateSevenSidedStrikeEffect(delta) {
        // Update the strike timer
        this.sevenSidedStrikeState.strikeTimer += delta;
        
        // Calculate which strike should be active
        const newStrikeIndex = Math.floor(this.elapsedTime / this.sevenSidedStrikeState.strikeDuration);
        
        // If we've moved to a new strike
        if (newStrikeIndex !== this.sevenSidedStrikeState.currentStrike && newStrikeIndex < this.skill.hits) {
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
                }
                if (child.userData && child.userData.isConnectingLine) {
                    connectingLines.push(child);
                }
            }
            
            // Deactivate all monks
            for (const monk of monkFigures) {
                monk.userData.active = false;
            }
            
            // Remove all connecting lines
            for (const line of connectingLines) {
                this.effect.remove(line);
            }
            this.sevenSidedStrikeState.connectingLines = [];
            
            // Choose next strike point
            let nextPoint = null;
            const unvisitedPoints = this.sevenSidedStrikeState.strikePoints.filter(p => !p.visited);
            
            if (unvisitedPoints.length > 0) {
                // Choose a random unvisited point
                nextPoint = unvisitedPoints[Math.floor(Math.random() * unvisitedPoints.length)];
                nextPoint.visited = true;
            } else {
                // All points visited, reset and choose any point
                for (const point of this.sevenSidedStrikeState.strikePoints) {
                    point.visited = false;
                }
                nextPoint = this.sevenSidedStrikeState.strikePoints[
                    Math.floor(Math.random() * this.sevenSidedStrikeState.strikePoints.length)
                ];
                nextPoint.visited = true;
            }
            
            // Show the marker for this point
            if (nextPoint.mesh) {
                nextPoint.mesh.visible = true;
                
                // Make it pulse
                nextPoint.mesh.userData = {
                    pulseTime: 0
                };
            }
            
            // Create a new monk at this position
            const newMonk = this.sevenSidedStrikeState.monkTemplate.clone();
            newMonk.position.copy(nextPoint.position);
            newMonk.position.y = 0; // Ensure on ground
            newMonk.visible = true;
            
            // Store index and active state
            newMonk.userData = {
                index: newStrikeIndex,
                active: true,
                strikePoint: nextPoint
            };
            
            this.effect.add(newMonk);
            this.sevenSidedStrikeState.activeMonks.push(newMonk);
            
            // Create a flash effect at the strike point
            const flashGeometry = new THREE.SphereGeometry(1, 16, 16);
            const flashMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1.0
            });
            
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            flash.position.copy(nextPoint.position);
            flash.position.y = 0.5;
            flash.scale.set(0.1, 0.1, 0.1);
            
            // Store creation time for animation
            flash.userData = {
                creationTime: this.elapsedTime,
                maxAge: 0.3 // How long the flash lasts
            };
            
            this.effect.add(flash);
            this.sevenSidedStrikeState.flashEffects.push(flash);
            
            // If there was a previous monk, create a connecting line
            if (newStrikeIndex > 0 && this.sevenSidedStrikeState.activeMonks.length > 1) {
                const prevMonk = this.sevenSidedStrikeState.activeMonks[this.sevenSidedStrikeState.activeMonks.length - 2];
                
                // Create a line connecting the two strike points
                const lineGeometry = new THREE.BufferGeometry();
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: this.skill.color,
                    transparent: true,
                    opacity: 0.7,
                    linewidth: 2
                });
                
                // Set line vertices
                const points = [
                    new THREE.Vector3(prevMonk.position.x, 0.1, prevMonk.position.z),
                    new THREE.Vector3(nextPoint.position.x, 0.1, nextPoint.position.z)
                ];
                lineGeometry.setFromPoints(points);
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                line.userData = {
                    isConnectingLine: true,
                    creationTime: this.elapsedTime
                };
                
                this.effect.add(line);
                this.sevenSidedStrikeState.connectingLines.push(line);
            }
        }
        
        // Animate active monks
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
                    const pulseScale = 1 + Math.sin(progress * Math.PI * 10) * 0.3;
                    strikeEffect.scale.set(pulseScale, pulseScale, pulseScale);
                    
                    // Increase opacity at start, decrease at end
                    if (progress < 0.5) {
                        strikeEffect.material.opacity = progress * 2;
                    } else {
                        strikeEffect.material.opacity = 2 * (1 - progress);
                    }
                }
                
                // Rotate monk to face center
                const angle = Math.atan2(
                    -child.position.x,
                    -child.position.z
                );
                child.rotation.y = angle;
                
                // Animate monk (bob up and down slightly)
                child.position.y = 0.1 + Math.sin(progress * Math.PI * 2) * 0.1;
                
                // Fade out monk at end of strike
                if (progress > 0.8) {
                    const fadeOutProgress = (progress - 0.8) * 5; // 0 to 1 over last 20% of time
                    
                    // Fade out all materials
                    child.traverse(c => {
                        if (c.material && c.material.opacity !== undefined) {
                            c.material.opacity = 1 - fadeOutProgress;
                        }
                    });
                }
            }
            
            // Animate strike point markers
            if (child.userData && child.userData.pulseTime !== undefined) {
                child.userData.pulseTime += delta;
                
                // Pulse the marker
                const pulseScale = 1 + Math.sin(child.userData.pulseTime * 10) * 0.3;
                child.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Fade out after a while
                if (child.userData.pulseTime > 0.5) {
                    child.material.opacity = Math.max(0, 1 - (child.userData.pulseTime - 0.5) * 2);
                    
                    // Hide when fully transparent
                    if (child.material.opacity <= 0) {
                        child.visible = false;
                    }
                }
            }
            
            // Animate flash effects
            if (child.userData && child.userData.creationTime !== undefined && child.userData.maxAge !== undefined) {
                const age = this.elapsedTime - child.userData.creationTime;
                
                // Expand and fade out
                if (age < child.userData.maxAge) {
                    const progress = age / child.userData.maxAge;
                    const scale = 0.1 + progress * 2;
                    child.scale.set(scale, scale, scale);
                    child.material.opacity = 1 - progress;
                } else {
                    // Remove when expired
                    this.effect.remove(child);
                    
                    // Remove from flash effects array
                    const index = this.sevenSidedStrikeState.flashEffects.indexOf(child);
                    if (index !== -1) {
                        this.sevenSidedStrikeState.flashEffects.splice(index, 1);
                    }
                }
            }
        }
        
        // Remove expired flashes
        const flashesToRemove = [];
        for (const flash of this.sevenSidedStrikeState.flashEffects) {
            const age = this.elapsedTime - flash.userData.creationTime;
            if (age >= flash.userData.maxAge) {
                flashesToRemove.push(flash);
            }
        }
        
        for (const flash of flashesToRemove) {
            this.effect.remove(flash);
        }
        
        // Animate the central vortex
        if (this.sevenSidedStrikeState.vortex) {
            const vortex = this.sevenSidedStrikeState.vortex;
            
            // Rotate the vortex
            vortex.rotation.z += vortex.userData.rotationSpeed * delta;
            
            // Pulse the vortex
            const pulseScale = 1 + Math.sin(this.elapsedTime * 5) * 0.2;
            vortex.scale.set(pulseScale, pulseScale, pulseScale);
            
            // Fade in at start, fade out at end
            if (this.elapsedTime < 0.5) {
                vortex.material.opacity = this.elapsedTime * 2;
            } else if (this.elapsedTime > this.skill.duration - 0.5) {
                vortex.material.opacity = (this.skill.duration - this.elapsedTime) * 2;
            }
        }
        
        // Fade out connecting lines over time
        for (const line of this.sevenSidedStrikeState.connectingLines) {
            const age = this.elapsedTime - line.userData.creationTime;
            if (age > 0.5) {
                line.material.opacity = Math.max(0, 0.7 - (age - 0.5) * 0.5);
            }
        }
    }
    
    /**
     * Update the default multi-hit effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateDefaultMultiHitEffect(delta) {
        // Ensure we have a valid direction vector
        if (!this.direction) {
            // Create a default forward direction if missing
            this.direction = new THREE.Vector3(0, 0, 1);
        }
        
        // Update multi-hit state
        if (this.elapsedTime >= this.multiState.nextFigureTime) {
            // Deactivate previous figure
            if (this.multiState.currentFigure >= 0) {
                this.multiState.figures[this.multiState.currentFigure].visible = false;
            }
            
            // Activate next figure
            this.multiState.currentFigure++;
            if (this.multiState.currentFigure < this.multiState.figureCount) {
                // Show next figure
                this.multiState.figures[this.multiState.currentFigure].visible = true;
                
                // Set time for next figure
                this.multiState.nextFigureTime = (this.multiState.currentFigure + 1) * this.multiState.figureDelay;
                
                // Move figure forward
                const figure = this.multiState.figures[this.multiState.currentFigure];
                const distance = this.skill.range * (this.multiState.currentFigure / this.multiState.figureCount);
                
                figure.position.set(
                    this.direction.x * distance,
                    0,
                    this.direction.z * distance
                );
            }
        }
        
        // Animate active figure
        if (this.multiState.currentFigure >= 0 && this.multiState.currentFigure < this.multiState.figureCount) {
            const figure = this.multiState.figures[this.multiState.currentFigure];
            
            // Move figure forward
            figure.position.x += this.direction.x * 10 * delta;
            figure.position.z += this.direction.z * 10 * delta;
            
            // Rotate figure
            figure.rotation.y += 5 * delta;
            
            // Pulse effect
            const pulse = 1 + Math.sin(this.elapsedTime * 10) * 0.2;
            figure.scale.set(pulse, pulse, pulse);
        }
    }
    
    /**
     * Clean up resources when the effect is removed
     */
    dispose() {
        super.dispose();
        
        // Clean up Seven-Sided Strike state
        if (this.sevenSidedStrikeState) {
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
    }
}