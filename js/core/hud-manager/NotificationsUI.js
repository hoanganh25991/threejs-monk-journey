import { UIComponent } from '../UIComponent.js';
/**
 * Notifications UI component
 * Displays game notifications and messages
 */
export class NotificationsUI extends UIComponent {
    /**
     * Create a new NotificationsUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('notifications-container', game);
        this.notifications = [];
        this.damageNumbers = [];
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // No initial HTML needed, notifications are added dynamically
        return true;
    }
    
    /**
     * Update notifications and damage numbers
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update notifications
        this.updateNotifications(delta);
        
        // Update damage numbers
        this.updateDamageNumbers(delta);
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     */
    showNotification(message) {
        // Get screen height to calculate maximum notification area (1/5 of screen height)
        const screenHeight = window.innerHeight;
        const maxNotificationAreaHeight = screenHeight / 5;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '80px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '6px 12px'; // Even smaller padding for compactness
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '100';
        notification.style.transition = 'opacity 0.3s, top 0.2s'; // Faster transitions
        notification.style.fontSize = '13px'; // Smaller font size for compactness
        notification.style.maxWidth = '80%'; // Limit width
        notification.style.textAlign = 'center'; // Center text
        notification.style.overflow = 'hidden'; // Prevent text overflow
        notification.style.textOverflow = 'ellipsis'; // Add ellipsis for long text
        notification.style.whiteSpace = 'nowrap'; // Keep text on one line
        notification.textContent = message;
        
        // Add notification to container
        this.container.appendChild(notification);
        
        // Calculate how many notifications we can fit in the max area
        // Estimate each notification height (including margin) as about 40px
        const estimatedNotificationHeight = 40;
        const maxNotifications = Math.floor(maxNotificationAreaHeight / estimatedNotificationHeight);
        
        // If we have too many notifications, remove the oldest ones
        // Remove more aggressively when many new messages are coming in
        const messageRate = this.getMessageRate();
        const notificationsToKeep = messageRate > 3 ? 
            Math.max(2, maxNotifications - 2) : // High message rate - keep fewer
            maxNotifications; // Normal rate - keep max allowed
            
        while (this.notifications.length >= notificationsToKeep) {
            // Remove oldest notification
            const oldestNotification = this.notifications.shift();
            oldestNotification.element.remove();
        }
        
        // Add to notifications array with dynamic lifetime based on message rate
        const lifetime = messageRate > 3 ? 1.5 : 2.5; // Shorter lifetime when messages come quickly
        
        this.notifications.push({
            element: notification,
            lifetime: lifetime,
            message: message, // Store message for deduplication
            timestamp: Date.now() // Store timestamp for message rate calculation
        });
        
        // Check for duplicate messages and reduce their lifetime
        this.deduplicateNotifications();
        
        // Adjust position for multiple notifications
        if (this.notifications.length > 1) {
            // Calculate total height of all notifications
            let totalHeight = 0;
            let availableHeight = maxNotificationAreaHeight;
            
            // Calculate how much space we need
            for (let i = 0; i < this.notifications.length - 1; i++) {
                const notif = this.notifications[i];
                const height = notif.element.offsetHeight + 5; // Height + smaller margin
                totalHeight += height;
            }
            
            // If we exceed the max height, compress the notifications
            if (totalHeight > availableHeight) {
                // Compress notifications to fit in the available space
                this.compressNotifications(availableHeight);
            } else {
                // Just position the new notification below the last one
                const previousNotification = this.notifications[this.notifications.length - 2];
                const previousHeight = previousNotification.element.offsetHeight;
                const previousTop = parseInt(previousNotification.element.style.top);
                notification.style.top = `${previousTop + previousHeight + 5}px`; // Smaller margin
            }
        }
    }
    
    /**
     * Update existing notifications
     * @param {number} delta - Time since last update in seconds
     */
    updateNotifications(delta) {
        // Update existing notifications
        let needsReorganization = false;
        
        // Calculate message rate to determine if we need to expire messages faster
        const messageRate = this.getMessageRate();
        const fastExpiry = messageRate > 3; // If messages are coming in quickly
        
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            
            // Update notification lifetime - expire faster if many messages are coming in
            const expiryRate = fastExpiry ? 1.5 / 60 : 1 / 60;
            notification.lifetime -= expiryRate;
            
            // Remove expired notifications
            if (notification.lifetime <= 0) {
                notification.element.remove();
                this.notifications.splice(i, 1);
                needsReorganization = true;
            } else {
                // Update opacity for fade out - start fading earlier
                const fadeStartThreshold = fastExpiry ? 1.2 : 1;
                if (notification.lifetime < fadeStartThreshold) {
                    notification.element.style.opacity = notification.lifetime / fadeStartThreshold;
                }
                
                // Faster slide up for smoother animation - speed based on message rate
                const slideSpeed = fastExpiry ? 1.2 : 0.8;
                const currentTop = parseInt(notification.element.style.top);
                notification.element.style.top = `${currentTop - slideSpeed}px`;
            }
        }
        
        // If we removed notifications or have too many, reorganize the remaining ones
        if ((needsReorganization && this.notifications.length > 0) || 
            (this.notifications.length > 3 && fastExpiry)) {
            
            // Get screen height to calculate maximum notification area
            const screenHeight = window.innerHeight;
            const maxNotificationAreaHeight = screenHeight / 5;
            
            // Calculate total height of all notifications
            let totalHeight = 0;
            for (let i = 0; i < this.notifications.length; i++) {
                const notif = this.notifications[i];
                const height = notif.element.offsetHeight + 5; // Height + smaller margin
                totalHeight += height;
            }
            
            // If we exceed the max height, compress the notifications
            if (totalHeight > maxNotificationAreaHeight) {
                this.compressNotifications(maxNotificationAreaHeight);
            } else {
                // Just reposition notifications with proper spacing
                let currentTop = 80; // Start from the top position
                
                for (let i = 0; i < this.notifications.length; i++) {
                    const notification = this.notifications[i];
                    
                    // Reset transform in case it was previously compressed
                    if (notification.element.style.transform.includes('scale')) {
                        notification.element.style.transform = 'translateX(-50%)';
                    }
                    
                    notification.element.style.top = `${currentTop}px`;
                    currentTop += notification.element.offsetHeight + 5; // Height + smaller margin
                }
            }
        }
    }
    
    /**
     * Update damage numbers
     * @param {number} delta - Time since last update in seconds
     */
    updateDamageNumbers(delta) {
        // Update existing damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damageNumber = this.damageNumbers[i];
            
            // Update lifetime
            damageNumber.lifetime -= 1 / 60;
            
            // Remove expired damage numbers
            if (damageNumber.lifetime <= 0) {
                damageNumber.element.remove();
                this.damageNumbers.splice(i, 1);
            } else {
                // Update opacity for fade out
                if (damageNumber.lifetime < 0.5) {
                    damageNumber.element.style.opacity = damageNumber.lifetime * 2;
                }
                
                // Update position for float up
                const currentTop = parseInt(damageNumber.element.style.top);
                damageNumber.element.style.top = `${currentTop - 1}px`;
            }
        }
    }
    
    /**
     * Create a bleeding effect at the given position
     * @param {number} amount - Damage amount
     * @param {Object} position - 3D position {x, y, z}
     * @param {boolean} isPlayerDamage - Whether the damage was caused by the player
     */
    createBleedingEffect(amount, position, isPlayerDamage = false) {
        // Only show damage particles for player-caused damage
        if (!isPlayerDamage) return;
        
        // Convert 3D position to screen position
        const vector = position.clone();
        vector.project(this.game.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        
        // Create blood particle container
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'absolute';
        particleContainer.style.top = `${y}px`;
        particleContainer.style.left = `${x}px`;
        particleContainer.style.width = '0';
        particleContainer.style.height = '0';
        particleContainer.style.zIndex = '100';
        
        // Determine particle count and color based on damage amount
        const minParticles = 3;
        const maxParticles = 15;
        const particleCount = Math.min(maxParticles, minParticles + Math.floor(amount / 10));
        
        // Determine color based on damage amount
        // Higher damage = brighter/more intense red
        let baseColor;
        if (amount < 10) {
            baseColor = [120, 0, 0]; // Dark red for low damage
        } else if (amount < 30) {
            baseColor = [180, 0, 0]; // Medium red
        } else if (amount < 50) {
            baseColor = [220, 0, 0]; // Bright red
        } else {
            baseColor = [255, 30, 30]; // Intense red with slight glow for high damage
        }
        
        // Create blood particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // Randomize particle size based on damage
            const minSize = 3;
            const maxSize = 8 + (amount / 20); // Larger particles for higher damage
            const size = minSize + Math.random() * (maxSize - minSize);
            
            // Randomize particle color slightly
            const colorVariation = 30; // Amount of random variation
            const r = Math.max(0, Math.min(255, baseColor[0] + (Math.random() * colorVariation - colorVariation/2)));
            const g = Math.max(0, Math.min(255, baseColor[1] + (Math.random() * colorVariation - colorVariation/2)));
            const b = Math.max(0, Math.min(255, baseColor[2] + (Math.random() * colorVariation - colorVariation/2)));
            
            // Set particle styles
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            particle.style.boxShadow = `0 0 ${size/2}px rgba(${r}, ${g}, ${b}, 0.7)`;
            
            // Randomize particle position
            const spread = 30 + (amount / 5); // Higher damage = wider spread
            const posX = (Math.random() * spread * 2) - spread;
            const posY = (Math.random() * spread * 2) - spread;
            particle.style.transform = `translate(${posX}px, ${posY}px)`;
            
            // Add animation for particle
            const duration = 0.5 + (Math.random() * 1);
            particle.style.transition = `all ${duration}s ease-out`;
            
            // Add particle to container
            particleContainer.appendChild(particle);
            
            // Animate particle after a small delay
            setTimeout(() => {
                // Move particle outward
                const distance = 20 + (Math.random() * 40);
                const angle = Math.random() * Math.PI * 2;
                const endX = posX + Math.cos(angle) * distance;
                const endY = posY + Math.sin(angle) * distance;
                
                // Apply gravity effect
                const gravity = 20 + (Math.random() * 30);
                
                // Update particle position and fade out
                particle.style.transform = `translate(${endX}px, ${endY + gravity}px)`;
                particle.style.opacity = '0';
            }, 10);
        }
        
        // Add particle container to UI
        this.container.appendChild(particleContainer);
        
        // Add to damage numbers array for cleanup
        this.damageNumbers.push({
            element: particleContainer,
            lifetime: 2.0 // Slightly longer lifetime for particles
        });
        
        // For very high damage, add a brief screen flash effect
        if (amount > 40) {
            const flash = document.createElement('div');
            flash.style.position = 'absolute';
            flash.style.top = '0';
            flash.style.left = '0';
            flash.style.width = '100%';
            flash.style.height = '100%';
            flash.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
            flash.style.pointerEvents = 'none';
            flash.style.zIndex = '90';
            flash.style.transition = 'opacity 0.5s';
            
            this.container.appendChild(flash);
            
            // Fade out and remove after a short time
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    flash.remove();
                }, 500);
            }, 100);
        }
    }
    
    /**
     * Show level up animation
     * @param {number} level - New level
     */
    showLevelUp(level) {
        // Create level up element
        const levelUp = document.createElement('div');
        levelUp.style.position = 'absolute';
        levelUp.style.top = '50%';
        levelUp.style.left = '50%';
        levelUp.style.transform = 'translate(-50%, -50%)';
        levelUp.style.color = '#ffcc00';
        levelUp.style.fontSize = '48px';
        levelUp.style.fontWeight = 'bold';
        levelUp.style.textShadow = '0 0 10px #ff6600';
        levelUp.style.zIndex = '100';
        levelUp.textContent = `Level Up! ${level}`;
        
        // Add level up to container
        this.container.appendChild(levelUp);
        
        // Animate level up
        let scale = 1;
        const animation = setInterval(() => {
            scale += 0.05;
            levelUp.style.transform = `translate(-50%, -50%) scale(${scale})`;
            levelUp.style.opacity = 2 - scale;
            
            if (scale >= 2) {
                clearInterval(animation);
                levelUp.remove();
            }
        }, 50);
        
        // Show notification
        this.showNotification(`Level Up! You are now level ${level}`);
    }
    
    /**
     * Helper method to calculate message rate (messages per second)
     * @returns {number} - Message rate
     */
    getMessageRate() {
        if (this.notifications.length < 2) return 1; // Default rate
        
        // Calculate time window (in seconds) for the last few messages
        const now = Date.now();
        const oldestTimestamp = this.notifications[0].timestamp;
        const timeWindow = (now - oldestTimestamp) / 1000;
        
        // Avoid division by zero
        if (timeWindow < 0.1) return 10; // Very high rate
        
        // Calculate messages per second
        return this.notifications.length / timeWindow;
    }
    
    /**
     * Helper method to compress notifications to fit in available space
     * @param {number} availableHeight - Available height for notifications
     */
    compressNotifications(availableHeight) {
        // Calculate how much space each notification can take
        const notificationCount = this.notifications.length;
        const spacePerNotification = availableHeight / notificationCount;
        
        // Position each notification with compressed spacing
        let currentTop = 80; // Start from the top position
        
        for (let i = 0; i < this.notifications.length; i++) {
            const notification = this.notifications[i];
            
            // Apply a slight scale reduction for better compactness
            const scale = Math.max(0.85, 1 - (notificationCount * 0.02));
            notification.element.style.transform = `translateX(-50%) scale(${scale})`;
            
            // Set position
            notification.element.style.top = `${currentTop}px`;
            
            // Move to next position (use smaller spacing when compressed)
            // Use a minimum spacing to prevent overlap
            currentTop += Math.max(25, spacePerNotification);
        }
    }
    
    /**
     * Helper method to deduplicate notifications
     */
    deduplicateNotifications() {
        // Create a map to count occurrences of each message
        const messageCounts = {};
        const messageIndices = {}; // Track indices of first occurrence
        
        // Count occurrences and track first occurrence
        for (let i = 0; i < this.notifications.length; i++) {
            const notification = this.notifications[i];
            const message = notification.message;
            
            if (messageCounts[message] === undefined) {
                messageIndices[message] = i; // First occurrence
            }
            
            messageCounts[message] = (messageCounts[message] || 0) + 1;
        }
        
        // Handle duplicate messages
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            const message = notification.message;
            
            if (messageCounts[message] > 1) {
                // If this is not the first occurrence of the message
                if (messageIndices[message] !== i) {
                    // For duplicates, either remove them or reduce their lifetime drastically
                    if (messageCounts[message] > 2) {
                        // If more than 2 duplicates, remove all but the first occurrence
                        notification.element.remove();
                        this.notifications.splice(i, 1);
                    } else {
                        // For just 2 duplicates, drastically reduce lifetime
                        notification.lifetime = Math.min(notification.lifetime, 0.8);
                    }
                } else {
                    // For the first occurrence, update the text to show count
                    if (messageCounts[message] > 2) {
                        notification.element.textContent = `${message} (${messageCounts[message]}x)`;
                    }
                    // Slightly reduce lifetime of first occurrence too
                    notification.lifetime = Math.min(notification.lifetime, 2.0);
                }
            }
        }
    }
}