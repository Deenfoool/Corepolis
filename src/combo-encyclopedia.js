const STORAGE_KEY='corepolis:combo-encyclopedia:v1';
const STORAGE_VERSION=1;

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for combo encyclopedia.');

const {state,refreshLucide,toast}=runtime;
let sessionActive=false;
let discovered=readDiscoveries();
let pollTimer=null;

const ENTRIES=[
  {
    id:'field-quartet',name:'Квартет полей',icon:'wheat',category:'ФЕРМА',
    recipe:'Соедините по сторонам 4 части поля в одну связную группу.',
    reward:'+120 очков · +1 карта · открывает Мельницу',
    hint:'Найдите способ объединить несколько полей в одно фермерское комбо.',
    unlocked:()=>!!state.unlocks.mill
  },
  {
    id:'mill-harvest',name:'Большой урожай',icon:'wind',category:'ФЕРМА',
    recipe:'Разместите по 1–4 связанных поля с каждой стороны Мельницы (до 16), затем замените её новой картой «Мельница».',
    reward:'1 бонусная карта за поле · до +4 карт за комбо · +1 комбо',
    hint:'Зрелые поля вокруг Мельницы могут запустить новый цикл урожая.',
    unlocked:()=>Math.max(1,state.millLevel||1)>1
  },
  {
    id:'housing',name:'Жилой квартал',icon:'house',category:'ГОРОД',
    recipe:'Соедините по сторонам 6 домов в один связный жилой квартал.',
    reward:'открывает Рынок и добавляет его карту в колоду',
    hint:'Большая связная группа домов открывает следующую городскую постройку.',
    unlocked:()=>!!state.unlocks.market
  },
  {
    id:'market-square',name:'Рыночная площадь',icon:'store',category:'ГОРОД',
    recipe:'Поставьте Рынок так, чтобы рядом с ним было минимум 2 дома.',
    reward:'45 очков + 45 за каждый соседний дом · при 2+ домах +1 карта',
    hint:'Рынок работает лучше внутри плотного жилого района.',
    unlocked:()=>hasStrongMarket()
  },
  {
    id:'wood-chain',name:'Лесная цепочка',icon:'trees',category:'ПРОИЗВОДСТВО',
    recipe:'Поставьте Лесопилку рядом с лесом. Повторная обработка того же дерева завершает вырубку.',
    reward:'древесина · очки за истощение · до 2 бонусных карт за крупную обработку',
    hint:'Одно дерево можно обработать больше одного раза.',
    unlocked:()=>productionEvidence('wood')
  },
  {
    id:'stone-chain',name:'Каменная цепочка',icon:'pickaxe',category:'ПРОИЗВОДСТВО',
    recipe:'Поставьте Каменоломню рядом с камнями. Повторная обработка той же залежи завершает добычу.',
    reward:'камень · очки за истощение · до 2 бонусных карт за крупную обработку',
    hint:'Каменные залежи раскрывают награду после повторной добычи.',
    unlocked:()=>productionEvidence('stone')
  },
  {
    id:'sea-route',name:'Морской маршрут',icon:'route',category:'МОРЕ',
    recipe:'Развивайте берег и создайте два причала, которые игра сможет связать морским маршрутом.',
    reward:'+125 очков · +2 карты · +1 комбо',
    hint:'Несколько причалов могут превратить берег в связанную морскую сеть.',
    unlocked:()=>state.seaRoutes.size>0
  },
  {
    id:'port-quarter',name:'Портовый квартал',icon:'warehouse',category:'МОРЕ',
    recipe:'Поставьте Портовый склад рядом хотя бы с 1 причалом и минимум 2 домами.',
    reward:'+3 карты · +1 комбо · усиленный счёт за соседние дома и причалы',
    hint:'Портовый склад особенно силён между портом и жилым районом.',
    unlocked:()=>hasPortQuarter()
  }
];

function readDiscoveries(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!raw||raw.version!==STORAGE_VERSION||!Array.isArray(raw.discovered))return new Set();
    return new Set(raw.discovered.map(String));
  }catch{
    return new Set();
  }
}

function persist(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      version:STORAGE_VERSION,
      discovered:[...discovered]
    }));
  }catch{}
}

function nearby(tile,type,radius=1){
  let count=0;
  for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){
    if(!dx&&!dz)continue;
    if(state.land.get(`${tile.x+dx},${tile.z+dz}`)?.type===type)count++;
  }
  return count;
}

function nearbyPiers(tile,radius=1){
  let count=0;
  for(const structure of state.waterStructures.values()){
    if(structure.type!=='pier')continue;
    if(Math.max(Math.abs(structure.x-tile.x),Math.abs(structure.z-tile.z))<=radius)count++;
  }
  return count;
}

function hasStrongMarket(){
  for(const tile of state.land.values()){
    if(tile.type==='market'&&nearby(tile,'house')>=2)return true;
  }
  return false;
}

function hasPortQuarter(){
  for(const tile of state.land.values()){
    if(tile.type!=='fishingShop')continue;
    if(nearby(tile,'house')>=2&&nearbyPiers(tile)>=1)return true;
  }
  return false;
}

function productionEvidence(resource){
  if((state.resources?.[resource]||0)>0)return true;
  const producer=resource==='wood'?'lumbermill':'quarry';
  const source=resource==='wood'?'tree':'rock';
  let hasProducer=false;
  for(const tile of state.land.values()){
    if(tile.type===producer)hasProducer=true;
    if(tile.type===source&&(tile.resourceSources?.size||0)>0)return true;
  }
  return hasProducer&&false;
}

function ensureUi(){
  let button=document.querySelector('#pause-encyclopedia');
  const actions=document.querySelector('.pause-actions');
  if(actions&&!button){
    button=document.createElement('button');
    button.id='pause-encyclopedia';
    button.className='pause-action';
    button.type='button';
    button.innerHTML=`<i data-lucide="book-open"></i><span>Комбо</span><small id="combo-book-count"></small>`;
    const mainMenu=document.querySelector('#pause-main-menu');
    if(mainMenu)mainMenu.insertAdjacentElement('beforebegin',button);
    else actions.appendChild(button);
    button.addEventListener('click',openBook);
  }

  let root=document.querySelector('#combo-encyclopedia');
  if(!root){
    root=document.createElement('section');
    root.id='combo-encyclopedia';
    root.className='combo-encyclopedia';
    root.setAttribute('aria-hidden','true');
    root.innerHTML=`
      <div class="combo-book panel" role="dialog" aria-modal="true" aria-labelledby="combo-book-title">
        <header class="combo-book-head">
          <div>
            <div class="eyebrow">COREPOLIS · ЗНАНИЯ</div>
            <h2 id="combo-book-title">Энциклопедия комбо</h2>
            <p>Открывайте реальные игровые сочетания. Найденные рецепты сохраняются между забегами.</p>
          </div>
          <button id="combo-book-close" type="button" aria-label="Закрыть"><i data-lucide="x"></i></button>
        </header>
        <div class="combo-book-progress">
          <span>ОТКРЫТО</span><b id="combo-book-progress-label"></b>
          <div><i id="combo-book-progress-fill"></i></div>
        </div>
        <div id="combo-book-grid" class="combo-book-grid"></div>
      </div>`;
    document.body.appendChild(root);
    root.querySelector('#combo-book-close')?.addEventListener('click',closeBook);
    root.addEventListener('click',event=>{if(event.target===root)closeBook();});
  }
  render();
  refreshLucide?.();
  return root;
}

function entryMarkup(entry){
  const known=discovered.has(entry.id);
  if(!known){
    return`
      <article class="combo-entry locked">
        <div class="combo-entry-icon"><i data-lucide="lock-keyhole"></i></div>
        <div class="combo-entry-copy">
          <small>${entry.category}</small><h3>${entry.name}</h3>
          <p>${entry.hint}</p>
          <div class="combo-entry-locked"><i data-lucide="eye-off"></i><span>Точный рецепт скрыт до первого открытия</span></div>
        </div>
      </article>`;
  }
  return`
    <article class="combo-entry discovered">
      <div class="combo-entry-icon"><i data-lucide="${entry.icon}"></i></div>
      <div class="combo-entry-copy">
        <small>${entry.category}</small><h3>${entry.name}</h3>
        <div class="combo-entry-section"><span>РЕЦЕПТ</span><p>${entry.recipe}</p></div>
        <div class="combo-entry-section reward"><span>НАГРАДА</span><p>${entry.reward}</p></div>
      </div>
    </article>`;
}

function render(){
  const root=document.querySelector('#combo-encyclopedia');
  if(!root)return;
  const grid=root.querySelector('#combo-book-grid');
  const label=root.querySelector('#combo-book-progress-label');
  const fill=root.querySelector('#combo-book-progress-fill');
  const count=document.querySelector('#combo-book-count');
  const total=ENTRIES.length;
  const known=ENTRIES.filter(entry=>discovered.has(entry.id)).length;
  if(grid)grid.innerHTML=ENTRIES.map(entryMarkup).join('');
  if(label)label.textContent=`${known} / ${total}`;
  if(fill)fill.style.width=`${Math.round(known/total*100)}%`;
  if(count)count.textContent=`${known}/${total}`;
  refreshLucide?.();
}

function openBook(){
  const root=ensureUi();
  root.classList.add('open');
  root.setAttribute('aria-hidden','false');
}

function closeBook(){
  const root=document.querySelector('#combo-encyclopedia');
  root?.classList.remove('open');
  root?.setAttribute('aria-hidden','true');
}

function evaluate(){
  if(!sessionActive)return;
  const newly=[];
  for(const entry of ENTRIES){
    if(discovered.has(entry.id))continue;
    let unlocked=false;
    try{unlocked=!!entry.unlocked();}catch{}
    if(!unlocked)continue;
    discovered.add(entry.id);
    newly.push(entry);
  }
  if(!newly.length)return;
  persist();
  render();
  if(newly.length===1)toast?.(`Энциклопедия: открыто комбо «${newly[0].name}».`);
  else toast?.(`Энциклопедия: открыто новых комбо — ${newly.length}.`);
}

window.addEventListener('corepolis:start',()=>{
  sessionActive=true;
  ensureUi();
});
window.addEventListener('corepolis:session-ready',()=>{
  sessionActive=true;
  ensureUi();
  evaluate();
  if(!pollTimer)pollTimer=setInterval(evaluate,300);
});

window.addEventListener('keydown',event=>{
  if(!document.querySelector('#combo-encyclopedia.open'))return;
  if(event.key==='Escape'){
    event.preventDefault();
    event.stopImmediatePropagation();
    closeBook();
  }
},{capture:true});

window.addEventListener('pagehide',persist);

window.__corepolisComboEncyclopedia={
  get:()=>({
    discovered:[...discovered],
    total:ENTRIES.length
  }),
  open:openBook,
  close:closeBook,
  evaluate
};

ensureUi();
