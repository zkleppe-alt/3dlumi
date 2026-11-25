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

  // ── V250: the body's own shape round a limb, sampled from the skinned hero as he stands — so plate can be made to fit his build:
  //  rings of his skin round the limb's axis (in the joint's frame), each ring's centre and its radius at every angle ──
  const _bv=new THREE.Vector3();
  function bodyRings(K,pivot,regs,y0,y1,NY,NA,box){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||!F.body.boneTransform) return null;
    const body=F.body, R=F.D.reg, P=body.geometry.attributes.position, ok=new Set(regs), pts=[]; K.updateMatrixWorld(true); body.skeleton.update();
    for(let q=0;q<P.count;q++){ if(!ok.has(R[q])) continue; body.boneTransform(q,_bv); _bv.applyMatrix4(body.matrixWorld); pivot.worldToLocal(_bv);
      if(_bv.y<y0-0.02||_bv.y>y1+0.02||Math.abs(_bv.x)>(box||0.16)||Math.abs(_bv.z)>(box||0.16)+0.03) continue; pts.push(_bv.x,_bv.y,_bv.z); }
    if(pts.length<60) return null;
    const cx=new Float32Array(NY), cz=new Float32Array(NY), cn=new Float32Array(NY), r=new Float32Array(NY*NA), bin=y=>Math.max(0,Math.min(NY-1,Math.floor((y-y0)/(y1-y0)*NY)));
    for(let i=0;i<pts.length;i+=3){ const b=bin(pts[i+1]); cx[b]+=pts[i]; cz[b]+=pts[i+2]; cn[b]++; }
    for(let b=0;b<NY;b++) if(cn[b]){ cx[b]/=cn[b]; cz[b]/=cn[b]; }
    for(let b=0;b<NY;b++) if(!cn[b]){ let lo=b,hi=b; while(lo>0&&!cn[lo]) lo--; while(hi<NY-1&&!cn[hi]) hi++; const s2=cn[lo]?lo:hi, s3=cn[hi]?hi:lo; cx[b]=(cx[s2]+cx[s3])/2; cz[b]=(cz[s2]+cz[s3])/2; }
    for(let i=0;i<pts.length;i+=3){ const b=bin(pts[i+1]), dx=pts[i]-cx[b], dz=pts[i+2]-cz[b], a=Math.floor(((Math.atan2(dx,dz)+Math.PI)/(Math.PI*2))*NA)%NA, rr=Math.hypot(dx,dz); if(rr>r[b*NA+a]) r[b*NA+a]=rr; }
    // fill the bins the skin left empty, then smooth round and along
    for(let pass=0;pass<NA;pass++){ let left=0; for(let b=0;b<NY;b++) for(let a=0;a<NA;a++){ if(r[b*NA+a]) continue; const n=[r[b*NA+(a+1)%NA],r[b*NA+(a+NA-1)%NA],b>0?r[(b-1)*NA+a]:0,b<NY-1?r[(b+1)*NA+a]:0].filter(x=>x>0); if(n.length) r[b*NA+a]=n.reduce((s,x)=>s+x,0)/n.length; else left++; } if(!left) break; }
    for(let it=0;it<2;it++){ const r2=r.slice(); for(let b=0;b<NY;b++) for(let a=0;a<NA;a++){ const v=[r[b*NA+a]*2,r[b*NA+(a+1)%NA],r[b*NA+(a+NA-1)%NA]]; if(b>0) v.push(r[(b-1)*NA+a]); if(b<NY-1) v.push(r[(b+1)*NA+a]); r2[b*NA+a]=Math.max(r[b*NA+a]*0.92,v.reduce((s,x)=>s+x,0)/(v.length+1)); } r.set(r2); }
    const lerp=(A,y)=>{ const f=Math.max(0,Math.min(NY-1,(y-y0)/(y1-y0)*NY-0.5)), i=Math.floor(f), t=f-i, j=Math.min(NY-1,i+1); return A[i]+(A[j]-A[i])*t; };
    return { c:y=>[lerp(cx,y),lerp(cz,y)], r:(ph,y)=>{ const f=Math.max(0,Math.min(NY-1,(y-y0)/(y1-y0)*NY-0.5)), i=Math.floor(f), t=f-i, j=Math.min(NY-1,i+1), g=((ph+Math.PI)/(Math.PI*2))*NA-0.5, a0=((Math.floor(g)%NA)+NA)%NA, a1=(a0+1)%NA, u=g-Math.floor(g);
      const ri=r[i*NA+a0]+(r[i*NA+a1]-r[i*NA+a0])*u, rj=r[j*NA+a0]+(r[j*NA+a1]-r[j*NA+a0])*u; return ri+(rj-ri)*t; } }; }

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
      const TR=K._legFit===false?null:bodyRings(K,G.hip,['thigh'],yb-0.02,yt,10,16,0.17);   /* V250: shaped to his own thigh */
      const C1=(ph,y,o)=>{ if(!TR) { const r=RH*(0.92+0.08*(y-yb)/(yt-yb))+(o||0); return V(r*Math.sin(ph),y,r*Math.cos(ph)); } const [x,z]=TR.c(y), r=TR.r(ph,y)+0.014+(o||0)+0.008*Math.max(0,Math.cos(ph)); return V(x+r*Math.sin(ph),y,z+r*Math.cos(ph)); };
      mesh(gh,surf((u,v)=>C1(-2.4+4.8*u,yb+(yt-yb)*v),14,6,{two:0.004,smooth:!!TR}),M.steel,'steel');                 // the cuisse
      [yb,yt-0.016].forEach(y=>mesh(gh,surf((u,v)=>C1(-2.4+4.8*u,y+v*0.016,0.004),20,1,{two:0.002}),GD,'gold'));
      mesh(gh,surf((u,v)=>C1(Math.PI-0.85+1.7*u,yb+(yt-yb)*v,-0.004),6,3,{two:0.003}),M.boot,'leather');                                    // and its straps behind
      // the poleyn: a faceted point on the knee and a fan to the outside, gold-rimmed
      const pk=mesh(gk,facetSphere(0.06,0.062,0.052,6,4,0,Math.PI*0.6),M.steel,'steel'); pk.position.set(0,0.012,0.04); pk.rotation.x=Math.PI/2;
      const tip=mesh(gk,new THREE.ConeGeometry(0.03,0.04,6).toNonIndexed(),M.steel,'steel'); tip.position.set(0,0.012,0.1); tip.rotation.x=Math.PI/2; tip.geometry.computeVertexNormals();
      const rim=mesh(gk,new THREE.TorusGeometry(0.058,0.006,4,12).toNonIndexed(),GD,'gold'); rim.position.set(0,0.012,0.042);
      const fan=mesh(gk,facetSphere(0.04,0.05,0.014,6,4),M.steel,'steel'); fan.position.set(sd*0.055,0.01,0.01); fan.rotation.y=sd*0.5;
      // the greave: a keeled shell before, leather behind
      const Ek=bounds(G.knee,o=>!o.userData.sabaton&&/^(steel)$/.test(o.userData.part),[[-0.072,-0.36,-0.09],[0.084,0.075,0.12]]);
      /* V249: a closed greave, steel all round, running down over the ankle and flaring onto the sabaton's instep — an armoured
         boot, not a shin guard: its axis bends from the knee to the ankle so its foot sits over the foot */
      const Ef=bounds(G.knee,o=>o.userData.sabaton||o.userData.part==='leather',[[-0.072,-0.44,-0.06],[0.084,-0.34,0.213]]), acx=(Ef.min.x+Ef.max.x)/2, acz=Ef.min.z+0.05, fx0=(Ef.max.x-Ef.min.x)/2;
      const gy1=0.0, gy0=Math.min(-0.33,Ef.max.y)-0.035, R0=0.07, R1=0.056;
      const rG=(ph,y)=>{ const v=(y-gy0)/(gy1-gy0), calf=R1+(R0-R1)*Math.sin(Math.min(1,v*1.15)*Math.PI/2), flare=Math.max(0,0.16-v)/0.16, foot=Math.max(fx0+0.014,R1)*(1+0.25*Math.max(0,Math.cos(ph)));
        return calf+(foot-calf)*flare*flare+0.006*Math.max(0,1-Math.abs(ph)/0.25)+(K._gvB!==undefined?K._gvB:0.02)*Math.max(0,-Math.cos(ph))*Math.sin(Math.min(1,v*1.3)*Math.PI); };   // room behind for the calf
      const ax=y=>{ const v=Math.max(0,Math.min(1,(gy1-y)/(gy1-gy0))), t=Math.pow(v,2.2); return [acx*t,acz*t*0.6]; };
      /* V250: and its shape his own — the calf's swell behind, the shin's line before, drawn in to a slim ankle — then a cuff over the
         ankle and the flare onto the instep (an athlete's boot, not a stovepipe) */
      const CR=K._legFit===false?null:bodyRings(K,G.knee,['calf'],gy0+0.03,gy1,14,18,0.15), aY=gy0+0.07;
      const rFit=(ph,y)=>{ if(!CR) return rG(ph,y); const v=(y-gy0)/(gy1-gy0), tc=Math.max(0,Math.min(1,(y-aY)/(gy1-aY))), sw=Math.sin(Math.pow(tc,0.75)*Math.PI), body=CR.r(ph,Math.max(aY,y))*(0.86+0.16*sw)+0.012+0.006*Math.max(0,1-Math.abs(ph)/0.3)+(K._calf!==undefined?K._calf:0.028)*Math.max(0,-Math.cos(ph))*sw*sw, flare=Math.max(0,(aY-y)/(aY-gy0)), foot=Math.max(fx0+0.014,0.05)*(1+0.25*Math.max(0,Math.cos(ph)));
        return body+(foot-body)*flare*flare; };
      const axFit=y=>{ if(!CR) return ax(y); const [x,z]=CR.c(Math.max(aY,y)), f=Math.max(0,(aY-y)/(aY-gy0)); return [x+(acx-x)*f*0.7,z+(acz*0.6-z)*f*0.7]; };
      const G3=(ph,y,o)=>{ const r=rFit(ph,y)+(o||0), [x,z]=axFit(y); return V(x+r*Math.sin(ph),y,z+r*Math.cos(ph)); };
      mesh(gk,surf((u,v)=>G3(-Math.PI+u*Math.PI*2,gy0+(gy1-gy0)*v),18,10,{two:0.004,smooth:!!CR}),M.steel,'steel');
      if(CR){ const cy=aY-0.005; mesh(gk,surf((u,v)=>G3(-Math.PI+u*Math.PI*2,cy-0.02+v*0.045,0.008),24,2,{two:0.003}),M.steel,'steel');   // the ankle cuff
        [cy-0.02,cy+0.02].forEach(y=>mesh(gk,surf((u,v)=>G3(-Math.PI+u*Math.PI*2,y+v*0.008,0.011),28,1,{two:0.002}),GD,'gold')); }
      mesh(gk,surf((u,v)=>{ const y=gy0+0.02+(gy1-0.03-gy0)*u, ph=(v-0.5)*0.07; return G3(ph,y,0.005); },6,1,{two:0.002}),GD,'gold');   // the keel
      mesh(gk,surf((u,v)=>{ const y=gy0+0.02+(gy1-0.03-gy0)*u, ph=Math.PI+(v-0.5)*0.07; return G3(ph,y,0.004); },6,1,{two:0.002}),GD,'gold');   // the hinge-seam behind
      [gy1-0.016,gy0+0.006].forEach(y=>mesh(gk,surf((u,v)=>G3(-Math.PI+u*Math.PI*2,y+v*0.016,0.005),24,1,{two:0.002}),GD,'gold'));   // gold at its top and its foot
      [-1,1].forEach(s=>{ const rv=mesh(gk,facetSphere(0.009,0.009,0.009,6,4),GD,'gold'); rv.position.copy(G3(s*Math.PI/2,aY-0.005,0.016)); });   // the ankle rivets
    }); };

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
      mesh(g,band(()=>x0+0.004,-Math.PI,Math.PI,yt-0.06,yt+0.01,10,1,{two:0.003,cx,cz:z0+0.05}),M.steel,'steel');      // V249: a steel collar at the ankle (the greave closes over it)
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
    if(slot==='skirt'){ kids(K._skF,()=>true); kids(K._skB,()=>true); kids(r.torso,o=>o.userData.part==='mail'); }   /* V242: and the old mail skirt beneath */
    if(slot==='pauldrons') [r.AL,r.AR].forEach(A=>kids(A.sh,o=>/^(paul|gold)$/.test(o.userData.part)));
    if(slot==='arms'){ [r.AL,r.AR].forEach(A=>{ kids(A.sh,o=>o.userData.part==='steel'); kids(A.el,()=>true); }); regs(['forearm','lowerarm_l','lowerarm_r']); regs(['upperarm'],true);   /* the old rerebrace's steel stays beneath, filling the shoulder under the pauldron; only its gold edge goes */ }
    if(slot==='gauntlets') [r.AL,r.AR].forEach(A=>kids(A.hand,o=>/^(steel|gold)$/.test(o.userData.part)));
    if(slot==='legs'){ [r.L,r.R].forEach(G=>{ kids(G.hip,()=>true); kids(G.knee,o=>!o.userData.sabaton&&o.userData.part!=='leather'); }); regs(['thigh','calf','boot','calf_l','calf_r']); }
    if(slot==='sabatons'){ [r.L,r.R].forEach(G=>kids(G.knee,o=>o.userData.sabaton||o.userData.part==='leather')); regs(['foot']); }
    return out; }

  // ── wearing ──
  function state(K){ return K.userData.armorS||(K.userData.armorS={worn:{},groups:{},hid:{}}); }
  function build(K,slot,id){ const S=state(K), P=PIECES[slot]&&PIECES[slot][id]; if(!P) return null; const ctx={K,slot,groups:[]}; try{ P.build(ctx); }catch(e){ ctx.groups.forEach(g=>g.parent&&g.parent.remove(g)); if(window.DEBUG_ARMOR) console.error('ARMOR',slot,e); return null; } return ctx.groups; }
  function show(K,slot,on){ const S=state(K); S.softDirty=true; (S.groups[slot]||[]).forEach(g=>{ g.visible=on; });
    const cov=on?covered(K,slot):(S.hid[slot]||[]); if(on){ S.hid[slot]=cov; cov.forEach(o=>{ if(!o.userData.armorHid){ o.userData.armorHid=1; o.userData.armorWas=o.visible; } o.visible=false; }); }
    else { cov.forEach(o=>{ if(o.userData.armorHid){ o.visible=o.userData.armorWas!==false; delete o.userData.armorHid; } }); S.hid[slot]=[]; } }
  function toon(K){ const F=K.userData.b3; if(!F||typeof F!=='object'||typeof BODY3==='undefined'||!BODY3.toonify) return; const tw=BODY3.toonify(K,F); if(!tw||!tw.length) return;
    const have=F._armTw||(F._armTw=new Set()), add=tw.filter(t=>!have.has(t)); if(!add.length) return; add.forEach(t=>have.add(t));
    const s0=F.sync; F.sync=()=>{ s0(); for(const t of add) if(!t.userData.fixed&&t.userData.src) t.color.copy(t.userData.src.color).multiplyScalar(t.userData.k||1); }; }
  /* V253: FITTED TO THE BODY. The pieces were sized from the old sculpted knight, broader than the body BODY3 puts under him (the helm
     twice his head's width). After a piece is built, the body under it is measured (its skinned points, in the piece's own joint frame,
     within the piece's height) and the piece is drawn in round the limb's axis to sit just over it — every set alike. The helm and the
     pauldrons shrink whole; the rest only in girth (their lengths are the joints'). Never enlarged. K._armFit=false turns it off. */
  const FIT={helm:{m:0.022,u:'mid'},cowl:{m:0.02},tabard:{m:0.02},belt:{m:0.024,band:0.05},skirt:{m:0.02},pauldrons:{m:0.016,u:'top',k:1.2,band:0.1},arms:{m:0.014},gauntlets:{m:0.012},legs:{m:0.012},sabatons:{m:0.014}};
  const _fv=new THREE.Vector3(), pct=(a,p)=>{ const b=Float32Array.from(a).sort(); return b[Math.max(0,Math.min(b.length-1,Math.floor((b.length-1)*p)))]; };
  function bodyW(K){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.body.boneTransform||!F.D) return null; const now=performance.now();
    if(K._fitW&&now-K._fitW.t<1500) return K._fitW; const body=F.body, P=body.geometry.attributes.position, R=F.D.reg, n=P.count, W=new Float32Array(n*3); K.updateMatrixWorld(true); body.skeleton.update();
    for(let q=0;q<n;q++){ body.boneTransform(q,_fv); _fv.applyMatrix4(body.matrixWorld); W[q*3]=_fv.x; W[q*3+1]=_fv.y; W[q*3+2]=_fv.z; } return K._fitW={t:now,W,R,n}; }
  function regsOf(K,p){ const r=K.rig; if(p===r.torso) return ['chest','belly','pelvis','thigh'];   /* the hips are 'thigh' on this body */ if(p===r.head) return ['head']; if(p===K._skF||p===K._skB) return ['pelvis','thigh'];
    for(const A of [r.AL,r.AR]){ if(p===A.sh) return ['upperarm']; if(p===A.el) return ['forearm']; if(p===A.hand) return ['hand']; } for(const G of [r.L,r.R]){ if(p===G.hip) return ['thigh']; if(p===G.knee) return ['calf','boot','foot']; } return null; }
  /* V254: EACH PIECE FITTED TO HIS BODY. Not a shrink but a re-seat, piece by piece: round the piece's own joint, ring by ring up its
     length, the body's outer surface is measured (bodyRings) and so is the piece's inner face (its shell); every point of the piece is moved
     along its ray from the limb's axis so the shell lies a set gap over the body, and whatever stood proud of the shell — keels, ridges,
     gilt bands, rivets, flares, a hem — stands just as proud after. Above or below the body it hangs past (a helm's crown, a pauldron's
     dome, a tabard's hem) the piece keeps its own shape, set in by as much as its nearest ring was. Every set alike. */
  const CONF={tabard:{gap:0.012,box:0.32},belt:{gap:0.045,box:0.32},arms:{gap:0.012,box:0.13}};
  /* the domes (helm, pauldrons) and the ends (gauntlets, sabatons) aren't tubes: sized whole to the body part, centred on it, then let down
     onto it until they rest a gap above it (SETTLE) */
  const SETTLE={helm:{gap:0.016,lift:0.08,xz:true},pauldrons:{gap:0.012,lift:0.06},gauntlets:{gap:0.006,lift:0.03,xz:true},sabatons:{gap:0.006,lift:0.03}};
  const _cm=new THREE.Matrix4(), _ci=new THREE.Matrix4();
  function conform(K,slot,g){ const cf=CONF[slot], par=g.parent, regs=regsOf(K,par); if(!cf||!regs) return false; g.updateMatrixWorld(true);
    const ms=[]; g.traverse(m=>{ if(m.isMesh&&m.geometry&&m.geometry.attributes.position&&!m.isSkinnedMesh) ms.push(m); }); if(!ms.length) return false;
    // the piece's points in its joint's frame
    _ci.copy(par.matrixWorld).invert(); const L=[]; let N=0; ms.forEach(m=>{ const M=new THREE.Matrix4().multiplyMatrices(_ci,m.matrixWorld), A=m.geometry.attributes.position, P=new Float32Array(A.count*3);
      for(let i=0;i<A.count;i++){ _fv.fromBufferAttribute(A,i).applyMatrix4(M); P[i*3]=_fv.x; P[i*3+1]=_fv.y; P[i*3+2]=_fv.z; } L.push({m,M,P}); N+=A.count; });
    const ys=[]; L.forEach(o=>{ for(let i=1;i<o.P.length;i+=3) ys.push(o.P[i]); }); let y0=pct(ys,0.02), y1=pct(ys,0.98); if(cf.minY!==undefined) y0=Math.max(y0,cf.minY); if(y1-y0<0.02) return false;
    const NY=Math.max(4,Math.min(16,Math.round((y1-y0)/0.03))), NA=24, BR=bodyRings(K,par,regs,y0,y1,NY,NA,cf.box); if(!BR) return false;
    // the piece's shell: the inner face of it, ring by ring
    const bins=Array.from({length:NY*NA},()=>[]), bi=(ph,y)=>{ const b=Math.max(0,Math.min(NY-1,Math.floor((y-y0)/(y1-y0)*NY))), a=Math.floor(((ph+Math.PI)/(Math.PI*2))*NA)%NA; return b*NA+a; };
    L.forEach(o=>{ for(let i=0;i<o.P.length;i+=3){ const [cx,cz]=BR.c(o.P[i+1]), dx=o.P[i]-cx, dz=o.P[i+2]-cz; bins[bi(Math.atan2(dx,dz),o.P[i+1])].push(Math.hypot(dx,dz)); } });
    const sh=new Float32Array(NY*NA); for(let k=0;k<sh.length;k++) sh[k]=bins[k].length?pct(bins[k],0.3):0;
    for(let pass=0;pass<NA+NY;pass++){ let left=0; for(let b=0;b<NY;b++) for(let a=0;a<NA;a++){ if(sh[b*NA+a]) continue; const n=[sh[b*NA+(a+1)%NA],sh[b*NA+(a+NA-1)%NA],b>0?sh[(b-1)*NA+a]:0,b<NY-1?sh[(b+1)*NA+a]:0].filter(x=>x>0); if(n.length) sh[b*NA+a]=n.reduce((q,x)=>q+x,0)/n.length; else left++; } if(!left) break; }
    { const s2=sh.slice(); for(let b=0;b<NY;b++) for(let a=0;a<NA;a++){ const v=[sh[b*NA+a]*2,sh[b*NA+(a+1)%NA],sh[b*NA+(a+NA-1)%NA]]; s2[b*NA+a]=v.reduce((q,x)=>q+x,0)/4; } sh.set(s2); }
    const shR=(ph,y)=>{ const f=Math.max(0,Math.min(NY-1,(y-y0)/(y1-y0)*NY-0.5)), i=Math.floor(f), t=f-i, j=Math.min(NY-1,i+1), gg=((ph+Math.PI)/(Math.PI*2))*NA-0.5, a0=((Math.floor(gg)%NA)+NA)%NA, a1=(a0+1)%NA, u=gg-Math.floor(gg);
      const ri=sh[i*NA+a0]+(sh[i*NA+a1]-sh[i*NA+a0])*u, rj=sh[j*NA+a0]+(sh[j*NA+a1]-sh[j*NA+a0])*u; return ri+(rj-ri)*t; };
    const gap=(K._fitGap&&K._fitGap[slot]!==undefined)?K._fitGap[slot]:cf.gap;
    // each point moved along its ray: the shell onto the body (+ the gap), its relief kept
    const top=slot==='helm'?{y:-1e9}:null;
    L.forEach(o=>{ const A=o.m.geometry.attributes.position, Mi=new THREE.Matrix4().copy(o.M).invert();
      for(let i=0;i<A.count;i++){ const x=o.P[i*3], y=o.P[i*3+1], z=o.P[i*3+2], yc=Math.max(y0,Math.min(y1,y)), [cx,cz]=BR.c(yc), dx=x-cx, dz=z-cz, r=Math.hypot(dx,dz); if(r<1e-5) continue;
        const ph=Math.atan2(dx,dz), want=BR.r(ph,yc)+gap, dr=Math.min(0.012,(want-shR(ph,yc))*(cf.k||1)), rn=Math.max(r*0.25,r+dr);   /* drawn in to the body; let out only a little where it cut in */
        if(top&&y>top.y){ top.y=y; top.p=new THREE.Vector3(x,y,z); top.n=new THREE.Vector3(cx+dx/r*rn,y,cz+dz/r*rn); }
        _fv.set(cx+dx/r*rn,y,cz+dz/r*rn).applyMatrix4(Mi); A.setXYZ(i,_fv.x,_fv.y,_fv.z); }
      A.needsUpdate=true; o.m.geometry.computeVertexNormals(); o.m.geometry.computeBoundingSphere(); if(o.m.userData.rest) o.m.userData.rest=A.array.slice(); });
    if(top&&top.p) K._helmTop={d:top.n.clone().sub(top.p)};
    g.userData.fitS='conform'; return true; }
  // let a piece down onto the body: over each patch of the body it covers, how far its underside stands above the body's top there;
  //  the piece is moved up or down so the closest of those is `gap`
  function settle(K,slot,g){ const st=SETTLE[slot], par=g.parent, regs=regsOf(K,par), B=bodyW(K); if(!st||!regs||!B) return null; g.updateMatrixWorld(true);
    const lim=0.22, ok=new Set(slot==='pauldrons'?['upperarm','chest']:regs), C=0.015, top=new Map(), key=(x,z)=>Math.floor(x/C)+','+Math.floor(z/C); let bx=0,bz=0,bn=0;
    for(let q=0;q<B.n;q++){ if(!ok.has(B.R[q])) continue; _fv.set(B.W[q*3],B.W[q*3+1],B.W[q*3+2]); par.worldToLocal(_fv); if(Math.abs(_fv.x)>lim||Math.abs(_fv.z)>lim||Math.abs(_fv.y)>0.45) continue;
      const k=key(_fv.x,_fv.z), t=top.get(k); if(t===undefined||_fv.y>t) top.set(k,_fv.y); if(B.R[q]===regs[0]){ bx+=_fv.x; bz+=_fv.z; bn++; } }
    if(!top.size) return null; const p0=g.position.clone();
    const pts=[]; g.traverse(m=>{ if(!m.isMesh||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, st2=Math.max(1,Math.floor(A.count/600)); _cm.multiplyMatrices(_ci.copy(par.matrixWorld).invert(),m.matrixWorld);
      for(let i=0;i<A.count;i+=st2){ _fv.fromBufferAttribute(A,i).applyMatrix4(_cm); pts.push(_fv.x,_fv.y,_fv.z); } });
    if(st.xz&&bn){ const xs=[],zs=[]; for(let i=0;i<pts.length;i+=3){ xs.push(pts[i]); zs.push(pts[i+2]); } const dx=bx/bn-(pct(xs,0.05)+pct(xs,0.95))/2, dz=bz/bn-(pct(zs,0.05)+pct(zs,0.95))/2; g.position.x+=dx; g.position.z+=dz; for(let i=0;i<pts.length;i+=3){ pts[i]+=dx; pts[i+2]+=dz; } }
    const cl=[]; for(let i=0;i<pts.length;i+=3){ const t=top.get(key(pts[i],pts[i+2])); if(t!==undefined&&pts[i+1]>t-0.004) cl.push(pts[i+1]-t); }
    if(cl.length>=4){ const gap=(K._fitGap&&K._fitGap[slot]!==undefined)?K._fitGap[slot]:st.gap; g.position.y+=Math.max(-0.08,Math.min(0.04,gap-pct(cl,0.03))); }
    return g.position.clone().sub(p0); }
  function fitGroups(K,slot,gs){ if(slot==='plume'&&K._armFit!==false){ const hf=K._helmFit; if(hf) gs.forEach(g=>{ const par=g.parent; if(!par) return;   // the crest follows the helm: its size, and where it came to rest
        K.updateMatrixWorld(true); const c=K.rig.head.localToWorld(_fv.copy(hf.c)); par.worldToLocal(c); g.scale.multiplyScalar(hf.s); g.position.sub(c).multiplyScalar(hf.s).add(c);
        if(hf.d){ const a=K.rig.head.localToWorld(new THREE.Vector3()), b=K.rig.head.localToWorld(hf.d.clone()); par.worldToLocal(a); par.worldToLocal(b); g.position.add(b.sub(a)); } g.userData.fitS='follows'; }); return; }
    if(CONF[slot]&&K._armFit!==false&&K._conform!==false){ if(slot==='helm') K._helmTop=null; let any=false; gs.forEach(g=>{ if(g.userData.garmentSlot) return; try{ if(conform(K,slot,g)) any=true; }catch(e){ if(window.DEBUG_ARMOR) console.error('conform',slot,e); } }); if(any) return; }
    if(slot==='helm') K._helmFit=null; const f=FIT[slot]; if(!f||K._armFit===false) return; const B=bodyW(K); if(!B) return; const r=K.rig;
    gs.forEach(g=>{ const par=g.parent, regs=par&&regsOf(K,par); if(!regs||g.userData.garmentSlot) return; g.updateMatrixWorld(true);
      const px=[],py=[],pz=[]; g.traverse(m=>{ if(!m.isMesh||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, st=Math.max(1,Math.floor(A.count/500)); for(let i=0;i<A.count;i+=st){ _fv.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld); par.worldToLocal(_fv); px.push(_fv.x); py.push(_fv.y); pz.push(_fv.z); } });
      if(px.length<8) return; const y0=pct(py,0.05)-(f.band||0.01), y1=pct(py,0.95)+(f.band||0.01), wide=par===r.torso||par===K._skF||par===K._skB, lim=wide?0.42:0.2, ok=new Set(regs), bx=[],by=[],bz=[];
      for(let q=0;q<B.n;q++){ if(!ok.has(B.R[q])) continue; _fv.set(B.W[q*3],B.W[q*3+1],B.W[q*3+2]); par.worldToLocal(_fv); if(_fv.y<y0||_fv.y>y1||Math.abs(_fv.x)>lim||Math.abs(_fv.z)>lim) continue; bx.push(_fv.x); by.push(_fv.y); bz.push(_fv.z); }
      if(bx.length<20) return;
      const pw=pct(px,0.95)-pct(px,0.05), pd=pct(pz,0.95)-pct(pz,0.05), bw=(pct(bx,0.98)-pct(bx,0.02))*(f.k||1)+2*f.m, bd=(pct(bz,0.98)-pct(bz,0.02))*(f.k||1)+2*f.m;
      if(pw<1e-3||pd<1e-3) return; const s=Math.max(0.5,Math.min(1,(bw/pw+bd/pd)/2)); g.userData.fitS=s; if(s>0.97){ if(slot==='helm') K._helmFit=null; if(SETTLE[slot]&&K._settle!==false){ try{ const d=settle(K,slot,g); if(d&&slot==='helm') K._helmFit={s:1,c:new THREE.Vector3(),d}; }catch(e){} } return; }
      const cx=(pct(bx,0.02)+pct(bx,0.98))/2, cz=(pct(bz,0.02)+pct(bz,0.98))/2, cy=f.u==='mid'?(pct(by,0.1)+pct(by,0.9))/2:f.u==='top'?pct(py,0.95):0;
      if(slot==='helm'&&par===r.head) K._helmFit={s,c:new THREE.Vector3(cx,cy,cz)};
      g.scale.set(g.scale.x*s,f.u?g.scale.y*s:g.scale.y,g.scale.z*s); g.position.x=cx+(g.position.x-cx)*s; g.position.z=cz+(g.position.z-cz)*s; if(f.u) g.position.y=cy+(g.position.y-cy)*s;
      if(SETTLE[slot]&&K._settle!==false){ try{ const d=settle(K,slot,g); if(d&&slot==='helm'&&K._helmFit) K._helmFit.d=d; if(d) g.userData.fitS=+s.toFixed(2)+' ↓'+d.y.toFixed(3); }catch(e){ if(window.DEBUG_ARMOR) console.error('settle',slot,e); } } }); }
  function wear(K,slot,id){ const S=state(K); if(S.worn[slot]) set(K,slot,false); if(S.groups[slot]){ S.groups[slot].forEach(g=>g.parent&&g.parent.remove(g)); S.groups[slot]=null; }
    if(!id) return; const gs=build(K,slot,id); if(!gs) return; try{ fitGroups(K,slot,gs); }catch(e){ if(window.DEBUG_ARMOR) console.error('ARMOR fit',slot,e); }
    if(slot==='helm'&&S.groups.plume&&S.ids&&S.ids.plume&&!wear._in){ wear._in=true; try{ const pid=S.ids.plume, on=S.worn.plume; wear(K,'plume',pid); if(!on) set(K,'plume',false); } finally{ wear._in=false; } }   /* the crest re-seated on the new helm */ S.groups[slot]=gs; S.ids=S.ids||{}; S.ids[slot]=id; set(K,slot,true); }
  function set(K,slot,on){ const S=state(K); if(on&&!S.groups[slot]){ wear(K,slot,(S.ids&&S.ids[slot])||'templar'); return; } if(!S.groups[slot]) return; S.worn[slot]=!!on; show(K,slot,!!on); if(on) toon(K); }
  function worn(K){ const S=state(K), o={}; SLOTS.forEach(s=>o[s]=S.worn[s]?(S.ids&&S.ids[s])||'templar':null); return o; }
  // put the hero in his harness: every slot, save those the wardrobe has taken off
  // ── the skill trees' harnesses (armor_sets.js): each tier of a tree earns one of its pieces, the ultimate the helm and its crest.
  //  Once earned a piece is kept (a respec doesn't take it back), and the wardrobe picks, slot by slot, from all that are earned ──
  const TREES={striker:'st',guardian:'gd',psalmist:'ps'}, TIER={gauntlets:0,sabatons:1,belt:2,arms:3,legs:4,skirt:5,pauldrons:6,cowl:7,tabard:8,helm:9,plume:9};
  const SG=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  function earned(id,slot){ if(id==='templar'||id==='base') return !!(PIECES[slot]&&PIECES[slot][id]); const S=SG(), pre=TREES[id]; if(S.armorOwned&&S.armorOwned[id+'.'+slot]&&PIECES[slot]&&PIECES[slot][id]) return true;   /* V245: bought at the smithy */ if(!pre||!PIECES[slot]||!PIECES[slot][id]) return false; return !!((S.armorEarned&&S.armorEarned[id+'.'+slot])||(S.skills&&S.skills[pre+TIER[slot]])); }
  function options(slot){ const o=Object.keys(PIECES[slot]||{}).filter(id=>earned(id,slot)&&id!=='base'); if(PIECES[slot]&&PIECES[slot].base) o.push('base'); return o; }   // plain clothes last
  function pick(slot){ const S=SG(); if(S.armorOff&&S.armorOff[slot]&&PIECES[slot].base) return 'base'; const id=(S.armorPick&&S.armorPick[slot])||'templar'; return earned(id,slot)?id:'templar'; }   /* V242: a slot with its armour off wears the plain clothes, not the old harness */
  function noteEarned(){ const S=SG(); if(!S.skills) return; S.armorEarned=S.armorEarned||{}; const fresh=[];
    for(const id in TREES) for(const slot in TIER){ const k=id+'.'+slot; if(!S.armorEarned[k]&&S.skills[TREES[id]+TIER[slot]]&&PIECES[slot]&&PIECES[slot][id]){ S.armorEarned[k]=1; fresh.push(PIECES[slot][id].name); } }
    if(fresh.length&&typeof UI!=='undefined'&&UI.toast&&!noteEarned.quiet) UI.toast('🛡 Armour earned: '+fresh.join(', ')+' — try it on in ☰ System → Armour',3200); noteEarned.quiet=false; }
  noteEarned.quiet=true;
  function dress(K){ SLOTS.forEach(s=>wear(K,s,pick(s))); K.userData.armor=true; }
  function apply(){ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K, off=SG().armorOff||{}, S=state(K); SLOTS.forEach(s=>{ const id=pick(s); if((S.ids&&S.ids[s])!==id||!S.groups[s]) wear(K,s,id); else set(K,s,true); }); }
  // the hero, once his body has come (the plate shells it makes are among what the harness covers)
  let lastOff='';
  setInterval(()=>{ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K;
    try{ noteEarned(); }catch(e){}
    if(K.userData.armor){ const S=SG(), off=JSON.stringify([S.armorOff||{},S.armorPick||{},S.armorEarned||{},S.skills||{}]); if(off!==lastOff){ lastOff=off; try{ apply(); }catch(e){} } return; }   // a loaded save, or the wardrobe
    if(K.bare||!K.rig||!K.M) return;
    const b=K.userData.b3, waiting=b==='loading'||(K.sculpted&&b===undefined&&typeof BODY3!=='undefined'&&BODY3.on&&!K._armWait); if(waiting){ K._armT=(K._armT||0)+1; if(K._armT<40) return; }
    try{ dress(K); }catch(e){ K.userData.armor=true; if(window.DEBUG_ARMOR) console.error('ARMOR',e); } },400);
  // ── V245: SOFT CLOTH — skirts, robes and the fur cloak are pushed, vertex by vertex, out of the legs (a capsule for each thigh and
  //  shin), and the shoulder pelts out of the head, every frame, so cloth never passes through the body it hangs on. Each soft mesh keeps
  //  its rest shape and is bent away from the body only where it would cut into it. ──
  const _w=new THREE.Vector3(), _p=new THREE.Vector3(), _d=new THREE.Vector3(), _ab=new THREE.Vector3(), _inv=new THREE.Matrix4(), _sc=new THREE.Vector3(), CAPS=[], HEAD={c:new THREE.Vector3(),r:0};
  for(let i=0;i<4;i++) CAPS.push({a:new THREE.Vector3(),b:new THREE.Vector3(),r:0});
  function softList(K,S){ const list=[]; for(const slot in S.groups){ (S.groups[slot]||[]).forEach(g=>{ if(!g.visible) return; const sk=g.parent===K._skF||g.parent===K._skB;
      g.traverse(m=>{ if(!m.isMesh||!(sk||m.userData.soft||m.userData.softHead)) return; if(!m.userData.rest){ m.userData.rest=m.geometry.attributes.position.array.slice(); m.frustumCulled=false; } list.push(m); }); }); }
    return list; }
  function tick(K){ const S=K&&K.userData.armorS; if(!S||!K.visible) return;
    if(K.rig&&K.rig.capeP&&K.rig.capeP.visible) K.rig.capeP.visible=false;   /* V246: no cloth cape on the hero — it fought every other cloak (and the saddle) */
    if(K.herald&&!K.herald._robust){ K.herald._robust=true; K.herald.group.traverse(m=>{ if(m.isMesh){ m.frustumCulled=false; if(m.material&&m.userData.part==='face'){ m.material.side=THREE.DoubleSide; m.material.needsUpdate=true; } } }); }   /* V246: the shield is never culled */ if(!S.soft||S.softDirty){ S.soft=softList(K,S); S.softDirty=false; } const list=S.soft; if(!list.length) return;
    K.updateMatrixWorld(true); K.getWorldScale(_sc); const sc=_sc.y||1, r=K.rig;
    [r.L,r.R].forEach((G,i)=>{ const T=CAPS[i*2], Sh=CAPS[i*2+1]; G.hip.getWorldPosition(T.a); G.knee.getWorldPosition(T.b); T.r=0.1*sc; Sh.a.copy(T.b); G.knee.localToWorld(Sh.b.set(0,-0.34,0.03)); Sh.r=0.078*sc; });
    r.head.localToWorld(HEAD.c.set(0,0.03,0)); HEAD.r=0.17*sc;
    for(const m of list){ if(!m.visible||(m.parent&&!m.parent.visible)) continue; const pos=m.geometry.attributes.position, A=pos.array, R=m.userData.rest, head=!!m.userData.softHead; let dirty=false;
      _inv.copy(m.matrixWorld).invert();
      for(let i=0;i<A.length;i+=3){ _w.set(R[i],R[i+1],R[i+2]).applyMatrix4(m.matrixWorld); let hit=false;
        if(head){ _d.subVectors(_w,HEAD.c); const L=_d.length(); if(L<HEAD.r){ _w.copy(HEAD.c).addScaledVector(L>1e-5?_d.multiplyScalar(1/L):_d.set(0,1,0),HEAD.r); hit=true; } }
        else for(const C of CAPS){ _ab.subVectors(C.b,C.a); const t=Math.max(0,Math.min(1,_d.subVectors(_w,C.a).dot(_ab)/Math.max(1e-6,_ab.lengthSq()))); _p.copy(C.a).addScaledVector(_ab,t); _d.subVectors(_w,_p); const L=_d.length();
          if(L<C.r){ _w.copy(_p).addScaledVector(L>1e-5?_d.multiplyScalar(1/L):_d.set(0,0,1),C.r); hit=true; } }
        if(hit){ _w.applyMatrix4(_inv); A[i]=_w.x; A[i+1]=_w.y; A[i+2]=_w.z; dirty=true; }
        else if(A[i]!==R[i]||A[i+1]!==R[i+1]||A[i+2]!==R[i+2]){ A[i]=R[i]; A[i+1]=R[i+1]; A[i+2]=R[i+2]; dirty=true; } }
      if(dirty) pos.needsUpdate=true; } }
  // ── V245: the PREVIEW — the knight himself, drawn alone into the Armour tab: the game's own renderer draws only his layer from a
  //  turntable camera into a small target, which is copied into the tab's canvas. Drag to turn him. ──
  const preview=(function(){ let cv=null, ctx2=null, rt=null, cam=null, raf=0, ang=0.5, drag=null, buf=null, img=null, last=0; const W=260, Hh=340, LAY=5;
    function frame(t){ raf=requestAnimationFrame(frame); if(!cv||!cv.isConnected){ stop(); return; } if(t-last<45) return; last=t;
      if(typeof ENGINE==='undefined'||!ENGINE.K||!ENGINE.level||!ENGINE.renderer) return; const K=ENGINE.K, L=ENGINE.level, R=ENGINE.renderer, sc=L.scene; if(!sc) return;
      if(!rt){ rt=new THREE.WebGLRenderTarget(W,Hh); cam=new THREE.PerspectiveCamera(28,W/Hh,0.05,30); buf=new Uint8Array(W*Hh*4); img=ctx2.createImageData(W,Hh); }
      K.traverse(o=>o.layers.enable(LAY)); sc.traverse(o=>{ if(o.isLight) o.layers.enable(LAY); }); cam.layers.set(LAY);
      K.updateMatrixWorld(true); const foot=K.getWorldPosition(new THREE.Vector3()), hd=K.rig.head.getWorldPosition(new THREE.Vector3()), h=hd.y-foot.y, mid=foot.clone().add(V(0,h*0.55,0)), d=h*2.85, f=K.rotation.y+ang;
      cam.position.set(mid.x+Math.sin(f)*d,mid.y+h*0.08,mid.z+Math.cos(f)*d); cam.lookAt(mid);
      const bg=sc.background, fog=sc.fog, fN=fog&&fog.near, fF=fog&&fog.far, fD=fog&&fog.density, hv=K._head&&K._head.visible, kv=K.visible, cc=R.getClearColor(new THREE.Color()), ca=R.getClearAlpha(), prevT=R.getRenderTarget(), sm=R.shadowMap.autoUpdate;
      const hid=[]; sc.children.forEach(o=>{ if(o!==K&&!o.isLight&&o.visible){ let has=false; if(o.isObject3D&&o.children.length){ let q=K.parent; while(q){ if(q===o){ has=true; break; } q=q.parent; } } if(!has){ o.visible=false; hid.push(o); } } });   /* the knight alone: the world set aside while he's drawn */
      sc.background=null; if(fog){ if(fog.isFogExp2) fog.density=0; else { fog.near=1e4; fog.far=2e4; } }   /* fog thinned, not removed: shaders were built with it */ if(K._head) K._head.visible=true; K.visible=true; R.shadowMap.autoUpdate=false; if(typeof OUTFIT3!=='undefined'&&OUTFIT3.bsync) try{ OUTFIT3.bsync(); }catch(e){}   /* the hood, shown though first person hides it */
      try{ R.setRenderTarget(rt); R.setClearColor(0x17161d,1); R.clear(); R.render(sc,cam); R.readRenderTargetPixels(rt,0,0,W,Hh,buf); }
      finally{ hid.forEach(o=>o.visible=true); R.setRenderTarget(prevT); R.setClearColor(cc,ca); sc.background=bg; if(fog){ if(fog.isFogExp2) fog.density=fD; else { fog.near=fN; fog.far=fF; } } if(K._head) K._head.visible=hv; K.visible=kv; R.shadowMap.autoUpdate=sm; if(typeof OUTFIT3!=='undefined'&&OUTFIT3.bsync) try{ OUTFIT3.bsync(); }catch(e){} }
      const D=img.data; for(let y=0;y<Hh;y++){ const s0=(Hh-1-y)*W*4, d0=y*W*4; for(let x=0;x<W*4;x++) D[d0+x]=buf[s0+x]; } ctx2.putImageData(img,0,0); }
    function start(c){ if(!c) return; if(cv!==c){ cv=c; ctx2=c.getContext('2d'); img=null; rt&&(img=ctx2.createImageData(W,Hh));
        c.addEventListener('pointerdown',e=>{ drag={x:e.clientX,a:ang}; c.setPointerCapture&&c.setPointerCapture(e.pointerId); c.style.cursor='grabbing'; });
        c.addEventListener('pointermove',e=>{ if(drag) ang=drag.a+(e.clientX-drag.x)*0.012; });
        const up=()=>{ drag=null; c.style.cursor='grab'; }; c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up); }
      if(!raf) raf=requestAnimationFrame(frame); }
    function stop(){ if(raf) cancelAnimationFrame(raf); raf=0; cv=null; }
    return {start,stop,get angle(){ return ang; }}; })();
  // trying a piece on (the smithy): worn for the preview only, until bought or the menu closes
  function tryOn(slot,id){ if(typeof ENGINE==='undefined'||!ENGINE.K) return; wear(ENGINE.K,slot,id); }
  const H={V,surf,weld,twoSide,band,sweep,bez,facetSphere,tri,piece,mesh,bounds};
  return { preview, tryOn, shop:false, tick, SLOTS, NAMES, PIECES, TREES, TIER, H, set, wear, worn, dress, apply, covered, earned, options, pick };
})();
