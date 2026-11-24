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
  const files={}; let cur=null, want=null; try{ want=localStorage.getItem('klk3d_outfit3')||null; }catch(e){}
  const load=n=>files[n]||(files[n]=new Promise((res,rej)=>new THREE.GLTFLoader().load(DIR+n+'.gltf',res,undefined,rej)));
  const ramp=(()=>{ const d=new Uint8Array([140,140,140,255, 210,210,210,255, 255,255,255,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  // what the outfit hides while it's worn, to show again after
  function hideRest(K,F){ const keep=new Set(); [K.rig.AR.hand,K.rig.AL.hand].forEach(h=>h.traverse(o=>keep.add(o))); if(K.herald) K.herald.group.traverse(o=>keep.add(o)); K.traverse(o=>{ if(o.userData&&o.userData.isWeapon) o.traverse(q=>keep.add(q)); });
    const r=K.rig; [r.sword,r.sheathP,r.backP,r.shM].forEach(p=>p&&p.traverse(o=>keep.add(o)));   // the weapon wherever it is, and the shield
    const hid=[]; K.traverse(o=>{ if(!o.isMesh||keep.has(o)||o===F.body||o.userData.outfit3||F.extra.includes(o)) return; if(o.visible){ o.visible=false; hid.push(o); } }); return hid; }
  async function wear(K,id){ const F=K&&K.userData.b3; if(!F||typeof F!=='object'||!F.idx0) return false; off(K); const S=SETS[id]; if(!S) return false;
    let gl; try{ gl=await Promise.all(S.parts.map(load)); }catch(e){ console.warn('outfit3: could not load',e); return false; }
    const g=F.body.geometry, R=F.D.reg, out=new Set(S.cut), keep=[], ix=F.idx0; for(let t=0;t<ix.count;t+=3){ const a=ix.getX(t),b=ix.getX(t+1),c=ix.getX(t+2); if(!(out.has(R[a])&&out.has(R[b])&&out.has(R[c]))) keep.push(a,b,c); }
    const idxNow=g.index; BODY3.paint(F,rg=>rg==='head'||rg==='hand'?0xd9a67c:0x2c2f36,'mail'); F.body.geometry.setIndex(keep);   // his face and hands in skin, not the steel-grey the harness wore beneath
    const made=[]; gl.forEach(gltf=>gltf.scene.traverse(m=>{ if(!m.isSkinnedMesh) return; const bones=m.skeleton.bones.map(b=>F.B[b.name]); if(bones.some(b=>!b)) return;
      const sk=new THREE.Skeleton(bones,m.skeleton.boneInverses.map(x=>x.clone())), src=m.material; if(src.map){ src.map.encoding=THREE.LinearEncoding; src.map.needsUpdate=true; } const mt=new THREE.MeshToonMaterial({color:0xffffff,map:src.map||null,gradientMap:ramp,skinning:true,side:THREE.DoubleSide});
      const sm=new THREE.SkinnedMesh(m.geometry,mt); sm.userData.outfit3=true; sm.castShadow=true; sm.frustumCulled=false; sm.position.copy(F.body.position); sm.quaternion.copy(F.body.quaternion); sm.scale.copy(F.body.scale);
      F.body.parent.add(sm); sm.updateMatrixWorld(true); sm.bind(sk,F.body.bindMatrix.clone()); made.push(sm); }));
    const extraVis=F.extra.map(o=>o.visible); F.extra.forEach(o=>{ o.visible=true; });   // his eyes and brows, under the hood
    cur={K,id,made,hid:hideRest(K,F),idxNow,extraVis}; K.userData.outfit3=id; return true; }
  function off(K){ if(!cur) return; const F=K.userData.b3; cur.made.forEach(m=>m.parent&&m.parent.remove(m)); cur.hid.forEach(o=>{ o.visible=true; }); if(F&&F.body){ BODY3.paint(F,()=>0x2c2f36,'mail'); F.body.geometry.setIndex(cur.idxNow); }
    if(F&&F.extra) F.extra.forEach((o,i)=>{ o.visible=cur.extraVis[i]; }); cur=null; K.userData.outfit3=null; if(typeof ARMOR!=='undefined') ARMOR.apply(); }
  function set(id){ want=id||null; try{ want?localStorage.setItem('klk3d_outfit3',want):localStorage.removeItem('klk3d_outfit3'); }catch(e){} const K=typeof ENGINE!=='undefined'&&ENGINE.K; if(!K) return; if(want) wear(K,want); else off(K); }
  // while worn, keep the harness off (the armour code re-dresses on menus, saves and loads)
  setInterval(()=>{ if(typeof ENGINE==='undefined'||!ENGINE.K) return; const K=ENGINE.K, F=K.userData.b3;
    if(want&&!cur&&F&&typeof F==='object'&&K.userData.armor) wear(K,want);
    if(cur) K.traverse(o=>{ if(o.isMesh&&o.visible&&o.userData&&o.userData.armor&&!o.userData.outfit3){ o.visible=false; cur.hid.push(o); } }); },500);
  return { SETS, set, wear, off, get worn(){ return cur&&cur.id; }, get want(){ return want; } };
})();
