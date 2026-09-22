import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { BUILDINGS, BOARD } from './config.js';

const canvas = document.querySelector('#game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020706);
scene.fog = new THREE.FogExp2(0x020706, 0.018);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 200);
camera.position.set(29, 34, 36);

const controls = new MapControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = false;
controls.minDistance = 18;
controls.maxDistance = 72;
controls.maxPolarAngle = Math.PI * 0.46;
controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

scene.add(new THREE.HemisphereLight(0xb8fff1, 0x07100f, 1.7));
const key = new THREE.DirectionalLight(0xd9fff5, 3.2);
key.position.set(18, 28, 16);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -35; key.shadow.camera.right = 35;
key.shadow.camera.top = 35; key.shadow.camera.bottom = -35;
scene.add(key);

const rim = new THREE.PointLight(0x2fe8c5, 20, 60, 2);
rim.position.set(-18, 8, -14);
scene.add(rim);

const world = new THREE.Group();
scene.add(world);

function mat(color, roughness=.58, metalness=.62){
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// PC case / world shell
const caseFloor = new THREE.Mesh(
  new THREE.BoxGeometry(56, 1.2, 40),
  mat(0x070d0c, .72, .72)
);
caseFloor.position.y = -1.4;
caseFloor.receiveShadow = true;
world.add(caseFloor);

const frameMat = mat(0x111b19, .5, .88);
[
  [0,1,-20.2,56.5,.8,.8],
  [0,1,20.2,56.5,.8,.8],
  [-28.2,1,0,.8,.8,40.5],
  [28.2,1,0,.8,.8,40.5]
].forEach(([x,y,z,sx,sy,sz])=>{
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), frameMat);
  m.position.set(x,y,z); m.castShadow=true; world.add(m);
});

// Motherboard
const boardMat = new THREE.MeshStandardMaterial({ color:0x0d2a23, roughness:.72, metalness:.25 });
const board = new THREE.Mesh(new THREE.BoxGeometry(BOARD.width,.7,BOARD.depth), boardMat);
board.position.y = -0.45;
board.receiveShadow = true;
world.add(board);

const boardHit = new THREE.Mesh(
  new THREE.PlaneGeometry(BOARD.width, BOARD.depth),
  new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false })
);
boardHit.rotation.x = -Math.PI/2;
boardHit.position.y = -0.05;
world.add(boardHit);

// motherboard traces
const traceMat = new THREE.MeshBasicMaterial({ color:0x1f6c59, transparent:true, opacity:.44 });
for(let i=0;i<34;i++){
  const horizontal = i%2===0;
  const len = horizontal ? 8 + Math.random()*24 : 5 + Math.random()*16;
  const g = new THREE.BoxGeometry(horizontal?len:.08,.015,horizontal?.08:len);
  const t = new THREE.Mesh(g,traceMat);
  t.position.set(
    THREE.MathUtils.randFloatSpread(BOARD.width-5),
    -0.075,
    THREE.MathUtils.randFloatSpread(BOARD.depth-5)
  );
  world.add(t);
}

const socketMat = mat(0x1a2724,.5,.65);
for(let i=0;i<14;i++){
  const s = new THREE.Mesh(new THREE.BoxGeometry(.35,.35,THREE.MathUtils.randFloat(4,10)),socketMat);
  s.position.set(THREE.MathUtils.randFloatSpread(39),.05,THREE.MathUtils.randFloatSpread(24));
  s.castShadow=true; world.add(s);
}

// grid overlay
const grid = new THREE.GridHelper(BOARD.width, BOARD.width, 0x3b8e78, 0x173c33);
grid.scale.z = BOARD.depth/BOARD.width;
grid.position.y = -0.06;
grid.material.transparent = true;
grid.material.opacity = .18;
world.add(grid);

const buildings = [];
const flows = [];
let selectedBuildType = null;
let ghost = null;
let selectedBuilding = null;
let credits = 12000;
let workload = 0;
let incomeRate = 0;
let simTime = 0;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

function makeBuildingMesh(type, ghostMode=false){
  const cfg = BUILDINGS[type];
  const group = new THREE.Group();
  group.userData.type = type;

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(cfg.size[0], .45, cfg.size[1]),
    new THREE.MeshStandardMaterial({
      color: ghostMode ? 0x6fffd1 : 0x172724,
      roughness:.48, metalness:.7, transparent:ghostMode, opacity:ghostMode?.42:1
    })
  );
  base.position.y=.2; base.castShadow=!ghostMode; base.receiveShadow=true; group.add(base);

  const accent = new THREE.MeshStandardMaterial({
    color:cfg.color, emissive:cfg.color, emissiveIntensity:ghostMode?.4:.12,
    roughness:.36, metalness:.5, transparent:ghostMode, opacity:ghostMode?.65:1
  });

  if(type==='ram'){
    for(let i=-1;i<=1;i++){
      const tower = new THREE.Mesh(new THREE.BoxGeometry(.48,cfg.height,4.7),accent);
      tower.position.set(i*.72,cfg.height/2+.42,0); tower.castShadow=!ghostMode; group.add(tower);
    }
  } else if(type==='gpu'){
    const block = new THREE.Mesh(new THREE.BoxGeometry(5.5,1.2,2.3),accent);
    block.position.y=1.05; block.castShadow=!ghostMode; group.add(block);
    [-1.8,0,1.8].forEach(x=>{
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.18,18),mat(0x0c1211,.4,.8));
      fan.rotation.x=Math.PI/2; fan.position.set(x,1.08,1.22); group.add(fan);
    });
  } else if(type==='cooling'){
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05,.22,12,32),accent);
    ring.rotation.x=Math.PI/2; ring.position.y=1.25; group.add(ring);
    for(let i=0;i<5;i++){
      const blade = new THREE.Mesh(new THREE.BoxGeometry(.22,.06,.92),accent);
      blade.position.y=1.25; blade.rotation.y=i*Math.PI*.4; group.add(blade);
    }
  } else if(type==='cpu'){
    for(let i=0;i<3;i++){
      const core = new THREE.Mesh(new THREE.BoxGeometry(2.7,.55,2.7),accent);
      core.position.y=.72+i*.6; core.scale.set(1-i*.08,1,1-i*.08); core.castShadow=!ghostMode; group.add(core);
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.7,.12,10,32),accent);
    halo.rotation.x=Math.PI/2; halo.position.y=2.5; group.add(halo);
  } else if(type==='power'){
    const reactor = new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.9,1.65,8),accent);
    reactor.position.y=1.25; reactor.castShadow=!ghostMode; group.add(reactor);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.9,1.15,.45,8),mat(0x202b28,.35,.85));
    cap.position.y=2.3; group.add(cap);
  } else if(type==='network'){
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.35,.65,2.8,8),accent);
    mast.position.y=1.7; group.add(mast);
    [1.3,1.8,2.3].forEach((y,i)=>{
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.8+i*.18,.06,8,28),accent);
      ring.rotation.x=Math.PI/2; ring.position.y=y; group.add(ring);
    });
  } else {
    const block = new THREE.Mesh(new THREE.BoxGeometry(cfg.size[0]*.72,cfg.height,cfg.size[1]*.72),accent);
    block.position.y=cfg.height/2+.42; block.castShadow=!ghostMode; group.add(block);
    for(let i=0;i<5;i++){
      const line = new THREE.Mesh(new THREE.BoxGeometry(cfg.size[0]*.55,.07,.06),mat(0xffe0a0,.4,.6));
      line.position.set(0,.62+i*.18,cfg.size[1]*.37); group.add(line);
    }
  }

  if(!ghostMode){
    const marker = new THREE.PointLight(cfg.color,5,8,2);
    marker.position.y = cfg.height+1;
    group.add(marker);
  }
  return group;
}

function setBuildMode(type){
  selectedBuildType = type;
  selectedBuilding = null;
  updateSelectionUI();
  document.querySelectorAll('.build-card').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  if(ghost) world.remove(ghost);
  if(type){
    ghost = makeBuildingMesh(type,true);
    ghost.visible=false;
    world.add(ghost);
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
  }else{
    ghost=null;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  }
}

function footprint(type,pos){
  const s=BUILDINGS[type].size;
  return {minX:pos.x-s[0]/2,maxX:pos.x+s[0]/2,minZ:pos.z-s[1]/2,maxZ:pos.z+s[1]/2};
}
function overlaps(a,b,pad=.45){return a.minX<b.maxX+pad&&a.maxX>b.minX-pad&&a.minZ<b.maxZ+pad&&a.maxZ>b.minZ-pad}
function validPlacement(type,pos){
  const fp=footprint(type,pos);
  const mx=BOARD.width/2-BOARD.margin, mz=BOARD.depth/2-BOARD.margin;
  if(fp.minX<-mx||fp.maxX>mx||fp.minZ<-mz||fp.maxZ>mz)return false;
  return !buildings.some(b=>overlaps(fp,footprint(b.userData.type,b.position)));
}
function snap(v){return Math.round(v/BOARD.grid)*BOARD.grid}

function place(type,pos){
  const cfg=BUILDINGS[type];
  if(credits<cfg.cost){flash('INSUFFICIENT CREDITS');return}
  if(!validPlacement(type,pos)){flash('INVALID BUILD LOCATION');return}
  credits-=cfg.cost;
  const b=makeBuildingMesh(type,false);
  b.position.copy(pos); b.position.y=0;
  b.userData.id=crypto.randomUUID?.() || String(Date.now()+Math.random());
  world.add(b); buildings.push(b);
  createFlowFor(b);
  setBuildMode(null);
  updateHUD();
}

function createFlowFor(building){
  if(buildings.length<2)return;
  let target = buildings.find(b=>b.userData.type==='cpu'&&b!==building) || buildings[0];
  if(!target||target===building)return;
  const points=[new THREE.Vector3(building.position.x,.35,building.position.z),new THREE.Vector3(target.position.x,.35,target.position.z)];
  const geo=new THREE.BufferGeometry().setFromPoints(points);
  const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x58e5bf,transparent:true,opacity:.18}));
  world.add(line);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.11,8,8),new THREE.MeshBasicMaterial({color:0xa4ffe3}));
  world.add(dot);
  flows.push({line,dot,from:building,to:target,t:Math.random()});
}

function removeBuilding(b){
  const i=buildings.indexOf(b); if(i<0)return;
  credits += Math.round(BUILDINGS[b.userData.type].cost*.45);
  buildings.splice(i,1); world.remove(b);
  for(let j=flows.length-1;j>=0;j--){
    const f=flows[j];
    if(f.from===b||f.to===b){world.remove(f.line);world.remove(f.dot);flows.splice(j,1)}
  }
  selectedBuilding=null;updateSelectionUI();updateHUD();
}

function aggregate(){
  const out={compute:0,memory:0,storage:0,power:0,cooling:0,network:0,powerUse:0,heat:0};
  buildings.forEach(b=>{
    const c=BUILDINGS[b.userData.type];
    Object.keys(out).forEach(k=>out[k]+=c[k]||0);
  });
  return out;
}

function demand(){
  return {
    compute: workload*.024,
    memory: workload*.019,
    storage: workload*.012,
    network: workload*.016
  };
}

function getSim(){
  const a=aggregate(), d=demand();
  const ratios=[
    d.compute?Math.min(1,a.compute/d.compute):1,
    d.memory?Math.min(1,a.memory/d.memory):1,
    d.storage?Math.min(1,a.storage/d.storage):1,
    d.network?Math.min(1,a.network/d.network):1,
    a.powerUse?Math.min(1,a.power/a.powerUse):1
  ];
  const served=Math.min(...ratios);
  const coolingLoad=Math.max(0,a.heat-a.cooling);
  const temperature=24+coolingLoad*.82+(1-served)*14;
  return {a,d,served,temperature,coolingLoad};
}

function fmt(v){return Math.max(0,Math.round(v)).toLocaleString()}
function pct(v){return Math.max(0,Math.min(100,v*100))}
function setMeter(id,use,cap){
  document.querySelector('#'+id+'-text').textContent=`${fmt(use)} / ${fmt(cap)}`;
  document.querySelector('#'+id+'-bar').style.width=`${cap?pct(use/cap):0}%`;
}
function updateHUD(){
  const s=getSim();
  document.querySelector('#credits').textContent=fmt(credits);
  setMeter('compute',s.d.compute,s.a.compute);
  setMeter('memory',s.d.memory,s.a.memory);
  setMeter('storage',s.d.storage,s.a.storage);
  setMeter('power',s.a.powerUse,s.a.power);
  document.querySelector('#thermal-text').textContent=`${Math.round(s.temperature)}°C`;
  document.querySelector('#thermal-bar').style.width=`${Math.min(100,(s.temperature-20)/.8)}%`;
  document.querySelector('#workload').textContent=fmt(workload);
  document.querySelector('#served').textContent=`${Math.round(s.served*100)}%`;
  document.querySelector('#income').textContent=`+${fmt(incomeRate)}/s`;
  document.querySelector('#heat').textContent=fmt(s.a.heat);
  document.querySelector('#building-count').textContent=buildings.length;
  let status='SYSTEM NOMINAL';
  if(s.temperature>90)status='THERMAL CRITICAL';
  else if(s.served<.55)status='SERVICE FAILURE';
  else if(s.served<.9)status='CAPACITY WARNING';
  document.querySelector('#sim-status').textContent=status;
}

function updateSelectionUI(){
  const card=document.querySelector('#selection');
  if(!selectedBuilding){card.classList.add('hidden');return}
  const cfg=BUILDINGS[selectedBuilding.userData.type];
  document.querySelector('#selection-name').textContent=cfg.name;
  document.querySelector('#selection-desc').textContent=cfg.description;
  card.classList.remove('hidden');
}

let alertTimer;
function flash(message){
  const el=document.querySelector('#alert');
  el.textContent=message;el.classList.remove('hidden');
  clearTimeout(alertTimer);alertTimer=setTimeout(()=>el.classList.add('hidden'),1800);
}

function rayToBoard(event){
  const r=renderer.domElement.getBoundingClientRect();
  pointer.x=((event.clientX-r.left)/r.width)*2-1;
  pointer.y=-((event.clientY-r.top)/r.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(boardHit,false)[0];
  return hit?.point;
}

renderer.domElement.addEventListener('pointermove',e=>{
  if(!selectedBuildType||!ghost)return;
  const p=rayToBoard(e); if(!p){ghost.visible=false;return}
  p.x=snap(p.x);p.z=snap(p.z);p.y=0;
  ghost.position.copy(p);ghost.visible=true;
  const ok=validPlacement(selectedBuildType,p)&&credits>=BUILDINGS[selectedBuildType].cost;
  ghost.traverse(o=>{
    if(o.material&&o.material.transparent){
      o.material.opacity=ok?.55:.22;
      if(o.material.emissive)o.material.emissive.setHex(ok?0x48ffd0:0xff4d62);
    }
  });
});
renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY,button:e.button}});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!pointerDown)return;
  const moved=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);
  const click=moved<5&&pointerDown.button===0;
  pointerDown=null;
  if(!click)return;
  if(selectedBuildType){
    const p=rayToBoard(e); if(!p)return;
    p.x=snap(p.x);p.z=snap(p.z);p.y=0;place(selectedBuildType,p);return;
  }
  const r=renderer.domElement.getBoundingClientRect();
  pointer.x=((e.clientX-r.left)/r.width)*2-1;
  pointer.y=-((e.clientY-r.top)/r.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(buildings,true);
  if(hits.length){
    let o=hits[0].object;while(o.parent&&!buildings.includes(o))o=o.parent;
    selectedBuilding=buildings.includes(o)?o:null;
  }else selectedBuilding=null;
  updateSelectionUI();
});
renderer.domElement.addEventListener('contextmenu',e=>{e.preventDefault();if(selectedBuildType)setBuildMode(null)});

window.addEventListener('keydown',e=>{
  if(e.key==='Escape')setBuildMode(null);
  if(e.key.toLowerCase()==='q')controls.rotateLeft(.12);
  if(e.key.toLowerCase()==='e')controls.rotateLeft(-.12);
});
document.querySelector('#bulldoze').addEventListener('click',()=>selectedBuilding&&removeBuilding(selectedBuilding));

const buttonHost=document.querySelector('#build-buttons');
Object.entries(BUILDINGS).forEach(([type,cfg])=>{
  const b=document.createElement('button');b.className='build-card';b.dataset.type=type;
  b.innerHTML=`<b>${cfg.name}</b><span>${cfg.short}</span><em>◈ ${cfg.cost.toLocaleString()}</em>`;
  b.addEventListener('click',()=>setBuildMode(selectedBuildType===type?null:type));
  buttonHost.appendChild(b);
});

// Starter infrastructure to make the prototype immediately alive
placeStarter('power',new THREE.Vector3(-14,0,8));
placeStarter('cpu',new THREE.Vector3(-5,0,1));
placeStarter('ram',new THREE.Vector3(3,0,-3));
placeStarter('storage',new THREE.Vector3(11,0,6));
placeStarter('network',new THREE.Vector3(16,0,-7));
placeStarter('cooling',new THREE.Vector3(-13,0,-8));
function placeStarter(type,pos){
  const b=makeBuildingMesh(type,false);b.position.copy(pos);b.userData.id='starter-'+type;
  world.add(b);buildings.push(b);createFlowFor(b);
}

let last=performance.now(), economyAccumulator=0;
function tick(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;simTime+=dt;
  controls.update();

  // workload grows slowly; player must expand capacity
  workload = Math.min(18000, 260 + simTime*17 + Math.sin(simTime*.17)*45);
  const s=getSim();
  incomeRate = Math.round(18*s.served + workload*.0015*s.served);
  economyAccumulator += dt;
  if(economyAccumulator>=1){
    credits += incomeRate*Math.floor(economyAccumulator);
    economyAccumulator%=1;
    updateHUD();
  }

  flows.forEach(f=>{
    if(!buildings.includes(f.from)||!buildings.includes(f.to))return;
    f.t=(f.t+dt*(.35+s.served*.5))%1;
    f.dot.position.lerpVectors(
      new THREE.Vector3(f.from.position.x,.55,f.from.position.z),
      new THREE.Vector3(f.to.position.x,.55,f.to.position.z),
      f.t
    );
    f.dot.material.opacity=.5+s.served*.5;
  });

  buildings.forEach((b,i)=>{
    const cfg=BUILDINGS[b.userData.type];
    const overload=s.served<.8;
    b.traverse(o=>{
      if(o.isPointLight)o.intensity=(overload?7:4.5)+(Math.sin(simTime*2+i)*.7);
      if(b.userData.type==='cooling'&&o.geometry?.type==='BoxGeometry')o.rotation.y+=dt*.8;
    });
  });

  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}
updateHUD();
requestAnimationFrame(tick);

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
