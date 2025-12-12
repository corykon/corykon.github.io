class WorldManager {
    constructor() {
        this.platforms = [];
        this.clouds = [];
        this.scriptureBooks = [];
        
        // World properties
        this.groundY = 468;
        this.worldWidth = 9000; // Level width - extended for larger temple platform
        
        // Initialize world objects
        this.createPlatforms();
        this.createClouds();
        this.createScriptureBooks();
    }
    
    createPlatforms() {
        this.platforms = [
            // Main ground platforms - first half (original section)
            { x: 0, y: 468, width: 300, height: 135 },
            { x: 300, y: 468, width: 200, height: 135 },
            // GAP from 500-650 (150px pit)
            { x: 650, y: 468, width: 250, height: 135 },
            { x: 975, y: 468, width: 200, height: 135 },
            // GAP from 1175-1325 (150px pit)  
            { x: 1325, y: 468, width: 250, height: 135 },
            { x: 1650, y: 468, width: 200, height: 135 },
            { x: 1950, y: 468, width: 275, height: 135 },
            // GAP from 2225-2375 (150px pit)
            { x: 2375, y: 468, width: 250, height: 135 },
            { x: 2625, y: 468, width: 275, height: 135 },
            
            // Extended platforms - second half (armor testing section)
            { x: 3000, y: 468, width: 275, height: 135 },
            // GAP from 3275-3425 (150px pit)
            { x: 3425, y: 468, width: 200, height: 135 },
            { x: 3725, y: 468, width: 225, height: 135 },
            // GAP from 3950-4100 (150px pit)
            { x: 4100, y: 468, width: 200, height: 135 },
            { x: 4400, y: 468, width: 225, height: 135 },
            { x: 4725, y: 468, width: 200, height: 135 },
            // GAP from 4925-5075 (150px pit)
            { x: 5075, y: 468, width: 225, height: 135 },
            { x: 5400, y: 468, width: 200, height: 135 },
            { x: 5700, y: 468, width: 1400, height: 135 }, // Temple platform (4x larger for temple area)
            
            // Floating platforms - spread across both sections
            { x: 525, y: 375, width: 150, height: 30 },
            { x: 1125, y: 330, width: 180, height: 30 },
            { x: 1500, y: 360, width: 120, height: 30 },
            { x: 1800, y: 300, width: 150, height: 30 },
            { x: 2200, y: 350, width: 150, height: 30 },
            { x: 2800, y: 320, width: 120, height: 30 },
            { x: 3200, y: 380, width: 150, height: 30 },
            { x: 3600, y: 340, width: 180, height: 30 },
            { x: 4000, y: 310, width: 120, height: 30 },
            { x: 4400, y: 360, width: 150, height: 30 },
            { x: 4800, y: 330, width: 180, height: 30 },
            { x: 5200, y: 350, width: 120, height: 30 }
        ];
    }
    
    createClouds() {
        this.clouds = [
            { x: 200, y: 50, size: 60 },
            { x: 500, y: 80, size: 80 },
            { x: 800, y: 40, size: 50 },
            { x: 1200, y: 70, size: 70 },
            { x: 1600, y: 45, size: 65 },
            { x: 2000, y: 85, size: 55 },
            { x: 2400, y: 55, size: 75 },
            { x: 2800, y: 35, size: 60 },
            { x: 3200, y: 65, size: 70 },
            { x: 3600, y: 50, size: 55 },
            { x: 4000, y: 75, size: 80 },
            { x: 4400, y: 40, size: 65 },
            { x: 4800, y: 60, size: 70 },
            { x: 5200, y: 45, size: 60 },
            { x: 5600, y: 80, size: 75 }
        ];
    }
    
    createScriptureBooks() {
        this.scriptureBooks = [
            { x: 400, y: 415, width: 50, height: 50, collected: false, verse: "Faith" },
            { x: 1500, y: 305, width: 50, height: 50, collected: false, verse: "Truth" },
            { x: 2800, y: 265, width: 50, height: 50, collected: false, verse: "Righteousness" }
        ];
    }
    
    renderBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        // Draw simple sky blue background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(cameraX, 0, canvasWidth, canvasHeight);
    }
    
    renderClouds(ctx) {
        ctx.fillStyle = '#FFFFFF';
        this.clouds.forEach(cloud => {
            // Simple pixelated cloud design
            const cloudX = cloud.x;
            const cloudY = cloud.y;
            const size = cloud.size;
            
            // Main cloud body
            ctx.fillRect(cloudX, cloudY + size/4, size, size/2);
            ctx.fillRect(cloudX + size/4, cloudY, size/2, size);
            
            // Cloud bumps
            ctx.fillRect(cloudX + size/8, cloudY + size/8, size/4, size/4);
            ctx.fillRect(cloudX + size*5/8, cloudY + size/8, size/4, size/4);
            ctx.fillRect(cloudX + size/6, cloudY + size*5/8, size/3, size/4);
            ctx.fillRect(cloudX + size/2, cloudY + size*5/8, size/3, size/4);
        });
    }
    
    renderPlatforms(ctx) {
        this.platforms.forEach(platform => {
            // Draw dirt base (underneath) - lighter for better dog visibility
            ctx.fillStyle = '#D2B48C'; // Light tan/sandy brown for better contrast
            ctx.fillRect(platform.x, platform.y + 8, platform.width, platform.height - 8);
            
            // Add dirt texture/variation - lighter tones
            ctx.fillStyle = '#DEB887'; // Burlywood - lighter brown texture
            for (let i = 0; i < platform.width; i += 15) {
                for (let j = 15; j < platform.height - 8; j += 12) {
                    ctx.fillRect(platform.x + i, platform.y + 8 + j, 6, 4);
                    ctx.fillRect(platform.x + i + 8, platform.y + 8 + j + 6, 4, 3);
                }
            }
            
            // Draw grass top layer
            ctx.fillStyle = '#228B22'; // Forest green
            ctx.fillRect(platform.x, platform.y, platform.width, 8);
            
            // Add grass texture on top
            ctx.fillStyle = '#32CD32'; // Lime green grass blades
            for (let i = 0; i < platform.width; i += 10) {
                ctx.fillRect(platform.x + i, platform.y, 2, 5);
                ctx.fillRect(platform.x + i + 4, platform.y, 2, 8);
                ctx.fillRect(platform.x + i + 7, platform.y, 1, 6);
            }
        });
    }
    
    renderScriptureBooks(ctx, bomImage) {
        this.scriptureBooks.forEach(book => {
            if (!book.collected) {
                // Floating effect (simple up/down animation)
                const time = Date.now() * 0.002;
                const floatY = Math.sin(time + book.x * 0.01) * 2;
                
                ctx.save();
                ctx.translate(0, floatY);
                
                // Draw subtle glow behind scripture book
                const glowRadius = 30;
                const gradient = ctx.createRadialGradient(
                    book.x + book.width/2, book.y + book.height/2, 0,
                    book.x + book.width/2, book.y + book.height/2, glowRadius
                );
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)'); // Gold glow
                gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.1)');
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(book.x - glowRadius/2, book.y - glowRadius/2, 
                           book.width + glowRadius, book.height + glowRadius);
                
                // Draw Book of Mormon image if loaded, otherwise fallback to simple design
                if (bomImage.complete) {
                    ctx.drawImage(bomImage, book.x, book.y, book.width, book.height);
                } else {
                    // Fallback: Simple black book with gold cross
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(book.x, book.y, book.width, book.height);
                    
                    // Gold cross symbol on cover
                    ctx.fillStyle = '#FFD700';
                    const centerX = book.x + book.width / 2;
                    const centerY = book.y + book.height / 2;
                    // Vertical line of cross
                    ctx.fillRect(centerX - 1, book.y + 3, 2, book.height - 6);
                    // Horizontal line of cross
                    ctx.fillRect(book.x + 4, centerY - 1, book.width - 8, 2);
                }
                
                ctx.restore();
            }
        });
    }
    
    renderTemple(ctx, templeImage, castle) {
        // Draw prominent divine glow behind temple
        const glowRadius = 80; // Increased from 50 for larger glow
        const gradient = ctx.createRadialGradient(
            castle.x + castle.width/2, castle.y + castle.height/2, 0,
            castle.x + castle.width/2, castle.y + castle.height/2, glowRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)'); // Brighter white center
        gradient.addColorStop(0.2, 'rgba(255, 215, 0, 0.6)'); // Strong gold
        gradient.addColorStop(0.4, 'rgba(255, 215, 0, 0.4)'); // Medium gold
        gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.2)'); // Softer gold
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(castle.x - glowRadius/2, castle.y - glowRadius/2, 
                   castle.width + glowRadius, castle.height + glowRadius);
        
        if (templeImage.complete) {
            ctx.drawImage(templeImage, castle.x, castle.y, castle.width, castle.height);
        } else {
            // Fallback if image isn't loaded yet
            ctx.fillStyle = '#D4AF37'; // Gold color for temple
            ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        }
    }
    
    checkPlatformCollisions(entity) {
        let onGroundPlatform = false;
        
        // Check ground collision - but only if entity is on a platform AND close to ground level
        if (entity.y >= this.groundY && entity.y <= this.groundY + 10) {
            // Check if entity is horizontally on any ground-level platform
            for (let platform of this.platforms) {
                if (platform.y === this.groundY && 
                    entity.x + entity.width > platform.x && 
                    entity.x < platform.x + platform.width) {
                    onGroundPlatform = true;
                    break;
                }
            }
            
            if (onGroundPlatform) {
                entity.y = this.groundY;
                entity.velocityY = 0;
                entity.isGrounded = true;
                if (entity.isJumping !== undefined) {
                    entity.isJumping = false;
                }
            }
            // If not on a platform, let entity continue falling (into pit)
        }
        
        // Platform collisions for floating platforms
        this.platforms.forEach(platform => {
            // Check for horizontal overlap - more forgiving for edge landings
            const horizontalOverlap = entity.x < platform.x + platform.width + 5 && entity.x + entity.width > platform.x - 5;
            
            if (horizontalOverlap) {
                // Landing on top of platform (falling down onto it) - more forgiving edge detection
                if (entity.velocityY > 0 && 
                    entity.y <= platform.y && 
                    entity.y + entity.height >= platform.y &&
                    entity.y + entity.height <= platform.y + 15) { // Increased tolerance for landing
                    
                    entity.y = platform.y - entity.height;
                    entity.velocityY = 0;
                    entity.isGrounded = true;
                    if (entity.isJumping !== undefined) {
                        entity.isJumping = false;
                    }
                }
                // Side collision detection - only when entity is clearly at platform level (not landing on top)
                else if (entity.velocityY >= 0 && 
                         entity.y < platform.y + platform.height - 10 &&
                         entity.y + entity.height > platform.y + 15) {
                    
                    // Determine which side we're hitting
                    const entityCenterX = entity.x + entity.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    
                    if (entityCenterX < platformCenterX) {
                        // Hitting from the left - push entity left and block rightward movement
                        entity.x = platform.x - entity.width - 2;
                        if (entity.blockedRight !== undefined) entity.blockedRight = true;
                    } else {
                        // Hitting from the right - push entity right and block leftward movement
                        entity.x = platform.x + platform.width + 2;
                        if (entity.blockedLeft !== undefined) entity.blockedLeft = true;
                    }
                    
                    // Ensure entity is not grounded and falls immediately
                    entity.isGrounded = false;
                    if (entity.isJumping !== undefined) {
                        entity.isJumping = false;
                    }
                    
                    // Add downward velocity to ensure falling
                    if (entity.velocityY === 0) {
                        entity.velocityY = 1;
                    }
                }
                // When jumping up (velocityY < 0), allow passing through - no collision
            }
        });
        
        return onGroundPlatform;
    }
    
    reset() {
        // Reset scripture books
        this.scriptureBooks.forEach(book => {
            book.collected = false;
        });
    }
}