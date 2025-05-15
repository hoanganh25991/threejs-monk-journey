/**
 * Handles progress indication for save/load operations
 */
export class SaveOperationProgress {
    /**
     * Create a new progress indicator
     * @param {Object} game - The game object
     * @param {string} operationType - Type of operation ('save' or 'load')
     */
    constructor(game, operationType) {
        this.game = game;
        this.operationType = operationType;
        this.progressElement = null;
        this.progressBarElement = null;
        this.progressTextElement = null;
        this.isActive = false;
    }
    
    /**
     * Start the progress indicator
     * @param {string} initialMessage - Initial message to display
     */
    start(initialMessage) {
        // Create progress container if it doesn't exist
        if (!this.progressElement) {
            this.createProgressElements();
        }
        
        // Set initial message and progress
        this.update(initialMessage, 0);
        
        // Show the progress indicator
        this.show();
        
        // Mark as active
        this.isActive = true;
    }
    
    /**
     * Update the progress indicator
     * @param {string} message - Message to display
     * @param {number} percent - Progress percentage (0-100)
     */
    update(message, percent) {
        if (!this.isActive) return;
        
        // Update progress bar
        if (this.progressBarElement) {
            this.progressBarElement.style.width = `${percent}%`;
        }
        
        // Update text
        if (this.progressTextElement) {
            this.progressTextElement.textContent = message;
        }
    }
    
    /**
     * Mark the operation as complete
     */
    complete() {
        if (!this.isActive) return;
        
        // Show 100% completion
        this.update('Operation complete', 100);
        
        // Hide after a short delay
        setTimeout(() => {
            this.hide();
        }, 1000);
        
        // Mark as inactive
        this.isActive = false;
    }
    
    /**
     * Show an error message
     * @param {string} errorMessage - Error message to display
     */
    error(errorMessage) {
        if (!this.isActive) {
            this.start(errorMessage);
        }
        
        // Update progress elements with error styling
        if (this.progressElement) {
            this.progressElement.classList.add('error');
        }
        
        if (this.progressBarElement) {
            this.progressBarElement.style.backgroundColor = '#ff3333';
        }
        
        if (this.progressTextElement) {
            this.progressTextElement.textContent = errorMessage;
        }
        
        // Hide after a delay
        setTimeout(() => {
            this.hide();
        }, 3000);
        
        // Mark as inactive
        this.isActive = false;
    }
    
    /**
     * Show the progress indicator
     */
    show() {
        if (this.progressElement) {
            this.progressElement.style.display = 'flex';
        }
    }
    
    /**
     * Hide the progress indicator
     */
    hide() {
        if (this.progressElement) {
            this.progressElement.style.display = 'none';
        }
    }
    
    /**
     * Create the progress indicator elements
     */
    createProgressElements() {
        // Create container
        this.progressElement = document.createElement('div');
        this.progressElement.className = 'save-operation-progress';
        this.progressElement.style.position = 'fixed';
        this.progressElement.style.top = '50%';
        this.progressElement.style.left = '50%';
        this.progressElement.style.transform = 'translate(-50%, -50%)';
        this.progressElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.progressElement.style.borderRadius = '8px';
        this.progressElement.style.padding = '20px';
        this.progressElement.style.width = '300px';
        this.progressElement.style.zIndex = '10000';
        this.progressElement.style.display = 'none';
        this.progressElement.style.flexDirection = 'column';
        this.progressElement.style.alignItems = 'center';
        this.progressElement.style.justifyContent = 'center';
        this.progressElement.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        
        // Create title
        const titleElement = document.createElement('h3');
        titleElement.textContent = this.operationType === 'save' ? 'Saving Game' : 'Loading Game';
        titleElement.style.color = '#ffffff';
        titleElement.style.margin = '0 0 15px 0';
        titleElement.style.fontFamily = 'Arial, sans-serif';
        
        // Create progress text
        this.progressTextElement = document.createElement('div');
        this.progressTextElement.style.color = '#ffffff';
        this.progressTextElement.style.marginBottom = '10px';
        this.progressTextElement.style.width = '100%';
        this.progressTextElement.style.textAlign = 'center';
        this.progressTextElement.style.fontFamily = 'Arial, sans-serif';
        
        // Create progress bar container
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.width = '100%';
        progressBarContainer.style.height = '20px';
        progressBarContainer.style.backgroundColor = '#333333';
        progressBarContainer.style.borderRadius = '10px';
        progressBarContainer.style.overflow = 'hidden';
        
        // Create progress bar
        this.progressBarElement = document.createElement('div');
        this.progressBarElement.style.width = '0%';
        this.progressBarElement.style.height = '100%';
        this.progressBarElement.style.backgroundColor = this.operationType === 'save' ? '#4CAF50' : '#2196F3';
        this.progressBarElement.style.transition = 'width 0.3s ease-in-out';
        
        // Add elements to container
        progressBarContainer.appendChild(this.progressBarElement);
        this.progressElement.appendChild(titleElement);
        this.progressElement.appendChild(this.progressTextElement);
        this.progressElement.appendChild(progressBarContainer);
        
        // Add to document
        document.body.appendChild(this.progressElement);
    }
}