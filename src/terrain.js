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
function coastWave(x,z,sideIndex,i,segments,size){
  if(i===0||i===segments)return 0;
  const u=i/segments;
  const envelope=Math.pow(Math.sin(Math.PI*u),.72);
  const broad=Math.sin((u*2.15+rand(x,z,1000+sideIndex)*.7)*Math.PI)*size*.018;
  const local=(rand(x,z,1010+sideIndex*64+i)-.5)*size*.095;
  return envelope*(size*.032+broad+local);
}
function makeSideProfile(side,x,z,size,sideIndex,connected){
  const half=size*.5;
  const segments=13;
  const points=[];
  for(let i=0;i<=segments;i++){
    const u=i/segments;
    const t=-half+u*size;
    const offset=connected?0:coastWave(x,z,sideIndex,i,segments,size);
    if(side==='n')points.push(new THREE.Vector2(t,-half+offset));
    if(side==='e')points.push(new THREE.Vector2(half-offset,t));
    if(side==='s')points.push(new THREE.Vector2(-t,half-offset));
    if(side==='w')points.push(new THREE.Vector2(-half+offset,-t));
  }
  return points;
}
function organicCorner(x,z,size,index,sx,sz){
  const half=size*.5;
  const cutX=size*(.045+rand(x,z,1080+index*2)*.035);
  const cutZ=size*(.045+rand(x,z,1081+index*2)*.035);
  return new THREE.Vector2(sx*(half-cutX),sz*(half-cutZ));
}
function makeCoastProfiles(x,z,size,cardinal){
  const profiles={
    n:makeSideProfile('n',x,z,size,0,cardinal.n),
    e:makeSideProfile('e',x,z,size,1,cardinal.e),
    s:makeSideProfile('s',x,z,size,2,cardinal.s),
    w:makeSideProfile('w',x,z,size,3,cardinal.w)
  };

  const corners=[
    {a:'n',ai:0,b:'w',bi:profiles.w.length-1,sx:-1,sz:-1},
    {a:'n',ai:profiles.n.length-1,b:'e',bi:0,sx:1,sz:-1},
    {a:'e',ai:profiles.e.length-1,b:'s',bi:0,sx:1,sz:1},
    {a:'s',ai:profiles.s.length-1,b:'w',bi:0,sx:-1,sz:1}
  ];
  corners.forEach((corner,index)=>{
    if(cardinal[corner.a]||cardinal[corner.b])return;
    const point=organicCorner(x,z,size,index,corner.sx,corner.sz);
    profiles[corner.a][corner.ai]=point.clone();
    profiles[corner.b][corner.bi]=point.clone();
  });

  return profiles;
}
function terrainPerimeter(profiles){
  return[
    ...profiles.n,
    ...profiles.e.slice(1),
    ...profiles.s.slice(1),
    ...profiles.w.slice(1,-1)
  ];
}
function createTopSurface(profiles,x,z,variant){
  const perimeter=terrainPerimeter(profiles);
  const faces=THREE.ShapeUtils.triangulateShape(perimeter,[]);
  const positions=[];
  const colors=[];
  const base=[0x7fa65e,0x7ba259,0x82a960,0x779e58,0x85aa62][variant];

  for(const p of perimeter){
    positions.push(p.x,.11,p.y);
    const tone=(rand(x,z,1160+positions.length)-.5)*.028;
    const c=shade(base,tone);
    colors.push(c.r,c.g,c.b);
  }

  const indices=[];
  for(const face of faces)indices.push(face[0],face[1],face[2]);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh=new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors:true,
      roughness:.94,
      metalness:0,
      side:THREE.DoubleSide
    })
  );
  mesh.receiveShadow=true;
  mesh.castShadow=false;
  return mesh;
}
function createTurfSkirt(side,profile,x,z,sideIndex){
  const {normal}=cliffBasis(side);
  const positions=[];
  const colors=[];
  const indices=[];
  const topY=.113;
  const bottomY=.018;

  for(let i=0;i<profile.length;i++){
    const p=profile[i];
    const tuck=.012+(rand(x,z,1720+sideIndex*41+i)-.5)*.008;
    const top=new THREE.Vector3(p.x-normal.x*.010,topY,p.y-normal.y*.010);
    const bottom=new THREE.Vector3(p.x+normal.x*tuck,bottomY,p.y+normal.y*tuck);
    for(const [point,color] of [[top,0x799e59],[bottom,0x73533a]]){
      positions.push(point.x,point.y,point.z);
      const c=shade(color,(rand(x,z,1760+sideIndex*47+i+positions.length)-.5)*.025);
      colors.push(c.r,c.g,c.b);
    }
  }

  for(let i=0;i<profile.length-1;i++){
    const a=i*2;
    const b=a+2;
    indices.push(a,a+1,b,b,a+1,b+1);
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
      roughness:.97,
      metalness:0,
      side:THREE.DoubleSide
    })
  );
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  return mesh;
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
const CLIFF_ROW_Y=[.112,.018,-.20,-.48,-.82,-1.16];
const CLIFF_ROW_OUT=[-.012,.006,.045,.09,.145,.205];

function cliffBasis(side){
  const normal=
    side==='n'?new THREE.Vector2(0,-1):
    side==='s'?new THREE.Vector2(0,1):
    side==='e'?new THREE.Vector2(1,0):
    new THREE.Vector2(-1,0);
  return{normal,tangent:new THREE.Vector2(-normal.y,normal.x)};
}
function buildCliffRows(side,topProfile,x,z,sideIndex){
  const {normal,tangent}=cliffBasis(side);
  const segments=topProfile.length-1;
  const rows=[];

  for(let row=0;row<CLIFF_ROW_Y.length;row++){
    const points=[];
    for(let i=0;i<=segments;i++){
      const top=topProfile[i];
      const envelope=Math.pow(Math.sin(Math.PI*(i/segments)),.78);
      const isTop=row===0;
      const parallel=isTop?0:(rand(x,z,1210+sideIndex*211+row*29+i)-.5)*.105*envelope;
      const broad=isTop?0:Math.sin((i/segments)*Math.PI*2+rand(x,z,1280+sideIndex*31)*2.2)*.018*row;
      const local=isTop?0:(rand(x,z,1310+sideIndex*211+row*29+i)-.5)*(.055+.008*row);
      const out=CLIFF_ROW_OUT[row]+broad+local;
      const px=top.x+normal.x*out+tangent.x*parallel;
      const pz=top.y+normal.y*out+tangent.y*parallel;
      const bottomNoise=row===CLIFF_ROW_Y.length-1?(rand(x,z,1410+sideIndex*43+i)-.5)*.18:0;
      points.push(new THREE.Vector3(px,CLIFF_ROW_Y[row]+bottomNoise,pz));
    }
    rows.push(points);
  }
  return rows;
}
function cliffColor(row,x,z,sideIndex,segment){
  const palette=[0x708957,0x72533a,0x704f38,0x685b4d,0x5c5b53,0x4f544f];
  return shade(
    palette[Math.min(row,palette.length-1)],
    (rand(x,z,1650+sideIndex*53+row*17+segment)-.5)*.05
  );
}
function createCliffWallFromRows(rows,x,z,sideIndex){
  const segments=rows[0].length-1;
  const positions=[];
  const colors=[];
  const indices=[];

  for(let row=0;row<rows.length;row++){
    for(let i=0;i<=segments;i++){
      const p=rows[row][i];
      positions.push(p.x,p.y,p.z);
      const c=cliffColor(row,x,z,sideIndex,i);
      colors.push(c.r,c.g,c.b);
    }
  }

  for(let row=0;row<rows.length-1;row++){
    for(let i=0;i<segments;i++){
      const a=row*(segments+1)+i;
      const b=a+1;
      const c=(row+1)*(segments+1)+i;
      const d=c+1;
      indices.push(a,c,b,b,c,d);
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
function cliffCornerEndpoint(rows,which){
  return rows.map(row=>which==='start'?row[0]:row[row.length-1]);
}
function createOuterCornerBridge(corner,rowsA,endA,rowsB,endB,x,z,index){
  const aPoints=cliffCornerEndpoint(rowsA,endA);
  const bPoints=cliffCornerEndpoint(rowsB,endB);
  const positions=[];
  const colors=[];
  const indices=[];
  const diag=new THREE.Vector2(corner.sx,corner.sz).normalize();

  for(let row=0;row<aPoints.length;row++){
    const a=aPoints[row];
    const b=bPoints[row];
    const depth=row/(aPoints.length-1);
    const spread=.012+depth*.035;
    const mid=new THREE.Vector3(
      (a.x+b.x)*.5+diag.x*spread,
      Math.min(a.y,b.y)-depth*.008,
      (a.z+b.z)*.5+diag.y*spread
    );
    for(const p of [a,mid,b]){
      positions.push(p.x,p.y,p.z);
      const c=cliffColor(row,x,z,20+index,row);
      colors.push(c.r,c.g,c.b);
    }
  }

  for(let row=0;row<aPoints.length-1;row++){
    const a=row*3;
    const n=(row+1)*3;
    indices.push(
      a,n,a+1, a+1,n,n+1,
      a+1,n+1,a+2, a+2,n+1,n+2
    );
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
      .36+rand(x,z,740+sideIndex*20+i)*.42,
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
    blade.position.set(px+(i-1)*.045,.112+height*.42,pz+((i%2)-.5)*.04);
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
  const inset=size*(.045+rand(x,z,1500+index)*.035);
  const px=corner.sx*(half-inset*.45);
  const pz=corner.sz*(half-inset*.45);
  addRockChunk(
    root,
    new THREE.Vector3(px,-.58,pz),
    .56+rand(x,z,1510+index)*.28,
    rand(x,z,1520+index)>.5?0x66655c:0x706657,
    rand(x,z,1530+index)*Math.PI
  );
  if(rand(x,z,1540+index)>.45){
    addRockChunk(
      root,
      new THREE.Vector3(px-corner.sx*.18,-.84,pz-corner.sz*.12),
      .34+rand(x,z,1550+index)*.18,
      0x5b5e57,
      rand(x,z,1560+index)*Math.PI
    );
  }
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

  const profiles=makeCoastProfiles(x,z,tileSize,cardinal);
  root.add(createTopSurface(profiles,x,z,variant));
  addInteriorTone(root,x,z,tileSize,variant);

  const cliffRows={};
  SIDES.forEach((side,index)=>{
    if(cardinal[side.key])return;
    const rows=buildCliffRows(side.key,profiles[side.key],x,z,index);
    cliffRows[side.key]=rows;
    root.add(createCliffWallFromRows(rows,x,z,index));
    root.add(createTurfSkirt(side.key,profiles[side.key],x,z,index));
    addCliffDetails(root,side.key,x,z,tileSize,index);
    addTopEdgeDecor(root,side.key,x,z,tileSize,index,hero&&index===Math.floor(rand(x,z,72)*4));
  });

  const cornerJoins={
    ne:['n','end','e','start'],
    se:['e','end','s','start'],
    sw:['s','end','w','start'],
    nw:['w','end','n','start']
  };
  DIAGONALS.forEach((corner,index)=>{
    const openA=!cardinal[corner.a];
    const openB=!cardinal[corner.b];
    if(openA&&openB){
      const join=cornerJoins[corner.key];
      if(join&&cliffRows[join[0]]&&cliffRows[join[2]]){
        root.add(createOuterCornerBridge(
          corner,
          cliffRows[join[0]],join[1],
          cliffRows[join[2]],join[3],
          x,z,index
        ));
      }
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
