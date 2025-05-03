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
            case 'frost_titan':
                this.createFrostTitanModel();
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
    
    createFrostTitanModel() {
        // Create body (massive ice body)
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: this.color,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (crystalline structure)
        const headGeometry = new THREE.DodecahedronGeometry(0.6, 1);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: this.color,
            roughness: 0.2,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.5;
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create ice spikes on shoulders
        const spikeGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
        const spikeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.9
        });
        
        // Left shoulder spike
        const leftSpike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        leftSpike.position.set(-0.9, 2, 0);
        leftSpike.rotation.z = -Math.PI / 6;
        leftSpike.castShadow = true;
        
        this.modelGroup.add(leftSpike);
        
        // Right shoulder spike
        const rightSpike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        rightSpike.position.set(0.9, 2, 0);
        rightSpike.rotation.z = Math.PI / 6;
        rightSpike.castShadow = true;
        
        this.modelGroup.add(rightSpike);
        
        // Create arms (crystalline structures)
        const armGeometry = new THREE.CylinderGeometry(0.25, 0.15, 1.2, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ 
            color: this.color,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9
        });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.9, 1.2, 0);
        leftArm.rotation.z = Math.PI / 8;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.9, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 8;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (thick ice pillars)
        const legGeometry = new THREE.CylinderGeometry(0.3, 0.2, 1, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ 
            color: this.color,
            roughness: 0.4,
            metalness: 0.7,
            transparent: true,
            opacity: 0.9
        });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.5, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.5, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Create ice crown
        const crownGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 8);
        const crownMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7
        });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 2.9;
        crown.castShadow = true;
        
        this.modelGroup.add(crown);
        
        // Create ice spikes on crown
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const crownSpike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            crownSpike.scale.set(0.5, 0.5, 0.5);
            crownSpike.position.set(
                Math.cos(angle) * 0.6,
                3.1,
                Math.sin(angle) * 0.6
            );
            crownSpike.rotation.x = Math.PI / 2;
            crownSpike.rotation.z = -angle;
            crownSpike.castShadow = true;
            
            this.modelGroup.add(crownSpike);
        }
        
        // Create ice weapon (staff)
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
        const staffMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.9
        });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(1.2, 1.2, 0);
        staff.rotation.z = -Math.PI / 2;
        staff.castShadow = true;
        
        this.modelGroup.add(staff);
        
        // Create ice crystal at the end of staff
        const crystalGeometry = new THREE.OctahedronGeometry(0.3, 1);
        const crystalMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            roughness: 0.1,
            metalness: 1.0,
            transparent: true,
            opacity: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(2.3, 1.2, 0);
        crystal.castShadow = true;
        
        this.modelGroup.add(crystal);
        
        // Add particle effects for frost aura
        const particleCount = 20;
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaddff,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 0.5;
            const height = Math.random() * 2;
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            particle.scale.set(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );
            
            this.modelGroup.add(particle);
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
        
        // Initialize special ability cooldowns if not already set
        if (this.type === 'frost_titan' && !this.specialAbilityCooldowns) {
            this.specialAbilityCooldowns = {
                iceStorm: 0,
                frostNova: 0,
                iceBarrier: 0
            };
            this.iceBarrierActive = false;
        }
        
        // Update special ability cooldowns
        if (this.specialAbilityCooldowns) {
            if (this.specialAbilityCooldowns.iceStorm > 0) {
                this.specialAbilityCooldowns.iceStorm -= delta;
            }
            if (this.specialAbilityCooldowns.frostNova > 0) {
                this.specialAbilityCooldowns.frostNova -= delta;
            }
            if (this.specialAbilityCooldowns.iceBarrier > 0) {
                this.specialAbilityCooldowns.iceBarrier -= delta;
            }
        }
        
        // Get player position
        const playerPosition = this.player.getPosition();
        
        // Calculate distance to player
        const distanceToPlayer = this.position.distanceTo(playerPosition);
        
        // Special behavior for Frost Titan
        if (this.type === 'frost_titan') {
            // Use ice storm ability when player is at medium range
            if (distanceToPlayer <= 10 && distanceToPlayer > this.attackRange && this.specialAbilityCooldowns.iceStorm <= 0) {
                this.useIceStormAbility();
                this.specialAbilityCooldowns.iceStorm = 8; // 8 seconds cooldown
                return;
            }
            
            // Use frost nova ability when player is close
            if (distanceToPlayer <= this.attackRange * 1.5 && this.specialAbilityCooldowns.frostNova <= 0) {
                this.useFrostNovaAbility();
                this.specialAbilityCooldowns.frostNova = 12; // 12 seconds cooldown
                return;
            }
            
            // Use ice barrier when health is low
            if (this.health < this.maxHealth * 0.3 && !this.iceBarrierActive && this.specialAbilityCooldowns.iceBarrier <= 0) {
                this.useIceBarrierAbility();
                this.specialAbilityCooldowns.iceBarrier = 20; // 20 seconds cooldown
                this.iceBarrierActive = true;
                
                // Reset ice barrier after 5 seconds
                setTimeout(() => {
                    this.iceBarrierActive = false;
                }, 5000);
                
                return;
            }
        }
        
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
    
    // Frost Titan special abilities
    useIceStormAbility() {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create ice storm effect
        const stormRadius = 5;
        const particleCount = 50;
        const duration = 3000; // 3 seconds
        
        // Create storm container
        const stormGroup = new THREE.Group();
        
        // Get player position for targeting
        const playerPosition = this.player.getPosition();
        
        // Position storm at player's location
        stormGroup.position.copy(playerPosition);
        stormGroup.position.y += 5; // Start above player
        
        // Create ice particles
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position within storm radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * stormRadius;
            particle.position.set(
                Math.cos(angle) * radius,
                Math.random() * 5,
                Math.sin(angle) * radius
            );
            
            // Store initial y position for animation
            particle.userData.initialY = particle.position.y;
            particle.userData.fallSpeed = 2 + Math.random() * 3;
            
            stormGroup.add(particle);
            particles.push(particle);
        }
        
        // Add to scene
        this.scene.add(stormGroup);
        
        // Animate storm
        const startTime = Date.now();
        const stormInterval = setInterval(() => {
            // Update particle positions
            particles.forEach(particle => {
                // Move particle down
                particle.position.y -= particle.userData.fallSpeed * 0.1;
                
                // If particle reaches ground, reset to top
                if (particle.position.y < 0) {
                    particle.position.y = particle.userData.initialY;
                    
                    // Randomize x and z position
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * stormRadius;
                    particle.position.x = Math.cos(angle) * radius;
                    particle.position.z = Math.sin(angle) * radius;
                }
            });
            
            // Check if player is in storm area
            const playerPos = this.player.getPosition();
            const stormPos = new THREE.Vector3(stormGroup.position.x, 0, stormGroup.position.z);
            const distanceToStorm = playerPos.distanceTo(stormPos);
            
            // Deal damage if player is in storm
            if (distanceToStorm < stormRadius) {
                this.player.takeDamage(this.damage * 0.2);
            }
            
            // Check if storm duration is over
            if (Date.now() - startTime > duration) {
                clearInterval(stormInterval);
                this.scene.remove(stormGroup);
                this.state.isAttacking = false;
            }
        }, 100);
    }
    
    useFrostNovaAbility() {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create frost nova effect
        const novaRadius = 5;
        const novaGeometry = new THREE.RingGeometry(novaRadius - 0.2, novaRadius, 32);
        const novaMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const novaRing = new THREE.Mesh(novaGeometry, novaMaterial);
        novaRing.rotation.x = -Math.PI / 2;
        novaRing.position.copy(this.position);
        novaRing.position.y += 0.1;
        
        // Add to scene
        this.scene.add(novaRing);
        
        // Create ice spikes
        const spikeCount = 16;
        const spikes = [];
        
        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2;
            const spikeGeometry = new THREE.ConeGeometry(0.2, 1, 8);
            const spikeMaterial = new THREE.MeshBasicMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.9
            });
            
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.copy(this.position);
            spike.position.x += Math.cos(angle) * 2;
            spike.position.z += Math.sin(angle) * 2;
            spike.rotation.x = Math.PI / 2;
            spike.scale.set(0.1, 0.1, 0.1);
            
            this.scene.add(spike);
            spikes.push(spike);
        }
        
        // Animate nova expansion
        const startTime = Date.now();
        const novaInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const scale = Math.min(elapsed * 2, 1);
            
            // Scale ring
            novaRing.scale.set(scale, scale, scale);
            
            // Grow spikes
            spikes.forEach(spike => {
                spike.scale.set(scale, scale, scale);
            });
            
            // Check if player is in nova area
            const playerPos = this.player.getPosition();
            const distanceToNova = playerPos.distanceTo(this.position);
            
            // Deal damage and slow player if in nova area
            if (distanceToNova < novaRadius * scale) {
                this.player.takeDamage(this.damage * 0.5);
                
                // Slow player (reduce speed by 50% for 2 seconds)
                const originalSpeed = this.player.speed;
                this.player.speed = originalSpeed * 0.5;
                
                setTimeout(() => {
                    this.player.speed = originalSpeed;
                }, 2000);
            }
            
            // Remove nova after 1 second
            if (elapsed >= 1) {
                clearInterval(novaInterval);
                this.scene.remove(novaRing);
                spikes.forEach(spike => this.scene.remove(spike));
                this.state.isAttacking = false;
            }
        }, 50);
    }
    
    useIceBarrierAbility() {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create ice barrier effect
        const barrierRadius = 3;
        const barrierGeometry = new THREE.SphereGeometry(barrierRadius, 32, 32);
        const barrierMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.copy(this.position);
        barrier.position.y += 1.5;
        
        // Add to scene
        this.scene.add(barrier);
        
        // Create ice crystals around barrier
        const crystalCount = 12;
        const crystals = [];
        
        for (let i = 0; i < crystalCount; i++) {
            const angle = (i / crystalCount) * Math.PI * 2;
            const height = Math.random() * 3;
            
            const crystalGeometry = new THREE.OctahedronGeometry(0.3, 1);
            const crystalMaterial = new THREE.MeshBasicMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.8
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.copy(this.position);
            crystal.position.x += Math.cos(angle) * barrierRadius;
            crystal.position.z += Math.sin(angle) * barrierRadius;
            crystal.position.y += height;
            crystal.rotation.y = Math.random() * Math.PI;
            
            this.scene.add(crystal);
            crystals.push(crystal);
        }
        
        // Reduce incoming damage while barrier is active
        const originalTakeDamage = this.takeDamage;
        this.takeDamage = (damage) => {
            // Reduce damage by 75%
            originalTakeDamage.call(this, damage * 0.25);
        };
        
        // Animate barrier
        const startTime = Date.now();
        const barrierInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            
            // Pulse barrier
            const scale = 1 + Math.sin(elapsed * 5) * 0.1;
            barrier.scale.set(scale, scale, scale);
            
            // Rotate crystals
            crystals.forEach((crystal, index) => {
                crystal.rotation.y += 0.02 * (index % 2 === 0 ? 1 : -1);
                crystal.position.y += Math.sin(elapsed * 3 + index) * 0.01;
            });
            
            // Remove barrier after 5 seconds
            if (elapsed >= 5) {
                clearInterval(barrierInterval);
                this.scene.remove(barrier);
                crystals.forEach(crystal => this.scene.remove(crystal));
                this.state.isAttacking = false;
                
                // Restore original damage function
                this.takeDamage = originalTakeDamage;
            }
        }, 50);
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