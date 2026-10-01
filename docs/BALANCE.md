# Corepolis — Economy balance baseline

This document records the current Prototype 0.5 economy assumptions so future content can be compared against the same baseline.

## Guaranteed opening

The opening run guarantees these cards before random draw pressure matters:

- Tree
- Lumbermill
- Rock
- Quarry
- Field
- Pier in reserve after the five-card hand fills

This guarantees access to both Wood and Stone production paths without depending on an early random draw.

## Early random deck

Before Market and Fishing Shop are unlocked, the early deck contains free economy / expansion cards and resource-gated strategic cards.

The share of free or economy-enabling cards remains intentionally close across every biome:

| Biome | Early free / enabling share |
| --- | ---: |
| Verdant Coast | 76.9% |
| Stone Ridges | 76.7% |
| Golden Lowlands | 76.4% |
| Windy Archipelago | 75.5% |

With the current weights, the probability of five consecutive early draws all being resource-gated stays below 0.1% in every biome.

## Biome pressure

Biome modifiers create direction without replacing the core deck:

- Verdant Coast raises Tree and Lumbermill frequency.
- Stone Ridges raises Rock and Quarry frequency.
- Golden Lowlands raises Field and House frequency.
- Windy Archipelago raises Island, Pier and Fishing Shop frequency.

No biome removes a card family or makes a single early card type exceed roughly 36% of its available early deck.

## Economy rules to preserve

- A new run must always be able to start Wood and Stone production without random luck.
- A biome should bias a strategy, not force it.
- Resource-gated cards should not dominate an entire five-card hand with meaningful frequency.
- Milestone rewards and drafts may accelerate a run, but must not be required to escape an economic deadlock.
- Island Capital requirements must continue to exercise settlement, farming, production and maritime play.

## Browser balance pass

The numerical baseline is stable enough for play-testing. The remaining balance work is empirical and must be measured in a real browser run:

- turns / cards until first Field combo;
- turns until sustainable Wood and Stone income;
- turns until Market unlock;
- turns until first Pier route;
- cards discarded or stranded by resource costs;
- time and card count to Island Capital for each biome;
- frequency with which draft choices are obvious rather than strategic.

Do not tune these values only from static probability calculations. Adjust weights, costs and milestone thresholds after real-run evidence is collected.
