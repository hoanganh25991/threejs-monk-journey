/**
 * main.js
 * Entry point for the game application
 */

import { Game } from './core/game/Game.js';
import { DEFAULT_CHARACTER_MODEL } from './config/player-models.js';
import { GameMenu } from './core/menu-system/GameMenu.js';

// Store the selected model and size for use when starting a new game
// Make these variables available globally for the Game class to access
window.selectedModelId = DEFAULT_CHARACTER_MODEL;
window.selectedSizeMultiplier = 1.0;

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', startGame);

/**
 * Initialize and start the game
 */
function startGame(event) {
    console.debug("Game Assets Loaded, initializing game...");
    console.debug(event);
    
    // Initialize the game using the GameFacade
    const game = new Game();
    window.game = game;
    console.debug("Game instance created:", game);
    
    // Initialize the game but keep it paused
    // This loads all resources but doesn't start the game loop
    game.init().then(() => {
        console.debug("Game initialized successfully - game is in paused state");
        
        // Disconnect the network observer as it's no longer needed
        if (window.fileTracker && typeof window.fileTracker.disconnectNetworkObserver === 'function') {
            console.debug("Disconnecting network observer to improve performance");
            window.fileTracker.disconnectNetworkObserver();
        }
        
        // Make sure the game is paused
        console.debug("Pausing game...");
        game.pause();
        
        // Show game menu - game will remain paused until user clicks "New Game" or "Load Game"
        console.debug("Creating game menu...");
        const gameMenu = new GameMenu(game);
        
        // Force a small delay to ensure DOM updates have completed
        setTimeout(() => {
            console.debug("Showing game menu...");
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            } else {
                console.warn("Loading screen instance not found");
            }

            gameMenu.show();
            
            // Verify the menu is visible
            const menuElement = document.getElementById('game-menu');
            console.debug("Game menu element display style:", menuElement ? menuElement.style.display : "Element not found");
            
            // Force the menu to be visible if it's not already
            if (menuElement && menuElement.style.display !== 'flex') {
                console.debug("Forcing game menu to be visible");
                menuElement.style.display = 'flex';
                
                // Force a repaint
                document.body.offsetHeight;
            }
            
            console.debug("Game menu displayed - waiting for user input to start game");
        }, 200);
    }).catch(error => {
        console.error("Error initializing game:", error);
    });
}