import * as THREE from 'three';

export class AudioManager {
    constructor(game) {
        this.game = game;
        this.audioEnabled = true;
        this.isMuted = false;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        // Audio listeners and sources
        this.listener = null;
        this.musicSource = null;
        this.currentMusic = null;
        
        // Sound collections
        this.sounds = {};
        this.music = {};
        
        console.log('Audio system initialized');
    }
    
    init() {
        try {
            // Create audio listener
            this.listener = new THREE.AudioListener();
            this.game.camera.add(this.listener);
            
            // Create sound collections
            this.createSoundEffects();
            this.createMusic();
            
            return true;
        } catch (error) {
            console.error('Error initializing audio system:', error);
            this.audioEnabled = false;
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
            
            // Use a placeholder function for loading since we don't have actual files
            // In a real implementation, this would load the file
            // audioLoader.load(`assets/audio/${filename}`, buffer => {
            //     sound.setBuffer(buffer);
            // });
            
            // For now, we'll simulate the sound with a buffer
            this.simulateAudioBuffer(sound);
            
            return sound;
        } catch (error) {
            console.error(`Error creating sound ${name}:`, error);
            return null;
        }
    }
    
    simulateAudioBuffer(sound) {
        // Create a simple oscillator-based sound as a placeholder
        // This is just for demonstration and won't actually play
        const context = this.listener.context;
        const sampleRate = context.sampleRate;
        const buffer = context.createBuffer(1, sampleRate * 1, sampleRate);
        
        // Fill the buffer with a simple sine wave
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.sin(i * 0.01) * 0.5;
        }
        
        sound.setBuffer(buffer);
    }
    
    playSound(name) {
        if (!this.audioEnabled || this.isMuted) return;
        
        const sound = this.sounds[name];
        if (sound && !sound.isPlaying) {
            try {
                sound.play();
            } catch (error) {
                console.warn(`Could not play sound ${name}:`, error);
            }
        }
    }
    
    playMusic(name = 'mainTheme') {
        if (!this.audioEnabled || this.isMuted) return;
        
        // Stop current music if playing
        this.stopMusic();
        
        // Play new music
        const music = this.music[name];
        if (music) {
            try {
                music.play();
                this.currentMusic = name;
            } catch (error) {
                console.warn(`Could not play music ${name}:`, error);
            }
        }
    }
    
    stopMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].stop();
        }
        this.currentMusic = null;
    }
    
    pauseMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].pause();
        }
    }
    
    resumeMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].play();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Stop all sounds
            this.stopMusic();
            
            // Stop all sound effects
            Object.values(this.sounds).forEach(sound => {
                if (sound && sound.isPlaying) {
                    sound.stop();
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
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update all sound effect volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.setVolume(this.sfxVolume);
            }
        });
    }
}