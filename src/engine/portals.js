// ════════════════════════════════════════════════════════════════
//  THE PORTALS — after the Pretender flees (S.bounties.portalsOpen): three tears in the sky over the southern isles'
//  summits (PORTALS: Mistral Gate, Tabor Gate, Sunfall Gate). The first is open at once; each of the others stays
//  sealed until the world before it is cleared (S.portals[id]). Squire Matthew runs up the first time you're back
//  outside (bounties.matthewIntercept) with word of the princess.
//  Each world is the game's own buildPortalWorld(id) (tools/extract_portals.py → data/portal_<id>.json), raised with
//  buildWorld: its tiles, heights, walk mask, chapels, keep, cottages, windmills, wind-bent trees, flocks and
//  shepherds; the arch you arrive by takes you home.
//  portalSystem(world, PORTALS, WORLDS) → { open(), worldLevel(id) }
// ════════════════════════════════════════════════════════════════
function portalModel(col,sealed){ const g=new THREE.Group(), c=new THREE.Color(col);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.12,8,32),new THREE.MeshBasicMaterial({color:sealed?0x4a3a5a:c})); ring.position.y=1.5; g.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1.0,32),new THREE.MeshBasicMaterial({color:sealed?0x1a1424:c,transparent:true,opacity:sealed?0.55:0.5,side:THREE.DoubleSide,depthWrite:false,blending:sealed?THREE.NormalBlending:THREE.AdditiveBlending})); disc.position.y=1.5; g.add(disc);
  const swirl=[]; for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.RingGeometry(0.2+i*0.25,0.28+i*0.25,24,1,0,Math.PI*1.3),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:sealed?0.08:0.35,side:THREE.DoubleSide,depthWrite:false})); r.position.y=1.5; r.position.z=0.01*(i+1); g.add(r); swirl.push(r); }
  if(sealed) [-1,1].forEach(s=>{ const ch=B(2.4,0.08,0.08,0x6a6a72,0,1.5,0.06,g); ch.rotation.z=s*0.7; });
  B(0.5,0.25,0.5,0x8a8478,-1.1,0,0,g); B(0.5,0.25,0.5,0x8a8478,1.1,0,0,g);
  let light=null; if(!sealed){ light=new THREE.PointLight(col,0.9,7,1.6); light.position.y=1.5; g.add(light); }
  g.userData.tick=t=>{ swirl.forEach((r,i)=>r.rotation.z=t*(1.2+i*0.6)*(i%2?-1:1)); disc.material.opacity=(sealed?0.45:0.42)+Math.sin(t*2)*0.08; ring.rotation.z=t*0.2; if(light) light.intensity=0.8+Math.sin(t*3)*0.15; };
  return g; }

function portalSystem(world,PORTALS,WORLDS){
  const S=()=>GAME.S, P=ENGINE.P;
  const COL={mistral:0x8ad0ff,tabor:0xe8f4ff,sunfall:0xffc860};
  const bs=()=>S().bounties||{}, open=()=>!!bs().portalsOpen;
  const st=id=>{ const s=S(); s.portals=s.portals||{mistral:{unlocked:true,cleared:false},tabor:{unlocked:false,cleared:false},sunfall:{unlocked:false,cleared:false}}; return s.portals[id]; };
  // ── on the summits ──
  const gates=PORTALS.map(pr=>{ const m={open:portalModel(COL[pr.id],false),sealed:portalModel(COL[pr.id],true)}; [m.open,m.sealed].forEach(g=>{ g.position.set(pr.tx+0.5,world.ground(pr.tx+0.5,pr.ty+0.5),pr.ty+0.5); g.visible=false; world.scene.add(g); });
    const spot={x:pr.tx+0.5,z:pr.ty+1.2,r:1.4,label:'Enter',auto:[0,-1],ar:0.7,who:pr.name,action:()=>{ const s=st(pr.id);
      if(!s.unlocked){ ENGINE.speak(pr.name,[`🔒 The ${pr.name} is sealed. Its light is dim and cold — clear the world before it first.`]); return; }
      const lv=worldLevel(pr.id); if(!lv){ ENGINE.speak(pr.name,[`The ${pr.name} swirls with light — but the world beyond isn’t built in 3D yet.`]); return; }
      ENGINE.go(lv.id,lv.arrive); setTimeout(()=>UI.toast(`🌀 You step through the ${pr.name}…`,2000),450); }};
    return {pr,m,spot}; });
  world.anim.push(t=>{ if(ENGINE.level!==world) return; const on=open();
    gates.forEach(G=>{ const unl=on&&st(G.pr.id).unlocked; G.m.open.visible=on&&unl; G.m.sealed.visible=on&&!unl; (unl?G.m.open:G.m.sealed).userData.tick(t);
      const i=world.spots.indexOf(G.spot); if(on){ if(i<0) world.spots.push(G.spot); } else if(i>=0) world.spots.splice(i,1); });
    matthew(t); });
  // ── Squire Matthew, running with the news ──
  let mat=null, mt=0;
  function matthew(t){ const b=bs(); if(!b.matthewIntercept||ENGINE.busy||UI.open||!document.getElementById('say').hidden) return;
    if(!mat){ const a=P.face+Math.PI*0.75, x=P.x+Math.sin(a)*6, z=P.z+Math.cos(a)*6;
      mat=addPerson(world,world.scene,'matthew',x,z,world.ground(x,z),'Squire Matthew',null,{rest:0}); mat.mute=true; mat.ghost=true; mt=0; }
    mt+=0.016; const dx=P.x-mat.x, dz=P.z-mat.z, d=Math.hypot(dx,dz);
    if(d>1.3&&mt<6){ mat.x+=dx/d*0.09; mat.z+=dz/d*0.09; mat.g.position.set(mat.x,world.ground(mat.x,mat.z),mat.z); mat.g.rotation.y=Math.atan2(dx,dz); return; }
    b.matthewIntercept=false; GAME.save(); const f=mat;
    ENGINE.speak('Squire Matthew',['Sir! SIR! Thank the Light I caught you — the Captain sent me running the moment the throne hall emptied!',
      'It’s the Princess. The pretender… he didn’t flee alone. He took her THROUGH one of those tears in the sky, out past the southern isles.',
      'King Karl is beside himself. He asks — he BEGS — that you follow. Three portals, three worlds between you and her.',
      'I’d come myself, but… my sword is mostly for pointing. (he points it, southward) That way, Sir Knight. Bring her home.'],null,()=>{ setTimeout(()=>{ world.scene.remove(f.g); const i=world.folk.indexOf(f); if(i>=0) world.folk.splice(i,1); },1500); });
    mat=null; }

  // ── the worlds beyond ──
  const built={};
  function worldLevel(id){ const D=WORLDS[id]; if(!D) return null; if(built[id]) return built[id];
    // Tabor is two islands: frozen, and (once the King of the Shadows falls) thawed — applyTaborThaw
    const thaw=id==='tabor'&&!!(S().tabor&&S().tabor.thawed)&&!!D.thawed;
    // the packed grid, as data/world.json's: tiles then walk<<4 | height
    const WD={W:D.W,H:D.H,raw:thaw?D.thawed.raw:D.raw}; WD.buildings=[]; WD.decor=[]; WD.signs=Object.assign({},(thaw?D.thawed.signs:D.signs)||{}); WD.villagers=[]; WD.barriers=[]; WD.barrierSets={}; WD.themes={}; WD.zones=[];
    WD.towns=(D.villages||[]).map(v=>[v.name,v.cx,v.cy]).concat(D.castle?[['The castle',D.castle.cx,D.castle.cy]]:[]);
    (D.villages||[]).forEach(v=>WD.buildings.push({id:'pw_'+v.id,name:`The chapel of ${v.name}`,style:'chapel',x:v.cx-1,y:v.cy-1,w:3,h:2,door:v.chapelDoor}));
    if(D.castle){ const c=D.castle; WD.buildings.push({id:'pw_castle',name:'The castle',style:'keep',x:c.cx-6,y:c.cy-4,w:13,h:9,door:c.gate}); }
    (D.props||[]).forEach(p=>{ if(p.kind==='cottage') WD.buildings.push({id:'pw_cot'+p.x+'_'+p.y,name:'A shepherd’s cottage',style:'cottage',x:p.x,y:p.y,w:p.w,h:p.h,door:{x:p.x+(p.w>>1),y:p.y+p.h-1}});
      else if(p.kind==='windmill') WD.decor.push({x:p.x,y:p.y,kind:'mt_windmill',w:2}); else if(p.kind==='bentTree') WD.decor.push({x:p.x,y:p.y,kind:'mt_bentTree',w:1}); });
    if(id!=='mistral') (D.sheep||[]).forEach(q=>WD.decor.push({x:Math.round(q.px),y:Math.round(q.py),kind:'mt_sheep',w:1}));
    if(thaw){ (D.thawed.palms||[]).forEach(p=>WD.decor.push({x:p.x,y:p.y,kind:'palm',w:1})); }
    if(id==='sunfall'&&D.town){ const C=D.town.cath; WD.buildings.push({id:'sf_cath',name:'The Cathedral of the Setting Sun',style:'chapel',x:C.x0,y:C.y0,w:C.x1-C.x0+1,h:C.y1-C.y0+1,door:C.door});
      (D.town.houses||[]).forEach(h=>WD.buildings.push({id:'sf_'+h.id,name:'A house in Vesper',style:'house',x:h.x0,y:h.y0,w:h.x1-h.x0+1,h:h.y1-h.y0+1,door:h.door})); }
    const Q=id==='mistral'&&typeof mistralQuest==='function'?mistralQuest(D):id==='tabor'&&typeof taborQuest==='function'?taborQuest(D,thaw,()=>rebuild(id)):id==='sunfall'&&typeof sunfallQuest==='function'?sunfallQuest(D):null;   // 🌬 mistral.js · ⛰ tabor.js
    const lv=buildWorld(WD,{id:'pw:'+id,name:id==='mistral'?'Mistral':id==='tabor'?'Mount Tabor':id==='sunfall'?'Sunfall':id,land:id,mountain:id==='tabor'&&D.cx!==undefined?{cx:D.cx,cy:D.cy,R:D.R,peak:D.peak}:null,thawed:thaw||((x,y)=>!!(built[id]&&built[id].thawAt&&built[id].thawAt(x,y))),sky:Q&&Q.sky,sealed:()=>false,chapelLight:b=>Q?Q.chapelLight(b):false,
      enter:b=>Q?Q.enter(b):null, hollow:()=>null});
    lv.speed=5.0; lv.scene.fog.near=22; lv.scene.fog.far=52;
    (D.shepherds||[]).forEach(sh=>{ const x=sh.px+0.5, z=sh.py+0.5; addPerson(lv,lv.scene,'peasant',x,z,lv.ground(x,z),'Shepherd of '+((D.villages||[]).find(v=>v.id===sh.village)||{}).name,sh.lines.before,{rest:0}); });
    const r=D.retTile||{x:D.cx,y:D.cy+D.R}; lv.arrive={x:D.entry.x+0.5,z:D.entry.y+0.5,face:Math.PI}; for(const k of [2,1]) if(lv.walkTile(D.entry.x,D.entry.y-k)&&lv.E(D.entry.x,D.entry.y-k)===lv.E(D.entry.x,D.entry.y)){ lv.arrive.z=D.entry.y-k+0.5; break; }   // a step or two up from the arch, so the camera isn't inside it
    const arch=portalModel(COL[id],false); arch.position.set(r.x+0.5,lv.ground(r.x+0.5,r.y+0.5),r.y+0.5); arch.rotation.y=Math.PI; lv.scene.add(arch); lv.anim.push(t=>arch.userData.tick(t));
    const pr=PORTALS.find(q=>q.id===id);
    lv.spots.push({x:r.x+0.5,z:r.y+0.2,r:1.3,label:'Return',who:'The way home',action:()=>{ ENGINE.go('world',{x:pr.tx+0.5,z:pr.ty+1.8,face:Math.PI}); setTimeout(()=>UI.toast('🌀 You step back into Luminar, on the summit.',2000),450); }});
    const zone=lv.zone; lv.zone=p=>{ const z=zone(p).split(' · ')[0]; return id==='tabor'?'⛰ '+z:'🌬 '+(z==='The open country'?'The Mistral highlands':z); };
    if(Q) Q.attach(lv);
    guide(lv);
    // the minimap, drawn from the world's own tiles, its quest marks pinned
    { const TC={0:0x78a862,1:0x3f7a44,2:0xc8a868,3:0x2f6f9c,4:0x6cb065,5:0x8d919b,6:0xb89a78,9:0x8a5a3a,10:0xa89c88,11:0xa89c88,15:0x5b9e5c,19:0xe0cf9c,20:0x5fb0c8,21:0x3f8ec0,22:0xdde5ee,25:0x8a7466,27:0x7a6656,32:0x9a7a58,33:0x7a7a7a,34:0x8e98a8,35:0xb026ff,53:0xe8c050,61:0xbfdcec,62:0xd8f0ff,63:0xc4ccc0,80:0xc0a07a,90:0x9a948a,91:0xb07ab0,92:0x9ac870,93:0x8a9a3a,98:0x2f5f42};
      const thawC={22:0x7ab65a,61:0x8cc070,34:0x9a7a58,63:0x5cc86a,62:0x5ab8e8,98:0x3a7a44};
      const img=tileMap(lv.W,lv.H,lv.T,t=>t===81?null:(thaw&&thawC[t]!==undefined?thawC[t]:TC[t]!==undefined?TC[t]:0x9a9a9a));
      MINIMAP.add(lv,{img,W:lv.W,H:lv.H,bg:id==='sunfall'?'#3a1222':'#1a3a5a',pins:()=>{ const tg=lv.guideTarget&&lv.guideTarget(), out=[{x:(D.retTile||{x:D.cx,y:D.cy+D.R}).x+0.5,y:(D.retTile||{x:D.cx,y:D.cy+D.R}).y+0.5,col:'#c070ff',r:3}]; if(tg) out.push({x:tg[0]+0.5,y:tg[1]+0.5,col:'#ffa418',r:4}); return out; }}); }
    ENGINE.add(lv); built[id]=lv; return lv; }
  // ✨ the guiding light: a trail of motes along the way (the walk rule, tile by tile) to whatever the quest needs
  //    next (lv.guideTarget() → [x,y]). Recomputed twice a second; the next dozen tiles glow in turn.
  function guide(lv){ const N=14, mat=new THREE.MeshBasicMaterial({color:0xffa418,transparent:true,opacity:0.9,depthWrite:false});
    const motes=[]; for(let i=0;i<N;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,6),mat.clone()); m.visible=false; lv.scene.add(m); motes.push(m); }
    let path=[], tAcc=1;
    function find(tx,ty){ const W=lv.W, sx=Math.floor(ENGINE.P.x), sy=Math.floor(ENGINE.P.z), key=(x,y)=>y*W+x, prev=new Map([[key(sx,sy),-1]]), q=[[sx,sy]];
      const cap=lv.guideNodes||9000; for(let i=0;i<q.length&&q.length<cap;i++){ const [x,y]=q[i]; if(Math.abs(x-tx)+Math.abs(y-ty)<=1){ const out=[]; let k=key(x,y); while(k!==-1){ out.push([k%W,(k/W)|0]); k=prev.get(k); } return out.reverse(); }
        for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+a, Y=y+b, k=key(X,Y); if(prev.has(k)||X<0||Y<0||X>=W||Y>=lv.H) continue; if(!lv.canMove(x+0.5,y+0.5,X+0.5,Y+0.5)&&!(lv.guidePass&&lv.guidePass(X,Y))) continue; prev.set(k,key(x,y)); q.push([X,Y]); } } return []; }
    lv.anim.push((t,dt)=>{ if(ENGINE.level!==lv){ return; } tAcc+=dt||0.016;
      if(tAcc>0.5){ tAcc=0; const tg=lv.guideTarget&&lv.guideTarget(); path=tg?find(tg[0],tg[1]):[]; }
      const vs=VIEWMODE.ps(lv); motes.forEach((m,i)=>{ const p=path[i+1]; m.visible=!!p&&path.length>2; if(!m.visible) return; const x=p[0]+0.5, z=p[1]+0.5;
        m.position.set(x,lv.ground(x,z)+0.25+Math.sin(t*3+i*0.6)*0.06,z); m.scale.setScalar(Math.max(0.7,vs*2)*(1-i/N*0.4)); m.material.opacity=(0.5+0.5*Math.max(0,Math.sin(t*4-i*0.45)))*(1-i/N*0.5); }); }); }
  function rebuild(id){ const old=built[id]; delete built[id]; const lv=worldLevel(id); if(old&&old.combat) COMBAT.clear(old); return lv; }
  return { open, worldLevel, gates, rebuild };
}
