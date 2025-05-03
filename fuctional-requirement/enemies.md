# Enemies Design Document

## Overview

This document outlines the requirements and specifications for the development of enemy characters in the game. Enemies serve as the primary challenge for players, providing obstacles and combat scenarios that test the player's skills and strategies.

## Objectives

- Create a diverse range of enemy types with unique behaviors and abilities.
- Implement visually distinct and engaging enemy models.
- Ensure balanced and challenging combat encounters.

## Technical Specifications

### 1. Enemy Models

#### 1.1. Design
- **Variety**: Develop multiple enemy types, each with distinct appearances and characteristics.
- **Modeling**: Use basic geometric shapes (cubes, boxes, cones) to create stylized enemy models.
- **Textures**: Apply simple textures to enhance visual appeal while maintaining performance.

#### 1.2. Animation
- **Idle**: Create idle animations to give enemies a lifelike presence.
- **Movement**: Develop walking, running, and patrolling animations for dynamic interactions.
- **Combat**: Implement attack and death animations to reflect enemy behaviors.

### 2. Enemy Types and Behaviors

#### 2.1. Basic Enemies
- **Description**: Implement standard enemies with simple attack patterns and low health.
- **Examples**: Skeletons, zombies, and goblins.

#### 2.2. Elite Enemies
- **Description**: Develop stronger enemies with enhanced abilities and higher health.
- **Abilities**: Include special attacks or defenses, such as shields or area damage.
- **Examples**: Armored knights, sorcerers, and giant beasts.

#### 2.3. Boss Enemies
- **Description**: Create powerful boss enemies with unique mechanics and high difficulty.
- **Mechanics**: Implement multiple phases, special attacks, and environmental interactions.
- **Examples**: Demon lords, dragons, and ancient guardians.

### 3. Combat and Interaction

#### 3.1. Attack Patterns
- **Melee Attacks**: Implement close-range attacks with varying speeds and damage.
- **Ranged Attacks**: Develop projectile-based attacks for long-range engagement.
- **Area Attacks**: Include area-of-effect attacks to challenge player positioning.

#### 3.2. AI and Behavior
- **Pathfinding**: Use pathfinding algorithms to navigate the environment and pursue the player.
- **Aggro System**: Implement an aggro system to determine enemy targeting priorities.
- **Fleeing and Retreating**: Allow enemies to retreat or call for reinforcements when threatened.

### 4. Visual and Audio Feedback

#### 4.1. Visual Effects
- **Hit Effects**: Use particle effects to indicate successful hits on enemies.
- **Death Effects**: Implement visual effects for enemy deaths, such as disintegration or explosion.

#### 4.2. Sound Design
- **Attack Sounds**: Include sounds for enemy attacks and movements to enhance immersion.
- **Death Sounds**: Add distinct sounds for enemy deaths to provide feedback.

### 5. User Interface

#### 5.1. Health Indicators
- **Display**: Show health bars above enemies or in the HUD to provide real-time status updates.
- **Design**: Use clear and distinct colors to indicate enemy health levels.

#### 5.2. Enemy Information
- **Tooltips**: Provide tooltips or brief descriptions for enemies when targeted by the player.
- **Icons**: Use icons to indicate enemy types or special abilities.

## Art and Aesthetics

### 6. Visual Style
- **Theme**: Reflect the dark and mystical theme of "Diablo Immortal."
- **Color Palette**: Use a combination of dark and vibrant colors to highlight enemy features.

### 7. Sound Design
- **Ambient Sounds**: Include ambient sounds for enemy presence to create tension.
- **Voice Lines**: Add voice lines for enemy taunts and interactions to enhance personality.

## Testing and Validation

### 8. Testing
- **Usability Testing**: Conduct tests to ensure enemy behaviors are intuitive and challenging.
- **Balance Testing**: Evaluate the difficulty of combat encounters to maintain gameplay balance.

### 9. Feedback
- **Player Feedback**: Gather feedback from playtesters to identify areas for improvement.
- **Iteration**: Continuously refine enemy designs based on feedback and testing results.