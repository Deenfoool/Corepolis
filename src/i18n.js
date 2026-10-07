import { messages } from './locales.js?v=languages-1';

export const LANGUAGES = {ru:'Русский',en:'English',de:'Deutsch','zh-CN':'简体中文'};
const STORAGE_KEY='corepolis:language';
let language='ru';
try { const saved=localStorage.getItem(STORAGE_KEY); if(Object.hasOwn(LANGUAGES,saved))language=saved; } catch {}
export const getLanguage=()=>language;
export const getLocale=()=>({ru:'ru-RU',en:'en-US',de:'de-DE','zh-CN':'zh-CN'})[language];

const lookup=new Map();
for(const [source,translations] of messages){
  lookup.set(source,translations);
  // Headings use the same vocabulary in uppercase.
  if(/[а-яё]/.test(source))lookup.set(source.toUpperCase(),translations.map(value=>value.toLocaleUpperCase()));
}
const escapeRegex=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern=new RegExp([...lookup.keys()].sort((a,b)=>b.length-a.length).map(escapeRegex).join('|'),'gu');
export function translate(value){
  const source=String(value??'');
  if(language==='ru')return source;
  const column={en:0,de:1,'zh-CN':2}[language];
  return source.replace(pattern,match=>lookup.get(match)[column]);
}

// Retain source text independently of rendered text so switching languages
// never translates an already translated string or alters game/save data.
const sources=new WeakMap();
const attributes=['aria-label','title','placeholder','alt'];
function applyValue(node,key,value,set){
  let record=sources.get(node);
  if(!record){record={};sources.set(node,record);}
  const previous=record[key];
  const source=previous&&value===previous.rendered?previous.source:value;
  const rendered=translate(source);
  record[key]={source,rendered};
  if(value!==rendered)set(rendered);
}
function visit(node){
  if(node.nodeType===3){
    if(node.parentElement?.closest('script,style,[data-i18n-ignore]'))return;
    applyValue(node,'text',node.nodeValue,value=>{node.nodeValue=value;});
    return;
  }
  if(node.nodeType!==1||node.matches('script,style,[data-i18n-ignore]'))return;
  for(const key of attributes)if(node.hasAttribute(key))applyValue(node,key,node.getAttribute(key),value=>node.setAttribute(key,value));
  for(const child of node.childNodes)visit(child);
}
export function setLanguage(value){
  if(!Object.hasOwn(LANGUAGES,value))return;
  language=value;
  try {localStorage.setItem(STORAGE_KEY,language);} catch {}
  document.documentElement.lang=language;
  visit(document.body);
  const title=document.querySelector('title');if(title)visit(title);
  for(const control of document.querySelectorAll('[data-language-select]'))control.value=language;
  window.dispatchEvent(new CustomEvent('corepolis:language-changed',{detail:{language}}));
}
function init(){
  document.documentElement.lang=language;
  visit(document.body);
  const title=document.querySelector('title');if(title)visit(title);
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList')for(const node of record.addedNodes)visit(node);
      else if(record.type==='characterData')visit(record.target);
      else if(record.type==='attributes'){
        const node=record.target,key=record.attributeName;
        if(node.hasAttribute(key)&&!node.closest('[data-i18n-ignore]'))applyValue(node,key,node.getAttribute(key),value=>node.setAttribute(key,value));
      }
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  document.addEventListener('change',event=>{
    if(event.target.matches('[data-language-select]'))setLanguage(event.target.value);
  });
}
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
}
