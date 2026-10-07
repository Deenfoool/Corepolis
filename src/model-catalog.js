import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { models } from './model-catalog-data.js';
const $ = id => document.getElementById(id);
const root = './assets/quaternius/ultimate-fantasy-rts/';
const labels = {Houses:'Дома',Windmill:'Мельницы',Market:'Рынки',Mine:'Шахта',Farm:'Поля',Storage:'Склады',Port:'Порты',Dock:'Причал',TownCenter:'Ратуши',Temple:'Храмы',Archery:'Стрельбища',Barracks:'Казармы',WatchTower:'Сторожевые башни',TowerHouse:'Дома-башни',Resource:'Ресурсы',Wall:'Стены',WallTowers:'Башни стен',Wonder:'Монументы',WonderWalls:'Стены монументов',Rock:'Камни',Mountain:'Горы',MountainLarge:'Большая гора',Crate:'Ящики',Barrel:'Бочка',Logs:'Брёвна'};
const roles = Object.fromEntries([...$('role').options].map(o => [o.value,o.text]));
let selection = {};
try { const saved=JSON.parse(localStorage.getItem('corepolis-model-selection') || '{}'); for(const [role,file] of Object.entries(saved)) if(roles[role] && models.includes(file)) selection[role]=file; } catch {}
const loader = new GLTFLoader();
function setup(renderer) {
 renderer.setPixelRatio(1); renderer.setClearColor(0xe2e8db); renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff,0x778065,2.8));
 const light=new THREE.DirectionalLight(0xfff5dc,3); light.position.set(4,8,5);scene.add(light);
 return {renderer,scene,camera:new THREE.PerspectiveCamera(35,1,.01,1000),object:null};
}
function dispose(object) {
 const textures=new Set(); object.traverse(n=>{n.geometry?.dispose();for(const m of (Array.isArray(n.material)?n.material:[n.material]).filter(Boolean)){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}}); textures.forEach(t=>t.dispose());
}
function clear(view){if(view.object){view.scene.remove(view.object);dispose(view.object);view.object=null;}}
function frame(view,object) {
 clear(view);view.object=object;
 object.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(object);const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 object.position.sub(center);const scale=2/Math.max(size.x,size.y,size.z,.001);object.scale.multiplyScalar(scale);view.scene.add(object);
 view.camera.position.set(3.4,2.6,4.3);view.camera.near=.01;view.camera.far=100;view.camera.lookAt(0,0,0);view.camera.updateProjectionMatrix();
}
let thumb,preview,controls;
try {
 thumb=setup(new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));thumb.renderer.setSize(320,256);thumb.camera.aspect=1.25;
 preview=setup(new THREE.WebGLRenderer({antialias:true}));$('stage').append(preview.renderer.domElement);
 controls=new OrbitControls(preview.camera,preview.renderer.domElement);controls.enableDamping=true;controls.minDistance=1;controls.maxDistance=15;
 preview.renderer.setAnimationLoop(()=>{if($('viewer').open){controls.update();preview.renderer.render(preview.scene,preview.camera);}});
} catch {
 thumb?.renderer.dispose(); preview?.renderer.dispose(); thumb=null; preview=null;
 $('stage').textContent='3D-просмотр недоступен: браузер не поддерживает WebGL. Включи аппаратное ускорение или открой каталог в другом браузере.';
}
function resize(){if(!preview)return;const s=$('stage');preview.renderer.setSize(s.clientWidth,s.clientHeight);preview.camera.aspect=s.clientWidth/s.clientHeight;preview.camera.updateProjectionMatrix();}
new ResizeObserver(()=>{if($('viewer').open)resize();}).observe($('stage'));
const cards=new Map(),queue=[];let busy=false;
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);queue.push(e.target);}pump();},{rootMargin:'150px'});
async function pump(){if(!thumb||busy)return;busy=true;while(queue.length){const card=queue.shift();if(card.hidden){observer.observe(card);continue;}try {const gltf=await loader.loadAsync(root+encodeURIComponent(card.dataset.file));frame(thumb,gltf.scene);thumb.renderer.render(thumb.scene,thumb.camera);card.querySelector('img').src=thumb.renderer.domElement.toDataURL('image/webp',.85);card.querySelector('img').alt=card.dataset.file;clear(thumb);}catch{card.querySelector('img').alt='Превью не загрузилось — нажми для повторного просмотра';card.dataset.error='true';}}busy=false;}
let current='',request=0;
async function open(file){current=file;const token=++request;$('model-name').textContent=file;$('status').textContent='Загружаем модель…';$('assign').disabled=true;if(preview)clear(preview);if(!$('viewer').open)$('viewer').showModal();resize();if(!preview){$('status').textContent='Выбор по названию доступен; для просмотра модели нужен WebGL.';$('assign').disabled=false;return;}try{const gltf=await loader.loadAsync(root+encodeURIComponent(file));if(token!==request){dispose(gltf.scene);return;}frame(preview,gltf.scene);controls.target.set(0,0,0);controls.update();$('status').textContent='';$('assign').disabled=false;}catch{if(token===request)$('status').textContent='Не удалось загрузить модель. Закрой просмотр и попробуй ещё раз.';}}
$('close').onclick=()=>$('viewer').close();$('viewer').addEventListener('close',()=>{request++;if(preview)clear(preview);});
$('reset').onclick=()=>{if(!preview)return;preview.camera.position.set(3.4,2.6,4.3);controls.target.set(0,0,0);controls.update();};
for(const family of [...new Set(models.map(f=>f.split('_')[0].replace('.gltf','')))].sort()){const o=document.createElement('option');o.value=family;o.textContent=labels[family]||family;$('family').append(o);}
const placeholder='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="256"><text x="160" y="128" text-anchor="middle" fill="#57685d" font-family="sans-serif" font-size="16">Загружаем превью…</text></svg>');
for(const file of models){const card=document.createElement('button');card.type='button';card.className='model';card.dataset.file=file;const img=document.createElement('img');img.src=placeholder;img.alt=thumb?'Превью '+file:'Для 3D-превью нужен WebGL';const name=document.createElement('span');name.textContent=file;card.append(img,name);card.onclick=()=>open(file);cards.set(file,card);$('grid').append(card);if(thumb)observer.observe(card);}
function filter(){let count=0;for(const [file,card]of cards){card.hidden=!(file.toLowerCase().includes($('search').value.trim().toLowerCase()) && (!$('family').value||file.split('_')[0].replace('.gltf','')===$('family').value) && (!$('age').value||file.includes($('age').value)) && (!$('level').value||file.includes($('level').value)));if(!card.hidden)count++;} $('count').textContent=`Показано ${count} из ${models.length} моделей`;}
for(const id of ['search','family','age','level'])$(id).addEventListener('input',filter);
function selectionText(){return Object.entries(selection).map(([role,file])=>`${roles[role]}: ${file}`).join('\n');}
function updateSelection(){try{localStorage.setItem('corepolis-model-selection',JSON.stringify(selection));}catch{}$('selection').replaceChildren();for(const [role,file]of Object.entries(selection)){const b=document.createElement('button');b.textContent=`${roles[role]}: ${file} ×`;b.title='Убрать из выбора';b.onclick=()=>{delete selection[role];updateSelection();};$('selection').append(b);}for(const [file,card]of cards)card.classList.toggle('chosen',Object.values(selection).includes(file));$('export').value=selectionText();$('copy').textContent=`Скопировать выбор (${Object.keys(selection).length})`;}
$('assign').onclick=()=>{selection[$('role').value]=current;updateSelection();$('viewer').close();};
$('copy').onclick=async()=>{if(!Object.keys(selection).length){$('count').textContent='Сначала открой модель и назначь её постройке.';return;}try{await navigator.clipboard.writeText(selectionText());$('count').textContent='Выбор скопирован. Пришли этот список в чат для подключения моделей.';}catch{$('export').hidden=false;$('export').focus();$('export').select();$('count').textContent='Скопируй выделенный список и пришли его в чат.';}};
filter();updateSelection();if(!preview)$('count').textContent+=' · 3D-превью недоступны: в браузере отключён WebGL.';
