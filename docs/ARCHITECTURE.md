# Corepolis — Architecture

## Deployment constraints

Corepolis is a fully static GitHub Pages application:

- canonical public path: `/Corepolis/`;
- no backend;
- no GitHub Actions;
- deployment from `main` → `/ (root)`;
- `.nojekyll` remains at repository root.

## Stack

The project stays build-tool free:

- HTML
- CSS
- JavaScript ES modules
- Three.js from jsDelivr
- Lucide for interface icons
- GLTF / GLB runtime assets

## Runtime modules

- `src/config.js` — card definitions, deck weights and grid constants.
- `src/models.js` — selected local model locations, deterministic coordinate-based variants and the commit-pinned sawmill.
- `src/terrain.js` — procedural island top, coast, cliffs, terrain variants and shoreline water effects.
- `src/island-fragments.js` — territory shapes, 90° rotation, embedded Forest/Rock generation, adaptive resource bias, card mini-map and world ghost preview.
- `src/marine-visuals.js` — isolated procedural boat/lighthouse visuals that can be replaced when final assets exist.
- `src/water-v4-macrowaves.js` — real vertical macro-wave displacement for the shared ocean mesh.
- `src/main.js` — scene/state orchestration, card economy, placement, progression, production, maritime logic, animations and UI binding.

Superseded runtime modules are deleted instead of retained as fallbacks.

## State model

Every land cell is stored by integer `x,z` key and owns a stable visual root plus mutable gameplay content.

Important cell data includes:

- coordinate/key;
- terrain root and autotile classification;
- content type;
- optional field stage/order;
- resource-processing state;
- ambient visual objects.

Card instances have a unique runtime id and type. Territory cards additionally keep their generated fragment definition and current rotation. Shape/content are fixed at draw time so the card preview always matches the eventual placement.

A territory placement is one atomic gameplay action even though it may create several land cells. The complete fragment is validated before any card cost or placement is committed.

## Rendering and picking separation

Visual water, shoreline foam and territory ghost previews are not gameplay hit targets. Placement continues to use the dedicated invisible flat `waterPlane`, while land/content picking uses the `world` group. This keeps animated water geometry from changing placement coordinates.

## Asset policy

Only assets with clear redistribution/use terms are accepted. Provenance is documented in `THIRD_PARTY_NOTICES.md` and related docs.

When an asset, module or fallback is replaced, the obsolete path/code is removed in the same change rather than left dormant.

`src/model-layout.js` anchors geometry inside a separate placement pivot. RTS buildings share a 1.5 world scale. Forest groups use a 3.25-unit footprint with 2.25/2.1-unit heights; rocks use a shared 3.3 multiplier to retain relative variant sizes; the external Pirate Kit sawmill is fitted to 2.6 × 2.4 world limits. Tile translations and rotations apply only to the pivot, preserving the centred footprint and ground contact. Card framing has a separate size limit.

Fields keep the full tile footprint with eight 0.4-unit-wide ridges. Soil thickness is 0.08 units and ridge height is 0.045–0.06 units; crops and clods follow the lower surface.

Island placement ghosts use the runtime coastline generator and the same coordinate-based resource models as placed land. The preview accounts for both fragment cells and existing neighbours, caches unchanged cells, and disposes only its own terrain geometry and cloned resource materials. Q/E rotation uses KeyboardEvent.code (KeyQ/KeyE) independently of keyboard layout.

The lighthouse uses an original local GLB in `assets/models/`, authored in world units and merged into eight material meshes. The runtime attaches a rotating beam to the named light origin; save restoration and card previews consume the same model.

Причалы используют три варианта Port; Dock_FirstAge служит только четырёхступенчатым переходом от берега к пониженному настилу. Сваи порта и перехода погружены в воду, лодка имеет открытый корпус и отдельную ватерлинию. При восстановлении сохранения используется тот же сборщик причала. Анимация появления ресурсов завершается до запуска импульса добывающего здания, чтобы промежуточный масштаб не становился постоянным.

Мельница распределяет отдельные поля по четырём связанным группам (до четырёх клеток на сторону) через mill-fields.js. Ближайшее поле каждой стороны начинает свою группу; клетка учитывается только один раз. Урожай доступен при наличии полей со всех четырёх сторон; дополнительные поля увеличивают награду до 16 базовых карт. Новая карта мельницы собирает текущие группы, заменяет модель здания и начинает новый цикл. Группы вычисляются из клеток и fieldOrder, поэтому формат сохранения не меняется.

card-economy.js задаёт конечный стартовый набор (24 карты), продвижение резерва без генерации и проверку допустимых ходов. Склад заменяет текущую руку с исключением прежнего типа карты, не пополняя запас. run-ending.js проверяет поражение после завершения действия и стабилизации наград открытий/рангов; перебираются все клетки и четыре поворота фрагмента. Итог сохраняется перед блокировкой поля. Новый формат сохранения не требуется.

Карта Бульдозер сохраняет ключ clear для совместимости сохранений. canBulldoze используется для допустимости хода и подсветки; островные клетки и маяки защищены. Снос мельницы очищает millCell/rotors и пересчитывает поля. Снос причала удаляет waterStructures, связанные marineActors и seaRoutes; общие геометрии загруженных ассетов не освобождаются при удалении экземпляра.

research.js хранит определения пяти исследований, этапы открытия и проверку однократного выбора. research-runtime.js показывает выбор до трёх улучшений, книгу изучений в HUD, выбор фрагментов и обмен на рынке. В сохранение добавлены research (learned/claimed/pending/offers/seaRouteReached), surveyed и fragmentChoices для карты острова; старые сохранения получают пустые исследования. Открытые предложения сохраняются до выбора. Исследования применяются непосредственно в обработке урожая, истощения леса, проверке дальности маяка и допустимости торгового хода. Все диалоги блокируют действия и проверку поражения.

Поля используют низкополигональную основу и шесть гранёных борозд. Низкий деревянный забор со столбиками и двумя перекладинами появляется только по внешним сторонам группы. Соседние поля не дублируют столбики; на внутренних границах нет забора. Борозды подняты на 0.19 единицы и имеют выпуклый гранёный профиль. Пшеница Quaternius размещается через InstancedMesh (1–4 растения в пучке в зависимости от стадии), сохраняя пропорции и анимацию рядов.
