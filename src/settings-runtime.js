const SETTINGS_KEY='corepolis:settings:v1';
const LEGACY_UI_MOTION_KEY='corepolis:ui-motion';

const DEFAULTS={
  graphics:'high',
  shadows:true,
  waterMotion:true,
  cameraSensitivity:1,
  musicVolume:.18,
  sfxVolume:.55
};

const QUALITY={
  low:{pixelRatio:.9,shadowSize:512,waterFps:24},
  medium:{pixelRatio:1.35,shadowSize:1024,waterFps:40},
  high:{pixelRatio:2,shadowSize:2048,waterFps:60}
};

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}
function defaultUiMotion(){
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function readSettings(){
  let parsed={};
  try{parsed=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};}catch{}
  const legacyMotion=localStorage.getItem(LEGACY_UI_MOTION_KEY);
  const graphics=['low','medium','high'].includes(parsed.graphics)?parsed.graphics:DEFAULTS.graphics;
  return{
    graphics,
    shadows:typeof parsed.shadows==='boolean'?parsed.shadows:DEFAULTS.shadows,
    waterMotion:typeof parsed.waterMotion==='boolean'?parsed.waterMotion:DEFAULTS.waterMotion,
    uiMotion:typeof parsed.uiMotion==='boolean'?parsed.uiMotion:legacyMotion===null?defaultUiMotion():legacyMotion==='1',
    cameraSensitivity:clamp(Number(parsed.cameraSensitivity)||DEFAULTS.cameraSensitivity,.5,1.6),
    musicVolume:clamp(Number.isFinite(Number(parsed.musicVolume))?Number(parsed.musicVolume):DEFAULTS.musicVolume,0,1),
    sfxVolume:clamp(Number.isFinite(Number(parsed.sfxVolume))?Number(parsed.sfxVolume):DEFAULTS.sfxVolume,0,1)
  };
}

let settings=readSettings();
let audioContext=null;
let musicGain=null;
let sfxGain=null;
let bridgeApplyFrame=0;

function saveSettings(){
  localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
  localStorage.setItem(LEGACY_UI_MOTION_KEY,settings.uiMotion?'1':'0');
}

function publishSettings(){
  window.__corepolisSettings={...settings,quality:QUALITY[settings.graphics]};
  document.body.classList.toggle('reduce-motion',!settings.uiMotion);
  syncControls();
  applyToRendererSoon();
  applyAudioVolumes();
  window.dispatchEvent(new CustomEvent('corepolis:settings-changed',{detail:{settings:{...settings}}}));
}

function setSetting(name,value){
  if(name==='graphics'&&!['low','medium','high'].includes(value))return;
  if(name==='cameraSensitivity')value=clamp(Number(value)||1,.5,1.6);
  if(name==='musicVolume'||name==='sfxVolume')value=clamp(Number(value)||0,0,1);
  if(['shadows','waterMotion','uiMotion'].includes(name))value=!!value;
  settings={...settings,[name]:value};
  saveSettings();
  publishSettings();
}

function settingCopy(name){
  const map={
    graphics:{title:'Качество графики',copy:'Разрешение рендера и детализация теней.',kind:'quality'},
    shadows:{title:'Тени',copy:'Динамические тени от зданий, деревьев и рельефа.',kind:'toggle'},
    waterMotion:{title:'Движение воды',copy:'Анимация крупных волн и шейдерной ряби.',kind:'toggle'},
    cameraSensitivity:{title:'Чувствительность камеры',copy:'Скорость вращения, панорамирования и зума.',kind:'range',min:.5,max:1.6,step:.05},
    musicVolume:{title:'Музыка / атмосфера',copy:'Громкость спокойного фонового ambience.',kind:'range',min:0,max:1,step:.05},
    sfxVolume:{title:'Звуки интерфейса',copy:'Клики кнопок, карточек и элементов меню.',kind:'range',min:0,max:1,step:.05}
  };
  return map[name];
}

function toggleMarkup(name,compact=false){
  const cls=compact?'pause-toggle core-setting-toggle':'setting-toggle core-setting-toggle';
  return`<button class="${cls}" type="button" role="switch" data-setting="${name}" aria-checked="${settings[name]}"></button>`;
}
function rangeMarkup(name,compact=false){
  const meta=settingCopy(name);
  const value=settings[name];
  const percent=Math.round(value*100);
  return`<div class="core-range-wrap ${compact?'compact':''}"><input type="range" data-setting="${name}" min="${meta.min}" max="${meta.max}" step="${meta.step}" value="${value}" aria-label="${meta.title}"><output data-setting-output="${name}">${name.includes('Volume')?percent+'%':value.toFixed(2)+'×'}</output></div>`;
}
function qualityMarkup(compact=false){
  return`<div class="core-quality ${compact?'compact':''}" role="group" aria-label="Качество графики">
    ${[['low','LOW'],['medium','MED'],['high','HIGH']].map(([value,label])=>`<button type="button" data-setting="graphics" data-value="${value}" class="${settings.graphics===value?'active':''}">${label}</button>`).join('')}
  </div>`;
}
function rowMarkup(name,compact=false){
  const meta=settingCopy(name);
  const control=meta.kind==='toggle'?toggleMarkup(name,compact):meta.kind==='range'?rangeMarkup(name,compact):qualityMarkup(compact);
  if(compact){
    return`<div class="pause-setting-row core-setting-row"><div><strong>${meta.title}</strong><small>${meta.copy}</small></div>${control}</div>`;
  }
  return`<div class="setting-row core-setting-row"><div class="setting-copy"><strong>${meta.title}</strong><small>${meta.copy}</small></div>${control}</div>`;
}

function mountSettingsUi(){
  const menuCard=document.querySelector('.menu-settings-card');
  if(menuCard&&!menuCard.querySelector('[data-core-settings="menu"]')){
    const section=document.createElement('div');
    section.dataset.coreSettings='menu';
    section.className='core-settings-section';
    section.innerHTML=['graphics','shadows','waterMotion','cameraSensitivity','musicVolume','sfxVolume'].map(name=>rowMarkup(name,false)).join('');
    menuCard.appendChild(section);
  }

  const pause=document.querySelector('#pause-settings');
  if(pause&&!pause.querySelector('[data-core-settings="pause"]')){
    const section=document.createElement('div');
    section.dataset.coreSettings='pause';
    section.className='core-settings-section pause-core-settings';
    section.innerHTML=['graphics','shadows','waterMotion','cameraSensitivity','musicVolume','sfxVolume'].map(name=>rowMarkup(name,true)).join('');
    pause.appendChild(section);
  }
  syncControls();
  window.lucide?.createIcons?.();
}

function syncControls(){
  for(const toggle of document.querySelectorAll('[data-setting="shadows"],[data-setting="waterMotion"]')){
    toggle.setAttribute('aria-checked',String(!!settings[toggle.dataset.setting]));
  }
  for(const button of document.querySelectorAll('[data-setting="graphics"][data-value]')){
    button.classList.toggle('active',button.dataset.value===settings.graphics);
  }
  for(const input of document.querySelectorAll('input[data-setting]')){
    const name=input.dataset.setting;
    if(name in settings)input.value=String(settings[name]);
  }
  for(const output of document.querySelectorAll('[data-setting-output]')){
    const name=output.dataset.settingOutput;
    const value=settings[name];
    output.textContent=name.includes('Volume')?`${Math.round(value*100)}%`:`${value.toFixed(2)}×`;
  }
  for(const oldUiToggle of document.querySelectorAll('#setting-ui-motion,#pause-ui-motion')){
    oldUiToggle.setAttribute('aria-checked',String(settings.uiMotion));
  }
}

function applyBridge(bridge){
  if(!bridge?.renderer||!bridge.scene)return false;
  const quality=QUALITY[settings.graphics];
  const renderer=bridge.renderer;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality.pixelRatio));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.shadowMap.enabled=settings.shadows;
  renderer.shadowMap.needsUpdate=true;

  bridge.scene.traverse(object=>{
    if(!object.isDirectionalLight||!object.shadow)return;
    object.castShadow=settings.shadows;
    if(object.shadow.mapSize.x!==quality.shadowSize){
      object.shadow.mapSize.set(quality.shadowSize,quality.shadowSize);
      object.shadow.map?.dispose?.();
      object.shadow.map=null;
      object.shadow.needsUpdate=true;
    }
  });
  return true;
}

function applyToRenderer(){
  const runtime=window.__corepolisRuntime;
  if(runtime?.controls){
    const sensitivity=settings.cameraSensitivity;
    runtime.controls.rotateSpeed=sensitivity;
    runtime.controls.panSpeed=sensitivity;
    runtime.controls.zoomSpeed=.8+sensitivity*.4;
  }
  const gameApplied=applyBridge(window.__corepolisRenderBridge);
  const menuApplied=applyBridge(window.__corepolisMenuRenderBridge);
  return gameApplied||menuApplied;
}

function applyToRendererSoon(){
  cancelAnimationFrame(bridgeApplyFrame);
  let attempts=0;
  const tryApply=()=>{
    attempts++;
    const gameReady=applyToRenderer();
    const menuExpected=!!document.querySelector('#menu-scene');
    const menuReady=!menuExpected||!!window.__corepolisMenuRenderBridge;
    if((gameReady&&menuReady)||attempts>180)return;
    bridgeApplyFrame=requestAnimationFrame(tryApply);
  };
  bridgeApplyFrame=requestAnimationFrame(tryApply);
}

function ensureAudio(){
  if(audioContext){
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    return;
  }
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return;
  audioContext=new Ctx();
  musicGain=audioContext.createGain();
  sfxGain=audioContext.createGain();
  musicGain.gain.value=0;
  sfxGain.gain.value=0;
  musicGain.connect(audioContext.destination);
  sfxGain.connect(audioContext.destination);

  const master=audioContext.createGain();
  master.gain.value=.07;
  master.connect(musicGain);

  const filter=audioContext.createBiquadFilter();
  filter.type='lowpass';
  filter.frequency.value=420;
  filter.Q.value=.7;
  filter.connect(master);

  for(const [frequency,detune,gainValue] of [[110,-4,.34],[164.81,3,.22],[220,-7,.12]]){
    const osc=audioContext.createOscillator();
    const gain=audioContext.createGain();
    osc.type='sine';
    osc.frequency.value=frequency;
    osc.detune.value=detune;
    gain.gain.value=gainValue;
    osc.connect(gain).connect(filter);
    osc.start();
  }
  applyAudioVolumes();
}

function applyAudioVolumes(){
  if(!audioContext)return;
  const now=audioContext.currentTime;
  musicGain?.gain.cancelScheduledValues(now);
  musicGain?.gain.linearRampToValueAtTime(settings.musicVolume,now+.08);
  sfxGain?.gain.cancelScheduledValues(now);
  sfxGain?.gain.linearRampToValueAtTime(settings.sfxVolume,now+.04);
}

function playUiClick(strong=false){
  if(!audioContext||!sfxGain||settings.sfxVolume<=0)return;
  const now=audioContext.currentTime;
  const osc=audioContext.createOscillator();
  const gain=audioContext.createGain();
  osc.type='sine';
  osc.frequency.setValueAtTime(strong?420:520,now);
  osc.frequency.exponentialRampToValueAtTime(strong?260:360,now+.055);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(strong?.12:.075,now+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,now+.075);
  osc.connect(gain).connect(sfxGain);
  osc.start(now);
  osc.stop(now+.085);
}

function handleCoreSettingClick(event){
  const target=event.target.closest?.('[data-setting]');
  if(!target)return false;
  const name=target.dataset.setting;
  if(name==='graphics'&&target.dataset.value){
    setSetting(name,target.dataset.value);
    playUiClick(true);
    return true;
  }
  if(name==='shadows'||name==='waterMotion'){
    setSetting(name,!settings[name]);
    playUiClick();
    return true;
  }
  return false;
}

document.addEventListener('click',event=>{
  const uiMotion=event.target.closest?.('#setting-ui-motion,#pause-ui-motion');
  if(uiMotion){
    settings={...settings,uiMotion:localStorage.getItem(LEGACY_UI_MOTION_KEY)!=='0'};
    saveSettings();
    publishSettings();
    playUiClick();
    return;
  }
  if(handleCoreSettingClick(event))return;
  if(event.target.closest?.('button,.card,a'))playUiClick(event.target.closest?.('.primary')!=null);
});
document.addEventListener('input',event=>{
  const target=event.target;
  if(!(target instanceof HTMLInputElement)||!target.matches('input[data-setting]'))return;
  setSetting(target.dataset.setting,target.value);
});
document.addEventListener('pointerdown',ensureAudio,{capture:true});
window.addEventListener('resize',applyToRendererSoon);
window.addEventListener('corepolis:runtime-ready',applyToRendererSoon);
window.addEventListener('corepolis:start',applyToRendererSoon);
window.addEventListener('corepolis:session-ready',applyToRendererSoon);

window.__corepolisSettingsRuntime={
  get:()=>({...settings}),
  set:setSetting,
  apply:publishSettings
};

mountSettingsUi();
publishSettings();
