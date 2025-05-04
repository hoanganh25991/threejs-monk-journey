import * as THREE from 'three';

export class AudioManager {
    constructor(game) {
        this.game = game;
        this.audioEnabled = true;
        this.isMuted = false;
        this.musicVolume = 0.3; // Lowered from 0.5 to 0.3 to match main_theme.mp3 volume
        this.sfxVolume = 0.8;
        
        // Audio listeners and sources
        this.listener = null;
        this.musicSource = null;
        this.currentMusic = null;
        
        // Sound collections
        this.sounds = {};
        this.music = {};
        
        // Audio file availability tracking
        this.audioFilesAvailable = false;
        
        console.log('Audio system initialized');
    }
    
    init() {
        try {
            // Create audio listener
            this.listener = new THREE.AudioListener();
            this.game.camera.add(this.listener);
            
            // Check if audio files exist
            this.checkAudioFilesExist().then(available => {
                this.audioFilesAvailable = available;
                
                if (available) {
                    console.log('Audio files found, initializing audio system');
                    // Create sound collections
                    this.createSoundEffects();
                    this.createMusic();
                } else {
                    console.warn('Audio files not found, using simulated audio');
                    // Create simulated sound collections
                    this.createSimulatedSoundEffects();
                    this.createSimulatedMusic();
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing audio system:', error);
            this.audioEnabled = false;
            return false;
        }
    }
    
    async checkAudioFilesExist() {
        try {
            // Check if main theme exists as a simple test
            const response = await fetch('assets/audio/main_theme.mp3', { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('Error checking audio files:', error);
            return false;
        }
    }
    
    createSoundEffects() {
        // Player sounds
        this.sounds.playerAttack = this.createSound('playerAttack', 'attack.mp3', 0.7);
        this.sounds.playerHit = this.createSound('playerHit', 'player_hit.mp3', 0.8);
        this.sounds.playerDeath = this.createSound('playerDeath', 'player_death.mp3', 1.0);
        this.sounds.levelUp = this.createSound('levelUp', 'level_up.mp3', 1.0);
        
        // Skill sounds
        this.sounds.skillWaveStrike = this.createSound('skillWaveStrike', 'wave_strike.mp3', 0.8);
        this.sounds.skillCycloneStrike = this.createSound('skillCycloneStrike', 'cyclone_strike.mp3', 0.8);
        this.sounds.skillSevenSidedStrike = this.createSound('skillSevenSidedStrike', 'seven_sided_strike.mp3', 0.8);
        this.sounds.skillInnerSanctuary = this.createSound('skillInnerSanctuary', 'inner_sanctuary.mp3', 0.6);
        
        // Enemy sounds
        this.sounds.enemyAttack = this.createSound('enemyAttack', 'enemy_attack.mp3', 0.6);
        this.sounds.enemyHit = this.createSound('enemyHit', 'enemy_hit.mp3', 0.7);
        this.sounds.enemyDeath = this.createSound('enemyDeath', 'enemy_death.mp3', 0.8);
        this.sounds.bossDeath = this.createSound('bossDeath', 'boss_death.mp3', 1.0);
        
        // UI sounds
        this.sounds.buttonClick = this.createSound('buttonClick', 'button_click.mp3', 0.5);
        this.sounds.inventoryOpen = this.createSound('inventoryOpen', 'inventory_open.mp3', 0.5);
        this.sounds.itemPickup = this.createSound('itemPickup', 'item_pickup.mp3', 0.6);
        
        // Environment sounds
        this.sounds.chestOpen = this.createSound('chestOpen', 'chest_open.mp3', 0.7);
        this.sounds.doorOpen = this.createSound('doorOpen', 'door_open.mp3', 0.7);
    }
    
    createMusic() {
        // Background music
        this.music.mainTheme = this.createSound('mainTheme', 'main_theme.mp3', this.musicVolume, true);
        this.music.battleTheme = this.createSound('battleTheme', 'battle_theme.mp3', this.musicVolume, true);
        this.music.bossTheme = this.createSound('bossTheme', 'boss_theme.mp3', this.musicVolume, true);
    }
    
    createSimulatedSoundEffects() {
        // Player sounds
        this.sounds.playerAttack = this.createSimulatedSound('playerAttack', 220, 0.7, 0.3);
        this.sounds.playerHit = this.createSimulatedSound('playerHit', 330, 0.8, 0.2);
        this.sounds.playerDeath = this.createSimulatedSound('playerDeath', 110, 1.0, 0.5);
        this.sounds.levelUp = this.createSimulatedSound('levelUp', 440, 1.0, 0.4);
        
        // Skill sounds
        this.sounds.skillWaveStrike = this.createSimulatedSound('skillWaveStrike', 280, 0.8, 0.3);
        this.sounds.skillCycloneStrike = this.createSimulatedSound('skillCycloneStrike', 320, 0.8, 0.4);
        this.sounds.skillSevenSidedStrike = this.createSimulatedSound('skillSevenSidedStrike', 380, 0.8, 0.5);
        this.sounds.skillInnerSanctuary = this.createSimulatedSound('skillInnerSanctuary', 180, 0.6, 0.6);
        
        // Enemy sounds
        this.sounds.enemyAttack = this.createSimulatedSound('enemyAttack', 200, 0.6, 0.2);
        this.sounds.enemyHit = this.createSimulatedSound('enemyHit', 250, 0.7, 0.1);
        this.sounds.enemyDeath = this.createSimulatedSound('enemyDeath', 150, 0.8, 0.4);
        this.sounds.bossDeath = this.createSimulatedSound('bossDeath', 100, 1.0, 0.7);
        
        // UI sounds
        this.sounds.buttonClick = this.createSimulatedSound('buttonClick', 500, 0.5, 0.1);
        this.sounds.inventoryOpen = this.createSimulatedSound('inventoryOpen', 350, 0.5, 0.2);
        this.sounds.itemPickup = this.createSimulatedSound('itemPickup', 400, 0.6, 0.2);
        
        // Environment sounds
        this.sounds.chestOpen = this.createSimulatedSound('chestOpen', 300, 0.7, 0.3);
        this.sounds.doorOpen = this.createSimulatedSound('doorOpen', 200, 0.7, 0.4);
    }
    
    createSimulatedMusic() {
        // Background music
        this.music.mainTheme = this.createSimulatedSound('mainTheme', 220, this.musicVolume, 1.0, true);
        this.music.battleTheme = this.createSimulatedSound('battleTheme', 280, this.musicVolume, 1.0, true);
        this.music.bossTheme = this.createSimulatedSound('bossTheme', 180, this.musicVolume, 1.0, true);
    }
    
    createSound(name, filename, volume = 1.0, loop = false) {
        try {
            // Create audio object
            const sound = new THREE.Audio(this.listener);
            
            // Set properties
            sound.name = name;
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            // Load audio file
            const audioLoader = new THREE.AudioLoader();
            
            // Load the actual file
            audioLoader.load(`assets/audio/${filename}`, buffer => {
                sound.setBuffer(buffer);
                console.log(`Loaded audio: ${name}`);
            }, 
            // Progress callback
            (xhr) => {
                console.log(`${name} loading: ${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            // Error callback
            (error) => {
                console.error(`Error loading audio ${name}:`, error);
                // Fall back to simulated sound
                this.simulateAudioBuffer(sound);
            });
            
            return sound;
        } catch (error) {
            console.error(`Error creating sound ${name}:`, error);
            return null;
        }
    }
    
    createSimulatedSound(name, frequency = 220, volume = 1.0, duration = 0.5, loop = false) {
        try {
            // Create audio object
            const sound = new THREE.Audio(this.listener);
            
            // Set properties
            sound.name = name;
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            // Create a simulated buffer
            this.simulateAudioBuffer(sound, frequency, duration);
            
            return sound;
        } catch (error) {
            console.error(`Error creating simulated sound ${name}:`, error);
            return null;
        }
    }
    
    simulateAudioBuffer(sound, frequency = 220, duration = 0.5) {
        // Create a simple oscillator-based sound as a placeholder
        const context = this.listener.context;
        const sampleRate = context.sampleRate;
        const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
        
        // Fill the buffer with a simple sine wave
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            // Create a decaying sine wave
            const t = i / sampleRate;
            const decay = 1 - t / duration;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.5 * decay;
        }
        
        sound.setBuffer(buffer);
    }
    
    playSound(name) {
        if (!this.audioEnabled || this.isMuted) return;
        
        const sound = this.sounds[name];
        if (sound) {
            try {
                // If the sound is already playing, stop it first
                if (sound.isPlaying) {
                    sound.stop();
                }
                
                // Play the sound
                sound.play();
                return true;
            } catch (error) {
                console.warn(`Could not play sound ${name}:`, error);
                return false;
            }
        }
        return false;
    }
    
    playMusic(name = 'mainTheme') {
        if (!this.audioEnabled || this.isMuted) return false;
        
        // Stop current music if playing
        this.stopMusic();
        
        // Play new music
        const music = this.music[name];
        if (music) {
            try {
                music.play();
                this.currentMusic = name;
                return true;
            } catch (error) {
                console.warn(`Could not play music ${name}:`, error);
                return false;
            }
        }
        return false;
    }
    
    stopMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            try {
                this.music[this.currentMusic].stop();
                return true;
            } catch (error) {
                console.warn(`Could not stop music ${this.currentMusic}:`, error);
                return false;
            }
        }
        this.currentMusic = null;
        return true;
    }
    
    pauseMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            try {
                this.music[this.currentMusic].pause();
                return true;
            } catch (error) {
                console.warn(`Could not pause music ${this.currentMusic}:`, error);
                return false;
            }
        }
        return false;
    }
    
    resumeMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            try {
                this.music[this.currentMusic].play();
                return true;
            } catch (error) {
                console.warn(`Could not resume music ${this.currentMusic}:`, error);
                return false;
            }
        }
        return false;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Stop all sounds
            this.stopMusic();
            
            // Stop all sound effects
            Object.values(this.sounds).forEach(sound => {
                if (sound && sound.isPlaying) {
                    try {
                        sound.stop();
                    } catch (error) {
                        console.warn(`Could not stop sound:`, error);
                    }
                }
            });
        } else {
            // Resume music if it was playing
            if (this.currentMusic) {
                this.playMusic(this.currentMusic);
            }
        }
        
        return this.isMuted;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Update all music volumes
        Object.values(this.music).forEach(music => {
            if (music) {
                music.setVolume(this.musicVolume);
            }
        });
        
        return this.musicVolume;
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update all sound effect volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.setVolume(this.sfxVolume);
            }
        });
        
        return this.sfxVolume;
    }
    
    getMusicVolume() {
        return this.musicVolume;
    }
    
    getSFXVolume() {
        return this.sfxVolume;
    }
    
    isMusicPlaying() {
        return this.currentMusic !== null && this.music[this.currentMusic]?.isPlaying;
    }
    
    getCurrentMusic() {
        return this.currentMusic;
    }
    
    isAudioEnabled() {
        return this.audioEnabled;
    }
    
    areAudioFilesAvailable() {
        return this.audioFilesAvailable;
    }
    
    // Save audio settings to localStorage
    saveSettings() {
        try {
            const settings = {
                isMuted: this.isMuted,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume
            };
            
            localStorage.setItem('audioSettings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving audio settings:', error);
            return false;
        }
    }
    
    // Load audio settings from localStorage
    loadSettings() {
        try {
            const settingsJson = localStorage.getItem('audioSettings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                
                // Apply settings
                this.isMuted = settings.isMuted || false;
                this.setMusicVolume(settings.musicVolume || 0.5);
                this.setSFXVolume(settings.sfxVolume || 0.8);
                
                return true;
            }
        } catch (error) {
            console.error('Error loading audio settings:', error);
        }
        return false;
    }
}