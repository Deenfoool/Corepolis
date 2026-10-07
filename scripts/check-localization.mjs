import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { messages } from '../src/locales.js';

// Minimal DOM adapter exercises source retention without loading WebGL.
const saved=new Map([['corepolis:language','de'],['corepolis:save:v1','unchanged-game-data']]);
globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
const text={nodeType:3,nodeValue:'Мельница',parentElement:{closest:()=>null}};
const title={nodeType:3,nodeValue:'Настройки',parentElement:{closest:()=>null}};
const element=child=>({nodeType:1,matches:()=>false,hasAttribute:()=>false,childNodes:[child]});
const controls=[{value:'de'},{value:'de'}];
globalThis.document={readyState:'loading',addEventListener(){},documentElement:{lang:'ru'},body:element(text),querySelector:selector=>selector==='title'?element(title):null,querySelectorAll:()=>controls};
globalThis.window={dispatchEvent(){}};
globalThis.CustomEvent=class {constructor(type,init){this.type=type;this.detail=init.detail;}};
const i18n=await import('../src/i18n.js');
assert.equal(i18n.getLanguage(),'de');
assert.equal(new Set(messages.map(([key])=>key)).size,messages.length,'Duplicate source keys');
for(const [source,translations] of messages){
 assert.equal(translations.length,3,source);
 for(const value of translations){assert(value.trim(),source);assert(!/[А-Яа-яЁё]/.test(value),source);}
}
for(const language of ['en','zh-CN','de','ru','en']){
 i18n.setLanguage(language);
 assert.equal(document.documentElement.lang,language);
 assert.equal(saved.get('corepolis:language'),language);
 assert(controls.every(control=>control.value===language));
 assert.equal(saved.get('corepolis:save:v1'),'unchanged-game-data');
 assert.equal(text.nodeValue,i18n.translate('Мельница'));
 assert.equal(title.nodeValue,i18n.translate('Настройки'));
 const rendered=i18n.translate('Мельница заменена! Собрано 16 полей, +20 бонусных карт. Начинайте новый цикл.');
 assert(rendered.includes('16')&&rendered.includes('20'));
 if(language!=='ru')assert(!/[А-Яа-яЁё]/.test(rendered));
 assert.equal(i18n.translate('Port_SecondAge_Level3.gltf'),'Port_SecondAge_Level3.gltf');
}
i18n.setLanguage('__proto__');assert.equal(i18n.getLanguage(),'en');
for(const file of readdirSync(new URL('../src/',import.meta.url))){
 if(!file.endsWith('.js')||['i18n.js','locales.js','model-catalog-data.js'].includes(file))continue;
 const source=readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
 assert(!/[А-Яа-яЁё]/.test(i18n.translate(source)),`Missing translation in ${file}`);
}
console.log(`Localization passed: ${messages.length} phrases, four languages, reversible text, dynamic counts, locale persistence and save isolation.`);
