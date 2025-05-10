/**
 * Renderer configuration for different quality levels
 * These settings are used by the PerformanceManager to adjust rendering quality
 */
export const RENDER_CONFIG = {
    // Ultra quality - for high-end devices
    ultra: {
        // WebGLRenderer initialization options
        init: {
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'highp',
            stencil: false,
            logarithmicDepthBuffer: true,
            depth: true,
            alpha: false
        },
        // Post-initialization settings
        settings: {
            pixelRatio: window.devicePixelRatio,
            shadowMapEnabled: true,
            shadowMapType: 'PCFSoftShadowMap', // Better shadow quality
            outputColorSpace: 'SRGBColorSpace'
        }
    },
    
    // High quality - for good devices
    high: {
        init: {
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'highp',
            stencil: false,
            logarithmicDepthBuffer: false,
            depth: true,
            alpha: false
        },
        settings: {
            pixelRatio: Math.min(window.devicePixelRatio, 1.5),
            shadowMapEnabled: true,
            shadowMapType: 'PCFShadowMap',
            outputColorSpace: 'SRGBColorSpace'
        }
    },
    
    // Medium quality - for average devices
    medium: {
        init: {
            antialias: false,
            powerPreference: 'default',
            precision: 'mediump',
            stencil: false,
            logarithmicDepthBuffer: false,
            depth: true,
            alpha: false
        },
        settings: {
            pixelRatio: Math.min(window.devicePixelRatio, 1.0),
            shadowMapEnabled: true,
            shadowMapType: 'PCFShadowMap',
            outputColorSpace: 'SRGBColorSpace'
        }
    },
    
    // Low quality - for lower-end devices
    low: {
        init: {
            antialias: false,
            powerPreference: 'default',
            precision: 'mediump',
            stencil: false,
            logarithmicDepthBuffer: false,
            depth: true,
            alpha: false
        },
        settings: {
            pixelRatio: Math.min(window.devicePixelRatio, 0.75),
            shadowMapEnabled: true,
            shadowMapType: 'BasicShadowMap',
            outputColorSpace: 'SRGBColorSpace'
        }
    },
    
    // Minimal quality - for very low-end devices
    minimal: {
        init: {
            antialias: false,
            powerPreference: 'default',
            precision: 'lowp',
            stencil: false,
            logarithmicDepthBuffer: false,
            depth: true,
            alpha: false
        },
        settings: {
            pixelRatio: 0.5,
            shadowMapEnabled: false,
            shadowMapType: 'BasicShadowMap',
            outputColorSpace: 'SRGBColorSpace'
        }
    }
};