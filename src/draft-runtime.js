const STORAGE_KEY='corepolis:draft:v1';
const STORAGE_VERSION=1;
const DRAFT_LEVELS=[1,2,3];
const RANK_NAMES={1:'Деревня',2:'Городок',3:'Город'};

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for card drafting.');

const {state,CARD_DEFS,draw,addCard,renderHand,status,refreshLucide}=runtime;
let draft=freshState();
let sessionActive=false;
let pollTimer=null;
let openingTimer=null;

function freshState(){
  return{version:STORAGE_VERSION,completed:[],pending:null};
}

function eligibleType(type){
  const progression=window.__corepolisCardProgression;
  if(progression?.isUnlocked)return!!progression.isUnlocked(type);
  return['island','field','house','tree','rock','lumbermill','quarry'].includes(type);
}

function normalizeCard(value){
  if(!value||!Number.isInteger(value.id)||!CARD_DEFS[value.type])return null;
  const card={id:value.id,type:value.type};
  if(value.type==='island'){
    if(!value.fragment||!Array.isArray(value.fragment.cells)||!value.fragment.cells.length)return null;
    card.rotation=Number.isInteger(value.rotation)?value.rotation:0;
    card.fragment={
      shapeId:String(value.fragment.shapeId||'custom'),
      label:String(value.fragment.label||'Фрагмент'),
      cells:value.fragment.cells.map(cell=>({
        x:Number.isInteger(cell?.x)?cell.x:0,
        z:Number.isInteger(cell?.z)?cell.z:0,
        content:cell?.content==='tree'||cell?.content==='rock'?cell.content:null
      }))
    };
  }
  return card;
}

function readState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!raw||raw.version!==STORAGE_VERSION)return null;
    const completed=Array.isArray(raw.completed)
      ?raw.completed.filter(level=>DRAFT_LEVELS.includes(level))
      :[];
    let pending=null;
    if(DRAFT_LEVELS.includes(raw.pending?.level)&&Array.isArray(raw.pending?.options)){
      const options=raw.pending.options.map(normalizeCard).filter(card=>card&&eligibleType(card.type));
      if(options.length===3)pending={level:raw.pending.level,options};
    }
    return{version:STORAGE_VERSION,completed:[...new Set(completed)],pending};
  }catch{
    return null;
  }
}

function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(draft));}catch{}
}

function resetDraft(){
  draft=freshState();
  clearTimeout(openingTimer);
  openingTimer=null;
  hideDraft();
  try{localStorage.removeItem(STORAGE_KEY);}catch{}
}

function progressionLevel(){
  return Number(window.__corepolisProgressionRuntime?.get?.().level)||0;
}

function costMarkup(type){
  const cost=CARD_DEFS[type]?.cost||{};
  const parts=[];
  if(cost.wood)parts.push(`<span><i data-lucide="trees"></i>${cost.wood}</span>`);
  if(cost.stone)parts.push(`<span><i data-lucide="mountain"></i>${cost.stone}</span>`);
  return parts.length?parts.join(''):'<span class="free"><i data-lucide="sparkles"></i>БЕСПЛАТНО</span>';
}

function islandDetail(card){
  if(card.type!=='island')return'';
  const tree=card.fragment.cells.filter(cell=>cell.content==='tree').length;
  const rock=card.fragment.cells.filter(cell=>cell.content==='rock').length;
  const extras=[];
  if(tree)extras.push(`лес ×${tree}`);
  if(rock)extras.push(`камни ×${rock}`);
  return`${card.fragment.label} · ${card.fragment.cells.length} кл.${extras.length?` · ${extras.join(' · ')}`:''}`;
}

function optionMarkup(card){
  const def=CARD_DEFS[card.type];
  const detail=islandDetail(card);
  return`
    <button type="button" class="draft-option tone-${def.tone||'green'}" data-draft-card="${card.id}">
      <div class="draft-option-head">
        <span class="draft-option-icon"><i data-lucide="${def.icon||'sparkles'}"></i></span>
        <span><small>${def.category||'КАРТА'}</small><strong>${def.name}</strong></span>
      </div>
      <p>${def.description||''}</p>
      ${detail?`<div class="draft-option-detail">${detail}</div>`:''}
      <div class="draft-option-foot"><span>ВЗЯТЬ КАРТУ</span><div>${costMarkup(card.type)}</div></div>
    </button>`;
}

function ensureUi(){
  let root=document.querySelector('#draft-choice');
  if(root)return root;
  root=document.createElement('section');
  root.id='draft-choice';
  root.className='draft-choice';
  root.setAttribute('aria-hidden','true');
  root.innerHTML=`
    <div class="draft-choice-card panel" role="dialog" aria-modal="true" aria-labelledby="draft-choice-title">
      <div class="draft-choice-mark"><i data-lucide="layers-3"></i></div>
      <div class="eyebrow">БОНУС РАЗВИТИЯ</div>
      <h2 id="draft-choice-title">Выберите карту</h2>
      <p id="draft-choice-copy"></p>
      <div id="draft-options" class="draft-options"></div>
      <div class="draft-choice-note"><i data-lucide="mouse-pointer-click"></i><span>Можно взять только одну карту. Две остальные будут сброшены.</span></div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener('click',event=>{
    const option=event.target.closest?.('[data-draft-card]');
    if(!option)return;
    chooseCard(Number(option.dataset.draftCard));
  });
  refreshLucide?.();
  return root;
}

function renderDraft(){
  if(!draft.pending)return;
  const root=ensureUi();
  const copy=root.querySelector('#draft-choice-copy');
  const options=root.querySelector('#draft-options');
  const rank=RANK_NAMES[draft.pending.level]||'Новый статус';
  if(copy)copy.textContent=`Статус «${rank}» открыт. Выберите одну из трёх уже открытых карт, которая лучше подходит вашему острову.`;
  if(options)options.innerHTML=draft.pending.options.map(optionMarkup).join('');
  root.classList.add('open');
  root.setAttribute('aria-hidden','false');
  state.inputLocked=true;
  refreshLucide?.();
}

function hideDraft(){
  const root=document.querySelector('#draft-choice');
  root?.classList.remove('open');
  root?.setAttribute('aria-hidden','true');
}

function createOptions(){
  const options=[];
  const types=new Set();
  let attempts=0;
  while(options.length<3&&attempts<30){
    attempts++;
    const card=draw();
    if(!eligibleType(card.type)||types.has(card.type))continue;
    types.add(card.type);
    options.push(card);
  }
  if(options.length<3){
    for(const type of ['island','field','house','tree','rock','lumbermill','quarry','clear','pier','market','fishingShop']){
      if(options.length>=3)break;
      if(types.has(type)||!CARD_DEFS[type]||!eligibleType(type))continue;
      types.add(type);
      options.push(draw(type));
    }
  }
  return options.slice(0,3);
}

function createDraft(level){
  if(draft.pending||draft.completed.includes(level)||!DRAFT_LEVELS.includes(level))return;
  const options=createOptions();
  if(options.length!==3)return;
  draft.pending={level,options};
  persist();
  state.inputLocked=true;
  window.__corepolisSaveRuntime?.writeCurrentSave?.(true);
  clearTimeout(openingTimer);
  openingTimer=setTimeout(()=>{
    openingTimer=null;
    if(draft.pending)renderDraft();
  },350);
}

function chooseCard(cardId){
  const pending=draft.pending;
  if(!pending)return;
  const chosen=pending.options.find(card=>card.id===cardId);
  if(!chosen)return;

  addCard(chosen,{priority:true});
  if(!draft.completed.includes(pending.level))draft.completed.push(pending.level);
  draft.pending=null;
  persist();
  hideDraft();
  state.inputLocked=false;
  renderHand();
  status();
  window.__corepolisSaveRuntime?.writeCurrentSave?.(true);
  syncDrafts();
}

function modalBusy(){
  return!!(
    document.querySelector('#capital-finale.open')||
    document.querySelector('#marine-choice:not(.hidden)')||
    document.querySelector('#pause-menu.open')||
    document.querySelector('#card-discovery.open')||
    document.querySelector('#combo-encyclopedia.open')||
    document.querySelector('#tutorial-overlay.open')
  );
}

function syncDrafts(){
  if(!sessionActive)return;
  if(draft.pending){
    if(!document.querySelector('#draft-choice.open')&&!modalBusy())renderDraft();
    return;
  }
  if(modalBusy())return;
  const level=progressionLevel();
  const next=DRAFT_LEVELS.find(candidate=>candidate<=level&&!draft.completed.includes(candidate));
  if(next)createDraft(next);
}

window.addEventListener('corepolis:start',()=>{
  sessionActive=false;
  clearTimeout(openingTimer);
  openingTimer=null;
  hideDraft();
});

window.addEventListener('corepolis:session-ready',event=>{
  const continuing=event.detail?.mode==='continue';
  const stored=continuing?readState():null;
  draft=stored||freshState();

  if(continuing&&!stored){
    const level=progressionLevel();
    draft.completed=DRAFT_LEVELS.filter(candidate=>candidate<=level);
  }
  if(!continuing)persist();

  sessionActive=true;
  if(draft.pending)state.inputLocked=true;
  setTimeout(syncDrafts,250);
  if(!pollTimer)pollTimer=setInterval(syncDrafts,300);
});

window.addEventListener('corepolis:save-changed',event=>{
  if(event.detail?.hasSave===false){
    sessionActive=false;
    resetDraft();
  }
});

window.addEventListener('keydown',event=>{
  if(!draft.pending||!document.querySelector('#draft-choice.open'))return;
  if(event.key==='Escape'){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},{capture:true});

window.addEventListener('pagehide',()=>{if(sessionActive)persist();});

window.__corepolisDraftRuntime={
  get:()=>JSON.parse(JSON.stringify(draft)),
  sync:syncDrafts,
  reset:resetDraft
};

ensureUi();
