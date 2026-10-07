import * as THREE from 'three';

export const RTS_WORLD_SCALE = 1.5;

function anchorModel(model, scale) {
  const pivot = new THREE.Group();
  pivot.add(model);
  model.scale.multiplyScalar(scale);
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
  // The sawmill comes from a different pack with its own source units.
  return assetKey === 'lumbermill'
    ? fitModelToBounds(model, 2.6, 2.4)
    : anchorModel(model, RTS_WORLD_SCALE);
}
