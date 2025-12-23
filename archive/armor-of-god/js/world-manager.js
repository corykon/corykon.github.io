/**
 * WORLD MANAGER - LEVEL SYSTEM
 * 
 * Level 1 (Castle): 9,000px width - Original castle theme with grass platforms
 * Level 2 (Jungle): 18,000px width - Jungle theme with sunset effects, tree platforms, and branches
 * Level 3 (Mountains): 15,000px width - Mountain theme with rocky platforms, vertical climbing sections, and inclines
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
        this.hearts = []; // Health restoration items
        
        // World properties
        this.groundY = 468;
        this.setLevelProperties();
        
        // Initialize world objects
        this.createPlatforms();
        this.createClouds();
        this.createScriptureBooks();
        this.createHearts();
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
            case 3:
                this.worldWidth = 15000; // Mountain level
                this.theme = 'mountains';
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
        } else if (this.currentLevel === 3) {
            this.createLevel3Platforms();
        }
    }
    
    createLevel1Platforms() {
        this.platforms = [
            // Main ground platforms - first half (original section)
            { x: 0, y: 468, width: 300, height: 135, type: 'ground' },
            { x: 300, y: 468, width: 700, height: 135, type: 'ground' },
            // GAP from 1175-1325 (150px pit)  
            { x: 1325, y: 468, width: 525, height: 135, type: 'ground' },
            { x: 1950, y: 468, width: 275, height: 135, type: 'ground' },
            // GAP from 2225-2375 (150px pit)
            { x: 2375, y: 468, width: 250, height: 135, type: 'ground' },
            { x: 2625, y: 468, width: 675, height: 135, type: 'ground' },
            // GAP from 3275-3425 (150px pit)
            { x: 3425, y: 468, width: 825, height: 135, type: 'ground' },
            { x: 4400, y: 468, width: 225, height: 135, type: 'ground' },
            { x: 4725, y: 468, width: 200, height: 135, type: 'ground' },
            // GAP from 4925-5075 (150px pit)
            { x: 5075, y: 468, width: 225, height: 135, type: 'ground' },
            { x: 5760, y: 468, width: 1400, height: 135, type: 'ground' }, // Temple platform
            
            // Floating platforms
            { x: 525, y: 375, width: 150, height: 30, type: 'floating' },
            { x: 1080, y: 330, width: 180, height: 30, type: 'floating' },
            { x: 1500, y: 360, width: 120, height: 30, type: 'floating' },
            { x: 1800, y: 300, width: 200, height: 30, type: 'floating' },
            { x: 2020, y: 100, width: 60, height: 30, type: 'floating' },
            { x: 2200, y: 350, width: 200, height: 30, type: 'floating' },
            { x: 2800, y: 320, width: 320, height: 30, type: 'floating' },
            { x: 3600, y: 340, width: 180, height: 30, type: 'floating' },
            { x: 4000, y: 310, width: 180, height: 30, type: 'floating' },
            { x: 4440, y: 360, width: 150, height: 30, type: 'floating' },
            { x: 4900, y: 330, width: 80, height: 30, type: 'floating' },
            { x: 5200, y: 350, width: 350, height: 30, type: 'floating' }
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
            { x: 400, y: 468, width: 550, height: 135, type: 'ground' }, // Long flat section
            
            // First floating block section for enemies
            { x: 1100, y: 380, width: 120, height: 30, type: 'tree_platform' },
            { x: 1350, y: 340, width: 120, height: 30, type: 'tree_platform' },
            { x: 1600, y: 300, width: 120, height: 30, type: 'tree_platform' },
            
            // Ground continues
            { x: 1900, y: 468, width: 4000, height: 135, type: 'ground' }, // Another long flat
            
            // Tree-top jumping section (no ground below)
            { x: 2700, y: 360, width: 180, height: 25, type: 'branch' },
            { x: 3000, y: 320, width: 160, height: 25, type: 'branch' },
            { x: 3280, y: 280, width: 140, height: 25, type: 'branch' },
            { x: 3520, y: 240, width: 160, height: 25, type: 'branch' },
            { x: 3800, y: 200, width: 180, height: 25, type: 'branch' },
            { x: 4100, y: 260, width: 160, height: 25, type: 'branch' },
            { x: 4380, y: 320, width: 140, height: 25, type: 'branch' },
            { x: 4640, y: 380, width: 160, height: 25, type: 'branch' },
            { x: 4860, y: 180, width: 100, height: 20, type: 'tree_platform' },
            
            // Mid-section with mixed platforms and floating blocks
            { x: 6000, y: 400, width: 100, height: 30, type: 'tree_platform' },
            { x: 6200, y: 360, width: 100, height: 30, type: 'tree_platform' },
            { x: 6400, y: 320, width: 100, height: 30, type: 'tree_platform' },
            { x: 6600, y: 468, width: 400, height: 135, type: 'ground' },
            
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
            { x: 10000, y: 468, width: 700, height: 135, type: 'ground' },
            
            // Additional floating elements for variety
            { x: 10900, y: 380, width: 300, height: 30, type: 'tree_platform' },
            { x: 11500, y: 380, width: 300, height: 30, type: 'tree_platform' },
            
            // More ground with gaps
            { x: 12000, y: 468, width: 600, height: 135, type: 'ground' },
            // GAP
            { x: 12900, y: 468, width: 900, height: 135, type: 'ground' },
            
            // Final tree-top challenge before temple
            { x: 13350, y: 380, width: 150, height: 25, type: 'branch' },
            { x: 13680, y: 340, width: 150, height: 25, type: 'branch' },
            { x: 14010, y: 300, width: 150, height: 25, type: 'branch' },
            { x: 14340, y: 260, width: 150, height: 25, type: 'branch' },
            { x: 14670, y: 220, width: 180, height: 25, type: 'branch' },
            { x: 15030, y: 260, width: 150, height: 25, type: 'branch' },
            { x: 15360, y: 320, width: 150, height: 25, type: 'branch' },
            { x: 15690, y: 380, width: 150, height: 25, type: 'branch' },
            
            // Final ground section and temple clearing
            { x: 15800, y: 468, width: 1200, height: 135, type: 'ground' }, // Long approach
            { x: 16700, y: 468, width: 1300, height: 135, type: 'ground' }  // Temple platform (clearing)
        ];
    }
    
    createLevel3Platforms() {
        // MOUNTAIN LEVEL 3 LAYOUT - ASCENDING ELEVATION
        // Features: Multiple ground levels that ascend the mountain, vertical climbing section
        // Ground level starts at 468, then rises to 400, then 330, then 260 for temple
        // Night-to-sunrise background progression
        // Total length: ~15,000px
        
        this.platforms = [
            // SECTION 1: Base level (ground at 468)
            { x: 0, y: 500, width: 500, height: 135, type: 'rock' },
            { x: 500, y: 460, width: 250, height: 175, type: 'rock' },
            { x: 750, y: 420, width: 250, height: 215, type: 'rock' },
            
            // Floating platforms to help ascend to next level
            { x: 1200, y: 380, width: 200, height: 30, type: 'rock_platform' },
            { x: 1600, y: 300, width: 200, height: 30, type: 'rock_platform' },
            
            { x: 1950, y: 220, width: 800, height: 415, type: 'rock' },

            { x: 2750, y: 300, width: 50, height: 30, type: 'rock_platform' },

            { x: 3000, y: 400, width: 200, height: 240, type: 'rock' },
            { x: 3400, y: 400, width: 200, height: 240, type: 'rock' },
            { x: 3800, y: 320, width: 200, height: 320, type: 'rock' },
            { x: 4200, y: 240, width: 200, height: 400, type: 'rock' },

            { x: 4600, y: 180, width: 400, height: 460, type: 'rock' },
            { x: 5000, y: 260, width: 100, height: 400, type: 'rock' },
            { x: 5100, y: 340, width: 100, height: 400, type: 'rock' },
            { x: 5200, y: 420, width: 100, height: 400, type: 'rock' },
            { x: 5300, y: 500, width: 500, height: 400, type: 'rock' },
            
            // Floating platforms on this higher level
           
            { x: 5900, y: 500, width: 100, height: 30, type: 'rock_platform' },
            { x: 6100, y: 340, width: 100, height: 30, type: 'rock_platform' },
            { x: 5900, y: 180, width: 100, height: 30, type: 'rock_platform' },
            { x: 6300, y: 180, width: 1100, height: 30, type: 'rock_platform' },
            { x: 7650, y: 180, width: 450, height: 30, type: 'rock_platform' },
            { x: 8500, y: 500, width: 1500, height: 200, type: 'rock' },
            
            // SECTION 5: Final ascent to temple level (ground at 240) - highest elevation
            { x: 10000, y: 300, width: 400, height: 363, type: 'rock' }, // Base stepping stone
            
            { x: 10600, y: 360, width: 300, height: 25, type: 'rock_platform' },
            { x: 11000, y: 160, width: 90, height: 20, type: 'rock_platform' }, // heart platform
            
            // Mega Snail Pit
            { x: 11200, y: 240, width: 50, height: 383, type: 'rock' },
            { x: 11250, y: 450, width: 750, height: 383, type: 'rock' },
            { x: 12000, y: 240, width: 200, height: 383, type: 'rock' },
            
            
            // Additional floating platforms for variety and challenge
            { x: 11950, y: 300, width: 50, height: 25, type: 'rock_platform' },
            
            // TEMPLE PLATFORM - At highest elevation (ground at 240) - Wide and majestic
            { x: 12200, y: 240, width: 2800, height: 423, type: 'rock' } // Massive temple platform at peak
        ];
    }

    createClouds() {
        if (this.currentLevel === 1) {
            this.createLevel1Clouds();
        } else if (this.currentLevel === 2) {
            this.createLevel2Clouds();
        } else if (this.currentLevel === 3) {
            this.createLevel3Clouds();
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
    
    createLevel3Clouds() {
        this.clouds = [];
        // Mountain clouds - more sparse, higher altitude
        for (let x = 500; x < this.worldWidth; x += 600 + Math.random() * 300) {
            this.clouds.push({
                x: x + (Math.random() - 0.5) * 150,
                y: 20 + Math.random() * 40, // Higher in the sky
                size: 60 + Math.random() * 50 // Larger, more dramatic
            });
        }
    }
    
    createScriptureBooks() {
        if (this.currentLevel === 1) {
            this.createLevel1ScriptureBooks();
        } else if (this.currentLevel === 2) {
            this.createLevel2ScriptureBooks();
        } else if (this.currentLevel === 3) {
            this.createLevel3ScriptureBooks();
        }
    }
    
    createHearts() {
        if (this.currentLevel === 1) {
            this.createLevel1Hearts();
        } else if (this.currentLevel === 2) {
            this.createLevel2Hearts();
        } else if (this.currentLevel === 3) {
            this.createLevel3Hearts();
        }
    }
    
    createLevel1ScriptureBooks() {
        this.scriptureBooks = [
            { x: 575, y: 325, width: 50, height: 50, collected: false, verse: "Faith" },
            { x: 1500, y: 305, width: 50, height: 50, collected: false, verse: "Truth" },
            { x: 2840, y: 265, width: 50, height: 50, collected: false, verse: "Righteousness" }
        ];
    }
    
    createLevel2ScriptureBooks() {
        this.scriptureBooks = [
            // Early jungle book
            { x: 1500, y: 130, width: 50, height: 50, collected: false, verse: "Salvation" }, // On tree platform
            
            // Mid-level books
            { x: 3860, y: 150, width: 50, height: 50, collected: false, verse: "Spirit" }, // Tree platform
            { x: 8500, y: 180, width: 50, height: 50, collected: false, verse: "Light" }, // Jump off high branch
            
            // Late jungle books
            { x: 11300, y: 150, width: 50, height: 50, collected: false, verse: "Hope" },
            { x: 16800, y: 415, width: 50, height: 50, collected: false, verse: "Joy" }  // Temple approach
        ];
    }
    
    createLevel3ScriptureBooks() {
        this.scriptureBooks = [
            // Early mountain book - on first rocky platform
            { x: 1450, y: 120, width: 50, height: 50, collected: false, verse: "Courage" },
           
            { x: 3880, y: 250, width: 50, height: 50, collected: false, verse: "Perseverance" },

            // Late mountain book - on challenging rocky platforms
            { x: 6800, y: 120, width: 50, height: 50, collected: false, verse: "Strength" },
            
            // Final scripture before temple - requires skillful platforming
            { x: 11330, y: 80, width: 50, height: 50, collected: false, verse: "Victory" } // On highest challenge platform
        ];
    }
    
    createLevel1Hearts() {
        this.hearts = [
            // Single heart in a tough-to-reach location on floating platform
            { x: 2035, y: 60, width: 30, height: 30, collected: false, healthRestore: 1 } // High floating platform
        ];
    }
    
    createLevel2Hearts() {
        this.hearts = [
            // First heart on high tree branch - challenging jump required
            { x: 4910, y: 140, width: 30, height: 30, collected: false, healthRestore: 1 }, // High branch
            // Second heart near end, on difficult tree platform sequence
            { x: 9960, y: 40, width: 30, height: 30, collected: false, healthRestore: 1 } // Very high branch near end
        ];
    }
    
    createLevel3Hearts() {
        this.hearts = [
            // First heart on challenging vertical climb section
            { x: 1460, y: 50, width: 30, height: 30, collected: false, healthRestore: 1 },
            { x: 4290, y: 180, width: 30, height: 30, collected: false, healthRestore: 1 },
            { x: 5940, y: 140, width: 30, height: 30, collected: false, healthRestore: 1 },
            { x: 11030, y: 120, width: 30, height: 30, collected: false, healthRestore: 1 }
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
        } else if (this.currentLevel === 3) {
            // Mountain sunrise effect - starts at night, progresses to day
            this.renderMountainSunrise(ctx, cameraX, canvasWidth, canvasHeight);
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
    
    renderMountainSunrise(ctx, cameraX, canvasWidth, canvasHeight) {
        // Calculate progress through level (0 = night at start, 1 = day at end)
        const progress = Math.min(cameraX / (this.worldWidth - 800), 1);
        
        // Create gradient that transitions from night to sunrise to day
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        
        if (progress < 0.3) {
            // Night phase (0-30% of level)
            const nightProgress = progress / 0.3;
            const starFade = 1 - nightProgress * 0.3; // Stars fade slowly
            
            gradient.addColorStop(0, `rgba(${5 + nightProgress * 10}, ${5 + nightProgress * 10}, ${25 + nightProgress * 20}, 1)`); // Very dark blue to dark blue
            gradient.addColorStop(0.6, `rgba(${2 + nightProgress * 8}, ${2 + nightProgress * 8}, ${15 + nightProgress * 15}, 1)`);
            gradient.addColorStop(1, `rgba(${0 + nightProgress * 5}, ${0 + nightProgress * 5}, ${8 + nightProgress * 12}, 1)`);
            
        } else if (progress < 0.7) {
            // Sunrise phase (30-70% of level)
            const sunriseProgress = (progress - 0.3) / 0.4;
            
            // Warm sunrise colors
            gradient.addColorStop(0, `rgb(${50 + sunriseProgress * 100}, ${30 + sunriseProgress * 80}, ${60 + sunriseProgress * 100})`);
            gradient.addColorStop(0.3, `rgb(${100 + sunriseProgress * 100}, ${50 + sunriseProgress * 100}, ${80 + sunriseProgress * 80})`);
            gradient.addColorStop(0.6, `rgb(${150 + sunriseProgress * 80}, ${90 + sunriseProgress * 100}, ${70 + sunriseProgress * 100})`);
            gradient.addColorStop(1, `rgb(${120 + sunriseProgress * 80}, ${80 + sunriseProgress * 100}, ${60 + sunriseProgress * 120})`);
            
        } else {
            // Day phase (70-100% of level)
            const dayProgress = (progress - 0.7) / 0.3;
            
            // Clear mountain day sky
            gradient.addColorStop(0, `rgb(${135 + dayProgress * 20}, ${206 + dayProgress * 29}, ${235 + dayProgress * 20})`); // Sky blue
            gradient.addColorStop(0.4, `rgb(${176 + dayProgress * 40}, ${224 + dayProgress * 26}, ${230 + dayProgress * 25})`); // Powder blue
            gradient.addColorStop(0.8, `rgb(${230 + dayProgress * 25}, ${243 + dayProgress * 12}, ${255})`); // Light blue
            gradient.addColorStop(1, `rgb(${240 + dayProgress * 15}, ${248 + dayProgress * 7}, ${255})`); // Alice blue
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(cameraX, 0, canvasWidth, canvasHeight);
        
        // Add mountain peaks silhouettes in background
        this.renderMountainPeaks(ctx, cameraX, canvasWidth, canvasHeight, progress);
        
        // Add sun/moon based on progress
        if (progress < 0.2) {
            this.renderMountainMoon(ctx, cameraX, canvasWidth, canvasHeight, progress);
        } else if (progress > 0.3) {
            this.renderMountainSun(ctx, cameraX, canvasWidth, canvasHeight, progress);
        }
    }
    
    renderMountainPeaks(ctx, cameraX, canvasWidth, canvasHeight, progress) {
        // Mountain silhouettes in background - darker when night, lighter when day
        const opacity = progress < 0.3 ? 0.1 + progress * 0.2 : 0.3 + (progress - 0.3) * 0.4;
        
        ctx.fillStyle = `rgba(40, 40, 60, ${opacity})`;
        ctx.beginPath();
        
        // Create jagged mountain peaks across the background
        const peakHeight = canvasHeight * 0.4;
        const baseY = canvasHeight - peakHeight;
        
        // Multiple mountain layers for parallax effect
        for (let layer = 0; layer < 3; layer++) {
            const layerOffset = cameraX * (0.1 + layer * 0.05); // Slower parallax for background
            const layerOpacity = (opacity * (0.3 + layer * 0.2));
            
            ctx.fillStyle = `rgba(${40 + layer * 20}, ${40 + layer * 20}, ${60 + layer * 30}, ${layerOpacity})`;
            ctx.beginPath();
            
            ctx.moveTo(cameraX - layerOffset, baseY + layer * 50);
            
            for (let x = cameraX - layerOffset; x < cameraX + canvasWidth + 200; x += 80 + layer * 40) {
                const peakY = baseY + layer * 50 - (Math.sin(x * 0.01 + layer * 2) * 60) - (Math.random() * 40);
                ctx.lineTo(x, peakY);
            }
            
            ctx.lineTo(cameraX + canvasWidth, canvasHeight);
            ctx.lineTo(cameraX - layerOffset, canvasHeight);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    renderMountainMoon(ctx, cameraX, canvasWidth, canvasHeight, progress) {
        // Moon in early night phase
        const moonX = cameraX + (canvasWidth * 0.8);
        const moonY = 60 + progress * 40;
        const moonRadius = 30;
        
        ctx.fillStyle = '#E6E6FA'; // Lavender moon
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon glow
        const glowGradient = ctx.createRadialGradient(moonX, moonY, moonRadius, moonX, moonY, moonRadius * 3);
        glowGradient.addColorStop(0, 'rgba(230, 230, 250, 0.1)');
        glowGradient.addColorStop(1, 'rgba(230, 230, 250, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderMountainSun(ctx, cameraX, canvasWidth, canvasHeight, progress) {
        // Sun rises during sunrise and day phases
        const sunriseStart = 0.3;
        const sunProgress = Math.max(0, (progress - sunriseStart) / (1 - sunriseStart));
        
        // Sun position moves across sky as it rises
        const sunX = cameraX + (canvasWidth * 0.2) + (canvasWidth * 0.6 * sunProgress);
        const sunY = 200 - (sunProgress * 120); // Rises from horizon
        const sunRadius = 35 + (sunProgress * 10); // Gets bigger as it rises
        
        // Sun color changes from orange to yellow
        let sunColor;
        if (sunProgress < 0.5) {
            sunColor = `rgb(255, ${140 + sunProgress * 115}, 30)`; // Orange to yellow
        } else {
            sunColor = '#FFD700'; // Gold
        }
        
        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun rays during full daylight
        if (sunProgress > 0.7) {
            const rayOpacity = (sunProgress - 0.7) * 0.3;
            ctx.strokeStyle = `rgba(255, 215, 0, ${rayOpacity})`;
            ctx.lineWidth = 3;
            
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const rayLength = 60;
                ctx.beginPath();
                ctx.moveTo(
                    sunX + Math.cos(angle) * (sunRadius + 10),
                    sunY + Math.sin(angle) * (sunRadius + 10)
                );
                ctx.lineTo(
                    sunX + Math.cos(angle) * (sunRadius + rayLength),
                    sunY + Math.sin(angle) * (sunRadius + rayLength)
                );
                ctx.stroke();
            }
        }
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
                    // Jungle ground - darker brown earth with jungle grass
                    ctx.fillStyle = '#654321'; // Dark brown earth
                    ctx.fillRect(platform.x, platform.y + 6, platform.width, platform.height - 6);
                    
                    // Add darker brown texture/variation - consistent pattern
                    ctx.fillStyle = '#4A2C17'; // Darker brown texture
                    for (let i = 0; i < platform.width; i += 18) {
                        for (let j = 12; j < platform.height - 6; j += 15) {
                            ctx.fillRect(platform.x + i, platform.y + 6 + j, 8, 5);
                            ctx.fillRect(platform.x + i + 10, platform.y + 6 + j + 8, 6, 4);
                        }
                    }
                    
                    // Add medium brown patches - consistent pattern
                    ctx.fillStyle = '#8B4513'; // Saddle brown patches
                    for (let i = 5; i < platform.width; i += 22) {
                        for (let j = 8; j < platform.height - 6; j += 18) {
                            ctx.fillRect(platform.x + i, platform.y + 6 + j, 4, 6);
                        }
                    }
                    
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
        } else if (this.currentLevel === 3) {
            // Mountain level - rocky platforms
            switch(platform.type) {
                case 'rock':
                    // Rocky ground platforms
                    ctx.fillStyle = '#696969'; // Dim gray
                    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                    
                    // Add rock texture
                    ctx.fillStyle = '#556B2F'; // Dark olive green (moss on rocks)
                    for (let i = 0; i < platform.width; i += 25) {
                        for (let j = 8; j < platform.height; j += 20) {
                            // Use consistent offsets based on position instead of random
                            const offsetX = ((platform.x + i) * 7) % 5;
                            const offsetY = ((platform.y + j) * 3) % 3;
                            ctx.fillRect(platform.x + i + offsetX, platform.y + j + offsetY, 6, 4);
                        }
                    }
                    
                    // Add darker rock patches
                    ctx.fillStyle = '#2F4F4F'; // Dark slate gray
                    for (let i = 10; i < platform.width; i += 30) {
                        for (let j = 12; j < platform.height; j += 25) {
                            ctx.fillRect(platform.x + i, platform.y + j, 8, 6);
                        }
                    }
                    break;
                    
                case 'rock_platform':
                    // Floating rocky platforms
                    ctx.fillStyle = '#708090'; // Slate gray
                    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                    
                    // Add jagged rocky edges
                    ctx.fillStyle = '#2F4F4F'; // Dark slate gray
                    for (let i = 0; i < platform.width; i += 15) {
                        // Use consistent pattern based on position
                        if (((platform.x + i) * 17) % 10 > 5) {
                            ctx.fillRect(platform.x + i, platform.y - 2, 8, 4); // Top jagged edge
                        }
                        if (((platform.x + i) * 23) % 10 > 6) {
                            ctx.fillRect(platform.x + i, platform.y + platform.height - 2, 6, 4); // Bottom jagged edge
                        }
                    }
                    
                    // Add rock texture spots
                    ctx.fillStyle = '#696969';
                    for (let i = 5; i < platform.width; i += 12) {
                        ctx.fillRect(platform.x + i, platform.y + 4, 4, 3);
                        ctx.fillRect(platform.x + i + 6, platform.y + 8, 3, 4);
                    }
                    break;
                    
                default:
                    // Default rocky style
                    ctx.fillStyle = '#696969';
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
    
    renderHearts(ctx, heartImage) {
        this.hearts.forEach(heart => {
            if (!heart.collected) {
                // Floating effect (same as scripture books but slightly different timing)
                const time = Date.now() * 0.003; // Slightly faster float
                const floatY = Math.sin(time + heart.x * 0.015) * 3; // Slightly more float amplitude
                
                // Pulsing scale effect
                const pulseScale = 1.0 + Math.sin(time * 2 + heart.x * 0.02) * 0.1;
                
                ctx.save();
                ctx.translate(0, floatY);
                
                // Draw glow behind heart
                const glowRadius = 25;
                const gradient = ctx.createRadialGradient(
                    heart.x + heart.width/2, heart.y + heart.height/2, 0,
                    heart.x + heart.width/2, heart.y + heart.height/2, glowRadius
                );
                gradient.addColorStop(0, 'rgba(255, 100, 100, 0.4)'); // Red glow
                gradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.2)');
                gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(heart.x - glowRadius/2, heart.y - glowRadius/2, 
                           heart.width + glowRadius, heart.height + glowRadius);
                
                // Scale the heart for pulsing effect
                const centerX = heart.x + heart.width/2;
                const centerY = heart.y + heart.height/2;
                ctx.translate(centerX, centerY);
                ctx.scale(pulseScale, pulseScale);
                ctx.translate(-centerX, -centerY);
                
                // Draw heart image if loaded, otherwise fallback to simple red rectangle
                if (heartImage && heartImage.complete) {
                    ctx.drawImage(heartImage, heart.x, heart.y, heart.width, heart.height);
                } else {
                    // Fallback: Simple red heart shape
                    ctx.fillStyle = '#FF1744';
                    ctx.fillRect(heart.x, heart.y, heart.width, heart.height);
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
        
        // Check ground collision - more forgiving detection for edge landings
        if (entity.velocityY >= 0 && entity.y >= this.groundY - 20 && entity.y <= this.groundY + 15) {
            // Check if entity is horizontally on any ground-level platform with more tolerance
            for (let platform of this.platforms) {
                if (platform.y === this.groundY && 
                    entity.x + entity.width > platform.x - 5 && 
                    entity.x < platform.x + platform.width + 5) {
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
                // Landing on top of platform (falling down onto it) - check if player crossed through platform this frame
                if (entity.velocityY > 0 && 
                    entity.y + entity.height >= platform.y &&
                    entity.y + entity.height <= platform.y + Math.abs(entity.velocityY) + 15) { // Allow for movement distance this frame
                    
                    entity.y = platform.y - entity.height;
                    entity.velocityY = 0;
                    entity.isGrounded = true;
                    if (entity.isJumping !== undefined) {
                        entity.isJumping = false;
                    }
                }
                // Side collision detection - only when entity is clearly hitting the side (not trying to land on top)
                else if (entity.y + entity.height > platform.y + 20 && 
                         entity.y < platform.y + platform.height - 10) {
                    
                    // Determine which side we're hitting
                    const entityCenterX = entity.x + entity.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    
                    // Only block movement, don't teleport during jumps
                    if (entity.isJumping || entity.velocityY < 0) {
                        // Player is jumping - just set movement blocks without position changes
                        if (entityCenterX < platformCenterX) {
                            if (entity.blockedRight !== undefined) entity.blockedRight = true;
                        } else {
                            if (entity.blockedLeft !== undefined) entity.blockedLeft = true;
                        }
                    } else {
                        // Player is walking on ground - prevent walking through platforms
                        if (entityCenterX < platformCenterX) {
                            entity.x = platform.x - entity.width - 2;
                            if (entity.blockedRight !== undefined) entity.blockedRight = true;
                        } else {
                            entity.x = platform.x + platform.width + 2;
                            if (entity.blockedLeft !== undefined) entity.blockedLeft = true;
                        }
                    }
                    // If at ground level, don't force falling - just block movement
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
        // Reset hearts
        this.hearts.forEach(heart => {
            heart.collected = false;
        });
    }    
    setLevel(level) {
        this.currentLevel = level;
        this.setLevelProperties();
        this.createPlatforms();
        this.createClouds();
        this.createScriptureBooks();
        this.createHearts();
    }}