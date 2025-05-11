import * as THREE from 'three';

export class AudioManager {
    constructor(game) {
        this.game = game;
        this.audioEnabled = true;
        this.isMuted = false;
        this.musicVolume = 0.1; // Lowered from 0.5 to 0.3 to match main_theme.mp3 volume
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
        
        console.debug('Audio system initialized');
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
                    console.debug('Audio files found, initializing audio system');
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
        
        // Skill cast sounds
        this.sounds.skillWaveStrike = this.createSound('skillWaveStrike', 'wave_strike.mp3', 0.8);
        this.sounds.skillCycloneStrike = this.createSound('skillCycloneStrike', 'cyclone_strike.mp3', 0.8);
        this.sounds.skillSevenSidedStrike = this.createSound('skillSevenSidedStrike', 'seven_sided_strike.mp3', 0.8);
        this.sounds.skillInnerSanctuary = this.createSound('skillInnerSanctuary', 'inner_sanctuary.mp3', 0.6);
        this.sounds.skillFistOfThunder = this.createSound('skillFistOfThunder', 'fist_of_thunder.mp3', 0.8);
        this.sounds.skillMysticAlly = this.createSound('skillMysticAlly', 'mystic_ally.mp3', 0.7);
        this.sounds.skillWaveOfLight = this.createSound('skillWaveOfLight', 'wave_of_light.mp3', 0.9);
        this.sounds.skillExplodingPalm = this.createSound('skillExplodingPalm', 'exploding_palm.mp3', 0.8);
        
        // Skill impact sounds
        this.sounds.waterImpact = this.createSound('waterImpact', 'water_impact.mp3', 0.7);
        this.sounds.windPull = this.createSound('windPull', 'wind_pull.mp3', 0.7);
        this.sounds.rapidStrike = this.createSound('rapidStrike', 'rapid_strike.mp3', 0.8);
        this.sounds.barrierForm = this.createSound('barrierForm', 'barrier_form.mp3', 0.6);
        this.sounds.allySummonComplete = this.createSound('allySummonComplete', 'ally_summon.mp3', 0.7);
        this.sounds.bellRing = this.createSound('bellRing', 'bell_ring.mp3', 0.9);
        this.sounds.markApplied = this.createSound('markApplied', 'mark_applied.mp3', 0.7);
        this.sounds.thunderStrike = this.createSound('thunderStrike', 'thunder_strike.mp3', 0.8);
        
        // Skill end sounds
        this.sounds.waterDissipate = this.createSound('waterDissipate', 'water_dissipate.mp3', 0.6);
        this.sounds.windDissipate = this.createSound('windDissipate', 'wind_dissipate.mp3', 0.6);
        this.sounds.strikeComplete = this.createSound('strikeComplete', 'strike_complete.mp3', 0.7);
        this.sounds.barrierDissipate = this.createSound('barrierDissipate', 'barrier_dissipate.mp3', 0.5);
        this.sounds.allyDismiss = this.createSound('allyDismiss', 'ally_dismiss.mp3', 0.6);
        this.sounds.bellFade = this.createSound('bellFade', 'bell_fade.mp3', 0.7);
        this.sounds.massiveExplosion = this.createSound('massiveExplosion', 'massive_explosion.mp3', 0.9);
        this.sounds.thunderEcho = this.createSound('thunderEcho', 'thunder_echo.mp3', 0.6);
        
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
        this.sounds.playerAttack = this.createSimulatedSound('playerAttack', 220, 0.7, 0.3, false, { type: 'sawtooth', decay: true });
        this.sounds.playerHit = this.createSimulatedSound('playerHit', 330, 0.8, 0.2, false, { type: 'sine', decay: true });
        this.sounds.playerDeath = this.createSimulatedSound('playerDeath', 110, 1.0, 0.5, false, { type: 'sine', decay: true, slide: -20 });
        this.sounds.levelUp = this.createSimulatedSound('levelUp', [440, 550, 660], 1.0, 0.4, false, { type: 'sine', decay: false });
        
        // Skill cast sounds
        this.sounds.skillWaveStrike = this.createSimulatedSound('skillWaveStrike', 
            [280, 310, 260], 0.8, 0.3, false, 
            { type: 'sine', decay: true, slide: 50, noise: 0.05, filter: 'lowpass' }
        ); // Water-based - complex water frequencies
        
        this.sounds.skillCycloneStrike = this.createSimulatedSound('skillCycloneStrike', 
            [350, 370, 330], 0.8, 0.4, false, 
            { type: 'sawtooth', decay: true, vibrato: 15, tremolo: 8, noise: 0.1, filter: 'bandpass' }
        ); // Wind-based - complex wind frequencies
        
        this.sounds.skillSevenSidedStrike = this.createSimulatedSound('skillSevenSidedStrike', 
            [380, 400, 420, 440, 460, 480, 500], 0.8, 0.5, false, 
            { type: 'square', decay: true, attack: 0.01, filter: 'highpass' }
        ); // Physical attack - seven distinct tones
        
        this.sounds.skillInnerSanctuary = this.createSimulatedSound('skillInnerSanctuary', 
            [180, 270, 360], 0.6, 0.6, false, 
            { type: 'sine', decay: false, reverb: true }
        ); // Protective - harmonic chord with reverb
        
        this.sounds.skillFistOfThunder = this.createSimulatedSound('skillFistOfThunder', 
            [520, 780], 0.8, 0.3, false, 
            { type: 'sine', decay: true, slide: 80, vibrato: 20, noise: 0.2, distortion: 0.3, filter: 'highpass' }
        ); // Thunder - complex thunder crack
        
        this.sounds.skillMysticAlly = this.createSimulatedSound('skillMysticAlly', 
            [260, 390, 520], 0.7, 0.5, false, 
            { type: 'sine', decay: false }
        ); // Spiritual - mystical chord progression
        
        this.sounds.skillWaveOfLight = this.createSimulatedSound('skillWaveOfLight', 
            [420, 630, 840], 0.9, 0.6, false, 
            { type: 'triangle', decay: true, slide: -30, reverb: true, filter: 'highpass' }
        ); // Light-based - harmonic light frequencies
        
        this.sounds.skillExplodingPalm = this.createSimulatedSound('skillExplodingPalm', 
            [340, 170, 510], 0.8, 0.4, false, 
            { type: 'sawtooth', decay: true, slide: 40, attack: 0.01, noise: 0.15, distortion: 0.4 }
        ); // Explosive - complex explosion frequencies
        
        // Skill impact sounds
        this.sounds.waterImpact = this.createSimulatedSound('waterImpact', 
            [350, 175, 525], 0.7, 0.2, false, 
            { type: 'sine', decay: true, slide: -20, noise: 0.2, filter: 'lowpass' }
        ); // Water - realistic splash
        
        this.sounds.windPull = this.createSimulatedSound('windPull', 
            [330, 165, 495], 0.7, 0.3, false, 
            { type: 'sawtooth', decay: true, vibrato: 20, tremolo: 10, noise: 0.15, filter: 'bandpass' }
        ); // Wind - complex wind pull
        
        this.sounds.rapidStrike = this.createSimulatedSound('rapidStrike', 
            [420, 440, 460, 480, 500, 520, 540], 0.8, 0.2, false, 
            { type: 'square', decay: true, attack: 0.005, filter: 'highpass' }
        ); // Physical - rapid succession of impacts
        
        this.sounds.barrierForm = this.createSimulatedSound('barrierForm', 
            [200, 300, 400], 0.6, 0.4, false, 
            { type: 'sine', decay: false, reverb: true }
        ); // Protective - barrier formation chord
        
        this.sounds.allySummonComplete = this.createSimulatedSound('allySummonComplete', 
            [280, 420, 560], 0.7, 0.3, false, 
            { type: 'sine', decay: false, reverb: true }
        ); // Spiritual - complex summoning
        
        this.sounds.bellRing = this.createSimulatedSound('bellRing', 
            [600, 900, 1200, 1500], 0.9, 0.7, false, 
            { type: 'sine', decay: true, reverb: true }
        ); // Bell - complex bell harmonics
        
        this.sounds.markApplied = this.createSimulatedSound('markApplied', 
            [320, 480], 0.7, 0.3, false, 
            { type: 'sawtooth', decay: true, slide: 30, filter: 'bandpass', distortion: 0.2 }
        ); // Mark - complex mark application
        
        this.sounds.thunderStrike = this.createSimulatedSound('thunderStrike', 
            [550, 825, 275], 0.8, 0.2, false, 
            { type: 'sawtooth', decay: true, slide: -40, noise: 0.25, distortion: 0.4, filter: 'highpass' }
        ); // Thunder - complex lightning strike
        
        // Skill end sounds
        this.sounds.waterDissipate = this.createSimulatedSound('waterDissipate', 
            [240, 120, 360], 0.6, 0.4, false, 
            { type: 'sine', decay: true, slide: -30, noise: 0.1, filter: 'lowpass' }
        ); // Water - realistic dissipation
        
        this.sounds.windDissipate = this.createSimulatedSound('windDissipate', 
            [300, 150, 450], 0.6, 0.4, false, 
            { type: 'sine', decay: true, slide: -40, vibrato: 10, tremolo: 5, noise: 0.08, filter: 'bandpass' }
        ); // Wind - complex wind fade
        
        this.sounds.strikeComplete = this.createSimulatedSound('strikeComplete', 
            [400, 600], 0.7, 0.3, false, 
            { type: 'square', decay: true, slide: -20, attack: 0.01, filter: 'highpass' }
        ); // Physical - final strike impact
        
        this.sounds.barrierDissipate = this.createSimulatedSound('barrierDissipate', 
            [160, 240, 320], 0.5, 0.5, false, 
            { type: 'sine', decay: true, slide: -30, reverb: true }
        ); // Protective - barrier fading chord
        
        this.sounds.allyDismiss = this.createSimulatedSound('allyDismiss', 
            [220, 330, 440], 0.6, 0.4, false, 
            { type: 'sine', decay: true, reverb: true }
        ); // Spiritual - complex dismissal
        
        this.sounds.bellFade = this.createSimulatedSound('bellFade', 
            [500, 750, 1000, 1250], 0.7, 0.5, false, 
            { type: 'sine', decay: true, slide: -50, reverb: true }
        ); // Bell - complex bell fade harmonics
        
        this.sounds.massiveExplosion = this.createSimulatedSound('massiveExplosion', 
            [220, 110, 330, 440], 0.9, 0.6, false, 
            { type: 'sawtooth', decay: true, slide: -30, noise: 0.3, distortion: 0.5, filter: 'lowpass', attack: 0.01 }
        ); // Explosion - complex explosion with rumble
        
        this.sounds.thunderEcho = this.createSimulatedSound('thunderEcho', 
            [450, 225, 675], 0.6, 0.4, false, 
            { type: 'sine', decay: true, reverb: true, noise: 0.15, filter: 'bandpass' }
        ); // Thunder - complex thunder echo
        
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
                console.debug(`Loaded audio: ${name}`);
            }, 
            // Progress callback
            (xhr) => {
                console.debug(`${name} loading: ${(xhr.loaded / xhr.total * 100)}% loaded`);
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
    
    createSimulatedSound(name, frequency = 220, volume = 1.0, duration = 0.5, loop = false, options = {}) {
        try {
            // Create audio object
            const sound = new THREE.Audio(this.listener);
            
            // Set properties
            sound.name = name;
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            // Handle frequency as array or single value
            let freqValue = frequency;
            if (Array.isArray(frequency)) {
                // If it's an array, we'll create a complex sound with multiple frequencies
                this.simulateComplexAudioBuffer(sound, frequency, duration, options);
            } else {
                // Create a simulated buffer with a single frequency
                this.simulateAudioBuffer(sound, freqValue, duration, options);
            }
            
            return sound;
        } catch (error) {
            console.error(`Error creating simulated sound ${name}:`, error);
            return null;
        }
    }
    
    simulateAudioBuffer(sound, frequency = 220, duration = 0.5, options = {}) {
        // Create a simple oscillator-based sound as a placeholder
        const context = this.listener.context;
        const sampleRate = context.sampleRate;
        const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
        
        // Extract options
        const waveType = options.type || 'sine';
        const slide = options.slide || 0;
        const vibrato = options.vibrato || 0;
        const tremolo = options.tremolo || 0;
        const noise = options.noise || 0;
        const attack = options.attack || 0.01;
        const decay = options.decay !== undefined ? options.decay : true;
        
        // Fill the buffer with the appropriate waveform
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            // Time in seconds
            const t = i / sampleRate;
            
            // Calculate amplitude envelope
            let amplitude = 0.5;
            if (decay) {
                // Attack-decay envelope
                const attackTime = Math.min(attack, duration * 0.5);
                const attackPhase = Math.min(t / attackTime, 1);
                const decayPhase = 1 - ((t - attackTime) / (duration - attackTime));
                amplitude = t < attackTime ? attackPhase * 0.5 : decayPhase * 0.5;
            }
            
            // Apply frequency slide if needed
            const slideAmount = slide * (t / duration);
            const currentFreq = frequency + slideAmount;
            
            // Apply vibrato if needed
            const vibratoFreq = 5; // 5 Hz vibrato
            const vibratoAmount = vibrato * Math.sin(2 * Math.PI * vibratoFreq * t) * 10;
            
            // Apply tremolo if needed
            const tremoloFreq = 8; // 8 Hz tremolo
            const tremoloAmount = 1 - (tremolo * 0.5 * (1 + Math.sin(2 * Math.PI * tremoloFreq * t)));
            
            // Generate the waveform
            let sample = 0;
            const phase = 2 * Math.PI * (currentFreq + vibratoAmount) * t;
            
            switch (waveType) {
                case 'sine':
                    sample = Math.sin(phase);
                    break;
                case 'square':
                    sample = Math.sign(Math.sin(phase));
                    break;
                case 'sawtooth':
                    sample = 2 * ((t * (currentFreq + vibratoAmount)) % 1) - 1;
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * ((t * (currentFreq + vibratoAmount)) % 1) - 1) - 1;
                    break;
                default:
                    sample = Math.sin(phase);
            }
            
            // Add noise if needed
            if (noise > 0) {
                sample = sample * (1 - noise) + (Math.random() * 2 - 1) * noise;
            }
            
            // Apply amplitude and tremolo
            data[i] = sample * amplitude * tremoloAmount;
        }
        
        sound.setBuffer(buffer);
    }
    
    simulateComplexAudioBuffer(sound, frequencies = [220], duration = 0.5, options = {}) {
        // Create a complex sound with multiple frequencies
        const context = this.listener.context;
        const sampleRate = context.sampleRate;
        const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Clear the buffer
        for (let i = 0; i < buffer.length; i++) {
            data[i] = 0;
        }
        
        // Generate each frequency component and mix them
        frequencies.forEach((freq, index) => {
            // Create a temporary buffer for this frequency
            const tempBuffer = new Float32Array(buffer.length);
            
            // Extract options
            const waveType = options.type || 'sine';
            const slide = options.slide || 0;
            const vibrato = options.vibrato || 0;
            const tremolo = options.tremolo || 0;
            const noise = options.noise || 0;
            const attack = options.attack || 0.01;
            const decay = options.decay !== undefined ? options.decay : true;
            
            // Adjust amplitude for multiple frequencies to prevent clipping
            const baseAmplitude = 0.5 / Math.sqrt(frequencies.length);
            
            // Generate the waveform for this frequency
            for (let i = 0; i < buffer.length; i++) {
                // Time in seconds
                const t = i / sampleRate;
                
                // Calculate amplitude envelope
                let amplitude = baseAmplitude;
                if (decay) {
                    // Attack-decay envelope
                    const attackTime = Math.min(attack, duration * 0.5);
                    const attackPhase = Math.min(t / attackTime, 1);
                    const decayPhase = 1 - ((t - attackTime) / (duration - attackTime));
                    amplitude = t < attackTime ? attackPhase * baseAmplitude : decayPhase * baseAmplitude;
                }
                
                // Apply frequency slide if needed - alternate direction for harmonics
                const slideDirection = index % 2 === 0 ? 1 : -0.5;
                const slideAmount = slide * (t / duration) * slideDirection;
                const currentFreq = freq + slideAmount;
                
                // Apply vibrato if needed
                const vibratoFreq = 5 + index; // Slightly different vibrato for each harmonic
                const vibratoAmount = vibrato * Math.sin(2 * Math.PI * vibratoFreq * t) * 10;
                
                // Apply tremolo if needed
                const tremoloFreq = 8 - index * 0.5; // Slightly different tremolo for each harmonic
                const tremoloAmount = 1 - (tremolo * 0.5 * (1 + Math.sin(2 * Math.PI * tremoloFreq * t)));
                
                // Generate the waveform
                let sample = 0;
                const phase = 2 * Math.PI * (currentFreq + vibratoAmount) * t;
                
                switch (waveType) {
                    case 'sine':
                        sample = Math.sin(phase);
                        break;
                    case 'square':
                        sample = Math.sign(Math.sin(phase));
                        break;
                    case 'sawtooth':
                        sample = 2 * ((t * (currentFreq + vibratoAmount)) % 1) - 1;
                        break;
                    case 'triangle':
                        sample = 2 * Math.abs(2 * ((t * (currentFreq + vibratoAmount)) % 1) - 1) - 1;
                        break;
                    default:
                        sample = Math.sin(phase);
                }
                
                // Add noise if needed - less noise for higher harmonics
                if (noise > 0) {
                    const noiseAmount = noise / (index + 1);
                    sample = sample * (1 - noiseAmount) + (Math.random() * 2 - 1) * noiseAmount;
                }
                
                // Apply amplitude and tremolo
                tempBuffer[i] = sample * amplitude * tremoloAmount;
            }
            
            // Mix this frequency component into the main buffer
            for (let i = 0; i < buffer.length; i++) {
                data[i] += tempBuffer[i];
            }
        });
        
        // Apply some basic limiting to prevent clipping
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.max(-0.99, Math.min(0.99, data[i]));
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
    
    /**
     * Pause all audio (both music and sound effects)
     * @returns {boolean} True if successful
     */
    pause() {
        let musicPaused = false;
        let soundEffectsPaused = false;
        
        // Pause current music if playing
        if (this.currentMusic && this.music[this.currentMusic]) {
            try {
                this.music[this.currentMusic].pause();
                musicPaused = true;
                console.debug(`Music ${this.currentMusic} paused`);
            } catch (error) {
                console.warn(`Could not pause music ${this.currentMusic}:`, error);
            }
        }
        
        // Pause all sound effects
        if (this.audioEnabled) {
            try {
                // Iterate through all sound effects and pause them if they're playing
                for (const soundName in this.sounds) {
                    const sound = this.sounds[soundName];
                    if (sound && sound.isPlaying) {
                        sound.pause();
                    }
                }
                soundEffectsPaused = true;
                console.debug('All sound effects paused');
            } catch (error) {
                console.warn('Could not pause all sound effects:', error);
            }
        }
        
        return musicPaused || soundEffectsPaused;
    }
    
    /**
     * Resume all audio (both music and sound effects)
     * @returns {boolean} True if successful
     */
    resume() {
        let musicResumed = false;
        let soundEffectsResumed = false;
        
        // Resume current music if paused
        if (this.currentMusic && this.music[this.currentMusic]) {
            try {
                this.music[this.currentMusic].play();
                musicResumed = true;
                console.debug(`Music ${this.currentMusic} resumed`);
            } catch (error) {
                console.warn(`Could not resume music ${this.currentMusic}:`, error);
            }
        }
        
        // Resume all sound effects
        if (this.audioEnabled && !this.isMuted) {
            try {
                // Iterate through all sound effects and resume them if they were playing
                for (const soundName in this.sounds) {
                    const sound = this.sounds[soundName];
                    // Only resume sounds that were playing and are now paused
                    if (sound && sound.isPaused) {
                        sound.play();
                    }
                }
                soundEffectsResumed = true;
                console.debug('All sound effects resumed');
            } catch (error) {
                console.warn('Could not resume all sound effects:', error);
            }
        }
        
        return musicResumed || soundEffectsResumed;
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
    
    // Check if auto-pause is enabled - now always returns false as this is handled by Game.js
    isAutoPauseEnabled() {
        // Auto-pause is now handled by Game.js
        return false;
    }
    
    // Save audio settings to localStorage
    saveSettings() {
        try {
            const settings = {
                isMuted: this.isMuted,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume
                // autoPauseEnabled removed - now handled by Game.js
            };
            
            localStorage.setItem('monk_journey_audio_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving audio settings:', error);
            return false;
        }
    }
    
    // Load audio settings from localStorage
    loadSettings() {
        try {
            const settingsJson = localStorage.getItem('monk_journey_audio_settings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                
                // Apply settings
                this.isMuted = settings.isMuted || false;
                this.setMusicVolume(settings.musicVolume || 0.5);
                this.setSFXVolume(settings.sfxVolume || 0.8);
                
                // Auto-pause setting is now ignored as it's handled by Game.js
                
                return true;
            }
        } catch (error) {
            console.error('Error loading audio settings:', error);
        }
        return false;
    }
}