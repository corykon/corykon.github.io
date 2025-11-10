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
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check pause menu buttons (only when game is paused)
            if (game.isPaused && game.gameState === 'playing') {
                // Check restart level button
                if (game.uiRenderer && game.uiRenderer.pauseRestartButton && 
                    x >= game.uiRenderer.pauseRestartButton.x && 
                    x <= game.uiRenderer.pauseRestartButton.x + game.uiRenderer.pauseRestartButton.width &&
                    y >= game.uiRenderer.pauseRestartButton.y && 
                    y <= game.uiRenderer.pauseRestartButton.y + game.uiRenderer.pauseRestartButton.height) {
                    game.restartLevel();
                    return;
                }
                
                // Check main menu button
                if (game.uiRenderer && game.uiRenderer.pauseMainMenuButton && 
                    x >= game.uiRenderer.pauseMainMenuButton.x && 
                    x <= game.uiRenderer.pauseMainMenuButton.x + game.uiRenderer.pauseMainMenuButton.width &&
                    y >= game.uiRenderer.pauseMainMenuButton.y && 
                    y <= game.uiRenderer.pauseMainMenuButton.y + game.uiRenderer.pauseMainMenuButton.height) {
                    game.goToMainMenu();
                    return;
                }
            }
        });

        // Mouse move events for hover effects
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Track hover state for pause menu buttons
            if (game.isPaused && game.gameState === 'playing') {
                let hovered = false;
                
                // Check restart button hover
                if (game.pauseRestartButton && 
                    x >= game.pauseRestartButton.x && 
                    x <= game.pauseRestartButton.x + game.pauseRestartButton.width &&
                    y >= game.pauseRestartButton.y && 
                    y <= game.pauseRestartButton.y + game.pauseRestartButton.height) {
                    this.hoveredButton = 'restart';
                    hovered = true;
                }
                
                // Check main menu button hover
                if (game.pauseMainMenuButton && 
                    x >= game.pauseMainMenuButton.x && 
                    x <= game.pauseMainMenuButton.x + game.pauseMainMenuButton.width &&
                    y >= game.pauseMainMenuButton.y && 
                    y <= game.pauseMainMenuButton.y + game.pauseMainMenuButton.height) {
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
        }
        if (this.keys['ArrowRight'] && player.x < worldWidth - player.width) {
            player.x += currentSpeed;
            player.isMoving = true;
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