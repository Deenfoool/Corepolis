import { DECK_WEIGHTS } from './config.js?v=field-fence-1';
import {RESEARCH,hasResearch,prepareResearch,learnResearch,canTrade,pickTradeTypes} from './research.js?v=field-fence-1';
const runtime=window.__corepolisRuntime;
const {state,ui,draw,renderHand,refillHand,status,refreshLucide,islandResearchChoices,fragmentMiniMapMarkup}=runtime;
let active=false,busy=false;
const save=()=>window.__corepolisSaveRuntime?.writeCurrentSave(true);
function choose(title,items,markup){
  const locked=state.inputLocked;
  state.inputLocked=true;state.researchChoiceOpen=true;
  const root=document.createElement('section');root.id='research-choice';root.className='marine-choice';root.style.zIndex='210';
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',title);
  root.innerHTML=`<div class="marine-choice-card panel"><div class="eyebrow">ИССЛЕДОВАНИЯ</div><h2>${title}</h2><div class="marine-choice-grid research-options">${items.map((item,i)=>`<button type="button" data-choice="${i}">${markup(item)}</button>`).join('')}</div></div>`;
  document.body.appendChild(root);refreshLucide();root.querySelector('button')?.focus();
  return new Promise(resolve=>{
    let chosen=false;
    root.addEventListener('click',event=>{
      const button=event.target.closest('[data-choice]');if(!button||chosen)return;
      chosen=true;root.remove();state.inputLocked=locked;state.researchChoiceOpen=false;
      resolve(Number(button.dataset.choice));
    });
  });
}
function researchMarkup(id){const r=RESEARCH[id];return `<span class="marine-choice-icon"><i data-lucide="${r.icon}"></i></span><strong>${r.name}</strong><small>${r.description}</small>`;}
function cardMarkup(card){const def=runtime.CARD_DEFS[card.type];return `<span class="marine-choice-icon"><i data-lucide="${def.icon}"></i></span><strong>${def.name}</strong><small>${def.description}</small>`;}
async function poll(){
  if(!active||busy||state.gameOver||state.inputLocked||state.actionPending||state.marineChoiceOpen||window.__corepolisSessionShell?.isPaused()||document.querySelector('#capital-finale.open'))return;
  const offers=prepareResearch(state);
  syncButton();if(!offers.length)return;
  busy=true;save();
  try{
    const index=await choose('Выберите новое исследование',offers,researchMarkup);
    if(learnResearch(state,offers[index])){status();syncButton();save();runtime.toast(`Изучено: ${RESEARCH[offers[index]].name}`);}
  }finally{busy=false;}
}
async function chooseIsland(card){
  const options=islandResearchChoices(card);save();
  const index=await choose('Картография: выберите остров',options,fragment=>`<strong>${fragment.label}</strong>${fragmentMiniMapMarkup({fragment,rotation:0})}<small>Лес: ${fragment.cells.filter(c=>c.content==='tree').length} · Камни: ${fragment.cells.filter(c=>c.content==='rock').length}</small>`);
  card.fragment=options[index];card.surveyed=true;delete card.fragmentChoices;
  renderHand();status();save();
}
async function trade(){
  if(state.actionPending||state.inputLocked||state.gameOver||!canTrade(state))return runtime.toast('Для обмена нужны рынок, исследование и 3 карты в руке.');
  state.actionPending=true;const selected=new Set();
  try{
    const picked=await new Promise(resolve=>{
      state.inputLocked=true;state.researchChoiceOpen=true;
      const root=document.createElement('section');root.id='research-choice';root.className='marine-choice';root.style.zIndex='210';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Выберите три карты для обмена');
      root.innerHTML=`<div class="marine-choice-card panel"><div class="eyebrow">ТОРГОВЫЕ ДОГОВОРЫ</div><h2>Выберите 3 ненужные карты</h2><div class="marine-choice-grid research-options">${state.hand.map(c=>`<button type="button" data-trade="${c.id}" aria-pressed="false">${cardMarkup(c)}</button>`).join('')}</div><button type="button" id="trade-confirm" disabled>Обменять 3 карты</button> <button type="button" id="trade-cancel">Отмена</button></div>`;
      document.body.appendChild(root);refreshLucide();root.querySelector('button')?.focus();
      const finish=result=>{root.remove();state.inputLocked=false;state.researchChoiceOpen=false;resolve(result);};
      root.onclick=event=>{
        const button=event.target.closest('[data-trade]');
        if(button){const id=Number(button.dataset.trade);if(selected.has(id))selected.delete(id);else if(selected.size<3)selected.add(id);button.setAttribute('aria-pressed',String(selected.has(id)));root.querySelector('#trade-confirm').disabled=selected.size!==3;}
        if(event.target.closest('#trade-cancel'))finish(false);
        if(event.target.closest('#trade-confirm')&&selected.size===3)finish(true);
      };
    });
    if(!picked)return;
    const offers=pickTradeTypes(DECK_WEIGHTS).map(type=>draw(type));
    if(!offers.length)return runtime.toast('Сейчас нет доступных карт для обмена.');
    const index=await choose('Выберите карту взамен',offers,cardMarkup);
    state.hand=state.hand.filter(c=>!selected.has(c.id));
    state.hand.push(offers[index]);state.selectedCardId=null;
    refillHand();renderHand();status();save();runtime.toast('Три карты обменяны на одну выбранную.');
  }finally{state.actionPending=false;}
}
function syncButton(){button.textContent=`Исследования ${state.research.learned.length}/5`;}
function openBook(){
  if(busy||state.actionPending||state.inputLocked||state.gameOver)return;
  state.inputLocked=true;state.researchChoiceOpen=true;
  const root=document.createElement('section');root.id='research-choice';root.className='marine-choice';root.style.zIndex='210';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Исследования города');
  root.innerHTML=`<div class="marine-choice-card panel"><div class="eyebrow">ИССЛЕДОВАНИЯ ГОРОДА</div><h2>Знания этой партии</h2><p>Выбор после 1, 3, 6 и 10 комбо, а также первого морского маршрута.</p><div class="research-list">${Object.keys(RESEARCH).map(id=>`<article><strong>${RESEARCH[id].name} · ${hasResearch(state,id)?'ИЗУЧЕНО':'НЕ ИЗУЧЕНО'}</strong><p>${RESEARCH[id].description}</p></article>`).join('')}</div><button type="button" id="research-close">Вернуться к городу</button></div>`;
  document.body.appendChild(root);root.querySelector('#research-close').focus();root.querySelector('#research-close').onclick=()=>{root.remove();state.inputLocked=false;state.researchChoiceOpen=false;};
}
const button=document.createElement('button');button.type='button';button.className='resource-chip';button.id='research-open';button.onclick=openBook;document.querySelector('.resource-row').appendChild(button);syncButton();
const style=document.createElement('style');style.textContent='.research-options{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}.research-options button[aria-pressed="true"]{outline:3px solid #e3b755;background:#334f44}.research-list{max-height:50vh;overflow:auto;text-align:left}.research-list article{padding:10px 0;border-bottom:1px solid #ffffff22}#research-choice .marine-choice-card{max-height:90vh;overflow:auto}#research-choice .fragment-mini-map{margin:12px auto}#research-open{cursor:pointer;color:inherit}';document.head.appendChild(style);
ui.tileInfo.addEventListener('click',event=>{if(event.target.closest('#research-trade'))trade();});
window.addEventListener('corepolis:session-ready',()=>{active=true;syncButton();});
window.addEventListener('keydown',event=>{if(state.researchChoiceOpen&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
window.__corepolisResearchRuntime={chooseIsland,trade,open:openBook};
setInterval(poll,250);
