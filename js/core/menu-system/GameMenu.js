/**
 * GameMenu.js
 * Manages the main game menu UI component
 */

import { SettingsMenu } from './SettingsMenu.js';

export class GameMenu {
    /**
     * Create a game menu
     * @param {Game} game - The game instance
     */
    constructor(game) {
        this.game = game;
        this.element = document.getElementById('game-menu');
        this.newGameButton = document.getElementById('new-game-button');
        this.loadGameButton = document.getElementById('load-game-button');
        this.saveGameButton = document.getElementById('save-game-button');
        this.settingsMenuButton = document.getElementById('settings-menu-button');
        this.settingsMenu = null;
        
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for menu buttons
     * @private
     */
    setupEventListeners() {
        // New Game button
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                console.log("New Game button clicked - starting game...");
                this.hide();
                
                // Hide the main background when starting the game
                if (this.game.uiManager && this.game.uiManager.mainBackground) {
                    this.game.uiManager.mainBackground.hide();
                }
                
                // Start the game - this will set isPaused to false and start the game loop
                this.game.start();
                
                // Make sure settings button is visible
                const settingsButton = document.getElementById('home-button');
                if (settingsButton) {
                    settingsButton.style.display = 'block';
                }
                
                // Show all HUD elements
                if (this.game.hudManager) {
                    this.game.hudManager.showAllUI();
                }
                
                console.log("Game started - enemies and player are now active");
            });
        }
        
        // Settings button
        if (this.settingsMenuButton) {
            this.settingsMenuButton.addEventListener('click', () => {
                if (!this.settingsMenu) {
                    this.settingsMenu = new SettingsMenu(this.game);
                }
                
                // Show the main background when opening settings
                if (this.game.uiManager && this.game.uiManager.mainBackground) {
                    this.game.uiManager.mainBackground.show();
                }
                
                this.settingsMenu.show(this.element);
            });
        }
        
        // Load Game button - show only if save data exists
        if (this.loadGameButton) {
            if (this.game.saveManager && this.game.saveManager.hasSaveData()) {
                this.loadGameButton.style.display = 'block';
                
                this.loadGameButton.addEventListener('click', () => {
                    console.log("Load Game button clicked - attempting to load saved game...");
                    if (this.game.saveManager.loadGame()) {
                        console.log("Game data loaded successfully");
                        this.hide();
                        
                        // Hide the main background when loading a game
                        if (this.game.uiManager && this.game.uiManager.mainBackground) {
                            this.game.uiManager.mainBackground.hide();
                        }
                        
                        // Start the game with loaded data - this will set isPaused to false and start the game loop
                        this.game.start();
                        
                        // Make sure settings button is visible
                        const settingsButton = document.getElementById('home-button');
                        if (settingsButton) {
                            settingsButton.style.display = 'block';
                        }
                        
                        // Show all HUD elements
                        if (this.game.hudManager) {
                            this.game.hudManager.showAllUI();
                        }
                        
                        console.log("Game started with loaded data - enemies and player are now active");
                    } else {
                        console.error("Failed to load game data");
                        alert('Failed to load game data.');
                    }
                });
            } else {
                // Hide the load button if no save data exists
                this.loadGameButton.style.display = 'none';
            }
        }
        
        // Save Game button - show only if game is running
        if (this.saveGameButton) {
            this.saveGameButton.addEventListener('click', () => {
                console.log("Save Game button clicked - attempting to save game...");
                if (this.game.saveManager) {
                    // Force save the game
                    if (this.game.saveManager.saveGame(true)) {
                        console.log("Game data saved successfully");
                        
                        // Show notification
                        if (this.game.uiManager) {
                            this.game.uiManager.showNotification('Game saved successfully', 2000, 'success');
                        }
                    } else {
                        console.error("Failed to save game data");
                        
                        // Show error notification
                        if (this.game.uiManager) {
                            this.game.uiManager.showNotification('Failed to save game', 3000, 'error');
                        }
                    }
                } else {
                    console.error("Save manager not available");
                    alert('Save functionality is not available.');
                }
            });
        }
    }

    /**
     * Show the game menu
     */
    show() {
        if (this.element) {
            // Update load game button visibility based on save data
            if (this.loadGameButton && this.game.saveManager) {
                this.loadGameButton.style.display = this.game.saveManager.hasSaveData() ? 'block' : 'none';
            }
            
            // Update save game button visibility based on game state
            if (this.saveGameButton) {
                // Show save button only if the game has been started and player exists
                const gameStarted = this.game.isRunning && this.game.player;
                this.saveGameButton.style.display = gameStarted ? 'block' : 'none';
            }
            
            // Hide all HUD UI elements using the HUDManager
            if (this.game.hudManager) {
                this.game.hudManager.hideAllUI();
            }
            
            // Show the main background when showing the game menu
            if (this.game.uiManager && this.game.uiManager.mainBackground) {
                this.game.uiManager.mainBackground.show();
            }
            
            // Make sure the menu is visible
            this.element.style.display = 'flex';
        }
    }

    /**
     * Hide the game menu
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        // We don't remove the element since it's defined in the HTML
        // Just hide it
        if (this.element) {
            this.element.style.display = 'none';
        }
        
        if (this.settingsMenu) {
            this.settingsMenu.dispose();
        }
        
        this.settingsMenu = null;
    }
}