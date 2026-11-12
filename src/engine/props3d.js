// ════════════════════════════════════════════════════════════════
//  PROPS3D — the sculpted furniture (tools/sculpt_props.py → PROPS_DATA): each piece baked with its shadows, painted by
//  slot from a room's palette (the wood, the quilt, the cushions), its geometry built once and shared by every copy.
//  PROPS3D.make(name, colours) → a Group standing on the floor at its origin (or null, when the models aren't loaded).
// ════════════════════════════════════════════════════════════════
const PROPS3D=(function(){
  const D=(typeof PROPS_DATA!=='undefined'&&PROPS_DATA)||null;
  const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
  const MT={}, WOOD=new Set(['wood','woodL','woodD']), SOFT=new Set(['linen','quilt','cushion','cushionL','bread']);
  function mat(slot,c){ const k=slot+'|'+c; if(MT[k]) return MT[k];
    let m; if(slot==='glass') m=new THREE.MeshPhongMaterial({color:c,shininess:90,specular:0x666666,transparent:true,opacity:0.85,vertexColors:true});
    else if(slot==='metal') m=new THREE.MeshPhongMaterial({color:c,shininess:60,specular:0x555555,vertexColors:true});
    else if(slot==='wax') m=new THREE.MeshLambertMaterial({color:c,emissive:0x3a3020,vertexColors:true});
    else { m=new THREE.MeshLambertMaterial({color:c,vertexColors:true}); if(WOOD.has(slot)&&typeof detailify==='function') detailify(m,{mode:'plank',amp:0.1}); }
    return MT[k]=m; }
  function geo(pt){ if(pt._g) return pt._g; const g=new THREE.BufferGeometry(), P=bin(pt.p,Int16Array), Q=bin(pt.q,Int8Array), C=bin(pt.c,Uint8Array), I=pt.i32?bin(pt.i,Uint32Array):bin(pt.i,Uint16Array);
    const n=C.length, pos=new Float32Array(n*3), nrm=new Float32Array(n*3), col=new Float32Array(n*3), soft=SOFT.has(pt.mat);
    for(let i=0;i<n*3;i++){ pos[i]=P[i]/16000; nrm[i]=Q[i]/127; }
    for(let i=0;i<n;i++){ const a=Math.pow(C[i]/255,0.85), v=soft?0.55+0.45*a:0.35+0.65*a; col[i*3]=col[i*3+1]=col[i*3+2]=v; }
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nrm,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(new THREE.BufferAttribute(I,1));
    g.computeBoundingSphere(); return pt._g=g; }
  function make(name,cols){ if(!D||!D.props[name]) return null; const g=new THREE.Group();
    D.props[name].forEach(pt=>{ const c=(cols&&cols[pt.mat]!=null)?cols[pt.mat]:D.mats[pt.mat]; const m=new THREE.Mesh(geo(pt),mat(pt.mat,c)); m.castShadow=true; m.receiveShadow=true; g.add(m); });
    return g; }
  // a room's palette as the furniture's colours: the timber from its dark wood, the cloth from its cloth
  function palette(pal,extra){ const C=h=>new THREE.Color(h), w=C(pal.wallD||0x5e3e24);
    return Object.assign({wood:w.clone().lerp(C(0xa07850),0.35).getHex(), woodL:w.clone().lerp(C(0xc09060),0.5).getHex(), woodD:w.clone().multiplyScalar(0.85).getHex(),
      quilt:pal.cloth||0x9a3a4a, cushion:pal.cloth||0x9a3a4a, cushionL:C(pal.cloth||0x9a3a4a).lerp(C(0xffffff),0.18).getHex()},extra||{}); }
  return { make, palette, get ready(){ return !!D; } };
})();
