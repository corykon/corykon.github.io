class BossManager {
    constructor(game) {
        this.game = game;
        this.audioManager = null;
        this.isActive = false;
        this.bossDefeated = false;
        
        // Boss data
        this.boss = {
            x: 0,
            y: 0,
            initialX: 0,
            initialY: 0,
            width: 120,
            height: 140,
            velocityX: 0,
            velocityY: 0,
            speed: 2,
            jumpPower: -15,
            health: 5,
            maxHealth: 5,
            isGrounded: true,
            facing: 'left',
            minX: 720,
            maxX: 1780,
            
            // AI state
            state: 'patrol', // patrol, charging, jumping, slamming, stunned
            stateTimer: 0,
            lastAttackTime: Date.now(),
            attackCooldown: 240, // 4 seconds between attacks
            
            // Vulnerability system
            isVulnerable: false,
            vulnerabilityTimer: 0,
            invulnerabilityTimer: 0,
            
            // Animation and visual effects
            currentAnimation: 'stand',
            animFrame: 0,
            animTimer: 0,
            hitFlash: false,
            hitFlashTimer: 0
        };
        
        // Falling rocks system
        this.fallingRocks = [];
        
        // Sprite management
        this.bossSprites = {
            stand: [],
            standVulnerable: [],
            run: [],
            runVulnerable: [],
            jump: [],
            jumpVulnerable: [],
            slam: [],
            slamVulnerable: []
        };
        this.spritesLoaded = false;
        
        console.log('Boss Manager initialized for interactive boss fight');
    }
    
    async loadSprites() {
        console.log('Loading boss sprites...');
        
        const spriteList = [
            // Normal (invulnerable) sprites
            { name: 'stand', sprites: ['sprites/enemy/golem-stand.png'] },
            { name: 'run', sprites: [
                'sprites/enemy/golem-run1.png',
                'sprites/enemy/golem-run2.png',
                'sprites/enemy/golem-run3.png',
                'sprites/enemy/golem-run4.png',
                'sprites/enemy/golem-run5.png',
                'sprites/enemy/golem-run6.png',
                'sprites/enemy/golem-run7.png'
            ]},
            { name: 'jump', sprites: [
                'sprites/enemy/golem-jump1.png',
                'sprites/enemy/golem-jump2.png',
                'sprites/enemy/golem-jump3.png',
                'sprites/enemy/golem-jump4.png',
                'sprites/enemy/golem-jump5.png'
            ]},
            { name: 'slam', sprites: [
                'sprites/enemy/golem-slam1.png',
                'sprites/enemy/golem-slam2.png',
                'sprites/enemy/golem-slam3.png',
                'sprites/enemy/golem-slam4.png',
                'sprites/enemy/golem-slam5.png',
                'sprites/enemy/golem-slam6.png',
                'sprites/enemy/golem-slam7.png',
                'sprites/enemy/golem-slam8.png'
            ]},
            
            // Vulnerable (blue/cooled) sprites - same frames with -b suffix
            { name: 'standVulnerable', sprites: ['sprites/enemy/golem-stand-b.png'] },
            { name: 'runVulnerable', sprites: [
                'sprites/enemy/golem-run1-b.png',
                'sprites/enemy/golem-run2-b.png',
                'sprites/enemy/golem-run3-b.png',
                'sprites/enemy/golem-run4-b.png',
                'sprites/enemy/golem-run5-b.png',
                'sprites/enemy/golem-run6-b.png',
                'sprites/enemy/golem-run7-b.png'
            ]},
            { name: 'jumpVulnerable', sprites: [
                'sprites/enemy/golem-jump1-b.png',
                'sprites/enemy/golem-jump2-b.png',
                'sprites/enemy/golem-jump3-b.png',
                'sprites/enemy/golem-jump4-b.png',
                'sprites/enemy/golem-jump5-b.png'
            ]},
            { name: 'slamVulnerable', sprites: [
                'sprites/enemy/golem-slam1-b.png',
                'sprites/enemy/golem-slam2-b.png',
                'sprites/enemy/golem-slam3-b.png',
                'sprites/enemy/golem-slam4-b.png',
                'sprites/enemy/golem-slam5-b.png',
                'sprites/enemy/golem-slam6-b.png',
                'sprites/enemy/golem-slam7-b.png',
                'sprites/enemy/golem-slam8-b.png'
            ]}
        ];
        
        try {
            for (const category of spriteList) {
                this.bossSprites[category.name] = [];
                
                for (const spriteName of category.sprites) {
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => {
                            console.warn(`Failed to load sprite: ${spriteName}`);
                            resolve(); // Continue loading other sprites
                        };
                        img.src = `images/${spriteName}`;
                    });
                    
                    if (img.complete && img.naturalWidth > 0) {
                        this.bossSprites[category.name].push(img);
                    }
                }
                
                console.log(`Loaded ${this.bossSprites[category.name].length} sprites for ${category.name}`);
            }
            
            this.spritesLoaded = true;
            console.log('Boss sprites loaded successfully');
            
        } catch (error) {
            console.error('Error loading boss sprites:', error);
            this.spritesLoaded = false;
        }
    }
    
    activate(audioManager) {
        this.audioManager = audioManager;
        this.isActive = true;
        this.fightStarted = false; // Track if boss fight has been triggered
        this.barriersCreated = false; // Track if stone barriers have been created
        
        // Initialize boss position and state
        this.boss.x = 1200; // Further right, past where stone barriers will appear
        this.boss.y = 468 - this.boss.height; // Ground level
        this.boss.initialX = this.boss.x;
        this.boss.initialY = this.boss.y;
        this.boss.velocityX = 0;
        this.boss.velocityY = 0;
        this.boss.isGrounded = true;
        this.boss.facing = 'left';
        
        // Reset boss state
        this.boss.health = this.boss.maxHealth;
        this.boss.state = 'patrol';
        this.boss.stateTimer = 0;
        this.boss.isVulnerable = false;
        this.boss.vulnerabilityTimer = 0;
        this.boss.invulnerabilityTimer = 0;
        this.boss.lastAttackTime = Date.now();
        
        // Clear falling rocks
        this.fallingRocks = [];
        this.bossDefeated = false;
        
        // Start boss music
        if (this.audioManager) {
            this.audioManager.playMusic('boss-fight');
        }
        
        console.log('Boss fight activated - Stone Golem awakens!');
    }
    
    update(player, worldManager) {
        if (!this.isActive) return;
        
        // Boss fight triggers when player approaches
        if (!this.fightStarted) {
            const distanceToPlayer = Math.abs(this.boss.x - player.x);
            if (distanceToPlayer < 300) {
                this.fightStarted = true;
                this.audioManager.playMusic('boss-fight');
                console.log('Boss fight started - Stone Golem awakens!');
            }
        }
        
        // Stone barriers trigger when player passes the first barrier position
        if (!this.barriersCreated && player.x > 680) {
            this.createStoneBarriers(worldManager);
            console.log('Player crosses barrier line - Stone barriers rise!');
        }
        
        if (this.bossDefeated) {
            return; // Boss is defeated, no more updates needed
        }
        
        // Check if boss should be defeated
        if (this.boss.health <= 0) {
            this.defeatBoss();
            return;
        }
        
        // Update boss behavior
        this.updateBoss(player, worldManager);
        
        // Update falling rocks
        this.updateFallingRocks(player);
        
        // Check boss-player collision
        this.checkPlayerBossCollision(player);
    }
    
    updateBoss(player, worldManager) {
        this.boss.stateTimer++;
        
        // Update vulnerability state
        if (this.boss.vulnerabilityTimer > 0) {
            this.boss.vulnerabilityTimer--;
            if (this.boss.vulnerabilityTimer <= 0) {
                this.boss.isVulnerable = false;
                this.boss.invulnerabilityTimer = 120; // 2 seconds invulnerable
            }
        }
        
        if (this.boss.invulnerabilityTimer > 0) {
            this.boss.invulnerabilityTimer--;
        }
        
        // Update hit flash
        if (this.boss.hitFlashTimer > 0) {
            this.boss.hitFlashTimer--;
            this.boss.hitFlash = (this.boss.hitFlashTimer % 10 < 5);
        }
        
        // Boss AI state machine
        switch (this.boss.state) {
            case 'patrol':
                this.updatePatrolState(player);
                break;
            case 'charging':
                this.updateChargingState(player);
                break;
            case 'jumping':
                this.updateJumpingState(player);
                break;
            case 'slamming':
                this.updateSlammingState(player, worldManager);
                break;
            case 'stunned':
                this.updateStunnedState();
                break;
        }
        
        // Apply physics
        this.applyBossPhysics(worldManager);
    }
    
    updatePatrolState(player) {
        // Boss patrols back and forth
        if (this.boss.facing === 'left') {
            this.boss.velocityX = -this.boss.speed;
            if (this.boss.x <= this.boss.minX) {
                this.boss.facing = 'right';
            }
        } else {
            this.boss.velocityX = this.boss.speed;
            if (this.boss.x >= this.boss.maxX) {
                this.boss.facing = 'left';
            }
        }
        
        // Decide on next attack
        const now = Date.now();
        if (now - this.boss.lastAttackTime > this.boss.attackCooldown * (1000/60)) {
            if (Math.random() < 0.6) {
                this.startChargingAttack(player);
            } else {
                this.startJumpAttack();
            }
        }
    }
    
    updateChargingState(player) {
        // Boss charges toward player
        const direction = player.x > this.boss.x ? 1 : -1;
        this.boss.facing = direction > 0 ? 'right' : 'left';
        this.boss.velocityX = direction * this.boss.speed * 2; // Faster when charging
        
        // Stop charging and slam if close to player or after time limit
        const distanceToPlayer = Math.abs(this.boss.x - player.x);
        if (distanceToPlayer < 150 || this.boss.stateTimer > 120) {
            this.startSlamAttack();
        }
    }
    
    updateJumpingState(player) {
        // Boss jumps - wait for animation and landing
        // With 5-frame jump animation at 8 frames per animation frame = 40 game frames total
        if (this.boss.isGrounded && this.boss.stateTimer > 45) {
            this.boss.state = 'patrol';
            this.boss.stateTimer = 0;
            this.boss.lastAttackTime = Date.now();
        }
    }
    
    updateSlammingState(player, worldManager) {
        this.boss.velocityX = 0; // Stop moving during slam
        
        // Slam impact occurs partway through the 8-frame animation
        // At 5 frames per animation frame, frame 4 (index 3) occurs around frame 20
        if (this.boss.stateTimer === 25) {
            // Slam impact - create falling rocks and become vulnerable
            this.createFallingRocks();
            this.boss.isVulnerable = true;
            this.boss.vulnerabilityTimer = 180; // 3 seconds vulnerable
            this.audioManager.playSoundEffect('smash');
            this.audioManager.playSoundEffect('earthquake-rumble');
        }
        
        // Allow full slam animation to complete (8 frames * 5 speed = 40 frames)
        if (this.boss.stateTimer > 50) {
            this.boss.state = 'stunned';
            this.boss.stateTimer = 0;
        }
    }
    
    updateStunnedState() {
        this.boss.velocityX = 0;
        
        if (this.boss.stateTimer > 120) { // 2 seconds stunned
            this.boss.state = 'patrol';
            this.boss.stateTimer = 0;
            this.boss.lastAttackTime = Date.now();
        }
    }
    
    startChargingAttack(player) {
        this.boss.state = 'charging';
        this.boss.stateTimer = 0;
        this.audioManager.playSoundEffect('thud2');
    }
    
    startJumpAttack() {
        this.boss.state = 'jumping';
        this.boss.stateTimer = 0;
        this.boss.velocityY = this.boss.jumpPower;
        this.boss.isGrounded = false;
        this.audioManager.playSoundEffect('thud3');
    }
    
    startSlamAttack() {
        this.boss.state = 'slamming';
        this.boss.stateTimer = 0;
        this.boss.velocityX = 0;
    }
    
    applyBossPhysics(worldManager) {
        // Apply gravity
        if (!this.boss.isGrounded) {
            this.boss.velocityY += 0.5; // Gravity
        }
        
        // Update position
        const nextX = this.boss.x + this.boss.velocityX;
        
        // Check for stone barrier collisions if barriers are active
        let canMove = true;
        if (this.barriersCreated && worldManager.barriersActive) {
            // Check collision with barriers at x:680 and x:1820
            if ((nextX < 720 && this.boss.velocityX < 0) || // Hitting left barrier
                (nextX + this.boss.width > 1820 && this.boss.velocityX > 0)) { // Hitting right barrier
                canMove = false;
                this.boss.velocityX = 0; // Stop movement when hitting barrier
            }
        }
        
        if (canMove) {
            this.boss.x = nextX;
        }
        
        this.boss.y += this.boss.velocityY;
        
        // Keep boss within arena bounds (fallback if barriers aren't active)
        this.boss.x = Math.max(this.boss.minX, Math.min(this.boss.maxX, this.boss.x));
        
        // Ground collision
        const groundY = 468 - this.boss.height;
        if (this.boss.y >= groundY) {
            this.boss.y = groundY;
            this.boss.velocityY = 0;
            this.boss.isGrounded = true;
        } else {
            this.boss.isGrounded = false;
        }
    }
    
    createFallingRocks() {
        // Create several falling rocks across the arena
        for (let i = 0; i < 8; i++) {
            this.fallingRocks.push({
                x: this.boss.minX + Math.random() * (this.boss.maxX - this.boss.minX),
                y: -50,
                width: 30,
                height: 30,
                velocityY: Math.random() * 3 + 2,
                alive: true
            });
        }
    }
    
    updateFallingRocks(player) {
        this.fallingRocks.forEach((rock, index) => {
            if (!rock.alive) return;
            
            rock.y += rock.velocityY;
            rock.velocityY += 0.3; // Gravity
            
            // Check collision with player
            if (this.checkRockPlayerCollision(rock, player)) {
                // Player hit by rock
                if (!player.invulnerable) {
                    this.game.takeDamage(1);
                }
                rock.alive = false;
            }
            
            // Remove rock if it hits the ground
            if (rock.y > 468) {
                rock.alive = false;
            }
        });
        
        // Remove dead rocks
        this.fallingRocks = this.fallingRocks.filter(rock => rock.alive);
    }
    
    checkRockPlayerCollision(rock, player) {
        return rock.x < player.x + player.width &&
               rock.x + rock.width > player.x &&
               rock.y < player.y + player.height &&
               rock.y + rock.height > player.y;
    }
    
    checkPlayerBossCollision(player) {
        if (!this.isActive || this.bossDefeated) return false;
        
        const collision = player.x < this.boss.x + this.boss.width &&
                         player.x + player.width > this.boss.x &&
                         player.y < this.boss.y + this.boss.height &&
                         player.y + player.height > this.boss.y;
        
        if (collision) {
            // Check if player is jumping on boss head (top collision)
            const isJumpingOnHead = player.velocityY > 0 && 
                                  player.y + player.height - 10 < this.boss.y + 20;
            
            if (isJumpingOnHead && this.boss.isVulnerable && this.boss.invulnerabilityTimer <= 0) {
                // Player successfully hits boss
                this.damageBoss();
                return true;
            } else if (!this.boss.isVulnerable) {
                // Boss is invulnerable (red/hot) - hurt player
                if (!player.invulnerable) {
                    this.game.takeDamage(1);
                }
                return true;
            }
        }
        
        return false;
    }
    
    damageBoss() {
        this.boss.health--;
        this.boss.isVulnerable = false;
        this.boss.vulnerabilityTimer = 0;
        this.boss.invulnerabilityTimer = 120;
        this.boss.hitFlash = true;
        this.boss.hitFlashTimer = 30;
        
        // Play hit sound and grunt
        this.audioManager.playSoundEffect('grunt1');
        
        console.log(`Boss hit! Health: ${this.boss.health}/${this.boss.maxHealth}`);
        
        // Make boss angry (faster attacks)
        if (this.boss.health <= 2) {
            this.boss.attackCooldown = 120; // Faster attacks when low health
            this.boss.speed = 4; // Faster movement
        }
    }
    
    defeatBoss() {
        this.bossDefeated = true;
        this.boss.state = 'defeated';
        this.boss.velocityX = 0;
        this.fallingRocks = [];
        
        // Play victory sound
        this.audioManager.playSoundEffect('winner1');
        this.audioManager.stopMusic();
        
        console.log('Boss defeated! Victory!');
        
        // Remove stone barriers so player can proceed
        setTimeout(() => {
            if (this.game && this.game.worldManager) {
                this.game.worldManager.removeStoneBarriers();
            }
        }, 1000); // Small delay for dramatic effect
        
        // Mark level as complete
        setTimeout(() => {
            this.game.levelComplete();
        }, 2000);
    }
    
    updateBossAnimation() {
        this.boss.animTimer++;
        
        let animSpeed = 8;
        let currentAnim;
        
        if (this.bossDefeated) {
            currentAnim = this.boss.isVulnerable ? 'standVulnerable' : 'stand';
            animSpeed = 60; // Very slow when defeated
        } else {
            switch (this.boss.state) {
                case 'patrol':
                    currentAnim = (this.boss.isVulnerable ? 'runVulnerable' : 'run');
                    animSpeed = 6; // Slower for 7-frame run cycle
                    break;
                case 'charging':
                    currentAnim = (this.boss.isVulnerable ? 'runVulnerable' : 'run');
                    animSpeed = 3; // Faster when charging (7-frame cycle)
                    break;
                case 'jumping':
                    currentAnim = (this.boss.isVulnerable ? 'jumpVulnerable' : 'jump');
                    animSpeed = 8; // Medium speed for 5-frame jump cycle
                    break;
                case 'slamming':
                    currentAnim = this.boss.isVulnerable ? 'slamVulnerable' : 'slam';
                    animSpeed = 5; // Good speed for 8-frame slam sequence
                    break;
                case 'stunned':
                    currentAnim = this.boss.isVulnerable ? 'standVulnerable' : 'stand';
                    animSpeed = 30; // Slow when stunned
                    break;
                default:
                    currentAnim = this.boss.isVulnerable ? 'standVulnerable' : 'stand';
            }
        }
        
        if (this.boss.animTimer >= animSpeed) {
            this.boss.animTimer = 0;
            const maxFrames = this.bossSprites[currentAnim]?.length || 1;
            this.boss.animFrame = (this.boss.animFrame + 1) % maxFrames;
        }
        
        this.boss.currentAnimation = currentAnim;
    }
    
    createStoneBarriers(worldManager) {
        // Create stone barriers to trap player in arena when boss slams
        if (!this.barriersCreated) {
            worldManager.createStoneBarriers();
            this.barriersCreated = true;
            console.log('Boss slams ground - Stone barriers rise to trap the arena!');
        }
    }
    
    render(context, camera) {
        if (!this.isActive) return;
        
        // Screen shake effect during boss fight
        if (this.boss.state === 'slamming' && this.boss.stateTimer < 60) {
            const shakeIntensity = (60 - this.boss.stateTimer) / 10;
            camera.x += (Math.random() - 0.5) * shakeIntensity;
            camera.y += (Math.random() - 0.5) * shakeIntensity;
        }
        
        // Update boss animation
        this.updateBossAnimation();
        
        // Render boss
        this.renderBoss(context, camera);
        
        // Render falling rocks
        this.renderFallingRocks(context, camera);
        
        // Render boss health bar
        this.renderBossHealthBar(context);
        
        // Render boss status indicators
        this.renderBossStatusIndicators(context, camera);
    }
    
    renderBoss(context, camera) {
        const sprite = this.getCurrentBossSprite();
        if (!sprite) return;
        
        const screenX = this.boss.x - camera.x;
        const screenY = this.boss.y - camera.y;
        
        // Apply hit flash effect
        if (this.boss.hitFlash) {
            context.globalAlpha = 0.7;
        }
        
        // Flip sprite if facing left
        if (this.boss.facing === 'left') {
            context.save();
            context.scale(-1, 1);
            context.drawImage(sprite, -screenX - this.boss.width, screenY, this.boss.width, this.boss.height);
            context.restore();
        } else {
            context.drawImage(sprite, screenX, screenY, this.boss.width, this.boss.height);
        }
        
        // Reset alpha
        context.globalAlpha = 1.0;
        
        // Debug - draw boss bounds
        if (false) { // Set to true for debugging
            context.strokeStyle = this.boss.isVulnerable ? 'blue' : 'red';
            context.strokeRect(screenX, screenY, this.boss.width, this.boss.height);
        }
    }
    
    getCurrentBossSprite() {
        const anim = this.boss.currentAnimation || 'stand';
        const sprites = this.bossSprites[anim];
        if (!sprites || sprites.length === 0) {
            return this.bossSprites.stand?.[0] || null;
        }
        
        const frame = Math.min(this.boss.animFrame, sprites.length - 1);
        return sprites[frame];
    }
    
    renderFallingRocks(context, camera) {
        context.fillStyle = '#8B4513'; // Brown color for rocks
        
        this.fallingRocks.forEach(rock => {
            if (!rock.alive) return;
            
            const screenX = rock.x - camera.x;
            const screenY = rock.y - camera.y;
            
            // Draw rock as a simple rectangle (could be replaced with sprites)
            context.fillRect(screenX, screenY, rock.width, rock.height);
            
            // Add some texture lines
            context.strokeStyle = '#654321';
            context.lineWidth = 2;
            context.strokeRect(screenX, screenY, rock.width, rock.height);
        });
    }
    
    renderBossHealthBar(context) {
        if (this.bossDefeated) return;
        
        const barWidth = 400;
        const barHeight = 20;
        const barX = (context.canvas.width - barWidth) / 2;
        const barY = 40;
        
        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);
        
        // Health bar background
        context.fillStyle = '#661111';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill
        const healthPercent = this.boss.health / this.boss.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#DD2222' : 
                           healthPercent > 0.25 ? '#DD6622' : 
                           '#DD8822';
        context.fillStyle = healthColor;
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(barX, barY, barWidth, barHeight);
        
        // Boss name
        context.fillStyle = '#FFFFFF';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('Stone Golem', barX + barWidth/2, barY - 10);
        
        // Health numbers
        context.font = '12px Arial';
        context.fillText(`${this.boss.health}/${this.boss.maxHealth}`, barX + barWidth/2, barY + 14);
    }
    
    renderBossStatusIndicators(context, camera) {
        if (this.bossDefeated) return;
        
        const screenX = this.boss.x - camera.x;
        const screenY = this.boss.y - camera.y;
        
        // Vulnerability indicator
        if (this.boss.isVulnerable) {
            context.fillStyle = 'rgba(0, 255, 0, 0.3)';
            context.fillRect(screenX - 10, screenY - 10, this.boss.width + 20, this.boss.height + 20);
            
            // Glowing effect
            const glowAlpha = (Math.sin(Date.now() * 0.01) + 1) * 0.2 + 0.3;
            context.fillStyle = `rgba(0, 255, 0, ${glowAlpha})`;
            context.fillRect(screenX - 5, screenY - 5, this.boss.width + 10, this.boss.height + 10);
        }
        
        // Invulnerability indicator (red tint)
        if (this.boss.invulnerabilityTimer > 0 && !this.boss.isVulnerable) {
            const alpha = (Math.sin(this.boss.invulnerabilityTimer * 0.3) + 1) * 0.15 + 0.1;
            context.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            context.fillRect(screenX, screenY, this.boss.width, this.boss.height);
        }
    }
    
    cleanup() {
        // Clean up any remaining resources
        this.fallingRocks = [];
        this.isActive = false;
        this.bossDefeated = false;
        
        // Reset boss to initial state
        if (this.boss) {
            this.boss.health = this.boss.maxHealth;
            this.boss.state = 'patrol';
            this.boss.isVulnerable = false;
            this.boss.vulnerabilityTimer = 0;
            this.boss.invulnerabilityTimer = 0;
            this.boss.x = this.boss.initialX;
            this.boss.y = this.boss.initialY;
        }
        
        // Reset fight state
        this.fightStarted = false;
        this.barriersCreated = false;
        
        console.log('Boss manager cleaned up');
    }
    
    destroy() {
        this.cleanup();
        this.bossSprites = null;
        this.boss = null;
        this.game = null;
        this.audioManager = null;
    }
}