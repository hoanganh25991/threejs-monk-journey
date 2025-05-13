import { UIComponent } from '../UIComponent.js';
import { SKILLS } from '../../config/skills.js';
import { getSkillIcon, getBuffIcon } from '../../config/skill-icons.js';

/**
 * Skill Tree UI component
 * Displays the monk skill tree and allows skill customization with variants and buffs
 * Based on the skill-trees.json data structure
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
        this.skillTrees = null; // Will be loaded from skill-trees.json
        this.playerSkills = {}; // Will track player's skill allocations
        this.activeTab = 'variants'; // Default active tab
        
        // Zoom and pan settings
        this.zoomLevel = 1; // Default zoom level
        this.minZoom = 0.3; // Minimum zoom level
        this.maxZoom = 3.0; // Maximum zoom level
        this.zoomStep = 0.1; // Zoom step increment/decrement
        
        // Pan settings
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.panAnimationFrame = null;
        
        // Touch support
        this.lastTouchDistance = 0;
        this.isTouching = false;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    async init() {
        // Load skill trees data
        await this.loadSkillTreesData();
        
        const template = `
            <div id="skill-tree-title">Monk Skill Tree</div>
            <div id="skill-tree-points">Available Points: <span id="skill-points-value">0</span></div>
            <div id="skill-tree-container">
                <div id="skill-tree-diagram">
                    <div id="skill-tree-zoom-controls">
                        <button id="skill-tree-zoom-in" class="zoom-button" title="Zoom In">+</button>
                        <button id="skill-tree-zoom-reset" class="zoom-button" title="Reset Zoom">⟲</button>
                        <button id="skill-tree-zoom-out" class="zoom-button" title="Zoom Out">-</button>
                        <button id="skill-tree-reset-position" class="zoom-button" title="Reset Position">⊕</button>
                    </div>
                    <div id="skill-tree-zoom-indicator">100%</div>
                    <div id="skill-tree-minimap">
                        <div id="skill-tree-minimap-viewport"></div>
                    </div>
                </div>
                <div id="skill-tree-details">
                    <div id="skill-detail-name"></div>
                    <div id="skill-detail-description"></div>
                    <div id="skill-detail-stats"></div>
                    
                    <div class="skill-tabs">
                        <div class="skill-tab active" data-tab="variants">Variants</div>
                        <div class="skill-tab" data-tab="buffs">Buffs</div>
                        <div class="skill-tab" data-tab="all">All Options</div>
                    </div>
                    
                    <div id="skill-variants-container" class="skill-tab-content active">
                        <div id="skill-variants"></div>
                    </div>
                    
                    <div id="skill-buffs-container" class="skill-tab-content">
                        <div id="skill-buffs"></div>
                    </div>
                    
                    <div id="skill-all-container" class="skill-tab-content">
                        <div id="skill-all-options"></div>
                    </div>
                </div>
            </div>
            <div id="skill-tree-close">×</div>
        `;
        
        // Render the template
        this.render(template);
        
        // Add click event to close skill tree
        const closeButton = document.getElementById('skill-tree-close');
        closeButton.addEventListener('click', () => {
            this.toggleSkillTree();
        });
        
        // Add tab switching functionality
        document.querySelectorAll('.skill-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Add zoom control event listeners
        document.getElementById('skill-tree-zoom-in').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('skill-tree-zoom-out').addEventListener('click', () => {
            this.zoomOut();
        });
        
        document.getElementById('skill-tree-zoom-reset').addEventListener('click', () => {
            this.resetZoom();
        });
        
        document.getElementById('skill-tree-reset-position').addEventListener('click', () => {
            this.resetPosition();
        });
        
        const skillTreeDiagram = document.getElementById('skill-tree-diagram');
        
        // Add mouse wheel zoom support
        skillTreeDiagram.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        }, { passive: false });
        
        // Add mouse panning support
        skillTreeDiagram.addEventListener('mousedown', (e) => {
            // Only start panning if it's a left click and not on a skill node or button
            if (e.button === 0 && 
                !e.target.closest('.skill-node') && 
                !e.target.closest('.zoom-button') &&
                !e.target.closest('#skill-tree-minimap')) {
                this.startPanning(e.clientX, e.clientY);
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.updatePanning(e.clientX, e.clientY);
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isPanning) {
                this.stopPanning();
            }
        });
        
        // Add touch support for mobile devices
        skillTreeDiagram.addEventListener('touchstart', (e) => {
            this.isTouching = true;
            
            // Handle pinch-to-zoom
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                this.lastTouchDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            } 
            // Handle panning with one finger
            else if (e.touches.length === 1 && 
                    !e.target.closest('.skill-node') && 
                    !e.target.closest('.zoom-button') &&
                    !e.target.closest('#skill-tree-minimap')) {
                this.startPanning(e.touches[0].clientX, e.touches[0].clientY);
            }
            
            // Prevent default to avoid scrolling the page
            e.preventDefault();
        }, { passive: false });
        
        skillTreeDiagram.addEventListener('touchmove', (e) => {
            if (!this.isTouching) return;
            
            // Handle pinch-to-zoom
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                if (this.lastTouchDistance > 0) {
                    if (currentDistance > this.lastTouchDistance) {
                        this.zoomIn();
                    } else if (currentDistance < this.lastTouchDistance) {
                        this.zoomOut();
                    }
                }
                
                this.lastTouchDistance = currentDistance;
            } 
            // Handle panning with one finger
            else if (e.touches.length === 1 && this.isPanning) {
                this.updatePanning(e.touches[0].clientX, e.touches[0].clientY);
            }
            
            e.preventDefault();
        }, { passive: false });
        
        skillTreeDiagram.addEventListener('touchend', () => {
            this.isTouching = false;
            this.lastTouchDistance = 0;
            
            if (this.isPanning) {
                this.stopPanning();
            }
        });
        
        skillTreeDiagram.addEventListener('touchcancel', () => {
            this.isTouching = false;
            this.lastTouchDistance = 0;
            
            if (this.isPanning) {
                this.stopPanning();
            }
        });
        
        // Hide initially
        this.hide();
        
        // Initialize skill tree diagram
        this.initSkillTreeDiagram();
        
        // Initialize player skills data structure
        this.initPlayerSkills();
        
        // Initialize minimap
        this.updateMinimap();
        
        return true;
    }
    
    /**
     * Load skill trees data from JSON
     */
    async loadSkillTreesData() {
        try {
            const response = await fetch('/js/config/skill-trees.json');
            this.skillTrees = await response.json();
            console.debug('Skill trees data loaded successfully');
        } catch (error) {
            console.error('Failed to load skill trees data:', error);
            // Fallback to empty object if loading fails
            this.skillTrees = {};
        }
    }
    
    /**
     * Initialize player skills data structure
     */
    initPlayerSkills() {
        // Create a structure to track player's skill allocations
        this.playerSkills = {};
        
        // Initialize for each skill in the skill trees
        if (this.skillTrees) {
            Object.keys(this.skillTrees).forEach(skillName => {
                this.playerSkills[skillName] = {
                    activeVariant: null,
                    buffs: {},
                    points: 0
                };
            });
        }
        
        // Also initialize for skills from SKILLS array that might not be in skillTrees
        SKILLS.forEach(skill => {
            if (!this.playerSkills[skill.name]) {
                this.playerSkills[skill.name] = {
                    activeVariant: null,
                    buffs: {},
                    points: 0
                };
            }
        });
    }
    
    /**
     * Switch between variants, buffs, and all options tabs
     * @param {string} tabName - Name of the tab to switch to
     */
    switchTab(tabName) {
        // Update active tab
        this.activeTab = tabName;
        
        // Update tab UI
        document.querySelectorAll('.skill-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content visibility
        document.querySelectorAll('.skill-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`skill-${tabName}-container`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Refresh content if a skill is selected
        if (this.selectedSkill) {
            if (tabName === 'variants') {
                this.showSkillVariants(this.selectedSkill.skillName);
            } else if (tabName === 'buffs') {
                this.showSkillBuffs(this.selectedSkill.skillName);
            } else if (tabName === 'all') {
                this.showAllSkillOptions(this.selectedSkill.skillName);
            }
        }
    }
    
    /**
     * Show all skill options (variants and their buffs) for a skill
     * @param {string} skillName - Name of the skill
     */
    showAllSkillOptions(skillName) {
        const allOptionsContainer = document.getElementById('skill-all-options');
        
        // Clear container
        allOptionsContainer.innerHTML = '';
        
        // Check if we have data for this skill
        if (!this.skillTrees || !this.skillTrees[skillName]) {
            allOptionsContainer.innerHTML = '<div class="no-options">No options available for this skill.</div>';
            return;
        }
        
        const skillData = this.skillTrees[skillName];
        const playerSkillData = this.playerSkills[skillName];
        
        // Create HTML for all options
        let allOptionsHtml = '';
        
        // Check if we have variants
        if (skillData.variants && Object.keys(skillData.variants).length > 0) {
            const variants = skillData.variants;
            
            // For each variant
            Object.entries(variants).forEach(([variantName, variantData]) => {
                // Determine if this variant is active
                const isActive = playerSkillData && playerSkillData.activeVariant === variantName;
                
                // Get variant cost and requirements
                const cost = variantData.cost || 5;
                const requiredPoints = variantData.requiredPoints || 0;
                
                // Get icon for the variant
                const iconData = getSkillIcon(variantName);
                
                // Create effects HTML
                let effectsHtml = '';
                if (variantData.effects && variantData.effects.length > 0) {
                    effectsHtml = '<div class="skill-variant-effects">';
                    variantData.effects.forEach(effect => {
                        const effectIcon = getBuffIcon(effect);
                        effectsHtml += `
                            <div class="skill-effect">
                                <span class="skill-effect-icon">${effectIcon.emoji}</span>
                                ${effect}
                            </div>
                        `;
                    });
                    effectsHtml += '</div>';
                }
                
                // Create unlock requirement HTML
                let unlockHtml = '';
                if (variantData.unlockedBy) {
                    unlockHtml = `<div class="skill-variant-unlock">Unlocked by: ${variantData.unlockedBy}</div>`;
                }
                
                // Add skill point requirement if any
                if (requiredPoints > 0) {
                    unlockHtml += `<div class="skill-variant-unlock">Requires ${requiredPoints} points in ${skillName}</div>`;
                }
                
                // Determine variant state and button text
                let variantState = '';
                let buttonText = 'Select';
                let isDisabled = false;
                
                if (isActive) {
                    variantState = 'unlocked';
                    buttonText = 'Active';
                    isDisabled = true;
                } else if (this.skillPoints < cost) {
                    variantState = 'locked';
                    buttonText = 'Not Enough Points';
                    isDisabled = true;
                } else if (playerSkillData.points < requiredPoints) {
                    variantState = 'locked';
                    buttonText = `Requires ${requiredPoints} Points`;
                    isDisabled = true;
                }
                
                // Start variant section
                allOptionsHtml += `
                    <div class="skill-option-group">
                        <div class="skill-variant ${variantState}" data-variant="${variantName}">
                            <div class="skill-variant-header">
                                <div class="skill-variant-name">
                                    <div class="skill-variant-icon" style="background-color: ${iconData.color}">${iconData.emoji}</div>
                                    ${variantName}
                                </div>
                                <div class="skill-variant-cost">${cost} points</div>
                            </div>
                            <div class="skill-variant-description">${variantData.description}</div>
                            ${effectsHtml}
                            ${unlockHtml}
                            <button class="skill-variant-select" data-variant="${variantName}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
                        </div>
                `;
                
                // Check if we have buffs
                if (skillData.buffs && Object.keys(skillData.buffs).length > 0) {
                    const buffs = skillData.buffs;
                    let buffsHtml = '';
                    
                    // Filter buffs for this variant
                    const variantBuffs = Object.entries(buffs).filter(([_, buffData]) => {
                        const requiredVariant = buffData.requiredVariant || "any";
                        return requiredVariant === "any" || requiredVariant === variantName;
                    });
                    
                    if (variantBuffs.length > 0) {
                        buffsHtml += '<div class="variant-buffs-container">';
                        buffsHtml += `<h3 class="variant-buffs-title">Buffs for ${variantName}</h3>`;
                        
                        variantBuffs.forEach(([buffName, buffData]) => {
                            // Get buff data
                            const cost = buffData.cost || 5;
                            const maxLevel = buffData.maxLevel || 1;
                            const requiredVariant = buffData.requiredVariant || "any";
                            
                            // Get current buff level
                            const currentLevel = playerSkillData.buffs[buffName] || 0;
                            const isMaxLevel = currentLevel >= maxLevel;
                            
                            // Check if this buff requires a specific variant
                            const hasRequiredVariant = requiredVariant === "any" || playerSkillData.activeVariant === variantName;
                            
                            // Get icon for the buff based on its first effect
                            const effectType = buffData.effects && buffData.effects.length > 0 ? buffData.effects[0] : '';
                            const iconData = getBuffIcon(effectType);
                            
                            // Create effects HTML
                            let effectsHtml = '';
                            if (buffData.effects && buffData.effects.length > 0) {
                                effectsHtml = '<div class="skill-buff-effects">';
                                buffData.effects.forEach(effect => {
                                    const effectIcon = getBuffIcon(effect);
                                    effectsHtml += `
                                        <div class="skill-effect">
                                            <span class="skill-effect-icon">${effectIcon.emoji}</span>
                                            ${effect}
                                        </div>
                                    `;
                                });
                                effectsHtml += '</div>';
                            }
                            
                            // Create level bonuses HTML
                            let levelBonusesHtml = '';
                            if (buffData.levelBonuses && buffData.levelBonuses.length > 0) {
                                levelBonusesHtml = '<div class="skill-buff-levels">';
                                buffData.levelBonuses.forEach((bonus, index) => {
                                    const level = index + 1;
                                    const isCurrentLevel = currentLevel === level;
                                    const isPastLevel = currentLevel > level;
                                    
                                    levelBonusesHtml += `
                                        <div class="skill-buff-level ${isCurrentLevel ? 'current' : ''} ${isPastLevel ? 'completed' : ''}">
                                            <span class="skill-buff-level-number">Level ${level}:</span>
                                            <span class="skill-buff-level-bonus">${bonus}</span>
                                        </div>
                                    `;
                                });
                                levelBonusesHtml += '</div>';
                            }
                            
                            // Create variant requirement HTML
                            let variantRequirementHtml = '';
                            if (requiredVariant !== "any") {
                                variantRequirementHtml = `<div class="skill-buff-requirement">Requires ${requiredVariant} variant</div>`;
                            }
                            
                            // Determine buff state and button text
                            let buffState = '';
                            let buttonText = 'Select';
                            let isDisabled = false;
                            
                            if (isMaxLevel) {
                                buffState = 'unlocked max-level';
                                buttonText = 'Max Level';
                                isDisabled = true;
                            } else if (currentLevel > 0) {
                                buffState = 'unlocked';
                                buttonText = `Upgrade to Level ${currentLevel + 1}`;
                            } else if (!hasRequiredVariant) {
                                buffState = 'locked';
                                buttonText = `Requires ${requiredVariant} Variant`;
                                isDisabled = true;
                            } else if (this.skillPoints < cost) {
                                buffState = 'locked';
                                buttonText = 'Not Enough Points';
                                isDisabled = true;
                            }
                            
                            buffsHtml += `
                                <div class="skill-buff ${buffState}" data-buff="${buffName}">
                                    <div class="skill-buff-header">
                                        <div class="skill-buff-name">
                                            <div class="skill-buff-icon" style="background-color: ${iconData.color}">${iconData.emoji}</div>
                                            ${buffName} ${currentLevel > 0 ? `(Level ${currentLevel})` : ''}
                                        </div>
                                        <div class="skill-buff-cost">${cost} points</div>
                                    </div>
                                    <div class="skill-buff-description">${buffData.description}</div>
                                    ${effectsHtml}
                                    ${levelBonusesHtml}
                                    ${variantRequirementHtml}
                                    <button class="skill-buff-select" data-buff="${buffName}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
                                </div>
                            `;
                        });
                        
                        buffsHtml += '</div>'; // Close variant-buffs-container
                        allOptionsHtml += buffsHtml;
                    }
                }
                
                // Close variant section
                allOptionsHtml += '</div>'; // Close skill-option-group
            });
        } else {
            allOptionsHtml = '<div class="no-variants">No variants available for this skill.</div>';
        }
        
        allOptionsContainer.innerHTML = allOptionsHtml;
        
        // Add click events to variant select buttons
        document.querySelectorAll('#skill-all-options .skill-variant-select').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    const variantName = e.target.dataset.variant;
                    this.selectSkillVariant(skillName, variantName);
                    
                    // Refresh the all options view to reflect changes
                    this.showAllSkillOptions(skillName);
                });
            }
        });
        
        // Add click events to buff select buttons
        document.querySelectorAll('#skill-all-options .skill-buff-select').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    const buffName = e.target.dataset.buff;
                    this.selectSkillBuff(skillName, buffName);
                    
                    // Refresh the all options view to reflect changes
                    this.showAllSkillOptions(skillName);
                });
            }
        });
    }
    
    /**
     * Initialize the skill tree diagram
     */
    initSkillTreeDiagram() {
        const skillTreeDiagram = document.getElementById('skill-tree-diagram');
        
        // Preserve UI controls
        const zoomControls = skillTreeDiagram.querySelector('#skill-tree-zoom-controls');
        const zoomIndicator = skillTreeDiagram.querySelector('#skill-tree-zoom-indicator');
        const minimap = skillTreeDiagram.querySelector('#skill-tree-minimap');
        
        // Clear existing content
        skillTreeDiagram.innerHTML = '';
        
        // Re-add zoom controls if they existed
        if (zoomControls) {
            skillTreeDiagram.appendChild(zoomControls);
        } else {
            // Create zoom controls if they don't exist
            const newZoomControls = document.createElement('div');
            newZoomControls.id = 'skill-tree-zoom-controls';
            newZoomControls.innerHTML = `
                <button id="skill-tree-zoom-in" class="zoom-button" title="Zoom In">+</button>
                <button id="skill-tree-zoom-reset" class="zoom-button" title="Reset Zoom">⟲</button>
                <button id="skill-tree-zoom-out" class="zoom-button" title="Zoom Out">-</button>
                <button id="skill-tree-reset-position" class="zoom-button" title="Reset Position">⊕</button>
            `;
            skillTreeDiagram.appendChild(newZoomControls);
            
            // Re-add event listeners
            document.getElementById('skill-tree-zoom-in').addEventListener('click', () => {
                this.zoomIn();
            });
            
            document.getElementById('skill-tree-zoom-out').addEventListener('click', () => {
                this.zoomOut();
            });
            
            document.getElementById('skill-tree-zoom-reset').addEventListener('click', () => {
                this.resetZoom();
            });
            
            document.getElementById('skill-tree-reset-position').addEventListener('click', () => {
                this.resetPosition();
            });
        }
        
        // Re-add zoom indicator if it existed
        if (zoomIndicator) {
            skillTreeDiagram.appendChild(zoomIndicator);
        } else {
            // Create zoom indicator if it doesn't exist
            const newZoomIndicator = document.createElement('div');
            newZoomIndicator.id = 'skill-tree-zoom-indicator';
            newZoomIndicator.textContent = '100%';
            newZoomIndicator.classList.add('zoom-normal');
            skillTreeDiagram.appendChild(newZoomIndicator);
        }
        
        // Re-add minimap if it existed
        if (minimap) {
            skillTreeDiagram.appendChild(minimap);
        } else {
            // Create minimap if it doesn't exist
            const newMinimap = document.createElement('div');
            newMinimap.id = 'skill-tree-minimap';
            
            const viewport = document.createElement('div');
            viewport.id = 'skill-tree-minimap-viewport';
            newMinimap.appendChild(viewport);
            
            skillTreeDiagram.appendChild(newMinimap);
            
            // Add click event to minimap for quick navigation
            newMinimap.addEventListener('click', (e) => {
                // Ignore clicks on the viewport itself
                if (e.target === viewport) return;
                
                // Calculate the click position relative to the minimap
                const rect = newMinimap.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                // Convert to pan offset (center is 50%, 50%)
                const panX = (50 - x) * 20; // Scale factor for pan sensitivity
                const panY = (50 - y) * 20;
                
                // Apply the pan
                this.panOffsetX = -panX;
                this.panOffsetY = -panY;
                this.applyZoom();
                this.updateMinimap();
            });
        }
        
        // Create a container for the tree
        const treeContainer = document.createElement('div');
        treeContainer.className = 'skill-tree-container';
        skillTreeDiagram.appendChild(treeContainer);
        
        // Create SVG container for connections
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.setAttribute('class', 'tree-connections');
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.pointerEvents = 'none';
        svgContainer.style.zIndex = '1';
        treeContainer.appendChild(svgContainer);
        
        // Create the main tree structure
        const treeStructure = document.createElement('div');
        treeStructure.className = 'tree-structure';
        treeContainer.appendChild(treeStructure);
        
        // Get all skills from the skill trees
        const skillNames = Object.keys(this.skillTrees);
        
        // Create the trunk (main branch)
        const trunk = document.createElement('div');
        trunk.className = 'tree-trunk';
        treeStructure.appendChild(trunk);
        
        // Create the root node (central point)
        const rootNode = document.createElement('div');
        rootNode.className = 'tree-root';
        rootNode.innerHTML = `
            <div class="root-icon">
                <span>⚡</span>
            </div>
            <div class="root-label">Skills</div>
        `;
        trunk.appendChild(rootNode);
        
        // Create branches container
        const branchesContainer = document.createElement('div');
        branchesContainer.className = 'tree-branches';
        trunk.appendChild(branchesContainer);
        
        // Calculate the fan angle based on the number of skills
        const fanAngle = Math.min(300, skillNames.length * 40); // Max 300 degrees
        const angleStep = fanAngle / (skillNames.length - 1 || 1);
        const startAngle = -fanAngle / 2; // Start from the left side
        
        // Create branches for each skill
        skillNames.forEach((skillName, index) => {
            // Calculate angle for this skill
            const angle = startAngle + (index * angleStep);
            
            // Create a branch for this skill
            const branch = document.createElement('div');
            branch.className = 'tree-branch';
            branch.dataset.skillName = skillName;
            branch.style.transform = `rotate(${angle}deg)`;
            branchesContainer.appendChild(branch);
            
            // Create the skill node
            const skillNode = document.createElement('div');
            skillNode.className = 'skill-node root-node';
            skillNode.dataset.skillName = skillName;
            skillNode.dataset.level = 'root';
            skillNode.dataset.index = index;
            
            // Counter-rotate the skill node to keep it upright
            // Reuse the angle calculated above
            skillNode.style.transform = `rotate(${-angle}deg)`;
            
            // Get icon data for the skill
            const iconData = getSkillIcon(skillName);
            
            // Add skill icon
            skillNode.innerHTML = `
                <div class="skill-icon" style="background-color: ${iconData.color}">
                    ${iconData.emoji}
                </div>
                <div class="skill-name">${skillName}</div>
            `;
            
            // Add click event to toggle skill details
            skillNode.addEventListener('click', () => {
                this.showSkillDetails(skillName);
                
                // Toggle branch expansion
                const variantsContainer = document.querySelector(`.variants-container[data-skill-name="${skillName}"]`);
                if (variantsContainer && variantsContainer.classList.contains('expanded')) {
                    // If already expanded, collapse it
                    variantsContainer.classList.remove('expanded');
                } else {
                    // Otherwise expand it
                    this.expandBranch(skillName);
                }
            });
            
            // Check if player has points in this skill
            if (this.playerSkills[skillName] && this.playerSkills[skillName].points > 0) {
                skillNode.classList.add('upgraded');
                
                // Add points indicator
                const pointsIndicator = document.createElement('div');
                pointsIndicator.className = 'skill-points-allocated';
                pointsIndicator.textContent = this.playerSkills[skillName].points;
                skillNode.appendChild(pointsIndicator);
            }
            
            branch.appendChild(skillNode);
            
            // Draw connection from root to skill
            this.drawBranchConnection(rootNode, skillNode, svgContainer, false);
            
            // Create variants container for this branch
            const variantsContainer = document.createElement('div');
            variantsContainer.className = 'variants-container';
            variantsContainer.dataset.skillName = skillName;
            branch.appendChild(variantsContainer);
            
            // If this skill is selected, expand its branch
            if (this.selectedSkill === skillName) {
                this.expandBranch(skillName);
            }
        });
        
        // Apply initial zoom level
        this.applyZoom();
    }
    
    /**
     * Expand a branch to show its variants and buffs
     * @param {string} skillName - Name of the skill
     */
    expandBranch(skillName) {
        // We no longer clear other expanded branches to allow multiple expansions
        // Just clear this specific branch if it's already expanded
        const currentContainer = document.querySelector(`.variants-container[data-skill-name="${skillName}"]`);
        if (currentContainer && currentContainer.classList.contains('expanded')) {
            currentContainer.innerHTML = '';
        }
        
        // Get the variants container for this skill
        const variantsContainer = document.querySelector(`.variants-container[data-skill-name="${skillName}"]`);
        if (!variantsContainer) return;
        
        // Mark as expanded
        variantsContainer.classList.add('expanded');
        
        // Get skill data
        const skillData = this.skillTrees[skillName];
        if (!skillData || !skillData.variants) return;
        
        // Get the skill node
        const skillNode = document.querySelector(`.skill-node[data-skill-name="${skillName}"]`);
        if (!skillNode) return;
        
        // Get SVG container
        const svgContainer = document.querySelector('.tree-connections');
        if (!svgContainer) return;
        
        // Get variants
        const variants = skillData.variants || {};
        const variantNames = Object.keys(variants);
        
        // Calculate the fan angle based on the number of variants
        const fanAngle = Math.min(180, variantNames.length * 30); // Max 180 degrees
        const angleStep = fanAngle / (variantNames.length - 1 || 1);
        const startAngle = -fanAngle / 2; // Start from the left side
        
        // Create variant nodes
        variantNames.forEach((variantName, index) => {
            // Calculate angle for this variant
            const angle = startAngle + (index * angleStep);
            
            // Create variant container
            const variantContainer = document.createElement('div');
            variantContainer.className = 'variant-container';
            variantContainer.dataset.variantName = variantName;
            variantContainer.style.transform = `rotate(${angle}deg)`;
            variantsContainer.appendChild(variantContainer);
            
            // Create variant node
            const variantNode = document.createElement('div');
            variantNode.className = 'skill-node variant-node';
            variantNode.dataset.skillName = skillName;
            variantNode.dataset.variantName = variantName;
            variantNode.dataset.level = 'variant';
            
            // Counter-rotate the variant node to keep it upright
            variantNode.style.transform = `rotate(${-angle}deg)`;
            
            // Get icon data for the variant
            const iconData = getSkillIcon(variantName);
            
            // Add variant icon
            variantNode.innerHTML = `
                <div class="skill-icon" style="background-color: ${iconData.color}">
                    ${iconData.emoji}
                </div>
                <div class="skill-name">${variantName}</div>
            `;
            
            // Check if this variant is active
            const isActive = this.playerSkills[skillName] && 
                            this.playerSkills[skillName].activeVariant === variantName;
            
            if (isActive) {
                variantNode.classList.add('active');
            }
            
            // Add click event to toggle variant details
            variantNode.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.showSkillDetails(skillName);
                
                // Highlight this variant in the details panel
                setTimeout(() => {
                    const variantElement = document.querySelector(`.skill-variant[data-variant="${variantName}"]`);
                    if (variantElement) {
                        variantElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        variantElement.classList.add('highlight');
                        setTimeout(() => {
                            variantElement.classList.remove('highlight');
                        }, 1500);
                    }
                }, 100);
                
                // Toggle buffs expansion
                const buffsContainer = document.querySelector(`.buffs-container[data-skill-name="${skillName}"][data-variant-name="${variantName}"]`);
                if (buffsContainer && buffsContainer.classList.contains('expanded')) {
                    // If already expanded, collapse it
                    buffsContainer.classList.remove('expanded');
                } else {
                    // Otherwise expand it
                    this.expandVariant(skillName, variantName);
                }
            });
            
            variantContainer.appendChild(variantNode);
            
            // Draw connection from skill to variant
            this.drawBranchConnection(skillNode, variantNode, svgContainer, isActive);
            
            // Create buffs container for this variant
            const buffsContainer = document.createElement('div');
            buffsContainer.className = 'buffs-container';
            buffsContainer.dataset.skillName = skillName;
            buffsContainer.dataset.variantName = variantName;
            variantContainer.appendChild(buffsContainer);
            
            // If this variant is active, expand it to show buffs
            if (isActive) {
                this.expandVariant(skillName, variantName);
            }
        });
    }
    
    /**
     * Expand a variant to show its buffs
     * @param {string} skillName - Name of the skill
     * @param {string} variantName - Name of the variant
     */
    expandVariant(skillName, variantName) {
        // We no longer clear other expanded buff containers to allow multiple expansions
        // Just clear this specific container if it's already expanded
        const currentContainer = document.querySelector(`.buffs-container[data-skill-name="${skillName}"][data-variant-name="${variantName}"]`);
        if (currentContainer && currentContainer.classList.contains('expanded')) {
            currentContainer.innerHTML = '';
        }
        
        // Get the buffs container for this variant
        const buffsContainer = document.querySelector(`.buffs-container[data-skill-name="${skillName}"][data-variant-name="${variantName}"]`);
        if (!buffsContainer) return;
        
        // Mark as expanded
        buffsContainer.classList.add('expanded');
        
        // Get skill data
        const skillData = this.skillTrees[skillName];
        if (!skillData || !skillData.buffs) return;
        
        // Get the variant node
        const variantNode = document.querySelector(`.skill-node[data-skill-name="${skillName}"][data-variant-name="${variantName}"]`);
        if (!variantNode) return;
        
        // Get SVG container
        const svgContainer = document.querySelector('.tree-connections');
        if (!svgContainer) return;
        
        // Get buffs
        const buffs = skillData.buffs || {};
        const buffNames = Object.keys(buffs);
        
        // Filter buffs for this variant
        const variantBuffs = buffNames.filter(buffName => {
            const buffData = buffs[buffName];
            const requiredVariant = buffData.requiredVariant || "any";
            return requiredVariant === "any" || requiredVariant === variantName;
        });
        
        // Calculate the fan angle based on the number of buffs
        const fanAngle = Math.min(120, variantBuffs.length * 30); // Max 120 degrees
        const angleStep = fanAngle / (variantBuffs.length - 1 || 1);
        const startAngle = -fanAngle / 2; // Start from the left side
        
        // Create buff nodes
        variantBuffs.forEach((buffName, index) => {
            const buffData = buffs[buffName];
            
            // Calculate angle for this buff
            const angle = startAngle + (index * angleStep);
            
            // Create buff container
            const buffContainer = document.createElement('div');
            buffContainer.className = 'buff-container';
            buffContainer.dataset.buffName = buffName;
            buffContainer.style.transform = `rotate(${angle}deg)`;
            buffsContainer.appendChild(buffContainer);
            
            // Create buff node
            const buffNode = document.createElement('div');
            buffNode.className = 'skill-node buff-node';
            buffNode.dataset.skillName = skillName;
            buffNode.dataset.variantName = variantName;
            buffNode.dataset.buffName = buffName;
            buffNode.dataset.level = 'buff';
            
            // Counter-rotate the buff node to keep it upright
            buffNode.style.transform = `rotate(${-angle}deg)`;
            
            // Get icon for the buff based on its first effect
            const effectType = buffData.effects && buffData.effects.length > 0 ? buffData.effects[0] : '';
            const iconData = getBuffIcon(effectType);
            
            // Get current buff level
            const buffLevel = this.playerSkills[skillName] && 
                            this.playerSkills[skillName].buffs[buffName] || 0;
            
            // Add buff icon
            buffNode.innerHTML = `
                <div class="skill-icon" style="background-color: ${iconData.color}">
                    ${iconData.emoji}
                </div>
                <div class="skill-name">${buffName}</div>
                ${buffLevel > 0 ? `<div class="buff-level">Lv.${buffLevel}</div>` : ''}
            `;
            
            // Add active class if buff is unlocked
            if (buffLevel > 0) {
                buffNode.classList.add('active');
                
                // Add max-level class if at max level
                if (buffLevel >= (buffData.maxLevel || 1)) {
                    buffNode.classList.add('max-level');
                }
            }
            
            // Add click event to show buff details
            buffNode.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.showSkillDetails(skillName);
                // Switch to buffs tab
                this.switchTab('buffs');
                // Highlight this buff in the details panel
                setTimeout(() => {
                    const buffElement = document.querySelector(`.skill-buff[data-buff="${buffName}"]`);
                    if (buffElement) {
                        buffElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        buffElement.classList.add('highlight');
                        setTimeout(() => {
                            buffElement.classList.remove('highlight');
                        }, 1500);
                    }
                }, 100);
            });
            
            buffContainer.appendChild(buffNode);
            
            // Draw connection from variant to buff
            this.drawBranchConnection(variantNode, buffNode, svgContainer, buffLevel > 0);
        });
    }
    
    /**
     * Draw a connection between two nodes in the branch
     * @param {HTMLElement} fromNode - Starting node
     * @param {HTMLElement} toNode - Ending node
     * @param {SVGElement} svgContainer - SVG container for the connection
     * @param {boolean} isActive - Whether the connection is active
     */
    drawBranchConnection(fromNode, toNode, svgContainer, isActive = false) {
        // Get positions
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();
        const containerRect = svgContainer.getBoundingClientRect();
        
        // Calculate positions relative to container
        const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left + toRect.width / 2 - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;
        
        // Create SVG line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', isActive ? '#8a5a44' : 'rgba(138, 90, 68, 0.3)');
        line.setAttribute('stroke-width', isActive ? '3' : '2');
        
        // Add line to SVG
        svgContainer.appendChild(line);
    }
    
    /**
     * Draw the skill tree for a specific skill
     * @param {string} skillName - Name of the skill
     * @param {HTMLElement} connectionsContainer - Container for connections
     */
    drawSkillTree(skillName, connectionsContainer) {
        const skillTreeDiagram = document.getElementById('skill-tree-diagram');
        const skillData = this.skillTrees[skillName];
        
        if (!skillData) return;
        
        // Find the root node for this skill
        const rootNode = skillTreeDiagram.querySelector(`.skill-node[data-skill-name="${skillName}"]`);
        if (!rootNode) return;
        
        // Remove any existing variant and buff levels
        const existingLevels = skillTreeDiagram.querySelectorAll('.variants-level, .buffs-level');
        existingLevels.forEach(level => level.remove());
        
        // Create variants level
        const variantsLevel = document.createElement('div');
        variantsLevel.className = 'tree-level variants-level';
        variantsLevel.style.display = 'flex';
        variantsLevel.style.justifyContent = 'center';
        variantsLevel.style.flexWrap = 'wrap';
        variantsLevel.style.gap = '15px';
        variantsLevel.style.margin = '30px 0';
        variantsLevel.style.width = '100%';
        variantsLevel.style.padding = '0 10px';
        
        // Get variants
        const variants = skillData.variants || {};
        const variantNames = Object.keys(variants);
        
        // Add variant nodes
        variantNames.forEach((variantName, index) => {
            const variantNode = document.createElement('div');
            variantNode.className = 'skill-node variant-node';
            variantNode.dataset.skillName = skillName;
            variantNode.dataset.variantName = variantName;
            variantNode.dataset.level = 'variant';
            variantNode.dataset.index = index;
            
            // Get icon data for the variant
            const iconData = getSkillIcon(variantName);
            
            // Add variant icon
            variantNode.innerHTML = `
                <div class="skill-icon" style="background-color: ${iconData.color}">
                    ${iconData.emoji}
                </div>
                <div class="skill-name">${variantName}</div>
            `;
            
            // Check if this variant is active
            const isActive = this.playerSkills[skillName] && 
                            this.playerSkills[skillName].activeVariant === variantName;
            
            if (isActive) {
                variantNode.classList.add('active');
            }
            
            // Add click event to show variant details
            variantNode.addEventListener('click', () => {
                this.showSkillDetails(skillName);
                // Highlight this variant in the details panel
                setTimeout(() => {
                    const variantElement = document.querySelector(`.skill-variant[data-variant="${variantName}"]`);
                    if (variantElement) {
                        variantElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        variantElement.classList.add('highlight');
                        setTimeout(() => {
                            variantElement.classList.remove('highlight');
                        }, 1500);
                    }
                }, 100);
            });
            
            variantsLevel.appendChild(variantNode);
            
            // Draw connection from root to variant
            this.drawConnection(rootNode, variantNode, connectionsContainer, isActive);
            
            // If this variant is active, draw its buffs
            if (isActive) {
                // Create buffs level for this variant
                const buffsLevel = document.createElement('div');
                buffsLevel.className = 'tree-level buffs-level';
                buffsLevel.style.display = 'flex';
                buffsLevel.style.justifyContent = 'center';
                buffsLevel.style.flexWrap = 'wrap';
                buffsLevel.style.gap = '10px';
                buffsLevel.style.margin = '30px 0';
                buffsLevel.style.width = '100%';
                buffsLevel.style.padding = '0 5px';
                
                // Get buffs
                const buffs = skillData.buffs || {};
                const buffNames = Object.keys(buffs);
                
                // Add buff nodes
                buffNames.forEach((buffName, buffIndex) => {
                    const buffData = buffs[buffName];
                    const requiredVariant = buffData.requiredVariant || "any";
                    
                    // Skip if this buff requires a different variant
                    if (requiredVariant !== "any" && requiredVariant !== variantName) {
                        return;
                    }
                    
                    const buffNode = document.createElement('div');
                    buffNode.className = 'skill-node buff-node';
                    buffNode.dataset.skillName = skillName;
                    buffNode.dataset.variantName = variantName;
                    buffNode.dataset.buffName = buffName;
                    buffNode.dataset.level = 'buff';
                    buffNode.dataset.index = buffIndex;
                    
                    // Get icon for the buff based on its first effect
                    const effectType = buffData.effects && buffData.effects.length > 0 ? buffData.effects[0] : '';
                    const iconData = getBuffIcon(effectType);
                    
                    // Get current buff level
                    const buffLevel = this.playerSkills[skillName] && 
                                    this.playerSkills[skillName].buffs[buffName] || 0;
                    
                    // Add buff icon
                    buffNode.innerHTML = `
                        <div class="skill-icon" style="background-color: ${iconData.color}">
                            ${iconData.emoji}
                        </div>
                        <div class="skill-name">${buffName}</div>
                        ${buffLevel > 0 ? `<div class="buff-level">Lv.${buffLevel}</div>` : ''}
                    `;
                    
                    // Add active class if buff is unlocked
                    if (buffLevel > 0) {
                        buffNode.classList.add('active');
                        
                        // Add max-level class if at max level
                        if (buffLevel >= (buffData.maxLevel || 1)) {
                            buffNode.classList.add('max-level');
                        }
                    }
                    
                    // Add click event to show buff details
                    buffNode.addEventListener('click', () => {
                        this.showSkillDetails(skillName);
                        // Switch to buffs tab
                        this.switchTab('buffs');
                        // Highlight this buff in the details panel
                        setTimeout(() => {
                            const buffElement = document.querySelector(`.skill-buff[data-buff="${buffName}"]`);
                            if (buffElement) {
                                buffElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                buffElement.classList.add('highlight');
                                setTimeout(() => {
                                    buffElement.classList.remove('highlight');
                                }, 1500);
                            }
                        }, 100);
                    });
                    
                    buffsLevel.appendChild(buffNode);
                    
                    // Draw connection from variant to buff
                    this.drawConnection(variantNode, buffNode, connectionsContainer, buffLevel > 0);
                });
                
                // Only add buffs level if there are buffs for this variant
                if (buffsLevel.children.length > 0) {
                    skillTreeDiagram.appendChild(buffsLevel);
                }
            }
        });
        
        // Add variants level if there are variants
        if (variantsLevel.children.length > 0) {
            skillTreeDiagram.appendChild(variantsLevel);
        }
    }
    
    /**
     * Draw a connection line between two nodes
     * @param {HTMLElement} fromNode - Starting node
     * @param {HTMLElement} toNode - Ending node
     * @param {HTMLElement} container - Container for the connection
     * @param {boolean} isActive - Whether the connection is active
     */
    drawConnection(fromNode, toNode, container, isActive = false) {
        // Get positions
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate positions relative to container
        const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left + toRect.width / 2 - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;
        
        // Create SVG line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', isActive ? '#8a5a44' : 'rgba(138, 90, 68, 0.3)');
        line.setAttribute('stroke-width', isActive ? '3' : '2');
        
        // Create SVG element if it doesn't exist
        let svg = container.querySelector('svg');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            container.appendChild(svg);
        }
        
        // Add line to SVG
        svg.appendChild(line);
    }
    
    /**
     * Organize skills into tiers for the tree structure
     * @param {Array} skills - Array of skill objects
     * @returns {Object} - Object with tiers as keys and arrays of skills as values
     */
    organizeSkillsIntoTiers(skills) {
        // Filter out basic attack
        const nonBasicSkills = skills.filter(skill => !skill.basicAttack);
        
        // For this example, we'll create a 3-tier structure
        // Tier 1: First set of skills (2-3 skills)
        // Tier 2: Second set of skills (3-4 skills)
        // Tier 3: Remaining skills
        
        const totalSkills = nonBasicSkills.length;
        const tier1Count = Math.min(3, Math.ceil(totalSkills / 3));
        const tier2Count = Math.min(4, Math.ceil((totalSkills - tier1Count) / 2));
        
        return {
            1: nonBasicSkills.slice(0, tier1Count),
            2: nonBasicSkills.slice(tier1Count, tier1Count + tier2Count),
            3: nonBasicSkills.slice(tier1Count + tier2Count)
        };
    }
    
    /**
     * Add decorative background elements to the skill tree
     * @param {HTMLElement} container - Container element
     */
    addBackgroundElements(container) {
        // Add vertical line from top to bottom
        const verticalLine = document.createElement('div');
        verticalLine.className = 'skill-tree-bg-element';
        verticalLine.style.width = '2px';
        verticalLine.style.height = '90%';
        verticalLine.style.backgroundColor = 'rgba(138, 90, 68, 0.3)';
        verticalLine.style.position = 'absolute';
        verticalLine.style.top = '5%';
        verticalLine.style.left = '50%';
        verticalLine.style.transform = 'translateX(-50%)';
        
        // Add horizontal lines for each tier
        const tier1Line = document.createElement('div');
        tier1Line.className = 'skill-tree-bg-element';
        tier1Line.style.width = '70%';
        tier1Line.style.height = '2px';
        tier1Line.style.backgroundColor = 'rgba(138, 90, 68, 0.3)';
        tier1Line.style.position = 'absolute';
        tier1Line.style.top = '30%';
        tier1Line.style.left = '50%';
        tier1Line.style.transform = 'translateX(-50%)';
        
        const tier2Line = document.createElement('div');
        tier2Line.className = 'skill-tree-bg-element';
        tier2Line.style.width = '80%';
        tier2Line.style.height = '2px';
        tier2Line.style.backgroundColor = 'rgba(138, 90, 68, 0.3)';
        tier2Line.style.position = 'absolute';
        tier2Line.style.top = '60%';
        tier2Line.style.left = '50%';
        tier2Line.style.transform = 'translateX(-50%)';
        
        const tier3Line = document.createElement('div');
        tier3Line.className = 'skill-tree-bg-element';
        tier3Line.style.width = '90%';
        tier3Line.style.height = '2px';
        tier3Line.style.backgroundColor = 'rgba(138, 90, 68, 0.3)';
        tier3Line.style.position = 'absolute';
        tier3Line.style.top = '90%';
        tier3Line.style.left = '50%';
        tier3Line.style.transform = 'translateX(-50%)';
        
        container.appendChild(verticalLine);
        container.appendChild(tier1Line);
        container.appendChild(tier2Line);
        container.appendChild(tier3Line);
    }
    
    /**
     * Get the list of skills to display in the skill tree
     * @returns {Array} Array of skill objects
     */
    getSkillsToDisplay() {
        // If skillTrees is loaded, use those skill names
        if (this.skillTrees && Object.keys(this.skillTrees).length > 0) {
            return Object.keys(this.skillTrees).map(skillName => {
                // Find the skill in SKILLS array to get additional properties
                const skillData = SKILLS.find(s => s.name === skillName) || {
                    name: skillName,
                    description: this.skillTrees[skillName].baseDescription,
                    type: 'unknown',
                    damage: 0,
                    manaCost: 0,
                    cooldown: 0,
                    range: 0,
                    radius: 0,
                    duration: 0
                };
                
                return skillData;
            }).filter(skill => !skill.basicAttack);
        }
        
        // Fallback to SKILLS array if skillTrees isn't loaded
        return SKILLS.filter(skill => !skill.basicAttack);
    }
    
    /**
     * Draw connections between skill nodes in a tree structure
     * @param {HTMLElement} container - Container element
     */
    drawTreeConnections(container) {
        // Create SVG element for lines
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';
        
        // Get the center node (root)
        const centerNode = container.querySelector('.center-node');
        const centerRect = centerNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate center node position relative to the container
        const centerX = centerRect.left - containerRect.left + centerRect.width / 2;
        const centerY = centerRect.top - containerRect.top + centerRect.height / 2;
        
        // Connect tier 1 skills to the center node
        const tier1Nodes = container.querySelectorAll('.tier-1 .skill-node');
        tier1Nodes.forEach(node => {
            const nodeRect = node.getBoundingClientRect();
            const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2;
            const nodeY = nodeRect.top - containerRect.top + nodeRect.height / 2;
            
            // Create line with gradient and animation
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX);
            line.setAttribute('y1', centerY);
            line.setAttribute('x2', nodeX);
            line.setAttribute('y2', nodeY);
            line.setAttribute('stroke', '#8a5a44');
            line.setAttribute('stroke-width', '2');
            line.classList.add('skill-connection');
            
            // Add data attribute to identify which skill this connection is for
            line.dataset.skillName = node.dataset.skillName;
            line.dataset.tier = '1';
            
            // Check if this skill has an active variant and update the connection style
            if (this.playerSkills[node.dataset.skillName]?.activeVariant) {
                line.classList.add('active');
            }
            
            svg.appendChild(line);
        });
        
        // Connect tier 2 skills to tier 1 skills
        const tier2Nodes = container.querySelectorAll('.tier-2 .skill-node');
        const tier1Count = tier1Nodes.length;
        
        tier2Nodes.forEach((node, index) => {
            // Determine which tier 1 node to connect to
            const tier1Index = Math.min(Math.floor(index * tier1Count / tier2Nodes.length), tier1Count - 1);
            const parentNode = tier1Nodes[tier1Index];
            
            if (parentNode) {
                const nodeRect = node.getBoundingClientRect();
                const parentRect = parentNode.getBoundingClientRect();
                
                const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2;
                const nodeY = nodeRect.top - containerRect.top + nodeRect.height / 2;
                const parentX = parentRect.left - containerRect.left + parentRect.width / 2;
                const parentY = parentRect.top - containerRect.top + parentRect.height / 2;
                
                // Create line
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', parentX);
                line.setAttribute('y1', parentY);
                line.setAttribute('x2', nodeX);
                line.setAttribute('y2', nodeY);
                line.setAttribute('stroke', '#8a5a44');
                line.setAttribute('stroke-width', '2');
                line.classList.add('skill-connection');
                
                line.dataset.skillName = node.dataset.skillName;
                line.dataset.tier = '2';
                line.dataset.parentSkill = parentNode.dataset.skillName;
                
                // Check if this skill has an active variant
                if (this.playerSkills[node.dataset.skillName]?.activeVariant) {
                    line.classList.add('active');
                }
                
                svg.appendChild(line);
            }
        });
        
        // Connect tier 3 skills to tier 2 skills
        const tier3Nodes = container.querySelectorAll('.tier-3 .skill-node');
        const tier2Count = tier2Nodes.length;
        
        tier3Nodes.forEach((node, index) => {
            // Determine which tier 2 node to connect to
            const tier2Index = Math.min(Math.floor(index * tier2Count / tier3Nodes.length), tier2Count - 1);
            const parentNode = tier2Nodes[tier2Index];
            
            if (parentNode) {
                const nodeRect = node.getBoundingClientRect();
                const parentRect = parentNode.getBoundingClientRect();
                
                const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2;
                const nodeY = nodeRect.top - containerRect.top + nodeRect.height / 2;
                const parentX = parentRect.left - containerRect.left + parentRect.width / 2;
                const parentY = parentRect.top - containerRect.top + parentRect.height / 2;
                
                // Create line
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', parentX);
                line.setAttribute('y1', parentY);
                line.setAttribute('x2', nodeX);
                line.setAttribute('y2', nodeY);
                line.setAttribute('stroke', '#8a5a44');
                line.setAttribute('stroke-width', '2');
                line.classList.add('skill-connection');
                
                line.dataset.skillName = node.dataset.skillName;
                line.dataset.tier = '3';
                line.dataset.parentSkill = parentNode.dataset.skillName;
                
                // Check if this skill has an active variant
                if (this.playerSkills[node.dataset.skillName]?.activeVariant) {
                    line.classList.add('active');
                }
                
                svg.appendChild(line);
            }
        });
        
        // Add SVG to the diagram
        container.appendChild(svg);
    }
    
    /**
     * Add center node for basic attack (root of the tree)
     * @param {HTMLElement} container - Container element
     */
    addCenterNode(container) {
        // Create center node
        const centerNode = document.createElement('div');
        centerNode.className = 'skill-node center-node';
        
        // Get the basic attack skill
        const basicAttack = SKILLS.find(skill => skill.basicAttack);
        
        if (basicAttack) {
            // Get icon data for the basic attack
            const iconData = getSkillIcon(basicAttack.name);
            
            centerNode.innerHTML = `
                <div class="skill-icon" style="background-color: ${iconData.color}">
                    ${iconData.emoji}
                </div>
                <div class="skill-name">${basicAttack.name}</div>
            `;
            
            // Add click event to show skill details
            centerNode.addEventListener('click', () => {
                this.showSkillDetails(basicAttack.name);
            });
            
            centerNode.dataset.skillName = basicAttack.name;
        } else {
            // Fallback if no basic attack is found
            centerNode.innerHTML = `
                <div class="skill-icon" style="background-color: #4169e1">
                    ⚡
                </div>
                <div class="skill-name">Basic Attack</div>
            `;
            
            centerNode.dataset.skillName = "Basic Attack";
        }
        
        // Create a root tier container
        const rootTier = document.createElement('div');
        rootTier.className = 'skill-tier tier-root';
        rootTier.appendChild(centerNode);
        container.appendChild(rootTier);
    }
    
    /**
     * Show skill details
     * @param {string} skillName - Name of the skill
     */
    showSkillDetails(skillName) {
        // Find skill data from SKILLS array
        const skillData = SKILLS.find(s => s.name === skillName);
        
        // Store selected skill
        this.selectedSkill = {
            skillName: skillName,
            data: skillData
        };
        
        // Update skill details
        document.getElementById('skill-detail-name').textContent = skillName;
        
        // Get description from skill trees if available, otherwise from SKILLS
        let description = '';
        if (this.skillTrees && this.skillTrees[skillName]) {
            description = this.skillTrees[skillName].baseDescription;
        } else if (skillData) {
            description = skillData.description;
        }
        
        document.getElementById('skill-detail-description').textContent = description;
        
        // Update minimap to highlight the selected skill
        this.updateMinimap();
        
        // Update skill stats if we have skill data
        if (skillData) {
            const statsHtml = `
                <div class="skill-stat">
                    <span class="skill-stat-icon">⚔️</span>
                    Damage: <span class="skill-stat-value">${skillData.damage}</span>
                </div>
                <div class="skill-stat">
                    <span class="skill-stat-icon">🔮</span>
                    Mana Cost: <span class="skill-stat-value">${skillData.manaCost}</span>
                </div>
                <div class="skill-stat">
                    <span class="skill-stat-icon">⏱️</span>
                    Cooldown: <span class="skill-stat-value">${skillData.cooldown}s</span>
                </div>
                <div class="skill-stat">
                    <span class="skill-stat-icon">📏</span>
                    Range: <span class="skill-stat-value">${skillData.range}</span>
                </div>
                <div class="skill-stat">
                    <span class="skill-stat-icon">⭕</span>
                    Radius: <span class="skill-stat-value">${skillData.radius}</span>
                </div>
                <div class="skill-stat">
                    <span class="skill-stat-icon">⏳</span>
                    Duration: <span class="skill-stat-value">${skillData.duration}s</span>
                </div>
            `;
            document.getElementById('skill-detail-stats').innerHTML = statsHtml;
        } else {
            document.getElementById('skill-detail-stats').innerHTML = '<div class="skill-stat">No detailed stats available</div>';
        }
        
        // Show variants or buffs based on active tab
        if (this.activeTab === 'variants') {
            this.showSkillVariants(skillName);
        } else {
            this.showSkillBuffs(skillName);
        }
        
        // Highlight selected skill node
        document.querySelectorAll('.skill-node').forEach(node => {
            node.classList.remove('selected');
        });
        
        const selectedNode = document.querySelector(`.skill-node[data-skill-name="${skillName}"]`);
        if (selectedNode) {
            selectedNode.classList.add('selected');
        }
        
        // Expand the branch for this skill
        this.expandBranch(skillName);
    }
    
    /**
     * Show skill variants for the selected skill
     * @param {string} skillName - Name of the skill
     */
    showSkillVariants(skillName) {
        const variantsContainer = document.getElementById('skill-variants');
        
        // Clear container
        variantsContainer.innerHTML = '';
        
        // Check if we have variants data for this skill
        if (!this.skillTrees || !this.skillTrees[skillName] || !this.skillTrees[skillName].variants) {
            variantsContainer.innerHTML = '<div class="no-variants">No variants available for this skill.</div>';
            return;
        }
        
        const variants = this.skillTrees[skillName].variants;
        const playerSkillData = this.playerSkills[skillName];
        
        // Create HTML for variants
        let variantsHtml = '';
        
        Object.entries(variants).forEach(([variantName, variantData]) => {
            // Determine if this variant is active
            const isActive = playerSkillData && playerSkillData.activeVariant === variantName;
            
            // Get variant cost and requirements
            const cost = variantData.cost || 5;
            const requiredPoints = variantData.requiredPoints || 0;
            
            // Get icon for the variant
            const iconData = getSkillIcon(variantName);
            
            // Create effects HTML
            let effectsHtml = '';
            if (variantData.effects && variantData.effects.length > 0) {
                effectsHtml = '<div class="skill-variant-effects">';
                variantData.effects.forEach(effect => {
                    const effectIcon = getBuffIcon(effect);
                    effectsHtml += `
                        <div class="skill-effect">
                            <span class="skill-effect-icon">${effectIcon.emoji}</span>
                            ${effect}
                        </div>
                    `;
                });
                effectsHtml += '</div>';
            }
            
            // Create unlock requirement HTML
            let unlockHtml = '';
            if (variantData.unlockedBy) {
                unlockHtml = `<div class="skill-variant-unlock">Unlocked by: ${variantData.unlockedBy}</div>`;
            }
            
            // Add skill point requirement if any
            if (requiredPoints > 0) {
                unlockHtml += `<div class="skill-variant-unlock">Requires ${requiredPoints} points in ${skillName}</div>`;
            }
            
            // Determine variant state and button text
            let variantState = '';
            let buttonText = 'Select';
            let isDisabled = false;
            
            if (isActive) {
                variantState = 'unlocked';
                buttonText = 'Active';
                isDisabled = true;
            } else if (this.skillPoints < cost) {
                variantState = 'locked';
                buttonText = 'Not Enough Points';
                isDisabled = true;
            } else if (playerSkillData.points < requiredPoints) {
                variantState = 'locked';
                buttonText = `Requires ${requiredPoints} Points`;
                isDisabled = true;
            }
            
            variantsHtml += `
                <div class="skill-variant ${variantState}" data-variant="${variantName}">
                    <div class="skill-variant-header">
                        <div class="skill-variant-name">
                            <div class="skill-variant-icon" style="background-color: ${iconData.color}">${iconData.emoji}</div>
                            ${variantName}
                        </div>
                        <div class="skill-variant-cost">${cost} points</div>
                    </div>
                    <div class="skill-variant-description">${variantData.description}</div>
                    ${effectsHtml}
                    ${unlockHtml}
                    <button class="skill-variant-select" data-variant="${variantName}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
                </div>
            `;
        });
        
        variantsContainer.innerHTML = variantsHtml;
        
        // Add click events to variant select buttons
        document.querySelectorAll('.skill-variant-select').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    const variantName = e.target.dataset.variant;
                    this.selectSkillVariant(skillName, variantName);
                });
            }
        });
    }
    
    /**
     * Show skill buffs for the selected skill
     * @param {string} skillName - Name of the skill
     */
    showSkillBuffs(skillName) {
        const buffsContainer = document.getElementById('skill-buffs');
        
        // Clear container
        buffsContainer.innerHTML = '';
        
        // Check if we have buffs data for this skill
        if (!this.skillTrees || !this.skillTrees[skillName] || !this.skillTrees[skillName].buffs) {
            buffsContainer.innerHTML = '<div class="no-buffs">No buffs available for this skill.</div>';
            return;
        }
        
        const buffs = this.skillTrees[skillName].buffs;
        const playerSkillData = this.playerSkills[skillName];
        
        // Check if player has unlocked a variant first
        const hasVariant = playerSkillData && playerSkillData.activeVariant;
        if (!hasVariant) {
            buffsContainer.innerHTML = '<div class="no-buffs">Unlock a variant first to access buffs.</div>';
            return;
        }
        
        // Create HTML for buffs
        let buffsHtml = '';
        
        Object.entries(buffs).forEach(([buffName, buffData]) => {
            // Get buff data
            const cost = buffData.cost || 5;
            const maxLevel = buffData.maxLevel || 1;
            const requiredVariant = buffData.requiredVariant || "any";
            
            // Get current buff level
            const currentLevel = playerSkillData.buffs[buffName] || 0;
            const isMaxLevel = currentLevel >= maxLevel;
            
            // Check if this buff requires a specific variant
            const hasRequiredVariant = requiredVariant === "any" || playerSkillData.activeVariant === requiredVariant;
            
            // Get icon for the buff based on its first effect
            const effectType = buffData.effects && buffData.effects.length > 0 ? buffData.effects[0] : '';
            const iconData = getBuffIcon(effectType);
            
            // Create effects HTML
            let effectsHtml = '';
            if (buffData.effects && buffData.effects.length > 0) {
                effectsHtml = '<div class="skill-buff-effects">';
                buffData.effects.forEach(effect => {
                    const effectIcon = getBuffIcon(effect);
                    effectsHtml += `
                        <div class="skill-effect">
                            <span class="skill-effect-icon">${effectIcon.emoji}</span>
                            ${effect}
                        </div>
                    `;
                });
                effectsHtml += '</div>';
            }
            
            // Create level bonuses HTML
            let levelBonusesHtml = '';
            if (buffData.levelBonuses && buffData.levelBonuses.length > 0) {
                levelBonusesHtml = '<div class="skill-buff-levels">';
                buffData.levelBonuses.forEach((bonus, index) => {
                    const level = index + 1;
                    const isCurrentLevel = currentLevel === level;
                    const isPastLevel = currentLevel > level;
                    
                    levelBonusesHtml += `
                        <div class="skill-buff-level ${isCurrentLevel ? 'current' : ''} ${isPastLevel ? 'completed' : ''}">
                            <span class="skill-buff-level-number">Level ${level}:</span>
                            <span class="skill-buff-level-bonus">${bonus}</span>
                        </div>
                    `;
                });
                levelBonusesHtml += '</div>';
            }
            
            // Create variant requirement HTML
            let variantRequirementHtml = '';
            if (requiredVariant !== "any") {
                variantRequirementHtml = `<div class="skill-buff-requirement">Requires ${requiredVariant} variant</div>`;
            }
            
            // Determine buff state and button text
            let buffState = '';
            let buttonText = 'Select';
            let isDisabled = false;
            
            if (isMaxLevel) {
                buffState = 'unlocked max-level';
                buttonText = 'Max Level';
                isDisabled = true;
            } else if (currentLevel > 0) {
                buffState = 'unlocked';
                buttonText = `Upgrade to Level ${currentLevel + 1}`;
            } else if (!hasRequiredVariant) {
                buffState = 'locked';
                buttonText = `Requires ${requiredVariant} Variant`;
                isDisabled = true;
            } else if (this.skillPoints < cost) {
                buffState = 'locked';
                buttonText = 'Not Enough Points';
                isDisabled = true;
            }
            
            buffsHtml += `
                <div class="skill-buff ${buffState}" data-buff="${buffName}">
                    <div class="skill-buff-header">
                        <div class="skill-buff-name">
                            <div class="skill-buff-icon" style="background-color: ${iconData.color}">${iconData.emoji}</div>
                            ${buffName} ${currentLevel > 0 ? `(Level ${currentLevel})` : ''}
                        </div>
                        <div class="skill-buff-cost">${cost} points</div>
                    </div>
                    <div class="skill-buff-description">${buffData.description}</div>
                    ${effectsHtml}
                    ${levelBonusesHtml}
                    ${variantRequirementHtml}
                    <button class="skill-buff-select" data-buff="${buffName}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
                </div>
            `;
        });
        
        buffsContainer.innerHTML = buffsHtml;
        
        // Add click events to buff select buttons
        document.querySelectorAll('.skill-buff-select').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    const buffName = e.target.dataset.buff;
                    this.selectSkillBuff(skillName, buffName);
                });
            }
        });
    }
    
    /**
     * Select a skill variant
     * @param {string} skillName - Name of the skill
     * @param {string} variantName - Name of the variant
     */
    selectSkillVariant(skillName, variantName) {
        // Get variant data
        const variantData = this.skillTrees[skillName].variants[variantName];
        const cost = variantData.cost || 5; // Default to 5 if not specified
        const requiredPoints = variantData.requiredPoints || 0;
        
        // Check if player has enough skill points
        if (this.skillPoints < cost) {
            this.game.hudManager.showNotification(`Not enough skill points! Need ${cost} points.`);
            return;
        }
        
        // Check if player already has a variant for this skill
        if (this.playerSkills[skillName].activeVariant) {
            this.game.hudManager.showNotification(`You already have an active variant for ${skillName}. Deactivate it first.`);
            return;
        }
        
        // Check if player has the required points in this skill
        if (this.playerSkills[skillName].points < requiredPoints) {
            this.game.hudManager.showNotification(`You need to invest ${requiredPoints} points in ${skillName} first.`);
            return;
        }
        
        // Deduct skill points
        this.skillPoints -= cost;
        document.getElementById('skill-points-value').textContent = this.skillPoints;
        
        // Update player skills data
        this.playerSkills[skillName].activeVariant = variantName;
        this.playerSkills[skillName].points += cost;
        
        // Apply skill variant effect (to be implemented in game logic)
        console.debug(`Selected variant: ${variantName} for skill: ${skillName}`);
        
        // Show notification
        this.game.hudManager.showNotification(`Unlocked ${variantName} for ${skillName}!`);
        
        // Update skill node to show it's been modified
        const skillNode = document.querySelector(`.skill-node[data-skill-name="${skillName}"]`);
        if (skillNode) {
            skillNode.classList.add('upgraded');
            
            // Add points indicator if not already present
            if (!skillNode.querySelector('.skill-points-allocated')) {
                const pointsIndicator = document.createElement('div');
                pointsIndicator.className = 'skill-points-allocated';
                pointsIndicator.textContent = this.playerSkills[skillName].points;
                skillNode.appendChild(pointsIndicator);
            } else {
                // Update existing points indicator
                const pointsIndicator = skillNode.querySelector('.skill-points-allocated');
                pointsIndicator.textContent = this.playerSkills[skillName].points;
            }
        }
        
        // Update the connection line to show it's active
        const connection = document.querySelector(`.skill-connection[data-skill-name="${skillName}"]`);
        if (connection) {
            connection.classList.add('active');
        }
        
        // Refresh the variants display
        this.showSkillVariants(skillName);
        
        // Also refresh the buffs display since variant unlocks buffs
        this.showSkillBuffs(skillName);
    }
    
    /**
     * Select a skill buff
     * @param {string} skillName - Name of the skill
     * @param {string} buffName - Name of the buff
     */
    selectSkillBuff(skillName, buffName) {
        // Get buff data
        const buffData = this.skillTrees[skillName].buffs[buffName];
        const cost = buffData.cost || 5; // Default to 5 if not specified
        const maxLevel = buffData.maxLevel || 1;
        const requiredVariant = buffData.requiredVariant || "any";
        
        // Check if player has enough skill points
        if (this.skillPoints < cost) {
            this.game.hudManager.showNotification(`Not enough skill points! Need ${cost} points.`);
            return;
        }
        
        // Check if player has unlocked a variant first
        if (!this.playerSkills[skillName].activeVariant) {
            this.game.hudManager.showNotification(`You need to unlock a variant for ${skillName} first.`);
            return;
        }
        
        // Check if this buff requires a specific variant
        if (requiredVariant !== "any" && this.playerSkills[skillName].activeVariant !== requiredVariant) {
            this.game.hudManager.showNotification(`This buff requires the ${requiredVariant} variant.`);
            return;
        }
        
        // Get current buff level
        const currentLevel = this.playerSkills[skillName].buffs[buffName] || 0;
        
        // Check if buff is already at max level
        if (currentLevel >= maxLevel) {
            this.game.hudManager.showNotification(`${buffName} is already at maximum level.`);
            return;
        }
        
        // Deduct skill points
        this.skillPoints -= cost;
        document.getElementById('skill-points-value').textContent = this.skillPoints;
        
        // Update player skills data
        const newLevel = currentLevel + 1;
        this.playerSkills[skillName].buffs[buffName] = newLevel;
        this.playerSkills[skillName].points += cost;
        
        // Apply skill buff effect (to be implemented in game logic)
        console.debug(`Selected buff: ${buffName} (Level ${newLevel}) for skill: ${skillName}`);
        
        // Show notification
        if (newLevel === 1) {
            this.game.hudManager.showNotification(`Unlocked ${buffName} for ${skillName}!`);
        } else {
            this.game.hudManager.showNotification(`Upgraded ${buffName} to Level ${newLevel}!`);
        }
        
        // Update skill node to show it's been modified
        const skillNode = document.querySelector(`.skill-node[data-skill-name="${skillName}"]`);
        if (skillNode) {
            skillNode.classList.add('upgraded');
            
            // Add points indicator if not already present
            if (!skillNode.querySelector('.skill-points-allocated')) {
                const pointsIndicator = document.createElement('div');
                pointsIndicator.className = 'skill-points-allocated';
                pointsIndicator.textContent = this.playerSkills[skillName].points;
                skillNode.appendChild(pointsIndicator);
            } else {
                // Update existing points indicator
                const pointsIndicator = skillNode.querySelector('.skill-points-allocated');
                pointsIndicator.textContent = this.playerSkills[skillName].points;
            }
        }
        
        // Refresh the buffs display
        this.showSkillBuffs(skillName);
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
        this.skillPoints = 10;
        document.getElementById('skill-points-value').textContent = this.skillPoints;
    }
    
    /**
     * Zoom in the skill tree
     */
    zoomIn() {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
            this.applyZoom();
            this.updateMinimap();
        }
    }
    
    /**
     * Zoom out the skill tree
     */
    zoomOut() {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
            this.applyZoom();
            this.updateMinimap();
        }
    }
    
    /**
     * Reset zoom to default level
     */
    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
        this.updateMinimap();
    }
    
    /**
     * Reset position to center
     */
    resetPosition() {
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.applyZoom();
        this.updateMinimap();
    }
    
    /**
     * Start panning the skill tree
     * @param {number} x - Starting X coordinate
     * @param {number} y - Starting Y coordinate
     */
    startPanning(x, y) {
        this.isPanning = true;
        this.panStartX = x;
        this.panStartY = y;
        
        // Add panning cursor
        document.getElementById('skill-tree-diagram').classList.add('panning');
    }
    
    /**
     * Update panning position
     * @param {number} x - Current X coordinate
     * @param {number} y - Current Y coordinate
     */
    updatePanning(x, y) {
        if (!this.isPanning) return;
        
        // Calculate the delta movement
        const deltaX = (x - this.panStartX) / this.zoomLevel;
        const deltaY = (y - this.panStartY) / this.zoomLevel;
        
        // Update the pan offset
        this.panOffsetX += deltaX;
        this.panOffsetY += deltaY;
        
        // Update the starting position for the next move
        this.panStartX = x;
        this.panStartY = y;
        
        // Apply the new position directly to avoid lag
        // Use requestAnimationFrame for smoother updates
        if (!this.panAnimationFrame) {
            this.panAnimationFrame = requestAnimationFrame(() => {
                this.applyZoom();
                this.updateMinimap();
                this.panAnimationFrame = null;
            });
        }
    }
    
    /**
     * Stop panning
     */
    stopPanning() {
        this.isPanning = false;
        
        // Remove panning cursor
        document.getElementById('skill-tree-diagram').classList.remove('panning');
    }
    
    /**
     * Apply the current zoom level and pan position to the skill tree
     */
    applyZoom() {
        const treeStructure = document.querySelector('.tree-structure');
        if (treeStructure) {
            // Apply both zoom and pan in a single transform with hardware acceleration
            treeStructure.style.transform = `scale(${this.zoomLevel}) translate3d(${this.panOffsetX}px, ${this.panOffsetY}px, 0)`;
            
            // Update zoom indicator
            const zoomIndicator = document.getElementById('skill-tree-zoom-indicator');
            if (zoomIndicator) {
                const zoomPercentage = Math.round(this.zoomLevel * 100);
                zoomIndicator.textContent = `${zoomPercentage}%`;
                
                // Add visual feedback for zoom level
                zoomIndicator.className = '';
                if (this.zoomLevel > 1.5) {
                    zoomIndicator.classList.add('zoom-high');
                } else if (this.zoomLevel < 0.7) {
                    zoomIndicator.classList.add('zoom-low');
                } else {
                    zoomIndicator.classList.add('zoom-normal');
                }
            }
        }
    }
    
    /**
     * Update the minimap to reflect current view
     */
    updateMinimap() {
        const minimap = document.getElementById('skill-tree-minimap');
        const viewport = document.getElementById('skill-tree-minimap-viewport');
        
        if (!minimap || !viewport) return;
        
        // Calculate the viewport size and position based on zoom and pan
        const viewportWidth = 100 / this.zoomLevel;
        const viewportHeight = 100 / this.zoomLevel;
        
        // Calculate the center point offset by the pan amount
        const centerX = 50 - (this.panOffsetX * 0.05);
        const centerY = 50 - (this.panOffsetY * 0.05);
        
        // Position the viewport
        viewport.style.width = `${viewportWidth}%`;
        viewport.style.height = `${viewportHeight}%`;
        viewport.style.left = `${centerX - (viewportWidth / 2)}%`;
        viewport.style.top = `${centerY - (viewportHeight / 2)}%`;
        
        // Update minimap nodes
        this.updateMinimapNodes();
    }
    
    /**
     * Update the minimap with skill nodes
     */
    updateMinimapNodes() {
        const minimap = document.getElementById('skill-tree-minimap');
        if (!minimap) return;
        
        // Clear existing nodes
        const existingNodes = minimap.querySelectorAll('.minimap-node');
        existingNodes.forEach(node => node.remove());
        
        // Get all skill nodes
        const skillNodes = document.querySelectorAll('.skill-node');
        
        skillNodes.forEach(node => {
            // Skip the root node
            if (node.classList.contains('root-node')) return;
            
            // Get the position of the node relative to the tree structure
            const rect = node.getBoundingClientRect();
            const treeStructure = document.querySelector('.tree-structure');
            const treeRect = treeStructure.getBoundingClientRect();
            
            // Calculate relative position (0-100%)
            const relX = ((rect.left + rect.width / 2) - treeRect.left) / treeRect.width * 100;
            const relY = ((rect.top + rect.height / 2) - treeRect.top) / treeRect.height * 100;
            
            // Create a minimap node
            const minimapNode = document.createElement('div');
            minimapNode.className = 'minimap-node';
            
            // Add selected class if this is the selected skill
            if (this.selectedSkill && node.dataset.skillName === this.selectedSkill.skillName) {
                minimapNode.classList.add('selected');
            }
            
            // Position the node
            minimapNode.style.left = `${relX}%`;
            minimapNode.style.top = `${relY}%`;
            
            // Add to minimap
            minimap.appendChild(minimapNode);
        });
    }
}