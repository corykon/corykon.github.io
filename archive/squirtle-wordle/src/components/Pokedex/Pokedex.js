import React from 'react';
import pokeballIcon from '../../assets/pokeball.svg';
import searchIcon from '../../assets/search.svg';

function Pokedex({ isOpen, onClose, pokemonList, discoveredPokemon, highlightPokemonId, isMaster, trophyIcon }) {
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
    
    const filteredPokemon = pokemonList.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pokemon.id.toString().includes(searchTerm);
        
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
                        {filteredPokemon.map(pokemon => {
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
                                        <div className="discovery-badge"></div>
                                    )}
                                    <div className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</div>
                                    <div className="pokemon-name">{pokemon.name}</div>                                <div 
                                        className="pokemon-catch-count"
                                        style={{ opacity: isDiscovered && catchCounts[pokemon.id] ? 1 : 0 }}
                                        title={isDiscovered && catchCounts[pokemon.id] ? `You've caught ${catchCounts[pokemon.id]} ${pokemon.name}` : ''}
                                    >
                                        <img src={pokeballIcon} alt="Pokeball" className="catch-count-icon" />
                                        {catchCounts[pokemon.id] || 0}
                                    </div>                                </div>
                            );
                        })}
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
                                    className={`description-pokemon-image ${discoveredPokemon.includes(selectedPokemon.id) ? 'discovered' : 'undiscovered'}`}
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