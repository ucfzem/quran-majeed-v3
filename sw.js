// Offline support for /quran-majeed-v3/
// - shell (index.html + fonts) cached
// - Quran text data (alquran.cloud / quran.com) cached, stale-while-revalidate
// - background prefetch of the 114 surah Arabic texts so the reader works offline
// Audio and third-party analytics are left to the network (untouched) to avoid
// breaking streaming / Range requests.

const VERSION = 'v2';
const SHELL = 'qmv3-shell-' + VERSION;
const DATA = 'qmv3-data-' + VERSION;

const SHELL_ASSETS = ['./', './index.html'];
const DATA_HOSTS = ['api.alquran.cloud', 'api.quran.com', 'api.qurancdn.com'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.all(SHELL_ASSETS.map((u) => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) =>
      (k.startsWith('qmv3-') && k !== SHELL && k !== DATA) || k === 'quran-majeed-v3'
    ).map((k) => caches.delete(k)));
    await self.clients.claim();
    prefetchQuran();
  })());
});

async function cacheFirst(cacheName, req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return Response.error();
  }
}

async function staleWhileRevalidate(cacheName, req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (cached) return cached;
  const res = await network;
  return res || Response.error();
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || req.destination === 'document') {
      event.respondWith((async () => {
        const cache = await caches.open(SHELL);
        const cached = await cache.match('./index.html');
        const fresh = fetch(req).then((res) => {
          if (res && res.ok) cache.put('./index.html', res.clone());
          return res;
        }).catch(() => null);
        return cached || (await fresh) || Response.error();
      })());
    } else {
      event.respondWith(cacheFirst(SHELL, req));
    }
    return;
  }

  if (DATA_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(DATA, req));
    return;
  }
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(SHELL, req));
    return;
  }
  // Everything else (audio, analytics, badges): straight to the network.
});

// Background prefetch: cache the surah list and every surah's Arabic text.
async function prefetchQuran() {
  try {
    const cache = await caches.open(DATA);
    const listUrl = 'https://api.alquran.cloud/v1/surah';
    const listReq = new Request(listUrl);
    let list = await cache.match(listReq);
    if (!list) {
      try {
        const res = await fetch(listReq);
        if (res && res.ok) { await cache.put(listReq, res.clone()); list = res; }
      } catch (e) {}
    }
    let nums = Array.from({ length: 114 }, (_, i) => i + 1);
    try {
      const data = await (list || await fetch(listReq)).json();
      if (data && Array.isArray(data.data)) nums = data.data.map((s) => s.number);
    } catch (e) {}

    let i = 0;
    const worker = async () => {
      while (i < nums.length) {
        const n = nums[i++];
        const r = new Request(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`);
        if (await cache.match(r)) continue;
        try { const res = await fetch(r); if (res && res.ok) await cache.put(r, res.clone()); } catch (e) {}
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));
  } catch (e) {}
}
