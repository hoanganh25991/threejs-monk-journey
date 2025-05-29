/**
 * Handles serialization and deserialization of player data
 */
export class PlayerSerializer {
    /**
     * Serialize player data for saving
     * @param {Object} player - The player object
     * @returns {Object} Serialized player data
     */
    static serialize(player) {
        if (!player) {
            console.warn('Player object is null or undefined');
            return {};
        }
        
        // Create a default position if player.position is undefined
        const position = player.position ? {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
        } : { x: 0, y: 0, z: 0 };
        
        return {
            stats: { ...player.stats },
            position: position,
            level: player.stats.level,
            experience: player.stats.experience,
            skills: player.skills.getSkills().map(skill => ({
                name: skill.name,
                cooldown: skill.cooldown,
                currentCooldown: skill.currentCooldown
            }))
        };
    }
    
    /**
     * Deserialize player data from save
     * @param {Object} player - The player object to update
     * @param {Object} playerData - The saved player data
     */
    static deserialize(player, playerData) {
        if (!player || !playerData) {
            console.error('Player or player data is null or undefined');
            return;
        }
        
        console.debug('Loading player data:', Object.keys(playerData));
        
        // Load stats
        if (playerData.stats) {
            console.debug('Loading player stats');
            // Instead of replacing the stats object, update its properties
            Object.keys(playerData.stats).forEach(key => {
                player.stats[key] = playerData.stats[key];
            });
        }
        
        // Load position
        if (playerData.position) {
            console.debug('Loading player position');
            player.setPosition(
                playerData.position.x || 0,
                playerData.position.y || 0,
                playerData.position.z || 0
            );
        } else {
            player.setPosition(0, 0, 0);
        }
        
        // Load additional player data if available
        
        if (playerData.level !== undefined) {
            player.stats.level = playerData.level;
        }
        
        if (playerData.experience !== undefined) {
            player.stats.experience = playerData.experience;
        }
        
        // Load skills if available
        if (playerData.skills && Array.isArray(playerData.skills) && player.skills) {
            try {
                player.skills.loadSkills(playerData.skills);
            } catch (skillError) {
                console.warn('Error loading skills:', skillError);
            }
        }
        
        // Load skills cooldowns if available
        if (playerData.skills && Array.isArray(playerData.skills)) {
            playerData.skills.forEach((savedSkill, index) => {
                if (index < player.skills.length) {
                    player.skills[index].currentCooldown = savedSkill.currentCooldown || 0;
                }
            });
        }
        
        console.debug('Player data loaded successfully');
    }
}