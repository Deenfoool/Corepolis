# Corepolis — Architecture

## Deployment constraint

Corepolis must run as a fully static application on GitHub Pages:

- canonical public path: `/Corepolis/`;
- no required backend;
- no GitHub Actions;
- deployment directly from `main` → `/ (root)`;
- assets must use relative URLs;
- runtime 3D assets must be stored in the repository rather than fetched from third-party model hosts;
- `.nojekyll` must remain at the repository root.

## Prototype stack

Prototype 0.1 intentionally uses browser-native ES modules:

- HTML
- CSS
- JavaScript
- Three.js loaded as an ES module from jsDelivr

This removes the build pipeline as a failure point while the gameplay direction is still being validated.

A later migration to TypeScript/Vite remains possible without changing the gameplay model.

## Modules

Current:

- `src/config.js` — building definitions and board constants.
- `src/main.js` — rendering, camera, build mode, simulation and UI binding.
- `src/models.js` — local GLB paths and placement metadata.
- `assets/models/` — self-contained hardware models used by the runtime.
- `assets/environment/` — self-contained room, desk and computer-case GLB assets.

Target split after prototype validation:

- `src/core/`
- `src/world/`
- `src/buildings/`
- `src/simulation/`
- `src/economy/`
- `src/traffic/`
- `src/rendering/`
- `src/input/`
- `src/ui/`
- `src/save/`

## Simulation direction

The simulation should remain deterministic enough to save and reproduce.

Buildings expose capacity and costs. Workload creates demand. System health is derived from capacity/demand ratios, power availability and thermal balance.

The first prototype intentionally avoids per-process simulation.

## Scene composition

The playable motherboard sits inside an open computer chassis lying flat on a desk. The room, desk and chassis use local CC0 GLB assets from `assets/environment/`; no procedural duplicates or third-party runtime requests remain.
