// ════════════════════════════════════════════════════════════════
//  GUARDIANS — what makes each sanctum its own fight, from the game's own ticks:
//   0 Hearthvale  the Shadow Imp roams the lamps and, past half health, goes to snuff one (3 blows drive it off)
//   1 Ironhold    the Iron Wraith is only solid while it acts; strike it standing and the blade passes through
//   2 Saltmere    the Tide Specter sinks the counting-stones as it loses; its wave breaks only on a stone
//   3 Thornwood   the Root Fiend puts up roots behind you, and every living root knits it back together
//   4 Dusthaven   the grain burns — under its bolts and its slam — until only the altar stands
//   5 Crystalpeak the cold climbs while you work, slows you, then takes your hands; the fires give it back
//   6 Ashfield    every swing marks the ground under you, and it burns a moment later
//   7 Stormgate   it strikes at Ruth's people; stand over one to take the bolt, and only then will your blade bite
//   8 Shadowmere  it wears your shape and fills the hall with reflections that copy you
//   9 Hellgate    hope drains while you hold on; striking gives it back; the voids offer rest and mend the Champion
//  GUARDIANS[town](X) → { cfg:{combat hooks}, tick(), always(), onEnter(), onBossDead(d), speedMult() }
//  X is the sanctum: { lv, room, an, scene, hemi, lamp, f, W, H, R(), td, C, tl, at, setT, ok, boss() }
//  Scoped to the sanctum. (In the 2D game several of these ticks run on every floor of their chapel — see README.)
// ════════════════════════════════════════════════════════════════
const GUARDIANS=(function(){
  const P=()=>ENGINE.P, S=()=>GAME.S, PX=1/16, now=()=>performance.now();
  const ptile=()=>[Math.floor(P().x),Math.floor(P().z)];
  const say=(()=>{ const last={}; return (k,msg,ms,gap)=>{ if(gap&&last[k]&&now()-last[k]<gap) return; last[k]=now(); UI.toast(msg,ms||1600); }; })();
  const disc=(par,r,col,op,y)=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(r,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.y=y||0.03; par.add(m); return m; };
  const G={};

  // ── 0 · Hearthvale: the lamps ──
  G[0]=X=>{ const ROAM_MS=4200, AFTER=0.5, EVERY=12000, CHANNEL=2600, INTERRUPT=3, MIN=2;
    const pages=(X.f.extra._pages||[]).map(p=>{ const g=group(p.x+0.5,0,p.y+0.5,X.room); Cy(0.12,0.16,0.9,6,0x5a3a22,0,0,0,g); const b=B(0.5,0.04,0.36,0xf4eee0,0,0.92,0,g); b.rotation.x=0.4;
      const fl=flame(0.22,0.98,0,g,X.an,1.4), L=new THREE.PointLight(0xffc870,1.6,7.5,1.3); L.position.set(0,1.5,0); g.add(L); const pg=new THREE.Mesh(new THREE.PlaneGeometry(0.44,0.3),glow(0xfff2c8)); pg.rotation.x=-Math.PI/2+0.4; pg.position.y=0.95; g.add(pg); return {x:p.x,y:p.y,lit:true,threat:false,L,fl}; });
    let snuff=null, bright=false;
    const dark=on=>{ X.hemi.intensity=on?0.2:0.78; X.scene.fog.near=on?6:12; X.scene.fog.far=on?15:26; X.lamp.distance=on?4:11; X.lamp.intensity=on?0.9:1.2; };
    function snuffAt(p){ if(!p||!p.lit) return; p.lit=false; p.threat=false; X.setT(p.x,p.y,50); const left=pages.filter(q=>q.lit).length;
      UI.toast(left<=MIN?'🕯 The last lamps gutter. Only what is open can still be read.':'🕯 A page goes dark.',1500); }
    X.an.push(t=>pages.forEach(p=>{ p.fl.visible=p.lit; p.L.intensity=!p.lit?0:p.threat?0.8+0.8*Math.abs(Math.sin(t*17)):1.6+Math.sin(t*4.7+p.x)*0.08; }));
    return {
      onEnter(){ pages.forEach(p=>{ p.lit=true; p.threat=false; }); snuff=null; dark(true); },
      onBossDead(){ pages.forEach(p=>{ p.lit=true; p.threat=false; X.setT(p.x,p.y,49); }); dark(false); UI.toast('🕯 Every page takes light again. The hall is bright.',2400); },
      cfg:{ bossIdle:d=>{ const lit=pages.filter(p=>p.lit); if(lit.length&&!(d._roamAt&&now()-d._roamAt<ROAM_MS)){ d._roamAt=now(); const o=lit.filter(p=>p!==d._roamPage), pick=(o.length?o:lit)[Math.random()*(o.length||lit.length)|0]; d._roamPage=pick;
          const sp=[[pick.x,pick.y+1],[pick.x,pick.y-1],[pick.x+1,pick.y],[pick.x-1,pick.y]].filter(([x,y])=>X.ok(x,y)), [sx,sy]=sp.length?sp[Math.random()*sp.length|0]:[pick.x,pick.y+1]; d.anchorx=sx+0.5; d.anchorz=sy+0.5; } return 0.055; },
        onHit:d=>{ if(d.boss&&snuff&&snuff.phase==='channel') snuff.hits++; } },
      tick(){ const b=X.boss(); if(!b){ snuff=null; return; } const t=now(); const s=snuff||(snuff={phase:'wait',at:t,hits:0,page:null});
        b._hold=s.phase==='moving'||s.phase==='channel';   /* V177: its errand at a lamp comes before its fight with you */
        if(b.hp>b.maxHp*AFTER){ s.phase='wait'; s.at=t; s.page=null; return; }
        if(s.phase==='wait'){ if(t-s.at<EVERY) return; const lit=pages.filter(p=>p.lit); if(lit.length<=MIN) return;
          let pick=null, best=-1; lit.forEach(p=>{ const d=Math.hypot(p.x+0.5-P().x,p.y+0.5-P().z); if(d>best){ best=d; pick=p; } });
          s.phase='moving'; s.page=pick; s.hits=0; s.at=t; pick.threat=true; b._roamAt=t; b._roamPage=pick;
          const sp=[[pick.x,pick.y+1],[pick.x,pick.y-1],[pick.x+1,pick.y],[pick.x-1,pick.y]].filter(([x,y])=>X.ok(x,y)), [ax,ay]=sp.length?sp[0]:[pick.x,pick.y+1]; b.anchorx=ax+0.5; b.anchorz=ay+0.5;
          UI.toast('🕯 It moves for a lamp. Reach it and drive it off.',1600); return; }
        if(s.phase==='moving'){ if(Math.hypot(b.x-(s.page.x+0.5),b.z-(s.page.y+0.5))<1.6){ s.phase='channel'; s.at=t; s.hits=0; } else if(t-s.at>6000){ s.phase='wait'; s.at=t; s.page.threat=false; s.page=null; } return; }
        if(s.phase==='channel'){ if(!s.page||!s.page.lit){ s.phase='wait'; s.at=t; s.page=null; return; }
          if(s.hits>=INTERRUPT){ s.page.threat=false; UI.toast('✋ It flinches and breaks off. The page still burns.',1700); s.phase='wait'; s.at=t; s.page=null; b._roamAt=0; return; }
          if(t-s.at>=CHANNEL){ const pg=s.page; s.phase='wait'; s.at=t; s.page=null; snuffAt(pg); } } } }; };

  // ── 1 · Ironhold: solid only while it acts ──
  G[1]=X=>{ (X.f.extra._stands||[]).forEach(s=>{ const g=group(s.x+0.5,0,s.y+0.5,X.room); Cy(0.05,0.05,1.2,6,0x4a3a2a,0,0,0,g); Cy(0.22,0.27,0.62,7,0xa8acb6,0,0.72,0,g); Cy(0.17,0.16,0.3,8,0xa8acb6,0,1.34,0,g); B(0.22,0.04,0.04,0x1a2030,0,1.46,0.15,g); Cy(0.28,0.28,0.06,8,0x4a3a2a,0,0,0,g); shade(g); });
    const solid=d=>!d||d.state==='telegraph'||d.state==='charge'||d.state==='slam'||d.state==='stunned'||d.bfActing||(d._solidT||0)>0;   /* V177: solid while it fights its combos, and while it reels */ let addT=0;
    return {
      onEnter(){ addT=0; },
      cfg:{ moveDone:d=>{ d._solidT=46; d._ironIdle=true; },
        bossIdle:d=>{ if(d._ironIdle){ d.timer=Math.max(d.timer,280); d._ironIdle=false; } if(d._patience>0){ d.timer+=d._patience; d._patience=0; } return 0.02; },
        onHit:d=>{ if(d.boss&&!solid(d)){ d._patience=Math.min(240,(d._patience||0)+14); say('iron','🗡 Your blade passes through it. It only stands, and waits.',1600,2500); return false; } },
        frozenAdds:()=>solid(X.boss()) },
      tick(){ const d=X.boss(); if(!d) return; if(d._solidT>0) d._solidT--; const so=solid(d);
        if(!d._fading) (d.g.userData.mats||[]).forEach(m=>{ m.transparent=true; m.opacity=so?1:0.32; });
        if(so) return; if(--addT>0) return; addT=110; if(X.lv.combat.adds.filter(a=>a.alive).length>=3) return;
        const st=X.f.extra._stands||[]; if(!st.length) return; const s=st[Math.random()*st.length|0], sp=[[s.x,s.y+1],[s.x,s.y-1],[s.x+1,s.y],[s.x-1,s.y]].filter(([x,y])=>X.ok(x,y)); if(!sp.length) return;
        const [ax,ay]=sp[Math.random()*sp.length|0], lv=Math.max(1,(d.level||4)-4), m=COMBAT.demonModel(lv,3,false,'#8a8ea0'); m.scale.multiplyScalar(0.8);
        COMBAT.add({x:ax+0.5,z:ay+0.5,hp:6+lv,level:lv,speed:1.15*PX,husk:true,model:m}); } }; };

  // ── 2 · Saltmere: the counting-stones ──
  G[2]=X=>{ const water=new THREE.Mesh(new THREE.PlaneGeometry(X.W-2,X.H-2),new THREE.MeshPhongMaterial({color:0x2f8aa8,transparent:true,opacity:0.5,shininess:90,depthWrite:false})); water.rotation.x=-Math.PI/2; water.position.set(X.W/2,0.06,X.H/2); X.room.add(water);
    X.an.push(t=>{ water.position.y=0.06+Math.sin(t*1.3)*0.015; });
    const L=(X.f.extra._ledgers||[]).map(s=>{ const g=group(0,0,0,X.room); s.cells.forEach(([x,y])=>{ const b=B(0.96,0.22,0.96,0x9a958a,x+0.5,0,y+0.5,g); b.receiveShadow=true; }); return {cells:s.cells,sunk:false,g}; });
    let t0=null; const onStone=()=>{ const [x,y]=ptile(); return X.at(x,y)===47; }, wading=()=>{ const [x,y]=ptile(); return X.at(x,y)===48; };
    return {
      state:()=>({stones:L.filter(s=>!s.sunk).map(s=>s.cells)}),
      onEnter(){ t0=null; L.forEach(s=>{ s.sunk=false; s.g.position.y=0; s.cells.forEach(([x,y])=>X.setT(x,y,47)); }); },
      speedMult:()=>wading()?0.62:1,
      cfg:{ chargeMult:d=>{ const t=X.at(Math.floor(d.x),Math.floor(d.z)); return t===48?1.35:t===47?0.7:1; }, ringSafe:onStone, dodgeMult:()=>wading()?0.55:1 },
      tick(){ const b=X.boss(); if(!b) return; if(t0===null) t0=now(); const sinkable=L.length-1, byHp=Math.floor((1-Math.max(0,b.hp)/b.maxHp)*sinkable), el=now()-t0, byTime=el<=45000?0:Math.floor((el-45000)/12000), want=Math.min(sinkable,Math.max(byHp,byTime));
        for(let i=0;i<want;i++){ const s=L[i]; if(s.sunk) continue; s.sunk=true; s.cells.forEach(([x,y])=>X.setT(x,y,48)); let k=0; const go=()=>{ k=Math.min(1,k+0.04); s.g.position.y=-0.26*k; if(k<1) requestAnimationFrame(go); }; go(); UI.toast('🌊 The water takes another stone.',1400); } } }; };

  // ── 3 · Thornwood: the roots ──
  G[3]=X=>{ (X.f.extra._bramble||[]).forEach(b=>{ const g=group(b.x+0.5,0,b.y+0.5,X.room); for(let i=0;i<5;i++){ const s=Sp(0.3,i%2?0x2f5a2a:0x3a6a30,(hsh(b.x,i)-0.5)*0.5,0.3+i*0.12,(hsh(i,b.y)-0.5)*0.5,g,6,4); s.scale.y=0.8; }
      for(let i=0;i<8;i++){ const th=Co(0.03,0.22,4,0x6a4a2a,(hsh(i,b.x)-0.5)*0.8,0.3+hsh(b.y,i)*0.5,(hsh(b.x+i,b.y)-0.5)*0.8,g); th.rotation.z=(hsh(i,i)-0.5)*2; } });
    let rootT=0, seen;
    const rootModel=()=>{ const g=new THREE.Group(), m=new THREE.MeshPhongMaterial({color:0x5a7a3a,flatShading:true}); for(let i=0;i<3;i++){ const c=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.9-i*0.2,5),m); c.position.set((i-1)*0.18,0.4,0); c.rotation.z=(i-1)*0.35; g.add(c); }
      const b=new THREE.Mesh(new THREE.SphereGeometry(0.28,7,5),new THREE.MeshPhongMaterial({color:0x4a3a22,flatShading:true})); b.scale.y=0.4; g.add(b); g.userData.mats=[m]; return g; };
    return {
      onEnter(){ rootT=0; seen=undefined; },
      cfg:{ onHit:d=>{ if(d.boss&&d._regrowing) say('root','🌿 It knits itself back together. Something under the floor is still feeding it.',1900,3200); } },
      tick(){ const d=X.boss(); if(!d) return; const roots=X.lv.combat.adds.filter(a=>a.alive&&a.root);
        if(seen!==undefined&&roots.length<seen) rootT=Math.max(rootT,300); seen=roots.length;
        if(roots.length&&d.hp>0){ d.hp=Math.min(d.maxHp,d.hp+(d.bf?0.05:0.12)*roots.length); d._regrowing=true;   /* V177: slower against the armoured fight */ } else d._regrowing=false;
        if(--rootT>0) return; rootT=300; if(roots.length>=3) return;
        let best=null, bd=-1; for(let y=2;y<X.H-2;y++) for(let x=2;x<X.W-2;x++){ if(!X.ok(x,y)||roots.some(a=>Math.floor(a.x)===x&&Math.floor(a.z)===y)) continue; const dd=Math.hypot(x+0.5-P().x,y+0.5-P().z); if(dd>bd){ bd=dd; best=[x,y]; } }
        if(!best) return; const lv=Math.max(1,(d.level||8)-3); COMBAT.add({x:best[0]+0.5,z:best[1]+0.5,hp:10+lv,level:lv,speed:0,root:true,model:rootModel()});
        UI.toast('🌱 Something puts up a shoot behind you. It is under the floor. It always was.',1700); } }; };

  // ── 4 · Dusthaven: the grain ──
  G[4]=X=>{ const grain=(X.f.extra._grain||[]).map(s=>{ const g=group(s.x+0.5,0,s.y+0.5,X.room), sacks=group(0,0,0,g);
      [[-0.2,-0.15],[0.2,-0.1],[0,0.2]].forEach(([a,b],k)=>{ const m=Sp(0.26,0xd8c48a,a,0.22,b,sacks,7,5); m.scale.y=0.85; }); Sp(0.24,0xcbb47a,0,0.6,0,sacks,7,5).scale.y=0.8;
      const fire=group(0,0,0,g); fire.visible=false; [[0,0],[0.2,0.1],[-0.15,-0.1]].forEach(([a,b])=>{ const f=Co(0.18,0.6,6,glow(0xff8a30),a,0.1,b,fire); X.an.push(t=>{ f.scale.y=1+Math.sin(t*12+a*9)*0.25; }); });
      const ash=disc(g,0.42,0x2a2420,0.9,0.02); ash.visible=false; shade(sacks); return {x:s.x,y:s.y,state:'grain',t:0,sacks,fire,ash}; });
    const al=X.f.extra._altar; if(al){ const g=group(al.x+0.5,0,al.y+0.5,X.room); B(0.95,0.85,0.8,0xa8a090,0,0,0,g); B(1.0,0.08,0.85,0xd8d0c0,0,0.85,0,g); flame(0,1.0,0,g,X.an,1.2); shade(g); }
    const ignite=(x,y)=>{ const s=grain.find(q=>q.x===x&&q.y===y&&q.state==='grain'); if(!s) return; s.state='burning'; s.t=90; X.setT(x,y,54); s.fire.visible=true; };
    return {
      onEnter(){ grain.forEach(s=>{ s.state='grain'; s.sacks.visible=true; s.fire.visible=false; s.ash.visible=false; X.setT(s.x,s.y,53); }); },
      cfg:{ shotWall:ignite, ringTick:d=>{ grain.forEach(s=>{ if(s.state==='grain'&&Math.abs(Math.hypot(s.x+0.5-d.x,s.y+0.5-d.z)-d.ringR)<0.7) ignite(s.x,s.y); }); } },
      always(){ grain.forEach(s=>{ if(s.state!=='burning') return; s.sacks.scale.setScalar(Math.max(0.2,s.t/90)); if(--s.t>0) return; s.state='ash'; X.setT(s.x,s.y,55); s.sacks.visible=false; s.fire.visible=false; s.ash.visible=true;
        if(!grain.some(q=>q.state==='grain')) UI.toast('🔥 There is nothing left to stand behind. Only the stone at the head of the hall.',2400); }); } }; };

  // ── 5 · Crystalpeak: the cold ──
  G[5]=X=>{ let frost=0, ft=0, thawed=false; const fires=X.f.extra._fires||[];
    const warm=()=>fires.some(f=>Math.hypot(f.x+0.5-P().x,f.y+0.5-P().z)<=2.6);
    const show=()=>{ const f=frost/100; COMBAT.meter(f>0.02?[{label:frost>=85?'❄ COLD':'❄ Frost',f,col:frost>=85?'#bfefff':frost>=45?'#7fd4f0':'#4a9cc0'}]:null); COMBAT.tint('rgba(150,230,255,0.9)',0.42*f); };
    return {
      state:()=>({frost,fires}),
      onEnter(){ frost=0; ft=0; show(); },
      speedMult:()=>frost>45?1-0.42*Math.min(1,(frost-45)/55):1,
      cfg:{ shotHit:()=>{ frost=Math.min(100,frost+9); COMBAT.hurtFromBoss(1+X.tl*0.15); return true; } },
      always(){ if(X.R().bossDead){ frost=Math.max(0,frost-1.25); show(); return; }
        if(warm()){ frost=Math.max(0,frost-1.25); if(frost===0&&!thawed){ thawed=true; UI.toast('🔥 Your hands come back. It cost you nothing. It never did.',1800); } }
        else { thawed=false; frost=Math.min(100,frost+(COMBAT.pl.swing>0?0.30:0.085));
          if(frost>=85&&++ft%30===0){ let inc=Math.max(1,Math.round((3+X.tl*0.5)-S().def*0.35)); if(COMBAT.pl.blocking) inc=Math.max(1,Math.ceil(inc*0.35)); COMBAT.hurtRaw(inc,12);
            say('frost','🥶 You can no longer feel your hands. There is a fire at either wall.',2000,4000); } }
        show(); } }; };

  // ── 6 · Ashfield: the ground you swing from ──
  G[6]=X=>{ let zeal=0; const pyres=[];
    const mk=(x,y)=>{ const g=group(x+0.5,0.02,y+0.5,X.room), ring=new THREE.Mesh(new THREE.RingGeometry(0.3,0.38,20),new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false})); ring.rotation.x=-Math.PI/2; g.add(ring);
      const fire=Co(0.32,1.0,7,new THREE.MeshBasicMaterial({color:0xffb040,transparent:true,opacity:0.85}),0,0,0,g); fire.visible=false; return {x,y,t:44,lit:0,g,ring,fire}; };
    const show=()=>COMBAT.meter(zeal>0.04?[{label:zeal>0.78?'🔥 ZEAL':'Zeal',f:zeal,col:zeal>0.78?'#fff0bb':zeal>0.5?'#ff9a2e':'#c05a20'}]:null);
    return {
      state:()=>({zeal,pyres}),
      onEnter(){ zeal=0; pyres.splice(0).forEach(p=>X.room.remove(p.g)); show(); },
      cfg:{ onSwing:()=>{ if(X.R().bossDead) return; const [tx,ty]=ptile(); zeal=Math.min(1,zeal+0.34); const cells=[[tx,ty]];
        if(zeal>0.5) cells.push([tx+1,ty],[tx-1,ty],[tx,ty+1],[tx,ty-1]); if(zeal>0.78) cells.push([tx+1,ty+1],[tx-1,ty-1],[tx+1,ty-1],[tx-1,ty+1]);
        cells.forEach(([x,y])=>{ if(!X.ok(x,y)||pyres.some(p=>p.x===x&&p.y===y&&p.t>0)) return; pyres.push(mk(x,y)); }); } },
      tick(){ zeal=Math.max(0,zeal-0.016); const [kx,ky]=ptile();
        for(const p of pyres){ if(p.t>0){ p.t--; const k=1-p.t/44; p.ring.scale.setScalar(1.9-0.9*k); p.ring.material.opacity=0.35+0.5*k; if(p.t===0){ p.lit=26; p.ring.visible=false; p.fire.visible=true; } continue; }
          if(p.lit>0){ p.lit--; p.fire.scale.set(1,0.5+0.8*p.lit/26,1);
            if(p.x===kx&&p.y===ky){ let inc=Math.max(1,Math.round((6+X.tl*0.6)-S().def*0.4)); if(COMBAT.pl.blocking) inc=Math.max(1,Math.ceil(inc*0.5)); COMBAT.hurtRaw(inc,16); }
            if(p.lit===0){ if(X.at(p.x,p.y)===0){ X.setT(p.x,p.y,57); disc(X.room,0.42,0x1e1a18,0.8,0.015).position.set(p.x+0.5,0.015,p.y+0.5); } X.room.remove(p.g); } } }
        for(let i=pyres.length-1;i>=0;i--) if(pyres[i].t<=0&&pyres[i].lit<=0) pyres.splice(i,1); show(); } }; };

  // ── 7 · Stormgate: Ruth's people ──
  /* V187: SHELTER, THEN FIGHT. Ruth's people no longer wander the hall with a bolt picking one out every few seconds while
     the Thunder Lord swings at you. They huddle in one place, under a ring on the floor. Every so often he stops fighting
     (his hammer still, `quiet`), raises it and CALLS THE STORM DOWN on them — a long, plain warning: a bar, a closing ring,
     a pillar of light. Get into the ring and raise your shield: the bolt breaks on it, runs back up into him and he REELS,
     wide open — and your blade is charged for a while after (it goes through his guard). In the ring without your shield
     up you take it for them: it hurts, they live, he staggers a little. Not there: one of them is lost.
     Your sword works on him at all times now, like any guardian; the charge is the reward, not the key. */
  const G7=X=>{ const looks=['peasant','peasantF','child','peasant','peasantF']; let bolt=null, boltT=0, lost=0, charge=0, chargeT=0, hub=null, calls=0;
    const WARN=210, RAD=1.9, CHG=9000;
    const mk=(geo,col,op)=>{ const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,side:THREE.DoubleSide,depthWrite:false})); X.room.add(m); return m; };
    const home=mk(new THREE.RingGeometry(RAD-0.09,RAD,48),0xe8dcbb,0), bm=mk(new THREE.RingGeometry(0.9,1.05,40),0xffd65a,0), fill=mk(new THREE.CircleGeometry(RAD,40),0x9ad8ff,0); [home,bm,fill].forEach(m=>{ m.rotation.x=-Math.PI/2; });
    const beam=mk(new THREE.CylinderGeometry(0.5,0.5,14,10,1,true),0xfff6d6,0);
    const charged=()=>{ if(charge>0&&now()>chargeT){ charge=0; } return charge>0; };
    const flock=()=>X.lv.combat.adds.filter(a=>a.alive&&a.flock);
    const show=()=>{ const l=flock().length, m=[{label:'Ruth’s people',pips:l,of:5,col:'#e8dcbb'}]; if(bolt) m.push({label:'⚡ THE STORM IS FALLING — shield them!',f:bolt.t/WARN,col:'#ffd65a'}); else if(charged()) m.push({label:'⚡ CHARGED — your blade goes through his guard',f:(chargeT-now())/CHG,col:'#7fd0ff'}); COMBAT.meter(m); };
    // where they shelter: the middle of the hall's far end from him, on open floor
    function place(){ const b=X.boss(), bz=b?b.z:2, cx=X.W/2, far=bz<X.H/2?X.H*0.74:X.H*0.26; let best=null;
      for(let r=0;r<6&&!best;r++) for(let dx=-r;dx<=r&&!best;dx++) for(let dz=-r;dz<=r;dz++){ const x=Math.floor(cx)+dx, z=Math.floor(far)+dz; if([[0,0],[1,0],[-1,0],[0,1],[0,-1]].every(([a,c])=>X.ok(x+a,z+c))){ best={x:x+0.5,z:z+0.5}; break; } }
      return best||{x:cx,z:far}; }
    const stun=(n,toast)=>{ const b=X.boss(); if(!b||!b.alive) return; b.state='stunned'; b.timer=n; b.walking=false; b.ring=0; b.mark=false; COMBAT.pop(b.x,(b.g.userData.tall||3.5)*0.85,b.z,'It reels — strike!','#ffd84a'); };
    return {
      state:()=>({bolt,charge:charged()?charge:0,lost,hub,calls}),
      onEnter(){ bolt=null; boltT=0; lost=0; charge=0; calls=0; hub=place(); home.position.set(hub.x,0.04,hub.z); home.material.opacity=0.55; fill.position.set(hub.x,0.035,hub.z); bm.position.set(hub.x,0.05,hub.z); beam.position.set(hub.x,7,hub.z);
        looks.forEach((lk,k)=>{ const a=k/5*6.283; COMBAT.add({x:hub.x+Math.cos(a)*0.75,z:hub.z+Math.sin(a)*0.75,hp:1,level:1,speed:0,flock:true,wander:0,model:person(lk)}); }); show();
        setTimeout(()=>UI.toast('🛡 Ruth’s people shelter in the ring. When he calls the storm down on them, get in beside them and raise your shield.',4600),1200); },
      onBossDead(){ bolt=null; [home,bm,fill,beam].forEach(m=>{ m.material.opacity=0; }); if(lost===0&&flock().length>=5&&!S().stormward){ S().stormward=true; setTimeout(()=>UI.toast('🛡 The Stormward Plate — every one of them walked out of Ruth’s hall.',4200),2600); } COMBAT.meter(null); },
      cfg:{ pierce:()=>charged(),   /* charged, your blade goes through its guard */
        quiet:()=>!!bolt,           /* while he calls the storm his hammer is still: this moment is about them, not about dodging him */
        onHit:d=>{ if(d.boss&&charged()&&--charge===0){ chargeT=0; UI.toast('⚡ The charge is spent.',1200); } } },
      tick(){ charged(); const fl=flock(), b=X.boss(), p=P(); home.material.opacity=fl.length?0.4+0.15*Math.sin(now()/400):0;
        if(!bolt){ bm.material.opacity=0; fill.material.opacity=Math.max(0,fill.material.opacity-0.03); beam.material.opacity=Math.max(0,beam.material.opacity-0.06); show();
          if(!fl.length||!b||!b.alive) return; const every=calls===0?300:500-((b.bf&&b.bf.ph)||0)*40;   // the first comes early, to teach it; then one every eight seconds or so, a little sooner as he weakens
          if(++boltT<every) return; if(b.state==='stunned'||(b.bf&&(b.bf.mode==='sig'||b.bf.mode==='roar'))){ return; }   // never in the middle of his own great moves
          boltT=0; calls++; bolt={t:WARN}; if(b) b.pose='cast'; if(typeof SFX!=='undefined') SFX.play('bossRoar');
          UI.toast('⚡ He raises the hammer — the storm is coming down on Ruth’s people! Get in the ring and raise your shield.',2600); return; }
        const k=1-bolt.t/WARN, inside=Math.hypot(p.x-hub.x,p.z-hub.z)<=RAD; if(b&&b.alive) b.pose='cast';
        bm.scale.setScalar((RAD/1.0)*(1.9-0.9*k)); bm.material.opacity=0.45+0.5*k; bm.material.color.setHex(inside?0x8af0a8:0xffd65a); fill.material.opacity=0.08+0.16*k; beam.material.opacity=k>0.75?0.1+0.3*(k-0.75)/0.25:0; show();
        if(--bolt.t>0) return; bolt=null; if(b) b.pose=null; beam.material.opacity=0.95; fill.material.opacity=0.7; if(typeof SFX!=='undefined') SFX.play('bossStrike'); if(COMBAT.tint){ COMBAT.tint('#cfeaff',0.5); setTimeout(()=>COMBAT.tint('#cfeaff',0),260); }
        if(!fl.length) return;
        if(inside){ const guard=!!COMBAT.pl.blocking; let inc=Math.max(1,Math.round((7+X.tl*0.5)-S().def*0.4)); if(guard) inc=Math.max(1,Math.ceil(inc*0.2)); COMBAT.pl.iframes=0; COMBAT.hurtRaw(inc,30);
          if(guard){ charge=6; chargeT=now()+CHG; stun(170); if(typeof SFX!=='undefined') SFX.play('parry'); UI.toast('🛡 It breaks on your shield — and runs back up into him. He reels! Strike — your blade is charged.',2600); }
          else { charge=3; chargeT=now()+CHG*0.6; stun(70); UI.toast('⚡ You take it for them. They live — next time, raise your shield and it will turn on him.',2600); } }
        else { const m=fl[Math.random()*fl.length|0]; m.alive=false; lost++; const left=flock().length; UI.toast(left===0?'⚡ The finest walls in the realm — and nobody left inside them.':`⚡ One of them is gone. ${left} still here. Be in the ring when it falls.`,2400); }
        show(); } }; };

  /* V172: STORMGATE IS TWO FIGHTS. First the king: King Karl, the Thunder Lord inside him, storm-light crawling over him. Your
     blade only hurts the man — it is the storm you must break, and you break it by turning his blows (parry: Guard as they land).
     Turn enough of them and the storm tears out of him and stands up over him: the Thunder Lord, and Ruth's people in the hall. */
  G[7]=X=>{ const base=G7(X); let phase=2, king=null, parries=0, need=4, wasStag=false, lying=null, struck=0;
    const kingModel=()=>{ const g=person('king'); const cv=document.createElement('canvas'); cv.width=cv.height=64; const c2=cv.getContext('2d'), gr=c2.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(220,240,255,1)'); gr.addColorStop(0.35,'rgba(120,190,255,0.6)'); gr.addColorStop(1,'rgba(80,150,255,0)'); c2.fillStyle=gr; c2.fillRect(0,0,64,64);
      const am=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),color:0xffffff,transparent:true,opacity:0.6,depthWrite:false,blending:THREE.AdditiveBlending});
      const sp=[]; for(let i=0;i<7;i++){ const m=new THREE.Sprite(am.clone()); m.scale.setScalar(0.22+Math.random()*0.18); g.add(m); sp.push(m); } g.userData.storm=sp; const L=new THREE.PointLight(0x8ad0ff,1.0,4,1.6); L.position.y=1.4; g.add(L); g.userData.sL=L; return g; };
    const meter=()=>COMBAT.meter([{label:'⚡ The storm in the king',f:Math.max(0,1-parries/need),col:'#7fd0ff'}]);
    const hideLord=on=>{ const b=X.boss(); if(!b) return; b.g.visible=!on; b.held=on?()=>true:null; };
    function toPhase2(){ phase=2; const b=X.boss(); COMBAT.meter(null);
      if(king){ const kx=king.x, kz=king.z; king.alive=false; king.dying=0; if(king.g&&king.g.parent) king.g.parent.remove(king.g);
        lying=person('king'); lying.position.set(kx,0.22,kz); lying.rotation.set(-Math.PI/2+0.1,0,0.2); X.room.add(lying); if(b){ b.x=kx+1.2; b.z=kz-1.2; } }
      hideLord(false); if(typeof SFX!=='undefined'){ SFX.play('bossRoar'); SFX.play('bossStrike'); } X.hemi.intensity+=1.4; if(COMBAT.tint){ COMBAT.tint('#9ad8ff',0.6); setTimeout(()=>COMBAT.tint('#9ad8ff',0),500); }
      ENGINE.speak('The storm comes out of him',['The last blow turns on your shield — and the king cries out in his own voice, and falls to his knees, and the storm goes out of him like a scream of thunder.','It does not go far. It gathers over him, and stands up — slate and lightning and a crown of rods, taller than the doors.','The THUNDER LORD. And all through the nave, Ruth’s people, the ones it kept here, are running.'],null,()=>{ if(base.onEnter) base.onEnter(); }); }
    return {
      state:()=>Object.assign({phase,parries,need},base.state?base.state():{}),
      onEnter(){ parries=0; need=4; wasStag=false; struck=0; if(lying&&lying.parent) lying.parent.remove(lying); lying=null; king=null;
        if(X.R().bossDead){ phase=2; return; } if(window.SKIP_KING){ phase=2; if(base.onEnter) base.onEnter(); return; }   /* tests: straight to the Thunder Lord */
        phase=1; hideLord(true);
        const b=X.boss(), kx=b?b.x:X.W/2, kz=b?b.z+1.5:X.H/2; king=COMBAT.foe(X.lv,{x:kx,z:kz,hx:kx,hz:kz,post:'king',pdx:1,pdz:0,patrol:2,hp:999,level:X.tl,xp:0,atk:Math.round(5+X.tl*0.3),form:1,style:'claw',model:kingModel(),king:true,name:'👑 King Karl'}); if(king) king.alert=true;
        meter(); setTimeout(()=>ENGINE.speak('King Karl',['You came. Of course you came. Ruth always said you would.','(His voice is his own, and not his own. Storm-light crawls over his hands and his crown, and behind his eyes something else is looking out.)','Turn back, knight. Or draw your sword on your king.'],null,()=>UI.toast('🛡 Do not strike the king — it is the storm in him you must break. Turn his blows: Guard just as they land.',4200)),900); },
      onBossDead(d){ if(base.onBossDead) base.onBossDead(d); COMBAT.meter(null); S().karlFreed=true;
        setTimeout(()=>UI.toast('👑 King Karl, on his knees: “It was in me… all these years. And Ruth — I struck down Ruth with this hand.”',5200),1600); },
      cfg:{ onHit:d=>{ if(d.king){ struck++; if(struck%2===1&&need<7) need++; meter(); COMBAT.pop(d.x,1.9,d.z,'— the king cries out —','#ff9a9a'); UI.toast('⚠ Your blade bites the man, not the storm. He cries out in his own voice. Turn his blows instead.',2200); return false; }
        if(phase===1&&d.boss) return false; return base.cfg&&base.cfg.onHit?base.cfg.onHit(d):undefined; }, pierce:()=>base.cfg.pierce() },
      tick(){ if(phase===2){ if(base.tick) base.tick(); return; } if(!king||!king.alive) return;
        const t=performance.now()/1000; (king.g.userData.storm||[]).forEach((m,i)=>{ const a=t*3+i*0.9; m.position.set(Math.cos(a)*0.45,0.6+((t*1.7+i*0.37)%1)*1.4,Math.sin(a)*0.45); m.material.opacity=0.3+Math.random()*0.5; }); if(king.g.userData.sL) king.g.userData.sL.intensity=0.6+Math.random()*0.8*(1-parries/need);
        if(king.stag>0&&!wasStag){ parries++; meter(); if(typeof SFX!=='undefined') SFX.play('parry'); UI.toast(parries>=need?'⚡ Turned — and the storm in him breaks!':`🛡 Turned! The storm in him shudders. (${parries} of ${need})`,1500); if(parries>=need) setTimeout(toPhase2,500); }
        wasStag=king.stag>0; },
      always(){ if(base.always) base.always(); } }; };

  // ── 8 · Shadowmere: the shape he had learned to admire ──
  const dress=k=>{ if(k.dress) k.dress(S()); };
  const DARK={TUNIC:'#2a2238',TUNIC_RIM:'#5a3a7a',LEG:'#1a1424',PLUME:'#6a2a9a',HELM:'#3a3448'};
  G[8]=X=>{ let veil=null, veilT=0, last=null; const T=X.C.tune;
    function end(struck){ if(!veil) return; veil=null; X.lv.combat.adds.forEach(a=>{ if(a.mirror) a.alive=false; }); const b=X.lv.combat.foes.find(d=>d.boss); if(b&&b.g.setLivery) b.g.setLivery('knight',DARK); if(struck) UI.toast('⚔ You looked, and then you struck.',1600); }
    return {
      onEnter(){ veil=null; veilT=0; last=null; },
      onBossDead(){ end(false); const R=X.R(); if(!R.mirrors&&!S().fallenPlate){ S().fallenPlate=true; setTimeout(()=>UI.toast('🖤 The Fallen Plate — you never once struck your own reflection.',4200),2600); } },
      cfg:{ quiet:()=>!!veil,   /* V177: while it wears your shape, it keeps its blade still */
        onHit:d=>{ if(d.boss&&veil){ end(true); d.state='idle'; d.timer=70; } },
        onMirror:()=>{ X.R().mirrors++; COMBAT.mirrorBurst(X.tl); UI.toast('💥 It was only you. The shape was familiar — that is the whole trick.',2000); },
        mirrorStep:a=>{ const nx=a.x+(a.dx||0), nz=a.z+(a.dz||0); if(X.ok(Math.floor(nx),Math.floor(nz))){ a.x=nx; a.z=nz; } a.moving=Math.hypot(a.dx||0,a.dz||0)>0.002; } },
      tick(){ const p=P(), dx=last?p.x-last.x:0, dz=last?p.z-last.z:0; X.lv.combat.adds.forEach(a=>{ if(a.mirror){ a.dx=dx; a.dz=dz; } }); last={x:p.x,z:p.z};
        const boss=X.boss(); if(!boss) return;
        if(!veil){ if(++veilT<T.veilEvery) return; veilT=0; const chosen=[];
          for(const s of [[3,5],[11,5],[7,3],[7,8],[5,2],[10,8]].map(([a,b])=>X.f.wide?[1+X.f.wide*(a-1),1+X.f.wide*(b-1)]:[a,b])){   /* the 2D hall's spots, moved with the widened sanctum */ if(chosen.length>=T.veilDecoys) break; if(Math.hypot(s[0]+0.5-p.x,s[1]+0.5-p.z)<2.5||!X.ok(s[0],s[1])) continue; chosen.push(s); }
          chosen.forEach(([sx,sz])=>{ const k=COMBAT.knightModel(); dress(k); COMBAT.add({x:sx+0.5,z:sz+0.5,hp:1,level:1,speed:0,mirror:true,model:k}); });
          veil={until:now()+T.veilMs}; if(boss.g.setLivery) dress(boss.g); UI.toast('👁 It puts on your shape. A reflection can only copy you — find the one that does not.',2600); return; }
        if(now()>veil.until) end(false); } }; };

  // ── 9 · Hellgate: hope ──
  G[9]=X=>{ let hope=100, voidT=0; const voids=[];
    const show=()=>COMBAT.meter([{label:hope<=25?'🖤 HOPE':'Hope',f:hope/100,col:hope>55?'#e8dcbb':hope>25?'#d9a441':'#c0392e'}]);
    const inVoid=()=>voids.find(v=>Math.hypot(v.x+0.5-P().x,v.y+0.5-P().z)<=v.r);
    return {
      state:()=>({hope,voids}),
      onEnter(){ hope=100; voidT=0; voids.splice(0).forEach(v=>X.room.remove(v.g)); show(); },
      onBossDead(){ voids.splice(0).forEach(v=>X.room.remove(v.g)); COMBAT.meter(null); },
      cfg:{ onHit:d=>{ if(d.boss) hope=Math.min(100,hope+9); } },
      tick(){ const t=now(), b=X.boss(); if(!b) return;
        for(let i=voids.length-1;i>=0;i--) if(t>=voids[i].until){ X.room.remove(voids[i].g); voids.splice(i,1); }
        if(++voidT>=430){ voidT=0; const a=Math.random()*6.28, d=3+Math.random()*2; const vx=Math.max(2,Math.min(X.W-3,Math.round(P().x-0.5+Math.cos(a)*d))), vy=Math.max(2,Math.min(X.H-3,Math.round(P().z-0.5+Math.sin(a)*d)));
          const g=group(vx+0.5,0,vy+0.5,X.room); disc(g,1.9,0x050208,0.9,0.03); const rim=new THREE.Mesh(new THREE.RingGeometry(1.5,1.9,32),new THREE.MeshBasicMaterial({color:0xffbe5a,transparent:true,opacity:0.3,side:THREE.DoubleSide,depthWrite:false})); rim.rotation.x=-Math.PI/2; rim.position.y=0.035; g.add(rim);
          X.an.push(tt=>{ rim.material.opacity=0.22+0.12*Math.sin(tt*3.3+vx); }); voids.push({x:vx,y:vy,r:1.9,until:t+8000,g}); UI.toast('🕳 It offers to take the weight. There is nothing on the other side of it.',2400); }
        const v=inVoid(); if(v){ hope=Math.max(0,hope-0.22); b.hp=Math.min(b.maxHp,b.hp+0.16); say('rest','😌 The weight lifts… and something goes out of you with it.',1800,3000); } else hope=Math.max(0,hope-0.055);
        if(hope<=0&&!(COMBAT.pl.iframes>0)){ COMBAT.hurtRaw(Math.max(2,Math.round(4+X.tl*0.4)),24); say('hope','🖤 Your arm gives out. It was never going to hold on its own. Strike, and it comes back.',2400,3500); }
        show(); } }; };
  return G;
})();
