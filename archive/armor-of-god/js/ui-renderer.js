class UIRenderer {
    constructor() {
        // Message system
        this.messages = [];
        this.messageTimer = 0;
        
        // Pause menu buttons (will be set by game)
        this.pauseRestartButton = null;
        this.pauseMainMenuButton = null;
    }
    
    showMessage(text, duration = 180, color = '#FFD700') {
        this.messages.push({
            text: text,
            duration: duration,
            timer: 0,
            color: color
        });
    }
    
    updateMessages() {
        this.messages = this.messages.filter(message => {
            message.timer++;
            return message.timer < message.duration;
        });
    }
    
    renderUI(ctx, player, booksCollected, audioManager, isPaused, gameState, hoveredButton = null) {
        // Health UI Panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 20, 200, 50);
        
        // Health bar background
        ctx.fillStyle = '#000';
        ctx.fillRect(30, 30, 180, 15);
        
        // Health bar fill
        ctx.fillStyle = player.health <= 1 ? '#FF0000' : '#00FF00';
        const healthWidth = (player.health / player.maxHealth) * 180;
        ctx.fillRect(30, 30, healthWidth, 15);
        
        // Health text
        ctx.fillStyle = 'white';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, 30, 64);
        
        // Scriptures UI Panel (made wider to fit "Armor Activated!" text)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(240, 20, 240, 50);
        
        // Scriptures bar background
        ctx.fillStyle = '#000';
        ctx.fillRect(250, 30, 220, 15);
        
        // Scriptures bar fill
        const scripturesWidth = (booksCollected / 3) * 220;
        if (booksCollected >= 3) {
            // Full bar - turn gold when all 3 collected
            ctx.fillStyle = '#FFD700';
        } else {
            // Partial bar - blue as it fills
            ctx.fillStyle = '#00AEFF';
        }
        ctx.fillRect(250, 30, scripturesWidth, 15);
        
        // Scriptures text (changes when armor is activated)
        if (booksCollected >= 3) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText('Armor Activated!', 250, 58);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText(`Scriptures: ${booksCollected}/3`, 250, 64);
        }
        
        // Render messages
        this.renderMessages(ctx);
        
        // Render pause overlay if paused
        if (isPaused && gameState === 'playing') {
            this.renderPauseOverlay(ctx, hoveredButton);
        }
    }
    
    renderMessages(ctx) {
        let yOffset = 0;
        this.messages.forEach(message => {
            const opacity = Math.min(1.0, (message.duration - message.timer) / 60);
            
            // Message background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(400, 150 + yOffset, 400, 60);
            
            // Message text
            ctx.fillStyle = message.color;
            ctx.globalAlpha = opacity;
            ctx.font = 'bold 24px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(message.text, 600, 185 + yOffset);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1.0;
            
            yOffset += 70;
        });
    }
    
    renderPauseOverlay(ctx, hoveredButton = null) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Semi-transparent overlay with cool gradient effect
        const gradient = ctx.createRadialGradient(
            canvasWidth/2, canvasHeight/2, 0,
            canvasWidth/2, canvasHeight/2, canvasWidth/2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Pause title with cool monospace font and glow effect
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow effect for title
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.fillText('PAUSED', centerX, centerY - 80);
        
        // Reset shadow for other text
        ctx.shadowBlur = 0;
        
        // Instructions with monospace font
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('Press P to resume', centerX, centerY - 30);
        
        // Stacked buttons with cool pixel art style
        const buttonWidth = 250;
        const buttonHeight = 50;
        const buttonSpacing = 20;
        
        // Calculate positions for stacked buttons
        const button1Y = centerY + 20;
        const button2Y = button1Y + buttonHeight + buttonSpacing;
        const buttonX = centerX - buttonWidth / 2;
        
        // Restart Level button (top)
        this.pauseRestartButton = { 
            x: buttonX, 
            y: button1Y, 
            width: buttonWidth, 
            height: buttonHeight 
        };
        
        // Add hover effect for restart button
        const isRestartHovered = hoveredButton === 'restart';
        
        // Hover background effect (slight glow)
        if (isRestartHovered) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
            ctx.fillRect(buttonX, button1Y, buttonWidth, buttonHeight);
        }
        
        // Button border with pixel art style (brighter when hovered)
        ctx.strokeStyle = isRestartHovered ? '#FFFF00' : '#FFD700';
        ctx.lineWidth = isRestartHovered ? 4 : 3;
        ctx.strokeRect(buttonX, button1Y, buttonWidth, buttonHeight);
        
        // Inner border for depth (more prominent when hovered)
        ctx.strokeStyle = isRestartHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX + 3, button1Y + 3, buttonWidth - 6, buttonHeight - 6);
        
        // Button text (brighter when hovered)
        ctx.fillStyle = isRestartHovered ? '#FFFF00' : 'white';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = isRestartHovered ? 4 : 2;
        ctx.fillText('RESTART LEVEL', centerX, button1Y + buttonHeight/2);
        ctx.shadowBlur = 0;
        
        // Main Menu button (bottom)
        this.pauseMainMenuButton = { 
            x: buttonX, 
            y: button2Y, 
            width: buttonWidth, 
            height: buttonHeight 
        };
        
        // Add hover effect for main menu button
        const isMainMenuHovered = hoveredButton === 'mainMenu';
        
        // Cool gradient button background (brighter when hovered)
        const menuGradient = ctx.createLinearGradient(buttonX, button2Y, buttonX, button2Y + buttonHeight);
        if (isMainMenuHovered) {
            menuGradient.addColorStop(0, 'rgba(255, 130, 130, 1.0)');
            menuGradient.addColorStop(1, 'rgba(220, 80, 80, 1.0)');
        } else {
            menuGradient.addColorStop(0, 'rgba(255, 100, 100, 0.9)');
            menuGradient.addColorStop(1, 'rgba(200, 50, 50, 0.9)');
        }
        ctx.fillStyle = menuGradient;
        ctx.fillRect(buttonX, button2Y, buttonWidth, buttonHeight);
        
        // Button border with pixel art style (brighter when hovered)
        ctx.strokeStyle = isMainMenuHovered ? '#FFFF00' : '#FFD700';
        ctx.lineWidth = isMainMenuHovered ? 4 : 3;
        ctx.strokeRect(buttonX, button2Y, buttonWidth, buttonHeight);
        
        // Inner border for depth (more prominent when hovered)
        ctx.strokeStyle = isMainMenuHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX + 3, button2Y + 3, buttonWidth - 6, buttonHeight - 6);
        
        // Button text (brighter when hovered)
        ctx.fillStyle = isMainMenuHovered ? '#FFFF00' : 'white';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = isMainMenuHovered ? 4 : 2;
        ctx.fillText('MAIN MENU', centerX, button2Y + buttonHeight/2);
        ctx.shadowBlur = 0;
        
        // Reset text properties
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    update() {
        this.updateMessages();
    }
}