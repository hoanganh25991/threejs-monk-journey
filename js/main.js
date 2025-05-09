/**
 * main.js
 * Entry point for the game application
 */

import { Game } from './core/game/Game.js';
import { DEFAULT_CHARACTER_MODEL } from './config/index.js';
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
function startGame() {
    console.log("DOM loaded, initializing game...");
    
    // Initialize the game using the GameFacade
    const game = new Game();
    console.log("Game instance created:", game);
    
    // Initialize the game but keep it paused
    // This loads all resources but doesn't start the game loop
    game.init().then(() => {
        console.log("Game initialized successfully - game is in paused state");
        
        // Make sure the game is paused
        console.log("Pausing game...");
        game.pause();
        
        // Show game menu - game will remain paused until user clicks "New Game" or "Load Game"
        console.log("Creating game menu...");
        const gameMenu = new GameMenu(game);
        
        // Force a small delay to ensure DOM updates have completed
        setTimeout(() => {
            console.log("Showing game menu...");
            gameMenu.show();
            
            // Verify the menu is visible
            const menuElement = document.getElementById('game-menu');
            console.log("Game menu element display style:", menuElement ? menuElement.style.display : "Element not found");
            
            // Force the menu to be visible if it's not already
            if (menuElement && menuElement.style.display !== 'flex') {
                console.log("Forcing game menu to be visible");
                menuElement.style.display = 'flex';
                
                // Force a repaint
                document.body.offsetHeight;
            }
            
            console.log("Game menu displayed - waiting for user input to start game");
        }, 200);
    }).catch(error => {
        console.error("Error initializing game:", error);
    });
}