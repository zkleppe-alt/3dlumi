// ════════════════════════════════════════════════════════════════
//  BODY — the base human (tools/sculpt_body.py → data/body_<build>.json), a skinned mesh driven by a knight rig's own
//  joints: hips, torso, head, hip/knee and shoulder/elbow/hand each side. It is bound in the A-pose it was modelled in;
//  after that every animation the rig plays bends it.     BODY.attach(K, data, opts) → {mesh, head}
// ════════════════════════════════════════════════════════════════
const BODY=(function(){
  const MEMO=new Map();
  // a skinned figure is culled by its bind-pose bounds, padded for a stride or a raised arm — so the folk out of view
  //  (the far side of town, behind the camera) cost nothing, in the main pass and the shadow pass alike
  const cullable=m=>{ const g=m.geometry; if(!g.boundingSphere||!g.userData.padded){ g.computeBoundingSphere(); g.boundingSphere.radius+=0.45; g.userData.padded=true; } m.frustumCulled=true; };
  const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
  function geo(P,hide,keepI,off){ const g=new THREE.BufferGeometry(), p=bin(P.p,Int16Array), q=bin(P.q,Int8Array), si=bin(P.si,Uint8Array), sw=bin(P.sw,Uint8Array), n=P.n;
    const pos=new Float32Array(n*3), nrm=new Float32Array(n*3), idx=new Uint16Array(n*4), wt=new Float32Array(n*4);
    for(let i=0;i<n*3;i++){ nrm[i]=q[i]/127; pos[i]=p[i]/16000+(off?nrm[i]*off:0); }   /* a shell: the skin pushed out along its normals */ for(let i=0;i<n*4;i++){ idx[i]=si[i]; wt[i]=sw[i]/255; }
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
    g.setAttribute('skinIndex',new THREE.BufferAttribute(idx,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(wt,4));
    let I=keepI||(P.i32?bin(P.i,Uint32Array):bin(P.i,Uint16Array));
    if(hide){ const hid=i=>{ let w=0; for(let k=0;k<4;k++) if(hide.has(idx[i*4+k])) w+=wt[i*4+k]; return w>0.3; }, keep=[];   // leave out what armour hides entirely
      for(let t=0;t<I.length;t+=3) if(!(hid(I[t])&&hid(I[t+1])&&hid(I[t+2]))) keep.push(I[t],I[t+1],I[t+2]);
      I=n>65535?new Uint32Array(keep):new Uint16Array(keep); }
    g.setIndex(new THREE.BufferAttribute(I,1)); g.computeVertexNormals();
    { const nn=g.attributes.normal.array, uv=new Float32Array(n*2); for(let i=0;i<n;i++){ const ax=Math.abs(nn[i*3]), az=Math.abs(nn[i*3+2]); uv[i*2]=(ax>az?pos[i*3+2]:pos[i*3])*4; uv[i*2+1]=pos[i*3+1]*4; } g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); }   // for a painted surface (mail rings, cloth)
    return g; }
  function attach(K,D,o){ o=o||{}; const r=o.rig||K.rig, bones={hips:r.hips,torso:r.torso,head:r.head,hipL:r.L.hip,kneeL:r.L.knee,hipR:r.R.hip,kneeR:r.R.knee,
      shL:r.AL.sh,elL:r.AL.el,handL:r.AL.hand,shR:r.AR.sh,elR:r.AR.el,handR:r.AR.hand};
    const list=D.bones.map(n=>bones[n]);
    if(D.joints&&o.fitRig!==false){ r.AL.sh.position.x=D.joints.shX; r.AR.sh.position.x=-D.joints.shX; r.L.hip.position.x=D.joints.hipX; r.R.hip.position.x=-D.joints.hipX; }   // the rig takes this body's own shoulders and hips
    // the bind pose: everything at rest, the arms out as modelled
    const keep=list.map(b=>[b.position.clone(),b.rotation.clone()]);
    list.forEach(b=>b.rotation.set(0,0,0)); r.hips.position.set(0,K.hipY,0);
    r.AL.sh.rotation.z=D.aArm; r.AR.sh.rotation.z=-D.aArm; K.updateMatrixWorld(true);
    const mat=o.material||new THREE.MeshStandardMaterial({color:o.skin||0xd9a17e,roughness:0.62,metalness:0,skinning:true});
    const sk=new THREE.Skeleton(list), out={};
    const hide=o.hide?new Set(o.hide.map(n=>D.bones.indexOf(n))):null;
    const keepI=o.keepI||(o.keep?(o.keep32?bin(o.keep,Uint32Array):bin(o.keep,Uint16Array)):null);
    // a figure's skin and shells are built once and shared by every copy of that figure (the bones differ, not the mesh)
    const memo=(!hide&&!o.split&&(o.keepKey||o.keep))?(MEMO.get(D)||MEMO.set(D,new Map()).get(D)):null, mk=(key,fn)=>{ if(!memo) return fn(); if(!memo.has(key)) memo.set(key,fn()); return memo.get(key); };
    for(const k in D.parts){ const m=new THREE.SkinnedMesh(mk((o.keepKey||o.keep)+'#'+k,()=>geo(D.parts[k],hide,keepI)),mat); m.castShadow=true; cullable(m); K.add(m);
      m.updateMatrixWorld(true); m.bind(sk,m.matrixWorld); out[k]=m; }
    // a part of the body in a material of its own (a bare head over a body of padded cloth): split off by the bones it follows
    if(o.split){ const P=D.parts.body, si=bin(P.si,Uint8Array), sw=bin(P.sw,Uint8Array), set=new Set(o.split.bones.map(n=>D.bones.indexOf(n))), on=i=>{ let w=0; for(let k=0;k<4;k++) if(set.has(si[i*4+k])) w+=sw[i*4+k]/255; return w>0.5; };
      const all=P.i32?bin(P.i,Uint32Array):bin(P.i,Uint16Array), A=[], B=[]; for(let t=0;t<all.length;t+=3) (on(all[t])&&on(all[t+1])&&on(all[t+2])?A:B).push(all[t],all[t+1],all[t+2]);
      const T=P.n>65535?Uint32Array:Uint16Array; out.body.geometry.dispose(); out.body.geometry=geo(P,hide,new T(B));
      const m=new THREE.SkinnedMesh(geo(P,null,new T(A)),o.split.material); m.castShadow=true; cullable(m); K.add(m); m.updateMatrixWorld(true); m.bind(sk,m.matrixWorld); out.split=m; }
    // shells: clothes made of the body's own skin, pushed out and coloured, so they bend exactly as the body does
    out.shells=(o.shells||[]).map(sh=>{ const I=sh.i32?bin(sh.i,Uint32Array):bin(sh.i,Uint16Array), m=new THREE.SkinnedMesh(mk(sh._src||(sh.i+'#'+(sh.off||0)),()=>sh.p?geo(sh,null,I,0):geo(D.parts.body,null,I,sh.off)),sh.material);   /* a shell cut to its own outline, or the body's own triangles */
      m.castShadow=true; cullable(m); K.add(m); m.updateMatrixWorld(true); m.bind(sk,m.matrixWorld); m.name=sh.name; return m; });
    list.forEach((b,i)=>{ b.position.copy(keep[i][0]); b.rotation.copy(keep[i][1]); });
    return out; }
  return {attach};
})();
