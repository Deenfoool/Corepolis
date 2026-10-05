const RTS_MIRROR_COMMIT = 'cb9626aa06933a7d7993b76f8934838ef31de731';
const RTS_MIRROR_ROOT = `https://raw.githubusercontent.com/wangfumin1/Latticefolk/${RTS_MIRROR_COMMIT}/public/assets/quaternius`;
const RTS_ROOT = `${RTS_MIRROR_ROOT}/ultimate-fantasy-rts`;
const CUBE_WORLD_ROOT = `${RTS_MIRROR_ROOT}/cube-world`;

const PIRATE_MIRROR_COMMIT = 'c850a2840081a30442f252d6e2ce9db4d02362ee';
const PIRATE_ROOT = `https://raw.githubusercontent.com/eitan567/VerdantIsle/${PIRATE_MIRROR_COMMIT}/models/Pirate%20kit-glb`;

export const ASSETS = {
  windmill: `${RTS_ROOT}/Windmill_FirstAge.gltf`,
  treeA: `${CUBE_WORLD_ROOT}/Tree_1.gltf`,
  treeB: `${CUBE_WORLD_ROOT}/Tree_3.gltf`,
  rockA: `${PIRATE_ROOT}/Rock.glb`,
  rockC: `${PIRATE_ROOT}/Rock-6cytS1cPiL.glb`,
  house: `${RTS_ROOT}/Houses_SecondAge_1_Level3.gltf`,
  market: `${RTS_ROOT}/Market_FirstAge_Level3.gltf`,
  lumbermill: `${PIRATE_ROOT}/Sawmill.glb`,
  quarry: `${RTS_ROOT}/Mine.gltf`,
  wheat1: './assets/crops/Wheat_1.glb?v=wheat-material-fix-1',
  wheat2: './assets/crops/Wheat_2.glb?v=wheat-material-fix-1',
  wheat3: './assets/crops/Wheat_3.glb?v=wheat-material-fix-1',
  wheat4: './assets/crops/Wheat_4.glb?v=wheat-material-fix-1',

  // Marine visuals now come from Quaternius Pirate Kit as well. These keys are
  // kept stable because the placement runtime consumes them as component slots.
  tidelineBoardingPlank: `${PIRATE_ROOT}/Dock.glb`,
  tidelineRailing: `${PIRATE_ROOT}/Post.glb`,
  tidelineBollard: `${PIRATE_ROOT}/Post.glb`,
  tidelineAnchor: `${PIRATE_ROOT}/Anchor.glb`,
  tidelineBuoyGarland: `${PIRATE_ROOT}/Bucket%20of%20Fish.glb`,
  tidelineBellStand: `${PIRATE_ROOT}/Post.glb`,
  tidelineDockChair: `${PIRATE_ROOT}/Barrel.glb`,
  tidelineBoatHouse: `${PIRATE_ROOT}/House.glb`,
  tidelineBaitBox: `${PIRATE_ROOT}/Bucket%20of%20Fish.glb`,
  tidelineCargoBarrel: `${PIRATE_ROOT}/Barrel.glb`,
};

export const ASSET_LICENSE = {
  name: 'Quaternius CC0 model packs',
  author: 'Quaternius',
  license: 'CC0 1.0 Universal',
  source: 'https://quaternius.com/',
  runtimeMirrors: [
    { repository: 'wangfumin1/Latticefolk', commit: RTS_MIRROR_COMMIT },
    { repository: 'eitan567/VerdantIsle', commit: PIRATE_MIRROR_COMMIT },
  ],
};
