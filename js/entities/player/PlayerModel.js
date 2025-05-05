/**
 * PlayerModel.js
 * Handles the player's 3D model and animations
 */

import * as THREE from 'three';
import { IPlayerModel } from './PlayerInterface.js';

export class PlayerModel extends IPlayerModel {
    constructor(scene) {
        super();
        
        this.scene = scene;
        this.modelGroup = null;
    }
    
    async createModel() {
        // Create a group for the player
        this.modelGroup = new THREE.Group();
        
        // Create body (cube)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create arms (cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.6, 0);
        leftArm.rotation.z = Math.PI / 2;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 2;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Create monk-specific elements
        
        // Monk robe
        const robeGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.8, 8);
        const robeMaterial = new THREE.MeshStandardMaterial({ color: 0xcc8844 });
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = 0.2;
        robe.castShadow = true;
        
        this.modelGroup.add(robe);
        
        // Monk belt
        const beltGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 8);
        const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x553311 });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.5;
        belt.castShadow = true;
        
        this.modelGroup.add(belt);
        
        // Add model to scene
        this.scene.add(this.modelGroup);
        
        // Log to confirm player model was added
        console.log("Player model created and added to scene:", this.modelGroup);
        
        return this.modelGroup;
    }
    
    updateAnimations(delta, playerState) {
        // Simple animations for the player model
        if (playerState.isMoving()) {
            // Walking animation
            const walkSpeed = 5;
            const walkAmplitude = 0.1;
            
            // Animate legs
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            
            leftLeg.position.z = Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            rightLeg.position.z = -Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            
            // Animate arms
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            leftArm.rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
            rightArm.rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
        } else {
            // Reset to idle position
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            leftLeg.position.z = 0;
            rightLeg.position.z = 0;
            leftArm.rotation.x = 0;
            rightArm.rotation.x = 0;
        }
        
        // Attack animation
        if (playerState.isAttacking()) {
            // Simple attack animation
            const rightArm = this.modelGroup.children[3];
            rightArm.rotation.x = Math.sin(Date.now() * 0.02) * 0.5;
        }
    }
    
    setPosition(position) {
        if (this.modelGroup) {
            this.modelGroup.position.copy(position);
        }
    }
    
    setRotation(rotation) {
        if (this.modelGroup) {
            this.modelGroup.rotation.y = rotation.y;
        }
    }
    
    // Left jab - quick straight punch with left hand
    createLeftPunchAnimation() {
        // Get the left arm of the player model
        const leftArm = this.modelGroup.children.find(child => 
            child.position.x < 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        if (!leftArm) return;
        
        // Store original rotation
        const originalRotation = leftArm.rotation.clone();
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Quick wind up
            leftArm.rotation.z = Math.PI / 6; // Pull back slightly
            
            // After a short delay, punch forward
            setTimeout(() => {
                // Punch forward animation - straight jab
                leftArm.rotation.z = Math.PI / 3; // Extend forward
                
                // Create punch effect - blue color for left hand
                this.createPunchEffect('left', 0x4169e1); // Royal blue
                
                // Return to original position quickly (jab is fast)
                setTimeout(() => {
                    leftArm.rotation.copy(originalRotation);
                }, 100);
            }, 30);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Right cross - powerful straight punch with right hand
    createRightPunchAnimation() {
        // Get the right arm of the player model
        const rightArm = this.modelGroup.children.find(child => 
            child.position.x > 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        if (!rightArm) return;
        
        // Store original rotation
        const originalRotation = rightArm.rotation.clone();
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (pull arm back)
            rightArm.rotation.z = -Math.PI / 5; // Pull back
            
            // After a short delay, punch forward
            setTimeout(() => {
                // Punch forward animation - cross punch
                rightArm.rotation.z = -Math.PI / 2.5; // Extend further forward
                
                // Create punch effect - red color for right hand
                this.createPunchEffect('right', 0xff4500); // OrangeRed
                
                // Return to original position after the punch
                setTimeout(() => {
                    rightArm.rotation.copy(originalRotation);
                }, 150);
            }, 50);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Left hook - circular punch with left hand
    createLeftHookAnimation() {
        // Get the left arm and torso of the player model
        const leftArm = this.modelGroup.children.find(child => 
            child.position.x < 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        const torso = this.modelGroup.children.find(child => 
            Math.abs(child.position.x) < 0.1 && Math.abs(child.position.y - 0.6) < 0.3);
        
        if (!leftArm) return;
        
        // Store original rotations
        const originalArmRotation = leftArm.rotation.clone();
        const originalTorsoRotation = torso ? torso.rotation.clone() : null;
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (rotate torso slightly)
            if (torso) {
                torso.rotation.y = -Math.PI / 12; // Rotate torso right
            }
            
            // Pull arm back and to the side
            leftArm.rotation.z = Math.PI / 8;
            leftArm.rotation.y = -Math.PI / 8;
            
            // After a short delay, execute hook
            setTimeout(() => {
                // Hook punch animation - circular motion
                leftArm.rotation.z = Math.PI / 2.5; // Extend arm
                leftArm.rotation.y = Math.PI / 6; // Swing from side
                
                if (torso) {
                    torso.rotation.y = Math.PI / 12; // Rotate torso left
                }
                
                // Create punch effect - purple color for hook
                this.createPunchEffect('left-hook', 0x9932cc); // DarkOrchid
                
                // Return to original position after the punch
                setTimeout(() => {
                    leftArm.rotation.copy(originalArmRotation);
                    if (torso && originalTorsoRotation) {
                        torso.rotation.copy(originalTorsoRotation);
                    }
                }, 200);
            }, 70);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Heavy uppercut - powerful upward punch with right hand
    createHeavyPunchAnimation() {
        // Get the right arm and torso of the player model
        const rightArm = this.modelGroup.children.find(child => 
            child.position.x > 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        const torso = this.modelGroup.children.find(child => 
            Math.abs(child.position.x) < 0.1 && Math.abs(child.position.y - 0.6) < 0.3);
        
        if (!rightArm) return;
        
        // Store original rotations
        const originalArmRotation = rightArm.rotation.clone();
        const originalTorsoRotation = torso ? torso.rotation.clone() : null;
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (crouch slightly)
            if (torso) {
                torso.position.y -= 0.2; // Lower torso
                torso.rotation.x = Math.PI / 12; // Lean forward
            }
            
            // Pull arm down and back
            rightArm.rotation.x = Math.PI / 6; // Pull down
            rightArm.rotation.z = -Math.PI / 8; // Pull back
            
            // After a delay, execute uppercut
            setTimeout(() => {
                // Uppercut animation - upward motion
                rightArm.rotation.x = -Math.PI / 4; // Swing upward
                rightArm.rotation.z = -Math.PI / 2; // Extend arm
                
                if (torso) {
                    torso.position.y += 0.3; // Rise up
                    torso.rotation.x = -Math.PI / 12; // Lean back
                }
                
                // Create heavy punch effect - fiery red/orange for uppercut
                this.createHeavyPunchEffect();
                
                // Return to original position after the punch
                setTimeout(() => {
                    rightArm.rotation.copy(originalArmRotation);
                    if (torso && originalTorsoRotation) {
                        torso.rotation.copy(originalTorsoRotation);
                        torso.position.y -= 0.1; // Reset height
                    }
                }, 300);
            }, 100);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Standard punch effect for normal punches
    createPunchEffect(hand, color) {
        // Calculate position in front of the player based on hand
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.modelGroup.rotation);
        let sideOffset = 0;
        
        // Adjust position based on which hand is punching
        if (hand === 'left') {
            sideOffset = -0.3;
        } else if (hand === 'right') {
            sideOffset = 0.3;
        } else if (hand === 'left-hook') {
            sideOffset = -0.4;
            // Adjust direction for hook punch
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
        }
        
        // Calculate final punch position
        const punchPosition = new THREE.Vector3(
            this.modelGroup.position.x + direction.x * 1.2 + (direction.z * sideOffset),
            this.modelGroup.position.y + 0.6, // At arm height
            this.modelGroup.position.z + direction.z * 1.2 - (direction.x * sideOffset)
        );
        
        // Create main punch effect (sphere)
        const punchGeometry = new THREE.SphereGeometry(0.3, 12, 12);
        const punchMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const punchMesh = new THREE.Mesh(punchGeometry, punchMaterial);
        punchMesh.position.copy(punchPosition);
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create secondary effect (ring)
        const ringGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // White color
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(punchPosition);
        ringMesh.lookAt(this.modelGroup.position); // Orient ring to face player
        
        // Add ring to scene
        this.scene.add(ringMesh);
        
        // Create impact lines (small cylinders radiating outward)
        const impactLines = [];
        const numLines = 8;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).applyEuler(new THREE.Euler(0, this.modelGroup.rotation.y, 0));
            
            const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.7
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.3));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial
            });
        }
        
        // Animate the punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.8;
        let ringScale = 1.0;
        let ringOpacity = 0.6;
        
        const animatePunch = () => {
            // Update main punch effect
            mainScale += 0.15;
            mainOpacity -= 0.06;
            punchMesh.scale.set(mainScale, mainScale, mainScale);
            punchMaterial.opacity = mainOpacity;
            
            // Update ring effect
            ringScale += 0.2;
            ringOpacity -= 0.05;
            ringMesh.scale.set(ringScale, ringScale, ringScale);
            ringMaterial.opacity = ringOpacity;
            
            // Update impact lines
            impactLines.forEach(line => {
                // Move line outward
                line.mesh.position.add(line.direction.clone().multiplyScalar(0.1));
                
                // Fade out
                line.material.opacity -= 0.05;
            });
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animatePunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                this.scene.remove(ringMesh);
                impactLines.forEach(line => this.scene.remove(line.mesh));
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMaterial.dispose();
                ringGeometry.dispose();
                ringMaterial.dispose();
                impactLines.forEach(line => {
                    line.geometry.dispose();
                    line.material.dispose();
                });
            }
        };
        
        // Start animation
        animatePunch();
    }
    
    // Special effect for the heavy uppercut (combo finisher)
    createHeavyPunchEffect() {
        // Calculate position in front of the player
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.modelGroup.rotation);
        const punchPosition = new THREE.Vector3(
            this.modelGroup.position.x + direction.x * 1.3 + (direction.z * 0.3),
            this.modelGroup.position.y + 0.8, // Slightly higher for uppercut
            this.modelGroup.position.z + direction.z * 1.3 - (direction.x * 0.3)
        );
        
        // Create main punch effect (larger sphere)
        const punchGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const punchMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300, // Fiery orange-red
            transparent: true,
            opacity: 0.9
        });
        
        const punchMesh = new THREE.Mesh(punchGeometry, punchMaterial);
        punchMesh.position.copy(punchPosition);
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create shockwave ring
        const ringGeometry = new THREE.RingGeometry(0.3, 0.6, 24);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff7700, // Orange
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(punchPosition);
        ringMesh.lookAt(this.modelGroup.position); // Orient ring to face player
        
        // Add ring to scene
        this.scene.add(ringMesh);
        
        // Create secondary smaller rings
        const smallRings = [];
        for (let i = 0; i < 3; i++) {
            const smallRingGeometry = new THREE.RingGeometry(0.1 + (i * 0.1), 0.2 + (i * 0.1), 16);
            const smallRingMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0xffff00 : (i === 1 ? 0xff9900 : 0xff3300), // Yellow to orange to red
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const smallRingMesh = new THREE.Mesh(smallRingGeometry, smallRingMaterial);
            smallRingMesh.position.copy(punchPosition);
            smallRingMesh.lookAt(this.modelGroup.position);
            
            // Add to scene and store reference
            this.scene.add(smallRingMesh);
            smallRings.push({
                mesh: smallRingMesh,
                geometry: smallRingGeometry,
                material: smallRingMaterial,
                initialScale: 1.0 + (i * 0.3)
            });
        }
        
        // Create fire particles
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            // Random direction with upward bias
            const angle = Math.random() * Math.PI * 2;
            const particleDirection = new THREE.Vector3(
                Math.cos(angle) * 0.7,
                0.5 + Math.random() * 0.5, // Upward bias
                Math.sin(angle) * 0.7
            ).normalize();
            
            // Create particle
            const size = 0.05 + Math.random() * 0.15;
            const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
            
            // Random color from yellow to red
            const colorValue = Math.random();
            let particleColor;
            if (colorValue < 0.3) {
                particleColor = 0xffff00; // Yellow
            } else if (colorValue < 0.6) {
                particleColor = 0xff9900; // Orange
            } else {
                particleColor = 0xff3300; // Red
            }
            
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position at punch point
            particle.position.copy(punchPosition);
            
            // Add to scene and store reference
            this.scene.add(particle);
            particles.push({
                mesh: particle,
                direction: particleDirection,
                speed: 0.05 + Math.random() * 0.15,
                geometry: particleGeometry,
                material: particleMaterial,
                gravity: 0.003 + Math.random() * 0.002
            });
        }
        
        // Create impact lines (thicker for heavy punch)
        const impactLines = [];
        const numLines = 12;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).applyEuler(new THREE.Euler(0, this.modelGroup.rotation.y, 0));
            
            const lineGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: 0xff5500,
                transparent: true,
                opacity: 0.8
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.4));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial
            });
        }
        
        // Animate the heavy punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.9;
        let ringScale = 1.0;
        let ringOpacity = 0.8;
        let time = 0;
        
        const animateHeavyPunch = () => {
            time += 0.05;
            
            // Update main punch effect
            mainScale += 0.2;
            mainOpacity -= 0.04;
            punchMesh.scale.set(mainScale, mainScale, mainScale);
            punchMaterial.opacity = mainOpacity;
            
            // Update main ring effect
            ringScale += 0.25;
            ringOpacity -= 0.04;
            ringMesh.scale.set(ringScale, ringScale, ringScale);
            ringMaterial.opacity = ringOpacity;
            
            // Update small rings with pulsing effect
            smallRings.forEach((ring, index) => {
                const pulseScale = ring.initialScale + Math.sin(time * 3 + index) * 0.2;
                ring.mesh.scale.set(pulseScale + (time * 0.2), pulseScale + (time * 0.2), pulseScale + (time * 0.2));
                ring.material.opacity = Math.max(0, 0.7 - (time * 0.1));
            });
            
            // Update particles
            particles.forEach(particle => {
                // Apply gravity (reduce y component)
                particle.direction.y -= particle.gravity;
                
                // Move particle
                particle.mesh.position.add(
                    particle.direction.clone().multiplyScalar(particle.speed)
                );
                
                // Fade out
                particle.material.opacity -= 0.02;
                
                // Shrink slightly
                particle.mesh.scale.multiplyScalar(0.97);
            });
            
            // Update impact lines
            impactLines.forEach(line => {
                // Move line outward faster
                line.mesh.position.add(line.direction.clone().multiplyScalar(0.15));
                
                // Fade out
                line.material.opacity -= 0.04;
            });
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animateHeavyPunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                this.scene.remove(ringMesh);
                
                smallRings.forEach(ring => {
                    this.scene.remove(ring.mesh);
                    ring.geometry.dispose();
                    ring.material.dispose();
                });
                
                particles.forEach(particle => {
                    this.scene.remove(particle.mesh);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
                
                impactLines.forEach(line => {
                    this.scene.remove(line.mesh);
                    line.geometry.dispose();
                    line.material.dispose();
                });
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMaterial.dispose();
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        // Start animation
        animateHeavyPunch();
    }
    
    createAttackEffect(direction) {
        // Create a simple attack effect (a cone)
        const attackGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const attackMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        const attackMesh = new THREE.Mesh(attackGeometry, attackMaterial);
        
        // Position and rotate attack effect
        attackMesh.position.copy(this.modelGroup.position);
        attackMesh.position.y += 1;
        attackMesh.rotation.x = Math.PI / 2;
        attackMesh.rotation.y = this.modelGroup.rotation.y;
        
        // Move attack effect forward
        attackMesh.position.x += direction.x * 1.5;
        attackMesh.position.z += direction.z * 1.5;
        
        // Add to scene
        this.scene.add(attackMesh);
        
        // Remove after delay
        setTimeout(() => {
            this.scene.remove(attackMesh);
            attackGeometry.dispose();
            attackMaterial.dispose();
        }, 300);
    }
    
    createKnockbackEffect(position) {
        // Create a shockwave effect at the knockback point
        const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.position.y += 0.1; // Slightly above ground
        ring.rotation.x = Math.PI / 2; // Flat on ground
        
        this.scene.add(ring);
        
        // Animate the shockwave
        let scale = 1.0;
        let opacity = 0.7;
        
        const animateShockwave = () => {
            scale += 0.2;
            opacity -= 0.03;
            
            ring.scale.set(scale, scale, scale);
            ringMaterial.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateShockwave);
            } else {
                this.scene.remove(ring);
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        animateShockwave();
    }
    
    getModelGroup() {
        return this.modelGroup;
    }
}