class BackgroundManager {
    constructor() {
        this.layers = [];
        this.loaded = false;
        this.images = {};
        
        // Load background images
        this.loadImages();
        
        // Initialize parallax layers (from back to front)
        this.initializeLayers();
    }
    
    loadImages() {
        const imageUrls = {
            cloud1: 'images/cloud1.svg',
            cloud2: 'images/cloud2.svg'
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
        // Sky gradient (rendered with CSS/canvas)
        
        // High clouds (subtle movement)
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.03, // More noticeable but still gentle drift
            y: 50,
            spacing: 500,
            scale: 0.7,
            opacity: 0.5,
            elements: []
        });
        
        // Mid-level clouds (gentle movement)
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.05, // More gentle cloud movement
            y: 120,
            spacing: 450,
            scale: 0.9,
            opacity: 0.7,
            elements: []
        });
        
        // Lower clouds (more noticeable movement)
        this.layers.push({
            type: 'clouds',
            images: ['cloud1', 'cloud2'],
            speed: 0.07, // More noticeable but still pleasant cloud movement
            y: 200,
            spacing: 400,
            scale: 1.1,
            opacity: 0.6,
            elements: []
        });
        
        // Initialize elements for each layer
        this.layers.forEach(layer => {
            this.initializeLayerElements(layer);
        });
    }
    
    initializeLayerElements(layer) {
        // Create elements across the world width plus extra for seamless scrolling
        const worldWidth = 6000; // Game world width
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
        
        // Render sky gradient background
        this.renderSky(ctx);
        
        // Render each layer from back to front
        this.layers.forEach(layer => {
            this.renderLayer(ctx, layer, cameraX);
        });
    }
    
    renderSky(ctx) {
        // Create beautiful blue sky gradient across entire background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        skyGradient.addColorStop(0, '#87CEEB'); // Sky blue at top
        skyGradient.addColorStop(0.4, '#B0E0E6'); // Powder blue
        skyGradient.addColorStop(0.8, '#E6F3FF'); // Light blue 
        skyGradient.addColorStop(1, '#F0F8FF'); // Alice blue at bottom
        
        // Render beautiful sky across entire canvas
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
}