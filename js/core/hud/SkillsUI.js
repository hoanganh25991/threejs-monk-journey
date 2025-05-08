import { UIComponent } from '../../ui/UIComponent.js';
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
        
        // Define skill icons and colors based on skill type
        this.skillIcons = {
            'Fist of Thunder': '⚡', // Lightning emoji
            'Wave Strike': '🌊', // Wave emoji
            'Cyclone Strike': '🌀', // Cyclone emoji
            'Seven-Sided Strike': '🔄', // Cycle emoji
            'Inner Sanctuary': '🛡️', // Shield emoji
            'Mystic Ally': '👤', // Person emoji
            'Wave of Light': '🔔', // Bell emoji
            'Exploding Palm': '💥', // Explosion emoji
        };
        
        this.skillColors = {
            'teleport': '#4169e1', // Royal blue for teleport
            'ranged': '#00ffff',
            'aoe': '#ffcc00',
            'multi': '#ff0000',
            'buff': '#ffffff',
            'summon': '#00ffff',
            'wave': '#ffdd22',
            'mark': '#ff3333'
        };
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
            const keyDisplay = skill.basicAttack ? "h" : `${index + 1}`;
            
            // Get skill icon and color
            const icon = this.skillIcons[skill.name] || '✨'; // Default to sparkle if no icon
            const color = this.skillColors[skill.type] || '#ffffff';
            
            // Create skill button HTML
            skillsHTML += `
                <div class="skill-button" data-skill-type="${skill.type}" data-skill-index="${index}" style="border-color: ${color};">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-icon" style="color: ${color}; font-size: 30px; text-shadow: 0 0 10px ${color};">${icon}</div>
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
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-skill-index'));
                const skill = skills[index];
                
                // Check if this is the basic attack skill
                if (skill.basicAttack) {
                    this.game.player.useBasicAttack();
                } else {
                    this.game.player.useSkill(index);
                }
                
                // Add click animation
                button.classList.add('skill-activated');
                setTimeout(() => {
                    button.classList.remove('skill-activated');
                }, 300);
            });
            
            // Add tooltip with description on hover
            const skill = skills[parseInt(button.getAttribute('data-skill-index'))];
            button.title = `${skill.name}: ${skill.description}`;
        });
        
        return true;
    }
    
    /**
     * Update the skills UI
     */
    update() {
        // Update skill cooldowns
        const skills = this.game.player.getSkills();
        
        skills.forEach((skill, index) => {
            const skillButton = this.skillButtons[index];
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
}