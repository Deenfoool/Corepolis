import * as THREE from 'three';

const material=(color,roughness=.9,extra={})=>new THREE.MeshStandardMaterial({
  color,roughness,metalness:0,...extra
});

export function createBoatVisual(){
  const boat=new THREE.Group();
  const hull=new THREE.Mesh(
    new THREE.SphereGeometry(.82,14,9),
    material(0x7a4f2c,.94)
  );
  hull.scale.set(1.28,.42,.62);
  hull.castShadow=hull.receiveShadow=true;
  boat.add(hull);

  const inner=new THREE.Mesh(
    new THREE.BoxGeometry(1.55,.18,.58),
    material(0xd1b276,.88)
  );
  inner.position.y=.18;
  inner.castShadow=true;
  boat.add(inner);

  for(const z of [-.23,.23]){
    const seat=new THREE.Mesh(new THREE.BoxGeometry(1.45,.07,.10),material(0x4f3827));
    seat.position.set(0,.34,z);
    seat.castShadow=true;
    boat.add(seat);
  }
  boat.scale.set(.78,.78,.78);
  return boat;
}

export function attachLighthouseBeam(root){
  const origin=root.getObjectByName('lighthouse_light_origin');
  if(!origin)throw new Error('Lighthouse light origin is missing.');
  root.updateMatrixWorld(true);
  const beamPivot=new THREE.Group();
  beamPivot.position.copy(root.worldToLocal(origin.getWorldPosition(new THREE.Vector3())));
  const beam=new THREE.Mesh(
    new THREE.ConeGeometry(.72,5.2,18,1,true),
    new THREE.MeshBasicMaterial({
      color:0xffe5a1,transparent:true,opacity:.13,depthWrite:false,
      blending:THREE.AdditiveBlending,side:THREE.DoubleSide
    })
  );
  beam.rotation.z=Math.PI/2;
  beam.position.x=2.56;
  beamPivot.add(beam);
  root.add(beamPivot);
  root.userData.beamPivot=beamPivot;
  return root;
}
