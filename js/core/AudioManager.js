// Simplified AudioManager that doesn't use Three.js audio system
export class AudioManager {
    constructor(game) {
        this.game = game;
        this.audioEnabled = false;
        this.isMuted = true;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        console.warn('Audio system disabled to prevent errors');
    }
    
    init() {
        // No initialization needed for dummy audio system
        return true;
    }
    
    // Dummy methods that do nothing
    playSound() {}
    playMusic() {}
    stopMusic() {}
    pauseMusic() {}
    resumeMusic() {}
    
    toggleMute() {
        // Always return true (muted) to prevent audio from playing
        return true;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}