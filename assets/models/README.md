# Corepolis Lighthouse

Original Corepolis model, authored specifically for this game. It does not reuse Quaternius meshes or textures.

- File: `corepolis-lighthouse.glb` (glTF 2.0)
- Units: world units; Y up, door faces +Z; ground pivot at origin
- Approximate height: 3.6 world units; footprint fits one 4.8-unit cell
- Eight reused materials; no external textures or decoder extensions
- Named light anchor: `lighthouse_light_origin`
- Beam is created and animated by the runtime; it is not baked into the GLB
- Preview: `corepolis-lighthouse-preview.png`
- Authoring script: `scripts/create-lighthouse.mjs` (Node.js with `three@0.180.0` installed)
- Final export optimized with glTF Transform 4.2.1: weld, dedup, prune
