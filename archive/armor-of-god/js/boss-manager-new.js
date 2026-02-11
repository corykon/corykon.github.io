class BossManager {
    constructor(audioManager, game) {
        this.audioManager = audioManager;
        this.game = game;
        
        // Boss state management
        this.isActive = false;
        this.bossDefeated = false;
        this.bossTriggered = false;
        
        // Boss properties
        this.boss = {
            x: 2500, // Center of arena
            y: 368, // Ground level (468 - 100)
            width: 120,
            height: 100,
            velocityX: 0,
            velocityY: 0,
            maxHealth: 5,
            health: 5,
            isVulnerable: false,
            vulnerabilityTimer: 0,
            invulnerabilityTimer: 0,
            facing: 'left',
            
            // State management
            state: 'patrol', // patrol, charging, jumping, slamming, stunned
            stateTimer: 0,
            
            // Animation
            animFrame: 0,
            animTimer: 0,
            hitFlash: false,
            hitFlashTimer: 0,
            
            // Movement
            speed: 3,
            jumpPower: -12,
            isGrounded: true,
            
            // Attack patterns
            lastAttackTime: 0,
            attackCooldown: 180, // 3 seconds at 60fps
            
            // Patrol bounds (boss arena)
            minX: 1200,
            maxX: 4800
        };\
        
        // Falling rocks system
        this.fallingRocks = [];\
        this.rockSpawnTimer = 0;\
        \
        // Load boss sprites\
        this.bossSprites = {};\
        this.spritesLoaded = false;\
        this.loadBossSprites();\
        \
        // Sound effects\
        this.musicStarted = false;\
    }\
    \
    loadBossSprites() {\
        const spriteFiles = {\
            stand: ['golem-stand.png'],\
            standVulnerable: ['golem-stand-b.png'],\
            run: [\
                'golem-run1.png', 'golem-run2.png', 'golem-run3.png', \
                'golem-run4.png', 'golem-run5.png', 'golem-run6.png', 'golem-run7.png'\
            ],\
            runVulnerable: [\
                'golem-run1-b.png', 'golem-run2-b.png', 'golem-run3-b.png', \
                'golem-run4-b.png', 'golem-run5-b.png', 'golem-run6-b.png', 'golem-run7-b.png'\
            ],\
            jump: [\
                'golem-jump1.png', 'golem-jump2.png', 'golem-jump3.png', \
                'golem-jump4.png', 'golem-jump5.png'\
            ],\
            jumpVulnerable: [\
                'golem-jump1-b.png', 'golem-jump2-b.png', 'golem-jump3-b.png', \
                'golem-jump4-b.png', 'golem-jump5-b.png'\
            ],\
            slam: [\
                'golem-slam1.png', 'golem-slam2.png', 'golem-slam3.png', 'golem-slam4.png',\
                'golem-slam5.png', 'golem-slam6.png', 'golem-slam7.png', 'golem-slam8.png'\
            ]\
        };\
        \
        let totalSprites = 0;\
        let loadedSprites = 0;\
        \
        // Count total sprites to load\
        Object.values(spriteFiles).forEach(files => {\
            totalSprites += files.length;\
        });\
        \
        // Load each sprite\
        Object.keys(spriteFiles).forEach(animType => {\
            this.bossSprites[animType] = [];\
            spriteFiles[animType].forEach((filename, index) => {\
                const img = new Image();\
                img.onload = () => {\
                    loadedSprites++;\
                    if (loadedSprites === totalSprites) {\
                        this.spritesLoaded = true;\
                    }\
                };\
                img.src = `images/sprites/enemy/${filename}`;\
                this.bossSprites[animType][index] = img;\
            });\
        });\
    }\
    \
    checkTrigger(playerX, level) {\
        // Only trigger on level 4 (boss cave level)\
        if (level !== 4 || this.bossTriggered || this.isActive) {\
            return false;\
        }\
        \
        // Trigger when player enters the arena area\
        if (playerX > 1100) {\
            this.triggerBossFight();\
            return true;\
        }\
        \
        return false;\
    }\
    \
    triggerBossFight() {\
        this.bossTriggered = true;\
        this.isActive = true;\
        this.boss.state = 'patrol';\
        this.boss.stateTimer = 0;\
        \
        // Start boss fight music\
        if (!this.musicStarted) {\
            this.audioManager.playMusic('boss-fight');\
            this.musicStarted = true;\
        }\
        \
        console.log('Boss fight started! Prepare for battle!');\
    }\
    \
    update(player, worldManager) {\
        if (!this.isActive || this.bossDefeated) {\
            return;\
        }\
        \
        // Update boss behavior\
        this.updateBoss(player, worldManager);\
        \
        // Update falling rocks\
        this.updateFallingRocks(player);\
        \
        // Update boss animation\
        this.updateBossAnimation();\
        \
        // Check if boss is defeated\
        if (this.boss.health <= 0 && !this.bossDefeated) {\
            this.defeatBoss();\
        }\
    }\
    \
    updateBoss(player, worldManager) {\
        this.boss.stateTimer++;\
        \
        // Update vulnerability state\
        if (this.boss.vulnerabilityTimer > 0) {\
            this.boss.vulnerabilityTimer--;\
            if (this.boss.vulnerabilityTimer <= 0) {\
                this.boss.isVulnerable = false;\
                this.boss.invulnerabilityTimer = 120; // 2 seconds invulnerable\
            }\
        }\
        \
        if (this.boss.invulnerabilityTimer > 0) {\
            this.boss.invulnerabilityTimer--;\
        }\
        \
        // Update hit flash\
        if (this.boss.hitFlashTimer > 0) {\
            this.boss.hitFlashTimer--;\
            this.boss.hitFlash = (this.boss.hitFlashTimer % 10 < 5);\
        }\
        \
        // Boss AI state machine\
        switch (this.boss.state) {\
            case 'patrol':\
                this.updatePatrolState(player);\
                break;\
            case 'charging':\
                this.updateChargingState(player);\
                break;\
            case 'jumping':\
                this.updateJumpingState(player);\
                break;\
            case 'slamming':\
                this.updateSlammingState(player);\
                break;\
            case 'stunned':\
                this.updateStunnedState();\
                break;\
        }\
        \
        // Apply physics\
        this.applyBossPhysics(worldManager);\
    }\
    \
    updatePatrolState(player) {\
        // Boss patrols back and forth\
        if (this.boss.facing === 'left') {\
            this.boss.velocityX = -this.boss.speed;\
            if (this.boss.x <= this.boss.minX) {\
                this.boss.facing = 'right';\
            }\
        } else {\
            this.boss.velocityX = this.boss.speed;\
            if (this.boss.x >= this.boss.maxX) {\
                this.boss.facing = 'left';\
            }\
        }\
        \
        // Decide on next attack\
        const now = Date.now();\
        if (now - this.boss.lastAttackTime > this.boss.attackCooldown * (1000/60)) {\
            if (Math.random() < 0.6) {\
                this.startChargingAttack(player);\
            } else {\
                this.startJumpAttack();\
            }\
        }\
    }\
    \
    updateChargingState(player) {\
        // Boss charges toward player\
        const direction = player.x > this.boss.x ? 1 : -1;\
        this.boss.facing = direction > 0 ? 'right' : 'left';\
        this.boss.velocityX = direction * this.boss.speed * 2; // Faster when charging\
        \
        // Stop charging and slam if close to player or after time limit\
        const distanceToPlayer = Math.abs(this.boss.x - player.x);\
        if (distanceToPlayer < 150 || this.boss.stateTimer > 120) {\
            this.startSlamAttack();\
        }\
    }\
    \
    updateJumpingState(player) {\
        // Boss jumps - just wait for landing\
        if (this.boss.isGrounded && this.boss.stateTimer > 30) {\
            this.boss.state = 'patrol';\
            this.boss.stateTimer = 0;\
            this.boss.lastAttackTime = Date.now();\
        }\
    }\
    \
    updateSlammingState(player) {\
        this.boss.velocityX = 0; // Stop moving during slam\
        \
        if (this.boss.stateTimer === 30) {\
            // Slam impact - create falling rocks and become vulnerable\
            this.createFallingRocks();\
            this.boss.isVulnerable = true;\
            this.boss.vulnerabilityTimer = 180; // 3 seconds vulnerable\
            this.audioManager.playSoundEffect('smash');\
            this.audioManager.playSoundEffect('earthquake-rumble');\
        }\
        \
        if (this.boss.stateTimer > 60) {\
            this.boss.state = 'stunned';\
            this.boss.stateTimer = 0;\
        }\
    }\
    \
    updateStunnedState() {\
        this.boss.velocityX = 0;\
        \
        if (this.boss.stateTimer > 120) { // 2 seconds stunned\
            this.boss.state = 'patrol';\
            this.boss.stateTimer = 0;\
            this.boss.lastAttackTime = Date.now();\
        }\
    }\
    \
    startChargingAttack(player) {\
        this.boss.state = 'charging';\
        this.boss.stateTimer = 0;\
        this.audioManager.playSoundEffect('thud2');\
    }\
    \
    startJumpAttack() {\
        this.boss.state = 'jumping';\
        this.boss.stateTimer = 0;\
        this.boss.velocityY = this.boss.jumpPower;\
        this.boss.isGrounded = false;\
        this.audioManager.playSoundEffect('thud3');\
    }\
    \
    startSlamAttack() {\
        this.boss.state = 'slamming';\
        this.boss.stateTimer = 0;\
        this.boss.velocityX = 0;\
    }\
    \
    applyBossPhysics(worldManager) {\
        // Apply gravity\
        if (!this.boss.isGrounded) {\
            this.boss.velocityY += 0.5; // Gravity\
        }\
        \
        // Update position\
        this.boss.x += this.boss.velocityX;\
        this.boss.y += this.boss.velocityY;\
        \
        // Keep boss within arena bounds\
        this.boss.x = Math.max(this.boss.minX, Math.min(this.boss.maxX, this.boss.x));\
        \
        // Ground collision\
        const groundY = 468 - this.boss.height;\
        if (this.boss.y >= groundY) {\
            this.boss.y = groundY;\
            this.boss.velocityY = 0;\
            this.boss.isGrounded = true;\
        } else {\
            this.boss.isGrounded = false;\
        }\
    }\
    \
    createFallingRocks() {\
        // Create several falling rocks across the arena\
        for (let i = 0; i < 8; i++) {\
            this.fallingRocks.push({\
                x: this.boss.minX + Math.random() * (this.boss.maxX - this.boss.minX),\
                y: -50,\
                width: 30,\
                height: 30,\
                velocityY: Math.random() * 3 + 2,\
                alive: true\
            });\
        }\
    }\
    \
    updateFallingRocks(player) {\
        this.fallingRocks.forEach((rock, index) => {\
            if (!rock.alive) return;\
            \
            rock.y += rock.velocityY;\
            rock.velocityY += 0.3; // Gravity\
            \
            // Check collision with player\
            if (this.checkRockPlayerCollision(rock, player)) {\
                // Player hit by rock\
                if (!player.invulnerable) {\
                    this.game.takeDamage(1);\
                }\
                rock.alive = false;\
            }\
            \
            // Remove rock if it hits the ground\
            if (rock.y > 468) {\
                rock.alive = false;\
            }\
        });\
        \
        // Remove dead rocks\
        this.fallingRocks = this.fallingRocks.filter(rock => rock.alive);\
    }\
    \
    checkRockPlayerCollision(rock, player) {\
        return rock.x < player.x + player.width &&\
               rock.x + rock.width > player.x &&\
               rock.y < player.y + player.height &&\
               rock.y + rock.height > player.y;\
    }\
    \
    checkPlayerBossCollision(player) {\
        if (!this.isActive || this.bossDefeated) return false;\
        \
        const collision = player.x < this.boss.x + this.boss.width &&\
                         player.x + player.width > this.boss.x &&\
                         player.y < this.boss.y + this.boss.height &&\
                         player.y + player.height > this.boss.y;\
        \
        if (collision) {\
            // Check if player is jumping on boss head (top collision)\
            const isJumpingOnHead = player.velocityY > 0 && \
                                  player.y + player.height - 10 < this.boss.y + 20;\
            \
            if (isJumpingOnHead && this.boss.isVulnerable && this.boss.invulnerabilityTimer <= 0) {\
                // Player successfully hits boss\
                this.damageBosse();\
                return true;\
            } else if (!this.boss.isVulnerable) {\
                // Boss is invulnerable (red/hot) - hurt player\
                if (!player.invulnerable) {\
                    this.game.takeDamage(1);\
                }\
                return true;\
            }\
        }\
        \
        return false;\
    }\
    \
    damageBoss() {\
        this.boss.health--;\
        this.boss.isVulnerable = false;\
        this.boss.vulnerabilityTimer = 0;\
        this.boss.invulnerabilityTimer = 120;\
        this.boss.hitFlash = true;\
        this.boss.hitFlashTimer = 30;\
        \
        // Play hit sound and grunt\
        this.audioManager.playSoundEffect('grunt1');\
        \
        console.log(`Boss hit! Health: ${this.boss.health}/${this.boss.maxHealth}`);\
        \
        // Make boss angry (faster attacks)\
        if (this.boss.health <= 2) {\
            this.boss.attackCooldown = 120; // Faster attacks when low health\
            this.boss.speed = 4; // Faster movement\
        }\
    }\
    \
    defeatBoss() {\
        this.bossDefeated = true;\
        this.boss.state = 'defeated';\
        this.boss.velocityX = 0;\
        this.fallingRocks = [];\
        \
        // Play victory sound\
        this.audioManager.playSoundEffect('winner1');\
        this.audioManager.stopMusic();\
        \
        console.log('Boss defeated! Victory!');\
        \
        // Mark level as complete\
        setTimeout(() => {\
            this.game.levelComplete();\
        }, 2000);\
    }\
    \
    updateBossAnimation() {\
        this.boss.animTimer++;\
        \
        let animSpeed = 8;\
        let currentAnim;\
        \
        if (this.bossDefeated) {\
            currentAnim = this.boss.isVulnerable ? 'standVulnerable' : 'stand';\
            animSpeed = 60; // Very slow when defeated\
        } else {\
            switch (this.boss.state) {\
                case 'patrol':\
                    currentAnim = (this.boss.isVulnerable ? 'runVulnerable' : 'run');\
                    animSpeed = 8;\
                    break;\
                case 'charging':\
                    currentAnim = (this.boss.isVulnerable ? 'runVulnerable' : 'run');\
                    animSpeed = 4; // Faster when charging\
                    break;\
                case 'jumping':\
                    currentAnim = (this.boss.isVulnerable ? 'jumpVulnerable' : 'jump');\
                    animSpeed = 10;\
                    break;\
                case 'slamming':\
                    currentAnim = 'slam';\
                    animSpeed = 6;\
                    break;\
                case 'stunned':\
                    currentAnim = this.boss.isVulnerable ? 'standVulnerable' : 'stand';\
                    animSpeed = 30; // Slow when stunned\
                    break;\
                default:\
                    currentAnim = this.boss.isVulnerable ? 'standVulnerable' : 'stand';\
            }\
        }\
        \
        if (this.boss.animTimer >= animSpeed) {\
            this.boss.animTimer = 0;\
            const maxFrames = this.bossSprites[currentAnim]?.length || 1;\
            this.boss.animFrame = (this.boss.animFrame + 1) % maxFrames;\
        }\
        \
        this.boss.currentAnimation = currentAnim;\
    }\
    \
    render(ctx, cameraX, cameraY) {\
        if (!this.isActive || !this.spritesLoaded) {\
            return;\
        }\
        \
        // Render falling rocks\
        ctx.fillStyle = '#8B4513';\
        this.fallingRocks.forEach(rock => {\
            ctx.fillRect(rock.x - cameraX, rock.y - cameraY, rock.width, rock.height);\
        });\
        \
        // Render boss health bar\
        this.renderBossHealthBar(ctx);\
        \
        // Render boss\
        this.renderBoss(ctx, cameraX, cameraY);\
    }\
    \
    renderBoss(ctx, cameraX, cameraY) {\
        const sprites = this.bossSprites[this.boss.currentAnimation];\
        if (!sprites || sprites.length === 0) {\
            return;\
        }\
        \
        const sprite = sprites[this.boss.animFrame];\
        if (!sprite) {\
            return;\
        }\
        \
        const renderX = this.boss.x - cameraX;\
        const renderY = this.boss.y - cameraY;\
        \
        ctx.save();\
        \
        // Apply hit flash\
        if (this.boss.hitFlash) {\
            ctx.filter = 'brightness(2) saturate(0)';\
        }\
        \
        // Flip sprite based on facing direction\
        if (this.boss.facing === 'right') {\
            ctx.scale(-1, 1);\
            ctx.drawImage(sprite, -renderX - this.boss.width, renderY, this.boss.width, this.boss.height);\
        } else {\
            ctx.drawImage(sprite, renderX, renderY, this.boss.width, this.boss.height);\
        }\
        \
        ctx.restore();\
    }\
    \
    renderBossHealthBar(ctx) {\
        if (this.bossDefeated) return;\
        \
        const barWidth = 300;\
        const barHeight = 20;\
        const x = (ctx.canvas.width - barWidth) / 2;\
        const y = 30;\
        \
        // Background\
        ctx.fillStyle = '#000000';\
        ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);\
        \
        // Health bar background\
        ctx.fillStyle = '#8B0000'; // Dark red\
        ctx.fillRect(x, y, barWidth, barHeight);\
        \
        // Health bar fill\
        const healthPercent = this.boss.health / this.boss.maxHealth;\
        ctx.fillStyle = healthPercent > 0.3 ? '#FF4500' : '#FF0000'; // Orange to red\
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);\
        \
        // Boss name\
        ctx.fillStyle = '#FFFFFF';\
        ctx.font = 'bold 16px \"Press Start 2P\"';\
        ctx.textAlign = 'center';\
        ctx.fillText('STONE GOLEM', ctx.canvas.width / 2, y - 8);\
    }\
    \
    // Getters for game integration\
    isPlayerFrozen() {\
        return false; // No freezing in interactive boss fight\
    }\
    \
    isInCutscene() {\
        return false; // No cutscenes in interactive boss fight\
    }\
    \
    getScreenShake() {\
        // Add screen shake during slam attacks\
        if (this.boss.state === 'slamming' && this.boss.stateTimer >= 25 && this.boss.stateTimer <= 35) {\
            return {\
                x: (Math.random() - 0.5) * 8,\
                y: (Math.random() - 0.5) * 8\
            };\
        }\
        return { x: 0, y: 0 };\
    }\
    \
    getPlayerFallSpeed() {\
        return 0; // No forced falling in interactive boss fight\
    }\
    \
    isPlayerFalling() {\
        return false;\
    }\
    \
    shouldFadeToBlack() {\
        return false;\
    }\
    \
    getFadeAlpha() {\
        return 0;\
    }\
    \
    // Reset for new game\
    reset() {\
        this.isActive = false;\
        this.bossDefeated = false;\
        this.bossTriggered = false;\
        this.musicStarted = false;\
        \
        this.boss.health = this.boss.maxHealth;\
        this.boss.state = 'patrol';\
        this.boss.stateTimer = 0;\
        this.boss.x = 2500;\
        this.boss.y = 368;\
        this.boss.velocityX = 0;\
        this.boss.velocityY = 0;\
        this.boss.isVulnerable = false;\
        this.boss.vulnerabilityTimer = 0;\
        this.boss.invulnerabilityTimer = 0;\
        this.boss.facing = 'left';\
        this.boss.isGrounded = true;\
        this.boss.animFrame = 0;\
        this.boss.animTimer = 0;\
        this.boss.hitFlash = false;\
        this.boss.hitFlashTimer = 0;\
        this.boss.lastAttackTime = 0;\
        this.boss.attackCooldown = 180;\
        this.boss.speed = 3;\
        this.boss.currentAnimation = 'stand';\
        \
        this.fallingRocks = [];\
        this.rockSpawnTimer = 0;\
    }\
}