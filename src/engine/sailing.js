// ════════════════════════════════════════════════════════════════
//  SAILING — your own boat on the open sea, and the realm's buried secrets (data/pastimes.json).
//   ⛵ The boat starts moored at the Saltmere pier (the game's one `boat` decoration). Face her and
//      Board; she rides SAIL_TILES (open sea, shallows, surf, piers and bridges) and nothing else.
//      Face walkable land — or a pier — and Dock: she is moored on the water tile you left, facing the
//      way you sailed in, and waits there (S.boat). Sailing is walking pace, as in the game.
//      She wears the parts you fitted at the regatta shipwright (S.boatInv.equipped → BOAT_CATALOG).
//      Sail up to the regatta mark and the races open from the water; you come back aboard.
//   🏝 The southern isles (Mistral Isle, Mount Tabor, Sunfall Atoll) are reachable only this way.
//   ✨ SECRETS: stand within a tile of one to find it (gold, a blade, a buried suit, a line of lore).
//      Undiscovered ones shimmer faintly, as in the game. The two 'fly' secrets need a flying mount.
//  sailing(world, D) — call after pastimes(); before the world's onEnter is wrapped for demons.
// ════════════════════════════════════════════════════════════════
function boatModel(parts){ const g=new THREE.Group(), hull=hexn(parts.hull.color||'#6b3a23'), sailC=hexn(parts.sail.color||'#e8e0cf'), GOLD=0xf2c14e;
  const dark=new THREE.Color(hull).multiplyScalar(0.55).getHex(), lite=new THREE.Color(hull).lerp(new THREE.Color(0xffffff),0.25).getHex();
  const body=group(0,0,0,g);
  B(1.0,0.42,1.9,hull,0,-0.3,-0.1,body); B(1.04,0.12,1.94,dark,0,-0.32,-0.1,body); B(1.06,0.06,1.96,lite,0,0.1,-0.1,body);   // hull, waterline, gunwale
  const bow=new THREE.Mesh(new THREE.ConeGeometry(0.72,0.9,4),flat(hull)); bow.rotation.set(Math.PI/2,Math.PI/4,0); bow.scale.set(0.98,1,0.6); bow.position.set(0,-0.08,1.27); body.add(bow);
  B(0.86,0.04,1.8,0xb08a5a,0,0.02,-0.1,body);                                                               // deck planks
  B(0.9,0.36,0.12,dark,0,-0.24,-1.06,body);                                                                 // transom
  const masts=[], sails=[], eng=parts.engine.id||'eng_oar';
  const mastAt=(z,h,lateen)=>{ Cy(0.04,0.055,h,6,0x4a3220,0,0,z,body); masts.push(z);
    const s=group(0,0.5,z+0.05,body);
    if(lateen){ const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(0,h*0.85); sh.lineTo(-0.9,0.05); sh.closePath();
      const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshLambertMaterial({color:sailC,side:THREE.DoubleSide})); m.rotation.y=Math.PI/2; s.add(m); }
    else { B(1.3,0.05,0.05,0x5a3c20,0,h*0.78,0,s); B(1.18,h*0.62,0.03,sailC,0,h*0.14,0,s); }
    s.userData.trim=lateen?0:0.45; sails.push(s); return s; };
  if(eng==='eng_lateen') mastAt(0.25,2.3,true);
  else if(eng==='eng_double'||eng==='eng_galley'){ mastAt(0.55,2.1); mastAt(-0.45,1.8); }
  else mastAt(0.3,2.1);
  // the sail's device: a crusader cross or a storm bolt, on the after face
  const s0=sails[0], mark=parts.sail.mark;
  if(mark==='cross'&&s0){ B(0.12,1.0,0.01,0xb8282a,0,0.45,-0.03,s0); B(0.7,0.12,0.01,0xb8282a,0,1.05,-0.03,s0); }
  if(mark==='bolt'&&s0){ [[0.12,1.35,-0.35],[-0.05,1.05,0.5],[0.08,0.75,-0.4]].forEach(([x,y,r])=>{ const b=B(0.1,0.42,0.01,0xf2d24e,x,y,-0.03,s0); b.rotation.z=r; }); }
  // oars for the twin-oar boat and the galley
  const oars=[]; if(eng==='eng_oar'||eng==='eng_galley') [-1,1].forEach(sd=>{ const p=group(sd*0.5,0.12,-0.3,body); const o=B(0.04,0.04,1.2,0x8a6a3a,0,0,0,p); o.position.set(sd*0.45,0,0); o.rotation.y=Math.PI/2; B(0.18,0.03,0.22,0x8a6a3a,sd*1.0,-0.02,0,p); oars.push([p,sd]); });
  // the figurehead at the prow
  const fid=parts.figure&&parts.figure.id, fh=group(0,0.05,1.55,body);
  if(fid==='fig_lamb'){ Sp(0.16,0xf4f0e6,0,0.08,0,fh,8,6).scale.set(1,0.85,1.3); Sp(0.09,0xf4f0e6,0,0.16,0.16,fh,8,6); }
  if(fid==='fig_lion'){ Sp(0.14,GOLD,0,0.1,0.05,fh,8,6); const r=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.06,6,10),flat(0xd8a030)); r.position.set(0,0.1,0.02); fh.add(r); }
  if(fid==='fig_dove'){ Sp(0.12,0xf8f8f4,0,0.12,0,fh,8,6).scale.set(0.8,0.8,1.4); [-1,1].forEach(sd=>{ const w=B(0.4,0.03,0.18,0xf8f8f4,sd*0.22,0.16,-0.02,fh); w.rotation.z=sd*0.5; }); }
  // a wake that shows when she moves
  const wake=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.6),new THREE.MeshBasicMaterial({color:0xe8f4ff,transparent:true,opacity:0,depthWrite:false}));
  wake.rotation.x=-Math.PI/2; wake.position.set(0,-0.27,-1.7); g.add(wake);
  g.userData.row=(t,moving)=>{ oars.forEach(([p,sd])=>{ p.rotation.y=moving?sd*Math.sin(t*5)*0.5:0; p.rotation.z=moving?sd*(0.15+Math.cos(t*5)*0.15):sd*0.2; });
    sails.forEach((s,i)=>s.rotation.y=(s.userData.trim||0)+Math.sin(t*0.8+i)*0.08); wake.material.opacity+=((moving?0.32:0)-wake.material.opacity)*0.08; wake.scale.y=1+Math.sin(t*3)*0.08; };
  return shade(g); }

function sailing(world,D){
  const S=()=>GAME.S, P=ENGINE.P, K=ENGINE.K, SAIL=new Set(D.sail||[3,20,21,12,32]), W=world.W, H=world.H;
  const inB=(x,y)=>x>=0&&y>=0&&x<W&&y<H, sailT=(x,y)=>inB(x,y)&&SAIL.has(world.T(x,y));
  const home=(D.boat&&D.boat[0])||{x:SX(17),y:SY(220),w:2};
  // the game's moored boat is ours to draw now (it moves when you re-moor her)
  const wd=WORLD_DATA.decor, di=wd.findIndex(d=>d.kind==='boat'); if(di>=0) wd.splice(di,1);
  const moor=()=>S().boat||{x:home.x+(home.w===2?0.5:0),y:home.y+(home.w===2?0.5:0),face:Math.PI/2};
  const BC=(typeof BOAT_CATALOG!=='undefined')?BOAT_CATALOG:[], DEF={hull:'hull_oak',sail:'sail_plain',figure:'fig_none',engine:'eng_oar',keel:'keel_flat'};
  function parts(){ const eq=(S().boatInv&&S().boatInv.equipped)||{}, out={}; for(const k in DEF) out[k]=BC.find(c=>c.id===eq[k])||BC.find(c=>c.id===DEF[k])||{id:DEF[k],color:k==='hull'?'#6b3a23':'#e8e0cf'}; return out; }
  let partsKey='', ride=null, moored=null, boating=false;
  const keyOf=()=>JSON.stringify((S().boatInv&&S().boatInv.equipped)||{});
  function rebuild(){ partsKey=keyOf(); [ride,moored].forEach(m=>m&&m.parent&&m.parent.remove(m));
    ride=boatModel(parts()); ride.visible=false; world.scene.add(ride); moored=boatModel(parts()); world.scene.add(moored); placeMoored(); }
  const vsc=()=>Math.max(0.6,VIEWMODE.ps(world));   // the boat shrinks a little with the people, not all the way: she stays a boat
  function placeMoored(){ const m=moor(); moored.visible=!boating; moored.position.set(m.x+0.5,-0.05,m.y+0.5); moored.rotation.y=m.face||0; }

  // ── on the water, the world's rules change: sail tiles only, a deck to stand on, no walking legs ──
  const baseMove=world.canMove, baseGround=world.ground, baseZone=world.zone;
  const DECK=0.08;
  world.canMove=(fx,fz,tx,tz)=>{ if(!boating) return baseMove(fx,fz,tx,tz); const bx=Math.floor(tx), by=Math.floor(tz);
    if(!sailT(bx,by)) return false; if(world.barrierAt(bx,by)>=0) return false; return true; };
  world.ground=(x,z)=>boating?DECK:baseGround(x,z);
  const ISLES=[['Mistral Isle',40,270],['Mount Tabor',95,274],['Sunfall Atoll',155,270]].map(([n,x,y])=>[n,SX(x),SY(y)]);
  const isle=(x,y)=>{ if(y<SY(241)) return null; for(const [n,cx,cy] of ISLES) if(Math.hypot(x-cx,y-cy)<24) return n; return null; };
  world.zone=p=>{ const x=Math.floor(p.x), y=Math.floor(p.z), n=isle(x,y);
    if(boating) return '⛵ '+(n?'Off '+n:y>=SY(238)?'The southern sea':(baseZone(p).split(' · ')[0]==='The open country'?'The open sea':'Off '+baseZone(p).split(' · ')[0]));
    return n||baseZone(p); };
  const kAnim=K.animate; K.animate=function(dt,mode,sp){ return kAnim.call(K,dt,boating&&mode==='walk'?'idle':mode,sp); };

  function board(){ const m=moor(); boating=true; S().boating=true; S().boat=null;
    P.x=Math.floor(m.x)+0.5; P.z=Math.floor(m.y)+0.5; if(m.face!==undefined) P.face=m.face; placeMoored(); enterBoat(true); GAME.save();
    UI.toast('⛵ You set sail! Steer onto the water — face land and tap Dock to step ashore.',2600); }
  function dock(tx,ty){ const wx=Math.floor(P.x), wy=Math.floor(P.z);
    // she lies alongside, parallel to the shore, bow toward open water where there is some
    const along=(tx!==wx)?[0,Math.PI]:[Math.PI/2,-Math.PI/2], dd=a=>Math.abs(Math.atan2(Math.sin(a-P.face),Math.cos(a-P.face)));
    const face=along.map(a=>({a,ok:sailT(Math.floor(wx+0.5+Math.sin(a)*1.2),Math.floor(wy+0.5+Math.cos(a)*1.2))})).sort((p,q)=>(q.ok-p.ok)||(dd(p.a)-dd(q.a)))[0].a;
    S().boat=sailT(wx,wy)?{x:wx,y:wy,face}:Object.assign({},moor(),{face});
    boating=false; S().boating=false; enterBoat(false); P.x=tx+0.5; P.z=ty+0.5; P.y=baseGround(P.x,P.z); placeMoored(); GAME.save();
    UI.toast('⚓ You step ashore. Your boat waits at the dock.',1600); }
  // where the boat could tie up: the faced tile is walkable land (not water) — or a pier, which is both
  function landAhead(){ for(const r of [0.9,1.4]){ const fx=Math.floor(P.x+Math.sin(P.face)*r), fy=Math.floor(P.z+Math.cos(P.face)*r), t=world.T(fx,fy);
      if((fx!==Math.floor(P.x)||fy!==Math.floor(P.z))&&world.WK(fx,fy)&&(!SAIL.has(t)||t===12)&&world.barrierAt(fx,fy)<0) return [fx,fy]; } return null; }

  world.boatHome=()=>{ if(boating||!S().boat) return false; S().boat=null; placeMoored(); GAME.save(); return true; };   // V199: the harbourmaster sends the lads to row her round to the quay
  const boardSpot={x:0,z:0,r:1.5,label:'Board',who:'Your boat',action:board};
  const dockSpot={x:0,z:0,r:0.2,label:'Dock',who:'The shore',action:()=>{ const a=landAhead(); if(a) dock(a[0],a[1]); }};
  const reg=D.regatta, regSpot=reg&&{x:reg.x+0.5,z:reg.y+0.5,r:1.6,label:'Regatta',who:'The Regatta',action:()=>world.openRegatta&&world.openRegatta({x:reg.x+0.5,z:reg.y-0.5,face:0})};
  let stash=null;   // while sailing, the shore's doors and signs are out of reach: only the boat's own actions show
  function enterBoat(on){ if(on&&!stash){ stash=world.spots.slice(); world.spots.length=0; if(regSpot) world.spots.push(regSpot); }
    else if(!on&&stash){ const extra=world.spots.filter(s=>s!==dockSpot&&s!==regSpot&&!stash.includes(s)); world.spots.length=0; stash.forEach(s=>world.spots.push(s)); extra.forEach(s=>{ if(!world.spots.includes(s)) world.spots.push(s); }); stash=null; } }

  // coming back to the world: still aboard if the save says so and he stands on the water; otherwise the boat
  // waits at her mooring (and if he was lost at sea, she drifts home to the Saltmere pier)
  const prevEnter=world.onEnter;
  world.onEnter=sp=>{ if(!ride||partsKey!==keyOf()) rebuild();
    const on=!!S().boating&&sailT(Math.floor(sp.x),Math.floor(sp.z));
    if(S().boating&&!on){ S().boating=false; S().boat=null; }
    boating=on; P.y=world.ground(P.x,P.z); placeMoored(); enterBoat(boating); prevEnter&&prevEnter(sp); };
  const prevLeave=world.onLeave; world.onLeave=()=>{ enterBoat(false); prevLeave&&prevLeave(); };

  // ── ✨ secrets ──
  const SECRETS=D.secrets||[], found=()=>S().secrets||(S().secrets={});
  const shimmer=SECRETS.map(s=>{ const g=new THREE.Group(); const m=new THREE.MeshBasicMaterial({color:0xfff7c8,transparent:true,opacity:0.5,depthWrite:false});
    [0,Math.PI/2].forEach(r=>{ const q=new THREE.Mesh(new THREE.PlaneGeometry(0.08,0.55),m); q.rotation.z=r; g.add(q); }); g.position.set(s.x+0.5,world.ground(s.x+0.5,s.y+0.5)+0.6,s.y+0.5); world.scene.add(g); return {s,g,m}; });
  const strip=h=>String(h).replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim();
  function discover(s){ found()[s.id]=true; const r=s.reward, st=S(); let extra='';
    if(r.kind==='gold') GAME.addGold(Math.round(r.amount*st.goldMult));
    else if(r.kind==='gear'){ (r.pieces||[r.id]).forEach(id=>{ if(SYS.EQUIP[id]) st.ownedGear[id]=true; }); extra='\nEquip it in the ☰ menu.'; GAME.changed(); }
    GAME.save(); ENGINE.speak('✨ Secret discovered!',[strip(r.text)+extra]); }

  // ── each frame ──
  world.anim.push((t,dt)=>{ if(ENGINE.level!==world) return; if(!ride) rebuild(); else if(partsKey!==keyOf()) rebuild();
    const bob=Math.sin(t*1.6)*0.04;
    moored.scale.setScalar(vsc()); ride.scale.setScalar(vsc()); moored.position.y=-0.05+bob*0.8; moored.rotation.z=Math.sin(t*1.1)*0.025; moored.userData.row(t,false);
    ride.visible=boating;
    if(boating){ const moving=Math.hypot(P.x-(ride.userData.lx||P.x),P.z-(ride.userData.lz||P.z))>0.001; ride.userData.lx=P.x; ride.userData.lz=P.z;
      const vb=vsc(); ride.position.set(P.x-Math.sin(P.face)*0.35*vb,-0.05+bob,P.z-Math.cos(P.face)*0.35*vb); ride.rotation.y=P.face; ride.rotation.z=Math.sin(t*1.3)*0.03; ride.userData.row(t,moving);
      K.position.y=-0.05+(DECK+0.07)*vb+bob; K.position.x=P.x-Math.sin(P.face)*0.55*vb; K.position.z=P.z-Math.cos(P.face)*0.55*vb;
      const a=landAhead(), i=world.spots.indexOf(dockSpot);
      if(a){ dockSpot.x=P.x; dockSpot.z=P.z; if(i<0) world.spots.push(dockSpot); } else if(i>=0) world.spots.splice(i,1); }
    else { const m=moor(), i=world.spots.indexOf(boardSpot); boardSpot.x=m.x+0.5; boardSpot.z=m.y+0.5;
      if(Math.hypot(boardSpot.x-P.x,boardSpot.z-P.z)<3){ if(i<0) world.spots.push(boardSpot); } else if(i>=0) world.spots.splice(i,1); }
    const f=found(), tx=Math.floor(P.x), ty=Math.floor(P.z);
    shimmer.forEach(o=>{ const on=!f[o.s.id]; o.g.visible=on&&Math.abs(o.s.x-P.x)<40&&Math.abs(o.s.y-P.z)<40; if(!on) return;
      const tw=0.5+0.5*Math.sin(t*5+o.s.x); o.m.opacity=0.3+tw*0.45; o.g.scale.setScalar(0.7+tw*0.6); o.g.quaternion.copy(ENGINE.cam.quaternion);
      if(!boating&&Math.abs(tx-o.s.x)<=1&&Math.abs(ty-o.s.y)<=1) discover(o.s); });
  });
  return { get boating(){ return boating; }, board, dock };
}
