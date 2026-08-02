importScripts('js/asset-manifest.js');
const CACHE_PREFIX = 'armor-of-god-assets-';
const ASSET_CACHE = `${CACHE_PREFIX}${self.ASSET_MANIFEST.version}`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

function rangeResponse(request, response) {
    const range = request.headers.get('range');
    if (!range) return response;
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) return response;
    return response.arrayBuffer().then(buffer => {
        const start = Number(match[1]);
        const end = match[2] ? Math.min(Number(match[2]), buffer.byteLength - 1) : buffer.byteLength - 1;
        if (start > end || start >= buffer.byteLength) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${buffer.byteLength}` } });
        const headers = new Headers(response.headers);
        headers.set('Content-Length', String(end - start + 1));
        headers.set('Content-Range', `bytes ${start}-${end}/${buffer.byteLength}`);
        headers.set('Accept-Ranges', 'bytes');
        return new Response(buffer.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers });
    });
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
    event.respondWith((async () => {
        const cached = await caches.open(ASSET_CACHE).then(cache => cache.match(request.url));
        if (cached && cached.headers.get('x-aog-revision')) return rangeResponse(request, cached);
        return fetch(request);
    })());
});
