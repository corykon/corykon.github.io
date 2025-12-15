class BackgroundManager {
    constructor(level = 1) {
        this.currentLevel = level;
        this.layers = [];
        this.loaded = false;
        this.images = {};
        this.sunsetStartTime = null; // Track sunset start time
        
        // Load background images
        this.loadImages();
        
        // Initialize parallax layers (from back to front)
        this.initializeLayers();
    }
    
    loadImages() {
        const imageUrls = {
            cloud1: 'images/cloud1.png',
            cloud2: 'images/cloud2.png',
            cloud3: 'images/cloud3.png',
        };
        
        let loadedCount = 0;
        const totalImages = Object.keys(imageUrls).length;
        
        Object.keys(imageUrls).forEach(key => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.loaded = true;
                }
            };
            img.src = imageUrls[key];
            this.images[key] = img;
        });
    }
    
    initializeLayers() {
        this.layers = []; // Clear existing layers
        
        if (this.currentLevel === 1) {
            this.createCastleLayers();
        } else if (this.currentLevel === 2) {
            this.createJungleLayers();
        }
        
        // Initialize elements for each layer
        this.layers.forEach(layer => {
            this.initializeLayerElements(layer);
        });
    }
    
    createCastleLayers() {
        // High clouds (subtle movement)
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.03,
            y: 50,
            spacing: 900,
            scale: 0.105,
            opacity: 0.5,
            elements: []
        });
        
        // Mid-level clouds (gentle movement)
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.05,
            y: 120,
            spacing: 800,
            scale: 0.135,
            opacity: 0.7,
            elements: []
        });
        
        // Lower clouds (more noticeable movement)
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.07,
            y: 200,
            spacing: 750,
            scale: 0.165,
            opacity: 0.6,
            elements: []
        });
    }
    
    createJungleLayers() {
        // Jungle has fewer, more atmospheric clouds
        // High atmospheric clouds
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.02, // Slower, more mysterious
            y: 40,
            spacing: 780,
            scale: 0.09,
            opacity: 0.3,
            elements: []
        });
        
        // Mid-level evening clouds  
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.04,
            y: 140,
            spacing: 650,
            scale: 0.12,
            opacity: 0.4,
            elements: []
        });
    }
    
    initializeLayerElements(layer) {
        // Create elements across the world width plus extra for seamless scrolling
        let worldWidth = 9000; // Default castle level width
        if (this.currentLevel === 2) {
            worldWidth = 18000; // Jungle level width
        }
        const extraWidth = 1000; // Extra for smooth scrolling
        
        for (let x = -extraWidth; x < worldWidth + extraWidth; x += layer.spacing) {
            const imageKey = layer.images[Math.floor(Math.random() * layer.images.length)];
            layer.elements.push({
                x: x + (Math.random() - 0.5) * 100, // Add some random variation
                imageKey: imageKey
            });
        }
    }
    
    render(ctx, cameraX) {
        if (!this.loaded) return;
        
        // Render sky gradient background with camera position for sunset effect
        this.renderSky(ctx, cameraX);
        
        // Render each layer from back to front
        this.layers.forEach(layer => {
            this.renderLayer(ctx, layer, cameraX);
        });
    }
    
    renderSky(ctx, cameraX = 0) {
        if (this.currentLevel === 1) {
            // Castle level - blue sky gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            skyGradient.addColorStop(0, '#87CEEB'); // Sky blue at top
            skyGradient.addColorStop(0.4, '#B0E0E6'); // Powder blue
            skyGradient.addColorStop(0.8, '#E6F3FF'); // Light blue 
            skyGradient.addColorStop(1, '#F0F8FF'); // Alice blue at bottom
            
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (this.currentLevel === 2) {
            // Jungle level - sunset to night effect
            this.renderJungleSunset(ctx, cameraX, ctx.canvas.width, ctx.canvas.height);
        } else {
            // Fallback - render dark night background to avoid blue flashes
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
    
    renderJungleSunset(ctx, cameraX, canvasWidth, canvasHeight) {
        // Ensure we have valid canvas dimensions
        if (!canvasWidth || !canvasHeight) return;
        
        // Calculate progress based on elapsed time (0 = start, 1 = full cycle)
        if (!this.sunsetStartTime) {
            this.sunsetStartTime = Date.now();
        }
        const sunsetDuration = 120000; // 2 minutes for full sunset cycle
        const elapsedTime = Date.now() - this.sunsetStartTime;
        const progress = Math.min(elapsedTime / sunsetDuration, 1);
        
        // Create base canvas for blending
        ctx.save();
        
        // Phase 1: Early sunset (0-20%) - sun setting
        const crossfade = 0.03; // 3% crossfade duration
        const phase1Alpha = progress <= 0.2 ? 1 : 
            progress <= 0.2 + crossfade ? 1 - ((progress - 0.2) / crossfade) : 0;
        if (phase1Alpha > 0) {
            ctx.globalAlpha = phase1Alpha;
            const gradient1 = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient1.addColorStop(0, '#FF6B35');      // Orange sky
            gradient1.addColorStop(0.3, '#F7931E');    // Deep orange
            gradient1.addColorStop(0.7, '#FF4500');    // Red orange
            gradient1.addColorStop(1, '#8B4513');      // Saddle brown
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        // Phase 2: Deep sunset (20-25%) - twilight
        const phase2Alpha = progress < 0.2 - crossfade ? 0 :
            progress < 0.2 ? (progress - (0.2 - crossfade)) / crossfade :
            progress <= 0.25 ? 1 :
            progress <= 0.25 + crossfade ? 1 - ((progress - 0.25) / crossfade) : 0;
        if (phase2Alpha > 0) {
            ctx.globalAlpha = phase2Alpha;
            const gradient2 = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient2.addColorStop(0, '#8B008B');      // Dark magenta
            gradient2.addColorStop(0.3, '#4B0082');    // Indigo
            gradient2.addColorStop(0.7, '#2F1B69');    // Dark slate blue
            gradient2.addColorStop(1, '#191970');      // Midnight blue
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        // Phase 3: Night (25-100%) - moon rising
        const phase3Alpha = progress < 0.25 - crossfade ? 0 :
            progress < 0.25 ? (progress - (0.25 - crossfade)) / crossfade : 1;
        if (phase3Alpha > 0) {
            ctx.globalAlpha = phase3Alpha;
            const gradient3 = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient3.addColorStop(0, '#1a1a2e');      // Very dark blue
            gradient3.addColorStop(0.3, '#16213e');    // Dark navy
            gradient3.addColorStop(0.7, '#0f0f23');    // Almost black
            gradient3.addColorStop(1, '#0a0a0a');      // Near black
            ctx.fillStyle = gradient3;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        ctx.restore();
        
        // Sun only during phase 1 (0-20%)
        if (progress <= 0.2) {
            this.renderSun(ctx, canvasWidth, canvasHeight, progress, cameraX);
        }
        
        // Moon only during phase 3 (25-100%)
        if (progress >= 0.25) {
            this.renderMoon(ctx, canvasWidth, canvasHeight, progress, cameraX);
        }
    }
    
    renderSun(ctx, canvasWidth, canvasHeight, progress, cameraX) {
        // Sun moves top to bottom during phase 1 (0-20%) with natural and parallax movement
        const phase1Progress = progress / 0.2; // Convert to 0-1 range for phase 1
        
        // Camera parallax (much slower than clouds since sun is far away)
        const parallaxOffset = cameraX * 0.1; // More noticeable right-to-left movement as camera moves
        
        // Sun position with only right-to-left parallax movement
        const sunX = canvasWidth * 0.7 - parallaxOffset;
        
        const sunY = -50 + ((canvasHeight + 150) * phase1Progress); // Sun moves from above screen to below screen
        const sunRadius = Math.max(40, 90 - (30 * phase1Progress)); // Sun twice as big: 90px → 40px
        
        // Smooth sun color transition
        let sunColor;
        if (progress < 0.3) {
            // Bright yellow/gold phase
            const t = progress / 0.3;
            sunColor = `rgb(${255}, ${Math.floor(215 - (75 * t))}, ${Math.floor(40 * (1 - t))})`;
        } else if (progress < 0.6) {
            // Orange to red phase
            const t = (progress - 0.3) / 0.3;
            sunColor = `rgb(${255 - Math.floor(35 * t)}, ${Math.floor(140 - (120 * t))}, ${0})`;
        } else {
            // Deep red/crimson phase
            const t = (progress - 0.6) / 0.2;
            sunColor = `rgb(${220 - Math.floor(100 * t)}, ${20 - Math.floor(15 * t)}, ${60 - Math.floor(40 * t)})`;
        }
        
        // Add atmospheric glow that gets stronger as sun sets
        const glowSize = 15 + (25 * progress);
        ctx.shadowColor = sunColor;
        ctx.shadowBlur = glowSize;
        
        // Add larger outer glow for atmosphere
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius + glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Render main sun
        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
    }
    
    renderMoon(ctx, canvasWidth, canvasHeight, progress, cameraX) {
        // Moon moves vertically from bottom to top 10% and back during phase 3 (25-100%)
        const phase3Progress = (progress - 0.25) / 0.75; // Convert to 0-1 range for phase 3
        
        // Camera parallax (much slower than clouds since moon is far away)
        const parallaxOffset = cameraX * 0.03; // Right-to-left movement as camera moves
        
        // Fixed horizontal position with only parallax movement
        const moonX = canvasWidth * 0.7 - parallaxOffset; // Fixed at 30% screen width minus parallax
        
        // Vertical arc: bottom → top 10% → bottom
        const arcHeight = Math.sin(phase3Progress * Math.PI); // Creates arc from 0 to 1 to 0
        const moonY = canvasHeight * (1.0 - (0.9 * arcHeight)); // Arcs from bottom (100%) to top 10% and back
        
        const moonRadius = 60 + (14 * phase3Progress); // Moon twice as large: 60px base, grows to 74px
        
        // Calculate fade in/out based on screen position
        let moonAlpha = 1;
        if (phase3Progress < 0.15) {
            // Fade in during first 15% of phase 3
            moonAlpha = phase3Progress / 0.15;
        } else if (phase3Progress > 0.85) {
            // Fade out during last 15% of phase 3
            moonAlpha = (1 - phase3Progress) / 0.15;
        }
        
        // Add glow effect for moon that gets stronger as it rises
        const glowStrength = 5 + (8 * phase3Progress); // Reduced glow strength
        ctx.shadowColor = '#E6E6FA';
        ctx.shadowBlur = glowStrength;
        
        // Outer glow
        ctx.save();
        ctx.globalAlpha = 0.15 * moonAlpha; // Dimmer glow with fade
        ctx.fillStyle = '#E6E6FA';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius + glowStrength, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Main moon
        ctx.save();
        ctx.globalAlpha = moonAlpha; // Apply fade to main moon
        ctx.fillStyle = '#F5F5DC'; // Beige moon color
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0; // Reset shadow
    }
    
    renderLayer(ctx, layer, cameraX) {
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        
        layer.elements.forEach(element => {
            const img = this.images[element.imageKey];
            if (!img) return;
            
            // Calculate parallax position
            const parallaxX = element.x - (cameraX * layer.speed);
            const screenX = parallaxX - cameraX;
            
            // Only render if on screen (with some margin)
            if (screenX > -img.width * layer.scale && screenX < ctx.canvas.width + img.width * layer.scale) {
                const width = img.width * layer.scale;
                const height = img.height * layer.scale;
                
                ctx.drawImage(
                    img,
                    screenX,
                    layer.y,
                    width,
                    height
                );
            }
        });
        
        ctx.restore();
    }
    
    // Add more elements dynamically if needed (for very long gameplay)
    updateElements(cameraX) {
        this.layers.forEach(layer => {
            const rightmostElement = Math.max(...layer.elements.map(el => el.x));
            const leftmostElement = Math.min(...layer.elements.map(el => el.x));
            
            // Add elements to the right if camera is approaching the end
            if (rightmostElement < cameraX + 2000) {
                for (let i = 0; i < 3; i++) {
                    const imageKey = layer.images[Math.floor(Math.random() * layer.images.length)];
                    layer.elements.push({
                        x: rightmostElement + layer.spacing + (i * layer.spacing) + (Math.random() - 0.5) * 100,
                        imageKey: imageKey
                    });
                }
            }
            
            // Remove elements that are far behind the camera
            layer.elements = layer.elements.filter(el => el.x > cameraX - 1000);
        });
    }
    
    reset() {
        // Reset all layers
        this.layers.forEach(layer => {
            layer.elements = [];
            this.initializeLayerElements(layer);
        });
    }
    
    setLevel(level) {
        this.currentLevel = level;
        this.initializeLayers();
        // Reset sunset timer when changing levels
        this.sunsetStartTime = null;
    }
}