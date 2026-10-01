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
- [ ] Browser play-test and economy balance pass

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

This is the next gameplay priority.

- final score
- island size
- combo count
- houses / districts
- sea routes
- produced Wood / Stone
- Continue Building option
- New Run option
- seeded runs
- card drafting choices
- island biomes
- combo encyclopedia
- tutorial

## Later content

Only after the session shell and run goal are stable:

- new buildings and district synergies
- rare / strategic cards
- maritime events and expeditions
- more boats / harbor content
- richer reward presentation
- broader visual polish and performance pass
