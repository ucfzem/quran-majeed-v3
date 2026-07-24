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

## Architecture
- **Audio Engine**: `api.alquran.cloud/v1/ayah/{surah}:{ayah}/{reciterId}`
- **Reciters**: الحصري، الشريم، العجمي، المعيقلي، المنشاوي (auto-resolved)
- **Media Session**: Background playback + lock screen controls
- **Continuous Mode**: Auto-advances to next surah (localStorage)
- **Wake Lock**: `navigator.wakeLock.request('screen')` prevents screen sleep
- **NoSleep.js**: Hidden video keeps device awake (Via Browser fallback)
- **Keep-Alive**: 5s interval resumes AudioContext when hidden
- **Arabic Fonts**: Scheherazade New → Amiri → Tahoma → Arial → sans-serif
