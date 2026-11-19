// ── KLK ARMOUR SETS (3D) — the skill trees' harnesses (V241) ──
// Three sets beside the Templar one (armor.js), each earned a piece a tier along its tree (the ultimate brings the helm and its
//  crest), each worn slot by slot in the wardrobe. Shape only: the livery still paints them, like everything he wears.
//   STRIKER  · the Sword  — lean and swept: a sallet with a fin and a swept tail, spiked knuckles and knees, pointed toes,
//              short split skirts, a crossed harness and a dagger, a scarf whose tails stream behind.
//   GUARDIAN · the Shield — massive: a flat-topped great helm with a cross on its face, a heraldic fan crest, huge layered
//              pauldrons with a haute-piece, a steel breastplate, plate tassets, a gorget, closed greaves, broad sabatons.
//   PSALMIST · the Spirit — the healer's habit: a deep hood (the face in shadow, a soft light where the eyes are) under a gold
//              circlet, its tail down the back, a mantle on each shoulder, wide sleeves, a long robe with a stole, a cord belt.
(function(){ if(typeof ARMOR==='undefined') return; const {V,surf,band,sweep,bez,facetSphere,tri,piece,mesh,bounds}=ARMOR.H, P=ARMOR.PIECES;
  const reg=(slot,id,name,build)=>{ P[slot][id]={name,set:id[0].toUpperCase()+id.slice(1),build}; };
  const GDm=M=>M.goldD||M.gold, DARK=()=>new THREE.MeshBasicMaterial({color:0x06070a,side:THREE.DoubleSide});
  const cone=(r,h,n)=>{ const g=new THREE.ConeGeometry(r,h,n||6).toNonIndexed(); g.computeVertexNormals(); return g; };
  const ext=(shape,d)=>{ const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}).toNonIndexed(); g.computeVertexNormals(); return g; };
  // the envelopes the pieces are fitted to (the same parts the Templar set measures)
  const headE=K=>{ const E=bounds(K.rig.head,o=>/^(helm2|gold2|helm|visor|gold)$/.test(o.userData.part),[[-0.118,-0.136,-0.13],[0.118,0.19,0.144]]);
    return {XR:Math.max(Math.abs(E.min.x),E.max.x)+0.004, ZR:(E.max.z-E.min.z)/2+0.002, CZ:(E.max.z+E.min.z)/2, YB:E.min.y-0.004, YT:E.max.y+0.002}; };
  const torsoE=K=>{ const E=bounds(K.rig.torso,o=>/^(tunic|steel)$/.test(o.userData.part),[[-0.279,0.061,-0.168],[0.279,0.469,0.157]]);
    return {y0:E.min.y-0.012, y1:E.max.y+0.004, ZK:(E.max.z-E.min.z)/2/0.232+0.03, CZ:(E.max.z+E.min.z)/2}; };
  const chestR=(y,y0,y1)=>{ const prof=[[0,0.182],[0.15,0.205],[0.4,0.232],[0.6,0.228],[0.8,0.2],[0.92,0.15],[1,0.12]], v=Math.max(0,Math.min(1,(y-y0)/(y1-y0))); for(let i=1;i<prof.length;i++) if(v<=prof[i][0]){ const [a,ra]=prof[i-1],[b,rb]=prof[i], t=(v-a)/(b-a); return ra+(rb-ra)*(t*t*(3-2*t)); } return 0.12; };
  const paulE=(A,sd)=>{ const E=bounds(A.sh,o=>/^(paul|gold)$/.test(o.userData.part),sd>0?[[-0.096,-0.126,-0.136],[0.156,0.102,0.136]]:[[-0.157,-0.126,-0.136],[0.097,0.102,0.136]]);
    return {cx:(E.min.x+E.max.x)/2-sd*0.012, rx:(E.max.x-E.min.x)/2+0.006, rz:(E.max.z-E.min.z)/2+0.006, top:E.max.y, bot:E.min.y}; };
  const handE=(A,sd)=>{ const hd=A.hand, Eg=bounds(hd,o=>o.userData.part==='hand'||o===hd.box,[[-0.041,-0.035,-0.046],[0.04,0.071,0.05]]), Es=bounds(hd,o=>/^(steel|gold)$/.test(o.userData.part),[[sd>0?-0.07:-0.047,0,-0.079],[sd>0?0.048:0.07,0.085,0.039]]);
    const gc=Eg.getCenter(V()), sc=Es.getCenter(V()), n=V(sc.x-gc.x,0,sc.z-gc.z); if(n.lengthSq()<1e-6) n.set(0,0,-1); n.normalize(); const t=V(0,1,0).cross(n).normalize();
    return {Eg,Es,gc,n,t,y1:Es.max.y+0.012, rr:Math.max(Eg.max.x-Eg.min.x,Eg.max.z-Eg.min.z)/2, back:Math.max(0.03,Math.abs((Es.max.x-Es.min.x)*n.x)/2+Math.abs((Es.max.z-Es.min.z)*n.z)/2-0.002)}; };
  const footE=G=>{ const E=bounds(G.knee,o=>o.userData.sabaton||o.userData.part==='leather',[[-0.072,-0.44,-0.06],[0.084,-0.34,0.213]]);
    return {cx:(E.min.x+E.max.x)/2, x0:(E.max.x-E.min.x)/2+0.006, ys:E.min.y, yt:Math.min(E.max.y,-0.33), z0:E.min.z-0.004, z1:E.max.z+0.006}; };
  const skirtE=K=>({LF:-bounds(K._skF,()=>true,[[-0.192,-0.453,0.133],[0.192,0.005,0.209]]).min.y, LB:-bounds(K._skB,()=>true,[[-0.214,-0.473,-0.235],[0.213,0.005,-0.124]]).min.y, zF:0.8});
  // a gold strip along any curve on a surface: f(u)→[a,b] the strip's two edges
  const ribbon=(g,f,n,mat,part)=>mesh(g,surf((u,v)=>{ const [a,b]=f(u); return v<0.5?a:b; },n,1,{two:0.002}),mat,part||'gold');
  // a skirt panel on a hinge: phi p0..p1, radius r0→r1 over len, dagged into teeth; gold down its edges and along its hem
  function panel(ctx,par,o){ const K=ctx.K, M=K.M, g=piece(ctx,par), NU=Math.max(2,(o.teeth||1)*2), zk=o.zk||0.8, mat=o.mat||M.tunic;
    const tooth=u=>(o.dep||0)*tri(u*(o.teeth||1)+0.5);
    const Pt=(u,v,off)=>{ const ph=o.p0+(o.p1-o.p0)*u, r=o.r0+(o.r1-o.r0)*v+(off||0), y=0.004-(o.len*v+(v>=0.999?tooth(u):0)); return V(r*Math.sin(ph),y,zk*r*Math.cos(ph)+(o.cz||0)); };
    mesh(g,surf((u,v)=>Pt(u,1-v),NU,o.nv||5,{smooth:true,two:0.003}),mat,o.part||'tunic');
    if(o.trim!==false){ const GD=o.trimMat||GDm(M); [0,1].forEach(e=>mesh(g,surf((u,v)=>Pt(e+(e?-1:1)*v*0.03,1-u,0.003),6,1,{two:0.002}),GD,'gold'));
      mesh(g,surf((u,v)=>{ const p=Pt(u,1,0.003); p.y+=v*(o.hem||0.022); return p; },NU*2,1,{two:0.002}),GD,'gold'); } return {g,Pt}; }
  // plate lames (tassets): rows of steel bands, each a little wider and overlapping the one above
  function lames(g,M,o){ const GD=GDm(M); for(let k=0;k<o.n;k++){ const yt=o.y0-k*o.h*0.82, r=o.r+k*o.dr;
    const L=(u,v,off)=>{ const ph=o.p0+(o.p1-o.p0)*u, rr=r+(off||0); return V((o.cx||0)+rr*Math.sin(ph), yt-o.h*(1-v), (o.cz||0)+(o.zk||1)*rr*Math.cos(ph)); };
    mesh(g,surf((u,v)=>L(u,v),o.nu||10,1,{two:0.004}),o.mat||M.steel,'steel'); mesh(g,surf((u,v)=>{ const p=L(u,0,0.004); p.y+=v*0.012; return p; },(o.nu||10)*2,1,{two:0.002}),GD,'gold'); } }

  // ═════════════ STRIKER · the Sword ═════════════
  reg('helm','striker','Striker sallet',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.head), GD=GDm(M), {XR,ZR,CZ,YB,YT}=headE(K), H=YT-YB, YEYE=YB+0.6*H;
    // a sallet: the crown close, the cheeks drawn in, the back swept out into a tail
    const S=(ph,y,off)=>{ const v=(y-YB)/H, back=Math.max(0,-Math.cos(ph)), fr=Math.max(0,Math.cos(ph)); let k=v<0.6?0.97+0.03*v/0.6:Math.pow(Math.max(0,Math.cos((v-0.6)/0.4*Math.PI/2)),0.75);
      const tail=back*back*Math.max(0,0.5-v)*0.55, pinch=fr*Math.max(0,0.45-v)*0.12, r=k*(1+tail-pinch)+(off||0)/ZR;
      return V(XR*r*Math.sin(ph)*(1-0.06*fr*(v<0.55?1:0)), y-tail*0.06, CZ+ZR*r*Math.cos(ph)+0.012*Math.pow(fr,8)*(v<0.9?1:0)); };
    mesh(g,surf((u,v)=>S(-Math.PI+u*Math.PI*2,YB-0.02+(H+0.02)*v),14,8),M.helm,'helm');
    const out=(p,ph,o)=>p.add(V(Math.sin(ph)*o,0,Math.cos(ph)*o));
    ribbon(g,u=>{ const ph=-0.95+1.9*u; return [out(S(ph,YEYE-0.014),ph,0.002),out(S(ph,YEYE+0.014),ph,0.002)]; },16,DARK(),'slit');   // one long sight
    ribbon(g,u=>{ const ph=-1.0+2.0*u, y=YEYE+0.03+0.035*Math.abs(ph); return [out(S(ph,y-0.009),ph,0.004),out(S(ph,y+0.009),ph,0.004)]; },16,GD);   // the brow, swept up in a V
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2, y=YB-0.02+(Math.max(0,-Math.cos(ph))>0?-0.0:0); const p=S(ph,YB-0.018); return [out(p.clone(),ph,0.003),out(S(ph,YB-0.004),ph,0.003)]; },32,GD);   // the rim
    // the fin: a blade of steel along the crown, front to back, gold on its edge
    const fin=new THREE.Shape(); fin.moveTo(0.11,0); fin.quadraticCurveTo(0.02,0.05,-0.12,0.025); fin.lineTo(-0.15,0); fin.closePath();
    const fm=mesh(g,ext(fin,0.008),M.helm,'helm'); fm.rotation.y=Math.PI/2; fm.position.set(0.004,YT-0.018,CZ);
    const fe=new THREE.Shape(); fe.moveTo(0.11,0); fe.quadraticCurveTo(0.02,0.05,-0.12,0.025); fe.lineTo(-0.12,0.017); fe.quadraticCurveTo(0.02,0.04,0.1,0); fe.closePath();
    const fg=mesh(g,ext(fe,0.012),GD,'gold'); fg.rotation.y=Math.PI/2; fg.position.set(0.006,YT-0.016,CZ); });
  reg('plume','striker','Striker crest',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.plume);   // a short brush swept back along the fin
    for(let i=0;i<9;i++){ const s=i/8, x=(i%2?1:-1)*0.006; const pts=bez(V(x,0.02,0.06-s*0.1),V(x,0.07,0.0-s*0.1),V(x,0.06,-0.12-s*0.08),V(x*2,0.0,-0.24-s*0.08),8);
      mesh(g,sweep(pts,0.018,0.009,6,t=>Math.pow(1-t,0.7)*0.9+0.1),i%3===1?M.plumeHi:M.plume,'hair'); } });
  reg('cowl','striker','Striker scarf',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), SC=M.scarf||M.tunic;   // wrapped close, two tails streaming behind
    const E=bounds(to,o=>o.userData.part==='scarf',[[-0.139,0.361,-0.14],[0.139,0.537,0.16]]), y0=E.min.y+0.03, y1=E.max.y, w=Math.max(Math.abs(E.min.x),E.max.x);
    mesh(g,band((ph,y)=>w*(1.08-0.4*(y-y0)/(y1-y0))*(1+0.03*Math.sin(ph*5+y*30)),-Math.PI,Math.PI,y0,y1,28,4,{zk:1.0,smooth:true,two:0.004}),SC,'scarf');
    [-1,1].forEach(sd=>mesh(g,sweep(bez(V(sd*0.05,y0+0.04,E.min.z+0.02),V(sd*0.09,y0-0.02,E.min.z-0.08),V(sd*0.11,y0-0.12,E.min.z-0.16),V(sd*0.15,y0-0.24,E.min.z-0.22),8),0.035,0.006,4,t=>1-0.4*t),SC,'scarf')); });
  reg('tabard','striker','Striker harness',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M), {y0,y1,ZK,CZ}=torsoE(K);
    const r=(ph,y)=>(chestR(y,y0,y1)+0.012)*1.0, at=(ph,y,o)=>{ const rr=r(ph,y)+(o||0); return V(rr*Math.sin(ph),y,CZ+ZK*rr*Math.cos(ph)); };
    mesh(g,band(r,-Math.PI,Math.PI,y0+0.02,y1,28,9,{zk:ZK,cz:CZ,smooth:true}),M.tunic,'tunic');
    // the crossed harness: two straps over the shoulders, crossing on the breast at a gilt medallion bearing the cross
    [-1,1].forEach(sd=>ribbon(g,u=>{ const y=y1-0.03-(y1-y0-0.09)*u, ph=sd*(0.75-1.5*u); return [at(ph-0.06,y,0.006),at(ph+0.06,y,0.006)]; },14,M.boot,'leather'));
    [-1,1].forEach(sd=>ribbon(g,u=>{ const y=y1-0.03-(y1-y0-0.09)*u, ph=Math.PI+sd*(0.75-1.5*u); return [at(ph-0.06,y,0.006),at(ph+0.06,y,0.006)]; },14,M.boot,'leather'));
    const mp=at(0,y0+(y1-y0)*0.48,0.012), md=mesh(g,new THREE.CylinderGeometry(0.045,0.045,0.012,12).toNonIndexed(),GD,'gold'); md.position.copy(mp); md.rotation.x=Math.PI/2;
    const c1=mesh(g,new THREE.BoxGeometry(0.012,0.05,0.006).toNonIndexed(),M.cross||M.tunic,'cross'), c2=mesh(g,new THREE.BoxGeometry(0.05,0.012,0.006).toNonIndexed(),M.cross||M.tunic,'cross'); c1.position.copy(mp).add(V(0,0,0.008)); c2.position.copy(c1.position);
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2; return [at(ph,y0+0.02,0.004),at(ph,y0+0.04,0.004)]; },40,GD);   // a plain gold hem
    [-1,1].forEach(sd=>ribbon(g,u=>{ const y=y0+0.03+(y1-0.08-y0)*u; return [at(sd*1.5-0.05,y,0.004),at(sd*1.5+0.05,y,0.004)]; },8,GD)); });
  reg('belt','striker','Striker belt & dagger',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M), {ZK,CZ}=torsoE(K), RB=0.206, at=(ph,y,r)=>V(r*Math.sin(ph),y,CZ+ZK*r*Math.cos(ph));
    mesh(g,band(()=>RB,-Math.PI,Math.PI,0.03,0.07,28,1,{zk:ZK,cz:CZ,two:0.003}),M.boot,'leather');
    const bk=mesh(g,new THREE.TorusGeometry(0.022,0.006,4,10).toNonIndexed(),GD,'gold'); bk.position.copy(at(0,0.05,RB+0.006));
    // the dagger at the right hip, slung forward: sheath, crossguard, grip, pommel
    const dg=new THREE.Group(); dg.position.copy(at(-1.1,0.02,RB+0.02)); dg.rotation.set(0.25,-1.1,0.35); g.add(dg); dg.userData.armor=g.userData.armor;
    mesh(dg,cone(0.018,0.2,4),M.boot,'leather').position.set(0,-0.1,0); mesh(dg,new THREE.BoxGeometry(0.07,0.01,0.014).toNonIndexed(),GD,'gold');
    const gr=mesh(dg,new THREE.CylinderGeometry(0.008,0.009,0.055,6).toNonIndexed(),M.boot,'leather'); gr.position.y=0.03; mesh(dg,facetSphere(0.013,0.013,0.013,6,4),GD,'gold').position.y=0.064;
    mesh(dg,cone(0.02,0.2,4),M.boot,'leather').rotation.x=Math.PI; dg.children[dg.children.length-1].position.y=-0.1; });
  reg('skirt','striker','Striker split skirt',ctx=>{ const K=ctx.K, {LF,LB}=skirtE(K);   // short, split for the stride, sharply dagged
    [-1,1].forEach(sd=>panel(ctx,K._skF,{p0:sd>0?0.06:-0.72,p1:sd>0?0.72:-0.06,r0:0.205,r1:0.25,len:LF*0.62,teeth:2,dep:0.07}));
    [-1,1].forEach(sd=>panel(ctx,K._skB,{p0:Math.PI+(sd>0?0.06:-1.0),p1:Math.PI+(sd>0?1.0:-0.06),r0:0.205,r1:0.252,len:LB*0.66,teeth:3,dep:0.065,zk:0.8})); });
  reg('pauldrons','striker','Striker spaulders',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // close, angular, a swept spike over each
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*1.02, rz=e.rz*1.02, top=e.top+0.012, ry=(top-e.bot)*0.6;
      const dome=(ph,th,o)=>V(e.cx+(rx+(o||0))*Math.sin(th)*Math.sin(ph), top-ry+(ry+(o||0)*0.8)*Math.cos(th), (rz+(o||0))*Math.sin(th)*Math.cos(ph));
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.55*(1-v)),10,4,{two:0.004}),M.paul,'paul');
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.55-0.08*(1-v),0.005),20,1,{two:0.002}),GD,'gold');
      lames(g,M,{n:1,y0:top-ry*1.05,h:0.06,r:Math.max(rx,rz)*0.85,dr:0,p0:(sd>0?Math.PI/2:-Math.PI/2)-1.6,p1:(sd>0?Math.PI/2:-Math.PI/2)+1.6,cx:e.cx,zk:0.95,mat:M.paul});
      const sp=mesh(g,cone(0.026,0.11,5),M.paul,'paul'); sp.position.copy(dome(sd>0?Math.PI/2:-Math.PI/2,0.45,0.0)); sp.rotation.set(-0.5,0,-sd*0.55);   // the spike, swept back and out
      const sr=mesh(g,new THREE.TorusGeometry(0.026,0.005,4,10).toNonIndexed(),GD,'gold'); sr.position.copy(sp.position); sr.rotation.copy(sp.rotation); sr.rotateX(Math.PI/2); }); });
  reg('arms','striker','Striker vambraces',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // slim, one band, a spiked couter
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      mesh(g1,band((ph,y)=>0.056+0.006*(y+0.235)/0.15,-Math.PI,Math.PI,-0.235,-0.085,7,2,{two:0.003}),M.steel,'steel');
      mesh(g2,band((ph,y)=>0.053+0.01*(y+0.2)/0.17,-Math.PI,Math.PI,-0.2,-0.03,7,3,{two:0.003}),M.steel,'steel');
      mesh(g2,band(()=>0.064,-Math.PI,Math.PI,-0.06,-0.045,14,1,{two:0.002}),GD,'gold');
      const cp=mesh(g2,facetSphere(0.045,0.045,0.035,6,4,0,Math.PI*0.55),M.steel,'steel'); cp.position.set(0,0,-0.022); cp.rotation.x=-Math.PI/2;
      const sp=mesh(g2,cone(0.018,0.07,5),M.steel,'steel'); sp.position.set(0,0.005,-0.08); sp.rotation.x=-Math.PI/2-0.3; }); });
  reg('gauntlets','striker','Striker gauntlets',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // short cuffs, knuckle spikes
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.hand), h=handE(A,sd), {gc,n,t,y1,rr,back,Eg}=h;
      mesh(g,band(()=>rr+0.006,-Math.PI,Math.PI,y1-0.035,y1,8,1,{two:0.003,cx:gc.x,cz:gc.z}),M.steel,'steel');
      mesh(g,band(()=>rr+0.01,-Math.PI,Math.PI,y1-0.006,y1+0.002,14,1,{two:0.002,cx:gc.x,cz:gc.z}),GD,'gold');
      mesh(g,surf((u,v)=>{ const a=u*2-1, y=Eg.min.y+0.035+(y1-0.035-Eg.min.y-0.035)*v; return gc.clone().addScaledVector(t,a*0.037).addScaledVector(n,back-0.012*a*a).add(V(0,y-gc.y,0)); },6,2,{two:0.003}),M.steel,'steel');
      [-1,-0.33,0.33,1].forEach(a=>{ const s=mesh(g,cone(0.008,0.026,4),M.steel,'steel'); s.position.copy(gc).addScaledVector(t,a*0.026).addScaledVector(n,back+0.006).add(V(0,Eg.min.y+0.032-gc.y,0)); s.quaternion.setFromUnitVectors(V(0,1,0),n); }); }); });
  reg('legs','striker','Striker greaves',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // slim plate, a spike on each knee
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const gh=piece(ctx,G.hip), gk=piece(ctx,G.knee);
      const Eh=bounds(G.hip,o=>/^(steel|gold)$/.test(o.userData.part),[[-0.105,-0.348,0.009],[0.101,-0.025,0.114]]), RH=(Eh.max.x-Eh.min.x)/2+0.006;
      mesh(gh,band((ph,y)=>RH*(0.92+0.08*(y-Eh.min.y)/(Eh.max.y-Eh.min.y)),-1.4,1.4,Eh.min.y+0.06,Eh.max.y-0.02,7,2,{two:0.004}),M.steel,'steel');
      mesh(gh,band(()=>RH*0.95+0.004,-1.4,1.4,Eh.min.y+0.06,Eh.min.y+0.074,10,1,{two:0.002}),GD,'gold');
      const pk=mesh(gk,facetSphere(0.055,0.055,0.045,6,4,0,Math.PI*0.6),M.steel,'steel'); pk.position.set(0,0.012,0.04); pk.rotation.x=Math.PI/2;
      const sp=mesh(gk,cone(0.02,0.075,5),M.steel,'steel'); sp.position.set(0,0.03,0.105); sp.rotation.x=Math.PI/2-0.5;
      const rG=(ph,y)=>0.054+0.012*Math.min(1,(y+0.34)/0.2)+0.005*Math.max(0,1-Math.abs(ph)/0.25);
      mesh(gk,band(rG,-1.5,1.5,-0.34,-0.05,8,3,{two:0.004}),M.steel,'steel'); mesh(gk,band((ph,y)=>rG(ph,y)-0.004,Math.PI-1.7,Math.PI+1.7,-0.34,-0.05,6,2,{two:0.003}),M.boot,'leather');
      ribbon(gk,u=>{ const y=-0.34+0.29*u, a=V(0,y,rG(0,y)+0.004); return [a.clone().add(V(-0.007,0,0)),a.clone().add(V(0.007,0,0))]; },6,GD); }); });
  reg('sabatons','striker','Striker sabatons',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // long pointed toes
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const g=piece(ctx,G.knee), e=footE(G), L=e.z1-e.z0+0.025;
      const foot=(u,v)=>{ const a=(u*2-1)*Math.PI/2, z=e.z0+L*v, nose=Math.pow(Math.max(0,(v-0.7)/0.3),1.4), w=e.x0*(1-0.7*nose), h=(e.yt-e.ys)*(1-0.62*v)*(1-0.35*nose)+0.012; return V(e.cx+w*Math.sin(a), e.ys+0.012+h*Math.cos(a), z); };
      mesh(g,surf(foot,8,7,{flip:true}),M.steel,'steel'); [0.25,0.42].forEach(v=>mesh(g,surf((u,w)=>{ const p=foot(u,v+w*0.02); p.y+=0.003; return p; },10,1,{two:0.002}),GD,'gold'));
      mesh(g,band(()=>e.x0+0.006,-Math.PI,Math.PI,e.yt-0.018,e.yt,12,1,{two:0.002,cx:e.cx,cz:e.z0+0.05}),GD,'gold');
      const so=mesh(g,new THREE.BoxGeometry(e.x0*2,0.014,e.z1-e.z0).toNonIndexed(),M.boot,'leather'); so.position.set(e.cx,e.ys+0.007,e.z0+(e.z1-e.z0)/2); }); });

  // ═════════════ GUARDIAN · the Shield ═════════════
  reg('helm','guardian','Guardian great helm',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.head), GD=GDm(M), h=headE(K), XR=h.XR+0.012, ZR=h.ZR+0.012, CZ=h.CZ, YB=h.YB-0.03, YT=h.YT+0.012, H=YT-YB, YEYE=YB+0.62*H;
    // a flat-topped great helm, its face a little flat, its foot flared over the gorget
    const S=(ph,y,off)=>{ const v=(y-YB)/H; let k=v<0.1?1.05-0.05*v/0.1:1.0; if(v>0.9) k*=1-Math.pow((v-0.9)/0.1,3)*0.15; const fr=Math.max(0,Math.cos(ph)), r=k*(1-0.06*Math.pow(fr,4))+(off||0)/ZR;
      return V(XR*r*Math.sin(ph), y, CZ+ZR*r*Math.cos(ph)); };
    mesh(g,surf((u,v)=>S(-Math.PI+u*Math.PI*2,YB+H*v),12,6),M.helm,'helm');
    mesh(g,(()=>{ let c=new THREE.CylinderGeometry(1,1,0.01,12,1); c.scale(XR*0.86,1,ZR*0.86); c=c.toNonIndexed(); c.computeVertexNormals(); return c; })(),M.helm,'helm').position.set(0,YT,CZ);   // the flat crown
    const out=(p,ph,o)=>p.add(V(Math.sin(ph)*o,0,Math.cos(ph)*o));
    [-1,1].forEach(sd=>ribbon(g,u=>{ const ph=sd*(0.08+0.6*u); return [out(S(ph,YEYE-0.012),ph,0.002),out(S(ph,YEYE+0.012),ph,0.002)]; },8,DARK(),'slit'));   // two sights, parted by the cross
    ribbon(g,u=>{ const ph=-0.7+1.4*u; return [out(S(ph,YEYE+0.016),ph,0.005),out(S(ph,YEYE+0.04),ph,0.005)]; },12,GD);   // the cross on the face: its arms
    ribbon(g,u=>{ const y=YB+0.02+(YT-0.01-YB-0.02)*u, p=S(0,y,0.006); return [p.clone().add(V(-0.016,0,0)),p.clone().add(V(0.016,0,0))]; },8,GD);   // and its upright
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2; return [out(S(ph,YB+0.002),ph,0.004),out(S(ph,YB+0.022),ph,0.004)]; },24,GD);   // the rim
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2; return [out(S(ph,YT-0.016),ph,0.004),out(S(ph,YT-0.002),ph,0.004)]; },24,GD);   // the crown's edge
    for(let r=0;r<3;r++) for(let c=0;c<3;c++){ if((r+c)%2) continue; const ph=-0.95-c*0.1, y=YB+0.04+r*0.03, b=mesh(g,new THREE.BoxGeometry(0.012,0.012,0.01).toNonIndexed(),DARK(),'slit'); b.position.copy(S(ph,y,0.001)); b.rotation.y=ph; }   // breaths, a cross of holes
    [-1,1].forEach(sd=>{ const rv=mesh(g,facetSphere(0.012,0.012,0.012,6,4),GD,'gold'); rv.position.copy(S(sd*Math.PI/2,YEYE,0.006)); }); });
  reg('plume','guardian','Guardian fan crest',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.plume), GD=GDm(M);   // a heraldic fan, gold-edged, a red brush on its crest
    const fan=new THREE.Shape(); fan.moveTo(-0.11,0); fan.absarc(0,0,0.11,Math.PI,0,true); fan.lineTo(-0.11,0);
    const f=mesh(g,ext(fan,0.01),M.helm,'helm'); f.rotation.y=Math.PI/2; f.position.set(-0.005,0.02,0.0);
    const rim=new THREE.Shape(); rim.absarc(0,0,0.118,Math.PI,0,true); rim.absarc(0,0,0.104,0,Math.PI,false);
    const r=mesh(g,ext(rim,0.016),GD,'gold'); r.rotation.y=Math.PI/2; r.position.set(-0.008,0.02,0.0);
    for(let i=0;i<14;i++){ const a=Math.PI*(0.06+0.88*i/13), x=(i%2?1:-1)*0.004; mesh(g,sweep([V(x,0.02+Math.sin(a)*0.115,-Math.cos(a)*0.115),V(x,0.02+Math.sin(a)*0.16,-Math.cos(a)*0.16)],0.012,0.008,5,t=>1-0.7*t),i%3?M.plume:M.plumeHi,'hair'); } });
  reg('cowl','guardian','Guardian gorget',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M);   // three lames of steel about the throat
    const E=bounds(to,o=>o.userData.part==='scarf',[[-0.139,0.361,-0.14],[0.139,0.537,0.16]]), y0=E.min.y, w=Math.max(Math.abs(E.min.x),E.max.x);
    for(let k=0;k<3;k++){ const ya=y0+k*0.05, r0=w*(1.3-k*0.2), r1=w*(1.18-k*0.2); mesh(g,band((ph,y)=>r0+(r1-r0)*(y-ya)/0.06,-Math.PI,Math.PI,ya,ya+0.06,16,1,{zk:0.95,two:0.004}),M.steel,'steel');
      mesh(g,band(()=>r0+0.004,-Math.PI,Math.PI,ya,ya+0.012,24,1,{zk:0.95,two:0.002}),GD,'gold'); } });
  reg('tabard','guardian','Guardian breastplate',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M), {y0,y1,ZK,CZ}=torsoE(K);
    // a steel cuirass: a ridge down the breast, a plackart over the belly, the cross raised in gold; the tabard's cloth at the sides
    const r=(ph,y)=>(chestR(y,y0,y1)+0.02)+0.012*Math.max(0,1-Math.abs(ph)/0.3)*(y>y0+0.1?1:0), at=(ph,y,o)=>{ const rr=r(ph,y)+(o||0); return V(rr*Math.sin(ph),y,CZ+ZK*rr*Math.cos(ph)); };
    mesh(g,band(r,-Math.PI,Math.PI,y0+0.02,y1,20,8,{zk:ZK,cz:CZ}),M.helm,'steel');
    mesh(g,band((ph,y)=>r(ph,y)+0.008,-1.2,1.2,y0+0.02,y0+0.14,12,2,{zk:ZK,cz:CZ,two:0.003}),M.helm,'steel');   // the plackart
    ribbon(g,u=>{ const ph=-1.2+2.4*u; return [at(ph,y0+0.14,0.009),at(ph,y0+0.156,0.009)]; },16,GD);
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2; return [at(ph,y1-0.05,0.004),at(ph,y1-0.03,0.004)]; },32,GD);   // the neck's edge
    [-1,1].forEach(sd=>ribbon(g,u=>{ const a=-1.2+2.4*u, y=y1-0.13+0.07*Math.cos(a), ph=sd*Math.PI/2+a*0.45; return [at(ph,y,0.004),at(ph,y+0.018,0.004)]; },10,GD));   // round the arms
    const cy=y0+(y1-y0)*0.55; [[0.032,0.2,0,0],[0.15,0.032,0,0.035]].forEach(([w,hh,x,y])=>{ const b=mesh(g,new THREE.BoxGeometry(w,hh,0.012).toNonIndexed(),GD,'gold'); b.position.set(x,cy+y,CZ+ZK*r(0,cy)+0.008); }); });
  reg('belt','guardian','Guardian war belt',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M), {ZK,CZ}=torsoE(K), RB=0.218;
    mesh(g,band(()=>RB,-Math.PI,Math.PI,0.0,0.085,28,1,{zk:ZK,cz:CZ,two:0.003}),M.boot,'leather');
    for(let i=0;i<10;i++){ const ph=-Math.PI+i*Math.PI/5+0.3, s=mesh(g,new THREE.BoxGeometry(0.03,0.04,0.008).toNonIndexed(),GD,'gold'); s.position.set(RB*Math.sin(ph)*1.03,0.042,CZ+ZK*RB*Math.cos(ph)*1.03); s.rotation.y=ph; }   // its gilt plaques
    const bz=CZ+ZK*RB+0.01, fr=(w,hh,x,y)=>{ const m=mesh(g,new THREE.BoxGeometry(w,hh,0.012).toNonIndexed(),GD,'gold'); m.position.set(x,y,bz); }; fr(0.09,0.016,0,0.084); fr(0.09,0.016,0,0.0); fr(0.016,0.09,-0.04,0.042); fr(0.016,0.09,0.04,0.042); });
  reg('skirt','guardian','Guardian tassets',ctx=>{ const K=ctx.K, M=K.M, {LF,LB}=skirtE(K);   // plate over a short cloth skirt
    panel(ctx,K._skF,{p0:-1.4,p1:1.4,r0:0.21,r1:0.25,len:LF*0.62,teeth:4,dep:0.03});
    panel(ctx,K._skB,{p0:Math.PI-1.4,p1:Math.PI+1.4,r0:0.21,r1:0.25,len:LB*0.62,teeth:4,dep:0.03});
    const gF=piece(ctx,K._skF), gB=piece(ctx,K._skB);
    [-1,1].forEach(sd=>lames(gF,M,{n:3,y0:0.0,h:0.075,r:0.232,dr:0.008,p0:sd>0?0.12:-1.05,p1:sd>0?1.05:-0.12,zk:0.8,nu:8}));
    lames(gB,M,{n:3,y0:0.0,h:0.07,r:0.232,dr:0.008,p0:Math.PI-1.1,p1:Math.PI+1.1,zk:0.8,nu:10}); });
  reg('pauldrons','guardian','Guardian pauldrons',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // huge, layered, a haute-piece to turn a blow from the neck
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*1.32, rz=e.rz*1.3, top=e.top+0.03, ry=(top-e.bot)*0.7, cx=e.cx+sd*0.015;
      const dome=(ph,th,o)=>V(cx+(rx+(o||0))*Math.sin(th)*Math.sin(ph), top-ry+(ry+(o||0)*0.8)*Math.cos(th), (rz+(o||0))*Math.sin(th)*Math.cos(ph));
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.58*(1-v)),14,5,{two:0.005}),M.paul,'paul');
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.58-0.07*(1-v),0.006),28,1,{two:0.002}),GD,'gold');
      lames(g,M,{n:3,y0:top-ry*1.05,h:0.06,r:Math.max(rx,rz)*0.88,dr:0.004,p0:(sd>0?Math.PI/2:-Math.PI/2)-1.8,p1:(sd>0?Math.PI/2:-Math.PI/2)+1.8,cx,zk:0.95,mat:M.paul});
      // the haute-piece: an upright plate on the inner edge, gold-capped
      const hp=new THREE.Shape(); hp.moveTo(-0.11,0); hp.quadraticCurveTo(0,0.045,0.11,0); hp.lineTo(0.1,-0.03); hp.lineTo(-0.1,-0.03); hp.closePath();
      const hm=mesh(g,ext(hp,0.008),M.paul,'paul'); hm.rotation.y=Math.PI/2; hm.position.set(cx-sd*rx*0.55,top+0.0,0); const hg=new THREE.Shape(); hg.moveTo(-0.11,0); hg.quadraticCurveTo(0,0.045,0.11,0); hg.quadraticCurveTo(0,0.033,-0.11,-0.008); hg.closePath();
      const hgm=mesh(g,ext(hg,0.012),GD,'gold'); hgm.rotation.y=Math.PI/2; hgm.position.set(cx-sd*rx*0.55-0.002,top+0.002,0);
      const bp=dome(sd>0?Math.PI/2:-Math.PI/2,0.95,0.004), bm=mesh(g,new THREE.CylinderGeometry(0.038,0.04,0.014,12).toNonIndexed(),GD,'gold'); bm.position.copy(bp); bm.quaternion.setFromUnitVectors(V(0,1,0),bp.clone().sub(V(cx,top-ry,0)).normalize()); }); });
  reg('arms','guardian','Guardian vambraces',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // heavy plate, three bands, a broad couter
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      mesh(g1,band((ph,y)=>0.066+0.008*(y+0.235)/0.15,-Math.PI,Math.PI,-0.235,-0.085,8,2,{two:0.003}),M.steel,'steel');
      mesh(g2,band((ph,y)=>0.064+0.012*(y+0.2)/0.17,-Math.PI,Math.PI,-0.2,-0.03,8,3,{two:0.003}),M.steel,'steel');
      [-0.05,-0.11,-0.18].forEach(y=>mesh(g2,band(()=>0.075+(y+0.2)*0.06,-Math.PI,Math.PI,y,y+0.014,16,1,{two:0.002}),GD,'gold'));
      const cp=mesh(g2,facetSphere(0.062,0.06,0.05,8,5,0,Math.PI*0.55),M.steel,'steel'); cp.position.set(0,0,-0.024); cp.rotation.x=-Math.PI/2;
      const fan=mesh(g2,facetSphere(0.065,0.055,0.016,8,4),M.steel,'steel'); fan.position.set(sd*0.06,0.0,-0.005); fan.rotation.y=sd*0.4;
      const rim=mesh(g2,new THREE.TorusGeometry(0.06,0.007,4,12).toNonIndexed(),GD,'gold'); rim.position.set(0,0,-0.026); }); });
  reg('gauntlets','guardian','Guardian gauntlets',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // big bell cuffs, a broad plate over the fist
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.hand), {gc,n,t,y1,rr,back,Eg}=handE(A,sd);
      mesh(g,band((ph,y)=>rr+0.006+0.035*(y-(y1-0.06))/0.06,-Math.PI,Math.PI,y1-0.06,y1+0.01,8,2,{two:0.003,cx:gc.x,cz:gc.z}),M.steel,'steel');
      mesh(g,band(()=>rr+0.044,-Math.PI,Math.PI,y1+0.002,y1+0.012,16,1,{two:0.002,cx:gc.x,cz:gc.z}),GD,'gold');
      const pl=(ya,yb,w,o)=>mesh(g,surf((u,v)=>{ const a=u*2-1, y=ya+(yb-ya)*v; return gc.clone().addScaledVector(t,a*w/2).addScaledVector(n,o-0.014*a*a).add(V(0,y-gc.y,0)); },6,2,{two:0.003}),M.steel,'steel');
      pl(Eg.min.y+0.03,y1-0.055,0.09,back+0.006); [0,1,2].forEach(k=>pl(Eg.min.y+0.012-k*0.016,Eg.min.y+0.034-k*0.016,0.085,back+0.002-k*0.004)); }); });
  reg('legs','guardian','Guardian legharness',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // closed greaves, big poleyns with fans, laminated cuisses
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const gh=piece(ctx,G.hip), gk=piece(ctx,G.knee);
      const Eh=bounds(G.hip,o=>/^(steel|gold)$/.test(o.userData.part),[[-0.105,-0.348,0.009],[0.101,-0.025,0.114]]), RH=(Eh.max.x-Eh.min.x)/2+0.012;
      lames(gh,M,{n:4,y0:Eh.max.y+0.01,h:0.085,r:RH,dr:-0.003,p0:-1.6,p1:1.6,zk:1,nu:8});
      const pk=mesh(gk,facetSphere(0.07,0.07,0.06,8,5,0,Math.PI*0.6),M.steel,'steel'); pk.position.set(0,0.012,0.04); pk.rotation.x=Math.PI/2;
      const fan=mesh(gk,facetSphere(0.055,0.062,0.016,8,4),M.steel,'steel'); fan.position.set(sd*0.06,0.01,0.01); fan.rotation.y=sd*0.5;
      const rim=mesh(gk,new THREE.TorusGeometry(0.068,0.007,4,14).toNonIndexed(),GD,'gold'); rim.position.set(0,0.012,0.044);
      const rG=(ph,y)=>0.06+0.016*Math.sin(Math.min(1,(y+0.345)/0.25)*Math.PI/2)+0.006*Math.max(0,1-Math.abs(ph)/0.25);
      mesh(gk,band(rG,-Math.PI,Math.PI,-0.345,-0.04,10,4,{two:0.004}),M.steel,'steel');
      [-0.345,-0.06].forEach(y=>mesh(gk,band((ph,yy)=>rG(ph,y)+0.005,-Math.PI,Math.PI,y,y+0.018,16,1,{two:0.002}),GD,'gold'));
      ribbon(gk,u=>{ const y=-0.33+0.27*u, a=V(0,y,rG(0,y)+0.004); return [a.clone().add(V(-0.008,0,0)),a.clone().add(V(0.008,0,0))]; },6,GD); }); });
  reg('sabatons','guardian','Guardian sabatons',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // broad and square-toed, four lames
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const g=piece(ctx,G.knee), e=footE(G), L=e.z1-e.z0, x0=e.x0+0.01;
      const foot=(u,v)=>{ const a=(u*2-1)*Math.PI/2, z=e.z0+L*v, h=(e.yt-e.ys)*(1-0.55*v)+0.018; return V(e.cx+x0*Math.sin(a)*(v>0.9?0.85:1), e.ys+0.012+h*Math.cos(a), z); };
      mesh(g,surf(foot,8,6,{flip:true}),M.steel,'steel'); [0.2,0.36,0.52,0.68].forEach(v=>mesh(g,surf((u,w)=>{ const p=foot(u,v+w*0.022); p.y+=0.003; return p; },10,1,{two:0.002}),GD,'gold'));
      mesh(g,band(()=>x0+0.008,-Math.PI,Math.PI,e.yt-0.024,e.yt,12,1,{two:0.002,cx:e.cx,cz:e.z0+0.05}),GD,'gold');
      const so=mesh(g,new THREE.BoxGeometry(x0*2+0.006,0.018,L).toNonIndexed(),M.boot,'leather'); so.position.set(e.cx,e.ys+0.009,e.z0+L/2); }); });

  // ═════════════ PSALMIST · the Spirit ═════════════
  reg('helm','psalmist','Psalmist hood & circlet',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.head), GD=GDm(M), h=headE(K), SC=M.scarf||M.tunic;
    const XR=h.XR+0.028, ZR=h.ZR+0.03, CZ=h.CZ-0.012, YB=h.YB-0.03, YT=h.YT+0.025, H=YT-YB;
    // the hood: round, rising to a soft peak behind; its front open on a face kept in shadow
    const S=(ph,y,off)=>{ const v=(y-YB)/H, back=Math.max(0,-Math.cos(ph)); let k=v<0.5?1+0.04*(1-v):Math.pow(Math.max(0,Math.cos((v-0.5)/0.5*Math.PI/2)),0.6);
      const peak=back*back*Math.max(0,v-0.6)*0.4, r=k+peak*0.3+(off||0)/ZR; return V(XR*r*Math.sin(ph), y+peak*0.06, CZ+ZR*r*Math.cos(ph)); };
    const OPEN=0.62, inOpen=(ph,v)=>Math.abs(ph)<OPEN*(v<0.72?1:Math.max(0,1-(v-0.72)/0.16)) && v>0.08;
    const P=[], pu=a=>P.push(a.x,a.y,a.z), NU=24, NV=10;
    for(let j=0;j<NV;j++) for(let i=0;i<NU;i++){ const p0=-Math.PI+i/NU*Math.PI*2, p1=-Math.PI+(i+1)/NU*Math.PI*2, v0=j/NV, v1=(j+1)/NV; if(inOpen((p0+p1)/2,(v0+v1)/2)) continue;
      const a=S(p0,YB+H*v0), b=S(p1,YB+H*v0), c=S(p1,YB+H*v1), d=S(p0,YB+H*v1); pu(a);pu(b);pu(c); pu(a);pu(c);pu(d); }
    let hg=new THREE.BufferGeometry(); hg.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); hg.computeVertexNormals(); hg=ARMOR.H.twoSide(hg,0.006); mesh(g,hg,SC,'scarf');
    // the shadow within, and the light where the eyes are
    const sh=mesh(g,surf((u,v)=>{ const ph=-OPEN+2*OPEN*u, y=YB+H*(0.08+0.64*v); const p=S(ph,y,-0.035); return p; },8,4),DARK(),'slit');
    const glow=new THREE.MeshBasicMaterial({color:0xfff0c0}); [-1,1].forEach(sd=>{ const e=mesh(g,facetSphere(0.009,0.006,0.004,6,4),glow,'glow'); e.position.copy(S(sd*0.22,YB+H*0.5,-0.03)); });
    ribbon(g,u=>{ const ph=-OPEN-0.05+(2*OPEN+0.1)*u, v=0.08+0.0*u; return [S(ph,YB+H*0.08,0.004),S(ph,YB+H*0.08+0.016,0.004)]; },10,GD);   // the hood's hem, gilt
    [-1,1].forEach(sd=>ribbon(g,u=>{ const v=0.08+0.66*u, ph=sd*OPEN*(v<0.72?1:Math.max(0,1-(v-0.72)/0.16)); return [S(ph-0.06*sd,YB+H*v,0.004),S(ph,YB+H*v,0.004)]; },8,GD));   // its edges
    // the circlet: a gold band round the brow, a small cross set at its front
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2; return [S(ph,YB+H*0.74,0.006),S(ph,YB+H*0.74+0.02,0.006)]; },28,GD);
    const cp=S(0,YB+H*0.74+0.01,0.012), c1=mesh(g,new THREE.BoxGeometry(0.012,0.05,0.008).toNonIndexed(),GD,'gold'), c2=mesh(g,new THREE.BoxGeometry(0.034,0.012,0.008).toNonIndexed(),GD,'gold'); c1.position.copy(cp).add(V(0,0.014,0)); c2.position.copy(cp).add(V(0,0.022,0)); });
  reg('plume','psalmist','Psalmist hood-tail',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.plume), SC=M.scarf||M.tunic;   // the liripipe, hanging down the back
    mesh(g,sweep(bez(V(0,0.02,-0.06),V(0,-0.02,-0.16),V(0,-0.2,-0.2),V(0.02,-0.42,-0.18),12),0.04,0.016,6,t=>1-0.75*t),SC,'scarf');
    const tip=mesh(g,facetSphere(0.016,0.022,0.014,6,4),M.goldD||M.gold,'gold'); tip.position.set(0.02,-0.43,-0.18); });
  reg('cowl','psalmist','Psalmist hood-collar',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), SC=M.scarf||M.tunic, GD=GDm(M);   // the hood's cape over the shoulders, gold at its edge
    const E=bounds(to,o=>o.userData.part==='scarf',[[-0.139,0.361,-0.14],[0.139,0.537,0.16]]), y0=E.min.y-0.07, y1=E.max.y, w=Math.max(Math.abs(E.min.x),E.max.x);
    const r=(ph,y)=>{ const v=(y-y0)/(y1-y0); return w*(1.9-1.3*Math.pow(v,0.7))*(1+0.02*Math.sin(ph*9)); };
    mesh(g,band(r,-Math.PI,Math.PI,y0,y1,36,6,{zk:0.85,cz:0.0,smooth:true,two:0.004}),SC,'scarf');
    mesh(g,band((ph,y)=>r(ph,y0)+0.004,-Math.PI,Math.PI,y0,y0+0.018,40,1,{zk:0.85,two:0.002}),GD,'gold'); });
  reg('tabard','psalmist','Psalmist robe & stole',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M), {y0,y1,ZK,CZ}=torsoE(K);
    const r=(ph,y)=>chestR(y,y0,y1)+0.014, at=(ph,y,o)=>{ const rr=r(ph,y)+(o||0); return V(rr*Math.sin(ph),y,CZ+ZK*rr*Math.cos(ph)); };
    mesh(g,band(r,-Math.PI,Math.PI,y0+0.0,y1,32,10,{zk:ZK,cz:CZ,smooth:true}),M.tunic,'tunic');
    // the stole: two gold-edged bands from the shoulders down the breast, a cross near the foot of each
    [-1,1].forEach(sd=>{ const ph0=sd*0.42; ribbon(g,u=>{ const y=y1-0.01-(y1-y0+0.0)*u, ph=ph0-sd*0.12*(1-u); return [at(ph-0.08,y,0.006),at(ph+0.08,y,0.006)]; },12,M.cross||GD,'stole');
      [-1,1].forEach(e=>ribbon(g,u=>{ const y=y1-0.01-(y1-y0)*u, ph=ph0-sd*0.12*(1-u)+e*0.08; return [at(ph-0.012,y,0.008),at(ph+0.012,y,0.008)]; },12,GD));
      const c=at(ph0,y0+0.07,0.012), a=mesh(g,new THREE.BoxGeometry(0.012,0.045,0.006).toNonIndexed(),GD,'gold'), b=mesh(g,new THREE.BoxGeometry(0.032,0.012,0.006).toNonIndexed(),GD,'gold'); a.position.copy(c); b.position.copy(c).add(V(0,0.008,0)); a.rotation.y=b.rotation.y=ph0; });
 });
  reg('belt','psalmist','Psalmist cord & satchel',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=GDm(M), {ZK,CZ}=torsoE(K), RB=0.21;
    mesh(g,band(()=>RB-0.004,-Math.PI,Math.PI,-0.03,0.1,28,2,{zk:ZK,cz:CZ,smooth:true,two:0.003}),M.tunic,'tunic');   // a cloth sash beneath the cord
    const pts=[]; for(let i=0;i<=40;i++){ const ph=-Math.PI+i/40*Math.PI*2; pts.push(V(RB*Math.sin(ph),0.05+0.004*Math.sin(ph*14),CZ+ZK*RB*Math.cos(ph))); }
    mesh(g,sweep(pts,0.011,0.011,5),GD,'gold');   // the cord, gilt
    [-1,1].forEach(sd=>{ const x=sd*0.03, top=V(x,0.05,CZ+ZK*RB+0.008); mesh(g,sweep([top,top.clone().add(V(sd*0.005,-0.1,0.01)),top.clone().add(V(sd*0.012,-0.2,0.014))],0.007,0.007,5,t=>1-0.3*t),GD,'gold');
      const ts=mesh(g,cone(0.016,0.04,6),GD,'gold'); ts.position.copy(top).add(V(sd*0.012,-0.22,0.014)); ts.rotation.x=Math.PI; });   // its ends, knotted and tasselled
    // a small satchel at the hip, a book's corner showing
    const sg=new THREE.Group(); sg.position.set(RB*Math.sin(1.3)+0.02,-0.02,CZ+ZK*RB*Math.cos(1.3)+0.01); sg.rotation.y=1.3; g.add(sg); sg.userData.armor=g.userData.armor;
    mesh(sg,new THREE.BoxGeometry(0.09,0.085,0.035).toNonIndexed(),M.boot,'leather'); const fl=mesh(sg,new THREE.BoxGeometry(0.092,0.04,0.038).toNonIndexed(),M.boot,'leather'); fl.position.set(0,0.03,0.003);
    const st=mesh(sg,facetSphere(0.009,0.009,0.006,6,4),GD,'gold'); st.position.set(0,0.012,0.022); });
  reg('skirt','psalmist','Psalmist long robe',ctx=>{ const K=ctx.K, M=K.M, {LF,LB}=skirtE(K);   // to the shins, parted before for the stride, a gold hem
    [-1,1].forEach(sd=>panel(ctx,K._skF,{p0:sd>0?0.03:-1.62,p1:sd>0?1.62:-0.03,r0:0.205,r1:0.3,len:LF*1.32,teeth:1,dep:0,nv:7,hem:0.03}));
    panel(ctx,K._skB,{p0:Math.PI-1.62,p1:Math.PI+1.62,r0:0.205,r1:0.3,len:LB*1.3,teeth:1,dep:0,nv:7,hem:0.03,zk:0.8}); });
  reg('pauldrons','psalmist','Psalmist mantle',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M), SC=M.scarf||M.tunic;   // soft cloth over each shoulder, a gilt cross-pin
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*1.12, rz=e.rz*1.12, top=e.top+0.01, ry=(top-e.bot)*0.85;
      const dome=(ph,th,o)=>V(e.cx+(rx+(o||0))*Math.sin(th)*Math.sin(ph)*(1+0.04*Math.sin(ph*6)), top-ry+(ry+(o||0)*0.8)*Math.cos(th), (rz+(o||0))*Math.sin(th)*Math.cos(ph));
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.62*(1-v)),24,5,{smooth:true,two:0.004}),SC,'scarf');
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.62-0.06*(1-v),0.004),32,1,{two:0.002}),GD,'gold');
      const pp=dome(sd>0?Math.PI/2:-Math.PI/2,0.85,0.006), a=mesh(g,new THREE.BoxGeometry(0.012,0.04,0.006).toNonIndexed(),GD,'gold'), b=mesh(g,new THREE.BoxGeometry(0.03,0.012,0.006).toNonIndexed(),GD,'gold');
      [a,b].forEach(m=>{ m.position.copy(pp); m.rotation.y=sd*Math.PI/2; }); b.position.y+=0.006; }); });
  reg('arms','psalmist','Psalmist sleeves',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M), SC=M.tunic;   // wide sleeves from the elbow, gilt cuffs; a leather bracer beneath
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      mesh(g1,band((ph,y)=>0.066+0.006*Math.sin(ph*5),-Math.PI,Math.PI,-0.24,-0.06,14,2,{smooth:true,two:0.003}),SC,'tunic');
      mesh(g2,band((ph,y)=>0.066+0.06*Math.pow(Math.max(0,-y-0.02)/0.12,1.4)*(0.7+0.3*Math.max(0,-Math.cos(ph))),-Math.PI,Math.PI,-0.14,0.02,18,4,{smooth:true,two:0.003}),SC,'tunic');
      mesh(g2,band((ph,y)=>0.066+0.06*(0.7+0.3*Math.max(0,-Math.cos(ph)))+0.004,-Math.PI,Math.PI,-0.14,-0.122,24,1,{two:0.002}),GD,'gold');
      mesh(g2,band(()=>0.052,-Math.PI,Math.PI,-0.2,-0.12,8,1,{two:0.003}),M.boot,'leather'); }); });
  reg('gauntlets','psalmist','Psalmist gloves',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // leather, a gilt cross on the back of each
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.hand), {gc,n,t,y1,rr,back,Eg}=handE(A,sd);
      mesh(g,band(()=>rr+0.004,-Math.PI,Math.PI,y1-0.04,y1,8,1,{two:0.003,cx:gc.x,cz:gc.z}),M.boot,'leather');
      mesh(g,band(()=>rr+0.008,-Math.PI,Math.PI,y1-0.008,y1,14,1,{two:0.002,cx:gc.x,cz:gc.z}),GD,'gold');
      const c=gc.clone().addScaledVector(n,back-0.012).add(V(0,Eg.min.y+0.06-gc.y,0)), a=mesh(g,new THREE.BoxGeometry(0.01,0.034,0.006).toNonIndexed(),GD,'gold'), b=mesh(g,new THREE.BoxGeometry(0.026,0.01,0.006).toNonIndexed(),GD,'gold');
      [a,b].forEach(m=>{ m.position.copy(c); m.quaternion.setFromUnitVectors(V(0,0,1),n); }); b.position.y+=0.006; }); });
  reg('legs','psalmist','Psalmist leg-wraps',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // cloth hose bound with leather, a small knee guard
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const gh=piece(ctx,G.hip), gk=piece(ctx,G.knee);
      mesh(gh,band((ph,y)=>0.084+0.012*(y+0.34)/0.32,-Math.PI,Math.PI,-0.34,-0.02,10,2,{smooth:true,two:0.003}),M.scarf||M.tunic,'scarf');
      mesh(gk,band((ph,y)=>0.058+0.012*Math.min(1,(y+0.34)/0.25),-Math.PI,Math.PI,-0.34,0.02,10,3,{smooth:true,two:0.003}),M.scarf||M.tunic,'scarf');
      for(let k=0;k<5;k++){ const y=-0.3+k*0.055; mesh(gk,band((ph)=>0.064+0.012*Math.min(1,(y+0.34)/0.25)+0.002,-Math.PI,Math.PI,y,y+0.014,12,1,{two:0.002,yf:(ph,yy)=>yy+0.012*Math.sin(ph)}),M.boot,'leather'); }
      const kp=mesh(gk,facetSphere(0.05,0.05,0.035,8,5,0,Math.PI*0.55),M.boot,'leather'); kp.position.set(0,0.01,0.035); kp.rotation.x=Math.PI/2; }); });
  reg('sabatons','psalmist','Psalmist boots',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // soft leather boots, a turned cuff, a gilt toe
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const g=piece(ctx,G.knee), e=footE(G), L=e.z1-e.z0;
      const foot=(u,v)=>{ const a=(u*2-1)*Math.PI/2, z=e.z0+L*v, nose=Math.pow(Math.max(0,(v-0.75)/0.25),1.5), w=e.x0*(1-0.4*nose), h=(e.yt-e.ys)*(1-0.6*v)*(1-0.3*nose)+0.012; return V(e.cx+w*Math.sin(a), e.ys+0.012+h*Math.cos(a), z); };
      mesh(g,surf(foot,10,6,{flip:true,smooth:true}),M.boot,'leather');
      mesh(g,band(()=>e.x0+0.004,-Math.PI,Math.PI,e.yt-0.02,e.yt+0.06,12,2,{smooth:true,two:0.003,cx:e.cx,cz:e.z0+0.05}),M.boot,'leather');
      mesh(g,band(()=>e.x0+0.016,-Math.PI,Math.PI,e.yt+0.03,e.yt+0.065,14,1,{two:0.003,cx:e.cx,cz:e.z0+0.05}),M.boot,'leather');   // the turned cuff
      mesh(g,band(()=>e.x0+0.018,-Math.PI,Math.PI,e.yt+0.03,e.yt+0.038,16,1,{two:0.002,cx:e.cx,cz:e.z0+0.05}),GD,'gold');
      const tc=mesh(g,facetSphere(e.x0*0.62,0.022,0.035,8,4,0,Math.PI*0.5),GD,'gold'); tc.position.set(e.cx,e.ys+0.016,e.z1-0.03); }); });
})();
