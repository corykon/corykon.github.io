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
        
        // Animation speeds (higher = slower)
        this.runAnimSpeed = 3;
        this.petAnimSpeed = 8;
        this.stoppingAnimDuration = 6;
        
        // Load all sprite images
        this.loadSprites();
    }
    
    loadSprites() {
        const spriteNames = [
            'standing', 'jump', 'drop', 'stopping',
            'pet1', 'pet2', 'pet3',
            'run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7',
            'run8', 'run9', 'run10', 'run11', 'run12', 'run13', 'run14'
        ];
        
        let loadedCount = 0;
        const totalSprites = spriteNames.length;
        
        spriteNames.forEach(spriteName => {
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
    getCurrentSprite(player) {
        if (!this.spritesLoaded) {
            return null; // Will fall back to rectangle rendering
        }
        
        // Handle petting animation
        if (this.isPetting) {
            if (this.petAnimFrame === 0) return this.sprites.pet1;
            if (this.petAnimFrame === 1) return this.sprites.pet2;
            if (this.petAnimFrame === 2) return this.sprites.pet3;
            return this.sprites.standing;
        }
        
        // Handle stopping animation
        if (this.stoppingAnimTimer > 0) {
            return this.sprites.stopping;
        }
        
        // Handle jumping states
        if (!player.isGrounded) {
            if (player.velocityY < 0) {
                return this.sprites.jump;
            } else {
                // Check if this is a drop from ledge vs normal fall
                return this.wasFalling ? this.sprites.drop : this.sprites.drop;
            }
        }
        
        // Handle movement
        if (player.isMoving) {
            const runFrames = ['run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7', 
                              'run8', 'run9', 'run10', 'run11', 'run12', 'run13', 'run14'];
            return this.sprites[runFrames[this.runAnimFrame]];
        }
        
        // Default standing
        return this.sprites.standing;
    }
    
    update() {
        this.animationTime++;
    }
    
    renderPlayer(ctx, player, hasArmor) {
        // Update animation states based on player movement
        this.updateAnimationStates(player);
        
        // Apply flashing effect when invulnerable
        const shouldFlash = player.invulnerable && Math.floor(player.invulnerabilityTimer / 4) % 2 === 0;
        if (shouldFlash) {
            ctx.globalAlpha = 0.5;
        }
        
        // Get current sprite
        const currentSprite = this.getCurrentSprite(player);
        
        if (currentSprite && this.spritesLoaded) {
            // Render sprite-based character
            ctx.save();
            
            // Handle horizontal flipping for left movement
            if (!player.facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(currentSprite, -player.x - player.width, player.y, player.width, player.height);
            } else {
                ctx.drawImage(currentSprite, player.x, player.y, player.width, player.height);
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
        
        // Handle running animation
        if (player.isMoving && player.isGrounded) {
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
            const petFrames = [0, 1, 2, 1]; // pet1, pet2, pet3, pet2 cycle
            const result = this.cycleFrames(petFrames, this.petAnimFrame, this.petAnimTimer, this.petAnimSpeed, false);
            this.petAnimFrame = result.frame;
            this.petAnimTimer = result.timer;
            
            if (result.completed) {
                this.petAnimCycles++;
                if (this.petAnimCycles >= 2) {
                    // End petting after 2 cycles
                    this.isPetting = false;
                    this.petAnimCycles = 0;
                    this.petAnimFrame = 0;
                    this.petAnimTimer = 0;
                } else {
                    // Start another cycle
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
                case 2:
                    leftArmOffset = 0; rightArmOffset = 0;
                    break;
                case 3: // Right leg forward, so left arm forward
                    leftArmOffset = 1; rightArmOffset = -1;
                    break;
            }
            
            ctx.fillRect(player.x - 4 + leftArmOffset, playerY + 4, 8, 20); // Left arm
            ctx.fillRect(player.x + 28 + rightArmOffset, playerY + 4, 8, 20); // Right arm
        } else {
            // Static arms when not moving
            ctx.fillRect(player.x - 4, playerY + 4, 8, 20); // Left arm
            ctx.fillRect(player.x + 28, playerY + 4, 8, 20); // Right arm
        }
        
        // Player torso
        if (hasArmor) {
            // Armored torso
            ctx.fillStyle = '#C0C0C0'; // Silver armor
            ctx.fillRect(player.x + 4, playerY, 24, 28);
            
            // Armor details
            ctx.fillStyle = '#FFD700'; // Gold trim
            ctx.fillRect(player.x + 6, playerY + 2, 20, 3); // Top trim
            ctx.fillRect(player.x + 6, playerY + 12, 20, 2); // Middle trim
            ctx.fillRect(player.x + 6, playerY + 22, 20, 3); // Bottom trim
            
            // Cross emblem on chest
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(player.x + 14, playerY + 6, 4, 12); // Vertical
            ctx.fillRect(player.x + 10, playerY + 10, 12, 4); // Horizontal
            
            // Shoulder guards
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(player.x - 2, playerY + 2, 6, 12);
            ctx.fillRect(player.x + 28, playerY + 2, 6, 12);
            
            // Sword of the Spirit (left side)
            this.renderSword(ctx, player, playerY);
            
            // Shield of Faith (right side)  
            this.renderShield(ctx, player, playerY);
        } else {
            // Peasant clothing
            ctx.fillStyle = '#8B4513'; // Brown tunic
            ctx.fillRect(player.x + 4, playerY, 24, 28);
            
            // Simple tunic details
            ctx.fillStyle = '#654321';
            ctx.fillRect(player.x + 6, playerY + 2, 20, 2);
            ctx.fillRect(player.x + 14, playerY + 6, 4, 16);
        }
        
        // Animated Legs/pants
        this.renderLegs(ctx, player, playerY, playerHeight);
        
        // Reset alpha after player drawing
        if (shouldFlash) {
            ctx.globalAlpha = 1.0;
        }
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
        ctx.fillStyle = '#8B4513'; // Brown handle
        ctx.fillRect(player.x - 7 + leftArmOffset, playerY + 12, 2, 8);
        
        // Sword crossguard
        ctx.fillStyle = '#FFD700'; // Gold crossguard
        ctx.fillRect(player.x - 10 + leftArmOffset, playerY + 10, 8, 2);
        
        // Sword pommel
        ctx.fillStyle = '#FFD700'; // Gold pommel
        ctx.fillRect(player.x - 8 + leftArmOffset, playerY + 20, 4, 2);
    }
    
    renderShield(ctx, player, playerY) {
        const rightArmOffset = player.isMoving && player.isGrounded && !player.isDucking ? 
            (player.animFrame === 1 ? 1 : player.animFrame === 3 ? -1 : 0) : 0;
        
        let shieldX, shieldY;
        if (player.isJumping || !player.isGrounded) {
            // Shield raised up with the right arm (Mario style)
            shieldX = player.x + 38;
            shieldY = playerY - 8;
        } else {
            shieldX = player.x + 38 + rightArmOffset;
            shieldY = playerY + 4;
        }
        
        // Shield main body
        ctx.fillStyle = '#C0C0C0'; // Silver shield
        ctx.fillRect(shieldX, shieldY, 10, 16);
        
        // Shield details
        ctx.fillStyle = '#A9A9A9'; // Darker silver border
        ctx.fillRect(shieldX, shieldY, 10, 2); // Top edge
        ctx.fillRect(shieldX, shieldY + 14, 10, 2); // Bottom edge
        ctx.fillRect(shieldX, shieldY, 2, 16); // Left edge
        ctx.fillRect(shieldX + 8, shieldY, 2, 16); // Right edge
        
        // Cross on shield
        ctx.fillStyle = '#FFD700'; // Gold cross
        ctx.fillRect(shieldX + 3, shieldY + 2, 4, 8); // Vertical
        ctx.fillRect(shieldX + 1, shieldY + 4, 8, 4); // Horizontal
    }
    
    renderLegs(ctx, player, playerY, playerHeight) {
        ctx.fillStyle = '#654321'; // Brown pants
        
        if (player.isMoving && player.isGrounded && !player.isDucking) {
            // Walking animation - alternate leg positions
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
            
            // Left leg
            ctx.fillRect(player.x + 6 + leftLegOffset, playerY + 28, 8, playerHeight - 28);
            // Right leg  
            ctx.fillRect(player.x + 18 + rightLegOffset, playerY + 28, 8, playerHeight - 28);
            
            // Animated feet/shoes
            ctx.fillStyle = '#2F4F4F';
            ctx.fillRect(player.x + 4 + leftLegOffset, player.y + player.height - 4, 10, 4);
            ctx.fillRect(player.x + 18 + rightLegOffset, player.y + player.height - 4, 10, 4);
        } else {
            // Static legs when not moving
            ctx.fillRect(player.x + 6, playerY + 28, 8, playerHeight - 28);
            ctx.fillRect(player.x + 18, playerY + 28, 8, playerHeight - 28);
            
            // Static feet/shoes
            ctx.fillStyle = '#2F4F4F';
            ctx.fillRect(player.x + 4, player.y + player.height - 4, 10, 4);
            ctx.fillRect(player.x + 18, player.y + player.height - 4, 10, 4);
        }
    }
    
    renderPet(ctx, pet) {
        // Use the pet's facingRight property to determine direction
        const facingRight = pet.facingRight;
        
        // Render different pets based on type
        if (pet.type === 'cat') {
            this.renderCat(ctx, pet, facingRight);
        } else {
            this.renderDog(ctx, pet, facingRight);
        }
    }
    
    renderDog(ctx, pet, facingRight) {
        
        // Dog body - main brown color
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(pet.x + 2, pet.y + 4, pet.width - 4, pet.height - 8);
        
        // Dog head (bigger now - 10x10 instead of 8x8)
        ctx.fillStyle = '#A0522D'; // Slightly lighter brown for head
        if (facingRight) {
            // Head at front when facing right (right side of body)
            ctx.fillRect(pet.x + pet.width - 1, pet.y + 1, 10, 10);
            
            // Dog ears (floppy)
            ctx.fillStyle = '#654321'; // Darker brown for ears
            ctx.fillRect(pet.x + pet.width - 2, pet.y, 3, 6);
            ctx.fillRect(pet.x + pet.width + 4, pet.y, 3, 6);
            
            // Dog nose and eyes (facing right)
            ctx.fillStyle = '#000000';
            ctx.fillRect(pet.x + pet.width + 7, pet.y + 6, 2, 1); // Nose at front
            ctx.fillRect(pet.x + pet.width + 2, pet.y + 4, 1, 1); // Left eye
            ctx.fillRect(pet.x + pet.width + 5, pet.y + 4, 1, 1); // Right eye
        } else {
            // Head at front when facing left (left side of body)
            ctx.fillRect(pet.x - 9, pet.y + 1, 10, 10);
            
            // Dog ears (floppy)
            ctx.fillStyle = '#654321'; // Darker brown for ears
            ctx.fillRect(pet.x - 5, pet.y, 3, 6);
            ctx.fillRect(pet.x - 2, pet.y, 3, 6);
            
            // Dog nose and eyes (facing left)
            ctx.fillStyle = '#000000';
            ctx.fillRect(pet.x - 9, pet.y + 6, 2, 1); // Nose at front
            ctx.fillRect(pet.x - 6, pet.y + 4, 1, 1); // Left eye
            ctx.fillRect(pet.x - 3, pet.y + 4, 1, 1); // Right eye
        }
        
        // Dog legs (animated when moving)
        ctx.fillStyle = '#8B4513';
        if (pet.isMoving && pet.isGrounded) {
            // Animated legs for walking
            const legOffset = Math.sin(this.animationTime * 0.3) * 1;
            
            // Front legs
            ctx.fillRect(pet.x + 3, pet.y + pet.height - 6, 2, 6);
            ctx.fillRect(pet.x + 7 + legOffset, pet.y + pet.height - 6, 2, 6);
            
            // Back legs
            ctx.fillRect(pet.x + pet.width - 8, pet.y + pet.height - 6, 2, 6);
            ctx.fillRect(pet.x + pet.width - 4 - legOffset, pet.y + pet.height - 6, 2, 6);
        } else {
            // Static legs
            ctx.fillRect(pet.x + 3, pet.y + pet.height - 6, 2, 6);
            ctx.fillRect(pet.x + 7, pet.y + pet.height - 6, 2, 6);
            ctx.fillRect(pet.x + pet.width - 8, pet.y + pet.height - 6, 2, 6);
            ctx.fillRect(pet.x + pet.width - 4, pet.y + pet.height - 6, 2, 6);
        }
        
        // Dog tail (always wagging!)
        this.renderDogTail(ctx, pet, facingRight);
    }
    
    renderDogTail(ctx, pet, facingRight) {
        // Animated tail wagging - faster and more energetic when being petted
        let wagSpeed = 0.4;
        let wagIntensity = 2;
        
        if (pet.isBeingPetted) {
            wagSpeed = 0.8; // Much faster wagging when being petted
            wagIntensity = 4; // More intense wagging
        }
        
        const tailWag = Math.sin(this.animationTime * wagSpeed) * wagIntensity;
        
        ctx.fillStyle = '#654321'; // Darker brown for tail
        
        if (facingRight) {
            // Tail on the back (left side when facing right)
            ctx.fillRect(pet.x - 1, pet.y + 6, 2, 4);
            
            // Tail tip (wagging)
            ctx.fillRect(pet.x - 4 - tailWag, pet.y + 4 + Math.abs(tailWag * 0.5), 3, 2);
            ctx.fillRect(pet.x - 5 - tailWag, pet.y + 2 + Math.abs(tailWag * 0.3), 2, 2);
        } else {
            // Tail on the back (right side when facing left)
            ctx.fillRect(pet.x + pet.width - 1, pet.y + 6, 2, 4);
            
            // Tail tip (wagging)
            ctx.fillRect(pet.x + pet.width + 1 + tailWag, pet.y + 4 + Math.abs(tailWag * 0.5), 3, 2);
            ctx.fillRect(pet.x + pet.width + 2 + tailWag, pet.y + 2 + Math.abs(tailWag * 0.3), 2, 2);
        }
    }
    
    renderCat(ctx, pet, facingRight) {
        // Cat body - sleek gray color
        ctx.fillStyle = '#696969';
        ctx.fillRect(pet.x + 2, pet.y + 4, pet.width - 4, pet.height - 8);
        
        // Cat head (smaller and more triangular than dog)
        ctx.fillStyle = '#778899'; // Slightly lighter gray for head
        if (facingRight) {
            // Head at front when facing right
            ctx.fillRect(pet.x + pet.width - 1, pet.y + 2, 8, 8);
            
            // Cat ears (pointed and upright)
            ctx.fillStyle = '#556B2F'; // Dark olive for ears
            ctx.fillRect(pet.x + pet.width, pet.y, 2, 4);
            ctx.fillRect(pet.x + pet.width + 4, pet.y, 2, 4);
            
            // Cat nose and eyes (facing right)
            ctx.fillStyle = '#000000';
            ctx.fillRect(pet.x + pet.width + 6, pet.y + 6, 1, 1); // Small nose
            ctx.fillRect(pet.x + pet.width + 1, pet.y + 4, 1, 1); // Left eye
            ctx.fillRect(pet.x + pet.width + 4, pet.y + 4, 1, 1); // Right eye
            
            // Cat whiskers
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(pet.x + pet.width + 7, pet.y + 5, 2, 1); // Right whiskers
            ctx.fillRect(pet.x + pet.width + 7, pet.y + 7, 2, 1);
        } else {
            // Head at front when facing left
            ctx.fillRect(pet.x - 7, pet.y + 2, 8, 8);
            
            // Cat ears (pointed and upright)
            ctx.fillStyle = '#556B2F';
            ctx.fillRect(pet.x - 6, pet.y, 2, 4);
            ctx.fillRect(pet.x - 2, pet.y, 2, 4);
            
            // Cat nose and eyes (facing left)
            ctx.fillStyle = '#000000';
            ctx.fillRect(pet.x - 8, pet.y + 6, 1, 1); // Small nose
            ctx.fillRect(pet.x - 5, pet.y + 4, 1, 1); // Left eye
            ctx.fillRect(pet.x - 2, pet.y + 4, 1, 1); // Right eye
            
            // Cat whiskers
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(pet.x - 10, pet.y + 5, 2, 1); // Left whiskers
            ctx.fillRect(pet.x - 10, pet.y + 7, 2, 1);
        }
        
        // Cat legs (thinner than dog legs)
        ctx.fillStyle = '#696969';
        if (pet.isMoving && pet.isGrounded) {
            // Animated legs for walking (more graceful than dog)
            const legOffset = Math.sin(this.animationTime * 0.25) * 0.5;
            
            // Front legs
            ctx.fillRect(pet.x + 4, pet.y + pet.height - 5, 1, 5);
            ctx.fillRect(pet.x + 6 + legOffset, pet.y + pet.height - 5, 1, 5);
            
            // Back legs
            ctx.fillRect(pet.x + pet.width - 7, pet.y + pet.height - 5, 1, 5);
            ctx.fillRect(pet.x + pet.width - 5 - legOffset, pet.y + pet.height - 5, 1, 5);
        } else {
            // Static legs
            ctx.fillRect(pet.x + 4, pet.y + pet.height - 5, 1, 5);
            ctx.fillRect(pet.x + 6, pet.y + pet.height - 5, 1, 5);
            ctx.fillRect(pet.x + pet.width - 7, pet.y + pet.height - 5, 1, 5);
            ctx.fillRect(pet.x + pet.width - 5, pet.y + pet.height - 5, 1, 5);
        }
        
        // Cat tail (curvy and expressive)
        this.renderCatTail(ctx, pet, facingRight);
    }
    
    renderCatTail(ctx, pet, facingRight) {
        // Cat tail behavior - swishes when content, flicks when being petted
        let tailSpeed = 0.2;
        let tailIntensity = 1;
        
        if (pet.isBeingPetted) {
            tailSpeed = 0.6; // Faster swishing when being petted
            tailIntensity = 3; // More dramatic movement
        }
        
        const tailSwish = Math.sin(this.animationTime * tailSpeed) * tailIntensity;
        
        ctx.fillStyle = '#556B2F'; // Dark olive for tail
        
        if (facingRight) {
            // Tail curves upward and sways
            ctx.fillRect(pet.x - 1, pet.y + 6, 1, 4);
            ctx.fillRect(pet.x - 2, pet.y + 4 - tailSwish, 1, 3);
            ctx.fillRect(pet.x - 3, pet.y + 2 - tailSwish * 0.5, 1, 2);
        } else {
            // Tail curves upward and sways
            ctx.fillRect(pet.x + pet.width, pet.y + 6, 1, 4);
            ctx.fillRect(pet.x + pet.width + 1, pet.y + 4 - tailSwish, 1, 3);
            ctx.fillRect(pet.x + pet.width + 2, pet.y + 2 - tailSwish * 0.5, 1, 2);
        }
    }
}