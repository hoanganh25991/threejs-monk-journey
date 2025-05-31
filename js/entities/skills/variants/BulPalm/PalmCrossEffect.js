import { BulPalmCrossEffect } from "./BulPalmCrossEffect.js";

/**
 * Effect for the Palm Cross variant of Bul Palm
 * Summons 4 giant palms in a cross pattern that fall simultaneously and cause a massive explosion
 */
export class PalmCrossEffect extends BulPalmCrossEffect {
  constructor(skill) {
    super(skill);
    
    // Check for buff levels to adjust palm size or explosion power
    if (skill.buffs && skill.buffs["Palm Mastery"]) {
      const buffLevel = skill.buffs["Palm Mastery"];
      // Increase explosion damage based on buff level
      this.explosionDamageMultiplier = 1.0 + (buffLevel * 0.15); // 15% increase per level
    }
  }
}