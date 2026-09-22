# Corepolis

Corepolis is now a browser-based **3D island card-builder / spatial puzzle**.

The player starts with a small island and a hand of cards. Cards create or transform the world: fields grow in stages, the island expands, nature appears or is cleared, and buildings are upgraded by placing a new card on top of the old one.

## First playable loop

The first vertical slice focuses on the windmill combo:

1. A windmill starts in the center of the island.
2. Field cards can be played on its north/east/south/west cells.
3. Replaying a field card grows that field from stage I to IV.
4. When all four directions reach stage IV, the fields wait instead of auto-resolving.
5. A `New Windmill` card played on the old windmill triggers the combo.
6. The four fields reset to stage I and the player receives bonus cards and harvest score.

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
