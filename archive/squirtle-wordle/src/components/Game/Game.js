import React from 'react';

import { sample } from '../../utils';
import GuessInput from "../GuessInput/GuessInput";
import GuessDisplay from "../GuessDisplay/GuessDisplay";
import GameResult from "../GameResult/GameResult";
import { checkGuess } from '../../game-helpers';
import refreshIcon from '../../assets/refresh.svg';
import pokeballIcon from '../../assets/pokeball.svg';
import soundManager from '../../utils/soundManager';

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
                // Check if the cached data has the expected structure with types
                if (data && data.length > 0 && data[0].types) {
                    cachedPokemon = data;
                    return data;
                } else {
                    // Old cache format detected, clear it
                    console.log('Old cache format detected, clearing cache for compatibility...');
                    localStorage.removeItem(CACHE_KEY);
                    // Also clear the old types cache to start fresh
                    localStorage.removeItem('pokemon-types-cache');
                }
            }
        }
    } catch (error) {
        console.warn('Failed to read from localStorage cache:', error);
        // Clear potentially corrupted cache
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem('pokemon-types-cache');
    }
    
    // Cache is empty or expired, fetch from API
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=151');
        const data = await response.json();
        
        // Extract basic Pokemon data
        const pokemonBasicData = data.results.map((pokemon, index) => ({
            name: pokemon.name.toUpperCase().replace('-', ''),
            originalName: pokemon.name,
            id: index + 1 // Pokemon IDs are 1-indexed
        }));

        // Try to get existing types from the old cache
        const oldTypesCache = localStorage.getItem('pokemon-types-cache');
        let existingTypes = {};
        if (oldTypesCache) {
            try {
                const { data: typesData } = JSON.parse(oldTypesCache);
                existingTypes = typesData || {};
            } catch (error) {
                console.warn('Failed to parse existing types cache:', error);
            }
        }

        // Fetch types for Pokemon that don't have cached types
        const pokemonData = await Promise.all(
            pokemonBasicData.map(async (pokemon) => {
                let types = existingTypes[pokemon.id];
                
                if (!types) {
                    // Fetch types for this Pokemon
                    try {
                        const typeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
                        const typeData = await typeResponse.json();
                        types = typeData.types.map(typeInfo => ({
                            name: typeInfo.type.name,
                            slot: typeInfo.slot
                        }));
                        
                        // Add a small delay to avoid overwhelming the API
                        await new Promise(resolve => setTimeout(resolve, 50));
                    } catch (error) {
                        console.warn(`Failed to fetch types for ${pokemon.name}:`, error);
                        types = [{ name: 'normal', slot: 1 }]; // fallback
                    }
                }
                
                return {
                    ...pokemon,
                    types: types
                };
            })
        );
        
        // Cache the complete data with timestamp
        try {
            const cacheData = {
                data: pokemonData,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

            // Also update the types cache with the new data
            const typesCache = {
                data: pokemonData.reduce((acc, pokemon) => {
                    acc[pokemon.id] = pokemon.types;
                    return acc;
                }, {}),
                timestamp: Date.now()
            };
            localStorage.setItem('pokemon-types-cache', JSON.stringify(typesCache));
        } catch (error) {
            console.warn('Failed to save to localStorage cache:', error);
        }
        
        cachedPokemon = pokemonData;
        return pokemonData;
    } catch (error) {
        console.error('Failed to fetch Pokemon:', error);
        // Fallback to some hardcoded Pokemon names
        cachedPokemon = [
            { name: 'PIKACHU', originalName: 'pikachu', id: 25, types: [{ name: 'electric', slot: 1 }] },
            { name: 'CHARIZARD', originalName: 'charizard', id: 6, types: [{ name: 'fire', slot: 1 }, { name: 'flying', slot: 2 }] },
            { name: 'BLASTOISE', originalName: 'blastoise', id: 9, types: [{ name: 'water', slot: 1 }] },
            { name: 'VENUSAUR', originalName: 'venusaur', id: 3, types: [{ name: 'grass', slot: 1 }, { name: 'poison', slot: 2 }] }
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

// Helper function to get all unique types from the Pokemon list
function getAllPokemonTypes(pokemonList) {
    const typesSet = new Set();
    
    pokemonList.forEach(pokemon => {
        if (pokemon.types) {
            pokemon.types.forEach(typeInfo => {
                typesSet.add(typeInfo.name);
            });
        }
    });
    
    return Array.from(typesSet).sort();
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
    const [isLoadingHint, setIsLoadingHint] = React.useState(false);
    const [isNewDiscovery, setIsNewDiscovery] = React.useState(false);
    const [catchCount, setCatchCount] = React.useState(0);
    const [showBanner, setShowBanner] = React.useState(true);
    const [consecutiveRepeats, setConsecutiveRepeats] = React.useState(0);
    const pokedexTimeoutRef = React.useRef(null);

    // Function to select a new Pokemon and get its description
    async function selectNewPokemon(pokemonList) {
        const discoveredPokemon = JSON.parse(localStorage.getItem('discovered-pokemon') || '[]');
        
        let selectedPokemon;
        
        // SPECIAL CASE: Force Pikachu (#25) as the first Pokemon for new players
        if (discoveredPokemon.length === 0) {
            selectedPokemon = pokemonList.find(pokemon => pokemon.id === 25); // Pikachu
            if (!selectedPokemon) {
                // Fallback if Pikachu not found in list
                selectedPokemon = sample(pokemonList);
            }
        }
        // Check if "No Repeat Pokemon" setting is enabled
        else if (settings?.noRepeatPokemon) {
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
        setIsLoadingHint(true);
        const types = await fetchPokemonTypes(selectedPokemon.id, selectedPokemon.originalName);
        setPokemonTypes(types);
        setIsLoadingHint(false);
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

    // Update sound manager when settings change
    React.useEffect(() => {
        if (settings) {
            soundManager.setClassicSounds(settings.classicSounds);
        }
    }, [settings?.classicSounds]);

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
            soundManager.playCorrectGuess();
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
                
                // Play pokemon caught sound
                soundManager.playPokemonCaught();
                
                // Check if this is a new discovery
                const discoveredPokemon = JSON.parse(localStorage.getItem('discovered-pokemon') || '[]');
                const wasAlreadyDiscovered = discoveredPokemon.includes(currentPokemon.id);
                setIsNewDiscovery(!wasAlreadyDiscovered);
                
                if (onPokemonDiscovered) {
                    onPokemonDiscovered(currentPokemon.id, wasSingleGuess);
                }
                
                // Auto-open Pokedex for new discoveries after 3 seconds (if setting is enabled)
                if (!wasAlreadyDiscovered && onOpenPokedex && settings?.autoOpenPokedex) {
                    pokedexTimeoutRef.current = setTimeout(() => {
                        onOpenPokedex(currentPokemon.id);
                        // Only play sound when pokedex actually opens automatically
                        soundManager.playPokedexOpenSound();
                    }, 3000); // Wait 3 seconds to let user read the success message
                }
            }
        } else if (newGuesses.length >= 6) {
            soundManager.playGameLost();
            soundManager.playPokemonRunaway();
            setGameIsOver(true);
        } else {
            soundManager.playWrongGuess();
        }
    }

    function resetGame() {
        soundManager.playButtonClick();
        // Cancel pending Pokedex auto-open
        if (pokedexTimeoutRef.current) {
            clearTimeout(pokedexTimeoutRef.current);
            pokedexTimeoutRef.current = null;
        }
        
        if (pokemonList.length > 0) {
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
        // Cancel pending Pokedex auto-open when banner is dismissed
        if (pokedexTimeoutRef.current) {
            clearTimeout(pokedexTimeoutRef.current);
            pokedexTimeoutRef.current = null;
        }
        
        setShowBanner(false);
    }

    if (isLoading) {
        return <div className="pokeball-loader">
            <img src={pokeballIcon} alt="Loading..." className="pokeball-icon" />
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
                    <button 
                        className="primary-button" 
                        onClick={resetGame}
                        onMouseEnter={() => soundManager.playBubbleHover()}
                    >
                        <img src={refreshIcon} alt="Refresh" width="16" height="16" />
                        Play Again
                    </button>
                </div>
            ) : (
                <GuessInput 
                    onGuess={handleNewGuess} 
                    gameIsOver={gameIsOver} 
                    answerLength={answer.length}
                    pokemonTypes={pokemonTypes}                    isLoadingHint={isLoadingHint}                />
            )}
    </>;
});

export default Game;
export { getAllPokemonTypes };
