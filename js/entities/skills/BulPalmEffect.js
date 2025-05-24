import * as THREE from "three";
import { SkillEffect } from "./SkillEffect.js";

/**
 * Specialized effect for Bul Palm skill
 * Creates a giant palm that travels on the ground, causing periodic explosions along its path
 */
export class BulPalmEffect extends SkillEffect {
  constructor(skill) {
    super(skill);
    
    // Palm effect settings
    this.palmHeight = 0.5; // Height above ground
    this.palmScale = 1.5; // Size of the palm
    
    // Explosion settings
    this.explosionInterval = 0.5; // Time between explosions in seconds
    this.lastExplosionTime = 0;
    this.explosionTrail = []; // Store explosion effects along the path
    
    // State tracking
    this.direction = null;
    this.distanceTraveled = 0;
  }

  /**
   * Create a Bul Palm effect
   * @param {THREE.Vector3} position - Position to place the palm
   * @param {THREE.Vector3} direction - Direction to move
   * @returns {THREE.Group} - The created effect
   */
  create(position, direction) {
    try {
      // Clone position to avoid modifying the original
      position = position.clone();
      
      // Create a group for the effect
      const effectGroup = new THREE.Group();
      
      // Store the direction for movement
      this.direction = direction ? direction.clone().normalize() : new THREE.Vector3(0, 0, 1);
      
      // Create the palm effect
      this.createPalmEffect(effectGroup, position);
      
      // Position effect at the starting position
      // Adjust Y position to be on the ground
      position.y = this.palmHeight;
      effectGroup.position.copy(position);
      
      // Set the correct rotation to face the direction
      if (direction) {
        const rotationAngle = Math.atan2(direction.x, direction.z);
        effectGroup.rotation.y = rotationAngle;
      }
      
      // Calculate target position based on direction and range
      this.targetPosition = position.clone().add(
        this.direction.clone().multiplyScalar(this.skill.range || 40)
      );
      
      // Store effect
      this.effect = effectGroup;
      this.isActive = true;
      
      return effectGroup;
    } catch (error) {
      console.error("Error creating BulPalm effect:", error);
      return new THREE.Group();
    }
  }

  /**
   * Create the palm effect visuals
   * @param {THREE.Group} effectGroup - Group to add the effect to
   * @param {THREE.Vector3} position - Position to place the palm
   * @private
   */
  createPalmEffect(effectGroup, position) {
    try {
      // Create the main palm group
      const palmGroup = new THREE.Group();

    // Create a 3D palm model with fingers
    const handGroup = new THREE.Group();
      
    // Create palm base (hand)
    const palmBaseGeometry = new THREE.BoxGeometry(1.5, 0.4, 1.8);
    const palmBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x33ff33, // Green color for Bul Palm
      emissive: 0x33ff33,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.9,
    });
      
    const palmBase = new THREE.Mesh(palmBaseGeometry, palmBaseMaterial);
    palmBase.position.y = 0;
    handGroup.add(palmBase);
      
    // Create fingers (5 elongated shapes)
    const fingerCount = 5;
    const fingerPositions = [
      { x: -0.55, z: 0.7 }, // Thumb
      { x: -0.275, z: 0.85 }, // Index
      { x: 0, z: 0.95 }, // Middle
      { x: 0.275, z: 0.85 }, // Ring
      { x: 0.55, z: 0.7 }, // Pinky
    ];
      
    const fingerLengths = [0.55, 0.7, 0.85, 0.7, 0.55];
      
    for (let i = 0; i < fingerCount; i++) {
      // Create finger
      const fingerGeometry = new THREE.BoxGeometry(
        0.22,
        0.275,
        fingerLengths[i]
      );
      const fingerMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff33,
        emissive: 0x33ff33,
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.9,
      });
        
      const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        
      // Position finger
      finger.position.set(
        fingerPositions[i].x,
        0.1,
        fingerPositions[i].z + fingerLengths[i] / 2
      );
        
      // Add finger joints (knuckles)
      const knuckleGeometry = new THREE.SphereGeometry(0.125, 8, 8);
      const knuckleMaterial = new THREE.MeshStandardMaterial({
        color: 0x44ff44,
        emissive: 0x44ff44,
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.9,
      });
        
      const knuckle = new THREE.Mesh(knuckleGeometry, knuckleMaterial);
      knuckle.position.set(fingerPositions[i].x, 0.1, fingerPositions[i].z);
        
      handGroup.add(finger);
      handGroup.add(knuckle);
        
      // Add fingernails
      const nailGeometry = new THREE.BoxGeometry(0.18, 0.09, 0.18);
      const nailMaterial = new THREE.MeshStandardMaterial({
        color: 0xddffdd,
        emissive: 0xaaffaa,
        emissiveIntensity: 1.8,
        transparent: true,
        opacity: 0.9,
      });
        
      const nail = new THREE.Mesh(nailGeometry, nailMaterial);
      nail.position.set(
        fingerPositions[i].x,
        0.18,
        fingerPositions[i].z + fingerLengths[i]
      );
        
      handGroup.add(nail);
    }
      
    // Add energy aura around the hand
    const auraGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const auraMaterial = new THREE.MeshStandardMaterial({
      color: 0x55ff00,
      emissive: 0x55ff00,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      wireframe: true,
    });
      
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.scale.set(1.8, 0.9, 2.1);
    handGroup.add(aura);
      
    // Add energy particles around the hand
    const particleCount = 55;
    this.particles = [];
      
    for (let i = 0; i < particleCount; i++) {
      // Random position around the hand
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 1.4 + Math.random() * 0.8;
        
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi) * 0.5; // Flatten in Y
      const z = radius * Math.cos(theta);
        
      // Create particle
      const particleSize = 0.06 + Math.random() * 0.1;
      const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff00,
        emissive: 0x33ff00,
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.8 + Math.random() * 0.2,
      });
        
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);
        
      // Store particle animation data
      particle.userData = {
        orbitSpeed: 1.2 + Math.random() * 2.5,
        orbitRadius: new THREE.Vector3(x, y, z).length(),
        orbitAxis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        orbitAngle: Math.random() * Math.PI * 2,
        initialPosition: new THREE.Vector3(x, y, z),
      };
        
      handGroup.add(particle);
      this.particles.push(particle);
    }
      
    // Add trailing energy effect
    const trailCount = 9;
    this.trails = [];
      
    for (let i = 0; i < trailCount; i++) {
      const trailGeometry = new THREE.PlaneGeometry(1.5, 1.5);
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0x33ff00,
        transparent: true,
        opacity: 0.8 - i * 0.08,
        side: THREE.DoubleSide,
      });
        
      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.position.z = -0.8 - i * 0.5;
      trail.rotation.x = Math.PI / 2;
        
      handGroup.add(trail);
      this.trails.push(trail);
    }
      
    // Set hand orientation
    handGroup.rotation.x = -Math.PI / 2; // Point fingers forward
      
    // Position hand above ground
    handGroup.position.y = 1.8;
      
    // Store references
    this.handGroup = handGroup;
      
    // Add hand to palm group
    palmGroup.add(handGroup);
      
    // Create explosion effect (initially hidden)
    const explosionGroup = new THREE.Group();
    explosionGroup.visible = false;

    // Create giant palm for explosion
    const giantPalmShape = new THREE.Shape();
      
    // Palm center
    giantPalmShape.moveTo(0, 0);
    giantPalmShape.absarc(0, 0, 0.7, 0, Math.PI * 2, false);
      
    // Fingers (5 elongated shapes)
    const giantFingerCount = 5;
    for (let i = 0; i < giantFingerCount; i++) {
      const angle = (i / giantFingerCount) * Math.PI * 1.2 - Math.PI * 0.1;
      const length = 1.1 + (i === 2 ? 0.4 : 0); // Middle finger longer
        
      const fingerShape = new THREE.Shape();
      fingerShape.moveTo(0, 0);
      fingerShape.absellipse(
        Math.cos(angle) * 0.7,
        Math.sin(angle) * 0.7,
        0.25,
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
      color: 0x33ff00,
      emissive: 0x33ff00,
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
      
    const giantPalm = new THREE.Mesh(giantPalmGeometry, giantPalmMaterial);
    giantPalm.rotation.x = -Math.PI / 2;
    giantPalm.position.y = 0.6;
    giantPalm.scale.set(4.5, 4.5, 4.5);
      
    // Store animation data
    giantPalm.userData = {
      initialScale: 0.3,
      targetScale: 4.5,
      rotationSpeed: 1.8,
    };
      
    // Start with small scale
    giantPalm.scale.set(
      giantPalm.userData.initialScale,
      giantPalm.userData.initialScale,
      giantPalm.userData.initialScale
    );
      
    explosionGroup.add(giantPalm);
      
    // Create explosion core
    const coreGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x55ff00,
      emissive: 0x55ff00,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.9,
    });
      
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    explosionGroup.add(core);
      
    // Create explosion waves
    const waveCount = 4;
    for (let i = 0; i < waveCount; i++) {
      const waveGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff00,
        emissive: 0x33ff00,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.8 - i * 0.1,
        wireframe: true,
      });
        
      const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        
      // Store animation data
      wave.userData = {
        expansionSpeed: 3.5 - i * 0.5,
        initialScale: 1.2 + i * 0.6,
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
    const explosionParticleCount = 35;
    for (let i = 0; i < explosionParticleCount; i++) {
      // Random direction
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 0.4;
        
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
        
      // Create particle
      const particleGeometry = new THREE.SphereGeometry(0.12, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff00,
        emissive: 0x33ff00,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
      });
        
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);
        
      // Store animation data
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(Math.random() * 3.5 + 1.5),
        gravity: -0.12,
        age: 0,
        maxAge: 1.2 + Math.random(),
      };
        
      explosionGroup.add(particle);
    }
      
    // Store references
    this.explosionGroup = explosionGroup;
    this.palmGroup = palmGroup;
      
    // Add explosion group to palm group
    palmGroup.add(explosionGroup);
      
    // Add palm group to effect group
    effectGroup.add(palmGroup);
      
    // Initialize state
    this.age = 0;
    this.phase = "traveling"; // 'traveling', 'exploding'
    this.explosionTriggered = false;
    this.explosionTriggerTime = 0;
      
    } catch (error) {
      console.error("Error in createPalmEffect:", error);
    }
  }

  /**
   * Create a periodic explosion along the path
   * @param {THREE.Vector3} position - Position to create the explosion
   * @private
   */
  createPathExplosion(position) {
    // Create a new explosion group
    const explosionGroup = new THREE.Group();
    explosionGroup.position.copy(position);
    
    // Create explosion core
    const coreGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x55ff00, // Green color for Bul Palm
      emissive: 0x55ff00,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.9,
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    explosionGroup.add(core);

    // Create explosion waves
    const waveCount = 3;
    const waves = [];
    for (let i = 0; i < waveCount; i++) {
      const waveGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff00, // Green color for Bul Palm
        emissive: 0x33ff00,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.8 - i * 0.1,
        wireframe: true,
      });

      const wave = new THREE.Mesh(waveGeometry, waveMaterial);
      
      // Store animation data
      wave.userData = {
        expansionSpeed: 3.5 - i * 0.5,
        initialScale: 1 + i * 0.5,
      };

      // Set initial scale
      wave.scale.set(
        wave.userData.initialScale,
        wave.userData.initialScale,
        wave.userData.initialScale
      );

      explosionGroup.add(wave);
      waves.push(wave);
    }

    // Create explosion particles
    const explosionParticleCount = 20;
    const particles = [];
    for (let i = 0; i < explosionParticleCount; i++) {
      // Random direction
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 0.3;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      // Create particle
      const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff00, // Green color for Bul Palm
        emissive: 0x33ff00,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);

      // Store animation data
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(Math.random() * 3 + 1),
        gravity: -0.1,
        age: 0,
        maxAge: 1 + Math.random(),
      };

      explosionGroup.add(particle);
      particles.push(particle);
    }

    // Add to scene
    if (this.effect && this.effect.parent) {
      this.effect.parent.add(explosionGroup);
    } else {
      this.effect.add(explosionGroup);
    }

    // Store explosion data
    const explosionData = {
      group: explosionGroup,
      age: 0,
      maxAge: 1.5, // Explosion lasts for 1.5 seconds
      waves: waves,
      particles: particles,
    };

    // Add to explosion trail
    this.explosionTrail.push(explosionData);

    return explosionData;
  }

  /**
   * Update the effect
   * @param {number} delta - Time since last update in seconds
   */
  update(delta) {
    if (!this.isActive || !this.effect) return;
    
    this.elapsedTime += delta;
    this.age += delta;
    
    // Check if effect has expired
    if (this.elapsedTime >= this.skill.duration) {
      this.isActive = false;
      this.dispose();
      return;
    }
    
    // Update the skill's position property to match the effect's position
    this.skill.position.copy(this.effect.position);
    
    // Handle different phases
    switch (this.phase) {
      case "traveling":
        this.updateTravelingPhase(delta);
        break;
      case "exploding":
        this.updateExplodingPhase(delta);
        break;
    }
    
    // Update explosion trail
    this.updateExplosionTrail(delta);
  }

  /**
   * Update the traveling phase of the palm
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateTravelingPhase(delta) {
    // Calculate distance to target
    const currentPosition = this.effect.position.clone();
    const distanceToTarget = currentPosition.distanceTo(this.targetPosition);
    
    // Calculate movement speed
    const speed = this.skill.projectileSpeed || 18;
    const moveDistance = Math.min(speed * delta, distanceToTarget);
    this.distanceTraveled += moveDistance;
    
    // Move the palm forward
    if (this.direction) {
      this.effect.position.x += this.direction.x * moveDistance;
      this.effect.position.z += this.direction.z * moveDistance;
    }
    
    // Animate hand
    if (this.handGroup) {
      // Slight bobbing motion
      this.handGroup.position.y = 1.8 + Math.sin(this.age * 6) * 0.15;
      
      // Slight rotation
      this.handGroup.rotation.z = Math.sin(this.age * 4) * 0.15;
    }
    
    // Animate particles
    for (const particle of this.particles) {
      if (particle.userData) {
        // Orbit around hand
        const axis = particle.userData.orbitAxis;
        const angle = particle.userData.orbitAngle + this.age * particle.userData.orbitSpeed;
        const radius = particle.userData.orbitRadius;
        
        // Create rotation matrix
        const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
        const initialPos = particle.userData.initialPosition.clone();
        initialPos.applyMatrix4(rotationMatrix);
        
        particle.position.copy(initialPos);
      }
    }
    
    // Animate trails
    for (let i = 0; i < this.trails.length; i++) {
      const trail = this.trails[i];
      // Fade out trails based on distance
      const maxDistance = this.skill.range || 40;
      trail.material.opacity = (0.8 - i * 0.08) * (1 - this.distanceTraveled / maxDistance);
    }
    
    // Create periodic explosions along the path
    this.lastExplosionTime += delta;
    if (this.lastExplosionTime >= this.explosionInterval) {
      // Create explosion at current position
      const explosionPosition = this.effect.position.clone();
      explosionPosition.y += 0.5; // Raise explosion slightly above ground
      this.createPathExplosion(explosionPosition);
      
      // Reset timer
      this.lastExplosionTime = 0;
    }
    
    // Check if palm has reached the target or maximum distance
    const maxDistance = this.skill.range || 40;
    if (distanceToTarget < 1.0 || this.distanceTraveled >= maxDistance) {
      // Transition to exploding phase
      this.phase = "exploding";
      
      // Make explosion group visible
      if (this.explosionGroup) {
        this.explosionGroup.visible = true;
      }
      
      // Hide hand group
      if (this.handGroup) {
        this.handGroup.visible = false;
      }
    }
  }

  /**
   * Update the exploding phase of the palm
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateExplodingPhase(delta) {
    // Calculate explosion age
    if (!this.explosionTriggered) {
      this.explosionTriggered = true;
      this.explosionTriggerTime = this.age;
    }
    
    const explosionAge = this.age - this.explosionTriggerTime;
    
    // Update giant palm
    const giantPalm = this.explosionGroup.children[0];
    if (giantPalm && giantPalm.userData) {
      // Scale up to target size
      const scaleProgress = Math.min(explosionAge * 2, 1); // Complete in 0.5 seconds
      const currentScale = giantPalm.userData.initialScale + 
        (giantPalm.userData.targetScale - giantPalm.userData.initialScale) * scaleProgress;
      
      giantPalm.scale.set(currentScale, currentScale, currentScale);
      
      // Rotate
      giantPalm.rotation.z += giantPalm.userData.rotationSpeed * delta;
      
      // Fade out after reaching full size
      if (scaleProgress >= 1) {
        giantPalm.material.opacity = Math.max(0, giantPalm.material.opacity - delta);
      }
    }
    
    // Update explosion core
    const core = this.explosionGroup.children[1];
    if (core) {
      // Pulse size
      const pulseScale = 1.0 + 0.5 * Math.sin(explosionAge * 10);
      core.scale.set(pulseScale, pulseScale, pulseScale);
      
      // Fade out
      core.material.opacity = Math.max(0, 1 - explosionAge * 0.5);
    }
    
    // Update explosion waves
    for (let i = 2; i < 6; i++) { // Waves are at indices 2, 3, 4, 5
      if (i < this.explosionGroup.children.length) {
        const wave = this.explosionGroup.children[i];
        if (wave && wave.userData) {
          // Expand wave
          const expansionScale = wave.userData.initialScale + wave.userData.expansionSpeed * explosionAge;
          wave.scale.set(expansionScale, expansionScale, expansionScale);
          
          // Fade out
          wave.material.opacity = Math.max(0, wave.material.opacity - delta * 0.5);
        }
      }
    }
    
    // Update explosion particles
    for (let i = 6; i < this.explosionGroup.children.length; i++) {
      const particle = this.explosionGroup.children[i];
      if (particle && particle.userData) {
        // Update age
        particle.userData.age += delta;
        
        // Move particle
        particle.position.x += particle.userData.velocity.x * delta;
        particle.position.y += particle.userData.velocity.y * delta;
        particle.position.z += particle.userData.velocity.z * delta;
        
        // Apply gravity
        particle.userData.velocity.y += particle.userData.gravity * delta;
        
        // Fade out based on age
        const ageProgress = particle.userData.age / particle.userData.maxAge;
        particle.material.opacity = Math.max(0, 1 - ageProgress);
        
        // Scale down
        const scale = Math.max(0.1, 1 - ageProgress);
        particle.scale.set(scale, scale, scale);
      }
    }
  }

  /**
   * Update the explosion trail
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateExplosionTrail(delta) {
    // Update each explosion in the trail
    for (let i = this.explosionTrail.length - 1; i >= 0; i--) {
      const explosion = this.explosionTrail[i];
      explosion.age += delta;
      
      // Update explosion waves
      for (const wave of explosion.waves) {
        // Expand wave
        const expansionScale = wave.userData.initialScale + wave.userData.expansionSpeed * explosion.age;
        wave.scale.set(expansionScale, expansionScale, expansionScale);
        
        // Fade out
        wave.material.opacity = Math.max(0, wave.material.opacity - delta * 0.5);
      }
      
      // Update explosion particles
      for (const particle of explosion.particles) {
        // Update age
        particle.userData.age += delta;
        
        // Move particle
        particle.position.x += particle.userData.velocity.x * delta;
        particle.position.y += particle.userData.velocity.y * delta;
        particle.position.z += particle.userData.velocity.z * delta;
        
        // Apply gravity
        particle.userData.velocity.y += particle.userData.gravity * delta;
        
        // Fade out based on age
        const ageProgress = particle.userData.age / particle.userData.maxAge;
        particle.material.opacity = Math.max(0, 1 - ageProgress);
        
        // Scale down
        const scale = Math.max(0.1, 1 - ageProgress);
        particle.scale.set(scale, scale, scale);
      }
      
      // Remove explosion if it's too old
      if (explosion.age >= explosion.maxAge) {
        // Remove from scene
        if (explosion.group.parent) {
          explosion.group.parent.remove(explosion.group);
        }
        
        // Dispose of resources
        explosion.group.traverse(child => {
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
        
        // Remove from array
        this.explosionTrail.splice(i, 1);
      }
    }
  }

  /**
   * Enhanced dispose method to properly clean up all resources
   */
  dispose() {
    if (!this.effect) return;
    
    // Clear references
    this.particles = [];
    this.trails = [];
    this.handGroup = null;
    this.explosionGroup = null;
    this.palmGroup = null;
    
    // Clean up explosion trail
    for (const explosion of this.explosionTrail) {
      // Remove from scene
      if (explosion.group.parent) {
        explosion.group.parent.remove(explosion.group);
      }
      
      // Dispose of resources
      explosion.group.traverse(child => {
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
    }
    
    // Clear explosion trail
    this.explosionTrail.length = 0;
    
    // Recursively dispose of geometries and materials
    this.effect.traverse(child => {
      // Dispose of geometries
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      // Dispose of materials
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            // Dispose of any textures
            if (material.map) material.map.dispose();
            if (material.normalMap) material.normalMap.dispose();
            if (material.specularMap) material.specularMap.dispose();
            if (material.emissiveMap) material.emissiveMap.dispose();
            
            // Dispose of the material itself
            material.dispose();
          });
        } else {
          // Dispose of any textures
          if (child.material.map) child.material.map.dispose();
          if (child.material.normalMap) child.material.normalMap.dispose();
          if (child.material.specularMap) child.material.specularMap.dispose();
          if (child.material.emissiveMap) child.material.emissiveMap.dispose();
          
          // Dispose of the material itself
          child.material.dispose();
        }
      }
      
      // Clear any userData
      if (child.userData) {
        // If userData contains Vector3 objects, null them out
        if (child.userData.initialPosition) {
          child.userData.initialPosition = null;
        }
        if (child.userData.velocity) {
          child.userData.velocity = null;
        }
        if (child.userData.orbitAxis) {
          child.userData.orbitAxis = null;
        }
        
        // Clear the userData object
        child.userData = {};
      }
    });
    
    // Remove from parent
    if (this.effect.parent) {
      this.effect.parent.remove(this.effect);
    }
    
    // Call parent dispose
    super.dispose();
  }

  /**
   * Reset the effect to its initial state
   */
  reset() {
    // Call the dispose method to clean up resources
    this.dispose();
    
    // Reset state variables
    this.isActive = false;
    this.elapsedTime = 0;
    this.age = 0;
    this.lastExplosionTime = 0;
    this.distanceTraveled = 0;
    
    // Clear explosion trail
    this.explosionTrail.length = 0;
  }
}