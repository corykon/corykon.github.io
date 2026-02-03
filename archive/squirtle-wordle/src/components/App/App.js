import React from 'react';
import Game from '../Game';
import Header from '../Header';
import Pokedex from '../Pokedex';
import Celebrations from '../Celebrations';
import trophyIcon from '../../assets/trophy.svg';

// Load test functions in development
if (process.env.NODE_ENV === 'development') {
  import('../../test-celebrations');
}

// Helper functions for localStorage management
const getDiscoveredPokemon = () => {
  try {
    const stored = localStorage.getItem('discovered-pokemon');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to read discovered Pokemon from localStorage:', error);
    return [];
  }
};

const saveDiscoveredPokemon = (discoveredList) => {
  try {
    localStorage.setItem('discovered-pokemon', JSON.stringify(discoveredList));
  } catch (error) {
    console.warn('Failed to save discovered Pokemon to localStorage:', error);
  }
};

function App() {
  const [gameKey, setGameKey] = React.useState(0);
  const [isPokedexOpen, setIsPokedexOpen] = React.useState(false);
  const [highlightPokemonId, setHighlightPokemonId] = React.useState(null);
  const [pokemonList, setPokemonList] = React.useState([]);
  const [discoveredPokemon, setDiscoveredPokemon] = React.useState(getDiscoveredPokemon());
  const [showMasterCelebration, setShowMasterCelebration] = React.useState(false);
  const [showProgressCelebration, setShowProgressCelebration] = React.useState(false);
  const [progressCount, setProgressCount] = React.useState(0);
  const [isMaster, setIsMaster] = React.useState(false);

  function handleReset() {
    setGameKey(prevKey => prevKey + 1);
  }

  function handleOpenPokedex(pokemonIdToHighlight = null) {
    setHighlightPokemonId(pokemonIdToHighlight);
    setIsPokedexOpen(true);
  }

  function handleClosePokedex() {
    setIsPokedexOpen(false);
    setHighlightPokemonId(null);
  }

  function handlePokemonDiscovered(pokemonId) {
    if (!discoveredPokemon.includes(pokemonId)) {
      const newDiscovered = [...discoveredPokemon, pokemonId];
      const newCount = newDiscovered.length;
      
      setDiscoveredPokemon(newDiscovered);
      saveDiscoveredPokemon(newDiscovered);
      
      // Check for master celebration (151 Pokemon) - delay to let pokeball animation finish
      if (newCount === 151) {
        setTimeout(() => {
          setIsMaster(true);
          setShowMasterCelebration(true);
        }, 3000);
      }
      // Check for progress celebrations (every 10, but not at 151) - delay to let pokeball animation finish
      else if (newCount % 10 === 0 && newCount >= 10) {
        setTimeout(() => {
          setProgressCount(newCount);
          setShowProgressCelebration(true);
        }, 3000);
      }
    }
  }

  function handlePokemonListLoaded(list) {
    setPokemonList(list);
  }

  function handleDismissMaster() {
    setShowMasterCelebration(false);
  }

  function handleDismissProgress() {
    setShowProgressCelebration(false);
  }

  function handleHoorayClick() {
    setShowMasterCelebration(false);
  }

  // Check if user is already a master on load
  React.useEffect(() => {
    setIsMaster(discoveredPokemon.length === 151);
  }, [discoveredPokemon.length]);

  // Add event listeners for test functions
  React.useEffect(() => {
    const handleTestMaster = () => {
      setShowMasterCelebration(true);
    };
    
    const handleTestProgress = (event) => {
      const count = event.detail?.count || 50;
      setProgressCount(count);
      setShowProgressCelebration(true);
    };
    
    window.addEventListener('testMasterCelebration', handleTestMaster);
    window.addEventListener('testProgressCelebration', handleTestProgress);
    
    return () => {
      window.removeEventListener('testMasterCelebration', handleTestMaster);
      window.removeEventListener('testProgressCelebration', handleTestProgress);
    };
  }, []);

  return (
    <div className="wrapper">
      <Header 
        onReset={handleReset} 
        onOpenPokedex={handleOpenPokedex}
        discoveredCount={discoveredPokemon.length}
        totalCount={pokemonList.length}
        isMaster={isMaster}
        trophyIcon={trophyIcon}
      />

      <div className="game-wrapper">
        <Game 
          key={gameKey}
          onPokemonDiscovered={handlePokemonDiscovered}
          onPokemonListLoaded={handlePokemonListLoaded}
          onOpenPokedex={handleOpenPokedex}
        />
      </div>

      <Pokedex
        isOpen={isPokedexOpen}
        onClose={handleClosePokedex}
        pokemonList={pokemonList}
        discoveredPokemon={discoveredPokemon}
        highlightPokemonId={highlightPokemonId}
        isMaster={isMaster}
        trophyIcon={trophyIcon}
      />
      <Celebrations
        showMasterCelebration={showMasterCelebration}
        showProgressCelebration={showProgressCelebration}
        progressCount={progressCount}
        onDismissMaster={handleDismissMaster}
        onDismissProgress={handleDismissProgress}
        onHoorayClick={handleHoorayClick}
      />
    </div>
  );
}

export default App;
