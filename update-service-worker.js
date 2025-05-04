/**
 * Service Worker Update Script
 * 
 * This script automatically:
 * 1. Scans the project directory for files to cache
 * 2. Updates the service-worker.js file with the new file list
 * 3. Increments the cache version
 */

const fs = require('fs');
const path = require('path');

// Configuration
const serviceWorkerPath = './service-worker.js';
const directoriesToScan = [
  './', // Root directory for HTML files
  './css',
  './js',
  './images',
  './assets/audio'
];

// File extensions to include
const fileExtensions = [
  '.html', '.css', '.js', '.json', 
  '.png', '.jpg', '.jpeg', '.svg', '.ico',
  '.mp3', '.wav', '.ogg'
];

// Files to always include
const alwaysInclude = [
  '',
  'index.html',
  'manifest.json'
];

// Files to exclude
const excludeFiles = [
  'update-service-worker.js',
  'node_modules',
  '.git',
  '.vscode',
  'progress'
];

/**
 * Recursively scan directories for files
 */
function scanDirectory(dir, baseDir = '') {
  let results = [];
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
      results = results.concat(scanDirectory(fullPath, relativePath));
    } else {
      // Check if file extension should be included
      const ext = path.extname(file).toLowerCase();
      if (fileExtensions.includes(ext)) {
        // Convert Windows path separators to web format
        results.push(relativePath.replace(/\\/g, '/'));
      }
    }
  }
  
  return results;
}

/**
 * Get all files to cache
 */
function getFilesToCache() {
  let allFiles = [...alwaysInclude];
  
  for (const dir of directoriesToScan) {
    try {
      if (fs.existsSync(dir)) {
        const baseDir = dir === './' ? '' : dir;
        const files = scanDirectory(dir, baseDir);
        allFiles = allFiles.concat(files);
      }
    } catch (err) {
      console.error(`Error scanning directory ${dir}:`, err);
    }
  }
  
  // Remove duplicates
  return [...new Set(allFiles)];
}

/**
 * Update the service worker file
 */
function updateServiceWorker() {
  try {
    // Read the current service worker file
    let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
    
    // Extract the current version
    const versionMatch = serviceWorkerContent.match(/const CACHE_VERSION = ['"](\d+)['"]/);
    if (!versionMatch) {
      throw new Error('Could not find CACHE_VERSION in service-worker.js');
    }
    
    // Increment the version
    const currentVersion = parseInt(versionMatch[1], 10);
    const newVersion = currentVersion + 1;
    
    // Update the version in the file
    serviceWorkerContent = serviceWorkerContent.replace(
      /const CACHE_VERSION = ['"](\d+)['"]/,
      `const CACHE_VERSION = '${newVersion}'`
    );
    
    // Get the files to cache
    const filesToCache = getFilesToCache();
    
    // Format the files array
    const filesArrayString = filesToCache
      .map(file => `  '${file}'`)
      .join(',\n');
    
    // Replace the ASSETS_TO_CACHE array
    serviceWorkerContent = serviceWorkerContent.replace(
      /const ASSETS_TO_CACHE = \[([\s\S]*?)\];/,
      `const ASSETS_TO_CACHE = [\n${filesArrayString}\n];`
    );
    
    // Write the updated service worker file
    fs.writeFileSync(serviceWorkerPath, serviceWorkerContent);
    
    console.log(`✅ Service worker updated successfully!`);
    console.log(`📦 Cache version incremented to: ${newVersion}`);
    console.log(`🔢 Total files to cache: ${filesToCache.length}`);
  } catch (err) {
    console.error('Error updating service worker:', err);
  }
}

// Run the update
updateServiceWorker();