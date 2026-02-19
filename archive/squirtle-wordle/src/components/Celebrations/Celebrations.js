import React from 'react';
import pokemonMasterImage from '../../assets/pokemon-master.png';
import pokemonProgressImage from '../../assets/pokemon-progress.png';
import trophyStarIcon from '../../assets/trophy-star.svg';
import trophyIcon from '../../assets/trophy.svg';
import soundManager from '../../utils/soundManager';

function Celebrations({ 
    showMasterCelebration, 
    showProgressCelebration,
    showLegendCelebration,
    showFirstPokemonCelebration,
    progressCount,
    onDismissMaster, 
    onDismissProgress,
    onDismissLegend,
    onDismissFirstPokemon,
    onHoorayClick,
    onLegendHoorayClick,
    meetPikaImage
}) {
    const [confettiKey, setConfettiKey] = React.useState(0);
    const [hoorayFireworks, setHoorayFireworks] = React.useState(false);
    const [isFadingOut, setIsFadingOut] = React.useState(false);

    // Create confetti animation
    React.useEffect(() => {
        if (showMasterCelebration || showProgressCelebration || showLegendCelebration || showFirstPokemonCelebration) {
            setConfettiKey(prev => prev + 1);
            setIsFadingOut(false);
            
            // Play victory beat for progress, master, and legend celebrations
            if (showProgressCelebration || showMasterCelebration || showLegendCelebration) {
                soundManager.playVictoryBeat();
            }
        }
    }, [showMasterCelebration, showProgressCelebration, showLegendCelebration, showFirstPokemonCelebration]);

    const handleHoorayClick = () => {
        soundManager.playModalDismiss();
        // Trigger more fireworks immediately
        setHoorayFireworks(true);
        setConfettiKey(prev => prev + 1);
        
        // Start fade out animation
        setIsFadingOut(true);
        
        // Stop victory music and reset fireworks and dismiss after fade completes
        setTimeout(() => {
            soundManager.stopVictoryBeat();
            setHoorayFireworks(false);
            onHoorayClick();
        }, 2000);
    };

    const handleLegendHoorayClick = () => {
        soundManager.playModalDismiss();
        // Trigger more fireworks immediately
        setHoorayFireworks(true);
        setConfettiKey(prev => prev + 1);
        
        // Start fade out animation
        setIsFadingOut(true);
        
        // Stop victory music and reset fireworks and dismiss after fade completes
        setTimeout(() => {
            soundManager.stopVictoryBeat();
            setHoorayFireworks(false);
            onLegendHoorayClick();
        }, 2000);
    };

    const handleProgressDismiss = () => {
        soundManager.playModalDismiss();
        soundManager.stopVictoryBeat();
        // Start fade out animation
        setIsFadingOut(true);
        
        // Dismiss after fade completes
        setTimeout(() => {
            onDismissProgress();
        }, 800);
    };

    const handleFirstPokemonDismiss = () => {
        soundManager.playModalDismiss();
        // Start fade out animation
        setIsFadingOut(true);
        
        // Dismiss after fade completes
        setTimeout(() => {
            onDismissFirstPokemon();
        }, 800);
    };

    if (showFirstPokemonCelebration) {
        return (
            <div className={`celebration-overlay first-pokemon-celebration ${isFadingOut ? 'fade-out' : ''}`}>
                <div className="confetti-container" key={`first-${confettiKey}`}>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#FFD700', '#FF6B9D', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                </div>
                
                <div className="celebration-content first-pokemon-content">
                    <h2 className="celebration-title first-pokemon-title">Welcome!</h2>
                    
                    <img 
                        key="first-pokemon-celebration-image"
                        src={meetPikaImage} 
                        alt="Meet Pikachu" 
                        className="celebration-image first-pokemon-image"
                        style={{ maxWidth: '500px', width: '100%' }}
                    />
                    
                    <p className="celebration-message first-pokemon-message">
                        <strong>Congratulations on your first Pokémon!</strong><br />
                        You caught Pikachu! You're on your way to becoming a Pokémon master.
                    </p>
                    
                    <button 
                        className="celebration-button first-pokemon-button" 
                        onClick={handleFirstPokemonDismiss}
                        onMouseEnter={() => soundManager.playBubbleHover()}
                    >
                        Let's catch 'em all!
                    </button>
                </div>
            </div>
        );
    }

    if (showLegendCelebration) {
        return (
            <div className={`celebration-overlay legend-celebration ${isFadingOut ? 'fade-out' : ''}`}>
                <div className="confetti-container" key={`legend-${confettiKey}`}>
                    {[...Array(100)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                    {hoorayFireworks && [...Array(200)].map((_, i) => (
                        <div key={`hooray-${i}`} className="confetti-piece hooray-confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 0.3}s`,
                            backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#FF1493'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                </div>
                
                <div className="celebration-content legend-content">
                    <h1 className="celebration-title legend-title">LEGEND.</h1>
                    
                    <div className="celebration-progress-container">
                        <div className="celebration-progress-bar">
                            <div 
                                className="celebration-progress-fill legend-progress-fill"
                                style={{ width: '100%' }}
                            ></div>
                        </div>
                        <div className="celebration-progress-text">
                            <span>151/151 Single Guesses</span> <img src={trophyStarIcon} alt="Trophy Star" style={{ width: '20px', height: '20px', marginLeft: '4px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                        </div>
                    </div>
                    
                    <img 
                        key="legend-celebration-image"
                        src={pokemonMasterImage} 
                        alt="Pokemon Legend" 
                        className="celebration-image legend-image"
                        style={{ filter: 'sepia(1) saturate(2) hue-rotate(40deg)' }}
                    />
                    <p className="celebration-message legend-message">
                        You've caught every pokemon with 1 guess. Incredible! <br />There are few Pokemon masters, even fewer <strong>legends</strong>.
                    </p>
                    <button 
                        className="celebration-button legend-button" 
                        onClick={handleLegendHoorayClick}
                        onMouseEnter={() => soundManager.playBubbleHover()}
                    >
                        Legendary!
                    </button>
                </div>
            </div>
        );
    }

    if (showMasterCelebration) {
        return (
            <div className={`celebration-overlay master-celebration ${isFadingOut ? 'fade-out' : ''}`}>
                <div className="confetti-container" key={`master-${confettiKey}`}>
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            backgroundColor: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                    {hoorayFireworks && [...Array(100)].map((_, i) => (
                        <div key={`hooray-${i}`} className="confetti-piece hooray-confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#32CD32'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                </div>
                
                <div className="celebration-content master-content">
                    <h1 className="celebration-title">You've caught 'em all!</h1>
                    
                    <div className="celebration-progress-container">
                        <div className="celebration-progress-bar">
                            <div 
                                className="celebration-progress-fill master-progress-fill"
                                style={{ width: '100%' }}
                            ></div>
                        </div>
                        <div className="celebration-progress-text">
                            <span>151/151 (100%)</span> <img src={trophyIcon} alt="Trophy" style={{ width: '20px', height: '20px', marginLeft: '4px', filter: 'sepia(1) saturate(3) hue-rotate(40deg) brightness(1.2)' }} />
                        </div>
                    </div>
                    
                    <img 
                        key="master-celebration-image"
                        src={pokemonMasterImage} 
                        alt="Pokemon Master" 
                        className="celebration-image master-image"
                    />
                    <p className="celebration-message master-message">
                         151, baby! Amazing. <br /> You have officially earned the rank of <strong>Pokémon Master</strong>.
                    </p>
                    <button 
                        className="celebration-button hooray-button" 
                        onClick={handleHoorayClick}
                        onMouseEnter={() => soundManager.playBubbleHover()}
                    >
                        Hooray!
                    </button>
                </div>
            </div>
        );
    }

    if (showProgressCelebration) {
        return (
            <div className={`celebration-overlay progress-celebration ${isFadingOut ? 'fade-out' : ''}`}>
                <div className="confetti-container" key={`progress-${confettiKey}`}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                </div>
                
                <div className="celebration-content progress-content">
                    <h2 className="celebration-title progress-title">You've caught {progressCount}!</h2>
                    
                    <div className="celebration-progress-container">
                        <div className="celebration-progress-bar">
                            <div 
                                className="celebration-progress-fill"
                                style={{ 
                                    '--target-width': `${(progressCount / 151) * 100}%`,
                                    width: `${(progressCount / 151) * 100}%` 
                                }}
                            ></div>
                        </div>
                        <div className="celebration-progress-text">
                            {progressCount}/151 ({Math.round((progressCount / 151) * 100)}%)
                        </div>
                    </div>
                    
                    <p className="celebration-message progress-message">
                        Congrats on catching so many Pokémon. Keep it going!
                    </p>
                    <img 
                        key="progress-celebration-image"
                        src={pokemonProgressImage} 
                        alt="Pokemon Progress" 
                        className="celebration-image progress-image"
                    />
                    
                    <button 
                        className="celebration-button progress-button" 
                        onClick={handleProgressDismiss}
                        onMouseEnter={() => soundManager.playBubbleHover()}
                    >
                        Let's go!
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

export default Celebrations;