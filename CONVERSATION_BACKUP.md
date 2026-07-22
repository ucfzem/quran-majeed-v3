# Conversation Backup — 2026-07-22

## Context
Quran Majeed v3 — Quran reader web app (single `index.html` SPA).

## Changes Made This Session

### 1. New Audio Engine (alquran.cloud API)
- **Removed** old mp3quran.net / everyayah.com audio module
- **Added** per-ayah audio via `api.alquran.cloud/v1/ayah/{surah}:{ayah}/{reciterId}`
- **5 reciters**: الحصري، الشريم، العجمي، المعيقلي، المنشاوي
- Reciter IDs resolved automatically on first launch via `/edition?format=audio&language=ar`
- Speed control: 0.75x / 1.0x / 1.25x
- Preloading next ayah for seamless playback

### 2. UI Additions
- **🎧 Reciter button** in header with dropdown (replaces old `<select>` in surah card)
- **Fixed audio player bar** at bottom of screen (⏮ ⏸ ⏭ speed ✕)
- **▶️ button per ayah** in ayah actions row
- **CSS**: `.active-ayah` highlight, `.reciter-dropdown`, `.audio-player-bar`

### 3. Bug Fixes
- **Fixed `highlightAyah` conflict** — parameter vs function name clash in `loadSurah()` → renamed param to `scrollToAyah`
- **Fixed surah-switch audio leak** — added `stopAudioPlayback()` + `closeAudioPlayer()` at start of `loadSurah()`
- **Removed old `<audio>` tag `onended`** handler pointing to deleted function
- **Removed old audio controls** from surah header (redundant with new player bar)

### 4. Service Worker Fix
- New `sw.js` passes through all external API requests (alquran.cloud, quran.com)
- Only caches local static assets
- Fixes "Connection issue" error on GitHub Pages

### 5. Deployment Config
- Added `vercel.json` for Vercel deployment

## Links
- **GitHub Pages**: https://ucfzem.github.io/quran-majeed-v3/
- **Cloudflare Workers**: https://ucfzem.azer-tyu199p.workers.dev/quran-majeed-v3/
- **Vercel**: Import repo on vercel.com/new (vercel.json ready)
- **Netlify**: Auto-deploys from push (netlify.toml configured)

## Git Log
```
419bc02 fix: stop audio when switching surah
e765741 fix: remove old audio module, fix highlightAyah conflict, unify to new player
55be5ff fix: pass-through sw.js for API calls + add vercel.json
973bf1c feat: 5 reciters via alquran.cloud API + per-ayah audio + player bar
```

## Key Code Architecture
- `RECITERS[]` — array of 5 reciters with keys
- `RECITER_MATCH{}` — fuzzy matching against alquran.cloud edition list
- `resolveReciterIds()` — async, resolves once, cached in localStorage
- `buildPlayQueue()` — builds queue from `.ayah-block` DOM elements
- `playFromAyah(surah, ayah)` — entry point: builds queue, starts at specific ayah
- `playAyah(index)` — fetches audio URL, plays, highlights, preloads next
- `playerAudio` / `preloadAudio` — two `Audio()` instances for smooth transitions
