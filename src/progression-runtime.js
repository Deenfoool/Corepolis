const STORAGE_KEY='corepolis:progression:v1';
const STORAGE_VERSION=1;

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for progression.');

const {state,draw,addCard,renderHand,status,refreshLucide}=runtime;

const RANKS=[
  {id:'settlement',name:'Поселение',short:'ПОСЕЛЕНИЕ'},
  {
    id:'village',name:'Деревня',short:'ДЕРЕВНЯ',
    reward:[['island',1],['field',1]],
    rewardText:'+1 фрагмент территории · +1 поле'
  },
  {
    id:'town',name:'Городок',short:'ГОРОДОК',
    reward:[['island',2],['house',1]],
    rewardText:'+2 фрагмента территории · +1 дом'
  },
  {
    id:'city',name:'Город',short:'ГОРОД',
    reward:[['lighthouse',1],['island',2]],
    rewardText:'+1 маяк · +2 фрагмента территории'
  },
  {
    id:'capital',name:'Островная столица',short:'СТОЛИЦА',
    reward:[['island',3],['field',2]],
    rewardText:'+3 фрагмента территории · +2 поля'
  }
];

function freshState(){
  return{
    version:STORAGE_VERSION,
    level:0,
    rewarded:[],
    production:{wood:false,stone:false},
    capitalPresented:false
  };
}

function readState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!raw||raw.version!==STORAGE_VERSION)return freshState();
    return{
      version:STORAGE_VERSION,
      level:Math.max(0,Math.min(RANKS.length-1,Number.isInteger(raw.level)?raw.level:0)),
      rewarded:Array.isArray(raw.rewarded)?raw.rewarded.filter(Number.isInteger):[],
      production:{wood:!!raw.production?.wood,stone:!!raw.production?.stone},
      capitalPresented:!!raw.capitalPresented
    };
  }catch{
    return freshState();
  }
}

let progress=readState();
let sessionActive=false;
let pollTimer=null;
let milestoneLocked=false;
let lastRenderSignature='';

function persist(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
}
function resetProgress(){
  progress=freshState();
  localStorage.removeItem(STORAGE_KEY);
  lastRenderSignature='';
  renderProgress();
}

function countTiles(type){
  let count=0;
  for(const tile of state.land.values())if(tile.type===type)count++;
  return count;
}
function hasTile(type){
  for(const tile of state.land.values())if(tile.type===type)return true;
  return false;
}
function productionEvidence(type){
  if(type==='wood'){
    if((state.resources.wood||0)>0||hasTile('lumbermill'))return true;
    for(const tile of state.land.values())if(tile.type==='tree'&&(tile.resourceSources?.size||0)>0)return true;
  }else{
    if((state.resources.stone||0)>0||hasTile('quarry'))return true;
    for(const tile of state.land.values())if(tile.type==='rock'&&(tile.resourceSources?.size||0)>0)return true;
  }
  return false;
}

function metrics(){
  if(productionEvidence('wood'))progress.production.wood=true;
  if(productionEvidence('stone'))progress.production.stone=true;
  return{
    land:state.land.size,
    houses:countTiles('house'),
    marketBuilt:hasTile('market'),
    lighthouseBuilt:hasTile('lighthouse'),
    fishingShopBuilt:hasTile('fishingShop'),
    piers:[...state.waterStructures.values()].filter(item=>item.type==='pier').length,
    routes:state.seaRoutes.size,
    harvests:Math.max(0,(state.millLevel||1)-1),
    millUnlocked:!!state.unlocks.mill,
    marketUnlocked:!!state.unlocks.market,
    marineUnlocked:!!state.unlocks.marine,
    woodProduction:progress.production.wood,
    stoneProduction:progress.production.stone
  };
}

function req(label,current,target,done=current>=target){
  return{label,current,target,done};
}
function boolReq(label,done){
  return{label,current:done?1:0,target:1,done:!!done};
}
function requirementsFor(level,m){
  if(level===1)return[
    req('Земля',m.land,20),
    req('Дома',m.houses,3),
    boolReq('Открыть мельницу',m.millUnlocked)
  ];
  if(level===2)return[
    req('Земля',m.land,26),
    req('Дома',m.houses,6),
    boolReq('Открыть рынок',m.marketUnlocked),
    req('Большой урожай',m.harvests,1),
    boolReq('Запустить производство',m.woodProduction||m.stoneProduction)
  ];
  if(level===3)return[
    req('Земля',m.land,34),
    boolReq('Построить рынок',m.marketBuilt),
    req('Большие урожаи',m.harvests,2),
    boolReq('Добывать древесину',m.woodProduction),
    boolReq('Добывать камень',m.stoneProduction),
    req('Причалы',m.piers,1)
  ];
  if(level===4)return[
    req('Земля',m.land,42),
    req('Дома',m.houses,10),
    req('Большие урожаи',m.harvests,3),
    boolReq('Рыболовный магазин',m.fishingShopBuilt),
    req('Морские маршруты',m.routes,1),
    boolReq('Маяк',m.lighthouseBuilt)
  ];
  return[];
}

function completion(requirements){
  if(!requirements.length)return 1;
  return requirements.reduce((sum,item)=>sum+Math.min(1,item.current/item.target),0)/requirements.length;
}

function ensureUi(){
  const objective=document.querySelector('.objective');
  if(objective&&!objective.querySelector('#city-progression')){
    const root=document.createElement('section');
    root.id='city-progression';
    root.className='city-progression';
    root.innerHTML=`
      <div class="city-progression-head">
        <span>СТАТУС ГОРОДА</span><b id="city-rank"></b>
      </div>
      <div class="city-progression-track"><i id="city-progress-fill"></i></div>
      <p id="city-next-copy"></p>
      <div id="city-requirements" class="city-requirements"></div>`;
    objective.appendChild(root);
  }

  if(!document.querySelector('#milestone-banner')){
    const banner=document.createElement('div');
    banner.id='milestone-banner';
    banner.className='milestone-banner';
    banner.setAttribute('aria-live','polite');
    banner.innerHTML=`
      <div class="milestone-mark"><i data-lucide="crown"></i></div>
      <div><span>НОВЫЙ СТАТУС</span><strong id="milestone-title"></strong><small id="milestone-reward"></small></div>`;
    document.body.appendChild(banner);
  }

  if(!document.querySelector('#capital-finale')){
    const finale=document.createElement('section');
    finale.id='capital-finale';
    finale.className='capital-finale';
    finale.setAttribute('aria-hidden','true');
    finale.innerHTML=`
      <div class="capital-card panel" role="dialog" aria-modal="true" aria-labelledby="capital-title">
        <div class="capital-crown"><i data-lucide="crown"></i></div>
        <div class="eyebrow">COREPOLIS</div>
        <h2 id="capital-title">Островная столица</h2>
        <p>Небольшой берег превратился в самостоятельный город с хозяйством, производством и морской связью.</p>
        <div id="capital-stats" class="capital-stats"></div>
        <button id="capital-continue" type="button"><i data-lucide="hammer"></i><span>Продолжить строительство</span></button>
      </div>`;
    document.body.appendChild(finale);
    finale.querySelector('#capital-continue')?.addEventListener('click',()=>{
      finale.classList.remove('open');
      finale.setAttribute('aria-hidden','true');
      state.inputLocked=false;
    });
  }
  refreshLucide?.();
}

function renderProgress(){
  ensureUi();
  const rank=RANKS[progress.level];
  const nextLevel=Math.min(RANKS.length-1,progress.level+1);
  const next=RANKS[nextLevel];
  const m=metrics();
  const requirements=progress.level>=RANKS.length-1?[]:requirementsFor(nextLevel,m);
  const signature=JSON.stringify({level:progress.level,requirements,production:progress.production});
  if(signature===lastRenderSignature)return;
  lastRenderSignature=signature;

  const rankEl=document.querySelector('#city-rank');
  const fill=document.querySelector('#city-progress-fill');
  const copy=document.querySelector('#city-next-copy');
  const list=document.querySelector('#city-requirements');
  if(rankEl)rankEl.textContent=rank.short;
  if(fill)fill.style.width=`${Math.round(completion(requirements)*100)}%`;

  if(progress.level>=RANKS.length-1){
    if(copy)copy.textContent='Максимальный статус достигнут. Город можно продолжать развивать без ограничений.';
    if(list)list.innerHTML='<div class="city-requirement done"><i data-lucide="crown"></i><span>Островная столица построена</span><b>✓</b></div>';
  }else{
    if(copy)copy.textContent=`Следующий статус — ${next.name}. Выполните все условия:`;
    if(list)list.innerHTML=requirements.map(item=>`
      <div class="city-requirement ${item.done?'done':''}">
        <i data-lucide="${item.done?'check':'circle'}"></i>
        <span>${item.label}</span>
        <b>${item.target===1?(item.done?'✓':'—'):`${Math.min(item.current,item.target)} / ${item.target}`}</b>
      </div>`).join('');
  }
  refreshLucide?.();
}

function grantReward(level){
  if(progress.rewarded.includes(level))return;
  const rank=RANKS[level];
  for(const [type,count] of rank.reward||[]){
    for(let i=0;i<count;i++)addCard(draw(type),{priority:i===0&&type==='island'});
  }
  progress.rewarded.push(level);
  renderHand();
  status();
}

function showMilestone(level){
  ensureUi();
  const rank=RANKS[level];
  const banner=document.querySelector('#milestone-banner');
  const title=document.querySelector('#milestone-title');
  const reward=document.querySelector('#milestone-reward');
  if(!banner)return;
  if(title)title.textContent=rank.name;
  if(reward)reward.textContent=rank.rewardText||'';
  banner.classList.remove('show');
  void banner.offsetWidth;
  banner.classList.add('show');
  setTimeout(()=>banner.classList.remove('show'),2600);
}

function showCapitalFinale(m){
  if(progress.capitalPresented)return;
  progress.capitalPresented=true;
  persist();
  const finale=document.querySelector('#capital-finale');
  const stats=document.querySelector('#capital-stats');
  if(stats)stats.innerHTML=`
    <div><span>Земля</span><b>${m.land}</b></div>
    <div><span>Дома</span><b>${m.houses}</b></div>
    <div><span>Урожаи</span><b>${m.harvests}</b></div>
    <div><span>Маршруты</span><b>${m.routes}</b></div>`;
  if(finale){
    state.inputLocked=true;
    finale.classList.add('open');
    finale.setAttribute('aria-hidden','false');
  }
}

function evaluate(){
  if(!sessionActive||milestoneLocked)return;
  const m=metrics();
  persist();
  renderProgress();

  const nextLevel=progress.level+1;
  if(nextLevel>=RANKS.length)return;
  const requirements=requirementsFor(nextLevel,m);
  if(!requirements.length||!requirements.every(item=>item.done))return;

  milestoneLocked=true;
  progress.level=nextLevel;
  grantReward(nextLevel);
  persist();
  renderProgress();
  showMilestone(nextLevel);

  if(nextLevel===RANKS.length-1)setTimeout(()=>showCapitalFinale(metrics()),900);
  setTimeout(()=>{milestoneLocked=false;evaluate();},2800);
}

window.addEventListener('corepolis:start',event=>{
  if(event.detail?.mode!=='continue'){
    progress=freshState();
    persist();
  }else{
    progress=readState();
  }
  lastRenderSignature='';
});
window.addEventListener('corepolis:session-ready',()=>{
  sessionActive=true;
  ensureUi();
  renderProgress();
  evaluate();
  if(!pollTimer)pollTimer=setInterval(evaluate,450);
});
window.addEventListener('corepolis:save-changed',event=>{
  if(event.detail?.hasSave===false){
    sessionActive=false;
    resetProgress();
  }
});
window.addEventListener('pagehide',()=>{if(sessionActive)persist();});

window.__corepolisProgressionRuntime={
  get:()=>JSON.parse(JSON.stringify(progress)),
  evaluate,
  reset:resetProgress
};

ensureUi();
renderProgress();
