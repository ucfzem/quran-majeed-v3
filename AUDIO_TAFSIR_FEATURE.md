# Tafsir Feature — Quran Majeed v3

Added: July 22, 2026

## Summary

Added per-ayah inline Arabic tafsir (Quran commentary) to the Quran Majeed v3 single-page application. Data is fetched from api.alquran.cloud.

## What was added

### Tafsir
- **📖 Per-ayah tafsir buttons** — Click to expand inline Arabic tafsir below the ayah
- **Tafsir source**: `api.alquran.cloud/v1/ayah/{surah}:{ayah}/ar.muyassar` (Tafsir Al-Muyassar, simplified Arabic tafsir)
- **In-memory cache** — Once fetched, tafsir is cached for the session
- **Inline display** — Gold right-border, Amiri font, appears below translation

### Files modified
- `index.html` — CSS + HTML + JavaScript for tafsir

### New JavaScript functions
- `fetchTafsir(surah, ayah)` — Fetch + cache tafsir from API
- `toggleAyahTafsir(surah, ayah)` — Expand/collapse inline tafsir

### New state variables
- `tafsirCache` — `{}` keyed by `"surah:ayah"`

### API endpoints used
- **Tafsir**: `https://api.alquran.cloud/v1/ayah/{S}:{A}/ar.muyassar` (returns tafsir text in `data.text`)

## Test links
- **GitHub repository**: https://github.com/ucfzem/quran-majeed-v3
- **Vercel deployment**: https://quran-majeed-v3.vercel.app

## How to test
1. Open the Vercel URL
2. Click ☰ to select a surah
3. Click 📖 on any ayah → Arabic tafsir expands below
4. Click 📖 again → tafsir collapses
5. Toggle dark mode → all new elements respect theme variables
