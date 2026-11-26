// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//  LEGKIT — V276. The legs as one kit, built on the body the way the gloves are (V275): trousers, boots, plate — each a
//  layer of the BODY3 body's own leg triangles pushed out from it and skinned to the same bones, so it bends at the knee
//  and ankle with the leg and can't come loose. Raised parts (knee cops, shin keels, gold bands, the cuisse's edge) are
//  further layers on top. A layer's thickness can vary down the leg, which is what gives the trousers their medieval puff
//  (full at the thigh, bloused over the boot top). One Gear tile, "Legs & boots": each set brings its kit, plus common kits.
//  Measured in the body's bind pose: y is height (sole 0, ankle ~0.09, knee ~0.54, hip ~0.97), +z is the front.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
(function(){
  if(typeof ARMOR==='undefined') return;
  const P=ARMOR.PIECES, OLDL=Object.assign({},P.legs), OLDS=Object.assign({},P.sabatons);
  const hx=m=>m&&m.color?m.color.getHex():null, dark=(c,k)=>new THREE.Color(c).multiplyScalar(k).getHex();
  const LEGR=new Set(['pelvis','thigh','calf','boot','foot']);
  const bump=(y,c,w)=>Math.exp(-((y-c)/w)*((y-c)/w));
  // one layer: the leg triangles whose middle passes L.sel, pushed out by L.d (a number or a function of the bind point), skinned
  function layer(F,g,L){ const body=F.body, geo=body.geometry, P0=geo.attributes.position, N0=geo.attributes.normal, R=F.D.reg, cn=F.D.cn, ix=F.idx0||geo.index, n=P0.count;
    const RG=L.regs?new Set(L.regs):LEGR; const tri=[]; for(let t=0;t<ix.count;t+=3){ const a=ix.getX(t), b=ix.getX(t+1), c=ix.getX(t+2); if(!RG.has(R[a])||!RG.has(R[b])||!RG.has(R[c])) continue;
      const y=(P0.getY(a)+P0.getY(b)+P0.getY(c))/3, x=(P0.getX(a)+P0.getX(b)+P0.getX(c))/3, z=(P0.getZ(a)+P0.getZ(b)+P0.getZ(c))/3, nz=(N0.getZ(a)+N0.getZ(b)+N0.getZ(c))/3, ny=(N0.getY(a)+N0.getY(b)+N0.getY(c))/3;
      if(!L.regs&&R[a]==='pelvis'&&R[b]==='pelvis'&&R[c]==='pelvis'&&Math.abs(x)<0.02&&z>0.05) continue;   // not over the belly
      if(L.sel(y,Math.abs(x),z,nz,ny,R[a]+R[b]+R[c])) tri.push(a,b,c); }
    if(!tri.length) return null;
    const nb=new Map(), link=(a,b)=>{ if(a===b) return; if(!nb.has(a)) nb.set(a,new Set()); nb.get(a).add(b); };
    for(let t=0;t<tri.length;t+=3) for(let q=0;q<3;q++){ const a=cn[tri[t+q]], b=cn[tri[t+(q+1)%3]]; link(a,b); link(b,a); }
    // the open edge: an edge of the layer used by one of its triangles only
    const ec=new Map(); for(let t=0;t<tri.length;t+=3) for(let q=0;q<3;q++){ const a=cn[tri[t+q]], b=cn[tri[t+(q+1)%3]], k=a<b?a+'_'+b:b+'_'+a; ec.set(k,(ec.get(k)||0)+1); }
    const open=new Set(); ec.forEach((v,k)=>{ if(v===1){ const [a,b]=k.split('_'); open.add(+a); open.add(+b); } });
    const X=new Float32Array(n*3); for(let q=0;q<n;q++){ X[q*3]=P0.getX(q); X[q*3+1]=P0.getY(q); X[q*3+2]=P0.getZ(q); }
    for(let it=0;it<(L.it==null?2:L.it);it++){ const Y=new Float32Array(X); nb.forEach((ns,a)=>{ if(open.has(a)) return; let x=0,y=0,z=0; ns.forEach(b=>{ x+=X[b*3]; y+=X[b*3+1]; z+=X[b*3+2]; }); const m=ns.size; Y[a*3]=X[a*3]*0.5+x/m*0.5; Y[a*3+1]=X[a*3+1]*0.5+y/m*0.5; Y[a*3+2]=X[a*3+2]*0.5+z/m*0.5; }); X.set(Y); }
    const norms=()=>{ const Nn=new Float32Array(n*3), A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3();
      for(let t=0;t<tri.length;t+=3){ const a=cn[tri[t]], b=cn[tri[t+1]], c=cn[tri[t+2]]; A.set(X[a*3],X[a*3+1],X[a*3+2]); B.set(X[b*3]-A.x,X[b*3+1]-A.y,X[b*3+2]-A.z); C.set(X[c*3]-A.x,X[c*3+1]-A.y,X[c*3+2]-A.z); B.cross(C); [a,b,c].forEach(v=>{ Nn[v*3]+=B.x; Nn[v*3+1]+=B.y; Nn[v*3+2]+=B.z; }); }
      nb.forEach((_,a)=>{ const l=Math.hypot(Nn[a*3],Nn[a*3+1],Nn[a*3+2])||1; Nn[a*3]/=l; Nn[a*3+1]/=l; Nn[a*3+2]/=l; }); return Nn; };
    let Nn=norms(); const need=new Map(), df=typeof L.d==='function'?L.d:(()=>L.d);
    nb.forEach((_,a)=>{ const D=df(P0.getY(a),Math.abs(P0.getX(a)),P0.getZ(a),R[a])*F.unit, out=(X[a*3]-P0.getX(a))*Nn[a*3]+(X[a*3+1]-P0.getY(a))*Nn[a*3+1]+(X[a*3+2]-P0.getZ(a))*Nn[a*3+2]; need.set(a,Math.max(D*0.4,D-out)); });
    for(let it=0;it<4;it++){ const nx=new Map(); nb.forEach((ns,a)=>{ let s=need.get(a); ns.forEach(b=>s+=need.get(b)); nx.set(a,Math.max(need.get(a)*0.85,s/(ns.size+1))); }); nx.forEach((v,a)=>need.set(a,v)); }
    nb.forEach((_,a)=>{ const w=need.get(a); X[a*3]+=Nn[a*3]*w; X[a*3+1]+=Nn[a*3+1]*w; X[a*3+2]+=Nn[a*3+2]*w; }); Nn=norms();
    const ng=new THREE.BufferGeometry(), PA=new Float32Array(n*3), NA=new Float32Array(n*3); for(let q=0;q<n;q++){ const c=cn[q]; for(let e=0;e<3;e++){ PA[q*3+e]=X[c*3+e]; NA[q*3+e]=Nn[c*3+e]; } }
    ng.setAttribute('position',new THREE.BufferAttribute(PA,3)); ng.setAttribute('normal',new THREE.BufferAttribute(NA,3)); ['skinIndex','skinWeight','uv'].forEach(k=>{ if(geo.attributes[k]) ng.setAttribute(k,geo.attributes[k]); }); ng.setIndex(tri);
    const sm=new THREE.SkinnedMesh(ng,BODY3.mat(L.kind,L.col)); sm.castShadow=true; sm.frustumCulled=false; sm.userData.keepMat=true; sm.userData.armor=L.slot||'legs'; sm.userData.legKit=true; if(L.slot) sm.userData.furShell=true; g.add(sm); sm.bind(body.skeleton,body.bindMatrix); return sm; }
  // ── the parts ──  (front: nz>0; the boot top / trouser end heights are bind y)
  const all=()=>true;
  const BOOT={ tall:0.4, ankle:0.17, shoes:0.105, steel:0.2, bare:-1 };
  function trousers(col,end,o){ o=o||{}; const top=o.top||0.95, puff=o.puff==null?1:o.puff;   // full at the thigh, gathered and bloused just above where they end
    const tp=y=>y<0.84?1:Math.max(0.25,1-(y-0.84)/0.1), d=y=>tp(y)*(0.008+puff*(0.014*bump(y,0.72,0.15)+0.006*bump(y,0.42,0.12)+(end>0.12&&!o.tuck?0.012*bump(y,end+0.05,0.05):0)))*(o.tuck?Math.min(1,0.35+0.65*Math.max(0,(y-end)/0.12)):1);   // tucked: drawn in to slip under a greave   // easing to a close fit at the hips, under the tabard
    const L=[{sel:(y)=>y>end-0.005&&y<top,d,it:24,kind:'cloth',col}];
    if(o.cuff) L.push({sel:y=>y>end-0.005&&y<end+0.03,d:y=>d(y)+0.006,it:4,kind:'cloth',col:dark(col,0.8)});   // a gathered cuff where they end bare
    return L; }
  function boots(kind,col,o){ o=o||{}; const h=BOOT[kind]; if(h<0) return []; const L=[];
    L.push({sel:y=>y<h,d:y=>0.015+0.007*bump(y,h-0.02,0.04)+0.006*bump(y,0.03,0.05),it:4,kind:'leather',col});   // V277: real leather — thicker, fuller over the foot
    L.push({sel:(y,x,z,nz,ny)=>y<0.025&&ny<0.2,d:0.024,it:1,kind:'leather',col:dark(col,0.45)});   // the sole and heel
    if(kind==='tall') L.push({sel:y=>y>h-0.05&&y<h+0.01,d:0.028,it:4,kind:'leather',col:dark(col,0.8)});   // the turned-down cuff
    if(kind==='ankle') L.push({sel:y=>y>0.11&&y<0.135,d:0.02,it:1,kind:'leather',col:dark(col,0.6)});    // a strap
    return L; }
  function steelBoots(st,gd){ return [
    {sel:y=>y<0.2,d:y=>0.016+0.005*bump(y,0.03,0.05),it:4,kind:'steel',col:st},
    {sel:(y,x,z,nz,ny)=>y<0.025&&ny<0.2,d:0.025,it:1,kind:'leather',col:0x2a1e16},
    {sel:(y,x,z,nz,ny)=>y<0.1&&ny>0.25&&((z>0.02&&z<0.035)||(z>0.055&&z<0.07)),d:0.024,it:0,kind:'gold',col:gd},   // the lames over the instep
    {sel:y=>y>0.13&&y<0.16,d:0.021,it:1,kind:'gold',col:gd} ]; }                                                  // the ankle band
  function plate(st,gd,o){ o=o||{}; const hv=o.heavy||0, low=o.greaveTo==null?0.13:o.greaveTo, under=o.under||0x4c535e, L=[];
    L.push({sel:y=>y>0.6&&y<0.985,d:0.009,it:3,kind:o.underKind||'cloth',col:under});                       // what's under: mail or leather behind the cuisse
    L.push({sel:(y,x,z,nz)=>y>0.6&&y<0.93&&nz>-0.35,d:0.016+hv,it:4,kind:'steel',col:st});                // the cuisse, round the front and sides
    L.push({sel:(y,x,z,nz)=>y>0.6&&y<0.625&&nz>-0.3,d:0.019+hv,it:1,kind:'gold',col:gd});                // its gilt foot
    L.push({sel:(y,x,z,nz)=>y>0.475&&y<0.615&&nz>0.05,d:y=>0.025+hv+0.006*bump(y,0.545,0.03),it:5,kind:'steel',col:dark(st,1.08)});   // the knee cop
    L.push({sel:(y,x,z,nz)=>((y>0.475&&y<0.49)||(y>0.6&&y<0.615))&&nz>0.1,d:0.029+hv,it:1,kind:'gold',col:gd});   // its rims
    L.push({sel:y=>y>low&&y<0.5,d:0.02+hv,it:3,kind:'steel',col:st});                                     // the greave, closed round the shin
    L.push({sel:(y,x,z,nz)=>y>low+0.01&&y<0.48&&nz>0.72,d:0.025+hv,it:1,kind:'steel',col:dark(st,1.15)});  // the shin keel
    L.push({sel:y=>(y>0.47&&y<0.5)||(y>low&&y<low+0.025),d:0.023+hv,it:1,kind:'gold',col:gd});           // gilt at its top and foot
    return L; }
  function greaves(st,gd){ return plate(st,gd).filter((l,i)=>i>=3); }   // knee cop and greave only (over trousers)
  // ── the kits: what each set wears on its legs ──
  const KIT={
    plate:s=>[...plate(s.st,s.gd,{heavy:s.heavy}),...steelBoots(s.st,s.gd)],
    plateLeather:s=>[...plate(s.st,s.gd,{greaveTo:0.37,under:0x4a3a2a,underKind:'leather'}),...boots('tall',s.boot||0x4a3020)],
    greaves:s=>[...trousers(s.cloth||0x5a4a36,0.46,{puff:0.6,tuck:true}),...greaves(s.st,s.gd),...boots(s.bootKind||'tall',s.boot||0x3a2618)],
    trousers:s=>[...trousers(s.cloth||0x6a5a40,BOOT[s.bootKind||'tall']-0.02,{puff:s.puff}),...boots(s.bootKind||'tall',s.boot||0x4a3020)],
    bare:s=>trousers(s.cloth||0x6a5a40,0.27,{cuff:true,puff:s.puff}) };
  const KITS={ templar:['plate'], guardian:['plate',{heavy:0.006}], ironforged:['plate',{heavy:0.004}], crystalborn:['plate'], emberforged:['plate',{heavy:0.003}], tempest:['plate'], archangel:['plate'],
    lv_gilt:['plate'], lv_stormward:['plate'], lv_fallen:['plate'], lv_robby:['plate',{heavy:0.004}], lv_champion:['plate'], lv_glory:['plate'], lv_deepwater:['plate'],
    striker:['greaves',{cloth:0x3a2418,boot:0x2e1a12}], tidecaller:['greaves',{cloth:0x2a4a50,boot:0x2e2a24}],
    psalmist:['trousers',{cloth:0xe9e2d0,boot:0x8a6a44,bootKind:'ankle'}], hearth:['trousers',{cloth:0x6a5a3a,boot:0x5a3a20,bootKind:'ankle'}],
    thornwarden:['trousers',{cloth:0x3e4a2a,boot:0x4a3a22}], sandstrider:['trousers',{cloth:0xd8c8a0,boot:0x8a6a44,bootKind:'shoes',puff:1.3}],
    shade:['trousers',{cloth:0x24222a,boot:0x1e1a20}], lv_ranger:['trousers',{cloth:0x4a4030,boot:0x5a3a1e}],
    base:['trousers',{cloth:0x6a5a40,boot:0x4a3020}],
    k_boots:['trousers',{}], k_ankle:['trousers',{bootKind:'ankle',boot:0x5a3a20}], k_shoes:['trousers',{bootKind:'shoes',boot:0x5a3a20}], k_bare:['bare',{}],
    k_plate:['plate'], k_plateLeather:['plateLeather'], greaves:['greaves'], k_greaves:['greaves'] };
  const NM={k_boots:'Trousers & tall boots',k_ankle:'Trousers & ankle boots',k_shoes:'Trousers & shoes',k_bare:'Barefoot & trousers',k_plate:'Armoured legs & steel boots',k_plateLeather:'Armoured legs & leather boots',k_greaves:'Greaves over trousers & boots'};
  function build(ctx,id){ const K=ctx.K, F=K.userData.b3; if(!F||typeof F!=='object'||!F.body||!F.D||typeof BODY3==='undefined'||!BODY3.mat) return false;
    const pal=ARMOR.PAL&&ARMOR.PAL[id], M=pal?Object.assign({},K.M,pal):K.M, k=KITS[id]||['trousers',{}], s=Object.assign({},k[1]||{});
    s.st=new THREE.Color(hx(M.steel)||0xa9b0bc).lerp(new THREE.Color(0x5e6774),0.75).getHex(); s.gd=hx(M.goldD||M.gold)||0xd6a640;   // as the gloves' steel
    const g=new THREE.Group(); g.userData.armor='legs'; g.userData.fitted=true; g.userData.skinKit=true; g.userData.barefoot=k[0]==='bare'; K.add(g); ctx.groups.push(g);
    (KIT[k[0]]||KIT.trousers)(s).forEach(L=>{ try{ layer(F,g,L); }catch(e){ if(window.DEBUG_ARMOR) console.error('legkit',e); } });
    return true; }
  // every legs piece is now a kit; the feet come with it (the Sabatons slot wears nothing of its own)
  const ids=new Set([...Object.keys(P.legs||{}),...Object.keys(KITS)]);
  ids.forEach(id=>{ const old=OLDL[id]; if(id.startsWith('k_')&&!old) P.legs[id]={name:NM[id],set:'Common',common:true};
    const pc=P.legs[id]; if(!pc) return; if(id==='greaves') pc.name='Greaves over trousers & boots'; else if(id!=='base'&&!id.startsWith('k_')&&pc.set) pc.name=pc.set+' legs & boots'; if(id==='base') pc.name='Trousers & tall boots';
    pc.build=ctx=>{ if(build(ctx,id)) return; if(old) old.build(ctx); else if(OLDL.templar) OLDL.templar.build(ctx); }; });
  if(P.legs.k_boots) delete P.legs.k_boots;   // the plain kit is the same as the base: no twin in the list
  P.sabatons.kit={name:'(with the legs)',set:'Common',common:true,build:ctx=>{ const K=ctx.K, F=K.userData.b3; if(F&&typeof F==='object'&&F.body){ const g=new THREE.Group(); g.userData.armor='sabatons'; g.userData.fitted=true; g.userData.skinKit=true; K.add(g); ctx.groups.push(g); return; } const o=OLDS.templar; if(o) o.build(ctx); }};
  ARMOR.LEGKIT=KITS; ARMOR.H.bodyShell=layer;   /* V280: the same body-shell layer, for any part of the body (the pelt mantles) */
})();
