// ════════════════════════════════════════════════════════════════
//  PETFIGHT (V185) — your companion fights beside you, and answers one command.
//   · the LION (faithful) darts in and strikes the nearest foe every few seconds.   Command POUNCE: a great leap — heavy
//     damage, and the foe reels (a guardian is stunned). Tree: Roar (all near it reel), Guardbreaker (a guardian stays open).
//   · the DOVE (grace) mends you a little every few seconds while a fight is on.    Command MEND: a quarter of your health.
//     Tree: Dive (breaks off the foe's attack), Cleansing (two seconds no blow can touch you).
//   · the TURTLE (steadfast) takes one blow in eight for you ("Shell!").             Command SHELL WALL: four seconds in
//     which blows land at 30%. Tree: longer, stops shots outright, heals as it rises.
//   · the UNICORN strikes and mends.                                                Command RADIANCE: heals and stuns.
//  The command sits on a cooldown (SYS.PET_CMD[line].cd seconds, shortened by perk.cmdCd from either tree): the 🐾 button,
//  G / 2 on the keyboard, View on a controller. Everything it does goes through combat.js's own doors (hitFoe, the hurt
//  chain's PETFIGHT.soak) so kills, gold and guardians' caps all behave. No companion, no fight → nothing here runs.
//  PETFIGHT.step(c,K) once a combat step · soak(inc) → what's left of a blow · shotStop() · command() · cdOf() · ring()
// ════════════════════════════════════════════════════════════════
const PETFIGHT=(function(){
  const S=()=>GAME.S, PK=()=>S().perk||{}, line=()=>S().pet?S().pet.id:null, A=()=>ENGINE.level&&ENGINE.level.combat;
  let cd=0, wall=0, tick=0, K0=null, said=false; const rings=[];
  const btn=document.createElement('button'); btn.id='petBtn'; btn.className='act'; btn.hidden=true; btn.setAttribute('aria-label','Companion’s command');
  btn.style.cssText='position:fixed;right:calc(96px + env(safe-area-inset-right,0px));bottom:calc(196px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:1px solid rgba(245,200,110,.85);background:rgba(22,32,46,.6);color:#ffe9b0;font:700 18px var(--f-body);cursor:pointer;touch-action:none';
  document.body.appendChild(btn);
  const cdOf=()=>{ const C=SYS.PET_CMD&&SYS.PET_CMD[line()]; return C?Math.max(6,Math.round(C.cd*(1-Math.min(0.5,PK().cmdCd||0)))):0; };
  const power=()=>{ const s=S(), f=s.pet?s.pet.form:0; return (3+s.level*0.9+f*3)*(1+(PK().petDmg||0)); };
  const gy=(x,z)=>ENGINE.level.ground?ENGINE.level.ground(x,z):0;
  function ring(x,z,col,r){ const lv=ENGINE.level; if(!lv||!lv.scene) return; const m=new THREE.Mesh(new THREE.RingGeometry(0.82,1,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.set(x,gy(x,z)+0.08,z); lv.scene.add(m); rings.push({m,t:0,r:r||2.5,sc:lv.scene}); }
  // V193: never the king in Stormgate (it is the storm in him you break, by turning his blows — a bite of the lion's made
  //  the fight longer every time), and never a foe that is hidden or held off-stage
  const fair=d=>d&&d.alive&&!d.king&&!d.noPet&&!(d.g&&d.g.visible===false);
  const near=(c,p,R)=>{ let b=null, bd=R; c.foes.forEach(d=>{ if(!fair(d)) return; const q=Math.hypot(d.x-p.x,d.z-p.z)-(d.boss?1:0); if(q<bd){ bd=q; b=d; } }); return b; };
  const guarded=d=>d.boss&&d.bf&&!d.bfOpen&&d.state!=='stunned';
  function strike(d,K,mult,stag){ const p=ENGINE.P; if(typeof PETS3D!=='undefined'&&PETS3D.dart){ const dx=d.x-p.x, dz=d.z-p.z, L=Math.hypot(dx,dz)||1, back=d.boss?1.3:0.6; PETS3D.dart(d.x-dx/L*back,d.z-dz/L*back,0.55); }
    let dmg=Math.max(1,Math.round(power()*mult)); if(guarded(d)&&!stag) dmg=Math.max(1,Math.round(dmg*0.3)); if(d.boss) dmg=Math.min(dmg,Math.ceil(d.maxHp*0.02*Math.max(1,mult)));
    K.hit(d,dmg,mult>=2.5); }
  function heal(frac,K,label){ const s=S(), p=ENGINE.P, h=Math.max(1,Math.round(s.maxHp*frac*(1+Math.min(1.5,(s.healMult||1)-1)*0.3)));   /* your healing skill helps a little; the command is not a second potion bag */ const b=s.hp; s.hp=Math.min(s.maxHp,s.hp+h); if(s.hp>b){ K.pop(p.x,gy(p.x,p.z)+2.3,p.z,(label||'')+'+'+(s.hp-b),'#8af0a8'); K.hud(); } }
  // ── the command ──
  function command(){ const c=A(), K=K0, id=line(); if(!c||!K||!id||ENGINE.holding||(typeof UI!=='undefined'&&UI.open)) return; const C=SYS.PET_CMD[id]; if(!C) return;
    if(cd>0){ UI.toast(`${C.emoji} ${C.name} — ${Math.ceil(cd/60)} s`,700); return; }
    const p=ENGINE.P, k=PK(), d=near(c,p,9);
    if((id==='faithful')&&!d){ UI.toast('No foe near enough to pounce on.',900); return; }
    cd=cdOf()*60; SFX.play(id==='faithful'?'bossRoar':'parry'); K.pop(p.x,gy(p.x,p.z)+2.7,p.z,C.emoji+' '+C.name+'!','#ffe9b0');
    if(id==='faithful'){ strike(d,K,3,true); K.shake(0.3); ring(d.x,d.z,0xf5a623,k.roar?3.6:1.8);
      if(d.alive){ if(d.boss){ K.parryBoss(d); d.timer=k.gbreak?170:70; } else { d.stag=Math.max(d.stag||0,110); d.lunge=0; } }
      if(k.roar) c.foes.forEach(e=>{ if(fair(e)&&e!==d&&!e.boss&&Math.hypot(e.x-d.x,e.z-d.z)<3.6){ e.stag=Math.max(e.stag||0,90); e.lunge=0; } }); }
    else if(id==='grace'){ heal(0.25+(k.cmdPow||0),K,'🕊 '); ring(p.x,p.z,0x8af0a8,2.2);
      if(k.dive&&d){ strike(d,K,1,true); if(d.alive){ if(d.boss) { K.parryBoss(d); d.timer=45; } else { d.stag=Math.max(d.stag||0,70); d.lunge=0; } } }
      if(k.cleanse){ K.pl.guardBreak=0; K.pl.iframes=Math.max(K.pl.iframes,120); } }
    else if(id==='steadfast'){ wall=Math.round((4+(k.wallT||0))*60); ring(p.x,p.z,0x8ad8ff,1.6); if(k.wallHeal) heal(k.wallHeal,K,'🐢 '); }
    else { heal(0.15+(k.cmdPow||0),K,'🦄 '); ring(p.x,p.z,0xe6c8ff,3.2); c.foes.forEach(e=>{ if(!fair(e)||Math.hypot(e.x-p.x,e.z-p.z)>4.2) return; strike(e,K,1.5,true); if(!e.alive) return; if(e.boss){ K.parryBoss(e); e.timer=60; } else { e.stag=Math.max(e.stag||0,90); e.lunge=0; } }); }
    if(!said){ said=true; UI.toast(`${C.emoji} ${C.name}! Ready again in ${cdOf()} s — your companion’s tree (☰ Pet) makes it stronger.`,2600); } }
  btn.addEventListener('pointerdown',e=>{ e.preventDefault(); command(); });
  addEventListener('keydown',e=>{ if(e.repeat) return; if(String(e.key).toLowerCase()==='g') command(); });
  // ── one step of the fight (1/60 s) ──
  function step(c,K){ K0=K; if(cd>0) cd--; if(wall>0) wall--; const id=line(); if(!id) return; const s=S(), p=ENGINE.P; if(s.hp<=0) return;
    if(++tick<(id==='faithful'?140:id==='unicorn'?170:200)) return; tick=0; const d=near(c,p,id==='faithful'||id==='unicorn'?5.5:7); if(!d) return;
    if(id==='faithful') strike(d,K,1);
    else if(id==='unicorn'){ strike(d,K,0.8); if(s.hp<s.maxHp) heal(0.01*(1+(PK().petHeal||0)),K,''); }
    else if(id==='grace'){ if(s.hp<s.maxHp) heal(0.02*(1+(PK().petHeal||0)),K,''); }
    else if(Math.hypot(d.x-p.x,d.z-p.z)<3) strike(d,K,0.4); }
  // a blow on its way to you: the turtle's shell, the wall
  function soak(inc){ const id=line(); if(!id||inc<=0) return inc; const p=ENGINE.P, k=PK();
    if(wall>0){ inc=Math.max(1,Math.round(inc*(0.3-(k.wallK||0)))); if(K0) K0.pop(p.x,gy(p.x,p.z)+2.4,p.z,'Shell Wall','#8ad8ff'); return inc; }
    if(id==='steadfast'&&Math.random()<0.12+(k.petGuard||0)){ if(K0) K0.pop(p.x,gy(p.x,p.z)+2.4,p.z,'🐢 Shell!','#8ad8ff'); if(typeof SFX!=='undefined') SFX.play('block'); return 0; }
    return inc; }
  const shotStop=()=>wall>0&&!!PK().wallShots;
  // the button and the rings, each frame
  let last=0; function frame(){ requestAnimationFrame(frame); const t=performance.now(), dt=Math.min(0.05,(t-last)/1000); last=t; const c=A(), id=line(), show=!!(c&&id&&SYS.PET_CMD&&SYS.PET_CMD[id]);
    if(btn.hidden===show) btn.hidden=!show; if(show){ const C=SYS.PET_CMD[id], tx=cd>0?String(Math.ceil(cd/60)):C.emoji; if(btn.textContent!==tx){ btn.textContent=tx; btn.style.opacity=cd>0?'0.55':'1'; } }
    if(!c){ wall=0; }
    for(let i=rings.length-1;i>=0;i--){ const r=rings[i]; r.t+=dt*2.2; const u=Math.min(1,r.t); r.m.scale.setScalar(0.3+u*r.r); r.m.material.opacity=0.85*(1-u); if(u>=1){ r.sc.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose(); rings.splice(i,1); } } }
  requestAnimationFrame(frame);
  return { step, soak, shotStop, command, cdOf, ring, get cd(){ return cd; }, set cd(v){ cd=v; }, get wall(){ return wall; } };
})();
