import * as THREE from 'three';

const SIDES=[
  {key:'n',dx:0,dz:-1},
  {key:'e',dx:1,dz:0},
  {key:'s',dx:0,dz:1},
  {key:'w',dx:-1,dz:0}
];
const DIAGONALS=[
  {key:'ne',dx:1,dz:-1,sx:1,sz:-1,a:'n',b:'e'},
  {key:'se',dx:1,dz:1,sx:1,sz:1,a:'s',b:'e'},
  {key:'sw',dx:-1,dz:1,sx:-1,sz:1,a:'s',b:'w'},
  {key:'nw',dx:-1,dz:-1,sx:-1,sz:-1,a:'n',b:'w'}
];

function hash32(x,z,salt=0){
  let h=(Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(salt|0,2246822519))|0;
  h=Math.imul(h^(h>>>13),1274126177);
  return (h^(h>>>16))>>>0;
}
function rand(x,z,salt=0){
  return hash32(x,z,salt)/4294967295;
}
function shade(hex,amount){
  return new THREE.Color(hex).offsetHSL(0,0,amount);
}
function cardinalProfile(x,z,hasLand){
  const cardinal={};
  let mask=0;
  SIDES.forEach((side,index)=>{
    const present=!!hasLand(x+side.dx,z+side.dz);
    cardinal[side.key]=present;
    if(present)mask|=1<<index;
  });
  const diagonal={};
  for(const d of DIAGONALS)diagonal[d.key]=!!hasLand(x+d.dx,z+d.dz);
  return{cardinal,diagonal,mask};
}
function classify(cardinal,diagonal){
  const open=SIDES.filter(side=>!cardinal[side.key]).map(side=>side.key);
  if(open.length===0){
    const inner=DIAGONALS.filter(d=>cardinal[d.a]&&cardinal[d.b]&&!diagonal[d.key]);
    return inner.length?'inner-corner':'center';
  }
  if(open.length===1)return'edge';
  if(open.length===2){
    const opposite=(open.includes('n')&&open.includes('s'))||(open.includes('e')&&open.includes('w'));
    return opposite?'channel':'outer-corner';
  }
  if(open.length===3)return'peninsula';
  return'island';
}
function makeMaterial(color,roughness=.96,extra={}){
  return new THREE.MeshStandardMaterial({color,roughness,metalness:0,...extra});
}
function setCellKey(root,cellKey){
  root.traverse(object=>{object.userData.cellKey=cellKey;});
}
function makeTopCore(size){
  const grass=new THREE.Mesh(
    new THREE.BoxGeometry(size,.14,size),
    makeMaterial(0x7fa65e,.94)
  );
  grass.position.y=.05;
  grass.castShadow=false;
  grass.receiveShadow=true;

  const soil=new THREE.Mesh(
    new THREE.BoxGeometry(size,.60,size),
    makeMaterial(0x795637,.99)
  );
  soil.position.y=-.32;
  soil.castShadow=false;
  soil.receiveShadow=true;

  const submergedRock=new THREE.Mesh(
    new THREE.BoxGeometry(size*.92,.54,size*.92),
    makeMaterial(0x62635a,1)
  );
  submergedRock.position.y=-.89;
  submergedRock.castShadow=true;
  submergedRock.receiveShadow=true;

  const underside=new THREE.Mesh(
    new THREE.BoxGeometry(size*.76,.22,size*.76),
    makeMaterial(0x51564f,1)
  );
  underside.position.y=-1.27;
  underside.castShadow=true;
  underside.receiveShadow=true;

  return[grass,soil,submergedRock,underside];
}
function addInteriorTone(root,x,z,size,variant){
  const tones=[0x93b46e,0x739b58,0xa4bd79,0x88aa64,0x6f9857];
  const patch=new THREE.Mesh(
    new THREE.CircleGeometry(size*(.20+rand(x,z,31)*.08),20),
    new THREE.MeshBasicMaterial({
      color:tones[variant],
      transparent:true,
      opacity:.055,
      depthWrite:false
    })
  );
  patch.rotation.x=-Math.PI/2;
  patch.rotation.z=rand(x,z,32)*Math.PI;
  patch.scale.set(1.35,.72,1);
  patch.position.set(
    (rand(x,z,33)-.5)*size*.26,
    .121,
    (rand(x,z,34)-.5)*size*.26
  );
  root.add(patch);
}
function cliffVertexColor(row,x,z,sideIndex,segment){
  const palette=[0x765438,0x735039,0x696052,0x555a54];
  return shade(palette[row],(rand(x,z,200+sideIndex*40+row*9+segment)-.5)*.055);
}
function edgePoint(side,t,half,out){
  if(side==='n')return[t,-half-out];
  if(side==='s')return[t,half+out];
  if(side==='e')return[half+out,t];
  return[-half-out,t];
}
function createCliffWall(side,x,z,size,sideIndex){
  const half=size*.5;
  const segments=6;
  const rows=4;
  const positions=[];
  const colors=[];
  const indices=[];
  const rowY=[-.02,-.29,-.61,-1.12];
  const rowOut=[0,.018,.075,.15];

  for(let row=0;row<rows;row++){
    for(let i=0;i<=segments;i++){
      const baseT=-half+(i/segments)*size;
      const parallel=row===0?0:(rand(x,z,320+sideIndex*100+row*17+i)-.5)*.10;
      const bulge=row===0?0:(rand(x,z,420+sideIndex*100+row*17+i)-.5)*.045;
      const [a,b]=edgePoint(side,baseT+parallel,half,rowOut[row]+bulge);
      const bottomNoise=row===rows-1?(rand(x,z,520+sideIndex*31+i)-.5)*.16:0;
      positions.push(a,rowY[row]+bottomNoise,b);
      const c=cliffVertexColor(row,x,z,sideIndex,i);
      colors.push(c.r,c.g,c.b);
    }
  }

  for(let row=0;row<rows-1;row++){
    for(let i=0;i<segments;i++){
      const a=row*(segments+1)+i;
      const b=a+1;
      const c=(row+1)*(segments+1)+i;
      const d=c+1;
      if(side==='n'||side==='e')indices.push(a,c,b,b,c,d);
      else indices.push(a,b,c,b,d,c);
    }
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh=new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors:true,
      roughness:1,
      metalness:0,
      flatShading:true,
      side:THREE.DoubleSide
    })
  );
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  return mesh;
}
function edgeLocal(side,along,inset,size){
  const half=size*.5;
  if(side==='n')return[along,-half+inset];
  if(side==='s')return[along,half-inset];
  if(side==='e')return[half-inset,along];
  return[-half+inset,along];
}
function addCoastLip(root,side,x,z,size,sideIndex){
  const half=size*.5;
  const vertical=side==='n'||side==='s';
  const lip=new THREE.Mesh(
    new THREE.BoxGeometry(vertical?size*.985:.16,.055,vertical?.16:size*.985),
    makeMaterial(0x91b86b,.91)
  );
  const inset=.035;
  if(side==='n')lip.position.set(0,.145,-half+inset);
  if(side==='s')lip.position.set(0,.145,half-inset);
  if(side==='e')lip.position.set(half-inset,.145,0);
  if(side==='w')lip.position.set(-half+inset,.145,0);
  lip.castShadow=false;
  lip.receiveShadow=true;
  root.add(lip);

  const bumpMaterial=new THREE.MeshBasicMaterial({color:0x83ab62,side:THREE.DoubleSide});
  for(let i=0;i<2;i++){
    const radius=.16+rand(x,z,610+sideIndex*10+i)*.12;
    const bump=new THREE.Mesh(new THREE.CircleGeometry(radius,12),bumpMaterial.clone());
    bump.rotation.x=-Math.PI/2;
    const along=(-.24+rand(x,z,620+sideIndex*10+i)*.48)*size;
    const outward=.035+rand(x,z,630+sideIndex*10+i)*.06;
    const [px,pz]=edgeLocal(side,along,-outward,size);
    bump.position.set(px,.122,pz);
    root.add(bump);
  }
}
function addRockChunk(root,position,scaleValue,color=0x67675f,rotation=0){
  const mesh=new THREE.Mesh(
    new THREE.IcosahedronGeometry(.34,0),
    makeMaterial(color,1,{flatShading:true})
  );
  mesh.position.copy(position);
  mesh.scale.set(scaleValue*.95,scaleValue*.72,scaleValue);
  mesh.rotation.set(rotation*.4,rotation,rotation*.2);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  root.add(mesh);
}
function addCliffDetails(root,side,x,z,size,sideIndex){
  const count=1+Math.floor(rand(x,z,700+sideIndex)*3);
  for(let i=0;i<count;i++){
    const along=(-.36+rand(x,z,710+sideIndex*20+i)*.72)*size;
    const outward=.07+rand(x,z,720+sideIndex*20+i)*.10;
    const [px,pz]=edgeLocal(side,along,-outward,size);
    const y=-.58-rand(x,z,730+sideIndex*20+i)*.42;
    addRockChunk(
      root,
      new THREE.Vector3(px,y,pz),
      .45+rand(x,z,740+sideIndex*20+i)*.52,
      rand(x,z,750+sideIndex*20+i)>.52?0x696961:0x756755,
      rand(x,z,760+sideIndex*20+i)*Math.PI
    );
  }
}
function addGrassTuft(root,px,pz,height=.18,color=0x6e9a55){
  const material=makeMaterial(color,.95,{flatShading:true});
  for(let i=0;i<3;i++){
    const blade=new THREE.Mesh(
      new THREE.ConeGeometry(.032,height*(.78+i*.11),4),
      material.clone()
    );
    blade.position.set(px+(i-1)*.045,.13+height*.42,pz+((i%2)-.5)*.04);
    blade.rotation.z=(i-1)*.11;
    blade.castShadow=false;
    root.add(blade);
  }
}
function addTopEdgeDecor(root,side,x,z,size,sideIndex,hero){
  const tuftCount=1+Math.floor(rand(x,z,800+sideIndex)*2)+(hero?1:0);
  for(let i=0;i<tuftCount;i++){
    const along=(-.34+rand(x,z,810+sideIndex*20+i)*.68)*size;
    const inset=.16+rand(x,z,820+sideIndex*20+i)*.18;
    const [px,pz]=edgeLocal(side,along,inset,size);
    addGrassTuft(
      root,px,pz,
      .14+rand(x,z,830+sideIndex*20+i)*.15,
      rand(x,z,840+sideIndex*20+i)>.5?0x6f9955:0x83a95e
    );
  }

  if(hero){
    const along=(-.25+rand(x,z,850+sideIndex)*.5)*size;
    const [px,pz]=edgeLocal(side,along,.30,size);
    addRockChunk(root,new THREE.Vector3(px,.22,pz),.34,0x818174,rand(x,z,851+sideIndex)*Math.PI);
    const flowerMaterial=makeMaterial(0xf0d77a,.9);
    for(let i=0;i<3;i++){
      const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.035,0),flowerMaterial.clone());
      flower.position.set(px+(i-1)*.07,.31,pz+((i%2)-.5)*.08);
      flower.scale.y=.65;
      flower.castShadow=false;
      root.add(flower);
    }
  }
}
function addOuterCorner(root,corner,x,z,size,index){
  const half=size*.5;
  const px=corner.sx*(half+.035);
  const pz=corner.sz*(half+.035);
  addRockChunk(
    root,
    new THREE.Vector3(px,-.70,pz),
    .62+rand(x,z,900+index)*.28,
    0x66655c,
    rand(x,z,910+index)*Math.PI
  );

  const sod=new THREE.Mesh(
    new THREE.CircleGeometry(.20+rand(x,z,920+index)*.08,14),
    new THREE.MeshBasicMaterial({color:0x83aa61,side:THREE.DoubleSide})
  );
  sod.rotation.x=-Math.PI/2;
  sod.position.set(corner.sx*(half-.01),.123,corner.sz*(half-.01));
  root.add(sod);
}
function addInnerCornerDetail(root,corner,x,z,size,index){
  const half=size*.5;
  const px=corner.sx*(half-.22);
  const pz=corner.sz*(half-.22);
  addGrassTuft(root,px,pz,.16,0x78a159);
  if(rand(x,z,950+index)>.48){
    addRockChunk(root,new THREE.Vector3(px-corner.sx*.08,.17,pz-corner.sz*.08),.22,0x858273,rand(x,z,960+index)*Math.PI);
  }
}

export function buildTerrainTile({x,z,tileSize,cellKey,hasLand}){
  const root=new THREE.Group();
  root.name='terrain';
  const {cardinal,diagonal,mask}=cardinalProfile(x,z,hasLand);
  const terrainType=classify(cardinal,diagonal);
  const variant=Math.floor(rand(x,z,17)*5);
  const openSides=SIDES.filter(side=>!cardinal[side.key]);
  const hero=openSides.length>0&&rand(x,z,71)>.90;

  root.userData.terrainType=terrainType;
  root.userData.terrainMask=mask;
  root.userData.terrainVariant=variant;
  root.userData.heroTerrain=hero;
  root.userData.cellKey=cellKey;

  for(const mesh of makeTopCore(tileSize))root.add(mesh);
  addInteriorTone(root,x,z,tileSize,variant);

  SIDES.forEach((side,index)=>{
    if(cardinal[side.key])return;
    root.add(createCliffWall(side.key,x,z,tileSize,index));
    addCoastLip(root,side.key,x,z,tileSize,index);
    addCliffDetails(root,side.key,x,z,tileSize,index);
    addTopEdgeDecor(root,side.key,x,z,tileSize,index,hero&&index===Math.floor(rand(x,z,72)*4));
  });

  DIAGONALS.forEach((corner,index)=>{
    const openA=!cardinal[corner.a];
    const openB=!cardinal[corner.b];
    if(openA&&openB){
      addOuterCorner(root,corner,x,z,tileSize,index);
      return;
    }
    if(cardinal[corner.a]&&cardinal[corner.b]&&!diagonal[corner.key]){
      addInnerCornerDetail(root,corner,x,z,tileSize,index);
    }
  });

  setCellKey(root,cellKey);
  return root;
}

export function disposeTerrainTile(root){
  if(!root)return;
  root.traverse(object=>{
    object.geometry?.dispose?.();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials){
      if(!material)continue;
      material.map?.dispose?.();
      material.dispose?.();
    }
  });
}
