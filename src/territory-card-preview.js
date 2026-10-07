import { createWorldModel } from './model-layout.js?v=research-1';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GRID } from './config.js?v=research-1';
import { ASSETS, assetVariant } from './models.js?v=research-1';
import { buildTerrainTile, disposeTerrainTile } from './terrain.js?v=water-v2-1';

const WIDTH=420;
const HEIGHT=330;
const loader=new GLTFLoader();
const assetCache=new Map();
const imageCache=new Map();
let runtime=null;
let renderer=null;
let handObserver=null;
let scheduled=false;

function rotatedCells(card){
  const cells=card?.fragment?.cells||[];
  const rotation=((card?.rotation||0)%4+4)%4;
  return cells.map(cell=>{
    let x=cell.x,z=cell.z;
    if(rotation===1)[x,z]=[-z,x];
    else if(rotation===2)[x,z]=[-x,-z];
    else if(rotation===3)[x,z]=[z,-x];
    return{x,z,content:cell.content||null};
  });
}

function signature(card){
  return `${card.id}:${card.rotation||0}:${(card.fragment?.cells||[]).map(cell=>`${cell.x},${cell.z},${cell.content||'-'}`).join('|')}`;
}

function ensureRenderer(){
  if(renderer)return renderer;
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  renderer.setPixelRatio(1);
  renderer.setSize(WIDTH,HEIGHT,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  return renderer;
}

function loadAsset(key){
  const url=ASSETS[key];
  if(!url)return Promise.reject(new Error(`Unknown preview asset: ${key}`));
  if(!assetCache.has(url))assetCache.set(url,loader.loadAsync(url).then(gltf=>gltf.scene));
  return assetCache.get(url);
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

async function realResourceModel(cell){
  if(cell.content!=='tree'&&cell.content!=='rock')return null;
  const tree=cell.content==='tree';
  const variant=assetVariant(tree?'tree':'rock',cell.x,cell.z);
  const source=await loadAsset(variant);
  const model=createWorldModel(source.clone(true),variant);
  prepareModel(model);
  model.rotation.y=tree?(cell.x*.9+cell.z*1.4):(cell.x*1.3-cell.z);
  model.position.set(cell.x*GRID.tileSize,.12,cell.z*GRID.tileSize);
  return model;
}

async function buildFragmentModel(card){
  const cells=rotatedCells(card);
  if(!cells.length)return null;
  const occupied=new Set(cells.map(cell=>`${cell.x},${cell.z}`));
  const group=new THREE.Group();
  const terrainParts=[];

  for(const cell of cells){
    const terrain=buildTerrainTile({
      x:cell.x,
      z:cell.z,
      tileSize:GRID.tileSize,
      cellKey:`card-preview:${card.id}:${cell.x},${cell.z}`,
      hasLand:(x,z)=>occupied.has(`${x},${z}`)
    });
    terrain.position.set(cell.x*GRID.tileSize,0,cell.z*GRID.tileSize);
    terrainParts.push(terrain);
    group.add(terrain);
  }

  const resources=await Promise.all(cells.map(realResourceModel));
  for(const model of resources)if(model)group.add(model);

  group.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(group);
  const center=box.getCenter(new THREE.Vector3());
  group.position.x-=center.x;
  group.position.z-=center.z;
  group.updateMatrixWorld(true);

  return{group,terrainParts};
}

function addLighting(scene,span){
  scene.add(new THREE.HemisphereLight(0xf1f7dc,0x514738,2.35));
  const key=new THREE.DirectionalLight(0xffdfaa,3.25);
  key.position.set(span*.75,span*1.35,span*.95);
  key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  scene.add(key);
  const fill=new THREE.DirectionalLight(0x8ab9c9,1.05);
  fill.position.set(-span*.8,span*.55,-span*.7);
  scene.add(fill);
}

async function renderCard(card){
  const key=signature(card);
  if(imageCache.has(key))return imageCache.get(key);

  const promise=(async()=>{
    const built=await buildFragmentModel(card);
    if(!built)return null;
    const {group,terrainParts}=built;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x26352f);

    group.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(group);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    const span=Math.max(size.x,size.z,GRID.tileSize*1.15);
    addLighting(scene,span);

    const waterGeometry=new THREE.CircleGeometry(span*.92,48);
    const waterMaterial=new THREE.MeshStandardMaterial({color:0x3d9eaa,roughness:.72,metalness:0,transparent:true,opacity:.72});
    const water=new THREE.Mesh(waterGeometry,waterMaterial);
    water.rotation.x=-Math.PI/2;
    water.position.y=box.min.y-.05;
    water.receiveShadow=true;
    scene.add(water);
    scene.add(group);

    const camera=new THREE.PerspectiveCamera(31,WIDTH/HEIGHT,.1,120);
    const distance=span*1.18+3.2;
    camera.position.set(distance*.72,Math.max(4.0,size.y+span*.56),distance);
    camera.lookAt(0,Math.max(.18,center.y*.46),0);

    const activeRenderer=ensureRenderer();
    activeRenderer.render(scene,camera);
    const image=activeRenderer.domElement.toDataURL('image/png');

    for(const terrain of terrainParts)disposeTerrainTile(terrain);
    waterGeometry.dispose();
    waterMaterial.dispose();
    scene.remove(group,water);
    return image;
  })().catch(error=>{
    console.warn('[Corepolis] Territory card preview failed:',error);
    return null;
  });

  imageCache.set(key,promise);
  return promise;
}

function pruneCache(){
  if(!runtime)return;
  const active=new Set(runtime.state.hand.filter(card=>card.type==='island').map(signature));
  for(const key of imageCache.keys())if(!active.has(key))imageCache.delete(key);
}

async function applyPreview(card){
  if(!runtime||card.type!=='island')return;
  const key=signature(card);
  const button=runtime.ui.hand.querySelector(`[data-card-id="${card.id}"]`);
  if(!button)return;

  button.classList.add('territory-real-card');
  button.querySelector('.fragment-map')?.remove();
  const preview=button.querySelector('.card-preview');
  if(!preview)return;
  preview.classList.add('territory-real-preview','loading');
  preview.innerHTML='';
  preview.dataset.territoryPreviewKey=key;

  const image=await renderCard(card);
  const current=runtime.ui.hand.querySelector(`[data-card-id="${card.id}"] .card-preview`);
  const liveCard=runtime.state.hand.find(item=>item.id===card.id);
  if(!image||!current||!liveCard||signature(liveCard)!==key||current.dataset.territoryPreviewKey!==key)return;

  current.style.backgroundImage=`url("${image}")`;
  current.classList.remove('placeholder','loading');
  current.classList.add('loaded');
}

function refresh(){
  if(!runtime)return;
  pruneCache();
  for(const card of runtime.state.hand){
    if(card.type==='island')applyPreview(card);
  }
}

function scheduleRefresh(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    refresh();
  });
}

function boot(){
  if(runtime||!window.__corepolisRuntime)return;
  runtime=window.__corepolisRuntime;
  handObserver=new MutationObserver(scheduleRefresh);
  handObserver.observe(runtime.ui.hand,{childList:true,subtree:true});
  window.addEventListener('corepolis:session-ready',scheduleRefresh);
  window.addEventListener('corepolis:save-changed',scheduleRefresh);
  scheduleRefresh();
}

if(window.__corepolisRuntime)boot();
else window.addEventListener('corepolis:runtime-ready',boot,{once:true});
