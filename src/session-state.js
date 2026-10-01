export const SAVE_VERSION=1;
export const SAVE_KEY='corepolis:save:v1';

export function readSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    if(!parsed||parsed.version!==SAVE_VERSION||!parsed.state)return null;
    return parsed;
  }catch(error){
    console.warn('[Corepolis] Save read failed:',error);
    return null;
  }
}

export function hasCompatibleSave(){
  return !!readSave();
}

export function writeSave(state){
  const payload={
    version:SAVE_VERSION,
    savedAt:new Date().toISOString(),
    state
  };
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('corepolis:save-changed',{detail:{hasSave:true,savedAt:payload.savedAt}}));
    return payload;
  }catch(error){
    console.warn('[Corepolis] Save write failed:',error);
    return null;
  }
}

export function clearSave(){
  try{
    localStorage.removeItem(SAVE_KEY);
    window.dispatchEvent(new CustomEvent('corepolis:save-changed',{detail:{hasSave:false}}));
  }catch(error){
    console.warn('[Corepolis] Save clear failed:',error);
  }
}
