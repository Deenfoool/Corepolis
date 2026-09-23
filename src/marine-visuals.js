import * as THREE from 'three';

const material=(color,roughness=.9,extra={})=>new THREE.MeshStandardMaterial({
  color,roughness,metalness:0,...extra
});
const addBox=(root,size,pos,color,rotationY=0)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material(color));
  mesh.position.set(...pos);
  mesh.rotation.y=rotationY;
  mesh.castShadow=mesh.receiveShadow=true;
  root.add(mesh);
  return mesh;
};

export function createBoatVisual(){
  const boat=new THREE.Group();
  const hull=new THREE.Mesh(
    new THREE.CapsuleGeometry(.48,1.55,5,10),
    material(0x7a4f2c,.94)
  );
  hull.rotation.z=Math.PI/2;
  hull.scale.set(1,.52,1.18);
  hull.castShadow=hull.receiveShadow=true;
  boat.add(hull);

  const inner=new THREE.Mesh(
    new THREE.BoxGeometry(1.55,.18,.58),
    material(0xd1b276,.88)
  );
  inner.position.y=.18;
  inner.castShadow=true;
  boat.add(inner);

  for(const z of [-.23,.23])addBox(boat,[1.45,.07,.10],[0,.34,z],0x4f3827);
  boat.scale.set(.78,.78,.78);
  return boat;
}

export function createPierVisual(yaw=0){
  const root=new THREE.Group();
  const wood=0x8b653f;
  const dark=0x5d422d;
  for(let i=0;i<8;i++){
    const plank=addBox(root,[1.95,.14,.46],[0,.12,-1.58+i*.46],i%2?0x94704a:wood);
    plank.rotation.y=(i%3-1)*.008;
  }
  for(const x of [-.88,.88])for(const z of [-1.45,.05,1.45]){
    addBox(root,[.18,1.35,.18],[x,-.36,z],dark);
  }
  const ropeMat=new THREE.MeshStandardMaterial({color:0xb7a07a,roughness:1});
  for(const x of [-.9,.9]){
    const rope=new THREE.Mesh(new THREE.TorusGeometry(.22,.025,6,14,Math.PI),ropeMat);
    rope.position.set(x,.16,.75);
    rope.rotation.set(Math.PI/2,0,x<0?0:Math.PI);
    root.add(rope);
  }

  const boat=createBoatVisual();
  boat.position.set(1.58,-.02,.58);
  boat.rotation.y=-.18;
  root.add(boat);
  root.userData.boat=boat;
  root.rotation.y=yaw;
  return root;
}

export function createLighthouseVisual(){
  const root=new THREE.Group();
  const base=new THREE.Mesh(
    new THREE.CylinderGeometry(.78,.96,.34,14),
    material(0x817565,.98)
  );
  base.position.y=.17;
  base.castShadow=base.receiveShadow=true;
  root.add(base);

  const tower=new THREE.Mesh(
    new THREE.CylinderGeometry(.46,.70,2.65,18),
    material(0xf1e4c6,.84)
  );
  tower.position.y=1.62;
  tower.castShadow=tower.receiveShadow=true;
  root.add(tower);

  const band=new THREE.Mesh(
    new THREE.CylinderGeometry(.55,.57,.30,18),
    material(0xb55442,.82)
  );
  band.position.y=2.27;
  band.castShadow=true;
  root.add(band);

  const balcony=new THREE.Mesh(
    new THREE.CylinderGeometry(.76,.76,.10,18),
    material(0x4d5552,.72)
  );
  balcony.position.y=3.02;
  root.add(balcony);

  const lantern=new THREE.Mesh(
    new THREE.CylinderGeometry(.39,.39,.48,12),
    material(0xffe7a0,.35,{emissive:0xf4b94f,emissiveIntensity:1.2})
  );
  lantern.position.y=3.31;
  root.add(lantern);

  const roof=new THREE.Mesh(
    new THREE.ConeGeometry(.58,.52,12),
    material(0x43504c,.84)
  );
  roof.position.y=3.81;
  root.add(roof);

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

export function createFishingShopVisual(){
  const root=new THREE.Group();
  addBox(root,[2.55,.34,2.0],[0,.17,0],0x715238);
  addBox(root,[2.20,1.55,1.65],[0,1.08,0],0xc99a61);
  const roof=new THREE.Mesh(
    new THREE.ConeGeometry(1.72,.95,4),
    material(0x4d6554,.88)
  );
  roof.position.y=2.18;
  roof.rotation.y=Math.PI*.25;
  roof.scale.z=.82;
  roof.castShadow=true;
  root.add(roof);

  addBox(root,[.72,1.02,.10],[-.55,.83,.88],0x4d3828);
  const windowMat=material(0x8fc4c7,.4,{emissive:0x31565a,emissiveIntensity:.18});
  const window=new THREE.Mesh(new THREE.BoxGeometry(.72,.64,.08),windowMat);
  window.position.set(.58,1.18,.89);
  root.add(window);

  addBox(root,[2.32,.16,.72],[0,1.72,1.08],0xe1c46e);
  addBox(root,[2.32,.10,.12],[0,1.48,1.15],0x85543a);
  const sign=addBox(root,[1.1,.44,.10],[0,2.18,1.04],0x36594f);
  sign.rotation.z=-.025;

  const crate=addBox(root,[.54,.45,.54],[1.15,.23,.58],0x8d683f);
  crate.rotation.y=.18;
  return root;
}

export function marinePreviewVisual(type){
  if(type==='pier')return createPierVisual(.18);
  if(type==='lighthouse')return createLighthouseVisual();
  if(type==='fishingShop')return createFishingShopVisual();
  return null;
}
