// ════════════════════════════════════════════════════════════════
//  BOSSART (V177) — the sculpted bosses (tools/sculpt_bosses.py → BOSS_DATA) put together: each part on its own pivot
//  (g.userData.bones: body, hd, aL, aR), eyes lit from deep sockets, glows and molten veins, crowns and manes of living
//  fire, a turning anti-halo, wings (two or four, membrane or burning).
//  BOSSART.make(key, opts) → THREE.Group, or null where the sculpt hasn't loaded. key: 'b0'..'b9', 'ab', 'pk'.
// ════════════════════════════════════════════════════════════════
const BOSSART=(function(){
  const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
  const GEO={};
  function geo(key,name,D){ const id=(D.p.length)+key+':'+name; if(GEO[id]) return GEO[id]; const g=new THREE.BufferGeometry(), P=bin(D.p,Int16Array), Q=bin(D.q,Int8Array), C=bin(D.c,Uint8Array), I=D.i32?bin(D.i,Uint32Array):bin(D.i,Uint16Array);
    const pos=new Float32Array(P.length), nor=new Float32Array(Q.length), col=new Float32Array(C.length); const QS=D.s||16000; for(let i=0;i<P.length;i++) pos[i]=P[i]/QS; for(let i=0;i<Q.length;i++) nor[i]=Q[i]/127; for(let i=0;i<C.length;i++) col[i]=C[i]/255;
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(new THREE.BufferAttribute(I,1)); if(typeof HIDE!=='undefined') HIDE.attr(g,D.k); g.computeBoundingSphere(); return GEO[id]=g; }
  const _H={}; function haloTex(){ if(_H.t) return _H.t; const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'), gr=x.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.35,'rgba(255,255,255,0.5)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return _H.t=new THREE.CanvasTexture(cv); }
  const sprite=(col,op)=>new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex(),color:col,transparent:true,opacity:op==null?0.6:op,depthWrite:false,blending:THREE.AdditiveBlending}));
  const gm=c=>new THREE.MeshBasicMaterial({color:c});
  let _TM=null; function toonMap(){ if(_TM) return _TM; const d=new Uint8Array([104,104,104,255,160,160,160,255,214,214,214,255,246,246,246,255]); _TM=new THREE.DataTexture(d,4,1,THREE.RGBAFormat); _TM.minFilter=_TM.magFilter=THREE.LinearFilter; _TM.needsUpdate=true; return _TM; }   /* V182: soft cel bands for the companions (o.toon) */
  function make(key,o){ o=o||{}; const SRC=o.data||(typeof BOSS_DATA!=='undefined'?BOSS_DATA:null), R=SRC&&SRC[key]; if(!R) return null;   /* V181: o.data — another sculpt set (the companions: PET_DATA) */
    const g=new THREE.Group(), PLATE=!o.data&&/^(b5|b7|b8|b9|ab|pk)$/.test(key), bodyM=(o.toon||(!o.phong&&!(typeof LOOK2!=='undefined'&&!LOOK2)))?new THREE.MeshToonMaterial({vertexColors:true,gradientMap:toonMap()}):new THREE.MeshPhongMaterial({vertexColors:true,shininess:PLATE?30:12,specular:PLATE?0x3a3640:0x1a1416}), bones={}, M=R.meta, anim=[]; if(typeof HIDE!=='undefined') HIDE.apply(bodyM,o.skinScale||1,o.skinAmt);
    Object.keys(R.parts).forEach(name=>{ const pv=R.piv[name]||[0,0,0], b=new THREE.Group(); b.position.set(pv[0],pv[1],pv[2]); const m=new THREE.Mesh(geo(key,name,R.parts[name]),bodyM); m.position.set(-pv[0],-pv[1],-pv[2]); m.castShadow=true; b.add(m); g.add(b); bones[name]=b; });
    // which bone a point of light rides on: the nearest part's pivot it falls under (head things on the head, hand things on the arm)
    const boneOf=p=>{ const hd=R.piv.hd; if(hd&&p[1]>hd[1]-0.08&&Math.abs(p[0])<0.36) return bones.hd; for(const n of ['aL','aR']){ const pv=R.piv[n]; if(pv&&Math.sign(p[0])===Math.sign(pv[0])&&Math.abs(p[0])>Math.abs(pv[0])*0.9) return bones[n]; } return bones.body; };
    const put=(obj,p)=>{ const b=boneOf(p), pv=b===bones.body?[0,0,0]:R.piv[Object.keys(bones).find(k=>bones[k]===b)]; obj.position.set(p[0]-pv[0],p[1]-pv[1],p[2]-pv[2]); b.add(obj); return obj; };
    /* V181: a kind creature's eyes (meta.kind): large, dark and glossy, a light in each — no socket, no glow */
    if(M.kind) (M.eyes||[]).forEach(([x,y,z,r,c])=>{ const sx=x<0?-1:1, o=[sx*0.62,0.08,0.78];   // a living eye: a coloured iris, a dark pupil, a light in it
      const e=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),new THREE.MeshPhongMaterial({color:c||0x1a120c,shininess:120,specular:0x9a9a9a})); put(e,[x,y,z]);
      const pu=new THREE.Mesh(new THREE.SphereGeometry(r*0.62,10,8),new THREE.MeshPhongMaterial({color:0x0a0606,shininess:140,specular:0xaaaaaa})); put(pu,[x+o[0]*r*0.5,y+o[1]*r*0.5,z+o[2]*r*0.5]);
      const gl=new THREE.Mesh(new THREE.SphereGeometry(r*0.2,6,5),gm(0xffffff)); put(gl,[x+o[0]*r*0.95+sx*-r*0.2,y+r*0.42,z+o[2]*r*0.95]); });
    else (M.eyes||[]).forEach(([x,y,z,r,c])=>{ const so=new THREE.Mesh(new THREE.SphereGeometry(r*1.8,10,8),gm(0x050204)); so.scale.set(1,0.75,0.4); put(so,[x,y,z-r*0.2]); const e=new THREE.Mesh(new THREE.SphereGeometry(r*0.65,8,6),gm(c||0xffd84a)); put(e,[x,y,z+r*0.2]); const h=sprite(c||0xffd84a,0.6); h.scale.setScalar(r*9); put(h,[x,y,z+r*0.4]); });
    (M.glows||[]).forEach(([x,y,z,r,c])=>{ const e=new THREE.Mesh(new THREE.SphereGeometry(Math.min(r*0.55,0.09),10,8),gm(c));   /* V182: a core, not a disc — the sculpts are solid now, it sits on the surface */ put(e,[x,y,z]); const h=sprite(c,0.55); h.scale.setScalar(Math.min(r*7,0.55));   /* a core glows; it isn't a sun */ put(h,[x,y,z]); anim.push(t=>{ h.material.opacity=0.42+0.18*Math.sin(t*3+x*9); }); });
    const V=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0);
    (M.veins||[]).forEach(([a,b,r,c])=>{ V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const L=V.length(); const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*0.7,L,5),gm(c)); m.quaternion.setFromUnitVectors(UP,V.normalize()); put(m,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); });
    (M.flames||[]).forEach(F=>{ const grp=new THREE.Group(); put(grp,F.at); const fl=[]; for(let i=0;i<F.n;i++){ const s=sprite(i%3?F.col:0xffd8a0,0.85); grp.add(s); fl.push({s,a:i/F.n*Math.PI*2,p:i*0.37}); }
      anim.push(t=>{ fl.forEach(f=>{ const u=(t*1.6+f.p)%1; f.s.position.set(Math.cos(f.a)*F.r*(1-u*0.6),u*F.r*2.2,Math.sin(f.a)*F.r*0.6*(1-u*0.6)); const sc=F.r*(1.4-u)*1.3; f.s.scale.set(sc,sc*1.4,1); f.s.material.opacity=0.85*(1-u); }); }); });
    if(M.halo){ const H=M.halo, hg=new THREE.Group(); hg.position.set(H.at[0],H.at[1],H.at[2]); g.add(hg); for(let i=0;i<H.n;i++){ const a=i/H.n*Math.PI*2, sh=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.34+((i*7)%3)*0.1,3),new THREE.MeshPhongMaterial({color:H.col,emissive:0x0a0610,specular:H.rim,shininess:90,flatShading:true})); sh.position.set(Math.cos(a)*H.r,Math.sin(a)*H.r,0); sh.rotation.z=a-Math.PI/2; hg.add(sh); }
      const rim=new THREE.Mesh(new THREE.TorusGeometry(H.r*0.78,0.012,6,48),gm(H.rim)); hg.add(rim); anim.push(t=>{ hg.rotation.z=t*0.4; }); }
    if(M.wings){ const W=M.wings, wm=new THREE.MeshPhongMaterial({color:W.col,side:THREE.DoubleSide,shininess:8,transparent:!!W.fire,opacity:W.fire?0.94:1});
      const pairs=W.four?[[0,1],[0.42,0.7]]:[[0,1]];
      pairs.forEach(([dy,sc],pi)=>[-1,1].forEach(sd=>{ const w=new THREE.Group(); w.position.set(sd*0.2,W.y-dy,W.z); g.add(w); if(pi===0) g['w'+sd]=w; else g['v'+sd]=w;
        const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(0.95,0.55); sh.lineTo(1.0,0.05); sh.quadraticCurveTo(0.84,-0.08,0.78,-0.36); sh.quadraticCurveTo(0.6,-0.3,0.52,-0.58); sh.quadraticCurveTo(0.34,-0.4,0.22,-0.64); sh.quadraticCurveTo(0.12,-0.36,0.0,-0.3); sh.lineTo(0,0);
        const mem=new THREE.Mesh(new THREE.ShapeGeometry(sh,8),wm); mem.scale.set(sd*W.s*sc*0.5,W.s*sc*0.5,1); mem.rotation.y=-sd*0.3; w.add(mem);
        [[0.95,0.55],[0.78,-0.36],[0.52,-0.58],[0.22,-0.64]].forEach(([x,y])=>{ const L=Math.hypot(x,y)*W.s*sc*0.5, bn=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.034,L,5),new THREE.MeshPhongMaterial({color:0x1a1014})); bn.position.set(sd*x*W.s*sc*0.25,y*W.s*sc*0.25,0.01); bn.rotation.z=-sd*(Math.PI/2-Math.atan2(y,x)); mem.parent.add(bn); bn.rotation.y=-sd*0.3; });
        if(W.fire) for(let i=0;i<6;i++){ const s=sprite(W.fire,0.7); const x=0.2+i*0.14, y=-0.3-Math.sin(i)*0.2; s.position.set(sd*x*W.s*sc*0.5,y*W.s*sc*0.5,0.05); s.scale.setScalar(0.3*sc); w.add(s); anim.push(t=>{ s.material.opacity=0.45+0.3*Math.sin(t*7+i); }); }
        if(W.rim){ const e=new THREE.Mesh(new THREE.ShapeGeometry(sh,8),new THREE.MeshBasicMaterial({color:W.rim,side:THREE.DoubleSide,transparent:true,opacity:0.25,blending:THREE.AdditiveBlending,depthWrite:false})); e.scale.set(sd*W.s*sc*0.52,W.s*sc*0.52,1); e.rotation.y=-sd*0.3; w.add(e); } })); }
    g.userData.mats=[bodyM]; g.userData.bones=bones; g.userData.key=key;
    let t0=Math.random()*10; g.userData.tickArt=dt=>{ t0+=dt||0.016; anim.forEach(f=>f(t0)); };
    g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); return g; }
  return {make,toonMap,has:k=>typeof BOSS_DATA!=="undefined"&&!!(BOSS_DATA&&BOSS_DATA[k])};
})();
