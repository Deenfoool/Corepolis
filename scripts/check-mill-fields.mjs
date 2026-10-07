import assert from 'node:assert/strict';
import {collectMillFieldGroups} from '../src/mill-fields.js';
import {DIRECTIONS} from '../src/config.js';
const mill={x:0,z:0,key:'0,0',type:'mill'};
function board(coords){return new Map([mill,...coords.map(([x,z],i)=>({x,z,key:`${x},${z}`,type:'field',fieldOrder:i+1,stage:4}))].map(t=>[t.key,t]));}
function verify(land){
 const groups=collectMillFieldGroups(land,mill,DIRECTIONS);
 const all=groups.flatMap(g=>g.fields);
 assert.equal(new Set(all.map(t=>t.key)).size,all.length,'A field cannot count twice');
 for(const {fields,direction} of groups){
  assert.ok(fields.length<=4);
  if(!fields.length)continue;
  assert.equal(fields[0].key,`${direction.dx},${direction.dz}`);
  const reached=new Set([fields[0].key]);
  for(let pass=0;pass<4;pass++)for(const f of fields)if(fields.some(n=>reached.has(n.key)&&Math.abs(n.x-f.x)+Math.abs(n.z-f.z)===1))reached.add(f.key);
  assert.equal(reached.size,fields.length,'Each side is connected to its adjacent field');
 }
 return groups;
}
const arms=DIRECTIONS.flatMap(d=>Array.from({length:4},(_,i)=>[d.dx*(i+1),d.dz*(i+1)]));
assert.deepEqual(verify(board(arms)).map(g=>g.fields.length),[4,4,4,4]);
const compact=[[0,-1],[1,-1],[0,-2],[1,-2],[1,0],[1,1],[2,0],[2,1],[0,1],[-1,1],[0,2],[-1,2],[-1,0],[-1,-1],[-2,0],[-2,-1]];
assert.deepEqual(verify(board(compact)).map(g=>g.fields.length),[4,4,4,4]);
assert.deepEqual(verify(board(DIRECTIONS.map(d=>[d.dx,d.dz]))).map(g=>g.fields.length),[1,1,1,1]);
const blocked=board(arms);blocked.get('0,-1').type='rock';assert.equal(verify(blocked)[0].fields.length,0);
const overflow=board([...arms,[0,-5],[6,6]]);assert.equal(verify(overflow).flatMap(g=>g.fields).length,16);
assert.deepEqual(collectMillFieldGroups(overflow,null,DIRECTIONS).map(g=>g.fields.length),[0,0,0,0]);
// Saved cells and their placement order reproduce the same groups.
const restored=new Map(JSON.parse(JSON.stringify([...overflow])));
assert.deepEqual(verify(restored).map(g=>g.fields.map(t=>t.key)),verify(overflow).map(g=>g.fields.map(t=>t.key)));
console.log('Mill groups: 16 fields, compact shapes, single fields, blocked sides, overflow, unique ownership and save restoration passed.');
