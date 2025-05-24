import * as THREE from "three";
import { SkillEffect } from "./SkillEffect.js";

/**
 * Specialized effect for Bul Palm skill
 * Creates a giant palm that moves forward, causing periodic explosions along its path
 */
export class BulPalmEffect extends SkillEffect {
  constructor(skill) {
    super(skill);
    this.markSize = 1.2; // Slightly larger than ExplodingPalm
    this.markHeight = 2.2; // Slightly higher than ExplodingPalm
    this.targetEntity = null;
    this.bulPalmState = null;
    
    // Periodic explosion settings
    this.explosionInterval = 0.5; // Time between explosions in seconds
    this.lastExplosionTime = 0;
    this.explosionTrail = []; // Store explosion effects along the path
  }

  /**
   * Create a Bul Palm effect
   * @param {THREE.Vector3} position - Position to place the palm
   * @param {THREE.Vector3} direction - Direction to move
   * @param {Object} targetEnemy - The nearest enemy to target (optional)
   * @returns {THREE.Group} - The created effect
   */
  create(position, direction, targetEnemy) {
    try {
      position = position.clone();
      position.y -= 2.5; // Slightly higher than ExplodingPalm
      
      // Store the target enemy for tracking
      this.targetEntity = targetEnemy;
      
      // Create a group for the effect
      const effectGroup = new THREE.Group();
  
      // Initialize bulPalmState with a temporary object to prevent null errors
      this.bulPalmState = {
        palmGroup: null,
        handGroup: null,
        explosionGroup: null,
        particles: [],
        trails: [],
        phase: "flying",
        age: 0,
        flyingSpeed: this.skill.projectileSpeed || 18,
        distanceTraveled: 0,
        maxDistance: this.skill.range || 40,
        explosionTriggered: false,
        explosionTriggerTime: 0
      };
      
      console.debug("BulPalmState initialized with temporary values before creating palm effect");
  
      // Create the Bul Palm effect
      this.createPalmEffect(effectGroup, position, direction);
  
      // Position effect at the hero's position
      effectGroup.position.copy(position);

    // Set the correct rotation to face the direction of the target
    if (direction) {
      // Calculate the correct rotation angle to face the target
      // Using Math.atan2 for the correct angle calculation
      const rotationAngle = Math.atan2(direction.x, direction.z);
      
      // Apply rotation to the effect group
      effectGroup.rotation.y = rotationAngle;
      
      console.debug(`Setting palm rotation angle: ${(rotationAngle * 180 / Math.PI).toFixed(2)} degrees`);

      // Ensure the palm group is properly rotated
      if (this.bulPalmState && this.bulPalmState.palmGroup) {
        // Set the palm group's initial rotation to face the target direction
        this.bulPalmState.palmGroup.rotation.y = rotationAngle;
        
        // Debug the palm group rotation
        console.debug(`Palm group rotation set to: ${(this.bulPalmState.palmGroup.rotation.y * 180 / Math.PI).toFixed(2)} degrees`);

        // Ensure the hand is oriented correctly within the palm group
        if (this.bulPalmState.handGroup) {
          // The hand should be perpendicular to the direction of travel
          // Rotate the hand to face forward in the palm's local space
          this.bulPalmState.handGroup.rotation.x = -Math.PI / 2; // Point fingers forward
          this.bulPalmState.handGroup.rotation.y = 0; // No rotation on Y axis in local space
          this.bulPalmState.handGroup.rotation.z = 0; // No rotation on Z axis
        }
        
        // Position the palm in front of the hero (in the direction they're facing)
        if (direction) {
          // Calculate the position in front of the hero
          const forwardPosition = direction.clone().normalize().multiplyScalar(1.5);
          // Move the palm group to this position
          this.bulPalmState.palmGroup.position.add(forwardPosition);
          
          console.debug(`Positioned palm in front of the hero at: ${this.bulPalmState.palmGroup.position.x.toFixed(2)}, ${this.bulPalmState.palmGroup.position.y.toFixed(2)}, ${this.bulPalmState.palmGroup.position.z.toFixed(2)}`);
        }
      }
    }
    
    // If we have a target enemy, store its initial position for path calculation
    if (targetEnemy) {
      this.targetPosition = targetEnemy.getPosition().clone();
      console.debug(`Targeting enemy at position: ${this.targetPosition.x.toFixed(2)}, ${this.targetPosition.y.toFixed(2)}, ${this.targetPosition.z.toFixed(2)}`);
    } else {
      // If no target enemy, calculate a target position based on direction and range
      this.targetPosition = position.clone().add(direction.clone().multiplyScalar(this.skill.range));
      console.debug(`No target enemy, using calculated target position: ${this.targetPosition.x.toFixed(2)}, ${this.targetPosition.y.toFixed(2)}, ${this.targetPosition.z.toFixed(2)}`);
    }

    // Store effect
    this.effect = effectGroup;
    this.isActive = true;

    return effectGroup;
    } catch (error) {
      console.error("Error creating BulPalm effect:", error);
      // Return an empty group if there's an error
      return new THREE.Group();
    }
  }

  /**
   * Create the Bul Palm effect
   * @param {THREE.Group} effectGroup - Group to add the effect to
   * @param {THREE.Vector3} position - Position to place the palm
   * @param {THREE.Vector3} direction - Direction to move
   * @private
   */
  createPalmEffect(effectGroup, position, direction) {
    try {
      console.debug("Starting createPalmEffect method");
      
      // Store the direction for use in the update method
      if (direction) {
        this.currentDirection = direction.clone();
      } else {
        this.currentDirection = new THREE.Vector3(0, 0, 1);
      }
  
      // Create the main palm group
      const palmGroup = new THREE.Group();
      
      // Update the palmGroup in bulPalmState
      if (this.bulPalmState) {
        this.bulPalmState.palmGroup = palmGroup;
        console.debug("Updated palmGroup in bulPalmState");
      } else {
        console.error("bulPalmState is null in createPalmEffect");
      }

    // Create a 3D palm model with fingers
    const handGroup = new THREE.Group();

    // Create palm base (hand) - INCREASED SIZE for visibility
    const palmBaseGeometry = new THREE.BoxGeometry(1.5, 0.4, 1.8);
    const palmBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x33ff33, // Green color for Bul Palm
      emissive: 0x33ff33,
      emissiveIntensity: 2.5, // Increased intensity
      transparent: true,
      opacity: 0.9,
    });

    const palmBase = new THREE.Mesh(palmBaseGeometry, palmBaseMaterial);
    palmBase.position.y = 0;
    handGroup.add(palmBase);

    // Create fingers (5 elongated shapes)
    const fingerCount = 5;
    const fingerPositions = [
      { x: -0.55, z: 0.7 }, // Thumb - adjusted positions
      { x: -0.275, z: 0.85 }, // Index
      { x: 0, z: 0.95 }, // Middle
      { x: 0.275, z: 0.85 }, // Ring
      { x: 0.55, z: 0.7 }, // Pinky
    ];

    const fingerLengths = [0.55, 0.7, 0.85, 0.7, 0.55]; // Longer fingers for visibility

    for (let i = 0; i < fingerCount; i++) {
      // Create finger - INCREASED SIZE for visibility
      const fingerGeometry = new THREE.BoxGeometry(
        0.22,
        0.275,
        fingerLengths[i]
      );
      const fingerMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff33, // Green color for Bul Palm
        emissive: 0x33ff33,
        emissiveIntensity: 2.5, // Increased intensity
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

      // Add finger joints (knuckles) - INCREASED SIZE for visibility
      const knuckleGeometry = new THREE.SphereGeometry(0.125, 8, 8);
      const knuckleMaterial = new THREE.MeshStandardMaterial({
        color: 0x44ff44, // Green color for Bul Palm
        emissive: 0x44ff44,
        emissiveIntensity: 2.5, // Increased intensity
        transparent: true,
        opacity: 0.9,
      });

      const knuckle = new THREE.Mesh(knuckleGeometry, knuckleMaterial);
      knuckle.position.set(fingerPositions[i].x, 0.1, fingerPositions[i].z);

      handGroup.add(finger);
      handGroup.add(knuckle);

      // Add fingernails - INCREASED SIZE for visibility
      const nailGeometry = new THREE.BoxGeometry(0.18, 0.09, 0.18);
      const nailMaterial = new THREE.MeshStandardMaterial({
        color: 0xddffdd, // Light green for Bul Palm
        emissive: 0xaaffaa,
        emissiveIntensity: 1.8, // Increased intensity
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

    // Add energy aura around the hand - INCREASED SIZE for visibility
    const auraGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const auraMaterial = new THREE.MeshStandardMaterial({
      color: 0x55ff00, // Green color for Bul Palm
      emissive: 0x55ff00,
      emissiveIntensity: 2.5, // Increased intensity
      transparent: true,
      opacity: 0.6, // Increased opacity
      side: THREE.DoubleSide,
      wireframe: true,
    });

    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.scale.set(1.8, 0.9, 2.1); // Increased scale
    handGroup.add(aura);

    // Add energy particles around the hand - INCREASED SIZE and COUNT
    const particleCount = 55; // More particles
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      // Random position around the hand
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 1.4 + Math.random() * 0.8; // Larger radius

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi) * 0.5; // Flatten in Y
      const z = radius * Math.cos(theta);

      // Create particle - INCREASED SIZE
      const particleSize = 0.06 + Math.random() * 0.1; // Larger particles
      const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff00, // Green color for Bul Palm
        emissive: 0x33ff00,
        emissiveIntensity: 2.5, // Increased intensity
        transparent: true,
        opacity: 0.8 + Math.random() * 0.2, // Higher opacity
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);

      // Store particle animation data
      particle.userData = {
        orbitSpeed: 1.2 + Math.random() * 2.5, // Faster orbit
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
      particles.push(particle);
    }

    // Add trailing energy effect - INCREASED SIZE
    const trailCount = 9; // More trails
    const trails = [];

    for (let i = 0; i < trailCount; i++) {
      const trailGeometry = new THREE.PlaneGeometry(1.5, 1.5); // Larger trails
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0x33ff00, // Green color for Bul Palm
        transparent: true,
        opacity: 0.8 - i * 0.08, // Higher base opacity
        side: THREE.DoubleSide,
      });

      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.position.z = -0.8 - i * 0.5; // More spacing
      trail.rotation.x = Math.PI / 2;

      handGroup.add(trail);
      trails.push(trail);
    }

    // We'll set the final rotation in the create method
    // This ensures the hand is properly oriented relative to the target
    
    // Position higher for better visibility
    handGroup.position.y = 1.8; // Higher position
    
    // Update the handGroup in bulPalmState
    if (this.bulPalmState) {
      this.bulPalmState.handGroup = handGroup;
      console.debug("Updated handGroup in bulPalmState");
    } else {
      console.error("bulPalmState is null when trying to set handGroup");
    }

    palmGroup.add(handGroup);

    // Create explosion effect (initially hidden)
    const explosionGroup = new THREE.Group();
    explosionGroup.visible = false;

    // Create giant palm for explosion - IMPROVED SHAPE
    const giantPalmShape = new THREE.Shape();

    // Create a larger hand shape for the explosion
    // Palm center - INCREASED SIZE
    giantPalmShape.moveTo(0, 0);
    giantPalmShape.absarc(0, 0, 0.7, 0, Math.PI * 2, false); // Larger palm center

    // Fingers (5 elongated shapes) - IMPROVED SHAPE
    const giantFingerCount = 5;
    for (let i = 0; i < giantFingerCount; i++) {
      const angle = (i / giantFingerCount) * Math.PI * 1.2 - Math.PI * 0.1;
      const length = 1.1 + (i === 2 ? 0.4 : 0); // Longer fingers, middle finger even longer

      const fingerShape = new THREE.Shape();
      fingerShape.moveTo(0, 0);
      fingerShape.absellipse(
        Math.cos(angle) * 0.7, // Adjusted to match larger palm
        Math.sin(angle) * 0.7,
        0.25, // Wider fingers
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
      color: 0x33ff00, // Green color for Bul Palm
      emissive: 0x33ff00,
      emissiveIntensity: 3.5, // Increased intensity
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const giantPalm = new THREE.Mesh(giantPalmGeometry, giantPalmMaterial);
    giantPalm.rotation.x = -Math.PI / 2;
    giantPalm.position.y = 0.6; // Position above ground
    giantPalm.scale.set(4.5, 4.5, 4.5); // Make it even larger

    // Store animation data
    giantPalm.userData = {
      initialScale: 0.3, // Start slightly larger
      targetScale: 4.5, // Grow to larger size
      rotationSpeed: 1.8, // Rotate faster
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
      color: 0x55ff00, // Green color for Bul Palm
      emissive: 0x55ff00,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.9,
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    explosionGroup.add(core);

    // Create explosion waves
    const waveCount = 4; // One more wave than ExplodingPalm
    for (let i = 0; i < waveCount; i++) {
      const waveGeometry = new THREE.SphereGeometry(0.4, 16, 16);
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
        expansionSpeed: 3.5 - i * 0.5, // Faster expansion
        initialScale: 1.2 + i * 0.6, // Larger initial scale
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
    const explosionParticleCount = 35; // More particles
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
        ).normalize().multiplyScalar(Math.random() * 3.5 + 1.5),
        gravity: -0.12,
        age: 0,
        maxAge: 1.2 + Math.random(),
      };

      explosionGroup.add(particle);
    }

    // Add explosion group to palm group
    palmGroup.add(explosionGroup);

    // Add palm group to effect group
    effectGroup.add(palmGroup);

    // Store animation state
    this.bulPalmState = {
      age: 0,
      phase: "flying", // 'flying', 'exploding'
      palmGroup: palmGroup,
      handGroup: handGroup,
      particles: particles,
      trails: trails,
      explosionGroup: explosionGroup,
      flyingSpeed: this.skill.projectileSpeed || 18, // Use skill's projectileSpeed or default to 18
      distanceTraveled: 0,
      maxDistance: this.skill.range || 40, // Use skill's range or default to 40
      explosionTriggered: false,
      explosionTriggerTime: 0
    };
    
    console.debug(`BulPalmState initialized with flyingSpeed: ${this.bulPalmState.flyingSpeed}, maxDistance: ${this.bulPalmState.maxDistance}`);
    console.debug(`Palm components created: handGroup: ${!!handGroup}, explosionGroup: ${!!explosionGroup}, particles: ${particles.length}, trails: ${trails.length}`);
    
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
   * Update the Bul Palm effect
   * @param {number} delta - Time since last update in seconds
   */
  update(delta) {
    if (!this.isActive || !this.effect) return;

    this.elapsedTime += delta;

    // Check if effect has expired
    if (this.elapsedTime >= this.skill.duration) {
      this.isActive = false;
      this.dispose(); // Properly dispose of the effect when it expires
      return;
    }

    // IMPORTANT: Update the skill's position property to match the effect's position
    // This is crucial for collision detection in CollisionManager
    this.skill.position.copy(this.effect.position);

    // Update the Bul Palm effect
    this.updateBulPalmEffect(delta);
    
    // Update explosion trail
    this.updateExplosionTrail(delta);
  }

  /**
   * Update the Bul Palm effect
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateBulPalmEffect(delta) {
    // Update palm state
    this.bulPalmState.age += delta;

    // Handle different phases
    switch (this.bulPalmState.phase) {
      case "flying":
        this.updateFlyingPhase(delta);
        break;
      case "exploding":
        this.updateExplodingPhase(delta);
        break;
    }
  }

  /**
   * Update the flying phase of the palm
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateFlyingPhase(delta) {
    // Update target position if we have a target entity that's still alive
    if (this.targetEntity && !this.targetEntity.isDead && typeof this.targetEntity.isDead === 'function' && !this.targetEntity.isDead()) {
      // Update target position to the current position of the enemy
      this.targetPosition = this.targetEntity.getPosition().clone();
      
      // Recalculate direction to the moving target
      const currentPalmPosition = this.bulPalmState.palmGroup.position.clone();
      this.currentDirection = new THREE.Vector3()
        .subVectors(this.targetPosition, currentPalmPosition)
        .normalize();
      
      // Update palm rotation to face the target
      if (this.currentDirection.length() > 0.001) {
        const rotationAngle = Math.atan2(this.currentDirection.x, this.currentDirection.z);
        this.bulPalmState.palmGroup.rotation.y = rotationAngle;
        
        // Debug the updated rotation
        console.debug(`Updated palm rotation to: ${(rotationAngle * 180 / Math.PI).toFixed(2)} degrees to track moving target`);
        
        // Also update the hand orientation to maintain correct alignment
        if (this.bulPalmState.handGroup) {
          this.bulPalmState.handGroup.rotation.x = -Math.PI / 2; // Point fingers forward
          this.bulPalmState.handGroup.rotation.y = 0; // No rotation on Y axis in local space
          this.bulPalmState.handGroup.rotation.z = 0; // No rotation on Z axis
        }
      }
      
      console.debug(`Updated target position to: ${this.targetPosition.x.toFixed(2)}, ${this.targetPosition.y.toFixed(2)}, ${this.targetPosition.z.toFixed(2)}`);
    }
    
    // Calculate distance to target
    const currentPalmPosition = this.bulPalmState.palmGroup.position.clone();
    const distanceToTarget = currentPalmPosition.distanceTo(this.targetPosition);
    
    // Move palm forward
    const moveDistance = Math.min(this.bulPalmState.flyingSpeed * delta, distanceToTarget);
    this.bulPalmState.distanceTraveled += moveDistance;

    // Move the palm group toward the target
    if (this.currentDirection) {
      this.bulPalmState.palmGroup.position.x +=
        this.currentDirection.x * moveDistance;
      this.bulPalmState.palmGroup.position.z +=
        this.currentDirection.z * moveDistance;
    }

    // Animate hand
    const handGroup = this.bulPalmState.handGroup;
    if (handGroup) {
      // Slight bobbing motion
      handGroup.position.y =
        1.8 + Math.sin(this.bulPalmState.age * 6) * 0.15;

      // Slight rotation
      handGroup.rotation.z = Math.sin(this.bulPalmState.age * 4) * 0.15;
    }

    // Animate particles
    for (const particle of this.bulPalmState.particles) {
      if (particle.userData) {
        // Orbit around hand
        const axis = particle.userData.orbitAxis;
        const angle =
          particle.userData.orbitAngle +
          this.bulPalmState.age * particle.userData.orbitSpeed;
        const radius = particle.userData.orbitRadius;

        // Create rotation matrix
        const rotationMatrix = new THREE.Matrix4().makeRotationAxis(
          axis,
          angle
        );
        const initialPos = particle.userData.initialPosition.clone();
        initialPos.applyMatrix4(rotationMatrix);

        particle.position.copy(initialPos);
      }
    }

    // Animate trails
    for (let i = 0; i < this.bulPalmState.trails.length; i++) {
      const trail = this.bulPalmState.trails[i];
      // Fade out trails based on distance
      trail.material.opacity =
        (0.8 - i * 0.08) *
        (1 -
          this.bulPalmState.distanceTraveled /
            this.bulPalmState.maxDistance);
    }

    // Create periodic explosions along the path
    this.lastExplosionTime += delta;
    if (this.lastExplosionTime >= this.explosionInterval) {
      // Create explosion at current position
      const explosionPosition = new THREE.Vector3().copy(this.bulPalmState.palmGroup.position);
      explosionPosition.y += 1.0; // Raise explosion slightly above ground
      this.createPathExplosion(explosionPosition);
      
      // Reset timer
      this.lastExplosionTime = 0;
    }

    // Check if palm has reached the target or maximum distance
    if (
      distanceToTarget < 1.0 || // Close enough to target
      this.bulPalmState.distanceTraveled >= this.bulPalmState.maxDistance
    ) {
      // Transition to exploding phase
      this.bulPalmState.phase = "exploding";
      
      // Make sure explosion group exists before making it visible
      if (this.bulPalmState.explosionGroup) {
        this.bulPalmState.explosionGroup.visible = true;
      }
      
      // Hide hand group
      if (this.bulPalmState.handGroup) {
        this.bulPalmState.handGroup.visible = false;
      }
      
      console.debug(`Palm reached ${distanceToTarget < 1.0 ? 'target' : 'maximum distance'}, transitioning to exploding phase`);
    }
  }

  /**
   * Update the exploding phase of the palm
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateExplodingPhase(delta) {
    const explosionGroup = this.bulPalmState.explosionGroup;
    const explosionAge =
      this.bulPalmState.age -
      (this.bulPalmState.explosionTriggered
        ? this.bulPalmState.explosionTriggerTime
        : this.bulPalmState.age);

    // Mark explosion as triggered
    if (!this.bulPalmState.explosionTriggered) {
      this.bulPalmState.explosionTriggered = true;
      this.bulPalmState.explosionTriggerTime =
        this.bulPalmState.age;
    }

    // Update giant palm
    const giantPalm = explosionGroup.children[0];
    if (giantPalm && giantPalm.userData) {
      // Scale up to target size
      const scaleProgress = Math.min(explosionAge * 2, 1); // Complete in 0.5 seconds
      const currentScale =
        giantPalm.userData.initialScale +
        (giantPalm.userData.targetScale - giantPalm.userData.initialScale) *
          scaleProgress;

      giantPalm.scale.set(currentScale, currentScale, currentScale);

      // Rotate
      giantPalm.rotation.z += giantPalm.userData.rotationSpeed * delta;

      // Fade out after reaching full size
      if (scaleProgress >= 1) {
        giantPalm.material.opacity = Math.max(
          0,
          giantPalm.material.opacity - delta
        );
      }
    }

    // Update explosion core
    const core = explosionGroup.children[1];
    if (core) {
      // Pulse size
      const pulseScale = 1.0 + 0.5 * Math.sin(explosionAge * 10);
      core.scale.set(pulseScale, pulseScale, pulseScale);

      // Fade out
      core.material.opacity = Math.max(0, 1 - explosionAge * 0.5);
    }

    // Update explosion waves
    for (let i = 2; i < 6; i++) { // Waves are at indices 2, 3, 4, 5
      if (i < explosionGroup.children.length) {
        const wave = explosionGroup.children[i];
        if (wave && wave.userData) {
          // Expand wave
          const expansionScale =
            wave.userData.initialScale +
            wave.userData.expansionSpeed * explosionAge;
          wave.scale.set(expansionScale, expansionScale, expansionScale);

          // Fade out
          wave.material.opacity = Math.max(
            0,
            wave.material.opacity - delta * 0.5
          );
        }
      }
    }

    // Update explosion particles
    for (let i = 6; i < explosionGroup.children.length; i++) {
      const particle = explosionGroup.children[i];
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
   * Overrides the base class dispose method with more thorough cleanup
   */
  dispose() {
    if (!this.effect) return;
    
    // Clean up Bul Palm specific resources
    if (this.bulPalmState) {
      // Clear particle references
      if (this.bulPalmState.particles) {
        this.bulPalmState.particles.length = 0;
      }
      
      // Clear trail references
      if (this.bulPalmState.trails) {
        this.bulPalmState.trails.length = 0;
      }
      
      // Clear references
      this.bulPalmState.palmGroup = null;
      this.bulPalmState.handGroup = null;
      this.bulPalmState.explosionGroup = null;
      
      // Clear state
      this.bulPalmState = null;
    }
    
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
    
    // Clear references
    this.effect = null;
    this.isActive = false;
    this.currentDirection = null;
  }
  
  /**
   * Override the reset method to properly clean up all resources
   */
  reset() {
    // Call the dispose method to clean up resources
    this.dispose();
    
    // Reset state variables
    this.isActive = false;
    this.elapsedTime = 0;
    this.targetEntity = null;
    this.lastExplosionTime = 0;
    
    // Clear explosion trail
    this.explosionTrail.length = 0;
  }
}