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
    }
    
    createUIContainer() {
        // Create UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'ui-container';
        document.body.appendChild(this.uiContainer);
    }
    
    createPlayerUI() {
        // Create level indicator
        this.levelIndicator = document.createElement('div');
        this.levelIndicator.id = 'level-indicator';
        this.levelIndicator.textContent = `Level: ${this.game.player.getLevel()}`;
        this.uiContainer.appendChild(this.levelIndicator);
        
        // Create health bar container
        this.healthBarContainer = document.createElement('div');
        this.healthBarContainer.id = 'health-bar-container';
        
        // Create health bar
        this.healthBar = document.createElement('div');
        this.healthBar.id = 'health-bar';
        
        this.healthBarContainer.appendChild(this.healthBar);
        this.uiContainer.appendChild(this.healthBarContainer);
        
        // Create mana bar container
        this.manaBarContainer = document.createElement('div');
        this.manaBarContainer.id = 'mana-bar-container';
        
        // Create mana bar
        this.manaBar = document.createElement('div');
        this.manaBar.id = 'mana-bar';
        
        this.manaBarContainer.appendChild(this.manaBar);
        this.uiContainer.appendChild(this.manaBarContainer);
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
    
    createSkillsUI() {
        // Create skills container
        this.skillsContainer = document.createElement('div');
        this.skillsContainer.id = 'skills-container';
        
        // Create skill buttons
        const skills = this.game.player.getSkills();
        
        skills.forEach((skill, index) => {
            // Create skill button
            const skillButton = document.createElement('div');
            skillButton.className = 'skill-button';
            skillButton.textContent = index + 1;
            skillButton.title = `${skill.name}: ${skill.description}`;
            
            // Create cooldown overlay
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'skill-cooldown';
            
            skillButton.appendChild(cooldownOverlay);
            
            // Add click event
            skillButton.addEventListener('click', () => {
                this.game.player.useSkill(index);
            });
            
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
        this.pauseMenu.id = 'game-menu';
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
        
        // Create options button
        const optionsButton = document.createElement('button');
        optionsButton.className = 'menu-button';
        optionsButton.textContent = 'Options';
        optionsButton.addEventListener('click', () => {
            // Options functionality can be added later
            alert('Options menu is not implemented yet.');
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
        this.pauseMenu.appendChild(optionsButton);
        this.pauseMenu.appendChild(quitButton);
        document.body.appendChild(this.pauseMenu);
    }
    
    createDeathScreen() {
        // Create death screen
        this.deathScreen = document.createElement('div');
        this.deathScreen.id = 'game-menu';
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
        
        // Update health bar
        const healthPercent = (this.game.player.getHealth() / this.game.player.getMaxHealth()) * 100;
        this.healthBar.style.width = `${healthPercent}%`;
        
        // Update mana bar
        const manaPercent = (this.game.player.getMana() / this.game.player.getMaxMana()) * 100;
        this.manaBar.style.width = `${manaPercent}%`;
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
            const cooldownOverlay = skillButtons[index].querySelector('.skill-cooldown');
            const cooldownPercent = skill.getCooldownPercent() * 100;
            cooldownOverlay.style.height = `${cooldownPercent}%`;
        });
    }
    
    updateNotifications() {
        // Update existing notifications
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            
            // Update notification lifetime
            notification.lifetime -= 1 / 60;
            
            // Remove expired notifications
            if (notification.lifetime <= 0) {
                notification.element.remove();
                this.notifications.splice(i, 1);
            } else {
                // Update opacity for fade out
                if (notification.lifetime < 1) {
                    notification.element.style.opacity = notification.lifetime;
                }
                
                // Update position for slide up
                const currentTop = parseInt(notification.element.style.top);
                notification.element.style.top = `${currentTop - 0.5}px`;
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
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '80px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '100';
        notification.style.transition = 'opacity 0.5s';
        notification.textContent = message;
        
        // Add notification to UI container
        this.uiContainer.appendChild(notification);
        
        // Add to notifications array
        this.notifications.push({
            element: notification,
            lifetime: 3 // 3 seconds
        });
        
        // Adjust position for multiple notifications
        if (this.notifications.length > 1) {
            const previousNotification = this.notifications[this.notifications.length - 2];
            const previousHeight = previousNotification.element.offsetHeight;
            const previousTop = parseInt(previousNotification.element.style.top);
            notification.style.top = `${previousTop + previousHeight + 10}px`;
        }
    }
    
    showDamageNumber(amount, position, isPlayerDamage = false) {
        // Convert 3D position to screen position
        const vector = position.clone();
        vector.project(this.game.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        
        // Create damage number element
        const damageNumber = document.createElement('div');
        damageNumber.style.position = 'absolute';
        damageNumber.style.top = `${y}px`;
        damageNumber.style.left = `${x}px`;
        damageNumber.style.transform = 'translate(-50%, -50%)';
        damageNumber.style.color = isPlayerDamage ? 'red' : 'white';
        damageNumber.style.textShadow = '1px 1px 2px black';
        damageNumber.style.fontSize = '20px';
        damageNumber.style.fontWeight = 'bold';
        damageNumber.style.zIndex = '100';
        damageNumber.textContent = Math.round(amount);
        
        // Add damage number to UI container
        this.uiContainer.appendChild(damageNumber);
        
        // Add to damage numbers array
        this.damageNumbers.push({
            element: damageNumber,
            lifetime: 1 // 1 second
        });
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