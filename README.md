# Corepolis

Corepolis is now a browser-based **3D island card-builder / spatial puzzle**.

The player starts with a small island and a hand of cards. Cards create or transform the world: fields grow in stages, the island expands, nature appears or is cleared, and buildings are upgraded by placing a new card on top of the old one.

## First playable loop

The current vertical slice combines field merging, the windmill combo and the first settlement buildings:

1. A windmill starts in the center of the island.
2. Field cards can be played on any free island cell.
3. Any four orthogonally connected field pieces collapse as soon as the fourth piece is placed, regardless of shape: line, L, T, S/Z or square.
4. The collapse target is always the oldest / first field piece in that connected four-piece group; the other three cells become free again and the player receives score plus a bonus card.
5. Fields directly beside the windmill are the exception: they build from 1/4 to 4/4 and wait instead of auto-collapsing.
6. When all four windmill-side fields reach 4/4, a `New Windmill` card triggers the large combo and accelerates the blades.
7. House and Market provide settlement adjacency, while Lumbermill and Quarry run two-step resource extraction loops.
8. World actions now have placement pops, expanding-land rise, collapse motion, reward bursts, rings and combo pulses.

Trees and rocks are now productive setup cards rather than dead draws: a first nearby producer yields material and marks the resource 1/2; a second producer contact or the same producer card played on top closes the cycle, removes the depleted resource and grants score. The order is flexible: placing a new Tree/Rock inside an existing producer zone immediately triggers that producer, so the player can build the industry first or the resource first.

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
- Lucide 1.47.0 for pinned interface/card icons
- CC0 KayKit game assets loaded from a commit-pinned official GitHub repository

See `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md`.


## Card presentation and costs

Cards use dark rectangular game-card layouts with live 3D previews generated from the same models used in the world. The preview fades and blurs into the lower information area. Installation costs are shown inside the top edge of each card with Lucide Wood/Stone icons.

Costs are real gameplay rules. Resource/producers remain free so a run cannot deadlock, while settlement/expansion upgrades consume produced materials.
