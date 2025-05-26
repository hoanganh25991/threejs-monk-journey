/**
 * MultiplayerManager.js
 * Manages WebRTC peer connections for multiplayer functionality without a server
 */

import { QRCodeGenerator } from './QRCodeGenerator.js';
import { PeerConnection } from './PeerConnection.js';
import { RemotePlayerManager } from './RemotePlayerManager.js';

export class MultiplayerManager {
    /**
     * Initialize the multiplayer manager
     * @param {Game} game - The main game instance
     */
    constructor(game) {
        this.game = game;
        this.isHost = false;
        this.connections = new Map(); // Map of peer connections
        this.qrCodeGenerator = new QRCodeGenerator();
        this.remotePlayerManager = new RemotePlayerManager(game);
        this.localPlayerId = this.generatePlayerId();
        this.isConnected = false;
        
        // Bind methods
        this.handleConnectionOpen = this.handleConnectionOpen.bind(this);
        this.handleConnectionClose = this.handleConnectionClose.bind(this);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.sendPlayerData = this.sendPlayerData.bind(this);
        this.createHostSession = this.createHostSession.bind(this);
        this.joinSession = this.joinSession.bind(this);
        
        // Setup UI elements
        this.setupUI();
    }
    
    /**
     * Initialize the multiplayer system
     */
    async init() {
        console.debug('Initializing multiplayer system...');
        
        // Add multiplayer button to the UI
        this.addMultiplayerButton();
        
        // Setup event listeners for the game
        this.setupEventListeners();
        
        return true;
    }
    
    /**
     * Generate a unique player ID
     * @returns {string} A unique player ID
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Setup UI elements for multiplayer
     */
    setupUI() {
        // Create multiplayer modal container if it doesn't exist
        if (!document.getElementById('multiplayer-modal')) {
            const modalContainer = document.createElement('div');
            modalContainer.id = 'multiplayer-modal';
            modalContainer.className = 'game-menu';
            modalContainer.style.display = 'none';
            
            modalContainer.innerHTML = `
                <div class="multiplayer-modal-content">
                    <h2>Multiplayer</h2>
                    <div class="multiplayer-options">
                        <button id="host-game-btn" class="menu-button">Host Game</button>
                        <button id="join-game-btn" class="menu-button">Join Game</button>
                        <button id="close-multiplayer-btn" class="menu-button">Close</button>
                    </div>
                    <div id="qr-container" style="display: none;">
                        <div id="qr-code"></div>
                        <p>Scan this QR code with another device to join the game</p>
                    </div>
                    <div id="qr-scanner-container" style="display: none;">
                        <div id="qr-scanner"></div>
                        <p>Scan a QR code to join a game</p>
                    </div>
                    <div id="connection-status"></div>
                </div>
            `;
            
            document.body.appendChild(modalContainer);
            
            // Add event listeners for buttons
            document.getElementById('host-game-btn').addEventListener('click', this.createHostSession);
            document.getElementById('join-game-btn').addEventListener('click', this.showQRScanner.bind(this));
            document.getElementById('close-multiplayer-btn').addEventListener('click', () => {
                document.getElementById('multiplayer-modal').style.display = 'none';
            });
        }
        
        // Add CSS for multiplayer UI
        if (!document.getElementById('multiplayer-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'multiplayer-styles';
            styleElement.textContent = `
                #multiplayer-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .multiplayer-modal-content {
                    background-color: #2a2a2a;
                    border-radius: 10px;
                    padding: 20px;
                    width: 80%;
                    max-width: 500px;
                    text-align: center;
                }
                
                #qr-container, #qr-scanner-container {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                #qr-code, #qr-scanner {
                    width: 256px;
                    height: 256px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 10px;
                    border-radius: 5px;
                }
                
                #connection-status {
                    margin-top: 20px;
                    font-weight: bold;
                }
                
                #multiplayer-button {
                    margin-left: 10px;
                }
                
                .connected-players {
                    margin-top: 10px;
                    text-align: left;
                    max-height: 100px;
                    overflow-y: auto;
                }
                
                .player-item {
                    padding: 5px;
                    border-bottom: 1px solid #444;
                }
            `;
            document.head.appendChild(styleElement);
        }
    }
    
    /**
     * Add multiplayer button to the top-right UI
     */
    addMultiplayerButton() {
        const topRightContainer = document.getElementById('top-right-container');
        if (topRightContainer) {
            // Create multiplayer button if it doesn't exist
            if (!document.getElementById('multiplayer-button')) {
                const multiplayerButton = document.createElement('button');
                multiplayerButton.id = 'multiplayer-button';
                multiplayerButton.className = 'circle-btn';
                multiplayerButton.title = 'Multiplayer';
                multiplayerButton.innerHTML = '👥';
                multiplayerButton.addEventListener('click', this.showMultiplayerModal.bind(this));
                
                // Insert after home button
                topRightContainer.appendChild(multiplayerButton);
            }
        }
    }
    
    /**
     * Show the multiplayer modal
     */
    showMultiplayerModal() {
        const modal = document.getElementById('multiplayer-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Hide QR containers
            document.getElementById('qr-container').style.display = 'none';
            document.getElementById('qr-scanner-container').style.display = 'none';
            
            // Update connection status
            this.updateConnectionStatus();
        }
    }
    
    /**
     * Update the connection status display
     */
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            if (this.isConnected) {
                statusElement.innerHTML = `
                    <div style="color: green;">Connected</div>
                    <div>Players online: ${this.connections.size + 1}</div>
                    <div class="connected-players">
                        <div class="player-item">You (${this.isHost ? 'Host' : 'Guest'})</div>
                        ${Array.from(this.connections.keys()).map(id => 
                            `<div class="player-item">${id}</div>`
                        ).join('')}
                    </div>
                `;
            } else {
                statusElement.textContent = 'Not connected';
            }
        }
    }
    
    /**
     * Create a host session and generate QR code
     */
    async createHostSession() {
        try {
            this.isHost = true;
            
            // Generate session data with the current URL
            const sessionData = {
                host: this.localPlayerId,
                url: window.location.href
            };
            
            // Generate QR code
            const qrCodeElement = document.getElementById('qr-code');
            await this.qrCodeGenerator.generateQRCode(JSON.stringify(sessionData), qrCodeElement);
            
            // Show QR container
            document.getElementById('qr-container').style.display = 'block';
            document.getElementById('qr-scanner-container').style.display = 'none';
            
            // Update status
            document.getElementById('connection-status').textContent = 'Waiting for players to join...';
            
            // Setup as host (listening for incoming connections)
            this.setupAsHost();
        } catch (error) {
            console.error('Error creating host session:', error);
            document.getElementById('connection-status').textContent = 'Error creating host session: ' + error.message;
        }
    }
    
    /**
     * Setup as host to accept incoming connections
     */
    setupAsHost() {
        // In a real implementation, we would need a signaling mechanism
        // For now, we'll use a simple approach where the host creates a PeerConnection
        // and waits for connections through the QR code
        
        // The actual connection will happen when someone scans the QR code
        // and calls joinSession with the session data
    }
    
    /**
     * Show QR scanner to join a game
     */
    async showQRScanner() {
        try {
            // Show QR scanner container
            document.getElementById('qr-container').style.display = 'none';
            document.getElementById('qr-scanner-container').style.display = 'block';
            
            // Initialize QR scanner
            const scannerElement = document.getElementById('qr-scanner');
            await this.qrCodeGenerator.initQRScanner(scannerElement, this.handleQRScan.bind(this));
            
            // Update status
            document.getElementById('connection-status').textContent = 'Scanning for QR code...';
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            document.getElementById('connection-status').textContent = 'Error initializing scanner: ' + error.message;
        }
    }
    
    /**
     * Handle QR code scan result
     * @param {string} result - The scanned QR code data
     */
    handleQRScan(result) {
        try {
            // Parse session data from QR code
            const sessionData = JSON.parse(result);
            
            // Join the session
            this.joinSession(sessionData);
            
            // Stop scanner
            this.qrCodeGenerator.stopQRScanner();
            
            // Hide scanner container
            document.getElementById('qr-scanner-container').style.display = 'none';
        } catch (error) {
            console.error('Error processing QR code:', error);
            document.getElementById('connection-status').textContent = 'Invalid QR code: ' + error.message;
        }
    }
    
    /**
     * Join an existing session
     * @param {Object} sessionData - The session data from the QR code
     */
    async joinSession(sessionData) {
        try {
            this.isHost = false;
            
            // Check if we need to navigate to a different URL
            if (sessionData.url && sessionData.url !== window.location.href) {
                // If the URL is different, navigate to it
                window.location.href = sessionData.url;
                return; // The rest will happen after navigation
            }
            
            // Create peer connection to the host
            const hostConnection = new PeerConnection(sessionData.host, this.localPlayerId);
            
            // Set up event handlers
            hostConnection.onOpen = () => this.handleConnectionOpen(sessionData.host, hostConnection);
            hostConnection.onClose = () => this.handleConnectionClose(sessionData.host);
            hostConnection.onData = (data) => this.handleDataReceived(sessionData.host, data);
            
            // Connect to the host
            await hostConnection.connect();
            
            // Add to connections map
            this.connections.set(sessionData.host, hostConnection);
            
            // Update status
            document.getElementById('connection-status').textContent = 'Connecting to host...';
        } catch (error) {
            console.error('Error joining session:', error);
            document.getElementById('connection-status').textContent = 'Error joining session: ' + error.message;
        }
    }
    
    /**
     * Handle new connection open
     * @param {string} peerId - The ID of the connected peer
     * @param {PeerConnection} connection - The peer connection
     */
    handleConnectionOpen(peerId, connection) {
        console.debug(`Connection established with peer: ${peerId}`);
        
        // Set connected flag
        this.isConnected = true;
        
        // If we're the host, broadcast to all other peers about the new connection
        if (this.isHost) {
            this.broadcastNewPeer(peerId);
        }
        
        // Send initial player data
        this.sendPlayerData();
        
        // Update UI
        this.updateConnectionStatus();
    }
    
    /**
     * Handle connection close
     * @param {string} peerId - The ID of the disconnected peer
     */
    handleConnectionClose(peerId) {
        console.debug(`Connection closed with peer: ${peerId}`);
        
        // Remove from connections
        this.connections.delete(peerId);
        
        // Remove remote player
        this.remotePlayerManager.removePlayer(peerId);
        
        // Update connected flag if no more connections
        if (this.connections.size === 0) {
            this.isConnected = false;
        }
        
        // If we're the host, broadcast to all other peers about the disconnection
        if (this.isHost) {
            this.broadcastPeerDisconnect(peerId);
        }
        
        // Update UI
        this.updateConnectionStatus();
    }
    
    /**
     * Handle data received from a peer
     * @param {string} peerId - The ID of the peer that sent the data
     * @param {Object} data - The received data
     */
    handleDataReceived(peerId, data) {
        // Process different types of messages
        switch (data.type) {
            case 'player_data':
                // Update remote player position and state
                this.remotePlayerManager.updatePlayer(peerId, data.position, data.rotation, data.animation);
                break;
                
            case 'new_peer':
                // A new peer has joined (host is informing us)
                if (!this.isHost && data.peerId !== this.localPlayerId) {
                    this.connectToPeer(data.peerId);
                }
                break;
                
            case 'peer_disconnect':
                // A peer has disconnected (host is informing us)
                if (!this.isHost) {
                    this.connections.delete(data.peerId);
                    this.remotePlayerManager.removePlayer(data.peerId);
                    this.updateConnectionStatus();
                }
                break;
                
            default:
                console.warn(`Unknown message type received: ${data.type}`);
        }
    }
    
    /**
     * Broadcast information about a new peer to all connected peers
     * @param {string} newPeerId - The ID of the new peer
     */
    broadcastNewPeer(newPeerId) {
        if (!this.isHost) return;
        
        const message = {
            type: 'new_peer',
            peerId: newPeerId
        };
        
        // Send to all peers except the new one
        this.connections.forEach((connection, peerId) => {
            if (peerId !== newPeerId) {
                connection.send(message);
            }
        });
    }
    
    /**
     * Broadcast information about a disconnected peer to all connected peers
     * @param {string} disconnectedPeerId - The ID of the disconnected peer
     */
    broadcastPeerDisconnect(disconnectedPeerId) {
        if (!this.isHost) return;
        
        const message = {
            type: 'peer_disconnect',
            peerId: disconnectedPeerId
        };
        
        // Send to all remaining peers
        this.connections.forEach(connection => {
            connection.send(message);
        });
    }
    
    /**
     * Connect to a specific peer (used when a new peer joins and the host informs everyone)
     * @param {string} peerId - The ID of the peer to connect to
     */
    async connectToPeer(peerId) {
        try {
            // Create peer connection
            const peerConnection = new PeerConnection(peerId, this.localPlayerId);
            
            // Set up event handlers
            peerConnection.onOpen = () => this.handleConnectionOpen(peerId, peerConnection);
            peerConnection.onClose = () => this.handleConnectionClose(peerId);
            peerConnection.onData = (data) => this.handleDataReceived(peerId, data);
            
            // Connect to the peer
            await peerConnection.connect();
            
            // Add to connections map
            this.connections.set(peerId, peerConnection);
        } catch (error) {
            console.error(`Error connecting to peer ${peerId}:`, error);
        }
    }
    
    /**
     * Send local player data to all connected peers
     */
    sendPlayerData() {
        if (!this.isConnected || !this.game.player) return;
        
        // Get player position and rotation
        const position = this.game.player.getPosition();
        const rotation = this.game.player.getRotation();
        const currentAnimation = this.game.player.getCurrentAnimation();
        
        // Create message
        const message = {
            type: 'player_data',
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z
            },
            animation: currentAnimation
        };
        
        // Send to all connected peers
        this.connections.forEach(connection => {
            connection.send(message);
        });
    }
    
    /**
     * Setup event listeners for the game
     */
    setupEventListeners() {
        // Send player data periodically
        setInterval(this.sendPlayerData, 100); // 10 times per second
    }
    
    /**
     * Update method called every frame
     * @param {number} deltaTime - Time elapsed since the last frame
     */
    update(deltaTime) {
        // Update remote players
        this.remotePlayerManager.update(deltaTime);
    }
}