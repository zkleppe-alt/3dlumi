// ════════════════════════════════════════════════════════════════
//  ⛰ MOUNT TABOR — the second world (data/portal_tabor.json: _buildTabor, frozen and thawed; every rescue's words
//  captured from taborTalk). A frozen cone of five terraces rising to Eden, the game's own rules:
//   • The beasts (spawnTaborBeast): a starving pack of ten on the slopes, always kept at strength (one back every
//     5.2 s, far from you). Day: a lean grey hunter (110 hp, bite 38). Night: a black-pelted horror (260, bite 66).
//   • The five rescues, one work of compassion a tier, each ending in a hope beat (TABOR_VERSES into the codex):
//     Bram beset by three wolves · Serah's family under the drifts (dig three) · Silas at a dead hearth (gather three
//     bundles of pine) · Wren on the ledge · Hannah at Eden's gate, who hears only once the four below have hope.
//   • The summit: the King of the Shadows sleeps on Eden's frozen spring until five hearts hold hope. Then the
//     Pretender wakes him and drags Madison on toward Sunfall. The fight teaches by force: BLUE tells (the shard
//     volley, the frost breath) melt on a raised shield; RED tells (the leap, the charge) smash straight through it.
//   • The thaw: he falls (John 1:5), the island wakes — the five frozen folk, palms and fruit trees, the raft that
//     rides the falls from Eden's lip to the harbour basin, hammocks and hot springs to rest in. +3 skill points,
//     and Sunfall's gate stirs.
//  Saved in S.tabor: { rescues:{id:{done,stage}}, hopeAll, summitCine, bossDown, thawed }.
//  taborQuest(D, thawed, rebuild) → { attach(lv), enter, chapelLight }
// ════════════════════════════════════════════════════════════════
const TABOR_VERSES={ beset:['Psalm 34:6','This poor man cried, and the LORD heard him, and saved him out of all his troubles.'], buried:['Romans 15:13','Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope.'],
  hearth:['Isaiah 42:3','A bruised reed shall he not break, and the smoking flax shall he not quench.'], ledge:['Psalm 121:3','He will not suffer thy foot to be moved: he that keepeth thee will not slumber.'],
  eden:['Isaiah 35:1','The wilderness and the solitary place shall be glad for them; and the desert shall rejoice, and blossom as the rose.'] };
function wolfModel(big,king){ const g=new THREE.Group(), col=king?0x2a1a3a:big?0x1a1a20:0x7a7a82, dark=king?0x140a1e:big?0x0a0a0e:0x4a4a52, eye=king?0xb090ff:big?0xff4a2a:0xf2d27a;
  const body=group(0,0,0,g); B(0.42,0.36,0.95,col,0,0.42,0,body); B(0.46,0.4,0.4,dark,0,0.5,0.28,body);
  const head=group(0,0.72,0.55,body); B(0.3,0.28,0.32,col,0,-0.14,0,head); B(0.18,0.14,0.24,dark,0,-0.16,0.24,head); Co(0.06,0.16,4,col,-0.09,0.12,-0.02,head); Co(0.06,0.16,4,col,0.09,0.12,-0.02,head);
  [-0.08,0.08].forEach(x=>{ const e=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,4),new THREE.MeshBasicMaterial({color:eye})); e.position.set(x,0,0.165); head.add(e); });
  const tail=group(0,0.55,-0.46,body); B(0.1,0.1,0.42,dark,0,0,-0.2,tail); tail.rotation.x=0.5;
  const legs=[[-0.15,0.32],[0.15,0.32],[-0.15,-0.32],[0.15,-0.32]].map(([x,z])=>{ const p=group(x,0.38,z,body); B(0.1,0.38,0.1,dark,0,-0.38,0,p); return p; });
  if(king){ for(let i=0;i<7;i++) Co(0.06,0.3+(i%2)*0.15,4,0x6a3a9a,-0.18+i*0.06,0.0,-0.1+i*0.02,head); for(let i=0;i<6;i++) Co(0.07,0.35,4,dark,0,0.6,0.2-i*0.14,body); }
  g.scale.setScalar(king?2.6:big?1.45:1); const mats=[]; g.traverse(m=>{ if(m.isMesh){ m.castShadow=true; if(m.material.emissive&&mats.indexOf(m.material)<0){ m.material=m.material.clone(); mats.push(m.material); } } }); g.userData.mats=mats;
  let t=0; g.animate=(dt,mode)=>{ t+=dt*(mode==='walk'?9:2); legs.forEach((p,i)=>p.rotation.x=mode==='walk'?Math.sin(t+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*0.7:0); tail.rotation.y=Math.sin(t*0.5)*0.3; head.rotation.x=mode==='walk'?0:Math.sin(t*0.4)*0.08; };
  return g; }

function taborQuest(D,thawed,rebuild){
  const S=()=>GAME.S, P=ENGINE.P, TK=D.talk||{};
  const T=()=>{ const s=S(); s.tabor=s.tabor||{}; s.tabor.rescues=s.tabor.rescues||{}; return s.tabor; };
  const R=id=>{ const r=T().rescues; return r[id]||(r[id]={done:false,stage:0}); };
  const doneN=()=>['beset','buried','hearth','ledge','eden'].filter(k=>R(k).done).length, four=()=>['beset','buried','hearth','ledge'].every(k=>R(k).done);
  const night=()=>{ const f=S().dayFrac; return f>=0.875||f<0.25; };
  const codex=(w,r,t)=>{ if(typeof LIBRARY!=='undefined') LIBRARY.codexAdd(w,r,t); };
  const lines=L=>(L||[]).map(([w,t])=>[w||'Tabor',String(t).replace(/<[^>]+>/g,'')]);
  let lv=null;
  function attach(L){ lv=L; const W=lv.W, H=lv.H, E=lv.E;
    if(!thawed&&lv.scene.fog){ lv.scene.fog.color.setHex(0x9fb2c4); lv.scene.background=new THREE.Color(0x9fb2c4); lv.scene.fog.near=18; lv.scene.fog.far=46; }   // a cold grey-blue haze, not a white-out
    lv.guideTarget=()=>{ if(thawed||fight||cine) return null; const tb=T(), at=id=>{ const r=(D.rescues||[]).find(q=>q.id===id); return r?[r.x,r.y]:null; };
      for(const id of ['beset','buried','hearth','ledge']){ const q=R(id); if(q.done) continue;
        if(id==='buried'&&(q.stage|0)<3){ const d=(D.drifts||[])[q.stage|0]; if(d) return [d.x,d.y]; }
        if(id==='hearth'&&(q.stage|0)<3){ const w=(D.wood||[])[q.stage|0]; if(w) return [w.x,w.y]; }
        return at(id); }
      if(!R('eden').done) return at('eden'); if(!tb.bossDown) return [Math.floor(D.spring.x),Math.floor(D.spring.y)+3]; return null; };
    lv.zone=p=>{ const x=Math.floor(p.x), z=Math.floor(p.z), t=lv.T(x,z), e=E(x,z); return '⛰ '+(t===63?'Eden':e<=0?'Mount Tabor — the harbour strand':`Mount Tabor — tier ${Math.min(5,e)}`)+(thawed?' · alive':''); };
    COMBAT.arena(lv,{ mode:'world', tier:0, W, H, walk:(x,y)=>lv.walkTile(x,y), onKill:killed,
      onDeath:()=>{ if(fight){ endFight(); } ENGINE.go(lv.id,lv.arrive); setTimeout(()=>ENGINE.speak('🌫️ The shadows swallow you…',['You wake at the harbour, breathing hard. The beast keeps the spring — for now.']),450); } });
    const pe=lv.onEnter; lv.onEnter=sp=>{ if(pe) pe(sp); onEnter(); };
    const pl=lv.onLeave; lv.onLeave=()=>{ endFight(); if(pl) pl(); };
    // ── the people of the mountain ──
    mark=new THREE.SpriteMaterial({map:(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); g.font='bold 52px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#f2c14e'; g.strokeStyle='#3a2a08'; g.lineWidth=6; g.strokeText('!',32,34); g.fillText('!',32,34); return new THREE.CanvasTexture(c); })(),transparent:true,depthWrite:false});
    dim=mark.clone(); dim.opacity=0.35;
    folk={};
    (D.rescues||[]).forEach(r=>{ const x=r.x+0.5, z=r.y+0.5, f=addPerson(lv,lv.scene,r.v.outfit==='elder'?'monk':r.v.outfit,x,z,lv.ground(x,z),r.v.name,null,{rest:0});
      const m=new THREE.Sprite(mark); m.scale.setScalar(0.5); m.position.y=2.2; f.g.add(m); f.mark=m; f.action=()=>talk(r.id,f); folk[r.id]=f; });
    // Bram's three wolves; the drifts over Serah's door; Silas's firewood and hearth
    drifts=(D.drifts||[]).map((d,i)=>{ const g=group(d.x+0.5,lv.ground(d.x+0.5,d.y+0.5),d.y+0.5,lv.scene); const m=Sp(0.6,0xf4f8fc,0,0.1,0,g,8,5); m.scale.set(1,0.7,1); shade(g);
      const s={x:d.x+0.5,z:d.y+0.5,r:1.2,label:'Dig',who:'A snowdrift',action:()=>dig(i)}; lv.spots.push(s); return {g,s}; });
    wood=(D.wood||[]).map((w,i)=>{ const g=group(w.x+0.5,lv.ground(w.x+0.5,w.y+0.5),w.y+0.5,lv.scene); [-0.12,0,0.12].forEach((o,k)=>{ const c=Cy(0.06,0.06,0.6,6,0x8a6a3a,o,0.06+k%2*0.08,0,g); c.rotation.z=Math.PI/2; c.position.set(0,0.08+k*0.09,o); }); Cy(0.02,0.02,0.2,4,0x5a3a20,0,0.08,0,g); shade(g);
      const s={x:w.x+0.5,z:w.y+0.5,r:1.1,label:'Gather',who:'Dry pine',action:()=>gather(i)}; lv.spots.push(s); return {g,s}; });
    fire=null; if(D.fire){ const g=group(D.fire.x+0.5,lv.ground(D.fire.x+0.5,D.fire.y+0.5),D.fire.y+0.5,lv.scene); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; B(0.16,0.12,0.16,0x6a6a72,Math.sin(a)*0.32,0,Math.cos(a)*0.32,g); }
      B(0.4,0.05,0.4,0x2a2422,0,0,0,g); const logs=group(0,0,0,g); [0,1.2,2.4].forEach(a=>{ const c=Cy(0.05,0.05,0.5,6,0x6a4a2a,0,0.08,0,logs); c.rotation.z=Math.PI/2; c.rotation.y=a; });
      const fl=new THREE.Group(); g.add(fl); [0,0.1,-0.08].forEach((o,i)=>{ const f=new THREE.Mesh(new THREE.ConeGeometry(0.12-i*0.03,0.42-i*0.08,6),glow(i?0xffb040:0xff7a20)); f.position.set(o,0.3,o*0.6); fl.add(f); });
      const light=new THREE.PointLight(0xffa040,0,6,1.6); light.position.y=0.6; g.add(light); shade(g); fire={g,fl,light,logs}; }
    // the frozen five, standing as they were caught (tile 65): ice statues until the thaw
    if(!thawed){ const raw=atob(D.raw); for(let i=0;i<W*H;i++) if(raw.charCodeAt(i)===65){ const x=i%W, y=(i/W)|0, g=person('peasant',{}); g.position.set(x+0.5,lv.ground(x+0.5,y+0.5),y+0.5); g.rotation.y=hsh(x,y)*6;
        g.traverse(m=>{ if(m.isMesh){ m.material=new THREE.MeshPhongMaterial({color:0xcfe8f8,transparent:true,opacity:0.78,shininess:80,flatShading:true}); } }); g.scale.multiplyScalar(VIEWMODE.ps(lv)); lv.scene.add(g); } }
    else { (D.thawed.folk||[]).forEach(f=>{ const x=f.x+0.5, z=f.y+0.5; addPerson(lv,lv.scene,f.v.outfit==='elder'?'monk':f.v.outfit,x,z,lv.ground(x,z),f.name,[f.line],{rest:Math.PI}); });
      (D.thawed.fruit||[]).forEach(t=>{ const g=group(t.x+0.5,lv.ground(t.x+0.5,t.y+0.5),t.y+0.5,lv.scene); DECOR_KINDS.sapling({},g); g.scale.setScalar(1.4*VIEWMODE.ps(lv)*1.6); shade(g); });
      leisure(); }
    // the King's spring at the summit
    const sp=D.spring, sx=sp.x+0.5, sz=sp.y+0.5;
    boss.sleeper=wolfModel(false,true); boss.sleeper.position.set(sx,lv.ground(sx,sz)+0.05,sz); boss.sleeper.rotation.y=Math.PI/2; boss.sleeper.scale.multiplyScalar(VIEWMODE.ps(lv)*1.6); lv.scene.add(boss.sleeper);
    const aura=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),new THREE.MeshBasicMaterial({color:0x6a3aa8,transparent:true,opacity:0.1,depthWrite:false,blending:THREE.AdditiveBlending})); lv.scene.add(aura); boss.aura=aura;
    lv.anim.push((t,dt)=>{ dt=dt||0.016; if(ENGINE.level!==lv) return; tick(t,dt); });
  }
  // ── every visit ──
  const boss={slept:true,sleeper:null,aura:null,hint:false}; let fight=null, cine=null, beastT=0;
  function onEnter(){ const tb=T(); refresh(); spawnPack(); boss.hint=false;
    if(thawed) ENGINE.speak('🌴 MOUNT TABOR — alive.',['Eden crowns the summit — the raft at its lip rides the falls all the way down. Hammocks and hot springs: face them and tap Rest.']);
    else ENGINE.speak('❄️ MOUNT TABOR — hearts of stone and ice.',['Five souls on this mountain can still be reached. Follow the walkway up, stair by stair — a gold ❗ marks a soul who needs you. Read the signposts. Beware the beasts, and beware the night.']); }
  function refresh(){ const b=R('buried');
    drifts.forEach((d,i)=>{ const gone=b.done||i<(b.stage|0); d.g.visible=!gone; const k=lv.spots.indexOf(d.s); if(gone&&k>=0) lv.spots.splice(k,1); });
    const h=R('hearth'); wood.forEach((w,i)=>{ const gone=h.done||i<(h.stage|0); w.g.visible=!gone; const k=lv.spots.indexOf(w.s); if(gone&&k>=0) lv.spots.splice(k,1); });
    if(fire){ const lit=h.done; fire.fl.visible=lit; fire.light.intensity=lit?1.2:0; }
    Object.entries(folk).forEach(([id,f])=>{ const q=R(id), hidden=id==='buried'&&!q.done&&(R('buried').stage|0)<3; f.g.visible=!hidden; f.mute=hidden; f.ghost=hidden;
      f.mark.visible=!q.done&&!thawed; f.mark.material=id==='eden'&&!four()?dim:mark; });
    const tb=T(); boss.sleeper.visible=!tb.bossDown&&!fight; boss.aura.visible=boss.sleeper.visible; }
  let drifts=[], wood=[], folk={}, fire=null, mark=null, dim=null;
  // the pack (spawnTaborBeast): they come back; Bram's guards don't
  function beastSpot(near){ for(let i=0;i<250;i++){ const x=4+Math.floor(Math.random()*(lv.W-8)), y=4+Math.floor(Math.random()*(lv.H-8)), t=lv.T(x,y);
      if(t!==22&&t!==61&&t!==34) continue; if(lv.E(x,y)<1||!lv.walkTile(x,y)) continue; const d=Math.hypot(x-P.x,y-P.z); if(!near&&d<14) continue; if(near&&d<6) continue; return [x+0.5,y+0.5]; } return null; }
  function beast(o){ const nb=night(), hp=nb?260:110; return COMBAT.foe(lv,Object.assign({hp,level:nb?13:9,xp:nb?26:12,atk:nb?66:38,beast:true,walking:true,model:wolfModel(nb)},o)); }
  function spawnPack(){ COMBAT.clear(lv); if(thawed) return; for(let i=0;i<10;i++){ const p=beastSpot(true); if(p) beast({x:p[0],z:p[1]}); }
    const b=R('beset'); if(!b.done){ const r=(D.rescues||[]).find(q=>q.id==='beset'); const n=3-(b.stage|0); let k=0;
      for(let ring=1;ring<=5&&k<n;ring++) for(let a=-ring;a<=ring&&k<n;a++) for(const c of [-ring,ring]){ if(k>=n) break; const x=r.x+a, y=r.y+c; if(lv.T(x,y)===22&&lv.walkTile(x,y)&&lv.E(x,y)>=1){ beast({x:x+0.5,z:y+0.5,guard:'beset',hp:110,atk:38,level:9}); k++; } } } }
  function killed(d){ if(d.guard){ const b=R(d.guard); b.stage=(b.stage|0)+1; GAME.save(); if(!lv.combat.foes.some(f=>f.alive&&f.guard===d.guard)) ENGINE.speak('⚔️ The beasts are driven off.',['The traveler still stands — go and speak with him.']); }
    if(d.boss) kingFalls(); }
  // ── the hands: dig, gather ──
  function dig(i){ const b=R('buried'); if(b.done||i<(b.stage|0)) return; b.stage=(b.stage|0)+1; GAME.save(); refresh();
    if(b.stage<3){ UI.toast(`❄️ You dig into the drift… (${b.stage} of 3)`,1400); return; }
    ENGINE.speak('A voice within',['Light — ! Children, LIGHT! Hold on — we are coming out!'],null,()=>UI.toast('🏠 The door is clear. A woman and her children step blinking into the day. Speak with her.',3000)); }
  function gather(i){ const h=R('hearth'); if(h.done||i<(h.stage|0)) return; h.stage=(h.stage|0)+1; GAME.save(); refresh(); UI.toast(`🪵 A bundle of dry pine. (${Math.min(3,h.stage)} of 3)`,1400); }
  // ── the reason: what each of them says, as the game says it ──
  function hope(id){ const V=TABOR_VERSES[id]; if(V) codex('A hope beat, Mount Tabor',V[0],V[1]); const n=doneN(); if(n<5) UI.toast(`✝️ A heart stirs on the frozen mountain. (${n} of 5)`,3000); refresh(); }
  function talk(id,f){ const q=R(id), K=TK[id]||{}, after=()=>speakSeq(lines(K.after));
    if(q.done){ after(); return; }
    if(id==='beset'){ if(lv.combat.foes.some(d=>d.alive&&d.guard==='beset')){ speakSeq(lines(K.guarded)); return; } }
    if(id==='hearth'&&(q.stage|0)<3){ speakSeq(lines(K.need)); return; }
    if(id==='eden'&&!four()){ speakSeq(lines(K.sealed)); return; }
    speakSeq(lines(K.talk),()=>{ q.done=true; if(id==='eden'){ T().hopeAll=true; GAME.save(); refresh(); ENGINE.speak('✨ Five hearts stir on the frozen mountain.',['Beyond Eden’s sealed gate something ancient growls in its sleep — the usurper’s beast lies upon the spring. The summit awaits.']); return; }
      GAME.save(); hope(id); }); }
  // ── the summit ──
  function tick(t,dt){ const tb=T();
    // the pack is kept at strength (tickTaborBeasts)
    if(!thawed&&!fight){ const alive=lv.combat.foes.filter(d=>d.alive&&d.beast&&!d.guard).length; if(alive<10){ beastT+=dt*1000; if(beastT>=5200){ beastT=0; const p=beastSpot(false); if(p) beast({x:p[0],z:p[1]}); } } else beastT=0; }
    if(boss.sleeper.visible){ boss.sleeper.animate(dt,'idle'); boss.aura.position.copy(boss.sleeper.position); boss.aura.position.y+=0.8; boss.aura.scale.setScalar((1.6+Math.sin(t*1.2)*0.1)*VIEWMODE.ps(lv)*2.2); }
    if(fight&&fight.b&&fight.b.alive){ const b=fight.b, col=b.tell==='blue'?0x4aa8ff:b.tell==='red'?0xff3a3a:0x6a3aa8; boss.aura.visible=true; boss.aura.material.color.setHex(col); boss.aura.material.opacity=b.tell?0.3+Math.sin(t*14)*0.1:0.06;
      boss.aura.position.set(b.x,lv.ground(b.x,b.z)+0.9+(b.air||0),b.z); boss.aura.scale.setScalar(VIEWMODE.ps(lv)*3.2); if(b.g&&b.air!==undefined) b.g.position.y=lv.ground(b.x,b.z)+(b.air||0);
      if(fight.cone){ fight.cone.visible=b.state==='breath'; if(fight.cone.visible){ fight.cone.position.set(b.x,lv.ground(b.x,b.z)+0.6,b.z); fight.cone.rotation.y=b.bang; } } }
    if(cine) cineTick(t,dt);
    if(tb.bossDown||fight||cine||thawed) return; const d=Math.hypot(P.x-(D.spring.x+0.5),P.z-(D.spring.y+0.5));
    if(!tb.hopeAll){ if(d<4.5&&!boss.hint&&document.getElementById('say').hidden){ boss.hint=true; ENGINE.speak('🐺 A mountain of matted shadow sleeps upon the spring.',['It does not stir. While the hearts below are stone, the dark sleeps too deep to wake.']); } return; }
    if(d<5&&document.getElementById('say').hidden) summit(); }
  function summit(){ const tb=T(), sx=D.spring.x+0.5, sz=D.spring.y+0.5, first=!tb.summitCine, vs=VIEWMODE.ps(lv);
    cine={t:0,stage:'talk'};
    if(first){ const pm=pretenderModel(0); pm.scale.multiplyScalar(vs*1.4); pm.position.set(sx+2.5,lv.ground(sx+2.5,sz+1.5),sz+1.5); pm.rotation.y=-Math.PI/2; lv.scene.add(pm); cine.pm=pm;
      const md=person('madison',{who:'Princess Madison'}); md.scale.multiplyScalar(vs); md.position.set(sx+3.6,lv.ground(sx+3.6,sz+1.7),sz+1.7); md.rotation.y=-Math.PI/2; lv.scene.add(md); cine.md=md; }
    speakSeq(lines(first?TK.summit:TK.summitAgain),()=>{ tb.summitCine=true; GAME.save(); cine.stage='out'; cine.t=0;
      if(cine.pm){ const po=portalModel(0xb026ff,false); po.scale.setScalar(vs*1.3); po.position.set(sx+4.6,lv.ground(sx+4.6,sz+1.6),sz+1.6); po.rotation.y=-Math.PI/2; lv.scene.add(po); cine.po=po; UI.toast('🌀 The Pretender drags the princess through the portal — toward Sunfall.',2400); } }); }
  function cineTick(t,dt){ cine.t+=dt; if(cine.stage!=='out') return; const k=Math.min(1,cine.t/1.6);
    if(cine.po){ cine.po.userData.tick(t); [cine.pm,cine.md].forEach(o=>{ if(o){ o.position.x+=dt*1.2; o.scale.multiplyScalar(1-dt*1.2); } }); }
    if(k>=1){ [cine.pm,cine.md,cine.po].forEach(o=>o&&lv.scene.remove(o)); cine=null; startFight(); } }
  // ── the King of the Shadows (tickShadowKing) ──
  const PX=COMBAT.PX;
  function hurt(dmg,blockable,ifr){ const s=S(); let inc=Math.max(1,dmg-s.def); inc=Math.max(1,Math.round(inc*(1-s.dmgReduce)));
    if(COMBAT.blocking()){ if(blockable) inc=Math.max(1,Math.ceil(inc*0.08)); else if(!fight.smashT||performance.now()-fight.smashT>2000){ fight.smashT=performance.now(); UI.toast('💥 Your shield is smashed aside! RED tells cannot be blocked — run.',1600); } }
    COMBAT.hurtRaw(inc,ifr||14); }
  function startFight(){ const sx=D.spring.x+0.5, sz=D.spring.y+0.5, m=wolfModel(false,true); m.scale.multiplyScalar(1.2);
    const b=beast({x:sx,z:sz,hp:3200,level:20,xp:0,boss:true,noEnrage:true,name:'🐺 THE KING OF THE SHADOWS',model:m,walking:true});
    b.ai=ai; b.state='idle'; b.cool=40; b.seq=0; b.home={x:sx,z:sz}; b.air=0; b.guardUntil=0; if(b.bar) b.bar.visible=false;
    const cone=new THREE.Mesh(new THREE.ConeGeometry(2.4*VIEWMODE.ps(lv)*2,5*VIEWMODE.ps(lv)*2.2,16,1,true),new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:0.28,side:THREE.DoubleSide,depthWrite:false}));
    cone.geometry.rotateX(-Math.PI/2); cone.geometry.translate(0,0,2.5*VIEWMODE.ps(lv)*2.2); cone.visible=false; lv.scene.add(cone);
    fight={b,cone}; refresh();
    ENGINE.speak('🐺 THE KING OF THE SHADOWS',['BLUE glow: raise your shield and hold. RED glow: RUN — no shield will hold. Strike between his breaths.']); }
  function endFight(){ if(!fight) return; if(fight.cone) lv.scene.remove(fight.cone); const b=fight.b; if(b){ b.alive=false; if(b.g&&b.g.parent) b.g.parent.remove(b.g); const i=lv.combat.foes.indexOf(b); if(i>=0) lv.combat.foes.splice(i,1); } fight=null; if(lv) refresh(); }
  // distances in the game's pixels → tiles; in the grand view the beast and his reach are drawn at the people's scale
  function ai(b,dx,dz,dist){ const p2=b.hp<b.maxHp*0.5, k=Math.max(0.6,VIEWMODE.ps(lv)*1.6);
    if(dist<1.6*k&&b.state!=='leap'&&b.state!=='charge') hurt(70,true,12);
    if(b.state==='idle'){ if(b.cool>0) b.cool--; else { let blue=b.seq%2===0; if(p2) blue=Math.random()<0.5; b.seq++;
        if(blue){ b.bA=(b.bA||0)+1; b.atk2=b.bA%2?'volley':'breath'; } else { b.rA=(b.rA||0)+1; b.atk2=b.rA%2?'leap':'charge'; }
        b.tell=blue?'blue':'red'; b.tellT=Math.round((b.atk2==='leap'?50:44)*(p2?0.75:1)); b.state='tell';
        if(b.atk2==='leap') b.leap={x:P.x,z:P.z,fx:b.x,fz:b.z,t:0}; if(b.atk2==='charge') b.ch={vx:dx/dist,vz:dz/dist,run:0}; }
      if(b.home&&b.state==='idle'){ const hx=b.home.x-b.x, hz=b.home.z-b.z, hd=Math.hypot(hx,hz); if(hd>0.3){ b.x+=hx/hd*1.4*PX; b.z+=hz/hd*1.4*PX; } } }
    else if(b.state==='tell'){ b.face=Math.atan2(dx,dz); if(--b.tellT>0) return;
      if(b.atk2==='volley'){ const n=p2?11:8, a0=Math.atan2(dz,dx); for(let i=0;i<n;i++){ const a=a0+(i-(n-1)/2)*0.22; COMBAT.shot(b.x,b.z,Math.cos(a)*2.3*PX,Math.sin(a)*2.3*PX,180,false,0,85,0x9fd8ff); } b.state='idle'; b.cool=p2?28:42; b.tell=null; }
      else if(b.atk2==='breath'){ b.br={t:0,dur:52}; b.bang=Math.atan2(dx,dz); b.state='breath'; }
      else if(b.atk2==='leap'){ b.state='leap'; } else b.state='charge'; }
    else if(b.state==='breath'){ const br=b.br; br.t++;
      if(br.t%16===0&&dist<5*k){ let da=Math.abs(Math.atan2(dx,dz)-b.bang); if(da>Math.PI) da=Math.PI*2-da; if(da<0.62) hurt(60,true,10); }
      if(br.t>=br.dur){ b.state='idle'; b.cool=p2?26:40; b.tell=null; } }
    else if(b.state==='leap'){ const L=b.leap; L.t++; const f=Math.min(1,L.t/26); b.x=L.fx+(L.x-L.fx)*f; b.z=L.fz+(L.z-L.fz)*f; b.air=Math.sin(f*Math.PI)*1.6*k;
      if(f>=1){ b.air=0; if(Math.hypot(P.x-b.x,P.z-b.z)<2.3*k) hurt(120,false,16); b.state='idle'; b.cool=p2?32:48; b.tell=null; } }
    else if(b.state==='charge'){ const c=b.ch, spd=(p2?5.6:4.6)*PX, nx=b.x+c.vx*spd, nz=b.z+c.vz*spd, open=lv.walkTile(Math.floor(nx),Math.floor(nz)); if(open){ b.x=nx; b.z=nz; } c.run+=spd; b.face=Math.atan2(c.vx,c.vz);
      if(Math.hypot(P.x-b.x,P.z-b.z)<1.5*k){ hurt(130,false,18); c.run=99; } if(!open||c.run>7*k){ b.state='idle'; b.cool=p2?30:46; b.tell=null; } } }
  function kingFalls(){ const tb=T(); tb.bossDown=true; GAME.save(); const b=fight&&fight.b; if(fight&&fight.cone) lv.scene.remove(fight.cone); fight=null; boss.aura.visible=false;
    codex('Eden’s spring, Mount Tabor','John 1:5','And the light shineth in darkness; and the darkness comprehended it not.');
    speakSeq(lines([['The King of the Shadows','(the great bulk shudders, and for the first time its voice is small) ...the light. Why does it not... gutter...'],
      ['You','“And the light shineth in darkness; and the darkness comprehended it not.” — John 1:5. Your reign is ended, shadow. This garden has a Lord already.']]),()=>thaw()); }
  // the thaw sweeps DOWN from Eden, tier by tier (startTaborThaw: a level every 45 frames), then the island wakes
  function thaw(){ const tb=T(), s=S(); UI.toast('💧 The ice over the spring CRACKS — and breaks. From the summit downward, the long winter loses its grip…',3200);
    let level=7; const step=()=>{ level--; lv.thawAt=(x,y)=>lv.E(x,y)>=level||lv.T(x,y)===63; lv.retile(0,0,lv.W,lv.H); if(level>0) setTimeout(step,750); else wake(); }; setTimeout(step,600); }
  function wake(){ const tb=T(), s=S(); COMBAT.tint('rgba(255,255,255,0.95)',0.6);
    setTimeout(()=>{ tb.thawed=true; s.skillPoints=(s.skillPoints||0)+3; s.portals=s.portals||{}; s.portals.sunfall=Object.assign({unlocked:false,cleared:false},s.portals.sunfall||{}); s.portals.sunfall.unlocked=true;
      s.portals.tabor=Object.assign({},s.portals.tabor||{},{unlocked:true,cleared:true}); GAME.changed(); GAME.save();
      const at={x:P.x,z:P.z,face:P.face}, nl=rebuild(); if(nl){ ENGINE.go(nl.id,at); }
      setTimeout(()=>{ COMBAT.tint('rgba(255,255,255,0.95)',0);
        speakSeq([['The Mountain','(everywhere at once: the roar of the falls, birdsong that has waited sixty years, and five voices at the harbour crying out as the ice lets them go)'],
          ['You','“The wilderness and the solitary place shall be glad for them; and the desert shall rejoice, and blossom as the rose.” — Isaiah 35:1. Blessed be the Lord. It was never my sword, Lord — it was Your promise.']],
          ()=>ENGINE.speak('🌴 TABOR LIVES. ⭐ +3 skill points',['The beasts have fled the light. The frozen five are awake — go and meet them.','And far across the sea, a third gate stirs: SUNFALL — where the Pretender has taken the princess.'])); },900); },1400); }
  // ── the island's rest, once it lives: the raft, hammocks, hot springs ──
  function leisure(){ const Tw=D.thawed, vs=VIEWMODE.ps(lv);
    if(Tw.raft){ const x=Tw.raft.x+0.5, z=Tw.raft.y+0.5, g=group(x,lv.ground(x,z)+0.05,z,lv.scene); for(let i=0;i<5;i++) Cy(0.09,0.09,1.1,6,0x8a6a3a,-0.36+i*0.18,0.09,0,g).rotation.x=Math.PI/2; B(1.0,0.04,0.2,0x5a3a20,0,0.18,0.3,g); B(1.0,0.04,0.2,0x5a3a20,0,0.18,-0.3,g); g.scale.setScalar(Math.max(0.6,vs*1.6)); shade(g);
      lv.spots.push({x,z,r:1.6,label:'Ride',who:'The raft',action:()=>ride(g)}); }
    (Tw.hammocks||[]).forEach(h=>{ const x=h.x+0.5, z=h.y+0.5, g=group(x,lv.ground(x,z),z,lv.scene); [-0.8,0.8].forEach(o=>Cy(0.06,0.08,1.4,6,0x8a6a3a,o,0,0,g)); const n=B(1.4,0.06,0.5,0xe8d8a8,0,0.7,0,g); n.scale.y=1; shade(g); g.scale.setScalar(Math.max(0.6,vs*1.6));
      lv.spots.push({x,z,r:1.4,label:'Rest',who:'A hammock',action:()=>rest('hammock')}); });
    (Tw.springs||[]).forEach(h=>{ const x=h.x+0.5, z=h.y+0.5, g=group(x,lv.ground(x,z),z,lv.scene); for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; B(0.24,0.16,0.24,0x8a8478,Math.sin(a)*0.62,0,Math.cos(a)*0.62,g); } Cy(0.6,0.6,0.06,14,0x6ac8d8,0,0.05,0,g);
      const st=[]; for(let i=0;i<4;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3,depthWrite:false})); g.add(m); st.push(m); }
      lv.anim.push(t=>st.forEach((m,i)=>{ const k=(t*0.3+i/4)%1; m.position.set(Math.sin(i*2+t)*0.3,0.1+k*1.2,Math.cos(i*3)*0.3); m.material.opacity=0.35*(1-k); m.scale.setScalar(1+k*2); })); g.scale.setScalar(Math.max(0.6,vs*1.6)); shade(g);
      lv.spots.push({x,z,r:1.4,label:'Rest',who:'A hot spring',action:()=>rest('spring')}); }); }
  function rest(kind){ if(ENGINE.holding) return; const s=S(), hp0=s.hp; ENGINE.hold(3.5,'sit'); let el=0;
    UI.toast(kind==='spring'?'♨️ You sink into the hot spring. Steam curls off the water; the mountain’s old cold has no claim on you now.':'😴 You sink into the hammock. The surf keeps time; your strength returns.',2600);
    const f=(t,dt)=>{ el+=dt||0.016; s.hp=Math.max(s.hp,Math.round(hp0+(s.maxHp-hp0)*Math.min(1,el/3.5))); ENGINE.hud(); if(el>=3.5){ lv.anim.splice(lv.anim.indexOf(f),1); GAME.changed(); UI.toast(kind==='spring'?'♨️ You climb out, warmed to the bone.':'🌴 You roll out of the hammock, rested.',1400); } }; lv.anim.push(f); }
  function ride(raft){ if(ENGINE.holding) return; const x0=D.thawed.raft.x+0.5, z0=D.thawed.raft.y+0.5, z1=D.cy+D.R-5+0.5, x1=D.cx+0.5; let el=0, z=z0, v=1.4*60*PX;
    UI.toast('🛶 You push off the lip —',1200); const dur=60; ENGINE.hold(dur,'sit'); const home={x:raft.position.x,y:raft.position.y,z:raft.position.z};
    const f=(t,dt)=>{ dt=dt||0.016; el+=dt; v=Math.min(4.8*60*PX,v+0.022*3600*PX*dt); z=Math.min(z1,z+v*dt); const x=x1+Math.sin(el*8.4)*0.3;
      P.x=x; P.z=z; raft.position.set(x,lv.ground(x,z)+0.05,z); P.face=0;
      if(z>=z1){ lv.anim.splice(lv.anim.indexOf(f),1); ENGINE.hold(0); raft.position.set(home.x,home.y,home.z); P.x=D.cx+0.5; P.z=z1;
        ENGINE.speak('🌊 WOOSH!',['The falls set you down laughing in the basin.','The raft bobs back up the current to the lip — ride again any time.']); } };
    lv.anim.push(f); }
  // a cold grey-blue haze while frozen (the day's sky once it lives)
  const sky=L=>{ if(thawed) return false; L.scene.background.setHex(0x9fb2c4); L.scene.fog.color.setHex(0x9fb2c4); L.scene.fog.near=18; L.scene.fog.far=46; L.hemi.intensity=0.5; L.sunLight.intensity=0.65; };
  return { attach, enter:()=>null, chapelLight:()=>false, sky };
}
