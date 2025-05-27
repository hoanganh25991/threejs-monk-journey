/**
 * MultiplayerConnectionManager.js
 * Handles WebRTC connections, peer management, and data transfer
 */

export class MultiplayerConnectionManager {
    /**
     * Initialize the multiplayer connection manager
     * @param {MultiplayerManager} multiplayerManager - Reference to the main multiplayer manager
     */
    constructor(multiplayerManager) {
        this.multiplayerManager = multiplayerManager;
        this.peer = null; // PeerJS instance
        this.peers = new Map(); // Map of connected peers
        this.isHost = false;
        this.isConnected = false;
        this.hostId = null; // ID of the host (if member)
        this.roomId = null; // Room ID (if host)
    }

    /**
     * Initialize the connection manager
     */
    async init() {
        return true;
    }

    /**
     * Host a new game
     * Creates a PeerJS instance and waits for connections
     */
    async hostGame() {
        try {
            this.multiplayerManager.ui.updateConnectionStatus('Initializing host...');
            
            // Show host UI
            this.multiplayerManager.ui.showHostUI();
            
            // Check if PeerJS is available
            if (typeof Peer === 'undefined') {
                // Load PeerJS dynamically if not available
                await this.loadPeerJS();
            }
            
            // Initialize PeerJS
            this.peer = new Peer();
            
            // Wait for peer to open
            await new Promise((resolve, reject) => {
                this.peer.on('open', id => {
                    this.roomId = id;
                    resolve();
                });
                this.peer.on('error', err => reject(err));
            });
            
            // Generate QR code with room ID
            await this.multiplayerManager.ui.generateQRCode(this.roomId);
            
            // Display connection code
            this.multiplayerManager.ui.displayConnectionCode(this.roomId);
            
            // Set up connection handler
            this.peer.on('connection', conn => this.handleNewConnection(conn));
            
            // Set host flag
            this.isHost = true;
            
            // Assign a color to the host
            const hostColor = this.multiplayerManager.playerColors[0]; // First color for host
            this.multiplayerManager.assignedColors.set(this.roomId, hostColor);
            
            // Update host entry in the player list
            this.multiplayerManager.ui.updateHostEntry(this.roomId, hostColor);
            
            // Update connection status
            this.multiplayerManager.ui.updateConnectionStatus('Waiting for players to join...');
            
            // Disable start button until at least one player joins
            this.multiplayerManager.ui.setStartButtonEnabled(false);
            
            return true;
        } catch (error) {
            console.error('Error hosting game:', error);
            this.multiplayerManager.ui.updateConnectionStatus('Error hosting game: ' + error.message);
            return false;
        }
    }

    /**
     * Join an existing game
     * @param {string} roomId - The room ID to join
     */
    async joinGame(roomId) {
        try {
            this.multiplayerManager.ui.updateConnectionStatus('Connecting to host...');
            
            // Check if PeerJS is available
            if (typeof Peer === 'undefined') {
                // Load PeerJS dynamically if not available
                await this.loadPeerJS();
            }
            
            // Initialize PeerJS
            this.peer = new Peer();
            
            // Wait for peer to open
            await new Promise((resolve, reject) => {
                this.peer.on('open', id => resolve());
                this.peer.on('error', err => reject(err));
            });
            
            // Connect to host
            this.hostId = roomId;
            const conn = this.peer.connect(roomId, {
                reliable: true
            });
            
            // Set up connection
            conn.on('open', () => {
                // Add to peers map
                this.peers.set(roomId, conn);
                
                // Set connected flag
                this.isConnected = true;
                
                // Update connection status
                this.multiplayerManager.ui.updateConnectionStatus('Connected to host! Waiting for game to start...');
                
                // Set up data handler
                conn.on('data', data => this.handleDataFromHost(data));
                
                // Set up close handler
                conn.on('close', () => this.handleDisconnect(roomId));
            });
            
            conn.on('error', err => {
                console.error('Connection error:', err);
                this.multiplayerManager.ui.updateConnectionStatus('Connection error: ' + err.message);
            });
            
            return true;
        } catch (error) {
            console.error('Error joining game:', error);
            this.multiplayerManager.ui.updateConnectionStatus('Error joining game: ' + error.message);
            return false;
        }
    }

    /**
     * Handle new connection from a member (host only)
     * @param {DataConnection} conn - The PeerJS connection
     */
    handleNewConnection(conn) {
        // Add to peers map
        this.peers.set(conn.peer, conn);
        
        // Assign a color to the player if not already assigned
        if (!this.multiplayerManager.assignedColors.has(conn.peer)) {
            // Get next available color
            const usedColors = Array.from(this.multiplayerManager.assignedColors.values());
            const availableColor = this.multiplayerManager.playerColors.find(color => !usedColors.includes(color)) || 
                                  this.multiplayerManager.playerColors[Math.floor(Math.random() * this.multiplayerManager.playerColors.length)];
            
            // Assign the color
            this.multiplayerManager.assignedColors.set(conn.peer, availableColor);
        }
        
        const playerColor = this.multiplayerManager.assignedColors.get(conn.peer);
        
        // Update UI
        this.multiplayerManager.ui.addPlayerToList(conn.peer, playerColor);
        
        // Enable start button if at least one player connected
        this.multiplayerManager.ui.setStartButtonEnabled(true);
        
        // Set up data handler
        conn.on('data', data => this.handleDataFromMember(conn.peer, data));
        
        // Set up close handler
        conn.on('close', () => this.handleDisconnect(conn.peer));
        
        // Send welcome message
        conn.send({
            type: 'welcome',
            message: 'Connected to host'
        });
        
        // Send all player colors to the new member
        const colors = {};
        this.multiplayerManager.assignedColors.forEach((color, id) => {
            colors[id] = color;
        });
        
        conn.send({
            type: 'playerColors',
            colors: colors
        });
        
        // Notify other peers about the new player and their color
        this.peers.forEach((peerConn, peerId) => {
            if (peerId !== conn.peer) {
                peerConn.send({
                    type: 'playerJoined',
                    playerId: conn.peer,
                    playerColor: playerColor
                });
            }
        });
        
        // Create remote player with the assigned color
        this.multiplayerManager.remotePlayerManager.createRemotePlayer(conn.peer, playerColor);
    }

    /**
     * Handle data received from host (member only)
     * @param {Object} data - The data received from the host
     */
    handleDataFromHost(data) {
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'welcome':
                console.log('Received welcome message:', data.message);
                break;
            case 'gameState':
                this.multiplayerManager.updateGameState(data);
                break;
            case 'startGame':
                this.multiplayerManager.startGame();
                break;
            case 'playerJoined':
                // Store the player color
                if (data.playerColor) {
                    this.multiplayerManager.assignedColors.set(data.playerId, data.playerColor);
                }
                
                // Create remote player with the assigned color
                this.multiplayerManager.remotePlayerManager.createRemotePlayer(data.playerId, data.playerColor);
                break;
            case 'playerLeft':
                this.multiplayerManager.remotePlayerManager.removePlayer(data.playerId);
                
                // Remove color assignment
                this.multiplayerManager.assignedColors.delete(data.playerId);
                break;
            case 'playerColors':
                // Update all player colors
                if (data.colors) {
                    Object.entries(data.colors).forEach(([playerId, color]) => {
                        this.multiplayerManager.assignedColors.set(playerId, color);
                        
                        // Update remote player color if it exists
                        const remotePlayer = this.multiplayerManager.remotePlayerManager.getPlayer(playerId);
                        if (remotePlayer) {
                            remotePlayer.setPlayerColor(color);
                        }
                    });
                }
                break;
            default:
                console.warn('Unknown data type from host:', data.type);
        }
    }

    /**
     * Handle data received from member (host only)
     * @param {string} peerId - The ID of the peer
     * @param {Object} data - The data received from the member
     */
    handleDataFromMember(peerId, data) {
        if (!data || !data.type) {
            console.warn('[MultiplayerConnectionManager] Received invalid data from member:', peerId);
            return;
        }
        
        try {
            switch (data.type) {
                case 'playerInput':
                    // Process player input
                    this.multiplayerManager.processPlayerInput(peerId, data);
                    break;
                case 'playerPosition':
                    // Validate position data before updating
                    if (!data.position || !data.rotation) {
                        console.warn('[MultiplayerConnectionManager] Received incomplete position data from member:', peerId);
                        return;
                    }
                    
                    // Update remote player position
                    this.multiplayerManager.remotePlayerManager.updatePlayer(
                        peerId, 
                        data.position, 
                        data.rotation, 
                        data.animation || 'idle'
                    );
                    break;
                default:
                    console.warn('[MultiplayerConnectionManager] Unknown data type from member:', data.type);
            }
        } catch (error) {
            console.error('[MultiplayerConnectionManager] Error handling data from member:', error);
        }
    }

    /**
     * Handle disconnect
     * @param {string} peerId - The ID of the peer that disconnected
     */
    handleDisconnect(peerId) {
        // Remove from peers map
        this.peers.delete(peerId);
        
        if (this.isHost) {
            // Remove player from list
            this.multiplayerManager.ui.removePlayerFromList(peerId);
            
            // Notify other peers that a player left
            this.peers.forEach(conn => {
                conn.send({
                    type: 'playerLeft',
                    playerId: peerId
                });
            });
            
            // Remove remote player
            this.multiplayerManager.remotePlayerManager.removePlayer(peerId);
            
            // Disable start button if no players connected
            if (this.peers.size === 0) {
                this.multiplayerManager.ui.setStartButtonEnabled(false);
            }
        } else {
            // If host disconnected, end the game
            if (peerId === this.hostId) {
                this.isConnected = false;
                this.multiplayerManager.ui.updateConnectionStatus('Disconnected from host');
                
                // Show disconnection message
                if (this.multiplayerManager.game.hudManager) {
                    this.multiplayerManager.game.hudManager.showNotification('Disconnected from host', 'error');
                }
                
                // Return to main menu
                if (this.multiplayerManager.game.state) {
                    this.multiplayerManager.game.state.setPaused();
                }
                if (this.multiplayerManager.game.menuManager) {
                    this.multiplayerManager.game.menuManager.showMainMenu();
                }
            }
        }
    }

    /**
     * Send data to a specific peer
     * @param {string} peerId - The ID of the peer to send data to
     * @param {Object} data - The data to send
     */
    sendToPeer(peerId, data) {
        const conn = this.peers.get(peerId);
        if (conn) {
            conn.send(data);
        }
    }

    /**
     * Broadcast data to all peers
     * @param {Object} data - The data to broadcast
     */
    broadcast(data) {
        this.peers.forEach(conn => {
            conn.send(data);
        });
    }

    /**
     * Send player data to host (member only)
     * Optimized to send minimal data
     */
    sendPlayerData() {
        if (this.isHost || !this.isConnected) {
            // Silent return for host or not connected
            return;
        }
        
        if (!this.multiplayerManager.game.player) {
            console.log('[MultiplayerConnectionManager] Cannot send player data: game.player is null');
            return;
        }
        
        const hostConn = this.peers.get(this.hostId);
        if (!hostConn) {
            console.log('[MultiplayerConnectionManager] Cannot send player data: no connection to host');
            return;
        }
        
        try {
            // Get player position from movement component if available (more reliable)
            let position = null;
            let rotation = null;
            
            if (this.multiplayerManager.game.player.movement && this.multiplayerManager.game.player.movement.getPosition) {
                const validPos = this.multiplayerManager.game.player.movement.getPosition();
                if (validPos && !isNaN(validPos.x) && !isNaN(validPos.y) && !isNaN(validPos.z)) {
                    position = {
                        x: validPos.x,
                        y: validPos.y,
                        z: validPos.z
                    };
                }
                
                // Get rotation if available
                if (this.multiplayerManager.game.player.movement.getRotation) {
                    const validRot = this.multiplayerManager.game.player.movement.getRotation();
                    if (validRot && !isNaN(validRot.y)) {
                        rotation = {
                            y: validRot.y // Only send y rotation (yaw) to save bandwidth
                        };
                    }
                }
            }
            
            // Fallback to model position if movement position is not available
            if (!position && this.multiplayerManager.game.player.model && this.multiplayerManager.game.player.model.position) {
                const playerPos = this.multiplayerManager.game.player.model.position;
                if (!isNaN(playerPos.x) && !isNaN(playerPos.y) && !isNaN(playerPos.z)) {
                    position = {
                        x: playerPos.x,
                        y: playerPos.y,
                        z: playerPos.z
                    };
                }
            }
            
            // Fallback to model rotation if movement rotation is not available
            if (!rotation && this.multiplayerManager.game.player.model && this.multiplayerManager.game.player.model.rotation) {
                const playerRot = this.multiplayerManager.game.player.model.rotation;
                if (!isNaN(playerRot.y)) {
                    rotation = {
                        y: playerRot.y // Only send y rotation (yaw) to save bandwidth
                    };
                }
            }
            
            // If we still don't have valid position or rotation, don't send anything
            if (!position || !rotation) {
                console.log('[MultiplayerConnectionManager] Cannot send player data: unable to get valid position or rotation');
                return;
            }
            
            // Get current animation (only if it changed to save bandwidth)
            const animation = this.multiplayerManager.game.player.currentAnimation || 'idle';
            
            // Only log position updates occasionally to reduce console spam
            if (Math.random() < 0.05) { // ~5% of updates
                console.log('[MultiplayerConnectionManager] Member sending player data to host:', 
                            'Position:', position, 
                            'Animation:', animation);
            }
            
            // Send to host - minimal data to save bandwidth
            hostConn.send({
                type: 'playerPosition',
                position,
                rotation,
                animation
            });
        } catch (error) {
            console.error('[MultiplayerConnectionManager] Error sending player data:', error);
        }
    }

    /**
     * Broadcast game state to all members (host only)
     * Optimized to focus on enemy data and minimize bandwidth
     */
    broadcastGameState() {
        if (!this.isHost) {
            return;
        }
        
        // Only log occasionally to reduce console spam
        if (Math.random() < 0.05) { // ~5% of broadcasts
            console.log('[MultiplayerConnectionManager] Broadcasting game state to', this.peers.size, 'peers');
        }
        
        // Collect player data - simplified to save bandwidth
        const players = {};
        
        // Add host player with minimal data
        if (this.multiplayerManager.game.player) {
            let hostPosition = null;
            let hostRotation = null;
            
            // Try to get position from movement component first (more reliable)
            if (this.multiplayerManager.game.player.movement && this.multiplayerManager.game.player.movement.getPosition) {
                const validPos = this.multiplayerManager.game.player.movement.getPosition();
                if (validPos && !isNaN(validPos.x) && !isNaN(validPos.y) && !isNaN(validPos.z)) {
                    hostPosition = {
                        x: validPos.x,
                        y: validPos.y,
                        z: validPos.z
                    };
                }
                
                // Get rotation if available
                if (this.multiplayerManager.game.player.movement.getRotation) {
                    const validRot = this.multiplayerManager.game.player.movement.getRotation();
                    if (validRot && !isNaN(validRot.y)) {
                        hostRotation = {
                            y: validRot.y // Only send y rotation (yaw) to save bandwidth
                        };
                    }
                }
            }
            
            // Fallback to model position if needed
            if (!hostPosition && this.multiplayerManager.game.player.model && this.multiplayerManager.game.player.model.position) {
                const playerPos = this.multiplayerManager.game.player.model.position;
                if (!isNaN(playerPos.x) && !isNaN(playerPos.y) && !isNaN(playerPos.z)) {
                    hostPosition = {
                        x: playerPos.x,
                        y: playerPos.y,
                        z: playerPos.z
                    };
                }
            }
            
            // Fallback to model rotation if needed
            if (!hostRotation && this.multiplayerManager.game.player.model && this.multiplayerManager.game.player.model.rotation) {
                const playerRot = this.multiplayerManager.game.player.model.rotation;
                if (!isNaN(playerRot.y)) {
                    hostRotation = {
                        y: playerRot.y
                    };
                }
            }
            
            // Only add host player if we have valid position and rotation
            if (hostPosition && hostRotation) {
                players[this.peer.id] = {
                    position: hostPosition,
                    rotation: hostRotation,
                    animation: this.multiplayerManager.game.player.currentAnimation || 'idle'
                };
            }
        }
        
        // Add remote players with minimal data
        this.multiplayerManager.remotePlayerManager.getPlayers().forEach((player, peerId) => {
            if (player && player.group) {
                const position = player.group.position;
                if (!isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z)) {
                    players[peerId] = {
                        position: {
                            x: position.x,
                            y: position.y,
                            z: position.z
                        },
                        rotation: player.model ? {
                            y: player.model.rotation.y // Only send y rotation to save bandwidth
                        } : { y: 0 },
                        animation: player.currentAnimation || 'idle'
                    };
                }
            }
        });
        
        // Collect enemy data - this is the primary focus
        let enemies = {};
        if (this.multiplayerManager.game.enemyManager && typeof this.multiplayerManager.game.enemyManager.getSerializableEnemyData === 'function') {
            enemies = this.multiplayerManager.game.enemyManager.getSerializableEnemyData();
        }
        
        // Create optimized game state packet
        const gameState = {
            type: 'gameState',
            players, // Still include players but with minimal data
            enemies  // Primary focus - enemy data
        };
        
        // Send to all peers
        this.broadcast(gameState);
    }

    /**
     * Load PeerJS dynamically
     * @returns {Promise} A promise that resolves when PeerJS is loaded
     */
    loadPeerJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PeerJS'));
            document.head.appendChild(script);
        });
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Close all connections
        if (this.peers) {
            this.peers.forEach(conn => conn.close());
            this.peers.clear();
        }
        
        // Close peer connection
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        // Reset flags
        this.isHost = false;
        this.isConnected = false;
        this.hostId = null;
        this.roomId = null;
    }
}