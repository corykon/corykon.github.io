class CharacterRenderer {
    constructor() {
        // Animation frame tracking
        this.animationTime = 0;
        
        // Sprite images cache
        this.sprites = {};
        this.spritesLoaded = false;
        
        // Animation states and timers
        this.runAnimFrame = 0;
        this.runAnimTimer = 0;
        this.petAnimFrame = 0;
        this.petAnimTimer = 0;
        this.petAnimCycles = 0;
        this.wasMovingLastFrame = false;
        this.stoppingAnimTimer = 0;
        this.isPetting = false;
        this.wasFalling = false;
        this.duckAnimFrame = 0;
        this.duckAnimTimer = 0;
        
        // Pet animation states
        this.petRunAnimFrame = 0;
        this.petRunAnimTimer = 0;
        this.petTailWagFrame = 0;
        this.petTailWagTimer = 0;
        this.petTailWagCycle = 0;
        
        // Animation speeds (higher = slower)
        this.runAnimSpeed = 3;
        this.petAnimSpeed = 8;
        this.duckAnimSpeed = 8;
        this.petRunAnimSpeed = 5;
        this.petTailWagSpeed = 15;
        this.stoppingAnimDuration = 6;
        
        // Load all sprite images
        this.loadSprites();
    }
    
    loadSprites() {
        const spriteNames = [
            'standing', 'jump', 'drop', 'stopping',
            'pet1', 'pet2', 'pet3',
            'duck1', 'duck2', 'duck3',
            'run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7',
            'run8', 'run9', 'run10', 'run11', 'run12', 'run13', 'run14'
        ];
        
        const armorSpriteNames = [
            'armor-standing', 'armor-jump', 'armor-drop',
            'armor-pet1', 'armor-pet2', 'armor-pet3',
            'armor-duck1', 'armor-duck2', 'armor-duck3',
            'armor-run1', 'armor-run2', 'armor-run3', 'armor-run4',
            'armor-run5', 'armor-run6', 'armor-run7', 'armor-run8'
        ];
        
        // Pet sprites
        const petSpriteNames = [
            // Dog sprites
            'dog-stand', 'dog-run1', 'dog-run2', 'dog-run3', 'dog-run4', 'dog-run5',
            'dog-jump1', 'dog-jump2', 'dog-tailwag1', 'dog-tailwag2',
            // Cat sprites  
            'cat-stand', 'cat-run1', 'cat-run2', 'cat-run3', 'cat-run4',
            'cat-jump1', 'cat-jump2', 'cat-tailwag1', 'cat-tailwag2'
        ];
        
        const allSpriteNames = [...spriteNames, ...armorSpriteNames, ...petSpriteNames];
        let loadedCount = 0;
        const totalSprites = allSpriteNames.length;
        
        allSpriteNames.forEach(spriteName => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.src = `images/main-char-frames/${spriteName}.png`;
            this.sprites[spriteName] = img;
        });
    }
    
    // Reusable frame cycling function for any animation sequence
    cycleFrames(frameArray, currentFrame, timer, speed, loop = true) {
        const newTimer = timer + 1;
        if (newTimer >= speed) {
            const newFrame = currentFrame + 1;
            if (newFrame >= frameArray.length) {
                return {
                    frame: loop ? 0 : frameArray.length - 1,
                    timer: 0,
                    completed: !loop
                };
            }
            return { frame: newFrame, timer: 0, completed: false };
        }
        return { frame: currentFrame, timer: newTimer, completed: false };
    }
    
    // Get the current sprite based on player state
    getCurrentSprite(player, hasArmor = false) {
        if (!this.spritesLoaded) {
            return null; // Will fall back to rectangle rendering
        }
        
        // Handle petting animation
        if (this.isPetting) {
            // pet1, then repeat pet2->pet3 pattern 3 times: pet1, pet2, pet3, pet2, pet3, pet2, pet3
            const petFrames = [0, 1, 2, 1, 2, 1, 2];
            const currentFrameIndex = Math.min(this.petAnimFrame, petFrames.length - 1);
            const spriteIndex = petFrames[currentFrameIndex];
            
            const prefix = hasArmor ? 'armor-' : '';
            if (spriteIndex === 0) return this.sprites[`${prefix}pet1`];
            if (spriteIndex === 1) return this.sprites[`${prefix}pet2`];
            if (spriteIndex === 2) return this.sprites[`${prefix}pet3`];
            return this.sprites[`${prefix}standing`];
        }
        
        // Handle stopping animation
        if (this.stoppingAnimTimer > 0) {
            const prefix = hasArmor ? 'armor-' : '';
            return this.sprites[`${prefix}standing`]; // Use standing for armor since no armor-stopping
        }
        
        // Handle ducking states
        if (player.isDucking && player.isGrounded) {
            const prefix = hasArmor ? 'armor-' : '';
            if (player.isMoving) {
                // Cycle: duck2, duck1, duck3, duck1 when moving while ducking
                const duckFrames = [1, 0, 2, 0]; // duck2=1, duck1=0, duck3=2, duck1=0
                const spriteIndex = duckFrames[this.duckAnimFrame];
                
                if (spriteIndex === 0) return this.sprites[`${prefix}duck1`];
                if (spriteIndex === 1) return this.sprites[`${prefix}duck2`];
                if (spriteIndex === 2) return this.sprites[`${prefix}duck3`];
                return this.sprites[`${prefix}duck1`];
            } else {
                // Use duck1 when ducking at rest
                return this.sprites[`${prefix}duck1`];
            }
        }
        
        // Handle jumping states
        if (!player.isGrounded) {
            const prefix = hasArmor ? 'armor-' : '';
            if (player.velocityY < 0) {
                return this.sprites[`${prefix}jump`];
            } else {
                // Check if this is a drop from ledge vs normal fall
                return this.wasFalling ? this.sprites[`${prefix}drop`] : this.sprites[`${prefix}drop`];
            }
        }
        
        // Handle movement
        if (player.isMoving) {
            if (hasArmor) {
                // Armor has 8 running frames
                const armorRunFrames = ['armor-run1', 'armor-run2', 'armor-run3', 'armor-run4', 
                                       'armor-run5', 'armor-run6', 'armor-run7', 'armor-run8'];
                const frameIndex = this.runAnimFrame % armorRunFrames.length;
                return this.sprites[armorRunFrames[frameIndex]];
            } else {
                // Regular has 14 running frames
                const runFrames = ['run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7', 
                                  'run8', 'run9', 'run10', 'run11', 'run12', 'run13', 'run14'];
                return this.sprites[runFrames[this.runAnimFrame]];
            }
        }
        
        // Default standing
        const prefix = hasArmor ? 'armor-' : '';
        return this.sprites[`${prefix}standing`];
    }
    
    update() {
        this.animationTime++;
    }
    
    // Update pet animations
    updatePetAnimations(pet) {
        // Update running animation
        if (pet.isMoving) {
            this.petRunAnimTimer++;
            if (this.petRunAnimTimer >= this.petRunAnimSpeed) {
                this.petRunAnimTimer = 0;
                if (pet.type === 'cat') {
                    this.petRunAnimFrame = (this.petRunAnimFrame + 1) % 4; // cat has 4 run frames
                } else {
                    this.petRunAnimFrame = (this.petRunAnimFrame + 1) % 5; // dog has 5 run frames
                }
            }
        } else {
            this.petRunAnimFrame = 0;
            this.petRunAnimTimer = 0;
        }
        
        // Update tail wag animation when idle
        if (!pet.isMoving && !pet.isBeingPetted) {
            this.petTailWagTimer++;
            if (this.petTailWagTimer >= this.petTailWagSpeed) {
                this.petTailWagTimer = 0;
                
                if (pet.type === 'cat') {
                    // Cat cycle: stand, tailwag1, tailwag2, tailwag1, stand
                    const catCycle = [0, 1, 2, 1, 0]; // 0=stand, 1=tailwag1, 2=tailwag2
                    this.petTailWagCycle = (this.petTailWagCycle + 1) % catCycle.length;
                    this.petTailWagFrame = catCycle[this.petTailWagCycle];
                } else {
                    // Dog cycle: stand, tailwag1, stand, tailwag2, stand, tailwag1
                    const dogCycle = [0, 1, 0, 2, 0, 1]; // 0=stand, 1=tailwag1, 2=tailwag2
                    this.petTailWagCycle = (this.petTailWagCycle + 1) % dogCycle.length;
                    this.petTailWagFrame = dogCycle[this.petTailWagCycle];
                }
            }
        }
    }
    
    renderPlayer(ctx, player, hasArmor, gameState, isPaused = false) {
        // Update animation states based on player movement (but freeze when dying, celebrating, or paused)
        if (gameState !== 'dying' && gameState !== 'celebrating' && !isPaused) {
            this.updateAnimationStates(player);
        }
        
        // Apply flashing effect when invulnerable
        const shouldFlash = player.invulnerable && Math.floor(player.invulnerabilityTimer / 4) % 2 === 0;
        if (shouldFlash) {
            ctx.globalAlpha = 0.5;
        }
        
        // Apply alpha transparency for temple entrance fade
        if (player.alpha !== undefined && player.alpha !== 1) {
            ctx.globalAlpha = player.alpha;
        }
        
        // Get current sprite
        const currentSprite = this.getCurrentSprite(player, hasArmor);
        
        if (currentSprite && this.spritesLoaded) {
            // Check if this is the armor-jump frame which needs special scaling (45% taller)
            const isArmorJump = hasArmor && currentSprite === this.sprites['armor-jump'];
            const jumpScaleMultiplier = isArmorJump ? 1.45 : 1.0;
            
            // Render sprite-based character (72.8% bigger total - 1.44 * 1.2 = 1.728)
            const renderWidth = player.width * 1.728;
            const renderHeight = player.height * 1.728 * jumpScaleMultiplier;
            const offsetX = (renderWidth - player.width) / 2;
            const offsetY = (renderHeight - player.height) / 2 + 5; // +5px to position above grass
            
            ctx.save();
            
            // Handle horizontal flipping for movement direction and petting
            let shouldFlipHorizontally = !player.facingRight;
            
            if (shouldFlipHorizontally) {
                ctx.scale(-1, 1);
                ctx.drawImage(currentSprite, -player.x - renderWidth + offsetX, player.y - offsetY, renderWidth, renderHeight);
            } else {
                ctx.drawImage(currentSprite, player.x - offsetX, player.y - offsetY, renderWidth, renderHeight);
            }
            
            ctx.restore();
        } else {
            // Fallback to rectangle rendering if sprites not loaded
            this.renderPlayerFallback(ctx, player, hasArmor);
        }
        
        // Reset alpha after player drawing
        if (shouldFlash) {
            ctx.globalAlpha = 1.0;
        }
    }
    
    // Update animation states based on player behavior
    updateAnimationStates(player) {
        // Track falling state
        if (!player.isGrounded && player.velocityY > 0) {
            this.wasFalling = true;
        } else if (player.isGrounded) {
            this.wasFalling = false;
        }
        
        // Handle ducking animation
        if (player.isDucking && player.isMoving && player.isGrounded) {
            this.duckAnimTimer++;
            if (this.duckAnimTimer >= this.duckAnimSpeed) {
                this.duckAnimFrame = (this.duckAnimFrame + 1) % 4; // Cycle through 4 frames: duck2, duck1, duck3, duck1
                this.duckAnimTimer = 0;
            }
        } else {
            // Reset duck animation when not ducking and moving
            this.duckAnimFrame = 0;
            this.duckAnimTimer = 0;
        }
        
        // Handle running animation (only when not ducking)
        if (player.isMoving && player.isGrounded && !player.isDucking) {
            const runFrames = ['run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7', 
                              'run8', 'run9', 'run10', 'run11', 'run12', 'run13', 'run14'];
            const result = this.cycleFrames(runFrames, this.runAnimFrame, this.runAnimTimer, this.runAnimSpeed);
            this.runAnimFrame = result.frame;
            this.runAnimTimer = result.timer;
            this.wasMovingLastFrame = true;
            this.stoppingAnimTimer = 0;
        } else if (this.wasMovingLastFrame && player.isGrounded && !player.isMoving) {
            // Start stopping animation
            this.wasMovingLastFrame = false;
            this.stoppingAnimTimer = this.stoppingAnimDuration;
        }
        
        // Handle stopping animation countdown
        if (this.stoppingAnimTimer > 0) {
            this.stoppingAnimTimer--;
        }
        
        // Handle petting animation
        if (this.isPetting) {
            this.petAnimTimer++;
            
            if (this.petAnimTimer >= this.petAnimSpeed) {
                this.petAnimTimer = 0;
                this.petAnimFrame++;
                
                // pet1, then repeat pet2->pet3 pattern 3 times: pet1, pet2, pet3, pet2, pet3, pet2, pet3
                const petFrames = [0, 1, 2, 1, 2, 1, 2];
                
                if (this.petAnimFrame >= petFrames.length) {
                    // End petting after complete cycle with 3 repetitions
                    this.isPetting = false;
                    this.petAnimCycles = 0;
                    this.petAnimFrame = 0;
                    this.petAnimTimer = 0;
                }
            }
        }
    }
    
    // Start petting animation
    startPettingAnimation() {
        this.isPetting = true;
        this.petAnimFrame = 0;
        this.petAnimTimer = 0;
        this.petAnimCycles = 0;
    }
    
    // Fallback rendering method (original rectangle-based rendering)
    renderPlayerFallback(ctx, player, hasArmor) {
        const playerHeight = player.isDucking ? player.height * 0.7 : player.height;
        const playerY = player.isDucking ? player.y + player.height * 0.3 : player.y;
        const headY = player.isDucking ? player.y + player.height * 0.2 : player.y - 16;
        
        // Player head (larger and more detailed)
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(player.x + 8, headY, 16, 16);
        
        // Hair/head covering or helmet
        if (hasArmor) {
            // Helmet of Salvation
            ctx.fillStyle = '#C0C0C0'; // Silver helmet
            ctx.fillRect(player.x + 6, headY - 2, 20, 10); // Main helmet
            
            // Helmet details
            ctx.fillStyle = '#A9A9A9'; // Darker silver for depth
            ctx.fillRect(player.x + 6, headY - 2, 20, 2); // Top rim
            ctx.fillRect(player.x + 6, headY + 6, 20, 2); // Bottom rim
            
            // Face guard/visor opening
            ctx.fillStyle = '#2F2F2F'; // Dark opening
            ctx.fillRect(player.x + 8, headY + 2, 16, 4);
            
            // Cross emblem on forehead
            ctx.fillStyle = '#FFD700'; // Gold cross
            ctx.fillRect(player.x + 14, headY - 1, 4, 3); // Vertical
            ctx.fillRect(player.x + 12, headY, 8, 1); // Horizontal
        } else {
            // Regular hair
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(player.x + 8, headY, 16, 6);
        }
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 10, headY + 4, 3, 2);
        ctx.fillRect(player.x + 19, headY + 4, 3, 2);
        
        // Eye pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 11, headY + 4, 1, 2);
        ctx.fillRect(player.x + 20, headY + 4, 1, 2);
        
        // Body/chest
        ctx.fillStyle = '#4169E1'; // Royal blue shirt
        ctx.fillRect(player.x + 6, playerY, 20, playerHeight * 0.6);
        
        // Arms - animated when moving
        const leftArmOffset = player.isMoving && player.isGrounded && !player.isDucking ? 
            (player.animFrame === 1 ? -1 : player.animFrame === 3 ? 1 : 0) : 0;
        const rightArmOffset = player.isMoving && player.isGrounded && !player.isDucking ? 
            (player.animFrame === 1 ? 1 : player.animFrame === 3 ? -1 : 0) : 0;
        
        ctx.fillStyle = '#FDBCB4';
        // Left arm
        ctx.fillRect(player.x + 2 + leftArmOffset, playerY + 4, 6, 16);
        // Right arm
        ctx.fillRect(player.x + 24 + rightArmOffset, playerY + 4, 6, 16);
        
        // Render sword if armored
        if (hasArmor) {
            this.renderSword(ctx, player, playerY);
        }
        
        // Armor pieces (breastplate and belt)
        if (hasArmor) {
            // Breastplate of Righteousness
            ctx.fillStyle = '#C0C0C0'; // Silver armor
            ctx.fillRect(player.x + 8, playerY + 2, 16, 12);
            
            // Armor details (studs/rivets)
            ctx.fillStyle = '#A9A9A9'; // Darker silver for depth
            ctx.fillRect(player.x + 10, playerY + 4, 2, 2);
            ctx.fillRect(player.x + 20, playerY + 4, 2, 2);
            ctx.fillRect(player.x + 10, playerY + 10, 2, 2);
            ctx.fillRect(player.x + 20, playerY + 10, 2, 2);
            
            // Belt of Truth (golden belt)
            ctx.fillStyle = '#FFD700'; // Gold belt
            ctx.fillRect(player.x + 4, playerY + playerHeight * 0.5, 24, 4);
            
            // Belt buckle
            ctx.fillStyle = '#FFA500'; // Orange buckle center
            ctx.fillRect(player.x + 14, playerY + playerHeight * 0.5, 4, 4);
        }
        
        // Animated Legs/pants
        this.renderLegs(ctx, player, playerY, playerHeight);
    }
    
    renderSword(ctx, player, playerY) {
        const leftArmOffset = player.isMoving && player.isGrounded && !player.isDucking ? 
            (player.animFrame === 1 ? -1 : player.animFrame === 3 ? 1 : 0) : 0;
        
        // Sword blade
        ctx.fillStyle = '#C0C0C0'; // Silver blade
        ctx.fillRect(player.x - 8 + leftArmOffset, playerY - 8, 4, 20);
        
        // Sword tip
        ctx.fillRect(player.x - 7 + leftArmOffset, playerY - 10, 2, 2);
        
        // Sword hilt
        ctx.fillStyle = '#654321'; // Brown hilt
        ctx.fillRect(player.x - 10 + leftArmOffset, playerY + 12, 8, 4);
        
        // Cross guard
        ctx.fillStyle = '#FFD700'; // Gold cross guard
        ctx.fillRect(player.x - 12 + leftArmOffset, playerY + 10, 12, 2);
    }
    
    renderShield(ctx, player, playerY) {
        const rightArmOffset = player.isMoving && player.isGrounded && !player.isDucking ? 
            (player.animFrame === 1 ? 1 : player.animFrame === 3 ? -1 : 0) : 0;
        
        // Shield base
        ctx.fillStyle = '#8B4513'; // Brown shield base
        ctx.fillRect(player.x + 34 + rightArmOffset, playerY, 8, 16);
        
        // Shield metal rim
        ctx.fillStyle = '#C0C0C0'; // Silver rim
        ctx.fillRect(player.x + 33 + rightArmOffset, playerY - 1, 10, 2);
        ctx.fillRect(player.x + 33 + rightArmOffset, playerY + 15, 10, 2);
        ctx.fillRect(player.x + 33 + rightArmOffset, playerY, 2, 16);
        ctx.fillRect(player.x + 41 + rightArmOffset, playerY, 2, 16);
        
        // Cross emblem on shield
        ctx.fillStyle = '#FFD700'; // Gold cross
        ctx.fillRect(player.x + 37 + rightArmOffset, playerY + 2, 2, 12); // Vertical
        ctx.fillRect(player.x + 35 + rightArmOffset, playerY + 7, 6, 2); // Horizontal
    }
    
    renderLegs(ctx, player, playerY, playerHeight) {
        ctx.fillStyle = '#000080'; // Navy blue pants
        
        if (player.isMoving && player.isGrounded && !player.isDucking) {
            // Animated leg movement
            let leftLegOffset = 0;
            let rightLegOffset = 0;
            
            switch (player.animFrame) {
                case 0:
                    leftLegOffset = 0; rightLegOffset = 0;
                    break;
                case 1: // Left leg forward
                    leftLegOffset = 2; rightLegOffset = -1;
                    break;
                case 2:
                    leftLegOffset = 0; rightLegOffset = 0;
                    break;
                case 3: // Right leg forward
                    leftLegOffset = -1; rightLegOffset = 2;
                    break;
            }
            
            ctx.fillRect(player.x + 8 + leftLegOffset, playerY + playerHeight * 0.6, 6, playerHeight * 0.4);
            ctx.fillRect(player.x + 18 + rightLegOffset, playerY + playerHeight * 0.6, 6, playerHeight * 0.4);
            
            // Feet (simple rectangles)
            ctx.fillStyle = '#654321'; // Brown shoes
            ctx.fillRect(player.x + 6 + leftLegOffset, playerY + playerHeight - 4, 10, 4);
            ctx.fillRect(player.x + 16 + rightLegOffset, playerY + playerHeight - 4, 10, 4);
        } else {
            // Static leg position
            ctx.fillRect(player.x + 8, playerY + playerHeight * 0.6, 6, playerHeight * 0.4);
            ctx.fillRect(player.x + 18, playerY + playerHeight * 0.6, 6, playerHeight * 0.4);
            
            // Feet (simple rectangles)
            ctx.fillStyle = '#654321'; // Brown shoes
            ctx.fillRect(player.x + 6, playerY + playerHeight - 4, 10, 4);
            ctx.fillRect(player.x + 16, playerY + playerHeight - 4, 10, 4);
        }
    }

    renderPet(ctx, pet, isPaused = false) {
        if (!this.spritesLoaded) {
            // Fallback to old rendering if sprites aren't loaded
            this.renderPetFallback(ctx, pet);
            return;
        }
        
        // Update pet animations only if game is not paused
        if (!isPaused) {
            this.updatePetAnimations(pet);
        }
        
        // Get the current sprite
        const sprite = this.getCurrentPetSprite(pet);
        if (!sprite) {
            this.renderPetFallback(ctx, pet);
            return;
        }
        
        // Render the sprite
        ctx.save();
        
        // Apply alpha transparency for temple entrance fade
        if (pet.alpha !== undefined && pet.alpha !== 1) {
            ctx.globalAlpha = pet.alpha;
        }
        
        // Calculate sprite scaling and positioning
        const spriteScale = 3;
        const scaledWidth = pet.width * spriteScale;
        const scaledHeight = pet.height * spriteScale;
        
        // Center the larger sprite on the pet's collision box
        const offsetX = (scaledWidth - pet.width) / 2;
        const offsetY = (scaledHeight - pet.height) / 2;
        const spriteX = pet.x - offsetX;
        const spriteY = pet.y - offsetY;
        
        // Handle facing direction
        if (!pet.facingRight) {
            // Flip horizontally around the center of the sprite
            const centerX = spriteX + scaledWidth / 2;
            ctx.translate(centerX, 0);
            ctx.scale(-1, 1);
            ctx.translate(-centerX, 0);
        }
        
        ctx.drawImage(sprite, spriteX, spriteY, scaledWidth, scaledHeight);
        
        ctx.restore();
    }
    
    getCurrentPetSprite(pet) {
        const prefix = pet.type; // 'cat' or 'dog'
        
        // Handle jumping states
        if (!pet.isGrounded) {
            if (pet.velocityY < 0) {
                return this.sprites[`${prefix}-jump1`]; // Going up
            } else {
                return this.sprites[`${prefix}-jump2`]; // Coming down
            }
        }
        
        // Handle running animation
        if (pet.isMoving) {
            const runFrame = this.petRunAnimFrame + 1; // Frames are 1-indexed
            return this.sprites[`${prefix}-run${runFrame}`];
        }
        
        // Handle idle tail wagging animation
        if (this.petTailWagFrame === 1) {
            return this.sprites[`${prefix}-tailwag1`];
        } else if (this.petTailWagFrame === 2) {
            return this.sprites[`${prefix}-tailwag2`];
        }
        
        // Default standing position
        return this.sprites[`${prefix}-stand`];
    }
    
    // Fallback pet rendering for when sprites aren't loaded
    renderPetFallback(ctx, pet) {
        const facingRight = pet.facingRight;
        
        if (pet.type === 'cat') {
            this.renderCatFallback(ctx, pet, facingRight);
        } else {
            this.renderDogFallback(ctx, pet, facingRight);
        }
    }
    
    renderDogFallback(ctx, pet, facingRight) {
        // Dog body - simple oval shape
        ctx.fillStyle = '#8B4513'; // Brown dog
        const bodyWidth = 16;
        const bodyHeight = 8;
        const bodyX = pet.x;
        const bodyY = pet.y + 8;
        
        ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
        
        // Dog head - smaller circle
        const headSize = 6;
        const headX = facingRight ? bodyX + bodyWidth - 2 : bodyX - 4;
        const headY = bodyY - 2;
        
        ctx.fillRect(headX, headY, headSize, headSize);
        
        // Dog ears - small triangular shapes
        ctx.fillStyle = '#654321'; // Darker brown for ears
        if (facingRight) {
            ctx.fillRect(headX + 1, headY - 2, 2, 4); // Right ear
            ctx.fillRect(headX + 4, headY - 1, 2, 3); // Left ear
        } else {
            ctx.fillRect(headX, headY - 1, 2, 3); // Right ear  
            ctx.fillRect(headX + 3, headY - 2, 2, 4); // Left ear
        }
        
        // Dog nose - tiny black dot
        ctx.fillStyle = '#000000';
        const noseX = facingRight ? headX + headSize - 1 : headX;
        ctx.fillRect(noseX, headY + 2, 1, 1);
        
        // Dog legs - simple lines
        ctx.fillStyle = '#8B4513';
        const legWidth = 2;
        const legHeight = 6;
        
        // Front legs
        ctx.fillRect(bodyX + 2, bodyY + bodyHeight, legWidth, legHeight);
        ctx.fillRect(bodyX + 6, bodyY + bodyHeight, legWidth, legHeight);
        
        // Back legs  
        ctx.fillRect(bodyX + 10, bodyY + bodyHeight, legWidth, legHeight);
        ctx.fillRect(bodyX + 14, bodyY + bodyHeight, legWidth, legHeight);
        
        // Render animated tail
        this.renderDogTailFallback(ctx, pet, facingRight);
    }
    
    renderDogTailFallback(ctx, pet, facingRight) {
        ctx.fillStyle = '#8B4513'; // Same brown as body
        
        const bodyX = pet.x;
        const bodyY = pet.y + 8;
        const tailBaseX = facingRight ? bodyX - 2 : bodyX + 18;
        const tailBaseY = bodyY + 3;
        
        // Animate tail wagging when being petted or happy
        let tailOffset = 0;
        if (pet.isBeingPetted) {
            // Fast wagging when being petted
            tailOffset = Math.sin(pet.tailWagTimer * 0.5) * 3;
        } else if (pet.isMoving) {
            // Gentle wagging when moving
            tailOffset = Math.sin(this.animationTime * 0.1) * 1;
        }
        
        // Draw tail segments
        if (facingRight) {
            // Tail going left when facing right
            ctx.fillRect(tailBaseX - 2, tailBaseY + tailOffset, 4, 2);
            ctx.fillRect(tailBaseX - 4, tailBaseY + tailOffset - 1, 3, 2);
        } else {
            // Tail going right when facing left  
            ctx.fillRect(tailBaseX, tailBaseY + tailOffset, 4, 2);
            ctx.fillRect(tailBaseX + 2, tailBaseY + tailOffset - 1, 3, 2);
        }
    }
    
    renderCatFallback(ctx, pet, facingRight) {
        // Cat body - sleeker than dog
        ctx.fillStyle = '#696969'; // Gray cat
        const bodyWidth = 14;
        const bodyHeight = 6;
        const bodyX = pet.x + 1;
        const bodyY = pet.y + 10;
        
        ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
        
        // Cat head - rounder than dog
        const headSize = 6;
        const headX = facingRight ? bodyX + bodyWidth - 1 : bodyX - 3;
        const headY = bodyY - 3;
        
        ctx.fillRect(headX, headY, headSize, headSize);
        
        // Cat ears - pointy triangular shapes
        ctx.fillStyle = '#696969';
        if (facingRight) {
            // Pointed ears facing right
            ctx.fillRect(headX + 1, headY - 2, 1, 3);
            ctx.fillRect(headX + 2, headY - 1, 1, 2);
            ctx.fillRect(headX + 4, headY - 2, 1, 3);
            ctx.fillRect(headX + 5, headY - 1, 1, 2);
        } else {
            // Pointed ears facing left
            ctx.fillRect(headX, headY - 1, 1, 2);
            ctx.fillRect(headX + 1, headY - 2, 1, 3);
            ctx.fillRect(headX + 3, headY - 1, 1, 2);
            ctx.fillRect(headX + 4, headY - 2, 1, 3);
        }
        
        // Cat nose - tiny pink triangle
        ctx.fillStyle = '#FFB6C1'; // Light pink
        const noseX = facingRight ? headX + headSize - 1 : headX;
        ctx.fillRect(noseX, headY + 2, 1, 1);
        
        // Cat legs - thinner than dog
        ctx.fillStyle = '#696969';
        const legWidth = 1;
        const legHeight = 5;
        
        // Legs positioned for cat proportions
        ctx.fillRect(bodyX + 2, bodyY + bodyHeight, legWidth, legHeight);
        ctx.fillRect(bodyX + 4, bodyY + bodyHeight, legWidth, legHeight);
        ctx.fillRect(bodyX + 9, bodyY + bodyHeight, legWidth, legHeight);
        ctx.fillRect(bodyX + 11, bodyY + bodyHeight, legWidth, legHeight);
        
        // Render animated tail
        this.renderCatTailFallback(ctx, pet, facingRight);
    }
    
    renderCatTailFallback(ctx, pet, facingRight) {
        ctx.fillStyle = '#696969'; // Same gray as body
        
        const bodyX = pet.x + 1;
        const bodyY = pet.y + 10;
        const tailBaseX = facingRight ? bodyX - 1 : bodyX + 15;
        const tailBaseY = bodyY + 1;
        
        // Cat tail is longer and more expressive
        let tailOffset = 0;
        let tailCurve = 0;
        
        if (pet.isBeingPetted) {
            // Happy tail swishing - more dramatic than dog
            tailOffset = Math.sin(pet.tailWagTimer * 0.3) * 4;
            tailCurve = Math.cos(pet.tailWagTimer * 0.3) * 2;
        } else if (pet.isMoving) {
            // Gentle tail movement when walking
            tailOffset = Math.sin(this.animationTime * 0.08) * 2;
        }
        
        // Draw longer, curved tail segments
        if (facingRight) {
            // Tail curves up and back when facing right
            ctx.fillRect(tailBaseX - 1, tailBaseY + tailOffset, 2, 1);
            ctx.fillRect(tailBaseX - 3, tailBaseY + tailOffset - 1 + tailCurve, 3, 1);
            ctx.fillRect(tailBaseX - 5, tailBaseY + tailOffset - 2 + tailCurve, 3, 1);
            ctx.fillRect(tailBaseX - 6, tailBaseY + tailOffset - 4 + tailCurve, 2, 1);
        } else {
            // Tail curves up and back when facing left
            ctx.fillRect(tailBaseX + 1, tailBaseY + tailOffset, 2, 1);
            ctx.fillRect(tailBaseX + 2, tailBaseY + tailOffset - 1 + tailCurve, 3, 1);
            ctx.fillRect(tailBaseX + 4, tailBaseY + tailOffset - 2 + tailCurve, 3, 1);
            ctx.fillRect(tailBaseX + 6, tailBaseY + tailOffset - 4 + tailCurve, 2, 1);
        }
    }
}