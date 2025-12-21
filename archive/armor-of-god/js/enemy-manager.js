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
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.snails = [];
        this.defeatEffects = []; // For the crossfade "bad-guy-defeated.png" effect
        
        // Load snail images
        this.snailImages = {};
        this.loadSnailImages();
        
        // Load defeat effect image
        this.defeatImage = new Image();
        this.defeatImage.src = 'images/enemy-frames/bad-guy-defeated.png';
    }
    
    loadSnailImages() {
        // Load 6-frame animation cycle
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `images/enemy-frames/snail-crawl${i}.png`;
            this.snailImages[`crawl${i}`] = img;
        }
        
        // Load shell image
        const shellImg = new Image();
        shellImg.src = 'images/enemy-frames/snail-shell.png';
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
                x: 2800,
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
                x: 500,
                y: 410, // Adjusted for inclined platform
                platformX: 400,
                platformWidth: 300
            }),
            new Snail({
                x: 800,
                y: 400, // On inclined platform
                platformX: 700,
                platformWidth: 350
            }),
            new Snail({
                x: 1800,
                y: 370, // On higher inclined platform
                platformX: 1600,
                platformWidth: 400
            }),
            
            // Snails on rocky floating platforms
            new Snail({
                x: 2500,
                y: 320,
                platformX: 2450,
                platformWidth: 100,
                width: 60, // Smaller for floating platforms
                height: 40
            }),
            new Snail({
                x: 2700,
                y: 290,
                platformX: 2650,
                platformWidth: 120,
                width: 60,
                height: 40
            }),
            
            // More ground snails
            new Snail({
                x: 3200,
                y: 350,
                platformX: 3050,
                platformWidth: 500
            }),
            new Snail({
                x: 3700,
                y: 335,
                platformX: 3550,
                platformWidth: 400,
                direction: -1
            }),
            
            // Snails on high plateau after vertical climb
            new Snail({
                x: 4600,
                y: 120,
                platformX: 4550,
                platformWidth: 600,
                width: 80, // Bigger mountain snails
                height: 55
            }),
            new Snail({
                x: 4900,
                y: 120,
                platformX: 4550,
                platformWidth: 600,
                width: 80,
                height: 55,
                direction: -1
            }),
            
            // Snails on descent platforms
            new Snail({
                x: 5450,
                y: 220,
                platformX: 5400,
                platformWidth: 150,
                width: 60,
                height: 40
            }),
            new Snail({
                x: 5650,
                y: 270,
                platformX: 5600,
                platformWidth: 150,
                width: 60,
                height: 40
            }),
            
            // More ground section snails
            new Snail({
                x: 6200,
                y: 418,
                platformX: 6000,
                platformWidth: 500
            }),
            new Snail({
                x: 6400,
                y: 418,
                platformX: 6000,
                platformWidth: 500,
                direction: -1
            }),
            new Snail({
                x: 6800,
                y: 408,
                platformX: 6600,
                platformWidth: 400
            }),
            new Snail({
                x: 7400,
                y: 390,
                platformX: 7200,
                platformWidth: 300
            }),
            new Snail({
                x: 7700,
                y: 370,
                platformX: 7500,
                platformWidth: 350,
                direction: -1
            }),
            
            // Second vertical section snails
            new Snail({
                x: 8100,
                y: 270,
                platformX: 8050,
                platformWidth: 120,
                width: 60,
                height: 40
            }),
            new Snail({
                x: 8250,
                y: 190,
                platformX: 8200,
                platformWidth: 150,
                width: 60,
                height: 40
            }),
            
            // Floating platform snails
            new Snail({
                x: 8650,
                y: 350,
                platformX: 8600,
                platformWidth: 140,
                width: 60,
                height: 40
            }),
            new Snail({
                x: 8900,
                y: 290,
                platformX: 8850,
                platformWidth: 100,
                width: 50,
                height: 35
            }),
            
            // Final approach snails
            new Snail({
                x: 9300,
                y: 400,
                platformX: 9100,
                platformWidth: 400
            }),
            new Snail({
                x: 9700,
                y: 380,
                platformX: 9500,
                platformWidth: 400,
                direction: -1
            }),
            new Snail({
                x: 10100,
                y: 350,
                platformX: 9900,
                platformWidth: 500
            }),
            new Snail({
                x: 10300,
                y: 350,
                platformX: 9900,
                platformWidth: 500,
                direction: -1
            }),
            new Snail({
                x: 10600,
                y: 320,
                platformX: 10400,
                platformWidth: 400
            }),
            
            // Final challenge platform snails
            new Snail({
                x: 11950,
                y: 320,
                platformX: 11900,
                platformWidth: 150,
                width: 60,
                height: 40
            }),
            
            // Temple approach ground snails
            new Snail({
                x: 12300,
                y: 418,
                platformX: 12100,
                platformWidth: 800
            }),
            new Snail({
                x: 12600,
                y: 418,
                platformX: 12100,
                platformWidth: 800,
                direction: -1
            }),
            new Snail({
                x: 13200,
                y: 418,
                platformX: 12900,
                platformWidth: 600
            }),
            new Snail({
                x: 14000,
                y: 418,
                platformX: 13500,
                platformWidth: 1500
            }),
            new Snail({
                x: 14500,
                y: 418,
                platformX: 13500,
                platformWidth: 1500,
                direction: -1
            })
        );
    }

    update(player, worldManager, gameState, cameraX = 0, screenWidth = 1200) {
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
    
    checkCollisions(player, hasArmor) {
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
                const snailBottom = snail.y + snail.height;
                const playerCenterX = player.x + player.width / 2;
                const snailCenterX = snail.x + snail.width / 2;
                
                // Much stricter "jumping on" detection
                const comingFromAbove = player.y + player.height * 0.8 < snailTop + snail.height * 0.2; // Player's feet must be above snail's upper portion
                const horizontalAlignment = Math.abs(playerCenterX - snailCenterX) < snail.width * 0.6; // Tighter horizontal alignment
                const downwardMovement = player.velocityY > 0; // Must be moving downward
                const playerAboveSnail = player.y < snail.y - 10; // Player's top must be well above snail
                
                if (comingFromAbove && horizontalAlignment && downwardMovement && playerAboveSnail) {
                    // Player jumped on snail - kill it
                    this.killSnail(snail);
                    // Give player a bounce
                    player.velocityY = -6;
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