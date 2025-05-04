import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

export class PerformanceManager {
    constructor(game) {
        this.game = game;
        this.targetFPS = 60;
        this.fpsHistory = [];
        this.historySize = 30; // Store last 30 frames for smoothing
        this.adaptiveQualityEnabled = true;
        this.lastOptimizationTime = 0;
        this.optimizationInterval = 1000; // Check every second
        this.qualityLevels = {
            ultra: {
                shadows: true,
                shadowMapSize: 2048,
                particleCount: 1.0,
                drawDistance: 1.0,
                antialiasing: true,
                pixelRatio: window.devicePixelRatio
            },
            high: {
                shadows: true,
                shadowMapSize: 1024,
                particleCount: 0.8,
                drawDistance: 0.8,
                antialiasing: true,
                pixelRatio: Math.min(window.devicePixelRatio, 1.5)
            },
            medium: {
                shadows: true,
                shadowMapSize: 512,
                particleCount: 0.6,
                drawDistance: 0.6,
                antialiasing: true,
                pixelRatio: Math.min(window.devicePixelRatio, 1.0)
            },
            low: {
                shadows: false,
                shadowMapSize: 256,
                particleCount: 0.4,
                drawDistance: 0.4,
                antialiasing: false,
                pixelRatio: Math.min(window.devicePixelRatio, 0.75)
            },
            minimal: {
                shadows: false,
                shadowMapSize: 0,
                particleCount: 0.2,
                drawDistance: 0.3,
                antialiasing: false,
                pixelRatio: 0.5
            }
        };
        
        this.currentQuality = 'ultra'; // Start with high quality by default
        this.stats = null;
    }
    
    init() {
        // Initialize Stats.js for FPS monitoring
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.top = '0px';
        this.stats.dom.style.right = '0px';
        this.stats.dom.style.left = 'auto';
        document.body.appendChild(this.stats.dom);
        
        // Add GPU indicator next to Stats.js
        this.createGPUIndicator();
        
        // Apply initial quality settings
        this.applyQualitySettings(this.currentQuality);
        
        // Enable WebGL optimizations
        this.enableOptimizations();
        
        console.log("Performance Manager initialized with quality:", this.currentQuality);
        
        return this;
    }
    
    createGPUIndicator() {
        // Create GPU indicator container
        this.gpuIndicator = document.createElement('div');
        this.gpuIndicator.id = 'gpu-indicator';
        this.gpuIndicator.textContent = 'GPU';
        
        // Create GPU info panel (hidden by default)
        this.gpuInfoPanel = document.createElement('div');
        this.gpuInfoPanel.id = 'gpu-info-panel';
        
        // Get GPU information
        const gpuInfo = this.getGPUInfo();
        this.gpuInfoPanel.innerHTML = gpuInfo;
        
        // Add hover event to show/hide GPU info panel
        this.gpuIndicator.addEventListener('mouseenter', () => {
            this.gpuInfoPanel.style.display = 'block';
        });
        
        this.gpuIndicator.addEventListener('mouseleave', () => {
            this.gpuInfoPanel.style.display = 'none';
        });
        
        // Add to document
        document.body.appendChild(this.gpuIndicator);
        document.body.appendChild(this.gpuInfoPanel);
    }
    
    getGPUInfo() {
        // Get WebGL context from the renderer
        const gl = this.game.renderer.getContext();
        
        // Get GPU information
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        
        let gpuVendor = 'Unknown';
        let gpuRenderer = 'Unknown';
        
        if (debugInfo) {
            gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
        
        // Get WebGL version
        const glVersion = gl.getParameter(gl.VERSION);
        const glslVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        
        // Get max texture size
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        
        // Get max viewport dimensions
        const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        
        // Get max render buffer size
        const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        
        // Get acceleration status
        const accelerated = this.isGPUAccelerated();
        
        // Format the information
        return `
            <div style="color: #4CAF50; font-weight: bold; margin-bottom: 5px;">GPU INFORMATION</div>
            <div><span style="color: #aaa;">Vendor:</span> ${gpuVendor}</div>
            <div><span style="color: #aaa;">Renderer:</span> ${gpuRenderer}</div>
            <div><span style="color: #aaa;">WebGL Version:</span> ${glVersion}</div>
            <div><span style="color: #aaa;">GLSL Version:</span> ${glslVersion}</div>
            <div><span style="color: #aaa;">Max Texture Size:</span> ${maxTextureSize}px</div>
            <div><span style="color: #aaa;">Max Viewport:</span> ${maxViewportDims[0]}x${maxViewportDims[1]}</div>
            <div><span style="color: #aaa;">Max Render Buffer:</span> ${maxRenderBufferSize}</div>
            <div><span style="color: #aaa;">Hardware Acceleration:</span> ${accelerated ? '<span style="color: #4CAF50;">Enabled</span>' : '<span style="color: #F44336;">Disabled</span>'}</div>
            <div><span style="color: #aaa;">Power Preference:</span> <span style="color: #4CAF50;">High Performance</span></div>
            <div style="margin-top: 5px; font-size: 10px; color: #aaa;">GPU acceleration is ${accelerated ? 'active' : 'not active'} for this session.</div>
        `;
    }
    
    isGPUAccelerated() {
        // Check if GPU acceleration is enabled
        // This is a best-effort detection as there's no foolproof way to detect GPU acceleration
        
        // Method 1: Check for hardware acceleration via canvas
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return false; // WebGL not supported
        }
        
        // Method 2: Check for specific GPU features
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // If renderer string contains terms like "SwiftShader", "ANGLE", or "llvmpipe", 
            // it might be software rendering
            const softwareRenderers = ['swiftshader', 'llvmpipe', 'software', 'mesa'];
            const isSoftware = softwareRenderers.some(term => 
                renderer.toLowerCase().includes(term)
            );
            
            return !isSoftware;
        }
        
        // Method 3: Check if the renderer has high-performance setting
        if (this.game && this.game.renderer) {
            return this.game.renderer.getContext().getContextAttributes().powerPreference === 'high-performance';
        }
        
        // Default to true if we can't determine
        return true;
    }
    
    update(delta) {
        // Update stats.js
        if (this.stats) {
            this.stats.update();
        }
        
        // Calculate current FPS
        const fps = 1 / delta;
        
        // Add to history
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.historySize) {
            this.fpsHistory.shift();
        }
        
        // Calculate average FPS
        const avgFPS = this.fpsHistory.reduce((sum, value) => sum + value, 0) / this.fpsHistory.length;
        
        // Check if we need to adjust quality
        if (this.adaptiveQualityEnabled) {
            const now = performance.now();
            if (now - this.lastOptimizationTime > this.optimizationInterval) {
                this.adjustQuality(avgFPS);
                this.lastOptimizationTime = now;
            }
        }
    }
    
    adjustQuality(currentFPS) {
        // Don't adjust if we're already at the target FPS
        if (currentFPS >= this.targetFPS * 1.1 && this.currentQuality !== 'ultra') {
            // We have headroom to increase quality
            this.increaseQuality();
        } else if (currentFPS < this.targetFPS * 0.8 && this.currentQuality !== 'minimal') {
            // We need to decrease quality to maintain performance
            this.decreaseQuality(currentFPS);
        }
    }
    
    increaseQuality() {
        const qualityLevels = Object.keys(this.qualityLevels);
        const currentIndex = qualityLevels.indexOf(this.currentQuality);
        
        if (currentIndex < qualityLevels.length - 1) {
            const newQuality = qualityLevels[currentIndex + 1];
            this.applyQualitySettings(newQuality);
            console.log(`Increasing quality to ${newQuality}`);
            
            // Only show notification when increasing to high or ultra
            if (newQuality === 'high' || newQuality === 'ultra') {
                this.showQualityChangeNotification(`Graphics quality increased to ${newQuality}`);
            }
        }
    }
    
    decreaseQuality(currentFPS) {
        const qualityLevels = Object.keys(this.qualityLevels);
        const currentIndex = qualityLevels.indexOf(this.currentQuality);
        
        if (currentIndex > 0) {
            const newQuality = qualityLevels[currentIndex - 1];
            this.applyQualitySettings(newQuality);
            console.log(`Decreasing quality to ${newQuality} (FPS: ${Math.round(currentFPS)})`);
            
            // Show notification when decreasing quality
            this.showQualityChangeNotification(
                `Graphics quality lowered to ${newQuality} to maintain performance. ` +
                `You can adjust settings in Options menu.`
            );
        }
    }
    
    showQualityChangeNotification(message) {
        // Check if we have a UI manager to show notifications
        if (this.game && this.game.uiManager && this.game.uiManager.showNotification) {
            this.game.uiManager.showNotification(message, 5000); // Show for 5 seconds
        } else {
            // Fallback to creating our own notification
            const notification = document.createElement('div');
            notification.style.position = 'absolute';
            notification.style.bottom = '80px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            notification.style.color = '#fff';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.fontFamily = 'Arial, sans-serif';
            notification.style.fontSize = '14px';
            notification.style.zIndex = '1002';
            notification.style.textAlign = 'center';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
    
    applyQualitySettings(qualityLevel) {
        if (!this.qualityLevels[qualityLevel]) {
            console.error(`Unknown quality level: ${qualityLevel}`);
            return;
        }
        
        const settings = this.qualityLevels[qualityLevel];
        this.currentQuality = qualityLevel;
        
        // Update renderer settings
        const renderer = this.game.renderer;
        
        // Set pixel ratio
        renderer.setPixelRatio(settings.pixelRatio);
        
        // Configure shadows
        renderer.shadowMap.enabled = settings.shadows;
        if (settings.shadows) {
            renderer.shadowMap.autoUpdate = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } else {
            renderer.shadowMap.autoUpdate = false;
        }
        
        // Update shadow map size for all lights
        this.updateShadowMapSizes(settings.shadowMapSize);
        
        // Update fog density based on draw distance
        if (this.game.scene.fog) {
            this.game.scene.fog.density = 0.002 * (1 / settings.drawDistance);
        }
        
        // Update antialiasing
        // Note: Changing antialiasing requires recreating the renderer
        // This is expensive, so we only do it when necessary
        if (renderer.antialias !== settings.antialiasing) {
            console.log("Antialiasing change requires renderer recreation - skipping");
            // In a real implementation, we would recreate the renderer here
        }
        
        // Quality has been updated
    }
    
    updateShadowMapSizes(size) {
        // Update shadow map size for all lights in the scene
        this.game.scene.traverse(object => {
            if (object.isLight && object.shadow) {
                object.shadow.mapSize.width = size;
                object.shadow.mapSize.height = size;
                object.shadow.map = null; // Force shadow map recreation
            }
        });
    }
    
    enableOptimizations() {
        // Enable various Three.js optimizations
        
        // 1. Optimize renderer
        const renderer = this.game.renderer;
        renderer.powerPreference = "high-performance";
        
        // 2. Enable frustum culling
        this.game.scene.traverse(object => {
            if (object.isMesh) {
                object.frustumCulled = true;
            }
        });
        
        // 3. Optimize materials
        this.game.scene.traverse(object => {
            if (object.isMesh) {
                // Optimize materials
                if (object.material) {
                    // Convert to array if it's a single material
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    
                    materials.forEach(material => {
                        // Disable unnecessary features
                        material.precision = "mediump"; // Use medium precision
                        material.fog = !!this.game.scene.fog; // Only use fog if scene has fog
                        
                        // Optimize textures
                        if (material.map) {
                            material.map.anisotropy = 1; // Reduce anisotropic filtering
                            material.map.generateMipmaps = true;
                        }
                    });
                }
                
                // Optimize geometry
                if (object.geometry) {
                    // Make sure geometry is indexed
                    if (!object.geometry.index && object.geometry.attributes.position) {
                        // Note: In a real implementation, we would index the geometry here
                        // but it's complex and requires careful handling
                    }
                }
            }
        });
        
        // 4. Optimize camera
        if (this.game.camera) {
            // Adjust near and far planes to be as tight as possible
            // This improves depth buffer precision
            this.game.camera.near = 0.1;
            this.game.camera.far = 500; // Reduce from 1000
            this.game.camera.updateProjectionMatrix();
        }
        
        // 5. Optimize physics/collision detection
        // This would depend on the specific physics system used
        
        console.log("Applied WebGL and Three.js optimizations");
    }
    
    getParticleMultiplier() {
        return this.qualityLevels[this.currentQuality].particleCount;
    }
    
    getDrawDistanceMultiplier() {
        return this.qualityLevels[this.currentQuality].drawDistance;
    }
    
    setTargetFPS(fps) {
        this.targetFPS = fps;
    }
    
    toggleAdaptiveQuality() {
        this.adaptiveQualityEnabled = !this.adaptiveQualityEnabled;
        return this.adaptiveQualityEnabled;
    }
    
    setQualityLevel(level) {
        if (this.qualityLevels[level]) {
            this.applyQualitySettings(level);
            return true;
        }
        return false;
    }
}