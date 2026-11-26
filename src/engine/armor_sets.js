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
      return V(XR*r*Math.sin(ph)*(1-0.06*fr*(v<0.55?1:0)), y-tail*0.06, CZ+ZR*r*Math.cos(ph)+0.026*Math.pow(fr,10)*(v<0.9?1:0)*(1-Math.abs(v-0.45))); };   /* a sharper snout down the face */
    mesh(g,surf((u,v)=>S(-Math.PI+u*Math.PI*2,YB-0.02+(H+0.02)*v),14,8),M.helm,'helm');
    const out=(p,ph,o)=>p.add(V(Math.sin(ph)*o,0,Math.cos(ph)*o));
    [-1,1].forEach(sd=>ribbon(g,u=>{ const ph=sd*(0.1+0.85*u), y=YEYE+0.03*u-0.004; return [out(S(ph,y-0.012+0.004*u),ph,0.002),out(S(ph,y+0.01-0.004*u),ph,0.002)]; },8,DARK(),'slit'));   /* V243: a fox's eyes — two slits slanting up and out */
    ribbon(g,u=>{ const ph=-1.0+2.0*u, y=YEYE+0.03+0.035*Math.abs(ph); return [out(S(ph,y-0.009),ph,0.004),out(S(ph,y+0.009),ph,0.004)]; },16,GD);   // the brow, swept up in a V
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2, y=YB-0.02+(Math.max(0,-Math.cos(ph))>0?-0.0:0); const p=S(ph,YB-0.018); return [out(p.clone(),ph,0.003),out(S(ph,YB-0.004),ph,0.003)]; },32,GD);   // the rim
    // the ears: two tall pointed fins, swept back and out from the crown, gold on their leading edges (the fox)
    [-1,1].forEach(sd=>{ const ear=new THREE.Shape(); ear.moveTo(-0.06,0); ear.lineTo(0.055,0); ear.quadraticCurveTo(0.0,0.085,-0.05,0.17); ear.closePath();
      const em=mesh(g,ext(ear,0.008),M.helm,'helm'); em.position.copy(S(sd*0.55,YT-0.03)).add(V(0,-0.005,-0.012)); em.rotation.set(-0.35,sd*0.7-Math.PI/2*0,sd*-0.32); em.rotateY(Math.PI/2);
      const ed=new THREE.Shape(); ed.moveTo(0.042,0.0); ed.lineTo(0.058,0.0); ed.quadraticCurveTo(0.004,0.09,-0.05,0.17); ed.quadraticCurveTo(-0.004,0.078,0.042,0.0);
      const gm=mesh(g,ext(ed,0.011),GD,'gold'); gm.position.copy(em.position); gm.rotation.copy(em.rotation); gm.translateZ(-0.0015); }); });
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
  reg('arms','striker','Striker vambraces',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // slim, one band, a spiked couter
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      mesh(g1,band((ph,y)=>0.056+0.006*(y+0.235)/0.15,-Math.PI,Math.PI,-0.235,-0.085,7,2,{two:0.003}),M.steel,'steel');
      mesh(g2,band((ph,y)=>0.053+0.01*(y+0.2)/0.17,-Math.PI,Math.PI,-0.2,-0.03,7,3,{two:0.003}),M.steel,'steel');
      mesh(g2,band(()=>0.064,-Math.PI,Math.PI,-0.06,-0.045,14,1,{two:0.002}),GD,'gold');
      const cp=mesh(g2,facetSphere(0.045,0.045,0.035,6,4,0,Math.PI*0.55),M.steel,'steel'); cp.position.set(0,0,-0.022); cp.rotation.x=-Math.PI/2;
      const sp=mesh(g2,cone(0.018,0.07,5),M.steel,'steel'); sp.position.set(0,0.005,-0.08); sp.rotation.x=-Math.PI/2-0.3; }); });
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
  const hood=(ctx,o)=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.head), GD=GDm(M), h=headE(K), SC=o.mat||M.scarf||M.tunic;
    const XR=h.XR+0.028, ZR=h.ZR+0.03, CZ=h.CZ-0.012, YB=h.YB-0.03, YT=h.YT+0.025, H=YT-YB;
    // the hood: round, rising to a soft peak behind; its front open on a face kept in shadow
    const S=(ph,y,off)=>{ const v=(y-YB)/H, back=Math.max(0,-Math.cos(ph)); let k=v<0.5?1+0.04*(1-v):Math.pow(Math.max(0,Math.cos((v-0.5)/0.5*Math.PI/2)),0.6);
      const peak=back*back*Math.max(0,v-0.6)*0.4, r=k+peak*0.3+(off||0)/ZR; return V(XR*r*Math.sin(ph), y+peak*0.06, CZ+ZR*r*Math.cos(ph)); };
    const OPEN=0.62, inOpen=(ph,v)=>Math.abs(ph)<OPEN*(v<0.72?1:Math.max(0,1-(v-0.72)/0.16)) && v>0.08;
    const P=[], pu=a=>P.push(a.x,a.y,a.z), NU=24, NV=10;
    for(let j=0;j<NV;j++) for(let i=0;i<NU;i++){ const p0=-Math.PI+i/NU*Math.PI*2, p1=-Math.PI+(i+1)/NU*Math.PI*2, v0=j/NV, v1=(j+1)/NV; if(inOpen((p0+p1)/2,(v0+v1)/2)) continue;
      const a=S(p0,YB+H*v0), b=S(p1,YB+H*v0), c=S(p1,YB+H*v1), d=S(p0,YB+H*v1); pu(a);pu(b);pu(c); pu(a);pu(c);pu(d); }
    let hg=new THREE.BufferGeometry(); hg.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); if(o.smooth){ hg=ARMOR.H.weld(hg); hg.computeVertexNormals(); hg=hg.toNonIndexed(); } else hg.computeVertexNormals(); hg=ARMOR.H.twoSide(hg,0.006); mesh(g,hg,SC,'scarf');
    if(o.beak){ const bp=S(0,YB+H*0.82,0.0), bk=mesh(g,cone(0.03,0.07,8),SC,'scarf'); bk.position.copy(bp).add(V(0,-0.004,0.012)); bk.rotation.x=Math.PI/2+0.55; bk.scale.set(1.6,1,0.5); }   /* the dove: the hood's brow drawn to a soft point */
    // the shadow within, and the light where the eyes are
    const sh=mesh(g,surf((u,v)=>{ const ph=-OPEN+2*OPEN*u, y=YB+H*(0.08+0.64*v); const p=S(ph,y,-0.035); return p; },8,4),DARK(),'slit');
    const glow=new THREE.MeshBasicMaterial({color:o.eyes||0xfff0c0}); if(o.eyes!==false) [-1,1].forEach(sd=>{ const e=mesh(g,facetSphere(0.009,0.006,0.004,6,4),glow,'glow'); e.position.copy(S(sd*0.22,YB+H*0.5,-0.03)); });
    if(!o.circlet){ return; }
    ribbon(g,u=>{ const ph=-OPEN-0.05+(2*OPEN+0.1)*u, v=0.08+0.0*u; return [S(ph,YB+H*0.08,0.004),S(ph,YB+H*0.08+0.016,0.004)]; },10,GD);   // the hood's hem, gilt
    [-1,1].forEach(sd=>ribbon(g,u=>{ const v=0.08+0.66*u, ph=sd*OPEN*(v<0.72?1:Math.max(0,1-(v-0.72)/0.16)); return [S(ph-0.06*sd,YB+H*v,0.004),S(ph,YB+H*v,0.004)]; },8,GD));   // its edges
    // the circlet: a gold band round the brow, a small cross set at its front
    ribbon(g,u=>{ const ph=-Math.PI+u*Math.PI*2; return [S(ph,YB+H*0.74,0.006),S(ph,YB+H*0.74+0.02,0.006)]; },28,GD);
    const cp=S(0,YB+H*0.74+0.01,0.012), c1=mesh(g,new THREE.BoxGeometry(0.012,0.05,0.008).toNonIndexed(),GD,'gold'), c2=mesh(g,new THREE.BoxGeometry(0.034,0.012,0.008).toNonIndexed(),GD,'gold'); c1.position.copy(cp).add(V(0,0.014,0)); c2.position.copy(cp).add(V(0,0.022,0)); };
  reg('helm','psalmist','Psalmist hood & circlet',ctx=>hood(ctx,{circlet:true,smooth:true,beak:true}));
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


  // ═════════════ V243: the beasts — fox, bear, dove ═════════════
  const FUR={}, fur=(k,c)=>FUR[k]||(FUR[k]=new THREE.MeshPhongMaterial({color:c,shininess:2,specular:0x0a0a0a,flatShading:true})), cl0=(k,c)=>fur('_'+k,c);
  const pelt=(k,c)=>FUR['p'+k]||(FUR['p'+k]=new THREE.MeshPhongMaterial({color:c,shininess:3,specular:0x0c0a08,side:THREE.DoubleSide}));   // V245: fur, smooth
  // STRIKER · the fox — a brush of a tail for a crest, white at its tip
  reg('plume','striker','Striker fox-brush',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.plume), tip=fur('tip',0xf2eee6);
    const spine=bez(V(0,0.02,0.0),V(0,0.1,-0.06),V(0,0.08,-0.2),V(0,-0.12,-0.3),14), R=t=>0.03+0.05*Math.sin(Math.min(1,t*1.15)*Math.PI)*(1-0.3*t);
    for(let k=0;k<7;k++){ const a=k/7*Math.PI*2, off=V(Math.cos(a)*0.012,Math.sin(a)*0.012,0), pts=spine.map(p=>p.clone().add(off));
      const n=pts.length, cutAt=Math.round(n*0.78), body=pts.slice(0,cutAt+1), end=pts.slice(cutAt);
      mesh(g,sweep(body,0.028,0.02,6,t=>R(t*0.78)/0.05),k%3===1?M.plumeHi:M.plume,'hair'); mesh(g,sweep(end,0.028,0.02,6,t=>R(0.78+t*0.22)/0.05*(1-t*0.8)),tip,'hair'); } });
  // keener spaulders: the dome, a lame, and three blades swept back over the shoulder, each sharper than the last
  reg('pauldrons','striker','Striker spaulders',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*1.04, rz=e.rz*1.04, top=e.top+0.012, ry=(top-e.bot)*0.6;
      const dome=(ph,th,o)=>V(e.cx+(rx+(o||0))*Math.sin(th)*Math.sin(ph), top-ry+(ry+(o||0)*0.8)*Math.cos(th), (rz+(o||0))*Math.sin(th)*Math.cos(ph));
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.55*(1-v)),10,4,{two:0.004}),M.paul,'paul');
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.55-0.08*(1-v),0.005),20,1,{two:0.002}),GD,'gold');
      lames(g,M,{n:1,y0:top-ry*1.05,h:0.06,r:Math.max(rx,rz)*0.85,dr:0,p0:(sd>0?Math.PI/2:-Math.PI/2)-1.6,p1:(sd>0?Math.PI/2:-Math.PI/2)+1.6,cx:e.cx,zk:0.95,mat:M.paul});
      [[0.42,0.11,0.0],[0.62,0.085,0.35],[0.82,0.065,-0.35]].forEach(([th,ln,dz])=>{ const bl=new THREE.Shape(); bl.moveTo(0,-0.016); bl.lineTo(ln,0); bl.lineTo(0,0.016); bl.quadraticCurveTo(-0.01,0,0,-0.016);
        const m=mesh(g,ext(bl,0.007),M.paul,'paul'); m.position.copy(dome(sd>0?Math.PI/2+dz:-Math.PI/2-dz,th,0.004)); m.rotation.set(0,sd>0?0:Math.PI,0); m.rotateZ(0.5+th*0.4); m.rotateY(sd*0.25);
        const ge=mesh(g,ext((()=>{ const e2=new THREE.Shape(); e2.moveTo(0,0.012); e2.lineTo(ln,0); e2.lineTo(0,0.018); e2.closePath(); return e2; })(),0.009),GD,'gold'); ge.position.copy(m.position); ge.rotation.copy(m.rotation); ge.translateZ(-0.001); }); }); });
  reg('gauntlets','striker','Striker gauntlets',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);   // close and light, the cuff drawn to a point up the forearm
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.hand), {gc,n,t,y1,rr,back,Eg}=handE(A,sd);
      mesh(g,band((ph,y)=>rr+0.006,-Math.PI,Math.PI,y1-0.035,y1,8,1,{two:0.003,cx:gc.x,cz:gc.z,yf:(ph,y)=>y+(y>y1-0.01?0.04*Math.pow(Math.max(0,Math.cos(Math.atan2(Math.sin(ph),Math.cos(ph))-Math.atan2(n.x,n.z))),6):0)}),M.steel,'steel');
      mesh(g,surf((u,v)=>{ const a=u*2-1, y=Eg.min.y+0.03+(y1-0.035-Eg.min.y-0.03)*v; return gc.clone().addScaledVector(t,a*0.036).addScaledVector(n,back-0.012*a*a).add(V(0,y-gc.y,0)); },6,2,{two:0.003}),M.steel,'steel');
      ribbon(g,u=>{ const a=u*2-1, p=gc.clone().addScaledVector(t,a*0.036).addScaledVector(n,back-0.012*a*a+0.002).add(V(0,y1-0.035-gc.y,0)); return [p,p.clone().add(V(0,0.008,0))]; },6,GD); }); });
  reg('skirt','striker','Striker split skirt',ctx=>{ const K=ctx.K, {LF,LB}=skirtE(K);   // short, split for the stride, cut into sharp points
    [-1,1].forEach(sd=>panel(ctx,K._skF,{p0:sd>0?0.06:-0.72,p1:sd>0?0.72:-0.06,r0:0.205,r1:0.25,len:LF*0.6,teeth:3,dep:0.09}));
    [-1,1].forEach(sd=>panel(ctx,K._skB,{p0:Math.PI+(sd>0?0.06:-1.0),p1:Math.PI+(sd>0?1.0:-0.06),r0:0.205,r1:0.252,len:LB*0.64,teeth:4,dep:0.085,zk:0.8})); });

  // GUARDIAN · the bear — a shaggy fur cowl over the gorget that runs on into a short fur cape down the back
  // the bearskin, cleaned: smooth pelts, their edges falling in soft locks (no spiky tufts), the bear's head on the left shoulder
  const lock=(g,mat,pos,dir,len,wid)=>{ let f=new THREE.SphereGeometry(1,8,5); f.scale(wid,len/2,wid*0.45); f.translate(0,-len/2,0); const m=mesh(g,f,mat,'fur'); m.position.copy(pos); m.quaternion.setFromUnitVectors(V(0,-1,0),dir.clone().normalize()); m.userData.soft=1; return m; };
  /* V246: PELTS — the bearskin's pattern for any beast: a collar of fur at the neck, a pelt over each shoulder (on the arm's own joint,
     riding whatever pauldrons are worn), the beast's head on the left shoulder, and a cloak of its hide down the back. o: {c:[main,light,dark],
     head:'bear'|'wolf'|'fox'|'lion'|'stag'|'ram'|'raven', cloak:length (0 for none), sh:shoulder size, mane, feathers, tail, spots} */
  function furCowl(ctx,o){ const K=ctx.K, to=K.rig.torso, g=piece(ctx,to), hp=(g.userData.hoodParts={up:[],down:[]}), _pl=(g.userData.pelt=o.head||'pelt'), F1=pelt(o.k+'1',o.c[0]), F2=pelt(o.k+'2',o.c[1]), F3=pelt(o.k+'3',o.c[2]), DK=pelt('_nose',0x161210), EY=pelt('_eye',0x0c0a08);
    const E=bounds(to,q=>q.userData.part==='scarf',[[-0.139,0.361,-0.14],[0.139,0.537,0.16]]), y0=E.min.y;
    const LK=(par,mat,pos,dir,len,wid)=>o.feathers?(()=>{ let f=new THREE.SphereGeometry(1,8,5); f.scale(wid*0.9,len/2,0.006); f.translate(0,-len/2,0); const m=mesh(par,f,mat,'fur'); m.position.copy(pos); m.quaternion.setFromUnitVectors(V(0,-1,0),dir.clone().normalize()); m.userData.soft=1; return m; })():lock(par,mat,pos,dir,len,wid);
    const mix=i=>i%3?F1:(i%2?F2:F3);
    // the collar
    const tz=0.88, YA=y0+0.05, YT=y0+0.19+(o.mane?0.05:0), R0=(K._furR||0.25)*(o.mane?1.22:1), col=(ph,y)=>{ const v=(y-YA)/(YT-YA); return R0*(1-0.4*Math.pow(v,1.2))*(1+0.035*Math.sin(ph*9)); };
    // V280: THE PELT AS ONE GARMENT ON THE BODY. Where the body is to hand, the collar and the shoulder pelts are a single skin of fur:
    //  the body's own shoulders, upper back, upper chest and neck, pushed out to a fur's thickness (more over the shoulders, to lie over
    //  the pauldrons; a roll at the neck), skinned to the same bones — so it bends with the shoulders and can't come apart.
    const F3B=K.userData.b3, SHL=ARMOR.H.bodyShell, SW=K.userData.armorS, pauldOn=!!(SW&&SW.worn.pauldrons&&SW.ids&&SW.ids.pauldrons&&SW.ids.pauldrons!=='base');
    let shellOk=false;
    if(F3B&&typeof F3B==='object'&&F3B.body&&F3B.D&&SHL&&typeof BODY3!=='undefined'&&K._furShell!==false){ const gs=piece(ctx,K); gs.userData.fitted=true; gs.userData.furShell=true;
      const bump=(v,c,w)=>Math.exp(-((v-c)/w)*((v-c)/w)), pad=pauldOn?0.052*(o.sh||1):0.012, ruff=o.mane?0.05:0.03;
      const sel=(y,x,z,nz,ny,rr)=>{ if(/forearm|hand|belly|pelvis/.test(rr)||x>0.34) return false; if(/head/.test(rr)) return y<1.585&&x<0.1;
        if(/upperarm/.test(rr)) return y>1.405; return y>(z>0.03?1.43:1.33); };
      const d=(y,x,z)=>0.02+pad*bump(x,0.24,0.085)+ruff*bump(y,1.53,0.04)*(x<0.13?1:0)-(z>0.05&&y<1.47?0.006:0);
      const c0=o.c[0], c1=o.c[1], c2=o.c[2];
      [ {sel,d,it:14,kind:'cloth',col:c0},
        {sel:(y,x,z,nz,ny,rr)=>sel(y,x,z,nz,ny,rr)&&(Math.floor(x*38+y*22+(z>0?0.5:0))%2===0),d:(y,x,z)=>d(y,x,z)+0.008,it:3,kind:'cloth',col:c2},   // the pelt's lie: tufts a shade darker
        {sel:(y,x,z,nz,ny,rr)=>sel(y,x,z,nz,ny,rr)&&y>1.47&&x<0.15,d:(y,x,z)=>d(y,x,z)+0.01,it:10,kind:'cloth',col:o.mane?c1:c0} ]   // the ruff at the neck
        .forEach(L=>{ try{ L.slot='cowl'; L.regs=['chest','head','upperarm']; if(SHL(F3B,gs,L)) shellOk=true; }catch(e){ if(window.DEBUG_ARMOR) console.error('furShell',e); } }); }
    if(!shellOk){
    mesh(g,band(col,-Math.PI,Math.PI,YA,YT,36,5,{zk:tz,smooth:true,two:0.006}),o.mane?F2:F1,'fur');
    const NL=o.mane?44:30; for(let i=0;i<NL;i++){ const ph=-Math.PI+i/NL*Math.PI*2+(i%2)*0.05, r=col(ph,YA)+0.002, ln=(o.mane?0.13:0.07)+(i%3)*0.015; LK(g,o.mane?(i%2?F2:F1):mix(i),V(r*Math.sin(ph),YA+0.02,tz*r*Math.cos(ph)),V(Math.sin(ph)*0.35,-1,tz*Math.cos(ph)*0.35),ln,o.mane?0.036:0.03); }
    if(o.mane) for(let i=0;i<28;i++){ const ph=-Math.PI+i/28*Math.PI*2, r=col(ph,YT-0.02); LK(g,i%2?F1:F2,V(r*Math.sin(ph),YT,tz*r*Math.cos(ph)),V(Math.sin(ph)*0.8,-0.6,tz*Math.cos(ph)*0.8),0.1,0.034); }   // the mane's crown, standing out
    // the shoulder pelts
    const S=o.sh||1;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const gp=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*(K._furS||1.5)*S, rz=e.rz*(K._furS||1.45)*S, top=e.top+0.07*S, ry=(top-e.bot)*0.95, cx=e.cx-sd*0.02;
      const dome=(ph,th,of)=>{ const ww=1+0.035*Math.sin(ph*5+th*3); return V(cx+(rx+(of||0))*ww*Math.sin(th)*Math.sin(ph), top-ry+(ry+(of||0)*0.8)*Math.cos(th), (rz+(of||0))*ww*Math.sin(th)*Math.cos(ph)); };
      const TH=Math.PI*0.5; mesh(gp,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,TH*(1-v)),28,6,{smooth:true,two:0.006}),F1,'fur').userData.softHead=1;
      if(o.spots) for(let i=0;i<7;i++){ const sp=mesh(gp,(()=>{ const s2=new THREE.SphereGeometry(1,8,5); s2.scale(0.018,0.004,0.014); return s2; })(),F2,'fur'); const ph=-Math.PI+i*0.9, th=0.5+(i%3)*0.25, p=dome(ph,th,0.004); sp.position.copy(p); sp.lookAt(p.clone().multiplyScalar(2).sub(V(cx,top-ry,0))); sp.rotateX(Math.PI/2); }
      const NS=o.feathers?24:18; for(let i=0;i<NS;i++){ const ph=-Math.PI+i/NS*Math.PI*2+(i%2)*0.08, p=dome(ph,TH-0.02,0.002), d=V(Math.sin(ph)*0.45,-1,Math.cos(ph)*0.45); LK(gp,mix(i),p,d,(o.feathers?0.12:0.085)+(i%3)*0.02,o.feathers?0.03:0.036).userData.softHead=1; }
      if(o.feathers) for(let row=0;row<2;row++) for(let i=0;i<14;i++){ const ph=-Math.PI+i/14*Math.PI*2+row*0.2, th=0.55+row*0.35, p=dome(ph,th,0.006+row*0.003); LK(gp,mix(i+row),p,p.clone().sub(V(cx,top-ry,0)).add(V(0,-0.12,0)),0.09,0.026).userData.softHead=1; }
      });
    }
    // V280: with the hood down the beast's head hangs behind his neck, as a hood falls back — on the upper back, snout down
    if(o.head){ head(g,V(0,YA+0.07,-col(Math.PI,YA)-0.02),o.head,F1,F2,F3,DK,EY); const hb=g.children[g.children.length-1]; hb.rotation.set(-1.25,Math.PI,0); hb.scale.setScalar(0.85); hp.down.push(hb); }
    // V256/257: the hood — the beast's own head worn over his (after Zak's references: Hunt's wolf, the grizzly): its skull is the hood's
    //  crown, its brow and snout jut out over his forehead like a visor with its teeth showing, his face open below; the pelt falls down
    //  both sides of his face to the shoulders and the mantle. Over a helm it is cut larger.
    if(o.head&&typeof ARMOR!=='undefined'&&ARMOR.regY){ const hd=K.rig.head, HY=ARMOR.regY(K,hd,['head'],0.2), S0=K.userData.armorS, helmed=!!(S0&&S0.worn.helm&&S0.ids&&S0.ids.helm&&S0.ids.helm!=='base');
      const H=HY?HY[1]-HY[0]:0, yb=HY?HY[0]+0.4*H:0, ybr=HY?HY[0]+0.76*H:0, yt=HY?HY[1]:0, HR=HY?ARMOR.bodyRings(K,hd,['head'],yb,yt,6,16,0.2):null;
      if(HR){ const gh=piece(ctx,hd); gh.userData.fitted=true; hp.up.push(gh); const ex=helmed?0.045:0, top=yt+0.035+ex*1.2, gap=0.026+ex, yN=HY[0]-0.03;
        const ys=ph=>yb+(ybr-0.01-yb)*Math.pow(Math.max(0,Math.cos(ph)),1.2);   // the face left open below the brow
        const at=(ph,v,of)=>{ const y0=ys(ph), y=y0+(top-y0)*v, k=v<0.55?1:Math.pow(Math.max(0,Math.cos((v-0.55)/0.45*Math.PI/2)),0.7), yy=Math.min(y,yt), [cx,cz]=HR.c(yy), r=k*(HR.r(ph,yy)+gap+(of||0))*(1+0.035*Math.sin(ph*7+v*5)); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); };
        mesh(gh,surf((u,v)=>at(-Math.PI+u*Math.PI*2,v),28,8,{smooth:true,two:0.006}),F1,'fur');
        // the pelt falling from it, framing his face and down onto the shoulders, widening as it goes
        const PH0=0.62; mesh(gh,surf((u,v)=>{ const ph=PH0+(Math.PI*2-2*PH0)*u, p=at(ph,0), t=1-v, [cx,cz]=HR.c(yb), dx=p.x-cx, dz=p.z-cz, L=Math.hypot(dx,dz)||1, w=1+t*(0.55+0.25*Math.abs(Math.sin(ph)));
          return V(cx+dx*w, p.y-(p.y-yN)*t, cz+dz*w*(Math.cos(ph)<0?1.05:0.9)); },22,4,{smooth:true,two:0.006}),F1,'fur');
        for(let i=0;i<30;i++){ const u=i/29, ph=PH0+(Math.PI*2-2*PH0)*u, p=at(ph,0), [cx,cz]=HR.c(yb), dx=p.x-cx, dz=p.z-cz, w=1.55+0.25*Math.abs(Math.sin(ph)), q=V(cx+dx*w,yN+0.01,cz+dz*w);
          LK(gh,mix(i),q,V(dx*0.6,-1,dz*0.6),0.06+(i%3)*0.02,0.032); }   // its ragged foot
        // the beast's head: its skull the crown, brow and snout out over his forehead
        const [hx,hz]=HR.c(Math.min(yt,ybr+0.04)), fr=HR.r(0,ybr)+gap, W=(HR.r(Math.PI/2,ybr)+gap)/0.075;
        head(gh,V(hx,ybr+0.035+ex*0.5,hz+fr*0.32),o.head,F1,F2,F3,DK,EY); const hh=gh.children[gh.children.length-1]; hh.scale.set(W*1.02,W*0.82,W*1.05); hh.rotation.x=-0.06;
        if(/bear|wolf|lion|fox/.test(o.head)){ const TT=pelt('_tooth',0xeee6cf), sz=o.head==='bear'||o.head==='lion'?1:0.8;   // the teeth of the upper jaw, over his brow
          [[-0.022,0.026],[0.022,0.026],[-0.011,0.012],[0,0.011],[0.011,0.012]].forEach(([x,l])=>{ const c=new THREE.ConeGeometry(0.0055*sz,l*sz,5).toNonIndexed(); c.rotateX(Math.PI); const m=mesh(hh,c,TT,'fur'); m.position.set(x*sz,-0.04*sz-l*sz/2+0.004,0.1*sz+(o.head==='bear'?0:0.02)); }); } } }
    // the cloak, and a tail
    // V280: no long cloak — a short cape of the pelt hung diagonally from the left shoulder (as in Assassin's Creed): from the left
    //  side round the back, its hem lowest at mid-back under that shoulder and rising across to the right shoulder blade. Cloth.
    if(o.cloak&&ARMOR.H.mantle){ const cp=ARMOR.H.mantle(ctx,{kind:'side',side:1,top:0.6,hem:0.17,diag:0.2,over:0.12,stand:0.07,flare:0.03,rag:0.022,mat:F1});
      if(cp){ cp.userData.armor='cowl'; cp.traverse(m=>{ if(m.isMesh) m.userData.underShield=true; }); } }
    if(o.tail){ const pts=bez(V(0,YA-0.02,-0.3),V(0.02,YA-0.25,-0.38),V(0.05,YA-0.45,-0.34),V(0.07,YA-0.62,-0.26),12); const n=pts.length, cut=Math.round(n*0.78);
      const t1=mesh(g,sweep(pts.slice(0,cut+1),0.05,0.04,7,t=>0.55+0.45*Math.sin(Math.min(1,t*1.1)*Math.PI)),F1,'fur'); t1.userData.soft=1; t1.userData.underShield=true;
      const t2=mesh(g,sweep(pts.slice(cut),0.05,0.04,7,t=>0.9*(1-t*0.85)),F3,'fur'); t2.userData.soft=1; t2.userData.underShield=true; } }
  // the beast's head, worn on the shoulder, its snout to the fore
  function head(par,at,kind,F1,F2,F3,DK,EY){ const hg=new THREE.Group(); hg.position.copy(at); par.add(hg); hg.userData.armor=par.userData.armor;
    const sm=(a,b,c,mat,x,y,z,seg)=>{ const s2=new THREE.SphereGeometry(1,seg||12,8); s2.scale(a,b,c); const m=mesh(hg,s2,mat,'fur'); m.position.set(x||0,y||0,z||0); return m; };
    const horn=(pts,r,mat)=>mesh(hg,sweep(pts,r,r,6,t=>1-0.8*t),mat,'fur');
    if(kind==='bear'){ sm(0.075,0.06,0.08,F1); sm(0.04,0.034,0.06,F2,0,-0.01,0.075); sm(0.015,0.011,0.01,DK,0,0.003,0.132); [-1,1].forEach(q=>{ sm(0.022,0.024,0.012,F3,q*0.05,0.055,-0.01); sm(0.007,0.005,0.004,EY,q*0.03,0.022,0.06); }); }
    if(kind==='wolf'){ sm(0.065,0.055,0.075,F1); sm(0.03,0.026,0.07,F2,0,-0.012,0.085); sm(0.012,0.009,0.009,DK,0,-0.004,0.152);
      [-1,1].forEach(q=>{ const c=new THREE.ConeGeometry(0.022,0.06,4); const m=mesh(hg,c,F3,'fur'); m.position.set(q*0.035,0.07,-0.01); m.rotation.z=-q*0.25; sm(0.008,0.005,0.004,pelt('_amber',0xd8a030),q*0.028,0.02,0.055); }); }
    if(kind==='fox'){ sm(0.055,0.046,0.06,F1); sm(0.024,0.02,0.06,F2,0,-0.012,0.07); sm(0.01,0.008,0.008,DK,0,-0.006,0.128);
      [-1,1].forEach(q=>{ const c=new THREE.ConeGeometry(0.022,0.06,4); const m=mesh(hg,c,F1,'fur'); m.position.set(q*0.032,0.062,-0.005); m.rotation.z=-q*0.2; sm(0.016,0.014,0.01,F2,q*0.04,0.0,0.03); sm(0.007,0.004,0.004,pelt('_amber',0xd8a030),q*0.024,0.016,0.048); }); }
    if(kind==='lion'){ sm(0.065,0.06,0.07,F1); sm(0.036,0.03,0.05,F1,0,-0.016,0.065); sm(0.014,0.01,0.01,DK,0,-0.004,0.112);
      for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; lock(hg,i%2?F2:F3,V(Math.cos(a)*0.06,Math.sin(a)*0.06,-0.02),V(Math.cos(a),Math.sin(a),-0.4),0.07,0.028); }
      [-1,1].forEach(q=>sm(0.007,0.005,0.004,pelt('_amber',0xd8a030),q*0.028,0.02,0.058)); }
    if(kind==='stag'){ sm(0.05,0.05,0.065,F1); sm(0.03,0.028,0.06,F1,0,-0.014,0.07); sm(0.012,0.009,0.009,DK,0,-0.005,0.125);
      [-1,1].forEach(q=>{ const b=V(q*0.03,0.045,-0.01); horn([b,b.clone().add(V(q*0.04,0.07,-0.01)),b.clone().add(V(q*0.08,0.15,-0.04)),b.clone().add(V(q*0.1,0.22,-0.03))],0.008,pelt('_antler',0xd8c8a8));
        horn([b.clone().add(V(q*0.045,0.08,-0.015)),b.clone().add(V(q*0.03,0.13,0.03))],0.006,pelt('_antler',0xd8c8a8)); horn([b.clone().add(V(q*0.08,0.15,-0.04)),b.clone().add(V(q*0.05,0.2,0.02))],0.005,pelt('_antler',0xd8c8a8));
        sm(0.014,0.02,0.008,F2,q*0.05,0.04,-0.02); sm(0.007,0.006,0.004,EY,q*0.028,0.018,0.05); }); }
    if(kind==='ram'){ sm(0.058,0.055,0.07,F1); sm(0.03,0.03,0.05,F2,0,-0.016,0.07); [-1,1].forEach(q=>{ const pts=[]; for(let k=0;k<=14;k++){ const a=k/14*Math.PI*1.6; pts.push(V(q*(0.05+0.035*Math.sin(a)),0.03+0.04*Math.cos(a)-0.01*k/14,-0.02-0.035*Math.sin(a*0.5))); } horn(pts,0.014,pelt('_horn',0x8a7a5e)); sm(0.006,0.005,0.004,EY,q*0.03,0.02,0.058); }); }
    if(kind==='raven'){ sm(0.05,0.05,0.055,F1); const bk=mesh(hg,new THREE.ConeGeometry(0.018,0.08,6),pelt('_beak',0x2a2a2e),'fur'); bk.rotation.x=Math.PI/2; bk.position.set(0,-0.005,0.08); [-1,1].forEach(q=>sm(0.007,0.007,0.004,pelt('_ravenEye',0x9a8a40),q*0.03,0.015,0.04)); }
    return hg; }
  reg('cowl','guardian','Guardian bearskin',ctx=>furCowl(ctx,{k:'bear',c:[0x5a4130,0x6e5139,0x46322a],head:'bear',cloak:0.34}));   // V263: a half-cape of fur, to the middle of the back
  // the pelts, sold in the towns' shops (V246)
  const PELTS=[
    {id:'pelt_wolf',name:'Wolf pelt',o:{k:'wolf',c:[0x8a8c90,0xd8d6d0,0x55575c],head:'wolf',cloak:0.6},price:90},
    {id:'pelt_snowbear',name:'Snow-bear pelt',o:{k:'sbear',c:[0xe6e2d6,0xf6f3ea,0xc6c0b0],head:'bear',cloak:0.72},price:140},
    {id:'pelt_fox',name:'Fox stole',o:{k:'fox',c:[0xc0602a,0xf2eee6,0x7a3a1e],head:'fox',cloak:0,sh:0.85,tail:true},price:80},
    {id:'pelt_lion',name:'Lion’s mane',o:{k:'lion',c:[0xc89a50,0x8a5a2a,0xa87838],head:'lion',cloak:0.6,mane:true},price:150},
    {id:'pelt_stag',name:'Stag hide',o:{k:'stag',c:[0x8a5c38,0xe0cfa8,0x5a3a22],head:'stag',cloak:0.6,spots:true},price:110},
    {id:'pelt_ram',name:'Ram fleece',o:{k:'ram',c:[0xd8ccb0,0xeee4cc,0xb8aa8a],head:'ram',cloak:0.5,sh:1.1},price:85},
    {id:'pelt_raven',name:'Raven mantle',o:{k:'raven',c:[0x1e1e26,0x34343e,0x14141a],head:'raven',cloak:0.66,feathers:true},price:120},
    {id:'pelt_bear',name:'Brown bearskin',o:{k:'bear',c:[0x5a4130,0x6e5139,0x46322a],head:'bear',cloak:0.72},price:120}];
  PELTS.forEach(p=>{ P.cowl[p.id]={name:p.name,set:'Pelt',pelt:true,price:p.price,build:ctx=>furCowl(ctx,p.o)}; });
  ARMOR.PELTS=PELTS.map(p=>({id:p.id,name:p.name,price:p.price}));
  ARMOR.buyPelt=id=>{ const S=GAME.S, pc=P.cowl[id]; if(!pc) return 'no'; S.armorOwned=S.armorOwned||{}; if(S.armorOwned[id+'.cowl']) return 'no'; if((S.gold|0)<pc.price) return 'poor';
    if(GAME.addGold) GAME.addGold(-pc.price); else S.gold-=pc.price; S.armorOwned[id+'.cowl']=1; S.armorPick=S.armorPick||{}; S.armorPick.cowl=id; if(S.armorOff) delete S.armorOff.cowl; ARMOR.tryOn('cowl',id); GAME.save&&GAME.save(); GAME.changed&&GAME.changed(); return 'ok'; };
  // bear's paws: heavy gauntlets with three curved claws over the knuckles and a spike on the back of the hand
  reg('gauntlets','guardian','Guardian claws',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M);
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.hand), {gc,n,t,y1,rr,back,Eg}=handE(A,sd);
      mesh(g,band((ph,y)=>rr+0.006+0.035*(y-(y1-0.06))/0.06,-Math.PI,Math.PI,y1-0.06,y1+0.01,8,2,{two:0.003,cx:gc.x,cz:gc.z}),M.steel,'steel');
      mesh(g,band(()=>rr+0.044,-Math.PI,Math.PI,y1+0.002,y1+0.012,16,1,{two:0.002,cx:gc.x,cz:gc.z}),GD,'gold');
      const pl=(ya,yb,w,o)=>mesh(g,surf((u,v)=>{ const a=u*2-1, y=ya+(yb-ya)*v; return gc.clone().addScaledVector(t,a*w/2).addScaledVector(n,o-0.014*a*a).add(V(0,y-gc.y,0)); },6,2,{two:0.003}),M.steel,'steel');
      pl(Eg.min.y+0.03,y1-0.055,0.09,back+0.006); pl(Eg.min.y+0.008,Eg.min.y+0.034,0.088,back+0.003);
      [-1,0,1].forEach(a=>{ const base=gc.clone().addScaledVector(t,a*0.028).addScaledVector(n,back+0.006).add(V(0,Eg.min.y+0.02-gc.y,0));   // the claws, curving down over the fingers
        const pts=bez(base,base.clone().addScaledVector(n,0.03),base.clone().addScaledVector(n,0.04).add(V(0,-0.03,0)),base.clone().addScaledVector(n,0.022).add(V(0,-0.06,0)),6); mesh(g,sweep(pts,0.009,0.006,5,u=>1-0.9*u),M.steel,'steel'); });
      const sp=mesh(g,cone(0.014,0.05,5),M.steel,'steel'); sp.position.copy(gc).addScaledVector(n,back+0.02).add(V(0,(Eg.min.y+y1)/2-gc.y,0)); sp.quaternion.setFromUnitVectors(V(0,1,0),n); }); });

  // PSALMIST · the dove — tail feathers down the back; wing-mantles of layered feathers; a feathered hem
  const feather=(g,mat,base,dir,len,wid,part)=>{ let f=new THREE.SphereGeometry(1,10,6); f.scale(wid,len/2,0.006); f.translate(0,-len/2,0); const m=mesh(g,f,mat,part||'scarf'); m.position.copy(base); m.quaternion.setFromUnitVectors(V(0,-1,0),dir.clone().normalize()); return m; };
  reg('plume','psalmist','Psalmist tail-feathers',ctx=>{ const K=ctx.K, M=K.M, g=piece(ctx,K.rig.plume), SC=M.scarf||M.tunic, GD=GDm(M);
    [-0.32,-0.16,0,0.16,0.32].forEach((a,i)=>{ const f=feather(g,i%2?SC:M.tunic,V(a*0.05,0.0,-0.08),V(Math.sin(a)*0.5,-1,-0.22),0.36-Math.abs(a)*0.25,0.035); f.rotateY(a*0.4); });
    feather(g,GD,V(0,0.004,-0.075),V(0,-1,-0.22),0.08,0.012,'gold'); });
  reg('pauldrons','psalmist','Psalmist wing-mantle',ctx=>{ const K=ctx.K, M=K.M, GD=GDm(M), SC=M.scarf||M.tunic;   // a smooth mantle, three rows of feathers laid over it like a folded wing
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*1.12, rz=e.rz*1.12, top=e.top+0.01, ry=(top-e.bot)*0.85;
      const dome=(ph,th,o)=>V(e.cx+(rx+(o||0))*Math.sin(th)*Math.sin(ph), top-ry+(ry+(o||0)*0.8)*Math.cos(th), (rz+(o||0))*Math.sin(th)*Math.cos(ph));
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.6*(1-v)),24,5,{smooth:true,two:0.004}),SC,'scarf');
      [[0.75,9,0.07,0.012],[1.0,11,0.08,0.008],[1.25,13,0.09,0.004]].forEach(([th,N,ln,o],row)=>{ for(let i=0;i<N;i++){ const ph=(sd>0?Math.PI/2:-Math.PI/2)+(i/(N-1)*2-1)*1.9, b=dome(ph,th,o+0.004), d=dome(ph,th+0.4,o+0.03).sub(b);
        feather(g,row===2?GD:(i%2?SC:M.tunic),b,d,ln,0.024); } }); }); });
  reg('skirt','psalmist','Psalmist long robe',ctx=>{ const K=ctx.K, M=K.M, {LF,LB}=skirtE(K);   // to the shins, parted before, its hem scalloped like a wing's edge
    [-1,1].forEach(sd=>panel(ctx,K._skF,{p0:sd>0?0.03:-1.62,p1:sd>0?1.62:-0.03,r0:0.205,r1:0.3,len:LF*1.32,teeth:5,dep:-0.025,nv:7,hem:0.026}));
    panel(ctx,K._skB,{p0:Math.PI-1.62,p1:Math.PI+1.62,r0:0.205,r1:0.3,len:LB*1.3,teeth:9,dep:-0.025,nv:7,hem:0.026,zk:0.8}); });

  // ═════════════ PLAIN · the clothes beneath (V242) ═════════════
  // What a slot wears with its armour off: a hooded traveller in plain cloth — the hood (his face in shadow), a tunic of the
  //  livery's colour, a plain belt, sleeves, breeches, boots. No old plate shows under anything.
  const CLOTH={};   // a few plain cloths, shared (toon twins are made of them like any other)
  const cl=(k,c)=>CLOTH[k]||(CLOTH[k]=new THREE.MeshPhongMaterial({color:c,shininess:4,specular:0x111111,side:THREE.DoubleSide}));
  const hoodC=()=>cl('hood',0x4b3d30), linen=()=>cl('linen',0x8f8068), breeches=()=>cl('breeches',0x3d352d);
  const reg0=(slot,name,build)=>{ P[slot].base={name,set:'Plain',build:ctx=>{   /* V252: where the artist's plain clothes can be had (OUTFIT3), they're worn instead */
    if(slot!=='plume'&&typeof OUTFIT3!=='undefined'&&OUTFIT3.baseReady&&OUTFIT3.baseReady(ctx.K)){ const g=piece(ctx,ctx.K.rig.torso); g.userData.garmentSlot=slot; if(slot==='cowl'&&ARMOR.H.shroud&&ctx.K._shroud!==false) ARMOR.H.shroud(ctx,'brown'); if(slot==='cowl'&&ARMOR.H.hoodCowl) ARMOR.H.hoodCowl(ctx); return; } build(ctx); }}; };   /* V263: the plain hood wears its shroud */
  reg0('helm','Bare head',ctx=>hood(ctx,{mat:ctx.K.M.hood||hoodC(),eyes:ctx.K.M.eyes||0x8a7a60}));   // a town's set may dye it
  reg0('plume','No crest',ctx=>{ piece(ctx,ctx.K.rig.plume); });
  reg0('cowl','Hood',ctx=>{ const K=ctx.K, to=K.rig.torso, g=piece(ctx,to);
    const E=bounds(to,o=>o.userData.part==='scarf',[[-0.139,0.361,-0.14],[0.139,0.537,0.16]]), y0=E.min.y-0.035, y1=E.max.y, w=Math.max(Math.abs(E.min.x),E.max.x);
    mesh(g,band((ph,y)=>{ const v=(y-y0)/(y1-y0); return w*(1.55-0.95*Math.pow(v,0.7))*(1+0.025*Math.sin(ph*8)); },-Math.PI,Math.PI,y0,y1,28,5,{zk:0.9,smooth:true,two:0.004}),hoodC(),'scarf'); });
  reg0('tabard','Shirt and belt',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), {y0,y1,ZK,CZ}=torsoE(K);
    const r=(ph,y)=>chestR(y,y0,y1)+0.008+0.004*Math.sin(ph*6+y*20), at=(ph,y,o)=>{ const rr=r(ph,y)+(o||0); return V(rr*Math.sin(ph),y,CZ+ZK*rr*Math.cos(ph)); };
    mesh(g,band(r,-Math.PI,Math.PI,y0-0.02,y1,30,9,{zk:ZK,cz:CZ,smooth:true}),M.tunic,'tunic');
    // a slit at the throat, laced with a leather cord
    mesh(g,surf((u,v)=>{ const y=y1-0.1+0.09*v; return at((u*2-1)*0.05,y,0.002); },2,2),cl('dark',0x1a1612),'slit');
    for(let k=0;k<3;k++){ const y=y1-0.085+k*0.028; [-1,1].forEach(sd=>ribbon(g,u=>{ const a=at(-sd*0.06,y,0.005), b=at(sd*0.06,y+0.022,0.005); const p=a.clone().lerp(b,u); return [p.clone().add(V(0,-0.004,0)),p.clone().add(V(0,0.004,0))]; },2,M.boot,'leather')); } });
  reg0('belt','The shirt’s own',ctx=>{ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), {ZK,CZ}=torsoE(K), RB=0.204;
    mesh(g,band(()=>RB,-Math.PI,Math.PI,0.03,0.068,28,1,{zk:ZK,cz:CZ,two:0.003}),M.boot,'leather');
    const bk=mesh(g,new THREE.BoxGeometry(0.04,0.04,0.008).toNonIndexed(),cl('iron',0x5a5650),'steel'); bk.position.set(0,0.049,CZ+ZK*RB+0.004);
    const pg=new THREE.Group(); pg.position.set(RB*Math.sin(0.95)+0.012,0.0,CZ+ZK*RB*Math.cos(0.95)+0.01); pg.rotation.y=0.95; g.add(pg); pg.userData.armor=g.userData.armor;
    mesh(pg,new THREE.BoxGeometry(0.065,0.075,0.04).toNonIndexed(),M.boot,'leather').position.y=-0.02; });
  reg0('skirt','None',ctx=>{ const K=ctx.K, M=K.M, {LF,LB}=skirtE(K);   // the tunic's skirt, to mid-thigh, split at the sides
    panel(ctx,K._skF,{p0:-1.45,p1:1.45,r0:0.2,r1:0.24,len:LF*0.62,teeth:1,dep:0,trim:false,mat:M.tunic});
    panel(ctx,K._skB,{p0:Math.PI-1.45,p1:Math.PI+1.45,r0:0.2,r1:0.24,len:LB*0.62,teeth:1,dep:0,trim:false,mat:M.tunic,zk:0.8}); });
  reg0('pauldrons','None',ctx=>{ const K=ctx.K, M=K.M;   // the tunic's shoulder, soft, over the top of the arm
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=paulE(A,sd), rx=e.rx*1.14, rz=e.rz*1.14, top=e.top+0.016, ry=(top-e.bot)*0.78;
      const dome=(ph,th)=>V(e.cx+rx*Math.sin(th)*Math.sin(ph), top-ry+ry*Math.cos(th), rz*Math.sin(th)*Math.cos(ph));
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,Math.PI*0.6*(1-v)),20,4,{smooth:true,two:0.004}),M.tunic,'tunic'); }); });
  reg0('arms','Sleeves and bracers',ctx=>{ const K=ctx.K, M=K.M;   // full sleeves, gathered and rolled at the wrist
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      mesh(g1,band((ph,y)=>0.062+0.004*Math.sin(ph*5+y*30),-Math.PI,Math.PI,-0.25,-0.04,12,3,{smooth:true,two:0.003}),linen(),'tunic');
      mesh(g2,band((ph,y)=>0.058+0.004*Math.sin(ph*5+y*30),-Math.PI,Math.PI,-0.17,0.03,12,3,{smooth:true,two:0.003}),linen(),'tunic');
      mesh(g2,band(()=>0.064,-Math.PI,Math.PI,-0.2,-0.165,12,1,{smooth:true,two:0.003}),linen(),'tunic'); }); });
  reg0('gauntlets','Bare hands',ctx=>{ const K=ctx.K, M=K.M;   // the wrist bound in leather; the glove is the hand
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.hand), {gc,y1,rr}=handE(A,sd);
      mesh(g,band(()=>rr+0.003,-Math.PI,Math.PI,y1-0.045,y1-0.005,8,1,{two:0.003,cx:gc.x,cz:gc.z}),M.boot,'leather'); }); });
  reg0('legs','Trousers',ctx=>{ const K=ctx.K;   // breeches to the knee, hose below
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const gh=piece(ctx,G.hip), gk=piece(ctx,G.knee);
      mesh(gh,band((ph,y)=>0.09+0.012*(y+0.34)/0.34+0.004*Math.sin(ph*4+y*25),-Math.PI,Math.PI,-0.34,0.0,12,3,{smooth:true,two:0.003}),breeches(),'tunic');
      mesh(gk,band((ph,y)=>0.06+0.012*Math.min(1,(y+0.34)/0.3),-Math.PI,Math.PI,-0.34,0.04,12,3,{smooth:true,two:0.003}),breeches(),'tunic'); }); });
  reg0('sabatons','Boots',ctx=>{ const K=ctx.K, M=K.M;   // soft leather, to the calf
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const g=piece(ctx,G.knee), e=footE(G), L=e.z1-e.z0;
      const foot=(u,v)=>{ const a=(u*2-1)*Math.PI/2, z=e.z0+L*v, nose=Math.pow(Math.max(0,(v-0.75)/0.25),1.5), w=e.x0*(1-0.35*nose), h=(e.yt-e.ys)*(1-0.6*v)*(1-0.3*nose)+0.012; return V(e.cx+w*Math.sin(a), e.ys+0.012+h*Math.cos(a), z); };
      mesh(g,surf(foot,10,6,{flip:true,smooth:true}),M.boot,'leather');
      mesh(g,band(()=>e.x0+0.003,-Math.PI,Math.PI,e.yt-0.02,e.yt+0.1,12,2,{smooth:true,two:0.003,cx:e.cx,cz:e.z0+0.05}),M.boot,'leather');
      const so=mesh(g,new THREE.BoxGeometry(e.x0*2,0.014,L).toNonIndexed(),cl('sole',0x2a2018),'leather'); so.position.set(e.cx,e.ys+0.007,e.z0+L/2); }); });
})();