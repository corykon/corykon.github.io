class AudioManager {
    constructor() {
        // Load audio setting from localStorage, default to true
        this.audioEnabled = this.loadAudioSetting();
        this.currentMusic = null;
        this.gameOverTimeout = null;
        
        // Load audio files with individual loop settings
        this.audio = {
            menu: new Audio('sounds/menu-song.mp3'),
            adventure: new Audio('sounds/adventure.mp3'),
            winner: new Audio('sounds/winner1.mp3'),
            gameOver: new Audio('sounds/gameover.mp3'),
            jump: new Audio('sounds/jump.wav'),
            armormarch: new Audio('sounds/armormarch.mp3'),
            powerup: new Audio('sounds/powerup.mp3'),
            bark1: new Audio('sounds/bark1.mp3'),
            meow: new Audio('sounds/meow.mp3'),
            collect2: new Audio('sounds/collect2.wav'),
            thud: new Audio('sounds/thud.mp3'),
            thud2: new Audio('sounds/thud2.mp3'),
            thud3: new Audio('sounds/thud3.mp3'),
            heal2: new Audio('sounds/heal2.wav'),
            ricochet: new Audio('sounds/ricochet.mp3'),
            ricochet2: new Audio('sounds/ricochet2.mp3'),
            gameoversong: new Audio('sounds/gameoversong.mp3'),
            startGameClick: new Audio('sounds/start-game.mp3'),
            buttonClick: new Audio('sounds/button-click.mp3'),
            buttonClick2: new Audio('sounds/button-click2.mp3'),
            modalClose: new Audio('sounds/modal-close.mp3'),
            modalOpen: new Audio('sounds/modal-open.mp3'),
            buttonHover: new Audio('sounds/button-hover.mp3'),
            unpause: new Audio('sounds/unpause.mp3'),
            pause: new Audio('sounds/pause.mp3'),
            arrowSmash: new Audio('sounds/smash.mp3'),
        };
        
        // Define loop and volume settings for each audio file
        const audioSettings = {
            menu: { loop: true, volume: 0.4 },
            adventure: { loop: true, volume: 0.4 },
            winner: { loop: false, volume: 0.4 },
            gameOver: { loop: false, volume: 0.4 },
            jump: { loop: false, volume: 0.6 },
            armormarch: { loop: true, volume: 0.5 },
            powerup: { loop: false, volume: 0.7 },
            bark1: { loop: false, volume: 0.5 },
            meow: { loop: false, volume: 0.5 },
            collect2: { loop: false, volume: 0.5 },
            thud: { loop: false, volume: 0.5 },
            thud2: { loop: false, volume: 0.5 },
            thud3: { loop: false, volume: 0.5 },
            heal2: { loop: false, volume: 0.5 },
            ricochet: { loop: false, volume: 0.8 },
            ricochet2: { loop: false, volume: 0.8 },
            ricochet3: { loop: false, volume: 0.8 },
            gameoversong: { loop: false, volume: 0.4 },
            startGameClick: { loop: false, volume: 0.4 },
            buttonClick: { loop: false, volume: 0.4 },
            buttonClick2: { loop: false, volume: 0.4 },
            modalClose: { loop: false, volume: 0.4 },
            modalOpen: { loop: false, volume: 0.4 },
            buttonHover: { loop: false, volume: 0.25 },
            unpause: { loop: false, volume: 0.4 },
            pause: { loop: false, volume: 0.4 },
            arrowSmash: { loop: false, volume: 0.3, playbackRate: 4.0 }
        };
        
        // Apply settings to each audio file
        Object.keys(this.audio).forEach(key => {
            const settings = audioSettings[key];
            this.audio[key].loop = settings.loop;
            this.audio[key].volume = settings.volume;
            if (settings.playbackRate) {
                this.audio[key].playbackRate = settings.playbackRate;
            }
        });
        
        // Store settings for later use in sound effects
        this.audioSettings = audioSettings;
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        this.saveAudioSetting(); // Save to localStorage
        
        if (!this.audioEnabled) {
            // Pause current music (don't reset currentTime to preserve position)
            if (this.currentMusic) {
                this.currentMusic.pause();
            }
        } else {
            // Resume current music if there was one playing
            if (this.currentMusic) {
                this.currentMusic.play().catch(error => {
                    console.warn('Failed to resume audio:', error);
                });
                return false; // Don't need game to restart music
            } else {
                return true; // Signal that game should start appropriate music
            }
        }
        return false;
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
        if (this.currentMusic && this.audioEnabled) {
            this.currentMusic.play().catch(e => {
                // Silently handle autoplay restrictions - will work after user interaction
            });
        }
    }
    
    playSoundEffect(soundKey) {
        if (!this.audioEnabled) return;
        
        const sound = this.audio[soundKey];
        if (sound) {
            // Clone the audio to allow multiple simultaneous plays
            const soundClone = sound.cloneNode();
            soundClone.volume = sound.volume; // Use the original volume setting
            soundClone.loop = false; // Ensure sound effects don't loop
            
            // Apply playback rate if specified in settings
            const settings = this.audioSettings[soundKey];
            if (settings && settings.playbackRate) {
                soundClone.playbackRate = settings.playbackRate;
            }
            
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
    
    // Alias for playSoundEffect for consistency
    playSound(soundKey) {
        this.playSoundEffect(soundKey);
    }
    
    pauseCurrentMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }
    
    resumeCurrentMusic() {
        this.playCurrentMusic();
    }
    
    playMusicForState(gameState) {
        if (!this.audioEnabled) return;
        
        switch (gameState) {
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
    
    stopAllAudio() {
        Object.values(this.audio).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.currentMusic = null;
    }
    
    playRandomThudSound() {
        if (!this.audioEnabled) return;
        
        const thudSounds = ['thud', 'thud2', 'thud3'];
        const randomThud = thudSounds[Math.floor(Math.random() * thudSounds.length)];
        this.playSound(randomThud);
    }
    
    playGameOverSequence() {
        if (!this.audioEnabled) return;
        
        // First play the regular game over sound
        this.pauseCurrentMusic();
        this.playSound('gameOver');
        
        // Clear any existing timeout
        if (this.gameOverTimeout) {
            clearTimeout(this.gameOverTimeout);
        }
        
        // Then after a longer delay, play the game over song
        this.gameOverTimeout = setTimeout(() => {
            if (this.audioEnabled) {
                this.playMusic('gameoversong');
            }
            this.gameOverTimeout = null; // Clear the reference
        }, 2000);
    }
    
    cancelGameOverSequence() {
        if (this.gameOverTimeout) {
            clearTimeout(this.gameOverTimeout);
            this.gameOverTimeout = null;
        }
    }
    
    loadAudioSetting() {
        const saved = localStorage.getItem('armorOfGod_audioEnabled');
        return saved !== null ? JSON.parse(saved) : true; // Default to true
    }
    
    saveAudioSetting() {
        localStorage.setItem('armorOfGod_audioEnabled', JSON.stringify(this.audioEnabled));
    }
}