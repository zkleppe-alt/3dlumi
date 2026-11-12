// ════════════════════════════════════════════════════════════════
//  DECOR — every KLK decoration kind the ten towns use, added to city.js's DECOR_KINDS.
//  Each draws into a group whose origin is the decoration's tile (centre of a w×w block).
//  fn(d, g, anim) — d is the game's record ({x,y,kind,w,c,m,v}).
// ════════════════════════════════════════════════════════════════
const WOOD=0x7a5432, WOOD_D=0x5a3c20, LEAF=0x3f8a4e, LEAF_D=0x2f6b3a, ROCK=0x8a8a90;
function fire(g,an,x,y,z,s){ s=s||1; const f=Co(0.16*s,0.4*s,6,glow(0xffa040),x,y,z,g), f2=Co(0.09*s,0.26*s,6,glow(0xffe08a),x,y,z,g);
  const k=Math.random()*9; an.push(t=>{ f.scale.y=1+Math.sin(t*11+k)*0.22; f2.scale.y=1+Math.sin(t*14+k)*0.25; }); return f; }
function sway(an,o,amp,sp,k){ an.push(t=>{ o.rotation.z=Math.sin(t*(sp||1.6)+(k||0))*(amp||0.05); }); }
Object.assign(DECOR_KINDS,{
  barrel(d,g){ Cy(0.3,0.27,0.8,10,WOOD,0,0,0,g); [0.14,0.62].forEach(y=>Cy(0.31,0.31,0.05,10,0x3a3a40,0,y,0,g)); },
  fishBarrel(d,g){ DECOR_KINDS.barrel(d,g); for(let i=0;i<3;i++){ const f=B(0.08,0.06,0.3,0x9ab0c0,-0.1+i*0.1,0.8,0,g); f.rotation.y=i; } },
  crate(d,g){ B(0.7,0.65,0.7,0x9a7a48,0,0,0,g); B(0.72,0.06,0.06,WOOD_D,0,0.3,0.34,g); },
  bucket(d,g){ Cy(0.2,0.16,0.32,10,0x8a6a42,0,0,0,g); Cy(0.17,0.17,0.02,10,0x5fb0c8,0,0.3,0,g); },
  waterjug(d,g){ Cy(0.18,0.24,0.5,10,0xc07040,0,0,0,g); Cy(0.1,0.14,0.18,8,0xc07040,0,0.5,0,g); },
  planter(d,g){ B(0.8,0.4,0.8,0x8a5a3a,0,0,0,g); [[-0.2,-0.2,0xe04a6a],[0.2,0.1,0xf0c040],[-0.1,0.2,0xa06ae0],[0.2,-0.2,0xf0f0f0]].forEach(([x,z,c])=>{ Sp(0.12,LEAF,x,0.5,z,g,6,4); Sp(0.07,c,x,0.62,z,g,6,4); }); },
  haycart(d,g){ g.position.x+=0.5; B(1.7,0.12,1.0,WOOD,0,0.45,0,g); B(1.6,0.6,0.9,0xe0c060,0,0.57,0,g);
    [[-0.6,0.55],[0.6,0.55],[-0.6,-0.55],[0.6,-0.55]].forEach(([x,z])=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.08,10),flat(WOOD_D)); w.rotation.x=Math.PI/2; w.position.set(x,0.3,z); g.add(w); });
    const sh=B(0.06,0.06,1.0,WOOD_D,1.2,0.4,0.25,g); sh.rotation.y=0.1; },
  haystack(d,g){ g.position.x+=0.5; g.position.z+=0.5; Sp(0.9,0xe0c060,0,0.35,0,g,10,6).scale.set(1,0.8,1); },
  scarecrow(d,g){ Cy(0.04,0.04,1.6,6,WOOD_D,0,0,0,g); B(1.0,0.06,0.06,WOOD_D,0,1.2,0,g); B(0.42,0.55,0.2,0x9a5a3a,0,0.85,0,g); Sp(0.17,0xe0c890,0,1.55,0,g); Cy(0.34,0.34,0.03,10,0xd8b860,0,1.66,0,g); Co(0.16,0.2,8,0xd8b860,0,1.67,0,g); },
  tent(d,g){ g.position.x+=0.5; g.position.z+=0.5; const r=prism(1.8,1.3,1.8,0xe8d8b0); g.add(r); B(0.5,0.9,0.02,0x5a3a20,0,0,0.91,g); Cy(0.03,0.03,1.6,5,WOOD_D,0,0,0,g); },
  cactus(d,g){ Cy(0.16,0.18,1.3,8,0x4a8a4a,0,0,0,g); Sp(0.16,0x4a8a4a,0,1.3,0,g); const a=Cy(0.1,0.1,0.5,8,0x4a8a4a,0.25,0.5,0,g); B(0.3,0.1,0.1,0x4a8a4a,0.12,0.5,0,g); Cy(0.1,0.1,0.4,8,0x4a8a4a,-0.25,0.7,0,g); B(0.3,0.1,0.1,0x4a8a4a,-0.12,0.7,0,g); },
  palm(d,g,an){ const t=Cy(0.08,0.12,2.2,6,0x8a6a3a,0,0,0,g); t.rotation.z=0.12; const top=group(0.18,2.2,0,g);
    for(let i=0;i<7;i++){ const f=B(0.18,0.04,1.1,LEAF,0,0,0.5,group(0,0,0,top)); f.parent.rotation.y=i*Math.PI*2/7; f.rotation.x=0.5; } Sp(0.1,0x6a4a2a,0,-0.05,0,top); sway(an,top,0.06,1.2,d.x); },
  palmDesert(d,g,an){ DECOR_KINDS.palm(d,g,an); },
  pineSnow(d,g){ Cy(0.08,0.1,0.5,6,WOOD_D,0,0,0,g); Co(0.6,1.2,7,LEAF_D,0,0.4,0,g); Co(0.45,0.9,7,LEAF_D,0,1.0,0,g); Co(0.3,0.4,7,0xf4f8fc,0,1.55,0,g); Co(0.62,0.12,7,0xf4f8fc,0,0.4,0,g); },
  charredTree(d,g){ Cy(0.08,0.14,1.6,5,0x2a2422,0,0,0,g); [[0.6,1.0,0.3],[-0.7,1.2,-0.2],[0.4,1.4,-0.5]].forEach(([a,y,b])=>{ const br=Cy(0.03,0.05,0.6,4,0x2a2422,0,y,0,g); br.rotation.z=a; br.rotation.x=b; }); Sp(0.05,glow(0xff6a1a),0.05,0.3,0.1,g,4,3); },
  deadTree(d,g){ g.position.x+=0.5; g.position.z+=0.5; Cy(0.15,0.25,2.4,6,0x3a3236,0,0,0,g); [[0.8,1.5,0.2],[-0.9,1.8,-0.3],[0.5,2.1,-0.6],[-0.4,2.3,0.7]].forEach(([a,y,b])=>{ const br=Cy(0.04,0.08,1.0,4,0x3a3236,0,y,0,g); br.rotation.z=a; br.rotation.x=b; }); },
  mt_bentTree(d,g){ const t=Cy(0.08,0.12,1.4,6,WOOD_D,0,0,0,g); t.rotation.z=0.3; Sp(0.55,0x5a8a4a,0.4,1.4,0,g,7,5).scale.set(1.3,0.7,1); },
  greatTree(d,g,an){ g.position.x+=1; g.position.z+=1; Cy(0.45,0.7,2.6,8,0x5a3a22,0,0,0,g);
    [[0,3.4,0,1.8],[1.1,3.0,0.4,1.1],[-1.0,3.1,-0.3,1.2],[0.3,4.3,-0.4,1.1]].forEach(([x,y,z,r])=>Sp(r,[0x3a7a40,0x4a8a48,0x2f6b3a][Math.round(r*3)%3],x,y,z,g,8,6));
    for(let i=0;i<4;i++){ const rt=B(0.2,0.2,1.2,0x5a3a22,0,0.05,0.6,group(0,0,0,g)); rt.parent.rotation.y=i*Math.PI/2+0.4; rt.rotation.x=0.2; } },
  stump(d,g){ Cy(0.3,0.36,0.4,9,0x6a4a2a,0,0,0,g); Cy(0.27,0.27,0.02,9,0xc8a070,0,0.4,0,g); },
  logpile(d,g){ for(let i=0;i<3;i++) for(let j=0;j<3-i;j++){ const l=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.85,8),flat(i%2?0x7a5432:0x6a4428)); l.rotation.x=Math.PI/2; l.position.set(-0.26+j*0.26+i*0.13,0.13+i*0.23,0); g.add(l); } },
  hsWoodpile(d,g){ DECOR_KINDS.logpile(d,g); },
  mushroom(d,g){ [[0,0,1],[0.25,0.15,0.7],[-0.2,0.2,0.6]].forEach(([x,z,s])=>{ Cy(0.05*s,0.07*s,0.3*s,6,0xf0e8d8,x,0,z,g); const c=new THREE.Mesh(new THREE.SphereGeometry(0.2*s,8,5,0,Math.PI*2,0,Math.PI/2),flat(0xc8402e)); c.position.set(x,0.3*s,z); g.add(c); Sp(0.03*s,0xffffff,x+0.08*s,0.42*s,z,g,4,3); }); },
  tombstone(d,g){ B(0.5,0.75,0.16,0x8a8a92,0,0,0,g); const t=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.16,10,1,false,0,Math.PI),flat(0x8a8a92)); t.rotation.set(Math.PI/2,0,Math.PI/2); t.position.y=0.75; t.rotation.y=Math.PI/2; g.add(t); B(0.04,0.3,0.02,0x5a5a62,0,0.3,0.09,g); B(0.18,0.04,0.02,0x5a5a62,0,0.5,0.09,g); },
  mistWisp(d,g,an){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),new THREE.MeshBasicMaterial({color:0xc8d8e8,transparent:true,opacity:0.25,depthWrite:false})); m.position.y=0.6; m.scale.set(1.6,0.5,1.2); g.add(m);
    const k=d.x; an.push(t=>{ m.position.x=Math.sin(t*0.4+k)*0.6; m.material.opacity=0.18+Math.sin(t*0.9+k)*0.08; }); },
  brazier(d,g,an){ Cy(0.08,0.12,0.8,6,0x3a3a40,0,0,0,g); Cy(0.32,0.18,0.25,8,0x4a4a52,0,0.8,0,g); fire(g,an,0,1.0,0,1.2); const l=new THREE.PointLight(0xffa050,0.5,6,1.6); l.position.y=1.4; g.add(l); },
  emberPit(d,g,an){ Cy(0.45,0.5,0.15,10,0x3a3230,0,0,0,g); Cy(0.36,0.36,0.03,10,glow(0xff6a1a),0,0.14,0,g); fire(g,an,0.1,0.15,0,0.8); fire(g,an,-0.15,0.15,0.1,0.6); },
  campfire(d,g,an){ for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; B(0.14,0.12,0.14,ROCK,Math.sin(a)*0.35,0,Math.cos(a)*0.35,g); }
    [0,1.2,2.4].forEach(r=>{ const l=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.6,6),flat(WOOD_D)); l.rotation.set(Math.PI/2-0.4,r,0); l.position.y=0.12; g.add(l); }); fire(g,an,0,0.1,0,1); const pl=new THREE.PointLight(0xffa050,0.6,6,1.6); pl.position.y=0.8; g.add(pl); },
  lavaAltar(d,g,an){ g.position.x+=0.5; g.position.z+=0.5; B(1.6,0.6,1.0,0x2e2826,0,0,0,g); B(1.3,0.06,0.7,glow(0xff6a1a),0,0.6,0,g); fire(g,an,-0.3,0.62,0,0.9); fire(g,an,0.3,0.62,0,0.9); },
  brokenPillar(d,g){ Cy(0.3,0.34,1.2,10,0xb8b0a4,0,0,0,g); const t=Cy(0.3,0.3,0.4,10,0xb8b0a4,0.5,0,0.2,g); t.rotation.z=Math.PI/2; t.position.y=0.3; B(0.8,0.15,0.8,0xa8a094,0,0,0,g); },
  icePillar(d,g){ const m=new THREE.MeshPhongMaterial({color:0xbfe6f7,transparent:true,opacity:0.8,shininess:100}); Cy(0.2,0.3,1.6,6,m,0,0,0,g); Co(0.2,0.5,6,m,0,1.6,0,g); Co(0.12,0.6,5,m,0.25,0,0.1,g); },
  snowman(d,g){ Sp(0.35,0xf4f8fc,0,0.3,0,g); Sp(0.25,0xf4f8fc,0,0.8,0,g); Sp(0.17,0xf4f8fc,0,1.15,0,g); Co(0.04,0.2,5,0xe07a2a,0,1.15,0.18,g).rotation.x=Math.PI/2; Cy(0.14,0.14,0.2,8,0x2a2a2a,0,1.28,0,g); B(0.5,0.06,0.06,0xc8402e,0,0.98,0,g); },
  prayerFlag(d,g,an){ Cy(0.04,0.04,2.4,5,WOOD_D,-0.4,0,0,g); Cy(0.04,0.04,2.4,5,WOOD_D,0.4,0,0,g); const cs=[0x3a6ae0,0xf4f4f4,0xe04a3a,0x4aa84a,0xf0c040];
    cs.forEach((c,i)=>{ const f=B(0.13,0.18,0.02,c,-0.32+i*0.16,2.0,0,g); an.push(t=>{ f.rotation.x=Math.sin(t*3+i)*0.3; }); }); },
  anvilMonument(d,g){ g.position.x+=0.5; g.position.z+=0.5; B(1.4,0.5,1.4,0x8a8a92,0,0,0,g); B(1.0,0.5,1.0,0x9a9aa2,0,0.5,0,g); const a=group(0,1.0,0,g); B(0.5,0.3,0.3,0x3a3a42,0,0,0,a); B(1.0,0.22,0.4,0x3a3a42,0,0.3,0,a); Co(0.2,0.4,4,0x3a3a42,0.6,0.3,0,a).rotation.z=-Math.PI/2; },
  weaponRack(d,g){ DECOR_KINDS.ty_rack(d,g); },
  netRack(d,g){ B(0.06,1.3,0.06,WOOD_D,-0.45,0,0,g); B(0.06,1.3,0.06,WOOD_D,0.45,0,0,g); B(1.0,0.06,0.06,WOOD_D,0,1.25,0,g);
    const n=new THREE.Mesh(new THREE.PlaneGeometry(0.85,1.0),new THREE.MeshLambertMaterial({color:0x8a7a5a,transparent:true,opacity:0.65,side:THREE.DoubleSide})); n.position.y=0.72; g.add(n); },
  umbrella(d,g){ Cy(0.03,0.03,1.7,5,0xe8e0d0,0,0,0,g); const t=Co(0.9,0.4,8,0xe04a4a,0,1.5,0,g); B(1.1,0.04,0.6,0xf4eedc,0.3,0,0.4,g); },
  tidepool(d,g){ Cy(0.45,0.5,0.08,10,0x8a8a80,0,0,0,g); Cy(0.36,0.36,0.03,10,0x3f8ec0,0,0.07,0,g); Sp(0.06,0xe07a5a,0.1,0.1,0.1,g,5,4); },
  sandcastle(d,g){ B(0.6,0.3,0.6,0xe0cf9c,0,0,0,g); [[-0.25,-0.25],[0.25,-0.25],[-0.25,0.25],[0.25,0.25]].forEach(([x,z])=>{ Cy(0.1,0.12,0.5,6,0xe0cf9c,x,0,z,g); Co(0.12,0.15,6,0xd8c48a,x,0.5,z,g); }); B(0.02,0.25,0.02,0xffffff,0,0.3,0,g); B(0.14,0.08,0.01,0xe04a4a,0.07,0.47,0,g); },
  boat(d,g,an){ g.position.x+=0.5; const h=group(0,0,0,g); B(1.8,0.35,0.7,0x8a5a32,0,-0.1,0,h); B(1.85,0.06,0.74,0xe8dcc0,0,0.25,0,h); Co(0.35,0.6,4,0x8a5a32,1.1,-0.1,0,h).rotation.z=-Math.PI/2;
    Cy(0.03,0.03,1.6,5,WOOD_D,0,0.2,0,h); B(0.02,1.0,0.7,0xf4eedc,0.1,0.6,0,h); an.push(t=>{ h.position.y=Math.sin(t*1.1+d.x)*0.05-0.2; h.rotation.x=Math.sin(t*0.8)*0.03; }); },
  regatta(d,g,an){ DECOR_KINDS.ty_flag(d,g,an); },
  lighthouse(d,g,an){ g.position.x+=0.5; g.position.z+=0.5; Cy(0.6,0.85,4.4,10,0xf0ece0,0,0,0,g); [1.0,2.4,3.6].forEach(y=>Cy(0.66,0.72,0.35,10,0xc8402e,0,y,0,g));
    Cy(0.7,0.7,0.1,10,0x3a3a40,0,4.4,0,g); const l=B(0.7,0.6,0.7,glow(0xfff0a8),0,4.5,0,g); Co(0.6,0.6,10,0xc8402e,0,5.1,0,g);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(0.8,7,12,1,true),new THREE.MeshBasicMaterial({color:0xfff6c8,transparent:true,opacity:0.12,depthWrite:false,side:THREE.DoubleSide})); beam.rotation.z=Math.PI/2; beam.position.set(3.5,4.8,0); const pv=group(0,0,0,g); pv.add(beam); an.push(t=>{ pv.rotation.y=t*0.6; }); },
  sf_lighthouse(d,g,an){ DECOR_KINDS.lighthouse(d,g,an); },
  sf_banner(d,g,an){ DECOR_KINDS.banner2(d,g,an); },
  horse(d,g,an){ if(typeof LOOK2!=='undefined'&&LOOK2&&typeof horseModel==='function'&&an){   // V103: the corral's horses are real horses — the same rounded steed you ride — grazing, looking about, flicking their tails
      const base=new THREE.Color(d.c?hexn(d.c):0x8a5a32), coat=['#'+base.clone().multiplyScalar(0.7).getHexString(),'#'+base.getHexString(),'#'+base.clone().lerp(new THREE.Color(0xffffff),0.25).getHexString()];
      const h=horseModel({kind:'horse',coat,mane:d.m||'#3a2a1a'}); h.scale.setScalar(0.62); h.rotation.y=hsh(d.x*7,d.y*3)*6.28; g.add(h); if(d.pack) B(0.5,0.25,0.4,0x9a7a48,0,0.95,0,g);
      if(typeof ANIM3!=='undefined'){ const white=/^#?d8d0c0$/i.test(d.c||''); ANIM3.dress(g,d.donkey?'donkey':white?'horseW':'horse',d.donkey||white?{face:h.rotation.y}:{tint:coat,mane:d.m||'#3a2a1a',face:h.rotation.y}); }   /* V190: rigged */
      const ph=hsh(d.x,d.y)*20; an.push(t=>{ if(h.userData.gallop) h.userData.gallop(t+ph,0,0); }); return; }
    const c=d.c?hexn(d.c):0x8a5a32, m=d.m?hexn(d.m):0x3a2a1a; B(0.36,0.4,0.95,c,0,0.55,0,g); [[-0.12,-0.35],[0.12,-0.35],[-0.12,0.35],[0.12,0.35]].forEach(([x,z])=>B(0.1,0.55,0.1,c,x,0,z,g));
    const n=B(0.2,0.5,0.22,c,0,0.8,0.5,g); n.rotation.x=0.5; B(0.18,0.2,0.4,c,0,1.15,0.72,g); B(0.06,0.4,0.3,m,0,0.95,0.42,g); B(0.06,0.4,0.06,m,0,0.55,-0.5,g);
    if(typeof ANIM3!=='undefined'){ const cc=new THREE.Color(c); ANIM3.dress(g,d.donkey?'donkey':'horse',d.donkey?{}:{tint:['#'+cc.clone().multiplyScalar(0.7).getHexString(),'#'+cc.getHexString(),'#'+cc.clone().lerp(new THREE.Color(0xffffff),0.25).getHexString()],mane:'#'+new THREE.Color(m).getHexString()}); } },   /* V190: rigged here too (a corral built without an animation list) */
  mule(d,g,an){ DECOR_KINDS.horse({c:'#8a7a6a',m:'#3a3028',x:d.x,y:d.y,donkey:true},g,an); if(!(typeof LOOK2!=='undefined'&&LOOK2)) B(0.5,0.25,0.4,0x9a7a48,0,0.95,0,g); else { const pk=B(0.42,0.22,0.36,0x9a7a48,0,0.82,0,g); } },
  lifeguard(d,g){ const wd=0xe8e2d4, rd=0xc8402e;   /* V199: a lifeguard's tower on the sand, Oceanside-fashion */
    [[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4],[0.4,0.4]].forEach(([x,z])=>B(0.08,1.1,0.08,wd,x,0,z,g)); B(1.1,0.08,1.1,wd,0,1.1,0,g);
    B(1.0,0.75,0.9,wd,0,1.18,0,g); B(0.7,0.35,0.04,0x2a3a4a,0,1.45,0.46,g); const rf=prism(1.3,0.45,1.2,rd); rf.position.y=1.93; g.add(rf);
    const rp=B(0.5,0.06,1.4,wd,0,0.5,0.9,g); rp.rotation.x=-0.8; B(0.04,0.9,0.04,0x6a4a2a,0.55,1.2,0.55,g); B(0.3,0.2,0.02,rd,0.7,2.0,0.55,g); },
  slagheap(d,g){ const m=new THREE.Mesh(new THREE.ConeGeometry(0.9,0.75,9,1),new THREE.MeshLambertMaterial({color:0x2e2a28})); m.position.y=0.36; m.scale.set(1,1,0.8); m.rotation.y=hsh(d.x,d.y)*3; m.castShadow=true; g.add(m);   /* V199 */
    for(let i=0;i<5;i++) Sp(0.07,i%2?0x6a3a28:0x1e1c1c,(hsh(i,d.x)-0.5)*1.0,0.08,(hsh(d.y,i)-0.5)*0.8,g,5,4); },
  minecart(d,g){ const c=group(0,0,0,g); c.rotation.y=(d.r||0)+hsh(d.x,d.y)*0.4; B(0.66,0.42,0.48,0x5a4a3a,0,0.16,0,c); B(0.7,0.06,0.52,0x3a3632,0,0.56,0,c);   /* V199: an ore cart left on the rails */
    for(let i=0;i<4;i++) Cy(0.11,0.11,0.06,10,0x2a2622,(i%2-0.5)*0.46,0.11,(i>1?0.2:-0.2),c).rotation.x=Math.PI/2;
    if(!d.empty) for(let i=0;i<5;i++) Sp(0.09,0x4a4440,(hsh(i,d.y)-0.5)*0.4,0.62,(hsh(d.x,i)-0.5)*0.3,c,5,4);
    if(d.tip) c.rotation.z=1.2; },
  waterwheel(d,g,an){ const tim=0x6a4a2a, dk=0x4a3422;   /* V199: a mill's wheel in its stone race, turning with the stream */
    B(0.16,0.34,2.4,0x6e6a62,0.2,-0.22,0,g); B(0.16,0.34,2.4,0x6e6a62,1.1,-0.22,0,g); B(0.14,0.95,0.14,0x5a4a3a,1.1,0,0,g);   // low race walls of dark stone, a timber post for the axle
    const w=group(0.65,0.75,0,g), wm=new THREE.MeshLambertMaterial({color:tim});
    for(const sx of [-0.2,0.2]){ const rim=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.06,6,22),wm); rim.rotation.y=Math.PI/2; rim.position.x=sx; w.add(rim); }
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, pd=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.08,0.34),wm); pd.position.set(0,Math.cos(a)*0.9,Math.sin(a)*0.9); pd.rotation.x=a; w.add(pd);
      const sp=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.9),wm); sp.position.set(0,Math.cos(a)*0.45,Math.sin(a)*0.45); sp.rotation.x=a+Math.PI/2; w.add(sp); }
    const ax=Cy(0.09,0.09,1.4,8,dk,-0.25,0,0,w); ax.rotation.z=Math.PI/2; Cy(0.18,0.18,0.5,10,dk,0,0,0,w).rotation.z=Math.PI/2;
    an.push((t)=>{ w.rotation.x=-t*0.8; }); },
  mt_sheep(d,g){ Sp(0.32,d.v==='black'?0x3a3a3a:0xf4f0e8,0,0.45,0,g,8,6).scale.set(1,0.85,1.3); Sp(0.13,0x2a2a2a,0,0.55,0.38,g,6,5); [[-0.12,-0.2],[0.12,-0.2],[-0.12,0.2],[0.12,0.2]].forEach(([x,z])=>B(0.06,0.3,0.06,0x2a2a2a,x,0,z,g)); if(typeof ANIM3!=='undefined') ANIM3.dress(g,'sheep',{face:hsh(d.x*3,d.y*5)*6.28}); },
  hsSkep(d,g){ for(let i=0;i<4;i++) Cy(0.3-i*0.06,0.32-i*0.06,0.16,10,0xd8b060,0,i*0.15,0,g); B(0.1,0.08,0.02,0x3a2a1a,0,0.08,0.31,g); Cy(0.4,0.4,0.1,6,WOOD,0,-0.02,0,g); },
  hsWell(d,g){ if(typeof LOOK2!=='undefined'&&LOOK2){   // V111: a proper well: a ring of fieldstones, a mossy rim, posts, a shingled hood, the windlass, rope and bucket
      const st=[0x9a9488,0x8a8478,0xa8a294,0x928c80]; for(let r=0;r<3;r++) for(let i=0;i<12;i++){ const a=(i+(r%2)*0.5)/12*Math.PI*2, s=B(0.28,0.2,0.16,st[(i+r)%4],0,0,0,g); s.position.set(Math.cos(a)*0.46,r*0.2+0.1,Math.sin(a)*0.46); s.rotation.y=-a+Math.PI/2; }
      const rim=new THREE.Mesh(new THREE.TorusGeometry(0.46,0.09,6,16),new THREE.MeshPhongMaterial({color:0xa8a294,shininess:4})); rim.rotation.x=Math.PI/2; rim.position.y=0.62; g.add(rim); Cy(0.38,0.38,0.02,14,0x2f5f7c,0,0.4,0,g);
      for(let i=0;i<5;i++){ const a=i*1.3, m=Sp(0.07,0x5f8a48,Math.cos(a)*0.48,0.66,Math.sin(a)*0.48,g,6,4); m.scale.y=0.4; }
      [-0.5,0.5].forEach(x=>{ Cy(0.05,0.06,1.6,8,WOOD_D,x,0,0,g); B(0.12,0.12,0.12,WOOD_D,x,1.5,0,g); });
      [-1,1].forEach(sd=>{ const r=B(0.75,0.06,1.25,0x8e4a36,0,0,0,g); r.position.set(sd*0.3,1.82,0); r.rotation.z=-sd*0.62; for(let i=0;i<4;i++){ const sh=B(0.76,0.025,1.27,i%2?0x7e3e2e:0x9a5440,0,0,0,g); sh.position.set(sd*(0.48-i*0.12),1.66+i*0.09,0); sh.rotation.z=-sd*0.62; } });
      B(0.06,0.06,1.25,WOOD_D,0,2.04,0,g); const ax=Cy(0.045,0.045,1.1,8,WOOD,0,0,0,g); ax.rotation.z=Math.PI/2; ax.position.y=1.3; Cy(0.07,0.07,0.36,8,0xc8b080,0,0,0,g).rotation.z=Math.PI/2; g.children[g.children.length-1].position.set(0,1.3,0);
      B(0.04,0.3,0.04,WOOD_D,0.6,1.14,0,g); B(0.04,0.04,0.16,WOOD_D,0.6,1.12,0.08,g); B(0.012,0.5,0.012,0xc8b080,0,0.82,0,g); Cy(0.1,0.08,0.16,8,0x7a5a3a,0,0.66,0,g); Cy(0.105,0.105,0.02,8,0x3a3a40,0,0.75,0,g); return; }
    Cy(0.5,0.5,0.6,12,ROCK,0,0,0,g); Cy(0.4,0.4,0.02,12,0x2f5f7c,0,0.55,0,g); B(0.08,1.3,0.08,WOOD_D,-0.45,0,0,g); B(0.08,1.3,0.08,WOOD_D,0.45,0,0,g);
    const r=prism(1.2,0.5,0.9,0x8e4a36); r.position.y=1.3; g.add(r); Cy(0.1,0.1,0.2,8,WOOD,0,0.85,0,g); },
  hsCoop(d,g){ B(0.9,0.6,0.7,0xb87a4a,0,0.2,0,g); const r=prism(1.0,0.4,0.8,0x8e4a36); r.position.y=0.8; g.add(r); [[-0.3,0.2],[0.3,0.2],[0,0.6]].forEach(([x,z])=>B(0.06,0.2,0.06,WOOD_D,x,0,z-0.2,g)); Sp(0.1,0xf4f0e8,0.5,0.12,0.4,g,6,4);
    if(typeof ANIM3!=='undefined'&&ANIM3.on){ g.children[g.children.length-1].visible=false; [[0.85,0.75,1,'chicken'],[1.15,-0.25,2.6,'chicken'],[-0.75,0.85,4.1,'chicken'],[1.0,0.35,0.4,'chick'],[1.2,0.5,5.2,'chick']].forEach(([x,z,r,k])=>{ const c=new THREE.Group(); c.position.set(x,0,z); c.rotation.y=r; g.add(c); ANIM3.dress(c,k); }); } },   /* V190: hens and chicks pecking about the coop */
  farmStand(d,g){ g.position.x+=0.5; B(1.6,0.7,0.6,WOOD,0,0,0,g); [[-0.5,0xe04a3a],[0,0xf0c040],[0.5,0x6cb065]].forEach(([x,c])=>{ B(0.4,0.12,0.4,WOOD_D,x,0.7,0,g); for(let i=0;i<3;i++) Sp(0.07,c,x-0.1+i*0.1,0.88,0,g,5,4); });
    B(0.06,1.4,0.06,WOOD_D,-0.75,0,-0.25,g); B(0.06,1.4,0.06,WOOD_D,0.75,0,-0.25,g); const a=B(1.7,0.05,0.8,0x2f6a3a,0,1.4,0,g); a.rotation.x=0.2; },
  marketStall(d,g){ g.position.x+=0.5; B(1.6,0.8,0.7,WOOD,0,0,0,g); for(let i=0;i<6;i++){ const s=B(1.7/6,0.05,1.0,i%2?0xf3ead6:0xb8402e,-0.85+1.7/6*(i+0.5),1.55,0,g); s.rotation.x=0.18; }
    B(0.06,1.6,0.06,WOOD_D,-0.8,0,0.4,g); B(0.06,1.6,0.06,WOOD_D,0.8,0,0.4,g); [[-0.5,0xd84a3a],[-0.2,0xf2c14e],[0.2,0x6cb065],[0.5,0x8a5ab8]].forEach(([x,c])=>B(0.22,0.16,0.22,c,x,0.8,0,g)); },
  oasis(d,g){ g.position.x+=1; g.position.z+=1; const w=Cy(1.3,1.3,0.06,14,new THREE.MeshPhongMaterial({color:0x3f9ec0,shininess:80}),0,-0.02,0,g); Cy(1.45,1.5,0.05,14,0xd8c48a,0,-0.04,0,g);
    [[1.2,0.6],[-1.1,-0.7]].forEach(([x,z])=>{ const p=group(x,0,z,g); DECOR_KINDS.palm({x:x*7},p,[]); }); },
  mt_cottage(d,g){ g.position.x+=0.5; g.position.z+=1; B(1.8,1.2,1.6,0xe8e0d0,0,0,0,g); const r=prism(2.1,1.0,1.9,0x5a6a7a); r.position.y=1.2; g.add(r); B(0.4,0.7,0.04,0x5a3c20,0,0,0.82,g); },
  mt_windmill(d,g,an){ g.position.x+=0.5; g.position.z+=0.5; Cy(0.5,0.8,2.6,8,0xe8e0d0,0,0,0,g); Co(0.6,0.8,8,0x8e4a36,0,2.6,0,g); const hub=group(0,2.3,0.75,g);
    for(let i=0;i<4;i++){ const s=B(0.25,1.6,0.04,0xf4eedc,0,0.8,0,group(0,0,0,hub)); s.parent.rotation.z=i*Math.PI/2; } an.push((t)=>{ hub.rotation.z=t*0.8; }); }
});
// ════════════════════════════════════════════════════════════════
//  V112 (LOOK2): the village props re-sculpted in the characters' manner — barrels of bent staves with iron hoops and a lid,
//  crates of boards with corner posts and a cross-brace, a lamp-post with a glazed iron lantern and a little roof, a hay cart
//  with spoked wheels, a sprung bed and shafts, a market stall on turned posts under a scalloped striped canopy heaped with
//  produce, a planter of boards spilling flowers, a log pile with cut ends. The classic look keeps the old ones.
// ════════════════════════════════════════════════════════════════
(function(){ if(typeof LOOK2==='undefined'||!LOOK2) return; const O=Object.assign({},DECOR_KINDS), PM=c=>new THREE.MeshPhongMaterial({color:c,shininess:4});
  const OAK=[0x8a6440,0x7e5a38,0x946c46,0x84603c], IRON=0x34343a;
  const wheel=(g,x,y,z,r)=>{ const w=group(x,y,z,g); const rim=new THREE.Mesh(new THREE.TorusGeometry(r,0.045,6,16),PM(0x5a3c22)); w.add(rim); const tyre=new THREE.Mesh(new THREE.TorusGeometry(r+0.03,0.02,4,16),PM(IRON)); w.add(tyre);
    for(let i=0;i<8;i++){ const s=B(0.035,r*2-0.06,0.035,0x6a4a2a,0,-r+0.03,0,w); s.rotation.z=i*Math.PI/8; s.position.set(0,0,0); s.geometry.translate(0,0,0); } Cy(0.07,0.07,0.12,8,0x4a3020,0,-0.06,0,w).rotation.x=Math.PI/2; return w; };
  function barrel(d,g,top){ const n=14; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, s=B(0.13,0.8,0.05,OAK[i%4],0,0,0,g); s.position.set(Math.cos(a)*0.27,0,Math.sin(a)*0.27); s.rotation.y=-a+Math.PI/2; s.scale.set(1,1,1); }
    Cy(0.25,0.25,0.78,12,PM(0x6a4a2a),0,0.01,0,g); [0.1,0.4,0.68].forEach(y=>Cy(0.305,0.305,0.05,14,PM(IRON),0,y,0,g)); if(top!==false){ Cy(0.26,0.26,0.03,12,PM(0x9a7448),0,0.78,0,g); B(0.42,0.02,0.05,0x7a5432,0,0.81,0,g); } }
  Object.assign(DECOR_KINDS,{
    barrel(d,g){ barrel(d,g); },
    fishBarrel(d,g){ barrel(d,g,false); Cy(0.26,0.26,0.02,12,PM(0xdde4e8),0,0.74,0,g); for(let i=0;i<4;i++){ const f=Sp(0.06,[0x9ab0c0,0xb8c4cc,0xe8a090][i%3],-0.12+i*0.08,0.82,(i%2?0.05:-0.05),g,6,4); f.scale.set(2.2,0.8,0.7); f.rotation.y=i*0.8; } },
    crate(d,g){ const s=0.68; for(let i=0;i<4;i++){ [-1,1].forEach(sz=>B(s,0.15,0.04,OAK[(i+(sz>0?1:0))%4],0,0.02+i*0.165,sz*(s/2-0.02),g)); [-1,1].forEach(sx=>B(0.04,0.15,s,OAK[(i+2)%4],sx*(s/2-0.02),0.02+i*0.165,0,g)); }
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.07,0.7,0.07,0x5a3c22,a*(s/2-0.02),0,b*(s/2-0.02),g)); B(s,0.04,s,OAK[1],0,0.68,0,g);
      [-1,1].forEach(sz=>{ const x=B(0.05,0.84,0.03,0x6a4a2a,0,0.0,sz*(s/2+0.01),g); x.position.y=0.35; x.rotation.z=0.82; }); },
    lantern(d,g){ Cy(0.05,0.08,1.6,8,PM(0x2e2a26),0,0,0,g); Cy(0.14,0.18,0.14,8,PM(0x2e2a26),0,0,0,g); B(0.04,0.04,0.3,0x2e2a26,0,1.55,0.1,g);
      const lg=group(0,1.62,0,g); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.025,0.32,0.025,0x2e2a26,a*0.12,0,b*0.12,lg)); const L=B(0.2,0.28,0.2,glow(0xffd27a),0,0.02,0,lg);
      B(0.3,0.04,0.3,0x2e2a26,0,0,0,lg); Co(0.24,0.18,4,PM(0x2e2a26),0,0.32,0,lg).rotation.y=Math.PI/4; Sp(0.04,0xe8c050,0,0.52,0,lg,6,4); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(L,1.7); },
    planter(d,g){ for(let i=0;i<3;i++) [[0.8,0,0.38,0],[0.8,0,-0.38,0],[0.8,0.38,0,1],[0.8,-0.38,0,1]].forEach(([L,x,z,r],k)=>B(r?0.05:L,0.13,r?L:0.05,OAK[(i+k)%4],x,i*0.13,z,g));
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.08,0.44,0.08,0x5a3c22,a*0.38,0,b*0.38,g)); B(0.72,0.3,0.72,0x5a4030,0,0.05,0,g);
      const C=[0xe85a6a,0xffe060,0xf4f0ea,0xb08ae8,0xf08a3a]; for(let i=0;i<9;i++){ const x=(i%3-1)*0.22, z=(Math.floor(i/3)-1)*0.22; const l=Sp(0.13,0x4f8a44,x,0.42,z,g,7,5); l.scale.y=0.7; Sp(0.065,C[i%5],x+0.04,0.55,z+0.03,g,6,4); }
      [[-0.4,0.1],[0.4,-0.1]].forEach(([x,z])=>{ const t=Sp(0.08,0x5a9a48,x,0.3,z,g,6,4); t.scale.set(0.6,1.6,0.6); }); },
    haycart(d,g){ g.position.x+=0.5; const bed=group(0,0.5,0,g); B(1.6,0.08,0.95,0x8a6440,0,0,0,bed); [-1,1].forEach(sz=>{ for(let i=0;i<3;i++) B(1.6,0.08,0.04,OAK[i],0,0.1+i*0.12,sz*0.46,bed); for(let x=-0.75;x<=0.76;x+=0.375) B(0.05,0.42,0.05,0x5a3c22,x,0.06,sz*0.47,bed); });
      [-1,1].forEach(sx=>{ for(let i=0;i<3;i++) B(0.04,0.08,0.95,OAK[i+1],sx*0.78,0.1+i*0.12,0,bed); });
      for(let i=0;i<14;i++){ const h=Sp(0.26,i%3?0xe0c060:0xd0b050,-0.6+(i%5)*0.3,0.4+Math.floor(i/5)*0.16,(i%2?0.18:-0.18)+(i%3-1)*0.08,bed,8,6); h.scale.set(1.2,0.75,1); }
      for(let i=0;i<10;i++){ const s=B(0.012,0.22,0.012,0xe8d070,-0.6+i*0.13,0.75,(i%2?0.2:-0.15),bed); s.rotation.z=(i%3-1)*0.5; }
      [[-0.55,0.55],[0.55,0.55],[-0.55,-0.55],[0.55,-0.55]].forEach(([x,z])=>wheel(g,x,0.34,z,0.32)); const ax=Cy(0.04,0.04,1.2,6,PM(0x4a3020),0,0.34,0,g); ax.rotation.x=Math.PI/2; ax.position.y=0.34;
      [-0.25,0.25].forEach(z=>{ const s=B(1.3,0.05,0.05,0x6a4a2a,1.35,0.42,z,g); s.rotation.z=-0.18; }); B(0.05,0.05,0.56,0x6a4a2a,1.95,0.3,0,g); },
    marketStall(d,g){ g.position.x+=0.5; const C=[0xb8402e,0xf3ead6]; B(1.5,0.08,0.7,0x9a7448,0,0.78,0,g); B(1.46,0.7,0.04,0x7a5432,0,0.08,0.33,g); for(let x=-0.66;x<0.7;x+=0.22) B(0.03,0.7,0.02,0x5a3c22,x,0.08,0.355,g);
      [[-0.78,0.4],[0.78,0.4],[-0.78,-0.4],[0.78,-0.4]].forEach(([x,z])=>{ Cy(0.04,0.045,1.85,8,PM(0x6a4a2a),x,0,z,g); Sp(0.05,0x6a4a2a,x,1.86,z,g,6,4); });
      for(let i=0;i<7;i++){ const s=B(1.76/7+0.005,0.04,1.1,C[i%2],-0.88+1.76/7*(i+0.5),0,0,g); s.position.y=1.8; s.rotation.x=0.22; Co(1.76/14,0.13,4,C[i%2],-0.88+1.76/7*(i+0.5),1.6,0.58,g).rotation.set(Math.PI,Math.PI/4,0); }
      const crate=(x,col,n)=>{ B(0.36,0.12,0.3,0x8a6440,x,0.86,0,g); for(let i=0;i<n;i++) Sp(0.065,col,x-0.11+(i%4)*0.075,0.99+Math.floor(i/4)*0.06,(i%2?0.06:-0.06),g,6,4); };
      crate(-0.5,0xd84a3a,8); crate(-0.1,0xf2c14e,8); crate(0.3,0x6cb065,7); Cy(0.1,0.08,0.12,8,0xb8643a,0.6,0.86,0.05,g); B(0.24,0.06,0.18,0xc8a060,0.6,0.86,-0.18,g);
      for(let i=0;i<3;i++) Sp(0.12,[0x7ab04a,0xe0c060,0xd88a3a][i],-0.6+i*0.5,0.18,-0.5,g,7,5); },
    logpile(d,g){ for(let i=0;i<3;i++) for(let j=0;j<3-i;j++){ const x=-0.26+j*0.26+i*0.13, y=0.13+i*0.23, l=Cy(0.13,0.13,0.85,9,PM(OAK[(i+j)%4]),x,0,0,g); l.rotation.x=Math.PI/2; l.position.y=y;
      [-1,1].forEach(sz=>{ const e=Cy(0.115,0.115,0.02,9,PM(0xc8a272),x,0,sz*0.43,g); e.rotation.x=Math.PI/2; e.position.y=y; }); } const ax=B(0.04,0.4,0.04,0x6a4a2a,0.5,0.0,0.2,g); ax.rotation.z=0.4; B(0.14,0.08,0.03,0x8a8a92,0.62,0.32,0.2,g); }
  });
})();
