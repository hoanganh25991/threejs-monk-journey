import * as THREE from "three";
import { SkillEffect } from "./SkillEffect.js";

/**
 * Specialized effect for mark/debuff skills
 */
export class MarkSkillEffect extends SkillEffect {
  constructor(skill) {
    super(skill);
    this.markSize = 1.0;
    this.markHeight = 2.0;
    this.targetEntity = null;
    this.explodingPalmState = null;
  }

  /**
   * Create a mark effect
   * @param {THREE.Vector3} position - Position to place the mark
   * @param {THREE.Vector3} direction - Direction (not used for marks)
   * @returns {THREE.Group} - The created effect
   */
  create(position, direction) {
    // Create a group for the effect
    const effectGroup = new THREE.Group();

    // Special handling for Exploding Palm
    this.createMarkEffect(effectGroup, position, direction);

    // Position effect at the hero's position
    effectGroup.position.copy(position);

    // Set the correct rotation to face the opposite direction the player is looking
    if (direction) {
      const rotationAngle = Math.atan2(direction.x, direction.z) + Math.PI; // Add PI (180 degrees)
      effectGroup.rotation.y = rotationAngle;

      // For Exploding Palm, ensure the palm group is also properly rotated
      if (
        this.skill.name === "Exploding Palm" &&
        this.explodingPalmState &&
        this.explodingPalmState.palmGroup
      ) {
        // Set the palm group's initial rotation to face opposite to the player's direction
        this.explodingPalmState.palmGroup.rotation.y = rotationAngle; // Already includes the 180-degree rotation

        // Ensure the hand is oriented correctly within the palm group
        if (this.explodingPalmState.handGroup) {
          // Fine-tune hand orientation if needed
          this.explodingPalmState.handGroup.rotation.y = 0; // Keep aligned with palm group
        }
        
        // Position the palm behind the hero (opposite to the direction they're facing)
        if (direction) {
          // Calculate the position behind the hero (negative multiplier for backward direction)
          const backwardPosition = direction.clone().normalize().multiplyScalar(-1.2);
          // Move the palm group to this position
          this.explodingPalmState.palmGroup.position.add(backwardPosition);
          
          console.log(`Positioned palm behind the hero at: ${this.explodingPalmState.palmGroup.position.x.toFixed(2)}, ${this.explodingPalmState.palmGroup.position.y.toFixed(2)}, ${this.explodingPalmState.palmGroup.position.z.toFixed(2)}`);
        }
      }
    }

    // Store effect
    this.effect = effectGroup;
    this.isActive = true;

    return effectGroup;
  }

  /**
   * Create the Exploding Palm effect
   * @param {THREE.Group} effectGroup - Group to add the effect to
   * @param {THREE.Vector3} position - Position to place the mark
   * @param {THREE.Vector3} direction - Direction to face
   * @private
   */
  createMarkEffect(effectGroup, position, direction) {
    // Special handling for Exploding Palm
    // Create a flying palm effect that moves forward from the player
    
    // Store the direction for use in the update method
    if (direction) {
      this.currentDirection = direction.clone();
    } else {
      this.currentDirection = new THREE.Vector3(0, 0, 1);
    }

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
      { x: -0.45, z: 0.6 }, // Thumb - adjusted positions
      { x: -0.225, z: 0.75 }, // Index
      { x: 0, z: 0.825 }, // Middle
      { x: 0.225, z: 0.75 }, // Ring
      { x: 0.45, z: 0.6 }, // Pinky
    ];

    const fingerLengths = [0.45, 0.6, 0.75, 0.6, 0.45]; // Longer fingers for visibility

    for (let i = 0; i < fingerCount; i++) {
      // Create finger - INCREASED SIZE for visibility
      const fingerGeometry = new THREE.BoxGeometry(
        0.18,
        0.225,
        fingerLengths[i]
      );
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
        fingerPositions[i].z + fingerLengths[i] / 2
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
      knuckle.position.set(fingerPositions[i].x, 0.075, fingerPositions[i].z);

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
      wireframe: true,
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
        opacity: 0.8 + Math.random() * 0.2, // Higher opacity
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
        initialPosition: new THREE.Vector3(x, y, z),
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
        opacity: 0.7 - i * 0.1, // Higher base opacity
        side: THREE.DoubleSide,
      });

      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.position.z = -0.7 - i * 0.4; // More spacing
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
      const angle = (i / giantFingerCount) * Math.PI * 1.2 - Math.PI * 0.1;
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
      side: THREE.DoubleSide,
    });

    const giantPalm = new THREE.Mesh(giantPalmGeometry, giantPalmMaterial);
    giantPalm.rotation.x = -Math.PI / 2;
    giantPalm.position.y = 0.5; // Position above ground
    giantPalm.scale.set(4, 4, 4); // Make it even larger

    // Store animation data
    giantPalm.userData = {
      initialScale: 0.2, // Start slightly larger
      targetScale: 4, // Grow to larger size
      rotationSpeed: 1.5, // Rotate faster
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
      opacity: 0.9,
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
        opacity: 0.7 - i * 0.1,
        wireframe: true,
      });

      const wave = new THREE.Mesh(waveGeometry, waveMaterial);

      // Store animation data
      wave.userData = {
        expansionSpeed: 3 - i * 0.5,
        initialScale: 1 + i * 0.5,
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
      const particleGeometry = new THREE.SphereGeometry(
        0.03 + Math.random() * 0.05,
        8,
        8
      );
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8,
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(x, y, z);

      // Store particle data
      particle.userData = {
        velocity: new THREE.Vector3(x, y, z)
          .normalize()
          .multiplyScalar(1 + Math.random() * 2),
        drag: 0.92 + Math.random() * 0.05,
      };

      explosionGroup.add(particle);
    }

    palmGroup.add(explosionGroup);

    // Add palm group to effect group
    effectGroup.add(palmGroup);

    // Store animation state
    this.explodingPalmState = {
      age: 0,
      phase: "flying", // 'flying', 'exploding', 'fading'
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
      targetPosition: null, // Position where the palm hit a target
    };

    // Position effect - IMPORTANT: Set the correct orientation
    if (position) {
      effectGroup.position.copy(position);
    }

    // Set the correct rotation to face the direction the player is looking
    let rotationAngle = 0;
    if (direction) {
      rotationAngle = Math.atan2(direction.x, direction.z);
      effectGroup.rotation.y = rotationAngle;
      
      // Set initial distance traveled to 0 to ensure proper flying
      if (this.explodingPalmState) {
        this.explodingPalmState.distanceTraveled = 0;
      }
    }

    // For Exploding Palm, ensure the palm group is also properly rotated
    if (
      this.skill && this.skill.name === "Exploding Palm" &&
      this.explodingPalmState &&
      this.explodingPalmState.palmGroup
    ) {
      // Set the palm group's initial rotation to match the player's direction
      this.explodingPalmState.palmGroup.rotation.y = rotationAngle;

      // Ensure the hand is oriented correctly within the palm group
      if (this.explodingPalmState.handGroup) {
        // Fine-tune hand orientation if needed
        this.explodingPalmState.handGroup.rotation.y = 0; // Keep aligned with palm group
      }

      // Debug log to confirm direction
      if (direction) {
        console.log(
          `Exploding Palm initial direction: ${direction.x.toFixed(
            2
          )}, ${direction.z.toFixed(2)}`
        );
      }
      console.log(
        `Exploding Palm rotation angle: ${rotationAngle.toFixed(2)} radians`
      );
    }

    // Debug message to confirm the skill is being created
    console.log(
      `Created Exploding Palm effect at position:`,
      position,
      `with direction:`,
      direction,
      `and rotation:`,
      effectGroup.rotation
    );

    // Store effect
    this.effect = effectGroup;
    this.isActive = true;

    return effectGroup;
  }

  /**
   * Update the mark effect
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

    // Special handling for Exploding Palm
    this.updateMarkEffect(delta);
  }

  /**
   * Update the Exploding Palm effect
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateMarkEffect(delta) {
    // Special handling for Exploding Palm
    if ((this.skill && this.skill.name === "Exploding Palm") && this.explodingPalmState) {
      // Update state
      this.explodingPalmState.age += delta;

      // Get the palm group
      const palmGroup = this.explodingPalmState.palmGroup;
      const handGroup = this.explodingPalmState.handGroup;

      // Check for explosion triggers
      const shouldExplode =
        // Explode if reached max distance
        this.explodingPalmState.distanceTraveled >=
          this.explodingPalmState.maxDistance ||
        // Explode if hit a target
        this.explodingPalmState.hitTarget ||
        // Explode if reached explosion time
        this.elapsedTime >= this.explodingPalmState.explosionTime;

      // Log progress for debugging
      if (
        Math.floor(this.elapsedTime) % 2 === 0 &&
        Math.floor(this.elapsedTime) !== this.lastLoggedTime
      ) {
        this.lastLoggedTime = Math.floor(this.elapsedTime);
        console.log(
          `Exploding Palm progress: ${Math.round(
            (this.elapsedTime / this.duration) * 100
          )}% complete`
        );
        console.log(
          `Distance traveled: ${Math.round(
            this.explodingPalmState.distanceTraveled
          )} / ${Math.round(this.explodingPalmState.maxDistance)}`
        );
      }

      // Transition to exploding phase if needed
      if (this.explodingPalmState.phase === "flying" && shouldExplode) {
        console.log(
          `Exploding Palm is exploding! Reason: ${
            this.explodingPalmState.distanceTraveled >=
            this.explodingPalmState.maxDistance
              ? "Max distance reached"
              : this.explodingPalmState.hitTarget
              ? "Hit target"
              : "Duration reached"
          }`
        );
        this.explodingPalmState.phase = "exploding";
        this.explodingPalmState.exploded = true;
        this.explodingPalmState.explosionGroup.visible = true;

        // Hide the flying hand
        if (handGroup) {
          handGroup.visible = false;
        }
      }

      // Handle flying phase
      if (this.explodingPalmState.phase === "flying") {
        // SIMPLIFIED DIRECTION SYSTEM - ONLY USE CHARACTER DIRECTION
        // Always use the initial direction set by the character
        let targetDirection = this.currentDirection.clone();
        
        // Log the direction being used
        if (this.explodingPalmState.age < delta * 2) {
          console.log("Using character direction for Exploding Palm");
        }
        
        // Keep the palm rotated in the initial direction
        const rotationAngle = Math.atan2(targetDirection.x, targetDirection.z) + Math.PI; // Add PI (180 degrees)
        palmGroup.rotation.y = rotationAngle;

        // Move the palm backward (opposite to the target direction)
        const moveDistance = this.explodingPalmState.flyingSpeed * delta;
        this.explodingPalmState.distanceTraveled += moveDistance;

        // Update palm position using the reversed target direction
        palmGroup.position.add(
          targetDirection.clone().multiplyScalar(-moveDistance)
        );

        // Animate hand to show power
        if (handGroup) {
          // FIX: Keep the hand oriented correctly with fingers pointing forward
          // No need to adjust rotation.x as we fixed it in createMarkEffect

          // Add very subtle slow pulse to show power
          const pulseFactor =
            1 + Math.sin(this.explodingPalmState.age * 2) * 0.03;
          handGroup.scale.set(pulseFactor, pulseFactor, pulseFactor);

          // Create ground effect to show heaviness - dust/debris kicked up by the palm's power
          if (Math.random() < 0.2) {
            // 20% chance each frame to create effect
            // Create dust particle
            const dustGeometry = new THREE.SphereGeometry(
              0.1 + Math.random() * 0.2,
              8,
              8
            );
            const dustMaterial = new THREE.MeshBasicMaterial({
              color: 0x885533,
              transparent: true,
              opacity: 0.3 + Math.random() * 0.3,
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
              maxAge: 0.5 + Math.random() * 0.5,
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
            for (
              let i = this.explodingPalmState.dustParticles.length - 1;
              i >= 0;
              i--
            ) {
              const dust = this.explodingPalmState.dustParticles[i];
              if (dust && dust.userData) {
                // Update age
                dust.userData.age += delta;

                // Move dust
                dust.position.add(
                  dust.userData.velocity.clone().multiplyScalar(delta)
                );

                // Apply gravity
                dust.userData.velocity.y -= 2 * delta;

                // Fade out
                if (dust.material) {
                  dust.material.opacity = Math.max(
                    0,
                    0.6 * (1 - dust.userData.age / dust.userData.maxAge)
                  );
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
          const trailFade = 1 - i / this.explodingPalmState.trails.length;
          trail.material.opacity = 0.5 * trailFade;

          // Scale trails for a motion blur effect
          const trailScale = 0.8 + i * 0.1;
          trail.scale.set(trailScale, trailScale, 1);
        }

        // Create ground impact effect to show heaviness
        if (
          !this.explodingPalmState.lastImpactTime ||
          this.explodingPalmState.age - this.explodingPalmState.lastImpactTime >
            0.5
        ) {
          // Every 0.5 seconds

          this.explodingPalmState.lastImpactTime = this.explodingPalmState.age;

          // Create impact ring on the ground
          const ringGeometry = new THREE.RingGeometry(0.2, 0.8, 16);
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
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
            targetScale: 3.0,
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
          for (
            let i = this.explodingPalmState.impactRings.length - 1;
            i >= 0;
            i--
          ) {
            const ring = this.explodingPalmState.impactRings[i];
            if (ring && ring.userData) {
              // Update age
              ring.userData.age += delta;

              // Expand ring
              const progress = ring.userData.age / ring.userData.maxAge;
              const scale =
                ring.userData.initialScale +
                (ring.userData.targetScale - ring.userData.initialScale) *
                  progress;

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
                
                // Store the position where the collision happened
                this.explodingPalmState.targetPosition = palmPosition.clone();
                
                // Apply mark to enemy
                if (enemy.applyMark) {
                  enemy.applyMark("explodingPalm", this.damage);
                }
                
                // Note: We don't break here, allowing the palm to hit multiple enemies
                // in the same frame if they're close enough
              }
            }
          }
        }
      }
      // Handle exploding phase
      else if (this.explodingPalmState.phase === "exploding") {
        // Get explosion group
        const explosionGroup = this.explodingPalmState.explosionGroup;

        // Calculate explosion progress (0 to 1)
        const explosionDuration = this.duration * 0.2; // Last 20% of total duration
        const explosionProgress =
          (this.elapsedTime - (this.duration - explosionDuration)) /
          explosionDuration;

        // Find the giant palm
        const giantPalm = explosionGroup.children.find(
          (child) => child.geometry && child.geometry.type === "ShapeGeometry"
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
            scaleProgress = 1 - (explosionProgress - 0.7) / 0.3;
          }

          // Apply scale with easing
          const currentScale =
            initialScale + (targetScale - initialScale) * scaleProgress;

          // Add pulsing effect
          const pulseFactor =
            1 + Math.sin(explosionProgress * Math.PI * 5) * 0.1;
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
            heightOffset = 1 - (explosionProgress - 0.5) * 2;
          }

          giantPalm.position.y = 0.5 + heightOffset * 2;

          // Adjust opacity
          if (explosionProgress < 0.2) {
            // Fade in
            giantPalm.material.opacity = (explosionProgress / 0.2) * 0.9;
          } else if (explosionProgress > 0.7) {
            // Fade out
            giantPalm.material.opacity = Math.max(
              0,
              0.9 - ((explosionProgress - 0.7) / 0.3) * 0.9
            );
          } else {
            // Full opacity during main explosion
            giantPalm.material.opacity = 0.9;
          }

          // Increase emissive intensity at peak
          const emissiveIntensity =
            2 + Math.sin(explosionProgress * Math.PI) * 3;
          giantPalm.material.emissiveIntensity = Math.max(0, emissiveIntensity);
        }

        // Find the core
        const core = explosionGroup.children.find(
          (child) =>
            child.geometry &&
            child.geometry.type === "SphereGeometry" &&
            !child.material.wireframe
        );

        if (core) {
          // Pulse the core
          const corePulse =
            1 + Math.sin(explosionProgress * Math.PI * 10) * 0.3;
          core.scale.set(corePulse, corePulse, corePulse);

          // Adjust core size based on explosion progress
          const coreSize = 1 + explosionProgress * 2;
          core.scale.multiplyScalar(coreSize);

          // Fade out core at the end
          if (explosionProgress > 0.7) {
            core.material.opacity = Math.max(
              0,
              0.9 - ((explosionProgress - 0.7) / 0.3) * 0.9
            );
          }
        }

        // Find explosion waves
        const waves = explosionGroup.children.filter(
          (child) =>
            child.geometry &&
            child.geometry.type === "SphereGeometry" &&
            child.material.wireframe
        );

        for (const wave of waves) {
          if (wave.userData) {
            // Expand the wave
            const waveSize =
              wave.userData.initialScale +
              explosionProgress *
                wave.userData.expansionSpeed *
                this.radius *
                2;
            wave.scale.set(waveSize, waveSize, waveSize);

            // Fade out wave as it expands
            wave.material.opacity = Math.max(
              0,
              wave.material.opacity - delta * 0.5
            );
          }
        }

        // Animate explosion particles
        const particles = explosionGroup.children.filter(
          (child) =>
            child.geometry &&
            child.geometry.type === "SphereGeometry" &&
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
              particle.material.opacity = Math.max(
                0,
                particle.material.opacity - delta * 0.2
              );
            }
          }
        }

        // Apply damage to nearby enemies during explosion
        if (
          this.game &&
          this.game.enemies &&
          explosionProgress > 0.2 &&
          explosionProgress < 0.4
        ) {
          // Only apply damage once during the explosion
          if (!this.explodingPalmState.damageApplied) {
            this.explodingPalmState.damageApplied = true;

            // Get explosion position
            const explosionPosition = new THREE.Vector3(
              palmGroup.position.x,
              palmGroup.position.y,
              palmGroup.position.z
            );
            
            console.log(`Exploding Palm explosion at position: ${explosionPosition.x.toFixed(2)}, ${explosionPosition.y.toFixed(2)}, ${explosionPosition.z.toFixed(2)}`);

            // Check each enemy for being in explosion radius
            let enemiesHit = 0;
            for (const enemy of this.game.enemies) {
              if (enemy && enemy.position && !enemy.state.isDead) {
                const distance = explosionPosition.distanceTo(enemy.position);

                // If enemy is within explosion radius, damage it
                if (distance < this.radius) {
                  // Calculate damage based on distance (more damage closer to center)
                  const damageMultiplier = 1 - distance / this.radius;
                  const finalDamage = this.damage * (1 + damageMultiplier);

                  // Apply damage to enemy
                  if (enemy.takeDamage) {
                    enemy.takeDamage(finalDamage);
                    enemiesHit++;
                  }
                }
              }
            }
            
            console.log(`Exploding Palm hit ${enemiesHit} enemies with explosion damage`);
          }
        }

        // Transition to fading phase at the end of explosion
        if (explosionProgress >= 1) {
          this.explodingPalmState.phase = "fading";
        }
      }
      // Handle fading phase
      else if (this.explodingPalmState.phase === "fading") {
        // Fade out all remaining elements
        palmGroup.traverse((child) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                mat.opacity = Math.max(0, mat.opacity - delta * 0.5);
              });
            } else {
              child.material.opacity = Math.max(
                0,
                child.material.opacity - delta * 0.5
              );
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

  /**
   * Clean up resources when the effect is removed
   */
  dispose() {
    // Clean up Exploding Palm state
    if (this.explodingPalmState) {
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

      // Clean up palm group
      if (this.explodingPalmState.palmGroup) {
        this.explodingPalmState.palmGroup.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      // Null out the entire state
      this.explodingPalmState = null;
    }

    // Clean up mark state
    if (this.markState) {
      // Clean up mark elements
      if (this.markState.mark && this.markState.mark.parent) {
        if (this.markState.mark.geometry)
          this.markState.mark.geometry.dispose();
        if (this.markState.mark.material)
          this.markState.mark.material.dispose();
      }

      // Clean up rings
      if (this.markState.outerRing && this.markState.outerRing.parent) {
        if (this.markState.outerRing.geometry)
          this.markState.outerRing.geometry.dispose();
        if (this.markState.outerRing.material)
          this.markState.outerRing.material.dispose();
      }

      if (this.markState.innerRing && this.markState.innerRing.parent) {
        if (this.markState.innerRing.geometry)
          this.markState.innerRing.geometry.dispose();
        if (this.markState.innerRing.material)
          this.markState.innerRing.material.dispose();
      }

      // Null out the entire state
      this.markState = null;
    }

    // Call parent dispose
    super.dispose();
  }
}
