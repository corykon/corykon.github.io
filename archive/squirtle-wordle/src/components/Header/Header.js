import React from 'react';
import squirtleImage from '../../assets/squirtle.png';
import trainerSceneImage from '../../assets/trainer-scene.png';
import refreshIcon from '../../assets/refresh.svg';
import pokeballIcon from '../../assets/pokeball.svg';
import elipIcon from '../../assets/elip.svg';
import infoIcon from '../../assets/info.svg';
import cogIcon from '../../assets/cog.svg';
import exLinkIcon from '../../assets/external-link.svg';
import volumeOnIcon from '../../assets/volume-on.svg';
import volumeMuteIcon from '../../assets/volume-mute.svg';
import soundManager from '../../utils/soundManager';

function Header({ onReset, onOpenPokedex, discoveredCount, totalCount, isMaster, isLegend, trophyIcon }) {
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const [showAboutModal, setShowAboutModal] = React.useState(false);
  const [showCreditsScreen, setShowCreditsScreen] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(soundManager.isMuted);
  const [settings, setSettings] = React.useState(() => {
    try {
      const stored = localStorage.getItem('squirtle-wordle-settings');
      return stored ? JSON.parse(stored) : {
        hideHints: false,
        noRepeatPokemon: false,
        classicSounds: true
      };
    } catch {
      return {
        hideHints: false,
        noRepeatPokemon: false,
        classicSounds: true
      };
    }
  });
  
  const handlePokedexClick = (event) => {
    event.preventDefault();
    soundManager.playButtonClick();
    if (onOpenPokedex) {
      onOpenPokedex();
    }
  };

  const handleResetClick = (event) => {
    event.preventDefault();
    soundManager.playButtonClick();
    if (onReset) {
      onReset();
    }
  };

  const handleMoreClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    soundManager.playButtonClick();
    setShowMoreDropdown(!showMoreDropdown);
  };

  const handleVolumeClick = (event) => {
    event.preventDefault();
    const newMutedState = soundManager.toggleMute();
    setIsMuted(newMutedState);
    // Play click sound if we just unmuted
    if (!newMutedState) {
      soundManager.playButtonClick();
    }
  };

  const handleAboutClick = () => {
    soundManager.playButtonClick();
    soundManager.playGameboySound();
    setShowMoreDropdown(false);
    setShowAboutModal(true);
  };

  const handleSettingsClick = () => {
    soundManager.playButtonClick();
    setShowMoreDropdown(false);
    setShowSettingsModal(true);
  };

  const handleSettingToggle = (key) => {
    const newValue = !settings[key];
    
    // Play appropriate slider sound based on whether turning on or off
    if (newValue) {
      soundManager.playSliderOn();
    } else {
      soundManager.playSliderOff();
    }
    
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    localStorage.setItem('squirtle-wordle-settings', JSON.stringify(newSettings));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged', { 
      detail: newSettings 
    }));
  };

  const handleClearData = () => {
    soundManager.playButtonClick();
    setShowSettingsModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmClear = () => {
    soundManager.playButtonClick();
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
              onMouseEnter={() => soundManager.playButtonHover()}
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
              onMouseEnter={() => soundManager.playButtonHover()}
            >
              <img src={refreshIcon} alt="Reset game" />
              <div className="tooltip">Guess a different Pokemon</div>
            </button>
          )}
          <button 
            type="button"
            className="volume-button"
            onClick={handleVolumeClick}
            onMouseEnter={() => soundManager.playButtonHover()}
          >
            <img src={isMuted ? volumeMuteIcon : volumeOnIcon} alt={isMuted ? "Unmute sounds" : "Mute sounds"} />
            <div className="tooltip">{isMuted ? "Unmute sounds" : "Mute sounds"}</div>
          </button>
          <div className="more-menu-container">
            <button 
              type="button"
              className="more-button"
              onClick={handleMoreClick}
              onMouseEnter={() => soundManager.playButtonHover()}
            >
              <img src={elipIcon} alt="More options" />
              <div className="tooltip">More...</div>
            </button>
            {showMoreDropdown && (
              <div className="more-dropdown">
                <button onClick={handleAboutClick} onMouseEnter={() => soundManager.playButtonHover()}>
                  <img src={infoIcon} alt="" />
                  About
                </button>
                <button onClick={handleSettingsClick} onMouseEnter={() => soundManager.playButtonHover()}>
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
        <div className="modal-overlay" onClick={() => { soundManager.playButtonClick(); setShowAboutModal(false); setShowCreditsScreen(false); }}>
          <div className="modal-content about-modal" onClick={(e) => e.stopPropagation()}>
            {!showCreditsScreen ? (
              <>
                <h2>About Squirtle Wordle</h2>
                <img src={trainerSceneImage} alt="Pokemon Trainer Scene" className="about-image" />
                <div className="about-text">
                  <p>A Pokémon guessing game based on Wordle. Inspired by a project from the course "<a href="https://www.joyofreact.com/" target="_blank" rel="noopener noreferrer">Joy of React</a>".</p>
                  <p>Catch as many Pokemon as you can, and even better, try to get them in one guess. Use your Pokédex to track progress.</p>
                </div>
                <button 
                  className="primary-button modal-button" 
                  onClick={() => { soundManager.playModalDismiss(); setShowAboutModal(false); setShowCreditsScreen(false); }}
                  onMouseEnter={() => soundManager.playBubbleHover()}
                >
                  Done
                </button>
                <div className="about-footer">
                    <div className="built-by-line">
                    Created by <a href="https://coryfugate.com" target="_blank" rel="noopener noreferrer">Cory Fugate</a>
                    <img src={exLinkIcon} alt="" className="about-footer-icon" />
                    </div>
                  <div className="credits-line"><button 
                      className="credits-link" 
                      onClick={() => { soundManager.playFilterClick(); setShowCreditsScreen(true); }}
                    >
                      Sound Credits
                      <span className="chevron">›</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button 
                  className="credits-back-button" 
                  onClick={() => { soundManager.playFilterClick(); setShowCreditsScreen(false); }}
                >
                  ‹ Back
                </button>
                <h2>Sound Credits</h2>
                <div className="credits-content">
                  <div className="credits-intro">
                    <p>Special thanks to these talented creators from Pixabay.com for their amazing sound effects:</p>
                  </div>
                  <div className="credits-list">
                    <ul>
                      <li>skyscraper_seven</li>
                      <li>Universfield</li>
                      <li>FREESOUND-COMMUNITY</li>
                      <li>Viacheslav Starostin</li>
                      <li>Poradovskyi</li>
                      <li>CFL_TurningPages</li>
                      <li>Feora, Lucas Cooper</li>
                      <li>Alphix</li>
                      <li>SoundReality</li>
                      <li>Flora phonic</li>
                      <li>R0T0R</li>
                    </ul>
                  </div>
                </div>
                <div className="credits-buttons">
                  <button 
                    className="primary-button modal-button" 
                    onClick={() => { soundManager.playModalDismiss(); setShowAboutModal(false); setShowCreditsScreen(false); }}
                    onMouseEnter={() => soundManager.playBubbleHover()}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => { soundManager.playModalDismiss(); setShowSettingsModal(false); }}>
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
              <div className="setting-item">
                <div className="setting-label-container">
                  <div className="setting-label">Classic Sounds</div>
                  <div className="setting-description">Play old school pokémon sounds</div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.classicSounds}
                    onChange={() => handleSettingToggle('classicSounds')}
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
                <button 
                  className="danger-button" 
                  onClick={handleClearData}
                  onMouseEnter={() => soundManager.playButtonHover()}
                >
                  Clear data
                </button>
              </div>
            </div>
            <button 
              className="modal-button primary-button" 
              onClick={() => { soundManager.playModalDismiss(); setShowSettingsModal(false); }}
              onMouseEnter={() => soundManager.playBubbleHover()}
            >
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
              <button 
                className="cancel-button" 
                onClick={() => { soundManager.playModalDismiss(); setShowConfirmModal(false); }}
                onMouseEnter={() => soundManager.playButtonHover()}
              >
                Cancel
              </button>
              <button 
                className="delete-button" 
                onClick={handleConfirmClear}
                onMouseEnter={() => soundManager.playButtonHover()}
              >
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
