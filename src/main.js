import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CARD_DEFS, DECK_WEIGHTS, DIRECTIONS, GRID } from './config.js';
import { ASSETS } from './models.js?v=tideline-sample-1';
import { buildTerrainTile, disposeTerrainTile } from './terrain.js?v=coast-stitch-3';
import { createBoatVisual, createLighthouseVisual } from './marine-visuals.js?v=tideline-sample-1';

const $=s=>document.querySelector(s);
const canvas=$('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fcbd8);
scene.fog=new THREE.Fog(0x9fd2dc,52,105);

const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,180);
camera.position.set(25,31,31);
const controls=new MapControls(camera,renderer.domElement);
controls.target.set(0,0,0);
controls.enableDamping=true;
controls.dampingFactor=.08;
controls.screenSpacePanning=false;
controls.minDistance=17;
controls.maxDistance=70;
controls.maxPolarAngle=Math.PI*.45;
controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;
controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;

scene.add(new THREE.HemisphereLight(0xeaf9ff,0x7d6849,2.2));
const sun=new THREE.DirectionalLight(0xfff2cf,3.6);
sun.position.set(30,44,20);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45});
scene.add(sun);

const world=new THREE.Group();
scene.add(world);
const water=new THREE.Mesh(
  new THREE.CircleGeometry(70,96),
  new THREE.MeshPhysicalMaterial({color:0x4db3c7,roughness:.28,transparent:true,opacity:.93})
);
water.rotation.x=-Math.PI/2;
water.position.y=-.62;
water.receiveShadow=true;
scene.add(water);
const seabed=new THREE.Mesh(
  new THREE.CircleGeometry(72,96),
  new THREE.MeshStandardMaterial({color:0x83c6b7,roughness:1})
);
seabed.rotation.x=-Math.PI/2;
seabed.position.y=-1.28;
scene.add(seabed);
const waterPlane=new THREE.Mesh(
  new THREE.PlaneGeometry(140,140),
  new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
);
const hoverMarker=new THREE.Mesh(
  new RoundedBoxGeometry(GRID.tileSize*.9,.08,GRID.tileSize*.9,3,.18),
  new THREE.MeshBasicMaterial({color:0xf6df86,transparent:true,opacity:.28,depthWrite:false})
);
hoverMarker.visible=false;
hoverMarker.position.y=.17;
scene.add(hoverMarker);
waterPlane.rotation.x=-Math.PI/2;
waterPlane.position.y=-.54;
scene.add(waterPlane);

const loader=new GLTFLoader();
const cache=new Map();
const resolvedAssets=new Map();
const previewRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
previewRenderer.setPixelRatio(1);
previewRenderer.setSize(512,320,false);
previewRenderer.outputColorSpace=THREE.SRGBColorSpace;
previewRenderer.toneMapping=THREE.ACESFilmicToneMapping;
previewRenderer.toneMappingExposure=1.08;
previewRenderer.setClearColor(0x000000,0);
const ray=new THREE.Raycaster();
const pointer=new THREE.Vector2();

const ui={
  loadingScreen:$('#loading-screen'),loadingBar:$('#loading-bar'),loadingProgress:$('#loading-progress'),
  loadingDetail:$('#loading-detail'),loadingStage:$('#loading-stage'),loadingPhraseWindow:$('#loading-phrase-window'),
  loadingPhraseCurrent:$('#loading-phrase-current'),loadingPhraseNext:$('#loading-phrase-next'),
  hand:$('#hand'),handCount:$('#hand-count'),reserveZone:$('#reserve-zone'),reserveStack:$('#reserve-stack'),reserveCount:$('#reserve-count'),
  selectionHint:$('#selection-hint'),harvestScore:$('#harvest-score'),comboCount:$('#combo-count'),
  landCount:$('#land-count'),woodCount:$('#wood-count'),stoneCount:$('#stone-count'),
  objectiveTitle:$('#objective-title'),objectiveCopy:$('#objective-copy'),
  fieldStatus:$('#field-status'),toast:$('#toast'),tileInfo:$('#tile-info'),
  tileTitle:$('#tile-title'),tileCopy:$('#tile-copy'),objectiveProgress:$('#objective-progress'),
  objectiveProgressName:$('#objective-progress-name'),objectiveProgressLabel:$('#objective-progress-label'),
  marineChoice:$('#marine-choice')
};

const state={
  land:new Map(),
  hand:[],
  reserve:[],
  selectedCardId:null,
  nextCardId:1,
  nextFieldOrder:1,
  harvestScore:0,
  resources:{wood:0,stone:0},
  comboCount:0,
  millLevel:1,
  millCell:null,
  unlocks:{mill:false,market:false,marine:false,fishingShop:false},
  waterStructures:new Map(),
  seaRoutes:new Set(),
  marineActors:[],
  lighthouseBeams:[],
  marineChoiceOpen:false,
  millBlades:[],
  bladeBoost:0,
  tweens:[],
  ambientActors:[],
  cardPreviews:new Map(),
  knownHandCardIds:new Set(),
  inputLocked:false
};

const key=(x,z)=>`${x},${z}`;
const pos=(x,z)=>new THREE.Vector3(x*GRID.tileSize,0,z*GRID.tileSize);
const HAND_LIMIT=5;
const easeOut=t=>1-Math.pow(1-t,3);
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

function refreshLucide(){
  if(window.lucide?.createIcons){
    window.lucide.createIcons();
  }
}

const LOADING_PHRASES=[
  'Поднимаем остров из воды',
  'Собираем берег по кусочкам',
  'Укладываем свежий дёрн',
  'Расставляем камни у воды',
  'Сажаем первые деревья',
  'Разравниваем землю под поля',
  'Проверяем, не уплыл ли остров',
  'Готовим место для будущих построек',
  'Перемешиваем колоду',
  'Прячем лишние карты в запас',
  'Разгоняем ветер над полями',
  'Проверяем стыки берегов',
  'Добавляем траву по краям',
  'Будим остров',
  'Последний штрих…'
];
const LOADING_ASSET_STATUS={
  windmill:'Подготавливаем мельницу',
  treeA:'Высаживаем первые деревья',
  treeB:'Добавляем лесу разнообразия',
  rockA:'Раскладываем камни у воды',
  rockC:'Формируем каменистый берег',
  house:'Готовим будущие дома',
  market:'Собираем рыночную площадь',
  lumbermill:'Подвозим брёвна к лесопилке',
  quarry:'Готовим каменоломню',
  wheat1:'Готовим молодые посевы',
  wheat2:'Поднимаем первые ростки',
  wheat3:'Выращиваем поля',
  wheat4:'Доводим урожай до зрелости',
  tidelineBoardingPlank:'Собираем настил причала',
  tidelineRailing:'Ставим портовые перила',
  tidelineBollard:'Крепим швартовые тумбы',
  tidelineAnchor:'Готовим якорь',
  tidelineBuoyGarland:'Развешиваем портовые буи',
  tidelineBellStand:'Ставим портовый колокол',
  tidelineDockChair:'Обживаем причал',
  tidelineBoatHouse:'Готовим рыбацкую лавку',
  tidelineBaitBox:'Раскладываем снасти',
  tidelineCargoBarrel:'Подвозим портовый груз'
};
let loadingPhraseIndex=1;
let loadingPhraseTimer=null;
let loadingPhraseBusy=false;
let pendingLoadingPhrase=null;

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function reducedMotion(){
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function setLoadingProgress(percent,stage,detail){
  const safe=Math.max(0,Math.min(100,Math.round(percent)));
  ui.loadingBar.style.width=`${safe}%`;
  ui.loadingProgress.textContent=`${safe}%`;
  if(stage)ui.loadingStage.textContent=stage.toUpperCase();
  if(detail)ui.loadingDetail.textContent=detail;
}
function changeLoadingPhrase(text){
  if(!text||!ui.loadingPhraseCurrent||ui.loadingPhraseCurrent.textContent===text)return Promise.resolve();
  if(reducedMotion()){
    ui.loadingPhraseCurrent.textContent=text;
    ui.loadingPhraseNext.textContent='';
    return Promise.resolve();
  }
  if(loadingPhraseBusy){
    pendingLoadingPhrase=text;
    return Promise.resolve();
  }

  loadingPhraseBusy=true;
  ui.loadingPhraseNext.textContent=text;
  ui.loadingPhraseWindow.classList.add('shifting');
  return wait(430).then(()=>{
    ui.loadingPhraseCurrent.textContent=text;
    ui.loadingPhraseNext.textContent='';
    ui.loadingPhraseWindow.classList.remove('shifting');
    loadingPhraseBusy=false;
    if(pendingLoadingPhrase){
      const pending=pendingLoadingPhrase;
      pendingLoadingPhrase=null;
      return changeLoadingPhrase(pending);
    }
  });
}
function startLoadingPhrases(){
  ui.loadingPhraseCurrent.textContent=LOADING_PHRASES[0];
  loadingPhraseIndex=1;
  if(reducedMotion())return;
  clearInterval(loadingPhraseTimer);
  loadingPhraseTimer=setInterval(()=>{
    if(loadingPhraseBusy)return;
    const phrase=LOADING_PHRASES[loadingPhraseIndex%LOADING_PHRASES.length];
    loadingPhraseIndex++;
    changeLoadingPhrase(phrase);
  },1150);
}
function stopLoadingPhrases(){
  clearInterval(loadingPhraseTimer);
  loadingPhraseTimer=null;
  pendingLoadingPhrase=null;
}
async function finishLoadingScreen(){
  stopLoadingPhrases();
  if(loadingPhraseBusy)await wait(440);
  setLoadingProgress(100,'МИР ГОТОВ','Всё на своих местах');
  await changeLoadingPhrase('Остров готов.');
  ui.loadingScreen.querySelector('.loading-card')?.classList.add('ready');
  if(!reducedMotion())await wait(520);
  ui.loadingScreen.classList.add('done');
  setTimeout(()=>ui.loadingScreen.remove(),620);
}
const load=url=>{
  if(!cache.has(url)){
    cache.set(url,loader.loadAsync(url).then(g=>{
      resolvedAssets.set(url,g.scene);
      return g.scene;
    }));
  }
  return cache.get(url);
};

function tween(duration,update,ease=easeOut){
  return new Promise(resolve=>state.tweens.push({duration,elapsed:0,update,ease,resolve}));
}
function updateTweens(dt){
  for(let i=state.tweens.length-1;i>=0;i--){
    const t=state.tweens[i];
    t.elapsed+=dt;
    const p=Math.min(1,t.elapsed/t.duration);
    t.update(t.ease(p),p);
    if(p>=1){
      state.tweens.splice(i,1);
      t.resolve();
    }
  }
}
function animatePop(object,duration=.34){
  if(!object)return Promise.resolve();
  const target=object.scale.clone();
  object.scale.copy(target).multiplyScalar(.12);
  const startY=object.position.y-.18;
  const endY=object.position.y;
  object.position.y=startY;
  return tween(duration,p=>{
    const bounce=1+Math.sin(p*Math.PI)*.12;
    object.scale.copy(target).multiplyScalar((.12+.88*p)*bounce);
    object.position.y=THREE.MathUtils.lerp(startY,endY,p);
  });
}
function pulse(object,duration=.38,strength=.16){
  if(!object)return Promise.resolve();
  const base=object.scale.clone();
  return tween(duration,p=>{
    const bump=Math.sin(p*Math.PI)*strength;
    object.scale.copy(base).multiplyScalar(1+bump);
  }).then(()=>object.scale.copy(base));
}
function spawnRing(position,color=0xf2c75c){
  const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.45,.58,48),material);
  ring.rotation.x=-Math.PI/2;
  ring.position.copy(position).add(new THREE.Vector3(0,.18,0));
  ring.scale.setScalar(.4);
  world.add(ring);
  tween(.7,p=>{
    ring.scale.setScalar(.4+p*5);
    material.opacity=.72*(1-p);
    ring.position.y=position.y+.18+p*.25;
  }).then(()=>{
    world.remove(ring);
    ring.geometry.dispose();
    material.dispose();
  });
}
function spawnBurst(position,color=0xf7d36a,count=12){
  const geometry=new THREE.IcosahedronGeometry(.08,0);
  for(let i=0;i<count;i++){
    const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:1,depthWrite:false});
    const m=new THREE.Mesh(geometry,material);
    const a=Math.PI*2*i/count+(i%3)*.17;
    const r=.8+(i%4)*.18;
    const start=position.clone().add(new THREE.Vector3(0,.45,0));
    const end=start.clone().add(new THREE.Vector3(Math.cos(a)*r,.65+(i%3)*.28,Math.sin(a)*r));
    m.position.copy(start);
    world.add(m);
    tween(.58,p=>{
      m.position.lerpVectors(start,end,p);
      m.scale.setScalar(1-p*.65);
      material.opacity=1-p;
    }).then(()=>{
      world.remove(m);
      material.dispose();
    });
  }
}
function spawnCardBurst(position,count=1){
  for(let i=0;i<count;i++){
    const material=new THREE.MeshStandardMaterial({color:0xfff0ae,roughness:.7,transparent:true,opacity:1});
    const card=new THREE.Mesh(new THREE.BoxGeometry(.34,.05,.5),material);
    const start=position.clone().add(new THREE.Vector3((i-(count-1)/2)*.22,.55,0));
    const end=start.clone().add(new THREE.Vector3((i-(count-1)/2)*.65,2.2,-.25));
    card.position.copy(start);
    card.rotation.y=i*.35;
    world.add(card);
    tween(.85,p=>{
      card.position.lerpVectors(start,end,easeOut(p));
      card.rotation.y+=.08;
      card.rotation.z=Math.sin(p*Math.PI)*.35;
      material.opacity=1-p;
    }).then(()=>{
      world.remove(card);
      card.geometry.dispose();
      material.dispose();
    });
  }
}
function animateLandRise(tile){
  const targetY=tile.visual.position.y;
  const baseScale=tile.visual.scale.clone();
  tile.visual.position.y=targetY-1.5;
  tile.visual.scale.set(baseScale.x*.82,baseScale.y*.5,baseScale.z*.82);
  spawnRing(tile.visual.position.clone().setY(0),0x8fd56f);
  return tween(.6,p=>{
    tile.visual.position.y=THREE.MathUtils.lerp(targetY-1.5,targetY,easeOut(p));
    const swell=.82+.18*easeOut(p)+Math.sin(p*Math.PI)*.04;
    tile.visual.scale.set(baseScale.x*swell,THREE.MathUtils.lerp(baseScale.y*.5,baseScale.y,easeOut(p)),baseScale.z*swell);
  }).then(()=>tile.visual.scale.copy(baseScale));
}

function animateBuildingConstruction(t,type,m){
  if(!m)return Promise.resolve();
  const baseScale=m.scale.clone();
  const baseY=m.position.y;
  const baseRot=m.rotation.y;
  spawnRing(t.visual.position.clone(),type==='quarry'?0x9ca8a6:type==='lumbermill'?0xb88a52:0xe8cc74);
  spawnBurst(t.visual.position.clone(),type==='quarry'?0xaab0a7:0xe2c66f,type==='market'?16:11);

  if(type==='house'){
    m.scale.set(baseScale.x*.18,baseScale.y*.05,baseScale.z*.18);
    m.position.y=baseY-.25;
    return tween(.72,p=>{
      const q=easeOut(p);
      const overshoot=1+Math.sin(p*Math.PI)*.07;
      m.scale.set(baseScale.x*(.18+.82*q)*overshoot,baseScale.y*(.05+.95*q),baseScale.z*(.18+.82*q)*overshoot);
      m.position.y=THREE.MathUtils.lerp(baseY-.25,baseY,q);
      m.rotation.y=baseRot+Math.sin((1-p)*Math.PI*2)*.045*(1-p);
    }).then(()=>{m.scale.copy(baseScale);m.position.y=baseY;m.rotation.y=baseRot;});
  }

  if(type==='market'){
    m.scale.set(baseScale.x*.18,baseScale.y*.25,baseScale.z*.18);
    m.position.y=baseY-.12;
    return tween(.76,p=>{
      const q=easeOut(p);
      m.scale.set(baseScale.x*(.18+.82*q),baseScale.y*(.25+.75*q),baseScale.z*(.18+.82*q));
      m.position.y=THREE.MathUtils.lerp(baseY-.12,baseY,q);
      m.rotation.y=baseRot+(1-q)*.28;
    }).then(()=>{m.scale.copy(baseScale);m.position.y=baseY;m.rotation.y=baseRot;});
  }

  if(type==='lumbermill'){
    m.position.y=baseY+2.4;
    m.rotation.y=baseRot-.48;
    m.scale.copy(baseScale).multiplyScalar(.88);
    return tween(.62,p=>{
      const q=easeInOut(p);
      m.position.y=THREE.MathUtils.lerp(baseY+2.4,baseY,q);
      m.rotation.y=THREE.MathUtils.lerp(baseRot-.48,baseRot,q);
      m.scale.copy(baseScale).multiplyScalar(.88+.12*q+Math.sin(p*Math.PI)*.035);
    }).then(()=>{
      m.scale.copy(baseScale);m.position.y=baseY;m.rotation.y=baseRot;
      spawnBurst(t.visual.position.clone(),0xc59b62,14);
    });
  }

  m.position.y=baseY-1.1;
  m.scale.set(baseScale.x*.78,baseScale.y*.72,baseScale.z*.78);
  return tween(.78,p=>{
    const q=easeOut(p);
    m.position.y=THREE.MathUtils.lerp(baseY-1.1,baseY,q);
    const grow=.78+.22*q+Math.sin(p*Math.PI)*.045;
    m.scale.set(baseScale.x*grow,baseScale.y*(.72+.28*q),baseScale.z*grow);
  }).then(()=>{m.scale.copy(baseScale);m.position.y=baseY;spawnBurst(t.visual.position.clone(),0x8c8175,18);});
}

function registerBuildingAmbient(t,type,m){
  if(!m)return;
  if(type==='house'){
    const smoke=new THREE.Group();
    for(let i=0;i<4;i++){
      const mat=new THREE.MeshBasicMaterial({color:0xf0eee4,transparent:true,opacity:.18,depthWrite:false});
      const puff=new THREE.Mesh(new THREE.SphereGeometry(.11+i*.018,8,6),mat);
      puff.position.set(.35,1.9+i*.18,.12);
      smoke.add(puff);
    }
    t.visual.add(smoke);
    t.ambientObjects.push(smoke);
    state.ambientActors.push({type:'smoke',object:smoke,phase:(t.x*13+t.z*7)*.2});
  }
  if(type==='market'){
    const halo=new THREE.Mesh(
      new THREE.TorusGeometry(.62,.04,8,36),
      new THREE.MeshBasicMaterial({color:0xf2cf67,transparent:true,opacity:.34,depthWrite:false})
    );
    halo.rotation.x=Math.PI/2;
    halo.position.y=2.15;
    t.visual.add(halo);
    t.ambientObjects.push(halo);
    state.ambientActors.push({type:'marketHalo',object:halo,phase:(t.x+t.z)*.45});
  }
  if(type==='lumbermill'){
    const saw=new THREE.Mesh(
      new THREE.CylinderGeometry(.38,.38,.055,20),
      new THREE.MeshStandardMaterial({color:0xb6b1a2,metalness:.35,roughness:.55})
    );
    saw.rotation.z=Math.PI/2;
    saw.position.set(.85,.72,.74);
    t.visual.add(saw);
    t.ambientObjects.push(saw);
    state.ambientActors.push({type:'saw',object:saw,phase:0});
  }
  if(type==='quarry'){
    const lamp=new THREE.PointLight(0xffd27a,1.05,4.2,2);
    lamp.position.set(.25,.86,.32);
    t.visual.add(lamp);
    t.ambientObjects.push(lamp);
    const bulb=new THREE.Mesh(
      new THREE.SphereGeometry(.085,8,6),
      new THREE.MeshBasicMaterial({color:0xffda83})
    );
    bulb.position.copy(lamp.position);
    t.visual.add(bulb);
    t.ambientObjects.push(bulb);
    state.ambientActors.push({type:'quarryLamp',object:lamp,phase:(t.x*5-t.z*3)*.35});
  }
}

function updateAmbientActors(time,dt){
  for(const actor of state.ambientActors){
    if(!actor.object?.parent)continue;
    if(actor.type==='smoke'){
      actor.object.children.forEach((puff,i)=>{
        const phase=(time*.00035+actor.phase+i*.22)%1;
        puff.position.y=.55+phase*.95;
        puff.position.x=.1+Math.sin(time*.0012+i)*.08;
        const s=.7+phase*.65;
        puff.scale.setScalar(s);
        if(puff.material)puff.material.opacity=.22*(1-phase);
      });
    }else if(actor.type==='marketHalo'){
      actor.object.rotation.z+=dt*.65;
      actor.object.position.y=1.12+Math.sin(time*.002+actor.phase)*.055;
      actor.object.material.opacity=.25+Math.sin(time*.003+actor.phase)*.08;
    }else if(actor.type==='saw'){
      actor.object.rotation.x+=dt*2.6;
    }else if(actor.type==='quarryLamp'){
      actor.object.intensity=.75+Math.sin(time*.004+actor.phase)*.18;
    }
  }
}

function shadows(root){
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=o.receiveShadow=true;
    for(const m of(Array.isArray(o.material)?o.material:[o.material])){
      if(m?.map)m.map.colorSpace=THREE.SRGBColorSpace;
    }
  });
}
function fit(root,maxXZ,maxY=maxXZ*1.5){
  root.updateMatrixWorld(true);
  let b=new THREE.Box3().setFromObject(root);
  const s=b.getSize(new THREE.Vector3());
  const k=Math.min(maxXZ/Math.max(s.x,s.z,.001),maxY/Math.max(s.y,.001));
  root.scale.multiplyScalar(k);
  root.updateMatrixWorld(true);
  b=new THREE.Box3().setFromObject(root);
  const c=b.getCenter(new THREE.Vector3());
  root.position.set(root.position.x-c.x,root.position.y-b.min.y,root.position.z-c.z);
}

function cloneLoadedAsset(assetKey,maxXZ,maxY=maxXZ*1.5){
  const source=resolvedAssets.get(ASSETS[assetKey]);
  if(!source)throw new Error(`Required asset is not loaded: ${assetKey}`);
  const model=source.clone(true);
  shadows(model);
  fit(model,maxXZ,maxY);
  return model;
}
function createTidelinePierVisual(yaw=0){
  const root=new THREE.Group();
  const deck=cloneLoadedAsset('tidelineBoardingPlank',3.85,1.1);
  deck.rotation.y=Math.PI*.5;deck.position.z=.05;root.add(deck);
  const leftRail=cloneLoadedAsset('tidelineRailing',2.65,.9);
  leftRail.rotation.y=Math.PI*.5;leftRail.position.set(-.92,.17,.05);root.add(leftRail);
  const rightRail=cloneLoadedAsset('tidelineRailing',2.65,.9);
  rightRail.rotation.y=-Math.PI*.5;rightRail.position.set(.92,.17,-.18);root.add(rightRail);
  const bollard=cloneLoadedAsset('tidelineBollard',.58,.75);
  bollard.position.set(.72,.12,1.46);root.add(bollard);
  const anchor=cloneLoadedAsset('tidelineAnchor',.72,.72);
  anchor.position.set(-.92,.12,1.25);anchor.rotation.y=.36;root.add(anchor);
  const bell=cloneLoadedAsset('tidelineBellStand',.78,1.25);
  bell.position.set(-.78,.12,-1.25);root.add(bell);
  const chair=cloneLoadedAsset('tidelineDockChair',.70,.82);
  chair.position.set(.72,.12,-1.08);chair.rotation.y=-.45;root.add(chair);
  const garland=cloneLoadedAsset('tidelineBuoyGarland',1.15,.72);
  garland.position.set(1.02,.08,.72);garland.rotation.y=.28;root.add(garland);
  const boat=createBoatVisual();
  boat.position.set(1.62,-.02,.56);boat.rotation.y=-.18;root.add(boat);
  root.userData.boat=boat;
  root.rotation.y=yaw;
  return root;
}
function createTidelineFishingShopVisual(){
  const root=new THREE.Group();
  const house=cloneLoadedAsset('tidelineBoatHouse',3.45,3.45);root.add(house);
  const bait=cloneLoadedAsset('tidelineBaitBox',.72,.66);
  bait.position.set(1.12,.08,.92);bait.rotation.y=-.22;root.add(bait);
  const barrel=cloneLoadedAsset('tidelineCargoBarrel',.62,.78);
  barrel.position.set(-1.02,.08,.82);barrel.rotation.y=.18;root.add(barrel);
  return root;
}

const CARD_PREVIEW_ASSET={
  tree:'treeA',
  rock:'rockA',
  clear:'treeA',
  mill:'windmill',
  house:'house',
  market:'market',
  lumbermill:'lumbermill',
  quarry:'quarry'
};
async function previewObjectFor(type){
  if(type==='field')return fieldVisual(2,false);
  if(type==='expand'||type==='island'){
    const preview=new THREE.Group();
    preview.add(buildTerrainTile({
      x:0,z:0,tileSize:GRID.tileSize,cellKey:'preview',
      hasLand:()=>false
    }));
    return preview;
  }
  if(type==='pier')return createTidelinePierVisual(.18);
  if(type==='fishingShop')return createTidelineFishingShopVisual();
  if(type==='lighthouse'){
    const visual=createLighthouseVisual();
    shadows(visual);
    if(visual.userData.beamPivot)visual.userData.beamPivot.visible=false;
    return visual;
  }
  const asset=CARD_PREVIEW_ASSET[type];
  if(!asset)return null;
  const model=(await load(ASSETS[asset])).clone(true);
  shadows(model);
  return model;
}
async function renderCardPreview(type){
  try{
    const object=await previewObjectFor(type);
    if(!object)return null;
    fit(object,(type==='expand'||type==='island')?3.8:3.25,4.2);
    object.rotation.y=type==='clear'?-.28:.42;

    const previewScene=new THREE.Scene();
    previewScene.background=new THREE.Color(0x263129);
    previewScene.add(new THREE.HemisphereLight(0xe8f1dc,0x4a4337,2.25));
    const keyLight=new THREE.DirectionalLight(0xffe3b0,3.1);
    keyLight.position.set(4.5,7,5.5);
    previewScene.add(keyLight);
    const fillLight=new THREE.DirectionalLight(0x90b8c7,1.15);
    fillLight.position.set(-5,3,-4);
    previewScene.add(fillLight);

    const ground=new THREE.Mesh(
      new THREE.CircleGeometry(3.2,48),
      new THREE.MeshStandardMaterial({color:0x314032,roughness:1})
    );
    ground.rotation.x=-Math.PI/2;
    ground.position.y=-.035;
    previewScene.add(ground);
    previewScene.add(object);

    object.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(object);
    const size=box.getSize(new THREE.Vector3());
    const targetY=Math.max(.28,Math.min(1.25,size.y*.42));
    const cam=new THREE.PerspectiveCamera(32,512/320,.1,30);
    const distance=(type==='expand'||type==='island')?6.2:5.6;
    cam.position.set(distance*.68,Math.max(3.2,size.y*.74+1.7),distance);
    cam.lookAt(0,targetY,0);

    previewRenderer.render(previewScene,cam);
    return previewRenderer.domElement.toDataURL('image/png');
  }catch(error){
    console.warn('[Corepolis] Card preview failed:',type,error);
    return null;
  }
}
async function buildCardPreviews(){
  const types=Object.keys(CARD_DEFS);
  for(let i=0;i<types.length;i++){
    const type=types[i];
    setLoadingProgress(
      82+(i/types.length)*15,
      'ГОТОВИМ КОЛОДУ',
      i<types.length*.5?'Рисуем карточки':'Раскладываем карты по местам'
    );
    const image=await renderCardPreview(type);
    if(image)state.cardPreviews.set(type,image);
  }
  setLoadingProgress(97,'ГОТОВИМ КОЛОДУ','Последняя проверка');
  renderHand();
}

async function preload(){
  const entries=Object.entries(ASSETS);
  setLoadingProgress(2,'СТРОИМ МИР','Подготавливаем мир');
  for(let i=0;i<entries.length;i++){
    const [name,url]=entries[i];
    setLoadingProgress(
      4+(i/entries.length)*76,
      'СТРОИМ МИР',
      LOADING_ASSET_STATUS[name]||'Собираем остров'
    );
    await load(url);
  }
  setLoadingProgress(80,'СТРОИМ МИР','Мир собран');
}

function createTileRoot(x,z){
  const root=new THREE.Group();
  root.position.copy(pos(x,z));
  root.userData.cellKey=key(x,z);
  return root;
}
function rebuildTerrainTile(tile){
  if(!tile)return;
  if(tile.terrain){
    if(tile.terrain.parent)tile.terrain.parent.remove(tile.terrain);
    disposeTerrainTile(tile.terrain);
    tile.terrain=null;
  }

  const terrain=buildTerrainTile({
    x:tile.x,
    z:tile.z,
    tileSize:GRID.tileSize,
    cellKey:tile.key,
    hasLand:(x,z)=>state.land.has(key(x,z))
  });
  tile.visual.add(terrain);
  tile.terrain=terrain;
  tile.terrainType=terrain.userData.terrainType;
  tile.terrainVariant=terrain.userData.terrainVariant;
}
function terrainNeighborhood(x,z){
  const cells=[];
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
    const tile=state.land.get(key(x+dx,z+dz));
    if(tile)cells.push(tile);
  }
  return cells;
}
function refreshTerrainNeighborhood(x,z){
  for(const tile of terrainNeighborhood(x,z))rebuildTerrainTile(tile);
}
function refreshAllTerrain(){
  for(const tile of state.land.values())rebuildTerrainTile(tile);
}
function addLand(x,z,{refresh=true}={}){
  const k=key(x,z);
  if(state.land.has(k))return state.land.get(k);

  const tile={
    x,z,key:k,type:'empty',stage:0,visual:createTileRoot(x,z),terrain:null,
    terrainType:'island',terrainVariant:0,content:null,fieldOrder:null,
    resourceSources:new Set(),resourceMarker:null,ambientObjects:[]
  };
  state.land.set(k,tile);
  world.add(tile.visual);

  rebuildTerrainTile(tile);
  if(refresh)refreshTerrainNeighborhood(x,z);
  return tile;
}
const waterKey=(x,z)=>`${x},${z}`;
function waterStructureOf(object){
  while(object){
    const wk=object.userData?.waterKey;
    if(wk&&state.waterStructures.has(wk))return state.waterStructures.get(wk);
    object=object.parent;
  }
  return null;
}
function snappedWaterCell(hits){
  const hit=hits.find(h=>h.object===waterPlane);
  if(!hit)return null;
  return{
    x:Math.round(hit.point.x/GRID.tileSize),
    z:Math.round(hit.point.z/GRID.tileSize)
  };
}
function withinMap(x,z){
  return Math.abs(x)<=GRID.maxRadius&&Math.abs(z)<=GRID.maxRadius;
}
function adjacentLandForWater(x,z){
  const matches=[];
  for(const d of DIRECTIONS){
    const tile=state.land.get(key(x+d.dx,z+d.dz));
    if(!tile)continue;
    const seaDx=-d.dx;
    const seaDz=-d.dz;
    matches.push({
      tile,
      seaDx,seaDz,
      yaw:Math.atan2(seaDx,seaDz)
    });
  }
  return matches;
}
function canPlacePier(x,z){
  return withinMap(x,z)&&!state.land.has(key(x,z))&&!state.waterStructures.has(waterKey(x,z))&&adjacentLandForWater(x,z).length>0;
}
function lighthouseRangeAllows(x,z){
  for(const tile of state.land.values()){
    if(tile.type!=='lighthouse')continue;
    if(Math.hypot(tile.x-x,tile.z-z)<=3.25)return true;
  }
  return false;
}
function canPlaceIsland(x,z){
  if(!withinMap(x,z)||state.land.has(key(x,z))||state.waterStructures.has(waterKey(x,z)))return false;
  return adjacent(x,z)||lighthouseRangeAllows(x,z);
}
function nearestLandDistance(x,z){
  let best=Infinity;
  for(const tile of state.land.values())best=Math.min(best,Math.hypot(tile.x-x,tile.z-z));
  return best;
}
function canPlaceRemoteLighthouse(x,z){
  if(!withinMap(x,z)||state.land.has(key(x,z))||state.waterStructures.has(waterKey(x,z)))return false;
  return nearestLandDistance(x,z)<=4.35;
}
function landComponent(startKey){
  const start=state.land.get(startKey);
  if(!start)return new Set();
  const seen=new Set([start.key]);
  const queue=[start];
  while(queue.length){
    const tile=queue.shift();
    for(const d of DIRECTIONS){
      const next=state.land.get(key(tile.x+d.dx,tile.z+d.dz));
      if(!next||seen.has(next.key))continue;
      seen.add(next.key);
      queue.push(next);
    }
  }
  return seen;
}
function nearbyPiers(tile,radius=1){
  let count=0;
  for(const structure of state.waterStructures.values()){
    if(structure.type!=='pier')continue;
    if(Math.max(Math.abs(structure.x-tile.x),Math.abs(structure.z-tile.z))<=radius)count++;
  }
  return count;
}
function setMarineObjectCellKey(root,tile){
  root.traverse(object=>{object.userData.cellKey=tile.key;});
}
async function setLighthouse(tile,animated=true){
  clearContent(tile);
  tile.type='lighthouse';
  const visual=createLighthouseVisual();
  shadows(visual);
  visual.position.y=.10;
  setMarineObjectCellKey(visual,tile);
  tile.visual.add(visual);
  tile.content=visual;
  const beam=visual.userData.beamPivot;
  if(beam){
    beam.traverse(object=>{if(object.isMesh){object.castShadow=false;object.receiveShadow=false;}});
    state.lighthouseBeams.push(beam);
  }
  if(animated){
    spawnRing(tile.visual.position.clone(),0xf4d778);
    spawnBurst(tile.visual.position.clone(),0xffdf85,14);
    await animatePop(visual,.48);
  }
}
async function setFishingShop(tile,animated=true){
  clearContent(tile);
  tile.type='fishingShop';
  const visual=createTidelineFishingShopVisual();
  visual.position.y=.11;
  setMarineObjectCellKey(visual,tile);
  tile.visual.add(visual);
  tile.content=visual;
  if(animated)await animateBuildingConstruction(tile,'fishingShop',visual);
}
function grantSpecificCards(type,count,{priorityFirst=false}={}){
  const reserveBefore=state.reserve.length;
  for(let i=0;i<count;i++)addCard(draw(type),{priority:priorityFirst&&i===0});
  renderHand();
  if(state.reserve.length>reserveBefore)animateReserveGain();
}
function openMarineChoice(){
  if(state.marineChoiceOpen)return;
  state.marineChoiceOpen=true;
  state.inputLocked=true;
  ui.marineChoice.classList.remove('hidden');
  refreshLucide();
}
function resolveMarineChoice(choice){
  if(!state.marineChoiceOpen)return;
  state.marineChoiceOpen=false;
  ui.marineChoice.classList.add('hidden');

  if(choice==='lighthouse'){
    grantSpecificCards('lighthouse',1,{priorityFirst:true});
    grantSpecificCards('island',2);
  }else{
    grantSpecificCards('island',7,{priorityFirst:true});
  }
  grantSpecificCards('fishingShop',1);
  state.inputLocked=false;
  status();
  toast(choice==='lighthouse'
    ?'Экспедиция выбрала маяк: +1 маяк, +2 острова. Рыболовный магазин тоже открыт.'
    :'Экспедиция нашла архипелаг: +7 островных тайлов. Рыболовный магазин тоже открыт.');
}
function animateSeaRoute(from,to){
  if(!from?.visual||!to?.visual)return;
  const boat=createBoatVisual();
  shadows(boat);
  const start=from.visual.position.clone().add(new THREE.Vector3(0,.04,0));
  const end=to.visual.position.clone().add(new THREE.Vector3(0,.04,0));
  boat.position.copy(start);
  world.add(boat);
  tween(1.25,p=>{
    const q=easeInOut(p);
    boat.position.lerpVectors(start,end,q);
    boat.position.y+=Math.sin(p*Math.PI)*.20;
    const dx=end.x-start.x,dz=end.z-start.z;
    boat.rotation.y=Math.atan2(dx,dz);
  },t=>t).then(()=>{
    world.remove(boat);
    boat.traverse(object=>{
      object.geometry?.dispose?.();
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for(const material of materials)material?.dispose?.();
    });
  });
}
function awardSeaRoute(newPier){
  const component=landComponent(newPier.shoreKey);
  for(const other of state.waterStructures.values()){
    if(other===newPier||other.type!=='pier'||component.has(other.shoreKey))continue;
    const route=[newPier.key,other.key].sort().join('|');
    if(state.seaRoutes.has(route))continue;
    state.seaRoutes.add(route);
    state.harvestScore+=125;
    state.comboCount++;
    grantCards(2);
    spawnCardBurst(newPier.visual.position.clone(),2);
    spawnRing(newPier.visual.position.clone(),0x78d5d1);
    animateSeaRoute(newPier,other);
    status();
    toast('Морской маршрут между островами! +125 очков и +2 карты.');
    return true;
  }
  return false;
}
async function placePier(card,x,z){
  if(!canPlacePier(x,z))return toast('Причал ставится на свободную воду вплотную к берегу.');
  const shore=adjacentLandForWater(x,z)[0];
  const visual=createTidelinePierVisual(shore.yaw);
  visual.position.set(x*GRID.tileSize,-.48,z*GRID.tileSize);
  const wk=waterKey(x,z);
  visual.userData.waterKey=wk;
  visual.traverse(object=>{object.userData.waterKey=wk;});
  world.add(visual);

  const structure={key:wk,x,z,type:'pier',visual,shoreKey:shore.tile.key};
  state.waterStructures.set(wk,structure);
  const boat=visual.userData.boat;
  if(boat){
    state.marineActors.push({
      object:boat,
      baseY:boat.position.y,
      phase:(x*1.7+z*2.3)
    });
  }

  spend(card.id);
  spawnRing(visual.position.clone().setY(-.36),0x7ed2c8);
  spawnBurst(visual.position.clone().setY(-.20),0xd2b46f,10);

  const first=!state.unlocks.marine;
  if(first){
    state.unlocks.marine=true;
    state.unlocks.fishingShop=true;
    status();
    openMarineChoice();
    return;
  }
  if(!awardSeaRoute(structure)){
    status();
    toast('Причал готов. Лодка ждёт следующую экспедицию.');
  }
}
async function placeIsland(card,x,z){
  if(!canPlaceIsland(x,z)){
    return toast(lighthouseRangeAllows(x,z)
      ?'Эта водная клетка уже занята.'
      :'Островной тайл должен касаться суши или находиться в радиусе маяка.');
  }
  const tile=addLand(x,z,{refresh:false});
  spend(card.id);
  state.inputLocked=true;
  await animateLandRise(tile);
  refreshTerrainNeighborhood(x,z);
  spawnRing(tile.visual.position.clone(),0x83d0ad);
  spawnBurst(tile.visual.position.clone(),0x9fd56f,12);
  state.inputLocked=false;
  status();
  tileInfo(tile);
  toast(adjacent(x,z)?'Берег расширен островным тайлом.':'Новый остров поднялся в свете маяка.');
}
async function placeRemoteLighthouse(card,x,z){
  if(!canPlaceRemoteLighthouse(x,z))return toast('Удалённый маяк можно основать не дальше четырёх клеток от известной суши.');
  const tile=addLand(x,z,{refresh:false});
  state.inputLocked=true;
  await animateLandRise(tile);
  refreshTerrainNeighborhood(x,z);
  await setLighthouse(tile,true);
  spend(card.id);
  state.inputLocked=false;
  status();
  tileInfo(tile);
  toast('Маяк основан вдали. Островные тайлы можно ставить в радиусе 3 клеток вокруг него.');
}
function waterStructureInfo(structure){
  if(!structure){
    ui.tileInfo.classList.add('hidden');
    return;
  }
  if(structure.type==='pier'){
    ui.tileTitle.textContent='Причал';
    const component=landComponent(structure.shoreKey);
    const routes=[...state.seaRoutes].filter(route=>route.includes(structure.key)).length;
    ui.tileCopy.textContent=routes
      ?`Морской причал · активных маршрутов: ${routes}. Лодка связывает этот остров с другими берегами.`
      :`Морской причал у острова из ${component.size} клеток. Постройте причал на отдельном острове, чтобы открыть маршрут.`;
  }
  ui.tileInfo.classList.remove('hidden');
}
function clearContent(t){
  if(t.content){
    if(t.content.parent)t.content.parent.remove(t.content);
    t.content=null;
  }
  if(t.resourceMarker){
    if(t.resourceMarker.parent)t.resourceMarker.parent.remove(t.resourceMarker);
    t.resourceMarker.material?.map?.dispose?.();
    t.resourceMarker.material?.dispose?.();
    t.resourceMarker=null;
  }
  const ambientSet=new Set(t.ambientObjects||[]);
  for(const object of ambientSet){
    if(object?.parent)object.parent.remove(object);
  }
  if(ambientSet.size){
    state.ambientActors=state.ambientActors.filter(actor=>!ambientSet.has(actor.object));
  }
  t.ambientObjects=[];
  t.type='empty';
  t.stage=0;
  t.fieldOrder=null;
  t.resourceSources=new Set();
}
function resourceProgressMarker(type){
  const c=document.createElement('canvas');
  c.width=192;c.height=96;
  const x=c.getContext('2d');
  x.fillStyle='rgba(255,250,226,.96)';
  x.strokeStyle=type==='tree'?'#7b9b5d':'#78817e';
  x.lineWidth=7;
  x.beginPath();
  x.roundRect(8,8,176,80,28);
  x.fill();x.stroke();
  x.fillStyle='#42513f';
  x.font='900 34px system-ui';
  x.textAlign='center';x.textBaseline='middle';
  x.fillText('1 / 2',96,49);
  const tx=new THREE.CanvasTexture(c);
  tx.colorSpace=THREE.SRGBColorSpace;
  const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));
  marker.scale.set(1.8,.9,1);
  marker.position.set(0,2.55,0);
  return marker;
}
function updateResourceMarker(t){
  if(t.resourceMarker){
    if(t.resourceMarker.parent)t.resourceMarker.parent.remove(t.resourceMarker);
    t.resourceMarker.material?.map?.dispose?.();
    t.resourceMarker.material?.dispose?.();
    t.resourceMarker=null;
  }
  if((t.type==='tree'||t.type==='rock')&&t.resourceSources?.size===1){
    t.resourceMarker=resourceProgressMarker(t.type);
    t.visual.add(t.resourceMarker);
  }
}
function cloneWheatStage(stage){
  const safeStage=Math.max(1,Math.min(4,stage));
  const source=resolvedAssets.get(ASSETS[`wheat${safeStage}`]);
  if(!source)return null;

  const crop=source.clone(true);
  shadows(crop);
  const height=[.34,.48,.64,.82][safeStage-1];
  fit(crop,.48,height);
  return crop;
}

function createWheatRow(stage,rowIndex,synergy=false){
  const row=new THREE.Group();
  const safeStage=Math.max(1,Math.min(4,stage));
  const count=[3,5,6,8][safeStage-1];
  const spacing=3.05/Math.max(1,count-1);

  for(let i=0;i<count;i++){
    const crop=cloneWheatStage(safeStage);
    if(!crop)continue;

    const jitter=(((i*7+rowIndex*11+safeStage*3)%7)-3)*.014;
    const size=.9+(((i*13+rowIndex*5)%5)-2)*.025;
    crop.position.set(-1.525+i*spacing,0,jitter);
    crop.rotation.y=((i*17+rowIndex*23)%24)/24*Math.PI*2;
    crop.scale.multiplyScalar(size);
    row.add(crop);
  }

  row.userData.swayPhase=rowIndex*.72+safeStage*.31;
  row.userData.swayAmount=(safeStage>=3?.028:.015)*(synergy?1.12:1);
  return row;
}

function fieldAdjacency(t){
  if(!t)return{north:false,east:false,south:false,west:false};
  return{
    north:state.land.get(key(t.x,t.z-1))?.type==='field',
    east:state.land.get(key(t.x+1,t.z))?.type==='field',
    south:state.land.get(key(t.x,t.z+1))?.type==='field',
    west:state.land.get(key(t.x-1,t.z))?.type==='field'
  };
}
function fieldAdjacencySignature(t){
  const a=fieldAdjacency(t);
  return `${a.north?1:0}${a.east?1:0}${a.south?1:0}${a.west?1:0}`;
}
function createVoxelFieldBase(size,height,color){
  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(size,height,size),
    new THREE.MeshStandardMaterial({
      color,
      roughness:1,
      flatShading:true
    })
  );
  mesh.castShadow=mesh.receiveShadow=true;
  return mesh;
}
function createVoxelFurrow(length,width,height,seed=0,synergy=false){
  const root=new THREE.Group();
  const baseColor=new THREE.Color(synergy?0x8c6133:0x81552b);
  const midColor=baseColor.clone().offsetHSL(0,0,.035);
  const topColor=baseColor.clone().offsetHSL(0,0,.07);

  const lowerH=height*.34;
  const middleH=height*.31;
  const topH=height-lowerH-middleH;
  const layers=[
    {w:width,h:lowerH,y:lowerH*.5,color:baseColor},
    {w:width*.72,h:middleH,y:lowerH+middleH*.5,color:midColor},
    {w:width*.40,h:topH,y:lowerH+middleH+topH*.5,color:topColor}
  ];

  for(let i=0;i<layers.length;i++){
    const layer=layers[i];
    const mesh=new THREE.Mesh(
      new THREE.BoxGeometry(length,layer.h,layer.w),
      new THREE.MeshStandardMaterial({
        color:layer.color,
        roughness:1,
        flatShading:true
      })
    );
    mesh.position.y=layer.y;
    mesh.castShadow=mesh.receiveShadow=true;
    root.add(mesh);
  }

  const endShade=new THREE.MeshStandardMaterial({
    color:baseColor.clone().offsetHSL(0,0,-.045),
    roughness:1,
    flatShading:true
  });
  const capWidth=width*.40;
  const capHeight=Math.max(.025,topH*.72);
  for(const side of [-1,1]){
    const cap=new THREE.Mesh(
      new THREE.BoxGeometry(.055,capHeight,capWidth),
      endShade
    );
    cap.position.set(side*(length*.5-.025),height-capHeight*.5,0);
    cap.castShadow=cap.receiveShadow=true;
    root.add(cap);
  }

  root.userData.seed=seed;
  return root;
}
function addVoxelFieldClods(group,stage,tileSize,synergy=false){
  const material=new THREE.MeshStandardMaterial({
    color:synergy?0x9b6a39:0x704722,
    roughness:1,
    flatShading:true
  });
  const count=[4,6,8,10][stage-1];
  const half=tileSize*.5-.18;

  for(let i=0;i<count;i++){
    const px=((i*47+stage*19)%101)/100;
    const pz=((i*71+stage*13)%97)/96;
    const sx=.07+(i%3)*.025;
    const sy=.045+(i%2)*.018;
    const sz=.06+((i+1)%3)*.02;
    const clod=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
    clod.position.set(
      THREE.MathUtils.lerp(-half,half,px),
      .335+sy*.5,
      THREE.MathUtils.lerp(-half,half,pz)
    );
    clod.rotation.y=(i%4)*Math.PI*.5;
    clod.castShadow=true;
    group.add(clod);
  }
}
function fieldVisual(stage,synergy=false,tile=null){
  const g=new THREE.Group();
  g.userData.isField=true;
  g.userData.stage=stage;
  g.userData.synergy=synergy;
  g.userData.cropRows=[];

  const safeStage=Math.max(1,Math.min(4,stage));
  const adjacency=fieldAdjacency(tile);
  g.userData.adjacencySignature=tile?fieldAdjacencySignature(tile):'0000';

  // Field soil deliberately fills the whole logical tile.
  // A tiny overlap hides sub-pixel seams between adjacent field cells.
  const seamOverlap=.035;
  const tileSize=GRID.tileSize+seamOverlap*2;
  const soilColors=[0x5e3d1e,0x63421f,0x694724,0x704d28];
  const soil=createVoxelFieldBase(
    tileSize,.16,
    synergy?0x714b26:soilColors[safeStage-1]
  );
  soil.position.y=.235;
  g.add(soil);

  const ridgeCount=5;
  const rowSpacing=GRID.tileSize/ridgeCount;
  const ridgeWidth=.70;
  const ridgeHeight=[.16,.18,.20,.22][safeStage-1];
  const ridgeLength=tileSize+.01;
  const firstZ=-GRID.tileSize*.5+rowSpacing*.5;

  // Dark voxel troughs make the stepped ridge profile read more clearly.
  const troughMaterial=new THREE.MeshStandardMaterial({
    color:synergy?0x5f4023:0x4f331a,
    roughness:1,
    flatShading:true
  });
  for(let i=0;i<ridgeCount-1;i++){
    const z=firstZ+rowSpacing*(i+.5);
    const trough=new THREE.Mesh(
      new THREE.BoxGeometry(tileSize+.01,.018,rowSpacing*.27),
      troughMaterial
    );
    trough.position.set(0,.324,z);
    trough.receiveShadow=true;
    g.add(trough);
  }

  for(let r=0;r<ridgeCount;r++){
    const z=firstZ+rowSpacing*r;
    const ridge=createVoxelFurrow(
      ridgeLength,
      ridgeWidth,
      ridgeHeight,
      r+safeStage*7,
      synergy
    );
    ridge.position.set(0,.32,z);
    g.add(ridge);

    const row=createWheatRow(safeStage,r,synergy);
    row.position.set(0,.34+ridgeHeight,z);
    row.scale.x=Math.max(1,(GRID.tileSize-.42)/3.05);
    g.add(row);
    g.userData.cropRows.push(row);
  }

  addVoxelFieldClods(g,safeStage,GRID.tileSize,synergy);
  return g;
}
function animateFieldGrowth(field,stage,synergy=false){
  if(!field?.userData?.cropRows)return Promise.resolve();
  const rows=field.userData.cropRows;
  const baseScales=rows.map(row=>row.scale.clone());
  const baseYs=rows.map(row=>row.position.y);
  rows.forEach((row,i)=>{ row.scale.set(baseScales[i].x,.06,baseScales[i].z); row.position.y=baseYs[i]-.08; });
  return tween(.56,p=>{
    rows.forEach((row,i)=>{
      const delay=i/Math.max(1,rows.length)*.22;
      const local=Math.max(0,Math.min(1,(p-delay)/(1-delay)));
      const q=easeOut(local);
      const bounce=1+Math.sin(q*Math.PI)*(stage>=4?.08:.045);
      row.scale.set(baseScales[i].x,(.06+.94*q)*bounce,baseScales[i].z);
      row.position.y=THREE.MathUtils.lerp(baseYs[i]-.08,baseYs[i],q);
    });
  }).then(()=>{
    rows.forEach((row,i)=>{ row.scale.copy(baseScales[i]); row.position.y=baseYs[i]; });
  });
}
function updateFieldMotion(time){
  for(const tile of state.land.values()){
    if(tile.type!=='field'||!tile.content?.userData?.cropRows)continue;
    for(const row of tile.content.userData.cropRows){
      const phase=time*.00125+row.userData.swayPhase;
      const amount=row.userData.swayAmount;
      row.rotation.z=Math.sin(phase)*amount;
      row.rotation.x=Math.cos(phase*.73)*amount*.32;
    }
  }
}
async function modelOn(t,id,size,yaw=0,animated=false){
  const m=(await load(ASSETS[id])).clone(true);
  shadows(m);
  fit(m,size);
  m.rotation.y=yaw;
  m.position.y=.12;
  t.visual.add(m);
  t.content=m;
  if(animated){
    spawnRing(t.visual.position.clone(),0xe7d47b);
    animatePop(m);
  }
  return m;
}
async function setTree(t,animated=false){
  clearContent(t);
  t.type='tree';
  t.resourceSources=new Set();
  await modelOn(t,((t.x+t.z)&1)?'treeA':'treeB',2.6,t.x*.9+t.z*1.4,animated);
}
async function setRock(t,animated=false){
  clearContent(t);
  t.type='rock';
  t.resourceSources=new Set();
  await modelOn(t,((t.x-t.z)&1)?'rockA':'rockC',2.4,t.x*1.3-t.z,animated);
}
const BUILDING_ASSET={house:'house',market:'market',lumbermill:'lumbermill',quarry:'quarry'};
const BUILDING_SIZE={house:3.45,market:3.75,lumbermill:3.9,quarry:3.55};
async function setBuilding(t,type,animated=false){
  clearContent(t);
  t.type=type;
  const m=await modelOn(t,BUILDING_ASSET[type],BUILDING_SIZE[type],(t.x*17+t.z*11)*.13,false);
  if(animated)await animateBuildingConstruction(t,type,m);
  registerBuildingAmbient(t,type,m);
  t.type=type;
}
function millTile(){
  return state.millCell?state.land.get(state.millCell)||null:null;
}
function isMillZone(t){
  const mill=millTile();
  if(!mill)return false;
  return DIRECTIONS.some(d=>t.x===mill.x+d.dx&&t.z===mill.z+d.dz);
}
function setField(t,stage=1,animated=false,fieldOrder=null){
  const order=fieldOrder??t.fieldOrder??state.nextFieldOrder++;
  clearContent(t);
  t.type='field'; t.stage=stage; t.fieldOrder=order;
  const synergy=isMillZone(t);
  t.content=fieldVisual(stage,synergy,t);
  t.visual.add(t.content);
  if(!animated)return Promise.resolve();

  const mature=stage>=4;
  const color=mature?0xe5bd55:synergy?0xe0c36b:0x9fca68;
  spawnRing(t.visual.position.clone(),color);
  spawnBurst(t.visual.position.clone(),color,mature?16:9);
  return Promise.all([
    animateFieldGrowth(t.content,stage,synergy),
    pulse(t.content,mature?.54:.34,mature?.10:.055)
  ]);
}
function nearby(t,type,radius=1){
  let count=0;
  for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){
    if(!dx&&!dz)continue;
    if(state.land.get(key(t.x+dx,t.z+dz))?.type===type)count++;
  }
  return count;
}

const PRODUCER_RESOURCE={
  lumbermill:{tileType:'tree',resource:'wood',label:'древесины',color:0xb98552},
  quarry:{tileType:'rock',resource:'stone',label:'камня',color:0x8d9692}
};
function resourceCellsAround(t,tileType){
  const cells=[];
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
    if(!dx&&!dz)continue;
    const cell=state.land.get(key(t.x+dx,t.z+dz));
    if(cell?.type===tileType)cells.push(cell);
  }
  return cells;
}
function addMaterial(resource,amount,position){
  state.resources[resource]+=amount;
  if(position)spawnBurst(position,resource==='wood'?0xb98552:0x9aa19d,7);
  status();
}
async function depleteResource(resourceTile,producerTile,producerType){
  const cfg=PRODUCER_RESOURCE[producerType];
  if(!cfg||resourceTile.type!==cfg.tileType)return 0;
  const object=resourceTile.content;
  const start=resourceTile.visual.position.clone().add(new THREE.Vector3(0,.48,0));
  const target=producerTile.visual.position.clone().add(new THREE.Vector3(0,.82,0));

  if(resourceTile.resourceMarker){
    if(resourceTile.resourceMarker.parent)resourceTile.resourceMarker.parent.remove(resourceTile.resourceMarker);
    resourceTile.resourceMarker.material?.map?.dispose?.();
    resourceTile.resourceMarker.material?.dispose?.();
    resourceTile.resourceMarker=null;
  }

  if(object){
    world.attach(object);
    const baseScale=object.scale.clone();
    const baseRot=object.rotation.y;
    await tween(.5,p=>{
      object.position.lerpVectors(start,target,easeInOut(p));
      object.position.y+=Math.sin(p*Math.PI)*.72;
      object.scale.copy(baseScale).multiplyScalar(1-p*.72);
      object.rotation.y=baseRot+p*Math.PI*.8;
    },t=>t);
    if(object.parent)object.parent.remove(object);
  }

  resourceTile.content=null;
  resourceTile.type='empty';
  resourceTile.stage=0;
  resourceTile.fieldOrder=null;
  resourceTile.resourceSources=new Set();
  state.harvestScore+=45;
  spawnRing(resourceTile.visual.position.clone(),cfg.color);
  return 1;
}
async function processProducerPlacement(producerTile,producerType){
  const cfg=PRODUCER_RESOURCE[producerType];
  if(!cfg)return{touched:0,depleted:0};
  const targets=resourceCellsAround(producerTile,cfg.tileType);
  let touched=0,depleted=0;
  const pending=[];

  for(const resourceTile of targets){
    if(resourceTile.resourceSources.has(producerTile.key))continue;
    resourceTile.resourceSources.add(producerTile.key);
    touched++;
    addMaterial(cfg.resource,1,resourceTile.visual.position.clone());

    if(resourceTile.resourceSources.size>=2){
      pending.push(depleteResource(resourceTile,producerTile,producerType).then(v=>{depleted+=v;}));
    }else{
      updateResourceMarker(resourceTile);
      pulse(resourceTile.content,.38,.13);
    }
  }

  await Promise.all(pending);
  status();
  return{touched,depleted};
}
async function activateProducersForResource(resourceTile){
  const producerType=resourceTile.type==='tree'?'lumbermill':resourceTile.type==='rock'?'quarry':null;
  if(!producerType)return{producers:0,depleted:0};
  const producers=[];
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
    if(!dx&&!dz)continue;
    const cell=state.land.get(key(resourceTile.x+dx,resourceTile.z+dz));
    if(cell?.type===producerType)producers.push(cell);
  }
  let depleted=0;
  for(const producer of producers){
    const result=await processProducerPlacement(producer,producerType);
    depleted+=result.depleted;
    if(resourceTile.type==='empty')break;
  }
  return{producers:producers.length,depleted};
}

async function resolveProducer(producerTile,producerType){
  const cfg=PRODUCER_RESOURCE[producerType];
  if(!cfg)return;
  state.inputLocked=true;
  const targets=resourceCellsAround(producerTile,cfg.tileType);

  for(const resourceTile of targets){
    addMaterial(cfg.resource,1,resourceTile.visual.position.clone());
  }

  let depleted=0;
  await Promise.all(targets.map(resourceTile=>
    depleteResource(resourceTile,producerTile,producerType).then(v=>{depleted+=v;})
  ));

  const building=producerTile.content;
  if(building){
    const baseScale=building.scale.clone();
    await tween(.38,p=>{
      building.scale.copy(baseScale).multiplyScalar(Math.max(.04,1-p));
      building.rotation.y+=.08;
      building.position.y-=.018;
    });
  }

  const producerPosition=producerTile.visual.position.clone();
  clearContent(producerTile);
  state.harvestScore+=55+depleted*25;
  state.comboCount++;

  let bonusCards=0;
  if(depleted>=3)bonusCards=1;
  if(depleted>=5)bonusCards=2;
  if(bonusCards){
    grantCards(bonusCards);
    spawnCardBurst(producerPosition,bonusCards);
  }

  spawnRing(producerPosition,cfg.color);
  spawnBurst(producerPosition,cfg.color,16);
  status();
  toast(depleted
    ?`Цикл завершён: истощено ${depleted} клеток, производство исчезло${bonusCards?`, +${bonusCards} карта`:''}.`
    :'Производство разобрано, но рядом не осталось подходящего ресурса.');
  state.inputLocked=false;
}

function normalFieldNeighbors(t){
  return DIRECTIONS
    .map(d=>state.land.get(key(t.x+d.dx,t.z+d.dz)))
    .filter(n=>n?.type==='field'&&!isMillZone(n));
}
function connectedNormalFields(start){
  if(start.type!=='field'||isMillZone(start))return[];
  const result=[];
  const seen=new Set([start.key]);
  const queue=[start];
  while(queue.length){
    const t=queue.shift();
    result.push(t);
    for(const n of normalFieldNeighbors(t)){
      if(seen.has(n.key))continue;
      seen.add(n.key);
      queue.push(n);
    }
  }
  return result;
}

async function syncFieldCells(cells,stage,{animated=false,forceKeys=new Set()}={}){
  const safeStage=Math.max(1,Math.min(4,stage));
  const tasks=[];
  for(const cell of cells){
    const expectedSynergy=isMillZone(cell);
    const visualSynergy=!!cell.content?.userData?.synergy;
    const expectedAdjacency=fieldAdjacencySignature(cell);
    const visualAdjacency=cell.content?.userData?.adjacencySignature||'0000';
    const needsUpdate=
      forceKeys.has(cell.key)||
      cell.stage!==safeStage||
      visualSynergy!==expectedSynergy||
      visualAdjacency!==expectedAdjacency;
    if(!needsUpdate)continue;
    tasks.push(setField(cell,safeStage,animated,cell.fieldOrder));
  }
  if(tasks.length)await Promise.all(tasks);
}
async function syncNormalFieldComponent(start,{animated=false,forceKeys=new Set()}={}){
  const component=connectedNormalFields(start);
  if(!component.length)return component;
  await syncFieldCells(component,Math.min(4,component.length),{animated,forceKeys});
  return component;
}
async function syncAllNormalFieldStages(animated=false){
  const visited=new Set();
  for(const cell of state.land.values()){
    if(cell.type!=='field'||isMillZone(cell)||visited.has(cell.key))continue;
    const component=connectedNormalFields(cell);
    for(const member of component)visited.add(member.key);
    await syncFieldCells(component,Math.min(4,component.length),{animated});
  }
}
async function syncMillFieldStages({animated=false,forceKeys=new Set()}={}){
  const fields=millFields().filter(cell=>cell.type==='field');
  if(!fields.length)return fields;
  await syncFieldCells(fields,Math.min(4,fields.length),{animated,forceKeys});
  return fields;
}
function isConnectedSet(cells){
  if(!cells.length)return false;
  const allowed=new Set(cells.map(c=>c.key));
  const seen=new Set([cells[0].key]);
  const queue=[cells[0]];
  while(queue.length){
    const t=queue.shift();
    for(const d of DIRECTIONS){
      const k=key(t.x+d.dx,t.z+d.dz);
      if(allowed.has(k)&&!seen.has(k)){
        seen.add(k);
        queue.push(state.land.get(k));
      }
    }
  }
  return seen.size===cells.length;
}
function connectedTypeGroup(start,type){
  if(!start||start.type!==type)return[];
  const seen=new Set([start.key]);
  const queue=[start];
  const result=[];
  while(queue.length){
    const cell=queue.shift();
    result.push(cell);
    for(const d of DIRECTIONS){
      const next=state.land.get(key(cell.x+d.dx,cell.z+d.dz));
      if(next?.type!==type||seen.has(next.key))continue;
      seen.add(next.key);
      queue.push(next);
    }
  }
  return result;
}
function largestConnectedTypeCount(type){
  let best=0;
  const visited=new Set();
  for(const cell of state.land.values()){
    if(cell.type!==type||visited.has(cell.key))continue;
    const group=connectedTypeGroup(cell,type);
    for(const member of group)visited.add(member.key);
    best=Math.max(best,group.length);
  }
  return best;
}
function largestNormalFieldCount(){
  let best=0;
  const visited=new Set();
  for(const cell of state.land.values()){
    if(cell.type!=='field'||isMillZone(cell)||visited.has(cell.key))continue;
    const group=connectedNormalFields(cell);
    for(const member of group)visited.add(member.key);
    best=Math.max(best,group.length);
  }
  return best;
}
function findCollapseGroup(newField){
  const component=connectedNormalFields(newField);
  if(component.length<4)return null;
  const others=component.filter(t=>t!==newField);
  const candidates=[];
  for(let a=0;a<others.length;a++)for(let b=a+1;b<others.length;b++)for(let c=b+1;c<others.length;c++){
    const group=[newField,others[a],others[b],others[c]];
    if(isConnectedSet(group))candidates.push(group);
  }
  if(!candidates.length)return null;
  candidates.sort((a,b)=>{
    const aa=Math.min(...a.map(t=>t.fieldOrder));
    const bb=Math.min(...b.map(t=>t.fieldOrder));
    if(aa!==bb)return aa-bb;
    return a.reduce((s,t)=>s+t.fieldOrder,0)-b.reduce((s,t)=>s+t.fieldOrder,0);
  });
  return candidates[0];
}
function pushPriorityUnlock(type){
  const reserveBefore=state.reserve.length;
  addCard(draw(type),{priority:true});
  renderHand();
  if(state.reserve.length>reserveBefore)animateReserveGain();
}
function unlockMill(position){
  if(state.unlocks.mill)return false;
  state.unlocks.mill=true;
  pushPriorityUnlock('mill');
  if(position){
    spawnRing(position,0xf0cb63);
    spawnCardBurst(position,1);
  }
  return true;
}
function unlockMarket(position){
  if(state.unlocks.market)return false;
  state.unlocks.market=true;
  pushPriorityUnlock('market');
  if(position){
    spawnRing(position,0xe3b957);
    spawnCardBurst(position,1);
  }
  return true;
}
async function collapseFields(group){
  if(!group)return;
  state.inputLocked=true;
  const anchor=group.reduce((best,t)=>t.fieldOrder<best.fieldOrder?t:best,group[0]);
  const anchorOrder=anchor.fieldOrder;
  const target=anchor.visual.position.clone().add(new THREE.Vector3(0,.36,0));
  const moving=[];
  for(const t of group){
    if(!t.content)continue;
    spawnRing(t.visual.position.clone(),0xc8d66f);
    pulse(t.content,.24,.08);
    const object=t.content;
    world.attach(object);
    moving.push({t,object,start:object.position.clone(),scale:object.scale.clone(),rotY:object.rotation.y});
  }
  spawnBurst(target,0xf0cb63,20);
  await tween(.72,p=>{
    for(let i=0;i<moving.length;i++){
      const m=moving[i];
      const q=easeInOut(p);
      const arc=Math.sin(p*Math.PI)*(m.t===anchor?.26:.72+i*.06);
      const side=Math.sin(p*Math.PI)*((i-1.5)*.12);
      m.object.position.lerpVectors(m.start,target,q);
      m.object.position.y+=arc;
      m.object.position.x+=side;
      const shrink=1-p*.76;
      m.object.scale.set(m.scale.x*shrink,m.scale.y*(1-p*.64),m.scale.z*shrink);
      m.object.rotation.y=m.rotY+p*Math.PI*(.45+i*.11);
    }
  },t=>t);
  for(const m of moving){
    if(m.object.parent)m.object.parent.remove(m.object);
    m.t.content=null; m.t.type='empty'; m.t.stage=0; m.t.fieldOrder=null;
  }
  await setField(anchor,1,false,anchorOrder);
  await syncAllNormalFieldStages(false);
  spawnRing(anchor.visual.position.clone(),0xf0cb63);
  spawnBurst(anchor.visual.position.clone(),0xf4d875,22);
  await animateFieldGrowth(anchor.content,anchor.stage,false);
  await pulse(anchor.content,.44,.16);
  state.harvestScore+=120;
  state.comboCount++;
  grantCards(1);
  const openedMill=unlockMill(target);
  spawnCardBurst(target,1);
  toast(openedMill
    ?'Первое комбо из 4 полей! Мельница открыта и добавлена в руку.'
    :'4 части поля схлопнулись в первую: +120 очков и +1 карта.');
  status();
  state.inputLocked=false;
}
function addCard(card,{priority=false}={}){
  if(state.hand.length<HAND_LIMIT){
    state.hand.push(card);
    return;
  }
  if(priority){
    const displaced=state.hand.pop();
    if(displaced)state.reserve.unshift(displaced);
    state.hand.push(card);
    return;
  }
  state.reserve.push(card);
}
function grantCards(count){
  const reserveBefore=state.reserve.length;
  for(let i=0;i<count;i++)addCard(draw());
  renderHand();
  if(state.reserve.length>reserveBefore)animateReserveGain();
}
async function setMill(t){
  clearContent(t);
  state.millCell=t.key;
  t.type='mill';
  const m=await modelOn(t,'windmill',3.55,Math.PI*.25,false);
  const blades=m.getObjectByName('building_windmill_top_fan_green');
  state.millBlades=blades?[blades]:[];
  t.type='mill';

  await syncMillFieldStages({animated:false});
  await syncAllNormalFieldStages(false);
}
function seed(){
  for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){
    if(Math.abs(x)+Math.abs(z)<=3||(Math.abs(x)<=1&&Math.abs(z)<=2))addLand(x,z,{refresh:false});
  }
  refreshAllTerrain();
}
async function decorate(){
  for(const [x,z] of [[-2,-1],[2,1],[-1,2],[2,-1]]){
    const t=state.land.get(key(x,z));
    if(t&&t.type==='empty')await setTree(t,false);
  }
  for(const [x,z] of [[-2,1],[1,-2]]){
    const t=state.land.get(key(x,z));
    if(t&&t.type==='empty')await setRock(t,false);
  }
}
function millFields(){
  const mill=millTile();
  if(!mill)return[];
  return DIRECTIONS.map(d=>state.land.get(key(mill.x+d.dx,mill.z+d.dz))).filter(Boolean);
}
function ready(){
  const fields=millFields();
  return !!millTile()&&fields.length===4&&fields.every(t=>t.type==='field'&&t.stage>=4);
}
function randomType(){
  const pool=DECK_WEIGHTS.filter(([type])=>{
    if(type==='market'&&!state.unlocks.market)return false;
    if(type==='fishingShop'&&!state.unlocks.fishingShop)return false;
    return true;
  });
  const total=pool.reduce((s,[,w])=>s+w,0);
  let r=Math.random()*total;
  for(const [t,w] of pool){
    r-=w;
    if(r<=0)return t;
  }
  return'field';
}
const draw=(type=randomType())=>({id:state.nextCardId++,type});
function refillHand(){
  const promoted=[];
  while(state.hand.length<HAND_LIMIT){
    if(state.reserve.length){
      const card=state.reserve.shift();
      state.hand.push(card);
      promoted.push(card);
    }else{
      state.hand.push(draw());
    }
  }
  return promoted;
}
function cardCost(type){
  return CARD_DEFS[type]?.cost||{};
}
function canAfford(type){
  const cost=cardCost(type);
  return (state.resources.wood||0)>=(cost.wood||0)&&(state.resources.stone||0)>=(cost.stone||0);
}
function payCardCost(type){
  const cost=cardCost(type);
  state.resources.wood-=cost.wood||0;
  state.resources.stone-=cost.stone||0;
}
function costMarkup(type){
  const cost=cardCost(type);
  const parts=[];
  if(cost.wood)parts.push(`<span class="cost-chip wood"><i data-lucide="trees"></i><b>${cost.wood}</b></span>`);
  if(cost.stone)parts.push(`<span class="cost-chip stone"><i data-lucide="mountain"></i><b>${cost.stone}</b></span>`);
  return parts.length?parts.join(''):'<span class="cost-free">БЕСПЛАТНО</span>';
}
function syncCardAffordability(){
  for(const button of ui.hand.querySelectorAll('[data-card-id]')){
    const card=state.hand.find(c=>String(c.id)===button.dataset.cardId);
    const affordable=card?canAfford(card.type):false;
    button.classList.toggle('unaffordable',!affordable);
    button.disabled=!affordable;
  }
}
function spend(id){
  const i=state.hand.findIndex(c=>c.id===id);
  if(i<0)return false;
  const card=state.hand[i];
  if(!canAfford(card.type))return false;

  const nextReserve=state.reserve[0];
  const sourceEl=nextReserve?ui.reserveStack.querySelector(`[data-card-id="${nextReserve.id}"]`):null;
  const sourceRect=sourceEl?.getBoundingClientRect?.()||null;

  payCardCost(card.type);
  state.hand.splice(i,1);
  state.selectedCardId=null;
  const promoted=refillHand();
  for(const promotedCard of promoted)state.knownHandCardIds.add(promotedCard.id);
  renderHand();

  if(promoted.length&&sourceRect){
    requestAnimationFrame(()=>animateReserveDraw(promoted[0].id,sourceRect));
  }

  status();
  return true;
}
function ensureMillCard(){
  if(!state.unlocks.mill)return;
  const hasMillCard=[...state.hand,...state.reserve].some(c=>c.type==='mill');
  const reserveBefore=state.reserve.length;
  if(ready()&&!hasMillCard)addCard(draw('mill'),{priority:true});
  renderHand();
  if(state.reserve.length>reserveBefore)animateReserveGain();
}
function animateReserveGain(){
  if(!ui.reserveStack||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  ui.reserveStack.classList.remove('gain');
  void ui.reserveStack.offsetWidth;
  ui.reserveStack.classList.add('gain');
  setTimeout(()=>ui.reserveStack.classList.remove('gain'),520);
}
function animateReserveDraw(cardId,sourceRect){
  const target=ui.hand.querySelector(`[data-card-id="${cardId}"]`);
  if(!target||!sourceRect||matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const targetRect=target.getBoundingClientRect();
  const flyer=document.createElement('span');
  flyer.className='reserve-fly-card';
  flyer.style.left=`${sourceRect.left}px`;
  flyer.style.top=`${sourceRect.top}px`;
  flyer.style.width=`${sourceRect.width}px`;
  flyer.style.height=`${sourceRect.height}px`;
  document.body.appendChild(flyer);

  const dx=targetRect.left-sourceRect.left;
  const dy=targetRect.top-sourceRect.top;
  const scaleX=targetRect.width/sourceRect.width;
  const scaleY=targetRect.height/sourceRect.height;
  const flight=flyer.animate([
    {transform:'translate3d(0,0,0) rotate(-4deg) scale(1)',opacity:1},
    {offset:.58,transform:`translate3d(${dx*.62}px,${dy*.48-82}px,0) rotate(7deg) scale(1.08)`,opacity:1},
    {transform:`translate3d(${dx}px,${dy}px,0) rotate(0deg) scale(${scaleX},${scaleY})`,opacity:.12}
  ],{
    duration:560,
    easing:'cubic-bezier(.2,.78,.2,1)',
    fill:'forwards'
  });

  flight.finished.finally(()=>{
    flyer.remove();
    target.animate(
      [{filter:'brightness(1.24)'},{filter:'brightness(1)'}],
      {duration:260,easing:'ease-out'}
    );
  });
}
function renderReserve(){
  ui.reserveStack.replaceChildren();
  const count=state.reserve.length;
  ui.reserveZone.classList.toggle('hidden',count===0);
  ui.reserveZone.setAttribute('aria-label',count?`Запас: ${count} карт`:'Запас пуст');
  ui.reserveCount.textContent=String(count);
  if(!count)return;

  const yStep=count>1?Math.min(8.5,78/(count-1)):0;
  const xStep=count>1?Math.min(1.25,12/(count-1)):0;
  state.reserve.forEach((card,index)=>{
    const back=document.createElement('span');
    back.className='reserve-card';
    back.dataset.cardId=String(card.id);
    back.style.setProperty('--stack-y',(index*yStep).toFixed(2));
    back.style.setProperty('--stack-x',(index*xStep).toFixed(2));
    back.style.setProperty('--stack-index',String(count-index));
    back.style.setProperty('--stack-tilt',`${((index%3)-1)*.55}deg`);
    back.setAttribute('aria-hidden','true');
    ui.reserveStack.appendChild(back);
  });
}
function renderHand(){
  ui.hand.innerHTML='';
  for(const c of state.hand){
    const d=CARD_DEFS[c.type];
    const b=document.createElement('button');
    const affordable=canAfford(c.type);
    const isNew=!state.knownHandCardIds.has(c.id);
    b.className=`card ${d.tone}${state.selectedCardId===c.id?' active':''}${affordable?'':' unaffordable'}${isNew?' deal-in':''}`;
    b.dataset.cardId=String(c.id);
    b.disabled=!affordable;
    b.style.setProperty('--deal-index',String(state.hand.indexOf(c)));
    state.knownHandCardIds.add(c.id);

    const preview=state.cardPreviews.get(c.type);
    b.innerHTML=`
      <div class="card-preview ${preview?'':'placeholder'}"></div>
      <div class="card-shade"></div>
      <div class="card-top">
        <span class="card-kind">${d.category||'КАРТА'}</span>
        <span class="card-cost">${costMarkup(c.type)}</span>
      </div>
      <span class="card-symbol"><i data-lucide="${d.icon||'box'}"></i></span>
      <div class="card-body">
        <b>${d.name}</b>
        <p>${d.description}</p>
        <span class="card-action"><i data-lucide="mouse-pointer-2"></i>${affordable?'ВЫБРАТЬ':'НУЖНЫ РЕСУРСЫ'}</span>
      </div>`;

    const previewEl=b.querySelector('.card-preview');
    if(preview){
      previewEl.style.backgroundImage=`url("${preview}")`;
    }else{
      previewEl.innerHTML=`<i data-lucide="${d.icon||'box'}"></i>`;
    }

    b.onclick=e=>{
      e.stopPropagation();
      if(!canAfford(c.type)){
        toast('Не хватает ресурсов для этой карты.');
        return;
      }
      state.selectedCardId=state.selectedCardId===c.id?null:c.id;
      ui.selectionHint.textContent=state.selectedCardId?`Карта: ${d.name}`:'Выберите карту';
      renderHand();
    };
    ui.hand.appendChild(b);
  }
  renderReserve();
  ui.handCount.textContent=state.hand.length;
  refreshLucide();
}
function status(){
  ui.harvestScore.textContent=state.harvestScore.toLocaleString('ru-RU');
  if(ui.woodCount)ui.woodCount.textContent=state.resources.wood.toLocaleString('ru-RU');
  if(ui.stoneCount)ui.stoneCount.textContent=state.resources.stone.toLocaleString('ru-RU');
  ui.comboCount.textContent=state.comboCount;
  ui.landCount.textContent=state.land.size;
  syncCardAffordability();

  const mill=millTile();
  const millProgress=millFields().filter(t=>t?.type==='field').length;
  const fieldCombo=Math.min(4,largestNormalFieldCount());
  const houseCombo=Math.min(6,largestConnectedTypeCount('house'));

  if(!state.unlocks.mill){
    ui.objectiveProgressName.textContent='ПЕРВОЕ КОМБО';
    ui.objectiveProgressLabel.textContent=`${fieldCombo} / 4`;
    ui.objectiveProgress.style.width=`${fieldCombo/4*100}%`;
    ui.objectiveTitle.textContent='Откройте мельницу';
    ui.objectiveCopy.textContent='Соедините по стороне любые 4 обычных поля. Первое такое комбо откроет карту мельницы.';
    ui.fieldStatus.innerHTML=`
      <div class="field-chip"><div><span>Мельница</span><i><em style="width:${fieldCombo/4*100}%"></em></i></div><b>ЗАКР.</b></div>
      <div class="field-chip"><div><span>Рынок</span><i><em style="width:0%"></em></i></div><b>ЗАКР.</b></div>`;
    return;
  }

  if(!mill){
    ui.objectiveProgressName.textContent='МЕЛЬНИЦА';
    ui.objectiveProgressLabel.textContent='ОТКРЫТА';
    ui.objectiveProgress.style.width='100%';
    ui.objectiveTitle.textContent='Постройте мельницу';
    ui.objectiveCopy.textContent='Карта мельницы уже открыта. Поставьте её на свободную клетку острова.';
    ui.fieldStatus.innerHTML=`
      <div class="field-chip ready"><div><span>Мельница</span><i><em style="width:100%"></em></i></div><b>✓</b></div>
      <div class="field-chip"><div><span>Рынок: 6 домов</span><i><em style="width:${houseCombo/6*100}%"></em></i></div><b>${houseCombo}/6</b></div>`;
    return;
  }

  if(!state.unlocks.market){
    ui.objectiveProgressName.textContent='ПОСЕЛЕНИЕ';
    ui.objectiveProgressLabel.textContent=`${houseCombo} / 6`;
    ui.objectiveProgress.style.width=`${houseCombo/6*100}%`;
    ui.objectiveTitle.textContent='Откройте рынок';
    ui.objectiveCopy.textContent='Соберите связную по сторонам группу из 6 домов. Первый такой жилой квартал откроет рынок.';
  }else{
    ui.objectiveProgressName.textContent='МЕЛЬНИЦА';
    ui.objectiveProgressLabel.textContent=`${millProgress} / 4`;
    ui.objectiveProgress.style.width=`${Math.min(100,millProgress/4*100)}%`;
    ui.objectiveTitle.textContent=ready()?'Большой урожай готов':'Расширяйте поля мельницы';
    ui.objectiveCopy.textContent=ready()
      ?'Положите карту «Мельница» на существующую мельницу, чтобы собрать большой урожай.'
      :'Каждое новое поле на свободной стороне мельницы повышает стадию всех её полей.';
  }

  const names={north:'Север',east:'Восток',south:'Юг',west:'Запад'};
  ui.fieldStatus.innerHTML=DIRECTIONS.map(d=>{
    const t=state.land.get(key(mill.x+d.dx,mill.z+d.dz));
    const s=t?.type==='field'?t.stage:0;
    return`<div class="field-chip ${s>=4?'ready':''}"><div><span>${names[d.key]}</span><i><em style="width:${s?Math.min(100,s/4*100):0}%"></em></i></div><b>${s?`${s}/4`:'—'}</b></div>`;
  }).join('');
}
let toastTimer;
function toast(s){
  clearTimeout(toastTimer);
  ui.toast.textContent=s;
  ui.toast.classList.remove('hidden');
  toastTimer=setTimeout(()=>ui.toast.classList.add('hidden'),2400);
}
const adjacent=(x,z)=>DIRECTIONS.some(d=>state.land.has(key(x+d.dx,z+d.dz)));
const canExpand=(x,z)=>!state.land.has(key(x,z))&&!state.waterStructures.has(waterKey(x,z))&&Math.abs(x)<=GRID.maxRadius&&Math.abs(z)<=GRID.maxRadius&&adjacent(x,z);

function tileInfo(t){
  if(!t){
    ui.tileInfo.classList.add('hidden');
    return;
  }
  const names={
    empty:'Свободная земля',tree:'Лес',rock:'Камни',field:'Поле',mill:'Мельница',
    house:'Дом',market:'Рынок',lumbermill:'Лесопилка',quarry:'Каменоломня',
    lighthouse:'Маяк',fishingShop:'Рыболовный магазин'
  };
  ui.tileTitle.textContent=names[t.type];
  if(t.type==='field'){
    if(isMillZone(t)){
      const planted=millFields().filter(cell=>cell.type==='field').length;
      ui.tileCopy.textContent=`Поле у мельницы: стадия ${t.stage}/4. Посажено ${planted}/4 соседних полей — новое поле повышает стадию всех.`;
    }else{
      const group=connectedNormalFields(t);
      ui.tileCopy.textContent=`Связное поле: ${group.length} ${group.length===1?'часть':'части'}. Стадия ${t.stage}/4 растёт при добавлении соседнего поля по стороне.`;
    }
  }else if(t.type==='lighthouse'){
    ui.tileCopy.textContent='Маяк освещает море в радиусе 3 клеток. В этом радиусе островные тайлы можно ставить без соприкосновения с существующей сушей.';
  }else if(t.type==='fishingShop'){
    const houses=nearby(t,'house');
    const piers=nearbyPiers(t);
    ui.tileCopy.textContent=`Рыболовный магазин · домов рядом: ${houses}, причалов рядом: ${piers}. Сочетание порта и поселения даёт максимальную карточную награду.`;
  }else if(t.type==='tree'||t.type==='rock'){
    const progress=t.resourceSources?.size||0;
    ui.tileCopy.textContent=`${t.type==='tree'?'Лес':'Камни'}: обработка ${progress}/2. Первая обработка даёт ресурс, вторая освобождает клетку.`;
  }else if(t.type==='lumbermill'||t.type==='quarry'){
    ui.tileCopy.textContent='Положите такую же карту поверх постройки, чтобы завершить цикл: истощить соседнее сырьё, получить награду и освободить клетку производства.';
  }else if(t.type==='empty'){
    const terrainNames={
      center:'внутренняя',edge:'берег', 'outer-corner':'внешний угол',
      'inner-corner':'внутренний угол',channel:'пролив',peninsula:'полуостров',island:'отдельный островок'
    };
    ui.tileCopy.textContent=`Свободная земля · ${terrainNames[t.terrainType]||'остров'} · вариант ${(t.terrainVariant??0)+1}/5.`;
  }else{
    ui.tileCopy.textContent=`Клетка ${t.x}, ${t.z}.`;
  }
  ui.tileInfo.classList.remove('hidden');
}

async function harvest(){
  state.inputLocked=true;
  state.comboCount++;
  state.millLevel++;
  state.bladeBoost=5.5;
  const reward=4+Math.min(4,state.comboCount-1);
  const mill=millTile();
  if(!mill){
    state.inputLocked=false;
    return;
  }
  spawnRing(mill.visual.position.clone(),0xf6ce58);
  spawnBurst(mill.visual.position.clone(),0xffdf72,22);
  pulse(mill.content,.65,.18);
  for(const t of millFields())if(t.type==='field')pulse(t.content,.5,.2);
  await tween(.45,()=>{});
  state.harvestScore+=150*state.millLevel*4;
  for(const t of millFields()){
    if(t.type!=='field')continue;
    spawnBurst(t.visual.position.clone(),0xe5bd55,10);
    clearContent(t);
  }
  await syncAllNormalFieldStages(false);
  grantCards(reward);
  spawnCardBurst(mill.visual.position.clone(),Math.min(4,reward));
  toast(`Большой урожай! +${reward} бонусных карт. Поля собраны — начинайте новый цикл.`);
  status();
  state.inputLocked=false;
}

async function apply(card,t){
  if(card.type==='field'){
    if(t.type!=='empty'){
      return toast(t.type==='field'
        ?'Здесь уже есть поле. Новую карту поставьте на соседнюю свободную клетку.'
        :'Сначала расчистите эту клетку.');
    }

    await setField(t,1,false);
    spend(card.id);
    state.inputLocked=true;

    if(isMillZone(t)){
      const fields=await syncMillFieldStages({
        animated:true,
        forceKeys:new Set([t.key])
      });
      ensureMillCard();
      status();
      state.inputLocked=false;

      if(fields.length>=4)return toast('Четвёртое поле посажено: все поля мельницы созрели до 4/4.');
      return toast(`Поля мельницы: ${fields.length}/4. Все соседние поля выросли до стадии ${fields.length}.`);
    }

    const component=await syncNormalFieldComponent(t,{
      animated:true,
      forceKeys:new Set([t.key])
    });
    const group=findCollapseGroup(t);
    status();

    if(group){
      state.inputLocked=false;
      await collapseFields(group);
      return;
    }

    state.inputLocked=false;
    return toast(component.length===1
      ?'Первое поле посажено. Добавьте соседнее по стороне, чтобы оно выросло.'
      :`Связное поле: ${component.length}/4. Все части выросли до стадии ${component.length}.`);
  }

  if(card.type==='tree'){
    if(t.type!=='empty')return toast('Для леса нужна свободная клетка.');
    await setTree(t,true);
    spend(card.id);
    const activation=await activateProducersForResource(t);
    status();
    if(activation.producers>=2)return toast('Лес попал в перекрытие двух лесопилок: древесина добыта, клетка сразу освободилась.');
    if(activation.producers===1)return toast('Новый лес сразу обработан соседней лесопилкой: +1 древесина, 1/2.');
    return;
  }

  if(card.type==='rock'){
    if(t.type!=='empty')return toast('Камни можно добавить только на свободную клетку.');
    await setRock(t,true);
    spend(card.id);
    const activation=await activateProducersForResource(t);
    status();
    if(activation.producers>=2)return toast('Камни попали в перекрытие двух каменоломен: ресурс добыт, клетка сразу освободилась.');
    if(activation.producers===1)return toast('Новые камни сразу обработаны соседней каменоломней: +1 камень, 1/2.');
    return;
  }

  if(card.type==='clear'){
    if(!['tree','rock'].includes(t.type))return toast('Расчистка убирает деревья и камни.');
    const p=t.visual.position.clone();
    if(t.content)await tween(.25,v=>t.content.scale.setScalar(Math.max(.03,1-v)));
    clearContent(t);
    spawnBurst(p,0xd5c99f,8);
    spawnRing(p,0xd5c99f);
    spend(card.id);
    status();
    return;
  }

  if(card.type==='mill'){
    if(!state.unlocks.mill)return toast('Мельница ещё не открыта.');

    if(!state.millCell){
      if(t.type!=='empty')return toast('Для мельницы нужна свободная клетка.');
      await setMill(t);
      spend(card.id);
      ensureMillCard();
      spawnRing(t.visual.position.clone(),0xe7bd5c);
      spawnBurst(t.visual.position.clone(),0xf0d67c,16);
      status();
      return toast('Мельница построена. Четыре соседние клетки теперь её поля.');
    }

    if(t.type!=='mill')return toast('На острове уже есть мельница.');
    if(!ready())return toast('Сначала доведите четыре поля у мельницы до 4/4.');
    spend(card.id);
    await harvest();
    return;
  }

  if(card.type==='lighthouse'){
    if(t.type!=='empty')return toast('Для маяка нужна свободная клетка суши.');
    state.inputLocked=true;
    await setLighthouse(t,true);
    spend(card.id);
    state.inputLocked=false;
    status();
    return toast('Маяк зажжён. Он открывает удалённое строительство островов в радиусе 3 клеток.');
  }

  if(card.type==='fishingShop'){
    if(t.type!=='empty')return toast('Рыболовному магазину нужна свободная клетка суши.');
    state.inputLocked=true;
    await setFishingShop(t,true);
    spend(card.id);

    const houses=nearby(t,'house');
    const piers=nearbyPiers(t);
    const nearPier=piers>0;
    const nearHomes=houses>=2;
    let bonusCards=(nearPier?1:0)+(nearHomes?1:0)+(nearPier&&nearHomes?1:0);
    const score=45+Math.min(3,houses)*20+Math.min(2,piers)*35;
    state.harvestScore+=score;
    if(bonusCards){
      grantCards(bonusCards);
      spawnCardBurst(t.visual.position.clone(),bonusCards);
    }
    if(nearPier&&nearHomes)state.comboCount++;
    spawnBurst(t.visual.position.clone(),0x71b7a0,14);
    state.inputLocked=false;
    status();

    if(nearPier&&nearHomes)return toast(`Портовый квартал! +${score} очков и +3 карты за причал и жилой район.`);
    if(nearPier)return toast(`Магазин у причала: +${score} очков и +1 карта.`);
    if(nearHomes)return toast(`Магазин у жилого квартала: +${score} очков и +1 карта.`);
    return toast(`Рыболовный магазин открыт, но без причала и жилого района пока не даёт карты. +${score} очков.`);
  }

  if(['house','market','lumbermill','quarry'].includes(card.type)){
    const isProducer=card.type==='lumbermill'||card.type==='quarry';

    if(isProducer&&t.type===card.type){
      spend(card.id);
      await resolveProducer(t,card.type);
      return;
    }

    if(t.type!=='empty')return toast('Для здания нужна свободная клетка.');

    if(card.type==='house'){
      await setBuilding(t,card.type,true);
      state.harvestScore+=30;
      spend(card.id);
      spawnBurst(t.visual.position.clone(),0xf0d67c,10);
      const houseGroup=connectedTypeGroup(t,'house');
      const openedMarket=houseGroup.length>=6&&unlockMarket(t.visual.position.clone());
      status();
      return toast(openedMarket
        ?'Комбо из 6 связанных домов! Рынок открыт и добавлен в руку.'
        :`Дом построен. Связный квартал: ${Math.min(6,houseGroup.length)}/6 до открытия рынка.`);
    }

    if(card.type==='market'){
      if(!state.unlocks.market)return toast('Рынок ещё не открыт.');
      const houses=nearby(t,'house');
      const score=45+houses*45;
      const bonusCards=houses>=2?1:0;
      await setBuilding(t,card.type,true);
      state.harvestScore+=score;
      spend(card.id);
      if(bonusCards){
        grantCards(bonusCards);
        spawnCardBurst(t.visual.position.clone(),bonusCards);
      }
      spawnBurst(t.visual.position.clone(),0xf0d67c,10);
      status();
      return toast(`Рынок: ${houses} домов рядом, +${score} очков.${bonusCards?' +1 карта.':''}`);
    }

    await setBuilding(t,card.type,true);
    spend(card.id);
    const result=await processProducerPlacement(t,card.type);
    spawnBurst(t.visual.position.clone(),card.type==='lumbermill'?0xb98552:0x8d9692,12);
    status();

    if(!result.touched){
      return toast(card.type==='lumbermill'
        ?'Лесопилка построена, но рядом пока нет леса.'
        :'Каменоломня построена, но рядом пока нет камней.');
    }
    if(result.depleted){
      return toast(`Обработано ${result.touched} клеток; ${result.depleted} уже видели второе производство и исчезли.`);
    }
    return toast(`Первая обработка: +${result.touched} ${card.type==='lumbermill'?'древесины':'камня'}. Сырьё помечено 1/2.`);
  }
}

function hitsAt(x,y){
  const r=renderer.domElement.getBoundingClientRect();
  pointer.x=(x-r.left)/r.width*2-1;
  pointer.y=-(y-r.top)/r.height*2+1;
  ray.setFromCamera(pointer,camera);
  return ray.intersectObjects([world,waterPlane],true);
}
function tileOf(o){
  while(o){
    if(o.userData?.cellKey&&state.land.has(o.userData.cellKey))return state.land.get(o.userData.cellKey);
    o=o.parent;
  }
  return null;
}

let down=null;
renderer.domElement.onpointerdown=e=>down={x:e.clientX,y:e.clientY,button:e.button};
renderer.domElement.onpointerup=async e=>{
  if(state.inputLocked){
    down=null;
    return;
  }
  if(!down||down.button!==0||e.button!==0){
    down=null;
    return;
  }
  const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);
  down=null;
  if(moved>5)return;
  const hits=hitsAt(e.clientX,e.clientY);
  if(!hits.length)return;
  const card=state.hand.find(c=>c.id===state.selectedCardId);
  if(card&&!canAfford(card.type))return toast('Не хватает ресурсов для установки.');
  const tileHit=hits.find(h=>tileOf(h.object));
  const t=tileHit?tileOf(tileHit.object):null;
  if(!card){
    if(t)return tileInfo(t);
    const structureHit=hits.find(h=>waterStructureOf(h.object));
    return structureHit?waterStructureInfo(waterStructureOf(structureHit.object)):tileInfo(null);
  }

  if(card.type==='expand'){
    const wh=hits.find(h=>h.object===waterPlane);
    if(!wh)return toast('Расширять остров можно только в сторону воды.');
    const x=Math.round(wh.point.x/GRID.tileSize);
    const z=Math.round(wh.point.z/GRID.tileSize);
    if(!canExpand(x,z))return toast('Новая земля должна касаться существующего острова.');
    const nt=addLand(x,z,{refresh:false});
    spend(card.id);
    state.inputLocked=true;
    await animateLandRise(nt);
    refreshTerrainNeighborhood(x,z);
    spawnBurst(nt.visual.position.clone(),0x9bc86d,10);
    state.inputLocked=false;
    status();
    tileInfo(nt);
    return toast('Новый кусок острова поднялся из воды.');
  }

  if(card.type==='pier'||card.type==='island'){
    const cell=snappedWaterCell(hits);
    if(!cell)return toast('Эту карту нужно поставить на воду.');
    if(card.type==='pier')return placePier(card,cell.x,cell.z);
    return placeIsland(card,cell.x,cell.z);
  }

  if(card.type==='lighthouse'&&!t){
    const cell=snappedWaterCell(hits);
    if(!cell)return toast('Маяк нужно поставить на сушу или в море недалеко от известного берега.');
    return placeRemoteLighthouse(card,cell.x,cell.z);
  }

  if(!t)return toast('Эту карту нужно применить к клетке острова.');
  await apply(card,t);
};
renderer.domElement.onpointermove=e=>{
  if(state.inputLocked){hoverMarker.visible=false;return;}
  const hits=hitsAt(e.clientX,e.clientY);
  const card=state.hand.find(c=>c.id===state.selectedCardId);
  const tileHit=hits.find(h=>tileOf(h.object));
  const t=tileHit?tileOf(tileHit.object):null;

  if((card&&['expand','pier','island'].includes(card.type))||(card?.type==='lighthouse'&&!t)){
    const cell=snappedWaterCell(hits);
    if(!cell){hoverMarker.visible=false;return;}
    const valid=
      card.type==='expand'?canExpand(cell.x,cell.z):
      card.type==='pier'?canPlacePier(cell.x,cell.z):
      card.type==='island'?canPlaceIsland(cell.x,cell.z):
      canPlaceRemoteLighthouse(cell.x,cell.z);
    hoverMarker.visible=true;
    hoverMarker.position.set(cell.x*GRID.tileSize,-.45,cell.z*GRID.tileSize);
    hoverMarker.material.color.setHex(valid?0x86dec3:0xd97b6f);
    hoverMarker.material.opacity=valid?.27:.17;
    return;
  }

  if(t){
    hoverMarker.visible=true;
    hoverMarker.position.set(t.visual.position.x,.17,t.visual.position.z);
    const valid=!card||card.type==='clear'?true:
      card.type==='lighthouse'?t.type==='empty':
      card.type==='fishingShop'?t.type==='empty':
      t.type==='empty'||card.type==='field'&&t.type==='field'||
      card.type==='mill'&&((!state.millCell&&t.type==='empty')||(state.millCell&&t.type==='mill'))||
      (card.type==='lumbermill'||card.type==='quarry')&&t.type===card.type;
    hoverMarker.material.color.setHex(valid?0xf6df86:0xd97b6f);
    hoverMarker.material.opacity=valid?.24:.16;
  }else{
    hoverMarker.visible=false;
  }
};
renderer.domElement.onpointerleave=()=>{hoverMarker.visible=false;};
renderer.domElement.oncontextmenu=e=>e.preventDefault();

function rotate(a){
  const o=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),a);
  camera.position.copy(controls.target).add(o);
  camera.lookAt(controls.target);
  controls.update();
}
ui.marineChoice.addEventListener('click',e=>{
  const button=e.target.closest('[data-marine-choice]');
  if(!button)return;
  resolveMarineChoice(button.dataset.marineChoice);
});

window.onkeydown=e=>{
  if(e.key==='Escape'){
    state.selectedCardId=null;
    ui.selectionHint.textContent='Выберите карту';
    renderHand();
  }
  if(e.key.toLowerCase()==='q')rotate(.13);
  if(e.key.toLowerCase()==='e')rotate(-.13);
};

let previousFrame=performance.now();
function tick(time){
  const dt=Math.min(.05,(time-previousFrame)/1000);
  previousFrame=time;
  controls.update();
  updateTweens(dt);
  updateAmbientActors(time,dt);
  updateFieldMotion(time);
  const bladeSpeed=.75+state.bladeBoost;
  for(const blades of state.millBlades)blades.rotation.z+=dt*bladeSpeed;
  for(const beam of state.lighthouseBeams)beam.rotation.y+=dt*.72;
  for(const actor of state.marineActors){
    if(!actor.object?.parent)continue;
    actor.object.position.y=actor.baseY+Math.sin(time*.00145+actor.phase)*.055;
    actor.object.rotation.z=Math.sin(time*.0011+actor.phase)*.025;
  }
  state.bladeBoost=Math.max(0,state.bladeBoost-dt*1.8);
  water.material.opacity=.90+Math.sin(time*.0006)*.025;
  water.rotation.z=Math.sin(time*.00015)*.01;
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}

async function boot(){
  startLoadingPhrases();
  seed();
  ['tree','lumbermill','rock','quarry','field'].forEach(t=>addCard(draw(t)));
  addCard(draw('pier'));
  renderHand();
  status();
  const loading=preload();
  await decorate();
  await loading;
  await buildCardPreviews();
  refreshLucide();
  status();
  await finishLoadingScreen();
  toast('В запасе уже лежит причал: потратьте карту из руки, чтобы открыть морскую ветку.');
}
boot().catch(e=>{
  console.error(e);
  stopLoadingPhrases();
  setLoadingProgress(100,'ОШИБКА','Не удалось подготовить мир');
  changeLoadingPhrase('Остров не поднялся. Попробуйте обновить страницу.');
});
requestAnimationFrame(tick);

window.onresize=()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
