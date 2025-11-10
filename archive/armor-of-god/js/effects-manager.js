class EffectsManager {
    constructor() {
        this.fireworks = [];
        this.armorExplosion = [];
        this.sparkleTrails = []; // Sparkle trail particles
        
        // Celebration properties
        this.celebrationTimer = 0;
        this.celebrationDuration = 250; // 3 seconds at 60fps
        
        // Armor activation properties
        this.armorActivating = false;
        this.armorActivationTimer = 0;
        this.armorActivationDuration = 120; // 2 seconds at 60fps
    }
    
    initializeFireworks(castle) {
        this.fireworks = [];
        // Create multiple firework bursts around the temple
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createFireworkBurst(castle);
            }, i * 300); // Stagger the fireworks
        }
    }
    
    createFireworkBurst(castle) {
        const centerX = castle.x + castle.width / 2 + Math.random() * 400 - 200;
        const centerY = castle.y + Math.random() * 200 - 100;
        
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
        
        // Return true when celebration should end
        return this.celebrationTimer >= this.celebrationDuration;
    }
    
    renderFireworks(ctx, cameraX) {
        if (this.fireworks.length === 0) return;
        
        this.fireworks.forEach(firework => {
            // Calculate opacity based on remaining life
            const opacity = firework.life / firework.maxLife;
            
            // Set color with opacity
            ctx.fillStyle = firework.color;
            ctx.globalAlpha = opacity;
            
            // Draw firework particle as a small square or circle
            const size = firework.size * (firework.life / firework.maxLife); // Shrink over time
            ctx.fillRect(
                Math.floor(firework.x - size/2), 
                Math.floor(firework.y - size/2), 
                Math.ceil(size), 
                Math.ceil(size)
            );
        });
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    activateArmor(player, uiRenderer) {
        this.armorActivating = true;
        this.armorActivationTimer = 0;
        this.createArmorExplosion(player);
        
        // Show armor activation message
        if (uiRenderer) {
            uiRenderer.showMessage("ARMOR OF GOD ACTIVATED!", 240, '#FFD700');
        }
    }
    
    createArmorExplosion(player) {
        // Create bigger, more spectacular explosion particles around the player
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        this.armorExplosion = []; // Clear any existing explosion
        
        // Create more particles for a bigger explosion
        for (let i = 0; i < 60; i++) {
            const angle = (Math.PI * 2 * i) / 60;
            const speed = 2.5 + Math.random() * 4.0; // Increased speed for bigger explosion
            
            this.armorExplosion.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 45 + Math.random() * 30, // Longer lasting particles
                maxLife: 45 + Math.random() * 30,
                color: ['#FFD700', '#FFF700', '#FFFF00', '#C0C0C0', '#FFFFFF', '#FFAA00'][Math.floor(Math.random() * 6)],
                size: 6 + Math.random() * 8 // Bigger particles
            });
        }
        
        // Add additional burst of inner particles for more drama
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.0;
            
            this.armorExplosion.push({
                x: centerX + (Math.random() - 0.5) * 20,
                y: centerY + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60 + Math.random() * 20,
                maxLife: 60 + Math.random() * 20,
                color: '#FFD700',
                size: 3 + Math.random() * 6
            });
        }
    }
    
    // Sparkle trail methods
    addSparkleTrail(x, y, hasArmor) {
        if (!hasArmor) return; // Only sparkle when armor is active
        
        // Limit sparkle count for performance
        if (this.sparkleTrails.length > 20) return;
        
        // Add sparkles occasionally for performance
        if (Math.random() < 0.3) { // 30% chance - much more reasonable
            this.sparkleTrails.push({
                x: x + Math.random() * 20,
                y: y + Math.random() * 24,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8 - 0.3,
                life: 20 + Math.random() * 15, // Shorter life for performance
                maxLife: 20 + Math.random() * 15,
                color: ['#FFD700', '#FFFFFF', '#FFFF00'][Math.floor(Math.random() * 3)],
                size: 2 + Math.random() * 3 // Smaller, more subtle
            });
        }
    }
    
    updateSparkleTrails() {
        this.sparkleTrails = this.sparkleTrails.filter(sparkle => {
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.vx *= 0.95; // Air resistance
            sparkle.vy *= 0.95;
            sparkle.life--;
            return sparkle.life > 0;
        });
    }
    
    renderSparkleTrails(ctx, cameraX) {
        ctx.save();
        
        this.sparkleTrails.forEach(sparkle => {
            const screenX = sparkle.x - cameraX;
            const alpha = sparkle.life / sparkle.maxLife;
            
            ctx.globalAlpha = alpha * 0.8; // Subtle transparency
            ctx.fillStyle = sparkle.color;
            ctx.shadowColor = sparkle.color;
            ctx.shadowBlur = 3; // Subtle glow
            
            // Draw sparkle as a small star
            ctx.beginPath();
            ctx.arc(screenX, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add cross sparkle effect
            ctx.strokeStyle = sparkle.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX - sparkle.size, sparkle.y);
            ctx.lineTo(screenX + sparkle.size, sparkle.y);
            ctx.moveTo(screenX, sparkle.y - sparkle.size);
            ctx.lineTo(screenX, sparkle.y + sparkle.size);
            ctx.stroke();
        });
        
        ctx.restore();
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
    
    renderArmorExplosion(ctx) {
        if (!this.armorActivating || this.armorExplosion.length === 0) return;
        
        this.armorExplosion.forEach(particle => {
            // Calculate opacity and size based on remaining life
            const lifeFactor = particle.life / particle.maxLife;
            const size = particle.size * lifeFactor;
            
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = lifeFactor;
            
            // Draw particle
            ctx.fillRect(
                Math.floor(particle.x - size/2), 
                Math.floor(particle.y - size/2), 
                Math.ceil(size), 
                Math.ceil(size)
            );
        });
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    reset() {
        this.fireworks = [];
        this.armorExplosion = [];
        this.sparkleTrails = [];
        this.celebrationTimer = 0;
        this.armorActivating = false;
        this.armorActivationTimer = 0;
    }
}