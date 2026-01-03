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
        
        // Level data
        this.levelData = {
            1: { name: 'Clover Hills', image: 'images/level1.png' },
            2: { name: 'Midnight Jungle', image: 'images/level2.png' },
            3: { name: 'Granite Mountain Pass', image: 'images/level3.png' }
        };
        
        this.cameraX = 0;
        this.cameraY = 0;
        this.booksCollected = 0;
        this.selectedPetType = 'dog'; // Default to dog
        
        // Scoring system
        this.score = 0; // Current level score
        this.totalScore = 0; // Total score across all levels
        this.levelStartTime = 0;
        this.levelEndTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        this.floatingScores = []; // For floating score indicators
        this.damageTaken = 0; // Track damage for no-damage bonus
        this.enemiesKilled = new Set(); // Track which enemy types killed for bonus
        
        // Combo system
        this.comboMode = false; // Tracks if we're in combo mode
        this.comboMultiplier = 1; // Current multiplier (starts at 1)
        this.airborneKills = 0; // Number of kills while airborne
        
        // Debug variables
        this.lastPlayerPos = null;
        this.debugElement = null;
        this.createDebugDisplay();
        
        // Initialize scoring system
        this.initializeScoring();
        
        // Load images
        this.templeImage = new Image();
        this.templeImage.src = 'images/sprites/temple.png';
        this.bomImage = new Image();
        this.bomImage.src = 'images/sprites/bom.png';
        this.heartImage = new Image();
        this.heartImage.src = 'images/sprites/heartUp.png';
        this.arrowImage = new Image();
        this.arrowImage.src = 'images/sprites/enemy/fiery-arrow.png';
        this.brokenArrowImage = new Image();
        this.brokenArrowImage.src = 'images/sprites/enemy/fiery-arrow-broken.png';
        
        // Load foreground images
        this.foregroundImages = {};
        this.loadForegroundImages();
        
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
            game: this, // Reference to game object for combo system
            // Petting animation properties
            isPetting: false,
            pettingTimer: 0,
            pettingDuration: 60, // 1 second petting animation
            handOffset: 0,
            facingRight: true, // Player facing direction
            blockedLeft: false,
            blockedRight: false,
            // Variable jump properties
            jumpHeld: false,
            minJumpHeight: 0.4, // Minimum jump as fraction of full jump
            jumpCutSpeed: 0.5 // Speed at which jump is reduced when key released
        };
        
        // Pet companion properties (can be dog or cat)
        this.pet = {
            x: 100,
            y: 440,
            width: 24,
            height: 22, // Increased to match visual representation (body 8 + legs 6 + head area)
            velocityY: 0,
            isGrounded: true,
            animFrame: 0,
            animTimer: 0,
            animSpeed: 10,
            isMoving: false,
            followDistance: 25,
            catchUpSpeed: 4.0,
            normalSpeed: 2.5,
            facingRight: true,
            type: 'dog',
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

        // make accessible from window
        window.game = this;
        
        // Death system
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.deathFreezeTime = 60;
        
        // Last safe platform tracking for pit respawn
        this.lastSafePlatform = { x: 50, y: 378 }; // Default spawn position
        this.lastSafePlatformTimer = 0; // Timer to prevent immediate updates
        
        // Initialize managers
        this.audioManager = new AudioManager();
        this.effectsManager = new EffectsManager();
        this.inputHandler = new InputHandler();
        this.worldManager = new WorldManager();
        this.arrowManager = new ArrowManager(this.audioManager, this.arrowImage, this.brokenArrowImage, this);
        this.enemyManager = new EnemyManager(this.audioManager, this);
        this.backgroundManager = new BackgroundManager();
        this.uiRenderer = new UIRenderer();
        this.characterRenderer = new CharacterRenderer();
        this.petManager = new PetManager(this.pet, this);
        
        // Setup event listeners
        this.inputHandler.setupEventListeners(this.canvas, this);
        this.setupMenuEvents();
        
        // Initialize game state for current level
        this.enemyManager.setLevel(this.level);
        
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
            top: 20px;
            left: 20px;
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
            this.startGameAfterIntro();
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
            if (this.level === 1 || this.level === 2) {
                this.startNextLevel();
            } else {
                alert('More levels coming soon! Thanks for playing!');
            }
        });
        
        document.getElementById('nextLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('startLevelBtn').addEventListener('click', () => {
            this.startGameAfterIntro();
        });
        
        document.getElementById('startLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('retryLevelBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.retryCurrentLevel();
        });
        
        document.getElementById('retryLevelBtn').addEventListener('mouseenter', () => {
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
    
    // Scoring system methods
    initializeScoring() {
        this.score = 0; // Reset level score
        this.levelStartTime = performance.now();
        this.levelEndTime = 0; // Reset level end time
        this.totalPausedTime = 0; // Reset paused time tracking
        this.pauseStartTime = 0;
        this.floatingScores = [];
        this.damageTaken = 0; // Reset damage tracking
        this.enemiesKilled = new Set(); // Reset enemy tracking
    }
    
    addScore(points, color = '#FFD700', label = '') {
        // Don't add to score immediately - wait for floating score to finish
        
        // Add floating score indicator (always add since we want all scores to show)
        this.floatingScores.push({
            points: points,
            timer: 0,
            duration: 300, // 5 seconds at 60fps
            color: color,
            label: label,
            pendingPoints: points // Store points to add when animation completes
        });
    }
    
    updateFloatingScores() {
        this.floatingScores = this.floatingScores.filter(scoreIndicator => {
            scoreIndicator.timer++;
            
            // Calculate opacity to determine when to add points
            const opacity = Math.max(0, (scoreIndicator.duration - scoreIndicator.timer) / scoreIndicator.duration);
            
            // Add points when the floating score starts to fade (opacity drops to 80%)
            if (opacity <= 0.75 && scoreIndicator.pendingPoints) {
                // Add the points to the actual score as it's fading
                this.score += scoreIndicator.pendingPoints;
                scoreIndicator.pendingPoints = null; // Mark as processed
            }
            
            return scoreIndicator.timer < scoreIndicator.duration;
        });
    }
    
    getLevelTime() {
        // Use stored end time if level is completed, otherwise calculate current time
        const currentTime = this.levelEndTime > 0 ? this.levelEndTime : performance.now();
        const activePausedTime = this.isPaused ? (currentTime - this.pauseStartTime) : 0;
        const totalPaused = this.totalPausedTime + activePausedTime;
        const actualElapsedTime = currentTime - this.levelStartTime - totalPaused;
        return Math.floor(actualElapsedTime / 1000 * 60); // Convert to game frames
    }
    
    calculateSpeedBonus() {
        const levelTime = this.getLevelTime();
        const targetTime = {
            1: 2400, // 40 seconds
            2: 5400, // 90 seconds
            3: 5400  // 90 seconds
        };
        
        const target = targetTime[this.level] || 3000;
        if (levelTime <= target) {
            const bonus = Math.max(0, Math.floor((target - levelTime) * 2));
            return Math.min(bonus, 2000); // Cap at 2000 points
        }
        return 0;
    }
    
    calculateAndDisplayBonuses() {
        let bonusTotal = 0;

        
        // Check for no damage bonus
        if (this.damageTaken === 0) {
            this.addScore(1000, '#00FF00', 'No Damage Bonus');
            bonusTotal += 1000;
        }
        
        // Check for all enemies killed bonus - check if every individual snail has been killed
        const allSnails = this.enemyManager.snails;
        const totalSnails = allSnails.length;
        const killedSnails = allSnails.filter(snail => snail.killed).length;
        
        if (totalSnails > 0 && killedSnails === totalSnails) {
            this.addScore(1000, '#E74C3C', 'All Enemies Killed');
            bonusTotal += 1000;
        }
        
        // Calculate and add speed bonus
        const speedBonus = this.calculateSpeedBonus();
        if (speedBonus > 0) {
            this.addScore(speedBonus, '#00FF00', 'Speed Bonus');
            bonusTotal += speedBonus;
        }
        
        // Update final scores after adding bonuses
        this.finalLevelScore = this.score + bonusTotal;
        this.finalTotalScore = this.totalScore + this.score + bonusTotal;
    }
    
    startGame() {
        this.showLevelIntro();
    }
    
    showLevelIntro() {
        this.gameState = 'levelIntro';
        this.showScreen('levelIntro');
        
        // Play level intro music
        this.audioManager.playMusic('levelIntro');
        
        // Update intro screen content
        const levelData = this.levelData[this.level];
        document.getElementById('introLevelNumber').textContent = `LEVEL ${this.level}`;
        document.getElementById('introLevelName').textContent = levelData.name.toUpperCase();
        document.getElementById('introLevelImage').src = levelData.image;
        document.getElementById('introLevelImage').alt = levelData.name;
    }
    
    startGameAfterIntro() {
        // Reset game to initialize world with selected level
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.updateLevelIndicator();
        
        // Initialize scoring for this level
        this.initializeScoring();
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
        this.player.jumpHeld = false;
        this.player.fallingSoundPlayed = false; // Reset falling sound flag
        
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
        
        // Reset last safe platform tracking
        this.lastSafePlatform = { x: 50, y: 378 }; // Default spawn position
        this.lastSafePlatformTimer = 0;
        
        this.isPaused = false;
        
        // Reset castle position for current level
        this.setCastlePosition();
        
        // Reset managers
        this.effectsManager.reset();
        this.arrowManager.reset();
        this.enemyManager.reset();
        this.worldManager.setLevel(this.level);
        this.backgroundManager.setLevel(this.level);
        this.enemyManager.setLevel(this.level);
        
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
        } else if (this.level === 3) {
            // Mountain level - temple on the peak platform
            this.castle = { x: 13100, y: 0, width: 240, height: 248 };
        }
    }
    
    loadForegroundImages() {
        // Load all foreground sprite images
        const foregroundSprites = [
            'rooty-tree.png',
            'pine-tree-1.png',
            'pine-tree-2.png',
            'rock-1.png',
            'rock-2.png',
            'rock-3.png',
            'round-bush.png',
            'short-tree.png',
            'spikey-bush.png',
            'tall-tree.png',
            'long-bush.png',
            'jungle-bush.png',
            'jungle-foilage-1.png',
            'jungle-foilage-2.png',
            'jungle-foilage-3.png',
            'jungle-tree-1.png',
            'jungle-tree-2.png',
            'jungle-tree-3.png',
            'jungle-tree-4.png',
            'jungle-tree-5.png',
            'jungle-tree-6.png'
        ];
        
        foregroundSprites.forEach(filename => {
            const img = new Image();
            img.src = `images/sprites/foreground/${filename}`;
            this.foregroundImages[filename] = img;
        });
    }
    
    cycleLevelSelector() {
        // Cycle between levels 1, 2, and 3 for testing
        this.level = this.level === 1 ? 2 : (this.level === 2 ? 3 : 1);
        this.updateLevelSelector();
        this.updateLevelIndicator();
        
        // If we're in menu, just update the selector
        // If we're in game, restart with new level
        if (this.gameState === 'playing') {
            this.showLevelIntro(); // Show intro for new level
        }
    }
    
    updateLevelSelector() {
        const levelBtn = document.getElementById('levelSelectorBtn');
        const levelText = levelBtn.querySelector('.level-text');
        levelText.textContent = `L${this.level}`;
    }
    
    updateLevelIndicator() {
        const levelData = this.levelData[this.level];
        const levelInfo = document.getElementById('levelInfo');
        levelInfo.textContent = `Level ${this.level}: ${levelData.name}`;
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
            'levelIntro': 'levelIntroScreen',
            'game': 'gameScreen',
            'gameOver': 'gameOverScreen',
            'levelComplete': 'levelCompleteScreen'
        };
        
        document.getElementById(screens[screenName]).classList.remove('hidden');
        
        // Start running animation on victory screen
        if (screenName === 'levelComplete') {
            // Reset character alpha after screen transition
            this.player.alpha = 1;
            this.pet.alpha = 1;
            
            this.startVictoryRunningAnimation();
            // Update score displays
            const levelScoreElement = document.getElementById('levelScore');
            const totalScoreElement = document.getElementById('totalScore');
            if (levelScoreElement) {
                levelScoreElement.textContent = (this.finalLevelScore || this.score || 0).toLocaleString();
            }
            if (totalScoreElement) {
                totalScoreElement.textContent = (this.finalTotalScore || this.totalScore || 0).toLocaleString();
            }
            
            // Update the level score label to show which level
            const levelScoreLabel = document.querySelector('.score-display-small .score-row-small:first-child .score-label-small');
            if (levelScoreLabel) {
                levelScoreLabel.textContent = `Level ${this.level} Score:`;
            }
        } else {
            this.stopVictoryRunningAnimation();
        }
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
            // Update background manager with pause state (needs to run even when paused)
            this.backgroundManager.update(this.isPaused);
            
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
        
        // Only run game updates for playing states
        if (this.gameState === 'menu' || this.gameState === 'levelIntro') {
            return; // No game logic needed for menu/intro screens
        }
        
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
            this.gameState,
            this.inputHandler,
            this.getCurrentJumpPower()
        );
        
        this.enemyManager.update(this.player, this.worldManager, this.gameState, this.cameraX, this.canvas.width, this.inputHandler, () => this.getCurrentJumpPower());
        
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
        
        // Update floating scores
        this.updateFloatingScores();
        
        // Update player properties for UI
        this.player.levelTime = this.getLevelTime();
        this.player.score = this.score;
        this.player.floatingScores = this.floatingScores;
        
        if (this.gameState === 'celebrating') {
            if (this.effectsManager.updateCelebration()) {
                // Celebration is complete, move to level complete screen
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
        
        if (this.gameState !== 'playing' && this.gameState !== 'enteringTemple') return;
        
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
        
        // Variable jump physics - cut jump short if key not held
        if (this.player.isJumping && this.player.velocityY < 0 && !this.player.jumpHeld) {
            // Player is jumping upward but key was released - reduce upward velocity
            const minVelocity = this.getCurrentJumpPower() * this.player.minJumpHeight;
            if (this.player.velocityY < minVelocity) {
                this.player.velocityY *= this.player.jumpCutSpeed;
            }
        }
        
        // Apply gravity to player
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Check for pit death
        if (this.player.y > this.canvas.height + 50) {
            // Play falling sound when falling into pit (only once per fall)
            if (!this.player.fallingSoundPlayed) {
                this.audioManager.playSound('falling');
                this.player.fallingSoundPlayed = true;
            }
            this.handlePitFall();
            return;
        }
        
        // Platform collisions for player (this will set isGrounded=true if landing on platform)
        this.worldManager.checkPlatformCollisions(this.player);
        
        // Reset falling sound flag when player becomes grounded
        if (this.player.isGrounded && this.player.fallingSoundPlayed) {
            this.player.fallingSoundPlayed = false;
        }
        
        // Update last safe platform position when player is grounded
        this.updateLastSafePlatform();
        
        // Check for hazardous foreground sprite collisions
        const hazardCollision = this.worldManager.checkHazardCollisions(this.player);
        if (hazardCollision.collision && !this.hasArmor) {
            this.handlePlayerDamage(hazardCollision.damage, hazardCollision.hazardType);
        }
        
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
        this.petManager.update();
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

    
    tryPetAnimal() {
        this.petManager.tryPetting();
    }
    
    checkCollisions() {
        if (this.gameState !== 'playing' && this.gameState !== 'dying') return;
        
        // Arrow collisions
        const hitArrows = this.arrowManager.checkCollisions(this.player, this.hasArmor, this.inputHandler, this.getCurrentJumpPower());
        if (hitArrows.length > 0) {
            // Add score for breaking arrows when armored
            if (this.hasArmor) {
                hitArrows.forEach(arrow => {
                    const basePoints = 300;
                    
                    // Handle combo system for arrow deflections
                    if (!this.player.isGrounded && this.comboMode) {
                        // Continue combo - increase multiplier
                        this.comboMultiplier++;
                        this.airborneKills++;
                    } else if (!this.player.isGrounded && !this.comboMode) {
                        // Start combo mode if airborne
                        this.comboMode = true;
                        this.comboMultiplier = 1; // First deflection is normal
                        this.airborneKills = 1;
                    }
                    
                    // Apply multiplier if in combo mode
                    const points = this.comboMode ? basePoints * this.comboMultiplier : basePoints;
                    const color = this.comboMode && this.comboMultiplier > 1 ? '#FF6B6B' : '#E74C3C';
                    
                    // Create label with multiplier if applicable
                    let label = 'Arrow';
                    if (this.comboMode && this.comboMultiplier > 1) {
                        label += ` x${this.comboMultiplier}`;
                    }
                    
                    this.addScore(points, color, label);
                });
            }
            // Calculate knockback direction from first arrow hit
            const arrow = hitArrows[0];
            const playerCenterX = this.player.x + this.player.width / 2;
            const knockbackDirection = playerCenterX > arrow.x ? 1 : -1; // 1 for right, -1 for left
            this.takeDamage(knockbackDirection);
        }
        
        // Enemy collisions
        const hitEnemies = this.enemyManager.checkCollisions(this.player, this.hasArmor, this.inputHandler, () => this.getCurrentJumpPower());
        if (hitEnemies.length > 0) {
            // Add score for defeating enemies when armored
            if (this.hasArmor) {
                hitEnemies.forEach(enemy => {
                    const basePoints = enemy.isMegaSnail ? 1000 : 200;
                    
                    // Handle combo system
                    if (!this.player.isGrounded && this.comboMode) {
                        // Continue combo - increase multiplier
                        this.comboMultiplier++;
                        this.airborneKills++;
                    } else if (!this.player.isGrounded && !this.comboMode) {
                        // Start combo mode if airborne
                        this.comboMode = true;
                        this.comboMultiplier = 1; // First kill is normal
                        this.airborneKills = 1;
                    }
                    
                    // Apply multiplier if in combo mode
                    const points = this.comboMode ? basePoints * this.comboMultiplier : basePoints;
                    const color = this.comboMode && this.comboMultiplier > 1 ? '#FF6B6B' : '#E74C3C';
                    
                    // Create label with multiplier if applicable
                    let label = enemy.isMegaSnail ? 'Mega Snail' : 'Snail';
                    if (this.comboMode && this.comboMultiplier > 1) {
                        label += ` x${this.comboMultiplier}`;
                    }
                    
                    this.addScore(points, color, label);
                    
                    // Track enemy types killed for bonus calculation
                    this.enemiesKilled.add(enemy.isMegaSnail ? 'megaSnail' : 'snail');
                });
            }
            // Calculate knockback direction from first enemy hit
            const enemy = hitEnemies[0];
            const playerCenterX = this.player.x + this.player.width / 2;
            const knockbackDirection = playerCenterX > enemy.x ? 1 : -1; // 1 for right, -1 for left
            this.takeDamage(knockbackDirection);
        }
        
        // Scripture book collisions
        this.worldManager.scriptureBooks.forEach(book => {
            if (!book.collected && this.checkCollision(this.player, book)) {
                book.collected = true;
                
                // Play collection sound
                this.audioManager.playSound('collect2');
                
                // Add score for collecting scripture
                this.addScore(300, '#FFD700', 'Scripture');
                
                if (this.booksCollected < 3) {
                    // Still collecting initial scriptures
                    this.booksCollected++;
                    if (this.booksCollected >= 3) {
                        this.activateArmor();
                    }
                } else if (this.hasArmor) {
                    // Already have armor - reset timer instead of incrementing count
                    this.armorTimer = this.armorDuration;
                    this.uiRenderer.showMessage('Armor Timer Reset!', 120, '#FFD700', 15, 400);
                }
            }
        });
        
        // Heart collisions (health restoration)
        this.worldManager.hearts.forEach(heart => {
            if (!heart.collected && this.checkCollision(this.player, heart)) {
                heart.collected = true;
                
                // Play same collection sound as scripture books
                this.audioManager.playSound('heal2');
                
                // Add score for collecting heart
                this.addScore(500, '#FFD700', 'Heart');
                
                // Restore health (don't exceed max health)
                const oldHealth = this.player.health;
                this.player.health = Math.min(this.player.health + heart.healthRestore, this.player.maxHealth);
                const healedAmount = this.player.health - oldHealth;
                
                if (healedAmount > 0) {
                    this.uiRenderer.showMessage(`Health +${healedAmount}!`, 120, '#FF6B6B', 15, 300);
                } else {
                    this.uiRenderer.showMessage('Health Full!', 120, '#FFD700', 15, 300);
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
    
    takeDamage(knockbackDirection = 0) {
        if (this.player.invulnerable) return;
        
        // Track damage for scoring
        this.damageTaken++;

        // Play grunt sound when hurt
        this.audioManager.playSound('grunt1');
        console.log(`knockbackDirection: ${knockbackDirection}`);
        // Apply knockback effect - move 10px away from the damage source and small vertical jump
        if (knockbackDirection !== 0) {
            // Apply immediate position changes for both horizontal and vertical knockback
            this.player.x += knockbackDirection * 10;
            this.player.y -= 5; // Move up 5px immediately
            // Make sure player doesn't go off screen or through walls
            this.player.x = Math.max(0, Math.min(this.player.x, 12000 - this.player.width));
            // Add small vertical velocity for continued upward movement
            this.player.velocityY = -3;
            this.player.isJumping = true;
            this.player.isGrounded = false;
        }

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
    
    handlePlayerDamage(damage, hazardType) {
        // Handle damage from environmental hazards
        if (hazardType === 'spike') {
            // Calculate knockback direction away from the spikey bush
            // Find the closest spikey bush to determine knockback direction
            let closestBush = null;
            let closestDistance = Infinity;
            
            for (let sprite of this.worldManager.foregroundSprites) {
                if (sprite.hazard && sprite.image === 'spikey-bush.png') {
                    const bushCenterX = sprite.x + sprite.width / 2;
                    const playerCenterX = this.player.x + this.player.width / 2;
                    const distance = Math.abs(bushCenterX - playerCenterX);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestBush = sprite;
                    }
                }
            }
            
            if (closestBush) {
                const bushCenterX = closestBush.x + closestBush.width / 2;
                const playerCenterX = this.player.x + this.player.width / 2;
                const knockbackDirection = playerCenterX < bushCenterX ? -1 : 1;
                this.takeDamage(knockbackDirection);
            } else {
                this.takeDamage(0); // No knockback if we can't find the bush
            }
        } else {
            // Default damage handling for other hazard types
            this.takeDamage(0);
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
    
    updateLastSafePlatform() {
        // Only update if player is grounded and has been stable for a few frames
        if (this.player.isGrounded) {
            this.lastSafePlatformTimer++;
            
            // After being grounded for 10 frames, update the safe position
            if (this.lastSafePlatformTimer > 10) {
                this.lastSafePlatform = {
                    x: this.player.x,
                    y: this.player.y
                };
            }
        } else {
            // Reset timer when not grounded
            this.lastSafePlatformTimer = 0;
        }
    }
    
    handlePitFall() {
        // Don't handle pit fall if already in damage/death state
        if (this.player.invulnerable || this.isDying) return;
        
        // Always take damage from pit falls (even when armored)
        this.player.health--;
        this.damageTaken++;
        
        // Play hurt sound
        this.audioManager.playSound('grunt1');
        this.audioManager.playRandomThudSound();
        
        // Check if player dies from pit fall
        if (this.player.health <= 0) {
            this.startDeath('You fell into a pit! Stay on the platforms to survive.');
            return;
        }
        
        // Find a safe respawn position on a ground platform
        let safePosition = this.findSafeRespawnPosition();
        
        // Respawn at safe position
        this.player.x = safePosition.x;
        this.player.y = safePosition.y - this.player.height; // Place on top of platform
        this.player.velocityY = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
        
        // Apply invulnerability for 2 seconds
        this.player.invulnerable = true;
        this.player.invulnerabilityTimer = 0;
        this.player.invulnerabilityDuration = 120; // 2 seconds at 60fps
        
        // Update camera to new position
        this.cameraX = Math.max(0, this.player.x - 300);
    }
    
    findSafeRespawnPosition() {
        // Find the most recent solid platform behind the player's current position
        let bestPlatform = null;
        let bestDistance = Infinity;
        
        // Look for solid platforms (ground, rock, tree_platform) behind the player
        for (let platform of this.worldManager.platforms) {
            // Include all solid platform types, exclude small floating platforms
            const isSolidPlatform = (platform.type === 'ground' || platform.type === 'rock' || platform.type === 'tree_platform') 
                                   && platform.width >= 100; // Exclude tiny platforms
            
            if (isSolidPlatform && platform.x < this.player.x) {
                const distance = this.player.x - (platform.x + platform.width/2);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestPlatform = platform;
                }
            }
        }
        
        // If no solid platform found behind player, use the closest one ahead
        if (!bestPlatform) {
            for (let platform of this.worldManager.platforms) {
                const isSolidPlatform = (platform.type === 'ground' || platform.type === 'rock' || platform.type === 'tree_platform') 
                                       && platform.width >= 100; // Exclude tiny platforms
                
                if (isSolidPlatform) {
                    const distance = Math.abs(this.player.x - (platform.x + platform.width/2));
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestPlatform = platform;
                    }
                }
            }
        }
        
        // Default to starting position if no platform found
        if (!bestPlatform) {
            return { x: 50, y: 468 };
        }
        
        // Return center of the platform, positioned on top
        return {
            x: bestPlatform.x + bestPlatform.width/2 - this.player.width/2,
            y: bestPlatform.y - this.player.height
        };
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
        this.uiRenderer.showMessage('Collect scriptures for new armor.', 240, '#FFA500', 15, 700);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Starting a pause - record when it began
            this.pauseStartTime = performance.now();
            this.audioManager.playSoundEffect('pause');
            this.audioManager.pauseCurrentMusic();
        } else {
            // Ending a pause - add this pause duration to total
            if (this.pauseStartTime > 0) {
                this.totalPausedTime += performance.now() - this.pauseStartTime;
                this.pauseStartTime = 0;
            }
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
        // Add completed level score to total before advancing
        this.totalScore = this.finalTotalScore || (this.totalScore + this.score);
        
        // Advance to the next level
        this.level++;
        this.showLevelIntro(); // Show intro for next level
        this.updateLevelSelector();
        
        // Initialize scoring for new level
        this.initializeScoring();
    }

    retryCurrentLevel() {
        // Restart the current level without advancing
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.updateLevelIndicator();
        this.audioManager.playMusic('adventure');
        this.arrowManager.spawnInitialArrows(this.player);
        
        // Initialize scoring for retry
        this.initializeScoring();
    }

    goToMainMenu() {
        this.level = 1; // Reset to level 1 when going to main menu
        this.totalScore = 0; // Reset total score when going to main menu
        this.score = 0; // Reset level score
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
        // Stop the level timer immediately when level is completed
        this.levelEndTime = performance.now();
        
        // Store initial scores before bonuses (bonuses will be added during celebration)
        this.finalLevelScore = this.score; // Will be updated with bonuses
        this.finalTotalScore = this.totalScore; // Will be updated with bonuses
        
        // Start temple entrance immediately
        this.gameState = 'enteringTemple';
        this.templeEntranceTimer = 0;
        this.templeCenterX = this.castle.x + this.castle.width / 2;
        
        // Calculate the correct temple platform Y based on castle position
        const templePlatformY = this.castle.y + this.castle.height;
        
        // If pet is far away (more than 300 pixels), teleport it next to player
        const distanceFromPlayer = Math.abs(this.pet.x - this.player.x);
        if (distanceFromPlayer > 300) {
            this.pet.x = this.player.x - 50; // Place pet slightly behind player
            this.pet.y = templePlatformY - this.pet.height; // Place on temple platform
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
    

    
    updateTempleEntrance() {
        this.templeEntranceTimer++;
        
        // Calculate the correct temple platform Y based on castle position
        const templePlatformY = this.castle.y + this.castle.height;
        
        // Wait until both characters are grounded before starting movement
        const playerGrounded = this.player.isGrounded || this.player.y >= templePlatformY - this.player.height;
        const petGrounded = this.pet.isGrounded || this.pet.y >= templePlatformY - this.pet.height;
        
        if (!playerGrounded || !petGrounded) {
            // Still waiting for landing - keep facing temple
            this.player.facingRight = true;
            this.pet.facingRight = true;
            return;
        }
        
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
        
        // Don't reset alpha values here - let the fade effect continue
        // through the celebration until the level complete screen shows
        
        // Add bonuses immediately when celebration starts so they're visible
        this.calculateAndDisplayBonuses();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing' && this.gameState !== 'dying' && this.gameState !== 'celebrating' && this.gameState !== 'enteringTemple') {
            return;
        }
        
        // Render parallax background (not translated by camera)
        this.backgroundManager.render(this.ctx, this.cameraX, this.gameState);
        
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        
        // Render world platforms and objects
        this.worldManager.renderPlatforms(this.ctx);
        this.worldManager.renderForegroundSprites(this.ctx, this.foregroundImages);
        this.worldManager.renderTemple(this.ctx, this.templeImage, this.castle);
        
        // Render game objects
        this.arrowManager.render(this.ctx);
        this.enemyManager.render(this.ctx);
        this.worldManager.renderScriptureBooks(this.ctx, this.bomImage);
        this.worldManager.renderHearts(this.ctx, this.heartImage);
        
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
            const horizontalDistance = Math.abs(this.player.x - this.pet.x);
            const verticalDistance = Math.abs(this.player.y - this.pet.y);
            const petDistance = 60;
            const maxYDifference = 30; // Must be on similar Y level
            
            if (horizontalDistance <= petDistance && verticalDistance <= maxYDifference && !this.pet.isBeingPetted) {
                this.ctx.save();
                this.ctx.translate(-this.cameraX, -this.cameraY); // Translate back for world coordinates
                
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
            this.armorDuration,
            this.comboMode,
            this.comboMultiplier,
            this.airborneKills
        );
        
        // Render sparkles on top of everything (with camera translation)
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
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
    
    startVictoryRunningAnimation() {
        const runnersEl = document.getElementById('victoryRunners');
        const playerImgEl = document.getElementById('victoryPlayerImg');
        const petImgEl = document.getElementById('victoryPetImg');
        
        if (!runnersEl || !playerImgEl || !petImgEl) return;
        
        // Set up pet image based on selected pet type
        const petType = this.selectedPet === 'cat' ? 'cat' : 'dog';
        petImgEl.src = `images/sprites/main-char/${petType}-run1.png`;
        
        // Show the runners and start the animation
        runnersEl.classList.remove('hidden');
        
        // Animate running sprites using same frames as game
        let playerAnimFrame = 0;
        let petAnimFrame = 0;
        this.victoryAnimationInterval = setInterval(() => {
            // Player has 14 running frames (like in game)
            playerAnimFrame = (playerAnimFrame + 1) % 14;
            const playerFrameNum = playerAnimFrame + 1;
            playerImgEl.src = `images/sprites/main-char/run${playerFrameNum}.png`;
            
            // Pet frames depend on type (like in game)
            const maxPetFrames = petType === 'cat' ? 4 : 5;
            petAnimFrame = (petAnimFrame + 1) % maxPetFrames;
            const petFrameNum = petAnimFrame + 1;
            petImgEl.src = `images/sprites/main-char/${petType}-run${petFrameNum}.png`;
        }, 80); // Same timing as game animations
        
        // Stop animation when CSS animation completes (2.56s)
        setTimeout(() => {
            if (this.victoryAnimationInterval) {
                clearInterval(this.victoryAnimationInterval);
                this.victoryAnimationInterval = null;
            }
        }, 2560);
    }
    
    stopVictoryRunningAnimation() {
        const runnersEl = document.getElementById('victoryRunners');
        
        if (runnersEl) {
            runnersEl.classList.add('hidden');
        }
        
        if (this.victoryAnimationInterval) {
            clearInterval(this.victoryAnimationInterval);
            this.victoryAnimationInterval = null;
        }
    }

}

// Start the game when the page loads
window.addEventListener('load', () => {
    new ArmorOfGodGame();
});