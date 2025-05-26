/**
 * PeerConnection.js
 * Handles WebRTC peer connections for multiplayer functionality
 */

export class PeerConnection {
    /**
     * Initialize a peer connection
     * @param {string} peerId - The ID of the peer to connect to
     * @param {string} localId - The local peer ID
     */
    constructor(peerId, localId) {
        this.peerId = peerId;
        this.localId = localId;
        this.connection = null;
        this.dataChannel = null;
        this.isConnected = false;
        this.isInitiator = false;
        
        // Event callbacks
        this.onOpen = null;
        this.onClose = null;
        this.onData = null;
        
        // ICE servers configuration (STUN servers for NAT traversal)
        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        };
    }
    
    /**
     * Connect to the peer
     * @returns {Promise<void>} A promise that resolves when connected
     */
    async connect() {
        try {
            // Create RTCPeerConnection
            this.connection = new RTCPeerConnection(this.iceServers);
            
            // Set up event handlers
            this.setupConnectionHandlers();
            
            // Create data channel
            this.dataChannel = this.connection.createDataChannel('gameData', {
                ordered: false, // Allow out-of-order delivery for better performance
                maxRetransmits: 0 // Don't retransmit lost packets (for real-time data)
            });
            
            // Set up data channel handlers
            this.setupDataChannelHandlers();
            
            // Set as initiator
            this.isInitiator = true;
            
            // Create offer
            const offer = await this.connection.createOffer();
            await this.connection.setLocalDescription(offer);
            
            // In a real implementation, we would send the offer to the peer through a signaling server
            // For this simplified version, we'll use a direct approach
            
            // Simulate sending the offer to the peer and getting an answer
            this.simulateSignaling();
            
            return new Promise((resolve) => {
                // Resolve when connected
                const checkConnection = setInterval(() => {
                    if (this.isConnected) {
                        clearInterval(checkConnection);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkConnection);
                    if (!this.isConnected) {
                        this.close();
                        throw new Error('Connection timeout');
                    }
                }, 10000);
            });
        } catch (error) {
            console.error('Error connecting to peer:', error);
            this.close();
            throw error;
        }
    }
    
    /**
     * Set up connection event handlers
     */
    setupConnectionHandlers() {
        // ICE candidate event
        this.connection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, we would send the ICE candidate to the peer
                console.debug('New ICE candidate:', event.candidate);
            }
        };
        
        // Connection state change event
        this.connection.onconnectionstatechange = () => {
            console.debug('Connection state changed:', this.connection.connectionState);
            
            if (this.connection.connectionState === 'connected') {
                this.isConnected = true;
                if (this.onOpen) this.onOpen();
            } else if (this.connection.connectionState === 'disconnected' || 
                       this.connection.connectionState === 'failed' || 
                       this.connection.connectionState === 'closed') {
                this.isConnected = false;
                if (this.onClose) this.onClose();
            }
        };
        
        // ICE connection state change event
        this.connection.oniceconnectionstatechange = () => {
            console.debug('ICE connection state changed:', this.connection.iceConnectionState);
        };
        
        // Data channel event (for receiving peer)
        this.connection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannelHandlers();
        };
    }
    
    /**
     * Set up data channel event handlers
     */
    setupDataChannelHandlers() {
        if (!this.dataChannel) return;
        
        // Open event
        this.dataChannel.onopen = () => {
            console.debug('Data channel opened');
            this.isConnected = true;
            if (this.onOpen) this.onOpen();
        };
        
        // Close event
        this.dataChannel.onclose = () => {
            console.debug('Data channel closed');
            this.isConnected = false;
            if (this.onClose) this.onClose();
        };
        
        // Error event
        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };
        
        // Message event
        this.dataChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.onData) this.onData(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
    }
    
    /**
     * Simulate signaling process (in a real implementation, this would use a signaling server)
     * This is a simplified version for demonstration purposes
     */
    simulateSignaling() {
        // In a real implementation, this would involve:
        // 1. Sending the offer to the peer through a signaling server
        // 2. Receiving an answer from the peer
        // 3. Setting the remote description
        // 4. Exchanging ICE candidates
        
        // For this simplified version, we'll simulate a successful connection
        setTimeout(() => {
            // Simulate connection established
            this.isConnected = true;
            if (this.onOpen) this.onOpen();
        }, 1000);
    }
    
    /**
     * Send data to the peer
     * @param {Object} data - The data to send
     * @returns {boolean} True if the data was sent successfully
     */
    send(data) {
        if (!this.isConnected || !this.dataChannel) return false;
        
        try {
            this.dataChannel.send(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error sending data:', error);
            return false;
        }
    }
    
    /**
     * Close the connection
     */
    close() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        
        this.isConnected = false;
    }
}