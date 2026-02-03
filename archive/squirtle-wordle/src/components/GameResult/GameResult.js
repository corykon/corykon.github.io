import React from 'react';
import refreshIcon from '../../assets/refresh.svg';
import pokeballIcon from '../../assets/pokeball.svg';
import pokeballOpenIcon from '../../assets/pokeball-open.svg';

function GameResult({answer, gameIsWon, guessCount, reset, pokemonId, pokemonName, isNewDiscovery, onOpenPokedex, onClose, catchCount}) {
    const [animationKey, setAnimationKey] = React.useState(0);
    
    const handlePokeballClick = () => {
        setAnimationKey(prev => prev + 1);
    };
    
    if (gameIsWon) {
        return <div className="happy banner">
            <button className="close-banner-button" onClick={onClose}>×</button>
            {pokemonId && (
                <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`}
                    alt={answer}
                    className="pokemon-result-image"
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
                    <strong>You caught a {pokemonName || answer} in {guessCount} guess{guessCount !== 1 ? 'es' : ''}!</strong>
                </p>
            </div>
            
            <p className="pokedex-link-message">
                {catchCount > 1 && (
                    <span>
                        You've caught {pokemonName || answer} {catchCount} times.
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
                    className="pokemon-result-image sad-pokemon-image"
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
