import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GRID } from './config.js';

export const ISLAND_FRAGMENT_SHAPES=[
  {id:'single',label:'1×1',weight:8,cells:[[0,0]]},
  {id:'domino',label:'1×2',weight:28,cells:[[0,0],[1,0]]},
  {id:'line3',label:'1×3',weight:15,cells:[[0,0],[1,0],[2,0]]},
  {id:'l3',label:'L3',weight:25,cells:[[0,0],[1,0],[0,1]]},
  {id:'z4',label:'Z4',weight:10,cells:[[0,0],[1,0],[1,1],[2,1]]},
  {id:'square4',label:'2×2',weight:14,cells:[[0,0],[1,0],[0,1],[1,1]]}
];

const clamp01=value=>Math.max(0,Math.min(1,value));

function weightedPick(items,weightOf,rng=Math.random){
  const total=items.reduce((sum,item)=>sum+Math.max(0,weightOf(item)),0);
  if(total<=0)return items[0];
  let roll=rng()*total;
  for(const item of items){
    roll-=Math.max(0,weightOf(item));
    if(roll<=0)return item;
  }
  return items[items.length-1];
}

function chooseResource(resources,rng){
  const woodNeed=clamp01((3-(resources.wood||0))/3);
  const stoneNeed=clamp01((3-(resources.stone||0))/3);
  const treeWeight=1+woodNeed*.9;
  const rockWeight=1+stoneNeed*.9;
  return weightedPick(['tree','rock'],type=>type==='tree'?treeWeight:rockWeight,rng);
}

export function createIslandFragment(resources={},rng=Math.random){
  const shape=weightedPick(ISLAND_FRAGMENT_SHAPES,item=>item.weight,rng);
  const cells=shape.cells.map(([x,z])=>({x,z,content:null}));
  const woodNeed=clamp01((3-(resources.wood||0))/3);
  const stoneNeed=clamp01((3-(resources.stone||0))/3);
  const scarcity=(woodNeed+stoneNeed)*.5;

  // Helpful rather than deterministic: scarcity only nudges probabilities.
  // A healthy economy therefore naturally produces more empty strategic land.
  const firstChance=Math.min(.68,.18+(cells.length-1)*.075+scarcity*.22);
  const secondChance=cells.length>=4?Math.min(.34,.08+scarcity*.18):0;
  let slots=(rng()<firstChance?1:0)+(rng()<secondChance?1:0);
  slots=Math.min(slots,cells.length>=4?2:1);

  const available=cells.map((_,index)=>index);
  for(let slot=0;slot<slots&&available.length;slot++){
    const pick=Math.floor(rng()*available.length);
    const index=available.splice(pick,1)[0];
    cells[index].content=chooseResource(resources,rng);
  }

  return{shapeId:shape.id,label:shape.label,cells};
}

export function rotatedFragmentCells(card){
  const fragment=card?.fragment;
  if(!fragment?.cells?.length)return[{x:0,z:0,content:null}];
  const rotation=((card.rotation||0)%4+4)%4;
  return fragment.cells.map(cell=>{
    let x=cell.x,z=cell.z;
    if(rotation===1)[x,z]=[-z,x];
    else if(rotation===2)[x,z]=[-x,-z];
    else if(rotation===3)[x,z]=[z,-x];
    return{x,z,content:cell.content||null};
  });
}

export function rotateIslandCard(card,delta){
  if(card?.type!=='island')return;
  card.rotation=((card.rotation||0)+delta+4)%4;
}

export function fragmentResourceCounts(card){
  const counts={tree:0,rock:0};
  for(const cell of card?.fragment?.cells||[]){
    if(cell.content==='tree')counts.tree++;
    if(cell.content==='rock')counts.rock++;
  }
  return counts;
}

export function fragmentDescription(card){
  const count=card?.fragment?.cells?.length||1;
  const label=card?.fragment?.label||'1×1';
  const resources=fragmentResourceCounts(card);
  const extras=[];
  if(resources.tree)extras.push(`лес ×${resources.tree}`);
  if(resources.rock)extras.push(`камни ×${resources.rock}`);
  return `${label} · ${count} ${count===1?'клетка':count<5?'клетки':'клеток'}${extras.length?` · ${extras.join(' · ')}`:' · пустой'}`;
}

export function fragmentMiniMapMarkup(card){
  const cells=rotatedFragmentCells(card);
  const xs=cells.map(cell=>cell.x),zs=cells.map(cell=>cell.z);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
  const cols=maxX-minX+1,rows=maxZ-minZ+1;
  const items=cells.map(cell=>{
    const col=cell.x-minX+1,row=cell.z-minZ+1;
    const kind=cell.content||'empty';
    return `<i class="fragment-cell ${kind}" style="grid-column:${col};grid-row:${row}"></i>`;
  }).join('');
  return `<span class="fragment-map" style="--fragment-cols:${cols};--fragment-rows:${rows}" aria-label="Форма ${card?.fragment?.label||'острова'}">${items}</span>`;
}

const ghostTileGeometry=new RoundedBoxGeometry(GRID.tileSize*.82,.10,GRID.tileSize*.82,2,.10);
const ghostTreeGeometry=new THREE.ConeGeometry(.38,.86,6);
const ghostTrunkGeometry=new THREE.CylinderGeometry(.10,.12,.34,6);
const ghostRockGeometry=new THREE.IcosahedronGeometry(.38,0);
const validTileMaterial=new THREE.MeshBasicMaterial({color:0x79d7ae,transparent:true,opacity:.30,depthWrite:false});
const invalidTileMaterial=new THREE.MeshBasicMaterial({color:0xdf766a,transparent:true,opacity:.25,depthWrite:false});
const ghostTreeMaterial=new THREE.MeshBasicMaterial({color:0x5c9b61,transparent:true,opacity:.82,depthWrite:false});
const ghostTrunkMaterial=new THREE.MeshBasicMaterial({color:0x8a6845,transparent:true,opacity:.76,depthWrite:false});
const ghostRockMaterial=new THREE.MeshBasicMaterial({color:0xaeb8b4,transparent:true,opacity:.82,depthWrite:false});

function resourceGhost(content){
  if(content==='tree'){
    const group=new THREE.Group();
    const trunk=new THREE.Mesh(ghostTrunkGeometry,ghostTrunkMaterial);
    trunk.position.y=.17;
    const crown=new THREE.Mesh(ghostTreeGeometry,ghostTreeMaterial);
    crown.position.y=.70;
    group.add(trunk,crown);
    return group;
  }
  if(content==='rock'){
    const rock=new THREE.Mesh(ghostRockGeometry,ghostRockMaterial);
    rock.scale.set(1.25,.82,1);
    rock.position.y=.34;
    return rock;
  }
  return null;
}

export function syncIslandGhost(root,card,anchor,valid){
  root.clear();
  if(!card||card.type!=='island'||!anchor){
    root.visible=false;
    return;
  }
  const material=valid?validTileMaterial:invalidTileMaterial;
  for(const cell of rotatedFragmentCells(card)){
    const group=new THREE.Group();
    group.position.set((anchor.x+cell.x)*GRID.tileSize,-.42,(anchor.z+cell.z)*GRID.tileSize);
    const tile=new THREE.Mesh(ghostTileGeometry,material);
    group.add(tile);
    const resource=resourceGhost(cell.content);
    if(resource)group.add(resource);
    root.add(group);
  }
  root.visible=true;
}
