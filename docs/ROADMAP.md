# Corepolis — Roadmap

## Prototype 0.1 — Core island loop

### Runtime and deployment
- [x] Static GitHub Pages runtime
- [x] Deploy from `main` / root without GitHub Actions
- [x] Strategy camera and world targeting
- [x] Five-card active hand
- [x] Visible reserve deck with refill animation
- [x] Lucide icon system
- [ ] Browser play-test and balance pass

### Fields and progression
- [x] Free field placement
- [x] Connected field growth stages I–IV
- [x] Any-shape four-field collapse by edge connectivity
- [x] Collapse into the oldest field cell
- [x] Bonus score/card from field collapse
- [x] First field combo unlocks Mill
- [x] Player-chosen Mill placement
- [x] Four-cell Mill growth zone and large harvest
- [x] First connected six-house district unlocks Market
- [x] Rounded faceted low-poly farmland with aligned furrows
- [x] Quaternius Wheat GLB stages and crop sway

### Resources and buildings
- [x] Tree / Rock resource cards
- [x] Lumbermill / Quarry two-step extraction
- [x] Shared-resource processing by overlapping producers
- [x] Existing producers auto-process newly placed resources
- [x] Producer self-replacement closes its local cycle
- [x] House / Market adjacency scoring
- [x] Real Wood / Stone installation costs
- [x] Unaffordable cards remain visible but disabled
- [x] Resource sources and basic producers remain free

### Territory fragments
- [x] One canonical free `Расширение территории` card
- [x] Remove obsolete paid `Expand Island` card
- [x] Fragment shapes: `1×1`, `1×2`, `1×3`, `L3`, `Z4`, `2×2`
- [x] Shape and contents fixed when the card is drawn
- [x] Optional embedded Forest / Rock cells
- [x] Mini-map of fragment shape on the card
- [x] Whole-fragment ghost preview before placement
- [x] Valid / invalid preview for collisions and map bounds
- [x] `Q / E` rotation in 90° steps before placement
- [x] Whole fragment rises from the sea as one action
- [x] Embedded resources immediately participate in production adjacency
- [x] Soft anti-bad-RNG bias toward Forest when Wood is scarce
- [x] Soft anti-bad-RNG bias toward Rock when Stone is scarce
- [x] Healthy economy shifts fragments back toward empty strategic land

### Terrain
- [x] Seamless 8-neighbour terrain autotiling
- [x] Center / edge / corner / channel / peninsula / isolated-island classes
- [x] Five deterministic variants
- [x] Organic sampled coastlines
- [x] Shared coastline profile between grass and cliffs
- [x] Stitched cliff corners and turf/soil overlap
- [x] Local terrain rebuild after expansion without deleting tile content

### Maritime branch
- [x] Water-grid Pier placement with shoreline orientation
- [x] Boat attached to every Pier
- [x] First-Pier expedition choice
- [x] Archipelago reward: 7 territory fragments
- [x] Lighthouse reward: 1 Lighthouse + 2 territory fragments
- [x] Remote Lighthouse island founding
- [x] Lighthouse radius enables detached fragment placement
- [x] Fishing Shop and house/pier synergies
- [x] Sea-route reward between Piers on separate landmasses
- [x] Real TIDELINE free-sample Pier / Fishing Shop visuals
- [ ] Replace temporary procedural boat and lighthouse when matching assets are available

### Water
- [x] Stylized translucent turquoise ocean
- [x] Gradient Perlin deformation instead of repeating wave masks
- [x] Real vertical macro-wave vertex displacement
- [x] Large faceted low-poly wave faces
- [x] Fresnel and restrained sunlight glints
- [x] Shallow-water caustics and shoreline foam
- [x] Water effects excluded from gameplay raycasting
- [x] No realtime reflection render pass

### Presentation
- [x] Runtime 3D card previews
- [x] Dark game-card visual system
- [x] Placement / collapse / reward animations
- [x] Building and nature feedback effects
- [x] Atmospheric loading screen with rotating phrases
- [x] Reduced-motion-safe loading flow

## Prototype 0.2 — Deeper spatial decisions

- [ ] Full balance pass for Wood / Stone income versus building costs
- [ ] Combo preview before committing ordinary building cards
- [ ] Named mixed-use districts and placement bonuses
- [ ] Real boat expedition loop
- [ ] Reward choices after major combos
- [ ] Roads / adjacency chains
- [ ] Sound effects and richer combo presentation
- [ ] Save / load

## Prototype 0.3 — Run structure

- [ ] Long-run progression and goals
- [ ] Card drafting choices
- [ ] Island biomes
- [ ] Win / fail states
- [ ] Combo encyclopedia
- [ ] Seeded runs
- [ ] Tutorial
