/**
 * main.js
 * Entry point for the game application
 */

import { Game } from './game/Game.js';
import { DEFAULT_CHARACTER_MODEL } from './config/player-models.js';
import { STORAGE_KEYS } from './config/storage-keys.js';

/**
 * Main class responsible for initializing and managing the game startup process
 */
class Main {
    /**
     * Initialize the Main class
     */
    constructor() {
        // Default configuration for character model
        if (!localStorage.getItem(STORAGE_KEYS.DEBUG_MODE)) {
            console.debug = () => {};
            console.warn = () => {};
            console.log = () => {};
        }
        window.selectedModelId = DEFAULT_CHARACTER_MODEL;
        window.selectedSizeMultiplier = 1.0;
        
        // Bind methods to ensure correct 'this' context
        this.initializeGame = this.initializeGame.bind(this);
    }
    
    /**
     * Initialize the game and create the game instance
     */
    async initializeGame() {
        console.debug("Initializing game...");
        
        try {
            // Create game instance and make it globally accessible
            const game = new Game();
            window.game = game;
            
            this.completeGameAssetsLoad();
            this.showLoadingScreen();
            // Initialize the game (loads resources but keeps game paused)
            await game.init();
            console.debug("Game initialized successfully");
            
            // Display the main menu
            this.hideLoadingScreen();
            this.showMainMenu(game);
        } catch (error) {
            console.error("Error initializing game:", error);
            this.showErrorMessage(error);
        }
    }
    
    /**
     * Display the main game menu
     * @param {Game} game - The game instance
     */
    showMainMenu(game) {
        console.debug("Checking if we should show game menu or go directly to multiplayer...");
        
        this.hideLoadingScreen();
        
        // Check URL parameters for direct multiplayer join
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('join') === 'true') {
            console.debug("Direct multiplayer join detected, skipping main menu");
            
            // Simulate clicking the multiplayer button
            const multiplayerButton = document.getElementById('multiplayer-button');
            if (multiplayerButton) {
                console.debug("Automatically opening multiplayer UI");
                // The MultiplayerUIManager will handle the rest based on URL parameters
                multiplayerButton.click();
            } else {
                console.error("Multiplayer button not found, falling back to main menu");
                this.showRegularMainMenu(game);
            }
        } else {
            // Show regular main menu
            this.showRegularMainMenu(game);
        }
    }
    
    /**
     * Display the regular main menu
     * @param {Game} game - The game instance
     */
    showRegularMainMenu(game) {
        console.debug("Displaying regular game menu...");
        
        // Use the menu manager if available
        if (game.menuManager) {
            game.menuManager.showMenu('gameMenu');
        } else {
            // Fallback to direct creation if menu manager is not available
            console.error("MenuManager not available, creating GameMenu directly");
        }

        // Use a small delay to ensure DOM updates have completed
        setTimeout(() => {
            // Ensure menu is visible
            this.ensureMenuVisibility();
            
            console.debug("Game menu displayed - waiting for user input");
        }, 200);
    }
    
    /**
     * Hide the loading screen
     */
    completeGameAssetsLoad() {
        if (window.simulatedLoadingScreen) {
            window.simulatedLoadingScreen.complete();
            return;
        }
    }

    showLoadingScreen() {
        if (window.simulatedLoadingScreen) {
            window.simulatedLoadingScreen.show();
            return;
        }
    }

    hideLoadingScreen() {
        if (window.simulatedLoadingScreen) {
            window.simulatedLoadingScreen.hide();
            return;
        }
    }
    
    /**
     * Ensure the game menu is visible
     */
    ensureMenuVisibility() {
        const menuElement = document.getElementById('game-menu');
        
        if (!menuElement) {
            console.warn("Game menu element not found");
            return;
        }
        
        // Force the menu to be visible if it's not already
        if (menuElement.style.display !== 'flex') {
            console.debug("Ensuring game menu visibility");
            menuElement.style.display = 'flex';
            
            // Force a repaint
            document.body.offsetHeight;
        }
    }
    
    /**
     * Display error message when game initialization fails
     * @param {Error} error - The error that occurred
     */
    showErrorMessage(error) {
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Create and display error message
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
            <h2>Error Loading Game</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()">Retry</button>
        `;
        
        document.body.appendChild(errorContainer);
    }
}

// Create instance of Main class
const gameMain = new Main();

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', gameMain.initializeGame);