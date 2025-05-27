/**
 * RemotePlayerManager.js
 * Manages remote players in the multiplayer game
 */

import * as THREE from 'three';
import { RemotePlayer } from './RemotePlayer.js';

export class RemotePlayerManager {
    /**
     * Initialize the remote player manager
     * @param {Game} game - The main game instance
     */
    constructor(game) {
        this.game = game;
        this.remotePlayers = new Map(); // Map of remote players by peer ID
    }
    
    /**
     * Update a remote player's position and state
     * @param {string} peerId - The ID of the remote player
     * @param {Object} position - The position of the remote player
     * @param {Object} rotation - The rotation of the remote player
     * @param {string} animation - The current animation of the remote player
     */
    updatePlayer(peerId, position, rotation, animation) {
        // Check if player exists
        if (!this.remotePlayers.has(peerId)) {
            // Create new remote player
            console.log(`[RemotePlayerManager] Creating new remote player for peer ${peerId}`);
            this.createRemotePlayer(peerId);
        }
        
        // Get remote player
        const remotePlayer = this.remotePlayers.get(peerId);
        
        // Validate position and rotation data
        const validPosition = this.validateVector(position);
        const validRotation = this.validateVector(rotation);
        
        // Update position, rotation, and animation
        console.log(`[RemotePlayerManager] Updating player ${peerId} - Position:`, validPosition, 
                    "Rotation:", validRotation, "Animation:", animation);
        remotePlayer.updatePosition(validPosition);
        remotePlayer.updateRotation(validRotation);
        remotePlayer.updateAnimation(animation);
    }
    
    /**
     * Validate a vector object to ensure it has no NaN values
     * @param {Object} vector - The vector to validate
     * @returns {Object} A validated vector with no NaN values
     */
    validateVector(vector) {
        if (!vector) {
            return { x: 0, y: 0, z: 0 };
        }
        
        return {
            x: isNaN(vector.x) ? 0 : vector.x,
            y: isNaN(vector.y) ? 0 : vector.y,
            z: isNaN(vector.z) ? 0 : vector.z
        };
    }
    
    /**
     * Create a new remote player
     * @param {string} peerId - The ID of the remote player
     * @param {string} [playerColor] - The color assigned to the player
     * @returns {RemotePlayer} The created remote player
     */
    createRemotePlayer(peerId, playerColor) {
        // Create new remote player
        const remotePlayer = new RemotePlayer(this.game, peerId, playerColor);
        
        // Add to map
        this.remotePlayers.set(peerId, remotePlayer);
        
        // Initialize remote player
        remotePlayer.init();
        
        return remotePlayer;
    }
    
    /**
     * Remove a remote player
     * @param {string} peerId - The ID of the remote player to remove
     */
    removePlayer(peerId) {
        // Check if player exists
        if (this.remotePlayers.has(peerId)) {
            // Get remote player
            const remotePlayer = this.remotePlayers.get(peerId);
            
            // Dispose remote player
            remotePlayer.dispose();
            
            // Remove from map
            this.remotePlayers.delete(peerId);
        }
    }
    
    /**
     * Update all remote players
     * @param {number} deltaTime - Time elapsed since the last frame
     */
    update(deltaTime) {
        // Update all remote players
        this.remotePlayers.forEach(remotePlayer => {
            remotePlayer.update(deltaTime);
        });
    }
    
    /**
     * Get all remote players
     * @returns {Map<string, RemotePlayer>} Map of remote players
     */
    getPlayers() {
        return this.remotePlayers;
    }
    
    /**
     * Get a specific remote player by ID
     * @param {string} peerId - The ID of the remote player
     * @returns {RemotePlayer|null} The remote player or null if not found
     */
    getPlayer(peerId) {
        return this.remotePlayers.get(peerId) || null;
    }
    
    /**
     * Get the number of remote players
     * @returns {number} The number of remote players
     */
    getPlayerCount() {
        return this.remotePlayers.size;
    }
}