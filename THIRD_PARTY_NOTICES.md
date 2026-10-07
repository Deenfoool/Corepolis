# Third-Party Notices

## Quaternius Ultimate Fantasy RTS

Corepolis uses locally uploaded models from **Ultimate Fantasy RTS**, created by **Quaternius**.

- Source: https://quaternius.com/packs/ultimatefantasyrts.html
- License: **Creative Commons Zero (CC0) 1.0 Universal**
- Local files: `assets/quaternius/ultimate-fantasy-rts/`
- Attribution is not required; provenance is retained here.

Selected runtime models:

- Ports: `Port_FirstAge_Level3.gltf`, `Dock_FirstAge.gltf`, `Port_SecondAge_Level2.gltf`, `Port_SecondAge_Level3.gltf`
- Homes: `Houses_SecondAge_1_Level2.gltf`, `Houses_SecondAge_1_Level1.gltf`, `Houses_SecondAge_2_Level1.gltf`, `Houses_SecondAge_2_Level2.gltf`
- Market: `Market_SecondAge_Level3.gltf`
- Quarry: `Mine.gltf`
- Rocks: `Resource_Rock_1.gltf`, `Resource_Rock_2.gltf`, `Resource_Rock_3.gltf`
- Trees: `Resource_PineTree_Group.gltf`, `Resource_Tree_Group.gltf`
- Mill: `Windmill_SecondAge.gltf`
- Port warehouse: `Storage_SecondAge_Level2.gltf`

The mill has been adapted locally: rotor fabric and wooden blades/hub are separated from the static structure into a pivot node for rotation. Original materials and vertex positions are preserved.

## Quaternius Pirate Kit

Corepolis retains the **Sawmill.glb** model from the Quaternius Pirate Kit.

- Creator: Quaternius
- Source: https://quaternius.com/
- License: **Creative Commons Zero (CC0) 1.0 Universal**
- Runtime mirror: `eitan567/VerdantIsle`
- Pinned commit: `c850a2840081a30442f252d6e2ce9db4d02362ee`

## Quaternius Ultimate Crops Pack

Corepolis uses the Wheat growth models from **Ultimate Crops Pack**, created by **Quaternius**.

- Source: https://quaternius.com/packs/ultimatecrops.html
- License: **Creative Commons Zero (CC0) 1.0 Universal**
- Original pack formats: FBX / OBJ / Blend
- Runtime files: locally converted GLB files in `assets/crops/`
- Used stages: `Wheat_1.glb`, `Wheat_2.glb`, `Wheat_3.glb`, `Wheat_4.glb`

The local GLB files preserve the crop art while allowing direct loading in the browser runtime.

## Three.js

Three.js is loaded as an ES module from jsDelivr at version `0.180.0`.

## Lucide

Corepolis uses the Lucide icon library for interface and card icons.

- Project: https://lucide.dev/
- Runtime package: `lucide@1.47.0`
- License: **ISC**
- Runtime delivery: pinned UMD package from unpkg.
