// ════════════════════════════════════════════════════════════════
//  PASTIMES — what a knight does between chapels (tools/extract_pastimes.py → data/pastimes.json):
//   🎣 fishing: face any fishable water (FISH_SPOTS, or fishZoneAt's sea / swamp / oasis / pond rule), cast,
//      wait for the bite (1–4 s), reel inside ¾ s; the zone's table decides the fish; while Eldan's trial is
//      open, 28% of good bites are the Golden Fish. Walk off more than two tiles and the line is lost.
//   🧺 the Homestead farm stand: sell all produce and fish at GOODS prices (× gold bonus); goods traded
//      unlock the Harvest liveries (40 / 120 / 250 / 400).
//   🌾 farming: the Homestead's tilled plots; sow any seed you carry, four stages at CROPS[k].ms each,
//      harvest CROPS[k].yield of the produce. Crops keep growing while you're away (wall-clock time).
//   🏄 surfing at Saltmere's surf (tile 21): the Knight's Wave, the game's rules and scoring, drawn in 3D.
//   ⛵ the Saltmere regatta: the game's own regatta module (data/regatta.js, verbatim), on its own canvas.
//  pastimes(world, D) — call once the world level exists.
// ════════════════════════════════════════════════════════════════
function pastimes(world,D){
  const S=()=>GAME.S, P=ENGINE.P, now=()=>performance.now();
  const GOODS=D.goods, inv=()=>S().inventory;

  // ── 🎣 fishing ──
  const desert=(x,y)=>x>=SX(78)&&x<=SX(107)&&y>=SY(56)&&y<=SY(82), sage=(x,y)=>x>=SX(84)&&x<=SX(95)&&y>=SY(165)&&y<=SY(176);
  function zoneAt(x,y){ const k=D.fishSpots[x+','+y]; if(k) return k; const t=world.T(x,y);
    if(t===20||t===21) return 'sea'; if(t===29) return 'forest'; if(t===3) return desert(x,y)?'oasis':sage(x,y)?'forest':'pond'; return null; }
  let fishing=null; const fishSpot={x:0,z:0,r:0.2,label:'Fish',who:'Water',holdOK:true};
  const bob=new THREE.Group(); Sp(0.09,0xd83a2a,0,0,0,bob,8,6); Sp(0.06,0xf4f4f4,0,0.08,0,bob,8,6); bob.visible=false; world.scene.add(bob);
  const lineGeo=new THREE.BufferGeometry(); lineGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0],3));
  const line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:0xe8e8e8})); line.visible=false; line.frustumCulled=false; world.scene.add(line);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.1,0.16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false})); ring.rotation.x=-Math.PI/2; world.scene.add(ring);
  // V129: FISHING AS REST — you sit down on the bank, take out the rod and cast. Then you wait: the float rides the water, the
  //  day goes on about you, and you mend a little while you sit. A bite comes in its own time (a few seconds to a quarter of a
  //  minute); the float dips, the rod bows — and you reel. Now and then, while you wait, a verse about waiting comes to mind.
  //  Stand up with the button, or push the stick, whenever you like.
  const WAITV=[['Psalm 46:10','Be still, and know that I am God.'],['Isaiah 40:31','They that wait upon the LORD shall renew their strength.'],['Psalm 37:7','Rest in the LORD, and wait patiently for him.'],
    ['Lamentations 3:25','The LORD is good unto them that wait for him.'],['Matthew 4:19','Follow me, and I will make you fishers of men.'],['Psalm 23:2','He leadeth me beside the still waters.'],['James 5:7','Be patient therefore, brethren… the husbandman waiteth for the precious fruit of the earth.']];
  /* V132: weather that matters — in rain the fish bite sooner (wetK), and the rain waters the fields */
  const raining=()=>{ const w=world.weather&&world.weather.now; return !!(w&&(w.kind==='rain'||w.kind==='storm')&&w.amount>0.3); };
  const wetK=()=>raining()?0.55:1; let wetSaid=false;
  const tipV=new THREE.Vector3();
  // V131: the catch, seen — the fish leaps out of the water on the line, swings up to the rod tip and hangs there wriggling,
  //  gleaming, before it goes into the creel
  const FCOL={perch:[0x7a8a3a,0xd8a040],trout:[0x8a8a7a,0xd87a8a],oasisCarp:[0xd8a040,0xf2d070],seabass:[0x6a7a8a,0xc8d0d8],kingfish:[0x3a5a9a,0xd8e0f0],goldenFish:[0xe8b830,0xfff0a0]};
  const fishM=new THREE.Group(); fishM.visible=false; world.scene.add(fishM); const fBody=new THREE.MeshLambertMaterial({color:0x8a8a7a}), fBelly=new THREE.MeshLambertMaterial({color:0xd8d8c8});
  { const b=new THREE.Mesh(new THREE.SphereGeometry(0.14,10,8),fBody); b.scale.set(0.55,0.75,1.6); fishM.add(b); const bl=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),fBelly); bl.scale.set(0.5,0.5,1.4); bl.position.y=-0.04; fishM.add(bl);
    const tail=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.18,4),fBody); tail.rotation.x=-Math.PI/2; tail.position.z=-0.27; tail.scale.x=0.25; fishM.add(tail); fishM.userData.tail=tail;
    const fin=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.12,3),fBody); fin.position.set(0,0.12,0.02); fin.scale.z=1.8; fishM.add(fin);
    for(const sx of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.022,6,4),new THREE.MeshBasicMaterial({color:0x101010})); e.position.set(sx*0.07,0.03,0.17); fishM.add(e); } }
  const splash=[]; for(let i=0;i<10;i++){ const d=Sp(0.04,0xdff4ff,0,0,0,world.scene,6,4); d.visible=false; splash.push({m:d,vx:0,vy:0,vz:0}); }
  let showT=-1, from=new THREE.Vector3();
  function showFish(kind){ const c=FCOL[kind]||FCOL.trout; fBody.color.setHex(c[0]); fBelly.color.setHex(c[1]); fBody.emissive=new THREE.Color(kind==='goldenFish'?0x5a4010:0x000000);
    from.copy(bob.position); showT=0; fishM.visible=true; splash.forEach(q=>{ q.m.visible=true; q.m.position.copy(bob.position); const a=Math.random()*6.28, sp=0.8+Math.random()*1.4; q.vx=Math.cos(a)*sp; q.vz=Math.sin(a)*sp; q.vy=2+Math.random()*2; }); }
  world.anim.push((t,dt)=>{ dt=dt||0.016; splash.forEach(q=>{ if(!q.m.visible) return; q.vy-=9*dt; q.m.position.x+=q.vx*dt; q.m.position.y+=q.vy*dt; q.m.position.z+=q.vz*dt; if(q.m.position.y<-0.3) q.m.visible=false; });
    if(showT<0) return; showT+=dt; ENGINE.K.poleTip(tipV); const hang=new THREE.Vector3(tipV.x,tipV.y-0.55,tipV.z);
    if(showT<0.55){ const u=showT/0.55; fishM.position.lerpVectors(from,hang,u); fishM.position.y+=Math.sin(u*Math.PI)*0.9; fishM.rotation.set(-1.2+u*1.2,0,Math.sin(t*30)*0.6); }
    else if(showT<2.2){ fishM.position.copy(hang); fishM.rotation.set(-Math.PI/2+0.2,Math.sin(t*3)*0.5,Math.sin(t*18)*0.5*Math.max(0,1-(showT-0.55)/1.4)); fishM.userData.tail.rotation.y=Math.sin(t*26)*0.6; }
    else { fishM.visible=false; showT=-1; }
    const a=lineGeo.attributes.position.array; if(showT>=0){ line.visible=true; a[0]=tipV.x; a[1]=tipV.y; a[2]=tipV.z; a[3]=fishM.position.x; a[4]=fishM.position.y+0.2; a[5]=fishM.position.z; lineGeo.attributes.position.needsUpdate=true; } });
  function endFish(){ if(fishing&&fishing.sat){ ENGINE.hold(0); ENGINE.K.fishBend=0; } fishing=null; bob.visible=line.visible=false; ring.material.opacity=0; fishM.visible=false; showT=-1; }
  fishSpot.action=()=>{ if(!fishing&&ENGINE.holding) return; if(!fishing){ const x=fishSpot.tx, y=fishSpot.ty, z=zoneAt(x,y); if(!z) return;
      // sit on the bank, facing the water, and cast the float out a couple of paces
      const fa=Math.atan2(x+0.5-P.x,y+0.5-P.z); P.face=fa; ENGINE.hold(9999,'fish');
      let bx=x+0.5+Math.sin(fa)*1.2, bz=y+0.5+Math.cos(fa)*1.2; if(!zoneAt(Math.floor(bx),Math.floor(bz))){ bx=x+0.5; bz=y+0.5; }
      fishing={phase:'cast',t0:now(),biteAt:(3500+Math.random()*9000)*wetK(),fx:x,fy:y,zone:z,sat:true,px:P.x,pz:P.z,face:fa,bx,bz,heal:0,verse:6000+Math.random()*4000};
      bob.position.set(P.x,P.y+1.2,P.z); bob.visible=line.visible=true; UI.toast('🎣 You sit down on the bank and cast your line.',1600); return; }
    if(fishing.phase==='bite'){ const q=S().quests||{}; ENGINE.K.fishBend=1;
      if(q.goldenFish==='active'&&(inv().goldenFish||0)<1&&Math.random()<0.28){ inv().goldenFish=1; fishing.kind='goldenFish'; GAME.save(); UI.toast('🪙 A Golden Fish! It gleams in the light — surely the one Eldan spoke of.',2600); }
      else { const tb=D.fishZones[fishing.zone]||D.fishZones.pond; let tot=tb.reduce((s,e)=>s+e[1],0), r=Math.random()*tot, pick=tb[0][0]; for(const [k,w] of tb){ if(r<w){ pick=k; break; } r-=w; }
        inv()[pick]=(inv()[pick]||0)+1; const g=GOODS[pick]; UI.toast(`${g.emoji} You caught a ${g.name}! (worth ${g.value}g)`,1700); fishing.kind=pick; }
      GAME.changed(); fishing.phase='landed'; fishing.t0=now(); showFish(fishing.kind); return; }
    if(fishing.phase==='landed'){ endFish(); return; }
    UI.toast('🎣 You reel in and stand up.',1000); endFish(); };
  // the stick: pushing it while you sit stands you up
  let standT=0;
  world.anim.push(t=>{ if(ENGINE.level!==world){ if(fishing) endFish(); return; }
    const L=world.spots, i=L.indexOf(fishSpot);
    if(fishing){ const tt=now()-fishing.t0, dt=0.016;
      if(fishing.sat){ P.x=fishing.px; P.z=fishing.pz; P.face=fishing.face; }
      const mv=ENGINE.moveInput&&ENGINE.moveInput(); if(mv&&Math.hypot(mv.x,mv.z)>0.5){ standT+=dt; if(standT>0.25){ standT=0; UI.toast('🎣 You reel in and stand up.',1000); endFish(); return; } } else standT=0;
      if(fishing.phase==='cast'){ const u=Math.min(1,tt/700); ENGINE.K.poleTip(tipV); bob.position.set(tipV.x+(fishing.bx-tipV.x)*u,tipV.y+(-0.22-tipV.y)*u+Math.sin(u*Math.PI)*1.2,tipV.z+(fishing.bz-tipV.z)*u); if(u>=1){ fishing.phase='wait'; fishing.t0=now(); } }
      else if(fishing.phase==='wait'){ if(tt>=fishing.biteAt){ fishing.phase='bite'; fishing.t0=now(); UI.toast('❗ A bite! Reel it in!',1000); }
        // resting: a little mending while you sit, and now and then a verse about waiting
        fishing.heal+=dt; if(fishing.heal>2.5){ fishing.heal=0; const s=S(); if(s.hp<s.maxHp){ s.hp=Math.min(s.maxHp,s.hp+Math.max(1,Math.round(s.maxHp*0.02))); ENGINE.hud&&ENGINE.hud(); } }
        if(tt>fishing.verse&&!fishing.said){ fishing.said=true; const v=WAITV[(Math.random()*WAITV.length)|0]; UI.toast(`🌿 “${v[1]}” — ${v[0]}`,3800); } }
      else if(fishing.phase==='bite'&&tt>1100){ UI.toast('🎣 The fish got away… cast again when you’re ready.',1400); fishing.phase='wait'; fishing.t0=now(); fishing.biteAt=(3500+Math.random()*9000)*wetK(); fishing.said=false; fishing.verse=6000+Math.random()*5000; }
      else if(fishing.phase==='landed'){ ENGINE.K.fishBend=Math.max(0,0.6-tt/2400); if(tt>2300){ fishing.phase='wait'; fishing.t0=now(); fishing.biteAt=(3500+Math.random()*9000)*wetK(); fishing.said=false; fishing.verse=6000+Math.random()*5000; ENGINE.K.poleTip(tipV); fishing.cast2=true; } }
      const bite=fishing.phase==='bite'; ENGINE.K.fishBend=bite?0.55+Math.sin(t*22)*0.25:fishing.phase==='landed'?ENGINE.K.fishBend:0;
      if(fishing.phase!=='cast'){ bob.position.set(fishing.bx,-0.22+(bite?-0.08+Math.sin(t*30)*0.05:Math.sin(t*2.5)*0.025),fishing.bz); }
      bob.visible=fishing.phase!=='landed';
      ring.position.set(bob.position.x,-0.24,bob.position.z); ring.material.opacity=fishing.phase==='cast'?0:bite?0.6:0.15; ring.scale.setScalar(1+((t*1.5)%1)*2);
      if(showT<0){ ENGINE.K.poleTip(tipV); const a=lineGeo.attributes.position.array; a[0]=tipV.x; a[1]=tipV.y; a[2]=tipV.z; a[3]=bob.position.x; a[4]=bob.position.y+0.1; a[5]=bob.position.z; lineGeo.attributes.position.needsUpdate=true; } line.visible=fishing.phase!=='landed'||showT>=0;
      fishSpot.label=bite?'Reel!':fishing.phase==='landed'?'Stand':'Stand'; fishSpot.x=P.x; fishSpot.z=P.z; if(i<0) L.push(fishSpot); return; }
    // facing water from the shore: offer a cast
    const fx=Math.floor(P.x+Math.sin(P.face)*0.9), fz=Math.floor(P.z+Math.cos(P.face)*0.9), here=world.T(Math.floor(P.x),Math.floor(P.z));
    const z=(here!==3&&here!==29)?zoneAt(fx,fz):null;
    if(z&&!(world.combat&&world.combat.foes.some(f=>f.alive&&Math.hypot(f.x-P.x,f.z-P.z)<4))){ fishSpot.tx=fx; fishSpot.ty=fz; fishSpot.x=P.x; fishSpot.z=P.z; fishSpot.label='Fish'; fishSpot.who=({sea:'The sea',pond:'The pond',oasis:'The oasis',forest:'Still water'})[z]; if(i<0) L.push(fishSpot); }
    else if(i>=0) L.splice(i,1); });

  // ── 🧺 the farm stand ──
  if(D.sellSpot){ const [sx,sy]=D.sellSpot.split(',').map(Number);
    world.spots.push({x:sx+0.5,z:sy+0.5,r:1.0,label:'Sell',who:'Farm Stand',action:()=>{ let earned=0, sold=0; const lines=[], s=S();
      for(const k in GOODS){ if(k==='goldenFish'||k==='sacredScroll'||D.materials.includes(k)) continue; const n=inv()[k]||0; if(n>0){ const sub=n*GOODS[k].value; earned+=sub; sold+=n; lines.push(`${GOODS[k].emoji}${n} ${GOODS[k].name} → ${sub}g`); inv()[k]=0; } }
      if(!earned){ ENGINE.speak('Farm Stand',[`Nothing to sell yet — grow wheat or catch fish first! You have ${s.gold} gold.`]); return; }
      earned=Math.round(earned*s.goldMult); const was=s.tradeSold||0; s.tradeSold=was+sold; GAME.addGold(earned); GAME.save();
      const nl=Object.entries(SYS.LIVERIES).filter(([k,L])=>!L.flag&&L.req&&was<L.req&&s.tradeSold>=L.req).map(([k,L])=>`🧵 New livery: ${L.name} — wear it from ☰ Home.`);
      ENGINE.speak('Farm Stand',[`Sold ${sold} goods for ${earned}g!`,lines.join('\n'),...nl]); }}); }

  // ── 🌾 the Homestead's fields ──
  const crops=()=>S().crops||(S().crops={});
  const cropGroups={};
  const stageOf=c=>Math.min(3,Math.floor((Date.now()-c.plantedAt)/D.crops[c.type].ms));
  function cropMesh(k,stage){ const g=new THREE.Group(); const col={wheat:0xe0c050,mustard:0xd8e040,barley:0xd8b870,grape:0x7a3a8a}[k]||0xe0c050;
    for(let i=0;i<5;i++){ const x=(i%3-1)*0.28+(i>2?0.14:0), z=(i<3?-0.18:0.18), h=[0.08,0.22,0.4,0.6][stage];
      Cy(0.02,0.03,h,4,stage<3?0x5a9a3a:0x8aa040,x,0,z,g); if(stage>=2) Sp(stage===3?0.07:0.04,stage===3?col:0x8aba5a,x,h,z,g,5,4); }
    return g; }
  function showCrop(key){ const old=cropGroups[key]; if(old){ world.scene.remove(old.g); delete cropGroups[key]; } const c=crops()[key]; if(!c) return;
    const [x,y]=key.split(',').map(Number), st=stageOf(c), g=cropMesh(c.type,st); g.position.set(x+0.5,world.ground(x+0.5,y+0.5),y+0.5); world.scene.add(g); cropGroups[key]={g,st}; }
  D.plots.forEach(([x,y])=>{ const key=x+','+y;
    world.spots.push({x:x+0.5,z:y+0.5,r:0.55,label:'Field',who:'A tilled plot',action:()=>{ const c=crops()[key];
      if(!c){ const owned=D.cropOrder.filter(k=>(inv()[D.crops[k].seed]||0)>0);
        if(!owned.length){ UI.toast('🌱 Your seed pouch is empty — seed is sold at any village shop.',1800); return; }
        UI.sheet({title:'🌱 Sow',short:true,html:owned.map(k=>{ const C=D.crops[k]; return `<button class="gm-item" data-act="${k}"><span>${C.emoji} ${C.name} ×${inv()[C.seed]} <span class="ds">ripe in ${Math.round(C.ms*3/1000)}s · ${C.yield} a plot</span></span></button>`; }).join(''),
          act:k=>{ const C=D.crops[k]; if(!(inv()[C.seed]>0)) return; inv()[C.seed]--; crops()[key]={type:k,plantedAt:Date.now()}; UI.close(); showCrop(key); if(ENGINE.K.act&&ENGINE.K.act('plant',3.0,{arms:true})) ENGINE.hold(3.0,'plant');   /* V139: he kneels and sows it */ GAME.changed(); GAME.save(); ENGINE.speak(`Sown: ${C.name}`,[`${inv()[C.seed]} left.`,C.verse]); }}); return; }
      const C=D.crops[c.type]; if(stageOf(c)>=3){ delete crops()[key]; inv()[C.produce]=(inv()[C.produce]||0)+C.yield; showCrop(key); GAME.changed(); GAME.save();
        UI.toast(`${GOODS[C.produce].emoji} Harvested ${C.name} ×${C.yield}! (you have ${inv()[C.produce]})`,1600); return; }
      UI.toast(`${C.emoji} ${C.name}, still growing… (${Math.max(1,Math.ceil((c.plantedAt+C.ms*3-Date.now())/1000))}s)`,1000); }}); });
  let cropT=0; world.anim.push((t,dt)=>{ cropT+=dt||0.016; if(cropT<1) return; cropT=0;
    if(raining()&&ENGINE.level===world){ const P=ENGINE.P; let n=0; for(const key in crops()){ const [cx,cy]=key.split(',').map(Number); if(Math.hypot(cx-P.x,cy-P.z)<45){ crops()[key].plantedAt-=600; n++; } }
      if(n&&!wetSaid){ wetSaid=true; UI.toast('🌧 The rain waters your fields — the crops grow faster while it falls.',2600); } }
    for(const key in crops()){ const cg=cropGroups[key], st=stageOf(crops()[key]); if(!cg||cg.st!==st){ showCrop(key); if(st===3&&Math.hypot(+key.split(',')[0]-P.x,+key.split(',')[1]-P.z)<12) UI.toast(`${D.crops[crops()[key].type].emoji} ${D.crops[crops()[key].type].name} is ripe for harvest!`,1300); } }
    for(const key in cropGroups) if(!crops()[key]) showCrop(key); });
  GAME.on(()=>{ for(const key in cropGroups) if(!crops()[key]) showCrop(key); });

  // ── 🏄 the Knight's Wave ──
  const surfAt=new Set(D.surf.map(([x,y])=>x+','+y));
  { const seen=new Set(); D.surf.forEach(([x,y])=>{ const k=Math.floor(x/4)+','+Math.floor(y/3); if(seen.has(k)) return; seen.add(k);
      world.spots.push({x:x+0.5,z:y+0.5,r:1.6,label:'Surf',who:'The surf',action:()=>{ surfFrom={x:P.x,z:P.z,face:P.face+Math.PI}; ENGINE.go('surf'); }}); }); }
  let surfFrom=null;
  ENGINE.add({id:'surf',lazy:()=>surfLevel()});
  function surfLevel(){ const scene=new THREE.Scene(); scene.background=new THREE.Color(0x5a3a7a); scene.fog=new THREE.Fog(0x8a5a7a,30,60);
    const SW=16, SH=9, X=x=>x-SW/2, Y=y=>SH-y;    // the 2D game's screen, laid on the x–y plane
    const sky=new THREE.Mesh(new THREE.PlaneGeometry(60,30),new THREE.MeshBasicMaterial({vertexColors:true,fog:false})); { const c=[], col=new THREE.Color(); const pa=sky.geometry.attributes.position;
      for(let i=0;i<pa.count;i++){ const f=(pa.getY(i)+15)/30; col.set(0xc98a6a).lerp(new THREE.Color(0x2a1a4a),f); c.push(col.r,col.g,col.b); } sky.geometry.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); }
    sky.position.set(0,6,-14); scene.add(sky);
    const sun=new THREE.Mesh(new THREE.CircleGeometry(0.75,24),new THREE.MeshBasicMaterial({color:0xf4c87a,fog:false})); sun.position.set(X(SW*0.72),Y(SH*0.36),-13); scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xffe0c8,0x203050,0.8)); const dl=new THREE.DirectionalLight(0xffd8b0,0.6); dl.position.set(4,6,8); scene.add(dl);
    // two wave sheets rebuilt each frame from the game's own profile (back, then front)
    const N=64; const sheet=(c0,c1,z)=>{ const geo=new THREE.PlaneGeometry(1,1,N,6); const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); m.frustumCulled=false; m.position.z=z; scene.add(m);
      const cols=[]; const ca=new THREE.Color(c0), cb=new THREE.Color(c1); for(let j=0;j<=6;j++) for(let i=0;i<=N;i++){ const c=ca.clone().lerp(cb,j/6); cols.push(c.r,c.g,c.b); } geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3)); return m; };
    const back=sheet(0x1e5a8a,0x0e3050,-1.2), front=sheet(0x3aa0c8,0x0c3a60,0);
    function profile(mesh,t,build,off,ampR,ampL){ const pa=mesh.geometry.attributes.position, waveTop=SH*0.42-SH*0.094*build;
      for(let j=0;j<=6;j++) for(let i=0;i<=N;i++){ const p=i/N, x=p*SW, roll=Math.sin(p*Math.PI*1.1-t*0.0016)*SH*ampR*build, lift=(1-p)*SH*ampL*build, top=waveTop+off+roll-lift+SH*0.125*(1-build);
        const f=j/6, y=top+(SH-top)*f, k=j*(N+1)+i; pa.setXYZ(k,X(x),Y(y),-(1-f)*(0.6+(1-p)*1.4)*build); } pa.needsUpdate=true; mesh.geometry.computeVertexNormals(); return waveTop; }
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(80,40),new THREE.MeshLambertMaterial({color:0x0c3a60})); sea.rotation.x=-Math.PI/2; sea.position.set(0,0,-10); scene.add(sea);
    const tube=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0x061a2e,transparent:true})); tube.position.z=0.05; scene.add(tube);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(1,0.08,6,24,Math.PI),new THREE.MeshBasicMaterial({color:0xeaf6ff,transparent:true})); lip.position.z=0.1; scene.add(lip);
    const spray=[]; for(let i=0;i<26;i++){ const s=Sp(0.12,glow(0xeaf6ff),0,0,0.15,scene,6,4); spray.push(s); }
    const foamPool=[]; for(let i=0;i<60;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.07,5,4),new THREE.MeshBasicMaterial({color:0xebf6ff,transparent:true})); m.visible=false; scene.add(m); foamPool.push(m); }
    const rider=new THREE.Group(); scene.add(rider); const kn=COMBAT.knightModel(); kn.scale.setScalar(0.62); kn.position.y=0.12; rider.add(kn);
    const board=B(1.3,0.08,0.34,0xe0b050,0,0,0,rider); B(1.32,0.02,0.36,0x8a5f22,0,-0.01,0,rider);
    const hud=$('hudMg'), call=$('call');
    const lv={id:'surf',name:'The Knight’s Wave',scene,folk:[],spots:[],anim:[],cam:{pitch:0,dist:12},
      custom:{ knight:false, buttons:[{id:'B',label:'CUTBACK'},{id:'A',label:'RIDE',big:true}],
        onEnter(){ const s=S(); kn.dress(s);
          g={phase:'lineup',score:0,combo:0,wavesRidden:0,bestTrick:0,barrelsMade:0,surferX:0.5,surferY:0.55,dir:1,inAir:false,airT:0,cutFlash:0,waveLife:0,waveDur:12000,buildT:0,fadeT:0,riding:false,foam:[],isBarrelWave:false,barrelOpen:0,tucked:false,tuckT:0,barrelScored:false,trick:null,awarded:false,tier:null,newBest:false};
          flash(`🏄 The Knight's Wave — a ${D.surfWaves}-wave set rolls in!`); },
        tick(dt,t,input){ dt*=1000; if(input.pressed.A) press('A'); if(input.pressed.B) press('B'); update(dt,input); draw(t*1000); },
        camera(cam,dt){ const half=Math.tan(cam.fov*Math.PI/360)*12.5*cam.aspect, lim=Math.max(0,SW/2-half-0.1), want=Math.max(-lim,Math.min(lim,rider.position.x));
          camX+=(want-camX)*Math.min(1,(dt||0.016)*3); cam.position.set(camX,4.4,12.5); cam.lookAt(camX,4.2,0); } } };
    let camX=0;
    let g=null; const TR=D.surfTricks;
    const flash=(txt)=>{ call.textContent=txt; call.style.opacity=1; clearTimeout(flash.t); flash.t=setTimeout(()=>call.style.opacity=0,1100); };
    const add=(pts,name)=>{ g.score+=pts; if(pts>g.bestTrick) g.bestTrick=pts; if(name){ g.trick={text:name,pts,t:1000}; flash(name+(pts?' +'+pts:'')); } };
    function start(){ Object.assign(g,{surferX:0.5,surferY:0.55,dir:1,inAir:false,airT:0,cutFlash:0,waveLife:0,waveDur:10000+Math.random()*10000,buildT:0,fadeT:0,riding:false,combo:0,foam:[],isBarrelWave:Math.random()<0.55,barrelOpen:0,tucked:false,tuckT:0,barrelScored:false,phase:'building'}); }
    function results(){ g.phase='results'; g.tier=D.surfTiers.find(t=>g.score>=t.min); if(!g.awarded){ g.awarded=true; const s=S(); GAME.addGold(g.tier.gold); const r=GAME.gainXp(g.tier.xp); if(g.tier.sp) s.skillPoints+=g.tier.sp; g.newBest=g.score>(s.surfBest||0); if(g.newBest) s.surfBest=g.score; GAME.save(); } }
    function leave(){ const t=g.tier||D.surfTiers[D.surfTiers.length-1]; ENGINE.go('world',surfFrom||world.spawn); setTimeout(()=>UI.toast(`🏄 ${t.name} — ${g.score} GRACE · +${t.gold}g · +${t.xp} XP${t.sp?` · ⭐ +${t.sp} skill point`:''}${g.newBest?' · NEW BEST!':''}`,3400),450); }
    function press(k){ if(g.phase==='lineup'){ if(k==='A') start(); else results(); return; } if(g.phase==='results'){ leave(); return; }
      if(g.phase==='building'){ g.riding=true; g.phase='drop'; add(50,TR.drop); return; } if(g.phase!=='drop'||g.inAir) return;
      if(k==='B'){ g.dir=-g.dir; g.cutFlash=220; g.combo++; add(30+g.combo*10,TR.cutback+' ×'+g.combo); }
      if(k==='A'){ if(g.tucked) return; if(g.surferY<0.22){ g.inAir=true; g.airT=0; g.combo++; add(100+g.combo*25,TR.air); } else add(0,TR.missLip); } }
    function update(dt,input){ if(!g) return;
      if(g.phase==='building'){ g.buildT+=dt; if(g.buildT>4500){ g.riding=true; g.phase='drop'; } }
      if(g.phase==='drop'){ g.waveLife+=dt; g.barrelOpen=g.isBarrelWave?Math.max(0,(Math.sin(g.waveLife*0.0013)*0.5+0.5)-0.35)/0.65:0;
        if(g.inAir){ g.airT+=dt; if(g.airT>=700){ g.inAir=false; g.surferY=0.3; add(40,TR.land); } }
        else { const sp=0.0011*dt; if(input.y<-0.3) g.surferY-=sp; if(input.y>0.3) g.surferY+=sp; if(input.x<-0.3) g.surferX-=sp*1.1; if(input.x>0.3) g.surferX+=sp*1.1;
          if(g.cutFlash>0){ g.cutFlash-=dt; g.surferX+=g.dir*0.0016*dt; } else g.surferX+=g.dir*0.00018*dt;
          g.surferX=Math.max(0.06,Math.min(0.94,g.surferX)); g.surferY=Math.max(0.05,Math.min(0.92,g.surferY));
          const inPocket=g.surferY<0.34&&g.surferX<0.5, was=g.tucked; g.tucked=g.barrelOpen>0.35&&inPocket;
          if(g.tucked){ g.tuckT+=dt; if(!g.barrelScored&&g.tuckT>250){ g.barrelScored=true; g.combo++; g.barrelsMade++; add(150+g.combo*20,TR.barrel); } if(Math.random()<0.06) add(3); }
          else { if(was&&g.barrelScored&&g.tuckT>250) add(60,'MADE IT OUT!'); g.tuckT=0; g.barrelScored=false; }
          if(g.surferY<0.3&&Math.random()<0.04) add(2); }
        if(Math.random()<0.5) g.foam.push({x:g.surferX,y:g.surferY,vx:-g.dir*(0.4+Math.random()),life:1}); if(g.waveLife>g.waveDur){ g.fadeT=0; g.tucked=false; g.phase='fade'; } }
      if(g.phase==='fade'){ g.fadeT+=dt; if(g.fadeT>1600){ g.wavesRidden++; if(g.wavesRidden>=D.surfWaves) results(); else g.phase='lineup'; } }
      g.foam.forEach(f=>{ f.x+=f.vx*0.004; f.life-=dt/700; }); g.foam=g.foam.filter(f=>f.life>0).slice(-60); }
    function draw(t){ if(!g) return; let build=g.phase==='building'?0.45+Math.min(0.55,g.buildT/4500*0.55):(g.phase==='lineup'||g.phase==='results')?0.4:1; const fade=g.phase==='fade'?Math.max(0,1-g.fadeT/1600):1;
      profile(back,t,build,0,0.031,0.081); const waveTop=profile(front,t,build,SH*0.056,0.025,0.056); back.material.opacity=front.material.opacity=1;
      const mapY=y01=>{ const top=waveTop+SH*0.05, bot=SH-SH*0.075; return top+(bot-top)*y01; };
      const open=g.phase==='drop'&&g.isBarrelWave?g.barrelOpen:0; tube.visible=lip.visible=open>0.1;
      if(tube.visible){ const tcx=SW*0.30, tcy=waveTop+SH*0.106, tw=SW*0.25*open, th=SH*0.219*open; tube.position.set(X(tcx),Y(tcy),0.2); tube.scale.set(tw*0.55,th*0.6,1); tube.material.opacity=0.85*fade;
        lip.position.set(X(tcx),Y(tcy),0.25); lip.scale.set(tw*0.62,th*0.7,1); lip.rotation.z=Math.PI*0.05; }
      const curlX=(Math.sin(t*0.0011)*0.5+0.5)*SW*0.5;
      spray.forEach((s,i)=>{ const x=curlX-i*0.3+Math.sin(t*0.004+i)*0.2, p=Math.max(0,Math.min(1,x/SW)), lift=(1-p)*SH*0.081*build, y=waveTop-lift+SH*0.125*(1-build)+Math.sin(i*1.3+t*0.005)*0.25;
        s.visible=x>0; s.position.set(X(x),Y(y),0.1); s.scale.setScalar((4-(i%3))/4*fade); });
      foamPool.forEach((m,i)=>{ const f=g.foam[i]; m.visible=!!f; if(f){ m.position.set(X(f.x*SW),Y(mapY(f.y)),0.3); m.scale.setScalar(1+f.life); m.material.opacity=f.life*0.8*fade; } });
      const riding=g.phase==='drop'||g.phase==='fade'; rider.visible=true;
      if(riding){ rider.position.set(X(g.surferX*SW),Y(mapY(g.surferY))+(g.inAir?Math.sin(g.airT/700*Math.PI)*1.2:0),0.45); rider.rotation.set(0,g.dir>0?Math.PI/2:-Math.PI/2,0); rider.rotation.z=g.inAir?-Math.sin(g.airT/700*Math.PI)*0.5*g.dir:0; kn.animate(0.016,'idle',0); }
      else { rider.position.set(X(SW*0.5),Y(SH*0.82),1.2); rider.rotation.set(0,Math.PI/2,0); kn.animate(0.016,'walk',0.4); }
      hud.innerHTML=`🏄 ${g.score} GRACE · wave ${Math.min(D.surfWaves,g.wavesRidden+(g.phase==='lineup'||g.phase==='results'?0:1))}/${D.surfWaves}${g.combo>1?' · combo ×'+g.combo:''}${g.tucked?' · IN THE BARREL':''}<br><span style="font-weight:500;color:#c8d6ea">`+
        (g.phase==='lineup'?'RIDE paddles into the next wave · CUTBACK ends the set':g.phase==='building'?'RIDE to drop in early':g.phase==='results'?`${g.tier.name} — ${g.tier.line} · +${g.tier.gold}g +${g.tier.xp} XP${g.tier.sp?' ⭐+1':''} · tap to come ashore`:'stick: carve · RIDE at the lip for air · CUTBACK turns · tuck into the barrel on the left')+'</span>'; }
    return lv; }

  // ── ⛵ the regatta: the game's own module, on its own canvas ──
  if(D.regatta&&typeof openBoatRace==='function'){ const cv=document.createElement('canvas'); cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:30;touch-action:none;background:#06101c'; cv.hidden=true; document.body.appendChild(cv);
    const ctx=cv.getContext('2d'); let live=false, last=0;
    ENGINE.add({id:'regatta',name:'The Regatta',scene:new THREE.Scene(),spawn:{x:0,z:0},custom:{knight:false,pet:false,noStick:true,buttons:[],tick(){},camera(c){ c.position.set(0,0,5); c.lookAt(0,0,0); }}});
    const fit=()=>{ const dpr=Math.min(3,devicePixelRatio||1); cv.width=Math.round(innerWidth*dpr); cv.height=Math.round(innerHeight*dpr); };
    const toC=(x,y)=>{ const r=cv.getBoundingClientRect(); return [(x-r.left)*cv.width/r.width,(y-r.top)*cv.height/r.height]; };
    const pads=list=>{ const p={left:false,right:false,throttle:false}; for(const t of list){ const [x,y]=toC(t.clientX,t.clientY), k=boatPadAt(x,y); if(k) p[k]=true; } boatSetPads(p); };
    cv.addEventListener('touchstart',e=>{ const t=e.changedTouches[0], [x,y]=toC(t.clientX,t.clientY); if(boatPadAt(x,y)===null) boatPointer(x,y,'down'); pads(e.touches); e.preventDefault(); },{passive:false});
    cv.addEventListener('touchmove',e=>{ pads(e.touches); e.preventDefault(); },{passive:false});
    const tend=e=>{ pads(e.touches); e.preventDefault(); }; cv.addEventListener('touchend',tend,{passive:false}); cv.addEventListener('touchcancel',tend,{passive:false});
    cv.addEventListener('mousedown',e=>{ const [x,y]=toC(e.clientX,e.clientY); const k=boatPadAt(x,y); if(k) boatSetPads({[k]:true}); else boatPointer(x,y,'down'); });
    cv.addEventListener('mouseup',()=>boatSetPads({left:false,right:false,throttle:false}));
    const KH={arrowup:'UP',w:'UP',arrowleft:'LEFT',a:'LEFT',arrowright:'RIGHT',d:'RIGHT'};
    addEventListener('keydown',e=>{ if(!live) return; const k=e.key.toLowerCase(); e.preventDefault(); e.stopImmediatePropagation();
      if(KH[k]) boatHold(KH[k],true); else if(k==='j'||k==='z'||k==='enter'||k===' '||k==='dodge') boatPress('A'); else if(k==='k'||k==='x'||k==='escape') boatPress('B'); },true);
    addEventListener('keyup',e=>{ if(!live) return; const k=e.key.toLowerCase(); if(KH[k]) boatHold(KH[k],false); e.stopImmediatePropagation(); },true);
    function loop(t){ if(!live) return; const dt=Math.min(0.05,(t-last)/1000); last=t; if(cv.width!==Math.round(innerWidth*Math.min(3,devicePixelRatio||1))) fit(); boatTick(dt); drawBoat(ctx,cv.width,cv.height); requestAnimationFrame(loop); }
    const from={x:D.regatta.x+0.5,z:D.regatta.y+2.5,face:Math.PI};
    // world.openRegatta(back): the races, then home to `back` (the shore strip, or your boat at the mark)
    world.openRegatta=(back)=>{ back=back||from; ENGINE.go('regatta'); setTimeout(()=>{ fit(); cv.hidden=false; live=true; last=performance.now();
      openBoatRace({gold:S().gold,inv:S().boatInv||{},onClose:payload=>{ live=false; cv.hidden=true; payload=payload||{}; const d=payload.goldDelta||0; if(d) GAME.addGold(d); if(payload.inv) S().boatInv=payload.inv; GAME.save();
        ENGINE.go('world',back); setTimeout(()=>UI.toast(d>0?`🏁 You return richer by ${d} gold!`:d<0?`⚓ You leave the regatta. The shipwright kept ${-d} gold.`:back===from?'⚓ You step back ashore.':'⛵ You sail out from the regatta.',2200),450); }});
      requestAnimationFrame(loop); UI.toast('⛵ The Regatta — welcome to the harbor races!',1800); },450); };
    world.spots.push({x:from.x,z:from.z,r:1.2,label:'Regatta',who:'The Regatta',action:()=>world.openRegatta(from)}); }
}
