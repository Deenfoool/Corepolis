import { clearSave } from './session-state.js?v=1';

const pauseMenu=document.querySelector('#pause-menu');
const resumeButton=document.querySelector('#pause-resume');
const settingsButton=document.querySelector('#pause-settings-button');
const settingsPanel=document.querySelector('#pause-settings');
const mainMenuButton=document.querySelector('#pause-main-menu');
const restartButton=document.querySelector('#pause-restart');
const uiMotionToggle=document.querySelector('#pause-ui-motion');

const UI_MOTION_KEY='corepolis:ui-motion';
const AUTO_START_KEY='corepolis:auto-start';
const DISCARD_SAVE_KEY='corepolis:discard-save';
const PAUSE_OVERLAY_SELECTOR='#combo-encyclopedia.open, #tutorial-overlay.open, #card-discovery.open, #research-choice';
let sessionActive=false;
let paused=false;
let saveStatusTimer=null;

const saveStatus=document.createElement('div');
saveStatus.className='save-status';
saveStatus.textContent='Сохранено';
saveStatus.setAttribute('aria-live','polite');
document.body.appendChild(saveStatus);

function storedMotion(){
  const value=localStorage.getItem(UI_MOTION_KEY);
  if(value===null)return !matchMedia('(prefers-reduced-motion: reduce)').matches;
  return value==='1';
}

function syncMotion(){
  const enabled=storedMotion();
  uiMotionToggle?.setAttribute('aria-checked',String(enabled));
  document.body.classList.toggle('reduce-motion',!enabled);
}

function setSettingsOpen(open){
  settingsPanel?.classList.toggle('open',open);
}

function setPaused(value){
  if(!pauseMenu||!sessionActive)return;
  paused=value;
  pauseMenu.classList.toggle('open',paused);
  pauseMenu.setAttribute('aria-hidden',String(!paused));
  document.body.classList.toggle('session-paused',paused);
  if(!paused)setSettingsOpen(false);
  window.dispatchEvent(new CustomEvent('corepolis:pause-changed',{detail:{paused}}));
}

function togglePause(){
  setPaused(!paused);
}

function runWhenGameLoaded(callback){
  const loading=document.querySelector('#loading-screen');
  if(!loading||loading.classList.contains('done')){
    callback();
    return;
  }
  const observer=new MutationObserver(()=>{
    if(!loading.classList.contains('done'))return;
    observer.disconnect();
    callback();
  });
  observer.observe(loading,{attributes:true,attributeFilter:['class']});
}

function requestNewRun({confirm=true}={}){
  if(confirm&&!window.confirm('Начать эту партию заново? Текущее сохранение будет удалено.'))return false;
  sessionStorage.setItem(DISCARD_SAVE_KEY,'1');
  sessionStorage.setItem(AUTO_START_KEY,'new');
  location.reload();
  return true;
}

function consumeReloadIntent(){
  if(sessionStorage.getItem(DISCARD_SAVE_KEY)==='1'){
    sessionStorage.removeItem(DISCARD_SAVE_KEY);
    clearSave();
  }

  const autoStart=sessionStorage.getItem(AUTO_START_KEY);
  if(autoStart!=='new'&&autoStart!=='continue')return;
  sessionStorage.removeItem(AUTO_START_KEY);
  runWhenGameLoaded(()=>{
    requestAnimationFrame(()=>{
      const target=autoStart==='continue'
        ?document.querySelector('#menu-continue')
        :document.querySelector('#menu-start');
      if(target&&!target.disabled)target.click();
    });
  });
}

window.addEventListener('corepolis:start',()=>{
  sessionActive=true;
  setPaused(false);
});
window.addEventListener('corepolis:save-changed',event=>{
  if(!sessionActive||!event.detail?.hasSave)return;
  saveStatus.classList.remove('show');
  void saveStatus.offsetWidth;
  saveStatus.classList.add('show');
  clearTimeout(saveStatusTimer);
  saveStatusTimer=setTimeout(()=>saveStatus.classList.remove('show'),1200);
});
window.addEventListener('corepolis:new-run-request',event=>{
  requestNewRun({confirm:event.detail?.confirm!==false});
});

window.addEventListener('keydown',event=>{
  if(!sessionActive)return;

  if(paused&&event.key!=='Escape'){
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if(event.key!=='Escape')return;
  if(document.querySelector(PAUSE_OVERLAY_SELECTOR))return;
  if(document.querySelector('#capital-finale.open'))return;
  if(document.querySelector('#marine-choice:not(.hidden)'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(settingsPanel?.classList.contains('open')){
    setSettingsOpen(false);
    return;
  }
  togglePause();
},{capture:true});

window.addEventListener('pointerdown',event=>{
  if(!paused)return;
  if(event.target.closest('#pause-menu'))return;
  if(event.target.closest(PAUSE_OVERLAY_SELECTOR))return;
  event.preventDefault();
  event.stopImmediatePropagation();
},{capture:true});

resumeButton?.addEventListener('click',()=>setPaused(false));
settingsButton?.addEventListener('click',()=>setSettingsOpen(!settingsPanel?.classList.contains('open')));
uiMotionToggle?.addEventListener('click',()=>{
  const next=!storedMotion();
  localStorage.setItem(UI_MOTION_KEY,next?'1':'0');
  syncMotion();
});
mainMenuButton?.addEventListener('click',()=>{
  window.__corepolisSaveRuntime?.writeCurrentSave?.(true);
  location.reload();
});
restartButton?.addEventListener('click',()=>requestNewRun());

window.__corepolisSessionShell={
  requestNewRun,
  isPaused:()=>paused
};

syncMotion();
setPaused(false);
consumeReloadIntent();
