import React from 'react';
import squirtleImage from '../../assets/squirtle.png';
import refreshIcon from '../../assets/refresh.svg';
import pokeballIcon from '../../assets/pokeball.svg';

function Header({ onReset, onOpenPokedex, discoveredCount, totalCount, isMaster, trophyIcon }) {
  const handlePokedexClick = (event) => {
    event.preventDefault();
    if (onOpenPokedex) {
      onOpenPokedex();
    }
  };

  const handleResetClick = (event) => {
    event.preventDefault();
    if (onReset) {
      onReset();
    }
  };

  return (
    <header>
      <div className="side"></div>
      <h1><img src={squirtleImage} alt="Squirtle" /><span>Squirtle Wordle</span>
        <div className="header-buttons">
          <div className="pokemon-count" title={`You've caught ${discoveredCount} out of ${totalCount} Pokémon`}>
            <span className={isMaster ? "header-trophy" : ""}>
              {discoveredCount}/{totalCount}
              {isMaster && <img src={trophyIcon} alt="Pokémon Master" className="trophy-icon" />}
            </span>
          </div>
          {onOpenPokedex && (
            <button 
              type="button"
              className="pokedex-button"
              onClick={handlePokedexClick}
              title="Open Pokédex"
            >
              <img src={pokeballIcon} alt="Open Pokédex" />
              <div className="tooltip">Open Pokédex</div>
            </button>
          )}
          {onReset && (
            <button 
              type="button"
              className="reset-button"
              onClick={handleResetClick}
              title="Start a new game with a different Pokemon"
            >
              <img src={refreshIcon} alt="Reset game" />
              <div className="tooltip">New Pokémon</div>
            </button>
          )}
        </div>
      </h1>
      
      <div className="side">
      </div>
    </header>
  );
}

export default Header;
