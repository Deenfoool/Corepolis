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

export function createLighthouseVisual(){
  const root=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.78,.96,.34,14),material(0x817565,.98));
  base.position.y=.17;base.castShadow=base.receiveShadow=true;root.add(base);
  const tower=new THREE.Mesh(new THREE.CylinderGeometry(.46,.70,2.65,18),material(0xf1e4c6,.84));
  tower.position.y=1.62;tower.castShadow=tower.receiveShadow=true;root.add(tower);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.55,.57,.30,18),material(0xb55442,.82));
  band.position.y=2.27;band.castShadow=true;root.add(band);
  const balcony=new THREE.Mesh(new THREE.CylinderGeometry(.76,.76,.10,18),material(0x4d5552,.72));
  balcony.position.y=3.02;root.add(balcony);
  const lantern=new THREE.Mesh(
    new THREE.CylinderGeometry(.39,.39,.48,12),
    material(0xffe7a0,.35,{emissive:0xf4b94f,emissiveIntensity:1.2})
  );
  lantern.position.y=3.31;root.add(lantern);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(.58,.52,12),material(0x43504c,.84));
  roof.position.y=3.81;root.add(roof);

  const beamPivot=new THREE.Group();
  beamPivot.position.y=3.34;
  const beam=new THREE.Mesh(
    new THREE.ConeGeometry(.72,5.2,18,1,true),
    new THREE.MeshBasicMaterial({
      color:0xffe5a1,transparent:true,opacity:.13,depthWrite:false,
      blending:THREE.AdditiveBlending,side:THREE.DoubleSide
    })
  );
  beam.rotation.z=-Math.PI/2;
  beam.position.x=2.56;
  beamPivot.add(beam);
  root.add(beamPivot);
  root.userData.beamPivot=beamPivot;
  return root;
}
