import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Game } from './core/Game.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game...");
    
    // Create loading screen elements
    createLoadingScreen();
    
    // Initialize the game
    const game = new Game();
    console.log("Game instance created:", game);
    
    // Start the game
    game.init().then(() => {
        console.log("Game initialized successfully");
        
        // Hide loading screen when game is initialized
        document.getElementById('loading-screen').style.display = 'none';
        
        // Show game menu
        showGameMenu(game);
        console.log("Game menu displayed");
    }).catch(error => {
        console.error("Error initializing game:", error);
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
    
    // Performance settings
    const performanceTitle = document.createElement('h2');
    performanceTitle.textContent = 'Performance Settings';
    performanceTitle.style.color = '#aaa';
    performanceTitle.style.fontSize = '24px';
    performanceTitle.style.marginTop = '20px';
    
    // Create performance controls container
    const performanceContainer = document.createElement('div');
    performanceContainer.style.margin = '10px 0';
    
    // Quality preset selector
    const qualityContainer = document.createElement('div');
    qualityContainer.style.margin = '10px 0';
    
    const qualityLabel = document.createElement('label');
    qualityLabel.textContent = 'Quality Preset: ';
    qualityLabel.style.color = '#fff';
    
    const qualitySelect = document.createElement('select');
    qualitySelect.style.padding = '5px';
    qualitySelect.style.marginLeft = '10px';
    
    // Add quality options
    const qualityLevels = ['minimal', 'low', 'medium', 'high', 'ultra'];
    qualityLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        qualitySelect.appendChild(option);
    });
    
    // Set current quality
    if (game.performanceManager) {
        qualitySelect.value = game.performanceManager.currentQuality;
    }
    
    // Add change event
    qualitySelect.addEventListener('change', () => {
        if (game.performanceManager) {
            game.performanceManager.setQualityLevel(qualitySelect.value);
        }
    });
    
    qualityContainer.appendChild(qualityLabel);
    qualityContainer.appendChild(qualitySelect);
    
    // Adaptive quality toggle
    const adaptiveContainer = document.createElement('div');
    adaptiveContainer.style.margin = '10px 0';
    
    const adaptiveLabel = document.createElement('label');
    adaptiveLabel.textContent = 'Adaptive Quality: ';
    adaptiveLabel.style.color = '#fff';
    
    const adaptiveCheckbox = document.createElement('input');
    adaptiveCheckbox.type = 'checkbox';
    adaptiveCheckbox.checked = game.performanceManager ? game.performanceManager.adaptiveQualityEnabled : true;
    adaptiveCheckbox.style.marginLeft = '10px';
    
    adaptiveCheckbox.addEventListener('change', () => {
        if (game.performanceManager) {
            game.performanceManager.toggleAdaptiveQuality();
            
            // Disable quality selector if adaptive is enabled
            qualitySelect.disabled = adaptiveCheckbox.checked;
        }
    });
    
    adaptiveContainer.appendChild(adaptiveLabel);
    adaptiveContainer.appendChild(adaptiveCheckbox);
    
    // Target FPS slider
    const fpsContainer = document.createElement('div');
    fpsContainer.style.margin = '10px 0';
    
    const fpsLabel = document.createElement('label');
    fpsLabel.textContent = 'Target FPS: ';
    fpsLabel.style.color = '#fff';
    
    const fpsSlider = document.createElement('input');
    fpsSlider.type = 'range';
    fpsSlider.min = '30';
    fpsSlider.max = '60';
    fpsSlider.step = '5';
    fpsSlider.value = game.performanceManager ? game.performanceManager.targetFPS : 60;
    fpsSlider.style.marginLeft = '10px';
    fpsSlider.style.width = '150px';
    
    const fpsValue = document.createElement('span');
    fpsValue.textContent = `${fpsSlider.value} FPS`;
    fpsValue.style.color = '#fff';
    fpsValue.style.marginLeft = '10px';
    
    fpsSlider.addEventListener('input', () => {
        if (game.performanceManager) {
            game.performanceManager.setTargetFPS(parseInt(fpsSlider.value));
            fpsValue.textContent = `${fpsSlider.value} FPS`;
        }
    });
    
    fpsContainer.appendChild(fpsLabel);
    fpsContainer.appendChild(fpsSlider);
    fpsContainer.appendChild(fpsValue);
    
    // Add all performance controls to container
    performanceContainer.appendChild(qualityContainer);
    performanceContainer.appendChild(adaptiveContainer);
    performanceContainer.appendChild(fpsContainer);
    
    // Add performance settings to menu
    optionsMenu.appendChild(performanceTitle);
    optionsMenu.appendChild(performanceContainer);
    
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
    
    // Check if audio is enabled
    const audioEnabled = game.audioManager.isAudioEnabled();
    
    if (audioEnabled) {
        // Create audio controls container
        const audioControlsContainer = document.createElement('div');
        audioControlsContainer.style.margin = '10px 0';
        
        // Mute toggle
        const muteContainer = document.createElement('div');
        muteContainer.style.margin = '10px 0';
        
        const muteLabel = document.createElement('label');
        muteLabel.textContent = 'Mute Audio: ';
        muteLabel.style.color = '#fff';
        
        const muteCheckbox = document.createElement('input');
        muteCheckbox.type = 'checkbox';
        muteCheckbox.checked = game.audioManager.isMuted;
        muteCheckbox.style.marginLeft = '10px';
        
        muteCheckbox.addEventListener('change', () => {
            game.audioManager.toggleMute();
            game.audioManager.saveSettings();
        });
        
        muteContainer.appendChild(muteLabel);
        muteContainer.appendChild(muteCheckbox);
        
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
        musicVolumeSlider.value = game.audioManager.getMusicVolume() * 100;
        musicVolumeSlider.style.marginLeft = '10px';
        musicVolumeSlider.style.width = '150px';
        
        const musicVolumeValue = document.createElement('span');
        musicVolumeValue.textContent = `${Math.round(game.audioManager.getMusicVolume() * 100)}%`;
        musicVolumeValue.style.color = '#fff';
        musicVolumeValue.style.marginLeft = '10px';
        
        musicVolumeSlider.addEventListener('input', () => {
            const volume = parseInt(musicVolumeSlider.value) / 100;
            game.audioManager.setMusicVolume(volume);
            musicVolumeValue.textContent = `${Math.round(volume * 100)}%`;
        });
        
        musicVolumeSlider.addEventListener('change', () => {
            game.audioManager.saveSettings();
        });
        
        musicVolumeContainer.appendChild(musicVolumeLabel);
        musicVolumeContainer.appendChild(musicVolumeSlider);
        musicVolumeContainer.appendChild(musicVolumeValue);
        
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
        sfxVolumeSlider.value = game.audioManager.getSFXVolume() * 100;
        sfxVolumeSlider.style.marginLeft = '10px';
        sfxVolumeSlider.style.width = '150px';
        
        const sfxVolumeValue = document.createElement('span');
        sfxVolumeValue.textContent = `${Math.round(game.audioManager.getSFXVolume() * 100)}%`;
        sfxVolumeValue.style.color = '#fff';
        sfxVolumeValue.style.marginLeft = '10px';
        
        sfxVolumeSlider.addEventListener('input', () => {
            const volume = parseInt(sfxVolumeSlider.value) / 100;
            game.audioManager.setSFXVolume(volume);
            sfxVolumeValue.textContent = `${Math.round(volume * 100)}%`;
        });
        
        sfxVolumeSlider.addEventListener('change', () => {
            game.audioManager.saveSettings();
            // Play a test sound
            game.audioManager.playSound('buttonClick');
        });
        
        sfxVolumeContainer.appendChild(sfxVolumeLabel);
        sfxVolumeContainer.appendChild(sfxVolumeSlider);
        sfxVolumeContainer.appendChild(sfxVolumeValue);
        
        // Test sound button
        const testSoundContainer = document.createElement('div');
        testSoundContainer.style.margin = '10px 0';
        
        const testSoundButton = document.createElement('button');
        testSoundButton.textContent = 'Test Sound';
        testSoundButton.className = 'menu-button';
        testSoundButton.style.padding = '5px 10px';
        testSoundButton.style.fontSize = '14px';
        
        testSoundButton.addEventListener('click', () => {
            game.audioManager.playSound('buttonClick');
        });
        
        testSoundContainer.appendChild(testSoundButton);
        
        // Add all audio controls to container
        audioControlsContainer.appendChild(muteContainer);
        audioControlsContainer.appendChild(musicVolumeContainer);
        audioControlsContainer.appendChild(sfxVolumeContainer);
        audioControlsContainer.appendChild(testSoundContainer);
        
        // Add audio controls to menu
        optionsMenu.appendChild(audioTitle);
        optionsMenu.appendChild(audioControlsContainer);
        
        // Add note about simulated audio if files aren't available
        if (!game.audioManager.areAudioFilesAvailable()) {
            const simulatedAudioNote = document.createElement('div');
            simulatedAudioNote.textContent = 'Using simulated audio. For better audio experience, add audio files to the assets/audio directory.';
            simulatedAudioNote.style.color = '#ffcc99';
            simulatedAudioNote.style.margin = '10px 0';
            simulatedAudioNote.style.fontSize = '14px';
            optionsMenu.appendChild(simulatedAudioNote);
        }
    } else {
        // Audio disabled message
        const audioDisabledMessage = document.createElement('div');
        audioDisabledMessage.textContent = 'Audio is currently disabled. Audio files need to be added to the assets/audio directory.';
        audioDisabledMessage.style.color = '#ff9999';
        audioDisabledMessage.style.margin = '10px 0';
        audioDisabledMessage.style.fontSize = '14px';
        
        optionsMenu.appendChild(audioTitle);
        optionsMenu.appendChild(audioDisabledMessage);
    }
    
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
    optionsMenu.appendChild(gameTitle);
    optionsMenu.appendChild(difficultyContainer);
    optionsMenu.appendChild(backButton);
    
    document.body.appendChild(optionsMenu);
}