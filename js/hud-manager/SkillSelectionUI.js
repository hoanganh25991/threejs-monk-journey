import { UIComponent } from '../UIComponent.js';
import { SKILL_COLORS } from '../../config/colors.js';
import { getSkillIcon } from '../../config/skill-icons.js';
import { PRIMARY_ATTACKS, NORMAL_SKILLS, SKILLS } from '../../config/skills.js';
import { STORAGE_KEYS } from '../../config/storage-keys.js';
import { Skill } from '../../entities/skills/Skill.js';

/**
 * SkillSelectionUI component
 * Allows players to select skills for battle
 * Requirements:
 * - Must have 1 primary attack
 * - Only allow 7 normal skills to be picked
 * - In total, only 8 skills (1+7) can be used in battle
 */
export class SkillSelectionUI extends UIComponent {
    /**
     * Create a new SkillSelectionUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('skill-selection', game);
        
        // Use skill colors from config
        this.skillColors = SKILL_COLORS;
        
        // Track selected skills
        this.selectedPrimaryAttack = null;
        this.selectedNormalSkills = [];
        
        // Maximum number of normal skills that can be selected
        this.maxNormalSkills = 7;
        
        // Load saved skills from localStorage or use defaults
        this.loadSavedSkills();
    }
    
    /**
     * Load saved skills from localStorage
     * If no skills are saved, use BATTLE_SKILLS from config
     */
    loadSavedSkills() {
        try {
            // Try to get saved skills from localStorage
            const savedSkillsJson = localStorage.getItem(STORAGE_KEYS.SELECTED_SKILLS);
            
            if (savedSkillsJson) {
                // Parse the saved skills
                const savedSkills = JSON.parse(savedSkillsJson);
                
                // Set the selected primary attack
                const primaryAttack = savedSkills.find(skill => skill.primaryAttack);
                if (primaryAttack) {
                    this.selectedPrimaryAttack = primaryAttack.name;
                }
                
                // Set the selected normal skills
                this.selectedNormalSkills = savedSkills
                    .filter(skill => !skill.primaryAttack)
                    .map(skill => skill.name);
            } else {
                // If no skills are saved, use BATTLE_SKILLS from config
                this.loadDefaultSkills();
            }
        } catch (error) {
            console.error('Error loading saved skills:', error);
            // If there's an error, use BATTLE_SKILLS from config
            this.loadDefaultSkills();
        }
    }
    
    /**
     * Load default skills from BATTLE_SKILLS config
     */
    loadDefaultSkills() {
        // Find the primary attack in BATTLE_SKILLS
        const primaryAttack = SKILLS.find(skill => skill.primaryAttack);
        if (primaryAttack) {
            this.selectedPrimaryAttack = primaryAttack.name;
        } else if (PRIMARY_ATTACKS.length > 0) {
            // Fallback to first primary attack if none in BATTLE_SKILLS
            this.selectedPrimaryAttack = PRIMARY_ATTACKS[0].name;
        }
        
        // Get normal skills from BATTLE_SKILLS
        this.selectedNormalSkills = SKILLS
            .filter(skill => !skill.primaryAttack)
            .map(skill => skill.name)
            .slice(0, this.maxNormalSkills); // Ensure we don't exceed max
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        console.debug('Initializing SkillSelectionUI');
        console.log('SkillSelectionUI: Container before init:', this.container);
        
        // Create the skill selection UI HTML
        let html = `
            <div id="skill-selection-container">
                <div id="skill-selection-header">
                    <h2>Select Your Skills</h2>
                    <div id="skill-selection-counter">
                        <span id="normal-skills-counter">0/${this.maxNormalSkills}</span> Normal Skills Selected
                    </div>
                    <button id="skill-selection-save" class="btn-primary" disabled>Save Selection</button>
                    <button id="skill-selection-close" class="btn-secondary">Close</button>
                </div>
                
                <div id="skill-selection-content">
                    <div id="primary-attack-section">
                        <h3>Primary Attack (Select 1)</h3>
                        <div id="primary-attack-list" class="skill-list"></div>
                    </div>
                    
                    <div id="normal-skills-section">
                        <h3>Normal Skills (Select up to ${this.maxNormalSkills})</h3>
                        <div id="normal-skills-list" class="skill-list"></div>
                    </div>
                </div>
                
                <div id="skill-selection-preview">
                    <h3>Battle Skills</h3>
                    <div id="selected-skills-preview"></div>
                </div>
                
                <div id="skill-selection-status">
                    <div class="status-indicator">
                        <span id="save-status-icon" class="status-icon">💾</span>
                        <span id="save-status-text">Skills will be saved to your browser</span>
                    </div>
                </div>
            </div>
        `;
        
        // Render the template
        console.debug('Rendering template');
        this.render(html);
        console.log('SkillSelectionUI: Container after render:', this.container);
        
        // Populate skill lists
        console.debug('Populating primary attacks');
        this.populatePrimaryAttacks();
        
        console.debug('Populating normal skills');
        this.populateNormalSkills();
        
        // Add event listeners
        console.debug('Adding event listeners');
        this.addEventListeners();
        
        // Update the skill counter
        console.debug('Updating skill counter');
        this.updateSkillCounter();
        
        // Update the preview
        console.debug('Updating preview');
        this.updatePreview();
        
        // Update save button state
        console.debug('Updating save button state');
        this.updateSaveButtonState();
        
        console.debug('SkillSelectionUI initialization complete');
        
        // Add a direct click handler to test if clicks are being detected
        const container = this.container;
        if (container) {
            console.debug('Adding test click handler to container');
            container.addEventListener('click', (event) => {
                console.debug('Container clicked at:', event.clientX, event.clientY);
                console.debug('Target:', event.target);
            });
        }
        
        return true;
    }
    
    /**
     * Populate the primary attacks list
     */
    populatePrimaryAttacks() {
        const primaryAttackList = this.container.querySelector('#primary-attack-list');
        console.debug('Primary attack list element:', primaryAttackList);
        
        // Clear existing content
        primaryAttackList.innerHTML = '';
        
        // Add each primary attack to the list
        PRIMARY_ATTACKS.forEach(skill => {
            console.debug('Creating primary attack item for:', skill.name);
            
            // Get skill icon data
            const iconData = getSkillIcon(skill.name);
            const icon = skill.icon || iconData.emoji || '✨';
            
            // Get color for border styling
            const color = iconData.color || this.skillColors[skill.type] || '#ffffff';
            
            // Create skill item HTML
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-selection-item';
            skillItem.setAttribute('data-skill-name', skill.name);
            skillItem.setAttribute('data-skill-type', 'primary');
            
            // Add a direct click handler to each skill item
            skillItem.onclick = (event) => {
                console.debug('Primary skill item clicked directly:', skill.name);
                console.debug('Event:', event);
                
                // Check if this skill is already selected
                if (this.selectedPrimaryAttack === skill.name) {
                    console.debug('Deselecting primary attack (direct handler):', skill.name);
                    // Deselect this skill
                    skillItem.classList.remove('selected');
                    this.selectedPrimaryAttack = null;
                } else {
                    console.debug('Selecting primary attack (direct handler):', skill.name);
                    // Deselect all primary attacks
                    const allItems = this.container.querySelectorAll('#primary-attack-list .skill-selection-item');
                    allItems.forEach(i => i.classList.remove('selected'));
                    
                    // Select this one
                    skillItem.classList.add('selected');
                    
                    // Update selected primary attack
                    this.selectedPrimaryAttack = skill.name;
                }
                
                // Update preview
                this.updatePreview();
                
                // Update save button state
                this.updateSaveButtonState();
                
                // Prevent event bubbling
                event.stopPropagation();
            };
            
            // Check if this skill is already selected
            if (this.selectedPrimaryAttack === skill.name) {
                skillItem.classList.add('selected');
            }
            
            skillItem.innerHTML = `
                <div class="skill-icon-container">
                    <div class="skill-icon ${iconData.cssClass}" style="border-color: ${color}; box-shadow: 0 0 10px ${color}40;">${icon}</div>
                </div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-description">${skill.description}</div>
                </div>
            `;
            
            primaryAttackList.appendChild(skillItem);
            console.debug('Added primary attack item to list:', skillItem);
        });
    }
    
    /**
     * Populate the normal skills list
     */
    populateNormalSkills() {
        const normalSkillsList = this.container.querySelector('#normal-skills-list');
        console.debug('Normal skills list element:', normalSkillsList);
        
        // Clear existing content
        normalSkillsList.innerHTML = '';
        
        // Add each normal skill to the list
        NORMAL_SKILLS.forEach(skill => {
            console.debug('Creating normal skill item for:', skill.name);
            
            // Get skill icon data
            const iconData = getSkillIcon(skill.name);
            const icon = skill.icon || iconData.emoji || '✨';
            
            // Get color for border styling
            const color = iconData.color || this.skillColors[skill.type] || '#ffffff';
            
            // Create skill item HTML
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-selection-item';
            skillItem.setAttribute('data-skill-name', skill.name);
            skillItem.setAttribute('data-skill-type', 'normal');
            
            // Add a direct click handler to each skill item
            skillItem.onclick = (event) => {
                console.debug('Normal skill item clicked directly:', skill.name);
                console.debug('Event:', event);
                
                // Check if already selected
                if (skillItem.classList.contains('selected')) {
                    console.debug('Deselecting normal skill (direct handler):', skill.name);
                    // Deselect
                    skillItem.classList.remove('selected');
                    
                    // Remove from selected skills
                    const index = this.selectedNormalSkills.indexOf(skill.name);
                    if (index !== -1) {
                        this.selectedNormalSkills.splice(index, 1);
                    }
                } else {
                    // Check if we've reached the maximum
                    if (this.selectedNormalSkills.length >= this.maxNormalSkills) {
                        console.debug('Maximum normal skills reached (direct handler)');
                        // Show notification
                        if (this.game && this.game.uiManager) {
                            this.game.uiManager.showNotification(`You can only select ${this.maxNormalSkills} normal skills`);
                        }
                        return;
                    }
                    
                    console.debug('Selecting normal skill (direct handler):', skill.name);
                    // Select
                    skillItem.classList.add('selected');
                    
                    // Add to selected skills
                    this.selectedNormalSkills.push(skill.name);
                }
                
                console.debug('After selection, normal skills are (direct handler):', [...this.selectedNormalSkills]);
                
                // Update counter
                this.updateSkillCounter();
                
                // Update preview
                this.updatePreview();
                
                // Update save button state
                this.updateSaveButtonState();
                
                // Prevent event bubbling
                event.stopPropagation();
            };
            
            // Check if this skill is already selected
            if (this.selectedNormalSkills.includes(skill.name)) {
                skillItem.classList.add('selected');
            }
            
            skillItem.innerHTML = `
                <div class="skill-icon-container">
                    <div class="skill-icon ${iconData.cssClass}" style="border-color: ${color}; box-shadow: 0 0 10px ${color}40;">${icon}</div>
                </div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-description">${skill.description}</div>
                </div>
            `;
            
            normalSkillsList.appendChild(skillItem);
            console.debug('Added normal skill item to list:', skillItem);
        });
    }
    
    /**
     * Add event listeners to UI elements
     */
    addEventListeners() {
        // Primary attack selection
        const primaryAttackItems = this.container.querySelectorAll('#primary-attack-list .skill-selection-item');
        console.debug('Found primary attack items:', primaryAttackItems.length);
        
        primaryAttackItems.forEach(item => {
            item.addEventListener('click', (event) => {
                console.debug('Primary attack clicked:', item);
                console.debug('Event target:', event.target);
                console.debug('Current selected primary attack:', this.selectedPrimaryAttack);
                
                const skillName = item.getAttribute('data-skill-name');
                console.debug('Skill name:', skillName);
                
                // Check if this skill is already selected
                if (this.selectedPrimaryAttack === skillName) {
                    console.debug('Deselecting primary attack:', skillName);
                    // Deselect this skill
                    item.classList.remove('selected');
                    this.selectedPrimaryAttack = null;
                } else {
                    console.debug('Selecting primary attack:', skillName);
                    // Deselect all primary attacks
                    primaryAttackItems.forEach(i => i.classList.remove('selected'));
                    
                    // Select this one
                    item.classList.add('selected');
                    
                    // Update selected primary attack
                    this.selectedPrimaryAttack = skillName;
                }
                
                console.debug('After selection, primary attack is:', this.selectedPrimaryAttack);
                
                // Update preview
                this.updatePreview();
                
                // Update save button state
                this.updateSaveButtonState();
            });
        });
        
        // Normal skills selection
        const normalSkillItems = this.container.querySelectorAll('#normal-skills-list .skill-selection-item');
        console.debug('Found normal skill items:', normalSkillItems.length);
        
        normalSkillItems.forEach(item => {
            item.addEventListener('click', (event) => {
                console.debug('Normal skill clicked:', item);
                console.debug('Event target:', event.target);
                
                const skillName = item.getAttribute('data-skill-name');
                console.debug('Skill name:', skillName);
                console.debug('Current selected normal skills:', [...this.selectedNormalSkills]);
                
                // Check if already selected
                if (item.classList.contains('selected')) {
                    console.debug('Deselecting normal skill:', skillName);
                    // Deselect
                    item.classList.remove('selected');
                    
                    // Remove from selected skills
                    const index = this.selectedNormalSkills.indexOf(skillName);
                    if (index !== -1) {
                        this.selectedNormalSkills.splice(index, 1);
                    }
                } else {
                    // Check if we've reached the maximum
                    if (this.selectedNormalSkills.length >= this.maxNormalSkills) {
                        console.debug('Maximum normal skills reached');
                        // Show notification
                        if (this.game && this.game.uiManager) {
                            this.game.uiManager.showNotification(`You can only select ${this.maxNormalSkills} normal skills`);
                        }
                        return;
                    }
                    
                    console.debug('Selecting normal skill:', skillName);
                    // Select
                    item.classList.add('selected');
                    
                    // Add to selected skills
                    this.selectedNormalSkills.push(skillName);
                }
                
                console.debug('After selection, normal skills are:', [...this.selectedNormalSkills]);
                
                // Update counter
                this.updateSkillCounter();
                
                // Update preview
                this.updatePreview();
                
                // Update save button state
                this.updateSaveButtonState();
            });
        });
        
        // Save button
        const saveButton = this.container.querySelector('#skill-selection-save');
        saveButton.addEventListener('click', () => {
            this.saveSkillSelection();
        });
        
        // Close button
        const closeButton = this.container.querySelector('#skill-selection-close');
        closeButton.addEventListener('click', () => {
            this.hide();
        });
    }
    
    /**
     * Update the normal skills counter
     */
    updateSkillCounter() {
        const counter = this.container.querySelector('#normal-skills-counter');
        counter.textContent = `${this.selectedNormalSkills.length}/${this.maxNormalSkills}`;
    }
    
    /**
     * Update the preview of selected skills
     */
    updatePreview() {
        const previewContainer = this.container.querySelector('#selected-skills-preview');
        
        // Clear existing content
        previewContainer.innerHTML = '';
        
        // Create preview HTML
        let previewHTML = '<div class="preview-skills">';
        
        // Show message if no skills are selected
        if (!this.selectedPrimaryAttack && this.selectedNormalSkills.length === 0) {
            previewHTML += `
                <div class="no-skills-selected">
                    <p>No skills selected yet</p>
                    <p class="hint">Select at least one primary attack</p>
                </div>
            `;
        }
        
        // Add primary attack if selected
        if (this.selectedPrimaryAttack) {
            const primarySkill = PRIMARY_ATTACKS.find(skill => skill.name === this.selectedPrimaryAttack);
            if (primarySkill) {
                const iconData = getSkillIcon(primarySkill.name);
                const icon = primarySkill.icon || iconData.emoji || '✨';
                const color = iconData.color || this.skillColors[primarySkill.type] || '#ffffff';
                
                previewHTML += `
                    <div class="preview-skill" data-skill-name="${primarySkill.name}" data-skill-type="primary">
                        <div class="preview-skill-icon">
                            <div class="skill-icon ${iconData.cssClass}" style="border-color: ${color}; box-shadow: 0 0 10px ${color}40;">${icon}</div>
                        </div>
                        <div class="preview-skill-key">h</div>
                    </div>
                `;
            }
        }
        
        // Add normal skills if selected
        this.selectedNormalSkills.forEach((skillName, index) => {
            const normalSkill = NORMAL_SKILLS.find(skill => skill.name === skillName);
            if (normalSkill) {
                const iconData = getSkillIcon(normalSkill.name);
                const icon = normalSkill.icon || iconData.emoji || '✨';
                const color = iconData.color || this.skillColors[normalSkill.type] || '#ffffff';
                
                previewHTML += `
                    <div class="preview-skill" data-skill-name="${normalSkill.name}" data-skill-type="normal">
                        <div class="preview-skill-icon">
                            <div class="skill-icon ${iconData.cssClass}" style="border-color: ${color}; box-shadow: 0 0 10px ${color}40;">${icon}</div>
                        </div>
                        <div class="preview-skill-key">${index + 1}</div>
                    </div>
                `;
            }
        });
        
        // Add empty slots for remaining skills
        const remainingSlots = this.maxNormalSkills - this.selectedNormalSkills.length;
        for (let i = 0; i < remainingSlots; i++) {
            previewHTML += `
                <div class="preview-skill empty">
                    <div class="preview-skill-icon">
                        <div class="skill-icon">+</div>
                    </div>
                    <div class="preview-skill-key">${this.selectedNormalSkills.length + i + 1}</div>
                </div>
            `;
        }
        
        previewHTML += '</div>';
        
        // Set the preview HTML
        previewContainer.innerHTML = previewHTML;
    }
    
    /**
     * Update the save button state based on selection
     */
    updateSaveButtonState() {
        const saveButton = this.container.querySelector('#skill-selection-save');
        
        // Enable save button if at least one primary attack is selected
        saveButton.disabled = !this.selectedPrimaryAttack;
        
        // Update the counter text color based on selection
        const counter = this.container.querySelector('#normal-skills-counter');
        if (counter) {
            if (this.selectedNormalSkills.length === 0) {
                counter.style.color = '#ff9900'; // Warning color
            } else {
                counter.style.color = ''; // Reset to default
            }
        }
    }
    
    /**
     * Save the skill selection
     */
    saveSkillSelection() {
        // Validate selection
        if (!this.selectedPrimaryAttack) {
            if (this.game && this.game.uiManager) {
                this.game.uiManager.showNotification('You must select a primary attack');
            }
            return;
        }
        
        // Warn if no normal skills are selected, but allow it
        if (this.selectedNormalSkills.length === 0) {
            if (this.game && this.game.uiManager) {
                this.game.uiManager.showNotification('Warning: No normal skills selected', 'warning');
            }
        }
        
        // Get the selected skills
        const selectedPrimaryAttack = PRIMARY_ATTACKS.find(skill => skill.name === this.selectedPrimaryAttack);
        const selectedNormalSkills = this.selectedNormalSkills.map(skillName => 
            NORMAL_SKILLS.find(skill => skill.name === skillName)
        ).filter(skill => skill); // Filter out any undefined skills
        
        // Combine into a single array
        const selectedSkills = [selectedPrimaryAttack, ...selectedNormalSkills];
        
        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEYS.SELECTED_SKILLS, JSON.stringify(selectedSkills));
            console.debug('Skills saved to localStorage successfully');
        } catch (error) {
            console.error('Error saving skills to localStorage:', error);
            // Show error notification
            if (this.game && this.game.uiManager) {
                this.game.uiManager.showNotification('Failed to save skills. Please try again.');
            }
        }
        
        // Update player skills
        if (this.game && this.game.player) {
            // Reset player skills
            this.game.player.skills.skills = [];
            
            // Initialize with selected skills
            this.game.player.skills.skills = selectedSkills.map(skillConfig => {
                // Create a new skill instance from the config using the imported Skill class
                return new Skill(skillConfig);
            });
            
            // Refresh the skills UI
            if (this.game.uiManager && this.game.uiManager.components.skillsUI) {
                this.game.uiManager.components.skillsUI.init();
            }
            
            // Show success notification
            if (this.game.uiManager) {
                this.game.uiManager.showNotification('Skills updated and saved successfully');
            }
            
            // Hide the skill selection UI
            this.hide();
        }
    }
    
    /**
     * Show the skill selection UI
     */
    show() {
        console.log('SkillSelectionUI: show() called');
        
        // Try to load skills from localStorage first
        try {
            const savedSkillsJson = localStorage.getItem(STORAGE_KEYS.SELECTED_SKILLS);
            
            if (savedSkillsJson) {
                // Parse the saved skills
                const savedSkills = JSON.parse(savedSkillsJson);
                
                // Reset selections
                this.selectedPrimaryAttack = null;
                this.selectedNormalSkills = [];
                
                // Set the selected primary attack
                const primaryAttack = savedSkills.find(skill => skill.primaryAttack);
                if (primaryAttack) {
                    this.selectedPrimaryAttack = primaryAttack.name;
                }
                
                // Set the selected normal skills
                this.selectedNormalSkills = savedSkills
                    .filter(skill => !skill.primaryAttack)
                    .map(skill => skill.name);
            } else if (this.game && this.game.player) {
                // If no saved skills, load from player's current skills
                this.loadSkillsFromPlayer();
            } else {
                // If no player skills, load defaults
                this.loadDefaultSkills();
            }
        } catch (error) {
            console.error('Error loading saved skills:', error);
            
            // If error, try to load from player's current skills
            if (this.game && this.game.player) {
                this.loadSkillsFromPlayer();
            } else {
                // If no player skills, load defaults
                this.loadDefaultSkills();
            }
        }
        
        // Update UI to reflect current selection
        this.populatePrimaryAttacks();
        this.populateNormalSkills();
        this.updateSkillCounter();
        this.updatePreview();
        this.updateSaveButtonState();
        
        // Show the container
        this.container.style.display = 'block';
        console.log('SkillSelectionUI: Container display set to block');
    }
    
    /**
     * Load skills from player's current skills
     */
    loadSkillsFromPlayer() {
        const playerSkills = this.game.player.getSkills();
        
        // Reset selections
        this.selectedPrimaryAttack = null;
        this.selectedNormalSkills = [];
        
        // Find current primary attack
        const primaryAttack = playerSkills.find(skill => skill.primaryAttack);
        if (primaryAttack) {
            this.selectedPrimaryAttack = primaryAttack.name;
        }
        
        // Find current normal skills
        playerSkills.forEach(skill => {
            if (!skill.primaryAttack && this.selectedNormalSkills.length < this.maxNormalSkills) {
                this.selectedNormalSkills.push(skill.name);
            }
        });
    }
    
    /**
     * Hide the skill selection UI
     */
    hide() {
        console.log('SkillSelectionUI: hide() called');
        this.container.style.display = 'none';
        console.log('SkillSelectionUI: Container display set to none');
    }
}