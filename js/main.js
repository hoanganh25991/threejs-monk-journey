/**
 * main.js
 * Entry point for the game application
 */

import { Game } from './core/game/Game.js';
import { DEFAULT_CHARACTER_MODEL } from './config/player-models.js';
import { GameMenu } from './core/menu-system/GameMenu.js';
import { LoadingScreen } from '../pwa/LoadingScreen.js';

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
    console.log("Game Assets Loaded, initializing game...");
    console.log(event);
    
    // Initialize the game using the GameFacade
    const game = new Game();
    console.log("Game instance created:", game);
    
    // Initialize the game but keep it paused
    // This loads all resources but doesn't start the game loop
    game.init().then(() => {
        console.log("Game initialized successfully - game is in paused state");
        // Access the loading screen instance exposed by initial-load-progress.js
        const loadingScreen = new LoadingScreen();
        
        if (loadingScreen) {
            // Update loading screen to show game initialization
            loadingScreen.updateProgress(
                100,
                `Game initialized`,
                'Showing Game menu...'
            );
        } else {
            console.warn("Loading screen instance not found");
        }
        
        // Make sure the game is paused
        console.log("Pausing game...");
        game.pause();
        
        // Show game menu - game will remain paused until user clicks "New Game" or "Load Game"
        console.log("Creating game menu...");
        const gameMenu = new GameMenu(game);
        
        // Force a small delay to ensure DOM updates have completed
        setTimeout(() => {
            console.log("Showing game menu...");
            if (loadingScreen) {
                // Hide loading screen immediately since game menu will be shown
                loadingScreen.hide();
            } else {
                console.warn("Loading screen instance not found");
            }

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