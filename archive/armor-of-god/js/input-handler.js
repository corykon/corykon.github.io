class InputHandler {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        
        // Mouse state
        this.hoveredButton = null;
        
        // Bind event handlers to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    
    setupEventListeners(canvas, game) {
        // Store reference to game for callbacks
        this.game = game;
        
        // Keyboard input
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Mouse events for pause menu buttons
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            // Convert mouse coordinates to canvas coordinates (account for scaling)
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // Check pause menu buttons (only when game is paused)
            if (game.isPaused && game.gameState === 'playing') {
                // Use EXACT same positioning as UI renderer
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const centerX = canvasWidth / 2;
                const centerY = canvasHeight / 2;
                
                // Three button layout: wide Resume button on top, Restart and Main Menu side by side below
                const wideButtonWidth = 300;
                const narrowButtonWidth = 140;
                const buttonHeight = 50;
                const verticalSpacing = 20;
                const horizontalSpacing = 20;
                
                // Resume button positioning
                const resumeButtonY = centerY;
                const resumeButtonX = centerX - wideButtonWidth / 2;
                
                // Bottom row buttons positioning
                const bottomButtonY = resumeButtonY + buttonHeight + verticalSpacing;
                const restartButtonX = centerX - narrowButtonWidth - horizontalSpacing/2;
                const mainMenuButtonX = centerX + horizontalSpacing/2;
                
                // Check resume button
                if (x >= resumeButtonX && x <= resumeButtonX + wideButtonWidth && 
                    y >= resumeButtonY && y <= resumeButtonY + buttonHeight) {
                    game.audioManager.playSoundEffect('buttonClick');
                    game.togglePause(); // This will unpause the game
                    return;
                }
                
                // Check restart level button
                if (x >= restartButtonX && x <= restartButtonX + narrowButtonWidth && 
                    y >= bottomButtonY && y <= bottomButtonY + buttonHeight) {
                    game.audioManager.playSoundEffect('buttonClick');
                    game.restartLevel();
                    return;
                }
                
                // Check main menu button
                if (x >= mainMenuButtonX && x <= mainMenuButtonX + narrowButtonWidth && 
                    y >= bottomButtonY && y <= bottomButtonY + buttonHeight) {
                    game.audioManager.playSoundEffect('buttonClick');
                    game.goToMainMenu();
                    return;
                }
            }
        });

        // Mouse move events for hover effects
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            // Convert mouse coordinates to canvas coordinates (account for scaling)
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // Track hover state for pause menu buttons
            if (game.isPaused && game.gameState === 'playing') {
                let hovered = false;
                
                // Use EXACT same positioning as UI renderer
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const centerX = canvasWidth / 2;
                const centerY = canvasHeight / 2;
                
                // Three button layout: wide Resume button on top, Restart and Main Menu side by side below
                const wideButtonWidth = 300;
                const narrowButtonWidth = 140;
                const buttonHeight = 50;
                const verticalSpacing = 20;
                const horizontalSpacing = 20;
                
                // Resume button positioning
                const resumeButtonY = centerY;
                const resumeButtonX = centerX - wideButtonWidth / 2;
                
                // Bottom row buttons positioning
                const bottomButtonY = resumeButtonY + buttonHeight + verticalSpacing;
                const restartButtonX = centerX - narrowButtonWidth - horizontalSpacing/2;
                const mainMenuButtonX = centerX + horizontalSpacing/2;
                
                // Check resume button hover
                if (x >= resumeButtonX && x <= resumeButtonX + wideButtonWidth && 
                    y >= resumeButtonY && y <= resumeButtonY + buttonHeight) {
                    if (this.hoveredButton !== 'resume') {
                        game.audioManager.playSoundEffect('buttonHover');
                    }
                    this.hoveredButton = 'resume';
                    hovered = true;
                }
                
                // Check restart button hover
                if (x >= restartButtonX && x <= restartButtonX + narrowButtonWidth && 
                    y >= bottomButtonY && y <= bottomButtonY + buttonHeight) {
                    if (this.hoveredButton !== 'restart') {
                        game.audioManager.playSoundEffect('buttonHover');
                    }
                    this.hoveredButton = 'restart';
                    hovered = true;
                }
                
                // Check main menu button hover
                if (x >= mainMenuButtonX && x <= mainMenuButtonX + narrowButtonWidth && 
                    y >= bottomButtonY && y <= bottomButtonY + buttonHeight) {
                    if (this.hoveredButton !== 'mainMenu') {
                        game.audioManager.playSoundEffect('buttonHover');
                    }
                    this.hoveredButton = 'mainMenu';
                    hovered = true;
                }
                
                if (!hovered) {
                    this.hoveredButton = null;
                }
                
                // Change cursor style
                canvas.style.cursor = hovered ? 'pointer' : 'default';
            } else {
                this.hoveredButton = null;
                canvas.style.cursor = 'default';
            }
        });
    }
    
    handleKeyDown(e) {
        // Handle level intro screen
        if (this.game.gameState === 'levelIntro') {
            if (e.code === 'Space' || e.code === 'Enter') {
                this.game.startGameAfterIntro();
                e.preventDefault();
                return;
            }
        }
        
        // Handle level complete screen
        if (this.game.gameState === 'levelComplete') {
            if (e.code === 'Space' || e.code === 'Enter') {
                this.game.startNextLevel();
                e.preventDefault();
                return;
            }
        }
        
        // Handle pause toggle (only when playing)
        if (e.code === 'KeyP' && this.game.gameState === 'playing') {
            this.game.togglePause();
            e.preventDefault();
            return;
        }
        
        // Handle petting (only when playing and not paused)
        if (e.code === 'KeyD' && this.game.gameState === 'playing' && !this.game.isPaused) {
            this.game.tryPetAnimal();
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
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
        this.keysPressed[e.code] = false;
    }
    
    handleInput(player, cameraX, worldWidth, jumpPower, audioManager) {
        if (this.game.gameState !== 'playing') return;
        
        // Horizontal movement (armor enhances speed)
        player.isMoving = false;
        const currentSpeed = this.game.getCurrentSpeed();
        if (this.keys['ArrowLeft'] && player.x > cameraX && !player.blockedLeft) {
            player.x -= currentSpeed;
            player.isMoving = true;
            player.facingRight = false; // Facing left
            // Stop petting when player moves
            if (player.isPetting || this.game.pet.isBeingPetted) {
                this.game.petManager.stopPetting();
            }
        }
        if (this.keys['ArrowRight'] && player.x < worldWidth - player.width && !player.blockedRight) {
            player.x += currentSpeed;
            player.isMoving = true;
            player.facingRight = true; // Facing right
            // Stop petting when player moves
            if (player.isPetting || this.game.pet.isBeingPetted) {
                this.game.petManager.stopPetting();
            }
        }
        
        // Jumping (armor enhances jump height) - Variable jump implementation
        if ((this.keysPressed['ArrowUp'] || this.keysPressed['Space']) && player.isGrounded && !player.isDucking) {
            const currentJumpPower = this.game.getCurrentJumpPower();
            player.velocityY = currentJumpPower;
            player.isJumping = true;
            player.isGrounded = false;
            player.jumpHeld = true; // Track that jump key is being held
            audioManager.playSoundEffect('jump');
            // Stop petting when player jumps
            if (player.isPetting || this.game.pet.isBeingPetted) {
                this.game.petManager.stopPetting();
            }
            // Clear the key press flags so jump doesn't repeat
            this.keysPressed['ArrowUp'] = false;
            this.keysPressed['Space'] = false;
        }
        
        // Track if jump key is still held (for variable jump height)
        player.jumpHeld = (this.keys['ArrowUp'] || this.keys['Space']) && player.isJumping;
        
        // Ducking
        player.isDucking = this.keys['ArrowDown'] && player.isGrounded;
    }
    
    cleanup() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}