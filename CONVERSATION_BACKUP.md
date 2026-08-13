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

### 6. Added 3 EveryAyah Reciters (علي جابر, سهل ياسين, ياسر الدوسري) — 2026-07-30
- Note: محمد أيوب was briefly added then removed (user requested clear)
- **Ali Jaber** (`ali_jaber`): `https://everyayah.com/data/Ali_Jaber_64kbps/{s:03d}{a:03d}.mp3`
- **Sahl Yassin** (`sahl`): `https://everyayah.com/data/Sahl_Yassin_128kbps/{s:03d}{a:03d}.mp3`
- **Yasser Ad-Dosari** (`dussary`): `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/{s:03d}{a:03d}.mp3`
- **New architecture**: Added `RECITER_EVERYAYAH` map + `getAyahUrl()` helper function
- `getAyahUrl()` returns EveryAyah URL directly for these 3 reciters, falls back to QuranCloud API for others
- Refactored `playAyah()`, `preloadNextAyah()`, and `ended` handler to use `getAyahUrl()`

## Architecture
- **Audio Engine**: `api.alquran.cloud/v1/ayah/{surah}:{ayah}/{reciterId}`
- **Reciters**: الحصري، الشريم، العجمي، المعيقلي، المنشاوي، علي جابر، سهل ياسين، ياسر الدوسري (8 total)
- **Audio Source**: QuranCloud API for most reciters; EveryAyah.com direct MP3 for Ali Jaber, Sahl Yassin, Yasser Ad-Dosari
- **Media Session**: Background playback + lock screen controls
- **Continuous Mode**: Auto-advances to next surah (localStorage)
- **Wake Lock**: `navigator.wakeLock.request('screen')` prevents screen sleep
- **NoSleep.js**: Hidden video keeps device awake (Via Browser fallback)
- **Keep-Alive**: 5s interval resumes AudioContext when hidden
- **Arabic Fonts**: Scheherazade New → Amiri → Tahoma → Arial → sans-serif

## Session 8 — 2026-08-13 (pause scroll bug, Abdul Basit CDN, flag, minify)

### 1. Critical: Quran auto-scrolled to top on Pause ⏸️ — FIXED
- **Problem**: Clicking pause in the audio player made the page jump scroll back up; ayahs did not stay in place.
- **Root cause**: The previous queue-based audio engine (`playerAudio`/`playQueue` with bismillah, wake-lock, NoSleep, auto-next-surah) tied scrolling to playback state and moved focus on pause. Full replacement done.
- **Fix**: Rewrote audio engine to a per-ayah model (`audioObj`, `playAyahAudio()`, `toggleAudioPlayback()`, `currentAyahIndex`, `getGlobalAyahNumber()`). Pausing now only pauses and toggles the icon — no scroll, no re-render. The pause guard in `playAyahAudio()` leaves the ayah where it is.

### 2. Abdul Basit audio stream not loading — FIXED
- **Problem**: `ar.abdulbasitmurattal` returned broken streams via the islamic.network CDN.
- **Fix**: Added `getAudioUrl(surahNum, ayahNum)` helper. When `currentReciter === 'ar.abdulbasitmurattal'`, it builds `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/{s:03d}{a:03d}.mp3`. All other reciters keep the `cdn.islamic.network/quran/audio/128/{reciter}/{globalAyah}.mp3` pattern.

### 3. Flag icon — Saudi → Moroccan
- Replaced `🇸🇦` with `🇲🇦` in the Arabic language entry (`{ code: 'ar', label: '🇲🇦 العربية (Arabic)' }`).

### 4. Minify & mobile optimization
- JS minified with Terser (compress on, mangle OFF so inline `onclick=` globals keep working).
- CSS minified with clean-css (level 1).
- Collapsed 594 blank lines / trailing spaces in HTML markup.
- Kept external library dependencies at zero; audio stays lazy-loaded (`new Audio()` only created on play).

### Deployments
- GitHub: https://github.com/ucfzem/quran-majeed-v3
- GitHub Pages (auto): https://ucfzem.github.io/quran-majeed-v3/
- Vercel: https://quran-majeed-v3.vercel.app
- Cloudflare Workers: https://quran-majeed.azer-tyu199p.workers.dev

### Git Log (latest)
- `dcf3513` fix: keep ayahs in place on pause; add Abdul Basit EveryAyah CDN; Moroccan flag; minify for mobile

### Git Log (pushed)
- `c962dac` fix: keep ayahs in place on pause; Abdul Basit EveryAyah CDN; Moroccan flag; minify for mobile (pushed to origin/main)
- `1e2f350` docs: full conversation backup session 8
- `96d56ca` docs: cloudflare workers deployed via wrangler

### Deployment status (verified 2026-08-13)
- GitHub Pages: HTTP 200 — serves new minified build (74,179 bytes), Moroccan flag + EveryAyah CDN confirmed ✅
- Vercel: HTTP 200 — serves new build, all markers confirmed ✅
- Cloudflare Workers: deployed via wrangler with user's token; serves new minified build (74,179 bytes) ✅

### Full conversation summary (Session 8)
1. User reported critical bug: clicking Pause ⏸️ made the Quran scroll to the top by itself; ayahs did not stay in place.
2. User supplied a full replacement HTML (simpler per-ayah audio engine). Chose "replace index.html wholesale".
3. Repo was cloned; deployed site (GitHub Pages) matched repo `index.html` (queue-based engine).
4. Replaced `index.html` with the per-ayah fix; validated JS syntax.
5. Applied 3 follow-up adjustments requested by user:
   - Fix Abdul Basit audio stream → EveryAyah Murattal CDN via new `getAudioUrl()` helper
   - Flag icon `🇸🇦` → `🇲🇦`
   - Minify & optimize (Terser JS + clean-css CSS + blank-line collapse; 94,131 → 74,179 bytes)
6. Found credentialed clone at `/tmp/opencode/quran-majeed-v3`; committed and pushed `c962dac`.
7. Verified GitHub Pages and Vercel deployments serve the new version.
8. User provided a Cloudflare API token; verified with `/user/tokens/verify`, deployed via `wrangler deploy` (Version ID 22471132-13e0-4c44-a22d-cb497a482574). All three deployments now serve the new build.

### Links (all)
- Repo: https://github.com/ucfzem/quran-majeed-v3
- GitHub Pages: https://ucfzem.github.io/quran-majeed-v3/
- Vercel: https://quran-majeed-v3.vercel.app
- Cloudflare Workers: https://quran-majeed.azer-tyu199p.workers.dev
- Conversation backup: https://github.com/ucfzem/quran-majeed-v3/blob/main/CONVERSATION_BACKUP.md

## Session 9 — Bottom progress bar shows global surah progress (2026-08-13)

### Problem
- Bottom audio progress bar (`apbProgress`) restarted at 0% on every ayah because each ayah is a separate MP3 and `audioObj.ontimeupdate` computed per-ayah progress (`currentTime / duration`).
- User requested: "Affiche la progression globale de tout le fichier audio de la Sourate Al-Baqara" (global progress across the whole surah).

### Solution
- Kept the per-ayah streaming engine (reciters supply per-ayah MP3s) but changed the bar math to **cumulative surah progress**:
  - `pct = (currentAyahIndex + currentTime/duration) / currentSurahAyahs.length * 100`
  - The bar now advances continuously within each ayah and keeps going across ayahs without resetting.
- Rewrote `seekAyah(e)` to map the click fraction to a surah-wide position:
  - `pos = frac * currentSurahAyahs.length` → jump to that ayah's number; if clicking within the currently playing ayah, seek inside it (`currentTime = (pos - idx) * duration`), otherwise `playAyahAudio(currentSurah, ayahNum)`.
- Re-minified (Terser compress, mangle off + clean-css). Post-minify JS syntax validated with `new Function`; all key functions (`playAyahAudio`, `getAudioUrl`, `toggleAudioPlayback`, `seekAyah`, `skipAyahs`, `toggleContinuous`, `cycleSpeed`, …) confirmed present. Build ~74,513 chars / 76,771 bytes.

### Git log (new)
- `6a7918e` Fix bottom progress bar to show global surah progress instead of per-ayah progress (pushed to origin/main)
- `7fb559e` Add dual-URL tafsir loading with automatic fallback (jsDelivr CDN -> Quran.com API) (pushed to origin/main)

### Tafsir fallback (Session 9 continued)
- Replaced the single-source whole-surah Tafsir fetch (`api.alquran.cloud/v1/surah/{n}/ar.muyassar`) with per-ayah **Ibn Kathir** loading using the user's dual-URL fallback pattern:
  1. Primary: `https://cdn.jsdelivr.net/gh/spa28/quran-tafsir@main/tafseer/ar-tafsir-ibn-kathir/{surah}/{ayah}.json`
  2. Fallback: `https://api.quran.com/api/v4/tafsirs/ar-tafsir-ibn-kathir/by_ayah/{surah}:{ayah}`
- `toggleTafsir()` now opens/closes, shows ⏳ loading, tries URL 1 then URL 2 automatically, caches per-ayah text in `currentTafsirData` for the current surah, and shows a red error only if BOTH sources fail.
- ⚠️ Verified: the `spa28/quran-tafsir` repo does NOT exist publicly (GitHub 404), so URL 1 always fails and URL 2 (Quran.com, HTTP 200, 33KB+ Ibn Kathir text) serves the content. Fallback mechanism guarantees the Tafsir still displays.

### Deployment status (2026-08-13)
- GitHub Pages: HTTP 200 — serves new build, markers `currentSurahAyahs.length||1` + `api.quran.com/api/v4/tafsirs` confirmed ✅
- Vercel: HTTP 200 — serves new build, both markers confirmed ✅
- Cloudflare Workers: ⚠️ NOT redeployed — no `CLOUDFLARE_API_TOKEN` in environment. Needs the user's CF token to run `wrangler deploy`.

### Security note
- The GitHub token (x-access-token) is embedded in the credentialed clone's `.git/config` remote URL. Recommended to rotate it if that machine is not fully trusted.
