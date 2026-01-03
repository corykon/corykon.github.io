// Snail class with smart defaults to reduce repetitive code
class Snail {
    constructor(options = {}) {
        // Position and size
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 75;
        this.height = options.height || 50;
        
        // Movement properties
        this.velocityY = 0;
        this.isGrounded = true;
        this.direction = options.direction || 1; // 1 = right, -1 = left
        this.speed = options.speed || 1.5;
        
        // Animation properties
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = options.animSpeed || 8;
        
        // Platform patrol area
        this.platformX = options.platformX || 0;
        this.platformWidth = options.platformWidth || 500;
        
        // Health and state
        this.alive = true;
        this.health = 1;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.killed = false; // Track if this specific snail has been killed
        this.id = Math.random().toString(36).substr(2, 9); // Unique identifier
        
        // Hiding mechanics
        this.hidden = false;
        this.hiddenTimer = 0;
        this.hiddenDuration = options.hiddenDuration || 600;
        this.shellDirection = 1;
        
        // Pop and wiggle effects
        this.popVelocityY = 0;
        this.wiggleTimer = 0;
        this.wiggleAmplitude = 0;
        this.groundY = this.y; // Remember ground position for effects
        this.baseX = null; // For wiggle position tracking
    }
}

class EnemyManager {
    constructor(audioManager, game = null) {
        this.audioManager = audioManager;
        this.game = game;
        this.snails = [];
        this.defeatEffects = []; // For the crossfade "bad-guy-defeated.png" effect
        
        // Load snail images
        this.snailImages = {};
        this.loadSnailImages();
        
        // Load defeat effect image
        this.defeatImage = new Image();
        this.defeatImage.src = 'images/sprites/enemy/bad-guy-defeated.png';
    }
    
    loadSnailImages() {
        // Load 6-frame animation cycle
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `images/sprites/enemy/snail-crawl${i}.png`;
            this.snailImages[`crawl${i}`] = img;
        }
        
        // Load shell image
        const shellImg = new Image();
        shellImg.src = 'images/sprites/enemy/snail-shell.png';
        this.snailImages.shell = shellImg;
    }
    
    createSnails(level) {
        this.snails = [];
        
        if (level === 1) {
            this.createLevel1Snails();
        } else if (level === 2) {
            this.createLevel2Snails();
        } else if (level === 3) {
            this.createLevel3Snails();
        }
    }
    
    createLevel1Snails() {
        // Add snails to level 1 - place them on ground platforms
        this.snails.push(
            new Snail({
                x: 1400,
                y: 418, // Ground level (468) minus snail height (50) = 418
                platformX: 1325,
                platformWidth: 525
            }),
            new Snail({
                x: 2600,
                y: 404, // Ground level adjusted for bigger size
                platformX: 2370,
                platformWidth: 900
            }),
            new Snail({
                x: 2750,
                y: 404,
                platformX: 2370,
                platformWidth: 900
            }),
            new Snail({
                x: 4090,
                y: 250,
                platformX: 4000,
                platformWidth: 200
            })
        );
    }

    createLevel2Snails() {
        // Add snail to level 2 - place it on a jungle ground platform
        this.snails.push(
            new Snail({
                x: 2900,
                y: 404,
                platformX: 1900,
                platformWidth: 4000,
                direction: -1
            }),
            new Snail({
                x: 2800,
                y: 404,
                platformX: 1900,
                platformWidth: 4000,
                direction: -1
            }),
            new Snail({
                x: 2700,
                y: 404,
                platformX: 1900,
                platformWidth: 4000,
                direction: -1
            }),
            new Snail({
                x: 3700,
                y: 404,
                platformX: 3522,
                platformWidth: 700
            }),
            new Snail({
                x: 5100,
                y: 404,
                platformX: 5100,
                platformWidth: 770
            }),
            new Snail({
                x: 8800,
                y: 404,
                platformX: 8600,
                platformWidth: 470
            }),
            new Snail({
                x: 12000,
                y: 404,
                platformX: 12000,
                platformWidth: 560
            }),
            new Snail({
                x: 12400,
                y: 404,
                platformX: 12000,
                platformWidth: 560
            })
        );
    }
    
    createLevel3Snails() {
        // Mountain level - plenty of snails on rocky platforms
        this.snails.push(
            // Early mountain snails on ground platforms
            new Snail({
                x: 300,
                y: 440,
                platformX: 0,
                platformWidth: 500
            }),
            new Snail({
                x: 750,
                y: 380,
                platformX: 750,
                platformWidth: 250
            }),
            
            new Snail({
                x: 2200,
                y: 180,
                platformX: 2000,
                platformWidth: 800
            }),
            new Snail({
                x: 2350,
                y: 180,
                platformX: 2000,
                platformWidth: 800
            }),
            new Snail({
                x: 5450,
                y: 220,
                platformX: 5300,
                platformWidth: 500,
            }),
            new Snail({
                x: 5600,
                y: 270,
                platformX: 5300,
                platformWidth: 500,
            }),
            new Snail({
                x: 7000,
                y: 100,
                platformX: 7000,
                platformWidth: 400,
            }),
            new Snail({
                x: 7150,
                y: 100,
                platformX: 7000,
                platformWidth: 400,
            }),
            new Snail({
                x: 7300,
                y: 100,
                platformX: 7000,
                platformWidth: 400,
            }),
            new Snail({
                x: 8500,
                y: 100,
                platformX: 8500,
                platformWidth: 1500,
            }),
            new Snail({
                x: 8600,
                y: 100,
                platformX: 8500,
                platformWidth: 1500,
            }),
            new Snail({
                x: 8700,
                y: 100,
                platformX: 8500,
                platformWidth: 1500,
            }),
            new Snail({
                x: 8800,
                y: 100,
                platformX: 8500,
                platformWidth: 1500,
            }),
            new Snail({
                x: 8900,
                y: 100,
                platformX: 8500,
                platformWidth: 1500,
            }),
            new Snail({
                x: 11250,
                y: 292, // Platform at y=450 minus snail height of 150 minus ground offset of 8 = 292
                platformX: 11250,
                platformWidth: 750, // Updated to match actual platform width
                height: 150,
                width: 225
            }),
            new Snail({
                x: 11350,
                y: 392, // Platform at y=450 minus snail height of 50 minus ground offset of 8 = 392
                platformX: 11250,
                platformWidth: 750, // Updated to match actual platform width
            }),
            new Snail({
                x: 11450,
                y: 392, // Platform at y=450 minus snail height of 50 minus ground offset of 8 = 392
                platformX: 11250,
                platformWidth: 750, // Updated to match actual platform width
            })
        );
        
        // Set isMega property for the large snail
        this.snails.find(snail => snail.width === 225 && snail.height === 150).isMega = true;
    }

    update(player, worldManager, gameState, cameraX = 0, screenWidth = 1200, inputHandler = null, getCurrentJumpPower = null) {
        if (gameState !== 'playing') return;
        
        // Update each snail
        this.snails.forEach(snail => {
            // Update hidden timer
            if (snail.hidden) {
                snail.hiddenTimer++;
                
                // Warning wiggle before coming out (last 2 seconds)
                if (snail.hiddenTimer >= snail.hiddenDuration - 120 && snail.hiddenTimer < snail.hiddenDuration) {
                    if (!snail.baseX) snail.baseX = snail.x; // Remember original position
                    const warningWiggle = Math.sin((snail.hiddenTimer - (snail.hiddenDuration - 120)) * 0.3) * 2;
                    snail.x = snail.baseX + warningWiggle;
                }
                
                if (snail.hiddenTimer >= snail.hiddenDuration) {
                    // Bring snail back out
                    snail.hidden = false;
                    snail.hiddenTimer = 0;
                    snail.alive = true;
                    
                    // Reset position and add pop-up effect
                    if (snail.baseX) {
                        snail.x = snail.baseX; // Reset to base position
                        snail.baseX = null; // Clear base position
                    }
                    snail.groundY = snail.y; // Remember current position
                    snail.popVelocityY = -7; // Jump up 20 pixels
                    snail.wiggleTimer = 40; // Wiggle for longer when coming out
                    snail.wiggleAmplitude = 1.5; // Slightly more wiggle
                    
                    // Play pop sound when coming out of hiding - only if snail is within 200px of screen
                    const screenLeft = cameraX - 200;
                    const screenRight = cameraX + screenWidth + 200;
                    
                    if (snail.x >= screenLeft && snail.x <= screenRight) {
                        this.audioManager.playSound('snailPop');
                    }
                }
                
                // Continue processing pop effects even when hidden (for jump-on effect)
            }
            
            // Update pop effect with wiggle (works for both alive and hidden snails)
            if (snail.popVelocityY !== 0 || snail.wiggleTimer > 0) {
                // Vertical pop motion
                if (snail.popVelocityY !== 0) {
                    snail.y += snail.popVelocityY;
                    snail.popVelocityY += 0.3; // Gravity for pop effect
                    if (snail.popVelocityY > 0 && snail.y >= snail.groundY) {
                        snail.y = snail.groundY;
                        snail.popVelocityY = 0;
                    }
                }
                
                // Wiggle motion while popping
                if (snail.wiggleTimer > 0) {
                    if (!snail.baseX) snail.baseX = snail.x; // Remember base position
                    snail.wiggleTimer--;
                    const wiggleOffset = Math.sin(snail.wiggleTimer * 0.3) * snail.wiggleAmplitude;
                    snail.x = snail.baseX + wiggleOffset;
                    
                    // Reset base position when wiggle is done
                    if (snail.wiggleTimer <= 0) {
                        snail.x = snail.baseX;
                        snail.baseX = null;
                    }
                }
            }
            
            // Skip other updates if hidden (but still allow pop effects above)
            if (snail.hidden) {
                return;
            }
            
            if (!snail.alive) return;
            
            // Update invulnerability timer
            if (snail.invulnerable) {
                snail.invulnerabilityTimer++;
                if (snail.invulnerabilityTimer > 60) { // 1 second at 60fps
                    snail.invulnerable = false;
                    snail.invulnerabilityTimer = 0;
                }
            }
            
            // Platform patrol movement
            this.updateSnailMovement(snail);
            
            // Apply gravity
            snail.velocityY += 0.42; // Same gravity as player
            snail.y += snail.velocityY;
            
            // Platform collisions
            worldManager.checkPlatformCollisions(snail);
            
            if (snail.isGrounded) {
                snail.y += 8;
            }
            
            // Update animation
            this.updateSnailAnimation(snail);
        });
        
        // Update defeat effects
        this.updateDefeatEffects();
    }
    
    updateSnailMovement(snail) {
        if (!snail.alive) return;
        
        // Check platform boundaries with margin to prevent edge clipping
        const leftEdge = snail.platformX + 5;
        const rightEdge = snail.platformX + snail.platformWidth - snail.width - 5;
        
        // Change direction if reaching platform edge or hitting barrier
        if (snail.x <= leftEdge && snail.direction === -1) {
            snail.direction = 1; // Turn right
            snail.x = leftEdge; // Ensure snail stays on platform
        } else if (snail.x >= rightEdge && snail.direction === 1) {
            snail.direction = -1; // Turn left
            snail.x = rightEdge; // Ensure snail stays on platform
        }
        
        // Move horizontally
        const nextX = snail.x + snail.speed * snail.direction;
        
        // Only move if within bounds, otherwise turn around
        if (nextX >= leftEdge && nextX <= rightEdge) {
            snail.x = nextX;
        } else {
            snail.direction *= -1; // Turn around
        }
        
        // Final safety check to keep within platform bounds
        snail.x = Math.max(leftEdge, Math.min(rightEdge, snail.x));
    }
    
    updateSnailAnimation(snail) {
        if (!snail.alive) return;
        
        snail.animTimer++;
        if (snail.animTimer >= snail.animSpeed) {
            snail.animFrame = (snail.animFrame + 1) % 6; // 6 frames
            snail.animTimer = 0;
        }
    }
    
    updateDefeatEffects() {
        this.defeatEffects.forEach(effect => {
            effect.timer++;
            effect.alpha = Math.max(0, 1 - (effect.timer / effect.duration));
        });
        
        // Remove expired effects
        this.defeatEffects = this.defeatEffects.filter(effect => effect.timer < effect.duration);
    }
    
    checkCollisions(player, hasArmor, inputHandler = null, getCurrentJumpPower = null) {
        const collisions = [];
        
        this.snails.forEach(snail => {
            if (!snail.alive || snail.invulnerable) return;
            
            // Create player hitbox
            const playerHitbox = {
                x: player.x,
                y: player.isDucking ? player.y + player.height * 0.2 : player.y - 16,
                width: player.width,
                height: player.isDucking ? player.height * 0.8 + 16 : player.height + 16
            };
            
            if (this.checkCollision(playerHitbox, snail)) {
                // Check if player is jumping on snail (coming from above)
                const playerBottom = player.y + player.height;
                const snailTop = snail.y;
                const playerCenterX = player.x + player.width / 2;
                const snailCenterX = snail.x + snail.width / 2;
                
                // Proper "jumping on" detection
                const landingOnTop = playerBottom >= snailTop && playerBottom <= snailTop + snail.height * 0.5; // Player's feet penetrate upper half of snail
                const horizontalAlignment = Math.abs(playerCenterX - snailCenterX) < snail.width * 0.8; // More forgiving horizontal alignment
                const downwardMovement = player.velocityY > 0; // Must be moving downward
                const comingFromAbove = player.y < snailTop; // Player's top must be above snail's top
                
                if (landingOnTop && horizontalAlignment && downwardMovement && comingFromAbove) {
                    // Player jumped on snail - kill it
                    this.killSnail(snail);
                    // Give player a bounce - use full jump power if jump key is held
                    const jumpKeyHeld = typeof inputHandler !== 'undefined' && inputHandler && inputHandler.keys && 
                                       (inputHandler.keys['ArrowUp'] || inputHandler.keys['Space']);
                    const jumpPower = (jumpKeyHeld && typeof getCurrentJumpPower !== 'undefined' && getCurrentJumpPower) ? 
                                     getCurrentJumpPower() : -6;
                    player.velocityY = jumpPower;
                } else if (hasArmor) {
                    // Player has armor - armor kills snail on any contact
                    this.killSnail(snail);
                } else {
                    // Side collision without armor - snail hurts player
                    collisions.push({
                        source: snail,
                        x: snail.x + snail.width / 2,
                        y: snail.y + snail.height / 2
                    });
                }
            }
        });
        
        return collisions;
    }
    
    killSnail(snail) {
        snail.alive = false;
        snail.hidden = true;
        snail.hiddenTimer = 0;
        snail.shellDirection = snail.direction; // Remember which way snail was facing
        snail.killed = true; // Mark this specific snail as killed
        
        // Add scoring based on snail type
        if (this.game) {
            const basePoints = snail.isMega ? 1000 : 200;
            
            // Handle combo system for arrow kills
            if (!this.game.player.isGrounded && this.game.comboMode) {
                // Continue combo - increase multiplier
                this.game.comboMultiplier++;
                this.game.airborneKills++;
            } else if (!this.game.player.isGrounded && !this.game.comboMode) {
                // Start combo mode if airborne
                this.game.comboMode = true;
                this.game.comboMultiplier = 1; // First kill is normal
                this.game.airborneKills = 1;
            }
            
            // Apply multiplier if in combo mode
            const points = this.game.comboMode ? basePoints * this.game.comboMultiplier : basePoints;
            const color = this.game.comboMode && this.game.comboMultiplier > 1 ? '#FF6B6B' : '#E74C3C';
            
            // Create label with multiplier if applicable
            let label = "Snail";
            if (this.game.comboMode && this.game.comboMultiplier > 1) {
                label += ` x${this.game.comboMultiplier}`;
            }
            
            this.game.addScore(points, color, label);
            
            // Track enemy types killed for bonus (keep for backwards compatibility)
            const enemyType = snail.isMega ? 'megaSnail' : 'snail';
            this.game.enemiesKilled.add(enemyType);
        }
        
        // Add enhanced pop-up effect with wiggle
        snail.groundY = snail.y; // Remember ground position
        snail.popVelocityY = -3; // Pop up about 7-8 pixels (half the previous height)
        snail.wiggleTimer = 30; // Wiggle for half a second
        snail.wiggleAmplitude = 1.5; // More noticeable wiggle
        
        // Play smash sound
        this.audioManager.playSound('smash');
        this.audioManager.playSound('snailYell');
        
        // Create defeat effect
        this.defeatEffects.push({
            x: snail.x,
            y: snail.y,
            width: snail.width,
            height: snail.height,
            timer: 0,
            duration: 30, // Fade duration in frames
            alpha: 1
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render(ctx) {
        // Render snails
        this.snails.forEach(snail => {
            if (snail.hidden) {
                // Render shell facing the direction snail was going
                const shellImg = this.snailImages.shell;
                if (shellImg && shellImg.complete) {
                    ctx.save();
                    
                    // Flip horizontally if snail was moving left
                    if (snail.shellDirection === -1) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(shellImg, -snail.x - snail.width, snail.y, snail.width, snail.height);
                    } else {
                        ctx.drawImage(shellImg, snail.x, snail.y, snail.width, snail.height);
                    }
                    
                    ctx.restore();
                }
            } else if (snail.alive) {
                // Render animated snail
                const frameImg = this.snailImages[`crawl${snail.animFrame + 1}`];
                if (frameImg && frameImg.complete) {
                    ctx.save();
                    
                    // Flip horizontally if moving left
                    if (snail.direction === -1) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(frameImg, -snail.x - snail.width, snail.y, snail.width, snail.height);
                    } else {
                        ctx.drawImage(frameImg, snail.x, snail.y, snail.width, snail.height);
                    }
                    
                    ctx.restore();
                }
            }
        });
        
        // Render defeat effects
        this.defeatEffects.forEach(effect => {
            if (this.defeatImage && this.defeatImage.complete) {
                ctx.save();
                ctx.globalAlpha = effect.alpha;
                ctx.drawImage(this.defeatImage, effect.x, effect.y, effect.width, effect.height);
                ctx.restore();
            }
        });
    }
    
    reset() {
        this.snails = [];
        this.defeatEffects = [];
    }
    
    setLevel(level) {
        this.reset();
        this.createSnails(level);
    }
}