# TIDELINE integration

Source: https://candlelightgame.itch.io/tideline-coastal-harbor

Corepolis uses selected models from Candle Light's **TIDELINE — Coastal Harbor** free sample.

Public pack information verified on 2026-09-23:
- Free Sample: 12 selected models.
- Formats distributed by the author: GLB + FBX.
- Personal and commercial project use is allowed under the included license.
- Attribution is not required.
- Redistribution/resale as standalone assets or reusable asset packs is not allowed.

## Runtime assets kept in Corepolis

The following GLBs are actively used and stored in `assets/tideline/`:

- `Boarding_Plank.glb`
- `Railing_A.glb`
- `Bollard_A.glb`
- `Anchor_A.glb`
- `Buoy_Garland.glb`
- `Bell_Stand_A.glb`
- `Dock_Chair_A.glb`
- `Boat_House_A.glb`
- `Bait_Box_A.glb`
- `Cargo_Barrel_A.glb`

`Boat_Stand_A.glb` and `Boat_Wash_Station.glb` were not used by the current game and were removed rather than retained as dead assets.

The Pier and Fishing Shop now use the actual TIDELINE models. The free sample does not include a standalone boat or lighthouse, so those two visuals remain isolated procedural implementations in `src/marine-visuals.js` until matching licensed models are supplied.
