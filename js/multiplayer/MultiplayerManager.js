import { RemotePlayerManager } from './RemotePlayerManager.js';
import { MultiplayerUIManager } from './MultiplayerUIManager.js';
import { MultiplayerConnectionManager } from './MultiplayerConnectionManager.js';

/**
 * Manages multiplayer functionality using WebRTC
 * Handles game state synchronization and coordinates UI and connection managers
 */
export class MultiplayerManager {
    /**
     * Initialize the multiplayer manager
     * @param {Game} game - The main game instance
     */
    constructor(game) {
        this.game = game;
        this.remotePlayerManager = null;
        this._lastBroadcast = 0; // Timestamp of last state broadcast
        this._lastUpdateLog = 0; // Timestamp of last update log
        this._lastGameStateLog = 0; // Timestamp of last game state log
        
        // Player colors for multiplayer
        this.playerColors = [
            '#FF5733', // Red-Orange
            '#33FF57', // Green
            '#3357FF', // Blue
            '#FF33F5', // Pink
            '#F5FF33', // Yellow
            '#33FFF5', // Cyan
            '#FF8333', // Orange
            '#8333FF'  // Purple
        ];
        this.assignedColors = new Map(); // Map of assigned colors by peer ID
        
        // Create UI and connection managers
        this.ui = new MultiplayerUIManager(this);
        this.connection = new MultiplayerConnectionManager(this);
    }

    /**
     * Initialize the multiplayer manager
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async init() {
        try {
            // Initialize RemotePlayerManager
            this.remotePlayerManager = new RemotePlayerManager(this.game);
            
            // Initialize UI manager
            await this.ui.init();
            
            // Initialize connection manager
            await this.connection.init();
            
            console.log('Multiplayer manager initialized');
            return true;
        } catch (error) {
            console.error('Error initializing multiplayer manager:', error);
            return false;
        }
    }

    /**
     * Host a new game
     * Creates a PeerJS instance and waits for connections
     */
    async hostGame() {
        return this.connection.hostGame();
    }

    /**
     * Join an existing game
     * @param {string} roomId - The room ID to join
     */
    async joinGame(roomId) {
        return this.connection.joinGame(roomId);
    }

    /**
     * Process player input (host only)
     * @param {string} peerId - The ID of the peer
     * @param {Object} data - The input data
     */
    processPlayerInput(peerId, data) {
        // Update player state based on input
        // This will depend on your game's input system
        console.log('Processing input from player', peerId, data);
    }
    
    /**
     * Update game state (member only)
     * @param {Object} data - The game state data
     */
    updateGameState(data) {
        // Only log occasionally to reduce console spam
        const shouldLog = Math.random() < 0.01; // ~1% of updates
        
        if (shouldLog) {
            console.log('[MultiplayerManager] Received game state update from host');
        }
        
        // Update player positions (with reduced logging)
        if (data.players) {
            if (shouldLog) {
                console.log('[MultiplayerManager] Updating', Object.keys(data.players).length, 'players');
            }
            
            Object.entries(data.players).forEach(([playerId, playerData]) => {
                if (playerId !== this.connection.peer.id) {
                    // Only update remote players if we have valid position data
                    if (playerData.position && playerData.rotation) {
                        // Create a complete rotation object (we only send y rotation to save bandwidth)
                        const fullRotation = {
                            x: 0,
                            y: playerData.rotation.y || 0,
                            z: 0
                        };
                        
                        this.remotePlayerManager.updatePlayer(
                            playerId,
                            playerData.position,
                            fullRotation,
                            playerData.animation
                        );
                    }
                }
            });
        }
        
        // Update enemies - this is the primary focus
        if (data.enemies && this.game.enemyManager) {
            if (shouldLog) {
                console.log('[MultiplayerManager] Updating enemies from host data');
            }
            
            // Update enemy positions and states
            this.game.enemyManager.updateEnemiesFromHost(data.enemies);
        }
    }
    
    /**
     * Start multiplayer game (host only)
     */
    startMultiplayerGame() {
        if (!this.connection.isHost) return;
        
        // Notify all peers that game is starting
        this.connection.broadcast({
            type: 'startGame'
        });
        
        // Close multiplayer modal
        this.ui.closeMultiplayerModal();
        
        // Hide the Game Menu first if it's visible
        if (this.game.menuManager) {
            console.log('[MultiplayerManager] Hiding Game Menu before starting multiplayer game');
            this.game.menuManager.hideActiveMenu();
        }
        
        // Hide the main background if it exists
        if (this.game.hudManager && this.game.hudManager.mainBackground) {
            console.log('[MultiplayerManager] Hiding main background');
            this.game.hudManager.mainBackground.hide();
        }
        
        // Show all HUD elements
        if (this.game.hudManager) {
            console.log('[MultiplayerManager] Showing all HUD elements');
            this.game.hudManager.showAllUI();
        }
        
        // Make sure home button is visible
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.style.display = 'block';
        }
        
        // Start the game - this will properly initialize the game state
        console.log('[MultiplayerManager] Starting multiplayer game - calling game.start()');
        this.game.start();
    }
    
    /**
     * Start the game (both host and member)
     */
    startGame() {
        console.log('[MultiplayerManager] Starting game...');
        
        // Close multiplayer modal if it's open
        this.ui.closeMultiplayerModal();
        
        // Hide the Game Menu first if it's visible
        if (this.game.menuManager) {
            console.log('[MultiplayerManager] Hiding Game Menu');
            this.game.menuManager.hideActiveMenu();
        }
        
        // Hide the main background if it exists
        if (this.game.hudManager && this.game.hudManager.mainBackground) {
            console.log('[MultiplayerManager] Hiding main background');
            this.game.hudManager.mainBackground.hide();
        }
        
        // For members, we need to ensure the game is fully started
        if (!this.connection.isHost) {
            console.log('[MultiplayerManager] Member starting game - calling game.start()');
            
            // Show all HUD elements
            if (this.game.hudManager) {
                console.log('[MultiplayerManager] Showing all HUD elements');
                this.game.hudManager.showAllUI();
            }
            
            // Make sure home button is visible
            const homeButton = document.getElementById('home-button');
            if (homeButton) {
                homeButton.style.display = 'block';
            }
            
            // Start the game - this will properly initialize the game state
            this.game.start();
        } else {
            // For host, the game should already be started by startMultiplayerGame()
            console.log('[MultiplayerManager] Host starting game - ensuring game state is running');
            
            // Just make sure the game state is set to running
            if (this.game.state) {
                this.game.state.setRunning();
            }
        }
    }
    
    /**
     * Update method called every frame
     * @param {number} deltaTime - Time elapsed since the last frame
     */
    update(deltaTime) {
        // Log update status occasionally (every 3 seconds)
        const now = Date.now();
        if (!this._lastUpdateLog || now - this._lastUpdateLog > 3000) {
            console.log('[MultiplayerManager] Update called - isHost:', this.connection.isHost, 
                        'isConnected:', this.connection.isConnected, 
                        'peers:', this.connection.peers.size,
                        'game state:', this.game.state ? (this.game.state.isRunning() ? 'running' : 'not running') : 'unknown');
            this._lastUpdateLog = now;
        }
        
        // Update remote players
        if (this.remotePlayerManager) {
            this.remotePlayerManager.update(deltaTime);
        }
        
        // If connected as member, send player data to host
        if (!this.connection.isHost && this.connection.isConnected) {
            // Check if game is running
            if (this.game.state && this.game.state.isRunning()) {
                this.connection.sendPlayerData();
            } else {
                // Log this issue occasionally
                if (!this._lastGameStateLog || now - this._lastGameStateLog > 3000) {
                    console.log('[MultiplayerManager] Member not sending data because game is not running');
                    this._lastGameStateLog = now;
                }
            }
        }
        
        // If host, broadcast game state to members
        if (this.connection.isHost && this.connection.peers.size > 0) {
            // Throttle broadcasts to 10-20 times per second
            if (!this._lastBroadcast || Date.now() - this._lastBroadcast > 50) {
                this.connection.broadcastGameState();
                this._lastBroadcast = Date.now();
            }
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Dispose connection manager
        if (this.connection) {
            this.connection.dispose();
        }
        
        // Dispose remote player manager
        if (this.remotePlayerManager) {
            // Clean up remote players if needed
        }
    }
}