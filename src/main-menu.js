import { createWorldModel, fitModelToBounds } from './model-layout.js?v=bulldozer-1';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ASSETS, ASSET_VARIANTS, assetVariant } from './models.js?v=bulldozer-1';
import { clearSave, hasCompatibleSave, readSave } from './session-state.js?v=1';

const root=document.querySelector('#main-menu');
const canvas=document.querySelector('#menu-scene');
const startButton=document.querySelector('#menu-start');
const continueButton=document.querySelector('#menu-continue');
const continueNote=continueButton?.querySelector('.menu-action-note');
const settingsButton=document.querySelector('#menu-settings-button');
const settingsPanel=document.querySelector('#menu-settings');
const settingsClose=document.querySelector('#menu-settings-close');
const cameraToggle=document.querySelector('#setting-menu-camera');
const uiMotionToggle=document.querySelector('#setting-ui-motion');

const storage={
  camera:'corepolis:menu-camera-motion',
  uiMotion:'corepolis:ui-motion'
};
const storedBool=(key,fallback)=>{
  const value=localStorage.getItem(key);
  if(value===null)return fallback;
  return value==='1';
};

let cameraMotion=storedBool(storage.camera,!matchMedia('(prefers-reduced-motion: reduce)').matches);
let uiMotion=storedBool(storage.uiMotion,!matchMedia('(prefers-reduced-motion: reduce)').matches);
let running=true;
let renderer=null;
let frame=0;
let resizeHandler=null;
let loadingObserver=null;

function syncSettings(){
  cameraToggle?.setAttribute('aria-checked',String(cameraMotion));
  uiMotionToggle?.setAttribute('aria-checked',String(uiMotion));
  document.body.classList.toggle('reduce-motion',!uiMotion);
}
function setSettingsOpen(open){
  settingsPanel?.classList.toggle('open',open);
  settingsPanel?.setAttribute('aria-hidden',String(!open));
}
function setToggle(button,value,key){
  if(button===cameraToggle)cameraMotion=value;
  if(button===uiMotionToggle)uiMotion=value;
  localStorage.setItem(key,value?'1':'0');
  syncSettings();
}
function syncContinueButton(){
  const save=readSave();
  const available=!!save;
  if(continueButton){
    continueButton.disabled=!available;
    continueButton.setAttribute('aria-disabled',String(!available));
  }
  if(continueNote){
    continueNote.textContent=available
      ?`СОХРАНЕНО ${new Date(save.savedAt).toLocaleDateString('ru-RU')}`
      :'НЕТ СОХРАНЕНИЯ';
  }
}

syncSettings();
syncContinueButton();
setSettingsOpen(false);
cameraToggle?.addEventListener('click',()=>setToggle(cameraToggle,!cameraMotion,storage.camera));
uiMotionToggle?.addEventListener('click',()=>setToggle(uiMotionToggle,!uiMotion,storage.uiMotion));
settingsButton?.addEventListener('click',()=>setSettingsOpen(true));
settingsClose?.addEventListener('click',()=>setSettingsOpen(false));
settingsPanel?.addEventListener('click',event=>{
  if(event.target===settingsPanel)setSettingsOpen(false);
});
window.addEventListener('corepolis:save-changed',syncContinueButton);
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&settingsPanel?.classList.contains('open')){
    event.stopPropagation();
    setSettingsOpen(false);
  }
},{capture:true});

function leaveMenu(mode='new'){
  if(!root||root.classList.contains('leaving'))return;
  if(mode==='new'&&hasCompatibleSave()){
    const replace=window.confirm('Начать новую игру? Текущее сохранение будет удалено.');
    if(!replace)return;
    clearSave();
  }
  if(mode==='continue'&&!hasCompatibleSave()){
    syncContinueButton();
    return;
  }

  setSettingsOpen(false);
  root.classList.add('leaving');
  document.body.classList.remove('menu-open');
  window.dispatchEvent(new CustomEvent('corepolis:start',{detail:{mode}}));
  setTimeout(()=>{
    running=false;
    if(frame)cancelAnimationFrame(frame);
    loadingObserver?.disconnect?.();
    if(resizeHandler)window.removeEventListener('resize',resizeHandler);
    renderer?.dispose?.();
    root.remove();
  },700);
}
startButton?.addEventListener('click',()=>leaveMenu('new'));
continueButton?.addEventListener('click',()=>leaveMenu('continue'));

const autoStart=sessionStorage.getItem('corepolis:auto-start');
if(autoStart==='new'||autoStart==='continue'){
  sessionStorage.removeItem('corepolis:auto-start');
  queueMicrotask(()=>leaveMenu(autoStart));
}

function startSceneWhenGameIsLoaded(){
  if(!root||!canvas){
    running=false;
    return;
  }
  const loading=document.querySelector('#loading-screen');
  if(!loading||loading.classList.contains('done')){
    initScene().catch(disableScene);
    return;
  }
  loadingObserver=new MutationObserver(()=>{
    if(!loading.classList.contains('done'))return;
    loadingObserver.disconnect();
    loadingObserver=null;
    initScene().catch(disableScene);
  });
  loadingObserver.observe(loading,{attributes:true,attributeFilter:['class']});
}
function disableScene(error){
  console.warn('[Corepolis] Main menu 3D background disabled:',error);
}
startSceneWhenGameIsLoaded();

async function initScene(){
  if(!running||!root?.isConnected)return;
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<720?1.25:1.65));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.03;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x78b8c2);
  scene.fog=new THREE.Fog(0x8fc6ca,43,82);

  const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,160);
  const target=new THREE.Vector3(0,1.8,0);
  camera.position.set(31,25,31);
  camera.lookAt(target);

  scene.add(new THREE.HemisphereLight(0xeaf7ee,0x6f654c,2.35));
  const sun=new THREE.DirectionalLight(0xffefc6,3.7);
  sun.position.set(-20,34,24);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1536,1536);
  Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34});
  scene.add(sun);

  const ocean=new THREE.Mesh(
    new THREE.PlaneGeometry(150,150,24,24),
    new THREE.MeshStandardMaterial({
      color:0x3aa4b5,roughness:.76,metalness:.02,transparent:true,opacity:.92,flatShading:true
    })
  );
  ocean.rotation.x=-Math.PI/2;
  ocean.position.y=-1.72;
  ocean.receiveShadow=true;
  scene.add(ocean);

  const island=new THREE.Group();
  island.rotation.y=-.18;
  scene.add(island);

  const cliff=new THREE.Mesh(
    new THREE.CylinderGeometry(18.8,16.2,3.0,22,2,false),
    new THREE.MeshStandardMaterial({color:0x806346,roughness:1,flatShading:true})
  );
  cliff.position.y=-.18;
  cliff.castShadow=cliff.receiveShadow=true;
  island.add(cliff);

  const stoneShelf=new THREE.Mesh(
    new THREE.CylinderGeometry(17.3,16.5,.65,22,1,false),
    new THREE.MeshStandardMaterial({color:0x8d8d78,roughness:1,flatShading:true})
  );
  stoneShelf.position.y=.98;
  stoneShelf.castShadow=stoneShelf.receiveShadow=true;
  island.add(stoneShelf);

  const grass=new THREE.Mesh(
    new THREE.CylinderGeometry(17.7,17.35,.54,22,1,false),
    new THREE.MeshStandardMaterial({color:0x7ba767,roughness:1,flatShading:true})
  );
  grass.position.y=1.43;
  grass.castShadow=grass.receiveShadow=true;
  island.add(grass);

  addMountains(island);
  addFarms(island);

  const loader=new GLTFLoader();
  const loaded=new Map();
  const load=async key=>{
    if(loaded.has(key))return loaded.get(key);
    const promise=loader.loadAsync(ASSETS[key]).then(gltf=>gltf.scene);
    loaded.set(key,promise);
    return promise;
  };

  const modelKeys=[...ASSET_VARIANTS.house,'market','windmill','lumbermill','quarry',...ASSET_VARIANTS.tree,...ASSET_VARIANTS.rock,'wheat4'];
  await Promise.all(modelKeys.map(key=>load(key).catch(()=>null)));
  if(!running||!root?.isConnected)return;

  const windmillFans=[];
  const addModel=async(key,position,yaw=0)=>{
    const source=await load(key).catch(()=>null);
    if(!source)return null;
    const visual=createWorldModel(source.clone(true),key);
    prepareModel(visual);
    const holder=new THREE.Group();
    holder.position.set(position[0],1.72,position[1]);
    holder.rotation.y=yaw;
    holder.add(visual);
    island.add(holder);
    if(key==='windmill'){
      const fan=visual.getObjectByName('corepolis_windmill_rotor');
      if(fan)windmillFans.push(fan);
    }
    return holder;
  };

  const homes=[
    [-8,-3,.25],[-5,-6,-.55],[-2,-7,.6],[2,-7,-.25],[6,-5,.5],[8,-2,-.4],
    [7,2,.15],[4,5,-.5],[1,6,.3],[-3,6,-.15],[-7,4,.55],[-9,1,-.35]
  ];
  await Promise.all(homes.map(([x,z,yaw])=>addModel(assetVariant('house',x,z),[x,z],yaw)));
  await Promise.all([
    addModel('market',[0,-3],.18),
    addModel('windmill',[-4,1],.55),
    addModel('lumbermill',[5,1],-.38),
    addModel('quarry',[8,5],.3)
  ]);

  const trees=[
    [-12,-2],[-11,2],[-10,5],[-8,8],[-5,9],[-2,10],[2,10],[5,9],[9,8],[11,5],
    [12,1],[11,-4],[9,-8],[6,-10],[2,-11],[-3,-10],[-7,-9],[-10,-7],[-12,-5],
    [-6,2],[-7,0],[5,6],[7,6],[7,-1]
  ];
  await Promise.all(trees.map(([x,z],index)=>addModel(assetVariant('tree',x,z),[x,z],(index*.73)%6.28)));

  const rocks=[[-13,0],[-11,7],[-6,11],[6,10],[11,6],[12,-5],[7,-10],[-9,-8]];
  await Promise.all(rocks.map(([x,z],index)=>addModel(assetVariant('rock',x,z),[x,z],index*.61)));

  const wheat=await load('wheat4').catch(()=>null);
  if(wheat){
    const farmCenters=[[-2,1],[1,1],[-1,4],[2,4]];
    for(let i=0;i<farmCenters.length;i++){
      const [x,z]=farmCenters[i];
      const crop=fitModelToBounds(wheat.clone(true),2.55,1.4);
      prepareModel(crop);
      const holder=new THREE.Group();
      holder.position.set(x,1.82,z);
      holder.rotation.y=(i%2)*Math.PI*.5;
      holder.add(crop);
      island.add(holder);
    }
  }

  const clock=new THREE.Clock();
  let angle=Math.PI*.23;
  const render=()=>{
    if(!running)return;
    const dt=Math.min(.05,clock.getDelta());
    if(cameraMotion){
      angle+=dt*.035;
      const radius=36.5;
      camera.position.x=Math.cos(angle)*radius;
      camera.position.z=Math.sin(angle)*radius;
      camera.position.y=23.5+Math.sin(angle*.72)*1.25;
      camera.lookAt(target);
    }
    for(const fan of windmillFans)fan.rotation.z+=dt*.72;
    ocean.position.y=-1.72+Math.sin(performance.now()*.00045)*.035;
    renderer.render(scene,camera);
    frame=requestAnimationFrame(render);
  };

  resizeHandler=()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight,false);
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<720?1.25:1.65));
  };
  window.addEventListener('resize',resizeHandler);
  render();
}

function prepareModel(root){
  root.traverse(object=>{
    if(!object.isMesh)return;
    object.castShadow=true;
    object.receiveShadow=true;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials){
      if(material?.map)material.map.colorSpace=THREE.SRGBColorSpace;
    }
  });
}

function addMountains(island){
  const rockMaterial=new THREE.MeshStandardMaterial({color:0x7d8176,roughness:1,flatShading:true});
  const grassMaterial=new THREE.MeshStandardMaterial({color:0x6f965e,roughness:1,flatShading:true});
  const peaks=[[-8,8,4.3,2.8],[-5,10,3.6,2.4],[-10,6,3.25,2.2],[9,8,3.8,2.7],[11,6,3.0,2.1]];
  for(const [x,z,height,radius] of peaks){
    const shoulder=new THREE.Mesh(new THREE.ConeGeometry(radius*1.25,height*.58,7),grassMaterial);
    shoulder.position.set(x,1.75+height*.29,z);
    shoulder.castShadow=shoulder.receiveShadow=true;
    island.add(shoulder);
    const peak=new THREE.Mesh(new THREE.ConeGeometry(radius,height,7),rockMaterial);
    peak.position.set(x,1.74+height*.5,z);
    peak.rotation.y=(x+z)*.17;
    peak.castShadow=peak.receiveShadow=true;
    island.add(peak);
  }
}

function addFarms(island){
  const soilMaterial=new THREE.MeshStandardMaterial({color:0x7e5930,roughness:1,flatShading:true});
  const ridgeMaterial=new THREE.MeshStandardMaterial({color:0x9b6d38,roughness:1,flatShading:true});
  const farms=[[-2,1],[1,1],[-1,4],[2,4]];
  for(const [x,z] of farms){
    const plot=new THREE.Mesh(new THREE.BoxGeometry(3.0,.14,2.4),soilMaterial);
    plot.position.set(x,1.77,z);
    plot.castShadow=plot.receiveShadow=true;
    island.add(plot);
    for(let row=-1;row<=1;row++){
      const ridge=new THREE.Mesh(new THREE.BoxGeometry(2.72,.11,.25),ridgeMaterial);
      ridge.position.set(x,1.88,z+row*.58);
      ridge.castShadow=true;
      island.add(ridge);
    }
  }
}
