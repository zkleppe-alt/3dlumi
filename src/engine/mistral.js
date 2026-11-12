// ════════════════════════════════════════════════════════════════
//  🌬 MISTRAL'S QUEST — the windswept shepherd highlands beyond the first portal (data/portal_mistral.json,
//  the game's own rules: mistralProgress, spawnMistralKnights, onFallenKnightKilled, beginTeaching, tickHerding,
//  enterMistralThrone, tickThroneBoss, throneFlee, throneLastStand, freeSteward, throneAftermath).
//   • Grey shadows — fallen knights that wear your very shape, hollow within — hold the five folds: five guardians
//     ring each chapel square, ten wanderers roam the fields (stronger by night). They never come back once cut down.
//   • A square cleared, enter its chapel: the freed villagers gather and you speak the blessing (CHAPEL_BLESSINGS) —
//     the fold is cleansed, its chapel bell rings, its verse goes into the codex (CHAPEL_VERSES).
//   • Then its lost sheep (3–5 a fold) will follow you, nose to tail, to the pen by the chapel. A blow scatters them.
//     All home: 60 + 15 a sheep from the shepherd.
//   • All five folds cleansed, the castle gate in the north opens. The Usurped Hall: the Pretender's temptation,
//     then the fight (THRONE_MOVES; pillars stop his shots; at 75/50/25% he raises his hollow men and cannot be
//     touched while they stand). At 18% he flees with Princess Madison through a tear in the air; five of his
//     strongest hold the hall. Cut them down, free the steward from his cage — Mistral is free: Tabor's gate opens,
//     the Spectral Barding and 3 skill points are yours.
//  Saved in S.mistral: { villages:{id:{guardsDown,squareClear,cleared,lostTotal,lostGathered,herdDone}}, wanderersDown,
//  throne:{fled,purified} }.
//  mistralQuest(D) → { enter(b), chapelLight(b), attach(lv) }   (portals.js asks for it before raising the world)
// ════════════════════════════════════════════════════════════════
const CHAPEL_BLESSINGS={
  fold:[['Freed villagers',"The hollow ones told us we were forgotten — left to the wolves."],['You',"Hear the truth: 'What man of you, having a hundred sheep, if he lose one, doth not leave the ninety and nine, and go after that which is lost, until he find it?'"],['You',"You were never forgotten. The Shepherd Himself came for you."],['Freed villagers',"Then we are found. We are His still."]],
  brook:[['Freed villagers',"They fouled our well and said no clean thing remained for us."],['You',"'Whosoever drinketh of the water that I shall give him shall never thirst.'"],['You',"The pretender poisons wells; the Lord gives living water. Drink, and be restored."],['Freed villagers',"The water runs clear again — and so do we."]],
  meadowe:[['Freed villagers',"A false lord wore a crown and demanded we bow. We almost did."],['You',"'I am the door: by Me if any man enter in, he shall be saved.'"],['You',"The pretender is a shadow wearing a crown. There is one true Shepherd, the King of kings — and He lays down His life for the sheep, not takes yours."],['Freed villagers',"We bow now only to the Lord."]],
  millford:[['Freed villagers',"We doubted any rescue would come. Our faith was too small."],['You',"'If ye have faith as a grain of mustard seed... nothing shall be impossible unto you.'"],['You',"Small faith in a great God is enough. He does not despise the doubting heart that turns to Him."],['Freed villagers',"Then our small faith will grow."]],
  downs:[['Freed villagers',"The castle still stands. The pretender is not yet beaten."],['You',"'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.'"],['You',"Five folds are freed. Now go — and He goes with you, to the very gate."],['Freed villagers',"Go, knight. All Mistral prays you home."]] };
const CHAPEL_VERSES={ fold:['Luke 15:4','What man of you, having an hundred sheep, if he lose one, doth not leave the ninety and nine, and go after that which is lost, until he find it?'],
  brook:['John 4:14','Whosoever drinketh of the water that I shall give him shall never thirst.'], meadowe:['Psalm 23:2','He maketh me to lie down in green pastures: he leadeth me beside the still waters.'],
  millford:['Matthew 11:28','Come unto me, all ye that labour and are heavy laden, and I will give you rest.'], downs:['Isaiah 40:11','He shall feed his flock like a shepherd: he shall gather the lambs with his arm, and carry them in his bosom.'] };
const THRONE_MOVES=[{kind:'volley',count:5,telegraph:26,speed:3.2},{kind:'spread',count:12,telegraph:26,speed:2.9},{kind:'charge',telegraph:24,speed:7.5},
  {kind:'volley',count:6,telegraph:24,speed:3.4},{kind:'slam',telegraph:26,ringSpeed:4.8,ringMax:170},{kind:'spread',count:15,telegraph:24,speed:3.3}];
// several voices in a row: consecutive lines by one speaker are one box
function speakSeq(lines,then){ const groups=[]; lines.forEach(([w,t])=>{ const g=groups[groups.length-1]; if(g&&g[0]===w) g[1].push(t); else groups.push([w,[t]]); });
  const next=i=>{ if(i>=groups.length){ if(then) then(); return; } ENGINE.speak(groups[i][0],groups[i][1],null,()=>next(i+1)); }; next(0); }
// a fallen knight: your own shape, grey and hollow
function hollowKnight(tint){ const k=buildKnight(); k.setLivery('knight',{TUNIC:tint||'#6a6a74',TUNIC_RIM:'#8a8a94',LEG:'#4a4a52',PLUME:'#9a9aa4',HELM:'#7a7a84'});
  const seen=new Map(); k.traverse(m=>{ if(!m.isMesh||!m.material) return; let c=seen.get(m.material); if(!c){ c=m.material.clone(); if(c.color){ const h={}; c.color.getHSL(h); c.color.setHSL(h.h,h.s*0.15,Math.min(0.62,h.l*0.9+0.05)); }
      c.transparent=true; c.opacity=0.82; if(c.emissive) c.emissive.setHex(0x101018); seen.set(m.material,c); } m.material=c; m.castShadow=true; });
  return k; }

function mistralQuest(D){
  const S=()=>GAME.S, P=ENGINE.P;
  const M=()=>{ const s=S(); if(!s.mistral||typeof s.mistral!=='object'||!s.mistral.villages) s.mistral={villages:{},wanderersDown:0,throne:{}}; s.mistral.throne=s.mistral.throne||{}; return s.mistral; };
  const lostOf=id=>(D.lost||[]).filter(l=>l.village===id);
  const V=id=>{ const m=M(); return m.villages[id]||(m.villages[id]={guardsDown:0,squareClear:false,cleared:false,lostTotal:lostOf(id).length,lostGathered:0,herdDone:false}); };
  const VIL=D.villages||[], cleanCount=()=>VIL.filter(v=>V(v.id).cleared).length, TH=()=>M().throne;
  const night=()=>{ const f=S().dayFrac; return f>=0.875||f<0.25; };
  let world=null;
  // ── the doors: a fold's chapel, or the castle gate ──
  function enter(b){ if(/^pw_cot/.test(b.id)) return null;
    if(b.id==='pw_castle') return ()=>{ if(cleanCount()<VIL.length&&!TH().purified){ ENGINE.speak('The great gate',[`🔒 The great gate is barred. Cleanse all five folds first. (${cleanCount()} of ${VIL.length})`]); return; } ENGINE.go('mistral:throne',throneSpawn); };
    const v=VIL.find(q=>'pw_'+q.id===b.id); if(!v) return null;
    return ()=>ENGINE.go('mistral:chapel:'+v.id,null); }
  const chapelLight=b=>{ const v=VIL.find(q=>'pw_'+q.id===b.id); return !!(v&&V(v.id).cleared); };

  // ════ the highlands ════
  function attach(lv){ world=lv;
    COMBAT.arena(lv,{ mode:'world', tier:0, W:lv.W||D.W, H:lv.H||D.H, walk:(x,y)=>lv.walkTile(x,y), onKill:killed,
      onDeath:()=>{ scatter(true); ENGINE.go(lv.id,lv.arrive); setTimeout(()=>UI.toast('💫 You fall… and wake by the gate you came in by.',2200),450); } });
    const pe=lv.onEnter; lv.onEnter=sp=>{ if(pe) pe(sp); spawn(); };
    // the shepherds
    (D.shepherds||[]).forEach(sh=>{ const f=lv.folk.find(q=>Math.abs(q.x-(sh.px+0.5))<0.01&&Math.abs(q.z-(sh.py+0.5))<0.01); if(!f) return;
      f.action=()=>{ const v=VIL.find(q=>q.id===sh.village), st=V(sh.village), L=sh.lines||{before:['…'],after:['…']};
        if(!st.cleared){ ENGINE.speak('Shepherd',L.before,f); return; } const remain=Math.max(0,st.lostTotal-st.lostGathered), lines=L.after.slice();
        if(st.herdDone) lines.push('Every last lamb is back in the fold. Bless you, knight.');
        else if(remain>0) lines.push(`But ${remain} of my sheep are still lost out in the fields — ${st.lostTotal} strayed when the shadows came. Bring them to the pen by the chapel, if you can. Mind the wanderers; a fright will scatter them.`);
        ENGINE.speak('Shepherd',lines,f); }; });
    // the pens by each chapel: dry-stone and hurdle, open at the gate
    (D.pens||[]).forEach(p=>{ const g=group(0,0,0,lv.scene), y0=lv.ground(p.x+p.w/2,p.y+p.h/2), post=0x7a5a3a;
      const rail=(x0,z0,x1,z1)=>{ const L=Math.hypot(x1-x0,z1-z0), m=B(L,0.08,0.06,post,(x0+x1)/2,y0+0.45,(z0+z1)/2,g); m.rotation.y=-Math.atan2(z1-z0,x1-x0); const m2=B(L,0.08,0.06,post,(x0+x1)/2,y0+0.2,(z0+z1)/2,g); m2.rotation.y=m.rotation.y; };
      const x0=p.x, x1=p.x+p.w, z0=p.y, z1=p.y+p.h, gx=p.gate.x;
      rail(x0,z0,x1,z0); rail(x0,z0,x0,z1); rail(x1,z0,x1,z1); rail(x0,z1,gx,z1); rail(gx+1,z1,x1,z1);
      for(let x=x0;x<=x1;x++){ Cy(0.05,0.05,0.62,5,post,x,y0,z0,g); Cy(0.05,0.05,0.62,5,post,x,y0,z1,g); } for(let z=z0+1;z<z1;z++){ Cy(0.05,0.05,0.62,5,post,x0,y0,z,g); Cy(0.05,0.05,0.62,5,post,x1,y0,z,g); }
      shade(g); g.scale.y=Math.max(0.6,VIEWMODE.ps(lv)*1.6); });
    // the lost sheep (tickHerding)
    const vs=()=>VIEWMODE.ps(lv);
    const flock=(D.lost||[]).map(l=>{ const g=new THREE.Group(); DECOR_KINDS.mt_sheep({v:l.variant},g); lv.scene.add(shade(g)); return {l,g,x:l.px+0.5,z:l.py+0.5,state:'hiding',t:Math.random()*9}; });
    function placeFlock(){ VIL.forEach(v=>{ const st=V(v.id), pen=(D.pens||[]).find(p=>p.vid===v.id); let k=st.lostGathered;
        flock.filter(s=>s.l.village===v.id).forEach(s=>{ if(k>0&&pen){ k--; s.state='penned'; s.x=pen.x+0.6+Math.random()*(pen.w-1.2); s.z=pen.y+0.6+Math.random()*(pen.h-1.2); } else if(s.state!=='following'){ s.state='hiding'; } }); }); }
    // the folds' own flocks (tickFlock): they graze and amble about home; while their fold is held by the shadows
    // they huddle — drifting in close to the fold, bunched, skittish — and wander free again once it is cleansed
    const herd=(D.sheep||[]).map(q=>{ const g=new THREE.Group(); DECOR_KINDS.mt_sheep({v:q.variant},g); lv.scene.add(shade(g)); g.rotation.y=Math.random()*6.28;
      return {q,g,x:q.px+0.5,z:q.py+0.5,tx:q.px+0.5,tz:q.py+0.5,wait:Math.random()*4,t:Math.random()*9,hx:q.hx+0.5,hz:q.hy+0.5,ha:Math.atan2(q.py-q.hy,q.px-q.hx)+(Math.random()-0.5)*0.5,hr:2.3+Math.random()*0.7}; });
    lv.herd=herd; const grass=(x,y)=>lv.walkTile(x,y)&&[0,2,4,6,19].includes(lv.T(x,y));
    lv.anim.push((t,dt)=>{ if(ENGINE.level!==lv||!dt) return; const sc=vs();
      herd.forEach(h=>{ h.t+=dt; const v=V(h.q.village), scared=!(v&&v.cleared); let mv=0;
        if(scared){ const gx=h.hx+Math.cos(h.ha)*h.hr, gz=h.hz+Math.sin(h.ha)*h.hr, dx=gx-h.x, dz=gz-h.z, d=Math.hypot(dx,dz);   // in to the fold, each to its own spot in the ring about the chapel
          const nx=h.x+dx/(d||1)*0.3, nz=h.z+dz/(d||1)*0.3;
          if(d>0.25&&lv.walkTile(Math.floor(nx),Math.floor(nz))){ const sp=Math.min(d,1.9*dt); h.x+=dx/d*sp; h.z+=dz/d*sp; h.g.rotation.y=Math.atan2(dx,dz); mv=1; }
          else if(Math.random()<dt*0.8) h.g.rotation.y+=(Math.random()-0.5)*1.6; }   // a nervous glance about
        else { if(h.wait>0){ h.wait-=dt; } else { const dx=h.tx-h.x, dz=h.tz-h.z, d=Math.hypot(dx,dz);
            if(d<0.08){ h.wait=1+Math.random()*2.7; for(let k=0;k<12;k++){ const ax=Math.round(h.q.hx+(Math.random()*2-1)*5), ay=Math.round(h.q.hy+(Math.random()*2-1)*5); if(grass(ax,ay)){ h.tx=ax+0.3+Math.random()*0.4; h.tz=ay+0.3+Math.random()*0.4; break; } } }
            else { const sp=Math.min(d,1.3*dt); h.x+=dx/d*sp; h.z+=dz/d*sp; h.g.rotation.y=Math.atan2(dx,dz); mv=1; } } }
        h.g.scale.setScalar(sc); const bob=mv?Math.abs(Math.sin(h.t*(scared?12:8)))*0.05:scared?Math.abs(Math.sin(h.t*9))*0.015:0;   // a shiver while they huddle
        h.g.position.set(h.x,lv.ground(h.x,h.z)+bob,h.z); }); });
    placeFlock();
    let followers=[], lastHp=null;
    lv.guideTarget=()=>{ const P0=P, near=list=>list.sort((a,b)=>Math.hypot(a[0]-P0.x,a[1]-P0.z)-Math.hypot(b[0]-P0.x,b[1]-P0.z))[0]||null;
      if(followers.length){ const pen=(D.pens||[]).find(p=>p.vid===followers[0].l.village); if(pen) return [pen.gate.x,pen.gate.y]; }
      const sq=VIL.filter(v=>!V(v.id).squareClear).map(v=>{ const f=lv.combat.foes.find(d=>d.alive&&d.village===v.id); return f?[Math.floor(f.x),Math.floor(f.z)]:[v.cx,v.cy+2]; });
      const ch=VIL.filter(v=>V(v.id).squareClear&&!V(v.id).cleared).map(v=>[v.chapelDoor.x,v.chapelDoor.y+1]);
      if(ch.length) return near(ch); if(sq.length) return near(sq);
      const lost=flock.filter(s=>s.state==='hiding'&&V(s.l.village).cleared).map(s=>[Math.floor(s.x),Math.floor(s.z)]); if(lost.length) return near(lost);
      if(!TH().purified) return [D.castle.gate.x,D.castle.gate.y+1]; return null; };
    function scatter(silent){ if(!followers.length) return; followers.forEach(s=>{ s.state='hiding'; const v=VIL.find(q=>q.id===s.l.village); if(!v) return;
        for(let i=0;i<20;i++){ const a=Math.random()*6.28, r=8+Math.random()*5, x=Math.round(v.cx+Math.cos(a)*r), y=Math.round(v.cy+Math.sin(a)*r); if(lv.walkTile(x,y)){ s.x=x+0.5; s.z=y+0.5; break; } } });
      followers=[]; if(!silent) UI.toast('🐑 The frightened sheep scatter!',1400); }
    lv.anim.push((t,dt)=>{ dt=dt||0.016; if(ENGINE.level!==lv) return; const s0=S(); if(lastHp!==null&&s0.hp<lastHp) scatter(); lastHp=s0.hp;
      // the hollow men walk
      flock.forEach(s=>{ const v=VIL.find(q=>q.id===s.l.village);
        if(s.state==='hiding'&&v&&V(v.id).cleared&&Math.hypot(P.x-s.x,P.z-s.z)<1.3*Math.max(1,vs()*1.6)){ s.state='following'; followers.push(s); UI.toast('🐑 Baa! A lost sheep falls in behind you.',1200); } });
      const SP=0.9*Math.max(0.6,vs()*1.4); followers.forEach((s,i)=>{ const lead=i===0?P:followers[i-1], dx=lead.x-s.x, dz=lead.z-s.z, d=Math.hypot(dx,dz)||1;
        if(d>SP){ const sp=Math.min(6,(d-SP)*3)*dt; s.x+=dx/d*sp; s.z+=dz/d*sp; s.g.rotation.y=Math.atan2(dx,dz); } });
      flock.forEach(s=>{ s.t+=dt; const sc=vs()*1.0; s.g.scale.setScalar(sc); const bob=s.state==='hiding'?Math.abs(Math.sin(s.t*6))*0.04:s.state==='following'?Math.abs(Math.sin(s.t*10))*0.05:0;
        s.g.position.set(s.x,lv.ground(s.x,s.z)+bob,s.z); if(s.state==='penned'&&Math.random()<0.004) s.g.rotation.y=Math.random()*6.28; });
      // deliver at the pen
      const px=Math.floor(P.x), pz=Math.floor(P.z), pen=(D.pens||[]).find(p=>Math.abs(px-(p.x+p.w/2))<=p.w/2+0.5&&Math.abs(pz-(p.y+p.h/2))<=p.h/2+0.5);
      if(pen&&followers.some(s=>s.l.village===pen.vid)){ const st=V(pen.vid); let n=0;
        followers=followers.filter(s=>{ if(s.l.village!==pen.vid) return true; s.state='penned'; s.x=pen.x+0.6+Math.random()*(pen.w-1.2); s.z=pen.y+0.6+Math.random()*(pen.h-1.2); n++; return false; });
        st.lostGathered=Math.min(st.lostTotal,st.lostGathered+n); const v=VIL.find(q=>q.id===pen.vid);
        if(st.lostGathered>=st.lostTotal&&!st.herdDone){ st.herdDone=true; const reward=60+st.lostTotal*15; s0.gold+=reward; GAME.changed();
          ENGINE.speak(`🐑 All of ${v?v.name:'the fold'}’s lost sheep are home!`,[`The shepherd rewards you with ${reward} gold.`,'“There is joy over one sheep that was lost and is found.”']); }
        else UI.toast(`🐑 Penned ${n} — ${st.lostGathered} of ${st.lostTotal} home.`,1600); GAME.save(); } });
    lv.flockReset=()=>{ followers=[]; flock.forEach(s=>{ if(s.state==='following') s.state='hiding'; }); placeFlock(); };
    const pl=lv.onLeave; lv.onLeave=()=>{ scatter(true); if(pl) pl(); };
    const zone=lv.zone; lv.zone=p=>{ const v=VIL.find(q=>Math.hypot(q.cx-p.x,q.cy-p.z)<9); if(v){ const st=V(v.id); return `🌬 ${v.name} — ${st.cleared?'cleansed':st.squareClear?'the square is clear':'held by grey shadows'}`; } return zone(p); };
  }
  // the grey shadows, survivors only (spawnMistralKnights)
  function spawn(){ const lv=world; COMBAT.clear(lv); const nb=night(), m=M();
    const mk=(x,y,o)=>{ const lvl=o.level, beef=(nb?1.6:1)*(o.wander?1.15:1), hp=Math.round((16+lvl*3)*beef);
      COMBAT.foe(lv,{x:x+0.5,z:y+0.5,hp,level:lvl,xp:8+lvl*3,atk:Math.round((7+lvl)*(nb?1.35:1)),nightBuff:nb,village:o.village||null,wander:!!o.wander,fallen:true,walking:true,model:hollowKnight(nb?'#2a2236':undefined)}); };
    VIL.forEach(v=>{ const st=V(v.id); if(st.squareClear) return; const n=5-st.guardsDown; if(n<=0){ st.squareClear=true; return; } let placed=0, tries=0;
      while(placed<n&&tries<200){ tries++; const a=Math.random()*6.283, r=2+Math.random()*4, x=Math.round(v.cx+Math.cos(a)*r), y=Math.round(v.cy+2+Math.sin(a)*r);
        if(lv.walkTile(x,y)&&[0,2,4,6].includes(lv.T(x,y))&&Math.hypot(x-v.cx,y-(v.cy+2))>1.5){ mk(x,y,{village:v.id,level:6}); placed++; } } });
    const left=Math.max(0,10-(m.wanderersDown|0)); let made=0, tries=0;
    while(made<left&&tries<400){ tries++; const x=5+Math.floor(Math.random()*(D.W-10)), y=5+Math.floor(Math.random()*(D.H-10));
      if(lv.walkTile(x,y)&&[0,2,4].includes(lv.T(x,y))&&Math.hypot(x-D.entry.x,y-D.entry.y)>10){ mk(x,y,{wander:true,level:7}); made++; } }
    if(lv.flockReset) lv.flockReset(); }
  function killed(d){ const m=M();
    if(d.wander){ m.wanderersDown=Math.min(10,(m.wanderersDown|0)+1); GAME.save(); return; }
    if(d.village){ const st=V(d.village); st.guardsDown=Math.min(5,st.guardsDown+1);
      if(st.guardsDown>=5&&!st.squareClear){ st.squareClear=true; const v=VIL.find(q=>q.id===d.village);
        ENGINE.speak('⚔️ The square is clear.',[`The fallen guardians of ${v?v.name:'the village'} are undone. Enter the chapel to restore it.`]); }
      GAME.save(); } }

  // ════ a fold's chapel (buildMistralChapel) ════
  VIL.forEach(v=>ENGINE.add({id:'mistral:chapel:'+v.id,lazy:()=>chapelRoom(v)}));
  function chapelRoom(v){ const W=9, H=12, g=[]; for(let y=0;y<H;y++){ g.push([]); for(let x=0;x<W;x++) g[y].push(y===0||y===H-1||x===0||x===W-1?5:12); }
    for(let x=1;x<W-1;x++){ g[1][x]=15; g[2][x]=15; } [2,3,5,6].forEach(x=>g[1][x]=17); g[1][4]=18; for(let x=1;x<W-1;x++) g[3][x]=14;
    for(const y of [5,6,8,9]){ [2,3].forEach(x=>g[y][x]=13); [5,6].forEach(x=>g[y][x]=13); } g[H-1][4]=9;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x101418); scene.fog=new THREE.Fog(0x101418,14,30);
    const lv={id:'mistral:chapel:'+v.id,name:`${v.name} Chapel`,scene,folk:[],spots:[],anim:[],cam:{pitch:0.55,dist:6,min:3,max:9}};
    const hemi=new THREE.HemisphereLight(0xfff4e4,0x3a3040,0.5); scene.add(hemi); const altarL=new THREE.PointLight(0xffd27a,0,10,1.4); altarL.position.set(4.5,2.4,2); scene.add(altarL);
    const key=new THREE.DirectionalLight(0xe8f0ff,0.3); key.position.set(3,10,9); scene.add(key);
    const R=group(0,0,0,scene), fh=(x,y)=>{ const t=g[y]&&g[y][x]; return t===15||t===17||t===18?0.24:t===14?0.12:0; };
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=g[y][x], cx=x+0.5, cz=y+0.5;
      if(t===5){ B(1,3,1,(x+y)%2?0xb8b0a0:0xaca492,cx,0,cz,R); continue; }
      B(0.98,0.1+fh(x,y),0.98,t===9?0x6a4a2e:t===13?0x8a7a62:(x+y)%2?0x9a8f7a:0x928770,cx,-0.1,cz,R);
      if(t===17){ B(0.96,0.8,0.8,0xe8e4dc,cx,0.24,cz,R); B(0.98,0.08,0.82,0x4a7aa8,cx,1.0,cz,R); if(x===2||x===6){ Cy(0.04,0.04,0.3,6,0xf4eee0,cx,1.08,cz,R); flame(cx,1.44,cz,R,lv.anim); } }
      if(t===18){ B(0.8,1.1,0.7,0x7a5a3a,cx,0.24,cz,R); const bk=B(0.6,0.05,0.4,0xf4eee0,cx,1.36,cz,R); bk.rotation.x=0.3; }
      if(t===13&&(x===2||x===5)){ B(1.9,0.42,0.42,0x7a5a3a,x+1,0,cz+0.1,R); B(1.9,0.5,0.08,0x6a4a2e,x+1,0.4,cz+0.3,R); } }
    // windows high in the side walls
    for(let y=4;y<=9;y+=3) [0.52,W-0.52].forEach(x=>{ const w=new THREE.Mesh(new THREE.PlaneGeometry(0.6,1.0),new THREE.MeshBasicMaterial({color:0x8ab8e0})); w.position.set(x,2,y+0.5); w.rotation.y=x<1?Math.PI/2:-Math.PI/2; R.add(w); });
    shade(R);
    const ok=(x,y)=>{ const t=g[y]&&g[y][x]; return t===12||t===14||t===15||t===9; };
    lv.ground=(x,z)=>fh(Math.floor(x),Math.floor(z)); lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0,0],[0.22,0],[-0.22,0],[0,0.22],[0,-0.22]]) if(!ok(Math.floor(tx+ox),Math.floor(tz+oz))) return false; return true; };
    lv.spawn={x:4.5,z:10.3,face:Math.PI,yaw:0};
    lv.spots.push({x:4.5,z:11.3,r:1.0,label:'Leave',who:'Leave',auto:[0,1],ar:0.8,action:()=>ENGINE.go('pw:mistral',{x:v.chapelDoor.x+0.5,z:v.chapelDoor.y+1.6,face:0})});
    // the freed villagers gather once the square is clear
    const folk=[[2.5,5.5],[6.5,5.5],[3.5,8.5],[5.5,8.5]].map(([x,z],i)=>{ const f=addPerson(lv,R,['peasant','farmer','child','pilgrim'][i],x,z,0,'Freed villager',["Thanks be to God — and to you, knight."],{rest:Math.PI*0+Math.PI}); f.still=false; return f; });
    const show=()=>{ const st=V(v.id), on=st.squareClear||st.cleared; folk.forEach(f=>{ f.g.visible=on; f.mute=!on; f.ghost=!on; }); altarL.intensity=st.cleared?1.1:0; hemi.intensity=st.cleared?0.7:0.42; };
    lv.onEnter=()=>{ show(); const st=V(v.id);
      if(st.squareClear&&!st.cleared) setTimeout(()=>speakSeq(CHAPEL_BLESSINGS[v.id]||[['Freed villagers','You have freed us. Thank you, knight.']],()=>cleanse(v,show)),700);
      else if(st.cleared) UI.toast(`⛪ ${v.name} Chapel — peace dwells here now.`,1600);
      else ENGINE.speak(`${v.name} Chapel`,['⛪ Shadows still hold this fold. Clear the square outside first.']); };
    return lv; }
  function cleanse(v,show){ const st=V(v.id); if(st.cleared) return; st.cleared=true; const C=CHAPEL_VERSES[v.id];
    if(C&&typeof LIBRARY!=='undefined') LIBRARY.codexAdd(`${v.name}’s chapel, Mistral Isle`,C[0],C[1]);
    GAME.changed(); GAME.save(); show(); const n=cleanCount();
    if(n>=VIL.length) ENGINE.speak('✨ All five folds are restored.',['A great bell tolls across Mistral. Far to the north, the castle gate grinds open — the pretender can no longer hide. The way stands open.']);
    else ENGINE.speak(`✨ ${v.name} is cleansed.`,[`The chapel bell rings clean and true. ${n} of ${VIL.length} folds restored.`,'Its lost sheep will follow you home now — the pen is by the chapel.']); }

  // ════ the Usurped Hall (buildMistralThrone) ════
  const TW=15, THH=17, throneSpawn={x:7.5,z:THH-1.6,face:Math.PI,yaw:0};
  ENGINE.add({id:'mistral:throne',lazy:()=>throneRoom()});
  function throneRoom(){ const W=TW, H=THH, g=[]; for(let y=0;y<H;y++){ g.push([]); for(let x=0;x<W;x++) g[y].push(y===0||y===H-1||x===0||x===W-1?5:12); }
    for(let y=1;y<=3;y++) for(let x=5;x<=9;x++) g[y][x]=21; g[1][7]=22; g[1][4]=24; g[1][10]=24; for(let y=3;y<H-1;y++) g[y][7]=23;
    [[4,6],[10,6],[4,9],[10,9],[4,12],[10,12]].forEach(([x,y])=>g[y][x]=20); g[H-1][7]=9;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0c0c12); scene.fog=new THREE.Fog(0x0c0c12,16,34);
    const lv={id:'mistral:throne',name:'The Usurped Hall',scene,folk:[],spots:[],anim:[],cam:{pitch:0.9,dist:10,min:6,max:14},speed:4.3,cornerHelp:true};
    const hemi=new THREE.HemisphereLight(0x8a90b0,0x1a1420,0.5); scene.add(hemi);
    const key=new THREE.DirectionalLight(0xd8e0ff,0.4); key.position.set(4,14,12); key.target.position.set(W/2,0,H/2); key.castShadow=true; key.shadow.mapSize.set(1024,1024); Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:40}); scene.add(key,key.target);
    const warm=new THREE.PointLight(0xffd8a0,0,22,1.2); warm.position.set(7.5,5,8); scene.add(warm);
    const R=group(0,0,0,scene), fh=(x,y)=>{ const t=g[y]&&g[y][x]; return t===21||t===22?0.2:0; };
    const torches=[];
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=g[y][x], cx=x+0.5, cz=y+0.5;
      if(t===5){ B(1,3.4,1,(x+y)%2?0x5a5a66:0x52525e,cx,0,cz,R); if((y===0&&x%3===1)||((x===0||x===W-1)&&y%3===1&&y>1&&y<H-1)){ const f=flame(cx+(x===0?0.55:x===W-1?-0.55:0),1.9,cz+(y===0?0.55:0),R,lv.anim,1.6); torches.push(f); } continue; }
      B(0.98,0.1+fh(x,y),0.98,t===23?0x7a2a34:t===21||t===22?0x4a4258:(x+y)%2?0x3a3a46:0x34343e,cx,-0.1,cz,R);
      if(t===20){ Cy(0.34,0.38,3.4,10,0x6a6a78,cx,0,cz,R); B(0.9,0.22,0.9,0x5a5a68,cx,0,cz,R); B(0.9,0.22,0.9,0x5a5a68,cx,3.2,cz,R); }
      if(t===24){ Cy(0.22,0.14,0.8,8,0x3a3240,cx,0.2,cz,R); const f=flame(cx,1.15,cz,R,lv.anim,2.2); torches.push(f); }
      if(t===22){ const th=group(cx,0.2,cz,R); B(1.2,2.4,0.3,0x2a2034,0,0,-0.3,th); B(1.0,0.55,0.7,0x3a2a48,0,0,0,th); [-0.55,0.55].forEach(a=>B(0.16,0.9,0.7,0x3a2a48,a,0,0,th)); Co(0.12,0.5,4,0xc8a448,0,2.4,-0.3,th); } }
    shade(R);
    const solidT=t=>t===5||t===20||t===22||t===24;
    const walk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&!solidT(g[y][x]);
    lv.ground=(x,z)=>fh(Math.floor(x),Math.floor(z));
    lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0,0],[0.22,0],[-0.22,0],[0,0.22],[0,-0.22]]) if(!walk(Math.floor(tx+ox),Math.floor(tz+oz))) return false; return true; };
    lv.spawn=throneSpawn; lv.zone=()=>TH().purified?'👑 The Steward’s Hall':fight&&fight.boss?'👑 THE PRETENDER KING':'👑 The Usurped Hall';
    lv.spots.push({x:7.5,z:H-0.7,r:1.0,label:'Leave',who:'Leave',auto:[0,1],ar:0.8,action:()=>{ if(fight&&(fight.boss||fight.last)){ UI.toast('The hall’s doors will not open while the fight goes on.',1400); return; } ENGINE.go('pw:mistral',{x:D.castle.gate.x+0.5,z:D.castle.gate.y+1.6,face:0}); }});
    // the Pretender seated, Madison in chains, the steward in his cage
    const seated=pretenderModel(0); seated.position.set(7.5,0.5,1.75); seated.rotation.y=0; scene.add(seated);
    const mad=addPerson(lv,R,'noble',9.5,2.5,0.2,'Princess Madison',['“Do not lose heart for my sake, knight! The Lord will provide.”'],{her:{main:'#e88ab0',trim:'#f2d27a'},rest:0}); mad.still=true;
    const chain=group(9.5,0.2,2.5,R); for(let i=0;i<5;i++) Sp(0.05,0x8a8a94,-0.1+i*0.05,0.6+i*0.12,-0.25,chain,5,4);
    const cage=group(2.5,0,6.5,R); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Cy(0.03,0.03,1.9,4,0x4a4a52,Math.sin(a)*0.45,0,Math.cos(a)*0.45,cage); } Cy(0.5,0.5,0.08,10,0x4a4a52,0,1.9,0,cage); Cy(0.5,0.5,0.08,10,0x4a4a52,0,0,0,cage); shade(cage);
    const stw=addPerson(lv,R,'monk',2.5,6.5,0,'The Steward',['The usurper is fled, but this hall need not stay empty. I will keep it — swept and lit — against the day a true king comes.','“Well done, good and faithful servant.” Go with God, knight. The way south lies open; Mount Tabor’s gate glows on the far shore.'],{rest:Math.PI/2});
    stw.mute=true; stw.ghost=true;
    function state(){ const T=TH(); seated.visible=!T.fled&&!T.purified&&!(fight&&(fight.boss||fight.cine)); mad.g.visible=chain.visible=!T.fled&&!(fight&&fight.seized); mad.mute=!mad.g.visible; mad.ghost=true;
      cage.visible=!T.purified&&!(fight&&fight.freed); if(T.purified){ stw.x=3.5; stw.z=7.5; stw.g.position.set(3.5,0,7.5); stw.mute=false; } warm.intensity=T.purified?0.9:0; hemi.intensity=T.purified?0.75:0.5; }
    let fight=null;
    COMBAT.arena(lv,{ mode:'finale', W, H, walk, onHit:d=>!(d.boss&&fight&&fight.warded), onKill:d=>{ if(d.boss) return; },
      onDeath:()=>{ endFight(); ENGINE.go('pw:mistral',{x:D.castle.gate.x+0.5,z:D.castle.gate.y+1.6,face:0}); setTimeout(()=>UI.toast('💫 The pretender’s power overwhelms you… but you wake at the gate, alive. Steel yourself and return.',2800),450); },
      tick:()=>tick() });
    lv.combat.tune={dmgMult:1,iframes:34,novaRange:0,novaShots:0,novaSpeed:0,novaLife:0,hotRadius:0,enrageDmg:1};
    function endFight(){ COMBAT.clear(lv); fight=null; }
    lv.onEnter=()=>{ const T=TH(); endFight(); state();
      if(T.purified){ UI.toast('👑 The Steward’s Hall — swept and lit.',1600); return; }
      if(T.fled){ startLastStand(); return; }
      ENGINE.speak('👑 The Usurped Hall',['A cold wind guts the torches. Upon a stolen throne, a crowned shadow waits.']); };
    lv.onLeave=()=>{ endFight(); };
    // the temptation, when you come up the aisle (y < 8)
    lv.anim.push((t,dt)=>{ if(ENGINE.level!==lv) return; const T=TH(); state(); if(seated.visible&&seated.userData.flap) seated.userData.flap(t);
      if(!T.fled&&!T.purified&&!fight&&P.z<8&&document.getElementById('say').hidden) temptation();
      if(fight&&fight.cine) cine(t,dt||0.016); if(fight&&fight.boss&&fight.boss.g.userData.flap) fight.boss.g.userData.flap(t);
 });
    function temptation(){ fight={tempting:true};
      speakSeq([['The Pretender',"So. The little knight climbs all this way. Do you know what I see when I look at you? A king. Bend the knee to me, and I will make it so."],
        ['The Pretender',"I hold every road, every crown, every throne in this land — and I would give them all to you. Riches beyond the counting-houses of Stormgate. Armies to call you sovereign. The princess on your arm and a kingdom at your feet."],
        ['The Pretender',"No more wandering. No more bleeding for a master who left you to it. Look around — I took all of this. Where was your God when the villages burned? I am the power here now. Worship me, and it is yours."],
        ['You',"You offer me what was never yours to give. There is one God, and He alone gives and takes away — kingdoms, crowns, and breath itself. Blessed be the name of the Lord."],
        ['You',"Every road you claim, every throne you have stolen, is held under His hand alone. I will not bow to a shadow wearing a crown. You are no king — only a thief who forgot he is already judged."],
        ['The Pretender',"...Then die with your God's name on your lips!"]],()=>startFight()); }
    function startFight(){ COMBAT.clear(lv); S().hp=S().maxHp; ENGINE.hud();
      const b=COMBAT.foe(lv,{x:7.5,z:2.5,hp:2600,level:0,xp:0,boss:true,noEnrage:true,name:'👑 THE PRETENDER KING',model:pretenderModel(0)});
      b.ai=ai; b.state='idle'; b.timer=26; b.moveIdx=0; b.anchorx=7.5; b.anchorz=2.5; b.guardUntil=0;
      fight={boss:b,waves:{},warded:false,wardCap:2600,regen:0,intro:26};
      ENGINE.speak('👑 THE PRETENDER KING',['He is stronger than the folds you freed. Read his attacks — duck behind the pillars, and strike in the openings.']); }
    const PX=COMBAT.PX, hurt=(d,ifr)=>{ const c=lv.combat; if(ifr){ const t=c.tune.iframes; c.tune.iframes=ifr; COMBAT.hurtFromBoss(d); c.tune.iframes=t; } else COMBAT.hurtFromBoss(d); };
    function ai(d,dx,dz,dist){ if(!fight||!fight.boss) return; const p=P;
      if(fight.intro>0){ fight.intro--; d.face=Math.atan2(dx,dz); return; }
      if(d.state==='idle'){ d.timer--; d.x+=(d.anchorx-d.x)*0.03; d.z+=(d.anchorz-d.z)*0.03; d.anchorx=7.5+Math.sin(Date.now()*0.0007)*3;
        if(d.timer<=0){ const mv=THRONE_MOVES[d.moveIdx%THRONE_MOVES.length]; d.moveIdx++; const rage=d.hp<d.maxHp*0.4?0.7:1; d.move=mv; d.kind=mv.kind; d.state='telegraph'; d.telegraph=Math.round(mv.telegraph*rage); d.telMax=d.telegraph; } }
      else if(d.state==='telegraph'){ d.telegraph--; if(d.kind==='charge'){ d.aimx=dx/dist; d.aimz=dz/dist; }
        if(d.telegraph<=0){ const mv=d.move;
          if(mv.kind==='volley'){ const a0=Math.atan2(dz,dx); for(let i=0;i<mv.count;i++){ const a=a0+(i-(mv.count-1)/2)*0.10; COMBAT.shot(d.x,d.z,Math.cos(a)*mv.speed*PX,Math.sin(a)*mv.speed*PX,200,false,0,85,0xe8892a); } d.state='idle'; d.timer=36; }
          else if(mv.kind==='spread'){ const off=Math.random()*0.5; for(let i=0;i<mv.count;i++){ const a=off+i/mv.count*Math.PI*2; COMBAT.shot(d.x,d.z,Math.cos(a)*mv.speed*PX,Math.sin(a)*mv.speed*PX,200,false,0,85,0xe8892a); } d.state='idle'; d.timer=38; }
          else if(mv.kind==='charge'){ d.state='charge'; d.timer=26; d.chx=d.aimx*mv.speed*PX; d.chz=d.aimz*mv.speed*PX; }
          else if(mv.kind==='slam'){ d.state='slam'; d.timer=16; d.ring=0; d.anchorx=d.x; d.anchorz=d.z; }
          else { d.state='idle'; d.timer=34; } } }
      else if(d.state==='charge'){ const nx=d.x+d.chx, nz=d.z+d.chz; if(!walk(Math.floor(nx),Math.floor(d.z))) d.chx*=-1; else d.x=nx; if(!walk(Math.floor(d.x),Math.floor(nz))) d.chz*=-1; else d.z=nz; d.timer--;
        if(Math.hypot(p.x-d.x,p.z-d.z)<0.85) hurt(130); if(d.timer<=0){ d.state='idle'; d.timer=30; d.anchorx=7.5; d.anchorz=2.5; } }
      else if(d.state==='slam'){ d.timer--; if(d.timer<=0&&d.ring===0){ d.ring=1; d.ringR=0; }
        if(d.ring){ d.ringR+=(d.move.ringSpeed||5)*PX; const rd=Math.hypot(p.x-d.anchorx,p.z-d.anchorz); if(Math.abs(rd-d.ringR)<0.55) hurt(105);
          if(d.ringR>(d.move.ringMax||160)*PX){ d.ring=0; d.state='idle'; d.timer=32; } } }
      if(dist<0.8) hurt(95); d.face=Math.atan2(dx,dz); }
    // the fight's rules each step: his hollow men, the ward and its slow mending, the flight
    function spot(){ for(let i=0;i<200;i++){ const x=1+Math.floor(Math.random()*(W-2)), y=4+Math.floor(Math.random()*(H-6)), t=g[y][x]; if(t!==12&&t!==23&&t!==21) continue; if(Math.hypot(x+0.5-P.x,y+0.5-P.z)<2.5) continue; return [x+0.5,y+0.5]; } return [7.5,12.5]; }
    const hollowAdd=(hp,dmg,lvl)=>{ const [x,z]=spot(); const m=hollowKnight('#5a5a66'); m.scale.setScalar(1.05); return COMBAT.add({x,z,hp,level:lvl,speed:1.25*PX,dmg,model:m,walking:true}); };
    function tick(){ if(!fight) return;
      if(fight.last){ if(!lv.combat.adds.some(a=>a.alive)){ fight.last=false; fight.freeable=true;
          ENGINE.speak('A voice from the cage',['Sir knight — here! By the west wall. They penned me here when the usurper took the hall.'],null,()=>UI.toast('🗝️ A caged man calls to you — go to the cage by the west wall and set him free.',3200));
          lv.spots.push(fight.cageSpot={x:2.5,z:6.5,r:1.4,label:'Free',who:'The cage',action:()=>freeSteward()}); } return; }
      const b=fight.boss; if(!b||!b.alive) return;
      fight.warded=lv.combat.adds.some(a=>a.alive);
      if(fight.warded&&b.hp<b.maxHp){ fight.regen+=1000/60; if(fight.regen>=250){ fight.regen=0; const cap=Math.min(b.maxHp,fight.wardCap); if(b.hp<cap) b.hp=Math.min(cap,b.hp+Math.round(b.maxHp*0.006)); } }
      [75,50,25].forEach(pct=>{ if(!fight.waves[pct]&&b.hp<=b.maxHp*pct/100){ fight.waves[pct]=true; fight.wardCap=b.hp+b.maxHp*0.10; const n=pct===25?4:3; for(let i=0;i<n;i++) hollowAdd(110+(100-pct),52,10);
          UI.toast('👑 “Rise, my hollow men!” The Pretender summons his fallen knights — he cannot be touched while they stand!',2600); } });
      if(b.hp<=b.maxHp*0.18) flee(); }
    function flee(){ const b=fight.boss; lv.combat.shots.forEach(s=>s.life=0); lv.combat.adds.forEach(a=>a.alive=false); const gm=b.g; lv.combat.foes.length=0; if(!gm.parent) scene.add(gm);
      gm.position.set(b.x,lv.ground(b.x,b.z),b.z); S().hp=S().maxHp; ENGINE.hud(); TH().fled=true; GAME.save();
      fight={cine:{phase:'fall',t:0,x:b.x,z:b.z,g:gm,portal:null},seized:false};
      ENGINE.speak('The Pretender',['— agh! … No. No, not like this.'],null,()=>{ if(fight&&fight.cine) fight.cine.phase='stagger'; }); }
    function cine(t,dt){ const c=fight.cine, gm=c.g; c.t+=dt;
      if(c.phase==='fall'){ gm.rotation.x=Math.min(1.2,gm.rotation.x+dt*3); return; }
      if(c.phase==='stagger'){ gm.rotation.x=Math.max(0,gm.rotation.x-dt*2); const dx=7.5-c.x, dz=2.2-c.z, d=Math.hypot(dx,dz);
        if(d>0.1){ c.x+=dx/d*Math.min(d,dt*1.6); c.z+=dz/d*Math.min(d,dt*1.6); gm.position.set(c.x,lv.ground(c.x,c.z),c.z); gm.rotation.y=Math.atan2(dx,dz); gm.rotation.z=Math.sin(c.t*5)*0.12; return; }
        c.phase='seize'; gm.rotation.z=0; fight.seized=true; mad.g.visible=true; mad.x=8.5; mad.z=2.2;
        speakSeq([['The Pretender',"His hand closes on the princess’s chain. “You fight like a man who believes his God is watching. No matter — I will not die on this rock.”"],
          ['Princess Madison',"Do not lose heart for my sake! The Lord will provide — He has never once failed us. Follow, and trust Him to go before you."],
          ['The Pretender',"“To another world, then! Chase me if your faith has legs, little knight.”"],
          ['You',"Wherever you flee, He is already there. I will follow — to the ends of the earth if I must."]],()=>{ c.phase='portal'; c.t=0; c.portal=portalModel(0xb026ff,false); c.portal.position.set(7.5,0.2,1.2); c.portal.scale.setScalar(0.01); scene.add(c.portal); });
        return; }
      if(c.phase==='seize'){ mad.g.visible=true; mad.g.position.set(8.4,0.2,2.3); return; }
      if(c.phase==='portal'){ const k=Math.min(1,c.t/1.4); c.portal.scale.setScalar(Math.max(0.01,k)); c.portal.userData.tick(t);
        if(c.t>1.4){ const u=Math.min(1,(c.t-1.4)/1.2); gm.position.z=2.2-u*1.0; gm.scale.setScalar(Math.max(0.05,1-u)); mad.g.position.set(8.4-u*0.9,0.2,2.3-u*1.1); mad.g.scale.setScalar(Math.max(0.05,1-u));
          if(u>=1){ scene.remove(gm); mad.g.visible=false; mad.g.scale.setScalar(1); c.phase='close'; c.t=0; } } return; }
      if(c.phase==='close'){ c.portal.scale.setScalar(Math.max(0.01,1-c.t/0.8)); c.portal.userData.tick(t); if(c.t>0.8){ scene.remove(c.portal); fight=null; startLastStand(); } } }
    function startLastStand(){ COMBAT.clear(lv); fight={last:true}; for(let i=0;i<5;i++) hollowAdd(300,64,13);
      speakSeq([['You',"He is fled — but his hollow men do not fall with him. They hold the hall yet."],['You',"Then we finish it here. ‘Fight the good fight of faith.’ Not one of them leaves this floor."]],
        ()=>UI.toast('⚔️ The hollow men hold the hall! Five remain, and they are the strongest he had. Cut them down and the castle is free.',3400)); }
    function freeSteward(){ if(!fight||!fight.freeable) return; fight.freeable=false; const i=lv.spots.indexOf(fight.cageSpot); if(i>=0) lv.spots.splice(i,1);
      ENGINE.speak('The Steward',['The bar — you have it. Bless you, sir. Bless you.'],stw,()=>{ fight.freed=true; stw.g.position.set(3.5,0,7.5); stw.x=3.5; stw.z=7.5;
        ENGINE.speak('The Steward',['I kept the keys of this house before he came. I had thought to die with them on my belt.','Go on, then — open the shutters with me. Let the light back in.'],stw,()=>aftermath()); }); }
    function aftermath(){ const s=S(), T=TH(); T.purified=true; fight=null;
      s.portals=s.portals||{mistral:{unlocked:true,cleared:false},tabor:{unlocked:false,cleared:false},sunfall:{unlocked:false,cleared:false}};
      s.portals.mistral.cleared=true; s.portals.tabor.unlocked=true; s.mountSkinOwned=s.mountSkinOwned||{}; s.mountSkinOwned.spectral=true; s.skillPoints=(s.skillPoints||0)+3; s.hp=s.maxHp;
      GAME.changed(); GAME.save(); state();
      ENGINE.speak('⚔️ THE USURPER IS DRIVEN FROM MISTRAL!',['✨ Mistral is free. The hall warms; a faithful steward takes up the watch.','A spectral barding for your steed is yours — equip it from the ☰ Pet tab. ⭐ +3 skill points.','And far to the south, Mount Tabor’s gate tears open. The chase goes on.']); }
    return lv; }

  return { enter, chapelLight, attach, V, M };
}
