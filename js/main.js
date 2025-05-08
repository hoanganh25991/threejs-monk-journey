/**
 * main.js
 * Entry point for the game application
 */

import { Game } from './core/game/Game.js';
import { DEFAULT_CHARACTER_MODEL } from './config/index.js';
import { LoadingScreen } from './core/menu-system/LoadingScreen.js';
import { GameMenu } from './core/menu-system/GameMenu.js';

// Store the selected model and size for use when starting a new game
// Make these variables available globally for the Game class to access
window.selectedModelId = DEFAULT_CHARACTER_MODEL;
window.selectedSizeMultiplier = 1.0;

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startGame, 300);
});

/**
 * Initialize and start the game
 */
function startGame() {
    console.log("DOM loaded, initializing game...");
    
    // Create loading screen
    const loadingScreen = new LoadingScreen();
    loadingScreen.show();
    
    // Initialize the game using the GameFacade
    const game = new Game();
    console.log("Game instance created:", game);
    
    // Initialize the game but keep it paused
    // This loads all resources but doesn't start the game loop
    game.init().then(() => {
        console.log("Game initialized successfully - game is in paused state");
        
        // Hide loading screen when game is initialized
        loadingScreen.hide();
        game.pause();
        
        // Show game menu - game will remain paused until user clicks "New Game" or "Load Game"
        const gameMenu = new GameMenu(game);
        gameMenu.show();
        console.log("Game menu displayed - waiting for user input to start game");
    }).catch(error => {
        console.error("Error initializing game:", error);
    });
}