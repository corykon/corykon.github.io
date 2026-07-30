class AudioManager {
    constructor() {
        // Load audio setting from localStorage, default to true
        this.audioEnabled = this.loadAudioSetting();
        this.currentMusic = null;
        this.gameOverTimeout = null;
        this.soundPools = {};
        
        // Load audio files with individual loop settings
        this.audio = {
            menu: new Audio('sounds/menu-song.mp3'),
            adventure: new Audio('sounds/adventure.mp3'),
            winner: new Audio('sounds/winner1.mp3'),
            victory: new Audio('sounds/victory.mp3'),
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
            levelIntro: new Audio('sounds/level-intro.mp3'),
            arrowSmash: new Audio('sounds/smash.mp3'),
            smash: new Audio('sounds/smash.mp3'),
            snailYell: new Audio('sounds/snail-yell.wav'),
            snailPop: new Audio('sounds/snail-pop.wav'),
            falling: new Audio('sounds/falling.mp3'),
            fallingRock: new Audio('sounds/falling.mp3'),
            grunt1: new Audio('sounds/grunt1.mp3'),
            grunt2: new Audio('sounds/grunt2.mp3'),
            grunt1Low: new Audio('sounds/grunt1.mp3'),
            grunt2Low: new Audio('sounds/grunt2.mp3'),
            golem: new Audio('sounds/golem.mp3'),
            golemLanding: new Audio('sounds/golem-landing.mp3'),
            golemPowerup: new Audio('sounds/golem-powerup.mp3'),
            golemReignite: new Audio('sounds/golem-reignite.mp3'),
            golemDefeated: new Audio('sounds/golem-defeated.mp3'),
            stonesFalling: new Audio('sounds/stones-falling.mp3'),
            earthquakeRumble: new Audio('sounds/earthquake-rumble.mp3'),
            bossFight: new Audio('sounds/boss-fight.mp3'),
            openingCutscene: new Audio('sounds/opening-cutscene-peaceful.mp3'),
            openingBadNews: new Audio('sounds/bad-news2.mp3'),
            openingBadNewsFinal: new Audio('sounds/bad-news.mp3'),
            thunderAmbience: new Audio('sounds/thunder-ambience.mp3'),
            hallOfHeroes: new Audio('sounds/hall-of-heroes.mp3'),
            credits: new Audio('sounds/closing-credits.mp3')
        };
        
        // Define loop and volume settings for each audio file
        const audioSettings = {
            menu: { loop: true, volume: 0.4 },
            adventure: { loop: true, volume: 0.4 },
            winner: { loop: false, volume: 0.4 },
            // The post-boss ascent can run longer than a single pass; keep this same track
            // through the temple entrance and its fireworks celebration.
            victory: { loop: true, volume: 0.4 },
            gameOver: { loop: false, volume: 0.4 },
            jump: { loop: false, volume: 0.6 },
            armormarch: { loop: true, volume: 0.5 },
            powerup: { loop: false, volume: 0.7 },
            bark1: { loop: false, volume: 0.5 },
            meow: { loop: false, volume: 0.5 },
            collect2: { loop: false, volume: 0.5 },
            thud: { loop: false, volume: 0.5 },
            thud2: { loop: false, volume: 0.5 },
            thud3: { loop: false, volume: 1.0 },
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
            levelIntro: { loop: true, volume: 0.4 },
            arrowSmash: { loop: false, volume: 0.3, playbackRate: 4.0 },
            smash: { loop: false, volume: 0.3, playbackRate: 1.0 },
            snailYell: { loop: false, volume: 0.5},
            snailPop: { loop: false, volume: 0.5},
            falling: { loop: false, volume: 0.5},
            fallingRock: { loop: false, volume: 0.125},
            grunt1: { loop: false, volume: 0.3},
            grunt2: { loop: false, volume: 0.3},
            grunt1Low: { loop: false, volume: 1.0, playbackRate: 0.6},
            grunt2Low: { loop: false, volume: 1.0, playbackRate: 0.6},
            golemReignite: { loop: false, volume: 0.35},
            golemDefeated: { loop: false, volume: 0.7},
            stonesFalling: { loop: false, volume: 0.55},
            golem: { loop: false, volume: 0.7},
            golemLanding: { loop: false, volume: 0.55},
            golemPowerup: { loop: false, volume: 0.65},
            earthquakeRumble: { loop: false, volume: 1.0, fadeOutAfterMs: 1500, fadeOutDurationMs: 500},
            bossFight: { loop: true, volume: 0.45},
            openingCutscene: { loop: true, volume: 0.4},
            openingBadNews: { loop: true, volume: 0.45},
            openingBadNewsFinal: { loop: true, volume: 0.45},
            thunderAmbience: { loop: true, volume: 0.55},
            hallOfHeroes: { loop: true, volume: 0.4},
            credits: { loop: false, volume: 0.4}
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
        // A rapid retry can happen before the delayed Game Over song starts.
        // Starting any other track must cancel that pending transition.
        if (musicKey !== 'gameoversong') this.cancelGameOverSequence();
        const newMusic = this.audio[musicKey];
        // Muting must not freeze the music selection.  Remember the requested track so
        // unmuting during a boss fight resumes boss music rather than an earlier level song.
        if (!this.audioEnabled) {
            if (this.currentMusic && this.currentMusic !== newMusic) {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }
            if (newMusic) this.currentMusic = newMusic;
            return;
        }
        
        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        // Start new music
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

    preloadMusic(...musicKeys) {
        musicKeys.forEach(musicKey => {
            const music = this.audio[musicKey];
            if (!music || music === this.currentMusic || music.readyState >= 3) return;
            music.preload = 'auto';
            music.load();
        });
    }

    stopMusic(musicKey) {
        const music = this.audio[musicKey];
        if (!music) return;
        music.pause();
        music.currentTime = 0;
        if (this.currentMusic === music) this.currentMusic = null;
    }

    fadeOutCurrentMusic(duration = 3000) {
        const music = this.currentMusic;
        if (!music || !this.audioEnabled) return;
        const startingVolume = music.volume;
        const steps = 30;
        let step = 0;
        const fadeTimer = setInterval(() => {
            step++;
            music.volume = startingVolume * Math.max(0, 1 - step / steps);
            if (step >= steps) {
                clearInterval(fadeTimer);
                music.pause();
                music.currentTime = 0;
                music.volume = startingVolume;
                if (this.currentMusic === music) this.currentMusic = null;
            }
        }, duration / steps);
    }

    fadeOutSound(soundKey, duration = 1000) {
        const sound = this.audio[soundKey];
        if (!sound || sound.paused || !this.audioEnabled) return;
        const startingVolume = sound.volume;
        const steps = 20;
        let step = 0;
        const fadeTimer = setInterval(() => {
            step++;
            sound.volume = startingVolume * Math.max(0, 1 - step / steps);
            if (step >= steps) {
                clearInterval(fadeTimer);
                sound.pause();
                sound.currentTime = 0;
                sound.volume = startingVolume;
            }
        }, duration / steps);
    }

    crossfadeToMusic(musicKey, duration = 2000) {
        const incoming = this.audio[musicKey];
        const outgoing = this.currentMusic;
        if (!incoming || outgoing === incoming) return;
        if (!this.audioEnabled) {
            this.currentMusic = incoming;
            return;
        }
        const outgoingVolume = outgoing?.volume ?? 0;
        const incomingVolume = incoming.volume;
        incoming.currentTime = 0;
        incoming.volume = 0;
        incoming.play().catch(() => {});
        this.currentMusic = incoming;
        const steps = 20;
        let step = 0;
        const fadeTimer = setInterval(() => {
            step++;
            if (outgoing) outgoing.volume = outgoingVolume * Math.max(0, 1 - step / steps);
            incoming.volume = incomingVolume * Math.min(1, step / steps);
            if (step >= steps) {
                clearInterval(fadeTimer);
                if (outgoing) {
                    outgoing.pause();
                    outgoing.currentTime = 0;
                    outgoing.volume = outgoingVolume;
                }
                incoming.volume = incomingVolume;
            }
        }, duration / steps);
    }
    
    getPooledSoundEffect(soundKey, source) {
        const pool = this.soundPools[soundKey] || (this.soundPools[soundKey] = []);
        let sound = pool.find(candidate => candidate.paused);
        if (sound) return sound;

        sound = source.cloneNode();
        sound.loop = false;
        sound.addEventListener('ended', () => {
            sound.pause();
            sound.currentTime = 0;
        });
        pool.push(sound);
        return sound;
    }

    playSoundEffect(soundKey) {
        if (!this.audioEnabled) return;
        
        const sound = this.audio[soundKey];
        if (sound) {
            // Reuse an idle clone, creating another only when this effect overlaps itself.
            // This keeps simultaneous effects while avoiding a media request on every play.
            const soundClone = this.getPooledSoundEffect(soundKey, sound);
            soundClone.volume = sound.volume; // Use the original volume setting
            soundClone.loop = false; // Ensure sound effects don't loop
            soundClone.currentTime = 0;
            soundClone._poolPlaybackId = (soundClone._poolPlaybackId || 0) + 1;
            const playbackId = soundClone._poolPlaybackId;
            
            // Apply playback rate if specified in settings
            const settings = this.audioSettings[soundKey];
            if (settings && settings.playbackRate) {
                soundClone.playbackRate = settings.playbackRate;
                soundClone.preservesPitch = false;
            }
            
            // The earthquake file is longer than a single impact. Fade its tail so a pound
            // feels heavy without leaving a rumble playing through the next boss action.
            if (settings && settings.fadeOutAfterMs) {
                const initialVolume = soundClone.volume;
                setTimeout(() => {
                    if (soundClone._poolPlaybackId !== playbackId || soundClone.paused) return;
                    const fadeSteps = 10;
                    let step = 0;
                    const fadeInterval = setInterval(() => {
                        if (soundClone._poolPlaybackId !== playbackId || soundClone.paused) {
                            clearInterval(fadeInterval);
                            return;
                        }
                        step++;
                        soundClone.volume = initialVolume * Math.max(0, 1 - step / fadeSteps);
                        if (step >= fadeSteps) {
                            clearInterval(fadeInterval);
                            soundClone.pause();
                            soundClone.currentTime = 0;
                        }
                    }, settings.fadeOutDurationMs / fadeSteps);
                }, settings.fadeOutAfterMs);
            }
            
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
            case 'credits':
                this.playMusic('credits');
                break;
        }
    }
    
    stopAllAudio() {
        Object.values(this.audio).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        Object.values(this.soundPools).forEach(pool => {
            pool.forEach(sound => {
                sound._poolPlaybackId = (sound._poolPlaybackId || 0) + 1;
                sound.pause();
                sound.currentTime = 0;
            });
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
