import { UIComponent } from '../UIComponent.js';
import { SKILLS } from '../../config/skills.js';

/**
 * Skill Tree UI component
 * Displays the monk skill tree and allows skill customization
 */
export class SkillTreeUI extends UIComponent {
    /**
     * Create a new SkillTreeUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('skill-tree', game);
        this.isSkillTreeOpen = false;
        this.selectedSkill = null;
        this.skillPoints = 0; // Will be loaded from player data
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <div id="skill-tree-title">Monk Skill Tree</div>
            <div id="skill-tree-points">Available Points: <span id="skill-points-value">0</span></div>
            <div id="skill-tree-container">
                <div id="skill-tree-diagram"></div>
                <div id="skill-tree-details">
                    <div id="skill-detail-name"></div>
                    <div id="skill-detail-description"></div>
                    <div id="skill-detail-stats"></div>
                    <div id="skill-paths-container">
                        <h3>Skill Paths</h3>
                        <div id="skill-paths"></div>
                    </div>
                </div>
            </div>
            <div id="skill-tree-close">X</div>
        `;
        
        // Render the template
        this.render(template);
        
        // Add click event to close skill tree
        const closeButton = document.getElementById('skill-tree-close');
        closeButton.addEventListener('click', () => {
            this.toggleSkillTree();
        });
        
        // Hide initially
        this.hide();
        
        // Initialize skill tree diagram
        this.initSkillTreeDiagram();
        
        return true;
    }
    
    /**
     * Initialize the skill tree diagram
     */
    initSkillTreeDiagram() {
        const skillTreeDiagram = document.getElementById('skill-tree-diagram');
        
        // Clear existing content
        skillTreeDiagram.innerHTML = '';
        
        // Create skill nodes for each skill
        SKILLS.forEach((skill, index) => {
            // Skip the basic attack (Fist of Thunder)
            if (skill.basicAttack) return;
            
            // Create skill node
            const skillNode = document.createElement('div');
            skillNode.className = 'skill-node';
            skillNode.dataset.skillIndex = index;
            
            // Position the skill node in a circular pattern
            const angle = ((index - 1) / (SKILLS.length - 2)) * 2 * Math.PI; // Skip basic attack in positioning
            const radius = 150; // Radius of the circle
            const x = Math.cos(angle) * radius + radius;
            const y = Math.sin(angle) * radius + radius;
            
            skillNode.style.left = `${x}px`;
            skillNode.style.top = `${y}px`;
            
            // Add skill icon (placeholder for now)
            skillNode.innerHTML = `
                <div class="skill-icon" style="background-color: #${skill.color.toString(16).padStart(6, '0')}">
                    ${skill.name.charAt(0)}
                </div>
                <div class="skill-name">${skill.name}</div>
            `;
            
            // Add click event to show skill details
            skillNode.addEventListener('click', () => {
                this.showSkillDetails(skill, index);
            });
            
            skillTreeDiagram.appendChild(skillNode);
        });
        
        // Add connecting lines between skills
        this.drawSkillConnections();
    }
    
    /**
     * Draw connections between skill nodes
     */
    drawSkillConnections() {
        const skillTreeDiagram = document.getElementById('skill-tree-diagram');
        
        // Create SVG element for lines
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';
        
        // Add connections between skills
        const skillNodes = document.querySelectorAll('.skill-node');
        
        // Connect each skill to the center (representing the basic attack)
        const centerX = 150;
        const centerY = 150;
        
        skillNodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            const diagramRect = skillTreeDiagram.getBoundingClientRect();
            
            // Calculate node center position relative to the diagram
            const nodeX = parseInt(node.style.left) + 30; // 30 is half the node width
            const nodeY = parseInt(node.style.top) + 30; // 30 is half the node height
            
            // Create line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX);
            line.setAttribute('y1', centerY);
            line.setAttribute('x2', nodeX);
            line.setAttribute('y2', nodeY);
            line.setAttribute('stroke', '#666');
            line.setAttribute('stroke-width', '2');
            
            svg.appendChild(line);
        });
        
        // Add center node for basic attack
        const centerNode = document.createElement('div');
        centerNode.className = 'skill-node center-node';
        centerNode.style.left = `${centerX - 30}px`; // 30 is half the node width
        centerNode.style.top = `${centerY - 30}px`; // 30 is half the node height
        
        // Get the basic attack skill
        const basicAttack = SKILLS.find(skill => skill.basicAttack);
        
        centerNode.innerHTML = `
            <div class="skill-icon" style="background-color: #${basicAttack.color.toString(16).padStart(6, '0')}">
                ${basicAttack.name.charAt(0)}
            </div>
            <div class="skill-name">${basicAttack.name}</div>
        `;
        
        // Add click event to show skill details
        centerNode.addEventListener('click', () => {
            const basicAttackIndex = SKILLS.findIndex(skill => skill.basicAttack);
            this.showSkillDetails(basicAttack, basicAttackIndex);
        });
        
        // Add SVG and center node to the diagram
        skillTreeDiagram.appendChild(svg);
        skillTreeDiagram.appendChild(centerNode);
    }
    
    /**
     * Show skill details
     * @param {Object} skill - Skill data
     * @param {number} index - Skill index
     */
    showSkillDetails(skill, index) {
        this.selectedSkill = { skill, index };
        
        // Update skill details
        document.getElementById('skill-detail-name').textContent = skill.name;
        document.getElementById('skill-detail-description').textContent = skill.description;
        
        // Update skill stats
        const statsHtml = `
            <div class="skill-stat">Damage: ${skill.damage}</div>
            <div class="skill-stat">Mana Cost: ${skill.manaCost}</div>
            <div class="skill-stat">Cooldown: ${skill.cooldown}s</div>
            <div class="skill-stat">Range: ${skill.range}</div>
            <div class="skill-stat">Radius: ${skill.radius}</div>
            <div class="skill-stat">Duration: ${skill.duration}s</div>
        `;
        document.getElementById('skill-detail-stats').innerHTML = statsHtml;
        
        // Show skill paths
        this.showSkillPaths(skill);
        
        // Highlight selected skill node
        document.querySelectorAll('.skill-node').forEach(node => {
            node.classList.remove('selected');
        });
        
        if (skill.basicAttack) {
            document.querySelector('.center-node').classList.add('selected');
        } else {
            document.querySelector(`.skill-node[data-skill-index="${index}"]`).classList.add('selected');
        }
    }
    
    /**
     * Show skill paths for the selected skill
     * @param {Object} skill - Skill data
     */
    showSkillPaths(skill) {
        const skillPathsContainer = document.getElementById('skill-paths');
        
        // Define skill paths based on the skill type
        let paths = [];
        
        switch(skill.name) {
            case 'Wave of Light':
                paths = [
                    { name: 'Explosive Light', description: 'Increases explosion radius by 50%', cost: 1 },
                    { name: 'Pillar of the Ancients', description: 'Creates a pillar that deals damage over time', cost: 2 },
                    { name: 'Empowered Bell', description: 'Increases damage by 30% but increases mana cost', cost: 3 }
                ];
                break;
            case 'Seven-Sided Strike':
                paths = [
                    { name: 'Sustained Attack', description: 'Increases number of strikes to 9', cost: 1 },
                    { name: 'Fulminating Onslaught', description: 'Each strike causes an explosion', cost: 2 },
                    { name: 'The Flow of Combat', description: 'Reduces cooldown by 30%', cost: 3 }
                ];
                break;
            case 'Exploding Palm':
                paths = [
                    { name: 'Essence Burn', description: 'Adds a damage over time effect', cost: 1 },
                    { name: 'Impending Doom', description: 'Increases explosion damage by 50%', cost: 2 },
                    { name: 'Strong Spirit', description: 'Restores 5% of maximum mana on kill', cost: 3 }
                ];
                break;
            case 'Cyclone Strike':
                paths = [
                    { name: 'Eye of the Storm', description: 'Increases pull radius by 25%', cost: 1 },
                    { name: 'Wall of Wind', description: 'Creates a barrier that reduces incoming damage', cost: 2 },
                    { name: 'Implosion', description: 'Increases damage by 40%', cost: 3 }
                ];
                break;
            case 'Mystic Ally':
                paths = [
                    { name: 'Enduring Ally', description: 'Allies have 50% more health', cost: 1 },
                    { name: 'Fire Ally', description: 'Allies deal fire damage', cost: 2 },
                    { name: 'Air Ally', description: 'Summons an additional ally', cost: 3 }
                ];
                break;
            case 'Inner Sanctuary':
                paths = [
                    { name: 'Safe Haven', description: 'Allies inside heal 5% health per second', cost: 1 },
                    { name: 'Forbidden Palace', description: 'Enemies inside take 30% more damage', cost: 2 },
                    { name: 'Temple of Protection', description: 'Increases duration by 5 seconds', cost: 3 }
                ];
                break;
            case 'Wave Strike':
                paths = [
                    { name: 'Tsunami', description: 'Increases width of the wave by 50%', cost: 1 },
                    { name: 'Freezing Wave', description: 'Wave slows enemies by 30%', cost: 2 },
                    { name: 'Tidal Wave', description: 'Wave pushes enemies back', cost: 3 }
                ];
                break;
            case 'Fist of Thunder':
                paths = [
                    { name: 'Thunderclap', description: 'Teleport range increased by 50%', cost: 1 },
                    { name: 'Lightning Flash', description: 'Gain 15% dodge chance for 2 seconds after use', cost: 2 },
                    { name: 'Static Charge', description: 'Enemies hit are charged, taking damage over time', cost: 3 }
                ];
                break;
            default:
                paths = [
                    { name: 'Path 1', description: 'Skill path not defined yet', cost: 1 },
                    { name: 'Path 2', description: 'Skill path not defined yet', cost: 2 },
                    { name: 'Path 3', description: 'Skill path not defined yet', cost: 3 }
                ];
        }
        
        // Create HTML for paths
        let pathsHtml = '';
        paths.forEach(path => {
            pathsHtml += `
                <div class="skill-path">
                    <div class="skill-path-header">
                        <span class="skill-path-name">${path.name}</span>
                        <span class="skill-path-cost">${path.cost} point${path.cost > 1 ? 's' : ''}</span>
                    </div>
                    <div class="skill-path-description">${path.description}</div>
                    <button class="skill-path-select" data-path="${path.name}" data-cost="${path.cost}">Select</button>
                </div>
            `;
        });
        
        skillPathsContainer.innerHTML = pathsHtml;
        
        // Add click events to path select buttons
        document.querySelectorAll('.skill-path-select').forEach(button => {
            button.addEventListener('click', (e) => {
                const pathName = e.target.dataset.path;
                const pathCost = parseInt(e.target.dataset.cost);
                
                // Check if player has enough skill points
                if (this.skillPoints >= pathCost) {
                    this.selectSkillPath(pathName, pathCost);
                } else {
                    this.game.hudManager.showNotification(`Not enough skill points! Need ${pathCost} points.`);
                }
            });
        });
    }
    
    /**
     * Select a skill path
     * @param {string} pathName - Name of the selected path
     * @param {number} cost - Cost in skill points
     */
    selectSkillPath(pathName, cost) {
        // Deduct skill points
        this.skillPoints -= cost;
        document.getElementById('skill-points-value').textContent = this.skillPoints;
        
        // Apply skill path effect (to be implemented)
        console.debug(`Selected skill path: ${pathName} for skill: ${this.selectedSkill.skill.name}`);
        
        // Show notification
        this.game.hudManager.showNotification(`Unlocked ${pathName} for ${this.selectedSkill.skill.name}!`);
        
        // Update skill node to show it's been modified
        if (!this.selectedSkill.skill.basicAttack) {
            const skillNode = document.querySelector(`.skill-node[data-skill-index="${this.selectedSkill.index}"]`);
            skillNode.classList.add('upgraded');
        } else {
            document.querySelector('.center-node').classList.add('upgraded');
        }
    }
    
    /**
     * Toggle skill tree visibility
     */
    toggleSkillTree() {
        if (this.isSkillTreeOpen) {
            // Hide skill tree
            this.hide();
            this.isSkillTreeOpen = false;
            
            // Resume game
            this.game.resume(false);
        } else {
            // Update skill points from player data
            this.updateSkillPoints();
            
            // Show skill tree
            this.show();
            this.isSkillTreeOpen = true;
            
            // Pause game
            this.game.pause(false);
        }
    }
    
    /**
     * Update skill points display from player data
     */
    updateSkillPoints() {
        // In a real implementation, this would load from player data
        // For now, we'll just set a default value for testing
        this.skillPoints = 5;
        document.getElementById('skill-points-value').textContent = this.skillPoints;
    }
}