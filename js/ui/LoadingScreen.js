/**
 * LoadingScreen.js
 * Manages the loading screen UI component
 */

export class LoadingScreen {
    constructor() {
        this.element = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.intervalId = null;
    }

    /**
     * Show the loading screen
     */
    show() {
        if (this.element) {
            // Make sure it's visible
            this.element.style.display = 'flex';
            
            // Start simulating loading progress
            this.simulateLoading();
        }
    }

    /**
     * Hide the loading screen
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
        
        // Clear the interval if it's running
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Simulate loading progress
     * @private
     */
    simulateLoading() {
        // Clear any existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Reset progress
        if (this.loadingBar) {
            this.loadingBar.style.width = '0%';
        }
        
        let progress = 0;
        
        this.intervalId = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            
            if (this.loadingBar) {
                this.loadingBar.style.width = `${progress}%`;
            }
            
            if (progress === 100) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }, 200);
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // We don't remove the element since it's defined in the HTML
        // Just hide it
        if (this.element) {
            this.element.style.display = 'none';
        }
    }
}