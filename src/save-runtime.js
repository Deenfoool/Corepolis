import { clearSave, readSave, writeSave } from './session-state.js?v=1';

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for save system.');

const {
  state,world,shoreWaterByCell,ui,GRID,CARD_DEFS,
  addLand,refreshAllTerrain,disposeTerrainTile,disposeShoreWaterTile,
  setTree,setRock,setField,setBuilding,setMill,setLighthouse,setFishingShop,
  updateResourceMarker,createPierVisual,renderHand,status,
  clearIslandGhost,refreshLucide,toast,openMarineChoice,
  seed,decorate,draw,addCard,syncAllNormalFieldStages,syncMillFieldStages,
  resetStartingDeck,waterKey
}=runtime;

const TILE_TYPES=new Set([
  'empty','tree','rock','field','mill','house','market','lumbermill','quarry','lighthouse','fishingShop'
]);
const BUILDING_TYPES=new Set(['house','market','lumbermill','quarry']);
const RESOURCE_TYPES=new Set(['tree','rock']);
const MAX_RESERVE=512;

let sessionActive=false;
let startingSession=false;
let restoring=false;
let lastObservedSignature='';
let lastSavedSignature='';
let stableTicks=0;
let pollTimer=null;

function integer(value,fallback=0){
  return Number.isInteger(value)?value:fallback;
}
function finiteNonNegative(value,fallback=0){
  return Number.isFinite(value)&&value>=0?value:fallback;
}
function cloneFragment(fragment){
  if(!fragment||typeof fragment!=='object'||!Array.isArray(fragment.cells)||!fragment.cells.length){
    throw new Error('Island fragment is missing cell data.');
  }
  return{
    shapeId:String(fragment.shapeId||'custom'),
    label:String(fragment.label||'Фрагмент'),
    cells:fragment.cells.map(cell=>{
      const x=integer(cell?.x,NaN);
      const z=integer(cell?.z,NaN);
      if(!Number.isFinite(x)||!Number.isFinite(z))throw new Error('Invalid island-fragment coordinates.');
      const content=cell?.content==null?null:String(cell.content);
      if(content!==null&&!RESOURCE_TYPES.has(content))throw new Error('Invalid island-fragment resource.');
      return{x,z,content};
    })
  };
}
function serializeCard(card){
  if(!card||!Number.isInteger(card.id)||!CARD_DEFS[card.type])throw new Error('Invalid card state.');
  const result={id:card.id,type:card.type};
  if(card.type==='island'){
    result.rotation=((integer(card.rotation,0)%4)+4)%4;
    result.fragment=cloneFragment(card.fragment);
  }
  return result;
}
function normalizeCard(card){
  return serializeCard(card);
}
function serializeTile(tile){
  if(!tile||!Number.isInteger(tile.x)||!Number.isInteger(tile.z)||!TILE_TYPES.has(tile.type)){
    throw new Error('Invalid land tile state.');
  }
  return{
    x:tile.x,
    z:tile.z,
    type:tile.type,
    stage:integer(tile.stage,0),
    fieldOrder:Number.isInteger(tile.fieldOrder)?tile.fieldOrder:null,
    resourceSources:[...(tile.resourceSources||new Set())].map(String)
  };
}
function serializeState(){
  return{
    nextCardId:state.nextCardId,
    nextFieldOrder:state.nextFieldOrder,
    harvestScore:state.harvestScore,
    resources:{wood:state.resources.wood||0,stone:state.resources.stone||0},
    comboCount:state.comboCount,
    millLevel:state.millLevel,
    millCell:state.millCell||null,
    unlocks:{
      mill:!!state.unlocks.mill,
      market:!!state.unlocks.market,
      marine:!!state.unlocks.marine,
      fishingShop:!!state.unlocks.fishingShop
    },
    marineChoiceOpen:!!state.marineChoiceOpen,
    hand:state.hand.map(serializeCard),
    reserve:state.reserve.map(serializeCard),
    land:[...state.land.values()].map(serializeTile),
    waterStructures:[...state.waterStructures.values()].map(structure=>({
      x:structure.x,
      z:structure.z,
      type:structure.type,
      shoreKey:structure.shoreKey
    })),
    seaRoutes:[...state.seaRoutes].map(String)
  };
}
function normalizeSnapshot(raw){
  if(!raw||typeof raw!=='object')throw new Error('Save payload is missing.');
  if(!Array.isArray(raw.land)||raw.land.length<1||raw.land.length>(GRID.maxRadius*2+1)**2){
    throw new Error('Invalid land payload.');
  }
  if(!Array.isArray(raw.hand)||raw.hand.length>5)throw new Error('Invalid hand payload.');
  if(!Array.isArray(raw.reserve)||raw.reserve.length>MAX_RESERVE)throw new Error('Invalid reserve payload.');

  const land=[];
  const landKeys=new Set();
  for(const item of raw.land){
    const x=integer(item?.x,NaN);
    const z=integer(item?.z,NaN);
    const type=String(item?.type||'');
    if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>GRID.maxRadius||Math.abs(z)>GRID.maxRadius||!TILE_TYPES.has(type)){
      throw new Error('Invalid tile in save.');
    }
    const cellKey=`${x},${z}`;
    if(landKeys.has(cellKey))throw new Error('Duplicate land tile in save.');
    landKeys.add(cellKey);
    const stage=integer(item?.stage,0);
    const fieldOrder=Number.isInteger(item?.fieldOrder)?item.fieldOrder:null;
    if(type==='field'&&(stage<1||stage>4||!Number.isInteger(fieldOrder)||fieldOrder<1)){
      throw new Error('Invalid field state in save.');
    }
    land.push({
      x,z,type,stage,fieldOrder,
      resourceSources:Array.isArray(item?.resourceSources)?item.resourceSources.map(String):[]
    });
  }

  const hand=raw.hand.map(normalizeCard);
  const reserve=raw.reserve.map(normalizeCard);
  const allCards=[...hand,...reserve];
  const cardIds=new Set();
  for(const card of allCards){
    if(cardIds.has(card.id))throw new Error('Duplicate card id in save.');
    cardIds.add(card.id);
  }

  const waterStructures=[];
  const waterKeys=new Set();
  for(const structure of Array.isArray(raw.waterStructures)?raw.waterStructures:[]){
    const x=integer(structure?.x,NaN);
    const z=integer(structure?.z,NaN);
    const type=String(structure?.type||'');
    const shoreKey=String(structure?.shoreKey||'');
    if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>GRID.maxRadius||Math.abs(z)>GRID.maxRadius||type!=='pier'||!landKeys.has(shoreKey)){
      throw new Error('Invalid marine structure in save.');
    }
    const wk=`${x},${z}`;
    if(waterKeys.has(wk)||landKeys.has(wk))throw new Error('Overlapping marine structure in save.');
    waterKeys.add(wk);
    waterStructures.push({x,z,type,shoreKey});
  }

  const millCell=raw.millCell==null?null:String(raw.millCell);
  if(millCell&&!land.some(tile=>`${tile.x},${tile.z}`===millCell&&tile.type==='mill')){
    throw new Error('Mill reference does not match saved land.');
  }

  const maxCardId=allCards.reduce((max,card)=>Math.max(max,card.id),0);
  const maxFieldOrder=land.reduce((max,tile)=>Math.max(max,tile.fieldOrder||0),0);
  const resources=raw.resources||{};
  return{
    nextCardId:Math.max(integer(raw.nextCardId,1),maxCardId+1),
    nextFieldOrder:Math.max(integer(raw.nextFieldOrder,1),maxFieldOrder+1),
    harvestScore:finiteNonNegative(raw.harvestScore,0),
    resources:{
      wood:finiteNonNegative(resources.wood,0),
      stone:finiteNonNegative(resources.stone,0)
    },
    comboCount:finiteNonNegative(raw.comboCount,0),
    millLevel:Math.max(1,integer(raw.millLevel,1)),
    millCell,
    unlocks:{
      mill:!!raw.unlocks?.mill,
      market:!!raw.unlocks?.market,
      marine:!!raw.unlocks?.marine,
      fishingShop:!!raw.unlocks?.fishingShop
    },
    marineChoiceOpen:!!raw.marineChoiceOpen,
    hand,reserve,land,waterStructures,
    seaRoutes:Array.isArray(raw.seaRoutes)?raw.seaRoutes.map(String):[]
  };
}

function resetRuntimeState(){
  restoring=true;
  state.inputLocked=true;
  clearIslandGhost();
  ui.marineChoice?.classList.add('hidden');
  ui.tileInfo?.classList.add('hidden');

  for(const tile of state.land.values()){
    if(tile.terrain)disposeTerrainTile(tile.terrain);
  }
  for(const cellKey of [...shoreWaterByCell.keys()])disposeShoreWaterTile(cellKey);
  world.clear();

  state.land.clear();
  state.gameOver=false;state.actionPending=false;
  state.hand=[];
  state.reserve=[];
  state.selectedCardId=null;
  state.nextCardId=1;
  state.nextFieldOrder=1;
  state.harvestScore=0;
  state.resources={wood:0,stone:0};
  state.comboCount=0;
  state.millLevel=1;
  state.millCell=null;
  state.unlocks={mill:false,market:false,marine:false,fishingShop:false};
  state.waterStructures.clear();
  state.seaRoutes.clear();
  state.marineActors=[];
  state.lighthouseBeams=[];
  state.marineChoiceOpen=false;
  state.millBlades=[];
  state.bladeBoost=0;
  state.tweens=[];
  state.ambientActors=[];
  state.knownHandCardIds.clear();
}

async function restorePier(structureData){
  const shore=state.land.get(structureData.shoreKey);
  if(!shore)throw new Error('Saved pier shore is missing.');
  const seaDx=structureData.x-shore.x;
  const seaDz=structureData.z-shore.z;
  const yaw=Math.atan2(seaDx,seaDz);
  const visual=createPierVisual(yaw,structureData.x,structureData.z);
  visual.position.set(structureData.x*GRID.tileSize,-.48,structureData.z*GRID.tileSize);
  const wk=waterKey(structureData.x,structureData.z);
  visual.userData.waterKey=wk;
  visual.traverse(object=>{object.userData.waterKey=wk;});
  world.add(visual);

  state.waterStructures.set(wk,{
    key:wk,
    x:structureData.x,
    z:structureData.z,
    type:'pier',
    visual,
    shoreKey:structureData.shoreKey
  });
  const boat=visual.userData.boat;
  if(boat){
    state.marineActors.push({
      object:boat,
      baseY:boat.position.y,
      phase:structureData.x*1.7+structureData.z*2.3
    });
  }
}

async function restoreSnapshot(raw){
  const snapshot=normalizeSnapshot(raw);
  resetRuntimeState();

  state.nextCardId=snapshot.nextCardId;
  state.nextFieldOrder=snapshot.nextFieldOrder;
  state.harvestScore=snapshot.harvestScore;
  state.resources={...snapshot.resources};
  state.comboCount=snapshot.comboCount;
  state.millLevel=snapshot.millLevel;
  state.millCell=snapshot.millCell;
  state.unlocks={...snapshot.unlocks};
  state.hand=snapshot.hand;
  state.reserve=snapshot.reserve;

  for(const tileData of snapshot.land)addLand(tileData.x,tileData.z,{refresh:false});
  refreshAllTerrain();

  let millData=null;
  for(const tileData of snapshot.land){
    const tile=state.land.get(`${tileData.x},${tileData.z}`);
    if(tileData.type==='mill'){
      millData=tileData;
      continue;
    }
    if(tileData.type==='tree')await setTree(tile,false);
    else if(tileData.type==='rock')await setRock(tile,false);
    else if(tileData.type==='field')await setField(tile,tileData.stage,false,tileData.fieldOrder);
    else if(BUILDING_TYPES.has(tileData.type))await setBuilding(tile,tileData.type,false);
    else if(tileData.type==='lighthouse')await setLighthouse(tile,false);
    else if(tileData.type==='fishingShop')await setFishingShop(tile,false);
  }

  if(millData){
    const mill=state.land.get(`${millData.x},${millData.z}`);
    await setMill(mill);
  }else{
    state.millCell=null;
    await syncAllNormalFieldStages(false);
  }
  if(state.millCell)await syncMillFieldStages({animated:false});

  for(const tileData of snapshot.land){
    if(!RESOURCE_TYPES.has(tileData.type))continue;
    const tile=state.land.get(`${tileData.x},${tileData.z}`);
    tile.resourceSources=new Set(tileData.resourceSources);
    updateResourceMarker(tile);
  }

  for(const structure of snapshot.waterStructures)await restorePier(structure);
  state.seaRoutes=new Set(snapshot.seaRoutes);
  state.knownHandCardIds=new Set(state.hand.map(card=>card.id));
  state.selectedCardId=null;
  state.marineChoiceOpen=false;
  state.inputLocked=false;

  if(snapshot.marineChoiceOpen)openMarineChoice();
  else ui.marineChoice?.classList.add('hidden');

  renderHand();
  status();
  refreshLucide();
  restoring=false;
  return snapshot;
}

async function resetToNewGame(){
  resetRuntimeState();
  seed();
  resetStartingDeck();
  await decorate();
  renderHand();
  status();
  refreshLucide();
  state.inputLocked=false;
  restoring=false;
}

function writeCurrentSave(force=false){
  if(!sessionActive||restoring||(!force&&(state.inputLocked||state.actionPending)))return null;
  const snapshot=serializeState();
  const signature=JSON.stringify(snapshot);
  if(!force&&signature===lastSavedSignature)return null;
  const result=writeSave(snapshot);
  if(result){
    lastSavedSignature=signature;
    lastObservedSignature=signature;
    stableTicks=0;
  }
  return result;
}

function pollForChanges(){
  if(!sessionActive||restoring||state.inputLocked||state.actionPending)return;
  let snapshot;
  let signature;
  try{
    snapshot=serializeState();
    signature=JSON.stringify(snapshot);
  }catch(error){
    console.warn('[Corepolis] Autosave snapshot failed:',error);
    return;
  }
  if(signature===lastObservedSignature)stableTicks++;
  else{
    lastObservedSignature=signature;
    stableTicks=0;
  }
  if(stableTicks>=1&&signature!==lastSavedSignature){
    const result=writeSave(snapshot);
    if(result){
      lastSavedSignature=signature;
      stableTicks=0;
    }
  }
}

async function startSession(mode){
  if(startingSession||sessionActive)return;
  startingSession=true;
  try{
    if(mode==='continue'){
      const save=readSave();
      if(!save)throw new Error('Compatible save not found.');
      restoring=true;
      await restoreSnapshot(save.state);
      sessionActive=true;
      writeCurrentSave(true);
      toast('Сохранение загружено. Продолжаем строительство.');
    }else{
      sessionActive=true;
      state.inputLocked=false;
      renderHand();
      status();
      writeCurrentSave(true);
      toast('Новая партия начата. Автосохранение включено.');
    }
  }catch(error){
    console.warn('[Corepolis] Save restore failed, starting a new run:',error);
    clearSave();
    restoring=true;
    await resetToNewGame();
    sessionActive=true;
    writeCurrentSave(true);
    toast('Сохранение оказалось повреждено. Начата новая партия.');
  }finally{
    restoring=false;
    startingSession=false;
  }

  if(!pollTimer)pollTimer=setInterval(pollForChanges,420);
  window.dispatchEvent(new CustomEvent('corepolis:session-ready',{detail:{mode}}));
}

window.addEventListener('corepolis:start',event=>{
  startSession(event.detail?.mode==='continue'?'continue':'new');
});
window.addEventListener('corepolis:pause-changed',event=>{
  if(event.detail?.paused)pollForChanges();
});
window.addEventListener('pagehide',()=>{
  if(sessionActive&&!restoring&&!state.inputLocked)writeCurrentSave(true);
});

window.__corepolisSaveRuntime={
  serializeState,
  restoreSnapshot,
  writeCurrentSave
};
