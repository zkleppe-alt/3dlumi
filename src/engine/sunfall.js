// ════════════════════════════════════════════════════════════════
//  🌅 SUNFALL — THE WESTERING ISLES, the third world (data/portal_sunfall.json: _buildSunfall and every SUN* table)
//  One continuous spiral arm of warm stone ledges over a long drop to a wine-dark sea, under a sun that will not set.
//  Walk it inward ring by ring to VESPER, the Pretender's gilded false capital. The game's own rules:
//   • Gloamings (spawnSunfallGloamings): fourteen shadow-forms always in their night shape, back one every ~6 s,
//     never on a ring whose lamp is lit.
//   • The five lighthouses (SUNLAMPS): climb each tower, put down its fallen Captain of the Watch, kindle the lamp
//     (+1 skill point, its verse in the codex). Until all five burn, the last raft to Vesper will not come.
//   • Sky-ferries carry you over each gulf between rings (they dock, wait, drift across). Skiffs at the end of every
//     arm ride the updraft back to the mouth — and from the mouth to the deepest tier you have reached.
//   • Five broken spans: shoulder the timber left back along the path and lay the planks (+1 skill point, a verse).
//   • Rubble lies across three arms: walk into a block to shove it; push it over the brink and it is gone.
//   • A watchman's brazier on every arm (rest, and its verse); a pilgrim on every arm (their story, and a verse).
//   • Vesper's cathedral — four floors, a mirror of Luminar's: at the top, the Pretender. BLUE tells (the volley, the
//     ring) melt on a raised shield; RED (the leap, the charge) smash through it. At half strength, THE MIRROR: a
//     false-gold double of you, and while it stands he cannot be touched; when it falls, his next blue is a LIE.
//   • Madison freed (+3), the sun at last allowed to set; walk her to the gate: the first morning, then home to
//     Luminar's keep for the wedding (+5), the credits, and Madison at your family's table.
//  Saved in S.sunfall. sunfallQuest(D) → { enter(b), chapelLight, attach(lv), sky(lv) }
// ════════════════════════════════════════════════════════════════
function octN(dx,dy){ const ax=Math.abs(dx), ay=Math.abs(dy); return Math.max(ax,ay,(ax+ay)*0.70710678); }
function sunfallQuest(D){
  const S=()=>GAME.S, P=ENGINE.P, TB=D.tables||{}, W=D.W, H=D.H;
  const SF=()=>{ const s=S(); s.sunfall=s.sunfall||{}; const f=s.sunfall; ['lamps','spans','caches','waystations','tiers','metPilgrims','debris'].forEach(k=>f[k]=f[k]||{}); f.timber=f.timber|0; return f; };
  const lamp=id=>{ const f=SF(); return f.lamps[id]||(f.lamps[id]={captainDown:false,lit:false}); };
  const litN=()=>['lamp1','lamp2','lamp3','lamp4','lamp5'].filter(k=>lamp(k).lit).length;
  const codex=(w,r,t)=>{ if(typeof LIBRARY!=='undefined') LIBRARY.codexAdd(w,r,t); };
  const ringOf=(x,y)=>{ const n=octN(x-D.cx,y-D.cy), R=(D.rings||[]).find(q=>n>=q.r0&&n<=q.r1); return R?R.ring:0; };
  const atPeace=ring=>{ const L=(D.lamps||[]).filter(q=>q.ring===ring); return L.length>0&&L.every(q=>lamp(q.id).lit); };
  let lv=null;
  // ── the doors of Vesper ──
  function enter(b){ if(b.id==='sf_cath') return ()=>{ if(SF().pretenderDown&&!S().sunfall.rescued){} ENGINE.go('sunfall:cath:0',null); };
    const h=(D.town.houses||[]).find(q=>'sf_'+q.id===b.id); if(h) return ()=>ENGINE.go('sunfall:house:'+h.id,null); return null; }
  // ── the sky: an evening that will not end; once Madison is free, the dusk at last; after the homecoming, morning ──
  const cS=new THREE.Color();
  function sky(L){ const f=SF(), col=S().homecoming?0xbcd8ee:f.dawn?0x2a1c3e:0xe8946a; cS.setHex(col); L.scene.background.copy(cS); L.scene.fog.color.copy(cS); L.scene.fog.near=28; L.scene.fog.far=78;
    L.hemi.color.setHex(f.dawn&&!S().homecoming?0x8a7ab8:0xffdcb0); L.hemi.groundColor.setHex(0x5a3040); L.hemi.intensity=f.dawn&&!S().homecoming?0.42:0.7;
    L.sunLight.color.setHex(f.dawn&&!S().homecoming?0x8a8ad8:0xffb070); L.sunLight.intensity=f.dawn&&!S().homecoming?0.35:0.8;
    L.sea.position.y=-7.2; L.sea.material.color.setHex(f.dawn&&!S().homecoming?0x140a1c:0x3a1222); L.sea.material.shininess=10; }

  // ════ the spiral ════
  function attach(L){ lv=L; const T0=lv.T, base=lv.canMove, baseWalk=lv.walkTile;
    // V126: LUMINAR BENEATH — Sunfall hangs in Luminar's sky. Once its five lamps burn (or Madison is free), the wine-dark sea
    //  below thins away and the realm itself shows far beneath the ledges: its whole map laid out under a veil of cloud and
    //  evening haze, the drifting clouds between. Until then, the sea.
    { const below=new THREE.Group(); lv.scene.add(below); below.visible=false; const cx=(D.cx!==undefined?D.cx:lv.W/2), cz=(D.cy!==undefined?D.cy:lv.H/2);
      const cv=document.createElement('canvas'); cv.width=cv.height=1024; const g2=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv);
      const paint=img=>{ g2.fillStyle='#3a5a78'; g2.fillRect(0,0,1024,1024); if(img){ const k=Math.min(1024/img.width,1024/img.height)*0.9, w=img.width*k, h=img.height*k; g2.imageSmoothingEnabled=true; g2.filter='blur(3px) saturate(1.15)'; g2.drawImage(img,(1024-w)/2,(1024-h)/2,w,h); g2.filter='none'; }
        const gr=g2.createRadialGradient(512,512,180,512,512,520); gr.addColorStop(0,'rgba(232,160,120,0.18)'); gr.addColorStop(0.7,'rgba(232,150,110,0.5)'); gr.addColorStop(1,'rgba(232,148,106,1)'); g2.fillStyle=gr; g2.fillRect(0,0,1024,1024); tex.needsUpdate=true; };
      paint(null); if(typeof SYS!=='undefined'&&SYS.MAP&&SYS.MAP.map){ const im=new Image(); im.onload=()=>paint(im); im.src=SYS.MAP.map; }
      const land=new THREE.Mesh(new THREE.PlaneGeometry(520,520),new THREE.MeshBasicMaterial({map:tex,fog:false,transparent:true,opacity:0.92,depthWrite:false})); land.rotation.x=-Math.PI/2; land.position.set(cx,-70,cz); land.renderOrder=-4; below.add(land);
      // clouds between: soft sprites drifting slowly under the ledges
      const cc=document.createElement('canvas'); cc.width=cc.height=128; const c2=cc.getContext('2d'); for(let i=0;i<12;i++){ const px=24+Math.random()*80, py=40+Math.random()*48, r=14+Math.random()*24, gr=c2.createRadialGradient(px,py,0,px,py,r); gr.addColorStop(0,'rgba(255,240,230,.8)'); gr.addColorStop(1,'rgba(255,240,230,0)'); c2.fillStyle=gr; c2.fillRect(0,0,128,128); }
      const cm=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cc),transparent:true,depthWrite:false,fog:false,opacity:0.55}), clouds=[];
      for(let i=0;i<26;i++){ const sp=new THREE.Sprite(cm); const a=hsh(i,3)*6.283, r=20+hsh(3,i)*130; sp.userData={a,r,y:-22-hsh(i,7)*30,sp:0.002+hsh(i,11)*0.003}; sp.scale.set(40+hsh(i,5)*40,16+hsh(5,i)*10,1); sp.renderOrder=-3; below.add(sp); clouds.push(sp); }
      let was=null; lv.anim.push(t=>{ if(ENGINE.level!==lv) return; const f=SF(), open=litN()>=5||!!f.rescued||!!S().homecoming;
        if(open!==was){ was=open; below.visible=open; if(lv.sea) lv.sea.visible=!open; }
        if(!open) return; const day=!!S().homecoming; land.material.opacity=day?0.95:f.dawn?0.62:0.88;
        clouds.forEach(c=>{ const u=c.userData, a=u.a+t*u.sp; c.position.set(cx+Math.cos(a)*u.r,u.y,cz+Math.sin(a)*u.r); c.material.color.setHex(day?0xffffff:f.dawn?0x8a7aa8:0xffd0b8); }); }); }
    const rubble=new Map(), planks=new Set(), deck=new Set(), void81=(x,y)=>T0(x,y)===81;
    // the rubble, where it was left (sunfallProgress.debris)
    const rubM=new THREE.Group(); lv.scene.add(rubM);
    function layRubble(){ rubble.clear(); while(rubM.children.length) rubM.remove(rubM.children[0]); const f=SF();
      (D.debris||[]).forEach(F=>{ const bl=f.debris[F.id]||F.blocks; bl.forEach(([x,y])=>{ rubble.set(y*W+x,F.id); const g=group(x+0.5,0,y+0.5,rubM); B(0.9,0.62,0.9,0x9a8a74,0,0,0,g); B(0.5,0.3,0.5,0x8a7a64,0.15,0.62,-0.1,g); g.rotation.y=hsh(x,y)*0.6; shade(g); }); }); }
    layRubble();
    // the mended spans, plank by plank
    const plM=new THREE.Group(); lv.scene.add(plM);
    function layPlanks(){ planks.clear(); while(plM.children.length) plM.remove(plM.children[0]); const f=SF();
      (D.spans||[]).forEach(s=>{ if(!f.spans[s.id]) return; s.cells.forEach(([x,y])=>{ planks.add(y*W+x); B(1,0.12,0.92,(x+y)%2?0x8a6a44:0x7e6040,x+0.5,-0.12,y+0.5,plM); }); }); shade(plM); }
    layPlanks(); lv.relay=layPlanks;
    const tileAt=(x,y)=>{ const k=y*W+x; if(rubble.has(k)) return 87; if(planks.has(k)) return 84; if(deck.has(k)) return 82; const t=T0(x,y); return t===87?6:t; };
    lv.tileAt=tileAt;
    const walkT=(x,y)=>{ const k=y*W+x; if(rubble.has(k)) return false; if(planks.has(k)||deck.has(k)) return true; if(T0(x,y)===87) return true; return null; };
    lv.walkTile=(x,y)=>{ const w=walkT(x,y); if(w===false) return false; if(planks.has(y*W+x)) return true; if(deck.has(y*W+x)) return false; if(w===true) return true; return baseWalk(x,y); };
    lv.canMove=(fx,fz,tx,tz)=>{ const bx=Math.floor(tx), by=Math.floor(tz), k=by*W+bx;
      if(rubble.has(k)){ shove(Math.floor(fx),Math.floor(fz),bx,by); return false; }
      const w=walkT(bx,by); if(w!==null) return w; return base(fx,fz,tx,tz); };
    lv.guidePass=(x,y)=>lanes.has(y*W+x)||rubble.has(y*W+x);
    lv.guideNodes=26000;
    // shove a block one tile (sunfallShove): over the brink it is gone
    let shoveT=0;
    function shove(px,py,bx,by){ const now=performance.now(); if(now-shoveT<220) return; const sx=Math.sign(bx-px), sy=Math.sign(by-py); if((sx!==0)===(sy!==0)) return;
      const tx=bx+sx, ty=by+sy, dest=tileAt(tx,ty), intoSky=dest===81&&!deck.has(ty*W+tx)&&!planks.has(ty*W+tx);
      if(!intoSky&&!(lv.walkTile(tx,ty)&&![82,9,35,86,85,83,84].includes(dest))) return;
      shoveT=now; const fid=rubble.get(by*W+bx), f=SF(), F=(D.debris||[]).find(q=>q.id===fid), bl=(f.debris[fid]||F.blocks).filter(b=>!(b[0]===bx&&b[1]===by));
      if(!intoSky) bl.push([tx,ty]); f.debris[fid]=bl.map(b=>[b[0],b[1]]); GAME.save(); layRubble();
      if(intoSky) UI.toast('🪨 The block goes over the edge. You never hear it land.',1600); }
    // ── the sky-ferries (tickSunfallFerries): a 3×3 deck easing across each gulf, docking 1.5 s at either side ──
    const at=(deg,n)=>{ const r=deg*Math.PI/180, ux=Math.cos(r), uy=Math.sin(r), s=n/octN(ux,uy); return {x:D.cx+ux*s, y:D.cy+uy*s}; };
    const lanes=new Set(); (D.ferries||[]).forEach(F=>{ for(let n=Math.min(F.nA,F.nB)-1;n<=Math.max(F.nA,F.nB)+1;n+=0.5){ const p=at(F.deg,n); for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const x=Math.round(p.x)+a, y=Math.round(p.y)+b; if(void81(x,y)) lanes.add(y*W+x); } } });
    const ferries=(D.ferries||[]).map(F=>{ const g=group(0,0,0,lv.scene); B(2.9,0.18,2.9,0x7a5a3a,0,-0.18,0,g); for(let i=-1;i<=1;i++) B(2.9,0.03,0.12,0x5a3a20,0,0.0,i*0.95,g);
        [[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([a,b])=>{ Cy(0.05,0.05,0.7,5,0x5a3a20,a,0,b,g); const bl=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6),new THREE.MeshPhongMaterial({color:0xe8b060,emissive:0x3a2208})); bl.position.set(a,1.3,b); g.add(bl); });
        shade(g); return {F,g,t:F.p||0,dir:1,dwell:0,cells:[],hint:false}; });
    function lay(fr){ fr.cells.forEach(k=>deck.delete(k)); fr.cells=[]; const p=at(fr.F.deg,fr.F.nA+(fr.F.nB-fr.F.nA)*fr.p), cx=Math.round(p.x), cy=Math.round(p.y);
      for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const x=cx+a, y=cy+b; if(void81(x,y)){ deck.add(y*W+x); fr.cells.push(y*W+x); } } return p; }
    function ferryTick(dt){ const pk=Math.floor(P.z)*W+Math.floor(P.x);
      ferries.forEach(fr=>{ const F=fr.F;
        if(F.id==='ferryCauseway'&&litN()<5){ fr.t=1; fr.p=1; const p=lay(fr); fr.g.position.set(p.x+0.5,0,p.y+0.5);
          const l=at(F.deg,F.nA); const near=Math.abs(P.x-(l.x+0.5))<=2.5&&Math.abs(P.z-(l.y+0.5))<=2.5;
          if(near&&!fr.hint){ fr.hint=true; ENGINE.speak('⛴️ The raft waits at the far shore — and will not come.',[`${litN()} of 5 lamps burn. The last crossing answers only to a kept watch.`]); } if(!near) fr.hint=false; return; }
        const riding=fr.cells.includes(pk), before=at(F.deg,F.nA+(F.nB-F.nA)*(fr.p||0));
        if(fr.dwell>0) fr.dwell-=dt*1000; else { fr.t+=fr.dir*0.6*dt; if(fr.t>=1){ fr.t=1; fr.dir=-1; fr.dwell=1500; } else if(fr.t<=0){ fr.t=0; fr.dir=1; fr.dwell=1500; } }
        fr.p=fr.t*fr.t*(3-2*fr.t); const p=lay(fr); fr.g.position.set(p.x+0.5,Math.sin(performance.now()/600+F.deg)*0.04,p.y+0.5);
        if(riding&&ENGINE.level===lv){ P.x+=p.x-before.x; P.z+=p.y-before.y; } });
      // the last line of defence: never left standing on open sky (sunfallRescueFromVoid)
      const x=Math.floor(P.x), y=Math.floor(P.z); if(ENGINE.level===lv&&!lv.walkTile(x,y)&&tileAt(x,y)===81&&!deck.has(y*W+x)){ let best=null, bd=1e9;
        for(let r=1;r<=6&&!best;r++) for(let a=-r;a<=r;a++) for(let b=-r;b<=r;b++){ if(Math.max(Math.abs(a),Math.abs(b))!==r) continue; if(lv.walkTile(x+a,y+b)||planks.has((y+b)*W+x+a)){ const d=a*a+b*b; if(d<bd){ bd=d; best=[x+a,y+b]; } } }
        if(best){ P.x=best[0]+0.5; P.z=best[1]+0.5; UI.toast('⚠️ You scramble back onto solid stone. The raft went out from under you.',1600); } } }

    // ── the lighthouses on their plazas ──
    const towers=(D.lamps||[]).map(L=>{ const g=group(L.x+0.5,0,L.y+0.5,lv.scene), I=TB.lamps[L.id]; Cy(1.25,1.5,6.5,12,0xd8c8b0,0,0,0,g); for(let i=0;i<4;i++) Cy(1.32-i*0.03,1.36-i*0.03,0.25,12,0xa84a3a,0,1.2+i*1.5,0,g);
      B(0.7,1.3,0.2,0x3a2418,0,0,1.42,g); Cy(1.5,1.5,0.18,12,0x5a4a3a,0,6.5,0,g); const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,1.2,10),new THREE.MeshPhongMaterial({color:0x3a3a48,transparent:true,opacity:0.7,emissive:0x000000}));
      glass.position.y=7.3; g.add(glass); Co(1.1,1.0,10,0x6a2a22,0,7.9,0,g); const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.05,1.6,22,10,1,true),new THREE.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      beam.geometry.translate(0,11,0); beam.rotation.z=Math.PI/2; const bp=group(0,7.3,0,g); bp.add(beam); const light=new THREE.PointLight(0xffc870,0,26,1.4); light.position.y=7.3; g.add(light); shade(g);
      lv.spots.push({x:L.door.x+0.5,z:L.door.y+1.2,r:1.4,label:'Enter',auto:[0,-1],ar:0.7,who:I?I.tower:'A lighthouse',action:()=>ENGINE.go('sunfall:lamp:'+L.id+':0',null)});
      return {L,glass,bp,light}; });
    // the braziers, the pilgrims, the skiffs, the timber
    (D.ways||[]).forEach(Wp=>{ const g=group(Wp.x+0.5,0,Wp.y+0.5,lv.scene); Cy(0.32,0.2,0.8,8,0x4a3a32,0,0,0,g); Cy(0.4,0.32,0.12,8,0x6a5a4a,0,0.8,0,g); flame(0,1.1,0,g,lv.anim,2.6); const l=new THREE.PointLight(0xffa050,0.8,7,1.6); l.position.y=1.4; g.add(l); shade(g);
      lv.spots.push({x:Wp.x+0.5,z:Wp.y+1.3,r:1.4,label:'Rest',who:(TB.ways[Wp.id]||{}).name||'A brazier',action:()=>brazier(Wp)}); });
    (D.pilgrims||[]).forEach(p=>{ const Dp=(TB.pilgrims||[]).find(q=>q.id===p.id); if(!Dp) return; const look=Dp.outfit==='peasantF'?'peasant':Dp.outfit, x=p.x+0.5, z=p.y+0.5;
      const f=addPerson(lv,lv.scene,look,x,z,lv.ground(x,z),Dp.name,null,Dp.outfit==='peasantF'||Dp.name.includes('girl')?{her:{main:'#8a6a9a',trim:'#e8d8c0'}}:{}); f.action=()=>pilgrim(Dp,f); });
    (D.moorings||[]).forEach(M=>{ const g=group(M.x+0.5,0,M.y+0.5,lv.scene); Cy(0.06,0.06,1.2,5,0x5a3a20,-0.6,0,0,g); const sk=group(0.3,0.9+0.0,0,g); B(1.6,0.12,0.7,0x8a6a44,0,0,0,sk); B(0.04,1.4,0.04,0x5a3a20,0,0.1,0,sk);
      const sail=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.9),new THREE.MeshLambertMaterial({color:0xf0dcc0,side:THREE.DoubleSide})); sail.position.set(0.2,0.9,0); sail.rotation.y=Math.PI/2; sk.add(sail); shade(g);
      lv.anim.push(t=>{ sk.position.y=0.9+Math.sin(t*1.4+M.x)*0.12; sk.rotation.z=Math.sin(t*0.9)*0.06; });
      lv.spots.push({x:M.x+0.5,z:M.y+0.5,r:1.5,label:'Fly',who:'A skiff on the updraft',action:()=>skiff(M)}); });
    const caches=(D.spans||[]).map(s=>{ const g=group(s.cache.x+0.5,0,s.cache.y+0.5,lv.scene); for(let i=0;i<5;i++){ const c=B(1.1,0.1,0.22,0x8a6a44,0,i*0.11,(i%2-0.5)*0.12,g); c.rotation.y=i%2?0.08:-0.06; } Cy(0.02,0.02,0.6,4,0x5a3a20,0,0.3,0,g); shade(g);
      const sp={x:s.cache.x+0.5,z:s.cache.y+0.5,r:1.3,label:'Take',who:'A bundle of planks',action:()=>take(s)}; lv.spots.push(sp); return {s,g,sp}; });
    const breaches=(D.spans||[]).map(s=>{ let sx=0,sz=0; s.cells.forEach(([x,y])=>{ sx+=x; sz+=y; }); const sp={x:sx/s.cells.length+0.5,z:sz/s.cells.length+0.5,r:3.2,label:'Mend',who:'The fallen span',action:()=>mend(s)}; lv.spots.push(sp); return {s,sp}; });
    function showState(){ const f=SF(); caches.forEach(c=>{ const gone=!!f.caches[c.s.id]; c.g.visible=!gone; const i=lv.spots.indexOf(c.sp); if(gone&&i>=0) lv.spots.splice(i,1); });
      breaches.forEach(b=>{ const done=!!f.spans[b.s.id], i=lv.spots.indexOf(b.sp); if(done&&i>=0) lv.spots.splice(i,1); });
      towers.forEach(T=>{ const on=lamp(T.L.id).lit; T.glass.material.emissive.setHex(on?0xffb050:0x000000); T.glass.material.color.setHex(on?0xffe0a0:0x3a3a48); T.light.intensity=on?1.4:0; T.bp.visible=on; }); }
    lv.refreshSun=showState; showState();

    // ── the Return gate: once Madison walks with you, it is the homecoming ──
    const ret=lv.spots.find(s=>s.label==='Return'); if(ret){ const go=ret.action; ret.action=()=>{ const f=SF(); if(f.rescued&&!S().homecoming){ homecoming(); return; } go(); }; }
    // ── each frame ──
    let gloT=0;
    lv.anim.push((t,dt)=>{ dt=dt||0.016; ferryTick(dt); if(ENGINE.level!==lv) return; const f=SF(), r=ringOf(Math.floor(P.x),Math.floor(P.z)); if(r&&!f.tiers['t'+r]){ f.tiers['t'+r]=true; GAME.save(); }
      towers.forEach(T=>{ if(lamp(T.L.id).lit) T.bp.rotation.y=t*0.7; });
      gloT+=dt; if(gloT>6){ gloT=0; const alive=lv.combat.foes.filter(d=>d.alive&&d.gloaming).length; if(alive<14) gloaming(false); }
      madisonFollow(lv,dt); });
    lv.zone=p=>{ const x=Math.floor(p.x), y=Math.floor(p.z), n=octN(x-D.cx,y-D.cy), pips=['lamp1','lamp2','lamp3','lamp4','lamp5'].map(k=>lamp(k).lit?'🔥':'○').join('');
      if(n<=D.vesper.r) return '🌅 VESPER — the false capital'; const r=ringOf(x,y);
      if(!r) return tileAt(x,y)===82||deck.has(y*W+x)?'🌅 Aboard a sky-ferry':n<D.causeway.from?'🌅 The long causeway':'🌅 The crossing';
      const L=(D.lamps||[]).find(q=>q.ring===r), I=L&&TB.lamps[L.id]; return `🌅 Tier ${r}${I?' — '+I.tower:''} · ${pips}`; };
    // the gloamings
    COMBAT.arena(lv,{ mode:'world', tier:0, W, H, walk:(x,y)=>lv.walkTile(x,y), onKill:()=>{},
      onDeath:()=>{ ENGINE.go(lv.id,lv.arrive); setTimeout(()=>UI.toast('💫 You fall… and wake at the sea gate where you came in.',2200),450); } });
    const pe=lv.onEnter; lv.onEnter=sp=>{ if(pe) pe(sp); showState(); spawnPack(); const f=SF();
      if(!f.arrived){ f.arrived=true; GAME.save(); ENGINE.speak('🌅 SUNFALL — the Westering Isles',['A sun that will not set hangs over a spiral of stone ledges, ring within ring, above a wine-dark sea.','Walk the arm inward. Five dead lighthouses keep no watch; the gloamings keep the roads. At the heart: VESPER, the false capital — and the princess.']); } };
    function spot(){ for(let i=0;i<120;i++){ const x=3+Math.floor(Math.random()*(W-6)), y=3+Math.floor(Math.random()*(H-6)), t=tileAt(x,y);
        if(!(t===6||t===25||t===27)||!lv.walkTile(x,y)) continue; const r=ringOf(x,y); if(!r||atPeace(r)) continue; if(Math.hypot(x-D.entry.x,y-D.entry.y)<10) continue; return [x+0.5,y+0.5]; } return null; }
    function gloaming(any){ const p=spot(); if(!p) return; if(!any&&Math.hypot(p[0]-P.x,p[1]-P.z)<14) return; const lvl=9, hp=Math.round((16+lvl*3)*1.7);
      COMBAT.foe(lv,{x:p[0],z:p[1],hp,level:lvl,xp:8+lvl*3,atk:Math.round((8+lvl)*1.35),gloaming:true,nightBuff:true,walking:true,model:hollowKnight('#3a2a4a')}); }
    function spawnPack(){ COMBAT.clear(lv); if(SF().pretenderDown) return; for(let i=0;i<14;i++) gloaming(true); }
    lv.clearGloamingsOnPeace=()=>lv.combat.foes.forEach(d=>{ if(d.gloaming&&atPeace(ringOf(Math.floor(d.x),Math.floor(d.z)))){ d.alive=false; d.dying=18; } });
    // the guide: the next thing the walk asks of you
    lv.guideTarget=()=>{ const f=SF(); if(f.rescued) return S().homecoming?null:[D.retTile.x,D.retTile.y+1];
      for(let r=1;r<=5;r++){ const s=(D.spans||[]).find(q=>q.ring===r); if(s&&!f.spans[s.id]){ if(!f.caches[s.id]&&f.timber<=0) return [s.cache.x,s.cache.y]; const c=s.cells[(s.cells.length/2)|0]; return [c[0],c[1]]; }
        const L=(D.lamps||[]).find(q=>q.ring===r); if(L&&!lamp(L.id).lit) return [L.door.x,L.door.y+1]; }
      if(!f.pretenderDown) return [D.town.cath.door.x,D.town.cath.door.y+1]; return null; };
  }
  // ── the things you do on the walk ──
  function brazier(Wp){ const Dw=TB.ways[Wp.id]||{name:'A brazier',verse:{ref:'',text:''}}, f=SF(), s=S();
    if(!f.waystations[Wp.id]){ f.waystations[Wp.id]=true; codex(Dw.name+', Sunfall',Dw.verse.ref,Dw.verse.text); s.hp=s.maxHp; GAME.changed(); GAME.save();
      ENGINE.speak(Dw.name,['(a watchman’s brazier, still burning after all this time. Someone kept it against the dark.)',`“${Dw.verse.text}” — ${Dw.verse.ref}`],null,()=>UI.toast(`🔥 ${Dw.name} — ❤ fully restored · 💾 saved`,2400)); return; }
    if(s.hp<s.maxHp){ s.hp=s.maxHp; GAME.changed(); GAME.save(); UI.toast(`🔥 ${Dw.name} — you warm your hands a while. ❤ Fully restored · 💾 saved`,2400); }
    else UI.toast(`🔥 ${Dw.name} — “${Dw.verse.ref}” — the fire holds steady against the wind.`,2200); }
  function pilgrim(Dp,f){ const st=SF(), first=!st.metPilgrims[Dp.id], lines=Dp.lines.slice(); if(first) lines.push(`“${Dp.verse.text}” — ${Dp.verse.ref}`);
    ENGINE.speak(Dp.name,lines,f,()=>{ if(!first) return; st.metPilgrims[Dp.id]=true; codex(Dp.name+', Sunfall',Dp.verse.ref,Dp.verse.text); const s=S(); s.hp=Math.min(s.maxHp,s.hp+Math.round(s.maxHp*0.25)); GAME.changed(); GAME.save();
      UI.toast(`🤝 ${Dp.name} shares what little they have. ❤ Some strength returns · 💾 Game saved`,2400); }); }
  function take(s){ const f=SF(); if(f.caches[s.id]) return; f.caches[s.id]=true; f.timber++; GAME.save(); lv.refreshSun();
    ENGINE.speak('🪵 You shoulder a bundle of planks.',['Someone left these for a mending they never lived to make. Carry them to the break in the ledge.']); }
  function mend(s){ const f=SF(); if(f.spans[s.id]) return; if(f.timber<=0){ ENGINE.speak('⚠️ The ledge is gone here.',['Nothing but sky, and a long way down. There was timber stacked back along the path.']); return; }
    const Dsp=TB.spans[s.id]||{verse:{ref:'',text:''}};
    ENGINE.speak('You',['(you set the bundle down at the brink, and look across the gap at the ledge on the far side)','(plank by plank, you lay the span — hammering, testing your weight, hammering again)',`“${Dsp.verse.text}” — ${Dsp.verse.ref}`],null,()=>{
      f.spans[s.id]=true; f.timber=Math.max(0,f.timber-1); const p=S(); p.skillPoints=(p.skillPoints||0)+1; codex('A mended breach, Sunfall',Dsp.verse.ref,Dsp.verse.text); GAME.changed(); GAME.save();
      const L=ENGINE.level; if(L&&L.refreshSun){ L.refreshSun(); } relayPlanks(); ENGINE.speak('🔨 THE BREACH IS REPAIRED. ⭐ +1 skill point',['The planks hold. The road goes on.']); }); }
  function relayPlanks(){ if(lv&&lv.relay) lv.relay(); }
  function skiff(M){ const f=SF(); let deepest=1; for(let k=1;k<=5;k++) if(f.tiers['t'+k]) deepest=k; const dest=M.ring===1?deepest:1;
    if(dest===M.ring){ ENGINE.speak('🪁 A skiff, tethered and ready.',['Nowhere yet to fly — press on inward, and it will carry you back.']); return; }
    const to=(D.moorings||[]).find(q=>q.ring===dest); if(!to) return; UI.toast(dest===1?'🪁 You cast off, and the updraft takes you — out along the spiral, back to the mouth.':`🪁 You cast off, and the updraft takes you — inward, to Tier ${dest}.`,2000);
    ENGINE.go(lv.id,{x:to.x+0.5,z:to.y+1.5,face:0}); setTimeout(()=>UI.toast(`🪁 You set down on Tier ${dest}. The skiff swings on its tether, waiting for the next thermal.`,2400),900); }

  // ════ a lighthouse: three floors, the Captain on the stair above, the lamp ════
  (D.lamps||[]).forEach(L=>[0,1,2].forEach(fl=>ENGINE.add({id:`sunfall:lamp:${L.id}:${fl}`,lazy:()=>lighthouse(L,fl)})));
  function lighthouse(L,fl){ const I=TB.lamps[L.id], G=TB.lighthouse[fl], id=`sunfall:lamp:${L.id}:`;
    const lvR=gridRoom({id:id+fl,name:I.tower,theme:'keep',pal:{cloth:0xa84a3a,accent:0xa84a3a,trim:0xe8c060},grid:G,npcs:[],floor:fl,zone:['The ground floor','The windlass floor','The lamp room'][fl],
      exit:fl===0?{level:'pw:sunfall',spawn:{x:L.door.x+0.5,z:L.door.y+1.6,face:0}}:null,
      stairs:{up:fl<2?{level:id+(fl+1),spawn:l=>l.downAt}:null,down:fl>0?{level:id+(fl-1),spawn:l=>l.upAt}:null}});
    lvR.onEnter=()=>{ const st=lamp(L.id);
      if(fl===0) ENGINE.speak('🕯️ '+I.tower,[st.lit?'Its flame keeps the watch once more.':st.captainDown?'The tower is quiet. Climb to the lamp room and kindle the light.':'Dark and cold. Something keeps the stair above. Climb, knight — and be ready.']);
      if(fl===2) lampRoom(); };
    if(fl===2){ const g=group(4.5,0,1.5,lvR.scene); Cy(0.4,0.5,0.9,10,0x6a5a4a,0,0,0,g); const glass=new THREE.Mesh(new THREE.SphereGeometry(0.42,12,8),new THREE.MeshPhongMaterial({color:0x4a4a52,emissive:0x000000})); glass.position.y=1.3; g.add(glass);
      const light=new THREE.PointLight(0xffc870,0,10,1.4); light.position.y=1.4; g.add(light); shade(g);
      lvR.spots.push({x:4.5,z:2.6,r:1.3,label:'Kindle',who:'The lamp',action:()=>kindle()});
      COMBAT.arena(lvR,{mode:'dungeon',tier:8,townLvl:30,W:9,H:9,walk:(x,y)=>lvR.canMove(x+0.5,y+0.5,x+0.5,y+0.5),
        onKill:d=>{ if(!d.captain) return; lamp(L.id).captainDown=true; GAME.save(); ENGINE.speak('👑 The Captain kneels — and is released.',[`His watch is ended. The lamp of ${I.tower} waits for a true flame. Stand before it and kindle it.`]); },
        onDeath:()=>{ ENGINE.go(id+'0',null); setTimeout(()=>UI.toast('💫 You fall — and wake at the foot of the tower.',2000),450); } });
      const show=()=>{ const on=lamp(L.id).lit; glass.material.emissive.setHex(on?0xffb050:0); glass.material.color.setHex(on?0xffe0a0:0x4a4a52); light.intensity=on?1.6:0; };
      function lampRoom(){ show(); COMBAT.clear(lvR); const st=lamp(L.id); if(st.captainDown) return; const hp=90+litN()*12;
        const c=COMBAT.foe(lvR,{x:4.5,z:3.5,hp,level:10,xp:60,captain:true,walking:true,hx:4.5,hz:3.5,patrol:2,pdx:1,pdz:0,model:hollowKnight('#8a7a3a')});
        ENGINE.speak('⚔️ '+I.captain,['Once he guarded this light for the Lord. The Pretender turned him — now only the sword can set his watch down.']); }
      function kindle(){ const st=lamp(L.id); if(st.lit){ UI.toast('🔥 The flame keeps its watch.',1200); return; } if(!st.captainDown){ UI.toast('The Captain still keeps the stair.',1200); return; }
        ENGINE.speak('You',['(you kneel at the cold lamp, strike the Lord’s flint, and shelter the first small flame with both hands)',`“${I.verse.text}” — ${I.verse.ref}`,'Keep this watch, little flame. The night is not the end of the story.'],null,()=>{
          st.lit=true; const s=S(); s.skillPoints=(s.skillPoints||0)+1; codex(I.tower+', Sunfall',I.verse.ref,I.verse.text); GAME.changed(); GAME.save(); show(); const n=litN();
          const W0=ENGINE.get('pw:sunfall'); if(W0&&W0.clearGloamingsOnPeace) W0.clearGloamingsOnPeace();
          ENGINE.speak(`🔥 ${I.tower.toUpperCase()} BURNS AGAIN. ⭐ +1 skill point`,[n>=5?'Five flames keep the watch. Far inward, the last causeway to VESPER lies open before you.':`${n} of 5 lamps kindled. Its ring falls quiet — the gloamings flee a kept light.`]); }); } }
    return lvR; }

  // ════ the houses of Vesper ════
  (D.town.houses||[]).forEach(h=>ENGINE.add({id:'sunfall:house:'+h.id,lazy:()=>{ const L2=gridRoom({id:'sunfall:house:'+h.id,name:'A house in Vesper',theme:'home',pal:{floorA:0xd8c088,floorB:0xc8b078},grid:TB.house[h.id],npcs:[],floor:0,
      exit:{level:'pw:sunfall',spawn:{x:h.door.x+0.5,z:h.door.y+(h.dir==='S'?1.6:-0.6),face:h.dir==='S'?0:Math.PI}}});
    L2.onEnter=()=>UI.toast('🏚️ A house in Vesper — gilded, swept, and empty. Whoever lived here has gone in to the light.',2600); return L2; }}));

  // ════ the Cathedral of the Setting Sun: the nave, the gallery, the belfry, the mirror throne ════
  const CN=['The Nave','The Gallery','The Belfry','The Mirror Throne'];
  [0,1,2,3].forEach(fl=>ENGINE.add({id:'sunfall:cath:'+fl,lazy:()=>cathedral(fl)}));
  function cathedral(fl){ const G=TB.cathedral[fl], id='sunfall:cath:';
    const L2=gridRoom({id:id+fl,name:'Cathedral of the Setting Sun',theme:'keep',pal:{cloth:0xc8a040,accent:0xd8b040,trim:0xf0d070,floorA:0x6a5a48,floorB:0x5e4e3e},grid:G,npcs:[],floor:fl,zone:CN[fl],
      exit:fl===0?{level:'pw:sunfall',spawn:{x:D.town.cath.door.x+0.5,z:D.town.cath.door.y+1.6,face:0}}:null,
      stairs:{up:fl<3?{level:id+(fl+1),spawn:l=>l.downAt}:null,down:fl>0?{level:id+(fl-1),spawn:l=>l.upAt}:null}});
    // the pieces gridRoom doesn't know: the rails, the bells, the pillars and throne, the gilt
    const R=L2.room, solid=new Set([52,58,17,47,54]);
    for(let y=0;y<G.length;y++) for(let x=0;x<G[0].length;x++){ const t=G[y][x], cx=x+0.5, cz=y+0.5;
      if(t===53) B(0.98,0.03,0.98,(x+y)%2?0xe8c050:0xd8b040,cx,0,cz,R);
      if(t===52){ const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>G[y+b]&&G[y+b][x+a]!==52); if(edge) B(1,0.9,1,0xc8a040,cx,0,cz,R); else B(1,0.02,1,0x1a1410,cx,0,cz,R); }
      if(t===58){ Cy(0.3,0.2,0.9,8,0x5a4a3a,cx,0,cz,R); flame(cx,1.25,cz,R,L2.anim,2.4); }
      if(t===17){ if(fl===3&&y===1){ const th=group(cx,0,cz,R); B(1.4,2.8,0.3,0xc8a040,0,0,-0.3,th); B(1.1,0.6,0.8,0x8a2a2a,0,0,0,th); Co(0.15,0.6,4,0xf0d070,0,2.8,-0.3,th); } else Cy(0.32,0.36,3.4,10,0xd8c8a8,cx,0,cz,R); }
      if(t===54) B(0.12,2.2,0.7,0xa8402a,cx,0.6,cz,R); if(t===47){ for(let i=0;i<5;i++) Sp(0.14,0xf0c840,cx+(hsh(i,x)-0.5)*0.5,0.14+i*0.05,cz+(hsh(x,i)-0.5)*0.5,R); } }
    shade(R); const bm=L2.canMove; L2.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0.2,0],[-0.2,0],[0,0.2],[0,-0.2]]){ const t=G[Math.floor(tz+oz)]&&G[Math.floor(tz+oz)][Math.floor(tx+ox)]; if(solid.has(t)) return false; } return bm(fx,fz,tx,tz); };
    L2.onEnter=()=>{ if(fl===0) ENGINE.speak('⛪ The Cathedral of the Setting Sun',['You have stood in this room before — in Luminar, with the light coming the other way.']); if(fl===3) throneEnter(); };
    L2.anim.push((t,dt)=>{ if(ENGINE.level===L2) madisonFollow(L2,dt||0.016); });
    if(fl===3) throneRoom(L2);
    return L2; }
  // ── the mirror throne (tickVesperCath, tickPretender) ──
  let TR=null;
  function throneRoom(L2){ const scene=L2.scene, R=L2.room;
    const seated=pretenderModel(0); seated.position.set(7.5,0.3,1.7); scene.add(seated);
    const cage=group(10.5,0,2.5,R); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Cy(0.03,0.03,2.0,4,0xe8c050,Math.sin(a)*0.5,0,Math.cos(a)*0.5,cage); } Cy(0.55,0.55,0.1,10,0xd8b040,0,2.0,0,cage); Co(0.55,0.5,10,0xe8c050,0,2.1,0,cage); shade(cage);
    const mad=person('madison',{who:'Princess Madison'}); mad.position.set(10.5,0,2.5); scene.add(mad);
    TR={L2,seated,cage,mad,fight:null};
    COMBAT.arena(L2,{mode:'finale',W:15,H:17,walk:(x,y)=>L2.canMove(x+0.5,y+0.5,x+0.5,y+0.5),onHit:d=>!(d.boss&&TR.fight&&(TR.fight.mirror)),
      onKill:d=>{ if(d.boss) pretenderFalls(); },
      onDeath:()=>{ endFight(); ENGINE.go('sunfall:cath:0',null); setTimeout(()=>ENGINE.speak('💫 You fall — and wake in the nave below.',['The false king keeps his mirror. Climb, and try him again.']),450); },
      tick:()=>throneTick() });
    L2.combat.tune={dmgMult:1,iframes:26,novaRange:0,novaShots:0,novaSpeed:0,novaLife:0,hotRadius:0,enrageDmg:1};
    L2.onLeave=()=>endFight();
    L2.anim.push((t,dt)=>{ if(ENGINE.level!==L2) return; const f=SF(); seated.visible=!f.pretenderDown&&!(TR.fight&&TR.fight.b); TR.cage.visible=!f.rescued; TR.mad.visible=!f.rescued;
      if(seated.visible&&seated.userData.flap) seated.userData.flap(t); if(!f.pretenderDown&&!TR.fight&&P.z<=8.5&&document.getElementById('say').hidden) parley();
      const F=TR.fight; if(F&&F.b&&F.b.alive){ const b=F.b; if(b.g.userData.flap) b.g.userData.flap(t); F.aura.position.set(b.x,0.9+(b.air||0),b.z); F.aura.material.color.setHex(b.tell==='blue'?0x4aa8ff:b.tell==='red'?0xff3a3a:0xe8c050); F.aura.material.opacity=b.tell?0.3+Math.sin(t*14)*0.1:0.05; b.g.position.y=(b.air||0); } }); }
  function throneEnter(){ endFight(); }
  function endFight(){ if(!TR||!TR.fight) return; const F=TR.fight; COMBAT.clear(TR.L2); if(F.aura) TR.L2.scene.remove(F.aura); TR.fight=null; }
  function parley(){ TR.fight={talk:true};
    speakSeq([['The Pretender King','So. The lamps burn, the breaches are mended, and my quiet city has a knight in it. You have made yourself the last thing wrong with Sunfall.'],
      ['Princess Madison','(from the gilt cage beside the throne) Do not listen to him — he cannot make anything, he can only gild what he stole!'],
      ['The Pretender King','I gave them a sun that never sets. No night. No waiting. No WATCHING. And they wept with gratitude. Tell me, knight — what has your God ever spared anyone?'],
      ['You','“The light shineth in darkness; and the darkness comprehended it not.” You froze the evening because you fear what the morning proves. Stand up from that throne.']],()=>startFight()); }
  function startFight(){ const L2=TR.L2; COMBAT.clear(L2); const m=pretenderModel(0); m.scale.multiplyScalar(1.15);
    const b=COMBAT.foe(L2,{x:7.5,z:3.5,hp:3600,level:0,xp:0,boss:true,noEnrage:true,name:'👑 THE PRETENDER KING',model:m}); b.ai=ai; b.state='idle'; b.cool=46; b.seq=0; b.air=0; b.guardUntil=0;
    const aura=new THREE.Mesh(new THREE.SphereGeometry(1.3,16,10),new THREE.MeshBasicMaterial({color:0xe8c050,transparent:true,opacity:0.05,depthWrite:false,blending:THREE.AdditiveBlending})); L2.scene.add(aura);
    TR.fight={b,aura,mirror:false,mirrorDone:false,lieArmed:false,lieUsed:false};
    ENGINE.speak('👑 THE PRETENDER KING',['The old language holds: BLUE — raise your shield and stand. RED — run. But this is the city of false light. Watch him.']); }
  const PX=COMBAT.PX;
  function hurt(dmg,blockable,ifr){ const s=S(); let inc=Math.max(1,dmg-s.def); inc=Math.max(1,Math.round(inc*(1-s.dmgReduce)));
    if(COMBAT.blocking()){ if(blockable) inc=Math.max(1,Math.ceil(inc*0.08)); else if(!TR.fight.smashT||performance.now()-TR.fight.smashT>2000){ TR.fight.smashT=performance.now(); UI.toast('💥 Your shield is smashed aside! That light was a lie.',1600); } }
    COMBAT.hurtRaw(inc,ifr||14); }
  function throneTick(){ const F=TR&&TR.fight; if(!F||!F.b) return; const b=F.b, L2=TR.L2;
    if(b.hp<b.maxHp*0.5&&!F.mirrorDone){ F.mirrorDone=true; F.mirror=true; b.state='mirror'; b.x=7.5; b.z=3.5; b.tell=null; L2.combat.shots.forEach(s=>s.life=0);
      const k=hollowKnight('#e8c050'); k.traverse(o=>{ if(o.isMesh&&o.material.emissive) o.material.emissive.setHex(0x3a2a00); }); COMBAT.add({x:7.5,z:8.5,hp:170,level:12,speed:1.3*PX,dmg:40,model:k,walking:true,mirrorKnight:true});
      ENGINE.speak('⚔️ THE MIRROR',['A false-gold double of YOU steps out of his light.','He cannot be touched behind it. Cut your reflection down.']); }
    if(F.mirror&&!L2.combat.adds.some(a=>a.alive)){ F.mirror=false; b.state='idle'; b.cool=30; F.lieArmed=true;
      ENGINE.speak('🪞 The mirror shatters — and the Pretender smiles.',['“You trust the colours, little knight?” — WATCH THE NEXT BLUE.']); } }
  function ai(b,dx,dz,dist){ const F=TR.fight; if(!F) return; if(b.state==='mirror'){ b.face=Math.atan2(dx,dz); return; } const p2=b.hp<b.maxHp*0.5, G=TB.cathedral[3], open=(x,z)=>TR.L2.canMove(x,z,x,z);
    if(dist<1.4&&(b.state==='tell'||b.state==='breath')) hurt(55,true,26);
    if(b.state==='idle'){ if(b.cool>0) b.cool--; else { let blue=b.seq%2===0; if(p2) blue=Math.random()<0.5; b.seq++;
        if(F.lieArmed&&!F.lieUsed){ F.lieUsed=true; b.tell='blue'; b.atk2='charge'; b.ch={vx:dx/dist,vz:dz/dist,run:0}; b.tellT=48; b.state='tell'; return; }
        if(blue){ b.bA=(b.bA||0)+1; b.atk2=b.bA%2?'volley':'ring'; } else { b.rA=(b.rA||0)+1; b.atk2=b.rA%2?'leap':'charge'; }
        b.tell=blue?'blue':'red'; b.tellT=Math.round((b.atk2==='leap'?50:44)*(p2?0.75:1)); b.state='tell';
        if(b.atk2==='leap') b.leap={x:P.x,z:P.z,fx:b.x,fz:b.z,t:0}; if(b.atk2==='charge') b.ch={vx:dx/dist,vz:dz/dist,run:0}; }
      if(b.home){ const hx=7.5-b.x, hz=3.5-b.z, hd=Math.hypot(hx,hz); if(hd<0.25) b.home=false; else { b.x+=hx/hd*1.4*PX; b.z+=hz/hd*1.4*PX; } } }
    else if(b.state==='tell'){ b.face=Math.atan2(dx,dz); if(--b.tellT>0) return;
      if(b.atk2==='volley'){ const n=p2?11:8, a0=Math.atan2(dz,dx); for(let i=0;i<n;i++){ const a=a0+(i-(n-1)/2)*0.22; COMBAT.shot(b.x,b.z,Math.cos(a)*2.3*PX,Math.sin(a)*2.3*PX,180,false,0,90,0xf0c860); } b.state='idle'; b.cool=p2?28:42; b.tell=null; }
      else if(b.atk2==='ring'){ const n=p2?16:12; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; COMBAT.shot(b.x,b.z,Math.cos(a)*1.8*PX,Math.sin(a)*1.8*PX,180,false,0,90,0xf0c860); } b.state='idle'; b.cool=p2?30:44; b.tell=null; }
      else if(b.atk2==='leap') b.state='leap'; else b.state='charge'; }
    else if(b.state==='leap'){ const L=b.leap; L.t++; const f=Math.min(1,L.t/26); b.x=L.fx+(L.x-L.fx)*f; b.z=L.fz+(L.z-L.fz)*f; b.air=Math.sin(f*Math.PI)*1.4;
      if(f>=1){ b.air=0; if(Math.hypot(P.x-b.x,P.z-b.z)<2.3) hurt(125,false,16); b.state='idle'; b.cool=p2?32:48; b.tell=null; b.home=true; } }
    else if(b.state==='charge'){ const c=b.ch, spd=(p2?5.4:4.5)*PX, nx=b.x+c.vx*spd, nz=b.z+c.vz*spd, ok=open(nx,nz); if(ok){ b.x=nx; b.z=nz; } c.run+=spd; b.face=Math.atan2(c.vx,c.vz);
      if(Math.hypot(P.x-b.x,P.z-b.z)<1.5){ hurt(135,false,18); c.run=99; } if(!ok||c.run>7){ b.state='idle'; b.cool=p2?30:46; b.tell=null; b.home=true; } } }
  function pretenderFalls(){ const f=SF(); f.pretenderDown=true; GAME.save(); endFight();
    speakSeq([['The Pretender King','(on his knees before his own throne, the gilt flaking from his armour like ash) I only... wanted it to stay evening. The evening was the best of it. Before the reckoning. Before the... morning.'],
      ['You','“Weeping may endure for a night, but joy cometh in the morning.” — Psalm 30:5. You were never afraid of the dark, Pretender. You were afraid of the joy.'],
      ['Princess Madison','(as the cage’s gilt bars dim and swing open) Knight of Luminar. I watched five lamps light across the gulf, one by one, and I knew. I KNEW someone was still keeping the watch.'],
      ['Princess Madison','He held the sun still because a sunset is a promise — that the day ends, and is judged, and is FORGIVEN, and comes again. Let it set. I want to see the morning. Take me home.']],()=>{
      codex('The mirror throne, Vesper','Psalm 30:5','Weeping may endure for a night, but joy cometh in the morning.'); f.rescued=true; f.dawn=true; const s=S(); s.skillPoints=(s.skillPoints||0)+3;
      s.bounties=s.bounties||{}; s.bounties.madisonRescued=true; GAME.changed(); GAME.save();
      ENGINE.speak('👑 PRINCESS MADISON IS FREE. ⭐ +3 skill points',['Outside, for the first time in an age — the sun is SETTING over Sunfall. Walk her down. Watch the dark come. The morning is on its way.']); }); }
  // ── Madison walks with you (tickMadison), down the cathedral, along every arm and aboard every raft ──
  let madM=null, madOn=null;
  function madisonFollow(L,dt){ const f=SF(); if(!f.rescued||S().homecoming){ if(madM&&madM.parent) madM.parent.remove(madM); return; }
    if(!madM){ madM=person('madison',{who:'Princess Madison'});   /* V132: herself, as everywhere else (was a generic noble) */ madM.userData.pos={x:P.x,z:P.z+1}; }
    const vs=VIEWMODE.ps(L); if(madOn!==L){ if(madM.parent) madM.parent.remove(madM); L.scene.add(madM); madOn=L; madM.userData.pos={x:P.x,z:P.z+1}; madM.scale.setScalar(vs); }
    const q=madM.userData.pos, dx=P.x-q.x, dz=P.z-q.z, d=Math.hypot(dx,dz)||1, sp=1.1*Math.max(0.6,vs*1.6);
    if(d>sp){ const k=Math.min(d-sp,dt*Math.min(6,(d-sp)*4)); q.x+=dx/d*k; q.z+=dz/d*k; madM.rotation.y=Math.atan2(dx,dz); } if(d>8){ q.x=P.x; q.z=P.z+1; }
    madM.position.set(q.x,L.ground?L.ground(q.x,q.z):0,q.z); }
  // ── the homecoming: the first morning at the gate, the ride home, the wedding, the credits ──
  function homecoming(){ speakSeq([['Princess Madison','Wait. Before the gate — look east.'],['Princess Madison','(over the rim of the world, past the five dark towers you lit and the spans you laid, the sky is doing something Sunfall has never seen: it is getting BRIGHTER)'],
      ['You','“But unto you that fear my name shall the Sun of righteousness arise with healing in his wings.” — Malachi 4:2.'],
      ['Princess Madison','The first morning. He held this back from a whole city because he could not bear to be judged by it — and it was MERCY all along. Come, knight. Take me home to Luminar. There is a wedding owed.']],()=>wedding()); }
  function wedding(){ const keep=ENGINE.get('keep'); if(!keep){ finishStory(); return; } const banner=keep.banner; keep.banner=null; ENGINE.go('keep',null); setTimeout(()=>keep.banner=banner,900);
    setTimeout(()=>{ const P0=P, bride=addPerson(keep,keep.scene,'noble',P0.x+0.9,P0.z+0.4,0,'Princess Madison',[],{her:{main:'#f4eef8',trim:'#f2d27a'},rest:Math.PI}); bride.still=true; bride.mute=true;
      const father=addPerson(keep,keep.scene,'knight',P0.x-1,P0.z+1.2,0,'Sir Aldric',[],{her:{main:'#ece8dc',trim:'#e8b93a'},rest:Math.PI}); father.still=true; father.mute=true;
      let walking=true; const top=9.2;
      const step=(t,dt)=>{ if(!walking) return; const p=P; if(p.z>top){ p.z-=dt*2.6; p.face=Math.PI; bride.z=p.z+0.1; bride.x+=(p.x+0.9-bride.x)*0.1; bride.g.position.set(bride.x,0,bride.z); father.z=p.z+1.4; father.g.position.set(father.x,0,father.z); ENGINE.K.animate(dt,'walk',0.8); }
        else { walking=false; speakSeq((TB.wedding||[]).map(([w,t])=>[w||'The keep',String(t).replace(/<[^>]+>/g,'')]),()=>{ const i=keep.anim.indexOf(step); if(i>=0) keep.anim.splice(i,1);
            [bride,father].forEach(f=>{ keep.scene.remove(f.g); const k=keep.folk.indexOf(f); if(k>=0) keep.folk.splice(k,1); }); finishStory(); credits(); }); } };
      keep.anim.push(step); },450); }
  function finishStory(){ const s=S(), f=SF(); s.homecoming=true; f.homecoming=true; s.portals=s.portals||{}; s.portals.sunfall=Object.assign({},s.portals.sunfall||{},{unlocked:true,cleared:true}); s.bounties=s.bounties||{}; s.bounties.pretenderDefeated=true;
    s.skillPoints=(s.skillPoints||0)+5; codex('The gate of Sunfall','Malachi 4:2','But unto you that fear my name shall the Sun of righteousness arise with healing in his wings.'); codex("Luminar's keep",'Ecclesiastes 4:12','And if one prevail against him, two shall withstand him; and a threefold cord is not quickly broken.');
    GAME.changed(); GAME.save(); }
  function credits(){ const el=document.createElement('div'); el.style.cssText='position:fixed;inset:0;z-index:40;background:rgba(10,6,14,.96);overflow:hidden;cursor:pointer';
    const roll=document.createElement('div'); roll.style.cssText='position:absolute;left:0;right:0;top:100%;text-align:center;color:#e8dcc8;font:15px/2.1 var(--f-body);padding:0 16px';
    roll.innerHTML=(TB.credits||[]).map(l=>l==="KINGDOM'S LAST KNIGHT"?`<div style="font:400 28px var(--f-display);color:#f0c860;margin:12px 0">${UI.esc(l)}</div>`:`<div style="${l.indexOf('—')===0?'color:#c8a878':''}">${UI.esc(l)||'&nbsp;'}</div>`).join('');
    const hint=document.createElement('div'); hint.style.cssText='position:absolute;left:0;right:0;bottom:calc(18px + env(safe-area-inset-bottom,0px));text-align:center;color:#f0c860;font:700 13px var(--f-body);opacity:0;transition:opacity 1s';
    hint.textContent='Tap — and the story keeps'; el.append(roll,hint); document.body.appendChild(el);
    const dur=(TB.credits||[]).length*1.05+4; roll.animate([{transform:'translateY(0)'},{transform:`translateY(calc(-100% - ${innerHeight}px))`}],{duration:dur*1000,easing:'linear',fill:'forwards'});
    let done=false; setTimeout(()=>{ done=true; hint.style.opacity=1; },dur*1000-3000);
    el.addEventListener('pointerdown',e=>{ e.preventDefault(); if(!done) return; el.remove(); const w=ENGINE.get('world'); ENGINE.go('world',w&&w.doorStep?w.doorStep('sg_keep'):null);
      setTimeout(()=>ENGINE.speak('👑 THE KINGDOM IS WHOLE. ⭐ +5 skill points',['Three worlds at peace · Madison home · the watch kept. The gates stand open — the story keeps.','Madison waits at your family’s table in the farmhouse.']),600); }); }
  return { enter, chapelLight:()=>true, attach, sky };
}
