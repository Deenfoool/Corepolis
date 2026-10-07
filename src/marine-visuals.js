import * as THREE from 'three';

const material=(color,roughness=.9,extra={})=>new THREE.MeshStandardMaterial({
  color,roughness,metalness:0,...extra
});

export function createBoatVisual(){
  const boat=new THREE.Group();
  boat.name='Fishing_Rowboat';
  const oak=material(0x9b613a,.96,{side:THREE.DoubleSide});
  const trim=material(0x49352a,.95,{side:THREE.DoubleSide});
  const planks=material(0xc49560,.96,{side:THREE.DoubleSide});
  const contour=[[-.32,-.92],[-.44,-.60],[-.49,0],[-.39,.58],[0,1.12],[.39,.58],[.49,0],[.44,-.60],[.32,-.92]];
  const top=contour.map(([x,z])=>new THREE.Vector3(x,.10+Math.max(0,z)*.12,z));
  const bottom=contour.map(([x,z])=>new THREE.Vector3(x*.60,-.26,z*.82));
  const inner=top.map(v=>new THREE.Vector3(v.x*.85,v.y-.008,v.z*.93));
  const floor=bottom.map(v=>new THREE.Vector3(v.x*.88,-.17,v.z*.92));
  function surface(name,triangles,mat){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(triangles.flatMap(v=>v.toArray()),3));
    geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,mat);mesh.name=name;
    mesh.castShadow=mesh.receiveShadow=true;boat.add(mesh);return mesh;
  }
  function strip(name,a,b,mat){
    const triangles=[];
    for(let i=0;i<a.length;i++){
      const j=(i+1)%a.length;
      triangles.push(a[i],b[i],b[j],a[i],b[j],a[j]);
    }
    return surface(name,triangles,mat);
  }
  strip('Tapered_Wooden_Hull',top,bottom,oak);
  strip('Gunwale',inner,top,trim);
  strip('Inner_Hull',floor,inner,planks);
  const underside=[],inside=[];
  for(let i=0;i<bottom.length;i++){
    const j=(i+1)%bottom.length;
    underside.push(new THREE.Vector3(0,-.28,0),bottom[j],bottom[i]);
    inside.push(new THREE.Vector3(0,-.17,0),floor[i],floor[j]);
  }
  surface('Keel',underside,trim);surface('Open_Floor',inside,planks);
  const stripeUpper=top.map((v,i)=>v.clone().lerp(bottom[i],.28));
  const stripeLower=top.map((v,i)=>v.clone().lerp(bottom[i],.35));
  stripeUpper.forEach(v=>{v.x*=1.012;v.z*=1.012;});
  stripeLower.forEach(v=>{v.x*=1.012;v.z*=1.012;});
  strip('Hull_Strake',stripeUpper,stripeLower,trim);
  function block(name,size,pos,mat){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.name=name;
    mesh.position.set(...pos);mesh.castShadow=mesh.receiveShadow=true;boat.add(mesh);return mesh;
  }
  for(const z of [-.48,.34])block('Bench',[z<0?.76:.78,.065,.18],[0,.105,z],planks);
  for(const x of [-.13,0,.13])block('Floor_Plank',[.115,.018,1.25],[x,-.155,-.09],planks);
  for(const side of [-1,1]){
    const oar=new THREE.Group();oar.position.set(side*.52,.15,-.04);oar.rotation.y=side*.16;
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.5,6),planks);
    shaft.rotation.x=Math.PI/2;shaft.position.z=-.04;oar.add(shaft);
    const blade=new THREE.Mesh(new THREE.BoxGeometry(.105,.025,.32),planks);
    blade.position.z=-.90;oar.add(blade);boat.add(oar);
  }
  const rope=new THREE.Mesh(new THREE.TorusGeometry(.085,.015,5,12),material(0xc8b78e));
  rope.rotation.x=Math.PI/2;rope.position.set(0,.23,.81);boat.add(rope);
  boat.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
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
