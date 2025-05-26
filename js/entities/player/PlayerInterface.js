/**
 * PlayerInterface.js
 * Defines the interface for the Player class and its components
 */

import * as THREE from 'three';

/**
 * Interface for the Player class
 * This serves as documentation for the expected methods and properties
 * that any Player implementation should provide
 */
export class IPlayer {
    // Core methods
    async init() {}
    update(delta) {}
    
    // Movement methods
    moveTo(target) {}
    setPosition(x, y, z) {}
    getPosition() {}
    getRotation() {}
    
    // Combat methods
    attack(target) {}
    takeDamage(damage) {}
    die() {}
    revive() {}
    useSkill(skillIndex) {}
    usePrimaryAttack() {}
    
    // Stats and progression
    addExperience(amount) {}
    levelUp() {}
    
    // Inventory and equipment
    addToInventory(item) {}
    removeFromInventory(itemName, amount) {}
    equipItem(item) {}
    unequipItem(type) {}
    addGold(amount) {}
    removeGold(amount) {}
    
    // State management
    setInWater(inWater) {}
    setInteracting(isInteracting) {}
    interact() {}
    isInteracting() {}
    
    // Game reference
    setGame(game) {}
}

/**
 * Interface for the PlayerStats component
 */
export class IPlayerStats {
    constructor(initialStats) {}
    
    // Getters
    getHealth() {}
    getMaxHealth() {}
    getMana() {}
    getMaxMana() {}
    getLevel() {}
    getExperience() {}
    getExperienceToNextLevel() {}
    getAttackPower() {}
    getMovementSpeed() {}
    
    // Setters
    setHealth(value) {}
    heal(amount) {}
    setMana(value) {}
    addExperience(amount) {}
    levelUp() {}
    
    // Utility
    regenerateResources(delta) {}
    
    // Temporary boosts
    addTemporaryBoost(statName, amount, duration) {}
    updateTemporaryBoosts(delta) {}
    applyBoosts(statName) {}
}

/**
 * Interface for the PlayerModel component
 */
export class IPlayerModel {
    constructor(scene) {}
    
    // Core methods
    async createModel() {}
    async setModel() {}
    updateAnimations(delta) {}
    
    // Position and rotation
    setPosition(position) {}
    setRotation(rotation) {}
}

/**
 * Interface for the PlayerSkills component
 */
export class IPlayerSkills {
    constructor(scene) {}
    
    // Core methods
    initializeSkills() {}
    updateSkills(delta) {}
    
    // Skill usage
    useSkill(skillIndex) {}
    usePrimaryAttack() {}
    
    // Getters
    getSkills() {}
    getActiveSkills() {}
}

/**
 * Interface for the PlayerInventory component
 */
export class IPlayerInventory {
    constructor() {}
    
    // Inventory management
    addToInventory(item) {}
    removeFromInventory(itemName, amount) {}
    
    // Equipment management
    equipItem(item) {}
    unequipItem(type) {}
    
    // Gold management
    addGold(amount) {}
    removeGold(amount) {}
    
    // Getters
    getInventory() {}
    getEquipment() {}
    getGold() {}
}

/**
 * Interface for the PlayerCombat component
 */
export class IPlayerCombat {
    constructor(scene) {}
    
    // Combat methods
    attack(target) {}
    takeDamage(damage) {}
    die() {}
    revive() {}
    
    // Combo system
    updateComboPunch(delta) {}
    performComboPunch(enemy) {}
    applyKnockback(enemy, direction) {}
    calculateComboPunchDamage(comboStep) {}
    calculateDamage() {}
    
    // Combat effects
    checkAttackHit(direction) {}
}

/**
 * Interface for the PlayerMovement component
 */
export class IPlayerMovement {
    constructor() {}
    
    // Movement methods
    updateMovement(delta) {}
    handleKeyboardMovement(delta) {}
    updateTerrainHeight() {}
    updateCamera() {}
    
    // Position methods
    moveTo(target) {}
    setPosition(x, y, z) {}
    getPosition() {}
    getRotation() {}
    getCollisionRadius() {}
    getHeightOffset() {}
}

/**
 * Interface for the PlayerState component
 */
export class IPlayerState {
    constructor() {}
    
    // State methods
    isMoving() {}
    isAttacking() {}
    isUsingSkill() {}
    isDead() {}
    isInWater() {}
    isInteracting() {}
    
    // State setters
    setMoving(isMoving) {}
    setAttacking(isAttacking) {}
    setUsingSkill(isUsingSkill) {}
    setDead(isDead) {}
    setInWater(inWater) {}
    setInteracting(isInteracting) {}
}