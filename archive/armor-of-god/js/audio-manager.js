class AudioManager {
    constructor() {
        this.audioEnabled = true;
        this.currentMusic = null;
        
        // Load audio files with individual loop settings
        this.audio = {
            menu: new Audio('sounds/menu.mp3'),
            adventure: new Audio('sounds/adventure.mp3'),
            winner: new Audio('sounds/winner1.mp3'),
            gameOver: new Audio('sounds/game-over2.mp3'),
            jump: new Audio('sounds/jump.wav'),
            armormarch: new Audio('sounds/armormarch.mp3'),
            powerup: new Audio('sounds/powerup.mp3')
        };
        
        // Define loop and volume settings for each audio file
        const audioSettings = {
            menu: { loop: true, volume: 0.4 },
            adventure: { loop: true, volume: 0.4 },
            winner: { loop: false, volume: 0.4 },
            gameOver: { loop: false, volume: 0.4 },
            jump: { loop: false, volume: 0.6 },
            armormarch: { loop: true, volume: 0.5 },
            powerup: { loop: false, volume: 0.7 }
        };
        
        // Apply settings to each audio file
        Object.keys(this.audio).forEach(key => {
            const settings = audioSettings[key];
            this.audio[key].loop = settings.loop;
            this.audio[key].volume = settings.volume;
        });
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
            // Resume appropriate music for current state (will be called by game)
            return true; // Signal that game should call playMusicForState
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
}