import { clearSave } from './session-state.js?v=1';

const pauseMenu=document.querySelector('#pause-menu');
const resumeButton=document.querySelector('#pause-resume');
const settingsButton=document.querySelector('#pause-settings-button');
const settingsPanel=document.querySelector('#pause-settings');
const mainMenuButton=document.querySelector('#pause-main-menu');
const restartButton=document.querySelector('#pause-restart');
const uiMotionToggle=document.querySelector('#pause-ui-motion');

const UI_MOTION_KEY='corepolis:ui-motion';
let sessionActive=false;
let paused=false;

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

window.addEventListener('corepolis:start',()=>{
  sessionActive=true;
  setPaused(false);
});

window.addEventListener('keydown',event=>{
  if(!sessionActive)return;

  if(paused&&event.key!=='Escape'){
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if(event.key!=='Escape')return;
  if(document.querySelector('#marine-choice:not(.hidden)'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(settingsPanel?.classList.contains('open')){
    setSettingsOpen(false);
    return;
  }
  togglePause();
},{capture:true});

resumeButton?.addEventListener('click',()=>setPaused(false));
settingsButton?.addEventListener('click',()=>setSettingsOpen(!settingsPanel?.classList.contains('open')));
uiMotionToggle?.addEventListener('click',()=>{
  const next=!storedMotion();
  localStorage.setItem(UI_MOTION_KEY,next?'1':'0');
  syncMotion();
});
mainMenuButton?.addEventListener('click',()=>{
  location.reload();
});
restartButton?.addEventListener('click',()=>{
  if(!window.confirm('Начать эту партию заново? Текущее сохранение будет удалено.'))return;
  clearSave();
  sessionStorage.setItem('corepolis:auto-start','new');
  location.reload();
});

syncMotion();
setPaused(false);
