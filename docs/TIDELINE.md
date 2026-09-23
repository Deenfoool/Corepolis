# TIDELINE integration

Source: https://candlelightgame.itch.io/tideline-coastal-harbor

Corepolis is targeting Candle Light's **TIDELINE — Coastal Harbor** for its production maritime visuals.

Public pack information verified on 2026-09-23:
- Free Sample: 12 selected models.
- Formats: GLB + FBX.
- Free sample size shown by itch.io: 295 kB.
- Personal and commercial project use is allowed under the included license.
- Attribution is not required.
- Redistribution/resale as standalone assets or reusable asset packs is not allowed.

The itch.io download is gated behind the interactive "No thanks, just take me to the downloads" flow. No TIDELINE binary is currently vendored in this repository.

When the archive is available, the first required mappings are:
1. pier/dock -> Pier world object and card preview;
2. small boat -> Pier companion and route animation;
3. lighthouse -> Lighthouse building and card preview;
4. fishing shop / fishing structure -> Fishing Shop building and card preview.

The procedural models in `src/marine-visuals.js` are currently active so the gameplay branch is testable. They must be deleted in the same change that replaces them with the TIDELINE GLBs.
