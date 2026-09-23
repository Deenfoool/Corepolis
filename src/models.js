const KAYKIT_COMMIT = '84fa4e91af6a88989be7c99e0891cede11f2ca38';
const KAYKIT_ROOT = `https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/${KAYKIT_COMMIT}/addons/kaykit_medieval_hexagon_pack/Assets/gltf`;
const TIDELINE_ROOT = './assets/tideline';

export const ASSETS = {
  windmill: `${KAYKIT_ROOT}/buildings/green/building_windmill_green.gltf`,
  treeA: `${KAYKIT_ROOT}/decoration/nature/tree_single_A.gltf`,
  treeB: `${KAYKIT_ROOT}/decoration/nature/tree_single_B.gltf`,
  rockA: `${KAYKIT_ROOT}/decoration/nature/rock_single_A.gltf`,
  rockC: `${KAYKIT_ROOT}/decoration/nature/rock_single_C.gltf`,
  house: `${KAYKIT_ROOT}/buildings/green/building_home_A_green.gltf`,
  market: `${KAYKIT_ROOT}/buildings/green/building_market_green.gltf`,
  lumbermill: `${KAYKIT_ROOT}/buildings/green/building_lumbermill_green.gltf`,
  quarry: `${KAYKIT_ROOT}/buildings/green/building_mine_green.gltf`,
  wheat1: './assets/crops/Wheat_1.glb?v=wheat-material-fix-1',
  wheat2: './assets/crops/Wheat_2.glb?v=wheat-material-fix-1',
  wheat3: './assets/crops/Wheat_3.glb?v=wheat-material-fix-1',
  wheat4: './assets/crops/Wheat_4.glb?v=wheat-material-fix-1',
  tidelineBoardingPlank: `${TIDELINE_ROOT}/Boarding_Plank.glb`,
  tidelineRailing: `${TIDELINE_ROOT}/Railing_A.glb`,
  tidelineBollard: `${TIDELINE_ROOT}/Bollard_A.glb`,
  tidelineAnchor: `${TIDELINE_ROOT}/Anchor_A.glb`,
  tidelineBuoyGarland: `${TIDELINE_ROOT}/Buoy_Garland.glb`,
  tidelineBellStand: `${TIDELINE_ROOT}/Bell_Stand_A.glb`,
  tidelineDockChair: `${TIDELINE_ROOT}/Dock_Chair_A.glb`,
  tidelineBoatHouse: `${TIDELINE_ROOT}/Boat_House_A.glb`,
  tidelineBaitBox: `${TIDELINE_ROOT}/Bait_Box_A.glb`,
  tidelineCargoBarrel: `${TIDELINE_ROOT}/Cargo_Barrel_A.glb`,
};

export const ASSET_LICENSE = {
  name: 'KayKit Medieval Hexagon Pack 1.0',
  author: 'Kay Lousberg',
  license: 'CC0 1.0 Universal',
  source: 'https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0',
  commit: KAYKIT_COMMIT,
};
