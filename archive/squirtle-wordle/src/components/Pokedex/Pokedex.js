import React from 'react';
import pokeballIcon from '../../assets/pokeball.svg';
import searchIcon from '../../assets/search.svg';
import shareIcon from '../../assets/share.svg';

function Pokedex({ isOpen, onClose, pokemonList, discoveredPokemon, singleGuessPokemon, highlightPokemonId, isMaster, trophyIcon, onSubmitGuess }) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [pokemonDescriptions, setPokemonDescriptions] = React.useState({});
    const [pokemonTypes, setPokemonTypes] = React.useState({});
    const [selectedPokemon, setSelectedPokemon] = React.useState(null);
    const [activeFilter, setActiveFilter] = React.useState('all');
    const [hasAutoScrolled, setHasAutoScrolled] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('pokemon id');
    const [showSortDropdown, setShowSortDropdown] = React.useState(false);
    const [catchCounts, setCatchCounts] = React.useState({});
    const [showScrollButton, setShowScrollButton] = React.useState(false);
    const [hoveredShareButton, setHoveredShareButton] = React.useState(null);
    const [pokemonCry, setPokemonCry] = React.useState(null);
    const [isLoadingCry, setIsLoadingCry] = React.useState(false);
    
    // Function to fetch and cache Pokemon types
    const fetchTypes = React.useCallback(async (pokemon) => {
        if (pokemonTypes[pokemon.id]) return;
        
        const CACHE_KEY = 'pokemon-types-cache';
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        
        try {
            // Check if we already have cached types for this Pokemon
            const cachedTypes = localStorage.getItem(CACHE_KEY);
            if (cachedTypes) {
                const { data, timestamp } = JSON.parse(cachedTypes);
                const now = Date.now();
                
                if (now - timestamp < CACHE_DURATION && data[pokemon.id]) {
                    setPokemonTypes(prev => ({...prev, [pokemon.id]: data[pokemon.id]}));
                    return;
                }
            }
            
            // Fetch types from API
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
            const pokemonData = await response.json();
            
            const types = pokemonData.types.map(typeInfo => ({
                name: typeInfo.type.name,
                slot: typeInfo.slot
            }));
            
            // Update cache
            try {
                const existingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
                const cacheData = {
                    data: {
                        ...existingCache.data,
                        [pokemon.id]: types
                    },
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            } catch (error) {
                console.warn('Failed to save types to cache:', error);
            }
            
            setPokemonTypes(prev => ({...prev, [pokemon.id]: types}));
        } catch (error) {
            console.error(`Failed to fetch types for ${pokemon.name}:`, error);
        }
    }, [pokemonTypes]);
    
    // Function to fetch and cache Pokemon descriptions
    const fetchDescription = React.useCallback(async (pokemon) => {
        if (pokemonDescriptions[pokemon.id]) return;
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.originalName}/`);
            const data = await response.json();
            
            const englishEntry = data.flavor_text_entries?.find(entry => 
                entry.language.name === 'en'
            );
            
            const description = englishEntry 
                ? englishEntry.flavor_text
                    .replace(/\f/g, ' ')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                : "A mysterious Pokemon.";
            
            setPokemonDescriptions(prev => ({
                ...prev,
                [pokemon.id]: description
            }));
        } catch (error) {
            console.error('Failed to fetch description:', error);
        }
    }, [pokemonDescriptions]);
    
    // Load catch counts from localStorage
    React.useEffect(() => {
        const counts = JSON.parse(localStorage.getItem('pokemon-catch-counts') || '{}');
        setCatchCounts(counts);
    }, [isOpen]);
    
    // Handle scroll events to show/hide scroll-to-top button
    React.useEffect(() => {
        const pokedexContent = document.querySelector('.pokedex-content');
        if (!pokedexContent || !isOpen) return;
        
        const handleScroll = () => {
            const scrollTop = pokedexContent.scrollTop;
            setShowScrollButton(scrollTop > 200);
        };
        
        pokedexContent.addEventListener('scroll', handleScroll);
        
        // Initial check
        handleScroll();
        
        return () => {
            pokedexContent.removeEventListener('scroll', handleScroll);
        };
    }, [isOpen]);
    
    // Scroll to highlighted Pokemon when Pokedex opens (only once)
    React.useEffect(() => {
        if (isOpen && highlightPokemonId && !hasAutoScrolled) {
            const highlightedPokemon = pokemonList.find(p => p.id === highlightPokemonId);
            if (highlightedPokemon) {
                setSelectedPokemon(highlightedPokemon);
                fetchDescription(highlightedPokemon);
                fetchTypes(highlightedPokemon);
            }
            
            const timer = setTimeout(() => {
                const element = document.getElementById(`pokemon-${highlightPokemonId}`);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
                setHasAutoScrolled(true);
            }, 300); // Wait for drawer animation to complete
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, highlightPokemonId, pokemonList, fetchDescription, fetchTypes, hasAutoScrolled]);
    
    // Reset auto-scroll flag when Pokedex closes
    React.useEffect(() => {
        if (!isOpen) {
            setHasAutoScrolled(false);
        }
    }, [isOpen]);
    
    // Load Pokemon cry when selectedPokemon changes
    React.useEffect(() => {
        if (selectedPokemon && discoveredPokemon.includes(selectedPokemon.id)) {
            fetchPokemonCry(selectedPokemon.id);
        } else {
            // Clean up audio when no Pokemon is selected or Pokemon is undiscovered
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
    }, [selectedPokemon, discoveredPokemon]);
    
    const fetchPokemonCry = async (pokemonId) => {
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
            const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
            
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
            console.warn(`Failed to load Pokemon cry for ID ${pokemonId}:`, error);
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
        // Click is always responsive, even if audio isn't ready
    };
    
    const getPokemonImageTitle = () => {
        if (!selectedPokemon || !discoveredPokemon.includes(selectedPokemon.id)) {
            return selectedPokemon ? selectedPokemon.name : '';
        }
        if (isLoadingCry) return `Click to hear ${selectedPokemon.name}'s cry (loading...)`;
        if (pokemonCry) return `Click to hear ${selectedPokemon.name}'s cry!`;
        return `Click to hear ${selectedPokemon.name}'s cry (unavailable)`;
    };
    
    // Function to highlight matching tokens in pokemon names
    const highlightSearchTerms = (name, searchTerms) => {
        if (!searchTerms || searchTerms.length === 0) {
            return name;
        }
        
        // Create a list of all matches with their positions
        const matches = [];
        
        searchTerms.forEach(token => {
            if (token.length === 0) return;
            
            const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let match;
            
            while ((match = regex.exec(name)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0]
                });
            }
        });
        
        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start);
        
        // Merge overlapping matches
        const mergedMatches = [];
        for (const match of matches) {
            if (mergedMatches.length === 0) {
                mergedMatches.push(match);
            } else {
                const last = mergedMatches[mergedMatches.length - 1];
                if (match.start <= last.end) {
                    // Overlapping or adjacent - merge them
                    last.end = Math.max(last.end, match.end);
                    last.text = name.substring(last.start, last.end);
                } else {
                    mergedMatches.push(match);
                }
            }
        }
        
        // Build highlighted string from end to beginning to preserve indices
        let result = name;
        for (let i = mergedMatches.length - 1; i >= 0; i--) {
            const match = mergedMatches[i];
            const before = result.substring(0, match.start);
            const highlighted = `<span class="search-highlight">${match.text}</span>`;
            const after = result.substring(match.end);
            result = before + highlighted + after;
        }
        
        return result;
    };
    
    // Parse search term into tokens
    const searchTokens = searchTerm.trim().toLowerCase().split(/\s+/).filter(token => token.length > 0);
    
    const filteredPokemon = pokemonList.filter(pokemon => {
        // Multi-token search: pokemon name must contain ALL tokens
        const nameMatch = searchTokens.length === 0 || 
            searchTokens.every(token => pokemon.name.toLowerCase().includes(token));
        const idMatch = searchTerm === '' || pokemon.id.toString().includes(searchTerm);
        const matchesSearch = nameMatch || idMatch;
        
        const isDiscovered = discoveredPokemon.includes(pokemon.id);
        
        const matchesFilter = 
            activeFilter === 'all' ||
            (activeFilter === 'caught' && isDiscovered) ||
            (activeFilter === 'uncaught' && !isDiscovered);
        
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (sortBy === 'pokemon id') {
            return a.id - b.id;
        } else if (sortBy === 'times caught') {
            const aCount = catchCounts[a.id] || 0;
            const bCount = catchCounts[b.id] || 0;
            return bCount - aCount; // Descending order (most caught first)
        }
        return 0;
    });

    const CheckIcon = () => (
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#10B981" 
            strokeWidth="3"
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="check-icon"
        >
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
    );

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    const scrollToTop = () => {
        const pokedexContent = document.querySelector('.pokedex-content');
        if (pokedexContent) {
            pokedexContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`pokedex-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
            <div className="pokedex-drawer">
                <div className="pokedex-header">
                    <button className="close-button" onClick={onClose}>×</button>
                    <h2 className="pokedex-title"><img src={pokeballIcon} alt="Open Pokédex" />Pokédex</h2>
                    <div className="progress-container">
                        <div className="progress-text">
                            <strong>Caught:</strong>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${(discoveredPokemon.length / 151) * 100}%` }}
                            ></div>
                        </div>
                        <div className="progress-text">
                            <span className={isMaster ? "header-trophy" : ""}>
                                {discoveredPokemon.length}/151 ({Math.round((discoveredPokemon.length / 151) * 100)}%)
                                {isMaster && <img src={trophyIcon} alt="Pokémon Master" className="trophy-icon pokedex-trophy" />}
                            </span>
                        </div>
                    </div>
                    <div className="search-sort-row">
                        <div className="search-container">
                            <img src={searchIcon} alt="Search" className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search Pokemon by name or number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pokedex-search"
                                title="Tip: You can search for multiple distinct letters by separating with spaces. For example: 'B S R' will find 'Bulbasaur'"
                            />
                            {searchTerm && (
                                <button 
                                    className="clear-search-button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        
                        <div className="sort-container">
                            <button 
                                className="sort-button"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            >
                                <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                >
                                    <path d="M3 6h18M7 12h10m-7 6h4"></path>
                                </svg>
                                {sortBy}
                                <svg 
                                    width="12" 
                                    height="12" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    className="sort-caret"
                                >
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>
                            {showSortDropdown && (
                                <div className="sort-dropdown">
                                    <button 
                                        onClick={() => {
                                            setSortBy('pokemon id');
                                            setShowSortDropdown(false);
                                        }}
                                        className={sortBy === 'pokemon id' ? 'active' : ''}
                                    >
                                        Pokemon ID
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSortBy('times caught');
                                            setShowSortDropdown(false);
                                        }}
                                        className={sortBy === 'times caught' ? 'active' : ''}
                                    >
                                        Times Caught
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        <button 
                            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All ({pokemonList.length})
                        </button>
                        <button 
                            className={`filter-tab ${activeFilter === 'caught' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('caught')}
                        >
                            Caught ({discoveredPokemon.length})
                        </button>
                        <button 
                            className={`filter-tab ${activeFilter === 'uncaught' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('uncaught')}
                        >
                            Uncaught ({pokemonList.length - discoveredPokemon.length})
                        </button>
                    </div>
                </div>
                
                <div className="pokedex-content">
                    <div className="pokemon-grid">
                        {filteredPokemon.length > 0 ? (
                            filteredPokemon.map(pokemon => {
                                const isDiscovered = discoveredPokemon.includes(pokemon.id);
                                const isHighlighted = highlightPokemonId === pokemon.id;
                                return (
                                    <div 
                                        key={pokemon.id}
                                        id={`pokemon-${pokemon.id}`} 
                                        className={`pokemon-card ${isDiscovered ? 'discovered' : 'undiscovered'} ${isHighlighted ? 'highlighted' : ''}`}
                                        onClick={() => {
                                            setSelectedPokemon(pokemon);
                                            if (isDiscovered) {
                                                fetchDescription(pokemon);
                                                fetchTypes(pokemon);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                            alt={pokemon.name}
                                            className="pokemon-image"
                                            onError={(e) => {
                                                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                                            }}
                                        />
                                        {isDiscovered && (
                                            <div className="discovery-badge" title="You've caught this Pokémon"></div>
                                        )}
                                        {isDiscovered && singleGuessPokemon && singleGuessPokemon.includes(pokemon.id) && (
                                            <div className="single-guess-badge" title="Caught in a single guess">★</div>
                                        )}
                                        <div className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</div>
                                        <div className="pokemon-name-container">
                                            <div 
                                                className="pokemon-name" 
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightSearchTerms(pokemon.name, searchTokens)
                                                }}
                                            />
                                            {onSubmitGuess && (
                                                <div className="pokemon-share-container">
                                                    <button 
                                                        className="pokemon-share-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSubmitGuess(pokemon.name);
                                                            onClose(); // Close Pokedex after submitting guess
                                                        }}
                                                        onMouseEnter={() => setHoveredShareButton(pokemon.id)}
                                                        onMouseLeave={() => setHoveredShareButton(null)}
                                                    >
                                                        <img src={shareIcon} alt="Submit guess" className="share-icon" />
                                                    </button>
                                                    {hoveredShareButton === pokemon.id && (
                                                        <div className="share-tooltip">
                                                            Submit {pokemon.name} as your guess
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>                                <div 
                                            className="pokemon-catch-count"
                                            style={{ opacity: isDiscovered && catchCounts[pokemon.id] ? 1 : 0 }}
                                            title={isDiscovered && catchCounts[pokemon.id] ? `You've caught ${catchCounts[pokemon.id]} ${pokemon.name}` : ''}
                                        >
                                            <img src={pokeballIcon} alt="Pokeball" className="catch-count-icon" />
                                            {catchCounts[pokemon.id] || 0}
                                        </div>                                </div>
                                );
                            })
                        ) : (
                            <div className="pokedex-empty-state">
                                <img src={pokeballIcon} alt="Pokeball" className="empty-state-icon" />
                                <div className="empty-state-message">
                                    {activeFilter === 'caught' && 'No pokemon caught, yet.'}
                                    {activeFilter === 'uncaught' && "Caught 'em all!"}
                                    {activeFilter === 'all' && 'No pokemon found.'}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        className={`scroll-to-top-button ${showScrollButton ? 'visible' : ''}`}
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="18,15 12,9 6,15"></polyline>
                        </svg>
                    </button>
                </div>
                
                {/* Description Panel */}
                <div className="pokemon-description-panel">
                    {selectedPokemon ? (
                        <div className="description-content">
                            <div className="description-image-container">
                                <img
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                                    alt={selectedPokemon.name}
                                    className={`description-pokemon-image ${discoveredPokemon.includes(selectedPokemon.id) ? 'discovered clickable-pokemon' : 'undiscovered'}`}
                                    onClick={discoveredPokemon.includes(selectedPokemon.id) ? handlePokemonImageClick : undefined}
                                    title={getPokemonImageTitle()}
                                    onError={(e) => {
                                        e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
                                    }}
                                />
                                {discoveredPokemon.includes(selectedPokemon.id) && (
                                    <div className="description-discovery-badge"></div>
                                )}
                            </div>
                            <div className="description-info">
                                {discoveredPokemon.includes(selectedPokemon.id) ? (
                                    <>
                                        <div className="description-header">
                                            <strong>#{selectedPokemon.id.toString().padStart(3, '0')} {selectedPokemon.name}</strong>
                                            <div className="desc-header-detail">
                                                <div className="type-badges">
                                                    {pokemonTypes[selectedPokemon.id]?.map((typeInfo, index) => (
                                                        <span key={index} className={`type-badge ${typeInfo.name}`}>
                                                            {typeInfo.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                {catchCounts[selectedPokemon.id] && (
                                                    <div className="description-catch-count" title={`You've caught ${catchCounts[selectedPokemon.id]} ${selectedPokemon.name}`}>
                                                        <img src={pokeballIcon} alt="Pokeball" className="description-catch-icon" />
                                                        {catchCounts[selectedPokemon.id]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="description-text">
                                            {pokemonDescriptions[selectedPokemon.id] || "Loading description..."}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="description-header">
                                            <strong>#{selectedPokemon.id.toString().padStart(3, '0')} ???</strong>
                                        </div>
                                        <div className="description-text undiscovered-text">
                                            Catch this Pokémon to learn more
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="description-content">
                            <div className="description-placeholder">
                                Click a Pokémon to learn more
                            </div>
                        </div>
                    )}
                    <button className="pokedex-close-button" onClick={onClose}>
                        Close Pokédex
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Pokedex;