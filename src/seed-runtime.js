const STORAGE_KEY='corepolis:seed:v1';
const REQUEST_KEY='corepolis:requested-seed';
const STORAGE_VERSION=1;
const RANDOM_REQUEST='__random__';
const nativeRandom=Math.random.bind(Math);

function normalizeSeed(value){
  return String(value??'')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g,'')
    .replace(/-+/g,'-')
    .replace(/^-|-$/g,'')
    .slice(0,24);
}

function generateSeed(){
  try{
    const words=new Uint32Array(2);
    crypto.getRandomValues(words);
    const left=words[0].toString(36).toUpperCase().padStart(7,'0');
    const right=words[1].toString(36).toUpperCase().padStart(7,'0');
    return`CP-${left}${right}`;
  }catch{
    const mixed=(Date.now()^Math.floor(nativeRandom()*0xffffffff))>>>0;
    return`CP-${mixed.toString(36).toUpperCase().padStart(7,'0')}`;
  }
}

function hashSeed(seed){
  let hash=2166136261;
  for(let i=0;i<seed.length;i++){
    hash^=seed.charCodeAt(i);
    hash=Math.imul(hash,16777619);
  }
  hash^=hash>>>16;
  hash=Math.imul(hash,0x85ebca6b);
  hash^=hash>>>13;
  hash=Math.imul(hash,0xc2b2ae35);
  hash^=hash>>>16;
  return(hash>>>0)||0x6d2b79f5;
}

function validRngState(value){
  return Number.isInteger(value)&&value>0&&value<=0xffffffff;
}

function readStoredSnapshot(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    const seed=normalizeSeed(raw?.seed);
    if(!raw||raw.version!==STORAGE_VERSION||!seed||!validRngState(raw.rngState))return null;
    return{version:STORAGE_VERSION,seed,rngState:raw.rngState>>>0};
  }catch{
    return null;
  }
}

function resolveBootSeed(){
  try{
    const requested=sessionStorage.getItem(REQUEST_KEY);
    if(requested!==null){
      sessionStorage.removeItem(REQUEST_KEY);
      if(requested===RANDOM_REQUEST)return generateSeed();
      const normalized=normalizeSeed(requested);
      if(normalized)return normalized;
    }
  }catch{}

  try{
    const requested=new URL(location.href).searchParams.get('seed');
    const normalized=normalizeSeed(requested);
    if(normalized)return normalized;
  }catch{}

  return generateSeed();
}

const savedSnapshot=readStoredSnapshot();
let runSeed=resolveBootSeed();
let rngState=hashSeed(runSeed);
let sessionActive=false;

function gameplayRandom(){
  let x=rngState>>>0;
  if(!x)x=0x6d2b79f5;
  x^=x<<13;
  x^=x>>>17;
  x^=x<<5;
  rngState=(x>>>0)||0x6d2b79f5;
  return rngState/4294967296;
}

function snapshot(){
  return{version:STORAGE_VERSION,seed:runSeed,rngState:rngState>>>0};
}

function restoreSnapshot(value){
  const seed=normalizeSeed(value?.seed);
  if(!seed)return false;
  runSeed=seed;
  rngState=validRngState(value?.rngState)?value.rngState>>>0:hashSeed(seed);
  updateSeedUi();
  return true;
}

function persist(){
  if(!sessionActive)return;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot()));}catch{}
}

function requestReloadSeed(seed=null){
  const normalized=normalizeSeed(seed);
  try{sessionStorage.setItem(REQUEST_KEY,normalized||RANDOM_REQUEST);}catch{}
}

function shareUrl(){
  try{
    const url=new URL(location.href);
    url.searchParams.set('seed',runSeed);
    url.hash='';
    return url.toString();
  }catch{
    return location.href;
  }
}

async function copyShareUrl(feedbackTarget=null){
  const text=shareUrl();
  let copied=false;
  try{
    await navigator.clipboard.writeText(text);
    copied=true;
  }catch{
    try{
      const area=document.createElement('textarea');
      area.value=text;
      area.setAttribute('readonly','');
      area.style.position='fixed';
      area.style.opacity='0';
      document.body.appendChild(area);
      area.select();
      copied=document.execCommand('copy');
      area.remove();
    }catch{}
  }
  if(feedbackTarget){
    const original=feedbackTarget.textContent;
    feedbackTarget.textContent=copied?'ССЫЛКА СКОПИРОВАНА':'НЕ УДАЛОСЬ СКОПИРОВАТЬ';
    setTimeout(()=>{feedbackTarget.textContent=original;},1300);
  }
  return copied;
}

const GAMEPLAY_STACK=/\b(?:randomType|createIslandFragment|weightedPick|chooseResource)\b/;
Math.random=function corepolisRandomRouter(){
  const stack=new Error().stack||'';
  return GAMEPLAY_STACK.test(stack)?gameplayRandom():nativeRandom();
};

function refreshIcons(){
  window.lucide?.createIcons?.();
}

function updateSeedUi(){
  document.querySelectorAll('[data-run-seed]').forEach(node=>{node.textContent=runSeed;});
}

function installPauseSeed(){
  const card=document.querySelector('.pause-card');
  const actions=card?.querySelector('.pause-actions');
  if(!card||!actions||document.querySelector('#pause-run-seed'))return;
  const button=document.createElement('button');
  button.id='pause-run-seed';
  button.className='run-seed-copy pause-run-seed';
  button.type='button';
  button.innerHTML=`
    <i data-lucide="fingerprint"></i>
    <span><small>SEED ПАРТИИ</small><b data-run-seed>${runSeed}</b></span>
    <em>КОПИРОВАТЬ ССЫЛКУ</em>`;
  button.addEventListener('click',()=>copyShareUrl(button.querySelector('em')));
  actions.insertAdjacentElement('afterend',button);
  refreshIcons();
}

function installCapitalSeed(){
  const card=document.querySelector('#capital-finale .capital-card');
  const actions=card?.querySelector('.capital-actions');
  if(!card||!actions)return false;

  if(!card.querySelector('#capital-run-seed')){
    const button=document.createElement('button');
    button.id='capital-run-seed';
    button.className='run-seed-copy capital-run-seed';
    button.type='button';
    button.innerHTML=`
      <i data-lucide="fingerprint"></i>
      <span><small>SEED ЭТОГО ЗАБЕГА</small><b data-run-seed>${runSeed}</b></span>
      <em>КОПИРОВАТЬ ССЫЛКУ</em>`;
    button.addEventListener('click',()=>copyShareUrl(button.querySelector('em')));
    actions.insertAdjacentElement('beforebegin',button);
  }

  if(!card.querySelector('#capital-repeat-seed')){
    const repeat=document.createElement('button');
    repeat.id='capital-repeat-seed';
    repeat.type='button';
    repeat.innerHTML='<i data-lucide="repeat-2"></i><span>Повторить этот seed</span>';
    repeat.addEventListener('click',()=>{
      window.dispatchEvent(new CustomEvent('corepolis:new-run-request',{detail:{confirm:false,seed:runSeed}}));
    });
    actions.appendChild(repeat);
  }

  updateSeedUi();
  refreshIcons();
  return true;
}

window.addEventListener('corepolis:start',event=>{
  if(event.detail?.mode==='continue'&&savedSnapshot)restoreSnapshot(savedSnapshot);
  sessionActive=true;
  if(event.detail?.mode!=='continue')persist();
  updateSeedUi();
});

window.addEventListener('corepolis:save-changed',event=>{
  if(event.detail?.hasSave===false){
    try{localStorage.removeItem(STORAGE_KEY);}catch{}
    return;
  }
  if(event.detail?.hasSave===true)persist();
});

window.addEventListener('corepolis:new-run-request',event=>{
  requestReloadSeed(event.detail?.seed??null);
},{capture:true});

document.addEventListener('click',event=>{
  if(event.target.closest?.('#pause-restart'))requestReloadSeed(null);
},{capture:true});

window.addEventListener('corepolis:session-ready',()=>{
  installPauseSeed();
  installCapitalSeed();
  updateSeedUi();
});
window.addEventListener('pagehide',persist);
window.addEventListener('load',refreshIcons,{once:true});

installPauseSeed();
if(!installCapitalSeed()){
  const observer=new MutationObserver(()=>{
    if(installCapitalSeed())observer.disconnect();
  });
  observer.observe(document.body,{childList:true,subtree:true});
}

window.__corepolisSeedRuntime={
  getSeed:()=>runSeed,
  getSnapshot:()=>({...snapshot()}),
  gameplayRandom,
  requestReloadSeed,
  shareUrl,
  copyShareUrl
};
