/**
 * Quality level configurations for the game's rendering settings.
 * These settings control various aspects of the game's visual quality and performance.
 */
export const qualityLevels = {
    ultra: {
        shadows: true,
        shadowMapSize: 2048,
        particleCount: 1.0,
        drawDistance: 1.0,
        antialiasing: true,
        pixelRatio: window.devicePixelRatio,
        textureQuality: 1.0,
        objectDetail: 1.0,
        maxVisibleObjects: Infinity
    },
    high: {
        shadows: true,
        shadowMapSize: 1024,
        particleCount: 0.8,
        drawDistance: 0.8,
        antialiasing: true,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        textureQuality: 0.8,
        objectDetail: 0.9,
        maxVisibleObjects: 500
    },
    medium: {
        shadows: true,
        shadowMapSize: 512,
        particleCount: 0.5,
        drawDistance: 0.5,
        antialiasing: false,
        pixelRatio: Math.min(window.devicePixelRatio, 1.0),
        textureQuality: 0.6,
        objectDetail: 0.7,
        maxVisibleObjects: 300
    },
    low: {
        shadows: false,
        shadowMapSize: 256,
        particleCount: 0.3,
        drawDistance: 0.4,
        antialiasing: false,
        pixelRatio: Math.min(window.devicePixelRatio, 0.75),
        textureQuality: 0.4,
        objectDetail: 0.5,
        maxVisibleObjects: 200
    },
    minimal: {
        shadows: false,
        shadowMapSize: 0,
        particleCount: 0.1,
        drawDistance: 0.3,
        antialiasing: false,
        pixelRatio: 0.5,
        textureQuality: 0.2,
        objectDetail: 0.3,
        maxVisibleObjects: 100
    }
};

export default qualityLevels;