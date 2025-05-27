/**
 * MultiplayerUIManager.js
 * Handles all UI-related functionality for multiplayer
 * Including host/join UI, QR code generation/scanning, and connection status
 */

export class MultiplayerUIManager {
    /**
     * Initialize the multiplayer UI manager
     * @param {MultiplayerManager} multiplayerManager - Reference to the main multiplayer manager
     */
    constructor(multiplayerManager) {
        this.multiplayerManager = multiplayerManager;
        this.qrCodeScanner = null;
    }

    /**
     * Initialize the UI manager
     */
    init() {
        // Set up UI event listeners
        this.setupUIListeners();
        return true;
    }

    /**
     * Set up UI event listeners for multiplayer buttons
     */
    setupUIListeners() {
        // Multiplayer button (in game menu)
        const multiplayerButton = document.getElementById('multiplayer-button');
        if (multiplayerButton) {
            multiplayerButton.addEventListener('click', () => this.showMultiplayerModal());
        }
        
        // Host game button
        const hostGameBtn = document.getElementById('host-game-btn');
        if (hostGameBtn) {
            hostGameBtn.addEventListener('click', () => {
                this.showHostUI();
                this.multiplayerManager.hostGame();
            });
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
                if (code) {
                    this.updateConnectionStatus('Connecting...', 'join-connection-status');
                    this.multiplayerManager.joinGame(code);
                } else {
                    this.updateConnectionStatus('Please enter a connection code', 'join-connection-status');
                }
            });
        }
        
        // Start game button (for host)
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.multiplayerManager.startMultiplayerGame());
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
                    this.updateConnectionStatus('Failed to paste from clipboard. Please enter code manually.', 'join-connection-status');
                }
            });
        }
        
        // QR Scanner toggle button
        const toggleScanBtn = document.getElementById('toggle-scan-btn');
        if (toggleScanBtn) {
            toggleScanBtn.addEventListener('click', () => {
                if (this.qrCodeScanner) {
                    this.stopQRScanner();
                } else {
                    this.startQRScanner();
                }
            });
        }
        
        // Back buttons
        const backFromHostBtn = document.getElementById('back-from-host-btn');
        if (backFromHostBtn) {
            backFromHostBtn.addEventListener('click', () => this.showMultiplayerModal());
        }
        
        const backFromJoinBtn = document.getElementById('back-from-join-btn');
        if (backFromJoinBtn) {
            backFromJoinBtn.addEventListener('click', () => {
                this.stopQRScanner();
                this.showMultiplayerModal();
            });
        }
        
        const leaveGameBtn = document.getElementById('leave-game-btn');
        if (leaveGameBtn) {
            leaveGameBtn.addEventListener('click', () => {
                this.multiplayerManager.leaveGame();
                this.showMultiplayerModal();
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
            
            // Show initial screen, hide others
            document.getElementById('multiplayer-initial-screen').style.display = 'block';
            document.getElementById('host-game-screen').style.display = 'none';
            document.getElementById('join-game-screen').style.display = 'none';
            document.getElementById('player-waiting-screen').style.display = 'none';
            
            // Reset connection status
            const statusElements = document.querySelectorAll('.connection-status');
            statusElements.forEach(el => el.textContent = '');
        }
    }

    /**
     * Close the multiplayer modal
     */
    closeMultiplayerModal() {
        const modal = document.getElementById('multiplayer-modal');
        if (modal) {
            modal.style.display = 'none';
            
            // Stop QR scanner if active
            this.stopQRScanner();
        }
    }

    /**
     * Show the host UI
     */
    showHostUI() {
        // Hide initial screen, show host screen
        document.getElementById('multiplayer-initial-screen').style.display = 'none';
        document.getElementById('host-game-screen').style.display = 'flex';
        document.getElementById('join-game-screen').style.display = 'none';
        document.getElementById('player-waiting-screen').style.display = 'none';
        
        // Set up back button
        const backButton = document.getElementById('back-from-host-btn');
        if (backButton) {
            backButton.onclick = () => {
                this.showMultiplayerModal();
            };
        }
    }

    /**
     * Show the join UI
     */
    async showJoinUI() {
        // Hide initial screen, show join screen
        document.getElementById('multiplayer-initial-screen').style.display = 'none';
        document.getElementById('host-game-screen').style.display = 'none';
        document.getElementById('join-game-screen').style.display = 'flex';
        document.getElementById('player-waiting-screen').style.display = 'none';
        
        // Set up back button
        const backButton = document.getElementById('back-from-join-btn');
        if (backButton) {
            backButton.onclick = () => {
                this.stopQRScanner();
                this.showMultiplayerModal();
            };
        }
        
        // Initialize QR scanner
        try {
            // Load HTML5-QRCode library if not already loaded
            if (typeof Html5Qrcode === 'undefined') {
                await this.loadQRScannerJS();
            }
            
            // Start scanner automatically
            this.startQRScanner();
            
            this.updateConnectionStatus('Scan a QR code or enter connection code manually', 'join-connection-status');
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            this.updateConnectionStatus('QR scanner not available. Please enter connection code manually.', 'join-connection-status');
        }
    }
    
    /**
     * Show the player waiting screen (after joining a game)
     */
    showPlayerWaitingScreen() {
        // Hide other screens, show waiting screen
        document.getElementById('multiplayer-initial-screen').style.display = 'none';
        document.getElementById('host-game-screen').style.display = 'none';
        document.getElementById('join-game-screen').style.display = 'none';
        document.getElementById('player-waiting-screen').style.display = 'flex';
        
        // Set up leave button
        const leaveButton = document.getElementById('leave-game-btn');
        if (leaveButton) {
            leaveButton.onclick = () => {
                // Disconnect from game
                this.multiplayerManager.leaveGame();
                this.showMultiplayerModal();
            };
        }
        
        this.updateConnectionStatus('Connected to host. Waiting for game to start...', 'player-connection-status');
    }
    
    /**
     * Start the QR scanner
     */
    startQRScanner() {
        if (typeof Html5Qrcode === 'undefined') {
            this.updateConnectionStatus('QR scanner library not loaded. Please enter code manually.', 'join-connection-status');
            return;
        }
        
        try {
            this.qrCodeScanner = new Html5Qrcode('qr-scanner-view');
            this.qrCodeScanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    // Stop scanning and join game with the decoded text
                    this.stopQRScanner();
                    this.updateConnectionStatus('Connecting...', 'join-connection-status');
                    this.multiplayerManager.joinGame(decodedText);
                },
                (errorMessage) => {
                    // Handle scan errors silently
                }
            ).catch(err => {
                this.updateConnectionStatus('Error starting camera: ' + err, 'join-connection-status');
            });
            
            // Update toggle button text
            const toggleButton = document.getElementById('toggle-scan-btn');
            if (toggleButton) {
                toggleButton.textContent = 'Stop Camera';
                toggleButton.onclick = () => this.stopQRScanner();
            }
        } catch (error) {
            console.error('Error starting QR scanner:', error);
            this.updateConnectionStatus('Failed to start camera. Please enter code manually.', 'join-connection-status');
        }
    }
    
    /**
     * Stop the QR scanner
     */
    stopQRScanner() {
        if (this.qrCodeScanner) {
            this.qrCodeScanner.stop().catch(err => {
                console.error('Error stopping camera:', err);
            });
            this.qrCodeScanner = null;
            
            // Update toggle button text
            const toggleButton = document.getElementById('toggle-scan-btn');
            if (toggleButton) {
                toggleButton.textContent = 'Start Camera';
                toggleButton.onclick = () => this.startQRScanner();
            }
        }
    }

    /**
     * Update connection status
     * @param {string} message - The status message
     * @param {string} [elementId='host-connection-status'] - The ID of the status element to update
     */
    updateConnectionStatus(message, elementId = 'host-connection-status') {
        const statusElement = document.getElementById(elementId);
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
        }
    }

    /**
     * Copy connection code to clipboard
     */
    copyConnectionCode() {
        const codeElement = document.getElementById('connection-code');
        if (!codeElement) {
            console.error('Connection code element not found');
            return;
        }
        
        // Get the room ID from the connection manager
        const roomId = this.multiplayerManager.connection && this.multiplayerManager.connection.roomId;
        if (!roomId) {
            console.error('No room ID available to copy');
            this.updateConnectionStatus('No connection code available', 'host-connection-status');
            return;
        }
        
        // Make sure the connection code element has the roomId text
        if (codeElement.textContent !== roomId) {
            codeElement.textContent = roomId;
        }
        
        try {
            // Use the Clipboard API with proper error handling
            navigator.clipboard.writeText(roomId)
                .then(() => {
                    // Show success message
                    this.updateConnectionStatus('Connection code copied to clipboard!', 'host-connection-status');
                    
                    // Highlight the code element briefly
                    codeElement.classList.add('copied');
                    setTimeout(() => {
                        codeElement.classList.remove('copied');
                    }, 1000);
                })
                .catch(err => {
                    console.error('Clipboard write failed:', err);
                    this.updateConnectionStatus('Failed to copy code. Please copy it manually.', 'host-connection-status');
                });
        } catch (error) {
            console.error('Failed to copy code:', error);
            this.updateConnectionStatus('Failed to copy code. Please copy it manually.', 'host-connection-status');
        }
    }
    
    /**
     * Set player color in the waiting screen
     * @param {string} color - The color assigned to the player
     */
    setPlayerColor(color) {
        const colorIndicator = document.getElementById('player-color-indicator');
        if (colorIndicator) {
            colorIndicator.style.backgroundColor = color;
        }
    }

    /**
     * Add player to connected players list (host only)
     * @param {string} playerId - The ID of the player to add
     * @param {string} playerColor - The color assigned to the player
     */
    addPlayerToList(playerId, playerColor) {
        const playersList = document.getElementById('connected-players-list');
        if (!playersList) return;
        
        // Create player item
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.id = `player-${playerId}`;
        
        // Create player color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'player-color-indicator';
        colorIndicator.style.backgroundColor = playerColor;
        
        // Create player name span
        const playerName = document.createElement('span');
        playerName.textContent = `Player ${playerId.substring(0, 8)}`;
        
        // Append elements
        playerItem.appendChild(colorIndicator);
        playerItem.appendChild(playerName);
        playersList.appendChild(playerItem);
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
     * Update host entry in the player list
     * @param {string} hostId - The ID of the host
     * @param {string} hostColor - The color assigned to the host
     */
    updateHostEntry(hostId, hostColor) {
        const hostEntry = document.querySelector('.connected-players-list .host-player .player-color-indicator');
        if (hostEntry) {
            hostEntry.style.backgroundColor = hostColor;
        }
    }

    /**
     * Enable or disable the start game button
     * @param {boolean} enabled - Whether the button should be enabled
     */
    setStartButtonEnabled(enabled) {
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.disabled = !enabled;
        }
    }

    /**
     * Display the connection code
     * @param {string} code - The connection code to display
     */
    displayConnectionCode(code) {
        const codeElement = document.getElementById('connection-code');
        if (codeElement) {
            codeElement.textContent = code;
            
            // Make sure the copy button is visible and working
            const copyBtn = document.getElementById('copy-code-btn');
            if (copyBtn) {
                copyBtn.style.display = 'inline-block';
                copyBtn.onclick = () => this.copyConnectionCode();
            }
            
            // Also make the connection code element clickable
            codeElement.style.cursor = 'pointer';
            codeElement.onclick = () => this.copyConnectionCode();
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
}