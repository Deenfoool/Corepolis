const runtime=window.__corepolisRuntime;
const {state,renderHand,refillHand,hasAvailableMove,clearIslandGhost,refreshLucide}=runtime;
let active=false,lastSignature='',settledAt=0;
function finishRun(){
  window.__corepolisSaveRuntime?.writeCurrentSave(true);
  state.gameOver=true;state.inputLocked=true;state.selectedCardId=null;
  clearIslandGhost();
  const root=document.createElement('section');root.id='run-ending';root.className='marine-choice';
  root.style.zIndex='220';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','run-ending-title');
  root.innerHTML=`<div class="marine-choice-card panel"><div class="eyebrow">ПАРТИЯ ЗАВЕРШЕНА</div><h2 id="run-ending-title"></h2><p id="run-ending-copy"></p><div class="marine-choice-grid"><button type="button" id="run-restart"><span class="marine-choice-icon"><i data-lucide="rotate-ccw"></i></span><strong>Новая партия</strong><small>Начать с нового острова и запаса из 24 карт.</small></button><button type="button" id="run-menu"><span class="marine-choice-icon"><i data-lucide="house"></i></span><strong>Главное меню</strong><small>Посмотреть результат и выбрать новую партию.</small></button></div></div>`;
  root.querySelector('#run-ending-title').textContent=state.hand.length?'Нет доступных ходов':'Карты закончились';
  root.querySelector('#run-ending-copy').textContent=`Результат: ${state.harvestScore} очков, ${state.comboCount} комбо. ${state.hand.length?'Для оставшихся карт не хватает ресурсов или подходящих мест.':'Ни в руке, ни в запасе не осталось карт. Комбо и открытия — источник новых карт.'}`;
  root.querySelector('#run-restart').onclick=()=>window.__corepolisSessionShell?.requestNewRun();
  root.querySelector('#run-menu').onclick=()=>location.reload();
  document.body.appendChild(root);refreshLucide();root.querySelector('#run-restart').focus();
}
function checkRun(){
  if(!active||state.gameOver)return;
  if(state.inputLocked||state.actionPending||state.marineChoiceOpen||document.body.classList.contains('menu-open')||window.__corepolisSessionShell?.isPaused()||document.querySelector('#capital-finale.open')){lastSignature='';return;}
  if(state.hand.length<5&&state.reserve.length){refillHand();renderHand();lastSignature='';return;}
  const snapshot=window.__corepolisSaveRuntime?.serializeState();
  if(!snapshot)return;
  const signature=JSON.stringify(snapshot);
  if(signature!==lastSignature){lastSignature=signature;settledAt=performance.now();return;}
  // Discovery and rank rewards run asynchronously; wait for their state to settle.
  if(performance.now()-settledAt<900)return;
  if(!hasAvailableMove())finishRun();
}
window.addEventListener('corepolis:session-ready',()=>{active=true;lastSignature='';});
window.addEventListener('keydown',event=>{if(state.gameOver&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
setInterval(checkRun,300);
