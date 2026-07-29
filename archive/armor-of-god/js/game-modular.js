class ArmorOfGodGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameOver, levelComplete, waitingToEnterTemple, enteringTemple, celebrating
        this.isPaused = false;
        this.postBossSurface = false;
        this.keepVictoryMusicForCompletion = false;
        this.surfaceCaveExit = null;
        this.postBossTempleCelebrated = false;
        this.pendingLevelThreeBoss = false;
        this.completedGameRun = false;
        
        // Temple entrance sequence properties
        this.templeEntranceTimer = 0;
        this.templeEntranceSpeed = 2;
        this.templeCenterX = 0; // Will be calculated based on castle position
        this.hasArmor = false;
        this.armorTimer = 0;
        this.armorDuration = 15 * 60; // 15 seconds at 60fps
        this.level = 1;
        this.unlockedStageCount = this.loadUnlockedStageCount();
        
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
        this.creditsEndTimer = null;
        this.creditsSectionCleanupTimer = null;
        this.cutsceneSources = [1, 2, 3, 4, 5].map(number => `cutscenes/opening-${number}.mp4`);
        this.cutscenePreloadPromise = null;
        this.cutsceneRunId = 0;
        
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
        
        // Initialize scoring system
        this.initializeScoring();
        this.highScoreBoard = new HighScoreBoard(this);
        
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
            health: 4,
            maxHealth: 4,
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
        this.bossManager = new BossManager();
        this.caveCrystalImages = ['crystal-1.png', 'crystal-2.png', 'crystal-3.png'].map(file => {
            const image = new Image();
            image.src = `images/sprites/foreground/${file}`;
            return image;
        });
        this.pendingBossIntro = false;
        this.bossFightCheckpoint = false;
        this.postBossSurface = false;
        this.bossFightStartTime = 0;
        this.bossFightEndTime = 0;
        this.heartSpawnTimer = 0;
        
        // Setup event listeners
        this.inputHandler.setupEventListeners(this.canvas, this);
        this.setupMenuEvents();
        this.setupCreditsKeyboardControls();
        this.setLevelSelectorVisible(true);
        
        // Initialize game state for current level
        this.enemyManager.setLevel(this.level);
        
        // Initialize audio button appearance
        this.updateAudioButtonAppearance();
        
        // Start game loop
        this.gameLoop();
        
        // Start menu music with browser autoplay handling
        this.initializeAudio();

        // Let the first layout paint at its final dimensions before revealing the menu.
        requestAnimationFrame(() => document.body.classList.add('menu-ready'));
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

        document.getElementById('creditsLink').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('creditsLink').addEventListener('click', event => {
            event.preventDefault();
            this.audioManager.playSoundEffect('buttonClick');
            this.startCredits();
        });
        
        document.getElementById('closeModal').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('closeModal').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalClose');
            this.hideInstructionsModal();
        });

        document.getElementById('instructionsDoneBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('instructionsDoneBtn').addEventListener('click', () => {
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
            this.retryCurrentLevel();
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
        document.getElementById('creditsMenuBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.skipCredits();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            if (this.pendingLevelThreeBoss) {
                this.continueToBossFight();
                return;
            }
            this.audioManager.playSoundEffect('buttonClick');
            if (this.level === 1 || this.level === 2) {
                this.startNextLevel();
            } else {
                this.openFinalLeaderboard();
            }
        });
        
        document.getElementById('nextLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('startLevelBtn').addEventListener('click', () => {
            this.exitLevelIntro();
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
        
        const selectLevel = direction => {
            this.audioManager.playSoundEffect('buttonClick');
            this.cycleLevelSelector(direction);
        };
        document.getElementById('previousLevelBtn').addEventListener('click', () => selectLevel(-1));
        document.getElementById('nextLevelBtnMenu').addEventListener('click', () => selectLevel(1));
        document.getElementById('levelSelectorBtn').addEventListener('click', () => selectLevel(1));
        ['previousLevelBtn', 'nextLevelBtnMenu', 'levelSelectorBtn'].forEach(id => {
            document.getElementById(id).addEventListener('mouseenter', () => this.audioManager.playSoundEffect('buttonHover'));
        });
        document.getElementById('leaderboardLink').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('leaderboardLink').addEventListener('click', event => {
            event.preventDefault();
            this.audioManager.playSoundEffect('buttonClick');
            this.highScoreBoard.open();
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

    setupCreditsKeyboardControls() {
        // Capture these keys before focused controls or browser scrolling can consume them.
        document.addEventListener('keydown', event => {
            if (this.gameState !== 'credits') return;
            const key = event.key;
            if (key === 'ArrowRight' || key === 'ArrowDown' || key === ' ') {
                this.nextCreditsSection();
            } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
                this.previousCreditsSection();
            } else if (key === 'Escape') {
                this.skipCredits();
            } else {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);
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
        if (this.bossFightEndTime > 0) {
            const twoMinutes = 120 * 60;
            return Math.max(0, Math.floor((1 - Math.min(this.getBossFightTime(), twoMinutes) / twoMinutes) * 3000));
        }
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

        
        // Reward players for reaching the temple healthy.
        const healthBonus = Math.max(0, this.player.health) * 250;
        if (healthBonus > 0) {
            this.addScore(healthBonus, '#FF6B6B', `Health Bonus (${this.player.health} Hearts)`);
            bonusTotal += healthBonus;
        }

        // A flawless level earns the larger no-damage bonus.
        if (this.damageTaken === 0) {
            this.addScore(3000, '#00FF00', 'No Damage Bonus');
            bonusTotal += 3000;
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
        if (this.level === 1) {
            this.startOpeningCutscene();
            return;
        }
        this.showLevelIntro();
    }

    preloadOpeningCutscenes() {
        if (this.cutscenePreloadPromise) return this.cutscenePreloadPromise;
        this.cutscenePreloadPromise = Promise.all(this.cutsceneSources.map(source => new Promise(resolve => {
            const video = document.createElement('video');
            video.preload = 'auto'; video.muted = true; video.src = source;
            const done = () => resolve();
            video.addEventListener('canplaythrough', done, { once: true });
            video.addEventListener('error', done, { once: true });
            video.load();
        })));
        return this.cutscenePreloadPromise;
    }

    async startOpeningCutscene() {
        const runId = ++this.cutsceneRunId;
        this.gameState = 'cutscene';
        this.showScreen('cutscene');
        document.getElementById('cutsceneLoading').classList.remove('hidden');
        this.audioManager.playMusic('openingCutscene');
        await this.preloadOpeningCutscenes();
        if (runId !== this.cutsceneRunId || this.gameState !== 'cutscene') return;
        this.cutsceneIndex = 0;
        this.cutsceneCurrentVideo = document.getElementById('cutsceneVideoA');
        this.cutsceneOtherVideo = document.getElementById('cutsceneVideoB');
        document.getElementById('cutsceneLoading').classList.add('hidden');
        this.playCutsceneVideo(0, true);
    }

    async playCutsceneVideo(index, first = false) {
        const incoming = first ? this.cutsceneCurrentVideo : this.cutsceneOtherVideo;
        const outgoing = first ? null : this.cutsceneCurrentVideo;
        await new Promise(resolve => {
            incoming.src = this.cutsceneSources[index]; incoming.load();
            incoming.addEventListener('canplay', resolve, { once: true });
            incoming.addEventListener('error', resolve, { once: true });
        });
        if (this.gameState !== 'cutscene') return;
        if (index === 2) {
            this.cutsceneBadNewsStarted = false;
            this.cutsceneThunderStarted = false;
            this.cutsceneDarkBarkPlayed = false;
            this.cutsceneVideoThreeSlowed = false;
        }
        if (index === 1) this.cutscenePeacefulFadeStarted = false;
        if (index === 3) this.cutsceneVideoFourSlowed = false;
        if (index === 4) {
            this.cutsceneThunderFadeStarted = false;
        }
        if (incoming.videoWidth && incoming.videoHeight) document.getElementById('cutsceneFrame').style.aspectRatio = `${incoming.videoWidth} / ${incoming.videoHeight}`;
        incoming.currentTime = 0;
        incoming.playbackRate = index === 1 ? 0.8 : 1;
        const crossfadeDuration = index === 2 ? 2 : 0.8;
        incoming.style.transitionDuration = `${crossfadeDuration}s`;
        if (outgoing) outgoing.style.transitionDuration = `${crossfadeDuration}s`;
        incoming.onended = () => this.advanceCutscene(index);
        incoming.ontimeupdate = () => {
            if (index === 1 && !this.cutscenePeacefulFadeStarted && incoming.duration && incoming.currentTime >= incoming.duration - 3) {
                this.cutscenePeacefulFadeStarted = true;
                this.audioManager.fadeOutCurrentMusic(2000);
            }
            if (index === 2 && !this.cutsceneBadNewsStarted && incoming.currentTime >= 0.5) {
                this.cutsceneBadNewsStarted = true;
                this.audioManager.crossfadeToMusic('openingBadNews', 2000);
            }
            if (index === 2 && !this.cutsceneThunderStarted && incoming.currentTime >= 2) {
                this.cutsceneThunderStarted = true;
                const thunder = this.audioManager.audio.thunderAmbience;
                if (this.audioManager.audioEnabled) thunder.play().catch(() => {});
            }
            if (index === 2 && !this.cutsceneDarkBarkPlayed && incoming.currentTime >= 4) {
                this.cutsceneDarkBarkPlayed = true;
                this.audioManager.playSound('bark1');
            }
            if (index === 2 && !this.cutsceneVideoThreeSlowed && incoming.currentTime >= 3.3) {
                this.cutsceneVideoThreeSlowed = true;
                incoming.playbackRate = 0.6;
            }
            if (index === 3 && !this.cutsceneVideoFourSlowed && incoming.currentTime >= 2) {
                this.cutsceneVideoFourSlowed = true;
                incoming.playbackRate = 0.8;
            }
            if (index === 4 && !this.cutsceneThunderFadeStarted && incoming.duration && incoming.currentTime >= incoming.duration - 3) {
                this.cutsceneThunderFadeStarted = true;
                this.audioManager.fadeOutSound('thunderAmbience', 2000);
            }
            const fadeDuration = index === 1 ? 2 : 0.8;
            if (incoming.duration && !this.cutsceneTransitioning && index < 4 && incoming.currentTime >= incoming.duration - fadeDuration) this.advanceCutscene(index);
        };
        await incoming.play().catch(() => {});
        incoming.classList.add('cutscene-video--visible');
        if (outgoing) outgoing.classList.remove('cutscene-video--visible');
        this.cutsceneCurrentVideo = incoming;
        this.cutsceneOtherVideo = incoming === document.getElementById('cutsceneVideoA') ? document.getElementById('cutsceneVideoB') : document.getElementById('cutsceneVideoA');
    }

    advanceCutscene(index) {
        if (this.gameState !== 'cutscene' || this.cutsceneTransitioning || index !== this.cutsceneIndex) return;
        if (index === 4) { this.finishOpeningCutscene(); return; }
        this.cutsceneTransitioning = true;
        this.cutsceneIndex++;
        this.playCutsceneVideo(this.cutsceneIndex).finally(() => { this.cutsceneTransitioning = false; });
    }

    skipOpeningCutscene() {
        if (this.gameState !== 'cutscene') return;
        this.cutsceneRunId++;
        this.finishOpeningCutscene();
    }

    finishOpeningCutscene() {
        [this.cutsceneCurrentVideo, this.cutsceneOtherVideo].forEach(video => { video?.pause(); video?.classList.remove('cutscene-video--visible'); });
        const thunder = this.audioManager.audio.thunderAmbience;
        thunder.pause(); thunder.currentTime = 0;
        // Let the final dramatic cue resolve over the first moments of the intro.
        this.audioManager.fadeOutCurrentMusic(1500);
        this.showLevelIntro(1500);
    }
    
    showLevelIntro(musicDelay = 0) {
        clearTimeout(this.levelIntroFastForwardTimer);
        clearTimeout(this.levelIntroExitTimer);
        clearTimeout(this.levelIntroMusicTimer);
        clearTimeout(this.levelIntroReadyTimer);
        document.getElementById('levelIntroScreen').classList.remove('level-intro--fast-forward', 'level-intro--exiting');
        document.querySelectorAll('#levelIntroScreen .level-intro-rush-target').forEach(element => element.classList.remove('level-intro-rush-target'));
        this.levelIntroFastForwarding = false;
        this.levelIntroExiting = false;
        if (this.level === 'boss') {
            this.bossManager.reset();
            this.enterBossArena();
            return;
        }
        this.gameState = 'levelIntro';
        this.levelIntroReadyToStart = false;
        this.levelIntroReadyTimer = setTimeout(() => {
            if (this.gameState === 'levelIntro') this.levelIntroReadyToStart = true;
        }, 3500);
        document.getElementById('startLevelBtn').innerHTML = 'Start Level <span class="chevron-icon">❯</span>';
        this.showScreen('levelIntro');
        
        // Let a cutscene music fade complete before the intro track takes over.
        this.levelIntroMusicTimer = setTimeout(() => {
            if (this.gameState === 'levelIntro') this.audioManager.playMusic('levelIntro');
        }, musicDelay);
        
        // Update intro screen content
        const levelData = this.levelData[this.level];
        document.getElementById('introLevelNumber').textContent = `LEVEL ${this.level}`;
        document.getElementById('introLevelName').textContent = levelData.name.toUpperCase();
        document.getElementById('introLevelImage').src = levelData.image;
        document.getElementById('introLevelImage').alt = levelData.name;
    }

    fastForwardLevelIntro() {
        if (this.gameState !== 'levelIntro' || this.levelIntroFastForwarding) return;
        this.levelIntroFastForwarding = true;
        const introScreen = document.getElementById('levelIntroScreen');
        const introElements = introScreen.querySelectorAll('.level-number-container, .level-name-container, .level-image-container, .continue-prompt, .start-level-btn');
        introElements.forEach(element => {
            const animation = element.getAnimations()[0];
            if (animation && animation.currentTime > 0) {
                // Already-visible elements finish their current reveal without restarting.
                animation.playbackRate = 8;
            } else if (parseFloat(getComputedStyle(element).opacity) < .99) {
                element.classList.add('level-intro-rush-target');
            }
        });
        introScreen.classList.add('level-intro--fast-forward');
        this.levelIntroFastForwardTimer = setTimeout(() => {
            this.levelIntroFastForwarding = false;
            this.levelIntroReadyToStart = true;
        }, 550);
    }

    advanceLevelIntro() {
        if (this.gameState !== 'levelIntro') return;
        if (this.levelIntroReadyToStart) {
            this.exitLevelIntro();
            return;
        }
        this.fastForwardLevelIntro();
    }

    exitLevelIntro() {
        if (this.gameState !== 'levelIntro' || this.levelIntroExiting) return;
        clearTimeout(this.levelIntroReadyTimer);
        this.levelIntroReadyToStart = false;
        this.levelIntroExiting = true;
        const introScreen = document.getElementById('levelIntroScreen');
        introScreen.classList.add('level-intro--exiting');
        this.levelIntroExiting = false;
        this.startGameAfterIntro(true);
    }
    
    startGameAfterIntro(fromIntroTransition = false) {
        if (this.pendingBossIntro) {
            this.pendingBossIntro = false;
            this.gameState = fromIntroTransition ? 'levelTransition' : 'playing';
            if (fromIntroTransition) this.showGameplayCrossfade(); else this.showScreen('game');
            this.player.x = 110; this.pet.x = 60;
            this.player.y = -100; this.player.velocityY = 8; this.player.isGrounded = false;
            this.pet.y = -80; this.pet.velocityY = 8; this.pet.isGrounded = false;
            this.bossManager.enterArena();
            const beginBoss = () => {
                this.startBossFightTimer();
                if (this.audioManager.currentMusic !== this.audioManager.audio.bossFight) this.audioManager.playMusic('bossFight');
            };
            if (fromIntroTransition) this.finishGameplayCrossfade(beginBoss); else beginBoss();
            return;
        }
        // Reset game to initialize world with selected level
        this.resetGame();
        this.gameState = fromIntroTransition ? 'levelTransition' : 'playing';
        if (fromIntroTransition) this.showGameplayCrossfade(); else this.showScreen('game');
        this.updateLevelIndicator();
        
        const beginLevel = () => {
            this.initializeScoring();
            this.audioManager.playMusic('adventure');
            this.arrowManager.spawnInitialArrows(this.player);
        };
        if (fromIntroTransition) this.finishGameplayCrossfade(beginLevel); else beginLevel();
    }

    showGameplayCrossfade() {
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('game-screen--entering');
    }

    finishGameplayCrossfade(beginGameplay) {
        this.levelIntroExitTimer = setTimeout(() => {
            document.getElementById('levelIntroScreen').classList.add('hidden');
            document.getElementById('levelIntroScreen').classList.remove('level-intro--exiting');
            document.getElementById('gameScreen').classList.remove('game-screen--entering');
            this.gameState = 'playing';
            beginGameplay();
        }, 500);
    }
    
    resetGame() {
        // Cancel any pending game over sequence
        this.audioManager.cancelGameOverSequence();
        this.pendingLevelThreeBoss = false;
        
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
        this.postBossSurface = false;
        this.keepVictoryMusicForCompletion = false;
        this.surfaceCaveExit = null;
        this.postBossTempleCelebrated = false;
        
        // Reset castle position for current level
        this.setCastlePosition();
        
        // Reset managers
        this.effectsManager.reset();
        this.arrowManager.reset();
        this.enemyManager.reset();
        this.worldManager.setLevel(this.level);
        this.backgroundManager.setLevel(this.level);
        this.enemyManager.setLevel(this.level);
        this.bossManager.reset();
        
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
            'jungle-tree-6.png',
            'cave-exit.png'
        ];
        
        foregroundSprites.forEach(filename => {
            const img = new Image();
            img.src = `images/sprites/foreground/${filename}`;
            this.foregroundImages[filename] = img;
        });
    }
    
    cycleLevelSelector(direction = 1) {
        if (this.gameState !== 'menu') return;
        const selectableLevels = this.getUnlockedStages();
        const currentIndex = selectableLevels.indexOf(this.level);
        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
        this.level = selectableLevels[(safeIndex + direction + selectableLevels.length) % selectableLevels.length];
        this.updateLevelSelector();
        this.updateLevelIndicator();
    }
    
    updateLevelSelector() {
        const levelText = document.getElementById('levelSelectorText');
        levelText.textContent = this.level === 'boss' ? 'Boss Fight' : `L${this.level}: ${this.levelData[this.level].name}`;
    }

    setLevelSelectorVisible(visible) {
        const levelSelection = document.getElementById('levelSelection');
        const canChooseLevel = visible && (this.isDevelopmentMode() || this.unlockedStageCount > 1);
        levelSelection.classList.toggle('hidden', !canChooseLevel);
        levelSelection.querySelectorAll('button').forEach(button => { button.disabled = !canChooseLevel; });
    }

    getUnlockedStages() {
        const stages = [1, 2, 3, 'boss'];
        return this.isDevelopmentMode() ? stages : stages.slice(0, this.unlockedStageCount);
    }

    isDevelopmentMode() {
        return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    }

    unlockStage(stageCount) {
        const nextCount = Math.max(this.unlockedStageCount, Math.min(stageCount, 4));
        if (nextCount === this.unlockedStageCount) return;
        this.unlockedStageCount = nextCount;
        localStorage.setItem('armorOfGod_unlockedStageCount', String(nextCount));
        this.setLevelSelectorVisible(this.gameState === 'menu');
    }
    
    updateLevelIndicator() {
        const levelData = this.levelData[this.level];
        const levelInfo = document.getElementById('levelInfo');
        if (this.level === 'boss') {
            levelInfo.textContent = 'Boss Fight: Stone Golem';
        } else {
            levelInfo.textContent = `Level ${this.level}: ${levelData.name}`;
        }
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
            } else if (this.gameState === 'leaderboard') {
                this.audioManager.playMusic('hallOfHeroes');
            } else if (this.gameState === 'credits') {
                this.audioManager.playMusic('credits');
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
            'cutscene': 'cutsceneScreen',
            'game': 'gameScreen',
            'gameOver': 'gameOverScreen',
            'levelComplete': 'levelCompleteScreen',
            'leaderboard': 'leaderboardScreen',
            'credits': 'creditsScreen'
        };
        
        document.getElementById(screens[screenName]).classList.remove('hidden');
        // Level choice is available only on the initial/main-menu screen.  Keeping the
        // control out of every other screen prevents a live level swap from mismatching
        // the active world layout with its background.
        this.setLevelSelectorVisible(screenName === 'menu');
        document.body.classList.toggle('credits-active', screenName === 'credits');
        
        // Show the landing pose on the level-complete screen.
        if (screenName === 'levelComplete') {
            // Reset character alpha after screen transition
            this.player.alpha = 1;
            this.pet.alpha = 1;
            
            this.startVictoryRunningAnimation();
            const title = document.getElementById('levelCompleteTitle');
            const victoryImage = document.getElementById('victoryTempleImage');
            const subtitle = document.getElementById('levelCompleteSubtitle');
            const scripture = document.getElementById('levelCompleteScripture');
            if (this.pendingLevelThreeBoss) {
                if (title) title.textContent = 'Level Complete';
                if (victoryImage) { victoryImage.src = 'images/sprites/enemy/golem-stand.png'; victoryImage.alt = 'Stone Golem'; }
                if (subtitle) subtitle.textContent = '...but a wild stone golem is blocking the temple!';
                if (scripture) scripture.textContent = 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind';
            } else {
                if (title) title.textContent = 'Level Cleared';
                if (victoryImage) { victoryImage.src = './images/sprites/temple.png'; victoryImage.alt = 'Holy Temple'; }
                if (subtitle) subtitle.textContent = "You've made it safely to the House of the Lord!";
                if (scripture) scripture.textContent = '"Well done, thou good and faithful servant!"';
            }
            if (!this.pendingLevelThreeBoss && this.bossFightEndTime > 0) this.completedGameRun = true;
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
                levelScoreLabel.textContent = this.bossFightEndTime > 0 ? 'Boss Fight Score:' : `Level ${this.level} Score:`;
            }
        } else {
            this.stopVictoryRunningAnimation();
        }
        const nextLevelButton = document.getElementById('nextLevelBtn');
        if (nextLevelButton) {
            nextLevelButton.innerHTML = this.pendingLevelThreeBoss
                ? 'Continue to Boss Fight <span class="chevron-icon">❯</span>'
                : (this.level === 3 || this.level === 'boss' ? 'Go to Leaderboard <span class="chevron-icon">❯</span>' : 'Next Level <span class="chevron-icon">❯</span>');
        }
    }

    startCredits() {
        this.gameState = 'credits';
        this.isPaused = false;
        const hero = document.getElementById('creditsHero');
        if (hero) {
            const petType = this.selectedPetType === 'cat' ? 'cat' : 'dog';
            hero.src = `images/hero-credits-${petType}.png`;
            hero.alt = `Hero and ${petType} companion`;
        }
        this.showScreen('credits');
        this.audioManager.playMusic('credits');
        this.startCreditsSequence();
    }

    openFinalLeaderboard() {
        this.highScoreBoard.open(this.finalTotalScore || this.totalScore || 0);
    }

    startCreditsSequence() {
        clearTimeout(this.creditsEndTimer);
        clearTimeout(this.creditsSectionTimer);
        clearTimeout(this.creditsSectionCleanupTimer);
        this.creditsSectionIndex = 0;
        this.isAdvancingCreditsSection = false;
        this.creditsSections = Array.from(document.querySelectorAll('#creditsScreen .credits-roll > section'))
            .filter(section => section.textContent.trim() || section.querySelector('img'));
        this.creditsSections.forEach(section => section.classList.remove('credits-section--active', 'credits-section--leaving', 'credits-section--reverse'));
        document.querySelector('.credits-finale').classList.remove('credits-finale--visible');
        document.querySelector('.credits-progress').classList.remove('hidden');
        this.showCreditsSection();
    }

    showCreditsSection(reverse = false) {
        const section = this.creditsSections[this.creditsSectionIndex];
        if (!section) {
            this.showCreditsFinale();
            return;
        }
        const isTitle = section.classList.contains('credits-title');
        // Keep every credits card on screen 50% longer before automatically advancing.
        const duration = 10500;
        const progressDuration = 9000;
        this.currentCreditsSectionDuration = duration;
        this.currentCreditsProgressDuration = progressDuration;
        const progress = document.querySelector('.credits-progress');
        progress.style.setProperty('--credits-section-duration', `${progressDuration}ms`);
        progress.classList.remove('credits-progress--running');
        void progress.offsetWidth;
        progress.classList.add('credits-progress--running');
        section.classList.remove('credits-section--leaving');
        section.classList.toggle('credits-section--title', isTitle);
        section.classList.toggle('credits-section--reverse', reverse);
        section.style.setProperty('--credits-section-duration', `${duration}ms`);
        section.classList.add('credits-section--active');
        this.updateCreditsControls();
        clearTimeout(this.creditsSectionTimer);
        this.creditsSectionTimer = setTimeout(() => this.nextCreditsSection(true), progressDuration);
    }

    nextCreditsSection(isAutomatic = false) {
        if (this.gameState !== 'credits' || !this.creditsSections || this.isAdvancingCreditsSection) return;
        this.isAdvancingCreditsSection = true;
        clearTimeout(this.creditsSectionTimer);
        const section = this.creditsSections[this.creditsSectionIndex];
        if (section && !isAutomatic) {
            section.classList.remove('credits-section--active');
            section.classList.add('credits-section--leaving');
        }
        this.creditsSectionIndex++;
        this.isAdvancingCreditsSection = false;
        this.showCreditsSection();
        const cleanupDelay = isAutomatic
            ? this.currentCreditsSectionDuration - this.currentCreditsProgressDuration + 50
            : 700;
        clearTimeout(this.creditsSectionCleanupTimer);
        this.creditsSectionCleanupTimer = setTimeout(() => section?.classList.remove('credits-section--active', 'credits-section--leaving'), cleanupDelay);
    }

    previousCreditsSection() {
        if (this.gameState !== 'credits' || !this.creditsSections || this.isAdvancingCreditsSection || this.creditsSectionIndex === 0) return;
        clearTimeout(this.creditsSectionTimer);
        clearTimeout(this.creditsSectionCleanupTimer);
        this.isAdvancingCreditsSection = false;
        const currentSection = this.creditsSections[this.creditsSectionIndex];

        // If the finale is showing, return to the final credits card first.
        if (this.creditsSectionIndex >= this.creditsSections.length) {
            document.querySelector('.credits-finale').classList.remove('credits-finale--visible');
            document.querySelector('.credits-progress').classList.remove('hidden');
        }

        this.creditsSections.forEach(section => {
            if (section !== currentSection) section.classList.remove('credits-section--active', 'credits-section--leaving', 'credits-section--reverse', 'credits-section--leaving-back');
        });
        if (currentSection) {
            currentSection.classList.remove('credits-section--active', 'credits-section--reverse');
            currentSection.classList.add('credits-section--leaving-back');
            this.creditsSectionCleanupTimer = setTimeout(() => currentSection.classList.remove('credits-section--leaving-back'), 700);
        }
        this.creditsSectionIndex--;
        this.showCreditsSection(true);
    }

    updateCreditsControls() {
        const backControl = document.getElementById('creditsBackControl');
        if (backControl) backControl.classList.toggle('credits-control--disabled', this.creditsSectionIndex === 0);
    }

    showCreditsFinale() {
        document.querySelector('.credits-progress').classList.add('hidden');
        document.querySelector('.credits-finale').classList.add('credits-finale--visible');
        this.updateCreditsControls();
    }

    skipCredits() {
        if (this.gameState !== 'credits') return;
        clearTimeout(this.creditsEndTimer);
        clearTimeout(this.creditsSectionTimer);
        clearTimeout(this.creditsSectionCleanupTimer);
        this.isAdvancingCreditsSection = false;
        this.goToMainMenu();
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
        if (this.gameState === 'menu' || this.gameState === 'levelIntro' || this.gameState === 'levelTransition' || this.gameState === 'cutscene' || this.gameState === 'gameOver' || this.gameState === 'levelComplete') {
            return; // No game logic needed for menu/intro screens
        }
        
        if (this.gameState === 'bossCutscene') {
            this.bossManager.update(this);
            return;
        }

        // Handle input
        if (this.bossManager.state !== 'arenaFall') {
            this.inputHandler.handleInput(
                this.player,
                this.cameraX,
                this.worldManager.worldWidth,
                this.jumpPower,
                this.audioManager
            );
        }
        
        // Update physics
        this.updatePhysics();

        // Death is a hard pause for the encounter: stop AI/projectiles and preserve only the death freeze.
        if (this.gameState === 'dying') return;
        
        // Update managers
        if (!this.postBossSurface) {
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
        }
        
        if (!this.bossManager.active) {
            this.enemyManager.update(this.player, this.worldManager, this.gameState, this.cameraX, this.canvas.width, this.inputHandler, () => this.getCurrentJumpPower());
        } else {
            // A boss arena is intentionally self-contained: no projectile hazards carry over.
            this.arrowManager.reset();
            this.bossManager.update(this);
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

        // Boss-only recovery: queue a heart about every 30 seconds, then let the next
        // ground pound/earthquake knock it loose from the ceiling.
        if (this.bossManager.active && this.gameState === 'playing') {
            this.heartSpawnTimer++;
            if (this.heartSpawnTimer >= 1800) {
                this.heartSpawnTimer = 0;
                this.pendingBossHeartDrop = true;
            }
            this.worldManager.hearts = this.worldManager.hearts.filter(heart => {
                if (!heart.timed || heart.collected) return true;
                if (heart.phase === 'falling') {
                    heart.velocityY += .28;
                    heart.y += heart.velocityY;
                    if (heart.y >= 420) {
                        heart.y = 420;
                        heart.phase = 'landed';
                        heart.age = 0;
                    }
                    return true;
                }
                heart.age = (heart.age || 0) + 1;
                return heart.age < 300; // Five seconds after landing at 60fps.
            });
        } else {
            this.heartSpawnTimer = 0;
            this.pendingBossHeartDrop = false;
        }
        
        // Update floating scores
        this.updateFloatingScores();
        
        // Update player properties for UI
        this.player.levelTime = this.getLevelTime();
        this.player.bossFightTime = this.getBossFightTime();
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

        if (this.gameState === 'playing' && this.level === 3 && !this.bossManager.active && this.bossManager.checkForTrigger(this.player.x, this.player.y, this.castle.x, this.level)) {
            this.player.isMoving = false;
            this.player.velocityY = 0;
            this.player.isJumping = false;
            this.player.isGrounded = true;
            this.gameState = 'bossCutscene';
            this.arrowManager.reset();
            this.audioManager.playMusic('bossFight');
        }
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
        this.cameraX = this.bossManager.active ? 0 : Math.max(0, this.player.x - 300);
        // Let the companion celebrate the instant the distant temple comes into view.
        if (this.postBossSurface && !this.postBossTempleCelebrated &&
            this.castle.x < this.cameraX + this.canvas.width && this.castle.x + this.castle.width > this.cameraX) {
            this.postBossTempleCelebrated = true;
            if (this.pet.type === 'dog') {
                this.pet.velocityY = -9;
                this.pet.isGrounded = false;
                this.audioManager.playSound('bark1');
            }
        }
        
        
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

    preventPostBossFalls() {
        const feet = this.player.y + this.player.height;
        const platform = this.worldManager.platforms
            .filter(item => Math.abs(feet - item.y) < 40)
            .sort((a, b) => {
                const distance = item => Math.max(item.x - (this.player.x + this.player.width), this.player.x - (item.x + item.width), 0);
                return distance(a) - distance(b);
            })[0];
        if (!platform) return;
        const left = platform.x;
        const right = platform.x + platform.width - this.player.width;
        if (this.player.x < left) { this.player.x = left; this.player.blockedLeft = true; }
        if (this.player.x > right) { this.player.x = right; this.player.blockedRight = true; }
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
        
        if (this.bossManager.active) {
            this.bossManager.checkCollisions(this);
            this.collectHearts();
            if (this.bossManager.checkExit(this.player)) this.completeBossEncounter();
            return;
        }

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
                    this.addScore(200, '#8EE7FF', 'Armor Refill');
                    this.uiRenderer.showMessage('Armor Timer Reset!', 120, '#FFD700', 15, 400);
                }
            }
        });
        
        this.collectHearts();

        if (this.postBossSurface && this.surfaceCaveExit && this.checkCollision(this.player, this.surfaceCaveExit)) {
            this.returnToBossCave();
            return;
        }

        // Castle collision
        if (this.checkCollision(this.player, this.castle)) {
            this.levelComplete();
        }
    }

    collectHearts() {
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
    }

    dropBossHeartFromCeiling() {
        if (!this.pendingBossHeartDrop || !this.bossManager.active) return;
        const uncollectedHeartExists = this.worldManager.hearts.some(heart => !heart.collected && heart.timed);
        if (uncollectedHeartExists) return;
        const x = 120 + Math.random() * 930;
        this.worldManager.hearts.push({ x, y: -30, width: 30, height: 30, collected: false, healthRestore: 1, timed: true, phase: 'falling', velocityY: 1.5, age: 0 });
        this.pendingBossHeartDrop = false;
        this.audioManager.playSound('fallingRock');
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
            this.player.x = Math.max(0, Math.min(this.player.x, this.worldManager.worldWidth - this.player.width));
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

    showLevelThreeCompletion() {
        this.player.isMoving = false;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isGrounded = true;
        this.arrowManager.reset();
        this.levelEndTime = performance.now();
        this.pendingLevelThreeBoss = true;
        this.unlockStage(4);

        // Settle pending points and calculate the same completion bonuses used by other levels.
        this.floatingScores.forEach(indicator => {
            if (indicator.pendingPoints) this.score += indicator.pendingPoints;
        });
        this.floatingScores = [];
        this.finalLevelScore = this.score;
        this.finalTotalScore = this.totalScore + this.score;
        this.calculateAndDisplayBonuses();

        // The fall has finished. Keep this score reveal silent except for one heavy thud.
        this.audioManager.stopAllAudio();
        this.audioManager.playSound('thud3');
        this.gameState = 'levelComplete';
        this.showScreen('levelComplete');
    }

    continueToBossFight() {
        if (!this.pendingLevelThreeBoss) return;
        this.pendingLevelThreeBoss = false;
        this.totalScore = this.finalTotalScore || (this.totalScore + this.score);
        this.score = 0;
        this.enterBossArena();
    }

    enterBossArena() {
        // Reaching the boss means Level 3 has been cleared, so keep it selectable later.
        this.unlockStage(4);
        this.bossManager.active = true;
        this.bossFightCheckpoint = true;
        this.worldManager.createBossArena();
        this.enemyManager.reset();
        this.arrowManager.reset();
        this.player.x = 180; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.pet.x = 130; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.pendingBossIntro = true;
        this.gameState = 'levelIntro';
        this.showScreen('levelIntro');
        this.audioManager.playMusic('bossFight');
        document.getElementById('introLevelNumber').textContent = 'BOSS FIGHT';
        document.getElementById('introLevelName').textContent = 'STONE GOLEM';
        document.getElementById('introLevelImage').src = 'images/boss-fight.png';
        document.getElementById('introLevelImage').alt = 'Stone Golem boss fight';
        document.getElementById('startLevelBtn').innerHTML = 'Start Battle <span class="chevron-icon">❯</span>';
    }

    completeBossEncounter() {
        this.bossManager.active = false;
        // The cave exit opens into a peaceful temple clearing before the normal victory sequence.
        this.worldManager.createTempleClearing();
        this.backgroundManager.setLevel(3);
        // Start partway into the mountain sunrise so the surface opens on warm dawn light.
        this.backgroundManager.sunriseStartTime = Date.now() - 52000;
        // A long stepped ascent gives the sunrise and victory music room to breathe.
        this.castle = { x: 3900, y: 55, width: 240, height: 248, visualGroundOffset: 20 };
        this.player.x = 185; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.pet.x = 135; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.postBossSurface = true;
        this.postBossTempleCelebrated = false;
        this.surfaceCaveExit = { x: 95, y: 328, width: 80, height: 140 };
        this.gameState = 'playing';
        this.audioManager.playMusic('victory');
        this.uiRenderer.showMessage('The path to the temple is clear.', 180, '#FFD700');
    }

    returnToBossCave() {
        this.worldManager.createBossArena();
        this.bossManager.active = true;
        this.bossManager.state = 'dead';
        this.postBossSurface = false;
        this.surfaceCaveExit = null;
        this.postBossTempleCelebrated = false;
        this.player.x = 1060; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.pet.x = 1015; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.uiRenderer.showMessage('Back in the cave.', 120, '#FFD700');
    }

    bankScoreForBossFight() {
        // Score indicators normally resolve over several seconds. The arena intro pauses
        // that animation, so settle them before the transition and keep them in total score.
        this.floatingScores.forEach(indicator => {
            if (indicator.pendingPoints) this.score += indicator.pendingPoints;
        });
        this.floatingScores = [];
        this.totalScore += this.score;
        this.score = 0;
    }

    startBossFightTimer() {
        this.bossFightStartTime = performance.now();
        this.bossFightEndTime = 0;
    }

    finishBossFightTimer() {
        if (this.bossFightStartTime > 0 && this.bossFightEndTime === 0) this.bossFightEndTime = performance.now();
    }

    getBossFightTime() {
        if (this.bossFightStartTime === 0) return 0;
        return Math.floor(((this.bossFightEndTime || performance.now()) - this.bossFightStartTime) / 1000 * 60);
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
            this.audioManager.pauseCurrentMusic();
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
        this.armorTimer = this.armorDuration; // Start 15-second countdown
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
        this.audioManager.playMusic(this.bossManager.active ? 'bossFight' : 'adventure');
        
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
        if (this.bossFightCheckpoint) {
            this.retryCurrentLevel();
            return;
        }
        // Similar to resetGame but stay in playing mode
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.audioManager.playMusic('adventure');
        this.arrowManager.spawnInitialArrows(this.player);
        this.initializeScoring();
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
        if (this.bossFightCheckpoint) {
            this.restartBossFight();
            return;
        }
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

    restartBossFight() {
        this.bossManager.reset();
        this.bossManager.active = true;
        this.worldManager.createBossArena();
        this.enemyManager.reset();
        this.arrowManager.reset();
        this.player.x = 180; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.player.isJumping = false;
        this.player.health = this.player.maxHealth;
        this.player.invulnerable = false;
        this.player.invulnerabilityTimer = 0;
        this.player.fallingSoundPlayed = false;
        this.pet.x = 130; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.bossManager.enterArena();
        this.startBossFightTimer();
        this.initializeScoring();
        this.gameState = 'playing';
        this.showScreen('game');
        this.audioManager.playMusic('bossFight');
    }

    goToMainMenu() {
        // Keep the stage the player just exited, except after a completed full run.
        if (this.completedGameRun) this.level = 1;
        this.completedGameRun = false;
        this.bossFightCheckpoint = false;
        this.totalScore = 0; // Reset total score when going to main menu
        this.score = 0; // Reset level score
        this.resetGame();
        this.updateLevelSelector();
        this.audioManager.playMusic('menu');
        this.showScreen('menu');
    }
    
    gameOver(message) {
        this.gameState = 'gameOver';
        // Prevent a defeated player's background encounter from continuing behind this screen.
        this.bossManager.rocks = [];
        document.getElementById('gameOverMessage').textContent = message;
        this.showScreen('gameOver');
        
        // Play the new game over sequence (game over sound + song after delay)
        this.audioManager.playGameOverSequence();
    }
    
    levelComplete() {
        // A temple entered from a jump should wait for a natural landing, then use the
        // standard companion catch-up/trot sequence instead of snapping the player down.
        if (!this.player.isGrounded || this.player.velocityY !== 0) return;
        const wasPostBossSurface = this.postBossSurface;
        this.keepVictoryMusicForCompletion = wasPostBossSurface;
        this.postBossSurface = false;
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
        if (!this.keepVictoryMusicForCompletion) this.audioManager.playMusic('winner');
        
        // Don't reset alpha values here - let the fade effect continue
        // through the celebration until the level complete screen shows
        
        // Add bonuses immediately when celebration starts so they're visible
        this.calculateAndDisplayBonuses();
        if (this.level === 1) this.unlockStage(2);
        if (this.level === 2) this.unlockStage(3);
        if (this.level === 3) this.unlockStage(4);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing' && this.gameState !== 'levelTransition' && this.gameState !== 'dying' && this.gameState !== 'celebrating' && this.gameState !== 'enteringTemple' && this.gameState !== 'bossCutscene') {
            return;
        }
        
        // Render parallax background (not translated by camera)
        if (this.bossManager.active && this.bossManager.state !== 'cutscene') {
            this.worldManager.renderBossCave(this.ctx, this.cameraX, this.canvas.width, this.canvas.height, this.caveCrystalImages);
        } else {
            this.backgroundManager.render(this.ctx, this.cameraX, this.gameState);
        }
        
        const heavyBossShake = ['jumpPrep', 'finalPrep', 'finalLeap'].includes(this.bossManager.state);
        const shakeCap = heavyBossShake ? 28 : 12;
        const shakeOffset = this.bossManager.active && this.bossManager.shake > 0 ? (Math.random() - .5) * Math.min(shakeCap, this.bossManager.shake) : 0;
        this.ctx.save();
        this.ctx.translate(-this.cameraX + shakeOffset, -this.cameraY + shakeOffset);
        
        // Render world platforms and objects
        this.worldManager.renderPlatforms(this.ctx);
        this.worldManager.renderForegroundSprites(this.ctx, this.foregroundImages);
        // During the level-three collapse, mask only the broken ground and nearby scenery
        // before drawing the temple and falling characters over the opening.
        this.bossManager.renderFade(this.ctx, 0, this.bossManager.state === 'cutscene');
        if (!this.bossManager.active || this.bossManager.state === 'cutscene') {
            this.worldManager.renderTemple(this.ctx, this.templeImage, this.castle);
        }
        
        // Render game objects
        if (!this.bossManager.active) this.arrowManager.render(this.ctx);
        this.enemyManager.render(this.ctx);
        // The world has already been translated by cameraX, so the boss uses world coordinates here.
        this.bossManager.render(this.ctx, 0);
        this.worldManager.renderScriptureBooks(this.ctx, this.bomImage);
        this.worldManager.renderHearts(this.ctx, this.heartImage);
        
        // Render characters
        this.characterRenderer.renderPlayer(this.ctx, this.player, this.hasArmor, this.gameState, this.isPaused);
        this.characterRenderer.renderPet(this.ctx, this.pet, this.isPaused);
        if (this.gameState === 'bossCutscene') this.bossManager.renderCutsceneAlert(this.ctx, this.player);
        
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
            this.airborneKills,
            this.bossManager,
            this.heartImage
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

    loadUnlockedStageCount() {
        const saved = Number.parseInt(localStorage.getItem('armorOfGod_unlockedStageCount'), 10);
        return Number.isInteger(saved) && saved >= 1 && saved <= 4 ? saved : 1;
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
        
        runnersEl.classList.remove('running', 'level-three-pose');
        const petType = this.selectedPet === 'cat' ? 'cat' : 'dog';
        if (this.pendingLevelThreeBoss) {
            petImgEl.src = `images/sprites/main-char/${petType}-jump1.png`;
            playerImgEl.src = this.hasArmor ? 'images/sprites/main-char/armor-drop.png' : 'images/sprites/main-char/drop.png';
            runnersEl.classList.add('level-three-pose');
        } else {
            petImgEl.src = `images/sprites/main-char/${petType}-run1.png`;
            playerImgEl.src = 'images/sprites/main-char/run1.png';
            runnersEl.classList.add('running');
            let playerFrame = 0, petFrame = 0;
            this.victoryAnimationInterval = setInterval(() => {
                playerImgEl.src = `images/sprites/main-char/run${(playerFrame++ % 14) + 1}.png`;
                const frames = petType === 'cat' ? 4 : 5;
                petImgEl.src = `images/sprites/main-char/${petType}-run${(petFrame++ % frames) + 1}.png`;
            }, 80);
            setTimeout(() => {
                if (this.victoryAnimationInterval) {
                    clearInterval(this.victoryAnimationInterval);
                    this.victoryAnimationInterval = null;
                }
            }, 2560);
        }
        runnersEl.classList.remove('hidden');
    }
    
    stopVictoryRunningAnimation() {
        const runnersEl = document.getElementById('victoryRunners');
        
        if (runnersEl) {
            runnersEl.classList.add('hidden');
            runnersEl.classList.remove('running', 'level-three-pose');
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
