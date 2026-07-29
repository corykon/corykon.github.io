class HighScoreBoard {
    constructor(game) {
        this.game = game;
        this.screen = document.getElementById('leaderboardScreen');
        this.nameEntry = document.getElementById('leaderboardEntry');
        this.nameInput = document.getElementById('leaderboardName');
        this.entries = document.getElementById('leaderboardEntries');
        this.heading = document.getElementById('leaderboardHeading');
        this.status = document.getElementById('leaderboardStatus');
        this.continueButton = document.getElementById('leaderboardContinueBtn');
        this.skipButton = document.getElementById('leaderboardSkipBtn');
        this.pendingScore = null;
        this.isFinalLeaderboard = false;
        this.highlightedId = null;
        document.getElementById('leaderboardSubmitBtn').addEventListener('click', () => this.submit());
        this.skipButton.addEventListener('click', () => this.skip());
        this.nameInput.addEventListener('keydown', event => { if (event.key === 'Enter') this.submit(); });
        this.continueButton.addEventListener('click', () => this.exit());
    }

    // Allow only a compact arcade-name character set. textContent is used for output too.
    cleanName(value) {
        return value.normalize('NFKC').toUpperCase().replace(/[^A-Z0-9 _.-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 10);
    }

    async open(score = null) {
        this.pendingScore = Number.isSafeInteger(score) && score >= 0 ? score : null;
        this.isFinalLeaderboard = this.pendingScore !== null;
        this.highlightedId = null;
        this.game.gameState = 'leaderboard';
        this.game.showScreen('leaderboard');
        this.game.audioManager.playMusic('hallOfHeroes');
        this.nameEntry.classList.toggle('hidden', this.pendingScore === null);
        this.continueButton.classList.toggle('hidden', this.pendingScore !== null);
        this.continueButton.textContent = this.pendingScore === null ? 'Back to Main Menu' : 'Continue to Credits';
        this.status.classList.remove('hidden');
        this.status.textContent = this.pendingScore === null ? 'Loading the hall of heroes…' : `YOUR FINAL SCORE: ${this.pendingScore.toLocaleString()}`;
        this.nameInput.value = '';
        if (this.pendingScore !== null) setTimeout(() => this.nameInput.focus(), 50);
        if (!this.isAvailable()) {
            this.nameEntry.classList.add('hidden');
            this.continueButton.classList.remove('hidden');
            this.status.textContent = 'LEADERBOARD UNAVAILABLE — OPEN THE GAME THROUGH A WEB SERVER.';
            this.hideResults();
            return;
        }
        if (this.pendingScore !== null) {
            this.hideResults();
            return;
        }
        await this.load();
    }

    isAvailable() {
        return typeof window.FirebaseLeaderboard?.fetchTopScores === 'function';
    }

    async submit() {
        if (this.pendingScore === null || !this.isAvailable()) return;
        const name = this.cleanName(this.nameInput.value);
        this.nameInput.value = name;
        if (!name) { this.status.textContent = 'ENTER A NAME (1–10 CHARACTERS)'; this.nameInput.focus(); return; }
        const button = document.getElementById('leaderboardSubmitBtn');
        button.disabled = true;
        this.status.textContent = 'CARVING YOUR SCORE…';
        try {
            this.highlightedId = await window.FirebaseLeaderboard.submit(name, this.pendingScore);
            this.pendingScore = null;
            this.nameEntry.classList.add('hidden');
            this.continueButton.classList.remove('hidden');
            this.continueButton.textContent = 'Continue to Credits';
            this.status.textContent = 'SCORE SAVED!';
            await this.load();
        } catch (error) {
            console.error('Leaderboard submission failed:', error);
            this.status.textContent = 'COULD NOT SAVE — PLEASE TRY AGAIN';
        } finally { button.disabled = false; }
    }

    async skip() {
        if (this.pendingScore === null) return;
        this.pendingScore = null;
        this.nameEntry.classList.add('hidden');
        this.continueButton.classList.remove('hidden');
        this.continueButton.textContent = 'Continue to Credits';
        this.status.textContent = 'SCORE NOT SAVED';
        await this.load();
    }

    async load() {
        this.entries.replaceChildren();
        this.entries.classList.remove('leaderboard-entries--notice', 'leaderboard-entries--revealed');
        this.entries.classList.add('hidden');
        this.heading.classList.add('hidden');
        this.heading.classList.remove('leaderboard-heading--revealed');
        if (!this.isAvailable()) {
            this.setNotice('offline', 'LEADERBOARD UNAVAILABLE', 'OPEN THE GAME THROUGH A WEB SERVER TO CONNECT TO FIREBASE.');
            return;
        }
        try {
            const scores = await window.FirebaseLeaderboard.fetchTopScores();
            if (!scores.length) { this.setNotice('empty', 'NO HEROES YET', 'BEAT THE GAME TO BE THE FIRST TO WRITE YOUR NAME IN THE HALL OF HEROES.'); return; }
            this.heading.classList.remove('hidden');
            scores.forEach((entry, index) => this.entries.append(this.renderEntry(entry, index + 1)));
            this.revealResults();
            const highlighted = this.entries.querySelector('.leaderboard-row--highlighted');
            if (highlighted) highlighted.scrollIntoView({ block: 'center' });
        } catch (error) {
            console.error('Leaderboard load failed:', error);
            this.setNotice('offline', 'LEADERBOARD TEMPORARILY OFFLINE', 'PLEASE TRY AGAIN IN A MOMENT.');
        }
    }

    setNotice(type, title, message) {
        this.entries.replaceChildren();
        this.entries.classList.remove('hidden');
        this.entries.classList.add('leaderboard-entries--notice');
        this.heading.classList.add('hidden');
        const notice = document.createElement('div');
        notice.className = `leaderboard-notice leaderboard-notice--${type}`;
        const icon = document.createElement('div'); icon.className = 'leaderboard-notice-icon'; icon.textContent = type === 'empty' ? '♜' : '!';
        const heading = document.createElement('h2'); heading.textContent = title;
        const copy = document.createElement('p'); copy.textContent = message;
        notice.append(icon, heading, copy);
        this.entries.append(notice);
        this.revealResults();
    }

    revealResults() {
        if (this.status.textContent.startsWith('Loading')) {
            this.status.textContent = '';
            this.status.classList.add('hidden');
        }
        this.entries.classList.remove('hidden');
        if (!this.heading.classList.contains('hidden')) this.heading.classList.add('leaderboard-heading--revealed');
        this.entries.classList.add('leaderboard-entries--revealed');
    }

    hideResults() {
        this.entries.replaceChildren();
        this.entries.classList.add('hidden');
        this.entries.classList.remove('leaderboard-entries--notice', 'leaderboard-entries--revealed');
        this.heading.classList.add('hidden');
        this.heading.classList.remove('leaderboard-heading--revealed');
    }

    renderEntry(entry, rank) {
        const row = document.createElement('div');
        row.className = `leaderboard-row${entry.id === this.highlightedId ? ' leaderboard-row--highlighted' : ''}`;
        if (entry.id === this.highlightedId) {
            row.title = 'Your score';
            row.setAttribute('aria-label', 'Your score');
        }
        const date = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date();
        [['#', rank], ['NAME', this.cleanName(String(entry.name || 'UNKNOWN')) || 'UNKNOWN'], ['DATE', date.toLocaleDateString()], ['SCORE', Number(entry.score || 0).toLocaleString()]].forEach(([label, value]) => {
            const cell = document.createElement('span'); cell.dataset.label = label; cell.textContent = value; row.append(cell);
        });
        return row;
    }

    exit() { this.isFinalLeaderboard ? this.game.startCredits() : this.game.goToMainMenu(); }
}
