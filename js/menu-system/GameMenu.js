/**
 * GameMenu.js
 * Manages the main game menu UI component
 */

import { SettingsMenu } from './SettingsMenu.js';
import { IMenu } from './IMenu.js';

export class GameMenu extends IMenu {
    /**
     * Create a game menu
     * @param {Game} game - The game instance
     */
    constructor(game) {
        super('game-menu', game);
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
        // New Game/Resume Game button
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                if (this.game.hasStarted && !this.game.isRunning) {
                    // Game has been started but is currently paused
                    console.debug("Resume Game button clicked - resuming game...");
                    this.hide();
                    
                    // Hide the main background when resuming the game
                    if (this.game.hudManager && this.game.hudManager.mainBackground) {
                        this.game.hudManager.mainBackground.hide();
                    }

                    // Resume the game
                    this.game.resume(false);
                    
                    // Show all HUD elements
                    if (this.game.hudManager) {
                        this.game.hudManager.showAllUI();
                    }
                    
                    console.debug("Game resumed - enemies and player are now active");
                } else if (!this.game.hasStarted) {
                    // Game has never been started - start a new game
                    console.debug("New Game button clicked - starting new game...");
                    this.hide();
                    
                    // Hide the main background when starting the game
                    if (this.game.hudManager && this.game.hudManager.mainBackground) {
                        this.game.hudManager.mainBackground.hide();
                    }
                    
                    // Start the game - this will set isPaused to false and start the game loop
                    this.game.start();
                    
                    // Make sure settings button is visible
                    const homeButton = document.getElementById('home-button');
                    if (homeButton) {
                        homeButton.style.display = 'block';
                    }
                    
                    // Show all HUD elements
                    if (this.game.hudManager) {
                        this.game.hudManager.showAllUI();
                    }
                    
                    console.debug("New game started - enemies and player are now active");
                }
            });
        }
        
        // Settings button
        if (this.settingsMenuButton) {
            this.settingsMenuButton.addEventListener('click', () => {
                // Use the menu manager to show the settings menu
                if (this.game.menuManager) {
                    this.game.menuManager.showMenu('settingsMenu');
                } else {
                    // Fallback to old behavior if menu manager is not available
                    if (!this.settingsMenu) {
                        this.settingsMenu = new SettingsMenu(this.game);
                    }
                    
                    // Show the main background when opening settings
                    if (this.game.hudManager && this.game.hudManager.mainBackground) {
                        this.game.hudManager.mainBackground.show();
                    }
                    
                    // Pass the game menu element and indicate we're coming from the game menu
                    this.settingsMenu.showSettings(this.game.isPaused, this);
                    
                    // Hide the game menu to prevent overlap
                    this.hide();
                }
            });
        }
        
        // Continue Game button - show only if save data exists
        if (this.loadGameButton) {
            if (this.game.saveManager && this.game.saveManager.hasSaveData()) {
                this.loadGameButton.style.display = 'block';
                
                this.loadGameButton.addEventListener('click', () => {
                    console.debug("Continue Game button clicked - attempting to load saved game...");
                    if (this.game.saveManager.loadGame()) {
                        console.debug("Game data loaded successfully");
                        this.hide();
                        
                        // Hide the main background when loading a game
                        if (this.game.hudManager && this.game.hudManager.mainBackground) {
                            this.game.hudManager.mainBackground.hide();
                        }
                        
                        // Start the game with loaded data - this will set isPaused to false and start the game loop
                        this.game.start();
                        
                        // Make sure settings button is visible
                        const homeButton = document.getElementById('home-button');
                        if (homeButton) {
                            homeButton.style.display = 'block';
                        }
                        
                        // Show all HUD elements
                        if (this.game.hudManager) {
                            this.game.hudManager.showAllUI();
                        }
                        
                        console.debug("Game started with loaded data - enemies and player are now active");
                    } else {
                        console.error("Failed to Continue Game data");
                        alert('Failed to Continue Game data.');
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
                console.debug("Save Game button clicked - attempting to save game...");
                if (this.game.saveManager) {
                    // Force save the game
                    if (this.game.saveManager.saveGame(true, false)) {
                        console.debug("Game data saved successfully");
                        
                        // Show notification
                        if (this.game.hudManager) {
                            this.game.hudManager.showNotification('Game saved successfully', 2000, 'success');
                        }
                    } else {
                        console.error("Failed to save game data");
                        
                        // Show error notification
                        if (this.game.hudManager) {
                            this.game.hudManager.showNotification('Failed to save game', 3000, 'error');
                        }
                    }
                } else {
                    console.error("Save manager not available");
                    alert('Save functionality is not available.');
                }
            });
        }
        
        // Force Reload button has been moved to Settings > Release tab
    }

    /**
     * Get the menu type/name
     * @returns {string} The menu type/name
     */
    getType() {
        return 'gameMenu';
    }

    /**
     * Show the game menu
     */
    show() {
        if (this.element) {
            // Update New Game button text based on game state
            if (this.newGameButton && this.saveGameButton) {
                if (this.game.hasStarted) {
                    this.newGameButton.textContent = 'Resume Game';
                    this.saveGameButton.style.display = 'block';
                    this.loadGameButton.style.display = 'none';
                } else {
                    this.newGameButton.textContent = 'New Game';
                    this.saveGameButton.style.display = 'none';
                    // Update Continue Game button visibility based on save data
                    if (this.loadGameButton && this.game.saveManager) {
                        this.loadGameButton.style.display = this.game.saveManager.hasSaveData() ? 'block' : 'none';
                    }
                }
            }
            
            // Hide all HUD UI elements using the HUDManager
            if (this.game.hudManager) {
                this.game.hudManager.hideAllUI();
            }
            
            // Show the main background when showing the game menu
            if (this.game.hudManager && this.game.hudManager.mainBackground) {
                this.game.hudManager.mainBackground.show();
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