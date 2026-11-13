// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//  TREETOPS — V202: Thornwood, up in the trees. Decks of planks built round giant trees, rope bridges slung between them
//  that sway as you cross, ladders up from the forest floor, and the village's houses (and its chapel) standing on the
//  decks. An overlay on the world like WILDS: up a tree, the ground under you is the deck or the bridge and you can only
//  walk where there are boards; on the forest floor the decks are overhead, and you walk under them.
//  WORLD_DATA.treetops = { decks:[{x0,y0,x1,y1,h,tree:[x,z,r],name}], bridges:[{da,db,a:[x,z],b:[x,z],w}],
//    ladders:[{deck,x,y,dx,dy}], rect:[x0,y0,x1,y1] }   ·  buildings with b.deck stand on that deck (world.js leaves them
//  to us); villagers with v.deck stand on one.  TREETOPS.attach(world,WD).  State: GAME.S.atUp — the saved spot is up a tree.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const TREETOPS=(function(){
  function attach(world,WD){ const TT=WD.treetops; if(!TT) return; TT.decks=TT.decks||[]; const scene=world.scene, P=ENGINE.P;
    const G0=world.ground, M0=world.canMove; let up=false, climb=null, onB=null;
    const decks=TT.decks.map(d=>Object.assign({},d)), bridges=(TT.bridges||[]).map(b=>Object.assign({},b)), ladders=(TT.ladders||[]).concat((TT.climbs||[]).map(c=>Object.assign({ground:true},c)));
    decks.forEach(d=>{ let m=-1e9; for(const [x,z] of [[d.x0,d.y0],[d.x1+1,d.y0],[d.x0,d.y1+1],[d.x1+1,d.y1+1],[(d.x0+d.x1+1)/2,(d.y0+d.y1+1)/2]]) m=Math.max(m,G0(x,z)); d.top=m+d.h; });
    const inDeck=(d,x,z,m)=>x>=d.x0+m&&x<=d.x1+1-m&&z>=d.y0+m&&z<=d.y1+1-m;
    const deckAt=(x,z,m)=>{ for(const d of decks) if(inDeck(d,x,z,m||0)) return d; return null; };
    bridges.forEach(b=>{ b.ya=decks[b.da].top; b.yb=decks[b.db].top; b.dx=b.b[0]-b.a[0]; b.dz=b.b[1]-b.a[1]; b.L=Math.hypot(b.dx,b.dz); b.sag=Math.min(0.55,b.L*0.045); b.sw=0; });
    const bY=(b,u)=>b.ya+(b.yb-b.ya)*u-b.sag*Math.sin(Math.PI*u);
    const bridgeAt=(x,z,m)=>{ for(const b of bridges){ const u=((x-b.a[0])*b.dx+(z-b.a[1])*b.dz)/(b.L*b.L); if(u<-0.02||u>1.02) continue; const px=b.a[0]+b.dx*u, pz=b.a[1]+b.dz*u; if(Math.hypot(x-px,z-pz)<=b.w/2-(m||0)) return {b,u:Math.max(0,Math.min(1,u))}; } return null; };
    const HOUSES=WD.buildings.filter(b=>b.deck!==undefined&&decks[b.deck]);
    // what stands in the way: the trunks (up and down), the stilts under the decks (down), the houses (up)
    const downC=[], upC=[]; decks.forEach(d=>{ const [tx,tz,r]=d.tree; downC.push({x:tx,z:tz,r:r+0.15}); upC.push({x:tx,z:tz,r:r+0.15}); });
    const upR=HOUSES.map(b=>({x0:b.x+0.1,z0:b.y+0.1,x1:b.x+b.w-0.1,z1:b.y+b.h-0.1}));

    // ── the look ──
    const fades=[];   // {mats,want,cur}
    const own=g=>{ const mats=[]; g.traverse(o=>{ if(o.isMesh&&o.material&&!Array.isArray(o.material)&&!o.material.isMeshBasicMaterial){ o.material=o.material.clone(); mats.push(o.material); } }); const f={mats,want:1,cur:1}; fades.push(f); return f; };
    const BARK=[0x5a4030,0x4e3828,0x664a36], LEAF=[0x3a5e2c,0x2f5226,0x47703a,0x35582a], PLANK=[0x9a7a4e,0x8e6e44,0xa6845a,0x94744a];
    decks.forEach((d,di)=>{ const [tx,tz,r]=d.tree, g0=G0(tx,tz);
      // the giant: a trunk going up through the deck, roots flaring into the ground, boughs, and a high crown
      const tg=group(0,0,0,scene), H2=d.top-g0+7.5;
      const tr=Cy(r*0.72,r,H2,14,BARK[di%3],tx,g0-0.3,tz,tg);
      for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+hsh(di,i), rr=Cy(0.06,0.09,H2*0.8,4,0x3e2c1e,tx+Math.cos(a)*r*0.93,g0,tz+Math.sin(a)*r*0.93,tg); rr.rotation.set(0,0,0); }   // bark ridges
      for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+hsh(i,di)*0.6, L=1.6+hsh(di,i+3)*1.2, rt=Cy(0.22,0.5,L,7,BARK[(i+1)%3],0,0,0,tg); rt.position.set(tx+Math.cos(a)*(r+L*0.32),g0+0.15,tz+Math.sin(a)*(r+L*0.32)); rt.rotation.set(Math.sin(a)*1.25,0,-Math.cos(a)*1.25); }
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2+hsh(di,i*7), L=3.2+hsh(i,di)*1.6, bo=Cy(0.18,0.34,L,6,BARK[i%3],0,0,0,tg); bo.position.set(tx+Math.cos(a)*(r*0.6+L*0.38),d.top+4.6+hsh(i,2)*1.4,tz+Math.sin(a)*(r*0.6+L*0.38)); bo.rotation.set(Math.sin(a)*1.0,0,-Math.cos(a)*1.0); }
      shade(tg); mergeStatic(tg);
      const cg=group(0,0,0,scene), CR=r*2.1+2.2; for(let i=0;i<9;i++){ const a=i/9*Math.PI*2+hsh(di,i), rr=i===0?0:CR*0.55, s=Sp(CR*(i===0?0.75:0.5+hsh(i,di)*0.2),LEAF[i%4],tx+Math.cos(a)*rr,d.top+9.6+(i===0?1.2:hsh(i,di+1)*1.4),tz+Math.sin(a)*rr,cg,9,7); s.scale.y=0.62; }
      shade(cg); mergeStatic(cg); d.crown={f:own(cg),x:tx,z:tz,r:CR*1.3,y0:d.top+7.2};
      // the deck: planks across it, joists under, beams from the trunk and stilts at the corners, a rail round its edge
      const dg=group(0,0,0,scene), x0=d.x0, x1=d.x1+1, z0=d.y0, z1=d.y1+1, T=d.top;
      for(let z=z0+0.2,i=0;z<z1;z+=0.42,i++) B(x1-x0-0.04,0.12,0.38,PLANK[(i+di)%4],(x0+x1)/2+(hsh(i,di)-0.5)*0.04,T-0.12,z+0.0,dg);
      [x0+0.3,(x0+x1)/2,x1-0.3].forEach(x=>B(0.22,0.26,z1-z0-0.2,0x6a4a2c,x,T-0.4,(z0+z1)/2,dg));
      [[x0+0.25,z0+0.25],[x1-0.25,z0+0.25],[x0+0.25,z1-0.25],[x1-0.25,z1-0.25]].forEach(([x,z])=>{ const gy=G0(x,z); Cy(0.16,0.2,T-gy,7,0x5a3e24,x,gy-0.1,z,dg); downC.push({x,z,r:0.32});
        const L2=Math.hypot(x-tx,z-tz)-r, br=B(0.14,0.14,L2,0x5a3e24,0,0,0,dg); br.position.set((x+tx)/2,T-0.62,(z+tz)/2); br.rotation.y=Math.atan2(x-tx,z-tz); });
      for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+0.4, br=Cy(0.08,0.1,3.2,5,0x5a3e24,0,0,0,dg); br.position.set(tx+Math.cos(a)*(r+1.0),T-1.7,tz+Math.sin(a)*(r+1.0)); br.rotation.set(Math.sin(a)*0.75,0,-Math.cos(a)*0.75); }
      const gaps=[]; bridges.forEach(b=>{ if(b.da===di) gaps.push(b.a); if(b.db===di) gaps.push(b.b); }); ladders.forEach(L=>{ if(L.deck===di) gaps.push([L.x+0.5+L.dx*0.5,L.y+0.5+L.dy*0.5]); });
      const gap=(x,z)=>gaps.some(([gx,gz])=>Math.hypot(x-gx,z-gz)<0.95);
      const side=(ax,az,bx,bz)=>{ const L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/1.0)); let prev=null;
        for(let i=0;i<=n;i++){ const x=ax+(bx-ax)*i/n, z=az+(bz-az)*i/n; if(gap(x,z)){ prev=null; continue; }
          B(0.1,1.0,0.1,0x6a4a2c,x,T,z,dg); if(prev){ const rl=B(Math.abs(x-prev[0])+0.1,0.07,Math.abs(z-prev[1])+0.1,0x7a5a36,(x+prev[0])/2,T+0.92,(z+prev[1])/2,dg); B(Math.abs(x-prev[0])+0.06,0.05,Math.abs(z-prev[1])+0.06,0x7a5a36,(x+prev[0])/2,T+0.5,(z+prev[1])/2,dg); }
          prev=[x,z]; } };
      side(x0+0.08,z0+0.08,x1-0.08,z0+0.08); side(x0+0.08,z1-0.08,x1-0.08,z1-0.08); side(x0+0.08,z0+0.08,x0+0.08,z1-0.08); side(x1-0.08,z0+0.08,x1-0.08,z1-0.08);
      // a lantern or two hung from the rail
      [[x0+0.3,z1-0.3],[x1-0.3,z0+0.3]].forEach(([x,z],k)=>{ if(gap(x,z)) return; B(0.05,0.5,0.05,0x2a2a2a,x,T+1.0,z,dg); Sp(0.12,glow(0xffcf6a),x,T+1.32,z,dg,8,6); });
      shade(dg); mergeStatic(dg);
      HOUSES.filter(b=>b.deck===di).forEach(b=>house(b,d,dg));
      d.f=own(dg); });
    // ── a house on a deck: plank walls and corner posts, a steep shingled roof, round windows; the chapel taller, a bell-cote
    //   with its cross over the door — dark and thorn-grown while its general is bound, its windows lit gold once cleansed ──
    function house(b,d,par){ const ch=b.style==='chapel', cx=b.x+b.w/2, cz=b.y+b.h/2, Wd=b.w-0.3, Dp=b.h-0.3, Hw=ch?3.2:2.3, Hr=ch?2.6:1.5, dx=b.door.x+0.5-cx;
      const make=(dark)=>{ const g=group(cx,d.top,cz,par), wall=dark?0x5a4632:ch?0x9a7a50:0x8e6c44, post=dark?0x3a2a1e:0x5a3e24, roof=dark?0x3a3a2c:(hsh(b.x,b.y)<0.5?0x5e6e38:0x6a4a2e);
        B(Wd,Hw,Dp,wall,0,0,0,g); for(let k=1;k<5;k++) B(Wd+0.03,0.04,Dp+0.03,post,0,k*Hw/5,0,g);
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>B(0.2,Hw+0.05,0.2,post,a*Wd/2,0,c*Dp/2,g));
        const rf=prism(Dp+0.8,Hr,Wd+0.7,roof); rf.rotation.y=Math.PI/2; rf.position.y=Hw; g.add(rf);
        const gb=prism(Dp+0.02,Hr-0.08,Wd+0.04,wall); gb.rotation.y=Math.PI/2; gb.position.y=Hw; g.add(gb);
        B(0.95,1.8,0.08,0x3a2414,dx,0,Dp/2+0.02,g); B(1.15,0.12,0.12,post,dx,1.8,Dp/2+0.04,g);
        const win=dark?0x2a1a34:0xffd890, wm=dark?mt(win):glow(win);
        [-1,1].forEach(sd=>{ const wx=dx+sd*Math.min(Wd/3,1.4); if(Math.abs(wx)>Wd/2-0.3) return; const w=new THREE.Mesh(new THREE.CircleGeometry(0.26,12),wm); w.position.set(wx,1.3,Dp/2+0.05); g.add(w); const fr=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.04,5,14),mt(post)); fr.position.copy(w.position); g.add(fr); });
        if(ch){ const rw=new THREE.Mesh(new THREE.CircleGeometry(0.42,16),wm); rw.position.set(dx,Hw+0.75,Dp/2+0.08); g.add(rw); const rr=new THREE.Mesh(new THREE.TorusGeometry(0.45,0.05,5,18),mt(post)); rr.position.copy(rw.position); g.add(rr);
          const bc=group(dx,Hw+Hr-0.5,Dp/2-0.6,g); [-0.35,0.35].forEach(o=>B(0.1,1.0,0.1,post,o,0,0,bc)); const br2=prism(1.0,0.5,0.9,roof); br2.position.y=1.0; bc.add(br2); Cy(0.16,0.22,0.3,8,dark?0x4a4a44:0xc8a040,0,0.55,0,bc);
          B(0.08,0.62,0.08,dark?0x4a4440:0xe8d090,0,1.45,0,bc); B(0.36,0.08,0.08,dark?0x4a4440:0xe8d090,0,1.8,0,bc);
          if(dark){ [-0.3,0.3].forEach((o,k)=>{ const bd=B(1.3,0.14,0.06,0x2a1a10,dx,0.6+k*0.55,Dp/2+0.1,g); bd.rotation.z=k?-0.5:0.5; });   // barred
            for(let i=0;i<9;i++){ const a=hsh(i,b.x), s=Sp(0.22+hsh(b.y,i)*0.2,0x2a2018,(a-0.5)*Wd,hsh(i,7)*Hw,Dp/2+0.1,g,6,5); s.scale.z=0.5; } } }
        else { const lt=group(dx+0.8,1.9,Dp/2+0.25,g); B(0.04,0.3,0.04,0x2a2a2a,0,0,0,lt); Sp(0.1,glow(0xffcf6a),0,-0.06,0,lt,8,6); }
        shade(g); mergeStatic(g); return g; };
      if(!ch){ make(false); return; }
      const lit=make(false), dark=make(true); world.anim.push(()=>{ const on=!!(world.chapelLit&&world.chapelLit(b)); lit.visible=on; dark.visible=!on; }); }
    // ── the rope bridges: planks on a sagging line, rope hand-lines and hangers, posts at both ends; they sway ──
    bridges.forEach((b,bi)=>{ const mx=(b.a[0]+b.b[0])/2, mz=(b.a[1]+b.b[1])/2, py=(b.ya+b.yb)/2+0.95, g=group(mx,py,mz,scene); g.rotation.y=Math.atan2(-b.dz,b.dx);
      const sw=group(0,0,0,g); b.g=sw; const n=Math.max(4,Math.round(b.L/0.36)), w=b.w;
      for(let i=0;i<=n;i++){ const u=i/n, s=(u-0.5)*b.L, y=bY(b,u)-py; const pl=B(0.28,0.07,w-0.1+(hsh(i,bi)-0.5)*0.1,PLANK[(i+bi)%4],s,y-0.07,(hsh(bi,i)-0.5)*0.05,sw); pl.rotation.y=(hsh(i,bi*3)-0.5)*0.08; }
      [-1,1].forEach(sd=>{ const pts=[]; for(let i=0;i<=16;i++){ const u=i/16; pts.push(new THREE.Vector3((u-0.5)*b.L,bY(b,u)-py+0.95+b.sag*0.35*Math.sin(Math.PI*u),sd*w/2)); }
        const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,0.035,5,false),mt(0xb09868)); sw.add(tube);
        const lo=[]; for(let i=0;i<=16;i++){ const u=i/16; lo.push(new THREE.Vector3((u-0.5)*b.L,bY(b,u)-py-0.02,sd*(w/2-0.04))); } sw.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lo),24,0.03,4,false),mt(0x9a8458)));
        for(let i=1;i<8;i++){ const u=i/8, y0=bY(b,u)-py, y1=y0+0.95+b.sag*0.35*Math.sin(Math.PI*u); Cy(0.015,0.015,y1-y0,4,0xb09868,(u-0.5)*b.L,y0,sd*w/2,sw); } });
      [[b.a,b.ya],[b.b,b.yb]].forEach(([p,y])=>{ const nx=-b.dz/b.L, nz=b.dx/b.L; [-1,1].forEach(sd=>{ Cy(0.07,0.08,1.25,6,0x5a3e24,p[0]+nx*sd*w/2,y,p[1]+nz*sd*w/2,scene); }); });
      shade(g); });
    // ── the ladders: from the forest floor to a gap in the rail ──
    ladders.forEach(L=>{ const ex=L.x+0.5+L.dx*0.5, ez=L.y+0.5+L.dy*0.5, gy=G0(ex+L.dx*0.6,ez+L.dy*0.6), hiY=L.ground?G0(ex-L.dx*0.6,ez-L.dy*0.6):decks[L.deck].top, Hh=hiY-gy;
      const g=group(ex+L.dx*0.18,gy,ez+L.dy*0.18,scene); g.rotation.y=Math.atan2(L.dx,L.dy); g.rotation.x=0;
      [-0.3,0.3].forEach(o=>B(0.08,Hh+1.0,0.08,0x6a4a2a,o,0,0,g)); for(let i=0;i<Math.floor((Hh+0.7)/0.34);i++) B(0.62,0.05,0.07,0x7a5a32,0,0.28+i*0.34,0,g); shade(g);
      L.foot={x:ex+L.dx*1.05,z:ez+L.dy*1.05}; L.top={x:ex-L.dx*0.75,z:ez-L.dy*0.75}; L.line={x:ex+L.dx*0.42,z:ez+L.dy*0.42}; L.lo=G0(L.foot.x,L.foot.z); L.hi=L.ground?G0(L.top.x,L.top.z):hiY; });
    const go=(L,goUp)=>{ if(climb||ENGINE.busy) return; if(world.mounted&&world.mounted()){ UI.toast('🐴 Leave your mount at the foot of the tree — it won’t climb a ladder.',2000); return; }
      if(ENGINE.K.sheathe) ENGINE.K.sheathe(); const dur=0.45+(L.hi-L.lo)*0.26; P.x=L.line.x; P.z=L.line.z; P.face=Math.atan2(-L.dx,-L.dy);
      climb={L,u:0,dur,up:goUp,y:goUp?L.lo:L.hi}; ENGINE.hold(dur+0.05,'climb'); if(typeof SFX!=='undefined') try{ SFX.play('stairStep'); }catch(e){} };
    ladders.forEach(L=>{ world.spots.push({x:L.foot.x,z:L.foot.z,r:1.1,label:'Climb',who:L.ground?'A ladder up the rock':'A ladder up the tree',hide:()=>up||!!climb||(L.ground&&P.y>L.lo+1.2),action:()=>go(L,true)});
      world.spots.push({x:L.top.x,z:L.top.z,r:0.95,label:'Climb down',who:'The ladder',hide:()=>(L.ground?up||P.y<L.hi-1.0:!up)||!!climb,action:()=>go(L,false)}); });
    // ── V204: houses cut into the rock (b.cave): the building's footprint is a mass of the cliff it stands against, its front
    //   a face of dressed stone with an arched door, lit windows, a timber porch roof on two posts, a lantern ──
    WD.buildings.filter(b=>b.cave).forEach(b=>{ const fz=b.y+b.h, cx=b.x+b.w/2, gy=G0(b.door.x+0.5,fz+0.6), top=Math.max(gy+2.6,G0(cx,b.y-0.8)+0.3), g=group(0,0,0,scene), ST=[0x8a8478,0x7e786c,0x948e82,0x6e6a62], Hh=top-gy;
      // the rock: boulders heaped over the whole footprint up to the cliff top, overhanging the front above the door
      for(let i=0;i<b.w*2;i++) for(let j=0;j<3;j++){ const s=0.6+hsh(i+j*7,b.x)*0.35, x=b.x+0.35+i*(b.w-0.7)/(b.w*2-1)+(hsh(i,j)-0.5)*0.2, z=b.y+0.3+j*(b.h-0.55)/2, y=j===2?gy+2.35+s*0.5+hsh(j,i)*(Hh-2.6):gy+(0.3+hsh(i,j+3)*0.7)*Hh;
        const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mt(ST[(i+j)%4])); r.scale.set(1.0,j===2?0.7:Math.max(0.8,Hh/(s*2.2)),0.9); r.position.set(x,Math.min(y,top-0.2),Math.min(z,fz-0.2)); r.rotation.set(hsh(i,9)*0.5,hsh(j,i)*3,0); g.add(r); }
      // the front: dressed stone round an arched door, two lit windows, a timber hood over the door on two posts, a lantern
      const fw=b.w-0.5; B(fw,2.3,0.25,0x9a948a,cx,gy,fz-0.3,g); B(fw+0.1,0.16,0.3,0x7a7468,cx,gy+2.3,fz-0.28,g); for(let k=1;k<4;k++) B(fw+0.02,0.04,0.27,0x7e786c,cx,gy+k*0.58,fz-0.3,g);
      const dx=b.door.x+0.5; B(0.95,1.65,0.05,0x3a2414,dx,gy,fz-0.15,g); const ar=new THREE.Mesh(new THREE.CircleGeometry(0.475,12,0,Math.PI),mt(0x3a2414)); ar.position.set(dx,gy+1.65,fz-0.15); g.add(ar);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.08,5,12,Math.PI),mt(0x6e6a62)); ring.position.set(dx,gy+1.65,fz-0.13); g.add(ring); [-0.55,0.55].forEach(o=>B(0.16,1.65,0.12,0x6e6a62,dx+o,gy,fz-0.13,g));
      [-1,1].forEach(sd=>{ const wx=dx+sd*1.15; if(Math.abs(wx-cx)>fw/2-0.3) return; const w=B(0.42,0.46,0.04,0xffd890,wx,gy+0.95,fz-0.16,g); w.material=glow(0xffd890); B(0.5,0.06,0.08,0x5a3e24,wx,gy+0.9,fz-0.13,g); B(0.06,0.5,0.08,0x5a3e24,wx,gy+0.93,fz-0.13,g); });
      const pr=B(1.6,0.07,0.9,0x6a4a2e,dx,gy+2.15,fz+0.25,g); pr.rotation.x=0.32; [-0.7,0.7].forEach(o=>Cy(0.05,0.06,2.05,6,0x5a3e24,dx+o,gy,fz+0.6,g));
      const lt=group(dx+0.75,gy+1.85,fz-0.05,g); B(0.04,0.25,0.04,0x2a2a2a,0,0,0,lt); Sp(0.09,glow(0xffcf6a),0,-0.05,0,lt,8,6);
      for(let i=0;i<3;i++){ const sn=Sp(0.45+hsh(i,b.x)*0.3,0xeef3f8,b.x+0.6+i*(b.w-1.2)/2,top-0.05,fz-0.7,g,8,5); sn.scale.y=0.3; }   // snow lying on the rock
      shade(g); mergeStatic(g); });
    // ── V204.2: houses of fitted stone, as the Andes build (b.inca): walls of grey blocks laid in courses, each a little
    //   different, a trapezoid door under a lintel stone, trapezoid niches for windows, a steep roof of thatch on stone gables ──
    WD.buildings.filter(b=>b.inca).forEach(b=>{ const g=group(0,0,0,scene), SC=[0x9a968c,0x8e8a80,0xa8a498,0x86827a,0x948f84], inn=b.style==='inn', Hw=inn?3.1:2.3, Hr=inn?2.2:1.8;
      const x0=b.x+0.15, x1=b.x+b.w-0.15, z0=b.y+0.15, z1=b.y+b.h-0.15, dxc=b.door.x+0.5, gy=G0(dxc,b.y+b.h+0.6), TH=0.36;
      const wall=(ax,az,bx,bz,door)=>{ const L=Math.hypot(bx-ax,bz-az), ux=(bx-ax)/L, uz=(bz-az)/L; let yy=0, r=0;
        while(yy<Hw-0.05){ const h=Math.min(Hw-yy,0.24+hsh(r,b.x+b.y)*0.12); let s=(r%2)*0.22;
          if(s>0){ B(ux?s-0.03:TH,h-0.025,uz?s-0.03:TH,SC[r%5],ax+ux*s/2,gy+yy,az+uz*s/2,g); }
          while(s<L-0.01){ const w=Math.min(L-s,0.4+hsh(r*7+Math.round(s*10),b.x*3+b.y)*0.32), cxp=ax+ux*(s+w/2), czp=az+uz*(s+w/2);
            const inDoor=door&&Math.abs(cxp-dxc)<0.62-(yy/2.0)*0.18&&yy<1.95;
            if(!inDoor) B(ux?w-0.03:TH,h-0.025,uz?w-0.03:TH,SC[(r+Math.round(s*3))%5],cxp,gy+yy,czp,g); s+=w; }
          yy+=h; r++; } };
      wall(x0,z1,x1,z1,true); wall(x0,z0,x1,z0,false); wall(x0,z0+TH/2,x0,z1-TH/2,false); wall(x1,z0+TH/2,x1,z1-TH/2,false);
      B(1.4,0.28,TH+0.04,0x7e7a70,dxc,gy+1.95,z1,g);   // the lintel
      const trap=(w0,w1,h)=>{ const s=new THREE.Shape(); s.moveTo(-w0/2,0); s.lineTo(w0/2,0); s.lineTo(w1/2,h); s.lineTo(-w1/2,h); s.closePath(); return new THREE.ShapeGeometry(s); };
      const dk=new THREE.Mesh(trap(1.0,0.72,1.95),mt(0x1e1612)); dk.position.set(dxc,gy,z1-0.05); g.add(dk);
      [[x0+0.7,z1+TH/2+0.01,0],[x1-0.7,z1+TH/2+0.01,0],[x0-TH/2-0.01,(z0+z1)/2,-Math.PI/2],[x1+TH/2+0.01,(z0+z1)/2,Math.PI/2]].forEach(([wx,wz,ry],k)=>{ if(k<2&&Math.abs(wx-dxc)<1.0) return;
        const n=new THREE.Mesh(trap(0.5,0.36,0.62),k<2?glow(0xffcf7a):mt(0x2a2420)); n.position.set(wx,gy+1.0,wz); n.rotation.y=ry; g.add(n); });
      // the gables in stone, the thatch over them, its ridge, the pegs that held it down
      const Wd=x1-x0, Dp=z1-z0, gb=prism(Dp+TH,Hr,Wd*0.02+TH,0x8e8a80); gb.rotation.y=Math.PI/2; [x0,x1].forEach(xx=>{ const q=gb.clone(); q.position.set(xx,gy+Hw,(z0+z1)/2); g.add(q); });
      const th=prism(Dp+1.0,Hr+0.25,Wd+0.7,0xc8a860); th.rotation.y=Math.PI/2; th.position.set((x0+x1)/2,gy+Hw-0.15,(z0+z1)/2); g.add(th);
      for(let k=1;k<4;k++){ const band=prism((Dp+1.0)*(1-k*0.22)+0.04,0.06,Wd+0.72,0xa88a48); band.rotation.y=Math.PI/2; band.position.set((x0+x1)/2,gy+Hw-0.15+(Hr+0.25)*k*0.22,(z0+z1)/2); g.add(band); }
      B(Wd+0.8,0.14,0.18,0x9a7a40,(x0+x1)/2,gy+Hw+Hr-0.02,(z0+z1)/2,g);
      [-1,1].forEach(sd=>{ for(let i=0;i<3;i++) Cy(0.04,0.04,0.3,4,0x8e8a80,x0+0.4+i*(Wd-0.8)/2,gy+Hw-0.3,(z0+z1)/2+sd*(Dp/2+0.2),g); });
      shade(g); mergeStatic(g); });
    // ── V206: houses on stilts over the water (b.stilts): a plank deck under each, on posts going down into the mere ──
    WD.buildings.filter(b=>b.stilts).forEach(b=>{ const g=group(0,0,0,scene), x0=b.x-0.35, x1=b.x+b.w+0.35, z0=b.y-0.35, z1=b.y+b.h+0.35;
      for(let z=z0+0.15,i=0;z<z1;z+=0.36,i++) B(x1-x0,0.1,0.32,PLANK[i%4],(x0+x1)/2,-0.1,z,g);
      for(let x=x0+0.1;x<=x1;x+=Math.max(0.9,(x1-x0)/4)) [z0+0.1,z1-0.1].forEach(z=>Cy(0.1,0.12,2.2,6,0x3a2e22,x,-2.2,z,g));
      [x0+0.1,x1-0.1].forEach(x=>Cy(0.1,0.12,2.2,6,0x3a2e22,x,-2.2,(z0+z1)/2,g));
      shade(g); mergeStatic(g); });
    // ── V206: the ferry (WD.ferries): a punt poled across open water by its ferryman, to a landing and back ──
    let ride=null; const ferries=[];
    (WD.ferries||[]).forEach((F,fi)=>{ const pts=F.path.map(p=>({x:p[0],z:p[1]})), lens=[]; let L=0; for(let i=1;i<pts.length;i++){ const l=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z); lens.push(l); L+=l; }
      const at=u=>{ let d=u*L; for(let i=0;i<lens.length;i++){ if(d<=lens[i]||i===lens.length-1){ const a=pts[i], b=pts[i+1], t=Math.min(1,d/lens[i]); return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(b.x-a.x,b.z-a.z)}; } d-=lens[i]; } };
      const punt=group(0,0,0,scene), hull=group(0,0,0,punt);
      for(let i=0;i<5;i++) B(0.24,0.08,2.6,PLANK[i%4],-0.5+i*0.25,0.0,0,hull); [-0.62,0.62].forEach(o=>B(0.08,0.22,2.6,0x4a3624,o,-0.05,0,hull)); [-1.3,1.3].forEach(o=>B(1.32,0.2,0.1,0x4a3624,0,-0.04,o,hull));
      B(0.06,1.1,0.06,0x3a2a1e,0.5,0.05,1.15,hull); Sp(0.09,glow(0xffcf6a),0.5,1.12,1.15,hull,8,6);
      const pole=group(0,0,0,punt); const pm=Cy(0.03,0.03,4.2,5,0x8a6a42,0,-2.1,0,pole); shade(punt);
      const man=addPerson(world,scene,F.look||'fisher',0,0,0,F.who,F.over); man.still=true; man.label='Talk';
      const fr={F,at,L,punt,pole,man,side:0}; ferries.push(fr);
      const WY=-0.12;
      fr.place=side=>{ fr.side=side; const p=at(side?1:0), yaw=side?p.yaw+Math.PI:p.yaw; punt.position.set(p.x,WY,p.z); punt.rotation.y=yaw;
        const bx=p.x-Math.sin(yaw)*0.85, bz=p.z-Math.cos(yaw)*0.85; man.x=bx; man.z=bz; man.y=WY+0.05; man.g.position.set(bx,man.y,bz); man.g.rotation.y=yaw; man.rest=yaw;
        pole.position.set(bx+Math.cos(yaw)*0.35,WY+1.4,bz-Math.sin(yaw)*0.35); pole.rotation.set(0,0,0); };
      fr.place(0);
      man.action=()=>{ if(ride) return; if(world.mounted&&world.mounted()){ UI.toast('🐴 Leave your mount on the jetty — the punt will not take it.',1800); return; }
        const S0=GAME.S, first=!(S0.ferried&&S0.ferried[fi]); ENGINE.speak(F.who,fr.side?F.back:(first&&F.first?F.first:F.over),man,()=>{ (S0.ferried||(S0.ferried={}))[fi]=true;
          const dur=4+L*0.9; ride={fr,u:0,dur,dir:fr.side?-1:1}; ENGINE.hold(dur+0.2); if(ENGINE.K.sheathe) ENGINE.K.sheathe(); }); }; });
    const rideTick=(t,dt)=>{ if(!ride) return; const r=ride, fr=r.fr; r.u=Math.min(1,r.u+dt/r.dur); const e=r.u<0.5?2*r.u*r.u:1-Math.pow(-2*r.u+2,2)/2, s2=r.dir>0?e:1-e, p=fr.at(s2), yaw=r.dir>0?p.yaw:p.yaw+Math.PI, bob=Math.sin(t*1.6)*0.03;
      fr.punt.position.set(p.x,-0.12+bob,p.z); fr.punt.rotation.y=yaw; fr.punt.rotation.z=Math.sin(t*1.1)*0.02;
      const bx=p.x-Math.sin(yaw)*0.85, bz=p.z-Math.cos(yaw)*0.85, push=Math.sin(t*1.8); fr.man.x=bx; fr.man.z=bz; fr.man.y=-0.07+bob; fr.man.g.position.set(bx,fr.man.y,bz); fr.man.g.rotation.y=yaw; fr.man.rest=yaw;
      fr.pole.position.set(bx+Math.cos(yaw)*0.35,-0.12+1.4+bob,bz-Math.sin(yaw)*0.35); fr.pole.rotation.set(-Math.cos(yaw)*0.35*push,0,Math.sin(yaw)*0.35*push);
      P.x=p.x+Math.sin(yaw)*0.55; P.z=p.z+Math.cos(yaw)*0.55; P.face=yaw;
      if(r.u>=1){ ride=null; fr.place(r.dir>0?1:0); const L2=r.dir>0?fr.F.to:fr.F.from; P.x=L2[0]; P.z=L2[1]; P.y=G0(P.x,P.z); GAME.save(); } };
    // ── the people up the trees stand on their decks; while you're up, the folk below can't hear you, and the reverse ──
    const R=TT.rect, inR=(x,z)=>x>=R[0]&&x<=R[2]+1&&z>=R[1]&&z<=R[3]+1;
    WD.villagers.forEach(v=>{ if(v.deck===undefined||!decks[v.deck]) return; const f=world.folk.find(q=>q.key==='v:'+v.x+','+v.y+':'+v.outfit); if(!f) return; f.tUp=true; f.y=decks[v.deck].top+0.02; f.g.position.y=f.y; });
    // ── the world, wrapped ──
    world.treeUp=()=>up; world.treetops={decks,bridges,ladders,deckAt,bridgeAt,get up(){ return up; },set up(v){ up=!!v; }};
    world.ground=(x,z)=>{ if(climb) return climb.y; if(ride&&Math.hypot(x-P.x,z-P.z)<0.01) return -0.02; if(up){ const d=deckAt(x,z); if(d) return d.top; const q=bridgeAt(x,z); if(q) return bY(q.b,q.u)+(q.b===onB?Math.sin(performance.now()*0.006)*0.035*Math.sin(Math.PI*q.u):0); } return G0(x,z); };
    const hitC=(cs,fx,fz,tx,tz)=>{ for(const c of cs){ const dT=Math.hypot(tx-c.x,tz-c.z); if(dT<c.r+0.22&&dT<Math.hypot(fx-c.x,fz-c.z)) return true; } return false; };
    world.canMove=(fx,fz,tx,tz)=>{ if(climb||ride) return false;
      if(up){ if(!(deckAt(tx,tz,0.28)||bridgeAt(tx,tz,0.22))) return false; if(hitC(upC,fx,fz,tx,tz)) return false;
        for(const r of upR) if(tx>r.x0-0.22&&tx<r.x1+0.22&&tz>r.z0-0.22&&tz<r.z1+0.22&&!(fx>r.x0-0.22&&fx<r.x1+0.22&&fz>r.z0-0.22&&fz<r.z1+0.22)) return false;
        return true; }
      if(inR(tx,tz)&&hitC(downC,fx,fz,tx,tz)) return false; return M0(fx,fz,tx,tz); };
    const OE=world.onEnter; world.onEnter=sp=>{ climb=null; ride=null; ferries.forEach(fr=>{ const a=fr.F.from, b=fr.F.to, x=sp?sp.x:P.x, z=sp?sp.z:P.z; fr.place(Math.hypot(x-b[0],z-b[1])<Math.min(14,Math.hypot(x-a[0],z-a[1]))?1:0); }); const S0=GAME.S, at=S0&&S0.at;
      up=!!sp&&(sp.up===true||(!!S0.atUp&&!!at&&Math.abs(sp.x-at.x)<0.01&&Math.abs(sp.z-at.z)<0.01))&&!!(deckAt(sp.x,sp.z)||bridgeAt(sp.x,sp.z));
      if(up) P.y=world.ground(P.x,P.z); if(OE) OE(sp); };
    world.anim.push((t,dt)=>{ dt=dt||0.016; const S0=GAME.S; rideTick(t,dt);
      if(climb){ const c=climb, L=c.L; c.u=Math.min(1,c.u+dt/c.dur); c.y=c.up?L.lo+(L.hi-L.lo)*c.u:L.hi+(L.lo-L.hi)*c.u; P.x=L.line.x; P.z=L.line.z;
        if(c.u>=1){ climb=null; if(!L.ground) up=c.up; if(c.up){ P.x=L.top.x; P.z=L.top.z; P.y=L.hi; } else { P.x=L.foot.x; P.z=L.foot.z; P.y=L.lo; } P.face=Math.atan2(c.up?-L.dx:L.dx,c.up?-L.dy:L.dy); } }
      if(up&&!climb&&P.y<world.ground(P.x,P.z)-2.5) up=false;   /* (fallen, somehow: back on the ground) */
      if(S0) S0.atUp=up;
      // the bridges sway: a little always, more under your feet
      const q=up&&!climb?bridgeAt(P.x,P.z):null; onB=q?q.b:null;
      bridges.forEach((b,i)=>{ const want=(b===onB?0.075:0.022); b.sw+=(want-b.sw)*Math.min(1,dt*2.5); if(b.g) b.g.rotation.x=Math.sin(t*1.25+i*1.7)*b.sw+(b===onB?Math.sin(t*2.7)*b.sw*0.35:0); });
      // a deck over your head as you walk under it fades, and the high crowns when the camera is up among the leaves
      const cam=ENGINE.cam;
      decks.forEach(d=>{ const near=!up&&P.x>d.x0-2.5&&P.x<d.x1+3.5&&P.z>d.y0-2.5&&P.z<d.y1+3.5; d.f.want=near?0.28:1;
        const c=d.crown; c.f.want=(cam.position.y>c.y0-1.5&&Math.hypot(cam.position.x-c.x,cam.position.z-c.z)<c.r+1.5)||(up&&Math.hypot(P.x-c.x,P.z-c.z)<c.r*0.8)?0.3:1; });
      fades.forEach(f=>{ if(Math.abs(f.cur-f.want)<0.01) return; f.cur+=(f.want-f.cur)*Math.min(1,dt*6); if(Math.abs(f.cur-f.want)<0.01) f.cur=f.want; const tr=f.cur<0.99;
        f.mats.forEach(m=>{ if(m.transparent!==tr){ m.transparent=tr; m.depthWrite=!tr; m.needsUpdate=true; } m.opacity=f.cur; }); });
      // up a tree, the folk below are out of earshot (and you of theirs); on the ground, the same for those above
      world.folk.forEach(f=>{ if(f._phide||!inR(f.x,f.z)) return; const m=!!f.tUp!==up; if(f.mute!==m){ f.mute=m; f.ghost=m; } }); });
  }
  return {attach};
})();
