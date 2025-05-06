/**
 * AnimationUtils.js
 * Shared utilities for handling animations across different model classes
 */

/**
 * Play a specific animation with crossfade
 * @param {Object} animations - Object containing all available animations
 * @param {string} currentAnimation - Name of the currently playing animation
 * @param {string} primaryName - Primary animation name to play
 * @param {string} fallbackName - Fallback animation name if primary not found
 * @param {number} transitionDuration - Duration of crossfade transition in seconds
 * @returns {Object} - Object containing success status, animation played, and updated current animation name
 */
export function playAnimation(animations, currentAnimation, primaryName, fallbackName = null, transitionDuration = 0.5) {
    // If we don't have animations, exit early
    if (!animations || Object.keys(animations).length === 0) {
        console.log('AnimationUtils: No animations available to play');
        return { 
            success: false, 
            animation: null, 
            currentAnimation: currentAnimation 
        };
    }
    
    // If primaryName is null, skip it
    let animationToPlay = null;
    
    // Check if primaryName is a direct animation name
    if (primaryName && animations[primaryName]) {
        animationToPlay = animations[primaryName];
        console.log(`AnimationUtils: Found direct animation match: ${primaryName}`);
    }
    // Try fallback if primary not found and fallback is provided
    else if (!animationToPlay && fallbackName && animations[fallbackName]) {
        animationToPlay = animations[fallbackName];
        console.log(`AnimationUtils: Using fallback animation: ${fallbackName}`);
    }
    
    // If neither exists, try to find a similar animation by partial name match
    if (!animationToPlay) {
        const allAnimNames = Object.keys(animations);
        console.log(`AnimationUtils: Searching for similar animations among: ${allAnimNames.join(', ')}`);
        
        // Try to find animation that contains the primary name
        if (primaryName) {
            const primaryMatch = allAnimNames.find(name => 
                name.toLowerCase().includes(primaryName.toLowerCase()));
                
            if (primaryMatch) {
                animationToPlay = animations[primaryMatch];
                console.log(`AnimationUtils: Found partial match for ${primaryName}: ${primaryMatch}`);
            }
        }
        
        // Try to find animation that contains the fallback name if primary match not found
        if (!animationToPlay && fallbackName) {
            const fallbackMatch = allAnimNames.find(name => 
                name.toLowerCase().includes(fallbackName.toLowerCase()));
                
            if (fallbackMatch) {
                animationToPlay = animations[fallbackMatch];
                console.log(`AnimationUtils: Found partial match for fallback ${fallbackName}: ${fallbackMatch}`);
            }
        }
        
        // If no matching animation is found, return false
        if (!animationToPlay) {
            console.log(`AnimationUtils: No matching animation found for ${primaryName} or ${fallbackName}`);
            return { 
                success: false, 
                animation: null, 
                currentAnimation: currentAnimation 
            };
        }
    }
    
    // If this is already the current animation, don't restart it but return true
    if (currentAnimation === animationToPlay._clip.name) {
        return { 
            success: true, 
            animation: animationToPlay, 
            currentAnimation: currentAnimation 
        };
    }
    
    // Crossfade to the new animation
    animationToPlay.reset().fadeIn(transitionDuration).play();
    
    // If there was a previous animation, fade it out
    if (currentAnimation && animations[currentAnimation]) {
        animations[currentAnimation].fadeOut(transitionDuration);
    }
    
    // Return success with the new animation and updated current animation name
    return { 
        success: true, 
        animation: animationToPlay, 
        currentAnimation: animationToPlay._clip.name 
    };
}

/**
 * Find animations by type (e.g., idle, walk, attack)
 * @param {Object} animations - Object containing all available animations
 * @param {string} type - Type of animation to find (e.g., 'idle', 'walk', 'attack')
 * @returns {Array} - Array of animation names that match the type
 */
export function findAnimationsByType(animations, type) {
    if (!animations || !type) return [];
    
    const animationNames = Object.keys(animations);
    return animationNames.filter(name => 
        name.toLowerCase().includes(type.toLowerCase())
    );
}

/**
 * Get the best matching animation for a specific type
 * @param {Object} animations - Object containing all available animations
 * @param {Array} typeKeywords - Array of keywords to match (in order of preference)
 * @returns {string|null} - Name of the best matching animation or null if none found
 */
export function getBestMatchingAnimation(animations, typeKeywords) {
    if (!animations || !typeKeywords || typeKeywords.length === 0) return null;
    
    const animationNames = Object.keys(animations);
    
    // Try each keyword in order of preference
    for (const keyword of typeKeywords) {
        const matches = animationNames.filter(name => 
            name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (matches.length > 0) {
            return matches[0]; // Return the first match
        }
    }
    
    return null; // No matches found
}

/**
 * Update animation mixer with the given delta time
 * @param {THREE.AnimationMixer} mixer - The animation mixer to update
 * @param {number} delta - Delta time in seconds
 * @returns {boolean} - Whether the update was performed
 */
export function updateAnimation(mixer, delta) {
    if (!mixer) return false;
    
    mixer.update(delta);
    return true;
}

/**
 * Update animations based on player state
 * @param {Object} params - Parameters for updating animations
 * @param {THREE.AnimationMixer} params.mixer - The animation mixer
 * @param {Object} params.animations - Object containing all available animations
 * @param {string} params.currentAnimation - Name of the currently playing animation
 * @param {Object} params.playerState - Player state object with isMoving(), isAttacking() methods
 * @param {number} params.delta - Delta time in seconds
 * @returns {Object} - Object containing success status and updated current animation name
 */
export function updateStateBasedAnimations(params) {
    const { mixer, animations, currentAnimation, playerState, delta } = params;
    
    // If we don't have a mixer or animations, exit early
    if (!mixer || !animations || Object.keys(animations).length === 0) {
        return { 
            success: false, 
            currentAnimation: currentAnimation 
        };
    }
    
    // Update the animation mixer with the delta time
    mixer.update(delta);
    
    let newCurrentAnimation = currentAnimation;
    
    // Handle player state animations
    if (playerState.isMoving()) {
        // Play walk/run animation if available
        const result = playAnimation(animations, currentAnimation, 'walk', 'run', 0.3);
        if (result.success) {
            newCurrentAnimation = result.currentAnimation;
        }
    } else if (playerState.isAttacking()) {
        // Play attack animation if available
        const result = playAnimation(animations, currentAnimation, 'attack', 'punch', 0.2);
        if (result.success) {
            newCurrentAnimation = result.currentAnimation;
        }
    } else {
        // Play idle animation if available
        const result = playAnimation(animations, currentAnimation, 'idle', 'idle', 0.5);
        if (result.success) {
            newCurrentAnimation = result.currentAnimation;
        }
    }
    
    return {
        success: true,
        currentAnimation: newCurrentAnimation
    };
}