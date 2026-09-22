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

## Windmill loop

The prototype proves the key rule using one building:

- A windmill occupies the center cell and creates a four-cell synergy zone at north/east/south/west.
- Fields may be placed on **any free land cell**; the windmill never hard-locks field placement.
- Normal fields advance I → II → III → IV one stage per Field card.
- A mature normal field can be harvested with another Field card for a small reward and then resets to stage I.
- Fields inside the windmill synergy zone grow faster: after placement, each additional Field card advances them by two stages.
- Mature synergy fields wait instead of resolving individually.
- When all four synergy cells are mature, the system waits for a `New Windmill` card.
- Playing that card on the current windmill triggers the large combo, returns the four synergy fields to stage I and grants bonus cards and score.
- Windmill blades rotate continuously and briefly accelerate when the large harvest combo fires.

This keeps placement free while preserving a strong optimization puzzle: fields work anywhere, but building around the windmill creates a faster and more valuable engine.

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
