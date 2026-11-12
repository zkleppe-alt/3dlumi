// ════════════════════════════════════════════════════════════════
//  MOUNTS — a low-poly horse for the steeplechase and the joust, coloured from KLK's
//  MOUNTS / STEEDS entries (coat ramp, mane, silks). Your own steed keeps its kind:
//  lion (mane ruff), dove (wings), dragon (fins and crest), unicorn (horn).
//  horseModel(m, rider) → group facing +z; .userData.gallop(t, speed01, air)
// ════════════════════════════════════════════════════════════════
// ── V99: a gait for four legs — idle, a four-beat walk, and the gallop (a horse's transverse gallop; a lion's bounding rotary
//    one), blended smoothly by speed. Each leg plants and pushes back through its stance, then lifts, folds and reaches
//    forward through its swing; the body rises and rocks with the stride, the neck and head nod against it, the tail lifts
//    and swishes. At rest: slow breathing, a weight shift, the head turning to look about, the tail flicking.
//    gaitRig({legs:[{hip,knee,front,x}], body, neck, head, tail, tail0, kind}) → (t, speed01, air, bank) — the same call as gallop
function gaitRig(o){ const legs=o.legs, body=o.body, head=o.head, neck=o.neck, tail=o.tail, lion=o.kind==='lion';
  const sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); }, lerp=(a,b,k)=>a+(b-a)*k;
  // walk: left hind, left fore, right hind, right fore; gallop: hind pair then fore pair (the lion bounds: the pairs nearly together)
  legs.forEach(L=>{ const left=(L.x||0)<0; L.pw=L.front?(left?0.25:0.75):(left?0:0.5); L.pr=lion?(L.front?(left?0.5:0.58):(left?0:0.08)):(L.front?(left?0.42:0.52):(left?0:0.12)); L.hip0=L.hip.rotation.x; L.knee0=L.knee.rotation.x; });
  const n0=neck?neck.rotation.x:0, h0=head?head.rotation.x:0, hy0=head?head.rotation.y:0, t0=o.tail0!==undefined?o.tail0:(tail?tail.rotation.x:0), by0=body.position.y;
  let lt=null, ph=0, sS=0, look=0, lookTo=0, lookT=2, flick=0, airS=0;
  return (t,s,air,bank)=>{ const dt=lt===null?0.016:Math.min(0.1,Math.max(0,t-lt)); lt=t; sS+=(Math.max(0,s)-sS)*Math.min(1,dt*3.5); airS+=((air>0?1:0)-airS)*Math.min(1,dt*6);
    const run=sm((sS-0.28)/0.3), mv=sm(sS*4), freq=lerp(0.9+1.4*sS,1.85+0.9*sS,run)*(lion?1.05:1); ph+=dt*freq;
    const duty=lerp(0.64,0.4,run), A=lerp(0.3,0.62,run)*mv, lift=lerp(0.75,1.35,run)*mv, cyc=ph*Math.PI*2;
    legs.forEach(L=>{ const u=(((ph+lerp(L.pw,L.pr,run))%1)+1)%1; let hp, kn;
      if(u<duty){ const k=u/duty; hp=lerp(-A,A,k); kn=0.06*mv*Math.sin(k*Math.PI); }                          // planted: the hoof stays, the body passes over it
      else { const k=(u-duty)/(1-duty), e=sm(k); hp=lerp(A,-A*1.08,e); kn=Math.sin(k*Math.PI)*lift; }          // the swing: lift, fold, reach
      const tuckH=L.front?-0.9:0.8, tuckK=L.front?1.25:-0.35;
      L.hip.rotation.x=lerp(L.hip0+hp,tuckH,airS); L.knee.rotation.x=lerp(L.knee0+(L.front?1:-0.7)*kn,tuckK,airS); });
    // the body: two small bumps a stride at the walk, one big rise and a rocking pitch at the gallop; breathing at rest
    const breath=Math.sin(t*1.6)*0.006*(1-mv);
    body.position.y=by0+(1-run)*Math.abs(Math.sin(cyc*2))*0.022*mv+run*(0.5+0.5*Math.sin(cyc-0.6))*(lion?0.1:0.085)*mv+breath+airS*0.4;
    body.rotation.x=run*Math.sin(cyc+0.9)*(lion?0.09:0.065)*mv-airS*0.1;
    body.rotation.z=lerp(body.rotation.z,(bank||0)*0.5+(1-run)*Math.sin(cyc)*0.014*mv+Math.sin(t*0.4)*0.008*(1-mv),Math.min(1,dt*8));
    body.scale.set(1+breath*1.5,1,1+breath*0.5);
    // the head looks about at rest, and nods with the stride
    lookT-=dt; if(lookT<=0){ lookTo=Math.random()<0.4?0:(Math.random()-0.5)*0.9; lookT=2.5+Math.random()*4; } look+=(lookTo-look)*Math.min(1,dt*1.8);
    const nod=(1-run)*Math.sin(cyc*2+0.5)*0.07*mv+run*Math.sin(cyc+2.3)*0.14*mv;
    if(neck){ neck.rotation.x=n0+nod*0.6; neck.rotation.y=look*0.5*(1-mv); }
    if(head){ head.rotation.x=h0-nod*(neck?0.4:1)*(lion?0.6:1)-(lion?0:0.05*Math.sin(t*0.9))*(1-mv); head.rotation.y=hy0+look*(neck?0.5:1)*(1-mv); }
    // the tail: lifted and streaming at speed, swishing at rest (and the odd flick)
    flick=Math.max(0,flick-dt); if(Math.random()<dt*0.12) flick=0.6;
    if(tail){ tail.rotation.x=t0+run*0.55*mv+Math.sin(cyc)*0.12*mv; tail.rotation.z=Math.sin(t*1.3)*0.18*(1-mv)+Math.sin(flick*10)*0.25*(flick>0?1:0); }
    return {run,mv,cyc}; }; }
function horseModel(m,rider){ if(typeof PETART!=='undefined'&&PETART.hasSteed(m.kind)){ const a=PETART.steed(m.kind,rider); if(a) return a; }   /* V184: the sculpted steeds */
  if((m.kind==='lion'||m.kind==='dove'||m.kind==='dragon')&&typeof steedModel==='function') return steedModel(m,rider);   // the companions' own shapes (steeds.js)
  const c=m.coat.map(hexn), mane=hexn(m.mane||m.coat[0]), g=new THREE.Group(), body=group(0,0,0,g), legs=[];
  const E=equine(body,c[0],c[1],mane), neck=E.neck, head=E.head, tail=E.tail; E.legs.forEach(L=>legs.push(L));   // the rounded horse (pets.js)
  // saddle cloth in the silks
  if(m.silk){ const sc=Cy(0.36,0.36,0.72,14,hexn(m.silk),0,0.0,0,group(0,1.02,0.05,body)); sc.rotation.x=Math.PI/2; sc.scale.set(0.98,1,0.86); sc.position.set(0,0.06,0); Cy(0.365,0.365,0.06,14,hexn(m.silk2||'#f4eede'),0,0,0,group(0,1.08,0.4,body)).rotation.x=Math.PI/2; B(0.36,0.08,0.5,0x5a3a22,0,1.32,0.05,body); }   // a saddle-cloth wrapped round the barrel, and the saddle
  if(m.kind==='lion'){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.16,6,12),flat(mane)); r.position.set(0,0.75,-0.05); neck.add(r); B(0.32,0.25,0.32,c[2],0,-0.2,0.25,head); }
  if(m.kind==='dove'){ [-1,1].forEach(s=>{ const w=group(s*0.3,1.25,0.1,body); B(1.1,0.05,0.6,c[2],s*0.55,0,0,w); w.rotation.z=s*0.3; g.userData.wings=(g.userData.wings||[]).concat([[w,s]]); }); }
  if(m.kind==='dragon'){ for(let i=0;i<5;i++) Co(0.08,0.24,4,c[2],0,1.3,-0.6+i*0.3,body); }
  if(m.kind==='unicorn'){ const hg=group(0,0.3,0.12,head); hg.rotation.x=0.4; Co(0.055,0.5,7,0xf2c14e,0,0,0,hg); for(let i=0;i<4;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.05-i*0.011,0.009,4,10),flat(0xc89a2a)); r.rotation.x=Math.PI/2; r.position.y=0.06+i*0.1; hg.add(r); }   // the spiral horn
    const mh=new THREE.Color(mane).lerp(new THREE.Color(0xffffff),0.45).getHex(); for(let i=0;i<7;i++){ const st=B(0.05,0.32+(i%3)*0.08,0.09,i%2?mane:mh,(i%2?0.05:-0.05),-0.35+i*0.13,-0.21,neck); st.rotation.z=(i%2?0.25:-0.25); }   // a flowing mane, parted both ways
    B(0.08,0.2,0.12,mh,0,0.42,0.12,head);                                                               // the forelock
    for(let i=0;i<4;i++){ const st=B(0.07,0.8,0.06,i%2?mane:mh,(i-1.5)*0.05,0.1,0,tail); st.rotation.z=(i-1.5)*0.12; }   // a long tail of strands
    legs.forEach(L=>{ L.knee.children.forEach(o=>{ if(o.geometry&&o.geometry.parameters&&o.geometry.parameters.height===0.1) o.material=flat(0xe8c050); }); B(0.16,0.12,0.18,0xffffff,0,-0.5,0.0,L.knee); }); }   // gilt hooves, white feathered fetlocks
  // the rider: the knight's own model, or a jockey in silks
  if(rider){ rider.position.set(0,1.05,0.0); body.add(rider); }
  Object.assign(g.userData,{body,head:[2.28,1.02],neck:[1.72,0.78],back:[1.3,-0.5],ls:0.5});
  legs.forEach(L=>{ L.x=L.hip.position.x; }); const gait=gaitRig({legs,body,neck,head,tail,tail0:-2.5,kind:'horse'}); g.userData.seat=1.33;
  g.userData.gallop=(t,s,air,bank)=>{ const r=gait(t,s,air,bank); (g.userData.wings||[]).forEach(([w,sd])=>w.rotation.z=sd*(0.3+Math.sin(r.cyc)*0.4)); if(g.userData.fxTick) g.userData.fxTick(t); };
  return inkify(shade(g),0.016); }
// a jockey in a tourney horse's silks
function jockey(m){ const g=new THREE.Group(); B(0.3,0.42,0.26,hexn(m.silk),0,0.2,0,g); B(0.32,0.08,0.28,hexn(m.silk2||'#f4eede'),0,0.42,0,g); Sp(0.13,0xe0b080,0,0.78,0,g); Cy(0.14,0.15,0.1,8,hexn(m.silk),0,0.84,0,g);
  B(0.08,0.32,0.1,hexn(m.silk),-0.2,0.25,0.12,g).rotation.x=-0.6; B(0.08,0.32,0.1,hexn(m.silk),0.2,0.25,0.12,g).rotation.x=-0.6; return g; }
