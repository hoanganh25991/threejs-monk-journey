/**
 * PlayerState.js
 * Manages the player's state (moving, attacking, etc.)
 */

import { IPlayerState } from './PlayerInterface.js';

export class PlayerState extends IPlayerState {
    constructor() {
        super();
        
        // Initialize state
        this.state = {
            isMoving: false,
            isAttacking: false,
            isUsingSkill: false,
            isDead: false,
            inWater: false,
            isInteracting: false
        };
    }
    
    // State methods
    isMoving() {
        return this.state.isMoving;
    }
    
    isAttacking() {
        return this.state.isAttacking;
    }
    
    isUsingSkill() {
        return this.state.isUsingSkill;
    }
    
    isDead() {
        return this.state.isDead;
    }
    
    isInWater() {
        return this.state.inWater;
    }
    
    isInteracting() {
        return this.state.isInteracting;
    }
    
    // State setters
    setMoving(isMoving) {
        this.state.isMoving = isMoving;
    }
    
    setAttacking(isAttacking) {
        this.state.isAttacking = isAttacking;
    }
    
    setUsingSkill(isUsingSkill) {
        this.state.isUsingSkill = isUsingSkill;
    }
    
    setDead(isDead) {
        this.state.isDead = isDead;
    }
    
    setInWater(inWater) {
        this.state.inWater = inWater;
    }
    
    setInteracting(isInteracting) {
        this.state.isInteracting = isInteracting;
    }
}