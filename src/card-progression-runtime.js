import { CARD_DEFS, DECK_WEIGHTS } from './config.js?v=lowpoly-fields-1';

const STORAGE_KEY='corepolis:card-progression:v1';
const STORAGE_VERSION=1;
const STARTING_CARDS=['house','field','lumbermill','quarry'];
const WORLD_CARDS=['island','tree','rock'];
const BASE_UNLOCKED=[...STARTING_CARDS,...WORLD_CARDS];
const BASE_WEIGHTS={
  field:28,island:18,tree:10,rock:10,clear:5,house:16,
  market:4,pier:4,fishingShop:2,lumbermill:8,quarry:8
};
const UNSPENT_CAPS={fishingShop:1,market:1,pier:2,clear:2};
const RECENT_LIMIT=6;

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for card progression.');
const {state,draw,addCard,renderHand,status,refreshLucide,resetStartingDeck}=runtime;

const RULES={
  clear:{icon:'construction',label:'Бульдозер',hint:'Освойте первое производство ресурсов.',reason:'Первое производство запущено. Бульдозер сносит объекты, сохраняя острова и маяки.',test:()=>productionEvidence('wood')||productionEvidence('stone')},
  pier:{icon:'anchor',label:'Причал',grantFirst:true,hint:'Развитая деревообработка позволит выйти к морю.',reason:'Получена первая древесина. Поселение научилось строить причалы.',test:()=>productionEvidence('wood')},
  mill:{icon:'wind',label:'Мельница',hint:'Несколько связанных полей могут открыть новую сельскохозяйственную постройку.',reason:'Комбо из четырёх полей открыло Мельницу.',test:()=>!!state.unlocks?.mill},
  market:{icon:'store',label:'Рынок',hint:'Развивайте плотный жилой район.',reason:'Связный квартал из шести домов открыл Рынок.',test:()=>!!state.unlocks?.market},
  fishingShop:{icon:'warehouse',label:'Портовый склад',hint:'Сначала поселению нужен настоящий выход к морю.',reason:'Первый причал открыл портовую торговлю и Портовый склад.',test:()=>!!state.unlocks?.fishingShop||boardCount('pier')>0},
  lighthouse:{icon:'scan-line',label:'Маяк',hint:'Особая морская экспедиция может открыть дальнюю навигацию.',reason:'Морская экспедиция открыла Маяк.',test:()=>hasCardAnywhere('lighthouse')||boardCount('lighthouse')>0}
};
const DISCOVERY_ORDER=['mill','market','clear','pier','fishingShop','lighthouse'];

let progress=freshState();
let sessionActive=false;
let seenCardIds=new Set();
let trackerTimer=null;
let evaluateTimer=null;
let unlockQueue=[];
let bannerBusy=false;

function freshState(){return{version:STORAGE_VERSION,unlocked:[...BASE_UNLOCKED],recent:[]};}
function readState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!raw||raw.version!==STORAGE_VERSION)return null;
    const unlocked=new Set(BASE_UNLOCKED);
    for(const type of Array.isArray(raw.unlocked)?raw.unlocked:[])if(CARD_DEFS[type])unlocked.add(type);
    return{
      version:STORAGE_VERSION,
      unlocked:[...unlocked],
      recent:Array.isArray(raw.recent)?raw.recent.map(String).filter(type=>CARD_DEFS[type]).slice(-RECENT_LIMIT):[]
    };
  }catch{return null;}
}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{}}
function isUnlocked(type){return progress.unlocked.includes(type);}

function boardCount(type){
  if(type==='pier')return[...state.waterStructures.values()].filter(item=>item.type==='pier').length;
  let count=0;
  for(const tile of state.land.values())if(tile.type===type)count++;
  return count;
}
function cardCount(type){
  let count=0;
  for(const card of state.hand)if(card.type===type)count++;
  for(const card of state.reserve)if(card.type===type)count++;
  return count;
}
function hasCardAnywhere(type){return cardCount(type)>0||boardCount(type)>0;}
function productionEvidence(resource){
  if((state.resources?.[resource]||0)>0)return true;
  const source=resource==='wood'?'tree':'rock';
  for(const tile of state.land.values())if(tile.type===source&&(tile.resourceSources?.size||0)>0)return true;
  return false;
}

function duplicateMultiplier(type){
  const count=cardCount(type);
  const cap=UNSPENT_CAPS[type]??3;
  if(count>=cap)return 0;
  if(count===0)return 1;
  if(count===cap-1)return .18;
  return .55;
}
function recentMultiplier(type){
  if(progress.recent.at(-1)===type)return .18;
  if(progress.recent.slice(-2).includes(type))return .42;
  if(progress.recent.slice(-4).includes(type))return .68;
  return 1;
}
function usefulnessMultiplier(type){
  const wood=Number(state.resources?.wood)||0;
  const stone=Number(state.resources?.stone)||0;
  const trees=boardCount('tree'),rocks=boardCount('rock'),houses=boardCount('house'),piers=boardCount('pier');
  if(type==='island')return state.land.size>=45?1.45:state.land.size<28?.78:1;
  if(type==='tree')return wood<2?1.35:wood>=7?.62:1;
  if(type==='rock')return stone<2?1.35:stone>=7?.62:1;
  if(type==='house')return wood<2?.48:1;
  if(type==='lumbermill')return trees===0?.18:trees===1?.72:1;
  if(type==='quarry')return rocks===0?.18:rocks===1?.72:1;
  if(type==='clear')return trees+rocks===0?0:1;
  if(type==='market')return houses<2?0:1;
  if(type==='pier')return wood<3?.38:piers>=2?.55:1;
  if(type==='fishingShop')return piers===0?0:houses<2?.38:boardCount('fishingShop')>0?.62:1;
  return 1;
}
function citySourceMultiplier(type){
  let value=1;
  if(type==='field'&&boardCount('mill'))value*=1.18;
  if(type==='house'&&boardCount('market'))value*=1.12;
  if(type==='tree'&&boardCount('lumbermill'))value*=1.12;
  if(type==='rock'&&boardCount('quarry'))value*=1.12;
  if(['island','pier','fishingShop'].includes(type)&&boardCount('pier'))value*=1.14;
  return value;
}
function biomeMultiplier(type){
  const value=window.__corepolisBiomeRuntime?.weightMultiplier?.(type);
  return Number.isFinite(value)&&value>0?value:1;
}
function weightFor(type){
  const base=BASE_WEIGHTS[type]||0;
  if(!base||!isUnlocked(type))return 0;
  const value=base*duplicateMultiplier(type)*recentMultiplier(type)*usefulnessMultiplier(type)*citySourceMultiplier(type)*biomeMultiplier(type);
  return Number.isFinite(value)&&value>0?Math.max(.01,Math.round(value*100)/100):0;
}

function installLiveWeights(){
  const known=new Map(DECK_WEIGHTS.map(entry=>[entry[0],entry]));
  for(const type of Object.keys(BASE_WEIGHTS)){
    let entry=known.get(type);
    if(!entry){entry=[type,0];DECK_WEIGHTS.push(entry);}
    Object.defineProperty(entry,1,{configurable:true,enumerable:true,get:()=>weightFor(type),set:()=>{}});
  }
}

function primeSeenCards(){seenCardIds=new Set([...state.hand,...state.reserve].map(card=>card.id));}
function trackNewCards(){
  if(!sessionActive)return;
  let changed=false;
  for(const card of [...state.hand,...state.reserve]){
    if(seenCardIds.has(card.id))continue;
    seenCardIds.add(card.id);
    progress.recent.push(card.type);
    changed=true;
  }
  if(progress.recent.length>RECENT_LIMIT)progress.recent=progress.recent.slice(-RECENT_LIMIT);
  if(changed)persist();
}
function inferLegacyUnlocks(){
  const next=new Set(progress.unlocked);
  for(const card of [...state.hand,...state.reserve])next.add(card.type);
  if(state.unlocks?.mill)next.add('mill');
  if(state.unlocks?.market)next.add('market');
  if(state.unlocks?.fishingShop)next.add('fishingShop');
  if(boardCount('pier'))next.add('pier');
  if(boardCount('lighthouse'))next.add('lighthouse');
  if(productionEvidence('wood')||productionEvidence('stone'))next.add('clear');
  if(productionEvidence('wood'))next.add('pier');
  progress.unlocked=[...next];
}

function grantFirstCopy(type){
  if(!sessionActive||hasCardAnywhere(type))return;
  addCard(draw(type),{priority:true});
  renderHand();status();
}
function ensureUnlockBanner(){
  let root=document.querySelector('#card-unlock-banner');
  if(root)return root;
  root=document.createElement('aside');
  root.id='card-unlock-banner';root.className='card-unlock-banner';root.setAttribute('aria-live','polite');
  document.body.appendChild(root);return root;
}
function queueUnlockBanner(type){unlockQueue.push(type);showNextUnlockBanner();}
function showNextUnlockBanner(){
  if(bannerBusy||!unlockQueue.length)return;
  bannerBusy=true;
  const rule=RULES[unlockQueue.shift()];
  const root=ensureUnlockBanner();
  root.innerHTML=`<span class="card-unlock-icon"><i data-lucide="${rule.icon}"></i></span><span><small>НОВАЯ КАРТА ОТКРЫТА</small><strong>${rule.label}</strong><em>${rule.reason}</em></span>`;
  root.classList.remove('show');void root.offsetWidth;root.classList.add('show');refreshLucide?.();
  setTimeout(()=>{root.classList.remove('show');setTimeout(()=>{bannerBusy=false;showNextUnlockBanner();},180);},2600);
}
function unlock(type,{silent=false}={}){
  if(isUnlocked(type))return false;
  progress.unlocked.push(type);progress.unlocked=[...new Set(progress.unlocked)];persist();
  if(RULES[type]?.grantFirst)grantFirstCopy(type);
  renderDiscovery();
  window.dispatchEvent(new CustomEvent('corepolis:card-unlocked',{detail:{type}}));
  if(!silent)queueUnlockBanner(type);
  return true;
}
function evaluateUnlocks({silent=false}={}){
  if(!sessionActive||state.actionPending||state.researchChoiceOpen||state.gameOver)return;
  for(const type of DISCOVERY_ORDER){
    if(isUnlocked(type))continue;
    let ready=false;try{ready=!!RULES[type]?.test?.();}catch{}
    if(ready)unlock(type,{silent});
  }
}

function normalizeStartingHand(){
  resetStartingDeck();
  for(const card of state.hand)state.knownHandCardIds?.add?.(card.id);
  renderHand();status();
}

function discoveryCard(type){
  const def=CARD_DEFS[type],rule=RULES[type];
  const base=STARTING_CARDS.includes(type),open=base||isUnlocked(type);
  const label=base?'БАЗОВАЯ':open?'ОТКРЫТА':'НЕИЗВЕСТНО';
  const text=base?'Доступна с первого хода.':open?rule.reason:rule.hint;
  return`<article class="card-discovery-item ${base?'base':open?'unlocked':'locked'}"><div class="card-discovery-icon"><i data-lucide="${open?(def?.icon||rule?.icon||'sparkles'):'lock-keyhole'}"></i></div><div><small>${label}</small><strong>${def?.name||rule?.label||type}</strong><p>${text}</p></div></article>`;
}
function ensureDiscoveryUi(){
  const actions=document.querySelector('.pause-actions');
  let button=document.querySelector('#pause-card-discovery');
  if(actions&&!button){
    button=document.createElement('button');button.id='pause-card-discovery';button.className='pause-action';button.type='button';
    button.innerHTML='<i data-lucide="network"></i><span>Открытия</span><small id="card-discovery-count"></small>';
    const mainMenu=document.querySelector('#pause-main-menu');
    if(mainMenu)mainMenu.insertAdjacentElement('beforebegin',button);else actions.appendChild(button);
    button.addEventListener('click',openDiscovery);
  }
  let root=document.querySelector('#card-discovery');
  if(!root){
    root=document.createElement('section');root.id='card-discovery';root.className='card-discovery';root.setAttribute('aria-hidden','true');
    root.innerHTML=`<div class="card-discovery-book panel" role="dialog" aria-modal="true" aria-labelledby="card-discovery-title"><header><div><div class="eyebrow">COREPOLIS · РАЗВИТИЕ</div><h2 id="card-discovery-title">Открытия города</h2><p>Новые постройки появляются из действий на острове, а не из общего случайного пула.</p></div><button id="card-discovery-close" type="button" aria-label="Закрыть"><i data-lucide="x"></i></button></header><div class="card-discovery-world"><i data-lucide="map"></i><span><b>Карты мира доступны всегда</b><small>Расширение территории · Лес · Камни</small></span></div><div id="card-discovery-grid" class="card-discovery-grid"></div></div>`;
    document.body.appendChild(root);root.querySelector('#card-discovery-close')?.addEventListener('click',closeDiscovery);root.addEventListener('click',event=>{if(event.target===root)closeDiscovery();});
  }
  renderDiscovery();refreshLucide?.();return root;
}
function renderDiscovery(){
  const root=document.querySelector('#card-discovery'),grid=root?.querySelector('#card-discovery-grid');
  if(grid)grid.innerHTML=[...STARTING_CARDS,...DISCOVERY_ORDER].map(discoveryCard).join('');
  const count=document.querySelector('#card-discovery-count');if(count)count.textContent=`${DISCOVERY_ORDER.filter(isUnlocked).length}/${DISCOVERY_ORDER.length}`;
  refreshLucide?.();
}
function openDiscovery(){const root=ensureDiscoveryUi();renderDiscovery();root.classList.add('open');root.setAttribute('aria-hidden','false');}
function closeDiscovery(){const root=document.querySelector('#card-discovery');root?.classList.remove('open');root?.setAttribute('aria-hidden','true');}
function ensureStyle(){
  if(document.querySelector('link[href*="card-progression.css"]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='./card-progression.css?v=2';document.head.appendChild(link);
}
function resetProgress(){progress=freshState();seenCardIds=new Set();unlockQueue=[];bannerBusy=false;closeDiscovery();document.querySelector('#card-unlock-banner')?.remove();try{localStorage.removeItem(STORAGE_KEY);}catch{}renderDiscovery();}

installLiveWeights();ensureStyle();ensureDiscoveryUi();

window.addEventListener('corepolis:start',event=>{
  sessionActive=false;closeDiscovery();
  if(event.detail?.mode==='new'){
    progress=freshState();persist();normalizeStartingHand();
  }else progress=readState()||freshState();
});
window.addEventListener('corepolis:session-ready',event=>{
  const continuing=event.detail?.mode==='continue';
  const stored=continuing?readState():progress;progress=stored||freshState();
  if(continuing&&!stored)inferLegacyUnlocks();
  sessionActive=true;primeSeenCards();evaluateUnlocks({silent:continuing&&!stored});persist();renderDiscovery();
  if(!trackerTimer)trackerTimer=setInterval(trackNewCards,120);
  if(!evaluateTimer)evaluateTimer=setInterval(()=>evaluateUnlocks(),160);
});
window.addEventListener('corepolis:save-changed',event=>{if(event.detail?.hasSave===false){sessionActive=false;resetProgress();}});
window.addEventListener('keydown',event=>{if(document.querySelector('#card-discovery.open')&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeDiscovery();}},{capture:true});
window.addEventListener('pagehide',()=>{if(sessionActive){trackNewCards();persist();}});

window.__corepolisCardProgression={
  get:()=>JSON.parse(JSON.stringify(progress)),isUnlocked,weightFor,
  weights:()=>Object.fromEntries(Object.keys(BASE_WEIGHTS).map(type=>[type,weightFor(type)])),
  evaluate:evaluateUnlocks,open:openDiscovery,close:closeDiscovery
};
