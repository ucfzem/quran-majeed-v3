# Conversation Backup — 2026-07-24 (Session 4)

## Changes Made

### 1. Arabic Font Fix (Tofu/Squares on TV)
- **Problem**: Arabic/Quranic text displayed as empty squares ("tofu") on TV devices
- **Root cause**: TV browsers lack proper Arabic font support, especially for complex tashkil/diacritization
- **Solution**: Added `Scheherazade New` (Google Fonts) as primary Arabic font with system fallbacks

### 2. brown-gold-theme.html
- Added `preconnect` links to Google Fonts for faster loading
- Updated Google Fonts URL to include `Scheherazade New` (was missing)
- Updated `body` and `.arabic-text` font-family: `'Scheherazade New', 'Amiri', Tahoma, Arial, sans-serif`
- Added `font-feature-settings: "rlig" 1, "calt" 1` for Arabic ligature rendering

### 3. index.html
- Updated `body` font-family from `'Amiri', 'Scheherazade New', serif` to `'Scheherazade New', 'Amiri', Tahoma, Arial, sans-serif`
- Added `font-feature-settings: "rlig" 1, "calt" 1` to body
- Updated 8 Arabic text selectors with consistent font stack:
  - `.ayah-arabic` (main Quran text)
  - `.surah-name-ar` (sidebar)
  - `.welcome h2`
  - `.reciter-dropdown`
  - `.ayah-tafsir-content`
  - `.result-arabic` (search results)
  - `.wby-word .ar` (word-by-word)
  - Footer inline style

### 4. Deployments
- GitHub: https://github.com/ucfzem/quran-majeed-v3
- Vercel: https://quran-majeed-v3.vercel.app
- GitHub Pages (auto): https://ucfzem.github.io/quran-majeed-v3/
- Cloudflare Workers: https://quran-majeed.azer-tyu199p.workers.dev

## Git Log
```
9cfa1c8 fix: add Arabic font fallbacks to prevent tofu/squares on TV devices
fed4475 feat: NoSleep.js fallback for Via Browser background playback
953c539 feat: NoSleep.js fallback for Via Browser background playback
c9e308e feat: Wake Lock API + background audio keep-alive for screen-off playback
a358e44 docs: conversation backup session 3
3681586 fix: skip pre-Bismillah for Al-Fatihah (ayah 1 IS the Bismillah)
b57b5e3 fix: continuous mode - add error handling + DOM delay
5c54a01 docs: conversation backup session 2
808cec1 feat: Media Session API for background/lock-screen playback
e16456d feat: continuous mode + remove unused audio tag
23f3d56 fix: enable workers_dev in wrangler.toml
e036e97 feat: tap anywhere on verse to play + event.stopPropagation on buttons
58c6805 feat: better audio player - progress bar, skip ±5, ayah counter
46cb281 fix: Bismillah no longer loops, plays ayah 1 after
15a3e19 feat: play Bismillah before first ayah (except At-Tawbah)
c84ffd9 feat: brown-gold dark theme integrated
c3e8d32 fix: verse number circles brighter in dark mode
419bc02 fix: stop audio when switching surah
e765741 fix: remove old audio module, fix highlightAyah conflict
55be5ff fix: pass-through sw.js for API calls + add vercel.json
973bf1c feat: 5 reciters via alquran.cloud API + per-ayah audio + player bar
```

### 4. Arabic Search Fix (Word-Boundary Matching) — 2026-07-29
- **Problem**: Searching for `آدم` (Adam) matched `نادمين` (remorseful) as substring
- **Root cause**: `RegExp.test()` did substring matching — `ادم` (normalized) matched inside `نادمين`
- **Fix**: Tokenize verse into words, match `w.startsWith(query)`, handle Arabic prefixes (`ال`, `ف`, `و`, `ب`, `ل`)
- **Files**: `index.html` (lines 1756–1780)
- **Commit**: `80dc995`

### 5. Added Reciter بدر التركي (Badr Al-Turki) — 2026-07-29 (removed)
- **Added** بدر التركي to RECITERS with audio from mp3quran.net (full surah MP3s)
- **Problem**: App requires ayah-by-ayah streaming, bader only has full surah files
- **Removed**: Reverted all bader-related changes. Not compatible with current audio engine.

### 6. Added Reciter محمد أيوب (Muhammad Ayyoub) — 2026-07-30
- **Added** `ayyoub` key to RECITERS with label 'محمد أيوب'
- **Identifier**: `ar.muhammadayyoub` — confirmed working on QuranCloud API
- **Source**: `https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/ar.muhammadayyoub`

### 7. Added 3 EveryAyah Reciters (علي جابر, سهل ياسين, ياسر الدوسري) — 2026-07-30
- **Ali Jaber** (`ali_jaber`): `https://everyayah.com/data/Ali_Jaber_64kbps/{s:03d}{a:03d}.mp3`
- **Sahl Yassin** (`sahl`): `https://everyayah.com/data/Sahl_Yassin_128kbps/{s:03d}{a:03d}.mp3`
- **Yasser Ad-Dosari** (`dussary`): `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/{s:03d}{a:03d}.mp3`
- **New architecture**: Added `RECITER_EVERYAYAH` map + `getAyahUrl()` helper function
- `getAyahUrl()` returns EveryAyah URL directly for these 3 reciters, falls back to QuranCloud API for others
- Refactored `playAyah()`, `preloadNextAyah()`, and `ended` handler to use `getAyahUrl()`

## Architecture
- **Audio Engine**: `api.alquran.cloud/v1/ayah/{surah}:{ayah}/{reciterId}`
- **Reciters**: الحصري، الشريم، العجمي، المعيقلي، المنشاوي، محمد أيوب، علي جابر، سهل ياسين، ياسر الدوسري (9 total)
- **Audio Source**: QuranCloud API for most reciters; EveryAyah.com direct MP3 for Ali Jaber, Sahl Yassin, Yasser Ad-Dosari
- **Media Session**: Background playback + lock screen controls
- **Continuous Mode**: Auto-advances to next surah (localStorage)
- **Wake Lock**: `navigator.wakeLock.request('screen')` prevents screen sleep
- **NoSleep.js**: Hidden video keeps device awake (Via Browser fallback)
- **Keep-Alive**: 5s interval resumes AudioContext when hidden
- **Arabic Fonts**: Scheherazade New → Amiri → Tahoma → Arial → sans-serif
