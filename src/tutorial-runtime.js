const STORAGE_KEY='corepolis:tutorial:v1';
const STORAGE_VERSION=1;

const runtime=window.__corepolisRuntime;
if(!runtime)throw new Error('Corepolis runtime is not available for tutorial.');

const {state,refreshLucide}=runtime;
let sessionActive=false;
let active=false;
let stepIndex=0;
let lockBeforeOpen=false;
let autoTimer=null;

const STEPS=[
  {
    icon:'hand',kicker:'ШАГ 1 · КАРТЫ',title:'Начните с четырёх базовых карт',
    text:'Новый остров начинается с Дома, Поля, Лесопилки и Каменоломни. Продвинутые постройки не лежат в общей колоде с первого хода — их нужно открыть действиями на острове.',
    tips:['Карты территории, леса и камней поддерживают развитие мира','Лишние карты уходят в запас справа','Открытая карта входит в пул только после выполнения её условия']
  },
  {
    icon:'map',kicker:'ШАГ 2 · ОСТРОВ',title:'Расширяйте берег',
    text:'Карта территории добавляет целый фрагмент острова. На мини-карте заранее видны форма, лес и камни. Пока фрагмент выбран, Q и E поворачивают его перед установкой.',
    tips:['Зелёный ghost — место подходит','Красный ghost — фрагмент пересекается с занятым местом','Каждый seed создаёт свой биом и влияет на доступные веса карт']
  },
  {
    icon:'network',kicker:'ШАГ 3 · ОТКРЫТИЯ',title:'Развивайте колоду самим городом',
    text:'Действия открывают новые типы карт. Четыре связанных поля открывают Мельницу, шесть связанных домов — Рынок, а первая древесина открывает путь к Причалу. Открытия можно посмотреть в паузе.',
    tips:['Заблокированная карта вообще не выпадает случайно','Director уменьшает повторы и бесполезные карты','Новые открытия ведут к следующим веткам развития']
  },
  {
    icon:'crown',kicker:'ШАГ 4 · ЦЕЛЬ',title:'Постройте Островную столицу',
    text:'Панель цели слева показывает путь Поселение → Деревня → Городок → Город → Островная столица. Нужны земля, жильё, производство, фермерство и морская ветка — одного счёта недостаточно.',
    tips:['На ключевых статусах выбирайте 1 из 3 бонусных карт','Прогресс и мир автоматически сохраняются','После столицы можно продолжить строительство']
  },
  {
    icon:'fingerprint',kicker:'ШАГ 5 · ЗАБЕГ',title:'Каждая партия имеет код',
    text:'Seed задаёт базовую случайность и биом. Одинаковый seed вместе с одинаковыми решениями воспроизводит тот же ход партии. В паузе можно скопировать ссылку, посмотреть биом, Открытия и Энциклопедию комбо.',
    tips:['New Run создаёт новый seed','Повтор seed позволяет переиграть ту же основу партии','Continue возвращает сохранённый мир и RNG в то же состояние']
  }
];

function readCompleted(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    return!!(raw&&raw.version===STORAGE_VERSION&&raw.completed);
  }catch{
    return false;
  }
}

function persistCompleted(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:STORAGE_VERSION,completed:true}));}catch{}
}

function ensureUi(){
  const actions=document.querySelector('.pause-actions');
  let pauseButton=document.querySelector('#pause-tutorial');
  if(actions&&!pauseButton){
    pauseButton=document.createElement('button');
    pauseButton.id='pause-tutorial';
    pauseButton.className='pause-action';
    pauseButton.type='button';
    pauseButton.innerHTML='<i data-lucide="graduation-cap"></i><span>Обучение</span>';
    const encyclopedia=document.querySelector('#pause-encyclopedia');
    if(encyclopedia)encyclopedia.insertAdjacentElement('beforebegin',pauseButton);
    else{
      const mainMenu=document.querySelector('#pause-main-menu');
      if(mainMenu)mainMenu.insertAdjacentElement('beforebegin',pauseButton);
      else actions.appendChild(pauseButton);
    }
    pauseButton.addEventListener('click',()=>openTutorial({manual:true}));
  }

  let root=document.querySelector('#tutorial-overlay');
  if(!root){
    root=document.createElement('section');
    root.id='tutorial-overlay';
    root.className='tutorial-overlay';
    root.setAttribute('aria-hidden','true');
    root.innerHTML=`
      <div class="tutorial-card panel" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <div class="tutorial-progress" id="tutorial-progress"></div>
        <div class="tutorial-hero">
          <div id="tutorial-icon" class="tutorial-icon"><i data-lucide="hand"></i></div>
          <div>
            <div id="tutorial-kicker" class="eyebrow"></div>
            <h2 id="tutorial-title"></h2>
          </div>
        </div>
        <p id="tutorial-text" class="tutorial-text"></p>
        <div id="tutorial-tips" class="tutorial-tips"></div>
        <div class="tutorial-actions">
          <button id="tutorial-skip" class="quiet" type="button">Пропустить</button>
          <div>
            <button id="tutorial-back" class="quiet" type="button"><i data-lucide="arrow-left"></i><span>Назад</span></button>
            <button id="tutorial-next" class="primary" type="button"><span>Далее</span><i data-lucide="arrow-right"></i></button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    root.querySelector('#tutorial-skip')?.addEventListener('click',()=>finishTutorial(true));
    root.querySelector('#tutorial-back')?.addEventListener('click',()=>setStep(stepIndex-1));
    root.querySelector('#tutorial-next')?.addEventListener('click',()=>{
      if(stepIndex>=STEPS.length-1)finishTutorial(true);
      else setStep(stepIndex+1);
    });
  }
  refreshLucide?.();
  return root;
}

function renderStep(){
  const root=ensureUi();
  const step=STEPS[stepIndex];
  const progress=root.querySelector('#tutorial-progress');
  const icon=root.querySelector('#tutorial-icon');
  const kicker=root.querySelector('#tutorial-kicker');
  const title=root.querySelector('#tutorial-title');
  const text=root.querySelector('#tutorial-text');
  const tips=root.querySelector('#tutorial-tips');
  const back=root.querySelector('#tutorial-back');
  const next=root.querySelector('#tutorial-next');

  if(progress)progress.innerHTML=STEPS.map((_,index)=>`<i class="${index===stepIndex?'active':index<stepIndex?'done':''}"></i>`).join('');
  if(icon)icon.innerHTML=`<i data-lucide="${step.icon}"></i>`;
  if(kicker)kicker.textContent=step.kicker;
  if(title)title.textContent=step.title;
  if(text)text.textContent=step.text;
  if(tips)tips.innerHTML=step.tips.map(item=>`<div><i data-lucide="check"></i><span>${item}</span></div>`).join('');
  if(back)back.disabled=stepIndex===0;
  if(next)next.innerHTML=stepIndex===STEPS.length-1
    ?'<span>Начать строить</span><i data-lucide="play"></i>'
    :'<span>Далее</span><i data-lucide="arrow-right"></i>';
  refreshLucide?.();
}

function setStep(index){
  stepIndex=Math.max(0,Math.min(STEPS.length-1,index));
  renderStep();
}

function otherModalOpen(){
  return!!(
    document.querySelector('#draft-choice.open')||
    document.querySelector('#capital-finale.open')||
    document.querySelector('#marine-choice:not(.hidden)')||
    document.querySelector('#combo-encyclopedia.open')||
    document.querySelector('#card-discovery.open')
  );
}

function openTutorial({manual=false}={}){
  if(!sessionActive||active)return;
  if(!manual&&otherModalOpen()){
    clearTimeout(autoTimer);
    autoTimer=setTimeout(()=>openTutorial({manual:false}),500);
    return;
  }
  const root=ensureUi();
  active=true;
  stepIndex=0;
  lockBeforeOpen=!!state.inputLocked;
  state.inputLocked=true;
  root.classList.add('open');
  root.setAttribute('aria-hidden','false');
  renderStep();
}

function finishTutorial(markComplete=true){
  if(!active)return;
  active=false;
  const root=document.querySelector('#tutorial-overlay');
  root?.classList.remove('open');
  root?.setAttribute('aria-hidden','true');
  state.inputLocked=lockBeforeOpen;
  if(markComplete)persistCompleted();
}

window.addEventListener('corepolis:start',()=>{
  sessionActive=true;
  active=false;
  clearTimeout(autoTimer);
});

window.addEventListener('corepolis:session-ready',event=>{
  sessionActive=true;
  ensureUi();
  if(event.detail?.mode!=='new'||readCompleted())return;
  clearTimeout(autoTimer);
  autoTimer=setTimeout(()=>openTutorial({manual:false}),850);
});

window.addEventListener('keydown',event=>{
  if(!active)return;
  if(event.key==='Escape'){
    event.preventDefault();
    event.stopImmediatePropagation();
    finishTutorial(true);
    return;
  }
  if(event.key==='ArrowLeft'){
    event.preventDefault();
    setStep(stepIndex-1);
    return;
  }
  if(event.key==='ArrowRight'||event.key==='Enter'){
    event.preventDefault();
    if(stepIndex>=STEPS.length-1)finishTutorial(true);
    else setStep(stepIndex+1);
  }
},{capture:true});

window.__corepolisTutorialRuntime={
  open:()=>openTutorial({manual:true}),
  close:()=>finishTutorial(false),
  completed:readCompleted
};

ensureUi();
