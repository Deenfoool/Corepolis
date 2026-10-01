import * as THREE from 'three';
import { DECK_WEIGHTS } from './config.js';

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for biomes.');

const {state,refreshLucide}=runtime;
const BASE_WEIGHTS=new Map(DECK_WEIGHTS.map(([type,weight])=>[type,weight]));
const colorScratch=new THREE.Color();
const hsl={h:0,s:0,l:0};
let activeBiome=null;
let paintTimer=null;

const BIOMES=[
  {
    id:'verdant',name:'Зелёный берег',icon:'trees',
    description:'Больше леса и лесопилок. Глубокая зелень и прохладные скалы.',
    short:'+ лес · + лесопилки',
    weights:{tree:1.45,lumbermill:1.30,rock:.82,quarry:.88},
    grass:{h:-.025,s:1.10,l:.96},cliff:{h:-.012,s:.92,l:.96}
  },
  {
    id:'highland',name:'Каменные гряды',icon:'mountain',
    description:'Чаще встречаются камни и каменоломни. Сдержанная высокогорная палитра.',
    short:'+ камни · + каменоломни',
    weights:{rock:1.50,quarry:1.32,tree:.82,lumbermill:.88},
    grass:{h:.015,s:.72,l:.94},cliff:{h:.018,s:.72,l:1.04}
  },
  {
    id:'golden',name:'Золотые низины',icon:'wheat',
    description:'Больше полей и домов. Тёплая трава и солнечный берег.',
    short:'+ поля · + дома',
    weights:{field:1.30,house:1.28,clear:.82,rock:.90},
    grass:{h:-.075,s:.92,l:1.08},cliff:{h:-.025,s:1.06,l:1.04}
  },
  {
    id:'archipelago',name:'Ветреный архипелаг',icon:'waves',
    description:'Чаще приходят расширения территории и морские карты. Более холодный островной тон.',
    short:'+ территории · + море',
    weights:{island:1.48,pier:1.38,fishingShop:1.28,field:.90},
    grass:{h:.045,s:.90,l:1.00},cliff:{h:.030,s:.82,l:1.00}
  }
];

function hashString(value){
  let hash=2166136261;
  const text=String(value||'COREPOLIS');
  for(let i=0;i<text.length;i++){
    hash^=text.charCodeAt(i);
    hash=Math.imul(hash,16777619);
  }
  hash^=hash>>>16;
  return hash>>>0;
}

function biomeForSeed(seed){
  return BIOMES[hashString(`${seed}:biome`)%BIOMES.length];
}

function clamp01(value){
  return Math.max(0,Math.min(1,value));
}

function paletteColor(color,kind){
  if(!activeBiome)return color;
  const profile=activeBiome[kind];
  color.getHSL(hsl);
  const hue=(hsl.h+profile.h+1)%1;
  color.setHSL(hue,clamp01(hsl.s*profile.s),clamp01(hsl.l*profile.l));
  return color;
}

function isGrassColor(color){
  color.getHSL(hsl);
  return hsl.h>.16&&hsl.h<.48&&hsl.s>.18;
}

function recolorVertexMesh(mesh){
  const geometry=mesh.geometry;
  const attribute=geometry?.getAttribute?.('color');
  if(!attribute)return;
  if(!geometry.userData.corepolisBiomeBaseColors){
    geometry.userData.corepolisBiomeBaseColors=Array.from(attribute.array);
  }
  const base=geometry.userData.corepolisBiomeBaseColors;
  const positions=geometry.getAttribute('position');
  for(let i=0;i<attribute.count;i++){
    colorScratch.setRGB(base[i*3],base[i*3+1],base[i*3+2]);
    const grass=(positions?.getY(i)??0)>.035&&isGrassColor(colorScratch);
    paletteColor(colorScratch,grass?'grass':'cliff');
    attribute.setXYZ(i,colorScratch.r,colorScratch.g,colorScratch.b);
  }
  attribute.needsUpdate=true;
}

function recolorMaterial(material){
  if(!material?.color||material.vertexColors)return;
  material.userData??={};
  if(!Number.isInteger(material.userData.corepolisBiomeBaseColor)){
    material.userData.corepolisBiomeBaseColor=material.color.getHex();
  }
  colorScratch.setHex(material.userData.corepolisBiomeBaseColor);
  paletteColor(colorScratch,isGrassColor(colorScratch)?'grass':'cliff');
  material.color.copy(colorScratch);
  material.needsUpdate=true;
}

function recolorTerrain(root){
  if(!root||root.userData.corepolisBiome===activeBiome?.id)return;
  root.traverse(object=>{
    if(!object.isMesh)return;
    recolorVertexMesh(object);
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials)recolorMaterial(material);
  });
  root.userData.corepolisBiome=activeBiome?.id||'';
}

function paintWorld(){
  if(!activeBiome)return;
  for(const tile of state.land.values())recolorTerrain(tile.terrain);
}

function applyDeckWeights(){
  if(!activeBiome)return;
  for(const entry of DECK_WEIGHTS){
    const type=entry[0];
    const base=BASE_WEIGHTS.get(type)??entry[1];
    const multiplier=activeBiome.weights[type]??1;
    entry[1]=Math.max(1,Math.round(base*multiplier));
  }
}

function installPauseUi(){
  const card=document.querySelector('.pause-card');
  if(!card||document.querySelector('#pause-biome'))return;
  const panel=document.createElement('div');
  panel.id='pause-biome';
  panel.className='biome-panel pause-biome';
  panel.innerHTML=`
    <i data-biome-icon data-lucide="leaf"></i>
    <span><small>БИОМ ОСТРОВА</small><b data-biome-name></b><em data-biome-short></em></span>`;
  const seed=document.querySelector('#pause-run-seed');
  if(seed)seed.insertAdjacentElement('afterend',panel);
  else card.querySelector('.pause-actions')?.insertAdjacentElement('afterend',panel);
  refreshLucide?.();
}

function installCapitalUi(){
  const card=document.querySelector('#capital-finale .capital-card');
  const actions=card?.querySelector('.capital-actions');
  if(!card||!actions||card.querySelector('#capital-biome'))return!!card;
  const panel=document.createElement('div');
  panel.id='capital-biome';
  panel.className='biome-panel capital-biome';
  panel.innerHTML=`
    <i data-biome-icon data-lucide="leaf"></i>
    <span><small>БИОМ ЗАБЕГА</small><b data-biome-name></b><em data-biome-description></em></span>`;
  const seed=card.querySelector('#capital-run-seed');
  (seed||actions).insertAdjacentElement('beforebegin',panel);
  refreshLucide?.();
  updateUi();
  return true;
}

function updateUi(){
  if(!activeBiome)return;
  document.querySelectorAll('[data-biome-name]').forEach(node=>{node.textContent=activeBiome.name;});
  document.querySelectorAll('[data-biome-short]').forEach(node=>{node.textContent=activeBiome.short;});
  document.querySelectorAll('[data-biome-description]').forEach(node=>{node.textContent=activeBiome.description;});
  document.querySelectorAll('[data-biome-icon]').forEach(node=>{node.setAttribute('data-lucide',activeBiome.icon);});
  refreshLucide?.();
}

function selectForCurrentSeed(){
  const seed=window.__corepolisSeedRuntime?.getSeed?.()||'COREPOLIS';
  activeBiome=biomeForSeed(seed);
  applyDeckWeights();
  installPauseUi();
  installCapitalUi();
  updateUi();
  paintWorld();
}

window.addEventListener('corepolis:start',selectForCurrentSeed);
window.addEventListener('corepolis:session-ready',()=>{
  selectForCurrentSeed();
  if(!paintTimer)paintTimer=setInterval(paintWorld,300);
});
window.addEventListener('corepolis:save-changed',event=>{
  if(event.detail?.hasSave===false){
    for(const entry of DECK_WEIGHTS)entry[1]=BASE_WEIGHTS.get(entry[0])??entry[1];
  }
});

installPauseUi();
if(!installCapitalUi()){
  const observer=new MutationObserver(()=>{
    if(installCapitalUi())observer.disconnect();
  });
  observer.observe(document.body,{childList:true,subtree:true});
}
selectForCurrentSeed();

window.__corepolisBiomeRuntime={
  get:()=>activeBiome?{id:activeBiome.id,name:activeBiome.name,description:activeBiome.description,short:activeBiome.short}:null,
  all:()=>BIOMES.map(({id,name,description,short})=>({id,name,description,short})),
  repaint:paintWorld
};
