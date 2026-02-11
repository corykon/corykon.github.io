import React from 'react';
import refreshIcon from '../../assets/refresh.svg';
import pokeballIcon from '../../assets/pokeball.svg';
import pokeballOpenIcon from '../../assets/pokeball-open.svg';

function GameResult({answer, gameIsWon, guessCount, reset, pokemonId, pokemonName, isNewDiscovery, onOpenPokedex, onClose, catchCount}) {
    const [animationKey, setAnimationKey] = React.useState(0);
    const [pokemonCry, setPokemonCry] = React.useState(null);
    const [isLoadingCry, setIsLoadingCry] = React.useState(false);
    
    const handlePokeballClick = () => {
        setAnimationKey(prev => prev + 1);
    };
    
    // Function to fetch and cache Pokemon cry
    React.useEffect(() => {
        if (pokemonId) {
            fetchPokemonCry(pokemonId);
        } else {
            // Clean up audio when no Pokemon ID
            if (pokemonCry) {
                pokemonCry.pause();
                pokemonCry.src = '';
                pokemonCry.load();
            }
            setPokemonCry(null);
            setIsLoadingCry(false);
        }
        
        // Cleanup function
        return () => {
            if (pokemonCry) {
                pokemonCry.pause();
                pokemonCry.src = '';
                pokemonCry.load();
            }
        };
    }, [pokemonId]);
    
    const fetchPokemonCry = async (id) => {
        if (isLoadingCry) return; // Don't fetch if already loading
        
        // Clean up previous audio
        if (pokemonCry) {
            pokemonCry.pause();
            pokemonCry.src = '';
            pokemonCry.load();
        }
        
        setIsLoadingCry(true);
        setPokemonCry(null);
        
        try {
            const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
            
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            audio.preload = 'auto';
            
            // Wait for audio to be ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Audio load timeout'));
                }, 5000);
                
                const cleanup = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', onLoad);
                    audio.removeEventListener('loadeddata', onLoad);
                    audio.removeEventListener('error', onError);
                };
                
                const onLoad = () => {
                    cleanup();
                    resolve();
                };
                
                const onError = (e) => {
                    cleanup();
                    reject(new Error(`Audio load failed: ${e.type}`));
                };
                
                audio.addEventListener('canplaythrough', onLoad, { once: true });
                audio.addEventListener('loadeddata', onLoad, { once: true });
                audio.addEventListener('error', onError, { once: true });
                
                // Set source after event listeners are attached
                audio.src = cryUrl;
            });
            
            setPokemonCry(audio);
        } catch (error) {
            console.warn(`Failed to load Pokemon cry for ID ${id}:`, error);
            setPokemonCry(null);
        } finally {
            setIsLoadingCry(false);
        }
    };
    
    const handlePokemonImageClick = () => {
        if (pokemonCry && !isLoadingCry) {
            // Reset audio to beginning and play
            pokemonCry.currentTime = 0;
            pokemonCry.play().catch(error => {
                console.warn('Failed to play Pokemon cry:', error);
            });
        }
    };
    
    const getPokemonImageTitle = () => {
        if (isLoadingCry) return "Loading Pokémon cry...";
        if (pokemonCry) return "Click to hear this Pokémon's cry!";
        return "Pokémon cry unavailable";
    };
    
    if (gameIsWon) {
        return <div className="happy banner">
            <button className="close-banner-button" onClick={onClose}>×</button>
            {pokemonId && (
                <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`}
                    alt={answer}
                    className={`pokemon-result-image ${(pokemonCry && !isLoadingCry) ? 'clickable-pokemon' : ''}`}
                    onClick={handlePokemonImageClick}
                    title={getPokemonImageTitle()}
                    style={{cursor: (pokemonCry && !isLoadingCry) ? 'pointer' : 'default'}}
                />
            )}
            <div className="caught-message-container">
                <div className="pokeball-wrapper success" title="Click to play pokeball animation again" onClick={handlePokeballClick}>
                    <div className="pokeball-animation-container" key={`success-${animationKey}`}>
                        <img 
                            src={pokeballIcon} 
                            alt="Pokeball" 
                            className="pokeball-catch-animation"
                        />
                        <div className="pokeball-catch-circle"></div>
                        <svg 
                            className="pokeball-checkmark"
                            width="8" 
                            height="8" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="4"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                    </div>
                </div>
                <p className="caught-pokemon-message">
                    <strong>You caught a <span className="results-pokemon-name">{pokemonName || answer}</span> in {guessCount} guess{guessCount !== 1 ? 'es' : ''}!</strong>
                </p>
            </div>
            
            <p className="pokedex-link-message">
                {catchCount > 1 && (
                    <span>
                        You've caught <span className="results-pokemon-name">{pokemonName || answer}</span> {catchCount} times.
                    </span>
                )}{' '}
                {isNewDiscovery ? "It's been added to your" : "View it in your"}{' '}
                <button 
                    className="pokedex-link" 
                    onClick={() => onOpenPokedex && onOpenPokedex(pokemonId)}
                    type="button"
                >
                    pokédex
                </button>.
            </p>
            <button className="play-again-button" onClick={reset}>
                <img src={refreshIcon} alt="Refresh" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Play again
            </button>
        </div>;
    } else {
        return <div className="sad banner">
            <button className="close-banner-button" onClick={onClose}>×</button>
            {pokemonId && (
                <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`}
                    alt={answer}
                    className={`pokemon-result-image sad-pokemon-image ${(pokemonCry && !isLoadingCry) ? 'clickable-pokemon' : ''}`}
                    onClick={handlePokemonImageClick}
                    title={getPokemonImageTitle()}
                    style={{cursor: (pokemonCry && !isLoadingCry) ? 'pointer' : 'default'}}
                />
            )}
            <div className="failed-message-container">
                <div className="pokeball-wrapper failure" title="Click to play pokeball animation again" onClick={handlePokeballClick}>
                    <div className="pokeball-animation-container" key={`fail-${animationKey}`}>
                        <img 
                            src={pokeballIcon} 
                            alt="Pokeball" 
                            className="pokeball-fail-animation"
                        />
                        <img 
                            src={pokeballOpenIcon} 
                            alt="Open Pokeball" 
                            className="pokeball-open-animation"
                        />
                        <div className="pokeball-explosion-ring"></div>
                    </div>
                </div>
                <p>Sorry, the correct answer is <strong>{answer}</strong>.</p>
            </div>
            <button className="play-again-button" onClick={reset}>
                <img src={refreshIcon} alt="Refresh" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Play again
            </button>
        </div>;
    }
  
}

export default GameResult;
