import { BulPalmCrossEffect } from "./BulPalmCrossEffect.js";

/**
 * Effect for the Palm Cross variant of Bul Palm
 * Summons 4 giant palms in a cross pattern that fall simultaneously and cause a massive explosion
 */
export class PalmCrossEffect extends BulPalmCrossEffect {
    constructor(skill) {
      super(skill);
      
      // Check for buff levels to adjust palm count
      if (skill.buffs && skill.buffs["Empowered Palms"]) {
        const buffLevel = skill.buffs["Empowered Palms"];
        // Add 2 palms per level of the buff
        this.palmCount += buffLevel * 2;
      }
    }
}