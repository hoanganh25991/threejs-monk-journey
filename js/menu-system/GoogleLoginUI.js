import { IMenu } from './IMenu.js';

/**
 * UI component for Google login
 * Handles sign-in/sign-out and displays user status
 */
export class GoogleLoginUI extends IMenu {
    /**
     * Create a new GoogleLoginUI
     * @param {Object} game - The game object
     */
    constructor(game) {
        super();
        this.game = game;
        this.container = null;
        this.loginButton = null;
        this.statusElement = null;
        this.isVisible = false;
        this.googleIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=';
    }
    
    /**
     * Initialize the UI component
     */
    init() {
        console.debug('GoogleLoginUI: Initializing UI component');
        
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'google-login-container';
        this.container.style.zIndex = '9999'; // Ensure it's on top
        document.body.appendChild(this.container);
        
        console.debug('GoogleLoginUI: Container created and added to body');
        
        // Create login button
        this.loginButton = document.createElement('button');
        this.loginButton.className = 'google-login-button';
        this.loginButton.innerHTML = `
            <img src="${this.googleIcon}" alt="Google">
            <span>Sign in with Google</span>
        `;
        this.loginButton.addEventListener('click', () => this.handleLoginClick());
        this.container.appendChild(this.loginButton);
        
        console.debug('GoogleLoginUI: Login button created and added to container');
        
        // Create status element (hidden initially)
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'google-login-status signed-out';
        this.statusElement.style.display = 'none';
        this.container.appendChild(this.statusElement);
        
        console.debug('GoogleLoginUI: Status element created and added to container');
        
        // Listen for sign-in/sign-out events
        window.addEventListener('google-signin-success', () => this.updateUI(true));
        window.addEventListener('google-signout', () => this.updateUI(false));
        
        // Check if already signed in
        if (this.game.saveManager.isSignedInToGoogle()) {
            this.updateUI(true);
        }
        
        // Force display to ensure visibility
        this.container.style.display = 'flex';
        console.debug('GoogleLoginUI: Initialization complete');
    }
    
    /**
     * Handle login button click
     */
    async handleLoginClick() {
        // Make sure the UI elements are initialized
        if (!this.container) {
            this.init();
        }
        
        // Check if button exists before updating it
        if (!this.loginButton) {
            console.debug('GoogleLoginUI: Login button not initialized yet');
            return;
        }
        
        if (this.game.saveManager.isSignedInToGoogle()) {
            // Sign out
            this.game.saveManager.signOutFromGoogle();
        } else {
            // Sign in
            this.loginButton.disabled = true;
            this.loginButton.textContent = 'Signing in...';
            
            const success = await this.game.saveManager.signInToGoogle();
            
            if (!success && this.loginButton) {
                this.loginButton.disabled = false;
                this.loginButton.innerHTML = `
                    <img src="${this.googleIcon}" alt="Google">
                    <span>Sign in with Google</span>
                `;
            }
        }
    }
    
    /**
     * Update UI based on sign-in status
     * @param {boolean} isSignedIn - Whether user is signed in
     */
    updateUI(isSignedIn) {
        // Make sure the UI elements are initialized
        if (!this.container) {
            this.init();
        }
        
        // Check if elements exist before updating them
        if (!this.loginButton || !this.statusElement) {
            console.debug('GoogleLoginUI: UI elements not initialized yet');
            return;
        }
        
        if (isSignedIn) {
            // Update login button to show sign out
            this.loginButton.disabled = false;
            this.loginButton.innerHTML = `<span>Sign out</span>`;
            
            // Update status element
            this.statusElement.className = 'google-login-status signed-in';
            this.statusElement.innerHTML = `
                <div class="google-login-name">Syncing data<div class="google-login-sync-indicator"></div></div>
            `;
            this.statusElement.style.display = 'flex';
        } else {
            // Update login button to show sign in
            this.loginButton.disabled = false;
            this.loginButton.innerHTML = `
                <img src="${this.googleIcon}" alt="Google">
                <span>Sign in with Google</span>
            `;
            
            // Hide status element
            this.statusElement.style.display = 'none';
        }
    }
    
    /**
     * Show the UI component
     */
    show() {
        console.debug('GoogleLoginUI: Showing UI component');
        
        // Make sure the container is initialized
        if (!this.container) {
            console.debug('GoogleLoginUI: Container not initialized, initializing now');
            this.init();
        }
        
        if (this.container) {
            console.debug('GoogleLoginUI: Setting container display to flex');
            this.container.style.display = 'flex';
            this.container.style.zIndex = '9999'; // Ensure it's on top
            this.isVisible = true;
        } else {
            console.debug('GoogleLoginUI: Container still null after initialization attempt');
        }
    }
    
    /**
     * Hide the UI component
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }
    
    /**
     * Toggle visibility of the UI component
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}