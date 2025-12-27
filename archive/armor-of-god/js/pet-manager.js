/**
 * PetManager - Handles all pet-related logic including movement, animation, respawning, and interactions
 */
class PetManager {
    constructor(pet, game) {
        this.pet = pet;
        this.game = game; // Reference to main game for accessing other systems
        this.respawnCooldown = 0;
    }
    
    update() {
        if (this.game.gameState !== 'playing' && this.game.gameState !== 'waitingToEnterTemple') return;
        
        const distanceToPlayer = Math.abs(this.game.player.x - this.pet.x);
        const playerMovingTowardsPet = this.game.player.isMoving && 
            ((this.game.player.facingRight && this.pet.x > this.game.player.x) || 
             (!this.game.player.facingRight && this.pet.x < this.game.player.x));
        const playerMovingAwayFromPet = this.game.player.isMoving && 
            ((this.game.player.facingRight && this.pet.x < this.game.player.x) || 
             (!this.game.player.facingRight && this.pet.x > this.game.player.x));
        const playerStill = !this.game.player.isMoving && this.game.player.isGrounded;
        const playerTowardsPet = (this.game.player.facingRight && this.pet.x > this.game.player.x) || 
                                (!this.game.player.facingRight && this.pet.x < this.game.player.x);
        
        let shouldMove = false;
        let targetX, targetDistance;
        
        // Get platform information for smart positioning
        const playerPlatform = this.findPlatformUnderEntity(this.game.player);
        const petPlatform = this.findPlatformUnderEntity(this.pet);
        
        if (playerStill && playerTowardsPet && distanceToPlayer < 80 && distanceToPlayer > 25) {
            // Player is facing pet and standing still - get closer for petting
            targetX = this.game.player.facingRight ? this.game.player.x + 25 : this.game.player.x - 25;
            
            // Ensure target is on same platform as player if possible
            if (playerPlatform) {
                const safeLeft = playerPlatform.x + 15;
                const safeRight = playerPlatform.x + playerPlatform.width - 35;
                targetX = Math.max(safeLeft, Math.min(safeRight, targetX));
            }
            
            targetDistance = Math.abs(this.pet.x - targetX);
            shouldMove = true;
        } else if (playerMovingAwayFromPet || distanceToPlayer > this.pet.followDistance) {
            // Follow when player is moving away or is too far
            const baseTargetX = this.game.player.facingRight ? 
                this.game.player.x - this.pet.followDistance : 
                this.game.player.x + this.pet.followDistance;
            
            // Smart target positioning - keep on same platform as player when possible
            if (playerPlatform) {
                const safeLeft = playerPlatform.x + 15;
                const safeRight = playerPlatform.x + playerPlatform.width - 35;
                
                if (baseTargetX >= safeLeft && baseTargetX <= safeRight) {
                    targetX = baseTargetX;
                } else {
                    // If target would be off platform, position safely on platform
                    targetX = baseTargetX < safeLeft ? safeLeft : safeRight;
                }
            } else {
                targetX = baseTargetX;
            }
            
            targetDistance = Math.abs(this.pet.x - targetX);
            shouldMove = targetDistance > 15; // Only move if significantly far from target
        }
        
        // Pet movement logic
        if (shouldMove && targetDistance > 10) {
            this.pet.isMoving = true;
            
            let speed = this.pet.normalSpeed;
            if (targetDistance > 120) {
                speed = this.pet.catchUpSpeed;
            }
            
            // Armor enhances pet speed too
            if (this.game.hasArmor) {
                speed *= 1.5;
            }
            
            const moveDirection = this.pet.x < targetX ? 1 : -1;
            const shouldJump = this.shouldJump(moveDirection);
            
            if (shouldJump && this.pet.isGrounded) {
                const jumpPower = this.game.hasArmor ? this.game.getCurrentJumpPower() * 0.9 : this.game.jumpPower * 0.9;
                this.pet.velocityY = jumpPower;
                this.pet.isGrounded = false;
            }
            
            // Check for walls before moving
            const canMoveLeft = !this.isWallBlocking(-1);
            const canMoveRight = !this.isWallBlocking(1);
            
            if (this.pet.x < targetX && canMoveRight) {
                this.pet.x += speed;
                this.pet.facingRight = true; // Moving right
            } else if (this.pet.x > targetX && canMoveLeft) {
                this.pet.x -= speed;
                this.pet.facingRight = false; // Moving left
            } else if (!canMoveLeft || !canMoveRight) {
                // Blocked by wall - try to jump if grounded
                if (this.pet.isGrounded) {
                    const jumpPower = this.game.hasArmor ? this.game.getCurrentJumpPower() * 0.9 : this.game.jumpPower * 0.9;
                    this.pet.velocityY = jumpPower;
                    this.pet.isGrounded = false;
                }
            }
        } else {
            this.pet.isMoving = false;
        }
        
        // Apply gravity to pet
        this.pet.velocityY += this.game.gravity;
        this.pet.y += this.pet.velocityY;
        
        // Platform collisions for pet
        this.game.worldManager.checkPlatformCollisions(this.pet);
        
        // Simple pet safety check - respawn at player's feet if pet gets lost
        const needsRespawn = (
            this.pet.y > this.game.canvas.height + 50 || // Fell off screen
            distanceToPlayer > 600 || // Too far from player
            this.pet.y < -50 // Above screen
        );
        
        if (needsRespawn && this.respawnCooldown <= 0 && this.game.player.isGrounded) {
            // Simple spawn at player's feet (only when player is on solid ground)
            this.pet.x = this.game.player.x;
            this.pet.y = this.game.player.y;
            this.pet.velocityY = 0;
            this.pet.isGrounded = false; // Let it fall naturally to ground
            this.pet.isMoving = false;
            this.respawnCooldown = 120; // 2 second cooldown
            console.log(`Pet respawned at player feet: (${this.pet.x}, ${this.pet.y})`);
        }
        
        // Decrement respawn cooldown
        if (this.respawnCooldown > 0) {
            this.respawnCooldown--;
        }
        
        // Update pet animation
        this.updateAnimation();
    }
    
    // Helper function to find what platform an entity is on
    findPlatformUnderEntity(entity) {
        for (let platform of this.game.worldManager.platforms) {
            if (entity.x + entity.width > platform.x && 
                entity.x < platform.x + platform.width &&
                entity.y + entity.height >= platform.y && 
                entity.y + entity.height <= platform.y + 15) {
                return platform;
            }
        }
        return null;
    }
    
    // Helper function to check if there's a wall blocking movement
    isWallBlocking(direction) {
        const checkDistance = this.pet.normalSpeed + 5; // Check ahead by movement distance plus buffer
        const checkX = direction > 0 ? 
            this.pet.x + this.pet.width + checkDistance : 
            this.pet.x - checkDistance;
            
        // Check if there's a platform blocking horizontally
        for (let platform of this.game.worldManager.platforms) {
            // Check if pet is at the right height to hit this platform wall
            if (this.pet.y < platform.y + platform.height && 
                this.pet.y + this.pet.height > platform.y) {
                
                // Check if moving would hit the wall
                if (direction > 0) {
                    // Moving right - check left wall of platform
                    if (checkX >= platform.x && this.pet.x + this.pet.width <= platform.x) {
                        return true;
                    }
                } else {
                    // Moving left - check right wall of platform  
                    if (checkX <= platform.x + platform.width && this.pet.x >= platform.x + platform.width) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // Helper function to check if there's ground at a specific position
    isGroundAt(x, y) {
        for (let platform of this.game.worldManager.platforms) {
            if (x + this.pet.width > platform.x && 
                x < platform.x + platform.width &&
                y >= platform.y && y <= platform.y + platform.height) {
                return true;
            }
        }
        return false;
    }
    
    // Helper function to find the next platform in a direction
    findNextPlatform(startX, direction, currentY) {
        let nearestPlatform = null;
        let minDistance = Infinity;
        
        for (let platform of this.game.worldManager.platforms) {
            const platformCenterX = platform.x + platform.width / 2;
            
            if (direction > 0 && platformCenterX > startX) {
                // Moving right, look for platforms to the right
                const distance = platformCenterX - startX;
                if (distance < minDistance && platform.y <= currentY + 50) {
                    minDistance = distance;
                    nearestPlatform = platform;
                }
            } else if (direction < 0 && platformCenterX < startX) {
                // Moving left, look for platforms to the left
                const distance = startX - platformCenterX;
                if (distance < minDistance && platform.y <= currentY + 50) {
                    minDistance = distance;
                    nearestPlatform = platform;
                }
            }
        }
        
        return nearestPlatform;
    }
    
    shouldJump(moveDirection) {
        if (!this.pet.isGrounded) return false;
        
        const speed = this.pet.isMoving ? (this.pet.x < this.game.player.x - 120 ? this.pet.catchUpSpeed : this.pet.normalSpeed) : this.pet.normalSpeed;
        const dynamicLookAhead = Math.max(50, speed * 12); // Scale with speed
        
        // Check if player is on a higher platform and pet should jump up
        const playerPlatform = this.findPlatformUnderEntity(this.game.player);
        const petPlatform = this.findPlatformUnderEntity(this.pet);
        
        if (playerPlatform && petPlatform && playerPlatform.y < petPlatform.y) {
            const horizontalDistance = Math.abs(this.game.player.x - this.pet.x);
            if (horizontalDistance < 80) {
                return true; // Jump up to player's platform
            }
        }
        
        // Check multiple points ahead for gaps
        for (let distance = 30; distance <= dynamicLookAhead; distance += 15) {
            const checkX = this.pet.x + (moveDirection * distance);
            const checkY = this.pet.y + this.pet.height + 10;
            
            if (!this.isGroundAt(checkX, checkY)) {
                // Found a gap - check if we can and should jump over it
                const nextPlatform = this.findNextPlatform(checkX, moveDirection, this.pet.y);
                if (nextPlatform) {
                    const gapWidth = moveDirection > 0 ? 
                        nextPlatform.x - (this.pet.x + this.pet.width) :
                        this.pet.x - (nextPlatform.x + nextPlatform.width);
                    
                    // Only jump if gap is reasonable (not too wide)
                    if (gapWidth < 120 && gapWidth > 20) {
                        return true;
                    }
                }
                return false; // Gap too wide or no platform ahead
            }
        }
        
        return false;
    }
    
    updateAnimation() {
        // Handle petting animation states
        if (this.pet.isBeingPetted) {
            this.pet.pettingTimer++;
            
            // Tail wagging animation
            this.pet.tailWagTimer++;
            
            // Handle jumps after petting starts
            if (this.pet.pettingTimer > 30 && this.pet.jumpCount < this.pet.maxJumps) { // Wait 0.5 seconds before first jump
                this.pet.jumpTimer++;
                if (this.pet.jumpTimer >= this.pet.jumpCooldown) {
                    if (this.pet.isGrounded) {
                        // Little happy jump
                        this.pet.velocityY = -8; // Smaller jump than regular jump
                        this.pet.isGrounded = false;
                        this.pet.jumpCount++;
                        this.pet.jumpTimer = 0;
                    }
                }
            }
            
            // End petting state
            if (this.pet.pettingTimer >= this.pet.pettingDuration) {
                this.pet.isBeingPetted = false;
                this.pet.pettingTimer = 0;
                this.pet.tailWagTimer = 0;
                this.pet.jumpCount = 0;
                this.pet.jumpTimer = 0;
            }
        } else {
            // Normal animation logic
            if (this.pet.isMoving && this.pet.isGrounded) {
                this.pet.animTimer++;
                if (this.pet.animTimer >= this.pet.animSpeed) {
                    this.pet.animFrame = (this.pet.animFrame + 1) % 4;
                    this.pet.animTimer = 0;
                }
            } else {
                this.pet.animFrame = 0;
                this.pet.animTimer = 0;
            }
        }
    }
    
    tryPetting() {
        if (this.pet.isBeingPetted) return; // Already being petted
        
        // Check if player is close enough to the pet
        const distance = Math.abs(this.game.player.x - this.pet.x);
        const petDistance = 60; // Must be within 60 pixels
        
        if (distance <= petDistance) {
            // Make player face the pet
            if (this.pet.x > this.game.player.x) {
                this.game.player.facingRight = true;
            } else {
                this.game.player.facingRight = false;
            }
            
            // Start petting for both pet and player
            this.pet.isBeingPetted = true;
            this.pet.pettingTimer = 0;
            this.pet.tailWagTimer = 0;
            this.pet.jumpCount = 0;
            
            // Start player petting animation
            this.game.characterRenderer.startPettingAnimation();
            this.pet.jumpTimer = 0;
            
            // Keep player in their current position (no automatic repositioning)
            
            // Start player petting animation
            this.game.player.isPetting = true;
            this.game.player.pettingTimer = 0;
            this.game.player.handOffset = 0;
            
            // Play appropriate sound based on pet type
            if (this.pet.type === 'cat') {
                this.game.audioManager.playSound('meow');
            } else {
                this.game.audioManager.playSound('bark1');
            }
        }
    }
    
    stopPetting() {
        // Stop pet petting animation
        if (this.pet.isBeingPetted) {
            this.pet.isBeingPetted = false;
            this.pet.pettingTimer = 0;
            this.pet.tailWagTimer = 0;
            this.pet.jumpCount = 0;
            this.pet.jumpTimer = 0;
        }
        
        // Stop player petting animation
        if (this.game.player.isPetting) {
            this.game.player.isPetting = false;
            this.game.player.pettingTimer = 0;
            this.game.player.handOffset = 0;
        }
        
        // Stop character renderer petting animation
        if (this.game.characterRenderer.isPetting) {
            this.game.characterRenderer.isPetting = false;
            this.game.characterRenderer.petAnimCycles = 0;
            this.game.characterRenderer.petAnimFrame = 0;
            this.game.characterRenderer.petAnimTimer = 0;
        }
    }
}