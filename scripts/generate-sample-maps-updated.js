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
 * Ensure map data has theme information for proper coloring
 * @param {Object} mapData - The map data
 * @param {Object} theme - The theme information
 */
function ensureMapThemeInfo(mapData, theme) {
    if (!mapData.theme) {
        mapData.theme = {
            name: theme.name,
            primaryZone: theme.primaryZone,
            colors: theme.colors
        };
    }
    return mapData;
}

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
        
        // Ensure map has theme information for proper coloring
        ensureMapThemeInfo(mapData, theme);
        
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
        
        // Ensure map has theme information for proper coloring
        ensureMapThemeInfo(mapData, theme);
        
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
            stats: {
                zones: mapData.zones.length,
                structures: mapData.structures.length,
                paths: mapData.paths.length,
                environment: mapData.environment.length
            }
        });
    }
    
    // Generate custom theme combination maps
    for (let i = 0; i < Math.floor(count * 0.2); i++) {
        // Select a random custom theme combination
        const customTheme = customThemeCombinations[Math.floor(Math.random() * customThemeCombinations.length)];
        const mapSize = mapSizes[Math.floor(Math.random() * mapSizes.length)];
        
        // Create a unique seed
        const seed = Math.floor(Math.random() * 1000000);
        
        console.log(`\n=== Generating Custom Theme Map ${i+1}/${Math.floor(count * 0.2)} ===`);
        console.log(`Theme: ${customTheme.name}`);
        console.log(`Base: ${MAP_THEMES[customTheme.baseTheme].name}, Mixin: ${MAP_THEMES[customTheme.mixinTheme].name}`);
        console.log(`Map Size: ${mapSize}`);
        console.log(`Seed: ${seed}`);
        
        // Generate the map with custom theme
        const generator = new MapGenerator();
        generator.seed = seed;
        generator.rng = generator.createSeededRandom(seed);
        generator.mapSize = mapSize;
        
        // Create a custom theme by mixing two existing themes
        const baseTheme = MAP_THEMES[customTheme.baseTheme];
        const mixinTheme = MAP_THEMES[customTheme.mixinTheme];
        
        // Mix the features based on the mix ratio
        const mixedFeatures = { ...customTheme.features };
        
        // Create a unique map ID and filename
        const mapId = `custom_${customTheme.baseTheme.toLowerCase()}_${customTheme.mixinTheme.toLowerCase()}_${i}`;
        const filename = `${mapId}.json`;
        
        // Generate the map with the custom theme
        const mapData = generator.generateCustomTheme(
            customTheme.baseTheme,
            customTheme.mixinTheme,
            customTheme.mixRatio,
            {
                seed: seed,
                mapSize: mapSize,
                features: mixedFeatures,
                name: customTheme.name,
                description: customTheme.description
            }
        );
        
        // Save map
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        // Generate minimap
        const minimapOutputDir = path.join(outputDir, 'minimaps');
        if (!fs.existsSync(minimapOutputDir)) {
            fs.mkdirSync(minimapOutputDir, { recursive: true });
        }
        
        const baseFilename = path.basename(filename, '.json');
        
        // Create a combined theme for the minimap generator
        const combinedTheme = {
            name: customTheme.name,
            primaryZone: baseTheme.primaryZone,
            colors: { ...baseTheme.colors }
        };
        
        // Ensure map has theme information for proper coloring
        ensureMapThemeInfo(mapData, combinedTheme);
        
        const minimapGenerator = new MinimapGenerator(mapData, {
            outputDir: minimapOutputDir,
            minimapResolution: 200,
            imageResolutions: [256]
        });
        
        // Generate minimap data and images
        const minimapResult = minimapGenerator.generate(baseFilename);
        
        console.log(`✓ ${customTheme.name} saved to: ${filename}`);
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
            name: customTheme.name,
            description: customTheme.description,
            filename: filename,
            // Use the highest resolution minimap image as preview if available
            preview: highestResImage ? `assets/maps/minimaps/${path.basename(highestResImage.path)}` : `images/map-previews/custom.jpg`,
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
    
    // Generate completely random maps with unique names
    for (let i = 0; i < Math.floor(count * 0.1); i++) {
        // Generate a unique theme name
        const prefix = themeNamePrefixes[Math.floor(Math.random() * themeNamePrefixes.length)];
        const suffix = themeNameSuffixes[Math.floor(Math.random() * themeNameSuffixes.length)];
        const themeName = `${prefix} ${suffix}`;
        
        // Select a base theme to use as a template
        const baseThemeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        const baseTheme = MAP_THEMES[baseThemeKey];
        
        // Create a unique seed
        const seed = Math.floor(Math.random() * 1000000);
        const mapSize = mapSizes[Math.floor(Math.random() * mapSizes.length)];
        
        console.log(`\n=== Generating Unique Theme Map ${i+1}/${Math.floor(count * 0.1)} ===`);
        console.log(`Theme: ${themeName}`);
        console.log(`Base Template: ${baseTheme.name}`);
        console.log(`Map Size: ${mapSize}`);
        console.log(`Seed: ${seed}`);
        
        // Create random features
        const randomFeatures = {
            treeDensity: Math.random() * 1.5,
            mountainDensity: Math.random() * 1.2,
            waterDensity: Math.random() * 0.8,
            lavaDensity: Math.random() * 0.5,
            pathWidth: 2 + Math.random() * 3,
            villageCount: Math.floor(Math.random() * 8),
            towerCount: Math.floor(Math.random() * 10),
            ruinsCount: Math.floor(Math.random() * 15),
            bridgeCount: Math.floor(Math.random() * 12),
            darkSanctumCount: Math.floor(Math.random() * 5)
        };
        
        // Generate the map
        const generator = new MapGenerator();
        generator.seed = seed;
        generator.rng = generator.createSeededRandom(seed);
        generator.mapSize = mapSize;
        
        // Create a unique map ID and filename
        const mapId = `unique_${prefix.toLowerCase()}_${suffix.toLowerCase()}_${i}`;
        const filename = `${mapId}.json`;
        
        // Generate the map with the random theme
        const mapData = generator.generateRandomTheme(baseThemeKey, {
            seed: seed,
            mapSize: mapSize,
            features: randomFeatures,
            name: themeName,
            description: `A unique ${suffix.toLowerCase()} with ${prefix.toLowerCase()} characteristics`
        });
        
        // Save map
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        // Generate minimap
        const minimapOutputDir = path.join(outputDir, 'minimaps');
        if (!fs.existsSync(minimapOutputDir)) {
            fs.mkdirSync(minimapOutputDir, { recursive: true });
        }
        
        const baseFilename = path.basename(filename, '.json');
        
        // Create a theme object for the minimap generator
        const uniqueTheme = {
            name: themeName,
            primaryZone: baseTheme.primaryZone,
            colors: { ...baseTheme.colors }
        };
        
        // Ensure map has theme information for proper coloring
        ensureMapThemeInfo(mapData, uniqueTheme);
        
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
            id: mapId,
            name: themeName,
            description: `A unique ${suffix.toLowerCase()} with ${prefix.toLowerCase()} characteristics`,
            filename: filename,
            // Use the highest resolution minimap image as preview if available
            preview: highestResImage ? `assets/maps/minimaps/${path.basename(highestResImage.path)}` : `images/map-previews/unique.jpg`,
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
    
    // Update the index file with the new maps
    const indexPath = path.join(outputDir, 'index.json');
    let indexData = {};
    
    // Try to load existing index file
    try {
        const existingIndex = fs.readFileSync(indexPath, 'utf8');
        indexData = JSON.parse(existingIndex);
    } catch (error) {
        // Create new index if it doesn't exist
        indexData = {
            generated: new Date().toISOString(),
            maps: []
        };
    }
    
    // Add new maps to the index
    indexData.maps = [...indexData.maps, ...generatedMaps];
    
    // Save updated index
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log(`\n=== Generation Complete ===`);
    console.log(`Generated ${generatedMaps.length} random maps`);
    console.log(`Updated index file: index.json`);
    console.log(`All files saved to: ${outputDir}`);
    
    return generatedMaps;
}

// Run the script if called directly
if (process.argv[1] === import.meta.url) {
    const command = process.argv[2] || 'all';
    const count = parseInt(process.argv[3]) || 20;
    
    console.log('Map Generator Script');
    console.log('==================');
    
    switch (command) {
        case 'samples':
            console.log('Generating sample maps for all themes...');
            generateAllSampleMaps().then(() => {
                console.log('Sample map generation complete!');
            });
            break;
            
        case 'random':
            console.log(`Generating ${count} random maps...`);
            generateRandomMaps(count).then(() => {
                console.log('Random map generation complete!');
            });
            break;
            
        case 'all':
        default:
            console.log('Generating all maps (samples and random)...');
            generateAllSampleMaps().then(() => {
                console.log('Sample maps generated, now generating random maps...');
                return generateRandomMaps(count);
            }).then(() => {
                console.log('All map generation complete!');
            });
            break;
    }
}

export { generateAllSampleMaps, generateRandomMaps };