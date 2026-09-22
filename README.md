# Corepolis

Corepolis is now a browser-based **3D island card-builder / spatial puzzle**.

The player starts with a small island and a hand of cards. Cards create or transform the world: fields grow in stages, the island expands, nature appears or is cleared, and buildings are upgraded by placing a new card on top of the old one.

## First playable loop

The current vertical slice combines field merging, the windmill combo and the first settlement buildings:

1. A windmill starts in the center of the island.
2. Field cards can be played on any free island cell.
3. Four same-stage field pieces forming a 2×2 square visually and mechanically merge into one large field and award a bonus card.
4. A merged field upgrades as one object; a mature merged field can be harvested and restarted.
5. The four cells beside the windmill remain a synergy zone: those fields grow faster and wait at stage IV.
6. When all four synergy fields are mature, a `New Windmill` card triggers the large combo and accelerates the blades.
7. House, Market, Lumbermill and Mine cards introduce the first building adjacency engines.

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
