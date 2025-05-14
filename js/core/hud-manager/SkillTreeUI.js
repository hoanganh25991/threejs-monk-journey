import { UIComponent } from "../UIComponent.js";
import { BATTLE_SKILLS } from "../../config/skills.js";
import { getSkillIcon, getBuffIcon } from "../../config/skill-icons.js";
import { SKILL_TREES } from "../../config/skill-tree.js";
import { applyBuffsToVariants } from "../../utils/SkillTreeUtils.js";

/**
 * Skill Tree UI component
 * Displays the monk skill tree and allows skill customization with variants and buffs
 * Based on the SKILL_TREES data structure
 */
export class SkillTreeUI extends UIComponent {
  /**
   * Create a new SkillTreeUI component
   * @param {Object} game - Reference to the game instance
   */
  constructor(game) {
    super("skill-tree", game);
    this.isSkillTreeOpen = false;
    this.selectedSkill = null;
    this.selectedVariant = null;
    this.selectedBuff = null;
    this.skillPoints = 10; // Will be loaded from player data

    // Get the skill trees and apply buffs to variants
    this.skillTrees = JSON.parse(JSON.stringify(SKILL_TREES)); // Create a deep copy
    applyBuffsToVariants(this.skillTrees);

    // Initialize player skills data structure
    this.playerSkills = {};
  }

  /**
   * Initialize the component
   * @returns {boolean} - True if initialization was successful
   */
  async init() {
    const template = `
<div id="skill-tree-header">
<div id="skill-tree-title">Monk Skill Tree</div>
<div id="skill-tree-points">Available Points: <span id="skill-points-value">${this.skillPoints}</span></div>
<div id="skill-tree-close">×</div>
</div>
<div id="skill-tree-container">
<div id="skill-tree-view">
<div id="skill-tree-skills"></div>
</div>
<div id="skill-tree-details">
<div id="skill-detail-header">
<div id="skill-detail-name">Select a skill</div>
<div id="skill-detail-description">Click on a skill to view its details and customize it.</div>
</div>
<div id="skill-detail-content">
<div id="skill-variants-container">
<h3>Variants</h3>
<div id="skill-variants"></div>
</div>
<div id="skill-buffs-container">
<h3>Buffs</h3>
<div id="skill-buffs"></div>
</div>
</div>
</div>
</div>
`;

    // Render the template
    this.render(template);

    // Add click event to close skill tree
    const closeButton = document.getElementById("skill-tree-close");
    closeButton.addEventListener("click", () => {
      this.toggleSkillTree();
    });

    // Hide initially
    this.hide();
    
    // Make sure the container has pointer-events set to auto when visible
    this.container.style.pointerEvents = 'auto';

    // Initialize player skills data structure
    this.initPlayerSkills();

    // Render the skill tree
    this.renderSkillTree();

    return true;
  }

  /**
   * Initialize player skills data structure
   */
  initPlayerSkills() {
    // Create a structure to track player's skill allocations
    this.playerSkills = {};

    // Initialize for each skill in the skill trees
    if (this.skillTrees) {
      Object.keys(this.skillTrees).forEach((skillName) => {
        this.playerSkills[skillName] = {
          activeVariant: null,
          buffs: {},
          points: 0,
        };
      });
    }

    // Also initialize for skills from BATTLE_SKILLS array that might not be in skillTrees
    BATTLE_SKILLS.forEach((skill) => {
      if (!this.playerSkills[skill.name]) {
        this.playerSkills[skill.name] = {
          activeVariant: null,
          buffs: {},
          points: 0,
        };
      }
    });
  }

  /**
   * Render the skill tree
   */
  renderSkillTree() {
    const skillTreeContainer = document.getElementById("skill-tree-skills");
    if (!skillTreeContainer) return;

    // Clear the container
    skillTreeContainer.innerHTML = "";

    // Create the skill tree structure
    const skillsHtml = [];

    // Add skills from the skill tree
    Object.keys(this.skillTrees).forEach((skillName) => {
      const skill = this.skillTrees[skillName];
      const iconData = getSkillIcon(skillName);

      // Create the skill node
      const skillNode = `
<div class="skill-node" data-skill="${skillName}">
<div class="skill-icon ${iconData.cssClass}" style="background-color: rgba(0, 0, 0, 0.7); border: 2px solid ${iconData.color}; box-shadow: 0 0 10px ${iconData.color}40;">
${iconData.emoji}
</div>
<div class="skill-name">${skillName}</div>
</div>
`;

      skillsHtml.push(skillNode);
    });

    // Add the skills to the container
    skillTreeContainer.innerHTML = skillsHtml.join("");

    // Add click event to skill nodes
    document.querySelectorAll(".skill-node").forEach((node) => {
      node.addEventListener("click", () => {
        const skillName = node.dataset.skill;
        this.selectSkill(skillName);
      });
    });
  }

  /**
   * Select a skill and show its details
   * @param {string} skillName - Name of the skill to select
   */
  selectSkill(skillName) {
    // Update selected skill
    this.selectedSkill = skillName;

    // Update UI to show the selected skill
    document.querySelectorAll(".skill-node").forEach((node) => {
      node.classList.toggle("selected", node.dataset.skill === skillName);
    });

    // Update skill details
    this.updateSkillDetails(skillName);

    // Show variants for the selected skill
    this.showSkillVariants(skillName);

    // Clear buffs container initially
    document.getElementById("skill-buffs").innerHTML = "";
  }

  /**
   * Update the skill details section
   * @param {string} skillName - Name of the skill
   */
  updateSkillDetails(skillName) {
    const nameElement = document.getElementById("skill-detail-name");
    const descriptionElement = document.getElementById(
      "skill-detail-description"
    );

    if (!nameElement || !descriptionElement) return;

    // Check if we have data for this skill
    if (!this.skillTrees || !this.skillTrees[skillName]) {
      nameElement.textContent = "Unknown Skill";
      descriptionElement.textContent =
        "No information available for this skill.";
      return;
    }

    const skillData = this.skillTrees[skillName];

    // Update skill name
    nameElement.textContent = skillName;

    // Update skill description
    descriptionElement.textContent =
      skillData.baseDescription || "No description available.";
  }

  /**
   * Show variants for a skill
   * @param {string} skillName - Name of the skill
   */
  showSkillVariants(skillName) {
    const variantsContainer = document.getElementById("skill-variants");

    // Clear container
    variantsContainer.innerHTML = "";

    // Check if we have data for this skill
    if (
      !this.skillTrees ||
      !this.skillTrees[skillName] ||
      !this.skillTrees[skillName].variants
    ) {
      variantsContainer.innerHTML =
        '<div class="no-variants">No variants available for this skill.</div>';
      return;
    }

    const skillData = this.skillTrees[skillName];
    const playerSkillData = this.playerSkills[skillName];
    const variants = skillData.variants;

    // Create HTML for variants
    const variantsHtml = [];

    // For each variant
    Object.entries(variants).forEach(([variantName, variantData]) => {
      // Determine if this variant is active
      const isActive =
        playerSkillData && playerSkillData.activeVariant === variantName;

      // Get variant cost and requirements
      const cost = variantData.cost || 5;
      const requiredPoints = variantData.requiredPoints || 0;

      // Get icon for the variant
      const iconData = getSkillIcon(variantName);

      // Create the variant element
      const variantHtml = `
<div class="skill-variant ${
        isActive ? "active" : ""
      }" data-variant="${variantName}">
<div class="variant-header">
<div class="variant-icon ${iconData.cssClass}" style="background-color: rgba(0, 0, 0, 0.7); border: 2px solid ${iconData.color}; box-shadow: 0 0 10px ${iconData.color}40;">
${iconData.emoji}
</div>
<div class="variant-name">${variantName}</div>
<div class="variant-cost">${cost} points</div>
</div>
<div class="variant-description">${
        variantData.description || "No description available."
      }</div>
<div class="variant-effects">
${
  variantData.effects
    ? variantData.effects
        .map((effect) => `<span class="effect-tag">${effect}</span>`)
        .join("")
    : ""
}
</div>
<button class="variant-select-btn" data-variant="${variantName}" ${
        isActive ? "disabled" : ""
      }>
${isActive ? "Selected" : "Select Variant"}
</button>
</div>
`;

      variantsHtml.push(variantHtml);
    });

    // Add the variants to the container
    variantsContainer.innerHTML = variantsHtml.join("");

    // Add click event to variant select buttons
    document.querySelectorAll(".variant-select-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const variantName = button.dataset.variant;
        this.selectVariant(skillName, variantName);
      });
    });
  }

  /**
   * Select a variant for a skill
   * @param {string} skillName - Name of the skill
   * @param {string} variantName - Name of the variant
   */
  selectVariant(skillName, variantName) {
    // Update player skills data
    if (this.playerSkills[skillName]) {
      this.playerSkills[skillName].activeVariant = variantName;
    }

    // Update UI
    document.querySelectorAll(".skill-variant").forEach((variant) => {
      variant.classList.remove("active");
    });

    const selectedVariant = document.querySelector(
      `.skill-variant[data-variant="${variantName}"]`
    );
    if (selectedVariant) {
      selectedVariant.classList.add("active");
    }

    // Update buttons
    document.querySelectorAll(".variant-select-btn").forEach((button) => {
      const isSelected = button.dataset.variant === variantName;
      button.disabled = isSelected;
      button.textContent = isSelected ? "Selected" : "Select Variant";
    });

    // Show buffs for the selected variant
    this.showVariantBuffs(skillName, variantName);
  }

  /**
   * Show buffs for a variant
   * @param {string} skillName - Name of the skill
   * @param {string} variantName - Name of the variant
   */
  showVariantBuffs(skillName, variantName) {
    const buffsContainer = document.getElementById("skill-buffs");

    // Clear container
    buffsContainer.innerHTML = "";

    // Check if we have data for this skill and variant
    if (
      !this.skillTrees ||
      !this.skillTrees[skillName] ||
      !this.skillTrees[skillName].variants ||
      !this.skillTrees[skillName].variants[variantName] ||
      !this.skillTrees[skillName].variants[variantName].buffs
    ) {
      buffsContainer.innerHTML =
        '<div class="no-buffs">No buffs available for this variant.</div>';
      return;
    }

    const variantData = this.skillTrees[skillName].variants[variantName];
    const playerSkillData = this.playerSkills[skillName];
    const buffs = variantData.buffs;

    // Create HTML for buffs
    const buffsHtml = [];

    // For each buff
    Object.entries(buffs).forEach(([buffName, buffData]) => {
      // Determine if this buff is active
      const isActive =
        playerSkillData &&
        playerSkillData.buffs &&
        playerSkillData.buffs[buffName];

      // Get buff cost
      const cost = buffData.cost || 5;

      // Get icon for the buff
      const iconData = getBuffIcon(
        buffData.effects && buffData.effects.length > 0
          ? buffData.effects[0]
          : ""
      );

      // Create the buff element
      const buffHtml = `
<div class="skill-buff ${isActive ? "active" : ""}" data-buff="${buffName}">
<div class="buff-header">
<div class="buff-icon ${iconData.cssClass}" style="background-color: rgba(0, 0, 0, 0.7); border: 2px solid ${iconData.color}; box-shadow: 0 0 10px ${iconData.color}40;">
${iconData.emoji}
</div>
<div class="buff-name">${buffName}</div>
<div class="buff-cost">${cost} points</div>
</div>
<div class="buff-description">${
        buffData.description || "No description available."
      }</div>
<div class="buff-effects">
${
  buffData.effects
    ? buffData.effects
        .map((effect) => `<span class="effect-tag">${effect}</span>`)
        .join("")
    : ""
}
</div>
<button class="buff-select-btn" data-buff="${buffName}" ${
        isActive ? "disabled" : ""
      }>
${isActive ? "Selected" : "Select Buff"}
</button>
</div>
`;

      buffsHtml.push(buffHtml);
    });

    // Add the buffs to the container
    buffsContainer.innerHTML = buffsHtml.join("");

    // Add click event to buff select buttons
    document.querySelectorAll(".buff-select-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const buffName = button.dataset.buff;
        this.selectBuff(skillName, buffName);
      });
    });
  }

  /**
   * Select a buff for a skill
   * @param {string} skillName - Name of the skill
   * @param {string} buffName - Name of the buff
   */
  selectBuff(skillName, buffName) {
    // Update player skills data
    if (this.playerSkills[skillName]) {
      if (!this.playerSkills[skillName].buffs) {
        this.playerSkills[skillName].buffs = {};
      }
      this.playerSkills[skillName].buffs[buffName] = true;
    }

    // Update UI
    const selectedBuff = document.querySelector(
      `.skill-buff[data-buff="${buffName}"]`
    );
    if (selectedBuff) {
      selectedBuff.classList.add("active");
    }

    // Update button
    const button = document.querySelector(
      `.buff-select-btn[data-buff="${buffName}"]`
    );
    if (button) {
      button.disabled = true;
      button.textContent = "Selected";
    }
  }

  /**
   * Toggle the skill tree visibility
   */
  toggleSkillTree() {
    this.isSkillTreeOpen = !this.isSkillTreeOpen;

    if (this.isSkillTreeOpen) {
      this.show();
      // Enable pointer events when showing the skill tree
      this.container.style.pointerEvents = 'auto';
    } else {
      this.hide();
      // Reset pointer events when hiding
      this.container.style.pointerEvents = 'none';
    }
  }
}
