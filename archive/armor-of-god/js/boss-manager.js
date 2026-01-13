class BossManager {
    constructor() {
        this.isActive = false;
        this.cutsceneActive = false;
        this.cutsceneStage = 'none'; // none, playerFrozen, golemAppears, golemCharging, slamming, earthquake, falling
        this.cutsceneTimer = 0;
        
        // Boss properties
        this.golem = {
            x: 0,
            y: 0,
            width: 120,
            height: 140,
            velocityX: 0,
            velocityY: 0,
            facingLeft: true,
            animationFrame: 0,
            animationTimer: 0,
            currentAnimation: 'stand'
        };
        
        // Cutscene properties
        this.playerFrozen = false;
        this.initialGolemX = 0;
        this.targetPlayerX = 0;
        this.earthquakeIntensity = 0;
        this.earthquakeTimer = 0;
        this.screenShakeX = 0;
        this.screenShakeY = 0;
        this.groundCracks = [];
        this.fallSpeed = 0;
        this.blacknessAlpha = 0;
        
        // Boss trigger position (500 pixels before temple)
        this.triggerDistance = 500;
        this.triggered = false;
        
        // Load golem sprite images
        this.golemSprites = {};
        this.spritesLoaded = false;
        this.loadGolemSprites();
        
        // Sound effects
        this.playedEarthquakeSound = false;
        this.playedGroundBreakSound = false;
    }
    
    loadGolemSprites() {
        const spriteFiles = {
            stand: ['golem-stand.png'],
            run: ['golem-run1.png', 'golem-run2.png', 'golem-run3.png', 'golem-run4.png', 'golem-run5.png', 'golem-run6.png'],
            jump: ['golem-jump1.png', 'golem-jump2.png', 'golem-jump3.png', 'golem-jump4.png', 'golem-jump5.png'],
            slam: ['golem-slam1.png', 'golem-slam2.png', 'golem-slam3.png', 'golem-slam4.png', 'golem-slam5.png', 'golem-slam6.png', 'golem-slam7.png', 'golem-slam8.png']
        };
        
        let totalSprites = 0;
        let loadedSprites = 0;
        
        // Count total sprites to load
        Object.values(spriteFiles).forEach(files => {
            totalSprites += files.length;
        });
        
        // Load each sprite
        Object.keys(spriteFiles).forEach(animType => {
            this.golemSprites[animType] = [];
            spriteFiles[animType].forEach((filename, index) => {
                const img = new Image();
                img.onload = () => {
                    loadedSprites++;
                    if (loadedSprites === totalSprites) {
                        this.spritesLoaded = true;
                    }
                };
                img.src = `images/sprites/enemy/${filename}`;
                this.golemSprites[animType][index] = img;
            });
        });
    }
    
    checkForTrigger(playerX, castleX, level) {
        // Only trigger on level 3
        if (level !== 3 || this.triggered || this.isActive) {
            return false;
        }
        
        // Check if player is within trigger distance of temple
        const distanceToTemple = castleX - playerX;
        
        // Debug logging when getting close
        if (distanceToTemple <= this.triggerDistance + 100 && distanceToTemple > this.triggerDistance) {
            console.log(`Approaching boss trigger. Distance to temple: ${Math.round(distanceToTemple)}px (trigger at ${this.triggerDistance}px)`);
        }
        
        if (distanceToTemple <= this.triggerDistance && distanceToTemple > 0) {
            this.triggerBossCutscene(playerX, castleX);
            return true;
        }
        
        return false;
    }
    
    triggerBossCutscene(playerX, castleX) {
        this.triggered = true;
        this.isActive = true;
        this.cutsceneActive = true;
        this.cutsceneStage = 'playerFrozen';
        this.cutsceneTimer = 0;
        this.playerFrozen = true;
        
        // Position golem to the right of player, visible on screen
        this.initialGolemX = playerX + 400; // Position golem ahead of player
        this.golem.x = this.initialGolemX;
        this.golem.y = 220; // Start at ground level
        this.golem.currentAnimation = 'stand';
        this.golem.facingLeft = true;
        
        // Store player position for golem to charge toward
        this.targetPlayerX = playerX;
        
        console.log(`Boss cutscene triggered! Golem positioned at (${this.golem.x}, ${this.golem.y}), Castle at ${castleX}, Player at ${playerX}`);
    }
    
    update(audioManager, effectsManager) {
        if (!this.isActive || !this.cutsceneActive) {
            return;
        }
        
        this.cutsceneTimer++;
        
        switch (this.cutsceneStage) {
            case 'playerFrozen':
                this.updatePlayerFrozenStage(audioManager);
                break;
                
            case 'golemAppears':
                this.updateGolemAppearsStage(audioManager);
                break;
                
            case 'golemCharging':
                this.updateGolemChargingStage(audioManager);
                break;
                
            case 'slamming':
                this.updateSlammingStage(audioManager);
                break;
                
            case 'earthquake':
                this.updateEarthquakeStage(audioManager, effectsManager);
                break;
                
            case 'falling':
                this.updateFallingStage(audioManager);
                break;
        }
        
        // Update golem animation
        this.updateGolemAnimation();
    }
    
    updatePlayerFrozenStage(audioManager) {
        // Player is frozen for 2 seconds, then golem appears
        if (this.cutsceneTimer >= 120) { // 2 seconds at 60fps
            this.cutsceneStage = 'golemAppears';
            this.cutsceneTimer = 0;
            this.golem.currentAnimation = 'jump';
            
            // Play dramatic sound for golem appearance
            audioManager.playSoundEffect('grunt1');
        }
    }
    
    updateGolemAppearsStage(audioManager) {
        // Golem appears for 1 second, then starts charging
        if (this.cutsceneTimer >= 60) { // 1 second appearance
            this.cutsceneStage = 'golemCharging';
            this.cutsceneTimer = 0;
            this.golem.currentAnimation = 'run';
            this.golem.velocityX = -8; // Start charging left toward player
            
            // Play charging sound
            audioManager.playSoundEffect('thud2');
        }
    }
    
    updateGolemChargingStage(audioManager) {
        // Golem charges toward player
        this.golem.x += this.golem.velocityX;
        
        // Check if golem has reached a good slamming position
        const distanceToPlayer = Math.abs(this.golem.x - this.targetPlayerX);
        if (distanceToPlayer < 200 || this.cutsceneTimer >= 180) { // 3 seconds max
            this.cutsceneStage = 'slamming';
            this.cutsceneTimer = 0;
            this.golem.currentAnimation = 'slam';
            this.golem.velocityX = 0;
        }
    }
    
    updateSlammingStage(audioManager) {
        // Golem performs slam animation
        if (this.cutsceneTimer === 30) { // Halfway through slam animation
            // Play slam sound
            audioManager.playSoundEffect('smash');
        }
        
        if (this.cutsceneTimer >= 60) { // 1 second slam animation
            this.cutsceneStage = 'earthquake';
            this.cutsceneTimer = 0;
            this.earthquakeTimer = 0;
            this.earthquakeIntensity = 10;
            
            // Initialize ground cracks
            this.initializeGroundCracks();
        }
    }
    
    updateEarthquakeStage(audioManager, effectsManager) {
        this.earthquakeTimer++;
        
        // Play earthquake sound once
        if (!this.playedEarthquakeSound) {
            // Use thud3 for earthquake rumble
            audioManager.playSoundEffect('thud3');
            this.playedEarthquakeSound = true;
        }
        
        // Generate screen shake
        this.screenShakeX = (Math.random() - 0.5) * this.earthquakeIntensity;
        this.screenShakeY = (Math.random() - 0.5) * this.earthquakeIntensity;
        
        // Reduce earthquake intensity over time
        if (this.earthquakeTimer % 10 === 0 && this.earthquakeIntensity > 0) {
            this.earthquakeIntensity -= 0.5;
        }
        
        // Expand ground cracks
        this.expandGroundCracks();
        
        // After 4 seconds, start falling
        if (this.earthquakeTimer >= 240) {
            this.cutsceneStage = 'falling';
            this.cutsceneTimer = 0;
            this.fallSpeed = 0;
            
            // Play ground breaking/falling sound
            if (!this.playedGroundBreakSound) {
                audioManager.playSoundEffect('falling');
                this.playedGroundBreakSound = true;
            }
        }
    }
    
    updateFallingStage(audioManager) {
        // Both player and golem fall naturally
        this.fallSpeed += 0.5; // Gravity acceleration
        this.golem.y += this.fallSpeed;
        
        // Store the player fall speed so game can access it
        this.playerFallSpeed = this.fallSpeed;
        
        // Fade to black
        this.blacknessAlpha = Math.min(1, this.cutsceneTimer / 180); // Fade over 3 seconds
        
        // After falling for 5 seconds, end cutscene
        if (this.cutsceneTimer >= 300) {
            this.endCutscene();
        }
    }
    
    updateGolemAnimation() {
        this.golem.animationTimer++;
        
        const animationSpeeds = {
            stand: 60, // Static
            run: 8,   // Fast for running
            jump: 12, // Medium for jumping
            slam: 8   // Fast for dramatic slam
        };
        
        const speed = animationSpeeds[this.golem.currentAnimation] || 10;
        
        if (this.golem.animationTimer >= speed) {
            this.golem.animationTimer = 0;
            const maxFrames = this.golemSprites[this.golem.currentAnimation]?.length || 1;
            this.golem.animationFrame = (this.golem.animationFrame + 1) % maxFrames;
        }
    }
    
    initializeGroundCracks() {
        this.groundCracks = [];
        
        // Create multiple crack lines across the screen
        for (let i = 0; i < 8; i++) {
            this.groundCracks.push({
                x: this.golem.x - 400 + (i * 100) + Math.random() * 50,
                y: 460, // Ground level
                width: 0,
                maxWidth: 15 + Math.random() * 20,
                length: 0,
                maxLength: 100 + Math.random() * 100,
                angle: (Math.random() - 0.5) * 0.5 // Slight random angles
            });
        }
    }
    
    expandGroundCracks() {
        this.groundCracks.forEach(crack => {
            if (crack.width < crack.maxWidth) {
                crack.width += 0.5;
            }
            if (crack.length < crack.maxLength) {
                crack.length += 2;
            }
        });
    }
    
    render(ctx, cameraX, cameraY) {
        if (!this.isActive || !this.spritesLoaded) {
            return;
        }
        
        // Apply screen shake during earthquake
        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        if (this.cutsceneStage === 'earthquake') {
            shakeOffsetX = this.screenShakeX;
            shakeOffsetY = this.screenShakeY;
        }
        
        // Render ground cracks
        this.renderGroundCracks(ctx, cameraX + shakeOffsetX, cameraY + shakeOffsetY);
        
        // Render golem
        this.renderGolem(ctx, cameraX + shakeOffsetX, cameraY + shakeOffsetY);
        
        // Render falling darkness
        if (this.cutsceneStage === 'falling' && this.blacknessAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.blacknessAlpha})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
    
    renderGolem(ctx, cameraX, cameraY) {
        const currentSprites = this.golemSprites[this.golem.currentAnimation];
        if (!currentSprites || currentSprites.length === 0) {
            return;
        }
        
        const sprite = currentSprites[this.golem.animationFrame];
        if (!sprite) {
            return;
        }
        
        const renderX = this.golem.x - cameraX;
        const renderY = this.golem.y - cameraY;
        
        ctx.save();
        
        // Flip sprite if facing left
        if (this.golem.facingLeft) {
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, -renderX - this.golem.width, renderY, this.golem.width, this.golem.height);
        } else {
            ctx.drawImage(sprite, renderX, renderY, this.golem.width, this.golem.height);
        }
        
        ctx.restore();
    }
    
    renderGroundCracks(ctx, cameraX, cameraY) {
        if (this.cutsceneStage !== 'earthquake' && this.cutsceneStage !== 'falling') {
            return;
        }
        
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        this.groundCracks.forEach(crack => {
            if (crack.length > 0) {
                const startX = crack.x - cameraX;
                const startY = crack.y - cameraY;
                const endX = startX + Math.cos(crack.angle) * crack.length;
                const endY = startY + Math.sin(crack.angle) * crack.length;
                
                ctx.lineWidth = crack.width;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        });
    }
    
    endCutscene() {
        this.cutsceneActive = false;
        this.playerFrozen = false;
        this.cutsceneStage = 'ended';
        this.cutsceneTimer = 0;
        
        // Keep screen black for a moment
        this.blacknessAlpha = 1;
        
        console.log('Boss cutscene ended. Faded to black.');
        
        // TODO: Transition to boss arena/cave
        // For now, this just ends the cutscene with black screen
    }
    
    // Getters for game state
    isPlayerFrozen() {
        return this.playerFrozen;
    }
    
    isInCutscene() {
        return this.cutsceneActive;
    }
    
    getScreenShake() {
        return {
            x: this.screenShakeX || 0,
            y: this.screenShakeY || 0
        };
    }
    
    getPlayerFallSpeed() {
        return this.playerFallSpeed || 0;
    }
    
    isPlayerFalling() {
        return this.cutsceneActive && this.cutsceneStage === 'falling';
    }
    
    shouldFadeToBlack() {
        return this.cutsceneActive && (this.cutsceneStage === 'falling' || this.cutsceneStage === 'ended');
    }
    
    getFadeAlpha() {
        return this.blacknessAlpha;
    }
    
    // Reset for new game
    reset() {
        this.isActive = false;
        this.cutsceneActive = false;
        this.cutsceneStage = 'none';
        this.cutsceneTimer = 0;
        this.triggered = false;
        this.playerFrozen = false;
        this.earthquakeIntensity = 0;
        this.earthquakeTimer = 0;
        this.screenShakeX = 0;
        this.screenShakeY = 0;
        this.groundCracks = [];
        this.fallSpeed = 0;
        this.blacknessAlpha = 0;
        this.playedEarthquakeSound = false;
        this.playedGroundBreakSound = false;
        this.playerFallSpeed = 0;
        
        // Reset golem
        this.golem.x = 0;
        this.golem.y = 0;
        this.golem.velocityX = 0;
        this.golem.velocityY = 0;
        this.golem.facingLeft = true;
        this.golem.animationFrame = 0;
        this.golem.animationTimer = 0;
        this.golem.currentAnimation = 'stand';
    }
}