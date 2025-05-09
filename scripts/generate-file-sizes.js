/**
 * File Size Generator Script
 * 
 * This script scans the project directory for files and generates a simplified JSON file
 * containing only the total file size and minimal file categorization for the loading progress indicator.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const outputPath = './pwa/file-sizes.json';
const directoriesToScan = [
  './css',
  './js',
  './images',
  './assets',
  './pwa',
];

// File extensions to include
const fileExtensions = [
  '.html', '.css', '.js', '.json', 
  '.png', '.jpg', '.jpeg', '.svg', '.ico',
  '.mp3', '.wav', '.ogg', '.glb'
];

// Files to always include
const alwaysInclude = [
  '',
  'index.html',
  'manifest.json'
];

// Files to exclude
const excludeFiles = [
  'node_modules',
  '.git',
  '.vscode',
  'progress',
  'scripts',
  'fuctional-requirement',
];

/**
 * Recursively scan directories for files and calculate total size
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative path calculation
 * @param {Object} stats - Object to collect statistics
 * @returns {Object} Updated statistics object
 */
function scanDirectoryForStats(dir, baseDir = '', stats = { totalSize: 0, fileCount: 0, categories: {} }) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(baseDir, file);
    
    // Skip excluded files and directories
    if (excludeFiles.some(exclude => relativePath.includes(exclude))) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      scanDirectoryForStats(fullPath, relativePath, stats);
    } else {
      // Check if file extension should be included
      const ext = path.extname(file).toLowerCase();
      
      if (fileExtensions.includes(ext)) {
        // Get file size in bytes
        const fileSize = stat.size;
        
        // Update total size and file count
        stats.totalSize += fileSize;
        stats.fileCount++;
        
        // Categorize file
        let category = 'other';
        if (ext === '.glb') category = 'models';
        else if (['.jpg', '.png', '.jpeg', '.svg', '.ico'].includes(ext)) category = 'images';
        else if (['.mp3', '.wav', '.ogg'].includes(ext)) category = 'audio';
        else if (ext === '.js') category = 'js';
        else if (ext === '.css') category = 'css';
        
        // Initialize category if it doesn't exist
        if (!stats.categories[category]) {
          stats.categories[category] = { count: 0, size: 0 };
        }
        
        // Update category stats
        stats.categories[category].count++;
        stats.categories[category].size += fileSize;
        
        // Store a sample file path for each category (for display purposes)
        if (!stats.categories[category].sampleFile) {
          stats.categories[category].sampleFile = relativePath.replace(/\\/g, '/');
        }
      }
    }
  }
  
  return stats;
}

/**
 * Generate simplified file sizes JSON
 */
function generateFileSizesJson() {
  // Initialize stats object
  const stats = { totalSize: 0, fileCount: 0, categories: {} };
  
  // Process always include files
  for (const filePath of alwaysInclude) {
    // For root path, use index.html
    const fullPath = filePath === '' ? './index.html' : `./${filePath}`;
    
    // Get file size if it exists
    try {
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        stats.totalSize += stat.size;
        stats.fileCount++;
        
        // Add to 'other' category
        if (!stats.categories.other) {
          stats.categories.other = { count: 0, size: 0 };
        }
        stats.categories.other.count++;
        stats.categories.other.size += stat.size;
        
        // Store as sample file if needed
        if (!stats.categories.other.sampleFile) {
          stats.categories.other.sampleFile = filePath;
        }
      }
    } catch (err) {
      console.warn(`Could not get size for ${fullPath}:`, err.message);
    }
  }
  
  // Scan directories
  for (const dir of directoriesToScan) {
    try {
      if (fs.existsSync(dir)) {
        const baseDir = dir === './' ? '' : dir;
        scanDirectoryForStats(dir, baseDir, stats);
      }
    } catch (err) {
      console.error(`Error scanning directory ${dir}:`, err);
    }
  }
  
  // Convert total size to MB with 2 decimal places
  const totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
  
  // Create minimal file categories for compatibility
  const fileCategories = {};
  const fileSizes = {};
  
  // For each category, create a minimal array with just one sample file
  Object.entries(stats.categories).forEach(([category, data]) => {
    if (data.sampleFile) {
      fileCategories[category] = [data.sampleFile];
      fileSizes[data.sampleFile] = data.size;
    }
  });
  
  // Create the simplified output data
  const outputData = {
    totalSizeBytes: stats.totalSize,
    totalSizeMB,
    totalFiles: stats.fileCount,
    // Minimal fileSizes map with just sample files for compatibility
    fileSizes,
    // Minimal fileCategories with just sample files for compatibility
    fileCategories,
    categorySizes: Object.entries(stats.categories).reduce((obj, [category, data]) => {
      obj[category] = {
        count: data.count,
        sizeBytes: data.size,
        sizeMB: (data.size / (1024 * 1024)).toFixed(2)
      };
      return obj;
    }, {}),
    generatedAt: new Date().toISOString()
  };
  
  // Write the output file
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`✅ File sizes JSON generated successfully at ${outputPath}`);
  console.log(`🔢 Total files: ${stats.fileCount}`);
  console.log(`📊 Total size: ${totalSizeMB} MB`);
  
  // Log category counts
  console.log('\nFile categories:');
  Object.entries(stats.categories).forEach(([category, data]) => {
    const sizeMB = (data.size / (1024 * 1024)).toFixed(2);
    console.log(`- ${category}: ${data.count} files, ${sizeMB} MB`);
  });
}

// Run the generator
generateFileSizesJson();