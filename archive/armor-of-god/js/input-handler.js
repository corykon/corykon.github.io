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
                
                // Stacked buttons with cool pixel art style
                const buttonWidth = 250;
                const buttonHeight = 50;
                const buttonSpacing = 16;
                
                // Calculate positions for stacked buttons (EXACT copy from ui-renderer.js)
                const button1Y = centerY + 20;
                const button2Y = button1Y + buttonHeight + buttonSpacing;
                const buttonX = centerX - buttonWidth / 2;
                
                // Check restart level button (hardcoded position)
                if (x >= buttonX && x <= buttonX + buttonWidth && 
                    y >= button1Y && y <= button1Y + buttonHeight) {
                    game.audioManager.playSoundEffect('buttonClick');
                    game.restartLevel();
                    return;
                }
                
                // Check main menu button (hardcoded position)
                if (x >= buttonX && x <= buttonX + buttonWidth && 
                    y >= button2Y && y <= button2Y + buttonHeight) {
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
                
                // Stacked buttons with cool pixel art style  
                const buttonWidth = 250;
                const buttonHeight = 50;
                const buttonSpacing = 10;
                
                // Calculate positions for stacked buttons (EXACT copy from ui-renderer.js)
                const button1Y = centerY + 20;
                const button2Y = button1Y + buttonHeight + buttonSpacing - 15; // Move up by 15 pixels
                const buttonX = centerX - buttonWidth / 2;
                
                // Check restart button hover
                if (x >= buttonX && x <= buttonX + buttonWidth && 
                    y >= button1Y && y <= button1Y + buttonHeight) {
                    if (this.hoveredButton !== 'restart') {
                        game.audioManager.playSoundEffect('buttonHover');
                    }
                    this.hoveredButton = 'restart';
                    hovered = true;
                }
                
                // Check main menu button hover
                if (x >= buttonX && x <= buttonX + buttonWidth && 
                    y >= button2Y && y <= button2Y + buttonHeight) {
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
        if (this.keys['ArrowLeft'] && player.x > cameraX) {
            player.x -= currentSpeed;
            player.isMoving = true;
            player.facingRight = false; // Facing left
        }
        if (this.keys['ArrowRight'] && player.x < worldWidth - player.width) {
            player.x += currentSpeed;
            player.isMoving = true;
            player.facingRight = true; // Facing right
        }
        
        // Jumping (armor enhances jump height)
        if ((this.keysPressed['ArrowUp'] || this.keysPressed['Space']) && player.isGrounded && !player.isDucking) {
            const currentJumpPower = this.game.getCurrentJumpPower();
            player.velocityY = currentJumpPower;
            player.isJumping = true;
            player.isGrounded = false;
            audioManager.playSoundEffect('jump');
            // Clear the key press flags so jump doesn't repeat
            this.keysPressed['ArrowUp'] = false;
            this.keysPressed['Space'] = false;
        }
        
        // Ducking
        player.isDucking = this.keys['ArrowDown'] && player.isGrounded;
    }
    
    cleanup() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}