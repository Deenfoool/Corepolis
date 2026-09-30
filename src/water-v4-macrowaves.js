import * as THREE from 'three';

const PATCH_FLAG=Symbol.for('corepolis.waterV4MacroWaves');
const rendererProto=THREE.WebGLRenderer.prototype;

if(!rendererProto[PATCH_FLAG]){
  rendererProto[PATCH_FLAG]=true;

  const originalRender=rendererProto.render;
  const waterStates=new WeakMap();

  function fract(v){return v-Math.floor(v);}
  function fade(t){return t*t*t*(t*(t*6-15)+10);}
  function lerp(a,b,t){return a+(b-a)*t;}

  function gradient(ix,iz){
    const a=fract(Math.sin(ix*127.1+iz*311.7)*43758.5453123)*Math.PI*2;
    return [Math.cos(a),Math.sin(a)];
  }

  function perlin2(x,z){
    const x0=Math.floor(x),z0=Math.floor(z);
    const fx=x-x0,fz=z-z0;
    const u=fade(fx),v=fade(fz);

    const g00=gradient(x0,z0);
    const g10=gradient(x0+1,z0);
    const g01=gradient(x0,z0+1);
    const g11=gradient(x0+1,z0+1);

    const n00=g00[0]*fx+g00[1]*fz;
    const n10=g10[0]*(fx-1)+g10[1]*fz;
    const n01=g01[0]*fx+g01[1]*(fz-1);
    const n11=g11[0]*(fx-1)+g11[1]*(fz-1);

    return lerp(lerp(n00,n10,u),lerp(n01,n11,u),v)*1.41421356;
  }

  function macroWaveHeight(x,z,time){
    const large=perlin2(x*.115+time*.075,z*.115+time*.044)*.42;
    const secondary=perlin2(x*.205-time*.038,z*.205+time*.057)*.14;
    const swell=Math.sin(x*.105+z*.046-time*.34)*.085;
    return large+secondary+swell;
  }

  function isCorepolisWater(object){
    if(!object?.isMesh||!object.geometry?.isBufferGeometry)return false;
    const material=object.material;
    if(!material?.isShaderMaterial)return false;
    const uniforms=material.uniforms;
    return !!(uniforms?.uDeep&&uniforms?.uMid&&uniforms?.uSky&&uniforms?.uSunDir);
  }

  function stateFor(water){
    let state=waterStates.get(water);
    if(state)return state;

    const position=water.geometry.getAttribute('position');
    if(!position)return null;
    position.setUsage(THREE.DynamicDrawUsage);

    state={
      base:new Float32Array(position.array),
      position,
      lastFrame:-1
    };
    waterStates.set(water,state);
    return state;
  }

  function updateWaterGeometry(water,time){
    const state=stateFor(water);
    if(!state)return;

    const frame=Math.floor(time*60);
    if(state.lastFrame===frame)return;
    state.lastFrame=frame;

    const position=state.position;
    const base=state.base;
    for(let i=0;i<position.count;i++){
      const offset=i*3;
      const x=base[offset];
      const z=base[offset+2];
      const baseY=base[offset+1];
      position.setY(i,baseY+macroWaveHeight(x,z,time));
    }
    position.needsUpdate=true;

    // The existing water shader derives its faceted normal from dFdx/dFdy,
    // so these real displaced triangles directly drive the low-poly lighting.
  }

  rendererProto.render=function(scene,camera){
    const time=performance.now()*.001;
    scene?.traverse?.(object=>{
      if(isCorepolisWater(object))updateWaterGeometry(object,time);
    });
    return originalRender.call(this,scene,camera);
  };
}
