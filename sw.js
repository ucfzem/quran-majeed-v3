// Offline support for /quran-majeed-v3/
// - shell (index.html + fonts) cached
// - Quran text + whole-surah tafsir cached (stale-while-revalidate) on data hosts
// - background prefetch of all 114 surahs' Arabic text AND tafsir (awaited so it
//   is not killed when the activate event ends)
// - on-demand caching when the app opens a surah (postMessage {type:'cache-surah'})
// Audio and third-party analytics are left to the network (untouched) to avoid
// breaking streaming / Range requests.

const VERSION = 'v5';
const SHELL = 'qmv3-shell-' + VERSION;
const DATA = 'qmv3-data-' + VERSION;

const SHELL_ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;600;700&family=Scheherazade+New:wght@400;700&display=swap'
];
const DATA_HOSTS = ['api.alquran.cloud', 'api.quran.com', 'api.qurancdn.com'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

const textUrls = (n) => [
  `https://api.alquran.cloud/v1/surah/${n}/ar`,
  `https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`
];
const tafsirUrls = (n) => [
  `https://api.quran.com/api/v4/tafsirs/ar-tafsir-ibn-kathir/by_chapter/${n}?per_page=300`
];

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
    await prefetchQuran();
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

async function putWithRetry(cache, url, tries) {
  const r = new Request(url);
  if (await cache.match(r)) return true;
  for (let a = 0; a < tries; a++) {
    try {
      const res = await fetch(r);
      if (res && res.ok) { await cache.put(r, res.clone()); return true; }
    } catch (e) {}
    await new Promise((z) => setTimeout(z, 300 * (a + 1)));
  }
  return false;
}

async function cacheSurah(n) {
  const cache = await caches.open(DATA);
  for (const u of textUrls(n)) await putWithRetry(cache, u, 2);
  for (const u of tafsirUrls(n)) await putWithRetry(cache, u, 3);
}

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

    const run = async (fn, conc) => {
      let idx = 0;
      const w = async () => {
        while (idx < nums.length) {
          const n = nums[idx++];
          for (const u of fn(n)) await putWithRetry(cache, u, 2);
        }
      };
      await Promise.all(Array.from({ length: conc }, w));
    };
    await run(textUrls, 4);
    await run(tafsirUrls, 4);
    await run(tafsirUrls, 4); // second pass fills anything missed/evicted
  } catch (e) {}
}

self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d && d.type === 'cache-surah' && d.surah) {
    const p = cacheSurah(Number(d.surah));
    if (event.waitUntil) event.waitUntil(p);
  }
});
