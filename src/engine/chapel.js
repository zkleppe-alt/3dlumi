// ════════════════════════════════════════════════════════════════
//  CHAPEL — a town's chapel before it is cleansed: the climb to the general.
//  Floors are the game's own (tools/extract_dungeon.py → data/chapel<N>.json): the mazes with their
//  plaza, key and stone; the library of three books and the chair by the fire; the lampstand ring;
//  the sanctum with its guardian. The rules are the game's: demons on their posts patrol and chase,
//  the stair will not take you while one lives, a wrong lampstand gutters, a fall wakes you by the
//  last fire you rested at (or outside), and the freed general asks the trial before the blessing.
//  chapelLevels(C, {id, town, exit:{level,spawn}, colours, onCleanse}) → {enter()}
// ════════════════════════════════════════════════════════════════
const txt=s=>String(s).replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');
function chapelLevels(C,spec){
  const td=C.td, F=C.floors, Tl=C.tiles, T=CHAPEL_THEME(C.town!==undefined?C.town:spec.town), pal=Object.assign({wall:0x5a5470,top:0x6e6888,fA:0x4a4658,fB:0x423e50,glow:0xa8e0d8,accent:0x5a3a7a},{wall:T.wall,top:T.top,fA:T.fA,fB:T.fB},spec.colours||{});   // dressed for the town and its guardian (chapel_themes.js)
  const SOLID=new Set([1,16,20,41,44,58,57,21,22,23,24,25,6,5,7,9,17,26,49,50,51,52,53,54,56]);
  let R=null; const fresh=()=>({cleared:{},chests:{},opened:{},lit:{},hasKey:false,risen:{},bossDead:false,checkpoint:null,mirrors:0,briefed:false});
  const idOf=i=>spec.id+':'+i; let N=F.length;
  function arrival(i,returning){ const g=F[i].grid; let want=returning?2:8, at=null;
    for(let y=0;y<g.length&&!at;y++) for(let x=0;x<g[0].length;x++) if(g[y][x]===want){ at={x,y}; break; }
    if(!at){ at=F[i].arrive; return {x:at.x+0.5,z:at.y+0.5,face:Math.PI,yaw:0}; }
    for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){ const r=g[at.y+dy]; if(r&&r[at.x+dx]===0){ let k=1; if(F[i].open) while(k<4&&g[at.y+dy*(k+1)]&&g[at.y+dy*(k+1)][at.x+dx*(k+1)]===0) k++;   /* in an open hall, a few steps in: room for the camera behind */
      return {x:at.x+dx*k+0.5,z:at.y+dy*k+0.5,face:dy<0?Math.PI:dy>0?0:dx<0?-Math.PI/2:Math.PI/2,yaw:dy<0?0:Math.PI}; } }
    return {x:at.x+0.5,z:at.y+0.5,face:Math.PI,yaw:0}; }
  function enter(){ R=fresh(); GAME.save(); ENGINE.go(idOf(0),lv=>arrival(0,false)); }
  function leave(msg){ const e=spec.exit; ENGINE.go(e.level,e.spawn); if(msg) setTimeout(()=>UI.toast(msg,2200),450); }
  function give(items){ const parts=[], S=GAME.S;
    for(const [kind,id,n] of items){ if(kind==='gold'){ const g=Math.round(id*S.goldMult); GAME.addGold(g); parts.push(g+' gold'); }
      else if(kind==='pot'){ S.inventory[id]=(S.inventory[id]||0)+n; const P=SYS.POTIONS[id]||{name:id,emoji:'🧪'}; parts.push(`${n>1?n+' ':''}${P.emoji} ${P.name}`); }
      else if(kind==='gear'){ const e=SYS.EQUIP[id]; if(e&&!S.ownedGear[id]){ S.ownedGear[id]=true; parts.push(`${e.emoji} ${e.name}`); } else { const g=Math.round((30+td.lvl*5)*S.goldMult); GAME.addGold(g); parts.push(g+' gold'); } } }
    GAME.changed(); return 'Chest: '+parts.join(' · ')+'!'; }
  function tabletPages(i){ const pages=['A tablet, cut deep and filled with old wax',
      'Rev 1:11 — What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.',
      'Rev 1:20 — The seven candlesticks which thou sawest are the seven churches.'];
    if(F[i].ring){ const lit=R.lit[i]||0; pages.push('Standing in this hall — two of the seven are not here. Light the rest as the verse names them.\n\n'+F[i].candles.map((c,k)=>(k<lit?'🕯 ':'· ')+c.church).join('\n')); }
    return pages; }
  // V151: the blessing — the knight kneels before the general; a shaft of light comes down upon him, motes rising round him
  function rite(done){ const L=ENGINE.level, P=ENGINE.P, G=L&&L._gen&&L._gen(); if(!L||!L.scene){ done(); return; }
    if(G) P.face=Math.atan2(G.g.position.x-P.x,G.g.position.z-P.z); ENGINE.hold(4.2,'kneel'); if(typeof SFX!=='undefined') SFX.play('levelUp');
    const sc=L.scene, beam=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.85,7,18,1,true),new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    beam.position.set(P.x,3.5,P.z); sc.add(beam); const lt=new THREE.PointLight(0xfff0c8,0,6,1.5); lt.position.set(P.x,2.2,P.z); sc.add(lt);
    const motes=[]; for(let i=0;i<26;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,4),new THREE.MeshBasicMaterial({color:i%3?0xffe8a8:0xffffff,transparent:true,opacity:0})); const a=Math.random()*6.28, r=0.2+Math.random()*0.5; m.position.set(P.x+Math.cos(a)*r,Math.random()*0.6,P.z+Math.sin(a)*r); m.userData={vy:0.4+Math.random()*0.7,a,r,d:Math.random()*1.2}; sc.add(m); motes.push(m); }
    UI.toast('🙏 You kneel before '+td.general+'. Light comes down upon you…',2600); let t=0;
    const tick=(tt,dt)=>{ t+=dt||0.016; const k=t<1.2?t/1.2:t<3.2?1:Math.max(0,1-(t-3.2)/0.9); beam.material.opacity=0.32*k; lt.intensity=1.8*k; beam.rotation.y+=dt*0.4;
      motes.forEach(m=>{ const u=m.userData; if(t<u.d) return; m.position.y+=u.vy*(dt||0.016); u.a+=(dt||0.016)*1.5; m.position.x=P.x+Math.cos(u.a)*u.r; m.position.z=P.z+Math.sin(u.a)*u.r; m.material.opacity=Math.max(0,Math.min(1,(t-u.d)*2))*Math.max(0,1-m.position.y/3.2)*k; if(m.position.y>3) m.position.y=0; });
      if(t>=4.1){ L.anim.splice(L.anim.indexOf(tick),1); sc.remove(beam); sc.remove(lt); motes.forEach(m=>sc.remove(m)); done(); } };
    L.anim.push(tick); }
  function trial(lv){ const t=C.trial, S=GAME.S, rw=SYS.EQUIP[C.reward];
    const ask=()=>UI.sheet({title:`${td.general}'s Trial`,wide:true,html:`<div class="gm-sec">${UI.esc(td.head)}</div><p class="gm-q">"Young knight, before I pass on my gift, answer rightly what you know of the faith I died defending."</p><p class="gm-q"><b>${UI.esc(t.q)}</b></p>`+
      t.o.map((o,i)=>`<button class="gm-item" data-act="${i}"><span>${String.fromCharCode(65+i)}. ${UI.esc(o)}</span></button>`).join('')+'<p class="gm-hint">Tap an answer.</p>',
      act:a=>{ const ok=+a===t.a;
        UI.sheet({title:`${td.general}'s Trial`,wide:true,html:`<div class="card${ok?'':' lost'}"><h3>${ok?'✓ Correct!':'✗ Not quite.'}</h3></div><p class="gm-q">${UI.esc(t.ex)}</p>`+
          (ok?`<div class="gm-sec">Reward</div><div class="gm-item worn"><span>${rw.emoji} ${UI.esc(rw.name)}${C.aog?' · '+SYS.EQUIP[C.aog].emoji+' '+UI.esc(SYS.EQUIP[C.aog].name):''} · +2 skill points</span></div><button class="gm-btn" data-act="go">🙏 Receive the blessing &amp; cleanse the town</button>`
              :`<button class="gm-btn" data-act="again">↻ Try again</button>`),
          act:b=>{ if(b==='again') ask(); else if(b==='go'){ S.ownedGear[C.reward]=true; if(C.aog) S.ownedGear[C.aog]=true; S.skillPoints+=2; S.chapels=Math.max(S.chapels,C.town+1); GAME.recalc(); S.hp=S.maxHp; GAME.changed(); GAME.save();
            UI.close(); rite(()=>{ if(spec.onCleanse) spec.onCleanse(); leave(`🙏 ${td.general} blesses you! ${td.name} is cleansed. 📖 ${td.div} restored.`); }); } } }); } });
    if(spec.trialDone&&spec.trialDone()){ UI.sheet({title:`${td.general}'s blessing`,wide:true,html:`<div class="gm-sec">${UI.esc(td.head)}</div><p class="gm-q">"You answered me below, in the light He gave you — and you broke my chains, and He gave me breath. Go with God, knight. I will hold the wall again.\"</p><div class="gm-item worn"><span>+2 skill points${C.aog?' · '+SYS.EQUIP[C.aog].emoji+' '+UI.esc(SYS.EQUIP[C.aog].name):''}</span></div><button class="gm-btn" data-act="go">🙏 Receive the blessing &amp; cleanse the town</button>`,
      act:b=>{ if(b!=='go') return; S.ownedGear[C.reward]=true; if(C.aog) S.ownedGear[C.aog]=true; S.skillPoints+=2; S.chapels=Math.max(S.chapels,C.town+1); GAME.recalc(); S.hp=S.maxHp; GAME.changed(); GAME.save(); UI.close(); rite(()=>{ if(spec.onCleanse) spec.onCleanse(); leave(`🙏 ${td.general} blesses you! ${td.name} is cleansed. 📖 ${td.div} restored.`); }); } }); return; }
    ask(); }

  // every open cell must be reachable from the way in. If a floor comes out of the generator in pieces,
  // knock through the fewest inner walls that join each piece to the rest (border walls are never touched).
  function joinFloor(f){ const g=f.grid, H=g.length, W=g[0].length, pass=t=>t===16||!SOLID.has(t), key=(x,y)=>y*W+x;
    let ax=f.arrive.x, ay=f.arrive.y; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(g[y][x]===8){ ax=x; ay=y; }
    const flood=()=>{ const seen=new Uint8Array(W*H), q=[[ax,ay]]; seen[key(ax,ay)]=1; while(q.length){ const [x,y]=q.pop();
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=W||ny>=H||seen[key(nx,ny)]||!pass(g[ny][nx])) continue; seen[key(nx,ny)]=1; q.push([nx,ny]); } } return seen; };
    let carved=0;
    for(let guard=0;guard<40;guard++){ const seen=flood(); let lost=null;
      for(let y=0;y<H&&!lost;y++) for(let x=0;x<W;x++) if(!seen[key(x,y)]&&pass(g[y][x])&&g[y][x]!==1){ lost=[x,y]; break; }
      if(!lost) break;
      // 0-1 BFS from the lost cell: open cells cost 0, inner walls cost 1; stop at the first reached cell
      const dist=new Int32Array(W*H).fill(1e9), prev=new Int32Array(W*H).fill(-1), dq=[[lost[0],lost[1]]]; dist[key(...lost)]=0; let hit=-1;
      while(dq.length){ const [x,y]=dq.shift(), k=key(x,y); if(seen[k]){ hit=k; break; }
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<1||ny<1||nx>=W-1||ny>=H-1) continue; const t=g[ny][nx]; if(t!==1&&!pass(t)) continue;
          const w=t===1?1:0, nk=key(nx,ny); if(dist[k]+w<dist[nk]){ dist[nk]=dist[k]+w; prev[nk]=k; if(w) dq.push([nx,ny]); else dq.unshift([nx,ny]); } } }
      if(hit<0) break; for(let k=hit;k>=0;k=prev[k]){ const x=k%W, y=(k/W)|0; if(g[y][x]===1){ g[y][x]=0; carved++; } } }
    if(carved) f.joined=carved; }
  // the sanctum is where the guardian is fought, so it gets room to run: every inner cell of the 2D hall becomes a 2×2 block
  // (open floor, water and ledger stone fill their block; a pillar, brazier, chest or the general stays one cell at its
  // block's corner), and every position the guardian's rules use — the demon, the way in, the chest, pages, stands,
  // bramble, grain, the altar, fires, columns and ledger cells — moves with it. Centre stays centre; the hall is twice as wide and long.
  const AREA=new Set([0,47,48]);
  function widenSanctum(f){ if((f.type!=='sanctum'&&f.type!=='library')||f.wide) return;   /* the sanctum, and the resting-room by the fire, drawn twice as broad */ const G=f.grid, W=G[0].length, H=G.length, S=2, m=v=>1+S*(v-1);
    const nW=2+S*(W-2), nH=2+S*(H-2), g=[]; for(let y=0;y<nH;y++){ const r=[]; for(let x=0;x<nW;x++){
      if(x===0||y===0||x===nW-1||y===nH-1){ const bx=x===0?0:x===nW-1?W-1:1+((x-1)/S|0), by=y===0?0:y===nH-1?H-1:1+((y-1)/S|0), bt=G[by][bx], on=(y===0||y===nH-1)?x===m(bx):y===m(by); r.push(bt!==1&&on?bt:1); continue; }   /* a door or a stair in the outer wall keeps its place */ const ox=1+((x-1)/S|0), oy=1+((y-1)/S|0), t=G[oy][ox];
      r.push(AREA.has(t)||(x===m(ox)&&y===m(oy))?t:0); } g.push(r); }
    // a point object leaves the rest of its block as the floor around it (water halls keep their water)
    for(let oy=1;oy<H-1;oy++) for(let ox=1;ox<W-1;ox++){ const t=G[oy][ox]; if(AREA.has(t)) continue; const nb=[G[oy][ox-1],G[oy][ox+1],G[oy-1][ox],G[oy+1][ox]].find(v=>AREA.has(v));
      for(let dy=0;dy<S;dy++) for(let dx=0;dx<S;dx++) if(dx||dy) g[m(oy)+dy][m(ox)+dx]=nb===undefined?0:nb; }
    // the general stands at the head of the hall, top row, centred
    const mv=o=>{ if(o&&typeof o.x==='number'&&typeof o.y==='number'){ o.x=m(o.x); o.y=m(o.y); } };
    mv(f.arrive); f.arrive.y=nH-5;   /* a few steps into the hall, so the camera has room behind you */ (f.demons||[]).forEach(mv); (f.chests||[]).forEach(mv); (f.columns||[]).forEach(mv); if(f.podium) mv(f.podium);
    Object.values(f.extra||{}).forEach(v=>{ if(Array.isArray(v)) v.forEach(o=>{ if(o&&o.cells){ const c=[]; o.cells.forEach(([x,y])=>{ for(let dy=0;dy<S;dy++) for(let dx=0;dx<S;dx++) c.push([m(x)+dx,m(y)+dy]); }); o.cells=c; } else mv(o); }); else mv(v); });
    f.grid=g; f.wide=S; }
  if(typeof DGEN!=='undefined'&&!C._open){ C._open=true;
    if(C.town>=4&&!F.some(f=>f.type==='maze2')){ const k=F.findIndex(f=>f.type==='maze'); if(k>=0) F.splice(k+1,0,JSON.parse(JSON.stringify(Object.assign({},F[k],{type:'maze2'})))); }   // deeper chapels go down further
    F.forEach((f,i)=>{ if(/^maze/.test(f.type)) DGEN.crypt(f,C.town,(C.town+1)*7919+i*131); }); }
  F.forEach(widenSanctum);
  F.forEach(joinFloor);
  N=F.length; F.forEach((f,i)=>ENGINE.add({id:idOf(i),lazy:()=>buildFloor(f,i)}));
  function buildFloor(f,i){ const G=f.grid, W=G[0].length, H=G.length, ftype=f.type, top=ftype==='sanctum';
    if(top&&!f._statues){ f._statues=true; let gx=W>>1, gy=1; G.forEach((r,y)=>r.forEach((v,x)=>{ if(v===7){ gx=x; gy=y; } }));   // the sanctum's statuary is solid (chapel_themes.js draws it)
      const pts=[]; Object.values(f.extra||{}).forEach(v=>(Array.isArray(v)?v:[v]).forEach(o=>{ if(o&&typeof o.x==='number') pts.push(o); if(o&&o.cells) o.cells.forEach(([x,y])=>pts.push({x,y})); })); (f.demons||[]).forEach(d=>pts.push(d));
      const free=(x,y)=>G[y]&&G[y][x]===0&&!pts.some(p=>p.x===x&&p.y===y);
      [gx-3,gx+3].forEach(x=>{ if(free(x,gy)) G[gy][x]=57; });
      [-8,8].forEach(dx=>{ const cells=[]; for(let y=gy+2;y<=gy+3;y++) for(let x=gx+dx-1;x<=gx+dx+1;x++) cells.push([x,y]); if(cells.every(([x,y])=>free(x,y))) cells.forEach(([x,y])=>G[y][x]=62); }); }
    let g=G.map(r=>r.slice()); const at=(x,y)=>g[y]&&g[y][x];
    const OPEN=!!f.open, scene=new THREE.Scene(), bg=new THREE.Color(T.bg); scene.background=bg; scene.fog=new THREE.Fog(bg,OPEN?T.fog[0]:9,OPEN?T.fog[1]:24);
    const lv={id:idOf(i),name:`${td.general}'s Chapel`,scene,folk:[],spots:[],anim:[],cam:{pitch:0.26,dist:3.0,min:1.6,max:5.2,lookH:0.15},speed:4.6,interior:true,actorS:0.78,dmapShow:true};   // halls to roam, the camera at your shoulder   // down in the halls, close behind you: the walls stand over you
    const hemi=new THREE.HemisphereLight(T.sky,T.gnd,T.hemiI*(OPEN?1:0.92)); scene.add(hemi);
    const lamp=new THREE.PointLight(T.lamp,1.2,11,1.4); scene.add(lamp); const key=new THREE.DirectionalLight(T.sky,0.25); key.position.set(W*0.3,12,H*0.7); scene.add(key);
    const room=group(0,0,0,scene), an=lv.anim, BLK=[];   // BLK: the solid furnishings, each a circle you walk round
    const CW=OPEN?4.2:3.4, RP=f.ramps||{}, hgt=(x,y)=>{ const t=at(x,y); return t===45?0.3:t===46?0.15:t===47?0.2:t===60?1.0:t===61?(RP[x+','+y]?RP[x+','+y].h0:0):0; };
    const hAt=(px,pz)=>{ const x=Math.floor(px), y=Math.floor(pz), t=at(x,y); if(t!==61) return hgt(x,y); const r=RP[x+','+y]; if(!r) return 0;   // up the stair: along its rise
      const u=r.dx>0?px-x:r.dx<0?1-(px-x):r.dy>0?pz-y:1-(pz-y); return r.h0+(r.h1-r.h0)*Math.max(0,Math.min(1,u)); };
    // floor, walls, the plaza
    const fl=[], wl=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x]; if(t===1) wl.push([x,y]); else fl.push([x,y,t]); }
    // only the walls that face a hall are drawn: the solid rock behind them is never seen (and drawing it all, overlapping, was most of a frame)
    if(OPEN){ const face=([x,y])=>{ for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ const t=G[y+dy]&&G[y+dy][x+dx]; if(t!==undefined&&t!==1) return true; } return false; }; const k=wl.filter(face); wl.length=0; wl.push(...k); }
    inst(fl,UNIT,T.shine?detailify(new THREE.MeshPhongMaterial({color:0xffffff,shininess:20+90*T.shine,specular:new THREE.Color(0x5a6070).multiplyScalar(T.shine)})):null,([x,y,t],m,cc)=>{ const h=hgt(x,y)+0.1; m.makeScale(1,h,1); m.setPosition(x+0.5,-0.1,y+0.5);
      cc.setHex(t===45||t===46?T.stair:t===59?0x07080e:t===48||t===47?0x1e3a46:t===55?0x2a2624:t===60?((x+y)%2?T.raised:new THREE.Color(T.raised).multiplyScalar(0.92).getHex()):((x+y)%2?pal.fA:pal.fB)).offsetHSL(0,0,(hsh(x,y)-0.5)*0.04); },room);
    // the stairs up to the galleries: three treads to a cell, each its own block
    Object.entries(RP).forEach(([k,r])=>{ const [x,y]=k.split(',').map(Number); for(let s=0;s<3;s++){ const h=r.h0+(r.h1-r.h0)*(s+1)/3, a=(s+0.5)/3-0.5, cxs=x+0.5+(r.dx?r.dx*a:0), czs=y+0.5+(r.dy?r.dy*a:0);
      B(r.dx?0.34:1,h,r.dy?0.34:1,T.stair,cxs,0,czs,room); } });
    const WI=wallInset((x,y)=>G[y]&&G[y][x]===1,(x,y)=>{ const t=G[y]&&G[y][x]; return t!==undefined&&t!==1&&!SOLID.has(t)||t===16; },OPEN?0.04:0.28);   // the halls drawn half again as wide
    inst(wl,UNIT,null,([x,y],m,cc)=>{ m.makeScale(1,0.1,1); m.setPosition(x+0.5,-0.1,y+0.5); cc.setHex((x+y)%2?pal.fA:pal.fB); },room);   // floor under the walls' drawn-back edges
    inst(wl,UNIT,bmat(0xffffff,'brick'),([x,y],m,cc)=>{ const q=WI.box(x,y); m.makeScale(q.sx,CW,q.sz); m.setPosition(q.cx,0,q.cz); cc.setHex(pal.wall).offsetHSL(0,0,(hsh(x,y)-0.5)*0.06); },room);
    inst(wl,UNIT,null,([x,y],m,cc)=>{ const q=WI.box(x,y); m.makeScale(q.sx+0.02,0.08,q.sz+0.02); m.setPosition(q.cx,CW,q.cz); cc.setHex(pal.top); },room);
    inst(wl,UNIT,null,([x,y],m,cc)=>{ const q=WI.box(x,y); m.makeScale(q.sx+0.04,0.22,q.sz+0.04); m.setPosition(q.cx,0,q.cz); cc.setHex(new THREE.Color(pal.wall).multiplyScalar(0.7).getHex()); },room);   // a darker plinth course
    wl.forEach(([x,y])=>{ if((x*3+y*5)%4) return; [[0,1],[0,-1],[1,0],[-1,0]].forEach(([a,b])=>{ if(at(x+a,y+b)!==0) return; B(a?0.06:0.3,CW-0.3,a?0.3:0.06,new THREE.Color(pal.wall).multiplyScalar(0.82).getHex(),x+0.5+a*(0.52-WI.m),0.22,y+0.5+b*(0.52-WI.m),room); }); });   // pilasters along the halls
    // a vault of darkness over the halls, so you look along them and not down on them
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W+4,H+4),new THREE.MeshBasicMaterial({color:0x07060c,side:THREE.DoubleSide})); ceil.rotation.x=Math.PI/2; ceil.position.set(W/2,CW+0.02,H/2); room.add(ceil);
    let VAULTS=[]; const roof=(fx,fz)=>{ for(const v of VAULTS) if(fx>v.x0+0.3&&fx<v.x1-0.3&&fz>v.z0+0.3&&fz<v.z1-0.3) return CW+v.top-0.6; return CW; };
    const camSolid=(fx,fz,y)=>{ const t=at(Math.floor(fx),Math.floor(fz)); return y>roof(fx,fz)-0.15||(((t===1&&!WI.free(fx,fz))||t===16||t===20||t===undefined)&&y<CW); };
    lv.camBlock=(fx,fz,y)=>{ if(camSolid(fx,fz,y)) return true; for(const [ox,oz] of [[0.14,0],[-0.14,0],[0,0.14],[0,-0.14]]) if(camSolid(fx+ox,fz+oz,y)) return true; return false; }; lv.camHard=(fx,fz,y)=>camSolid(fx,fz,y);   /* V160: a hand's breadth clear of the stone */
    // torches on the walls that face open floor (flames only: the light count stays fixed)
    wl.forEach(([x,y])=>{ if(hsh(x,y)>(OPEN?0.2:0.12)) return; const o=[[0,1],[0,-1],[1,0],[-1,0]].find(([a,b])=>{ const t=at(x+a,y+b); return t===0||t===60; }); if(!o) return; const fy=at(x+o[0],y+o[1])===60?1.0:0;
      const g=group(x+0.5+o[0]*(0.52-WI.m),fy,y+0.5+o[1]*(0.52-WI.m),room); B(0.08,0.3,0.08,0x3a3030,0,1.35,0,g); themeFlame(0,1.7,0,g,an,1.6,T); });
    // braziers in the great rooms of an open floor: a few real lights, fixed
    if(OPEN){ const BZ=[]; for(let y=2;y<H-2;y+=6) for(let x=2;x<W-2;x+=7){ if(at(x,y)!==0||[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>at(x+a,y+b)!==0)) continue; if(f.cxm!==undefined&&Math.abs(x-f.cxm)<=1) continue; if(f.arrive&&Math.hypot(x-f.arrive.x,y-f.arrive.y)<3.5) continue;
      const b=group(x+0.5,0,y+0.5,room); Cy(0.06,0.12,1.0,6,0x3a3438,0,0,0,b); Cy(0.3,0.16,0.24,8,0x4a4450,0,1.0,0,b); themeFire(b,an,0,1.18,0,0.8,T); BZ.push([x+0.5,y+0.5]); BLK.push({x:x+0.5,z:y+0.5,r:0.3}); }
      // two real lights, at the braziers nearest you (the rest burn as flames): the halls stay light enough to draw fast
      const PL=[0,1].map(()=>{ const l=new THREE.PointLight(T.fire[0],0,9,1.5); scene.add(l); return l; });
      an.push(t=>{ const P=ENGINE.P; BZ.slice().sort((a,b)=>Math.hypot(a[0]-P.x,a[1]-P.z)-Math.hypot(b[0]-P.x,b[1]-P.z)).slice(0,2).forEach((b,k)=>{ PL[k].position.set(b[0],1.7,b[1]); PL[k].intensity=0.9+Math.sin(t*9+k)*0.06; }); }); }
    const dyn={seals:[],candles:[],chests:{},podium:null,general:null};
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x], cx=x+0.5, cz=y+0.5;
      if(t===16){ const s=group(cx,0,cz,room); B(0.96,CW-0.05,0.96,0x6a6478,0,0,0,s); B(0.4,0.4,0.05,0x2a2430,0,0.55,0.49,s); B(0.12,0.2,0.06,0x0a0810,0,0.62,0.5,s); shade(s); dyn.seals.push(s); }
      else if(t===18){ const g=group(cx,0,cz,room); Cy(0.2,0.25,0.08,8,0x8a7a4a,0,0,0,g); Cy(0.04,0.05,0.9,6,0xc8a84a,0,0.08,0,g); Cy(0.16,0.1,0.08,8,0xc8a84a,0,0.95,0,g); Cy(0.04,0.04,0.14,6,0xf4eee0,0,1.02,0,g);
        const fl=Co(0.07,0.2,6,glow(0xffd27a),0,1.16,0,g); fl.visible=false; an.push(t2=>{ fl.scale.y=1+Math.sin(t2*10+x)*0.2; }); dyn.candles.push({x,y,fl}); }
      else if(t===20){ const o=[[0,1],[0,-1],[1,0],[-1,0]].find(([a,b])=>!SOLID.has(at(x+a,y+b)))||[0,1]; const g=group(cx,0,cz,room); B(0.96,CW,0.96,pal.wall,0,0,0,g); const tb=B(0.6,0.7,0.04,0xc8b890,o[0]*0.5,0.45,o[1]*0.5,g); tb.rotation.y=Math.atan2(o[0],o[1]); }
      else if(t===21){ const g=group(cx,0,cz,room); B(0.3,0.9,0.3,0x5a3a22,0,0,0,g); const tp=B(0.7,0.06,0.5,0x7a5432,0,0.95,0,g); tp.rotation.x=0.4; const bk=B(0.56,0.04,0.38,0xf4eee0,0,1.0,0,g); bk.rotation.x=0.4; shade(g); }
      else if(t===22){ if(ftype!=='library'){ const g=group(cx,0,cz,room); Cy(0.45,0.5,0.25,10,0x5a5462,0,0,0,g); fire(g,an,0,0.25,0,1.3); } }
      else if(t===23&&ftype!=='library'){ const g=group(cx,0,cz,room); g.rotation.y=-Math.PI/2; B(0.7,0.42,0.6,0x6a2a3a,0,0,0,g); B(0.7,0.6,0.15,0x6a2a3a,0,0.4,-0.22,g); B(0.12,0.28,0.6,0x6a2a3a,-0.3,0.42,0,g); B(0.12,0.28,0.6,0x6a2a3a,0.3,0.42,0,g); }
      else if(t===41){ const g=group(cx,0,cz,room); Cy(0.3,0.38,0.9,8,0x8a8494,0,0,0,g); const tb=B(0.5,0.05,0.4,0xc8b890,0,0.92,0,g); tb.rotation.x=0.3; }
      else if(t===42){ B(0.7,0.02,0.4,0xc8a84a,cx,0,cz,room); }
      else if(t===5){ dyn.chests[x+','+y]=CHEST3D.make(room,cx,cz); }   /* V165: the new chest */
      else if(t===45&&f.podium&&f.podium.x===x&&f.podium.y===y){ const kc=CHAPEL_CHEST(T); kc.g.position.set(cx,0.3,cz); room.add(kc.g); kc.g.visible=false; dyn.podium=kc.g; dyn.kc=kc; an.push((t2,dt)=>kc.tick(dt||0.016)); }
      else if(t===46){ B(1,0.15,0.4,0x7a7488,cx,0,y+0.8,room); }
      else if(t===58){ Cy(0.34,0.4,CW,10,T.stair,cx,0,cz,room); Cy(0.46,0.46,0.18,10,T.trim,cx,CW-0.18,cz,room); Cy(0.48,0.48,0.2,10,T.top,cx,0,cz,room); }
      else if(t===59){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.98,0.98),new THREE.MeshPhongMaterial({color:0x05060c,shininess:120,specular:0x8a90b0})); m.rotation.x=-Math.PI/2; m.position.set(cx,0.02,cz); room.add(m); }
      else if(t===2){ const g=group(cx,0,cz,room); for(let k=0;k<4;k++) B(0.9,0.18*(k+1),0.22,0x8a8494,0,0,0.35-k*0.22,g); const a=Co(0.14,0.3,4,glow(pal.glow),0,1.3,0,g); an.push(t2=>{ a.position.y=1.25+Math.sin(t2*3)*0.08; }); }
      else if(t===8){ const g=group(cx,0,cz,room); B(0.9,0.02,0.9,0x0a0810,0,0,0,g); for(let k=0;k<3;k++) B(0.86,0.05,0.18,0x5a5468,0,-0.05-k*0.05,-0.2+k*0.25,g); }
      else if(t===7){ const gg=group(cx,0.7,cz+0.25,room); const p=person('general',{tint:spec.tint||'#5a3a7a'}); gg.add(p); B(0.9,0.08,0.08,0x2a2034,0,0.9,0.12,gg); B(0.08,0.08,0.6,0x2a2034,-0.35,0.9,-0.1,gg); B(0.08,0.08,0.6,0x2a2034,0.35,0.9,-0.1,gg);
        const aura=new THREE.Mesh(new THREE.SphereGeometry(0.75,12,8),new THREE.MeshBasicMaterial({color:0x8a3ad8,transparent:true,opacity:0.18,depthWrite:false})); aura.position.y=0.8; gg.add(aura); dyn.general={g:gg,aura,x,y,fall:0};
        /* V150: entered from the catacombs, the general is DEAD — his body hung here in chains as the guardian's trophy, grey and still, until the guardian falls and the Lord raises him */
        if(spec.raise){ const G0=dyn.general; G0.mats=[]; p.traverse(m=>{ if(!m.isMesh||!m.material||!m.material.color) return; m.material=m.material.clone(); G0.mats.push({m:m.material,c:m.material.color.clone()}); m.material.color.lerp(new THREE.Color(0x7a7a80),0.65); });
          aura.material=aura.material.clone(); aura.material.color.setHex(0x3a1050); aura.material.opacity=0.22;
          const linkM=new THREE.MeshPhongMaterial({color:0x4a4a52,shininess:60,emissive:0x000000}); G0.linkM=linkM; G0.links=[]; const gp=gg.position.clone();
          [[[-0.3,1.15,0],[-1.25,2.9,-0.35]],[[0.3,1.15,0],[1.25,2.9,-0.35]],[[-0.12,0.12,0],[-0.75,-0.7,0.3]],[[0.12,0.12,0],[0.75,-0.7,0.3]]].forEach(([a,b2])=>{ const A0=gp.clone().add(new THREE.Vector3(...a)), B0=gp.clone().add(new THREE.Vector3(...b2)), L0=A0.distanceTo(B0), n2=Math.max(4,Math.round(L0/0.11));
            for(let k=0;k<n2;k++){ const u=(k+0.5)/n2, lk=new THREE.Mesh(new THREE.TorusGeometry(0.045,0.014,5,10),linkM); lk.position.copy(A0).lerp(B0,u); lk.position.y-=Math.sin(u*Math.PI)*0.08; lk.lookAt(B0); if(k%2) lk.rotateZ(Math.PI/2); room.add(lk); G0.links.push({m:lk,v:new THREE.Vector3()}); }
            const an2=B(0.16,0.16,0.16,0x2a2a30,B0.x,B0.y-0.08,B0.z,room); });
          } } }
    // sit somewhere a moment (a bench, the chair): held in place, then stood back up where you were
    const sitAt=(x,z,face,secs,onDone,each)=>{ if(ENGINE.holding) return false; const P=ENGINE.P, back={x:P.x,z:P.z}; P.x=x; P.z=z; P.face=face; ENGINE.hold(secs,'sit'); let el=0;
      const tick=(t,dt)=>{ el+=dt||0.016; P.x=x; P.z=z; P.face=face; if(each) each(Math.min(1,el/secs)); if(el>=secs){ an.splice(an.indexOf(tick),1); P.x=back.x; P.z=back.z; if(onDone) onDone(); } }; an.push(tick); return true; };
    { const D=CHAPEL_DRESS({T,f,at,CW,an,room,OPEN,i,town:C.town,W,H,wl,WI,hemi,bg,scene,top,blockers:BLK,sitAt,addSpot:o=>lv.spots.push(o),R:()=>R,tier:C.town,bossDead:()=>!!(R&&R.bossDead)}); VAULTS=D.vaults; lv._blk=BLK; if(D.warmRoof) room.remove(ceil); if(D.rest){ lv.onLeave=D.rest.leave; lv._restIn=D.rest.enter; }
      // the dark roof over the halls, open where a vault rises
      if(VAULTS.length){ room.remove(ceil); const v=VAULTS[0], E=-2, Wx=W+2, Hz=H+2, rects=[[E,E,Wx,v.z0],[E,v.z1,Wx,Hz],[E,v.z0,v.x0,v.z1],[v.x1,v.z0,Wx,v.z1]];
        rects.forEach(([a,b,c,d])=>{ if(c-a<=0.01||d-b<=0.01) return; const m=new THREE.Mesh(new THREE.PlaneGeometry(c-a,d-b),ceil.material); m.rotation.x=Math.PI/2; m.position.set((a+c)/2,CW+0.02,(b+d)/2); room.add(m); }); } }
    // walking: the game's blacklist, plus a stone that has not been moved and a risen chest
    const ok=(x,y)=>{ const t=at(x,y); if(t===undefined) return false; if(t===16) return !!R.opened[i]; if(t===45&&dyn.podium&&dyn.podium.visible&&f.podium.x===x&&f.podium.y===y) return false; return !SOLID.has(t); };
    lv.ground=(x,z)=>hAt(x,z); lv.stairAt=()=>{ for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(at(x,y)===2) return [x,y]; return null; };
    const okAt=(px,pz)=>{ const x=Math.floor(px), y=Math.floor(pz); return ok(x,y)||(at(x,y)===1&&WI.free(px,pz)&&(()=>{ const u=px-x, v=pz-y; return (u<WI.m&&ok(x-1,y))||(u>1-WI.m&&ok(x+1,y))||(v<WI.m&&ok(x,y-1))||(v>1-WI.m&&ok(x,y+1)); })()); };
    lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0,0],[0.22,0],[-0.22,0],[0,0.22],[0,-0.22]]) if(!okAt(tx+ox,tz+oz)) return false; for(const b of BLK){ const dt=Math.hypot(tx-b.x,tz-b.z); if(dt<b.r+0.24&&dt<=Math.hypot(fx-b.x,fz-b.z)) return false; } const air=(ENGINE.airH||0); return hAt(tx,tz)-(hAt(fx,fz)+air)<0.42; };   // no walking up a gallery's edge — take the stair, or jump it; stepping down off one is a drop
    lv.dmap={W,H,wall:(x,y)=>at(x,y)===1||at(x,y)===undefined,solid:(x,y)=>!ok(x,y)};   // for the map of where you've been
    lv.spawn=arrival(i,false);
    lv._gen=()=>dyn.general;
    lv.zone=()=>{ if(top) return 'The sanctum'; let z=`Floor ${i+1} of ${N}`; if(f.podium&&lv.combat){ const n=lv.combat.foes.filter(d=>d.alive&&!d.boss).length; z+=n?` · 👹 ${n} demon${n===1?'':'s'} left`:R.hasKey||R.opened[i]?' · the way up is open':' · 🗝 take the key from the dais'; } return z; };
    lv.follow=p=>{ lamp.position.set(p.x,p.y+1.8,p.z); };
    // ── the fight ──
    const alive=()=>lv.combat.foes.some(d=>d.alive);
    const X={lv,room,an,scene,hemi,lamp,bg,f,i,W,H,R:()=>R,td,C,tl:td.lvl,at,setT:(x,y,t)=>{ if(g[y]) g[y][x]=t; },ok:(x,y)=>ok(x,y),boss:()=>lv.combat.foes.find(d=>d.boss&&d.alive)};
    const M=(top&&typeof GUARDIANS!=='undefined'&&GUARDIANS[C.town])?GUARDIANS[C.town](X):{}; lv.guardian=M;   /* for tests: the guardian's own state() */
    if(M.speedMult) lv.speedMult=M.speedMult; lv.mech=M;
    const arena=COMBAT.arena(lv,Object.assign({mode:'dungeon',tier:C.town,townLvl:td.lvl,W,H,wide:!!f.wide,walk:(x,y)=>ok(x,y),los:(x,y)=>at(x,y)!==1},M.cfg||{},{
      onKill:d=>{ if(d.boss){ R.bossDead=true; lv.combat.adds.forEach(a=>a.alive=false); if(M.onBossDead) M.onBossDead(d);
          if(spec.raise&&dyn.general){ GAME.save(); setTimeout(()=>raiseGeneral(),900); return; }
          if(dyn.general) dyn.general.fall=0.001;
          setTimeout(()=>ENGINE.speak('⚔️ '+td.boss+' is defeated',[`The thing that bound this place is undone. ${td.general} is free to approach. 🙏`]),700); GAME.save(); return; }
        R.cleared[i+':'+d.post]=true;
        if(!alive()){ if(dyn.podium&&!R.risen[i]){ R.risen[i]=true; dyn.podium.visible=true; dyn.kc.set('down'); dyn.kc.rise(); UI.toast('✨ The hall falls quiet. In the great hall a chest rises from the dais — the key to the stone is inside.',3000); }
          else if(dyn.seals.length&&!R.opened[i]) UI.toast('✨ Floor cleared — but the stone still stands.',1600); } },
      onDeath:()=>{ const cp=R.checkpoint; if(cp!==null&&cp!==undefined){ ENGINE.go(idOf(cp),lv2=>chairSpot(cp)); setTimeout(()=>UI.toast('💫 You fall… and wake by the fire, where you last rested.',2200),450); }
        else leave('💫 You fall… and wake safe outside the chapel.'); },
      tick:()=>{ if(M.tick&&!R.bossDead) M.tick(); if(M.always) M.always(); } }));
    // ── what Ⓐ does here ──
    const spot=(x,y,label,who,action,r)=>lv.spots.push({x:x+0.5,z:y+0.5,r:r||1.0,label,who,action,auto:label==='Leave'||label==='Down'?'any':undefined,ar:0.5});   // step onto the door or the stair down to take it
    function chairSpot(fi){ const g=F[fi].grid; for(let y=0;y<g.length;y++) for(let x=0;x<g[0].length;x++) if(g[y][x]===23) return {x:x+0.5,z:y+1.5,face:Math.PI,yaw:0}; return arrival(fi,false); }
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x];
      if(t===5) spot(x,y,'Open','Chest',()=>{ const k=i+':'+x+','+y; if(R.chests[k]){ UI.toast('📭 Empty — already looted.',900); return; } R.chests[k]=true; CHEST3D.open(dyn.chests[x+','+y]);
        const c=f.chests.find(q=>q.x===x&&q.y===y); UI.toast('📦 '+give(c?c.items:[['gold',20+td.lvl*6]]),2600); });
      else if(t===16) spot(x,y,'Stone','The stone',()=>{ if(R.opened[i]) return; if(!R.hasKey){ ENGINE.speak('The stone',['It will not shift.','There is a keyway cut in its face, and nothing to put in it.']); return; }
        R.hasKey=false; openSeal(); ENGINE.speak('The stone',['The key turns and crumbles.','The stone grinds along its channel.']); },1.1);
      else if(t===18) spot(x,y,'Light','Lampstand',()=>{ const cs=f.candles, k=cs.findIndex(c=>c.x===x&&c.y===y), lit=R.lit[i]||0; if(k<lit) return;
        if(k!==lit){ UI.toast(`🕯 The wick catches, gutters, and dies. ${cs[k].church} is not next.`,1600); return; }
        R.lit[i]=lit+1; showCandles(); if(lit+1>=cs.length){ UI.toast('🕯 The last lampstand takes light.',1400); openSeal(); } else UI.toast(`🕯 ${cs[k].church} burns. ${cs.length-lit-1} remain${cs.length-lit-1===1?'s':''} dark.`,1500); },0.8);
      else if(t===42){ const c=(f.candles||[]).find(q=>q.sx===x&&q.sy===y); if(c) spot(x,y,'Read','Set in the floor',()=>ENGINE.speak('Set in the floor',[c.church]),0.7); }
      else if(t===20||t===41) spot(x,y,'Read','The tablet',()=>ENGINE.speak('The tablet',tabletPages(i)),1.1);
      else if(t===21){ const b=C.books[f.wide?(y>H*0.6?2:(x<(W>>1)?0:1)):(y===7?2:(x<(W>>1)?0:1))]; spot(x,y,'Read',b.title,()=>ENGINE.speak(b.title,b.lines.map(txt)),1.0); }
      else if(t===23) spot(x,y,'Rest','The chair by the fire',()=>{ if(ENGINE.holding) return;   // the seat by the fire (CHAIR_REST_MS): sit 3.5s, strength rising
        const S0=GAME.S, hp0=S0.hp, P=ENGINE.P, back={x:P.x,z:P.z}; R.checkpoint=i; P.x=x+0.5; P.z=y+0.5; P.face=-Math.PI/2; ENGINE.hold(3.5,'sit'); let el=0;
        const tick=(t,dt)=>{ el+=dt||0.016; const u=Math.min(1,el/3.5); S0.hp=Math.max(S0.hp,Math.round(hp0+(S0.maxHp-hp0)*u)); P.x=x+0.5; P.z=y+0.5; ENGINE.hud();
          if(u>=1){ lv.anim.splice(lv.anim.indexOf(tick),1); S0.hp=S0.maxHp; P.x=back.x; P.z=back.z; GAME.changed(); GAME.save();
            UI.toast('🙏 You rise, restored. Should you fall, you will wake here by the fire.',2600); if(!R.restVerse){ R.restVerse=true; ENGINE.speak('By the fire',['“He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.” — Psalm 23:2–3','Rest as long as you like. The fire will keep.']); } } };
        lv.anim.push(tick); UI.toast('🔥 You sink into the chair by the fire…',1600); },1.1);
      else if(t===22&&ftype!=='library') spot(x,y,'Look','The hearth',()=>UI.toast('🔥 The fire is kept up. Someone still comes here.',1400),1.0);
      else if(t===8) spot(x,y,spec.down&&i===ENTRY()?'Down':i?'Down':'Leave',spec.down&&i===ENTRY()?'The stair down to the catacombs':i?'The stair down':'The door',()=>{ if(spec.down&&i===ENTRY()){ spec.down(); return; } if(i) ENGINE.go(idOf(i-1),()=>arrival(i-1,true)); else leave('🌿 You step back outside.'); },0.8);
      else if(t===7) spot(x,y+0.6,'Talk',td.general,()=>{ if(!R.bossDead){ ENGINE.speak(td.general,[`The demon ${td.boss} binds me — strike it down first!`]); return; } if(dyn.general&&dyn.general.fall<1){ UI.toast('…he is still coming down.',900); return; } trial(lv); },1.4); }
    if(dyn.podium) lv.spots.push({x:f.podium.x+0.5,z:f.podium.y+0.5,r:1.3,label:'Open',who:'The chest on the dais',action:()=>{ if(!dyn.podium.visible) return; if(R.chests['podium:'+i]){ UI.toast('📭 Empty — the key is already yours.',900); return; }
      R.chests['podium:'+i]=true; GAME.save(); dyn.kc.open(()=>{ R.hasKey=true; ENGINE.speak('An iron key',['Black with age, warm from the light it lay in. It will not last — use it on the stone that seals the stair.']); }); }});
    function openSeal(){ R.opened[i]=true; dyn.seals.forEach(s=>{ let k=0; const f2=t=>{ k+=0.02; s.position.y=-k*1.5; if(k<1) requestAnimationFrame(f2); else s.visible=false; }; f2(); }); UI.toast('⛓ The wall grinds back — a way opens beyond.',1600); }
    function showCandles(){ const lit=R.lit[i]||0; dyn.candles.forEach(c=>{ const k=f.candles.findIndex(q=>q.x===c.x&&q.y===c.y); c.fl.visible=k>=0&&k<lit; }); }
    // the stair up: step onto it (the game's rule — and only once the floor is clear)
    let onStair=true, warned=0;
    an.push(()=>{ const P=ENGINE.P, t=at(Math.floor(P.x),Math.floor(P.z)); if(t!==2){ onStair=false; return; } if(onStair||ENGINE.busy) return; onStair=true;
      if(alive()){ if(performance.now()-warned>1400){ warned=performance.now(); UI.toast('⚠️ Clear all demons first!',1200); } return; }
      if(i+1<N){ R.opened[i]=true; ENGINE.go(idOf(i+1),()=>arrival(i+1,false)); } });
    // the general comes down when the guardian falls
    an.push((t,dt)=>{ const g=dyn.general; if(!g) return; g.aura.visible=!R.bossDead||(spec.raise&&g.fall<1); if(R.bossDead&&g.fall===0&&!g.raising) g.fall=1; if(g.fall>0&&g.fall<1){ g.fall=Math.min(1,g.fall+(dt||0.016)/1.5); } const fk=Math.max(0,g.fall||0); g.g.position.y=0.7*(1-fk); g.g.position.z=g.y+0.5+0.25+0.6*fk; });
    // ── V150: the raising — the camera turns to him; the chains glow and burst; colour and breath come back into him; he comes down and stands ──
    function raiseGeneral(){ const G0=dyn.general; if(!G0||G0.raising) return; G0.raising=true; G0.fall=-1; ENGINE.hold(7.2); if(typeof SFX!=='undefined') SFX.play('portal');
      const gx=G0.g.position.x, gz=G0.g.position.z, VP=new THREE.Vector3(gx+2.3,2.1,gz+4.4), VL=new THREE.Vector3(gx,1.35,gz), cp=new THREE.Vector3(), cl=new THREE.Vector3(), dir=new THREE.Vector3();
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.9,9,18,1,true),new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); beam.position.set(gx,4.5,gz); room.add(beam);
      const flash=new THREE.PointLight(0xfff0c8,0,10,1.4); flash.position.set(gx,1.6,gz); scene.add(flash);
      let T0=0, burst=false, down=false;
      lv.cine=(cam,dt)=>{ T0+=dt||0.016; const w=T0<1.6?sm(T0/1.6):T0<5.6?1:Math.max(0,1-sm((T0-5.6)/1.2));
        cam.getWorldDirection(dir); cp.copy(cam.position); cl.copy(cp).addScaledVector(dir,5); cam.position.lerpVectors(cp,VP,w); cam.lookAt(cl.lerp(VL,w));
        if(T0>1.6&&!burst){ const k=Math.min(1,(T0-1.6)/1.0); G0.linkM.emissive.setRGB(k,k*0.85,k*0.5); }
        if(T0>2.6&&!burst){ burst=true; if(typeof SFX!=='undefined'){ SFX.play('parry'); SFX.play('levelUp'); } G0.links.forEach(L=>L.v.set((Math.random()-0.5)*5,Math.random()*4+1,(Math.random()-0.5)*5)); G0.aura.material.color.setHex(0xffe6a8); }
        if(burst){ G0.links.forEach(L=>{ L.v.y-=9*(dt||0.016); L.m.position.addScaledVector(L.v,dt||0.016); L.m.rotation.x+=dt*8; L.m.scale.multiplyScalar(1-(dt||0.016)*0.6); }); const k=Math.min(1,(T0-2.6)/1.6);
          G0.mats.forEach(q=>q.m.color.lerpColors(new THREE.Color(q.c).lerp(new THREE.Color(0x7a7a80),0.65),q.c,k)); beam.material.opacity=0.28*Math.sin(Math.min(1,(T0-2.6)/3)*Math.PI); flash.intensity=2.2*Math.max(0,1-(T0-2.6)/1.2); }
        if(T0>3.8&&!down){ down=true; G0.fall=0.001; }
        if(T0>6.9){ lv.cine=null; G0.links.forEach(L=>L.m.visible=false); room.remove(beam); scene.remove(flash); G0.raising=false; G0.fall=1;
          ENGINE.speak(td.general,['…Breath. I have breath.','“Thus saith the Lord GOD unto these bones; Behold, I will cause breath to enter into you, and ye shall live.” — Ezekiel 37:5',...(spec.raiseWhy||['I was dead, knight. Truly dead. I knew His words by heart and never trusted the One who spoke them — and the shadow took me in that doubt, and hung me here to mock Him.','And He has called me out of it, as He called Lazarus out of the tomb. Not the chains, not the grave could keep what He wants back. I am born again — and this time I know Him, not only His words.']),'“I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.” — John 11:25','Come. Kneel with me here, and receive His blessing for this town.'],null,()=>{ GAME.S.cata=GAME.S.cata||{}; if(typeof JOURNAL!=='undefined') JOURNAL.write(`I broke the chains in the nave of ${td.name}'s chapel, and the Lord raised ${td.general} from the dead before my eyes — breath came into him, and he stood up upon his feet (Ezekiel 37:10). He is born again.`,{}); }); } };
      const sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); }; }
    lv.onEnter=sp=>{ if(lv._restIn) setTimeout(lv._restIn,600); COMBAT.clear(lv); onStair=true; g=G.map(r=>r.slice());
      dyn.seals.forEach(s=>{ s.visible=!R.opened[i]; s.position.y=0; }); showCandles(); if(dyn.podium){ dyn.podium.visible=!!R.risen[i]; dyn.kc.set(R.chests['podium:'+i]?'open':'up'); }
      Object.entries(dyn.chests).forEach(([k,l])=>CHEST3D.set(l,!!R.chests[i+':'+k])); if(dyn.general){ dyn.general.fall=R.bossDead?1:0; }
      f.demons.forEach(d=>{ const post=d.x+','+d.y; if(d.boss?R.bossDead:R.cleared[i+':'+post]) return; const dirs=[[1,0],[-1,0],[0,1],[0,-1]][Math.random()*4|0];
        COMBAT.foe(lv,Object.assign({x:d.x+0.5,z:d.y+0.5,hx:d.x+0.5,hz:d.y+0.5,post,pdx:dirs[0],pdz:dirs[1],form:(d.x+d.y)%4},d,d.boss?{pat:C.boss,look:C.town===8?'paladin':'demon',tint:C.boss.color,bossForm:C.town,x:d.x+0.5,z:d.y+0.5}:{x:d.x+0.5,z:d.y+0.5})); });
      if(M.onEnter) M.onEnter();
      if(top&&!R.bossDead) setTimeout(()=>ENGINE.speak('⬆ The general\'s sanctum',[...(spec.raise?[`Above the altar, grey and still, hangs ${td.general}’s body in chains — the guardian’s trophy, taken from the empty tomb below.`]:[]),`⚠️ ${td.boss} guards it. Read its telegraphed attacks and dodge with Ⓑ (tap Guard twice) — it cannot turn once it has committed.`,'When it takes to the air or leaps, lock on (F / tap the look stick) and the view tilts up to follow it. Stay out of the red rings where it means to land. Jump (⤴) over its shockwaves. Swing in mid-air for an Aerial blow that reaches higher and ends in a plunge, and strike hard while it is stunned.']),450);
      else if(ftype==='doctrine'&&!R.briefed){ R.briefed=true; setTimeout(()=>ENGINE.speak('Five lampstands, and a stone that will not move',['They stand in a ring, each with its name set in the floor before it. The stone above the stair holds fast while they are cold.','Read the tablet on the pedestal at the centre. The order is in the verse — light them as it names them, and skip the two that are not here.']),500); }
      else if(f.podium&&!R.hinted){ R.hinted=true; setTimeout(()=>ENGINE.speak('The chapel is bound',['Demons hold these halls, and a stone seals the stair to the next floor.','Hunt down every demon on the floor. When the last one falls, a chest rises from the dais in the great hall — the iron key inside opens the stone.','(The count of demons left is up in the corner, under the floor number.)']),450); }
      else setTimeout(()=>UI.toast(f.podium&&!R.opened[i]?`⬆ Floor ${i+1}/${N} — 👹 slay every demon to raise the key`:`⬆ Floor ${i+1}/${N}`,1800),400); };
    return lv; }
  // V149: a chapel entered from its catacombs: straight up into the nave (the top floor), where the guardian waits
  // the brothers' resting-room by the fire comes first (rest is kept before the fight), then the nave
  const ENTRY=()=>{ const e=F.findIndex(f=>f.type==='library'); return e>=0?e:N-1; };
  function enterTop(){ R=fresh(); R.briefed=true; R.hinted=true; GAME.save(); const e=ENTRY(); ENGINE.go(idOf(e),lv=>arrival(e,false)); }
  return { enter, enterTop, get run(){ return R; } };
}
