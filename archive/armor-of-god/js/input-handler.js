class InputHandler {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        this.touchKeys = {};
        this.touchKeysPressed = {};
        this.activeCanvasTouches = new Map();
        this.canvasTouchGestureIsMultiTouch = false;
        this.lastCanvasTap = null;
        
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
        document.querySelectorAll('[data-touch-key]').forEach(button => this.bindTouchControl(button));
        this.bindCanvasPetting(canvas);
        
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
                const howTo = game.uiRenderer.pauseHowToButton;
                if (howTo && x >= howTo.x && x <= howTo.x + howTo.width && y >= howTo.y && y <= howTo.y + howTo.height) {
                    game.audioManager.playSoundEffect('buttonClick');
                    game.showInstructionsModal();
                    return;
                }
                // Use EXACT same positioning as UI renderer
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const centerX = canvasWidth / 2;
                const centerY = canvasHeight / 2;
                
                // Three button layout: wide Resume button on top, Restart and Main Menu side by side below
                const isTouchLayout = window.matchMedia('(pointer: coarse)').matches;
                const wideButtonWidth = isTouchLayout ? 380 : 300;
                const narrowButtonWidth = isTouchLayout ? 180 : 140;
                const buttonHeight = isTouchLayout ? 70 : 50;
                const verticalSpacing = isTouchLayout ? 24 : 20;
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
                const isTouchLayout = window.matchMedia('(pointer: coarse)').matches;
                const wideButtonWidth = isTouchLayout ? 380 : 300;
                const narrowButtonWidth = isTouchLayout ? 180 : 140;
                const buttonHeight = isTouchLayout ? 70 : 50;
                const verticalSpacing = isTouchLayout ? 24 : 20;
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

                const howTo = game.uiRenderer.pauseHowToButton;
                if (howTo && x >= howTo.x && x <= howTo.x + howTo.width && y >= howTo.y && y <= howTo.y + howTo.height) {
                    if (this.hoveredButton !== 'howTo') {
                        game.audioManager.playSoundEffect('buttonHover');
                    }
                    this.hoveredButton = 'howTo';
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

    bindTouchControl(button) {
        const key = button.dataset.touchKey;
        const release = event => {
            if (event.pointerId !== undefined && button.hasPointerCapture?.(event.pointerId)) button.releasePointerCapture(event.pointerId);
            this.touchKeys[key] = false;
            button.classList.remove('touch-control--active');
        };
        button.addEventListener('pointerdown', event => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            event.preventDefault();
            button.setPointerCapture?.(event.pointerId);
            if (!this.touchKeys[key]) this.touchKeysPressed[key] = true;
            this.touchKeys[key] = true;
            button.classList.add('touch-control--active');
        });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, release));
    }

    bindCanvasPetting(canvas) {
        const maxTapDuration = 300;
        const maxTapMovement = 24;
        const doubleTapDelay = 350;
        const maxDoubleTapDistance = 72;

        canvas.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'touch') return;
            if (this.activeCanvasTouches.size > 0) this.canvasTouchGestureIsMultiTouch = true;
            this.activeCanvasTouches.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY,
                time: performance.now()
            });
        });

        canvas.addEventListener('pointerup', event => {
            if (event.pointerType !== 'touch') return;

            const touchStart = this.activeCanvasTouches.get(event.pointerId);
            this.activeCanvasTouches.delete(event.pointerId);
            if (!touchStart) return;

            if (this.canvasTouchGestureIsMultiTouch) {
                if (this.activeCanvasTouches.size === 0) this.canvasTouchGestureIsMultiTouch = false;
                this.lastCanvasTap = null;
                return;
            }

            const now = performance.now();
            const movement = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
            if (now - touchStart.time > maxTapDuration || movement > maxTapMovement) return;

            if (this.game.gameState !== 'playing' || this.game.isPaused) {
                this.lastCanvasTap = null;
                return;
            }

            const currentTap = { x: event.clientX, y: event.clientY, time: now };
            const previousTap = this.lastCanvasTap;
            this.lastCanvasTap = currentTap;

            if (!previousTap || now - previousTap.time > doubleTapDelay ||
                Math.hypot(currentTap.x - previousTap.x, currentTap.y - previousTap.y) > maxDoubleTapDistance) {
                return;
            }

            this.lastCanvasTap = null;
            event.preventDefault();
            this.game.tryPetAnimal();
        });

        ['pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, event => {
            this.activeCanvasTouches.delete(event.pointerId);
            if (this.activeCanvasTouches.size === 0) this.canvasTouchGestureIsMultiTouch = false;
        }));
    }

    isKeyDown(code) { return Boolean(this.keys[code] || this.touchKeys[code]); }

    wasKeyPressed(code) { return Boolean(this.keysPressed[code] || this.touchKeysPressed[code]); }

    clearTouchInputs() {
        this.touchKeys = {};
        this.touchKeysPressed = {};
        document.querySelectorAll('.touch-control--active').forEach(button => button.classList.remove('touch-control--active'));
    }
    
    handleKeyDown(e) {
        if (this.game.gameState === 'cutscene' && ['Enter', 'Escape', 'Space'].includes(e.code)) {
            this.game.skipOpeningCutscene();
            e.preventDefault();
            return;
        }
        // Credits are intentionally dismissible from anywhere in the roll.
        if (this.game.gameState === 'credits' && e.code === 'Escape') {
            this.game.skipCredits();
            e.preventDefault();
            return;
        }
        if (this.game.gameState === 'credits' && e.code === 'Space') {
            this.game.nextCreditsSection();
            e.preventDefault();
            return;
        }
        if (this.game.gameState === 'credits' && ['ArrowRight', 'ArrowDown'].includes(e.code)) {
            this.game.nextCreditsSection();
            e.preventDefault();
            return;
        }
        if (this.game.gameState === 'credits' && ['ArrowLeft', 'ArrowUp'].includes(e.code)) {
            this.game.previousCreditsSection();
            e.preventDefault();
            return;
        }

        // Let Enter hurry the temple-fireworks finale without skipping rewards.
        if (this.game.gameState === 'celebrating' && e.code === 'Enter') {
            this.game.fastForwardCelebration();
            e.preventDefault();
            return;
        }

        // Handle level intro screen
        if (this.game.gameState === 'levelIntro') {
            if (e.code === 'Space' || e.code === 'Enter') {
                // Desktop keeps the original two-step flow: the first press
                // rushes the reveal, and a later press continues once it is ready.
                // Touch layouts retain their direct start behavior.
                if (window.matchMedia('(pointer: fine)').matches) {
                    this.game.advanceLevelIntro();
                } else {
                    this.game.exitLevelIntro();
                }
                e.preventDefault();
                return;
            }
        }
        
        // Handle level complete screen
        if (this.game.gameState === 'levelComplete') {
            if (e.code === 'Space' || e.code === 'Enter') {
                if (this.game.pendingLevelThreeBoss) this.game.continueToBossFight();
                else this.game.startNextLevel();
                e.preventDefault();
                return;
            }
        }
        
        // Handle pause toggle (only when playing)
        if ((e.code === 'KeyP' || e.code === 'Escape') && this.game.gameState === 'playing') {
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
        if (this.isKeyDown('ArrowLeft') && player.x > cameraX && !player.blockedLeft) {
            player.x -= currentSpeed;
            player.isMoving = true;
            player.facingRight = false; // Facing left
            // Stop petting when player moves
            if (player.isPetting || this.game.pet.isBeingPetted) {
                this.game.petManager.stopPetting();
            }
        }
        if (this.isKeyDown('ArrowRight') && player.x < worldWidth - player.width && !player.blockedRight) {
            player.x += currentSpeed;
            player.isMoving = true;
            player.facingRight = true; // Facing right
            // Stop petting when player moves
            if (player.isPetting || this.game.pet.isBeingPetted) {
                this.game.petManager.stopPetting();
            }
        }
        
        // Jumping (armor enhances jump height) - Variable jump implementation
        if ((this.wasKeyPressed('ArrowUp') || this.wasKeyPressed('Space')) && player.isGrounded && !player.isDucking) {
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
            this.touchKeysPressed['ArrowUp'] = false;
            this.touchKeysPressed['Space'] = false;
        }
        
        // Track if jump key is still held (for variable jump height)
        player.jumpHeld = (this.isKeyDown('ArrowUp') || this.isKeyDown('Space')) && player.isJumping;
        
        // Ducking
        player.isDucking = this.isKeyDown('ArrowDown') && player.isGrounded;
    }
    
    cleanup() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
