/**
 * Player.js
 * Main player class that integrates all player components
 */

import { IPlayer } from './PlayerInterface.js';
import { PlayerStats } from './PlayerStats.js';
import { PlayerState } from './PlayerState.js';
import { PlayerInventory } from './PlayerInventory.js';
import { PlayerModel } from './PlayerModel.js';
import { PlayerMovement } from './PlayerMovement.js';
import { PlayerSkills } from './PlayerSkills.js';
import { PlayerCombat } from './PlayerCombat.js';

export class Player extends IPlayer {
    constructor(scene, camera, loadingManager) {
        super();
        
        this.scene = scene;
        this.camera = camera;
        this.loadingManager = loadingManager;
        
        // Initialize components
        this.state = new PlayerState();
        this.stats = new PlayerStats();
        this.inventory = new PlayerInventory();
        this.model = new PlayerModel(scene);
        
        // Components that need to be initialized after model is created
        this.movement = null;
        this.skills = null;
        this.combat = null;
        
        // Game reference
        this.game = null;
    }
    
    async init() {
        // Create player model
        await this.model.createModel();
        
        // Initialize components that depend on the model
        this.movement = new PlayerMovement(this.state, this.stats, this.model.getModelGroup(), this.camera);
        this.skills = new PlayerSkills(this.scene, this.stats, this.movement.getPosition(), this.movement.getRotation());
        this.combat = new PlayerCombat(this.scene, this.state, this.stats, this.model, this.inventory);
        
        // Initialize skills
        this.skills.initializeSkills();
        
        // If game reference was set before initialization, pass it to components now
        if (this.game) {
            this.movement.setGame(this.game);
            this.skills.setGame(this.game);
            this.combat.setGame(this.game);
        }
        
        console.log("Player initialized with model group:", this.model.getModelGroup());
        
        return true;
    }
    
    setGame(game) {
        this.game = game;
        
        // If components are already initialized, pass game reference to them
        if (this.movement && this.skills && this.combat) {
            this.movement.setGame(game);
            this.skills.setGame(game);
            this.combat.setGame(game);
        }
        // Otherwise, the game reference will be passed to components in init()
    }
    
    update(delta) {
        // Check if game is paused - if so, don't update player
        if (this.game && this.game.isPaused) {
            return; // Skip all player updates when game is paused
        }
        
        // Check for keyboard movement input
        if (this.game && this.game.inputHandler) {
            this.movement.handleKeyboardMovement(delta);
        }
        
        // Update movement
        this.movement.updateMovement(delta);
        
        // Ensure player is always at the correct terrain height
        this.movement.updateTerrainHeight();
        
        // Update camera
        this.movement.updateCamera();
        
        // Update skills
        this.skills.updateSkills(delta);
        
        // Update animations
        this.model.updateAnimations(delta, this.state);
        
        // Sync model position with movement position
        const currentPosition = this.movement.getPosition();
        this.model.setPosition(currentPosition);
        
        // Sync model rotation with movement rotation
        const currentRotation = this.movement.getRotation();
        this.model.setRotation(currentRotation);
        
        // Update combo punch system
        this.combat.updateComboPunch(delta);
        
        // Regenerate resources
        this.stats.regenerateResources(delta);
    }
    
    // Movement methods
    moveTo(target) {
        this.movement.moveTo(target);
    }
    
    setPosition(x, y, z) {
        this.movement.setPosition(x, y, z);
    }
    
    getPosition() {
        return this.movement.getPosition();
    }
    
    getRotation() {
        return this.movement.getRotation();
    }
    
    getCollisionRadius() {
        return this.movement.getCollisionRadius();
    }
    
    getHeightOffset() {
        return this.movement.getHeightOffset();
    }
    
    // Combat methods
    attack(target) {
        this.combat.attack(target);
    }
    
    takeDamage(damage) {
        return this.combat.takeDamage(damage);
    }
    
    die() {
        this.combat.die();
    }
    
    revive() {
        this.combat.revive();
    }
    
    useSkill(skillIndex) {
        return this.skills.useSkill(skillIndex);
    }
    
    useBasicAttack() {
        return this.skills.useBasicAttack();
    }
    
    // Stats and progression
    addExperience(amount) {
        const newLevel = this.stats.addExperience(amount);
        
        // Show level up notification if level changed
        if (newLevel > 0 && this.game && this.game.uiManager) {
            this.game.uiManager.showLevelUp(newLevel);
        }
    }
    
    levelUp() {
        return this.stats.levelUp();
    }
    
    // Stats getters - delegate to PlayerStats
    getLevel() {
        return this.stats.getLevel();
    }
    
    getHealth() {
        return this.stats.getHealth();
    }
    
    getMaxHealth() {
        return this.stats.getMaxHealth();
    }
    
    getMana() {
        return this.stats.getMana();
    }
    
    getMaxMana() {
        return this.stats.getMaxMana();
    }
    
    getExperience() {
        return this.stats.getExperience();
    }
    
    getExperienceToNextLevel() {
        return this.stats.getExperienceToNextLevel();
    }
    
    getAttackPower() {
        return this.stats.getAttackPower();
    }
    
    getMovementSpeed() {
        return this.stats.getMovementSpeed();
    }
    
    // For backward compatibility - direct access to stats object
    // This should be used carefully and eventually refactored
    getStatsObject() {
        return this.stats;
    }
    
    // Skills getters - delegate to PlayerSkills
    getSkills() {
        return this.skills.getSkills();
    }
    
    getActiveSkills() {
        return this.skills.getActiveSkills();
    }
    
    // Inventory getters - delegate to PlayerInventory
    getInventory() {
        return this.inventory.getInventory();
    }
    
    getEquipment() {
        return this.inventory.getEquipment();
    }
    
    getGold() {
        return this.inventory.getGold();
    }
    
    // Inventory and equipment
    addToInventory(item) {
        this.inventory.addToInventory(item);
    }
    
    removeFromInventory(itemName, amount) {
        return this.inventory.removeFromInventory(itemName, amount);
    }
    
    equipItem(item) {
        return this.inventory.equipItem(item);
    }
    
    unequipItem(type) {
        return this.inventory.unequipItem(type);
    }
    
    addGold(amount) {
        this.inventory.addGold(amount);
    }
    
    removeGold(amount) {
        return this.inventory.removeGold(amount);
    }
    
    // State management
    setInWater(inWater) {
        this.state.setInWater(inWater);
    }
    
    setInteracting(isInteracting) {
        this.state.setInteracting(isInteracting);
    }
    
    interact() {
        this.state.setInteracting(true);
    }
    
    isInteracting() {
        return this.state.isInteracting();
    }
}