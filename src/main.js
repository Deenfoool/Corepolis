import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CARD_DEFS, DECK_WEIGHTS, DIRECTIONS, GRID } from './config.js';
import { ASSETS } from './models.js';

const $=s=>document.querySelector(s),canvas=$('#game'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fcbd8);scene.fog=new THREE.Fog(0x9fd2dc,52,105);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,180);camera.position.set(25,31,31);
const controls=new MapControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.08;controls.screenSpacePanning=false;controls.minDistance=17;controls.maxDistance=70;controls.maxPolarAngle=Math.PI*.45;controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;
scene.add(new THREE.HemisphereLight(0xeaf9ff,0x7d6849,2.2));const sun=new THREE.DirectionalLight(0xfff2cf,3.6);sun.position.set(30,44,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45});scene.add(sun);
const world=new THREE.Group();scene.add(world);
const water=new THREE.Mesh(new THREE.CircleGeometry(70,96),new THREE.MeshPhysicalMaterial({color:0x4db3c7,roughness:.28,transparent:true,opacity:.93}));water.rotation.x=-Math.PI/2;water.position.y=-.62;water.receiveShadow=true;scene.add(water);
const seabed=new THREE.Mesh(new THREE.CircleGeometry(72,96),new THREE.MeshStandardMaterial({color:0x83c6b7,roughness:1}));seabed.rotation.x=-Math.PI/2;seabed.position.y=-1.28;scene.add(seabed);
const waterPlane=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));waterPlane.rotation.x=-Math.PI/2;waterPlane.position.y=-.54;scene.add(waterPlane);
const loader=new GLTFLoader(),cache=new Map(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
const ui={loadingScreen:$('#loading-screen'),loadingBar:$('#loading-bar'),loadingProgress:$('#loading-progress'),loadingDetail:$('#loading-detail'),hand:$('#hand'),handCount:$('#hand-count'),selectionHint:$('#selection-hint'),harvestScore:$('#harvest-score'),comboCount:$('#combo-count'),landCount:$('#land-count'),objectiveTitle:$('#objective-title'),objectiveCopy:$('#objective-copy'),fieldStatus:$('#field-status'),toast:$('#toast'),tileInfo:$('#tile-info'),tileTitle:$('#tile-title'),tileCopy:$('#tile-copy')};
const state={land:new Map(),hand:[],selectedCardId:null,nextCardId:1,harvestScore:0,comboCount:0,millLevel:1,millCell:'0,0',millBlades:[],bladeBoost:0,fieldMerges:new Map(),rewardedFieldMerges:new Set()};
const key=(x,z)=>`${x},${z}`,pos=(x,z)=>new THREE.Vector3(x*GRID.tileSize,0,z*GRID.tileSize);
const load=url=>{if(!cache.has(url))cache.set(url,loader.loadAsync(url).then(g=>g.scene));return cache.get(url)};
function shadows(root){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m?.map)m.map.colorSpace=THREE.SRGBColorSpace})}
function fit(root,maxXZ,maxY=maxXZ*1.5){root.updateMatrixWorld(true);let b=new THREE.Box3().setFromObject(root),s=b.getSize(new THREE.Vector3()),k=Math.min(maxXZ/Math.max(s.x,s.z,.001),maxY/Math.max(s.y,.001));root.scale.multiplyScalar(k);root.updateMatrixWorld(true);b=new THREE.Box3().setFromObject(root);const c=b.getCenter(new THREE.Vector3());root.position.set(root.position.x-c.x,root.position.y-b.min.y,root.position.z-c.z)}
async function preload(){const e=Object.entries(ASSETS);let n=0;for(const [name,url] of e){ui.loadingDetail.textContent=`Загружаем: ${name}`;await load(url);n++;ui.loadingBar.style.width=`${Math.round(n/e.length*100)}%`;ui.loadingProgress.textContent=`${n} / ${e.length}`}ui.loadingScreen.classList.add('done');setTimeout(()=>ui.loadingScreen.remove(),500)}
function tileMesh(x,z){const g=new THREE.Group();g.position.copy(pos(x,z));g.userData.cellKey=key(x,z);const soil=new THREE.Mesh(new THREE.BoxGeometry(GRID.tileSize*.96,.72,GRID.tileSize*.96),new THREE.MeshStandardMaterial({color:0x8b7047,roughness:.95}));soil.position.y=-.38;soil.castShadow=soil.receiveShadow=true;g.add(soil);const grass=new THREE.Mesh(new THREE.BoxGeometry(GRID.tileSize*.98,.16,GRID.tileSize*.98),new THREE.MeshStandardMaterial({color:0x79a95a,roughness:.93}));grass.position.y=.02;grass.castShadow=grass.receiveShadow=true;grass.userData.cellKey=g.userData.cellKey;g.add(grass);return g}
function addLand(x,z){const k=key(x,z);if(state.land.has(k))return state.land.get(k);const t={x,z,key:k,type:'empty',stage:0,visual:tileMesh(x,z),content:null,fieldGroup:null};state.land.set(k,t);world.add(t.visual);return t}
function clearContent(t){if(t.content)t.visual.remove(t.content);t.content=null;t.type='empty';t.stage=0;t.fieldGroup=null}
function badge(stage){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#fff8dc';x.beginPath();x.arc(64,64,48,0,Math.PI*2);x.fill();x.strokeStyle='#6b5a31';x.lineWidth=7;x.stroke();x.fillStyle='#5a4926';x.font='bold 62px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(stage,64,67);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true}));s.scale.set(.9,.9,.9);return s}
function fieldVisual(stage,synergy=false){const g=new THREE.Group(),d=new THREE.Mesh(new THREE.BoxGeometry(GRID.tileSize*.82,.18,GRID.tileSize*.82),new THREE.MeshStandardMaterial({color:synergy?0x8a642f:0x72502f,roughness:1}));d.position.y=.17;d.castShadow=d.receiveShadow=true;g.add(d);const mat=new THREE.MeshStandardMaterial({color:stage>=3?0xd7ad3e:0xa7b947,roughness:.9}),n=3+stage;for(let x=0;x<n;x++)for(let z=0;z<n;z++){if(((x*3+z*5+stage)%10)/10>.3+stage*.17)continue;const s=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.52+stage*.08,5),mat);s.position.set((x-(n-1)/2)*.48,.48+stage*.04,(z-(n-1)/2)*.48);s.castShadow=true;g.add(s)}const b=badge(stage);b.position.set(1.55,.48,-1.55);g.add(b);return g}
function mergedFieldVisual(stage){const g=new THREE.Group(),size=GRID.tileSize*1.82,d=new THREE.Mesh(new THREE.BoxGeometry(size,.2,size),new THREE.MeshStandardMaterial({color:0x8a6134,roughness:1}));d.position.y=.19;d.castShadow=d.receiveShadow=true;g.add(d);const mat=new THREE.MeshStandardMaterial({color:stage>=3?0xe0b645:0xaec44f,roughness:.9}),n=8+stage;for(let x=0;x<n;x++)for(let z=0;z<n;z++){if(((x*7+z*3+stage)%13)/13>.55+stage*.08)continue;const s=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.56+stage*.08,5),mat);s.position.set((x-(n-1)/2)*(size*.82/n),.5+stage*.04,(z-(n-1)/2)*(size*.82/n));s.castShadow=true;g.add(s)}const b=badge(stage);b.position.set(size*.39,.55,-size*.39);b.scale.set(1.05,1.05,1.05);g.add(b);return g}
async function modelOn(t,id,size,yaw=0){const m=(await load(ASSETS[id])).clone(true);shadows(m);fit(m,size);m.rotation.y=yaw;m.position.y=.12;t.visual.add(m);t.content=m;return m}
async function setTree(t){clearContent(t);t.type='tree';await modelOn(t,((t.x+t.z)&1)?'treeA':'treeB',2.6,t.x*.9+t.z*1.4)}
async function setRock(t){clearContent(t);t.type='rock';await modelOn(t,((t.x-t.z)&1)?'rockA':'rockC',2.4,t.x*1.3-t.z)}
const BUILDING_ASSET={house:'house',market:'market',lumbermill:'lumbermill',mine:'mine'};
const BUILDING_SIZE={house:3.45,market:3.75,lumbermill:3.9,mine:3.55};
async function setBuilding(t,type){clearContent(t);t.type=type;await modelOn(t,BUILDING_ASSET[type],BUILDING_SIZE[type],(t.x*17+t.z*11)*.13);t.type=type}
function isMillZone(t){return DIRECTIONS.some(d=>t.x===d.dx&&t.z===d.dz)}
function setField(t,stage){clearContent(t);t.type='field';t.stage=stage;t.content=fieldVisual(stage,isMillZone(t));t.visual.add(t.content)}
function nearby(t,type,radius=1){let count=0;for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){if(!dx&&!dz)continue;if(state.land.get(key(t.x+dx,t.z+dz))?.type===type)count++}return count}
function refreshFieldMerges(rewardNew=true){for(const g of state.fieldMerges.values())world.remove(g.visual);state.fieldMerges.clear();for(const t of state.land.values())if(t.type==='field'){t.fieldGroup=null;if(t.content)t.content.visible=true}const used=new Set(),formed=[];const cells=[...state.land.values()].filter(t=>t.type==='field').sort((a,b)=>a.z-b.z||a.x-b.x);for(const t of cells){if(used.has(t.key))continue;const block=[t,state.land.get(key(t.x+1,t.z)),state.land.get(key(t.x,t.z+1)),state.land.get(key(t.x+1,t.z+1))];if(block.some(c=>!c||c.type!=='field'||c.stage!==t.stage||used.has(c.key)))continue;const signature=`${t.x},${t.z}`;const visual=mergedFieldVisual(t.stage);visual.position.copy(pos(t.x+.5,t.z+.5));visual.userData.fieldMerge=signature;world.add(visual);for(const c of block){used.add(c.key);c.fieldGroup=signature;if(c.content)c.content.visible=false}state.fieldMerges.set(signature,{cells:block,visual,stage:t.stage});if(rewardNew&&!state.rewardedFieldMerges.has(signature)){state.rewardedFieldMerges.add(signature);formed.push(signature)}}return formed.length}
function setMergedStage(group,stage){for(const t of group.cells)setField(t,stage);refreshFieldMerges(false)}
function grantCards(count){for(let i=0;i<count;i++)state.hand.push(draw());renderHand()}
async function setMill(t){clearContent(t);t.type='mill';const m=await modelOn(t,'windmill',3.55,Math.PI*.25);const blades=m.getObjectByName('building_windmill_top_fan_green');state.millBlades=blades?[blades]:[];t.type='mill'}
function seed(){for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++)if(Math.abs(x)+Math.abs(z)<=3||(Math.abs(x)<=1&&Math.abs(z)<=2))addLand(x,z)}
async function decorate(){await setMill(state.land.get(state.millCell));for(const [x,z]of[[-2,-1],[2,1],[-1,2],[2,-1]]){const t=state.land.get(key(x,z));if(t&&t.type==='empty')await setTree(t)}for(const [x,z]of[[-2,1],[1,-2]]){const t=state.land.get(key(x,z));if(t&&t.type==='empty')await setRock(t)}}
function millFields(){return DIRECTIONS.map(d=>state.land.get(key(d.dx,d.dz))).filter(Boolean)}
function ready(){const f=millFields();return f.length===4&&f.every(t=>t.type==='field'&&t.stage>=4)}
function randomType(){const pool=ready()?DECK_WEIGHTS:DECK_WEIGHTS.filter(([t])=>t!=='millUpgrade'),total=pool.reduce((s,[,w])=>s+w,0);let r=Math.random()*total;for(const[t,w]of pool){r-=w;if(r<=0)return t}return'field'}
const draw=(type=randomType())=>({id:state.nextCardId++,type});
function fill(n=5){while(state.hand.length<n)state.hand.push(draw())}
function spend(id){const i=state.hand.findIndex(c=>c.id===id);if(i<0)return;state.hand.splice(i,1);state.selectedCardId=null;fill();renderHand()}
function ensureUpgrade(){if(ready()&&!state.hand.some(c=>c.type==='millUpgrade'))state.hand.push(draw('millUpgrade'));renderHand()}
function renderHand(){ui.hand.innerHTML='';for(const c of state.hand){const d=CARD_DEFS[c.type],b=document.createElement('button');b.className=`card ${d.tone}${state.selectedCardId===c.id?' active':''}`;b.innerHTML=`<span class="card-icon">${d.icon}</span><b>${d.name}</b><p>${d.description}</p>`;b.onclick=e=>{e.stopPropagation();state.selectedCardId=state.selectedCardId===c.id?null:c.id;ui.selectionHint.textContent=state.selectedCardId?`Карта: ${d.name}`:'Выберите карту';renderHand()};ui.hand.appendChild(b)}ui.handCount.textContent=state.hand.length}
function status(){ui.harvestScore.textContent=state.harvestScore.toLocaleString('ru-RU');ui.comboCount.textContent=state.comboCount;ui.landCount.textContent=state.land.size;const names={north:'Север',east:'Восток',south:'Юг',west:'Запад'};ui.fieldStatus.innerHTML=DIRECTIONS.map(d=>{const t=state.land.get(key(d.dx,d.dz)),s=t?.type==='field'?t.stage:0;return`<div class="field-chip ${s>=4?'ready':''}"><span>${names[d.key]}</span><b>${s?`${s}/4`:'—'}</b></div>`}).join('');ui.objectiveTitle.textContent=ready()?'Урожай готов — нужна новая мельница':'Собирайте поля и стройте поселение';ui.objectiveCopy.textContent=ready()?'Положите карту «Новая мельница» на центральную мельницу, чтобы собрать комбо.':'Четыре соседних куска поля 2×2 объединяются в одно большое поле и дают бонусную карту.'}
let toastTimer;function toast(s){clearTimeout(toastTimer);ui.toast.textContent=s;ui.toast.classList.remove('hidden');toastTimer=setTimeout(()=>ui.toast.classList.add('hidden'),2200)}
const adjacent=(x,z)=>DIRECTIONS.some(d=>state.land.has(key(x+d.dx,z+d.dz))),canExpand=(x,z)=>!state.land.has(key(x,z))&&Math.abs(x)<=GRID.maxRadius&&Math.abs(z)<=GRID.maxRadius&&adjacent(x,z);
function tileInfo(t){if(!t){ui.tileInfo.classList.add('hidden');return}const n={empty:'Свободная земля',tree:'Лес',rock:'Камни',field:'Поле',mill:'Мельница',house:'Дом',market:'Рынок',lumbermill:'Лесопилка',mine:'Шахта'};ui.tileTitle.textContent=n[t.type];if(t.type==='field'){ui.tileCopy.textContent=t.fieldGroup?`Большое поле 2×2, стадия ${t.stage} из 4. Карта «Поле» улучшает весь участок целиком.`:`Стадия роста ${t.stage} из 4.${isMillZone(t)?' Синергия мельницы: рост ускорен, зрелое поле участвует в большом комбо.':' Соберите квадрат 2×2, чтобы объединить четыре куска.'}`}else ui.tileCopy.textContent=`Клетка ${t.x}, ${t.z}.`;ui.tileInfo.classList.remove('hidden')}
function harvest(){state.comboCount++;state.millLevel++;state.bladeBoost=5.5;const reward=4+Math.min(4,state.comboCount-1);state.harvestScore+=150*state.millLevel*4;millFields().forEach(t=>setField(t,1));refreshFieldMerges(false);for(let i=0;i<reward;i++)state.hand.push(draw());toast(`Большой урожай! +${reward} бонусных карт — мельница ускорилась`)}
async function apply(card,t){
  if(card.type==='field'){
    if(!['empty','field'].includes(t.type))return toast('Сначала расчистите эту клетку.');
    if(t.type==='field'&&t.fieldGroup){
      const group=state.fieldMerges.get(t.fieldGroup);
      if(group?.stage>=4){
        state.harvestScore+=220;
        setMergedStage(group,1);
        spend(card.id);
        grantCards(1);
        status();
        return toast('Большое поле собрано: +220 очков и +1 карта.');
      }
      if(group){
        setMergedStage(group,Math.min(4,group.stage+1));
        spend(card.id);
        status();
        return toast('Всё большое поле улучшено одной картой.');
      }
    }
    const synergy=isMillZone(t);
    if(t.type==='field'&&t.stage>=4){
      if(synergy)return toast('Поле в зоне мельницы уже созрело и ждёт большого комбо.');
      state.harvestScore+=60;
      setField(t,1);
      refreshFieldMerges(false);
      spend(card.id);
      status();
      return toast('Малый урожай: +60. Поле начинает новый цикл.');
    }
    const current=t.type==='field'?t.stage:0;
    const next=current===0?1:Math.min(4,current+(synergy?2:1));
    setField(t,next);
    const merged=refreshFieldMerges(true);
    spend(card.id);
    if(merged){
      state.harvestScore+=120*merged;
      grantCards(merged);
      toast(`Поле 2×2 объединено! +${120*merged} очков и +${merged} карта.`);
    }else if(synergy&&current>0)toast('Синергия мельницы: поле выросло сразу на 2 стадии.');
    ensureUpgrade();
    status();
    return;
  }
  if(card.type==='tree'){
    if(t.type!=='empty')return toast('Для леса нужна свободная клетка.');
    await setTree(t);spend(card.id);status();return;
  }
  if(card.type==='rock'){
    if(t.type!=='empty')return toast('Камни можно добавить только на свободную клетку.');
    await setRock(t);spend(card.id);status();return;
  }
  if(card.type==='clear'){
    if(!['tree','rock'].includes(t.type))return toast('Расчистка убирает деревья и камни.');
    clearContent(t);spend(card.id);status();return;
  }
  if(card.type==='millUpgrade'){
    if(t.type!=='mill')return toast('Новую мельницу нужно положить на старую.');
    if(!ready())return toast('Сначала доведите четыре поля в зоне мельницы до IV стадии.');
    harvest();spend(card.id);status();return;
  }
  if(['house','market','lumbermill','mine'].includes(card.type)){
    if(t.type!=='empty')return toast('Для здания нужна свободная клетка.');
    let score=25,bonusCards=0,message='Здание построено.';
    if(card.type==='house'){score=30;message='Дом построен. Рынок рядом с домами будет выгоднее.'}
    if(card.type==='market'){const houses=nearby(t,'house');score=45+houses*45;bonusCards=houses>=2?1:0;message=`Рынок: ${houses} домов рядом, +${score} очков.`}
    if(card.type==='lumbermill'){const trees=nearby(t,'tree');score=40+trees*35;bonusCards=trees>=2?1:0;message=`Лесопилка: ${trees} деревьев рядом, +${score} очков.`}
    if(card.type==='mine'){const rocks=nearby(t,'rock');score=45+rocks*40;bonusCards=rocks>=2?1:0;message=`Шахта: ${rocks} залежей рядом, +${score} очков.`}
    await setBuilding(t,card.type);
    state.harvestScore+=score;
    spend(card.id);
    if(bonusCards)grantCards(bonusCards);
    status();
    return toast(message+(bonusCards?' +1 карта.':''));
  }
}
function hitsAt(x,y){const r=renderer.domElement.getBoundingClientRect();pointer.x=(x-r.left)/r.width*2-1;pointer.y=-(y-r.top)/r.height*2+1;ray.setFromCamera(pointer,camera);return ray.intersectObjects([world,waterPlane],true)}
function tileOf(o){while(o){if(o.userData?.cellKey&&state.land.has(o.userData.cellKey))return state.land.get(o.userData.cellKey);o=o.parent}return null}
let down=null;renderer.domElement.onpointerdown=e=>down={x:e.clientX,y:e.clientY,button:e.button};renderer.domElement.onpointerup=async e=>{if(!down||down.button!==0||e.button!==0){down=null;return}const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>5)return;const hits=hitsAt(e.clientX,e.clientY);if(!hits.length)return;const card=state.hand.find(c=>c.id===state.selectedCardId),th=hits.find(h=>tileOf(h.object)),t=th?tileOf(th.object):null;if(!card)return tileInfo(t);if(card.type==='expand'){const wh=hits.find(h=>h.object===waterPlane);if(!wh)return toast('Расширять остров можно только в сторону воды.');const x=Math.round(wh.point.x/GRID.tileSize),z=Math.round(wh.point.z/GRID.tileSize);if(!canExpand(x,z))return toast('Новая земля должна касаться существующего острова.');const nt=addLand(x,z);spend(card.id);status();tileInfo(nt);return toast('Остров расширен.')}if(!t)return toast('Эту карту нужно применить к клетке острова.');await apply(card,t)};renderer.domElement.oncontextmenu=e=>e.preventDefault();
function rotate(a){const o=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),a);camera.position.copy(controls.target).add(o);camera.lookAt(controls.target);controls.update()}
window.onkeydown=e=>{if(e.key==='Escape'){state.selectedCardId=null;ui.selectionHint.textContent='Выберите карту';renderHand()}if(e.key.toLowerCase()==='q')rotate(.13);if(e.key.toLowerCase()==='e')rotate(-.13)};
let previousFrame=performance.now();
function tick(time){const dt=Math.min(.05,(time-previousFrame)/1000);previousFrame=time;controls.update();const bladeSpeed=.75+state.bladeBoost;for(const blades of state.millBlades)blades.rotation.z+=dt*bladeSpeed;state.bladeBoost=Math.max(0,state.bladeBoost-dt*1.8);water.material.opacity=.90+Math.sin(time*.0006)*.025;water.rotation.z=Math.sin(time*.00015)*.01;renderer.render(scene,camera);requestAnimationFrame(tick)}
async function boot(){seed();['field','field','expand','house','lumbermill'].forEach(t=>state.hand.push(draw(t)));renderHand();status();const p=preload();await decorate();await p;status();toast('Соберите поле 2×2 или начните строить поселение.')}
boot().catch(e=>{console.error(e);ui.loadingDetail.textContent='Не удалось загрузить один из ассетов. Проверьте консоль.'});requestAnimationFrame(tick);
window.onresize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)};
