import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const output=new URL('../assets/models/corepolis-lighthouse.glb',import.meta.url);
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});}};
const scene=new THREE.Group();scene.name='Corepolis_Lighthouse';
const mats={
 stone:new THREE.MeshStandardMaterial({name:'Foundation_Stone',color:0x8c8875,roughness:1,flatShading:true}),
 stoneLight:new THREE.MeshStandardMaterial({name:'Stone_Trim',color:0xb8b197,roughness:1,flatShading:true}),
 walls:new THREE.MeshStandardMaterial({name:'Ivory_Plaster',color:0xe4d5b0,roughness:.96,flatShading:true}),
 roof:new THREE.MeshStandardMaterial({name:'Terracotta_Roof',color:0xad4f3e,roughness:.95,flatShading:true}),
 roofLight:new THREE.MeshStandardMaterial({name:'Roof_Trim',color:0xc56b4c,roughness:.92,flatShading:true}),
 wood:new THREE.MeshStandardMaterial({name:'Warm_Oak',color:0x765334,roughness:1,flatShading:true}),
 metal:new THREE.MeshStandardMaterial({name:'Dark_Iron',color:0x35443e,roughness:.7,metalness:.15,flatShading:true}),
 glass:new THREE.MeshStandardMaterial({name:'Amber_Lantern',color:0xffd27c,emissive:0xffbf55,emissiveIntensity:1,roughness:.35,flatShading:true}),
};
const parts=new Map();
function add(geometry,material,x=0,y=0,z=0,rotation=null){const mesh=new THREE.Mesh(geometry,mats[material]);mesh.position.set(x,y,z);if(rotation)mesh.rotation.set(...rotation);mesh.updateMatrixWorld(true);const baked=geometry.index?geometry.toNonIndexed():geometry.clone();baked.deleteAttribute('uv');baked.applyMatrix4(mesh.matrixWorld);if(!parts.has(material))parts.set(material,[]);parts.get(material).push(baked);}
const box=(x,y,z)=>new THREE.BoxGeometry(x,y,z);
const cyl=(top,bottom,height,sides=12)=>new THREE.CylinderGeometry(top,bottom,height,sides);
add(cyl(1.02,1.12,.18),'stone',0,.09);
add(cyl(.86,.94,.14),'stoneLight',0,.25);
const rings=[[.32,.62,.60,.77,'walls'],[1.09,.60,.53,.55,'walls'],[1.64,.53,.47,.54,'walls'],[2.18,.47,.42,.54,'walls']];
for(const [base,bottom,top,height,mat]of rings)add(cyl(top,bottom,height,12),mat,0,base+height/2);
for(const y of [.34,1.08,1.65,2.20,2.72]){const radius=.63-(y-.34)*.087;add(cyl(radius+.023,radius+.026,.065),'stoneLight',0,y);}
// A masonry skirt and a narrow terracotta navigation stripe.
add(cyl(.618,.654,.24),'stone',0,.43);
add(cyl(.49,.505,.15),'roof',0,2.03);
add(cyl(.48,.50,.045),'roofLight',0,2.13);
// Door, lintel, handle and entrance steps facing +Z.
add(box(.35,.63,.09),'wood',0,.64,.625);
add(box(.065,.68,.10),'stoneLight',-.20,.65,.63);
add(box(.065,.68,.10),'stoneLight',.20,.65,.63);
add(box(.46,.09,.12),'stoneLight',0,1.02,.63);
for(const y of [.47,.68,.89])add(box(.31,.025,.028),'metal',0,y,.681);
add(new THREE.SphereGeometry(.023,6,4),'metal',.095,.65,.696);
for(let i=0;i<3;i++)add(box(.55,.08,.24),'stoneLight',0,.04+i*.08,1.0-i*.18);
// Recessed-looking windows with timber frames at different tower heights.
for(const [y,angle]of [[1.40,0],[2.40,Math.PI],[1.65,Math.PI/2]]){
 const radius=.63-(y-.34)*.087;const x=Math.sin(angle)*(radius+.028),z=Math.cos(angle)*(radius+.028);
 add(box(.22,.34,.055),'wood',x,y,z,[0,angle,0]);
 add(box(.145,.25,.060),'metal',x+Math.sin(angle)*.024,y,z+Math.cos(angle)*.024,[0,angle,0]);
 add(box(.22,.045,.085),'stoneLight',x,y-.18,z,[0,angle,0]);
}
// Keepers' annex and a pitched tile roof.
add(box(.86,.74,.85),'walls',.73,.58,-.10);
add(box(.90,.12,.89),'stone',.73,.25,-.10);
const roofGeo=new THREE.BufferGeometry();const verts=[-.51,0,-.5,.51,0,-.5,0,.35,-.5,-.51,0,.5,.51,0,.5,0,.35,.5];const indices=[0,2,1,3,4,5,0,3,5,0,5,2,2,5,4,2,4,1,0,1,4,0,4,3];roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));roofGeo.setIndex(indices);roofGeo.computeVertexNormals();add(roofGeo,'roof',.73,.98,-.10);
add(box(1.07,.075,.085),'wood',.73,.98,.42);add(box(1.07,.075,.085),'wood',.73,.98,-.62);
add(box(.08,.06,1.07),'roofLight',.73,1.335,-.10);
add(box(.30,.29,.045),'wood',1.172,.66,-.10,[0,Math.PI/2,0]);add(box(.21,.20,.055),'metal',1.198,.66,-.10,[0,Math.PI/2,0]);
// Lantern balcony, railing and eight-sided light chamber.
add(cyl(.73,.55,.12),'stoneLight',0,2.80);
add(cyl(.75,.75,.085),'metal',0,2.90);
for(let i=0;i<12;i++){const a=i*Math.PI/6;add(cyl(.019,.019,.26,5),'metal',Math.sin(a)*.67,3.07,Math.cos(a)*.67);}
add(new THREE.TorusGeometry(.67,.025,4,12),'metal',0,3.19,0,[Math.PI/2,0,0]);
add(cyl(.34,.34,.46,8),'glass',0,3.24);
for(let i=0;i<8;i++){const a=i*Math.PI/4;add(cyl(.025,.025,.52,5),'metal',Math.sin(a)*.36,3.24,Math.cos(a)*.36);}
add(cyl(.40,.40,.06,8),'metal',0,3.51);
add(new THREE.ConeGeometry(.57,.51,8),'roof',0,3.79);
add(cyl(.59,.59,.055,8),'roofLight',0,3.54);
add(new THREE.SphereGeometry(.064,6,4),'metal',0,4.08);
add(cyl(.025,.025,.18,6),'metal',0,4.15);
for(const [name,geometries] of parts){const merged=mergeGeometries(geometries);merged.scale(.85,.85,.85);const mesh=new THREE.Mesh(merged,mats[name]);mesh.name=mats[name].name;scene.add(mesh);}
const anchor=new THREE.Object3D();anchor.name='lighthouse_light_origin';anchor.position.y=3.24*.85;scene.add(anchor);
const binary=await new GLTFExporter().parseAsync(scene,{binary:true,onlyVisible:true});await fs.writeFile(output,Buffer.from(binary));
console.log('Created lighthouse GLB:',binary.byteLength,'bytes;',parts.size,'materials');
