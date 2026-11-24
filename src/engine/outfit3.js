// ════════════════════════════════════════════════════════════════
//  OUTFIT3 (V247, a TEST) — the knight in clothes an artist made: Quaternius's "Modular Character Outfits – Fantasy"
//  (Standard, CC0; models/look3/outfits/, licence in models/look3/LICENSE-modular-character-outfits-fantasy.txt).
//  Each part is a skinned mesh made for the very skeleton BODY3 already puts under the hero (the Universal Base
//  Characters' 65 bones), so it is bound to those same bones, with its own bind pose, and bends with the body as a
//  real garment does: no rigid plates on pivots, nothing to clip.
//  While it's on, the code-built harness (armor.js) and the plate shells step aside; the body keeps only what the
//  clothes leave bare (the face, the hands). His weapon and shield stay as they are.
//   ☰ System → "Test look": off / Ranger / Peasant (saved; switched live). Only where the model files can be fetched
//   (the hosted game, not the artifact preview, which can't load files).
// ════════════════════════════════════════════════════════════════
const OUTFIT3=(function(){
  const DIR='models/look3/outfits/', SETS={
    ranger:{name:'Ranger',parts:['Male_Ranger_Body','Male_Ranger_Arms','Male_Ranger_Legs','Male_Ranger_Feet_Boots','Male_Ranger_Head_Hood','Male_Ranger_Acc_Pauldron'],cut:['chest','belly','pelvis','upperarm','forearm','thigh','calf','foot']},
    peasant:{name:'Peasant',parts:['Male_Peasant_Body','Male_Peasant_Arms','Male_Peasant_Legs','Male_Peasant_Feet'],cut:['chest','belly','pelvis','upperarm','forearm','thigh','calf','foot']}};
  const files={}; let cur=null, want=null; try{ want=localStorage.getItem('klk3d_outfit3')||null; if(want==='peasant') want=null; }catch(e){}   /* V252: the Peasant clothes are the plain look now */
  const load=n=>files[n]||(files[n]=new Promise((res,rej)=>new THREE.GLTFLoader().load(DIR+n+'.gltf',res,undefined,rej)));
  const ramp=(()=>{ const d=new Uint8Array([140,140,140,255, 210,210,210,255, 255,255,255,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  // what the outfit hides while it's worn, to show again after
  function hideRest(K,F){ const keep=new Set(); [K.rig.AR.hand,K.rig.AL.hand].forEach(h=>h.traverse(o=>keep.add(o))); if(K.herald) K.herald.group.traverse(o=>keep.add(o)); K.traverse(o=>{ if(o.userData&&o.userData.isWeapon) o.traverse(q=>keep.add(q)); });
    const r=K.rig; [r.sword,r.sheathP,r.backP,r.shM].forEach(p=>p&&p.traverse(o=>keep.add(o)));   // the weapon wherever it is, and the shield
    const hid=[]; K.traverse(o=>{ if(!o.isMesh||keep.has(o)||o===F.body||o.userData.outfit3||F.extra.includes(o)) return; if(o.visible){ o.visible=false; hid.push(o); } }); return hid; }
  // ── V248: the clothes made for a lean man, let out to fit the hero's broad one. In the shared bind space, each point of a
  //  garment that lies inside (or too close to) the body is pushed out along the body's surface normal to sit just over it;
  //  the push is smoothed over the garment, so it swells like cloth, never tears ──
  const fitted=new Map();
  function bodyIndex(F){ if(F._bix) return F._bix; const g=F.body.geometry, P=g.attributes.position, n=P.count, N=new Float32Array(n*3), ix=F.idx0||g.index;
    const a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(), e1=new THREE.Vector3(), e2=new THREE.Vector3();
    for(let t=0;t<ix.count;t+=3){ const i=ix.getX(t), j=ix.getX(t+1), k=ix.getX(t+2); a.fromBufferAttribute(P,i); b.fromBufferAttribute(P,j); c.fromBufferAttribute(P,k); e1.subVectors(b,a); e2.subVectors(c,a); e1.cross(e2);
      for(const q of [i,j,k]){ N[q*3]+=e1.x; N[q*3+1]+=e1.y; N[q*3+2]+=e1.z; } }
    for(let q=0;q<n;q++){ const l=Math.hypot(N[q*3],N[q*3+1],N[q*3+2])||1; N[q*3]/=l; N[q*3+1]/=l; N[q*3+2]/=l; }
    const C=0.06, grid=new Map(), key=(x,y,z)=>Math.floor(x/C)+','+Math.floor(y/C)+','+Math.floor(z/C);
    for(let q=0;q<n;q++){ const k=key(P.getX(q),P.getY(q),P.getZ(q)); let L=grid.get(k); if(!L) grid.set(k,L=[]); L.push(q); }
    return F._bix={P,N,grid,C}; }
  function nearest(B,x,y,z,allow){ const {P,grid,C}=B, gx=Math.floor(x/C), gy=Math.floor(y/C), gz=Math.floor(z/C); let best=-1, bd=1e9;
    for(let r=1;r<=3&&best<0;r++) for(let i=-r;i<=r;i++) for(let j=-r;j<=r;j++) for(let k=-r;k<=r;k++){ const L=grid.get((gx+i)+','+(gy+j)+','+(gz+k)); if(!L) continue;
      for(const q of L){ if(allow&&!allow(q)) continue; const d=(P.getX(q)-x)**2+(P.getY(q)-y)**2+(P.getZ(q)-z)**2; if(d<bd){ bd=d; best=q; } } }
    return best; }
  function fitTo(F,geo){ if(fitted.has(geo)) return fitted.get(geo); const g=geo.clone(), P=g.attributes.position, n=P.count, B=bodyIndex(F), gap=OUTFIT3_GAP;
    const keyOf=i=>Math.round(P.getX(i)*1e4)+','+Math.round(P.getY(i)*1e4)+','+Math.round(P.getZ(i)*1e4), ids=new Map(), uid=new Int32Array(n), pts=[];
    for(let i=0;i<n;i++){ const k=keyOf(i); let u=ids.get(k); if(u===undefined){ u=pts.length; ids.set(k,u); pts.push(i); } uid[i]=u; }
    const U=pts.length, D=new Float32Array(U*3);
    for(let u=0;u<U;u++){ const i=pts[u], x=P.getX(i), y=P.getY(i), z=P.getZ(i), q=nearest(B,x,y,z); if(q<0) continue;
      const nx=B.N[q*3], ny=B.N[q*3+1], nz=B.N[q*3+2], d=(x-B.P.getX(q))*nx+(y-B.P.getY(q))*ny+(z-B.P.getZ(q))*nz; if(d<gap){ const k=gap-d; D[u*3]=nx*k; D[u*3+1]=ny*k; D[u*3+2]=nz*k; } }
    // smooth the push over the garment's own edges, so it lets out evenly
    const nb=Array.from({length:U},()=>new Set()), ix=g.index; if(ix) for(let t=0;t<ix.count;t+=3){ const a=uid[ix.getX(t)], b=uid[ix.getX(t+1)], c=uid[ix.getX(t+2)]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
    for(let it=0;it<4;it++){ const D2=D.slice(); for(let u=0;u<U;u++){ if(!nb[u].size) continue; let sx=0,sy=0,sz=0; nb[u].forEach(v=>{ sx+=D[v*3]; sy+=D[v*3+1]; sz+=D[v*3+2]; }); const m=nb[u].size;
        D2[u*3]=Math.max(D[u*3]*0+0.5*D[u*3]+0.5*sx/m,0)*0+(0.5*D[u*3]+0.5*sx/m); D2[u*3+1]=0.5*D[u*3+1]+0.5*sy/m; D2[u*3+2]=0.5*D[u*3+2]+0.5*sz/m; }
      for(let u=0;u<U;u++){ const i=pts[u]; const keepOut=Math.hypot(D[u*3],D[u*3+1],D[u*3+2]), sm=Math.hypot(D2[u*3],D2[u*3+1],D2[u*3+2]); if(sm<keepOut*0.92&&sm>1e-6){ const k=keepOut/sm; D2[u*3]*=k; D2[u*3+1]*=k; D2[u*3+2]*=k; } }   // smoothing never lets a point fall back inside
      D.set(D2); }
    for(let i=0;i<n;i++){ const u=uid[i]; P.setXYZ(i,P.getX(i)+D[u*3],P.getY(i)+D[u*3+1],P.getZ(i)+D[u*3+2]); } P.needsUpdate=true; g.computeVertexNormals(); fitted.set(geo,g); return g; }
  const OUTFIT3_GAP=0.012;   // how far over the skin a garment sits (the model's metres)

  // ── V248: THE TEMPLAR HARNESS, SKINNED. The code-built pieces made into garments on the same skeleton: each point of a piece
  //  takes the bone weights of the body points nearest it (of the body's parts that piece may follow), and its place in the
  //  body's bind pose is found by undoing those bones' turn — so it stands exactly where it stood, and from then on bends with
  //  the body as cloth and plate on a real figure do. The helm, crest and gauntlets stay on their pivots (rigid things should). ──
  const ALLOW={tabard:['chest','belly','pelvis'],cowl:['chest','head'],belt:['belly','pelvis'],skirt:['pelvis','thigh'],pauldrons:['upperarm','chest'],arms:['upperarm','forearm'],legs:['thigh','calf'],sabatons:['calf','foot']};
  let skinned=null;
  function skinArmor(K){ const F=K.userData.b3, S=K.userData.armorS; if(!F||typeof F!=='object'||!S) return 0; unskinArmor(K);
    const body=F.body, sk=body.skeleton, B=bodyIndex(F), R=F.D.reg, SI=body.geometry.attributes.skinIndex, SW=body.geometry.attributes.skinWeight, nb=body.geometry.attributes.position.count;
    K.updateMatrixWorld(true); sk.update();
    // the body as it stands now (skinned), in the world
    const bm=sk.boneMatrices, mats=[]; for(let i=0;i<sk.bones.length;i++) mats.push(new THREE.Matrix4().fromArray(bm,i*16));
    const toW=new THREE.Matrix4().multiplyMatrices(body.matrixWorld,body.bindMatrixInverse), W=new Float32Array(nb*3), v=new THREE.Vector3(), t=new THREE.Vector3(), S4=new THREE.Matrix4();
    const skinMat=(ii,ww,out)=>{ out.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0); for(let k=0;k<4;k++){ if(!ww[k]) continue; const m=mats[ii[k]].elements, o=out.elements; for(let e=0;e<16;e++) o[e]+=m[e]*ww[k]; } return out; };
    for(let q=0;q<nb;q++){ v.fromBufferAttribute(B.P,q).applyMatrix4(body.bindMatrix); skinMat([SI.getX(q),SI.getY(q),SI.getZ(q),SI.getW(q)],[SW.getX(q),SW.getY(q),SW.getZ(q),SW.getW(q)],S4); v.applyMatrix4(S4).applyMatrix4(toW); W[q*3]=v.x; W[q*3+1]=v.y; W[q*3+2]=v.z; }
    const Cg=0.04*(F.s||1)*(1/Math.max(1e-4,new THREE.Vector3().setFromMatrixScale(body.matrixWorld).y)), grid=new Map(); const C=Math.max(0.01,new THREE.Vector3().setFromMatrixScale(body.matrixWorld).y*0.06);
    const toKl=new THREE.Matrix4().copy(K.matrixWorld).invert(), SX=new Float32Array(nb); for(let q=0;q<nb;q++){ v.set(W[q*3],W[q*3+1],W[q*3+2]).applyMatrix4(toKl); SX[q]=v.x; }   // each body point's side (the knight's own left/right)
    const key=(x,y,z)=>Math.floor(x/C)+','+Math.floor(y/C)+','+Math.floor(z/C); for(let q=0;q<nb;q++){ const k=key(W[q*3],W[q*3+1],W[q*3+2]); let L=grid.get(k); if(!L) grid.set(k,L=[]); L.push(q); }
    let sideOf=0;
    const near4=(x,y,z,ok)=>{ const gx=Math.floor(x/C), gy=Math.floor(y/C), gz=Math.floor(z/C), best=[]; for(let r=1;r<=12&&best.length<4;r+=(r<4?1:3)){ best.length=0;
        for(let i=-r;i<=r;i++) for(let j=-r;j<=r;j++) for(let k=-r;k<=r;k++){ const L=grid.get((gx+i)+','+(gy+j)+','+(gz+k)); if(!L) continue; for(const q of L){ if(!ok.has(R[q])) continue; if(sideOf&&(R[q]==='thigh'||R[q]==='calf'||R[q]==='foot')&&SX[q]*sideOf<-0.01) continue; const d=(W[q*3]-x)**2+(W[q*3+1]-y)**2+(W[q*3+2]-z)**2; best.push([d,q]); } }
        best.sort((a,b)=>a[0]-b[0]); best.length=Math.min(best.length,6); } return best; };
    const PELY=(()=>{ const pb=sk.bones.find(bn=>bn.name==='pelvis'); return pb?pb.getWorldPosition(new THREE.Vector3()).applyMatrix4(toKl).y:0.8; })();
    const inv=new THREE.Matrix4(), fromW=new THREE.Matrix4().copy(toW).invert(), bindInv=new THREE.Matrix4().copy(body.bindMatrix).invert(), made=[], hid=[];
    for(const slot in ALLOW){ const ok=new Set(ALLOW[slot]); (S.groups[slot]||[]).forEach(gr=>{ if(!gr.visible) return; gr.traverse(m=>{ if(!m.isMesh||m.isSkinnedMesh||!m.visible) return; let vis=true; for(let p=m;p;p=p.parent) if(!p.visible) vis=false; if(!vis) return;
        const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(), P=geo.attributes.position, n=P.count, si=new Float32Array(n*4), sw=new Float32Array(n*4);
        m.updateMatrixWorld(true);
        for(let i=0;i<n;i++){ v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld); t.copy(v).applyMatrix4(toKl); sideOf=(slot==='skirt'||slot==='legs'||slot==='sabatons')?(Math.abs(t.x)<0.02?0:Math.sign(t.x)):0;   /* a leg's plate, or a skirt's side, follows its own leg only */
          let nr=near4(v.x,v.y,v.z,ok); if(!nr.length){ const ss=sideOf; sideOf=0; nr=near4(v.x,v.y,v.z,ok); sideOf=ss; } if(!nr.length) nr=near4(v.x,v.y,v.z,new Set(['pelvis','belly','chest','thigh','upperarm']));   /* never left unweighted (a point with no bones collapses to the origin) */
          // the weights: the nearest body points', blended by nearness
          const acc=new Map(); let tot=0; nr.forEach(([d,q])=>{ const w0=1/(Math.sqrt(d)+1e-4); tot+=w0; [[SI.getX(q),SW.getX(q)],[SI.getY(q),SW.getY(q)],[SI.getZ(q),SW.getZ(q)],[SI.getW(q),SW.getW(q)]].forEach(([b,w])=>{ if(w>0) acc.set(b,(acc.get(b)||0)+w*w0); }); });
          if(slot==='skirt'){ const pel=sk.bones.findIndex(bn=>bn.name==='pelvis'); let s0=0; acc.forEach(w=>s0+=w); const hang=Math.min(1,Math.max(0,(PELY-t.y)/0.35)), keep=sideOf?0.62-0.25*hang:0.85; acc.forEach((w,bn)=>acc.set(bn,w*(1-keep))); acc.set(pel,(acc.get(pel)||0)+s0*keep); }   /* the skirt hangs from the hips: the pelvis carries it, the thigh sways it */
          const top=[...acc.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4), s=top.reduce((a,e)=>a+e[1],0)||1; const ii=[0,0,0,0], ww=[0,0,0,0]; top.forEach(([b,w],k)=>{ ii[k]=b; ww[k]=w/s; });
          if(!top.length){ const pel=sk.bones.findIndex(bn=>bn.name==='pelvis'); ii[0]=pel; ww[0]=1; }
          si.set(ii,i*4); sw.set(ww,i*4);
          // its place in the bind pose: undo the blended bones' turn
          skinMat(ii,ww,S4); inv.copy(S4).invert(); t.copy(v).applyMatrix4(fromW).applyMatrix4(inv).applyMatrix4(bindInv); P.setXYZ(i,t.x,t.y,t.z); }
        geo.setAttribute('skinIndex',new THREE.Float32BufferAttribute(si,4)); geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4)); geo.computeVertexNormals();
        const mt=(Array.isArray(m.material)?m.material:[m.material]).map(x=>{ const c=x.clone(); c.skinning=true; c.needsUpdate=true; return c; });
        const sm=new THREE.SkinnedMesh(geo,Array.isArray(m.material)?mt:mt[0]); sm.userData.outfit3=true; sm.userData.armorSkin=slot; sm.castShadow=true; sm.frustumCulled=false;
        sm.position.copy(body.position); sm.quaternion.copy(body.quaternion); sm.scale.copy(body.scale); body.parent.add(sm); sm.updateMatrixWorld(true); sm.bind(sk,body.bindMatrix.clone());
        m.visible=false; hid.push(m); made.push(sm); }); }); }
    skinned={K,made,hid,sig:sigOf(S)}; return made.length; }
  function unskinArmor(K){ if(!skinned) return; skinned.made.forEach(m=>{ m.parent&&m.parent.remove(m); m.geometry.dispose(); }); skinned.hid.forEach(o=>{ o.visible=true; }); skinned=null; }
  const sigOf=S=>Object.keys(ALLOW).map(k=>(S.ids&&S.ids[k])+':'+(S.groups[k]?S.groups[k].length:0)+':'+(S.worn[k]?1:0)).join('|');

  async function wear(K,id){ const F=K&&K.userData.b3; if(!F||typeof F!=='object'||!F.idx0) return false; off(K); if(id==='skinned'){ const n=skinArmor(K); cur={K,id,made:[],hid:[],idxNow:F.body.geometry.index,extraVis:F.extra.map(o=>o.visible)}; K.userData.outfit3=id; return n>0; } const S=SETS[id]; if(!S) return false;
    let gl; try{ gl=await Promise.all(S.parts.map(load)); }catch(e){ console.warn('outfit3: could not load',e); return false; }
    const g=F.body.geometry, R=F.D.reg, out=new Set(S.cut), keep=[], ix=F.idx0; for(let t=0;t<ix.count;t+=3){ const a=ix.getX(t),b=ix.getX(t+1),c=ix.getX(t+2); if(!(out.has(R[a])&&out.has(R[b])&&out.has(R[c]))) keep.push(a,b,c); }
    const idxNow=g.index; BODY3.paint(F,rg=>rg==='head'||rg==='hand'?0xd9a67c:0x4c535e,'mail'); F.body.geometry.setIndex(keep);   // his face and hands in skin, not the steel-grey the harness wore beneath
    const made=[]; gl.forEach(gltf=>gltf.scene.traverse(m=>{ if(!m.isSkinnedMesh) return; const bones=m.skeleton.bones.map(b=>F.B[b.name]); if(bones.some(b=>!b)) return;
      const sk=new THREE.Skeleton(bones,m.skeleton.boneInverses.map(x=>x.clone())), src=m.material; if(src.map){ src.map.encoding=THREE.LinearEncoding; src.map.needsUpdate=true; } const mt=new THREE.MeshToonMaterial({color:0xffffff,map:src.map||null,gradientMap:ramp,skinning:true,side:THREE.DoubleSide});
      const sm=new THREE.SkinnedMesh(fitTo(F,m.geometry),mt); sm.userData.outfit3=true; sm.castShadow=true; sm.frustumCulled=false; sm.position.copy(F.body.position); sm.quaternion.copy(F.body.quaternion); sm.scale.copy(F.body.scale);
      F.body.parent.add(sm); sm.updateMatrixWorld(true); sm.bind(sk,F.body.bindMatrix.clone()); made.push(sm); }));
    const extraVis=F.extra.map(o=>o.visible); F.extra.forEach(o=>{ o.visible=true; });   // his eyes and brows, under the hood
    cur={K,id,made,hid:hideRest(K,F),idxNow,extraVis}; K.userData.outfit3=id; return true; }
  function off(K){ unskinArmor(K); if(!cur) return; const F=K.userData.b3; cur.made.forEach(m=>m.parent&&m.parent.remove(m)); cur.hid.forEach(o=>{ o.visible=true; }); if(F&&F.body){ BODY3.paint(F,()=>0x4c535e,'mail'); F.body.geometry.setIndex(cur.idxNow); }
    if(F&&F.extra) F.extra.forEach((o,i)=>{ o.visible=cur.extraVis[i]; }); cur=null; K.userData.outfit3=null; bSig=null; if(typeof ARMOR!=='undefined') ARMOR.apply(); }
  function set(id){ want=id||null; try{ want?localStorage.setItem('klk3d_outfit3',want):localStorage.removeItem('klk3d_outfit3'); }catch(e){} const K=typeof ENGINE!=='undefined'&&ENGINE.K; if(!K) return; if(want) wear(K,want); else off(K); }
  // while worn, keep the harness off (the armour code re-dresses on menus, saves and loads)
  setInterval(()=>{ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K, F=K.userData.b3;
    if(want&&!cur&&F&&typeof F==='object'&&K.userData.armor) wear(K,want);
    if(cur&&cur.id==='skinned'){ const S=K.userData.armorS; if(S&&skinned&&sigOf(S)!==skinned.sig) skinArmor(K); }   // the wardrobe changed a piece: fit it again
    else if(cur) K.traverse(o=>{ if(o.isMesh&&o.visible&&o.userData&&o.userData.armor&&!o.userData.outfit3){ o.visible=false; cur.hid.push(o); } }); },500);

  // ═══ V252: THE PLAIN CLOTHES — Quaternius's Peasant (shirt and belt, sleeves and bracers, trousers, boots) and the Ranger's hood are what a
  //  slot wears with its armour off. Each is skinned to the hero's own bones and let out to his broad build (fitTo), and shows only while
  //  its slot is plain; the body is cut away beneath what is worn. The hood: up, the face in shadow, when he wears nothing but plain
  //  clothes; down on his shoulders when he wears armour, and up again at will (the face then only shaded). Where the files can't be had
  //  (the artifact, the classic look) the code-built plain clothes of armor_sets.js stand in. ═══
  const BASEP={tabard:'Male_Peasant_Body',arms:'Male_Peasant_Arms',legs:'Male_Peasant_Legs',sabatons:'Male_Peasant_Feet',helm:'Male_Ranger_Head_Hood'};
  const BCUT={tabard:['chest','belly'],arms:['upperarm','forearm'],legs:['pelvis','thigh','calf'],sabatons:['foot','boot']};
  let bReady=false, bLoading=false, bGl=null, bSig=null;
  const GS=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  function baseReady(K){ const F=K&&K.userData.b3; return bReady&&!!F&&typeof F==='object'&&!!F.idx0; }
  function bLoad(){ if(bLoading) return; bLoading=true; const names=Object.values(BASEP);
    Promise.all(names.map(load)).then(gl=>{ bGl={}; names.forEach((n,i)=>bGl[n]=gl[i]); bReady=true; rebase(); }).catch(e=>{ console.warn('outfit3: plain clothes could not load',e); }); }
  function rebase(){ const K=typeof ENGINE!=='undefined'&&ENGINE.K, S=K&&K.userData.armorS; if(!S||!S.ids||typeof ARMOR==='undefined') return; ARMOR.SLOTS.forEach(sl=>{ if(S.ids[sl]==='base') ARMOR.wear(K,sl,'base'); }); bSig=null; }
  // one garment, skinned to the hero
  function garment(F,name,o){ const gltf=bGl[name]; let src=null; gltf.scene.traverse(m=>{ if(m.isSkinnedMesh&&!src) src=m; }); if(!src) return null;
    const bones=src.skeleton.bones.map(b=>F.B[b.name]); if(bones.some(b=>!b)) return null;
    const sk=new THREE.Skeleton(bones,src.skeleton.boneInverses.map(x=>x.clone())), sm0=src.material; if(sm0.map){ sm0.map.encoding=THREE.LinearEncoding; sm0.map.needsUpdate=true; }
    let geo=fitTo(F,src.geometry); if(o&&o.down){ geo=hoodDown(geo,src.skeleton.bones.map(b=>b.name)); pushOut(F,geo,0.02); }
    const mt=new THREE.MeshToonMaterial({color:0xffffff,map:(name===BASEP.helm&&sm0.map?dyed(sm0.map):sm0.map)||null,gradientMap:ramp,skinning:true,side:THREE.DoubleSide});
    const sm=new THREE.SkinnedMesh(geo,mt); sm.userData.outfit3=true; sm.userData.garment=name+(o&&o.down?':down':''); sm.castShadow=true; sm.frustumCulled=false;
    sm.position.copy(F.body.position); sm.quaternion.copy(F.body.quaternion); sm.scale.copy(F.body.scale); F.body.parent.add(sm); sm.updateMatrixWorld(true); sm.bind(sk,F.body.bindMatrix.clone()); sm.visible=false; return sm; }
  // the hood thrown back: its crown folded down behind the neck onto the shoulders (bind space, the model's metres: he stands +y, faces +z);
  //  the folded part rides the upper spine, not the head, so it stays put when he turns his head; the mantle round the throat is left as it is
  function hoodDown(geo,names){ const g=geo.clone(), P=g.attributes.position, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, n=P.count;
    const sp=['spine_05','spine_04','spine_03','neck_01'].map(nm=>names.indexOf(nm)).find(i=>i>=0), nk=names.indexOf('neck_01');
    const y0=K_HD.y0, zP=K_HD.z0, A=K_HD.ang, top=1.87;
    for(let i=0;i<n;i++){ let x=P.getX(i), y=P.getY(i), z=P.getZ(i); const t=Math.max(0,Math.min(1,(y-y0)/0.08)); if(t<=0) continue;
      // fold about a line across the back of the neck; higher points fold the whole way, lower ones ease into it
      const a=A*t*t*(3-2*t), dy=y-y0, dz=z-zP, c=Math.cos(a), s2=Math.sin(a); let ny=y0+dy*c+dz*s2, nz=zP-dy*s2+dz*c;
      const sq=1-0.45*t; nz=zP+(nz-zP)*sq; x*=1+0.18*t;   // flattened against the back, a little wider over the shoulders
      ny-=0.03*t*Math.max(0,(y-1.7)/(top-1.7));
      P.setXYZ(i,x,ny,nz);
      if(sp!==undefined&&sp>=0&&t>0.2){ const wN=nk>=0?0.35*(1-t):0; SI.setXYZW(i,sp,nk>=0?nk:sp,0,0); SW.setXYZW(i,1-wN,wN,0,0); } }
    P.needsUpdate=true; SI.needsUpdate=true; SW.needsUpdate=true; g.computeVertexNormals(); return g; }
  const K_HD={y0:1.58,z0:-0.06,ang:2.8};   // test hooks: OUTFIT3.HD
  // any point inside the body (or nearer it than gap) set out along the body's surface to the gap (bind space)
  function pushOut(F,g,gap){ const P=g.attributes.position, B=bodyIndex(F), R=F.D.reg, ok=q=>R[q]!=='head'; for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i), q=nearest(B,x,y,z,ok); if(q<0) continue;   /* out of the back and shoulders, not the head it no longer covers */
      const nx=B.N[q*3], ny=B.N[q*3+1], nz=B.N[q*3+2], d=(x-B.P.getX(q))*nx+(y-B.P.getY(q))*ny+(z-B.P.getZ(q))*nz; if(d<gap){ const k=gap-d; P.setXYZ(i,x+nx*k,y+ny*k,z+nz*k); } }
    P.needsUpdate=true; g.computeVertexNormals(); }
  // the Ranger's green hood dyed the brown of the Peasant's clothes (a copy of the texture; greens only)
  const dyeC=new Map(); function dyed(tex){ if(dyeC.has(tex)) return dyeC.get(tex); const im=tex.image; if(!im||!im.width) return tex;
    const cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height; const x=cv.getContext('2d'); x.drawImage(im,0,0); const D=x.getImageData(0,0,cv.width,cv.height), d=D.data, c=new THREE.Color(), hsl={};
    for(let i=0;i<d.length;i+=4){ c.setRGB(d[i]/255,d[i+1]/255,d[i+2]/255); c.getHSL(hsl); if(hsl.h>0.17&&hsl.h<0.5&&hsl.s>0.12){ c.setHSL(0.075,hsl.s*0.55,hsl.l*0.78); d[i]=c.r*255; d[i+1]=c.g*255; d[i+2]=c.b*255; } }
    x.putImageData(D,0,0); const t=new THREE.CanvasTexture(cv); t.flipY=tex.flipY; t.encoding=tex.encoding; t.wrapS=tex.wrapS; t.wrapT=tex.wrapT; dyeC.set(tex,t); return t; }
  function hoodState(S){ const armoured=ARMOR.SLOTS.some(sl=>sl!=='plume'&&S.worn[sl]&&S.ids&&S.ids[sl]&&S.ids[sl]!=='base'), G=GS();
    const up=armoured?!!G.hoodArm:(G.hoodPlain!==false); return {armoured,up}; }
  function hoodToggle(){ const K=typeof ENGINE!=='undefined'&&ENGINE.K, S=K&&K.userData.armorS; if(!S) return; const G=GS(), h=hoodState(S); if(h.armoured) G.hoodArm=!h.up; else G.hoodPlain=!h.up; bSig=null; bsync(); }
  function bsync(){ if(typeof ENGINE==='undefined'||!ENGINE.K||typeof ARMOR==='undefined') return; const K=ENGINE.K, F=K.userData.b3, S=K.userData.armorS;
    if(!F||typeof F!=='object'||!F.idx0||!S||!S.ids) return; if(!bReady){ if(BODY3&&!K.bare) bLoad(); return; }
    const G=K.userData.garm||(K.userData.garm={}), on={}; for(const sl in BASEP) on[sl]=!cur&&!!S.worn[sl]&&S.ids[sl]==='base'&&!!(S.groups[sl]&&S.groups[sl].length&&S.groups[sl][0].userData.garmentSlot);
    const hs=hoodState(S), shade=on.helm?(hs.up?(hs.armoured?'light':'deep'):'none'):'off', fpHide=!!(K._head&&!K._head.visible);
    const want={}; for(const sl in BASEP){ if(!on[sl]) continue; want[sl==='helm'?BASEP.helm+(hs.up?'':':down'):BASEP[sl]]=true; }
    for(const k in want) if(!G[k]){ const [nm,dn]=k.split(':'); G[k]=garment(F,nm,{down:dn==='down'}); }
    for(const k in G){ const m=G[k]; if(!m) continue; const v=!!want[k]&&!(fpHide&&k.startsWith(BASEP.helm)); if(m.visible!==v) m.visible=v; }
    const cut=new Set(); for(const sl in BCUT) if(on[sl]) BCUT[sl].forEach(r=>cut.add(r));
    const sig=[...cut].sort().join(',')+'|'+shade+'|'+(on.gauntlets=!cur&&S.worn.gauntlets&&S.ids.gauntlets==='base');
    if(K._glint) K._glint.visible=shade==='deep'&&!fpHide&&!cur;
    if(cur||sig===bSig) return; bSig=sig;
    const R=F.D.reg, ix=F.idx0, keep=[]; if(cut.size){ for(let t=0;t<ix.count;t+=3){ const a=ix.getX(t),b=ix.getX(t+1),c=ix.getX(t+2); if(!(cut.has(R[a])&&cut.has(R[b])&&cut.has(R[c]))) keep.push(a,b,c); } }
    paintBase(F,shade,on.gauntlets); F.body.geometry.setIndex(cut.size?keep:ix);
    const showFace=shade!=='off', ek=shade==='deep'?0.1:shade==='light'?0.62:1; F.extra.forEach(o=>{ o.visible=showFace; const m=o.material; if(m&&m.color){ m.color.setScalar(ek); } });
    glints(K,shade==='deep'); }
  // the skin: the face (under the hood, shaded as the hood shades it) and the bare hands; the rest of him the mail-grey under any armour
  const SKIN=0xd9a67c, MAIL=0x4c535e;
  function paintBase(F,shade,bareHands){ BODY3.paint(F,rg=>rg==='head'?(shade==='off'?MAIL:SKIN):rg==='hand'?(bareHands?SKIN:MAIL):MAIL,'mail');
    if(shade!=='deep'&&shade!=='light') return; const g=F.body.geometry, C=g.attributes.color, P=g.attributes.position, R=F.D.reg; let y0=1e9,y1=-1e9,z1=-1e9;
    for(let j=0;j<P.count;j++) if(R[j]==='head'){ y0=Math.min(y0,P.getY(j)); y1=Math.max(y1,P.getY(j)); z1=Math.max(z1,P.getZ(j)); }
    const sc=new THREE.Color(0x121118); if(ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding) sc.convertSRGBToLinear();
    for(let j=0;j<P.count;j++){ if(R[j]!=='head') continue; const v=Math.max(0,Math.min(1,(P.getY(j)-y0)/((y1-y0)||1))), e=Math.pow(v,0.8), m=shade==='deep'?0.86+0.12*e:0.12+0.4*e;   /* shadow, not skin: a cool dark laid over the face, deepest under the hood's brow */
      C.setXYZ(j,C.getX(j)+(sc.r-C.getX(j))*m,C.getY(j)+(sc.g-C.getY(j))*m,C.getZ(j)+(sc.b-C.getZ(j))*m); } C.needsUpdate=true; }
  // in the deep shadow of the hood, two faint lights where his eyes are
  function glints(K,on){ const F=K.userData.b3; if(!K._glint){ if(!on) return; const eye=F.extra.find(o=>/eye/i.test(o.name))||F.extra[0]; if(!eye) return;
      eye.geometry.computeBoundingBox(); const bb=eye.geometry.boundingBox, c=new THREE.Vector3(); bb.getCenter(c); const hw=(bb.max.x-bb.min.x)*0.27;
      const hb=F.B.Head||F.B.head; if(!hb) return; const inv=new THREE.Matrix4().fromArray(eye.skeleton?eye.skeleton.boneInverses[eye.skeleton.bones.indexOf(hb)].elements:new THREE.Matrix4().elements);
      const g=new THREE.Group(), mt=new THREE.MeshBasicMaterial({color:0x9a8a66,transparent:true,opacity:0.75,depthWrite:false});
      [-1,1].forEach(sd=>{ const m=new THREE.Mesh(new THREE.SphereGeometry(0.0075,8,6),mt); m.position.set(c.x+sd*hw,c.y,bb.max.z+0.004).applyMatrix4(eye.bindMatrix).applyMatrix4(inv); g.add(m); });
      hb.add(g); K._glint=g; }
    K._glint.visible=on&&!(K._head&&!K._head.visible); }
  setInterval(()=>{ try{ bsync(); }catch(e){ if(window.DEBUG_ARMOR) console.error('outfit3 base',e); } },250);
  return { SETS, skinArmor, unskinArmor, set, wear, off, baseReady, hoodToggle, hoodState:()=>{ const K=ENGINE.K, S=K&&K.userData.armorS; return S?hoodState(S):{}; }, bsync, HD:K_HD, get worn(){ return cur&&cur.id; }, get want(){ return want; } };
})();
