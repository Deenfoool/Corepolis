// Four independent, connected groups; every field belongs to at most one side.
export function collectMillFieldGroups(land,mill,directions){
  const groups=directions.map(direction=>({direction,fields:[],queue:[]}));
  if(!mill)return groups;
  const owned=new Set();
  const cellKey=(x,z)=>`${x},${z}`;
  for(const group of groups){
    const {dx,dz}=group.direction;
    const seed=land.get(cellKey(mill.x+dx,mill.z+dz));
    if(seed?.type!=='field')continue;
    group.fields.push(seed);group.queue.push(seed);owned.add(seed.key);
  }
  let expanded=true;
  while(expanded){
    expanded=false;
    for(const group of groups){
      if(group.fields.length>=4||!group.queue.length)continue;
      const cell=group.queue.shift();
      const neighbors=directions.map(d=>land.get(cellKey(cell.x+d.dx,cell.z+d.dz)))
        .filter(t=>{
          if(t?.type!=='field'||owned.has(t.key))return false;
          const x=t.x-mill.x,z=t.z-mill.z,{dx,dz}=group.direction;
          const forward=x*dx+z*dz;
          const lateral=-x*dz+z*dx;
          // Half-open sectors give diagonal cells one unambiguous side.
          return forward>0&&lateral>-forward&&lateral<=forward;
        })
        .sort((a,b)=>(a.fieldOrder??0)-(b.fieldOrder??0)||a.x-b.x||a.z-b.z);
      for(const next of neighbors){
        if(group.fields.length>=4)break;
        group.fields.push(next);group.queue.push(next);owned.add(next.key);
      }
      expanded=true;
    }
  }
  return groups;
}
