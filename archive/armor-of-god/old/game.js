// Armor of God Game - JavaScript Engine
class ArmorOfGodGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameOver, levelComplete, celebrating
        this.isPaused = false;
        this.hasArmor = false;
        this.level = 1;
        this.gameSpeed = 1; // Doubled for 2x faster gameplay
        this.cameraX = 0;
        
        // Load temple image
        this.templeImage = new Image();
        this.templeImage.src = 'images/temple.png';
        
        // Load Book of Mormon image
        this.bomImage = new Image();
        this.bomImage.src = 'images/bom.png';
        
        // Audio system
        this.audioEnabled = true;
        this.currentMusic = null;
        this.audioVolume = 0.5;
        
        // Load audio files with individual loop settings
        this.audio = {
            menu: new Audio('sounds/menu.mp3'),
            adventure: new Audio('sounds/adventure.mp3'),
            winner: new Audio('sounds/winner1.mp3'),
            gameOver: new Audio('sounds/game-over2.mp3'),
            jump: new Audio('sounds/jump.wav')
        };
        
        // Define loop and volume settings for each audio file
        const audioSettings = {
            menu: { loop: true, volume: 0.4 },
            adventure: { loop: true, volume: 0.4 },
            winner: { loop: false, volume: 0.4 },
            gameOver: { loop: false, volume: 0.4 },
            jump: { loop: false, volume: 0.6 } // Jump sound at 60%
        };
        
        // Apply settings to each audio file
        Object.keys(this.audio).forEach(key => {
            const settings = audioSettings[key];
            this.audio[key].loop = settings.loop;
            this.audio[key].volume = settings.volume;
        });
        
        // Celebration properties
        this.celebrationTimer = 0;
        this.celebrationDuration = 360; // 3 seconds at 60fps (doubled for 50% slower speed)
        this.fireworks = [];
        
        // Armor activation properties
        this.armorActivating = false;
        this.armorActivationTimer = 0;
        this.armorActivationDuration = 120; // 2 seconds at 60fps (doubled for 50% slower speed)
        this.armorExplosion = [];
        
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
            color: '#8b4513', // Default peasant brown
            armorColor: '#c0c0c0', // Silver armor
            // Animation properties
            animFrame: 0,
            animTimer: 0,
            animSpeed: 12, // Frames between animation changes (doubled for 50% slower speed)
            isMoving: false,
            // Health system
            health: 3,
            maxHealth: 3,
            invulnerable: false,
            invulnerabilityTimer: 0,
            invulnerabilityDuration: 120 // 2 seconds of invulnerability after being hit (doubled for 50% slower speed)
        };
        
        // Dog companion properties
        this.dog = {
            x: 100, // Start behind the player
            y: 440,
            width: 24,
            height: 20,
            velocityY: 0,
            isGrounded: true,
            targetX: 0, // Where the dog wants to be relative to player
            // Animation properties
            animFrame: 0,
            animTimer: 0,
            animSpeed: 10, // Slightly faster animation for energetic dog
            isMoving: false,
            // Dog behavior
            followDistance: 60, // How far behind the player the dog follows
            catchUpSpeed: 3.0, // Speed when catching up to player
            normalSpeed: 2.0 // Normal following speed
        };
        
        // World properties
        this.gravity = 0.42; // Reduced by 50% for slower gameplay
        this.jumpPower = -13.34; // 20% higher jump from -9.45
        this.groundY = 468;
        this.worldWidth = 6000; // Level width - doubled for longer gameplay
        
        // Game objects
        this.platforms = [];
        this.arrows = [];
        this.castle = { x: 5700, y: 220, width: 240, height: 248 }; // Adjusted for temple size
        this.clouds = [];
        this.scriptureBooks = [];
        this.booksCollected = 0;
        
        // Arrow spawning system
        this.arrowSpawnTimer = 0;
        this.arrowSpawnDelay = 42; // Spawn arrow every ~0.7 seconds at 60fps (much slower spawning)
        this.maxArrows = 30; // Maximum arrows on screen at once
        this.burstChance = 0.4; // 40% chance for burst spawning
        
        // Death system
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.deathFreezeTime = 120; // 1 second at 60fps (doubled for 50% slower speed)
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        this.setupMenuEvents();
        
        // Initialize game objects
        this.createPlatforms();
        this.createClouds();
        this.createScriptureBooks();
        this.spawnArrows();
        
        // Spawn some initial arrows to start the action immediately
        this.spawnInitialArrows();
        
        // Start game loop
        this.gameLoop();
        
        // Start menu music after a brief delay to ensure audio context is ready
        setTimeout(() => this.playMusic('menu'), 500);
    }
    
    setupEventListeners() {
        // Initialize key press tracking
        this.keysPressed = {};
        
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            // Handle pause toggle (only when playing)
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.togglePause();
                e.preventDefault();
                return;
            }
            
            // Track key presses (only true on first press, not while held)
            if (!this.keys[e.code]) {
                this.keysPressed[e.code] = true;
            }
            
            this.keys[e.code] = true;
            
            // Prevent scrolling
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysPressed[e.code] = false;
        });
        
        // Mouse events for audio button and pause menu buttons
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if click is on audio button
            if (this.audioButton && 
                x >= this.audioButton.x && 
                x <= this.audioButton.x + this.audioButton.width &&
                y >= this.audioButton.y && 
                y <= this.audioButton.y + this.audioButton.height) {
                this.toggleAudio();
                return;
            }
            
            // Check pause menu buttons (only when game is paused)
            if (this.isPaused && this.gameState === 'playing') {
                // Check restart level button
                if (this.pauseRestartButton && 
                    x >= this.pauseRestartButton.x && 
                    x <= this.pauseRestartButton.x + this.pauseRestartButton.width &&
                    y >= this.pauseRestartButton.y && 
                    y <= this.pauseRestartButton.y + this.pauseRestartButton.height) {
                    this.restartLevel();
                    return;
                }
                
                // Check main menu button
                if (this.pauseMainMenuButton && 
                    x >= this.pauseMainMenuButton.x && 
                    x <= this.pauseMainMenuButton.x + this.pauseMainMenuButton.width &&
                    y >= this.pauseMainMenuButton.y && 
                    y <= this.pauseMainMenuButton.y + this.pauseMainMenuButton.height) {
                    this.goToMainMenu();
                    return;
                }
            }
        });

        // Mouse move events for hover effects
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Track hover state for pause menu buttons
            if (this.isPaused && this.gameState === 'playing') {
                let hovered = false;
                
                // Check restart button hover
                if (this.pauseRestartButton && 
                    x >= this.pauseRestartButton.x && 
                    x <= this.pauseRestartButton.x + this.pauseRestartButton.width &&
                    y >= this.pauseRestartButton.y && 
                    y <= this.pauseRestartButton.y + this.pauseRestartButton.height) {
                    this.hoveredButton = 'restart';
                    hovered = true;
                }
                
                // Check main menu button hover
                if (this.pauseMainMenuButton && 
                    x >= this.pauseMainMenuButton.x && 
                    x <= this.pauseMainMenuButton.x + this.pauseMainMenuButton.width &&
                    y >= this.pauseMainMenuButton.y && 
                    y <= this.pauseMainMenuButton.y + this.pauseMainMenuButton.height) {
                    this.hoveredButton = 'mainMenu';
                    hovered = true;
                }
                
                if (!hovered) {
                    this.hoveredButton = null;
                }
                
                // Change cursor style
                this.canvas.style.cursor = hovered ? 'pointer' : 'default';
            } else {
                this.hoveredButton = null;
                this.canvas.style.cursor = 'default';
            }
        });
    }
    
    setupMenuEvents() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.hasArmor = false;
            this.player.color = '#8b4513';
            this.booksCollected = 0;
            this.startGame();
        });
        
        // Restart and menu buttons
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame(); // Go directly to game instead of menu
        });
        
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('menu');
        });
        
        document.getElementById('mainMenuBtn2').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('menu');
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            alert('More levels coming soon! Thanks for playing!');
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.showScreen('game');
        this.playMusic('adventure');
    }
    
    resetGame() {
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
        this.cameraX = 0;
        this.arrows = [];
        this.hasArmor = false;
        this.booksCollected = 0;
        this.arrowSpawnTimer = 0;
        this.arrowSpawnDelay = 46;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.celebrationTimer = 0;
        this.fireworks = [];
        this.armorActivating = false;
        this.armorActivationTimer = 0;
        this.armorExplosion = [];
        this.isPaused = false; // Reset pause state
        
        // Reset dog companion
        this.dog.x = 100;
        this.dog.y = 440;
        this.dog.velocityY = 0;
        this.dog.isGrounded = true;
        this.dog.animFrame = 0;
        this.dog.animTimer = 0;
        this.dog.isMoving = false;
        
        this.spawnArrows();
        this.createScriptureBooks();
        this.gameState = 'menu';
        
        // Play menu music when resetting to menu
        setTimeout(() => this.playMusic('menu'), 100);
    }
    
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show selected screen
        const screens = {
            'menu': 'menuScreen',
            'game': 'gameScreen',
            'gameOver': 'gameOverScreen',
            'levelComplete': 'levelCompleteScreen'
        };
        
        document.getElementById(screens[screenName]).classList.remove('hidden');
    }
    
    createPlatforms() {
        this.platforms = [
            // Main ground platforms - first half (original section)
            { x: 0, y: 468, width: 300, height: 135 },
            { x: 300, y: 468, width: 200, height: 135 },
            // GAP from 500-650 (150px pit)
            { x: 650, y: 468, width: 250, height: 135 },
            { x: 975, y: 468, width: 200, height: 135 },
            // GAP from 1175-1325 (150px pit)  
            { x: 1325, y: 468, width: 250, height: 135 },
            { x: 1650, y: 468, width: 200, height: 135 },
            { x: 1950, y: 468, width: 275, height: 135 },
            // GAP from 2225-2375 (150px pit)
            { x: 2375, y: 468, width: 250, height: 135 },
            { x: 2625, y: 468, width: 275, height: 135 },
            
            // Extended platforms - second half (armor testing section)
            { x: 3000, y: 468, width: 275, height: 135 },
            // GAP from 3275-3425 (150px pit)
            { x: 3425, y: 468, width: 200, height: 135 },
            { x: 3725, y: 468, width: 225, height: 135 },
            // GAP from 3950-4100 (150px pit)
            { x: 4100, y: 468, width: 200, height: 135 },
            { x: 4400, y: 468, width: 225, height: 135 },
            { x: 4725, y: 468, width: 200, height: 135 },
            // GAP from 4925-5075 (150px pit)
            { x: 5075, y: 468, width: 225, height: 135 },
            { x: 5400, y: 468, width: 200, height: 135 },
            { x: 5700, y: 468, width: 350, height: 135 }, // Temple platform (wider for temple)
            
            // Floating platforms - spread across both sections
            { x: 525, y: 375, width: 150, height: 30 },
            { x: 1125, y: 330, width: 180, height: 30 },
            { x: 1500, y: 360, width: 120, height: 30 },
            { x: 1800, y: 300, width: 150, height: 30 },
            { x: 2200, y: 350, width: 150, height: 30 },
            { x: 2800, y: 320, width: 120, height: 30 },
            { x: 3200, y: 380, width: 150, height: 30 },
            { x: 3600, y: 340, width: 180, height: 30 },
            { x: 4000, y: 310, width: 120, height: 30 },
            { x: 4400, y: 360, width: 150, height: 30 },
            { x: 4800, y: 330, width: 180, height: 30 },
            { x: 5200, y: 350, width: 120, height: 30 }
        ];
    }
    
    createClouds() {
        this.clouds = [
            { x: 200, y: 50, size: 60 },
            { x: 500, y: 80, size: 80 },
            { x: 800, y: 40, size: 50 },
            { x: 1200, y: 70, size: 70 },
            { x: 1600, y: 45, size: 65 },
            { x: 2000, y: 85, size: 55 },
            { x: 2400, y: 55, size: 75 },
            { x: 2800, y: 35, size: 60 },
            { x: 3200, y: 65, size: 70 },
            { x: 3600, y: 50, size: 55 },
            { x: 4000, y: 75, size: 80 },
            { x: 4400, y: 40, size: 65 },
            { x: 4800, y: 60, size: 70 },
            { x: 5200, y: 45, size: 60 },
            { x: 5600, y: 80, size: 75 }
        ];
    }
    
    createScriptureBooks() {
        this.scriptureBooks = [
            { x: 400, y: 415, width: 50, height: 50, collected: false, verse: "Faith" },
            { x: 1500, y: 305, width: 50, height: 50, collected: false, verse: "Truth" },
            { x: 2800, y: 265, width: 50, height: 50, collected: false, verse: "Righteousness" }
        ];
    }
    
    spawnArrows() {
        // Initialize with empty array - arrows will be spawned continuously during gameplay
        this.arrows = [];
    }
    
    spawnInitialArrows() {
        // Spawn 4-6 arrows at the start of the game for immediate action
        const initialArrowCount = 2 + Math.floor(Math.random() * 3); // 4-6 arrows
        
        for (let i = 0; i < initialArrowCount; i++) {
            // Stagger the initial arrows across different distances
            const spawnX = this.player.x + 400 + (i * 150) + Math.random() * 100;
            
            // Use the same arrow types as the main spawning system
            const arrowTypes = [
                { y: 440, speedX: -2.72, speedY: 0 }, // Ground level - duck under
                { y: 380, speedX: -3.27, speedY: 0 }, // Head height - duck under  
                { y: 460, speedX: -3.63, speedY: 0 }, // Low - duck under
                { y: 280, speedX: -2.72, speedY: 1.45 }, // High - jump over
                { y: 320, speedX: -2.18, speedY: 0.91 }, // Mid-high - jump over
                { y: 410, speedX: -3.99, speedY: 0 }, // Body level - duck under
                { y: 400, speedX: -3.03, speedY: 0.37 }, // Slightly arcing - duck under
                { y: 350, speedX: -2.66, speedY: 0.97 }, // Mid-arc - jump over
                { y: 450, speedX: -3.38, speedY: -0.24 }, // Dropping - duck under
            ];
            
            const arrowType = arrowTypes[Math.floor(Math.random() * arrowTypes.length)];
            
            const newArrow = {
                x: spawnX,
                y: arrowType.y,
                width: 40,
                height: 8,
                speedX: arrowType.speedX,
                speedY: arrowType.speedY,
                active: true
            };
            
            this.arrows.push(newArrow);
        }
    }
    
    spawnNewArrow(xOffset = 0) {
        // Only spawn if we're playing and haven't hit the max
        if (this.gameState !== 'playing' || this.arrows.filter(a => a.active).length >= this.maxArrows) {
            return;
        }
        
        // Spawn arrow ahead of the player with optional offset for bursts
        const spawnX = this.player.x + 800 + Math.random() * 400 + xOffset; // 800-1200 pixels ahead + offset
        
        // Don't spawn arrows beyond the castle
        if (spawnX > this.castle.x + 200) {
            return;
        }
        
        // Random arrow heights and speeds (reduced by 50% for slower gameplay)
        const arrowTypes = [
            { y: 440, speedX: -2.72, speedY: 0 }, // Ground level - duck under
            { y: 380, speedX: -3.27, speedY: 0 }, // Head height - duck under  
            { y: 460, speedX: -3.63, speedY: 0 }, // Low - duck under
            { y: 280, speedX: -2.72, speedY: 1.45 }, // High - jump over
            { y: 320, speedX: -2.18, speedY: 0.91 }, // Mid-high - jump over
            { y: 410, speedX: -3.99, speedY: 0 }, // Body level - duck under
            { y: 400, speedX: -3.03, speedY: 0.37 }, // Slightly arcing - duck under
            { y: 350, speedX: -2.66, speedY: 0.97 }, // Mid-arc - jump over
            { y: 450, speedX: -3.38, speedY: -0.24 }, // Dropping - duck under
        ];
        
        // Choose random arrow type
        const arrowType = arrowTypes[Math.floor(Math.random() * arrowTypes.length)];
        
        // Increase difficulty if player has armor
        const speedMultiplier = this.hasArmor ? 1.3 : 1.0;
        
        const newArrow = {
            x: spawnX,
            y: arrowType.y,
            width: 40,
            height: 8,
            speedX: arrowType.speedX * speedMultiplier,
            speedY: arrowType.speedY,
            active: true
        };
        
        this.arrows.push(newArrow);
    }
    
    handleInput() {
        if (this.gameState !== 'playing') return;
        
        // Horizontal movement (reduced by 50% for slower gameplay)
        this.player.isMoving = false;
        if (this.keys['ArrowLeft'] && this.player.x > this.cameraX) {
            this.player.x -= 2.42; // Reduced by 50% from 4.83
            this.player.isMoving = true;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.worldWidth - this.player.width) {
            this.player.x += 2.42; // Reduced by 50% from 4.83
            this.player.isMoving = true;
        }
        
        // Jumping
        if ((this.keysPressed['ArrowUp'] || this.keysPressed['Space']) && this.player.isGrounded && !this.player.isDucking) {
            this.player.velocityY = this.jumpPower;
            this.player.isJumping = true;
            this.player.isGrounded = false;
            this.playSoundEffect('jump');
            // Clear the key press flags so jump doesn't repeat
            this.keysPressed['ArrowUp'] = false;
            this.keysPressed['Space'] = false;
        }
        
        // Ducking
        this.player.isDucking = this.keys['ArrowDown'] && this.player.isGrounded;
    }
    
    updatePhysics() {
        // Handle death freeze and transition
        if (this.gameState === 'dying') {
            this.deathTimer++;
            if (this.deathTimer >= this.deathFreezeTime) {
                this.gameOver(this.deathMessage);
                this.isDying = false;
            }
            return; // Don't update physics while dying
        }
        
        if (this.gameState !== 'playing') return;
        
        // Update armor activation
        this.updateArmorActivation();
        
        // Update invulnerability timer
        if (this.player.invulnerable) {
            this.player.invulnerabilityTimer++;
            if (this.player.invulnerabilityTimer >= this.player.invulnerabilityDuration) {
                this.player.invulnerable = false;
                this.player.invulnerabilityTimer = 0;
            }
        }
        
        // Apply gravity
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Check if player has fallen into a pit
        if (this.player.y > this.canvas.height + 50 && !this.isFallingToDeath) {
            // Player has fallen completely off screen - immediate death
            this.gameOver('You fell into a pit! Stay on the platforms to survive.');
            return;
        }
        
        // Ground collision - but only if player is on a platform
        if (this.player.y >= this.groundY) {
            // Check if player is horizontally on any ground-level platform
            let onGroundPlatform = false;
            for (let platform of this.platforms) {
                if (platform.y === this.groundY && 
                    this.player.x + this.player.width > platform.x && 
                    this.player.x < platform.x + platform.width) {
                    onGroundPlatform = true;
                    break;
                }
            }
            
            if (onGroundPlatform) {
                this.player.y = this.groundY;
                this.player.velocityY = 0;
                this.player.isGrounded = true;
                this.player.isJumping = false;
            }
            // If not on a platform, let player continue falling (into pit)
        }
        
        // Platform collisions
        this.platforms.forEach(platform => {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // Landing on top of platform
                if (this.player.velocityY > 0 && this.player.y < platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isGrounded = true;
                    this.player.isJumping = false;
                }
            }
        });
        
        // Update camera to follow player
        this.cameraX = Math.max(0, this.player.x - 300);
        
        // Update player animation
        if (this.player.isMoving && this.player.isGrounded) {
            this.player.animTimer++;
            if (this.player.animTimer >= this.player.animSpeed) {
                this.player.animFrame = (this.player.animFrame + 1) % 4; // 4 frame walk cycle
                this.player.animTimer = 0;
            }
        } else {
            this.player.animFrame = 0; // Standing still frame
            this.player.animTimer = 0;
        }
        
        // Update dog companion
        this.updateDog();
        
        // Update arrows
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                arrow.x += arrow.speedX;
                arrow.y += arrow.speedY;
                
                // Remove arrows that go off screen
                if (arrow.x < this.cameraX - 100 || arrow.x > this.cameraX + this.canvas.width + 100) {
                    arrow.active = false;
                }
            }
        });
        
        // Clean up inactive arrows periodically
        if (Math.random() < 0.02) { // 2% chance each frame
            this.arrows = this.arrows.filter(arrow => arrow.active);
        }
        
        // Spawn new arrows continuously
        this.arrowSpawnTimer++;
        if (this.arrowSpawnTimer >= this.arrowSpawnDelay) {
            // Determine how many arrows to spawn this time
            let arrowsToSpawn = 1;
            
            // Random burst spawning
            if (Math.random() < this.burstChance) {
                arrowsToSpawn = 2 + Math.floor(Math.random() * 2); // 2-3 arrows in burst
            }
            
            // Double arrow spawn rate when player has God's armor (increased difficulty)
            if (this.hasArmor) {
                arrowsToSpawn *= 2; // Double the number of arrows
                // Also add occasional extra arrow for more challenge
                if (Math.random() < 0.3) {
                    arrowsToSpawn += 1;
                }
            }
            
            // Spawn the arrows
            for (let i = 0; i < arrowsToSpawn; i++) {
                this.spawnNewArrow(i * 100); // Offset each arrow in burst by 100px
            }
            
            this.arrowSpawnTimer = 0;
            
            // Vary spawn rate for more randomness - much slower overall
            this.arrowSpawnDelay = 42 + Math.random() * 58; // 0.7 to 1.67 seconds
        }
    }
    
    updateDog() {
        if (this.gameState !== 'playing') return;
        
        // Calculate desired position (behind player)
        const targetX = this.player.x - this.dog.followDistance;
        const distanceToTarget = Math.abs(this.dog.x - targetX);
        
        // Dog following behavior
        if (distanceToTarget > 10) { // Only move if significantly far from target
            this.dog.isMoving = true;
            
            // Determine speed based on distance
            let speed = this.dog.normalSpeed;
            if (distanceToTarget > 120) {
                speed = this.dog.catchUpSpeed; // Speed up when far behind
            }
            
            // Check for pits ahead before moving
            const moveDirection = this.dog.x < targetX ? 1 : -1;
            const shouldJump = this.shouldDogJump(moveDirection, speed);
            
            // Jump over pits if needed
            if (shouldJump && this.dog.isGrounded) {
                this.dog.velocityY = this.jumpPower * 0.8; // Dog jumps slightly lower than player
                this.dog.isGrounded = false;
            }
            
            // Move toward target
            if (this.dog.x < targetX) {
                this.dog.x += speed;
            } else if (this.dog.x > targetX) {
                this.dog.x -= speed;
            }
        } else {
            this.dog.isMoving = false;
        }
        
        // Apply gravity to dog
        this.dog.velocityY += this.gravity;
        this.dog.y += this.dog.velocityY;
        
        // Ground collision for dog
        if (this.dog.y >= this.groundY) {
            // Check if dog is horizontally on any ground-level platform
            let onGroundPlatform = false;
            for (let platform of this.platforms) {
                if (platform.y === this.groundY && 
                    this.dog.x + this.dog.width > platform.x && 
                    this.dog.x < platform.x + platform.width) {
                    onGroundPlatform = true;
                    break;
                }
            }
            
            if (onGroundPlatform) {
                this.dog.y = this.groundY;
                this.dog.velocityY = 0;
                this.dog.isGrounded = true;
            }
        }
        
        // Platform collisions for dog
        this.platforms.forEach(platform => {
            if (this.dog.x < platform.x + platform.width &&
                this.dog.x + this.dog.width > platform.x &&
                this.dog.y < platform.y + platform.height &&
                this.dog.y + this.dog.height > platform.y) {
                
                // Landing on top of platform
                if (this.dog.velocityY > 0 && this.dog.y < platform.y) {
                    this.dog.y = platform.y - this.dog.height;
                    this.dog.velocityY = 0;
                    this.dog.isGrounded = true;
                }
            }
        });
        
        // Update dog animation
        if (this.dog.isMoving && this.dog.isGrounded) {
            this.dog.animTimer++;
            if (this.dog.animTimer >= this.dog.animSpeed) {
                this.dog.animFrame = (this.dog.animFrame + 1) % 4; // 4 frame walk cycle
                this.dog.animTimer = 0;
            }
        } else {
            this.dog.animFrame = 0; // Standing still frame
            this.dog.animTimer = 0;
        }
    }
    
    shouldDogJump(moveDirection, speed) {
        if (!this.dog.isGrounded) return false;
        
        // Look ahead to see if there's a pit or gap
        const lookAheadDistance = 40; // How far ahead to check for gaps
        const checkX = this.dog.x + (moveDirection * lookAheadDistance);
        const checkY = this.dog.y + this.dog.height + 10; // Check slightly below dog's feet
        
        // Check if there's ground ahead at the projected position
        let groundAhead = false;
        
        // Check ground-level platforms
        for (let platform of this.platforms) {
            if (platform.y === this.groundY && 
                checkX + this.dog.width > platform.x && 
                checkX < platform.x + platform.width &&
                checkY >= platform.y && checkY <= platform.y + platform.height) {
                groundAhead = true;
                break;
            }
        }
        
        // Check elevated platforms
        if (!groundAhead) {
            for (let platform of this.platforms) {
                if (platform.y < this.groundY && 
                    checkX + this.dog.width > platform.x && 
                    checkX < platform.x + platform.width &&
                    checkY >= platform.y && checkY <= platform.y + platform.height) {
                    groundAhead = true;
                    break;
                }
            }
        }
        
        // If no ground ahead and dog is moving, it should jump
        return !groundAhead && this.dog.isMoving;
    }
    
    checkCollisions() {
        if (this.gameState !== 'playing' && this.gameState !== 'dying') return;
        
        // Check arrow collisions
        this.arrows.forEach(arrow => {
            // Create proper hitbox for player (including head and ducking state)
            const playerHitbox = {
                x: this.player.x,
                y: this.player.isDucking ? this.player.y + this.player.height * 0.2 : this.player.y - 16,
                width: this.player.width,
                height: this.player.isDucking ? this.player.height * 0.8 + 16 : this.player.height + 16
            };
            
            if (arrow.active && this.checkCollision(playerHitbox, arrow) && !this.player.invulnerable) {
                if (this.hasArmor) {
                    // Arrow bounces off armor
                    arrow.speedX = -arrow.speedX;
                    arrow.speedY = -2; // Bounce up
                } else {
                    // Player takes damage
                    this.takeDamage();
                    arrow.active = false; // Remove the arrow that hit
                }
            }
        });
        
        // Check scripture book collisions
        this.scriptureBooks.forEach(book => {
            if (!book.collected && this.checkCollision(this.player, book)) {
                book.collected = true;
                this.booksCollected++;
                
                // If player collected 3 books, give them armor
                if (this.booksCollected >= 3 && !this.hasArmor) {
                    this.activateArmor();
                }
            }
        });
        
        // Check castle collision (level complete)
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
    
    isOnPlatform() {
        // Check if player is standing on any platform or ground
        const playerBottom = this.player.y + this.player.height;
        const tolerance = 10; // Small tolerance for platform detection
        
        // Check ground level
        if (Math.abs(playerBottom - this.groundY) <= tolerance) {
            // Check if player is horizontally on a platform at ground level
            for (let platform of this.platforms) {
                if (platform.y === this.groundY && 
                    this.player.x + this.player.width > platform.x && 
                    this.player.x < platform.x + platform.width) {
                    return true;
                }
            }
            return false; // Player is at ground level but not on a platform (in a gap)
        }
        
        // Check floating platforms
        for (let platform of this.platforms) {
            if (Math.abs(playerBottom - platform.y) <= tolerance &&
                this.player.x + this.player.width > platform.x && 
                this.player.x < platform.x + platform.width) {
                return true;
            }
        }
        
        return false;
    }
    
    startDeath(message) {
        if (!this.isDying) {
            this.isDying = true;
            this.deathTimer = 0;
            this.deathMessage = message;
            this.gameState = 'dying'; // New intermediate state
        }
    }
    
    takeDamage() {
        if (this.player.invulnerable) return; // Already invulnerable
        
        this.player.health--;
        this.player.invulnerable = true;
        this.player.invulnerabilityTimer = 0;
        
        if (this.player.health <= 0) {
            // Player dies when health reaches 0
            this.startDeath('You have been struck down! Seek the armor of God for protection.');
        }
        // If player still has health, they just take damage and become invulnerable briefly
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        // Pause/resume current music
        if (this.currentMusic) {
            if (this.isPaused) {
                this.currentMusic.pause();
            } else {
                this.playCurrentMusic();
            }
        }
    }
    
    restartLevel() {
        // Reset game to starting state but stay in playing mode
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
        this.cameraX = 0;
        this.arrows = [];
        this.hasArmor = false;
        this.booksCollected = 0;
        this.arrowSpawnTimer = 0;
        this.arrowSpawnDelay = 42;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.celebrationTimer = 0;
        this.fireworks = [];
        this.armorActivating = false;
        this.armorActivationTimer = 0;
        this.armorExplosion = [];
        this.isPaused = false; // Unpause the game
        
        // Reset dog companion
        this.dog.x = 100;
        this.dog.y = 440;
        this.dog.velocityY = 0;
        this.dog.isGrounded = true;
        this.dog.animFrame = 0;
        this.dog.animTimer = 0;
        this.dog.isMoving = false;
        
        // Reset game objects
        this.spawnArrows();
        this.createScriptureBooks();
        this.spawnInitialArrows();
        
        // Continue with adventure music
        this.playMusic('adventure');
    }
    
    goToMainMenu() {
        // Reset game and go to menu
        this.resetGame();
        this.showScreen('menu');
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        
        if (!this.audioEnabled) {
            // Stop all music
            Object.values(this.audio).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            this.currentMusic = null;
        } else {
            // Resume appropriate music for current state
            this.playMusicForState();
        }
    }
    
    playMusic(musicKey) {
        if (!this.audioEnabled) return;
        
        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        // Start new music
        const newMusic = this.audio[musicKey];
        if (newMusic) {
            this.currentMusic = newMusic;
            this.playCurrentMusic();
        }
    }
    
    playCurrentMusic() {
        if (this.currentMusic && this.audioEnabled && !this.isPaused) {
            this.currentMusic.play().catch(e => {
                console.log('Audio play failed:', e);
            });
        }
    }
    
    playSoundEffect(soundKey) {
        if (!this.audioEnabled) return;
        
        const sound = this.audio[soundKey];
        if (sound) {
            // Clone the audio to allow multiple simultaneous plays
            const soundClone = sound.cloneNode();
            soundClone.volume = 0.3; // Lower volume for sound effects
            soundClone.loop = false; // Ensure sound effects don't loop
            
            // Auto-stop the sound when it ends to prevent any repeats
            soundClone.addEventListener('ended', () => {
                soundClone.pause();
                soundClone.currentTime = 0;
            });
            
            soundClone.play().catch(e => {
                console.log('Sound effect play failed:', e);
            });
        }
    }
    
    playMusicForState() {
        if (!this.audioEnabled) return;
        
        switch (this.gameState) {
            case 'menu':
                this.playMusic('menu');
                break;
            case 'playing':
                this.playMusic('adventure');
                break;
            case 'levelComplete':
            case 'celebrating':
                this.playMusic('winner');
                break;
            case 'gameOver':
                this.playMusic('gameOver');
                break;
        }
    }
    
    activateArmor() {
        this.hasArmor = true;
        this.player.color = this.player.armorColor;
        this.armorActivating = true;
        this.armorActivationTimer = 0;
        this.createArmorExplosion();
    }
    
    createArmorExplosion() {
        // Create explosion particles around the player
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 1.4 + Math.random() * 2.1;
            
            this.armorExplosion.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 15,
                maxLife: 30 + Math.random() * 15,
                color: ['#FFD700', '#FFF700', '#FFFF00', '#C0C0C0', '#FFFFFF'][Math.floor(Math.random() * 5)],
                size: 4 + Math.random() * 4
            });
        }
    }
    
    updateArmorActivation() {
        if (this.armorActivating) {
            this.armorActivationTimer++;
            
            // Update explosion particles
            this.armorExplosion = this.armorExplosion.filter(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity (reduced by 50% for slower speed)
                particle.vx *= 0.98; // Air resistance
                particle.life--;
                return particle.life > 0;
            });
            
            // End armor activation
            if (this.armorActivationTimer >= this.armorActivationDuration) {
                this.armorActivating = false;
                this.armorExplosion = [];
            }
        }
    }
    
    gameOver(message) {
        this.gameState = 'gameOver';
        document.getElementById('gameOverMessage').textContent = message;
        this.showScreen('gameOver');
        this.playMusic('gameOver');
        setTimeout(() => {
            this.currentMusic.pause();
        }, 4000);
    }
    
    levelComplete() {
        this.gameState = 'celebrating';
        this.celebrationTimer = 0;
        this.fireworks = [];
        // Start celebration fireworks
        this.initializeFireworks();
        // Play victory music
        this.playMusic('winner');
    }
    
    initializeFireworks() {
        // Create multiple firework bursts around the temple
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createFireworkBurst();
            }, i * 300); // Stagger the fireworks (doubled for 50% slower speed)
        }
    }
    
    createFireworkBurst() {
        const centerX = this.castle.x + this.castle.width / 2 + Math.random() * 400 - 200;
        const centerY = this.castle.y + Math.random() * 200 - 100;
        
        // Create multiple particles for each burst - MORE particles for bigger effect
        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 * i) / 40;
            const speed = 2.8 + Math.random() * 4.2; // Reduced by 50% for slower speed
            
            this.fireworks.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 45 + Math.random() * 23, // Shorter duration for 2x speed
                maxLife: 45 + Math.random() * 23,
                color: this.getGoldFireworkColor(),
                size: 10 + Math.random() * 4 // Random base size 4-8
            });
        }
    }
    
    getGoldFireworkColor() {
        const colors = [
            '#FFFF00', // Bright yellow
            '#FFD700', // Gold  
            '#FFF700', // Bright gold
            '#FFEA00', // Golden yellow
            '#FFB000', // Bright orange-gold
            '#FFFFFF'  // Pure white for extra brightness
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateCelebration() {
        this.celebrationTimer++;
        
        // Update fireworks
        this.fireworks = this.fireworks.filter(firework => {
            firework.x += firework.vx;
            firework.y += firework.vy;
            firework.vy += 0.1; // Gravity (reduced by 50% for slower speed)
            firework.vx *= 0.99; // Air resistance
            firework.life--;
            return firework.life > 0;
        });
        
        // End celebration and show victory screen
        if (this.celebrationTimer >= this.celebrationDuration) {
            this.gameState = 'levelComplete';
            this.showScreen('levelComplete');
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only render game world for playing, dying, and celebrating states
        if (this.gameState !== 'playing' && this.gameState !== 'dying' && this.gameState !== 'celebrating') {
            return;
        }
        
        // Save context for camera translation
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Draw simple sky blue background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(this.cameraX, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.ctx.fillStyle = '#FFFFFF';
        this.clouds.forEach(cloud => {
            // Simple pixelated cloud design
            const cloudX = cloud.x;
            const cloudY = cloud.y;
            const size = cloud.size;
            
            // Main cloud body
            this.ctx.fillRect(cloudX, cloudY + size/4, size, size/2);
            this.ctx.fillRect(cloudX + size/4, cloudY, size/2, size);
            
            // Cloud bumps
            this.ctx.fillRect(cloudX + size/8, cloudY + size/8, size/4, size/4);
            this.ctx.fillRect(cloudX + size*5/8, cloudY + size/8, size/4, size/4);
            this.ctx.fillRect(cloudX + size/6, cloudY + size*5/8, size/3, size/4);
            this.ctx.fillRect(cloudX + size/2, cloudY + size*5/8, size/3, size/4);
        });
        
        // Draw platforms (grass)
        this.ctx.fillStyle = '#228B22';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add grass texture
            this.ctx.fillStyle = '#32CD32';
            for (let i = 0; i < platform.width; i += 10) {
                this.ctx.fillRect(platform.x + i, platform.y, 2, 5);
                this.ctx.fillRect(platform.x + i + 4, platform.y, 2, 8);
            }
            this.ctx.fillStyle = '#228B22';
        });
        
        // Draw temple
        if (this.templeImage.complete) {
            this.ctx.drawImage(this.templeImage, this.castle.x, this.castle.y, this.castle.width, this.castle.height);
        } else {
            // Fallback if image isn't loaded yet
            this.ctx.fillStyle = '#D4AF37'; // Gold color for temple
            this.ctx.fillRect(this.castle.x, this.castle.y, this.castle.width, this.castle.height);
        }
        
        // Draw arrows
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                // Arrow shaft (brown wood)
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(arrow.x + 6, arrow.y + 2, arrow.width - 12, arrow.height - 4);
                
                // Silver pointed arrowhead (triangle) - pointing LEFT since arrows fly left
                this.ctx.fillStyle = '#C0C0C0';
                // Main arrowhead body (at the left end)
                this.ctx.fillRect(arrow.x, arrow.y, 10, arrow.height);
                // Pointed tip triangle (extending left from main body)
                this.ctx.fillRect(arrow.x - 2, arrow.y + 1, 2, arrow.height - 2);
                this.ctx.fillRect(arrow.x - 4, arrow.y + 2, 2, arrow.height - 4);
                this.ctx.fillRect(arrow.x - 6, arrow.y + 3, 2, arrow.height - 6);
                
                // Red feather fletching at back (right end)
                this.ctx.fillStyle = '#DC143C'; // Crimson red
                // Upper feather
                this.ctx.fillRect(arrow.x + arrow.width - 8, arrow.y - 2, 8, 3);
                this.ctx.fillRect(arrow.x + arrow.width - 6, arrow.y - 3, 4, 2);
                // Lower feather  
                this.ctx.fillRect(arrow.x + arrow.width - 8, arrow.y + arrow.height - 1, 8, 3);
                this.ctx.fillRect(arrow.x + arrow.width - 6, arrow.y + arrow.height + 1, 4, 2);
                
                // Feather details (darker red)
                this.ctx.fillStyle = '#B22222';
                this.ctx.fillRect(arrow.x + arrow.width - 7, arrow.y - 1, 1, 2);
                this.ctx.fillRect(arrow.x + arrow.width - 5, arrow.y - 2, 1, 1);
                this.ctx.fillRect(arrow.x + arrow.width - 3, arrow.y - 1, 1, 1);
                this.ctx.fillRect(arrow.x + arrow.width - 7, arrow.y + arrow.height, 1, 2);
                this.ctx.fillRect(arrow.x + arrow.width - 5, arrow.y + arrow.height + 1, 1, 1);
                this.ctx.fillRect(arrow.x + arrow.width - 3, arrow.y + arrow.height, 1, 1);
            }
        });
        
        // Draw scripture books
        this.scriptureBooks.forEach(book => {
            if (!book.collected) {
                // Floating effect (simple up/down animation)
                const time = Date.now() * 0.002;
                const floatY = Math.sin(time + book.x * 0.01) * 2;
                
                this.ctx.save();
                this.ctx.translate(0, floatY);
                
                // Draw Book of Mormon image if loaded, otherwise fallback to simple design
                if (this.bomImage.complete) {
                    this.ctx.drawImage(this.bomImage, book.x, book.y, book.width, book.height);
                } else {
                    // Fallback: Simple black book with gold cross
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(book.x, book.y, book.width, book.height);
                    
                    // Gold cross symbol on cover
                    this.ctx.fillStyle = '#FFD700';
                    const centerX = book.x + book.width / 2;
                    const centerY = book.y + book.height / 2;
                    // Vertical line of cross
                    this.ctx.fillRect(centerX - 1, book.y + 3, 2, book.height - 6);
                    // Horizontal line of cross
                    this.ctx.fillRect(book.x + 4, centerY - 1, book.width - 8, 2);
                }
                
                this.ctx.restore();
            }
        });
        
        // Draw player (enhanced pixelated character)
        // Apply flashing effect when invulnerable
        const shouldFlash = this.player.invulnerable && Math.floor(this.player.invulnerabilityTimer / 4) % 2 === 0;
        if (shouldFlash) {
            this.ctx.globalAlpha = 0.5; // Make player semi-transparent when flashing
        }
        
        const playerHeight = this.player.isDucking ? this.player.height * 0.7 : this.player.height;
        const playerY = this.player.isDucking ? this.player.y + this.player.height * 0.3 : this.player.y;
        const headY = this.player.isDucking ? this.player.y + this.player.height * 0.2 : this.player.y - 16;
        
        // Player head (larger and more detailed)
        this.ctx.fillStyle = '#FDBCB4';
        this.ctx.fillRect(this.player.x + 8, headY, 16, 16);
        
        // Hair/head covering or helmet
        if (this.hasArmor) {
            // Helmet of Salvation
            this.ctx.fillStyle = '#C0C0C0'; // Silver helmet
            this.ctx.fillRect(this.player.x + 6, headY - 2, 20, 10); // Main helmet
            
            // Helmet details
            this.ctx.fillStyle = '#A9A9A9'; // Darker silver for depth
            this.ctx.fillRect(this.player.x + 6, headY - 2, 20, 2); // Top rim
            this.ctx.fillRect(this.player.x + 6, headY + 6, 20, 2); // Bottom rim
            
            // Face guard/visor opening
            this.ctx.fillStyle = '#2F2F2F'; // Dark opening
            this.ctx.fillRect(this.player.x + 8, headY + 2, 16, 4);
            
            // Cross emblem on forehead
            this.ctx.fillStyle = '#FFD700'; // Gold cross
            this.ctx.fillRect(this.player.x + 14, headY - 1, 4, 3); // Vertical
            this.ctx.fillRect(this.player.x + 12, headY, 8, 1); // Horizontal
        } else {
            // Regular hair
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(this.player.x + 8, headY, 16, 6);
        }
        
        // Eyes (simple black pixels) - visible through helmet visor or normally
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.player.x + 10, headY + 4, 2, 2);
        this.ctx.fillRect(this.player.x + 20, headY + 4, 2, 2);
        
        // Animated Arms
        this.ctx.fillStyle = '#FDBCB4';
        
        if (this.player.isJumping || !this.player.isGrounded) {
            // Mario-style jumping pose - right hand up, left hand at side
            // Right arm raised up (Mario style)
            this.ctx.fillRect(this.player.x + 28, playerY - 8, 8, 16); // Upper arm raised
            this.ctx.fillRect(this.player.x + 32, playerY - 16, 8, 12); // Forearm raised higher
            
            // Left arm at side
            this.ctx.fillRect(this.player.x - 4, playerY + 4, 8, 20); // Left arm normal position
        } else if (this.player.isMoving && this.player.isGrounded && !this.player.isDucking) {
            // Arm swing animation (opposite to legs)
            let leftArmOffset = 0;
            let rightArmOffset = 0;
            
            switch (this.player.animFrame) {
                case 0:
                    leftArmOffset = 0;
                    rightArmOffset = 0;
                    break;
                case 1: // Left leg forward, so right arm forward
                    leftArmOffset = -1;
                    rightArmOffset = 1;
                    break;
                case 2:
                    leftArmOffset = 0;
                    rightArmOffset = 0;
                    break;
                case 3: // Right leg forward, so left arm forward
                    leftArmOffset = 1;
                    rightArmOffset = -1;
                    break;
            }
            
            this.ctx.fillRect(this.player.x - 4 + leftArmOffset, playerY + 4, 8, 20); // Left arm
            this.ctx.fillRect(this.player.x + 28 + rightArmOffset, playerY + 4, 8, 20); // Right arm
        } else {
            // Static arms when not moving
            this.ctx.fillRect(this.player.x - 4, playerY + 4, 8, 20); // Left arm
            this.ctx.fillRect(this.player.x + 28, playerY + 4, 8, 20); // Right arm
        }
        
        // Player torso
        if (this.hasArmor) {
            // Armored torso
            this.ctx.fillStyle = '#C0C0C0'; // Silver armor
            this.ctx.fillRect(this.player.x + 4, playerY, 24, 28);
            
            // Armor details
            this.ctx.fillStyle = '#FFD700'; // Gold trim
            this.ctx.fillRect(this.player.x + 6, playerY + 2, 20, 3); // Top trim
            this.ctx.fillRect(this.player.x + 6, playerY + 12, 20, 2); // Middle trim
            this.ctx.fillRect(this.player.x + 6, playerY + 22, 20, 3); // Bottom trim
            
            // Cross emblem on chest
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(this.player.x + 14, playerY + 6, 4, 12); // Vertical
            this.ctx.fillRect(this.player.x + 10, playerY + 10, 12, 4); // Horizontal
            
            // Shoulder guards
            this.ctx.fillStyle = '#C0C0C0';
            this.ctx.fillRect(this.player.x - 2, playerY + 2, 6, 12);
            this.ctx.fillRect(this.player.x + 28, playerY + 2, 6, 12);
            
            // Armored sleeves (animated)
            this.ctx.fillStyle = '#A9A9A9';
            if (this.player.isJumping || !this.player.isGrounded) {
                // Mario-style jumping pose - right arm raised, left arm at side
                this.ctx.fillRect(this.player.x + 28, playerY - 8, 8, 16); // Right arm raised
                this.ctx.fillRect(this.player.x - 4, playerY + 4, 8, 16); // Left arm normal
            } else if (this.player.isMoving && this.player.isGrounded && !this.player.isDucking) {
                let leftArmOffset = 0;
                let rightArmOffset = 0;
                
                switch (this.player.animFrame) {
                    case 1:
                        leftArmOffset = -1;
                        rightArmOffset = 1;
                        break;
                    case 3:
                        leftArmOffset = 1;
                        rightArmOffset = -1;
                        break;
                }
                
                this.ctx.fillRect(this.player.x - 4 + leftArmOffset, playerY + 4, 8, 16);
                this.ctx.fillRect(this.player.x + 28 + rightArmOffset, playerY + 4, 8, 16);
            } else {
                this.ctx.fillRect(this.player.x - 4, playerY + 4, 8, 16);
                this.ctx.fillRect(this.player.x + 28, playerY + 4, 8, 16);
            }
            
            // Sword of the Spirit (left arm)
            this.ctx.fillStyle = '#C0C0C0'; // Silver blade
            if (this.player.isJumping || !this.player.isGrounded) {
                // Sword stays at side during jumping (left arm doesn't move much)
                // Sword blade
                this.ctx.fillRect(this.player.x - 8, playerY - 8, 4, 20); // Blade
                // Sword tip
                this.ctx.fillRect(this.player.x - 7, playerY - 10, 2, 2); // Point
                
                // Sword hilt
                this.ctx.fillStyle = '#8B4513'; // Brown handle
                this.ctx.fillRect(this.player.x - 7, playerY + 12, 2, 8); // Handle
                
                // Sword crossguard
                this.ctx.fillStyle = '#FFD700'; // Gold crossguard
                this.ctx.fillRect(this.player.x - 10, playerY + 10, 8, 2); // Crossguard
                
                // Sword pommel
                this.ctx.fillStyle = '#FFD700'; // Gold pommel
                this.ctx.fillRect(this.player.x - 8, playerY + 20, 4, 2); // Pommel
            } else if (this.player.isMoving && this.player.isGrounded && !this.player.isDucking) {
                const leftArmOffset = this.player.animFrame === 1 ? -1 : this.player.animFrame === 3 ? 1 : 0;
                
                // Sword blade
                this.ctx.fillRect(this.player.x - 8 + leftArmOffset, playerY - 8, 4, 20); // Blade
                // Sword tip
                this.ctx.fillRect(this.player.x - 7 + leftArmOffset, playerY - 10, 2, 2); // Point
                
                // Sword hilt
                this.ctx.fillStyle = '#8B4513'; // Brown handle
                this.ctx.fillRect(this.player.x - 7 + leftArmOffset, playerY + 12, 2, 8); // Handle
                
                // Sword crossguard
                this.ctx.fillStyle = '#FFD700'; // Gold crossguard
                this.ctx.fillRect(this.player.x - 10 + leftArmOffset, playerY + 10, 8, 2); // Crossguard
                
                // Sword pommel
                this.ctx.fillStyle = '#FFD700'; // Gold pommel
                this.ctx.fillRect(this.player.x - 8 + leftArmOffset, playerY + 20, 4, 2); // Pommel
            } else {
                // Sword blade
                this.ctx.fillRect(this.player.x - 8, playerY - 8, 4, 20); // Blade
                // Sword tip
                this.ctx.fillRect(this.player.x - 7, playerY - 10, 2, 2); // Point
                
                // Sword hilt
                this.ctx.fillStyle = '#8B4513'; // Brown handle
                this.ctx.fillRect(this.player.x - 7, playerY + 12, 2, 8); // Handle
                
                // Sword crossguard
                this.ctx.fillStyle = '#FFD700'; // Gold crossguard
                this.ctx.fillRect(this.player.x - 10, playerY + 10, 8, 2); // Crossguard
                
                // Sword pommel
                this.ctx.fillStyle = '#FFD700'; // Gold pommel
                this.ctx.fillRect(this.player.x - 8, playerY + 20, 4, 2); // Pommel
            }
            
            // Shield of Faith (right arm)
            this.ctx.fillStyle = '#C0C0C0'; // Silver shield
            if (this.player.isJumping || !this.player.isGrounded) {
                // Shield raised up with the right arm (Mario style)
                this.ctx.fillRect(this.player.x + 38, playerY - 8, 10, 16); // Shield main body raised
                
                // Shield details
                this.ctx.fillStyle = '#A9A9A9'; // Darker silver border
                this.ctx.fillRect(this.player.x + 38, playerY - 8, 10, 2); // Top edge
                this.ctx.fillRect(this.player.x + 38, playerY + 6, 10, 2); // Bottom edge
                this.ctx.fillRect(this.player.x + 38, playerY - 8, 2, 16); // Left edge
                this.ctx.fillRect(this.player.x + 46, playerY - 8, 2, 16); // Right edge
                
                // Cross on shield
                this.ctx.fillStyle = '#FFD700'; // Gold cross
                this.ctx.fillRect(this.player.x + 41, playerY - 4, 4, 8); // Vertical
                this.ctx.fillRect(this.player.x + 39, playerY - 2, 8, 4); // Horizontal
            } else if (this.player.isMoving && this.player.isGrounded && !this.player.isDucking) {
                const rightArmOffset = this.player.animFrame === 1 ? 1 : this.player.animFrame === 3 ? -1 : 0;
                this.ctx.fillRect(this.player.x + 34 + rightArmOffset, playerY + 8, 10, 16); // Shield main body
                
                // Shield details
                this.ctx.fillStyle = '#A9A9A9'; // Darker silver border
                this.ctx.fillRect(this.player.x + 34 + rightArmOffset, playerY + 8, 10, 2); // Top edge
                this.ctx.fillRect(this.player.x + 34 + rightArmOffset, playerY + 22, 10, 2); // Bottom edge
                this.ctx.fillRect(this.player.x + 34 + rightArmOffset, playerY + 8, 2, 16); // Left edge
                this.ctx.fillRect(this.player.x + 42 + rightArmOffset, playerY + 8, 2, 16); // Right edge
                
                // Cross on shield
                this.ctx.fillStyle = '#FFD700'; // Gold cross
                this.ctx.fillRect(this.player.x + 37 + rightArmOffset, playerY + 12, 4, 8); // Vertical
                this.ctx.fillRect(this.player.x + 35 + rightArmOffset, playerY + 14, 8, 4); // Horizontal
            } else {
                this.ctx.fillRect(this.player.x + 34, playerY + 8, 10, 16); // Shield main body
                
                // Shield details
                this.ctx.fillStyle = '#A9A9A9'; // Darker silver border
                this.ctx.fillRect(this.player.x + 34, playerY + 8, 10, 2); // Top edge
                this.ctx.fillRect(this.player.x + 34, playerY + 22, 10, 2); // Bottom edge
                this.ctx.fillRect(this.player.x + 34, playerY + 8, 2, 16); // Left edge
                this.ctx.fillRect(this.player.x + 42, playerY + 8, 2, 16); // Right edge
                
                // Cross on shield
                this.ctx.fillStyle = '#FFD700'; // Gold cross
                this.ctx.fillRect(this.player.x + 37, playerY + 12, 4, 8); // Vertical
                this.ctx.fillRect(this.player.x + 35, playerY + 14, 8, 4); // Horizontal
            }
        } else {
            // Peasant clothing
            this.ctx.fillStyle = '#8B4513'; // Brown tunic
            this.ctx.fillRect(this.player.x + 4, playerY, 24, 28);
            
            // Simple tunic details
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(this.player.x + 6, playerY + 2, 20, 2);
            this.ctx.fillRect(this.player.x + 14, playerY + 6, 4, 16);
            
            // Simple sleeves (animated)
            this.ctx.fillStyle = '#8B4513';
            if (this.player.isMoving && this.player.isGrounded && !this.player.isDucking) {
                let leftArmOffset = 0;
                let rightArmOffset = 0;
                
                switch (this.player.animFrame) {
                    case 1:
                        leftArmOffset = -1;
                        rightArmOffset = 1;
                        break;
                    case 3:
                        leftArmOffset = 1;
                        rightArmOffset = -1;
                        break;
                }
                
                this.ctx.fillRect(this.player.x - 2 + leftArmOffset, playerY + 4, 6, 16);
                this.ctx.fillRect(this.player.x + 28 + rightArmOffset, playerY + 4, 6, 16);
            } else {
                this.ctx.fillRect(this.player.x - 2, playerY + 4, 6, 16);
                this.ctx.fillRect(this.player.x + 28, playerY + 4, 6, 16);
            }
        }
        
        // Animated Legs/pants
        this.ctx.fillStyle = '#654321'; // Brown pants
        
        if (this.player.isMoving && this.player.isGrounded && !this.player.isDucking) {
            // Walking animation - alternate leg positions
            let leftLegOffset = 0;
            let rightLegOffset = 0;
            
            switch (this.player.animFrame) {
                case 0: // Standing/neutral
                    leftLegOffset = 0;
                    rightLegOffset = 0;
                    break;
                case 1: // Left leg forward, right leg back
                    leftLegOffset = 2;
                    rightLegOffset = -2;
                    break;
                case 2: // Both legs together
                    leftLegOffset = 0;
                    rightLegOffset = 0;
                    break;
                case 3: // Right leg forward, left leg back
                    leftLegOffset = -2;
                    rightLegOffset = 2;
                    break;
            }
            
            // Left leg
            this.ctx.fillRect(this.player.x + 6 + leftLegOffset, playerY + 28, 8, playerHeight - 28);
            // Right leg  
            this.ctx.fillRect(this.player.x + 18 + rightLegOffset, playerY + 28, 8, playerHeight - 28);
            
            // Animated feet/shoes
            this.ctx.fillStyle = '#2F4F4F';
            this.ctx.fillRect(this.player.x + 4 + leftLegOffset, this.player.y + this.player.height - 4, 10, 4);
            this.ctx.fillRect(this.player.x + 18 + rightLegOffset, this.player.y + this.player.height - 4, 10, 4);
        } else {
            // Static legs when not moving
            this.ctx.fillRect(this.player.x + 6, playerY + 28, 8, playerHeight - 28);
            this.ctx.fillRect(this.player.x + 18, playerY + 28, 8, playerHeight - 28);
            
            // Static feet/shoes
            if (!this.player.isDucking) {
                this.ctx.fillStyle = '#2F4F4F';
                this.ctx.fillRect(this.player.x + 4, this.player.y + this.player.height - 4, 10, 4);
                this.ctx.fillRect(this.player.x + 18, this.player.y + this.player.height - 4, 10, 4);
            }
        }
        
        // Reset alpha after player drawing
        if (shouldFlash) {
            this.ctx.globalAlpha = 1.0;
        }
        
        // Draw dog companion
        this.drawDog();
        
        // Draw armor activation explosion
        if (this.armorActivating) {
            this.armorExplosion.forEach(particle => {
                const alpha = particle.life / particle.maxLife;
                const size = particle.size * (1 + (1 - alpha));
                
                // Draw glow effect
                this.ctx.globalAlpha = alpha * 0.4;
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(particle.x - size * 1.5, particle.y - size * 1.5, size * 3, size * 3);
                
                // Draw main particle
                this.ctx.globalAlpha = alpha * 0.8;
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
                
                // Add sparkle
                if (Math.random() < 0.3) {
                    this.ctx.globalAlpha = 1.0;
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
                }
            });
            this.ctx.globalAlpha = 1.0;
        }
        
        // Draw fireworks (if celebrating)
        if (this.gameState === 'celebrating') {
            this.fireworks.forEach(firework => {
                const alpha = Math.min(firework.life / firework.maxLife, 0.9); // Keep them bright
                const baseSize = firework.size || 6; // Use particle's size or default to 6
                const size = baseSize + (1 - alpha) * 4; // Much bigger particles, grow as they fade
                
                // Draw glow effect (larger, semi-transparent)
                this.ctx.globalAlpha = alpha * 0.3;
                this.ctx.fillStyle = firework.color;
                this.ctx.fillRect(firework.x - size * 1.5, firework.y - size * 1.5, size * 3, size * 3);
                
                // Draw main particle (bright and solid)
                this.ctx.globalAlpha = alpha * 0.8; // Brighter main particle
                this.ctx.fillStyle = firework.color;
                this.ctx.fillRect(firework.x - size/2, firework.y - size/2, size, size);
                
                // Add bright sparkle effect
                if (Math.random() < 0.5) { // More frequent sparkles
                    this.ctx.globalAlpha = 1.0;
                    this.ctx.fillStyle = '#FFFFFF';
                    const sparkleSize = size * 0.8;
                    this.ctx.fillRect(firework.x - sparkleSize/2, firework.y - sparkleSize/2, sparkleSize, sparkleSize);
                }
                
                // Add cross sparkle pattern for extra brightness
                if (Math.random() < 0.3) {
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.fillStyle = '#FFFFFF';
                    // Horizontal line
                    this.ctx.fillRect(firework.x - size, firework.y - 1, size * 2, 2);
                    // Vertical line  
                    this.ctx.fillRect(firework.x - 1, firework.y - size, 2, size * 2);
                }
            });
            this.ctx.globalAlpha = 1.0; // Reset alpha
            
            // Draw celebration message
            const messageAlpha = Math.sin(this.celebrationTimer * 0.2) * 0.3 + 0.7; // Pulsing effect
            this.ctx.globalAlpha = messageAlpha;
            this.ctx.fillStyle = '#FFD700'; // Gold text
            this.ctx.font = 'bold 24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.strokeText('The Lord has granted you victory!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText('The Lord has granted you victory!', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.globalAlpha = 1.0; // Reset alpha
            this.ctx.textAlign = 'left'; // Reset text align
        }
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI elements (fixed position)
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px "Press Start 2P"';
        
        // Only show distance when playing
        if (this.gameState === 'playing' || this.gameState === 'dying') {
            this.ctx.fillText(`Distance: ${Math.floor(this.player.x)}/${this.worldWidth}`, 10, 580);
        }
        
        // Draw health bar (top right corner)
        const healthBarX = this.canvas.width - 220;
        const healthBarY = 20;
        const healthBarWidth = 200;
        const healthBarHeight = 30;
        
        // Health bar background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar fill
        const healthPercentage = this.player.health / this.player.maxHealth;
        const healthFillWidth = (healthBarWidth - 4) * healthPercentage;
        
        // Color changes based on health
        if (healthPercentage > 0.6) {
            this.ctx.fillStyle = '#00FF00'; // Green
        } else if (healthPercentage > 0.3) {
            this.ctx.fillStyle = '#FFFF00'; // Yellow
        } else {
            this.ctx.fillStyle = '#FF0000'; // Red
        }
        
        this.ctx.fillRect(healthBarX + 2, healthBarY + 2, healthFillWidth, healthBarHeight - 4);
        
        // Health text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Health: ${this.player.health}/${this.player.maxHealth}`, healthBarX + healthBarWidth/2, healthBarY + 20);
        this.ctx.textAlign = 'left'; // Reset text align
        
        // Flashing effect when invulnerable
        if (this.player.invulnerable && Math.floor(this.player.invulnerabilityTimer / 5) % 2 === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        }
        
        // Draw scripture books counter (positioned next to health bar)
        const scriptureCounterX = healthBarX - 270; // Position to the left of health bar
        const scriptureCounterY = healthBarY + 20; // Same vertical level as health bar
        
        // Scripture books counter background
        const counterWidth = 250;
        const counterHeight = 30;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(scriptureCounterX, healthBarY, counterWidth, counterHeight);
        
        // Scripture books counter border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(scriptureCounterX, healthBarY, counterWidth, counterHeight);
        
        // Scripture books counter text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        
        if (this.hasArmor) {
            this.ctx.fillStyle = '#44FF44'; // Green for armor
            this.ctx.fillText('Armor Active', scriptureCounterX + counterWidth/2, scriptureCounterY);
        } else {
            // Color based on books collected
            this.ctx.fillStyle = this.booksCollected > 0 ? '#FFFF44' : '#FF4444'; // Yellow if some collected, red if none
            this.ctx.fillText(`Scriptures: ${this.booksCollected}/3`, scriptureCounterX + counterWidth/2, scriptureCounterY);
        }
        
        this.ctx.textAlign = 'left'; // Reset text align
        
        // Draw death message overlay if dying
        if (this.gameState === 'dying') {
            // Semi-transparent dark overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Death message
            this.ctx.fillStyle = '#FF4444';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('DEATH!', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            // Death reason
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px "Press Start 2P"';
            
            // Word wrap the death message
            const words = this.deathMessage.split(' ');
            const maxWidth = this.canvas.width - 100;
            let line = '';
            let y = this.canvas.height / 2;
            
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = this.ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    this.ctx.fillText(line, this.canvas.width / 2, y);
                    line = words[n] + ' ';
                    y += 20;
                } else {
                    line = testLine;
                }
            }
            this.ctx.fillText(line, this.canvas.width / 2, y);
            
            // Reset text align
            this.ctx.textAlign = 'left';
        }
        
        // Draw armor activation overlay
        if (this.armorActivating) {
            // Semi-transparent gold overlay
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Armor activated message
            const messageAlpha = Math.sin(this.armorActivationTimer * 0.3) * 0.3 + 0.7; // Pulsing effect
            this.ctx.globalAlpha = messageAlpha;
            this.ctx.fillStyle = '#FFD700'; // Gold text
            this.ctx.font = 'bold 28px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText('ARMOR ACTIVATED!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.fillText('ARMOR ACTIVATED!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.strokeText('Protected by God\'s Armor', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText('Protected by God\'s Armor', this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            this.ctx.globalAlpha = 1.0; // Reset alpha
            this.ctx.textAlign = 'left'; // Reset text align
        }
        
        // Draw pause overlay
        if (this.isPaused && this.gameState === 'playing') {
            // Semi-transparent dark overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Pause message
            this.ctx.fillStyle = '#FFFF00'; // Yellow for visibility
            this.ctx.font = '32px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 80);
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 80);
            
            // Instructions
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.strokeText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.fillText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            // Pause menu buttons
            const buttonWidth = 200;
            const buttonHeight = 40;
            const buttonSpacing = 60;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // Restart Level button
            const restartButtonX = centerX - buttonWidth / 2;
            const restartButtonY = centerY + 10;
            
            // Button background (with hover effect)
            const isRestartHovered = this.hoveredButton === 'restart';
            this.ctx.fillStyle = isRestartHovered ? '#555' : '#333';
            this.ctx.fillRect(restartButtonX, restartButtonY, buttonWidth, buttonHeight);
            
            // Button border (with hover effect)
            this.ctx.strokeStyle = isRestartHovered ? '#FFD700' : '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(restartButtonX, restartButtonY, buttonWidth, buttonHeight);
            
            // Button text (with hover effect)
            this.ctx.fillStyle = isRestartHovered ? '#FFD700' : '#FFF';
            this.ctx.font = '14px "Press Start 2P"';
            this.ctx.fillText('Restart Level', centerX, restartButtonY + 25);
            
            // Main Menu button
            const mainMenuButtonX = centerX - buttonWidth / 2;
            const mainMenuButtonY = centerY + 10 + buttonSpacing;
            
            // Button background (with hover effect)
            const isMainMenuHovered = this.hoveredButton === 'mainMenu';
            this.ctx.fillStyle = isMainMenuHovered ? '#555' : '#333';
            this.ctx.fillRect(mainMenuButtonX, mainMenuButtonY, buttonWidth, buttonHeight);
            
            // Button border (with hover effect)
            this.ctx.strokeStyle = isMainMenuHovered ? '#FFD700' : '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(mainMenuButtonX, mainMenuButtonY, buttonWidth, buttonHeight);
            
            // Button text (with hover effect)
            this.ctx.fillStyle = isMainMenuHovered ? '#FFD700' : '#FFF';
            this.ctx.font = '14px "Press Start 2P"';
            this.ctx.fillText('Main Menu', centerX, mainMenuButtonY + 25);
            
            // Store button positions for click detection
            this.pauseRestartButton = {
                x: restartButtonX,
                y: restartButtonY,
                width: buttonWidth,
                height: buttonHeight
            };
            
            this.pauseMainMenuButton = {
                x: mainMenuButtonX,
                y: mainMenuButtonY,
                width: buttonWidth,
                height: buttonHeight
            };
            
            // Reset text align
            this.ctx.textAlign = 'left';
        }
        
        // Always draw audio button last so it appears on top of everything
        this.drawAudioButton();
    }
    
    gameLoop() {
        if (this.gameState === 'celebrating') {
            this.updateCelebration();
        } else if (!this.isPaused) {
            // Only update game logic if not paused
            this.handleInput();
            this.updatePhysics();
            this.checkCollisions();
        }
        this.render(); // Always render to show pause overlay
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    drawDog() {
        // Only draw dog during gameplay
        if (this.gameState !== 'playing' && this.gameState !== 'dying' && this.gameState !== 'celebrating') return;
        
        // Simple pixelated dog design
        const dogX = this.dog.x;
        const dogY = this.dog.y;
        
        // Dog body (brown)
        this.ctx.fillStyle = '#8B4513'; // Brown
        this.ctx.fillRect(dogX + 2, dogY + 8, 16, 8); // Main body
        
        // Dog head (lighter brown)
        this.ctx.fillStyle = '#A0522D'; // Sandy brown
        this.ctx.fillRect(dogX + 16, dogY + 6, 8, 8); // Head
        
        // Dog ears (darker brown)
        this.ctx.fillStyle = '#654321'; // Dark brown
        this.ctx.fillRect(dogX + 16, dogY + 4, 2, 4); // Left ear
        this.ctx.fillRect(dogX + 22, dogY + 4, 2, 4); // Right ear
        
        // Dog nose (black)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(dogX + 22, dogY + 8, 2, 2); // Nose
        
        // Dog eye (black)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(dogX + 20, dogY + 7, 1, 1); // Eye
        
        // Dog legs (animated based on movement)
        this.ctx.fillStyle = '#8B4513'; // Brown legs
        
        if (this.dog.isMoving && this.dog.isGrounded) {
            // Walking animation - alternate leg positions
            let frontLegOffset = 0;
            let backLegOffset = 0;
            
            switch (this.dog.animFrame) {
                case 0:
                    frontLegOffset = 0;
                    backLegOffset = 0;
                    break;
                case 1:
                    frontLegOffset = 1;
                    backLegOffset = -1;
                    break;
                case 2:
                    frontLegOffset = 0;
                    backLegOffset = 0;
                    break;
                case 3:
                    frontLegOffset = -1;
                    backLegOffset = 1;
                    break;
            }
            
            // Front legs
            this.ctx.fillRect(dogX + 14 + frontLegOffset, dogY + 16, 2, 4);
            this.ctx.fillRect(dogX + 17 + frontLegOffset, dogY + 16, 2, 4);
            // Back legs
            this.ctx.fillRect(dogX + 4 + backLegOffset, dogY + 16, 2, 4);
            this.ctx.fillRect(dogX + 7 + backLegOffset, dogY + 16, 2, 4);
        } else {
            // Static legs when not moving
            this.ctx.fillRect(dogX + 14, dogY + 16, 2, 4); // Front left leg
            this.ctx.fillRect(dogX + 17, dogY + 16, 2, 4); // Front right leg
            this.ctx.fillRect(dogX + 4, dogY + 16, 2, 4);  // Back left leg
            this.ctx.fillRect(dogX + 7, dogY + 16, 2, 4);  // Back right leg
        }
        
        // Dog tail (animated - wags when moving)
        this.ctx.fillStyle = '#654321'; // Dark brown tail
        if (this.dog.isMoving) {
            // Wagging tail animation
            const tailOffset = Math.sin(Date.now() * 0.02) * 2; // Fast wagging
            this.ctx.fillRect(dogX - 2, dogY + 10 + tailOffset, 4, 2); // Tail wagging
        } else {
            this.ctx.fillRect(dogX - 1, dogY + 11, 3, 2); // Tail at rest
        }
    }

    drawAudioButton() {
    // Always draw audio toggle button (appears on all screens)
        const audioButtonX = this.canvas.width - 50;
        const audioButtonY = 60; // Below the health bar (health bar is at y=20 with height=30)
        const audioButtonSize = 30;
        
        // Audio button background
        this.ctx.fillStyle = this.audioEnabled ? '#333' : '#666';
        this.ctx.fillRect(audioButtonX, audioButtonY, audioButtonSize, audioButtonSize);
        
        // Audio button border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(audioButtonX, audioButtonY, audioButtonSize, audioButtonSize);
        
        // Audio icon
        this.ctx.fillStyle = this.audioEnabled ? '#00FF00' : '#FF0000';
        if (this.audioEnabled) {
            // Speaker icon when on
            this.ctx.fillRect(audioButtonX + 8, audioButtonY + 10, 4, 10);
            this.ctx.fillRect(audioButtonX + 12, audioButtonY + 12, 3, 6);
            this.ctx.fillRect(audioButtonX + 15, audioButtonY + 8, 2, 14);
            // Sound waves
            this.ctx.fillRect(audioButtonX + 18, audioButtonY + 10, 2, 2);
            this.ctx.fillRect(audioButtonX + 21, audioButtonY + 8, 2, 6);
            this.ctx.fillRect(audioButtonX + 24, audioButtonY + 6, 2, 10);
        } else {
            // Muted speaker icon with X
            this.ctx.fillRect(audioButtonX + 8, audioButtonY + 10, 4, 10);
            this.ctx.fillRect(audioButtonX + 12, audioButtonY + 12, 3, 6);
            this.ctx.fillRect(audioButtonX + 15, audioButtonY + 8, 2, 14);
            // X mark
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(audioButtonX + 18, audioButtonY + 8, 2, 2);
            this.ctx.fillRect(audioButtonX + 20, audioButtonY + 10, 2, 2);
            this.ctx.fillRect(audioButtonX + 22, audioButtonY + 12, 2, 2);
            this.ctx.fillRect(audioButtonX + 22, audioButtonY + 8, 2, 2);
            this.ctx.fillRect(audioButtonX + 20, audioButtonY + 10, 2, 2);
            this.ctx.fillRect(audioButtonX + 18, audioButtonY + 12, 2, 2);
        }
        
        // Store button position for click detection
        this.audioButton = {
            x: audioButtonX,
            y: audioButtonY,
            width: audioButtonSize,
            height: audioButtonSize
        };
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArmorOfGodGame();
});