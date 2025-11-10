class CharacterRenderer {
    constructor() {
        // Animation frame tracking
        this.animationTime = 0;
    }
    
    update() {
        this.animationTime++;
    }
    
    renderPlayer(ctx, player, hasArmor) {
        // Apply flashing effect when invulnerable
        const shouldFlash = player.invulnerable && Math.floor(player.invulnerabilityTimer / 4) % 2 === 0;
        if (shouldFlash) {
            ctx.globalAlpha = 0.5;
        }
        
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
        
        // Eyes (simple black pixels) - visible through helmet visor or normally
        ctx.fillStyle = '#000000';
        ctx.fillRect(player.x + 10, headY + 4, 2, 2);
        ctx.fillRect(player.x + 20, headY + 4, 2, 2);
        
        // Animated Arms
        ctx.fillStyle = '#FDBCB4';
        
        if (player.isJumping || !player.isGrounded) {
            // Mario-style jumping pose - right hand up, left hand at side
            ctx.fillRect(player.x + 28, playerY - 8, 8, 16); // Right arm raised
            ctx.fillRect(player.x + 32, playerY - 16, 8, 12); // Forearm raised higher
            ctx.fillRect(player.x - 4, playerY + 4, 8, 20); // Left arm normal position
        } else if (player.isMoving && player.isGrounded && !player.isDucking) {
            // Arm swing animation (opposite to legs)
            let leftArmOffset = 0;
            let rightArmOffset = 0;
            
            switch (player.animFrame) {
                case 0:
                    leftArmOffset = 0; rightArmOffset = 0;
                    break;
                case 1: // Left leg forward, so right arm forward
                    leftArmOffset = -1; rightArmOffset = 1;
                    break;
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
    
    renderDog(ctx, dog) {
        // Use the dog's facingRight property to determine direction
        const facingRight = dog.facingRight;
        
        // Dog body - main brown color
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(dog.x + 2, dog.y + 4, dog.width - 4, dog.height - 8);
        
        // Dog head (bigger now - 10x10 instead of 8x8)
        ctx.fillStyle = '#A0522D'; // Slightly lighter brown for head
        if (facingRight) {
            // Head at front when facing right (right side of body)
            ctx.fillRect(dog.x + dog.width - 1, dog.y + 1, 10, 10);
            
            // Dog ears (floppy)
            ctx.fillStyle = '#654321'; // Darker brown for ears
            ctx.fillRect(dog.x + dog.width - 2, dog.y, 3, 6);
            ctx.fillRect(dog.x + dog.width + 4, dog.y, 3, 6);
            
            // Dog nose and eyes (facing right)
            ctx.fillStyle = '#000000';
            ctx.fillRect(dog.x + dog.width + 7, dog.y + 6, 2, 1); // Nose at front
            ctx.fillRect(dog.x + dog.width + 2, dog.y + 4, 1, 1); // Left eye
            ctx.fillRect(dog.x + dog.width + 5, dog.y + 4, 1, 1); // Right eye
        } else {
            // Head at front when facing left (left side of body)
            ctx.fillRect(dog.x - 9, dog.y + 1, 10, 10);
            
            // Dog ears (floppy)
            ctx.fillStyle = '#654321'; // Darker brown for ears
            ctx.fillRect(dog.x - 5, dog.y, 3, 6);
            ctx.fillRect(dog.x - 2, dog.y, 3, 6);
            
            // Dog nose and eyes (facing left)
            ctx.fillStyle = '#000000';
            ctx.fillRect(dog.x - 9, dog.y + 6, 2, 1); // Nose at front
            ctx.fillRect(dog.x - 6, dog.y + 4, 1, 1); // Left eye
            ctx.fillRect(dog.x - 3, dog.y + 4, 1, 1); // Right eye
        }
        
        // Dog legs (animated when moving)
        ctx.fillStyle = '#8B4513';
        if (dog.isMoving && dog.isGrounded) {
            // Animated legs for walking
            const legOffset = Math.sin(this.animationTime * 0.3) * 1;
            
            // Front legs
            ctx.fillRect(dog.x + 3, dog.y + dog.height - 6, 2, 6);
            ctx.fillRect(dog.x + 7 + legOffset, dog.y + dog.height - 6, 2, 6);
            
            // Back legs
            ctx.fillRect(dog.x + dog.width - 8, dog.y + dog.height - 6, 2, 6);
            ctx.fillRect(dog.x + dog.width - 4 - legOffset, dog.y + dog.height - 6, 2, 6);
        } else {
            // Static legs
            ctx.fillRect(dog.x + 3, dog.y + dog.height - 6, 2, 6);
            ctx.fillRect(dog.x + 7, dog.y + dog.height - 6, 2, 6);
            ctx.fillRect(dog.x + dog.width - 8, dog.y + dog.height - 6, 2, 6);
            ctx.fillRect(dog.x + dog.width - 4, dog.y + dog.height - 6, 2, 6);
        }
        
        // Dog tail (always wagging!)
        this.renderDogTail(ctx, dog, facingRight);
    }
    
    renderDogTail(ctx, dog, facingRight) {
        // Animated tail wagging
        const tailWag = Math.sin(this.animationTime * 0.4) * 2;
        
        ctx.fillStyle = '#654321'; // Darker brown for tail
        
        if (facingRight) {
            // Tail on the back (left side when facing right)
            ctx.fillRect(dog.x - 1, dog.y + 6, 2, 4);
            
            // Tail tip (wagging)
            ctx.fillRect(dog.x - 4 - tailWag, dog.y + 4 + Math.abs(tailWag * 0.5), 3, 2);
            ctx.fillRect(dog.x - 5 - tailWag, dog.y + 2 + Math.abs(tailWag * 0.3), 2, 2);
        } else {
            // Tail on the back (right side when facing left)
            ctx.fillRect(dog.x + dog.width - 1, dog.y + 6, 2, 4);
            
            // Tail tip (wagging)
            ctx.fillRect(dog.x + dog.width + 1 + tailWag, dog.y + 4 + Math.abs(tailWag * 0.5), 3, 2);
            ctx.fillRect(dog.x + dog.width + 2 + tailWag, dog.y + 2 + Math.abs(tailWag * 0.3), 2, 2);
        }
    }
}