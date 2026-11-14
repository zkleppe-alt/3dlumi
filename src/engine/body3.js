// ════════════════════════════════════════════════════════════════
//  BODY3 (V193) — the knight and the townsfolk on Quaternius's Universal Base Characters (CC0; models/look3/body/,
//  licence in models/look3/LICENSE-universal-base-characters.txt): a real, well-made body and face, skinned to a real
//  skeleton, dressed by code.
//  It doesn't replace anyone's motion. The knight and every townsperson are knight-rigs (knight.js: hips, torso, head,
//  thighs, shins, arms on pivots) moved by the same code as ever — the clips of rig.js, the blows, the guard, riding,
//  sitting, fishing, climbing, knocked flat. Each frame BODY3 sets the skeleton's bones from those pivots (each bone
//  takes its pivot's turn from the rest pose), so the body does exactly what the old figure did.
//  At bind time the skeleton is fitted to the rig: arms and legs hang straight (the rig's rest), and each joint is
//  moved onto the rig's joint, so a sword in the hand pivot sits in the body's hand and a helm on the head pivot sits
//  on its head.
//  Clothes are SHELLS: the body's own triangles of some regions (by the bone each vertex follows), smoothed so they read
//  as cloth or plate rather than muscle, pushed out, and skinned to the same bones — they bend exactly as the body does.
//  A gold band runs round each plate's edge. Pieces (hats, crowns, belts) ride on bones.
//   BODY3.hero(K)        the hero: the new body in plate shells; the sculpted helm, plume, pauldrons, gauntlets,
//                        sabatons, surcoat, cowl and cape (and their cloth springs) stay on their pivots
//   BODY3.folk(K, spec)  a townsperson (engine/people.js → folk3Spec): body M/F, skin, hair, beard, clothes
//  Off with the classic look, ?nobody3, window.NO_BODY3, or where the files can't be fetched (the artifact): the old
//  figures stay.
// ════════════════════════════════════════════════════════════════
const BODY3=(function(){
  const on=()=>!(typeof LOOK2!=='undefined'&&!LOOK2)&&!/[?&]nobody3/.test(location.search)&&!window.NO_BODY3;
  const BASE='models/look3/', DIR=BASE+'body/';
  const src={}, wait={}; let libs=null;
  function loadLibs(){ if(libs) return libs; if(THREE.GLTFLoader&&THREE.SkeletonUtils) return libs=Promise.resolve();
    libs=new Promise((res,rej)=>{ const add=(f,ok,next)=>{ if(ok()) return next(); const s=document.createElement('script'); s.src=BASE+f; s.onload=next; s.onerror=()=>rej(f); document.head.appendChild(s); };
      add('GLTFLoader.js',()=>!!THREE.GLTFLoader,()=>add('SkeletonUtils.js',()=>!!THREE.SkeletonUtils,()=>res())); }); return libs; }
  const FILE={M:'Superhero_Male_FullBody.gltf',F:'Superhero_Female_FullBody.gltf'};
  function get(f){ if(src[f]) return Promise.resolve(src[f]); if(wait[f]) return wait[f];
    return wait[f]=loadLibs().then(()=>new Promise((res,rej)=>new THREE.GLTFLoader().load(DIR+f,g=>{ src[f]=g; prep(g); res(g); },undefined,rej))); }
  // ── the source body, analysed once: each vertex's region, the welded neighbours, the regions' boundaries ──
  const REG=n=>/Head|neck/i.test(n)?'head':/hand|thumb|index|middle|ring|pinky/i.test(n)?'hand':/lowerarm/i.test(n)?'forearm':/upperarm/i.test(n)?'upperarm':/clavicle|spine_03|spine_02/i.test(n)?'chest':/spine_01/i.test(n)?'belly':/pelvis/i.test(n)?'pelvis':/thigh/i.test(n)?'thigh':/calf/i.test(n)?'calf':/foot|ball/i.test(n)?'foot':'chest';
  function prep(g){ if(!g.scene.userData.body3) {} let body=null; g.scene.traverse(o=>{ if(o.isSkinnedMesh&&(!body||o.geometry.attributes.position.count>body.geometry.attributes.position.count)) body=o; });
    if(!body) return; const geo=body.geometry, P=geo.attributes.position, SI=geo.attributes.skinIndex, SW=geo.attributes.skinWeight, n=P.count, bones=body.skeleton.bones;
    const reg=new Array(n), cn=new Int32Array(n), key=new Map();
    for(let j=0;j<n;j++){ let bi=0,bw=-1; const ws=[SW.getX(j),SW.getY(j),SW.getZ(j),SW.getW(j)], is=[SI.getX(j),SI.getY(j),SI.getZ(j),SI.getW(j)]; for(let q=0;q<4;q++) if(ws[q]>bw){ bw=ws[q]; bi=is[q]; } reg[j]=REG(bones[bi].name);
      const k=Math.round(P.getX(j)*2e4)+'_'+Math.round(P.getY(j)*2e4)+'_'+Math.round(P.getZ(j)*2e4); if(!key.has(k)) key.set(k,j); cn[j]=key.get(k); }
    // a vertex welded across a seam takes one region (the first one's), so a sleeve's edge is one ring, not two
    for(let j=0;j<n;j++) reg[j]=reg[cn[j]];
    geo.computeBoundingBox(); { const y0=geo.boundingBox.min.y, h=geo.boundingBox.max.y-y0; for(let j=0;j<n;j++) if(reg[j]==='calf'&&(P.getY(j)-y0)/h<0.2) reg[j]='boot'; }   /* the lower shin: where a boot ends and the trousers begin */ g.userData.B3={bodyName:body.name,reg,cn,lh:geo.boundingBox.max.y-geo.boundingBox.min.y}; }
  // ── materials ──
  const HQ=()=>typeof PAINT!=='undefined';
  const MATS={};
  // V193b: the look of the lineup mockup — flat cel shading (three tones and a warm rim of light), plain colour, no
  //  painted textures; metal a shade lighter with a sharper highlight band
  const RAMP=(()=>{ const d=new Uint8Array([118,118,118,255, 186,186,186,255, 240,240,240,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  const RAMPM=(()=>{ const d=new Uint8Array([92,92,92,255, 160,160,160,255, 205,205,205,255, 238,238,238,255]), t=new THREE.DataTexture(d,4,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  function toon(o,metal){ const m=new THREE.MeshToonMaterial(Object.assign({gradientMap:metal?RAMPM:RAMP},o));
    m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n { float r=pow(1.0-clamp(dot(normalize(vViewPosition),normalize(vNormal)),0.0,1.0),3.0); gl_FragColor.rgb+=vec3(1.0,0.94,0.8)*r*'+(metal?'0.36':'0.26')+'; }'); };
    m.customProgramCacheKey=()=>'b3toon'+(metal?1:0); return m; }
  const METAL=new Set(['steel','gold','mail','helm','paul']);
  // the game draws in sRGB: a colour written as a hex is a screen colour, so it is taken to linear first (else it washes out pale)
  const SRGB=()=>typeof ENGINE!=='undefined'&&ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding;
  const lin=c=>{ c=c&&c.isColor?c.clone():new THREE.Color(c); return SRGB()?c.convertSRGBToLinear():c; };
  function mat(kind,col,o){ o=Object.assign({skinning:true},o||{}); const key=kind+'|'+col+'|'+JSON.stringify(o); if(MATS[key]) return MATS[key];
    return MATS[key]=toon(Object.assign({color:lin(col)},o),METAL.has(kind)); }
  // a toon twin of one of the game's materials (the knight's sculpt): same colour (kept in step each frame), same vertex shading
  function twin(src,skin){ const m=toon({color:src.color.clone(),vertexColors:!!src.vertexColors,side:src.side,skinning:!!skin,transparent:src.transparent,opacity:src.opacity},/steel|gold|helm|paul|metal/i.test(src.name||'')||src.metalness>0.5);
    if(src.onBeforeCompile&&src.userData&&src.userData.cloth){ } m.userData.src=src; if(m.gradientMap===RAMPM){ const h={}; src.color.getHSL(h); m.color.copy(h.s>0.5&&h.h>0.07&&h.h<0.18?lin('#c99a34'):lin('#76818f')); m.userData.fixed=true; }   /* metal: the lineup's steel or gold */
    else { m.userData.k=0.92; m.color.multiplyScalar(0.92); } return m; }
  // ── fitting the skeleton to a knight-rig ──
  const V=()=>new THREE.Vector3(), Qn=()=>new THREE.Quaternion();
  function kq(o,K,out){ out.identity(); for(let q=o;q&&q!==K;q=q.parent) out.premultiply(q.quaternion); return out; }
  function kp(o,K,out){ o.updateWorldMatrix(true,false); out.setFromMatrixPosition(o.matrixWorld); K.updateWorldMatrix(true,false); return out.applyMatrix4(new THREE.Matrix4().copy(K.matrixWorld).invert()); }
  // which pivot drives each bone (and how much of a blend between two)
  function mapOf(r){ return {
    pelvis:[r.hips], spine_01:[r.hips,r.torso,0.35], spine_02:[r.hips,r.torso,0.7], spine_03:[r.torso], neck_01:[r.torso,r.head,0.5], Head:[r.head],
    clavicle_l:[r.torso], clavicle_r:[r.torso],
    upperarm_l:[r.AL.sh], lowerarm_l:[r.AL.el], hand_l:[r.AL.hand], upperarm_r:[r.AR.sh], lowerarm_r:[r.AR.el], hand_r:[r.AR.hand],
    thigh_l:[r.L.hip], calf_l:[r.L.knee], foot_l:[r.L.knee], thigh_r:[r.R.hip], calf_r:[r.R.knee], foot_r:[r.R.knee] }; }
  function build(K,g,opt){ const r=K.rig, D=g.userData.B3;
    const root=THREE.SkeletonUtils.clone(g.scene), hold=new THREE.Group(); hold.name='body3'; hold.add(root); K.add(hold);
    let body=null; const extra=[]; const B={};
    root.traverse(o=>{ if(o.isBone) B[o.name]=o; if(o.isSkinnedMesh){ o.frustumCulled=false; o.castShadow=true; if(o.name===D.bodyName) body=o; else extra.push(o); } });
    // ── the rig at rest: every pivot square, the hips at their height ──
    const piv=[r.hips,r.torso,r.head,r.L.hip,r.L.knee,r.R.hip,r.R.knee,r.AL.sh,r.AL.el,r.AL.hand,r.AR.sh,r.AR.el,r.AR.hand], save=piv.map(p=>[p.quaternion.clone(),p.position.clone()]);
    piv.forEach(p=>p.quaternion.identity()); r.hips.position.set(0,K.hipY||0.8,0); K.updateMatrixWorld(true);
    const J=n=>kp(n,K,V());
    const hipJ=[J(r.L.hip),J(r.R.hip)], kneeJ=[J(r.L.knee),J(r.R.knee)], shJ=[J(r.AL.sh),J(r.AR.sh)], elJ=[J(r.AL.el),J(r.AR.el)], wrJ=[J(r.AL.hand),J(r.AR.hand)], headJ=J(r.head), hipsJ=J(r.hips);
    const lt=kneeJ[0].distanceTo(hipJ[0]), ls=(K.hipY||0.8)-lt+0.012;
    // scale: the thighs at the rig's hip height, feet on the ground
    hold.updateMatrixWorld(true); const toK=new THREE.Matrix4().copy(K.matrixWorld).invert();
    const BK=n=>{ B[n].updateWorldMatrix(true,false); return V().setFromMatrixPosition(B[n].matrixWorld).applyMatrix4(toK); };
    let s=(hipJ[0].y)/Math.max(0.01,BK('thigh_l').y-BK('ball_l').y); root.scale.multiplyScalar(s); hold.updateMatrixWorld(true);
    root.position.y-=BK('ball_l').y-0.012; hold.updateMatrixWorld(true);
    // facing: the rig faces +z; turn the body if its toes point the other way
    if(BK('ball_l').z<BK('foot_l').z){ root.rotation.y+=Math.PI; hold.updateMatrixWorld(true); }
    const head0=B.Head.getWorldPosition(V());   // where the head stood before fitting (the hair files are made for it there)
    // left and right: the rig's AL is at +x
    const swap=BK('thigh_l').x<0;
    const side=(n,i)=>n.replace(/_[lr]$/,(swap?(i?'_l':'_r'):(i?'_r':'_l')));
    // aim a bone so the way to its child joint runs along dir (K space), then set the child's distance
    const aim=(bn,child,dir,len)=>{ const b=B[bn], c=B[child]; b.updateWorldMatrix(true,false); const pb=BK(bn), pc=BK(child), cur=pc.sub(pb).normalize();
      const qw=Qn().setFromUnitVectors(cur,dir.clone().normalize()); const Kq=Qn(); K.getWorldQuaternion(Kq); const bw=Qn(); b.getWorldQuaternion(bw);
      const want=Qn().copy(Kq).multiply(qw).multiply(Kq.clone().invert()).multiply(bw); const pw=Qn(); b.parent.getWorldQuaternion(pw); b.quaternion.copy(pw.invert().multiply(want)); b.updateMatrixWorld(true);
      if(len){ const now=BK(child).distanceTo(BK(bn)); if(now>1e-4) c.position.multiplyScalar(len/now); c.updateMatrixWorld(true); } };
    const place=(bn,p)=>{ const b=B[bn]; b.parent.updateWorldMatrix(true,false); const w=p.clone().applyMatrix4(K.matrixWorld); b.position.copy(b.parent.worldToLocal(w)); b.updateMatrixWorld(true); };
    const down=new THREE.Vector3(0,-1,0);
    // the head: the helm's heart is the rig's head pivot; lift or drop the neck so the skull's middle is there
    let topK=0, dHead=V();
    if(opt&&opt.natural){
      // V193b — THE BODY'S OWN BUILD. The figure keeps the base body's proportions (as in the lineup): its limbs only turned to
      //  hang straight, and the RIG is moved to fit it instead — hips, knees, shoulders, elbows, wrists and head pivots set on
      //  the body's own joints, so everything the rig carries (hats, belts, aprons, what they hold) moves with the real body
      for(let i=0;i<2;i++){ const L=n=>side(n,i); aim(L('thigh_l'),L('calf_l'),down); aim(L('calf_l'),L('foot_l'),down); aim(L('upperarm_l'),L('lowerarm_l'),down); aim(L('lowerarm_l'),L('hand_l'),down); }
      const hb=new THREE.Box3().setFromObject(body); topK=hb.applyMatrix4(toK).max.y; const hy=BK('Head').y, mid=V().set(BK('Head').x,hy+(topK-hy)*0.42,BK('Head').z+0.012);
      const hipY=(BK(side('thigh_l',0)).y+BK(side('thigh_r',1)).y)/2; K.hipY=hipY; r.hips.position.set(0,hipY,0); K.updateMatrixWorld(true);
      const rel=(p,par)=>{ par.updateWorldMatrix(true,false); const w=p.clone().applyMatrix4(K.matrixWorld); return par.worldToLocal(w); };
      const setP=(pv,p)=>{ pv.position.copy(rel(p,pv.parent)); pv.updateMatrixWorld(true); const k=piv.indexOf(pv); if(k>=0) save[k][1].copy(pv.position); };
      const h0=J(r.head);
      [[r.L,r.AL,0],[r.R,r.AR,1]].forEach(([G,A,i])=>{ const L=n=>side(n,i); setP(G.hip,BK(L('thigh_l'))); setP(G.knee,BK(L('calf_l'))); setP(A.sh,BK(L('upperarm_l'))); setP(A.el,BK(L('lowerarm_l'))); setP(A.hand,BK(L('hand_l'))); });
      setP(r.head,mid); dHead.copy(J(r.head)).sub(h0); save[0][1].set(save[0][1].x,hipY,save[0][1].z);
    } else { const hb=new THREE.Box3().setFromObject(body), top=hb.applyMatrix4(toK).max.y, hy=BK('Head').y, mid=hy+(top-hy)*0.45, dy=headJ.y-mid; topK=top+dy;
      const sp=B.spine_03; sp.position.y+=dy/Math.max(1e-4,new THREE.Vector3().setFromMatrixScale(sp.parent.matrixWorld).y/new THREE.Vector3().setFromMatrixScale(K.matrixWorld).y); sp.updateMatrixWorld(true);
    for(let i=0;i<2;i++){ const L=n=>side(n,i);
      // legs straight down from the rig's hip joint
      place(L('thigh_l'),hipJ[i]); aim(L('thigh_l'),L('calf_l'),down,lt); aim(L('calf_l'),L('foot_l'),down,ls-0.07);
      // arms hanging straight from the rig's shoulder, elbow and wrist
      place(L('upperarm_l'),shJ[i]); aim(L('upperarm_l'),L('lowerarm_l'),elJ[i].clone().sub(shJ[i]),shJ[i].distanceTo(elJ[i])); aim(L('lowerarm_l'),L('hand_l'),wrJ[i].clone().sub(elJ[i]),elJ[i].distanceTo(wrJ[i])); } }
    // ── record each bone's turn against its pivot (K space), and the pelvis's place in the hips pivot ──
    const M=mapOf(r), names=Object.keys(M).map(n=>swap&&/_[lr]$/.test(n)?n.replace(/_l$/,'_X').replace(/_r$/,'_l').replace(/_X$/,'_r'):n);
    const PQ=(m)=>{ const a=kq(m[0],K,Qn()); if(m.length<3) return a; return a.slerp(kq(m[1],K,Qn()),m[2]); };
    const bq=n=>{ const t=Qn(); B[n].getWorldQuaternion(t); const Kq=Qn(); K.getWorldQuaternion(Kq); return Kq.invert().multiply(t); };
    const off={}; Object.keys(M).forEach((n,ii)=>{ const bn=names[ii]; if(!B[bn]) return; off[bn]={m:M[n],q:PQ(M[n]).invert().multiply(bq(bn))}; });
    const pelP=r.hips.worldToLocal(B.pelvis.getWorldPosition(V())).add(new THREE.Vector3(0,0.106,0)),   /* V211 (in the rig's own units, ~0.05 in the world): the whole body up — the fit aims the feet at the ball-of-foot bone, inside the boot, so the soles stood 0.05 under every floor */ pelParInv=new THREE.Matrix4().copy(B.pelvis.parent.matrixWorld).invert().multiply(K.matrixWorld);
    piv.forEach((p,i)=>{ p.quaternion.copy(save[i][0]); p.position.copy(save[i][1]); });
    // the bones in hierarchy order, each with its parent's index (so the K-space turns chain without touching matrices)
    const depth=b=>{ let d=0; for(let p=b.parent;p;p=p.parent) d++; return d; };
    const list=body.skeleton.bones.filter(b=>off[b.name]).sort((a,b)=>depth(a)-depth(b)), idx=new Map(); list.forEach((b,i)=>idx.set(b,i));
    const parQ=b=>{ const t=Qn(); b.parent.updateWorldMatrix(true,false); b.parent.getWorldQuaternion(t); const Kq=Qn(); K.getWorldQuaternion(Kq); return Kq.invert().multiply(t); };
    // each bone's parent: one we set (its K-space turn is known), or a fixed ancestor (its K-space turn measured now — nothing moves it)
    const chain=list.map(b=>{ let p=b.parent, extra=Qn(); while(p&&p.isBone&&!idx.has(p)){ extra.premultiply(p.quaternion); p=p.parent; } return idx.has(p)?{b,par:idx.get(p),extra,o:off[b.name]}:{b,par:-1,base:parQ(b),o:off[b.name]}; });
    const wq=list.map(()=>Qn()), tq=Qn(), tq2=Qn(), tv=V();
    function sync(){ for(let i=0;i<chain.length;i++){ const c=chain[i], o=c.o;
        tq.copy(PQ(o.m)).multiply(o.q); wq[i].copy(tq); const pw=c.par<0?tq2.copy(c.base):tq2.copy(wq[c.par]).multiply(c.extra); c.b.quaternion.copy(pw.invert().multiply(tq)); }
      // the pelvis rides the hips pivot
      tv.copy(pelP); r.hips.updateMatrix(); tv.applyMatrix4(r.hips.matrix); tv.applyMatrix4(pelParInv); B.pelvis.position.copy(tv); }
    // the hips pivot is a child of K, so its matrix is its K-space place
    return {hold,root,body,extra,B,sync,swap,s,head0,top:topK,dHead};
  }
  // ── clothes: a shell of the body's own triangles ──
  function shell(F,regs,col,d,iters,o){ o=o||{}; const body=F.body, g=body.geometry, D=F.D, idx=g.index, keep=new Set(regs), R=D.reg, cn=D.cn, n=g.attributes.position.count, P0=g.attributes.position, N0=g.attributes.normal;
    const tri=[]; for(let t=0;t<idx.count;t+=3){ const a=idx.getX(t),b=idx.getX(t+1),c=idx.getX(t+2); const k3=keep.has(R[a])+keep.has(R[b])+keep.has(R[c]); if((o.any?k3>=1:k3===3)&&(!o.cut||o.cut(a,b,c,P0))) tri.push(a,b,c); }   /* any: plates overlap their neighbours at the seams, so no gap shows between them */
    if(!tri.length) return null;
    const nb=new Map(), link=(a,b)=>{ if(a===b) return; if(!nb.has(a)) nb.set(a,new Set()); nb.get(a).add(b); }; for(let t=0;t<tri.length;t+=3) for(let q=0;q<3;q++){ const a=cn[tri[t+q]], b=cn[tri[t+(q+1)%3]]; link(a,b); link(b,a); }
    // the edge: welded vertices that the full body links to a region outside the shell
    const edge=new Set(); for(let t=0;t<idx.count;t+=3){ const v=[cn[idx.getX(t)],cn[idx.getX(t+1)],cn[idx.getX(t+2)]], ins=v.map(x=>keep.has(R[x])); if(ins.some(x=>x)&&!ins.every(x=>x)) v.forEach((x,i)=>{ if(ins[i]) edge.add(x); }); }
    const X=new Float32Array(n*3); for(let q=0;q<n;q++){ X[q*3]=P0.getX(q); X[q*3+1]=P0.getY(q); X[q*3+2]=P0.getZ(q); }
    // the garment's open edges (a hem, a cuff, a waist) stay where the body is, so smoothing doesn't draw them up and leave a gap
    const inS=new Set(nb.keys()), open=new Set(); for(let t=0;t<idx.count;t+=3){ const v=[cn[idx.getX(t)],cn[idx.getX(t+1)],cn[idx.getX(t+2)]], k=v.map(x=>inS.has(x)); if(k.some(x=>x)&&!k.every(x=>x)) v.forEach((x,i)=>{ if(k[i]) open.add(x); }); }
    for(let it=0;it<(iters||6);it++){ const Y=new Float32Array(X); nb.forEach((ns,a)=>{ if(open.has(a)) return; let x=0,y=0,z=0; ns.forEach(b=>{ x+=X[b*3]; y+=X[b*3+1]; z+=X[b*3+2]; }); const m=ns.size; Y[a*3]=X[a*3]*0.5+x/m*0.5; Y[a*3+1]=X[a*3+1]*0.5+y/m*0.5; Y[a*3+2]=X[a*3+2]*0.5+z/m*0.5; }); X.set(Y); }
    const norms=()=>{ const Nn=new Float32Array(n*3), A=V(), Bv=V(), C=V(); for(let t=0;t<tri.length;t+=3){ const a=cn[tri[t]], b=cn[tri[t+1]], c=cn[tri[t+2]]; A.set(X[a*3],X[a*3+1],X[a*3+2]); Bv.set(X[b*3]-A.x,X[b*3+1]-A.y,X[b*3+2]-A.z); C.set(X[c*3]-A.x,X[c*3+1]-A.y,X[c*3+2]-A.z); Bv.cross(C); [a,b,c].forEach(v=>{ Nn[v*3]+=Bv.x; Nn[v*3+1]+=Bv.y; Nn[v*3+2]+=Bv.z; }); }
      nb.forEach((_,a)=>{ const l=Math.hypot(Nn[a*3],Nn[a*3+1],Nn[a*3+2])||1; Nn[a*3]/=l; Nn[a*3+1]/=l; Nn[a*3+2]/=l; }); return Nn; };
    let Nn=norms(); const Dd=d*F.unit, need=new Map();
    nb.forEach((_,a)=>{ const out=(X[a*3]-P0.getX(a))*Nn[a*3]+(X[a*3+1]-P0.getY(a))*Nn[a*3+1]+(X[a*3+2]-P0.getZ(a))*Nn[a*3+2]; need.set(a,Math.max(Dd*0.4,Dd-out)); });
    for(let it=0;it<5;it++){ const nx=new Map(); nb.forEach((ns,a)=>{ let s2=0, mx=0; ns.forEach(b=>{ s2+=need.get(b); mx=Math.max(mx,need.get(b)); }); nx.set(a,Math.max(need.get(a),it<2?mx*0.9:s2/ns.size)); }); nx.forEach((v,a)=>need.set(a,v)); }
    nb.forEach((_,a)=>{ const w=need.get(a); X[a*3]+=Nn[a*3]*w; X[a*3+1]+=Nn[a*3+1]*w; X[a*3+2]+=Nn[a*3+2]*w; }); Nn=norms();
    const mkGeo=(tris,extraOut)=>{ const ng=new THREE.BufferGeometry(), PA=new Float32Array(n*3), NA=new Float32Array(n*3); const eo=(extraOut||0)*F.unit;
      for(let q=0;q<n;q++){ const c=cn[q]; for(let e=0;e<3;e++){ PA[q*3+e]=X[c*3+e]+Nn[c*3+e]*eo; NA[q*3+e]=Nn[c*3+e]; } }
      ng.setAttribute('position',new THREE.BufferAttribute(PA,3)); ng.setAttribute('normal',new THREE.BufferAttribute(NA,3)); ['skinIndex','skinWeight','uv'].forEach(nm=>{ if(g.attributes[nm]) ng.setAttribute(nm,g.attributes[nm]); }); ng.setIndex(tris); return ng; };
    const add=(geo,m)=>{ const sm=new THREE.SkinnedMesh(geo,m); sm.castShadow=true; sm.frustumCulled=false; body.parent.add(sm); sm.bind(body.skeleton,body.bindMatrix); F.parts.push(sm); return sm; };
    let mm=typeof col==='object'&&col.isMaterial?col:mat(o.kind||'cloth',col);
    if(o.pat!=null){ const cl=new Float32Array(n*3), c0=lin(col), c1=lin(o.pat), ks=[...nb.keys()], hot=new Set(); for(let q=7;q<ks.length;q+=Math.max(1,Math.floor(ks.length/(o.patN||140)))){ hot.add(ks[q]); }   /* small soft spots, each one vertex: flowers at a distance */
      for(let q=0;q<n;q++){ const c=hot.has(cn[q])?c1:c0; cl[q*3]=c.r; cl[q*3+1]=c.g; cl[q*3+2]=c.b; } mm=mat(o.kind||'cloth',0xffffff,{vertexColors:true}); o._col=cl; }
    const gm=mkGeo(tri); if(o._col) gm.setAttribute('color',new THREE.BufferAttribute(o._col,3)); const main=add(gm,mm);
    // a band of trim round the edge (a ring or two of triangles in from it), standing a little proud
    if(o.trim){ const ring=new Set(edge); for(let k=1;k<(o.trimRings||2);k++){ const add2=[]; ring.forEach(a=>{ const ns=nb.get(a); if(ns) ns.forEach(b=>add2.push(b)); }); add2.forEach(b=>ring.add(b)); }
      const bt=[]; for(let t=0;t<tri.length;t+=3){ const a=cn[tri[t]],b=cn[tri[t+1]],c=cn[tri[t+2]]; if(ring.has(a)&&ring.has(b)&&ring.has(c)) bt.push(tri[t],tri[t+1],tri[t+2]); }
      if(bt.length) add(mkGeo(bt,0.0035),typeof o.trim==='object'&&o.trim.isMaterial?o.trim:mat('gold',o.trim)); }
    return main; }
  // ── paint the bare body by region ──
  function paint(F,fn,kind){ const body=F.body, g=body.geometry=body.geometry.clone(), R=F.D.reg, n=g.attributes.position.count, col=new Float32Array(n*3), c=new THREE.Color();
    const toL=SRGB(); for(let j=0;j<n;j++){ c.set(fn(R[j])); if(toL) c.convertSRGBToLinear(); col[j*3]=c.r; col[j*3+1]=c.g; col[j*3+2]=c.b; }
    g.setAttribute('color',new THREE.BufferAttribute(col,3)); body.material=mat(kind||'cloth',0xffffff,{vertexColors:true}); }
  // a townsperson's arms, less of a hero's: each arm vertex drawn toward its bone's line (in the body's bind space)
  function slim(F,k){ const body=F.body, g=body.geometry, P=g.attributes.position, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, R=F.D.reg, bones=body.skeleton.bones, inv=body.skeleton.boneInverses, bmi=new THREE.Matrix4().copy(body.bindMatrix).invert();
    const at=b=>V().setFromMatrixPosition(new THREE.Matrix4().copy(inv[bones.indexOf(b)]).invert()).applyMatrix4(bmi);
    const axis={}; ['l','r'].forEach(sd=>{ const ua=F.B['upperarm_'+sd], la=F.B['lowerarm_'+sd], ha=F.B['hand_'+sd]; if(ua&&la&&ha){ axis['upperarm_'+sd]=[at(ua),at(la),k.upperarm]; axis['lowerarm_'+sd]=[at(la),at(ha),k.forearm]; } });
    const v=V(), d=V(), q=V(); for(let j=0;j<P.count;j++){ if(R[j]!=='upperarm'&&R[j]!=='forearm') continue; let bi=0,bw=-1; for(let c=0;c<4;c++){ const w=[SW.getX(j),SW.getY(j),SW.getZ(j),SW.getW(j)][c]; if(w>bw){ bw=w; bi=[SI.getX(j),SI.getY(j),SI.getZ(j),SI.getW(j)][c]; } }
      const ax=axis[bones[bi].name]; if(!ax) continue; v.fromBufferAttribute(P,j); d.subVectors(ax[1],ax[0]); const t=Math.max(0,Math.min(1,q.subVectors(v,ax[0]).dot(d)/d.lengthSq())); q.copy(ax[0]).addScaledVector(d,t); v.sub(q).multiplyScalar(ax[2]).add(q); P.setXYZ(j,v.x,v.y,v.z); }
    P.needsUpdate=true; g.computeVertexNormals(); }
  function cut(F,regs){ const g=F.body.geometry, ix=g.index, R=F.D.reg, out=new Set(regs), keep=[]; for(let t=0;t<ix.count;t+=3){ const a=ix.getX(t),b=ix.getX(t+1),c=ix.getX(t+2); if(!(out.has(R[a])&&out.has(R[b])&&out.has(R[c]))) keep.push(a,b,c); } g.setIndex(keep); }
  function unitOf(F){ const hold=F.hold, K=F.K; const bb=new THREE.Box3().setFromObject(F.body); const toK=new THREE.Matrix4().copy(K.matrixWorld).invert(); bb.applyMatrix4(toK); return F.D.lh/Math.max(0.01,bb.max.y-bb.min.y); }
  function hook(K,F){ const a=K.animate; K.animate=function(){ const r=a.apply(this,arguments); if(F.hold.visible) F.sync(); return r; }; F.sync(); }
  const TW=new Map();
  function toonify(K,F){ const out=new Set(); K.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||!o.visible||o.userData.b3hid||!o.material||Array.isArray(o.material)) return; if(F.parts.includes(o)||(o.parent&&F.parts.includes(o.parent))) return;
      const src=o.material; if(src.isMeshBasicMaterial||src.isMeshToonMaterial||src.isSpriteMaterial||src.blending===THREE.AdditiveBlending||src.transparent&&src.opacity<0.9) return;
      let t=TW.get(src); if(!t){ t=twin(src,false); if(src.onBeforeCompile&&String(src.onBeforeCompile).includes('uBend')){ const ob=src.onBeforeCompile, tb=t.onBeforeCompile; t.onBeforeCompile=(sh,r)=>{ ob.call(src,sh,r); tb(sh,r); }; t.customProgramCacheKey=()=>'b3cloth'+(src.customProgramCacheKey?src.customProgramCacheKey():''); } TW.set(src,t); }
      o.material=t; out.add(t); }); return [...out]; }
  // ═══ the hero ═══
  const KEEP_HERO=new Set(['head','plume','cape','skirtF','skirtB','torso','sh','hand','shield','sabaton']);
  function hero(K){ if(!on()||!K||!K.rig||K.userData.b3||!K.sculpted) return null; K.userData.b3='loading';
    return get(FILE.M).then(g=>{ if(!g.userData.B3) return null; const F=Object.assign(build(K,g),{K,D:g.userData.B3,parts:[]}); F.unit=unitOf(F);
      const M=K.M, mail=mat('mail',0x2c2f36), steel=M.steel, gold=M.gold||mat('gold',0xe0b048);
      // plate that bends with the body takes the rig's own steel and gold (so a livery or a worn piece recolours it)
      const sk=m=>{ const c=toon({color:m.color.clone(),skinning:true},true); c.userData.from=m; return c; };
      /* the lineup's steel and gold (toon colours: the old ones were made for shiny-metal shading and go white here) */ const STC=lin('#76818f'), GDC=lin('#c99a34'); const ST=toon({color:STC,skinning:true},true), GD=toon({color:GDC,skinning:true},true), CS=toon({color:STC},true), CG=toon({color:GDC},true); F.mats=[ST,GD];
      paint(F,()=>0x2c2f36,'mail'); F.extra.forEach(o=>{ o.visible=false; });   // the helm, the gauntlets, the sabatons and the breastplate are the sculpt's
      // the plate on the limbs: thigh and greave, rerebrace and vambrace, each edged in gold — segmented, as on the sheet
      [['thigh',0.026],[['calf','boot'],0.024],['upperarm',0.022],['forearm',0.024],['foot',0.018]].forEach(([rg,d])=>shell(F,Array.isArray(rg)?rg:[rg],ST,d,rg==='foot'?4:10,{trim:GD,trimRings:2,any:true}));   // the sabatons too, on the body's own feet
      cut(F,['head','hand','foot','chest','belly']);   // under the helm, the gauntlets, the sabatons and the breastplate, nothing of the bare body
      // the poleyns and couters (knee and elbow cops) on the shin and forearm bones
      const cop=(bn,r,fwd,y)=>{ const b=F.B[bn]; if(!b) return; const g2=new THREE.Group(); const sp=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),CS); sp.scale.set(1,1.1,0.75); const rg=new THREE.Mesh(new THREE.TorusGeometry(r*1.02,r*0.13,6,20),CG); g2.add(sp,rg); g2.traverse(o=>{ o.castShadow=true; });
        // built in the rig's own units (K may be scaled), where the joint stands now (the body is still in the rest pose), then pinned to the bone
        K.updateMatrixWorld(true); const toK=new THREE.Matrix4().copy(K.matrixWorld).invert(), w=b.getWorldPosition(V()).applyMatrix4(toK); g2.position.set(w.x,w.y+y,w.z+fwd); K.add(g2); g2.updateMatrixWorld(true); b.attach(g2); F.parts.push(g2); };
      ['l','r'].forEach(sd=>{ cop('calf_'+sd,0.05,0.062,0.012); cop('lowerarm_'+sd,0.04,-0.05,0.008); });
      // the sculpt: keep what the new body doesn't make — the helm, plume, pauldrons, gauntlets, sabatons, surcoat, cowl,
      //  belt, cape and the shield; the old limb plate and the old under-body go
      const r=K.rig, limb=[r.L.hip,r.L.knee,r.R.hip,r.R.knee,r.AL.el,r.AR.el];
      limb.forEach(p=>p.children.forEach(o=>{ if(o.isMesh){ o.userData.b3hid=true; o.visible=false; } }));
      [r.AL.sh,r.AR.sh].forEach(p=>p.children.forEach(o=>{ if(o.isMesh&&o.userData.part==='steel'){ o.userData.b3hid=true; o.visible=false; } }));   // the old rerebrace under the pauldron
      if(K.body){ [K.body.body,K.body.split,...(K.body.shells||[])].forEach(o=>{ if(o&&o.isMesh){ o.userData.b3hid=true; o.visible=false; } }); }   // the old under-body (body.js)
      // sabatons: the foot of the old greave, cut off and kept
      // the sculpt's pieces take the same cel shading: each visible mesh gets a toon twin of its material (the cloth keeps its
      //  moving-cloth shader: its vertex code is kept and only the lighting changes)
      const twins=toonify(K,F);
      const s0=F.sync; F.sync=()=>{ s0(); for(const t of twins) if(!t.userData.fixed) t.color.copy(t.userData.src.color).multiplyScalar(t.userData.k||1); };
      K.userData.b3=F; hook(K,F); return F; }).catch(e=>{ K.userData.b3=null; if(window.DEBUG_B3) console.error('BODY3',e); return null; }); }
  // ═══ the townsfolk ═══
  // Each cast figure (cast.js) already wears its clothes as skinned shells, each in a named colour (shirt, shorts, gown,
  //  tabard, boots…). Which of the rig's joints each shell covers says which of the new body's regions it dresses, so
  //  everyone keeps their own clothes and colours — and the rigid pieces (hats, crowns, belts, aprons, gowns' skirts that
  //  move as cloth, the things they carry) stay on their pivots as they were.
  const FACE=new Set(['mouthD','teeth','eyeW','pupil','glint','lash','irisD','irisL','crease','blush','skin','iris','brow','lip','hair','beard']);   /* V194: not 'white' — Sir Aldric's helm is white */
  // the named, where their written design asks for more than their colours say (heroes.js, people.js)
  const NAMED={ elijah:{hair:'Hair_Buzzed',hairCol:0xf0eee8,beard:0xf0eee8,old:true,pat:{shirt:0xfdfdf6},hide:['flower']},   /* …and the white flowers on his orange shirt */   // Old Man Elijah: white hair, a big white beard
    king:{old:true,hair:'Hair_Buns'},   /* King Karl's man-bun */
    madison:{hair:'Hair_Long',hairCol:0xf0c860,gold:['chest']},   /* Princess Madison: long golden hair, the gold bodice */ sage:{old:true}, librarian:{old:true}, priest:{old:true} };
  const regionOfPivot=(r,o,y)=>o===r.torso?(y<0.98?'belly':'chest'):o===r.hips?'pelvis':(o===r.L.hip||o===r.R.hip)?'thigh':(o===r.L.knee||o===r.R.knee)?(y<0.1?'foot':y<0.3?'boot':'calf'):(o===r.AL.sh||o===r.AR.sh)?'upperarm':(o===r.AL.el||o===r.AR.el)?'forearm':(o===r.AL.hand||o===r.AR.hand)?'hand':o===r.head?'head':null;
  function coverage(mesh,r){ const g=mesh.geometry, ix=g.index, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, P=g.attributes.position, bones=mesh.skeleton.bones, cnt={}, seen=new Set();
    const n=ix?ix.count:P.count; for(let t=0;t<n;t++){ const j=ix?ix.getX(t):t; if(seen.has(j)) continue; seen.add(j); let bi=0,bw=-1; for(let q=0;q<4;q++){ const w=SW.getComponent?SW.getComponent(j,q):[SW.getX(j),SW.getY(j),SW.getZ(j),SW.getW(j)][q]; if(w>bw){ bw=w; bi=[SI.getX(j),SI.getY(j),SI.getZ(j),SI.getW(j)][q]; } }
      const rg=regionOfPivot(r,bones[bi],P.getY(j)); if(rg) cnt[rg]=(cnt[rg]||0)+1; } return cnt; }
  const hex=c=>c&&c.isColor?c.getHex():c;
  function folkSpec(K){ const D=K.userData.castD, base=K.userData.castBase||{}, r=K.rig; if(!D||!K.body||!K.body.body) return null;
    const total=coverage(K.body.body,r), dress={}, kind={};
    const best={}; (K.body.shells||[]).forEach((sh,i)=>{ const c=coverage(sh,r), nm=(D.shells&&D.shells[i]&&D.shells[i].mat)||''; for(const rg in c){ const f=c[rg]/Math.max(1,total[rg]||c[rg]); const kd=(base[nm]&&base[nm][0])||'cloth'; if(kd==='gold'&&dress[rg]!=null&&f<0.9) continue;   /* gold is trim: it doesn't take a region from the plate or cloth it edges */
        if(f>0.3&&f>=(best[rg]||0)-0.15){ best[rg]=Math.max(f,best[rg]||0); dress[rg]=hex(sh.material.color); kind[rg]=(base[nm]&&base[nm][0])||'cloth'; } } });   /* the garment that covers most of a region (a trim covers little); an outer one wins a near tie */
    const N0=NAMED[(K.cast||'').replace(/^folk:/,'')]; if(N0&&N0.gold) N0.gold.forEach(rg=>{ dress[rg]=0xe0b84a; kind[rg]='cloth'; });
    // a shirt or tunic hangs over the waist: where the trousers (or shorts) reach up to the belly, the top comes down over it
    if(dress.chest!=null&&dress.belly!=null&&dress.belly!==dress.chest&&dress.belly===dress.thigh){ dress.belly=dress.chest; kind.belly=kind.chest; }
    const hasHat=[]; r.head.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&o.userData.mat&&!FACE.has(o.userData.mat)) hasHat.push(o); });
    const N=NAMED[(K.cast||'').replace(/^folk:/,'')]||{}, fem=D.body==='woman';
    const hairCol=N.hairCol!==undefined?N.hairCol:base.hair?base.hair[1]:0x4a3020, beard=N.beard!==undefined?N.beard:base.beard?base.beard[1]:null;
    let hair=N.hair||(base.hair?(fem?'Hair_Long':'Hair_SimpleParted'):null); if(hasHat.length&&hair&&!N.hair) hair=fem?'Hair_Buns':'Hair_Buzzed';   /* the named keep their own hair under a tiara or circlet */
    const pat={}; if(N.pat) (K.body.shells||[]).forEach((sh,i)=>{ const nm=D.shells&&D.shells[i]&&D.shells[i].mat; if(N.pat[nm]!=null) pat[hex(sh.material.color)]=N.pat[nm]; });
    return {fem,skin:base.skin?base.skin[1]:0xe0b080,dress,kind,hair,hairCol,beard,hats:hasHat,old:!!N.old,pat,hide:N.hide||[]}; }
  const HAIR={}; function hairSrc(f){ if(HAIR[f]) return HAIR[f]; return HAIR[f]=loadLibs().then(()=>new Promise((res,rej)=>new THREE.GLTFLoader().load(DIR+f+'.gltf',res,undefined,rej))); }
  function folk(K,given){ if(!on()||!K||!K.rig||K.userData.b3||(!K.userData.castD&&!given)) return null; const sp=given||folkSpec(K); if(!sp) return null; K.userData.b3='loading';
    const want=[get(sp.fem?FILE.F:FILE.M)]; if(sp.hair) want.push(hairSrc(sp.hair)); if(sp.beard!=null&&!sp.fem) want.push(hairSrc('Hair_Beard'));
    return Promise.all(want).then(([g,h1,h2])=>{ if(!g.userData.B3||!K.parent&&false) return null; const F=Object.assign(build(K,g,{natural:true}),{K,D:g.userData.B3,parts:[]}); F.unit=unitOf(F);
      const d=sp.dress, skin=sp.skin, clothOf=rg=>d[rg]!==undefined?d[rg]:null;
      // the bare body: skin where nothing is worn; under a garment, the garment's colour (so nothing shows through at a seam)
      paint(F,rg=>{ const c=clothOf(rg); if(c!=null) return c; if(rg==='belly'&&d.chest!=null) return d.chest; if(rg==='pelvis') return d.thigh!=null?d.thigh:d.belly!=null?d.belly:0x5a4632; return skin; },'skin');
      slim(F,sp.fem?{upperarm:0.9,forearm:0.93}:{upperarm:0.8,forearm:0.86});
      // the garments: one shell for each colour, over the regions it covers (cloth smoothed well, leather and steel a little less)
      const byCol={}; for(const rg in d){ if(rg==='head'||rg==='hand') continue; const k=d[rg]+'|'+(sp.kind[rg]||'cloth'); (byCol[k]=byCol[k]||[]).push(rg); }
      Object.keys(byCol).forEach(k=>{ const [c,kd]=k.split('|'), regs=byCol[k], thick=kd==='steel'?0.022:regs.includes('foot')?0.014:0.02; shell(F,regs,+c,thick,kd==='cloth'?26:10,{any:true,kind:kd==='steel'?'steel':kd==='leather'?'leather':'cloth',pat:sp.pat[+c]}); });   /* cloth smoothed hard, so it hangs as cloth rather than clinging to the muscle */
      // eyes keep their own texture; brows take the hair's colour
      F.extra.forEach(o=>{ const m=o.material; if(m&&m.map){ o.material=toon({map:m.map,skinning:true}); } else o.material=mat('fur',sp.hairCol); });
      // hair and beard, pinned to the head as the files stand them
      const head=F.B.Head, put=(src,col)=>{ if(!src) return; const h=src.scene.clone(true); h.traverse(o=>{ if(o.isMesh){ o.material=mat('fur',col,{skinning:!!o.isSkinnedMesh}); o.castShadow=true; } }); h.scale.multiplyScalar(F.s); F.root.parent.add(h); h.position.copy(F.root.position); h.quaternion.copy(F.root.quaternion); const hd=F.hold.worldToLocal(head.getWorldPosition(V())).sub(F.hold.worldToLocal(F.head0.clone())); h.position.add(hd); h.updateMatrixWorld(true); head.attach(h); F.parts.push(h); return h; };
      // the hair files stand in the base body's own rest pose: put them on before the skeleton is moved — so use the source's pose
      if(h1&&sp.hair) put(h1,sp.hairCol); const bd=sp.hair?h2:h1; if(sp.beard!=null&&!sp.fem&&bd) put(bd,sp.beard);
      // the old figure goes: its skinned body and clothes, its face and hair; its rigid pieces stay
      if(K.body) [K.body.body,K.body.split,...(K.body.shells||[])].forEach(o=>{ if(o&&o.isMesh) o.visible=false; });
      if(sp.make) sp.make(F,K);   // pieces made here (the older folk's hats and hoods)
      const r=K.rig; r.head.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&(!o.userData.mat||FACE.has(o.userData.mat))) o.visible=false; });
      K.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&o.userData.mat&&FACE.has(o.userData.mat)) o.visible=false; });
      // hats, crowns and hoods were made for the old head: set them on the new one (its crown is where the old one's was, give or take)
      if(sp.hats.length&&K.body){ const gb=K.body.body.geometry; gb.computeBoundingBox(); const dTop=F.top-gb.boundingBox.max.y, ws=V(); r.head.getWorldScale(ws); const ks=V(); K.getWorldScale(ks); const hsc=(ws.y/ks.y)||1;
        sp.hats.forEach(o=>{ o.position.y+=(dTop-F.dHead.y)/hsc+(sp.hair&&sp.hair!=='Hair_Buzzed'?0.012:0.004); }); }
      if(sp.hide.length) K.traverse(o=>{ if(o.isMesh&&sp.hide.includes(o.userData.mat)) o.visible=false; });   // pieces the new garment does itself (Elijah's flowers are on the shirt now)
      { const tw=toonify(K,F), s1=F.sync; F.sync=()=>{ s1(); for(const t of tw) if(!t.userData.fixed) t.color.copy(t.userData.src.color).multiplyScalar(t.userData.k||1); }; }   // hats, belts, aprons, skirts: the same cel shading
      if(sp.old){ const s0=F.sync, sp2=F.B.spine_02, nk=F.B.neck_01; F.sync=()=>{ s0(); if(sp2) sp2.rotateX(0.16); if(nk) nk.rotateX(-0.1); }; }   // the old stoop a little
      K.userData.b3=F; hook(K,F); return F; }).catch(e=>{ K.userData.b3=null; if(window.DEBUG_B3) console.error('BODY3 folk',e); return null; }); }
  // ── the older-built folk (heroes.js: some fishers, sailors, roadside folk, the generals): no rig of their own, only
  //  painted parts. As you come near, a bare rig is made for them, dressed on the new body from the colours they were
  //  built with (g.userData.b3spec), and swapped in where they stand — the old figure stays wherever the bodies can't load ──
  const LEATHER=0x3a2a1e;
  function specOf(o){ const d={}, kind={}, top=o.plate?0x8b96a4:o.top, bot=o.plate?0x76818f:o.bot, k=o.plate?'steel':'cloth';
    ['chest','belly','upperarm','forearm'].forEach(r=>{ d[r]=top; kind[r]=k; }); ['pelvis','thigh','calf'].forEach(r=>{ d[r]=o.robe?top:bot; kind[r]=o.robe?'cloth':k; });
    d.boot=o.robe?top:o.plate?0x76818f:LEATHER; kind.boot=o.robe?'cloth':o.plate?'steel':'leather'; d.foot=o.plate?0x5a6270:LEATHER; kind.foot=o.plate?'steel':'leather';
    if(o.apron!=null&&!o.robe){ d.belly=o.apron; }
    const hatCol=typeof o.hat==='number'?o.hat:null, hair=o.hair==null?null:(o.fem?(hatCol!=null?'Hair_Buns':'Hair_Long'):(hatCol!=null?'Hair_Buzzed':'Hair_SimpleParted'));
    return {fem:!!o.fem,skin:o.skin||0xe0b080,dress:d,kind,hair,hairCol:o.hair||0x4a3020,beard:o.beard&&!o.fem?o.beard:null,hats:[],old:false,pat:{},hide:[],
      make:(F,K)=>{ if(hatCol==null) return; const Hd=F.B.Head; if(!Hd) return; K.updateMatrixWorld(true); const toK=new THREE.Matrix4().copy(K.matrixWorld).invert(), hp=Hd.getWorldPosition(V()).applyMatrix4(toK), top=F.top, HR=(top-hp.y)*0.5, m=mat('cloth',hatCol,{skinning:false}), g=new THREE.Group();
        if(o.hood){ const h=new THREE.Mesh(new THREE.SphereGeometry(HR*1.32,16,12,0,Math.PI*2,0,Math.PI*0.62),m); h.position.set(0,-HR*0.05,-HR*0.12); g.add(h); }
        else if(o.helm){ const c=new THREE.Mesh(new THREE.SphereGeometry(HR*1.2,16,10,0,Math.PI*2,0,Math.PI/2),m), b=new THREE.Mesh(new THREE.CylinderGeometry(HR*1.7,HR*1.75,HR*0.08,20),m); b.position.y=HR*0.02; g.add(c,b); }
        else { const brim=new THREE.Mesh(new THREE.CylinderGeometry(HR*2.1,HR*2.2,HR*0.08,24),m), crown=new THREE.Mesh(new THREE.CylinderGeometry(HR*0.95,HR*1.12,HR*0.85,18),m); crown.position.y=HR*0.42; const band=new THREE.Mesh(new THREE.CylinderGeometry(HR*1.13,HR*1.13,HR*0.16,18),mat('cloth',0x6a3a2a,{skinning:false})); band.position.y=HR*0.12; g.add(brim,crown,band); }
        g.traverse(x=>{ x.castShadow=true; }); g.position.set(hp.x,top-HR*(o.hood?0.95:0.75),hp.z); K.add(g); g.updateMatrixWorld(true); Hd.attach(g); F.parts.push(g); } }; }
  function swapIn(f){ const g=f.g, o=g.userData.b3spec; if(!o||g.userData.b3swap) return; g.userData.b3swap=true; let K;
    try{ buildKnight.bare=true; K=buildKnight(); } catch(e){ return; } finally{ buildKnight.bare=false; }
    const r=K.rig; [r.sword,r.sheathP,r.backP,r.shM].forEach(x=>{ if(x) x.visible=false; }); K.setWeapon=()=>{}; K.draw=()=>{}; K.dress=()=>{}; K.setLivery=()=>{};
    K.scale.setScalar((o.H||0.93)/0.93*(o.fem?0.94:1)); K.userData.castK=K; K.cast='folk3';
    const p=folk(K,specOf(o)); if(!p) return; p.then(F=>{ if(!F||!g.parent||f.g!==g) return; K.position.copy(g.position); K.rotation.copy(g.rotation); g.parent.add(K); g.parent.remove(g); f.g=K; K.userData.oldG=g; }); }
  // the folk are dressed as you come near them, a few at a time (so a town doesn't stall loading)
  const _fp=new THREE.Vector3();
  setInterval(()=>{ if(!on()||typeof ENGINE==='undefined'||!ENGINE.level||!ENGINE.P||window.NO_FOLK3) return; const lv=ENGINE.level, P=ENGINE.P; let n=0;
    (lv.folk||[]).forEach(f=>{ if(n>=2) return; const K=f.g; if(!K||!K.userData||K.userData.b3||K.userData.b3swap) return; if(!K.userData.castD&&!K.userData.b3spec) return; if(Math.hypot(f.x-P.x,f.z-P.z)>40) return; n++; if(K.userData.castD) folk(K); else swapIn(f); }); },400);
  // the hero is dressed as soon as he stands in the world (and again if he is ever rebuilt)
  setInterval(()=>{ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K; if(K.sculpted&&!K.bare&&!K.userData.b3) hero(K); },500);
  return { hero, folk, folkSpec, swapIn, specOf, get on(){ return on(); }, get, build, shell, paint, cut, unitOf, hook, mat, REG };
})();
