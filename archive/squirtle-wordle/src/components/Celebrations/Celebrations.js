import React from 'react';
import pokemonMasterImage from '../../assets/pokemon-master.png';
import pokemonProgressImage from '../../assets/pokemon-progress.png';

function Celebrations({ 
    showMasterCelebration, 
    showProgressCelebration, 
    progressCount,
    onDismissMaster, 
    onDismissProgress,
    onHoorayClick 
}) {
    const [confettiKey, setConfettiKey] = React.useState(0);
    const [hoorayFireworks, setHoorayFireworks] = React.useState(false);
    const [isFadingOut, setIsFadingOut] = React.useState(false);

    // Create confetti animation
    React.useEffect(() => {
        if (showMasterCelebration || showProgressCelebration) {
            setConfettiKey(prev => prev + 1);
            setIsFadingOut(false);
        }
    }, [showMasterCelebration, showProgressCelebration]);

    const handleHoorayClick = () => {
        // Trigger more fireworks immediately
        setHoorayFireworks(true);
        setConfettiKey(prev => prev + 1);
        
        // Start fade out animation
        setIsFadingOut(true);
        
        // Reset fireworks and dismiss after fade completes
        setTimeout(() => {
            setHoorayFireworks(false);
            onHoorayClick();
        }, 2000);
    };

    const handleProgressDismiss = () => {
        // Start fade out animation
        setIsFadingOut(true);
        
        // Dismiss after fade completes
        setTimeout(() => {
            onDismissProgress();
        }, 800);
    };

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
                            151/151 (100%) 🏆
                        </div>
                    </div>
                    
                    <img 
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
                        src={pokemonProgressImage} 
                        alt="Pokemon Progress" 
                        className="celebration-image progress-image"
                    />
                    
                    <button 
                        className="celebration-button progress-button" 
                        onClick={handleProgressDismiss}
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