class ArrowManager {
    constructor(audioManager, arrowImage = null, brokenArrowImage = null, game = null) {
        this.audioManager = audioManager;
        this.game = game;
        this.arrows = [];
        this.arrowImage = arrowImage;
        this.brokenArrowImage = brokenArrowImage;
        
        // Arrow spawning system
        this.arrowSpawnTimer = 0;
        this.arrowSpawnDelay = 28; // Spawn arrow every ~0.47 seconds at 60fps (faster spawning)
        this.maxArrows = 30; // Maximum arrows on screen at once
        this.burstChance = 0.4; // 40% chance for burst spawning
        
        // Broken arrow effects
        this.brokenArrows = [];
        
        // Arrow type definitions (speeds increased by 50% for faster gameplay)
        this.arrowTypes = [
            { y: 440, speedX: -5.72, speedY: 0 }, // Ground level - duck under
            { y: 380, speedX: -6.87, speedY: 0 }, // Head height - duck under  
            { y: 450, speedX: -7.62, speedY: 0 }, // Low - duck under
            { y: 280, speedX: -5.72, speedY: 3.05 }, // High - jump over
            { y: 320, speedX: -4.58, speedY: 1.91 }, // Mid-high - jump over
            { y: 410, speedX: -8.39, speedY: 0 }, // Body level - duck under
            { y: 400, speedX: -6.36, speedY: 0.78 }, // Slightly arcing - duck under
            { y: 350, speedX: -5.58, speedY: 2.04 }, // Mid-arc - jump over
            { y: 450, speedX: -7.10, speedY: -0.51 }, // Dropping - duck under
        ];
    }
    
    spawnInitialArrows(player) {
        const initialArrowCount = 2 + Math.floor(Math.random());
        
        for (let i = 0; i < initialArrowCount; i++) {
            // Stagger the initial arrows across different distances
            const spawnX = player.x + 400 + (i * 150) + Math.random() * 100;
            
            const arrowType = this.arrowTypes[Math.floor(Math.random() * this.arrowTypes.length)];
            
            const newArrow = {
                x: spawnX,
                y: arrowType.y,
                width: 40,
                height: 24,
                speedX: arrowType.speedX,
                speedY: arrowType.speedY,
                active: true,
                hasPlayedRicochetSound: false
            };
            
            this.arrows.push(newArrow);
        }
    }
    
    spawnNewArrow(player, castle, hasArmor, xOffset = 0) {
        // Only spawn if we're playing and haven't hit the max
        if (this.arrows.filter(a => a.active).length >= this.maxArrows) {
            return;
        }
        
        // Spawn arrow ahead of the player with optional offset for bursts
        const spawnX = player.x + 800 + Math.random() * 400 + xOffset; // 800-1200 pixels ahead + offset
        
        // Don't spawn arrows beyond the castle
        if (spawnX > castle.x + 200) {
            return;
        }
        
        // Choose random arrow type
        const arrowType = this.arrowTypes[Math.floor(Math.random() * this.arrowTypes.length)];
        
        // Increase difficulty if player has armor
        const speedMultiplier = hasArmor ? 1.3 : 1.0;
        
        const newArrow = {
            x: spawnX,
            y: arrowType.y,
            width: 40,
            height: 24,
            speedX: arrowType.speedX * speedMultiplier,
            speedY: arrowType.speedY,
            active: true,
            hasPlayedRicochetSound: false
        };
        
        this.arrows.push(newArrow);
    }
    
    update(player, castle, hasArmor, cameraX, canvasWidth, gameState, inputHandler = null, currentJumpPower = null) {
        if (gameState !== 'playing') return;
        
        // Update arrows
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                arrow.x += arrow.speedX;
                arrow.y += arrow.speedY;
                
                // Remove arrows that go off screen
                if (arrow.x < cameraX - 100 || arrow.x > cameraX + canvasWidth + 100) {
                    arrow.active = false;
                }
            }
        });
        
        // Update broken arrow effects
        this.brokenArrows.forEach(brokenArrow => {
            brokenArrow.timer++;
            brokenArrow.opacity = Math.max(0, 1 - (brokenArrow.timer / brokenArrow.duration));
            
            // Apply physics - upward pop then falling
            brokenArrow.y += brokenArrow.velocityY;
            brokenArrow.velocityY += 0.3; // Gravity
            
            // Optional: slight rotation for more dramatic effect
            brokenArrow.rotation = (brokenArrow.rotation || 0) + 0.05;
        });
        
        // Remove finished broken arrow effects
        this.brokenArrows = this.brokenArrows.filter(brokenArrow => brokenArrow.timer < brokenArrow.duration);
        
        // Clean up inactive arrows periodically
        if (Math.random() < 0.02) { // 2% chance each frame
            this.arrows = this.arrows.filter(arrow => arrow.active);
        }
        
        // Spawn new arrows continuously (but not on level 4)
        this.arrowSpawnTimer++;
        if (this.arrowSpawnTimer >= this.arrowSpawnDelay) {
            // Check if we're on level 4 - if so, don't spawn any arrows
            const currentLevel = this.game && this.game.level ? this.game.level : 1;
            if (currentLevel === 4) {
                this.arrowSpawnTimer = 0;
                return; // No arrows on level 4
            }
            
            // Determine how many arrows to spawn this time
            let arrowsToSpawn = 1;
            
            // Random burst spawning
            if (Math.random() < this.burstChance) {
                arrowsToSpawn = 2 + Math.floor(Math.random() * 2); // 2-3 arrows in burst
            }
            
            // Double arrow spawn rate when player has God's armor (increased difficulty)
            if (hasArmor) {
                arrowsToSpawn *= 2; // Double the number of arrows
                // Also add occasional extra arrows for more intense challenge
                if (Math.random() < 0.5) {
                    arrowsToSpawn += Math.floor(Math.random() * 2) + 1; // Add 1-2 more arrows
                }
            }
            
            // Spawn the arrows
            for (let i = 0; i < arrowsToSpawn; i++) {
                this.spawnNewArrow(player, castle, hasArmor, i * 100); // Offset each arrow in burst by 100px
            }
            
            this.arrowSpawnTimer = 0;
            
            // Vary spawn rate for more randomness - faster overall
            this.arrowSpawnDelay = 28 + Math.random() * 39; // 0.47 to 1.12 seconds
        }
    }
    
    render(ctx) {
        // Render active arrows
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                if (this.arrowImage && this.arrowImage.complete) {
                    // Use the new fiery arrow image - flip horizontally since arrows fly left
                    ctx.save();
                    ctx.scale(-1, 1); // Flip horizontally
                    ctx.drawImage(this.arrowImage, -arrow.x - arrow.width, arrow.y, arrow.width, arrow.height);
                    ctx.restore();
                } else {
                    // Fallback to original arrow drawing
                    // Arrow shaft (brown wood)
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(arrow.x + 6, arrow.y + 2, arrow.width - 12, arrow.height - 4);
                    
                    // Silver pointed arrowhead (triangle) - pointing LEFT since arrows fly left
                    ctx.fillStyle = '#C0C0C0';
                    // Main arrowhead body (at the left end)
                    ctx.fillRect(arrow.x, arrow.y, 10, arrow.height);
                    // Pointed tip triangle (extending left from main body)
                    ctx.fillRect(arrow.x - 2, arrow.y + 1, 2, arrow.height - 2);
                    ctx.fillRect(arrow.x - 4, arrow.y + 2, 2, arrow.height - 4);
                    ctx.fillRect(arrow.x - 6, arrow.y + 3, 2, arrow.height - 6);
                    
                    // Red feather fletching at back (right end)
                    ctx.fillStyle = '#DC143C'; // Crimson red
                    // Upper feather
                    ctx.fillRect(arrow.x + arrow.width - 8, arrow.y - 2, 8, 3);
                    ctx.fillRect(arrow.x + arrow.width - 6, arrow.y - 3, 4, 2);
                    // Lower feather  
                    ctx.fillRect(arrow.x + arrow.width - 8, arrow.y + arrow.height - 1, 8, 3);
                    ctx.fillRect(arrow.x + arrow.width - 6, arrow.y + arrow.height + 1, 4, 2);
                    
                    // Feather details (darker red)
                    ctx.fillStyle = '#B22222';
                    ctx.fillRect(arrow.x + arrow.width - 7, arrow.y - 1, 1, 2);
                    ctx.fillRect(arrow.x + arrow.width - 5, arrow.y - 2, 1, 1);
                    ctx.fillRect(arrow.x + arrow.width - 3, arrow.y - 1, 1, 1);
                    ctx.fillRect(arrow.x + arrow.width - 7, arrow.y + arrow.height, 1, 2);
                    ctx.fillRect(arrow.x + arrow.width - 5, arrow.y + arrow.height + 1, 1, 1);
                    ctx.fillRect(arrow.x + arrow.width - 3, arrow.y + arrow.height, 1, 1);
                }
            }
        });
        
        // Render broken arrow effects
        this.brokenArrows.forEach(brokenArrow => {
            if (this.brokenArrowImage && this.brokenArrowImage.complete) {
                ctx.save();
                ctx.globalAlpha = brokenArrow.opacity;
                
                // Move to center of arrow for rotation
                const centerX = brokenArrow.x + brokenArrow.width / 2;
                const centerY = brokenArrow.y + brokenArrow.height / 2;
                ctx.translate(centerX, centerY);
                
                // Apply rotation
                ctx.rotate(brokenArrow.rotation);
                
                // Flip horizontally to match arrow direction and draw from center
                ctx.scale(-1, 1);
                ctx.drawImage(this.brokenArrowImage, -brokenArrow.width / 2, -brokenArrow.height / 2, brokenArrow.width, brokenArrow.height);
                
                ctx.restore();
            }
        });
    }
    
    checkCollisions(player, hasArmor, inputHandler = null, currentJumpPower = null) {
        const collisions = [];
        
        this.arrows.forEach(arrow => {
            // Create proper hitbox for player (including head and ducking state)
            const playerHitbox = {
                x: player.x,
                y: player.isDucking ? player.y + player.height * 0.2 : player.y - 16,
                width: player.width,
                height: player.isDucking ? player.height * 0.8 + 16 : player.height + 16
            };
            
            if (arrow.active && this.checkCollision(playerHitbox, arrow) && !player.invulnerable) {
                // Check if player is landing on top of arrow (breaking it)
                const playerBottom = player.y + player.height;
                const arrowTop = arrow.y;
                const arrowBottom = arrow.y + arrow.height;
                const playerCenterX = player.x + player.width / 2;
                const arrowCenterX = arrow.x + arrow.width / 2;
                
                // More reliable top collision detection:
                // 1. Player's bottom is within reasonable range of arrow's vertical area
                // 2. Player is moving downward OR just recently was (small upward velocity ok)
                // 3. Player is reasonably horizontally aligned with arrow (more forgiving)
                // 4. Player is coming from above the arrow
                const verticalOverlap = playerBottom >= arrowTop && playerBottom <= arrowBottom + 12;
                const comingFromAbove = player.y < arrowTop + arrow.height / 2;
                const horizontalAlignment = Math.abs(playerCenterX - arrowCenterX) < arrow.width * 0.85;
                const downwardMovement = player.velocityY > -3; // Allow small upward velocity
                
                if (verticalOverlap && comingFromAbove && horizontalAlignment && downwardMovement && !player.isGrounded) {
                    // Break the arrow
                    this.breakArrow(arrow);
                    // Give player a bounce - use full jump power if jump key is held
                    const jumpKeyHeld = typeof inputHandler !== 'undefined' && inputHandler && inputHandler.keys && 
                                       (inputHandler.keys['ArrowUp'] || inputHandler.keys['Space']);
                    const jumpPower = (jumpKeyHeld && typeof currentJumpPower !== 'undefined' && currentJumpPower) ? 
                                     currentJumpPower : -6;
                    player.velocityY = jumpPower;
                } else {
                    // Side collision - normal damage or armor behavior
                    if (hasArmor) {
                        // Arrow bounces off armor
                        arrow.speedX = -arrow.speedX;
                        arrow.speedY = -2; // Bounce up
                        
                        // Only play ricochet sound once per arrow
                        if (!arrow.hasPlayedRicochetSound) {
                            const ricochetSounds = ['ricochet', 'ricochet2'];
                            const randomSound = ricochetSounds[Math.floor(Math.random() * ricochetSounds.length)];
                            this.audioManager.playSound(randomSound);
                            arrow.hasPlayedRicochetSound = true;
                        }
                    } else {
                        // Player takes damage
                        collisions.push({
                            source: arrow,
                            x: arrow.x + arrow.width / 2,
                            y: arrow.y + arrow.height / 2
                        });
                        arrow.active = false; // Remove the arrow that hit
                    }
                }
            }
        });
        
        return collisions;
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    breakArrow(arrow) {
        // Mark arrow as inactive
        arrow.active = false;
        
        // Add scoring for breaking arrow
        if (this.game) {
            const basePoints = 300;
            
            // Handle combo system for arrow deflections
            if (!this.game.player.isGrounded && this.game.comboMode) {
                // Continue combo - increase multiplier
                this.game.comboMultiplier++;
                this.game.airborneKills++;
            } else if (!this.game.player.isGrounded && !this.game.comboMode) {
                // Start combo mode if airborne
                this.game.comboMode = true;
                this.game.comboMultiplier = 1; // First deflection is normal
                this.game.airborneKills = 1;
            }
            
            // Apply multiplier if in combo mode
            const points = this.game.comboMode ? basePoints * this.game.comboMultiplier : basePoints;
            const color = this.game.comboMode && this.game.comboMultiplier > 1 ? '#FF6B6B' : '#E74C3C';
            
            // Create label with multiplier if applicable
            let label = "Arrow";
            if (this.game.comboMode && this.game.comboMultiplier > 1) {
                label += ` x${this.game.comboMultiplier}`;
            }
            
            this.game.addScore(points, color, label);
        }
        
        // Create broken arrow effect with upward pop physics
        this.brokenArrows.push({
            x: arrow.x,
            y: arrow.y,
            width: arrow.width,
            height: arrow.height,
            opacity: 1,
            timer: 0,
            duration: 60, // 1 second at 60fps
            velocityY: -4 - Math.random() * 2, // Pop upward with slight randomness (-4 to -6)
            rotation: 0
        });
        
        // Play arrow smash sound (playbackRate configured in audio manager)
        this.audioManager.playSound('arrowSmash');
    }
    
    reset() {
        this.arrows = [];
        this.brokenArrows = [];
        this.arrowSpawnTimer = 0;
        this.arrowSpawnDelay = 42;
    }
}