import * as THREE from 'three';

export class AudioManager {
    constructor(game) {
        this.game = game;
        this.audioListener = new THREE.AudioListener();
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
    }
    
    init() {
        // Add audio listener to camera
        this.game.camera.add(this.audioListener);
        
        // Load sound effects
        this.loadSoundEffects();
        
        // Load background music
        this.loadBackgroundMusic();
        
        return true;
    }
    
    loadSoundEffects() {
        // Create sound objects
        this.createSound('playerAttack', 'assets/audio/player_attack.mp3');
        this.createSound('playerHit', 'assets/audio/player_hit.mp3');
        this.createSound('enemyAttack', 'assets/audio/enemy_attack.mp3');
        this.createSound('enemyHit', 'assets/audio/enemy_hit.mp3');
        this.createSound('enemyDeath', 'assets/audio/enemy_death.mp3');
        this.createSound('playerDeath', 'assets/audio/player_death.mp3');
        this.createSound('levelUp', 'assets/audio/level_up.mp3');
        this.createSound('questComplete', 'assets/audio/quest_complete.mp3');
        this.createSound('itemPickup', 'assets/audio/item_pickup.mp3');
        this.createSound('skillWaveStrike', 'assets/audio/skill_wave_strike.mp3');
        this.createSound('skillCycloneStrike', 'assets/audio/skill_cyclone_strike.mp3');
        this.createSound('skillSevenSidedStrike', 'assets/audio/skill_seven_sided_strike.mp3');
        this.createSound('skillInnerSanctuary', 'assets/audio/skill_inner_sanctuary.mp3');
        this.createSound('menuClick', 'assets/audio/menu_click.mp3');
    }
    
    loadBackgroundMusic() {
        // Create audio object for background music
        this.music = new THREE.Audio(this.audioListener);
        
        // Load background music
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('assets/audio/background_music.mp3', (buffer) => {
            this.music.setBuffer(buffer);
            this.music.setLoop(true);
            this.music.setVolume(this.musicVolume);
        });
    }
    
    createSound(name, path) {
        // Create audio object
        const sound = new THREE.Audio(this.audioListener);
        
        // Load sound
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setVolume(this.sfxVolume);
        });
        
        // Add to sounds collection
        this.sounds[name] = sound;
    }
    
    playSound(name) {
        // Check if sound exists and is not muted
        if (this.sounds[name] && !this.isMuted) {
            // Stop sound if already playing
            if (this.sounds[name].isPlaying) {
                this.sounds[name].stop();
            }
            
            // Play sound
            this.sounds[name].play();
        }
    }
    
    playMusic() {
        // Check if music exists and is not muted
        if (this.music && !this.isMuted && !this.music.isPlaying) {
            this.music.play();
        }
    }
    
    stopMusic() {
        // Check if music exists and is playing
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }
    }
    
    pauseMusic() {
        // Check if music exists and is playing
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }
    
    resumeMusic() {
        // Check if music exists and is paused
        if (this.music && !this.music.isPlaying && !this.isMuted) {
            this.music.play();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Stop all sounds
            Object.values(this.sounds).forEach(sound => {
                if (sound.isPlaying) {
                    sound.stop();
                }
            });
            
            // Stop music
            if (this.music && this.music.isPlaying) {
                this.music.stop();
            }
        } else {
            // Resume music
            this.resumeMusic();
        }
        
        return this.isMuted;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.setVolume(this.musicVolume);
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all sound effects
        Object.values(this.sounds).forEach(sound => {
            sound.setVolume(this.sfxVolume);
        });
    }
}