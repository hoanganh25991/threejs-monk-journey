#!/usr/bin/env node

/**
 * Generate Sample Maps Script
 * Creates sample maps for each theme and saves them to the generated-maps directory
 */

import { MapGenerator, MAP_THEMES } from './map-generator.js';
import fs from 'fs';
import path from 'path';

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
        const mapData = generator.generateMap(themeKey);
        
        // Create filename
        const filename = `${themeKey.toLowerCase()}_sample.json`;
        const filepath = path.join(outputDir, filename);
        
        // Save map
        fs.writeFileSync(filepath, generator.exportToJSON());
        
        console.log(`✓ ${theme.name} saved to: ${filename}`);
        console.log(`  - Zones: ${mapData.zones.length}`);
        console.log(`  - Structures: ${mapData.structures.length}`);
        console.log(`  - Paths: ${mapData.paths.length}`);
        console.log(`  - Environment objects: ${mapData.environment.length}`);
        
        // Create map entry for index
        generatedMaps.push({
            id: themeKey.toLowerCase(),
            name: theme.name,
            description: theme.description,
            filename: filename,
            preview: `images/map-previews/${themeKey.toLowerCase()}.jpg`,
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
    
    // Update index.json with the new map
    updateMapIndex(themeName, filename, mapData);
    
    console.log(`Custom map generated: ${filepath}`);
    return { mapData, filepath };
}

/**
 * Update the maps index.json file with a new map
 */
function updateMapIndex(themeName, filename, mapData) {
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
            console.log('  node generate-sample-maps.js custom DARK_FOREST --seed 12345');
            console.log('  node generate-sample-maps.js custom LAVA_ZONE --size 2000 --filename my_lava_map.json');
    }
}

// Export for use as module
export { generateAllSampleMaps, generateCustomMap };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}