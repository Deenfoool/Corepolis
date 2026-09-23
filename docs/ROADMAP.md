# Corepolis — Roadmap

## Prototype 0.1 — Card island loop

- [x] Static GitHub Pages-safe runtime
- [x] Strategy camera
- [x] Small expandable island
- [x] Five-card starting hand
- [x] Card selection and world targeting
- [x] Windmill using CC0 KayKit art
- [x] Start with no constructed buildings
- [x] Unlock Mill after the first four-field combo
- [x] Place the unlocked Mill on a player-chosen tile
- [x] Unlock Market after the first connected six-house combo
- [x] Trees and rocks using CC0 KayKit art
- [x] Free field placement across the island
- [x] Any-shape four-piece field collapse using edge connectivity
- [x] Collapse into the oldest / first field piece
- [x] Free the other three cells after collapse
- [x] Bonus card and score from normal field collapse
- [x] Four-cell windmill synergy zone
- [x] Normal-field small harvest loop
- [x] Field growth stages I–IV
- [x] Mature-field waiting state
- [x] Reusable Mill card for initial construction and mature-field harvest
- [x] Four-field windmill harvest combo and reset
- [x] Continuously rotating windmill blades
- [x] Blade speed boost on large harvest
- [x] Bonus-card reward
- [x] Expand Island card
- [x] Add/remove nature cards
- [x] House card
- [x] Market adjacency engine
- [x] Lumbermill adjacency engine
- [x] Quarry production card
- [x] Placement pop animations
- [x] Island expansion rise animation
- [x] Field collapse animation
- [x] Reward card burst animation
- [x] Building / nature particle and ring feedback
- [x] Windmill combo pulse animation
- [x] Rounded island tile visual pass
- [x] Hovered-cell world highlight
- [x] Per-building construction animations
- [x] House smoke, market halo, lumbermill saw and quarry lamp idle effects
- [x] High-quality HUD and card-hand visual pass
- [x] Wood and Stone resource counters
- [x] Two-step Tree/Lumbermill resource cycle
- [x] Two-step Rock/Quarry resource cycle
- [x] Per-resource 1/2 processing marker
- [x] Shared-resource depletion by overlapping producers
- [x] Producer self-replacement to close a full local cycle
- [x] Producer teardown frees its own tile
- [x] Large extraction cycles reward bonus cards
- [x] Existing producers auto-process newly placed Tree/Rock cards
- [x] Resource cards can instantly resolve inside overlapping producer zones
- [x] Pinned Lucide icon system
- [x] Real Wood/Stone card installation costs
- [x] Disabled/dimmed unaffordable cards
- [x] Runtime 3D object previews for cards
- [x] Dark rectangular card redesign with preview fade/blur
- [x] Rebuilt farmland visuals with furrows and staged crop density
- [x] Quaternius Wheat GLB stages replace procedural crop stalks
- [x] Crop assets moved from repository root to `assets/crops/`
- [x] Mature wheat heads and wind-sway animation
- [x] Premium mill-adjacent field treatment
- [x] Enhanced four-field collapse animation
- [x] Objective progress meter and richer field status chips
- [ ] Browser play-test and balance pass

## Prototype 0.2 — More spatial engines

- roads / adjacency chains
- card rarity and discard choices
- preview ghost before committing a card
- better island coast geometry
- sound effects and richer harvest presentation
- save/load

## Prototype 0.3 — Run structure

- progression / unlocks
- card drafting choices
- island biomes
- goals and fail states
- combo encyclopedia
- seeded runs
- tutorial

- [x] Five-card hand limit with visible card-back reserve stack
- [x] Bonus cards overflow into reserve and refill the hand before random draws
- [x] Removed obsolete camera-help HUD

- [x] Lower-right reserve deck with enlarged Corepolis card back
- [x] Reserve-to-hand flight animation and reserve gain pulse
- [x] Reserve count badge while keeping individual backs visible
- [x] Hand cards no longer replay deal animation on every selection

- [x] Seamless 8-neighbour terrain autotiling
- [x] Center / edge / outer-corner / inner-corner / channel / peninsula / island terrain classes
- [x] Five deterministic visual variants per terrain tile
- [x] Layered grass, soil, submerged stone and irregular cliff walls
- [x] Coastline micro-detail and rare hero-edge decoration
- [x] Rebuild neighbouring terrain after island expansion without touching tile content
- [x] GPU cleanup for superseded terrain geometry/materials
