import React from 'react';
import squirtleImage from '../../assets/squirtle.png';
import trainerSceneImage from '../../assets/trainer-scene.png';
import refreshIcon from '../../assets/refresh.svg';
import pokeballIcon from '../../assets/pokeball.svg';
import elipIcon from '../../assets/elip.svg';
import infoIcon from '../../assets/info.svg';
import cogIcon from '../../assets/cog.svg';
import exLinkIcon from '../../assets/external-link.svg';

function Header({ onReset, onOpenPokedex, discoveredCount, totalCount, isMaster, isLegend, trophyIcon }) {
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const [showAboutModal, setShowAboutModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [settings, setSettings] = React.useState(() => {
    try {
      const stored = localStorage.getItem('squirtle-wordle-settings');
      return stored ? JSON.parse(stored) : {
        hideHints: false,
        noRepeatPokemon: false
      };
    } catch {
      return {
        hideHints: false,
        noRepeatPokemon: false
      };
    }
  });
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

  const handleMoreClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowMoreDropdown(!showMoreDropdown);
  };

  const handleAboutClick = () => {
    setShowMoreDropdown(false);
    setShowAboutModal(true);
  };

  const handleSettingsClick = () => {
    setShowMoreDropdown(false);
    setShowSettingsModal(true);
  };

  const handleSettingToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('squirtle-wordle-settings', JSON.stringify(newSettings));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged', { 
      detail: newSettings 
    }));
  };

  const handleClearData = () => {
    setShowSettingsModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmClear = () => {
    localStorage.removeItem('discovered-pokemon');
    localStorage.removeItem('single-guess-pokemon');
    localStorage.removeItem('pokemon-catch-counts');
    // Keep settings: localStorage.removeItem('squirtle-wordle-settings');
    setShowConfirmModal(false);
    window.location.reload();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.more-menu-container')) {
        setShowMoreDropdown(false);
      }
    };
    if (showMoreDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMoreDropdown]);

  return (
    <header>
      <div className="side"></div>
      <h1><img src={squirtleImage} alt="Squirtle" /><span className="app-name">Squirtle Wordle</span>
        <div className="header-buttons">
          <div className="pokemon-count" title={isLegend ? "Pokemon Legend. Guessed all 151 with 1 guess." : `You've caught ${discoveredCount} out of ${totalCount} Pokémon`}>
            <span className={isMaster ? "header-trophy" : ""} style={isLegend ? {background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white'} : {}}>
              {discoveredCount}/{totalCount}
              {isMaster && <img src={trophyIcon} alt="Pokémon Master" className="trophy-icon" />}
            </span>
          </div>
          {onOpenPokedex && (
            <button 
              type="button"
              className="pokedex-button"
              onClick={handlePokedexClick}
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
            >
              <img src={refreshIcon} alt="Reset game" />
              <div className="tooltip">Guess a different Pokemon</div>
            </button>
          )}
          <div className="more-menu-container">
            <button 
              type="button"
              className="more-button"
              onClick={handleMoreClick}
            >
              <img src={elipIcon} alt="More options" />
              <div className="tooltip">More...</div>
            </button>
            {showMoreDropdown && (
              <div className="more-dropdown">
                <button onClick={handleAboutClick}>
                  <img src={infoIcon} alt="" />
                  About
                </button>
                <button onClick={handleSettingsClick}>
                  <img src={cogIcon} alt="" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </h1>
      
      <div className="side">
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content about-modal" onClick={(e) => e.stopPropagation()}>
            <h2>About Squirtle Wordle</h2>
            <img src={trainerSceneImage} alt="Pokemon Trainer Scene" className="about-image" />
            <div className="about-text">
              <p>A Pokémon guessing game based on Wordle. Inspired by a project from the course "<a href="https://www.joyofreact.com/" target="_blank" rel="noopener noreferrer">Joy of React</a>".</p>
              <p>Catch as many Pokemon as you can, and even better, try to get them in one guess. Use your Pokédex to track progress.</p>
            </div>
            <button className="primary-button modal-button" onClick={() => setShowAboutModal(false)}>
              Done
            </button>
            <div className="about-footer">
              Created by <a href="https://coryfugate.com" target="_blank" rel="noopener noreferrer">Cory Fugate</a>
              <img src={exLinkIcon} alt="" className="about-footer-icon" />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              <img src={cogIcon} alt="" style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }} />
              Settings
            </h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-label-container">
                  <div className="setting-label">Hide Hints</div>
                  <div className="setting-description">Hard mode. If turned on, pokémon description hints won't be given.</div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.hideHints}
                    onChange={() => handleSettingToggle('hideHints')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label-container">
                  <div className="setting-label">No Repeat Pokémon</div>
                  <div className="setting-description">If turned on, you'll only guess Pokémon you haven't caught yet.</div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.noRepeatPokemon}
                    onChange={() => handleSettingToggle('noRepeatPokemon')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-danger-zone">
              <div className="danger-zone-item">
                <div className="setting-label-container">
                  <div className="setting-label">Clear All Data</div>
                  <div className="setting-description">Remove all Pokémon progress and statistics.</div>
                </div>
                <button className="danger-button" onClick={handleClearData}>
                  Clear data
                </button>
              </div>
            </div>
            <button className="modal-button primary-button" onClick={() => setShowSettingsModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h2>Clear All Data</h2>
            <p>Are you sure you want to delete all progress? This cannot be undone.</p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="delete-button" onClick={handleConfirmClear}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
