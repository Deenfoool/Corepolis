import * as THREE from 'three';

export const RTS_WORLD_SCALE = 1.5;
const FOREST_LAYOUT = { treeA: { width: 3.25, height: 2.25 }, treeB: { width: 3.25, height: 2.1 } };
const ROCK_WORLD_SCALE = 3.3;

function anchorModel(model, scale) {
  const pivot = new THREE.Group();
  pivot.add(model);
  if (typeof scale === 'number') model.scale.multiplyScalar(scale);
  else model.scale.multiply(scale);
  pivot.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(pivot);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
  pivot.updateMatrixWorld(true);
  return pivot;
}

export function fitModelToBounds(model, maxXZ, maxY = maxXZ * 1.5) {
  model.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  const scale = Math.min(maxXZ / Math.max(size.x, size.z, .001), maxY / Math.max(size.y, .001));
  return anchorModel(model, scale);
}

export function createWorldModel(model, assetKey) {
  if (assetKey === 'lighthouse') return anchorModel(model, 1);
  const forest = FOREST_LAYOUT[assetKey];
  if (forest) {
    model.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    const horizontalScale = forest.width / Math.max(size.x, size.z, .001);
    return anchorModel(model, new THREE.Vector3(horizontalScale, forest.height / Math.max(size.y, .001), horizontalScale));
  }
  if (['rockA', 'rockB', 'rockC'].includes(assetKey)) return anchorModel(model, ROCK_WORLD_SCALE);
  // The sawmill comes from a different pack with its own source units.
  return assetKey === 'lumbermill'
    ? fitModelToBounds(model, 2.6, 2.4)
    : anchorModel(model, RTS_WORLD_SCALE);
}
