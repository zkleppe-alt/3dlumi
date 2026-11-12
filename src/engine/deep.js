// ════════════════════════════════════════════════════════════════
//  🌊 THE DEEP — the secret underwater world (data/pastimes.json → deep: UW_ROOMS and every UW_ table)
//  Only the Sea Dragon (the Steadfast line's final form) can dive, at five dark eddies in deep water (UW_SPOTS).
//  Below: the Drowned Courts — the Reef Garden — and at their north end a house built after Solomon's
//  (1 Kings 6–7): the porch, the Holy Place with its side chambers, and the Most Holy Place. Wholly peaceful;
//  you ride the Sea Dragon the whole time.
//   • Dive: at an eddy, riding the Sea Dragon. Any other steed, or the boat, gets the game's hint.
//   • Surface: on any rising current (you come up at ITS spot), or ⬆ / U (where you went in).
//   • The Holy Place: four of the ten lampstands bear Jonah's prayer (UW_PRAYER). Light them in the prayer's
//     order: all ten blaze, the inner doors open, and the Deepwater Pearl livery is given. Between the
//     cherubim, a humble chest holds the Wooden Cross.
//   • Tirzah wants her three record tablets back, then asks three questions on Jonah 2 (UW_QUIZ): the Coral
//     Barding. Zebulun buys pearls from the chests (UW_PEARL_PRICE apiece).
//   • Psalm 104, Micah 7:19 and Jonah 2:9 are written into your codex.
//  Saved in S.uw (the game's `underwater` key): visited, chests, tablets, lamps, opened, livery, barding,
//  quiz, pearls, sold, met — and where you are, so a save made underwater comes back underwater.
//  deepSystem(world, D, riding) → { quest(), restore() }
// ════════════════════════════════════════════════════════════════
const DEEP_API={cur:null};
Object.assign(DECOR_KINDS,{
  uwCoralPlanter(d,g){ B(0.8,0.4,0.5,0x7a4f2a,0,0,0,g); for(let i=0;i<4;i++) Sp(0.05,0xf4f0e8,-0.27+i*0.18,0.25,0.26,g);
    Co(0.07,0.5,5,0xd8586a,-0.22,0.4,0,g); Sp(0.14,0xe8905a,0.05,0.5,0,g); B(0.04,0.5,0.24,0x9a6ac8,0.27,0.4,0,g); },
  uwPearlFountain(d,g){ Cy(0.9,1.0,0.35,14,0x9ab8c0,0,0,0,g); Cy(0.8,0.8,0.05,14,0x5ab0d0,0,0.32,0,g); Cy(0.14,0.18,0.9,8,0xb8d0d4,0,0.35,0,g);
    const sh=Sp(0.4,0xf4f0e8,0,1.3,0,g,10,6); sh.scale.set(1,0.45,1); Sp(0.14,0xffffff,0,1.48,0,g); },
  uwBellArbor(d,g){ [-0.8,0.8].forEach(x=>{ Cy(0.07,0.08,1.9,6,0x6a4428,x,0,0,g); [0.4,0.9,1.4].forEach(y=>Sp(0.12,0x4a9a5a,x,y,0,g)); }); B(1.9,0.1,0.18,0x6a4428,0,1.9,0,g);
    const b=Cy(0.12,0.3,0.4,10,0xa8743a,0,1.42,0,g); Sp(0.05,0x5a9a80,0,1.42,0,g); },
  uwWheelSign(d,g){ Cy(0.06,0.06,1.4,6,0x6a4428,0,0,0,g); const w=new THREE.Mesh(new THREE.TorusGeometry(0.34,0.05,6,16),flat(0x8a5a2a)); w.position.set(0,1.25,0.06); g.add(w);
    for(let i=0;i<8;i++){ const s=B(0.04,0.8,0.04,0x8a5a2a,0,0.85,0.06,g); s.position.y=1.25; s.geometry.translate(0,0,0); s.rotation.z=i*Math.PI/4; } B(0.5,0.22,0.04,0xc8a870,0,0.6,0.08,g); },
  uwWoodenCross(d,g){ B(0.42,0.18,0.42,0x7a6a58,0,0,0,g); B(0.16,1.6,0.14,0x7a5232,0,0.18,0,g); B(0.8,0.14,0.14,0x7a5232,0,1.2,0,g); }
});
function deepSystem(world,D,riding){
  const S=()=>GAME.S, P=ENGINE.P, K=ENGINE.K, T=D.T, WALK=new Set(D.walk);
  const U=()=>{ const s=S(); if(!s.uw) s.uw={}; const u=s.uw;
    const F={from:null,visited:{},chests:{},tablets:{},read:{},lamps:[],opened:false,livery:false,barding:false,quiz:false,pearls:0,sold:0,met:{},at:null};
    for(const k in F) if(u[k]===undefined) u[k]=JSON.parse(JSON.stringify(F[k])); return u; };
  const canDive=()=>{ const p=S().pet; return !!(p&&p.id==='steadfast'&&p.form===2); };
  const codex=(w,r,t)=>{ if(typeof LIBRARY!=='undefined') LIBRARY.codexAdd(w,r,t); };
  const strip=h=>String(h).replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'');
  // ════ the five eddies on the surface ════
  const eddyMat=new THREE.MeshBasicMaterial({color:0x06202c,transparent:true,opacity:0.7,depthWrite:false});
  const bubMat=new THREE.MeshBasicMaterial({color:0xc8f0ff,transparent:true,opacity:0.6,depthWrite:false});
  const eddies=D.spots.map(sp=>{ const g=group(sp.x+0.5,-0.03,sp.y+0.5,world.scene), disc=new THREE.Mesh(new THREE.CircleGeometry(1.1,24),eddyMat); disc.rotation.x=-Math.PI/2; g.add(disc);
    const sw=[]; for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.RingGeometry(0.25+i*0.3,0.32+i*0.3,20,1,0,Math.PI*1.2),new THREE.MeshBasicMaterial({color:0x3a8aa0,transparent:true,opacity:0.45,side:THREE.DoubleSide,depthWrite:false})); r.rotation.x=-Math.PI/2; r.position.y=0.01*(i+1); g.add(r); sw.push(r); }
    const bub=[]; for(let i=0;i<6;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),bubMat); g.add(b); bub.push(b); }
    const spot={x:sp.x+0.5,z:sp.y+0.5,r:1.8,label:'Dive',who:sp.name,action:()=>{ const mounted=riding&&riding.mounted, boat=world._sailing&&world._sailing.boating;
      if(mounted&&!boat&&canDive()){ dive(sp); return; }
      ENGINE.speak('Deep water',['🌊 The water turns dark and deep here.','Something far below catches the light. Only a creature of the sea could carry you down.']); }};
    return {sp,g,sw,bub,spot}; });
  world.anim.push(t=>{ if(ENGINE.level!==world) return; const on=(riding&&riding.mounted)||(world._sailing&&world._sailing.boating);
    eddies.forEach(E=>{ E.sw.forEach((r,i)=>r.rotation.z=t*(0.5+i*0.3)); E.bub.forEach((b,i)=>{ const k=(t*0.5+i/6)%1; b.position.set(Math.sin(i*2.1+t)*0.2,k*0.9,Math.cos(i*1.7)*0.2); b.scale.setScalar(0.6+k); });
      const i=world.spots.indexOf(E.spot), near=Math.hypot(P.x-E.spot.x,P.z-E.spot.z)<6; if(on&&near){ if(i<0) world.spots.push(E.spot); } else if(i>=0) world.spots.splice(i,1); }); });
  function dive(sp){ const u=U(), first=!Object.keys(u.visited).length; u.from=sp.id; u.visited[sp.id]=true; GAME.save();
    const e=D.entry[sp.id]; ENGINE.go('deep:courts',{x:e[0]+0.5,z:e[1]-0.5,face:Math.PI});
    setTimeout(()=>{ if(first) ENGINE.speak('The Deep',['🌊 Down, down into the deep…','A drowned court opens around you, and beyond it the pillars of a house of gold.','“So is this great and wide sea” — Psalm 104:25']); else UI.toast(`🌊 You dive from ${sp.name}.`,1600); },500); }
  function surface(id){ const sp=D.spots.find(q=>q.id===id)||D.spots[0], u=U(); u.at=null; GAME.save(); quizOpen=false;
    ENGINE.go('world',{x:sp.x+0.5,z:sp.y+0.5,face:0}); setTimeout(()=>{ if(riding&&riding.mount) riding.mount(true); UI.toast(`🌅 You break the surface at ${sp.name}.`,1800); },520); }
  // ⬆ — the surface button, and U
  const upB=document.createElement('button'); upB.className='act'; upB.id='surfaceBtn'; upB.hidden=true; upB.textContent='⬆'; upB.setAttribute('aria-label','Surface');
  upB.style.cssText='position:fixed;left:calc(26px + env(safe-area-inset-left,0px));bottom:calc(200px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:1px solid rgba(127,208,232,.9);background:rgba(20,60,80,.75);color:#fff;font:700 24px var(--f-body);cursor:pointer;touch-action:none;z-index:5';
  document.body.appendChild(upB); const ask=()=>{ if(!inDeep()||UI.open||ENGINE.busy||!document.getElementById('say').hidden) return; surface(U().from||'A'); };
  upB.addEventListener('pointerdown',e=>{ e.preventDefault(); ask(); });
  addEventListener('keydown',e=>{ if(e.key&&e.key.toLowerCase()==='u'&&!e.repeat&&!UI.open) ask(); });
  const levels={}; const inDeep=()=>!!(ENGINE.level&&/^deep:/.test(ENGINE.level.id));
  setInterval(()=>{ upB.hidden=!inDeep(); },250);
  // the knight rides through the deep: idle in the saddle
  const kAnim=K.animate; K.animate=function(dt,mode,sp){ return kAnim.call(K,dt,inDeep()&&mode==='walk'?'idle':mode,sp); };

  // ════ the rooms ════
  const ART={ sand:0xcdb98c, grass:0xb8a87a, flag:0x8f8a7c, flag2:0x847f72, gold:0xb8963c, gold2:0xc8a448, stone:0x8a8678, stoneD:0x6e6a5e, bronze:0xa8743a, bronzeL:0xd0a060, verd:0x5a9a80, cedar:0x7a4a2a, goldL:0xf0d890 };
  function room(name){ if(levels[name]) return levels[name];
    const R=D.rooms[name], rows=R.rows, H=rows.length, W=rows[0].length, base=rows.map(r=>[...r].map(ch=>D.chr[ch])), temple=name==='temple';
    const scene=new THREE.Scene(), bg=new THREE.Color(temple?0x0a2230:0x0b3442); scene.background=bg; scene.fog=new THREE.FogExp2(bg,temple?0.05:0.045);
    const lv={id:'deep:'+name,name:temple?'The Drowned House':'The Drowned Courts',scene,folk:[],spots:[],anim:[],W,H,noPet:true,speed:6.0,cam:{pitch:0.5,dist:8,min:4,max:12},cornerHelp:true};
    const hemi=new THREE.HemisphereLight(0x9fe0ff,0x0a2030,temple?0.55:0.8); scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xbff0ff,temple?0.3:0.55); sun.position.set(W*0.4,30,H*0.3); sun.target.position.set(W/2,0,H/2); scene.add(sun,sun.target);
    const Rg=group(0,0,0,scene), an=lv.anim;
    // the live tile: the opened doors and the taken tablets
    const tile=(x,y)=>{ const t=base[y]&&base[y][x]; if(t===undefined) return T.TRENCH; const u=U();
      if(temple&&u.opened&&D.innerDoor.some(([a,b])=>a===x&&b===y)) return T.GOLDFLOOR;
      for(const id in R.tablets) if(/^rec/.test(id)&&u.tablets[id]&&R.tablets[id][0]===x&&R.tablets[id][1]===y) return temple&&x>=10&&x<=19?T.GOLDFLOOR:T.SAND;
      return t; };
    const solid=new Set(); for(const k in R.obj){ const [,x,y,w,h]=R.obj[k]; for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) solid.add(xx+','+yy); }
    if(!temple) D.door.forEach(([x,y])=>solid.delete(x+','+y)); for(const k in R.npc){ const [x,y]=R.npc[k]; solid.add(x+','+y); }
    const walk=(x,y)=>WALK.has(tile(x,y))&&!solid.has(x+','+y);
    lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0,0],[0.25,0],[-0.25,0],[0,0.25],[0,-0.25]]) if(!walk(Math.floor(tx+ox),Math.floor(tz+oz))) return false; return true; };
    lv.ground=()=>0; lv.clamp=v=>{ v.y=Math.max(1.2,Math.min(temple?6.5:11,v.y)); v.x=Math.max(1,Math.min(W-1,v.x)); v.z=Math.max(1,Math.min(H-1,v.z)); };
    lv.zone=p=>{ const tx=Math.floor(p.x), ty=Math.floor(p.z); if(!temple) return '🌊 The Drowned Courts'; if(!(tx>=10&&tx<=19&&ty>=2&&ty<=39)) return '🌊 The Side Chambers'; return ty<=11?'🌊 The Most Holy Place':ty<=32?'🌊 The Holy Place':'🌊 The Porch'; };
    // ── the floor ──
    const cells=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=base[y][x]; if(t===T.TRENCH) continue;
      const gold=t===T.GOLDFLOOR||t===T.INNERDOOR||t===T.LAMPSTAND||(temple&&t===T.TABLET&&x>=10&&x<=19), flag=t===T.FLAG||(temple&&t!==T.SAND&&!gold);
      const c=new THREE.Color(gold?((x+y)%2?ART.gold:ART.gold2):t===T.FLAG?((x+y)%2?ART.flag:ART.flag2):t===T.GRASS?ART.grass:t===T.KELP?0x7a7258:flag?ART.flag2:ART.sand).offsetHSL(0,0,(hsh(x,y)-0.5)*(gold||flag?0.05:0.02)).getHex();
      cells.push({x,y,c,blend:!gold&&!flag}); }
    Rg.add(tileFloor(cells,0));                                                                                    // one seamless sea floor; the laid courts keep their pattern
    // sand ripples and scattered shells on the open floor
    { const rip=[], shells=[]; cells.forEach(q=>{ if(!q.blend) return; const r=hsh(q.x*7,q.y*3); if(r<0.55) rip.push([q.x+0.5,q.y+0.5,r]); if(r>0.9) shells.push([q.x+0.2+hsh(q.y,q.x)*0.6,q.y+0.2+r*0.6,r]); });
      const rg=new THREE.CylinderGeometry(0.5,0.5,1,8,1); rg.rotateZ(Math.PI/2); rg.translate(0,0.5,0);
      inst(rip,rg,null,([x,z,r],m,c)=>{ m.makeRotationY(0.6+r*0.4); m.scale(new THREE.Vector3(0.9,0.05,0.1)); m.setPosition(x+(r-0.3)*0.3,-0.03,z); c.setHex(0xd8c89a); },Rg);
      inst(shells,new THREE.SphereGeometry(0.07,6,4,0,Math.PI*2,0,Math.PI/2),null,([x,z,r],m,c)=>{ m.makeScale(1,0.6,1.3); m.setPosition(x,0,z); c.setHex([0xf4e8e0,0xf0b8a8,0xe8d8b8][(r*30|0)%3]); },Rg); }
    if(temple){ const pit=new THREE.Mesh(new THREE.PlaneGeometry(W+40,H+40),new THREE.MeshBasicMaterial({color:0x03121a})); pit.rotation.x=-Math.PI/2; pit.position.set(W/2,-3,H/2); Rg.add(pit); }
    else { const sea=new THREE.Mesh(new THREE.PlaneGeometry(W+60,H+60),new THREE.MeshLambertMaterial({color:0x6a6450})); sea.rotation.x=-Math.PI/2; sea.position.set(W/2,-0.12,H/2); Rg.add(sea); }
    // the caustics: two scrolling webs of light over the floor
    const cau=causticTex(); [[1,0.012,0.007],[1.6,-0.009,0.011]].forEach(([s,u,v],i)=>{ const tx=cau.clone(); tx.needsUpdate=true; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(W/6*s,H/6*s);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:tx,transparent:true,opacity:temple?0.045:0.1,blending:THREE.AdditiveBlending,depthWrite:false,color:0x9fe8ff}));
      m.rotation.x=-Math.PI/2; m.position.set(W/2,0.012+i*0.004,H/2); m.renderOrder=2; Rg.add(m); an.push(t=>{ tx.offset.set(t*u,t*v); }); });
    // ── swaying kelp and seagrass (a sway in the vertex shader, per instance) ──
    const swayU={value:0}; an.push(t=>swayU.value=t);
    const swayMat=col=>{ const m=new THREE.MeshLambertMaterial({color:col}); m.onBeforeCompile=sh=>{ sh.uniforms.uT=swayU; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n#ifdef USE_INSTANCING\n float ph=instanceMatrix[3][0]*0.9+instanceMatrix[3][2]*0.7;\n transformed.x+=sin(uT*1.2+ph)*0.22*transformed.y*transformed.y; transformed.z+=cos(uT*0.9+ph)*0.12*transformed.y;\n#endif'); }; return m; };
    const kelp=[], blades=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=base[y][x];
      if(t===T.KELP) for(let i=0;i<2;i++) kelp.push([x+0.25+hsh(x*3+i,y)*0.5,y+0.25+hsh(y*5+i,x)*0.5,2.2+hsh(x+i,y*7)*3.2]);
      if(t===T.GRASS) for(let i=0;i<4;i++) blades.push([x+0.15+hsh(x*7+i,y)*0.7,y+0.15+hsh(y*3+i,x*2)*0.7,0.35+hsh(x+i*3,y)*0.45]); }
    const kg=new THREE.CylinderGeometry(0.05,0.11,1,5); kg.translate(0,0.5,0);
    inst(kelp,kg,swayMat(0xffffff),([x,z,h],m,c)=>{ m.makeScale(1,h,1); m.setPosition(x,0,z); c.setHex(0x2a6a3a).offsetHSL((hsh(x*9,z)-0.5)*0.05,0,(hsh(z,x)-0.5)*0.12); },Rg);
    const bg2=new THREE.ConeGeometry(0.05,1,3); bg2.translate(0,0.5,0);
    inst(blades,bg2,swayMat(0xffffff),([x,z,h],m,c)=>{ m.makeScale(1,h,1); m.setPosition(x,0,z); c.setHex(0x4a9a5a).offsetHSL(0,0,(hsh(x*5,z)-0.5)*0.12); },Rg);
    // ── the solid tiles ──
    const CORAL=[0xd8586a,0xe8905a,0x9a6ac8,0xf5a0a8,0xe8c050,0x5ac8c0];
    const rockG=new THREE.DodecahedronGeometry(0.5,0), rocks=[], walls=[], domes=[], cedars=[];
    const dyn={chests:{},tablets:{},lamps:{},doors:[],humble:null};
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=base[y][x], cx=x+0.5, cz=y+0.5;
      if(t===T.CORAL){ const g=group(cx,0,cz,Rg); for(let i=0;i<4;i++){ const c=CORAL[(hsh(x*3+i,y)*CORAL.length)|0], ox=(hsh(x+i,y*2)-0.5)*0.6, oz=(hsh(y+i,x*3)-0.5)*0.6;
          if(i%2) Co(0.12,0.5+hsh(x,y+i)*0.5,5,c,ox,0,oz,g); else { const s=Sp(0.18+hsh(x+i,y)*0.12,c,ox,0.15,oz,g,7,5); s.scale.y=0.8; } } B(0.04,0.6,0.3,CORAL[(x+y)%CORAL.length],0,0,0,g).rotation.y=hsh(x,y)*3; shade(g); }
      else if(t===T.ROCK) rocks.push([cx,cz]);
      else if(t===T.WALL) walls.push([x,y]);
      else if(t===T.DOME) domes.push([x,y]);
      else if(t===T.CEDAR) cedars.push([x,y]);
      else if(t===T.COLUMN){ const g=group(cx,0,cz,Rg); Cy(0.3,0.34,3.2,10,ART.stone,0,0,0,g); B(0.8,0.25,0.8,ART.stoneD,0,0,0,g); B(0.8,0.25,0.8,ART.stoneD,0,3.2,0,g); shade(g); }
      else if(t===T.LAVER){ const g=group(cx,0,cz,Rg); B(0.7,0.5,0.7,ART.bronze,0,0.14,0,g); [[-0.3,-0.3],[0.3,-0.3],[-0.3,0.3],[0.3,0.3]].forEach(([a,b])=>{ const w=Cy(0.14,0.14,0.05,10,ART.bronzeL,a,0.14,b,g); w.rotation.z=Math.PI/2; });
        const bw=Cy(0.48,0.3,0.36,12,ART.verd,0,0.64,0,g); Cy(0.42,0.42,0.02,12,0x4aa8c0,0,0.98,0,g); shade(g); spot(cx,cz,'Look','A laver',()=>ENGINE.speak('A laver',['A laver on its wheeled base: lions, oxen, and cherubim cast in its panels (1 Kings 7:29). It still holds water — the sea’s own.'])); }
      else if(t===T.CURRENT){ current(cx,cz); }
      else if(t===T.PILLAR_TOP){ const g=group(cx,0,y+1.5,Rg); Cy(0.42,0.46,5.2,12,ART.bronze,0,0,0,g); B(1.1,0.3,1.1,ART.bronze,0,0,0,g);
        const cap=Cy(0.62,0.44,0.9,12,ART.bronzeL,0,5.2,0,g); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; Sp(0.09,0x8a3a2a,Math.sin(a)*0.6,5.45,Math.cos(a)*0.6,g); } Sp(0.5,ART.bronzeL,0,6.2,0,g,10,6).scale.y=0.6; shade(g);
        const nm=x<26?'Jachin':'Boaz'; spot(cx,y+2.4,'Read',nm,()=>ENGINE.speak(nm,[x<26?'Jachin — “he shall establish.” The right pillar of the porch, brass, with lily-work and rows of pomegranates (1 Kings 7:21).':'Boaz — “in it is strength.” The left pillar of the porch, brass, with lily-work and rows of pomegranates (1 Kings 7:21).']),1.6); }
      else if(t===T.LAMPSTAND){ const g=group(cx,0,cz,Rg); B(0.5,0.12,0.5,ART.gold,0,0,0,g); Cy(0.05,0.07,1.5,8,ART.gold2,0,0.12,0,g); [-1,1].forEach(s=>{ const a=B(0.36,0.04,0.04,ART.gold2,s*0.18,1.3,0,g); Cy(0.04,0.03,0.25,6,ART.gold2,s*0.36,1.3,0,g); });
        const cups=[[-0.36,1.56],[0,1.64],[0.36,1.56]].map(([a,b])=>{ Cy(0.07,0.04,0.08,8,ART.goldL,a,b,0,g); const f=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.16,6),glow(0xffd27a)); f.position.set(a,b+0.16,0); g.add(f); return f; });
        shade(g); dyn.lamps[x+','+y]=cups; spot(cx,cz,'Light','A lampstand',()=>lamp(x,y),1.4); }
      else if(t===T.INNERDOOR){ const d=B(1,3.4,0.25,ART.gold2,cx,0,cz,Rg); d.userData.x=x; dyn.doors.push(d); spot(cx,cz+0.8,'Look','The inner doors',()=>{ if(!U().opened) ENGINE.speak('The inner doors',['The olive-wood doors are shut fast, gold over carved cherubim, palms, and open flowers. No handle, no lock. Only the house itself can open them.']); },1.2); }
      else if(t===T.CHEST){ const id=Object.keys(R.chests).find(k=>R.chests[k][0]===x&&R.chests[k][1]===y); if(!id) continue; const lid=CHEST3D.make(Rg,cx,cz); dyn.chests[id]=lid;   /* V165 */ spot(cx,cz,'Open','A chest',()=>chest(id)); }
      else if(t===T.TABLET){ const id=Object.keys(R.tablets).find(k=>R.tablets[k][0]===x&&R.tablets[k][1]===y); if(!id) continue; const g=group(cx,0,cz,Rg);
        B(0.7,1.1,0.18,id.startsWith('rec')?0x9a9a7a:0x8a8a80,0,0,0,g); B(0.56,0.86,0.02,id.startsWith('rec')?0xc8d8a0:0xb0aca0,0,0.12,0.1,g); B(0.8,0.14,0.3,ART.stoneD,0,0,0,g); shade(g); dyn.tablets[id]=g; spot(cx,cz,'Read','A tablet',()=>tablet(id)); } }
    inst(rocks,rockG,null,([x,z],m,c)=>{ m.makeRotationY(hsh(x,z)*6); m.scale(new THREE.Vector3(1.1,0.75,1.1)); m.setPosition(x,0.25,z); c.setHex(0x5a6470).offsetHSL(0,0,(hsh(z,x)-0.5)*0.1); },Rg);
    // the walls: dressed courses; out in the courts they're ruins, broken to ragged heights with fallen blocks and weed along them
    const wallH=(x,y)=>temple?2.8:1.2+hsh(x,y)*1.4, wset=new Set(walls.map(([x,y])=>x+','+y)), stoneM=bmat(0xffffff,'brick');
    inst(walls,UNIT,stoneM,([x,y],m,c)=>{ m.makeScale(1,wallH(x,y),1); m.setPosition(x+0.5,0,y+0.5); c.setHex(ART.stone).offsetHSL(0,0,(hsh(x,y)-0.5)*0.08); },Rg);
    if(temple) inst(walls,UNIT,stoneM,([x,y],m,c)=>{ m.makeScale(1.08,0.2,1.08); m.setPosition(x+0.5,2.8,y+0.5); c.setHex(ART.gold2); },Rg);     // a gilt cornice along the house's walls
    else { const tops=walls.filter(([x,y])=>hsh(y*3,x)<0.6), fall=walls.filter(([x,y])=>hsh(x*5,y)<0.25).map(([x,y])=>{ const d=[[1,0],[-1,0],[0,1],[0,-1]].find(([a,b])=>!wset.has((x+a)+','+(y+b))&&WALK.has(base[y+b]&&base[y+b][x+a]))||[0,1]; return [x+0.5+d[0]*0.75,y+0.5+d[1]*0.75,hsh(x,y)]; });
      inst(tops,UNIT,stoneM,([x,y],m,c)=>{ const r=hsh(x+3,y); m.makeRotationY((r-0.5)*0.3); m.scale(new THREE.Vector3(0.5+r*0.3,0.35+r*0.4,0.6)); m.setPosition(x+0.3+r*0.4,wallH(x,y),y+0.5); c.setHex(ART.stoneD).offsetHSL(0,0,(r-0.5)*0.08); },Rg);   // a ragged top
      inst(fall,UNIT,stoneM,([x,z,r],m,c)=>{ m.makeRotationFromEuler(new THREE.Euler((r-0.5)*0.5,r*3,(r-0.5)*0.6)); m.scale(new THREE.Vector3(0.45,0.3,0.36)); m.setPosition(x,0,z); c.setHex(ART.stoneD); },Rg);   // a block fallen from it
      const weed=walls.filter(([x,y])=>hsh(x,y*7)<0.4).map(([x,y])=>[x+0.5,y+0.5,wallH(x,y)]); const wg=new THREE.PlaneGeometry(1.02,1,1,3); wg.translate(0,-0.5,0);
      inst(weed,new THREE.BoxGeometry(1.03,1,1.03).translate(0,-0.5,0),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.75}),([x,z,h],m,c)=>{ m.makeScale(1,0.35+hsh(x*3,z)*0.5,1); m.setPosition(x,h,z); c.setHex(0x3a7a4a); },Rg); }   // weed hanging over the tops
    // the domes: the drowned city's roofs, a drum and a cupola on each
    const cup=new THREE.SphereGeometry(0.5,12,7,0,Math.PI*2,0,Math.PI/2);
    inst(domes,UNIT,stoneM,([x,y],m,c)=>{ m.makeScale(0.92,0.35+hsh(y,x)*0.5,0.92); m.setPosition(x+0.5,0,y+0.5); c.setHex(0x9a9480).offsetHSL(0,0,(hsh(x,y)-0.5)*0.08); },Rg);
    inst(domes,cup,detailify(new THREE.MeshLambertMaterial()),([x,y],m,c)=>{ m.makeScale(0.9,0.9+hsh(x*3,y)*0.8,0.9); m.setPosition(x+0.5,0.35+hsh(y,x)*0.5,y+0.5); c.setHex(hsh(x,y*5)<0.5?0x5a9a80:0xa89a78).offsetHSL(0,0,(hsh(x,y)-0.5)*0.08); },Rg);
    inst(cedars,UNIT,null,([x,y],m,c)=>{ m.makeScale(1,4,1); m.setPosition(x+0.5,0,y+0.5); c.setHex(ART.cedar).offsetHSL(0,0,(hsh(x,y)-0.5)*0.04); },Rg);
    inst(cedars,UNIT,null,([x,y],m,c)=>{ m.makeScale(1.02,0.18,1.02); m.setPosition(x+0.5,3.4,y+0.5); c.setHex(ART.gold2); },Rg);
    // ── the large pieces ──
    for(const k in R.obj){ const [fn,x,y,w,h]=R.obj[k];
      if(k==='temple'){ const g=group(0,0,0,Rg), st=0xa49e8a, dx=D.door[0][0], dz=y+h;   // hewn stone, the doorway between the pillars
        B(dx-x,7,h,st,x+(dx-x)/2,0,y+h/2,g); B(x+w-dx-2,7,h,st,dx+2+(x+w-dx-2)/2,0,y+h/2,g); B(2,7,h-1.3,st,dx+1,0,y+(h-1.3)/2,g); B(2,3.6,1.3,st,dx+1,3.4,dz-0.65,g);
        B(w+0.4,0.4,h+0.4,0xb8a878,x+w/2,7,y+h/2,g); B(w+0.2,0.25,0.3,ART.gold2,x+w/2,6.2,dz+0.05,g);
        const dk=new THREE.Mesh(new THREE.PlaneGeometry(2,3.4),new THREE.MeshBasicMaterial({color:0x140c06})); dk.position.set(dx+1,1.7,dz-1.29); g.add(dk);
        for(let i=0;i<4;i++){ B(0.6,1.4,0.05,0x2a2418,x+1.5+i*1.4,4,dz+0.02,g); B(0.6,1.4,0.05,0x2a2418,x+w-1.5-i*1.4,4,dz+0.02,g); } shade(g);
        [x+3,x+w-3].forEach(sx=>spot(sx,dz+0.9,'Look','The house',()=>ENGINE.speak('The house',['The house of the LORD, standing in the deep. Hewn stone, every block made ready before it was brought (1 Kings 6:7).','The way in is the doorway between the pillars.']),1.6)); }
      else if(k==='altar'){ const g=group(x+w/2,0,y+h/2,Rg); B(w,1.3,h,ART.bronze,0,0,0,g); B(w+0.1,0.1,h+0.1,ART.bronzeL,0,1.3,0,g); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>Co(0.12,0.35,4,ART.bronzeL,a*(w/2-0.15),1.4,b*(h/2-0.15),g)); shade(g);
        spot(x+w/2,y+h+0.6,'Look','The altar of brass',()=>ENGINE.speak('The altar of brass',['The altar of brass, long cold (2 Chronicles 4:1). No fire has burned here in an age.','Its horns still point to the four winds.']),1.6); }
      else if(k==='sea'){ const g=group(x+w/2,0,y+h/2,Rg); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2+Math.PI/12, o=group(Math.sin(a)*1.0,0,Math.cos(a)*1.0,g); o.rotation.y=a; B(0.26,0.4,0.5,ART.bronze,0,0.2,0,o); B(0.2,0.2,0.18,ART.bronzeL,0,0.48,0.3,o); [-1,1].forEach(s=>B(0.08,0.2,0.08,ART.bronze,s*0.09,0,0.15,o)); }
        Cy(1.55,1.15,1.0,18,ART.bronze,0,0.9,0,g); Cy(1.45,1.45,0.02,18,0x3a9ab8,0,1.85,0,g); const lip=new THREE.Mesh(new THREE.TorusGeometry(1.52,0.07,6,24),flat(ART.bronzeL)); lip.rotation.x=Math.PI/2; lip.position.y=1.9; g.add(lip); shade(g);
        spot(x+w/2,y+h+0.5,'Look','The Molten Sea',()=>ENGINE.speak('The Molten Sea',['The Molten Sea: ten cubits brim to brim, standing upon twelve oxen, three looking to each quarter (1 Kings 7:23-25).','It was made for the priests to wash in. Now the whole sea washes over it.']),1.8); }
      else if(k==='cherubW'||k==='cherubE'){ const s=k==='cherubW'?-1:1, g=group(x+w/2,0,y+1.5,Rg); Cy(0.35,0.45,2.4,10,ART.gold2,0,0,0,g); Sp(0.32,ART.goldL,0,2.75,0,g,10,8);
        const out=B(2.5,0.08,1.0,ART.goldL,s*1.25,2.4,-0.2,g); out.rotation.z=s*0.18; const inn=B(2.5,0.08,1.0,ART.goldL,-s*1.25,2.4,-0.2,g); inn.rotation.z=-s*0.18; shade(g);
        spot(x+w/2,y+h+0.4,'Look','The cherubim',()=>ENGINE.speak('The cherubim',['Two cherubim of olive wood overlaid with gold, ten cubits high. The wing of the one touches the one wall, the wing of the other the other wall, and their wings touch one another in the midst of the house (1 Kings 6:23-27).']),1.6); }
      else if(k==='humble'){ const g=group(x+w/2,0,y+0.5,Rg); B(0.66,0.36,0.44,0x8a6a48,0,0,0,g); const lid=group(0,0.36,-0.22,g); B(0.66,0.08,0.44,0x9a7a58,0,0,0.22,lid); B(0.04,0.4,0.46,0xd8c8a0,0,-0.02,0.22,lid); shade(g); dyn.humble=lid; dyn.chests.humble=lid;
        spot(x+w/2,y+1.4,'Open','A humble chest',()=>chest('humble'),1.3); } }
    // ── the people of the deep ──
    if(R.npc.zebulun){ const [x,y]=R.npc.zebulun, f=addPerson(lv,Rg,'fisher',x+0.5,y+0.5,0,'Zebulun the Pearl-Diver',null,{rest:Math.PI/2}); f.action=()=>zebulun(f); }
    if(R.npc.tirzah){ const [x,y]=R.npc.tirzah, f=addPerson(lv,Rg,'scribe',x+0.5,y+0.5,0,'Tirzah, Keeper of the Records',null,{rest:0,her:{main:'#2a6a7a',trim:'#e8e6e0'}}); f.action=()=>tirzah(f); }
    // ── the life of the sea: drifting snow, god-rays, fish ──
    { const n=500, pos=new Float32Array(n*3); for(let i=0;i<n;i++){ pos[i*3]=Math.random()*W; pos[i*3+1]=Math.random()*8; pos[i*3+2]=Math.random()*H; }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xcfefff,size:0.06,transparent:true,opacity:0.6,depthWrite:false})); Rg.add(pts);
      an.push((t,dt)=>{ dt=dt||0.016; for(let i=0;i<n;i++){ let y=pos[i*3+1]-dt*0.12; if(y<0) y=8; pos[i*3+1]=y; pos[i*3]+=Math.sin(t*0.5+i)*0.002; } geo.attributes.position.needsUpdate=true; }); }
    if(!temple) for(let i=0;i<7;i++){ const ray=new THREE.Mesh(new THREE.PlaneGeometry(2.2,16),new THREE.MeshBasicMaterial({color:0xbff4ff,transparent:true,opacity:0.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      ray.position.set(6+i*6.5+hsh(i,3)*3,7,6+hsh(3,i)*(H-12)); ray.rotation.set(0,hsh(i,9)*3,0.35); Rg.add(ray); const k=i; an.push(t=>{ ray.material.opacity=0.05+0.03*Math.sin(t*0.6+k); }); }
    const schools=temple?[[24.5,25,0xe8c050]]:[[10,22,0xe8905a],[38,12,0x5ab0e8],[30,38,0xf2d27a],[8,36,0xd8586a]];
    schools.forEach(([sx,sz,col],si)=>{ const fish=[]; for(let i=0;i<9;i++){ const g=group(0,0,0,Rg); B(0.08,0.14,0.28,col,0,-0.07,0,g); Co(0.07,0.14,3,col,0,-0.07,-0.2,g).rotation.x=-Math.PI/2; fish.push(g); }
      an.push(t=>{ fish.forEach((g,i)=>{ const a=t*(0.35+si*0.04)+i*0.25, r=2.6+Math.sin(i*1.7)*0.7; g.position.set(sx+Math.sin(a)*r,1.4+Math.sin(t+i)*0.4+(i%3)*0.3,sz+Math.cos(a)*r); g.rotation.y=a+Math.PI/2; }); }); });
    // ── the house's light: four lampstands bear the prayer; once it is prayed, all ten burn ──
    const holy=temple?new THREE.PointLight(0xffd890,0,26,1.6):null; if(holy){ holy.position.set(15,5,20); scene.add(holy); }
    const doorOpen=[0];
    function showLamps(){ const u=U(); for(const k in dyn.lamps){ const [x,y]=k.split(',').map(Number), lit=u.opened||u.lamps.some(id=>{ const p=D.prayer[id]; return p[0]===x&&p[1]===y; }); dyn.lamps[k].forEach(f=>f.visible=lit); }
      if(holy) holy.intensity=u.opened?0.55:0.1*u.lamps.length; hemi.intensity=temple?(u.opened?0.85:0.55):0.8; }
    function showState(){ const u=U(); showLamps(); for(const id in dyn.chests) CHEST3D.set(dyn.chests[id],!!u.chests[id]); for(const id in dyn.tablets) dyn.tablets[id].visible=!(/^rec/.test(id)&&u.tablets[id]); }
    an.push((t,dt)=>{ dt=dt||0.016; const u=U(); doorOpen[0]+=((u.opened?1:0)-doorOpen[0])*Math.min(1,dt*1.5); dyn.doors.forEach(d=>{ const s=d.userData.x===D.innerDoor[0][0]?-1:1; d.position.x=d.userData.x+0.5+s*doorOpen[0]*0.9; d.scale.x=1-doorOpen[0]*0.8; }); });
    lv.onEnter=()=>{ showState(); const u=U(); u.at={room:name,x:P.x,z:P.z}; };
    let saveT=0; an.push((t,dt)=>{ if(ENGINE.level!==lv) return; saveT+=dt||0.016; if(saveT>1){ saveT=0; U().at={room:name,x:P.x,z:P.z}; } thresholds(); });
    // walking in and out of the house
    let crossing=false; lv.onLeave=()=>{ crossing=false; };
    function thresholds(){ if(crossing||ENGINE.busy) return; const tx=Math.floor(P.x), ty=Math.floor(P.z), on=L=>L.some(([x,y])=>x===tx&&y===ty);
      if(!temple&&on(D.door)){ crossing=true; ENGINE.go('deep:temple',{x:D.arrive[0]+0.5,z:D.arrive[1]+0.5,face:Math.PI}); const u=U();
        if(!u.met.house){ u.met.house=true; GAME.save(); setTimeout(()=>ENGINE.speak('The house within',['🕯 “And the house, when it was in building, was built of stone made ready before it was brought thither: so that there was neither hammer nor axe nor any tool of iron heard in the house.” — 1 Kings 6:7']),500); } }
      else if(temple&&on(D.exit)){ crossing=true; ENGINE.go('deep:courts',{x:D.doorIn[0]+0.5,z:D.doorIn[1]+0.5,face:0}); } }
    // ── what you can do ──
    function spot(x,z,label,who,action,r){ lv.spots.push({x,z,r:r||1.3,label,who,action}); }
    function current(cx,cz){ const g=group(cx,0,cz,Rg); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.05,6,20),new THREE.MeshBasicMaterial({color:0x9ff0ff,transparent:true,opacity:0.7})); ring.rotation.x=Math.PI/2; ring.position.y=0.05; g.add(ring);
      const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.5,9,14,1,true),new THREE.MeshBasicMaterial({color:0x9ff0ff,transparent:true,opacity:0.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); shaft.position.y=4.5; g.add(shaft);
      const bub=[]; for(let i=0;i<10;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),bubMat); g.add(b); bub.push(b); }
      an.push(t=>{ ring.rotation.z=t*1.5; ring.scale.setScalar(1+Math.sin(t*3)*0.08); bub.forEach((b,i)=>{ const k=(t*0.4+i/10)%1; b.position.set(Math.sin(i*2.3+t*2)*0.3,k*8,Math.cos(i*1.9+t*2)*0.3); b.scale.setScalar(0.6+k*1.2); }); });
      const id=Object.keys(D.entry).find(k=>D.entry[k][0]+0.5===cx&&D.entry[k][1]+0.5===cz);
      spot(cx,cz,'Surface','A rising current',()=>surface(id||U().from||'A'),1.0); }
    function chest(k){ const u=U(); if(u.chests[k]){ UI.toast('The chest hangs open. Nothing more here.',1100); return; } if(k==='humble'&&!u.opened){ return; }
      const L=D.loot[k]; if(!L) return; u.chests[k]=true; if(dyn.chests[k]) CHEST3D.open(dyn.chests[k]); else showState();
      if(L.decor){ const s=S(), h=s.homesteadDecor||(s.homesteadDecor={inv:{},placed:[]}); h.inv=h.inv||{}; h.inv[L.decor]=(h.inv[L.decor]||0)+1; const it=(PASTIME_DATA.trade.decor||{})[L.decor]||{emoji:'📦',name:L.decor};
        if(k==='humble') ENGINE.speak('A humble chest',['A small chest of plain wood, tied with cord. Nothing on it is gold.','Inside, wrapped in linen: a cross of rough timber.','“But God forbid that I should glory, save in the cross of our Lord Jesus Christ” — Galatians 6:14','✝️ The Wooden Cross is yours, to raise at your Homestead (☰ Home).']);
        else UI.toast(`📦 ${it.emoji} ${it.name}! A Homestead decoration — place it from your ☰ Home tab.`,3000); }
      else if(L.pearls){ u.pearls+=L.pearls; UI.toast(`🦪 ${L.pearls} pearl${L.pearls>1?'s':''}! You carry ${u.pearls}. Zebulun the pearl-diver pays well for them.`,2600); }
      GAME.changed(); GAME.save(); }
    function tablet(k){ const u=U();
      if(/^rec/.test(k)){ if(!u.tablets[k]){ u.tablets[k]=true; showState(); GAME.save(); const n=['rec1','rec2','rec3'].filter(id=>u.tablets[id]).length;
          UI.toast(`📜 A record tablet (${n} of 3). Its letters are worn but whole. Tirzah, keeper of the records, will want it.`,2800); } return; }
      if(k==='porch'){ ENGINE.speak('The porch stone',['Letters cut deep into the porch stone:','“PRAY AS THE PROPHET PRAYED, FROM THE DEEP TO THE DELIVERANCE, AND THE HOUSE WILL BE FILLED WITH LIGHT.”']); return; }
      if(k==='ps104'){ codex('The drowned courts','Psalm 104:24-26','O LORD, how manifold are thy works! in wisdom hast thou made them all: the earth is full of thy riches. So is this great and wide sea, wherein are things creeping innumerable, both small and great beasts. There go the ships: there is that leviathan, whom thou hast made to play therein.');
        ENGINE.speak('A tablet',['“O LORD, how manifold are thy works! in wisdom hast thou made them all: the earth is full of thy riches.”','“So is this great and wide sea, wherein are things creeping innumerable, both small and great beasts.” — Psalm 104:24-25']); return; }
      if(k==='micah'){ codex('The Most Holy Place, drowned','Micah 7:19','He will turn again, he will have compassion upon us; he will subdue our iniquities; and thou wilt cast all their sins into the depths of the sea.');
        ENGINE.speak('A tablet',['“He will turn again, he will have compassion upon us; he will subdue our iniquities; and thou wilt cast all their sins into the depths of the sea.” — Micah 7:19','Here, in the depths of the sea, the words read differently.']); } }
    function lamp(tx,ty){ const u=U(); if(u.opened){ UI.toast('The lampstand burns steady. The house is full of light.',1300); return; }
      const id=Object.keys(D.prayer).find(k=>D.prayer[k][0]===tx&&D.prayer[k][1]===ty); if(!id){ UI.toast('This lampstand bears no words. It will not take the flame.',1500); return; }
      const Tx=D.text[id]; if(u.lamps.includes(id)){ UI.toast(`🕯 “${Tx[1]}” — ${Tx[0]}`,2800); return; }
      if(id!==D.order[u.lamps.length]){ u.lamps=[]; showLamps(); GAME.save(); ENGINE.speak('The lampstand',['💨 The flames gutter out.',`“${Tx[1]}” — not yet. Pray as the prophet prayed.`]); return; }
      u.lamps.push(id); showLamps();
      if(u.lamps.length<D.order.length){ GAME.save(); ENGINE.speak('The lamp takes the flame',[`🕯 “${Tx[1]}” — ${Tx[0]}`]); return; }
      u.opened=true; u.livery=true; showState(); GAME.changed(); GAME.save();
      ENGINE.speak('The Drowned House',['“Salvation is of the LORD.”','One by one, all ten lampstands take the flame, and the house is filled with light.','The olive-wood doors of the inner house swing open.','🧥 A livery is laid by the doors: Deepwater Pearl. Wear it from the wardrobe in your house, or ☰ Home.']); }
    lv.refresh=showState; levels[name]=lv; return lv; }

  // ════ Zebulun and Tirzah ════
  function zebulun(f){ const N='Zebulun the Pearl-Diver', u=U();
    if(!u.met.zebulun){ u.met.zebulun=true; GAME.save(); ENGINE.speak(N,['Ho! A knight, riding a dragon of the deep! Come in out of the water — well, out of MOST of it.',
      'I am Zebulun. My fathers’ blessing was that we would “dwell at the haven of the sea” (Genesis 49:13). I took it further than they meant.',
      'These are the courts of a house built long ago for the LORD’s name. The sea took the city; it never took the house.',
      `I dive for pearls in the old chests. Bring me any you find — ${D.pearl} gold apiece, and a blessing thrown in free.`],f); return; }
    if(u.pearls>0){ const n=u.pearls, g=n*D.pearl; u.pearls=0; u.sold+=n; S().gold+=g; GAME.changed(); GAME.save();
      ENGINE.speak(N,['He weighs each pearl in his palm and holds it up to the lamplight.','“The kingdom of heaven is like unto a merchant man, seeking goodly pearls” (Matthew 13:45). Well, here I am!',`💰 +${g} gold for ${n} pearl${n>1?'s':''}.`],f); return; }
    ENGINE.speak(N,[['“O LORD, how manifold are thy works!” I say it every morning, and every morning I mean it more.','Mind the Sea by the porch — the great bronze basin. Twelve oxen, and not one has blinked in a thousand years.','The pillars at the porch have names. Read them. Names are how the LORD’s people remembered.'][u.sold%3]],f); }
  let quizOpen=false;
  function tirzah(f){ const N='Tirzah, Keeper of the Records', u=U(), have=['rec1','rec2','rec3'].filter(id=>u.tablets[id]).length;
    if(u.quiz){ ENGINE.speak(N,['The records are whole, and you have understood them. That is rarer than finding them.','“Salvation is of the LORD.” Remember where Jonah was when he learned it.'],f); return; }
    if(!u.met.tirzah){ u.met.tirzah=true; GAME.save(); ENGINE.speak(N,['You came down on purpose. Few do.','I keep the records of this house. Three tablets were scattered when the waters came: one in the courts, one in the fallen chambers, and one in the inner house, which no one has entered since.','Bring them to me, and then tell me what they say. A record no one understands is only a stone.'],f); return; }
    if(have<3){ ENGINE.speak(N,[`You have found ${have} of the three.`+(u.opened?'':' The last lies beyond the inner doors — and those open only to prayer.')],f); return; }
    ENGINE.speak(N,['All three. Let me read them to you — they are the prayer of Jonah, from the belly of the fish.','Now: what did you hear?'],f,()=>quiz()); }
  function quiz(){ let i=0, pick=-1, answered=false; quizOpen=true;
    const draw=()=>{ if(!quizOpen) return; const Q=D.quiz[i]; let h=`<p class="gm-intro" style="font-size:15px">${UI.esc(Q.q)}</p>`;
      if(!answered){ Q.o.forEach((o,k)=>{ h+=`<button class="gm-item" data-act="a:${k}"><span>${String.fromCharCode(65+k)}. ${UI.esc(o)}</span></button>`; }); h+=`<button class="gm-item" data-act="x"><span>↩ Leave for now</span></button>`; }
      else { const ok=pick===Q.a; h+=`<p class="gm-note" style="color:${ok?'#6fdf8a':'#ff8a8a'};font-weight:700">${ok?'✓ Yes.':'✗ Not so. Read it again.'}</p><button class="gm-item worn" data-act="go"><span>${ok?(i<D.quiz.length-1?'Next ▶':'✓ Finish'):'↻ Try again'}</span></button>`; }
      UI.sheet({title:`📜 Tirzah’s Questions — ${i+1} of ${D.quiz.length}`,html:h,act:a=>{ if(a==='x'){ quizOpen=false; UI.close(); return; }
          if(a.startsWith('a:')){ pick=+a.slice(2); answered=true; draw(); return; }
          if(a==='go'){ if(pick!==D.quiz[i].a){ answered=false; pick=-1; draw(); return; } if(i<D.quiz.length-1){ i++; answered=false; pick=-1; draw(); return; } quizOpen=false; UI.close(); done(); } },close:()=>{ quizOpen=false; }}); };
    const done=()=>{ const u=U(), s=S(); u.quiz=true; u.barding=true; s.mountSkinOwned=s.mountSkinOwned||{}; s.mountSkinOwned.uwcoral=true;
      codex('The keeper’s records','Jonah 2:9','But I will sacrifice unto thee with the voice of thanksgiving; I will pay that that I have vowed. Salvation is of the LORD.'); GAME.changed(); GAME.save();
      ENGINE.speak('Tirzah, Keeper of the Records',['You heard it. From the deep to the deliverance.','Take this. It was made for a steed of the sea long ago, and it has waited long enough.','🪸 Coral Barding for your Sea Dragon! Put it on from the ☰ Pet tab.']); };
    draw(); }

  // ════ the Sea Dragon under you, in every room of the deep ════
  let steed=null, sKey='', lx=0, lz=0;
  function steedTick(lv,t,dt){ const p=S().pet; if(!p) return; const key=(typeof PETLOOKS!=='undefined'?PETLOOKS.key(S()):'')+lv.id;
    if(!steed||sKey!==key){ if(steed&&steed.parent) steed.parent.remove(steed); const L=STEED_LOOK.steadfast; steed=horseModel({kind:L.kind,coat:L.coat,mane:L.mane});
      if(typeof petLookApply!=='undefined') petLookApply(steed,PETLOOKS.shown(),S().mountSkin,'dragon'); lv.scene.add(steed); sKey=key; }
    const sp=Math.min(1,Math.hypot(P.x-lx,P.z-lz)/Math.max(1e-3,dt)/8); lx=P.x; lz=P.z;
    steed.scale.setScalar(0.85); steed.position.set(P.x,0.25+Math.sin(t*1.6)*0.08,P.z); steed.rotation.y=P.face; steed.userData.gallop(t*0.6,sp*0.7,0);
    K.position.set(P.x,steed.position.y+1.12*0.85,P.z); K.rotation.y=P.face; }
  ['courts','temple'].forEach(n=>ENGINE.add({id:'deep:'+n,lazy:()=>{ const lv=room(n); lv.anim.push((t,dt)=>{ if(ENGINE.level===lv) steedTick(lv,t,dt||0.016); }); return lv; }}));
  // (ENGINE.add with lazy: the room is raised the first time you go there; room() re-adds the built level)

  // ════ the Quests tab ════
  function quest(){ const u=U(); if(!Object.keys(u.visited).length) return '';   // a secret until you have been down
    const rec=['rec1','rec2','rec3'].filter(id=>u.tablets[id]).length, left=Object.keys(D.loot).filter(k=>!u.chests[k]).length;
    const q=(t,b)=>`<div class="gm-q"><b>${t}</b> — ${b}</div>`;
    return '<hr>'+q(u.opened?'✓ The Drowned House':'🌊 The Drowned House',u.opened?'The house is filled with light.':'Four lampstands in the Holy Place bear Jonah’s prayer. Pray as the prophet prayed.')
      +q(u.quiz?'✓ The Keeper’s Records':'📜 The Keeper’s Records',u.quiz?'Tirzah’s questions answered.':`Record tablets found: <b>${rec}</b> of 3${rec>=3?' — return to Tirzah.':'.'}`)
      +q(left?'🦪 Treasures of the Deep':'✓ Treasures of the Deep',left?`Chests still unopened: <b>${left}</b>. Pearls carried: <b>${u.pearls}</b>.`:'Every chest opened.'); }
  // a save made underwater comes back underwater, where it was made (uwRestore)
  function restore(){ const s=S(); if(!s.uw||!s.uw.at||!canDive()) return false; const a=s.uw.at; if(!D.rooms[a.room]) return false;
    setTimeout(()=>ENGINE.go('deep:'+a.room,{x:a.x,z:a.z,face:Math.PI}),350); return true; }
  const api={quest,restore,canDive}; DEEP_API.cur=api; return api;
}
// a web of caustic light, tiled: bright wavy cell edges on black
function causticTex(){ if(causticTex.t) return causticTex.t; const n=128, cv=document.createElement('canvas'); cv.width=cv.height=n; const g=cv.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,n,n);
  const pts=[]; for(let i=0;i<22;i++) pts.push([Math.random()*n,Math.random()*n]);
  const img=g.getImageData(0,0,n,n), d=img.data;
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){ let a=1e9,b=1e9; for(const [px,py] of pts) for(let ox=-n;ox<=n;ox+=n) for(let oy=-n;oy<=n;oy+=n){ const dd=(x-px-ox)**2+(y-py-oy)**2; if(dd<a){ b=a; a=dd; } else if(dd<b) b=dd; }
    const e=Math.sqrt(b)-Math.sqrt(a), v=Math.max(0,1-e/3.5)**2*255; const i=(y*n+x)*4; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; }
  g.putImageData(img,0,0); const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return (causticTex.t=t); }
