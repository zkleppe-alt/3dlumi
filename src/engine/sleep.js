// ════════════════════════════════════════════════════════════════
//  SLEEP (V288) — the households' evening and night, indoors. Through the day the people of a house, a shop or an inn are
//  about their business. From early evening (about 19:50) those who live there are in: they sit at the table, or stand by
//  the hearth (the innkeeper comes round from the bar and sits by the fire). From about half past eight they are in bed —
//  lying down under the covers, breathing slow — until dawn. Wake one (talk to them) and they sit up, grumble, and then
//  help you as they would by day (a shopkeeper opens up, the innkeeper finds you a room); after a while they lie down again.
//  People in dungeons and the like are never touched: only rooms built by rooms.js that call SLEEP.room.
//    SLEEP.room(lv, spec, items)   — after the room's furniture is known (rooms.js); items: [{k:'bed'|'chair'|'hearth', x, z, face}]
//    SLEEP.phase()                  — 'day' | 'evening' | 'night'
// ════════════════════════════════════════════════════════════════
const SLEEP=(()=>{
  const S=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  const frac=()=>{ const f=S().dayFrac; return typeof f==='number'?((f%1)+1)%1:0.4; };
  const EVE=0.83, BED=0.854, DAWN=0.272;   // ~19:55, 20:30, 06:30
  const phase=()=>{ const f=frac(); return f>=BED||f<DAWN?'night':f>=EVE?'evening':'day'; };
  const GRUMP={
    any:['Mmph… whuh? Is it morning? …It is NOT morning.','Knight? At this hour? …Fine. What is it?','Can\'t a body sleep in this realm? …Oh. It\'s you. Go on, then.','Hnn— who\'s there? …Sir Knight. Of course it is.','*yawns* This had better be important.'],
    shop:['Shop\'s shut! …Oh. You. Fine — but be quick about it, I\'ve an early start.','Mmph. Wares? Now? …All right, all right. Let me find my spectacles.','Do you know what hour it is? …Never mind. Coin\'s coin. What d\'you need?'],
    inn:['A room? At this hour? …Ach, come on then, I\'ll not turn a knight out into the night.','Hnn? Oh — a traveller. There\'s always a bed for the weary. Mind the stairs in the dark.'],
    king:['Who disturbs— ah. Sir Knight. Even kings must sleep, you know. Speak, then.'],
    madison:['Mm…? Oh! You startled me. Is something wrong?'] };
  const pick=(a,k)=>a[(Math.abs(Math.floor(k))>>>0)%a.length];
  let LIST=[];
  // how high the bed's mattress stands where its middle is: cast a ray down onto the furniture
  const RC=new THREE.Raycaster(), DN=new THREE.Vector3(0,-1,0);
  function topAt(lv,x,z){ RC.set(new THREE.Vector3(x,1.5,z),DN); RC.far=2; const ms=[]; lv.room.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&!o.isSprite&&!o.isInstancedMesh&&o.geometry) ms.push(o); }); lv.room.updateMatrixWorld(true); const hits=RC.intersectObjects(ms,false).filter(h=>h.object.visible&&h.point.y<0.9&&!(h.object.material&&(h.object.material.transparent||h.object.material.isMeshBasicMaterial))&&!(h.object.userData&&h.object.userData.castK)&&!h.object.isSkinnedMesh); return hits.length?hits[0].point.y:0.33; }
  function cover(lv,b,col,w){ w=w||0.62; const g=new THREE.Group(); const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.09,0.98,4,1,6),new THREE.MeshLambertMaterial({color:col||0x8a3a3a}));
    const p=m.geometry.attributes.position; for(let i=0;i<p.count;i++){ if(p.getY(i)>0){ const x=p.getX(i)/(w/2), z=p.getZ(i)/0.49; p.setY(i,p.getY(i)+0.05*(1-x*x)*(1-Math.abs(z)*0.5)); } else p.setX(i,p.getX(i)*1.08); }
    m.geometry.computeVertexNormals(); m.castShadow=m.receiveShadow=true; g.add(m); const fold=new THREE.Mesh(new THREE.BoxGeometry(w+0.04,0.04,0.12),new THREE.MeshLambertMaterial({color:0xf4eee0})); fold.position.set(0,0.06,-0.5); g.add(fold);
    g.position.set(b.x,b.top+0.01,b.z+0.22); g.visible=false; lv.room.add(g); return g; }
  function room(lv,spec,items){ try{
    const kind=spec.theme||'home', beds=(items||[]).filter(i=>i.k==='bed').map(b=>({x:b.x,z:b.z,used:null})), chairs=(items||[]).filter(i=>i.k==='chair'||i.k==='armchair').map(c=>({x:c.x,z:c.z,face:c.face||0,used:null}));
    const hearth=(items||[]).find(i=>i.k==='hearth');
    // who lives here and sleeps here: the people of a home, the shopkeeper, the innkeeper (not patrons, bards, strangers, pets)
    const sleepers=lv.folk.filter(f=>!f.Z&&f.who&&!/Patron|Bard|Stranger|cat|dog|hound|Guard|Royal Guard|Traveller|Pilgrim|mule|horse|goat|hen|cow|pig|sheep|ox\b/i.test(f.who)&&(kind==='home'||kind==='keep'||f.label==='Shop'||f.label==='Rest'||f.who===spec.keeper||f.who==='Innkeeper'||f.sleeper));
    if(!sleepers.length) return;
    beds.forEach(b=>{ b.top=topAt(lv,b.x,b.z); b.cov=cover(lv,b,spec.blanket||(lv.pal&&lv.pal.cloth)); });
    sleepers.forEach((f,i)=>{ const bed=beds.find(b=>!b.used); if(bed) bed.used=f;
      const isInn=f.who==='Innkeeper'||f.label==='Rest', cs=isInn&&hearth?chairs.slice().sort((a,b)=>Math.hypot(a.x-hearth.x,a.z-hearth.z)-Math.hypot(b.x-hearth.x,b.z-hearth.z)):chairs, ch=cs.find(c=>!c.used); if(ch&&kind!=='shop') ch.used=f;
      const role=f.who===spec.keeper||f.label==='Shop'?'shop':f.who==='Innkeeper'||f.label==='Rest'?'inn':/King Karl/.test(f.who)?'king':/Madison/.test(f.who)?'madison':'any';
      f.Z={bed,chair:ch&&ch.used===f?ch:null,role,day:{x:f.x,z:f.z,rest:f.rest||0,y:f.g.position.y},dayVis:f.Z0dayVis!==undefined?f.Z0dayVis:(f.g.visible!==false&&!f.nightOnly),ph:null,awake:0,k:i*7+(f.who||'').length,
        stand:hearth?{x:hearth.x+(i%2?0.7:-0.7),z:hearth.z+0.9,face:Math.atan2(hearth.x-(hearth.x+(i%2?0.7:-0.7)),hearth.z-(hearth.z+0.9))}:null,act0:null,wakeFn:null};
      f.still=true; f.near=f.near||30; f.lookAbout=f.lookAbout||0.35; f.breathe=true; });
    const set=(f,x,z,rest,y)=>{ f.x=x; f.z=z; f.rest=rest; f.g.position.set(x,y!=null?y:0,z); f.g.rotation.y=rest; };
    const apply=(f,ph)=>{ const Z=f.Z; if(f.action!==Z.wakeFn) Z.act0=f.action||null; Z.ph=ph; f.lie=false; f.sit=false; if(Z.bed&&Z.bed.cov) Z.bed.cov.visible=false; f.action=Z.act0;
      if(ph==='day'){ set(f,Z.day.x,Z.day.z,Z.day.rest,Z.day.y); const v=Z.dayVis; f.g.visible=v; f.mute=!v; f.ghost=!v; return; }
      f.g.visible=true; f.mute=false; f.ghost=false;
      if(ph==='evening'){ if(Z.chair){ set(f,Z.chair.x,Z.chair.z,Z.chair.face,0.02); f.sit=true; } else if(Z.role==='shop') set(f,Z.day.x,Z.day.z,Z.day.rest,Z.day.y); else if(Z.stand) set(f,Z.stand.x,Z.stand.z,Z.stand.face,0); return; }
      // night: abed
      if(!Z.bed){ apply(f,'evening'); Z.ph='night'; return; }
      const s=f.g.scale.x||0.6; set(f,Z.bed.x,Z.bed.z+0.08,0,Z.bed.top-0.14*s); f.lie=true; if(Z.bed.cov) Z.bed.cov.visible=true;
      Z.wakeFn=Z.wakeFn||(()=>wake(f)); f.action=Z.wakeFn; };
    function wake(f){ const Z=f.Z; f.lie=false; if(Z.bed&&Z.bed.cov) Z.bed.cov.visible=false; f.sit=true; set(f,Z.bed.x+0.55,Z.bed.z+0.2,Math.PI/2,Z.bed.top-0.36); Z.awake=30;
      const line=pick(GRUMP[Z.role]||GRUMP.any,Z.k+(Z.wakes=(Z.wakes||0)+1));
      ENGINE.speak(f.who,[line],f,()=>{ f.sit=false; set(f,Z.bed.x+0.75,Z.bed.z+0.4,Math.PI/2,0); if(Z.act0) Z.act0(f); else if(f.lines) ENGINE.speak(f.who,f.lines,f); }); f.action=Z.act0; }
    const mine=sleepers.slice();
    const tick=(t,dt)=>{ const ph=phase(); mine.forEach(f=>{ const Z=f.Z; if(!Z) return;
        if(Z.awake>0){ Z.awake-=Math.min(dt||0.016,0.1); if(Z.awake<=0&&ph==='night'&&!(ENGINE.talking&&ENGINE.talking()===f)) apply(f,'night'); return; }
        if(Z.ph!==ph) apply(f,ph); }); };
    lv.anim.push(tick); const oe=lv.onEnter; lv.onEnter=sp=>{ mine.forEach(f=>{ if(f.Z) f.Z.ph=null; f.Z&&(f.Z.awake=0); }); tick(0,0); if(oe) oe(sp); };
    tick(0,0); LIST.push(lv.id);
  }catch(e){ console.warn('[sleep]',e); } }
  return {room,phase,frac,topAt,cover,EVE,BED,DAWN};
})();
