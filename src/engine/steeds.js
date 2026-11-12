// ════════════════════════════════════════════════════════════════
//  STEEDS — your companion's final form, built as itself rather than as a horse wearing a costume:
//   🦁 the Lion: a great cat, long and low in the back, a ruff of mane all round the head, heavy paws, a tufted tail;
//      it bounds (fore pair, then hind pair) rather than trots.
//   🦢 the Great Dove: an egg of a body you sit astride, a puffed breast, a small head and beak, two broad wings
//      (coverts, secondaries and splayed primaries, jointed at the wrist) and a fanned tail; it waddles on two pink
//      legs, and aloft the legs tuck and the wings beat.
//   🐉 the Sea Dragon: a serpent body in eight scaled segments that ripple as it goes, a fin crest down the spine,
//      four paddling flippers, a tall neck and a horned, whiskered head with glowing eyes, a fan at the tail's end.
//   🦄 the Unicorn stays a horse (it is one) — horseModel adds its spiral horn, flowing mane and gilt hooves.
//  steedModel(m, rider?) → group facing +z, seat at y≈1.12; the same userData as horseModel: body, head/neck/back
//  anchors (petLookApply hangs crowns and saddles there), ls, gallop(t, speed01, air).
// ════════════════════════════════════════════════════════════════
function steedModel(m,rider){ const c=m.coat.map(hexn), mane=hexn(m.mane||m.coat[0]), g=new THREE.Group(), body=group(0,0,0,g), legs=[], segs=[], wings=[];
  const dark=new THREE.Color(c[0]).multiplyScalar(0.55).getHex(); let tail=null, head=null, anchors;
  // ── 🦁 the Lion ──
  if(m.kind==='lion'){
    // V99: rounded — a long barrel, deep chest, muscled haunch, a pale belly and the mane rolling over the withers
    Sp(0.33,c[1],0,0.86,-0.05,body,16,12).scale.set(0.9,0.8,1.95);             // the barrel: seat on top at ≈1.12
    Sp(0.37,c[1],0,0.9,0.45,body,16,12).scale.set(0.98,0.98,1.1);             // deep chest and shoulders
    Sp(0.33,c[1],0,0.9,-0.6,body,16,12).scale.set(0.98,0.96,1.05);            // haunches
    Sp(0.24,c[2],0,0.68,0,body,12,8).scale.set(0.95,0.45,2.2);                 // pale belly
    Sp(0.39,mane,0,1.08,0.62,body,14,10).scale.set(1.05,1.05,0.85);           // the mane down the neck and over the withers
    head=group(0,1.24,0.9,body);
    Sp(0.25,c[1],0,0,0,head,14,10).scale.set(1,0.95,1.05);
    B(0.22,0.15,0.2,c[2],0,-0.18,0.14,head); B(0.16,0.06,0.14,c[2],0,-0.25,0.12,head);   // muzzle and jaw
    Sp(0.05,0x3a2418,0,-0.05,0.3,head);                                         // nose
    [-1,1].forEach(s=>{ Sp(0.065,c[1],s*0.15,0.19,-0.02,head); Sp(0.03,0x1a1208,s*0.1,0.06,0.22,head); Sp(0.012,0xfff4c0,s*0.1+s*0.01,0.07,0.245,head); });
    for(let layer=0;layer<2;layer++){ const n=layer?16:13, R=layer?0.32:0.26, L=layer?0.34:0.26, col=layer?new THREE.Color(mane).multiplyScalar(0.78).getHex():mane;
      for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+(layer?0.2:0), k=Co(layer?0.1:0.09,L,5,col,0,0,0,head);
        k.geometry.translate(0,0,0); k.position.set(Math.sin(a)*R,Math.cos(a)*R*0.95-0.02,-0.08-layer*0.1); k.rotation.set(-0.35,0,-a); } }
    for(const [x,z,front] of [[-0.2,0.48,1],[0.2,0.48,1],[-0.2,-0.6,0],[0.2,-0.6,0]]){ const hip=group(x,0.86,z,body);
      Sp(0.13,c[1],0,-0.06,0,hip,10,8).scale.set(1,1.3,1.15); Cy(0.1,0.075,0.42,10,c[1],0,-0.42,0,hip); const knee=group(0,-0.42,0,hip); Sp(0.08,c[1],0,0,0,knee,8,6); Cy(0.075,0.065,0.36,10,c[1],0,-0.38,0,knee);
      const paw=Sp(0.1,c[2],0,-0.39,0.05,knee,10,8); paw.scale.set(1,0.55,1.35); legs.push({hip,knee,front,phase:front?(x<0?0:0.07):(x<0?0.5:0.57)}); }
    tail=group(0,1.0,-0.8,body); let tp=tail; for(let i=0;i<4;i++){ Cy(0.035,0.03,0.24,5,c[1],0,0,0,tp).rotation.x=0; const n=group(0,0.24,0,tp); n.rotation.x=0.35; tp=n; }
    Sp(0.08,mane,0,0.04,0,tp).scale.set(1,1.5,1); tail.rotation.x=-2.1;
    anchors={head:[1.48,0.9],neck:[1.25,0.6],back:[1.12,-0.3],ls:0.5};
  }
  // ── 🦢 the Great Dove ──
  else if(m.kind==='dove'){
    Sp(0.5,c[1],0,0.78,-0.05,body,10,8).scale.set(0.95,0.75,1.35);            // the body you sit astride (top ≈1.15)
    Sp(0.38,c[2],0,0.82,0.42,body,10,8).scale.set(1,1,0.9);                    // the puffed breast
    Sp(0.27,c[1],0,1.06,0.62,body).scale.set(1,1.1,1);                          // neck
    head=group(0,1.3,0.82,body);
    Sp(0.23,c[2],0,0,0,head,10,8);
    const bk=Co(0.06,0.2,5,0xd0a070,0,0,0,head); bk.rotation.x=Math.PI/2; bk.position.set(0,-0.04,0.28);
    Sp(0.05,0xf2e8e0,0,0.02,0.2,head);                                            // the cere
    [-1,1].forEach(s=>{ Sp(0.034,0x1a1210,s*0.13,0.05,0.12,head); Sp(0.012,0xffffff,s*0.135,0.06,0.145,head); });
    [-1,1].forEach(s=>{ const w=group(s*0.4,1.0,0.12,body), out=group(s*0.62,0,0,w);
      B(0.66,0.07,0.62,c[2],s*0.3,-0.03,0,w); B(0.4,0.05,0.52,c[1],s*0.3,-0.05,-0.18,w);              // coverts, secondaries
      B(0.5,0.05,0.5,c[1],s*0.25,-0.03,-0.05,out);
      for(let i=0;i<5;i++){ const f=B(0.55,0.035,0.11,i%2?c[0]:c[1],s*(0.55+i*0.02),-0.02,0.16-i*0.1,out); f.rotation.y=s*(0.08*i-0.1); }   // splayed primaries
      wings.push([w,s,out]); });
    tail=group(0,0.78,-0.68,body); for(let i=0;i<5;i++){ const f=B(0.13,0.03,0.6,i%2?c[2]:c[1],0,0,-0.28,tail); f.position.x=(i-2)*0.06; f.rotation.y=(i-2)*0.24; }
    for(const s of [-1,1]){ const hip=group(s*0.15,0.44,0.1,body); Cy(0.04,0.035,0.4,5,0xd88a7a,0,-0.42,0,hip); const knee=group(0,-0.42,0,hip);
      for(const a of [-0.45,0,0.45]){ const t=B(0.025,0.02,0.14,0xc87a6a,0,0,0.06,knee); t.rotation.y=a; } legs.push({hip,knee,front:1,phase:s<0?0:0.5,bird:1}); }
    anchors={head:[1.52,0.82],neck:[1.12,0.62],back:[1.14,-0.25],ls:0.5};
  }
  // ── 🐉 the Sea Dragon ──
  else if(m.kind==='dragon'){
    const R=[0.34,0.38,0.38,0.34,0.28,0.22,0.16,0.11], Z=[0.55,0.22,-0.12,-0.46,-0.8,-1.1,-1.36,-1.58], Y=[0.78,0.78,0.78,0.76,0.7,0.62,0.55,0.5];
    R.forEach((r,i)=>{ const sg=group(0,Y[i],Z[i],body); const s=Sp(r,c[1],0,0,0,sg,9,7); s.scale.set(1,0.95,1.25);
      Sp(r*0.9,c[2],0,-r*0.3,0,sg,8,6).scale.set(0.9,0.6,1.2);                                         // pale belly plates
      const fin=Co(0.07+r*0.12,0.18+r*0.35,4,mane,0,r*0.8,0,sg); fin.rotation.x=-0.5; fin.scale.z=0.35;   // the spine crest
      [-1,1].forEach(sd=>Sp(r*0.18,c[0],sd*r*0.82,r*0.2,0,sg,5,4));                                      // a row of darker scales
      segs.push({g:sg,x0:0,y0:Y[i],i}); });
    const tf=group(0,0,-0.12,segs[segs.length-1].g); B(0.04,0.42,0.34,mane,0,-0.2,0,tf).rotation.x=0.3; B(0.5,0.04,0.32,mane,0,0,-0.1,tf);   // the tail's fan
    const NK=[[0,1.0,0.82,0.24],[0,1.28,0.95,0.21],[0,1.53,1.03,0.19]]; NK.forEach(([x,y,z,r])=>{ Sp(r,c[1],x,y,z,body,8,6); Co(0.05,0.16,4,mane,x,y+r*0.75,z-0.05,body).rotation.x=-0.6; });
    head=group(0,1.72,1.12,body);
    B(0.3,0.22,0.36,c[1],0,-0.1,0,head); B(0.22,0.13,0.32,c[2],0,-0.14,0.3,head); B(0.18,0.05,0.28,c[0],0,-0.2,0.26,head);   // skull, snout, jaw
    [-1,1].forEach(s=>{ const h=Co(0.045,0.32,5,0xe8dcb0,s*0.1,0.06,-0.08,head); h.rotation.x=-1.0; h.rotation.z=-s*0.25;   // swept horns
      Sp(0.04,0xffe070,s*0.12,0.0,0.12,head).material=glow(0xffe070);                                                     // glowing eyes
      const wh=B(0.012,0.012,0.36,mane,s*0.1,-0.12,0.48,head); wh.rotation.set(0.3,s*0.5,0);                               // barbels
      const fr=B(0.03,0.2,0.22,mane,s*0.17,-0.06,-0.06,head); fr.rotation.y=s*0.5; });                                  // frills
    for(const [x,z,front] of [[-0.36,0.38,1],[0.36,0.38,1],[-0.3,-0.55,0],[0.3,-0.55,0]]){ const hip=group(x,0.62,z,body), knee=group(Math.sign(x)*0.12,0,0,hip);
      const p=B(0.46,0.04,0.26,mane,Math.sign(x)*0.2,-0.02,0,knee); p.rotation.y=-Math.sign(x)*0.25; legs.push({hip,knee,front,phase:front?0:0.5,fin:Math.sign(x)}); }
    anchors={head:[1.88,1.12],neck:[1.36,0.96],back:[1.14,-0.15],ls:0.5};
  }
  // the rider sits where a horse's would
  if(rider){ rider.position.set(0,1.05,0); body.add(rider); }
  Object.assign(g.userData,{body,head:anchors.head,neck:anchors.neck,back:anchors.back,ls:anchors.ls,kind:m.kind});
  g.userData.seat=m.kind==='lion'?1.12:m.kind==='dove'?1.15:1.16;
  const lionGait=m.kind==='lion'?gaitRig({legs:legs.map(L=>Object.assign(L,{x:L.hip.position.x})),body,head,tail,tail0:-2.1,kind:'lion'}):null;
  g.userData.gallop=(t,s,air,bank)=>{ if(lionGait){ lionGait(t,s,air,bank); if(g.userData.fxTick) g.userData.fxTick(t); return; }
    const mv=Math.min(1,s*1.4+0.15), ph=t*(m.kind==='dove'?8+6*s:6+7*s); body.rotation.z=(bank||0)*0.4;
    legs.forEach(L=>{ const o=L.phase*Math.PI*2;
      if(L.fin){ L.hip.rotation.z=L.fin*(Math.sin(ph*0.8+o)*0.45*(air>0?1:mv)); L.hip.rotation.x=Math.cos(ph*0.8+o)*0.35*mv; return; }   // the flippers paddle
      if(L.bird){ if(air>0){ L.hip.rotation.x=1.25; L.knee.rotation.x=-0.6; } else { L.hip.rotation.x=Math.sin(ph+o)*0.6*mv; L.knee.rotation.x=Math.max(0,-Math.sin(ph+o+0.6))*0.5*mv; } return; }
      const a=air>0?(L.front?-0.9:0.8):Math.sin(ph+o)*0.7*mv; L.hip.rotation.x=a; L.knee.rotation.x=air>0?(L.front?1.2:-0.3):Math.max(0,-Math.sin(ph+o+0.6))*0.8*mv; });
    if(m.kind==='lion'){ body.position.y=(air>0?0.4:0)+Math.abs(Math.sin(ph))*0.07*s; body.rotation.x=air>0?-0.1:Math.sin(ph)*0.06*s; if(tail) tail.rotation.x=-2.1+Math.sin(ph*0.5)*0.25; if(head) head.rotation.x=-Math.sin(ph)*0.04*s; }
    if(m.kind==='dove'){ const up=air>0; body.position.y=up?0.3:Math.abs(Math.sin(ph))*0.04*mv; body.rotation.z=up?Math.sin(ph*0.5)*0.05:Math.sin(ph)*0.06*mv; body.rotation.x=up?-0.08:0;
      wings.forEach(([w,sd,out])=>{ if(up){ const f=Math.sin(t*5.5); w.rotation.set(0,0,sd*(0.25+f*0.7)); out.rotation.z=sd*(Math.max(0,f)*0.35-0.15); out.scale.x=1; }
        else { w.rotation.set(0,sd*1.3,-sd*0.12+Math.sin(t*2)*0.02); out.rotation.z=0; out.scale.x=0.35; } });   // folded along the flanks, the hand tucked in
      if(tail) tail.rotation.x=up?0.15:-0.25+Math.sin(ph)*0.05; if(head) head.position.z=0.82+(up?0:Math.sin(ph*2)*0.05*mv); }   // a dove's head bobs as it walks
    if(m.kind==='dragon'){ const amp=0.07+0.12*mv; segs.forEach(S=>{ S.g.position.x=Math.sin(t*(3+3*s)-S.i*0.75)*amp*(S.i/7+0.15); S.g.position.y=S.y0+Math.sin(t*(3+3*s)-S.i*0.75+1.2)*0.03*(1+S.i*0.3); S.g.rotation.y=Math.cos(t*(3+3*s)-S.i*0.75)*0.25*(S.i/7); });
      if(head){ head.rotation.y=Math.sin(t*1.3)*0.12; head.position.y=1.72+Math.sin(t*2.1)*0.03; } }
    if(g.userData.fxTick) g.userData.fxTick(t); };
  return inkify(shade(g),0.016); }
