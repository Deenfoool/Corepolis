# Corepolis — Architecture

## Deployment constraint

Corepolis must run as a fully static application on GitHub Pages:

- canonical public path: `/Corepolis/`;
- no required backend;
- no GitHub Actions;
- deployment from the `gh-pages` branch;
- assets must use relative URLs.

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
