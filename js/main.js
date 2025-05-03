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
    startButton.textContent = 'New Game';
    startButton.addEventListener('click', () => {
        gameMenu.style.display = 'none';
        game.start();
    });
    
    // Add load game button if save data exists
    if (game.saveManager.hasSaveData()) {
        const loadButton = document.createElement('button');
        loadButton.className = 'menu-button';
        loadButton.textContent = 'Load Game';
        loadButton.addEventListener('click', () => {
            if (game.saveManager.loadGame()) {
                gameMenu.style.display = 'none';
                game.start();
            } else {
                alert('Failed to load game data.');
            }
        });
        gameMenu.appendChild(loadButton);
    }
    
    const optionsButton = document.createElement('button');
    optionsButton.className = 'menu-button';
    optionsButton.textContent = 'Options';
    optionsButton.addEventListener('click', () => {
        showOptionsMenu(game, gameMenu);
    });
    
    gameMenu.appendChild(title);
    gameMenu.appendChild(startButton);
    gameMenu.appendChild(optionsButton);
    
    document.body.appendChild(gameMenu);
}

// Show options menu
function showOptionsMenu(game, mainMenu) {
    // Hide main menu
    mainMenu.style.display = 'none';
    
    // Create options menu
    const optionsMenu = document.createElement('div');
    optionsMenu.id = 'game-menu';
    
    const title = document.createElement('h1');
    title.textContent = 'Options';
    
    // Game settings
    const gameTitle = document.createElement('h2');
    gameTitle.textContent = 'Game Settings';
    gameTitle.style.color = '#aaa';
    gameTitle.style.fontSize = '24px';
    gameTitle.style.marginTop = '20px';
    
    // Difficulty selector
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.margin = '10px 0';
    
    const difficultyLabel = document.createElement('label');
    difficultyLabel.textContent = 'Difficulty: ';
    difficultyLabel.style.color = '#fff';
    
    const difficultySelect = document.createElement('select');
    difficultySelect.style.padding = '5px';
    difficultySelect.style.marginLeft = '10px';
    
    // Add difficulty options
    const difficultyLevels = game.difficultyManager.getDifficultyLevels();
    difficultyLevels.forEach((level, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = level;
        difficultySelect.appendChild(option);
    });
    
    // Set current difficulty
    difficultySelect.value = game.difficultyManager.getCurrentDifficultyIndex();
    
    // Add change event
    difficultySelect.addEventListener('change', () => {
        game.difficultyManager.setDifficulty(parseInt(difficultySelect.value));
    });
    
    difficultyContainer.appendChild(difficultyLabel);
    difficultyContainer.appendChild(difficultySelect);
    
    // Audio settings
    const audioTitle = document.createElement('h2');
    audioTitle.textContent = 'Audio Settings';
    audioTitle.style.color = '#aaa';
    audioTitle.style.fontSize = '24px';
    audioTitle.style.marginTop = '20px';
    
    // Music volume slider
    const musicVolumeContainer = document.createElement('div');
    musicVolumeContainer.style.margin = '10px 0';
    
    const musicVolumeLabel = document.createElement('label');
    musicVolumeLabel.textContent = 'Music Volume: ';
    musicVolumeLabel.style.color = '#fff';
    
    const musicVolumeSlider = document.createElement('input');
    musicVolumeSlider.type = 'range';
    musicVolumeSlider.min = '0';
    musicVolumeSlider.max = '100';
    musicVolumeSlider.value = game.audioManager.musicVolume * 100;
    musicVolumeSlider.addEventListener('input', () => {
        game.audioManager.setMusicVolume(musicVolumeSlider.value / 100);
    });
    
    musicVolumeContainer.appendChild(musicVolumeLabel);
    musicVolumeContainer.appendChild(musicVolumeSlider);
    
    // SFX volume slider
    const sfxVolumeContainer = document.createElement('div');
    sfxVolumeContainer.style.margin = '10px 0';
    
    const sfxVolumeLabel = document.createElement('label');
    sfxVolumeLabel.textContent = 'SFX Volume: ';
    sfxVolumeLabel.style.color = '#fff';
    
    const sfxVolumeSlider = document.createElement('input');
    sfxVolumeSlider.type = 'range';
    sfxVolumeSlider.min = '0';
    sfxVolumeSlider.max = '100';
    sfxVolumeSlider.value = game.audioManager.sfxVolume * 100;
    sfxVolumeSlider.addEventListener('input', () => {
        game.audioManager.setSFXVolume(sfxVolumeSlider.value / 100);
    });
    
    sfxVolumeContainer.appendChild(sfxVolumeLabel);
    sfxVolumeContainer.appendChild(sfxVolumeSlider);
    
    // Mute button
    const muteButton = document.createElement('button');
    muteButton.className = 'menu-button';
    muteButton.style.marginTop = '10px';
    muteButton.textContent = game.audioManager.isMuted ? 'Unmute' : 'Mute';
    muteButton.addEventListener('click', () => {
        const isMuted = game.audioManager.toggleMute();
        muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
    });
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'menu-button';
    backButton.textContent = 'Back';
    backButton.style.marginTop = '30px';
    backButton.addEventListener('click', () => {
        optionsMenu.remove();
        mainMenu.style.display = 'flex';
    });
    
    optionsMenu.appendChild(title);
    optionsMenu.appendChild(audioTitle);
    optionsMenu.appendChild(musicVolumeContainer);
    optionsMenu.appendChild(sfxVolumeContainer);
    optionsMenu.appendChild(muteButton);
    optionsMenu.appendChild(backButton);
    
    document.body.appendChild(optionsMenu);
}