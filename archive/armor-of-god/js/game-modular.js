class ArmorOfGodGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = 'menu';
        this.isPaused = false;
        this.hasArmor = false;
        this.level = 1;
        this.cameraX = 0;
        this.booksCollected = 0;
        
        // Load images
        this.templeImage = new Image();
        this.templeImage.src = 'images/temple.png';
        this.bomImage = new Image();
        this.bomImage.src = 'images/bom.png';
        
        // Game physics constants
        this.gravity = 0.42;
        this.jumpPower = -13.34;
        
        // Castle/temple position
        this.castle = { x: 5700, y: 230, width: 240, height: 248 };
        
        // Player properties
        this.player = {
            x: 150,
            y: 420,
            width: 32,
            height: 48,
            velocityY: 0,
            isJumping: false,
            isDucking: false,
            isGrounded: true,
            color: '#8b4513',
            armorColor: '#c0c0c0',
            animFrame: 0,
            animTimer: 0,
            animSpeed: 12,
            isMoving: false,
            health: 3,
            maxHealth: 3,
            invulnerable: false,
            invulnerabilityTimer: 0,
            invulnerabilityDuration: 120
        };
        
        // Dog companion properties
        this.dog = {
            x: 100,
            y: 440,
            width: 24,
            height: 20,
            velocityY: 0,
            isGrounded: true,
            animFrame: 0,
            animTimer: 0,
            animSpeed: 10,
            isMoving: false,
            followDistance: 60,
            catchUpSpeed: 3.0,
            normalSpeed: 2.0,
            facingRight: true  // Dog starts facing right
        };
        
        // Death system
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.deathFreezeTime = 120;
        
        // Initialize managers
        this.audioManager = new AudioManager();
        this.effectsManager = new EffectsManager();
        this.inputHandler = new InputHandler();
        this.worldManager = new WorldManager();
        this.arrowManager = new ArrowManager();
        this.uiRenderer = new UIRenderer();
        this.characterRenderer = new CharacterRenderer();
        
        // Setup event listeners
        this.inputHandler.setupEventListeners(this.canvas, this);
        this.setupMenuEvents();
        
        // Initialize audio button appearance
        this.updateAudioButtonAppearance();
        
        // Start game loop
        this.gameLoop();
        
        // Start menu music with browser autoplay handling
        this.initializeAudio();
    }
    
    initializeAudio() {
        // Set up user interaction handler for browsers with autoplay restrictions
        const startAudioOnInteraction = () => {
            if (this.gameState === 'menu') {
                this.audioManager.playMusic('menu');
            }
        };
        
        // Add listeners for any user interaction to start music
        document.addEventListener('click', startAudioOnInteraction, { once: true });
        document.addEventListener('keydown', startAudioOnInteraction, { once: true });
        document.addEventListener('touchstart', startAudioOnInteraction, { once: true });
        document.addEventListener('mousemove', startAudioOnInteraction, { once: true });
        
        // Also add a visual indicator that audio will start on interaction
        this.showAudioPrompt();
    }
    
    showAudioPrompt() {
        // Create a subtle prompt to let users know they can interact to start audio
        const prompt = document.createElement('div');
        prompt.id = 'audioPrompt';
        prompt.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: #FFD700;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.7;
        `;
        prompt.textContent = 'Click anywhere to enable audio';
        document.body.appendChild(prompt);
        
        // Remove prompt after user interaction or timeout
        const removePrompt = () => {
            if (document.getElementById('audioPrompt')) {
                document.getElementById('audioPrompt').remove();
            }
        };
        
        document.addEventListener('click', removePrompt, { once: true });
        document.addEventListener('keydown', removePrompt, { once: true });
        document.addEventListener('touchstart', removePrompt, { once: true });
        
        // Auto-remove after 5 seconds
        setTimeout(removePrompt, 5000);
    }
    
    setupMenuEvents() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.hasArmor = false;
            this.player.color = '#8b4513';
            this.booksCollected = 0;
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.goToMainMenu();
        });
        
        document.getElementById('mainMenuBtn2').addEventListener('click', () => {
            this.goToMainMenu();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            alert('More levels coming soon! Thanks for playing!');
        });
        
        // Audio toggle button
        document.getElementById('audioToggleBtn').addEventListener('click', () => {
            this.toggleAudio();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.showScreen('game');
        this.audioManager.playMusic('adventure');
    }
    
    resetGame() {
        // Reset player
        this.player.x = 150;
        this.player.y = 420;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isDucking = false;
        this.player.isGrounded = true;
        this.player.animFrame = 0;
        this.player.animTimer = 0;
        this.player.isMoving = false;
        this.player.health = this.player.maxHealth;
        this.player.invulnerable = false;
        this.player.invulnerabilityTimer = 0;
        
        // Reset dog
        this.dog.x = 100;
        this.dog.y = 440;
        this.dog.velocityY = 0;
        this.dog.isGrounded = true;
        this.dog.animFrame = 0;
        this.dog.animTimer = 0;
        this.dog.isMoving = false;
        this.dog.facingRight = true;
        
        // Reset game state
        this.cameraX = 0;
        this.hasArmor = false;
        this.booksCollected = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.isPaused = false;
        
        // Reset managers
        this.effectsManager.reset();
        this.arrowManager.reset();
        this.worldManager.reset();
        
        // Spawn initial arrows
        this.arrowManager.spawnInitialArrows(this.player);
        
        this.gameState = 'menu';
    }
    
    toggleAudio() {
        const shouldResumeMusic = this.audioManager.toggleAudio();
        if (shouldResumeMusic && this.gameState === 'menu') {
            this.audioManager.playMusic('menu');
        } else if (shouldResumeMusic && this.gameState === 'playing') {
            this.audioManager.playMusic('adventure');
        }
        this.updateAudioButtonAppearance();
    }
    
    updateAudioButtonAppearance() {
        const audioBtn = document.getElementById('audioToggleBtn');
        
        if (!this.audioManager.audioEnabled) {
            audioBtn.classList.add('muted');
            audioBtn.title = 'Enable Audio';
        } else {
            audioBtn.classList.remove('muted');
            audioBtn.title = 'Disable Audio';
        }
    }
    
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        const screens = {
            'menu': 'menuScreen',
            'game': 'gameScreen',
            'gameOver': 'gameOverScreen',
            'levelComplete': 'levelCompleteScreen'
        };
        
        document.getElementById(screens[screenName]).classList.remove('hidden');
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.isPaused) return;
        
        // Handle input
        this.inputHandler.handleInput(
            this.player, 
            this.cameraX, 
            this.worldManager.worldWidth, 
            this.jumpPower, 
            this.audioManager
        );
        
        // Update physics
        this.updatePhysics();
        
        // Update managers
        this.arrowManager.update(
            this.player, 
            this.castle, 
            this.hasArmor, 
            this.cameraX, 
            this.canvas.width, 
            this.gameState
        );
        
        this.effectsManager.updateArmorActivation();
        this.uiRenderer.update();
        this.characterRenderer.update();
        
        if (this.gameState === 'celebrating') {
            if (this.effectsManager.updateCelebration()) {
                this.gameState = 'levelComplete';
                this.showScreen('levelComplete');
            }
        }
        
        // Check collisions
        this.checkCollisions();
    }
    
    updatePhysics() {
        // Handle death freeze
        if (this.gameState === 'dying') {
            this.deathTimer++;
            if (this.deathTimer >= this.deathFreezeTime) {
                this.gameOver(this.deathMessage);
                this.isDying = false;
            }
            return;
        }
        
        if (this.gameState !== 'playing') return;
        
        // Update invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTimer++;
            if (this.player.invulnerabilityTimer >= this.player.invulnerabilityDuration) {
                this.player.invulnerable = false;
                this.player.invulnerabilityTimer = 0;
            }
        }
        
        // Apply gravity to player
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Check for pit death
        if (this.player.y > this.canvas.height + 50) {
            this.gameOver('You fell into a pit! Stay on the platforms to survive.');
            return;
        }
        
        // Platform collisions for player
        this.worldManager.checkPlatformCollisions(this.player);
        
        // Update camera
        this.cameraX = Math.max(0, this.player.x - 300);
        
        // Update player animation
        this.updatePlayerAnimation();
        
        // Update dog
        this.updateDog();
    }
    
    updatePlayerAnimation() {
        if (this.player.isMoving && this.player.isGrounded) {
            this.player.animTimer++;
            if (this.player.animTimer >= this.player.animSpeed) {
                this.player.animFrame = (this.player.animFrame + 1) % 4;
                this.player.animTimer = 0;
            }
        } else {
            this.player.animFrame = 0;
            this.player.animTimer = 0;
        }
    }
    
    updateDog() {
        if (this.gameState !== 'playing') return;
        
        // Calculate target position
        const targetX = this.player.x - this.dog.followDistance;
        const distanceToTarget = Math.abs(this.dog.x - targetX);
        
        // Dog movement logic
        if (distanceToTarget > 10) {
            this.dog.isMoving = true;
            
            let speed = this.dog.normalSpeed;
            if (distanceToTarget > 120) {
                speed = this.dog.catchUpSpeed;
            }
            
            const moveDirection = this.dog.x < targetX ? 1 : -1;
            const shouldJump = this.shouldDogJump(moveDirection);
            
            if (shouldJump && this.dog.isGrounded) {
                this.dog.velocityY = this.jumpPower * 0.8;
                this.dog.isGrounded = false;
            }
            
            if (this.dog.x < targetX) {
                this.dog.x += speed;
                this.dog.facingRight = true; // Moving right
            } else if (this.dog.x > targetX) {
                this.dog.x -= speed;
                this.dog.facingRight = false; // Moving left
            }
        } else {
            this.dog.isMoving = false;
        }
        
        // Apply gravity to dog
        this.dog.velocityY += this.gravity;
        this.dog.y += this.dog.velocityY;
        
        // Platform collisions for dog
        this.worldManager.checkPlatformCollisions(this.dog);
        
        // Update dog animation
        this.updateDogAnimation();
    }
    
    shouldDogJump(moveDirection) {
        if (!this.dog.isGrounded) return false;
        
        const lookAheadDistance = 40;
        const checkX = this.dog.x + (moveDirection * lookAheadDistance);
        const checkY = this.dog.y + this.dog.height + 10;
        
        let groundAhead = false;
        
        // Check for ground ahead
        for (let platform of this.worldManager.platforms) {
            if (platform.y === this.worldManager.groundY && 
                checkX + this.dog.width > platform.x && 
                checkX < platform.x + platform.width &&
                checkY >= platform.y && checkY <= platform.y + platform.height) {
                groundAhead = true;
                break;
            }
        }
        
        if (!groundAhead) {
            for (let platform of this.worldManager.platforms) {
                if (platform.y < this.worldManager.groundY && 
                    checkX + this.dog.width > platform.x && 
                    checkX < platform.x + platform.width &&
                    checkY >= platform.y && checkY <= platform.y + platform.height) {
                    groundAhead = true;
                    break;
                }
            }
        }
        
        return !groundAhead && this.dog.isMoving;
    }
    
    updateDogAnimation() {
        if (this.dog.isMoving && this.dog.isGrounded) {
            this.dog.animTimer++;
            if (this.dog.animTimer >= this.dog.animSpeed) {
                this.dog.animFrame = (this.dog.animFrame + 1) % 4;
                this.dog.animTimer = 0;
            }
        } else {
            this.dog.animFrame = 0;
            this.dog.animTimer = 0;
        }
    }
    
    checkCollisions() {
        if (this.gameState !== 'playing' && this.gameState !== 'dying') return;
        
        // Arrow collisions
        const hitArrows = this.arrowManager.checkCollisions(this.player, this.hasArmor);
        if (hitArrows.length > 0) {
            this.takeDamage();
        }
        
        // Scripture book collisions
        this.worldManager.scriptureBooks.forEach(book => {
            if (!book.collected && this.checkCollision(this.player, book)) {
                book.collected = true;
                this.booksCollected++;
                
                if (this.booksCollected >= 3 && !this.hasArmor) {
                    this.activateArmor();
                }
            }
        });
        
        // Castle collision
        if (this.checkCollision(this.player, this.castle)) {
            this.levelComplete();
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    takeDamage() {
        if (this.player.invulnerable) return;
        
        this.player.health--;
        this.player.invulnerable = true;
        this.player.invulnerabilityTimer = 0;
        
        if (this.player.health <= 0) {
            this.startDeath('You have been struck down! Seek the armor of God for protection.');
        }
    }
    
    startDeath(message) {
        if (!this.isDying) {
            this.isDying = true;
            this.deathTimer = 0;
            this.deathMessage = message;
            this.gameState = 'dying';
        }
    }
    
    activateArmor() {
        this.hasArmor = true;
        this.player.color = this.player.armorColor;
        this.effectsManager.activateArmor(this.player, this.uiRenderer);
        
        // Play powerup sound effect and change music to armormarch.mp3
        this.audioManager.playSoundEffect('powerup');
        this.audioManager.playMusic('armormarch');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.audioManager.pauseCurrentMusic();
        } else {
            this.audioManager.resumeCurrentMusic();
        }
    }
    
    restartLevel() {
        // Similar to resetGame but stay in playing mode
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.audioManager.playMusic('adventure');
        this.arrowManager.spawnInitialArrows(this.player);
    }
    
    goToMainMenu() {
        this.resetGame();
        this.audioManager.playMusic('menu');
        this.showScreen('menu');
    }
    
    gameOver(message) {
        this.gameState = 'gameOver';
        document.getElementById('gameOverMessage').textContent = message;
        this.showScreen('gameOver');
        this.audioManager.playMusic('gameOver');
        setTimeout(() => {
            this.audioManager.pauseCurrentMusic();
        }, 4000);
    }
    
    levelComplete() {
        this.gameState = 'celebrating';
        this.effectsManager.initializeFireworks(this.castle);
        this.audioManager.playMusic('winner');
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing' && this.gameState !== 'dying' && this.gameState !== 'celebrating') {
            return;
        }
        
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Render world
        this.worldManager.renderBackground(this.ctx, this.cameraX, this.canvas.width, this.canvas.height);
        this.worldManager.renderClouds(this.ctx);
        this.worldManager.renderPlatforms(this.ctx);
        this.worldManager.renderTemple(this.ctx, this.templeImage, this.castle);
        
        // Render game objects
        this.arrowManager.render(this.ctx);
        this.worldManager.renderScriptureBooks(this.ctx, this.bomImage);
        
        // Render characters
        this.characterRenderer.renderPlayer(this.ctx, this.player, this.hasArmor);
        this.characterRenderer.renderDog(this.ctx, this.dog);
        
        // Render effects
        this.effectsManager.renderArmorExplosion(this.ctx);
        
        if (this.gameState === 'celebrating') {
            this.effectsManager.renderFireworks(this.ctx, this.cameraX);
        }
        
        this.ctx.restore();
        
        // Render UI (not translated by camera)
        this.uiRenderer.renderUI(
            this.ctx, 
            this.player, 
            this.booksCollected, 
            this.audioManager, 
            this.isPaused, 
            this.gameState,
            this.inputHandler.hoveredButton
        );
    }
    

}

// Start the game when the page loads
window.addEventListener('load', () => {
    new ArmorOfGodGame();
});