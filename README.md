# Corepolis

**Corepolis** is a browser-based 3D city-builder set inside a computer.

The PC case is the world, the motherboard is the city map, and hardware-inspired districts provide compute, memory, storage, power, cooling and network capacity.

## Deployment

Corepolis is designed for GitHub Pages.

- Source and published branch: `main`
- Published folder: `/ (root)`
- Deployment method: **Deploy from a branch**
- No GitHub Actions are required.
- `.nojekyll` is committed at the repository root.
- Public base path: `/Corepolis/`

## Prototype goal

The first playable slice focuses on a simple city-building loop:

1. place infrastructure;
2. generate capacity;
3. accept growing workload;
4. detect bottlenecks;
5. expand or rebalance the city.

See `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md` for the current design direction.
