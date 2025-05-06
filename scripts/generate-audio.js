// Audio Generator Script for Monk Journey
// This script generates audio files for the game using the Web Audio API

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create audio directory if it doesn't exist
const audioDir = path.join('assets', 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`Created directory: ${audioDir}`);
}

// Sound definitions
const sounds = {
    // Player sounds
    'attack.mp3': { frequency: 220, duration: 0.3, type: 'sawtooth', volume: 0.7, decay: true },
    'player_hit.mp3': { frequency: 330, duration: 0.2, type: 'sine', volume: 0.8, decay: true },
    'player_death.mp3': { frequency: 110, duration: 0.5, type: 'sine', volume: 1.0, decay: true, slide: -20 },
    'level_up.mp3': { frequency: 440, duration: 0.4, type: 'sine', volume: 1.0, decay: false, arpeggio: [1, 1.25, 1.5] },
    
    // Skill cast sounds
    'wave_strike.mp3': { frequency: 280, duration: 0.3, type: 'sine', volume: 0.8, decay: true, slide: 50 }, // Water-based - medium frequency
    'cyclone_strike.mp3': { frequency: 350, duration: 0.4, type: 'sawtooth', volume: 0.8, decay: true, vibrato: 10 }, // Wind-based - increased frequency
    'seven_sided_strike.mp3': { frequency: 380, duration: 0.5, type: 'square', volume: 0.8, decay: true, arpeggio: [1, 1.5, 2, 1.5, 1, 1.5, 2] }, // Physical attack - kept as is
    'inner_sanctuary.mp3': { frequency: 180, duration: 0.6, type: 'sine', volume: 0.6, decay: false, reverb: true }, // Protective - low frequency
    'fist_of_thunder.mp3': { frequency: 520, duration: 0.3, type: 'sine', volume: 0.8, decay: true, slide: 80, vibrato: 15 }, // Thunder - increased frequency
    'mystic_ally.mp3': { frequency: 260, duration: 0.5, type: 'sine', volume: 0.7, decay: false, arpeggio: [1, 1.3, 1.6, 1.3] }, // Spiritual - kept as is
    'wave_of_light.mp3': { frequency: 420, duration: 0.6, type: 'triangle', volume: 0.9, decay: true, slide: -30, reverb: true }, // Light-based - increased frequency
    'exploding_palm.mp3': { frequency: 340, duration: 0.4, type: 'sawtooth', volume: 0.8, decay: true, arpeggio: [1, 1.2], slide: 40 }, // Explosive - increased frequency
    
    // Skill impact sounds
    'water_impact.mp3': { frequency: 350, duration: 0.2, type: 'sine', volume: 0.7, decay: true, slide: -20 }, // Water - kept as is
    'wind_pull.mp3': { frequency: 330, duration: 0.3, type: 'sawtooth', volume: 0.7, decay: true, vibrato: 15 }, // Wind - increased frequency
    'rapid_strike.mp3': { frequency: 420, duration: 0.2, type: 'square', volume: 0.8, decay: true, arpeggio: [1, 1.2, 1.4, 1.6, 1.8, 2.0, 1.8] }, // Physical - kept as is
    'barrier_form.mp3': { frequency: 200, duration: 0.4, type: 'sine', volume: 0.6, decay: false, reverb: true }, // Protective - kept as is
    'ally_summon.mp3': { frequency: 280, duration: 0.3, type: 'sine', volume: 0.7, decay: false, arpeggio: [1, 1.5, 2] }, // Spiritual - kept as is
    'bell_ring.mp3': { frequency: 600, duration: 0.7, type: 'sine', volume: 0.9, decay: true, reverb: true }, // Bell - kept as is
    'mark_applied.mp3': { frequency: 320, duration: 0.3, type: 'sawtooth', volume: 0.7, decay: true, slide: 30 }, // Mark - kept as is
    'thunder_strike.mp3': { frequency: 550, duration: 0.2, type: 'sawtooth', volume: 0.8, decay: true, slide: -40 }, // Thunder - increased frequency
    
    // Skill end sounds
    'water_dissipate.mp3': { frequency: 240, duration: 0.4, type: 'sine', volume: 0.6, decay: true, slide: -30 }, // Water - kept as is
    'wind_dissipate.mp3': { frequency: 300, duration: 0.4, type: 'sine', volume: 0.6, decay: true, slide: -40 }, // Wind - increased frequency
    'strike_complete.mp3': { frequency: 400, duration: 0.3, type: 'square', volume: 0.7, decay: true, slide: -20 }, // Physical - kept as is
    'barrier_dissipate.mp3': { frequency: 160, duration: 0.5, type: 'sine', volume: 0.5, decay: true, slide: -30 }, // Protective - kept as is
    'ally_dismiss.mp3': { frequency: 220, duration: 0.4, type: 'sine', volume: 0.6, decay: true, arpeggio: [2, 1.5, 1] }, // Spiritual - kept as is
    'bell_fade.mp3': { frequency: 500, duration: 0.5, type: 'sine', volume: 0.7, decay: true, slide: -50, reverb: true }, // Bell - kept as is
    'massive_explosion.mp3': { frequency: 220, duration: 0.6, type: 'sawtooth', volume: 0.9, decay: true, slide: -30 }, // Explosion - increased frequency
    'thunder_echo.mp3': { frequency: 450, duration: 0.4, type: 'sine', volume: 0.6, decay: true, reverb: true }, // Thunder - increased frequency
    
    // Enemy sounds
    'enemy_attack.mp3': { frequency: 200, duration: 0.2, type: 'sawtooth', volume: 0.6, decay: true },
    'enemy_hit.mp3': { frequency: 250, duration: 0.1, type: 'square', volume: 0.7, decay: true },
    'enemy_death.mp3': { frequency: 150, duration: 0.4, type: 'sine', volume: 0.8, decay: true, slide: -30 },
    'boss_death.mp3': { frequency: 100, duration: 0.7, type: 'sawtooth', volume: 1.0, decay: true, slide: -50, vibrato: 5 },
    
    // UI sounds
    'button_click.mp3': { frequency: 500, duration: 0.1, type: 'sine', volume: 0.5, decay: true },
    'inventory_open.mp3': { frequency: 350, duration: 0.2, type: 'sine', volume: 0.5, decay: true, arpeggio: [1, 1.5] },
    'item_pickup.mp3': { frequency: 400, duration: 0.2, type: 'sine', volume: 0.6, decay: true, arpeggio: [1, 1.2] },
    
    // Environment sounds
    'chest_open.mp3': { frequency: 300, duration: 0.3, type: 'sine', volume: 0.7, decay: true, arpeggio: [1, 1.2, 1.5] },
    'door_open.mp3': { frequency: 200, duration: 0.4, type: 'sine', volume: 0.7, decay: true, slide: -20 },
    
    // Music
    // 'main_theme.mp3': { frequency: 220, duration: 5.0, type: 'sine', volume: 0.5, decay: false, melody: true }, // Ignore this file due to existing file
    'battle_theme.mp3': { frequency: 280, duration: 5.0, type: 'square', volume: 0.5, decay: false, melody: true, tempo: 140 },
    'boss_theme.mp3': { frequency: 180, duration: 5.0, type: 'sawtooth', volume: 0.5, decay: false, melody: true, tempo: 160 }
};

// Generate audio files using SoX
function generateAudioFiles() {
    console.log('Generating audio files...');
    
    // Check if SoX is installed
    exec('which sox', (error, stdout, stderr) => {
        if (error) {
            console.error('SoX is not installed. Please install SoX to generate audio files.');
            console.error('On macOS: brew install sox');
            console.error('On Linux: apt-get install sox');
            console.error('On Windows: Download from http://sox.sourceforge.net/');
            return;
        }
        
        // Generate each sound
        Object.entries(sounds).forEach(([filename, params]) => {
            const outputPath = path.join(audioDir, filename);
            
            // Generate command based on sound type
            let command = '';
            
            if (params.type === 'sine') {
                command = `sox -n "${outputPath}" synth ${params.duration} sine ${params.frequency} vol ${params.volume}`;
            } else if (params.type === 'square') {
                command = `sox -n "${outputPath}" synth ${params.duration} square ${params.frequency} vol ${params.volume}`;
            } else if (params.type === 'sawtooth') {
                command = `sox -n "${outputPath}" synth ${params.duration} sawtooth ${params.frequency} vol ${params.volume}`;
            } else if (params.type === 'triangle') {
                command = `sox -n "${outputPath}" synth ${params.duration} triangle ${params.frequency} vol ${params.volume}`;
            }
            
            // Add effects
            if (params.decay) {
                command += ' fade 0 ' + params.duration + ' ' + params.duration;
            }
            
            if (params.slide) {
                const endFreq = params.frequency + params.slide;
                command = command.replace(`${params.frequency}`, `${params.frequency}:${endFreq}`);
            }
            
            if (params.reverb) {
                command += ' reverb';
            }
            
            // Execute command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error generating ${filename}:`, error);
                    return;
                }
                console.log(`Generated ${filename}`);
                
                // Special handling for music files to make them longer
                if (filename.includes('theme')) {
                    // For now, let's skip the extension since it's causing issues
                    console.log(`Generated ${filename} (skipping extension due to format issues)`);
                }
            });
        });
    });
}

// Generate placeholder audio files if SoX is not available
function generatePlaceholderFiles() {
    console.log('Generating placeholder audio files...');
    
    Object.keys(sounds).forEach(filename => {
        const outputPath = path.join(audioDir, filename);
        
        // Create an empty file
        fs.writeFileSync(outputPath, Buffer.from([
            // Simple WAV header (44 bytes)
            0x52, 0x49, 0x46, 0x46, // "RIFF"
            0x24, 0x00, 0x00, 0x00, // Chunk size (36 + data size)
            0x57, 0x41, 0x56, 0x45, // "WAVE"
            0x66, 0x6D, 0x74, 0x20, // "fmt "
            0x10, 0x00, 0x00, 0x00, // Subchunk1 size (16)
            0x01, 0x00,             // Audio format (1 = PCM)
            0x01, 0x00,             // Number of channels (1)
            0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
            0x88, 0x58, 0x01, 0x00, // Byte rate (44100 * 1 * 2)
            0x02, 0x00,             // Block align (1 * 2)
            0x10, 0x00,             // Bits per sample (16)
            0x64, 0x61, 0x74, 0x61, // "data"
            0x00, 0x00, 0x00, 0x00  // Data size (0)
        ]));
        
        console.log(`Generated placeholder for ${filename}`);
    });
}

// Try to generate audio files with SoX, fall back to placeholders
generateAudioFiles();

// If SoX fails, generate placeholders after a delay
setTimeout(() => {
    // Check if any files were created
    const files = fs.readdirSync(audioDir);
    if (files.length === 0) {
        console.log('SoX audio generation failed or took too long, creating placeholders...');
        generatePlaceholderFiles();
    }
}, 5000);

console.log('Audio generation script started. Check the assets/audio directory for the generated files.');