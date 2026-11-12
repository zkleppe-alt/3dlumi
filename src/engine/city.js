// ════════════════════════════════════════════════════════════════
//  CITY — an extracted KLK town (tools/extract.py) as a walkable level.
//  buildCity(D, opt) where D is cities/<name>.json and opt is
//    { id, name, spawn:[worldX,worldY], zone(worldY, elev)→string, enter(building)→fn|null, sky }
//  Heights, the walk mask and the stair/ledge rules all come from the game itself.
// ════════════════════════════════════════════════════════════════
const TIER=0.75;                         // one terrace, in world units
const STAIRS=new Set([10,11,8]);         // KLK's STAIR_TILES: a stair or gate bridges one level
// how each building style looks from the street (a town can override any of these)
const ROYAL=0x4a6ab0, STONE=0xa8a49b, STONE_D=0x8a867e, PLASTER=0xece2c8, TIMBER=0x6b4a2e, ROOF=0x8e4a36, GOLD=0xf2c14e;
// the front door: a frame, a lintel and a stone step that stay put, and the leaf itself hung on a hinge so it can swing
// open as you come to it (returned; its parts are kept out of the building's bake so they can move)
function doorFace(par,dx,d,h){ h=h||1.0; const z=d/2+0.02; [-1,1].forEach(sd=>B(0.08,h+0.04,0.1,0x3a2a1a,dx+sd*0.37,0,z+0.01,par));
  B(0.86,0.1,0.11,0x3a2a1a,dx,h,z+0.01,par); B(0.9,0.07,0.32,0x9a958c,dx,0,z+0.17,par); B(0.64,h-0.02,0.01,0x140e0a,dx,0,z+0.004,par);   // frame, lintel, step, the dark beyond
  const hinge=group(dx-0.33,0,z,par), leaf=[B(0.66,h,0.06,bmat(0x6a4426,'plank'),0.33,0,0,hinge),B(0.5,0.035,0.02,0x2a2018,0.33,h*0.3,0.04,hinge),B(0.5,0.035,0.02,0x2a2018,0.33,h*0.72,0.04,hinge),Sp(0.032,0xd8b24a,0.53,h*0.5,0.05,hinge,6,4)];
  leaf.forEach(m=>m.userData.keep=true); hinge.userData.isDoor=true; return hinge; }
function crenel(par,w,d,y,c){ for(let i=-w/2+0.25;i<=w/2-0.2;i+=0.5){ B(0.28,0.3,0.28,c,i,y,d/2-0.14,par); B(0.28,0.3,0.28,c,i,y,-d/2+0.14,par); }
  for(let j=-d/2+0.75;j<=d/2-0.7;j+=0.5){ B(0.28,0.3,0.28,c,w/2-0.14,y,j,par); B(0.28,0.3,0.28,c,-w/2+0.14,y,j,par); } }
// doors swing in as you come up to one you may enter, and close behind you as you go
function doorSwing(lv){ lv.anim.push((t,dt)=>{ if(ENGINE.level!==lv) return; const P=ENGINE.P; dt=dt||0.016;
  lv.spots.forEach(s=>{ if(!s.hinges) return; const want=Math.hypot(s.x-P.x,s.z-P.z)<2.0?1:0; s._open=(s._open||0)+(want-(s._open||0))*Math.min(1,dt*(want?5:3)); s.hinges.forEach(h=>h.rotation.y=s._open*1.65); }); }); }
// ── stairs ── KLK's stair tiles come in pairs that bridge one terrace (each ramps half of it), or alone against a terrace
// (it ramps the whole). stairMap finds each one's run; stairBoxes draws it as real steps: fine treads with a pale nosing
// on each, and a low cheek wall on any side that isn't more stair. The walk itself stays the smooth ramp of ground().
function stairMap(W,H,T,E,open){ const SD=new Map(), st=t=>t===10||t===11, D4=[[0,1],[0,-1],[1,0],[-1,0]], inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  // each stair ramps along the run it belongs to: from half a terrace below its own (if there's stair below it) to half a
  // terrace above (if there's stair above) — so a long flight is one even slope — or a whole terrace when it stands alone
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(T(x,y)===8){ const e=E(x,y);   // a gate on a stair (KLK counts it one): a whole flight through it when the ground falls away both sides
      for(const [dx,dy] of [[0,1],[1,0]]){ const a=inb(x+dx,y+dy)&&open(x+dx,y+dy)?E(x+dx,y+dy)-e:null, b=inb(x-dx,y-dy)&&open(x-dx,y-dy)?E(x-dx,y-dy)-e:null;
        if(a===1&&b===-1){ SD.set(y*W+x,{dx,dy,up:true,lo:-1,hi:1,full:true}); break; } if(a===-1&&b===1){ SD.set(y*W+x,{dx:-dx,dy:-dy,up:true,lo:-1,hi:1,full:true}); break; } } continue; }
    if(!st(T(x,y))) continue; const e=E(x,y); let got=null;
    for(const [dx,dy] of [[0,1],[1,0]]){ const up=[[dx,dy],[-dx,-dy]].find(([a,b])=>inb(x+a,y+b)&&st(T(x+a,y+b))&&E(x+a,y+b)===e+1), dn=[[dx,dy],[-dx,-dy]].find(([a,b])=>inb(x+a,y+b)&&st(T(x+a,y+b))&&E(x+a,y+b)===e-1);
      if(up||dn){ const dir=up||[-dn[0],-dn[1]]; got={dx:dir[0],dy:dir[1],up:true,lo:dn?-0.5:0,hi:up?0.5:0}; break; } }
    if(!got) for(const [dx,dy] of D4){ const nx=x+dx,ny=y+dy; if(!inb(nx,ny)||st(T(nx,ny))||!open(nx,ny)) continue; const d=E(nx,ny)-e;
      if(d===1){ got={dx,dy,up:true,lo:0,hi:1,full:true}; break; } if(d===-1){ got={dx:-dx,dy:-dy,up:true,lo:-1,hi:0,full:true}; break; } }
    if(got) SD.set(y*W+x,got); }
  return SD; }
function stairBoxes(x,y,d,gnd,isSt,emit,col){ col=col||{}; const at=s=>[d.dx?(d.dx>0?x+s:x+1-s):x+0.5, d.dy?(d.dy>0?y+s:y+1-s):y+0.5];
  const [ax,az]=at(0.001), [bx,bz]=at(0.999), rise=Math.abs(gnd(bx,bz)-gnd(ax,az)), n=Math.max(3,Math.min(10,Math.round(rise/0.16))), L=1/n;
  const side=[-1,1].map(sd=>!isSt(x+(d.dy?sd:0),y+(d.dx?sd:0))), wid=1-(side[0]?0.12:0)-(side[1]?0.12:0), off=((side[0]?0.12:0)-(side[1]?0.12:0))/2;
  const box=(s,len,yb,h,c,w,o)=>{ const [fx,fz]=at(s); emit({x:fx+(d.dy?o:0),z:fz+(d.dx?o:0),y:yb,h,c,sx:d.dx?len:w,sz:d.dx?w:len}); };
  for(let i=0;i<n;i++){ const sc=(i+0.5)/n, [fx,fz]=at(sc), h=gnd(fx,fz);
    box(sc,L,-0.4,h+0.4,i%2?(col.a||0xb8ae98):(col.b||0xaea48e),wid,off);
    const lo=d.up?i/n+0.03:(i+1)/n-0.03; box(lo,0.06,h-0.05,0.07,col.nose||0xd6ccb6,wid,off);                       // the worn pale nosing on the step's front
    side.forEach((on,k)=>{ if(on) box(sc,L+0.002,-0.4,h+0.4+0.3,col.cheek||0x8e877a,0.12,(k?1:-1)*0.44); }); }       // the cheek walls, stepping with it
}
  // a ship: a lofted hull (sheer rising to the bow and the stern, the sides tumbling home), planked and banded in the realm's
  // colours, a stern castle with its lantern, a forecastle, masts with yards and bellied sails, shrouds, a bowsprit and the ensign
function hullGeo(L,Wd){ const pos=[], col=[], N=14, prof=[[1,0.55],[0.98,0.3],[0.9,0.0],[0.7,-0.3],[0.35,-0.52],[0,-0.58]];   // half-section: [width, height]
    const sec=u=>{ const b=u>0.62?Math.max(0.04,Math.cos((u-0.62)/0.38*Math.PI/2)):u<0.08?0.82+u/0.08*0.18:1, sh=0.16*Math.pow(Math.abs(u-0.45)/0.55,2)*2; return {b,sh}; };   // u: 0 stern → 1 bow
    const C=(h)=>h>0.42?[0.17,0.25,0.5]:h>0.3?[0.85,0.68,0.25]:h>-0.05?[0.4,0.27,0.16]:h>-0.2?[0.55,0.18,0.12]:[0.24,0.17,0.12];   // a royal strake, a gilt band, planking, the boot-top, the tarred bottom
    const P=(i,j,sd)=>{ const u=i/N, {b,sh}=sec(u), [w,h]=prof[j]; return [(u-0.5)*L+(u>0.62?Math.pow((u-0.62)/0.38,1.6)*0.5:0), h+sh*(1-j/prof.length*0.7), sd*w*b*Wd/2]; };
    for(let i=0;i<N;i++) for(let j=0;j<prof.length-1;j++) for(const sd of [-1,1]){ const a=P(i,j,sd), b=P(i+1,j,sd), c=P(i+1,j+1,sd), d=P(i,j+1,sd), q=sd>0?[a,b,c,a,c,d]:[a,c,b,a,d,c];
      q.forEach(v=>{ pos.push(...v); col.push(...C(v[1])); }); }
    for(const sd of [-1,1]) for(let j=0;j<prof.length-1;j++){ const a=P(0,j,sd), b=P(0,j+1,sd), c=P(0,j+1,-sd), d=P(0,j,-sd); [a,b,c,a,c,d].forEach(v=>{ pos.push(...v); col.push(0.36,0.24,0.14); }); }   // the transom
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); return g; }
const hullMat=detailify(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),{mode:'plank'}), sailMat=new THREE.MeshLambertMaterial({color:0xf3ead6,side:THREE.DoubleSide});
function sailGeo(w,h,belly){ const g=new THREE.PlaneGeometry(w,h,6,4), p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i)/w*2, y=p.getY(i)/h*2; p.setZ(i,belly*(1-x*x)*(1-y*y*0.6)); } g.computeVertexNormals(); return g; }
function shipModel(Ln,wide){ const Wd=wide?2.0:1.15, g=new THREE.Group(), GOLDc=0xf2c14e, ROY=0x2c4c9e, wood=0x6b4a2e, dk=0x4a3220;
    const hull=new THREE.Mesh(hullGeo(Ln,Wd),hullMat); hull.position.y=0.05; g.add(hull);
    B(Ln*0.82,0.06,Wd*0.82,bmat(0x9a7a50,'plank'),-Ln*0.04,0.48,0,g);                                                       // the deck
    [-1,1].forEach(sd=>B(Ln*0.8,0.14,0.05,dk,-Ln*0.04,0.54,sd*Wd*0.45,g));                                                     // the rails
    const sx=-Ln/2+0.75; B(1.3,0.7,Wd*0.86,bmat(wood,'plank'),sx,0.5,0,g); B(1.36,0.05,Wd*0.88,bmat(0x9a7a50,'plank'),sx,1.2,0,g); [-1,1].forEach(sd=>{ B(1.4,0.08,0.06,GOLDc,sx,1.2,sd*Wd*0.45,g); B(0.06,0.08,Wd*0.9,GOLDc,sx+sd*0.69,1.2,0,g); }); [-1,1].forEach(sd=>B(1.3,0.18,0.05,dk,sx,1.28,sd*Wd*0.44,g));   // the stern castle
    for(let i=0;i<3;i++) B(0.03,0.22,0.16,0xffd27a,sx-0.66,0.7,(i-1)*0.32*Wd/1.15,g);                                       // its stern windows, lit
    Cy(0.03,0.03,0.5,5,dk,sx-0.6,1.28,0,g); const lan=Sp(0.11,glow(0xffd88a),sx-0.6,1.86,0,g);                               // the stern lantern
    B(0.9,0.36,Wd*0.62,bmat(wood,'plank'),Ln/2-0.85,0.52,0,g);                                                                 // the forecastle
    const bs=Cy(0.035,0.05,1.6,5,dk,Ln/2+0.1,0.75,0,g); bs.rotation.z=-1.2; bs.position.set(Ln/2+0.55,0.95,0);               // the bowsprit
    const masts=Ln>5?[-Ln*0.14,Ln*0.2]:[0.15], tall=wide?4.4:3.4;
    masts.forEach((mx,i)=>{ const h=tall*(i===0&&masts.length>1?1:0.9); Cy(0.055,0.09,h,7,dk,mx,0.5,0,g); Cy(0.12,0.12,0.12,8,dk,mx,0.5+h*0.72,0,g);   // mast and its top
      for(const [yy,w2,hh] of [[0.5+h*0.36,Wd*1.15,h*0.34],[0.5+h*0.74,Wd*0.85,h*0.24]]){ B(0.05,0.05,w2+0.2,dk,mx+0.05,yy+hh/2+0.05,0,g);   // yards
        const sl=new THREE.Mesh(sailGeo(w2,hh,0.22),sailMat); sl.rotation.y=Math.PI/2; sl.position.set(mx+0.09,yy,0); g.add(sl); }
      B(0.02,0.42,0.3,ROY,mx+0.2,0.5+h*0.36,0,g); B(0.022,0.1,0.62,GOLDc,mx+0.21,0.5+h*0.36,0,g);                              // the cross of the realm on the course
      const fl=B(0.02,0.24,0.5,i?GOLDc:ROY,mx,0.5+h+0.02,0.25,g);                                                               // a pennant at the masthead
      [-1,1].forEach(sd=>{ const sh=Cy(0.008,0.008,h*0.8,3,0x2a2018,mx,0.5,sd*Wd*0.42,g); sh.rotation.x=-sd*Math.atan2(Wd*0.42,h*0.8); sh.position.set(mx,0.5+h*0.4,sd*Wd*0.21); }); });   // shrouds
    { const fs=Cy(0.008,0.008,Math.hypot(Ln/2-masts[masts.length-1],tall*0.75),3,0x2a2018,0,0,0,g); const dx=Ln/2+0.55-masts[masts.length-1], dy=tall*0.8-0.5; fs.rotation.z=Math.atan2(dx,dy); fs.position.set(masts[masts.length-1]+dx/2,0.95+dy/2,0); }   // the forestay
    B(0.02,0.36,0.6,ROY,sx-0.75,1.6,0.32,g); B(0.022,0.08,0.6,GOLDc,sx-0.75,1.6,0.32,g); Cy(0.02,0.02,1.0,4,dk,sx-0.75,1.2,0,g);   // the ensign astern
    return shade(g); }
const BUILDING_STYLES={
  keep(b,g,c){ const w=b.w-0.2,d=b.h-0.2, R=c.roof||ROYAL, st=bmat(STONE,'brick'), sd=bmat(STONE_D,'brick'), rf=bmat(R,'roof');
    if(b.w<6){ B(w,2.6,d,st,0,0,0,g); crenel(g,w,d,2.6,st);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ Cy(0.62,0.7,3.5,12,sd,sx*(w/2-0.3),0,sz*(d/2-0.3),g); Co(0.8,1.3,12,rf,sx*(w/2-0.3),3.5,sz*(d/2-0.3),g); });
      B(0.5,0.9,0.06,R,0,1.3,d/2+0.01,g); return; }
    // King Karl's keep: a great hall, a donjon rising out of it, four tall drum towers under royal cones, the banners of the realm
    B(w+0.3,0.5,d+0.3,sd,0,0,0,g); B(w,4.0,d,st,0,0.5,0,g); B(w+0.12,0.16,d+0.12,sd,0,4.5,0,g); crenel(g,w,d,4.66,st);
    const dw=w*0.5, dd=d*0.55; B(dw,4.0,dd,st,0,4.5,-0.2,g); B(dw+0.12,0.16,dd+0.12,sd,0,8.5,-0.2,g); crenel(g,dw,dd,8.66,st);
    Co(Math.min(dw,dd)*0.5,2.6,4,rf,0,8.96,-0.2,g).rotation.y=Math.PI/4; B(0.06,1.1,0.06,0x3a2a1a,0,11.5,-0.2,g); B(0.7,0.42,0.03,GOLD,0.38,12.1,-0.2,g);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ const x=sx*(w/2-0.15), z=sz*(d/2-0.15); Cy(0.78,0.86,6.6,14,sd,x,0,z,g); B(1.7,0.18,1.7,st,x,6.6,z,g).rotation.y=Math.PI/4;
      Co(1.05,2.6,14,rf,x,6.75,z,g); B(0.05,0.8,0.05,0x3a2a1a,x,9.3,z,g); B(0.42,0.26,0.03,GOLD,x+0.22,9.75,z,g);
      for(const y of [2.4,4.4]) B(0.1,0.5,0.1,0x24262c,x,y,z+sz*0.8,g); });
    for(let i=-2;i<=2;i++){ if(i===0) continue; const x=i*(w/5.2); B(0.12,0.9,0.12,0x24262c,x,2.7,d/2+0.01,g); B(0.12,0.9,0.12,0x24262c,x,6.0,dd/2-0.19,g); }   // tall windows, two storeys
    for(const x of [-1.1,1.1]){ B(0.62,2.4,0.04,R,x,1.6,d/2+0.03,g); B(0.62,0.08,0.05,GOLD,x,4.0,d/2+0.03,g); B(0.18,0.18,0.05,GOLD,x,2.9,d/2+0.05,g); }   // the realm's banners hung either side of the door
    B(1.3,0.14,0.5,sd,0,1.62,d/2+0.2,g); },
  chapel(b,g,c){ const w=b.w-0.6,d=b.h-0.3, roof=0x4f5f84, wc=bmat(0xe4ddcc,'brick'), rf=bmat(roof,'roof'), tz=d/2-0.6;
    if(b.id!=='sg_cathedral'){ B(w,2.0,d,wc,0,0,0,g); const r=prism(w+0.4,1.9,d+0.2,rf); r.position.y=2.0; g.add(r);
      B(1.7,3.6,1.7,wc,0,0,tz,g); Co(1.25,2.4,4,rf,0,3.6,tz,g).rotation.y=Math.PI/4;
      B(0.1,0.8,0.1,GOLD,0,6.0,tz,g); B(0.45,0.1,0.1,GOLD,0,6.45,tz,g);
      const rose=new THREE.Mesh(new THREE.CircleGeometry(0.38,10),glow(GOLD)); rose.position.set(0,2.6,tz+0.86); g.add(rose);
      for(let z=-d/2+0.9;z<d/2-1.5;z+=1.2){ B(0.05,0.8,0.35,0x5f7ab8,w/2+0.01,0.7,z,g); B(0.05,0.8,0.35,0x5f7ab8,-w/2-0.01,0.7,z,g); } return; }
    // Stormgate Cathedral: a high nave on buttresses, an apse behind, and a spire over the west front taller than anything in the realm
    B(w,3.6,d,wc,0,0,0,g); const r=prism(w+0.4,2.6,d+0.2,rf); r.position.y=3.6; g.add(r); B(w+0.1,0.14,d+0.1,bmat(0xc8c0ae,'brick'),0,3.5,0,g);
    Cy(1.1,1.1,3.0,10,wc,0,0,-d/2+0.9,g); Co(1.2,1.8,10,rf,0,3.0,-d/2+0.9,g);
    for(let z=-d/2+0.7;z<tz-0.6;z+=1.1) for(const sx of [-1,1]){ const bt=B(0.3,3.0,0.34,wc,sx*(w/2+0.15),0,z,g); Co(0.2,0.6,4,rf,sx*(w/2+0.15),3.0,z,g).rotation.y=Math.PI/4;
      B(0.05,1.5,0.32,0x5f7ab8,sx*(w/2+0.01),1.2,z+0.55,g); B(0.06,0.06,0.34,GOLD,sx*(w/2+0.02),2.72,z+0.55,g); }   // buttresses, and tall blue glass between
    B(2.0,7.2,1.9,wc,0,0,tz,g); B(2.14,0.16,2.04,bmat(0xc8c0ae,'brick'),0,7.2,tz,g); crenel(g,2.0,1.9,7.36,wc);
    for(const [a,b2] of [[-1,-1],[1,-1],[-1,1],[1,1]]) Co(0.14,0.9,4,rf,a*0.86,7.36,tz+b2*0.82,g);
    Co(0.95,5.4,8,rf,0,7.36,tz,g).rotation.y=Math.PI/8; B(0.12,1.0,0.12,GOLD,0,12.7,tz,g); B(0.56,0.12,0.12,GOLD,0,13.25,tz,g);
    B(0.7,1.3,0.04,0x24262c,0,5.2,tz+0.97,g); for(const x of [-0.45,0.45]) B(0.08,0.9,0.04,0x5f7ab8,x,5.4,tz+0.97,g);   // the belfry's openings
    const rose=new THREE.Mesh(new THREE.CircleGeometry(0.55,14),glow(GOLD)); rose.position.set(0,3.4,tz+0.96); g.add(rose);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.58,0.06,5,14),wc); rim.position.copy(rose.position); g.add(rim);
    B(1.3,0.12,0.2,bmat(0xc8c0ae,'brick'),0,2.1,tz+1.0,g); },
  inn(b,g,c){ const w=b.w-0.3,d=b.h-0.3; B(w,1.1,d,bmat(0xb9b1a2,'brick'),0,0,0,g); B(w+0.15,1.1,d+0.15,bmat(PLASTER,'plaster'),0,1.1,0,g);
    [-w/2+0.1,0,w/2-0.1].forEach(x=>B(0.14,1.1,0.06,TIMBER,x,1.1,d/2+0.09,g)); B(w+0.15,0.12,0.06,TIMBER,0,1.6,d/2+0.09,g);
    const r=prism(w+0.6,1.5,d+0.5,bmat(ROOF,'roof')); r.position.y=2.2; g.add(r);
    B(0.55,0.42,0.06,GOLD,1.3,1.35,d/2+0.5,g); B(0.06,0.06,0.5,TIMBER,1.3,1.8,d/2+0.3,g);
    for(const x of [-1.4,1.4]) _win(g,x,1.45,d/2+0.1,TIMBER); },
  shop(b,g,c){ const w=b.w-0.3,d=b.h-0.3; B(w,1.8,d,bmat(PLASTER,'plaster'),0,0,0,g); const r=prism(w+0.4,1.3,d+0.3,bmat(0x7a3a2c,'roof')); r.position.y=1.8; g.add(r);
    for(let i=0;i<7;i++){ const s=B(w/7,0.08,0.9,i%2?0xf3ead6:0xb8402e,-w/2+w/7*(i+0.5),1.35,d/2+0.42,g); s.rotation.x=0.35; }
    B(1.4,0.55,0.4,0x9a6b3f,-1.6,0,d/2+0.5,g); B(1.4,0.55,0.4,0x9a6b3f,1.6,0,d/2+0.5,g);
    [[-1.9,0xd84a3a],[-1.5,0xf2c14e],[-1.2,0x6cb065],[1.3,0x8a5ab8],[1.7,0xe08a3a]].forEach(([x,col])=>B(0.22,0.18,0.22,col,x,0.55,d/2+0.5,g)); },
  house(b,g,c){ const w=b.w-0.4,d=b.h-0.3; B(w,1.6,d,bmat(PLASTER,'plaster'),0,0,0,g); [-w/2+0.07,w/2-0.07].forEach(x=>B(0.12,1.6,0.06,TIMBER,x,0,d/2+0.02,g));
    const r=prism(w+0.4,1.2,d+0.3,bmat(ROOF,'roof')); r.position.y=1.6; g.add(r); _win(g,1,0.75,d/2+0.03,TIMBER); B(0.3,0.7,0.3,0x8a7a6a,-1,2.2,-0.3,g); }
};
// street furniture by KLK decoration kind
const DECOR_KINDS={
  fountain(d,g,an){ Cy(1.25,1.35,0.45,8,STONE,0,0,0,g); const w=Cy(1.12,1.12,0.05,8,0x6fb6dc,0,0.38,0,g); w.material=new THREE.MeshPhongMaterial({color:0x6fb6dc,transparent:true,opacity:0.85,shininess:80});
    Cy(0.18,0.24,1.1,8,STONE,0,0.4,0,g); Cy(0.6,0.3,0.25,8,STONE,0,1.3,0,g); Cy(0.12,0.16,0.45,8,STONE,0,1.55,0,g);
    const jet=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.6,8),new THREE.MeshPhongMaterial({color:0xbfe6f7,transparent:true,opacity:0.75})); jet.position.y=2.25; g.add(jet); an.push(t=>{ jet.scale.y=1+Math.sin(t*6)*0.12; }); },
  lantern(d,g){ Cy(0.05,0.07,1.5,6,0x2e2a26,0,0,0,g); const L=B(0.24,0.3,0.24,glow(0xffd27a),0,1.5,0,g); B(0.32,0.08,0.32,0x2e2a26,0,1.8,0,g); if(typeof DAYNIGHT!=='undefined'&&L&&L.isObject3D) DAYNIGHT.lamp(L,1.7); },
  banner2(d,g,an){ Cy(0.05,0.05,2.6,6,0x5a3c20,0,0,0,g); const f=B(0.06,1.2,0.62,ROYAL,0,1.25,0.32,g); B(0.07,0.12,0.62,GOLD,0,1.25,0.32,g); B(0.07,0.6,0.12,GOLD,0,1.55,0.32,g); an.push(t=>{ f.rotation.y=Math.sin(t*1.7+d.x)*0.12; }); },
  sg_cannon(d,g){ const br=Cy(0.13,0.18,1.2,8,0x34383e,0,0,0,g); br.rotation.x=Math.PI/2-0.25; br.position.set(0,0.48,0); B(0.5,0.28,0.7,0x6b4a2e,0,0.08,0,g);
    [-0.3,0.3].forEach(x=>{ const wh=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.08,8),flat(0x4a3220)); wh.rotation.z=Math.PI/2; wh.position.set(x,0.22,0.1); g.add(wh); }); },
  sg_light(d,g){ Cy(0.45,0.6,3.2,8,0xece4d2,0,0,0,g); [0.8,1.8,2.7].forEach(y=>Cy(0.5,0.5,0.18,8,0xb8402e,0,y,0,g)); B(0.6,0.5,0.6,glow(0xfff0a8),0,3.2,0,g); Co(0.55,0.6,8,0xb8402e,0,3.7,0,g); },
  ty_tilt(d,g){ B(1,0.1,0.12,0xf3ead6,0,0.9,0,g); B(0.5,0.1,0.13,0xb8402e,(d.x%2)?0.25:-0.25,0.9,0,g); B(0.1,0.9,0.1,0x6b4a2e,-0.45,0,0,g); },
  ty_stand(d,g){ B(1,0.35,0.9,0x7a5a3a,0,0,0.35,g); B(1,0.35,0.6,0x7a5a3a,0,0.35,0.05,g); B(1,0.35,0.3,0x7a5a3a,0,0.7,-0.25,g);
    B(1,0.06,0.25,d.x%2?ROYAL:0xf3ead6,0,0.38,0.2,g); B(1,0.06,0.25,d.x%2?0xf3ead6:ROYAL,0,0.73,-0.1,g); },
  ty_pavilion(d,g,an){ g.position.x+=0.5; Cy(0.95,1.0,1.2,10,0xf3ead6,0,0,0,g); Co(1.15,1.0,10,0xb8402e,0,1.2,0,g); Cy(0.03,0.03,0.6,4,0x5a3c20,0,2.1,0,g); const p=B(0.02,0.18,0.4,GOLD,0,2.45,0.2,g); an.push(t=>{ p.rotation.y=Math.sin(t*2+d.x)*0.3; }); },
  ty_rack(d,g){ B(0.9,0.08,0.12,0x6b4a2e,0,0.8,0,g); B(0.08,0.9,0.08,0x6b4a2e,-0.4,0,0,g); B(0.08,0.9,0.08,0x6b4a2e,0.4,0,0,g); [-0.25,0,0.25].forEach(x=>{ B(0.04,1.5,0.04,0xb8b0a0,x,0,0.06,g).rotation.x=-0.12; }); },
  ty_flag(d,g,an){ Cy(0.05,0.05,3.6,6,0x5a3c20,0,0,0,g); const f=B(0.03,0.5,0.9,ROYAL,0,3.0,0.45,g); an.push(t=>{ f.rotation.y=Math.sin(t*2.3+d.x)*0.25; }); }
};
const CAP_COLOURS={0:0x5fa860,1:0x3f7a44,2:0xbd9a66,4:0x6cb065,6:0xb3ada2,7:0x3f7a44,8:0xbd9a5e,9:0x8a7d6a,10:0xa89c88,12:0x8a6a42,14:0x5fa860,15:0x5fa860,16:0x5fa860,18:0x5b9e5c,19:0xe0cf9c,20:0x5fb0c8,32:0xa8774e};

function buildCity(D,opt){ const TIER=0.75*1.8;   // the capital climbs in tall terraces, its keep and cathedral high above the harbour (the realm's Stormgate is raised the same)
  const W=D.rows[0].length, H=D.rows.length, X0=D.X0, Y0=D.Y0, tile=D.rows, elev=D.elev, walk=D.walk;
  const inB=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const scene=new THREE.Scene(), sky=opt.sky||0x9cc4e4; scene.background=new THREE.Color(sky); scene.fog=new THREE.Fog(sky,30,75);
  const lv={id:opt.id,name:opt.name,scene,folk:[],spots:[],anim:[],cam:{pitch:0.55,dist:9,min:4,max:18}};
  const hemi=new THREE.HemisphereLight(0xdcecff,0x5a6a48,0.62); scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff0d8,0.85); sun.castShadow=true; sun.shadow.mapSize.set(1536,1536);
  Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:90}); sun.shadow.bias=-0.0005; scene.add(sun,sun.target);
  lv.follow=p=>{ if(typeof DAYNIGHT!=='undefined'){ const L=DAYNIGHT.state().light; sun.position.set(p.x+L.x*34,p.y+L.y*34,p.z+L.z*34); } else sun.position.set(p.x-12,p.y+30,p.z+14); sun.target.position.set(p.x,p.y,p.z); };
  // day and night from the save's clock (the inn sets it): dawn at 6, dusk at 20
  const daySky=new THREE.Color(sky), nightSky=new THREE.Color(0x1a2440), duskSky=new THREE.Color(0xe8a070), cS=new THREE.Color();
  const ground0=hemi.groundColor.clone();
  lv.anim.push(()=>{ if(typeof DAYNIGHT!=='undefined'){ DAYNIGHT.drive(lv,{sun,hemi,ground:ground0,k:0.9,kf:1.1}); return; }
    const f=GAME.S.dayFrac, e=Math.sin((f-0.25)*Math.PI*2), d=Math.max(0.12,Math.min(1,e*2.2+0.35)), dusk=Math.max(0,1-Math.abs(e)*5)*(e>-0.2?1:0);
    cS.copy(nightSky).lerp(daySky,d).lerp(duskSky,dusk*0.35); scene.background.copy(cS); scene.fog.color.copy(cS); sun.intensity=0.85*d; hemi.intensity=0.62*(0.4+0.6*d); });
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(500,500),detailify(new THREE.MeshPhongMaterial({color:0x2f6f9c,shininess:50,specular:0x2a4a66}))); sea.rotation.x=-Math.PI/2; sea.position.set(W/2,-0.3,H/2); sea.receiveShadow=true; scene.add(sea);
  const bAt={}; D.buildings.forEach(b=>{ for(let y=b.y;y<b.y+b.h;y++) for(let x=b.x;x<b.x+b.w;x++) bAt[(x-X0)+','+(y-Y0)]=b; });
  const dAt={}; D.decor.forEach(d=>{ for(let j=0;j<(d.w||1);j++) for(let i=0;i<(d.w||1);i++) dAt[(d.x-X0+i)+','+(d.y-Y0+j)]=1; });

  // stairs ramp across each pair so the knight walks up rather than popping
  const SDm=stairMap(W,H,(x,y)=>tile[y][x],(x,y)=>elev[y][x],(x,y)=>tile[y][x]!==5&&tile[y][x]!==3&&!!(walk[y]&&walk[y][x])), SD={}; SDm.forEach((v,k)=>SD[(k%W)+','+Math.floor(k/W)]=v);
  function ground(fx,fz){ const x=Math.floor(fx),y=Math.floor(fz); if(!inB(x,y)) return 0; const t=tile[y][x], e=elev[y][x];
    if(t===3) return -0.35; if(t===20) return -0.05; const d=SD[x+','+y]; if(!d) return e*TIER+0.02;
    const u=fx-x, v=fz-y, s=d.dx>0?u:d.dx<0?1-u:d.dy>0?v:1-v; return e*TIER+0.02+TIER*(d.lo+(d.hi-d.lo)*s); }
  lv.ground=ground;
  // KLK's canStep(): walkable() from the game; same level is free; a stair bridges one; a ledge (32) lets you drop
  lv.canMove=(fx,fz,tx,tz)=>{ const ax=Math.floor(fx),ay=Math.floor(fz),bx=Math.floor(tx),by=Math.floor(tz);
    if(!inB(bx,by)||!walk[by][bx]) return false; if(ax===bx&&ay===by) return true;
    const hf=elev[ay][ax],ht=elev[by][bx],tf=tile[ay][ax],tt=tile[by][bx];
    if(hf===ht) return true; if(Math.abs(hf-ht)===1&&(STAIRS.has(tf)||STAIRS.has(tt))) return true; return ht<hf&&(tt===32||tf===32); };

  // ── terrain: coloured caps over stone columns; ramparts; merlons; stair treads ──
  const caps=[], cols=[], walls=[], treads=[];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=tile[y][x]; if(t===3||t>=36&&t<=38) continue; const e=elev[y][x];
    if(bAt[x+','+y]){ caps.push([x,y,e*TIER+0.02,0x6e6458]); if(e) cols.push([x,y,e*TIER]); continue; }
    if(t===5&&!dAt[x+','+y]){ walls.push([x,y]); continue; }
    if(SD[x+','+y]){ stairBoxes(x,y,SD[x+','+y],ground,(a,b)=>inB(a,b)&&(tile[b][a]===10||tile[b][a]===11),q=>treads.push(q)); continue; }
    caps.push([x,y,t===20?-0.05:e*TIER+0.02,t===5?0xb3ada2:(CAP_COLOURS[t]||0x5fa860)]); if(e) cols.push([x,y,e*TIER]); }
  inst(caps,UNIT,null,([x,y,g,c],m,cc)=>{ m.makeScale(1,0.12,1); m.setPosition(x+0.5,g-0.12,y+0.5); cc.setHex(c).offsetHSL(0,0,(hsh(x,y)-0.5)*0.05); },scene);
  inst(cols,UNIT,null,([x,y,h],m,cc)=>{ m.makeScale(1,h+0.3,1); m.setPosition(x+0.5,-0.4,y+0.5); cc.setHex(0x9a958c).offsetHSL(0,0,(hsh(x,y)-0.5)*0.08); },scene);
  { const wg=new THREE.Group(), T5=(x,y)=>inB(x,y)&&tile[y][x]===5, SH=4.4, wc=bmat(0xb3b4b8,'brick'), wd=bmat(0x8a8c94,'brick'), sl=0x24262c, rf=bmat(0x2c4c9e,'roof');   // the capital's walls, as the realm draws them
    walls.forEach(([x,y])=>{ const top=elev[y][x]*TIER+0.02, h=top+SH, cx=x+0.5, cz=y+0.5, run=T5(x-1,y)||T5(x+1,y), col=T5(x,y-1)||T5(x,y+1), corner=run&&col&&[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>T5(x+a,y+b)).length===2,
        end=(run&&!col&&(!T5(x-1,y)||!T5(x+1,y)))||(col&&!run&&(!T5(x,y-1)||!T5(x,y+1))), mural=(run&&!col&&(x+X0)%7===0)||(col&&!run&&(y+Y0)%7===0);
      B(1,h+0.4,1,wc,cx,-0.4,cz,wg); B(1.16,1.1,1.16,wd,cx,top,cz,wg); B(1.06,0.14,1.06,wd,cx,top+SH*0.62,cz,wg); B(1.12,0.14,1.12,wd,cx,h,cz,wg);
      if(run&&!col) B(0.12,0.55,1.04,sl,cx,top+1.8,cz,wg); else if(col&&!run) B(1.04,0.55,0.12,sl,cx,top+1.8,cz,wg);
      if(corner||end||mural){ const tw=corner?1.7:end?1.55:1.4, tt=h+(corner?3.0:end?2.6:1.8), ch=corner?2.4:1.9;
        B(tw,tt-top,tw,wc,cx,top,cz,wg); B(tw+0.14,0.18,tw+0.14,wd,cx,tt-0.5,cz,wg); B(tw+0.02,0.6,0.14,sl,cx,top+SH*0.9,cz,wg); B(0.14,0.6,tw+0.02,sl,cx,top+SH*0.9,cz,wg);
        for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(tw*0.22,0.45,tw*0.22,wc,cx+a*tw*0.38,tt-0.32,cz+b*tw*0.38,wg);
        Co(tw*0.51,ch,12,rf,cx,tt-0.32,cz,wg); B(0.05,0.95,0.05,0x3a2a1a,cx,tt-0.42+ch,cz,wg); B(0.42,0.38,0.03,(x+y)%2?GOLD:0xf4eede,cx+0.22,tt+0.13+ch,cz,wg); }
      else for(const f of [0.25,0.75]){ if(run&&!col) B(0.36,0.7,1.0,wc,x+f,h+0.14,cz,wg); else if(col&&!run) B(1.0,0.7,0.36,wc,cx,h+0.14,y+f,wg); else { B(0.6,0.7,0.6,wc,cx,h+0.14,cz,wg); break; } } });
    scene.add(mergeStatic(shade(wg))); }
  inst(treads,UNIT,null,(q,m,cc)=>{ m.makeScale(q.sx,q.h,q.sz); m.setPosition(q.x,q.y,q.z); cc.setHex(q.c); },scene);
  // trees, bushes, fences
  const trees=[],bushes=[],fence=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=tile[y][x]; if(t===1) trees.push([x,y]); if(t===15) bushes.push([x,y]); if(t===14) fence.push([x,y]); }
  { const cone=new THREE.ConeGeometry(0.62,1.5,7); cone.translate(0,1.55,0); const cone2=new THREE.ConeGeometry(0.45,1.1,7); cone2.translate(0,2.25,0);
    const trunk=new THREE.CylinderGeometry(0.1,0.13,0.9,6); trunk.translate(0,0.45,0);
    [[trunk,0x5b3a1f],[cone,0x2f6b3a],[cone2,0x3a7d44]].forEach(([g,c])=>inst(trees,g,flat(c),([x,y],m)=>{ const s=0.85+hsh(x,y)*0.35; m.makeScale(s,s,s); m.setPosition(x+0.5,elev[y][x]*TIER,y+0.5); },scene,true));
    const bg=new THREE.IcosahedronGeometry(0.42,0); bg.translate(0,0.35,0); inst(bushes,bg,flat(0x3f8a4e),([x,y],m)=>{ m.makeScale(1,0.8,1); m.setPosition(x+0.5,elev[y][x]*TIER,y+0.5); },scene,true);
    const fg=new THREE.BoxGeometry(1,0.08,0.08); fg.translate(0,0.45,0); const fp=new THREE.BoxGeometry(0.1,0.55,0.1); fp.translate(0,0.27,0);
    [[fg,0x9a7a48],[fp,0x6f5128]].forEach(([g,c])=>inst(fence,g,lam(c),([x,y],m)=>{ m.setPosition(x+0.5,elev[y][x]*TIER,y+0.5); },scene,true)); }

  // ── buildings and their doors ──
  const styles=Object.assign({},BUILDING_STYLES,opt.styles||{});
  D.buildings.forEach(b=>{ const g=new THREE.Group(), e=elev[b.door.y-Y0][b.door.x-X0];
    (styles[b.style]||styles.house)(b,g,opt.colours||{});
    const hinge=doorFace(g,(b.door.x+0.5)-(b.x+b.w/2),b.style==='chapel'?b.h+0.18:b.h-0.2,b.style==='chapel'?1.4:b.id==='sg_keep'?1.5:1.0);
    g.position.set(b.x-X0+b.w/2,e*TIER+0.02,b.y-Y0+b.h/2); scene.add(mergeStatic(shade(g)));
    const into=opt.enter&&opt.enter(b), x=b.door.x-X0+0.5, z=b.door.y-Y0+1.2;
    lv.spots.push(into ? {x,z,r:1.2,label:'Enter',who:b.name,action:into,auto:[0,-1],hinges:[hinge]} : {x,z,r:1.2,label:'Door',who:b.name,lines:['The door is shut.'],auto:[0,-1]}); });
  doorSwing(lv);
  lv.doorStep=id=>{ const b=D.buildings.find(q=>q.id===id); return {x:b.door.x-X0+0.5,z:b.door.y-Y0+1.6,face:0,yaw:0}; };
  // gate arches
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(tile[y][x]===8){ const g=group(x+0.5,0,y+0.5,scene); B(1,0.5,1,STONE_D,0,elev[y][x]*TIER+1.6,0,g); shade(g); }
  // ── decorations ──
  D.decor.forEach(d=>{ const fn=DECOR_KINDS[d.kind]; if(!fn) return; const g=new THREE.Group(), lx=d.x-X0, ly=d.y-Y0;
    fn(d,g,lv.anim); g.position.x+=lx+(d.w===2?1:0.5); g.position.z=ly+(d.w===2?1:0.5); g.position.y=elev[ly][lx]*TIER+0.02; scene.add(shade(g)); });
  // ── ships: one hull per run of bow(36) / deck(37) / stern(38) tiles ──
  for(let y=0;y<H;y++){ let x=0; while(x<W){ const t=tile[y][x]; if(t===36||t===38){ let x2=x; while(x2+1<W&&tile[y][x2+1]>=36&&tile[y][x2+1]<=38) x2++;
      const wide=y+1<H&&tile[y+1][x]>=36&&tile[y+1][x]<=38, above=y>0&&tile[y-1][x]>=36&&tile[y-1][x]<=38;
      if(!above){ const Ln=x2-x+1, bowEast=tile[y][x2]===36, g=shipModel(Ln,wide);
        if(!bowEast) g.rotation.y=Math.PI; g.position.set(x+Ln/2,0,y+(wide?1:0.5)); scene.add(g);
        const k=x; lv.anim.push(t=>{ g.position.y=Math.sin(t*0.9+k)*0.05; g.rotation.z=Math.sin(t*0.7+k)*0.02; }); }
      x=x2+1; } else x++; } }
  // ── signs (lines telling you to press Ⓐ for something not built yet are left out) ──
  Object.entries(D.signs).forEach(([k,v])=>{ const [sx,sy]=k.split(',').map(Number), lx=sx-X0, ly=sy-Y0, g=group(lx+0.5,elev[ly][lx]*TIER+0.02,ly+0.5,scene);
    Cy(0.05,0.05,0.9,6,0x5b3a1f,0,0,0,g); B(0.8,0.45,0.07,0xcaa56a,0,0.75,0,g); B(0.8,0.06,0.075,0xe0c089,0,1.17,0,g); shade(g);
    const lines=v.split('\n'); lv.spots.push({x:lx+0.5,z:ly+0.5,r:0.9,label:'Read',who:lines[0].replace(/^[^A-Za-z—]+/,'').trim()||'Sign',lines:[lines.slice(1).filter(l=>!/Ⓐ/.test(l)).join('\n').trim()||lines[0]]}); });
  // ── townsfolk ──
  D.villagers.forEach(v=>{ const lx=v.x-X0, ly=v.y-Y0; addPerson(lv,scene,v.outfit==='soldier'?'soldier':v.outfit,lx+0.5,ly+0.5,elev[ly][lx]*TIER+0.02,v.name||OUTFIT_NAMES[v.outfit]||'Townsfolk',v.lines,{rest:hsh(lx,ly)*6}); });

  lv.spawn={x:opt.spawn[0]-X0+0.5,z:opt.spawn[1]-Y0+0.5,face:Math.PI,yaw:0};
  lv.zone=p=>{ const x=Math.floor(p.x),y=Math.floor(p.z); return inB(x,y)&&opt.zone?opt.zone(y+Y0,elev[y][x]):''; };
  return lv;
}
const OUTFIT_NAMES={soldier:'Guard',merchantD:'Merchant',peasant:'Townsfolk',peasantF:'Townswoman'};
