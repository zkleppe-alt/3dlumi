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
  const NAMES={helm:'Great helm',plume:'Plume',cowl:'Hood',tabard:'Tabard & breastplate',belt:'Belt & pouches',skirt:'Skirt',pauldrons:'Pauldrons',arms:'Vambraces',gauntlets:'Gauntlets',legs:'Greaves & cuisses',sabatons:'Sabatons'};

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
  let HEFT=0; const setHeft=h=>{ HEFT=h||0; };   /* V264: a set's weight — heavier sets stand their plate further off the body (recipes set it while building) */
  /* V259: before the body is measured, its skeleton is posed from the knight's joints now (BODY3's sync) — at load the armour can be
     built before the body has been posed once, and the body's arms were measured in its T-pose: plates out sideways, behind his back */
  function bodySync(K){ const F=K&&K.userData.b3; if(F&&typeof F==='object'&&F.sync){ try{ F.sync(); }catch(e){} } if(K) K.updateMatrixWorld(true); }
  function bodyRings(K,pivot,regs,y0,y1,NY,NA,box){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||!F.body.boneTransform) return null; bodySync(K);
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
  /* V261: THE HELM KIT. The head measured (its box from the posed body, in the head joint's frame); a style is laid over it: 'great'
     (the Templar's great helm, now sized to his head), 'kettle' (a brimmed war-hat, the face open), 'sallet' (rounded, a sweeping tail,
     a visor), 'bascinet' (pointed, the face open, a mail aventail), 'coif' (a mail hood). ── */
  function headBox(K,gap){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||!F.body.boneTransform) return null; bodySync(K); const hd=K.rig.head, body=F.body, R=F.D.reg, P=body.geometry.attributes.position; body.skeleton.update();
    const pts=[]; for(let q=0;q<P.count;q++){ if(R[q]!=='head') continue; body.boneTransform(q,_bv); _bv.applyMatrix4(body.matrixWorld); hd.worldToLocal(_bv); if(_bv.length()>0.3) continue; pts.push(_bv.clone()); }
    if(pts.length<40) return null; const ys=pts.map(p=>p.y).sort((a,b)=>a-b), y0=ys[Math.floor(ys.length*0.02)], y1=ys[ys.length-1], H=y1-y0, sk=pts.filter(p=>p.y>y0+0.3*H);   // the skull, above the jaw
    const b=new THREE.Box3().setFromPoints(sk); b.min.y=y0; b.max.y=y1; b.expandByScalar((gap||0)+HEFT*0.008); return b; }
  T.helm=function(ctx){ const K=ctx.K; K._helmFit=null; if(K._armFit!==false&&!ctx.style0){ const hb=headBox(K,0.018); if(hb){ ctx.headBox=hb; } } return T.helmGreat(ctx); };
  function helmKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, GD=o.trim||M.goldD||M.gold, ST=o.steel||M.helm||M.steel, MA=leatherM(K,0x6a6e74), LA=leatherM(K,0x2e2018), hb=headBox(K,0.016); if(!hb) return false; K._helmFit=null;
    const head=K.rig.head, g=piece(ctx,head); g.userData.fitted=true; const c=hb.getCenter(new THREE.Vector3()), XR=(hb.max.x-hb.min.x)/2, ZR=(hb.max.z-hb.min.z)/2, YB=hb.min.y, YT=hb.max.y, H=YT-YB;
    const at=(ph,y,k)=>V(c.x+XR*k*Math.sin(ph),y,c.z+ZR*k*Math.cos(ph));
    const dome=(y0,yTop,k0,mat,part,face)=>mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, a=v*Math.PI/2, k=k0*Math.cos(a), y=y0+(yTop-y0)*Math.sin(a), fy=face?face(ph):y0; return at(ph,v===0?Math.max(y0,fy):y,k); },28,8,{smooth:true,two:0.004}),mat,part);
    const band2=(y,w,k,mat,part)=>mesh(g,surf((u,v)=>at(-Math.PI+u*Math.PI*2,y+w*v,k),32,1,{two:0.002}),mat,part);
    const brow=YB+0.62*H, chin=YB+0.12*H;
    if(style==='kettle'){ dome(brow-0.01,YT+0.012,1.02,ST,'helm'); band2(brow-0.012,0.012,1.05,GD,'gold');
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, k=1.04+0.5*v; return at(ph,brow-0.012-0.03*v,k); },32,2,{smooth:true,two:0.004}),ST,'helm');   // the brim, sloping down
      mesh(g,surf((u,v)=>at(-Math.PI+u*Math.PI*2,brow-0.042-0.006*v,1.54),40,1,{two:0.002}),GD,'gold');
      mesh(g,surf((u,v)=>{ const ph=-0.1+0.2*u; return at(ph,brow+(YT+0.01-brow)*v,1.03*Math.cos(v*Math.PI/2)+0.01); },2,6,{two:0.002}),GD,'gold'); }   // a ridge over the crown
    if(style==='sallet'){ const tail=ph=>{ const b=Math.max(0,-Math.cos(ph)); return 0.1*b*b; };
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, a=v*Math.PI/2, k=1.02*Math.cos(a)+0.0, yb=YB+0.3*H+0.03-tail(ph)*0.5, y=yb+(YT+0.014-yb)*Math.sin(a), kk=k+(v<0.4?tail(ph)*(0.4-v)*3:0); return at(ph,y,Math.max(0.02,kk)); },28,9,{smooth:true,two:0.004}),ST,'helm');
      mesh(g,surf((u,v)=>{ const ph=-0.95+1.9*u; return at(ph,brow-0.01+v*0.014,1.06); },16,1,{two:0.002}),M.visor||new THREE.MeshBasicMaterial({color:0x07080c}),'slit');   // the sight
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2; return at(ph,YB+0.3*H+0.03-tail(ph)*0.5+v*0.01,1.05+tail(ph)*1.2); },40,1,{two:0.002}),GD,'gold'); }
    if(style==='bascinet'){ mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, k=1.02*Math.pow(1-v,0.75), y0=ph=>Math.abs(ph)<1.0?brow-0.005:chin, yb=y0(ph), y=yb+(YT+0.05-yb)*v; return at(ph,y,k+0.002); },28,9,{smooth:true,two:0.004}),ST,'helm');   // pointed, the face open
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, yb=Math.abs(ph)<1.0?brow-0.005:chin; return at(ph,yb+v*0.01,1.05); },40,1,{two:0.002}),GD,'gold');
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=chin+0.005-(0.1+0.02*Math.max(0,-Math.cos(ph)))*v; return at(ph,y,1.06+0.22*v); },28,4,{smooth:true,two:0.004}),MA,'mail'); }   // the aventail
    if(style==='coif'){ mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, a=v*Math.PI/2, open=Math.abs(ph)<0.85&&v<0.55, k=Math.cos(a)*0.98+0.02, yb=chin-0.04, y=open?brow+0.01+(YT-brow)*Math.max(0,(v-0.55)/0.45):yb+(YT+0.01-yb)*Math.sin(a); return at(ph,y,k); },30,9,{smooth:true,two:0.004}),MA,'mail');
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=chin-0.04-0.08*v; return at(ph,y,1.0+0.6*v); },28,3,{smooth:true,two:0.004}),MA,'mail');
      mesh(g,surf((u,v)=>at(-0.9+1.8*u,brow+0.005+v*0.01,1.03),16,1,{two:0.002}),LA,'leather'); }
    if(style==='barbute'){ mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, a=v*Math.PI/2, k=1.03*Math.cos(a)+0.0, yb=chin-0.01, y=yb+(YT+0.014-yb)*Math.sin(a); return at(ph,y,Math.max(0.02,k)); },28,9,{smooth:true,two:0.004}),ST,'helm');
      const DK=new THREE.MeshBasicMaterial({color:0x07080c,side:THREE.DoubleSide}); mesh(g,surf((u,v)=>at(-0.42+0.84*u,brow-0.03+v*0.03,1.045),12,1,{}),DK,'slit'); mesh(g,surf((u,v)=>at(-0.12+0.24*u,chin+(brow-0.03-chin)*v,1.045),3,4,{}),DK,'slit');   // the T
      if(o.rivets) for(let k=0;k<14;k++){ const ph=-Math.PI+k*Math.PI/7; if(Math.abs(ph)<0.5) continue; const r=mesh(g,facetSphere(0.006,0.006,0.006,6,4),GD,'gold'); r.position.copy(at(ph,chin+0.01,1.05)); }
      mesh(g,surf((u,v)=>at(-Math.PI+u*Math.PI*2,chin-0.012+v*0.012,1.055),36,1,{two:0.002}),GD,'gold'); }
    if(style==='turban'){ const CL=o.cloth||M.scarf||M.tunic, y0=brow-0.03, y1=YT+0.03;   // V263: one smooth wound cloth, rounded, its turns spiralling, fuller at the back
      mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, a=v*Math.PI/2, y=y0+(y1-y0)*Math.sin(a), wind=0.018*Math.pow(Math.max(0,Math.sin(ph+v*10)),2)*(1-v), full=1.12+0.06*Math.max(0,-Math.cos(ph)), k=(full+wind)*Math.pow(Math.cos(a),0.9); return at(ph,y-0.012*Math.max(0,Math.cos(ph))*(1-v),Math.max(0.03,k)); },40,10,{smooth:true,two:0.004}),CL,'cloth');
      mesh(g,surf((u,v)=>{ const ph=-1.15+2.3*u, k=1.06+0.012*Math.sin(v*Math.PI); return at(ph,chin-0.01+(brow-0.055-chin+0.01)*v,k); },18,4,{smooth:true,two:0.004}),o.wrap||CL,'cloth');   // the face wrapped below the eyes
      const tl=mesh(g,sweep(bez(at(Math.PI*0.75,brow+0.0,1.13),at(Math.PI*0.82,brow-0.06,1.2),at(Math.PI*0.88,chin-0.05,1.22),at(Math.PI*0.9,chin-0.14,1.2),7),0.028,0.006,4,t=>1-0.4*t),CL,'cloth'); tl.userData.soft=1; }
    ctx.top=V(c.x,YT+(style==='bascinet'?0.05:0.012),c.z-0.02); return true; }
  T.helmGreat=function(ctx){ const K=ctx.K, M=K.M, head=K.rig.head, g=piece(ctx,head); if(ctx.headBox) g.userData.fitted=true;
    const E=ctx.headBox||bounds(head,o=>/^(helm2|gold2|helm|visor|gold)$/.test(o.userData.part),[[-0.118,-0.136,-0.13],[0.118,0.19,0.144]]);
    const XR=Math.max(Math.abs(E.min.x),E.max.x)+0.004, ZR=(E.max.z-E.min.z)/2+0.002, CZ=(E.max.z+E.min.z)/2, YB=E.min.y-0.004, YT=E.max.y+0.002, H=YT-YB, YBR=YB+0.64*H, YEYE=YBR-0.04;
    const S=(ph,y,off)=>{ const v=(y-YB)/H, vb=(YBR-YB)/H; let k=v<vb?(v<0.12?1.04-0.04*v/0.12:1.0):Math.pow(Math.max(0,Math.cos((v-vb)/(1-vb)*Math.PI/2)),ctx.helmFlat?0.22:0.8);
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
  /* V256: the Templar's cowl is now his hood — the artist's hood (the plain one's) dyed navy; its old navy scarf rolls round the throat
     with the cuirass (T.tabard). Without the artist's files, the old cowl as before. */
  T.cowl=function(ctx){ const K=ctx.K; if(typeof OUTFIT3!=='undefined'&&OUTFIT3.baseReady&&OUTFIT3.baseReady(K)){ const g=piece(ctx,K.rig.torso); g.userData.garmentSlot='cowl'; g.userData.hoodTint='navy'; g.userData.fitted=true; g.hoodStyle={id:'templar',cloth:K.M.tunic,trim:K.M.gold,mark:K.M.cross||K.M.trim||K.M.gold,emblem:'jcross'}; hoodCowl(ctx,K.M.tunic,K.M.gold); return; }   /* V268: in the tabard's navy, gold-edged, the cross on the back */ return T.cowl0(ctx); };
  T.cowl0=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), SC=M.scarf||M.tunic;
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
  /* V256: THE CUIRASS UNDER THE TABARD (Zak's breastplate reference). A breastplate and backplate as one shell slid on over the head,
     made from his own torso (bodyRings): high at the throat front and back, cut away under the arms, a little flared at the waist, a keel
     down the breast, gold-edged; strapped at the sides in leather. The navy scarf of the reference rolled round the throat. Over it the
     tabard: a front and a back panel of navy hanging from the shoulders past the hips — so the steel shows at the shoulders and the
     sides — gold down their edges, a scalloped hem, the Jerusalem cross on the breast. ── */
  T.tabard=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, GD=M.goldD||M.gold;
    const TR=bodyRings(K,to,['chest','belly','pelvis','thigh'],-0.12,0.64,19,32,0.32), NR=bodyRings(K,to,['head'],0.6,0.7,3,16,0.16);
    if(!TR||K._cuirass===false) return T.tabard0(ctx);
    const g=piece(ctx,to); g.userData.fitted=true; const style=ctx.torsoStyle||'templar', plate=style==='templar'||style==='cuirass';   /* V261: the torso kit */
    const yB=0.2, yS=0.47, yF=0.595, yBk=0.615;   // the plate's foot, the armholes, the throat in front and behind
    const top=ph=>{ const c=Math.abs(Math.cos(ph)), f=Math.cos(ph)>0?yF:yBk; return yS+(f-yS)*Math.pow(c,1.6); };
    const smoothR=(ph,y)=>{ let s=0; for(const d of [-0.2,-0.1,0,0.1,0.2]) s+=TR.r(ph+d,y)*(d===0?2:1); return s/6; };   // plate doesn't follow every muscle
    const keel=ph=>0.008*Math.max(0,1-Math.abs(Math.atan2(Math.sin(ph),Math.cos(ph)))/0.3);
    const chestB=(ph,y)=>(plate?0.02:0.006)*Math.max(0,Math.cos(ph))*Math.exp(-Math.pow((y-0.4)/0.11,2));   /* V271: a fuller plate — domed over the breast, standing further off the body */
    const R=(ph,y,o)=>smoothR(ph,Math.max(yB,y))+0.014+(plate?0.016:0.006)+HEFT*0.02+chestB(ph,y)+keel(ph)*(y>0.3?1:0)+0.012*Math.max(0,(0.26-y)/0.06)+(o||0);
    const at=(ph,y,o)=>{ const [cx,cz]=TR.c(Math.max(yB,Math.min(0.6,y))), r=R(ph,y,o); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); };
    const pl=surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=yB+(top(ph)-yB)*v; return at(ph,y); },40,12,{smooth:true,two:0.004});
    const rib=(fn,n,mat,part,w)=>mesh(g,surf((u,v)=>fn(u,v),n,1,{two:0.002}),mat,part);
    if(!plate){ clothTorso(ctx,g,style,TR,NR); return; }
    mesh(g,pl,M.steel,'steel');
    rib((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=top(ph)-0.016+v*0.016; return at(ph,y,0.004); },64,GD,'gold');   // the gilt edge round the throat and the armholes
    rib((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=yB+v*0.016; return at(ph,y,0.004); },48,GD,'gold');             // and round the foot
    [-1,1].forEach(sd=>[0.3,0.39].forEach(y=>{ const ph=sd*Math.PI/2, m=mesh(g,new THREE.BoxGeometry(0.012,0.022,0.07).toNonIndexed(),M.boot,'leather'); m.position.copy(at(ph,y,0.006)); m.rotation.y=ph;   // side straps and buckles
      const bk=mesh(g,new THREE.BoxGeometry(0.008,0.026,0.018).toNonIndexed(),GD,'gold'); bk.position.copy(at(ph,y,0.012)); bk.rotation.y=ph; }));
    // the scarf: navy, rolled round the throat and lying on the plate's top
    if(NR){ const [nx,nz]=NR.c(0.63), SC=M.scarf||M.tunic, y0=0.575, y1=0.66;
      mesh(g,band((ph,y)=>{ const v=(y-y0)/(y1-y0); return NR.r(ph,0.63)+0.022+0.03*Math.pow(1-v,1.5)+0.006*Math.sin(ph*6+v*4); },-Math.PI,Math.PI,y0,y1,36,5,{cx:nx,cz:nz,smooth:true,two:0.004}),SC,'scarf'); }
    if(style==='cuirass'){ ctx.R=(ph,y)=>R(ph,y); ctx.ZK=1; ctx.CZ=TR.c(0.3)[1]; return; }
    // the tabard: front and back panels over the plate, hanging past the hips
    // V259: the front panel runs on down to the skirt's hem as one cloth (it stands for the skirt's centre panel, hidden while it's worn:
    //  skirtSync); below the belt both panels hang and swing as cloth (userData.soft, pinned above clothPin)
    const yHF=-0.3, yHB=-0.14, yPin=0.07, tabR=(ph,y,yH)=>R(ph,y,0.01+(y<yB?0.03*Math.pow((yB-y)/(yB-yH),1.3):0)), TW=0.78, TS=M.tunic;
    const atT=(ph,y,o,yH)=>{ const [cx,cz]=TR.c(Math.max(yB,Math.min(0.6,y))), r=tabR(ph,y,yH)+(o||0); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); };
    const cl=m=>{ m.userData.soft=1; m.userData.clothPin=yPin; return m; };
    [0,Math.PI].forEach(c=>{ const yt=ph=>Math.min(top(ph),c?yBk:yF)+0.004, yH=c?yHB:yHF, A=(ph,y,o)=>atT(ph,y,o,yH), nv=c?14:20;
      cl(mesh(g,surf((u,v)=>{ const ph=c-TW+2*TW*u, y=yH+(yt(ph)-yH)*v; return A(ph,y); },16,nv,{smooth:true,two:0.003}),TS,'tunic'));
      [-1,1].forEach(sd=>cl(rib((u,v)=>{ const ph=c+sd*(TW-0.03)+(v-0.5)*0.05, y=yH+0.02+(yt(c+sd*TW)-yH-0.03)*u; return A(ph,y,0.003); },nv,GD,'gold')));   // gold down its edges
      cl(rib((u,v)=>{ const ph=c-TW+2*TW*u, sc=(c?0.024:0.03)*tri(u*(c?6:5)); return A(ph,yH+v*(0.02+sc),0.004); },36,GD,'gold'));   // the dagged hem
      rib((u,v)=>{ const ph=c-TW+2*TW*u; return A(ph,yt(ph)-0.018+v*0.016,0.003); },18,GD,'gold'); });   // the neckline
    g.userData.longFront=true;
    jerusalem(g,M.cross||GD,TR.c(0.42)[0],0.4,0.82,(x,y)=>{ const [cx,cz]=TR.c(y), r=tabR(0,y,yHF); return cz+Math.sqrt(Math.max(0,r*r-(x-cx)*(x-cx))); });
    ctx.R=(ph,y)=>tabR(ph,y,yHF); ctx.ZK=1; ctx.CZ=TR.c(0.3)[1]; };
  // a cloth or mail coat laid on the torso: 'gambeson' (quilted, to the hips), 'jerkin' (leather, laced down the front), 'hauberk' (mail
  //  to mid-thigh, split front and back); below the belt it hangs and swings as cloth
  function clothTorso(ctx,g,style,TR,NR){ const K=ctx.K, M=K.M, o=ctx.torsoOpts||{}, GD=o.trim||M.goldD||M.gold, MAT=o.cloth||(style==='gambeson'?leatherM(K,0xbfae8a):style==='jerkin'||style==='brigandine'?leatherM(K,0x6e4a2c):style==='robe'?M.tunic:leatherM(K,0x6a6e74)), LA=o.leather||leatherM(K,0x2e2018), SE=o.seam||leatherM(K,0x8c7c5c);
    const yN=0.585, yH=o.hem!==undefined?o.hem:style==='hauberk'||style==='scale'?-0.26:style==='robe'?-0.62:style==='gambeson'?-0.08:0.0, yPin=0.07, gap=style==='hauberk'?0.008:style==='scale'?0.012:0.014;
    const smoothR=(ph,y)=>{ let s2=0; for(const d of [-0.18,-0.09,0,0.09,0.18]) s2+=TR.r(ph+d,y)*(d===0?2:1); return s2/6; };
    const at=(ph,y,o)=>{ const yy=Math.max(-0.1,Math.min(0.6,y)), [cx,cz]=TR.c(yy), r=smoothR(ph,yy)+gap+(o||0)+(y<0.12?(style==='robe'?0.055:0.03)*Math.pow(Math.max(0,(0.12-y)/0.4),1.1):0);   /* a robe falls fuller */ return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); };
    const top=ph=>{ const c=Math.cos(ph); return 0.47+(yN-0.47)*Math.pow(Math.abs(c),1.4)-(c>0?0.02:0); };   // the armholes and the neck
    const split=style==='hauberk'?(ph,y)=>y<0.02&&(Math.abs(Math.sin(ph))<0.05):()=>false;
    const body=mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=yH+(top(ph)-yH)*v; return at(ph,y); },40,14,{smooth:true,two:0.004}),MAT,style==='hauberk'?'mail':'cloth'); body.userData.soft=1; body.userData.clothPin=yPin;
    const rib=(fn,n,mat,part)=>mesh(g,surf((u,v)=>fn(u,v),n,1,{two:0.002}),mat,part);
    if(style==='gambeson'){ for(let k=1;k<9;k++){ const y=yH+(0.5-yH)*k/9; rib((u,v)=>at(-Math.PI+u*Math.PI*2,y+v*0.004,0.003),40,SE,'cloth'); } for(let k=0;k<12;k++){ const ph=-Math.PI+k*Math.PI/6; rib((u,v)=>at(ph+(v-0.5)*0.02,yH+0.02+(0.46-yH)*u,0.003),10,SE,'cloth'); } }   // the quilting
    if(style==='jerkin'){ for(let k=0;k<6;k++){ const y=0.12+k*0.07; rib((u,v)=>at(-0.12+0.24*u,y+v*0.005,0.004),4,LA,'leather'); } rib((u,v)=>at(-0.01+0.02*v,yH+(yN-yH)*u,0.003),12,LA,'leather'); }   // laced down the front
    if(style==='hauberk'){ rib((u,v)=>at(-Math.PI+u*Math.PI*2,yH+v*0.012,0.004),48,LA,'leather').userData.soft=1; }
    if(style==='scale'){ for(let k=0;k<12;k++){ const y=yH+0.01+(0.52-yH)*k/12; const m=rib((u,v)=>{ const ph=-Math.PI+u*Math.PI*2; return at(ph,y+(0.045-0.022*tri(u*28))*(1-v)*0-0.022*tri(u*28)*v+v*0.0,0.004+0.004*v); },56,o.scale||MAT,'steel'); if(y<0.07) m.userData.soft=1; } }   // rows of scales, each row lapping the one below
    if(style==='brigandine'){ for(let r=0;r<6;r++) for(let k=0;k<14;k++){ const y=0.12+r*0.065, ph=-Math.PI+(k+0.5*(r%2))*Math.PI/7; if(y>top(ph)-0.03) continue; const st=mesh(g,facetSphere(0.007,0.007,0.004,6,4),GD,'gold'); st.position.copy(at(ph,y,0.003)); st.lookAt(st.position.clone().add(V(Math.sin(ph),0,Math.cos(ph)))); } }   // the rivets of its plates
    if(style==='robe'){ const ST2=o.stole||GD; [-1,1].forEach(sd=>{ const m=rib((u,v)=>at(sd*0.22+(v-0.5)*0.12,yH+0.02+(0.55-yH)*u,0.006),24,ST2,'scarf'); m.userData.soft=1; m.userData.clothPin=yPin; });   // the stole, down the front
      const hm=rib((u,v)=>at(-Math.PI+u*Math.PI*2,yH+v*0.014,0.005),64,GD,'gold'); hm.userData.soft=1; hm.userData.clothPin=yPin; }
    rib((u,v)=>{ const ph=-Math.PI+u*Math.PI*2; return at(ph,top(ph)-0.014+v*0.014,0.004); },64,style==='hauberk'?LA:SE,'cloth');   // its edges
    if(NR&&style!=='jerkin'){ const [nx,nz]=NR.c(0.63), y0=0.57, y1=0.65; mesh(g,band((ph,y)=>{ const v=(y-y0)/(y1-y0); return NR.r(ph,0.63)+0.02+0.025*Math.pow(1-v,1.5); },-Math.PI,Math.PI,y0,y1,32,4,{cx:nx,cz:nz,smooth:true,two:0.004}),MAT,'cloth'); }   // a collar
    ctx.R=(ph,y)=>smoothR(ph,y)+gap; ctx.ZK=1; ctx.CZ=TR.c(0.3)[1]; }
  // V261: THE SKIRT KIT, hung from the waist (measured round the hips) and swinging as cloth: 'tassets' (steel lames over each thigh),
  //  'mail' (a mail skirt), 'kilt' (pleated cloth)
  function skirtKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, to=K.rig.torso, GD=o.trim||M.goldD||M.gold, ST=o.steel||M.steel, MA=leatherM(K,0x6a6e74), LA=leatherM(K,0x2e2018);
    const TR=bodyRings(K,to,['pelvis','thigh'],-0.25,0.12,10,32,0.32); if(!TR) return false; const g=piece(ctx,to); g.userData.fitted=true;
    const yT=0.07, sm=(ph,y)=>{ let s2=0; for(const d of [-0.2,-0.1,0,0.1,0.2]) s2+=TR.r(ph+d,y)*(d===0?2:1); return s2/6; };
    const at=(ph,y,o2)=>{ const yy=Math.max(-0.25,Math.min(0.12,y)), [cx,cz]=TR.c(Math.min(yT,yy)), r=sm(ph,Math.max(yy,-0.02))+(o2||0)+HEFT*0.022+(0.045+HEFT*0.01)*Math.max(0,(yT-y)/0.3); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); };   // flaring a little as it falls
    const soft=m=>{ m.userData.soft=1; m.userData.clothPin=yT-0.005; return m; };
    if(style==='tassets'){ const NL=o.lames||4; [-1,1].forEach(sd=>{ const c=sd*0.55; for(let k=0;k<NL;k++){ const y1=yT-k*0.06, y0=y1-0.075, gp=0.03+k*0.005;
        soft(mesh(g,surf((u,v)=>{ const ph=c-0.55+1.1*u, y=y0+(y1-y0)*v; return at(ph,y,gp); },10,2,{smooth:true,two:0.004}),ST,'steel'));
        soft(mesh(g,surf((u,v)=>{ const ph=c-0.55+1.1*u; return at(ph,y0+0.01*v,gp+0.004); },12,1,{two:0.002}),GD,'gold')); } }); }
    if(style==='mail'){ soft(mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=-0.2+(yT+0.01+0.2)*v; return at(ph,y,0.03); },36,8,{smooth:true,two:0.004}),MA,'mail'));
      soft(mesh(g,surf((u,v)=>at(-Math.PI+u*Math.PI*2,-0.2+v*0.012,0.034),48,1,{two:0.002}),LA,'leather')); }
    if(style==='kilt'){ const CL=o.cloth||M.tunic; soft(mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=-0.18+(yT+0.01+0.18)*v; return at(ph,y,0.03+0.008*Math.abs(Math.sin(ph*12))*(1-v)); },72,7,{smooth:true,two:0.004}),CL,'tunic'));   // pleated
      soft(mesh(g,surf((u,v)=>at(-Math.PI+u*Math.PI*2,-0.18+v*0.012,0.04),72,1,{two:0.002}),GD,'gold')); }
    g.userData.longFront=false; return true; }
  T.tabard0=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=M.goldD||M.gold;
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
  T.belt=function(ctx){ if(ctx.K._armFit!==false&&beltKit(ctx,'sword',{strap:0x3a2414,gear:['pouch@-1.0','pouch@-2.2','dagger@2.5']})) return; return T.belt0(ctx); };   /* V269: the Templar's sword belt from the kit, over the tabard */
  T.belt0=function(ctx){ const K=ctx.K, M=K.M, to=K.rig.torso, g=piece(ctx,to), GD=M.goldD||M.gold;
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
    panel(F,-0.62,0.62,0.205,0.262,LF*0.9,3,0.06,zF,true).userData.centre=true;   // the centre, longest, its middle point lowest (the long tabard stands in for it)
    [-1,1].forEach(sd=>panel(F,sd>0?0.5:-1.5,sd>0?1.5:-0.5,0.198,0.252,LF*0.78,3,0.05,zF*0.98));   // the sides, a little behind it
    panel(B,Math.PI-1.3,Math.PI+1.3,0.205,0.262,LB*0.9,5,0.055,Math.max(0.7,-EB.min.z/0.262));
    { const g=ctx.groups[0], s=new THREE.Shape(); s.moveTo(0,0.02); s.lineTo(0.016,0); s.lineTo(0,-0.03); s.lineTo(-0.016,0); s.closePath();   // the gilt point
      const m=mesh(g,new THREE.ExtrudeGeometry(s,{depth:0.005,bevelEnabled:false}).toNonIndexed(),GD,'gold'); m.geometry.computeVertexNormals(); m.position.set(0,-LF*0.9+0.03,zF*(0.205+(0.262-0.205)*0.9)*1+0.004); } };

  // ── PAULDRONS: a faceted dome over each shoulder, its rim and two lames below it edged in gold, a gilt boss on the outer face ──
  T.pauldrons0=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
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
  /* V256: the arm plates made from his own arms (bodyRings, as the greaves): a rerebrace closed round the upper arm from under the
     pauldron to above the elbow, a vambrace closed round the forearm from below the elbow to the wrist — each a clean plate a hair over
     the arm, gold at its ends, a point on the vambrace's top; the couter cupped over the elbow ── */
  function regY(K,pivot,regs,box){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||!F.body.boneTransform) return null; const body=F.body, R=F.D.reg, P=body.geometry.attributes.position, ok=new Set(regs), ys=[];
    bodySync(K); body.skeleton.update(); for(let q=0;q<P.count;q++){ if(!ok.has(R[q])) continue; body.boneTransform(q,_bv); _bv.applyMatrix4(body.matrixWorld); pivot.worldToLocal(_bv); if(Math.abs(_bv.x)>box||Math.abs(_bv.z)>box||Math.abs(_bv.y)>0.5) continue; ys.push(_bv.y); }
    if(ys.length<30) return null; ys.sort((a,b)=>a-b); return [ys[Math.floor(ys.length*0.03)],ys[Math.floor(ys.length*0.97)]]; }
  // the limb's own axis: the body's points of that region (in the joint's frame), their mean and main direction (from the joint outward);
  //  a frame set on it whose -y runs down the limb, so rings can be measured square to the limb whatever the joint's own axes are
  function limbFrame(K,pivot,regs,g){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||!F.body.boneTransform) return null; const body=F.body, R=F.D.reg, P=body.geometry.attributes.position, ok=new Set(regs), pts=[];
    bodySync(K); body.skeleton.update(); for(let q=0;q<P.count;q++){ if(!ok.has(R[q])) continue; body.boneTransform(q,_bv); _bv.applyMatrix4(body.matrixWorld); pivot.worldToLocal(_bv); if(_bv.length()>0.45) continue; pts.push(_bv.clone()); }
    if(pts.length<40) return null; const m=new THREE.Vector3(); pts.forEach(p=>m.add(p)); m.divideScalar(pts.length);
    const C=[0,0,0,0,0,0,0,0,0]; pts.forEach(p=>{ const d=[p.x-m.x,p.y-m.y,p.z-m.z]; for(let a=0;a<3;a++) for(let b=0;b<3;b++) C[a*3+b]+=d[a]*d[b]; });
    let d=new THREE.Vector3(0,-1,0); for(let it=0;it<30;it++){ const x=C[0]*d.x+C[1]*d.y+C[2]*d.z, y=C[3]*d.x+C[4]*d.y+C[5]*d.z, z=C[6]*d.x+C[7]*d.y+C[8]*d.z; d.set(x,y,z).normalize(); }
    { const pp=pivot.parent, toPar=pp?pivot.worldToLocal(pp.getWorldPosition(new THREE.Vector3())):null;
      if(toPar&&toPar.length()>0.02&&(regs.includes('hand')||regs.includes('forearm'))){ if(d.dot(toPar)>0) d.negate(); }   /* V266: a hand or forearm points away from the joint above it (the point-sum flipped gloves backwards) */
      else { let sum=0; pts.forEach(p=>{ sum+=p.dot(d); }); if(sum<0) d.negate(); } }   // outward, from the joint toward the limb's end (by where its points lie)
    const o=m.clone().addScaledVector(d,-m.dot(d)), f=new THREE.Group(); f.userData.armor=g.userData.armor; f.position.copy(o); f.quaternion.setFromUnitVectors(V(0,-1,0),d); g.add(f); f.updateMatrixWorld(true);
    const ts=pts.map(p=>p.clone().sub(o).dot(d)).sort((a,b)=>a-b); return {f,t0:ts[Math.floor(ts.length*0.04)],t1:ts[Math.floor(ts.length*0.96)]}; }
  /* V261: THE ARM AND HAND KIT (as the leg kit): each segment found along its own axis (limbFrame — the body's arms don't run down their
     joints) and measured ring by ring; a style is a recipe laid on it. Arms: 'plate' (rerebrace, couter, vambrace), 'vambraces' (forearm
     plate and couter), 'bracers' (laced leather on the forearm), 'mail' (mail sleeves). Hands: 'gauntlet' (steel mitten-gauntlet in lames,
     a flared cuff), 'gloves' (leather), 'wraps' (linen bands). ── */
  function armSeg(K,pivot,regs,g,cutTop,cutEnd){ const L=limbFrame(K,pivot,regs,g); if(!L) return null; const y1=-L.t0-(cutTop||0), y0=-L.t1+(cutEnd||0), RR=bodyRings(K,L.f,regs,y0,y1,8,20,0.13); if(!RR) return null;
    const sm=(ph,y)=>{ let s2=0; for(const d of [-0.3,-0.15,0,0.15,0.3]) s2+=RR.r(ph+d,y)*(d===0?2:1); return s2/6; };
    const hf=HEFT*0.011; return {f:L.f,y0,y1,RR,sm,at:(ph,y,gap)=>{ const yy=Math.max(y0,Math.min(y1,y)), [cx,cz]=RR.c(yy), r=sm(ph,yy)+Math.max(0.003,gap+hf); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); }}; }
  const ring=(Sg,y,w,gap,mat,part,p0,p1)=>mesh(Sg.f,surf((u,v)=>Sg.at((p0===undefined?-Math.PI:p0)+((p1===undefined?Math.PI:p1)-(p0===undefined?-Math.PI:p0))*u,y+w*v,gap),24,1,{two:0.002}),mat,part);
  const tube=(Sg,y0,y1,gap,mat,part,flare,nv)=>mesh(Sg.f,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=y0+(y1-y0)*v; return Sg.at(ph,y,gap+(flare?flare(v,ph):0)); },22,nv||6,{smooth:true,two:0.003}),mat,part);
  function undo(ctx,made){ made.forEach(g=>{ if(g.parent) g.parent.remove(g); const i2=ctx.groups.indexOf(g); if(i2>=0) ctx.groups.splice(i2,1); }); }
  function armKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, GD=o.trim||M.goldD||M.gold, ST=o.steel||M.steel, LE=o.leather||leatherM(K,0x5b3b22), MA=o.mail||leatherM(K,0x55595f), LA=leatherM(K,0x2e2018);
    const made=[]; let ok=true;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ if(!ok) return; const g1=piece(ctx,A.sh), g2=piece(ctx,A.el); g1.userData.fitted=g2.userData.fitted=true; made.push(g1,g2);
      const U=armSeg(K,A.sh,['upperarm'],g1,0.035,0.035), F=armSeg(K,A.el,['forearm'],g2,0.03,0.022); if(!U||!F){ ok=false; return; }
      const couter=()=>{ const er=F.sm(Math.PI,F.y1)+0.012, top=F.y1+0.02, [ex,ez]=F.RR.c(F.y1);
        const cp=mesh(F.f,facetSphere(er*0.85,er*0.8,er*0.65,8,5,0,Math.PI*0.55),ST,'steel'); cp.position.set(ex,top,ez-er*0.5); cp.rotation.x=-Math.PI/2;
        const rim=mesh(F.f,new THREE.TorusGeometry(er*0.8,0.005,4,12).toNonIndexed(),GD,'gold'); rim.position.set(ex,top,ez-er*0.52);
        const fan=mesh(F.f,facetSphere(er*0.7,er*0.65,0.011,8,4),ST,'steel'); fan.position.set(ex+sd*er*0.9,top,ez-er*0.1); fan.rotation.y=sd*0.5; };
      const plated=(Sg,y0,y1,gap,flare)=>{ tube(Sg,y0,y1,gap,ST,'steel',flare); ring(Sg,y0,0.012,gap+0.004+flare(0,0),GD,'gold'); ring(Sg,y1-0.012,0.012,gap+0.004+flare(1,0),GD,'gold'); };
      if(style==='plate'){ plated(U,U.y0,U.y1,0.009,v=>0.006*v); ring(U,(U.y0+U.y1)/2,0.008,0.015,GD,'gold'); }
      if(style==='plate'||style==='vambraces'){ plated(F,F.y0,F.y1,0.008,v=>0.008*v*v); couter();
        { const s2=new THREE.Shape(); s2.moveTo(-0.02,0); s2.lineTo(0.02,0); s2.lineTo(0,0.026); s2.closePath(); const m=mesh(F.f,new THREE.ExtrudeGeometry(s2,{depth:0.005,bevelEnabled:false}).toNonIndexed(),GD,'gold'); m.geometry.computeVertexNormals();
          const ph=sd*Math.PI/2, p2=F.at(ph,F.y1-0.004,0.012); m.position.copy(p2); m.lookAt(p2.clone().add(V(Math.sin(ph),0,Math.cos(ph)))); m.rotateX(-Math.PI/2); } }   // the point on its top
      if(style==='bracers'){ const y0=F.y0, y1=F.y0+(F.y1-F.y0)*0.72; tube(F,y0,y1,0.008,LE,'leather',v=>0.006*v);
        ring(F,y0,0.008,0.013,LA,'leather'); ring(F,y1-0.008,0.008,0.013+0.006,LA,'leather');
        for(let k=0;k<4;k++){ const y=y0+0.02+(y1-y0-0.04)*k/3; ring(F,y,0.004,0.016+0.006*(y-y0)/(y1-y0),LA,'leather',-sd*Math.PI/2-0.25,-sd*Math.PI/2+0.25); } }   // the lacing, on the inside of the arm
      if(style==='mail'){ tube(U,U.y0-0.02,U.y1+0.02,0.006,MA,'mail',null,6); tube(F,F.y0+0.04,F.y1+0.03,0.006,MA,'mail',v=>0.004*v,6); ring(F,F.y0+0.04,0.01,0.01,LA,'leather'); }
    });
    if(!ok){ undo(ctx,made); return false; } return true; }
  function handKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, GD=o.trim||M.goldD||M.gold, ST=o.steel||M.steel, LE=o.leather||leatherM(K,0x4a3020), LI=leatherM(K,0xcbb896), LA=leatherM(K,0x2e2018);
    const made=[]; let ok=true;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ if(!ok) return; const g=piece(ctx,A.hand); g.userData.fitted=true; made.push(g);
      const H=armSeg(K,A.hand,['hand'],g,-0.006,0.0); if(!H){ ok=false; return; } const L=H.y1-H.y0, kn=H.y1-L*0.45;   // the knuckles, about halfway down
      if(style==='gauntlet'){ tube(H,kn-0.012,H.y1,0.008,ST,'steel',(v)=>0.002*v,5);   // the back and palm, to the knuckles
        for(let k=0;k<3;k++){ const ya=kn-0.012-k*(L*0.16), yb=ya+L*0.17; tube(H,ya-L*0.16,yb-L*0.16,0.007-k*0.001,ST,'steel',null,2); ring(H,ya-L*0.16,0.005,0.009-k*0.001,GD,'gold'); }   // the finger lames
        const cy=H.y1, cg=0.012; mesh(H.f,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2; return H.at(ph,cy+0.055*v,cg+0.022*v); },22,3,{smooth:true,two:0.003}),ST,'steel');   // the flared cuff, over the wrist
        ring(H,cy+0.05,0.008,cg+0.026,GD,'gold'); ring(H,cy-0.004,0.008,0.012,GD,'gold'); }
      if(style==='gloves'){ tube(H,H.y0-0.006,H.y1,0.005,LE,'leather',null,6); mesh(H.f,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2; return H.at(ph,H.y1+0.03*v,0.007+0.01*v); },22,2,{smooth:true,two:0.003}),LE,'leather'); ring(H,H.y1+0.026,0.006,0.019,LA,'leather'); }
      if(style==='wraps'){ for(let k=0;k<5;k++){ const y=H.y1+0.02-k*0.016; ring(H,y,0.011,0.004,LI,'cloth'); } }
    });
    if(!ok){ undo(ctx,made); return false; } return true; }
  /* V261: THE SHOULDER KIT. Round the ball of the shoulder (the top of the upper arm, in the arm's own joint frame) the body's surface is
     measured in every direction (elevation from straight up × the way round) and smoothed; a pauldron is a cap laid a gap over that,
     reaching further down the outside of the arm than over the chest, with lames below it on the outside. Styles: 'round' (dome, three
     lames, gold edges, a boss), 'spaulder' (lames only, down the outer arm), 'leather' (a stitched leather cap and a strap). ── */
  function shoulderShape(K,A,sd){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||!F.body.boneTransform) return null; bodySync(K); const body=F.body, R=F.D.reg, P=body.geometry.attributes.position; body.skeleton.update();
    const ua=[], all=[]; for(let q=0;q<P.count;q++){ const rg=R[q]; if(rg!=='upperarm'&&rg!=='chest') continue; body.boneTransform(q,_bv); _bv.applyMatrix4(body.matrixWorld); A.sh.worldToLocal(_bv); if(_bv.length()>0.3) continue; const p=_bv.clone(); all.push(p); if(rg==='upperarm') ua.push(p); }
    if(ua.length<30) return null; ua.sort((a,b)=>b.y-a.y); const top=ua.slice(0,Math.max(8,Math.floor(ua.length*0.25))), c=new THREE.Vector3(); top.forEach(p=>c.add(p)); c.divideScalar(top.length); c.y-=0.03;   // the ball's middle
    const NE=10, NA=20, EM=2.1, r=new Float32Array(NE*NA), bin=(d)=>{ const L=d.length()||1, el=Math.acos(Math.max(-1,Math.min(1,d.y/L))); if(el>=EM) return -1; return Math.min(NE-1,Math.floor(el/EM*NE))*NA+Math.floor(((Math.atan2(d.x,d.z)+Math.PI)/(Math.PI*2))*NA)%NA; };
    all.forEach(p=>{ const d=p.clone().sub(c), L=d.length(); if(L>0.16) return; const k=bin(d); if(k>=0&&L>r[k]) r[k]=L; });
    for(let pass=0;pass<NA;pass++){ let left=0; for(let e=0;e<NE;e++) for(let a=0;a<NA;a++){ const k=e*NA+a; if(r[k]) continue; const n=[r[e*NA+(a+1)%NA],r[e*NA+(a+NA-1)%NA],e>0?r[(e-1)*NA+a]:0,e<NE-1?r[(e+1)*NA+a]:0].filter(x=>x>0); if(n.length) r[k]=n.reduce((q,x)=>q+x,0)/n.length; else left++; } if(!left) break; }
    for(let it=0;it<3;it++){ const r2=r.slice(); for(let e=0;e<NE;e++) for(let a=0;a<NA;a++){ const k=e*NA+a, n=[r[e*NA+(a+1)%NA],r[e*NA+(a+NA-1)%NA],e>0?r[(e-1)*NA+a]:r[k],e<NE-1?r[(e+1)*NA+a]:r[k]]; r2[k]=Math.max(r[k],(r[k]*2+n.reduce((q,x)=>q+x,0))/6); } r.set(r2); }   // smooth, never inside the body
    const R2=(el,az)=>{ const fe=Math.max(0,Math.min(NE-1,el/EM*NE-0.5)), e0=Math.floor(fe), e1=Math.min(NE-1,e0+1), te=fe-e0, fa=((az+Math.PI)/(Math.PI*2))*NA-0.5, a0=((Math.floor(fa)%NA)+NA)%NA, a1=(a0+1)%NA, ta=fa-Math.floor(fa), v=(e,a)=>r[e*NA+a];
      return (v(e0,a0)*(1-ta)+v(e0,a1)*ta)*(1-te)+(v(e1,a0)*(1-ta)+v(e1,a1)*ta)*te; };
    const outAz=Math.atan2(sd,0);   // the outside of the arm (+x for the left)
    return {c,R2,at:(el,az,gap)=>{ const r0=R2(el,az)+gap+HEFT*0.018, se=Math.sin(el); return V(c.x+r0*se*Math.sin(az),c.y+r0*Math.cos(el),c.z+r0*se*Math.cos(az)); }, outAz}; }
  function shoulderKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, GD=o.trim||M.goldD||M.gold, ST=o.steel||M.paul||M.steel, LE=o.leather||leatherM(K,0x5b3b22), LA=leatherM(K,0x2e2018); const made=[]; let ok=true;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ if(!ok) return; const g=piece(ctx,A.sh); g.userData.fitted=true; made.push(g); const S=shoulderShape(K,A,sd); if(!S){ ok=false; return; }
      const reach=(az,full,inner)=>{ const c=Math.cos(az-S.outAz); return inner+(full-inner)*(0.5+0.5*c); };   // how far down: furthest on the outside
      const cap=(gap,full,inner,mat,part,el0)=>mesh(g,surf((u,v)=>{ const az=-Math.PI+u*Math.PI*2, el=(el0||0)+(reach(az,full,inner)-(el0||0))*v; return S.at(el,az,gap); },28,7,{smooth:true,two:0.004}),mat,part);
      const edge=(gap,full,inner,w,mat)=>mesh(g,surf((u,v)=>{ const az=-Math.PI+u*Math.PI*2, el=reach(az,full,inner)-w*(1-v); return S.at(el,az,gap+0.003); },40,1,{two:0.002}),mat,'gold');
      const lame=(k,gap,el0,el1,mat,part,trim)=>{ const a0=S.outAz-1.25, a1=S.outAz+1.25; mesh(g,surf((u,v)=>{ const az=a0+(a1-a0)*u, el=el0+(el1-el0)*v; return S.at(el,az,gap+0.004*v); },16,2,{smooth:true,two:0.004}),mat,part);
        if(trim) mesh(g,surf((u,v)=>{ const az=a0+(a1-a0)*u; return S.at(el1-0.04*(1-v),az,gap+0.008); },16,1,{two:0.002}),trim,'gold'); };
      if(style==='round'){ const gp=o.bulk!==undefined?o.bulk:0.03; cap(gp,1.1,0.8,ST,'steel'); edge(gp,1.1,0.8,0.07,GD);   // stands well off the shoulder, as a pauldron does
        for(let k=0;k<3;k++){ const e0=1.04+k*0.2, e1=e0+0.26; lame(k,gp+0.008*(k+1),e0,e1,ST,'steel',GD); }
        const b=mesh(g,new THREE.CylinderGeometry(0.016,0.016,0.008,10).toNonIndexed(),GD,'gold'), bp=S.at(0.55,S.outAz,gp+0.006); b.position.copy(bp); b.lookAt(bp.clone().add(bp.clone().sub(S.c))); b.rotateX(Math.PI/2); }
      if(style==='spiked'||style==='heavy'){ const gp=o.bulk!==undefined?o.bulk:0.04; cap(gp,1.15,0.85,ST,'steel'); edge(gp,1.15,0.85,0.07,GD);
        for(let k=0;k<4;k++){ const e0=1.08+k*0.19, e1=e0+0.25; lame(k,gp+0.009*(k+1),e0,e1,ST,'steel',GD); }
        if(style==='spiked'){ [[0.25,0],[0.55,0.5],[0.55,-0.5],[0.85,0.9],[0.85,-0.9]].forEach(([el,da],i)=>{ const az=S.outAz+da, p0=S.at(el,az,gp), n=p0.clone().sub(S.c).normalize(), c2=new THREE.ConeGeometry(0.014,i?0.06:0.08,5).toNonIndexed(); c2.computeVertexNormals(); const m=mesh(g,c2,o.spike||ST,'steel'); m.position.copy(p0).addScaledVector(n,0.02); m.quaternion.setFromUnitVectors(V(0,1,0),n.clone().add(V(0,0.6,0)).normalize()); }); }
        else { const hp=mesh(g,surf((u,v)=>{ const az=S.outAz+Math.PI+(u-0.5)*1.6; return S.at(0.05+0.35*(1-v),az,gp+0.05*v); },10,3,{smooth:true,two:0.004}),ST,'steel'); }   // the haute-piece, standing up toward the neck
      }
      if(style==='feather'){ const gp=0.014, CL=o.cloth||M.scarf||M.tunic, FE=[o.feather||leatherM(K,0xf3efe4),o.feather2||leatherM(K,0xdcd4c2)]; cap(gp,1.15,0.8,CL,'cloth');
        for(let row=0;row<4;row++) for(let i=0;i<9;i++){ const az=S.outAz-1.6+3.2*i/8+(row%2)*0.18, el=0.35+row*0.27, p0=S.at(el,az,gp+0.006+row*0.003), n=p0.clone().sub(S.c).normalize(); let f=new THREE.SphereGeometry(1,8,5); f.scale(0.02,0.05,0.004); f.translate(0,-0.045,0);
          const m=mesh(g,f,row===3?GD:FE[(i+row)%2],'feather'); m.position.copy(p0); m.lookAt(p0.clone().add(n)); m.rotateX(-Math.PI/2+0.5); } }
      if(style==='spaulder'){ const gp=0.018; for(let k=0;k<4;k++){ const e0=0.55+k*0.22, e1=e0+0.3; lame(k,gp+0.005*k,e0,e1,ST,'steel',k===3?GD:null); } }
      if(style==='leather'){ const gp=0.01; cap(gp,1.15,0.7,LE,'leather'); mesh(g,surf((u,v)=>{ const az=-Math.PI+u*Math.PI*2, el=reach(az,1.15,0.7)-0.03*(1-v); return S.at(el,az,gp+0.003); },40,1,{two:0.002}),LA,'leather');
        mesh(g,surf((u,v)=>{ const az=S.outAz+Math.PI+(u-0.5)*0.3, el=0.2+1.6*v; return S.at(el,az,gp+0.005); },3,8,{two:0.002}),LA,'leather'); }   // the strap over the shoulder
    });
    if(!ok){ undo(ctx,made); return false; } return true; }
  T.pauldrons=function(ctx){ if(ctx.K._armFit!==false&&!ctx.K._oldPaul&&shoulderKit(ctx,'round')) return; return T.pauldrons0(ctx); };
  T.arms=function(ctx){ if(ctx.K._armFit!==false&&armKit(ctx,'plate')) return; return T.arms0(ctx); };
  T.gauntlets=function(ctx){ if(ctx.K._armFit!==false&&handKit(ctx,'gauntlet')) return; return T.gauntlets0(ctx); };
  T.arms0=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g1=piece(ctx,A.sh), g2=piece(ctx,A.el);
      const tube=(g,y0,y1,r0,r1,mat,o)=>mesh(g,band((ph,y)=>r0+(r1-r0)*(y-y0)/(y1-y0),-Math.PI,Math.PI,y0,y1,8,o&&o.nv||2,{two:0.003,cz:o&&o.cz||0}),mat,'steel');
      const ring=(g,y,r,w)=>mesh(g,band(()=>r,-Math.PI,Math.PI,y,y+w,16,1,{two:0.002}),GD,'gold');
      tube(g1,-0.235,-0.012,0.058,0.07,M.steel,{nv:3}); ring(g1,-0.235,0.061,0.014); ring(g1,-0.1,0.066,0.01);   // the rerebrace, up under the pauldron (V255)
      tube(g2,-0.2,-0.03,0.056,0.066,M.steel,{nv:3}); ring(g2,-0.045,0.068,0.016); ring(g2,-0.12,0.064,0.01);   // the vambrace, banded
      mesh(g2,band(()=>0.06,-Math.PI,Math.PI,-0.205,-0.18,16,1,{two:0.002,yf:(ph,y)=>y}),GD,'gold');   // its cuff
      { const s=new THREE.Shape(); s.moveTo(-0.022,0); s.lineTo(0.022,0); s.lineTo(0,0.03); s.closePath(); const m=mesh(g2,new THREE.ExtrudeGeometry(s,{depth:0.006,bevelEnabled:false}).toNonIndexed(),GD,'gold'); m.geometry.computeVertexNormals(); m.position.set(sd*0.064,-0.03,0); m.rotation.y=sd*Math.PI/2; }   // the point on its top
      // the couter: a faceted cup on the elbow's point, a fan to its outer side, gold-rimmed
      const cp=mesh(g2,facetSphere(0.052,0.05,0.04,8,5,0,Math.PI*0.55),M.steel,'steel'); cp.position.set(0,0.0,-0.022); cp.rotation.x=-Math.PI/2;
      const rim=mesh(g2,new THREE.TorusGeometry(0.05,0.006,4,12).toNonIndexed(),GD,'gold'); rim.position.set(0,0,-0.024);
      const fan=mesh(g2,facetSphere(0.045,0.04,0.014,8,4),M.steel,'steel'); fan.position.set(sd*0.05,0.0,-0.005); fan.rotation.y=sd*0.4; }); };

  // ── GAUNTLETS: a flared cuff, a plate over the back of the hand, three finger lames — on the glove, which stays the hand ──
  T.gauntlets0=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
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
  /* V260: THE LEG KIT — legs and feet rebuilt from his own legs, so any style can be made to fit: each segment (thigh on the hip joint,
     shin and foot on the knee joint) is found along its own axis (limbFrame) and measured ring by ring (bodyRings); a style is a recipe of
     plates and leather laid on those rings. Legs: 'plate' (cuisse, poleyn, greave), 'greaves' (poleyn and greave). Feet: 'sabaton' (steel
     shoe in lames), 'tall' (leather boots to the knee), 'ankle' (leather boots), 'shoes'. ── */
  const LEA={}; function leatherM(K,c){ if(LEA[c]) return LEA[c]; const col=new THREE.Color(c); if(typeof ENGINE!=='undefined'&&ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding) col.convertSRGBToLinear(); const m=new THREE.MeshLambertMaterial({color:col}); m.name='leather'; return LEA[c]=m; }   // a leather of its own (the knight's 'boot' counts as metal to the toon shading)
  // the legs run down their joints' own -y (as the V250 greaves did): only the arms needed their axes found (limbFrame)
  function legSeg(K,pivot,regs,g){ const Y=regY(K,pivot,regs,0.2); if(!Y) return null; const f=new THREE.Group(); f.userData.armor=g.userData.armor; g.add(f);
    const y0=Math.max(Y[0],-0.6), y1=Math.min(Y[1],0.02), RR=bodyRings(K,pivot,regs,y0,y1,10,24,0.2); if(!RR) return null; const L={f};
    const sm=(ph,y)=>{ let s2=0; for(const d of [-0.26,-0.13,0,0.13,0.26]) s2+=RR.r(ph+d,y)*(d===0?2:1); return s2/6; };
    const hf=HEFT*0.012; return {f:L.f,y0,y1,RR,at:(ph,y,gap)=>{ const yy=Math.max(y0,Math.min(y1,y)), [cx,cz]=RR.c(yy), r=sm(ph,yy)+Math.max(0.003,gap+hf); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); }}; }
  function legKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, GD=M.goldD||M.gold, ST=o.steel||M.steel, LE=o.leather||leatherM(K,0x5b3b22); let ok=true; const made=[];
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([Gp,sd])=>{ if(!ok) return; const g1=piece(ctx,Gp.hip), g2=piece(ctx,Gp.knee); g1.userData.fitted=g2.userData.fitted=true; made.push(g1,g2);
      const T=legSeg(K,Gp.hip,['thigh'],g1), Sn=legSeg(K,Gp.knee,['calf','boot'],g2); if(!T||!Sn){ ok=false; return; }
      const band=(Sg,y,w,gap,mat,p0,p1)=>mesh(Sg.f,surf((u,v)=>Sg.at((p0===undefined?-Math.PI:p0)+((p1===undefined?Math.PI:p1)-(p0===undefined?-Math.PI:p0))*u,y+w*v,gap),24,1,{two:0.002}),mat,mat===GD?'gold':'steel');
      // the greave: closed round the shin from under the knee to the ankle, swelling with the calf, a keel before, gold at both ends
      const gT0=Sn.y1-0.045, gT=ph=>gT0-0.06*Math.pow(Math.max(0,-Math.cos(ph)),1.5), gB=Sn.y0+0.03, gg=0.012, keel=ph=>0.006*Math.max(0,1-Math.abs(ph)/0.35);   // cut low behind, for the bend of the knee
      mesh(Sn.f,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=gB+(gT(ph)-gB)*v; return Sn.at(ph,y,gg+keel(ph)); },26,8,{smooth:true,two:0.003}),ST,'steel');
      band(Sn,gB,0.012,gg+0.004,GD); mesh(Sn.f,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2; return Sn.at(ph,gT(ph)-0.012+v*0.012,gg+0.008); },32,1,{two:0.002}),GD,'gold'); band(Sn,(gB+gT0)/2,0.008,gg+0.005,GD,-0.5,0.5);
      // the poleyn: a cup over the knee, a fan to the outside, gold-rimmed (at the shin's top, before)
      const kp=Sn.at(0,Sn.y1-0.02,gg+0.012), kr=Math.max(0.026,Math.min(0.04,Sn.RR.r(0,Sn.y1-0.03)*0.6)), cup=mesh(Sn.f,facetSphere(kr*0.95,kr*1.05,kr*0.55,8,5,0,Math.PI*0.55),ST,'steel'); cup.position.copy(kp); cup.rotation.x=Math.PI/2;
      const rim=mesh(Sn.f,new THREE.TorusGeometry(kr*0.92,0.005,4,12).toNonIndexed(),GD,'gold'); rim.position.copy(kp).add(V(0,0,0.004));
      const fan=mesh(Sn.f,facetSphere(kr*0.7,kr*0.75,0.012,8,4),ST,'steel'); fan.position.copy(Sn.at(sd*1.3,Sn.y1-0.012,gg+0.01)); fan.rotation.y=sd*1.2;
      if(style==='plate'){ // the cuisse: plate round the front and sides of the thigh, leather behind, gold at its foot and down its edges
        const cT=T.y1-0.05, cB=T.y0+0.02, cg=0.022, W=2.35;
        mesh(T.f,surf((u,v)=>{ const ph=-W+2*W*u, y=cB+(cT-cB)*v; return T.at(ph,y,cg+0.004*Math.cos(ph)); },22,7,{smooth:true,two:0.003}),ST,'steel');
        mesh(T.f,surf((u,v)=>{ const ph=W+(Math.PI*2-2*W)*u, y=cB+(cT-cB)*v; return T.at(ph,y,cg-0.003); },6,5,{smooth:true,two:0.002}),LE,'leather');
        band(T,cB,0.012,cg+0.005,GD,-W,W); [-1,1].forEach(e=>mesh(T.f,surf((u,v)=>T.at(e*(W-0.06)+(v-0.5)*0.06,cB+(cT-cB)*u,cg+0.006),8,1,{two:0.002}),GD,'gold'));
        band(T,cT-0.04,0.008,cg+0.004,GD,-1.2,1.2); }
    });
    if(!ok){ made.forEach(g=>{ if(g.parent) g.parent.remove(g); const i2=ctx.groups.indexOf(g); if(i2>=0) ctx.groups.splice(i2,1); }); return false; } return true; }
  function footKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, GD=M.goldD||M.gold, ST=o.steel||M.steel, LE=o.leather||leatherM(K,0x6e4a2c), SO=o.sole||leatherM(K,0x2e2018); let ok=true; const made=[];
    [[K.rig.L,1],[K.rig.R,-1]].forEach(([Gp,sd])=>{ if(!ok) return; const g=piece(ctx,Gp.knee); g.userData.fitted=true; made.push(g);
      const Fo=legSeg(K,Gp.knee,['foot'],g), Sn=style!=='shoes'&&style!=='sabaton'||true?legSeg(K,Gp.knee,['calf','boot'],g):null; if(!Fo||!Sn){ ok=false; return; }
      const steel=style==='sabaton', up=steel?ST:LE, gap=steel?0.009:0.006;
      // the foot's shell, heel to toe (the foot frame's +z is the top of the foot), the toe drawn to a soft point for steel
      const fT=Fo.y1, fB=Fo.y0-0.012, pt=steel?0.6:0.85, shell=(ph,y,of)=>{ const v=(fT-y)/(fT-fB), toe=v>pt?1-(v-pt)/(1-pt)*0.45:1, p=Fo.at(ph,y,(gap+(of||0))); const [cx,cz]=Fo.RR.c(Math.max(Fo.y0,Math.min(Fo.y1,y))); return V(cx+(p.x-cx)*toe,p.y,cz+(p.z-cz)*Math.max(toe,Math.cos(ph)<-0.3?0.9:toe)); };
      mesh(Fo.f,surf((u,v)=>shell(-Math.PI+u*Math.PI*2,fT-(fT-fB)*v),24,9,{smooth:true,two:0.003}),up,steel?'steel':'leather');
      mesh(Fo.f,surf((u,v)=>shell(Math.PI-0.95+1.9*u,fT-(fT-fB)*v,0.008),12,8,{smooth:true,two:0.003}),SO,'leather');   // the sole
      { const tc=Fo.RR.c(fB+0.01); const cap=mesh(Fo.f,facetSphere(0.03,0.03,0.03,8,6),up,steel?'steel':'leather'); cap.position.set(tc[0],fB+0.012,tc[1]); cap.scale.set(Fo.RR.r(Math.PI/2,fB+0.02)/0.03+0.2,0.6,Fo.RR.r(0,fB+0.02)/0.03+0.2); }   // the toe closed
      if(steel){ [0.25,0.45,0.65].forEach(f=>{ const y=fT-(fT-fB)*f; mesh(Fo.f,surf((u,v)=>shell(-1.6+3.2*u,y+v*0.01,0.004),16,1,{two:0.002}),GD,'gold'); }); }   // the lames, gold-edged
      else if(style!=='shoes'){ [0.2,0.35].forEach(f=>{ const y=fT-(fT-fB)*f; mesh(Fo.f,surf((u,v)=>shell(-0.5+1.0*u,y+v*0.006,0.003),8,1,{two:0.002}),SO,'leather'); }); }   // the lacing
      // the shaft up the shin: steel collar for sabatons, leather to the ankle or the knee for boots
      const sB=Sn.y0-0.005, sT=steel?Sn.y0+0.05:style==='tall'?Sn.y1-0.15:style==='ankle'?Sn.y0+0.09:Sn.y0+0.02, sg=steel?0.012:0.008;
      if(sT>sB+0.005){ mesh(Sn.f,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=sB+(sT-sB)*v; return Sn.at(ph,y,sg+0.004*(1-v)); },24,style==='tall'?7:3,{smooth:true,two:0.003}),up,steel?'steel':'leather');
        if(steel) mesh(Sn.f,surf((u,v)=>Sn.at(-Math.PI+u*Math.PI*2,sT-0.012+v*0.012,sg+0.004),24,1,{two:0.002}),GD,'gold');
        if(style==='tall') mesh(Sn.f,surf((u,v)=>Sn.at(-Math.PI+u*Math.PI*2,sT-0.03+v*0.03,sg+0.008+0.004*v),24,2,{smooth:true,two:0.003}),LE,'leather');   // the turned-down cuff
        if(style==='tall'||style==='ankle') mesh(Sn.f,surf((u,v)=>Sn.at(-Math.PI+u*Math.PI*2,sB+0.03+v*0.01,sg+0.004),24,1,{two:0.002}),SO,'leather'); }   // a strap
    });
    if(!ok){ made.forEach(g=>{ if(g.parent) g.parent.remove(g); const i2=ctx.groups.indexOf(g); if(i2>=0) ctx.groups.splice(i2,1); }); return false; } return true; }
  T.legs=function(ctx){ if(ctx.K._armFit!==false&&legKit(ctx,'plate')) return; return T.legs0(ctx); };
  T.sabatons=function(ctx){ if(ctx.K._armFit!==false&&footKit(ctx,'sabaton')) return; return T.sabatons0(ctx); };
  T.legs0=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
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
  T.sabatons0=function(ctx){ const K=ctx.K, M=K.M, GD=M.goldD||M.gold;
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
  // V260: plain leg and foot wear from the leg kit, every knight's from the start
  PIECES.legs.greaves={name:'Greaves',set:'Common',common:true,build:ctx=>{ if(!legKit(ctx,'greaves')) T.legs0(ctx); }};
  [['cuirass','Breastplate'],['gambeson','Gambeson'],['jerkin','Leather jerkin'],['hauberk','Mail hauberk']].forEach(([k,n])=>{ PIECES.tabard[k]={name:n,set:'Common',common:true,build:ctx=>{ ctx.torsoStyle=k; T.tabard(ctx); }}; });
  [['tassets','Tassets'],['mail','Mail skirt'],['kilt','Pleated skirt']].forEach(([k,n])=>{ PIECES.skirt[k]={name:n,set:'Common',common:true,build:ctx=>{ if(!skirtKit(ctx,k)) T.skirt(ctx); }}; });
  [['kettle','Kettle hat'],['sallet','Sallet'],['bascinet','Bascinet'],['coif','Mail coif']].forEach(([k,n])=>{ PIECES.helm[k]={name:n,set:'Common',common:true,build:ctx=>{ if(!helmKit(ctx,k)) T.helmGreat(ctx); }}; });
  PIECES.pauldrons.spaulder={name:'Spaulders',set:'Common',common:true,build:ctx=>{ if(!shoulderKit(ctx,'spaulder')) T.pauldrons0(ctx); }};
  PIECES.pauldrons.leather={name:'Leather shoulder guards',set:'Common',common:true,build:ctx=>{ if(!shoulderKit(ctx,'leather')) T.pauldrons0(ctx); }};
  PIECES.arms.vambraces={name:'Vambraces',set:'Common',common:true,build:ctx=>{ if(!armKit(ctx,'vambraces')) T.arms0(ctx); }};
  PIECES.arms.bracers={name:'Leather bracers',set:'Common',common:true,build:ctx=>{ if(!armKit(ctx,'bracers')) T.arms0(ctx); }};
  PIECES.arms.mail={name:'Mail sleeves',set:'Common',common:true,build:ctx=>{ if(!armKit(ctx,'mail')) T.arms0(ctx); }};
  PIECES.gauntlets.gloves={name:'Leather gloves',set:'Common',common:true,build:ctx=>{ if(!handKit(ctx,'gloves')) T.gauntlets0(ctx); }};
  PIECES.gauntlets.wraps={name:'Hand wraps',set:'Common',common:true,build:ctx=>{ if(!handKit(ctx,'wraps')) T.gauntlets0(ctx); }};
  PIECES.sabatons.tall={name:'Tall leather boots',set:'Common',common:true,build:ctx=>{ if(!footKit(ctx,'tall')) T.sabatons0(ctx); }};
  PIECES.sabatons.ankle={name:'Ankle boots',set:'Common',common:true,build:ctx=>{ if(!footKit(ctx,'ankle')) T.sabatons0(ctx); }};
  PIECES.sabatons.shoes={name:'Shoes',set:'Common',common:true,build:ctx=>{ if(!footKit(ctx,'shoes')) T.sabatons0(ctx); }};

  // ── what each slot covers of the built-in harness (hidden while the piece is worn, shown again when it comes off) ──
  const _sw1=new THREE.Vector3(), _sw2=new THREE.Quaternion();
  /* V270: a hanger is a little pendulum in the world: its bob falls under gravity and lags as the belt moves, then the hanger is
     turned to point at it (never far into the body), so a pouch hangs plumb when he leans and swings when he strides */
  const _sw3=new THREE.Vector3(), _sw4=new THREE.Quaternion(), _sw5=new THREE.Quaternion(), _swD=new THREE.Vector3(0,-1,0), _swY=new THREE.Vector3(0,1,0);
  function beltSwing(n,dt){ const w=n._sw, L=0.09; if(w.yaw===undefined){ w.yaw=n.rotation.y; w.tz=n.rotation.z; }
    n.parent.updateWorldMatrix(true,false); n.getWorldPosition(_sw1); n.parent.getWorldQuaternion(_sw2);
    if(!w.b||w.b.distanceTo(_sw1)>L*4){ w.b=_sw1.clone().add(_sw3.set(0,-L,0)); w.bp=w.b.clone(); }
    const vx=(w.b.x-w.bp.x)*0.94, vy=(w.b.y-w.bp.y)*0.94, vz=(w.b.z-w.bp.z)*0.94; w.bp.copy(w.b); w.b.x+=vx; w.b.y+=vy-7*dt*dt; w.b.z+=vz;
    _sw3.subVectors(w.b,_sw1); const len=_sw3.length()||1e-6; _sw3.multiplyScalar(1/len); w.b.copy(_sw1).addScaledVector(_sw3,L);   // the string keeps its length
    // into the hanger's own frame (before its swing): outward is +z after its yaw
    _sw4.copy(_sw2).invert(); const dl=_sw3.clone().applyQuaternion(_sw4).applyAxisAngle(_swY,-w.yaw);
    if(dl.z<-0.05){ dl.z=-0.05; dl.normalize(); }                                     // not into his body
    if(dl.y>-0.35){ dl.y=-0.35; dl.normalize(); }                                      // never flung up past the horizontal
    _sw5.setFromUnitVectors(_swD,dl); n.quaternion.setFromAxisAngle(_swY,w.yaw).multiply(_sw5); if(w.tz) n.rotateZ(w.tz*0.4); }
  /* ═══ V269: THE BELT KIT ═══ Measured, like the legs: the narrowest ring of his waist (bodyRings round the torso joint), then let out
     over whatever he wears there (the tabard, the robe, the coat — measured where they hang), so the belt cinches them instead of
     hiding under them. Styles: 'sword' (studded leather, gilt buckle, the frog for the scabbard), 'war' (plaques), 'plain', 'sash'
     (wound cloth knotted at the hip, its tails hanging), 'cord' (a twisted rope with tassels). Gear hangs from it on pivots that swing
     as he moves (ARMOR.tick): pouches, a satchel, a dagger, a horn, the buckle's tongue. With a frog, the scabbard of a one-handed
     sword hangs at the left hip from the belt (K._frogP, kept on the knight's sheath pivot). */
  function beltRing(K,o){ const to=K.rig.torso, TR=bodyRings(K,to,['belly','pelvis','thigh'],0.06,0.3,24,36,0.34); if(!TR) return null;   /* the hips and waist only: the thighs spread with the stride */
    let yw=o.y!==undefined?o.y:0.1;   // a sword belt rides the top of the hips; a sash or cord sits higher, at the waist (o.y)
    const NA=36, out=new Float32Array(NA), S=K.userData.armorS, v=new THREE.Vector3(); to.updateMatrixWorld(true); const inv=to.matrixWorld.clone().invert();
    // tassets and mail skirts hang from the belt: with one on, the belt sits on its top edge
    if(S&&S.worn.skirt){ let top=-1e9; (S.groups.skirt||[]).forEach(g=>{ if(!g.visible) return; g.updateMatrixWorld(true); g.traverse(m=>{ if(!m.isMesh||!m.visible) return; const A=m.geometry.attributes.position, st=Math.max(1,Math.floor(A.count/400)); for(let i=0;i<A.count;i+=st){ v.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld).applyMatrix4(inv); if(Math.hypot(v.x,v.z)<0.42&&v.y<0.2) top=Math.max(top,v.y); } }); });
      if(top>-1e8&&top>yw-0.06) yw=Math.max(yw,top-0.012); K._btop=top; }
    yw+=o.drop||0;
    ['tabard','skirt'].forEach(sl=>{ if(!S||!S.worn[sl]) return; (S.groups[sl]||[]).forEach(g=>{ if(!g.visible||g.userData.garmentSlot||g.userData.mantle) return; g.updateMatrixWorld(true); g.traverse(m=>{ if(!m.isMesh) return; let vis=true; for(let q=m;q&&q!==g;q=q.parent) if(!q.visible) vis=false; if(!vis) return;
      const A=m.geometry.attributes.position, RA=m.userData.rest; for(let i=0;i<A.count;i++){ if(RA&&RA.length===A.count*3) v.set(RA[i*3],RA[i*3+1],RA[i*3+2]); else v.fromBufferAttribute(A,i); v.applyMatrix4(m.matrixWorld).applyMatrix4(inv); if(Math.abs(v.y-yw)>0.028) continue;   /* the cloth's resting shape, not where it swung to; a narrow band */ const c=TR.c(v.y), dx=v.x-c[0], dz=v.z-c[1], r=Math.hypot(dx,dz); if(r>0.42) continue; const a=Math.floor(((Math.atan2(dx,dz)+Math.PI)/(Math.PI*2))*NA)%NA; if(r>out[a]) out[a]=r; } }); }); });
    for(let it=0;it<2;it++){ const o2=out.slice(); for(let a=0;a<NA;a++) o2[a]=Math.max(out[a],out[(a+1)%NA]*0.985,out[(a+NA-1)%NA]*0.985); out.set(o2); }
    const shirt=S&&S.worn.tabard&&S.ids&&S.ids.tabard==='base'?0.012:0, gap=(o.gap||0.007)+shirt, c=TR.c(yw);
    const R=ph=>{ const g2=((ph+Math.PI)/(Math.PI*2))*NA-0.5, a0=((Math.floor(g2)%NA)+NA)%NA, a1=(a0+1)%NA, u=g2-Math.floor(g2), ov=out[a0]+(out[a1]-out[a0])*u; return Math.max(TR.r(ph,yw)+gap,ov>0?ov+0.006:0); };
    const sl=o.slung||0, tilt=ph=>-sl*(0.5+0.5*Math.cos(ph-1.25))+sl*0.5;   // a slung belt sits lower on the left hip
    return {yw,c,R,tilt}; }
  function beltKit(ctx,style,o){ o=o||{}; const K=ctx.K, M=K.M, to=K.rig.torso, B=beltRing(K,o); if(!B) return false;
    const _bd={yw:B.yw,r0:B.R(0),r1:B.R(1.57),r2:B.R(3.1),top:K._btop,sk:!!(K.userData.armorS.worn.skirt),skn:(K.userData.armorS.groups.skirt||[]).length}; const GD=o.metal||M.goldD||M.gold, LT=o.strap&&o.strap.isMaterial?o.strap:leatherM(K,o.strap||0x4a2f1a), LD=leatherM(K,o.dark||0x2e1d10), CL=o.cloth||M.tunic, g=piece(ctx,to); g.userData.fitted=true; g._hang=[]; g._bd=_bd;
    const H0=style==='sash'?0.07:style==='cord'?0.016:style==='war'?0.055:0.045, TH=style==='sash'?0.012:0.009, NU=56;
    const at=(ph,dy,dr)=>{ const r=B.R(ph)+(dr||0); return new THREE.Vector3(B.c[0]+r*Math.sin(ph),B.yw+B.tilt(ph)+(dy||0),B.c[1]+r*Math.cos(ph)); };
    const node=(ph,dy,dr,par)=>{ const n=new THREE.Group(); n.position.copy(at(ph,dy,dr)); n.rotation.y=ph; n.rotation.z=-Math.sin(ph-1.25)*(o.slung||0)*1.4; (par||g).add(n); n.userData.armor=g.userData.armor; return n; };
    const hang=(ph,dy,dr)=>{ const n=node(ph,dy,dr); n._sw={}; g._hang.push(n); return n; };
    // the strap: a band of rectangular section round the ring
    if(style!=='cord'){ const P=[], I=[]; for(let i=0;i<=NU;i++){ const ph=-Math.PI+i/NU*Math.PI*2, r=B.R(ph), y=B.yw+B.tilt(ph), sn=Math.sin(ph), cs=Math.cos(ph), wob=style==='sash'?0.006*Math.sin(ph*9):0;
        [[r-0.002,y-H0/2],[r+TH+wob,y-H0/2],[r+TH+wob,y+H0/2],[r-0.002,y+H0/2]].forEach(([rr,yy])=>P.push(B.c[0]+rr*sn,yy,B.c[1]+rr*cs)); }
      for(let i=0;i<NU;i++) for(let k=0;k<4;k++){ const a=i*4+k, b=i*4+(k+1)%4, c2=(i+1)*4+k, d=(i+1)*4+(k+1)%4; I.push(a,c2,b,b,c2,d); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setIndex(I); geo.computeVertexNormals(); mesh(g,geo,style==='sash'?CL:LT,style==='sash'?'cloth':'leather'); }
    else { [0,1].forEach(st=>{ const pts=[]; for(let i=0;i<=NU*2;i++){ const ph=-Math.PI+i/(NU*2)*Math.PI*2, tw=ph*14+st*Math.PI, r=B.R(ph)+0.008+0.004*Math.cos(tw); pts.push(new THREE.Vector3(B.c[0]+r*Math.sin(ph),B.yw+B.tilt(ph)+0.005*Math.sin(tw),B.c[1]+r*Math.cos(ph))); }
        mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),NU*2,0.0055,6,true),CL,'cloth'); }); }
    // studs, plaques
    const BK=o.buckle!==undefined?o.buckle:0;
    if(style==='sword'||style==='plain'&&o.studs) for(let i=0;i<24;i++){ const ph=-Math.PI+(i+0.5)/24*Math.PI*2; if(Math.abs(ph-BK)<0.35) continue; const n=node(ph,0,TH+0.001); mesh(n,facetSphere(0.0055,0.0055,0.004,6,4),GD,'gold'); }
    if(style==='war') for(let i=0;i<14;i++){ const ph=-Math.PI+(i+0.5)/14*Math.PI*2; if(Math.abs(ph-BK)<0.4) continue; const n=node(ph,0,TH+0.002), pl=mesh(n,new THREE.BoxGeometry(0.036,H0*0.82,0.006),GD,'gold'); pl.position.z=0.002; const b=mesh(n,facetSphere(0.008,0.008,0.006,8,5),o.boss||GD,'gold'); b.position.z=0.006; }
    // the buckle and its tongue
    if(style==='sword'||style==='war'||style==='plain'){ const n=node(BK,0,TH+0.002), w=0.058, h=H0*1.15, bar=(bw,bh,x,y)=>{ const m=mesh(n,new THREE.BoxGeometry(bw,bh,0.008),GD,'gold'); m.position.set(x,y,0.002); };
      bar(w,0.009,0,h/2); bar(w,0.009,0,-h/2); bar(0.009,h,-w/2,0); bar(0.009,h,w/2,0); bar(0.005,h*0.9,-0.006,0);
      const tg=hang(BK+0.17,-0.004,TH+0.004); const t=mesh(tg,new THREE.BoxGeometry(0.03,0.085,0.005),LT,'leather'); t.position.set(0,-0.04,0); const tip=mesh(tg,new THREE.BoxGeometry(0.03,0.01,0.006),GD,'gold'); tip.position.set(0,-0.082,0); }
    if(style==='sash'||style==='cord'){ const kph=o.knot!==undefined?o.knot:-0.75, kn=node(kph,0,TH+0.006); mesh(kn,facetSphere(0.026,0.022,0.016,8,6),CL,'cloth');
      [-1,1].forEach(sd=>{ const tl=hang(kph+sd*0.05,-0.01,TH+0.006), L=style==='sash'?0.2+0.04*sd:0.14+0.03*sd; tl.rotation.z+=sd*0.12;
        if(style==='sash'){ const m=mesh(tl,surf((u,v)=>V((u*2-1)*0.026*(1-0.3*v),-v*L,0.004*Math.sin(v*6+u*3)),3,6,{two:0.003}),CL,'cloth'); m.userData.part='cloth'; }
        else { const cd=mesh(tl,new THREE.CylinderGeometry(0.004,0.004,L,6),CL,'cloth'); cd.position.y=-L/2; const ts=mesh(tl,new THREE.ConeGeometry(0.016,0.05,8,1,true),o.tassel||GD,'gold'); ts.position.y=-L-0.015; } }); }
    // the gear: what this belt carries
    const gear=o.gear||(style==='sword'?['pouch@-1.0','dagger@-2.3']:style==='war'?['pouch@-0.95','pouch@0.95']:style==='plain'?['pouch@-1.0']:[]);
    gear.forEach(gs=>{ const [kind,ps]=gs.split('@'), ph=+ps, n=hang(ph,-0.005,TH+0.006);
      if(kind==='pouch'||kind==='satchel'){ const S2=kind==='satchel'?1.6:1, bd=mesh(n,new THREE.BoxGeometry(0.07*S2,0.085*S2,0.04*S2),LT,'leather'); bd.position.set(0,-0.045*S2,0.018*S2);
        const fl=mesh(n,surf((u,v)=>{ const x=(u*2-1)*0.037*S2, a=v*Math.PI*0.6; return V(x,-0.002-0.045*S2*Math.sin(a)*0.9,0.04*S2+0.012*S2*Math.cos(a)-0.006); },4,4,{two:0.003}),LD,'leather');
        const st=mesh(n,facetSphere(0.008,0.008,0.006,8,5),GD,'gold'); st.position.set(0,-0.042*S2,0.044*S2); if(kind==='satchel'){ n.position.y-=0.02; } }
      else if(kind==='dagger'){ const d=new THREE.Group(); n.add(d); d.rotation.z=0.5; d.position.z=0.02;
        const sc=mesh(d,new THREE.CylinderGeometry(0.014,0.009,0.16,8),LD,'leather'); sc.scale.z=0.5; sc.position.y=-0.09; const ch=mesh(d,new THREE.ConeGeometry(0.01,0.02,8),GD,'gold'); ch.rotation.x=Math.PI; ch.position.y=-0.178;
        const gr=mesh(d,new THREE.CylinderGeometry(0.008,0.008,0.06,8),LT,'leather'); gr.position.y=0.035; const gd=mesh(d,new THREE.BoxGeometry(0.06,0.01,0.014),GD,'gold'); gd.position.y=0.002; const pm=mesh(d,facetSphere(0.011,0.011,0.011,8,5),GD,'gold'); pm.position.y=0.07; }
      else if(kind==='horn'){ const hb=new THREE.Group(); n.add(hb); hb.position.set(0,-0.05,0.04); hb.rotation.set(0,Math.PI/2,0.2);
        const pts=[]; for(let i=0;i<=10;i++){ const t=i/10, a=t*2.2; pts.push(new THREE.Vector3(Math.cos(a)*0.07-0.07,Math.sin(a)*0.07,0)); } const crv=new THREE.CatmullRomCurve3(pts), tg=new THREE.TubeGeometry(crv,12,0.01,8,false), P=tg.attributes.position;
        for(let i=0;i<P.count;i++){ const t=Math.floor(i/9)/12, s2=0.45+1.6*t, c3=crv.getPoint(Math.min(1,t)); P.setXYZ(i,c3.x+(P.getX(i)-c3.x)*s2,c3.y+(P.getY(i)-c3.y)*s2,c3.z+(P.getZ(i)-c3.z)*s2); } tg.computeVertexNormals();
        mesh(hb,tg,o.hornMat||leatherM(K,0xd9c7a0),'horn'); const rim=mesh(hb,new THREE.TorusGeometry(0.026,0.004,6,14),GD,'gold'); const e=crv.getPoint(1); rim.position.copy(e); rim.rotation.y=Math.PI/2; const sl2=mesh(n,new THREE.BoxGeometry(0.008,0.06,0.004),LT,'leather'); sl2.position.set(0,-0.025,0.03); } });
    // the frog: a short hanger at the left hip that the scabbard rides in
    if(o.frog!==false&&(style==='sword'||style==='war'||style==='plain')){ const fph=1.25, fn=node(fph,0,TH+0.004); const fs=mesh(fn,new THREE.BoxGeometry(0.03,0.075,0.006),LT,'leather'); fs.position.set(0,-0.035,0.006); fs.rotation.x=-0.25;
      g._frog=at(fph,-0.07,TH+0.034); }
    return true; }
  function covered(K,slot){ const r=K.rig, out=[], F=K.userData.b3&&typeof K.userData.b3==='object'?K.userData.b3:null, kids=(p,t)=>p&&p.children.forEach(o=>{ if(o.isMesh&&!o.userData.armor&&t(o)) out.push(o); });
    const regs=(names,trimOnly)=>{ if(!F) return; (F.parts||[]).forEach(o=>{ const rg=o.userData&&o.userData.b3reg; if(rg&&names.some(n=>rg.split(',').includes(n))&&(!trimOnly||o.userData.b3trim)) out.push(o); }); };
    if(slot==='helm') kids(r.head,o=>/^(helm2|gold2|slit|helm|visor|gold)$/.test(o.userData.part));
    if(slot==='plume') kids(r.plume,()=>true);
    if(slot==='cowl') kids(r.torso,o=>o.userData.part==='scarf');
    if(slot==='tabard') kids(r.torso,o=>/^(tunic|steel|gold|cross|field)$/.test(o.userData.part));
    if(slot==='belt') kids(r.torso,o=>o.userData.part==='leather');
    if(slot==='skirt'){ kids(K._skF,()=>true); kids(K._skB,()=>true); kids(r.torso,o=>o.userData.part==='mail'); }   /* V242: and the old mail skirt beneath */
    if(slot==='pauldrons') [r.AL,r.AR].forEach(A=>kids(A.sh,o=>/^(paul|gold)$/.test(o.userData.part)));
    if(slot==='arms'){ [r.AL,r.AR].forEach(A=>{ kids(A.sh,o=>o.userData.part==='steel'); kids(A.el,()=>true); }); regs(['forearm','lowerarm_l','lowerarm_r']); regs(['upperarm']);   /* the old rerebrace's steel stays beneath, filling the shoulder under the pauldron; only its gold edge goes */ }
    if(slot==='gauntlets') [r.AL,r.AR].forEach(A=>kids(A.hand,o=>/^(steel|gold)$/.test(o.userData.part)));
    if(slot==='legs'){ [r.L,r.R].forEach(G=>{ kids(G.hip,()=>true); kids(G.knee,o=>!o.userData.sabaton&&o.userData.part!=='leather'); }); regs(['thigh','calf','boot','calf_l','calf_r']); }
    if(slot==='sabatons'){ [r.L,r.R].forEach(G=>kids(G.knee,o=>o.userData.sabaton||o.userData.part==='leather')); regs(['foot']); }
    return out; }

  // ── wearing ──
  function state(K){ return K.userData.armorS||(K.userData.armorS={worn:{},groups:{},hid:{}}); }
  function build(K,slot,id){ const S=state(K), P=PIECES[slot]&&PIECES[slot][id]; if(!P) return null; const ctx={K,slot,groups:[]}; try{ P.build(ctx); }catch(e){ ctx.groups.forEach(g=>g.parent&&g.parent.remove(g)); if(window.DEBUG_ARMOR) console.error('ARMOR',slot,e); return null; } return ctx.groups; }
  function show(K,slot,on){ const S=state(K); S.softDirty=true; (S.groups[slot]||[]).forEach(g=>{ g.visible=on; delete g.userData.fpHid; });
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
    if(K._fitW&&now-K._fitW.t<1500) return K._fitW; bodySync(K); const body=F.body, P=body.geometry.attributes.position, R=F.D.reg, n=P.count, W=new Float32Array(n*3); K.updateMatrixWorld(true); body.skeleton.update();
    for(let q=0;q<n;q++){ body.boneTransform(q,_fv); _fv.applyMatrix4(body.matrixWorld); W[q*3]=_fv.x; W[q*3+1]=_fv.y; W[q*3+2]=_fv.z; } return K._fitW={t:now,W,R,n}; }
  function regsOf(K,p){ const r=K.rig; if(p===r.torso) return ['chest','belly','pelvis','thigh'];   /* the hips are 'thigh' on this body */ if(p===r.head) return ['head']; if(p===K._skF||p===K._skB) return ['pelvis','thigh'];
    for(const A of [r.AL,r.AR]){ if(p===A.sh) return ['upperarm']; if(p===A.el) return ['forearm']; if(p===A.hand) return ['hand']; } for(const G of [r.L,r.R]){ if(p===G.hip) return ['thigh']; if(p===G.knee) return ['calf','boot','foot']; } return null; }
  /* V254: EACH PIECE FITTED TO HIS BODY. Not a shrink but a re-seat, piece by piece: round the piece's own joint, ring by ring up its
     length, the body's outer surface is measured (bodyRings) and so is the piece's inner face (its shell); every point of the piece is moved
     along its ray from the limb's axis so the shell lies a set gap over the body, and whatever stood proud of the shell — keels, ridges,
     gilt bands, rivets, flares, a hem — stands just as proud after. Above or below the body it hangs past (a helm's crown, a pauldron's
     dome, a tabard's hem) the piece keeps its own shape, set in by as much as its nearest ring was. Every set alike. */
  const CONF={cowl:{gap:0.03,box:0.32,only:'torso'},tabard:{gap:0.012,box:0.32},belt:{gap:0.04,box:0.32},arms:{gap:0.007,box:0.13}};
  /* the domes (helm, pauldrons) and the ends (gauntlets, sabatons) aren't tubes: sized whole to the body part, centred on it, then let down
     onto it until they rest a gap above it (SETTLE) */
  const SETTLE={helm:{gap:0.016,lift:0.08,xz:true},pauldrons:{gap:0.012,lift:0.06,z:true},gauntlets:{gap:0.006,lift:0.03,xz:true},sabatons:{gap:0.006,lift:0.03,xz:true}};
  const _cm=new THREE.Matrix4(), _ci=new THREE.Matrix4();
  function conform(K,slot,g){ const cf=CONF[slot], par=g.parent, regs=regsOf(K,par); if(!cf||!regs) return false; if(cf.only==='torso'&&par!==K.rig.torso) return false; if(g.userData.pelt) return false;   /* a pelt's collar and cloak keep their bulk */   /* a pelt on the arms isn't fitted round them */ g.updateMatrixWorld(true);
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
    const lim=0.22, ok=new Set(slot==='pauldrons'?['upperarm','chest']:slot==='sabatons'?['foot']:regs), C=0.015, top=new Map(), key=(x,z)=>Math.floor(x/C)+','+Math.floor(z/C); let bx=0,bz=0,bn=0;
    for(let q=0;q<B.n;q++){ if(!ok.has(B.R[q])) continue; _fv.set(B.W[q*3],B.W[q*3+1],B.W[q*3+2]); par.worldToLocal(_fv); if(Math.abs(_fv.x)>lim||Math.abs(_fv.z)>lim||Math.abs(_fv.y)>0.45) continue;
      const k=key(_fv.x,_fv.z), t=top.get(k); if(t===undefined||_fv.y>t) top.set(k,_fv.y); if(B.R[q]===(slot==='sabatons'?'foot':regs[0])){ bx+=_fv.x; bz+=_fv.z; bn++; } }
    if(!top.size) return null; const p0=g.position.clone();
    const pts=[]; g.traverse(m=>{ if(!m.isMesh||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, st2=Math.max(1,Math.floor(A.count/600)); _cm.multiplyMatrices(_ci.copy(par.matrixWorld).invert(),m.matrixWorld);
      for(let i=0;i<A.count;i+=st2){ _fv.fromBufferAttribute(A,i).applyMatrix4(_cm); pts.push(_fv.x,_fv.y,_fv.z); } });
    if(st.z){ let zs=0,zn=0; for(let q=0;q<B.n;q++){ if(B.R[q]!=='upperarm') continue; _fv.set(B.W[q*3],B.W[q*3+1],B.W[q*3+2]); par.worldToLocal(_fv); if(_fv.y<-0.1||Math.abs(_fv.x)>0.15||Math.abs(_fv.z)>0.15) continue; zs+=_fv.z; zn++; }
      if(zn>10){ const zz=[]; for(let i=0;i<pts.length;i+=3) zz.push(pts[i+2]); const dz=zs/zn-(pct(zz,0.05)+pct(zz,0.95))/2; g.position.z+=dz; for(let i=0;i<pts.length;i+=3) pts[i+2]+=dz; } }
    if(st.xz&&bn){ const xs=[],zs=[]; for(let i=0;i<pts.length;i+=3){ xs.push(pts[i]); zs.push(pts[i+2]); } const dx=bx/bn-(pct(xs,0.05)+pct(xs,0.95))/2, dz=bz/bn-(pct(zs,0.05)+pct(zs,0.95))/2; g.position.x+=dx; g.position.z+=dz; for(let i=0;i<pts.length;i+=3){ pts[i]+=dx; pts[i+2]+=dz; } }
    // over each patch of body it covers, the piece's roof (its highest point there) must clear the body's top by the gap
    const roof=new Map(); for(let i=0;i<pts.length;i+=3){ const k=key(pts[i],pts[i+2]), r0=roof.get(k); if(r0===undefined||pts[i+1]>r0) roof.set(k,pts[i+1]); }
    const cl=[]; roof.forEach((ry,k)=>{ const t=top.get(k); if(t!==undefined) cl.push(ry-t); });
    if(cl.length>=4){ const gap=(K._fitGap&&K._fitGap[slot]!==undefined)?K._fitGap[slot]:st.gap; g.position.y+=Math.max(-0.08,Math.min(0.08,gap-pct(cl,0.04))); }
    return g.position.clone().sub(p0); }
  /* V263: CAPES AND SHROUDS — cloth hung from the shoulders on the cloth sim. mantle(ctx,o): o.kind 'cape' (behind, from shoulder to
     shoulder), 'half' (a short cape to the middle of the back), 'side' (over one shoulder), 'shroud' (all round him, closed before).
     A shroud has a second resting shape, thrown back over the shoulders (the front gathered behind); it is worn that way while he fights
     (sword drawn, on guard, swinging), or when o.back says so (the hood down), and the cloth swings between the two (shroudSync). */
  function mantle(ctx,o){ const K=ctx.K, M=K.M, to=K.rig.torso, TR=bodyRings(K,to,['chest','belly','pelvis','thigh'],-0.3,0.62,16,32,0.34); if(!TR) return null;
    const g=piece(ctx,to); g.userData.fitted=true; g.userData.mantle=true; const CL=o.mat||M.cape||M.tunic, TRIM=o.trim, kind=o.kind||'cape', yTop=o.top||0.6, yHem=o.hem!==undefined?o.hem:-0.35;
    const sd0=o.side||1, gapF=kind==='shroud'?(o.open||0.16):0, P0=kind==='shroud'?gapF:kind==='side'?sd0*1.15:Math.PI-(o.wide||1.55), P1=kind==='shroud'?Math.PI*2-gapF:kind==='side'?sd0*Math.PI*1.12:Math.PI+(o.wide||1.55);   /* a shroud opens a little before */
    const shoulderR=(ph)=>{ const sx=Math.abs(Math.sin(ph)); return (o.stand!==undefined?o.stand:0.03)+(o.over!==undefined?o.over:0.09)*Math.pow(sx,1.5); };   // over the shoulders: wider at the sides
    const at=(ph,y,fall)=>{ const yy=Math.max(-0.12,Math.min(0.56,y)), [cx,cz]=TR.c(yy), base=TR.r(ph,Math.max(0.2,yy)), v=Math.max(0,Math.min(1,(yTop-y)/(yTop-yHem))), stand=shoulderR(ph)*Math.min(1,(yTop+0.04-y)/0.16+0.15);
      const r=Math.max(base+0.03,TR.r(ph,yy)+0.025)+stand*(1-v*0.65)+(o.flare!==undefined?o.flare:0.06)*v*v+(Math.cos(ph)<0?0.025*v:0); return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); };
    const NU=kind==='shroud'?48:28, NV=10, rag=o.rag||0, hemY=(u)=>yHem-(rag?rag*Math.abs(Math.sin(u*NU*0.9)):0);
    const shapeAt=(u,v,back)=>{ let ph=P0+(P1-P0)*u; if(back&&kind==='shroud'){ const w=((ph%(Math.PI*2))+Math.PI*2)%(Math.PI*2), a=w>Math.PI?Math.PI*2-w:w, sg=w>Math.PI?-1:1; ph=sg*(Math.PI*0.62+a*0.38); }   // the front gathered behind, over and past the shoulders
      const y=yTop-(yTop-hemY(u))*v; return at(ph,y); };
    const top=V(0,0,0); const ring=(fn)=>surf(fn,NU,NV,{smooth:true,two:0.005});
    const m=mesh(g,ring((u,v)=>shapeAt(u,1-v,false)),CL,'cloth'); m.userData.soft=1; m.userData.clothPin=yTop-0.07; m.userData.cape=kind;
    if(kind==='shroud'){ const g1=ring((u,v)=>shapeAt(u,1-v,true)); m.userData.rest0=m.geometry.attributes.position.array.slice(); m.userData.rest1=g1.attributes.position.array.slice(); m.userData.shroudBack=o.back||null; m.userData.shroudT=0; }
    if(TRIM){ const t=mesh(g,surf((u,v)=>{ const p=shapeAt(u,1,false); p.y+=0.018*v; const q=p.clone(); return q; },NU,1,{two:0.003}),TRIM,'gold'); t.userData.soft=1; t.userData.clothPin=yTop-0.07; t.userData.cape=kind;
      if(kind==='shroud'){ const g1=surf((u,v)=>{ const p=shapeAt(u,1,true); p.y+=0.018*v; return p; },NU,1,{two:0.003}); t.userData.rest0=t.geometry.attributes.position.array.slice(); t.userData.rest1=g1.attributes.position.array.slice(); t.userData.shroudBack=o.back||null; t.userData.shroudT=0; } }
    if(o.deco) o.deco(g,(u,v)=>shapeAt(u,v,false));
    return g; }
  const SHROUD={brown:0x5e4229,moss:0x34492a,ash:0x26242c,navy:0x1f2b52,crimson:0x5a1c1c,sand:0xb89a6a,white:0xe8e2d2};
  function shroud(ctx,tint,o){ const K=ctx.K, helmOn=Kx=>{ const S=Kx.userData.armorS, hg=S&&S.groups.helm&&S.groups.helm[0]; return !!(S&&S.worn.helm&&hg&&!hg.userData.garmentSlot); };
    return mantle(ctx,Object.assign({kind:'shroud',mat:leatherM(K,SHROUD[tint]||SHROUD.brown),hem:-0.42,top:0.6,rag:0.015,back:Kx=>{ const S=Kx.userData.armorS; return !S||!hoodUpNow(S); }   /* V267: the hood goes up over a helm too */},o||{})); }
  /* V270: the hood's cowl — a short capelet round the neck and shoulders in the hood's own cloth (and trim), closed before, so the hood
     grows out of a garment instead of sitting on him alone. It stays on the shoulders with the hood down (the hood lies on it). */
  function hoodCowl(ctx,mat,trim){ const K=ctx.K, to=K.rig.torso, TR=bodyRings(K,to,['chest','head','upperarm'],0.3,0.8,20,32,0.4); if(!TR) return null;
    const g=piece(ctx,to); g.userData.fitted=true; g.userData.drapeMe=true; const CL=mat||leatherM(K,SHROUD.brown);
    // a cone of cloth from the throat out over the shoulders: tight at the neck, wide and falling at the shoulders, a point before and behind
    const yN0=0.665, yNf=ph=>yN0-0.05*Math.max(0,Math.cos(ph))**2, rN=ph=>TR.r(ph,yNf(ph))+0.014, hemY=ph=>0.47-0.05*Math.pow(Math.cos(ph),2), rS=ph=>Math.max(TR.r(ph,0.52)+0.03,rN(ph)+0.05)+0.05*Math.pow(Math.abs(Math.sin(ph)),1.5);
    const pt=(u,v,o)=>{ const ph=u*Math.PI*2-Math.PI, t=v, yN=yNf(ph), y=yN+(hemY(ph)-yN)*t, r=rN(ph)+(rS(ph)-rN(ph))*Math.sqrt(t)+(o||0), c=TR.c(Math.max(0.3,Math.min(0.8,y))); return V(c[0]+r*Math.sin(ph),y-0.012*Math.sin(t*Math.PI)*Math.abs(Math.sin(ph*2)),c[1]+r*Math.cos(ph)); };
    const m=mesh(g,surf((u,v)=>pt(u,v),48,6,{smooth:true,two:0.004}),CL,'cloth'); m.userData.cape='cowl';
    if(trim){ mesh(g,surf((u,v)=>{ const p=pt(u,1,0.004); p.y+=0.016*v; return p; },48,1,{two:0.003}),trim,'gold'); }
    return g; }
  // V263: putting on an earned livery (the wardrobe glass) puts on its armour set, once; you may change pieces after
  function liverySync(K){ const G=SG(), lv=G.livery||'azure'; if(G._lvArm===lv) return; const had=G._lvArm; G._lvArm=lv; if(had===undefined) return; const id='lv_'+lv;
    if(SLOTS.some(sl=>PIECES[sl][id])){ G.armorPick=G.armorPick||{}; G.armorOff=G.armorOff||{}; SLOTS.forEach(sl=>{ if(PIECES[sl][id]){ G.armorPick[sl]=id; delete G.armorOff[sl]; } }); apply(); } }
  function fighting(K){ return K._st==='drawn'||K._st==='drawing'||!!K.guarding||!!K.alert||(K.raise>0)||(K.charge>0); }
  function shroudSync(K,list,dt){ const f=fighting(K); for(const m of list){ const r0=m.userData.rest0; if(!r0) continue; const want=(f||(m.userData.shroudBack&&m.userData.shroudBack(K)))?1:0, t0=m.userData.shroudT;
      const t=t0+(want-t0)*Math.min(1,dt*(want?7:2.5)); if(Math.abs(t-t0)<1e-4&&m.userData.rest&&m.userData._shrT===t) continue; m.userData.shroudT=t; m.userData._shrT=t;
      const r1=m.userData.rest1, R=m.userData.rest||(m.userData.rest=r0.slice()), e=t*t*(3-2*t); for(let i=0;i<R.length;i++) R[i]=r0[i]+(r1[i]-r0[i])*e; } }
  function fitGroups(K,slot,gs){ gs=gs.filter(g=>!g.userData.fitted); if(!gs.length) return; if(slot==='plume'&&K._armFit!==false){ const hf=K._helmFit; if(hf) gs.forEach(g=>{ const par=g.parent; if(!par) return;   // the crest follows the helm: its size, and where it came to rest
        K.updateMatrixWorld(true); const c=K.rig.head.localToWorld(_fv.copy(hf.c)); par.worldToLocal(c); g.scale.multiplyScalar(hf.s); g.position.sub(c).multiplyScalar(hf.s).add(c);
        if(hf.d){ const a=K.rig.head.localToWorld(new THREE.Vector3()), b=K.rig.head.localToWorld(hf.d.clone()); par.worldToLocal(a); par.worldToLocal(b); g.position.add(b.sub(a)); } g.userData.fitS='follows'; }); return; }
    if(CONF[slot]&&K._armFit!==false&&K._conform!==false){ if(slot==='helm') K._helmTop=null; let any=false; gs.forEach(g=>{ if(g.userData.garmentSlot) return; try{ if(conform(K,slot,g)) any=true; }catch(e){ if(window.DEBUG_ARMOR) console.error('conform',slot,e); } }); gs=gs.filter(g=>g.userData.fitS!=='conform'); if(!gs.length) return; }   /* the rest (a pelt's shoulder pieces) are sized as before */
    if(slot==='helm') K._helmFit=null; const f=FIT[slot]; if(!f||K._armFit===false) return; const B=bodyW(K); if(!B) return; const r=K.rig;
    gs.forEach(g=>{ const par=g.parent, regs=par&&regsOf(K,par); if(!regs||g.userData.garmentSlot) return; g.updateMatrixWorld(true);
      const px=[],py=[],pz=[]; g.traverse(m=>{ if(!m.isMesh||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, st=Math.max(1,Math.floor(A.count/500)); for(let i=0;i<A.count;i+=st){ _fv.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld); par.worldToLocal(_fv); px.push(_fv.x); py.push(_fv.y); pz.push(_fv.z); } });
      if(px.length<8) return; const y0=pct(py,0.05)-(f.band||0.01), y1=pct(py,0.95)+(f.band||0.01), wide=par===r.torso||par===K._skF||par===K._skB, lim=wide?0.42:0.2, ok=new Set(regs), bx=[],by=[],bz=[];
      for(let q=0;q<B.n;q++){ if(!ok.has(B.R[q])) continue; _fv.set(B.W[q*3],B.W[q*3+1],B.W[q*3+2]); par.worldToLocal(_fv); if(_fv.y<y0||_fv.y>y1||Math.abs(_fv.x)>lim||Math.abs(_fv.z)>lim) continue; bx.push(_fv.x); by.push(_fv.y); bz.push(_fv.z); }
      if(bx.length<20) return;
      const pw=pct(px,0.95)-pct(px,0.05), pd=pct(pz,0.95)-pct(pz,0.05), bw=(pct(bx,0.98)-pct(bx,0.02))*(f.k||1)+2*f.m, bd=(pct(bz,0.98)-pct(bz,0.02))*(f.k||1)+2*f.m;
      if(pw<1e-3||pd<1e-3) return; const s=Math.max(0.5,Math.min(1,SETTLE[slot]?Math.max(bw/pw,bd/pd):(bw/pw+bd/pd)/2));   /* a dome or an end must enclose the part both ways: the larger of the two */ g.userData.fitS=s; if(s>0.97){ if(slot==='helm') K._helmFit=null; if(SETTLE[slot]&&K._settle!==false){ try{ const d=settle(K,slot,g); if(d&&slot==='helm') K._helmFit={s:1,c:new THREE.Vector3(),d}; }catch(e){} } return; }
      const cx=(pct(bx,0.02)+pct(bx,0.98))/2, cz=(pct(bz,0.02)+pct(bz,0.98))/2, cy=f.u==='mid'?(pct(by,0.1)+pct(by,0.9))/2:f.u==='top'?pct(py,0.95):0;
      if(slot==='helm'&&par===r.head) K._helmFit={s,c:new THREE.Vector3(cx,cy,cz)};
      g.scale.set(g.scale.x*s,f.u?g.scale.y*s:g.scale.y,g.scale.z*s); g.position.x=cx+(g.position.x-cx)*s; g.position.z=cz+(g.position.z-cz)*s; if(f.u) g.position.y=cy+(g.position.y-cy)*s;
      if(SETTLE[slot]&&K._settle!==false){ try{ const d=settle(K,slot,g); if(d&&slot==='helm'&&K._helmFit) K._helmFit.d=d; if(d) g.userData.fitS=+s.toFixed(2)+' ↓'+d.y.toFixed(3); }catch(e){ if(window.DEBUG_ARMOR) console.error('settle',slot,e); } } }); }
  /* ═══ V271: ARMOUR SKINNED TO THE BODY'S OWN SKELETON (as Skyrim, Zelda and Assassin's Creed wear theirs) ═══
     A piece is still built and fitted by the kit (so every set and style stays customisable), then each of its meshes gets a skinned
     twin: every vertex takes the bone weights of the body points nearest it (only from the regions that piece may follow, a leg's plate
     only from its own leg), and its bind-pose place found by undoing those blended bones. The twin bends exactly as the body under it
     does — the vambrace twists with the forearm, the gauntlet with the wrist, the tabard's front and the skirt follow the thighs — so
     they can't slide off or be walked through. The rigid original stays in place, hidden from the camera (layers), for measuring
     and for everything that shows or hides it (its twin mirrors its visibility). Helms, crests, belts and hoods stay rigid on bones. */
  const SKINREG={tabard:['chest','belly','pelvis','thigh'],skirt:['pelvis','thigh'],pauldrons:['upperarm','chest'],arms:['upperarm','forearm'],gauntlets:['hand','forearm'],legs:['thigh','calf','boot'],sabatons:['foot','boot','calf']};
  let _bw=null;
  function bodyWorld(K){ const F=K.userData.b3, body=F.body, sk=body.skeleton, G=body.geometry, nb=G.attributes.position.count; bodySync(K); sk.update();
    if(_bw&&_bw.F===F&&_bw.t===performance.now()) return _bw;
    const SI=G.attributes.skinIndex.array, SW=G.attributes.skinWeight.array, bm=sk.boneMatrices, W=new Float32Array(nb*3), P=G.attributes.position, v=new THREE.Vector3(), M=new THREE.Matrix4(), e=new Float32Array(16);
    const toW=new THREE.Matrix4().multiplyMatrices(body.matrixWorld,body.bindMatrixInverse), toK=K.matrixWorld.clone().invert(), SX=new Float32Array(nb), YK=new Float32Array(nb);
    for(let q=0;q<nb;q++){ e.fill(0); for(let k=0;k<4;k++){ const w=SW[q*4+k]; if(!w) continue; const b=SI[q*4+k]*16; for(let j=0;j<16;j++) e[j]+=bm[b+j]*w; } M.fromArray(e);
      v.fromBufferAttribute(P,q).applyMatrix4(body.bindMatrix).applyMatrix4(M).applyMatrix4(toW); W[q*3]=v.x; W[q*3+1]=v.y; W[q*3+2]=v.z; v.applyMatrix4(toK); SX[q]=v.x; YK[q]=v.y; }
    const C=Math.max(0.01,new THREE.Vector3().setFromMatrixScale(body.matrixWorld).y*0.06), grid=new Map(), key=(x,y,z)=>Math.floor(x/C)+','+Math.floor(y/C)+','+Math.floor(z/C);
    for(let q=0;q<nb;q++){ const k=key(W[q*3],W[q*3+1],W[q*3+2]); let L=grid.get(k); if(!L) grid.set(k,L=[]); L.push(q); }
    const pel=sk.bones.findIndex(b=>b.name==='pelvis'); let pelY=0.8; if(pel>=0){ const pw=sk.bones[pel].getWorldPosition(new THREE.Vector3()).applyMatrix4(toK); pelY=pw.y; }
    _bw={F,t:performance.now(),W,SX,YK,C,grid,SI,SW,toW,bm,pel,pelY,toK,R:F.D.reg}; return _bw; }
  function skinGroups(K,slot,gs){ const regs=SKINREG[slot]; if(!regs||K._skinArmor===false) return; const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D) return;
    try{ toon(K); }catch(e){}   // the pieces' cel-shaded materials first, so the twins wear the same
    const B=bodyWorld(K), body=F.body, sk=body.skeleton, ok=new Set(regs), R=B.R, v=new THREE.Vector3(), t=new THREE.Vector3(), S4=new THREE.Matrix4(), e=new Float32Array(16), inv=new THREE.Matrix4();
    const fromW=B.toW.clone().invert(), bindInv=body.bindMatrix.clone().invert(), legR=new Set(['thigh','calf','foot','boot']);
    const near=(x,y,z,side,okS)=>{ const C=B.C, gx=Math.floor(x/C), gy=Math.floor(y/C), gz=Math.floor(z/C); let best=[];
      for(let r=1;r<=10&&best.length<4;r+=(r<3?1:2)){ best=[]; for(let i=-r;i<=r;i++) for(let j=-r;j<=r;j++) for(let k=-r;k<=r;k++){ const L=B.grid.get((gx+i)+','+(gy+j)+','+(gz+k)); if(!L) continue;
          for(const q of L){ if(!okS.has(R[q])) continue; if(side&&legR.has(R[q])&&B.SX[q]*side<0) continue; const dx=B.W[q*3]-x, dy=B.W[q*3+1]-y, dz=B.W[q*3+2]-z; best.push([dx*dx+dy*dy+dz*dz,q]); } }
        best.sort((a,b)=>a[0]-b[0]); best.length=Math.min(best.length,6); } return best; };
    const loose=slot==='tabard'||slot==='skirt';
    gs.forEach(gr=>{ if(gr.userData.garmentSlot||gr.userData.mantle) return; gr.updateMatrixWorld(true);
      const meshes=[]; gr.traverse(m=>{ if(m.isMesh&&!m.isSkinnedMesh&&!m.userData.twin&&m.geometry&&m.geometry.attributes.position) meshes.push(m); });
      meshes.forEach(m=>{ const geo=m.geometry.clone(), P=geo.attributes.position, n=P.count, si=new Float32Array(n*4), sw=new Float32Array(n*4);
        for(let i=0;i<n;i++){ v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld); t.copy(v).applyMatrix4(B.toK);
          const legSide=slot==='legs'||slot==='sabatons'||(loose&&t.y<B.pelY+0.02), side=legSide?(Math.abs(t.x)<0.025?0:Math.sign(t.x)):0;
          let nr=near(v.x,v.y,v.z,side,ok); if(!nr.length) nr=near(v.x,v.y,v.z,0,ok); if(!nr.length) nr=near(v.x,v.y,v.z,0,new Set(['pelvis','belly','chest','thigh','upperarm','forearm','calf']));
          const acc=new Map(); nr.forEach(([d,q])=>{ const w0=1/(Math.sqrt(d)+2e-3); for(let k=0;k<4;k++){ const w=B.SW[q*4+k]; if(w>0){ const b=B.SI[q*4+k]; acc.set(b,(acc.get(b)||0)+w*w0); } } });
          if(loose&&B.pel>=0){ let s0=0; acc.forEach(w=>s0+=w); if(s0>0){ const hang=Math.max(0,Math.min(1,(B.pelY-t.y)/0.38)), keep=side?0.7-0.42*hang:0.9-0.25*hang; acc.forEach((w,b)=>acc.set(b,w*(1-keep))); acc.set(B.pel,(acc.get(B.pel)||0)+s0*keep); } }   // cloth: carried by the hips, the hem by the thighs
          const top=[...acc.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4), sum=top.reduce((a,x)=>a+x[1],0)||1; const ii=[0,0,0,0], ww=[0,0,0,0]; top.forEach(([b,w],k)=>{ ii[k]=b; ww[k]=w/sum; }); if(!top.length){ ii[0]=Math.max(0,B.pel); ww[0]=1; }
          si.set(ii,i*4); sw.set(ww,i*4);
          e.fill(0); for(let k=0;k<4;k++){ if(!ww[k]) continue; const b=ii[k]*16; for(let j=0;j<16;j++) e[j]+=B.bm[b+j]*ww[k]; } S4.fromArray(e); inv.copy(S4).invert();
          t.copy(v).applyMatrix4(fromW).applyMatrix4(inv).applyMatrix4(bindInv); P.setXYZ(i,t.x,t.y,t.z); }
        geo.setAttribute('skinIndex',new THREE.Float32BufferAttribute(si,4)); geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4)); geo.computeVertexNormals();
        const mats=(Array.isArray(m.material)?m.material:[m.material]).map(x=>{ const c=x.clone(); c.skinning=true; c.needsUpdate=true; if(x.color) c.userData.src=x; return c; });
        const tw=new THREE.SkinnedMesh(geo,Array.isArray(m.material)?mats:mats[0]); tw.frustumCulled=false; tw.castShadow=m.castShadow; tw.userData.twin=true; tw.userData.part=m.userData.part; tw.renderOrder=m.renderOrder;
        m.parent.add(tw); tw.updateMatrixWorld(true); tw.bind(sk,body.bindMatrix.clone()); m.userData.skinTwin=tw; m.layers.disableAll(); m.castShadow=false; }); }); }
  /* V266: each finished piece is moved off the rig's pivot onto the body bone that carries the skin under it (the bone most weighted at
     the body points nearest the piece), keeping its place. The body's bones don't turn about the same centres as the rig's pivots
     (the spine bends in three bones, the arms hang from the collar), so plates on the pivots slid off the body in a swing or a stride. */
  let _bp=null;
  function bodyPts(K){ const F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.body.boneTransform) return null; const body=F.body, G=body.geometry, P=G.attributes.position;
    bodySync(K); body.skeleton.update(); body.updateMatrixWorld(true); const st=2, n=Math.ceil(P.count/st), X=new Float32Array(n*3), I=new Int32Array(n); const v=new THREE.Vector3();
    for(let q=0,k=0;q<P.count;q+=st,k++){ body.boneTransform(q,v); v.applyMatrix4(body.matrixWorld); X[k*3]=v.x; X[k*3+1]=v.y; X[k*3+2]=v.z; I[k]=q; } return {X,I,n,body}; }
  function onBones(K,slot,gs){ if(K._onBones===false||slot==='skirt') return; const B=bodyPts(K); if(!B) return; const SI=B.body.geometry.attributes.skinIndex, SW=B.body.geometry.attributes.skinWeight, bones=B.body.skeleton.bones, v=new THREE.Vector3();
    gs.forEach(g=>{ if(!g.parent||g.userData.garmentSlot||g.parent===K._skF||g.parent===K._skB) return; g.updateMatrixWorld(true); const pts=[];
      g.traverse(m=>{ if(!m.isMesh||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, st=Math.max(1,Math.floor(A.count/40)); for(let i=0;i<A.count;i+=st) pts.push(v.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld).clone()); });
      if(!pts.length) return; const W=new Map();
      pts.forEach(p=>{ let bd=1e9,bk=-1; for(let k=0;k<B.n;k++){ const dx=B.X[k*3]-p.x, dy=B.X[k*3+1]-p.y, dz=B.X[k*3+2]-p.z, d=dx*dx+dy*dy+dz*dz; if(d<bd){ bd=d; bk=k; } } if(bk<0) return; const q=B.I[bk];
        for(let c=0;c<4;c++){ const w=SW.array[q*4+c]; if(w>0){ const bi=SI.array[q*4+c]; W.set(bi,(W.get(bi)||0)+w); } } });
      const r=K.rig, P0=g.parent, inn=(...ps)=>ps.some(q=>q&&(q===P0||(()=>{ for(let o=P0;o&&o!==K;o=o.parent) if(o===q) return true; return false; })()));
      const ok=inn(r.L&&r.L.hip,r.R&&r.R.hip)?/thigh|calf|foot|ball/i:inn(r.AL&&r.AL.sh,r.AR&&r.AR.sh)?/upperarm|lowerarm|hand|thumb|index|middle|ring|pinky/i:inn(r.head,K._head)?/head|neck/i:/spine|pelvis|neck|clavicle/i;   // a piece rides a bone of its own limb
      let best=-1,bw=0; W.forEach((w,bi)=>{ if(w>bw&&bones[bi]&&ok.test(bones[bi].name)){ bw=w; best=bi; } }); const bone=bones[best]; if(!bone) return;
      let hp=false; for(let o=g.parent;o&&o!==K;o=o.parent) if(o===K._head){ hp=true; break; } g.userData.headP=hp;   // hidden with the head pivot in first person
      g._pivot=g.parent;
      if((slot==='pauldrons'||slot==='cowl')&&/upperarm/i.test(bone.name)&&bone.parent){   /* V267: a pauldron (or a pelt on the shoulder) turns only part of the way with the arm, so a raised arm doesn't swing it out */
        const J=new THREE.Object3D(); J.name='halfJ_'+bone.name; J.position.copy(bone.position); J.quaternion.copy(bone.quaternion); J.scale.copy(bone.scale); bone.parent.add(J); J.updateMatrixWorld(true); J.attach(g);
        const S=state(K); (S.halfJ||(S.halfJ=[])).push({J,bone,q0:bone.quaternion.clone(),f:slot==='pauldrons'?0.6:0.6,g}); g.userData.bone=J.name; return; }
      bone.attach(g); g.userData.bone=bone.name; }); }
  function wear(K,slot,id){ const S=state(K); if(S.worn[slot]) set(K,slot,false); if(S.groups[slot]){ S.groups[slot].forEach(g=>g.parent&&g.parent.remove(g)); S.groups[slot]=null; }
    if(!id) return; const gs=build(K,slot,id); if(!gs) return; try{ fitGroups(K,slot,gs); }catch(e){ if(window.DEBUG_ARMOR) console.error('ARMOR fit',slot,e); }
    if(slot==='helm'&&S.groups.cowl&&S.groups.cowl[0]&&S.groups.cowl[0].userData.hoodParts&&!wear._in){ wear._in=true; try{ const on=S.worn.cowl; wear(K,'cowl',S.ids.cowl); if(!on) set(K,'cowl',false); } finally{ wear._in=false; } }   /* a pelt's hood re-cut to the new helm */
    if(slot==='helm'&&S.groups.plume&&S.ids&&S.ids.plume&&!wear._in){ wear._in=true; try{ const pid=S.ids.plume, on=S.worn.plume; wear(K,'plume',pid); if(!on) set(K,'plume',false); } finally{ wear._in=false; } }   /* the crest re-seated on the new helm */ if((slot==='tabard'||slot==='skirt')&&S.groups.belt&&S.ids&&S.ids.belt&&!wear._in){ wear._in=true; try{ const bid=S.ids.belt, on=S.worn.belt; gs.forEach(g=>g.updateMatrixWorld(true)); S.groups[slot]=gs; S.worn[slot]=true; wear(K,'belt',bid); if(!on) set(K,'belt',false); } finally{ wear._in=false; } }   /* V269: the belt let out over the new tabard */ try{ skinGroups(K,slot,gs); }catch(e){ if(window.DEBUG_ARMOR) console.error('ARMOR skin',slot,e); } try{ onBones(K,slot,gs); }catch(e){ if(window.DEBUG_ARMOR) console.error('ARMOR bones',slot,e); } S.groups[slot]=gs; S.ids=S.ids||{}; S.ids[slot]=id; set(K,slot,true); }
  function set(K,slot,on){ const S=state(K); if(on&&!S.groups[slot]){ wear(K,slot,(S.ids&&S.ids[slot])||'templar'); return; } if(!S.groups[slot]) return; S.worn[slot]=!!on; show(K,slot,!!on); if(on) toon(K);
    if(slot==='pauldrons'||slot==='cowl') try{ drape(K); }catch(e){ if(window.DEBUG_ARMOR) console.error('drape',e); }
    if(slot==='tabard'||slot==='skirt') skirtSync(K); }
  function skirtSync(K){ const S=K&&K.userData.armorS; if(!S||!S.groups.skirt) return; const long=!!(S.worn.tabard&&S.groups.tabard&&S.groups.tabard[0]&&S.groups.tabard[0].userData.longFront);
    S.groups.skirt.forEach(g=>{ if(g.userData.centre) g.visible=!!S.worn.skirt&&!long; }); S.softDirty=true; }
  /* V258: A PELT LAID OVER THE PAULDRONS. Each worn pauldron's outer surface is measured round its own middle (the farthest of its points
     in each direction, 8 up-and-down × 16 round); any part of the pelt — the shoulder skins, the collar, the hood's fall, the cloak — that
     lies inside it is set out onto it, a gap above, so the fur lies over the plate instead of through it. Done afresh whenever the pelt
     or the pauldrons change (from the pelt's own shape each time); the cloth's resting shape follows. */
  const _dv=new THREE.Vector3(), _dm=new THREE.Matrix4();
  function envelope(g){ const pts=[]; g.updateMatrixWorld(true); g.traverse(m=>{ if(!m.isMesh||!m.visible||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, st=Math.max(1,Math.floor(A.count/700)); for(let i=0;i<A.count;i+=st) pts.push(_dv.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld).clone()); });
    if(pts.length<20) return null; const bb=new THREE.Box3().setFromPoints(pts), c=bb.getCenter(new THREE.Vector3()), NE=8, NA=16, r=new Float32Array(NE*NA);
    const bin=d=>{ const L=d.length()||1, el=Math.asin(Math.max(-1,Math.min(1,d.y/L))), az=Math.atan2(d.x,d.z); return Math.min(NE-1,Math.floor((el+Math.PI/2)/Math.PI*NE))*NA+Math.floor(((az+Math.PI)/(Math.PI*2))*NA)%NA; };
    pts.forEach(p=>{ const d=p.clone().sub(c), k=bin(d), L=d.length(); if(L>r[k]) r[k]=L; });
    for(let e=0;e<NE;e++) for(let a=0;a<NA;a++){ const k=e*NA+a; if(r[k]) continue; const l=r[e*NA+(a+NA-1)%NA], rr=r[e*NA+(a+1)%NA]; if(l&&rr) r[k]=(l+rr)/2; }   // small holes only: no shell below the rim
    for(let it=0;it<2;it++){ const r2=r.slice(); for(let e=0;e<NE;e++) for(let a=0;a<NA;a++){ const k=e*NA+a; if(!r[k]) continue; const n=[r[e*NA+(a+1)%NA],r[e*NA+(a+NA-1)%NA],e>0?r[(e-1)*NA+a]:0,e<NE-1?r[(e+1)*NA+a]:0].filter(x=>x>0); r2[k]=Math.max(r[k]*0.97,(r[k]*2+n.reduce((q,x)=>q+x,0))/(2+n.length)); } r.set(r2); }   // a smooth dome, not steps
    const R=d=>{ const L=d.length()||1, fe=(Math.asin(Math.max(-1,Math.min(1,d.y/L)))+Math.PI/2)/Math.PI*NE-0.5, fa=((Math.atan2(d.x,d.z)+Math.PI)/(Math.PI*2))*NA-0.5, e0=Math.max(0,Math.min(NE-1,Math.floor(fe))), e1=Math.min(NE-1,e0+1), te=Math.max(0,Math.min(1,fe-e0)), a0=((Math.floor(fa)%NA)+NA)%NA, a1=(a0+1)%NA, ta=fa-Math.floor(fa);
      const v=(e,a)=>r[e*NA+a], q=[[v(e0,a0),(1-te)*(1-ta)],[v(e0,a1),(1-te)*ta],[v(e1,a0),te*(1-ta)],[v(e1,a1),te*ta]]; let w=0,t=0; q.forEach(([x,ww])=>{ if(x){ t+=x*ww; w+=ww; } }); return w>0.25?t/w:0; };   // read between the bins
    return {c,r,bin,R}; }
  function drape(K){ const S=K&&K.userData.armorS; if(!S||!S.groups.cowl) return; const cg=S.groups.cowl[0], dm=S.groups.cowl.some(g=>g.userData.drapeMe); if(!cg||!(cg.userData.pelt||dm)) return;   /* V270: and the hood's cowl */
    K.updateMatrixWorld(true); K.getWorldScale(_sc); const gap=0.016*(_sc.y||1), envs=S.worn.pauldrons&&S.groups.pauldrons?S.groups.pauldrons.map(envelope).filter(Boolean):[];
    S.groups.cowl.forEach(g=>{ if(!cg.userData.pelt&&!g.userData.drapeMe) return; g.traverse(m=>{ if(!m.isMesh||!m.geometry.attributes.position) return; const A=m.geometry.attributes.position, arr=A.array;
      if(!m.userData.drape0){ m.userData.drape0=(m.userData.rest||arr).slice(); if(m.geometry.attributes.normal) m.userData.drapeN=m.geometry.attributes.normal.array.slice(); } arr.set(m.userData.drape0); if(m.userData.drapeN) m.geometry.attributes.normal.array.set(m.userData.drapeN); let moved=false;
      if(envs.length){ _dm.copy(m.matrixWorld).invert(); const NA0=m.geometry.attributes.normal, nv=new THREE.Vector3(), th=0.007*(_sc.y||1);
        for(let i=0;i<arr.length;i+=3){ _dv.set(arr[i],arr[i+1],arr[i+2]).applyMatrix4(m.matrixWorld); let hit=false; if(NA0) nv.fromBufferAttribute(NA0,i/3).transformDirection(m.matrixWorld);
          for(const E of envs){ const d=_dv.clone().sub(E.c), L=d.length(), R=E.R(d), inner=NA0&&nv.dot(d)<0, want=R+gap-(inner?th:0); if(R&&L<want){ _dv.copy(E.c).addScaledVector(d.multiplyScalar(1/(L||1)),want); hit=true; } }   /* the fur's underside kept a fur's thickness inside its top */
          if(hit){ _dv.applyMatrix4(_dm); arr[i]=_dv.x; arr[i+1]=_dv.y; arr[i+2]=_dv.z; moved=true; } } }
      A.needsUpdate=true; if(m.geometry.attributes.normal) m.geometry.attributes.normal.needsUpdate=true; m.geometry.computeBoundingSphere(); m.userData.draped=moved;
      if(m.userData.rest) m.userData.rest=arr.slice(); m.userData.clothX=null; }); }); }
  function worn(K){ const S=state(K), o={}; SLOTS.forEach(s=>o[s]=S.worn[s]?(S.ids&&S.ids[s])||'templar':null); return o; }
  // put the hero in his harness: every slot, save those the wardrobe has taken off
  // ── the skill trees' harnesses (armor_sets.js): each tier of a tree earns one of its pieces, the ultimate the helm and its crest.
  //  Once earned a piece is kept (a respec doesn't take it back), and the wardrobe picks, slot by slot, from all that are earned ──
  const TREES={striker:'st',guardian:'gd',psalmist:'ps'}, TIER={gauntlets:0,sabatons:1,belt:2,arms:3,legs:4,skirt:5,pauldrons:6,cowl:7,tabard:8,helm:9,plume:9};
  const SG=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  function earned(id,slot){ if(id==='templar'||id==='base') return !!(PIECES[slot]&&PIECES[slot][id]); if(PIECES[slot]&&PIECES[slot][id]&&PIECES[slot][id].common) return true; if(id.startsWith('lv_')) return !!(PIECES[slot]&&PIECES[slot][id])&&typeof liveryOwned==='function'&&liveryOwned(SG(),id.slice(3)); const S=SG(), pre=TREES[id]; if(S.armorOwned&&S.armorOwned[id+'.'+slot]&&PIECES[slot]&&PIECES[slot][id]) return true;   /* V245: bought at the smithy */ if(!pre||!PIECES[slot]||!PIECES[slot][id]) return false; return !!((S.armorEarned&&S.armorEarned[id+'.'+slot])||(S.skills&&S.skills[pre+TIER[slot]])); }
  function options(slot){ const o=Object.keys(PIECES[slot]||{}).filter(id=>earned(id,slot)&&id!=='base'); if(PIECES[slot]&&PIECES[slot].base) o.push('base'); return o; }   // plain clothes last
  function pick(slot){ const S=SG(); if(S.armorOff&&S.armorOff[slot]&&PIECES[slot].base) return 'base'; const id=(S.armorPick&&S.armorPick[slot])||'templar'; return earned(id,slot)?id:'templar'; }   /* V242: a slot with its armour off wears the plain clothes, not the old harness */
  function noteEarned(){ const S=SG(); if(!S.skills) return; S.armorEarned=S.armorEarned||{}; const fresh=[];
    for(const id in TREES) for(const slot in TIER){ const k=id+'.'+slot; if(!S.armorEarned[k]&&S.skills[TREES[id]+TIER[slot]]&&PIECES[slot]&&PIECES[slot][id]){ S.armorEarned[k]=1; fresh.push(PIECES[slot][id].name); } }
    if(fresh.length&&typeof UI!=='undefined'&&UI.toast&&!noteEarned.quiet) UI.toast('🛡 Armour earned: '+fresh.join(', ')+' — try it on in ☰ System → Armour',3200); noteEarned.quiet=false; }
  noteEarned.quiet=true;
  const hasBody=K=>{ const b=K.userData.b3; return !!(b&&typeof b==='object'&&b.body); };
  function dress(K){ K.userData.armorB=hasBody(K); SLOTS.forEach(s=>wear(K,s,pick(s))); K.userData.armor=true; if(K.userData.armorB) K.userData.armorSettle=performance.now()+2500; }
  /* V270: a little after the knight is first dressed on his body, everything is put on once more (what re-equipping did by hand:
     right after a load the armour could come out loose) — by then the body has been posed and the hoods and clothes have come */
  function resettle(K){ const S=K.userData.armorS; if(!S) return; SLOTS.forEach(sl=>{ const id=S.ids&&S.ids[sl]; if(!id) return; const on=S.worn[sl]; try{ wear(K,sl,id); if(!on) set(K,sl,false); }catch(e){} }); }
  function apply(){ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K, off=SG().armorOff||{}, S=state(K); SLOTS.forEach(s=>{ const id=pick(s); if((S.ids&&S.ids[s])!==id||!S.groups[s]) wear(K,s,id); else set(K,s,true); }); }
  // the hero, once his body has come (the plate shells it makes are among what the harness covers)
  let lastOff='';
  setInterval(()=>{ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K;
    try{ noteEarned(); }catch(e){}
    if(K.userData.armor&&!K.userData.armorB&&hasBody(K)){ try{ dress(K); }catch(e){} lastOff=''; return; }   /* V266: dressed before the body came (a slow load): fit it all again to the body */
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
      g.traverse(m=>{ if(!m.isMesh||m.isSkinnedMesh||m.userData.twin||!(sk||m.userData.soft||m.userData.softHead)) return; if(!m.userData.rest){ m.userData.rest=m.geometry.attributes.position.array.slice(); m.frustumCulled=false; } list.push(m); }); }); }
    return list; }
  // V256: a pelt worn in the Hood slot is a hood too: up, the beast's head over his own (over the helm too, if he wishes); down, on his shoulder.
  //  Up or down as the plain hood (☰ → Gear → Hood → Hood up/down: one choice for plain clothes, one with armour).
  function hoodUpNow(S){ const G=(typeof GAME!=='undefined'&&GAME.S)||{}, armoured=SLOTS.some(sl=>sl!=='plume'&&sl!=='cowl'&&S.worn[sl]&&S.ids&&S.ids[sl]&&S.ids[sl]!=='base'); return armoured?!!G.hoodArm:(G.hoodPlain!==false); }
  function hoodSync(K){ const S=K&&K.userData.armorS, cg=S&&S.groups.cowl&&S.groups.cowl[0], hp=cg&&cg.userData.hoodParts; if(!hp) return; const up=hoodUpNow(S), fp=!!(K._head&&!K._head.visible);
    hp.up.forEach(o=>{ const v=up&&!fp; if(o.visible!==v) o.visible=v; }); hp.down.forEach(o=>{ if(o.visible!==!up) o.visible=!up; }); }
  /* V256: CLOTH. Skirts, robes and fur cloaks hang and swing: every point of the cloth is a little mass, held toward where it would hang
     on the body (its rest place, carried by the hips) — firmly at the belt, loosely at the hem — so it lags behind as he moves, swings past,
     and settles; gravity draws it down; it is kept out of his legs (the leg capsules) and never strays far from where it belongs. The weights
     are by height down the whole piece (its group), so the gilt edges and hems move with the cloth they're sewn to. */
  const _cw=new THREE.Vector3(), _cv=new THREE.Vector3();
  function clothInit(m){ const g=m.parent, R=m.userData.rest; let y0=Infinity,y1=-Infinity; const top=[];
    (g.userData.clothY||(g.userData.clothY=(()=>{ g.traverse(q=>{ if(!q.isMesh) return; const P=q.userData.rest||q.geometry.attributes.position.array; for(let i=1;i<P.length;i+=3){ _cv.set(P[i-1],P[i],P[i+1]).applyMatrix4(q.matrix); if(_cv.y<y0) y0=_cv.y; if(_cv.y>y1) y1=_cv.y; } }); return [y0,y1]; })()));
    const [Y0,Y1a]=g.userData.clothY, Y1=m.userData.clothPin!==undefined?m.userData.clothPin:Y1a, n=R.length/3, H=new Float32Array(n); for(let i=0;i<n;i++){ _cv.set(R[i*3],R[i*3+1],R[i*3+2]).applyMatrix4(m.matrix); H[i]=Math.max(0,Math.min(1,(Y1-_cv.y)/((Y1-Y0)||1))); } m.userData.clothH=H; }   /* above its pin a cloth is held fast */
  function cloth(m,A,R,dt,sc){ if(!m.userData.clothH) clothInit(m); const H=m.userData.clothH, n=H.length; let X=m.userData.clothX, Xp=m.userData.clothP;
    if(!X){ X=m.userData.clothX=new Float32Array(n*3); Xp=m.userData.clothP=new Float32Array(n*3); for(let i=0;i<n;i++){ _cw.set(R[i*3],R[i*3+1],R[i*3+2]).applyMatrix4(m.matrixWorld); X[i*3]=Xp[i*3]=_cw.x; X[i*3+1]=Xp[i*3+1]=_cw.y; X[i*3+2]=Xp[i*3+2]=_cw.z; } }
    const f=dt*60, damp=Math.pow(0.9,f), g=-0.5*sc*dt*dt*9.8*0.35, far=0.16*sc;
    for(let i=0;i<n;i++){ const h=H[i], j=i*3; _cw.set(R[j],R[j+1],R[j+2]).applyMatrix4(m.matrixWorld);   // where it would hang
      const k=h<=0?1:1-Math.pow(1-(0.95-0.83*Math.pow(h,0.9)),f);   // firm at the belt, loose at the hem (per 60th of a second); fast above a pin
      let x=X[j], y=X[j+1], z=X[j+2]; const vx=(x-Xp[j])*damp, vy=(y-Xp[j+1])*damp, vz=(z-Xp[j+2])*damp; Xp[j]=x; Xp[j+1]=y; Xp[j+2]=z;
      x+=vx; y+=vy+g*h; z+=vz; x+=(_cw.x-x)*k; y+=(_cw.y-y)*k; z+=(_cw.z-z)*k;
      let dx=x-_cw.x, dy=y-_cw.y, dz=z-_cw.z; const L=Math.sqrt(dx*dx+dy*dy+dz*dz), lim=far*(0.15+h); if(L>lim){ if(L>lim*6){ x=_cw.x; y=_cw.y; z=_cw.z; Xp[j]=x; Xp[j+1]=y; Xp[j+2]=z; } else { const q=lim/L; x=_cw.x+dx*q; y=_cw.y+dy*q; z=_cw.z+dz*q; } }
      _cw.set(x,y,z); for(const C of CAPS){ _ab.subVectors(C.b,C.a); const t=Math.max(0,Math.min(1,_d.subVectors(_cw,C.a).dot(_ab)/Math.max(1e-6,_ab.lengthSq()))); _p.copy(C.a).addScaledVector(_ab,t); _d.subVectors(_cw,_p); const D=_d.length();
        if(D<C.r) _cw.copy(_p).addScaledVector(D>1e-5?_d.multiplyScalar(1/D):_d.set(0,0,1),C.r); }
      X[j]=_cw.x; X[j+1]=_cw.y; X[j+2]=_cw.z; _cw.applyMatrix4(_inv); A[j]=_cw.x; A[j+1]=_cw.y; A[j+2]=_cw.z; } }
  function tick(K){ const S=K&&K.userData.armorS; if(!S||!K.visible) return; hoodSync(K);
    for(const sl in SKINREG) (S.groups[sl]||[]).forEach(g=>g.traverse(m=>{ const tw=m.userData&&m.userData.skinTwin; if(!tw) return; if(tw.visible!==m.visible) tw.visible=m.visible;
      const ms=Array.isArray(tw.material)?tw.material:[tw.material]; ms.forEach(x=>{ const src=x.userData.src; if(src&&src.color&&!x.color.equals(src.color)) x.color.copy(src.color); }); }));   /* V271: the skinned twin shows as its piece does, in its colours */
    if(K.userData.armorSettle&&performance.now()>K.userData.armorSettle&&!(typeof OUTFIT3!=='undefined'&&OUTFIT3.baseReady&&!OUTFIT3.baseReady(K)&&performance.now()<K.userData.armorSettle+20000)){ delete K.userData.armorSettle; resettle(K); return; }
    { const now=performance.now(), dt=Math.min(0.05,Math.max(0.001,((now-(S._tt||now))/1000)||0.016)); S._tt=now; const bg=S.worn.belt&&S.groups.belt||[], sp=K.rig&&K.rig.sheathP; let frog=null;
      bg.forEach(g=>{ if(g._frog&&g.visible) frog=g._frog; (g._hang||[]).forEach(n=>beltSwing(n,dt)); });   /* V269: the belt's gear swings; the scabbard hangs from its frog */
      if(sp){ if(frog){ if(!K._sheath0) K._sheath0={p:sp.position.clone(),z:sp.rotation.z,r:K._sheathRest}; sp.position.copy(frog); sp.rotation.z=-0.3; K._sheathRest=-2.82; }   /* hung nearly upright from the frog, the point a little back */
        else if(K._sheath0){ sp.position.copy(K._sheath0.p); sp.rotation.z=K._sheath0.z; K._sheathRest=K._sheath0.r; delete K._sheath0; } } }
    if(S.halfJ){ S.halfJ=S.halfJ.filter(h=>{ if(!h.g.parent){ h.J.parent&&h.J.parent.remove(h.J); return false; } h.J.position.copy(h.bone.position); h.J.quaternion.copy(h.q0).slerp(h.bone.quaternion,h.f); return true; }); }
    if(K._head){ const hv=K._head.visible; for(const sl in S.groups) (S.groups[sl]||[]).forEach(g=>{ if(!g.userData.headP) return; if(!hv&&g.visible){ g.visible=false; g.userData.fpHid=1; } else if(hv&&g.userData.fpHid){ g.visible=true; delete g.userData.fpHid; } }); }
    if(K._og&&K._armFit!==false){ for(const k in K._og.crests){ const c=K._og.crests[k]; if(c.visible) c.visible=false; } const w=K._og.wings(); if(w&&w.visible) w.visible=false; }   /* V263: the old livery crests and wings: the livery sets carry their own now */
    liverySync(K);
    if(K.rig&&K.rig.capeP&&K.rig.capeP.visible) K.rig.capeP.visible=false;   /* V246: no cloth cape on the hero — it fought every other cloak (and the saddle) */
    if(K.herald&&!K.herald._robust){ K.herald._robust=true; K.herald.group.traverse(m=>{ if(m.isMesh){ m.frustumCulled=false; if(m.material&&m.userData.part==='face'){ m.material.side=THREE.DoubleSide; m.material.needsUpdate=true; } } }); }   /* V246: the shield is never culled */ if(!S.soft||S.softDirty){ S.soft=softList(K,S); S.softDirty=false; } const list=S.soft; if(!list.length) return;
    K.updateMatrixWorld(true); K.getWorldScale(_sc); const sc=_sc.y||1, r=K.rig;
    [r.L,r.R].forEach((G,i)=>{ const T=CAPS[i*2], Sh=CAPS[i*2+1]; G.hip.getWorldPosition(T.a); G.knee.getWorldPosition(T.b); T.r=0.1*sc; Sh.a.copy(T.b); G.knee.localToWorld(Sh.b.set(0,-0.34,0.03)); Sh.r=0.078*sc; });
    r.head.localToWorld(HEAD.c.set(0,0.03,0)); HEAD.r=0.17*sc;
    const now=performance.now(), dt=Math.min(0.05,Math.max(0.004,((now-(S.clothT||now))/1000)||0.016)); S.clothT=now;
    shroudSync(K,list,dt);
    for(const m of list){ if(!m.visible||(m.parent&&!m.parent.visible)){ m.userData.clothX=null; continue; } const pos=m.geometry.attributes.position, A=pos.array, R=m.userData.rest, head=!!m.userData.softHead; let dirty=false;
      _inv.copy(m.matrixWorld).invert();
      if(!head&&K._cloth!==false){ cloth(m,A,R,dt,sc); pos.needsUpdate=true; continue; }
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
  const H={hoodCowl,V,surf,weld,twoSide,band,sweep,bez,facetSphere,tri,piece,mesh,bounds,mantle,shroud,fighting,setHeft,leatherM,headBox,shoulderShape,armSeg,legSeg,bodyRings,regY};
  // V262: the kits, by name, for recipes (armor_recipes.js): KIT.x(ctx,style,o) → true when built
  const KIT={belt:beltKit,leg:legKit,foot:footKit,arm:armKit,hand:handKit,shoulder:shoulderKit,helm:helmKit,skirt:skirtKit,
    great:(ctx,st,o)=>{ ctx.helmFlat=!!(o&&o.flat); T.helm(ctx); return true; },
    torso:(ctx,st,o)=>{ ctx.torsoStyle=st; ctx.torsoOpts=o||{}; T.tabard(ctx); return true; } };
  return { preview, tryOn, shop:false, tick, hoodSync, hoodUpNow, regY, bodyRings, legKit, footKit, armKit, handKit, shoulderKit, helmKit, skirtKit, SLOTS, NAMES, PIECES, TREES, TIER, H, KIT, T, set, wear, worn, dress, apply, covered, earned, options, pick };
})();
