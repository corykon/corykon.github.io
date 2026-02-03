import React from 'react';

import { sample } from '../../utils';
import GuessInput from "../GuessInput/GuessInput";
import GuessDisplay from "../GuessDisplay/GuessDisplay";
import GameResult from "../GameResult/GameResult";
import { checkGuess } from '../../game-helpers';
import refreshIcon from '../../assets/refresh.svg';

// Cache for Pokemon data
let cachedPokemon = null;

async function fetchPokemonList() {
    if (cachedPokemon) {
        return cachedPokemon;
    }
    
    // Check localStorage cache first
    const CACHE_KEY = 'pokemon-list-cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            const now = Date.now();
            
            // Check if cache is still valid (less than 24 hours old)
            if (now - timestamp < CACHE_DURATION) {
                cachedPokemon = data;
                return data;
            }
        }
    } catch (error) {
        console.warn('Failed to read from localStorage cache:', error);
    }
    
    // Cache is empty or expired, fetch from API
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=151');
        const data = await response.json();
        
        // Extract Pokemon data with names and original names for API calls
        const pokemonData = data.results.map((pokemon, index) => ({
            name: pokemon.name.toUpperCase().replace('-', ''),
            originalName: pokemon.name,
            id: index + 1 // Pokemon IDs are 1-indexed
        }));
        
        // Cache the data with timestamp
        try {
            const cacheData = {
                data: pokemonData,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save to localStorage cache:', error);
        }
        
        cachedPokemon = pokemonData;
        return pokemonData;
    } catch (error) {
        console.error('Failed to fetch Pokemon:', error);
        // Fallback to some hardcoded Pokemon names
        cachedPokemon = [
            { name: 'PIKACHU', originalName: 'pikachu', id: 25 },
            { name: 'CHARIZARD', originalName: 'charizard', id: 6 },
            { name: 'BLASTOISE', originalName: 'blastoise', id: 9 },
            { name: 'VENUSAUR', originalName: 'venusaur', id: 3 }
        ];
        return cachedPokemon;
    }
}

async function fetchPokemonTypes(pokemonId, originalName) {
    const CACHE_KEY = 'pokemon-types-cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    
    try {
        // Check if we already have cached types for this Pokemon
        const cachedTypes = localStorage.getItem(CACHE_KEY);
        if (cachedTypes) {
            const { data, timestamp } = JSON.parse(cachedTypes);
            const now = Date.now();
            
            if (now - timestamp < CACHE_DURATION && data[pokemonId]) {
                return data[pokemonId];
            }
        }
        
        // Fetch types from API
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();
        
        const types = data.types.map(typeInfo => ({
            name: typeInfo.type.name,
            slot: typeInfo.slot
        }));
        
        // Update cache
        try {
            const existingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            const cacheData = {
                data: {
                    ...existingCache.data,
                    [pokemonId]: types
                },
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save types to cache:', error);
        }
        
        return types;
    } catch (error) {
        console.error(`Failed to fetch types for ${originalName}:`, error);
        return [{ name: 'normal', slot: 1 }]; // fallback
    }
}

async function fetchPokemonDescription(originalName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${originalName}/`);
        const data = await response.json();
        
        // Get the first English flavor text entry
        if (data.flavor_text_entries && data.flavor_text_entries.length > 0) {
            const englishEntry = data.flavor_text_entries.find(entry => 
                entry.language.name === 'en'
            );
            
            if (englishEntry) {
                // Clean up the text (remove form feeds and newlines, normalize spacing)
                return englishEntry.flavor_text
                    .replace(/\f/g, ' ')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        }
        
        return "A mysterious Pokemon.";
    } catch (error) {
        console.error('Failed to fetch Pokemon description:', error);
        return "A mysterious Pokemon.";
    }
}

const Game = React.forwardRef(function Game({ onPokemonDiscovered, onPokemonListLoaded, onOpenPokedex, settings }, ref) {
    const [pokemonList, setPokemonList] = React.useState([]);
    const [answer, setAnswer] = React.useState('');
    const [currentPokemon, setCurrentPokemon] = React.useState(null);
    const [pokemonTypes, setPokemonTypes] = React.useState([]);
    const [pokemonDescription, setPokemonDescription] = React.useState('');
    const [guesses, setGuesses] = React.useState([]);
    const [gameIsOver, setGameIsOver] = React.useState(false);
    const [gameIsWon, setGameIsWon] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isNewDiscovery, setIsNewDiscovery] = React.useState(false);
    const [catchCount, setCatchCount] = React.useState(0);
    const [showBanner, setShowBanner] = React.useState(true);
    const [consecutiveRepeats, setConsecutiveRepeats] = React.useState(0);
    const [hasPlayedAgain, setHasPlayedAgain] = React.useState(false);

    // Function to select a new Pokemon and get its description
    async function selectNewPokemon(pokemonList) {
        const discoveredPokemon = JSON.parse(localStorage.getItem('discovered-pokemon') || '[]');
        
        let selectedPokemon;
        
        // Check if "No Repeat Pokemon" setting is enabled
        if (settings?.noRepeatPokemon) {
            const uncaughtPokemon = pokemonList.filter(pokemon => !discoveredPokemon.includes(pokemon.id));
            
            if (uncaughtPokemon.length > 0) {
                selectedPokemon = sample(uncaughtPokemon);
            } else {
                // If all Pokemon are caught and no repeat is on, just pick randomly
                selectedPokemon = sample(pokemonList);
            }
        }
        // Original logic for when no-repeat is disabled
        else if (consecutiveRepeats >= 3) {
            const uncaughtPokemon = pokemonList.filter(pokemon => !discoveredPokemon.includes(pokemon.id));
            
            if (uncaughtPokemon.length > 0) {
                selectedPokemon = sample(uncaughtPokemon);
            } else {
                // Fallback if all Pokemon are caught
                selectedPokemon = sample(pokemonList);
            }
        } else {
            selectedPokemon = sample(pokemonList);
        }
        
        setCurrentPokemon(selectedPokemon);
        setAnswer(selectedPokemon.name);
        
        // Check if this Pokemon was previously caught
        const isPreviouslyCaught = discoveredPokemon.includes(selectedPokemon.id);
        
        // Update consecutive repeat counter (only when no-repeat is disabled)
        if (!settings?.noRepeatPokemon) {
            if (isPreviouslyCaught) {
                setConsecutiveRepeats(prev => prev + 1);
            } else {
                setConsecutiveRepeats(0); // Reset counter when we get a new Pokemon
            }
        } else {
            setConsecutiveRepeats(0); // Always reset when no-repeat is enabled
        }
        
        // Load current catch count for this Pokemon
        const catchCounts = JSON.parse(localStorage.getItem('pokemon-catch-counts') || '{}');
        
        let currentCount = catchCounts[selectedPokemon.id] || 0;
        // If Pokemon has been discovered but no count exists, default to 1
        if (currentCount === 0 && isPreviouslyCaught) {
            currentCount = 1;
        }
        setCatchCount(currentCount);
        
        // Fetch the description
        const description = await fetchPokemonDescription(selectedPokemon.originalName);
        setPokemonDescription(description);
        
        // Fetch types for the selected Pokemon
        const types = await fetchPokemonTypes(selectedPokemon.id, selectedPokemon.originalName);
        setPokemonTypes(types);
    }

    // Load Pokemon data on component mount
    React.useEffect(() => {
        async function loadPokemon() {
            setIsLoading(true);
            const pokemon = await fetchPokemonList();
            setPokemonList(pokemon);
            if (onPokemonListLoaded) {
                onPokemonListLoaded(pokemon);
            }
            await selectNewPokemon(pokemon);
            setIsLoading(false);
        }
        
        loadPokemon();
    }, []); // Empty dependency array to only run on mount

    console.info('answer:', answer);
    
    // Expose handleNewGuess to parent component
    React.useImperativeHandle(ref, () => ({
        submitGuess: (guess) => {
            if (!gameIsOver) {
                handleNewGuess(guess.toUpperCase());
            }
        },
        isGameActive: !gameIsOver
    }));
    
    function handleNewGuess(newGuess) {
        const letters = checkGuess(newGuess, answer);
        const newGuesses = [...guesses, {id: crypto.randomUUID(), word: newGuess, letters}];
        setGuesses(newGuesses);

        if (newGuess === answer) {
            setGameIsOver(true);
            setGameIsWon(true);
            
            if (currentPokemon) {
                // Check if this was a single guess (first try)
                const wasSingleGuess = newGuesses.length === 1;
                
                // Get current catch counts
                const catchCounts = JSON.parse(localStorage.getItem('pokemon-catch-counts') || '{}');
                const currentCount = catchCounts[currentPokemon.id] || 0;
                const newCount = currentCount + 1;
                
                // Update catch count
                catchCounts[currentPokemon.id] = newCount;
                localStorage.setItem('pokemon-catch-counts', JSON.stringify(catchCounts));
                setCatchCount(newCount);
                
                // Check if this is a new discovery
                const discoveredPokemon = JSON.parse(localStorage.getItem('discovered-pokemon') || '[]');
                const wasAlreadyDiscovered = discoveredPokemon.includes(currentPokemon.id);
                setIsNewDiscovery(!wasAlreadyDiscovered);
                
                if (onPokemonDiscovered) {
                    onPokemonDiscovered(currentPokemon.id, wasSingleGuess);
                }
                
                // Auto-open Pokedex for new discoveries (but not if user clicked play again)
                if (!wasAlreadyDiscovered && onOpenPokedex && !hasPlayedAgain) {
                    setTimeout(() => {
                        onOpenPokedex(currentPokemon.id);
                    }, 3000); // Wait 3 seconds to let user read the success message
                }
            }
        } else if (newGuesses.length >= 6) {
            setGameIsOver(true);
        }
    }

    function resetGame() {
        if (pokemonList.length > 0) {
            setHasPlayedAgain(true);  // Track that user clicked play again
            selectNewPokemon(pokemonList);
            setGuesses([]);
            setGameIsOver(false);
            setGameIsWon(false);
            setIsNewDiscovery(false);
            setCatchCount(0);
            setShowBanner(true);
            setConsecutiveRepeats(0); // Reset consecutive repeat counter
        }
    }
    
    function closeBanner() {
        setShowBanner(false);
    }

    if (isLoading) {
        return <div className="pokeball-loader">
            <div className="ball"></div>
            <div className="half-ball"></div>
            <div className="big-button"></div>
            <div className="small-button"></div>
            <div className="horizon"></div>
        </div>
    }

    return <>
        {pokemonDescription && !settings?.hideHints && (
            <div className="pokemon-hint">
                <strong>Hint:</strong> {pokemonDescription}
            </div>
        )}
        <GuessDisplay guesses={guesses} answerLength={answer.length} />
        {gameIsOver && showBanner && (
            <GameResult 
                answer={answer} 
                gameIsWon={gameIsWon} 
                guessCount={guesses.length} 
                reset={resetGame}
                onClose={closeBanner}
                pokemonId={currentPokemon?.id}
                pokemonName={currentPokemon?.originalName}
                isNewDiscovery={isNewDiscovery}
                onOpenPokedex={onOpenPokedex}
                catchCount={catchCount}
            />
        )}
        {gameIsOver ? (
                <div className="play-again-container">
                    <button className="primary-button" onClick={resetGame}>
                        <img src={refreshIcon} alt="Refresh" width="16" height="16" />
                        Play Again
                    </button>
                </div>
            ) : (
                <GuessInput 
                    onGuess={handleNewGuess} 
                    gameIsOver={gameIsOver} 
                    answerLength={answer.length}
                    pokemonTypes={pokemonTypes}
                />
            )}
    </>;
});

export default Game;
