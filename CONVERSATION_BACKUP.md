# Conversation Backup — 2026-07-23 (Session 3)

## Changes Made

### 1. Screen Wake Lock API
- Added `navigator.wakeLock.request('screen')` when audio plays
- Prevents screen from dimming/turning off during playback
- Automatically releases when audio stops
- Re-acquires wake lock on page visibility change if still playing

### 2. NoSleep.js Fallback for Via Browser
- Hidden looped video element keeps device awake (works in all browsers)
- Activates when audio starts, stops when audio stops
- NoSleep.js video: playsinline, muted, 1x1px offscreen
- Fallback when Wake Lock API is unsupported (e.g. Via Browser)

### 3. Background Audio Keep-Alive
- Periodic 5-second interval to resume AudioContext when hidden
- Prevents browser suspension of background audio on Android/iOS
- Complements existing oscillator hack for iOS Safari

### 3. Conversation Backup
- This file updated for Session 3

### 4. Deployments
- GitHub Pages (auto): https://ucfzem.github.io/quran-majeed-v3/
- Vercel: https://quran-majeed-v3.vercel.app
- Cloudflare Workers: https://quran-majeed.azer-tyu199p.workers.dev

## Git Log
```
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
