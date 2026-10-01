# Corepolis — Card discovery and deck progression

## Core principle

Cards must not appear just because they exist in a global random pool. Corepolis treats the deck as part of city progression:

**player action → discovery → unlock → card enters the draw pool → new infrastructure → new combinations → next discovery**.

The player should be able to explain why every advanced card became available.

## Starting state

A new run starts with exactly four development cards in hand:

- House;
- Field;
- Lumbermill;
- Quarry.

Territory Expansion, Forest and Rocks are foundational **world cards**. They may be drawn from the beginning because they keep the spatial/resource loop alive, but they are not advanced city technology.

Advanced buildings are absent from the normal draw pool until unlocked.

## Discovery graph — first implementation

| Trigger | Unlock | First copy |
| --- | --- | --- |
| Start a run | House / Field / Lumbermill / Quarry | already in hand |
| Produce the first Wood | Pier | granted immediately |
| Produce the first Wood or Stone | Clear | enters the pool |
| Connect four Fields | Mill | existing milestone reward |
| Connect six Houses | Market | existing milestone reward |
| Build the first Pier / open the marine branch | Fishing Shop | existing marine reward |
| Choose the lighthouse expedition | Lighthouse | unique expedition reward |

The graph should grow when new buildings are added. Unlocks must remain spatial and understandable rather than becoming an abstract XP tree.

## Draw director

The old fixed global deck weights are replaced by a run-aware Card Director.

For every draw it evaluates:

1. whether the card is unlocked;
2. whether the card can currently be useful;
3. how many copies are already in Hand + Reserve;
4. whether the same card appeared recently;
5. current Wood / Stone shortages;
6. relevant infrastructure already built;
7. active island biome.

### Duplicate protection

Specialized cards must not flood the hand.

- 0 copies owned: normal chance;
- 1 copy: reduced chance;
- 2 copies: heavily reduced chance;
- 3+ copies: temporarily excluded from random draws.

Recently drawn types also receive a temporary repeat penalty.

### Situational gates

Examples:

- Fishing Shop has zero random weight while no Pier exists;
- Market has zero random weight while there is no meaningful housing cluster;
- Lumbermill is strongly deprioritized if there is no Forest to process;
- Quarry is strongly deprioritized if there are no Rocks;
- Territory gets help when usable land starts becoming scarce;
- Forest / Rocks get help when their resource is scarce.

Randomness remains, but it should feel useful rather than careless.

## Unlock presentation

An unlock is a visible game event, not a silent table change.

Example:

> NEW CARD — PIER
> Wood production has opened access to the coast.
> Pier can now appear in the deck.

Important cards can grant one first copy so the player can immediately try the newly opened mechanic. Unlocking a type does **not** mean the deck should immediately spam that type.

## Card states

Long-term direction:

1. **Unknown** — exact recipe hidden;
2. **Discovered** — the player has seen a clue;
3. **Unlocked** — the card can enter the run pool;
4. **Mastered** — repeated successful use can unlock an upgrade or stronger synergy.

The Combo Encyclopedia should become the permanent record of discovered recipes and mechanics.

## City as the future source of cards

The global deck is only the early-game source. The long-term target is for the built city to increasingly generate its own card economy:

- Mill → agricultural cards;
- Market → settlement / trade cards;
- Pier → maritime cards;
- Lumbermill → forest / wood-development cards;
- Quarry → stone / industrial cards.

This should gradually turn the island itself into the player's deck engine.

## Special cards

Not every card belongs in the repeatable random pool.

Milestone / strategic cards such as Lighthouse should normally be awarded by a specific discovery, expedition or city milestone rather than repeatedly drawn at random.

## Design rule

When adding a new card, answer all four questions before implementing it:

1. What action makes the player discover it?
2. Does it enter the repeatable pool or is it a milestone card?
3. When is drawing it useful, and when should its weight be zero?
4. Which future discovery can this card lead to?
