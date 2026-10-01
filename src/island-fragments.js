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

function svgResource(content,cx,cy){
  if(content==='tree'){
    return `<g class="fragment-resource tree" transform="translate(${cx} ${cy-7})">
      <rect x="-1.4" y="4" width="2.8" height="6" rx="1" class="fragment-tree-trunk"/>
      <path d="M0 -8 L-7 3 L-3 3 L-8 9 L8 9 L3 3 L7 3 Z" class="fragment-tree-crown"/>
    </g>`;
  }
  if(content==='rock'){
    return `<g class="fragment-resource rock" transform="translate(${cx} ${cy-3})">
      <path d="M-8 6 L-6 -1 L-1 -7 L6 -4 L9 4 L4 9 L-4 9 Z" class="fragment-rock-main"/>
      <path d="M-1 -7 L1 2 L9 4 L6 -4 Z" class="fragment-rock-face"/>
    </g>`;
  }
  return'';
}

function isoPreviewMarkup(card){
  const cells=rotatedFragmentCells(card);
  const tileW=34,tileH=18,depth=8;
  const projected=cells.map(cell=>({
    ...cell,
    cx:(cell.x-cell.z)*tileW*.5,
    cy:(cell.x+cell.z)*tileH*.5
  })).sort((a,b)=>(a.x+a.z)-(b.x+b.z)||a.x-b.x);

  const minX=Math.min(...projected.map(cell=>cell.cx-tileW*.5))-12;
  const maxX=Math.max(...projected.map(cell=>cell.cx+tileW*.5))+12;
  const minY=Math.min(...projected.map(cell=>cell.cy-tileH*.5))-18;
  const maxY=Math.max(...projected.map(cell=>cell.cy+tileH*.5+depth))+12;
  const width=Math.max(64,maxX-minX);
  const height=Math.max(46,maxY-minY);

  const tiles=projected.map(cell=>{
    const {cx,cy}=cell;
    const top=`${cx},${cy-tileH*.5} ${cx+tileW*.5},${cy} ${cx},${cy+tileH*.5} ${cx-tileW*.5},${cy}`;
    const left=`${cx-tileW*.5},${cy} ${cx},${cy+tileH*.5} ${cx},${cy+tileH*.5+depth} ${cx-tileW*.5},${cy+depth}`;
    const right=`${cx+tileW*.5},${cy} ${cx},${cy+tileH*.5} ${cx},${cy+tileH*.5+depth} ${cx+tileW*.5},${cy+depth}`;
    return `<g class="fragment-iso-cell ${cell.content||'empty'}">
      <polygon points="${left}" class="fragment-iso-side fragment-iso-side-left"/>
      <polygon points="${right}" class="fragment-iso-side fragment-iso-side-right"/>
      <polygon points="${top}" class="fragment-iso-top"/>
      ${svgResource(cell.content,cx,cy)}
    </g>`;
  }).join('');

  return `<svg class="fragment-map-svg" viewBox="${minX} ${minY} ${width} ${height}" aria-hidden="true">${tiles}</svg>`;
}

export function fragmentMiniMapMarkup(card){
  const resources=fragmentResourceCounts(card);
  const label=card?.fragment?.label||'1×1';
  const count=card?.fragment?.cells?.length||1;
  const resourceBadges=[
    resources.tree?`<span class="fragment-badge tree"><i></i>ЛЕС ×${resources.tree}</span>`:'',
    resources.rock?`<span class="fragment-badge rock"><i></i>КАМЕНЬ ×${resources.rock}</span>`:''
  ].join('');
  const resourceLabel=[resources.tree?`лес ${resources.tree}`:'',resources.rock?`камень ${resources.rock}`:''].filter(Boolean).join(', ')||'без ресурсов';
  return `<span class="fragment-map" aria-label="Фрагмент ${label}: ${count} клеток, ${resourceLabel}">
    <span class="fragment-map-stage">${isoPreviewMarkup(card)}</span>
    <span class="fragment-map-foot"><b>${label}</b><em>${count} ${count===1?'КЛЕТКА':'КЛЕТКИ'}</em></span>
    ${resourceBadges?`<span class="fragment-badges">${resourceBadges}</span>`:''}
  </span>`;
}

const ghostCliffGeometry=new RoundedBoxGeometry(GRID.tileSize*.94,.70,GRID.tileSize*.94,2,.16);
const ghostTopGeometry=new RoundedBoxGeometry(GRID.tileSize*.88,.10,GRID.tileSize*.88,2,.14);
const ghostShadowGeometry=new THREE.PlaneGeometry(GRID.tileSize*.90,GRID.tileSize*.90);
const ghostTreeGeometry=new THREE.ConeGeometry(.48,.92,7);
const ghostTreeUpperGeometry=new THREE.ConeGeometry(.35,.72,7);
const ghostTrunkGeometry=new THREE.CylinderGeometry(.10,.13,.42,6);
const ghostRockGeometry=new THREE.IcosahedronGeometry(.42,0);
const ghostAnchorGeometry=new THREE.TorusGeometry(.40,.055,6,28);

const validCliffMaterial=new THREE.MeshStandardMaterial({color:0x708773,emissive:0x183b2c,emissiveIntensity:.34,roughness:.92,transparent:true,opacity:.58,depthWrite:false});
const validTopMaterial=new THREE.MeshStandardMaterial({color:0x8ad277,emissive:0x315c35,emissiveIntensity:.42,roughness:.82,transparent:true,opacity:.76,depthWrite:false});
const invalidCliffMaterial=new THREE.MeshStandardMaterial({color:0x9a625c,emissive:0x5a201c,emissiveIntensity:.42,roughness:.92,transparent:true,opacity:.56,depthWrite:false});
const invalidTopMaterial=new THREE.MeshStandardMaterial({color:0xe17c70,emissive:0x6f251f,emissiveIntensity:.52,roughness:.82,transparent:true,opacity:.72,depthWrite:false});
const validShadowMaterial=new THREE.MeshBasicMaterial({color:0x295947,transparent:true,opacity:.15,depthWrite:false});
const invalidShadowMaterial=new THREE.MeshBasicMaterial({color:0x7d302b,transparent:true,opacity:.17,depthWrite:false});
const ghostTreeMaterial=new THREE.MeshStandardMaterial({color:0x5ea75f,emissive:0x214c2a,emissiveIntensity:.22,roughness:.86,transparent:true,opacity:.92,depthWrite:false});
const ghostTreeUpperMaterial=new THREE.MeshStandardMaterial({color:0x72bd69,emissive:0x27552d,emissiveIntensity:.22,roughness:.86,transparent:true,opacity:.94,depthWrite:false});
const ghostTrunkMaterial=new THREE.MeshStandardMaterial({color:0x8d6544,roughness:1,transparent:true,opacity:.88,depthWrite:false});
const ghostRockMaterial=new THREE.MeshStandardMaterial({color:0xb9c1bd,emissive:0x34403d,emissiveIntensity:.12,roughness:.94,transparent:true,opacity:.94,depthWrite:false});
const validOutlineMaterial=new THREE.LineBasicMaterial({color:0xc7ffb8,transparent:true,opacity:.94,depthTest:false});
const invalidOutlineMaterial=new THREE.LineBasicMaterial({color:0xffb0a6,transparent:true,opacity:.96,depthTest:false});
const anchorMaterial=new THREE.MeshBasicMaterial({color:0xffdfa0,transparent:true,opacity:.94,depthTest:false});

function resourceGhost(content){
  if(content==='tree'){
    const group=new THREE.Group();
    const trunk=new THREE.Mesh(ghostTrunkGeometry,ghostTrunkMaterial);
    trunk.position.y=.28;
    const crown=new THREE.Mesh(ghostTreeGeometry,ghostTreeMaterial);
    crown.position.y=.83;
    const upper=new THREE.Mesh(ghostTreeUpperGeometry,ghostTreeUpperMaterial);
    upper.position.y=1.20;
    group.add(trunk,crown,upper);
    return group;
  }
  if(content==='rock'){
    const group=new THREE.Group();
    const main=new THREE.Mesh(ghostRockGeometry,ghostRockMaterial);
    main.scale.set(1.45,.92,1.18);
    main.position.set(-.08,.43,.02);
    main.rotation.set(.08,.45,-.08);
    const chip=new THREE.Mesh(ghostRockGeometry,ghostRockMaterial);
    chip.scale.set(.72,.55,.62);
    chip.position.set(.43,.30,-.28);
    chip.rotation.set(-.12,-.35,.16);
    group.add(main,chip);
    return group;
  }
  return null;
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
  root.userData.perimeterGeometry?.dispose?.();
  root.userData.perimeterGeometry=null;
  root.clear();
}

export function syncIslandGhost(root,card,anchor,valid){
  clearGhost(root);
  if(!card||card.type!=='island'||!anchor){
    root.visible=false;
    return;
  }

  const cells=rotatedFragmentCells(card);
  const cliffMaterial=valid?validCliffMaterial:invalidCliffMaterial;
  const topMaterial=valid?validTopMaterial:invalidTopMaterial;
  const shadowMaterial=valid?validShadowMaterial:invalidShadowMaterial;

  for(const cell of cells){
    const group=new THREE.Group();
    group.position.set((anchor.x+cell.x)*GRID.tileSize,-.24,(anchor.z+cell.z)*GRID.tileSize);

    const shadow=new THREE.Mesh(ghostShadowGeometry,shadowMaterial);
    shadow.rotation.x=-Math.PI/2;
    shadow.position.y=-.34;
    shadow.renderOrder=7;

    const cliff=new THREE.Mesh(ghostCliffGeometry,cliffMaterial);
    cliff.renderOrder=8;

    const top=new THREE.Mesh(ghostTopGeometry,topMaterial);
    top.position.y=.40;
    top.renderOrder=9;

    group.add(shadow,cliff,top);
    const resource=resourceGhost(cell.content);
    if(resource){
      resource.position.y=.42;
      resource.traverse(object=>{if(object.isMesh)object.renderOrder=10;});
      group.add(resource);
    }
    root.add(group);
  }

  const geometry=perimeterGeometry(cells,anchor);
  root.userData.perimeterGeometry=geometry;
  const outline=new THREE.LineSegments(geometry,valid?validOutlineMaterial:invalidOutlineMaterial);
  outline.renderOrder=20;
  root.add(outline);

  const anchorRing=new THREE.Mesh(ghostAnchorGeometry,anchorMaterial);
  anchorRing.rotation.x=Math.PI/2;
  anchorRing.position.set(anchor.x*GRID.tileSize,.23,anchor.z*GRID.tileSize);
  anchorRing.renderOrder=21;
  root.add(anchorRing);

  root.userData.valid=!!valid;
  root.userData.cellCount=cells.length;
  root.visible=true;
}
