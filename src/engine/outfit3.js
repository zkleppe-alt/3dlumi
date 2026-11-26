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
  const files={}; let cur=null, want=null; try{ want=null; localStorage.removeItem('klk3d_outfit3'); }catch(e){}   /* V273: the test looks are retired — an old 'armour skinned' test, still switched on from V248, kept making its own copies of the armour */   /* V252: the Peasant clothes are the plain look now */
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
  const BASEP={tabard:'Male_Peasant_Body',arms:'Male_Peasant_Arms',legs:'Male_Peasant_Legs',sabatons:'Male_Peasant_Feet',cowl:'Male_Ranger_Head_Hood'}, HOOD=BASEP.cowl;   /* V256: the hood is the Hood slot's (once the cowl) */
  const BCUT={tabard:['chest','belly'],arms:['upperarm'],legs:['pelvis','thigh','calf'],sabatons:['foot','boot']};
  let bReady=false, bLoading=false, bGl=null, bSig=null;
  const GS=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  function baseReady(K){ const F=K&&K.userData.b3; return bReady&&!!F&&typeof F==='object'&&!!F.idx0; }
  function bLoad(){ if(bLoading) return; bLoading=true; const names=Object.values(BASEP);
    Promise.all(names.map(load)).then(gl=>{ bGl={}; names.forEach((n,i)=>bGl[n]=gl[i]); bReady=true; rebase(); }).catch(e=>{ console.warn('outfit3: plain clothes could not load',e); }); }
  function rebase(){ const K=typeof ENGINE!=='undefined'&&ENGINE.K, S=K&&K.userData.armorS; if(!S||!S.ids||typeof ARMOR==='undefined') return; ARMOR.SLOTS.forEach(sl=>{ if(S.ids[sl]==='base') ARMOR.wear(K,sl,'base'); else if(sl==='cowl'&&S.ids[sl]){ const on=S.worn[sl]; ARMOR.wear(K,sl,S.ids[sl]); if(!on) ARMOR.set(K,sl,false); } }); bSig=null; }   /* V267: a set's hood (Templar's navy, the town hoods) was built before the hood model came and fell back to the old cowl */
  // one garment, skinned to the hero
  function garment(F,name,o){ const gltf=bGl[name]; let src=null; gltf.scene.traverse(m=>{ if(m.isSkinnedMesh&&!src) src=m; }); if(!src) return null;
    const bones=src.skeleton.bones.map(b=>F.B[b.name]); if(bones.some(b=>!b)) return null;
    const sk=new THREE.Skeleton(bones,src.skeleton.boneInverses.map(x=>x.clone())), sm0=src.material; if(sm0.map){ sm0.map.encoding=THREE.LinearEncoding; sm0.map.needsUpdate=true; }
    const names=src.skeleton.bones.map(b=>b.name), invs=src.skeleton.boneInverses; let geo=fitTo(F,src.geometry);
    if(o&&o.helm){ geo=overHelm(F,geo,names,invs); }                                                       /* V267: up over the helm, cut round it */
    if(o&&o.down){ geo=hoodDown(geo,names,{prof:backProf(F,names,invs),k:1}); }                            /* V267: down, lying on whatever is on his back */
    if(o&&o.trans){ geo=geo.clone(); geo.userData.base=geo.attributes.position.array.slice(); geo.userData.prof=backProf(F,names,invs); geo.userData.T=foldW(geo,names); }
    const st=name===HOOD&&o&&o.tint&&o.tint[0]==='S'?STY[o.tint.slice(1)]:null; let mt, decal=null;
    if(st){ const fit0=fitTo(F,src.geometry); if(geo===fit0) geo=geo.clone(); const grey=greyTex(sm0.map);    /* V268: the set's own hood — its cloth, a trim round the face and the hem, its mark on the back */
      splitTrim(geo,hoodEdge(fit0,names,F)); mt=[st.cloth,st.trim].map(sc=>new THREE.MeshToonMaterial({color:sc&&sc.color?sc.color.clone():0xffffff,map:grey,gradientMap:ramp,skinning:true,side:THREE.DoubleSide}));
      if(st.emblem&&!(o&&o.trans)) decal=emblemMesh(geo,fit0,names,st); }
    else mt=new THREE.MeshToonMaterial({color:0xffffff,map:(name===HOOD&&sm0.map?dyed(sm0.map,(o&&o.tint)||'brown'):sm0.map)||null,gradientMap:ramp,skinning:true,side:THREE.DoubleSide});
    const sm=new THREE.SkinnedMesh(geo,mt); if(st){ sm._style=st; } sm.userData.outfit3=true; sm.userData.garment=name+(o&&o.tint?':'+o.tint:'')+(o&&o.down?':down':'')+(o&&o.helm?':helm':'')+(o&&o.trans?':trans':''); sm.castShadow=true; sm.frustumCulled=false;
    sm.position.copy(F.body.position); sm.quaternion.copy(F.body.quaternion); sm.scale.copy(F.body.scale); F.body.parent.add(sm); sm.updateMatrixWorld(true); sm.bind(sk,F.body.bindMatrix.clone());
    if(decal){ sm.add(decal); decal.updateMatrixWorld(true); decal.bind(sk,F.body.bindMatrix.clone()); sm._decal=decal; }
    sm.visible=false; return sm; }
  /* ═══ V268: THE SET'S HOOD ═══ A hood a set names (g.hoodStyle: {id, cloth, trim, mark, emblem}) is cut in that set's cloth with a
     band of its trim round every open edge (the face and the hem), and its mark laid on the back of the crown as a small skinned
     patch of the hood's own triangles. The cloth keeps the artist's folds as a grey detail map. */
  const STY={};
  const greyC=new Map(); function greyTex(tex){ if(!tex||!tex.image||!tex.image.width) return null; if(greyC.has(tex.uuid)) return greyC.get(tex.uuid); const im=tex.image, cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height;
    const x=cv.getContext('2d'); x.drawImage(im,0,0); const D=x.getImageData(0,0,cv.width,cv.height), d=D.data; let sum=0, n=0; for(let i=0;i<d.length;i+=4){ sum+=0.3*d[i]+0.59*d[i+1]+0.11*d[i+2]; n++; } const mean=sum/n||128;
    for(let i=0;i<d.length;i+=4){ const l=(0.3*d[i]+0.59*d[i+1]+0.11*d[i+2])/mean, v=Math.max(0,Math.min(255,255*(0.82+0.32*(l-1)))); d[i]=d[i+1]=d[i+2]=v; } x.putImageData(D,0,0);
    const t=new THREE.CanvasTexture(cv); t.flipY=tex.flipY; t.wrapS=tex.wrapS; t.wrapT=tex.wrapT; greyC.set(tex.uuid,t); return t; }
  // each point's distance to the nearest open edge of the hood (seams of the UV map, where two points share a place, are not edges)
  // how near each point is to the hood's edges: the face opening (the frontmost band of the hood at each height) and the hem (its foot).
  //  The artist's hood is a closed shell — its rims are rolled, not open — so the edges are found by where they lie.
  const edgeC=new WeakMap(); function hoodEdge(g,names,F){ if(edgeC.has(g)) return edgeC.get(g); const P=g.attributes.position, n=P.count, T=foldW(g,names), D=new Float32Array(n);
    let y0=1e9; for(let i=0;i<n;i++) y0=Math.min(y0,P.getY(i));
    const Pb=F.body.geometry.attributes.position, R=F.D.reg, c=new THREE.Vector3(); let nh=0; for(let q=0;q<Pb.count;q++) if(R[q]==='head'){ c.x+=Pb.getX(q); c.y+=Pb.getY(q); c.z+=Pb.getZ(q); nh++; } c.multiplyScalar(1/Math.max(1,nh));
    const fp=[]; for(let q=0;q<Pb.count;q++) if(R[q]==='head'&&Pb.getZ(q)>c.z+0.02&&Pb.getY(q)>c.y-0.11) fp.push(Pb.getX(q),Pb.getY(q),Pb.getZ(q));   // the face
    for(let i=0;i<n;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i); let m=1e9; if(T[i]>0.2&&z>c.z-0.03) for(let j=0;j<fp.length;j+=3){ const dx=fp[j]-x, dy=fp[j+1]-y, dz=fp[j+2]-z, d=dx*dx+dy*dy+dz*dz; if(d<m) m=d; }
      D[i]=Math.min((y-y0)*1.4,Math.sqrt(m)-0.022); }
    edgeC.set(g,D); return D; }
  // the triangles near an edge drawn in the trim (a second material group), the rest in the cloth
  function splitTrim(g,D){ const n=g.attributes.position.count, ix=g.index?Array.from(g.index.array):Array.from({length:n},(_,i)=>i), cl=[], tr=[], W=0.026;
    for(let t=0;t<ix.length;t+=3){ const a=ix[t],b=ix[t+1],c=ix[t+2], d=(D[a]+D[b]+D[c])/3; (d<W?tr:cl).push(a,b,c); }
    g.setIndex(cl.concat(tr)); g.clearGroups(); g.addGroup(0,cl.length,0); g.addGroup(cl.length,tr.length,1); }
  // the set's mark, drawn once
  const markC={}; function markTex(kind){ if(markC[kind]) return markC[kind]; const N=128, cv=document.createElement('canvas'); cv.width=cv.height=N; const x=cv.getContext('2d'); x.fillStyle='#fff'; x.strokeStyle='#fff'; x.lineCap='round'; x.lineJoin='round';
    const cross=(cx,cy,r,w)=>{ x.fillRect(cx-w/2,cy-r,w,2*r); x.fillRect(cx-r,cy-w/2,2*r,w); };
    if(kind==='jcross'){ cross(64,64,40,14); [[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>{ x.fillRect(64+a*40-(b?16:4),64+b*40-(a?16:4),b?32:8,a?32:8); }); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>cross(64+a*28,64+b*28,9,5)); }   // the cross potent and four small crosses
    else if(kind==='leaf'){ x.beginPath(); x.moveTo(64,14); x.bezierCurveTo(104,40,100,92,64,116); x.bezierCurveTo(28,92,24,40,64,14); x.fill(); x.globalCompositeOperation='destination-out'; x.lineWidth=4; x.beginPath(); x.moveTo(64,24); x.lineTo(64,108); for(let i=0;i<4;i++){ x.moveTo(64,40+i*16); x.lineTo(46,30+i*16); x.moveTo(64,40+i*16); x.lineTo(82,30+i*16); } x.stroke(); x.globalCompositeOperation='source-over'; }
    else if(kind==='eye'){ x.lineWidth=8; x.beginPath(); x.moveTo(14,64); x.quadraticCurveTo(64,18,114,64); x.quadraticCurveTo(64,110,14,64); x.stroke(); x.beginPath(); x.arc(64,64,15,0,Math.PI*2); x.fill(); }
    else if(kind==='feather'){ x.save(); x.translate(64,64); x.rotate(-0.5); x.beginPath(); x.moveTo(0,-54); x.bezierCurveTo(26,-30,22,30,0,54); x.bezierCurveTo(-22,30,-26,-30,0,-54); x.fill(); x.globalCompositeOperation='destination-out'; x.lineWidth=3; x.beginPath(); x.moveTo(0,-48); x.lineTo(0,58); for(let i=-3;i<4;i++){ x.moveTo(0,i*12); x.lineTo(16,i*12-10); x.moveTo(0,i*12); x.lineTo(-16,i*12-10); } x.stroke(); x.restore(); }
    const t=new THREE.CanvasTexture(cv); markC[kind]=t; return t; }
  // the mark as a skinned patch of the hood's own triangles round the back of the crown (placed by the hood worn up, wherever it is now)
  function emblemMesh(geo,fit0,names,st){ const T=foldW(fit0,names), P0=fit0.attributes.position, n=P0.count; let ci=-1, zmin=1e9, ymin=1e9, ymax=-1e9;
    for(let i=0;i<n;i++) if(T[i]>0.85){ ymin=Math.min(ymin,P0.getY(i)); ymax=Math.max(ymax,P0.getY(i)); }
    for(let i=0;i<n;i++) if(T[i]>0.85&&P0.getY(i)<ymax-(ymax-ymin)*0.3&&P0.getZ(i)<zmin){ zmin=P0.getZ(i); ci=i; } if(ci<0) return null;
    const cx=P0.getX(ci), cy=P0.getY(ci)+0.015, cz=P0.getZ(ci), R=0.055, ix=geo.index?geo.index.array:null, nt=(ix?ix.length:n)/3, at=j=>ix?ix[j]:j, keep=[];
    for(let t=0;t<nt;t++){ let ok=true; for(let e=0;e<3;e++){ const v=at(t*3+e), dx=P0.getX(v)-cx, dy=P0.getY(v)-cy, dz=P0.getZ(v)-cz; if(dx*dx+dy*dy+dz*dz>R*R*2.2||dz>0.05){ ok=false; break; } } if(ok) keep.push(at(t*3),at(t*3+1),at(t*3+2)); }
    if(keep.length<9) return null; const uniq=[...new Set(keep)], re=new Map(uniq.map((v,i)=>[v,i])), m=uniq.length, P=geo.attributes.position, N=geo.attributes.normal;
    const pos=new Float32Array(m*3), uv=new Float32Array(m*2), si=new Float32Array(m*4), sw=new Float32Array(m*4), SI=geo.attributes.skinIndex, SW=geo.attributes.skinWeight;
    uniq.forEach((v,i)=>{ const nx=N?N.getX(v):0, ny=N?N.getY(v):0, nz=N?N.getZ(v):-1, out=nz>0?-1:1;   // stood just proud of the cloth, on its outer side
      pos[i*3]=P.getX(v)+nx*0.004*out; pos[i*3+1]=P.getY(v)+ny*0.004*out; pos[i*3+2]=P.getZ(v)+nz*0.004*out;
      uv[i*2]=0.5-(P0.getX(v)-cx)/(2*R); uv[i*2+1]=0.5+(P0.getY(v)-cy)/(2*R); for(let c=0;c<4;c++){ si[i*4+c]=SI.array[v*4+c]; sw[i*4+c]=SW.array[v*4+c]; } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setAttribute('skinIndex',new THREE.BufferAttribute(si,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4)); g.setIndex(keep.map(v=>re.get(v))); g.computeVertexNormals();
    const mt=new THREE.MeshToonMaterial({color:st.mark&&st.mark.color?st.mark.color.clone():0xffffff,map:markTex(st.emblem),gradientMap:ramp,skinning:true,side:THREE.DoubleSide,transparent:true,alphaTest:0.45,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const d=new THREE.SkinnedMesh(g,mt); d.frustumCulled=false; d.userData.outfit3=true; d.renderOrder=3; return d; }
  /* ═══ V267: THE HOOD, DOWN AND OVER A HELM ═══
     Down: the hood's crown swings back about a line behind the neck and falls as a pouch between the shoulder blades, its opening
     turned up round the nape; it is laid on what is actually on his back (the body, the tabard, the cuirass, the pauldrons — measured
     where they stand now, carried into the hood's bind space by the upper spine) and rides the upper spine. Up over a helm: the hood's
     crown is let out round the helm (the helm measured the same way, through the head bone), smoothed, so the cloth lies over it.
     A toggle plays: both hands go up and draw it over (or push it back), the hood swinging with them (hoodAnim). */
  const OUTFIT3_DBG={};
  const K_HD={y0:1.585,z0:-0.075,ang:2.9,bw:0.11,sag:0.05,gap:0.008,spread:0.3};   // test hooks: OUTFIT3.HD (bind space, the model's metres: he stands +y, faces +z)
  const sm3=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  // a matrix taking world points into the garment's bind space, through one bone (as a vertex wholly weighted to it would be)
  function toBind(F,bone,names,invs){ const bi=names.indexOf(bone), b=F.B[bone]; if(bi<0||!b) return null; try{ F.sync&&F.sync(); }catch(e){} F.body.parent.updateMatrixWorld(true);
    const Bi=F.body.bindMatrix.clone().invert(); return Bi.multiply(invs[bi].clone().invert()).multiply(b.matrixWorld.clone().invert()); }   // 'attached' binding: world = bone·boneInverse·bindMatrix·p
  const boneOf=(names,list)=>list.find(n=>names.indexOf(n)>=0);
  function ptsOf(K,slots,M,out){ const S=K.userData.armorS; if(!S||!M) return out; const v=new THREE.Vector3();
    slots.forEach(sl=>{ if(!S.worn[sl]) return; (S.groups[sl]||[]).forEach(g=>{ if(!g.visible||g.userData.garmentSlot) return; g.updateMatrixWorld(true);
      g.traverse(m=>{ if(!m.isMesh||m.userData.outfit3||!m.geometry||!m.geometry.attributes.position) return; let vis=true; for(let o=m;o&&o!==g;o=o.parent) if(!o.visible){ vis=false; break; } if(!vis) return;
        const A=m.geometry.attributes.position, st=Math.max(1,Math.floor(A.count/260)); for(let i=0;i<A.count;i+=st){ v.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld).applyMatrix4(M); out.push(v.x,v.y,v.z); } }); }); }); return out; }
  // how far back his back reaches (the hindmost z) over a grid of x, y — body and the armour on it
  function backProf(F,names,invs){ const K=typeof ENGINE!=='undefined'&&ENGINE.K; const NX=24,NY=30,X0=-0.36,Y0=1.0,D=0.03, Z=new Float32Array(NX*NY).fill(1e9);
    const add=(x,y,z)=>{ const i=Math.floor((x-X0)/D), j=Math.floor((y-Y0)/D); if(i<0||j<0||i>=NX||j>=NY) return; const k=j*NX+i; if(z<Z[k]) Z[k]=z; };
    const P=F.body.geometry.attributes.position, R=F.D.reg; for(let q=0;q<P.count;q++){ if(R[q]==='head') continue; add(P.getX(q),P.getY(q),P.getZ(q)); }
    const sp=boneOf(names,['spine_03','spine_04','spine_02']), M=K&&sp?toBind(F,sp,names,invs):null; if(M){ const a=ptsOf(K,['tabard','pauldrons','cowl','belt','helm'],M,[]); for(let i=0;i<a.length;i+=3) add(a[i],a[i+1],a[i+2]); }
    for(let pass=0;pass<3;pass++){ const Z2=Z.slice(); for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){ let m=Z[j*NX+i]; for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ const ii=i+di, jj=j+dj; if(ii<0||jj<0||ii>=NX||jj>=NY) continue; m=Math.min(m,Z[jj*NX+ii]+(di||dj?0.006:0)); } Z2[j*NX+i]=m; } Z.set(Z2); }   // filled and eased: never a pit for the cloth to sink into
    return (x,y)=>{ const fx=(x-X0)/D-0.5, fy=(y-Y0)/D-0.5, i=Math.max(0,Math.min(NX-2,Math.floor(fx))), j=Math.max(0,Math.min(NY-2,Math.floor(fy))), u=Math.max(0,Math.min(1,fx-i)), w=Math.max(0,Math.min(1,fy-j));
      const a=Z[j*NX+i],b=Z[j*NX+i+1],c=Z[(j+1)*NX+i],d=Z[(j+1)*NX+i+1]; if(a>1e8||b>1e8||c>1e8||d>1e8) return Math.min(a,b,c,d); return (a*(1-u)+b*u)*(1-w)+(c*(1-u)+d*u)*w; }; }
  // the fold: k = 0 up … 1 down. P0 the hood as worn up (positions), into P. prof keeps it off his back.
  // how much of each point is the hood proper (carried by the head) rather than the mantle round the neck: only that part folds
  function foldW(geo,names){ const hi=names.indexOf(boneOf(names,['Head','head'])||'Head'), ni=names.indexOf('neck_01'), SI=geo.attributes.skinIndex, SW=geo.attributes.skinWeight, P=geo.attributes.position, n=P.count, T=new Float32Array(n);
    for(let i=0;i<n;i++){ let w=0; for(let c=0;c<4;c++){ const b=SI.array[i*4+c], x=SW.array[i*4+c]; if(b===hi) w+=x; else if(b===ni) w+=0.35*x; } T[i]=sm3((w-0.25)/0.6)*sm3((P.getY(i)-K_HD.y0+0.04)/0.08); } return T; }
  function foldInto(P0,P,n,k,prof,T){ const y0=K_HD.y0, zP=K_HD.z0, A=K_HD.ang*k, gap=K_HD.gap;
    for(let i=0;i<n;i++){ let x=P0[i*3], y=P0[i*3+1], z=P0[i*3+2]; const t=T[i];
      if(t>0){ const a=A*t, dy=y-y0, dz=z-zP, c=Math.cos(a), s2=Math.sin(a); let ny=y0+dy*c+dz*s2, nz=zP-dy*s2+dz*c;
        const far=Math.max(0,y0-ny); ny-=K_HD.sag*k*t*far*1.2; nz-=0.03*k*t;      // the crown sags into a pouch, standing a little off the back
        x*=1+K_HD.spread*k*t*Math.max(0,1-Math.abs(x)*3);                       // and spreads out across the shoulder blades, lying open
        if(prof&&k>0.3){ const zb=prof(x,ny)-gap*(1+t); if(nz>zb) nz=nz+(zb-nz)*Math.min(1,(k-0.3)/0.4); }
        y=ny; z=nz; }
      P[i*3]=x; P[i*3+1]=y; P[i*3+2]=z; } }
  function hoodDown(geo,names,o){ const g=geo.clone(), P=g.attributes.position, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, n=P.count, P0=P.array.slice();
    const T=foldW(geo,names); foldInto(P0,P.array,n,o.k,o.prof,T);
    const sp=['spine_05','spine_04','spine_03','neck_01'].map(nm=>names.indexOf(nm)).find(i=>i>=0), nk=names.indexOf('neck_01');
    for(let i=0;i<n;i++){ const t=T[i]; if(sp!==undefined&&sp>=0&&t>0.15){ const wN=nk>=0?0.35*(1-t):0; SI.setXYZW(i,sp,nk>=0?nk:sp,0,0); SW.setXYZW(i,1-wN,wN,0,0); } }   // the folded part rides the upper spine
    P.needsUpdate=true; SI.needsUpdate=true; SW.needsUpdate=true; g.computeVertexNormals(); return g; }
  // up over a helm: the crown let out to clear the helm all round (an envelope of the helm seen from the head's middle)
  function overHelm(F,geo,names,invs){ const K=typeof ENGINE!=='undefined'&&ENGINE.K, hb=boneOf(names,['Head','head']), M=K&&hb?toBind(F,hb,names,invs):null; if(!M) return geo;
    const a=ptsOf(K,['helm'],M,[]); if(a.length<30) return geo; { const bb=new THREE.Box3(); for(let i=0;i<a.length;i+=3) bb.expandByPoint(new THREE.Vector3(a[i],a[i+1],a[i+2])); const hb2=new THREE.Box3(), Pq=F.body.geometry.attributes.position; for(let q=0;q<Pq.count;q++) if(F.D.reg[q]==='head') hb2.expandByPoint(new THREE.Vector3().fromBufferAttribute(Pq,q)); OUTFIT3_DBG.helm={helm:bb,head:hb2}; }
    const Pb=F.body.geometry.attributes.position, R=F.D.reg, c=new THREE.Vector3(); let nh=0; for(let q=0;q<Pb.count;q++) if(R[q]==='head'){ c.x+=Pb.getX(q); c.y+=Pb.getY(q); c.z+=Pb.getZ(q); nh++; } if(!nh) return geo; c.multiplyScalar(1/nh);
    const NE=10, NA=20, E=new Float32Array(NE*NA), bin=(dx,dy,dz)=>{ const r=Math.hypot(dx,dy,dz)||1e-6, el=Math.asin(Math.max(-1,Math.min(1,dy/r))), az=Math.atan2(dx,dz); return [Math.min(NE-1,Math.floor((el+Math.PI/2)/Math.PI*NE)),((Math.floor((az+Math.PI)/(2*Math.PI)*NA))%NA+NA)%NA,r]; };
    for(let i=0;i<a.length;i+=3){ const [e,z,r]=bin(a[i]-c.x,a[i+1]-c.y,a[i+2]-c.z); if(r>E[e*NA+z]) E[e*NA+z]=r; }
    for(let pass=0;pass<6;pass++){ const E2=E.slice(); for(let e=0;e<NE;e++) for(let z=0;z<NA;z++){ let m=E[e*NA+z], s=0, w=0; for(let de=-1;de<=1;de++) for(let dz=-1;dz<=1;dz++){ const ee=e+de; if(ee<0||ee>=NE) continue; const v=E[ee*NA+((z+dz)%NA+NA)%NA]; if(v>0){ s+=v; w++; m=Math.max(m,v*0.96); } } E2[e*NA+z]=E[e*NA+z]>0?(pass<3?E[e*NA+z]:Math.max(E[e*NA+z]*0.97,s/w)):(w?s/w:0); } E.set(E2); }   // holes filled, then eased round
    const g=geo.clone(), P=g.attributes.position, gap=0.01, neck=c.y-0.13;
    for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i), t=sm3((y-neck)/0.1); if(t<=0) continue; const [e,zb,r]=bin(x-c.x,y-c.y,z-c.z), need=E[e*NA+zb]+gap;
      if(r<0.02) continue; const want=Math.min(Math.max(r*1.01,need),r+0.07), k=(r+(want-r)*t)/r; P.setXYZ(i,c.x+(x-c.x)*k,c.y+(y-c.y)*k,c.z+(z-c.z)*k); }
    P.needsUpdate=true; g.computeVertexNormals(); return g; }
  // any point inside the body (or nearer it than gap) set out along the body's surface to the gap (bind space)
  function pushOut(F,g,gap){ const P=g.attributes.position, B=bodyIndex(F), R=F.D.reg, ok=q=>R[q]!=='head'; for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i), q=nearest(B,x,y,z,ok); if(q<0) continue;   /* out of the back and shoulders, not the head it no longer covers */
      const nx=B.N[q*3], ny=B.N[q*3+1], nz=B.N[q*3+2], d=(x-B.P.getX(q))*nx+(y-B.P.getY(q))*ny+(z-B.P.getZ(q))*nz; if(d<gap){ const k=gap-d; P.setXYZ(i,x+nx*k,y+ny*k,z+nz*k); } }
    P.needsUpdate=true; g.computeVertexNormals(); }
  // the Ranger's green hood dyed the brown of the Peasant's clothes (a copy of the texture; greens only)
  const DYE={brown:[0.075,0.55,0.78],navy:[0.62,0.95,0.6],crimson:[0.99,0.8,0.62],ash:[0.6,0.08,0.72],moss:[0.25,0.5,0.7],sand:[0.1,0.4,1.0]};   // hue, ×saturation, ×lightness
  const dyeC=new Map(); function dyed(tex,tint){ const D0=DYE[tint]||DYE.brown, key=tex.uuid+':'+tint; if(dyeC.has(key)) return dyeC.get(key); const im=tex.image; if(!im||!im.width) return tex;
    const cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height; const x=cv.getContext('2d'); x.drawImage(im,0,0); const D=x.getImageData(0,0,cv.width,cv.height), d=D.data, c=new THREE.Color(), hsl={};
    for(let i=0;i<d.length;i+=4){ c.setRGB(d[i]/255,d[i+1]/255,d[i+2]/255); c.getHSL(hsl); if(hsl.h>0.17&&hsl.h<0.5&&hsl.s>0.12){ c.setHSL(D0[0],Math.min(1,hsl.s*D0[1]),Math.min(1,hsl.l*D0[2])); d[i]=c.r*255; d[i+1]=c.g*255; d[i+2]=c.b*255; } }
    x.putImageData(D,0,0); const t=new THREE.CanvasTexture(cv); t.flipY=tex.flipY; t.encoding=tex.encoding; t.wrapS=tex.wrapS; t.wrapT=tex.wrapT; dyeC.set(key,t); return t; }
  function hoodState(S){ const armoured=ARMOR.SLOTS.some(sl=>sl!=='plume'&&sl!=='cowl'&&S.worn[sl]&&S.ids&&S.ids[sl]&&S.ids[sl]!=='base'), G=GS();
    const hg0=S.groups&&S.groups.helm&&S.groups.helm[0], helmOn=!!(S.worn.helm&&hg0&&!hg0.userData.garmentSlot), up=armoured?!!G.hoodArm:(G.hoodPlain!==false); return {armoured,up,helmOn}; }
  // V267: the hood drawn up or pushed back: both hands go up to it and it swings with them (0.9 s); the knight's arms read K._hoodG
  let hoodAnim=null;
  function hoodToggle(){ const K=typeof ENGINE!=='undefined'&&ENGINE.K, S=K&&K.userData.armorS; if(!S) return; const G=GS(), h=hoodState(S), cg=S.groups.cowl&&S.groups.cowl[0], cloth=!!(cg&&cg.userData.garmentSlot&&S.worn.cowl&&!cur);
    if(h.armoured) G.hoodArm=!h.up; else G.hoodPlain=!h.up;
    const now=performance.now(), dur=900; K._hoodG={t0:now,dur,up:!h.up,helm:h.helmOn};
    if(cloth&&bReady){ hoodAnim={K,t0:now,dur,up:!h.up,mesh:null}; bSig=null; bsync(); requestAnimationFrame(hoodStep); } else { bSig=null; bsync(); }
    if(ARMOR.hoodSync) ARMOR.hoodSync(K); }
  function hoodStep(){ const A=hoodAnim; if(!A) return; const t=Math.min(1,(performance.now()-A.t0)/A.dur), p=sm3((t-0.18)/0.64), k=A.up?1-p:p, m=A.mesh;
    if(m&&m.geometry.userData.base){ const g=m.geometry; foldInto(g.userData.base,g.attributes.position.array,g.attributes.position.count,k,g.userData.prof,g.userData.T); g.attributes.position.needsUpdate=true; if(((t*60)|0)%3===0) g.computeVertexNormals(); }
    if(t>=1){ hoodAnim=null; bSig=null; try{ bsync(); }catch(e){} return; } requestAnimationFrame(hoodStep); }
  function bsync(){ if(typeof ENGINE==='undefined'||!ENGINE.K||typeof ARMOR==='undefined') return; const K=ENGINE.K, F=K.userData.b3, S=K.userData.armorS;
    if(!F||typeof F!=='object'||!F.idx0||!S||!S.ids) return; if(!bReady){ if(BODY3&&!K.bare) bLoad(); return; }
    const G=K.userData.garm||(K.userData.garm={}), on={}, g0=sl=>S.groups[sl]&&S.groups[sl].length?S.groups[sl][0]:null;
    for(const sl in BASEP) on[sl]=!cur&&!!S.worn[sl]&&!!(g0(sl)&&g0(sl).userData.garmentSlot===sl);   /* V262: a set may wear the plain clothes in a slot it leaves plain */
    const hs=hoodState(S), cg=g0('cowl'), sty=cg&&cg.hoodStyle; if(sty) STY[sty.id]=sty; const tint=sty?'S'+sty.id:((cg&&cg.userData.hoodTint)||'brown'), hoodUp=hs.up, peltUp=!!(cg&&cg.userData.pelt&&S.worn.cowl&&hs.up&&!cur);
    const headBare=!cur&&(!S.worn.helm||!!(g0('helm')&&g0('helm').userData.garmentSlot));
    const shade=!headBare?'off':(on.cowl&&hoodUp?(hs.armoured?'light':'deep'):peltUp?'light':'none'), fpHide=!!(K._head&&!K._head.visible);
    // V267: which hood: up (let out over the helm when one is worn) or down (laid on what he wears on his back); a toggle plays between them
    const ids=S.ids||{}, wsig=sl=>S.worn[sl]?(ids[sl]||'-'):'0', helmSig=wsig('helm'), backSig=['tabard','pauldrons','belt','helm'].map(wsig).join('.');
    const upKey=HOOD+':'+tint+(hs.helmOn?':helm:'+helmSig:''), downKey=HOOD+':'+tint+':down:'+backSig, A=hoodAnim;
    const want={}; for(const sl in BASEP){ if(!on[sl]) continue; if(sl!=='cowl'){ want[BASEP[sl]]=true; continue; } if(A&&A.K===K) want[upKey+':trans']=true; else want[hoodUp?upKey:downKey]=true; }
    for(const k in want) if(!G[k]){ const [nm,tn,dn]=k.split(':'); G[k]=nm===HOOD?garment(F,nm,{tint:tn,helm:k.indexOf(':helm:')>0,down:dn==='down',trans:k.endsWith(':trans')}):garment(F,nm); }
    for(const k in G){ const m=G[k]; if(!m) continue; const v=!!want[k]&&!(fpHide&&k.startsWith(HOOD)); if(m.visible!==v) m.visible=v;
      if(!v&&k.startsWith(HOOD)&&k!==upKey&&k!==downKey&&!(A&&k===upKey+':trans')){ m.parent&&m.parent.remove(m); m.geometry.dispose(); if(m._decal) m._decal.geometry.dispose(); delete G[k]; } }   // other hoods let go (the armour changed under them)
    if(A&&A.K===K) A.mesh=G[upKey+':trans'];
    for(const k in G){ const m=G[k], st=m&&m._style; if(!st||!m.visible) continue; [st.cloth,st.trim].forEach((src,i)=>{ if(src&&src.color&&m.material[i]) m.material[i].color.copy(src.color); }); if(m._decal&&st.mark&&st.mark.color) m._decal.material.color.copy(st.mark.color); }   // a livery recolours it
    // the crest can't stand up through a cloth hood
    (S.groups.plume||[]).forEach(g=>{ const hide=!!(on.cowl&&hoodUp&&hs.helmOn&&!A)||(!hs.helmOn&&!!S.worn.plume); if(hide&&g.visible){ g.visible=false; g.userData.hoodHid=1; } else if(!hide&&g.userData.hoodHid){ delete g.userData.hoodHid; if(S.worn.plume) g.visible=true; } });
    const cut=new Set(); for(const sl in BCUT) if(on[sl]) BCUT[sl].forEach(r=>cut.add(r));
    const sig=[...cut].sort().join(',')+'|'+shade+'|'+(on.gauntlets=!cur&&S.worn.gauntlets&&S.ids.gauntlets==='base')+'|'+on.arms+'|'+(on.legs&&!on.sabatons);
    if(K._glint) K._glint.visible=shade==='deep'&&!fpHide&&!cur;
    if(cur||sig===bSig) return; bSig=sig;
    const R=F.D.reg, ix=F.idx0, keep=[]; if(cut.size){ for(let t=0;t<ix.count;t+=3){ const a=ix.getX(t),b=ix.getX(t+1),c=ix.getX(t+2); if(!(cut.has(R[a])&&cut.has(R[b])&&cut.has(R[c]))) keep.push(a,b,c); } }
    paintBase(F,shade,on.gauntlets,on.arms,on.legs&&!on.sabatons); F.body.geometry.setIndex(cut.size?keep:ix);
    const showFace=shade!=='off', ek=shade==='deep'?0.1:shade==='light'?0.62:1; F.extra.forEach(o=>{ o.visible=showFace; const m=o.material; if(m&&m.color){ m.color.setScalar(ek); } });
    glints(K,shade==='deep'); }
  // the skin: the face (under the hood, shaded as the hood shades it) and the bare hands; the rest of him the mail-grey under any armour
  const SKIN=0xd9a67c, MAIL=0x4c535e, HOSE=0x5a4a3a;
  function paintBase(F,shade,bareHands,bareArms,hose){ BODY3.paint(F,rg=>rg==='head'?(shade==='off'?MAIL:SKIN):rg==='hand'?(bareHands?SKIN:MAIL):rg==='forearm'?(bareArms?SKIN:MAIL):(hose&&(rg==='calf'||rg==='boot'||rg==='foot'))?HOSE:MAIL,'mail');   /* V260: breeches and other shoes: woollen hose on the calf */   /* the Peasant's sleeves end at the elbow: a bare forearm under the bracer */
    if(shade!=='deep'&&shade!=='light') return; const g=F.body.geometry, C=g.attributes.color, P=g.attributes.position, R=F.D.reg; let y0=1e9,y1=-1e9,z1=-1e9;
    for(let j=0;j<P.count;j++) if(R[j]==='head'){ y0=Math.min(y0,P.getY(j)); y1=Math.max(y1,P.getY(j)); z1=Math.max(z1,P.getZ(j)); }
    const sc=new THREE.Color(0x0b0b10); if(ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding) sc.convertSRGBToLinear();
    for(let j=0;j<P.count;j++){ if(R[j]!=='head') continue; const v=Math.max(0,Math.min(1,(P.getY(j)-y0)/((y1-y0)||1))), e=Math.pow(v,0.8), m=shade==='deep'?0.94+0.05*e:0.12+0.4*e;   /* shadow, not skin: a cool dark laid over the face, deepest under the hood's brow */
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
  return { SETS, skinArmor, unskinArmor, set, wear, off, baseReady, hoodToggle, hoodState:()=>{ const K=ENGINE.K, S=K&&K.userData.armorS; return S?hoodState(S):{}; }, bsync, HD:K_HD, DBG:OUTFIT3_DBG, get worn(){ return cur&&cur.id; }, get want(){ return want; } };
})();
