import * as THREE from 'three';
import { buildTerrainTile, disposeTerrainTile } from './terrain.js?v=water-v2-1';
import { GRID } from './config.js?v=lighthouse-1';
import './territory-card-preview.js?v=lighthouse-1';

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

export function fragmentMiniMapMarkup(){
  return'';
}

const ghostAnchorGeometry=new THREE.TorusGeometry(.40,.055,6,28);
const validOutlineMaterial=new THREE.LineBasicMaterial({color:0xc7ffb8,transparent:true,opacity:.94,depthTest:false});
const invalidOutlineMaterial=new THREE.LineBasicMaterial({color:0xffb0a6,transparent:true,opacity:.96,depthTest:false});
const anchorMaterial=new THREE.MeshBasicMaterial({color:0xffdfa0,transparent:true,opacity:.94,depthTest:false});

function ghostAppearance(object,valid,cloneMaterials=false){
  object.traverse(mesh=>{
    if(!mesh.isMesh)return;
    mesh.castShadow=false;
    mesh.receiveShadow=false;
    mesh.renderOrder=8;
    if(cloneMaterials)mesh.material=Array.isArray(mesh.material)
      ?mesh.material.map(material=>material.clone()):mesh.material.clone();
    for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material])){
      if(!material.userData.ghostBaseColor)material.userData.ghostBaseColor=material.color.clone();
      material.color.copy(material.userData.ghostBaseColor);
      if(!valid)material.color.lerp(new THREE.Color(0xea6659),.60);
      material.transparent=true;
      material.opacity=valid?.76:.60;
      material.depthWrite=false;
      if(material.emissive){material.emissive.set(valid?0x23482b:0x6f201b);material.emissiveIntensity=.16;}
    }
  });
}

function perimeterGeometry(cells,anchor){
  const occupied=new Set(cells.map(cell=>`${cell.x},${cell.z}`));
  const half=GRID.tileSize*.47;
  const y=.20;
  const vertices=[];
  const push=(ax,az,bx,bz)=>vertices.push(ax,y,az,bx,y,bz);

  for(const cell of cells){
    const cx=(anchor.x+cell.x)*GRID.tileSize;
    const cz=(anchor.z+cell.z)*GRID.tileSize;
    if(!occupied.has(`${cell.x},${cell.z-1}`))push(cx-half,cz-half,cx+half,cz-half);
    if(!occupied.has(`${cell.x+1},${cell.z}`))push(cx+half,cz-half,cx+half,cz+half);
    if(!occupied.has(`${cell.x},${cell.z+1}`))push(cx+half,cz+half,cx-half,cz+half);
    if(!occupied.has(`${cell.x-1},${cell.z}`))push(cx-half,cz+half,cx-half,cz-half);
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  return geometry;
}

function clearGhost(root){
  for(const terrain of root.userData.ghostTerrains||[])disposeTerrainTile(terrain);
  for(const resource of root.userData.ghostResources||[]){
    // Resource geometry and textures belong to the loaded model cache.
    const materials=new Set();
    resource.traverse(mesh=>{if(mesh.isMesh)for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material]))materials.add(material);});
    for(const material of materials)material.dispose();
  }
  root.userData.perimeterGeometry?.dispose();
  root.userData.perimeterGeometry=null;
  root.userData.ghostTerrains=[];
  root.userData.ghostResources=[];
  root.userData.signature=null;
  root.clear();
}

export function syncIslandGhost(root,card,anchor,valid,{hasLand=()=>false,createResource=()=>null}={}){
  if(!card||card.type!=='island'||!anchor){
    clearGhost(root);
    root.visible=false;
    return;
  }

  const cells=rotatedFragmentCells(card);
  const absolute=cells.map(cell=>({...cell,x:anchor.x+cell.x,z:anchor.z+cell.z}));
  const occupied=new Set(absolute.map(cell=>`${cell.x},${cell.z}`));
  const landAt=(x,z)=>occupied.has(`${x},${z}`)||hasLand(x,z);
  const neighbours=absolute.map(cell=>{
    let mask='';
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)mask+=landAt(cell.x+dx,cell.z+dz)?'1':'0';
    return mask;
  });
  const signature=JSON.stringify([card.id,absolute,neighbours]);
  if(root.userData.signature===signature){
    if(root.userData.valid!==!!valid){
      for(const object of [...root.userData.ghostTerrains,...root.userData.ghostResources])ghostAppearance(object,valid);
      root.userData.outline.material=valid?validOutlineMaterial:invalidOutlineMaterial;
    }
    root.userData.valid=!!valid;
    root.visible=true;
    return;
  }
  clearGhost(root);

  for(const cell of absolute){
    const group=new THREE.Group();
    group.position.set(cell.x*GRID.tileSize,.025,cell.z*GRID.tileSize);
    const terrain=buildTerrainTile({x:cell.x,z:cell.z,tileSize:GRID.tileSize,cellKey:`ghost:${cell.x},${cell.z}`,hasLand:landAt});
    ghostAppearance(terrain,valid);
    root.userData.ghostTerrains.push(terrain);
    group.add(terrain);
    const resource=createResource(cell);
    if(resource){
      ghostAppearance(resource,valid,true);
      root.userData.ghostResources.push(resource);
      group.add(resource);
    }
    root.add(group);
  }

  const geometry=perimeterGeometry(cells,anchor);
  root.userData.perimeterGeometry=geometry;
  const outline=new THREE.LineSegments(geometry,valid?validOutlineMaterial:invalidOutlineMaterial);
  outline.renderOrder=20;
  root.userData.outline=outline;
  root.add(outline);

  const anchorRing=new THREE.Mesh(ghostAnchorGeometry,anchorMaterial);
  anchorRing.rotation.x=Math.PI/2;
  anchorRing.position.set(anchor.x*GRID.tileSize,.23,anchor.z*GRID.tileSize);
  anchorRing.renderOrder=21;
  root.add(anchorRing);

  root.userData.signature=signature;
  root.userData.valid=!!valid;
  root.userData.cellCount=cells.length;
  root.visible=true;
}
