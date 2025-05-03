import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Game } from './core/Game.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create loading screen elements
    createLoadingScreen();
    
    // Initialize the game
    const game = new Game();
    
    // Start the game
    game.init().then(() => {
        // Hide loading screen when game is initialized
        document.getElementById('loading-screen').style.display = 'none';
        
        // Show game menu
        showGameMenu(game);
    });
});

// Create loading screen
function createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    
    const loadingTitle = document.createElement('h2');
    loadingTitle.textContent = 'Loading Diablo Immortal...';
    
    const loadingBarContainer = document.createElement('div');
    loadingBarContainer.id = 'loading-bar-container';
    
    const loadingBar = document.createElement('div');
    loadingBar.id = 'loading-bar';
    
    loadingBarContainer.appendChild(loadingBar);
    loadingScreen.appendChild(loadingTitle);
    loadingScreen.appendChild(loadingBarContainer);
    
    document.body.appendChild(loadingScreen);
    
    // Simulate loading progress
    simulateLoading();
}

// Simulate loading progress
function simulateLoading() {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        loadingBar.style.width = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
        }
    }, 200);
}

// Show game menu
function showGameMenu(game) {
    const gameMenu = document.createElement('div');
    gameMenu.id = 'game-menu';
    
    const title = document.createElement('h1');
    title.textContent = 'Diablo Immortal';
    
    const startButton = document.createElement('button');
    startButton.className = 'menu-button';
    startButton.textContent = 'Start Game';
    startButton.addEventListener('click', () => {
        gameMenu.style.display = 'none';
        game.start();
    });
    
    const optionsButton = document.createElement('button');
    optionsButton.className = 'menu-button';
    optionsButton.textContent = 'Options';
    optionsButton.addEventListener('click', () => {
        // Options functionality can be added later
        alert('Options menu is not implemented yet.');
    });
    
    gameMenu.appendChild(title);
    gameMenu.appendChild(startButton);
    gameMenu.appendChild(optionsButton);
    
    document.body.appendChild(gameMenu);
}