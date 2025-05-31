import * as THREE from "three";
import { BulPalmEffect } from "../../BulPalmEffect.js";

/**
 * Specialized effect for Bul Palm Cross skill variant
 * Creates 4 giant palms in a cross/plus pattern that fall from the sky simultaneously,
 * causing a massive explosion when they hit the ground
 */
export class BulPalmCrossEffect extends BulPalmEffect {
  constructor(skill) {
    super(skill);
    
    // Get configuration from skill if available, otherwise use defaults
    const config = skill.palmCrossConfig || {};
    
    // Palm cross effect settings
    this.palmCount = 4; // Fixed number of palms in a cross pattern
    this.palmsCreated = 0; // Counter for created palms
    this.palmGroups = []; // Store all palm groups
    
    // Area settings
    this.areaRadius = skill.radius || 3; // Use configured radius
    this.palmRadius = this.areaRadius * 4; // Each palm is 4x normal size
    
    // Height settings
    this.startHeight = 30; // Height from which palms start falling
    this.fallSpeed = config.fallSpeed || 25; // Speed at which palms fall (default: 25)
    
    // Explosion settings
    this.hasExploded = false;
    this.explosionTriggered = false;
    this.explosionGroup = null;
    
    // Default color (fallback if skill color is not defined)
    this.defaultColor = 0x33ff33; // Green color for Bul Palm
    
    // Log configuration for debugging
    console.log('BulPalmCrossEffect initialized with:', {
      palmCount: this.palmCount,
      areaRadius: this.areaRadius,
      palmRadius: this.palmRadius,
      fallSpeed: this.fallSpeed,
      duration: skill.duration
    });
  }
  
  /**
   * Create a Bul Palm Cross effect
   * @param {THREE.Vector3} position - Position to place the effect
   * @param {THREE.Vector3} direction - Direction (used for area orientation)
   * @returns {THREE.Group} - The created effect
   */
  create(position, direction) {
    try {
      // Clone position to avoid modifying the original
      position = position.clone();
      
      // Create a group for the effect
      const effectGroup = new THREE.Group();
      
      // Store the direction for area orientation
      this.direction = direction ? direction.clone().normalize() : new THREE.Vector3(0, 0, 1);
      
      // Store the center position
      this.centerPosition = position.clone();
      
      // Create area indicator
      this.createAreaIndicator(effectGroup, position);
      
      // Create the explosion group (initially hidden)
      this.createMainExplosionGroup(effectGroup);
      
      // Position effect at the starting position
      effectGroup.position.copy(position);
      
      // Create all 4 palms in a cross pattern
      this.createCrossPalms();
      
      // Store effect
      this.effect = effectGroup;
      this.isActive = true;
      
      return effectGroup;
    } catch (error) {
      console.error("Error creating BulPalmCross effect:", error);
      return new THREE.Group();
    }
  }
  
  /**
   * Create an area indicator to show where palms will fall
   * @param {THREE.Group} effectGroup - Group to add the indicator to
   * @param {THREE.Vector3} position - Position to place the indicator
   * @private
   */
  createAreaIndicator(effectGroup, position) {
    // Create a circular area indicator
    const areaGeometry = new THREE.RingGeometry(this.areaRadius * 3.8, this.areaRadius * 4, 48);
    const areaMaterial = this.createMaterial(
      this.getSkillColor(),
      1.5,
      true,
      0.6,
      false,
      true
    );
    
    const areaIndicator = new THREE.Mesh(areaGeometry, areaMaterial);
    areaIndicator.rotation.x = -Math.PI / 2; // Lay flat on the ground
    areaIndicator.position.y = 0.1; // Slightly above ground
    
    // Add pulsing animation data
    areaIndicator.userData = {
      pulseSpeed: 2,
      initialOpacity: 0.6
    };
    
    // Create cross pattern indicator
    const crossMaterial = this.createMaterial(
      this.getBrighterColor(),
      2.0,
      true,
      0.7,
      false,
      true
    );
    
    // Horizontal line of the cross
    const horizontalGeometry = new THREE.PlaneGeometry(this.areaRadius * 8, this.areaRadius * 0.5);
    const horizontalLine = new THREE.Mesh(horizontalGeometry, crossMaterial);
    horizontalLine.rotation.x = -Math.PI / 2; // Lay flat on the ground
    horizontalLine.position.y = 0.15; // Slightly above the ring
    
    // Vertical line of the cross
    const verticalGeometry = new THREE.PlaneGeometry(this.areaRadius * 0.5, this.areaRadius * 8);
    const verticalLine = new THREE.Mesh(verticalGeometry, crossMaterial);
    verticalLine.rotation.x = -Math.PI / 2; // Lay flat on the ground
    verticalLine.position.y = 0.15; // Slightly above the ring
    
    // Add cross lines to the effect group
    effectGroup.add(horizontalLine);
    effectGroup.add(verticalLine);
    
    // Store references
    this.areaIndicator = areaIndicator;
    this.horizontalLine = horizontalLine;
    this.verticalLine = verticalLine;
    
    effectGroup.add(areaIndicator);
  }
  
  /**
   * Create the main explosion group that will be used when all palms hit
   * @param {THREE.Group} effectGroup - Group to add the explosion to
   * @private
   */
  createMainExplosionGroup(effectGroup) {
    const explosionGroup = new THREE.Group();
    explosionGroup.visible = false;
    
    // Store reference
    this.explosionGroup = explosionGroup;
    
    // Add to effect group
    effectGroup.add(explosionGroup);
  }
  
  /**
   * Create all 4 palms in a cross pattern
   * @private
   */
  createCrossPalms() {
    // Define the 4 directions for the cross pattern
    const directions = [
      new THREE.Vector3(1, 0, 0),   // Right
      new THREE.Vector3(-1, 0, 0),  // Left
      new THREE.Vector3(0, 0, 1),   // Forward
      new THREE.Vector3(0, 0, -1)   // Backward
    ];
    
    // Create a palm in each direction
    for (let i = 0; i < directions.length; i++) {
      this.createDirectionalPalm(directions[i], i);
    }
  }
  
  /**
   * Create a palm in a specific direction
   * @param {THREE.Vector3} direction - Direction vector
   * @param {number} index - Index of the palm (0-3)
   * @private
   */
  createDirectionalPalm(direction, index) {
    // Calculate palm position
    // Position the palm at the edge of the area in the given direction
    const palmPosition = new THREE.Vector3(
      this.centerPosition.x + direction.x * this.areaRadius * 4,
      this.centerPosition.y + this.startHeight,
      this.centerPosition.z + direction.z * this.areaRadius * 4
    );
    
    // Create palm group
    const palmGroup = new THREE.Group();
    
    // Create the palm effect (reusing methods from parent class)
    const handGroup = new THREE.Group();
    
    // Calculate scale factor - 4x normal size
    const scaleFactor = 4.0;
    
    // Create palm base (hand) - scaled to 4x normal size
    const palmBaseGeometry = new THREE.BoxGeometry(
      1.5 * scaleFactor, 
      0.4 * scaleFactor, 
      1.8 * scaleFactor
    );
    const palmBaseMaterial = this.createMaterial(this.getSkillColor());
    
    const palmBase = new THREE.Mesh(palmBaseGeometry, palmBaseMaterial);
    palmBase.position.y = 0;
    handGroup.add(palmBase);
    
    // Store the scale factor for use in other methods
    handGroup.userData = { scaleFactor, direction, index };
    
    // Create scaled fingers
    this.createScaledFingers(handGroup, scaleFactor);
    
    // Add energy aura with larger radius
    this.createAura(handGroup);
    
    // Add particles - scaled based on palm size
    const particleCount = Math.floor(15 * Math.sqrt(scaleFactor));
    
    const particles = this.createParticleSystem(
      handGroup, 
      particleCount,
      { 
        min: 0.8 * scaleFactor, 
        max: 1.2 * scaleFactor 
      },
      { 
        min: 0.04 * scaleFactor, 
        max: 0.08 * scaleFactor 
      },
      false,
      true
    );
    
    // Set hand orientation to point toward the center
    // Calculate the angle to face the center
    const angle = Math.atan2(-direction.x, -direction.z);
    handGroup.rotation.y = angle;
    
    // Tilt the hand to point downward
    handGroup.rotation.x = Math.PI / 2; // Point fingers downward
    
    // Add hand to palm group
    palmGroup.add(handGroup);
    
    // Create individual explosion effect (initially hidden)
    const individualExplosionGroup = new THREE.Group();
    individualExplosionGroup.visible = false;
    palmGroup.add(individualExplosionGroup);
    
    // Position palm group
    palmGroup.position.copy(palmPosition);
    
    // Store palm data
    const palmData = {
      group: palmGroup,
      handGroup: handGroup,
      explosionGroup: individualExplosionGroup,
      particles: particles,
      startPosition: palmPosition.clone(),
      targetPosition: new THREE.Vector3(
        this.centerPosition.x + direction.x * this.areaRadius,
        this.centerPosition.y,
        this.centerPosition.z + direction.z * this.areaRadius
      ),
      direction: direction.clone(),
      age: 0,
      hasExploded: false,
      index: index
    };
    
    // Add to scene
    if (this.effect && this.effect.parent) {
      this.effect.parent.add(palmGroup);
    } else {
      this.effect.add(palmGroup);
    }
    
    // Add to palm groups
    this.palmGroups.push(palmData);
    
    // Increment counter
    this.palmsCreated++;
  }
  
  /**
   * Create an explosion when all palms hit the ground
   * @private
   */
  createCombinedExplosion() {
    // Make explosion group visible
    this.explosionGroup.visible = true;
    
    // Calculate a larger scale factor for the combined explosion
    const scaleFactor = 8.0; // Even bigger than individual palms
    
    // Create giant palm for explosion
    this.createGiantPalm(this.explosionGroup, scaleFactor);
    
    // Create explosion core
    const coreGeometry = new THREE.SphereGeometry(0.8 * scaleFactor, 24, 24);
    const coreMaterial = this.createMaterial(this.getBrighterColor(), 3.0);
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.explosionGroup.add(core);
    
    // Create explosion waves - more waves for bigger explosion
    this.createWaveSystem(
      this.explosionGroup, 
      6, // More waves
      0.8 * scaleFactor // Larger base size
    );
    
    // Create explosion particles - many more particles for impressive explosion
    const particleCount = 150; // Lots of particles
    
    this.createParticleSystem(
      this.explosionGroup, 
      particleCount,
      { 
        min: 0.8 * scaleFactor, 
        max: 1.2 * scaleFactor 
      },
      { 
        min: 0.15 * scaleFactor, 
        max: 0.25 * scaleFactor 
      },
      true // Use gravity
    );
    
    // Mark as exploded
    this.hasExploded = true;
    this.explosionAge = 0;
  }
  
  /**
   * Create a giant palm for the explosion with custom scale
   * @param {THREE.Group} explosionGroup - Group to add the giant palm to
   * @param {number} scaleFactor - Scale factor for the palm
   * @private
   */
  createGiantPalm(explosionGroup, scaleFactor) {
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
    const giantPalmMaterial = this.createMaterial(
      this.getSkillColor(), 
      3.5
    );
    
    const giantPalm = new THREE.Mesh(giantPalmGeometry, giantPalmMaterial);
    giantPalm.rotation.x = -Math.PI / 2;
    giantPalm.position.y = 0.6;
    
    // Store animation data with custom scale
    giantPalm.userData = {
      initialScale: 0.3 * scaleFactor,
      targetScale: 4.5 * scaleFactor,
      rotationSpeed: 1.8,
    };
    
    // Start with small scale
    giantPalm.scale.set(
      giantPalm.userData.initialScale,
      giantPalm.userData.initialScale,
      giantPalm.userData.initialScale
    );
    
    explosionGroup.add(giantPalm);
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
    
    // Update area indicator
    this.updateAreaIndicator(delta);
    
    // Update all palm groups
    this.updatePalmGroups(delta);
    
    // Update combined explosion if triggered
    if (this.hasExploded) {
      this.explosionAge += delta;
      this.updateCombinedExplosion(delta);
    }
  }
  
  /**
   * Update the area indicator animation
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateAreaIndicator(delta) {
    if (this.areaIndicator) {
      // Pulse opacity
      const pulseValue = (Math.sin(this.age * this.areaIndicator.userData.pulseSpeed) + 1) / 2;
      this.areaIndicator.material.opacity = this.areaIndicator.userData.initialOpacity * pulseValue;
      
      // Also pulse the cross lines
      if (this.horizontalLine) {
        this.horizontalLine.material.opacity = 0.7 * pulseValue;
      }
      if (this.verticalLine) {
        this.verticalLine.material.opacity = 0.7 * pulseValue;
      }
      
      // Fade out when explosion happens
      if (this.hasExploded) {
        const fadeOutFactor = Math.max(0, 1 - this.explosionAge);
        this.areaIndicator.material.opacity *= fadeOutFactor;
        
        if (this.horizontalLine) {
          this.horizontalLine.material.opacity *= fadeOutFactor;
        }
        if (this.verticalLine) {
          this.verticalLine.material.opacity *= fadeOutFactor;
        }
      }
    }
  }
  
  /**
   * Update all palm groups
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updatePalmGroups(delta) {
    let allPalmsLanded = true;
    
    for (const palmData of this.palmGroups) {
      palmData.age += delta;
      
      if (!this.hasExploded) {
        // Update falling palm
        this.updateFallingPalm(palmData, delta);
        
        // Check if this palm has reached the ground
        if (palmData.group.position.y > this.centerPosition.y) {
          allPalmsLanded = false;
        }
      } else {
        // Hide individual palms when combined explosion happens
        palmData.handGroup.visible = false;
      }
    }
    
    // If all palms have landed and we haven't triggered the explosion yet
    if (allPalmsLanded && !this.hasExploded && this.palmGroups.length === 4) {
      this.createCombinedExplosion();
    }
  }
  
  /**
   * Update a falling palm
   * @param {Object} palmData - Data for the palm to update
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateFallingPalm(palmData, delta) {
    // Move palm down
    const moveDistance = this.fallSpeed * delta;
    palmData.group.position.y -= moveDistance;
    
    // Check if palm has hit the ground
    if (palmData.group.position.y <= this.centerPosition.y) {
      // Snap to ground
      palmData.group.position.y = this.centerPosition.y;
    }
    
    // Update particles
    this.updateOrbitingParticles(palmData.particles, palmData.age);
  }
  
  /**
   * Update the combined explosion
   * @param {number} delta - Time since last update in seconds
   * @private
   */
  updateCombinedExplosion(delta) {
    // Update giant palm
    if (this.explosionGroup.children.length > 0) {
      const giantPalm = this.explosionGroup.children[0];
      if (giantPalm && giantPalm.userData) {
        // Scale up to target size
        const scaleProgress = Math.min(this.explosionAge * 1.5, 1); // Complete in ~0.67 seconds
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
    }
    
    // Update explosion core
    if (this.explosionGroup.children.length > 1) {
      const core = this.explosionGroup.children[1];
      if (core) {
        // Pulse size
        const pulseScale = 1.0 + 0.5 * Math.sin(this.explosionAge * 10);
        core.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Fade out
        core.material.opacity = Math.max(0, 1 - this.explosionAge * 0.5);
      }
    }
    
    // Update explosion waves
    for (let i = 2; i < 8; i++) { // Waves are at indices 2-7 (6 waves)
      if (i < this.explosionGroup.children.length) {
        const wave = this.explosionGroup.children[i];
        this.updateWave(wave, this.explosionAge, delta);
      }
    }
    
    // Update explosion particles
    for (let i = 8; i < this.explosionGroup.children.length; i++) {
      const particle = this.explosionGroup.children[i];
      this.updateParticle(particle, delta);
    }
  }
  
  /**
   * Enhanced dispose method to properly clean up all resources
   */
  dispose() {
    if (!this.effect) return;
    
    // Clean up all palm groups
    for (const palmData of this.palmGroups) {
      this.disposeObject(palmData.group);
    }
    
    // Clear palm groups
    this.palmGroups.length = 0;
    
    // Dispose of the main effect
    this.disposeObject(this.effect);
    
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
    this.palmsCreated = 0;
    this.hasExploded = false;
    
    // Clear palm groups
    this.palmGroups.length = 0;
  }
  
  /**
   * Create scaled fingers for the palm based on scale factor
   * @param {THREE.Group} handGroup - Group to add fingers to
   * @param {number} scaleFactor - Scale factor
   * @private
   */
  createScaledFingers(handGroup, scaleFactor) {
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
      // Create finger with scaled dimensions
      const fingerGeometry = new THREE.BoxGeometry(
        0.22 * scaleFactor,
        0.275 * scaleFactor,
        fingerLengths[i] * scaleFactor
      );
      const fingerMaterial = this.createMaterial(this.getSkillColor());
      
      const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
      
      // Position finger with scaled coordinates
      finger.position.set(
        fingerPositions[i].x * scaleFactor,
        0.1 * scaleFactor,
        (fingerPositions[i].z + fingerLengths[i] / 2) * scaleFactor
      );
      
      // Add finger joints (knuckles) with scaled dimensions
      const knuckleGeometry = new THREE.SphereGeometry(0.125 * scaleFactor, 8, 8);
      const knuckleMaterial = this.createMaterial(this.getLighterColor());
      
      const knuckle = new THREE.Mesh(knuckleGeometry, knuckleMaterial);
      knuckle.position.set(
        fingerPositions[i].x * scaleFactor, 
        0.1 * scaleFactor, 
        fingerPositions[i].z * scaleFactor
      );
      
      handGroup.add(finger);
      handGroup.add(knuckle);
      
      // Add scaled fingernails
      this.createScaledFingernail(
        handGroup, 
        { 
          x: fingerPositions[i].x * scaleFactor, 
          z: fingerPositions[i].z * scaleFactor 
        }, 
        fingerLengths[i] * scaleFactor,
        scaleFactor
      );
    }
  }
  
  /**
   * Create a scaled fingernail
   * @param {THREE.Group} handGroup - Group to add the nail to
   * @param {Object} position - Position data for the finger
   * @param {number} fingerLength - Length of the finger
   * @param {number} scaleFactor - Scale factor
   * @private
   */
  createScaledFingernail(handGroup, position, fingerLength, scaleFactor) {
    const nailGeometry = new THREE.BoxGeometry(
      0.18 * scaleFactor, 
      0.09 * scaleFactor, 
      0.18 * scaleFactor
    );
    
    // Create a very light variant for nails
    const baseColor = new THREE.Color(this.getSkillColor());
    const nailColor = new THREE.Color(
      Math.min(1, baseColor.r * 0.2 + 0.8),
      Math.min(1, baseColor.g * 0.2 + 0.8),
      Math.min(1, baseColor.b * 0.2 + 0.8)
    );
    const nailEmissive = new THREE.Color(
      Math.min(1, baseColor.r * 0.4 + 0.6),
      Math.min(1, baseColor.g * 0.4 + 0.6),
      Math.min(1, baseColor.b * 0.4 + 0.6)
    );
    
    const nailMaterial = new THREE.MeshStandardMaterial({
      color: nailColor,
      emissive: nailEmissive,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.9,
    });
    
    const nail = new THREE.Mesh(nailGeometry, nailMaterial);
    nail.position.set(
      position.x,
      0.18 * scaleFactor,
      position.z + fingerLength
    );
    
    handGroup.add(nail);
  }
}