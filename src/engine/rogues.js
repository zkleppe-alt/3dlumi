// ════════════════════════════════════════════════════════════════
//  THE ROADSIDE ROGUES — Dylan, Ethan and Ranger Cody (data/pastimes.json → rogues), from the first cleansed chapel:
//   DYLAN sits by a path and asks for a Loaf of Bread. Bring it and he takes the bread AND up to 50 gold, and bolts.
//   ETHAN charges out of nowhere, screams, and lays into you with a stick. It stings but can never drop you below
//         1 HP. Land three blows and he runs.
//   After every encounter RANGER CODY rides up on his grey stallion, asks after you, and rides off. Seven of each and
//   Cody has them both: a floating cell off Stormgate's south shore with a pier out to it, the Ranger's Watch livery,
//   and from then on he patrols the realm with a Psalm or a Proverb for anyone who stops him.
//   One encounter every 2½–4½ minutes in the open (rg.next), never with demons near, never on a boat or a cart.
//  And THE DOODLES — six purple wanderers drawn by Zak's son (DOODLE_SPR), drifting about the open country, their own
//  pictures on a card that turns to face you. Talk to one: "… stares blankly into your soul …".
//  rogues(world, R, DD)
// ════════════════════════════════════════════════════════════════
function rogues(world,R,DD){
  const S=()=>GAME.S, P=ENGINE.P, strip=h=>String(h).replace(/<[^>]+>/g,'').trim();
  const rr=()=>{ const s=S(); return s.roadRogues||(s.roadRogues={d:0,e:0,jailed:false,stolen:0,visits:0}); };
  const active=()=>S().chapels>=1&&!rr().jailed;
  const rg={dylan:null,ethan:null,cody:null,patrol:null,t:0,next:60,pending:null};   // seconds
  const walk=(x,z)=>world.walkTile(Math.floor(x),Math.floor(z))||onPier(x,z);
  function step(o,tx,tz,sp){ const dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<0.05) return false; const s=Math.min(d,sp), mx=dx/d*s, mz=dz/d*s; let moved=false;
    if(walk(o.x+mx,o.z)){ o.x+=mx; moved=true; } if(walk(o.x,o.z+mz)){ o.z+=mz; moved=true; } if(moved) o.face=Math.atan2(mx,mz); return moved; }
  function pick(minD,maxD,test){ for(let i=0;i<60;i++){ const a=Math.random()*6.283, r=minD+Math.random()*(maxD-minD), x=Math.floor(P.x+Math.cos(a)*r), y=Math.floor(P.z+Math.sin(a)*r);
      if(world.walkTile(x,y)&&(!test||test(x,y))) return {x:x+0.5,z:y+0.5}; } return null; }
  function person(look,who,x,z,opt){ const f=addPerson(world,world.scene,look,x,z,world.ground(x,z),who,null,Object.assign({rest:0},opt||{})); f.rogue=true; return f; }
  function drop(f){ if(!f) return; world.scene.remove(f.g); const i=world.folk.indexOf(f); if(i>=0) world.folk.splice(i,1); }
  const place=f=>{ f.g.position.set(f.x,world.ground(f.x,f.z),f.z); if(f.face!==undefined) f.g.rotation.y=f.face; };
  // ── Dylan ──
  function spawnDylan(){ const s=pick(7,14,(x,y)=>world.T(x,y)===0&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>world.T(x+a,y+b)===2)); if(!s) return false;
    const f=person('peasant','Dylan',s.x,s.z); f.g.scale.setScalar(1.15); f.stage='sit'; f.label='Talk';
    f.action=()=>{ const r=rr(); if(f.stage==='flee') return;
      if(f.stage==='sit'){ f.stage='wait'; ENGINE.speak('Dylan',[strip(R.dylan[Math.min(r.d,R.dylan.length-1)])],f); return; }
      if((S().inventory.bread||0)<=0){ ENGINE.speak('Dylan',['Still no bread? The market’s back that way. I’ll be right here. Not going anywhere. Definitely.'],f); return; }
      ENGINE.speak('Dylan',['Oh, you beauty. Warm and everything. You really are a good man, knight.','…Sorry about this.'],f,()=>{ const s=S(); s.inventory.bread=Math.max(0,(s.inventory.bread||0)-1);
        const took=Math.min(50,Math.max(0,s.gold|0)); GAME.addGold(-took); r.stolen=(r.stolen|0)+took; f.stage='flee'; f.t=0; f.mute=true; ENGINE.knock&&ENGINE.knock(f.x,f.z);   /* V165: he shoves you over as he goes */
        UI.toast(took>0?`💰 Dylan shoved you flat, snatched ${took} gold and bolted with your bread!`:'🍞 Dylan shoved you flat, grabbed the bread, felt for your purse, found it empty, and bolted anyway.',2600); GAME.save(); }); };
    rg.dylan=f; return true; }
  // ── Ethan: a demon in all but name, with the game's own stick ──
  function spawnEthan(){ const s=pick(9,13); if(!s) return false;
    const e=COMBAT.foe(world,{x:s.x,z:s.z,hp:3,level:1,xp:0,boss:false,model:(()=>{ const g=person('woodcutter','Ethan',0,0).g; world.folk.splice(world.folk.findIndex(q=>q.g===g),1); B(0.06,0.8,0.06,0x7a5432,0.3,0.6,0.25,g).rotation.x=-0.9; return g; })()});
    e.rogue=true; e.hits=0; e.stuck=0; e.state='approach'; e.cd=40; e.swing=0; e.t=0; e.ai=ethanAi; rg.ethan=e; return true; }
  function ethanAi(e,dx,dz,dist){ e.t++; const pl=COMBAT.pl;
    if(e.state==='approach'){ if(dist<1.6){ e.state='scream'; ENGINE.speak('Ethan',[strip(R.screams[rr().e%R.screams.length])],null,()=>{ e.state='fight'; e.cd=30; }); }
      else if(!step(e,P.x,P.z,1.35/16)){ if(++e.stuck>180){ e.alive=false; rg.ethan=null; rg.t=Math.max(0,rg.next-10); } } else e.stuck=0; e.face=Math.atan2(dx,dz); return; }   // walled off from you: he'll try again soon
    if(e.state==='fight'){ if(dist>1.0) step(e,P.x,P.z,0.95/16); e.face=Math.atan2(dx,dz); if(e.cd>0) e.cd--;
      if(e.swing>0){ e.swing--; if(e.swing===6&&dist<1.35&&pl.iframes<=0){ const s=S(); let inc=Math.max(1,6+Math.floor(s.level/3)-Math.floor(s.def/2)); inc=Math.max(1,Math.round(inc*(1-(s.dmgReduce||0)))); let ifr=40;
          if(COMBAT.blocking()){ inc=1; ifr=70; } inc=Math.min(inc,s.hp-1); if(inc>0) COMBAT.hurtRaw(inc,ifr); else pl.iframes=ifr; } }   // the stick stings, but it can never put the knight down
      else if(e.cd<=0&&dist<1.3){ e.swing=14; e.cd=58; ENGINE.K&&0; }
      if(dist>26){ COMBAT.clear&&0; e.alive=false; rg.ethan=null; rg.t=Math.max(0,rg.next-40); } return; }
    if(e.state==='flee'){ step(e,e.x-dx*2,e.z-dz*2,2.2/16); e.face=Math.atan2(-dx,-dz); if(++e.fleeT>110){ e.alive=false; e.dying=1; rg.ethan=null; finish('ethan'); } } }
  // his blows land as hits, not damage: three and he runs (rgStrikeEthan)
  const cfg=world.combat.cfg, baseHit=cfg.onHit; cfg.onHit=d=>{ if(d.rogue){ if(d.state!=='fight') return false; d.hits++; d.hurt=14; COMBAT.pop(d.x,1.6,d.z,['Ow!','Aah!','OW!'][Math.min(2,d.hits-1)],'#ffd0a0');
      if(d.hits>=3){ d.state='flee'; d.fleeT=0; UI.toast('🏃 Ethan drops his stick… picks it back up… and runs off screaming.',2400); } return false; } return baseHit?baseHit(d):true; };
  // ── Ranger Cody, on his grey ──
  function cody(x,z){ const rider=addPerson({folk:[]},new THREE.Group(),'hunter',0,0,0,'Ranger Cody',null,{}).g; const g=horseModel({coat:['#8a8a90','#b4b4ba','#d8d8de'],mane:'#5a5a62',silk:'#5a3a22',silk2:'#c8402e'},rider);
    // V195: the new animals and the new bodies reach him too — his grey stallion rigged and moving, Cody himself on the base body, astride
    if(typeof ANIM3!=='undefined'&&ANIM3.on) ANIM3.dress(g,'horse',{tint:[0x6a6a72,0x9a9aa2,0xc8c8d0],rider});
    if(typeof BODY3!=='undefined'&&BODY3.on) BODY3.folk(rider);
    world.scene.add(g); const f={g,x,z,y:0,who:'Ranger Cody',rest:0,reach:0.6,still:true,lines:null,label:'Talk'}; world.folk.push(f); return f; }
  function codyLines(who){ const r=rr(); if(r.d>=R.need&&r.e>=R.need) return R.codyLines.arrest.map(strip); const n=Math.min(7,who==='dylan'?r.d:r.e); return (R.codyLines[who][n]||[`${who==='dylan'?'Dylan':'Ethan'} again? I’ll get him, knight.`]).map(strip); }
  function callCody(who){ const s=pick(9,12)||{x:P.x+6,z:P.z}; const f=cody(s.x,s.z); f.home={x:s.x,z:s.z}; f.who2=who; f.state='arrive'; f.t=0; f.mute=true; rg.cody=f; }
  function finish(who){ const r=rr(); if(who==='dylan') r.d=Math.min(R.need,r.d+1); else r.e=Math.min(R.need,r.e+1); rg.pending={who,t:1.7}; rg.t=0; rg.next=150+Math.random()*120; GAME.save(); }
  // ── the cell off Stormgate, and the pier out to it ──
  const J=R.jail, jail=group(J.x+J.w/2,0,J.y+J.h/2,world.scene); jail.visible=false;
  B(J.w,0.4,J.h,0x5a3a22,0,-0.3,0,jail); B(J.w-0.2,1.6,J.h-0.2,0x3a3a40,0,0.1,0,jail); for(let i=0;i<5;i++) B(0.06,1.4,0.06,0x8a8a92,-J.w/2+0.5+i*0.5,0.2,J.h/2-0.05,jail);
  const dyJ=addPerson({folk:[]},jail,'peasant',-0.5,0,0.3,'Dylan',null,{}).g, etJ=addPerson({folk:[]},jail,'woodcutter',0.6,0,0.2,'Ethan',null,{}).g; dyJ.position.y=0.1; etJ.position.y=0.1;
  const pier=group(0,0,0,world.scene); pier.visible=false; for(let y=J.pierY0;y<=J.pierY1;y++){ B(1,0.12,1,0x8a6a42,J.pierX+0.5,-0.1,y+0.5,pier); B(0.12,0.6,0.12,0x5a3a22,J.pierX+0.1,-0.6,y+0.5,pier); B(0.12,0.6,0.12,0x5a3a22,J.pierX+0.9,-0.6,y+0.5,pier); }
  const onPier=(x,z)=>rr().jailed&&Math.floor(x)===J.pierX&&z>=J.pierY0&&z<J.pierY1+1;
  const baseMove=world.canMove, baseGround=world.ground;
  world.canMove=(fx,fz,tx,tz)=>{ if(onPier(tx,tz)) return true; if(onPier(fx,fz)&&!onPier(tx,tz)&&Math.floor(tz)<J.pierY0) return baseMove(fx,fz,tx,tz)||world.WK(Math.floor(tx),Math.floor(tz)); return baseMove(fx,fz,tx,tz); };
  world.ground=(x,z)=>onPier(x,z)?0.02:baseGround(x,z);
  const jailSpot={x:J.x+J.w/2,z:J.y-0.2,r:1.6,label:'Visit',who:'The floating cell',action:()=>{ const r=rr(), set=R.jailTalks[(r.visits|0)%R.jailTalks.length]; r.visits=(r.visits|0)+1; GAME.save();
    const go=i=>{ if(i>=set.length) return; ENGINE.speak(set[i][0],[strip(set[i][1])],null,()=>go(i+1)); }; go(0); }};
  function arrest(){ const r=rr(); r.jailed=true; drop(rg.dylan); rg.dylan=null; if(rg.ethan){ rg.ethan.alive=false; rg.ethan=null; } rg.pending=null; GAME.save();
    UI.toast('🛡️ Livery unlocked: Ranger’s Watch — Dylan and Ethan await justice off Stormgate’s south shore. Change your livery at Home.',4600); }
  // ── each frame ──
  world.anim.push((t,dt)=>{ dt=dt||0.016; if(ENGINE.level!==world) return; const r=rr(), talking=!document.getElementById('say').hidden||UI.open;
    if(rg.ethan&&!world.combat.foes.includes(rg.ethan)) rg.ethan=null;   // the demons were respawned under him
    jail.visible=pier.visible=r.jailed; const ji=world.spots.indexOf(jailSpot); if(r.jailed){ if(ji<0) world.spots.push(jailSpot); } else if(ji>=0) world.spots.splice(ji,1);
    // after the arrest Cody patrols, aimless, and has a saying for anyone who stops him
    if(r.jailed){ if(!rg.patrol){ rg.patrol=cody(J.pierX+0.5,J.pierY0-1.5); rg.patrol.ang=Math.random()*6.283; rg.patrol.wait=0; rg.patrol.mute=false;
        rg.patrol.action=()=>{ rg.patrol.wait=4; ENGINE.speak('Ranger Cody',[strip(R.cody[(Math.random()*R.cody.length)|0])],rg.patrol); }; }
      const c=rg.patrol; if(!talking){ if(c.wait>0){ c.wait-=dt; c.g.userData.gallop(t,0,0); } else { if(Math.random()<0.002) c.wait=1.5+Math.random()*2.5; c.ang+=(Math.random()-0.5)*0.08;
        const ox=c.x, oz=c.z; step(c,c.x+Math.cos(c.ang)*2,c.z+Math.sin(c.ang)*2,0.9/16*60*dt); if(ox===c.x&&oz===c.z) c.ang+=Math.PI*(0.5+Math.random()); c.g.userData.gallop(t,0.4,0); } } place(c); }
    // a finished encounter: Cody arrives after a beat
    if(rg.pending&&!rg.cody&&!talking){ if((rg.pending.t-=dt)<=0){ const w=rg.pending.who; rg.pending=null; callCody(w); } }
    if(!r.jailed&&r.d>=R.need&&r.e>=R.need&&!rg.cody&&!rg.pending) rg.pending={who:'dylan',t:1.7};
    if(rg.cody){ const c=rg.cody;
      if(c.state==='arrive'&&!talking){ c.t+=dt; if(Math.hypot(c.x-P.x,c.z-P.z)<1.7||c.t>12){ c.state='talk'; c.face=Math.atan2(P.x-c.x,P.z-c.z); place(c);
          ENGINE.speak('Ranger Cody',codyLines(c.who2),null,()=>{ if(rr().d>=R.need&&rr().e>=R.need&&!rr().jailed) arrest(); c.state='leave'; c.t=0; }); }
        else { step(c,P.x,P.z,1.7/16*60*dt); c.g.userData.gallop(t,0.7,0); } }
      else if(c.state==='leave'){ c.t+=dt; step(c,c.home.x,c.home.z,2/16*60*dt); c.g.userData.gallop(t,0.8,0); if(c.t>4||Math.hypot(c.x-c.home.x,c.z-c.home.z)<0.2){ drop(c); rg.cody=null; } }
      if(rg.cody) place(c); }
    if(!active()) return;
    // Dylan bolting, or wandered off from
    if(rg.dylan){ const d=rg.dylan; if(d.stage==='flee'){ d.t+=dt; step(d,d.x+(d.x-P.x),d.z+(d.z-P.z),2.3/16*60*dt); place(d); if(d.t>1.8){ drop(d); rg.dylan=null; finish('dylan'); } }
      else if(d.stage==='sit'&&Math.hypot(d.x-P.x,d.z-P.z)>34){ drop(d); rg.dylan=null; rg.t=Math.max(0,rg.next-40); } }
    // the next one turns up
    if(talking) return; rg.t+=dt;
    if(rg.t>=rg.next&&!rg.pending&&!rg.dylan&&!rg.ethan&&!rg.cody){ const near=world.combat.foes.some(f=>f.alive&&!f.rogue&&Math.hypot(f.x-P.x,f.z-P.z)<8);
      const sail=world._sailing&&world._sailing.boating, cart=typeof tradeSystem!=='undefined'&&tradeSystem.current&&tradeSystem.current.driving;
      if(near||sail||cart){ rg.t=rg.next-10; return; }
      const opts=[]; if(r.d<R.need) opts.push('dylan'); if(r.e<R.need) opts.push('ethan'); opts.sort((a,b)=>(r[a[0]]-r[b[0]])+(Math.random()-0.5)*1.2);
      const who=opts[0]; if(who&&(who==='dylan'?spawnDylan():spawnEthan())){ rg.t=0; rg.next=150+Math.random()*120; } else rg.t=rg.next-10; } });
  // leaving the open ends an encounter in progress; one that had run counts, and Cody finds you when you come back
  const prevLeave=world.onLeave; world.onLeave=()=>{ if(rg.ethan){ const f=rg.ethan.state==='flee'; rg.ethan.alive=false; rg.ethan=null; if(f) finish('ethan'); }
    if(rg.dylan&&rg.dylan.stage==='flee'){ drop(rg.dylan); rg.dylan=null; finish('dylan'); }
    if(rg.cody){ if(rg.cody.state==='arrive') rg.pending={who:rg.cody.who2,t:1.7}; drop(rg.cody); rg.cody=null; } prevLeave&&prevLeave(); };

  // ── the doodles ──
  if(DD&&DD.at){ const loader=new THREE.TextureLoader();
    DD.at.forEach(d0=>{ const spr=DD.spr[d0.kind]; if(!spr) return; const tex=loader.load(spr.src); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestFilter; tex.repeat.set(1/4,1);
      const h=spr.fh/16*0.95, w=spr.fw/16*0.95, m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:0.4,side:THREE.DoubleSide}));
      const g=new THREE.Group(); m.position.y=h/2; g.add(m); world.scene.add(g); const sh=new THREE.Mesh(new THREE.CircleGeometry(0.32,12),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.18,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=0.02; g.add(sh);
      const f={g,x:d0.x+0.5,z:d0.y+0.5,y:0,who:'???',rest:0,still:true,lines:null,label:'Talk',ang:d0.ang,sp:d0.sp,wait:0,stare:0,frame:0,ft:0,tex,m};
      f.action=()=>{ f.stare=3.3; ENGINE.speak('???',['… stares blankly into your soul …'],f); }; world.folk.push(f); });
    const doodles=world.folk.filter(f=>f.tex);
    world.anim.push((t,dt)=>{ dt=dt||0.016; if(ENGINE.level!==world) return; const cam=ENGINE.cam;
      doodles.forEach(d=>{ let moving=false; if(d.stare>0) d.stare-=dt; else if(d.wait>0) d.wait-=dt; else if(Math.random()<0.003) d.wait=1+Math.random()*3.3;
        else { d.ang+=(Math.random()-0.5)*0.12; const v=d.sp/16*60*dt, ox=d.x, oz=d.z; const nx=d.x+Math.cos(d.ang)*v, nz=d.z+Math.sin(d.ang)*v; let bump=false;
          if(world.walkTile(Math.floor(nx),Math.floor(d.z))&&world.T(Math.floor(nx),Math.floor(d.z))!==39&&world.T(Math.floor(nx),Math.floor(d.z))!==40) d.x=nx; else bump=true;
          if(world.walkTile(Math.floor(d.x),Math.floor(nz))&&world.T(Math.floor(d.x),Math.floor(nz))!==39&&world.T(Math.floor(d.x),Math.floor(nz))!==40) d.z=nz; else bump=true;
          if(bump) d.ang+=Math.PI*(0.5+Math.random()); moving=d.x!==ox||d.z!==oz; if(Math.abs(Math.cos(d.ang))>0.05) d.flip=Math.cos(d.ang)<0; }
        if(moving){ d.ft+=dt; if(d.ft>0.2){ d.ft=0; d.frame=(d.frame+1)%4; } } else d.frame=0;
        d.tex.offset.x=d.frame/4; d.m.scale.x=d.flip?-1:1; d.g.position.set(d.x,world.ground(d.x,d.z),d.z); d.g.rotation.y=Math.atan2(cam.position.x-d.x,cam.position.z-d.z); d.g.scale.setScalar(VIEWMODE.ps(world)<1?0.6:1); }); }); }
  return rg;
}
