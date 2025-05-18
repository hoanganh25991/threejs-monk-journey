import { UIComponent } from '../UIComponent.js';
import { getSkillIcon } from '../../config/skill-icons.js';
/**
 * Skills UI component
 * Displays player skills and cooldowns
 */
export class SkillsUI extends UIComponent {
    /**
     * Create a new SkillsUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('skills-container', game);
        this.skillButtons = [];
        
        // For continuous primary attack
        this.primaryAttackInterval = null;
        this.primaryAttackDelay = 200; // ms between attacks
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Get skills from player
        const skills = this.game.player.getSkills();
        
        // Create skill buttons HTML
        let skillsHTML = '';
        
        skills.forEach((skill, index) => {
            // Determine key display
            const keyDisplay = skill.primaryAttack ? "h" : `${index + 1}`;
            
            // Get skill icon data
            const iconData = getSkillIcon(skill.name);
            const icon = skill.icon || iconData.emoji || '✨'; // Use icon from skill, then from iconData, or default
            
            // Get color for border styling from skill-icons.js
            const color = iconData.color || '#ffffff';
            
            // Create skill button HTML
            skillsHTML += `
                <div class="skill-button" data-skill-type="${skill.type}" data-skill-index="${index}" data-skill="${skill.name}" style="border-color: ${color}; box-shadow: 0 0 10px ${color}40;">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-icon ${iconData.cssClass}">${icon}</div>
                    <div class="skill-key">${keyDisplay}</div>
                    <div class="skill-cooldown"></div>
                </div>
            `;
        });
        
        // Render the template
        this.render(skillsHTML);
        
        // Add event listeners to skill buttons
        this.skillButtons = this.container.querySelectorAll('.skill-button');
        this.skillButtons.forEach(button => {
            // Prevent zoom on double tap
            button.style.touchAction = 'manipulation';
            
            const index = parseInt(button.getAttribute('data-skill-index'));
            const skill = skills[index];
            const isPrimaryAttack = skill.primaryAttack;
            
            // Handle click events
            button.addEventListener('click', (e) => {
                // Prevent default behavior to avoid any zoom
                e.preventDefault();
                
                // Check if this is the basic attack skill
                if (isPrimaryAttack) {
                    this.game.player.usePrimaryAttack();
                } else {
                    this.game.player.useSkill(index);
                }
                
                // Add click animation
                button.classList.add('skill-activated');
                setTimeout(() => {
                    button.classList.remove('skill-activated');
                }, 300);
            });
            
            // For primary attack, add touch events for continuous attack
            if (isPrimaryAttack) {
                // Start continuous attack on touch start
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent default behavior
                    
                    // Clear any existing interval
                    this.stopContinuousAttack();
                    
                    // Trigger first attack immediately
                    this.game.player.usePrimaryAttack();
                    
                    // Set up continuous attack
                    this.primaryAttackInterval = setInterval(() => {
                        this.game.player.usePrimaryAttack();
                    }, this.primaryAttackDelay);
                    
                    // Add active state
                    button.classList.add('skill-activated');
                });
                
                // Stop continuous attack on touch end
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.stopContinuousAttack();
                    button.classList.remove('skill-activated');
                });
                
                // Also stop on touch cancel
                button.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    this.stopContinuousAttack();
                    button.classList.remove('skill-activated');
                });
            }
            
            // Add tooltip with description on hover
            button.title = `${skill.name}: ${skill.description}`;
        });
        
        // No "Change Skills" button event listener needed
        
        return true;
    }
    
    /**
     * Stop continuous primary attack
     */
    stopContinuousAttack() {
        if (this.primaryAttackInterval) {
            clearInterval(this.primaryAttackInterval);
            this.primaryAttackInterval = null;
        }
    }
    
    /**
     * Update the skills UI
     */
    update() {
        // Update skill cooldowns
        const skills = this.game.player.getSkills();
        
        skills.forEach((skill, index) => {
            const skillButton = this.skillButtons[index];
            if (!skillButton) return; // Skip if button doesn't exist
            
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
    
    /**
     * Clean up resources when component is destroyed
     */
    destroy() {
        // Stop any continuous attack
        this.stopContinuousAttack();
        
        // Call parent destroy method if it exists
        if (super.destroy) {
            super.destroy();
        }
    }
}