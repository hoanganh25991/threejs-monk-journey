import { BulPalmRainEffect } from "./BulPalmRainEffect.js";

/**
 * Effect for the Palm Rain variant of Bul Palm
 * Summons multiple palms from the sky that crash down on enemies
 */
export class PalmRainEffect extends BulPalmRainEffect {
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