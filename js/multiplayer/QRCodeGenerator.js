/**
 * QRCodeGenerator.js
 * Handles QR code generation and scanning for multiplayer connections
 */

export class QRCodeGenerator {
    constructor() {
        this.scanner = null;
    }
    
    /**
     * Generate a QR code with the given data
     * @param {string} data - The data to encode in the QR code
     * @param {HTMLElement} container - The container element for the QR code
     * @returns {Promise<void>} A promise that resolves when the QR code is generated
     */
    async generateQRCode(data, container) {
        // Dynamically import QRCode.js library
        const QRCodeModule = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.1/+esm');
        
        // Clear container
        container.innerHTML = '';
        
        // Check if container is a canvas element, if not create one
        let canvas;
        if (container.tagName.toLowerCase() !== 'canvas') {
            // Create a canvas element
            canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            container.appendChild(canvas);
        } else {
            canvas = container;
        }
        
        // Generate QR code
        await QRCodeModule.default.toCanvas(canvas, data, {
            width: 256,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        return container;
    }
    
    /**
     * Initialize QR code scanner
     * @param {HTMLElement} container - The container element for the scanner
     * @param {Function} onScan - Callback function when a QR code is scanned
     * @returns {Promise<void>} A promise that resolves when the scanner is initialized
     */
    async initQRScanner(container, onScan) {
        try {
            // Dynamically import jsQR library
            const jsQR = (await import('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm')).default;
            
            // Create video element
            const video = document.createElement('video');
            video.style.width = '100%';
            video.style.height = '100%';
            container.innerHTML = '';
            container.appendChild(video);
            
            // Create canvas for processing video frames
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            video.srcObject = stream;
            video.play();
            
            // Set canvas dimensions once video is playing
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            };
            
            // Process video frames
            const scanFrame = () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    // Draw video frame to canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Get image data
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Scan for QR code
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        // QR code found
                        console.debug('QR code detected:', code.data);
                        
                        // Call callback with result
                        onScan(code.data);
                        
                        // Stop scanning
                        this.stopQRScanner();
                        return;
                    }
                }
                
                // Continue scanning
                this.scanner = requestAnimationFrame(scanFrame);
            };
            
            // Start scanning
            this.scanner = requestAnimationFrame(scanFrame);
            
            // Store stream for cleanup
            this.stream = stream;
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            throw error;
        }
    }
    
    /**
     * Stop QR code scanner
     */
    stopQRScanner() {
        if (this.scanner) {
            cancelAnimationFrame(this.scanner);
            this.scanner = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
}