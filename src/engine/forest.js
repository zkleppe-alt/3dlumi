// ════════════════════════════════════════════════════════════════
//  FOREST — the Forest of Disillusionment and what hides in it (tools/extract_forest.py → data/forest.json):
//   the wood itself: genForestMaze(21,41,97), fog that lets you see only a few paces, seven demons, four chests,
//     two stone arches: the Ironhold road always at the head of the wood, the Saltmere road always at its foot;
//   Eldan's Glade: through the moss-grown temple porch (tile 35) at the farthest glade — a fairy-tale rotunda, pool and waterfall;
//   Robby's door: a tree like any other (tile 78) at the next-farthest glade — playing cards on the trail lead to it; knock or strike;
//     inside, Robby deals blackjack, the console plays Blockfall for a coin, and the armour is for sale;
//   the old monk's cave behind the hollow north of Hellgate (196,7).
//  forestLevels(D, {exit(mouth), caveExit}) → { enter(mouth), enterCave() }
// ════════════════════════════════════════════════════════════════
function forestLevels(D,spec){
  const S=()=>GAME.S, run={chests:{},cleared:{},mouth:'north'}, PX=1/16;
  const say=(who,lines,then)=>ENGINE.speak(who,(Array.isArray(lines)?lines:[lines]).map(txt),null,then);
  const give=items=>{ const parts=[], s=S(); for(const [k,id,n] of items){ if(k==='gold'){ const g=Math.round(id*s.goldMult); GAME.addGold(g); parts.push(g+' gold'); }
      else if(k==='pot'){ s.inventory[id]=(s.inventory[id]||0)+n; const P=SYS.POTIONS[id]||{name:id,emoji:'🧪'}; parts.push(`${n>1?n+' ':''}${P.emoji} ${P.name}`); } } GAME.changed(); return '📦 Chest: '+parts.join(' · ')+'!'; };
  const Q=()=>{ const s=S(); s.quests=s.quests||{goldenFish:'unstarted',kindness:'unstarted'}; return s.quests; };
  // 🌿 Eldan's two trials each give a missing starter line, fully grown, to the Homestead Stables (uwEldanGift) —
  //    and on load, a save that finished them before this pays out too (uwEldanCheck)
  function eldanGift(which,quiet){ const s=S(); s.eldanGifts=s.eldanGifts||{}; const flag=which===1?'fish':'kind'; if(s.eldanGifts[flag]) return null; s.eldanGifts[flag]=true;
    const own=new Set([s.pet&&s.pet.id,...(s.barnPets||[]).map(p=>p&&p.id)]), id=(SYS.STARTER_PETS||['faithful','grace','steadfast']).find(k=>!own.has(k)); if(!id) return null;
    s.barnPets=s.barnPets||[]; s.barnPets.push({id,form:2}); const f=SYS.PETS[id].forms[2];
    if(!quiet) setTimeout(()=>ENGINE.speak(`🌿 Eldan’s gift: ${f.emoji} ${f.name}!`,[`A companion of the ${SYS.PETS[id].name} line, fully grown, waits for you at the Homestead Stables.`]),2600); return id; }
  GAME.on(()=>{ const s=S(), q=s.quests||{}, got=[]; if(q.goldenFish==='done'&&!(s.eldanGifts||{}).fish){ const id=eldanGift(1,true); if(id) got.push(id); }
    if(q.kindness==='done'&&!(s.eldanGifts||{}).kind){ const id=eldanGift(2,true); if(id) got.push(id); }
    if(got.length){ GAME.save(); setTimeout(()=>UI.toast(`🌿 Eldan remembers your trials. ${got.map(id=>SYS.PETS[id].forms[2].emoji+' '+SYS.PETS[id].forms[2].name).join(' and ')} now wait${got.length>1?'':'s'} at the Homestead Stables.`,4200),1500); } });

  // ── a level built from a tile grid: walls as trees or rock, floor, demons, chests, and Ⓐ spots ──
  const ROCKY_U=(()=>{ const g=new THREE.IcosahedronGeometry(0.6,0); g.translate(0,0.3,0); return g; })();
  function gridLevel(o){ const g0=o.grid, W=g0[0].length, H=g0.length; let g=g0.map(r=>r.slice()); const at=(x,y)=>g[y]&&g[y][x];
    const scene=new THREE.Scene(), bg=new THREE.Color(o.bg); scene.background=bg; scene.fog=new THREE.Fog(bg,o.fog[0],o.fog[1]);
    const lv={id:o.id,name:o.name,scene,folk:[],spots:[],anim:[],cam:Object.assign({pitch:0.9,dist:8,min:5,max:11},o.cam||{}),speed:4.6,close:!!o.close,closeRise:o.walls==='trees'?[0,0.15]:null};
    const hemi=new THREE.HemisphereLight(o.sky||0xc8e0c0,0x2a3020,o.hemi||0.6); scene.add(hemi);
    const lamp=new THREE.PointLight(0xffe0b0,o.lamp||0.9,9,1.4); scene.add(lamp); if(o.sun){ const s=new THREE.DirectionalLight(0xfff4d0,o.sun); s.position.set(W*0.3,14,H*0.4); s.target.position.set(W/2,0,H/2); scene.add(s,s.target); }
    const room=group(0,0,0,scene), an=lv.anim, solid=o.solid;
    const fl=[], wl=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=g0[y][x]; if(t===1||t===78) wl.push([x,y]); else fl.push([x,y]); }
    inst(fl,UNIT,null,([x,y],m,cc)=>{ m.makeScale(1,0.1,1); m.setPosition(x+0.5,-0.1,y+0.5); cc.setHex((o.floorCol&&o.floorCol(g0[y][x]))||((x+y)%2?o.fA:o.fB)).offsetHSL(0,0,(hsh(x,y)-0.5)*0.06); },room);
    if(o.close) inst(wl,UNIT,null,([x,y],m,cc)=>{ m.makeScale(1,0.1,1); m.setPosition(x+0.5,-0.1,y+0.5); cc.setHex((x+y)%2?o.fA:o.fB).offsetHSL(0,0,(hsh(x,y)-0.5)*0.06); },room);   // ground under the drawn-back edges
    if(o.borderOnly){ const k=wl.filter(([x,y])=>x===0||y===0||x===W-1||y===H-1); wl.length=0; wl.push(...k); }
    if(o.open){ const near=([x,y])=>{ for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){ const t=g0[y+dy]&&g0[y+dy][x+dx]; if(t!==undefined&&t!==1&&t!==78) return true; } return false; }; const k=wl.filter(near); wl.length=0; wl.push(...k); }   // the wood two trees deep from every trail: the rest is never seen
    const isW=(x,y)=>{ const t=g0[y]&&g0[y][x]; return t===1||t===78; }, WI=o.close?wallInset(isW,(x,y)=>{ const t=g0[y]&&g0[y][x]; return t!==undefined&&!solid.has(t); },o.walls==='trees'?0.3:0.28):null;   // wider trails and passages in close quarters
    if(o.walls==='trees'){ const pine=TREE_GEO.pine(), oak=TREE_GEO.oak(), mat=new THREE.MeshLambertMaterial({vertexColors:true});
      inst(wl.filter(([x,y])=>hsh(x,y)<0.6),pine,mat,([x,y],m)=>{ const s=1.05+hsh(y,x)*0.35, q=WI?WI.box(x,y):{cx:x+0.5,cz:y+0.5,sx:1,sz:1}, n=WI?Math.min(q.sx,q.sz)*0.9+0.1:1; m.makeScale(s*n,s*(o.treeH||1.15),s*n); m.setPosition(q.cx,0,q.cz); },room,true);
      inst(wl.filter(([x,y])=>hsh(x,y)>=0.6),oak,mat,([x,y],m)=>{ const s=1.0+hsh(y,x)*0.3, q=WI?WI.box(x,y):{cx:x+0.5,cz:y+0.5,sx:1,sz:1}, n=WI?Math.min(q.sx,q.sz)*0.9+0.1:1; m.makeScale(s*n,s*(o.treeH?o.treeH/1.15:1),s*n); m.setPosition(q.cx,0,q.cz); },room,true);
      inst(wl,UNIT,null,([x,y],m,cc)=>{ const q=WI?WI.box(x,y):{cx:x+0.5,cz:y+0.5,sx:1,sz:1}; m.makeScale(q.sx,0.35,q.sz); m.setPosition(q.cx,0,q.cz); cc.setHex(0x24361f).offsetHSL(0,0,(hsh(x,y)-0.5)*0.05); },room); }
    else { inst(wl,UNIT,null,([x,y],m,cc)=>{ const q=WI?WI.box(x,y):{cx:x+0.5,cz:y+0.5,sx:1,sz:1}; m.makeScale(q.sx,(o.close?2.4:1.2)+hsh(x,y)*0.4,q.sz); m.setPosition(q.cx,0,q.cz); cc.setHex(o.wall).offsetHSL(0,0,(hsh(x,y)-0.5)*0.08); },room);
      if(o.close&&o.walls==='rock') inst(wl.filter(([x,y])=>hsh(y,x)<0.5),ROCKY_U,null,([x,y],m,cc)=>{ const r=hsh(x*3,y); m.makeRotationY(r*6); m.scale(new THREE.Vector3(0.9,0.7+r*0.5,0.9)); m.setPosition(x+0.5+(r-0.5)*0.3,2.0+r*0.5,y+0.5); cc.setHex(o.wall).offsetHSL(0,0,(r-0.5)*0.1); },room); }   // the cave's ragged roof-line
    if(o.close||o.open){ const top=o.walls==='trees'?3.4:2.7; lv.camBlock=(fx,fz,y)=>{ const t=at(Math.floor(fx),Math.floor(fz)); return (o.walls!=='trees'&&y>2.55)||((t===1||t===78||t===undefined)&&!(WI&&WI.free(fx,fz))&&y<top); };
      if(o.walls!=='trees'){ const cl=new THREE.Mesh(new THREE.PlaneGeometry(W+4,H+4),new THREE.MeshBasicMaterial({color:o.bg,side:THREE.DoubleSide})); cl.rotation.x=Math.PI/2; cl.position.set(W/2,2.75,H/2); room.add(cl); } }
    const ok=(x,y)=>{ const t=at(x,y); return t!==undefined&&!solid.has(t); };
    lv.ground=()=>0;
    const okAt=(px,pz)=>{ const x=Math.floor(px), y=Math.floor(pz); if(ok(x,y)) return true; if(!WI||!isW(x,y)) return false; const u=px-x, v=pz-y; return (u<WI.m&&ok(x-1,y))||(u>1-WI.m&&ok(x+1,y))||(v<WI.m&&ok(x,y-1))||(v>1-WI.m&&ok(x,y+1)); };
    lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0,0],[0.22,0],[-0.22,0],[0,0.22],[0,-0.22]]) if(!okAt(tx+ox,tz+oz)) return false; return true; };
    if(o.open) lv.dmapShow=true; if(o.close||o.open) lv.dmap={W,H,wall:(x,y)=>isW(x,y)||at(x,y)===undefined,solid:(x,y)=>!ok(x,y),trees:o.walls==='trees',cell:o.mapCell,reveal:o.mapReveal};
    lv.follow=p=>lamp.position.set(p.x,p.y+1.8,p.z);
    lv.zone=()=>o.zone||'';
    const spot=(x,y,label,who,action,r)=>{ const s={x:x+0.5,z:y+0.5,r:r||1.0,label,who,action,auto:label==='Leave'?'any':undefined,ar:0.5}; lv.spots.push(s); return s; };
    const chests={}; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(g0[y][x]===5){ const lid=CHEST3D.make(room,x+0.5,y+0.5); chests[x+','+y]=lid;   /* V165 */
      spot(x,y,'Open','Chest',()=>{ const k=o.id+':'+x+','+y; if(run.chests[k]){ UI.toast('📭 Empty — already looted.',900); return; } run.chests[k]=true; CHEST3D.open(lid); UI.toast(give(D.chest),2400); }); }
    if(o.fight){ COMBAT.arena(lv,{mode:'dungeon',tier:1,townLvl:D.demonLvl,W,H,walk:(x,y)=>ok(x,y),los:(x,y)=>{ const t=at(x,y); return t!==1&&t!==78; },
      onKill:d=>{ run.cleared[o.id+':'+d.post]=true; }, onDeath:()=>o.onDeath(), onSwing:o.onSwing||null }); }
    lv.onEnter=sp=>{ g=g0.map(r=>r.slice()); if(lv.combat){ COMBAT.clear(lv);
        for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(g0[y][x]===6){ g[y][x]=0; const post=x+','+y; if(run.cleared[o.id+':'+post]) continue; const lvl=D.demonLvl, hp=Math.round((16+lvl*3)*1.4), d=[[1,0],[-1,0],[0,1],[0,-1]][Math.random()*4|0];
          COMBAT.foe(lv,{x:x+0.5,z:y+0.5,hx:x+0.5,hz:y+0.5,post,pdx:d[0],pdz:d[1],hp,level:lvl,xp:lvl*3,atk:5+Math.round(lvl*0.7),patrol:D.patrol,form:(x+y)%4}); } }
      Object.entries(chests).forEach(([k,l])=>CHEST3D.set(l,!!run.chests[o.id+':'+k])); if(o.onEnter) o.onEnter(sp); };
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(g0[y][x]===6) g0[y][x]=6;   // posts stay in the template; the live grid frees them
    return {lv,room,an,at,spot,W,H,ok,hemi,scene}; }
  const arrival=(grid,want)=>{ for(let y=0;y<grid.length;y++) for(let x=0;x<grid[0].length;x++) if(grid[y][x]===want){
      for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){ const t=grid[y+dy]&&grid[y+dy][x+dx]; if(t===0) return {x:x+dx+0.5,z:y+dy+0.5,face:dy>0?0:dy<0?Math.PI:dx>0?Math.PI/2:-Math.PI/2}; }
      return {x:x+0.5,z:y+0.5,face:0}; } return {x:1.5,z:1.5,face:0}; };
  const find=(grid,t)=>{ for(let y=0;y<grid.length;y++) for(let x=0;x<grid[0].length;x++) if(grid[y][x]===t) return [x,y]; };

  // ════════════════════════════════════════════════════════════════
  //  V164: THE NEW WOOD — hand-built (data/forest.json "hand"): the river across its middle with a timber bridge on the trail, a stone
  //   bridge over the stream, a ford of stepping stones and a fallen log; the woodcutters' camp; the hermit's pond and the bluff
  //   beside it; the pilgrims lost in the fog; three side caves; the ravines Aiden's crook swings you over; the rockfall and the
  //   log-pile Miriam's hammer breaks; and, across the north-west ravine, a grove with a hammock in it.
  //   The trail through is always open; the tools open shortcuts, caves and the grove.
  // ════════════════════════════════════════════════════════════════
  const HCH={'.':0,'#':1,'S':2,'N':8,'C':5,'d':6,'E':35,'R':78,'~':100,'=':101,'o':102,'X':103,'r':104,'B':105,'L':106,'^':107,'M':108,'h':109,'f':110,'T':111,'l':112,'H':113,',':114,'*':115,'a':116,'s':117,'w':118};
  if(D.hand&&!D.forestOpen){ D.forest=D.hand.rows.map(r=>[...r].map(c=>HCH[c]!==undefined?HCH[c]:0)); D.forestOpen=true; D.gates=null; }
  const FW=()=>{ const s=GAME.S; s.forestW=s.forestW||{smashed:{},axe:0,rock:0,pil:0,hammock:false,sat:false}; return s.forestW; };
  const hasCrookF=()=>{ const c=GAME.S.cata&&GAME.S.cata[0]; return !!(c&&c.staff)||(GAME.S.chapels||0)>=1; };
  const hasHammerF=()=>{ const c=GAME.S.cata&&GAME.S.cata[1]; return !!(c&&c.hammer)||(GAME.S.chapels||0)>=2; };
  const FLOORCOL=t=>t===100?0x1a2e30:t===102?0x24383a:t===103?0x050505:t===101?0x3a3020:t===107||t===108?0x4a4842:null;
  function handForest(F){ const {lv,room,an,spot,at}=F, HD=D.hand, Wd=D.forest[0].length, Hd=D.forest.length, scene=F.scene;
    const RZ=HD.raised||[], inR=(r,x,y)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3], hR=(x,y)=>{ const q=RZ.find(r=>inR(r.r,x,y)); return q&&at(x,y)!==1?q.h:0; };
    let climb=null, swing=null;
    // ── the water: a slow green river and the stream, the pond; stepping stones on the ford ──
    const wc=[]; for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++){ const t=D.forest[y][x]; if(t===100||t===102||t===101) wc.push([x,y]); }
    const wm=new THREE.MeshPhongMaterial({color:0x2e6a6a,transparent:true,opacity:0.78,shininess:80,specular:0x9ad8d8});
    inst(wc,UNIT,wm,([x,y],m)=>{ m.makeScale(1.0,0.02,1.0); m.setPosition(x+0.5,-0.04,y+0.5); },room);
    const ripple=[]; for(let i=0;i<70;i++){ const [x,y]=wc[Math.floor(hsh(i,7)*wc.length)]||[0,0]; if(D.forest[y][x]!==100) continue; const r=new THREE.Mesh(new THREE.RingGeometry(0.12,0.16,14),new THREE.MeshBasicMaterial({color:0xcfe8e8,transparent:true,opacity:0.25,depthWrite:false})); r.rotation.x=-Math.PI/2; r.position.set(x+0.5,0.0,y+0.5); room.add(r); ripple.push([r,hsh(y,i)*5]); }
    an.push(t=>{ ripple.forEach(([r,ph])=>{ const k=((t*0.4+ph)%1); r.scale.setScalar(0.5+k*2.4); r.material.opacity=0.28*(1-k); }); });
    // ── the bridges: timber on the trail, stone over the stream, a great fallen log to the east ──
    for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++) if(D.forest[y][x]===101){ const kind=x>70?'log':y>100?'stone':'timber', g=group(x+0.5,0,y+0.5,room);
      const wL=D.forest[y][x-1]!==101, wR=D.forest[y][x+1]!==101;
      if(kind==='timber'){ B(1.02,0.12,1.0,(x+y)%2?0x6a4a2a:0x5e4226,0,0.02,0,g); for(let i=0;i<3;i++) B(1.0,0.02,0.04,0x3a2814,0,0.15,-0.33+i*0.33,g); if(wL){ B(0.1,0.9,0.1,0x4a3220,-0.5,0.1,0,g); B(0.08,0.08,1.02,0x4a3220,-0.5,0.95,0,g); } if(wR){ B(0.1,0.9,0.1,0x4a3220,0.5,0.1,0,g); B(0.08,0.08,1.02,0x4a3220,0.5,0.95,0,g); } }
      else if(kind==='stone'){ B(1.02,0.24,1.0,0x8a8478,0,0,0,g); if(wL) B(0.2,0.5,1.02,0x7a766c,-0.46,0.24,0,g); if(wR) B(0.2,0.5,1.02,0x7a766c,0.46,0.24,0,g); }
      else { if(x===76){ const lg=Cy(0.42,0.46,1.04,10,0x5a4028,0,0.05,0,g); lg.rotation.x=Math.PI/2; } else { B(0.9,0.05,0.9,0x1a2e30,0,-0.03,0,g); } }
      shade(g); }
    for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++) if(D.forest[y][x]===102){ const st=Cy(0.32+hsh(x,y)*0.08,0.36,0.16,8,0x8a8478,x+0.5+(hsh(y,x)-0.5)*0.2,0,y+0.5+(hsh(x+1,y)-0.5)*0.2,room); st.castShadow=true; }
    // ── the ravines: a long drop into the dark, its lips broken rock ──
    for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++) if(D.forest[y][x]===103){ B(1.0,4,1.0,0x020202,x+0.5,-4.2,y+0.5,room);
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{ const t2=at(x+a,y+b); if(t2===0||t2===115||t2===104){ const r=new THREE.Mesh(ROCKY_U,mt(0x5a5650)); r.scale.set(0.5,0.35,0.5); r.position.set(x+0.5+a*0.45,-0.05,y+0.5+b*0.45); room.add(r); } }); }
    // ── rock, cave mouths ──
    const rocks=[]; for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++) if(D.forest[y][x]===107) rocks.push([x,y]);
    inst(rocks,ROCKY_U,null,([x,y],m,cc)=>{ const r=hsh(x*3,y); m.makeRotationY(r*6); m.scale(new THREE.Vector3(1.5,1.6+r*1.4,1.5)); m.setPosition(x+0.5,0,y+0.5); cc.setHex(0x6a665e).offsetHSL(0,0,(r-0.5)*0.1); },room);
    /* V168: each mouth opens toward the open ground beside it (the side with the most room to walk), and that is where you come
       back out — not always a step to the south, which for two of them was a pocket shut in by boulders */
    const roomFrom=(x0,y0,cap)=>{ const sn=new Set([x0+','+y0]), q=[[x0,y0]]; while(q.length&&sn.size<cap){ const [x,y]=q.shift(); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=(x+a)+','+(y+b), t=at(x+a,y+b); if(sn.has(k)||t===undefined||t===108||SOLID_F.has(t)) continue; sn.add(k); q.push([x+a,y+b]); } } return sn.size; };
    const MOUTHS={}; for(const k in (HD.mouths||{})){ const [x,y]=k.split(',').map(Number), id=HD.mouths[k]; let od=[0,1], best=-1; for(const [a,b] of [[0,1],[-1,0],[1,0],[0,-1]]){ const t=at(x+a,y+b); if(t===undefined||t===108||SOLID_F.has(t)) continue; const n=roomFrom(x+a,y+b,60); if(n>best){ best=n; od=[a,b]; } }
      MOUTHS[id]={x,y,od}; const g=group(x+0.5,0,y+0.5,room); g.rotation.y=Math.atan2(od[0],od[1]);
      const m=new THREE.Mesh(new THREE.CircleGeometry(0.62,18,0,Math.PI),new THREE.MeshBasicMaterial({color:0x050406})); m.scale.set(1,1.5,1); m.position.set(0,0.02,0.52); g.add(m);
      const r1=new THREE.Mesh(ROCKY_U,mt(0x6a665e)); r1.scale.set(1.6,1.9,1.2); r1.position.set(0,0.9,-0.1); g.add(r1); }
    // ── the camp: tents, the fire, the stacks, the sawhorse ──
    const flames=[];
    for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++){ const t=D.forest[y][x], cx=x+0.5, cz=y+0.5;
      if(t===111){ const g=group(cx,0,cz,room); g.rotation.y=hsh(x,y)*1.2-0.6; const tm=new THREE.MeshLambertMaterial({color:0xcab894,side:THREE.DoubleSide}); [-1,1].forEach(sd=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.25),tm); p.position.set(sd*0.42,0.55,0); p.rotation.set(0,Math.PI/2,sd*0.72); g.add(p); }); Cy(0.03,0.03,1.3,4,0x4a3220,0,0,0.78,g); Cy(0.03,0.03,1.3,4,0x4a3220,0,0,-0.78,g); B(0.04,0.04,1.7,0x4a3220,0,1.08,0,g); shade(g); }
      else if(t===110){ const g=group(cx,0,cz,room); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Sp(0.12,0x6a665e,Math.cos(a)*0.38,0.06,Math.sin(a)*0.38,g); } for(let i=0;i<3;i++){ const l=Cy(0.05,0.05,0.6,5,0x3a2614,0,0.1,0,g); l.rotation.set(Math.PI/2,i,0); }
        const fl=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffa040,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending})); fl.scale.set(0.6,0.8,1); fl.position.y=0.4; g.add(fl); const L=new THREE.PointLight(0xff9a40,1.2,8,1.6); L.position.y=0.8; g.add(L); flames.push([fl,L]);
        [[0.9,0.2],[-0.8,0.5],[0.1,-0.95]].forEach(([a,b])=>{ const lg=Cy(0.16,0.16,0.9,8,0x5a4028,a,0.16,b,g); lg.rotation.z=Math.PI/2; lg.rotation.y=Math.atan2(a,b); }); }
      else if(t===112){ const g=group(cx,0,cz,room); for(let i=0;i<6;i++){ const lg=Cy(0.15,0.15,0.95,8,i%2?0x6a4a2a:0x5e4226,(i%3-1)*0.3,0.15+Math.floor(i/3)*0.27,0,g); lg.rotation.x=Math.PI/2; } shade(g); }
      else if(t===118){ const g=group(cx,0,cz,room); [-0.35,0.35].forEach(o2=>{ const a=B(0.06,0.7,0.06,0x5a4028,o2,0,-0.2,g); a.rotation.x=0.3; const b=B(0.06,0.7,0.06,0x5a4028,o2,0,0.2,g); b.rotation.x=-0.3; }); const lg=Cy(0.14,0.14,1.3,8,0x6a4a2a,0,0.7,0,g); lg.rotation.z=Math.PI/2; B(0.5,0.12,0.02,0x9a9aa2,0.2,0.88,0.15,g); shade(g); }
      else if(t===114){ for(let i=0;i<6;i++) Cy(0.012,0.02,0.5+hsh(i,x)*0.5,4,0x4a7a3a,cx+(hsh(i,y)-0.5)*0.8,0,cz+(hsh(y,i)-0.5)*0.8,room); }
      else if(t===115){ for(let i=0;i<3;i++) Sp(0.05,[0xf0e05a,0xe8f0f8,0xc88ad8,0xf08aa0][(x+y+i)%4],cx+(hsh(i,y)-0.5)*0.7,0.08,cz+(hsh(y,i+1)-0.5)*0.7,room,5,4); }
      else if(t===117){ const r=new THREE.Mesh(ROCKY_U,mt(0x7a766c)); r.scale.set(0.8,0.5,0.8); r.position.set(cx,-0.05,cz); room.add(r); } }
    an.push(t=>flames.forEach(([fl,L],i)=>{ const k=Math.sin(t*9+i)*0.1+Math.sin(t*15+i*2)*0.05; fl.scale.set(0.6+k,0.8+k*1.6,1); L.intensity=1.1+k*2; }));
    // ── the ledges: the bluff beside the pond, solid rock under its mossy top; its ladder ──
    const rc=[]; for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++) if(hR(x,y)>0) rc.push([x,y]);
    inst(rc,UNIT,null,([x,y],m,cc)=>{ m.makeScale(1,hR(x,y),1); m.setPosition(x+0.5,0,y+0.5); cc.setHex(0x6a665e).offsetHSL(0,0,(hsh(x,y)-0.5)*0.08); },room);
    inst(rc,UNIT,null,([x,y],m,cc)=>{ m.makeScale(1.0,0.06,1.0); m.setPosition(x+0.5,hR(x,y),y+0.5); cc.setHex((x+y)%2?0x3e5e30:0x3a582c); },room);
    room.children.slice().forEach(c=>{ if(c.isInstancedMesh) return; const x=Math.floor(c.position.x), y=Math.floor(c.position.z); if(c.position.y<0.5&&hR(x,y)>0&&!rc.includes(c)) c.position.y+=hR(x,y); });   // the chest on top rides up with it
    const LAD=[]; for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++) if(D.forest[y][x]===113){ const d0=[[1,0],[-1,0],[0,1],[0,-1]].find(([a,b])=>hR(x+a,y+b)>0)||[-1,0], h=hR(x+d0[0],y+d0[1]), g=group(x+0.5+d0[0]*0.42,0,y+0.5+d0[1]*0.42,room); g.rotation.y=Math.atan2(d0[0],d0[1]);
      [-0.26,0.26].forEach(o2=>B(0.07,h+0.9,0.07,0x6a4a2a,o2,0,0,g)); for(let i=0;i<Math.floor((h+0.8)/0.3);i++) B(0.5,0.05,0.06,0x7a5a32,0,0.25+i*0.3,0,g); shade(g); LAD.push({x,y,a:d0[0],b:d0[1],h}); }
    LAD.forEach(L=>{ const bx=L.x+0.5+L.a*0.2, bz=L.y+0.5+L.b*0.2, tx=L.x+0.5+L.a*1.0, tz=L.y+0.5+L.b*1.0, face=Math.atan2(L.a,L.b), dur=0.45+L.h*0.32;
      const go=up=>{ if(climb||ENGINE.holding) return; const P=ENGINE.P; if(ENGINE.K.sheathe) ENGINE.K.sheathe(); P.x=bx; P.z=bz; P.face=face; climb={y:up?0:L.h,y0:up?0:L.h,y1:up?L.h:0,u:0,dur,up,tx,tz,bx:L.x+0.5-L.a*0.3,bz:L.y+0.5-L.b*0.3}; ENGINE.hold(dur+0.05,'climb'); };
      lv.spots.push({x:L.x+0.5,z:L.y+0.5,r:1.0,label:'Climb',who:'A ladder',action:()=>go(true),hide:()=>ENGINE.P.y>0.6||!!climb});
      lv.spots.push({x:tx,z:tz,r:0.95,label:'Climb down',who:'The ladder',action:()=>go(false),hide:()=>ENGINE.P.y<L.h-0.6||!!climb}); });
    an.push((t2,dt)=>{ if(!climb) return; dt=dt||0.016; climb.u=Math.min(1,climb.u+dt/climb.dur); climb.y=climb.y0+(climb.y1-climb.y0)*climb.u; const P=ENGINE.P; if(climb.u>=1){ const c0=climb; climb=null; if(c0.up){ P.x=c0.tx; P.z=c0.tz; } else { P.x=c0.bx; P.z=c0.bz; } P.y=c0.y1; } });
    // ── what you can walk on: the rockfall and the log-pile until the hammer breaks them; no walking up the bluff ──
    const SOL=SOLID_F, smashed=k=>!!FW().smashed[k];
    const ok2=(x,y)=>{ const t=at(x,y); if(t===undefined) return false; if(t===105||t===106) return smashed(x+','+y); return !SOL.has(t); };
    let restY=null;
    lv.ground=(x,z)=>climb?climb.y:swing?swing.y:restY!==null?restY:hR(Math.floor(x),Math.floor(z));
    lv.canMove=(fx,fz,tx,tz)=>{ if(climb||swing||restY!==null) return false; const hf=hR(Math.floor(fx),Math.floor(fz))+(ENGINE.airH||0);
      for(const [ox,oz] of [[0,0],[0.22,0],[-0.22,0],[0,0.22],[0,-0.22]]){ const X=Math.floor(tx+ox), Y=Math.floor(tz+oz); if(!ok2(X,Y)) return false; if(hR(X,Y)-hf>0.42&&!(hR(Math.floor(fx+ox),Math.floor(fz+oz))-hf>0.42)) return false; } return true; };
    const cb=lv.camBlock; lv.camBlock=(fx,fz,y)=>{ const x=Math.floor(fx), z=Math.floor(fz), t=at(x,z); if(y<hR(x,z)+0.05) return true; if((t===107||t===108)&&y<2.4) return true; return cb?cb(fx,fz,y):false; };
    // ── Miriam's hammer: the rockfall over the woodcutters' track, the log-pile on the east loop ──
    const clusters=[]; { const seen=new Set(); for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++){ const t=D.forest[y][x]; if((t===105||t===106)&&!seen.has(x+','+y)){ const c={t,cells:[]}, q=[[x,y]]; seen.add(x+','+y);
        while(q.length){ const [a,b]=q.pop(); c.cells.push([a,b]); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=(a+dx)+','+(b+dy); if(!seen.has(k)&&D.forest[b+dy]&&D.forest[b+dy][a+dx]===t){ seen.add(k); q.push([a+dx,b+dy]); } } } clusters.push(c); } } }
    clusters.forEach(c=>{ c.models=c.cells.map(([x,y])=>{ const g=group(x+0.5,0,y+0.5,room);
        if(c.t===105){ const r=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,1),mt(0x7a766c)); r.position.y=0.5; r.scale.set(1,0.85,1); r.rotation.set(hsh(x,y)*3,hsh(y,x)*3,0); g.add(r); for(let i=0;i<3;i++){ const cr=B(0.02,0.5,0.02,0x2a2622,(hsh(i,x)-0.5)*0.5,0.3,0.55,g); cr.rotation.z=(hsh(i,y)-0.5)*1.2; } }
        else { for(let i=0;i<4;i++){ const lg=Cy(0.17,0.17,1.1,8,i%2?0x5a4028:0x4a3420,0,0.17+i*0.3,(i%2-0.5)*0.1,g); lg.rotation.z=Math.PI/2; lg.rotation.y=(hsh(i,x)-0.5)*0.5; } }
        shade(g); return g; });
      const mid=c.cells[Math.floor(c.cells.length/2)], name=c.t===105?'A rockfall':'A pile of fallen logs';
      lv.spots.push({x:mid[0]+0.5,z:mid[1]+0.5+(c.t===105?0:1.0),r:2.2,label:hasHammerF()?'Smash':'Look',who:name,hide:()=>c.cells.every(([x,y])=>smashed(x+','+y)),action:()=>{
        if(!hasHammerF()){ ENGINE.speak(name,c.t===105?['A fall of rock, big as a cart, square across the track. It came down in some storm and no one has had the strength to move it.','(A smith’s hammer, swung hard, would break it.)']:['Trunks, fallen across the way and jammed together, too heavy to lift and too green to burn.','(A heavy hammer could split them apart.)']); return; }
        const P=ENGINE.P; P.face=Math.atan2(mid[0]+0.5-P.x,mid[1]+0.5-P.z); ENGINE.hold(0.6); if(ENGINE.K.act) ENGINE.K.act('atk3',0.5,{arms:true});
        setTimeout(()=>{ if(typeof SFX!=='undefined'){ SFX.play('bossStrike'); SFX.play('hit',true); } c.cells.forEach(([x,y])=>FW().smashed[x+','+y]=true); GAME.save(); c.models.forEach(g=>g.visible=false); UI.toast(c.t===105?'🔨 The rock splits and tumbles off the track.':'🔨 The logs crack apart and roll clear.',2000); },350); }}); });
    an.push(()=>lv.spots.forEach(q=>{ if(q.who==='A rockfall'||q.who==='A pile of fallen logs') q.label=hasHammerF()?'Smash':'Look'; if(q.who==='An iron ring') q.label=hasCrookF()?'Hook':'Look'; }));
    // ── Aiden's crook: iron rings on posts at the ravines' lips; it swings you over ──
    const RG=HD.rings||{}; for(const k in RG){ const [x,y]=k.split(',').map(Number), land=RG[k].land, g=group(x+0.5,0,y+0.5,room); Cy(0.08,0.1,1.9,6,0x4a3220,0,0,0,g); const rg=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.035,6,14),mt(0x5a5a62)); rg.position.y=2.0; g.add(rg); shade(g);
      lv.spots.push({x:x+0.5,z:y+0.5,r:6.5,far:true,label:hasCrookF()?'Hook':'Look',who:'An iron ring',hide:()=>{ const P=ENGINE.P; return Math.hypot(P.x-land[0]-0.5,P.z-land[1]-0.5)<2.2||!!swing; },action:()=>{
        if(!hasCrookF()){ ENGINE.speak('An iron ring',['An old iron ring on a post, across the gap — the kind the woodsmen once hooked a rope to.','(A shepherd’s crook could catch it, and swing you over.)']); return; }
        const P=ENGINE.P, sx=P.x, sz=P.z, ex=land[0]+0.5, ez=land[1]+0.5; P.face=Math.atan2(ex-sx,ez-sz); ENGINE.hold(1.0); if(typeof SFX!=='undefined') SFX.play('swing');
        const rope=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,1,4),mt(0x8a6a3a)); room.add(rope); swing={u:0,y:0};
        an.push(function sw(t2,dt){ dt=dt||0.016; swing.u=Math.min(1,swing.u+dt/0.85); const u=swing.u, e=u*u*(3-2*u); P.x=sx+(ex-sx)*e; P.z=sz+(ez-sz)*e; swing.y=Math.sin(u*Math.PI)*1.3;
          const a=new THREE.Vector3(x+0.5,2.0,y+0.5), b=new THREE.Vector3(P.x,P.y+swing.y+1.4,P.z), mid2=a.clone().add(b).multiplyScalar(0.5); rope.position.copy(mid2); rope.scale.y=a.distanceTo(b); rope.lookAt(b); rope.rotateX(Math.PI/2);
          if(u>=1){ room.remove(rope); swing=null; P.x=ex; P.z=ez; an.splice(an.indexOf(sw),1); } }); }}); }
    // ── the side caves: through a dark mouth in the rocks ──
    let inMouth=true; an.push(()=>{ const P=ENGINE.P, x=Math.floor(P.x), y=Math.floor(P.z), t=at(x,y); if(ENGINE.busy) return;
      if(t===108){ if(!inMouth){ inMouth=true; const id=HD.mouths[x+','+y]; const od=(MOUTHS[id]&&MOUTHS[id].od)||[0,1]; const far=at(x+od[0]*2,y+od[1]*2), dd=far===undefined||SOLID_F.has(far)?1.25:2.1; run.caveFrom={x:x+0.5+od[0]*dd,z:y+0.5+od[1]*dd,face:Math.atan2(od[0],od[1]),yaw:Math.atan2(od[0],od[1])};   /* the camera out on the open ground, looking back at you coming out of the rock */ ENGINE.go('fcave'+id); } } else inMouth=false; });
    // ── the woodcutters' camp ──
    const [cx0,cy0]=HD.camp, folk=(look,x,z,who,rest,opts)=>{ try{ const f=addPerson(lv,scene,look,x,z,0,who,[],Object.assign({rest,mute:true},opts||{})); return f; }catch(e){ return null; } };
    const bram=folk('peasant',cx0+1.5,cy0+1.2,'Foreman Bram',Math.PI*1.2); folk('farmer',cx0-1.6,cy0+0.6,'Wynn the woodcutter',Math.PI*0.6); folk('peasant',cx0+6.6,cy0-0.2,'Tam the sawyer',-Math.PI/2);
    lv.spots.push({x:cx0+1.5,z:cy0+1.2,r:1.6,label:'Talk',who:'Foreman Bram',action:()=>{ const W0=FW(), rockGone=clusters.filter(c=>c.t===105).every(c=>c.cells.every(([x,y])=>smashed(x+','+y)));
      if(W0.axe===2){ W0.axe=3; GAME.save(); const g=Math.round(60*(GAME.S.goldMult||1)); GAME.addGold(g); GAME.S.inventory.potion=(GAME.S.inventory.potion||0)+1; GAME.changed();
        ENGINE.speak('Foreman Bram',['That’s Wynn’s axe! He dropped it off the ford in the spring flood and swore he’d never see it again.','Here — '+g+' gold and a flask for your trouble. And a bed by our fire, any night you want it.','(“Whatsoever thy hand findeth to do, do it with thy might.” — Ecclesiastes 9:10)']); if(typeof JOURNAL!=='undefined') JOURNAL.write('In the Forest of Disillusionment I found the woodcutters\' lost axe at the ford and brought it back to their camp. Foreman Bram gave me a place by their fire.',{}); return; }
      if(rockGone&&W0.rock<2){ W0.rock=2; GAME.save(); const g=Math.round(120*(GAME.S.goldMult||1)); GAME.addGold(g); GAME.S.inventory.potion=(GAME.S.inventory.potion||0)+2; GAME.changed();
        ENGINE.speak('Foreman Bram',['You broke the rockfall? With a hammer? We’ve been hauling round it for two winters!','The cart track’s open again — and the old cave beyond it, the one the rock shut. Take this: '+g+' gold and two flasks. You’ve saved our backs.']); return; }
      if(W0.axe===0){ W0.axe=1; GAME.save(); ENGINE.speak('Foreman Bram',['A knight! Out here in the fog? Sit, sit, warm your hands.','We cut timber for the bridges — the big one on the trail is ours, and the log over the river to the east fell on its own and we just trimmed it.','If you’re going down by the ford to the west, keep an eye out: Wynn dropped his axe there in the spring flood. He’s been sulking since.','And the cart track east is shut by a rockfall. Can’t shift it. Not without a hammer worth the name.']); return; }
      ENGINE.speak('Foreman Bram',W0.axe<3?['The axe went in off the ford stones, west of here. If the water’s low you might see it.']:rockGone?['Fire’s always lit. Come and sit when you like.']:['That rockfall on the cart track, east — if you ever come by a hammer heavy enough, we’d be glad of you.']); }});
    lv.spots.push({x:cx0-1.6,z:cy0+0.6,r:1.4,label:'Talk',who:'Wynn the woodcutter',action:()=>ENGINE.speak('Wynn the woodcutter',FW().axe===3?['My axe! I’d know that nick in the haft anywhere. Bless you.']:['Lost my axe off the ford in the flood. Best axe I ever had. Don’t laugh.'])});
    lv.spots.push({x:cx0+6.6,z:cy0-0.2,r:1.4,label:'Talk',who:'Tam the sawyer',action:()=>ENGINE.speak('Tam the sawyer',['Fog never lifts in here, you know. Folk get turned round in it and walk in circles for days.','A family came through last week going to Saltmere for a wedding. Went south-west off the trail, I think. Hope they found their way.'])});
    // the lost axe, on a stone in the ford
    const [ax,ay]=HD.axe, axeG=group(ax+0.5,0.12,ay+0.5,room); B(0.06,0.06,0.8,0x6a4a2a,0,0,0,axeG); B(0.24,0.16,0.04,0x9a9aa2,0,0,0.36,axeG); axeG.rotation.y=0.6;
    lv.spots.push({x:ax+0.5,z:ay+0.5,r:1.2,label:'Take',who:'An axe on the stones',hide:()=>FW().axe>=2,action:()=>{ FW().axe=2; GAME.save(); axeG.visible=false; UI.toast('🪓 A woodcutter’s axe, wedged between the stepping stones. Someone will want this back.',2600); }});
    // ── the hermit's pond: old Abiel fishing on his stone; the sitting-stone across the water ──
    const [hx,hy]=HD.hermit, ab=folk('scribe',hx+0.5,hy+0.5,'Old Abiel',Math.PI); if(ab&&ab.g){ const rod=Cy(0.012,0.02,2.2,4,0x6a4a2a,0.2,0.9,-0.5,ab.g); rod.rotation.x=-0.9; }
    lv.spots.push({x:hx+0.5,z:hy+0.5,r:1.6,label:'Talk',who:'Old Abiel',action:()=>ENGINE.speak('Old Abiel',!FW().sat?['Shh — you’ll frighten the fish. Not that there are any. I’ve been coming here forty years and I’ve caught three.','I don’t come for the fish. I come because it’s quiet. Sit on that stone across the water a while, knight. “Be still, and know that I am God.”','And if you’re the sort who goes looking for things: my brother strung a hammock in a grove across the ravine, north-west, years ago. You’d need a shepherd’s crook to cross. Best sleep of my life.']:['You sat. Good. Most people never do.','My brother’s hammock is still in that grove across the north-west ravine, I expect. A shepherd’s crook will get you over.'])});
    const [sx0,sy0]=HD.sit; let sitting=0;
    lv.spots.push({x:sx0+0.5,z:sy0+0.5,r:1.3,label:'Sit',who:'A flat stone by the water',action:()=>{ if(sitting) return; const P=ENGINE.P; P.x=sx0+0.5; P.z=sy0+0.5; P.face=Math.atan2(20-P.x,82-P.z); if(ENGINE.K.sheathe) ENGINE.K.sheathe(); ENGINE.hold(7,'sit'); sitting=7;
      UI.toast('🪷 You sit by the pond. The fog is thinner over the water.',2600); setTimeout(()=>{ const S0=GAME.S; S0.hp=S0.maxHp; ENGINE.hud(); sitting=0; const first=!FW().sat; FW().sat=true; GAME.save();
        ENGINE.speak('By the pond',['The water is still. A fish rises somewhere and the rings go out and out. For a while you think about nothing at all — and then about everything, quietly.','“Be still, and know that I am God.” — Psalm 46:10','(Rested: your strength is full.)']); if(first&&typeof JOURNAL!=='undefined') JOURNAL.write('I sat by the hermit\'s pond in the Forest of Disillusionment and was still for a while. "Be still, and know that I am God."',{}); },7000); }});
    // ── the pilgrims: lost in the fog; lead them to the Saltmere road ──
    const [px0,py0]=HD.pilgrims, PIL=[folk('peasant',px0+0.5,py0+0.5,'Joel the pilgrim',0),folk('peasantF',px0+1.6,py0+0.9,'Hannah',0.4),folk('child',px0-0.6,py0+1.0,'Little Pip',-0.3)].filter(Boolean);
    const home=PIL.map(f=>[f.x,f.z]), crumbs=[];
    const placeHome=()=>PIL.forEach((f,i)=>{ f.x=home[i][0]; f.z=home[i][1]; f.g.position.set(f.x,0,f.z); f.g.visible=FW().pil<2; });
    lv.spots.push({x:px0+0.5,z:py0+0.5,r:1.8,label:'Talk',who:'Joel the pilgrim',hide:()=>FW().pil>=1,action:()=>{ ENGINE.speak('Joel the pilgrim',['Oh — thank God. Someone. We’ve been walking in circles since yesterday. Every tree looks like the last tree.','We’re going to Saltmere — my wife’s sister is to be married. Pip has been very brave, haven’t you, Pip.','Could you… would you lead us to the Saltmere road? We’ll keep close behind you.'],null,()=>{ FW().pil=1; GAME.save(); crumbs.length=0; UI.toast('🧭 The pilgrims follow you. Lead them south to the Saltmere road.',2600); }); }});
    an.push((t2,dt)=>{ dt=Math.min(dt||0.016,0.1); const W0=FW(); if(W0.pil!==1) return; const P=ENGINE.P;
      const last=crumbs[0]; if(!last||Math.hypot(P.x-last[0],P.z-last[1])>0.5){ crumbs.unshift([P.x,P.z]); if(crumbs.length>40) crumbs.pop(); }
      PIL.forEach((f,i)=>{ const c=crumbs[Math.min(crumbs.length-1,2+i*2)]; if(!c) return; const dx=c[0]-f.x, dz=c[1]-f.z, d=Math.hypot(dx,dz); if(d>0.3){ const sp=Math.min(d,dt*(d>4?6:4.2)); f.x+=dx/d*sp; f.z+=dz/d*sp; f.g.rotation.y=Math.atan2(dx,dz); } f.g.position.set(f.x,0,f.z); });
      if(Math.floor(P.z)>=GT.bot.y-5&&!ENGINE.busy){ W0.pil=2; GAME.save(); const g=Math.round(80*(GAME.S.goldMult||1)); GAME.addGold(g); GAME.changed();
        ENGINE.speak('Joel the pilgrim',['The road! Look, Pip — the road, and the arch, and the sea-wind coming up it!','We’ll never forget you, knight. Here — '+g+' gold; it was for the wedding gift, but the bride will understand.','(“I will bring the blind by a way that they knew not; I will lead them in paths that they have not known: I will make darkness light before them.” — Isaiah 42:16)'],null,()=>{ PIL.forEach(f=>f.g.visible=false); });
        if(typeof JOURNAL!=='undefined') JOURNAL.write('I found a family of pilgrims lost in the fog of the Forest of Disillusionment and led them out to the Saltmere road. Little Pip held his father\'s hand the whole way.',{}); } });
    // ── the secret grove: a hammock between two trees ──
    let hm=null; for(let y=0;y<Hd&&!hm;y++) for(let x=0;x<Wd;x++) if(D.forest[y][x]===109){ hm={x,y}; break; }
    if(hm){ const hx2=hm.x+1.0, hz2=hm.y+0.5, hg=group(hx2,0.78,hz2,room), cloth=new THREE.MeshLambertMaterial({color:0xd8c8a0,side:THREE.DoubleSide});
      const sl=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,1.9,12,1,true,Math.PI*0.65,Math.PI*0.7),cloth); sl.rotation.z=Math.PI/2; sl.position.y=0.25; hg.add(sl);
      [-1,1].forEach(sd=>{ const r=Cy(0.012,0.012,0.9,4,0x8a7a5a,sd*1.25,0.05,0,hg); r.rotation.z=sd*1.1; });
      const fp=new THREE.BufferGeometry(), N=16, pp=new Float32Array(N*3); fp.setAttribute('position',new THREE.BufferAttribute(pp,3)); const ff=new THREE.Points(fp,new THREE.PointsMaterial({color:0xfff0a0,size:0.08,transparent:true,opacity:0.9,depthWrite:false})); ff.position.set(hx2,0,hz2+1.5); room.add(ff);
      an.push(t=>{ for(let i=0;i<N;i++){ pp[i*3]=Math.sin(t*0.4+i*1.7)*2.2; pp[i*3+1]=0.5+Math.sin(t*0.7+i)*0.5+i*0.04; pp[i*3+2]=Math.cos(t*0.33+i*2.3)*1.6; } fp.attributes.position.needsUpdate=true; });
      let resting=0, tR=0;
      lv.spots.push({x:hx2,z:hz2+1.1,r:1.4,label:'Rest',who:'A hammock',action:()=>{ if(resting) return; const P=ENGINE.P, K=ENGINE.K; if(K.sheathe) K.sheathe(); P.x=hx2-0.6; P.z=hz2; P.face=Math.PI/2; restY=0.62; P.y=0.62; resting=10; tR=0; ENGINE.hold(10,'lie');
        UI.toast('🌿 You climb into the hammock. It sways. Somewhere above, a bird.',2600); }});
      an.push((t2,dt)=>{ dt=dt||0.016; const K=ENGINE.K; if(!resting){ hg.rotation.x=Math.sin(t2*0.8)*0.04; return; } tR+=dt; const sw=Math.sin(tR*1.25)*0.14; hg.rotation.x=sw; K.rotation.z=sw; resting-=dt;
        if(resting<=0){ resting=0; restY=null; K.rotation.z=0; const P=ENGINE.P; P.x=hx2; P.z=hz2+1.2; P.y=0; const S0=GAME.S; S0.hp=S0.maxHp; ENGINE.hud(); const first=!FW().hammock; FW().hammock=true; GAME.save();
          ENGINE.speak('The hammock',['You sleep — properly, deeply, the way you slept as a child at the homestead — and wake with leaf-light moving on your face and nothing at all to fear.','“I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.” — Psalm 4:8','(Rested: your strength is full.)']);
          if(first&&typeof JOURNAL!=='undefined') JOURNAL.write('Across the north-west ravine in the Forest of Disillusionment there is a hidden grove with a hammock strung between two trees — the hermit\'s brother put it there. I swung in it and slept like a child. "Come ye yourselves apart... and rest a while." (Mark 6:31)',{}); } }); }
    // ── on the way in: put things as they are ──
    const enter1=lv.onEnter; lv.onEnter=sp=>{ enter1(sp); climb=null; swing=null; restY=null; inMouth=true; ENGINE.K.rotation.z=0;
      clusters.forEach(c=>c.models.forEach((g,i)=>g.visible=!smashed(c.cells[i][0]+','+c.cells[i][1]))); axeG.visible=FW().axe<2;
      if(FW().pil===1){ FW().pil=0; } placeHome(); crumbs.length=0;
      if(sp&&sp.fromCave&&run.caveFrom){ const P=ENGINE.P; P.x=run.caveFrom.x; P.z=run.caveFrom.z; P.face=run.caveFrom.face||0; } };
    lv.dmap.marks=(lv.dmap.marks||[]).concat([{x:cx0+0.5,y:cy0+0.5,col:'#f0a040'},{x:hx+0.5,y:hy+0.5,col:'#6ad0f0'}]);
  }
  // ── the side caves ──
  function caveLevel(id,name){ const rows=D.hand.caves[id], CC={'#':1,'.':0,'C':5,'d':6,'x':120,'~':100,'*':1}, grid=rows.map(r=>[...r].map(c=>CC[c]!==undefined?CC[c]:0)), crystals=[];
    rows.forEach((r,y)=>[...r].forEach((c,x)=>{ if(c==='*') crystals.push([x,y]); }));
    ENGINE.add({id:'fcave'+id,lazy:()=>{ const F=gridLevel({ id:'fcave'+id, name, grid, cam:{dist:4.6,min:2.6,max:7,pitch:0.42,lookH:0.3}, close:true, walls:'rock', wall:0x4a4640, bg:0x08070a, fog:[5,15], hemi:0.35, lamp:1.25, fA:0x3a3630, fB:0x35322c, solid:new Set([1,5,100]), fight:true, zone:'A cave off the forest trail',
        onDeath:()=>{ spec.exit(run.mouth,true); } });
      const {lv,room,an,spot,at}=F;
      crystals.forEach(([x,y],i)=>{ const col=[0x6ad8f0,0x9a7af0,0x6af0b0][i%3]; for(let k=0;k<3;k++){ const c=new THREE.Mesh(new THREE.ConeGeometry(0.08+hsh(k,x)*0.06,0.4+hsh(x,k)*0.4,5),new THREE.MeshBasicMaterial({color:col})); c.position.set(x+0.5+(hsh(k,y)-0.5)*0.5,0.6+hsh(y,k)*1.4,y+0.5+(hsh(y+k,x)-0.5)*0.5); c.rotation.z=(hsh(k,3)-0.5)*1.2; room.add(c); } const L=new THREE.PointLight(col,0.5,4,1.6); L.position.set(x+0.5,1.2,y+0.5); room.add(L); });
      const wc=[]; grid.forEach((r,y)=>r.forEach((t,x)=>{ if(t===100) wc.push([x,y]); })); if(wc.length) inst(wc,UNIT,new THREE.MeshPhongMaterial({color:0x2a5a7a,transparent:true,opacity:0.8,shininess:90}),([x,y],m)=>{ m.makeScale(1,0.02,1); m.setPosition(x+0.5,-0.04,y+0.5); },room);
      let ex=null; grid.forEach((r,y)=>r.forEach((t,x)=>{ if(t===120) ex=[x,y]; }));
      if(ex){ spot(ex[0],ex[1]-1,'Leave','Back out to the forest',()=>ENGINE.go('forest',Object.assign({fromCave:true},run.caveFrom||{})),0.9); lv.spawn={x:ex[0]+0.5,z:ex[1]-2.5,face:Math.PI}; }
      lv.dmap.marks=ex?[{x:ex[0]+0.5,y:ex[1]+0.5,col:'#6fdf8a'}]:[];
      an.push(()=>{ const P=ENGINE.P; if(ex&&!ENGINE.busy&&Math.floor(P.z)>=ex[1]) ENGINE.go('forest',Object.assign({fromCave:true},run.caveFrom||{})); });
      return lv; }}); }
  if(D.hand){ caveLevel('A','The Rockfall Cave'); caveLevel('B','The Glow-worm Cave'); caveLevel('C','The Fox Hole'); }
  // ── the wood ──
  const SOLID_F=new Set([1,78,5,77,100,103,104,105,106,107,109,110,111,112,117,118]);
  if(typeof DGEN!=='undefined'&&!D.forestOpen) DGEN.forest(D,9137);   // glades on broad trails, not a maze (dungeon_gen.js)
  // the two arches: the Ironhold road always at the head of the wood, the Saltmere road always at its foot. Each is the one way
  // through a wall of trees (77: the arch's piers), with the road running on out beyond it; the hollow gets a temple porch
  if(!D.gates){ const g=D.forest, H=g.length, top=find(g,8), bot=find(g,2);
    if(top&&bot){ const cut=(cx,from,to)=>{ for(let y=from;y<=to;y++) for(let x=cx-4;x<=cx+4;x++) if(g[y]&&g[y][x]!==undefined) g[y][x]=Math.abs(x-cx)<=1?0:1; };
      cut(top[0],0,top[1]-1); cut(bot[0],bot[1]+1,H-1);
      [top,bot].forEach(([x,y])=>{ g[y][x]=0; g[y][x-2]=77; g[y][x+2]=77; });
      D.gates={top:{x:top[0],y:top[1]},bot:{x:bot[0],y:bot[1]}}; }
    const h=find(g,35); if(h){ [-1,1].forEach(d=>{ if(g[h[1]][h[0]+d]===0) g[h[1]][h[0]+d]=77; });
      // the porch backs into the trees — unless that would cut a trail (every way out, the hollow and the chests must still be reachable)
      const back=[]; for(let x=h[0]-2;x<=h[0]+2;x++) if(g[h[1]-1]&&g[h[1]-1][x]===0) back.push([x,h[1]-1]); back.forEach(([x,y])=>g[y][x]=1);
      const reach=()=>{ const W=g[0].length, seen=new Uint8Array(W*H), q=[[top[0],top[1]+2]]; seen[(top[1]+2)*W+top[0]]=1; let n=0;
        while(q.length){ const [x,y]=q.pop(); n++; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy, t=g[Y]&&g[Y][X]; if(t===undefined||t===1||t===77||t===78||seen[Y*W+X]) continue; seen[Y*W+X]=1; q.push([X,Y]); } } return n; };
      const before=(()=>{ back.forEach(([x,y])=>g[y][x]=0); const n=reach(); back.forEach(([x,y])=>g[y][x]=1); return n; })();
      if(reach()<before-back.length) back.forEach(([x,y])=>g[y][x]=0); } }
  const GT=D.gates, SPAWN={north:{x:GT.top.x+0.5,z:GT.top.y+2.5,face:0},south:{x:GT.bot.x+0.5,z:GT.bot.y-1.5,face:Math.PI}};
  function plaque(title,sub){ const c=document.createElement('canvas'); c.width=256; c.height=96; const x=c.getContext('2d');
    const gr=x.createLinearGradient(0,0,0,96); gr.addColorStop(0,'#6e4c2a'); gr.addColorStop(1,'#46301a'); x.fillStyle=gr; x.fillRect(0,0,256,96);
    x.fillStyle='rgba(0,0,0,.16)'; for(let i=0;i<6;i++) x.fillRect(0,12+i*15,256,2); x.strokeStyle='#24160a'; x.lineWidth=7; x.strokeRect(3,3,250,90);
    x.fillStyle='#c8a050'; [[12,12],[244,12],[12,84],[244,84]].forEach(([a,b])=>{ x.beginPath(); x.arc(a,b,4,0,7); x.fill(); });
    x.textAlign='center'; x.fillStyle='#f4d68a'; x.font='bold 42px Georgia,serif'; x.fillText(title,128,52); x.font='italic 19px Georgia,serif'; x.fillStyle='#ece0c4'; x.fillText(sub,128,80);
    return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}); }
  // a stone arch with the road's name on a board beneath the keystone, banners in the town's colour and a lantern on each pier
  function gate(room,an,x,z,rot,title,sub,col,opt){ opt=opt||{}; const g=group(x,0,z,room); g.rotation.y=rot; const st=i=>[0x8a8578,0x7e7a6c,0x96907f][i%3];
    [-2,2].forEach(px=>{ B(1.0,0.28,1.0,0x6a665a,px,0,0,g); for(let i=0;i<5;i++) B(i%2?0.74:0.82,0.48,i%2?0.74:0.82,st(i+(px>0?1:0)),px,0.28+i*0.48,0,g); B(0.98,0.2,0.98,0x9a9488,px,2.68,0,g);
      const ban=new THREE.Mesh(new THREE.PlaneGeometry(0.5,1.15),new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide})); ban.position.set(px,1.6,0.43); g.add(ban);
      B(0.56,0.05,0.05,0x3a2a1a,px,2.17,0.44,g); B(0.16,0.16,0.02,0xe8c766,px,1.6,0.445,g);
      const lt=group(px-Math.sign(px)*0.62,2.0,0.25,g); B(0.3,0.04,0.04,0x2a2420,Math.sign(px)*0.12,0.3,0,lt); B(0.2,0.05,0.2,0x2a2420,0,0.24,0,lt); B(0.14,0.2,0.14,glow(0xffc870),0,0.04,0,lt); B(0.2,0.04,0.2,0x2a2420,0,0,0,lt); });
    for(let i=0;i<=10;i++){ const a=Math.PI*i/10, k=i===5, m=B(k?0.5:0.52,k?0.62:0.44,k?0.92:0.8,k?0xa8a090:st(i),0,0,0,g); m.position.set(Math.cos(a)*2,2.78+Math.sin(a)*2,0); m.rotation.z=a-Math.PI/2; }
    for(let i=0;i<14;i++){ const a=Math.PI*hsh(i,17), r=hsh(17,i); Sp(0.12+r*0.12,i%2?0x3f6a32:0x4d7d3a,Math.cos(a)*2,2.78+Math.sin(a)*2.15,(r-0.5)*0.9,g,6,4).scale.y=0.7; }
    for(let i=0;i<6;i++){ const a=Math.PI*(0.15+0.7*hsh(i,23)), l=0.35+hsh(23,i)*0.8; B(0.04,l,0.04,0x3a6a2e,Math.cos(a)*1.78,2.78+Math.sin(a)*1.78-l,0.3,g); }
    [-0.62,0.62].forEach(cx=>B(0.03,0.62,0.03,0x3a3a3a,cx,3.95,0.02,g));
    B(1.86,0.74,0.06,0x3a2814,0,3.28,0,g); const p=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.68),plaque(title,sub)); p.position.set(0,3.65,0.04); g.add(p);
    if(!opt.noLight){ const L=new THREE.PointLight(0xffc070,1.1,7,1.6); L.position.set(0,2.3,0.9); g.add(L); }
    if(!opt.noRoad){ B(3.0,0.02,7,0x4a3a22,0,0,-4,g); B(3.0,0.02,2.2,0x4a3a22,0,0,1.4,g); }   // the road, out and in
    return g; }
  // ── 🃏 the way to Robby's: playing cards dropped along the trail to his tree, and the ace of spades nailed to the trunk ──
  let CARDS=null; const cardMats=()=>CARDS||(CARDS=(()=>{ const mk=(r,s,red)=>{ const c=document.createElement('canvas'); c.width=64; c.height=90; const x=c.getContext('2d');
      x.fillStyle='#f4efe2'; x.fillRect(0,0,64,90); x.strokeStyle='#bdb4a0'; x.lineWidth=3; x.strokeRect(2,2,60,86); x.fillStyle=red?'#c02828':'#1a1a1a';
      x.font='bold 18px Georgia,serif'; x.textAlign='left'; x.fillText(r,6,21); x.font='40px serif'; x.textAlign='center'; x.fillText(s,32,64);
      return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}); };
    const bk=(()=>{ const c=document.createElement('canvas'); c.width=64; c.height=90; const x=c.getContext('2d'); x.fillStyle='#f4efe2'; x.fillRect(0,0,64,90); x.fillStyle='#8a1e2a'; x.fillRect(5,5,54,80);
      x.strokeStyle='#e8c766'; x.lineWidth=1.5; for(let i=-90;i<90;i+=9){ x.beginPath(); x.moveTo(5+i,5); x.lineTo(95+i,95); x.stroke(); x.beginPath(); x.moveTo(59-i,5); x.lineTo(-31-i,95); x.stroke(); }
      return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}); })();
    return {faces:[['the seven of hearts',mk('7','♥',1)],['the king of diamonds',mk('K','♦',1)],['the three of clubs',mk('3','♣')],['the queen of hearts',mk('Q','♥',1)],['the jack of spades',mk('J','♠')],['the nine of diamonds',mk('9','♦',1)]],back:bk,ace:mk('A','♠')}; })());
  function openRobby(knock){ const P=ENGINE.P; run.robbyFrom={x:P.x,z:P.z,face:P.face};
    UI.toast(knock?'✊ You knock. From inside, a voice: “It’s open. It’s a tree.”':'🕳 The tree is hollow. There is a television on inside.',2400); setTimeout(()=>ENGINE.go('robbycave'),knock?900:350); }
  ENGINE.add({id:'forest',lazy:()=>{ const F=gridLevel({ id:'forest', name:'The Forest of Disillusionment', grid:D.forest, cam:{dist:6.2,min:3.5,max:10,pitch:0.52,lookH:0.3}, treeH:1.45, open:true, bg:0x1c2620, fog:[13,30], hemi:0.42, lamp:0.8, walls:'trees', fA:0x2f4a2a, fB:0x2a4426, solid:SOLID_F, fight:true, zone:'A cold fog drinks the light', mapCell:4, mapReveal:4, floorCol:D.hand?FLOORCOL:null,
      onDeath:()=>{ spec.exit(run.mouth,true); },
      onSwing:()=>{ const P=ENGINE.P, x=Math.floor(P.x+Math.sin(P.face)*0.9), y=Math.floor(P.z+Math.cos(P.face)*0.9); if(F.at(x,y)!==78) return; setTimeout(()=>openRobby(false),0); } });
    const {lv,room,an,spot,at,ok}=F;
    if(D.hand) handForest(F);
    // mist drifting low between the trees
    for(let i=0;i<(D.hand?140:60);i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(1.1,8,6),new THREE.MeshBasicMaterial({color:0xc8d8d0,transparent:true,opacity:0.12,depthWrite:false})); m.scale.set(1.8,0.35,1.4);
      const bx=1+hsh(i,3)*(D.forest[0].length-2), bz=1+hsh(7,i)*(D.forest.length-2); m.position.set(bx,0.4,bz); room.add(m); an.push(t=>{ m.position.x=bx+Math.sin(t*0.2+i)*1.2; m.material.opacity=0.08+0.05*Math.sin(t*0.5+i); }); }
    // the two arches
    gate(room,an,GT.top.x+0.5,GT.top.y+0.5,0,'IRONHOLD','↑ the Ironhold road',0x7a2a2a);
    gate(room,an,GT.bot.x+0.5,GT.bot.y+0.5,Math.PI,'SALTMERE','↓ the road to the sea',0x2a5a8a);
    let leaving=false; const exitBy=side=>{ if(leaving||ENGINE.busy) return; leaving=true; spec.exit(side); };
    spot(GT.top.x,GT.top.y-1,'Leave','To the Ironhold road',()=>exitBy('north'),0.9);
    spot(GT.bot.x,GT.bot.y+1,'Leave','To the Saltmere road',()=>exitBy('south'),0.9);
    lv.dmap.marks=[{x:GT.top.x+0.5,y:GT.top.y+0.5,col:'#6fdf8a'},{x:GT.bot.x+0.5,y:GT.bot.y+0.5,col:'#6fdf8a'}];
    // Eldan's hollow: an old temple porch, half swallowed by the wood — columns, a pediment furred with moss, a doorway that breathes green light
    const h=find(D.forest,35); if(h){ const [hx,hy]=h, tg=group(hx+0.5,0,hy+0.3,room), stn=0x8e9484, mos=0x4f7a3e;
      B(3.1,0.12,1.4,0x7a8072,0,0,0.15,tg); B(2.7,0.12,1.15,stn,0,0.12,0.02,tg);
      [-1.05,1.05].forEach(x=>{ B(0.46,0.14,0.46,0x9aa090,x,0.24,0.35,tg); Cy(0.17,0.2,2.06,8,stn,x,0.38,0.35,tg); B(0.46,0.14,0.46,0x9aa090,x,2.44,0.35,tg); });
      B(2.75,0.3,0.72,stn,0,2.58,0.2,tg); const ped=prism(2.85,0.75,0.62,0x868c7c); ped.position.set(0,2.88,0.2); tg.add(ped);
      B(0.75,2.4,0.4,0x7e8474,-0.95,0.24,-0.35,tg); B(0.75,2.4,0.4,0x7e8474,0.95,0.24,-0.35,tg); B(1.2,0.55,0.4,0x7e8474,0,2.09,-0.35,tg);
      const dark=new THREE.Mesh(new THREE.PlaneGeometry(1.16,1.86),new THREE.MeshBasicMaterial({color:0x06140c})); dark.position.set(0,1.17,-0.14); tg.add(dark);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.7),new THREE.MeshBasicMaterial({color:0x8fffb8,transparent:true,opacity:0.25,depthWrite:false,blending:THREE.AdditiveBlending})); gl.position.set(0,1.12,-0.12); tg.add(gl);
      an.push(t=>{ gl.material.opacity=0.14+0.12*Math.sin(t*1.4); });
      const L=new THREE.PointLight(0x9affc0,0.9,5,1.6); L.position.set(0,1.2,0.7); tg.add(L);
      for(let i=0;i<18;i++){ const r=hsh(i,hx), s=hsh(hy,i); Sp(0.12+r*0.14,i%2?mos:0x3e6a32,(r-0.5)*2.9,2.5+s*0.95,0.2+(s-0.5)*0.55,tg,6,4).scale.y=0.6; }
      for(let i=0;i<8;i++){ const x=(hsh(i,7)-0.5)*2.5, l=0.4+hsh(7,i)*1.2; B(0.04,l,0.04,0x3a6a2e,x,2.58-l,0.57,tg); }
      [[-1.15,0.9,1.3],[1.0,0.85,-1.2]].forEach(([x,z,r])=>{ const rt=Cy(0.06,0.12,1.3,5,0x4a3626,x,0.1,z,tg); rt.rotation.z=r; });
      [-1.75,1.75].forEach(x=>{ Cy(0.16,0.2,0.5,6,0x7a8072,x,0,0.9,tg); B(0.32,0.26,0.32,0x8e9484,x,0.5,0.9,tg); B(0.18,0.14,0.18,glow(0xb8ffc8),x,0.56,0.9,tg); Co(0.26,0.2,4,0x7a8072,x,0.76,0.9,tg); });
      const pts=new THREE.BufferGeometry(), N=14, pp=new Float32Array(N*3); pts.setAttribute('position',new THREE.BufferAttribute(pp,3));
      const fly=new THREE.Points(pts,new THREE.PointsMaterial({color:0xd8ffb0,size:0.07,transparent:true,opacity:0.9,depthWrite:false})); tg.add(fly);
      an.push(t=>{ for(let i=0;i<N;i++){ pp[i*3]=Math.sin(t*0.4+i*1.7)*1.8; pp[i*3+1]=0.6+Math.sin(t*0.7+i)*0.5+i*0.06; pp[i*3+2]=0.9+Math.cos(t*0.33+i*2.3)*1.0; } pts.attributes.position.needsUpdate=true; }); }
    // Robby's tree: a trail of cards leads to it, the nearest the thickest
    const rb=find(D.forest,78); if(rb){ const [rx,ry]=rb, W=D.forest[0].length, Hh=D.forest.length, CM=cardMats();
      let s0=null; for(const [dx,dy] of [[-1,0],[1,0],[0,1],[0,-1]]) if(!s0&&ok(rx+dx,ry+dy)) s0=[rx+dx,ry+dy];
      if(s0){ const par=new Int32Array(W*Hh).fill(-2), st=[Math.floor(SPAWN.north.x),Math.floor(SPAWN.north.z)], q=[st]; par[st[1]*W+st[0]]=-1;
        while(q.length){ const [x,y]=q.shift(); if(x===s0[0]&&y===s0[1]) break; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=W||ny>=Hh||par[ny*W+nx]!==-2||!ok(nx,ny)) continue; par[ny*W+nx]=y*W+x; q.push([nx,ny]); } }
        const path=[]; let c=s0[1]*W+s0[0]; while(c>=0&&path.length<60){ path.push([c%W,(c/W)|0]); c=par[c]; }
        [0,1,2,3,5,7,10,13,17,22,28,35,43].forEach((k,i)=>{ if(k>=path.length) return; const [x,y]=path[k], f=CM.faces[(i+rx)%CM.faces.length], down=hsh(i,ry)<0.3;
          const m=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.28),down?CM.back:f[1]); m.rotation.x=-Math.PI/2; m.rotation.z=hsh(ry,i)*6.3; m.position.set(x+0.5+(hsh(i,5)-0.5)*0.5,0.015+i*0.0005,y+0.5+(hsh(5,i)-0.5)*0.5); room.add(m);
          if(k===3||k===13) spot(x,y,'Look','A playing card',()=>say('🃏 A playing card',[`${down?'Face down. You turn it over:':'Face up, swollen with fog-damp:'} ${f[0]}.`,k===3?'And there’s another, a few steps on. And another. The cards lead toward one old tree.':'Odd. There’s another a little further on… someone has been dropping cards out here, a long way from any table.']),0.8); });
        const dx=s0[0]-rx, dz=s0[1]-ry, ace=new THREE.Mesh(new THREE.PlaneGeometry(0.22,0.31),CM.ace); ace.position.set(rx+0.5+dx*0.36,1.2,ry+0.5+dz*0.36); ace.rotation.y=Math.atan2(dx,dz); ace.rotation.z=0.12; room.add(ace);
        Sp(0.025,0x8a8a8a,rx+0.5+dx*0.37,1.32,ry+0.5+dz*0.37,room,5,4);
        const glowC=disc0(room,0.35,0xfff0c0,0.0); glowC.position.set(rx+0.5+dx*0.45,0.02,ry+0.5+dz*0.45); an.push(t=>{ glowC.material.opacity=0.06+0.05*Math.sin(t*2.2); });
        spot(s0[0],s0[1],'Knock','A tree with the ace of spades nailed to it',()=>openRobby(true),1.0); } }
    an.push(()=>{ const P=ENGINE.P, t=at(Math.floor(P.x),Math.floor(P.z)); if(ENGINE.busy) return;
      if(Math.floor(P.z)<GT.top.y) exitBy('north'); else if(Math.floor(P.z)>GT.bot.y) exitBy('south');
      if(t===35){ if(!onHollow){ onHollow=true; run.hollow={x:P.x,z:P.z}; ENGINE.go('glade'); } } else onHollow=false; });
    let onHollow=true;
    const enter0=lv.onEnter; lv.onEnter=sp=>{ enter0(sp); onHollow=true; leaving=false; };
    lv._D=D; lv.spawn=SPAWN.north; return lv; }});
  function disc0(par,r,col,op){ const m=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.y=0.02; par.add(m); return m; }

  // ── the glade's own creatures: a deer and a stag grazing, rabbits, swans on the pool, birds, butterflies (none of them in your way) ──
  const CRIT={
    deer(par,an,x,z,ry,stag){ const g=group(x,0,z,par), col=stag?0x8a5a32:0xa8743e, lt=0xe8d4b0; g.rotation.y=ry; if(typeof ANIM3!=='undefined') setTimeout(()=>ANIM3.dress(g,stag?'stag':'deer'),0);   /* V190: rigged (animals3.js), once this one is built */
      const body=Sp(0.3,col,0,0.82,0,g,8,6); body.scale.set(0.8,0.75,1.5); Sp(0.24,lt,0,0.74,0.02,g,8,6).scale.set(0.72,0.55,1.3);
      [[0.13,0.3],[-0.13,0.3],[0.13,-0.3],[-0.13,-0.3]].forEach(([a,b])=>Cy(0.035,0.028,0.64,5,0x6a4426,a,0,b,g)); Sp(0.06,0xffffff,0,0.92,-0.44,g,5,4);
      const hg=group(0,0.9,0.36,g); Cy(0.065,0.09,0.55,6,col,0,0,0,hg); const hd=Sp(0.11,col,0,0.6,0.07,hg,7,5); hd.scale.set(0.8,0.85,1.5); Sp(0.035,0x1a1410,0,0.58,0.23,hg,5,4);
      [-1,1].forEach(s=>{ const e=B(0.05,0.15,0.025,col,s*0.09,0.62,0.0,hg); e.rotation.z=-s*0.6;
        if(stag){ const a=Cy(0.014,0.02,0.34,4,0xd8c8a0,s*0.06,0.66,0.02,hg); a.rotation.z=-s*0.45; const b=Cy(0.012,0.016,0.16,4,0xd8c8a0,s*0.14,0.82,0.06,hg); b.rotation.x=0.6; b.rotation.z=-s*0.2; } });
      const ph=hsh(x*7|0,z*7|0)*20; an.push(t=>{ const c=(t+ph)%12, graze=c<7, k=graze?Math.min(1,c*1.5,(7-c)*1.5):0; hg.rotation.x=0.35+k*1.45; hg.rotation.z=graze?Math.sin(t*3)*0.04:0; g.rotation.y=ry+(c>7?Math.sin((c-7)*0.6)*0.5:0); }); return g; },
    rabbit(par,an,x,z){ const g=group(x,0,z,par), col=hsh(x|0,z|0)<0.5?0x9a8a76:0x7a6a5a; Sp(0.11,col,0,0.11,0,g,7,5).scale.set(1,0.9,1.3); Sp(0.075,col,0,0.2,0.12,g,7,5);
      [-1,1].forEach(s=>{ const e=B(0.03,0.14,0.016,col,s*0.03,0.24,0.1,g); e.rotation.z=-s*0.15; }); Sp(0.035,0xf4f0e8,0,0.13,-0.14,g,5,4);
      let hx=x, hz=z, tx=x, tz=z, nt=hsh(z|0,x|0)*3, prog=1; const ph=hsh(x*3|0,z|0)*9;
      an.push(t=>{ if(prog>=1&&t>nt){ const a=Math.random()*6.3, r=Math.random()*1.3; hx=g.position.x; hz=g.position.z; tx=x+Math.cos(a)*r; tz=z+Math.sin(a)*r; prog=0; g.rotation.y=Math.atan2(tx-hx,tz-hz); }
        if(prog<1){ prog=Math.min(1,prog+0.035); const e=prog; g.position.set(hx+(tx-hx)*e,Math.abs(Math.sin(e*Math.PI*2))*0.12,hz+(tz-hz)*e); if(prog>=1) nt=t+1.5+((t+ph)%3); } }); return g; },
    swan(par,an,cx,cz,r,ph){ const g=group(cx,0,cz,par); Sp(0.2,0xf8f6f0,0,0.12,0,g,8,6).scale.set(0.75,0.55,1.3); Sp(0.12,0xf2f0ea,0,0.2,-0.18,g,6,4).scale.set(0.9,0.6,1);
      [[0,0.26,0.16],[0,0.36,0.2],[0,0.45,0.2]].forEach(([a,b,c])=>Sp(0.045,0xf8f6f0,a,b,c,g,6,4)); Sp(0.055,0xf8f6f0,0,0.5,0.25,g,6,4); Co(0.025,0.09,5,0xe87a2a,0,0.47,0.33,g).rotation.x=Math.PI/2;
      an.push(t=>{ const a=t*0.18+ph; g.position.set(cx+Math.cos(a)*r,0.02+Math.sin(t*1.3+ph)*0.01,cz+Math.sin(a)*r*0.7); g.rotation.y=Math.atan2(-Math.sin(a)*r,Math.cos(a)*r*0.7); }); return g; },
    bird(par,an,cx,cz,r,h,ph,col){ const g=group(cx,h,cz,par); Sp(0.06,col,0,0,0,g,6,4).scale.set(1,0.9,1.5); Co(0.012,0.05,4,0xe8a83a,0,-0.02,0.1,g).rotation.x=Math.PI/2; const w=[];
      [-1,1].forEach(s=>{ const p=group(s*0.03,0,0,g); B(0.16,0.012,0.07,col,s*0.08,0,0,p); w.push([p,s]); });
      const sg=ph%2?1:-1; an.push(t=>{ const a=t*0.5*sg+ph; g.position.set(cx+Math.cos(a)*r,h+Math.sin(t*0.8+ph)*0.4,cz+Math.sin(a)*r); g.rotation.y=Math.atan2(-Math.sin(a)*sg,Math.cos(a)*sg); w.forEach(([p,s])=>p.rotation.z=s*Math.sin(t*14+ph)*0.7); }); return g; },
    fly(par,an,cx,cz,col,ph){ const g=group(cx,0.5,cz,par), m=new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}), w=[];
      [-1,1].forEach(s=>{ const p=group(0,0,0,g), q=new THREE.Mesh(new THREE.PlaneGeometry(0.09,0.08),m); q.position.x=s*0.045; q.rotation.x=-Math.PI/2; p.add(q); w.push([p,s]); });
      an.push(t=>{ g.position.set(cx+Math.sin(t*0.6+ph)*0.9+Math.sin(t*1.7+ph)*0.2,0.45+Math.sin(t*1.1+ph)*0.25,cz+Math.cos(t*0.45+ph)*0.8); g.rotation.y=t*0.6+ph; w.forEach(([p,s])=>p.rotation.z=s*(0.2+Math.abs(Math.sin(t*16+ph))*1.1)); }); return g; } };
  // the glade, laid out afresh: you come in at the south through the temple's inner door; a path of stepping stones runs north over a
  // little arched bridge to an open rotunda of old columns where Eldan keeps his altar. A pool fed by a waterfall in the east, a stream
  // to the west, an ancient tree, a fairy ring — and deer, rabbits, swans, birds and butterflies that pay you no mind
  //   40 water · 41 the bridge · 42 the great tree · 43 the rotunda's floor · 44 boulder · 48 stone lantern · 57 column
  function gladeGrid(){ const W=23, H=29, g=[]; for(let y=0;y<H;y++){ g.push([]); for(let x=0;x<W;x++) g[y].push(x===0||y===0||x===W-1||y===H-1?1:0); }
    const cx=11, cy=7; for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) if(Math.hypot(x-cx,y-cy)<4.4) g[y][x]=43;
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; g[Math.round(cy+Math.sin(a)*3.6)][Math.round(cx+Math.cos(a)*3.6)]=57; }
    g[5][11]=9; g[7][13]=5;
    for(let x=1;x<=14;x++){ const c=x>=8?18:18+Math.round(Math.sin(x*0.7)*0.8); g[c][x]=40; g[c+1][x]=40; }
    for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) if(((x+0.5-17.5)/3.3)**2+((y+0.5-19.5)/2.6)**2<=1) g[y][x]=40;
    for(let y=17;y<=22;y++) g[y][21]=44; g[17][20]=44; g[22][20]=44; g[23][2]=44; g[25][19]=44; g[3][19]=44;
    for(let x=10;x<=12;x++){ g[18][x]=41; g[19][x]=41; }
    g[6][4]=42; [[9,24],[13,24],[9,14],[13,14]].forEach(([x,y])=>g[y][x]=48);
    g[H-2][11]=8; return g; }
  D.glade=gladeGrid();
  // ── Eldan's Glade ──
  ENGINE.add({id:'glade',lazy:()=>{ const GS=new Set([1,5,9,40,42,44,48,57]);
    const G=gridLevel({ id:'glade', name:'Eldan’s Glade', grid:D.glade, bg:0x9cc8a8, fog:[16,40], hemi:0.62, lamp:0.4, sun:0.55, walls:'trees', borderOnly:true, fA:0x4e8a42, fB:0x49843e, solid:GS, zone:'Water over stone, and light through the canopy',
      floorCol:t=>t===40?0x2a4a46:t===43||t===57||t===9?0x8a8678:null });
    const {lv,room,an,spot}=G, GR=D.glade;
    // the bridge carries you up and over the stream
    const BR={x0:10,x1:13,z0:17.6,z1:20.4,h:0.24}; lv.ground=(x,z)=>(x>=BR.x0&&x<BR.x1&&z>BR.z0&&z<BR.z1)?BR.h*Math.sin(Math.PI*(z-BR.z0)/(BR.z1-BR.z0)):0;
    for(let k=0;k<14;k++){ const z=BR.z0+0.1+k*0.2, y=lv.ground(11.5,z); B(3.0,0.06,0.18,k%2?0x8a6a42:0x7e6038,11.5,y-0.05,z,room); }
    [BR.x0+0.06,BR.x1-0.06].forEach(x=>{ for(let k=0;k<=4;k++){ const z=BR.z0+k*0.7, y=lv.ground(11.5,Math.min(BR.z1-0.01,Math.max(BR.z0+0.01,z))); B(0.08,0.55,0.08,0x5a4228,x,y,z,room); }
      for(let k=0;k<4;k++){ const za=BR.z0+k*0.7, zb=za+0.7, ya=lv.ground(11.5,Math.max(BR.z0+0.01,za)), yb=lv.ground(11.5,Math.min(BR.z1-0.01,zb)), r=B(0.06,0.06,0.74,0x6a4c2e,x,0,(za+zb)/2,room); r.position.y=(ya+yb)/2+0.55; r.rotation.x=-Math.atan2(yb-ya,0.7); } });
    // water: the pool and the stream, with lily pads, ripples, and the waterfall at the pool's east end
    const wt=[]; for(let y=0;y<G.H;y++) for(let x=0;x<G.W;x++) if(GR[y][x]===40) wt.push([x,y]);
    const wm=new THREE.MeshPhongMaterial({color:0x4aa4c4,transparent:true,opacity:0.78,shininess:90,specular:0xffffff,depthWrite:false}); inst(wt,UNIT,wm,([x,y],m)=>{ m.makeScale(1,0.02,1); m.setPosition(x+0.5,0.02,y+0.5); },room,true);
    an.push(t=>{ wm.opacity=0.74+0.05*Math.sin(t*0.9); wm.color.setHSL(0.54,0.48,0.5+0.03*Math.sin(t*0.7)); });
    for(let i=0;i<9;i++){ const a=hsh(i,4)*6.3, r=hsh(4,i)*2.2, p=new THREE.Mesh(new THREE.CircleGeometry(0.2+hsh(i,i)*0.1,10,0.4,5.6),lam(0x4a8a3a)); p.rotation.x=-Math.PI/2; p.position.set(17.5+Math.cos(a)*r,0.045,19.5+Math.sin(a)*r*0.7); room.add(p);
      if(i%3===0){ Sp(0.06,0xffd8e8,p.position.x,0.08,p.position.z,room,6,4).scale.y=0.6; } }
    for(let i=0;i<6;i++){ const rg=new THREE.Mesh(new THREE.RingGeometry(0.1,0.14,20),new THREE.MeshBasicMaterial({color:0xe8f8ff,transparent:true,opacity:0,depthWrite:false})); rg.rotation.x=-Math.PI/2; room.add(rg);
      let sx=0, sz=0; an.push(t=>{ const c=(t*0.5+i/6)%1; if(c<0.02||!sx){ const k=wt[(Math.random()*wt.length)|0]; sx=k[0]+0.5; sz=k[1]+0.5; } rg.position.set(sx,0.05,sz); rg.scale.setScalar(1+c*5); rg.material.opacity=0.45*(1-c); }); }
    { const wf=group(21.1,0,19.5,room); for(let i=0;i<9;i++){ const r=new THREE.Mesh(new THREE.IcosahedronGeometry(0.7+hsh(i,2)*0.4,0),flat(i%3?0x7a7e74:0x6a6e64)); r.position.set(0.5+hsh(2,i)*0.6,0.3+i*0.32,(hsh(i,9)-0.5)*3.6); r.scale.y=0.8; wf.add(r); }
      [-1.5,1.5].forEach(z=>{ for(let k=0;k<4;k++) Sp(0.3,0x4a7a3a,0.1,1.2+k*0.55,z+(hsh(k,z|0)-0.5)*0.6,wf,6,4).scale.y=0.6; });
      const c=document.createElement('canvas'); c.width=32; c.height=128; const x=c.getContext('2d'); x.fillStyle='#bfe6f2'; x.fillRect(0,0,32,128); for(let i=0;i<40;i++){ x.fillStyle=`rgba(255,255,255,${0.3+Math.random()*0.6})`; x.fillRect(Math.random()*32,Math.random()*128,1+Math.random()*2,8+Math.random()*30); }
      const tex=new THREE.CanvasTexture(c); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; const fall=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.7),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0.82,side:THREE.DoubleSide,depthWrite:false}));
      fall.position.set(-0.15,1.35,0); fall.rotation.y=-Math.PI/2; wf.add(fall); an.push(t=>{ tex.offset.y=t*1.2; });
      for(let i=0;i<7;i++){ const f=Sp(0.18,0xffffff,-0.5,0.08,(i-3)*0.22,wf,6,4); f.material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7}); an.push(t=>{ const s=0.7+0.4*Math.abs(Math.sin(t*3+i)); f.scale.set(s,s*0.5,s); }); }
      const wl=new THREE.PointLight(0xc8f0ff,0.6,6,1.5); wl.position.set(-1,1,0); wf.add(wl); }
    // the boulders, the great tree, the stone lanterns
    for(let y=0;y<G.H;y++) for(let x=0;x<G.W;x++){ const t=GR[y][x];
      if(t===44&&x<21){ const r=new THREE.Mesh(new THREE.IcosahedronGeometry(0.55,0),flat(0x7e8276)); r.position.set(x+0.5,0.35,y+0.5); r.rotation.y=hsh(x,y)*6; r.scale.y=0.75; room.add(r); Sp(0.3,0x4a7a3a,x+0.5,0.7,y+0.5,room,6,4).scale.y=0.35; }
      if(t===48){ Cy(0.18,0.24,0.6,6,0x8a8c80,x+0.5,0,y+0.5,room); B(0.4,0.34,0.4,0x9a9c90,x+0.5,0.6,y+0.5,room); B(0.24,0.2,0.24,glow(0xffe0a0),x+0.5,0.67,y+0.5,room); Co(0.36,0.28,4,0x8a8c80,x+0.5,0.94,y+0.5,room).rotation.y=Math.PI/4; } }
    { const tg=group(4.5,0,6.5,room); Cy(0.42,0.75,3.4,9,0x5a4430,0,0,0,tg); for(let i=0;i<6;i++){ const a=i/6*6.3, r=Cy(0.08,0.2,1.1,5,0x5a4430,Math.cos(a)*0.7,0.05,Math.sin(a)*0.7,tg); r.rotation.set(Math.sin(a)*1.2,0,-Math.cos(a)*1.2); }
      [[0,4.3,0,1.9],[1.2,3.9,0.4,1.4],[-1.2,4.0,-0.3,1.5],[0.3,3.7,-1.2,1.3],[-0.4,3.8,1.2,1.3],[0,5.2,0.2,1.3]].forEach(([a,b,c,r],i)=>Sp(r,i%2?0x4a8a3a:0x3f7a34,a,b,c,tg,9,7).scale.y=0.7);
      for(let i=0;i<12;i++){ const a=i/12*6.3, l=0.6+hsh(i,3)*0.8; B(0.02,l,0.02,0x5a8a4a,Math.cos(a)*1.7,3.4-l,Math.sin(a)*1.7,tg); const bl=Sp(0.06,glow(i%2?0xffc8e8:0xfff4c0),Math.cos(a)*1.7,3.4-l,Math.sin(a)*1.7,tg,5,4); an.push(t=>bl.scale.setScalar(0.8+0.3*Math.sin(t*2+i))); } }
    // the rotunda: a stone floor, ten columns (two broken, one drum fallen), a ring of lintels with vines, Eldan's altar
    { const fl=new THREE.Mesh(new THREE.CylinderGeometry(4.35,4.5,0.1,28),flat(0x969284)); fl.position.set(11.5,0.0,7.5); room.add(fl);
      const rg=new THREE.Mesh(new THREE.RingGeometry(2.0,2.2,28),lam(0x8a8678)); rg.rotation.x=-Math.PI/2; rg.position.set(11.5,0.06,7.5); room.add(rg);
      const cols=[]; for(let y=0;y<G.H;y++) for(let x=0;x<G.W;x++) if(GR[y][x]===57) cols.push([x,y]);
      cols.forEach(([x,y],i)=>{ const broken=i===3||i===8, h=broken?1.1+hsh(x,y)*0.5:2.7; B(0.6,0.2,0.6,0x9a9688,x+0.5,0.05,y+0.5,room); Cy(0.22,0.25,h,10,0xb4b0a0,x+0.5,0.25,y+0.5,room);
        if(!broken) B(0.6,0.18,0.6,0xb4b0a2,x+0.5,2.95,y+0.5,room); else { const d=Cy(0.22,0.22,0.6,10,0xc0bcac,x+0.5+0.9,0.22,y+0.5+0.5,room); d.rotation.z=Math.PI/2; d.rotation.y=hsh(y,x)*3; }
        for(let k=0;k<3;k++) Sp(0.1,0x4a7a3a,x+0.5+(hsh(k,x)-0.5)*0.4,0.4+k*0.7*(h/2.7),y+0.5+(hsh(y,k)-0.5)*0.4,room,5,4); });
      const ring=cols.map(([x,y])=>[x+0.5,y+0.5,Math.atan2(y+0.5-7.5,x+0.5-11.5)]).sort((a,b)=>a[2]-b[2]);
      ring.forEach((p,i)=>{ const q=ring[(i+1)%ring.length], bi=cols.findIndex(([x,y])=>x+0.5===p[0]&&y+0.5===p[1]), bj=cols.findIndex(([x,y])=>x+0.5===q[0]&&y+0.5===q[1]); if([3,8].includes(bi)||[3,8].includes(bj)) return;
        const dx=q[0]-p[0], dz=q[1]-p[1], L=Math.hypot(dx,dz); if(L>3.4) return; const m=B(L+0.3,0.3,0.4,0xbcb8a8,(p[0]+q[0])/2,3.12,(p[1]+q[1])/2,room); m.rotation.y=-Math.atan2(dz,dx);
        for(let k=0;k<3;k++){ const f=(k+0.5)/3, l=0.3+hsh(i,k)*0.7; B(0.03,l,0.03,0x3f7a34,p[0]+dx*f,3.12-l,p[1]+dz*f,room); } });
      const m=[11,5]; B(1.3,0.7,0.8,0xa8a498,m[0]+0.5,0,m[1]+0.5,room); B(1.36,0.06,0.86,0xc8c4b4,m[0]+0.5,0.7,m[1]+0.5,room); B(1.3,0.02,0.5,0x3a7a3a,m[0]+0.5,0.76,m[1]+0.5,room);
      flame(m[0]+0.05,0.86,m[1]+0.5,room,an,1.2); flame(m[0]+0.95,0.86,m[1]+0.5,room,an,1.2); Cy(0.03,0.03,0.1,5,0xf4ecd8,m[0]+0.05,0.76,m[1]+0.5,room); Cy(0.03,0.03,0.1,5,0xf4ecd8,m[0]+0.95,0.76,m[1]+0.5,room);
      B(0.32,0.06,0.24,0x6a3a2a,m[0]+0.5,0.77,m[1]+0.5,room);
      const al=new THREE.PointLight(0xfff0c0,0.7,6,1.6); al.position.set(11.5,1.6,6.5); room.add(al);
      const f=addPerson(lv,room,'priest',m[0]+0.5,m[1]+1.35,0,'Eldan the Sage',null,{stole:0x3a7a3a,rest:0}); f.action=()=>sageTalk(); f.label='Talk'; }
    // the temple's inner door you came through
    { const e=find(GR,8), dg=group(e[0]+0.5,0,e[1]+1,room); [-0.95,0.95].forEach(x=>{ B(0.5,2.5,0.5,0x8e9484,x,0,0,dg); }); B(2.4,0.45,0.6,0x8e9484,0,2.5,0,dg); const pd=prism(2.6,0.6,0.5,0x868c7c); pd.position.set(0,2.95,0); dg.add(pd);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.5),new THREE.MeshBasicMaterial({color:0x1a3a24})); gl.position.set(0,1.25,0.1); dg.add(gl);
      for(let i=0;i<10;i++) Sp(0.12+hsh(i,1)*0.1,0x4a7a3a,(hsh(1,i)-0.5)*2.6,2.4+hsh(i,6)*0.9,-0.1,dg,6,4).scale.y=0.6;
      spot(e[0],e[1],'Leave','Back into the wood',()=>{ const h=run.hollow; ENGINE.go('forest',h?{x:h.x,z:h.z+0.9,face:0}:null); setTimeout(()=>UI.toast('🌲 You step back through the temple door, into the fog of the wood.',1400),450); },0.9); }
    // stepping stones from the door to the rotunda, flowers and grass, a fairy ring
    for(let z=26.2;z>11.6;z-=0.75){ if(z>17.4&&z<20.6) continue; const s=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.34,0.06,8),flat(0x9a988a)); s.position.set(11.5+(hsh(z*4|0,3)-0.5)*0.35,0.02,z); s.rotation.y=hsh(3,z*4|0); room.add(s); }
    const fl=[], gr=[]; for(let y=1;y<G.H-1;y++) for(let x=1;x<G.W-1;x++){ if(GR[y][x]!==0||Math.abs(x-11)<=1) continue; const n=hsh(x*5,y*3); if(n<0.55) for(let k=0;k<1+(n*5|0);k++) fl.push([x+hsh(k,x*y)*0.9+0.05,y+hsh(x*y,k)*0.9+0.05,(x*7+y*3+k)%5]); for(let k=0;k<3;k++) gr.push([x+hsh(k+5,x)*0.9,y+hsh(y,k+5)*0.9]); }
    const FC=[0xffb0c8,0xfff4f0,0xffe066,0x9ab8ff,0xd8a0ff]; inst(fl,new THREE.SphereGeometry(0.055,5,4),new THREE.MeshLambertMaterial(),([x,z,c],m,cc)=>{ m.makeScale(1,0.7,1); m.setPosition(x,0.12,z); cc.setHex(FC[c]); },room);
    inst(fl,new THREE.CylinderGeometry(0.008,0.008,0.12,3),lam(0x3a7a2e),([x,z],m)=>{ m.makeTranslation(x,0.06,z); },room,true);
    inst(gr,new THREE.ConeGeometry(0.05,0.24,3),new THREE.MeshLambertMaterial(),([x,z],m,cc)=>{ m.makeTranslation(x,0.12,z); cc.setHex(0x4a8a3a).offsetHSL(0,0,(hsh(x*9|0,z*9|0)-0.5)*0.1); },room);
    for(let i=0;i<12;i++){ const a=i/12*6.3, x=17.5+Math.cos(a)*1.3, z=12.0+Math.sin(a)*1.3; Cy(0.02,0.03,0.14,5,0xf4ecd8,x,0,z,room); const cp=Sp(0.07,i%3?0xd03a2a:0xe8a03a,x,0.15,z,room,7,5); cp.scale.y=0.55; Sp(0.012,0xffffff,x+0.03,0.18,z,room,4,3); }
    const ringG=disc0(room,1.6,0xc8ffb8,0.1); ringG.position.set(17.5,0.03,12.0); an.push(t=>{ ringG.material.opacity=0.06+0.06*Math.sin(t*1.3); });
    // light through the canopy, and motes drifting in it
    for(let i=0;i<5;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.5,1.4,9,10,1,true),new THREE.MeshBasicMaterial({color:0xfff6c8,transparent:true,opacity:0.08,depthWrite:false,side:THREE.DoubleSide})); b.position.set([11.5,4,17,7,15][i],4.5,[7.5,13,9,22,25][i]); room.add(b); an.push(t=>{ b.material.opacity=0.05+0.03*Math.sin(t*0.6+i); }); }
    { const N=40, pp=new Float32Array(N*3), pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pp,3)); const pm=new THREE.PointsMaterial({color:0xfff8c0,size:0.07,transparent:true,opacity:0.85,depthWrite:false}); room.add(new THREE.Points(pg,pm));
      const base=[]; for(let i=0;i<N;i++) base.push([2+hsh(i,11)*19,0.4+hsh(11,i)*2.4,2+hsh(i,13)*25]); an.push(t=>{ for(let i=0;i<N;i++){ const b=base[i]; pp[i*3]=b[0]+Math.sin(t*0.3+i)*0.6; pp[i*3+1]=b[1]+Math.sin(t*0.5+i*2)*0.3; pp[i*3+2]=b[2]+Math.cos(t*0.27+i)*0.6; } pg.attributes.position.needsUpdate=true; pm.opacity=0.6+0.25*Math.sin(t*1.5); }); }
    // the creatures
    CRIT.deer(room,an,6.5,13.5,0.8,false); CRIT.deer(room,an,17.0,15.2,-2.2,true); CRIT.deer(room,an,5.0,24.5,2.6,false);
    [[4.5,22],[15,25],[7.5,10.5],[19,13],[3,15]].forEach(([x,z])=>CRIT.rabbit(room,an,x,z));
    CRIT.swan(room,an,17.4,19.5,1.6,0); CRIT.swan(room,an,17.4,19.5,1.6,0.6);
    [[11.5,7.5,4.6,3.6,0,0x3a6ab8],[11.5,7.5,5.2,4.0,3,0xc85a3a],[8,18,6,3.2,1,0xe8c04a]].forEach(([x,z,r,h,p,c])=>CRIT.bird(room,an,x,z,r,h,p,c));
    [[6,9,0xffa8d8],[16,10,0xfff07a],[4,20,0x9ad0ff],[18,24,0xffffff],[8,26,0xffb060],[14,13,0xd8a0ff],[3,11,0xfff07a],[20,9,0xffa8d8]].forEach(([x,z,c],i)=>CRIT.fly(room,an,x,z,c,i*1.7));
    if(typeof GREEK!=='undefined') GREEK.place(lv,room,an,6.5,10.5,'john1_14');
    if(typeof JOURNAL!=='undefined') JOURNAL.spot(lv,5.6,7.9,Math.atan2(4.5-5.6,6.5-7.9),'Eldan’s Glade','under the great tree in Eldan’s glade, with the water running by,');   // a leaf of John on a lectern under the great tree
    lv.spawn=arrival(GR,8); lv.banner='Through the temple door… a hidden glade. Water sings over the stones; Eldan waits in the old rotunda.'; return lv; }});
  let sageIntro=0;
  const SAGE_INTRO=['"Ah... a knight walks the old wood. Few find my glade — fewer still by accident. Sit; the trees are patient."',
    '"In time I can teach you to raise more than one companion — when a steed has grown to its fullness, send it home to the barn with honor and raise another at your side."'];
  function sageTalk(){ const q=Q(), inv=S().inventory, sage=l=>say('Eldan the Sage',l);
    if(q.goldenFish==='unstarted'){ if(sageIntro<SAGE_INTRO.length){ sage(SAGE_INTRO[sageIntro++]); return; } q.goldenFish='active'; GAME.save();
      sage('"But wisdom is not bought with gold — only deeds. Here is your first trial: catch the Golden Fish that hides in the quiet waters of the realm. Cast your line in pond, sea, or oasis... patience will reward you. Bring it to me." 🎣'); return; }
    if(q.goldenFish==='active'){ if(inv.goldenFish>0){ q.goldenFish='done'; inv.goldenFish=0; eldanGift(1); GAME.save(); sage('"The Golden Fish! It shimmers like a promise kept. You have the patience of the old saints, knight. 🌟 The first trial is done — return to me again, and we shall speak of your reward."'); return; }
      sage('"The Golden Fish still hides, knight. Cast your line in the quiet waters — pond, sea, or oasis. It comes to those who wait." 🎣'); return; }
    if(q.kindness==='unstarted'){ q.kindness='active'; if((inv.sacredScroll||0)<1) inv.sacredScroll=1; GAME.save();
      sage(['"Now the second trial — the harder one, for it asks your time, not your blade. Take this sacred scroll 📜, and grow provisions from the earth — wheat, three measures."','"Carry them to one the world forgot — north of Hellgate, in the deep wood. A door of stone, an old flame waiting."']); return; }
    if(q.kindness==='active'){ const food=(inv.wheat||0)>=3, scroll=(inv.sacredScroll||0)>=1;
      sage(food&&scroll?'"You have the scroll and the grain. Now find him, knight — north of Hellgate, in the deep wood. A door of stone, an old flame waiting." 🕯️':'"Bring the sacred scroll 📜 and three measures of wheat 🌾 to the forgotten one in the wood north of Hellgate. Grow the grain from tilled earth; the scroll you already carry."'); return; }
    sage('"You have done well, knight — the fish caught, kindness carried. Rest a moment in the green hush. Your reward will come when next we speak." 🌿'); }

  // ── the old monk's cave, behind the hollow north of Hellgate ──
  // a narrow way in (two demons have crept into it) that opens on a cavern: a still pool lit from beneath, crystals glowing in the
  // rock, glow-worms on the roof, and in the far corner the hermitage — a hearth, a cot, a shelf of scrolls, a cross cut in the stone
  //   40 the pool · 45 crystal · 46 the scroll shelf · 47 the shrine · 17 hearth · 26 cot · 9 the monk
  D.cave=(()=>{ const K={'#':1,'.':0,E:8,D:6,w:40,c:45,S:46,X:47,F:17,B:26,M:9};
    return ['###################','######c...c########','####..........c####','###c..www........##','###..wwwww....S..##','##...wwwww...F.M.X#','##c...www.........#','###.......B....c.##','####..........#####','######.....########','#######..D.########','########.#.########','########...D.######','############.######','###########..######','###########E#######'].map(r=>[...r].map(c=>K[c])); })();
  ENGINE.add({id:'monkcave',lazy:()=>{ const C=gridLevel({ id:'monkcave', name:'A Hidden Cave', grid:D.cave, bg:0x0e0c14, fog:[6,16], close:true, cam:{dist:3.9,min:2,max:6,pitch:0.4,lookH:0.2}, hemi:0.4, lamp:1.0, walls:'rock', wall:0x4a4452, fA:0x3a3640, fB:0x34303a, solid:new Set([1,5,9,17,26,40,45,46,47]), fight:true, zone:'Cold stone, still water, and the far glow of a fire',
      floorCol:t=>t===40?0x0e2a3a:null,
      onDeath:()=>{ ENGINE.go(spec.caveExit.level,spec.caveExit.spawn); setTimeout(()=>UI.toast('💫 You fall… and wake outside the cave.',2000),450); } });
    const {lv,room,an,spot}=C, CG=D.cave, fl=[];
    for(let y=0;y<C.H;y++) for(let x=0;x<C.W;x++){ const t=CG[y][x]; if(t!==1) fl.push([x,y]);
      if(t===26){ PROP.bed(room,x+0.5,y+0.5,0.95,ROOM_PALS.home,0x6a5a4a); B(0.5,0.08,0.3,0xe8e0cc,x+0.5,0.42,y+0.1,room); }
      if(t===17){ const g=group(x+0.5,0,y+0.5,room); for(let i=0;i<8;i++){ const a=i/8*6.3; Sp(0.1,0x5a5462,Math.cos(a)*0.36,0.06,Math.sin(a)*0.36,g,5,4); } fire(g,an,0,0.05,0,1.1);
        [0,2.1,4.2].forEach(a=>{ const l=Cy(0.02,0.02,1.0,4,0x3a2a1a,Math.cos(a)*0.3,0,Math.sin(a)*0.3,g); l.rotation.set(Math.sin(a)*0.3,0,-Math.cos(a)*0.3); }); Sp(0.16,0x2a2622,0,0.62,0,g,8,6).scale.y=0.8;
        const l=new THREE.PointLight(0xffa050,1.1,7,1.5); l.position.set(0,1,0); g.add(l); an.push(t=>{ l.intensity=1.0+Math.sin(t*11)*0.08+Math.sin(t*7.3)*0.06; });
        for(let i=0;i<4;i++){ B(0.02,0.4,0.02,0x5a4a3a,-0.3+i*0.2,2.3,-0.4,g); Sp(0.08,i%2?0x6a8a4a:0x8a7a3a,-0.3+i*0.2,2.25,-0.4,g,5,4).scale.y=1.6; } }
      if(t===9){ const f=addPerson(lv,room,'monk',x+0.5,y+0.5,0,'The Old Monk',null,{rest:-Math.PI/2}); f.action=()=>monkTalk(); f.label='Talk'; f.reach=0.6; }
      if(t===46){ const g=group(x+0.5,0,y+0.5,room); B(0.9,1.6,0.4,0x5a4030,0,0,-0.25,g); for(let k=0;k<3;k++){ B(0.86,0.04,0.38,0x6a4c34,0,0.4+k*0.5,-0.25,g);
          for(let j=0;j<5;j++){ const sc=Cy(0.045,0.045,0.3,6,j%2?0xe8dcc0:0xd8c8a0,-0.32+j*0.16,0.44+k*0.5,-0.2,g); sc.rotation.x=Math.PI/2; } } }
      if(t===47){ const g=group(x+0.5,0,y+0.5,room); B(0.5,1.9,0.9,0x4a4452,0.25,0,0,g); B(0.04,0.9,0.08,0xd8d0b8,-0.03,0.7,0,g); B(0.04,0.08,0.5,0xd8d0b8,-0.03,1.25,0,g);
          [[0.3,0],[-0.25,1],[0.05,2]].forEach(([dz,i])=>{ Cy(0.03,0.03,0.12+i*0.05,6,0xf4ecd8,-0.28,0,dz,g); flame(-0.28,0.18+i*0.05,dz,g,an,1); });
          const m=new THREE.Mesh(new THREE.PlaneGeometry(0.6,1.0),lam(0x6a2a2a)); m.rotation.x=-Math.PI/2; m.position.set(x-0.5,0.02,y+0.5); room.add(m);
          const cl=new THREE.PointLight(0xffd8a0,0.5,4,1.6); cl.position.set(x-0.2,1.0,y+0.5); room.add(cl); }
      if(t===45){ const g=group(x+0.5,0,y+0.5,room); for(let k=0;k<6;k++){ const c=new THREE.Mesh(new THREE.ConeGeometry(0.08+hsh(k,x)*0.06,0.5+hsh(y,k)*0.6,4),glow(k%2?0x8ae0ff:0xb8a0ff)); c.position.set((hsh(k,y)-0.5)*0.6,0.25+hsh(k,y)*0.2,(hsh(x,k)-0.5)*0.6); c.rotation.set((hsh(k,1)-0.5)*0.8,0,(hsh(1,k)-0.5)*0.8); g.add(c); }
        const d=disc0(g,0.7,0x8ae0ff,0.12); an.push(t=>{ d.material.opacity=0.08+0.06*Math.sin(t*1.1+x); }); } }
    // two crystals cast real light; the pool glows from beneath
    [[6,1],[15,7]].forEach(([x,y])=>{ const l=new THREE.PointLight(0x9ac8ff,0.6,5,1.6); l.position.set(x+0.5,1.0,y+0.5); room.add(l); });
    const wt=fl.filter(([x,y])=>CG[y][x]===40), wm=new THREE.MeshPhongMaterial({color:0x3a9ac8,emissive:0x0a3a5a,transparent:true,opacity:0.8,shininess:100,specular:0xffffff,depthWrite:false});
    inst(wt,UNIT,wm,([x,y],m)=>{ m.makeScale(1,0.02,1); m.setPosition(x+0.5,0.03,y+0.5); },room,true); an.push(t=>{ wm.emissive.setHSL(0.56,0.8,0.12+0.04*Math.sin(t*0.8)); });
    const pl=new THREE.PointLight(0x4ac8ff,0.9,7,1.5); pl.position.set(7.5,0.4,4.5); room.add(pl);
    // stalactites, and one that drips into the pool
    fl.forEach(([x,y])=>{ if(hsh(x*3,y*5)>0.3) return; const l=0.25+hsh(y,x*2)*0.55, c=Co(0.08+hsh(x,y)*0.08,l,5,0x5a5462,x+0.5+(hsh(x,9)-0.5)*0.5,2.75-l,y+0.5+(hsh(9,y)-0.5)*0.5,room); c.rotation.x=Math.PI; c.position.y=2.75-l/2; });
    { const drop=Sp(0.025,0xc8f0ff,7.5,2.4,4.5,room,5,4), rg=new THREE.Mesh(new THREE.RingGeometry(0.06,0.09,18),new THREE.MeshBasicMaterial({color:0xe8f8ff,transparent:true,opacity:0,depthWrite:false})); rg.rotation.x=-Math.PI/2; rg.position.set(7.5,0.05,4.5); room.add(rg);
      Co(0.1,0.5,5,0x5a5462,7.5,2.25,4.5,room).rotation.x=Math.PI;
      an.push(t=>{ const c=(t*0.6)%1; drop.position.y=2.35-Math.min(1,c*1.6)**2*2.3; drop.visible=c<0.62; const r=Math.max(0,(c-0.62)/0.38); rg.scale.setScalar(1+r*6); rg.material.opacity=r>0?0.5*(1-r):0; }); }
    // glow-worms on the roof
    { const pts=fl.filter(([x,y])=>hsh(y*7,x)<0.6&&y<10), N=pts.length*2, pp=new Float32Array(N*3); for(let i=0;i<N;i++){ const [x,y]=pts[i>>1]; pp[i*3]=x+hsh(i,3); pp[i*3+1]=2.62+hsh(3,i)*0.1; pp[i*3+2]=y+hsh(i,8); }
      const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pp,3)); const pm=new THREE.PointsMaterial({color:0x9affe0,size:0.06,transparent:true,opacity:0.9,depthWrite:false}); room.add(new THREE.Points(pg,pm)); an.push(t=>{ pm.opacity=0.6+0.3*Math.sin(t*0.9); }); }
    // glowing mushrooms along the way in, so it is not pitch black
    fl.forEach(([x,y])=>{ if(y<9||CG[y][x]!==0||hsh(x*11,y)>0.45) return; for(let k=0;k<3;k++){ const mx=x+0.15+hsh(k,x)*0.7, mz=y+0.15+hsh(y,k)*0.7; Cy(0.012,0.015,0.08,4,0xd8e8e0,mx,0,mz,room); Sp(0.04,glow(0x7affc8),mx,0.09,mz,room,5,4).scale.y=0.5; } });
    const e=find(CG,8); if(e) spot(e[0],e[1],'Leave','The way out',()=>ENGINE.go(spec.caveExit.level,spec.caveExit.spawn),0.9);
    if(typeof GREEK!=='undefined') GREEK.place(lv,room,an,13.5,4.5,'john3_16',{r:0.9});   // the old monk's treasured scroll, by his shelf
    lv.spawn=arrival(CG,8); lv.banner='A hidden cave. A narrow way, then still water and the far glow of a fire. Someone dwells deep within…'; return lv; }});
  function monkTalk(){ const q=Q(), inv=S().inventory, monk=l=>say('The Old Monk',l);
    if(q.kindness==='done'){ monk('"You are the one who came. The bread is long eaten, the scroll read by firelight — but the kindness stays warm. Go with God, knight." 🕯️'); return; }
    if(q.kindness==='active'){ const scroll=(inv.sacredScroll||0)>=1, food=(inv.wheat||0)>=3;
      if(scroll&&food){ inv.sacredScroll=0; inv.wheat-=3; q.kindness='done'; eldanGift(2); GAME.save();
        monk(['"...A scroll? And bread, warm from the world above? For me?"','The old monk\'s eyes shine. "I had begun to believe I was forgotten. You have carried more than provisions, knight — you have carried kindness into the dark. Bless you. Return to the sage."']); return; }
      if(!scroll&&!food) monk('"A traveler... have you something for an old hermit? Eldan\'s scroll, perhaps, and a little bread? My friends used to bring both."');
      else if(!food) monk('"You carry the sage\'s scroll, I see it. But an old man cannot live on words — have you any bread? Three measures of wheat would see me through the winter." 🌾');
      else monk('"Bread! Bless you... but where is Eldan\'s scroll? He always sent word with those who came. Bring it, and I will know you are truly his." 📜'); return; }
    monk('"Oh... a visitor? It has been so long. I keep the fire lit for friends who went to the citadel and never came back. Sit a while, knight — the road outside is dark."'); }

  // ── Robby's hole in the Thornwood ──
  ENGINE.add({id:'robbycave',lazy:()=>{ const fl=D.robby.floors[0];
    const back=()=>{ const r=run.robbyFrom; ENGINE.go('forest',r?{x:r.x,z:r.z,face:r.face+Math.PI}:null); setTimeout(()=>UI.toast('🌲 Out of the tree, into the wood again.',1100),450); };
    // the card table's four chairs are set round it by hand (the grid's chairs sat square to the corners and faced the wall)
    const g2=fl.g.map(r=>r.slice()); let tc=null; g2.forEach((r,y)=>r.forEach((t,x)=>{ if(t===73&&!tc) tc={x:x+1,z:y+1}; }));
    if(tc) g2.forEach((r,y)=>r.forEach((t,x)=>{ if(t===41&&Math.hypot(x+0.5-tc.x,y+0.5-tc.z)<2.2) r[x]=12; }));
    const pal={wall:0x6a5a48,wallD:0x4a3a2a,floorA:0x5a4632,floorB:0x54402e,cloth:0x6a2a3a,accent:0x3a4a6a,trim:0xc8a050};
    const lv=gridRoom({id:'robbycave',name:D.robby.name,theme:'home',pal,grid:g2,npcs:[],floor:0,exit:{level:'forest'},zone:'There is a television on'});
    const seats=[];
    if(tc){ const BL=lv._blk=lv._blk||[]; [[0,-1],[-1,0],[0,1],[1,0]].forEach(([dx,dz])=>{ const x=tc.x+dx*1.3, z=tc.z+dz*1.3, f=Math.atan2(-dx,-dz); PROP.chair(lv.room,x,z,f,pal); BL.push({x,z,r:0.3}); seats.push({x,z,f,dx,dz}); });
      if(!lv._blkWrapped){ lv._blkWrapped=true; const cm=lv.canMove; lv.canMove=(fx,fz,tx,tz)=>{ if(!cm(fx,fz,tx,tz)) return false; for(const b of BL){ const d=Math.hypot(tx-b.x,tz-b.z); if(d<b.r+0.2&&d<=Math.hypot(fx-b.x,fz-b.z)) return false; } return true; }; } }
    lv.spots.forEach(s=>{ if(s.label==='Leave') s.action=back; });
    D.robby.npcs.forEach((n,i)=>{ const look=n.robby?'woodcutter':n.cheyenne?'peasantF':'child'; let k=-1;
      const st=tc?seats[i]:null, px=st?st.x+st.dx*0.55:n.x+0.5, pz=st?st.z+st.dz*0.55:n.y+0.5;   // each stands at his own chair: Robby across from you, Cheyenne and Benji either side
      const f=addPerson(lv,lv.room,look,px,pz,0,n.name,null,{rest:st?st.f:0}); f.label='Talk';
      f.action=n.robby?()=>robbyTalk():()=>{ k=(k+1)%n.lines.length; say(n.name,[n.lines[k]]); }; });
    for(let y=0;y<fl.g.length;y++) for(let x=0;x<fl.g[0].length;x++){ const t=fl.g[y][x];
      if(t===71) lv.spots.push({x:x+0.5,z:y+0.9,r:1.0,label:'Play',who:'The console',action:()=>blockfall()}); }
    // your seat, the empty one: take it and Robby deals you in
    if(tc){ const me=seats[3]; lv.spots.push({x:me.x+0.6,z:me.z,r:1.1,label:'Play cards',who:'The card table — the empty chair',action:()=>{ const P=ENGINE.P; P.x=me.x; P.z=me.z; P.face=me.f; ENGINE.hold(0.4,'sit'); setTimeout(()=>blackjack(),250); }}); }
    return lv; }});
  const fishCount=()=>['perch','trout','oasisCarp','seabass','kingfish','goldenFish'].reduce((n,k)=>n+(S().inventory[k]||0),0);
  function robbyTalk(){ const s=S(), inv=s.inventory, P=D.price;
    if(s.robbysDemise){ say('Robby',['Oh. It’s you.','How’s the armour treating you? Nobody talks to you now, do they.','…yeah. That’s the demise part.']); return; }
    const g=s.gold|0, f=fishCount(), b=inv.bread||0;
    if(g>=P.gold&&f>=P.fish&&b>=P.bread){ GAME.addGold(-P.gold); inv.bread-=P.bread; let need=P.fish;
      for(const k of ['perch','trout','seabass','oasisCarp','kingfish','goldenFish']) while(need>0&&(inv[k]||0)>0){ inv[k]--; need--; }
      s.robbysDemise=true; if(!s.robbyShown){ s.robbyShown=true; s.livery='robby'; } GAME.changed(); GAME.save();
      say('Robby',['Ten grand, five fish and two loaves. You actually did it.','Take it. I wore it for a while. It’s… quiet, in there.','Nobody looks at you. Nothing stops you. You go where you like and it stops mattering where.','🃏 Robby’s Demise is yours. Wear it from the Home tab. Take it off whenever you’ve had enough.']); return; }
    say('Robby',['Don’t touch the poker table.','You want the armour? Everyone wants the armour.',`${P.gold.toLocaleString()} gold, ${P.fish} fish and ${P.bread} loaves. That’s the price. It was the price when I bought it too.`,`You’ve got ${g.toLocaleString()} gold, ${f} fish and ${b} bread.`]); }

  // ── ♠ the card table: Robby deals, Cheyenne plays her own hand well, Benji is two ──
  const bj={phase:'bet',deck:[],you:[],dealer:[],chey:[],benji:[],bet:0,msg:''};
  const deck=()=>{ const d=[]; for(let s=0;s<4;s++) for(let r=1;r<=13;r++) d.push({r,s}); for(let i=d.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [d[i],d[j]]=[d[j],d[i]]; } return d; };
  const val=h=>{ let t=0,a=0; for(const c of h){ t+=c.r===1?11:Math.min(10,c.r); if(c.r===1) a++; } while(t>21&&a>0){ t-=10; a--; } return t; }, bust=h=>val(h)>21;
  const card=c=>`<span style="display:inline-block;min-width:26px;padding:3px 4px;margin:2px;border:1px solid #888;border-radius:4px;background:#f4f1e8;color:${c.s===1||c.s===2?'#b0141c':'#1a1a1a'};font-weight:700">${({1:'A',11:'J',12:'Q',13:'K'})[c.r]||c.r}${['♠','♥','♦','♣'][c.s]}</span>`;
  const hidden='<span style="display:inline-block;min-width:26px;padding:3px 4px;margin:2px;border:1px solid #444;border-radius:4px;background:#1b2436;color:#5a6a86">?</span>';
  function settle(){ bj.phase='done'; while(val(bj.chey)<17) bj.chey.push(bj.deck.pop()); while(val(bj.benji)<19&&Math.random()<0.8) bj.benji.push(bj.deck.pop());
    if(!bust(bj.you)||!bust(bj.chey)) while(val(bj.dealer)<17) bj.dealer.push(bj.deck.pop());
    const y=val(bj.you), d=val(bj.dealer); let won=0, line='';
    if(bust(bj.you)) line='Bust. Robby takes it without looking up.';
    else if(y===21&&bj.you.length===2&&!(d===21&&bj.dealer.length===2)){ won=Math.round(bj.bet*2.5); line='Blackjack. “Huh,” says Robby.'; }
    else if(bust(bj.dealer)){ won=bj.bet*2; line='Robby busts. Cheyenne laughs at him.'; } else if(y>d){ won=bj.bet*2; line='You take it.'; } else if(y===d){ won=bj.bet; line='Push. Nobody moves.'; } else line='Robby takes it.';
    if(won) GAME.addGold(won); bj.msg=line+(won?` +${won} gold`:''); GAME.save(); render(); }
  function render(){ const seat=(who,h,hide,note)=>`<div style="margin:6px 0"><div class="ds">${who}${note?' · '+note:''}</div><div>${h.map((c,i)=>hide&&i===1?hidden:card(c)).join('')} <span class="ds">${hide?'':val(h)}${!hide&&bust(h)?' BUST':''}</span></div></div>`;
    let h=''; if(bj.phase==='bet') h=`<p class="gm-intro">Robby shuffles without looking at the cards. Cheyenne is already in. Benji is dealt in because he screams otherwise.</p><p class="gm-hint">You have <b>${(S().gold|0).toLocaleString()}</b> gold.</p>`
      +D.bets.map(b=>`<button class="gm-item" data-act="bet:${b}"><span>Bet ${b}</span></button>`).join('')+`<button class="gm-item" data-act="leave"><span class="ds">Leave the table</span></button>`;
    else { h=seat('Robby (dealer)',bj.dealer,bj.phase==='play')+seat('You',bj.you,false)+seat('Cheyenne',bj.chey,bj.phase==='play')+seat('Benji',bj.benji,bj.phase==='play',bj.phase!=='play'?'two years old':'')+(bj.msg?`<p class="gm-q"><b>${UI.esc(bj.msg)}</b></p>`:'');
      h+=bj.phase==='play'?`<button class="gm-btn" data-act="hit">Hit</button><button class="gm-btn" data-act="stand">Stand</button>`:`<button class="gm-btn" data-act="again">Deal again</button><button class="gm-btn" data-act="leave">Leave the table</button>`; }
    UI.sheet({title:'♠ The Card Table',html:h,keepScroll:true,act:a=>{ if(a==='leave'){ UI.close(); return; }
      if(a.startsWith('bet:')){ const b=+a.slice(4); if((S().gold|0)<b){ bj.msg='You haven’t got it.'; UI.toast('You haven’t got it.',1200); return; } GAME.addGold(-b); bj.bet=b; if(bj.deck.length<20) bj.deck=deck();
        bj.you=[bj.deck.pop(),bj.deck.pop()]; bj.chey=[bj.deck.pop(),bj.deck.pop()]; bj.benji=[bj.deck.pop(),bj.deck.pop()]; bj.dealer=[bj.deck.pop(),bj.deck.pop()]; bj.phase='play'; bj.msg=''; if(val(bj.you)===21) settle(); else render(); }
      else if(a==='hit'){ bj.you.push(bj.deck.pop()); if(bust(bj.you)||val(bj.you)===21) settle(); else render(); } else if(a==='stand') settle(); else if(a==='again'){ bj.phase='bet'; bj.msg=''; render(); } }}); }
  function blackjack(){ bj.phase='bet'; bj.msg=''; bj.deck=deck(); render(); }

  // ── ▦ Blockfall, on Robby's console: a coin a game, score/100 back in gold ──
  function blockfall(){ const B0=D.bf, S0=S(); if((S0.gold|0)<B0.cost){ say('Robby',['It takes a coin.','I know. I built the slot myself. Don’t look at me like that.']); return; }
    GAME.addGold(-B0.cost); GAME.save();
    const W=B0.W, H=B0.H, SH=B0.shapes, st={grid:Array.from({length:H},()=>Array(W).fill(null)),piece:0,rot:0,px:3,py:-1,next:Math.random()*SH.length|0,tick:0,speed:36,lines:0,score:0,over:false,lockT:0,won:0};
    const cells=(p,r,ox,oy)=>SH[p].r[r%SH[p].r.length].map(([x,y])=>[x+ox,y+oy]);
    const fits=(p,r,ox,oy)=>cells(p,r,ox,oy).every(([x,y])=>x>=0&&x<W&&y<H&&!(y>=0&&st.grid[y][x]));
    const spawn=()=>{ st.piece=st.next; st.next=Math.random()*SH.length|0; st.rot=0; st.px=3; st.py=-1; if(!fits(st.piece,0,st.px,st.py)){ st.over=true; payout(); } };
    const payout=()=>{ if(st.paid) return; st.paid=true; st.won=Math.floor(st.score/B0.perPoint); if(st.won>0){ GAME.addGold(st.won); GAME.save(); } };
    const lock=()=>{ cells(st.piece,st.rot,st.px,st.py).forEach(([x,y])=>{ if(y>=0&&y<H) st.grid[y][x]=SH[st.piece].c; }); let c=0;
      for(let y=H-1;y>=0;y--) if(st.grid[y].every(v=>v)){ st.grid.splice(y,1); st.grid.unshift(Array(W).fill(null)); c++; y++; }
      if(c){ st.lines+=c; st.score+=[0,40,100,300,1200][c]*(1+Math.floor(st.lines/10)); st.speed=Math.max(6,36-Math.floor(st.lines/4)*3); } spawn(); };
    const step=()=>{ if(st.over) return; if(!fits(st.piece,st.rot,st.px,st.py+1)){ if(++st.lockT>=B0.lock){ st.lockT=0; lock(); } return; } st.lockT=0; if(++st.tick<st.speed) return; st.tick=0; st.py++; };
    const move=d=>{ if(st.over) return; if(d==='l'&&fits(st.piece,st.rot,st.px-1,st.py)){ st.px--; st.lockT=0; } if(d==='r'&&fits(st.piece,st.rot,st.px+1,st.py)){ st.px++; st.lockT=0; }
      if(d==='d'&&fits(st.piece,st.rot,st.px,st.py+1)){ st.py++; st.tick=0; st.score++; }
      if(d==='t'){ const n=(st.rot+1)%SH[st.piece].r.length; if(fits(st.piece,n,st.px,st.py)) st.rot=n; else if(fits(st.piece,n,st.px-1,st.py)){ st.rot=n; st.px--; } else if(fits(st.piece,n,st.px+1,st.py)){ st.rot=n; st.px++; } } };
    spawn(); let live=true, acc=0, last=performance.now();
    UI.sheet({title:'▦ Blockfall',wide:true,html:`<div style="display:flex;gap:12px;justify-content:center;align-items:flex-start"><canvas id="bfC" width="200" height="360" style="background:#0a0810;border:1px solid #2c2740;border-radius:4px;max-height:58vh;width:auto"></canvas>
      <div style="font:700 13px var(--f-mono);color:#c8bfa0;line-height:1.7">LINES<br><b id="bfL" style="color:#e8dcbb">0</b><br>SCORE<br><b id="bfS" style="color:#e8dcbb">0</b><br>NEXT<br><canvas id="bfN" width="48" height="36"></canvas><br><span class="ds">1 gold a game · score ÷ ${B0.perPoint} back</span></div></div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">${[['l','◀'],['t','⟳'],['d','▼'],['r','▶']].map(([k,l])=>`<button class="gm-btn" data-act="${k}" style="min-width:58px;font-size:18px">${l}</button>`).join('')}</div><p class="gm-hint" id="bfMsg" style="text-align:center">Arrows or the buttons. ↑ / Space turns the piece.</p>`,
      act:a=>{ if(a==='again'){ UI.close(); setTimeout(blockfall,50); return; } move(a); },
      close:()=>{ live=false; if(!st.over){ st.over=true; payout(); if(st.won) UI.toast(`Blockfall pays ${st.won} gold`,1600); } removeEventListener('keydown',key); }});
    const key=e=>{ const k=e.key; const m={ArrowLeft:'l',ArrowRight:'r',ArrowDown:'d',ArrowUp:'t',' ':'t',dodge:'t'}[k]; if(m){ move(m); e.preventDefault(); e.stopPropagation(); } }; addEventListener('keydown',key,true);
    const cv=$('bfC'), cx=cv.getContext('2d'), nv=$('bfN').getContext('2d'), cw=20;
    function draw(){ cx.fillStyle='#0a0810'; cx.fillRect(0,0,200,360);
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const c=st.grid[y][x]; if(c){ cx.fillStyle=c; cx.fillRect(x*cw,y*cw,cw-1,cw-1); cx.fillStyle='rgba(255,255,255,.22)'; cx.fillRect(x*cw,y*cw,cw-1,2); } else if((x+y)%2===0){ cx.fillStyle='rgba(255,255,255,.02)'; cx.fillRect(x*cw,y*cw,cw,cw); } }
      if(!st.over){ let gy=st.py; while(fits(st.piece,st.rot,st.px,gy+1)) gy++; cx.strokeStyle='rgba(255,255,255,.2)'; cells(st.piece,st.rot,st.px,gy).forEach(([x,y])=>{ if(y>=0) cx.strokeRect(x*cw+0.5,y*cw+0.5,cw-2,cw-2); });
        cx.fillStyle=SH[st.piece].c; cells(st.piece,st.rot,st.px,st.py).forEach(([x,y])=>{ if(y>=0) cx.fillRect(x*cw,y*cw,cw-1,cw-1); }); }
      nv.clearRect(0,0,48,36); nv.fillStyle=SH[st.next].c; SH[st.next].r[0].forEach(([x,y])=>nv.fillRect(4+x*10,4+y*10,9,9));
      $('bfL').textContent=st.lines; $('bfS').textContent=st.score;
      if(st.over){ cx.fillStyle='rgba(6,4,10,.82)'; cx.fillRect(0,0,200,360); cx.fillStyle='#e8dcbb'; cx.font='bold 15px monospace'; cx.textAlign='center'; cx.fillText('THE WELL IS FULL',100,160);
        cx.font='12px monospace'; cx.fillText(`${st.lines} lines · ${st.score} points`,100,184); cx.fillText(st.won>0?`Pays ${st.won} gold`:'No payout. That coin is gone.',100,204); cx.textAlign='left';
        const m=$('bfMsg'); if(m&&!m.dataset.done){ m.dataset.done=1; m.innerHTML=`<button class="gm-btn" data-act="again">Play again (1 gold)</button>`; } } }
    (function loop(now){ if(!live) return; acc=Math.min(acc+(now-last)/1000,0.1); last=now; while(acc>=1/60){ acc-=1/60; step(); } draw(); requestAnimationFrame(loop); })(performance.now());
  }

  return { enter(mouth){ run.mouth=mouth; run.cleared={}; GAME.save(); ENGINE.go('forest',SPAWN[mouth]||SPAWN.north); setTimeout(()=>UI.toast('🌫️ The Forest of Disillusionment — a cold fog drinks the light. You can see only a few paces.',2800),450); },
    enterCave(){ ENGINE.go('monkcave'); },
    gate(lv,x,z,rot,title,sub,col){ const g=gate(lv.scene,lv.anim,x,z,rot,title,sub,col,{noRoad:true,noLight:true}); g.position.y=lv.ground?lv.ground(x,z):0; g.scale.setScalar(0.85); return g; } };
}
