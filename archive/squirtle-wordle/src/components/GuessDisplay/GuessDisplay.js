import React from 'react';
import { NUM_OF_GUESSES_ALLOWED } from "../../constants";
import { range } from "../../utils";
import soundManager from '../../utils/soundManager';

function GuessDisplay({guesses, answerLength}) {
    function getDescForLetterStatus(status) {
        switch (status) {
            case 'correct':
                return 'Nailed it.';
            case 'misplaced':
                return 'Right letter, wrong spot.';
            case 'incorrect':
                return 'Not in the word.';
            default:
                return '';
        }
    }
    
    // Use the actual answer length if provided, otherwise default to 5
    const wordLength = answerLength || 5;
    
    return <div className="guess-results">
        {range(0, NUM_OF_GUESSES_ALLOWED).map((index) => {
            const guess = guesses[index];
            return <p className="guess" key={index}>
                {range(0, wordLength).map((i) => {
                    const letter = guess?.letters[i];
                    const helpText = letter ? getDescForLetterStatus(letter.status) : '';
                    return <span 
                        key={i} 
                        title={helpText} 
                        className={`cell ${letter?.status}`}
                        onMouseEnter={() => soundManager.playButtonHover()}
                    >
                        {letter?.letter || ''}
                    </span>;
                })}
            </p>
        })}
    </div>;
}

export default GuessDisplay;
