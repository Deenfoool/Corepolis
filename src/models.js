const RTS_ROOT = './assets/quaternius/ultimate-fantasy-rts';
const PIRATE_MIRROR_COMMIT = 'c850a2840081a30442f252d6e2ce9db4d02362ee';
const PIRATE_ROOT = `https://raw.githubusercontent.com/eitan567/VerdantIsle/${PIRATE_MIRROR_COMMIT}/models/Pirate%20kit-glb`;
const rts = file => `${RTS_ROOT}/${file}.gltf?v=resource-proportions-1`;

export const ASSETS = {
  windmill: rts('Windmill_SecondAge'),
  treeA: rts('Resource_PineTree_Group'),
  treeB: rts('Resource_Tree_Group'),
  rockA: rts('Resource_Rock_1'),
  rockB: rts('Resource_Rock_2'),
  rockC: rts('Resource_Rock_3'),
  house: rts('Houses_SecondAge_1_Level2'),
  house2: rts('Houses_SecondAge_1_Level1'),
  house3: rts('Houses_SecondAge_2_Level1'),
  house4: rts('Houses_SecondAge_2_Level2'),
  pier: rts('Port_FirstAge_Level3'),
  pier2: rts('Dock_FirstAge'),
  pier3: rts('Port_SecondAge_Level2'),
  pier4: rts('Port_SecondAge_Level3'),
  storage: rts('Storage_SecondAge_Level2'),
  market: rts('Market_SecondAge_Level3'),
  quarry: rts('Mine'),
  lumbermill: `${PIRATE_ROOT}/Sawmill.glb`,
  wheat1: './assets/crops/Wheat_1.glb?v=wheat-material-fix-1',
  wheat2: './assets/crops/Wheat_2.glb?v=wheat-material-fix-1',
  wheat3: './assets/crops/Wheat_3.glb?v=wheat-material-fix-1',
  wheat4: './assets/crops/Wheat_4.glb?v=wheat-material-fix-1',
};

export const ASSET_VARIANTS = {
  house: ['house', 'house2', 'house3', 'house4'],
  pier: ['pier', 'pier2', 'pier3', 'pier4'],
  tree: ['treeA', 'treeB'],
  rock: ['rockA', 'rockB', 'rockC'],
};

export function assetVariant(type, x = 0, z = 0) {
  const variants = ASSET_VARIANTS[type];
  if (!variants) throw new Error(`Unknown model family: ${type}`);
  let hash = Math.imul(x | 0, 73856093) ^ Math.imul(z | 0, 19349663);
  for (const letter of type) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
  hash ^= hash >>> 16;
  return variants[(hash >>> 0) % variants.length];
}

export const ASSET_LICENSE = {
  name: 'Quaternius CC0 model packs',
  author: 'Quaternius',
  license: 'CC0 1.0 Universal',
  source: 'https://quaternius.com/',
  runtimeMirrors: [{ repository: 'eitan567/VerdantIsle', commit: PIRATE_MIRROR_COMMIT }],
};
