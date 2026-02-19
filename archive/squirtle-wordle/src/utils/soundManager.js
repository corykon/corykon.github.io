// Sound Manager for Squirtle Wordle
import buttonHover from 'url:../assets/button-hover.mp3';
import buttonClick from 'url:../assets/button-click.mp3';
import buttonClick2 from 'url:../assets/button-click-2.mp3';
import buttonClick3 from 'url:../assets/button-click-3.mp3';
import click from 'url:../assets/click.mp3';
import click2 from 'url:../assets/click2.mp3';
import inputHover from 'url:../assets/input-hover.mp3';
import inputClick from 'url:../assets/input-click.mp3';
import bubbleHover from 'url:../assets/bubble-hover.mp3';
import gridClick from 'url:../assets/grid-click.mp3';
import sliderOn from 'url:../assets/slider-on.mp3';
import sliderOff from 'url:../assets/slider-off.mp3';
import guessSuccess from 'url:../assets/guess-success.mp3';
import guessWrong from 'url:../assets/guess-wrong.mp3';
import guessLost from 'url:../assets/guess-lost.mp3';
import caughtAPokemon from 'url:../assets/caught-a-pokemon.mp3';
import pokemonRunaway from 'url:../assets/pokemon-runaway.mp3';
import pokedexOpenAfterCatch from 'url:../assets/pokedex-open-after-catch.mp3';
import victoryBeat from 'url:../assets/victory-beat.mp3';
import gameboySound from 'url:../assets/gameboy-sound.mp3';

class SoundManager {
    constructor() {
        this.sounds = {
            buttonHover: new Audio(buttonHover),
            buttonClick: new Audio(buttonClick),
            buttonClick2: new Audio(buttonClick2),
            buttonClick3: new Audio(buttonClick3),
            click: new Audio(click),
            click2: new Audio(click2),
            inputHover: new Audio(inputHover),
            inputClick: new Audio(inputClick),
            bubbleHover: new Audio(bubbleHover),
            gridClick: new Audio(gridClick),
            sliderOn: new Audio(sliderOn),
            sliderOff: new Audio(sliderOff),
            guessSuccess: new Audio(guessSuccess),
            guessWrong: new Audio(guessWrong),
            guessLost: new Audio(guessLost),
            caughtAPokemon: new Audio(caughtAPokemon),
            pokemonRunaway: new Audio(pokemonRunaway),
            pokedexOpenAfterCatch: new Audio(pokedexOpenAfterCatch),
            victoryBeat: new Audio(victoryBeat),
            gameboySound: new Audio(gameboySound)
        };

        // Set volumes for better balance
        this.sounds.buttonHover.volume = 1;
        this.sounds.buttonClick.volume = 0.25;
        this.sounds.buttonClick2.volume = 0.4;
        this.sounds.buttonClick3.volume = 0.4;
        this.sounds.click.volume = 0.1;
        this.sounds.click2.volume = 0.4;
        this.sounds.inputHover.volume = 0.3;
        this.sounds.inputClick.volume = 0.35;
        this.sounds.bubbleHover.volume = 0.3;
        this.sounds.gridClick.volume = 0.3;
        this.sounds.sliderOn.volume = 0.4;
        this.sounds.sliderOff.volume = 0.4;
        this.sounds.guessSuccess.volume = 0.7;
        this.sounds.guessWrong.volume = 1;
        this.sounds.guessLost.volume = 0.25;
        this.sounds.caughtAPokemon.volume = 0.8;
        this.sounds.pokemonRunaway.volume = 0.7;
        this.sounds.pokedexOpenAfterCatch.volume = 0.6;
        this.sounds.victoryBeat.volume = 0.7;
        this.sounds.gameboySound.volume = 0.2;

        // Loop victory beat
        this.sounds.victoryBeat.loop = true;

        this.isMuted = this.loadMutedState();
        this.classicSoundsEnabled = true;
        this.currentBgMusic = null;
    }

    loadMutedState() {
        try {
            const stored = localStorage.getItem('sound-muted');
            return stored === 'true';
        } catch {
            return false;
        }
    }

    saveMutedState() {
        try {
            localStorage.setItem('sound-muted', this.isMuted.toString());
        } catch {
            // Ignore localStorage errors
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMutedState();
        
        // Stop any currently playing background music if muting
        if (this.isMuted && this.currentBgMusic) {
            this.stopBackgroundMusic();
        }
        
        return this.isMuted;
    }

    setClassicSounds(enabled) {
        this.classicSoundsEnabled = enabled;
    }

    play(soundName, options = {}) {
        if (this.isMuted) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;

        // Stop and reset the sound
        sound.currentTime = 0;
        
        // Play the sound
        const playPromise = sound.play();
        
        // Handle play promise (some browsers require user interaction first)
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented, which is normal on first load
                console.log('Sound play prevented:', error);
            });
        }

        return playPromise;
    }

    playSequence(soundNames, delay = 500) {
        if (this.isMuted) return;
        
        soundNames.forEach((soundName, index) => {
            setTimeout(() => {
                this.play(soundName);
            }, index * delay);
        });
    }

    playBackgroundMusic(soundName) {
        if (this.isMuted) return;
        
        // Stop any current background music
        this.stopBackgroundMusic();
        
        this.currentBgMusic = soundName;
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Background music play prevented:', error);
                });
            }
        }
    }

    stopBackgroundMusic() {
        if (this.currentBgMusic) {
            const sound = this.sounds[this.currentBgMusic];
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
            this.currentBgMusic = null;
        }
    }

    stop(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    // Convenience methods for specific game events
    playButtonHover() {
        this.play('buttonHover');
    }

    playButtonClick() {
        this.play('buttonClick');
    }

    playModalDismiss() {
        this.play('buttonClick2');
    }

    playFilterHover() {
        this.play('click');
    }

    playFilterClick() {
        this.play('click2');
    }

    playInputHover() {
        this.play('inputHover');
    }

    playInputClick() {
        this.play('inputClick');
    }

    playButtonClick3() {
        this.play('buttonClick3');
    }

    playSliderOn() {
        this.play('sliderOn');
    }

    playSliderOff() {
        this.play('sliderOff');
    }

    playBubbleHover() {
        this.play('bubbleHover');
    }

    playGridClick() {
        this.play('gridClick');
    }

    playCorrectGuess() {
        this.play('guessSuccess');
    }

    playWrongGuess() {
        this.play('guessWrong');
    }

    playGameLost() {
        this.play('guessLost');
    }

    playPokemonCaught() {
        // Only play if classic sounds are enabled
        if (this.classicSoundsEnabled) {
            // Play after a short delay to let guess-success finish
            setTimeout(() => {
                this.playPokemonCaughtSound();
            }, 800);
        }
    }

    playPokemonRunaway() {
        // Play during the Pokemon shaking/fading animation (2.5s after game over)
        setTimeout(() => {
            this.play('pokemonRunaway');
        }, 2500);
    }

    playPokemonCaughtSound() {
        // Direct sound play for when pokemon is caught, used within timeouts
        if (this.classicSoundsEnabled) {
            this.play('caughtAPokemon');
        }
    }

    playPokedexOpenSound() {
        // Direct sound play for when pokedex opens, used within timeouts
        if (this.classicSoundsEnabled && !this.currentBgMusic) {
            this.play('pokedexOpenAfterCatch');
        } else {
            this.playGridClick(); // Fallback sound if pokedex open sound is not played
        }
    }

    playPokedexOpen() {
        // Legacy method - kept for compatibility but should not set its own timeout
        // Use playPokedexOpenSound() directly in timeout callbacks instead
        if (this.classicSoundsEnabled && !this.currentBgMusic) {
            this.play('pokedexOpenAfterCatch');
        }
    }

    playVictoryBeat() {
        this.playBackgroundMusic('victoryBeat');
    }

    stopVictoryBeat() {
        if (this.currentBgMusic === 'victoryBeat') {
            this.stopBackgroundMusic();
        }
    }

    playGameboySound() {
        this.play('gameboySound');
    }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;