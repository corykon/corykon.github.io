import React from 'react';
import TypeBadge from '../TypeBadge';
import pokeballIcon from '../../assets/pokeball.svg';
import soundManager from '../../utils/soundManager';

function GuessInput({onGuess, gameIsOver, answerLength, pokemonTypes, isLoadingHint}) {
    const [pendingGuess, setPendingGuess] = React.useState('');
    
    function handleSubmit(event) {
        event.preventDefault();
        
        // Only require at least one letter, allow partial guesses
        if (pendingGuess.length === 0) {
            return; // Don't submit empty guesses
        }
        
        console.log('Guess:', pendingGuess);
        setPendingGuess('');
        onGuess(pendingGuess);
    }
    
    function handleInputChange(e) {
        const value = e.target.value.toLocaleUpperCase().trim().slice(0, answerLength);
        setPendingGuess(value);
    }
    
    return <form className="guess-input-wrapper" onSubmit={handleSubmit}>
        <label htmlFor="guess-input">Guess the Pokémon:</label>
        <input 
            id="guess-input" 
            type="text" 
            value={pendingGuess} 
            autoComplete="off" 
            autoFocus 
            onChange={handleInputChange}
            pattern={`[A-Za-z]{1,${answerLength}}`}
            disabled={gameIsOver}
        />
        <div className="type-hint">
            Guess the {answerLength}-letter 
            {isLoadingHint ? (
                <div className="mini-pokeball-loader">
                    <img src={pokeballIcon} alt="Loading..." className="mini-pokeball-icon" />
                </div>
            ) : pokemonTypes && pokemonTypes.length > 0 ? (
                <div className="type-badges inline">
                    {pokemonTypes.map((typeInfo, index) => (
                        <TypeBadge 
                            key={index} 
                            type={typeInfo.name} 
                            variant="full" 
                            size="medium" 
                        />
                    ))}
                </div>
            ) : (
                <span className="type-badge unknown">unknown type</span>
            )}
            Pokémon
        </div>
    </form>;
}

export default GuessInput;
