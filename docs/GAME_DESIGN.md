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

- A windmill occupies the center cell.
- Four field slots exist at north/east/south/west.
- Field cards advance a slot through stages I → II → III → IV.
- A stage-IV field stays mature.
- When all four fields are mature, the system waits for a `New Windmill` card.
- Playing that card on the current windmill triggers a big harvest.
- All four fields return to stage I.
- The player receives bonus cards and score.

This creates anticipation: the player can prepare the whole pattern before receiving or spending the trigger card.

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
