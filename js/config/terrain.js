/**
 * Configuration settings for terrain generation and rendering
 */
export const TERRAIN_CONFIG = {
    // Base terrain properties
    size: 1, // Base terrain size
    resolution: 2, // Base terrain resolution
    height: 4, // Maximum terrain height
    
    // Terrain chunk properties
    chunkSize: 16, // Size of each terrain chunk
    chunkViewDistance: 3,
    
    // Terrain buffering properties
    bufferDistance: 5, // Distance beyond view distance to pre-generate terrain chunks
};