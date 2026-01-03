class UIRenderer {
    constructor() {
        // Message system
        this.messages = [];
        this.messageTimer = 0;
        
        // Pause menu buttons (will be set by game)
        this.pauseRestartButton = null;
        this.pauseMainMenuButton = null;
    }
    
    showMessage(text, duration = 180, color = '#FFD700', backgroundWidth = 600) {
        this.messages.push({
            text: text,
            duration: duration,
            timer: 0,
            color: color,
            backgroundWidth: backgroundWidth
        });
    }
    
    updateMessages() {
        this.messages = this.messages.filter(message => {
            message.timer++;
            return message.timer < message.duration;
        });
    }
    
    renderUI(ctx, player, booksCollected, audioManager, isPaused, gameState, hoveredButton = null, hasArmor = false, armorTimer = 0, armorDuration = 1800, comboMode = false, comboMultiplier = 1, airborneKills = 0) {
        // Health UI Panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 20, 200, 50);
        
        // Health bar background
        ctx.fillStyle = '#000';
        ctx.fillRect(30, 30, 180, 15);
        
        // Health bar fill
        ctx.fillStyle = player.health <= 1 ? '#FF0000' : '#3ACF5D';
        const healthWidth = (player.health / player.maxHealth) * 180;
        ctx.fillRect(30, 30, healthWidth, 15);
        
        // Health text
        ctx.fillStyle = 'white';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, 30, 64);
        
        // Scriptures UI Panel (dynamically sized for text)
        const panelX = 240;
        const panelY = 20;
        const panelHeight = 50;
        
        // Calculate text width for proper panel sizing
        ctx.font = '12px "Press Start 2P", monospace';
        const armorText = 'Armor Activated!';
        const scripturesText = `Scriptures: ${booksCollected}/3`;
        const maxText = booksCollected >= 3 ? armorText : scripturesText;
        const textWidth = ctx.measureText(maxText).width;
        const panelWidth = Math.max(240, textWidth + 20); // At least 240px, or text width + 20px padding
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Scriptures bar background
        ctx.fillStyle = '#000';
        const barWidth = panelWidth - 20; // 10px padding on each side
        ctx.fillRect(panelX + 10, 30, barWidth, 15);
        
        // Scriptures bar fill - shows armor timer when armor is active
        let fillWidth, fillColor;
        if (hasArmor && armorTimer > 0) {
            // Show armor timer countdown
            const timeRatio = armorTimer / armorDuration;
            fillWidth = barWidth * timeRatio; // Decreases from full to empty
            
            // Color changes as time runs out: gold > orange > red
            if (timeRatio > 0.5) {
                fillColor = '#FFD700'; // Gold
            } else if (timeRatio > 0.25) {
                fillColor = '#FFA500'; // Orange
            } else {
                fillColor = '#FF4500'; // Red-Orange
            }
        } else {
            // Show scripture collection progress
            fillWidth = Math.min((booksCollected / 3) * barWidth, barWidth); // Cap at 100%
            if (booksCollected >= 3) {
                fillColor = '#FFD700'; // Gold when all 3 collected
            } else {
                fillColor = '#007BFF'; // Blue as it fills
            }
        }
        ctx.fillStyle = fillColor;
        ctx.fillRect(panelX + 10, 30, fillWidth, 15);
        
        // Scriptures text (changes when armor is activated or shows timer)
        if (hasArmor && armorTimer > 0) {
            const secondsLeft = Math.ceil(armorTimer / 60); // Convert frames to seconds
            const timeRatio = armorTimer / armorDuration;
            ctx.fillStyle = timeRatio > 0.25 ? '#FFD700' : '#FF4500';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText(`Armor: ${secondsLeft}s`, panelX + 10, 64);
        } else if (booksCollected >= 3) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText('Armor Activated!', panelX + 10, 64);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText(`Scriptures: ${booksCollected}/3`, panelX + 10, 64);
        }
        
        // Timer and Score UI Panels (top-right, flipped order - timer above score)
        const uiWidth = 150; // Smaller width
        const uiHeight = 40; // Smaller height
        const uiX = ctx.canvas.width - uiWidth - 20;
        const timerY = 20; // Timer on top
        const scoreY = timerY + uiHeight + 5; // Score below timer
        
        // Timer panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(uiX, timerY, uiWidth, uiHeight);
        
        // Timer text
        const levelTime = player.levelTime || 0;
        const minutes = Math.floor(levelTime / 3600);
        const seconds = Math.floor((levelTime % 3600) / 60);
        const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        ctx.fillStyle = 'white';
        ctx.font = '12px "Press Start 2P", monospace';
        
        // Left-aligned label
        ctx.textAlign = 'left';
        ctx.fillText('Time:', uiX + 8, timerY + 25);
        
        // Right-aligned value
        ctx.textAlign = 'right';
        ctx.fillText(timeDisplay, uiX + uiWidth - 8, timerY + 25);
        ctx.textAlign = 'left';
        
        // Score panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(uiX, scoreY, uiWidth, uiHeight);
        
        // Score text
        ctx.fillStyle = 'white';
        ctx.font = '12px "Press Start 2P", monospace';
        
        // Left-aligned label
        ctx.textAlign = 'left';
        ctx.fillText('Score:', uiX + 8, scoreY + 25);
        
        // Right-aligned value
        ctx.textAlign = 'right';
        ctx.fillText(`${player.score || 0}`, uiX + uiWidth - 8, scoreY + 25);
        ctx.textAlign = 'left';
        
        // Render floating score indicators
        this.renderFloatingScores(ctx, player.floatingScores || []);
        
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
            const fontSize = 15; // Fixed 15px font size
            
            // Calculate message width for proper background sizing
            ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
            const textWidth = ctx.measureText(message.text).width;
            const backgroundWidth = Math.max(200, textWidth + 20); // At least 200px like health bar, or text width + padding
            const backgroundHeight = 50; // Same height as health bar panel
            const backgroundX = 20; // Left side with margin
            const backgroundY = ctx.canvas.height - backgroundHeight - 20 - yOffset; // Bottom left
            const textX = backgroundX + backgroundWidth / 2; // Center text in background
            const textY = backgroundY + backgroundHeight / 2 + fontSize / 3; // Properly center text vertically
            
            // Message background - same style as other UI panels
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
            
            // Message text
            ctx.fillStyle = message.color;
            ctx.globalAlpha = opacity;
            ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(message.text, textX, textY);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1.0;
            
            yOffset += backgroundHeight + 5; // Small gap between messages
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
        
        // Subtitle text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText("Press 'P' to resume the game.", centerX, centerY - 30);
        
        // Reset shadow for other text
        ctx.shadowBlur = 0;
        
        // Three button layout: wide Resume button on top, Restart and Main Menu side by side below
        const wideButtonWidth = 300;
        const narrowButtonWidth = 140;
        const buttonHeight = 50;
        const verticalSpacing = 20;
        const horizontalSpacing = 20;
        
        // Resume button (top, wide, green)
        const resumeButtonY = centerY;
        const resumeButtonX = centerX - wideButtonWidth / 2;
        
        this.pauseResumeButton = { 
            x: resumeButtonX, 
            y: resumeButtonY, 
            width: wideButtonWidth, 
            height: buttonHeight 
        };
        
        // Add hover effect for resume button
        const isResumeHovered = hoveredButton === 'resume';
        
        // Green gradient background for resume button
        const resumeGradient = ctx.createLinearGradient(resumeButtonX, resumeButtonY, resumeButtonX, resumeButtonY + buttonHeight);
        if (isResumeHovered) {
            resumeGradient.addColorStop(0, 'rgba(100, 255, 100, 1.0)');
            resumeGradient.addColorStop(1, 'rgba(50, 200, 50, 1.0)');
        } else {
            resumeGradient.addColorStop(0, 'rgba(80, 220, 80, 0.9)');
            resumeGradient.addColorStop(1, 'rgba(40, 160, 40, 0.9)');
        }
        ctx.fillStyle = resumeGradient;
        ctx.fillRect(resumeButtonX, resumeButtonY, wideButtonWidth, buttonHeight);
        
        // Resume button border
        ctx.strokeStyle = isResumeHovered ? '#90FF90' : '#60C060';
        ctx.lineWidth = isResumeHovered ? 4 : 3;
        ctx.strokeRect(resumeButtonX, resumeButtonY, wideButtonWidth, buttonHeight);
        
        // Resume button inner border
        ctx.strokeStyle = isResumeHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(resumeButtonX + 3, resumeButtonY + 3, wideButtonWidth - 6, buttonHeight - 6);
        
        // Resume button text
        ctx.fillStyle = isResumeHovered ? '#FFFFFF' : '#F0FFF0';
        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = isResumeHovered ? 4 : 2;
        ctx.fillText('RESUME', centerX, resumeButtonY + buttonHeight/2);
        ctx.shadowBlur = 0;
        
        // Bottom row buttons positioning
        const bottomButtonY = resumeButtonY + buttonHeight + verticalSpacing;
        const restartButtonX = centerX - narrowButtonWidth - horizontalSpacing/2;
        const mainMenuButtonX = centerX + horizontalSpacing/2;
        
        // Restart Level button (bottom left, black)
        this.pauseRestartButton = { 
            x: restartButtonX, 
            y: bottomButtonY, 
            width: narrowButtonWidth, 
            height: buttonHeight 
        };
        
        const isRestartHovered = hoveredButton === 'restart';
        
        // Black background for restart button
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(restartButtonX, bottomButtonY, narrowButtonWidth, buttonHeight);
        
        // Hover background effect
        if (isRestartHovered) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
            ctx.fillRect(restartButtonX, bottomButtonY, narrowButtonWidth, buttonHeight);
        }
        
        // Restart button border
        ctx.strokeStyle = isRestartHovered ? '#FFFF00' : '#FFD700';
        ctx.lineWidth = isRestartHovered ? 4 : 3;
        ctx.strokeRect(restartButtonX, bottomButtonY, narrowButtonWidth, buttonHeight);
        
        // Restart button inner border
        ctx.strokeStyle = isRestartHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(restartButtonX + 3, bottomButtonY + 3, narrowButtonWidth - 6, buttonHeight - 6);
        
        // Restart button text
        ctx.fillStyle = isRestartHovered ? '#FFFF00' : 'white';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = isRestartHovered ? 4 : 2;
        ctx.fillText('RESTART', restartButtonX + narrowButtonWidth/2, bottomButtonY + buttonHeight/2);
        ctx.shadowBlur = 0;
        
        // Main Menu button (bottom right, black)
        this.pauseMainMenuButton = { 
            x: mainMenuButtonX, 
            y: bottomButtonY, 
            width: narrowButtonWidth, 
            height: buttonHeight 
        };
        
        const isMainMenuHovered = hoveredButton === 'mainMenu';
        
        // Black background for main menu button
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(mainMenuButtonX, bottomButtonY, narrowButtonWidth, buttonHeight);
        
        // Hover background effect
        if (isMainMenuHovered) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
            ctx.fillRect(mainMenuButtonX, bottomButtonY, narrowButtonWidth, buttonHeight);
        }
        
        // Main menu button border
        ctx.strokeStyle = isMainMenuHovered ? '#FFFF00' : '#FFD700';
        ctx.lineWidth = isMainMenuHovered ? 4 : 3;
        ctx.strokeRect(mainMenuButtonX, bottomButtonY, narrowButtonWidth, buttonHeight);
        
        // Main menu button inner border
        ctx.strokeStyle = isMainMenuHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(mainMenuButtonX + 3, bottomButtonY + 3, narrowButtonWidth - 6, buttonHeight - 6);
        
        // Main menu button text
        ctx.fillStyle = isMainMenuHovered ? '#FFFF00' : 'white';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = isMainMenuHovered ? 4 : 2;
        ctx.fillText('MAIN MENU', mainMenuButtonX + narrowButtonWidth/2, bottomButtonY + buttonHeight/2);
        ctx.shadowBlur = 0;
        
        // Reset text properties
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    renderFloatingScores(ctx, floatingScores) {
        // Fixed position for all floating scores - right aligned under score widget, 200px lower
        const scoreX = ctx.canvas.width - 25; // Right side with margin
        const startY = 275; // Start 200px lower than original position (75 + 200)
        const scoreWidgetBottom = 105; // Bottom of score widget (scoreY + uiHeight = 65 + 40)
        
        floatingScores.forEach((scoreIndicator, index) => {
            const baseOpacity = Math.max(0, (scoreIndicator.duration - scoreIndicator.timer) / scoreIndicator.duration);
            const yOffset = scoreIndicator.timer * 2; // Float upward
            const y = startY + (index * 25) - yOffset;
            
            // Additional fade out as scores approach the score widget
            let finalOpacity = baseOpacity;
            if (y <= scoreWidgetBottom + 50) { // Start fading 50px before reaching the widget
                const distanceFromWidget = y - scoreWidgetBottom;
                const fadeDistance = 50;
                if (distanceFromWidget < fadeDistance) {
                    const fadeRatio = Math.max(0, distanceFromWidget / fadeDistance);
                    finalOpacity = baseOpacity * fadeRatio;
                }
            }
            
            // Skip rendering if completely faded
            if (finalOpacity <= 0) return;
            
            // Use the score indicator's color, or default to yellow
            ctx.fillStyle = scoreIndicator.color || '#FFD700';
            ctx.globalAlpha = finalOpacity;
            ctx.font = 'bold 12px "Press Start 2P", monospace';
            ctx.textAlign = 'right'; // Right align the text
            
            // Add drop shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Create the display text with label if available
            const displayText = scoreIndicator.label ? 
                `${scoreIndicator.label} +${scoreIndicator.points}` : 
                `+${scoreIndicator.points}`;
            
            ctx.fillText(displayText, scoreX, y);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1.0;
        });
    }
    
    update() {
        this.updateMessages();
    }
}