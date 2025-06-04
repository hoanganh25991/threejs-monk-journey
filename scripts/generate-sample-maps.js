#!/usr/bin/env node

/**
 * Generate Sample Maps Script
 * Creates sample maps for each theme and saves them to the generated-maps directory
 * Also generates minimaps and map images
 */

import { MapGenerator, MAP_THEMES } from './map-generator.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Use createRequire to import CommonJS modules
const require = createRequire(import.meta.url);
const MinimapGenerator = require('./minimap-generator.js');

/**
 * Generate all sample maps
 */
async function generateAllSampleMaps() {
    console.log('Generating sample maps for all themes...\n');
    
    const outputDir = path.join(process.cwd(), 'assets/maps');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const generatedMaps = [];
    
    // Generate a map for each theme
    for (const [themeKey, theme] of Object.entries(MAP_THEMES)) {
        console.log(`\n=== Generating ${theme.name} ===`);
        
        const generator = new MapGenerator();
        
        // Apply special handling for Dark Forest to reduce file size
        let options = {};
        if (themeKey === 'DARK_FOREST') {
            options = {
                features: {
                    // Reduce tree density for sample map to prevent excessive file size
                    treeDensity: 0.2,  // Reduced from 0.8
                    pathWidth: 2,
                    villageCount: 3,
                    towerCount: 5,
                    ruinsCount: 2,
                    bridgeCount: 4
                }
            };
            console.log('  - Applying reduced tree density for Dark Forest sample');
        }
        
        const mapData = generator.generateMap(themeKey, options);
        
        // Create filename
        const filename = `${themeKey.toLowerCase()}_sample.json`;
        const filepath = path.join(outputDir, filename);
        
        // Save map
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        // Generate minimap
        const minimapOutputDir = path.join(outputDir, 'minimaps');
        if (!fs.existsSync(minimapOutputDir)) {
            fs.mkdirSync(minimapOutputDir, { recursive: true });
        }
        
        const baseFilename = path.basename(filename, '.json');
        const minimapGenerator = new MinimapGenerator(mapData, {
            outputDir: minimapOutputDir,
            minimapResolution: 200,
            imageResolutions: [256]
        });
        
        // Generate minimap data and images
        const minimapResult = minimapGenerator.generate(baseFilename);
        
        console.log(`✓ ${theme.name} saved to: ${filename}`);
        console.log(`  - Zones: ${mapData.zones.length}`);
        console.log(`  - Structures: ${mapData.structures.length}`);
        console.log(`  - Paths: ${mapData.paths.length}`);
        console.log(`  - Environment objects: ${mapData.environment.length}`);
        console.log(`  - Minimap generated: ${minimapResult.imageFiles.length} images`);
        
        // Get the highest resolution minimap image for preview
        const highestResImage = minimapResult.imageFiles.reduce((highest, current) => {
            return (!highest || current.resolution > highest.resolution) ? current : highest;
        }, null);
        
        // Create map entry for index
        generatedMaps.push({
            id: themeKey.toLowerCase(),
            name: theme.name,
            description: theme.description,
            filename: filename,
            // Use the highest resolution minimap image as preview if available
            preview: highestResImage ? `assets/maps/minimaps/${path.basename(highestResImage.path)}` : `images/map-previews/${themeKey.toLowerCase()}.jpg`,
            minimap: {
                // Reference the JSON data file directly for minimap
                data: `assets/maps/minimaps/${baseFilename}_minimap.json`,
                // Keep image references for backward compatibility
                images: minimapResult.imageFiles.map(img => `assets/maps/minimaps/${path.basename(img.path)}`)
            },
            stats: {
                zones: mapData.zones.length,
                structures: mapData.structures.length,
                paths: mapData.paths.length,
                environment: mapData.environment.length
            }
        });
    }
    
    // Generate index file
    const indexData = {
        generated: new Date().toISOString(),
        maps: generatedMaps
    };
    
    const indexPath = path.join(outputDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log(`\n=== Generation Complete ===`);
    console.log(`Generated ${generatedMaps.length} sample maps`);
    console.log(`Index file created: index.json`);
    console.log(`All files saved to: ${outputDir}`);
    
    return generatedMaps;
}

/**
 * Generate multiple random maps with unique variations
 * Creates a set of maps with randomized parameters for each theme
 */
async function generateRandomMaps(count = 20) {
    console.log(`Generating ${count} random maps with unique variations...\n`);
    
    const outputDir = path.join(process.cwd(), 'assets/maps');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const generatedMaps = [];
    const themeKeys = Object.keys(MAP_THEMES);
    
    // Unique variations to apply to maps
    const variations = [
        { name: "Dense", features: { treeDensity: 1.2, villageCount: 5, towerCount: 8 } },
        { name: "Sparse", features: { treeDensity: 0.4, villageCount: 1, towerCount: 2 } },
        { name: "Ruined", features: { ruinsCount: 15, villageCount: 0, towerCount: 1 } },
        { name: "Fortified", features: { towerCount: 12, bridgeCount: 8, villageCount: 3 } },
        { name: "Wilderness", features: { treeDensity: 1.5, villageCount: 0, towerCount: 0, ruinsCount: 0 } },
        { name: "Populated", features: { villageCount: 8, pathWidth: 4, bridgeCount: 10 } },
        { name: "Ancient", features: { ruinsCount: 20, darkSanctumCount: 5 } },
        { name: "Mystical", features: { darkSanctumCount: 8, lavaDensity: 0.8 } },
        { name: "Mountainous", features: { mountainDensity: 1.5, bridgeCount: 12 } },
        { name: "Flooded", features: { waterDensity: 1.2, bridgeCount: 15 } },
        { name: "Hybrid", features: { treeDensity: 0.7, mountainDensity: 0.7, waterDensity: 0.7, lavaDensity: 0.3 } },
        { name: "Extreme", features: { treeDensity: 2.0, villageCount: 10, towerCount: 15, ruinsCount: 20, bridgeCount: 20 } },
        { name: "Minimal", features: { treeDensity: 0.2, villageCount: 1, towerCount: 1, ruinsCount: 1, bridgeCount: 1 } },
        { name: "Chaotic", features: { pathWidth: 5, villageCount: Math.floor(Math.random() * 10), towerCount: Math.floor(Math.random() * 15) } },
        { name: "Peaceful", features: { villageCount: 6, towerCount: 0, darkSanctumCount: 0 } }
    ];
    
    // Map size variations - reduced to prevent excessive file sizes
    const mapSizes = [500, 800, 1000, 1200, 1500];
    
    // Custom theme combinations (mixing elements from different themes)
    const customThemeCombinations = [
        {
            name: "Volcanic Forest",
            description: "A forest gradually being consumed by volcanic activity",
            baseTheme: "DARK_FOREST",
            mixinTheme: "LAVA_ZONE",
            mixRatio: 0.4, // 40% lava, 60% forest
            features: { treeDensity: 0.6, lavaDensity: 0.5, darkSanctumCount: 2, ruinsCount: 5 }
        },
        {
            name: "Frozen Ruins",
            description: "Ancient ruins covered in ice and snow",
            baseTheme: "ANCIENT_RUINS",
            mixinTheme: "FROZEN_MOUNTAINS",
            mixRatio: 0.6, // 60% mountains, 40% ruins
            features: { ruinsDensity: 0.7, mountainDensity: 0.8, bridgeCount: 10 }
        },
        {
            name: "Swamp Sanctum",
            description: "Dark sanctums rising from murky swamp waters",
            baseTheme: "MYSTICAL_SWAMP",
            mixinTheme: "LAVA_ZONE",
            mixRatio: 0.3, // 30% lava zone elements, 70% swamp
            features: { waterDensity: 0.9, darkSanctumCount: 7, bridgeCount: 12 }
        },
        {
            name: "Mountain Forest",
            description: "Dense forests growing on steep mountain slopes",
            baseTheme: "FROZEN_MOUNTAINS",
            mixinTheme: "DARK_FOREST",
            mixRatio: 0.5, // 50/50 mix
            features: { treeDensity: 1.0, mountainDensity: 1.0, villageCount: 4, towerCount: 6 }
        },
        {
            name: "Ruined Desert",
            description: "Ancient ruins scattered across a vast desert landscape",
            baseTheme: "ANCIENT_RUINS",
            mixinTheme: "LAVA_ZONE",
            mixRatio: 0.4, // 40% lava zone (desert), 60% ruins
            features: { ruinsDensity: 1.2, villageCount: 2, towerCount: 8 }
        }
    ];
    
    // New theme names for random generation
    const themeNamePrefixes = [
        "Mystic", "Ancient", "Forgotten", "Enchanted", "Cursed", 
        "Ethereal", "Primal", "Celestial", "Arcane", "Fabled",
        "Haunted", "Sacred", "Mythic", "Eldritch", "Verdant",
        "Twilight", "Radiant", "Shadowy", "Astral", "Crystalline"
    ];
    
    const themeNameSuffixes = [
        "Forest", "Mountains", "Wasteland", "Sanctuary", "Realm",
        "Peaks", "Valley", "Caverns", "Highlands", "Depths",
        "Marshes", "Tundra", "Jungle", "Isles", "Dunes",
        "Groves", "Canyons", "Plateau", "Nexus", "Expanse"
    ];
    
    // Generate maps with standard variations
    for (let i = 0; i < Math.floor(count * 0.7); i++) {
        // Select a random theme and variation
        const themeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        const theme = MAP_THEMES[themeKey];
        const variation = variations[Math.floor(Math.random() * variations.length)];
        const mapSize = mapSizes[Math.floor(Math.random() * mapSizes.length)];
        
        // Create a unique seed
        const seed = Math.floor(Math.random() * 1000000);
        
        console.log(`\n=== Generating Random Map ${i+1}/${count} ===`);
        console.log(`Theme: ${theme.name}`);
        console.log(`Variation: ${variation.name}`);
        console.log(`Map Size: ${mapSize}`);
        console.log(`Seed: ${seed}`);
        
        // Create custom options by combining theme features with variation
        let themeFeatures = { ...theme.features };
        
        // Apply special handling for Dark Forest to reduce file size
        if (themeKey === 'DARK_FOREST') {
            // Reduce tree density for Dark Forest to prevent excessive file size
            themeFeatures.treeDensity = Math.min(themeFeatures.treeDensity, 0.2);
            console.log('  - Applying reduced tree density for Dark Forest');
        }
        
        const options = {
            seed: seed,
            mapSize: mapSize,
            features: { ...themeFeatures, ...variation.features }
        };
        
        // Generate unique map name
        const mapName = `${variation.name} ${theme.name}`;
        const mapId = `random_${themeKey.toLowerCase()}_${variation.name.toLowerCase()}_${i}`;
        const filename = `${mapId}.json`;
        
        // Generate the map
        const generator = new MapGenerator();
        generator.seed = seed;
        generator.rng = generator.createSeededRandom(seed);
        generator.mapSize = mapSize;
        
        const mapData = generator.generateMap(themeKey, options);
        
        // Save map
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        // Generate minimap
        const minimapOutputDir = path.join(outputDir, 'minimaps');
        if (!fs.existsSync(minimapOutputDir)) {
            fs.mkdirSync(minimapOutputDir, { recursive: true });
        }
        
        const baseFilename = path.basename(filename, '.json');
        const minimapGenerator = new MinimapGenerator(mapData, {
            outputDir: minimapOutputDir,
            minimapResolution: 200,
            imageResolutions: [256]
        });
        
        // Generate minimap data and images
        const minimapResult = minimapGenerator.generate(baseFilename);
        
        console.log(`✓ ${mapName} saved to: ${filename}`);
        console.log(`  - Zones: ${mapData.zones.length}`);
        console.log(`  - Structures: ${mapData.structures.length}`);
        console.log(`  - Paths: ${mapData.paths.length}`);
        console.log(`  - Environment objects: ${mapData.environment.length}`);
        console.log(`  - Minimap generated: ${minimapResult.imageFiles.length} images`);
        
        // Get the highest resolution minimap image for preview
        const highestResImage = minimapResult.imageFiles.reduce((highest, current) => {
            return (!highest || current.resolution > highest.resolution) ? current : highest;
        }, null);
        
        // Create map entry for index
        generatedMaps.push({
            id: mapId,
            name: mapName,
            description: `${variation.name} variation of ${theme.description}`,
            filename: filename,
            // Use the highest resolution minimap image as preview if available
            preview: highestResImage ? `assets/maps/minimaps/${path.basename(highestResImage.path)}` : `images/map-previews/${themeKey.toLowerCase()}.jpg`,
            minimap: {
                // Reference the JSON data file directly for minimap
                data: `assets/maps/minimaps/${baseFilename}_minimap.json`,
                // Keep image references for backward compatibility
                images: minimapResult.imageFiles.map(img => `assets/maps/minimaps/${path.basename(img.path)}`)
            },
            seed: seed,
            mapSize: mapSize,
            variation: variation.name,
            stats: {
                zones: mapData.zones.length,
                structures: mapData.structures.length,
                paths: mapData.paths.length,
                environment: mapData.environment.length
            }
        });
    }
    
    // Generate maps with custom theme combinations
    const remainingCount = count - Math.floor(count * 0.7);
    for (let i = 0; i < remainingCount; i++) {
        const customTheme = customThemeCombinations[i % customThemeCombinations.length];
        const mapSize = mapSizes[Math.floor(Math.random() * mapSizes.length)];
        
        // Create a unique seed
        const seed = Math.floor(Math.random() * 1000000);
        
        console.log(`\n=== Generating Custom Theme Map ${Math.floor(count * 0.7) + i + 1}/${count} ===`);
        console.log(`Theme: ${customTheme.name}`);
        console.log(`Description: ${customTheme.description}`);
        console.log(`Map Size: ${mapSize}`);
        console.log(`Seed: ${seed}`);
        
        // Create custom options
        let baseThemeFeatures = { ...MAP_THEMES[customTheme.baseTheme].features };
        
        // Apply special handling for Dark Forest to reduce file size
        if (customTheme.baseTheme === 'DARK_FOREST' || customTheme.mixinTheme === 'DARK_FOREST') {
            // Reduce tree density for Dark Forest to prevent excessive file size
            baseThemeFeatures.treeDensity = Math.min(baseThemeFeatures.treeDensity || 0, 0.2);
            console.log('  - Applying reduced tree density for Dark Forest component');
        }
        
        const options = {
            seed: seed,
            mapSize: mapSize,
            features: { ...baseThemeFeatures, ...customTheme.features },
            customTheme: {
                name: customTheme.name,
                description: customTheme.description,
                mixinTheme: customTheme.mixinTheme,
                mixRatio: customTheme.mixRatio
            }
        };
        
        // Generate unique map name and ID
        const mapName = customTheme.name;
        const mapId = `custom_${customTheme.name.toLowerCase().replace(/\s+/g, '_')}_${i}`;
        const filename = `${mapId}.json`;
        
        // Generate the map
        const generator = new MapGenerator();
        generator.seed = seed;
        generator.rng = generator.createSeededRandom(seed);
        generator.mapSize = mapSize;
        
        // For custom themes, we'll use the base theme but apply special modifications
        const mapData = generator.generateMap(customTheme.baseTheme, options);
        
        // Save map
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        // Generate minimap
        const minimapOutputDir = path.join(outputDir, 'minimaps');
        if (!fs.existsSync(minimapOutputDir)) {
            fs.mkdirSync(minimapOutputDir, { recursive: true });
        }
        
        const baseFilename = path.basename(filename, '.json');
        const minimapGenerator = new MinimapGenerator(mapData, {
            outputDir: minimapOutputDir,
            minimapResolution: 200,
            imageResolutions: [256]
        });
        
        // Generate minimap data and images
        const minimapResult = minimapGenerator.generate(baseFilename);
        
        // Get the highest resolution minimap image for preview
        const highestResImage = minimapResult.imageFiles.reduce((highest, current) => {
            return (!highest || current.resolution > highest.resolution) ? current : highest;
        }, null);
        
        console.log(`✓ ${mapName} saved to: ${filename}`);
        console.log(`  - Minimap generated: ${minimapResult.imageFiles.length} images`);
        console.log(`  - Zones: ${mapData.zones.length}`);
        console.log(`  - Structures: ${mapData.structures.length}`);
        console.log(`  - Paths: ${mapData.paths.length}`);
        console.log(`  - Environment objects: ${mapData.environment.length}`);
        
        // Create map entry for index
        generatedMaps.push({
            id: mapId,
            name: mapName,
            description: customTheme.description,
            filename: filename,
            // Use the highest resolution minimap image as preview if available
            preview: highestResImage ? `assets/maps/minimaps/${path.basename(highestResImage.path)}` : `images/map-previews/${customTheme.baseTheme.toLowerCase()}.jpg`,
            minimap: {
                // Reference the JSON data file directly for minimap
                data: `assets/maps/minimaps/${baseFilename}_minimap.json`,
                // Keep image references for backward compatibility
                images: minimapResult.imageFiles.map(img => `assets/maps/minimaps/${path.basename(img.path)}`)
            },
            seed: seed,
            mapSize: mapSize,
            customTheme: true,
            baseTheme: customTheme.baseTheme,
            mixinTheme: customTheme.mixinTheme,
            stats: {
                zones: mapData.zones.length,
                structures: mapData.structures.length,
                paths: mapData.paths.length,
                environment: mapData.environment.length
            }
        });
    }
    
    // Update index file with new maps
    const indexPath = path.join(outputDir, 'index.json');
    let indexData = { maps: [] };
    
    // Read existing index if it exists
    if (fs.existsSync(indexPath)) {
        try {
            indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        } catch (error) {
            console.error('Error reading index file:', error);
        }
    }
    
    // Add new maps to index
    indexData.maps = [...indexData.maps, ...generatedMaps];
    indexData.generated = new Date().toISOString();
    
    // Write updated index
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log(`\n=== Random Map Generation Complete ===`);
    console.log(`Generated ${generatedMaps.length} random maps`);
    console.log(`Index file updated: index.json`);
    console.log(`All files saved to: ${outputDir}`);
    
    return generatedMaps;
}

/**
 * Generate a custom map with specific parameters
 */
function generateCustomMap(themeName, options = {}) {
    console.log(`Generating custom ${themeName} map...`);
    
    const generator = new MapGenerator();
    
    // Apply custom options
    if (options.seed) {
        generator.seed = options.seed;
        generator.rng = generator.createSeededRandom(options.seed);
    }
    
    if (options.mapSize) {
        generator.mapSize = options.mapSize;
    }
    
    const mapData = generator.generateMap(themeName, options);
    
    const filename = options.filename || `${themeName.toLowerCase()}_custom_${Date.now()}.json`;
    
    // Save to assets/maps directory
    const outputDir = path.join(process.cwd(), 'assets/maps');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, generator.exportToJSON());
    
    // Generate minimap
    const minimapOutputDir = path.join(outputDir, 'minimaps');
    if (!fs.existsSync(minimapOutputDir)) {
        fs.mkdirSync(minimapOutputDir, { recursive: true });
    }
    
    const baseFilename = path.basename(filename, '.json');
    const minimapGenerator = new MinimapGenerator(mapData, {
        outputDir: minimapOutputDir,
        minimapResolution: 200,
        imageResolutions: [256]
    });
    
    // Generate minimap data and images
    const minimapResult = minimapGenerator.generate(baseFilename);
    
    // Update index.json with the new map
    updateMapIndex(themeName, filename, mapData, minimapResult);
    
    console.log(`Custom map generated: ${filepath}`);
    console.log(`Minimap generated: ${minimapResult.imageFiles.length} images`);
    
    return { mapData, filepath, minimap: minimapResult };
}

/**
 * Update the maps index.json file with a new map
 */
function updateMapIndex(themeName, filename, mapData, minimapResult = null) {
    const indexPath = path.join(process.cwd(), 'assets/maps/index.json');
    let indexData = { maps: [] };
    
    // Read existing index if it exists
    if (fs.existsSync(indexPath)) {
        try {
            indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        } catch (error) {
            console.error('Error reading index file:', error);
        }
    }
    
    // Create map entry
    const theme = MAP_THEMES[themeName];
    const baseFilename = path.basename(filename, '.json');
    
    const mapEntry = {
        id: `${themeName.toLowerCase()}_custom_${Date.now()}`,
        name: `Custom ${theme.name}`,
        description: theme.description,
        filename: filename,
        preview: `images/map-previews/${themeName.toLowerCase()}.jpg`,
        stats: {
            zones: mapData.zones.length,
            structures: mapData.structures.length,
            paths: mapData.paths.length,
            environment: mapData.environment.length
        }
    };
    
    // Add minimap information if available
    if (minimapResult) {
        // Get the highest resolution minimap image for preview
        const highestResImage = minimapResult.imageFiles.reduce((highest, current) => {
            return (!highest || current.resolution > highest.resolution) ? current : highest;
        }, null);
        
        // Use the highest resolution minimap image as preview
        if (highestResImage) {
            mapEntry.preview = `assets/maps/minimaps/${path.basename(highestResImage.path)}`;
        }
        
        mapEntry.minimap = {
            data: `assets/maps/minimaps/${baseFilename}_minimap.json`,
            images: minimapResult.imageFiles.map(img => `assets/maps/minimaps/${path.basename(img.path)}`)
        };
    }
    
    // Add to maps array
    indexData.maps.push(mapEntry);
    indexData.generated = new Date().toISOString();
    
    // Write updated index
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`Index file updated with new map: ${mapEntry.name}`);
}

/**
 * CLI Interface
 */

function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'all':
            generateAllSampleMaps();
            break;
            
        case 'random':
            const count = args[1] ? parseInt(args[1]) : 20;
            generateRandomMaps(count);
            break;
            
        case 'random-themes':
            const themeCount = args[1] ? parseInt(args[1]) : 20;
            generateRandomThemedMaps(themeCount);
            break;
            
        case 'custom':
            const themeName = args[1];
            if (!themeName || !MAP_THEMES[themeName.toUpperCase()]) {
                console.error('Please specify a valid theme name');
                console.log('Available themes:', Object.keys(MAP_THEMES).join(', '));
                return;
            }
            
            const options = {};
            
            // Parse additional options
            for (let i = 2; i < args.length; i += 2) {
                const key = args[i];
                const value = args[i + 1];
                
                switch (key) {
                    case '--seed':
                        options.seed = parseInt(value);
                        break;
                    case '--size':
                        options.mapSize = parseInt(value);
                        break;
                    case '--filename':
                        options.filename = value;
                        break;
                }
            }
            
            generateCustomMap(themeName.toUpperCase(), options);
            break;
            
        case 'list':
            console.log('Available map themes:');
            Object.entries(MAP_THEMES).forEach(([key, theme]) => {
                console.log(`  ${key}: ${theme.description}`);
            });
            break;
            
        default:
            console.log('Map Generator Commands:');
            console.log('  all                           - Generate sample maps for all themes');
            console.log('  random [count]                - Generate multiple random maps with variations (default: 20)');
            console.log('  random-themes [count]         - Generate maps with completely random themes and colors (default: 20)');
            console.log('  custom <THEME> [options]      - Generate a custom map');
            console.log('  list                          - List available themes');
            console.log('');
            console.log('Custom map options:');
            console.log('  --seed <number>               - Set random seed');
            console.log('  --size <number>               - Set map size');
            console.log('  --filename <name>             - Set output filename');
            console.log('');
            console.log('Examples:');
            console.log('  node generate-sample-maps.js all');
            console.log('  node generate-sample-maps.js random 30');
            console.log('  node generate-sample-maps.js random-themes 5');
            console.log('  node generate-sample-maps.js custom DARK_FOREST --seed 12345');
            console.log('  node generate-sample-maps.js custom LAVA_ZONE --size 2000 --filename my_lava_map.json');
    }
}

/**
 * Generate completely random themed maps with unique colors
 * Creates a set of maps with randomized themes, colors, and parameters
 */
async function generateRandomThemedMaps(count = 20) {
    console.log(`Generating ${count} completely random themed maps...\n`);
    
    const outputDir = path.join(process.cwd(), 'assets/maps');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const generatedMaps = [];
    
    // New theme names for random generation
    const themeNamePrefixes = [
        "Mystic", "Ancient", "Forgotten", "Enchanted", "Cursed", 
        "Ethereal", "Primal", "Celestial", "Arcane", "Fabled",
        "Haunted", "Sacred", "Mythic", "Eldritch", "Verdant",
        "Twilight", "Radiant", "Shadowy", "Astral", "Crystalline"
    ];
    
    const themeNameSuffixes = [
        "Forest", "Mountains", "Wasteland", "Sanctuary", "Realm",
        "Peaks", "Valley", "Caverns", "Highlands", "Depths",
        "Marshes", "Tundra", "Jungle", "Isles", "Dunes",
        "Groves", "Canyons", "Plateau", "Nexus", "Expanse"
    ];
    
    // Generate random themed maps
    for (let i = 0; i < count; i++) {
        // Create a random theme name
        const prefixIndex = Math.floor(Math.random() * themeNamePrefixes.length);
        const suffixIndex = Math.floor(Math.random() * themeNameSuffixes.length);
        const themeName = `${themeNamePrefixes[prefixIndex]} ${themeNameSuffixes[suffixIndex]}`;
        const themeKey = themeName.toUpperCase().replace(/\s+/g, '_');
        
        // Create a description
        const description = `A unique ${themeNameSuffixes[suffixIndex].toLowerCase()} with ${themeNamePrefixes[prefixIndex].toLowerCase()} characteristics`;
        
        console.log(`\n=== Generating Random Theme ${i+1}/${count}: ${themeName} ===`);
        
        // Create a random seed
        const seed = Math.floor(Math.random() * 1000000);
        
        // Create the generator with the seed
        const generator = new MapGenerator();
        generator.seed = seed;
        generator.rng = generator.createSeededRandom(seed);
        
        // Generate a random map size
        const mapSizes = [500, 800, 1000, 1200, 1500];
        const mapSize = mapSizes[Math.floor(Math.random() * mapSizes.length)];
        generator.mapSize = mapSize;
        
        console.log(`Theme: ${themeName}`);
        console.log(`Map Size: ${mapSize}`);
        console.log(`Seed: ${seed}`);
        
        // Generate a completely random theme
        const randomTheme = generator.generateRandomTheme(themeName, description);
        
        // Store the theme temporarily in MAP_THEMES so it can be used by the generator
        MAP_THEMES[themeKey] = randomTheme;
        
        // Generate the map with the random theme
        const mapData = generator.generateMap(themeKey);
        
        // Create filename
        const filename = `random_theme_${themeKey.toLowerCase()}_${i}.json`;
        const filepath = path.join(outputDir, filename);
        
        // Save map
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        // Generate minimap
        const minimapOutputDir = path.join(outputDir, 'minimaps');
        if (!fs.existsSync(minimapOutputDir)) {
            fs.mkdirSync(minimapOutputDir, { recursive: true });
        }
        
        const baseFilename = path.basename(filename, '.json');
        const minimapGenerator = new MinimapGenerator(mapData, {
            outputDir: minimapOutputDir,
            minimapResolution: 200,
            imageResolutions: [256]
        });
        
        // Generate minimap data and images
        const minimapResult = minimapGenerator.generate(baseFilename);
        
        console.log(`✓ ${themeName} saved to: ${filename}`);
        console.log(`  - Zones: ${mapData.zones.length}`);
        console.log(`  - Structures: ${mapData.structures.length}`);
        console.log(`  - Paths: ${mapData.paths.length}`);
        console.log(`  - Environment objects: ${mapData.environment.length}`);
        console.log(`  - Minimap generated: ${minimapResult.imageFiles.length} images`);
        
        // Get the highest resolution minimap image for preview
        const highestResImage = minimapResult.imageFiles.reduce((highest, current) => {
            return (!highest || current.resolution > highest.resolution) ? current : highest;
        }, null);
        
        // Create map entry for index
        generatedMaps.push({
            id: `random_theme_${themeKey.toLowerCase()}_${i}`,
            name: themeName,
            description: description,
            filename: filename,
            // Use the highest resolution minimap image as preview if available
            preview: highestResImage ? `assets/maps/minimaps/${path.basename(highestResImage.path)}` : null,
            minimap: {
                // Reference the JSON data file directly for minimap
                data: `assets/maps/minimaps/${baseFilename}_minimap.json`,
                // Keep image references for backward compatibility
                images: minimapResult.imageFiles.map(img => `assets/maps/minimaps/${path.basename(img.path)}`)
            },
            seed: seed,
            mapSize: mapSize,
            randomTheme: true,
            stats: {
                zones: mapData.zones.length,
                structures: mapData.structures.length,
                paths: mapData.paths.length,
                environment: mapData.environment.length
            }
        });
        
        // Remove the temporary theme from MAP_THEMES
        delete MAP_THEMES[themeKey];
    }
    
    // Generate index file
    const indexPath = path.join(outputDir, 'random_themes_index.json');
    fs.writeFileSync(indexPath, JSON.stringify({
        generated: new Date().toISOString(),
        maps: generatedMaps
    }, null, 2));
    
    console.log(`\n=== Random Theme Generation Complete ===`);
    console.log(`Generated ${generatedMaps.length} random themed maps`);
    console.log(`Index file created: random_themes_index.json`);
    console.log(`All files saved to: ${outputDir}`);
    
    return generatedMaps;
}

// Export for use as module
export { generateAllSampleMaps, generateCustomMap, generateRandomMaps, generateRandomThemedMaps };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
