# Item System and Difficulty Scaling Plan

<!-- TOC -->

- [Item System and Difficulty Scaling Plan](#item-system-and-difficulty-scaling-plan)
    - [Enhanced Item System](#1-enhanced-item-system)
        - [Item Categories and Stats](#item-categories-and-stats)
            - [Weapons](#weapons)
            - [Armor](#armor)
            - [Accessories](#accessories)
        - [Item Rarity System](#item-rarity-system)
        - [Item Level Scaling](#item-level-scaling)
        - [Set Items](#set-items)
    - [Integration with Skill System](#2-integration-with-skill-system)
        - [Item Effects on Skills](#item-effects-on-skills)
        - [Skill Variants and Buffs](#skill-variants-and-buffs)
    - [Enemy and Boss Scaling System](#3-enemy-and-boss-scaling-system)
        - [Base Enemy Scaling](#base-enemy-scaling)
        - [Enemy Types](#enemy-types)
        - [Boss Mechanics](#boss-mechanics)
        - [Enemy Affixes System](#enemy-affixes-system)
    - [Difficulty Scaling System](#4-difficulty-scaling-system)
        - [Difficulty Levels](#difficulty-levels)
        - [Dynamic Difficulty Adjustment](#dynamic-difficulty-adjustment)
        - [World Tiers Optional Endgame System](#world-tiers-optional-endgame-system)
    - [Implementation Plan](#5-implementation-plan)
        - [Phase 1: Core Item System](#phase-1-core-item-system)
        - [Phase 2: Skill Integration](#phase-2-skill-integration)
        - [Phase 3: Enemy Scaling](#phase-3-enemy-scaling)
        - [Phase 4: Difficulty System](#phase-4-difficulty-system)
        - [Phase 5: Advanced Features](#phase-5-advanced-features)
    - [Technical Implementation Details](#6-technical-implementation-details)
        - [Item Data Structure](#item-data-structure)
        - [Skill Damage Calculation](#skill-damage-calculation)
        - [Enemy Scaling Implementation](#enemy-scaling-implementation)
    - [Balance Considerations](#7-balance-considerations)
        - [Power Curve Management](#power-curve-management)
        - [Avoiding Common Pitfalls](#avoiding-common-pitfalls)
        - [Testing Methodology](#testing-methodology)
    - [Future Expansion Possibilities](#8-future-expansion-possibilities)
    - [Conclusion](#conclusion)

<!-- /TOC -->

## 1. Enhanced Item System

### Item Categories and Stats

#### Weapons
- **Primary Stat**: Attack Power
- **Secondary Stats**:
  - Critical Hit Chance (%)
  - Critical Hit Damage (%)
  - Attack Speed (%)
  - Element Type (Fire, Ice, Lightning, Holy)
  - Special Effects (chance to stun, slow, etc.)

#### Armor
- **Primary Stat**: Defense
- **Secondary Stats**:
  - Health Bonus (%)
  - Damage Reduction (%)
  - Elemental Resistance (%)
  - Dodge Chance (%)
  - Special Effects (reflect damage, thorns, etc.)

#### Accessories
- **Amulets**: Focus on Intelligence/Mana
  - Mana Pool Increase (%)
  - Mana Regeneration (%)
  - Skill Cooldown Reduction (%)
  - Skill Effect Duration (%)
  
- **Rings**: Focus on Utility
  - Resource Generation
  - Movement Speed
  - Gold/Experience Bonus
  - Luck (item drop rate)
  
- **Belts**: Focus on Agility
  - Attack Speed (%)
  - Movement Speed (%)
  - Dodge Chance (%)
  - Stamina Regeneration

### Item Rarity System

1. **Common** (White)
   - 0-1 Secondary Stats
   - Base stat multiplier: 1.0x

2. **Uncommon** (Green)
   - 1-2 Secondary Stats
   - Base stat multiplier: 1.2x

3. **Rare** (Blue)
   - 2-3 Secondary Stats
   - Base stat multiplier: 1.5x
   - May have 1 special effect

4. **Epic** (Purple)
   - 3-4 Secondary Stats
   - Base stat multiplier: 2.0x
   - 1-2 special effects

5. **Legendary** (Orange)
   - 4-5 Secondary Stats
   - Base stat multiplier: 2.5x
   - 2-3 special effects
   - Unique visual effects

6. **Mythic** (Red)
   - 5-6 Secondary Stats
   - Base stat multiplier: 3.0x
   - 3-4 special effects
   - Unique skill modification

### Item Level Scaling

- Base item stats scale with item level
- Formula: `BaseStat * (1 + (ItemLevel * 0.05))`
- Example: Level 20 weapon with base damage 10 = 10 * (1 + (20 * 0.05)) = 20 damage

### Set Items

- Items that belong to a set (2-6 pieces)
- Wearing multiple pieces provides set bonuses
- Example:
  - 2 pieces: +10% Attack Speed
  - 4 pieces: +20% Skill Damage
  - 6 pieces: Special skill modification or new skill

## 2. Integration with Skill System

### Item Effects on Skills

1. **Direct Damage Amplification**
   - Weapon damage directly adds to skill damage
   - Formula: `SkillDamage = BaseDamage * (1 + (AttackPower / 10)) * (1 + WeaponDamageBonus)`

2. **Skill Modification System**
   - Items can modify how skills behave
   - Examples:
     - "Wave of Light now creates 3 smaller waves"
     - "Flying Kick leaves a trail of fire"
     - "Exploding Palm affects 2 additional enemies"

3. **Elemental Damage System**
   - Skills can have elemental types (Fire, Ice, Lightning, Holy)
   - Items can boost specific elemental damage
   - Enemies can have resistances or weaknesses

4. **Cooldown Reduction**
   - Items can reduce skill cooldowns
   - Cap at 50% total reduction to prevent abuse

### Skill Variants and Buffs

1. **Skill Variants**
   - Each skill can have 3-5 variants
   - Variants change how the skill functions
   - Items can unlock or enhance specific variants

2. **Buff System**
   - Temporary buffs from skills or consumables
   - Stacking rules (additive vs. multiplicative)
   - Duration scaling with Intelligence

3. **Skill Synergy System**
   - Using certain skills in sequence provides bonuses
   - Items can enhance these synergies
   - Example: "After using Flying Kick, your next Wave of Light deals 30% more damage"

## 3. Enemy and Boss Scaling System

### Base Enemy Scaling

- **Health**: `BaseHealth * (1 + (PlayerLevel * 0.1)) * DifficultyMultiplier`
- **Damage**: `BaseDamage * (1 + (PlayerLevel * 0.08)) * DifficultyMultiplier`
- **Defense**: `BaseDefense * (1 + (PlayerLevel * 0.05)) * DifficultyMultiplier`

### Enemy Types

1. **Normal**: Standard enemies with basic attacks
2. **Elite**: Stronger enemies with one special ability
3. **Champion**: Powerful enemies with multiple abilities
4. **Mini-Boss**: Zone-specific challenging enemies
5. **Boss**: Major encounters with phases and mechanics

### Boss Mechanics

- **Phase System**: Bosses change behavior at health thresholds
- **Immunity Phases**: Temporarily immune to certain damage types
- **Special Attacks**: Telegraphed attacks that require dodging
- **Minion Summoning**: Call for reinforcements during battle
- **Enrage Timer**: Bosses become stronger after a certain time

### Enemy Affixes System

Similar to Diablo, enemies can have special affixes:
- Frozen: Creates ice patches that slow and damage
- Molten: Leaves fire trails and explodes on death
- Teleporter: Can teleport to avoid attacks
- Shielded: Periodically immune to damage
- Vampiric: Heals from damage dealt

## 4. Difficulty Scaling System

### Difficulty Levels

1. **Basic (Easy)**
   - Enemy Level = Player Level - 5 (minimum 1)
   - Damage Multiplier: 0.7x
   - Health Multiplier: 0.7x
   - Experience Gain: 0.8x
   - Item Drop Quality: 0.8x
   - Item Drop Rate: 1.2x

2. **Medium (Normal)**
   - Enemy Level = Player Level - 2 (minimum 1)
   - Damage Multiplier: 1.0x
   - Health Multiplier: 1.0x
   - Experience Gain: 1.0x
   - Item Drop Quality: 1.0x
   - Item Drop Rate: 1.0x

3. **Hard (Challenging)**
   - Enemy Level = Player Level + 2
   - Damage Multiplier: 1.3x
   - Health Multiplier: 1.5x
   - Experience Gain: 1.2x
   - Item Drop Quality: 1.2x
   - Item Drop Rate: 1.0x

4. **Hell (Very Hard)**
   - Enemy Level = Player Level + 5
   - Damage Multiplier: 2.0x
   - Health Multiplier: 2.5x
   - Experience Gain: 1.5x
   - Item Drop Quality: 1.5x
   - Item Drop Rate: 0.8x

5. **Inferno (Endgame)**
   - Enemy Level = Player Level + 10
   - Damage Multiplier: 3.0x
   - Health Multiplier: 4.0x
   - Experience Gain: 2.0x
   - Item Drop Quality: 2.0x
   - Item Drop Rate: 0.7x
   - Special affixes and mechanics

### Dynamic Difficulty Adjustment

- System monitors player performance (damage taken, time to kill)
- Subtly adjusts enemy stats if player is struggling or dominating
- Can be disabled in settings for purists

### World Tiers (Optional Endgame System)

- After reaching max level, unlock World Tier system
- Each tier increases enemy difficulty but improves rewards
- Special items and bosses only appear at higher tiers

## 6. Technical Implementation Details

### Item Data Structure

```javascript
{
  id: "unique-item-id",
  name: "Thunderfury",
  type: "weapon",
  subType: "fist",
  level: 30,
  rarity: "legendary",
  baseStats: {
    damage: 45,
    attackSpeed: 1.2
  },
  secondaryStats: [
    { type: "critChance", value: 5 },
    { type: "critDamage", value: 50 },
    { type: "elementalDamage", element: "lightning", value: 20 }
  ],
  specialEffects: [
    { 
      id: "chain-lightning",
      description: "Attacks have a 20% chance to create chain lightning",
      trigger: "onHit",
      chance: 20,
      effect: "chainLightning",
      params: { jumps: 3, damagePercent: 40 }
    }
  ],
  setId: "stormcaller",
  visual: {
    model: "models/weapons/thunderfury.glb",
    particles: "effects/lightning_trail.json"
  }
}
```

### Skill Damage Calculation

```javascript
function calculateSkillDamage(skill, player) {
  // Base skill damage
  let damage = skill.baseDamage;
  
  // Scale with player level and attack power
  damage *= (1 + (player.stats.attackPower / 10));
  damage += player.stats.strength * 0.5;
  damage += (player.stats.level - 1) * 2;
  
  // Apply weapon damage
  if (player.equipment.weapon) {
    damage += player.equipment.weapon.damage;
    
    // Apply elemental bonuses if matching
    if (skill.element === player.equipment.weapon.element) {
      damage *= (1 + (player.equipment.weapon.elementalBonus / 100));
    }
  }
  
  // Apply skill damage bonuses from items
  const skillDamageBonus = player.getStatBonus('skillDamage');
  damage *= (1 + (skillDamageBonus / 100));
  
  // Apply specific skill bonuses
  const specificSkillBonus = player.getStatBonus(`${skill.id}Damage`);
  damage *= (1 + (specificSkillBonus / 100));
  
  // Apply difficulty scaling
  damage *= player.game.difficultySettings.playerDamageMultiplier;
  
  // Add random variation
  const variation = damage * 0.1 * (Math.random() - 0.5);
  damage += variation;
  
  return Math.round(damage);
}
```

### Enemy Scaling Implementation

```javascript
function scaleEnemyToPlayerLevel(enemy, playerLevel, difficulty) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const effectiveLevel = Math.max(1, playerLevel + settings.levelOffset);
  
  // Scale health
  enemy.maxHealth = enemy.baseHealth * 
    (1 + (effectiveLevel * 0.1)) * 
    settings.healthMultiplier;
  
  // Scale damage
  enemy.damage = enemy.baseDamage * 
    (1 + (effectiveLevel * 0.08)) * 
    settings.damageMultiplier;
  
  // Scale defense
  enemy.defense = enemy.baseDefense * 
    (1 + (effectiveLevel * 0.05)) * 
    settings.defenseMultiplier;
  
  // Add affixes for higher difficulties
  if (settings.affixCount > 0 && enemy.rank >= ENEMY_RANK.ELITE) {
    assignRandomAffixes(enemy, settings.affixCount);
  }
  
  return enemy;
}
```

## 7. Balance Considerations

### Power Curve Management

- Player power should increase ~10-15% per level
- Enemy power should increase ~8-12% per level
- At higher difficulties, enemy power curve steepens
- Items should account for ~40-60% of player power at endgame

### Avoiding Common Pitfalls

1. **Power Creep**: Regular balance passes to keep all items viable
2. **One-Shot Mechanics**: Cap damage to prevent frustrating deaths
3. **Required Items**: Avoid making specific items mandatory
4. **Stat Inflation**: Keep numbers manageable with diminishing returns
5. **Difficulty Spikes**: Smooth progression between zones and levels

### Testing Methodology

- Create benchmark scenarios for each player level
- Measure time-to-kill for standard enemies
- Track player survival time against bosses
- Analyze item usage patterns
- Gather player feedback on "feel" of different builds

## 8. Future Expansion Possibilities

- **Paragon System**: Post-max-level progression
- **Seasons**: Regular resets with new themes and items
- **Crafting System**: Create and modify items
- **Enchanting**: Reroll or enhance item properties
- **Transmogrification**: Change item appearance
- **Legendary Gems**: Special socketable items that grow in power

## Conclusion

This comprehensive plan provides a solid foundation for enhancing your game's item system and difficulty scaling. By implementing these systems incrementally, you can create a deep and engaging progression system that keeps players invested long-term. The flexible difficulty options will ensure the game remains challenging yet accessible to players of all skill levels and gear quality.
