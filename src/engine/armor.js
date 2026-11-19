// ── KLK ARMOUR (3D) — the hero's harness, piece by piece (V240) ──
// Zak's armour sheet, rebuilt as separate low-poly meshes on the knight's own joints:
//   helm · plume · cowl · tabard (the surcoat over the plate, with the Jerusalem cross) · belt (with its pouches) · skirt
//   (the dagged front and back panels) · pauldrons · arms (rerebraces, couters, vambraces) · gauntlets · legs (cuisses,
//   poleyns, greaves) · sabatons.
// Each piece is fitted to the part it covers: its size is taken, when it is built, from the bounds of the sculpted part
//  (or the body's plate shell) on the same joint, so it sits where his armour always sat and moves with every animation.
// Each slot is independent:
//   ARMOR.set(K,slot,on)   wear or take off one slot (taking it off shows what was beneath: the built-in piece)
//   ARMOR.wear(K,slot,id)  put a different piece in a slot (ARMOR.PIECES[slot][id] = {name, build(ctx)} adds one)
//   ARMOR.worn(K)          {slot: id|null}
// It is worn by default; the wardrobe (☰ System → Armour) takes pieces off and puts them back, saved in GAME.S.armorOff.
// The pieces use the knight's own materials (K.M), so a livery or a smith's colours recolour them as they do the rest.
const ARMOR=(function(){
  const V=(x,y,z)=>new THREE.Vector3(x||0,y||0,z||0);
  const SLOTS=['helm','plume','cowl','tabard','belt','skirt','pauldrons','arms','gauntlets','legs','sabatons'];
  const NAMES={helm:'Great helm',plume:'Plume',cowl:'Cowl',tabard:'Tabard & breastplate',belt:'Belt & pouches',skirt:'Skirt',pauldrons:'Pauldrons',arms:'Vambraces',gauntlets:'Gauntlets',legs:'Greaves & cuisses',sabatons:'Sabatons'};

  // ── geometry helpers ──
  // a surface from f(u,v)→Vector3, u around (left to right as seen from outside), v up; flat-shaded unless smooth
  function surf(f,nu,nv,o){ o=o||{}; const P=[], pu=(a)=>P.push(a.x,a.y,a.z);
    for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a=f(i/nu,j/nv), b=f((i+1)/nu,j/nv), c=f((i+1)/nu,(j+1)/nv), d=f(i/nu,(j+1)/nv);
      if(o.flip){ pu(a);pu(c);pu(b); pu(a);pu(d);pu(c); } else { pu(a);pu(b);pu(c); pu(a);pu(c);pu(d); } }
    let g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
    if(o.smooth) g=weld(g); g.computeVertexNormals(); if(g.index) g=g.toNonIndexed(); if(o.two) g=twoSide(g,o.two===true?0.0025:o.two); return g; }
  function weld(g){ const p=g.attributes.position, map=new Map(), pos=[], idx=[]; for(let i=0;i<p.count;i++){ const k=Math.round(p.getX(i)*2e4)+','+Math.round(p.getY(i)*2e4)+','+Math.round(p.getZ(i)*2e4); let n=map.get(k); if(n===undefined){ n=pos.length/3; map.set(k,n); pos.push(p.getX(i),p.getY(i),p.getZ(i)); } idx.push(n); }
    const h=new THREE.BufferGeometry(); h.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); h.setIndex(idx); return h; }
  // the back of a thin plate: the same faces turned round, a hair inside, so the plate reads from both sides
  function twoSide(g,th){ const p=g.attributes.position, n=g.attributes.normal, c=p.count, P=new Float32Array(c*6), N=new Float32Array(c*6);
    for(let i=0;i<c;i++){ for(let k=0;k<3;k++){ P[i*3+k]=p.array[i*3+k]; N[i*3+k]=n.array[i*3+k]; } }
    for(let t=0;t<c;t+=3) for(let q=0;q<3;q++){ const s=t+(q===0?0:q===1?2:1), d=c+t+q; for(let k=0;k<3;k++){ P[d*3+k]=p.array[s*3+k]-n.array[s*3+k]*th; N[d*3+k]=-n.array[s*3+k]; } }
    const h=new THREE.BufferGeometry(); h.setAttribute('position',new THREE.BufferAttribute(P,3)); h.setAttribute('normal',new THREE.BufferAttribute(N,3)); return h; }
  // a ring-section body: phi from p0 to p1 (0 = front, +z), y from y0 to y1; r(phi,y) its radius; zk squashes it front-to-back
  function band(r,p0,p1,y0,y1,nu,nv,o){ o=o||{}; const zk=o.zk||1, cx=o.cx||0, cz=o.cz||0;
    return surf((u,v)=>{ const ph=p0+(p1-p0)*u, y=y0+(y1-y0)*v, R=r(ph,y,u,v); return V(cx+R*Math.sin(ph),o.yf?o.yf(ph,y,u,v):y,cz+zk*R*Math.cos(ph)); },nu,nv,o); }
  // a tube swept along points, its section an ellipse (w across, t thick) that may taper
  function sweep(pts,w,t,n,taper){ const P=[], N=pts.length, up=V(0,1,0), fr=[];
    for(let i=0;i<N;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(N-1,i+1)], T=b.clone().sub(a).normalize(); let X=up.clone().cross(T); if(X.lengthSq()<1e-6) X=V(1,0,0).cross(T); X.normalize(); const Y=T.clone().cross(X).normalize(); fr.push([X,Y]); }
    const ring=(i)=>{ const k=taper?taper(i/(N-1)):1, [X,Y]=fr[i], out=[]; for(let s=0;s<n;s++){ const a=s/n*Math.PI*2; out.push(pts[i].clone().addScaledVector(X,Math.cos(a)*w*k).addScaledVector(Y,Math.sin(a)*t*k)); } return out; };
    const R=pts.map((_,i)=>ring(i)), pu=(a)=>P.push(a.x,a.y,a.z);
    for(let i=0;i<N-1;i++) for(let s=0;s<n;s++){ const a=R[i][s], b=R[i][(s+1)%n], c=R[i+1][(s+1)%n], d=R[i+1][s]; pu(a);pu(d);pu(c); pu(a);pu(c);pu(b); }
    let g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g=weld(g); g.computeVertexNormals(); return g.toNonIndexed(); }
  const bez=(a,b,c,d,n)=>{ const out=[]; for(let i=0;i<=n;i++){ const t=i/n, s=1-t; out.push(V(s*s*s*a.x+3*s*s*t*b.x+3*s*t*t*c.x+t*t*t*d.x, s*s*s*a.y+3*s*s*t*b.y+3*s*t*t*c.y+t*t*t*d.y, s*s*s*a.z+3*s*s*t*b.z+3*s*t*t*c.z+t*t*t*d.z)); } return out; };
  const facetSphere=(rx,ry,rz,w,h,th0,thL)=>{ let g=new THREE.SphereGeometry(1,w,h,0,Math.PI*2,th0||0,thL||Math.PI); g.scale(rx,ry,rz); g=g.toNonIndexed(); g.computeVertexNormals(); return g; };
  const tri=x=>{ const f=x-Math.floor(x); return 1-Math.abs(f*2-1); };   // 0 at the joins, 1 at each point

  // ── a piece is a Group of meshes on one joint ──
  function piece(ctx,par){ const g=new THREE.Group(); g.userData.armor=ctx.slot; par.add(g); ctx.groups.push(g); return g; }
  function mesh(g,geo,mat,part){ const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=false; m.userData.armor=g.userData.armor; m.userData.part=part||''; g.add(m); return m; }
  // the bounds (in the joint's frame) of the joint's own meshes that match
  function bounds(par,test,fb){ const b=new THREE.Box3(); par.children.forEach(o=>{ if(o.isMesh&&!o.userData.armor&&test(o)){ o.geometry.computeBoundingBox(); const bb=o.geometry.boundingBox.clone(); bb.applyMatrix4(o.matrix); b.union(bb); } });
    return b.isEmpty()?new THREE.Box3(V(...fb[0]),V(...fb[1])):b; }

  // ═══ the pieces (the sheet's "Templar" harness) ═══
  const T={};
  // ── HELM: a faceted great helm — crown, straight cheeks, a keel down the face; the T of the sight and breath dark; the visor
  //  edged in gold, a gold crest running from the crown down to an arrow-point over the brow, a gilt boss at each temple ──
  T.helm=function(ctx){ const K=ctx.K, M=K.M, head=K.rig.head, g=piece(ctx,head);
    const E=bounds(head,o=>/^(helm2|gold2|helm|visor|gold)$/.test(o.userData.part),[[-0.118,-0.136,-0.13],[0.118,0.19,0.144]]);
    const XR=Math.max(Math.abs(E.min.x),E.max.x)+0.004, ZR=(E.max.z-E.min.z)/2+0.002, CZ=(E.max.z+E.min.z)/2, YB=E.min.y-0.004, YT=E.max.y+0.002, H=YT-YB, YBR=YB+0.64*H, YEYE=YBR-0.04;
    const S=(ph,y,off)=>{ const v=(y-YB)/H, vb=(YBR-YB)/H; let k=v<vb?(v<0.12?1.04-0.04*v/0.12:1.0):Math.pow(Math.max(0,Math.cos((v-vb)/(1-vb)*Math.PI/2)),0.8);
      const fr=Math.max(0,Math.cos(ph)), flat=1-0.1*Math.pow(fr,3)*(v<vb+0.1?1:0), keel=0.02*Math.max(0,1-Math.abs(Math.sin(ph))/0.35)*fr*(v<0.93?1:0)*Math.min(1,k*1.2);
      const r=k*flat+(off||0)/ZR; return V(XR*r*Math.sin(ph)*(1+(off||0)*0), y, CZ+ZR*r*Math.cos(ph)+keel*(1+(off||0)*8)); };
    mesh(g,surf((u,v)=>S(-Math.PI+u*Math.PI*2,YB+H*v),16,9),M.helm,'helm');   // the shell: sixteen facets round, nine up
    const strip=(fn,n,w,off,mat,part)=>mesh(g,surf((u,v)=>{ const [a,b]=fn(u,off,w); return v<0.5?a:b; },n,1,{}),mat,part);
    const out=(p,ph,o)=>p.add(V(Math.sin(ph)*o,0,Math.cos(ph)*o));
    const DARK=new THREE.MeshBasicMaterial({color:0x07080c,side:THREE.DoubleSide});
    strip((u,o,w)=>{ const ph=-0.8+1.6*u; return [out(S(ph,YEYE-w/2),ph,o),out(S(ph,YEYE+w/2),ph,o)]; },16,0.026,0.002,DARK,'slit');   // the sight
    mesh(g,surf((u,v)=>{ const y=YEYE-0.005-(YEYE-YB-0.035)*(1-v), p=S(0,y); return V((u*2-1)*0.011,y,p.z+0.003); },1,4),DARK,'slit');   // the breath, down the keel
    const GD=M.goldD||M.gold;
    strip((u,o,w)=>{ const ph=-1.15+2.3*u, y=YBR+0.012*(1-Math.pow(ph/1.15,2)); return [out(S(ph,y-w/2),ph,o),out(S(ph,y+w/2),ph,o)]; },18,0.02,0.004,GD,'gold');   // the brow band
    [-1,1].forEach(sd=>strip((u,o,w)=>{ const ph=sd*1.15, y=YB+0.01+(YBR-YB-0.01)*u, d=w/XR; return [out(S(ph-d/2,y),ph,o),out(S(ph+d/2,y),ph,o)]; },6,0.016,0.004,GD,'gold'));   // the visor's edges
    strip((u,o,w)=>{ const ph=-Math.PI+u*Math.PI*2; return [out(S(ph,YB+0.002),ph,o),out(S(ph,YB+w),ph,o)]; },32,0.014,0.004,GD,'gold');   // the rim
    // the crest: up the middle from the brow over the crown and down the back, in two halves so it rides the keel; at the brow an arrow-point
    [-1,1].forEach(sd=>strip((u,o,w)=>{ const fr=u<0.55, y=fr?YBR+0.02+(YT-0.006-YBR-0.02)*(u/0.55):YT-0.006-(u-0.55)/0.45*(YT-YBR-0.03), base=fr?0:Math.PI, dw=w/XR;
      const A=S(base,y), B=S(base+sd*dw,y), lift=p=>{ p.y+=o*0.6; return out(p,base,o); }; return [lift(A),lift(B)]; },20,0.026,0.005,GD,'gold'));
    { const ap=S(0,YBR+0.02,0.006), sh=new THREE.Shape(); sh.moveTo(-0.026,0.012); sh.lineTo(0.026,0.012); sh.lineTo(0,-0.03); sh.closePath();   // the arrow-point over the sight
      const ag=new THREE.ExtrudeGeometry(sh,{depth:0.006,bevelEnabled:false}).toNonIndexed(); ag.computeVertexNormals(); const m=mesh(g,ag,GD,'gold'); m.position.copy(ap); m.position.z-=0.002; m.rotation.x=-0.12; }
    // the temple bosses, each on a gold hinge-strap running down the cheek
    [-1,1].forEach(sd=>{ const ph=sd*Math.PI/2, p=S(ph,YEYE+0.005,0.004), m=mesh(g,new THREE.CylinderGeometry(0.024,0.024,0.01,10).toNonIndexed(),GD,'gold'); m.position.copy(p); m.rotation.z=Math.PI/2;
      const r=mesh(g,facetSphere(0.009,0.009,0.009,8,5),M.helm,'helm'); r.position.copy(p).add(V(sd*0.007,0,0));
      strip((u,o,w)=>{ const y=YB+0.012+(YEYE-0.02-YB-0.012)*u, d=w/XR; return [out(S(ph-d/2,y),ph,o),out(S(ph+d/2,y),ph,o)]; },5,0.014,0.004,GD,'gold'); });
    // breaths: three short slots low on each cheek
    [-1,1].forEach(sd=>[0,1,2].forEach(k=>{ const ph=sd*(0.5+k*0.12); strip((u,o,w)=>{ const y=YB+0.03+0.045*u; return [out(S(ph-0.018,y),ph,o),out(S(ph+0.018,y),ph,o)]; },2,0,0.002,DARK,'slit'); }));
    ctx.top=V(0,YT,CZ-0.02); };

  // ── PLUME: red horsehair from a gilt hook-socket, rising and falling back over the helm ──
  T.plume=function(ctx){ const K=ctx.K, M=K.M, pl=K.rig.plume, g=piece(ctx,pl), GD=M.goldD||M.gold;
    const hook=sweep(bez(V(0,-0.03,0.01),V(0,0.03,0.02),V(0,0.07,-0.01),V(0,0.075,-0.05),8),0.016,0.013,7,t=>1-0.45*t); mesh(g,hook,GD,'gold');   // the socket, curled like the sheet's
    mesh(g,new THREE.CylinderGeometry(0.022,0.026,0.02,8).toNonIndexed(),GD,'gold').position.set(0,-0.03,0.01);
    const N=12; for(let i=0;i<N;i++){ const s=(i/(N-1))*2-1, j=Math.sin(i*12.9898)*0.5+0.5, x0=s*0.02, ln=0.85+0.3*j;
      const pts=bez(V(x0,0.06,-0.03),V(x0*2.2,0.2+0.03*j,-0.1),V(x0*3.4,0.12*ln,-0.3*ln),V(x0*4.5+s*0.03,-0.34*ln,-0.36-0.06*j),12);
      mesh(g,sweep(pts,0.026-0.006*Math.abs(s),0.011,6,t=>Math.pow(1-t,0.6)*0.95+0.05),i%3===1?M.plumeHi:M.plume,'hair'); } };

  // ── COWL: the navy hood worn down — rolled folds round the throat, a point draped over the chest, the hood fallen at the back ──
  T.cowl=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), SC=M.scarf||M.tunic;
    const E=bounds(to,o=>o.userData.part==='scarf',[[-0.139,0.361,-0.14],[0.139,0.537,0.16]]); const y0=E.min.y-0.004, y1=E.max.y+0.006, w=Math.max(Math.abs(E.min.x),E.max.x);
    const r=(ph,y)=>{ const v=(y-y0)/(y1-y0); const base=w*(1.32-0.62*Math.pow(v,0.8)); return base*(1+0.035*Math.sin(ph*7+v*5)+0.05*Math.max(0,Math.sin(v*Math.PI*3))); };   // its folds and rolls
    mesh(g,band(r,-Math.PI,Math.PI,y0,y1,40,7,{zk:1.02,cz:0.005,smooth:true,two:0.004}),SC,'scarf');
    // the drape: a point of cloth hanging over the breast
    mesh(g,surf((u,v)=>{ const x=(u*2-1)*0.13*(0.35+0.65*v), y=y0-0.07+0.1*v-0.06*(1-Math.abs(u*2-1))*(1-v)*0, z=0.165+0.02*v+0.012*Math.cos((u*2-1)*Math.PI*1.5); return V(x,y-(1-v)*0.0,z); },8,3,{smooth:true,two:0.004,flip:false}),SC,'scarf');
    const hood=mesh(g,(()=>{ let h=new THREE.SphereGeometry(1,14,9); h.scale(0.13,0.075,0.07); return h; })(),SC,'scarf'); hood.position.set(0,y0+0.07,E.min.z-0.01); };

  // the Jerusalem cross (a cross potent and four crosslets), laid on a curved front: z(x,y) gives the surface
  function jerusalem(g,mat,cx,cy,s,zf){ const b=(w,h,x,y)=>{ const X=cx+x*s, Y=cy+y*s, m=mesh(g,new THREE.BoxGeometry(w*s,h*s,0.008).toNonIndexed(),mat,'cross'); m.position.set(X,Y,zf(X,Y)+0.003); m.rotation.y=Math.atan2(X,0.5)*0.35; };
    b(0.034,0.2,0,0); b(0.2,0.034,0,0); [[0,0.1,0.075,0.026],[0,-0.1,0.075,0.026],[0.1,0,0.026,0.075],[-0.1,0,0.026,0.075]].forEach(([x,y,w,h])=>b(w,h,x,y));
    [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sy])=>{ b(0.016,0.05,sx*0.062,sy*0.062); b(0.05,0.016,sx*0.062,sy*0.062); }); }

  // ── TABARD over the breastplate: navy, gold down the sides, a scalloped gold hem, the cross on the breast, gilt bosses where the
  //  pauldron straps fasten ──
  T.tabard=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=M.goldD||M.gold;
    const E=bounds(to,o=>/^(tunic|steel)$/.test(o.userData.part),[[-0.279,0.061,-0.168],[0.279,0.469,0.157]]);
    const y0=E.min.y-0.012, y1=E.max.y+0.004, W=0.25, ZK=(E.max.z-E.min.z)/2/0.232+0.03, CZ=(E.max.z+E.min.z)/2;
    const prof=[[0.0,0.182],[0.15,0.205],[0.4,0.232],[0.6,0.228],[0.8,0.2],[0.92,0.15],[1.0,0.12]], R=(y)=>{ const v=Math.max(0,Math.min(1,(y-y0)/(y1-y0))); for(let i=1;i<prof.length;i++) if(v<=prof[i][0]){ const [a,ra]=prof[i-1],[b,rb]=prof[i], t=(v-a)/(b-a); return ra+(rb-ra)*(t*t*(3-2*t)); } return 0.12; };
    const r=(ph,y)=>(R(y)+0.012)*(W/0.232)*0.93;
    mesh(g,band(r,-Math.PI,Math.PI,y0,y1,32,10,{zk:ZK,cz:CZ,smooth:true}),M.tunic,'tunic');
    const at=(ph,y,o)=>{ const rr=r(ph,y)+(o||0); return V(rr*Math.sin(ph),y,CZ+ZK*rr*Math.cos(ph)); };
    const rib=(fn,n,mat,part)=>mesh(g,surf((u,v)=>fn(u,v),n,1,{two:0.002}),mat,part);
    [-1,1].forEach(sd=>[sd*1.5,sd*(Math.PI-1.5)].forEach(ph=>rib((u,v)=>at(ph+(v-0.5)*0.12,y0+0.03+(y1-0.06-y0)*u,0.004),8,GD,'gold')));   // the side seams
    rib((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, sc=0.022*Math.abs(Math.cos(ph*3)); return at(ph,y0+v*(0.022+sc),0.005); },60,GD,'gold');   // the scalloped hem
    rib((u,v)=>{ const ph=-0.95+1.9*u; return at(ph,y1-0.05+v*0.018,0.004); },20,GD,'gold');   // the neck's edge, front
    rib((u,v)=>{ const ph=Math.PI-0.95+1.9*u; return at(ph,y1-0.05+v*0.018,0.004); },20,GD,'gold');   // and back
    // leather straps showing beneath the hem
    [-0.6,-0.2,0.2,0.6].forEach(ph=>{ const p=at(ph,y0-0.012,0.002), m=mesh(g,new THREE.BoxGeometry(0.03,0.04,0.008).toNonIndexed(),M.boot,'leather'); m.position.copy(p); m.rotation.y=ph; });
    // the bosses and their straps up over the shoulders
    [-1,1].forEach(sd=>{ const ph=sd*0.62, y=y1-0.085, p=at(ph,y,0.008), m=mesh(g,new THREE.CylinderGeometry(0.03,0.03,0.012,12).toNonIndexed(),GD,'gold'); m.position.copy(p); m.rotation.set(Math.PI/2,0,0); m.rotateOnWorldAxis(V(0,1,0),ph);
      const rv=mesh(g,facetSphere(0.011,0.011,0.011,8,5),M.steel,'steel'); rv.position.copy(at(ph,y,0.016));
      rib((u,v)=>{ const yy=y+0.02+u*(y1-y-0.02), ph2=ph+sd*0.12*u+(v-0.5)*0.11; return at(ph2,yy,0.006+0.01*u); },5,M.boot,'leather'); });
    jerusalem(g,M.cross||GD,0,y0+(y1-y0)*0.5,0.9,(x,y)=>{ const rr=r(0,y); return CZ+ZK*Math.sqrt(Math.max(0,rr*rr-x*x))+0.004; });
    ctx.R=r; ctx.ZK=ZK; ctx.CZ=CZ; };

  // ── BELT: a broad leather belt with a gilt buckle and its tongue hanging, a second slung lower, two pouches at the hips ──
  T.belt=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=M.goldD||M.gold;
    const Et=bounds(to,o=>/^(tunic)$/.test(o.userData.part),[[-0.242,0.061,-0.168],[0.242,0.464,0.157]]); const ZK=(Et.max.z-Et.min.z)/(Et.max.x-Et.min.x)+0.04, CZ=(Et.max.z+Et.min.z)/2, RB=0.206;
    const at=(ph,y,r)=>V(r*Math.sin(ph),y,CZ+ZK*r*Math.cos(ph));
    mesh(g,band(()=>RB,-Math.PI,Math.PI,0.022,0.078,32,1,{zk:ZK,cz:CZ,two:0.003}),M.boot,'leather');
    mesh(g,band(()=>RB+0.016,-Math.PI,Math.PI,0,0.026,32,1,{zk:ZK,cz:CZ,two:0.003,yf:(ph,y)=>y-0.028+0.022*Math.sin(ph+0.4)}),M.boot,'leather');   // the slung belt, lower on the left
    // the buckle: a gilt frame and its prong, the tongue through it and hanging
    const bz=CZ+ZK*RB+0.006, fr=(w,h,x,y)=>{ const m=mesh(g,new THREE.BoxGeometry(w,h,0.01).toNonIndexed(),GD,'gold'); m.position.set(x,y,bz); };
    fr(0.07,0.012,0,0.074); fr(0.07,0.012,0,0.026); fr(0.012,0.06,-0.03,0.05); fr(0.012,0.06,0.03,0.05); fr(0.006,0.05,0,0.05);
    { const m=mesh(g,new THREE.BoxGeometry(0.04,0.1,0.007).toNonIndexed(),M.boot,'leather'); m.position.set(0.05,0.0,bz-0.002); m.rotation.z=0.08; }
    // the pouches, hung from the belt at either hip: a body, a rounded flap, a gilt stud
    [-1,1].forEach(sd=>{ const ph=sd*0.95, p=at(ph,0.0,RB+0.03), pg=new THREE.Group(); pg.position.copy(p); pg.rotation.y=ph; g.add(pg); pg.userData.armor=g.userData.armor;
      const body=mesh(pg,new THREE.BoxGeometry(0.075,0.09,0.045).toNonIndexed(),M.boot,'leather'); body.position.set(0,-0.025,0);
      const flap=mesh(pg,surf((u,v)=>{ const x=(u*2-1)*0.04, a=v*Math.PI*0.6; return V(x,0.02-0.045*Math.sin(a)*0.9,0.024+0.012*Math.cos(a)); },4,4,{two:0.003}),M.boot,'leather');
      const st=mesh(pg,facetSphere(0.009,0.009,0.006,8,5),GD,'gold'); st.position.set(0,-0.022,0.036); }); };

  // ── SKIRT: the tabard's skirts — a long centre panel and two side panels before, one broad panel behind, each dagged into
  //  points along a gold-edged hem; a gilt point at the front's centre. They hang from the skirt hinges, so they swing with the legs ──
  T.skirt=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold, F=K._skF, B=K._skB; if(!F||!B) return;
    const EF=bounds(F,()=>true,[[-0.192,-0.453,0.133],[0.192,0.005,0.209]]), EB=bounds(B,()=>true,[[-0.214,-0.473,-0.235],[0.213,0.005,-0.124]]);
    const LF=-EF.min.y, LB=-EB.min.y;
    const panel=(par,p0,p1,r0,r1,len,teeth,dep,zk,mid)=>{ const g=piece(ctx,par), NU=teeth*2;
      const tooth=u=>dep*tri(u*teeth+0.5)+(mid&&Math.abs(u-0.5)<0.5/teeth?dep*0.5*(1-Math.abs(u-0.5)*teeth*2):0);
      const P=(u,v,o)=>{ const ph=p0+(p1-p0)*u, r=r0+(r1-r0)*v+(o||0), y=-len*v-(v>=0.999?tooth(u):0); return V(r*Math.sin(ph),0.004-y*0-(len*v+(v>=0.999?tooth(u):0)),zk*r*Math.cos(ph)); };
      mesh(g,surf((u,v)=>P(u,1-v),NU,5,{smooth:true,two:0.003}),M.tunic,'tunic');
      // the gold: down both edges and along the dagged hem
      [0,1].forEach(e=>mesh(g,surf((u,v)=>{ const uu=e+(e?-1:1)*v*0.03; return P(uu,1-u,0.003); },6,1,{two:0.002}),GD,'gold'));
      mesh(g,surf((u,v)=>{ const p=P(u,1,0.003); p.y+=v*0.022; return p; },NU*2,1,{two:0.002}),GD,'gold'); return g; };
    const zF=Math.max(0.7,(EF.max.z)/0.255);
    panel(F,-0.62,0.62,0.205,0.262,LF*0.9,3,0.06,zF,true);                     // the centre, longest, its middle point lowest
    [-1,1].forEach(sd=>panel(F,sd>0?0.5:-1.5,sd>0?1.5:-0.5,0.198,0.252,LF*0.78,3,0.05,zF*0.98));   // the sides, a little behind it
    panel(B,Math.PI-1.3,Math.PI+1.3,0.205,0.262,LB*0.9,5,0.055,Math.max(0.7,-EB.min.z/0.262));
    { const g=ctx.groups[0], s=new THREE.Shape(); s.moveTo(0,0.02); s.lineTo(0.016,0); s.lineTo(0,-0.03); s.lineTo(-0.016,0); s.closePath();   // the gilt point
      const m=mesh(g,new THREE.ExtrudeGeometry(s,{depth:0.005,bevelEnabled:false}).toNonIndexed(),GD,'gold'); m.geometry.computeVertexNormals(); m.position.set(0,-LF*0.9+0.03,zF*(0.205+(0.262-0.205)*0.9)*1+0.004); } };

  // ── PAULDRONS: a faceted dome over each shoulder, its rim and two lames below it edged in gold, a gilt boss on the outer face ──
  T.pauldrons=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const sh=A.sh, g=piece(ctx,sh);
      const E=bounds(sh,o=>/^(paul|gold)$/.test(o.userData.part),sd>0?[[-0.096,-0.126,-0.136],[0.156,0.102,0.136]]:[[-0.157,-0.126,-0.136],[0.097,0.102,0.136]]);
      const cx=(E.min.x+E.max.x)/2-sd*0.012, rx=((E.max.x-E.min.x)/2+0.006)*(K._pdS||1.16), rz=((E.max.z-E.min.z)/2+0.006)*(K._pdS||1.16), top=E.max.y+0.02, ry=(top-E.min.y)*0.66;   /* a little broader than the old dome: it must cover the shoulder beneath, all round */
      const dome=(ph,th,o)=>V(cx+(rx+(o||0))*Math.sin(th)*Math.sin(ph), top-ry+(ry+(o||0)*0.8)*Math.cos(th), (rz+(o||0))*Math.sin(th)*Math.cos(ph));
      const TH=Math.PI*0.56; mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,TH*(1-v)),14,5,{two:0.004}),M.paul,'paul');
      mesh(g,surf((u,v)=>dome(-Math.PI+u*Math.PI*2,TH*(1-v*0.0)-0.0+(v-1)*0.09,0.005),28,1,{two:0.002}),GD,'gold');   // its rim
      // two lames over the arm's outer side
      [0,1].forEach(k=>{ const yt=top-ry*(1.0+0.05)-k*0.06, h=0.065, r0=Math.max(rx,rz)*0.86-k*0.008;
        const L=(u,v,o)=>{ const ph=(sd>0?Math.PI/2:-Math.PI/2)+(u*2-1)*1.75, rr=r0+0.02*(1-v)+(o||0); return V(cx+rr*Math.sin(ph)*0.98, yt-h*(1-v), rr*Math.cos(ph)*0.95); };
        mesh(g,surf((u,v)=>L(u,v),12,2,{two:0.004}),M.paul,'paul'); mesh(g,surf((u,v)=>{ const p=L(u,0,0.004); p.y+=v*0.014; return p; },24,1,{two:0.002}),GD,'gold'); });
      // the boss on the outer face, and its rivet
      const bp=dome(sd>0?Math.PI/2:-Math.PI/2,TH*0.62,0.004), bm=mesh(g,new THREE.CylinderGeometry(0.03,0.032,0.012,12).toNonIndexed(),GD,'gold'); bm.position.copy(bp);
      const nrm=bp.clone().sub(V(cx,top-ry,0)).normalize(); bm.quaternion.setFromUnitVectors(V(0,1,0),nrm);
      const rv=mesh(g,facetSphere(0.012,0.012,0.012,8,5),M.paul,'paul'); rv.position.copy(bp).addScaledVector(nrm,0.008); }); };

  // ── ARMS: a rerebrace on the upper arm, a couter at the elbow, a vambrace on the forearm — faceted, gold-banded, a point at its top ──
  T.arms=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      const tube=(g,y0,y1,r0,r1,mat,o)=>mesh(g,band((ph,y)=>r0+(r1-r0)*(y-y0)/(y1-y0),-Math.PI,Math.PI,y0,y1,8,o&&o.nv||2,{two:0.003,cz:o&&o.cz||0}),mat,'steel');
      const ring=(g,y,r,w)=>mesh(g,band(()=>r,-Math.PI,Math.PI,y,y+w,16,1,{two:0.002}),GD,'gold');
      tube(g1,-0.235,-0.085,0.058,0.066,M.steel); ring(g1,-0.235,0.061,0.014);                       // the rerebrace
      tube(g2,-0.2,-0.03,0.056,0.066,M.steel,{nv:3}); ring(g2,-0.045,0.068,0.016); ring(g2,-0.12,0.064,0.01);   // the vambrace, banded
      mesh(g2,band(()=>0.06,-Math.PI,Math.PI,-0.205,-0.18,16,1,{two:0.002,yf:(ph,y)=>y}),GD,'gold');   // its cuff
      { const s=new THREE.Shape(); s.moveTo(-0.022,0); s.lineTo(0.022,0); s.lineTo(0,0.03); s.closePath(); const m=mesh(g2,new THREE.ExtrudeGeometry(s,{depth:0.006,bevelEnabled:false}).toNonIndexed(),GD,'gold'); m.geometry.computeVertexNormals(); m.position.set(sd*0.064,-0.03,0); m.rotation.y=sd*Math.PI/2; }   // the point on its top
      // the couter: a faceted cup on the elbow's point, a fan to its outer side, gold-rimmed
      const cp=mesh(g2,facetSphere(0.052,0.05,0.04,8,5,0,Math.PI*0.55),M.steel,'steel'); cp.position.set(0,0.0,-0.022); cp.rotation.x=-Math.PI/2;
      const rim=mesh(g2,new THREE.TorusGeometry(0.05,0.006,4,12).toNonIndexed(),GD,'gold'); rim.position.set(0,0,-0.024);
      const fan=mesh(g2,facetSphere(0.045,0.04,0.014,8,4),M.steel,'steel'); fan.position.set(sd*0.05,0.0,-0.005); fan.rotation.y=sd*0.4; }); };

  // ── GAUNTLETS: a flared cuff, a plate over the back of the hand, three finger lames — on the glove, which stays the hand ──
  T.gauntlets=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const hd=A.hand, g=piece(ctx,hd);
      const Eg=bounds(hd,o=>o.userData.part==='hand'||o===hd.box,[[-0.041,-0.035,-0.046],[0.04,0.071,0.05]]), Es=bounds(hd,o=>/^(steel|gold)$/.test(o.userData.part),[[sd>0?-0.07:-0.047,0,-0.079],[sd>0?0.048:0.07,0.085,0.039]]);
      const gc=Eg.getCenter(V()), sc=Es.getCenter(V()), n=V(sc.x-gc.x,0,sc.z-gc.z); if(n.lengthSq()<1e-6) n.set(0,0,-1); n.normalize();   // the back of the hand: the way the old plates lay
      const up=V(0,1,0), t=up.clone().cross(n).normalize(), y1=Es.max.y+0.012, rr=Math.max(Eg.max.x-Eg.min.x,Eg.max.z-Eg.min.z)/2;
      // the cuff, flaring toward the forearm
      mesh(g,band((ph,y)=>rr*0.98+0.02*(y-(y1-0.05))/0.05,-Math.PI,Math.PI,y1-0.05,y1,8,2,{two:0.003,cx:gc.x,cz:gc.z}),M.steel,'steel');
      mesh(g,band(()=>rr*0.98+0.022,-Math.PI,Math.PI,y1-0.006,y1+0.004,16,1,{two:0.002,cx:gc.x,cz:gc.z}),GD,'gold');
      // the back plate and the lames, each a curved plate laid on the back of the hand
      const plate=(ya,yb,w,o,mat,part)=>mesh(g,surf((u,v)=>{ const a=(u*2-1), y=ya+(yb-ya)*v; return gc.clone().addScaledVector(t,a*w/2).addScaledVector(n,o-0.012*a*a).add(V(0,y-gc.y,0)); },6,2,{two:0.003}),mat,part);
      const back=Math.max(0.03,Math.abs((Es.max.x-Es.min.x)*n.x)/2+Math.abs((Es.max.z-Es.min.z)*n.z)/2-0.002);
      plate(Eg.min.y+0.045,y1-0.045,0.075,back,M.steel,'steel'); plate(Eg.min.y+0.043,Eg.min.y+0.05,0.077,back+0.003,GD,'gold');
      [0,1,2].forEach(k=>{ const ya=Eg.min.y+0.035-k*0.02; plate(ya-0.018,ya,0.07-k*0.006,back-0.004-k*0.005,M.steel,'steel'); }); }); };

  // ── LEGS: a cuisse over the thigh, a pointed poleyn on the knee, a greave on the shin — steel before, leather behind, gold edged ──
  T.legs=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const gh=piece(ctx,G.hip), gk=piece(ctx,G.knee);
      const Eh=bounds(G.hip,o=>/^(steel|gold)$/.test(o.userData.part),[[-0.105,-0.348,0.009],[0.101,-0.025,0.114]]);
      const RH=(Eh.max.x-Eh.min.x)/2+0.008, yt=Eh.max.y+0.01, yb=Eh.min.y+0.03;
      mesh(gh,band((ph,y)=>RH*(0.92+0.08*(y-yb)/(yt-yb)),-1.55,1.55,yb,yt,8,3,{two:0.004,cz:0.0}),M.steel,'steel');                 // the cuisse
      [yb,yt-0.016].forEach(y=>mesh(gh,band(()=>RH*(y>yb?1:0.93)+0.004,-1.55,1.55,y,y+0.016,12,1,{two:0.002}),GD,'gold'));
      mesh(gh,band((ph,y)=>RH*0.9,Math.PI-1.6,Math.PI+1.6,yb,yt,6,2,{two:0.003}),M.boot,'leather');                                    // and its straps behind
      // the poleyn: a faceted point on the knee and a fan to the outside, gold-rimmed
      const pk=mesh(gk,facetSphere(0.06,0.062,0.052,6,4,0,Math.PI*0.6),M.steel,'steel'); pk.position.set(0,0.012,0.04); pk.rotation.x=Math.PI/2;
      const tip=mesh(gk,new THREE.ConeGeometry(0.03,0.04,6).toNonIndexed(),M.steel,'steel'); tip.position.set(0,0.012,0.1); tip.rotation.x=Math.PI/2; tip.geometry.computeVertexNormals();
      const rim=mesh(gk,new THREE.TorusGeometry(0.058,0.006,4,12).toNonIndexed(),GD,'gold'); rim.position.set(0,0.012,0.042);
      const fan=mesh(gk,facetSphere(0.04,0.05,0.014,6,4),M.steel,'steel'); fan.position.set(sd*0.055,0.01,0.01); fan.rotation.y=sd*0.5;
      // the greave: a keeled shell before, leather behind
      const Ek=bounds(G.knee,o=>!o.userData.sabaton&&/^(steel)$/.test(o.userData.part),[[-0.072,-0.36,-0.09],[0.084,0.075,0.12]]);
      const gy1=-0.04, gy0=-0.345, R0=0.07, R1=0.056, rG=(ph,y)=>{ const v=(y-gy0)/(gy1-gy0); return R1+(R0-R1)*Math.sin(Math.min(1,v*1.15)*Math.PI/2)+0.006*Math.max(0,1-Math.abs(ph)/0.25); };
      mesh(gk,band(rG,-1.75,1.75,gy0,gy1,10,4,{two:0.004}),M.steel,'steel');
      mesh(gk,band((ph,y)=>rG(ph,y)-0.004,Math.PI-1.45,Math.PI+1.45,gy0,gy1,6,3,{two:0.003}),M.boot,'leather');
      [-1.75,1.75].forEach(e=>mesh(gk,surf((u,v)=>{ const y=gy0+(gy1-gy0)*u, ph=e+(v-0.5)*0.16*(e>0?-1:1); const r=rG(ph,y)+0.004; return V(r*Math.sin(ph),y,r*Math.cos(ph)); },6,1,{two:0.002}),GD,'gold'));   // gold down its edges
      mesh(gk,surf((u,v)=>{ const y=gy0+(gy1-0.03-gy0)*u, ph=(v-0.5)*0.07; const r=rG(0,y)+0.005; return V(r*Math.sin(ph),y,r*Math.cos(ph)); },6,1,{two:0.002}),GD,'gold');   // and its keel
      mesh(gk,band((ph,y)=>rG(ph,gy1)+0.005,-1.75,1.75,gy1-0.016,gy1,12,1,{two:0.002}),GD,'gold'); }); };

  // ── SABATONS: lames over the foot to a blunt toe, a gold band at the ankle, a leather strap and sole ──
  T.sabatons=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([G,sd])=>{ const g=piece(ctx,G.knee);
      const E=bounds(G.knee,o=>o.userData.sabaton||o.userData.part==='leather',[[-0.072,-0.44,-0.06],[0.084,-0.34,0.213]]);
      const cx=(E.min.x+E.max.x)/2, x0=(E.max.x-E.min.x)/2+0.006, ys=E.min.y, yt=Math.min(E.max.y,-0.33), z0=E.min.z-0.004, z1=E.max.z+0.006, L=z1-z0;
      const foot=(u,v,o)=>{ const a=(u*2-1)*Math.PI/2, z=z0+L*v, nose=Math.pow(Math.max(0,(v-0.72)/0.28),1.6), w=x0*(1-0.45*nose), h=(yt-ys)*(1-0.62*v)*(1-0.3*nose)+0.012;
        return V(cx+(w+(o||0))*Math.sin(a), ys+0.012+(h+(o||0))*Math.cos(a)*(Math.cos(a)>0?1:0), z); };
      mesh(g,surf((u,v)=>foot(u,v),8,6,{flip:true}),M.steel,'steel');
      [0.28,0.46,0.64].forEach(v=>mesh(g,surf((u,w)=>foot(u,v+w*0.025,0.003),12,1,{two:0.002}),GD,'gold'));   // the lames' edges
      mesh(g,band(()=>x0+0.008,-Math.PI,Math.PI,yt-0.02,yt,12,1,{two:0.002,cx,cz:z0+0.05}),GD,'gold');                   // the ankle band
      mesh(g,band(()=>x0+0.002,-Math.PI,Math.PI,yt-0.06,yt-0.02,10,1,{two:0.003,cx,cz:z0+0.05}),M.boot,'leather');      // the strap
      const so=mesh(g,new THREE.BoxGeometry(x0*2+0.006,0.016,L).toNonIndexed(),M.boot,'leather'); so.position.set(cx,ys+0.008,z0+L/2); }); };

  const PIECES={}; SLOTS.forEach(s=>PIECES[s]={templar:{name:'Templar '+NAMES[s].toLowerCase(),set:'Templar',build:T[s]}});

  // ── what each slot covers of the built-in harness (hidden while the piece is worn, shown again when it comes off) ──
  function covered(K,slot){ const r=K.rig, out=[], F=K.userData.b3&&typeof K.userData.b3==='object'?K.userData.b3:null, kids=(p,t)=>p&&p.children.forEach(o=>{ if(o.isMesh&&!o.userData.armor&&t(o)) out.push(o); });
    const regs=(names,trimOnly)=>{ if(!F) return; (F.parts||[]).forEach(o=>{ const rg=o.userData&&o.userData.b3reg; if(rg&&names.some(n=>rg.split(',').includes(n))&&(!trimOnly||o.userData.b3trim)) out.push(o); }); };
    if(slot==='helm') kids(r.head,o=>/^(helm2|gold2|slit|helm|visor|gold)$/.test(o.userData.part));
    if(slot==='plume') kids(r.plume,()=>true);
    if(slot==='cowl') kids(r.torso,o=>o.userData.part==='scarf');
    if(slot==='tabard') kids(r.torso,o=>/^(tunic|steel|gold|cross|field)$/.test(o.userData.part));
    if(slot==='belt') kids(r.torso,o=>o.userData.part==='leather');
    if(slot==='skirt'){ kids(K._skF,()=>true); kids(K._skB,()=>true); }
    if(slot==='pauldrons') [r.AL,r.AR].forEach(A=>kids(A.sh,o=>/^(paul|gold)$/.test(o.userData.part)));
    if(slot==='arms'){ [r.AL,r.AR].forEach(A=>{ kids(A.sh,o=>o.userData.part==='steel'); kids(A.el,()=>true); }); regs(['forearm','lowerarm_l','lowerarm_r']); regs(['upperarm'],true);   /* the old rerebrace's steel stays beneath, filling the shoulder under the pauldron; only its gold edge goes */ }
    if(slot==='gauntlets') [r.AL,r.AR].forEach(A=>kids(A.hand,o=>/^(steel|gold)$/.test(o.userData.part)));
    if(slot==='legs'){ [r.L,r.R].forEach(G=>{ kids(G.hip,()=>true); kids(G.knee,o=>!o.userData.sabaton&&o.userData.part!=='leather'); }); regs(['thigh','calf','boot','calf_l','calf_r']); }
    if(slot==='sabatons'){ [r.L,r.R].forEach(G=>kids(G.knee,o=>o.userData.sabaton||o.userData.part==='leather')); regs(['foot']); }
    return out; }

  // ── wearing ──
  function state(K){ return K.userData.armorS||(K.userData.armorS={worn:{},groups:{},hid:{}}); }
  function build(K,slot,id){ const S=state(K), P=PIECES[slot]&&PIECES[slot][id]; if(!P) return null; const ctx={K,slot,groups:[]}; try{ P.build(ctx); }catch(e){ ctx.groups.forEach(g=>g.parent&&g.parent.remove(g)); if(window.DEBUG_ARMOR) console.error('ARMOR',slot,e); return null; } return ctx.groups; }
  function show(K,slot,on){ const S=state(K); (S.groups[slot]||[]).forEach(g=>{ g.visible=on; });
    const cov=on?covered(K,slot):(S.hid[slot]||[]); if(on){ S.hid[slot]=cov; cov.forEach(o=>{ if(!o.userData.armorHid){ o.userData.armorHid=1; o.userData.armorWas=o.visible; } o.visible=false; }); }
    else { cov.forEach(o=>{ if(o.userData.armorHid){ o.visible=o.userData.armorWas!==false; delete o.userData.armorHid; } }); S.hid[slot]=[]; } }
  function toon(K){ const F=K.userData.b3; if(!F||typeof F!=='object'||typeof BODY3==='undefined'||!BODY3.toonify) return; const tw=BODY3.toonify(K,F); if(!tw||!tw.length) return;
    const have=F._armTw||(F._armTw=new Set()), add=tw.filter(t=>!have.has(t)); if(!add.length) return; add.forEach(t=>have.add(t));
    const s0=F.sync; F.sync=()=>{ s0(); for(const t of add) if(!t.userData.fixed&&t.userData.src) t.color.copy(t.userData.src.color).multiplyScalar(t.userData.k||1); }; }
  function wear(K,slot,id){ const S=state(K); if(S.worn[slot]) set(K,slot,false); if(S.groups[slot]){ S.groups[slot].forEach(g=>g.parent&&g.parent.remove(g)); S.groups[slot]=null; }
    if(!id) return; const gs=build(K,slot,id); if(!gs) return; S.groups[slot]=gs; S.ids=S.ids||{}; S.ids[slot]=id; set(K,slot,true); }
  function set(K,slot,on){ const S=state(K); if(on&&!S.groups[slot]){ wear(K,slot,(S.ids&&S.ids[slot])||'templar'); return; } if(!S.groups[slot]) return; S.worn[slot]=!!on; show(K,slot,!!on); if(on) toon(K); }
  function worn(K){ const S=state(K), o={}; SLOTS.forEach(s=>o[s]=S.worn[s]?(S.ids&&S.ids[s])||'templar':null); return o; }
  // put the hero in his harness: every slot, save those the wardrobe has taken off
  // ── the skill trees' harnesses (armor_sets.js): each tier of a tree earns one of its pieces, the ultimate the helm and its crest.
  //  Once earned a piece is kept (a respec doesn't take it back), and the wardrobe picks, slot by slot, from all that are earned ──
  const TREES={striker:'st',guardian:'gd',psalmist:'ps'}, TIER={gauntlets:0,sabatons:1,belt:2,arms:3,legs:4,skirt:5,pauldrons:6,cowl:7,tabard:8,helm:9,plume:9};
  const SG=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  function earned(id,slot){ if(id==='templar') return true; const S=SG(), pre=TREES[id]; if(!pre||!PIECES[slot]||!PIECES[slot][id]) return false; return !!((S.armorEarned&&S.armorEarned[id+'.'+slot])||(S.skills&&S.skills[pre+TIER[slot]])); }
  function options(slot){ return Object.keys(PIECES[slot]||{}).filter(id=>earned(id,slot)); }
  function pick(slot){ const S=SG(), id=(S.armorPick&&S.armorPick[slot])||'templar'; return earned(id,slot)?id:'templar'; }
  function noteEarned(){ const S=SG(); if(!S.skills) return; S.armorEarned=S.armorEarned||{}; const fresh=[];
    for(const id in TREES) for(const slot in TIER){ const k=id+'.'+slot; if(!S.armorEarned[k]&&S.skills[TREES[id]+TIER[slot]]&&PIECES[slot]&&PIECES[slot][id]){ S.armorEarned[k]=1; fresh.push(PIECES[slot][id].name); } }
    if(fresh.length&&typeof UI!=='undefined'&&UI.toast&&!noteEarned.quiet) UI.toast('🛡 Armour earned: '+fresh.join(', ')+' — try it on in ☰ System → Armour',3200); noteEarned.quiet=false; }
  noteEarned.quiet=true;
  function dress(K){ const off=SG().armorOff||{}; SLOTS.forEach(s=>{ if(!off[s]) wear(K,s,pick(s)); }); K.userData.armor=true; }
  function apply(){ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K, off=SG().armorOff||{}, S=state(K); SLOTS.forEach(s=>{ if(off[s]){ set(K,s,false); return; } const id=pick(s); if((S.ids&&S.ids[s])!==id||!S.groups[s]) wear(K,s,id); else set(K,s,true); }); }
  // the hero, once his body has come (the plate shells it makes are among what the harness covers)
  let lastOff='';
  setInterval(()=>{ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K;
    try{ noteEarned(); }catch(e){}
    if(K.userData.armor){ const S=SG(), off=JSON.stringify([S.armorOff||{},S.armorPick||{},S.armorEarned||{},S.skills||{}]); if(off!==lastOff){ lastOff=off; try{ apply(); }catch(e){} } return; }   // a loaded save, or the wardrobe
    if(K.bare||!K.rig||!K.M) return;
    const b=K.userData.b3, waiting=b==='loading'||(K.sculpted&&b===undefined&&typeof BODY3!=='undefined'&&BODY3.on&&!K._armWait); if(waiting){ K._armT=(K._armT||0)+1; if(K._armT<40) return; }
    try{ dress(K); }catch(e){ K.userData.armor=true; if(window.DEBUG_ARMOR) console.error('ARMOR',e); } },400);
  const H={V,surf,weld,twoSide,band,sweep,bez,facetSphere,tri,piece,mesh,bounds};
  return { SLOTS, NAMES, PIECES, TREES, TIER, H, set, wear, worn, dress, apply, covered, earned, options, pick };
})();
