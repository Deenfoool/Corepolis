# Corepolis — Roadmap

## Prototype 0.1 — Core island loop

- [x] Static GitHub Pages-safe runtime
- [x] Strategy camera
- [x] Five-card hand with visible reserve stack
- [x] Spatial field growth and four-piece collapse
- [x] Mill unlock / harvest loop
- [x] Six-house Market unlock
- [x] Lumbermill / Quarry two-step extraction
- [x] Wood / Stone economy and real card costs
- [x] Seamless organic terrain autotiling
- [x] Maritime branch with Pier, Lighthouse, Fishing Shop and sea routes
- [x] Low-poly animated water
- [x] Free shaped territory fragments
- [x] Territory rotation with Q / E
- [x] Full-fragment ghost preview with Tree / Rock content
- [x] Soft anti-bad-luck resource bias for territory fragments
- [x] Main menu with animated 3D island background
- [x] Main-menu settings for camera / interface motion
- [x] Economy balance baseline and biome probability pass
- [ ] Browser play-test and empirical economy timing pass

## Prototype 0.2 — Session shell

The game should feel like a complete playable session before more content is added.

### Save / Continue
- [x] Versioned local save container and compatibility check
- [x] Autosave after committed gameplay actions
- [x] Persist land, tile content, field stages and field order
- [x] Persist hand, reserve and shaped territory-card data
- [x] Persist resources, score, combo count and progression unlocks
- [x] Persist marine structures / routes and Mill location
- [x] Restore the world deterministically from a save
- [x] Enable Continue only when a compatible save exists
- [x] New Game confirmation when an existing save would be replaced
- [x] Graceful invalid / old-save fallback
- [x] Visible lightweight autosave feedback

### Pause / navigation
- [x] ESC opens an in-game pause menu
- [x] Resume
- [x] Settings from pause
- [x] Return to main menu without deleting the current save
- [x] Restart run with confirmation
- [x] Pause blocks mouse and keyboard gameplay input while open

## Prototype 0.3 — Complete settings

- [x] music / atmosphere volume
- [x] sound-effects volume
- [x] graphics quality: Low / Medium / High
- [x] shadows toggle
- [x] water-motion toggle
- [x] interface-motion toggle
- [x] camera sensitivity
- [x] settings persist independently from the current run

## Prototype 0.4 — Run goal and progression

- [x] Settlement → Village → Town → City → Island Capital progression
- [x] progression depends on settlement, production, farming and maritime development rather than score alone
- [x] clear long-run objective in the HUD
- [x] visible milestone rewards with real bonus cards
- [x] persistent production/progression evidence for the current run
- [x] Island Capital milestone presentation with Continue Building

## Prototype 0.5 — Results and replayability

Complete playable-run layer: results, deterministic seeds, milestone drafting, gameplay biomes, persistent combo knowledge and first-run onboarding are all live.

- [x] final score
- [x] island size
- [x] combo count
- [x] houses / districts
- [x] sea routes
- [x] produced Wood / Stone
- [x] Continue Building option
- [x] New Run option
- [x] seeded runs
- [x] card drafting choices
- [x] island biomes
- [x] combo encyclopedia
- [x] tutorial

## Prototype 0.6 — Card discovery and deck economy

Advanced cards must be earned by developing the island rather than appearing immediately from one global random pool. Full design: `docs/CARD_PROGRESSION.md`.

### Discovery / unlocks
- [x] New runs start with House / Field / Lumbermill / Quarry only
- [x] Territory / Forest / Rocks remain foundational world cards
- [x] First Wood production unlocks Pier and grants its first copy
- [x] First resource production unlocks Clear
- [x] Four connected Fields unlock Mill through the existing milestone
- [x] Six connected Houses unlock Market through the existing milestone
- [x] First Pier opens Fishing Shop through the marine branch
- [x] Lighthouse remains a milestone / expedition card instead of a normal random draw
- [x] Card unlock state persists through Continue and resets with New Run
- [x] Visible unlock presentation
- [x] Pause-menu discovery screen with hidden hints and opened cards

### Card Director
- [x] Replace fixed global draw weights with live run-aware weights
- [x] Exclude locked cards from random draws
- [x] Duplicate suppression from Hand + Reserve counts
- [x] Recent-draw repeat protection
- [x] Situational usefulness gates for production / housing / maritime cards
- [x] Resource scarcity assistance for Forest / Rocks
- [x] Territory assistance when the island becomes large
- [x] Route biome modifiers through the Card Director instead of mutating deck weights directly
- [x] Existing infrastructure influences related card families

### Next evolution
- [ ] Buildings become explicit card sources: Mill → farming, Market → city/trade, Pier → sea, Lumbermill/Quarry → production
- [ ] Unknown → Discovered → Unlocked → Mastered card states
- [ ] Hidden clue chain for undiscovered advanced cards
- [ ] Mastery bonuses for repeatedly successful combinations
- [ ] Rework milestone drafts so choices are sourced from unlocked development branches
- [ ] Add new buildings that extend the production / settlement / maritime discovery graph

## Later content

After Card Discovery is stable:

- new buildings and district synergies
- rare / strategic cards
- maritime events and expeditions
- more boats / harbor content
- richer reward presentation
- broader visual polish and performance pass
