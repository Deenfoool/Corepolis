# Corepolis — Architecture

## Deployment constraints

Corepolis is a fully static GitHub Pages application:

- canonical public path: `/Corepolis/`;
- no backend;
- no GitHub Actions;
- deployment from `main` → `/ (root)`;
- `.nojekyll` remains at repository root.

## Stack

The prototype intentionally stays build-tool free:

- HTML
- CSS
- JavaScript ES modules
- Three.js from jsDelivr

## Runtime modules

- `src/config.js` — card definitions, deck weights and grid constants.
- `src/models.js` — commit-pinned CC0 asset URLs.
- `src/main.js` — scene, island grid, cards, interactions, combo logic and UI binding.

## Asset policy

Only assets with clear redistribution/use terms are accepted.

The current authored art is from the official KayKit Game Assets GitHub organization. Runtime URLs are pinned to an exact source commit so the model content cannot silently change.

If assets are later vendored into this repository, obsolete remote paths must be removed rather than kept as fallbacks.

## State model

Every land cell is stored by integer `x,z` key and has:

- terrain membership;
- content type;
- optional growth stage;
- Three.js visual root.

Card instances have a unique runtime id plus a card type. Applying a card mutates exactly one gameplay action and then removes that card from the hand.
