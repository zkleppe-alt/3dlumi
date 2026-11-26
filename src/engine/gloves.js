// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//  GLOVES — V275. The gauntlets are gone: every glove is a SKIN on his real hand, the way the big games dress hands.
//  Each glove is a shell of the BODY3 body's own hand triangles (and the wrist's), pushed a few millimetres out and
//  skinned to the same bones — so it bends finger by finger with the hand and can never come loose or flip.
//  The glove comes with the vambrace: the Arms slot ("Arms & gloves") wears the glove that belongs to it (GLOVE below).
//  Styles: steel (plated glove: steel skin, a raised back, gold lames, a flared cuff) · leather · fur (leather with a fur
//  cuff) · deco (dyed in the set's colours, gilt trim, a gold mark on the back of the hand) · fingerless · wraps · none.
//  Everything is measured in the body's bind pose (a T-pose: the hand runs out along ±x, its back is +y).
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
(function(){
  if(typeof ARMOR==='undefined') return;
  const P=ARMOR.PIECES, OLD=Object.assign({},P.gauntlets);
  const hx=m=>m&&m.color?m.color.getHex():null;
  // the hand's frame in bind space, one per side: the wrist (hand points touching the forearm), the way to the fingertips,
  // the hand's middle; t = distance from the wrist toward the fingertips (0 … ~0.215), u = across the hand
  function frame(F){ if(F._hf) return F._hf; const g=F.body.geometry, P0=g.attributes.position, R=F.D.reg, ix=F.idx0||g.index, out={};
    [1,-1].forEach(sd=>{ const hv=[]; for(let i=0;i<P0.count;i++) if(R[i]==='hand'&&P0.getX(i)*sd>0) hv.push(i); if(!hv.length) return;
      const hs=new Set(hv), wr=new Set(); for(let t=0;t<ix.count;t+=3){ const v=[ix.getX(t),ix.getX(t+1),ix.getX(t+2)]; if(v.some(x=>hs.has(x))&&v.some(x=>R[x]==='forearm')) v.forEach(x=>{ if(hs.has(x)) wr.add(x); }); }
      const C=new THREE.Vector3(), W=new THREE.Vector3(), q=new THREE.Vector3(); hv.forEach(i=>C.add(q.fromBufferAttribute(P0,i))); C.multiplyScalar(1/hv.length);
      wr.forEach(i=>W.add(q.fromBufferAttribute(P0,i))); if(wr.size) W.multiplyScalar(1/wr.size); else W.copy(C).addScaledVector(new THREE.Vector3(sd,0,0),-0.1);
      const D=C.clone().sub(W).normalize(); let L=0; hv.forEach(i=>{ L=Math.max(L,q.fromBufferAttribute(P0,i).sub(W).dot(D)); });
      out[sd]={W,D,C,L}; });
    return F._hf=out; }
  function TU(F,P0,i){ const x=P0.getX(i), H=F._hf[x>0?1:-1]; if(!H) return [99,0]; const dx=x-H.W.x, dy=P0.getY(i)-H.W.y, dz=P0.getZ(i)-H.W.z; return [(dx*H.D.x+dy*H.D.y+dz*H.D.z)/(H.L/0.215), P0.getZ(i)-H.C.z]; }   // t scaled to a 0.215-long hand
  // one layer: the triangles of the hand and wrist that pass `keep`, as a skinned shell `d` out, put in the glove's group
  function layer(F,g,o){ const N0=F.body.geometry.attributes.normal;
    const keep=(a,b,c,P0)=>{ const A=TU(F,P0,a), B=TU(F,P0,b), C=TU(F,P0,c); if(A[0]===99||B[0]===99||C[0]===99) return false; const t=(A[0]+B[0]+C[0])/3, u=(A[1]+B[1]+C[1])/3;   /* by the triangle's middle: the forearm's triangles are long */
      if(t<o.t0||t>o.t1) return false; if(o.back!=null&&(N0.getY(a)+N0.getY(b)+N0.getY(c))/3<o.back) return false; if(o.shape&&!o.shape(t,u)) return false; return true; };
    const body=F.body, geo=body.geometry, ix0=geo.index, nParts=F.parts.length; if(F.idx0&&ix0!==F.idx0) geo.setIndex(F.idx0);   // the whole body (the hands may be cut away under clothes)
    let m=null; try{ m=BODY3.shell(F,['hand','forearm'],BODY3.mat(o.kind,o.col),o.d,o.it==null?1:o.it,{kind:o.kind,cut:keep,
      trim:o.trim!=null?BODY3.mat(o.trimKind||'gold',o.trim):undefined,trimRings:o.tr||1,pat:o.pat,patN:o.patN}); } finally{ if(geo.index!==ix0) geo.setIndex(ix0); }
    if(window.DEBUG_ARMOR) console.log("glove layer",o.kind,o.t0,o.t1,!!m,F.parts.length-nParts);
    const made=F.parts.splice(nParts); made.forEach(sm=>{ sm.parent&&sm.parent.remove(sm); sm.userData.keepMat=true; sm.userData.armor='gauntlets'; sm.userData.glove=true; g.add(sm); });   // skinned 'attached': where it hangs in the scene doesn't move it
    return m; }
  const dark=(c,k)=>new THREE.Color(c).multiplyScalar(k).getHex();
  // the styles, as layers (t in a 0.215 hand: the knuckles ~0.095, the fingertips 0.215; the wrist 0, the forearm below it)
  const band=(t0,t1,d,kind,col,o)=>Object.assign({t0,t1,d,it:0,kind,col},o||{});
  const STY={
    none:()=>[],
    leather:s=>{ const c=s.col||0x4a3020; return [{t0:-0.014,t1:1,d:0.0045,kind:'leather',col:c},band(-0.034,-0.004,0.0075,'leather',dark(c,0.62))]; },   // the glove, a turned cuff at the wrist
    fingerless:s=>{ const c=s.col||0x4a3020; return [{t0:-0.014,t1:0.104,d:0.0045,kind:'leather',col:c},band(-0.034,-0.004,0.0075,'leather',dark(c,0.62)),band(0.088,0.104,0.0065,'leather',dark(c,0.62))]; },
    wraps:s=>{ const c=s.col||0xd8c8a0; return [{t0:-0.04,t1:0.104,d:0.004,kind:'cloth',col:c},{t0:-0.04,t1:0.104,d:0.0068,it:0,kind:'cloth',col:dark(c,0.8),shape:t=>Math.floor((t+0.04)/0.017)%2===0}]; },   // linen bound round the palm, the fingers free
    fur:s=>[...STY.leather(s),{t0:-0.07,t1:0.004,d:0.017,it:16,kind:'cloth',col:s.fur||0x6a4a2e},{t0:-0.05,t1:-0.012,d:0.024,it:16,kind:'cloth',col:s.furTip||dark(s.fur||0x6a4a2e,1.2)}],   // a soft fur cuff, rolled
    deco:s=>[{t0:-0.014,t1:1,d:0.0045,kind:'leather',col:s.col},band(-0.03,-0.006,0.0075,'gold',s.trim),
      band(0.02,0.1,0.0078,'gold',s.trim,{back:0.4,shape:(t,u)=>Math.abs(t-0.058)/0.032+Math.abs(u)/0.02<1})],   // gilt at the wrist, a gold lozenge on the back of the hand
    steel:s=>{ const st=s.col||0x76818f, gd=s.trim||0xd6a640; return [
      {t0:-0.014,t1:1,d:0.0055,kind:'steel',col:st},                                           // the plated glove, jointed with the fingers
      {t0:-0.004,t1:0.09,back:0.3,d:0.0095,it:2,kind:'steel',col:dark(st,1.12)},              // the back plate
      band(0.086,0.102,0.012,'gold',gd,{back:0.2}),                                             // the knuckle ridge
      band(0.122,0.135,0.009,'gold',gd,{back:0.2}),band(0.155,0.168,0.009,'gold',gd,{back:0.2}),   // the finger lames
      {t0:-0.07,t1:0.006,d:0.019,it:6,kind:'steel',col:st},band(-0.072,-0.058,0.0215,'gold',gd),band(-0.006,0.008,0.0215,'gold',gd),   // the flared cuff, gilt at both edges
      ...(s.fur?[{t0:-0.1,t1:-0.06,d:0.026,it:16,kind:'cloth',col:s.fur}]:[]) ]; } };
  // which glove goes with which vambrace (the set's own colours: '$x' is the set's material x)
  const GLOVE={ templar:['steel'], base:['none'], vambraces:['leather'], bracers:['fingerless'], mail:['leather',{col:0x3e2a1a}],
    striker:['fur',{col:0x2e1a12,fur:0xc0582a,furTip:0xf0e6dc}], guardian:['steel',{fur:0x5a3a22}], psalmist:['deco',{col:0xf1ece0,trim:'$gold'}],
    hearth:['fur',{col:0x6a4526,fur:0xe2d6bc,furTip:0xfff8ea}], ironforged:['steel'], tidecaller:['deco',{col:'$scarf',trim:'$gold'}], thornwarden:['fingerless',{col:0x4a3a22}],
    sandstrider:['wraps',{col:0xd8c8a0}], crystalborn:['steel'], emberforged:['steel'], tempest:['steel'], shade:['fingerless',{col:0x2a2630}], archangel:['steel'],
    lv_gilt:['steel'], lv_stormward:['steel'], lv_fallen:['steel'], lv_robby:['steel'], lv_champion:['steel'], lv_ranger:['fingerless',{col:0x5a3a1e}], lv_glory:['steel'], lv_deepwater:['deco',{col:'$tunic',trim:'$gold'}],
    gloves:['leather'], wraps:['wraps'] };
  function spec(id,M){ const g=GLOVE[id]||['leather'], o=Object.assign({},g[1]||{}); for(const k in o) if(typeof o[k]==='string'&&o[k][0]==='$') o[k]=hx(M[o[k].slice(1)]);
    if(g[0]==='steel'){ if(o.col==null) o.col=new THREE.Color(hx(M.steel)||0xa9b0bc).lerp(new THREE.Color(0x5e6774),0.75).getHex();   /* the metal ramp lifts steel: the lineup's steel, leaning to the set's */ if(o.trim==null) o.trim=hx(M.goldD||M.gold); } if(g[0]==='deco'&&o.col==null) o.col=hx(M.tunic)||0x2a3a6a; if(g[0]==='deco'&&o.trim==null) o.trim=hx(M.gold)||0xd6a640;
    return [g[0],o]; }
  function build(ctx,id){ const K=ctx.K, F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||typeof BODY3==='undefined'||!BODY3.shell) return false;
    const pal=ARMOR.PAL&&ARMOR.PAL[id], M=pal?Object.assign({},K.M,pal):K.M; let [st,o]=spec(id,M);
    if(K._fam==='fist'){ const bm=K.rig&&K.rig.AR.hand.box&&K.rig.AR.hand.box.material; st='steel'; o={col:new THREE.Color(hx(bm)||0xc9cdd6).lerp(new THREE.Color(0x76818f),0.5).getHex(),trim:hx(M.goldD||M.gold),fur:o.fur}; }   // fist weapons are worn as plated gloves
    frame(F); const g=new THREE.Group(); g.userData.armor='gauntlets'; g.userData.fitted=true; g.userData.glove=st; K.add(g); ctx.groups.push(g);
    (STY[st]||STY.leather)(o).forEach(L=>{ try{ layer(F,g,L); }catch(e){ if(window.DEBUG_ARMOR) console.error('glove',e); } });
    return true; }
  const NM={none:'Bare hands',leather:'Leather gloves',fingerless:'Fingerless gloves',wraps:'Hand wraps',fur:'Fur-cuffed gloves',deco:'Gloves',steel:'Plated gloves'};
  const ids=new Set([...Object.keys(P.arms||{}),...Object.keys(GLOVE)]);
  ids.forEach(id=>{ const old=OLD[id], A=P.arms[id]; P.gauntlets[id]={name:(A&&A.set&&id!=='base'?A.set+' ':'')+NM[(GLOVE[id]||['leather'])[0]].toLowerCase(),set:(A&&A.set)||(old&&old.set)||'Common',common:old?old.common:true,
    build:ctx=>{ if(build(ctx,id)) return; if(old) old.build(ctx); } }; });
  ARMOR.gloveFor=armsId=>!armsId||armsId==='base'?'base':(P.gauntlets[armsId]?armsId:'gloves');
  ARMOR.GLOVE=GLOVE;
})();
