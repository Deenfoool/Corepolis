import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CARD_DEFS, DECK_WEIGHTS, DIRECTIONS, GRID } from './config.js';
import { ASSETS } from './models.js';

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
waterPlane.rotation.x=-Math.PI/2;
waterPlane.position.y=-.54;
scene.add(waterPlane);

const loader=new GLTFLoader();
const cache=new Map();
const ray=new THREE.Raycaster();
const pointer=new THREE.Vector2();

const ui={
  loadingScreen:$('#loading-screen'),loadingBar:$('#loading-bar'),loadingProgress:$('#loading-progress'),
  loadingDetail:$('#loading-detail'),hand:$('#hand'),handCount:$('#hand-count'),
  selectionHint:$('#selection-hint'),harvestScore:$('#harvest-score'),comboCount:$('#combo-count'),
  landCount:$('#land-count'),objectiveTitle:$('#objective-title'),objectiveCopy:$('#objective-copy'),
  fieldStatus:$('#field-status'),toast:$('#toast'),tileInfo:$('#tile-info'),
  tileTitle:$('#tile-title'),tileCopy:$('#tile-copy')
};

const state={
  land:new Map(),
  hand:[],
  selectedCardId:null,
  nextCardId:1,
  nextFieldOrder:1,
  harvestScore:0,
  comboCount:0,
  millLevel:1,
  millCell:'0,0',
  millBlades:[],
  bladeBoost:0,
  tweens:[],
  inputLocked:false
};

const key=(x,z)=>`${x},${z}`;
const pos=(x,z)=>new THREE.Vector3(x*GRID.tileSize,0,z*GRID.tileSize);
const easeOut=t=>1-Math.pow(1-t,3);
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

const load=url=>{
  if(!cache.has(url))cache.set(url,loader.loadAsync(url).then(g=>g.scene));
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
  tile.visual.position.y=targetY-1.5;
  spawnRing(tile.visual.position.clone().setY(0),0x8fd56f);
  return tween(.48,p=>{
    tile.visual.position.y=THREE.MathUtils.lerp(targetY-1.5,targetY,easeOut(p));
  });
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
async function preload(){
  const entries=Object.entries(ASSETS);
  let done=0;
  for(const [name,url] of entries){
    ui.loadingDetail.textContent=`Загружаем: ${name}`;
    await load(url);
    done++;
    ui.loadingBar.style.width=`${Math.round(done/entries.length*100)}%`;
    ui.loadingProgress.textContent=`${done} / ${entries.length}`;
  }
  ui.loadingScreen.classList.add('done');
  setTimeout(()=>ui.loadingScreen.remove(),500);
}

function tileMesh(x,z){
  const g=new THREE.Group();
  g.position.copy(pos(x,z));
  g.userData.cellKey=key(x,z);
  const soil=new THREE.Mesh(
    new THREE.BoxGeometry(GRID.tileSize*.96,.72,GRID.tileSize*.96),
    new THREE.MeshStandardMaterial({color:0x8b7047,roughness:.95})
  );
  soil.position.y=-.38;
  soil.castShadow=soil.receiveShadow=true;
  g.add(soil);
  const grass=new THREE.Mesh(
    new THREE.BoxGeometry(GRID.tileSize*.98,.16,GRID.tileSize*.98),
    new THREE.MeshStandardMaterial({color:0x79a95a,roughness:.93})
  );
  grass.position.y=.02;
  grass.castShadow=grass.receiveShadow=true;
  grass.userData.cellKey=g.userData.cellKey;
  g.add(grass);
  return g;
}
function addLand(x,z){
  const k=key(x,z);
  if(state.land.has(k))return state.land.get(k);
  const t={
    x,z,key:k,type:'empty',stage:0,visual:tileMesh(x,z),content:null,fieldOrder:null
  };
  state.land.set(k,t);
  world.add(t.visual);
  return t;
}
function clearContent(t){
  if(t.content){
    if(t.content.parent)t.content.parent.remove(t.content);
    t.content=null;
  }
  t.type='empty';
  t.stage=0;
  t.fieldOrder=null;
}
function badge(stage){
  const c=document.createElement('canvas');
  c.width=c.height=128;
  const x=c.getContext('2d');
  x.fillStyle='#fff8dc';
  x.beginPath();
  x.arc(64,64,48,0,Math.PI*2);
  x.fill();
  x.strokeStyle='#6b5a31';
  x.lineWidth=7;
  x.stroke();
  x.fillStyle='#5a4926';
  x.font='bold 62px system-ui';
  x.textAlign='center';
  x.textBaseline='middle';
  x.fillText(stage,64,67);
  const tx=new THREE.CanvasTexture(c);
  tx.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true}));
  s.scale.set(.9,.9,.9);
  return s;
}
function fieldVisual(stage,synergy=false){
  const g=new THREE.Group();
  const dirt=new THREE.Mesh(
    new THREE.BoxGeometry(GRID.tileSize*.82,.18,GRID.tileSize*.82),
    new THREE.MeshStandardMaterial({color:synergy?0x8a642f:0x72502f,roughness:1})
  );
  dirt.position.y=.17;
  dirt.castShadow=dirt.receiveShadow=true;
  g.add(dirt);
  const cropMat=new THREE.MeshStandardMaterial({color:stage>=3?0xd7ad3e:0xa7b947,roughness:.9});
  const n=3+stage;
  for(let x=0;x<n;x++)for(let z=0;z<n;z++){
    if(((x*3+z*5+stage)%10)/10>.3+stage*.17)continue;
    const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.52+stage*.08,5),cropMat);
    stalk.position.set((x-(n-1)/2)*.48,.48+stage*.04,(z-(n-1)/2)*.48);
    stalk.castShadow=true;
    g.add(stalk);
  }
  const b=badge(stage);
  b.position.set(1.55,.48,-1.55);
  g.add(b);
  return g;
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
  await modelOn(t,((t.x+t.z)&1)?'treeA':'treeB',2.6,t.x*.9+t.z*1.4,animated);
}
async function setRock(t,animated=false){
  clearContent(t);
  t.type='rock';
  await modelOn(t,((t.x-t.z)&1)?'rockA':'rockC',2.4,t.x*1.3-t.z,animated);
}
const BUILDING_ASSET={house:'house',market:'market',lumbermill:'lumbermill',mine:'mine'};
const BUILDING_SIZE={house:3.45,market:3.75,lumbermill:3.9,mine:3.55};
async function setBuilding(t,type,animated=false){
  clearContent(t);
  t.type=type;
  await modelOn(t,BUILDING_ASSET[type],BUILDING_SIZE[type],(t.x*17+t.z*11)*.13,animated);
  t.type=type;
}
function isMillZone(t){
  return DIRECTIONS.some(d=>t.x===d.dx&&t.z===d.dz);
}
function setField(t,stage=1,animated=false,fieldOrder=null){
  const order=fieldOrder??t.fieldOrder??state.nextFieldOrder++;
  clearContent(t);
  t.type='field';
  t.stage=stage;
  t.fieldOrder=order;
  t.content=fieldVisual(stage,isMillZone(t));
  t.visual.add(t.content);
  if(animated){
    spawnRing(t.visual.position.clone(),isMillZone(t)?0xf1c75b:0xb4cc62);
    animatePop(t.content,.28);
  }
}
function nearby(t,type,radius=1){
  let count=0;
  for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){
    if(!dx&&!dz)continue;
    if(state.land.get(key(t.x+dx,t.z+dz))?.type===type)count++;
  }
  return count;
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
async function collapseFields(group){
  if(!group)return;
  state.inputLocked=true;
  const anchor=group.reduce((best,t)=>t.fieldOrder<best.fieldOrder?t:best,group[0]);
  const anchorOrder=anchor.fieldOrder;
  const target=anchor.visual.position.clone().add(new THREE.Vector3(0,.32,0));
  const moving=[];
  for(const t of group){
    if(!t.content)continue;
    const object=t.content;
    world.attach(object);
    moving.push({
      t,object,start:object.position.clone(),scale:object.scale.clone(),
      rotY:object.rotation.y
    });
  }
  spawnRing(target,0xf3c85d);
  spawnBurst(target,0xf4d46d,16);
  await tween(.6,p=>{
    for(const m of moving){
      const arc=Math.sin(p*Math.PI)*(m.t===anchor?.18:.55);
      m.object.position.lerpVectors(m.start,target,easeInOut(p));
      m.object.position.y+=arc;
      m.object.scale.copy(m.scale).multiplyScalar(1-p*.72);
      m.object.rotation.y=m.rotY+p*Math.PI*.65;
    }
  },t=>t);
  for(const m of moving){
    if(m.object.parent)m.object.parent.remove(m.object);
    m.t.content=null;
    m.t.type='empty';
    m.t.stage=0;
    m.t.fieldOrder=null;
  }
  setField(anchor,1,false,anchorOrder);
  await pulse(anchor.content,.42,.28);
  state.harvestScore+=120;
  state.comboCount++;
  grantCards(1);
  spawnCardBurst(target,1);
  toast('4 части поля схлопнулись в первую: +120 очков и +1 карта.');
  status();
  state.inputLocked=false;
}
function grantCards(count){
  for(let i=0;i<count;i++)state.hand.push(draw());
  renderHand();
}
async function setMill(t){
  clearContent(t);
  t.type='mill';
  const m=await modelOn(t,'windmill',3.55,Math.PI*.25,false);
  const blades=m.getObjectByName('building_windmill_top_fan_green');
  state.millBlades=blades?[blades]:[];
  t.type='mill';
}
function seed(){
  for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){
    if(Math.abs(x)+Math.abs(z)<=3||(Math.abs(x)<=1&&Math.abs(z)<=2))addLand(x,z);
  }
}
async function decorate(){
  await setMill(state.land.get(state.millCell));
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
  return DIRECTIONS.map(d=>state.land.get(key(d.dx,d.dz))).filter(Boolean);
}
function ready(){
  const fields=millFields();
  return fields.length===4&&fields.every(t=>t.type==='field'&&t.stage>=4);
}
function randomType(){
  const pool=ready()?DECK_WEIGHTS:DECK_WEIGHTS.filter(([t])=>t!=='millUpgrade');
  const total=pool.reduce((s,[,w])=>s+w,0);
  let r=Math.random()*total;
  for(const [t,w] of pool){
    r-=w;
    if(r<=0)return t;
  }
  return'field';
}
const draw=(type=randomType())=>({id:state.nextCardId++,type});
function fill(n=5){
  while(state.hand.length<n)state.hand.push(draw());
}
function spend(id){
  const i=state.hand.findIndex(c=>c.id===id);
  if(i<0)return;
  state.hand.splice(i,1);
  state.selectedCardId=null;
  fill();
  renderHand();
}
function ensureUpgrade(){
  if(ready()&&!state.hand.some(c=>c.type==='millUpgrade'))state.hand.push(draw('millUpgrade'));
  renderHand();
}
function renderHand(){
  ui.hand.innerHTML='';
  for(const c of state.hand){
    const d=CARD_DEFS[c.type];
    const b=document.createElement('button');
    b.className=`card ${d.tone}${state.selectedCardId===c.id?' active':''}`;
    b.innerHTML=`<span class="card-icon">${d.icon}</span><b>${d.name}</b><p>${d.description}</p>`;
    b.onclick=e=>{
      e.stopPropagation();
      state.selectedCardId=state.selectedCardId===c.id?null:c.id;
      ui.selectionHint.textContent=state.selectedCardId?`Карта: ${d.name}`:'Выберите карту';
      renderHand();
    };
    ui.hand.appendChild(b);
  }
  ui.handCount.textContent=state.hand.length;
}
function status(){
  ui.harvestScore.textContent=state.harvestScore.toLocaleString('ru-RU');
  ui.comboCount.textContent=state.comboCount;
  ui.landCount.textContent=state.land.size;
  const names={north:'Север',east:'Восток',south:'Юг',west:'Запад'};
  ui.fieldStatus.innerHTML=DIRECTIONS.map(d=>{
    const t=state.land.get(key(d.dx,d.dz));
    const s=t?.type==='field'?t.stage:0;
    return`<div class="field-chip ${s>=4?'ready':''}"><span>${names[d.key]}</span><b>${s?`${s}/4`:'—'}</b></div>`;
  }).join('');
  ui.objectiveTitle.textContent=ready()?'Урожай готов — нужна новая мельница':'Соединяйте любые 4 части поля';
  ui.objectiveCopy.textContent=ready()
    ?'Положите карту «Новая мельница» на центральную мельницу, чтобы собрать комбо.'
    :'Без мельницы любая связная фигура из 4 частей сразу схлопывается в самую первую поставленную часть.';
}
let toastTimer;
function toast(s){
  clearTimeout(toastTimer);
  ui.toast.textContent=s;
  ui.toast.classList.remove('hidden');
  toastTimer=setTimeout(()=>ui.toast.classList.add('hidden'),2400);
}
const adjacent=(x,z)=>DIRECTIONS.some(d=>state.land.has(key(x+d.dx,z+d.dz)));
const canExpand=(x,z)=>!state.land.has(key(x,z))&&Math.abs(x)<=GRID.maxRadius&&Math.abs(z)<=GRID.maxRadius&&adjacent(x,z);

function tileInfo(t){
  if(!t){
    ui.tileInfo.classList.add('hidden');
    return;
  }
  const names={empty:'Свободная земля',tree:'Лес',rock:'Камни',field:'Поле',mill:'Мельница',house:'Дом',market:'Рынок',lumbermill:'Лесопилка',mine:'Шахта'};
  ui.tileTitle.textContent=names[t.type];
  if(t.type==='field'){
    ui.tileCopy.textContent=isMillZone(t)
      ?`Поле у мельницы: ${t.stage}/4. Оно не схлопывается автоматически и ждёт апгрейда мельницы.`
      :'Обычная часть поля. Соедините её по стороне ещё с тремя частями любой формы.';
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
  const mill=state.land.get(state.millCell);
  spawnRing(mill.visual.position.clone(),0xf6ce58);
  spawnBurst(mill.visual.position.clone(),0xffdf72,22);
  pulse(mill.content,.65,.18);
  for(const t of millFields())if(t.type==='field')pulse(t.content,.5,.2);
  await tween(.45,()=>{});
  state.harvestScore+=150*state.millLevel*4;
  for(const t of millFields()){
    if(t.type==='field')setField(t,1,true,t.fieldOrder);
  }
  grantCards(reward);
  spawnCardBurst(mill.visual.position.clone(),Math.min(4,reward));
  toast(`Большой урожай! +${reward} бонусных карт — мельница ускорилась`);
  status();
  state.inputLocked=false;
}

async function apply(card,t){
  if(card.type==='field'){
    if(!['empty','field'].includes(t.type))return toast('Сначала расчистите эту клетку.');

    if(isMillZone(t)){
      if(t.type==='empty'){
        setField(t,1,true);
        spend(card.id);
        ensureUpgrade();
        status();
        return;
      }
      if(t.stage>=4)return toast('Это поле уже набрало 4 части и ждёт апгрейда мельницы.');
      const order=t.fieldOrder;
      setField(t,t.stage+1,true,order);
      spend(card.id);
      ensureUpgrade();
      status();
      if(t.stage>=4)toast('Поле у мельницы готово и теперь ждёт большую комбинацию.');
      return;
    }

    if(t.type==='field')return toast('Эта часть поля уже лежит. Следующую часть поставьте рядом по стороне.');

    setField(t,1,true);
    spend(card.id);
    const group=findCollapseGroup(t);
    status();
    if(group)await collapseFields(group);
    return;
  }

  if(card.type==='tree'){
    if(t.type!=='empty')return toast('Для леса нужна свободная клетка.');
    await setTree(t,true);
    spend(card.id);
    status();
    return;
  }

  if(card.type==='rock'){
    if(t.type!=='empty')return toast('Камни можно добавить только на свободную клетку.');
    await setRock(t,true);
    spend(card.id);
    status();
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

  if(card.type==='millUpgrade'){
    if(t.type!=='mill')return toast('Новую мельницу нужно положить на старую.');
    if(!ready())return toast('Сначала доведите четыре поля у мельницы до 4/4.');
    spend(card.id);
    await harvest();
    return;
  }

  if(['house','market','lumbermill','mine'].includes(card.type)){
    if(t.type!=='empty')return toast('Для здания нужна свободная клетка.');
    let score=25,bonusCards=0,message='Здание построено.';
    if(card.type==='house'){
      score=30;
      message='Дом построен. Рынок рядом с домами будет выгоднее.';
    }
    if(card.type==='market'){
      const houses=nearby(t,'house');
      score=45+houses*45;
      bonusCards=houses>=2?1:0;
      message=`Рынок: ${houses} домов рядом, +${score} очков.`;
    }
    if(card.type==='lumbermill'){
      const trees=nearby(t,'tree');
      score=40+trees*35;
      bonusCards=trees>=2?1:0;
      message=`Лесопилка: ${trees} деревьев рядом, +${score} очков.`;
    }
    if(card.type==='mine'){
      const rocks=nearby(t,'rock');
      score=45+rocks*40;
      bonusCards=rocks>=2?1:0;
      message=`Шахта: ${rocks} залежей рядом, +${score} очков.`;
    }
    await setBuilding(t,card.type,true);
    state.harvestScore+=score;
    spend(card.id);
    if(bonusCards){
      grantCards(bonusCards);
      spawnCardBurst(t.visual.position.clone(),bonusCards);
    }
    spawnBurst(t.visual.position.clone(),0xf0d67c,10);
    status();
    return toast(message+(bonusCards?' +1 карта.':''));
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
  const tileHit=hits.find(h=>tileOf(h.object));
  const t=tileHit?tileOf(tileHit.object):null;
  if(!card)return tileInfo(t);

  if(card.type==='expand'){
    const wh=hits.find(h=>h.object===waterPlane);
    if(!wh)return toast('Расширять остров можно только в сторону воды.');
    const x=Math.round(wh.point.x/GRID.tileSize);
    const z=Math.round(wh.point.z/GRID.tileSize);
    if(!canExpand(x,z))return toast('Новая земля должна касаться существующего острова.');
    const nt=addLand(x,z);
    spend(card.id);
    state.inputLocked=true;
    await animateLandRise(nt);
    spawnBurst(nt.visual.position.clone(),0x9bc86d,10);
    state.inputLocked=false;
    status();
    tileInfo(nt);
    return toast('Новый кусок острова поднялся из воды.');
  }

  if(!t)return toast('Эту карту нужно применить к клетке острова.');
  await apply(card,t);
};
renderer.domElement.oncontextmenu=e=>e.preventDefault();

function rotate(a){
  const o=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),a);
  camera.position.copy(controls.target).add(o);
  camera.lookAt(controls.target);
  controls.update();
}
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
  const bladeSpeed=.75+state.bladeBoost;
  for(const blades of state.millBlades)blades.rotation.z+=dt*bladeSpeed;
  state.bladeBoost=Math.max(0,state.bladeBoost-dt*1.8);
  water.material.opacity=.90+Math.sin(time*.0006)*.025;
  water.rotation.z=Math.sin(time*.00015)*.01;
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}

async function boot(){
  seed();
  ['field','field','expand','house','lumbermill'].forEach(t=>state.hand.push(draw(t)));
  renderHand();
  status();
  const loading=preload();
  await decorate();
  await loading;
  status();
  toast('Любые 4 соединённые части поля схлопнутся в самую первую.');
}
boot().catch(e=>{
  console.error(e);
  ui.loadingDetail.textContent='Не удалось загрузить один из ассетов. Проверьте консоль.';
});
requestAnimationFrame(tick);

window.onresize=()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
