import * as THREE from 'three';

export class Enemy {
    constructor(scene, player, config) {
        this.scene = scene;
        this.player = player;
        
        // Enemy configuration
        this.type = config.type || 'skeleton';
        this.name = config.name || 'Enemy';
        this.health = config.health || 50;
        this.maxHealth = config.health || 50;
        this.damage = config.damage || 10;
        this.speed = config.speed || 3;
        this.attackRange = config.attackRange || 1.5;
        this.attackSpeed = config.attackSpeed || 1.5;
        this.experienceValue = config.experienceValue || 20;
        this.color = config.color || 0xcccccc;
        this.scale = config.scale || 1;
        this.isBoss = config.isBoss || false;
        
        // Enemy state
        this.state = {
            isMoving: false,
            isAttacking: false,
            isDead: false,
            attackCooldown: 0
        };
        
        // Enemy position and orientation
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Enemy collision
        this.collisionRadius = 0.5 * this.scale;
        this.heightOffset = 1.0 * this.scale;
        
        // Enemy model
        this.modelGroup = null;
    }
    
    init() {
        // Create enemy model
        this.createModel();
    }
    
    createModel() {
        // Create a group for the enemy
        this.modelGroup = new THREE.Group();
        
        // Create different models based on enemy type
        switch (this.type) {
            case 'skeleton':
            case 'skeleton_king':
                this.createSkeletonModel();
                break;
            case 'zombie':
                this.createZombieModel();
                break;
            case 'demon':
            case 'demon_lord':
                this.createDemonModel();
                break;
            default:
                this.createDefaultModel();
                break;
        }
        
        // Scale model if needed
        if (this.scale !== 1) {
            this.modelGroup.scale.set(this.scale, this.scale, this.scale);
        }
        
        // Add model to scene
        this.scene.add(this.modelGroup);
    }
    
    createSkeletonModel() {
        // Create body (thin box)
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (skull-like sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.scale.set(1, 1.2, 1);
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create arms (thin cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.6, 0);
        leftArm.rotation.z = Math.PI / 4;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (thin cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Add weapon for skeleton king
        if (this.type === 'skeleton_king') {
            // Create crown
            const crownGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
            const crownMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = 1.6;
            crown.castShadow = true;
            
            this.modelGroup.add(crown);
            
            // Create sword
            const swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
            const swordMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const sword = new THREE.Mesh(swordGeometry, swordMaterial);
            sword.position.set(0.6, 0.6, 0);
            sword.castShadow = true;
            
            this.modelGroup.add(sword);
        }
    }
    
    createZombieModel() {
        // Create body (slightly hunched box)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.rotation.x = 0.2;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (deformed sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        head.position.z = 0.1;
        head.scale.set(1, 0.9, 1.1);
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create arms (uneven cylinders)
        const leftArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8);
        const rightArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left arm (longer)
        const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.6, 0);
        leftArm.rotation.z = Math.PI / 3;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm (shorter)
        const rightArm = new THREE.Mesh(rightArmGeometry, armMaterial);
        rightArm.position.set(0.5, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (uneven cylinders)
        const leftLegGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8);
        const rightLegGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left leg (normal)
        const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
        leftLeg.position.set(-0.25, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg (shorter)
        const rightLeg = new THREE.Mesh(rightLegGeometry, legMaterial);
        rightLeg.position.set(0.25, -0.05, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Add some torn clothes
        const clothGeometry = new THREE.BoxGeometry(0.9, 0.4, 0.5);
        const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x554433 });
        const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
        cloth.position.y = 0.7;
        cloth.castShadow = true;
        
        this.modelGroup.add(cloth);
    }
    
    createDemonModel() {
        // Create body (muscular box)
        const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (horned sphere)
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create horns
        const hornGeometry = new THREE.ConeGeometry(0.1, 0.4, 8);
        const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        // Left horn
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-0.2, 1.7, 0);
        leftHorn.rotation.z = -Math.PI / 6;
        leftHorn.castShadow = true;
        
        this.modelGroup.add(leftHorn);
        
        // Right horn
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(0.2, 1.7, 0);
        rightHorn.rotation.z = Math.PI / 6;
        rightHorn.castShadow = true;
        
        this.modelGroup.add(rightHorn);
        
        // Create arms (muscular cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 0.6, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.6, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (muscular cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Add wings for demon lord
        if (this.type === 'demon_lord') {
            // Create wings
            const wingGeometry = new THREE.BoxGeometry(1, 0.1, 1.5);
            const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x550000 });
            
            // Left wing
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.8, 0.8, 0);
            leftWing.rotation.y = Math.PI / 4;
            leftWing.rotation.x = Math.PI / 6;
            leftWing.castShadow = true;
            
            this.modelGroup.add(leftWing);
            
            // Right wing
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.8, 0.8, 0);
            rightWing.rotation.y = -Math.PI / 4;
            rightWing.rotation.x = Math.PI / 6;
            rightWing.castShadow = true;
            
            this.modelGroup.add(rightWing);
            
            // Create weapon (trident)
            const tridentHandleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
            const tridentHandleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const tridentHandle = new THREE.Mesh(tridentHandleGeometry, tridentHandleMaterial);
            tridentHandle.position.set(0.8, 0.6, 0);
            tridentHandle.rotation.z = -Math.PI / 2;
            tridentHandle.castShadow = true;
            
            this.modelGroup.add(tridentHandle);
            
            // Create trident prongs
            const prongGeometry = new THREE.ConeGeometry(0.05, 0.3, 8);
            const prongMaterial = new THREE.MeshStandardMaterial({ color: 0x550000 });
            
            // Middle prong
            const middleProng = new THREE.Mesh(prongGeometry, prongMaterial);
            middleProng.position.set(1.5, 0.6, 0);
            middleProng.rotation.z = -Math.PI / 2;
            middleProng.castShadow = true;
            
            this.modelGroup.add(middleProng);
            
            // Left prong
            const leftProng = new THREE.Mesh(prongGeometry, prongMaterial);
            leftProng.position.set(1.4, 0.6, 0.15);
            leftProng.rotation.z = -Math.PI / 2;
            leftProng.rotation.y = -Math.PI / 12;
            leftProng.castShadow = true;
            
            this.modelGroup.add(leftProng);
            
            // Right prong
            const rightProng = new THREE.Mesh(prongGeometry, prongMaterial);
            rightProng.position.set(1.4, 0.6, -0.15);
            rightProng.rotation.z = -Math.PI / 2;
            rightProng.rotation.y = Math.PI / 12;
            rightProng.castShadow = true;
            
            this.modelGroup.add(rightProng);
        }
    }
    
    createDefaultModel() {
        // Create body (cube)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.3;
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create limbs (cylinders)
        const limbGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const limbMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        
        // Left arm
        const leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
        leftArm.position.set(-0.5, 0.5, 0);
        leftArm.rotation.z = Math.PI / 2;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
        rightArm.position.set(0.5, 0.5, 0);
        rightArm.rotation.z = -Math.PI / 2;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Left leg
        const leftLeg = new THREE.Mesh(limbGeometry, limbMaterial);
        leftLeg.position.set(-0.3, -0.1, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(limbGeometry, limbMaterial);
        rightLeg.position.set(0.3, -0.1, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
    }
    
    update(delta) {
        // Skip update if dead
        if (this.state.isDead) return;
        
        // Update attack cooldown
        if (this.state.attackCooldown > 0) {
            this.state.attackCooldown -= delta;
        }
        
        // Get player position
        const playerPosition = this.player.getPosition();
        
        // Calculate distance to player
        const distanceToPlayer = this.position.distanceTo(playerPosition);
        
        // Check if player is in attack range
        if (distanceToPlayer <= this.attackRange) {
            // Attack player if cooldown is ready
            if (this.state.attackCooldown <= 0) {
                this.attackPlayer();
                this.state.attackCooldown = 1 / this.attackSpeed;
            }
            
            // Stop moving
            this.state.isMoving = false;
        } else {
            // Move towards player
            this.state.isMoving = true;
            
            // Calculate direction to player
            const direction = new THREE.Vector3().subVectors(playerPosition, this.position).normalize();
            
            // Calculate movement step
            const step = this.speed * delta;
            
            // Calculate new position
            const newPosition = new THREE.Vector3(
                this.position.x + direction.x * step,
                this.position.y,
                this.position.z + direction.z * step
            );
            
            // Update position
            this.setPosition(newPosition.x, newPosition.y, newPosition.z);
            
            // Update rotation to face player
            this.rotation.y = Math.atan2(direction.x, direction.z);
            this.modelGroup.rotation.y = this.rotation.y;
        }
        
        // Update animations
        this.updateAnimations(delta);
    }
    
    updateAnimations(delta) {
        // Simple animations for the enemy model
        if (this.state.isMoving) {
            // Walking animation
            const walkSpeed = 5;
            const walkAmplitude = 0.1;
            
            // Animate legs
            if (this.modelGroup.children.length >= 5) {
                const leftLeg = this.modelGroup.children[4];
                const rightLeg = this.modelGroup.children[5];
                
                leftLeg.position.z = Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
                rightLeg.position.z = -Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            }
            
            // Animate arms
            if (this.modelGroup.children.length >= 3) {
                const leftArm = this.modelGroup.children[2];
                const rightArm = this.modelGroup.children[3];
                
                leftArm.rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
                rightArm.rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
            }
        }
        
        // Attack animation
        if (this.state.isAttacking) {
            // Simple attack animation
            if (this.modelGroup.children.length >= 3) {
                const rightArm = this.modelGroup.children[3];
                rightArm.rotation.x = Math.sin(Date.now() * 0.02) * 0.5;
            }
        }
    }
    
    attackPlayer() {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create attack effect
        this.createAttackEffect();
        
        // Deal damage to player
        this.player.takeDamage(this.damage);
        
        // Reset attack state after delay
        setTimeout(() => {
            this.state.isAttacking = false;
        }, 500);
    }
    
    createAttackEffect() {
        // Create a simple attack effect (a cone)
        const attackGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const attackMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        
        const attackMesh = new THREE.Mesh(attackGeometry, attackMaterial);
        
        // Position and rotate attack effect
        attackMesh.position.copy(this.position);
        attackMesh.position.y += 1;
        attackMesh.rotation.x = Math.PI / 2;
        attackMesh.rotation.y = this.rotation.y;
        
        // Move attack effect forward
        const direction = new THREE.Vector3(
            Math.sin(this.rotation.y),
            0,
            Math.cos(this.rotation.y)
        );
        
        attackMesh.position.x += direction.x * 0.8;
        attackMesh.position.z += direction.z * 0.8;
        
        // Add to scene
        this.scene.add(attackMesh);
        
        // Remove after delay
        setTimeout(() => {
            this.scene.remove(attackMesh);
        }, 300);
    }
    
    takeDamage(damage) {
        // Apply damage
        this.health -= damage;
        
        // Check if enemy is dead
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        // Flash enemy red
        this.flashDamage();
        
        return damage;
    }
    
    flashDamage() {
        // Store original colors
        const originalColors = [];
        
        // Change all materials to red
        this.modelGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                originalColors.push({
                    mesh: child,
                    color: child.material.color.clone()
                });
                
                child.material.color.set(0xff0000);
            }
        });
        
        // Restore original colors after delay
        setTimeout(() => {
            originalColors.forEach(item => {
                item.mesh.material.color.copy(item.color);
            });
        }, 200);
    }
    
    die() {
        // Set dead state
        this.state.isDead = true;
        
        // Play death animation
        this.modelGroup.rotation.x = Math.PI / 2;
        
        // Fade out
        this.modelGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                
                // Animate opacity
                const fadeOut = setInterval(() => {
                    child.material.opacity -= 0.05;
                    
                    if (child.material.opacity <= 0) {
                        clearInterval(fadeOut);
                    }
                }, 50);
            }
        });
        
        // Drop loot
        this.dropLoot();
    }
    
    dropLoot() {
        // Create a simple loot effect
        const lootGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const lootMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.8
        });
        
        const lootMesh = new THREE.Mesh(lootGeometry, lootMaterial);
        
        // Position loot at enemy position
        lootMesh.position.copy(this.position);
        lootMesh.position.y = 0.15;
        
        // Add to scene
        this.scene.add(lootMesh);
        
        // Animate loot
        const rotationSpeed = 2;
        const bounceHeight = 0.5;
        const bounceSpeed = 2;
        
        const lootAnimation = setInterval(() => {
            lootMesh.rotation.y += 0.05 * rotationSpeed;
            lootMesh.position.y = 0.15 + Math.abs(Math.sin(Date.now() * 0.003 * bounceSpeed)) * bounceHeight;
        }, 16);
        
        // Remove loot after delay
        setTimeout(() => {
            clearInterval(lootAnimation);
            this.scene.remove(lootMesh);
        }, 10000);
    }
    
    remove() {
        // Remove model from scene
        if (this.modelGroup) {
            this.scene.remove(this.modelGroup);
        }
    }
    
    setPosition(x, y, z) {
        // Update position
        this.position.set(x, y, z);
        
        // Update model position
        if (this.modelGroup) {
            this.modelGroup.position.copy(this.position);
        }
    }
    
    getPosition() {
        return this.position;
    }
    
    getRotation() {
        return this.rotation;
    }
    
    getCollisionRadius() {
        return this.collisionRadius;
    }
    
    getHealth() {
        return this.health;
    }
    
    getMaxHealth() {
        return this.maxHealth;
    }
    
    getExperienceValue() {
        return this.experienceValue;
    }
    
    isDead() {
        return this.state.isDead;
    }
    
    getName() {
        return this.name;
    }
    
    getType() {
        return this.type;
    }
    
    isBossEnemy() {
        return this.isBoss;
    }
}