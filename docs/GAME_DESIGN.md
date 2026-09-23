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

Fields use a dedicated farmland renderer rather than placeholder stalks:

- stage I is mostly cultivated soil with sparse young rows;
- stage II fills out into clear green crop rows;
- stage III becomes taller and shifts toward harvest colors;
- stage IV is dense golden wheat with visible grain heads;
- mill-adjacent fields use a warmer highlight ring;
- crop rows sway continuously and grow upward with a staggered animation;
- field collapse pulls all four plots toward the oldest piece and finishes with a stronger harvest burst.

The Field card preview is rendered from this same runtime field model, so card art and world art cannot drift apart.
