/**
 * WORLD MANAGER - LEVEL SYSTEM
 * 
 * Level 1 (Castle): 9,000px width - Original castle theme with grass platforms
 * Level 2 (Jungle): 18,000px width - Jungle theme with sunset effects, tree platforms, and branches
 * 
 * TO ADD NEW LEVELS:
 * 1. Add case in setLevelProperties() for world width and theme
 * 2. Add createLevelXPlatforms() method with platform layout
 * 3. Add createLevelXClouds() and createLevelXScriptureBooks() methods
 * 4. Update renderBackground() for new theme
 * 5. Add platform rendering in renderPlatform() switch statement
 * 6. Update setCastlePosition() in game-modular.js for temple position
 * 
 * Platform types: 'ground', 'floating', 'tree_platform', 'branch'
 */
class WorldManager {
    constructor(level = 1) {
        this.currentLevel = level;
        this.platforms = [];
        this.clouds = [];
        this.scriptureBooks = [];
        
        // World properties
        this.groundY = 468;
        this.setLevelProperties();
        
        // Initialize world objects
        this.createPlatforms();
        this.createClouds();
        this.createScriptureBooks();
    }
    
    setLevelProperties() {
        switch(this.currentLevel) {
            case 1:
                this.worldWidth = 9000; // Original castle level
                this.theme = 'castle';
                break;
            case 2:
                this.worldWidth = 18000; // Jungle level - 2x longer
                this.theme = 'jungle';
                break;
            default:
                this.worldWidth = 9000;
                this.theme = 'castle';
        }
    }
    
    createPlatforms() {
        if (this.currentLevel === 1) {
            this.createLevel1Platforms();
        } else if (this.currentLevel === 2) {
            this.createLevel2Platforms();
        }
    }
    
    createLevel1Platforms() {
        this.platforms = [
            // Main ground platforms - first half (original section)
            { x: 0, y: 468, width: 300, height: 135, type: 'ground' },
            { x: 300, y: 468, width: 200, height: 135, type: 'ground' },
            // GAP from 500-650 (150px pit)
            { x: 650, y: 468, width: 250, height: 135, type: 'ground' },
            { x: 975, y: 468, width: 200, height: 135, type: 'ground' },
            // GAP from 1175-1325 (150px pit)  
            { x: 1325, y: 468, width: 250, height: 135, type: 'ground' },
            { x: 1650, y: 468, width: 200, height: 135, type: 'ground' },
            { x: 1950, y: 468, width: 275, height: 135, type: 'ground' },
            // GAP from 2225-2375 (150px pit)
            { x: 2375, y: 468, width: 250, height: 135, type: 'ground' },
            { x: 2625, y: 468, width: 275, height: 135, type: 'ground' },
            
            // Extended platforms - second half (armor testing section)
            { x: 3000, y: 468, width: 275, height: 135, type: 'ground' },
            // GAP from 3275-3425 (150px pit)
            { x: 3425, y: 468, width: 200, height: 135, type: 'ground' },
            { x: 3725, y: 468, width: 225, height: 135, type: 'ground' },
            // GAP from 3950-4100 (150px pit)
            { x: 4100, y: 468, width: 200, height: 135, type: 'ground' },
            { x: 4400, y: 468, width: 225, height: 135, type: 'ground' },
            { x: 4725, y: 468, width: 200, height: 135, type: 'ground' },
            // GAP from 4925-5075 (150px pit)
            { x: 5075, y: 468, width: 225, height: 135, type: 'ground' },
            { x: 5700, y: 468, width: 1400, height: 135, type: 'ground' }, // Temple platform
            
            // Floating platforms
            { x: 525, y: 375, width: 150, height: 30, type: 'floating' },
            { x: 1125, y: 330, width: 180, height: 30, type: 'floating' },
            { x: 1500, y: 360, width: 120, height: 30, type: 'floating' },
            { x: 1800, y: 300, width: 150, height: 30, type: 'floating' },
            { x: 2200, y: 350, width: 150, height: 30, type: 'floating' },
            { x: 2800, y: 320, width: 120, height: 30, type: 'floating' },
            { x: 3200, y: 380, width: 150, height: 30, type: 'floating' },
            { x: 3600, y: 340, width: 180, height: 30, type: 'floating' },
            { x: 4000, y: 310, width: 120, height: 30, type: 'floating' },
            { x: 4400, y: 360, width: 150, height: 30, type: 'floating' },
            { x: 4800, y: 330, width: 180, height: 30, type: 'floating' },
            { x: 5200, y: 350, width: 280, height: 30, type: 'floating' }
        ];
    }
    
    createLevel2Platforms() {
        // JUNGLE LEVEL 2 LAYOUT
        // Features: Long flat sections for combat, floating tree platforms for variety,
        // Tree-top jumping sections with no ground below, temple clearing at end
        // Total length: ~18,000px (2x level 1)
        
        this.platforms = [
            // Starting ground section
            { x: 0, y: 468, width: 400, height: 135, type: 'ground' },
            { x: 400, y: 468, width: 500, height: 135, type: 'ground' }, // Long flat section
            
            // First floating block section for enemies
            { x: 1100, y: 380, width: 120, height: 30, type: 'tree_platform' },
            { x: 1350, y: 340, width: 120, height: 30, type: 'tree_platform' },
            { x: 1600, y: 300, width: 120, height: 30, type: 'tree_platform' },
            
            // Ground continues
            { x: 1900, y: 468, width: 600, height: 135, type: 'ground' }, // Another long flat
            
            // Tree-top jumping section (no ground below)
            { x: 2700, y: 360, width: 180, height: 25, type: 'branch' },
            { x: 3000, y: 320, width: 160, height: 25, type: 'branch' },
            { x: 3280, y: 280, width: 140, height: 25, type: 'branch' },
            { x: 3520, y: 240, width: 160, height: 25, type: 'branch' },
            { x: 3800, y: 200, width: 180, height: 25, type: 'branch' },
            { x: 4100, y: 260, width: 160, height: 25, type: 'branch' },
            { x: 4380, y: 320, width: 140, height: 25, type: 'branch' },
            { x: 4640, y: 380, width: 160, height: 25, type: 'branch' },
            
            // Landing back to ground
            { x: 4900, y: 468, width: 900, height: 135, type: 'ground' },
            
            // Mid-section with mixed platforms and floating blocks
            { x: 6000, y: 400, width: 100, height: 30, type: 'tree_platform' },
            { x: 6200, y: 360, width: 100, height: 30, type: 'tree_platform' },
            { x: 6400, y: 320, width: 100, height: 30, type: 'tree_platform' },
            { x: 6600, y: 468, width: 300, height: 135, type: 'ground' },
            
            // Another tree-top section
            { x: 7100, y: 340, width: 150, height: 25, type: 'branch' },
            { x: 7350, y: 300, width: 140, height: 25, type: 'branch' },
            { x: 7590, y: 260, width: 160, height: 25, type: 'branch' },
            { x: 7850, y: 300, width: 150, height: 25, type: 'branch' },
            { x: 8100, y: 340, width: 140, height: 25, type: 'branch' },
            { x: 8340, y: 380, width: 160, height: 25, type: 'branch' },
            
            // Final approach and more floating blocks
            { x: 8600, y: 468, width: 500, height: 135, type: 'ground' },
            { x: 9300, y: 400, width: 120, height: 30, type: 'tree_platform' },
            { x: 9500, y: 360, width: 120, height: 30, type: 'tree_platform' },
            { x: 9700, y: 320, width: 120, height: 30, type: 'tree_platform' },
            
            // Long ground section leading to temple
            { x: 10000, y: 468, width: 800, height: 135, type: 'ground' },
            
            // Additional floating elements for variety
            { x: 11000, y: 380, width: 200, height: 30, type: 'tree_platform' },
            { x: 11400, y: 380, width: 200, height: 30, type: 'tree_platform' },
            
            // More ground with gaps
            { x: 11700, y: 468, width: 300, height: 135, type: 'ground' },
            // GAP
            { x: 12200, y: 468, width: 400, height: 135, type: 'ground' },
            // GAP  
            { x: 12800, y: 468, width: 350, height: 135, type: 'ground' },
            
            // Final tree-top challenge before temple
            { x: 13350, y: 380, width: 140, height: 25, type: 'branch' },
            { x: 13580, y: 340, width: 130, height: 25, type: 'branch' },
            { x: 13800, y: 300, width: 150, height: 25, type: 'branch' },
            { x: 14050, y: 260, width: 140, height: 25, type: 'branch' },
            { x: 14280, y: 220, width: 160, height: 25, type: 'branch' },
            { x: 14540, y: 260, width: 150, height: 25, type: 'branch' },
            { x: 14790, y: 320, width: 140, height: 25, type: 'branch' },
            { x: 15030, y: 380, width: 160, height: 25, type: 'branch' },
            
            // Final ground section and temple clearing
            { x: 15300, y: 468, width: 1200, height: 135, type: 'ground' }, // Long approach
            { x: 16700, y: 468, width: 1300, height: 135, type: 'ground' }  // Temple platform (clearing)
        ];
    }
    
    createClouds() {
        if (this.currentLevel === 1) {
            this.createLevel1Clouds();
        } else if (this.currentLevel === 2) {
            this.createLevel2Clouds();
        }
    }
    
    createLevel1Clouds() {
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
    
    createLevel2Clouds() {
        this.clouds = [];
        // Generate clouds across the jungle level (darker, more atmospheric)
        for (let x = 300; x < this.worldWidth; x += 400 + Math.random() * 200) {
            this.clouds.push({
                x: x + (Math.random() - 0.5) * 100,
                y: 30 + Math.random() * 60,
                size: 50 + Math.random() * 40
            });
        }
    }
    
    createScriptureBooks() {
        if (this.currentLevel === 1) {
            this.createLevel1ScriptureBooks();
        } else if (this.currentLevel === 2) {
            this.createLevel2ScriptureBooks();
        }
    }
    
    createLevel1ScriptureBooks() {
        this.scriptureBooks = [
            { x: 400, y: 415, width: 50, height: 50, collected: false, verse: "Faith" },
            { x: 1500, y: 305, width: 50, height: 50, collected: false, verse: "Truth" },
            { x: 2800, y: 265, width: 50, height: 50, collected: false, verse: "Righteousness" }
        ];
    }
    
    createLevel2ScriptureBooks() {
        this.scriptureBooks = [
            // Early jungle books
            { x: 600, y: 415, width: 50, height: 50, collected: false, verse: "Peace" },
            { x: 1500, y: 150, width: 50, height: 50, collected: false, verse: "Salvation" }, // On tree platform
            
            // Mid-level books
            { x: 6100, y: 275, width: 50, height: 50, collected: false, verse: "Spirit" }, // Tree platform
            { x: 8200, y: 205, width: 50, height: 50, collected: false, verse: "Light" }, // High branch
            
            // Late jungle books
            { x: 10200, y: 415, width: 50, height: 50, collected: false, verse: "Hope" },
            { x: 15800, y: 415, width: 50, height: 50, collected: false, verse: "Joy" }  // Temple approach
        ];
    }
    
    renderBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        if (this.currentLevel === 1) {
            // Draw simple sky blue background for castle level
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(cameraX, 0, canvasWidth, canvasHeight);
        } else if (this.currentLevel === 2) {
            // Jungle sunset effect - changes as you progress
            this.renderJungleSunset(ctx, cameraX, canvasWidth, canvasHeight);
        }
    }
    
    renderJungleSunset(ctx, cameraX, canvasWidth, canvasHeight) {
        // Calculate progress through level (0 = start, 1 = end)
        const progress = Math.min(cameraX / (this.worldWidth - 800), 1);
        
        // Create gradient from day to sunset to night
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        
        if (progress < 0.3) {
            // Early jungle - late afternoon
            gradient.addColorStop(0, '#87CEEB');      // Light blue sky
            gradient.addColorStop(0.7, '#98D8E8');    // Lighter blue
            gradient.addColorStop(1, '#B0E0E6');      // Very light blue
        } else if (progress < 0.7) {
            // Mid jungle - sunset begins
            const sunsetProgress = (progress - 0.3) / 0.4;
            const orangeIntensity = Math.floor(255 * sunsetProgress);
            const blueReduction = Math.floor(50 * sunsetProgress);
            
            gradient.addColorStop(0, `rgb(${135 + orangeIntensity}, ${206 - blueReduction}, ${235 - orangeIntensity})`);
            gradient.addColorStop(0.4, `rgb(${255}, ${140 + (100 * (1 - sunsetProgress))}, ${100 + (135 * (1 - sunsetProgress))})`);
            gradient.addColorStop(0.8, `rgb(${255 - (50 * sunsetProgress)}, ${69 + (50 * (1 - sunsetProgress))}, ${0})`);
            gradient.addColorStop(1, `rgb(${139 - (50 * sunsetProgress)}, ${69 - (30 * sunsetProgress)}, ${19})`);
        } else {
            // Late jungle - evening/dusk
            const duskProgress = (progress - 0.7) / 0.3;
            const darkening = Math.floor(50 * duskProgress);
            
            gradient.addColorStop(0, `rgb(${139 - darkening}, ${69 - darkening}, ${139 - darkening})`);
            gradient.addColorStop(0.3, `rgb(${75 - (darkening * 0.5)}, ${0}, ${130 - darkening})`);
            gradient.addColorStop(0.7, `rgb(${25}, ${25}, ${112 - darkening})`);
            gradient.addColorStop(1, `rgb(${0}, ${0}, ${39 - (darkening * 0.3)})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(cameraX, 0, canvasWidth, canvasHeight);
        
        // Add sun/moon based on progress
        if (progress < 0.8) {
            this.renderSun(ctx, cameraX, canvasWidth, canvasHeight, progress);
        } else {
            this.renderMoon(ctx, cameraX, canvasWidth, canvasHeight, progress);
        }
    }
    
    renderSun(ctx, cameraX, canvasWidth, canvasHeight, progress) {
        // Sun position moves across sky as you progress
        const sunX = cameraX + (canvasWidth * 0.2) + (canvasWidth * 0.6 * progress);
        const sunY = 80 + (60 * progress); // Sun sets lower
        const sunRadius = 40 - (10 * progress); // Sun gets smaller as it sets
        
        // Sun color changes from yellow to orange to red
        let sunColor;
        if (progress < 0.5) {
            sunColor = '#FFD700'; // Gold
        } else if (progress < 0.7) {
            sunColor = '#FF8C00'; // Dark orange
        } else {
            sunColor = '#FF4500'; // Red orange
        }
        
        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderMoon(ctx, cameraX, canvasWidth, canvasHeight, progress) {
        // Moon appears in later part of level
        const moonX = cameraX + (canvasWidth * 0.7);
        const moonY = 70;
        const moonRadius = 25;
        
        ctx.fillStyle = '#F0F8FF';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
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
            this.renderPlatform(ctx, platform);
        });
    }
    
    renderPlatform(ctx, platform) {
        if (this.currentLevel === 1) {
            // Castle level - original grass platforms
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
        } else if (this.currentLevel === 2) {
            // Jungle level - different platform types
            switch(platform.type) {
                case 'ground':
                    // Jungle ground - darker earth with jungle grass
                    ctx.fillStyle = '#654321'; // Dark brown earth
                    ctx.fillRect(platform.x, platform.y + 6, platform.width, platform.height - 6);
                    
                    // Add jungle grass on top
                    ctx.fillStyle = '#006400'; // Dark green jungle grass
                    ctx.fillRect(platform.x, platform.y, platform.width, 6);
                    
                    // Add jungle grass texture
                    ctx.fillStyle = '#228B22';
                    for (let i = 0; i < platform.width; i += 8) {
                        ctx.fillRect(platform.x + i, platform.y, 3, 8);
                        ctx.fillRect(platform.x + i + 4, platform.y, 2, 10);
                    }
                    break;
                case 'tree_platform':
                    // Tree platform - wood texture
                    ctx.fillStyle = '#8B4513'; // Saddle brown
                    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                    // Add wood grain lines
                    ctx.strokeStyle = '#654321';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < platform.width; i += 12) {
                        ctx.beginPath();
                        ctx.moveTo(platform.x + i, platform.y);
                        ctx.lineTo(platform.x + i, platform.y + platform.height);
                        ctx.stroke();
                    }
                    break;
                case 'branch':
                    // Tree branch - organic shape
                    ctx.fillStyle = '#A0522D'; // Sienna brown
                    ctx.fillRect(platform.x, platform.y + 3, platform.width, platform.height - 6);
                    // Add branch ends (slightly wider)
                    ctx.fillRect(platform.x - 2, platform.y, 4, platform.height);
                    ctx.fillRect(platform.x + platform.width - 2, platform.y, 4, platform.height);
                    // Add bark texture
                    ctx.fillStyle = '#8B4513';
                    for (let i = 0; i < platform.width; i += 20) {
                        ctx.fillRect(platform.x + i, platform.y + 2, 3, platform.height - 4);
                    }
                    break;
                default:
                    // Default to ground style
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                    break;
            }
        }
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
    setLevel(level) {
        this.currentLevel = level;
        this.setLevelProperties();
        this.createPlatforms();
        this.createClouds();
        this.createScriptureBooks();
    }}