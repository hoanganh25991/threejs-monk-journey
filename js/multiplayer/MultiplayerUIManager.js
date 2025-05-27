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
        this.availableCameras = [];
        this.selectedCameraId = null;
    }

    /**
     * Initialize the UI manager
     */
    async init() {
        // Set up UI event listeners
        this.setupUIListeners();
        
        // Check URL parameters for direct join
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('join') === 'true' && urlParams.get('connect-id')) {
            // Get the connection ID from URL
            const connectId = urlParams.get('connect-id');
            console.debug('Direct join detected with connection ID:', connectId);
            
            // Show multiplayer modal and join UI
            this.showMultiplayerModal();
            await this.showJoinUI();
            
            // Auto-fill the connection code
            const input = document.getElementById('manual-connection-input');
            if (input) {
                input.value = connectId;
            }
            
            // Auto-connect after a short delay
            setTimeout(() => {
                this.updateConnectionStatus('Connecting...', 'join-connection-status');
                this.multiplayerManager.joinGame(connectId);
            }, 500);
        }
        
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
        
        // Tab buttons for join screen
        const scanQrTabBtn = document.getElementById('scan-qr-tab-btn');
        const manualCodeTabBtn = document.getElementById('manual-code-tab-btn');
        
        if (scanQrTabBtn && manualCodeTabBtn) {
            // These are set up in showJoinUI() but adding here for completeness
            scanQrTabBtn.addEventListener('click', () => {
                scanQrTabBtn.classList.add('active');
                manualCodeTabBtn.classList.remove('active');
                document.getElementById('scan-qr-tab').classList.add('active');
                document.getElementById('manual-code-tab').classList.remove('active');
            });
            
            manualCodeTabBtn.addEventListener('click', () => {
                manualCodeTabBtn.classList.add('active');
                scanQrTabBtn.classList.remove('active');
                document.getElementById('manual-code-tab').classList.add('active');
                document.getElementById('scan-qr-tab').classList.remove('active');
                
                // Stop scanner when switching to manual tab
                this.stopQRScanner();
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
        
        // Quick connect button in QR scanner tab
        const quickConnectBtn = document.getElementById('quick-connect-btn');
        if (quickConnectBtn) {
            quickConnectBtn.addEventListener('click', () => {
                const code = document.getElementById('quick-connection-input').value;
                if (code) {
                    this.updateConnectionStatus('Connecting...', 'join-connection-status');
                    this.multiplayerManager.joinGame(code);
                } else {
                    this.updateConnectionStatus('Please enter a connection code', 'join-connection-status');
                }
            });
        }
        
        // Quick connection input field - allow Enter key to connect
        const quickConnectionInput = document.getElementById('quick-connection-input');
        if (quickConnectionInput) {
            quickConnectionInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const code = quickConnectionInput.value;
                    if (code) {
                        this.updateConnectionStatus('Connecting...', 'join-connection-status');
                        this.multiplayerManager.joinGame(code);
                    } else {
                        this.updateConnectionStatus('Please enter a connection code', 'join-connection-status');
                    }
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
        const modal = document.getElementById('multiplayer-menu');
        if (modal) {
            modal.style.display = 'flex';
            
            // Show initial screen, hide others
            document.getElementById('multiplayer-initial-screen').style.display = 'flex';
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
        const modal = document.getElementById('multiplayer-menu');
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
        
        // Set up tab switching
        const scanQrTabBtn = document.getElementById('scan-qr-tab-btn');
        const manualCodeTabBtn = document.getElementById('manual-code-tab-btn');
        const scanQrTab = document.getElementById('scan-qr-tab');
        const manualCodeTab = document.getElementById('manual-code-tab');
        
        if (scanQrTabBtn && manualCodeTabBtn) {
            scanQrTabBtn.addEventListener('click', () => {
                scanQrTabBtn.classList.add('active');
                manualCodeTabBtn.classList.remove('active');
                scanQrTab.classList.add('active');
                manualCodeTab.classList.remove('active');
            });
            
            manualCodeTabBtn.addEventListener('click', () => {
                manualCodeTabBtn.classList.add('active');
                scanQrTabBtn.classList.remove('active');
                manualCodeTab.classList.add('active');
                scanQrTab.classList.remove('active');
                
                // Stop scanner when switching to manual tab
                this.stopQRScanner();
            });
        }
        
        // Initialize QR scanner libraries but don't start automatically
        try {
            // Load HTML5-QRCode library if not already loaded
            if (typeof Html5Qrcode === 'undefined') {
                await this.loadQRScannerJS();
            }
            
            // Get available cameras and set up camera selection
            await this.getAvailableCameras();
            
            // Update toggle button text to reflect current state
            const toggleButton = document.getElementById('toggle-scan-btn');
            if (toggleButton) {
                toggleButton.textContent = 'Start Camera';
                toggleButton.onclick = () => this.startQRScanner();
            }
            
            this.updateConnectionStatus('Select "Scan QR Code" and start camera, or enter code manually', 'join-connection-status');
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            this.updateConnectionStatus('QR scanner not available. Please enter connection code manually.', 'join-connection-status');
            
            // Switch to manual tab if camera is not available
            if (manualCodeTabBtn) {
                manualCodeTabBtn.click();
            }
        }
    }
    
    /**
     * Show the player waiting screen (after joining a game)
     */
    showPlayerWaitingScreen() {
        // Make sure QR scanner is stopped
        this.stopQRScanner();
        
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
     * Get available cameras
     * @returns {Promise<Array>} A promise that resolves with an array of camera devices
     */
    async getAvailableCameras() {
        if (typeof Html5Qrcode === 'undefined') {
            await this.loadQRScannerJS();
        }
        
        try {
            // Get available cameras using the Html5Qrcode API
            this.availableCameras = await Html5Qrcode.getCameras();
            console.debug('Available cameras:', this.availableCameras);
            
            // Populate the camera select dropdown
            const cameraSelect = document.getElementById('camera-select');
            if (cameraSelect) {
                // Clear existing options
                cameraSelect.innerHTML = '';
                
                // Add options for each camera
                this.availableCameras.forEach(camera => {
                    const option = document.createElement('option');
                    option.value = camera.id;
                    option.textContent = camera.label || `Camera ${camera.id.substring(0, 4)}`;
                    cameraSelect.appendChild(option);
                });
                
                // Show the select dropdown if we have multiple cameras
                if (this.availableCameras.length > 1) {
                    cameraSelect.style.display = 'block';
                    
                    // Set up event listener for camera selection
                    cameraSelect.onchange = (e) => {
                        this.selectedCameraId = e.target.value;
                        
                        // Restart scanner with new camera if it's currently running
                        if (this.qrCodeScanner) {
                            this.stopQRScanner();
                            this.startQRScanner();
                        }
                    };
                    
                    // Set initial selected camera (prefer back camera if available)
                    const backCamera = this.availableCameras.find(camera => 
                        camera.label && (
                            camera.label.toLowerCase().includes('back') || 
                            camera.label.toLowerCase().includes('rear') ||
                            camera.label.toLowerCase().includes('environment')
                        )
                    );
                    
                    if (backCamera) {
                        this.selectedCameraId = backCamera.id;
                        cameraSelect.value = backCamera.id;
                    } else if (this.availableCameras.length > 0) {
                        this.selectedCameraId = this.availableCameras[0].id;
                        cameraSelect.value = this.availableCameras[0].id;
                    }
                } else if (this.availableCameras.length === 1) {
                    // Only one camera available
                    this.selectedCameraId = this.availableCameras[0].id;
                    cameraSelect.style.display = 'none';
                }
            }
            
            return this.availableCameras;
        } catch (error) {
            console.error('Error getting cameras:', error);
            this.updateConnectionStatus('Could not access cameras. Please check permissions.', 'join-connection-status');
            return [];
        }
    }
    
    /**
     * Start the QR scanner
     */
    async startQRScanner() {
        if (typeof Html5Qrcode === 'undefined') {
            this.updateConnectionStatus('QR scanner library not loaded. Please enter code manually.', 'join-connection-status');
            return;
        }
        
        try {
            // Get available cameras if we haven't already
            if (this.availableCameras.length === 0) {
                await this.getAvailableCameras();
            }
            
            // Make sure we're on the scan QR tab
            const scanQrTabBtn = document.getElementById('scan-qr-tab-btn');
            if (scanQrTabBtn && !scanQrTabBtn.classList.contains('active')) {
                scanQrTabBtn.click();
            }
            
            // Create QR scanner instance
            this.qrCodeScanner = new Html5Qrcode('qr-scanner-view');
            
            // Configure camera settings
            let cameraConfig;
            
            if (this.selectedCameraId) {
                // Use selected camera ID if available
                cameraConfig = { deviceId: this.selectedCameraId };
            } else {
                // Fall back to environment facing camera
                cameraConfig = { facingMode: 'environment' };
            }
            
            // Start the scanner
            this.qrCodeScanner.start(
                cameraConfig,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Stop scanning immediately when QR code is detected
                    this.stopQRScanner();
                    this.updateConnectionStatus('QR code detected! Connecting...', 'join-connection-status');
                    
                    // Check if the decoded text is a URL with our parameters
                    let connectId = decodedText;
                    
                    try {
                        // Try to parse as URL
                        if (decodedText.includes('?join=true&connect-id=')) {
                            const url = new URL(decodedText);
                            const params = new URLSearchParams(url.search);
                            if (params.get('connect-id')) {
                                connectId = params.get('connect-id');
                                console.debug('Extracted connection ID from URL:', connectId);
                            }
                        }
                    } catch (e) {
                        console.debug('Not a URL, using as direct connection ID');
                    }
                    
                    // Auto-connect with the scanned connection ID
                    this.multiplayerManager.joinGame(connectId);
                },
                (errorMessage) => {
                    // Handle scan errors silently
                }
            ).catch(err => {
                this.updateConnectionStatus('Error starting camera: ' + err, 'join-connection-status');
            });
            
            // Hide the toggle button after starting the camera
            const toggleButton = document.getElementById('toggle-scan-btn');
            if (toggleButton) {
                toggleButton.style.display = 'none';
            }
            
            this.updateConnectionStatus('Camera active. Point at a QR code to connect.', 'join-connection-status');
        } catch (error) {
            console.error('Error starting QR scanner:', error);
            this.updateConnectionStatus('Failed to start camera. Please enter code manually.', 'join-connection-status');
            
            // Switch to manual tab if camera fails
            const manualCodeTabBtn = document.getElementById('manual-code-tab-btn');
            if (manualCodeTabBtn) {
                manualCodeTabBtn.click();
            }
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
            
            // Show toggle button again
            const toggleButton = document.getElementById('toggle-scan-btn');
            if (toggleButton) {
                toggleButton.textContent = 'Start Camera';
                toggleButton.onclick = () => this.startQRScanner();
                toggleButton.style.display = 'block';
            }
            
            // Keep camera select visible if we have multiple cameras
            const cameraSelect = document.getElementById('camera-select');
            if (cameraSelect && this.availableCameras.length > 1) {
                cameraSelect.style.display = 'block';
            }
            
            this.updateConnectionStatus('Camera stopped. Start camera to scan QR code or enter code manually.', 'join-connection-status');
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
            
            // Create a complete URL with the connection ID
            const fullUrl = `${window.location.href.split('?')[0]}?join=true&connect-id=${data}`;
            
            // Generate new QR code with the full URL
            new QRCode(qrContainer, {
                text: fullUrl,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Store the full URL for copying
            qrContainer.dataset.fullUrl = fullUrl;
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
        
        // Copy only the connection ID (roomId) to clipboard
        try {
            // Use the Clipboard API with proper error handling
            navigator.clipboard.writeText(roomId)
                .then(() => {
                    // Show success message
                    this.updateConnectionStatus('Connection ID copied to clipboard!', 'host-connection-status');
                    
                    // Highlight the code element briefly
                    codeElement.classList.add('copied');
                    setTimeout(() => {
                        codeElement.classList.remove('copied');
                    }, 1000);
                })
                .catch(err => {
                    console.error('Clipboard write failed:', err);
                    this.updateConnectionStatus('Failed to copy connection ID. Please copy it manually.', 'host-connection-status');
                });
        } catch (error) {
            console.error('Failed to copy connection ID:', error);
            this.updateConnectionStatus('Failed to copy connection ID. Please copy it manually.', 'host-connection-status');
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