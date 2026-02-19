import React from 'react';
import Game from '../Game';
import Header from '../Header';
import Pokedex from '../Pokedex';
import Celebrations from '../Celebrations';
import trophyIcon from '../../assets/trophy.svg';
import trophyStarIcon from '../../assets/trophy-star.svg';
import meetPikaImage from '../../assets/meet-pika.png';

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

// Helper functions for single-guess catches
const getSingleGuessPokemon = () => {
  try {
    const stored = localStorage.getItem('single-guess-pokemon');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to read single-guess Pokemon from localStorage:', error);
    return [];
  }
};

const saveSingleGuessPokemon = (singleGuessList) => {
  try {
    localStorage.setItem('single-guess-pokemon', JSON.stringify(singleGuessList));
  } catch (error) {
    console.warn('Failed to save single-guess Pokemon to localStorage:', error);
  }
};

function App() {
  const [gameKey, setGameKey] = React.useState(0);
  const [isPokedexOpen, setIsPokedexOpen] = React.useState(false);
  const [highlightPokemonId, setHighlightPokemonId] = React.useState(null);
  const [pokemonList, setPokemonList] = React.useState([]);
  const [discoveredPokemon, setDiscoveredPokemon] = React.useState(getDiscoveredPokemon());
  const [singleGuessPokemon, setSingleGuessPokemon] = React.useState(getSingleGuessPokemon());
  const [showMasterCelebration, setShowMasterCelebration] = React.useState(false);
  const [showProgressCelebration, setShowProgressCelebration] = React.useState(false);
  const [showLegendCelebration, setShowLegendCelebration] = React.useState(false);
  const [showFirstPokemonCelebration, setShowFirstPokemonCelebration] = React.useState(false);
  const [progressCount, setProgressCount] = React.useState(0);
  const [isMaster, setIsMaster] = React.useState(false);
  const [isLegend, setIsLegend] = React.useState(false);
  const [settings, setSettings] = React.useState(() => {
    try {
      const stored = localStorage.getItem('squirtle-wordle-settings');
      return stored ? JSON.parse(stored) : {
        hideHints: false,
        noRepeatPokemon: false,
        classicSounds: true,
        autoOpenPokedex: true
      };
    } catch {
      return {
        hideHints: false,
        noRepeatPokemon: false,
        classicSounds: true,
        autoOpenPokedex: true
      };
    }
  });
  
  const gameRef = React.useRef();

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

  function handlePokemonDiscovered(pokemonId, wasSingleGuess = false) {
    if (!discoveredPokemon.includes(pokemonId)) {
      const newDiscovered = [...discoveredPokemon, pokemonId];
      const newCount = newDiscovered.length;
      
      setDiscoveredPokemon(newDiscovered);
      saveDiscoveredPokemon(newDiscovered);
      
      // Check for legend celebration (all 151 caught with single guesses) - delay to let pokeball animation finish
      if (wasSingleGuess && !singleGuessPokemon.includes(pokemonId)) {
        const newSingleGuess = [...singleGuessPokemon, pokemonId];
        setSingleGuessPokemon(newSingleGuess);
        saveSingleGuessPokemon(newSingleGuess);
        
        // Check if user has become a legend (all 151 with single guesses)
        if (newSingleGuess.length === 151) {
          setTimeout(() => {
            setIsLegend(true);
            setShowLegendCelebration(true);
          }, 1500);
          return; // Exit early to show legend celebration instead of master
        }
      }
      
      // Special case: First Pokemon celebration
      if (newCount === 1) {
        setTimeout(() => {
          setShowFirstPokemonCelebration(true);
        }, 1500);
      }
      // Check for master celebration (151 Pokemon) - delay to let pokeball animation finish
      else if (newCount === 151) {
        setTimeout(() => {
          setIsMaster(true);
          setShowMasterCelebration(true);
        }, 1500);
      }
      // Check for progress celebrations (every 10, but not at 1 or 151) - delay to let pokeball animation finish
      else if (newCount % 10 === 0 && newCount >= 10) {
        setTimeout(() => {
          setProgressCount(newCount);
          setShowProgressCelebration(true);
        }, 1500);
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

  function handleDismissLegend() {
    setShowLegendCelebration(false);
  }

  function handleDismissFirstPokemon() {
    setShowFirstPokemonCelebration(false);
  }

  function handleLegendHoorayClick() {
    setShowLegendCelebration(false);
  }

  function handleSubmitGuess(pokemonName) {
    if (gameRef.current && gameRef.current.isGameActive) {
      gameRef.current.submitGuess(pokemonName);
    }
  }

  function handleHoorayClick() {
    setShowMasterCelebration(false);
  }

  // Check if user is already a master or legend on load
  React.useEffect(() => {
    setIsMaster(discoveredPokemon.length === 151);
    setIsLegend(singleGuessPokemon.length === 151);
  }, [discoveredPokemon.length, singleGuessPokemon.length]);
  // Listen for settings changes from localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('squirtle-wordle-settings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch {
        // Keep current settings on parse error
      }
    };

    // Listen for custom settings change events
    const handleSettingsChange = () => {
      handleStorageChange();
    };

    // Poll for localStorage changes (in case same-tab changes aren't triggering events)
    const pollInterval = setInterval(handleStorageChange, 1000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsChanged', handleSettingsChange);
      clearInterval(pollInterval);
    };
  }, []);
  // Add event listeners for test functions
  React.useEffect(() => {
    const handleTestMaster = () => {
      setShowMasterCelebration(true);
    };
    
    const handleTestLegend = () => {
      setShowLegendCelebration(true);
    };
    
    const handleTestProgress = (event) => {
      const count = event.detail?.count || 50;
      setProgressCount(count);
      setShowProgressCelebration(true);
    };
    
    window.addEventListener('testMasterCelebration', handleTestMaster);
    window.addEventListener('testLegendCelebration', handleTestLegend);
    window.addEventListener('testProgressCelebration', handleTestProgress);
    
    // Add test function to window for legend celebration
    window.testLegendCelebration = () => {
      setShowLegendCelebration(true);
    };
    
    return () => {
      window.removeEventListener('testMasterCelebration', handleTestMaster);
      window.removeEventListener('testLegendCelebration', handleTestLegend);
      window.removeEventListener('testProgressCelebration', handleTestProgress);
      delete window.testLegendCelebration;
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
        isLegend={isLegend}
        trophyIcon={isLegend ? trophyStarIcon : trophyIcon}
      />

      <div className="game-wrapper">
        <Game 
          key={gameKey}
          ref={gameRef}
          onPokemonDiscovered={handlePokemonDiscovered}
          onPokemonListLoaded={handlePokemonListLoaded}
          onOpenPokedex={handleOpenPokedex}
          settings={settings}
        />
      </div>

      <Pokedex
        isOpen={isPokedexOpen}
        onClose={handleClosePokedex}
        pokemonList={pokemonList}
        discoveredPokemon={discoveredPokemon}
        singleGuessPokemon={singleGuessPokemon}
        highlightPokemonId={highlightPokemonId}
        isMaster={isMaster}
        trophyIcon={trophyIcon}        onSubmitGuess={handleSubmitGuess}      />
      <Celebrations
        showMasterCelebration={showMasterCelebration}
        showProgressCelebration={showProgressCelebration}
        showLegendCelebration={showLegendCelebration}
        showFirstPokemonCelebration={showFirstPokemonCelebration}
        progressCount={progressCount}
        onDismissMaster={handleDismissMaster}
        onDismissProgress={handleDismissProgress}
        onDismissLegend={handleDismissLegend}
        onDismissFirstPokemon={handleDismissFirstPokemon}
        onHoorayClick={handleHoorayClick}
        onLegendHoorayClick={handleLegendHoorayClick}
        meetPikaImage={meetPikaImage}
      />
    </div>
  );
}

export default App;
