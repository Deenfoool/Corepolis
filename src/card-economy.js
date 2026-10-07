export const STARTING_DECK=[
  'lumbermill','quarry','field','field','house','field','tree','field',
  'quarry','lumbermill','rock','house','field','field','house','island',
  'tree','rock','field','field','house','island','lumbermill','quarry'
];
export function promoteReserve(hand,reserve,limit=5){
  const promoted=[];
  while(hand.length<limit&&reserve.length){const card=reserve.shift();hand.push(card);promoted.push(card);}
  return promoted;
}
export function replacementType(previous,weights,random=Math.random){
  const pool=weights.filter(([type,weight])=>type!==previous&&weight>0);
  const total=pool.reduce((sum,[,weight])=>sum+weight,0);
  if(!total)return previous;
  let choice=random()*total;
  for(const [type,weight] of pool){choice-=weight;if(choice<0)return type;}
  return pool.at(-1)[0];
}
export function hasPlayableCard(cards,{land,millBuilt,millUnlocked,marketUnlocked,ready,canAfford,hasWaterMove}){
  return cards.some(card=>{
    if(!canAfford(card.type))return false;
    if(['pier','island'].includes(card.type))return hasWaterMove(card);
    if(card.type==='lighthouse')return [...land.values()].some(t=>t.type==='empty')||hasWaterMove(card);
    if(card.type==='mill')return millUnlocked&&(millBuilt?ready():[...land.values()].some(t=>t.type==='empty'));
    if(card.type==='clear')return [...land.values()].some(t=>['tree','rock'].includes(t.type));
    if(card.type==='market'&&!marketUnlocked)return false;
    return [...land.values()].some(t=>t.type==='empty'||(['lumbermill','quarry'].includes(card.type)&&t.type===card.type));
  });
}
