class ArmorOfGodGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        // Keep desktop rendering exactly as-is.  Phones/tablets use a lighter
        // decorative-effects path; this never changes gameplay simulation.
        this.reducedMobileEffects = window.matchMedia('(pointer: coarse) and (max-width: 1024px)').matches;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameOver, levelComplete, waitingToEnterTemple, enteringTemple, celebrating
        this.isPaused = false;
        this.postBossSurface = false;
        this.keepVictoryMusicForCompletion = false;
        this.surfaceCaveExit = null;
        this.postBossTempleCelebrated = false;
        this.pendingLevelThreeBoss = false;
        this.postBossTimerFrames = 0;
        this.completedGameRun = false;
        
        // Temple entrance sequence properties
        this.templeEntranceTimer = 0;
        this.templeEntranceSpeed = 2;
        this.templeCenterX = 0; // Will be calculated based on castle position
        this.hasArmor = false;
        this.armorTimer = 0;
        this.armorDuration = 15 * 60; // 15 seconds at 60fps
        this.level = 1;
        this.unlockedStageCount = this.loadUnlockedStageCount();
        
        // Level data
        this.levelData = {
            1: { name: 'Clover Hills', image: 'images/ui/level-01-clover-hills.png' },
            2: { name: 'Midnight Jungle', image: 'images/ui/level-02-midnight-jungle.png' },
            3: { name: 'Granite Mountain Pass', image: 'images/ui/level-03-granite-mountain-pass.png' }
        };
        
        this.cameraX = 0;
        this.cameraY = 0;
        this.booksCollected = 0;
        this.armorPieces = [
            { name: 'Belt of Truth', reference: 'Ephesians 6:14', verse: '“Stand therefore, having your loins girt about with truth,”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p14#p14', imagePath: 'images/armor-pieces/armor-skirt.png' },
            { name: 'Breastplate of Righteousness', reference: 'Ephesians 6:14', verse: '“And having on the breastplate of righteousness;”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p14#p14', imagePath: 'images/armor-pieces/armor-breastplate.png' },
            { name: 'Boots of the Gospel', reference: 'Ephesians 6:15', verse: '“And your feet shod with the preparation of the gospel of peace;”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p15#p15', imagePath: 'images/armor-pieces/armor-boots.png' },
            { name: 'Shield of Faith', reference: 'Ephesians 6:16', verse: '“Above all, taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked.”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p16#p16', imagePath: 'images/armor-pieces/armor-shield.png' },
            { name: 'Helmet of Salvation', reference: 'Ephesians 6:17', verse: '“And take the helmet of salvation,”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p17#p17', imagePath: 'images/armor-pieces/armor-helmet.png' },
            { name: 'Sword of the Spirit', reference: 'Ephesians 6:17', verse: '“And the sword of the Spirit, which is the word of God:”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p17#p17', imagePath: 'images/armor-pieces/armor-sword.png' },
            { name: 'Heart of Prayer', reference: 'Ephesians 6:18', verse: '“Praying always with all prayer and supplication in the Spirit”', link: 'https://www.churchofjesuschrist.org/study/scriptures/nt/eph/6?lang=eng&id=p18#p18', imagePath: 'images/armor-pieces/pray-always.png' }
        ].map(piece => ({ ...piece, image: Object.assign(new Image(), { src: piece.imagePath }) }));
        this.armorPiecesFound = 0;
        this.armorPiecesSeen = new Set();
        this.currentArmorPiece = null;
        this.armorLearningDismissed = this.loadArmorLearningPreference();
        this.armorLearningButtonLabels = ['Let\'s get it!', 'Righteous!', 'Ah yeah!', 'Onward!', 'Amen!', 'Suit up!'];
        this.armorLearningButtonIndex = 0;
        this.selectedPetType = 'dog'; // Default to dog
        this.creditsEndTimer = null;
        this.creditsSectionCleanupTimer = null;
        this.levelOneWelcomeTimer = null;
        this.cutsceneSources = [1, 2, 3].map(number => `cutscenes/opening-${number}.mp4`);
        this.cutsceneCrossfadeDuration = 1;
        this.cutscenePreloadPromise = null;
        this.cutsceneRunId = 0;
        this.autoResumeAfterInstructions = false;
        this.preserveHealthOnNextLevel = false;
        
        // Scoring system
        this.score = 0; // Current level score
        this.totalScore = 0; // Total score across all levels
        this.levelStartTime = 0;
        this.levelEndTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        this.floatingScores = []; // For floating score indicators
        this.damageTaken = 0; // Track damage for no-damage bonus
        this.deathCount = 0;
        this.deathPenaltyTotal = 0;
        this.enemiesKilled = new Set(); // Track which enemy types killed for bonus
        
        // Combo system
        this.comboMode = false; // Tracks if we're in combo mode
        this.comboMultiplier = 1; // Current multiplier (starts at 1)
        this.airborneKills = 0; // Number of kills while airborne
        
        // Initialize scoring system
        this.initializeScoring();
        this.highScoreBoard = new HighScoreBoard(this);
        
        // Load images
        this.templeImage = new Image();
        this.templeImage.src = 'images/sprites/world/temple/temple.png';
        this.bomImage = new Image();
        this.bomImage.src = 'images/sprites/pickups/scripture-pickup.png';
        this.heartImage = new Image();
        this.heartImage.src = 'images/sprites/pickups/health-up.png';
        this.arrowImage = new Image();
        this.arrowImage.src = 'images/sprites/enemies/fiery-arrow.png';
        this.brokenArrowImage = new Image();
        this.brokenArrowImage.src = 'images/sprites/enemies/fiery-arrow-broken.png';
        
        // Load foreground images
        this.foregroundImages = {};
        this.loadForegroundImages();
        
        // Game physics constants
        this.gravity = 0.42;
        this.jumpPower = -13.34;
        this.baseSpeed = 4;
        this.baseJumpPower = -13.34;
        
        // Game speed control
        this.gameSpeed = this.loadGameSpeedSetting();
        this.lastFrameTime = 0;
        this.targetFrameRate = 60;
        
        // Castle/temple position (towards end of temple platform) - will be set based on level
        this.setCastlePosition();
        
        // Player properties
        this.player = {
            x: 150,
            y: 420,
            width: 32,
            height: 48,
            velocityY: 0,
            isJumping: false,
            isDucking: false,
            isGrounded: true,
            color: '#8b4513',
            armorColor: '#c0c0c0',
            animFrame: 0,
            animTimer: 0,
            animSpeed: 12,
            isMoving: false,
            health: 4,
            maxHealth: 4,
            invulnerable: false,
            invulnerabilityTimer: 0,
            invulnerabilityDuration: 120,
            game: this, // Reference to game object for combo system
            // Petting animation properties
            isPetting: false,
            pettingTimer: 0,
            pettingDuration: 60, // 1 second petting animation
            handOffset: 0,
            facingRight: true, // Player facing direction
            blockedLeft: false,
            blockedRight: false,
            // Variable jump properties
            jumpHeld: false,
            minJumpHeight: 0.4, // Minimum jump as fraction of full jump
            jumpCutSpeed: 0.5 // Speed at which jump is reduced when key released
        };
        
        // Pet companion properties (can be dog or cat)
        this.pet = {
            x: 100,
            y: 440,
            width: 24,
            height: 22, // Increased to match visual representation (body 8 + legs 6 + head area)
            velocityY: 0,
            isGrounded: true,
            animFrame: 0,
            animTimer: 0,
            animSpeed: 10,
            isMoving: false,
            followDistance: 25,
            catchUpSpeed: 4.0,
            normalSpeed: 2.5,
            facingRight: true,
            type: 'dog',
            // Petting properties
            isBeingPetted: false,
            pettingTimer: 0,
            pettingDuration: 120, // 2 seconds at 60fps
            tailWagTimer: 0,
            tailWagSpeed: 8,
            jumpCount: 0,
            maxJumps: 2,
            jumpTimer: 0,
            jumpCooldown: 30 // 0.5 seconds between jumps
        };

        // make accessible from window
        window.game = this;
        window.getPlayerPosition = () => {
            if (!this.player) return null;
            const position = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
            console.log('Player position:', position);
            return position;
        };
        
        // Death system
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.deathFreezeTime = 60;
        
        // Last safe platform tracking for pit respawn
        this.lastSafePlatform = { x: 50, y: 378 }; // Default spawn position
        this.lastSafePlatformTimer = 0; // Timer to prevent immediate updates
        
        // Initialize managers
        this.audioManager = new AudioManager();
        this.effectsManager = new EffectsManager();
        this.effectsManager.reducedEffects = this.reducedMobileEffects;
        this.inputHandler = new InputHandler();
        this.worldManager = new WorldManager();
        this.arrowManager = new ArrowManager(this.audioManager, this.arrowImage, this.brokenArrowImage, this);
        this.enemyManager = new EnemyManager(this.audioManager, this);
        this.backgroundManager = new BackgroundManager();
        this.uiRenderer = new UIRenderer();
        this.characterRenderer = new CharacterRenderer();
        this.petManager = new PetManager(this.pet, this);
        this.bossManager = new BossManager();
        this.caveCrystalImages = ['crystal-1.png', 'crystal-2.png', 'crystal-3.png'].map(file => {
            const image = new Image();
            image.src = `images/sprites/world/props/${file}`;
            return image;
        });
        this.pendingBossIntro = false;
        this.bossFightCheckpoint = false;
        this.postBossSurface = false;
        this.postBossTimerFrames = 0;
        this.bossFightStartTime = 0;
        this.bossFightEndTime = 0;
        this.bossFightPausedTime = 0;
        this.bossFightPauseStartTime = 0;
        this.heartSpawnTimer = 0;
        this.scriptureSpawnTimer = 0;
        this.bossScriptureSpawnIndex = 0;
        
        // Setup event listeners
        this.inputHandler.setupEventListeners(this.canvas, this);
        this.setupMenuEvents();
        this.setupCreditsKeyboardControls();
        this.setupMobileExperience();
        this.setupArmorLearningEvents();
        this.gameLoop = this.gameLoop.bind(this);
        this.setLevelSelectorVisible(true);
        
        // Initialize game state for current level
        this.enemyManager.setLevel(this.level);
        
        // Initialize audio button appearance
        this.updateAudioButtonAppearance();
        
        // Start game loop
        this.gameLoop();
        
    }

    collectStartupImages() {
        const images = new Set();
        const visited = new WeakSet();
        const collect = value => {
            if (!value || typeof value !== 'object') return;
            if (value instanceof HTMLImageElement) {
                if (value.src) images.add(value);
                return;
            }
            if (value instanceof HTMLElement || value instanceof HTMLMediaElement || visited.has(value)) return;
            visited.add(value);
            Object.values(value).forEach(collect);
        };
        collect(this);
        document.querySelectorAll('img').forEach(image => images.add(image));
        return [...images];
    }

    async waitForVideoReady(video) {
        if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => failed(new Error('Timed out waiting for playable media')), 30000);
            const cleanup = () => {
                clearTimeout(timeout);
                video.removeEventListener('canplay', ready);
                video.removeEventListener('error', failed);
            };
            const ready = () => { cleanup(); resolve(); };
            const failed = error => {
                cleanup();
                const detail = error instanceof Error ? `: ${error.message}` : '';
                reject(new Error(`Could not prepare cutscene: ${video.currentSrc || video.src}${detail}`));
            };
            video.addEventListener('canplay', ready, { once: true });
            video.addEventListener('error', failed, { once: true });
        });
    }

    async loadCutsceneVideos(sources) {
        const videos = [this.cutsceneCurrentVideo, this.cutsceneOtherVideo];
        videos.forEach((video, index) => { video.src = sources[index]; });
        // Register readiness listeners before load(): on a warm mobile cache the
        // event can be dispatched before a listener added afterwards sees it.
        const readiness = Promise.all(videos.map(video => this.waitForVideoReady(video)));
        videos.forEach(video => video.load());
        await readiness;
    }

    async preloadStartupAssets(onProgress = () => {}) {
        const images = this.collectStartupImages();
        const preloader = new AssetPreloader({ mobile: window.matchMedia('(pointer: coarse)').matches });
        // The manifest is the complete, revisioned source of truth—not a partial
        // runtime object walk—so every shipped image, sound, and cutscene is ready.
        await preloader.preload(Object.keys(preloader.manifest.assets), onProgress);
        if (preloader.persistentCacheUnavailable) {
            console.warn('Game assets are ready, but this browser did not grant persistent offline cache storage.');
        }
        if (document.body.classList.contains('development-mode')) {
            console.info(`Verified ${Object.keys(preloader.manifest.assets).length} assets from manifest ${preloader.manifest.version}.`);
        }
        await preloader.decodeImages(images, onProgress);
        await this.audioManager.usePreparedSources(preloader);

        // Prepare the actual playback elements.  The old implementation downloaded
        // these files into throwaway videos, then requested them again at playback.
        this.cutsceneCurrentVideo = document.getElementById('cutsceneVideoA');
        this.cutsceneOtherVideo = document.getElementById('cutsceneVideoB');
        // Object URLs guarantee the first visit uses the verified bytes already in
        // Cache Storage, even before a newly installed service worker controls this
        // particular page. Mobile WebKit is the exception: it can emit a media
        // error for a valid MP4 blob URL, so keep Safari on normal same-origin URLs
        // and let its media stack use range requests and the browser cache.
        this.cutscenePreparedSources = await Promise.all(this.cutsceneSources.map(source => (
            preloader.getCachedObjectURL(source, { preferNetworkURL: preloader.preferNativeMediaURLs })
        )));
        try {
            await this.loadCutsceneVideos(this.cutscenePreparedSources);
        } catch (error) {
            // A browser that fails to decode a Cache Storage blob gets one clean
            // retry through its normal HTTP media path before startup is failed.
            if (!this.cutscenePreparedSources.some(source => source.startsWith('blob:'))) throw error;
            console.warn('Cached cutscene media failed; retrying with normal URLs.', error);
            this.cutscenePreparedSources = [...this.cutsceneSources];
            await this.loadCutsceneVideos(this.cutscenePreparedSources);
        }
        onProgress({ percent: 100, state: 'ADVENTURE READY' });
    }

    useNativeAssetLoading() {
        // This is intentionally a startup-only escape hatch. Images already retain
        // their original URLs; restore media too, then let each browser element
        // fetch its asset normally as gameplay reaches it.
        this.audioManager.restoreNativeSources();
        this.cutscenePreparedSources = [...this.cutsceneSources];
        [this.cutsceneCurrentVideo, this.cutsceneOtherVideo].forEach((video, index) => {
            if (!video) return;
            video.pause();
            video.src = this.cutscenePreparedSources[index];
            video.load();
        });
    }

    revealMenuAfterStartup(loaderWasShown = true) {
        this.initializeAudio();
        requestAnimationFrame(() => {
            document.body.classList.add('menu-ready');
            const loader = document.getElementById('startupLoading');
            if (loaderWasShown) {
                loader.classList.add('startup-loading--leaving');
                setTimeout(() => loader.classList.add('hidden'), 650);
            } else {
                loader.classList.add('hidden');
            }
            document.getElementById('startBtn').focus({ preventScroll: true });
        });
    }

    loadArmorLearningPreference() {
        try { return localStorage.getItem('armor-of-god-hide-armor-learning') === 'true'; } catch (_) { return false; }
    }

    setupArmorLearningEvents() {
        const modal = document.getElementById('armorLearningModal');
        const done = document.getElementById('armorLearningDone');
        const hide = document.getElementById('armorLearningHide');
        done.addEventListener('click', () => this.closeArmorLearningModal());
        done.addEventListener('mouseenter', () => this.audioManager.playSoundEffect('buttonHover'));
        hide.checked = this.armorLearningDismissed;
        hide.addEventListener('change', () => {
            this.armorLearningDismissed = hide.checked;
            try { localStorage.setItem('armor-of-god-hide-armor-learning', String(hide.checked)); } catch (_) { /* preference remains for this session */ }
        });
        modal.addEventListener('click', event => { if (event.target === modal) this.closeArmorLearningModal(); });
        document.addEventListener('keydown', event => {
            if (modal.classList.contains('hidden')) return;
            if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
            event.preventDefault();
            event.stopImmediatePropagation();
            this.closeArmorLearningModal();
        }, true);
        this.canvas.addEventListener('click', event => {
            const bounds = this.uiRenderer.getArmorCardBounds();
            if (!bounds || !this.currentArmorPiece) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
            const y = (event.clientY - rect.top) * this.canvas.height / rect.height;
            if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) this.openArmorLearningModal(this.currentArmorPiece, true);
        });
        this.canvas.addEventListener('mousemove', event => {
            const bounds = this.uiRenderer.getArmorCardBounds();
            if (!bounds) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
            const y = (event.clientY - rect.top) * this.canvas.height / rect.height;
            const hovered = x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
            if (hovered && !this.uiRenderer.armorCardHovered) this.audioManager.playSoundEffect('buttonHover');
            this.uiRenderer.setArmorCardHovered(hovered);
            this.canvas.style.cursor = hovered ? 'pointer' : 'default';
        });
        this.canvas.addEventListener('mouseleave', () => this.uiRenderer.setArmorCardHovered(false));
    }

    getNextArmorPiece() {
        const index = this.armorPiecesFound < this.armorPieces.length
            ? this.armorPiecesFound
            : Math.floor(Math.random() * this.armorPieces.length);
        this.armorPiecesFound++;
        return this.armorPieces[index];
    }

    collectArmorPiece() {
        const piece = this.getNextArmorPiece();
        this.currentArmorPiece = piece;
        this.audioManager.playSound('armorFound');
        this.effectsManager.triggerArmorPieceFound(this.player.x + this.player.width / 2, this.player.y - 8, piece.image);
        this.uiRenderer.showArmorCard(piece);
        if (!this.armorLearningDismissed && !this.armorPiecesSeen.has(piece.name)) {
            this.armorPiecesSeen.add(piece.name);
            this.openArmorLearningModal(piece, true);
        }
    }

    openArmorLearningModal(piece, pauseGame) {
        this.currentArmorPiece = piece;
        document.getElementById('armorLearningName').textContent = piece.name;
        document.getElementById('armorLearningImage').src = piece.imagePath;
        document.getElementById('armorLearningImage').alt = piece.name;
        document.getElementById('armorLearningVerse').textContent = piece.verse;
        const scriptureLink = document.getElementById('armorLearningLink');
        scriptureLink.href = piece.link;
        scriptureLink.textContent = `— ${piece.reference}`;
        const piecesRemaining = Math.max(0, 3 - this.booksCollected);
        const piecesRemainingBadge = document.getElementById('armorLearningPiecesRemaining');
        piecesRemainingBadge.textContent = piecesRemaining;
        piecesRemainingBadge.classList.toggle('hidden', piecesRemaining === 0);
        document.getElementById('armorLearningMorePrefix').textContent = piecesRemaining === 0 ? '' : 'Collect ';
        document.getElementById('armorLearningMoreText').textContent = piecesRemaining === 0
            ? 'Armor activated!'
            : ` more ${piecesRemaining === 1 ? 'piece' : 'pieces'} to activate armor.`;
        document.getElementById('armorLearningActivatedImage').classList.toggle('hidden', piecesRemaining !== 0);
        document.querySelector('.armor-learning-more').classList.toggle('armor-learning-more--activated', piecesRemaining === 0);
        document.getElementById('armorLearningHide').checked = this.armorLearningDismissed;
        document.getElementById('armorLearningModal').classList.remove('hidden');
        this.armorModalPausedGame = pauseGame && !this.isPaused;
        if (this.armorModalPausedGame) this.togglePause();
        const armorDoneButton = document.getElementById('armorLearningDone');
        armorDoneButton.textContent = this.armorLearningButtonLabels[this.armorLearningButtonIndex % this.armorLearningButtonLabels.length];
        this.armorLearningButtonIndex++;
        armorDoneButton.focus({ preventScroll: true });
        this.audioManager.playSoundEffect('modalOpen');
    }

    closeArmorLearningModal() {
        const modal = document.getElementById('armorLearningModal');
        if (modal.classList.contains('hidden')) return;
        modal.classList.add('hidden');
        this.audioManager.playSoundEffect('modalClose');
        if (this.armorModalPausedGame && this.isPaused) this.togglePause();
        this.armorModalPausedGame = false;
    }

    setupMobileExperience() {
        const pauseButton = document.getElementById('pauseTouchBtn');
        pauseButton?.addEventListener('click', () => {
            if (!this.mobileOrientationPaused) this.togglePause();
        });
        document.getElementById('skipCutsceneBtn')?.addEventListener('click', () => this.skipOpeningCutscene());
        document.getElementById('creditsPreviousBtn')?.addEventListener('click', () => this.previousCreditsSection());
        document.getElementById('creditsNextBtn')?.addEventListener('click', () => this.nextCreditsSection());
        document.getElementById('creditsSkipBtn')?.addEventListener('click', () => this.skipCredits());
        const creditsScreen = document.getElementById('creditsScreen');
        let creditsTouchStartY = null;
        creditsScreen?.addEventListener('touchstart', event => {
            if (!this.isTouchMobile()) return;
            creditsTouchStartY = event.changedTouches[0]?.clientY ?? null;
        }, { passive: true });
        creditsScreen?.addEventListener('touchend', event => {
            if (!this.isTouchMobile() || creditsTouchStartY === null || this.gameState !== 'credits') return;
            const touchEndY = event.changedTouches[0]?.clientY;
            const distance = touchEndY - creditsTouchStartY;
            creditsTouchStartY = null;
            if (Math.abs(distance) < 48) return;
            if (distance < 0) this.nextCreditsSection();
            else this.previousCreditsSection();
        }, { passive: true });
        this.mobileOrientationPaused = false;
        this.updateMobileOrientation = this.updateMobileOrientation.bind(this);
        window.addEventListener('resize', this.updateMobileOrientation);
        window.addEventListener('orientationchange', this.updateMobileOrientation);
    }

    isTouchMobile() {
        return window.matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0;
    }

    updateMobileOrientation() {
        const shouldRotate = this.gameState === 'playing' && this.isTouchMobile() && window.innerHeight > window.innerWidth;
        const notice = document.getElementById('rotateDeviceNotice');
        if (shouldRotate && !this.mobileOrientationPaused) {
            this.mobileOrientationPaused = true;
            this.mobileOrientationWasAlreadyPaused = this.isPaused;
            this.inputHandler.clearTouchInputs();
            if (!this.isPaused) this.togglePause();
        } else if (!shouldRotate && this.mobileOrientationPaused) {
            this.mobileOrientationPaused = false;
            if (!this.mobileOrientationWasAlreadyPaused && this.isPaused) this.togglePause();
            this.mobileOrientationWasAlreadyPaused = false;
        }
        // Only reveal the orientation notice after the game is safely paused.
        notice?.classList.toggle('hidden', !shouldRotate);
    }
    
    initializeAudio() {
        // Set up user interaction handler for browsers with autoplay restrictions
        const startAudioOnInteraction = () => {
            if (this.gameState === 'menu') {
                this.audioManager.playMusic('menu');
            }
        };
        
        // Add listeners for any user interaction to start music
        document.addEventListener('click', startAudioOnInteraction, { once: true });
        document.addEventListener('keydown', startAudioOnInteraction, { once: true });
        document.addEventListener('touchstart', startAudioOnInteraction, { once: true });
        document.addEventListener('mousemove', startAudioOnInteraction, { once: true });
        
        // Also add a visual indicator that audio will start on interaction
        this.showAudioPrompt();
    }
    
    showAudioPrompt() {
        // Create a subtle prompt to let users know they can interact to start audio
        const prompt = document.createElement('div');
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        const mobilePromptBottom = isLandscape ? 'max(2px, env(safe-area-inset-bottom))' : 'max(12px, env(safe-area-inset-bottom))';
        prompt.id = 'audioPrompt';
        prompt.style.cssText = `
            position: fixed;
            top: ${isTouchDevice ? 'auto' : '20px'};
            right: auto;
            bottom: ${isTouchDevice ? mobilePromptBottom : 'auto'};
            left: ${isTouchDevice ? '50%' : '20px'};
            transform: ${isTouchDevice ? 'translateX(-50%)' : 'none'};
            background: rgba(0,0,0,0.8);
            color: #FFD700;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.7;
        `;
        prompt.textContent = isTouchDevice ? 'Tap anywhere to enable audio' : 'Click anywhere to enable audio';
        document.body.appendChild(prompt);
        
        // Remove prompt after user interaction or timeout
        const removePrompt = () => {
            if (document.getElementById('audioPrompt')) {
                document.getElementById('audioPrompt').remove();
            }
        };
        
        document.addEventListener('click', removePrompt, { once: true });
        document.addEventListener('keydown', removePrompt, { once: true });
        document.addEventListener('touchstart', removePrompt, { once: true });
        
        // Auto-remove after 5 seconds
        setTimeout(removePrompt, 5000);
    }
    
    setupMenuEvents() {
        document.addEventListener('keydown', event => {
            const isStartKey = event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
            if (!isStartKey || this.gameState !== 'menu' || document.activeElement !== document.getElementById('startBtn')) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            document.getElementById('startBtn').click();
        }, true);
        document.getElementById('startBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('startGameClick');
            this.hasArmor = false;
            this.player.color = '#8b4513';
            this.booksCollected = 0;
            this.armorPiecesFound = 0;
            this.armorPiecesSeen.clear();
            this.currentArmorPiece = null;
            this.pet.type = this.selectedPetType; // Set pet type based on selection
            this.startGame();
        });
        
        // Pet selection buttons
        document.getElementById('selectDog').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.selectPet('dog');
            this.audioManager.playSound('bark1');
        });
        
        document.getElementById('selectCat').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.selectPet('cat');
            this.audioManager.playSound('meow');
        });
        
        // Add hover sound effects for main menu buttons
        document.getElementById('startBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('selectDog').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('selectCat').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('instructionsLink').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Instructions modal
        document.getElementById('instructionsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalOpen');
            this.showInstructionsModal();
        });

        document.getElementById('creditsLink').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('creditsLink').addEventListener('click', event => {
            event.preventDefault();
            this.audioManager.playSoundEffect('buttonClick');
            this.startCredits();
        });
        
        document.getElementById('closeModal').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('closeModal').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalClose');
            this.hideInstructionsModal();
        });

        document.getElementById('instructionsDoneBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('instructionsDoneBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalClose');
            this.hideInstructionsModal();
        });

        ['scoringLink', 'scoringBackBtn'].forEach(id => {
            document.getElementById(id).addEventListener('mouseenter', () => {
                this.audioManager.playSoundEffect('buttonHover');
            });
        });
        document.getElementById('scoringLink').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.showScoringInstructions();
        });
        document.getElementById('scoringBackBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.showGameplayInstructions();
        });
        
        // Close modal when clicking outside content
        document.getElementById('instructionsModal').addEventListener('click', (e) => {
            if (e.target.id === 'instructionsModal') {
                this.hideInstructionsModal();
            }
        });
        document.addEventListener('keydown', event => {
            const instructionsModal = document.getElementById('instructionsModal');
            if (instructionsModal.classList.contains('hidden') ||
                (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar')) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            this.audioManager.playSoundEffect('buttonClick');
            this.audioManager.playSoundEffect('modalClose');
            this.hideInstructionsModal();
        }, true);
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.retryCurrentLevel();
        });

        document.getElementById('restartBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.goToMainMenu();
        });

        document.getElementById('mainMenuBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });        document.getElementById('mainMenuBtn2').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.goToMainMenu();
        });
        
        document.getElementById('mainMenuBtn2').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('creditsMenuBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.skipCredits();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            if (this.pendingLevelThreeBoss) {
                this.continueToBossFight();
                return;
            }
            this.audioManager.playSoundEffect('buttonClick');
            if (this.level === 1 || this.level === 2) {
                this.startNextLevel();
            } else {
                this.openFinalLeaderboard();
            }
        });
        
        document.getElementById('nextLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('startLevelBtn').addEventListener('click', () => {
            this.exitLevelIntro();
        });
        
        document.getElementById('startLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        document.getElementById('retryLevelBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.retryCurrentLevel();
        });

        const scoreDetailsTrigger = document.getElementById('completionScoreDetailsTrigger');
        scoreDetailsTrigger.addEventListener('click', () => this.showCompletionScoreDetails());
        scoreDetailsTrigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.showCompletionScoreDetails();
            }
        });
        ['closeScoreDetailsBtn', 'scoreDetailsDoneBtn'].forEach(id => {
            document.getElementById(id).addEventListener('click', () => this.hideCompletionScoreDetails());
        });
        document.getElementById('completionScoreDetailsModal').addEventListener('click', event => {
            if (event.target.id === 'completionScoreDetailsModal') this.hideCompletionScoreDetails();
        });
        
        document.getElementById('retryLevelBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Audio toggle button
        document.getElementById('audioToggleBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.toggleAudio();
        });
        
        document.getElementById('audioToggleBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Speed control button
        document.getElementById('speedToggleBtn').addEventListener('click', () => {
            this.audioManager.playSoundEffect('buttonClick');
            this.toggleSpeedDropdown();
        });
        
        const selectLevel = direction => {
            this.audioManager.playSoundEffect('buttonClick');
            this.cycleLevelSelector(direction);
        };
        document.getElementById('previousLevelBtn').addEventListener('click', () => selectLevel(-1));
        document.getElementById('nextLevelBtnMenu').addEventListener('click', () => selectLevel(1));
        document.getElementById('levelSelectorBtn').addEventListener('click', () => selectLevel(1));
        ['previousLevelBtn', 'nextLevelBtnMenu', 'levelSelectorBtn'].forEach(id => {
            document.getElementById(id).addEventListener('mouseenter', () => this.audioManager.playSoundEffect('buttonHover'));
        });
        document.getElementById('leaderboardLink').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        document.getElementById('leaderboardLink').addEventListener('click', event => {
            event.preventDefault();
            this.audioManager.playSoundEffect('buttonClick');
            this.highScoreBoard.open();
        });
        
        document.getElementById('speedToggleBtn').addEventListener('mouseenter', () => {
            this.audioManager.playSoundEffect('buttonHover');
        });
        
        // Speed slider
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.setGameSpeed(parseFloat(e.target.value));
            this.audioManager.playSound('buttonClick2');
        });
        
        // Close speed dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#speedToggleBtn') && !e.target.closest('#speedDropdown')) {
                this.hideSpeedDropdown();
            }
        });
        
        // Update UI to reflect saved settings
        this.updateUIFromSavedSettings();
        
        // Initialize pet control text
        this.updatePetControlText();
    }

    setupCreditsKeyboardControls() {
        // Capture these keys before focused controls or browser scrolling can consume them.
        document.addEventListener('keydown', event => {
            if (this.gameState !== 'credits') return;
            const key = event.key;
            if (key === 'ArrowRight' || key === 'ArrowDown' || key === ' ' || key === 'Enter') {
                this.nextCreditsSection();
            } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
                this.previousCreditsSection();
            } else if (key === 'Escape') {
                this.skipCredits();
            } else {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);
    }
    
    selectPet(petType) {
        this.selectedPetType = petType;
        
        // Update UI to show selection
        document.querySelectorAll('.pet-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById(`select${petType.charAt(0).toUpperCase() + petType.slice(1)}`).classList.add('selected');
        
        // Update controls text to show selected pet type
        const petControlText = document.getElementById('petControlText');
        if (petControlText) {
            petControlText.textContent = `D Pet ${petType.charAt(0).toUpperCase() + petType.slice(1)}`;
        }
    }
    
    // Scoring system methods
    initializeScoring() {
        this.score = 0; // Reset level score
        this.levelStartTime = performance.now();
        this.levelEndTime = 0; // Reset level end time
        this.totalPausedTime = 0; // Reset paused time tracking
        this.pauseStartTime = 0;
        this.floatingScores = [];
        this.scoreBreakdown = [];
        this.levelThreeCollapseBonusesPrepared = false;
        this.templeJumpBonusAwarded = false;
        this.damageTaken = 0; // Reset damage tracking
        this.enemiesKilled = new Set(); // Reset enemy tracking
        this.deathCount = 0;
        this.deathPenaltyTotal = 0;
    }
    
    addScore(points, color = '#FFD700', label = '') {
        // Don't add to score immediately - wait for floating score to finish
        this.scoreBreakdown.push({ points, label: label || 'Points' });
        
        // Add floating score indicator (always add since we want all scores to show)
        this.floatingScores.push({
            points: points,
            timer: 0,
            duration: 300, // 5 seconds at 60fps
            color: color,
            label: label,
            pendingPoints: points // Store points to add when animation completes
        });
    }
    
    updateFloatingScores(speed = 1) {
        this.floatingScores = this.floatingScores.filter(scoreIndicator => {
            scoreIndicator.timer += speed;
            
            // Calculate opacity to determine when to add points
            const opacity = Math.max(0, (scoreIndicator.duration - scoreIndicator.timer) / scoreIndicator.duration);
            
            // Add points when the floating score starts to fade (opacity drops to 80%)
            if (opacity <= 0.75 && scoreIndicator.pendingPoints) {
                // Add the points to the actual score as it's fading
                this.score += scoreIndicator.pendingPoints;
                scoreIndicator.pendingPoints = null; // Mark as processed
            }
            
            return scoreIndicator.timer < scoreIndicator.duration;
        });
    }
    
    getLevelTime() {
        // Use stored end time if level is completed, otherwise calculate current time
        const currentTime = this.levelEndTime > 0 ? this.levelEndTime : performance.now();
        const activePausedTime = this.isPaused ? (currentTime - this.pauseStartTime) : 0;
        const totalPaused = this.totalPausedTime + activePausedTime;
        const actualElapsedTime = currentTime - this.levelStartTime - totalPaused;
        return Math.max(0, Math.floor(actualElapsedTime / 1000 * 60)); // Convert to game frames
    }
    
    calculateSpeedBonus() {
        if (this.bossFightEndTime > 0) {
            const targetTime = 105 * 60;
            const secondsUnderTarget = Math.max(0, (targetTime - this.getBossFightTime()) / 60);
            return Math.min(3000, Math.floor(secondsUnderTarget * 100));
        }
        const levelTime = this.getLevelTime();
        const targetTime = {
            1: 50 * 60, // Extra opening and post-scripture stretch
            2: 80 * 60,
            3: 65 * 60
        };
        
        const target = targetTime[this.level] || 3000;
        if (levelTime <= target) {
            const bonus = Math.max(0, Math.floor((target - levelTime) / 60 * 100));
            return Math.min(bonus, 2000); // Cap at 2000 points
        }
        return 0;
    }
    
    calculateAndDisplayBonuses() {
        let bonusTotal = 0;

        
        // Reward players for reaching the temple healthy.
        const healthBonus = Math.max(0, this.player.health) * 250;
        if (healthBonus > 0) {
            this.addScore(healthBonus, '#FF6B6B', `Health Bonus (${this.player.health} Hearts)`);
            bonusTotal += healthBonus;
        }

        // A flawless level earns the larger no-damage bonus.
        if (this.damageTaken === 0) {
            this.addScore(3000, '#00FF00', 'No Damage Bonus');
            bonusTotal += 3000;
        }
        
        // Check for all enemies killed bonus - check if every individual snail has been killed
        const allSnails = this.enemyManager.snails;
        const totalSnails = allSnails.length;
        const killedSnails = allSnails.filter(snail => snail.killed).length;
        
        if (totalSnails > 0 && killedSnails === totalSnails) {
            this.addScore(1000, '#E74C3C', 'All Enemies Killed');
            bonusTotal += 1000;
        }
        
        // Calculate and add speed bonus
        const speedBonus = this.calculateSpeedBonus();
        if (speedBonus > 0) {
            this.addScore(speedBonus, '#00FF00', 'Speed Bonus');
            bonusTotal += speedBonus;
        }
        
        // Update final scores after adding bonuses
        this.finalLevelScore = this.score + bonusTotal;
        this.finalTotalScore = this.totalScore + this.score + bonusTotal;
    }
    
    startGame() {
        if (this.level === 1) {
            this.startOpeningCutscene();
            return;
        }
        this.showLevelIntro();
    }

    startOpeningCutscene() {
        const runId = ++this.cutsceneRunId;
        this.gameState = 'cutscene';
        this.showScreen('cutscene');
        document.getElementById('cutsceneLoading').classList.remove('hidden');
        this.audioManager.playMusic('openingCutscene');
        if (runId !== this.cutsceneRunId || this.gameState !== 'cutscene') return;
        this.cutsceneIndex = 0;
        this.cutsceneMusicFadeStarted = false;
        document.getElementById('cutsceneLoading').classList.add('hidden');
        // This call remains in the Start button's synchronous gesture chain. It is
        // required for reliable iOS audible-media authorization.
        this.playFirstCutsceneVideo();
    }

    playFirstCutsceneVideo() {
        const incoming = this.cutsceneCurrentVideo;
        if (!incoming) return;
        this.configureCutsceneVideo(incoming, null, 0);
        const playPromise = incoming.play();
        if (playPromise) playPromise.catch(error => console.warn('Opening video playback was blocked:', error));
    }

    configureCutsceneVideo(incoming, outgoing, index) {
        if (incoming.videoWidth && incoming.videoHeight) document.getElementById('cutsceneFrame').style.aspectRatio = `${incoming.videoWidth} / ${incoming.videoHeight}`;
        incoming.currentTime = 0;
        incoming.playbackRate = 1;
        const crossfadeDuration = this.cutsceneCrossfadeDuration;
        incoming.style.transitionDuration = `${crossfadeDuration}s`;
        if (outgoing) outgoing.style.transitionDuration = `${crossfadeDuration}s`;
        incoming.onended = () => this.advanceCutscene(index);
        incoming.onerror = () => {
            console.warn(`Cutscene segment ${index + 1} could not be played; skipping it.`);
            if (this.gameState === 'cutscene' && index === this.cutsceneIndex) this.advanceCutscene(index);
        };
        incoming.ontimeupdate = () => {
            const isFinalVideo = index === this.cutsceneSources.length - 1;
            if (incoming.duration && !isFinalVideo && !this.cutsceneTransitioning && incoming.currentTime >= incoming.duration - crossfadeDuration) this.advanceCutscene(index);
        };
        incoming.classList.add('cutscene-video--visible');
        if (outgoing) outgoing.classList.remove('cutscene-video--visible');
    }

    async playCutsceneVideo(index, first = false) {
        const incoming = first ? this.cutsceneCurrentVideo : this.cutsceneOtherVideo;
        const outgoing = first ? null : this.cutsceneCurrentVideo;
        const source = this.cutscenePreparedSources?.[index] || this.cutsceneSources[index];
        if (incoming.src !== new URL(source, document.baseURI).href) {
            incoming.src = source; incoming.load();
            await this.waitForVideoReady(incoming);
        }
        if (this.gameState !== 'cutscene') return;
        this.configureCutsceneVideo(incoming, outgoing, index);
        await incoming.play().catch(error => console.warn('Cutscene video playback was blocked:', error));
        this.cutsceneCurrentVideo = incoming;
        this.cutsceneOtherVideo = incoming === document.getElementById('cutsceneVideoA') ? document.getElementById('cutsceneVideoB') : document.getElementById('cutsceneVideoA');
        if (index === this.cutsceneSources.length - 1) {
            this.cutsceneMusicFadeStarted = true;
            this.audioManager.crossfadeToMusic('openingBadNews', 2000);
        }
    }

    advanceCutscene(index) {
        if (this.gameState !== 'cutscene' || this.cutsceneTransitioning || index !== this.cutsceneIndex) return;
        if (index === this.cutsceneSources.length - 1) { this.finishOpeningCutscene(); return; }
        this.cutsceneTransitioning = true;
        this.cutsceneIndex++;
        this.playCutsceneVideo(this.cutsceneIndex).finally(() => { this.cutsceneTransitioning = false; });
    }

    skipOpeningCutscene() {
        if (this.gameState !== 'cutscene') return;
        this.cutsceneRunId++;
        this.finishOpeningCutscene();
    }

    finishOpeningCutscene() {
        [this.cutsceneCurrentVideo, this.cutsceneOtherVideo].forEach(video => { video?.pause(); video?.classList.remove('cutscene-video--visible'); });
        if (!this.cutsceneMusicFadeStarted) {
            this.audioManager.fadeOutCurrentMusic(2000);
            this.showLevelIntro(2000);
            return;
        }
        this.showLevelIntro();
    }
    
    showLevelIntro(musicDelay = 0) {
        // Give mobile browsers the entire intro to fetch the tracks that follow it.
        // Level three also warms the boss track before its immediate arena transition.
        this.audioManager.preloadMusic('levelIntro', 'adventure');
        if (this.level === 3 || this.level === 'boss') this.audioManager.preloadMusic('bossFight');
        clearTimeout(this.levelIntroFastForwardTimer);
        clearTimeout(this.levelIntroExitTimer);
        clearTimeout(this.levelIntroMusicTimer);
        clearTimeout(this.levelIntroReadyTimer);
        document.getElementById('levelIntroScreen').classList.remove('level-intro--fast-forward', 'level-intro--exiting');
        document.querySelectorAll('#levelIntroScreen .level-intro-rush-target').forEach(element => element.classList.remove('level-intro-rush-target'));
        this.levelIntroFastForwarding = false;
        this.levelIntroExiting = false;
        // Preserve an early second Enter press while the reveal is rushing.  It should
        // continue into gameplay as soon as the fast-forward has caught up.
        this.levelIntroAdvanceQueued = false;
        if (this.level === 'boss') {
            this.bossManager.reset();
            this.enterBossArena();
            return;
        }
        this.gameState = 'levelIntro';
        this.levelIntroReadyToStart = false;
        this.levelIntroReadyTimer = setTimeout(() => {
            if (this.gameState === 'levelIntro') this.levelIntroReadyToStart = true;
        }, 3500);
        document.getElementById('startLevelBtn').innerHTML = 'Start Level <span class="chevron-icon">❯</span>';
        this.showScreen('levelIntro');
        
        // Let a cutscene music fade complete before the intro track takes over.
        this.levelIntroMusicTimer = setTimeout(() => {
            if (this.gameState === 'levelIntro') this.audioManager.playMusic('levelIntro');
        }, musicDelay);
        
        // Update intro screen content
        const levelData = this.levelData[this.level];
        document.getElementById('introLevelNumber').textContent = `LEVEL ${this.level}`;
        document.getElementById('introLevelName').textContent = levelData.name.toUpperCase();
        document.getElementById('introLevelImage').src = levelData.image;
        document.getElementById('introLevelImage').alt = levelData.name;
    }

    fastForwardLevelIntro() {
        if (this.gameState !== 'levelIntro' || this.levelIntroFastForwarding) return;
        this.levelIntroFastForwarding = true;
        const introScreen = document.getElementById('levelIntroScreen');
        const introElements = introScreen.querySelectorAll('.level-number-container, .level-name-container, .level-image-container, .continue-prompt, .start-level-btn');
        introElements.forEach(element => {
            const animation = element.getAnimations()[0];
            if (animation && animation.currentTime > 0) {
                // Already-visible elements finish their current reveal without restarting.
                animation.playbackRate = 8;
            } else if (parseFloat(getComputedStyle(element).opacity) < .99) {
                element.classList.add('level-intro-rush-target');
            }
        });
        introScreen.classList.add('level-intro--fast-forward');
        this.levelIntroFastForwardTimer = setTimeout(() => {
            this.levelIntroFastForwarding = false;
            this.levelIntroReadyToStart = true;
            if (this.levelIntroAdvanceQueued) this.exitLevelIntro();
        }, 550);
    }

    advanceLevelIntro() {
        if (this.gameState !== 'levelIntro') return;
        if (this.levelIntroReadyToStart) {
            this.exitLevelIntro();
            return;
        }
        if (this.levelIntroFastForwarding) {
            this.levelIntroAdvanceQueued = true;
            return;
        }
        this.fastForwardLevelIntro();
    }

    exitLevelIntro() {
        if (this.gameState !== 'levelIntro' || this.levelIntroExiting) return;
        clearTimeout(this.levelIntroReadyTimer);
        clearTimeout(this.levelIntroFastForwardTimer);
        this.levelIntroAdvanceQueued = false;
        this.levelIntroReadyToStart = false;
        this.levelIntroExiting = true;
        const introScreen = document.getElementById('levelIntroScreen');
        introScreen.classList.add('level-intro--exiting');
        this.levelIntroExiting = false;
        this.startGameAfterIntro(true);
    }
    
    startGameAfterIntro(fromIntroTransition = false) {
        if (this.pendingBossIntro) {
            this.pendingBossIntro = false;
            this.gameState = fromIntroTransition ? 'levelTransition' : 'playing';
            if (fromIntroTransition) this.showGameplayCrossfade(); else this.showScreen('game');
            this.player.x = 110; this.pet.x = 60;
            this.player.y = -100; this.player.velocityY = 8; this.player.isGrounded = false;
            this.pet.y = -80; this.pet.velocityY = 8; this.pet.isGrounded = false;
            this.bossManager.enterArena();
            const beginBoss = () => {
                this.startBossFightTimer();
                if (this.audioManager.currentMusic !== this.audioManager.audio.bossFight) this.audioManager.playMusic('bossFight');
            };
            if (fromIntroTransition) this.finishGameplayCrossfade(beginBoss); else beginBoss();
            return;
        }
        // Reset game to initialize world with selected level
        const preserveHealth = this.preserveHealthOnNextLevel;
        this.preserveHealthOnNextLevel = false;
        this.resetGame({ preserveHealth });
        this.gameState = fromIntroTransition ? 'levelTransition' : 'playing';
        if (fromIntroTransition) this.showGameplayCrossfade(); else this.showScreen('game');
        this.updateLevelIndicator();
        
        const beginLevel = () => {
            this.initializeScoring();
            this.audioManager.playMusic('adventure');
            this.arrowManager.spawnInitialArrows(this.player);
            clearTimeout(this.levelOneWelcomeTimer);
            this.levelOneWelcomeTimer = null;
            if (this.level === 1) {
                this.uiRenderer.showMessage('Collect scriptures as you seek the temple.', 360, '#FFD700', 600);
                this.levelOneWelcomeTimer = setTimeout(() => {
                    this.levelOneWelcomeTimer = null;
                    this.uiRenderer.showMessage('Watch out for fiery darts. And lava snails.', 360, '#FFD700', 600);
                }, 2000);
            }
            this.showFirstLevelInstructions();
        };
        if (fromIntroTransition) this.finishGameplayCrossfade(beginLevel); else beginLevel();
    }

    showGameplayCrossfade() {
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('game-screen--entering');
    }

    finishGameplayCrossfade(beginGameplay) {
        this.levelIntroExitTimer = setTimeout(() => {
            document.getElementById('levelIntroScreen').classList.add('hidden');
            document.getElementById('levelIntroScreen').classList.remove('level-intro--exiting');
            document.getElementById('gameScreen').classList.remove('game-screen--entering');
            this.gameState = 'playing';
            this.updateMobileOrientation();
            beginGameplay();
        }, 250);
    }
    
    resetGame({ preserveHealth = false } = {}) {
        // Cancel any pending game over sequence
        this.audioManager.cancelGameOverSequence();
        this.pendingLevelThreeBoss = false;
        this.postBossTimerFrames = 0;
        this.bossFightStartTime = 0;
        this.bossFightEndTime = 0;
        this.bossFightPausedTime = 0;
        this.bossFightPauseStartTime = 0;
        
        // Reset player
        this.player.x = 150;
        this.player.y = 420;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isDucking = false;
        this.player.isGrounded = true;
        this.player.animFrame = 0;
        this.player.animTimer = 0;
        this.player.isMoving = false;
        if (!preserveHealth) this.player.health = this.player.maxHealth;
        this.player.invulnerable = false;
        this.player.invulnerabilityTimer = 0;
        this.player.isPetting = false;
        this.player.pettingTimer = 0;
        this.player.handOffset = 0;
        this.player.facingRight = true;
        this.player.alpha = 1; // Reset visibility for level restart
        this.player.jumpHeld = false;
        this.player.fallingSoundPlayed = false; // Reset falling sound flag
        
        // Reset pet
        this.pet.x = 100;
        this.pet.y = 440;
        this.pet.velocityY = 0;
        this.pet.isGrounded = true;
        this.pet.animFrame = 0;
        this.pet.animTimer = 0;
        this.pet.isMoving = false;
        this.pet.facingRight = true;
        this.pet.isBeingPetted = false;
        this.pet.pettingTimer = 0;
        this.pet.tailWagTimer = 0;
        this.pet.jumpCount = 0;
        this.pet.jumpTimer = 0;
        this.pet.alpha = 1; // Reset visibility for level restart
        
        // Reset game state
        this.cameraX = 0;
        this.hasArmor = false;
        this.armorTimer = 0;
        this.booksCollected = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        
        // Reset last safe platform tracking
        this.lastSafePlatform = { x: 50, y: 378 }; // Default spawn position
        this.lastSafePlatformTimer = 0;
        
        this.isPaused = false;
        this.updatePauseButton();
        this.postBossSurface = false;
        this.keepVictoryMusicForCompletion = false;
        this.surfaceCaveExit = null;
        this.postBossTempleCelebrated = false;
        
        // Reset castle position for current level
        this.setCastlePosition();
        
        // Reset managers
        this.effectsManager.reset();
        this.arrowManager.reset();
        this.enemyManager.reset();
        this.worldManager.setLevel(this.level);
        this.backgroundManager.setLevel(this.level);
        this.enemyManager.setLevel(this.level);
        this.bossManager.reset();
        
        this.gameState = 'menu';
    }
    
    setCastlePosition() {
        if (this.level === 1) {
            // Castle level, following the new calm walk-in at the start.
            this.castle = { x: 6400 + levelOneContentOffset(6400), y: 230, width: 240, height: 248 };
        } else if (this.level === 2) {
            // Jungle level - temple at the end of the jungle clearing
            this.castle = { x: 17200, y: 230, width: 240, height: 248 };
        } else if (this.level === 3) {
            // Mountain level - temple on the peak platform
            this.castle = { x: 13100, y: 0, width: 240, height: 248 };
        }
    }
    
    loadForegroundImages() {
        // Load all foreground sprite images
        const foregroundSprites = [
            'rooty-tree.png',
            'pine-tree-1.png',
            'pine-tree-2.png',
            'rock-1.png',
            'rock-2.png',
            'rock-3.png',
            'round-bush.png',
            'short-tree.png',
            'spikey-bush.png',
            'tall-tree.png',
            'long-bush.png',
            'jungle-bush.png',
            'jungle-foliage-01.png',
            'jungle-foliage-02.png',
            'jungle-foliage-03.png',
            'jungle-tree-1.png',
            'jungle-tree-2.png',
            'jungle-tree-3.png',
            'jungle-tree-4.png',
            'jungle-tree-5.png',
            'jungle-tree-6.png',
            'cave-exit.png'
        ];
        
        foregroundSprites.forEach(filename => {
            const img = new Image();
            img.src = `images/sprites/world/props/${filename}`;
            this.foregroundImages[filename] = img;

            // Level placement data predates the corrected foliage spelling. Keep
            // its internal keys stable while loading the normalized asset names.
            const legacyFilename = filename.replace(/^jungle-foliage-0([1-3])\.png$/, 'jungle-foilage-$1.png');
            this.foregroundImages[legacyFilename] = img;
        });
    }
    
    cycleLevelSelector(direction = 1) {
        if (this.gameState !== 'menu') return;
        const selectableLevels = this.getUnlockedStages();
        const currentIndex = selectableLevels.indexOf(this.level);
        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
        this.level = selectableLevels[(safeIndex + direction + selectableLevels.length) % selectableLevels.length];
        this.updateLevelSelector();
        this.updateLevelIndicator();
    }
    
    updateLevelSelector() {
        const levelText = document.getElementById('levelSelectorText');
        const mobileLevelText = document.getElementById('levelSelectorTextMobile');
        const isBossFight = this.level === 'boss';

        levelText.textContent = isBossFight ? 'Boss Fight' : `L${this.level}: ${this.levelData[this.level].name}`;
        if (mobileLevelText) {
            mobileLevelText.textContent = isBossFight ? 'Boss' : `L${this.level}`;
        }
    }

    setLevelSelectorVisible(visible) {
        const levelSelection = document.getElementById('levelSelection');
        const canChooseLevel = visible && (this.isDevelopmentMode() || this.unlockedStageCount > 1);
        levelSelection.classList.toggle('hidden', !canChooseLevel);
        levelSelection.querySelectorAll('button').forEach(button => { button.disabled = !canChooseLevel; });
        document.querySelector('#menuScreen .game-setup').classList.toggle('game-setup--companion-only', !canChooseLevel);
    }

    getUnlockedStages() {
        const stages = [1, 2, 3, 'boss'];
        return this.isDevelopmentMode() ? stages : stages.slice(0, this.unlockedStageCount);
    }

    isDevelopmentMode() {
        return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    }

    unlockStage(stageCount) {
        const nextCount = Math.max(this.unlockedStageCount, Math.min(stageCount, 4));
        if (nextCount === this.unlockedStageCount) return;
        this.unlockedStageCount = nextCount;
        localStorage.setItem('armorOfGod_unlockedStageCount', String(nextCount));
        this.setLevelSelectorVisible(this.gameState === 'menu');
    }
    
    updateLevelIndicator() {
        const levelData = this.levelData[this.level];
        const levelInfo = document.getElementById('levelInfo');
        if (this.level === 'boss') {
            levelInfo.textContent = 'Boss Fight: Stone Golem';
        } else {
            levelInfo.textContent = `Level ${this.level}: ${levelData.name}`;
        }
    }
    
    toggleAudio() {
        const shouldResumeMusic = this.audioManager.toggleAudio();
        if (shouldResumeMusic) {
            // Resume the correct music based on current game state and armor status
            if (this.gameState === 'menu') {
                this.audioManager.playMusic('menu');
            } else if (this.gameState === 'playing') {
                // Check if player has armor for special armor march music
                if (this.hasArmor) {
                    this.audioManager.playMusic('armormarch');
                } else {
                    this.audioManager.playMusic('adventure');
                }
            } else if (this.gameState === 'levelComplete' || this.gameState === 'celebrating') {
                this.audioManager.playMusic('winner');
            } else if (this.gameState === 'gameOver') {
                this.audioManager.playMusic('gameOver');
            } else if (this.gameState === 'leaderboard') {
                this.audioManager.playMusic('hallOfHeroes');
            } else if (this.gameState === 'credits') {
                this.audioManager.playMusic('credits');
            }
        }
        this.updateAudioButtonAppearance();
    }
    
    updateAudioButtonAppearance() {
        const audioBtn = document.getElementById('audioToggleBtn');
        
        if (!this.audioManager.audioEnabled) {
            audioBtn.classList.add('muted');
            audioBtn.title = 'Enable Audio';
        } else {
            audioBtn.classList.remove('muted');
            audioBtn.title = 'Disable Audio';
        }
    }
    
    toggleSpeedDropdown() {
        const dropdown = document.getElementById('speedDropdown');
        dropdown.classList.toggle('hidden');
    }
    
    hideSpeedDropdown() {
        const dropdown = document.getElementById('speedDropdown');
        dropdown.classList.add('hidden');
    }
    
    setGameSpeed(speed) {
        this.gameSpeed = speed;
        this.saveGameSpeedSetting(); // Save to localStorage
        document.querySelector('.speed-value').textContent = speed.toFixed(2) + 'x';
    }
    
    showScreen(screenName) {
        // A menu click can transition before another screen has selected its own
        // soundtrack. Stop the menu source explicitly so it cannot continue under
        // a delayed intro, cutscene, or gameplay track.
        if (screenName !== 'menu') this.audioManager.stopMusic('menu');

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        const screens = {
            'menu': 'menuScreen',
            'levelIntro': 'levelIntroScreen',
            'cutscene': 'cutsceneScreen',
            'game': 'gameScreen',
            'gameOver': 'gameOverScreen',
            'levelComplete': 'levelCompleteScreen',
            'leaderboard': 'leaderboardScreen',
            'credits': 'creditsScreen'
        };
        
        document.getElementById(screens[screenName]).classList.remove('hidden');
        this.focusPrimaryScreenAction(screenName);
        requestAnimationFrame(this.updateMobileOrientation);
        // Level choice is available only on the initial/main-menu screen.  Keeping the
        // control out of every other screen prevents a live level swap from mismatching
        // the active world layout with its background.
        this.setLevelSelectorVisible(screenName === 'menu');
        document.body.classList.toggle('credits-active', screenName === 'credits');
        
        // Show the landing pose on the level-complete screen.
        if (screenName === 'levelComplete') {
            // Reset character alpha after screen transition
            this.player.alpha = 1;
            this.pet.alpha = 1;
            
            this.startVictoryRunningAnimation();
            const title = document.getElementById('levelCompleteTitle');
            const victoryImage = document.getElementById('victoryTempleImage');
            const subtitle = document.getElementById('levelCompleteSubtitle');
            const scripture = document.getElementById('levelCompleteScripture');
            subtitle?.classList.toggle('level-clear-subtitle', !this.pendingLevelThreeBoss);
            if (this.pendingLevelThreeBoss) {
                if (title) title.textContent = 'Level Cleared';
                if (victoryImage) { victoryImage.src = 'images/sprites/enemies/golem/golem-stand.png'; victoryImage.alt = 'Stone Golem'; }
                if (subtitle) subtitle.textContent = '...but a stone golem is blocking the way  !';
                if (scripture) scripture.textContent = '"For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind"';
            } else {
                if (title) title.textContent = 'Level Cleared';
                if (victoryImage) { victoryImage.src = './images/sprites/world/temple/temple.png'; victoryImage.alt = 'Holy Temple'; }
                if (subtitle) subtitle.textContent = "You've made it to the House of the Lord!";
                if (scripture) scripture.textContent = '"Well done, thou good and faithful servant!"';
            }
            if (!this.pendingLevelThreeBoss && this.bossFightEndTime > 0) this.completedGameRun = true;
            // Update score displays
            const levelScoreElement = document.getElementById('levelScore');
            const totalScoreElement = document.getElementById('totalScore');
            if (levelScoreElement) {
                levelScoreElement.textContent = '0';
            }
            if (totalScoreElement) {
                totalScoreElement.textContent = this.totalScore.toLocaleString();
            }
            
            // Update the level score label to show which level
            const levelScoreLabel = document.querySelector('.score-display-small .score-row-small:first-child .score-label-small');
            if (levelScoreLabel) {
                levelScoreLabel.textContent = this.pendingLevelThreeBoss ? `Level ${this.level} Score:` : (this.bossFightEndTime > 0 ? 'Boss Fight Score:' : `Level ${this.level} Score:`);
            }
            const deathRow = document.getElementById('deathPenaltyRow');
            const deathLabel = document.getElementById('deathPenaltyLabel');
            const deathScore = document.getElementById('deathPenaltyScore');
            const hasDeaths = this.deathCount > 0;
            deathRow?.classList.toggle('hidden', !hasDeaths);
            if (hasDeaths) {
                deathLabel.textContent = `Death x${this.deathCount}:`;
                deathScore.textContent = `-${this.deathPenaltyTotal.toLocaleString()}`;
            }
            this.animateCompletionScores();
        } else {
            this.stopVictoryRunningAnimation();
        }
        const nextLevelButton = document.getElementById('nextLevelBtn');
        if (nextLevelButton) {
            const nextChevron = '<svg class="chevron-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
            nextLevelButton.innerHTML = this.pendingLevelThreeBoss
                ? `Boss Fight ${nextChevron}`
                : (this.level === 3 || this.level === 'boss' ? `Go to Leaderboard ${nextChevron}` : `Next Level ${nextChevron}`);
        }
    }

    focusPrimaryScreenAction(screenName) {
        const primaryActionIds = {
            menu: 'startBtn',
            levelIntro: 'startLevelBtn',
            gameOver: 'restartBtn',
            levelComplete: 'nextLevelBtn'
        };
        const primaryAction = document.getElementById(primaryActionIds[screenName]);
        if (primaryAction) requestAnimationFrame(() => primaryAction.focus({ preventScroll: true }));
    }

    startCredits() {
        this.gameState = 'credits';
        this.isPaused = false;
        const hero = document.getElementById('creditsHero');
        if (hero) {
            const petType = this.selectedPetType === 'cat' ? 'cat' : 'dog';
            hero.src = `images/ui/hero-${petType}.png`;
            hero.alt = `Hero and ${petType} companion`;
        }
        this.showScreen('credits');
        this.audioManager.playMusic('credits');
        this.startCreditsSequence();
    }

    openFinalLeaderboard() {
        this.highScoreBoard.open(this.finalTotalScore || this.totalScore || 0);
    }

    animateCompletionScores() {
        clearInterval(this.scoreRevealTimer);
        const levelScore = Math.max(0, this.finalLevelScore ?? this.score ?? 0);
        const startingTotal = Math.max(0, this.totalScore || 0);
        const finalTotal = Math.max(startingTotal, this.finalTotalScore ?? startingTotal + levelScore);
        const levelElement = document.getElementById('levelScore');
        const totalElement = document.getElementById('totalScore');
        const startTime = performance.now();
        this.scoreRevealTimer = setInterval(() => {
            const elapsed = performance.now() - startTime;
            if (elapsed <= 1000) {
                levelElement.textContent = Math.round(levelScore * elapsed / 1000).toLocaleString();
                return;
            }
            const progress = Math.min(1, (elapsed - 1000) / 1000);
            levelElement.textContent = levelScore.toLocaleString();
            totalElement.textContent = Math.round(startingTotal + (finalTotal - startingTotal) * progress).toLocaleString();
            if (progress === 1) clearInterval(this.scoreRevealTimer);
        }, 16);
    }

    startCreditsSequence() {
        clearTimeout(this.creditsEndTimer);
        clearTimeout(this.creditsSectionTimer);
        clearTimeout(this.creditsSectionCleanupTimer);
        this.creditsSectionIndex = 0;
        this.isAdvancingCreditsSection = false;
        this.creditsSections = Array.from(document.querySelectorAll('#creditsScreen .credits-roll > section'))
            .filter(section => section.textContent.trim() || section.querySelector('img'));
        this.creditsSections.forEach(section => section.classList.remove('credits-section--active', 'credits-section--leaving', 'credits-section--reverse'));
        document.querySelector('.credits-finale').classList.remove('credits-finale--visible');
        document.querySelector('.credits-progress').classList.remove('hidden');
        this.showCreditsSection();
    }

    showCreditsSection(reverse = false) {
        const section = this.creditsSections[this.creditsSectionIndex];
        if (!section) {
            this.showCreditsFinale();
            return;
        }
        const isTitle = section.classList.contains('credits-title');
        const duration = 10500;
        const progressDuration = 9000;
        this.currentCreditsSectionDuration = duration;
        this.currentCreditsProgressDuration = progressDuration;
        const progress = document.querySelector('.credits-progress');
        progress.style.setProperty('--credits-section-duration', `${progressDuration}ms`);
        progress.classList.remove('credits-progress--running');
        void progress.offsetWidth;
        progress.classList.add('credits-progress--running');
        section.classList.remove('credits-section--leaving');
        section.classList.toggle('credits-section--title', isTitle);
        section.classList.toggle('credits-section--reverse', reverse);
        section.style.setProperty('--credits-section-duration', `${duration}ms`);
        section.classList.add('credits-section--active');
        this.updateCreditsControls();
        clearTimeout(this.creditsSectionTimer);
        this.creditsSectionTimer = setTimeout(() => this.nextCreditsSection(true), progressDuration);
    }

    nextCreditsSection(isAutomatic = false) {
        if (this.gameState !== 'credits' || !this.creditsSections || this.isAdvancingCreditsSection) return;
        this.isAdvancingCreditsSection = true;
        clearTimeout(this.creditsSectionTimer);
        const section = this.creditsSections[this.creditsSectionIndex];
        if (section && !isAutomatic) {
            section.classList.remove('credits-section--active');
            section.classList.add('credits-section--leaving');
        }
        this.creditsSectionIndex++;
        this.isAdvancingCreditsSection = false;
        this.showCreditsSection();
        const cleanupDelay = isAutomatic
            ? this.currentCreditsSectionDuration - this.currentCreditsProgressDuration + 50
            : 700;
        clearTimeout(this.creditsSectionCleanupTimer);
        this.creditsSectionCleanupTimer = setTimeout(() => section?.classList.remove('credits-section--active', 'credits-section--leaving'), cleanupDelay);
    }

    previousCreditsSection() {
        if (this.gameState !== 'credits' || !this.creditsSections || this.isAdvancingCreditsSection || this.creditsSectionIndex === 0) return;
        clearTimeout(this.creditsSectionTimer);
        clearTimeout(this.creditsSectionCleanupTimer);
        this.isAdvancingCreditsSection = false;
        const currentSection = this.creditsSections[this.creditsSectionIndex];

        // If the finale is showing, return to the final credits card first.
        if (this.creditsSectionIndex >= this.creditsSections.length) {
            document.querySelector('.credits-finale').classList.remove('credits-finale--visible');
            document.querySelector('.credits-progress').classList.remove('hidden');
        }

        this.creditsSections.forEach(section => {
            if (section !== currentSection) section.classList.remove('credits-section--active', 'credits-section--leaving', 'credits-section--reverse', 'credits-section--leaving-back');
        });
        if (currentSection) {
            currentSection.classList.remove('credits-section--active', 'credits-section--reverse');
            currentSection.classList.add('credits-section--leaving-back');
            this.creditsSectionCleanupTimer = setTimeout(() => currentSection.classList.remove('credits-section--leaving-back'), 700);
        }
        this.creditsSectionIndex--;
        this.showCreditsSection(true);
    }

    updateCreditsControls() {
        ['creditsBackControl', 'creditsPreviousBtn'].forEach(id => {
            const backControl = document.getElementById(id);
            if (backControl) backControl.classList.toggle('credits-control--disabled', this.creditsSectionIndex === 0);
        });
    }

    showCreditsFinale() {
        document.querySelector('.credits-progress').classList.add('hidden');
        document.querySelector('.credits-finale').classList.add('credits-finale--visible');
        this.updateCreditsControls();
    }

    skipCredits() {
        if (this.gameState !== 'credits') return;
        clearTimeout(this.creditsEndTimer);
        clearTimeout(this.creditsSectionTimer);
        clearTimeout(this.creditsSectionCleanupTimer);
        this.isAdvancingCreditsSection = false;
        this.goToMainMenu();
    }
    
    // Armor enhancement methods
    getCurrentSpeed() {
        return this.hasArmor ? this.baseSpeed * 1.5 : this.baseSpeed;
    }
    
    getCurrentJumpPower() {
        return this.hasArmor ? this.baseJumpPower * 1.1 : this.baseJumpPower;
    }
    
    gameLoop(currentTime = 0) {
        // Calculate frame timing based on game speed
        const speed = this.gameSpeed * 1.75;
        const targetInterval = 1000 / (this.targetFrameRate * speed);
        
        if (currentTime - this.lastFrameTime >= targetInterval) {
            // Update background manager with pause state (needs to run even when paused)
            this.backgroundManager.update(this.isPaused || this.mobileOrientationPaused);
            
            // Run multiple updates for speeds > 1.0 to maintain smooth gameplay
            const updateCount = Math.max(1, Math.floor(speed));
            for (let i = 0; i < updateCount; i++) {
                this.update();
            }
            this.render();
            this.updateDebugDisplay();
            this.lastFrameTime = currentTime;
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update() {
        // The rotate-device notice is a hard stop even if an orientation event
        // arrives between animation frames and the regular pause state lags behind.
        if (this.isPaused || this.mobileOrientationPaused) return;
        
        // Only run game updates for playing states
        if (this.gameState === 'menu' || this.gameState === 'levelIntro' || this.gameState === 'levelTransition' || this.gameState === 'cutscene' || this.gameState === 'gameOver' || this.gameState === 'levelComplete') {
            return; // No game logic needed for menu/intro screens
        }
        
        if (this.gameState === 'bossCutscene') {
            this.bossManager.update(this);
            this.updateFloatingScores();
            this.player.levelTime = this.getLevelTime();
            this.player.score = this.score;
            this.player.floatingScores = this.floatingScores;
            return;
        }

        // Handle input
        if (this.bossManager.state !== 'arenaFall') {
            this.inputHandler.handleInput(
                this.player,
                this.cameraX,
                this.worldManager.worldWidth,
                this.jumpPower,
                this.audioManager
            );
        }

        // Leave room beyond the post-boss temple for the same complete hop available on
        // the other levels.  The normal temple collision still ends a walk-in approach.
        if (this.postBossSurface && this.gameState === 'playing') {
            const postTempleBoundaryX = this.castle.x + this.castle.width + 260;
            if (this.player.x > postTempleBoundaryX) {
                this.player.x = postTempleBoundaryX;
                this.player.blockedRight = true;
            }
        }
        
        // Update physics
        this.updatePhysics();

        // Death is a hard pause for the encounter: stop AI/projectiles and preserve only the death freeze.
        if (this.gameState === 'dying') return;
        
        // Update managers
        if (!this.postBossSurface) {
            this.arrowManager.update(
                this.player,
                this.castle,
                this.hasArmor,
                this.cameraX,
                this.canvas.width,
                this.gameState,
                this.inputHandler,
                this.getCurrentJumpPower()
            );
        }
        
        if (!this.bossManager.active) {
            this.enemyManager.update(this.player, this.worldManager, this.gameState, this.cameraX, this.canvas.width, this.inputHandler, () => this.getCurrentJumpPower());
        } else {
            // A boss arena is intentionally self-contained: no projectile hazards carry over.
            this.arrowManager.reset();
            this.bossManager.update(this);
        }
        
        // Handle temple entrance sequence
        if (this.gameState === 'enteringTemple') {
            this.updateTempleEntrance();
        }
        
        this.effectsManager.updateArmorActivation();
        this.effectsManager.updateSparkleTrails();
        // Pet affection is decorative; an older cached effects file must never
        // be able to halt the gameplay loop and leave touch input stuck.
        this.effectsManager.updatePetAffectionEffects?.();
        
        // Update background elements
        this.backgroundManager.updateElements(this.cameraX);
        
        // Add sparkle trails when armor is active (but not during temple entrance)
        if (this.hasArmor && this.gameState !== 'enteringTemple') {
            this.effectsManager.addSparkleTrail(this.player.x, this.player.y, this.hasArmor);
            this.effectsManager.addSparkleTrail(this.pet.x, this.pet.y, this.hasArmor);
            
            // Extra sparkles when moving for trail effect
            if (this.player.isMoving) {
                this.effectsManager.addSparkleTrail(this.player.x, this.player.y, this.hasArmor);
            }
            if (this.pet.isMoving) {
                this.effectsManager.addSparkleTrail(this.pet.x, this.pet.y, this.hasArmor);
            }
        }
        
        this.uiRenderer.update();
        this.uiRenderer.updateArmorCard();
        this.characterRenderer.update();

        // Boss-only recovery: queue a heart about every 30 seconds, then let the next
        // ground pound/earthquake knock it loose from the ceiling.
        if (this.bossManager.active && this.gameState === 'playing') {
            this.heartSpawnTimer++;
            if (this.heartSpawnTimer >= 1800) {
                this.heartSpawnTimer = 0;
                this.pendingBossHeartDrop = true;
            }
            this.scriptureSpawnTimer++;
            if (this.scriptureSpawnTimer === 900 || (this.scriptureSpawnTimer > 900 && (this.scriptureSpawnTimer - 900) % 1800 === 0)) {
                this.spawnBossScripture();
            }
            let activeBossPickupExists = false;
            this.worldManager.hearts = this.worldManager.hearts.filter(heart => {
                if (!heart.timed || heart.collected) return true;
                if (activeBossPickupExists) return false;
                activeBossPickupExists = true;
                if (heart.phase === 'falling') {
                    heart.velocityY += .28;
                    heart.y += heart.velocityY;
                    if (heart.y >= 420) {
                        heart.y = 420;
                        heart.phase = 'landed';
                        heart.age = 0;
                    }
                    return true;
                }
                heart.age = (heart.age || 0) + 1;
                return heart.age < 300; // Five seconds after landing at 60fps.
            });
            this.worldManager.scriptureBooks = this.worldManager.scriptureBooks.filter(book => {
                if (!book.timed || book.collected) return true;
                if (activeBossPickupExists) return false;
                activeBossPickupExists = true;
                if (book.spawnPlatform && !book.spawnPlatform.disabled && !book.spawnPlatform.hidden && book.spawnPlatform.arenaMotion === 'idle') {
                    book.x = book.spawnPlatform.x + (book.spawnPlatform.width - book.width) / 2;
                    book.y = book.spawnPlatform.y - book.height - 10;
                } else if (book.spawnPlatform) {
                    book.spawnPlatform = null;
                    book.x = 1060;
                    book.y = 408;
                }
                book.age = (book.age || 0) + 1;
                return book.age < book.duration;
            });
        } else {
            this.heartSpawnTimer = 0;
            this.pendingBossHeartDrop = false;
            this.scriptureSpawnTimer = 0;
            this.bossScriptureSpawnIndex = 0;
        }
        
        // Update floating scores. Enter can speed the fireworks finale and its bonuses together.
        const celebrationSpeed = this.gameState === 'celebrating' && this.isCelebrationFastForward ? 2.5 : 1;
        this.updateFloatingScores(celebrationSpeed);
        
        // Update player properties for UI
        this.player.levelTime = this.postBossSurface ? this.postBossTimerFrames : this.getLevelTime();
        this.player.bossFightTime = this.getBossFightTime();
        this.player.score = this.score;
        this.player.floatingScores = this.floatingScores;
        
        if (this.gameState === 'celebrating') {
            if (this.effectsManager.updateCelebration(celebrationSpeed)) {
                // Celebration is complete, move to level complete screen
                this.gameState = 'levelComplete';
                this.showScreen('levelComplete');
            }
        }
        
        // Check collisions
        this.checkCollisions();

        if (this.gameState === 'playing' && this.level === 3 && !this.bossManager.active && this.bossManager.checkForTrigger(this.player.x, this.player.y, this.castle.x, this.level)) {
            // Freeze Level 3 at the moment the golem appears; the cutscene and boss are
            // separate encounters and must not add to this level's time.
            this.levelEndTime = performance.now();
            this.player.isMoving = false;
            this.player.velocityY = 0;
            this.player.isJumping = false;
            this.player.isGrounded = true;
            this.gameState = 'bossCutscene';
            this.arrowManager.reset();
            this.audioManager.playMusic('bossFight');
        }
    }
    
    updatePhysics() {
        // Handle death freeze
        if (this.gameState === 'dying') {
            this.deathTimer++;
            if (this.deathTimer >= this.deathFreezeTime) {
                this.gameOver(this.deathMessage);
                this.isDying = false;
            }
            return;
        }
        
        if (this.gameState !== 'playing' && this.gameState !== 'enteringTemple') return;
        
        // Update invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTimer++;
            if (this.player.invulnerabilityTimer >= this.player.invulnerabilityDuration) {
                this.player.invulnerable = false;
                this.player.invulnerabilityTimer = 0;
            }
        }
        
        // Update armor timer
        if (this.gameState === 'playing' && this.hasArmor && this.armorTimer > 0) {
            this.armorTimer--;
            if (this.armorTimer <= 0) {
                this.deactivateArmor();
            }
        }
        
        // Reset blocking properties each frame
        this.player.blockedLeft = false;
        this.player.blockedRight = false;
        
        // Set player as not grounded when falling (before applying gravity)
        if (this.player.velocityY > 0) {
            this.player.isGrounded = false;
            this.player.isJumping = false;
        }
        
        // Variable jump physics - cut jump short if key not held
        if (this.player.isJumping && this.player.velocityY < 0 && !this.player.jumpHeld) {
            // Player is jumping upward but key was released - reduce upward velocity
            const minVelocity = this.getCurrentJumpPower() * this.player.minJumpHeight;
            if (this.player.velocityY < minVelocity) {
                this.player.velocityY *= this.player.jumpCutSpeed;
            }
        }
        
        // Apply gravity to player
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Check for pit death
        if (this.player.y > this.canvas.height + 50) {
            // Play falling sound when falling into pit (only once per fall)
            if (!this.player.fallingSoundPlayed) {
                this.audioManager.playSound('falling');
                this.player.fallingSoundPlayed = true;
            }
            this.handlePitFall();
            return;
        }
        
        // Platform collisions for player (this will set isGrounded=true if landing on platform)
        this.worldManager.checkPlatformCollisions(this.player);
        
        // Reset falling sound flag when player becomes grounded
        if (this.player.isGrounded && this.player.fallingSoundPlayed) {
            this.player.fallingSoundPlayed = false;
        }
        
        // Update last safe platform position when player is grounded
        this.updateLastSafePlatform();
        
        // Check for hazardous foreground sprite collisions
        const hazardCollision = this.worldManager.checkHazardCollisions(this.player);
        if (hazardCollision.collision && !this.hasArmor) {
            this.handlePlayerDamage(hazardCollision.damage, hazardCollision.hazardType);
        }
        
        // Check if player is falling off platform edges and restrict movement
        // But only if they're not already deep in a pit (to avoid interfering with pit death)
        if (!this.player.isGrounded && this.player.velocityY > 0 && this.player.y < this.canvas.height) {
            // Player is falling but not in death zone - check for wall blocking
            this.checkPlatformEdgeBlocking();
        }
        
        // Update camera
        this.cameraX = this.bossManager.active ? 0 : Math.max(0, this.player.x - 300);
        // Let the companion celebrate the instant the distant temple comes into view.
        if (this.postBossSurface && !this.postBossTempleCelebrated &&
            this.castle.x < this.cameraX + this.canvas.width && this.castle.x + this.castle.width > this.cameraX) {
            this.postBossTempleCelebrated = true;
            if (this.pet.type === 'dog') {
                this.pet.velocityY = -9;
                this.pet.isGrounded = false;
                this.audioManager.playSound('bark1');
            }
        }
        
        
        // Update player animation
        this.updatePlayerAnimation();
        
        // Update pet
        this.petManager.update();
    }
    
    checkPlatformEdgeBlocking() {
        // Only check for wall blocking when player is falling and might be against a pit wall
        const checkDistance = 2; // Very small distance to detect wall contact
        
        // Check if player is directly against a platform wall
        for (let platform of this.worldManager.platforms) {
            // Check if player is vertically aligned with the platform (at wall height)
            if (this.player.y < platform.y + platform.height && 
                this.player.y + this.player.height > platform.y) {
                
                // Check left wall - player is just to the left of platform
                if (this.player.x + this.player.width >= platform.x - checkDistance && 
                    this.player.x + this.player.width <= platform.x + checkDistance) {
                    this.player.blockedRight = true; // Block movement toward the wall
                }
                
                // Check right wall - player is just to the right of platform  
                if (this.player.x >= platform.x + platform.width - checkDistance && 
                    this.player.x <= platform.x + platform.width + checkDistance) {
                    this.player.blockedLeft = true; // Block movement toward the wall
                }
            }
        }
    }

    preventPostBossFalls() {
        const feet = this.player.y + this.player.height;
        const platform = this.worldManager.platforms
            .filter(item => Math.abs(feet - item.y) < 40)
            .sort((a, b) => {
                const distance = item => Math.max(item.x - (this.player.x + this.player.width), this.player.x - (item.x + item.width), 0);
                return distance(a) - distance(b);
            })[0];
        if (!platform) return;
        const left = platform.x;
        const right = platform.x + platform.width - this.player.width;
        if (this.player.x < left) { this.player.x = left; this.player.blockedLeft = true; }
        if (this.player.x > right) { this.player.x = right; this.player.blockedRight = true; }
    }
    
    updatePlayerAnimation() {
        // Handle petting animation
        if (this.player.isPetting) {
            this.player.pettingTimer++;
            
            // Animate hand reaching out and petting motion
            const pettingPhase = this.player.pettingTimer / this.player.pettingDuration;
            if (pettingPhase < 0.3) {
                // Reach out phase
                this.player.handOffset = Math.sin(pettingPhase * Math.PI / 0.3) * 15;
            } else if (pettingPhase < 0.9) {
                // Petting phase - gentle up and down motion
                this.player.handOffset = 15 + Math.sin((pettingPhase - 0.3) * Math.PI * 6) * 3;
            } else {
                // Return hand phase
                this.player.handOffset = 15 * (1 - (pettingPhase - 0.9) / 0.1);
            }
            
            // End petting animation
            if (this.player.pettingTimer >= this.player.pettingDuration) {
                this.player.isPetting = false;
                this.player.pettingTimer = 0;
                this.player.handOffset = 0;
            }
            
            // Keep player still during petting
            this.player.animFrame = 0;
            this.player.animTimer = 0;
        } else {
            // Normal walking animation
            if (this.player.isMoving && this.player.isGrounded) {
                this.player.animTimer++;
                if (this.player.animTimer >= this.player.animSpeed) {
                    this.player.animFrame = (this.player.animFrame + 1) % 4;
                    this.player.animTimer = 0;
                }
            } else {
                this.player.animFrame = 0;
                this.player.animTimer = 0;
            }
        }
    }

    
    tryPetAnimal() {
        this.petManager.tryPetting();
    }

    hasPettedThisSession() {
        try {
            return sessionStorage.getItem('armor-of-god-petting-tutorial-complete') === 'true';
        } catch (_) {
            return false;
        }
    }

    completePettingTutorial() {
        try {
            sessionStorage.setItem('armor-of-god-petting-tutorial-complete', 'true');
        } catch (_) {
            // Petting remains fully playable if storage is unavailable.
        }
    }
    
    checkCollisions() {
        if (this.gameState !== 'playing' && this.gameState !== 'dying') return;
        
        if (this.bossManager.active) {
            this.bossManager.checkCollisions(this);
            this.collectScriptures();
            this.collectHearts();
            if (this.bossManager.checkExit(this.player)) this.completeBossEncounter();
            return;
        }

        // Arrow collisions
        const hitArrows = this.arrowManager.checkCollisions(this.player, this.hasArmor, this.inputHandler, this.getCurrentJumpPower());
        if (hitArrows.length > 0) {
            // Add score for breaking arrows when armored
            if (this.hasArmor) {
                hitArrows.forEach(arrow => {
                    const basePoints = 300;
                    
                    // Handle combo system for arrow deflections
                    if (!this.player.isGrounded && this.comboMode) {
                        // Continue combo - increase multiplier
                        this.comboMultiplier++;
                        this.airborneKills++;
                    } else if (!this.player.isGrounded && !this.comboMode) {
                        // Start combo mode if airborne
                        this.comboMode = true;
                        this.comboMultiplier = 1; // First deflection is normal
                        this.airborneKills = 1;
                    }
                    
                    // Apply multiplier if in combo mode
                    const points = this.comboMode ? basePoints * this.comboMultiplier : basePoints;
                    const color = this.comboMode && this.comboMultiplier > 1 ? '#FF6B6B' : '#E74C3C';
                    
                    // Create label with multiplier if applicable
                    let label = 'Arrow';
                    if (this.comboMode && this.comboMultiplier > 1) {
                        label += ` x${this.comboMultiplier}`;
                    }
                    
                    this.addScore(points, color, label);
                });
            }
            // Calculate knockback direction from first arrow hit
            const arrow = hitArrows[0];
            const playerCenterX = this.player.x + this.player.width / 2;
            const knockbackDirection = playerCenterX > arrow.x ? 1 : -1; // 1 for right, -1 for left
            this.takeDamage(knockbackDirection);
        }
        
        // Enemy collisions
        const hitEnemies = this.enemyManager.checkCollisions(this.player, this.hasArmor, this.inputHandler, () => this.getCurrentJumpPower());
        if (hitEnemies.length > 0) {
            // Add score for defeating enemies when armored
            if (this.hasArmor) {
                hitEnemies.forEach(enemy => {
                    const basePoints = enemy.isMegaSnail ? 1000 : 200;
                    
                    // Handle combo system
                    if (!this.player.isGrounded && this.comboMode) {
                        // Continue combo - increase multiplier
                        this.comboMultiplier++;
                        this.airborneKills++;
                    } else if (!this.player.isGrounded && !this.comboMode) {
                        // Start combo mode if airborne
                        this.comboMode = true;
                        this.comboMultiplier = 1; // First kill is normal
                        this.airborneKills = 1;
                    }
                    
                    // Apply multiplier if in combo mode
                    const points = this.comboMode ? basePoints * this.comboMultiplier : basePoints;
                    const color = this.comboMode && this.comboMultiplier > 1 ? '#FF6B6B' : '#E74C3C';
                    
                    // Create label with multiplier if applicable
                    let label = enemy.isMegaSnail ? 'Mega Snail' : 'Snail';
                    if (this.comboMode && this.comboMultiplier > 1) {
                        label += ` x${this.comboMultiplier}`;
                    }
                    
                    this.addScore(points, color, label);
                    
                    // Track enemy types killed for bonus calculation
                    this.enemiesKilled.add(enemy.isMegaSnail ? 'megaSnail' : 'snail');
                });
            }
            // Calculate knockback direction from first enemy hit
            const enemy = hitEnemies[0];
            const playerCenterX = this.player.x + this.player.width / 2;
            const knockbackDirection = playerCenterX > enemy.x ? 1 : -1; // 1 for right, -1 for left
            this.takeDamage(knockbackDirection);
        }
        
        this.collectScriptures();
        this.collectHearts();

        if (this.postBossSurface && this.surfaceCaveExit && this.checkCollision(this.player, this.surfaceCaveExit)) {
            this.returnToBossCave();
            return;
        }

        // A high enough leap across the temple is an intentional secret. It also
        // preserves completion when the player lands beyond the temple hitbox.
        const playerBottom = this.player.y + this.player.height;
        const playerCenterX = this.player.x + this.player.width / 2;
        const hasClearedTempleDoor = playerCenterX > this.castle.x + this.castle.width / 2;
        const clearsTempleRoof = playerBottom <= this.castle.y + 60;
        if (!this.templeJumpBonusAwarded && !this.player.isGrounded && hasClearedTempleDoor && clearsTempleRoof) {
            this.templeJumpBonusAwarded = true;
            this.addScore(1000, '#FFD700', 'Jumped the Temple');
        }

        // Castle collision
        const templeCompletionX = this.postBossSurface
            ? this.castle.x + this.castle.width + 240
            : this.castle.x + this.castle.width;
        const hasLandedBeyondTemple = this.templeJumpBonusAwarded && this.player.x >= templeCompletionX;
        if (this.checkCollision(this.player, this.castle) || hasLandedBeyondTemple) {
            this.levelComplete();
        }
    }

    collectScriptures() {
        this.worldManager.scriptureBooks.forEach(book => {
            if (!book.collected && this.checkCollision(this.player, book)) {
                book.collected = true;
                
                // Play collection sound
                this.audioManager.playSound('collect2');
                
                // Add score for collecting scripture
                this.addScore(300, '#FFD700', 'Scripture');
                
                if (this.booksCollected < 3) {
                    // Still collecting initial scriptures
                    this.booksCollected++;
                    this.collectArmorPiece();
                    if (this.booksCollected >= 3) {
                        this.activateArmor();
                    }
                } else if (this.hasArmor) {
                    // Already have armor - reset timer instead of incrementing count
                    this.armorTimer = this.armorDuration;
                    this.addScore(200, '#8EE7FF', 'Armor Refill');
                    this.uiRenderer.showMessage('Armor Timer Reset!', 120, '#FFD700', 15, 400);
                    this.collectArmorPiece();
                }
            }
        });
    }

    collectHearts() {
        // Heart collisions (health restoration)
        this.worldManager.hearts.forEach(heart => {
            if (!heart.collected && this.checkCollision(this.player, heart)) {
                heart.collected = true;
                
                // Play same collection sound as scripture books
                this.audioManager.playSound('heal2');
                
                // Add score for collecting heart
                this.addScore(500, '#FFD700', 'Heart');
                
                // Restore health (don't exceed max health)
                const oldHealth = this.player.health;
                this.player.health = Math.min(this.player.health + heart.healthRestore, this.player.maxHealth);
                const healedAmount = this.player.health - oldHealth;
                
                if (healedAmount > 0) {
                    this.uiRenderer.showMessage(`Health +${healedAmount}!`, 120, '#FF6B6B', 15, 300);
                } else {
                    this.uiRenderer.showMessage('Health Full!', 120, '#FFD700', 15, 300);
                }
            }
        });
    }

    dropBossHeartFromCeiling() {
        if (!this.pendingBossHeartDrop || !this.bossManager.active || this.hasActiveBossPickup()) return;
        const x = 120 + Math.random() * 930;
        this.worldManager.hearts.push({ x, y: -30, width: 30, height: 30, collected: false, healthRestore: 1, timed: true, phase: 'falling', velocityY: 1.5, age: 0 });
        this.pendingBossHeartDrop = false;
        this.audioManager.playSound('fallingRock');
    }

    spawnBossScripture() {
        if (this.hasActiveBossPickup()) return;
        const platforms = this.worldManager.platforms.filter(platform =>
            platform.arenaPlatform && !platform.disabled && !platform.hidden && platform.arenaMotion === 'idle'
        );
        const playerPlatform = platforms.find(platform =>
            this.player.x + this.player.width > platform.x &&
            this.player.x < platform.x + platform.width &&
            Math.abs(this.player.y + this.player.height - platform.y) <= 18
        );
        const eligiblePlatforms = platforms.filter(platform => platform !== playerPlatform);
        const platform = eligiblePlatforms.length > 0
            ? eligiblePlatforms[this.bossScriptureSpawnIndex % eligiblePlatforms.length]
            : null;
        this.bossScriptureSpawnIndex++;
        this.worldManager.scriptureBooks.push({
            x: platform ? platform.x + (platform.width - 50) / 2 : 1060,
            y: platform ? platform.y - 60 : 408,
            width: 50,
            height: 50,
            collected: false,
            verse: 'Courage',
            timed: true,
            age: 0,
            duration: 480,
            spawnPlatform: platform
        });
    }

    hasActiveBossPickup() {
        return this.worldManager.hearts.some(heart => heart.timed && !heart.collected) ||
            this.worldManager.scriptureBooks.some(book => book.timed && !book.collected);
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    takeDamage(knockbackDirection = 0) {
        if (this.player.invulnerable) return;
        
        // Track damage for scoring
        this.damageTaken++;

        // Play grunt sound when hurt
        this.audioManager.playSound('grunt1');
        // Apply knockback effect - move 10px away from the damage source and small vertical jump
        if (knockbackDirection !== 0) {
            // Apply immediate position changes for both horizontal and vertical knockback
            this.player.x += knockbackDirection * 10;
            this.player.y -= 5; // Move up 5px immediately
            // Make sure player doesn't go off screen or through walls
            this.player.x = Math.max(0, Math.min(this.player.x, this.worldManager.worldWidth - this.player.width));
            // Add small vertical velocity for continued upward movement
            this.player.velocityY = -3;
            this.player.isJumping = true;
            this.player.isGrounded = false;
        }

        // Play appropriate hit sound based on armor status
        if (!this.hasArmor) {
            this.audioManager.playRandomThudSound();
        }

        this.player.health--;
        this.player.invulnerable = true;
        this.player.invulnerabilityTimer = 0;
        
        if (this.player.health <= 0) {
            this.startDeath('You have been struck down! Seek the armor of God for protection.');
        }
    }

    showLevelThreeCompletion() {
        this.player.isMoving = false;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isGrounded = true;
        this.arrowManager.reset();
        if (this.levelEndTime === 0) this.levelEndTime = performance.now();
        this.pendingLevelThreeBoss = true;
        this.unlockStage(4);

        this.prepareLevelThreeCollapseBonuses();

        // The fall has finished. Keep this score reveal silent except for one heavy thud.
        this.audioManager.stopAllAudio();
        this.audioManager.playSound('golemReignite');
        this.gameState = 'levelComplete';
        this.showScreen('levelComplete');
    }

    prepareLevelThreeCollapseBonuses() {
        if (this.levelThreeCollapseBonusesPrepared) return;
        this.levelThreeCollapseBonusesPrepared = true;
        // Settle already-earned points, then show the completion bonuses during the fall.
        this.floatingScores.forEach(indicator => {
            if (indicator.pendingPoints) this.score += indicator.pendingPoints;
        });
        this.floatingScores = [];
        this.finalLevelScore = this.score;
        this.finalTotalScore = this.totalScore + this.score;
        this.calculateAndDisplayBonuses();
    }

    continueToBossFight() {
        if (!this.pendingLevelThreeBoss) return;
        this.pendingLevelThreeBoss = false;
        this.totalScore = this.finalTotalScore || (this.totalScore + this.score);
        this.score = 0;
        this.enterBossArena();
    }

    enterBossArena() {
        // Reaching the boss means Level 3 has been cleared, so keep it selectable later.
        this.unlockStage(4);
        this.bossManager.active = true;
        this.bossFightCheckpoint = true;
        this.worldManager.createBossArena();
        this.enemyManager.reset();
        this.arrowManager.reset();
        this.player.x = 180; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.pet.x = 130; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.pendingBossIntro = true;
        this.gameState = 'levelIntro';
        this.showScreen('levelIntro');
        this.audioManager.playMusic('bossFight');
        document.getElementById('introLevelNumber').textContent = 'BOSS FIGHT';
        document.getElementById('introLevelName').textContent = 'STONE GOLEM';
        document.getElementById('introLevelImage').src = 'images/ui/stone-golem-boss-fight.png';
        document.getElementById('introLevelImage').alt = 'Stone Golem boss fight';
        document.getElementById('startLevelBtn').innerHTML = 'Start Battle <span class="chevron-icon">❯</span>';
    }

    completeBossEncounter() {
        // The surface walk is untimed; preserve the exact boss time at defeat.
        this.postBossTimerFrames = this.getBossFightTime();
        this.bossManager.active = false;
        // The cave exit opens into a peaceful temple clearing before the normal victory sequence.
        this.worldManager.createTempleClearing();
        this.backgroundManager.setLevel(3);
        // Start partway into the mountain sunrise so the surface opens on warm dawn light.
        this.backgroundManager.sunriseStartTime = Date.now() - 52000;
        // A long stepped ascent gives the sunrise and victory music room to breathe.
        this.castle = { x: 1950, y: 100, width: 240, height: 248, visualGroundOffset: 20 };
        this.player.x = 185; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.pet.x = 135; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.postBossSurface = true;
        this.postBossTempleCelebrated = false;
        // This is a fresh temple approach, so it earns its own temple-hop bonus.
        this.templeJumpBonusAwarded = false;
        this.surfaceCaveExit = { x: 95, y: 328, width: 80, height: 140 };
        this.gameState = 'playing';
        this.audioManager.playMusic('victory');
        this.uiRenderer.showMessage('The path to the temple is clear.', 180, '#FFD700');
    }

    returnToBossCave() {
        this.worldManager.createBossArena();
        this.bossManager.active = true;
        this.bossManager.state = 'dead';
        this.postBossSurface = false;
        this.surfaceCaveExit = null;
        this.postBossTempleCelebrated = false;
        this.player.x = 1060; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.pet.x = 1015; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.uiRenderer.showMessage('Back in the cave.', 120, '#FFD700');
    }

    bankScoreForBossFight() {
        // Score indicators normally resolve over several seconds. The arena intro pauses
        // that animation, so settle them before the transition and keep them in total score.
        this.floatingScores.forEach(indicator => {
            if (indicator.pendingPoints) this.score += indicator.pendingPoints;
        });
        this.floatingScores = [];
        this.totalScore += this.score;
        this.score = 0;
    }

    startBossFightTimer() {
        this.bossFightStartTime = performance.now();
        this.bossFightEndTime = 0;
        this.bossFightPausedTime = 0;
        this.bossFightPauseStartTime = 0;
        this.postBossTimerFrames = 0;
    }

    finishBossFightTimer() {
        if (this.bossFightStartTime > 0 && this.bossFightEndTime === 0) this.bossFightEndTime = performance.now();
    }

    getBossFightTime() {
        if (this.bossFightStartTime === 0) return 0;
        const currentTime = this.bossFightEndTime || performance.now();
        const activePause = this.isPaused && this.bossFightPauseStartTime > 0 ? currentTime - this.bossFightPauseStartTime : 0;
        return Math.max(0, Math.floor((currentTime - this.bossFightStartTime - this.bossFightPausedTime - activePause) / 1000 * 60));
    }
    
    handlePlayerDamage(damage, hazardType) {
        // Handle damage from environmental hazards
        if (hazardType === 'spike') {
            // Calculate knockback direction away from the spikey bush
            // Find the closest spikey bush to determine knockback direction
            let closestBush = null;
            let closestDistance = Infinity;
            
            for (let sprite of this.worldManager.foregroundSprites) {
                if (sprite.hazard && sprite.image === 'spikey-bush.png') {
                    const bushCenterX = sprite.x + sprite.width / 2;
                    const playerCenterX = this.player.x + this.player.width / 2;
                    const distance = Math.abs(bushCenterX - playerCenterX);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestBush = sprite;
                    }
                }
            }
            
            if (closestBush) {
                const bushCenterX = closestBush.x + closestBush.width / 2;
                const playerCenterX = this.player.x + this.player.width / 2;
                const knockbackDirection = playerCenterX < bushCenterX ? -1 : 1;
                this.takeDamage(knockbackDirection);
            } else {
                this.takeDamage(0); // No knockback if we can't find the bush
            }
        } else {
            // Default damage handling for other hazard types
            this.takeDamage(0);
        }
    }
    
    startDeath(message) {
        if (!this.isDying) {
            const penalty = Math.min(1000, this.score);
            this.score -= penalty;
            this.deathCount++;
            this.deathPenaltyTotal += penalty;
            this.isDying = true;
            this.deathTimer = 0;
            this.deathMessage = message;
            this.gameState = 'dying';
            this.audioManager.pauseCurrentMusic();
        }
    }
    
    updateLastSafePlatform() {
        // Only update if player is grounded and has been stable for a few frames
        if (this.player.isGrounded) {
            this.lastSafePlatformTimer++;
            
            // After being grounded for 10 frames, update the safe position
            if (this.lastSafePlatformTimer > 10) {
                this.lastSafePlatform = {
                    x: this.player.x,
                    y: this.player.y
                };
            }
        } else {
            // Reset timer when not grounded
            this.lastSafePlatformTimer = 0;
        }
    }
    
    handlePitFall() {
        // Don't handle pit fall if already in damage/death state
        if (this.player.invulnerable || this.isDying) return;
        
        // Always take damage from pit falls (even when armored)
        this.player.health--;
        this.damageTaken++;
        
        // Play hurt sound
        this.audioManager.playSound('grunt1');
        this.audioManager.playRandomThudSound();
        
        // Check if player dies from pit fall
        if (this.player.health <= 0) {
            this.startDeath('You fell into a pit! Stay on the platforms to survive.');
            return;
        }
        
        // Find a safe respawn position on a ground platform
        let safePosition = this.findSafeRespawnPosition();
        
        // Respawn at safe position
        this.player.x = safePosition.x;
        this.player.y = safePosition.y - this.player.height; // Place on top of platform
        this.player.velocityY = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
        
        // Apply invulnerability for 2 seconds
        this.player.invulnerable = true;
        this.player.invulnerabilityTimer = 0;
        this.player.invulnerabilityDuration = 120; // 2 seconds at 60fps
        
        // Update camera to new position
        this.cameraX = Math.max(0, this.player.x - 300);
    }
    
    findSafeRespawnPosition() {
        // Find the most recent solid platform behind the player's current position
        let bestPlatform = null;
        let bestDistance = Infinity;
        
        // Look for solid platforms (ground, rock, tree_platform) behind the player
        for (let platform of this.worldManager.platforms) {
            // Include all solid platform types, exclude small floating platforms
            const isSolidPlatform = (platform.type === 'ground' || platform.type === 'rock' || platform.type === 'tree_platform') 
                                   && platform.width >= 100; // Exclude tiny platforms
            
            if (isSolidPlatform && platform.x < this.player.x) {
                const distance = this.player.x - (platform.x + platform.width/2);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestPlatform = platform;
                }
            }
        }
        
        // If no solid platform found behind player, use the closest one ahead
        if (!bestPlatform) {
            for (let platform of this.worldManager.platforms) {
                const isSolidPlatform = (platform.type === 'ground' || platform.type === 'rock' || platform.type === 'tree_platform') 
                                       && platform.width >= 100; // Exclude tiny platforms
                
                if (isSolidPlatform) {
                    const distance = Math.abs(this.player.x - (platform.x + platform.width/2));
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestPlatform = platform;
                    }
                }
            }
        }
        
        // Default to starting position if no platform found
        if (!bestPlatform) {
            return { x: 50, y: 468 };
        }
        
        // Return center of the platform, positioned on top
        return {
            x: bestPlatform.x + bestPlatform.width/2 - this.player.width/2,
            y: bestPlatform.y - this.player.height
        };
    }
    
    activateArmor() {
        this.hasArmor = true;
        this.armorTimer = this.armorDuration; // Start 15-second countdown
        this.player.color = this.player.armorColor;
        this.effectsManager.activateArmor(this.player, this.uiRenderer);
        
        // Play powerup sound effect and change music to armormarch.mp3
        this.audioManager.playSoundEffect('powerup');
        this.audioManager.playMusic('armormarch');
        if (this.isPaused) this.audioManager.pauseCurrentMusic();
    }
    
    deactivateArmor() {
        this.hasArmor = false;
        this.armorTimer = 0;
        this.player.color = '#8b4513'; // Reset to normal color
        
        // Reset scripture collection - player can collect them again
        this.booksCollected = 0;
        this.worldManager.reset(); // Respawn all scripture books
        
        // Switch back to adventure music
        this.audioManager.playMusic(this.bossManager.active ? 'bossFight' : 'adventure');
        
        // Show message to player
        this.uiRenderer.showMessage('Collect scriptures for new armor.', 240, '#FFA500', 15, 700);
    }
    
    togglePause() {
        // The portrait-orientation prompt owns this pause until the player rotates back.
        if (this.mobileOrientationPaused && this.isPaused) return;
        this.isPaused = !this.isPaused;
        this.updatePauseButton();
        
        if (this.isPaused) {
            this.inputHandler.hoveredButton = 'resume';
            this.canvas.focus({ preventScroll: true });
            // Starting a pause - record when it began
            this.pauseStartTime = performance.now();
            if (this.bossFightStartTime > 0 && this.bossFightEndTime === 0) this.bossFightPauseStartTime = this.pauseStartTime;
            this.audioManager.playSoundEffect('pause');
            this.audioManager.pauseCurrentMusic();
        } else {
            this.inputHandler.hoveredButton = null;
            // Ending a pause - add this pause duration to total
            if (this.pauseStartTime > 0) {
                this.totalPausedTime += performance.now() - this.pauseStartTime;
                this.pauseStartTime = 0;
            }
            if (this.bossFightPauseStartTime > 0) {
                this.bossFightPausedTime += performance.now() - this.bossFightPauseStartTime;
                this.bossFightPauseStartTime = 0;
            }
            this.audioManager.playSoundEffect('unpause');
            this.audioManager.resumeCurrentMusic();
        }
    }

    updatePauseButton() {
        const button = document.getElementById('pauseTouchBtn');
        const reminder = document.getElementById('pauseReminderText');
        if (reminder) reminder.textContent = this.isPaused ? "Press 'ESC' to resume" : "Press 'ESC' to pause";
        if (!button) return;
        button.innerHTML = this.isPaused
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>';
        button.setAttribute('aria-label', this.isPaused ? 'Resume game' : 'Pause game');
    }
    
    restartLevel() {
        if (this.bossFightCheckpoint) {
            this.retryCurrentLevel();
            return;
        }
        // Similar to resetGame but stay in playing mode
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.audioManager.playMusic('adventure');
        this.arrowManager.spawnInitialArrows(this.player);
        this.initializeScoring();
    }
    
    startNextLevel() {
        // Add completed level score to total before advancing
        this.totalScore = this.finalTotalScore || (this.totalScore + this.score);
        
        // Advance to the next level
        this.level++;
        this.preserveHealthOnNextLevel = true;
        this.showLevelIntro(); // Show intro for next level
        this.updateLevelSelector();
        
        // Initialize scoring for new level
        this.initializeScoring();
    }

    retryCurrentLevel() {
        if (this.bossFightCheckpoint) {
            this.restartBossFight();
            return;
        }
        // Restart the current level without advancing
        this.resetGame();
        this.gameState = 'playing';
        this.showScreen('game');
        this.updateLevelIndicator();
        this.audioManager.playMusic('adventure');
        this.arrowManager.spawnInitialArrows(this.player);
        
        // Initialize scoring for retry
        this.initializeScoring();
    }

    restartBossFight() {
        this.isPaused = false;
        this.updatePauseButton();
        this.bossManager.reset();
        this.bossManager.active = true;
        this.worldManager.createBossArena();
        this.enemyManager.reset();
        this.arrowManager.reset();
        this.player.x = 180; this.player.y = 420; this.player.velocityY = 0; this.player.isGrounded = true;
        this.player.isJumping = false;
        this.player.health = this.player.maxHealth;
        this.player.invulnerable = false;
        this.player.invulnerabilityTimer = 0;
        this.player.fallingSoundPlayed = false;
        this.pet.x = 130; this.pet.y = 440; this.pet.velocityY = 0; this.pet.isGrounded = true;
        this.cameraX = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathMessage = '';
        this.bossManager.enterArena();
        this.startBossFightTimer();
        this.initializeScoring();
        this.gameState = 'playing';
        this.showScreen('game');
        this.audioManager.playMusic('bossFight');
    }

    goToMainMenu() {
        // Keep the stage the player just exited, except after a completed full run.
        if (this.completedGameRun) this.level = 1;
        this.completedGameRun = false;
        this.bossFightCheckpoint = false;
        this.preserveHealthOnNextLevel = false;
        this.totalScore = 0; // Reset total score when going to main menu
        this.score = 0; // Reset level score
        this.resetGame();
        this.updateLevelSelector();
        this.audioManager.playMusic('menu');
        this.showScreen('menu');
    }
    
    gameOver(message) {
        this.gameState = 'gameOver';
        // Prevent a defeated player's background encounter from continuing behind this screen.
        this.bossManager.rocks = [];
        document.getElementById('gameOverMessage').textContent = message;
        this.showScreen('gameOver');
        
        // Play the new game over sequence (game over sound + song after delay)
        this.audioManager.playGameOverSequence();
    }
    
    levelComplete() {
        // A temple entered from a jump should wait for a natural landing, then use the
        // standard companion catch-up/trot sequence instead of snapping the player down.
        if (!this.player.isGrounded || this.player.velocityY !== 0) return;
        const wasPostBossSurface = this.postBossSurface;
        this.keepVictoryMusicForCompletion = wasPostBossSurface;
        this.postBossSurface = false;
        // Stop the level timer immediately when level is completed
        this.levelEndTime = performance.now();
        
        // Store initial scores before bonuses (bonuses will be added during celebration)
        this.finalLevelScore = this.score; // Will be updated with bonuses
        this.finalTotalScore = this.totalScore; // Will be updated with bonuses
        
        // Start temple entrance immediately
        this.gameState = 'enteringTemple';
        this.templeEntranceTimer = 0;
        this.templeCenterX = this.castle.x + this.castle.width / 2;
        const templeTargetX = this.templeCenterX - this.player.width / 2;
        // A temple-jump can finish on the far side of the temple. Record which
        // way the victory walk should travel instead of always assuming right.
        this.templeEntranceDirection = this.player.x > templeTargetX ? -1 : 1;
        
        // Calculate the correct temple platform Y based on castle position
        const templePlatformY = this.castle.y + this.castle.height;
        
        // If pet is far away (more than 300 pixels), teleport it next to player
        const distanceFromPlayer = Math.abs(this.pet.x - this.player.x);
        if (distanceFromPlayer > 300) {
            this.pet.x = this.player.x - this.templeEntranceDirection * 50; // Place pet slightly behind player
            this.pet.y = templePlatformY - this.pet.height; // Place on temple platform
            this.pet.isGrounded = true;
            this.pet.velocityY = 0;
        }
        
        // Initialize fade states
        this.player.alpha = 1;
        this.pet.alpha = 1;
        this.waitingForPet = true;
        this.movingTogether = false;
        
        // Make both face the temple
        this.player.facingRight = this.templeEntranceDirection > 0;
        this.pet.facingRight = this.templeEntranceDirection > 0;
        this.pet.isMoving = true;
        this.player.isMoving = false; // Player waits initially
    }
    

    
    updateTempleEntrance() {
        this.templeEntranceTimer++;
        const direction = this.templeEntranceDirection || 1;
        
        // Calculate the correct temple platform Y based on castle position
        const templePlatformY = this.castle.y + this.castle.height;
        
        // Wait until both characters are grounded before starting movement
        const playerGrounded = this.player.isGrounded || this.player.y >= templePlatformY - this.player.height;
        const petGrounded = this.pet.isGrounded || this.pet.y >= templePlatformY - this.pet.height;
        
        if (!playerGrounded || !petGrounded) {
            // Still waiting for landing - keep facing temple
            this.player.facingRight = direction > 0;
            this.pet.facingRight = direction > 0;
            return;
        }
        
        const targetX = this.templeCenterX - this.player.width / 2;
        const petTargetX = targetX - direction * 30;
        
        if (this.waitingForPet) {
            // Pet catches up to player
            if (this.pet.x < this.player.x - 20) {
                this.pet.facingRight = true;
                this.pet.x += this.templeEntranceSpeed;
            } else if (this.pet.x > this.player.x + 20) {
                this.pet.facingRight = false;
                this.pet.x -= this.templeEntranceSpeed;
            } else {
                // Pet caught up - now move together
                this.waitingForPet = false;
                this.movingTogether = true;
                this.player.isMoving = true;
                this.pet.isMoving = true;
            }
        } else if (this.movingTogether) {
            // Both move toward temple center together
            const playerHasArrived = direction > 0 ? this.player.x >= targetX : this.player.x <= targetX;
            const petHasArrived = direction > 0 ? this.pet.x >= petTargetX : this.pet.x <= petTargetX;
            if (!playerHasArrived || !petHasArrived) {
                this.player.facingRight = direction > 0;
                this.pet.facingRight = direction > 0;
                this.player.x = direction > 0
                    ? Math.min(targetX, this.player.x + this.templeEntranceSpeed)
                    : Math.max(targetX, this.player.x - this.templeEntranceSpeed);
                this.pet.x = direction > 0
                    ? Math.min(petTargetX, this.pet.x + this.templeEntranceSpeed)
                    : Math.max(petTargetX, this.pet.x - this.templeEntranceSpeed);
            } else {
                // Both reached the temple - start fading together
                this.movingTogether = false;
                this.templeEntranceTimer = 0; // Reset timer for fade sequence
            }
        } else {
            // Fade both together
            const fadeFrames = 30;
            const fadeProgress = Math.min(this.templeEntranceTimer / fadeFrames, 1);
            
            this.player.alpha = 1 - fadeProgress;
            this.pet.alpha = 1 - fadeProgress;
            
            // Once fully faded, start celebration
            if (fadeProgress >= 1) {
                this.startCelebration();
            }
        }
    }
    
    startCelebration() {
        this.gameState = 'celebrating';
        this.isCelebrationFastForward = false;
        this.effectsManager.initializeFireworks(this.castle);
        if (!this.keepVictoryMusicForCompletion) this.audioManager.playMusic('winner');
        // Let the level-clear music establish first, then layer the fireworks over it.
        setTimeout(() => {
            if (this.gameState === 'celebrating') this.audioManager.playSound('fireworks');
        }, 500);
        
        // Don't reset alpha values here - let the fade effect continue
        // through the celebration until the level complete screen shows
        
        // Add bonuses immediately when celebration starts so they're visible
        this.calculateAndDisplayBonuses();
        if (this.level === 1) this.unlockStage(2);
        if (this.level === 2) this.unlockStage(3);
        if (this.level === 3) this.unlockStage(4);
    }

    fastForwardCelebration() {
        if (this.gameState !== 'celebrating' || this.isCelebrationFastForward) return;
        this.isCelebrationFastForward = true;
        this.effectsManager.accelerateFireworks();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing' && this.gameState !== 'levelTransition' && this.gameState !== 'dying' && this.gameState !== 'celebrating' && this.gameState !== 'enteringTemple' && this.gameState !== 'bossCutscene') {
            return;
        }
        
        // Render parallax background (not translated by camera)
        if (this.bossManager.active && this.bossManager.state !== 'cutscene') {
            this.worldManager.renderBossCave(this.ctx, this.cameraX, this.canvas.width, this.canvas.height, this.caveCrystalImages);
        } else {
            this.backgroundManager.render(this.ctx, this.cameraX, this.gameState, this.reducedMobileEffects);
        }
        
        const heavyBossShake = ['jumpPrep', 'finalPrep', 'finalLeap'].includes(this.bossManager.state);
        const shakeCap = heavyBossShake ? 28 : 12;
        const shakeOffset = this.bossManager.active && this.bossManager.shake > 0 ? (Math.random() - .5) * Math.min(shakeCap, this.bossManager.shake) : 0;
        this.ctx.save();
        this.ctx.translate(-this.cameraX + shakeOffset, -this.cameraY + shakeOffset);
        
        // Render world platforms and objects
        this.worldManager.renderPlatforms(this.ctx, this.cameraX, this.canvas.width);
        this.worldManager.renderForegroundSprites(this.ctx, this.foregroundImages, this.cameraX, this.canvas.width);
        // During the level-three collapse, mask only the broken ground and nearby scenery
        // before drawing the temple and falling characters over the opening.
        this.bossManager.renderFade(this.ctx, 0, this.bossManager.state === 'cutscene');
        if (!this.bossManager.active || this.bossManager.state === 'cutscene') {
            this.worldManager.renderTemple(this.ctx, this.templeImage, this.castle, this.cameraX, this.canvas.width);
        }
        
        // Render game objects
        if (!this.bossManager.active) this.arrowManager.render(this.ctx);
        this.enemyManager.render(this.ctx, this.cameraX, this.canvas.width);
        // The world has already been translated by cameraX, so the boss uses world coordinates here.
        this.bossManager.render(this.ctx, 0);
        this.worldManager.renderScriptureBooks(this.ctx, this.bomImage, this.cameraX, this.canvas.width, this.reducedMobileEffects);
        this.worldManager.renderHearts(this.ctx, this.heartImage, this.cameraX, this.canvas.width, this.reducedMobileEffects);
        
        // Render characters
        this.characterRenderer.renderPlayer(this.ctx, this.player, this.hasArmor, this.gameState, this.isPaused);
        this.characterRenderer.renderPet(this.ctx, this.pet, this.isPaused);
        if (this.gameState === 'bossCutscene') this.bossManager.renderCutsceneAlert(this.ctx, this.player);
        
        // Render effects
        this.effectsManager.renderArmorExplosion(this.ctx);
        
        if (this.gameState === 'celebrating') {
            this.effectsManager.renderFireworks(this.ctx, this.cameraX);
        }
        
        this.ctx.restore();

        // Show petting prompt if close enough to pet
        if (this.gameState === 'playing' && !this.isPaused) {
            const horizontalDistance = Math.abs(this.player.x - this.pet.x);
            const verticalDistance = Math.abs(this.player.y - this.pet.y);
            const petDistance = 60;
            const maxYDifference = 30; // Must be on similar Y level
            
            if (horizontalDistance <= petDistance && verticalDistance <= maxYDifference && !this.pet.isBeingPetted) {
                this.ctx.save();
                this.ctx.translate(-this.cameraX, -this.cameraY); // Translate back for world coordinates
                
                // Show the pet interaction prompt above the companion.
                const isTouchPrompt = window.matchMedia('(pointer: coarse)').matches;
                const pettingTutorialComplete = this.hasPettedThisSession();
                const promptCenterX = this.pet.x + 25;
                const promptBottomY = this.pet.y - 5;
                const promptSize = pettingTutorialComplete
                    ? (isTouchPrompt ? 12 : 8)
                    : (isTouchPrompt ? 21 : 14);
                const petPrompt = isTouchPrompt
                    ? (pettingTutorialComplete ? 'Double tap?' : 'Double tap!')
                    : (pettingTutorialComplete ? "Press 'D'?" : "Press 'D'!");
                this.ctx.font = `${promptSize}px "Press Start 2P", monospace`;
                // iOS can briefly measure the fallback font narrower than the loaded
                // pixel font, so give touch prompts enough extra side room to contain it.
                const promptWidth = Math.ceil(this.ctx.measureText(petPrompt).width) + (isTouchPrompt ? 48 : 24);
                // The compact completed desktop prompt needs a slightly tighter badge.
                const promptHeight = pettingTutorialComplete && !isTouchPrompt
                    ? 18
                    : Math.max(26, promptSize + 16);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(promptCenterX - promptWidth / 2, promptBottomY - promptHeight, promptWidth, promptHeight);
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(petPrompt, promptCenterX, promptBottomY - promptHeight / 2 + promptSize * .35);
                
                this.ctx.restore();
            }
        }

        // Render UI (not translated by camera)
        this.uiRenderer.renderUI(
            this.ctx, 
            this.player, 
            this.booksCollected, 
            this.audioManager, 
            this.isPaused, 
            this.gameState,
            this.inputHandler.hoveredButton,
            this.hasArmor,
            this.armorTimer,
            this.armorDuration,
            this.comboMode,
            this.comboMultiplier,
            this.airborneKills,
            this.bossManager,
            this.heartImage,
            this.armorModalPausedGame
        );
        
        // Render sparkles on top of everything (with camera translation)
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        this.effectsManager.renderSparkleTrails(this.ctx, 0); // Pass 0 since we already translated
        this.effectsManager.renderPetAffectionEffects?.(this.ctx, 0);
        this.ctx.restore();
    }
    
    updateUIFromSavedSettings() {
        // Update audio button appearance based on saved setting
        this.updateAudioButtonAppearance();
        
        // Update speed controls based on saved setting
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.querySelector('.speed-value');
        
        if (speedSlider && speedValue) {
            speedSlider.value = this.gameSpeed;
            speedValue.textContent = this.gameSpeed.toFixed(2) + 'x';
        }
    }
    
    updatePetControlText() {
        const petControlText = document.getElementById('petControlText');
        if (petControlText) {
            const petName = this.selectedPetType.charAt(0).toUpperCase() + this.selectedPetType.slice(1);
            petControlText.textContent = `D Pet ${petName}`;
        }
    }
    
    getScoreDetailSprite(label) {
        if (label.startsWith('Scripture')) return 'images/sprites/pickups/scripture-pickup.png';
        if (label.startsWith('Heart') || label.startsWith('Health')) return null;
        if (label.startsWith('Mega Snail')) return 'images/sprites/enemies/snail/snail-shell.png';
        if (label.startsWith('Snail')) return 'images/sprites/enemies/snail/snail-crawl-01.png';
        if (label.startsWith('Arrow')) return 'images/sprites/enemies/fiery-arrow.png';
        if (label.startsWith('Armor')) return 'images/sprites/player/armored-stand.png';
        if (label.startsWith('Head Stomp') || label.startsWith('Stone Golem')) return 'images/sprites/enemies/golem/golem-stand.png';
        if (label.startsWith('Speed')) return 'images/sprites/player/jump.png';
        return null;
    }

    getScoreDetailLabel(label) {
        if (label.startsWith('Scripture')) return 'Scriptures gathered';
        if (label === 'Heart') return 'Hearts gathered';
        if (label.startsWith('Snail')) {
            const combo = label.match(/ x(\d+)/);
            return combo ? `Snails defeated — airborne combo x${combo[1]}` : 'Snails defeated';
        }
        if (label.startsWith('Mega Snail')) return 'Mega snails defeated';
        if (label.startsWith('Armor Ricochet')) return 'Arrow armor ricochet';
        if (label === 'Arrow') return 'Arrows deflected';
        return label;
    }

    showCompletionScoreDetails() {
        if (this.gameState !== 'levelComplete') return;
        const list = document.getElementById('completionScoreDetailsList');
        list.replaceChildren();
        const totals = new Map();
        this.scoreBreakdown.forEach(entry => totals.set(entry.label, (totals.get(entry.label) || 0) + entry.points));
        if (this.deathPenaltyTotal > 0) totals.set(`Game Over x${this.deathCount}`, -this.deathPenaltyTotal);

        totals.forEach((points, label) => {
            const row = document.createElement('div');
            row.className = `score-details-row${points < 0 ? ' score-details-row--negative' : ''}`;
            const sprite = this.getScoreDetailSprite(label);
            if (sprite) {
                const image = document.createElement('img');
                image.src = sprite; image.alt = '';
                row.append(image);
            } else {
                const icon = document.createElement('span');
                icon.className = 'score-details-icon'; icon.textContent = label.startsWith('Heart') || label.startsWith('Health') ? '♥' : '✦';
                row.append(icon);
            }
            const name = document.createElement('span'); name.textContent = this.getScoreDetailLabel(label);
            const value = document.createElement('strong'); value.textContent = `${points < 0 ? '−' : '+'}${Math.abs(points).toLocaleString()}`;
            row.append(name, value);
            list.append(row);
        });

        const total = document.createElement('div');
        total.className = 'score-details-total';
        const totalLabel = document.createElement('span'); totalLabel.textContent = 'Level Score';
        const totalValue = document.createElement('strong'); totalValue.textContent = Math.max(0, this.finalLevelScore ?? this.score).toLocaleString();
        total.append(totalLabel, totalValue);
        list.append(total);
        document.getElementById('completionScoreDetailsModal').classList.remove('hidden');
    }

    hideCompletionScoreDetails() {
        document.getElementById('completionScoreDetailsModal').classList.add('hidden');
    }

    showInstructionsModal() {
        if (!this.isPaused) document.getElementById('instructionsDoneBtn').textContent = 'Done';
        this.showGameplayInstructions();
        document.getElementById('instructionsModal').classList.remove('hidden');
        requestAnimationFrame(() => document.getElementById('instructionsDoneBtn').focus({ preventScroll: true }));
    }

    showScoringInstructions() {
        const modalContent = document.querySelector('#instructionsModal .how-to-play-modal');
        modalContent.classList.add('how-to-play-modal--scoring');
        document.querySelector('.how-to-score-content').setAttribute('aria-hidden', 'false');
    }

    showGameplayInstructions() {
        const modalContent = document.querySelector('#instructionsModal .how-to-play-modal');
        modalContent.classList.remove('how-to-play-modal--scoring');
        document.querySelector('.how-to-score-content').setAttribute('aria-hidden', 'true');
    }
    
    hideInstructionsModal() {
        document.getElementById('instructionsModal').classList.add('hidden');
        this.showGameplayInstructions();
        const shouldResume = this.autoResumeAfterInstructions;
        this.autoResumeAfterInstructions = false;
        if (shouldResume && this.isPaused && this.gameState === 'playing') this.togglePause();
    }

    showFirstLevelInstructions() {
        if (this.level !== 1 || localStorage.getItem('armorOfGod_seenHowToPlay')) return;
        this.autoResumeAfterInstructions = true;
        this.togglePause();
        document.getElementById('instructionsDoneBtn').textContent = 'Continue';
        this.showInstructionsModal();
        localStorage.setItem('armorOfGod_seenHowToPlay', 'true');
    }
    
    loadGameSpeedSetting() {
        const saved = localStorage.getItem('armorOfGod_gameSpeed');
        return saved !== null ? parseFloat(saved) : 1.0; // Default to 1.0x
    }

    loadUnlockedStageCount() {
        const saved = Number.parseInt(localStorage.getItem('armorOfGod_unlockedStageCount'), 10);
        return Number.isInteger(saved) && saved >= 1 && saved <= 4 ? saved : 1;
    }
    
    saveGameSpeedSetting() {
        localStorage.setItem('armorOfGod_gameSpeed', this.gameSpeed.toString());
    }

    createDebugDisplay() {
        // Create debug display element in DOM
        this.debugElement = document.createElement('div');
        this.debugElement.style.position = 'fixed';
        this.debugElement.style.bottom = '5px';
        this.debugElement.style.right = '5px';
        this.debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.debugElement.style.color = 'white';
        this.debugElement.style.padding = '5px';
        this.debugElement.style.fontFamily = 'monospace';
        this.debugElement.style.fontSize = '12px';
        this.debugElement.style.zIndex = '1000';
        this.debugElement.textContent = 'X:0 Y:0';
        document.body.appendChild(this.debugElement);
    }

    updateDebugDisplay() {
        if (this.debugElement && this.player) {
            const currentX = Math.round(this.player.x);
            const currentY = Math.round(this.player.y);
            
            // Only update if position changed
            if (!this.lastPlayerPos || this.lastPlayerPos.x !== currentX || this.lastPlayerPos.y !== currentY) {
                this.lastPlayerPos = { x: currentX, y: currentY };
                this.debugElement.textContent = `X:${currentX} Y:${currentY}`;
            }
        }
    }
    
    startVictoryRunningAnimation() {
        const runnersEl = document.getElementById('victoryRunners');
        const playerImgEl = document.getElementById('victoryPlayerImg');
        const petImgEl = document.getElementById('victoryPetImg');
        
        if (!runnersEl || !playerImgEl || !petImgEl) return;
        
        runnersEl.classList.remove('running', 'level-three-pose');
        const petType = this.selectedPet === 'cat' ? 'cat' : 'dog';
        if (this.pendingLevelThreeBoss) {
            petImgEl.src = petType === 'dog' ? 'images/sprites/pets/dog-jump-01.png' : 'images/sprites/pets/cat-run-01.png';
            playerImgEl.src = this.hasArmor ? 'images/sprites/player/armored-fall.png' : 'images/sprites/player/fall.png';
            runnersEl.classList.add('level-three-pose');
        } else {
            petImgEl.src = `images/sprites/pets/${petType}-run-01.png`;
            playerImgEl.src = 'images/sprites/player/run-01.png';
            runnersEl.classList.add('running');
            let playerFrame = 0, petFrame = 0;
            this.victoryAnimationInterval = setInterval(() => {
                playerImgEl.src = `images/sprites/player/run-${String((playerFrame++ % 14) + 1).padStart(2, '0')}.png`;
                const frames = petType === 'cat' ? 4 : 5;
                petImgEl.src = `images/sprites/pets/${petType}-run-${String((petFrame++ % frames) + 1).padStart(2, '0')}.png`;
            }, 80);
            setTimeout(() => {
                if (this.victoryAnimationInterval) {
                    clearInterval(this.victoryAnimationInterval);
                    this.victoryAnimationInterval = null;
                }
            }, 2560);
        }
        runnersEl.classList.remove('hidden');
    }
    
    stopVictoryRunningAnimation() {
        const runnersEl = document.getElementById('victoryRunners');
        
        if (runnersEl) {
            runnersEl.classList.add('hidden');
            runnersEl.classList.remove('running', 'level-three-pose');
        }
        
        if (this.victoryAnimationInterval) {
            clearInterval(this.victoryAnimationInterval);
            this.victoryAnimationInterval = null;
        }
    }

}

// Start loading as soon as the document structure is ready. Waiting for window.load
// can stall forever on mobile while Safari is still fetching a noncritical image.
async function startGameAfterDomReady() {
    const isDevelopmentEnvironment = location.protocol === 'file:' || ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(location.hostname);
    document.body.classList.toggle('development-mode', isDevelopmentEnvironment);
    const loadingStartedAt = performance.now();
    const loader = document.getElementById('startupLoading');
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    let loaderWasShown = false;
    const showLoader = () => {
        loaderWasShown = true;
        loader.classList.add('startup-loading--visible');
    };
    // Cached desktop starts should go straight to the menu. Phones always show
    // the loading screen because their asset and media startup is less predictable.
    const desktopLoaderTimer = isTouchDevice ? null : setTimeout(showLoader, 350);
    if (isTouchDevice) {
        loaderWasShown = true;
        requestAnimationFrame(() => loader.classList.add('startup-loading--visible'));
    }
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.register('sw.js').catch(error => console.warn('Offline asset cache could not be registered:', error));
    }
    const game = new ArmorOfGodGame();
    const status = document.getElementById('startupLoadingStatus');
    const progress = document.getElementById('startupLoadingProgress');
    let nativeFallbackUsed = false;
    const loadAssets = async () => {
        progress.style.width = '0%';
        status.textContent = 'CHECKING ADVENTURE… 0%';
        try {
            await game.preloadStartupAssets(({ percent, state }) => {
                progress.style.width = `${percent}%`;
                status.textContent = `${state} ${percent}%`;
            });
        } catch (error) {
            console.error('Required startup asset failed:', error);
            if (desktopLoaderTimer) clearTimeout(desktopLoaderTimer);
            showLoader();
            // Do not make a player wait at an error screen because the optional
            // verification/cache layer failed. Once per page, fall back to the
            // browser's normal element-by-element loading path. Programming errors
            // and a failure after that fallback still retain the diagnostic screen.
            const canUseNativeFallback = !nativeFallbackUsed && /^Could not prepare /.test(error.message || '');
            if (canUseNativeFallback) {
                nativeFallbackUsed = true;
                console.warn('Startup preloading failed; continuing with native asset loading.', error);
                game.useNativeAssetLoading();
                progress.style.width = '100%';
                status.textContent = 'LOADING AS NEEDED…';
                game.revealMenuAfterStartup(loaderWasShown);
                return;
            }
            progress.style.width = '0%';
            // Keep the player-facing message short, but expose the exact failing
            // asset in the visible text and title so mobile failures can be diagnosed
            // without attaching a remote debugger.
            const failingAsset = error.message.match(/Could not prepare ([^:]+)/)?.[1] || error.message;
            const reason = error.message.replace(/^Could not prepare [^:]+:\s*/, '');
            status.innerHTML = `ASSET ERROR: ${failingAsset.split('/').pop()}<br><span class="startup-loading__detail">${reason}</span><br>TAP TO RETRY`;
            status.title = error.message;
            loader.setAttribute('role', 'button');
            loader.setAttribute('tabindex', '0');
            const retry = event => {
                if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                loader.removeEventListener('click', retry);
                loader.removeEventListener('keydown', retry);
                loader.removeAttribute('role');
                loader.removeAttribute('tabindex');
                loadAssets();
            };
            loader.addEventListener('click', retry);
            loader.addEventListener('keydown', retry);
            return;
        }
        if (desktopLoaderTimer) clearTimeout(desktopLoaderTimer);
        const remainingDisplayTime = 1500 - (performance.now() - loadingStartedAt);
        if (loaderWasShown && remainingDisplayTime > 0) await new Promise(resolve => setTimeout(resolve, remainingDisplayTime));
        game.revealMenuAfterStartup(loaderWasShown);
    };
    loadAssets();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGameAfterDomReady, { once: true });
} else {
    startGameAfterDomReady();
}
