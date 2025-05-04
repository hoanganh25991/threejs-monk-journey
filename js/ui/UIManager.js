import { INPUT_CONFIG } from '../core/InputHandler.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.notifications = [];
        this.damageNumbers = [];
        this.isInventoryOpen = false;
        this.isPauseMenuOpen = false;
        this.isDialogOpen = false;
        this.isDeathScreenOpen = false;
    }
    
    init() {
        // Create UI container
        this.createUIContainer();
        
        // Create player UI
        this.createPlayerUI();
        
        // Create enemy UI
        this.createEnemyUI();
        
        // Create skills UI
        this.createSkillsUI();
        
        // Create dialog box
        this.createDialogBox();
        
        // Create inventory
        this.createInventory();
        
        // Create pause menu
        this.createPauseMenu();
        
        // Create death screen
        this.createDeathScreen();
        
        // Create virtual joystick for touch devices
        this.createVirtualJoystick();
    }
    
    createUIContainer() {
        // Create UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'ui-container';
        this.uiContainer.style.zIndex = 1000;
        document.body.appendChild(this.uiContainer);
    }
    
    createPlayerUI() {
        // Create player stats container
        this.playerStatsContainer = document.createElement('div');
        this.playerStatsContainer.id = 'player-stats-container';
        
        // Create player header (portrait and info)
        const playerHeader = document.createElement('div');
        playerHeader.id = 'player-header';
        
        // Create player portrait
        const playerPortrait = document.createElement('div');
        playerPortrait.id = 'player-portrait';
        playerPortrait.textContent = '🧘'; // Monk emoji
        playerHeader.appendChild(playerPortrait);
        
        // Create player info container
        const playerInfo = document.createElement('div');
        playerInfo.id = 'player-info';
        
        // Create player name
        const playerName = document.createElement('div');
        playerName.id = 'player-name';
        playerName.textContent = 'Monk';
        playerInfo.appendChild(playerName);
        
        // Create level indicator
        this.levelIndicator = document.createElement('div');
        this.levelIndicator.id = 'level-indicator';
        this.levelIndicator.textContent = `Level: ${this.game.player.getLevel()}`;
        playerInfo.appendChild(this.levelIndicator);
        
        // Add player info to header
        playerHeader.appendChild(playerInfo);
        
        // Add header to stats container
        this.playerStatsContainer.appendChild(playerHeader);
        
        // Create health bar container
        this.healthBarContainer = document.createElement('div');
        this.healthBarContainer.id = 'health-bar-container';
        
        // Create health icon
        const healthIcon = document.createElement('div');
        healthIcon.id = 'health-icon';
        healthIcon.textContent = '❤️';
        this.healthBarContainer.appendChild(healthIcon);
        
        // Create health bar
        this.healthBar = document.createElement('div');
        this.healthBar.id = 'health-bar';
        this.healthBarContainer.appendChild(this.healthBar);
        
        // Create health text
        this.healthText = document.createElement('div');
        this.healthText.id = 'health-text';
        this.healthBarContainer.appendChild(this.healthText);
        
        // Add health bar to stats container
        this.playerStatsContainer.appendChild(this.healthBarContainer);
        
        // Create mana bar container
        this.manaBarContainer = document.createElement('div');
        this.manaBarContainer.id = 'mana-bar-container';
        
        // Create mana icon
        const manaIcon = document.createElement('div');
        manaIcon.id = 'mana-icon';
        manaIcon.textContent = '🔷';
        this.manaBarContainer.appendChild(manaIcon);
        
        // Create mana bar
        this.manaBar = document.createElement('div');
        this.manaBar.id = 'mana-bar';
        this.manaBarContainer.appendChild(this.manaBar);
        
        // Create mana text
        this.manaText = document.createElement('div');
        this.manaText.id = 'mana-text';
        this.manaBarContainer.appendChild(this.manaText);
        
        // Add mana bar to stats container
        this.playerStatsContainer.appendChild(this.manaBarContainer);
        
        // Add stats container to UI
        this.uiContainer.appendChild(this.playerStatsContainer);
    }
    
    createEnemyUI() {
        // Create enemy health container
        this.enemyHealthContainer = document.createElement('div');
        this.enemyHealthContainer.id = 'enemy-health-container';
        
        // Create enemy name
        this.enemyName = document.createElement('div');
        this.enemyName.id = 'enemy-name';
        
        // Create enemy health bar
        this.enemyHealthBar = document.createElement('div');
        this.enemyHealthBar.id = 'enemy-health-bar';
        
        this.enemyHealthContainer.appendChild(this.enemyName);
        this.enemyHealthContainer.appendChild(this.enemyHealthBar);
        this.uiContainer.appendChild(this.enemyHealthContainer);
    }
    
    // Helper method to get the visual position of a skill button in the grid (for debugging only)
    getVisualPositionInGrid(skillButton) {
        // Get all skill buttons
        const allButtons = Array.from(this.skillsContainer.querySelectorAll('.skill-button'));
        
        // Find the index of this button in the DOM
        const buttonIndex = allButtons.indexOf(skillButton);
        
        // Return the visual position for debugging
        return buttonIndex;
    }
    
    createSkillsUI() {
        // Create skills container
        this.skillsContainer = document.createElement('div');
        this.skillsContainer.id = 'skills-container';
        
        // Create skill buttons
        const skills = this.game.player.getSkills();
        
        // Define skill icons and colors based on skill type
        const skillIcons = {
            'Fist of Thunder': '⚡', // Lightning emoji
            'Wave Strike': '🌊', // Wave emoji
            'Cyclone Strike': '🌀', // Cyclone emoji
            'Seven-Sided Strike': '🔄', // Cycle emoji
            'Inner Sanctuary': '🛡️', // Shield emoji
            'Mystic Ally': '👤', // Person emoji
            'Wave of Light': '🔔', // Bell emoji
            'Exploding Palm': '💥', // Explosion emoji
        };
        
        const skillColors = {
            'teleport': '#4169e1', // Royal blue for teleport
            'ranged': '#00ffff',
            'aoe': '#ffcc00',
            'multi': '#ff0000',
            'buff': '#ffffff',
            'summon': '#00ffff',
            'wave': '#ffdd22',
            'mark': '#ff3333'
        };
        
        skills.forEach((skill, index) => {
            // Create skill button
            const skillButton = document.createElement('div');
            skillButton.className = 'skill-button';
            skillButton.setAttribute('data-skill-type', skill.type);
            
            // Create skill name tooltip
            const skillName = document.createElement('div');
            skillName.className = 'skill-name';
            skillName.textContent = skill.name;
            skillButton.appendChild(skillName);
            
            // Create skill icon
            const skillIcon = document.createElement('div');
            skillIcon.className = 'skill-icon';
            skillIcon.textContent = skillIcons[skill.name] || '✨'; // Default to sparkle if no icon
            skillIcon.style.color = skillColors[skill.type] || '#ffffff';
            skillIcon.style.fontSize = '30px';
            skillIcon.style.textShadow = `0 0 10px ${skillColors[skill.type] || '#ffffff'}`;
            skillButton.appendChild(skillIcon);
            
            // Create key indicator
            const skillKey = document.createElement('div');
            skillKey.className = 'skill-key';
            
            // Adjust key display to match our grid layout (4,5,6,7 on top, 1,2,3,h below)
            const keyDisplay = skill.basicAttack ? "h" : `${index +  1}`;
            skillKey.textContent = keyDisplay;
            skillButton.appendChild(skillKey);
            
            // Create cooldown overlay
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'skill-cooldown';
            skillButton.appendChild(cooldownOverlay);
            
            // Set button border color based on skill type
            skillButton.style.borderColor = skillColors[skill.type] || '#6b4c2a';
            
            // Add click event
            skillButton.addEventListener('click', () => {
                // Store the actual index for this skill button
                const actualIndex = index;
                
                console.log(`Skill clicked: ${skill.name}, Index: ${actualIndex}`);
                
                // Check if this is the basic attack skill
                if (skill.basicAttack) {
                    // Use the basic attack method for the 'h' skill
                    console.log('Using basic attack (h key skill)');
                    this.game.player.useBasicAttack();
                } else {
                    // Use the regular skill method for numbered skills
                    console.log('Using regular skill');
                    this.game.player.useSkill(actualIndex);
                }
                
                // Add click animation
                skillButton.classList.add('skill-activated');
                setTimeout(() => {
                    skillButton.classList.remove('skill-activated');
                }, 300);
            });
            
            // Add tooltip with description on hover
            skillButton.title = `${skill.name}: ${skill.description}`;
            
            this.skillsContainer.appendChild(skillButton);
        });
        
        this.uiContainer.appendChild(this.skillsContainer);
    }
    
    createDialogBox() {
        // Create dialog box
        this.dialogBox = document.createElement('div');
        this.dialogBox.id = 'dialog-box';
        
        // Create dialog text
        this.dialogText = document.createElement('div');
        this.dialogText.id = 'dialog-text';
        
        // Create dialog continue button
        this.dialogContinue = document.createElement('div');
        this.dialogContinue.id = 'dialog-continue';
        this.dialogContinue.textContent = 'Click to continue...';
        
        // Add click event to close dialog
        this.dialogBox.addEventListener('click', () => {
            this.hideDialog();
        });
        
        this.dialogBox.appendChild(this.dialogText);
        this.dialogBox.appendChild(this.dialogContinue);
        this.uiContainer.appendChild(this.dialogBox);
    }
    
    createInventory() {
        // Create inventory
        this.inventory = document.createElement('div');
        this.inventory.id = 'inventory';
        
        // Create inventory title
        this.inventoryTitle = document.createElement('div');
        this.inventoryTitle.id = 'inventory-title';
        this.inventoryTitle.textContent = 'Inventory';
        
        // Create inventory grid
        this.inventoryGrid = document.createElement('div');
        this.inventoryGrid.id = 'inventory-grid';
        
        // Create inventory close button
        this.inventoryClose = document.createElement('div');
        this.inventoryClose.id = 'inventory-close';
        this.inventoryClose.textContent = 'X';
        
        // Add click event to close inventory
        this.inventoryClose.addEventListener('click', () => {
            this.toggleInventory();
        });
        
        this.inventory.appendChild(this.inventoryTitle);
        this.inventory.appendChild(this.inventoryGrid);
        this.inventory.appendChild(this.inventoryClose);
        this.uiContainer.appendChild(this.inventory);
    }
    
    createPauseMenu() {
        // Create pause menu
        this.pauseMenu = document.createElement('div');
        this.pauseMenu.id = 'pause-menu';
        this.pauseMenu.className = 'game-menu';
        this.pauseMenu.style.display = 'none';
        
        // Create pause menu title
        const title = document.createElement('h1');
        title.textContent = 'Paused';
        
        // Create resume button
        const resumeButton = document.createElement('button');
        resumeButton.className = 'menu-button';
        resumeButton.textContent = 'Resume Game';
        resumeButton.addEventListener('click', () => {
            this.togglePauseMenu();
        });
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.className = 'menu-button';
        saveButton.textContent = 'Save Game';
        saveButton.addEventListener('click', () => {
            if (this.game.saveManager.saveGame()) {
                this.showNotification('Game saved successfully');
            } else {
                this.showNotification('Failed to save game');
            }
        });
        
        // Create options button
        const optionsButton = document.createElement('button');
        optionsButton.className = 'menu-button';
        optionsButton.textContent = 'Settings';
        optionsButton.addEventListener('click', () => {
            this.showOptionsMenu();
        });
        
        // Create quit button
        const quitButton = document.createElement('button');
        quitButton.className = 'menu-button';
        quitButton.textContent = 'Quit Game';
        quitButton.addEventListener('click', () => {
            // Reload page to restart game
            location.reload();
        });
        
        this.pauseMenu.appendChild(title);
        this.pauseMenu.appendChild(resumeButton);
        this.pauseMenu.appendChild(saveButton);
        this.pauseMenu.appendChild(optionsButton);
        this.pauseMenu.appendChild(quitButton);
        document.body.appendChild(this.pauseMenu);
    }
    
    showOptionsMenu() {
        // Hide pause menu
        this.pauseMenu.style.display = 'none';
        
        // Remove any existing options menu
        const existingOptionsMenu = document.getElementById('options-menu');
        if (existingOptionsMenu) {
            existingOptionsMenu.remove();
        }
        
        // Create options menu
        const optionsMenu = document.createElement('div');
        optionsMenu.id = 'options-menu';
        optionsMenu.style.position = 'absolute';
        optionsMenu.style.top = '0';
        optionsMenu.style.left = '0';
        optionsMenu.style.width = '100%';
        optionsMenu.style.height = '100%';
        optionsMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        optionsMenu.style.display = 'flex';
        optionsMenu.style.flexDirection = 'column';
        optionsMenu.style.justifyContent = 'flex-start';
        optionsMenu.style.alignItems = 'center';
        optionsMenu.style.zIndex = '1000';
        optionsMenu.style.overflowY = 'auto';
        optionsMenu.style.padding = '20px';
        
        // Create title
        const title = document.createElement('h1');
        title.textContent = 'Settings';
        title.style.color = '#f5f5f5';
        title.style.fontSize = '48px';
        title.style.marginBottom = '40px';
        title.style.textShadow = '0 0 10px #ff6600';
        
        // Keyboard Controls section
        const controlsTitle = document.createElement('h2');
        controlsTitle.textContent = 'Keyboard Controls';
        controlsTitle.style.color = '#aaa';
        controlsTitle.style.fontSize = '24px';
        controlsTitle.style.marginTop = '20px';
        controlsTitle.style.alignSelf = 'center';
        
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'controls-container';
        controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        controlsContainer.style.padding = '15px';
        controlsContainer.style.borderRadius = '5px';
        controlsContainer.style.marginTop = '10px';
        controlsContainer.style.width = '80%';
        controlsContainer.style.maxWidth = '600px';
        controlsContainer.style.margin = '10px auto';
        controlsContainer.style.border = '1px solid #333';
        
        // Helper function to format key code for display
        const formatKeyCode = (keyCode) => {
            // Remove the 'Key' prefix for letter keys
            if (keyCode.startsWith('Key')) {
                return keyCode.substring(3);
            }
            // Format digit keys
            if (keyCode.startsWith('Digit')) {
                return keyCode.substring(5);
            }
            // Handle special keys
            switch (keyCode) {
                case 'ArrowUp': return '↑';
                case 'ArrowDown': return '↓';
                case 'ArrowLeft': return '←';
                case 'ArrowRight': return '→';
                case 'Escape': return 'ESC';
                case 'Semicolon': return ';';
                default: return keyCode;
            }
        };
        
        console.log('INPUT_CONFIG:', INPUT_CONFIG);
        
        // Loop through each category in INPUT_CONFIG
        Object.entries(INPUT_CONFIG).forEach(([category, config]) => {
            console.log(`Processing category: ${category}, config:`, config);
            
            // Create category title
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = config.title;
            categoryTitle.style.color = '#ffcc00';
            categoryTitle.style.marginBottom = '5px';
            controlsContainer.appendChild(categoryTitle);
            
            // Create category content
            const categoryContent = document.createElement('div');
            categoryContent.style.color = '#ffffff';
            categoryContent.style.marginBottom = '15px';
            categoryContent.style.paddingLeft = '10px';
            
            // Build HTML content for each control in this category
            if (config.controls && Array.isArray(config.controls)) {
                const controlsList = document.createElement('ul');
                controlsList.style.listStyleType = 'none';
                controlsList.style.padding = '0';
                controlsList.style.margin = '0';
                
                config.controls.forEach(control => {
                    const controlItem = document.createElement('li');
                    controlItem.style.marginBottom = '5px';
                    
                    const keySpan = document.createElement('span');
                    keySpan.style.display = 'inline-block';
                    keySpan.style.minWidth = '80px';
                    keySpan.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                    keySpan.style.padding = '2px 5px';
                    keySpan.style.borderRadius = '3px';
                    keySpan.style.marginRight = '10px';
                    keySpan.style.border = '1px solid #555';
                    keySpan.style.textAlign = 'center';
                    
                    const keyDisplay = control.keys.map(key => formatKeyCode(key)).join(', ');
                    keySpan.textContent = keyDisplay;
                    
                    const descSpan = document.createElement('span');
                    descSpan.textContent = control.description;
                    
                    controlItem.appendChild(keySpan);
                    controlItem.appendChild(descSpan);
                    controlsList.appendChild(controlItem);
                });
                
                categoryContent.appendChild(controlsList);
            } else {
                categoryContent.textContent = 'No controls defined for this category';
            }
            
            controlsContainer.appendChild(categoryContent);
        });
        
        // Audio settings
        const audioTitle = document.createElement('h2');
        audioTitle.textContent = 'Audio Settings';
        audioTitle.style.color = '#aaa';
        audioTitle.style.fontSize = '24px';
        audioTitle.style.marginTop = '20px';
        audioTitle.style.alignSelf = 'center';
        
        // Audio disabled message
        const audioDisabledMessage = document.createElement('div');
        audioDisabledMessage.textContent = 'Audio is currently disabled. Audio files need to be added to the assets/audio directory.';
        audioDisabledMessage.style.color = '#ff9999';
        audioDisabledMessage.style.margin = '10px 0';
        audioDisabledMessage.style.fontSize = '14px';
        audioDisabledMessage.style.textAlign = 'center';
        audioDisabledMessage.style.width = '80%';
        audioDisabledMessage.style.maxWidth = '600px';
        
        // Back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.padding = '15px 30px';
        backButton.style.margin = '30px 0';
        backButton.style.fontSize = '18px';
        backButton.style.cursor = 'pointer';
        backButton.style.borderRadius = '5px';
        backButton.style.transition = 'background-color 0.3s';
        
        backButton.addEventListener('mouseover', () => {
            backButton.style.backgroundColor = '#555';
        });
        
        backButton.addEventListener('mouseout', () => {
            backButton.style.backgroundColor = '#333';
        });
        
        backButton.addEventListener('click', () => {
            optionsMenu.remove();
            this.pauseMenu.style.display = 'flex';
        });
        
        // UI Settings section
        const uiTitle = document.createElement('h2');
        uiTitle.textContent = 'UI Settings';
        uiTitle.style.color = '#aaa';
        uiTitle.style.fontSize = '24px';
        uiTitle.style.marginTop = '20px';
        uiTitle.style.alignSelf = 'center';
        
        // Create UI settings container
        const uiContainer = document.createElement('div');
        uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        uiContainer.style.padding = '15px';
        uiContainer.style.borderRadius = '5px';
        uiContainer.style.marginTop = '10px';
        uiContainer.style.width = '80%';
        uiContainer.style.maxWidth = '600px';
        uiContainer.style.margin = '10px auto';
        uiContainer.style.border = '1px solid #333';
        
        // Joystick Size section
        const joystickSizeTitle = document.createElement('h3');
        joystickSizeTitle.textContent = 'Joystick Size';
        joystickSizeTitle.style.color = '#ffcc00';
        joystickSizeTitle.style.marginBottom = '10px';
        uiContainer.appendChild(joystickSizeTitle);
        
        // Create joystick size control
        const joystickSizeContainer = document.createElement('div');
        joystickSizeContainer.style.display = 'flex';
        joystickSizeContainer.style.alignItems = 'center';
        joystickSizeContainer.style.marginBottom = '15px';
        
        const joystickSizeLabel = document.createElement('label');
        joystickSizeLabel.textContent = 'Size Multiplier: ';
        joystickSizeLabel.style.marginRight = '10px';
        joystickSizeLabel.style.minWidth = '120px';
        
        const joystickSizeValue = document.createElement('span');
        joystickSizeValue.textContent = INPUT_CONFIG.ui.joystick.sizeMultiplier.toFixed(1) + 'x';
        joystickSizeValue.style.marginLeft = '10px';
        joystickSizeValue.style.minWidth = '40px';
        
        const joystickSizeSlider = document.createElement('input');
        joystickSizeSlider.type = 'range';
        joystickSizeSlider.min = '0.5';
        joystickSizeSlider.max = '2.0';
        joystickSizeSlider.step = '0.1';
        joystickSizeSlider.value = INPUT_CONFIG.ui.joystick.sizeMultiplier;
        joystickSizeSlider.style.flex = '1';
        
        joystickSizeSlider.addEventListener('input', () => {
            const newSize = parseFloat(joystickSizeSlider.value);
            joystickSizeValue.textContent = newSize.toFixed(1) + 'x';
            
            // Update the configuration
            INPUT_CONFIG.ui.joystick.sizeMultiplier = newSize;
            
            // Update the joystick size in real-time
            const scaledBaseSize = INPUT_CONFIG.ui.joystick.baseSize * newSize;
            const scaledHandleSize = INPUT_CONFIG.ui.joystick.handleSize * newSize;
            
            this.joystickContainer.style.width = `${scaledBaseSize}px`;
            this.joystickContainer.style.height = `${scaledBaseSize}px`;
            this.joystickHandle.style.width = `${scaledHandleSize}px`;
            this.joystickHandle.style.height = `${scaledHandleSize}px`;
        });
        
        joystickSizeContainer.appendChild(joystickSizeLabel);
        joystickSizeContainer.appendChild(joystickSizeSlider);
        joystickSizeContainer.appendChild(joystickSizeValue);
        uiContainer.appendChild(joystickSizeContainer);
        
        // Graphics Settings section
        const graphicsTitle = document.createElement('h2');
        graphicsTitle.textContent = 'Graphics Settings';
        graphicsTitle.style.color = '#aaa';
        graphicsTitle.style.fontSize = '24px';
        graphicsTitle.style.marginTop = '20px';
        graphicsTitle.style.alignSelf = 'center';
        
        // Create graphics settings container
        const graphicsContainer = document.createElement('div');
        graphicsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        graphicsContainer.style.padding = '15px';
        graphicsContainer.style.borderRadius = '5px';
        graphicsContainer.style.marginTop = '10px';
        graphicsContainer.style.width = '80%';
        graphicsContainer.style.maxWidth = '600px';
        graphicsContainer.style.margin = '10px auto';
        graphicsContainer.style.border = '1px solid #333';
        
        // Quality Preset section
        const qualityPresetTitle = document.createElement('h3');
        qualityPresetTitle.textContent = 'Quality Preset';
        qualityPresetTitle.style.color = '#ffcc00';
        qualityPresetTitle.style.marginBottom = '10px';
        graphicsContainer.appendChild(qualityPresetTitle);
        
        // Create quality preset selector
        const qualityPresetContainer = document.createElement('div');
        qualityPresetContainer.style.display = 'flex';
        qualityPresetContainer.style.flexDirection = 'column';
        qualityPresetContainer.style.marginBottom = '15px';
        
        // Get current quality from performance manager
        const currentQuality = this.game.performanceManager.currentQuality;
        const qualityLevels = Object.keys(this.game.performanceManager.qualityLevels);
        
        // Create radio buttons for each quality level
        qualityLevels.forEach(quality => {
            const qualityOption = document.createElement('div');
            qualityOption.style.display = 'flex';
            qualityOption.style.alignItems = 'center';
            qualityOption.style.marginBottom = '8px';
            
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.id = `quality-${quality}`;
            radioInput.name = 'quality-preset';
            radioInput.value = quality;
            radioInput.checked = quality === currentQuality;
            radioInput.style.marginRight = '10px';
            
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = `quality-${quality}`;
            radioLabel.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
            radioLabel.style.color = '#fff';
            radioLabel.style.cursor = 'pointer';
            
            // Add description of each quality level
            const qualityDesc = document.createElement('span');
            qualityDesc.style.marginLeft = '10px';
            qualityDesc.style.fontSize = '12px';
            qualityDesc.style.color = '#aaa';
            
            switch(quality) {
                case 'ultra':
                    qualityDesc.textContent = '(Maximum visual quality, high GPU usage)';
                    break;
                case 'high':
                    qualityDesc.textContent = '(Good balance of quality and performance)';
                    break;
                case 'medium':
                    qualityDesc.textContent = '(Balanced for mid-range devices)';
                    break;
                case 'low':
                    qualityDesc.textContent = '(Optimized for performance)';
                    break;
                case 'minimal':
                    qualityDesc.textContent = '(Maximum performance, lowest quality)';
                    break;
            }
            
            // Add event listener to change quality
            radioInput.addEventListener('change', () => {
                if (radioInput.checked) {
                    this.game.performanceManager.setQualityLevel(quality);
                    console.log(`Quality changed to ${quality}`);
                }
            });
            
            qualityOption.appendChild(radioInput);
            qualityOption.appendChild(radioLabel);
            qualityOption.appendChild(qualityDesc);
            qualityPresetContainer.appendChild(qualityOption);
        });
        
        graphicsContainer.appendChild(qualityPresetContainer);
        
        // Adaptive Quality toggle
        const adaptiveQualityContainer = document.createElement('div');
        adaptiveQualityContainer.style.marginTop = '15px';
        adaptiveQualityContainer.style.marginBottom = '15px';
        
        const adaptiveQualityCheckbox = document.createElement('input');
        adaptiveQualityCheckbox.type = 'checkbox';
        adaptiveQualityCheckbox.id = 'adaptive-quality';
        adaptiveQualityCheckbox.checked = this.game.performanceManager.adaptiveQualityEnabled;
        adaptiveQualityCheckbox.style.marginRight = '10px';
        
        const adaptiveQualityLabel = document.createElement('label');
        adaptiveQualityLabel.htmlFor = 'adaptive-quality';
        adaptiveQualityLabel.textContent = 'Adaptive Quality';
        adaptiveQualityLabel.style.color = '#fff';
        adaptiveQualityLabel.style.cursor = 'pointer';
        
        const adaptiveQualityDesc = document.createElement('div');
        adaptiveQualityDesc.textContent = 'Automatically adjusts graphics quality to maintain target framerate';
        adaptiveQualityDesc.style.fontSize = '12px';
        adaptiveQualityDesc.style.color = '#aaa';
        adaptiveQualityDesc.style.marginTop = '5px';
        adaptiveQualityDesc.style.marginLeft = '25px';
        
        adaptiveQualityCheckbox.addEventListener('change', () => {
            const enabled = this.game.performanceManager.toggleAdaptiveQuality();
            console.log(`Adaptive quality ${enabled ? 'enabled' : 'disabled'}`);
        });
        
        adaptiveQualityContainer.appendChild(adaptiveQualityCheckbox);
        adaptiveQualityContainer.appendChild(adaptiveQualityLabel);
        adaptiveQualityContainer.appendChild(adaptiveQualityDesc);
        graphicsContainer.appendChild(adaptiveQualityContainer);
        
        // Performance Stats toggle
        const perfStatsContainer = document.createElement('div');
        perfStatsContainer.style.marginTop = '15px';
        perfStatsContainer.style.marginBottom = '15px';
        
        const perfStatsCheckbox = document.createElement('input');
        perfStatsCheckbox.type = 'checkbox';
        perfStatsCheckbox.id = 'perf-stats';
        perfStatsCheckbox.checked = this.game.performanceManager.stats.dom.style.display !== 'none';
        perfStatsCheckbox.style.marginRight = '10px';
        
        const perfStatsLabel = document.createElement('label');
        perfStatsLabel.htmlFor = 'perf-stats';
        perfStatsLabel.textContent = 'Show Performance Stats';
        perfStatsLabel.style.color = '#fff';
        perfStatsLabel.style.cursor = 'pointer';
        
        perfStatsCheckbox.addEventListener('change', () => {
            if (perfStatsCheckbox.checked) {
                this.game.performanceManager.stats.dom.style.display = 'block';
                this.game.performanceManager.memoryDisplay.style.display = 'block';
                this.game.performanceManager.gpuIndicator.style.display = 'block';
                this.game.performanceManager.gpuEnabledIndicator.style.display = 'flex';
            } else {
                this.game.performanceManager.stats.dom.style.display = 'none';
                this.game.performanceManager.memoryDisplay.style.display = 'none';
                this.game.performanceManager.gpuIndicator.style.display = 'none';
                this.game.performanceManager.gpuEnabledIndicator.style.display = 'none';
            }
        });
        
        perfStatsContainer.appendChild(perfStatsCheckbox);
        perfStatsContainer.appendChild(perfStatsLabel);
        graphicsContainer.appendChild(perfStatsContainer);
        
        // Add all elements to options menu
        optionsMenu.appendChild(title);
        optionsMenu.appendChild(graphicsTitle);
        optionsMenu.appendChild(graphicsContainer);
        optionsMenu.appendChild(controlsTitle);
        optionsMenu.appendChild(controlsContainer);
        optionsMenu.appendChild(uiTitle);
        optionsMenu.appendChild(uiContainer);
        optionsMenu.appendChild(audioTitle);
        optionsMenu.appendChild(audioDisabledMessage);
        optionsMenu.appendChild(backButton);
        
        // Add to document body
        document.body.appendChild(optionsMenu);
        
        console.log('Settings menu created and added to DOM');
    }
    
    createVirtualJoystick() {
        // Get joystick configuration from INPUT_CONFIG
        const joystickConfig = INPUT_CONFIG.ui.joystick;
        const sizeMultiplier = joystickConfig.sizeMultiplier;
        const baseSize = joystickConfig.baseSize;
        const handleSize = joystickConfig.handleSize;
        
        // Create virtual joystick container
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.id = 'virtual-joystick-container';
        
        // Apply size multiplier to joystick container
        const scaledBaseSize = baseSize * sizeMultiplier;
        this.joystickContainer.style.width = `${scaledBaseSize}px`;
        this.joystickContainer.style.height = `${scaledBaseSize}px`;
        
        // Create joystick base
        this.joystickBase = document.createElement('div');
        this.joystickBase.id = 'virtual-joystick-base';
        
        // Create joystick handle
        this.joystickHandle = document.createElement('div');
        this.joystickHandle.id = 'virtual-joystick-handle';
        
        // Apply size multiplier to joystick handle
        const scaledHandleSize = handleSize * sizeMultiplier;
        this.joystickHandle.style.width = `${scaledHandleSize}px`;
        this.joystickHandle.style.height = `${scaledHandleSize}px`;
        
        // Add elements to container
        this.joystickContainer.appendChild(this.joystickBase);
        this.joystickContainer.appendChild(this.joystickHandle);
        
        // Add container to UI
        this.uiContainer.appendChild(this.joystickContainer);
        
        // Initialize joystick state
        this.joystickState = {
            active: false,
            centerX: 0,
            centerY: 0,
            currentX: 0,
            currentY: 0,
            direction: { x: 0, y: 0 }
        };
        
        // Set up touch event listeners
        this.setupJoystickEvents();
    }
    
    setupJoystickEvents() {
        // Touch start event
        this.joystickContainer.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.handleJoystickStart(event.touches[0].clientX, event.touches[0].clientY);
        });
        
        // Mouse down event (for testing on desktop)
        this.joystickContainer.addEventListener('mousedown', (event) => {
            event.preventDefault();
            this.handleJoystickStart(event.clientX, event.clientY);
            
            // Add global mouse move and up events
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        });
        
        // Touch move event
        this.joystickContainer.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (this.joystickState.active) {
                this.handleJoystickMove(event.touches[0].clientX, event.touches[0].clientY);
            }
        });
        
        // Touch end event
        this.joystickContainer.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.handleJoystickEnd();
        });
        
        // Touch cancel event
        this.joystickContainer.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            this.handleJoystickEnd();
        });
        
        // Mouse move handler (defined as property to allow removal)
        this.handleMouseMove = (event) => {
            event.preventDefault();
            if (this.joystickState.active) {
                this.handleJoystickMove(event.clientX, event.clientY);
            }
        };
        
        // Mouse up handler (defined as property to allow removal)
        this.handleMouseUp = (event) => {
            event.preventDefault();
            this.handleJoystickEnd();
            
            // Remove global mouse move and up events
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
        };
    }
    
    handleJoystickStart(clientX, clientY) {
        // Get joystick container position
        const rect = this.joystickContainer.getBoundingClientRect();
        
        // Set joystick state
        this.joystickState.active = true;
        this.joystickState.centerX = rect.left + rect.width / 2;
        this.joystickState.centerY = rect.top + rect.height / 2;
        
        // Update joystick position
        this.handleJoystickMove(clientX, clientY);
    }
    
    handleJoystickMove(clientX, clientY) {
        if (!this.joystickState.active) return;
        
        // Calculate distance from center
        const deltaX = clientX - this.joystickState.centerX;
        const deltaY = clientY - this.joystickState.centerY;
        
        // Calculate distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Get joystick container radius
        const rect = this.joystickContainer.getBoundingClientRect();
        const radius = rect.width / 2;
        
        // Limit distance to radius
        const limitedDistance = Math.min(distance, radius);
        
        // Calculate normalized direction
        const normalizedX = deltaX / distance;
        const normalizedY = deltaY / distance;
        
        // Calculate new position
        const newX = normalizedX * limitedDistance;
        const newY = normalizedY * limitedDistance;
        
        // Update joystick handle position
        this.joystickHandle.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
        
        // Update joystick state
        this.joystickState.currentX = newX;
        this.joystickState.currentY = newY;
        
        // Update direction (normalized)
        this.joystickState.direction = {
            x: newX / radius,
            y: newY / radius
        };
    }
    
    handleJoystickEnd() {
        // Reset joystick state
        this.joystickState.active = false;
        this.joystickState.direction = { x: 0, y: 0 };
        
        // Reset joystick handle position
        this.joystickHandle.style.transform = 'translate(-50%, -50%)';
    }
    
    getJoystickDirection() {
        return this.joystickState.direction;
    }
    
    createDeathScreen() {
        // Create death screen
        this.deathScreen = document.createElement('div');
        this.deathScreen.id = 'death-screen';
        this.deathScreen.className = 'game-menu';
        this.deathScreen.style.display = 'none';
        
        // Create death screen title
        const title = document.createElement('h1');
        title.textContent = 'You Died';
        title.style.color = '#ff0000';
        
        // Create respawn button
        const respawnButton = document.createElement('button');
        respawnButton.className = 'menu-button';
        respawnButton.textContent = 'Respawn';
        respawnButton.addEventListener('click', () => {
            this.game.player.revive();
        });
        
        // Create quit button
        const quitButton = document.createElement('button');
        quitButton.className = 'menu-button';
        quitButton.textContent = 'Quit Game';
        quitButton.addEventListener('click', () => {
            // Reload page to restart game
            location.reload();
        });
        
        this.deathScreen.appendChild(title);
        this.deathScreen.appendChild(respawnButton);
        this.deathScreen.appendChild(quitButton);
        document.body.appendChild(this.deathScreen);
    }
    
    update() {
        // Update player UI
        this.updatePlayerUI();
        
        // Update enemy UI
        this.updateEnemyUI();
        
        // Update skills UI
        this.updateSkillsUI();
        
        // Update notifications
        this.updateNotifications();
        
        // Update damage numbers
        this.updateDamageNumbers();
    }
    
    updatePlayerUI() {
        // Update level indicator
        this.levelIndicator.textContent = `Level: ${this.game.player.getLevel()}`;
        
        // Get health values
        const currentHealth = Math.round(this.game.player.getHealth());
        const maxHealth = this.game.player.getMaxHealth();
        const healthPercent = (currentHealth / maxHealth) * 100;
        
        // Update health bar
        this.healthBar.style.width = `${healthPercent}%`;
        
        // Update health text
        this.healthText.textContent = `${currentHealth}/${maxHealth}`;
        
        // Get mana values
        const currentMana = Math.round(this.game.player.getMana());
        const maxMana = this.game.player.getMaxMana();
        const manaPercent = (currentMana / maxMana) * 100;
        
        // Update mana bar
        this.manaBar.style.width = `${manaPercent}%`;
        
        // Update mana text
        this.manaText.textContent = `${currentMana}/${maxMana}`;
        
        // Change health bar color based on health percentage
        if (healthPercent < 25) {
            this.healthBar.style.backgroundColor = '#ff3333'; // Bright red when low
            this.healthBar.style.boxShadow = '0 0 8px #ff3333';
        } else if (healthPercent < 50) {
            this.healthBar.style.backgroundColor = '#ff6633'; // Orange-red when medium
            this.healthBar.style.boxShadow = '0 0 5px #ff6633';
        } else {
            this.healthBar.style.backgroundColor = '#ff0000'; // Normal red when high
            this.healthBar.style.boxShadow = 'none';
        }
    }
    
    updateEnemyUI() {
        // Find closest enemy
        const playerPosition = this.game.player.getPosition();
        const closestEnemy = this.game.enemyManager.getClosestEnemy(playerPosition, 10);
        
        if (closestEnemy && !closestEnemy.isDead()) {
            // Show enemy health bar
            this.enemyHealthContainer.style.display = 'block';
            
            // Update enemy name
            this.enemyName.textContent = closestEnemy.getName();
            
            // Update enemy health bar
            const healthPercent = (closestEnemy.getHealth() / closestEnemy.getMaxHealth()) * 100;
            this.enemyHealthBar.style.width = `${healthPercent}%`;
        } else {
            // Hide enemy health bar
            this.enemyHealthContainer.style.display = 'none';
        }
    }
    
    updateSkillsUI() {
        // Update skill cooldowns
        const skills = this.game.player.getSkills();
        const skillButtons = this.skillsContainer.querySelectorAll('.skill-button');
        
        skills.forEach((skill, index) => {
            const skillButton = skillButtons[index];
            const cooldownOverlay = skillButton.querySelector('.skill-cooldown');
            const cooldownPercent = skill.getCooldownPercent() * 100;
            
            // Update cooldown overlay
            cooldownOverlay.style.height = `${cooldownPercent}%`;
            
            // Add visual feedback based on cooldown state
            if (cooldownPercent > 0) {
                // Skill is on cooldown
                skillButton.style.opacity = '0.7';
                
                // Show cooldown time if significant
                if (cooldownPercent > 5) {
                    const skillIcon = skillButton.querySelector('.skill-icon');
                    if (skillIcon) {
                        // If cooldown is active, show the remaining time
                        const remainingTime = (skill.cooldown * (cooldownPercent / 100)).toFixed(1);
                        if (remainingTime > 0.1) {
                            skillIcon.setAttribute('data-cooldown', remainingTime);
                            skillIcon.classList.add('showing-cooldown');
                        } else {
                            skillIcon.removeAttribute('data-cooldown');
                            skillIcon.classList.remove('showing-cooldown');
                        }
                    }
                }
            } else {
                // Skill is ready
                skillButton.style.opacity = '1';
                
                const skillIcon = skillButton.querySelector('.skill-icon');
                if (skillIcon) {
                    skillIcon.removeAttribute('data-cooldown');
                    skillIcon.classList.remove('showing-cooldown');
                }
                
                // Add subtle pulsing effect to ready skills
                if (!skillButton.classList.contains('ready-pulse')) {
                    skillButton.classList.add('ready-pulse');
                }
            }
            
            // Check if player has enough mana for this skill
            const hasEnoughMana = this.game.player.getMana() >= skill.manaCost;
            
            if (!hasEnoughMana) {
                skillButton.classList.add('not-enough-mana');
            } else {
                skillButton.classList.remove('not-enough-mana');
            }
        });
    }
    
    updateNotifications() {
        // Update existing notifications
        let needsReorganization = false;
        
        // Calculate message rate to determine if we need to expire messages faster
        const messageRate = this.getMessageRate();
        const fastExpiry = messageRate > 3; // If messages are coming in quickly
        
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            
            // Update notification lifetime - expire faster if many messages are coming in
            const expiryRate = fastExpiry ? 1.5 / 60 : 1 / 60;
            notification.lifetime -= expiryRate;
            
            // Remove expired notifications
            if (notification.lifetime <= 0) {
                notification.element.remove();
                this.notifications.splice(i, 1);
                needsReorganization = true;
            } else {
                // Update opacity for fade out - start fading earlier
                const fadeStartThreshold = fastExpiry ? 1.2 : 1;
                if (notification.lifetime < fadeStartThreshold) {
                    notification.element.style.opacity = notification.lifetime / fadeStartThreshold;
                }
                
                // Faster slide up for smoother animation - speed based on message rate
                const slideSpeed = fastExpiry ? 1.2 : 0.8;
                const currentTop = parseInt(notification.element.style.top);
                notification.element.style.top = `${currentTop - slideSpeed}px`;
            }
        }
        
        // If we removed notifications or have too many, reorganize the remaining ones
        if ((needsReorganization && this.notifications.length > 0) || 
            (this.notifications.length > 3 && fastExpiry)) {
            
            // Get screen height to calculate maximum notification area
            const screenHeight = window.innerHeight;
            const maxNotificationAreaHeight = screenHeight / 5;
            
            // Calculate total height of all notifications
            let totalHeight = 0;
            for (let i = 0; i < this.notifications.length; i++) {
                const notif = this.notifications[i];
                const height = notif.element.offsetHeight + 5; // Height + smaller margin
                totalHeight += height;
            }
            
            // If we exceed the max height, compress the notifications
            if (totalHeight > maxNotificationAreaHeight) {
                this.compressNotifications(maxNotificationAreaHeight);
            } else {
                // Just reposition notifications with proper spacing
                let currentTop = 80; // Start from the top position
                
                for (let i = 0; i < this.notifications.length; i++) {
                    const notification = this.notifications[i];
                    
                    // Reset transform in case it was previously compressed
                    if (notification.element.style.transform.includes('scale')) {
                        notification.element.style.transform = 'translateX(-50%)';
                    }
                    
                    notification.element.style.top = `${currentTop}px`;
                    currentTop += notification.element.offsetHeight + 5; // Height + smaller margin
                }
            }
        }
    }
    
    updateDamageNumbers() {
        // Update existing damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damageNumber = this.damageNumbers[i];
            
            // Update lifetime
            damageNumber.lifetime -= 1 / 60;
            
            // Remove expired damage numbers
            if (damageNumber.lifetime <= 0) {
                damageNumber.element.remove();
                this.damageNumbers.splice(i, 1);
            } else {
                // Update opacity for fade out
                if (damageNumber.lifetime < 0.5) {
                    damageNumber.element.style.opacity = damageNumber.lifetime * 2;
                }
                
                // Update position for float up
                const currentTop = parseInt(damageNumber.element.style.top);
                damageNumber.element.style.top = `${currentTop - 1}px`;
            }
        }
    }
    
    showNotification(message) {
        // Get screen height to calculate maximum notification area (1/5 of screen height)
        const screenHeight = window.innerHeight;
        const maxNotificationAreaHeight = screenHeight / 5;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '80px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '6px 12px'; // Even smaller padding for compactness
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '100';
        notification.style.transition = 'opacity 0.3s, top 0.2s'; // Faster transitions
        notification.style.fontSize = '13px'; // Smaller font size for compactness
        notification.style.maxWidth = '80%'; // Limit width
        notification.style.textAlign = 'center'; // Center text
        notification.style.overflow = 'hidden'; // Prevent text overflow
        notification.style.textOverflow = 'ellipsis'; // Add ellipsis for long text
        notification.style.whiteSpace = 'nowrap'; // Keep text on one line
        notification.textContent = message;
        
        // Add notification to UI container
        this.uiContainer.appendChild(notification);
        
        // Calculate how many notifications we can fit in the max area
        // Estimate each notification height (including margin) as about 40px
        const estimatedNotificationHeight = 40;
        const maxNotifications = Math.floor(maxNotificationAreaHeight / estimatedNotificationHeight);
        
        // If we have too many notifications, remove the oldest ones
        // Remove more aggressively when many new messages are coming in
        const messageRate = this.getMessageRate();
        const notificationsToKeep = messageRate > 3 ? 
            Math.max(2, maxNotifications - 2) : // High message rate - keep fewer
            maxNotifications; // Normal rate - keep max allowed
            
        while (this.notifications.length >= notificationsToKeep) {
            // Remove oldest notification
            const oldestNotification = this.notifications.shift();
            oldestNotification.element.remove();
        }
        
        // Add to notifications array with dynamic lifetime based on message rate
        const lifetime = messageRate > 3 ? 1.5 : 2.5; // Shorter lifetime when messages come quickly
        
        this.notifications.push({
            element: notification,
            lifetime: lifetime,
            message: message, // Store message for deduplication
            timestamp: Date.now() // Store timestamp for message rate calculation
        });
        
        // Check for duplicate messages and reduce their lifetime
        this.deduplicateNotifications();
        
        // Adjust position for multiple notifications
        if (this.notifications.length > 1) {
            // Calculate total height of all notifications
            let totalHeight = 0;
            let availableHeight = maxNotificationAreaHeight;
            
            // Calculate how much space we need
            for (let i = 0; i < this.notifications.length - 1; i++) {
                const notif = this.notifications[i];
                const height = notif.element.offsetHeight + 5; // Height + smaller margin
                totalHeight += height;
            }
            
            // If we exceed the max height, compress the notifications
            if (totalHeight > availableHeight) {
                // Compress notifications to fit in the available space
                this.compressNotifications(availableHeight);
            } else {
                // Just position the new notification below the last one
                const previousNotification = this.notifications[this.notifications.length - 2];
                const previousHeight = previousNotification.element.offsetHeight;
                const previousTop = parseInt(previousNotification.element.style.top);
                notification.style.top = `${previousTop + previousHeight + 5}px`; // Smaller margin
            }
        }
    }
    
    // Helper method to calculate message rate (messages per second)
    getMessageRate() {
        if (this.notifications.length < 2) return 1; // Default rate
        
        // Calculate time window (in seconds) for the last few messages
        const now = Date.now();
        const oldestTimestamp = this.notifications[0].timestamp;
        const timeWindow = (now - oldestTimestamp) / 1000;
        
        // Avoid division by zero
        if (timeWindow < 0.1) return 10; // Very high rate
        
        // Calculate messages per second
        return this.notifications.length / timeWindow;
    }
    
    // Helper method to compress notifications to fit in available space
    compressNotifications(availableHeight) {
        // Calculate how much space each notification can take
        const notificationCount = this.notifications.length;
        const spacePerNotification = availableHeight / notificationCount;
        
        // Position each notification with compressed spacing
        let currentTop = 80; // Start from the top position
        
        for (let i = 0; i < this.notifications.length; i++) {
            const notification = this.notifications[i];
            
            // Apply a slight scale reduction for better compactness
            const scale = Math.max(0.85, 1 - (notificationCount * 0.02));
            notification.element.style.transform = `translateX(-50%) scale(${scale})`;
            
            // Set position
            notification.element.style.top = `${currentTop}px`;
            
            // Move to next position (use smaller spacing when compressed)
            // Use a minimum spacing to prevent overlap
            currentTop += Math.max(25, spacePerNotification);
        }
    }
    
    // Helper method to deduplicate notifications
    deduplicateNotifications() {
        // Create a map to count occurrences of each message
        const messageCounts = {};
        const messageIndices = {}; // Track indices of first occurrence
        
        // Count occurrences and track first occurrence
        for (let i = 0; i < this.notifications.length; i++) {
            const notification = this.notifications[i];
            const message = notification.message;
            
            if (messageCounts[message] === undefined) {
                messageIndices[message] = i; // First occurrence
            }
            
            messageCounts[message] = (messageCounts[message] || 0) + 1;
        }
        
        // Handle duplicate messages
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            const message = notification.message;
            
            if (messageCounts[message] > 1) {
                // If this is not the first occurrence of the message
                if (messageIndices[message] !== i) {
                    // For duplicates, either remove them or reduce their lifetime drastically
                    if (messageCounts[message] > 2) {
                        // If more than 2 duplicates, remove all but the first occurrence
                        notification.element.remove();
                        this.notifications.splice(i, 1);
                    } else {
                        // For just 2 duplicates, drastically reduce lifetime
                        notification.lifetime = Math.min(notification.lifetime, 0.8);
                    }
                } else {
                    // For the first occurrence, update the text to show count
                    if (messageCounts[message] > 2) {
                        notification.element.textContent = `${message} (${messageCounts[message]}x)`;
                    }
                    // Slightly reduce lifetime of first occurrence too
                    notification.lifetime = Math.min(notification.lifetime, 2.0);
                }
            }
        }
    }
    
    showDamageNumber(amount, position, isPlayerDamage = false) {
        // Only show damage particles for player-caused damage
        if (!isPlayerDamage) return;
        
        // Convert 3D position to screen position
        const vector = position.clone();
        vector.project(this.game.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        
        // Create blood particle container
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'absolute';
        particleContainer.style.top = `${y}px`;
        particleContainer.style.left = `${x}px`;
        particleContainer.style.width = '0';
        particleContainer.style.height = '0';
        particleContainer.style.zIndex = '100';
        
        // Determine particle count and color based on damage amount
        const minParticles = 3;
        const maxParticles = 15;
        const particleCount = Math.min(maxParticles, minParticles + Math.floor(amount / 10));
        
        // Determine color based on damage amount
        // Higher damage = brighter/more intense red
        let baseColor;
        if (amount < 10) {
            baseColor = [120, 0, 0]; // Dark red for low damage
        } else if (amount < 30) {
            baseColor = [180, 0, 0]; // Medium red
        } else if (amount < 50) {
            baseColor = [220, 0, 0]; // Bright red
        } else {
            baseColor = [255, 30, 30]; // Intense red with slight glow for high damage
        }
        
        // Create blood particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // Randomize particle size based on damage
            const minSize = 3;
            const maxSize = 8 + (amount / 20); // Larger particles for higher damage
            const size = minSize + Math.random() * (maxSize - minSize);
            
            // Randomize particle color slightly
            const colorVariation = 30; // Amount of random variation
            const r = Math.max(0, Math.min(255, baseColor[0] + (Math.random() * colorVariation - colorVariation/2)));
            const g = Math.max(0, Math.min(255, baseColor[1] + (Math.random() * colorVariation - colorVariation/2)));
            const b = Math.max(0, Math.min(255, baseColor[2] + (Math.random() * colorVariation - colorVariation/2)));
            
            // Set particle styles
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            particle.style.boxShadow = `0 0 ${size/2}px rgba(${r}, ${g}, ${b}, 0.7)`;
            
            // Randomize particle position
            const spread = 30 + (amount / 5); // Higher damage = wider spread
            const posX = (Math.random() * spread * 2) - spread;
            const posY = (Math.random() * spread * 2) - spread;
            particle.style.transform = `translate(${posX}px, ${posY}px)`;
            
            // Add animation for particle
            const duration = 0.5 + (Math.random() * 1);
            particle.style.transition = `all ${duration}s ease-out`;
            
            // Add particle to container
            particleContainer.appendChild(particle);
            
            // Animate particle after a small delay
            setTimeout(() => {
                // Move particle outward
                const distance = 20 + (Math.random() * 40);
                const angle = Math.random() * Math.PI * 2;
                const endX = posX + Math.cos(angle) * distance;
                const endY = posY + Math.sin(angle) * distance;
                
                // Apply gravity effect
                const gravity = 20 + (Math.random() * 30);
                
                // Update particle position and fade out
                particle.style.transform = `translate(${endX}px, ${endY + gravity}px)`;
                particle.style.opacity = '0';
            }, 10);
        }
        
        // Add particle container to UI
        this.uiContainer.appendChild(particleContainer);
        
        // Add to damage numbers array for cleanup
        this.damageNumbers.push({
            element: particleContainer,
            lifetime: 2.0 // Slightly longer lifetime for particles
        });
        
        // For very high damage, add a brief screen flash effect
        if (amount > 40) {
            const flash = document.createElement('div');
            flash.style.position = 'absolute';
            flash.style.top = '0';
            flash.style.left = '0';
            flash.style.width = '100%';
            flash.style.height = '100%';
            flash.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
            flash.style.pointerEvents = 'none';
            flash.style.zIndex = '90';
            flash.style.transition = 'opacity 0.5s';
            
            this.uiContainer.appendChild(flash);
            
            // Fade out and remove after a short time
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    flash.remove();
                }, 500);
            }, 100);
        }
    }
    
    showDialog(title, text) {
        // Update dialog text
        this.dialogText.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
        
        // Show dialog box
        this.dialogBox.style.display = 'block';
        this.isDialogOpen = true;
        
        // Pause game
        this.game.pause();
    }
    
    hideDialog() {
        // Hide dialog box
        this.dialogBox.style.display = 'none';
        this.isDialogOpen = false;
        
        // Resume game
        this.game.resume();
    }
    
    toggleInventory() {
        if (this.isInventoryOpen) {
            // Hide inventory
            this.inventory.style.display = 'none';
            this.isInventoryOpen = false;
            
            // Resume game
            this.game.resume();
        } else {
            // Update inventory items
            this.updateInventoryItems();
            
            // Show inventory
            this.inventory.style.display = 'block';
            this.isInventoryOpen = true;
            
            // Pause game
            this.game.pause();
        }
    }
    
    updateInventoryItems() {
        // Clear inventory grid
        this.inventoryGrid.innerHTML = '';
        
        // Get player inventory
        const inventory = this.game.player.getInventory();
        
        // Add items to inventory grid
        inventory.forEach(item => {
            // Create item element
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.textContent = `${item.name} x${item.amount}`;
            
            // Add click event for item use
            itemElement.addEventListener('click', () => {
                // Handle item use
                this.useItem(item);
            });
            
            this.inventoryGrid.appendChild(itemElement);
        });
        
        // Add empty slots
        const totalSlots = 20;
        const emptySlots = totalSlots - inventory.length;
        
        for (let i = 0; i < emptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'inventory-item';
            this.inventoryGrid.appendChild(emptySlot);
        }
    }
    
    useItem(item) {
        // Handle different item types
        if (item.name === 'Health Potion') {
            // Heal player
            this.game.player.stats.health += 50;
            if (this.game.player.stats.health > this.game.player.stats.maxHealth) {
                this.game.player.stats.health = this.game.player.stats.maxHealth;
            }
            
            // Remove item from inventory
            this.game.player.removeFromInventory(item.name, 1);
            
            // Show notification
            this.showNotification('Used Health Potion: +50 Health');
            
            // Update inventory
            this.updateInventoryItems();
        } else if (item.name === 'Mana Potion') {
            // Restore mana
            this.game.player.stats.mana += 50;
            if (this.game.player.stats.mana > this.game.player.stats.maxMana) {
                this.game.player.stats.mana = this.game.player.stats.maxMana;
            }
            
            // Remove item from inventory
            this.game.player.removeFromInventory(item.name, 1);
            
            // Show notification
            this.showNotification('Used Mana Potion: +50 Mana');
            
            // Update inventory
            this.updateInventoryItems();
        } else {
            // Show item description
            this.showNotification(`Item: ${item.name}`);
        }
    }
    
    togglePauseMenu() {
        if (this.isPauseMenuOpen) {
            // Hide pause menu
            this.pauseMenu.style.display = 'none';
            this.isPauseMenuOpen = false;
            
            // Resume game
            this.game.resume();
        } else {
            // Show pause menu
            this.pauseMenu.style.display = 'flex';
            this.isPauseMenuOpen = true;
            
            // Pause game
            this.game.pause();
        }
    }
    
    showDeathScreen() {
        // Show death screen
        this.deathScreen.style.display = 'flex';
        this.isDeathScreenOpen = true;
        
        // Pause game
        this.game.pause();
    }
    
    hideDeathScreen() {
        // Hide death screen
        this.deathScreen.style.display = 'none';
        this.isDeathScreenOpen = false;
        
        // Resume game
        this.game.resume();
    }
    
    showLevelUp(level) {
        // Create level up element
        const levelUp = document.createElement('div');
        levelUp.style.position = 'absolute';
        levelUp.style.top = '50%';
        levelUp.style.left = '50%';
        levelUp.style.transform = 'translate(-50%, -50%)';
        levelUp.style.color = '#ffcc00';
        levelUp.style.fontSize = '48px';
        levelUp.style.fontWeight = 'bold';
        levelUp.style.textShadow = '0 0 10px #ff6600';
        levelUp.style.zIndex = '100';
        levelUp.textContent = `Level Up! ${level}`;
        
        // Add level up to UI container
        this.uiContainer.appendChild(levelUp);
        
        // Animate level up
        let scale = 1;
        const animation = setInterval(() => {
            scale += 0.05;
            levelUp.style.transform = `translate(-50%, -50%) scale(${scale})`;
            levelUp.style.opacity = 2 - scale;
            
            if (scale >= 2) {
                clearInterval(animation);
                levelUp.remove();
            }
        }, 50);
        
        // Show notification
        this.showNotification(`Level Up! You are now level ${level}`);
    }
    
    updateQuestLog(activeQuests) {
        // Create or update quest log
        if (!this.questLog) {
            // Create quest log
            this.questLog = document.createElement('div');
            this.questLog.style.position = 'absolute';
            this.questLog.style.top = '20px';
            this.questLog.style.right = '20px';
            this.questLog.style.width = '250px';
            this.questLog.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.questLog.style.color = 'white';
            this.questLog.style.padding = '10px';
            this.questLog.style.borderRadius = '5px';
            this.questLog.style.zIndex = '100';
            
            // Create quest log title
            const title = document.createElement('div');
            title.style.fontSize = '18px';
            title.style.fontWeight = 'bold';
            title.style.marginBottom = '10px';
            title.textContent = 'Active Quests';
            
            this.questLog.appendChild(title);
            
            // Create quest list
            this.questList = document.createElement('div');
            this.questLog.appendChild(this.questList);
            
            // Add quest log to UI container
            this.uiContainer.appendChild(this.questLog);
        }
        
        // Update quest list
        this.questList.innerHTML = '';
        
        if (activeQuests.length === 0) {
            // No active quests
            const noQuests = document.createElement('div');
            noQuests.style.fontStyle = 'italic';
            noQuests.textContent = 'No active quests';
            this.questList.appendChild(noQuests);
        } else {
            // Add active quests
            activeQuests.forEach(quest => {
                // Create quest item
                const questItem = document.createElement('div');
                questItem.style.marginBottom = '10px';
                
                // Create quest title
                const questTitle = document.createElement('div');
                questTitle.style.fontWeight = 'bold';
                questTitle.style.color = quest.isMainQuest ? '#ffcc00' : 'white';
                questTitle.textContent = quest.name;
                
                // Create quest objective
                const questObjective = document.createElement('div');
                questObjective.style.fontSize = '14px';
                
                // Format objective based on type
                switch (quest.objective.type) {
                    case 'kill':
                        questObjective.textContent = `Kill ${quest.objective.progress}/${quest.objective.count} enemies`;
                        break;
                    case 'interact':
                        questObjective.textContent = `Find ${quest.objective.progress}/${quest.objective.count} ${quest.objective.target}s`;
                        break;
                    case 'explore':
                        questObjective.textContent = `Discover ${quest.objective.progress}/${quest.objective.count} zones`;
                        break;
                    default:
                        questObjective.textContent = quest.description;
                        break;
                }
                
                questItem.appendChild(questTitle);
                questItem.appendChild(questObjective);
                this.questList.appendChild(questItem);
            });
        }
    }
}