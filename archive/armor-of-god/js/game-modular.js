class ArmorOfGodGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameOver, levelComplete, waitingToEnterTemple, enteringTemple, celebrating
        this.isPaused = false;
        
        // Temple entrance sequence properties
        this.templeEntranceTimer = 0;
        this.templeEntranceSpeed = 2;
        this.templeCenterX = 0; // Will be calculated based on castle position
        this.hasArmor = false;
        this.armorTimer = 0;
        this.armorDuration = 30 * 60; // 30 seconds at 60fps
        this.level = 1;
        this.cameraX = 0;
        this.booksCollected = 0;
        this.selectedPetType = 'dog'; // Default to dog
        
        // Debug variables
        this.lastPlayerPos = null;
        this.debugElement = null;
        this.createDebugDisplay();
        
        // Load images
        this.templeImage = new Image();
        this.templeImage.src = 'images/temple.png';
        this.bomImage = new Image();
        this.bomImage.src = 'images/bom.png';
        
        // Game physics constants
        this.gravity = 0.42;
        this.jumpPower = -13.34;
        this.baseSpeed = 4;
        this.baseJumpPower = -13.34;
        
        // Game speed control
        this.gameSpeed = this.loadGameSpeedSetting();
        this.lastFrameTime = 0;
        this.targetFrameRate = 60;
        
        // Castle/temple position (towards end of temple platform) - will be set based on level
        this.setCastlePosition();
        
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
            invulnerabilityDuration: 120,
            // Petting animation properties
            isPetting: false,
            pettingTimer: 0,
            pettingDuration: 60, // 1 second petting animation
            handOffset: 0,
            facingRight: true, // Player facing direction
            blockedLeft: false,
            blockedRight: false
        };
        
        // Pet companion properties (can be dog or cat)
        this.pet = {
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
            facingRight: true,  // Pet starts facing right
            type: 'dog', // Will be updated based on selection
            // Petting properties
            isBeingPetted: false,
            pettingTimer: 0,
            pettingDuration: 120, // 2 seconds at 60fps
            tailWagTimer: 0,
            tailWagSpeed: 8,
            jumpCount: 0,
            maxJumps: 2,
            jumpTimer: 0,
            jumpCooldown: 30 // 0.5 seconds between jumps
        };
        
        // Death system
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.deathFreezeTime = 60;
        
        // Initialize managers
        this.audioManager = new AudioManager();
        this.effectsManager = new EffectsManager();
        this.inputHandler = new InputHandler();
        this.worldManager = new WorldManager();
        this.arrowManager = new ArrowManager(this.audioManager);
        this.backgroundManager = new BackgroundManager();
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
            this.audioManager.playSoundEffect('startGameClick');
            this.hasArmor = false;
            this.player.color = '#8b4513';
            this.booksCollected = 0;
            this.pet.type = this.selectedPetType; // Set pet type based on selection
            this.startGame();
        });
        
        // Pet selection buttons
        document.getElementById('selectDog').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.selectPet('dog');
            this.audioManager.playSound('bark1');
        });
        
        document.getElementById('selectCat').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.selectPet('cat');
            this.audioManager.playSound('meow');
        });
        
        // Add hover sound effects for main menu buttons
        document.getElementById('startBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('selectDog').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('selectCat').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('instructionsLink').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Instructions modal
        document.getElementById('instructionsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalOpen');
            this.showInstructionsModal();
        });
        
        document.getElementById('closeModal').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalClose');
            this.hideInstructionsModal();
        });
        
        // Close modal when clicking outside content
        document.getElementById('instructionsModal').addEventListener('click', (e) => {
            if (e.target.id === 'instructionsModal') {
                this.hideInstructionsModal();
            }
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.resetGame();
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.goToMainMenu();
        });

        document.getElementById('mainMenuBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });        document.getElementById('mainMenuBtn2').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.goToMainMenu();
        });
        
        document.getElementById('mainMenuBtn2').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            if (this.level === 1) {
                this.startNextLevel();
            } else {
                alert('More levels coming soon! Thanks for playing!');
            }
        });
        
        document.getElementById('nextLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Audio toggle button
        document.getElementById('audioToggleBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.toggleAudio();
        });
        
        document.getElementById('audioToggleBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Speed control button
        document.getElementById('speedToggleBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.toggleSpeedDropdown();
        });
        
        // Level selector button (for testing)
        document.getElementById('levelSelectorBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.cycleLevelSelector();
        });
        
        document.getElementById('levelSelectorBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('speedToggleBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Speed slider
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.setGameSpeed(parseFloat(e.target.value));
            this.audioManager.playSound('buttonClick2');
        });
        
        // Close speed dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#speedToggleBtn') && !e.target.closest('#speedDropdown')) {
                this.hideSpeedDropdown();
            }
        });
        
        // Update UI to reflect saved settings
        this.updateUIFromSavedSettings();
        
        // Initialize pet control text
        this.updatePetControlText();
    }
    
    selectPet(petType) {
        this.selectedPetType = petType;
        
        // Update UI to show selection
        document.querySelectorAll('.pet-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById(`select${petType.charAt(0).toUpperCase() + petType.slice(1)}`).classList.add('selected');
        
        // Update controls text to show selected pet type
        const petControlText = document.getElementById('petControlText');
        if (petControlText) {
            petControlText.textContent = `D Pet ${petType.charAt(0).toUpperCase() + petType.slice(1)}`;
        }
    }
    
    startGame() {
        // Reset game to initialize world with selected level
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.updateLevelIndicator();
        this.audioManager.playMusic('adventure');
        // Spawn initial arrows after world is set up
        this.arrowManager.spawnInitialArrows(this.player);
    }
    
    resetGame() {
        // Cancel any pending game over sequence
        this.audioManager.cancelGameOverSequence();
        
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
        this.player.isPetting = false;
        this.player.pettingTimer = 0;
        this.player.handOffset = 0;
        this.player.facingRight = true;
        this.player.alpha = 1; // Reset visibility for level restart
        
        // Reset pet
        this.pet.x = 100;
        this.pet.y = 440;
        this.pet.velocityY = 0;
        this.pet.isGrounded = true;
        this.pet.animFrame = 0;
        this.pet.animTimer = 0;
        this.pet.isMoving = false;
        this.pet.facingRight = true;
        this.pet.isBeingPetted = false;
        this.pet.pettingTimer = 0;
        this.pet.tailWagTimer = 0;
        this.pet.jumpCount = 0;
        this.pet.jumpTimer = 0;
        this.pet.alpha = 1; // Reset visibility for level restart
        
        // Reset game state
        this.cameraX = 0;
        this.hasArmor = false;
        this.armorTimer = 0;
        this.booksCollected = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.isPaused = false;
        
        // Reset castle position for current level
        this.setCastlePosition();
        
        // Reset managers
        this.effectsManager.reset();
        this.arrowManager.reset();
        this.worldManager.setLevel(this.level);
        this.backgroundManager.setLevel(this.level);
        
        // Spawn initial arrows
        this.arrowManager.spawnInitialArrows(this.player);
        
        this.gameState = 'menu';
    }
    
    setCastlePosition() {
        if (this.level === 1) {
            // Castle level - original position
            this.castle = { x: 6400, y: 230, width: 240, height: 248 };
        } else if (this.level === 2) {
            // Jungle level - temple at the end of the jungle clearing
            this.castle = { x: 17200, y: 230, width: 240, height: 248 };
        }
    }
    
    cycleLevelSelector() {
        // Cycle between levels 1 and 2 for testing
        this.level = this.level === 1 ? 2 : 1;
        this.updateLevelSelector();
        this.updateLevelIndicator();
        
        // If we're in menu, just update the selector
        // If we're in game, restart with new level
        if (this.gameState === 'playing') {
            this.resetGame();
            this.gameState = 'playing';
            this.showScreen('game');
            this.audioManager.playMusic('adventure');
            this.arrowManager.spawnInitialArrows(this.player);
        }
    }
    
    updateLevelSelector() {
        const levelBtn = document.getElementById('levelSelectorBtn');
        const levelText = levelBtn.querySelector('.level-text');
        levelText.textContent = `L${this.level}`;
    }
    
    updateLevelIndicator() {
        const levelInfo = document.getElementById('levelInfo');
        levelInfo.textContent = `Level ${this.level}`;
    }
    
    toggleAudio() {
        const shouldResumeMusic = this.audioManager.toggleAudio();
        if (shouldResumeMusic) {
            // Resume the correct music based on current game state and armor status
            if (this.gameState === 'menu') {
                this.audioManager.playMusic('menu');
            } else if (this.gameState === 'playing') {
                // Check if player has armor for special armor march music
                if (this.hasArmor) {
                    this.audioManager.playMusic('armormarch');
                } else {
                    this.audioManager.playMusic('adventure');
                }
            } else if (this.gameState === 'levelComplete' || this.gameState === 'celebrating') {
                this.audioManager.playMusic('winner');
            } else if (this.gameState === 'gameOver') {
                this.audioManager.playMusic('gameOver');
            }
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
    
    toggleSpeedDropdown() {
        const dropdown = document.getElementById('speedDropdown');
        dropdown.classList.toggle('hidden');
    }
    
    hideSpeedDropdown() {
        const dropdown = document.getElementById('speedDropdown');
        dropdown.classList.add('hidden');
    }
    
    setGameSpeed(speed) {
        this.gameSpeed = speed;
        this.saveGameSpeedSetting(); // Save to localStorage
        document.querySelector('.speed-value').textContent = speed.toFixed(2) + 'x';
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
    
    // Armor enhancement methods
    getCurrentSpeed() {
        return this.hasArmor ? this.baseSpeed * 1.5 : this.baseSpeed;
    }
    
    getCurrentJumpPower() {
        return this.hasArmor ? this.baseJumpPower * 1.1 : this.baseJumpPower;
    }
    
    gameLoop(currentTime = 0) {
        // Calculate frame timing based on game speed
        const speed = this.gameSpeed * 1.75;
        const targetInterval = 1000 / (this.targetFrameRate * speed);
        
        if (currentTime - this.lastFrameTime >= targetInterval) {
            // Run multiple updates for speeds > 1.0 to maintain smooth gameplay
            const updateCount = Math.max(1, Math.floor(speed));
            for (let i = 0; i < updateCount; i++) {
                this.update();
            }
            this.render();
            this.updateDebugDisplay();
            this.lastFrameTime = currentTime;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
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
        
        // Handle waiting to enter temple (letting player/pet fall to ground)
        if (this.gameState === 'waitingToEnterTemple') {
            this.updateWaitingToEnterTemple();
        }
        
        // Handle temple entrance sequence
        if (this.gameState === 'enteringTemple') {
            this.updateTempleEntrance();
        }
        
        this.effectsManager.updateArmorActivation();
        this.effectsManager.updateSparkleTrails();
        
        // Update background elements
        this.backgroundManager.updateElements(this.cameraX);
        
        // Add sparkle trails when armor is active (but not during temple entrance)
        if (this.hasArmor && this.gameState !== 'enteringTemple') {
            this.effectsManager.addSparkleTrail(this.player.x, this.player.y, this.hasArmor);
            this.effectsManager.addSparkleTrail(this.pet.x, this.pet.y, this.hasArmor);
            
            // Extra sparkles when moving for trail effect
            if (this.player.isMoving) {
                this.effectsManager.addSparkleTrail(this.player.x, this.player.y, this.hasArmor);
            }
            if (this.pet.isMoving) {
                this.effectsManager.addSparkleTrail(this.pet.x, this.pet.y, this.hasArmor);
            }
        }
        
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
        
        if (this.gameState !== 'playing' && this.gameState !== 'waitingToEnterTemple') return;
        
        // Update invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTimer++;
            if (this.player.invulnerabilityTimer >= this.player.invulnerabilityDuration) {
                this.player.invulnerable = false;
                this.player.invulnerabilityTimer = 0;
            }
        }
        
        // Update armor timer
        if (this.hasArmor && this.armorTimer > 0) {
            this.armorTimer--;
            if (this.armorTimer <= 0) {
                this.deactivateArmor();
            }
        }
        
        // Reset blocking properties each frame
        this.player.blockedLeft = false;
        this.player.blockedRight = false;
        
        // Set player as not grounded when falling (before applying gravity)
        if (this.player.velocityY > 0) {
            this.player.isGrounded = false;
            this.player.isJumping = false;
        }
        
        // Apply gravity to player
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Check for pit death
        if (this.player.y > this.canvas.height + 50) {
            this.startDeath('You fell into a pit! Stay on the platforms to survive.');
            return;
        }
        
        // Platform collisions for player (this will set isGrounded=true if landing on platform)
        this.worldManager.checkPlatformCollisions(this.player);
        
        // Check if player is falling off platform edges and restrict movement
        // But only if they're not already deep in a pit (to avoid interfering with pit death)
        if (!this.player.isGrounded && this.player.velocityY > 0 && this.player.y < this.canvas.height) {
            // Player is falling but not in death zone - check for wall blocking
            this.checkPlatformEdgeBlocking();
        }
        
        // Update camera
        this.cameraX = Math.max(0, this.player.x - 300);
        
        // Update player animation
        this.updatePlayerAnimation();
        
        // Update pet
        this.updatePet();
    }
    
    checkPlatformEdgeBlocking() {
        // Only check for wall blocking when player is falling and might be against a pit wall
        const checkDistance = 2; // Very small distance to detect wall contact
        
        // Check if player is directly against a platform wall
        for (let platform of this.worldManager.platforms) {
            // Check if player is vertically aligned with the platform (at wall height)
            if (this.player.y < platform.y + platform.height && 
                this.player.y + this.player.height > platform.y) {
                
                // Check left wall - player is just to the left of platform
                if (this.player.x + this.player.width >= platform.x - checkDistance && 
                    this.player.x + this.player.width <= platform.x + checkDistance) {
                    this.player.blockedRight = true; // Block movement toward the wall
                }
                
                // Check right wall - player is just to the right of platform  
                if (this.player.x >= platform.x + platform.width - checkDistance && 
                    this.player.x <= platform.x + platform.width + checkDistance) {
                    this.player.blockedLeft = true; // Block movement toward the wall
                }
            }
        }
    }
    
    updatePlayerAnimation() {
        // Handle petting animation
        if (this.player.isPetting) {
            this.player.pettingTimer++;
            
            // Animate hand reaching out and petting motion
            const pettingPhase = this.player.pettingTimer / this.player.pettingDuration;
            if (pettingPhase < 0.3) {
                // Reach out phase
                this.player.handOffset = Math.sin(pettingPhase * Math.PI / 0.3) * 15;
            } else if (pettingPhase < 0.9) {
                // Petting phase - gentle up and down motion
                this.player.handOffset = 15 + Math.sin((pettingPhase - 0.3) * Math.PI * 6) * 3;
            } else {
                // Return hand phase
                this.player.handOffset = 15 * (1 - (pettingPhase - 0.9) / 0.1);
            }
            
            // End petting animation
            if (this.player.pettingTimer >= this.player.pettingDuration) {
                this.player.isPetting = false;
                this.player.pettingTimer = 0;
                this.player.handOffset = 0;
            }
            
            // Keep player still during petting
            this.player.animFrame = 0;
            this.player.animTimer = 0;
        } else {
            // Normal walking animation
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
    }
    
    updatePet() {
        if (this.gameState !== 'playing' && this.gameState !== 'waitingToEnterTemple') return;
        
        const distanceToPlayer = Math.abs(this.player.x - this.pet.x);
        const playerMovingTowardsPet = this.player.isMoving && 
            ((this.player.facingRight && this.pet.x > this.player.x) || 
             (!this.player.facingRight && this.pet.x < this.player.x));
        const playerMovingAwayFromPet = this.player.isMoving && 
            ((this.player.facingRight && this.pet.x < this.player.x) || 
             (!this.player.facingRight && this.pet.x > this.player.x));
        const playerStill = !this.player.isMoving && this.player.isGrounded;
        const playerTowardsPet = (this.player.facingRight && this.pet.x > this.player.x) || 
                                (!this.player.facingRight && this.pet.x < this.player.x);
        
        let shouldMove = false;
        let targetX, targetDistance;
        
        if (playerStill && playerTowardsPet && distanceToPlayer < 120 && distanceToPlayer > 25) {
            // Player is facing pet and standing still - get closer for petting
            targetX = this.player.facingRight ? this.player.x + 25 : this.player.x - 25;
            targetDistance = Math.abs(this.pet.x - targetX);
            shouldMove = true;
        } else if (playerMovingAwayFromPet) {
            // Only follow when player is moving away - never move when they're approaching
            targetX = this.player.x - this.pet.followDistance;
            targetDistance = Math.abs(this.pet.x - targetX);
            shouldMove = targetDistance > 10; // Only move if significantly far from target
        } else if (!this.player.isMoving && distanceToPlayer > 150) {
            // Player stopped but is very far away - catch up
            targetX = this.player.x - this.pet.followDistance;
            targetDistance = Math.abs(this.pet.x - targetX);
            shouldMove = true;
        }
        
        // Pet movement logic
        if (shouldMove && targetDistance > 10) {
            this.pet.isMoving = true;
            
            let speed = this.pet.normalSpeed;
            if (targetDistance > 120) {
                speed = this.pet.catchUpSpeed;
            }
            
            // Armor enhances pet speed too
            if (this.hasArmor) {
                speed *= 1.5;
            }
            
            const moveDirection = this.pet.x < targetX ? 1 : -1;
            const shouldJump = this.shouldPetJump(moveDirection);
            
            if (shouldJump && this.pet.isGrounded) {
                const jumpPower = this.hasArmor ? this.getCurrentJumpPower() * 0.8 : this.jumpPower * 0.8;
                this.pet.velocityY = jumpPower;
                this.pet.isGrounded = false;
            }
            
            if (this.pet.x < targetX) {
                this.pet.x += speed;
                this.pet.facingRight = true; // Moving right
            } else if (this.pet.x > targetX) {
                this.pet.x -= speed;
                this.pet.facingRight = false; // Moving left
            }
        } else {
            this.pet.isMoving = false;
        }
        
        // Apply gravity to pet
        this.pet.velocityY += this.gravity;
        this.pet.y += this.pet.velocityY;
        
        // Platform collisions for pet
        this.worldManager.checkPlatformCollisions(this.pet);
        
        // Pet safety check - respawn if fallen off the world
        if (this.pet.y > this.canvas.height + 50) {
            // Respawn pet near player on solid ground
            this.pet.x = this.player.x + (this.player.facingRight ? -60 : 60);
            this.pet.y = this.player.y - 10;
            this.pet.velocityY = 0;
            this.pet.isGrounded = false; // Let it fall to find ground naturally
        }
        
        // Update pet animation
        this.updatePetAnimation();
    }
    
    shouldPetJump(moveDirection) {
        if (!this.pet.isGrounded) return false;
        
        const lookAheadDistance = 40;
        const checkX = this.pet.x + (moveDirection * lookAheadDistance);
        const checkY = this.pet.y + this.pet.height + 10;
        
        let groundAhead = false;
        
        // Check for ground ahead
        for (let platform of this.worldManager.platforms) {
            if (platform.y === this.worldManager.groundY && 
                checkX + this.pet.width > platform.x && 
                checkX < platform.x + platform.width &&
                checkY >= platform.y && checkY <= platform.y + platform.height) {
                groundAhead = true;
                break;
            }
        }
        
        if (!groundAhead) {
            for (let platform of this.worldManager.platforms) {
                if (platform.y < this.worldManager.groundY && 
                    checkX + this.pet.width > platform.x && 
                    checkX < platform.x + platform.width &&
                    checkY >= platform.y && checkY <= platform.y + platform.height) {
                    groundAhead = true;
                    break;
                }
            }
        }
        
        return !groundAhead && this.pet.isMoving;
    }
    
    updatePetAnimation() {
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
    
    tryPetAnimal() {
        if (this.pet.isBeingPetted) return; // Already being petted
        
        // Check if player is close enough to the pet
        const distance = Math.abs(this.player.x - this.pet.x);
        const petDistance = 60; // Must be within 60 pixels
        
        if (distance <= petDistance) {
            // Start petting for both pet and player
            this.pet.isBeingPetted = true;
            this.pet.pettingTimer = 0;
            this.pet.tailWagTimer = 0;
            this.pet.jumpCount = 0;
            
            // Start player petting animation
            this.characterRenderer.startPettingAnimation();
            this.pet.jumpTimer = 0;
            
            // Keep player in their current position (no automatic repositioning)
            
            // Start player petting animation
            this.player.isPetting = true;
            this.player.pettingTimer = 0;
            this.player.handOffset = 0;
            
            // Play appropriate sound based on pet type
            if (this.pet.type === 'cat') {
                this.audioManager.playSound('meow');
            } else {
                this.audioManager.playSound('bark1');
            }
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
                
                // Play collection sound
                this.audioManager.playSound('collect2');
                
                if (this.booksCollected < 3) {
                    // Still collecting initial scriptures
                    this.booksCollected++;
                    if (this.booksCollected >= 3) {
                        this.activateArmor();
                    }
                } else if (this.hasArmor) {
                    // Already have armor - reset timer instead of incrementing count
                    this.armorTimer = this.armorDuration;
                    this.uiRenderer.showMessage('Armor Timer Reset!', 120, '#FFD700', 16, 400);
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

        // Play appropriate hit sound based on armor status
        if (!this.hasArmor) {
            this.audioManager.playRandomThudSound();
        }

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
        this.armorTimer = this.armorDuration; // Start 30-second countdown
        this.player.color = this.player.armorColor;
        this.effectsManager.activateArmor(this.player, this.uiRenderer);
        
        // Play powerup sound effect and change music to armormarch.mp3
        this.audioManager.playSoundEffect('powerup');
        this.audioManager.playMusic('armormarch');
    }
    
    deactivateArmor() {
        this.hasArmor = false;
        this.armorTimer = 0;
        this.player.color = '#8b4513'; // Reset to normal color
        
        // Reset scripture collection - player can collect them again
        this.booksCollected = 0;
        this.worldManager.reset(); // Respawn all scripture books
        
        // Switch back to adventure music
        this.audioManager.playMusic('adventure');
        
        // Show message to player
        this.uiRenderer.showMessage('Collect scriptures for new armor.', 240, '#FFA500', 18, 700);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.audioManager.playSoundEffect('pause');
            this.audioManager.pauseCurrentMusic();
        } else {
            this.audioManager.playSoundEffect('unpause');
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
    
    startNextLevel() {
        // Advance to the next level
        this.level++;
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.updateLevelIndicator();
        this.updateLevelSelector();
        this.audioManager.playMusic('adventure');
        this.arrowManager.spawnInitialArrows(this.player);
    }

    goToMainMenu() {
        this.level = 1; // Reset to level 1 when going to main menu
        this.resetGame();
        this.updateLevelSelector();
        this.audioManager.playMusic('menu');
        this.showScreen('menu');
    }
    
    gameOver(message) {
        this.gameState = 'gameOver';
        document.getElementById('gameOverMessage').textContent = message;
        this.showScreen('gameOver');
        
        // Play the new game over sequence (game over sound + song after delay)
        this.audioManager.playGameOverSequence();
    }
    
    levelComplete() {
        // Check if player or pet are in the air - if so, let them fall first
        const playerGrounded = this.player.isGrounded || this.player.y >= this.worldManager.groundY - this.player.height;
        const petGrounded = this.pet.isGrounded || this.pet.y >= this.worldManager.groundY - this.pet.height;
        
        if (!playerGrounded || !petGrounded) {
            // Set a flag to indicate we're waiting for landing
            this.gameState = 'waitingToEnterTemple';
            
            // Stop horizontal movement but allow falling
            this.player.velocityX = 0;
            this.pet.velocityX = 0;
            
            // Make sure they face the temple while falling
            this.player.facingRight = true;
            this.pet.facingRight = true;
            
            return; // Don't start temple sequence yet
        }
        
        // Both are grounded, start temple entrance
        this.gameState = 'enteringTemple';
        this.templeEntranceTimer = 0;
        this.templeCenterX = this.castle.x + this.castle.width / 2;
        
        // If pet is far away (more than 300 pixels), teleport it next to player
        const distanceFromPlayer = Math.abs(this.pet.x - this.player.x);
        if (distanceFromPlayer > 300) {
            this.pet.x = this.player.x - 50; // Place pet slightly behind player
            this.pet.y = this.worldManager.groundY - this.pet.height; // Place on ground
            this.pet.isGrounded = true;
            this.pet.velocityY = 0;
        }
        
        // Initialize fade states
        this.player.alpha = 1;
        this.pet.alpha = 1;
        this.waitingForPet = true;
        this.movingTogether = false;
        
        // Make both face the temple
        this.player.facingRight = true;
        this.pet.facingRight = true;
        this.pet.isMoving = true;
        this.player.isMoving = false; // Player waits initially
    }
    
    updateWaitingToEnterTemple() {
        // Check if both player and pet have landed
        const playerGrounded = this.player.isGrounded || this.player.y >= this.worldManager.groundY - this.player.height;
        const petGrounded = this.pet.isGrounded || this.pet.y >= this.worldManager.groundY - this.pet.height;
        
        // Ensure they face the temple while falling
        this.player.facingRight = true;
        this.pet.facingRight = true;
        
        // Stop horizontal movement
        this.player.velocityX = 0;
        this.pet.velocityX = 0;
        
        // If both have landed, start the temple entrance sequence
        if (playerGrounded && petGrounded) {
            // Make sure they're properly grounded
            if (this.player.y > this.worldManager.groundY - this.player.height) {
                this.player.y = this.worldManager.groundY - this.player.height;
                this.player.isGrounded = true;
                this.player.velocityY = 0;
            }
            if (this.pet.y > this.worldManager.groundY - this.pet.height) {
                this.pet.y = this.worldManager.groundY - this.pet.height;
                this.pet.isGrounded = true;
                this.pet.velocityY = 0;
            }
            
            // Now start the actual temple entrance
            this.levelComplete();
        }
    }
    
    updateTempleEntrance() {
        this.templeEntranceTimer++;
        
        const targetX = this.templeCenterX - this.player.width / 2;
        
        if (this.waitingForPet) {
            // Pet catches up to player
            if (this.pet.x < this.player.x - 20) {
                this.pet.x += this.templeEntranceSpeed;
            } else {
                // Pet caught up - now move together
                this.waitingForPet = false;
                this.movingTogether = true;
                this.player.isMoving = true;
                this.pet.isMoving = true;
            }
        } else if (this.movingTogether) {
            // Both move toward temple center together
            if (this.player.x < targetX && this.pet.x < targetX - 30) {
                this.player.x += this.templeEntranceSpeed;
                this.pet.x += this.templeEntranceSpeed;
            } else {
                // Both reached the temple - start fading together
                this.movingTogether = false;
                this.templeEntranceTimer = 0; // Reset timer for fade sequence
            }
        } else {
            // Fade both together
            const fadeFrames = 30;
            const fadeProgress = Math.min(this.templeEntranceTimer / fadeFrames, 1);
            
            this.player.alpha = 1 - fadeProgress;
            this.pet.alpha = 1 - fadeProgress;
            
            // Once fully faded, start celebration
            if (fadeProgress >= 1) {
                this.startCelebration();
            }
        }
    }
    
    startCelebration() {
        this.gameState = 'celebrating';
        this.effectsManager.initializeFireworks(this.castle);
        this.audioManager.playMusic('winner');
        
        // Reset alpha values
        this.player.alpha = 1;
        this.pet.alpha = 1;
    }
    
    startCelebration() {
        this.gameState = 'celebrating';
        this.effectsManager.initializeFireworks(this.castle);
        this.audioManager.playMusic('winner');
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing' && this.gameState !== 'dying' && this.gameState !== 'celebrating' && this.gameState !== 'enteringTemple') {
            return;
        }
        
        // Render parallax background (not translated by camera)
        this.backgroundManager.render(this.ctx, this.cameraX);
        
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Render world platforms and objects
        this.worldManager.renderPlatforms(this.ctx);
        this.worldManager.renderTemple(this.ctx, this.templeImage, this.castle);
        
        // Render game objects
        this.arrowManager.render(this.ctx);
        this.worldManager.renderScriptureBooks(this.ctx, this.bomImage);
        
        // Render characters
        this.characterRenderer.renderPlayer(this.ctx, this.player, this.hasArmor, this.gameState, this.isPaused);
        this.characterRenderer.renderPet(this.ctx, this.pet, this.isPaused);
        
        // Render effects
        this.effectsManager.renderArmorExplosion(this.ctx);
        
        if (this.gameState === 'celebrating') {
            this.effectsManager.renderFireworks(this.ctx, this.cameraX);
        }
        
        this.ctx.restore();
        
        // Show petting prompt if close enough to pet
        if (this.gameState === 'playing' && !this.isPaused) {
            const distance = Math.abs(this.player.x - this.pet.x);
            const petDistance = 60;
            
            if (distance <= petDistance && !this.pet.isBeingPetted) {
                this.ctx.save();
                this.ctx.translate(-this.cameraX, 0); // Translate back for world coordinates
                
                // Show "Press D to pet!" above the pet
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(this.pet.x - 25, this.pet.y - 25, 80, 20);
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Press D to pet!', this.pet.x + 15, this.pet.y - 10);
                
                this.ctx.restore();
            }
        }

        // Render UI (not translated by camera)
        this.uiRenderer.renderUI(
            this.ctx, 
            this.player, 
            this.booksCollected, 
            this.audioManager, 
            this.isPaused, 
            this.gameState,
            this.inputHandler.hoveredButton,
            this.hasArmor,
            this.armorTimer,
            this.armorDuration
        );
        
        // Render sparkles on top of everything (with camera translation)
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        this.effectsManager.renderSparkleTrails(this.ctx, 0); // Pass 0 since we already translated
        this.ctx.restore();
    }
    
    updateUIFromSavedSettings() {
        // Update audio button appearance based on saved setting
        this.updateAudioButtonAppearance();
        
        // Update speed controls based on saved setting
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.querySelector('.speed-value');
        
        if (speedSlider && speedValue) {
            speedSlider.value = this.gameSpeed;
            speedValue.textContent = this.gameSpeed.toFixed(2) + 'x';
        }
    }
    
    updatePetControlText() {
        const petControlText = document.getElementById('petControlText');
        if (petControlText) {
            const petName = this.selectedPetType.charAt(0).toUpperCase() + this.selectedPetType.slice(1);
            petControlText.textContent = `D Pet ${petName}`;
        }
    }
    
    showInstructionsModal() {
        document.getElementById('instructionsModal').classList.remove('hidden');
    }
    
    hideInstructionsModal() {
        document.getElementById('instructionsModal').classList.add('hidden');
    }
    
    loadGameSpeedSetting() {
        const saved = localStorage.getItem('armorOfGod_gameSpeed');
        return saved !== null ? parseFloat(saved) : 1.0; // Default to 1.0x
    }
    
    saveGameSpeedSetting() {
        localStorage.setItem('armorOfGod_gameSpeed', this.gameSpeed.toString());
    }

    createDebugDisplay() {
        // Create debug display element in DOM
        this.debugElement = document.createElement('div');
        this.debugElement.style.position = 'fixed';
        this.debugElement.style.bottom = '5px';
        this.debugElement.style.right = '5px';
        this.debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.debugElement.style.color = 'white';
        this.debugElement.style.padding = '5px';
        this.debugElement.style.fontFamily = 'monospace';
        this.debugElement.style.fontSize = '12px';
        this.debugElement.style.zIndex = '1000';
        this.debugElement.textContent = 'X:0 Y:0';
        document.body.appendChild(this.debugElement);
    }

    updateDebugDisplay() {
        if (this.debugElement && this.player) {
            const currentX = Math.round(this.player.x);
            const currentY = Math.round(this.player.y);
            
            // Only update if position changed
            if (!this.lastPlayerPos || this.lastPlayerPos.x !== currentX || this.lastPlayerPos.y !== currentY) {
                this.lastPlayerPos = { x: currentX, y: currentY };
                this.debugElement.textContent = `X:${currentX} Y:${currentY}`;
            }
        }
    }

}

// Start the game when the page loads
window.addEventListener('load', () => {
    new ArmorOfGodGame();
});