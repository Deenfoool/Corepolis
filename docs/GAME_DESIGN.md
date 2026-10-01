# Corepolis — Game Design

## High concept

Corepolis is a **3D island card-builder and spatial combo game**. The map is built during the run: cards create land, nature, fields and buildings, while adjacency turns individual placements into larger production and scoring loops.

The central rule is simple: **space is the puzzle**. Resources matter, but they must not prevent the player from getting enough land to keep playing.

## Core rules

- The active hand contains up to five cards; excess rewards go to Reserve.
- Cards are played onto land cells, existing objects or water targets.
- Spatial relationships matter more than raw resource totals.
- Territory expansion is free; the challenge is fitting useful shapes into the island.
- Wood and Stone are produced through spatial resource chains and are spent on selected buildings.
- Major combinations grant score and additional cards.

## Fields and Mill

### Normal fields

- A Field card creates one field piece on any free land cell.
- Orthogonally connected normal fields share a visual growth stage equal to the connected group size, capped at stage IV.
- Any four orthogonally connected normal field pieces form a combo regardless of shape.
- On the fourth placement, those four pieces collapse into the oldest field cell.
- The other three cells become free again.
- The combo grants score and a bonus card.
- The first such combo unlocks the Mill card.

### Mill loop

- The player chooses where to build the unlocked Mill.
- Its north/east/south/west neighbours form the Mill growth zone.
- Mill-side fields do not use the normal four-field collapse.
- Their shared stage is based on how many of the four Mill slots are planted.
- When all four reach IV, a later Mill card can be played on the existing Mill to trigger the large harvest.
- The large harvest grants score/cards and clears the four Mill fields for a new cycle.
- Mill blades rotate continuously and accelerate during the large harvest.

## Settlement progression

- **House** is the basic settlement building.
- The first connected group of six Houses unlocks **Market**.
- **Market** scores from nearby Houses.
- **Fishing Shop** rewards combinations of housing and port infrastructure.

Locked progression buildings are excluded from random draws until their unlock condition is met.

## Resource economy

Trees and Rocks are productive setup pieces rather than dead obstacles.

### Wood

1. Forest exists on a land cell.
2. A nearby Lumbermill performs the first processing step and grants Wood.
3. The Forest remains marked as processed `1/2`.
4. A second matching processing step removes the Forest and grants the next reward.

### Stone

Rock and Quarry use the same two-step structure.

A resource can be shared by overlapping producers. Playing a matching producer card on top of an existing producer can also close its local production cycle. New Forest/Rock cells placed inside an existing producer range are processed immediately.

### Anti-deadlock rule

Corepolis must not require resources to obtain the space needed to create more resources.

Therefore:

- Field — free
- Forest — free
- Rock — free
- Lumbermill — free
- Quarry — free
- **Territory Expansion — free**
- Clear — 1 Wood
- House — 2 Wood
- Market — 2 Wood + 2 Stone
- Mill — 4 Wood + 3 Stone

Costs are paid only after a legal placement is committed.

## Territory fragments

`Расширение территории` is the only normal land-expansion card. The obsolete paid single-cell `Expand Island` card no longer exists.

A territory card is generated when it is drawn and keeps the same shape/resources until played.

### Shapes

Current pool:

- `1×1`
- `1×2`
- `1×3`
- `L3`
- `Z4`
- `2×2`

The pool is weighted toward useful small/medium shapes; larger or awkward shapes appear less often.

### Embedded contents

Every fragment cell is predetermined as one of:

- empty;
- Forest;
- Rock.

Embedded resources are part of the territory card itself and do not consume additional cards. After placement they become normal Forest/Rock cells and immediately interact with existing Lumbermills/Quarries.

### Soft anti-bad-RNG

Resource placement is adaptive but deliberately non-deterministic:

- low Wood slightly increases the chance that a new territory fragment contains Forest;
- low Stone slightly increases the chance that it contains Rock;
- larger shapes can occasionally contain two resource cells;
- when the economy is healthy, empty strategic fragments become more common again.

The system never guarantees the missing resource. It only shifts probabilities enough to reduce long resource droughts without making the deck feel scripted.

### Preview and rotation

- The card shows a compact mini-map of its exact shape.
- Forest and Rock cells are visible on that mini-map before selection.
- Hovering over water shows a ghost of the **entire fragment**, including its resource locations.
- Valid placement is shown in green; collisions/out-of-bounds placement is shown in red.
- `Q / E` rotate a selected territory fragment in 90° steps.
- While a territory card is selected, `Q / E` rotate the fragment instead of the camera.
- Placement is atomic: either the entire shape fits or nothing is committed.

### Placement rules

A normal fragment may be placed when:

- every cell is within the map;
- every cell is currently water;
- no cell overlaps a Pier or other water structure;
- at least one cell touches existing land by an edge.

A Lighthouse allows detached founding: if the fragment does not touch existing land, every cell of the fragment must be inside Lighthouse range.

All cells rise from the sea together, then the surrounding terrain is rebuilt so the new land joins the existing organic coastline seamlessly.

## Terrain system

Land is rendered by neighbour-aware procedural autotiling rather than repeated boxes.

- Internal cardinal seams stay on the exact grid so connected land is seamless.
- Exposed coastlines use deterministic irregular sampled profiles.
- Grass top, turf transition and cliff rows reuse the same coast profile.
- Exposed corners are stitched through all cliff depths.
- Each coordinate selects a deterministic visual variant.
- Terrain is rebuilt only around changed cells; fields/buildings/resources are kept separately and survive terrain refreshes.

Terrain classes include center, edge, outer corner, inner corner, channel, peninsula and isolated island.

## Farmland visual language

Fields use full-tile rounded low-poly farmland:

- borderless soil fills the logical tile;
- five faceted rounded furrows run across the tile;
- neighbouring field furrows align across shared edges;
- flat-shaded faces keep the low-poly look;
- Wheat stages use local Quaternius `Wheat_1.glb` through `Wheat_4.glb`;
- crop rows sway in wind;
- Mill-adjacent fields use warmer soil rather than a glowing perimeter;
- the soil body is partly sunk into the island surface.

## Maritime progression

### Pier

- Pier targets a water grid cell touching land by an edge.
- It automatically faces away from the connected shore.
- A boat appears beside it.
- The first Pier unlocks the Fishing Shop and opens a one-time expedition choice.

### First expedition

**Explore the archipelago**
- receive 7 generated Territory Fragment cards.

**Light a fire in the distance**
- receive 1 Lighthouse;
- receive 2 generated Territory Fragment cards.

Both choices also grant the first Fishing Shop card.

### Lighthouse

A Lighthouse can be built on empty land or founded in nearby water. A water placement raises a one-cell Lighthouse island. Its range enables detached territory-fragment placement.

### Fishing Shop

- nearby Pier: +1 card;
- at least 2 nearby Houses: +1 card;
- both conditions together add another card and create the Port Quarter combo.

### Sea routes

A Pier built on a different connected landmass from another Pier creates a sea route, grants score/cards and plays a boat travel animation.

## Water

Corepolis uses stylized low-poly animated water designed for static GitHub Pages/WebGL:

- a broad shared water mesh covers the scene;
- Perlin-based deformation creates irregular non-periodic waves;
- Water V4 also performs real vertical macro displacement of water vertices;
- individual triangular faces remain visible through derivative-based faceted lighting;
- Fresnel and restrained sunlight glints provide shape without bright blotchy masks;
- submerged cliffs remain visible through translucent water;
- shallow-water caustics and foam follow the actual procedural coastline;
- visual water is excluded from gameplay raycasting; an invisible flat plane remains the placement target;
- realtime planar reflections are intentionally avoided.

## Hand, Reserve and card presentation

- Hand limit: 5.
- Overflow rewards go to the visible Reserve stack.
- Playing a card promotes Reserve before drawing randomly.
- Cards use runtime 3D previews, name/description and visible Wood/Stone costs.
- Territory cards additionally show their shape/resource mini-map.
- Unaffordable cards remain visible but are disabled.

## Visual direction

- cozy stylized 3D;
- strategy/isometric-readable camera;
- strong silhouettes and low-poly faceting;
- a small diorama-like island in open water;
- gameplay state should be readable primarily from the world, not from large floating labels.

## Asset sources

- KayKit — primary land/building environment assets;
- Quaternius — Wheat stages;
- TIDELINE Coastal Harbor free sample — Pier/Fishing Shop pieces;
- Three.js — rendering;
- Lucide — UI icons.

Licensing/provenance is maintained in `THIRD_PARTY_NOTICES.md` and the related docs.
