// ════════════════════════════════════════════════════════════════
//  COMBAT — KLK's fighting, step for step. The game runs 60 steps a second on 16-px tiles;
//  here a tile is one unit, so every px-per-frame figure from the game is divided by 16.
//  Ported: SWING light/heavy (wind-up, reach, cone, ×mult, knock), the combo and its Ground Pound,
//  crits ×1.8, hold-to-guard (a blow lands at a tenth), double-tap dodge (hop, i-frames, cooldown),
//  the overworld demon (wander, chase inside 5 tiles, contact), the chapel demon (patrol, chase),
//  the guardian (telegraph → volley / spread / charge / slam / wave / summon, the point-blank nova,
//  BOSS_TUNE, bossHitGate's cap, gate, brace and enrage), arrows for bows, and death.
//  COMBAT.arena(level, cfg) gives a walking level a fight; the core calls frame() each frame.
//  A foe with .ai(d,dx,dz,dist) runs its own rules (the finale); shots and adds may carry their own .dmg.
// ════════════════════════════════════════════════════════════════
const COMBAT=(function(){
  const PX=1/16, STEP=1/60;
  const SWING={ light:{windup:3,dur:12,reach:1.5,half:Math.PI*0.48,mult:1.0,knock:4}, heavy:{windup:6,dur:18,reach:1.7,half:Math.PI*0.62,mult:1.7,knock:8} };
  const GP={name:'Ground Pound',mult:1.6,radius:2.3,knock:14};
  const BOSS_CAP=0.08, BOSS_GATE=300;
  const pl={buf:0,lungeT:0,lx:0,lz:0,swingDur:0,iframes:0,swing:0,combo:0,comboT:0,blocking:false,bDown:false,bAt:0,lastTap:0,dodgeCd:0,dashing:0,dashx:0,dashz:0,jumpY:0,leap:0,plunge:false,airSwingH:0,airSwingT:0};
  let hitStop=0, shake=0, lock=null;   // the freeze when a blow lands, the camera's jolt, and the foe you're locked on to
  const later=[]; let acc=0;
  const S=()=>GAME.S, P=()=>ENGINE.P, L=()=>ENGINE.level, A=()=>L()&&L().combat;
  const now=()=>performance.now();
  // V185: the trees' perks (state.js recalc → S.perk). myBlow: a blow's last word — a certain critical after a perfect dodge
  //  (Punisher), a harder one after a parry (Counter), the critical's weight (Sword of the Spirit).
  const PK=()=>S().perk||{};
  function myBlow(dmg,crit,heavy){ const k=PK(); if(heavy&&k.heavyK) dmg=Math.round(dmg*(1+k.heavyK)); if(pl.punish>0&&!crit){ crit=true; dmg=Math.round(dmg*1.8); } if(crit){ pl.punish=0; if(k.critMult) dmg=Math.round(dmg*(1.8+k.critMult)/1.8); }
    if(pl.counter>0){ dmg=Math.round(dmg*(1+(k.counter||0))); pl.counter=0; } return [dmg,crit]; }
  // a parry or a perfect dodge, for the Psalmist: a little mending, a burst of light
  function spirit(){ const k=PK(), c=A(), p=P(); if(k.punish) pl.punish=240; if(!c) return;
    if(k.mend){ const s=S(), h=Math.max(1,Math.round(s.maxHp*k.mend)); if(s.hp<s.maxHp){ s.hp=Math.min(s.maxHp,s.hp+h); pop(p.x,ENGINE.level.ground(p.x,p.z)+2.3,p.z,'+'+h,'#8af0a8'); hud(); } }
    if(k.burst){ let n=0; c.foes.forEach(d=>{ if(!d.alive) return; const vx=d.x-p.x, vz=d.z-p.z, dist=Math.hypot(vx,vz); if(dist>2.8+(d.boss?0.8:0)) return; let dmg=Math.max(1,Math.round(S().atk*0.8*k.burst)); if(d.boss) dmg=Math.min(dmg,Math.ceil(d.maxHp*0.012*k.burst)); hitFoe(d,dmg,false,vx,vz,dist,3); n++; });
      if(n){ SFX.play('parry'); if(typeof PETFIGHT!=='undefined') PETFIGHT.ring(p.x,p.z,0xffe9a0,2.8); } } }
  // ── HUD bits: the guard button, the guardian's bar, damage numbers, a red edge when hurt ──
  const css=(el,s)=>{ el.style.cssText=s; return el; };
  const guardB=css(document.createElement('button'),'position:fixed;right:calc(26px + env(safe-area-inset-right,0px));bottom:calc(118px + env(safe-area-inset-bottom,0px));width:64px;height:64px;border-radius:50%;border:1px solid rgba(160,190,240,.8);background:rgba(22,32,46,.6);color:#c8d6ea;font:700 13px var(--f-body);cursor:pointer;touch-action:none');
  guardB.id='guardBtn'; guardB.textContent='Guard'; guardB.className='act'; guardB.hidden=true; guardB.setAttribute('aria-label','Guard — hold to block, tap twice to dodge'); document.body.appendChild(guardB);
  const potB=css(document.createElement('button'),'position:fixed;right:calc(30px + env(safe-area-inset-right,0px));bottom:calc(196px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:1px solid rgba(111,223,138,.8);background:rgba(22,32,46,.6);color:#cfeccf;font:700 12px var(--f-body);cursor:pointer;touch-action:none');
  potB.className='act'; potB.id='potBtn'; potB.hidden=true; potB.setAttribute('aria-label','Drink a potion'); document.body.appendChild(potB);
  function potion(){ if(ENGINE.holding) return; const S0=GAME.S, inv=S0.inventory, order=[S0.quickPot,'potion','greaterPotion','elixir'].filter((k,i,a)=>k&&a.indexOf(k)===i); const id=order.find(k=>inv[k]>0&&SYS.POTIONS[k]&&SYS.POTIONS[k].heal);
    if(!id){ UI.toast('No healing potions left',1200); return; } const m=GAME.drink(id); SFX.play('potion'); UI.toast(`${SYS.POTIONS[id].emoji||'🧪'} ${m}`,1200); hud(); }
  potB.addEventListener('pointerdown',e=>{ e.preventDefault(); potion(); });
  addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); if(k==='p'&&A()&&!UI.open) potion(); if(k==='f'&&!e.repeat&&A()&&!UI.open) toggleLock(); });
  const bossBar=css(document.createElement('div'),'position:fixed;left:50%;transform:translateX(-50%);top:calc(104px + env(safe-area-inset-top,0px));width:min(calc(100vw - 32px),380px);pointer-events:none;text-align:center;font:400 15px var(--f-display);color:#f2c14e;text-shadow:0 2px 6px #000;z-index:5');
  bossBar.hidden=true; bossBar.innerHTML='<div id="bbName"></div><div style="height:9px;background:#2a1020;border:1px solid #c06aff88;border-radius:4px;overflow:hidden;margin-top:4px"><div id="bbFill" style="height:100%;width:100%;background:linear-gradient(90deg,#8a2ad8,#e04a8a);transition:width .15s"></div></div>';
  document.body.appendChild(bossBar);
  const meterEl=css(document.createElement('div'),'position:fixed;left:50%;transform:translateX(-50%);top:calc(140px + env(safe-area-inset-top,0px));width:min(calc(100vw - 32px),300px);pointer-events:none;text-align:center;font:700 11px var(--f-mono);color:#e8dcbb;text-shadow:0 1px 3px #000;z-index:5');
  meterEl.hidden=true; document.body.appendChild(meterEl);
  function meter(list){ if(!list||!list.length){ meterEl.hidden=true; return; } meterEl.hidden=false;
    meterEl.innerHTML=list.map(m=>m.pips!==undefined?`<div style="margin-top:3px">${m.label} ${Array.from({length:m.of},(_,i)=>`<span style="display:inline-block;width:9px;height:9px;margin:0 1px;border-radius:2px;background:${i<m.pips?m.col:'#3a3448'}"></span>`).join('')}</div>`
      :`<div style="margin-top:3px">${m.label}<div style="height:6px;background:#1a1420;border-radius:3px;overflow:hidden;margin-top:2px"><div style="height:100%;width:${Math.max(0,Math.min(1,m.f))*100}%;background:${m.col}"></div></div></div>`).join(''); }
  const tintV=css(document.createElement('div'),'position:fixed;inset:0;pointer-events:none;opacity:0;z-index:3'); document.body.appendChild(tintV);
  const hurtV=css(document.createElement('div'),'position:fixed;inset:0;pointer-events:none;box-shadow:inset 0 0 90px 30px rgba(220,30,40,.55);opacity:0;transition:opacity .25s;z-index:4'); document.body.appendChild(hurtV);
  const pops=[]; for(let i=0;i<10;i++){ const d=css(document.createElement('div'),'position:fixed;left:0;top:0;pointer-events:none;font:700 17px var(--f-mono);color:#fff;text-shadow:0 2px 3px #000,0 0 2px #000;z-index:6;white-space:nowrap'); d.hidden=true; document.body.appendChild(d); pops.push({d,t:0}); }
  let popI=0; const V3=new THREE.Vector3();
  const airH=()=>((typeof ENGINE!=='undefined'&&ENGINE.airH)||0)+(pl.jumpY||0), swingH=()=>Math.max(airH(),pl.airSwingT>0?pl.airSwingH:0);   // V113: how high off the ground the knight is (a jump, a leap)
  function pop(x,y,z,txt,col){ const p=pops[popI++%pops.length]; p.x=x; p.y=y; p.z=z; p.t=0.8; p.d.textContent=txt; p.d.style.color=col||'#fff'; p.d.hidden=false; }
  function drawPops(dt){ const cam=ENGINE.cam; pops.forEach(p=>{ if(p.t<=0) return; p.t-=dt; if(p.t<=0){ p.d.hidden=true; return; }
    V3.set(p.x,p.y+(0.8-p.t)*0.9,p.z).project(cam); if(V3.z>1){ p.d.hidden=true; return; }
    p.d.style.transform=`translate(${(V3.x*0.5+0.5)*innerWidth-20}px,${(-V3.y*0.5+0.5)*innerHeight}px)`; p.d.style.opacity=Math.min(1,p.t*3); }); }
  function hurtFlash(){ hurtV.style.opacity='1'; setTimeout(()=>hurtV.style.opacity='0',160); }
  function hud(){ ENGINE.hud(); }

  // ── models ──
  // a demon: a hunched, horned brute on goat's legs, bat wings that beat, claws, a spade-tipped tail; its body baked into one
  //  mesh (its own material, so a hit can flash it white) with the wings apart so they can move
  const NIGHT_AURA=new THREE.MeshBasicMaterial({color:0x7a2ad0,transparent:true,opacity:0.32,depthWrite:false,blending:THREE.AdditiveBlending});
  function demonModel(level,form,boss,tint,night,kind){ if(typeof DEMONS!=='undefined'&&!(typeof LOOK2!=='undefined'&&!LOOK2)) return DEMONS.make(kind||['pounce','claw','brute',(level||1)>=5?'spit':'claw'][(form||0)%4],level,{night,tint,boss});   /* V176: each kind its own shape */
    return demonModelOld(level,form,boss,tint,night); }
  function demonModelOld(level,form,boss,tint,night){ const NF=night==null?-1:night%4, g=new THREE.Group(), base=NF>=0?new THREE.Color(0x4a1258):tint?new THREE.Color(tint).multiplyScalar(0.55):new THREE.Color([0x4a2a5a,0x5a2a3a,0x3a2a4a,0x2a2a3a][form%4]),
      bodyM=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:14,specular:0x221122}), wingM=new THREE.MeshPhongMaterial({color:NF>=0?0x2a0838:0x1a1020,flatShading:true,side:THREE.DoubleSide,shininess:4}), mats=[bodyM,wingM];
    const BODY=base.getHex(), BELLY=base.clone().lerp(new THREE.Color(0xc89a7a),0.25).getHex(), DARK=NF>=0?0x1e0628:0x1a1020, HORN=NF>=0?0x8a7a90:0xd8c8a8, CLAW=0xe8dcc8, parts=[], EYE=NF>=0?0xffd05a:0xff3a3a;
    const P=(geo,col,x,y,z,rx,ry,rz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx) m.scale.set(sx,sy||sx,sz||sx); m.updateMatrix(); const ge=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(m.matrix); parts.push([ge,col]); };
    P(new THREE.SphereGeometry(0.32,12,9),BODY,0,0.62,-0.02,0.25,0,0,1.05,1.12,0.9);                       // hunched chest
    P(new THREE.SphereGeometry(0.24,10,8),BELLY,0,0.5,0.1,0,0,0,1,1.05,0.8);                                // belly
    P(new THREE.SphereGeometry(0.22,10,8),BODY,0,0.4,-0.08,0,0,0,1.1,0.9,1);                                // hips
    [-1,1].forEach(sd=>{ P(new THREE.SphereGeometry(0.13,8,6),BODY,sd*0.27,0.84,0.02);                       // shoulders
      P(new THREE.CylinderGeometry(0.075,0.06,0.3,7),BODY,sd*0.34,0.66,0.06,0.3,0,sd*0.35);                 // upper arm
      P(new THREE.CylinderGeometry(0.06,0.05,0.28,7),BODY,sd*0.4,0.44,0.16,-0.5,0,sd*0.15);                 // forearm
      P(new THREE.SphereGeometry(0.06,7,5),DARK,sd*0.42,0.31,0.24);                                          // hand
      for(let k=-1;k<=1;k++) P(new THREE.ConeGeometry(0.018,0.1,4),CLAW,sd*0.42+k*0.025,0.27,0.29,1.9,0,0);   // claws
      P(new THREE.CylinderGeometry(0.085,0.065,0.24,7),BODY,sd*0.13,0.28,0.02,-0.45,0,0);                   // thigh (goat's legs: forward…)
      P(new THREE.CylinderGeometry(0.055,0.045,0.22,7),DARK,sd*0.13,0.12,-0.04,0.55,0,0);                   // …then back
      P(new THREE.BoxGeometry(0.09,0.05,0.12),DARK,sd*0.13,0.02,0.0);                                        // hoof
      // horns that curve back and up, three segments
      let hx=sd*0.11, hy=1.1, hz=0.02; [[0.055,0.13,-0.3],[0.042,0.12,-0.75],[0.028,0.12,-1.2]].forEach(([r,l,a])=>{ P(new THREE.ConeGeometry(r,l,6),HORN,hx,hy,hz,a,0,-sd*0.45); hy+=Math.cos(a)*l*0.8; hz-=Math.sin(-a)*l*0.8; hx+=sd*0.03; });
      if(NF<=0) P(new THREE.SphereGeometry(0.045,7,5),EYE,sd*0.075,0.98,0.19);                                         // eyes (lit separately below)
      P(new THREE.ConeGeometry(0.035,0.09,4),BODY,sd*0.17,1.02,0.02,0,0,-sd*1.2); });                        // pointed ears
    P(new THREE.SphereGeometry(0.2,12,9),BODY,0,0.96,0.06,0,0,0,1,0.95,1.05);                               // head
    P(new THREE.BoxGeometry(0.2,0.11,0.16),BELLY,0,0.9,0.2);                                                 // snout
    P(new THREE.BoxGeometry(0.18,0.05,0.12),DARK,0,0.84,0.2);                                                // jaw
    [-1,1].forEach(sd=>P(new THREE.ConeGeometry(0.014,0.06,4),CLAW,sd*0.05,0.82,0.26,Math.PI,0,0));          // fangs
    P(new THREE.BoxGeometry(0.22,0.035,0.05),DARK,0,1.05,0.17,-0.2,0,0);                                     // a heavy brow
    for(let i=0;i<4;i++) P(new THREE.ConeGeometry(0.035,0.1,4),DARK,0,0.95-i*0.13,-0.27+i*0.02,-0.6,0,0);    // spines down the back
    let ty=0.38, tz=-0.3; for(let i=0;i<5;i++){ P(new THREE.CylinderGeometry(0.035-i*0.005,0.04-i*0.005,0.16,5),DARK,0,ty,tz,-1.1+i*0.25,0,0); ty-=0.03-i*0.02; tz-=0.13; }
    P(new THREE.ConeGeometry(0.07,0.12,3),DARK,0,ty+0.05,tz,-0.6,0,0,1,1,0.3);                               // the spade
    // ── after dark: one of the four night forms of the game (drawNightForm) ──
    const EYES=NF<0||NF===0?[[0.075,0.985,0.225,0.03],[-0.075,0.985,0.225,0.03]]:[];
    if(NF===0){   // THE LOOMER: a third eye, arms that reach to the ground, horns grown uneven
      EYES.push([0,1.07,0.215,0.034]); P(new THREE.SphereGeometry(0.05,7,5),EYE,0,1.065,0.19);
      [-1,1].forEach(sd=>{ P(new THREE.CylinderGeometry(0.05,0.035,0.34,6),DARK,sd*0.45,0.17,0.24,-0.15,0,sd*0.08); for(let k=-1;k<=1;k++) P(new THREE.ConeGeometry(0.02,0.16,4),CLAW,sd*0.45+k*0.03,0.0,0.3,1.9,0,0); });
      P(new THREE.ConeGeometry(0.075,0.34,6),HORN,0.17,1.25,-0.04,-0.5,0,-0.7); }
    if(NF===1){   // THE MAW: a mouth too big for the face, ringed in fangs; the eyes forced high
      EYES.push([0.07,1.075,0.2,0.026],[-0.07,1.075,0.2,0.026]); P(new THREE.BoxGeometry(0.34,0.2,0.2),0x3a0a1a,0,0.86,0.2); P(new THREE.BoxGeometry(0.26,0.08,0.06),0xd83a5a,0,0.84,0.29);
      for(let i=0;i<8;i++){ const x=-0.14+i*0.04; P(new THREE.ConeGeometry(0.016,0.075,4),CLAW,x,0.93,0.31,Math.PI,0,0); P(new THREE.ConeGeometry(0.016,0.065,4),CLAW,x+0.02,0.78,0.31,0,0,0); } }
    if(NF===2){   // THE HUSK: bloated and sick, eyes uneven, dripping
      EYES.push([0.08,0.99,0.225,0.042],[-0.07,1.0,0.22,0.018]); P(new THREE.SphereGeometry(0.34,12,9),BELLY,0,0.52,0.14,0,0,0,1.1,1,1);
      const sick=0x8a9a4a; for(let i=0;i<7;i++){ const a=i*0.9; P(new THREE.SphereGeometry(0.04+(i%3)*0.012,6,5),sick,Math.sin(a)*0.26,0.42+((i*37)%10)/40,0.2+Math.cos(a)*0.16); }
      for(let i=0;i<4;i++) P(new THREE.ConeGeometry(0.02,0.12,5),0x6a7a2a,-0.12+i*0.08,0.2,0.26,Math.PI,0,0); }
    if(NF===3){   // THE WATCHER: a mass of eyes, hardly a face at all
      for(let i=0;i<11;i++){ const a=i*2.4, r=0.05+0.12*Math.sqrt(i/11); EYES.push([Math.sin(a)*r,0.97+Math.cos(a)*r*0.9+(i>6?-0.25:0),0.23+(i>6?0.06:0),0.016+((i*7)%3)*0.008]); } }
    if(NF>=0){ const au=new THREE.Mesh(new THREE.CircleGeometry(0.75,28),NIGHT_AURA); au.rotation.x=-Math.PI/2; au.position.y=0.03; au.renderOrder=2; g.add(au); }
    // bake: vertex colours, the eyes glow
    const pos=[], nor=[], col=[], c=new THREE.Color(); parts.forEach(([ge,h])=>{ ge.computeVertexNormals(); const p=ge.attributes.position.array, n=ge.attributes.normal.array; c.setHex(h); const lit=h===EYE?2.2:1;
      for(let k=0;k<p.length;k++){ pos.push(p[k]); nor.push(n[k]); } for(let k=0;k<p.length/3;k++) col.push(Math.min(1,c.r*lit),c.g*lit,c.b*lit); });
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.add(new THREE.Mesh(bg,bodyM));
    EYES.forEach(([x,y,z,r])=>{ const eye=new THREE.Mesh(new THREE.SphereGeometry(r,6,4),glow(NF>=0?0xffe07a:0xff5a4a)); eye.position.set(x,y,z); g.add(eye); });
    // the wings: a membrane on finger bones, hinged at the shoulder blade
    [-1,1].forEach(sd=>{ const w=new THREE.Group(); w.position.set(sd*0.16,0.86,-0.18); g.add(w); g['w'+sd]=w;
      const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(0.62,0.32); sh.lineTo(0.6,0.0); sh.quadraticCurveTo(0.5,-0.06,0.45,-0.22); sh.quadraticCurveTo(0.33,-0.18,0.28,-0.34); sh.quadraticCurveTo(0.16,-0.22,0.04,-0.3); sh.lineTo(0,0);
      const mem=new THREE.Mesh(new THREE.ShapeGeometry(sh),wingM); mem.scale.set(sd,1,1); mem.rotation.y=-sd*0.25; w.add(mem);
      [[0.62,0.32],[0.45,-0.22],[0.28,-0.34]].forEach(([x,y])=>{ const L=Math.hypot(x,y), b=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.02,L,4),wingM); b.position.set(sd*x/2,y/2,0.005); b.rotation.z=-sd*(Math.PI/2-Math.atan2(y,x)); w.add(b); }); });
    const s=(0.9+Math.min(0.5,level*0.012))*(NF>=0?1.25:1); g.scale.setScalar(s*(boss?1.5:1)); g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); g.userData.mats=mats; return g; }
  function knightModel(livery){ const k=buildKnight(); k.traverse(m=>{ if(m.isMesh){ m.castShadow=true; } }); const mats=[]; k.traverse(m=>{ if(m.isMesh&&mats.indexOf(m.material)<0) mats.push(m.material); });
    if(livery==='dark') k.setLivery('knight',{TUNIC:'#2a2238',TUNIC_RIM:'#5a3a7a',LEG:'#1a1424',PLUME:'#6a2a9a',HELM:'#3a3448'}); k.userData.mats=mats; return k; }
  function bar(g,h){ const b=new THREE.Group(), bg=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.09),new THREE.MeshBasicMaterial({color:0x1a0a10,depthTest:false})),
      fg=new THREE.Mesh(new THREE.PlaneGeometry(0.78,0.07),new THREE.MeshBasicMaterial({color:0xe04a4a,depthTest:false})); fg.position.z=0.001; bg.renderOrder=fg.renderOrder=10; b.add(bg,fg); b.position.y=h; b.visible=false; g.add(b); b.fg=fg; return b; }

  // ── a fight on a level ──
  function arena(lv,cfg){ const fx=new THREE.Group(); lv.scene.add(fx);
    lv.combat={cfg,foes:[],shots:[],adds:[],arrows:[],fx,rings:[]}; return lv.combat; }
  function clear(lv){ const c=lv.combat; if(typeof BOSSFIGHT!=='undefined') c.foes.forEach(f=>f.bf&&BOSSFIGHT.end(f)); c.foes.concat(c.adds).forEach(f=>f.g&&f.g.parent&&f.g.parent.remove(f.g)); c.shots.concat(c.arrows).forEach(s=>s.m&&c.fx.remove(s.m)); c.foes=[]; c.adds=[]; c.shots=[]; c.arrows=[]; }
  function foe(lv,o){ const c=lv.combat, f=Object.assign({alive:true,hurt:0,knock:0,kdx:0,kdz:0,dying:0,t:Math.random()*60,maxHp:o.hp},o);
    f.g=o.model||(o.boss&&o.bossForm!=null&&typeof BOSS3D!=="undefined"?BOSS3D.make(o.bossForm,o.level||1):o.boss&&o.look==="paladin"?knightModel("dark"):demonModel(o.level||1,o.form||0,o.boss,o.boss?o.tint:null,null,o.style)); f.g.userData.foe=f;   /* each guardian its own (bosses3d.js) */ if(!o.model&&typeof inkify==="function") inkify(f.g,0.018,0x120a10); if(lv.close&&!o.boss) f.g.scale.multiplyScalar(0.72); { const vs=VIEWMODE.ps(lv); if(vs!==1) f.g.scale.multiplyScalar(o.boss?Math.sqrt(vs):vs); } f.bar=bar(f.g,(o.boss?2.4:1.55)*VIEWMODE.ps(lv)); lv.scene.add(f.g);
    if(f.boss){ f.state='idle'; f.timer=34; f.moveIdx=0; f.guardUntil=now()+1300; f.anchorx=f.x; f.anchorz=f.z; f.telegraph=0; f.ring=0; f.ringR=0;
      const tr=new THREE.Mesh(new THREE.RingGeometry(0.6,0.85,28),new THREE.MeshBasicMaterial({color:0xff4a6a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false})); tr.rotation.x=-Math.PI/2; c.fx.add(tr); f.tel=tr;
      const sr=new THREE.Mesh(new THREE.RingGeometry(0.92,1.0,48),new THREE.MeshBasicMaterial({color:0xffb0c0,transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false})); sr.rotation.x=-Math.PI/2; sr.visible=false; c.fx.add(sr); f.slamM=sr;
      // V113: the shockwave stands up off the floor as a wall of light to hop; a target ring where it means to land; its shadow when it flies
      const bd=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.42,56,1,true),new THREE.MeshBasicMaterial({color:0xffb0c0,transparent:true,opacity:0.45,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); bd.visible=false; c.fx.add(bd); f.bandM=bd;
      const mk=new THREE.Group(); const mr=new THREE.Mesh(new THREE.RingGeometry(0.9,1.15,36),new THREE.MeshBasicMaterial({color:0xff3a3a,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false})); mr.rotation.x=-Math.PI/2; mk.add(mr);
      const md=new THREE.Mesh(new THREE.CircleGeometry(0.9,36),new THREE.MeshBasicMaterial({color:0xff3a3a,transparent:true,opacity:0.18,side:THREE.DoubleSide,depthWrite:false})); md.rotation.x=-Math.PI/2; md.position.y=-0.005; mk.add(md); mk.visible=false; c.fx.add(mk); f.markM=mk;
      const shd=new THREE.Mesh(new THREE.CircleGeometry(0.85,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false})); shd.rotation.x=-Math.PI/2; shd.visible=false; c.fx.add(shd); f.shadowM=shd;
      if(o.bossForm!=null&&f.pat&&f.pat.moves){ const fly=[0,2,6,9].includes(o.bossForm), ex=fly?{kind:'soar',telegraph:44}:{kind:'leap',telegraph:38}, mv=f.pat.moves.slice(); if(!(typeof BOSSFIGHT!=='undefined'&&BOSSFIGHT.has(o.bossForm))){ mv.splice(1,0,ex); if(mv.length>=5) mv.splice(4,0,ex); } f.pat=Object.assign({},f.pat,{moves:mv}); f.flier=fly; } }
    f.custom=!!o.model; c.foes.push(f);
    if(!f.custom&&!f.boss&&lv.id==='world'&&isNightNow()){ if(!f.nightBuff){ f.nightBuff=true; f.level=(f.level||1)+2; const r=f.hp/f.maxHp; f.maxHp=5+f.level*2; f.hp=Math.max(1,Math.round(f.maxHp*r)); f.xp=4+f.level*3; } nightify(f,true); }   // born after dark: bold
    return f; }
  // night falls, or lifts: a demon out on the roads takes its night form (one of four, its own), or sheds it at dawn
  function nightify(f,on){ if(!f||f.boss||f.custom||!f.g||!f.g.parent||!!f.nightForm===!!on) return; const old=f.g;
    if(f.nform==null) f.nform=(Math.random()*4)|0;
    const g=demonModel(f.level||1,f.form||0,false,null,on?f.nform:null,f.style); if(typeof inkify==="function") inkify(g,0.018,0x120a10);
    g.scale.copy(old.scale).multiplyScalar(on?1.25:0.8); g.position.copy(old.position); g.rotation.copy(old.rotation); g.visible=old.visible;
    if(f.bar){ old.remove(f.bar); g.add(f.bar); } old.parent.add(g); old.parent.remove(old); f.g=g; f.nightForm=!!on; }
  const isNightNow=()=>{ const d=(GAME.S&&GAME.S.dayFrac)||0.4; return d>=0.875||d<0.25; };
  const fv=()=>({x:Math.sin(P().face), z:Math.cos(P().face)});
  const walk=(x,z)=>A().cfg.walk(Math.floor(x),Math.floor(z));
  const los=(ax,az,bx,bz)=>{ const c=A(); if(!c.cfg.los) return true; const d=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(d/0.375));
    for(let i=1;i<n;i++){ const t=i/n; if(!c.cfg.los(Math.floor(ax+(bx-ax)*t),Math.floor(az+(bz-az)*t))) return false; } return true; };

  // ── the knight's blows ──
  function bossHitGate(d,dmg){ if(!d.boss) return dmg; const t=now(); const sh=swingH();
    if((d.alt||0)>1.9+sh*2.3){ if(!d.highPop||t-d.highPop>900){ d.highPop=t; pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.alt||0)+1.2,d.z,sh>0.2?'Too high!':'Too high — jump!','#8ae0ff'); } return -1; }   // V113: up in the air, out of reach — jump to meet it
    let bonus=1; if(d.state==='stunned') bonus*=1.5; if((d.state==='stunned'||d.bfOpen)&&PK().openDmg) bonus*=1+PK().openDmg; if(sh>0.22){ bonus*=1.3; if(!d.airPop||t-d.airPop>600){ d.airPop=t; pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.alt||0)+2.4,d.z,'Aerial!','#ffe08a'); } } dmg=Math.round(dmg*bonus);
    if(d.guardUntil&&t<d.guardUntil) return -1; const braced=d.state==='telegraph'&&!d.bf, arm=d.bf&&typeof BOSSFIGHT!=='undefined'?BOSSFIGHT.gate(d,BFK):1;
    if(d.lastHitAt&&t-d.lastHitAt<(d.bf&&!d.bfOpen&&d.state!=='stunned'?650:BOSS_GATE)) return -1; d.lastHitAt=t;   /* V177: on its guard, a remastered guardian lets a blow in only now and then */
    if(!d.noEnrage&&!d.enraged&&d.hp-dmg<d.maxHp*0.35){ d.enraged=true; d.timer=Math.min(d.timer||99,5); }
    return Math.max(1,Math.round(Math.min(dmg,Math.ceil(d.maxHp*(d.bf&&typeof BOSSFIGHT!=='undefined'?BOSSFIGHT.cap(d):BOSS_CAP)))*(braced?0.3:1)*arm)); }
  function hitFoe(d,dmg,crit,vx,vz,dist,knock){ const c=A();
    if(c.cfg.onHit&&c.cfg.onHit(d)===false){ d.hurt=3; pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.boss?2.6:1.6),d.z,'—','#a8b0c8'); return; }
    dmg=Math.round(dmg); d.hp-=dmg; SFX.play('hit',crit); d.hurt=8; d.flash=5; d.squash=1; spark(d,crit); hitStop=Math.max(hitStop,(knock>=10?0.11:knock>=8?0.085:0.06)+(crit?0.03:0)); shake=Math.max(shake,(knock>=10?0.32:knock>=8?0.2:0.12)+(crit?0.08:0));
    if(d.lunge&&!(styleOf(d)==='brute'&&d.lunge===1&&knock<8)){ d.lunge=0; d.lungeCd=50; }   // a blow breaks a wind-up (the brute's only a heavy one)
    if(!d.boss&&!d.custom&&!d.ai&&d.hp>0&&knock>=(styleOf(d)==='brute'?10:8)&&!(d.down>0)){ d.down=48; d.lunge=0; d.stag=0; pop(d.x,ENGINE.level.ground(d.x,d.z)+1.2,d.z,'Down!','#ffc89a'); }   /* V146: a heavy blow knocks it off its feet */
    pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.boss?2.6:1.6),d.z,crit?dmg+'!':String(dmg),crit?'#ffd84a':'#fff');
    const m=dist||1; d.kdx=vx/m*knock*PX; d.kdz=vz/m*knock*PX; d.knock=8;
    if(d.hp<=0){ d.alive=false; d.dying=18; deathBurst(d); SFX.play(d.boss?'bossRoar':'demonDie'); if(d.bf&&typeof BOSSFIGHT!=='undefined') BOSSFIGHT.end(d); const g=Math.max(1,Math.round((2+d.level)*S().goldMult));
      const r=GAME.gainXp(d.xp||5); GAME.addGold(g); if(r.up) UI.toast(`Level ${S().level}! A skill point to spend.`,2400);
      if(c.cfg.onKill) c.cfg.onKill(d); } hud(); }
  /* V169: a blow from someone else's hand (the realm's guards): it hurts and staggers, but the knight earns nothing by it */
  function hitBy(d,dmg,fx,fz){ if(!d||!d.alive) return; dmg=Math.max(1,Math.round(dmg)); d.hp-=dmg; d.hurt=8; d.flash=5; d.squash=1; spark(d,false); const p=P(), near=Math.hypot(p.x-d.x,p.z-d.z)<16;
    if(near){ SFX.play('hit',false); pop(d.x,ENGINE.level.ground(d.x,d.z)+1.6,d.z,String(dmg),'#c8d8ff'); }
    const vx=d.x-fx, vz=d.z-fz, m=Math.hypot(vx,vz)||1; d.kdx=vx/m*3*PX; d.kdz=vz/m*3*PX; d.knock=4;
    if(d.hp<=0){ d.alive=false; d.dying=18; d.byGuard=true; deathBurst(d); if(near) SFX.play('demonDie'); const c=A(); if(c&&c.cfg.onKill) c.cfg.onKill(d); } }
  // a foe struck down: a burst of light, a ring of dust, and its spirit rising away
  function deathBurst(d){ const c=A(); if(!c) return; spark(d,true); spark(d,false); dust(d.x,d.z); const gy=ENGINE.level.ground(d.x,d.z), ps=Math.max(0.5,VIEWMODE.ps(ENGINE.level));
    for(let i=0;i<(d.boss?16:7);i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.07+Math.random()*0.06,6,4),glow(i%3?0xe8d8ff:0xffffff)); m.position.set(d.x+(Math.random()-0.5)*0.4,gy+0.6*ps,d.z+(Math.random()-0.5)*0.4); c.fx.add(m);
      c.rings.push({m,t:0,max:0,bit:{vx:(Math.random()-0.5)*0.8,vy:2.2+Math.random()*1.8,vz:(Math.random()-0.5)*0.8}}); } }
  function weaponType(){ const e=SYS.EQUIP[S().equip.weapon]; return e&&e.type==='heavy'?'heavy':'light'; }
  const bowOn=()=>{ const a=SYS.WEAPON_ART&&SYS.WEAPON_ART[S().equip.weapon]; return !!a&&a.fam==='bow'; };
  // V90: a press in the last part of a swing (or a dodge) is kept and thrown the moment you're free — so combos flow
  function attack(){ const c=A(); if(!c) return; if(pl.swing>0||pl.dashing>0){ if(pl.swing<=Math.max(10,pl.swingDur*0.6)||pl.dashing>0) pl.buf=20; return; }
    if(pl.comboT<=0) pl.combo=0; pl.combo++; pl.comboT=60; if(c.cfg.onSwing) c.cfg.onSwing();
    if(pl.combo>=3){ pl.combo=0; special(); return; }
    // V92: the blow lands when the blade actually arrives (the arm's strike, ~30-36% through the cut), and the next swing
    //  waits for this one to all but finish, so a combo flows from one cut into the next instead of snapping back
    const type=weaponType(), w=SWING[type], anim=(w.windup+w.dur)/60*1.8, hitAt=Math.max(w.windup,Math.round(anim*60*(type==='heavy'?0.43:0.4)));
    pl.swing=Math.round(anim*60*0.9); pl.swingDur=pl.swing; ENGINE.K.swing(type==='heavy'?0:pl.combo===2?2:1,anim); lunge(aim(w.reach+1.6),w,type,hitAt);
    if(airH()>0.3&&!pl.plunge){ pl.airSwingH=airH(); pl.airSwingT=hitAt+6; pl.plunge=true; later.push([hitAt+3,()=>{ if(ENGINE.plunge) ENGINE.plunge(); }]); }   // V113: struck in the air — the blade reaches higher, then down you come in a plunge
    if(bowOn()) later.push([hitAt,()=>{ const f=fv(), p=P(); const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.5),glow(0xfff0b0)); c.fx.add(m);
      c.arrows.push({x:p.x,z:p.z,vx:f.x*3.2*PX,vz:f.z*3.2*PX,t:26,m}); SFX.play('swing','light'); }]);
    else later.push([Math.max(1,hitAt-2),()=>SFX.play('swing',type)],[hitAt,()=>{ slash(type); resolve(type); }]); }
  // ── the Spin Attack (Ocarina's): hold the swing — the blade gathers light at your feet — and let go to cut all the way round ──
  const SPIN={reach:2.25,mult:2.0,knock:10,hold:0.42,full:1.0}; const charge={on:false,t0:0,k:0,ready:false,ring:null};
  function chargeStart(){ const c=A(); if(!c||bowOn()) return; charge.on=true; charge.t0=now(); charge.k=0; charge.ready=false; }
  function chargeRelease(){ const was=charge.on&&charge.ready; charge.on=false; charge.k=0; charge.ready=false; ENGINE.K.charge=0; if(charge.ring) charge.ring.visible=false; if(was&&A()) spin(); }
  function chargeTick(dt){ const c=A(); if(!charge.on||!c){ ENGINE.K.charge=0; if(charge.ring) charge.ring.visible=false; return; }
    const held=(now()-charge.t0)/1000; if(held<SPIN.hold||pl.dashing>0){ return; }
    const k=Math.min(1,(held-SPIN.hold)/(SPIN.full-SPIN.hold)); charge.k=k; ENGINE.K.charge=Math.max(0.15,k);
    if(!charge.ring){ const r=new THREE.Mesh(new THREE.RingGeometry(0.55,0.68,36),new THREE.MeshBasicMaterial({color:0xffe48a,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); r.rotation.x=-Math.PI/2; charge.ring=r; }
    if(charge.ring.parent!==c.fx) c.fx.add(charge.ring); const p=P(), ps=Math.max(0.55,VIEWMODE.ps(ENGINE.level)); charge.ring.visible=true;
    charge.ring.position.set(p.x,ENGINE.level.ground(p.x,p.z)+0.05,p.z); charge.ring.scale.setScalar(ps*(2.4-1.3*k)); charge.ring.material.opacity=0.35+0.5*k; charge.ring.material.color.setHex(k>=1?0xffffff:0xffe48a);
    if(k>=1&&!charge.ready){ charge.ready=true; pop(p.x,ENGINE.level.ground(p.x,p.z)+1.9*ps,p.z,'✦','#fff4b0'); }
    if(Math.random()<0.35){ const a=Math.random()*6.283, rr=(2.4-1.3*k)*0.6*ps, m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.05),glow(0xfff0b0)); m.position.set(p.x+Math.cos(a)*rr,ENGINE.level.ground(p.x,p.z)+0.1,p.z+Math.sin(a)*rr); c.fx.add(m); c.rings.push({m,t:0,max:0,bit:{vx:-Math.cos(a)*0.8,vy:1.4,vz:-Math.sin(a)*0.8}}); } }
  function spin(){ const c=A(), p=P(); if(!c) return; SFX.play('swing','heavy'); pl.swing=26; pl.swingDur=26; pl.combo=0; pl.lungeT=0; ENGINE.K.spinT=0; if(c.cfg.onSwing) c.cfg.onSwing();
    const ps=VIEWMODE.ps(ENGINE.level), radiant=(SYS.WEAPON_ART&&SYS.WEAPON_ART[S().equip.weapon]||{}).fam==='radiant';
    const m=new THREE.Mesh(new THREE.RingGeometry(SPIN.reach*0.45,SPIN.reach*0.62,40),new THREE.MeshBasicMaterial({color:radiant?0xfff0a0:0xeef6ff,transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.rotation.x=-Math.PI/2; m.position.set(p.x,ENGINE.level.ground(p.x,p.z)+0.85*Math.max(0.5,ps),p.z); m.scale.setScalar(Math.max(0.6,ps)*1.6); c.fx.add(m); c.rings.push({m,t:0,max:0,slash:1});
    later.push([6,()=>{ const c2=A(); if(c2!==c) return; let hits=0; const px=P().x, pz=P().z;
      c.foes.forEach(d=>{ if(!d.alive) return; const vx=d.x-px, vz=d.z-pz, dist=Math.hypot(vx,vz); if(dist>SPIN.reach+(d.boss?0.3:0)||!los(px,pz,d.x,d.z)) return;
        let dmg=Math.max(1,Math.round(S().atk*SPIN.mult)+(Math.random()*5|0)-2); let crit=Math.random()<S().crit+0.05; if(crit) dmg=Math.round(dmg*1.8); [dmg,crit]=myBlow(dmg,crit,true);
        dmg=bossHitGate(d,dmg); if(dmg<0){ d.hurt=3; return; } hits++; hitFoe(d,dmg,crit,vx,vz,dist,SPIN.knock); });
      c.adds.forEach(a=>{ if(!a.alive||a.flock) return; if(Math.hypot(a.x-px,a.z-pz)>SPIN.reach) return; if(a.mirror){ a.alive=false; if(c.cfg.onMirror) c.cfg.onMirror(a); return; }
        const dmg=Math.max(1,Math.round(S().atk*SPIN.mult)); a.hp-=dmg; a.hurt=8; hits++; pop(a.x,1.5,a.z,String(dmg)); if(a.hp<=0) a.alive=false; });
      shake=Math.max(shake,0.28); if(hits) hitStop=Math.max(hitStop,0.08); UI.toast('✦ Spin Attack!'+(hits>1?' ×'+hits:''),700); }]); }
  // a soft aim: the swing turns you to the nearest foe in front of you (or the one you're locked on to)
  function aim(range){ const c=A(), p=P(); if(!c) return; let best=lock&&lock.alive?lock:null, bs=1e9; const f=fv();
    if(!best) c.foes.concat(c.adds.filter(a=>!a.flock)).forEach(d=>{ if(!d.alive) return; const vx=d.x-p.x, vz=d.z-p.z, dist=Math.hypot(vx,vz); if(dist>range+(d.boss?0.6:0)||dist<1e-3) return;
      const dot=(vx*f.x+vz*f.z)/dist; if(dot<-0.2) return; const sc=dist*(1.6-dot); if(sc<bs&&los(p.x,p.z,d.x,d.z)){ bs=sc; best=d; } });
    if(best) p.face=Math.atan2(best.x-p.x,best.z-p.z); return best; }
  // the step into the blow: you close on the foe you're cutting at (to just inside your reach), or take half a pace forward
  function lunge(best,w,type,hitAt){ const p=P(), f=fv(); let dist=type==='heavy'?0.2:0.25;
    if(best){ const d=Math.hypot(best.x-p.x,best.z-p.z)-rad(best); dist=Math.max(0,Math.min(0.7,d-w.reach*0.55)); }
    const n=(hitAt||w.windup)+2; pl.lungeT=n; pl.lungeN=n; pl.lx=f.x*dist; pl.lz=f.z*dist; }   // spread over the wind-up, eased in and out
  // the arc of the cut, for a blink
  function slash(type){ const c=A(), p=P(); if(!c) return; const w=SWING[type], art=SYS.WEAPON_ART&&SYS.WEAPON_ART[S().equip.weapon], col=art&&art.fam==='radiant'?0xffe890:type==='heavy'?0xffd0a0:0xeef4ff, ps=VIEWMODE.ps(ENGINE.level);
    const m=new THREE.Mesh(new THREE.RingGeometry((w.reach+0.4)*0.45,(w.reach+0.9)*0.5,24,1,-w.half,w.half*2),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.75,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2-p.face; m.position.set(p.x,ENGINE.level.ground(p.x,p.z)+0.9*Math.max(0.5,ps),p.z); m.scale.setScalar(Math.max(0.6,ps)*1.6); m.userData.op=0.14; m.visible=type==='heavy'; c.fx.add(m); c.rings.push({m,t:0,max:0,slash:1}); }   // V93: the big arc is gone (the blade's own trail shows the cut); a ghost of it stays for the heavy chop
  // a burst of sparks where the blow lands
  function spark(d,crit){ const c=A(); if(!c) return; const y=ENGINE.level.ground(d.x,d.z)+(d.boss?1.4:0.8)*Math.max(0.5,VIEWMODE.ps(ENGINE.level)); for(let i=0;i<(crit?9:5);i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.06),glow(crit?0xffe84a:0xffffff)); m.position.set(d.x,y,d.z); c.fx.add(m);
      const a=Math.random()*6.283, u=Math.random()*0.8+0.3; c.rings.push({m,t:0,max:0,bit:{vx:Math.cos(a)*u*3,vy:1.5+Math.random()*2.5,vz:Math.sin(a)*u*3}}); } }
  function resolve(type){ const c=A(); if(!c) return; const w=SWING[type], f=fv(), p=P(), reach=w.reach+0.9, cut=Math.cos(w.half); let any=false, hit=false, clang=false;
    c.foes.forEach(d=>{ if(!d.alive) return; const vx=d.x-p.x, vz=d.z-p.z, dist=Math.hypot(vx,vz); if(dist>reach+(d.boss?0.3:0)) return;
      if(dist>0.001&&(vx*f.x+vz*f.z)/dist<cut) return; if(!los(p.x,p.z,d.x,d.z)) return;
      let dmg=Math.max(1,Math.round(S().atk*w.mult)+(Math.random()*5|0)-2); let crit=Math.random()<S().crit; if(crit) dmg=Math.round(dmg*1.8); [dmg,crit]=myBlow(dmg,crit,false);
      if(!d.boss){ if(d.stag>0||d.down>0) dmg=Math.round(dmg*(1.5+(PK().openDmg||0))); if(ENGINE.K.crouch&&(!d.alert||d.asleep)){ dmg*=2; pop(d.x,ENGINE.level.ground(d.x,d.z)+2.0,d.z,'✦ Sneak strike','#c8b0ff'); } }   /* V146: open after a parry or a fall; unaware — double */
      dmg=bossHitGate(d,dmg); if(dmg<0){ d.hurt=3; any=true; clang=true; return; } any=hit=true; hitFoe(d,dmg,crit,vx,vz,dist,w.knock); });
    c.adds.forEach(a=>{ if(!a.alive||a.flock) return; const vx=a.x-p.x, vz=a.z-p.z, dist=Math.hypot(vx,vz); if(dist>reach) return; if(dist>0.001&&(vx*f.x+vz*f.z)/dist<cut) return; if(!los(p.x,p.z,a.x,a.z)) return;
      /* V143: a SNEAK STRIKE — crouched, on a demon that hasn't noticed you: double the damage */
      const sneakHit=ENGINE.K.crouch&&!a.alert&&!a.boss; const dmg=Math.max(1,Math.round(S().atk*w.mult*(sneakHit?2:1))); a.hp-=dmg; a.hurt=8; any=true; a.alert=true; SFX.play('hit',sneakHit); pop(a.x,1.5,a.z,sneakHit?'✦ '+dmg:String(dmg)); if(sneakHit&&typeof UI!=='undefined'&&!pl._snkSaid){ pl._snkSaid=true; UI.toast('✦ Sneak strike — double damage on a demon that never saw you coming.',2200); } if(a.hp<=0) a.alive=false; });
    if(any) pl.comboT=48; if(clang) SFX.play('block'); if(clang) UI.toast('Turned aside — strike it in the openings',900); }
  // the Ground Pound: a leap, the sword raised overhead, then down onto the earth — the ring, the dust, the jolt
  function special(){ const c=A(); pl.swing=30; pl.swingDur=30; pl.lungeT=0; pl.leap=1; pl.leapT=0; ENGINE.K.raise=1; aim(GP.radius+1.5); const p=P(), f=fv();
    later.push([12,()=>ENGINE.K.swing(0,0.42)]);
    later.push([18,()=>{ const c2=A(); if(c2!==c) return; let hits=0; shake=Math.max(shake,0.45); hitStop=Math.max(hitStop,0.07); dust(P().x,P().z);
      const ring=new THREE.Mesh(new THREE.RingGeometry(0.2,0.45,32),new THREE.MeshBasicMaterial({color:(SYS.EQUIP[S().equip.weapon]||{}).special==='radiant'?0xfff7c8:weaponType()==='heavy'?0xffae5a:0xffe87a,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false}));
      ring.rotation.x=-Math.PI/2; ring.position.set(P().x,ENGINE.level.ground(P().x,P().z)+0.06,P().z); c.fx.add(ring); c.rings.push({m:ring,t:0,max:GP.radius});
      const px=P().x, pz=P().z;
      c.foes.forEach(d=>{ if(!d.alive) return; const vx=d.x-px, vz=d.z-pz, dist=Math.hypot(vx,vz); if(dist>GP.radius) return;
        let dmg=Math.max(1,Math.round(S().atk*GP.mult)+(Math.random()*6|0)-2); let crit=Math.random()<S().crit+0.1; if(crit) dmg=Math.round(dmg*1.8); [dmg,crit]=myBlow(dmg,crit,true);
        dmg=bossHitGate(d,dmg); if(dmg<0){ d.hurt=3; return; } hits++; hitFoe(d,dmg,crit,vx,vz,dist,GP.knock); d.knock=10; });
      if((SYS.EQUIP[S().equip.weapon]||{}).special==='radiant'&&S().hp<S().maxHp){ S().hp=Math.min(S().maxHp,S().hp+Math.round(12*S().healMult)); hud(); }
      c.adds.forEach(a=>{ if(!a.alive||a.flock) return; if(Math.hypot(a.x-px,a.z-pz)>GP.radius) return;
        if(a.mirror){ a.alive=false; if(c.cfg.onMirror) c.cfg.onMirror(a); return; }
        a.hp-=Math.max(1,Math.round(S().atk*GP.mult)); a.hurt=8; hits++; if(a.hp<=0) a.alive=false; });
      UI.toast('✦ Ground Pound!'+(hits?' ×'+hits:''),700); }]); }
  function landed(){ const c=A(); if(!c||!pl.plunge){ pl.plunge=false; return; } pl.plunge=false; SFX.play('bossStrike'); const p=P(), R=1.7; shake=Math.max(shake,0.35); hitStop=Math.max(hitStop,0.05); dust(p.x,p.z);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.2,0.42,32),new THREE.MeshBasicMaterial({color:0xffe87a,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.position.set(p.x,ENGINE.level.ground(p.x,p.z)+0.06,p.z); c.fx.add(ring); c.rings.push({m:ring,t:0,max:R});
    c.foes.forEach(d=>{ if(!d.alive||(d.alt||0)>1.2) return; const vx=d.x-p.x, vz=d.z-p.z, dist=Math.hypot(vx,vz); if(dist>R+(d.boss?0.4:0)) return; let dmg=Math.max(1,Math.round(S().atk*0.8)); dmg=bossHitGate(d,dmg); if(dmg<0){ d.hurt=3; return; } hitFoe(d,dmg,false,vx,vz,dist,8); });
    c.adds.forEach(a=>{ if(!a.alive||a.flock||Math.hypot(a.x-p.x,a.z-p.z)>R) return; a.hp-=Math.max(1,Math.round(S().atk*0.8)); a.hurt=8; if(a.hp<=0) a.alive=false; }); }
  function dust(x,z){ const c=A(), gy=ENGINE.level.ground(x,z), ps=Math.max(0.5,VIEWMODE.ps(ENGINE.level)); for(let i=0;i<14;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.14),flat(i%3?0xb8a888:0x8a7a62)); const a=i/14*6.283; m.position.set(x+Math.cos(a)*0.3,gy+0.1,z+Math.sin(a)*0.3); c.fx.add(m);
      c.rings.push({m,t:0,max:0,bit:{vx:Math.cos(a)*3.2*ps,vy:1.8+Math.random()*1.5,vz:Math.sin(a)*3.2*ps,dust:1}}); } }
  // Ⓑ: hold to guard, tap twice to dodge
  function bDown(){ if(!A()) return; const t=now(); if(t-pl.lastTap<300){ pl.lastTap=0; dodge(); return; } pl.bDown=true; pl.bAt=t; }
  function bUp(){ if(!pl.bDown) return; pl.bDown=false; pl.blocking=false; if(now()-pl.bAt<170) pl.lastTap=now(); }
  // a dodge goes the way you're pushing (dir, from the keys or stick) — or, with nothing pushed, hops back from what you face
  // V90: the roll bursts out fast and eases off (about two and a half tiles), and it can cut short the follow-through of a swing
  const DASH_N=9;
  function dodge(dir){ if(pl.dodgeCd>0||pl.dashing>0) return; if(pl.swing>0){ if(pl.swing>pl.swingDur*0.5) return; pl.swing=0; } pl.lungeT=0;
    const f=fv(), c=A(), m=c&&c.cfg.dodgeMult?c.cfg.dodgeMult():1, d=dir&&dir.x!==undefined?dir:{x:-f.x,z:-f.z}, l=Math.hypot(d.x,d.z)||1, v=0.375*m; pl.dashx=d.x/l*v; pl.dashz=d.z/l*v; pl.dashing=DASH_N; pl.iframes=22; pl.dodgeCd=32; SFX.play('dodge');
    /* V143: moving, it's a combat roll — he turns into it and tumbles through (the Mixamo roll); standing, the quick hop back as before */
    if(dir&&dir.x!==undefined&&Math.hypot(dir.x,dir.z)>0.1&&ENGINE.K.act&&ENGINE.K.act('roll',0.52,{arms:true})){ ENGINE.P.face=Math.atan2(d.x,d.z); pl.iframes=26; } }
  guardB.addEventListener('pointerdown',e=>{ e.preventDefault(); bDown(); }); ['pointerup','pointercancel','pointerleave'].forEach(k=>guardB.addEventListener(k,bUp));

  // ── the knight takes a blow ──
  function blockSpark(){ const p=P(); pop(p.x,ENGINE.level.ground(p.x,p.z)+1.8,p.z,'blocked','#a8d0ff'); }
  function takeHit(inc){ if(typeof PETFIGHT!=='undefined'){ inc=PETFIGHT.soak(inc); if(inc<=0) return; }
    if(inc>=S().hp&&PK().revive&&A()&&!A().revived){ A().revived=true; S().hp=Math.max(1,Math.round(S().maxHp*PK().revive)); pl.iframes=Math.max(pl.iframes,100); hud(); SFX.play('parry'); pop(P().x,ENGINE.level.ground(P().x,P().z)+2.4,P().z,'Living Water','#8ad8ff'); UI.toast('💧 Living Water — you stand again. (Once a fight.)',2200); return; }
    S().hp=Math.max(0,S().hp-inc); SFX.play(pl.blocking?'block':'hurt'); hud(); if(!pl.blocking&&ENGINE.K.hit) ENGINE.K.hit(); pop(P().x,ENGINE.level.ground(P().x,P().z)+1.9,P().z,'-'+inc,'#ff8a8a'); if(!pl.blocking) hurtFlash();
    if(S().hp<=0){ S().hp=S().maxHp; pl.iframes=90; hud(); const c=A(); later.length=0; c.shots.forEach(s=>c.fx.remove(s.m)); c.shots=[];
      /* V139: he falls first — the sword-and-shield death plays out (held there, untouchable), then the defeat as before */
      if(ENGINE.K.act&&ENGINE.K.act('death',2.6,{arms:true})){ pl.iframes=220; ENGINE.hold(2.7,'down'); setTimeout(()=>{ c.cfg.onDeath&&c.cfg.onDeath(); },2500); }
      else c.cfg.onDeath&&c.cfg.onDeath();
      return true; } return false; }
  // the overworld rule: max(1, atk − def), less the damage reduction; guarding takes a tenth and shoves it off
  function worldContact(d,dx,dz,dist,mult){ let inc=Math.max(1,Math.round((d.atk||6)*(mult||1))-S().def); inc=Math.max(1,Math.round(inc*(1-S().dmgReduce))); let kb=1.5, ifr=40;
    if(pl.blocking){ inc=Math.max(1,Math.ceil(inc*(PK().blockK||0.1))); blockSpark(); kb=3.2; ifr=70; }
    pl.iframes=ifr; push(d,-dx/dist,-dz/dist,kb); takeHit(inc); }
  function push(d,ux,uz,tiles){ for(let s=0;s<Math.ceil(tiles*4);s++){ const nx=d.x+ux*0.25, nz=d.z+uz*0.25; if(!walk(nx,nz)) break; d.x=nx; d.z=nz; } }
  // the chapel rule: BOSS_TUNE.dmgMult by tier, half your defence, the damage reduction; guarding takes a tenth
  function hurtFromBoss(dmg,pierce){ const c=A(); if(pl.iframes>0&&!pierce) return; dmg*=c.tune.dmgMult;
    let inc=Math.max(1,Math.round((dmg-S().def*0.5)*(1-S().dmgReduce))); if(pl.blocking){ inc=Math.max(1,Math.ceil(inc*(pl.redHold?0.5:(PK().blockK||0.1)))); blockSpark(); } pl.redHold=0;
    pl.iframes=c.tune.iframes; takeHit(inc); }

  // ── one step of the world: 1/60 s, as the game counts it ──
  function step(){ const c=A(), p=P(), cfg=c.cfg, dun=cfg.mode==='dungeon';
    for(let i=later.length-1;i>=0;i--){ if(--later[i][0]<=0){ const f=later[i][1]; later.splice(i,1); f(); } }
    stepDrops(); if(pl.airSwingT>0) pl.airSwingT--; if(pl.punish>0) pl.punish--; if(pl.counter>0) pl.counter--;
    if(typeof PETFIGHT!=='undefined') PETFIGHT.step(c,PFK);
    if(PK().regen&&(c._rg=(c._rg||0)+1)>=180){ c._rg=0; const s=S(); if(s.hp<s.maxHp&&s.hp>0&&c.foes.some(d=>d.alive&&(d.boss||Math.hypot(d.x-p.x,d.z-p.z)<9))){ s.hp=Math.min(s.maxHp,s.hp+Math.max(1,Math.round(s.maxHp*PK().regen))); hud(); } }
    if(pl.leap){ pl.leapT++; const k=pl.leapT; pl.jumpY=k<=12?Math.sin(k/12*Math.PI/2)*0.95:Math.max(0,0.95*(1-(k-12)/6)); if(k>=18){ pl.leap=0; pl.jumpY=0; } }   // up for twelve steps, down in six
    if(pl.swing>0) pl.swing--; if(pl.iframes>0) pl.iframes--; if(pl.guardBreak>0) pl.guardBreak--; pl.blocking=pl.bDown&&!(pl.guardBreak>0); if(pl.dodgeCd>0) pl.dodgeCd--; if(pl.comboT>0&&--pl.comboT<=0) pl.combo=0;
    if(pl.dashing>0){ const k=0.35+0.65*pl.dashing/DASH_N; pl.dashing--; const L0=ENGINE.level, nx=p.x+pl.dashx*k, nz=p.z+pl.dashz*k; if(L0.canMove(p.x,p.z,nx,p.z)) p.x=nx; if(L0.canMove(p.x,p.z,p.x,nz)) p.z=nz; }
    if(pl.lungeT>0){ const N=pl.lungeN||1, u0=(N-pl.lungeT)/N, u1=(N-pl.lungeT+1)/N, sm=u=>u*u*(3-2*u), k=sm(u1)-sm(u0); pl.lungeT--; const L0=ENGINE.level, nx=p.x+pl.lx*k, nz=p.z+pl.lz*k; if(L0.canMove(p.x,p.z,nx,p.z)&&!solid(nx,p.z)) p.x=nx; if(L0.canMove(p.x,p.z,p.x,nz)&&!solid(p.x,nz)) p.z=nz; }
    if(pl.buf>0){ pl.buf--; if(pl.swing<=0&&pl.dashing<=0){ pl.buf=0; attack(); } }
    if(!c.tune) c.tune={dmgMult:0.70+Math.max(0,Math.min(9,cfg.tier|0))*0.05,iframes:26,novaRange:1.9,novaShots:8,novaSpeed:2.6*PX,novaLife:26,hotRadius:1.05,enrageDmg:1.4};
    const T=c.tune;
    c.foes.forEach(d=>{ if(d.dying>0){ d.dying--; return; } if(!d.alive) return; d.t++; if(d.hurt>0) d.hurt--;
      if(d.knock>0){ d.knock--; if(!d.boss){ const nx=d.x+d.kdx, nz=d.z+d.kdz; if(walk(nx,d.z)) d.x=nx; if(walk(d.x,nz)) d.z=nz; if(dun){ d.kdx*=0.72; d.kdz*=0.72; } return; } }
      if(d.stag>0){ d.stag--; return; } if(d.down>0){ d.down--; return; }   /* V146: reeling from a parry, or knocked off its feet */
      const dx=p.x-d.x, dz=p.z-d.z, dist=Math.hypot(dx,dz)||1e-3;
      /* V144: asleep in its camp (sneak.js) — it stirs only if you come right up to it standing, brush past it crouched, or it's struck; and when one wakes, its camp wakes */
      if(d.asleep){ if(d.hurt>0||dist<(ENGINE.K.crouch?1.25:4.5)){ if(typeof SNEAK!=='undefined') SNEAK.wake(d.camp); else d.asleep=false; } else return; }
      if(d.held&&d.held(d,dist)) return;   /* V169: locked in a fight with the guards — until you come close */
      if(d.ai){ d.ai(d,dx,dz,dist,T); return; }   // a fight with its own rules (the finale)
      if(d.boss&&d.pat&&d.bossForm!=null&&typeof BOSSFIGHT!=='undefined'&&BOSSFIGHT.has(d.bossForm)){ bossStep(d,dx,dz,dist,T); return; }   /* V180: a remastered guardian fights its way wherever it stands (the throne room too) */
      /* V140: creeping low (crouch) a demon that hasn't seen you only notices you close by; once it has, it keeps after you */
      const sneak=ENGINE.K.crouch&&!d.alert; if(dist>12) d.alert=false;
      if(!dun){ if(press(d,dx,dz,dist,sneak?3:7,0.9)){ d.alert=true; return; }
        let vx=Math.cos(d.t*0.03)*0.25*PX, vz=Math.sin(d.t*0.04)*0.25*PX; if(walk(d.x+vx,d.z)) d.x+=vx; if(walk(d.x,d.z+vz)) d.z+=vz; d.face=Math.atan2(vx,vz); return; }
      if(d.boss&&d.pat){ bossStep(d,dx,dz,dist,T); return; }
      // a chapel demon: inside 3 tiles it presses and lunges like any demon; to 6 it gives chase, axis-first so it slides along walls; otherwise patrol its post
      { const sp=styleOf(d)==='spit', R0=sp?7:3; if(dist<R0&&press(d,dx,dz,dist,R0,0.8,true)){ d.alert=true; return; } }   /* a spitter spits from across a gap */
      const chase=dist<(sneak?2.6:6); if(chase) d.alert=true; let mx,mz;
      if(chase){ if(Math.abs(dx)>Math.abs(dz)){ mx=Math.sign(dx)*0.8*PX; mz=Math.sign(dz)*0.3*PX; } else { mz=Math.sign(dz)*0.8*PX; mx=Math.sign(dx)*0.3*PX; } }
      else { mx=d.pdx*0.45*PX; mz=d.pdz*0.45*PX; if(Math.hypot(d.x-d.hx,d.z-d.hz)>d.patrol){ if(Math.abs(d.hx-d.x)>Math.abs(d.hz-d.z)){ d.pdx=Math.sign(d.hx-d.x)||1; d.pdz=0; } else { d.pdz=Math.sign(d.hz-d.z)||1; d.pdx=0; } mx=d.pdx*0.45*PX; mz=d.pdz*0.45*PX; } }
      const nx=d.x+mx, nz=d.z+mz; let okX=walk(nx,d.z), okZ=walk(d.x,nz);
      if(!chase&&Math.hypot(d.x-d.hx,d.z-d.hz)>d.patrol){ if(Math.abs(nx-d.hx)>Math.abs(d.x-d.hx)) okX=false; if(Math.abs(nz-d.hz)>Math.abs(d.z-d.hz)) okZ=false; }
      if(okX) d.x=nx; if(okZ) d.z=nz; d.face=Math.atan2(mx,mz);
      if(!chase&&((!okX&&!okZ)||(d.pdx&&!okX)||(d.pdz&&!okZ))){ const tx=Math.floor(d.x), tz=Math.floor(d.z), o=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>cfg.walk(tx+a,tz+b)); if(o.length){ const [a,b]=o[Math.random()*o.length|0]; d.pdx=a; d.pdz=b; } }
      if(dist<0.75) hurtFromBoss(7+d.level*0.6); });
    separate();
    // shots, adds, the knight's arrows
    c.shots.forEach(s=>{ s.x+=s.vx; s.z+=s.vz; s.life--; if(s.life>0&&!(cfg.fly?cfg.fly(Math.floor(s.x),Math.floor(s.z)):walk(s.x,s.z))){   /* V150: a level can let shots fly over what you can't walk (a chasm) */ s.life=0; if(cfg.shotWall) cfg.shotWall(Math.floor(s.x),Math.floor(s.z)); }
      /* V146: a parried shot flies back the way it came, and strikes whatever it meets */
      if(s.ref){ if(s.life>0) for(const d of c.foes){ if(!d.alive||(d.alt||0)>1.6) continue; const vx=d.x-s.x, vz=d.z-s.z, dd=Math.hypot(vx,vz); if(dd>(d.boss?1.0:0.6)) continue; s.life=0; let dmg=Math.max(2,Math.round(S().atk*1.4)); dmg=bossHitGate(d,dmg); if(dmg<0){ d.hurt=3; break; } hitFoe(d,dmg,true,vx,vz,dd||1,6); if(!d.boss&&d.alive){ d.stag=60; d.lunge=0; } break; } return; }
      if(s.life>0&&!s.nova&&Math.hypot(s.x-p.x,s.z-p.z)<0.62&&pl.iframes<=0&&parryNow()){ s.ref=true; s.vx*=-1.5; s.vz*=-1.5; s.life=120; if(s.m.material&&s.m.material.color) s.m.material.color.setHex(0xffe27a); parry(s.from&&s.from.alive?s.from:{x:s.x,z:s.z,level:1},false); if(s.from) s.from.stag=0; pop(p.x,ENGINE.level.ground(p.x,p.z)+2.4,p.z,'Sent back!','#ffe27a'); return; }
      if(s.life>0&&Math.hypot(s.x-p.x,s.z-p.z)<0.5){ s.life=0; const tl=cfg.townLvl||10; if(!s.nova&&typeof PETFIGHT!=='undefined'&&PETFIGHT.shotStop()){ pop(p.x,ENGINE.level.ground(p.x,p.z)+2.0,p.z,'Shell!','#8ad8ff'); return; }
        if(s.dmg!==undefined){ if(s.nova){ if(s.burst===c._novaHit) return; c._novaHit=s.burst; } hurtFromBoss(s.dmg,s.nova); return; }   // a shot that carries its own blow
        if(!s.nova&&cfg.shotHit&&cfg.shotHit(s)) return;
        if(s.nova){ if(s.burst===c._novaHit) return; c._novaHit=s.burst; hurtFromBoss(12+tl*2.4,true); } else hurtFromBoss(4+tl*0.9); } });
    c.shots=c.shots.filter(s=>{ if(s.life>0) return true; c.fx.remove(s.m); return false; });
    c.adds.forEach(a=>{ if(!a.alive) return;
      if(a.flock){ a.wander+=(Math.random()-0.5)*0.35; const nx=a.x+Math.cos(a.wander)*a.speed, nz=a.z+Math.sin(a.wander)*a.speed; if(walk(nx,nz)){ a.x=nx; a.z=nz; a.moving=a.speed>0; } else a.wander+=2.2; return; }
      if(a.husk&&cfg.frozenAdds&&cfg.frozenAdds()){ a.frozen=true; return; } a.frozen=false;
      if(a.mirror){ if(cfg.mirrorStep) cfg.mirrorStep(a); }
      else { const dx=p.x-a.x, dz=p.z-a.z, m=Math.hypot(dx,dz)||1; a.x+=dx/m*a.speed; a.z+=dz/m*a.speed; } if(a.hurt>0) a.hurt--;
      if(Math.hypot(p.x-a.x,p.z-a.z)<0.7) hurtFromBoss(a.dmg!==undefined?a.dmg:4+a.level*0.7); });
    c.adds=c.adds.filter(a=>{ if(a.alive) return true; if(a.g&&a.g.parent) a.g.parent.remove(a.g); return false; });
    c.arrows.forEach(s=>{ s.x+=s.vx; s.z+=s.vz; s.t--; if(!walk(s.x,s.z)) s.t=0; if(s.t<=0) return;
      for(const d of c.foes){ if(!d.alive) continue; const vx=d.x-s.x, vz=d.z-s.z, dist=Math.hypot(vx,vz); if(dist>0.56+(d.boss?0.3:0)) continue;
        let dmg=Math.max(1,Math.round(S().atk)+(Math.random()*5|0)-2); const crit=Math.random()<S().crit; if(crit) dmg=Math.round(dmg*1.8);
        dmg=bossHitGate(d,dmg); s.t=0; if(dmg<0){ d.hurt=3; return; } hitFoe(d,dmg,crit,vx,vz,dist,4); pl.comboT=48; return; } });
    c.arrows=c.arrows.filter(s=>{ if(s.t>0) return true; c.fx.remove(s.m); return false; });
    if(cfg.tick) cfg.tick(); }
  // V146: every demon fights its own way, and every blow is shown before it comes — the demon's whole body flashes red as
  //  it winds up (bright on the last beat: that's the moment to guard). Its FORM says how it fights:
  //    · the POUNCER (form 0) crouches and springs at you
  //    · the CLAWER (form 1) rears back, then rakes twice, left and right
  //    · the BRUTE (form 2) heaves up for a long beat and brings both fists down: guarding it breaks your guard, a
  //      light blow won't stop it (only a heavy one does) — roll clear, or parry it, and it's open a long while after
  //    · the SPITTER (form 3, once they're strong enough) keeps its distance, gathers a gob of hellfire and spits it
  //  PARRY: guard the instant a blow lands (within a fifth of a second of pressing guard) and you turn it aside whole —
  //  the demon reels, open, and your next blows bite half again as hard. A parried spit flies back at whoever threw it.
  const PARRY_MS=200, ST={ pounce:{wind:18,windD:20}, claw:{wind:13,windD:14}, brute:{wind:34,windD:34}, spit:{wind:24,windD:24} };
  const styleOf=d=>d.style||(d.style=d.boss||d.custom||d.ai?'boss':['pounce','claw','brute',(d.level||1)>=5?'spit':'claw'][(d.form||0)%4]);
  let parryTip=false;
  function parryNow(){ return pl.bDown&&!(pl.guardBreak>0)&&now()-pl.bAt<PARRY_MS+(PK().parryMs||0); }
  function parry(d,boss){ const p=P(); pl.iframes=Math.max(pl.iframes,16); hitStop=Math.max(hitStop,0.12); shake=Math.max(shake,0.2); SFX.play('parry');
    pop(p.x,ENGINE.level.ground(p.x,p.z)+2.0,p.z,'PARRY!','#ffe27a'); spark(d,true);
    const sk=1+(PK().staggerK||0); if(PK().counter) pl.counter=300; spirit();
    if(boss){ d.state='stunned'; d.timer=Math.round(84*sk); d.walking=false; d.ring=0; d.mark=false; pop(d.x,ENGINE.level.ground(d.x,d.z)+(d.alt||0)+2.8,d.z,'It reels — strike!','#ffd84a'); }
    else { d.lunge=0; d.stag=Math.round(72*sk); d.lungeCd=80; d.kdx=-(p.x-d.x)*0.05; d.kdz=-(p.z-d.z)*0.05; d.knock=6; }
    if(!pl._parried){ pl._parried=true; UI.toast('🛡 Parried! It’s open — your blows bite half again as hard while it reels.',2400); } }
  // a demon's blow arriving: parried, broken through the guard (the brute), guarded, or taken
  function strikeKnight(d,dx,dz,dist,mult,dun,heavy){ if(pl.iframes>0) return false; if(parryNow()){ parry(d,false); return 'parry'; }
    if(heavy&&pl.blocking){ pl.guardBreak=70; pl.blocking=false; const p=P(); pop(p.x,ENGINE.level.ground(p.x,p.z)+2.0,p.z,'Guard broken!','#ff9a6a'); SFX.play('bossStrike'); shake=Math.max(shake,0.3); mult*=0.6; }
    if(dun) hurtFromBoss((8+d.level*0.7)*mult); else worldContact(d,dx,dz,dist,mult); return true; }
  // ── a demon that has seen you: it closes in, fans out so a pack surrounds you rather than queueing, circles at arm's
  //    length, then winds up (the red flash — your cue to guard, parry or roll) and strikes in its own way; a blow during
  //    the wind-up breaks it (not the brute's, unless the blow is heavy), and after it strikes it is open for a beat ──
  function press(d,dx,dz,dist,aggro,speed,dun){ if(dist>aggro) { d.lunge=0; return false; } const c=A(), p=P(), ux=dx/dist, uz=dz/dist, sty=styleOf(d);
    if(d.lungeCd>0) d.lungeCd--;
    if(d.lunge===1){ d.lt--; d.face=Math.atan2(dx,dz); d.lax=ux; d.laz=uz; if(d.lt<=0){ d.lunge=2; d.lt=sty==='claw'?18:sty==='brute'?6:sty==='spit'?1:11; d.hit=0; } return true; }   // the wind-up
    if(d.lunge===2){ d.lt--;
      if(sty==='pounce'){ const sp=2.5*PX, nx=d.x+d.lax*sp, nz=d.z+d.laz*sp; if(walk(nx,d.z)) d.x=nx; if(walk(d.x,nz)) d.z=nz;             // the spring
        if(dist<0.75&&pl.iframes<=0){ const r=strikeKnight(d,dx,dz,dist,1,dun); d.lunge=3; d.lt=r==='parry'?0:26; if(r==='parry') d.lunge=0; } }
      else if(sty==='claw'){ const sp=(d.lt%9>5?1.1:0.2)*PX; if(walk(d.x+d.lax*sp,d.z)) d.x+=d.lax*sp; if(walk(d.x,d.z+d.laz*sp)) d.z+=d.laz*sp;   // two rakes, a step into each
        if((d.lt===13||d.lt===4)){ SFX.play('swing','light'); const inFront=(dx*d.lax+dz*d.laz)/dist>0.3; if(dist<1.25&&inFront&&strikeKnight(d,dx,dz,dist,0.7,dun)==='parry') return true; } }
      else if(sty==='brute'){ if(d.lt===2){ SFX.play('bossStrike'); shake=Math.max(shake,0.28); dust(d.x+d.lax*0.8,d.z+d.laz*0.8); const hx=d.x+d.lax*0.9-p.x, hz=d.z+d.laz*0.9-p.z;
          if(Math.hypot(hx,hz)<1.35&&strikeKnight(d,dx,dz,dist,1.8,dun,true)==='parry'){ d.stag=110; return true; } } }
      else if(sty==='spit'){ const sp=2.3*PX, m=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),glow(0x9aff4a)); c.fx.add(m); SFX.play('cast');
        c.shots.push({x:d.x+ux*0.4,z:d.z+uz*0.4,vx:ux*sp,vz:uz*sp,life:110,m,dmg:(dun?6:3)+d.level*0.7,from:d,spit:true}); d.lt=0; }
      if(d.lt<=0){ d.lunge=3; d.lt=sty==='brute'?46:sty==='claw'?22:sty==='spit'?30:24; } return true; }
    if(d.lunge===3){ d.lt--; if(d.lt<=0){ d.lunge=0; d.lungeCd=(sty==='spit'?50:60)+(Math.random()*50|0); } return true; }   // open, catching its breath
    // close in, each to its own side of you (the spitter hangs back at a throw's length)
    const slot=(c.foes.indexOf(d)%5-2)*0.55, want=sty==='spit'?4:1.5, ang=Math.atan2(-dz,-dx)+slot*(dist<3?1:0.3), tx=p.x+Math.cos(ang)*want, tz=p.z+Math.sin(ang)*want;
    let mx=tx-d.x, mz=tz-d.z; const m=Math.hypot(mx,mz)||1, sp=Math.min(m,speed*PX*(dist>3?1.15:0.8)*(sty==='brute'?0.75:1)); mx=mx/m*sp; mz=mz/m*sp;
    if(dist<2.2){ const o=d.t*0.02*(c.foes.indexOf(d)%2?1:-1); mx+=-uz*0.35*PX*Math.sin(o+1); mz+=ux*0.35*PX*Math.sin(o+1); }                  // circling
    if(walk(d.x+mx,d.z)) d.x+=mx; if(walk(d.x,d.z+mz)) d.z+=mz; d.face=Math.atan2(dx,dz);
    const reach=sty==='spit'?(dist>2.2&&dist<6.5):sty==='brute'?dist<2.0:dist<2.4;
    if(reach&&!(d.lungeCd>0)&&Math.random()<(sty==='spit'?0.03:0.04)){ const W0=ST[sty]||ST.pounce; d.lunge=1; d.lt=dun?W0.windD:W0.wind; d.lt0=d.lt; SFX.play('demonGrowl',d.level+(sty==='brute'?8:0),sty);
      if(!parryTip&&typeof UI!=='undefined'){ parryTip=true; UI.toast('🛡 It flashes red before it strikes — guard just as the blow lands to PARRY, or roll clear.',2600); } }
    if(dist<0.62&&pl.iframes<=0&&d.lunge!==3) strikeKnight(d,dx,dz,dist,dun?0.85:1,dun);
    return true; }
  // ── bodies are solid: you can't walk through a foe, and foes don't stack in one another ──
  const rad=d=>(d.boss?0.85:0.42)*Math.max(0.55,VIEWMODE.ps(ENGINE.level));
  function solid(tx,tz){ const c=A(), p=P(); if(!c||pl.dashing>0) return false; return c.foes.some(d=>{ if(!d.alive||d.ghost) return false; const r=rad(d)+0.2, dn=Math.hypot(d.x-tx,d.z-tz); return dn<r&&dn<Math.hypot(d.x-p.x,d.z-p.z)-1e-4; }); }
  function separate(){ const c=A(), p=P(); const near=c.foes.filter(d=>d.alive&&!d.ghost&&Math.abs(d.x-p.x)<10&&Math.abs(d.z-p.z)<10);
    near.forEach(d=>{ const r=rad(d)+0.2, vx=d.x-p.x, vz=d.z-p.z, dn=Math.hypot(vx,vz)||1e-3; if(dn<r&&!d.boss){ const k=(r-dn), nx=d.x+vx/dn*k, nz=d.z+vz/dn*k; if(walk(nx,d.z)) d.x=nx; if(walk(d.x,nz)) d.z=nz; } });
    for(let i=0;i<near.length;i++) for(let j=i+1;j<near.length;j++){ const a=near[i], b=near[j]; if(a.boss||b.boss) continue; const vx=b.x-a.x, vz=b.z-a.z, dn=Math.hypot(vx,vz)||1e-3, r=rad(a)+rad(b)*0.8;
      if(dn<r){ const k=(r-dn)/2, ux=vx/dn*k, uz=vz/dn*k; if(walk(a.x-ux,a.z-uz)){ a.x-=ux; a.z-=uz; } if(walk(b.x+ux,b.z+uz)){ b.x+=ux; b.z+=uz; } } } }
  // ── lock-on: tap the look stick (or F) — the nearest foe in front; again to let go; it moves on when that one falls ──
  function pickLock(exclude){ const c=A(), p=P(); if(!c) return null; const fw={x:-Math.sin(ENGINE.yaw),z:-Math.cos(ENGINE.yaw)}; let best=null, bs=1e9;
    c.foes.forEach(d=>{ if(!d.alive||d===exclude||d.ghost) return; const vx=d.x-p.x, vz=d.z-p.z, dist=Math.hypot(vx,vz); if(dist>12) return; const dot=(vx*fw.x+vz*fw.z)/(dist||1); const sc=dist*(2-dot)*(d.boss?0.6:1); if(sc<bs){ bs=sc; best=d; } });
    return best; }
  function toggleLock(){ const c=A(); if(!c){ return; } if(lock){ lock=null; UI.toast('🎯 Lock released',700); return; } lock=pickLock(); UI.toast(lock?'🎯 Locked on — tap again to release':'Nothing near enough to lock on to',900); }
  // a flick of the mouse while locked on: the next foe that way (sign +1 = to your right on screen)
  function switchLock(sign){ const c=A(), p=P(); if(!c||!lock) return; const base=Math.atan2(lock.x-p.x,lock.z-p.z); let best=null, bs=9;
    c.foes.forEach(d=>{ if(!d.alive||d===lock||d.ghost) return; const dist=Math.hypot(d.x-p.x,d.z-p.z); if(dist>12) return; let a=Math.atan2(d.x-p.x,d.z-p.z)-base; a=Math.atan2(Math.sin(a),Math.cos(a));
      if(Math.sign(-a)!==sign) return; const sc=Math.abs(a)+dist*0.05; if(sc<bs){ bs=sc; best=d; } });
    if(best){ lock=best; UI.toast('🎯 Next foe',500); } }
  // locked on, Ocarina-style: black bars slide in at the top and bottom of the screen
  let lbT=null, lbB=null; function letterbox(on){ if(!lbT){ const mk=top=>{ const d=document.createElement('div'); d.style.cssText=`position:fixed;left:0;right:0;${top?'top':'bottom'}:0;height:7vh;background:#000;pointer-events:none;z-index:1;transform:translateY(${top?'-':''}100%);transition:transform .22s ease`; document.body.appendChild(d); return d; }; lbT=mk(true); lbB=mk(false); }
    const v=on?'translateY(0)':null; lbT.style.transform=v||'translateY(-100%)'; lbB.style.transform=v||'translateY(100%)'; }
  let reticle=null;
  function drawLock(lv){ if(!reticle){ reticle=new THREE.Group(); const r=new THREE.Mesh(new THREE.RingGeometry(0.5,0.6,24),new THREE.MeshBasicMaterial({color:0xffd84a,transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false})); r.rotation.x=-Math.PI/2; reticle.add(r);
      const dm=new THREE.Mesh(new THREE.OctahedronGeometry(0.12),new THREE.MeshBasicMaterial({color:0xffd84a})); dm.scale.y=1.6; reticle.add(dm); reticle.dm=dm; reticle.ring=r; }
    if(lock&&(!lock.alive||Math.hypot(lock.x-P().x,lock.z-P().z)>15)){ const was=lock; lock=lock.alive?null:pickLock(was); }
    if(reticle.parent!==lv.scene){ if(reticle.parent) reticle.parent.remove(reticle); lv.scene.add(reticle); }
    reticle.visible=!!lock; if(!lock) return; const ps=VIEWMODE.ps(lv), s=lock.boss?1.7:1, gy=lv.ground(lock.x,lock.z), t=now()/1000;
    { const warn=lock.lunge===1||(lock.boss&&lock.state==='telegraph'); reticle.ring.material.color.setHex(warn?0xff4a3a:0xffd84a); reticle.dm.material.color.setHex(warn?0xff4a3a:0xffd84a); }   /* red when it's about to strike */
    reticle.position.set(lock.x,gy+0.04,lock.z); reticle.ring.scale.setScalar(s*Math.max(0.6,ps)*(1+Math.sin(t*6)*0.05)); reticle.dm.position.y=(lock.boss?3.0:1.9)*Math.max(0.55,ps)+Math.sin(t*4)*0.08; reticle.dm.rotation.y=t*2; }
  // the guardian: telegraph, then the move; idle drifts home; braced while it winds up
  // ── V113: the guardians take to the air. FLIERS (the Imp, the Specter, the Char Demon, the Void Champion) SOAR: rise out of
  //  reach, circle over you raining fire on marked spots, swoop low now and then (a jump-strike can reach it), then fix a red
  //  ring on you and DIVE — the landing throws a shockwave you jump, and leaves it stunned and open (+50%). The heavy ones LEAP:
  //  a great bound to where you stood, the same ring and wave on landing, a shorter stun. Every shockwave can be jumped.
  function ringHit(d,dmg){ const p=P(); if(airH()>0.26){ if(!d.ringJumped){ d.ringJumped=true; pop(p.x,ENGINE.level.ground(p.x,p.z)+2.1,p.z,'Jumped!','#8ae0ff'); } return; } hurtFromBoss(dmg); }
  function land(d,x,z,en,stun){ const c=A(), p=P(); d.x=x; d.z=z; d.alt=0; d.mark=false; d.anchorx=x; d.anchorz=z; d.ring=1; d.ringR=0; d.ringJumped=false; d.wave=false; d.move=Object.assign({},d.move,{ringSpeed:4.6,ringMax:120});
    shake=Math.max(shake,0.6); dust(x,z); if(Math.hypot(p.x-x,p.z-z)<1.3) hurtFromBoss((8+d.level*1.2)*en); d.state='stunned'; d.timer=stun;
    pop(x,ENGINE.level.ground(x,z)+2.6,z,'Stunned!','#ffd84a'); }
  function drop(d,tx,tz){ const c=A(); c.drops=c.drops||[]; const m=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),glow(d.tint||0xff7a3a)); c.fx.add(m);
    const mk=new THREE.Mesh(new THREE.RingGeometry(0.55,0.75,24),new THREE.MeshBasicMaterial({color:0xff5a3a,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false})); mk.rotation.x=-Math.PI/2; c.fx.add(mk);
    c.drops.push({x0:d.x,z0:d.z,y0:(d.alt||0)+1.6,tx,tz,t:0,T:44,m,mk,dmg:4+d.level*0.8}); }
  function stepDrops(){ const c=A(); if(!c||!c.drops) return; const p=P(), lv=ENGINE.level;
    c.drops=c.drops.filter(o=>{ o.t++; const k=o.t/o.T, gy=lv.ground(o.tx,o.tz); o.m.position.set(o.x0+(o.tx-o.x0)*k,gy+o.y0*(1-k)+Math.sin(k*Math.PI)*0.8,o.z0+(o.tz-o.z0)*k); o.mk.position.set(o.tx,gy+0.05,o.tz); o.mk.scale.setScalar(1.2-k*0.5); o.mk.material.opacity=0.35+k*0.5;
      if(o.t>=o.T){ c.fx.remove(o.m); c.fx.remove(o.mk); dust(o.tx,o.tz); if(Math.hypot(p.x-o.tx,p.z-o.tz)<0.8) hurtFromBoss(o.dmg); return false; } return true; }); }
  // V177: what the remastered fights may do with the knight and the hall
  const PFK={pl,pop:(x,y,z,t,c)=>pop(x,y,z,t,c),hit:(d,dmg,crit)=>{ const p=P(); hitFoe(d,dmg,crit,d.x-p.x,d.z-p.z,Math.hypot(d.x-p.x,d.z-p.z)||1,4); },hud:()=>hud(),shake:v=>{ shake=Math.max(shake,v); },parryBoss:d=>{ d.state='stunned'; d.timer=70; d.walking=false; d.ring=0; d.mark=false; }};
  const BFK={perk:()=>PK(),spirit:()=>spirit(),A:()=>A(),P:()=>P(),pl,PX,pop:(x,y,z,t,c)=>pop(x,y,z,t,c),hurt:dm=>hurtFromBoss(dm),parryNow:()=>parryNow(),parry:d=>parry(d,true),shake:v=>{ shake=Math.max(shake,v); },dust:(x,z)=>dust(x,z),walk:(x,z)=>walk(x,z),ringHit:(d,dm)=>ringHit(d,dm),airH:()=>airH(),face:()=>P().face,add:o=>add(o),
    knock:(vx,vz)=>{ const p=P(), L0=ENGINE.level; for(let i=0;i<6;i++){ const nx=p.x+vx*0.25, nz=p.z+vz*0.25; if(L0.canMove(p.x,p.z,nx,p.z)) p.x=nx; if(L0.canMove(p.x,p.z,p.x,nz)) p.z=nz; } }};
  function bossAir(d,dx,dz,dist,T,en,done){ const c=A(), p=P(), cfg=c.cfg, W=cfg.W||20, H=cfg.H||20, cl=(v,M)=>Math.max(1.5,Math.min(M-1.5,v));
    const ringStep=()=>{ if(!d.ring) return; d.ringR+=(d.move&&d.move.ringSpeed||4.6)*PX; const rd=Math.hypot(p.x-d.anchorx,p.z-d.anchorz); if(Math.abs(rd-d.ringR)<0.5) ringHit(d,(5+d.level)*en); if(d.ringR>(d.move&&d.move.ringMax||120)*PX) d.ring=0; };
    if(d.state==='rise'){ d.timer--; d.alt=(d.alt||0)+(4.2-(d.alt||0))*0.06; if(d.timer<=0){ d.state='hover'; d.timer=d.enraged?240:300; d.dropT=30; } return true; }
    if(d.state==='hover'){ d.timer--; const ph=d.timer%120, swoop=ph<38; d.orb=(d.orb||0)+(swoop?0.022:0.012); const r=swoop?1.7:3.4, tx=cl(p.x+Math.cos(d.orb)*r,W), tz=cl(p.z+Math.sin(d.orb)*r,H);
      d.x+=(tx-d.x)*0.035; d.z+=(tz-d.z)*0.035; d.alt+=((swoop?2.2:4.2)-d.alt)*0.05; d.walking=true;
      if(--d.dropT<=0&&!swoop){ d.dropT=d.enraged?24:34; drop(d,cl(p.x+(Math.random()-0.5)*0.8,W),cl(p.z+(Math.random()-0.5)*0.8,H)); if(d.enraged) drop(d,cl(p.x+(Math.random()-0.5)*3,W),cl(p.z+(Math.random()-0.5)*3,H)); }
      if(d.timer<=0){ d.state='aim'; d.timer=58; d.mark=true; d.mx=p.x; d.mz=p.z; } return true; }
    if(d.state==='aim'){ d.timer--; if(d.timer>22){ d.mx+=(p.x-d.mx)*0.12; d.mz+=(p.z-d.mz)*0.12; } d.alt+=(4.6-d.alt)*0.05; d.x+=(d.mx-d.x)*0.02; d.z+=(d.mz-d.z)*0.02;
      if(d.timer<=0){ d.state='dive'; d.timer=16; d.jx0=d.x; d.jz0=d.z; d.a0=d.alt; } return true; }
    if(d.state==='dive'){ d.timer--; const k=1-d.timer/16; d.x=d.jx0+(d.mx-d.jx0)*k; d.z=d.jz0+(d.mz-d.jz0)*k; d.alt=d.a0*(1-k*k); if(d.timer<=0) land(d,d.mx,d.mz,en,d.enraged?90:130); return true; }
    if(d.state==='jump'){ d.timer--; const k=1-d.timer/46; if(k<0.5){ d.mx+=(p.x-d.mx)*0.04; d.mz+=(p.z-d.mz)*0.04; } d.x=d.jx0+(d.mx-d.jx0)*k; d.z=d.jz0+(d.mz-d.jz0)*k; d.alt=Math.sin(k*Math.PI)*5.0; if(d.timer<=0) land(d,d.mx,d.mz,en,d.enraged?55:80); return true; }
    if(d.state==='stunned'){ d.timer--; d.walking=false; ringStep(); if(d.timer<=0){ d.state='idle'; d.timer=34; d.ring=0; done(); } return true; }
    if(d.alt>0.01&&d.state!=='rise') d.alt=Math.max(0,d.alt-0.15); return false; }
  function bossStep(d,dx,dz,dist,T){ const c=A(), p=P(), cfg=c.cfg, en=d.enraged?T.enrageDmg:1;
    if(typeof BOSSFIGHT!=='undefined'&&BOSSFIGHT.has(d.bossForm)&&BOSSFIGHT.step(d,dx,dz,dist,T,BFK)) return;   /* V177: the remastered guardians fight their own way (bossfight.js) */
    const done=()=>{ if(cfg.moveDone) cfg.moveDone(d); };
    if(bossAir(d,dx,dz,dist,T,en,done)){ d.face=Math.atan2(dx,dz); return; }
    if(d.state==='idle'){ d.timer--; if(cfg.wide&&!cfg.bossIdle&&dist>4.5&&d.anchorx!==undefined){ const nx=d.anchorx+dx/dist*0.035, nz=d.anchorz+dz/dist*0.035; if(walk(nx,nz)){ d.anchorx=nx; d.anchorz=nz; } }   /* in the widened sanctum it stalks you across the hall rather than holding the middle */
      const k=cfg.bossIdle?cfg.bossIdle(d):0.02; d.x+=(d.anchorx-d.x)*k; d.z+=(d.anchorz-d.z)*k;
      if(d.timer<=0){ const mv=d.pat.moves[d.moveIdx%d.pat.moves.length]; d.moveIdx++; const rage=d.hp<d.maxHp*0.5?0.7:1; d.move=mv; d.kind=mv.kind; d.state='telegraph'; SFX.play('bossTelegraph'); d.telegraph=Math.round(mv.telegraph*rage); d.telMax=d.telegraph; } }
    else if(d.state==='telegraph'){ d.telegraph--; if(d.kind==='charge'){ d.aimx=dx/dist; d.aimz=dz/dist; }
      if(d.telegraph<=0){ const mv=d.move;
        if(dist<T.novaRange){ const burst=(c._novaN=(c._novaN||0)+1); for(let i=0;i<T.novaShots;i++){ const a=i/T.novaShots*Math.PI*2+d.moveIdx*0.4; shot(d.x,d.z,Math.cos(a)*T.novaSpeed,Math.sin(a)*T.novaSpeed,T.novaLife,true,burst); } }
        if(mv.kind==='volley'){ const b=Math.atan2(dz,dx); for(let i=0;i<mv.count;i++){ const a=b+(i-(mv.count-1)/2)*0.18; shot(d.x,d.z,Math.cos(a)*mv.speed*PX,Math.sin(a)*mv.speed*PX,150); } d.state='idle'; d.timer=44; done(); }
        else if(mv.kind==='spread'){ for(let i=0;i<mv.count;i++){ const a=i/mv.count*Math.PI*2; shot(d.x,d.z,Math.cos(a)*mv.speed*PX,Math.sin(a)*mv.speed*PX,150); } d.state='idle'; d.timer=48; done(); }
        else if(mv.kind==='charge'){ d.state='charge'; d.timer=26; d.chx=d.aimx*mv.speed*PX; d.chz=d.aimz*mv.speed*PX; }
        else if(mv.kind==='slam'||mv.kind==='wave'){ d.state='slam'; d.wave=mv.kind==='wave'; d.timer=mv.kind==='wave'?20:16; d.ring=0; d.anchorx=d.x; d.anchorz=d.z; }
        else if(mv.kind==='soar'){ d.state='rise'; d.timer=50; d.orb=Math.atan2(d.z-p.z,d.x-p.x); UI.toast('⚠ '+(d.name||'It')+' takes to the air — look up!',1400); }
        else if(mv.kind==='leap'){ d.state='jump'; d.timer=46; d.jx0=d.x; d.jz0=d.z; d.mx=p.x; d.mz=p.z; d.mark=true; }
        else if(mv.kind==='summon'){ for(let i=0;i<2;i++){ const ax=Math.max(1.5,Math.min(cfg.W-1.5,d.x+(i?2:-2))); add({x:ax,z:d.z,hp:8+d.level,level:Math.max(1,d.level-4),speed:1.3*PX}); } d.state='idle'; d.timer=58; }
        else { d.state='idle'; d.timer=50; } } }
    else if(d.state==='charge'){ const cm=cfg.chargeMult?cfg.chargeMult(d):1; d.x+=d.chx*cm; d.z+=d.chz*cm; d.timer--;
      if(d.x<1.5){ d.x=1.5; d.chx*=-1; } if(d.x>cfg.W-1.5){ d.x=cfg.W-1.5; d.chx*=-1; } if(d.z<1.5){ d.z=1.5; d.chz*=-1; } if(d.z>cfg.H-1.5){ d.z=cfg.H-1.5; d.chz*=-1; }
      if(Math.hypot(p.x-d.x,p.z-d.z)<0.8){ if(pl.iframes<=0&&parryNow()){ parry(d,true); return; } hurtFromBoss((7+d.level*1.1)*en); } if(d.timer<=0){ d.state='idle'; d.timer=40; done(); } }
    else if(d.state==='slam'){ d.timer--; if(d.timer<=0&&d.ring===0){ d.ring=1; d.ringR=0; d.ringJumped=false; }
      if(d.ring){ d.ringR+=(d.move.ringSpeed||4)*PX; const rd=Math.hypot(p.x-d.x,p.z-d.z); if(Math.abs(rd-d.ringR)<0.5&&!(d.wave&&cfg.ringSafe&&cfg.ringSafe())) ringHit(d,(5+d.level)*(d.wave?1.6:1)*en); if(cfg.ringTick) cfg.ringTick(d);
        if(d.ringR>(d.move.ringMax||120)*PX){ d.ring=0; d.wave=false; d.state='idle'; d.timer=42; done(); } } }
    const cr=d.state==='telegraph'?T.hotRadius:0.7; if(dist<cr&&(d.alt||0)<0.8){ if(pl.iframes<=0&&parryNow()&&d.state!=='slam'){ parry(d,true); d.face=Math.atan2(dx,dz); return; } hurtFromBoss((5+d.level*0.85)*en); }
    d.face=Math.atan2(dx,dz); }
  function shot(x,z,vx,vz,life,nova,burst,dmg,col){ const c=A(), m=new THREE.Mesh(new THREE.SphereGeometry(nova?0.14:0.18,8,6),glow(col||(nova?0xffd0f0:0xff5a6a))); m.position.set(x,1,z); c.fx.add(m); c.shots.push({x,z,vx,vz,life,nova,burst,m,dmg}); }
  function add(o){ const c=A(), a=Object.assign({alive:true,hurt:0,maxHp:o.hp},o); a.g=o.model||demonModel(a.level,1,false); if(!o.model) a.g.scale.multiplyScalar(0.7); a.g.scale.multiplyScalar(VIEWMODE.ps(ENGINE.level)); ENGINE.level.scene.add(a.g); c.adds.push(a); return a; }

  // ── each frame: run the steps, then draw where everything is ──
  function frame(dt,paused){ const c=A(); guardB.hidden=!c; potB.hidden=!c; if(c){ const inv=GAME.S.inventory, n=(inv.potion||0)+(inv.greaterPotion||0)+(inv.elixir||0); const t='🧪'+n; if(potB.textContent!==t) potB.textContent=t; } if(!c){ bossBar.hidden=true; return; }
    shake=Math.max(0,shake-dt*2.2); if(paused) shake=0;
    if(!paused){ if(hitStop>0){ hitStop-=dt; } else { acc=Math.min(acc+dt,0.1); while(acc>=STEP){ acc-=STEP; step(); } } }   // a blow that lands holds the world still for a blink
    chargeTick(dt); letterbox(!!lock&&!!c);
    ENGINE.K.alert=!!(c&&c.foes.some(d=>d.alive&&!d.asleep&&Math.hypot(d.x-ENGINE.P.x,d.z-ENGINE.P.z)<6));   /* foes close: keep the blade out (and draw it) */
    ENGINE.K.guarding=pl.blocking; ENGINE.K.dash=pl.dashing>0?Math.min(1,pl.dashing/4):Math.max(0,(ENGINE.K.dash||0)-0.15); ENGINE.K.air=pl.jumpY||0; ENGINE.K.raise=pl.leap&&pl.leapT<12?1:0; drawLock(ENGINE.level);
    const lv=ENGINE.level, cam=ENGINE.cam, t=now()/1000; let boss=null;
    c.foes.forEach(d=>{ const g=d.g; if(!d.alive&&d.dying<=0){ if(g.parent){ g.parent.remove(g); } return; }
      const gy=lv.ground(d.x,d.z); g.position.set(d.x,gy+(d.boss?(d.alt||0)+(d.alt>0.5?Math.sin(t*3)*0.12:0):Math.abs(Math.sin(t*4+d.t))*0.06+0.05),d.z);
      if(d.face!==undefined){ let r=d.face-g.rotation.y; r=Math.atan2(Math.sin(r),Math.cos(r)); g.rotation.y+=r*Math.min(1,dt*8); }
      const tell=d.lunge===1, late=tell&&d.lt<=6, mats=g.userData.mats||[]; mats.forEach(m=>m.emissive&&m.emissive.setHex(d.flash>0?0xffffff:d.hurt>0?0x884444:late?0xff2a10:tell?(Math.floor(t*14)%2?0xaa1010:0x440808):d.stag>0?(Math.floor(t*10)%2?0x6a5200:0x2a2000):(d.boss&&d.state==='telegraph'?0x441122:d.boss&&d.pose==='wind'?0x1c0a0c:d.boss&&(d.state==='stunned'||d.bfOpen)?(Math.floor(t*8)%2?0x5a4a00:0x1a1400):0)));   /* V146: the last beat of a wind-up burns bright — guard now; a reeling demon glints gold */
      if(d.flash>0&&!paused&&hitStop<=0) d.flash--;
      { const s0=g.userData.s0b||(g.userData.s0b=g.scale.x); if(d.alive&&!d.boss){ d.squash=Math.max(0,(d.squash||0)-dt*6); const sty=styleOf(d), up=tell?1-d.lt/Math.max(1,d.lt0||18):0, sq=d.squash||0, cr=tell&&sty!=='brute'?0.12:0, gr=sty==='brute'?(tell?up*0.18:d.lunge===2?0.1:0):0; g.scale.set(s0*(1+sq*0.25+cr*0.5),s0*(1-sq*0.3-cr+gr),s0*(1+sq*0.25+cr*0.5));
          if(sty==='brute'&&tell) g.rotation.x=-0.5*up; else if(sty==='brute'&&d.lunge===2) g.rotation.x=0.55; else if(sty==='claw'&&tell) g.rotation.x=-0.3*up; else if(sty==='claw'&&d.lunge===2){ g.rotation.x=0.25; g.rotation.z=Math.sin(d.lt*0.7)*0.4; } else if(d.lunge===2) g.rotation.x=0.35; else if(d.stag>0) g.rotation.x=-0.3+Math.sin(t*9)*0.12; else g.rotation.x=d.knock>0?-0.42*(d.knock/8):0;
          if(!(sty==='claw'&&d.lunge===2)&&!d.asleep&&!(d.down>0)&&!d._lay) g.rotation.z=0; if(d.down>0){ g.rotation.z+=(1.35-g.rotation.z)*Math.min(1,dt*10); d._lay=true; } }   /* V146: each kind winds up its own way — the brute heaves up tall, the clawer rears and rakes; knocked down, it lies there */ }   /* a struck foe staggers back */
      if(d.asleep){ g.rotation.z=1.35; g.position.y=gy+0.12+Math.sin(t*1.3+d.t)*0.015; } else if(d._lay&&!(d.down>0)){ g.rotation.z*=0.8; if(Math.abs(g.rotation.z)<0.01){ g.rotation.z=0; d._lay=false; } }
      if(d.asleep) d._lay=true;
      if(g.w1){ g.w1.rotation.y=Math.sin(t*12+d.t)*0.4; g['w-1'].rotation.y=-Math.sin(t*12+d.t)*0.4; }
      if(g.animate) g.animate(dt,d.state==='charge'||d.walking?'walk':'idle',1);
      if(!d.alive){ const k=d.dying/18; g.rotation.y+=dt*14*(1-k); g.scale.setScalar((g.userData.s0b||g.scale.x)*Math.max(0.05,k)); g.position.y-=(1-k)*0.4; }
      d.bar.visible=d.alive&&!d.boss&&d.hp<d.maxHp; if(d.bar.visible){ g.updateMatrixWorld(); d.bar.lookAt(cam.position); d.bar.fg.scale.x=Math.max(0.01,d.hp/d.maxHp); d.bar.fg.position.x=-(1-d.hp/d.maxHp)*0.39; }
      if(d.boss&&d.alive){ boss=d; d.tel.position.set(d.x,gy+0.05,d.z); d.tel.material.opacity=d.state==='telegraph'?0.35+0.45*(1-d.telegraph/Math.max(1,d.telMax)):0; d.tel.scale.setScalar(d.state==='telegraph'?1+(1-d.telegraph/Math.max(1,d.telMax))*0.8:1);
        d.slamM.visible=!!d.ring; if(d.ring){ d.slamM.position.set(d.anchorx,gy+0.08,d.anchorz); d.slamM.scale.setScalar(Math.max(0.05,d.ringR)); d.slamM.material.color.setHex(d.wave?0x6ad8ff:0xffb0c0); }
        if(d.bandM){ const ag=lv.ground(d.anchorx,d.anchorz); d.bandM.visible=!!d.ring; if(d.ring){ d.bandM.position.set(d.anchorx,ag+0.21,d.anchorz); d.bandM.scale.set(Math.max(0.05,d.ringR),1,Math.max(0.05,d.ringR)); d.bandM.material.color.setHex(d.wave?0x6ad8ff:0xffb0c0); d.bandM.material.opacity=0.5*(1-Math.min(1,d.ringR/12)); } }
        if(d.markM){ d.markM.visible=!!d.mark; if(d.mark){ d.markM.position.set(d.mx,lv.ground(d.mx,d.mz)+0.05,d.mz); d.markM.scale.setScalar(1+Math.sin(t*10)*0.08); } }
        if(d.shadowM){ const a=d.alt||0; d.shadowM.visible=a>0.15; if(a>0.15){ d.shadowM.position.set(d.x,gy+0.04,d.z); d.shadowM.scale.setScalar(Math.max(0.5,1.3-a*0.12)); d.shadowM.material.opacity=Math.max(0.15,0.42-a*0.04); } }
        if(g.w1&&d.alt>0.3){ g.w1.rotation.y=Math.sin(t*16)*0.8; g['w-1'].rotation.y=-Math.sin(t*16)*0.8; } }
      else if(d.boss){ d.tel.visible=false; d.slamM.visible=false; if(d.bandM) d.bandM.visible=false; if(d.markM) d.markM.visible=false; if(d.shadowM) d.shadowM.visible=false; } });
    c.adds.forEach(a=>{ a.g.position.set(a.x,lv.ground(a.x,a.z),a.z); if(a.g.animate){ a.g.animate(dt,a.moving||a.walking?'walk':'idle',1); a.g.rotation.y=a.walking?Math.atan2(ENGINE.P.x-a.x,ENGINE.P.z-a.z):ENGINE.P.face; } else a.g.rotation.y=Math.atan2(ENGINE.P.x-a.x,ENGINE.P.z-a.z); });
    c.shots.forEach(s=>s.m.position.set(s.x,lv.ground(s.x,s.z)+0.9,s.z));
    c.arrows.forEach(s=>{ s.m.position.set(s.x,lv.ground(s.x,s.z)+1.0,s.z); s.m.rotation.y=Math.atan2(s.vx,s.vz); });
    c.rings=c.rings.filter(r=>{ r.t+=dt;
      if(r.bit){ const b=r.bit; r.m.position.x+=b.vx*dt; r.m.position.z+=b.vz*dt; r.m.position.y+=b.vy*dt; b.vy-=9*dt; r.m.rotation.x+=dt*8; const life=b.dust?0.55:0.35; r.m.scale.setScalar(Math.max(0.05,1-r.t/life)); if(r.t>=life){ c.fx.remove(r.m); return false; } return true; }
      if(r.slash){ const k=r.t/0.16; r.m.material.opacity=(r.m.userData.op||0.75)*(1-k); if(k>=1){ c.fx.remove(r.m); return false; } return true; }
      const k=r.t/0.35; r.m.scale.setScalar(1+k*r.max*2.2); r.m.material.opacity=0.85*(1-k); if(k>=1){ c.fx.remove(r.m); return false; } return true; });
    bossBar.hidden=!boss; if(boss){ $('bbName').textContent=boss.name||'Guardian'; $('bbFill').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%'; }
    // the knight flickers while he cannot be hit
    ENGINE.K.visible=!(pl.iframes>0&&pl.iframes%8<3&&!pl.blocking);
    drawPops(dt); }
  function reset(){ pl.buf=0; pl.lungeT=0; lock=null; charge.on=false; charge.ready=false; if(charge.ring) charge.ring.visible=false; if(typeof letterbox==='function') letterbox(false); ENGINE.K.charge=0; ENGINE.K.spinT=-1; hitStop=0; shake=0; pl.leap=0; pl.jumpY=0; if(reticle) reticle.visible=false; meter(null); tintV.style.opacity=0; pl.iframes=0; pl.swing=0; pl.combo=0; pl.comboT=0; pl.blocking=false; pl.bDown=false; pl.dashing=0; later.length=0; ENGINE.K.visible=true; bossBar.hidden=true; guardB.hidden=true; potB.hidden=true; }
  // how fast you can walk just now: a swing roots you (you can still turn and edge), a guard or a charging blade slows you
  function moveMul(){ return pl.swing>0?(pl.swing>pl.swingDur*0.35?0.25:0.6):pl.blocking?0.6:charge.on&&charge.k>0?0.55:1; }
  return { moveMul, nightify, chargeStart, chargeRelease, get charging(){ return charge.on&&charge.k>0; }, arena, foe, add, shot, clear, meter, tint(col,o){ tintV.style.boxShadow=`inset 0 0 120px 40px ${col}`; tintV.style.opacity=o; }, hurtFromBoss:(d,p)=>hurtFromBoss(d,p), hitBy:(d,dmg,fx,fz)=>hitBy(d,dmg,fx,fz), hurtRaw:(inc,ifr)=>{ if(pl.iframes>0) return; pl.iframes=ifr; takeHit(inc); }, blocking:()=>pl.blocking, attack, bDown, bUp, dodge, frame, reset, pl, PX, solid, toggleLock, switchLock, lockTarget:()=>lock&&lock.alive?lock:null, landed, get shakeAmt(){ return shake; }, demonModel, knightModel, pop, takeHit, get later(){ return later; }, mirrorBurst(tl){
    if(pl.iframes>0) return; let inc=Math.max(1,Math.round((8+tl*0.5)-S().def*0.4)); if(pl.blocking) inc=Math.max(1,Math.ceil(inc*0.4)); pl.iframes=18; takeHit(inc); } };
})();
