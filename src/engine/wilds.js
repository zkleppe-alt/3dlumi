// ════════════════════════════════════════════════════════════════
//  WILDS (V175) — the open country gets its high ground, its rivers to cross, and the things you can only reach with what
//  the generals gave you.
//   · HEIGHTS: five plateaus standing up out of the meadow on cliffs of grey rock. You can never walk up a cliff — but
//     you can always jump down one (a short cut home). Each has its own way up: a cliff path cut along its side, a
//     ladder, a face of old vines, or (one) only Lydia's rope cast over a pulley at the lip. A chest on every top, and a
//     bench or a verse to sit with.
//   · RIVERS (tools/stretch.py lays the water): bridges where the roads cross; fords you wade (slowly) and stepping-stones
//     you don't; one ford drowned until the Tide Bell is rung on its bank; an islet in the North Water you reach with the
//     Shepherd's crook, swinging across on iron rings.
//   · WAYSIDE SHRINES: five little roofless chapels of the pilgrims' road, each in its own country, each with its door
//     stopped — a cracked boulder (the Hammer), a slab that opens to sunlight (the Sun Mirror), thorns (Deborah's
//     Lantern), a bank of ash (Gideon's Horn), storm-stones crackling across the door (Ruth's Shield). Inside, a chest
//     and a verse.
//  WILDS.shape(o) — called from the world's land-builder before the grade is set: raises the plateaus and their paths
//  WILDS.attach(world) — builds it all into the realm, and wraps the world's ground, canMove and speed
//  State: GAME.S.wilds = {chests:{}, open:{}, roped:{}}
// ════════════════════════════════════════════════════════════════
const WILDS=(function(){
  const PLATS=[
    {id:'p_height',name:'Shepherd’s Height',x:62,y:82,r:5,h:3.6,up:'path',a0:-1.05,sense:-1,
      verse:['A bench at the top, worn smooth','From up here you can see Hearthvale’s smoke, and Ironhold’s, and the road between them like a thread.','“I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD.” — Psalm 121:1–2'],
      chest:{gold:160,pot:['potion',2]}},
    {id:'p_ladder',name:'the Watchers’ Rock',x:88,y:65,r:5,h:4.2,up:'ladder',a0:1.9,
      verse:['A watch-post, long empty','Someone kept a fire here once, to see the dark coming from the east. The ashes are years old.','“Watchman, what of the night? The watchman said, The morning cometh.” — Isaiah 21:11–12'],
      chest:{gold:180,pot:['potion',2]}},
    {id:'p_vines',name:'the Green Mesa',x:205,y:261,r:7,h:5,up:'vines',a0:-1.3,
      verse:['A cairn of stones at the top','Every pilgrim who climbed the vines set a stone on it. There are hundreds.','“Hitherto hath the LORD helped us.” — 1 Samuel 7:12'],
      chest:{gold:240,pot:['potion',3]}},
    {id:'p_rope',name:'the Lonely Crag',x:198,y:129,r:6,h:6.2,up:'rope',a0:2.6,
      verse:['A cross cut in the rock at the very top','No path comes up here. No ladder. Someone was let up on a rope once, a long time ago, and cut this.','“He brought me up also out of an horrible pit, out of the miry clay, and set my feet upon a rock.” — Psalm 40:2'],
      chest:{gold:320,pot:['potion',3],great:true}},
    {id:'p_mere',name:'the Mere-watch',x:322,y:262,r:6,h:4,up:'path',a0:-2.4,sense:-1,
      verse:['A bench, looking out over the mere','From here Shadowmere’s white lamps look like stars come down to sit on the water.','“The people that walked in darkness have seen a great light.” — Isaiah 9:2'],
      chest:{gold:200,pot:['potion',2]}} ];
  const SHRINES=[
    {id:'s_hammer',x:24,y:81,tool:'hammer',name:'the Shrine of the Smiths',
      verse:['A tablet over the little altar','“Is not my word like as a fire? saith the LORD; and like a hammer that breaketh the rock in pieces?” — Jeremiah 23:29'],chest:{gold:150,pot:['potion',2]}},
    {id:'s_mirror',x:150,y:79,tool:'mirror',name:'the Shrine of the Morning',
      verse:['A tablet over the little altar','“For God, who commanded the light to shine out of darkness, hath shined in our hearts.” — 2 Corinthians 4:6'],chest:{gold:170,pot:['potion',2]}},
    {id:'s_lantern',x:164,y:235,tool:'lantern',name:'the Shrine of the Woods',
      verse:['A tablet over the little altar','“Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105'],chest:{gold:170,pot:['potion',2]}},
    {id:'s_horn',x:248,y:193,tool:'horn',name:'the Shrine of the Burnt Road',
      verse:['A tablet over the little altar','“Awake, O north wind; and come, thou south; blow upon my garden.” — Song of Solomon 4:16'],chest:{gold:190,pot:['potion',2]}},
    {id:'s_shield',x:216,y:300,tool:'shield',name:'the Shrine of the Storm',
      verse:['A tablet over the little altar','“The LORD is my strength and my shield; my heart trusted in him, and I am helped.” — Psalm 28:7'],chest:{gold:200,pot:['potion',3]}} ];
  const rim=(p,a)=>p.r*(1+0.13*Math.sin(a*3+p.x*0.1)+0.07*Math.sin(a*5+p.y*0.07));
  const pathSeg=(p,L0)=>{ if(p.up!=='path') return null; const a=p.a0, rr=rim(p,a)-0.4, sx=p.x+Math.cos(a)*rr, sy=p.y+Math.sin(a)*rr, tx=-Math.sin(a)*p.sense, ty=Math.cos(a)*p.sense, L=L0||p._L||p.h/0.4+1.5;
    return {sx,sy,ex:sx+tx*L,ey:sy+ty*L,L,tx,ty}; };
  const segT=(s,x,y)=>{ const u=Math.max(0,Math.min(1,((x-s.sx)*s.tx+(y-s.sy)*s.ty)/s.L)); return {u,d:Math.hypot(x-(s.sx+s.tx*s.L*u),y-(s.sy+s.ty*s.L*u))}; };
  // ── the land: raise each plateau flat-topped, and cut its path, before the world sets its grade ──
  function shape(o){ const {U,GR,DD,R1,W,H}=o, clear=o.clear||(()=>{});
    SHRINES.forEach(s=>{ for(let y=s.y-3;y<=s.y+5;y++) for(let x=s.x-3;x<=s.x+3;x++) clear(x,y); });   /* the shrines' ground, and the way to their doors, clear of trees */
    const at=(x,y)=>{ x=Math.max(0,Math.min(W,Math.round(x))); y=Math.max(0,Math.min(H,Math.round(y))); return U[y*R1+x]; };
    PLATS.forEach(p=>{ let sum=0, mx=-1e9; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, rr=rim(p,a)+2.5, u=at(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr); sum+=u; mx=Math.max(mx,u); }
      const base=sum/24, top=Math.max(base+p.h,mx+1.6); p._top=top;   /* the cliff stands its height over the meadow about it, and at least a tall man's height everywhere */
      if(p.up==='path'){ let L=p.h/0.4+1.5; for(let k=0;k<4;k++){ const S0=pathSeg(p,L); L=Math.max(4,(top-at(S0.ex,S0.ey))/0.36+1.5); } p._L=L; }   /* long enough to walk at a walking grade, from the top to the meadow it comes down to */
      const S=pathSeg(p), RR=p.r*1.3+(S?S.L:0)+3;
      /* the trees felled where you need to stand: across the middle of the top, along the path, at the foot of the climb and its landing */
      for(let y=Math.floor(p.y-RR);y<=Math.ceil(p.y+RR);y++) for(let x=Math.floor(p.x-RR);x<=Math.ceil(p.x+RR);x++){ const cx=x+0.5, cy=y+0.5, d=Math.hypot(cx-p.x,cy-p.y);
        if(d<=p.r*0.62) clear(x,y); else if(S){ const q=segT(S,cx,cy); if(q.d<=1.4&&q.u<1.02) clear(x,y); } }
      { const a=p.a0, rr=rim(p,a); [rr+1.35,rr+2.2,rr-0.7,rr-1.5].forEach(k=>{ const x=Math.floor(p.x+Math.cos(a)*k), y=Math.floor(p.y+Math.sin(a)*k); for(let j=-1;j<=1;j++) for(let i=-1;i<=1;i++) clear(x+i,y+j); }); }
      for(let y=Math.max(0,Math.floor(p.y-RR));y<=Math.min(H,Math.ceil(p.y+RR));y++) for(let x=Math.max(0,Math.floor(p.x-RR));x<=Math.min(W,Math.ceil(p.x+RR));x++){ const v=y*R1+x; if(!(DD[v]>0)) continue;
        const d=Math.hypot(x-p.x,y-p.y), rr=rim(p,Math.atan2(y-p.y,x-p.x));
        if(d<=rr){ U[v]=top+0.12*Math.sin(x*0.9+y*0.7); GR[v]=p.h+3; continue; }
        if(S){ const q=segT(S,x,y); if(q.d<=1.7&&q.u<1){ const w=Math.min(1,(q.d-1.3)/0.4), ge=at(S.ex,S.ey), hp=top+(ge-top)*q.u; U[v]=Math.max(U[v],w>0?hp*(1-w)+U[v]*w:hp); GR[v]=p.h+3; continue; } }
        if(d<=rr+2.2) GR[v]=Math.max(GR[v],p.h+3); } }); }
  const st=()=>{ const S=GAME.S; S.wilds=S.wilds||{}; ['chests','open','roped'].forEach(k=>{ if(!S.wilds[k]||typeof S.wilds[k]!=='object') S.wilds[k]={}; }); return S.wilds; };
  const T=()=>(typeof CATACOMB!=='undefined'&&CATACOMB.tools)?CATACOMB.tools():{};
  const TOOLN={hammer:'the Smith’s Hammer',mirror:'the Sun Mirror',lantern:'Deborah’s Lantern',horn:'Gideon’s Horn',shield:'Ruth’s Shield',rope:'Lydia’s Rope',bell:'the Tide Bell',staff:'the Shepherd’s Staff'};
  function attach(world,WD){ if(!world||!world.scene) return; const scene=world.scene, anim=world.anim, P=ENGINE.P, roll=world.roll||(()=>0), R=(WD&&WD.rivers)||{};
    const G0=world.ground, M0=world.canMove, S0=world.speedMult;
    const gAt=(x,z)=>G0(x,z);
    const blocked=new Set(), bk=(x,y)=>x+','+y;   // tiles walled off: shrine walls, posts, doors not yet opened
    const circles=[];   // round things in the way: {x,z,r,on()}
    let climb=null;
    const spot=(o)=>{ world.spots.push(o); return o; };
    const mergeRock=(parts)=>{ if(!parts.length) return; const m=new THREE.Mesh(mergeColoured(parts),new THREE.MeshLambertMaterial({vertexColors:true})); m.castShadow=m.receiveShadow=true; scene.add(m); return m; };
    const give=(id,it,label)=>{ const S=st(); if(S.chests[id]){ UI.toast('📭 Empty.',900); return false; } S.chests[id]=true; const parts=[];
      if(it.gold){ GAME.addGold(it.gold); parts.push(it.gold+' gold'); } if(it.pot){ const [p,q]=it.pot; GAME.S.inventory[p]=(GAME.S.inventory[p]||0)+q; const PO=(typeof SYS!=='undefined'&&SYS.POTIONS&&SYS.POTIONS[p])||{emoji:'🧪',name:p}; parts.push(`${q} ${PO.emoji} ${PO.name}`); }
      GAME.changed&&GAME.changed(); GAME.save(); ENGINE.hud(); if(typeof SFX!=='undefined') SFX.play('revealChest'); UI.toast('📦 '+(label?label+' — ':'')+parts.join(' · '),2600); return true; };
    const chestAt=(id,x,z,it,face,label)=>{ const h=CHEST3D.make(scene,x,z,{great:!!it.great,face:face||0}); h.parent.position.y=gAt(x,z); CHEST3D.set(h,!!st().chests[id]);
      circles.push({x,z,r:0.55}); spot({x,z,r:1.2,label:'Open',who:it.great?'A great chest':'A chest',action:()=>{ if(give(id,it,label)) CHEST3D.open(h); }}); return h; };
    const readAt=(x,z,lines,who)=>spot({x,z,r:1.2,label:'Read',who:who||lines[0],action:()=>ENGINE.speak(lines[0],lines.slice(1))});
    const toolSay=(who,lines,tool)=>ENGINE.speak(who,lines.concat(tool?['(It wants '+TOOLN[tool]+'.)']:[]));
    // ════ THE HEIGHTS ════
    const plats=PLATS.map(p=>({p,top:p._top!==undefined?p._top:(roll(p.x,p.y)+0.02)}));
    const inPlat=(x,z)=>{ for(const q of plats){ const p=q.p, d=Math.hypot(x-p.x,z-p.y); if(d<=rim(p,Math.atan2(z-p.y,x-p.x))+0.45) return q; } return null; };
    plats.forEach(q=>{ const p=q.p, top=roll(p.x,p.y)>0?roll(p.x,p.y):q.top; q.top=top; const S=pathSeg(p), parts=[], gr=[0x7a766e,0x6e6a62,0x86827a,0x625e58,0x8e8a80], moss=[0x5a7a42,0x4a6a38,0x6a8a4a];
      // the cliffs: rough grey rock all round the rim, from the meadow to the top, moss along the lip
      const n=Math.ceil(p.r*2*Math.PI/0.75);
      for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, rr=rim(p,a), cx=p.x+Math.cos(a)*(rr+0.15), cz=p.y+Math.sin(a)*(rr+0.15);
        if(S&&segT(S,cx,cz).d<1.3&&segT(S,cx,cz).u<0.97) continue;
        const lo=Math.min(roll(p.x+Math.cos(a)*(rr+1.4),p.y+Math.sin(a)*(rr+1.4)),top)-0.4, hgt=top-lo, nr=Math.max(1,Math.ceil(hgt/0.9));
        for(let j=0;j<nr;j++){ const s=0.55+hsh(i,j)*0.35, y=lo+(j+0.5)*hgt/nr, g=new THREE.DodecahedronGeometry(1,0); g.scale(s*0.9,hgt/nr*0.75,s); g.rotateY(a+hsh(j,i)*0.6);
          g.translate(cx+(hsh(i*3,j)-0.5)*0.25,y,cz+(hsh(j*5,i)-0.5)*0.25); parts.push([g,gr[(i+j)%gr.length]]); }
        const lip=new THREE.DodecahedronGeometry(1,0); lip.scale(0.55,0.16,0.5); lip.rotateY(a); lip.translate(p.x+Math.cos(a)*(rr-0.15),top+0.02,p.y+Math.sin(a)*(rr-0.15)); parts.push([lip,moss[i%3]]); }
      // the cliff path: flagstones up it, a rail of posts on its open side
      if(S){ for(let k=0;k<=Math.floor(S.L/0.6);k++){ const u=k*0.6/S.L, x=S.sx+S.tx*S.L*u, z=S.sy+S.ty*S.L*u, y=roll(x,z); const f=new THREE.BoxGeometry(0.7,0.06,0.5); f.rotateY(Math.atan2(S.tx,S.ty)+(hsh(k,3)-0.5)*0.3); f.translate(x,y+0.02,z); parts.push([f,0xa49c8c]);
          if(k%2===0){ const ox=-S.ty*p.sense*0.0+(x-p.x), oz=(z-p.y), l=Math.hypot(ox,oz)||1, px=x+ox/l*0.7, pz=z+oz/l*0.7, py=roll(px,pz); const po=new THREE.CylinderGeometry(0.05,0.06,0.9,6); po.translate(px,Math.max(py,y-0.4)+0.45,pz); parts.push([po,0x6a4a2a]); } } }
      mergeRock(parts);
      // the way up
      const a=p.a0, rr=rim(p,a), ux=Math.cos(a), uz=Math.sin(a), fx=p.x+ux*(rr+1.35), fz=p.y+uz*(rr+1.35), tx=p.x+ux*(rr-0.7), tz=p.y+uz*(rr-0.7);
      if(p.up==='ladder'||p.up==='vines'||p.up==='rope'){ const g=group(p.x+ux*(rr+0.7),0,p.y+uz*(rr+0.7),scene); g.rotation.y=Math.atan2(ux,uz); const lo=gAt(fx,fz), H2=top-lo;
        if(p.up==='ladder'){ [-0.28,0.28].forEach(o=>Cy(0.05,0.05,H2+0.9,6,0x6a4a2a,o,lo,0,g)); for(let i=0;i<Math.floor((H2+0.7)/0.32);i++) B(0.6,0.05,0.07,0x7a5a32,0,lo+0.25+i*0.32,0.02,g); }
        else if(p.up==='vines'){ const vm=[0x3e6a32,0x4a7a3a,0x35602c]; for(let i=0;i<34;i++){ const lf=Sp(0.13+hsh(i,2)*0.1,vm[i%3],(hsh(i,1)-0.5)*1.5,lo+hsh(i,3)*H2,0.05+hsh(i,4)*0.08,g,6,5); lf.scale.z=0.5; } for(let k=0;k<4;k++){ const st2=Cy(0.035,0.04,H2+0.4,5,0x5a4a2a,-0.5+k*0.33,lo,0.04,g); st2.rotation.z=(hsh(k,9)-0.5)*0.2; } }
        else { B(0.12,0.12,0.9,0x3a3a42,0,top+0.5,-0.3,g); B(0.1,0.6,0.1,0x3a3a42,0,top,-0.7,g); const wh=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.04,6,14),mt(0x5a5a64)); wh.rotation.y=Math.PI/2; wh.position.set(0,top+0.36,0.1); g.add(wh); }
        const rope=p.up==='rope'?Cy(0.022,0.022,H2+0.3,5,0xb09868,0,lo,0.12,g):null; if(rope) rope.visible=!!st().roped[p.id];
        shade(g); circles.push({x:p.x+ux*(rr+0.8),z:p.y+uz*(rr+0.8),r:0.35});
        const go=(up)=>{ if(climb||ENGINE.holding) return; if(ENGINE.K.sheathe) ENGINE.K.sheathe(); const dur=(p.up==='rope'?1.2:0.5)+H2*(p.up==='rope'?0.35:0.3); P.x=fx; P.z=fz; P.face=Math.atan2(-ux,-uz);
          climb={u:0,dur,up,lo,top,fx,fz,tx,tz,y:up?lo:top}; ENGINE.hold(dur+0.05,'climb'); if(typeof SFX!=='undefined') SFX.play('stairStep'); };
        const who=p.up==='ladder'?'A ladder up the rock':p.up==='vines'?'Old vines up the rock':'A pulley at the lip, high up';
        const sp=spot({x:fx,z:fz,r:1.2,label:'Climb',who,hide:()=>!!climb||P.y>lo+1,action:()=>{
          if(p.up==='rope'){ if(!T().rope){ toolSay(who,['An iron pulley on a bracket at the lip of the crag, far overhead. The rock below it is sheer — no path, no hand-holds.','Someone was let up on a rope here, once.'],'rope'); return; }
            if(!st().roped[p.id]){ st().roped[p.id]=true; GAME.save(); if(rope) rope.visible=true; UI.toast('🪢 You cast Lydia’s rope up over the pulley — it drops back to your hand, and draws taut, and lifts you.',2600); } }
          if(p.up==='vines'&&!st().open[p.id]){ st().open[p.id]=true; UI.toast('🌿 The old vines are thick as rope, and rooted deep. They hold.',2000); }
          go(true); }});
        anim.push(()=>{ sp.label=p.up==='rope'&&!T().rope?'Look':p.up==='rope'&&!st().roped[p.id]?'Cast rope':'Climb'; });
        spot({x:tx,z:tz,r:0.9,label:'Climb down',who,hide:()=>!!climb||P.y<top-0.8||(p.up==='rope'&&!st().roped[p.id]),action:()=>go(false)}); }
      // on the top: the chest, and the bench or the cairn with its verse
      const ca=p.a0+Math.PI*0.75, cx2=p.x+Math.cos(ca)*p.r*0.35, cz2=p.y+Math.sin(ca)*p.r*0.35;
      chestAt(p.id,cx2,cz2,p.chest,Math.atan2(p.x-cx2,p.y-cz2),p.name);
      const va=p.a0-Math.PI*0.6, vx=p.x+Math.cos(va)*p.r*0.45, vz=p.y+Math.sin(va)*p.r*0.45, vg=group(vx,top,vz,scene); vg.rotation.y=Math.atan2(vx-p.x,vz-p.y);
      if(p.up==='vines'){ [[0.5,0.3],[0.42,0.26],[0.34,0.22],[0.26,0.2],[0.18,0.16]].reduce((y,[r,h],i)=>{ const s2=Sp(r,[0x8a8478,0x7a766c,0x9a9488,0x6a665e,0xa8a294][i],0,y+h/2,0,vg,8,6); s2.scale.y=h/r; return y+h; },0); circles.push({x:vx,z:vz,r:0.6}); }
      else if(p.up==='rope'){ B(0.9,1.5,0.3,0x8a8478,0,0,0,vg); B(0.08,0.6,0.04,0x3a3630,0,0.65,0.16,vg); B(0.34,0.08,0.04,0x3a3630,0,1.0,0.16,vg); circles.push({x:vx,z:vz,r:0.55}); }
      else { B(1.3,0.08,0.4,0x8a6a42,0,0.42,0,vg); [-0.5,0.5].forEach(o=>B(0.1,0.42,0.34,0x6a4a2a,o,0,0,vg)); B(1.3,0.4,0.06,0x8a6a42,0,0.5,-0.2,vg); circles.push({x:vx,z:vz,r:0.6}); }
      shade(vg); readAt(vx,vz,p.verse,p.verse[0]); });
    // ════ THE RIVERS ════
    const stones=new Set(R.stones||[]), bellF=new Set(R.bellFord||[]);
    { const parts=[]; stones.forEach(k=>{ const [x,y]=k.split(',').map(Number); for(let i=0;i<2;i++){ const g=new THREE.CylinderGeometry(0.3+hsh(x,i)*0.1,0.36+hsh(y,i)*0.1,0.16,8); g.translate(x+0.3+i*0.45+(hsh(i,y)-0.5)*0.15,0.0,y+0.3+hsh(x+i,y)*0.4); parts.push([g,[0x8a867c,0x9a968a][i]]); } }); mergeRock(parts); }
    // the drowned ford: the water stands deep over it until the bell is rung on the bank
    const bellRung=()=>!!st().open.bellford;
    if(bellF.size){ const cells=[...bellF].map(k=>k.split(',').map(Number)), xs=cells.map(c=>c[0]), ys=cells.map(c=>c[1]), x0=Math.min(...xs), x1=Math.max(...xs)+1, y0=Math.min(...ys), y1=Math.max(...ys)+1;
      const wm=new THREE.MeshPhongMaterial({color:0x2a6a8c,transparent:true,opacity:0.85,shininess:80}); const flood=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,0.5,y1-y0),wm); flood.position.set((x0+x1)/2,-0.05,(y0+y1)/2); scene.add(flood);
      let fu=bellRung()?1:0; anim.push((t,dt)=>{ const want=bellRung()?1:0; fu+=(want-fu)*Math.min(1,(dt||0.016)*0.8); flood.position.y=-0.05-fu*0.5; flood.visible=fu<0.98; });
      cells.forEach(([x,y])=>blocked.add(bk(x,y)+':bell'));
      const mid=(y0+y1)/2; [[x0-1.0,mid],[x1+1.0,mid]].forEach(([bx,bz])=>{ const g=group(bx,gAt(bx,bz),bz,scene); Cy(0.08,0.1,1.9,6,0x5a3e24,0,0,0,g); B(0.5,0.08,0.08,0x5a3e24,0.2,1.85,0,g); const bl=group(0.4,1.6,0,g); bl.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.17,0.24,10,1,true),new THREE.MeshPhongMaterial({color:0xb08a3a,side:THREE.DoubleSide}))); bl.visible=false; shade(g); circles.push({x:bx,z:bz,r:0.25});
        const sp=spot({x:bx,z:bz,r:1.3,label:'Look',who:'A bell-post by the ford',action:()=>{ if(!T().bell){ toolSay('A bell-post by the ford',['A post on the bank with an empty bracket. Below it the old ford, drowned deep — the stones of it show green under the water.','“Ring for the ferryman,” someone has cut in the post. There has been no ferryman for years.'],'bell'); return; }
          if(bellRung()){ UI.toast('The ford lies shallow. The water remembers.',1400); return; } bl.visible=true; let u=0; anim.push(function ring(t2,d2){ u+=(d2||0.016); bl.rotation.z=Math.sin(u*14)*0.5*Math.max(0,1-u/1.6); if(u>1.6){ bl.visible=false; anim.splice(anim.indexOf(ring),1); } });
          if(typeof AUDIO2D!=='undefined'&&AUDIO2D.tone) [523,784,659].forEach((f,i)=>AUDIO2D.tone(null,{f0:f,f1:f*0.99,dur:1.8,type:'sine',gain:0.1,delay:i*0.09,decay:1.6}));
          st().open.bellford=true; GAME.save(); UI.toast('🔔 The note rolls out over the river — and the water draws back off the old ford, and leaves it shallow.',2800); }});
        anim.push(()=>{ sp.label=T().bell&&!bellRung()?'Ring':'Look'; }); }); }
    // the islet in the North Water, and the rings to swing out to it with the crook
    let hook=null;
    if(R.island){ const [ix,iy]=R.island, isl={x:ix,z:iy}; let bank=null; for(let x=ix-2;x>ix-12;x--){ if(world.walkTile&&world.walkTile(x,iy)&&(world.T?world.T(x,iy)!==3:true)){ bank={x:x+0.5,z:iy+0.5}; break; } }
      if(bank){ const ringPost=(x,z)=>{ const g=group(x,gAt(x,z),z,scene); Cy(0.14,0.18,1.3,8,0x8a8478,0,0,0,g); const r=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.045,8,18),new THREE.MeshPhongMaterial({color:0x8a8a96,shininess:70})); r.position.set(0,1.5,0); r.rotation.y=Math.PI/2; g.add(r); shade(g); circles.push({x,z,r:0.25}); };
        const iR={x:ix-0.6,z:iy+0.2}, bR={x:bank.x-0.6,z:bank.z+0.4}; ringPost(iR.x,iR.z); ringPost(bR.x,bR.z);
        const swing=(rg,land)=>{ if(hook) return; if(!T().staff){ toolSay('An iron ring',['An iron ring on a stone post, across the water — well out of reach.','A shepherd’s crook might catch it.'],'staff'); return; }
          P.face=Math.atan2(rg.x-P.x,rg.z-P.z); ENGINE.hold(0.85); const line=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1,5),mt(0x8a6a3a)); scene.add(line); if(typeof SFX!=='undefined') SFX.play('swing','light'); hook={u:0,fx:P.x,fz:P.z,tx:land.x,tz:land.z,rg,line}; };
        const onIsle=()=>Math.hypot(P.x-ix,P.z-iy)<2.2;
        spot({x:iR.x,z:iR.z,r:6.5,far:true,label:'Hook',who:'An iron ring on the islet',hide:()=>onIsle()||Math.hypot(P.x-bank.x,P.z-bank.z)>3.5,action:()=>swing(iR,{x:ix,z:iy-0.3})});
        spot({x:bR.x,z:bR.z,r:6.5,far:true,label:'Hook',who:'An iron ring on the bank',hide:()=>!onIsle(),action:()=>swing(bR,{x:bank.x+0.3,z:bank.z})});
        chestAt('isle',ix-0.2,iy-0.9,{gold:220,pot:['potion',2]},Math.PI*0.5,'the islet');
        anim.push((t,dt)=>{ const h=hook; if(!h) return; h.u=Math.min(1,h.u+(dt||0.016)/0.75); const e=h.u*h.u*(3-2*h.u); P.x=h.fx+(h.tx-h.fx)*e; P.z=h.fz+(h.tz-h.fz)*e;
          const v=new THREE.Vector3(h.rg.x-P.x,1.5-1.1,h.rg.z-P.z); h.line.position.set((P.x+h.rg.x)/2,1.3+gAt(P.x,P.z),(P.z+h.rg.z)/2); h.line.scale.y=Math.max(0.2,v.length()); h.line.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
          if(h.u>=1){ scene.remove(h.line); hook=null; if(!st().open.isleTip){ st().open.isleTip=true; UI.toast('🪝 The crook catches the ring — and swings you out over the water.',2000); } } }); } }
    // ════ THE WAYSIDE SHRINES ════
    const solved=s=>!!st().open[s.id];
    SHRINES.forEach(s=>{ const cx=s.x+0.5, cz=s.y+0.5, base=gAt(cx,cz), g=group(cx,base,cz,scene), wallC=[0xa8a294,0x9a9488,0xb0aa9c,0x928c80];
      // four low walls of fieldstone, broken at the top, a doorway in the south wall; inside, a little altar under a cross
      for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){ if(Math.abs(dx)<2&&Math.abs(dy)<2) continue; if(dx===0&&dy===2) continue; const h2=1.2+hsh(dx+s.x,dy+s.y)*0.9; B(1.0,h2,1.0,wallC[(dx*3+dy+9)%4],dx,gAt(cx+dx,cz+dy)-base-0.2,dy,g); blocked.add(bk(s.x+dx,s.y+dy)); }
      [-0.62,0.62].forEach(o=>B(0.22,2.3,1.04,0xb8b2a4,o,-0.2,2,g)); B(1.5,0.28,1.04,0xb8b2a4,0,1.9,2,g);
      B(1.0,0.7,0.6,0xc8c2b4,0,0,-1.1,g); B(0.55,0.8,0.14,0x8a8478,-1,0,-1.35,g); for(let i=0;i<3;i++) B(0.34,0.02,0.02,0x3a3630,-1,0.45+i*0.1,-1.27,g); B(0.08,0.8,0.06,0xd8b048,0,0.7,-1.3,g); B(0.42,0.08,0.06,0xd8b048,0,1.0,-1.3,g); blocked.add(bk(s.x,s.y-1));
      for(let i=0;i<6;i++){ const iv=Sp(0.18,0x3e6a32,(hsh(i,s.x)-0.5)*4,0.5+hsh(i,2)*1.2,-2.5,g); iv.scale.z=0.3; }
      shade(g); chestAt(s.id,cx+1,cz-0.6,s.chest,Math.PI,s.name.replace(/^the /,'The ')); readAt(cx-1,cz-0.8,s.verse,s.verse[0]);
      // the door, and what stops it
      const dx0=cx, dz0=cz+2, door=group(dx0,gAt(dx0,dz0),dz0,scene), WHO={hammer:'A cracked boulder',mirror:'A stone door with a sun-disc',lantern:'A tangle of thorns',horn:'A bank of ash',shield:'Storm-stones'}[s.tool];
      if(s.tool==='hammer'){ const b=new THREE.Mesh(new THREE.DodecahedronGeometry(0.62,1),mt(0x8a847a)); b.scale.set(1,0.9,0.9); b.position.y=0.5; door.add(b); for(let i=0;i<5;i++){ const c=B(0.02,0.5,0.02,0x1a1410,(hsh(i,1)-0.5)*0.6,0.3+i*0.12,0.5,door); c.rotation.z=(hsh(i,2)-0.5)*1.4; } }
      else if(s.tool==='mirror'){ B(0.96,1.8,0.2,0x9a9282,0,0,0,door); const dc=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.05,18),new THREE.MeshPhongMaterial({color:0xd8b048,shininess:80,emissive:0x2a1a04})); dc.rotation.x=Math.PI/2; dc.position.set(0,2.05,0.12); g.add(dc); dc.position.set(0,2.05,2.6); }
      else if(s.tool==='lantern'){ for(let i=0;i<14;i++){ const L2=0.9+hsh(i,s.x)*0.8, rr=Cy(0.035,0.06,L2,5,i%3?0x3a2a1a:0x4a3a1e,(hsh(i,3)-0.5)*0.8,0.1+hsh(i,4)*1.2,(hsh(i,5)-0.5)*0.3,door); rr.rotation.set((hsh(i,6)-0.5)*2.4,hsh(i,7)*3,(hsh(i,8)-0.5)*2.4); } for(let i=0;i<5;i++) Sp(0.05,0x8a2a3a,(hsh(i,9)-0.5)*0.8,0.3+i*0.3,0.1,door); }
      else if(s.tool==='horn'){ const am=new THREE.MeshLambertMaterial({color:0x7a726a}); for(let i=0;i<4;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.55+hsh(i,s.y)*0.2,10,7),am); m.position.set((hsh(i,1)-0.5)*0.5,0.1+i*0.38,(hsh(i,2)-0.5)*0.3); m.scale.set(1.1,0.7,0.9); door.add(m); } }
      shade(door); if(s.tool!=='shield') blocked.add(bk(s.x,s.y+2)+':'+s.id);
      let stormT=0; const bolt=s.tool==='shield'?(()=>{ const bg=group(0,0,0,scene); [-0.75,0.75].forEach(o=>{ const sg=group(dx0+o,gAt(dx0+o,dz0+0.9),dz0+0.9,scene); Cy(0.16,0.22,1.5,7,0x4a505a,0,0,0,sg); const cu=new THREE.MeshPhongMaterial({color:0xb8723a,emissive:0x2a1408}); Cy(0.2,0.14,0.14,7,cu,0,1.5,0,sg); shade(sg); circles.push({x:dx0+o,z:dz0+0.9,r:0.25}); }); return bg; })():null;
      const bM=new THREE.LineBasicMaterial({color:0xdaf2ff,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false});
      const showDoor=()=>{ const o=solved(s); if(s.tool==='mirror'){ door.position.y=gAt(dx0,dz0)-(o?1.85:0); } else door.visible=!o; };
      showDoor();
      const act=()=>{ if(solved(s)) return; const has=T()[s.tool];
        if(s.tool==='shield'){ ENGINE.speak('Storm-stones',['Two stones of slate either side of the shrine door, copper-crowned, and lightning crawling between them across the doorway — never stopping.','Nothing crosses it. Nothing without a shield made for it.'].concat(has?['(Raise Ruth’s shield — hold Guard — and walk through.)']:['(It wants Ruth’s Shield.)'])); return; }
        if(!has){ const L={hammer:['A boulder fills the doorway, cracked right through. It was rolled there.','Something heavy, swung hard, would break it.'],mirror:['The door is a slab of stone with a disc of gold over it, rayed like the sun. It does not move.','On a post in the open, a little way off, an empty bronze bracket, turned to the sky.'],lantern:['Thorns, grown thick as a man’s wrist across the doorway, the rot purple in them. Torches go out near them.','A lamp that carries its own light might take them.'],horn:['Ash, banked to the lintel — blown here off the burnt country and packed hard by the rain.','A strong wind would have it gone in a moment.']}[s.tool]; toolSay(WHO,L,s.tool); return; }
        if(s.tool==='mirror'){ const f=GAME.S.dayFrac; if(typeof f==='number'&&(f<0.27||f>0.83)){ UI.toast('🌙 There is no sun to catch. Come back by day.',2200); return; } }
        P.face=Math.atan2(dx0-P.x,dz0-P.z); ENGINE.hold(1.2);
        if(typeof SFX!=='undefined'){ if(s.tool==='hammer'){ SFX.play('bossStrike'); SFX.play('hit',true); } else SFX.play('swing','heavy'); }
        if(typeof AUDIO2D!=='undefined'&&AUDIO2D.tone&&s.tool==='horn'){ AUDIO2D.tone(null,{type:'sawtooth',f0:146,f1:150,dur:1.1,gain:0.12,attack:0.12,filter:'lowpass',fc:900,fc1:1400,q:2}); AUDIO2D.noise(null,{dur:1.3,fc:700,fc1:2600,q:0.5,gain:0.09,decay:0.9,delay:0.3}); }
        const fxc=s.tool==='lantern'?[0xff8a2a,0xffd06a]:s.tool==='horn'?[0x8a8278,0x9a928a]:s.tool==='mirror'?[0xfff0b0,0xffe08a]:[0x9a9488,0x8a8478];
        for(let i=0;i<22;i++){ const m=new THREE.Sprite(new THREE.SpriteMaterial({color:fxc[i%2],transparent:true,opacity:0.8,depthWrite:false})); const sc=0.2+Math.random()*0.3; m.scale.set(sc,sc,1); m.position.set(dx0+(Math.random()-0.5)*0.9,gAt(dx0,dz0)+0.2+Math.random()*1.4,dz0+(Math.random()-0.5)*0.6); scene.add(m); const v=new THREE.Vector3((Math.random()-0.5)*2,1+Math.random()*1.5,(Math.random()-0.5)*2); let life=1.2;
          anim.push(function fx(t2,d2){ d2=d2||0.016; life-=d2; m.position.addScaledVector(v,d2); m.material.opacity=Math.max(0,Math.min(0.8,life)); if(life<=0){ scene.remove(m); anim.splice(anim.indexOf(fx),1); } }); }
        setTimeout(()=>{ st().open[s.id]=true; GAME.save(); showDoor();
          UI.toast({hammer:'🔨 The hammer comes down — and the boulder splits along its crack and falls in two.',mirror:'🪞 You set the Sun Mirror in the bracket and turn it — the light leaps to the golden disc, and the slab sinks into the ground.',lantern:'🏮 The thorns catch from the lantern-flame, crackle, and fall away in ash.',horn:'📯 The breath goes out of the horn — and the ash goes up off the doorway like smoke.'}[s.tool],2600); },s.tool==='mirror'?400:700); };
      const sp=spot({x:dx0,z:dz0+(s.tool==='shield'?1.5:1.1),r:1.3,label:'Look',who:WHO,hide:()=>solved(s),action:act});
      anim.push(()=>{ sp.label=s.tool==='shield'||!T()[s.tool]?'Look':{hammer:'Smash',mirror:'Set mirror',lantern:'Burn',horn:'Blow'}[s.tool]; });
      if(s.tool==='mirror'){ const bx=dx0+1.8, bz=dz0+2.4, bg=group(bx,gAt(bx,bz),bz,scene); Cy(0.05,0.07,1.1,6,0x6a4a24,0,0,0,bg); const fr=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.03,6,22),mt(0x7a5a2a)); fr.position.y=1.35; bg.add(fr); shade(bg); circles.push({x:bx,z:bz,r:0.25});
        const beam=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,1),new THREE.MeshBasicMaterial({color:0xfff6d8,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false})); beam.visible=false; scene.add(beam);
        anim.push(()=>{ beam.visible=solved(s); if(beam.visible){ const a=new THREE.Vector3(bx,gAt(bx,bz)+1.35,bz), b=new THREE.Vector3(dx0,gAt(dx0,dz0)+2.05,dz0+0.62); beam.position.copy(a).add(b).multiplyScalar(0.5); beam.scale.z=a.distanceTo(b); beam.lookAt(b); } });
        spot({x:bx,z:bz,r:1.2,label:'Look',who:'An empty bronze bracket',hide:()=>solved(s),action:act}); }
      if(bolt){ const did=s.id; anim.push((t,dt)=>{ dt=dt||0.016; if(solved(s)) { while(bolt.children.length) bolt.remove(bolt.children[0]); return; } stormT-=dt; if(stormT<=0){ stormT=0.08; while(bolt.children.length){ const m=bolt.children.pop(); m.geometry.dispose(); }
            const y0=gAt(dx0,dz0+0.9)+1.55, pts=[]; for(let i=0;i<=8;i++){ const u=i/8, j=i===0||i===8?0:0.12; pts.push(new THREE.Vector3(dx0-0.75+1.5*u+(Math.random()-0.5)*j,y0+(Math.random()-0.5)*j*2,dz0+0.9+(Math.random()-0.5)*j)); } bolt.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),bM)); }
          const px=Math.floor(P.x), pz=Math.floor(P.z); if(px===s.x&&(pz===s.y+2||pz===s.y+3)&&Math.abs(P.z-(dz0+0.9))<0.45){ const guard=T().shield&&typeof COMBAT!=='undefined'&&COMBAT.pl&&COMBAT.pl.blocking;
            if(guard){ if(!st().open[did+'_tip']){ st().open[did+'_tip']=true; UI.toast('🛡️ The lightning breaks on Ruth’s shield — and you walk through it.',2400); } if(P.z<dz0+0.5){ st().open[did]=true; GAME.save(); } return; }
            const S0=GAME.S, dmg=Math.max(1,Math.round(S0.maxHp*0.06)); S0.hp=Math.max(1,S0.hp-dmg); ENGINE.hud(); if(typeof SFX!=='undefined') SFX.play('bossStrike'); P.z=dz0+1.6; ENGINE.hold(0.35); UI.toast(T().shield?'⚡ The lightning throws you back! Raise Ruth’s shield — hold Guard — and walk into it.':'⚡ The lightning throws you back! Nothing crosses it without a shield made for it.',2400); } }); } });
    // ════ the world, wrapped ════
    world.ground=(x,z)=>{ if(climb&&Number.isFinite(climb.y)) return climb.y; const g=G0(x,z), q=inPlat(x,z); return q&&q.top>g?q.top:g; };
    world.canMove=(fx,fz,tx,tz)=>{ if(climb||hook) return false; const X=Math.floor(tx), Y=Math.floor(tz);
      if(blocked.has(bk(X,Y))) return false;
      for(const s of SHRINES) if(X===s.x&&Y===s.y+2&&s.tool!=='shield'&&!solved(s)) return false;
      if(bellF.has(bk(X,Y))&&!bellRung()) return false;
      for(const c of circles){ const dT=Math.hypot(tx-c.x,tz-c.z), dF=Math.hypot(fx-c.x,fz-c.z); if(dT<c.r+0.25&&dT<dF) return false; }
      const qT=inPlat(tx,tz), qF=inPlat(fx,fz); if(qT&&!qF&&G0(fx,fz)<qT.top-1.0) return false;   /* no walking up a cliff — but off one, always */
      return M0(fx,fz,tx,tz); };
    world.speedMult=()=>{ const b=S0?S0():1, x=Math.floor(P.x), y=Math.floor(P.z); if(world.T&&world.T(x,y)===20&&!stones.has(bk(x,y))&&!bellF.has(bk(x,y))) return b*0.6; return b; };
    anim.push((t,dt)=>{ if(!climb) return; climb.u=Math.min(1,climb.u+(dt||0.016)/climb.dur); const e=climb.u, c=climb; c.y=c.up?c.lo+(c.top-c.lo)*e:c.top+(c.lo-c.top)*e;
      if(c.u>=1){ climb=null; if(c.up){ P.x=c.tx; P.z=c.tz; P.y=c.top; } else { P.x=c.fx; P.z=c.fz; P.y=c.lo; } } });
    world.wilds={PLATS,SHRINES,plats,inPlat}; world.wildsR=R;
  }
  return {shape,attach,PLATS,SHRINES};
})();
