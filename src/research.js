export const RESEARCH={
  cropRotation:{name:'Севооборот',icon:'sprout',description:'После урожая мельницы одно поле остаётся для следующего цикла.'},
  reforestation:{name:'Лесовосстановление',icon:'trees',description:'После истощения каждой клетки леса вы получаете карту нового леса.'},
  trade:{name:'Торговые договоры',icon:'handshake',description:'На рынке обменяйте 3 карты из руки на одну из трёх предложенных.'},
  cartography:{name:'Картография',icon:'map',description:'Перед размещением карты острова выберите один из трёх фрагментов.'},
  navigation:{name:'Навигация',icon:'compass',description:'Дальность строительства вокруг маяка увеличивается с 3 до 5 клеток.'}
};
export const MILESTONES=[['combo1',1],['combo3',3],['combo6',6],['combo10',10],['seaRoute',null]];
export function freshResearch(){return {learned:[],claimed:[],offers:[],pending:null,seaRouteReached:false};}
export function normalizeResearch(raw={}){
  raw=raw&&typeof raw==='object'?raw:{};
  const list=value=>Array.isArray(value)?value:[];
  const ids=new Set(Object.keys(RESEARCH)),milestones=new Set(MILESTONES.map(([id])=>id));
  const learned=[...new Set(list(raw.learned).filter(id=>ids.has(id)))];
  return {learned,claimed:[...new Set(list(raw.claimed).filter(id=>milestones.has(id)))],offers:[...new Set(list(raw.offers).filter(id=>ids.has(id)&&!learned.includes(id)))].slice(0,3),pending:milestones.has(raw.pending)?raw.pending:null,seaRouteReached:!!raw.seaRouteReached};
}
export const hasResearch=(state,id)=>state.research?.learned.includes(id)||false;
export const navigationRange=state=>hasResearch(state,'navigation')?5.25:3.25;
export function nextResearchMilestone(state){
  const research=state.research;
  if(research.learned.length>=Object.keys(RESEARCH).length)return null;
  return MILESTONES.find(([id,count])=>!research.claimed.includes(id)&&(count===null?research.seaRouteReached||state.seaRoutes.size>0:state.comboCount>=count))?.[0]||null;
}
export function prepareResearch(state,random=Math.random){
  const r=state.research;
  if(r.pending&&r.offers.length)return r.offers;
  r.pending=nextResearchMilestone(state);if(!r.pending)return[];
  const pool=Object.keys(RESEARCH).filter(id=>!r.learned.includes(id));
  r.offers=[];while(pool.length&&r.offers.length<3)r.offers.push(pool.splice(Math.floor(random()*pool.length),1)[0]);
  return r.offers;
}
export function learnResearch(state,id){
  const r=state.research;
  if(!r.pending||!r.offers.includes(id)||r.learned.includes(id))return false;
  r.learned.push(id);r.claimed.push(r.pending);r.pending=null;r.offers=[];return true;
}
export const canTrade=state=>hasResearch(state,'trade')&&state.hand.length>=3&&[...state.land.values()].some(t=>t.type==='market');
export function pickTradeTypes(weights,random=Math.random){
  const pool=weights.filter(([,weight])=>weight>0).map(entry=>[...entry]),types=[];
  while(pool.length&&types.length<3){
    let roll=random()*pool.reduce((sum,[,weight])=>sum+weight,0),index=pool.length-1;
    for(let i=0;i<pool.length;i++){roll-=pool[i][1];if(roll<0){index=i;break;}}
    types.push(pool.splice(index,1)[0][0]);
  }
  return types;
}
