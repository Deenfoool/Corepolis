# Corepolis — Architecture

## Deployment constraints

Corepolis is a fully static GitHub Pages application:

- canonical public path: `/Corepolis/`;
- no backend;
- no GitHub Actions;
- deployment from `main` → `/ (root)`;
- `.nojekyll` remains at repository root.

## Stack

The project stays build-tool free:

- HTML
- CSS
- JavaScript ES modules
- Three.js from jsDelivr
- Lucide for interface icons
- GLTF / GLB runtime assets

## Runtime modules

- `src/config.js` — card definitions, deck weights and grid constants.
- `src/models.js` — selected local model locations, deterministic coordinate-based variants and the commit-pinned sawmill.
- `src/terrain.js` — procedural island top, coast, cliffs, terrain variants and shoreline water effects.
- `src/island-fragments.js` — territory shapes, 90° rotation, embedded Forest/Rock generation, adaptive resource bias, card mini-map and world ghost preview.
- `src/marine-visuals.js` — isolated procedural boat/lighthouse visuals that can be replaced when final assets exist.
- `src/water-v4-macrowaves.js` — real vertical macro-wave displacement for the shared ocean mesh.
- `src/main.js` — scene/state orchestration, card economy, placement, progression, production, maritime logic, animations and UI binding.

Superseded runtime modules are deleted instead of retained as fallbacks.

## State model

Every land cell is stored by integer `x,z` key and owns a stable visual root plus mutable gameplay content.

Important cell data includes:

- coordinate/key;
- terrain root and autotile classification;
- content type;
- optional field stage/order;
- resource-processing state;
- ambient visual objects.

Card instances have a unique runtime id and type. Territory cards additionally keep their generated fragment definition and current rotation. Shape/content are fixed at draw time so the card preview always matches the eventual placement.

A territory placement is one atomic gameplay action even though it may create several land cells. The complete fragment is validated before any card cost or placement is committed.

## Rendering and picking separation

Visual water, shoreline foam and territory ghost previews are not gameplay hit targets. Placement continues to use the dedicated invisible flat `waterPlane`, while land/content picking uses the `world` group. This keeps animated water geometry from changing placement coordinates.

## Asset policy

Only assets with clear redistribution/use terms are accepted. Provenance is documented in `THIRD_PARTY_NOTICES.md` and related docs.

When an asset, module or fallback is replaced, the obsolete path/code is removed in the same change rather than left dormant.

`src/model-layout.js` anchors geometry inside a separate placement pivot. All local RTS models share a 1.5 world scale; the external Pirate Kit sawmill is fitted to 2.6 × 2.4 world limits. Tile translations and rotations apply only to the pivot, preserving the centred footprint and ground contact. Card framing has a separate size limit.
