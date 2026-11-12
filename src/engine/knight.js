// ── KLK KNIGHT (3D) — low-poly, built from code like the 2D sprite, same palette & liveries ──
// buildKnight() returns a THREE.Group facing +z, feet at y=0, ~1.5 units tall.
// knight.setLivery('knight'|'aog'|'ranger'); knight.animate(dt, mode) with mode 'idle'|'walk'|'swing'.
// ── GAIT: the walk and the run, posed by hand like an animator's key poses (contact, down, passing, up — and for the run the
//  push-off and the flight), half a stride for the leading leg and the trailing one, mirrored for the other half, joined by
//  smooth periodic curves. Angles: hip forward is negative, knee bends positive. y: the body's height in a run (a walk
//  rides on whichever foot is down).
//  GAIT.pose(phase, runWeight, thigh, shin) → {h, k, d (how far below the hip that foot reaches), y}
const GAIT=(function(){
  const CL={
    walk:{off:0.6, cnat:0.92, cmin:0.45, cmax:1.05, keys:[
      // u     lead hip, knee   trail hip, knee   y
      [0.00, -0.42,0.06,  0.32,0.22, 0],
      [0.10, -0.34,0.30,  0.16,0.62, 0],
      [0.25, -0.04,0.12, -0.34,1.02, 0],
      [0.38,  0.20,0.05, -0.50,0.52, 0]]},
    run:{off:0.30, cnat:1.28, cmin:0.95, cmax:1.38, keys:[
      [0.00, -0.58,0.30,  0.45,0.95, 0],
      [0.05, -0.42,0.95,  0.25,1.40, 0],
      [0.10, -0.22,0.85,  0.05,1.75, 0],
      [0.20,  0.06,0.55, -0.55,1.80, 0],
      [0.30,  0.30,0.05, -0.98,1.15, 0],
      [0.40,  0.60,0.55, -0.82,0.55, 0]]} };
  // the full stride for one leg: the lead half, then the trail half (the other leg leads)
  for(const n in CL){ const c=CL[n], K2=[]; c.keys.forEach(k=>K2.push([k[0],k[1],k[2],k[5]])); c.keys.forEach(k=>K2.push([k[0]+0.5,k[3],k[4],k[5]])); c.full=K2; }
  function sample(c,p){ const F=c.full, n=F.length; let i=n-1; for(let j=0;j<n;j++) if(F[j][0]<=p) i=j;
    const at=j=>{ const m=((j%n)+n)%n, k=F[m], wrap=Math.floor(j/n); return [k[0]+wrap,k[1],k[2],k[3]]; };
    const p0=at(i-1), p1=at(i), p2=at(i+1), p3=at(i+2), u=(p-p1[0])/(p2[0]-p1[0]), u2=u*u, u3=u2*u, o=[];
    for(let ch=1;ch<4;ch++){ const a=p0[ch], b=p1[ch], c2=p2[ch], d=p3[ch]; o.push(0.5*((2*b)+(-a+c2)*u+(2*a-5*b+4*c2-d)*u2+(-a+3*b-3*c2+d)*u3)); }
    return o; }
  const foot=(h,k,lt,ls)=>({z:-lt*Math.sin(h)-ls*Math.sin(h+k), d:lt*Math.cos(h)+ls*Math.cos(h+k)});
  // how fast the standing foot travels back, per stride a second (so the cadence can be matched to the ground speed)
  for(const n in CL){ const c=CL[n], a=sample(c,0), b=sample(c,c.off), fa=foot(a[0],a[1],0.36,0.452), fb=foot(b[0],b[1],0.36,0.452); c.k=(fa.z-fb.z)/c.off; }
  // m: the stride's reach — the hip swing scaled up for a faster pace (a longer stride, not quicker feet) or down for a stroll;
  //  the run's body sinks a touch to let the longer stride reach the ground
  const dc=m=>{ const a=sample(CL.run,0); return foot(a[0]*m,a[1],0.36,0.452).d; }, dc1=dc(1);
  function pose(p,rw,lt,ls,m){ m=m||1; const w=sample(CL.walk,p), r=rw>0.001?sample(CL.run,p):w, h=(w[0]+(r[0]-w[0])*rw)*m, k=w[1]+(r[1]-w[1])*rw, sc=(lt+ls)/0.812;
    const y=(0.745-0.03*Math.cos(4*Math.PI*(p-0.1))+(dc(m)-dc1))*sc;   // a run's body: lowest as the foot takes the weight, highest in the flight
    return {h,k,d:foot(h,k,lt,ls).d,y}; }
  return {pose, walk:CL.walk, run:CL.run};
})();
function buildKnight(){
  const LIV={
    knight:{tunic:0x3b6fd4,trim:0x6a98f0,arm:0x3b6fd4,leg:0x2a4a8a,helm:0xc9cdd6,paul:0xc9cdd6,plume:0xc0392e,plumeHi:0xe05a4a,
            shield:0xb8c0d0,field:0xe8ecf2,cross:0xe8b93a,belt:0xc9a94a,cape:null},
    aog:   {tunic:0xdfe4ee,trim:0xffffff,arm:0xe0b64a,leg:0xc79c36,helm:0xf2dc96,paul:0xf2dc96,plume:0xffffff,plumeHi:0xffffff,
            shield:0xe8c45a,field:0xfffdf4,cross:0xe8c45a,belt:0xe0b64a,cape:0xf7f9fd},
    champion:{tunic:0xdfe4ee,trim:0xffffff,arm:0xdfe4ee,leg:0xc2c8d6,helm:0xeaeef6,paul:0xeaeef6,plume:0xc0392e,plumeHi:0xe05a4a,
            shield:0xb8c0d0,field:0xe8ecf2,cross:0xe8b93a,belt:0xc9a94a,cape:0xf7f9fd},
    ranger:{tunic:0x3b6fd4,trim:0x6a98f0,arm:0x3b6fd4,leg:0x2a4a8a,helm:0xc9cdd6,paul:0xc9cdd6,plume:0xc0392e,plumeHi:0xe05a4a,
            shield:0x5c6270,field:0x94623a,cross:0xc0392e,belt:0xc9a94a,cape:null}
  };
  const M={}, mk=(k,color,shiny)=>M[k]=new THREE.MeshPhongMaterial({color,flatShading:true,shininess:shiny||8,specular:shiny?0x555566:0x111111});
  mk('tunic',0); mk('trim',0); mk('arm',0); mk('leg',0); mk('helm',0,40); mk('paul',0,22); mk('plume',0); mk('plumeHi',0);
  mk('shield',0,40); mk('field',0); mk('cross',0,30); mk('belt',0,40); mk('cape',0xffffff);
  mk('visor',0x1a2740); mk('hand',0xaab0bc,60); mk('boot',0x4a3424); mk('steel',0xaab0bc,60); mk('blade',0xe8e8f0,90); mk('guard',0xd8b24a,50); mk('grip',0x7a4a24);
  M.cape.side=THREE.DoubleSide; M.blade.emissive.setHex(0x4a505e);

  const K=new THREE.Group(); K.hipY=0.62; K.shX=0.088; K.shY=-0.13; K.shRY=Math.PI/2; K.armOut=0.1;
  const add=(geo,mat,x,y,z,par)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x||0,y||0,z||0); o.castShadow=true; (par||K).add(o); return o; };
  const pivot=(x,y,z,par)=>{ const g=new THREE.Group(); g.position.set(x,y,z); (par||K).add(g); return g; };
  const cyl=(rt,rb,h,s)=>new THREE.CylinderGeometry(rt,rb,h,Math.max(10,s||10));

  // hips & legs (thigh pivots at hip, shin pivots at knee)
  const hips=pivot(0,0.62,0);
  function leg(side){ const hip=pivot(side*0.095,0,0,hips);
    add(cyl(0.075,0.065,0.3),M.leg,0,-0.15,0,hip);
    const knee=pivot(0,-0.3,0,hip);
    add(new THREE.SphereGeometry(0.07,10,7),M.steel,0,0,0.03,knee);                 // knee cop
    add(cyl(0.065,0.055,0.25),M.steel,0,-0.13,0,knee);                             // greave
    add(new THREE.BoxGeometry(0.12,0.08,0.2),M.boot,0,-0.28,0.035,knee);          // sabaton
    return {hip,knee}; }
  const L=leg(1), R=leg(-1);

  // torso: surcoat skirt, body, belt, collar
  const torso=pivot(0,0,0,hips);
  add(cyl(0.2,0.27,0.24,8),M.tunic,0,-0.06,0,torso).geometry.translate(0,0,0);
  add(cyl(0.272,0.275,0.025,8),M.trim,0,-0.18,0,torso);
  const chest=add(cyl(0.25,0.2,0.4,8),M.tunic,0,0.24,0,torso);
  add(cyl(0.212,0.212,0.05,8),M.belt,0,0.07,0,torso);
  add(new THREE.BoxGeometry(0.07,0.06,0.03),M.guard,0,0.07,0.21,torso);           // buckle
  add(cyl(0.11,0.13,0.06,8),M.steel,0,0.46,0,torso);                              // gorget
  add(cyl(0.27,0.29,0.08,16),M.steel,0,-0.24,0,torso);                            // a fringe of mail below the surcoat
  add(new THREE.BoxGeometry(0.1,0.1,0.05),M.boot,0.17,0.0,0.17,torso);             // a belt pouch
  add(cyl(0.255,0.21,0.06,16),M.trim,0,0.43,0,torso);                             // the surcoat's collar
  [-1,1].forEach(sd=>add(new THREE.BoxGeometry(0.035,0.36,0.02),M.trim,sd*0.12,0.24,0.232,torso));   // trim down the front

  // cape (Armour of God): hangs from the shoulders, sways
  const capeP=pivot(0,0.42,-0.2,torso);
  const capeGeo=new THREE.PlaneGeometry(0.5,0.78,2,4); capeGeo.translate(0,-0.39,0);
  const cape=add(capeGeo,M.cape,0,0,0,capeP); cape.rotation.x=0.08;

  // arms: shoulder pivot → upper arm, elbow pivot → vambrace + gauntlet
  function arm(side){ const sh=pivot(side*0.29,0.38,0,torso);
    add(new THREE.SphereGeometry(0.13,12,7,0,Math.PI*2,0,Math.PI*0.55),M.paul,0,0.03,0,sh);   // pauldron
    add(cyl(0.06,0.055,0.24),M.arm,0,-0.12,0,sh);
    const el=pivot(0,-0.24,0,sh);
    add(cyl(0.062,0.055,0.2),M.steel,0,-0.1,0,el);
    const hand=pivot(0,-0.23,0,el); hand.box=add(new THREE.BoxGeometry(0.09,0.09,0.1),M.hand,0,0,0,hand);
    return {sh,el,hand}; }
  const AL=arm(1), AR=arm(-1);      // facing +z, the knight's right hand is at -x

  // sword in the right hand
  const sword=pivot(0,0,0,AR.hand); sword.rotation.x=Math.PI/2;      // points forward
  // V129: the fishing pole — a long ash rod with a cork grip and a reel, held out over the water while he sits on the bank
  const pole=pivot(0,0,0,AR.hand); pole.visible=false; { const wd=new THREE.MeshLambertMaterial({color:0x8a6a3a}), dk=new THREE.MeshLambertMaterial({color:0x5a3a1e}), ck=new THREE.MeshLambertMaterial({color:0xc8a070}), mt=new THREE.MeshLambertMaterial({color:0x9aa0a8});
    const seg=(r0,r1,len,y,m)=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,len,6),m); c.position.y=y+len/2; pole.add(c); return c; };
    seg(0.026,0.024,0.26,-0.12,ck); seg(0.02,0.014,0.9,0.14,wd); seg(0.014,0.008,0.85,1.04,wd); seg(0.008,0.004,0.6,1.89,dk);
    const reel=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.04,10),mt); reel.rotation.z=Math.PI/2; reel.position.set(0.05,0.02,0); pole.add(reel);
    for(const y of [0.6,1.2,1.75,2.2]){ const g=new THREE.Mesh(new THREE.TorusGeometry(0.014,0.004,4,8),mt); g.position.set(0,y,0.012); pole.add(g); }
    const tip=new THREE.Object3D(); tip.position.y=2.49; pole.add(tip); pole.userData.tip=tip; }
  pole.rotation.set(Math.PI/2-0.75,0,0);   // forward and up from the hand
  K.pole=pole; K.poleTip=v=>{ K.updateMatrixWorld(true); return pole.userData.tip.getWorldPosition(v||new THREE.Vector3()); };
  K.fishBend=0;   // 0 still … 1 a fish on: the rod bows and the hands lift
  K._sword=sword;
  add(cyl(0.022,0.022,0.12,6),M.grip,0,0,0,sword);
  add(new THREE.SphereGeometry(0.035,6,4),M.guard,0,-0.075,0,sword);
  add(new THREE.BoxGeometry(0.22,0.035,0.04),M.guard,0,0.07,0,sword);
  add(new THREE.BoxGeometry(0.055,0.6,0.015),M.blade,0,0.39,0,sword);
  const tip=add(new THREE.ConeGeometry(0.039,0.1,4),M.blade,0,0.74,0,sword); tip.scale.z=0.28; tip.rotation.y=Math.PI/4;

  // kite shield on the left forearm
  // strapped to the OUTSIDE of the forearm (the enarmes), face turned out — never through the arm; `shSpin` turns it about its own
  // face so its point hangs down at rest and still points down with the forearm raised across the body to guard
  const shM=pivot(0.088,-0.13,0,AL.el); shM.rotation.y=Math.PI/2; const sh=pivot(0,0,0,shM);
  function kite(s){ const p=new THREE.Shape(); p.moveTo(0,0.26*s); p.quadraticCurveTo(0.2*s,0.26*s,0.2*s,0.12*s); p.quadraticCurveTo(0.18*s,-0.12*s,0,-0.34*s);
    p.quadraticCurveTo(-0.18*s,-0.12*s,-0.2*s,0.12*s); p.quadraticCurveTo(-0.2*s,0.26*s,0,0.26*s); return p; }
  const rim=add(new THREE.ExtrudeGeometry(kite(1),{depth:0.035,bevelEnabled:false,curveSegments:5}),M.shield,0,0,-0.02,sh);
  add(new THREE.ExtrudeGeometry(kite(0.86),{depth:0.012,bevelEnabled:false,curveSegments:5}),M.field,0,0.005,0.015,sh);
  add(new THREE.BoxGeometry(0.055,0.42,0.012),M.cross,0,-0.02,0.03,sh);
  add(new THREE.BoxGeometry(0.28,0.055,0.012),M.cross,0,0.09,0.03,sh);

  // great helm: barrel, flat-ish crown, dark visor slit and breaths, plume arcing back
  const head=pivot(0,0.6,0,torso);
  add(cyl(0.155,0.15,0.27,8),M.helm,0,0,0,head);
  add(cyl(0.11,0.155,0.07,8),M.helm,0,0.17,0,head);
  add(new THREE.BoxGeometry(0.26,0.035,0.04),M.visor,0,0.035,0.14,head);
  add(new THREE.BoxGeometry(0.03,0.11,0.04),M.visor,0,-0.04,0.145,head);
  add(new THREE.BoxGeometry(0.03,0.27,0.03),M.helm,0,0.01,0.155,head);           // centre ridge
  const plume=pivot(0,0.2,0,head);
  [[0,0.04,0.02,0.09,0.1,'plume'],[0,0.11,-0.06,0.08,0.12,'plumeHi'],[0,0.12,-0.16,0.07,0.1,'plume'],[0,0.08,-0.24,0.06,0.09,'plume'],[0,0.01,-0.29,0.05,0.08,'plumeHi']]
    .forEach(([x,y,z,w,h,m],i)=>{ const p=add(new THREE.BoxGeometry(0.055,h,w*1.2),M[m],x,y,z,plume); p.rotation.x=-0.5-i*0.32; });

  // ── the weapon in hand: KLK's WEAPON_ART families, in each weapon's own palette (drawWeaponDown/Left/Up) ──
  //   fist (bare gauntlets, Lydia's ring, Caleb's gauntlets) · light (a sword by length and width) · heavy (a long, broad blade;
  //   Gideon's flares at the point) · hammer · haft (Aiden's staff) · radiant (the Holy Blade, glowing) · bow — the bow, the
  //   hunting bow, the sling, the throwing axe and the crossbow, each its own shape
  const defSword=sword.children.slice(); let wpnG=null; const wmat={};
  // the blade turns in the hand through each blow so the edge leads, not the flat (V90): everything the hand holds hangs off this roll
  const swRoll=new THREE.Group(); defSword.forEach(o=>swRoll.add(o)); sword.add(swRoll); K._roll=swRoll;
  const WM=(hex,shiny,em)=>{ const k=hex+'|'+(shiny||0)+'|'+(em||''); return wmat[k]||(wmat[k]=new THREE.MeshPhongMaterial({color:new THREE.Color(hex),flatShading:true,shininess:shiny||8,specular:shiny?0x666677:0x111111,emissive:em?new THREE.Color(em):new THREE.Color(0)})); };
  K.setWeapon=function(art,id){ bladeLen=0; K._trailCol=art&&art.fam==='radiant'?[1,0.85,0.45]:null; if(wpnG){ swRoll.remove(wpnG); wpnG=null; } defSword.forEach(o=>o.visible=!art);
    [AL,AR].forEach(A=>{ A.hand.box.material=M.hand; A.hand.box.scale.setScalar(1); if(A.hand.ring){ A.hand.remove(A.hand.ring); A.hand.ring=null; } });
    K.weaponFam=art?art.fam:'light'; if(!art) return; const p=art.pal||{}, c=(k,d)=>p[k]||d, g=new THREE.Group(); wpnG=g; swRoll.add(g);
    const box=(w,h,d,m,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,g), cy=(r0,r1,h,m,x,y,z,sg)=>add(new THREE.CylinderGeometry(r0,r1,h,sg||6),m,x,y,z,g);
    const blade=WM(c('B','#e8e8f0'),90,new THREE.Color(c('D','#9aa2b2')).multiplyScalar(0.35)), edge=WM(c('H','#ffffff'),90), guard=WM(c('G','#d8b24a'),50), grip=WM(c('GR','#7a4a24')), pom=WM(c('P',c('G','#c9a94a')),40);
    const f=art.fam;
    if(f==='fist'){ const gm=WM(c('B','#c9cdd6'),60), sc=1+(art.bulk||0)*0.28; [AL,AR].forEach(A=>{ A.hand.box.material=gm; A.hand.box.scale.setScalar(sc); });
      if(art.bulk>=2) [AL,AR].forEach(A=>{ const k=add(new THREE.BoxGeometry(0.11,0.03,0.12),WM(c('H','#eef0f4'),60),0,0.06,0.0,A.hand); A.hand.ring=k; });   // knuckle plates
      if(art.gem){ const r=new THREE.Group(); AR.hand.add(r); AR.hand.ring=r; add(new THREE.TorusGeometry(0.035,0.012,5,10),WM(c('B','#e8b93a'),70),0,0,0.06,r).rotation.y=Math.PI/2;
        const gem=add(new THREE.OctahedronGeometry(0.03),new THREE.MeshBasicMaterial({color:new THREE.Color(art.gem)}),0,0.0,0.1,r); }
      return; }
    if(f==='light'||f==='heavy'||f==='radiant'){ const L0=(f==='heavy'?(art.lenL||art.len):art.len)||12, W0=(f==='heavy'?(art.w0L||art.w0):art.w0)||5;
      const len=0.3+L0*0.034*(f==='heavy'?1.12:1), wid=0.024+W0*0.0075, th=f==='heavy'?0.024:0.016;
      cy(0.022,0.022,f==='heavy'?0.2:0.12,grip,0,f==='heavy'?-0.04:0,0);                                           // the grip (two hands' worth on a greatsword)
      add(new THREE.SphereGeometry(f==='heavy'?0.042:0.034,6,4),pom,0,f==='heavy'?-0.16:-0.075,0,g);                // pommel
      box(Math.max(0.2,wid*3.4),0.035,0.045,guard,0,0.07,0);                                                          // cross-guard
      if(f==='heavy') [-1,1].forEach(sd=>box(0.04,0.06,0.05,guard,sd*wid*1.75,0.1,0));                                 // the quillons turn up
      box(wid,len,th,f==='radiant'?WM(c('B','#fff8dc'),90,c('G','#ffd86a')):blade,0,0.09+len/2,0);
      box(wid*0.28,len*0.9,th+0.004,f==='radiant'?WM('#ffffff',90,'#fff4c0'):edge,0,0.09+len*0.47,0);                   // the fuller, lit
      if(art.flare){ box(wid*1.5,len*0.22,th,blade,0,0.09+len*0.82,0); }                                               // Gideon's blade broadens toward the point
      const tp=add(new THREE.ConeGeometry(wid*(art.flare?0.8:0.72),0.1,4),f==='radiant'?WM(c('B','#fff8dc'),90,c('G','#ffd86a')):blade,0,0.09+len+0.05,0,g); tp.scale.z=th/wid*1.6; tp.rotation.y=Math.PI/4;
      if(f==='radiant'){ const halo=new THREE.Mesh(new THREE.BoxGeometry(wid*3.2,len*1.08,0.09),new THREE.MeshBasicMaterial({color:new THREE.Color(art.glow||'#ffd86a'),transparent:true,opacity:0.28,depthWrite:false,blending:THREE.AdditiveBlending}));
        halo.position.y=0.09+len/2; g.add(halo); g.userData.halo=halo; const lt=new THREE.PointLight(new THREE.Color(art.glow||'#ffd86a'),0.6,3.2); lt.position.y=0.09+len*0.6; g.add(lt); }
      return; }
    if(f==='hammer'){ cy(0.026,0.026,0.78,grip,0,0.2,0); const head=WM(c('B','#9aa0ac'),55);
      box(0.3,0.15,0.15,head,0,0.62,0); box(0.04,0.17,0.17,WM(c('H','#ccd2da'),55),0.15,0.62,0); box(0.04,0.17,0.17,WM(c('D','#6a7080'),55),-0.15,0.62,0);
      const sp=add(new THREE.ConeGeometry(0.035,0.12,4),head,0,0.75,0,g); box(0.06,0.06,0.06,guard,0,0.5,0); add(new THREE.SphereGeometry(0.035,6,4),pom,0,-0.2,0,g); return; }
    if(f==='haft'){ cy(0.026,0.03,1.4,WM(c('B','#a87a44')),0,0.05,0); add(new THREE.SphereGeometry(0.05,6,5),WM(c('G','#c8b090'),20),0,0.76,0,g); add(new THREE.SphereGeometry(0.04,6,5),WM(c('G','#c8b090'),20),0,-0.66,0,g);
      [0.5,-0.4].forEach(y=>cy(0.034,0.034,0.06,WM(c('D','#7a5428')),0,y,0)); g.rotation.x=0.15; return; }
    if(f==='bow'){ const wood=WM(c('B','#a87a44')), str=WM(c('ST','#e8e8f0')), metal=WM(c('M','#9aa0a8'),60);
      if(id==='sling'){ [-1,1].forEach(sd=>{ const cd=box(0.012,0.34,0.012,str,sd*0.03,-0.16,0); cd.rotation.z=sd*0.12; }); const pouch=add(new THREE.SphereGeometry(0.05,6,4),wood,0,-0.34,0,g); pouch.scale.set(1.2,0.6,0.8); add(new THREE.SphereGeometry(0.032,6,4),metal,0,-0.33,0.02,g); g.rotation.x=Math.PI; return; }
      if(id==='throwaxe'){ cy(0.022,0.024,0.46,WM(c('ST','#6a4a2a')),0,0.12,0); const hd=WM(c('B','#c8ccd4'),60); box(0.03,0.13,0.1,hd,0,0.38,0.05); const bl=box(0.02,0.2,0.08,WM(c('H','#f0f2f6'),70),0,0.38,0.11); return; }
      // an arc of radius R spanning ±th, its middle at the origin, laid in the hand's frame by basis (u: the bulge axis, v: the span axis)
      const arcIn=(R,th,mat,u,v)=>{ const bw=new THREE.Group(), w=u.clone().cross(v); bw.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u,v,w)); g.add(bw);
        const a=new THREE.Mesh(new THREE.TorusGeometry(R,0.02,4,14,th*2),mat); a.rotation.z=-th; a.position.x=-R; bw.add(a); a.castShadow=true; return bw; };
      const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
      if(id==='crossbow'){ box(0.07,0.62,0.06,wood,0,0.22,-0.03); const th=Math.PI*0.32, R=0.3; const pr=arcIn(R,th,metal,V3(0,1,0),V3(1,0,0)); pr.position.y=0.5;   // the stock runs forward; the prod lies across its nose
        box(2*R*Math.sin(th),0.008,0.008,str,0,0.5+R*(Math.cos(th)-1),0); box(0.04,0.06,0.06,metal,0,0.08,0.02); return; }
      const R=id==='huntbow'?0.5:0.42, th=Math.PI*0.36; arcIn(R,th,wood,V3(0,1,0),V3(0,0,1));                               // the stave stands upright, the tips curving back toward you
      box(0.006,0.006,2*R*Math.sin(th),str,0,R*(Math.cos(th)-1),0);
      box(0.05,0.05,0.12,WM(c('G','#c8b090')),0,0,0); return; } };
  // ── livery shapes the palette can't say (drawKnightBody's crest(), cape(), the wings): the Armour of God's upright plume,
  //   wings, white cape and halo · the Ranger's hood with a tucked feather, green cape and gold leaf · the Stormward bolt ·
  //   the Fallen Plate's broken wing · the Champion's gold cape and red cross · Robby's Demise: horns, a beast's hands, a
  //   red beam in the slit, a black cape with the spade on it, the biggest wings in the game and a smoke about him ──
  const crests={}, deco=new THREE.Group(); cape.add(deco); const capeDeco=(kind)=>{ while(deco.children.length) deco.remove(deco.children[0]);
    const pc=(w,h,col,x,y)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.006),flatM(col)); m.position.set(x,y,-0.006); deco.add(m); };
    if(kind==='cross'){ pc(0.07,0.42,'#c0392e',0,-0.3); pc(0.3,0.07,'#c0392e',0,-0.2); }
    if(kind==='leaf'){ const lf=new THREE.Mesh(new THREE.CircleGeometry(0.1,6),flatM('#d4a93e')); lf.scale.set(0.7,1.4,1); lf.position.set(0,-0.3,-0.006); lf.rotation.y=Math.PI; deco.add(lf); pc(0.015,0.14,'#a67e1e',0,-0.48); }
    if(kind==='spade'){ const sp=new THREE.Mesh(new THREE.CircleGeometry(0.09,3),flatM('#e8e4dc')); sp.rotation.set(0,Math.PI,Math.PI); sp.position.set(0,-0.28,-0.006); deco.add(sp); [-1,1].forEach(sd=>{ const b=new THREE.Mesh(new THREE.CircleGeometry(0.05,8),flatM('#e8e4dc')); b.position.set(sd*0.045,-0.3,-0.007); b.rotation.y=Math.PI; deco.add(b); }); pc(0.03,0.1,'#e8e4dc',0,-0.4); pc(0.1,0.025,'#c8c4bc',0,-0.45); }
    if(kind==='trim'){ pc(0.5,0.025,'#e8c25a',0,-0.765); } };
  const _fm={}; function flatM(col){ return _fm[col]||(_fm[col]=new THREE.MeshPhongMaterial({color:new THREE.Color(col),flatShading:true,shininess:8,side:THREE.DoubleSide})); }
  // ── the livery crests, made for the sculpted helm (half-width ~0.11, its crown ~0.19 above the head's pivot) ──
  const ext=(sh,d)=>{ const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:d*0.35,bevelSize:d*0.35,bevelSegments:1}); g.translate(0,0,-d/2); return g; };
  const glowM=(col,op)=>new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const feather=(L,W,bend)=>{ const sh=new THREE.Shape(); sh.moveTo(0,0); sh.quadraticCurveTo(W,L*0.35,W*0.55+bend,L); sh.lineTo(bend,L*1.04); sh.quadraticCurveTo(-W*0.7,L*0.45,0,0); return sh; };
  function crest(kind){ if(crests[kind]) return crests[kind]; const g=pivot(0,0.17,0,head); g.visible=false; crests[kind]=g;
    const put=(geo,mat,x,y,z,rx,ry,rz,par)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); m.castShadow=true; (par||g).add(m); return m; };
    const gm=c=>new THREE.MeshPhongMaterial({color:new THREE.Color(c),flatShading:true,shininess:60,specular:0x666655,side:THREE.DoubleSide});
    if(kind==='stormward'){   // a bolt of gold standing fore-and-aft on the crown, crackling faintly
      const sh=new THREE.Shape(); [[0.07,0],[0.0,0.13],[0.055,0.13],[-0.03,0.3],[0.005,0.17],[-0.045,0.17],[0.02,0.0]].forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));
      [-1,1].forEach(sd=>{ const m=put(ext(sh,0.03),gm('#f5c518'),sd*0.035,0.0,0.0,0,-Math.PI/2+sd*0.42,0); m.scale.set(1.25,1.25,1); m.material.emissive=new THREE.Color(0x4a3600);
        const gl=put(ext(sh,0.06),glowM(0x9ad8ff,0.2),sd*0.035,0,0,0,-Math.PI/2+sd*0.42,0); gl.scale.set(1.4,1.35,1); });
      put(new THREE.BoxGeometry(0.1,0.03,0.2),gm('#d4d9e2'),0,0.0,-0.01); }
    if(kind==='fallen'){ g.scale.setScalar(1.45);   // a broken wing: three red blades fanning back, the third snapped off short, and one loose feather beyond
      [[0.24,0.05,-0.5,'#c62836'],[0.27,0.06,-0.95,'#9a1c28'],[0.12,0.05,-1.35,'#7a1620']].forEach(([L,W,r,c],i)=>{ const m=put(ext(feather(L,W,-0.02),0.012),gm(c),0,0.0,-0.03-i*0.01,r,-Math.PI/2,0); m.rotation.order='YXZ'; m.rotation.set(r,-Math.PI/2,0); });
      put(ext(feather(0.11,0.03,0.01),0.01),gm('#f05a68'),0,-0.02,-0.27,-2.0,-Math.PI/2,0); put(new THREE.BoxGeometry(0.03,0.03,0.1),gm('#3e3a44'),0,0.0,-0.04); }
    if(kind==='robby'){   // horns that sweep out and up and blacken to red tips; eyes like coals behind the slit
      [-1,1].forEach(sd=>{ let x=sd*0.08, y=-0.04, z=0.0, r=0.045; for(let i=0;i<7;i++){ const a=0.05+i*0.2, nx=x+sd*Math.cos(a)*0.045, ny=y+Math.sin(a)*0.05+0.012; const len=Math.hypot(nx-x,ny-y)+0.01;
          const m=put(new THREE.CylinderGeometry(r*0.82,r,len,7),gm(i>4?'#8f1016':i>2?'#2a1c24':'#1b1218'),(x+nx)/2,(y+ny)/2,z-0.01*i); m.rotation.z=-sd*(Math.PI/2-a); x=nx; y=ny; r*=0.78; }
        put(new THREE.ConeGeometry(r,0.05,6),gm('#c0141c'),x+sd*0.01,y+0.03,z-0.07,0,0,-sd*0.3); });
      [-1,1].forEach(sd=>put(new THREE.BoxGeometry(0.04,0.012,0.01),new THREE.MeshBasicMaterial({color:0xff2a2a}),sd*0.045,-0.137,0.152)); }
    if(kind==='ranger'){   // the hood up over the helm, a mantle on the shoulders, its point hanging back, one red feather in the band
      const hd=gm('#3f5a3a'), hl=gm('#4e6b46'), dk=gm('#2a3e28'); hd.shininess=hl.shininess=dk.shininess=4;
      const cap=put(new THREE.SphereGeometry(0.16,16,10,Math.PI*0.72,Math.PI*1.56,0,Math.PI*0.6),hd,0,-0.16,-0.005); cap.scale.set(1.0,1.18,1.12);
      const cowl=put(new THREE.CylinderGeometry(0.16,0.25,0.12,16,1,true,Math.PI*0.72,Math.PI*1.56),hd,0,-0.33,-0.01); cowl.scale.z=0.92;
      put(new THREE.ConeGeometry(0.07,0.24,6),dk,0,-0.12,-0.2,-2.25,0,0);
      put(new THREE.TorusGeometry(0.155,0.012,4,20,Math.PI*1.4),gm('#6a4a2a'),0,-0.1,-0.0,Math.PI/2,0,Math.PI*0.8);
      const fe=put(ext(feather(0.15,0.03,0.0),0.008),gm('#c0392e'),0.15,-0.1,-0.03,0,-Math.PI/2,-0.35); }
    if(kind==='glory'){   // a tall white crest of feathers, and the halo
      for(let i=0;i<5;i++){ const L=0.2+(i===2?0.08:i%2?0.03:0), m=put(ext(feather(L,0.035,0.0),0.01),gm(i===2?'#ffffff':'#f2f0e8'),0,0.0,0.03-i*0.03); m.rotation.order='YXZ'; m.rotation.set(-0.3-i*0.22,-Math.PI/2,0); }
      const h=put(new THREE.TorusGeometry(0.17,0.012,6,32),gm('#f2d27a'),0,0.0,-0.16); h.material.emissive=new THREE.Color(0x6a5010); put(new THREE.TorusGeometry(0.17,0.04,6,32),glowM(0xfff2c0,0.35),0,0.0,-0.165); }
    return g; }
  const wings=new THREE.Group(); wings.position.set(0,0.34,-0.2); torso.add(wings); let wingKind='';
  function makeWings(kind){ while(wings.children.length) wings.remove(wings.children[0]); wingKind=kind; if(!kind) return;
    if(K.sculpted) wings.position.set(0,0.3,-0.27);
    const pm=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:new THREE.Color(c),flatShading:true,shininess:10,side:THREE.DoubleSide},o||{}));
    [-1,1].forEach(sd=>{ const w=pivot(sd*0.06,0,0,wings); w.sd=sd;
      if(kind==='glory'){   // an angel's wings: long primaries, shorter secondaries, a row of coverts — white, tipped with gold
        const row=(n,L0,dL,a0,da,r0,col,tip)=>{ for(let i=0;i<n;i++){ const L=L0-i*dL, a=a0-i*da, m=new THREE.Mesh(new THREE.ShapeGeometry(feather(L,0.045,0.01)),pm(i%2?col:tip)); m.position.set(sd*(r0+i*0.035),0.02-i*0.012,-0.01*i); m.rotation.z=-sd*a; m.scale.x=sd; w.add(m); } };
        row(8,0.62,0.05,1.15,0.13,0.05,'#ffffff','#f8f0d8'); row(7,0.38,0.03,1.3,0.15,0.025,'#f2f0e8','#ffffff'); row(6,0.19,0.01,1.45,0.17,0.0,'#fffdf4','#f2e2a8');
      } else {   // the beast's: a bat's membrane on long fingers, dark, the edges bled red
        const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(0.75,0.36); sh.lineTo(0.72,0.05); sh.quadraticCurveTo(0.62,-0.05,0.56,-0.25); sh.quadraticCurveTo(0.42,-0.18,0.36,-0.38); sh.quadraticCurveTo(0.22,-0.24,0.06,-0.32); sh.lineTo(0,0);
        const mem=new THREE.Mesh(new THREE.ShapeGeometry(sh),pm('#1d141c',{emissive:new THREE.Color(0x1a0204)})); mem.scale.x=sd; w.add(mem);
        const edge=new THREE.Mesh(new THREE.ShapeGeometry(sh),glowM(0xb0141c,0.28)); edge.scale.set(sd*1.03,1.03,1); edge.position.z=-0.004; w.add(edge);
        [[0.75,0.36],[0.56,-0.25],[0.36,-0.38],[0.06,-0.32]].forEach(([x,y])=>{ const L=Math.hypot(x,y), b=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.016,L,5),pm('#2a1d27')); b.position.set(sd*x/2,y/2,0.006); b.rotation.z=-sd*(Math.PI/2-Math.atan2(y,x)); w.add(b); });
        const cl=new THREE.Mesh(new THREE.ConeGeometry(0.018,0.06,5),pm('#e8dcc8')); cl.position.set(sd*0.77,0.39,0); cl.rotation.z=-sd*0.5; w.add(cl); }
      w.rotation.y=sd*0.5; });
  }
  const smoke=new THREE.Mesh(new THREE.CircleGeometry(0.75,18),new THREE.MeshBasicMaterial({color:0x08040a,transparent:true,opacity:0.34,depthWrite:false})); smoke.rotation.x=-Math.PI/2; smoke.position.y=0.02; smoke.visible=false; K.add(smoke);

  // ── liveries ──
  // name picks the base set; L (a KLK LIVERIES entry) overrides tunic, legs, plume and helm with the game's own colours
  K.setLivery=function(name,L){ const P=Object.assign({},LIV[name]||LIV.knight); const h=s=>parseInt(String(s).slice(1),16);
    if(L){ if(L.TUNIC){ P.tunic=h(L.TUNIC); P.arm=h(L.TUNIC); } if(L.TUNIC_RIM) P.trim=h(L.TUNIC_RIM); if(L.LEG) P.leg=h(L.LEG); if(L.PLUME){ P.plume=h(L.PLUME); P.plumeHi=h(L.PLUME_HI||L.PLUME); } if(L.HELM){ P.helm=h(L.HELM); P.paul=h(L.HELM); } }
    for(const k of ['tunic','trim','arm','leg','helm','paul','plume','plumeHi','shield','field','cross','belt']) M[k].color.setHex(P[k]);
    cape.visible=!!P.cape; if(P.cape) M.cape.color.setHex(P.cape); K.livery=name; K.shape(name==='aog'?'glory':name==='champion'||name==='ranger'?name:null); };
  // the shape changes, keyed on the livery the player chose (S.livery)
  K.shape=function(key){ const ck=key==='glory'||key==='stormward'||key==='fallen'||key==='robby'||key==='ranger'?key:null; plume.visible=!ck;
    Object.keys(crests).forEach(k=>crests[k].visible=false); if(ck) crest(ck).visible=true;
    const cp={glory:['#f7f9fd','trim'],champion:['#d8a828','cross'],ranger:['#3f5a3a','leaf'],robby:['#1d141c','spade']}[key];
    cape.visible=!!cp; if(cp){ M.cape.color.set(cp[0]); capeDeco(cp[1]); }
    const wk=key==='glory'||key==='robby'?key:''; if(wk!==wingKind) makeWings(wk);
    K.beast=key==='robby'; smoke.visible=K.beast; M.visor.color.set(K.beast?'#d01820':'#1a2740'); M.visor.emissive=new THREE.Color(K.beast?'#7a0a10':0);
    M.hand.color.set(K.beast?'#3a2130':'#aab0bc'); if(K.beast){ M.belt.color.set('#5a1016'); } K.shapeKey=key||''; };
  // dress from the save: livery colours, its shapes, the gear you wear, and the weapon in hand
  K.dress=function(S){ const lv=S.livery||'azure'; K._lvKey=lv; K.setLivery(lv==='champion'?'champion':lv==='glory'?'aog':lv==='ranger'?'ranger':'knight', SYS.LIVERIES[lv]);
    const look={}; Object.values(S.equip||{}).forEach(id=>{ const l=SYS.GEAR_LOOK&&SYS.GEAR_LOOK[id]; if(l) Object.assign(look,l); }); if(!(SYS.LIVERIES[lv]&&SYS.LIVERIES[lv].HELM&&lv!=='azure')) K.setGearLook(look); else { const l2=Object.assign({},look); delete l2.helm; delete l2.paul; K.setGearLook(l2); }
    if(lv==='glory'){ M.shield.color.set('#e8c45a'); M.field.color.set('#fffdf4'); M.cross.color.set('#e8c45a'); }
    if(lv==='ranger'){ M.shield.color.set('#5c6270'); M.field.color.set('#94623a'); M.cross.color.set('#c0392e'); }
    K.shape(lv); const w=S.equip&&S.equip.weapon; K.setWeapon(w&&SYS.WEAPON_ART?(SYS.WEAPON_ART[w]||SYS.WEAPON_ART.rusty):null,w); if(typeof inkify==='function') inkify(K,0.012); };
  // KLK's GEAR_LOOK: worn pieces recolour helm, shoulders, belt, legs and shield (after the livery, as in drawKnightBody)
  K.setGearLook=function(look){ const h=s=>parseInt(String(s).slice(1),16);
    if(look.helm) M.helm.color.setHex(h(look.helm[0])); if(look.paul) M.paul.color.setHex(h(look.paul[0])); if(look.belt) M.belt.color.setHex(h(look.belt[0]));
    if(look.leg) M.leg.color.setHex(h(look.leg[0])); if(look.shield){ M.shield.color.setHex(h(look.shield.rim)); M.field.color.setHex(h(look.shield.field)); M.cross.color.setHex(h(look.shield.cross)); } };
  K.setLivery('knight');

  // ── animation ──
  // a gait that runs from a walk into a run with the speed (longer stride, forward lean, arms pumping, a bounce), an idle that
  // breathes, shifts its weight and glances about, a lean into turns, a flinch when struck, a crouch in the dodge and a tuck in
  // the air — and three blows, each with its wind-up, its cut and its follow-through: a forehand sweep, a rising backhand, and
  // the overhead chop (heavy weapons and the Ground Pound)
  AR.sh.rotation.order='YXZ';
  let t=0, walk=0, swing=-1, sk=1, srate=3.2, flinch=0, prevYaw=null, lean=0;
  // poses: shoulder x / y / z, elbow x, torso yaw / pitch, hips forward, front and back hip
  // V93: each cut in five beats — rest, the coil (wind-up, body turned away), the strike (accelerating through the target),
  //  the follow-through (the blade carries on past and the body unwinds after it), and the recovery. The hips step into it.
  const BLOWS={
    1:[[0,{x:-0.5,y:0,z:-0.1,e:-0.6,ty:0,tp:0,hz:0,lh:0,rh:0,w:0}],
       [0.28,{x:-1.6,y:-1.0,z:-0.35,e:-1.3,ty:-0.55,tp:-0.04,hz:-0.03,lh:-0.05,rh:0.12,w:0.9}],
       [0.42,{x:-1.15,y:0.3,z:-0.12,e:-0.4,ty:0.12,tp:0.12,hz:0.1,lh:-0.4,rh:0.25,w:1.2}],
       [0.62,{x:-0.6,y:1.05,z:0.02,e:-0.28,ty:0.55,tp:0.18,hz:0.14,lh:-0.55,rh:0.35,w:1.35}],
       [1,{x:-0.5,y:0,z:-0.1,e:-0.6,ty:0,tp:0,hz:0,lh:0,rh:0,w:0}]],
    2:[[0,{x:-0.5,y:0,z:-0.1,e:-0.6,ty:0,tp:0,hz:0,lh:0,rh:0,w:0}],
       [0.28,{x:-0.9,y:1.15,z:0.15,e:-1.2,ty:0.5,tp:0.08,hz:0,lh:-0.1,rh:0.1,w:1.1}],
       [0.42,{x:-1.35,y:-0.1,z:-0.15,e:-0.35,ty:-0.1,tp:0.05,hz:0.08,lh:-0.35,rh:0.25,w:1.3}],
       [0.62,{x:-1.9,y:-1.0,z:-0.3,e:-0.3,ty:-0.55,tp:-0.02,hz:0.12,lh:-0.5,rh:0.3,w:1.35}],
       [1,{x:-0.5,y:0,z:-0.1,e:-0.6,ty:0,tp:0,hz:0,lh:0,rh:0,w:0}]],
    0:[[0,{x:-0.5,y:0,z:-0.15,e:-0.6,ty:0,tp:0,hz:0,lh:0,rh:0,w:0}],
       [0.3,{x:-3.0,y:-0.15,z:-0.15,e:-1.5,ty:-0.2,tp:-0.15,hz:-0.05,lh:0,rh:0.1,w:0.4}],
       [0.45,{x:-1.1,y:0.05,z:-0.1,e:-0.2,ty:0.2,tp:0.25,hz:0.12,lh:-0.5,rh:0.35,w:0.9}],
       [0.64,{x:-0.35,y:0.1,z:-0.1,e:-0.15,ty:0.35,tp:0.38,hz:0.18,lh:-0.65,rh:0.45,w:1.0}],
       [1,{x:-0.5,y:0,z:-0.15,e:-0.6,ty:0,tp:0,hz:0,lh:0,rh:0,w:0}]] };
  const IO=u=>u<0.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2, EASE=[IO, u=>u*u, u=>1-Math.pow(1-u,3), IO],   // coil · accelerate into the strike · carry through and slow · settle
  lerpPose=(K2,k)=>{ let i=0; while(i<K2.length-2&&k>K2[i+1][0]) i++; const [k0,a]=K2[i], [k1,b]=K2[i+1], u=(EASE[i]||EASE[0])(Math.max(0,Math.min(1,(k-k0)/(k1-k0)))), o={}; for(const n in a) o[n]=a[n]+(b[n]-a[n])*u; return o; };
  // how far the blade is turned about its own length through each blow, measured so the cutting edge leads the stroke
  //  at rest he carries it edge up (V91), so the turn runs from there and back
  const RR=-Math.PI/2, ROLL={1:[[0,RR],[0.3,-0.75],[0.6,-0.75],[1,RR]],2:[[0,RR],[0.3,0.26],[0.6,0.26],[1,RR]],0:[[0,RR],[1,RR]]}, rollAt=(K2,k)=>{ let i=0; while(i<K2.length-2&&k>K2[i+1][0]) i++; const [k0,a]=K2[i], [k1,b]=K2[i+1], u=smooth01((k-k0)/(k1-k0)); return a+(b-a)*u; };
  // V93: a faint swoosh that follows the blade itself through the fast part of a cut (and the Spin Attack), fading behind it
  const TN=12, tb=[], _t1=new THREE.Vector3(), _t2=new THREE.Vector3(); let trail=null, trailOn=false, bladeLen=0;
  function bladeTop(){ let top=0.5; swRoll.traverse(m=>{ if(!m.isMesh||!m.visible) return; let v=true, o=m; while(o&&o!==swRoll){ if(!o.visible) v=false; o=o.parent; } if(!v) return; m.geometry.computeBoundingBox(); top=Math.max(top,m.position.y+(m.parent!==swRoll?m.parent.position.y:0)+m.geometry.boundingBox.max.y*m.scale.y); }); return top; }
  function trailTick(){ const par=K.parent; if(!par) return;
    if(!trail){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TN*6),3)); g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(TN*6),3)); const ix=[]; for(let i=0;i<TN-1;i++){ const a=i*2; ix.push(a,a+1,a+2,a+1,a+3,a+2); } g.setIndex(ix);
      trail=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); trail.frustumCulled=false; trail.renderOrder=5; }
    if(trail.parent!==par) par.add(trail);
    const on=trailOn||(K.spinT!==undefined&&K.spinT>=0&&K.spinT<0.95);
    if(on&&sword.parent===AR.hand){ if(!bladeLen) bladeLen=bladeTop(); K.updateMatrixWorld(true); tb.unshift([swRoll.localToWorld(_t1.set(0,bladeLen*0.45,0)).clone(),swRoll.localToWorld(_t2.set(0,bladeLen*0.97,0)).clone()]); if(tb.length>TN) tb.pop(); }
    else if(tb.length) tb.pop();
    trail.visible=tb.length>1; if(!trail.visible) return;
    const P=trail.geometry.attributes.position.array, Cc=trail.geometry.attributes.color.array, col=K._trailCol||[0.75,0.82,1];
    for(let i=0;i<TN;i++){ const q=tb[Math.min(i,tb.length-1)], f=Math.pow(1-i/(TN-1),1.6)*(i<tb.length?1:0);
      P.set([q[0].x,q[0].y,q[0].z,q[1].x,q[1].y,q[1].z],i*6); Cc.set([col[0]*f*0.25,col[1]*f*0.25,col[2]*f*0.25,col[0]*f,col[1]*f,col[2]*f],i*6); }
    trail.geometry.attributes.position.needsUpdate=true; trail.geometry.attributes.color.needsUpdate=true; }
  K.swing=(kind,dur)=>{ sk=kind===0||kind===2?kind:1; srate=dur?1/dur:3.2; swing=0; };
  K.hit=()=>{ flinch=1; };
  // the body in motion (V56): his feet are planted — each stride is measured against how fast he really travels, and the
  //  legs are solved to reach the ground (two-bone IK), so a foot on the ground stays put while the body passes over it, then
  //  lifts and swings through. The pelvis turns, rolls and carries his weight over the standing leg; the shoulders turn
  //  against it; the arms swing opposite the legs and lag a beat behind; the head stays level and looks about on its own
  //  springs; he leans into speeding up and rocks back when he stops; plume, cape and skirts follow through on springs
  const _wp=new THREE.Vector3(), _ws=new THREE.Vector3(); let _lp=null, vRaw=0, vS=0, vPrev=0, acc=0, ph=0, hyPrev=null, shiftS=0;
  const SP=()=>({x:0,v:0}), spr=(o,tg,k,c,dt)=>{ const n=Math.max(1,Math.ceil(dt/0.017)), h=dt/n; for(let i=0;i<n;i++){ o.v+=(k*(tg-o.x)-c*o.v)*h; o.x+=o.v*h; } return o.x; };
  const sArmR={x:SP(),y:SP(),z:SP(),e:SP()}, sArmL={x:SP(),y:SP(),z:SP(),e:SP()}, sHandR=SP(), sLean=SP(), sCape=SP(), sGx=SP(), sGy=SP(); let gazeT=0, gazeX=0, gazeY=0, primed=false;
  const smooth01=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
  function legIK(G,f,dn,lt,ls){ let D=Math.hypot(f,dn); const mx=(lt+ls)*0.9995; if(D>mx) D=mx; const cl=v=>Math.max(-1,Math.min(1,v));
    const bend=Math.PI-Math.acos(cl((lt*lt+ls*ls-D*D)/(2*lt*ls))), al=Math.atan2(f,dn), g=Math.acos(cl((lt*lt+D*D-ls*ls)/(2*lt*D)));
    G.hip.rotation.x=-(al+g); G.knee.rotation.x=bend; }
  const _mq=new THREE.Quaternion(), _mp=new THREE.Quaternion(), _mv=new THREE.Vector3(), _MD=new THREE.Vector3(0,-1,0);
  K.mot={v:0,acc:0,vy:0,a:0,rf:0,ph:0}; const _sp=new THREE.Vector3(), _hp=new THREE.Vector3(), _ax=new THREE.Vector3(), _pre=new THREE.Vector3(), _sq=new THREE.Quaternion(), _hq=new THREE.Quaternion(), _dq=new THREE.Quaternion(), _de=new THREE.Euler();
  K.animate=function(dt,mode,speed){
    dt=Math.max(0,dt||0); t+=dt; const moving=mode==='walk', sp=speed||1; dt=Math.min(dt,0.1);
    // how fast he really travels (world → his own scale)
    K.getWorldPosition(_wp); _ws.setFromMatrixScale(K.matrixWorld); const wsc=_ws.x||1;
    if(_lp&&dt>0){ const dv=Math.hypot(_wp.x-_lp.x,_wp.z-_lp.z)/dt/wsc; vRaw=dv<16?dv:vRaw; } _lp=(_lp||new THREE.Vector3()).copy(_wp);
    vS+=(vRaw-vS)*Math.min(1,dt*10); acc+=(((vS-vPrev)/Math.max(dt,1e-3))-acc)*Math.min(1,dt*6); vPrev=vS;
    K._amt=(K._amt||0)+((moving?1:0)-(K._amt||0))*Math.min(1,dt*7);
    const a=K._amt, ia=1-a, lt=Math.abs(L.knee.position.y)||0.3, ls=K.hipY-lt+0.012, legLen=lt+ls, sc=legLen/0.812, hx=Math.abs(L.hip.position.x)||0.1;
    const veff=moving?(vS>0.3?vS:(1.3+2.8*Math.min(1,sp))*sc):0;   // walking on the spot (a cutscene, a pastime): a pace from the stick
    const vb=veff/sc, rf=a*smooth01((vb-1.7)/1.3);                     // body-relative speed; how much of it is a run
    // the lean into a turn
    const yaw=K.rotation.y; if(prevYaw!==null&&dt>0){ let dy=yaw-prevYaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; lean+=(Math.max(-0.16,Math.min(0.16,-dy/dt*0.035))*a-lean)*Math.min(1,dt*6); } prevYaw=yaw;
    // the stride: the walk and run cycles (GAIT) blended by speed, played at the cadence that matches the ground speed to the
    //  standing foot, within what a body can do — past that, the stride holds its pace and the foot gives a little
    // the pace: a natural cadence for a walk or a run; the stride lengthens (or shortens) to cover the ground at it, and only
    //  past what a stride can reach does the cadence give — so the feet keep time with the ground instead of outrunning it
    const W=GAIT.walk, Rn=GAIT.run, rw0=rf/Math.max(a,1e-3), kk=W.k+(Rn.k-W.k)*rw0, cn=W.cnat+(Rn.cnat-W.cnat)*rw0;
    const mS=Math.max(0.6,Math.min(1.32,vb/(kk*cn))), cad=Math.max(W.cmin+(Rn.cmin-W.cmin)*rw0,Math.min(W.cmax+(Rn.cmax-W.cmax)*rw0,vb/(kk*mS)));
    if(moving||a>0.02) ph=(ph+cad*dt*(moving?1:a))%1;
    walk=ph*Math.PI*2; const s=Math.sin(walk), c=Math.cos(walk), TAU=Math.PI*2, rw=rf/Math.max(a,1e-3);
    const breath=Math.sin(t*1.9), shift=Math.sin(t*0.55); shiftS+=(Math.tanh(2.6*Math.sin(t*0.42))-shiftS)*Math.min(1,dt*2);   // the weight, held on one leg, then the other
    const gL=GAIT.pose(ph,rw,lt,ls,mS), gR=GAIT.pose((ph+0.5)%1,rw,lt,ls,mS);   // each leg: hip, knee, its drop below the hip, the lift
    const lp=Math.cos(TAU*ph), stL=Math.cos(TAU*(ph-0.12-0.03*(1-rw)));
    // the pelvis: as high as the lower foot lets it be (so a foot on the ground is on the ground), lifted in a run's flight
    const hyG=(1-rw)*Math.max(gL.d,gR.d)+rw*Math.max(gL.y,Math.max(gL.d,gR.d)-0.004), hyI=K.hipY+0.007-0.004*(0.5+0.5*breath)-0.005*Math.abs(shiftS);   /* V165: standing tall — knees all but straight, as a man stands at ease */
    const hy=a*hyG+ia*hyI;
    const vy=hyPrev===null||dt<=0?0:(hy-hyPrev)/dt; hyPrev=hy;
    const sway=a*0.016*sc*stL*(1-0.6*rf)+ia*0.012*sc*shiftS, roll=a*0.028*stL*(1-0.5*rf)+ia*0.016*shiftS, pYaw=-0.08*a*lp*(1-0.3*rf);
    hips.position.set(sway,hy,0); hips.rotation.set(0,pYaw,roll);
    [[L,gL,1],[R,gR,-1]].forEach(([G,g,sd])=>{ const fI=(sd>0?0.012:-0.006)*sc, dn=hyI+sd*hx*Math.sin(roll);
      legIK(G,fI,dn,lt,ls); const ih=G.hip.rotation.x, ik=G.knee.rotation.x;   // at rest: planted by IK
      G.hip.rotation.x=a*g.h+ia*ih; G.knee.rotation.x=a*g.k+ia*ik; G.hip.rotation.z=-roll-sway/Math.max(0.3,hy); });
    // the trunk: pitched into speed, rocked by acceleration, turned against the pelvis; the head kept level
    const lean2=spr(sLean,Math.max(-0.14,Math.min(0.2,acc*0.05*a)),70,9,dt);
    torso.rotation.set(0.005+0.065*a+0.11*rf+lean2, -pYaw*1.8, lean-roll*1.05);
    if(--gazeT<=0||!primed){ primed=true; gazeT=90+Math.random()*200; const r=Math.random(); gazeY=r<0.35?0:(Math.random()-0.5)*0.9; gazeX=(Math.random()-0.6)*0.18; }
    const gy=spr(sGy,ia*gazeY*smooth01((Math.sin(t*0.17+1)+0.6)),40,11,dt), gx=spr(sGx,ia*gazeX,40,11,dt);
    head.rotation.set(-(torso.rotation.x)*0.8+0.03*breath*ia+gx, -torso.rotation.y*0.7+gy, -(torso.rotation.z)*0.6);
    chest.scale.set(1+0.022*breath*ia,1+0.006*breath*ia,1+0.022*breath*ia);
    // the arms swing against the legs, a beat behind (springs), elbows bending as they come forward
    // the arms hang loose: they swing a beat behind the legs (and further in a run), the elbow folding as each comes
    //  forward and opening as it goes back, the forearm and wrist trailing; at rest they settle, breathe and drift
    const lpA=Math.cos(TAU*(ph-0.05)), armSw=a*(0.3+0.48*rf)*lpA, fwdR=Math.max(0,armSw), fwdL=Math.max(0,-armSw), drift=ia*0.03*Math.sin(t*0.7);
    AL.sh.rotation.x=spr(sArmL.x,armSw*0.5-0.24-0.25*rf-0.02*breath*ia+drift,48,7,dt); AL.el.rotation.x=spr(sArmL.e,-0.62-0.3*rf-0.3*fwdL,40,6,dt); AL.sh.rotation.z=spr(sArmL.z,K.armOut+0.04*breath*ia+0.05*a*stL+0.06*rf,40,6,dt); AL.sh.rotation.y=spr(sArmL.y,-0.12*armSw+(K.shTurn||0),40,6,dt);
    // V137: MOTION CAPTURE — the rig (rig.js) plays its idle / walk / run, and its pose is laid onto his pivots: pelvis, chest
    //  and head take the bones' turn; thighs, shins, upper arms and forearms are pointed along the bones; the pelvis rides
    //  the hips' rise and sway. Eased in on foot, out for anything the clips don't cover (sitting, fishing, riding, the air,
    //  the dodge) — and the sword arm keeps its own carry (it's set below), as do the blows, the guard and the rest
    { if(K._act){ K._act.t+=dt; if(K._act.t>=K._act.dur+(K._act.hold||0)){ const nx=K._act.then; K._act=null; if(nx) K.act(nx.n,nx.dur,nx); } } const want=K.mocap&&!K.mocapOff&&(mode==='walk'||mode==='idle'||K._act)&&mode!=='ride'&&mode!=='fish'&&mode!=='sit'&&mode!=='kneel'&&mode!=='climb'&&mode!=='lie'&&mode!=='knock'?1:0; K._mw=(K._mw||0)+(want-(K._mw||0))*Math.min(1,dt*6);
      const w=K._mw; if(w>0.01&&K.mocap){ const RG=K.mocap;
        // the clips laid over the gaits: a blow (the body of Mixamo's sword-and-shield attacks, timed to the swing — the sword arm
        //  keeps its own cut), the guard (the block stance: knees bent, weight back behind the shield)
        K._bw=(K._bw||0)+((K.guarding&&swing<0?1:0)-(K._bw||0))*Math.min(1,dt*10); let ov=null;
        // V139: the rest of Zak's clips — a one-shot (K.act: falling in battle, kneeling to sow), the bow's draw and loose, the
        //  jump and the long fall, the sword drawn and sheathed; and the gaits change with him: sword away, a calmer stand and an
        //  easy run; badly hurt, the injured walk
        if(K.air>0.02) K._airT=(K._airT||0)+dt; else K._airT=0;
        if(K._st!==K._st0){ if(K._st==='drawn'&&K._st0==='sheathed'&&!K._act) K._act=K._carry==='back'?{n:'drawBack',t:0,dur:0.7,w:0.6,arms:false}:{n:'draw',t:0,dur:0.45,w:0.6,arms:false};   /* V144: from the hip, or over the shoulder for the big ones */ K._st0=K._st; }
        const A0=K._act;
        if(A0) ov={n:A0.n,u:(A0.u0||0)+((A0.u1===undefined?1:A0.u1)-(A0.u0||0))*Math.min(1,A0.t/A0.dur),w:A0.w,fade:A0.fade||10};
        else if(swing>=0) ov=K._fam==='bow'?{n:'shoot',u:Math.min(1,swing),w:0.85}:{n:sk===0?'atk3':sk===2?'atk2':'atk1',u:0.08+0.78*Math.min(1,swing),w:srate>2.4?0.65:0.8,fade:16};   /* a quick cut takes less of the clip's lunge */
        else if(K.falling>0&&!(K.raise>0)) ov={n:'fall',t:0.35+K.falling*1.15,w:Math.min(0.92,0.45+K.falling*3),fade:9};   /* V165: off a ledge, the falling clip from the first moment — arms up and out, legs reaching for the ground */
        else if(K._airT>0&&!(K.raise>0)) ov=K._airT<1.1?{n:'jump',u:Math.min(1.5,0.62+K._airT)/2.6,w:0.9}:{n:'fall',t:K._airT,w:0.9};
        else if(K._st==='sheathing') ov={n:K._carry==='back'?'sheath':'sheathHip',u:Math.min(1,K._shT||0),w:0.7};
        else if(K._bw>0.01) ov={n:'block',t:t,w:K._bw};
        const S1=typeof GAME!=='undefined'&&GAME.S, hurt=!K.npc&&S1&&S1.maxHp&&S1.hp<S1.maxHp*0.25, calm=K._st==='sheathed'||!(K.alert||K.guarding||swing>=0||K.raise>0||K.charge>0);   /* V155: no fight on, no fighting stance */
        if(K.npc&&!ov&&(K._talk||0)>0.2) ov={n:'agree',t:t+(K._tph||0),w:0.45*K._talk};   /* the folk nod along as they talk */
        /* V142: walk or run by how fast he truly goes (in hip heights a second), eased — not the hand-keyed gait's own blend */
        const vH=veff/K.hipY; K._rfM=(K._rfM||0)+(smooth01((vH-2.9)/0.6)-(K._rfM||0))*Math.min(1,dt*5);
        RG.step(dt,a,K._rfM,vH,ov,K.npc?{idle:'idleCalm',walk:'walk',run:'walk'}:K.crouch?{idle:'sneak',walk:'sneak',run:'sneak',idleAt:0.3}:{idle:calm?'idleCalm':'idle',walk:hurt?'walkInj':'walk',run:hurt?'walkInj':calm?'runCalm':'run'});
        K._rArm=!!(A0&&A0.arms!==false)||!!(RG.ual&&!K.npc&&K._st==='sheathed'&&swing<0&&!(K.raise>0)&&!(K.charge>0)&&!(K.spinT>=0)&&!K.guarding);   /* V192: sword away, the new clips swing both arms */
        const kq=(o,out)=>{ out.identity(); for(let q=o.parent;q&&q!==K;q=q.parent) out.premultiply(q.quaternion); return out; };
        const turn=(o,n,ww)=>{ RG.q(n,_mq); kq(o,_mp); _mp.invert().multiply(_mq); o.quaternion.slerp(_mp,ww); };
        const point=(o,a0,b0,ww)=>{ _mv.subVectors(RG.p(b0),RG.p(a0)).normalize(); kq(o,_mp); _mv.applyQuaternion(_mp.invert()); _mq.setFromUnitVectors(_MD,_mv); o.quaternion.slerp(_mq,ww); };
        // V155: EASIER ON HIS FEET. Out of a fight the clips are laid on more lightly, over the hand-keyed rest (breathing, the
        //  weight shifting from leg to leg, arms hanging loose): standing, most of the stance is the relaxed one; walking, the
        //  clip keeps the legs (the feet stay true to the ground) but much less of its hip roll, shoulder turn and arm swing
        K._rlx=(K._rlx||0)+(((calm&&!ov)?1:0)-(K._rlx||0))*Math.min(1,dt*3); const rx=RG.ual?0:K._rlx, wk=a*(1-K._rfM)   /* V192: the new clips are the stance and the stride whole — nothing of the old hand-keyed rest laid under them */, sw=1-0.72*wk*rx;
        const wI=w*(1-0.8*ia*rx), wHip=wI*sw*(1-0.6*ia*rx), wTor=wI*(1-0.7*wk*rx), wLeg=wI*(1-0.4*wk*rx)*(1-0.75*ia*rx), wArm=wI*(1-0.7*wk*rx);   /* V165: at ease the clip's planted fighter's legs barely show */
        const hp=RG.p('Hips'), hb=RG.pb('Hips'), k=K.hipY/RG.hipH;
        hips.position.y+=((K.hipY*hp.y/hb.y)-hips.position.y)*wLeg; hips.position.x+=((hp.x-hb.x)*k*0.6*(1-0.6*wk*rx)-hips.position.x)*wHip;
        turn(hips,'Hips',wHip); turn(torso,RG.ual?'Spine1':'Spine2',wTor);   /* V192: his breastplate is one piece — it takes the middle of the new spine, not the bowed top of it */ turn(head,'Head',wTor);
        point(L.hip,'LeftUpLeg','LeftLeg',wLeg); point(L.knee,'LeftLeg','LeftFoot',wLeg); point(R.hip,'RightUpLeg','RightLeg',wLeg); point(R.knee,'RightLeg','RightFoot',wLeg);
        point(AL.sh,'LeftArm','LeftForeArm',wArm); point(AL.el,'LeftForeArm','LeftHand',wArm);
        if(K._rArm){ point(AR.sh,'RightArm','RightForeArm',w); point(AR.el,'RightForeArm','RightHand',w); }
        // the springs that keep the left arm loose follow the pose he's now in, so nothing snaps when the clips ease out
        sArmL.x.x=AL.sh.rotation.x; sArmL.z.x=AL.sh.rotation.z; sArmL.e.x=AL.el.rotation.x; } }
    if(K.crouch&&!(K.mocap&&!K.mocapOff&&K._mw>0.5)){ hips.position.y-=0.13; torso.rotation.x+=0.3; L.hip.rotation.x-=0.45; R.hip.rotation.x-=0.45; L.knee.rotation.x+=0.75; R.knee.rotation.x+=0.75; }   /* V140: crouched, the hand-keyed way */
    K.mot.v=vS; K.mot.acc=acc; K.mot.vy=vy; K.mot.a=a; K.mot.rf=rf; K.mot.ph=ph;
    // the guard, eased in and out (~0.1 s): upper arm forward and in, forearm level across the chest, the shield squarely
    //  in front of him with its point down; a slight crouch and the torso turned shield-side into the blow
    K._g=(K._g||0)+((K.guarding?1:0)-(K._g||0))*Math.min(1,dt*16); const gk=K._g, ik=1-gk, mixv=(a,b)=>a*ik+b*gk; const rest=-(AL.sh.rotation.x+AL.el.rotation.x);
    AL.sh.rotation.x=mixv(AL.sh.rotation.x,-1.22); AL.sh.rotation.y=mixv(0,0.15); AL.sh.rotation.z=mixv(AL.sh.rotation.z,-0.22);
    AL.el.rotation.x=mixv(AL.el.rotation.x,0); AL.el.rotation.z=mixv(0,-1.5);
    sh.rotation.z=mixv(rest,Math.PI/2); shM.rotation.y=mixv(K.shRY,Math.PI/2); shM.position.y=mixv(K.shY,K.shY+0.01); shM.position.x=mixv(K.shX,K.shX+0.007);
    if(gk>0.01){ torso.rotation.y-=0.22*gk; hips.position.y-=0.03*gk; torso.rotation.x+=0.08*gk; L.knee.rotation.x+=0.25*gk; R.knee.rotation.x+=0.25*gk; }
    sCape.v-=vy*0.9*dt*60*0.05; capeP.rotation.x=spr(sCape,0.08+(0.12+0.22*rf)*a+Math.max(0,acc)*0.02+Math.sin(t*3+walk)*0.03*a+0.03*breath*ia,32,4.5,dt);
    if(wingKind) wings.children.forEach(w=>{ if(w.sd) w.rotation.y=w.sd*(0.55+Math.sin(t*(wingKind==='robby'?1.6:2.1))*0.12); });
    if(K.beast){ const eb=(Math.sin(t*3.8)+1)/2; M.visor.color.set(eb>0.5?'#ff3a44':'#d01820'); smoke.material.opacity=0.28+0.08*Math.sin(t*1.9); }
    if(wpnG&&wpnG.userData.halo) wpnG.userData.halo.material.opacity=0.22+0.1*Math.sin(t*3);
    if(swing>=0){ swing+=dt*srate; const k=Math.min(1,swing), o=lerpPose(BLOWS[sk],k);
      AR.sh.rotation.set(o.x,o.y,o.z); AR.el.rotation.x=o.e; AR.hand.rotation.x=o.w; torso.rotation.y+=o.ty; torso.rotation.x+=o.tp; hips.position.z=o.hz;
      L.hip.rotation.x+=o.lh; R.hip.rotation.x+=o.rh; L.knee.rotation.x+=Math.max(0,-o.lh)*0.5; R.knee.rotation.x+=o.rh*0.6;
      AL.sh.rotation.x+=Math.abs(o.ty)*0.35*(1-gk); head.rotation.y-=o.ty*0.6;                                  // the shield arm draws back as he turns; his eyes stay on the foe
      swRoll.rotation.y=rollAt(ROLL[sk],k);
      trailOn=k>(sk===0?0.33:0.3)&&k<(sk===0?0.66:0.64);
    } else { const want=(K.charge>0||(K.spinT!==undefined&&K.spinT>=0)||sword.parent!==AR.hand||K._st==='sheathing')?0:RR; swRoll.rotation.y+=(want-swRoll.rotation.y)*Math.min(1,dt*12);   // edge up in the hand; flat for the spin and the scabbard
    }
    if(swing>=0){
      if(swing>=1) swing=-1;
    } else if(K.raise>0){ AR.sh.rotation.set(-0.4-K.raise*2.5,0,-0.15); AR.el.rotation.x=-0.3-K.raise*0.9; hips.position.z=0; AR.hand.rotation.x=0.3*K.raise; }   // the wind-up: sword drawn back over the shoulder
    else if(!(K._rArm&&K._mw>0.5)) { AR.sh.rotation.set(spr(sArmR.x,-armSw-0.12-0.2*rf-drift,48,7,dt), spr(sArmR.y,0.2*armSw,40,6,dt), spr(sArmR.z,-K.armOut-0.06*rf-0.03*breath*ia-0.05*a*stL,40,6,dt)); AR.el.rotation.x=spr(sArmR.e,-0.3-0.6*fwdR-0.9*rf,40,6,dt); hips.position.z=0; AR.hand.rotation.x=spr(sHandR,0.12*armSw-0.12*rf,45,6,dt); }
    // the Spin Attack: charging, the blade drawn back low across the body and shining; then the whole turn, arm out
    if(K.charge>0&&swing<0){ const k=K.charge; AR.sh.rotation.set(-0.35,-0.95*k,-0.55*k); AR.el.rotation.x=-0.25; AR.hand.rotation.x=0.5*k; torso.rotation.y+=0.35*k; L.knee.rotation.x+=0.2*k; R.knee.rotation.x+=0.2*k; hips.position.y-=0.03*k;
      M.blade.emissive.setRGB(0.3+0.6*k,0.28+0.55*k,0.18+0.3*k); } else if(!K._wpnGlow) M.blade.emissive.setHex(0x4a505e);
    if(K.spinT!==undefined&&K.spinT>=0){ K.spinT+=dt/0.36; const u=Math.min(1,K.spinT), e=1-Math.pow(1-u,2.2); K.spinA=-e*Math.PI*2;
      AR.sh.rotation.set(-1.45,0.15,-1.25); AR.el.rotation.x=-0.1; AR.hand.rotation.x=1.45; torso.rotation.x+=0.1; L.knee.rotation.x+=0.3; R.knee.rotation.x+=0.3; hips.position.y-=0.05;
      if(u>=1){ K.spinT=-1; K.spinA=0; } }
    if(swing<0) trailOn=false; trailTick();
    // a flinch when struck: thrown back a moment, head snapped, then square again
    if(flinch>0){ flinch=Math.max(0,flinch-dt*4); const f=Math.sin(flinch*Math.PI)*(flinch>0.5?1:flinch*2); torso.rotation.x-=0.32*f; head.rotation.x-=0.25*f; hips.position.z-=0.08*f; AR.sh.rotation.x+=0.4*f; hips.position.y-=0.02*f; }
    // the dodge: low and leaning into it
    if(K.dash>0&&!(K._act&&K._act.n==='roll')){ const d=K.dash; torso.rotation.x+=0.42*d; hips.position.y-=0.12*d; L.hip.rotation.x-=0.7*d; R.hip.rotation.x+=0.5*d; L.knee.rotation.x+=0.9*d; R.knee.rotation.x+=0.6*d; capeP.rotation.x+=0.4*d; }
    // V165: landing — the knees take the weight and give, deeper the further he fell, then he straightens
    if(K.landK>0&&K.landT!==undefined){ K.landT+=dt; const dur=0.28+0.3*K.landK, u=K.landT/dur; if(u>=1) K.landK=0; else { const d=K.landK*(u<0.28?Math.sin(u/0.28*Math.PI/2):Math.cos((u-0.28)/0.72*Math.PI/2));   /* down fast, up slow */
      hips.position.y-=0.14*d; L.hip.rotation.x-=0.55*d; R.hip.rotation.x-=0.5*d; L.knee.rotation.x+=0.95*d; R.knee.rotation.x+=0.9*d; torso.rotation.x+=0.3*d; head.rotation.x-=0.15*d; capeP.rotation.x+=0.25*d; } }
    // in the air (the leap of the Ground Pound): legs tucked, knees up
    if(K.air>0.02&&!(K.mocap&&!K.mocapOff&&K._mw>0.5&&!(K.raise>0))){ const u=Math.min(1,K.air*1.6); L.hip.rotation.x=-1.0*u; R.hip.rotation.x=-0.55*u; L.knee.rotation.x=1.5*u; R.knee.rotation.x=1.1*u; torso.rotation.x+=0.12*u; capeP.rotation.x=0.6*u+0.1; AL.sh.rotation.x-=0.3*u*(1-gk); }
    if(mode==='sit'){ L.hip.rotation.x=R.hip.rotation.x=-1.45; L.knee.rotation.x=R.knee.rotation.x=1.45; hips.position.set(0,K.hipY-0.2,0); hips.rotation.set(0,0,0); L.hip.rotation.z=R.hip.rotation.z=0; torso.rotation.set(-0.08,0,0); head.rotation.set(0,0,0);   // seated: thighs level, shins down
      AL.sh.rotation.x=AR.sh.rotation.x=-0.55; AR.sh.rotation.y=0; AL.el.rotation.x=AR.el.rotation.x=-0.7; capeP.rotation.x=0.05; }
    // V151: kneeling — before a tomb, before a general's blessing: one knee to the floor, the other foot planted, head bowed
    if(mode==='kneel'){ hips.position.set(0,K.hipY-0.34,0.04); hips.rotation.set(0,0,0); L.hip.rotation.set(-1.45,0,0); L.knee.rotation.x=1.5; R.hip.rotation.set(0.32,0,0); R.knee.rotation.x=1.8;
      torso.rotation.set(0.26,0,0); head.rotation.set(0.38,0,0); AL.sh.rotation.set(-0.35,0,0.12); AL.el.rotation.x=-0.55; AR.sh.rotation.set(-0.7,0.25,-0.1); AR.el.rotation.x=-0.95; capeP.rotation.x=0.18; }
    // V164: lying back in a hammock — flat on his back, hands folded on his chest, his head propped a little
    if(mode==='lie'){ const br=Math.sin(t*1.3)*0.015; hips.position.set(0,0.22,-0.1); hips.rotation.set(-Math.PI/2+0.06,0,0);
      L.hip.rotation.set(0.02,0,0.05); L.knee.rotation.x=0.12; R.hip.rotation.set(0.06,0,-0.05); R.knee.rotation.x=0.2;
      torso.rotation.set(0.02+br,0,0); head.rotation.set(0.35,0.1,0); AL.sh.rotation.set(-0.55,0,0.62); AL.el.rotation.x=-1.35; AR.sh.rotation.set(-0.55,0,-0.62); AR.el.rotation.x=-1.35; capeP.rotation.x=0; }
    // V165: KNOCKED DOWN (Dylan's shove): he staggers back, arms flung up, goes over onto his back, lies dazed a moment
    //  (the head lolls, then shakes), sits up through his knees and is on his feet again — 2.6 s, eased all through
    if(mode==='knock'){ K._kn=(K._kmode?K._kn:0)+dt; const u=K._kn, sm=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
      const f=u<0.22?0:u<0.68?sm((u-0.22)/0.46):u<1.75?1:u<2.6?1-sm((u-1.75)/0.85):0, st=u<0.3?Math.sin(Math.min(1,u/0.3)*Math.PI):0, bump=Math.sin(Math.PI*f)*(u>1.75?1:0.5), L2=(a,b)=>a+(b-a)*f;
      hips.position.set(hips.position.x*(1-f),L2(hips.position.y,0.2)-0.18*bump,L2(0,-0.28)); hips.rotation.set(L2(hips.rotation.x,-Math.PI/2+0.08)+0.35*bump*(u>1.75?1:0),hips.rotation.y*(1-f),hips.rotation.z*(1-f));
      L.hip.rotation.set(L2(L.hip.rotation.x,-0.25)-1.1*bump,0,L2(L.hip.rotation.z,0.12)); R.hip.rotation.set(L2(R.hip.rotation.x,-0.05)-0.9*bump,0,L2(R.hip.rotation.z,-0.1)); L.knee.rotation.x=L2(L.knee.rotation.x,0.35)+1.3*bump; R.knee.rotation.x=L2(R.knee.rotation.x,0.15)+1.1*bump;
      const daze=u>0.75&&u<1.75?Math.min(1,(u-0.75)*3)*(1-Math.max(0,(u-1.5)*4)):0;
      torso.rotation.set(L2(torso.rotation.x,0.05)-0.38*st+0.5*bump*(u>1.75?1:0),0,0); head.rotation.set(L2(head.rotation.x,0.45)-0.25*st+0.25*daze,Math.sin(u*9)*0.35*daze,Math.sin(u*4)*0.12*daze);
      const fl=Math.max(st,f*(u<1.75?1:0.5));
      AL.sh.rotation.set(-0.3-1.2*st-0.2*f,0,0.25+1.0*fl); AL.el.rotation.x=-0.3-0.4*f; AR.sh.rotation.set(-0.3-1.2*st-0.2*f,0,-0.25-1.0*fl); AR.el.rotation.x=-0.3-0.4*f; capeP.rotation.x=0.4*st+0.05; }
    K._kmode=mode==='knock';
    // V156: climbing a ladder — facing the rungs, hands up over the head reaching rung over rung, knees lifting in turn
    if(mode==='climb'){ const c=Math.sin(t*7), c2=Math.cos(t*7); hips.position.set(0,K.hipY-0.02,0.02); hips.rotation.set(0,0,0);
      L.hip.rotation.set(-0.55-0.55*Math.max(0,c),0,0.04); L.knee.rotation.x=0.7+0.8*Math.max(0,c); R.hip.rotation.set(-0.55-0.55*Math.max(0,-c),0,-0.04); R.knee.rotation.x=0.7+0.8*Math.max(0,-c);
      torso.rotation.set(-0.08,0,0); head.rotation.set(-0.35,0,0); AL.sh.rotation.set(-2.55-0.35*c2,0,0.12); AL.el.rotation.x=-0.55+0.35*c2; AR.sh.rotation.set(-2.55+0.35*c2,0,-0.12); AR.el.rotation.x=-0.55-0.35*c2; capeP.rotation.x=0.12; }
    // V129: fishing — sat on the bank, knees drawn up, the rod held out in both hands over the water; slow breaths, the head
    //  following the float; when a fish takes, the rod bows and he leans back to it
    pole.visible=mode==='fish';
    if(mode==='fish'){ const fb=K.fishBend||0, br=Math.sin(t*0.9)*0.5+0.5;
      if(sword.parent===AR.hand&&K._carry!=='none') stow();
      L.hip.rotation.x=R.hip.rotation.x=-1.22; L.knee.rotation.x=1.25; R.knee.rotation.x=1.05; L.hip.rotation.z=0.12; R.hip.rotation.z=-0.1;
      hips.position.set(0,0.2,-0.05); hips.rotation.set(0,0,0); torso.rotation.set(0.14-0.22*fb+0.02*br,0,0); head.rotation.set(0.18-0.12*fb+0.03*Math.sin(t*0.4),Math.sin(t*0.23)*0.12,0);
      AR.sh.rotation.set(-0.95-0.5*fb,0.25,-0.05); AR.el.rotation.x=-0.75+0.35*fb; AR.hand.rotation.x=0.1;
      AL.sh.rotation.set(-0.85-0.45*fb,-0.45,0.05); AL.el.rotation.x=-1.05+0.3*fb;
      const want=1.05-0.5*fb+0.02*Math.sin(t*1.3);   // the rod's own angle in the world: forward and some 30° up, lifting as a fish pulls
      pole.rotation.set(want-(torso.rotation.x+AR.sh.rotation.x+AR.el.rotation.x+AR.hand.rotation.x),0,0); capeP.rotation.x=0.35; }
    // V99: riding — astride, not standing on its back. Thighs forward and spread round the barrel, shins down along its sides,
    //  heels down; the seat sits the stride (rising a little out of the saddle at the gallop, the body forward), the hands low on
    //  the reins, the head steady and looking ahead, leaning into the turns; the cape streams back with the speed
    if(mode==='ride'){ const R0=K.ride||{}, sp=R0.speed||0, run=R0.run||0, bob=R0.bob||0, bank=R0.bank||0, wide=R0.wide||0.55, pit=R0.pitch||0;
      [[L,1],[R,-1]].forEach(([G,sd])=>{ G.hip.rotation.set(-1.05-0.12*run,0,sd*wide); G.knee.rotation.x=1.2+0.35*run; });
      hips.position.set(0,0.03+bob,-0.02); hips.rotation.set(0,0,0);
      torso.rotation.set(0.06+0.2*run+0.05*sp-pit*0.5,0,-bank*0.5); head.rotation.set(-torso.rotation.x*0.85-pit*0.3,0,bank*0.25);
      if(swing<0&&!(K.spinT>=0)&&!K.guarding){ AR.sh.rotation.set(-0.7-0.15*run,-0.25,-0.12); AR.el.rotation.x=-0.95; AR.hand.rotation.x=0.3; }
      if(!K.guarding){ AL.sh.rotation.set(-0.7-0.15*run,0.25,0.12); AL.el.rotation.x=-0.95; AL.el.rotation.z=0; }
      capeP.rotation.x=0.18+0.9*sp+Math.sin(t*(6+8*sp))*0.06*sp; }
    // the sheath: after a few quiet seconds the blade goes home — to the scabbard at his left hip, or across his back for the
    //  big ones (greatswords, hammers, staves, bows); a blow, the guard, a wind-up, or foes drawing near bring it back to hand
    const armBusy=swing>=0||K.raise>0||K.guarding||K.alert||K.charge>0||K.spinT>=0;
    if(armBusy){ K._idle=0; if(K._st!=='drawn') drawNow(); }
    else if(K._carry!=='none'&&K._st==='drawn'&&(K._idle=(K._idle||0)+dt)>4&&mode!=='sit'){ K._st='sheathing'; K._shT=0; }
    if(K._st==='sheathing'){ K._shT+=dt/(K._carry==='hip'?1.25:0.6); const u=Math.min(1,K._shT), e=Math.sin(u*Math.PI);
      if(K._carry==='hip'){ const r=Math.sin(Math.min(1,u*1.6)*Math.PI/2)*(u<0.76?1:1-smooth01((u-0.76)/0.24)); AR.sh.rotation.x+=-0.42*r+0.18*smooth01((u-0.5)/0.24)*(u<0.8?1:0); AR.sh.rotation.z+=(0.62+K.armOut)*r; AR.sh.rotation.y+=0.5*r; AR.el.rotation.x+=-0.85*r; AR.hand.rotation.x=AR.hand.rotation.x*(1-r)+1.2*r; torso.rotation.y+=0.16*r; head.rotation.y+=0.3*r; head.rotation.x+=0.18*r; }   // reach across, look down to the scabbard
      else { AR.sh.rotation.x+=-2.3*e; AR.sh.rotation.z+=0.35*e; AR.el.rotation.x+=-1.0*e; }                                                                  // up and over the shoulder
      // the blade turns point-down and is carried into the scabbard's mouth as the hand arrives, so it lets go in place
      // the blade turns point-down over the scabbard's mouth, its tip goes in, and it slides home down the scabbard before the
      //  hand lets go — so it is truly sheathed, never passing through the cloth
      if(K._carry==='hip'&&sword.parent===AR.hand){ const w1=smooth01((u-0.1)/0.4), w2=smooth01((u-0.5)/0.24); K.updateMatrixWorld(true);
        sheathP.getWorldPosition(_sp); sheathP.getWorldQuaternion(_sq); AR.hand.getWorldQuaternion(_hq); AR.hand.getWorldPosition(_hp);
        _ax.set(0,1,0).applyQuaternion(_sq); _pre.copy(_sp).addScaledVector(_ax,-(K._scabLen||0.7)*0.42*(1-w2));
        _dq.setFromEuler(_de.set(Math.PI/2,0,0)).premultiply(_hq).slerp(_sq,w1); sword.quaternion.copy(_hq.invert()).multiply(_dq);
        _hp.lerp(_pre,w1); sword.position.copy(AR.hand.worldToLocal(_hp)); }
      if(u>=(K._carry==='hip'?0.74:0.5)&&sword.parent===AR.hand) stow(); if(u>=1) K._st='sheathed'; }
    const pick=(o,v)=>{ o.v*=0.5; o.x=v; }, rAbs=swing>=0||K.raise>0||K.charge>0||K.spinT>=0||mode==='sit', lAbs=gk>0.02||mode==='sit';
    if(rAbs){ pick(sArmR.x,AR.sh.rotation.x); pick(sArmR.y,AR.sh.rotation.y); pick(sArmR.z,AR.sh.rotation.z); pick(sArmR.e,AR.el.rotation.x); pick(sHandR,AR.hand.rotation.x); }
    if(lAbs){ pick(sArmL.x,AL.sh.rotation.x); pick(sArmL.e,AL.el.rotation.x); pick(sArmL.z,AL.sh.rotation.z); pick(sArmL.y,AL.sh.rotation.y); }
    // V141: FEET ON THE HILLS — each foot is set on the ground beneath it: the pelvis drops for the lower foot, and the other
    //  leg folds at the knee (the hip keeping the foot under it) by as much as its ground rises. Only standing and walking,
    //  outdoors; the camera-near and the player first
    if(K.footIK&&(mode==='walk'||mode==='idle')&&!(K.air>0.02)&&!(K.dash>0)&&typeof ENGINE!=='undefined'&&ENGINE.level&&ENGINE.level.ground&&!ENGINE.level.interior&&!K._act) footIK();
    if(K.onAnim) K.onAnim(dt,t,a,rf,s);
  };
  const _fa=new THREE.Vector3(), _fk=new THREE.Vector3(); let _fdS=0;
  function footIK(){ const lv=ENGINE.level, par=K.parent; if(!par) return; K.updateMatrixWorld(true); _ws.setFromMatrixScale(K.matrixWorld); const wsc=_ws.y||1;
    K.getWorldPosition(_fk); const g0=lv.ground(_fk.x,_fk.z), lt=Math.abs(L.knee.position.y)||0.3, ls=K.hipY-lt+0.012, cap=K.hipY*0.3, off=[];
    for(const G of [L,R]){ G.knee.localToWorld(_fa.set(0,-ls,0)); let o=(lv.ground(_fa.x,_fa.z)-g0)/wsc; if(!isFinite(o)) o=0; off.push(Math.max(-cap,Math.min(cap,o))); }
    const drop=Math.min(0,off[0],off[1]); _fdS+=(drop-_fdS)*0.35; hips.position.y+=_fdS;
    [L,R].forEach((G,i)=>{ const rise=Math.max(0,off[i]-_fdS); if(rise<0.003) return; const k=Math.max(0,G.knee.rotation.x), D2=lt*lt+ls*ls+2*lt*ls*Math.cos(k), D=Math.sqrt(D2), Dn=Math.max((lt+ls)*0.45,D-rise);
      const kn=Math.acos(Math.max(-1,Math.min(1,(Dn*Dn-lt*lt-ls*ls)/(2*lt*ls)))), dk=kn-k; if(dk>0.001){ G.knee.rotateX(dk); G.hip.rotateX(-dk*0.5); } }); }
  // ── the sheath and the back-carry ──
  const sheathP=pivot(0.21,-0.075,0.05,torso); sheathP.rotation.set(-2.3,0,-0.22);     // left hip: the hilt up and forward, the point down and back, a little out from the leg
  const backP=pivot(-0.13,0.3,-0.2,torso); backP.rotation.set(0.12,0,-2.55);           // across the back: the hilt over the right shoulder
  const scab=new THREE.Group(); sheathP.add(scab); const SL=M.boot, SG=new THREE.MeshPhongMaterial({color:0xd9ad48,shininess:40,specular:0x6a5a30});
  function scabbard(len){ K._scabLen=len; while(scab.children.length) scab.remove(scab.children[0]);
    const body=add(new THREE.CylinderGeometry(0.034,0.031,len,10),SL,0,0.075+len/2,0,scab); body.scale.z=0.6;   /* wide enough to hide the blade */
    add(new THREE.CylinderGeometry(0.036,0.034,0.04,10),SG,0,0.085,0,scab).scale.z=0.6;                       // the throat
    add(new THREE.ConeGeometry(0.026,0.07,10),SG,0,0.075+len+0.02,0,scab).rotation.x=Math.PI;                 // the chape
    add(new THREE.CylinderGeometry(0.033,0.033,0.02,10),SG,0,0.075+len*0.45,0,scab).scale.z=0.6; }           // a band
  function stow(){ (K._carry==='hip'?sheathP:backP).add(sword); sword.position.set(0,0,0); sword.rotation.set(0,0,0); }
  function drawNow(){ AR.hand.add(sword); sword.position.set(0,0,0); sword.rotation.set(Math.PI/2,0,0); K._st='drawn'; K._idle=0; }
  const _setW=K.setWeapon; K.setWeapon=function(art,id){ _setW(art,id); const f=art?art.fam:'light'; K._fam=f;
    K._carry=f==='fist'?'none':f==='light'||f==='radiant'?'hip':'back'; scab.visible=K._carry==='hip';
    scabbard(art&&(f==='light'||f==='radiant')?0.3+(art.len||12)*0.034+0.12:0.74);
    if(K._carry==='none'&&K._st!=='drawn') drawNow(); else if(K._st==='sheathed') stow(); };
  K._carry='hip'; scabbard(0.74); K._st='sheathed'; stow();
  K.sheathe=()=>{ if(K._carry!=='none'){ K._st='sheathed'; stow(); } }; K.draw=drawNow;

  // ── the new body: Zak's Ocarina-era knight (tools/remodel_knight.py → KNIGHT_MODEL), smoothed a little and fitted to this
  //  rig — its joints move to meet the model's own proportions, the old armour you see is put away, and everything that
  //  moves or is chosen stays: the weapon in hand, the kite shield on the forearm, the cape, the crests and the wings.
  //  Its colours sit between the two: each livery's own colours, eased toward the new model's steel, navy and gold.
  if(typeof KNIGHT_MODEL!=='undefined'&&KNIGHT_MODEL&&!buildKnight.classic&&buildKnight.style==='oot') (function(D){ const pv=D.pivots;
    const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
    [L.hip,L.knee,R.hip,R.knee,torso,AL.sh,AL.el,AR.sh,AR.el,head,plume].forEach(p=>p.children.forEach(o=>{ if(o.isMesh) o.visible=false; }));
    // the rig, moved to the model's joints
    K.hipY=pv.hipY; hips.position.y=pv.hipY; [[L,1],[R,-1]].forEach(([G,sd])=>{ G.hip.position.set(sd*pv.hipX,0,0); G.knee.position.set(0,pv.knee[1],pv.knee[2]); });
    [[AL,1],[AR,-1]].forEach(([A,sd])=>{ A.sh.position.set(sd*pv.sh[0],pv.sh[1],0); A.el.position.set(sd*pv.el[0],pv.el[1],pv.el[2]); A.hand.position.set(sd*pv.hand[0],pv.hand[1],pv.hand[2]); });
    head.position.set(0,pv.head[1],pv.head[2]); capeP.position.set(0,0.34,-0.19); wings.position.set(0,0.3,-0.19); K.shX=0.098;
    sheathP.position.set(0.215,-0.06,0.06); backP.position.set(-0.13,0.29,-0.19);
    // smooth shading for the body's materials (its boxes carry their own flat normals, so they stay crisp)
    ['tunic','trim','arm','leg','helm','paul','steel','boot','hand','belt','plume','plumeHi'].forEach(k=>{ M[k].flatShading=false; M[k].needsUpdate=true; });
    [['helm',18,0x3a3f48],['paul',14,0x30343a],['steel',14,0x30343a],['hand',10,0x202024]].forEach(([k,sh,sp])=>{ M[k].shininess=sh; M[k].specular.setHex(sp); });   // a soft sheen on the steel, not a mirror
    M.gold=new THREE.MeshPhongMaterial({color:0xd9ad48,shininess:36,specular:0x5a4a28});
    const seg={hip:{L:L.hip,R:R.hip},knee:{L:L.knee,R:R.knee},sh:{L:AL.sh,R:AR.sh},el:{L:AL.el,R:AR.el},hand:{L:AL.hand,R:AR.hand}};
    D.parts.forEach(pt=>{ const g=new THREE.BufferGeometry(), P=bin(pt.p,Int16Array), Q=bin(pt.q,Int8Array), I=bin(pt.i,Uint16Array);
      const pos=new Float32Array(P.length), nrm=new Float32Array(Q.length); for(let i=0;i<P.length;i++) pos[i]=P[i]/16000; for(let i=0;i<Q.length;i++) nrm[i]=Q[i]/127;
      g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nrm,3)); g.setIndex(new THREE.BufferAttribute(new Uint16Array(I),1));
      const par=pt.seg==='torso'?torso:seg[pt.seg][pt.side];
      if(pt.seg==='hand'){ const A=pt.side==='L'?AL:AR; A.hand.box.geometry=g; A.hand.box.visible=true; return; }   // the glove is the hand (fist weapons recolour it)
      const m=new THREE.Mesh(g,M[pt.mat]||M.steel); m.castShadow=true; m.userData.knight2=true; par.add(m); });
    // the helm, rebuilt clean: a smooth great helm, a darker faceplate with the eye-slit and breath, a gold brow and crest
    //  running up over the crown, gold cheek trims and the brow gem; and the crimson plume as one swept, tapering plume
    const lp=[[0.158,-0.19],[0.17,-0.15],[0.178,-0.07],[0.181,0.01],[0.176,0.07],[0.161,0.12],[0.133,0.158],[0.09,0.183],[0.04,0.195],[0.0,0.198]].map(([r,y])=>new THREE.Vector2(r,y));   // a lower, rounder crown
    add(new THREE.LatheGeometry(lp,28),M.helm,0,0,0,head).scale.z=0.95;
    const fp=add(new THREE.CylinderGeometry(0.182,0.176,0.22,18,1,true,-0.72,1.44),M.steel,0,-0.075,0,head); fp.scale.z=0.97;
    add(new THREE.CylinderGeometry(0.1835,0.1835,0.026,18,1,true,-0.58,1.16),M.visor,0,0.0,0,head).scale.z=0.97;   // the eye-slit
    add(new THREE.BoxGeometry(0.02,0.085,0.02),M.visor,0,-0.075,0.178,head);                                        // the breath
    add(new THREE.CylinderGeometry(0.186,0.186,0.022,20,1,true,-0.8,1.6),M.gold,0,0.036,0,head).scale.z=0.97;       // the brow band
    const cr=add(new THREE.TorusGeometry(0.17,0.011,6,18,Math.PI*0.52),M.gold,0,0.034,0,head); cr.rotation.y=-Math.PI/2; cr.scale.set(1,1,0.97);   // the crest, front to crown
    [-1,1].forEach(sd=>{ const ck=add(new THREE.BoxGeometry(0.016,0.15,0.016),M.gold,sd*0.118,-0.085,0.13,head); ck.rotation.y=sd*0.75; });
    add(new THREE.SphereGeometry(0.017,10,8),M.gold,0,0.036,0.188,head);
    add(new THREE.BoxGeometry(0.022,0.2,0.02),M.gold,0,-0.07,0.184,head);                                                // the visor's gold cross: an upright bar through the eye-slit
    const lip=add(new THREE.TorusGeometry(0.162,0.016,8,28),M.steel,0,-0.188,0,head); lip.rotation.x=Math.PI/2; lip.scale.set(1,0.96,1);   // a rolled rim at the base
    [-1,1].forEach(sd=>{ for(let i=0;i<3;i++) add(new THREE.SphereGeometry(0.009,6,5),M.visor,sd*(0.05+i*0.022),-0.1-i*0.018,0.168-i*0.008,head); });   // breaths, three a side
    [-1,1].forEach(sd=>add(new THREE.SphereGeometry(0.014,8,6),M.gold,sd*0.172,0.036,0.05,head));                        // rivets where the brow band ends
    add(new THREE.CylinderGeometry(0.022,0.03,0.035,10),M.gold,0,0.2,-0.005,head);                                       // the plume's socket
    const curve=new THREE.CatmullRomCurve3([[0,-0.012,0.03],[0,0.06,-0.02],[0,0.095,-0.11],[0,0.07,-0.23],[0,0.0,-0.33],[0,-0.09,-0.38]].map(a=>new THREE.Vector3(...a)));
    const tube=(r0,r1,mat,dx,dy)=>{ const tg=new THREE.TubeGeometry(curve,28,1,8,false), p=tg.attributes.position, c=new THREE.Vector3();
      for(let i=0;i<p.count;i++){ const ring=Math.floor(i/9), u=ring/28; curve.getPointAt(u,c); const r=r0+(r1-r0)*Math.pow(u,0.8); p.setXYZ(i,c.x+(p.getX(i)-c.x)*r*0.6+dx,c.y+(p.getY(i)-c.y)*r+dy,c.z+(p.getZ(i)-c.z)*r); }
      tg.computeVertexNormals(); return add(tg,mat,0,0,0,plume); };
    tube(0.05,0.008,M.plume,0,0); tube(0.022,0.004,M.plumeHi,0,0.032);
    // the palette between the two knights
    const MIX={tunic:[0x22365f,0.35],arm:[0x2a3a58,0.35],trim:[0xc69435,0.45],leg:[0x303d44,0.45],helm:[0x7d8890,0.58],paul:[0x88908e,0.55],steel:[0x5f6c72,0.45],
      plume:[0x972b21,0.3],plumeHi:[0xc4422b,0.3],boot:[0x5b3722,0.5],hand:[0x6a4a32,0.35],belt:[0xc69435,0.4]}, tc=new THREE.Color();
    const mixPal=()=>{ for(const k in MIX){ const m=M[k]; if(!m) continue; const cur=m.color.getHex(); if(cur===m.userData.mixed) continue; m.color.lerp(tc.setHex(MIX[k][0]),MIX[k][1]); m.userData.mixed=m.color.getHex(); } };
    ['setLivery','shape','setGearLook','dress'].forEach(f=>{ const o=K[f]; K[f]=function(){ const r=o.apply(K,arguments); mixPal(); return r; }; });
    mixPal(); K.remodel=true; })(KNIGHT_MODEL);
  // ── THE HERO KNIGHT (the concept art, Breath-of-the-Wild-leaning): heroic, true proportions — a small head under a
  //  rounded great helm with a gold-trimmed visor and ridge and a long flowing crimson plume; bright polished plate edged in
  //  gold (layered pauldrons, couters, poleyns, greaves, sabatons) over dark mail; the navy surcoat with the gold Jerusalem
  //  cross, a dagged gold-edged hem in front and behind that swings with the stride; a navy cowl at the throat; a full navy
  //  cape edged in gold; a leather belt with pouches; and the great kite shield, navy with a gold rim and the Jerusalem
  //  cross. Every pivot, weapon, crest, wing and animation of the rig is kept; liveries still recolour it.
  if(!buildKnight.classic&&buildKnight.style!=='oot') (function(){
    const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
    [L.hip,L.knee,R.hip,R.knee,torso,AL.sh,AL.el,AR.sh,AR.el,head,plume,sh].forEach(p=>p.children.forEach(o=>{ if(o.isMesh) o.visible=false; }));
    // a bare rig (engine/cast.js dresses it as one of the cast): the hero's frame and animation, nothing of the knight shown
    if(buildKnight.bare){ K.traverse(o=>{ if(o.isMesh) o.visible=false; }); K.hipY=0.80; hips.position.y=0.80; [[L,1],[R,-1]].forEach(([G,sd])=>{ G.hip.position.set(sd*0.1,0,0); G.knee.position.set(0,-0.36,0); });
      [[AL,1],[AR,-1]].forEach(([A,sd])=>{ A.sh.position.set(sd*0.23,0.43,0); A.el.position.set(sd*0.012,-0.27,0); A.hand.position.set(sd*0.004,-0.245,0.02); });
      head.position.set(0,0.64,0.012); plume.position.set(0,0.165,-0.01); capeP.position.set(0,0.43,-0.13); K.armOut=0.05; K.shFace=undefined; K._carry='none'; K.bare=true; K.remodel=true; K.hero=true; return; }
    // painted, physically based surfaces (paint.js): each material keeps its livery colour and gains the concept's finish
    const HQ=typeof PAINT!=='undefined';
    if(HQ){ const swap=(k,kind,o)=>{ const old=M[k]; M[k]=PAINT.mat(kind,old.color.clone(),Object.assign({side:old.side},o||{})); };
      [['helm','steel'],['paul','steel'],['steel','steel'],['hand','leather'],['tunic','cloth'],['cape','cloth'],['field','cloth'],['leg','mail'],['arm','mail'],['boot','leather'],['plume','hair'],['plumeHi','hair'],['cross','gold'],['shield','gold'],['belt','gold'],['trim','gold']].forEach(([k,kind])=>swap(k,kind));
      cape.material=M.cape; }
    // the frame: hips 0.80, knees 0.44, shoulders 1.23, the helm's heart 1.44
    K.hipY=0.80; hips.position.y=0.80; [[L,1],[R,-1]].forEach(([G,sd])=>{ G.hip.position.set(sd*0.1,0,0); G.knee.position.set(0,-0.36,0); });
    [[AL,1],[AR,-1]].forEach(([A,sd])=>{ A.sh.position.set(sd*0.23,0.43,0); A.el.position.set(sd*0.012,-0.27,0); A.hand.position.set(sd*0.004,-0.245,0.02); });
    head.position.set(0,0.64,0.012); plume.position.set(0,0.165,-0.01); capeP.position.set(0,0.43,-0.13); wings.position.set(0,0.32,-0.15); K.shX=0.072;
    sheathP.position.set(0.17,-0.02,0.07); backP.position.set(-0.12,0.32,-0.17);
    // materials: smooth; bright steel with a sheen; gold; dark mail; a cowl a shade under the surcoat
    ['tunic','trim','arm','leg','helm','paul','steel','boot','hand','belt','plume','plumeHi','cape','shield','field','cross','visor'].forEach(k=>{ M[k].flatShading=false; M[k].needsUpdate=true; });
    if(!HQ) [['helm',46,0x70747e],['paul',40,0x686c76],['steel',40,0x686c76],['hand',24,0x40424a]].forEach(([k,sh0,sp])=>{ M[k].shininess=sh0; M[k].specular.setHex(sp); });
    M.tunic.side=THREE.DoubleSide; M.cape.side=THREE.DoubleSide;
    const GOLD=HQ?PAINT.mat('gold',0xe0b048):new THREE.MeshPhongMaterial({color:0xd6a640,shininess:55,specular:0x8a6a30}), MAIL=HQ?PAINT.mat('mail',0x9aa0aa):new THREE.MeshPhongMaterial({color:0x34373e,shininess:20,specular:0x2a2c30}), SCARF=HQ?PAINT.mat('cloth',0x182544,{side:THREE.DoubleSide}):new THREE.MeshPhongMaterial({color:0x182544,side:THREE.DoubleSide});
    M.gold=GOLD; const GOLDD=HQ?PAINT.mat('gold',0xe0b048,{side:THREE.DoubleSide}):new THREE.MeshPhongMaterial({color:0xd6a640,shininess:55,specular:0x8a6a30,side:THREE.DoubleSide});
    const lathe=(pts,seg,p0,pl)=>new THREE.LatheGeometry((pts[0][1]>pts[pts.length-1][1]?pts.slice().reverse():pts).map(([r,y])=>new THREE.Vector2(Math.max(0.0005,r),y)),seg||24,p0||0,pl||Math.PI*2);
    const ell=(rx,ry,rz,seg)=>{ const g=new THREE.SphereGeometry(1,seg||18,Math.round((seg||18)*0.7)); g.scale(rx,ry,rz); return g; };
    const zs=(g,k)=>{ g.scale(1,1,k); return g; };
    const limb=(par,a,b,r0,r1,mat)=>{ const A=V3(...a), B=V3(...b), d=B.clone().sub(A), Ln=d.length(), m=add(new THREE.CylinderGeometry(r1,r0,Ln,14),mat,0,0,0,par); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize()); return m; };
    // a curved cloth panel: rows follow a lathe profile, columns sweep an arc; dags cut points into its lowest rows
    function panel(prof,p0,pl,cols,zk,dag,dagRows){ const pos=[], idx=[], R=prof.length, C=cols;
      for(let i=0;i<R;i++) for(let j=0;j<=C;j++){ const ph=p0+pl*j/C, [r,y]=prof[i]; let yy=y; if(dag&&i>=R-(dagRows||1)&&j%2===1) yy+=dag; pos.push(Math.sin(ph)*r,yy,Math.cos(ph)*r*zk); }
      for(let i=0;i<R-1;i++) for(let j=0;j<C;j++){ const a=i*(C+1)+j, b=a+C+1; idx.push(a,b,a+1,a+1,b,b+1); }
      const uv=[]; for(let i=0;i<R;i++) for(let j=0;j<=C;j++) uv.push(j/C*pl*1.2,i/(R-1)); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
    const box=(w,h,d,mat,x,y,z,par,rx,ry,rz)=>{ const m=add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,par); m.rotation.set(rx||0,ry||0,rz||0); return m; };
    const rivet=(x,y,z,par,r)=>add(new THREE.SphereGeometry(r||0.009,8,6),GOLD,x,y,z,par);
    // the Jerusalem cross: a cross potent and four small crosses, laid flat at depth z
    function jerusalem(par,cx,cy,z,s,mat){ const b=(w,h,x,y)=>box(w*s,h*s,0.01,mat,cx+x*s,cy+y*s,z,par);
      b(0.034,0.2,0,0); b(0.2,0.034,0,0); [[0,0.1,0.075,0.026],[0,-0.1,0.075,0.026],[0.1,0,0.026,0.075],[-0.1,0,0.026,0.075]].forEach(([x,y,w,h])=>b(w,h,x,y));   // the arms and their potent ends
      [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sy])=>{ b(0.016,0.05,sx*0.062,sy*0.062); b(0.05,0.016,sx*0.062,sy*0.062); }); }
    const skirtF=pivot(0,0.06,0,torso), skirtB=pivot(0,0.06,0,torso);
    // the sculpted body (tools/sculpt_knight.py → HERO_KNIGHT): modelled in Blender from the concept sheet, bevelled,
    //  subdivided, its shadows baked in; when it is present it replaces the hand-built parts below
    const SYNC=[];
    const sculpted=typeof HERO_KNIGHT!=='undefined'&&HERO_KNIGHT&&!buildKnight.procedural&&(function(D){
      const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
      const MAT={gold:GOLD,steel:M.steel,helm:M.helm,paul:M.paul,mail:MAIL,tunic:M.tunic,cape:M.cape,leather:M.boot,hand:M.hand,hair:M.plume,hair2:M.plumeHi,scarf:SCARF,visor:M.visor,field:M.field,cross:M.cross};
      const ao={};   // each material, cloned to carry the baked shadows; its colour follows the original every frame
      // cloth that moves: the cape's and the skirts' materials bend in the vertex shader — the lower the cloth, the further it
      //  trails, and a ripple runs across it — driven each frame from the stride, the speed and the turn (CLOTH uniforms)
      const cloth=(m,U,L,zc)=>{ m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader='uniform float uBend,uWave,uT,uSway,uKick;\n'+sh.vertexShader.replace('#include <begin_vertex>',
          'vec3 transformed=vec3(position); float cd=clamp(-position.y/'+L.toFixed(3)+',0.,1.); float cw=sin(position.x*11.0+uT*4.6-cd*5.0)+0.5*sin(position.x*23.0-uT*6.3+cd*3.0);'+
          'vec2 co=normalize(vec2(position.x,position.z-('+zc.toFixed(3)+'))+vec2(0.,1e-4)); float cdisp=uBend*'+L.toFixed(3)+'*cd*cd+uKick*cd+uWave*cd*cw;'+   /* out from the body, wherever the cloth faces */
          'transformed.xz+=co*cdisp; transformed.y+=abs(uBend)*cd*cd*0.18*'+L.toFixed(3)+'; transformed.x+=uSway*cd*cd*'+L.toFixed(3)+';'); };
        m.customProgramCacheKey=()=>'cloth'+L+'_'+zc; return m; };
      K.CLOTH={cape:{uBend:{value:0},uWave:{value:0},uT:{value:0},uSway:{value:0},uKick:{value:0}},skF:{uBend:{value:0},uWave:{value:0},uT:{value:0},uSway:{value:0},uKick:{value:0}},skB:{uBend:{value:0},uWave:{value:0},uT:{value:0},uSway:{value:0},uKick:{value:0}}};
      const aoMat=(k,seg)=>{ const cl=seg==='cape'?'cape':seg==='skirtF'?'skF':seg==='skirtB'?'skB':'', key=k+'|'+cl; if(ao[key]) return ao[key]; const src=MAT[k]||M.steel, m=src.clone(); m.vertexColors=true; m.side=THREE.FrontSide; if(k==='hair'||k==='hair2'){ m.map=null; m.bumpMap=null; }
        if(cl) cloth(m,K.CLOTH[cl],cl==='cape'?0.9:0.46,cl==='cape'?0.14:0.0);
        SYNC.push([m,k==='gold'?null:k,src]); return ao[key]=m; };
      const seg={hip:{L:L.hip,R:R.hip},knee:{L:L.knee,R:R.knee},sh:{L:AL.sh,R:AR.sh},el:{L:AL.el,R:AR.el},hand:{L:AL.hand,R:AR.hand}};
      cape.geometry=new THREE.BufferGeometry(); cape.rotation.x=0;
      D.parts.forEach(pt=>{ if(buildKnight.skipSeg&&buildKnight.skipSeg.has(pt.seg)) return; const g=new THREE.BufferGeometry(), P=bin(pt.p,Int16Array), Q=bin(pt.q,Int8Array), C=bin(pt.c,Uint8Array), I=pt.i32?bin(pt.i,Uint32Array):bin(pt.i,Uint16Array);
        const n=C.length, pos=new Float32Array(n*3), nrm=new Float32Array(n*3), col=new Float32Array(n*3);
        for(let i=0;i<n*3;i++){ pos[i]=P[i]/16000; nrm[i]=Q[i]/127; }
        const soft=pt.mat==='cape'||pt.mat==='tunic'||pt.mat==='scarf'; for(let i=0;i<n;i++){ const a=Math.pow(C[i]/255,0.8), v=soft?0.62+0.38*a:0.3+0.7*a; col[i*3]=col[i*3+1]=col[i*3+2]=v; }   /* cloth takes its shadows lightly */
        g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nrm,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
        g.setIndex(new THREE.BufferAttribute(I,1));
        { const uv=new Float32Array(n*2); for(let i=0;i<n;i++){ const x=pos[i*3], y=pos[i*3+1], z=pos[i*3+2], ax=Math.abs(nrm[i*3]), az=Math.abs(nrm[i*3+2]); uv[i*2]=(ax>az?z:x)*3; uv[i*2+1]=y*3; } g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); }
        const mat=aoMat(pt.mat,pt.seg);
        if(pt.seg==='hand'&&pt.mat==='hand'){ const A=pt.side==='L'?AL:AR; A.hand.box.geometry=g; A.hand.box.material=mat; A.hand.box.visible=true; return; }   // the glove is the hand (its plates ride on it)
        const par=pt.seg==='torso'?torso:pt.seg==='head'?head:pt.seg==='plume'?plume:pt.seg==='skirtF'?skirtF:pt.seg==='skirtB'?skirtB:pt.seg==='shield'?sh:pt.seg==='cape'?cape:seg[pt.seg][pt.side];
        if(pt.seg==='cape'&&pt.mat==='cape'){ cape.geometry=g; cape.material=mat; return; }
        // V193: the greave's foot (the sabaton) is its own mesh, so the new body (body3.js) can keep it and drop the greave
        if(pt.seg==='knee'){ const sab=[], shin=[]; for(let t=0;t<I.length;t+=3){ const a=I[t],b=I[t+1],c=I[t+2], cy=(pos[a*3+1]+pos[b*3+1]+pos[c*3+1])/3, cz=(pos[a*3+2]+pos[b*3+2]+pos[c*3+2])/3; ((cy<-0.345&&cz>-0.02)||cy<-0.4?sab:shin).push(a,b,c); }
          [[shin,false],[sab,true]].forEach(([ix,isSab])=>{ if(!ix.length) return; const g2=g.clone(); g2.setIndex(ix); const m=new THREE.Mesh(g2,mat); m.castShadow=true; m.userData.seg='knee'; m.userData.part=pt.mat; if(isSab) m.userData.sabaton=true; par.add(m); }); return; }
        const m=new THREE.Mesh(g,mat); m.castShadow=true; m.userData.seg=pt.seg; m.userData.part=pt.mat; par.add(m); });
      // clearances: the shield rides out past the layered pauldron and the gauntlet; the scabbard hangs steeper and splayed
      //  out from the thigh so it falls beside the cape's edge, not through it (and swings back off the leg as it strides)
      // the body under the armour: the warrior's own form, skinned to the rig, in mail wherever the plates part
      if(typeof BODY!=='undefined'&&typeof BODY_HERO!=='undefined'&&BODY_HERO){ const mm=HQ?PAINT.mat('cloth',0x34302d,{skinning:true}):new THREE.MeshLambertMaterial({color:0x34302d,skinning:true});   /* the padded undercoat between the plates, dark as on the concept sheet */ K.body=BODY.attach(K,BODY_HERO,{material:mm,rig:{hips,torso,head,L,R,AL,AR},hide:['handL','handR','head'],split:buildKnight.showHead?{bones:['head'],material:buildKnight.headMat}:null});   /* the gauntlets and the helm cover the rest */ }
      K.shX=0.16; K.shY=-0.17; K.shRY=Math.PI/2; K.armOut=0.2; K.shTurn=0; K.shFace=Math.PI/2-0.75; sheathP.position.set(0.25,-0.035,0.035); sheathP.rotation.set(-2.6,0,-0.62); K._sheathRest=-2.55;
      K.sculpted=true; return true; })(HERO_KNIGHT);
    if(!sculpted){
    // ── legs ──
    [L,R].forEach((G,i)=>{ const sd=i?-1:1;
      limb(G.hip,[0,0.0,0],[0,-0.34,0.005],0.084,0.066,MAIL);                                                  // the mail thigh
      add(zs(lathe([[0.094,-0.04],[0.09,-0.16],[0.077,-0.3]],14,-1.35,2.7),1),M.steel,0,0,0,G.hip);           // the cuisse over its front
      add(lathe([[0.079,-0.29],[0.079,-0.31]],14,-1.4,2.8),GOLD,0,0,0,G.hip);
      add(ell(0.068,0.068,0.054),M.steel,0,0.0,0.05,G.knee); add(ell(0.032,0.05,0.04),M.steel,sd*0.052,0.0,0.02,G.knee);   // the poleyn and its side wing
      add(lathe([[0.063,0.035],[0.064,0.05]],16,-1.3,2.6),GOLD,0,-0.03,0.0,G.knee);
      add(lathe([[0.064,-0.02],[0.07,-0.12],[0.062,-0.22],[0.052,-0.33]],16),M.steel,0,0,0,G.knee);          // the greave
      add(lathe([[0.067,-0.03],[0.068,-0.045]],16),GOLD,0,0,0,G.knee); box(0.012,0.24,0.01,GOLD,0,-0.15,0.069,G.knee,0.04);   // its gold band and ridge
      add(ell(0.068,0.056,0.13),M.steel,0,-0.385,0.045,G.knee);                                                // the sabaton
      [0,1].forEach(k=>add(lathe([[0.069-k*0.005,0.0],[0.069-k*0.005,0.01]],14,-1.5,3.0),GOLD,0,-0.37-k*0.01,0.05+k*0.05,G.knee));
      box(0.12,0.022,0.27,M.boot,0,-0.43,0.045,G.knee); });
    // ── the body: plate under the surcoat, the mail skirt, belt and pouches ──
    add(zs(lathe([[0.165,0.04],[0.19,0.15],[0.212,0.27],[0.205,0.36],[0.16,0.42],[0.08,0.47]],24),0.78),M.steel,0,0,0,torso);   // the breastplate
    add(zs(lathe([[0.17,0.06],[0.18,-0.06],[0.2,-0.2]],22),0.76),MAIL,0,0,0,torso);                                     // the mail skirt
    add(lathe([[0.06,0.46],[0.058,0.56]],12),MAIL,0,0,0,torso);                                               // the mail at the throat
    const chestProf=[[0.15,0.445],[0.2,0.39],[0.228,0.3],[0.232,0.22],[0.205,0.12],[0.182,0.06]], ZK=0.8;
    add(panel(chestProf,-1.15,2.3,14,ZK),M.tunic,0,0,0,torso); add(panel(chestProf,Math.PI-1.15,2.3,14,ZK),M.tunic,0,0,0,torso);   // the surcoat, front and back
    [-1.15,1.15,Math.PI-1.15,Math.PI+1.15].forEach(ph=>add(panel(chestProf.map(([r,y])=>[r+0.003,y]),ph-0.05,0.1,1,ZK),GOLDD,0,0,0,torso));   // gold down its edges
    add(panel([[0.135,0.445],[0.16,0.425]],-1.1,2.2,12,ZK),GOLDD,0,0,0,torso); add(panel([[0.135,0.445],[0.16,0.425]],Math.PI-1.1,2.2,12,ZK),GOLDD,0,0,0,torso);   // the collar
    jerusalem(torso,0,0.25,0.232*ZK+0.006,0.9,GOLD);
    // the skirts, front and back, dagged and gold-edged, each on its own hinge at the belt so it swings with the legs
    const skProf=[[0.186,0.0],[0.21,-0.14],[0.236,-0.3],[0.26,-0.46]];
    [[skirtF,-1.0],[skirtB,Math.PI-1.0]].forEach(([pv,p0])=>{ add(panel(skProf,p0,2.0,12,ZK,0.055,1),M.tunic,0,0,0,pv);
      add(panel([[0.263,-0.425],[0.266,-0.462]],p0,2.0,12,ZK,0.055,2),GOLDD,0,0,0,pv); });
    const bandG=zs(lathe([[0.187,0.04],[0.188,0.085]],26),ZK+0.02); add(bandG,M.boot,0,0,0,torso);                              // the belt
    box(0.06,0.05,0.02,GOLD,0,0.062,0.158,torso); box(0.03,0.028,0.022,M.boot,0,0.062,0.16,torso);                            // its buckle
    [[-0.15,1],[0.1,-1]].forEach(([x,r])=>{ box(0.07,0.085,0.045,M.boot,x,0.02,0.12,torso,0,r*0.4); box(0.05,0.012,0.047,GOLD,x,0.05,0.122,torso,0,r*0.4); });   // pouches
    box(0.035,0.5,0.012,M.boot,0.02,0.24,0.19,torso,0.05,0,0.62);                                            // the baldric across the chest
    // the cowl at the throat, and its hood fallen at the back
    add(lathe([[0.2,0.39],[0.19,0.45],[0.14,0.5],[0.09,0.535],[0.07,0.555]],22),SCARF,0,0,0,torso); add(ell(0.12,0.07,0.06),SCARF,0,0.45,-0.12,torso);
    // ── pauldrons: a dome and three lames, each edged in gold and riveted ──
    [[AL,1],[AR,-1]].forEach(([A,sd])=>{ const P2=pivot(sd*0.03,0.02,0,A.sh);
      const dm=add(new THREE.SphereGeometry(0.125,22,12,0,Math.PI*2,0,Math.PI*0.56),M.paul,0,0,0,P2); dm.scale.set(1.05,0.82,1.1);
      add(new THREE.TorusGeometry(0.128,0.01,6,26),GOLD,0,-0.02,0,P2).rotation.x=Math.PI/2;
      for(let i=0;i<3;i++){ const r=0.088-i*0.005, y=-0.05-i*0.042, th=sd>0?Math.PI/2-1.35:-Math.PI/2-1.35;   // the lames, hugging the outside of the upper arm
        add(new THREE.CylinderGeometry(r,r+0.008,0.048,18,1,true,th,2.7),M.paul,sd*0.005,y,0,P2); add(new THREE.CylinderGeometry(r+0.009,r+0.009,0.01,18,1,true,th,2.7),GOLDD,sd*0.005,y-0.024,0,P2); }
      [-0.6,0,0.6].forEach(a=>rivet(sd*0.085*Math.cos(a),0.055,Math.sin(a)*0.09,P2));
      // the arm: mail, a rerebrace, the couter at the elbow, the vambrace, a flared cuff and the gauntlet
      limb(A.sh,[0,-0.02,0],[sd*0.012,-0.27,0],0.064,0.054,MAIL); add(lathe([[0.068,-0.06],[0.067,-0.15],[0.064,-0.25]],14),M.steel,sd*0.006,0,0,A.sh);
      add(lathe([[0.069,-0.125],[0.069,-0.137]],14),GOLD,sd*0.006,0,0,A.sh);
      add(ell(0.062,0.056,0.064),M.steel,sd*0.008,0,-0.012,A.el); add(ell(0.012,0.042,0.036),M.steel,sd*0.05,0,-0.01,A.el);
      add(lathe([[0.058,-0.03],[0.057,-0.12],[0.049,-0.21]],14),M.steel,0,0,0,A.el); add(lathe([[0.051,-0.198],[0.051,-0.21]],14),GOLD,0,0,0,A.el);
      add(lathe([[0.05,0.03],[0.066,0.08]],14),M.steel,0,0,0,A.hand);
      const gl=ell(0.053,0.064,0.06,14); A.hand.box.geometry=gl; A.hand.box.visible=true; });
    // ── the helm: rounded great helm, the faceplate thrust forward, a gold-edged eye-slit, the gold ridge over the crown ──
    add(zs(lathe([[0.122,-0.125],[0.132,-0.09],[0.137,-0.03],[0.137,0.03],[0.13,0.08],[0.112,0.12],[0.08,0.15],[0.04,0.168],[0.0,0.173]],28),1.07),M.helm,0,0,0,head);
    add(zs(lathe([[0.141,-0.128],[0.149,-0.07],[0.147,0.0],[0.142,0.055],[0.133,0.088]],22,-0.95,1.9),1.12),M.steel,0,0,0,head);
    add(zs(new THREE.CylinderGeometry(0.1515,0.1515,0.022,20,1,true,-0.72,1.44),1.12),M.visor,0,0.03,0,head);           // the eye-slit
    [0.048,0.012].forEach(y=>add(zs(new THREE.CylinderGeometry(0.153,0.153,0.011,20,1,true,-0.86,1.72),1.12),GOLDD,0,y,0,head));
    box(0.02,0.135,0.013,GOLD,0,-0.058,0.165,head,-0.06);                                                       // the ridge down the faceplate
    const rg=add(new THREE.TorusGeometry(0.145,0.009,6,22,Math.PI*0.52),GOLD,0,0.03,0,head); rg.rotation.y=-Math.PI/2; rg.scale.set(1,1,1.08);   // and over the crown
    const rim=add(new THREE.TorusGeometry(0.124,0.009,6,28),GOLD,0,-0.122,0,head); rim.rotation.x=Math.PI/2; rim.scale.set(1,1.07,1);
    [-1,1].forEach(sd=>{ box(0.011,0.17,0.012,GOLD,sd*0.118,-0.03,0.096,head,0,sd*0.95);
      for(let i=0;i<3;i++) for(let j=0;j<2;j++) add(new THREE.SphereGeometry(0.0075,6,5),M.visor,sd*(0.045+i*0.022),-0.055-j*0.025,0.158-i*0.02,head); });   // breaths
    add(new THREE.CylinderGeometry(0.02,0.028,0.035,10),GOLD,0,0.17,-0.005,head);                               // the plume's socket
    // the plume: long crimson horsehair, springing up and back and falling past the shoulders
    function strand(dx,len,r0,mat){ const pts=[[dx*0.3,-0.01,0.02],[dx*0.6,0.08,-0.03],[dx,0.09,-0.14],[dx*1.3,0.0,-0.25],[dx*1.5,-0.17,-0.31],[dx*1.65,-0.36,-0.31]].slice(0,Math.round(3+3*len)).map(a=>V3(...a));
      const cv=new THREE.CatmullRomCurve3(pts), tg=new THREE.TubeGeometry(cv,22,1,7,false), p=tg.attributes.position, c=V3(0,0,0);
      for(let i=0;i<p.count;i++){ const u=Math.floor(i/8)/22; cv.getPointAt(Math.min(1,u),c); const r=r0*(1-0.85*Math.pow(u,0.9)); p.setXYZ(i,c.x+(p.getX(i)-c.x)*r,c.y+(p.getY(i)-c.y)*r,c.z+(p.getZ(i)-c.z)*r); }
      tg.computeVertexNormals(); return add(tg,mat,0,0,0,plume); }
    [[-0.045,0.9,0.04,'plume'],[0.045,0.95,0.04,'plumeHi'],[0,0.75,0.045,'plume'],[0,1,0.05,'plume'],[-0.035,1,0.04,'plumeHi'],[0.035,1,0.04,'plume'],[-0.06,0.85,0.032,'plume'],[0.06,0.85,0.032,'plumeHi'],[-0.018,0.7,0.034,'plumeHi'],[0.018,0.66,0.034,'plume'],[-0.075,0.6,0.026,'plume'],[0.075,0.55,0.026,'plume'],[0,0.5,0.03,'plumeHi']].forEach(([dx,l,r,m])=>strand(dx,l,r,M[m]));
    // ── the cape: from the shoulders to the calves, wrapping the back, edged in gold ──
    const capeG=(w,h,lift)=>{ const g=new THREE.PlaneGeometry(w,h,10,12); g.translate(0,-h/2,0); const p=g.attributes.position;
      for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i); p.setXYZ(i,x*(1+(-y)*0.42),y,-x*x*1.15+lift); } g.computeVertexNormals(); return g; };
    cape.geometry=capeG(0.46,0.92,0); cape.rotation.x=0.06;
    { const warp=(g,lift)=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i); p.setXYZ(i,x*(1+(-y)*0.42),y,-x*x*1.15+lift); } g.computeVertexNormals(); return g; };   // its gold edges, on the outside
      add(warp(new THREE.PlaneGeometry(0.46,0.03,10,1).translate(0,-0.905,0),-0.006),GOLDD,0,0,0,cape);
      [-1,1].forEach(sd=>add(warp(new THREE.PlaneGeometry(0.022,0.9,1,12).translate(sd*0.219,-0.45,0),-0.006),GOLDD,0,0,0,cape)); }
    // ── the shield: the great kite, navy, a gold rim and rivets, the Jerusalem cross, curved to the arm ──
    const KS=1.12, bend=g=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i); p.setZ(i,p.getZ(i)-x*x*0.7); } g.computeVertexNormals(); return g; };
    const ext=(sc,d,bv)=>{ const g=new THREE.ExtrudeGeometry(kite(sc),{depth:d,bevelEnabled:!!bv,bevelSize:bv||0,bevelThickness:bv||0,bevelSegments:2,curveSegments:8}); return g; };
    add(bend(ext(KS,0.03,0.012).translate(0,0,-0.02)),GOLD,0,0,0,sh); add(bend(ext(KS*0.9,0.012).translate(0,0.004,0.016)),M.field,0,0,0,sh);
    kite(KS*0.95).getSpacedPoints(16).forEach(q=>{ const x=q.x, y=q.y; add(new THREE.SphereGeometry(0.009,8,6),GOLD,x,y,0.03-x*x*0.7,sh); });
    { const jg=new THREE.Group(); sh.add(jg); jerusalem(jg,0,0.02,0.034,1.25,M.cross); jg.children.forEach(m=>{ m.position.z-=m.position.x*m.position.x*0.7; }); }
    }
    // ── colours: the livery's, eased toward the concept — a deep navy, bright steel, gold, a dark undersuit ──
    const tc=new THREE.Color(), MIX={hand:[0x5e3d27,0.8],tunic:[0x1a2850,0.72],arm:[HQ?0x8a909a:0x34373e,0.6],leg:[HQ?0x8a909a:0x2c2f36,0.6],helm:[HQ?0xd2d6dc:0x9aa2ae,0.45],paul:[HQ?0xd2d6dc:0x9aa2ae,0.45],steel:[HQ?0xc4c8d0:0x8e96a2,0.45],plume:[0xc0201a,0.35],plumeHi:[0xe03a28,0.3]};
    // the concept sheet's navy surcoat and bright steel belong to the azure livery; every other livery keeps its own hue — its cloth a
    //  shade deeper (as cloth reads), and where it names a metal (HELM) the whole suit takes that metal: gilt and glory gold, argent bright,
    //  fallen gunmetal, Robby black, deepwater pearl. The trim follows: gold, save the darker liveries (blood-iron) and the pale ones (silver)
    const TRIM={fallen:0x8a2a30,robby:0x5a0c12,deepwater:0xf4f0e8,argent:0xdfe6f0,champion:0xe8d08a,sable:0x9aa6b8};
    const fix=()=>{ const lk=K._lvKey||'azure', LVD=(typeof SYS!=='undefined'&&SYS.LIVERIES&&SYS.LIVERIES[lk])||null, METAL={gilt:0xe2c26a,glory:0xecc85a,argent:0xf0f4fa,champion:0xf4f6fa,fallen:0x5a5660,robby:0x2a2028,deepwater:0xe8e6e0,stormward:0xd4d9e2,ranger:0xb8c0cc}, metal=METAL[lk]!==undefined?new THREE.Color(METAL[lk]):null;
      for(const k in MIX){ const m=M[k]; if(m.color.getHex()===m.userData.mixed) continue;
        if(lk!=='azure'&&(k==='tunic'||k==='arm'||k==='leg')) m.color.multiplyScalar(k==='tunic'?0.86:0.8);
        else if(lk!=='azure'&&(k==='plume'||k==='plumeHi')) {}
        else if(metal&&(k==='helm'||k==='paul')) m.color.copy(metal).lerp(tc.setHex(0x8a8a90),0.12);
        else if(k==='steel') continue;
        else m.color.lerp(tc.setHex(MIX[k][0]),MIX[k][1]);
        m.userData.mixed=m.color.getHex(); }
      M.steel.color.setHex(0xaab0bc).lerp(tc.setHex(MIX.steel[0]),MIX.steel[1]); if(metal) M.steel.color.lerp(metal,0.62); M.steel.userData.mixed=M.steel.color.getHex();
      K.trimCol=TRIM[lk]!==undefined?new THREE.Color(TRIM[lk]):null;
      if(M.field.color.getHex()===0xe8ecf2) M.field.color.copy(M.tunic.color);   // the plain white field of the default livery becomes the surcoat's navy
      SCARF.color.copy(M.tunic.color).multiplyScalar(0.62); M.visor.color.setHex(0x07080c);
      if(!cape.visible){ while(deco.children.length) deco.remove(deco.children[0]); cape.visible=true; M.cape.color.copy(M.tunic.color).multiplyScalar(0.85); }
      SYNC.forEach(([m,k,src])=>{ if(k) m.color.copy(M[k]&&k in M?M[k].color:src.color); }); };
    ['setLivery','shape','setGearLook','dress'].forEach(f=>{ const o=K[f]; K[f]=function(){ const r=o.apply(K,arguments); fix(); return r; }; });
    fix();
    // the cloth and the plume move: skirts follow the striding legs, the cape lifts as you run, the plume streams and sways
    const MK={steel:'steel',helm:'helm',paul:'paul',tunic:'tunic',cape:'cape',leather:'boot',hand:'hand',hair:'plume',hair2:'plumeHi',visor:'visor',field:'field',cross:'cross'};
    SYNC.forEach(e=>{ e[1]=e[1]&&MK[e[1]]||null; if(e[2]===SCARF) e[1]=null; });   // material slots by their rig names
    K.onAnim=(dt,t,a,rf)=>{ for(const e of SYNC){ if(e[1]) e[0].color.copy(M[e[1]].color); else if(e[2]===M.gold&&K.trimCol) e[0].color.copy(K.trimCol); else if(e[2]) e[0].color.copy(e[2].color); }
      // cloth and horsehair on springs: the skirts swing out after the thighs and settle; the plume flops with each bounce,
      //  streams back with speed, trails a turn and sways at rest
      const lx=L.hip.rotation.x, rx=R.hip.rotation.x, mo=K.mot;
      skirtF.rotation.x=hSpr(sSkF,Math.min(Math.min(lx,rx)+0.08,0)*1.08-0.04*a-0.03*rf,240,19,dt); skirtB.rotation.x=hSpr(sSkB,Math.max(Math.max(lx,rx)-0.08,0)*1.0+0.04*a+0.1*rf,200,16,dt);   /* the hinge keeps the knees inside */
      // the shield held as on the sheet: its face turned forward-out from his side, point down, whatever the forearm does
      //  (blended away in the guard, which squares it to the front)
      if(K.shFace!==undefined){ const gk=K._g||0; torso.updateWorldMatrix(true,false); shM.updateWorldMatrix(true,false);
        qT.setFromRotationMatrix(torso.matrixWorld); qP.setFromRotationMatrix(shM.matrixWorld); qW.setFromEuler(eF.set(0,K.shFace,0)).premultiply(qT);
        qP.invert().multiply(qW); qG.copy(sh.quaternion); sh.quaternion.copy(qP).slerp(qG,gk); }
      if(K.CLOTH){ if(!cInit){ cInit=true; cTy=torso.rotation.y; cLx=L.hip.rotation.x; } const C=K.CLOTH, ty=torso.rotation.y, dTy=Math.max(-3,Math.min(3,(ty-cTy)/Math.max(dt,1e-3))); cTy=ty;
        // the skirts' hems flutter after the thighs (a beat behind them) and lift a little at speed
        const legV=(lx-cLx)/Math.max(dt,1e-3); cLx=lx; C.skF.uBend.value=hSpr(sCfB,Math.max(-0.25,Math.min(0.3,-legV*0.04))+0.06*rf,90,14,dt); C.skB.uBend.value=hSpr(sCbB,Math.max(-0.25,Math.min(0.3,legV*0.04))+0.14*rf,90,14,dt);
        C.skF.uWave.value=C.skB.uWave.value=0.006+0.01*a; C.skF.uSway.value=C.skB.uSway.value=hSpr(sCsw,-dTy*0.04+Math.sin(t*1.3)*0.01,60,12,dt);
        // the cape: its foot trails with the speed and kicks with each footfall, a ripple runs across it, it swings after a turn
        C.cape.uBend.value=hSpr(sCcB,0.1*a+0.22*rf+Math.max(0,mo.acc)*0.05,30,7,dt); C.cape.uKick.value=hSpr(sCck,-mo.vy*0.04,70,11,dt); C.cape.uWave.value=0.008+0.016*a+0.02*rf;
        C.cape.uSway.value=hSpr(sCcs,-dTy*0.08+(K.rotation.z||0)*0.5,25,6,dt);
        C.cape.uT.value=C.skF.uT.value=C.skB.uT.value=t*(1+a+rf); if(window.NOCLOTH) for(const k in C) for(const u in C[k]) C[k][u].value=0; }
      if(K._sheathRest!==undefined) sheathP.rotation.x=hSpr(sShX,K._sheathRest+Math.max(0,L.hip.rotation.x)*0.55+Math.max(0,-L.hip.rotation.x)*0.15,90,8,dt);
      sPlX.v+=mo.vy*1.6*dt*20; sPlZ.v+=(torso.rotation.y-pTy)*6; pTy=torso.rotation.y;
      plume.rotation.x=hSpr(sPlX,-0.1*a-0.3*rf-Math.max(0,mo.acc)*0.02+Math.sin(t*2.2)*0.03*(1-a),55,5,dt); plume.rotation.z=hSpr(sPlZ,Math.sin(t*1.7)*0.035+(K.rotation.z||0),45,4.5,dt); };
    const hSpr=(o,tg,k,c,dt)=>{ const n=Math.max(1,Math.ceil(dt/0.017)), h=dt/n; for(let i=0;i<n;i++){ o.v+=(k*(tg-o.x)-c*o.v)*h; o.x+=o.v*h; } return o.x; };
    const sCfB={x:0,v:0}, sCbB={x:0,v:0}, sCsw={x:0,v:0}, sCcB={x:0,v:0}, sCck={x:0,v:0}, sCcs={x:0,v:0}; let cTy=0, cLx=0, cInit=false; const qT=new THREE.Quaternion(), qP=new THREE.Quaternion(), qW=new THREE.Quaternion(), qG=new THREE.Quaternion(), eF=new THREE.Euler();
    const sShX={x:-2.55,v:0}, sSkF={x:0,v:0}, sSkB={x:0,v:0}, sPlX={x:0,v:0}, sPlZ={x:0,v:0}; let pTy=0;
    K.remodel=true; K.hero=true; })();
  K.rig={hips,torso,head,plume,L,R,AL,AR,capeP,sh,cape,sword,sheathP,backP,shM}; K.M=M;   // the joints, for a skinned body (engine/body.js)
  /* V139: play one of the motion-capture clips through once, over everything (falling in battle, kneeling to sow): its
     length squeezed or stretched to dur; arms:true lets the clip have the sword arm too */
  K.act=(n,dur,o)=>{ const R=K.mocap; if(!R||K.mocapOff||!R.actions[n]) return false; K._act={n,t:0,dur:dur||R.dur[n],w:(o&&o.w)||1,arms:!!(o&&o.arms),u0:o&&o.u0,u1:o&&o.u1,hold:o&&o.hold,then:o&&o.then,fade:o&&o.fade};   /* V165: a part of a clip (u0–u1), held a while, then another */ K._mw=Math.max(K._mw||0,0.6); return true; };
  K.raise=0; K.guarding=false; K.dash=0; K.air=0; K.height=1.5; K.charge=0; K.spinT=-1; K.spinA=0;
  return K;
}
