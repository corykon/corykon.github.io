/*
 * A deterministic startup cache for game-owned media.  Browser media events are
 * deliberately not used as download completion signals: they are only hints and
 * are especially inconsistent on mobile WebKit.
 */
class AssetPreloader {
    static CACHE_PREFIX = 'armor-of-god-assets-';

    constructor({ mobile = false } = {}) {
        this.mobile = mobile;
        this.concurrency = mobile ? 2 : 4;
        this.cacheAvailable = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        // A phone loading the game from a development machine's LAN IP is an
        // insecure context. It cannot provide Web Crypto or persistent storage, so
        // use it to test loading behavior but reserve strict byte/hash enforcement
        // for HTTPS production (and secure localhost development).
        this.enforceIntegrity = globalThis.isSecureContext;
        // Safari's native media loader is more reliable with same-origin URLs than
        // with blob: URLs, including on iPadOS browsers that identify as macOS.
        this.preferNativeMediaURLs = /iP(?:ad|hone|od)/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        this.manifest = globalThis.ASSET_MANIFEST;
        if (!this.manifest?.version || !this.manifest?.assets) throw new Error('Asset manifest is missing or invalid.');
        this.cacheName = `${AssetPreloader.CACHE_PREFIX}${this.manifest.version}`;
    }

    normalize(url) {
        const parsed = new URL(url, document.baseURI);
        return parsed.origin === location.origin ? parsed.href : null;
    }

    manifestKey(url) {
        const pathname = new URL(url, document.baseURI).pathname;
        const basePath = new URL(document.baseURI).pathname.replace(/[^/]*$/, '');
        return decodeURIComponent(pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname.replace(/^\//, ''));
    }

    entryFor(url) {
        return this.manifest.assets[this.manifestKey(url)];
    }

    async hash(bytes) {
        if (!globalThis.crypto?.subtle) {
            this.hashVerificationUnavailable = true;
            return null;
        }
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async openCache() {
        if (!this.cacheAvailable || !('caches' in window)) return null;
        try { return await caches.open(this.cacheName); } catch (error) {
            console.warn('Asset cache is unavailable; using the browser HTTP cache.', error);
            return null;
        }
    }

    async cacheAsset(url, cache, onChunk) {
        const entry = this.entryFor(url);
        if (!entry) throw new Error(`Asset is not declared in the manifest: ${this.manifestKey(url)}`);
        const cached = cache && await cache.match(url);
        if (cached) {
            // The response entered Cache Storage only after the byte length and hash
            // were checked below. These headers let repeat visits validate cache
            // identity without decoding every large MP3 and MP4 again.
            if (cached.headers.get('x-aog-bytes') === String(entry.bytes) && cached.headers.get('x-aog-revision') === entry.sha256) {
                onChunk({ complete: true, cached: true });
                return;
            }
            await cache.delete(url);
        }

        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            try {
                const response = await fetch(url, { signal: controller.signal, cache: 'default', credentials: 'same-origin' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('text/html')) throw new Error('Server returned HTML instead of an asset');

                // Reading the complete body is intentional. It gives Cache Storage one
                // complete response, which the service worker can later satisfy range
                // requests from for audio and video.
                const bytes = await response.arrayBuffer();
                clearTimeout(timeout);
                if (this.enforceIntegrity && bytes.byteLength !== entry.bytes) throw new Error(`Expected ${entry.bytes} bytes, received ${bytes.byteLength}`);
                const downloadedHash = await this.hash(bytes);
                if (this.enforceIntegrity && downloadedHash && downloadedHash !== entry.sha256) throw new Error('Downloaded asset did not match its manifest hash');
                if (cache) {
                    const headers = new Headers(response.headers);
                    // Fetch may transparently decode HTTP-compressed responses; do not
                    // retain stale byte-count or encoding metadata for the cached body.
                    headers.delete('content-length');
                    headers.delete('content-encoding');
                    headers.set('x-aog-revision', entry.sha256);
                    headers.set('x-aog-bytes', String(entry.bytes));
                    try {
                        await cache.put(url, new Response(bytes, { headers }));
                    } catch (error) {
                        // iOS may reject a large Cache Storage write because of quota
                        // or private-browsing policy. The verified response is still
                        // usable for this visit through the normal HTTP cache, so this
                        // must not turn a successful download into a failed startup.
                        this.persistentCacheUnavailable = true;
                        console.warn('Persistent asset cache is full or unavailable; continuing without offline storage.', error);
                    }
                }
                onChunk({ complete: true, cached: false });
                return;
            } catch (error) {
                clearTimeout(timeout);
                lastError = error;
                if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            }
        }
        throw new Error(`Could not prepare ${new URL(url).pathname}: ${lastError?.message || 'unknown error'}`);
    }

    async markCacheReady(cache) {
        if (!cache || this.persistentCacheUnavailable) return;
        try {
            await cache.put('__manifest_ready__', new Response(this.manifest.version));
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames
                .filter(name => name.startsWith(AssetPreloader.CACHE_PREFIX) && name !== this.cacheName)
                .map(name => caches.delete(name)));
        } catch (error) {
            this.persistentCacheUnavailable = true;
            console.warn('Could not finalize the persistent asset cache; continuing for this visit.', error);
        }
    }

    async preload(urls, onProgress = () => {}) {
        const uniqueUrls = [...new Set(urls.map(url => this.normalize(url)).filter(Boolean))];
        const total = uniqueUrls.length;
        if (!total) return;
        const cache = await this.openCache();
        let completed = 0;
        const report = (state = 'DOWNLOADING ADVENTURE…') => onProgress({ completed, total, percent: Math.min(90, Math.round((completed / total) * 90)), state });
        report();

        let cursor = 0;
        let failure;
        const worker = async () => {
            while (!failure) {
                const index = cursor++;
                if (index >= total) return;
                try {
                    await this.cacheAsset(uniqueUrls[index], cache, () => {
                        completed++;
                        report();
                    });
                } catch (error) {
                    failure = error;
                }
            }
        };
        await Promise.all(Array.from({ length: Math.min(this.concurrency, total) }, worker));
        if (failure) throw failure;
        await this.markCacheReady(cache);
        onProgress({ completed: total, total, percent: 90, state: 'VERIFYING ADVENTURE…' });
    }

    async decodeImages(images, onProgress = () => {}) {
        const uniqueImages = [...new Set(images)];
        let completed = 0;
        let cursor = 0;
        const decode = async image => {
            try {
                if (image.decode) await image.decode();
                else if (!image.complete) await new Promise((resolve, reject) => {
                    image.addEventListener('load', resolve, { once: true });
                    image.addEventListener('error', reject, { once: true });
                });
            } catch (error) {
                // Some decorative images may have been changed dynamically. Their
                // network validation above remains authoritative; do not block on a
                // browser-specific decode quirk.
                console.warn('Image decode skipped:', image.currentSrc || image.src, error);
            } finally {
                completed++;
                onProgress({ completed, total: uniqueImages.length, percent: 90 + Math.round((completed / uniqueImages.length) * 10), state: 'PREPARING ADVENTURE…' });
            }
        };
        const worker = async () => {
            while (cursor < uniqueImages.length) await decode(uniqueImages[cursor++]);
        };
        await Promise.all(Array.from({ length: Math.min(this.concurrency, uniqueImages.length) }, worker));
    }

    async getCachedObjectURL(url, { preferNetworkURL = false } = {}) {
        // Mobile WebKit can download and cache an MP4 successfully but still reject
        // its blob: URL when the video element starts decoding it.  Giving Safari
        // the same-origin URL lets its native media pipeline make range requests
        // and use the bytes we have already placed in the HTTP/Service Worker cache.
        if (preferNetworkURL) return url;
        const normalized = this.normalize(url);
        const cache = await this.openCache();
        const response = normalized && cache && await cache.match(normalized);
        if (!response) return url;
        const blob = await response.blob();
        return blob.size ? URL.createObjectURL(blob) : url;
    }
}
