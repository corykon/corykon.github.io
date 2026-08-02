class EffectsManager {
    constructor() {
        this.fireworks = [];
        this.armorExplosion = [];
        this.sparkleTrails = []; // Sparkle trail particles
        this.petAffectionEffects = [];
        this.fireworkTimers = new Set();
        this.reducedEffects = false;
        
        // Celebration properties
        this.celebrationTimer = 0;
        this.celebrationDuration = 250; // 3 seconds at 60fps
        
        // Armor activation properties
        this.armorActivating = false;
        this.armorActivationTimer = 0;
        this.armorActivationDuration = 120; // 2 seconds at 60fps
    }
    
    initializeFireworks(castle) {
        this.clearFireworkTimers();
        this.fireworks = [];
        this.pendingFireworkBursts = 10;
        this.fireworkCastle = castle;
        this.scheduleFireworkBursts(300);
    }

    scheduleFireworkBursts(interval) {
        for (let i = 0; i < this.pendingFireworkBursts; i++) {
            const timer = setTimeout(() => {
                this.fireworkTimers.delete(timer);
                this.pendingFireworkBursts--;
                this.createFireworkBurst(this.fireworkCastle);
            }, i * interval);
            this.fireworkTimers.add(timer);
        }
    }

    accelerateFireworks() {
        if (!this.pendingFireworkBursts || !this.fireworkCastle) return;
        this.clearFireworkTimers();
        // Keep bursts staggered, just tightly enough to match the faster finale.
        this.scheduleFireworkBursts(100);
    }

    clearFireworkTimers() {
        this.fireworkTimers.forEach(timer => clearTimeout(timer));
        this.fireworkTimers.clear();
    }
    
    createFireworkBurst(castle) {
        const centerX = castle.x + castle.width / 2 + Math.random() * 400 - 200;
        const centerY = castle.y + Math.random() * 200 - 100;
        
        // Create multiple particles for each burst - MORE particles for bigger effect
        const particleCount = this.reducedEffects ? 20 : 40;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
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
    
    updateCelebration(speed = 1) {
        this.celebrationTimer += speed;
        
        // Update fireworks
        for (let index = this.fireworks.length - 1; index >= 0; index--) {
            const firework = this.fireworks[index];
            firework.x += firework.vx * speed;
            firework.y += firework.vy * speed;
            firework.vy += 0.1 * speed;
            firework.vx *= Math.pow(0.99, speed);
            firework.life -= speed;
            if (firework.life <= 0) this.fireworks.splice(index, 1);
        }
        
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
            uiRenderer.showMessage("Armor of God activated!", 240, '#FFD700', 15, 420);
        }
    }
    
    createArmorExplosion(player) {
        // Create bigger, more spectacular explosion particles around the player
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        this.armorExplosion = []; // Clear any existing explosion
        
        // Create more particles for a bigger explosion
        const outerParticleCount = this.reducedEffects ? 30 : 60;
        for (let i = 0; i < outerParticleCount; i++) {
            const angle = (Math.PI * 2 * i) / outerParticleCount;
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
        for (let i = 0; i < (this.reducedEffects ? 15 : 30); i++) {
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
        if (this.sparkleTrails.length > (this.reducedEffects ? 10 : 20)) return;
        
        // Add sparkles occasionally for performance
        if (Math.random() < (this.reducedEffects ? 0.15 : 0.3)) {
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
        for (let index = this.sparkleTrails.length - 1; index >= 0; index--) {
            const sparkle = this.sparkleTrails[index];
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.vx *= 0.95; // Air resistance
            sparkle.vy *= 0.95;
            sparkle.life--;
            if (sparkle.life <= 0) this.sparkleTrails.splice(index, 1);
        }
    }
    
    renderSparkleTrails(ctx, cameraX) {
        ctx.save();
        
        this.sparkleTrails.forEach(sparkle => {
            const screenX = sparkle.x - cameraX;
            const alpha = sparkle.life / sparkle.maxLife;
            
            ctx.globalAlpha = alpha * 0.8; // Subtle transparency
            ctx.fillStyle = sparkle.color;
            if (!this.reducedEffects) {
                ctx.shadowColor = sparkle.color;
                ctx.shadowBlur = 3; // Subtle glow
            }
            
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

    triggerPetAffection(x, y) {
        const lifetime = 180;
        this.petAffectionEffects.push({ type: 'heart', x, y, vx: 0.08, vy: -0.42, life: lifetime, maxLife: lifetime, size: 20 });
        for (let index = 0; index < 6; index++) {
            const angle = (Math.PI * 2 * index) / 6 + Math.random() * .35;
            this.petAffectionEffects.push({
                type: 'sparkle', x: x + (Math.random() - .5) * 12, y: y + 8,
                vx: Math.cos(angle) * .45, vy: -0.25 + Math.sin(angle) * .35,
                life: lifetime - 12 - Math.floor(Math.random() * 20), maxLife: lifetime, size: 2 + Math.random() * 2
            });
        }
    }

    triggerArmorPieceFound(x, y, image) {
        const lifetime = 120;
        this.petAffectionEffects.push({ type: 'armor-piece', x, y, vx: .08, vy: -.42, life: lifetime, maxLife: lifetime, size: 42, image });
        for (let index = 0; index < 10; index++) {
            const angle = (Math.PI * 2 * index) / 10 + Math.random() * .3;
            this.petAffectionEffects.push({
                type: 'sparkle', x: x + (Math.random() - .5) * 14, y: y + 8,
                vx: Math.cos(angle) * .58, vy: -.25 + Math.sin(angle) * .45,
                life: lifetime - 10 - Math.floor(Math.random() * 20), maxLife: lifetime, size: 2 + Math.random() * 2
            });
        }
    }

    updatePetAffectionEffects() {
        for (let index = this.petAffectionEffects.length - 1; index >= 0; index--) {
            const effect = this.petAffectionEffects[index];
            effect.x += effect.vx;
            effect.y += effect.vy;
            effect.vy *= .99;
            effect.life--;
            if (effect.life <= 0) this.petAffectionEffects.splice(index, 1);
        }
    }

    renderPetAffectionEffects(ctx, cameraX) {
        ctx.save();
        this.petAffectionEffects.forEach(effect => {
            const elapsed = effect.maxLife - effect.life;
            const fadeIn = Math.min(1, elapsed / 12);
            const alpha = Math.max(0, effect.life / effect.maxLife) * fadeIn;
            const x = effect.x - cameraX;
            ctx.globalAlpha = alpha;
            if (effect.type === 'heart') {
                ctx.fillStyle = '#ff4d6d';
                if (!this.reducedEffects) {
                    ctx.shadowColor = '#ff9aae';
                    ctx.shadowBlur = 6;
                }
                ctx.font = `${effect.size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('♥', x, effect.y);
            } else if (effect.type === 'armor-piece') {
                if (effect.image?.complete) {
                    ctx.drawImage(effect.image, x - effect.size / 2, effect.y - effect.size / 2, effect.size, effect.size);
                }
            } else {
                ctx.fillStyle = '#fff6a6';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, effect.y, effect.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x - effect.size * 1.5, effect.y);
                ctx.lineTo(x + effect.size * 1.5, effect.y);
                ctx.moveTo(x, effect.y - effect.size * 1.5);
                ctx.lineTo(x, effect.y + effect.size * 1.5);
                ctx.stroke();
            }
        });
        ctx.restore();
    }
    
    updateArmorActivation() {
        if (this.armorActivating) {
            this.armorActivationTimer++;
            
            // Update explosion particles
            for (let index = this.armorExplosion.length - 1; index >= 0; index--) {
                const particle = this.armorExplosion[index];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity (reduced by 50% for slower speed)
                particle.vx *= 0.98; // Air resistance
                particle.life--;
                if (particle.life <= 0) this.armorExplosion.splice(index, 1);
            }
            
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
        this.clearFireworkTimers();
        this.fireworks = [];
        this.pendingFireworkBursts = 0;
        this.fireworkCastle = null;
        this.armorExplosion = [];
        this.sparkleTrails = [];
        this.petAffectionEffects = [];
        this.celebrationTimer = 0;
        this.armorActivating = false;
        this.armorActivationTimer = 0;
    }
}
