# Corepolis — Game Design

## High concept

Corepolis is a **3D island card-builder and spatial combo game**.

The map is not given to the player up front. Cards both build the settlement and reshape the island itself. The central challenge is deciding where to spend limited cards so that local combinations grow into larger reward loops.

## Core rules

- The player keeps a hand of cards.
- Cards are played onto cells or existing objects.
- Some cards create things: fields, trees, rocks and later buildings.
- Some cards transform things: clear nature, upgrade buildings, expand land.
- Spatial relationships matter more than raw resource totals.
- Mature structures can wait for a specific trigger card instead of resolving automatically.

## Field collapsing

- A Field card creates one field piece on any free land cell.
- Normal fields do not need a square. **Any four orthogonally connected field pieces** qualify, regardless of shape.
- As soon as the fourth connected piece is placed, those four pieces collapse into the oldest / first piece from that group.
- The other three cells become free again immediately after the collapse animation.
- A collapse awards score and a bonus card.
- This makes placement order meaningful: the first field piece determines where the compacted field remains.
- Diagonal-only contact does not connect a group; pieces must touch by an edge.

## Windmill loop

The prototype proves the key rule using one building:

- A windmill occupies the center cell and creates a four-cell synergy zone at north/east/south/west.
- Fields may be placed on **any free land cell**; the windmill never hard-locks field placement.
- Normal fields advance I → II → III → IV one stage per Field card.
- A mature normal field can be harvested with another Field card for a small reward and then resets to stage I.
- Fields directly beside the windmill are the exception to normal collapsing: each position accumulates from 1/4 to 4/4 one card at a time.
- A 4/4 windmill-side field waits instead of resolving individually.
- When all four synergy cells are mature, the system waits for a `New Windmill` card.
- Playing that card on the current windmill triggers the large combo, returns the four synergy fields to stage I and grants bonus cards and score.
- Windmill blades rotate continuously and briefly accelerate when the large harvest combo fires.

This keeps placement free while preserving a strong optimization puzzle: ordinary four-piece groups compact automatically, while the four mill-side positions deliberately wait for the building upgrade trigger.

## Settlement and production buildings

- **House** — a basic settlement building and a target for market adjacency.
- **Market** — scores more for every neighboring House; two or more nearby houses also grant a card.
- **Lumbermill** — processes adjacent Trees.
- **Quarry** — processes adjacent Rocks.

### Two-step resource extraction

Trees and Rocks are setup resources, not filler cards.

1. Placing the matching producer next to a resource performs its first processing step.
2. The player immediately gains one unit of Wood or Stone.
3. The resource stays on the map and is visibly marked `1/2`.
4. If a different matching producer later touches the same resource, that is its second processing step: the resource disappears, the cell is freed, and the player gains score plus another material unit.
5. Alternatively, playing a second Lumbermill/Quarry card directly on top of an existing matching producer closes that producer's whole local cycle: every adjacent matching resource is processed to completion, the producer itself disappears, and its tile becomes free.
6. Closing a large cycle grants bonus cards: 3+ depleted cells gives one card; 5+ gives two.
7. The timing is symmetric: if a Tree or Rock card is placed later inside an existing producer's range, that producer immediately applies its processing step. A resource placed into the overlap of two matching producers can therefore be created and fully depleted in the same turn.

This creates deliberate overlap puzzles: two producers can share one resource without deleting every resource around either building. Only cells that reach their second matching processing step are exhausted.

## World manipulation

The initial deck also contains:

- Expand Island — create a new land cell adjacent to the current island.
- Plant Forest — place a tree on empty land.
- Rocks — add stone obstacles/resources.
- Clear — remove a tree or rock.

Future systems should reuse the same readable verbs rather than introducing unrelated UI-heavy subsystems.

## Visual direction

- Cozy stylized 3D.
- Strategy camera from above at an angle.
- Strong silhouettes and readable stages.
- A small diorama-like island in open water.
- Free assets only, with license provenance documented.


## Animation language

Gameplay actions should communicate cause and reward without relying only on UI text:

- placed fields, buildings, trees and rocks pop into the scene with a soft ring;
- new island cells rise out of the water;
- four normal field pieces visibly fly into the oldest field before the three source cells clear;
- card rewards burst upward as small card-shaped particles;
- score / reward events use radial particle bursts;
- clearing nature shrinks the removed object before the tile is freed;
- the windmill combo pulses the mill and nearby fields while the blades accelerate.


## Card economy and presentation

Cards are designed as object-first game cards rather than generic HTML buttons:

- the upper section is a rendered preview of the actual 3D object;
- the preview softens and blurs into the lower text area;
- the installation cost is always visible inside the top edge;
- Wood and Stone cost chips use Lucide icons;
- unaffordable cards stay visible in the hand but are dimmed and cannot be selected;
- resource cards and the two basic producers are free, preventing opening-hand deadlocks.

Current installation costs:

- Field — free
- Tree — free
- Rock — free
- Lumbermill — free
- Quarry — free
- Clear — 1 Wood
- Expand Island — 1 Wood + 1 Stone
- House — 2 Wood
- Market — 2 Wood + 2 Stone
- New Windmill — 4 Wood + 3 Stone

The cost is paid only after a legal action is committed.


## Farmland visual language

Fields use a dedicated borderless farmland renderer rather than a framed plot:

- the old raised perimeter edging is removed completely;
- the soil is a low rounded low-poly mass with no lip or fence around it;
- five sculpted low-poly ridges form soft rounded furrows instead of flat rectangular strips;
- stage I uses `Wheat_1.glb` in sparse young rows;
- stage II uses `Wheat_2.glb` with denser growth;
- stage III uses `Wheat_3.glb` as taller pre-harvest wheat;
- stage IV uses `Wheat_4.glb` as the mature crop;
- small deterministic soil clods add surface variation without noisy random placement;
- neighbouring Field cells extend their soil surface to the shared grid boundary, removing the visual gap between plots;
- adjacency is tracked in the field visual signature so exposed edges are rebuilt when a neighbour appears or disappears;
- mill-adjacent fields use warmer soil rather than a perimeter ring;
- crop rows sway continuously and grow upward with a staggered animation;
- field collapse pulls all four plots toward the oldest piece and finishes with a stronger harvest burst.

The Field card preview is rendered from this same runtime field model, so card art and world art cannot drift apart.

The crop meshes come from Quaternius Ultimate Crops Pack (CC0) and are stored locally as optimized GLB files. Corepolis owns the procedural soil, rounded furrows, borderless merging, wind motion and collapse effects around those meshes.


## Building unlock progression

Corepolis now starts with no constructed buildings on the island.

- The first orthogonally connected four-field collapse unlocks **Mill**.
- Unlocking Mill immediately places one Mill card into the active hand (displacing a normal card into reserve if the hand is full).
- Until that first field combo, Mill is excluded from random draws.
- The Mill is placed by the player on any empty land tile; its four cardinal neighbours become its growth zone.
- After the Mill is built, a later Mill card can be played on the existing Mill when all four adjacent fields reach 4/4 to trigger the large harvest.
- The first orthogonally connected group of six Houses unlocks **Market**.
- Until that six-house combo exists, Market is excluded from random draws.
- Unlocking Market immediately gives the player one Market card while preserving the five-card hand limit.

Unlocks are one-time progression events and do not consume the triggering houses.


## Seamless island terrain system

The island is no longer rendered as repeated rounded boxes. Every land cell has a stable terrain root rebuilt from its eight neighbours.

The top surface uses the exact grid size and a shared elevation, so cardinal neighbours meet without gaps, bevel seams or height steps. Visual irregularity is kept away from shared seams and moved to exposed coastlines, cliff walls and interior overlays.

Autotile classes:
- `center` — four cardinal neighbours;
- `edge` — one exposed cardinal side;
- `outer-corner` — two adjacent exposed sides;
- `inner-corner` — all cardinal neighbours exist but a diagonal corner is open;
- `channel` — opposite sides are exposed;
- `peninsula` — only one cardinal neighbour remains;
- `island` — fully isolated cell.

Each coordinate deterministically selects one of five visual variants. The variation affects cliff faceting, embedded rocks, grass tufts and subtle interior tone without moving the shared tile boundary.

Rare coastline cells receive a restrained hero treatment with an extra stone/flower cluster. Expansion rises with the previous coastline still visible; after the animation the new cell and its eight-neighbour area are rebuilt so obsolete cliff faces disappear and the joined surface becomes seamless.


### Organic coastline correction

The first procedural terrain pass preserved a square top plate and added a separate green coast lip. That produced an artificial slab/concrete-formwork silhouette and has been removed.

The coastline is now the actual boundary of the grass surface. Every exposed cardinal edge is sampled as an irregular deterministic curve. Exterior corners where two sides are open are cut inward independently, so isolated cells and outer corners do not keep a square silhouette. The cliff mesh starts from those exact same top-edge points, which removes the visual split between a rectangular grass cap and a separate cliff.

Only seams that touch another land cell remain exact grid boundaries. Those seams are internal and share the same flat material/elevation, while exposed land-water boundaries are organic.


### Coast seam stitching

Outer coastline corners now share explicit cliff row geometry. Adjacent cliff sides are no longer allowed to terminate independently: every exposed outer corner receives a bridge mesh spanning all cliff depths, eliminating triangular holes.

The grass/soil contact was also rebuilt. The cliff's first row now reaches the actual grass elevation and tucks slightly beneath the top surface. A thin irregular turf skirt shares the same coastline profile and blends green grass into brown soil without a floating strip or straight trim geometry.

Coastline sampling was increased from 9 to 13 segments per side. This gives smoother bays and protrusions while keeping interior tile seams exact.


## Spatial field growth

Field growth is now driven by placement, not by stacking Field cards on the same cell.

Normal fields:
- a single isolated field is stage 1;
- adding an orthogonally adjacent second field makes the whole connected group stage 2;
- a third connected field makes all three stage 3;
- the fourth makes all four stage 4, then the existing four-field combo resolves;
- placing another Field card on an occupied Field cell is no longer allowed.

Mill fields use the same spatial idea, with the Mill acting as the shared centre. One occupied cardinal Mill slot means stage 1 for all planted Mill fields, two slots mean stage 2, three mean stage 3, and all four slots mean stage 4 / harvest-ready.

A large Mill harvest clears the four planted field cells after collecting them. This is required by the spatial model: the next crop cycle must be grown by placing neighbouring fields again rather than repeatedly stacking cards on existing plots.

The large numeric stage sprites above fields were removed. Wheat_1 through Wheat_4 are now the primary stage indicator; exact stage remains available in the objective panel and tile information.


## Maritime progression

The maritime branch begins with a **Pier** card.

### Pier
- Pier placement targets a water grid cell and requires cardinal contact with land.
- The Pier automatically faces away from its shore attachment.
- A small boat lives beside every Pier and receives a restrained water bob animation.
- The first Pier opens a one-time expedition choice and unlocks the Fishing Shop.
- A Pier built on a landmass different from an existing Pier creates a sea route: +125 score and +2 cards.

### First expedition choice
**Explore the archipelago**
- gain 7 Island Tile cards.

**Light a fire in the distance**
- gain 1 Lighthouse card;
- gain 2 Island Tile cards.

Both paths also grant the first Fishing Shop card.

### Island Tile
Island Tile raises a new terrain cell from the sea. Normally it must touch existing land. A Lighthouse extends this rule: Island Tiles can also be founded within 3 grid cells of any Lighthouse even with open water between them.

### Lighthouse
A Lighthouse can be placed on normal empty land, or directly into water up to about 4 grid cells from known land. Water placement raises a one-cell lighthouse island first. This gives the player a deliberate way to seed distant archipelagos.

### Fishing Shop
Fishing Shop is a land building unlocked by the first Pier.
- adjacent Pier: +1 card;
- at least 2 nearby Houses: +1 card;
- satisfying both at once creates a **Port Quarter** combo for one additional card (3 total).
The building also awards placement score scaled by nearby houses and piers.

### TIDELINE visual source
Corepolis now vendors the usable models from the **TIDELINE — Coastal Harbor** free sample by Candle Light under `assets/tideline/`.

The Pier is assembled from the real TIDELINE `Boarding_Plank`, `Railing_A`, `Bollard_A`, `Anchor_A`, `Buoy_Garland`, `Bell_Stand_A` and `Dock_Chair_A` models. The Fishing Shop uses `Boat_House_A`, `Bait_Box_A` and `Cargo_Barrel_A`.

The free sample does not contain a standalone boat or lighthouse model, so only those two visuals remain procedural in `src/marine-visuals.js`. They are isolated so they can be deleted in the same change that adds matching TIDELINE assets later.
