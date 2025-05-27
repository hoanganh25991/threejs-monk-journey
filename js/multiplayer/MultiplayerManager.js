import { RemotePlayerManager } from './RemotePlayerManager.js';

/**
 * Manages multiplayer functionality using WebRTC
 * Handles host and member roles, connection setup, and game state synchronization
 */
export class MultiplayerManager {
    /**
     * Initialize the multiplayer manager
     * @param {Game} game - The main game instance
     */
    constructor(game) {
        this.game = game;
        this.isHost = false;
        this.isConnected = false;
        this.peers = new Map(); // Map of connected peers
        this.peer = null; // PeerJS instance
        this.hostId = null; // ID of the host (if member)
        this.roomId = null; // Room ID (if host)
        this.remotePlayerManager = null;
        this._lastBroadcast = 0; // Timestamp of last state broadcast
        
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
    }

    /**
     * Initialize the multiplayer manager
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async init() {
        try {
            // Initialize RemotePlayerManager
            this.remotePlayerManager = new RemotePlayerManager(this.game);
            
            // Set up UI event listeners
            this.setupUIListeners();
            
            console.log('Multiplayer manager initialized');
            return true;
        } catch (error) {
            console.error('Error initializing multiplayer manager:', error);
            return false;
        }
    }

    /**
     * Set up UI event listeners for multiplayer buttons
     */
    setupUIListeners() {
        // Multiplayer button (in top right UI)
        const multiplayerButton = document.getElementById('multiplayer-button');
        if (multiplayerButton) {
            multiplayerButton.addEventListener('click', () => this.showMultiplayerModal());
        }
        
        // Host game button
        const hostGameBtn = document.getElementById('host-game-btn');
        if (hostGameBtn) {
            hostGameBtn.addEventListener('click', () => this.hostGame());
        }
        
        // Join game button
        const joinGameBtn = document.getElementById('join-game-btn');
        if (joinGameBtn) {
            joinGameBtn.addEventListener('click', () => this.showJoinUI());
        }
        
        // Manual connect button
        const manualConnectBtn = document.getElementById('manual-connect-btn');
        if (manualConnectBtn) {
            manualConnectBtn.addEventListener('click', () => {
                const code = document.getElementById('manual-connection-input').value;
                if (code) this.joinGame(code);
            });
        }
        
        // Start game button (for host)
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startMultiplayerGame());
        }
        
        // Close multiplayer modal
        const closeMultiplayerBtn = document.getElementById('close-multiplayer-btn');
        if (closeMultiplayerBtn) {
            closeMultiplayerBtn.addEventListener('click', () => this.closeMultiplayerModal());
        }
        
        // Copy connection code button
        const connectionCode = document.getElementById('connection-code');
        if (connectionCode) {
            connectionCode.addEventListener('click', () => this.copyConnectionCode());
        }
        
        // Copy button for connection code
        const copyCodeBtn = document.getElementById('copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => this.copyConnectionCode());
        }
        
        // Paste button for connection code
        const pasteCodeBtn = document.getElementById('paste-code-btn');
        if (pasteCodeBtn) {
            pasteCodeBtn.addEventListener('click', async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    const input = document.getElementById('manual-connection-input');
                    if (input) {
                        input.value = text;
                    }
                } catch (err) {
                    console.error('Failed to read clipboard contents: ', err);
                    this.updateConnectionStatus('Failed to paste from clipboard. Please enter code manually.');
                }
            });
        }
    }

    /**
     * Show the multiplayer modal
     */
    showMultiplayerModal() {
        const modal = document.getElementById('multiplayer-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Reset UI
            document.getElementById('qr-container').style.display = 'none';
            document.getElementById('qr-scanner-container').style.display = 'none';
            document.getElementById('host-controls').style.display = 'none';
            document.getElementById('connection-status').textContent = '';
        }
    }

    /**
     * Close the multiplayer modal
     */
    closeMultiplayerModal() {
        const modal = document.getElementById('multiplayer-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Host a new game
     * Creates a PeerJS instance and waits for connections
     */
    async hostGame() {
        try {
            this.updateConnectionStatus('Initializing host...');
            
            // Show host UI
            document.getElementById('qr-container').style.display = 'flex';
            document.getElementById('qr-scanner-container').style.display = 'none';
            document.getElementById('host-controls').style.display = 'block';
            
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
            this.generateQRCode(this.roomId);
            
            // Display connection code
            document.getElementById('connection-code').textContent = this.roomId;
            
            // Set up connection handler
            this.peer.on('connection', conn => this.handleNewConnection(conn));
            
            // Set host flag
            this.isHost = true;
            
            // Assign a color to the host
            const hostColor = this.playerColors[0]; // First color for host
            this.assignedColors.set(this.roomId, hostColor);
            
            // Add host color indicator to the "You (Host)" entry
            const hostEntry = document.querySelector('.connected-players-list .player-item');
            if (hostEntry) {
                // Clear existing content
                hostEntry.innerHTML = '';
                
                // Add color indicator
                const colorIndicator = document.createElement('div');
                colorIndicator.className = 'player-color-indicator';
                colorIndicator.style.backgroundColor = hostColor;
                hostEntry.appendChild(colorIndicator);
                
                // Add host text
                const hostText = document.createElement('span');
                hostText.textContent = 'You (Host)';
                hostEntry.appendChild(hostText);
            }
            
            // Update connection status
            this.updateConnectionStatus('Waiting for players to join...');
            
            // Enable start button when at least one player joins
            document.getElementById('start-game-btn').disabled = true;
        } catch (error) {
            console.error('Error hosting game:', error);
            this.updateConnectionStatus('Error hosting game: ' + error.message);
        }
    }

    /**
     * Show the join UI
     */
    async showJoinUI() {
        // Show join UI
        document.getElementById('qr-container').style.display = 'none';
        document.getElementById('qr-scanner-container').style.display = 'flex';
        document.getElementById('host-controls').style.display = 'none';
        
        // Initialize QR scanner
        try {
            // Load HTML5-QRCode library if not already loaded
            if (typeof Html5Qrcode === 'undefined') {
                await this.loadQRScannerJS();
            }
            
            const qrScanner = document.getElementById('qr-scanner');
            if (qrScanner) {
                // Clear previous scanner
                qrScanner.innerHTML = '';
                
                // Create scanner container
                const scannerContainer = document.createElement('div');
                scannerContainer.id = 'qr-scanner-view';
                qrScanner.appendChild(scannerContainer);
                
                // Initialize scanner
                const html5QrCode = new Html5Qrcode('qr-scanner-view');
                
                // Add start/stop scanner buttons
                const scannerControls = document.createElement('div');
                scannerControls.className = 'scanner-controls';
                
                const startScanBtn = document.createElement('button');
                startScanBtn.className = 'menu-button';
                startScanBtn.textContent = 'Start Camera';
                startScanBtn.addEventListener('click', () => {
                    html5QrCode.start(
                        { facingMode: 'environment' },
                        { fps: 10, qrbox: 250 },
                        (decodedText) => {
                            // Stop scanning and join game with the decoded text
                            html5QrCode.stop();
                            this.joinGame(decodedText);
                        },
                        (errorMessage) => {
                            // Handle scan errors silently
                        }
                    ).catch(err => {
                        this.updateConnectionStatus('Error starting camera: ' + err);
                    });
                });
                
                const stopScanBtn = document.createElement('button');
                stopScanBtn.className = 'menu-button';
                stopScanBtn.textContent = 'Stop Camera';
                stopScanBtn.addEventListener('click', () => {
                    html5QrCode.stop().catch(err => {
                        console.error('Error stopping camera:', err);
                    });
                });
                
                scannerControls.appendChild(startScanBtn);
                scannerControls.appendChild(stopScanBtn);
                qrScanner.appendChild(scannerControls);
            }
            
            this.updateConnectionStatus('Click "Start Camera" to scan a QR code or enter code manually');
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            this.updateConnectionStatus('QR scanner not available. Please enter connection code manually.');
        }
    }
    
    /**
     * Load HTML5-QRCode library
     * @returns {Promise} A promise that resolves when HTML5-QRCode is loaded
     */
    loadQRScannerJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load HTML5-QRCode'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Join an existing game
     * @param {string} roomId - The room ID to join
     */
    async joinGame(roomId) {
        try {
            this.updateConnectionStatus('Connecting to host...');
            
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
                this.updateConnectionStatus('Connected to host! Waiting for game to start...');
                
                // Set up data handler
                conn.on('data', data => this.handleDataFromHost(data));
                
                // Set up close handler
                conn.on('close', () => this.handleDisconnect(roomId));
            });
            
            conn.on('error', err => {
                console.error('Connection error:', err);
                this.updateConnectionStatus('Connection error: ' + err.message);
            });
        } catch (error) {
            console.error('Error joining game:', error);
            this.updateConnectionStatus('Error joining game: ' + error.message);
        }
    }
    
    /**
     * Handle new connection from a member (host only)
     * @param {DataConnection} conn - The PeerJS connection
     */
    handleNewConnection(conn) {
        // Add to peers map
        this.peers.set(conn.peer, conn);
        
        // Update UI
        this.addPlayerToList(conn.peer);
        
        // Enable start button if at least one player connected
        document.getElementById('start-game-btn').disabled = false;
        
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
        this.assignedColors.forEach((color, id) => {
            colors[id] = color;
        });
        
        conn.send({
            type: 'playerColors',
            colors: colors
        });
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
                this.updateGameState(data);
                break;
            case 'startGame':
                this.startGame();
                break;
            case 'playerJoined':
                // Store the player color
                if (data.playerColor) {
                    this.assignedColors.set(data.playerId, data.playerColor);
                }
                
                // Create remote player with the assigned color
                this.remotePlayerManager.createRemotePlayer(data.playerId, data.playerColor);
                break;
            case 'playerLeft':
                this.remotePlayerManager.removePlayer(data.playerId);
                
                // Remove color assignment
                this.assignedColors.delete(data.playerId);
                break;
            case 'playerColors':
                // Update all player colors
                if (data.colors) {
                    Object.entries(data.colors).forEach(([playerId, color]) => {
                        this.assignedColors.set(playerId, color);
                        
                        // Update remote player color if it exists
                        const remotePlayer = this.remotePlayerManager.getPlayer(playerId);
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
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'playerInput':
                // Process player input
                this.processPlayerInput(peerId, data);
                break;
            case 'playerPosition':
                // Update remote player position
                this.remotePlayerManager.updatePlayer(
                    peerId, 
                    data.position, 
                    data.rotation, 
                    data.animation
                );
                break;
            default:
                console.warn('Unknown data type from member:', data.type);
        }
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
        console.log('[MultiplayerManager] Received game state update from host');
        
        // Update player positions
        if (data.players) {
            console.log('[MultiplayerManager] Updating', Object.keys(data.players).length, 'players');
            
            Object.entries(data.players).forEach(([playerId, playerData]) => {
                if (playerId !== this.peer.id) {
                    console.log('[MultiplayerManager] Updating remote player', playerId);
                    this.remotePlayerManager.updatePlayer(
                        playerId,
                        playerData.position,
                        playerData.rotation,
                        playerData.animation
                    );
                }
            });
        } else {
            console.log('[MultiplayerManager] No player data in game state update');
        }
        
        // Update enemies
        if (data.enemies && this.game.enemyManager) {
            console.log('[MultiplayerManager] Updating enemies from host data');
            // Update enemy positions and states
            this.game.enemyManager.updateEnemiesFromHost(data.enemies);
        }
    }
    
    /**
     * Start multiplayer game (host only)
     */
    startMultiplayerGame() {
        if (!this.isHost) return;
        
        // Notify all peers that game is starting
        this.peers.forEach(conn => {
            conn.send({
                type: 'startGame'
            });
        });
        
        // Close multiplayer modal
        this.closeMultiplayerModal();
        
        // Start the game
        this.startGame();
    }
    
    /**
     * Start the game (both host and member)
     */
    startGame() {
        console.log('[MultiplayerManager] Starting game...');
        
        // Close multiplayer modal
        this.closeMultiplayerModal();
        
        // Start the game or transition to gameplay
        if (this.game.state) {
            console.log('[MultiplayerManager] Setting game state to running');
            this.game.state.setRunning();
            
            // For members, we need to ensure the game is fully started
            if (!this.isHost) {
                console.log('[MultiplayerManager] Member starting game - calling game.start()');
                this.game.start();
            } else {
                console.log('[MultiplayerManager] Host starting game - game already started');
            }
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
            this.removePlayerFromList(peerId);
            
            // Notify other peers that a player left
            this.peers.forEach(conn => {
                conn.send({
                    type: 'playerLeft',
                    playerId: peerId
                });
            });
            
            // Remove remote player
            this.remotePlayerManager.removePlayer(peerId);
            
            // Disable start button if no players connected
            if (this.peers.size === 0) {
                document.getElementById('start-game-btn').disabled = true;
            }
        } else {
            // If host disconnected, end the game
            if (peerId === this.hostId) {
                this.isConnected = false;
                this.updateConnectionStatus('Disconnected from host');
                
                // Show disconnection message
                if (this.game.hudManager) {
                    this.game.hudManager.showNotification('Disconnected from host', 'error');
                }
                
                // Return to main menu
                if (this.game.state) {
                    this.game.state.setPaused();
                }
                if (this.game.menuManager) {
                    this.game.menuManager.showMainMenu();
                }
            }
        }
    }
    
    /**
     * Add player to connected players list (host only)
     * @param {string} playerId - The ID of the player to add
     */
    addPlayerToList(playerId) {
        const playersList = document.getElementById('connected-players-list');
        if (!playersList) return;
        
        // Assign a color to the player if not already assigned
        if (!this.assignedColors.has(playerId)) {
            // Get next available color
            const usedColors = Array.from(this.assignedColors.values());
            const availableColor = this.playerColors.find(color => !usedColors.includes(color)) || 
                                  this.playerColors[Math.floor(Math.random() * this.playerColors.length)];
            
            // Assign the color
            this.assignedColors.set(playerId, availableColor);
        }
        
        const playerColor = this.assignedColors.get(playerId);
        
        // Create player item with color indicator
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.id = `player-${playerId}`;
        
        // Add color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'player-color-indicator';
        colorIndicator.style.backgroundColor = playerColor;
        playerItem.appendChild(colorIndicator);
        
        // Add player name
        const playerName = document.createElement('span');
        playerName.textContent = `Player ${playerId.substring(0, 8)}`;
        playerItem.appendChild(playerName);
        
        playersList.appendChild(playerItem);
        
        // Notify other peers about the new player and their color
        this.peers.forEach(conn => {
            conn.send({
                type: 'playerJoined',
                playerId: playerId,
                playerColor: playerColor
            });
        });
    }
    
    /**
     * Remove player from connected players list (host only)
     * @param {string} playerId - The ID of the player to remove
     */
    removePlayerFromList(playerId) {
        const playerItem = document.getElementById(`player-${playerId}`);
        if (playerItem) {
            playerItem.remove();
        }
    }
    
    /**
     * Update connection status
     * @param {string} message - The status message
     */
    updateConnectionStatus(message) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    /**
     * Generate QR code for connection
     * @param {string} data - The data to encode in the QR code
     */
    async generateQRCode(data) {
        const qrContainer = document.getElementById('qr-code');
        if (!qrContainer) return;
        
        try {
            // Load QRCode.js library if not already loaded
            if (typeof QRCode === 'undefined') {
                await this.loadQRCodeJS();
            }
            
            // Clear previous QR code
            qrContainer.innerHTML = '';
            
            // Generate new QR code
            new QRCode(qrContainer, {
                text: data,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrContainer.textContent = `Connection code: ${data}`;
            qrContainer.style.padding = '20px';
            qrContainer.style.textAlign = 'center';
            qrContainer.style.fontFamily = 'monospace';
        }
    }
    
    /**
     * Load QRCode.js library
     * @returns {Promise} A promise that resolves when QRCode.js is loaded
     */
    loadQRCodeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load QRCode.js'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Copy connection code to clipboard
     */
    copyConnectionCode() {
        const codeElement = document.getElementById('connection-code');
        if (!codeElement || !this.roomId) return;
        
        try {
            navigator.clipboard.writeText(this.roomId).then(() => {
                // Show success message
                this.updateConnectionStatus('Connection code copied to clipboard!');
                
                // Highlight the code element briefly
                codeElement.classList.add('copied');
                setTimeout(() => {
                    codeElement.classList.remove('copied');
                }, 1000);
            });
        } catch (error) {
            console.error('Failed to copy code:', error);
            this.updateConnectionStatus('Failed to copy code. Please copy it manually.');
        }
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
     * Send player data to host (member only)
     */
    sendPlayerData() {
        if (this.isHost || !this.isConnected) {
            // Silent return for host or not connected
            return;
        }
        
        if (!this.game.player) {
            console.log('[MultiplayerManager] Cannot send player data: game.player is null');
            return;
        }
        
        if (!this.game.player.model) {
            console.log('[MultiplayerManager] Cannot send player data: game.player.model is null');
            return;
        }
        
        const hostConn = this.peers.get(this.hostId);
        if (!hostConn) {
            console.log('[MultiplayerManager] Cannot send player data: no connection to host');
            return;
        }
        
        // Get player position and rotation
        const position = {
            x: this.game.player.model.position.x,
            y: this.game.player.model.position.y,
            z: this.game.player.model.position.z
        };
        
        const rotation = {
            x: this.game.player.model.rotation.x,
            y: this.game.player.model.rotation.y,
            z: this.game.player.model.rotation.z
        };
        
        const animation = this.game.player.currentAnimation;
        
        console.log('[MultiplayerManager] Member sending player data to host:', 
                    'Position:', position, 
                    'Animation:', animation);
        
        // Send to host
        hostConn.send({
            type: 'playerPosition',
            position,
            rotation,
            animation
        });
    }
    
    /**
     * Broadcast game state to all members (host only)
     */
    broadcastGameState() {
        if (!this.isHost || !this.game.player) {
            console.log('[MultiplayerManager] Not broadcasting: isHost=', this.isHost, 
                        'game.player exists=', !!this.game.player);
            return;
        }
        
        console.log('[MultiplayerManager] Broadcasting game state to', this.peers.size, 'peers');
        
        // Collect player data
        const players = {};
        
        // Add host player - check if model exists before accessing its properties
        if (this.game.player.model && this.game.player.model.position && this.game.player.model.rotation) {
            players[this.peer.id] = {
                position: {
                    x: this.game.player.model.position.x,
                    y: this.game.player.model.position.y,
                    z: this.game.player.model.position.z
                },
                rotation: {
                    x: this.game.player.model.rotation.x,
                    y: this.game.player.model.rotation.y,
                    z: this.game.player.model.rotation.z
                },
                animation: this.game.player.currentAnimation
            };
            console.log('[MultiplayerManager] Host player data:', 
                        'Position:', players[this.peer.id].position,
                        'Animation:', this.game.player.currentAnimation);
        } else {
            // Provide default values if model is not available
            players[this.peer.id] = {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                animation: 'idle'
            };
            console.warn('[MultiplayerManager] Player model not fully initialized when broadcasting game state');
        }
        
        // Add remote players
        this.remotePlayerManager.getPlayers().forEach((player, peerId) => {
            players[peerId] = {
                position: {
                    x: player.group.position.x,
                    y: player.group.position.y,
                    z: player.group.position.z
                },
                rotation: player.model ? {
                    x: player.model.rotation.x,
                    y: player.model.rotation.y,
                    z: player.model.rotation.z
                } : { x: 0, y: 0, z: 0 },
                animation: player.currentAnimation
            };
        });
        
        // Collect enemy data (if enemy manager has the method)
        let enemies = {};
        if (this.game.enemyManager && typeof this.game.enemyManager.getSerializableEnemyData === 'function') {
            enemies = this.game.enemyManager.getSerializableEnemyData();
        }
        
        // Create game state packet
        const gameState = {
            type: 'gameState',
            players,
            enemies
        };
        
        // Send to all peers
        this.peers.forEach(conn => {
            conn.send(gameState);
        });
    }
    
    /**
     * Update method called every frame
     * @param {number} deltaTime - Time elapsed since the last frame
     */
    update(deltaTime) {
        // Log update status occasionally (every 3 seconds)
        const now = Date.now();
        if (!this._lastUpdateLog || now - this._lastUpdateLog > 3000) {
            console.log('[MultiplayerManager] Update called - isHost:', this.isHost, 
                        'isConnected:', this.isConnected, 
                        'peers:', this.peers.size,
                        'game state:', this.game.state ? (this.game.state.isRunning() ? 'running' : 'not running') : 'unknown');
            this._lastUpdateLog = now;
        }
        
        // Update remote players
        if (this.remotePlayerManager) {
            this.remotePlayerManager.update(deltaTime);
        }
        
        // If connected as member, send player data to host
        if (!this.isHost && this.isConnected) {
            // Check if game is running
            if (this.game.state && this.game.state.isRunning()) {
                this.sendPlayerData();
            } else {
                // Log this issue occasionally
                if (!this._lastGameStateLog || now - this._lastGameStateLog > 3000) {
                    console.log('[MultiplayerManager] Member not sending data because game is not running');
                    this._lastGameStateLog = now;
                }
            }
        }
        
        // If host, broadcast game state to members
        if (this.isHost && this.peers.size > 0) {
            // Throttle broadcasts to 10-20 times per second
            if (!this._lastBroadcast || Date.now() - this._lastBroadcast > 50) {
                this.broadcastGameState();
                this._lastBroadcast = Date.now();
            }
        }
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