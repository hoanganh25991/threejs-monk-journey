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
            default:
                return this.createDefaultEffect();
        }
    }
    
    createRangedEffect() {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
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
            default:
                this.updateDefaultEffect(delta);
                break;
        }
    }
    
    updateRangedEffect(delta) {
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
    
    updateAoeEffect(delta) {
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