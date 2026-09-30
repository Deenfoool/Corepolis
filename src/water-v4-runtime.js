import * as THREE from 'three';

const WATER_WIDTH=140;
const WATER_SEGMENTS=56;
const WATER_BASE_Y=-.62;
const EPSILON=.32;

const fract=value=>value-Math.floor(value);
const fade=t=>t*t*t*(t*(t*6-15)+10);

function perlinGradient(x,z){
  let gx=-1+2*fract(Math.sin(x*127.1+z*311.7)*43758.5453123);
  let gz=-1+2*fract(Math.sin(x*269.5+z*183.3)*43758.5453123);
  const length=Math.hypot(gx,gz)||1;
  gx/=length;
  gz/=length;
  return[gx,gz];
}

function perlinNoise(x,z){
  const ix=Math.floor(x);
  const iz=Math.floor(z);
  const fx=x-ix;
  const fz=z-iz;
  const ux=fade(fx);
  const uz=fade(fz);

  const g00=perlinGradient(ix,iz);
  const g10=perlinGradient(ix+1,iz);
  const g01=perlinGradient(ix,iz+1);
  const g11=perlinGradient(ix+1,iz+1);

  const n00=g00[0]*fx+g00[1]*fz;
  const n10=g10[0]*(fx-1)+g10[1]*fz;
  const n01=g01[0]*fx+g01[1]*(fz-1);
  const n11=g11[0]*(fx-1)+g11[1]*(fz-1);

  const nx0=THREE.MathUtils.lerp(n00,n10,ux);
  const nx1=THREE.MathUtils.lerp(n01,n11,ux);
  return THREE.MathUtils.lerp(nx0,nx1,uz)*1.41421356;
}

export function waterHeightAt(x,z,time){
  const large=perlinNoise(x*.105+time*.080,z*.105+time*.050)*.34;
  const secondary=perlinNoise(x*.19-time*.050,z*.19+time*.070)*.12;
  const swell=Math.sin(x*.16+z*.07-time*.35)*.075;
  return large+secondary+swell;
}

function waterSlopeAt(x,z,time){
  const left=waterHeightAt(x-EPSILON,z,time);
  const right=waterHeightAt(x+EPSILON,z,time);
  const back=waterHeightAt(x,z-EPSILON,time);
  const front=waterHeightAt(x,z+EPSILON,time);
  return{
    dx:(right-left)/(EPSILON*2),
    dz:(front-back)/(EPSILON*2)
  };
}

function isCorepolisWater(object){
  const geometry=object?.geometry;
  const material=object?.material;
  return !!(
    object?.isMesh&&
    Math.abs(object.position.y-WATER_BASE_Y)<.001&&
    geometry?.type==='PlaneGeometry'&&
    Math.abs((geometry.parameters?.width||0)-WATER_WIDTH)<.001&&
    Math.abs((geometry.parameters?.height||0)-WATER_WIDTH)<.001&&
    material?.isShaderMaterial&&
    material.uniforms?.uTime
  );
}

function upgradeWaterMesh(water){
  if(water.userData.waterV4)return;

  const oldGeometry=water.geometry;
  const geometry=new THREE.PlaneGeometry(WATER_WIDTH,WATER_WIDTH,WATER_SEGMENTS,WATER_SEGMENTS);
  geometry.rotateX(-Math.PI/2);
  water.geometry=geometry;
  oldGeometry?.dispose?.();

  const shader=water.material;
  shader.vertexShader=shader.vertexShader
    .replace(
      'vec2 largeDrift=vec2(uTime*.055,uTime*.032);',
      'vec2 largeDrift=vec2(uTime*.080,uTime*.050);'
    )
    .replace(
      'vec2 detailDrift=vec2(-uTime*.030,uTime*.043);',
      'vec2 detailDrift=vec2(-uTime*.050,uTime*.070);'
    )
    .replace(
      'float large=perlinNoise(p*.055+largeDrift)*.165;',
      'float large=perlinNoise(p*.105+largeDrift)*.34;'
    )
    .replace(
      'float secondary=perlinNoise(p*.115+detailDrift)*.050;',
      'float secondary=perlinNoise(p*.19+detailDrift)*.12;'
    )
    .replace(
      'float swell=sin(dot(p,vec2(.073,.031))-uTime*.18)*.026;',
      'float swell=sin(dot(p,vec2(.16,.07))-uTime*.35)*.075;'
    );
  shader.needsUpdate=true;

  water.userData.waterV4=true;
  water.userData.waveAmplitude=.535;
}

function syncPierBoats(scene,time){
  const worldPosition=new THREE.Vector3();
  scene.traverse(object=>{
    const boat=object.userData?.boat;
    if(!object.userData?.waterKey||!boat?.parent)return;

    if(!boat.userData.waterV4){
      boat.userData.waterV4={
        baseY:boat.position.y,
        baseRotX:boat.rotation.x,
        baseRotZ:boat.rotation.z
      };
    }

    boat.getWorldPosition(worldPosition);
    const height=waterHeightAt(worldPosition.x,worldPosition.z,time);
    const slope=waterSlopeAt(worldPosition.x,worldPosition.z,time);
    const base=boat.userData.waterV4;

    boat.position.y=base.baseY+height;
    boat.rotation.x=base.baseRotX-Math.atan(slope.dz)*.52;
    boat.rotation.z=base.baseRotZ+Math.atan(slope.dx)*.52;
  });
}

const originalRender=THREE.WebGLRenderer.prototype.render;
THREE.WebGLRenderer.prototype.render=function(scene,camera){
  if(this.domElement?.id==='game'&&scene?.isScene){
    let water=null;
    scene.traverse(object=>{
      if(!water&&isCorepolisWater(object))water=object;
    });
    if(water){
      upgradeWaterMesh(water);
      const time=water.material.uniforms.uTime.value||performance.now()*.001;
      syncPierBoats(scene,time);
    }
  }
  return originalRender.call(this,scene,camera);
};
