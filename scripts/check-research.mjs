import assert from 'node:assert/strict';
import{RESEARCH,freshResearch,normalizeResearch,prepareResearch,learnResearch,hasResearch,navigationRange,canTrade,pickTradeTypes}from '../src/research.js';
const state={research:freshResearch(),comboCount:0,seaRoutes:new Set(),land:new Map(),hand:[]};
assert.deepEqual(prepareResearch(state),[]);state.comboCount=1;
const offers=prepareResearch(state,()=>0);assert.equal(offers.length,3);assert.deepEqual(prepareResearch(state),offers);
const restored={...state,research:normalizeResearch(JSON.parse(JSON.stringify(state.research)))};
assert.deepEqual(prepareResearch(restored),offers);assert.ok(learnResearch(state,offers[0]));assert.ok(!learnResearch(state,offers[0]));assert.deepEqual(prepareResearch(state),[]);assert.equal(state.research.learned.length,1);
for(const count of [3,6,10]){state.comboCount=count;const choices=prepareResearch(state,()=>0);assert.ok(choices.length&&choices.length<=3);assert.ok(choices.every(id=>!hasResearch(state,id)));assert.ok(learnResearch(state,choices[0]));}
state.research.seaRouteReached=true;assert.ok(learnResearch(state,prepareResearch(state,()=>0)[0]));assert.equal(state.research.learned.length,Object.keys(RESEARCH).length);assert.deepEqual(prepareResearch(state),[]);assert.equal(new Set(state.research.claimed).size,5);
assert.equal(navigationRange(state),5.25);assert.equal(navigationRange({research:freshResearch()}),3.25);
state.hand=[{},{},{}];state.land.set('0,0',{type:'market'});assert.ok(canTrade(state));state.hand.pop();assert.ok(!canTrade(state));
assert.deepEqual(normalizeResearch(undefined),freshResearch());assert.deepEqual(normalizeResearch(null),freshResearch());assert.equal(normalizeResearch({learned:['unknown','navigation','navigation']}).learned.length,1);
console.log('Research: milestones, persisted offers, five unique choices, one-time grants, legacy saves, navigation and trading requirements passed.');

assert.deepEqual(pickTradeTypes([['field',10],['house',2],['tree',1],['locked',0]],()=>0),['field','house','tree']);
