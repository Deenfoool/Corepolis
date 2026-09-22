# Corepolis

Corepolis is now a browser-based **3D island card-builder / spatial puzzle**.

The player starts with a small island and a hand of cards. Cards create or transform the world: fields grow in stages, the island expands, nature appears or is cleared, and buildings are upgraded by placing a new card on top of the old one.

## First playable loop

The first vertical slice focuses on the windmill combo:

1. A windmill starts in the center of the island.
2. Field cards can be played on any free island cell.
3. Normal fields grow from stage I to IV and can be harvested individually for a small reward.
4. The four cells beside the windmill are a synergy zone: those fields grow faster and wait at stage IV.
5. When all four synergy fields are mature, a `New Windmill` card played on the old windmill triggers the large combo.
6. The four synergy fields reset to stage I, the player receives bonus cards and harvest score, and the windmill blades visibly accelerate.

The same rule language is intended to grow into lumbermills, mines, markets and other spatial production chains.

## Deployment

- Static GitHub Pages application.
- Branch: `main`.
- Published folder: `/ (root)`.
- Deployment: **Deploy from a branch**.
- No GitHub Actions.
- `.nojekyll` stays at repository root.

## Stack

- HTML / CSS / JavaScript
- Three.js via jsDelivr ES modules
- CC0 KayKit game assets loaded from a commit-pinned official GitHub repository

See `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md`.
