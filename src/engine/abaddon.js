// ════════════════════════════════════════════════════════════════
//  THE FINALE — Abaddon, the Destroyer, in his throne room (data/pastimes.json → finale), the game's rules:
//   · the doors open only once all ten towns are cleansed; after he falls the hall stands empty.
//   · 15×11 hall: the dais he starts on, four broken pillars, veins of old fire. The floor gives way as he
//     loses (AB_BREAK): chasms cost you and shove you back to solid ground.
//   · three phases by HP (The Deceiver → The Destroyer → The Desperate), each its own move list and taunt;
//     volley / spread / charge / slam / SHIELD (three shades; he cannot be hurt until they are destroyed).
//   · the point-blank retaliation nova (crowd him through a wind-up and it lands once, piercing).
//   · the creeping shadow margin from the second phase. Rage under 15%: telegraphs at 0.65.
//   · abaddonHitGate: 300 ms between landed blows, 8% cap, braced (×0.3) mid-wind-up; abaddonHurtKnight's blows.
//   · victory: he dissolves in a shaft of light, Sir Aldric walks up, then King Karl's grant in the keep.
//  finaleLevel(F, spec) · spec = { id, exit:{level,spawn}, keep:'keep', afterKeep:{level,spawn} } → { enter() }
// ════════════════════════════════════════════════════════════════
function abaddonModel(ph,art){ const A=art[Math.max(0,Math.min(2,ph))], H=hexn, g=new THREE.Group(), mats=[];
  const pm=c=>{ const m=new THREE.MeshPhongMaterial({color:H(c),flatShading:true,shininess:12}); mats.push(m); return m; };
  const tint=pm(A.tint), hi=pm(A.hi), robe=pm(A.robe), gold=pm(A.gold), eye=new THREE.MeshBasicMaterial({color:H(A.eye)}), black=new THREE.MeshBasicMaterial({color:0x000000});
  const M=(geo,mat,x,y,z,par)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); (par||g).add(m); return m; };
  M(new THREE.CylinderGeometry(0.42,0.62,1.2,8),robe,0,0.6,0); M(new THREE.CylinderGeometry(0.2,0.3,1.0,8),hi,-0.3,0.55,0.12).scale.set(0.5,1,0.5);
  M(new THREE.BoxGeometry(0.78,0.66,0.5),tint,0,1.45,0); M(new THREE.BoxGeometry(0.22,0.6,0.52),hi,-0.3,1.45,0);
  if(ph===0){ M(new THREE.BoxGeometry(0.82,0.12,0.54),gold,0,1.2,0); }
  if(ph>=1){ M(new THREE.BoxGeometry(0.4,0.32,0.06),black,0,1.36,0.25); M(new THREE.SphereGeometry(0.06,6,4),eye,-0.08,1.38,0.29); }
  const head=group(0,1.98,0,g); M(new THREE.BoxGeometry(0.5,0.42,0.42),tint,0,0,0,head); M(new THREE.BoxGeometry(0.18,0.42,0.43),hi,-0.16,0,0,head);
  if(ph<2){ [-0.11,0.11].forEach(x=>M(new THREE.SphereGeometry(0.055,6,4),eye,x,0.03,0.22,head)); }
  else { M(new THREE.BoxGeometry(0.44,0.26,0.04),black,0,0.02,0.22,head); [-0.11,0.11].forEach(x=>M(new THREE.SphereGeometry(0.06,6,4),eye,x,0.05,0.25,head));
    for(let i=0;i<4;i++) M(new THREE.BoxGeometry(0.05,0.1,0.03),new THREE.MeshBasicMaterial({color:0xe8e0d0}),-0.12+i*0.08,-0.13,0.24,head); }
  if(ph===0){ M(new THREE.BoxGeometry(0.52,0.12,0.44),gold,0,0.25,0,head); for(let i=0;i<4;i++) M(new THREE.ConeGeometry(0.06,0.22,4),gold,-0.18+i*0.12,0.42,0.18,head); }
  else { const hl=ph===1?0.36:0.6, hc=ph===1?gold:hi; [-1,1].forEach(s=>{ const h=M(new THREE.ConeGeometry(0.08,hl,5),hc,s*0.2,0.3+hl/2,0,head); h.rotation.z=-s*0.35;
      if(ph>=2){ const h2=M(new THREE.ConeGeometry(0.05,0.3,4),hi,s*0.32,0.05,0,head); h2.rotation.z=-s*1.1; } }); }
  // wings: folded and almost courtly, torn wide open by the end
  const wings=[]; [-1,1].forEach(s=>{ const w=group(s*0.38,1.6,-0.22,g); const sp=0.5+ph*0.35, len=0.9+ph*0.4;
    M(new THREE.BoxGeometry(len,0.08,0.7+ph*0.2),robe,s*len/2,0,0,w); if(ph>=1) M(new THREE.BoxGeometry(len*0.9,0.06,0.2),hi,s*len/2,0.04,0.32+ph*0.08,w);
    if(ph>=2) for(let i=0;i<4;i++) M(new THREE.BoxGeometry(0.16,0.05,0.14),hi,s*(len*0.95),0,-0.3+i*0.2,w);
    w.rotation.z=s*(0.9-sp*0.6); w.rotation.y=-s*0.3; wings.push([w,s,sp]); });
  const light=new THREE.PointLight(H(art[ph].hi),0.9,8,1.6); light.position.y=1.6; g.add(light);
  g.scale.setScalar(1+ph*0.14); g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); g.userData.mats=mats;
  g.userData.flap=t=>wings.forEach(([w,s,sp])=>w.rotation.z=s*(0.9-sp*0.6)+Math.sin(t*2.2)*0.12*s); return g; }

// THE PRETENDER KING — the usurper on Abaddon's empty throne (drawDemonKing): an armoured goldfish monarch with an
// eyepatch, a gold crown and a golden trident, a red cloak. He swells a little as he is pressed.
function pretenderModel(ph){ const g=new THREE.Group(), mats=[], H=hexn;
  const pm=c=>{ const m=new THREE.MeshPhongMaterial({color:c,flatShading:true,shininess:20}); mats.push(m); return m; };
  const M=(geo,mat,x,y,z,par)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); (par||g).add(m); return m; };
  const armor=pm(0x2a2a32), plate=pm(0x3a3a44), gold=pm(0xf2c14e), fish=pm(0xe8892a), fishL=pm(0xf2a94e), fishD=pm(0xc86a1e), cream=pm(0xe8d8a8), cloak=pm(0xa8402a), blue=pm(0x3a6ac0);
  M(new THREE.CylinderGeometry(0.5,0.62,0.9,8),cloak,0,0.5,-0.08);                                   // the cloak's skirt
  [-0.16,0.16].forEach(x=>{ M(new THREE.BoxGeometry(0.2,0.55,0.22),fish,x,0.28,0.04); M(new THREE.BoxGeometry(0.22,0.08,0.26),cream,x,0.04,0.08); });
  M(new THREE.BoxGeometry(0.72,0.55,0.46),armor,0,1.12,0); M(new THREE.BoxGeometry(0.74,0.08,0.48),gold,0,0.86,0);
  M(new THREE.BoxGeometry(0.24,0.26,0.05),blue,0,1.12,0.24); M(new THREE.BoxGeometry(0.05,0.05,0.06),gold,-0.06,1.18,0.27); M(new THREE.BoxGeometry(0.05,0.05,0.06),gold,0.06,1.08,0.27);
  [-1,1].forEach(sd=>{ M(new THREE.BoxGeometry(0.26,0.22,0.3),plate,sd*0.46,1.36,0); M(new THREE.BoxGeometry(0.27,0.05,0.31),gold,sd*0.46,1.46,0); });
  M(new THREE.BoxGeometry(0.64,0.14,0.42),cream,0,1.46,0.02);                                         // the white ruff
  const head=group(0,1.82,0,g); M(new THREE.SphereGeometry(0.38,10,8),fish,0,0,0,head).scale.set(1,0.9,1.05); M(new THREE.SphereGeometry(0.2,8,6),fishL,-0.14,0.08,0.18,head);
  M(new THREE.SphereGeometry(0.1,8,6),new THREE.MeshBasicMaterial({color:0xf4f0e8}),0.16,0.05,0.3,head); M(new THREE.SphereGeometry(0.045,6,4),new THREE.MeshBasicMaterial({color:0x1a1a22}),0.18,0.05,0.38,head);
  M(new THREE.BoxGeometry(0.16,0.12,0.04),new THREE.MeshBasicMaterial({color:0x2a2230}),-0.15,0.06,0.34,head); M(new THREE.BoxGeometry(0.42,0.03,0.03),new THREE.MeshBasicMaterial({color:0x2a2230}),0,0.12,0.3,head).rotation.z=-0.3;
  M(new THREE.BoxGeometry(0.18,0.06,0.06),pm(0xe8a0b8),0,-0.16,0.34,head);                           // the lips
  [-1,1].forEach(sd=>{ const f=M(new THREE.ConeGeometry(0.12,0.3,4),fishD,sd*0.38,-0.02,-0.05,head); f.rotation.z=sd*1.4; });
  M(new THREE.ConeGeometry(0.14,0.36,4),fishD,0,0.06,-0.4,head).rotation.x=-1.3;                       // the tail fin behind
  M(new THREE.CylinderGeometry(0.3,0.3,0.12,10),gold,0,0.36,0,head); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; M(new THREE.ConeGeometry(0.05,0.18,4),gold,Math.sin(a)*0.25,0.5,Math.cos(a)*0.25,head); }
  const arm=group(0.52,1.2,0.05,g); M(new THREE.BoxGeometry(0.14,0.5,0.14),armor,0,-0.2,0,arm); const tri=group(0.08,-0.45,0.1,arm);
  M(new THREE.CylinderGeometry(0.03,0.03,2.0,6),gold,0,0.5,0,tri); M(new THREE.BoxGeometry(0.4,0.05,0.05),gold,0,1.5,0,tri); [-0.18,0,0.18].forEach(x=>M(new THREE.ConeGeometry(0.035,0.24,4),gold,x,1.64,0,tri));
  const light=new THREE.PointLight(0xe0885a,0.8,8,1.6); light.position.y=1.6; g.add(light);
  g.scale.setScalar(1.05+ph*0.08); g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); g.userData.mats=mats;
  g.userData.flap=t=>{ arm.rotation.x=Math.sin(t*1.6)*0.15; head.rotation.z=Math.sin(t*1.1)*0.05; }; return g; }

function finaleLevel(F,spec){
  const W=F.W, H=F.H, S=()=>GAME.S; let C=F.cfg, who='abaddon'; const KEY=()=>who==='pretender'?'pk':'ab', NEW=()=>typeof BOSSFIGHT!=='undefined'&&BOSSFIGHT.has(KEY());
  /* V180: the sculpted Demon King and Pretender (BOSS3D.sculpt), a little grander each phase, his aura in the phase's colour */
  const sculptOf=ph=>{ if(typeof BOSS3D==='undefined'||!BOSS3D.sculpt) return null; const col=hexn((C.phases[ph]||C.phases[0]).color), MK=who==='pretender'?'pk':(ph&&typeof BOSSART!=='undefined'&&BOSSART.has('ab'+ph)?'ab'+ph:'ab'), m=BOSS3D.sculpt(MK,{tall:who==='pretender'?3.6*(1+ph*0.06):[5.6,6.6,8.4][ph]||5.6,mark:col}); if(!m) return null;   /* V183: Abaddon's three shapes — the crowned Deceiver, the burning Destroyer, the charred Desperate — each taller than the last */
    bossL.color.setHex(col); bossL.intensity=1.6+ph*0.3; bossL2.intensity=0.7; return m; };
  const model=ph=>sculptOf(ph)||(who==='pretender'?pretenderModel(ph):abaddonModel(ph,F.art)), NAME=()=>who==='pretender'?'The Pretender King':'ABADDON, the Demon King', TAG=()=>who==='pretender'?'👑 THE PRETENDER':'👑 ABADDON'; const P=()=>ENGINE.P, PX=COMBAT.PX;
  const strip=h=>String(h).replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').trim();
  const FL=0, DAIS=1, PIL=2, CH=3, VEIN=4;
  let g=null, b=null, foeD=null;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x07030b); scene.fog=new THREE.Fog(0x07030b,14,34);
  const lv={id:spec.id,name:'Abaddon’s Throne',scene,folk:[],spots:[],anim:[],cam:{pitch:0.24,dist:4.6,min:2.2,max:8,lookH:0.55},speed:4.6,cornerHelp:false,interior:true,actorS:0.78};   /* V183: no more looking down from the rafters — the camera at your shoulder, the hall grown to hold him (27×21), so you look UP at the Demon King */
  const hemi=new THREE.HemisphereLight(0x8a6aa8,0x1a0a20,0.55); scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffd8e8,0.45); key.position.set(4,14,10); key.target.position.set(W/2,0,H/2); key.castShadow=true; key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:60}); key.shadow.mapSize.set(2048,2048); scene.add(key,key.target);
  /* V180: his own light, in his phase's colour, so the dark hall doesn't swallow him — in the scene from the start (a light
     added mid-fight makes every material in the hall recompile) and carried with him each step */
  const bossL=new THREE.PointLight(0xb026ff,0,16,1.5), bossL2=new THREE.PointLight(0xffe0c0,0,12,1.7); scene.add(bossL,bossL2);
  const hall=group(0,0,0,scene), tiles={};
  function buildHall(){ while(hall.children.length) hall.remove(hall.children[0]);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=g[y][x], k=x+','+y;
      if(t===CH){ B(1,0.02,1,0x05020a,x+0.5,-1.2,y+0.5,hall); const e=B(0.7,0.02,0.16,glow(0x7a2a14),x+0.5,-1.18,y+0.6,hall); tiles[k]=e; continue; }
      const dais=t===DAIS, top=dais?0.18:0, base=dais?((x+y)%2?0x2b1a38:0x32203f):((x+y)%2?0x1a0e22:0x20122a);
      B(0.98,0.5+top,0.98,base,x+0.5,-0.5,y+0.5,hall);
      if(dais&&y===1) B(1,0.04,0.06,0x7a6030,x+0.5,top-0.03,y+0.98,hall);
      if(t===VEIN){ const v=B(0.75,0.012,0.07,glow(0xff5a28),x+0.5,0.001,y+0.4,hall); B(0.12,0.012,0.12,glow(0xff9646),x+0.38,0.001,y+0.3,hall); tiles[k]=v; }
      if(t===PIL){ const h=9+hsh(x,y)*2.5;   /* pillars that go up into the dark */ B(0.86,h,0.86,0x3a2a48,x+0.5,0,y+0.5,hall); B(0.3,h,0.88,0x54405f,x+0.25,0,y+0.5,hall); B(0.95,0.18,0.95,0x4a3658,x+0.5,h-0.05,y+0.5,hall); } }
    // the throne he rose from, behind the dais
    const th=group(W/2,0.18,0.25,hall); th.scale.setScalar(2.6); B(1.6,2.6,0.3,0x1a0e24,0,0,-0.1,th); B(1.3,0.6,0.7,0x2a1838,0,0,0.25,th); [-0.7,0.7].forEach(x=>{ B(0.18,1.0,0.7,0x2a1838,x,0,0.25,th); Co(0.1,0.5,4,0x8a6a20,x,1.0,0.25,th); });
    Co(0.15,0.6,4,0x8a6a20,0,2.6,-0.1,th); shade(hall); }
  // embers rising through the void
  const emb=[]; const emM=new THREE.MeshBasicMaterial({color:0xff7840,transparent:true,opacity:0.6});
  for(let i=0;i<40;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.05),emM); m.position.set(-3+Math.random()*(W+6),-4+Math.random()*8,-3+Math.random()*(H+6)); scene.add(m); emb.push(m); }
  // the creeping shadow and the line it stops at
  const shadowM=new THREE.MeshBasicMaterial({color:0x28001e,transparent:true,opacity:0.66,depthWrite:false});
  const strips=[0,1,2,3].map(()=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),shadowM); m.rotation.x=-Math.PI/2; m.position.y=0.03; scene.add(m); return m; });
  const lineM=new THREE.LineBasicMaterial({color:0xff2a6a,transparent:true,opacity:0.5}), lineG=new THREE.BufferGeometry(); lineG.setAttribute('position',new THREE.Float32BufferAttribute(new Array(15).fill(0),3));
  const edge=new THREE.Line(lineG,lineM); edge.frustumCulled=false; scene.add(edge);
  // the shaft of holy light at the end, and the death motes
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,14,16,1,true),new THREE.MeshBasicMaterial({color:0xfff7d8,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); shaft.position.y=7; scene.add(shaft);
  const motes=[]; const moteM=new THREE.MeshBasicMaterial({color:0xb026ff,transparent:true,opacity:1});
  // Sir Aldric for the victory beat
  let aldric=null;
  // V154: Sir Aldric, chained to the Destroyer's throne like a dog: fifteen years on his knees at its foot, made to watch
  //  everything Abaddon did, weak and shamed but never broken. A short beat on him as you come in; when Abaddon falls the
  //  chains burst in the light, and he rises and comes to you.
  let chained=null; const linkG=new THREE.TorusGeometry(0.07,0.022,5,10), wpA=new THREE.Vector3(), ANCH=new THREE.Vector3();
  function unchain(){ if(!chained) return; scene.remove(chained.g); chained.links.forEach(l=>scene.remove(l.m)); scene.remove(chained.collar); chained=null; }
  function chainAldric(){ unchain(); const K=person('general',{who:'Sir Aldric'}), x=W/2+1.7, z=1.25, y=lv.ground(x,z);
    K.position.set(x,y,z); K.rotation.y=-0.25; scene.add(K); const mats=[];
    K.traverse(m=>{ if(!m.isMesh||!m.material||!m.material.color||m.userData.outline) return; m.material=m.material.clone(); mats.push({m:m.material,c:m.material.color.clone()}); m.material.color.lerp(new THREE.Color(0x4a4440),0.5); });
    const linkM=new THREE.MeshPhongMaterial({color:0x7a7a84,shininess:90,specular:0xc8c8d0,emissive:0x101014});
    ['sword','sheathP','backP'].forEach(k=>{ if(K.rig&&K.rig[k]) K.rig[k].visible=false; });   // no sword for a prisoner:
    // his sword hangs at his hip, baked into his figure's plate: the grip is its own piece; the blade and guard stand out past
    //  the cuirass's side (x > 0.245), so a copy of those pieces without those faces leaves him without it
    K.rig.torso.children.forEach(m=>{ if(!m.isMesh) return; if(m.userData.mat==='grip'){ m.visible=false; return; } if(m.userData.mat!=='white'&&m.userData.mat!=='gold') return;
      const g=m.geometry.clone(), P=g.attributes.position, I=g.index; if(!I) return; const keep=[];
      for(let i=0;i<I.count;i+=3){ const a=I.getX(i), b2=I.getX(i+1), c=I.getX(i+2); const out=v=>P.getX(v)>0.245||(m.userData.mat==='gold'&&P.getX(v)>0.19&&P.getY(v)<0.22); if(out(a)&&out(b2)&&out(c)) continue; keep.push(a,b2,c); }
      g.setIndex(keep); m.geometry=g; });
    const collar=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.04,6,14),linkM); collar.rotation.x=Math.PI/2; scene.add(collar);
    const links=[]; for(let k=0;k<14;k++){ const m=new THREE.Mesh(linkG,linkM); scene.add(m); links.push({m,v:new THREE.Vector3()}); }
    ANCH.set(W/2+0.7,0.18+1.05,0.5);   // the ring on the throne's arm the chain is bolted to
    chained={g:K,x,z,mats,linkM,collar,links,look:0,state:'kneel',broke:false}; } lv._chained=()=>chained;
  const _grey=new THREE.Color(0x4a4440);
  function poseChained(dt,t){ const c=chained; if(!c) return; const K=c.g, r=K.rig;
    if(c.state==='kneel'){ K.animate(dt,'kneel',0.5); const lift=c.look;   // 0: his head hung low · 1: raised to you
      r.torso.rotation.x=0.42-lift*0.24+Math.sin(t*1.1)*0.02; r.head.rotation.x=0.7-lift*0.75; r.AL.sh.rotation.set(0.15,0,0.12); r.AR.sh.rotation.set(0.15,0,-0.12); r.AL.el.rotation.x=-0.2; r.AR.el.rotation.x=-0.2; }
    else K.animate(dt,c.state==='walk'?'walk':'idle',c.state==='walk'?0.7:0.5);
    if(!c.broke){ r.head.getWorldPosition(wpA); wpA.y-=0.1; c.collar.position.copy(wpA);
      const n=c.links.length; c.links.forEach((L,k)=>{ const u=(k+0.5)/n; L.m.position.lerpVectors(wpA,ANCH,u); L.m.position.y-=Math.sin(u*Math.PI)*0.28; L.m.lookAt(ANCH); if(k%2) L.m.rotateZ(Math.PI/2); }); }
    else { c.links.forEach(L=>{ L.v.y-=9*dt; L.m.position.addScaledVector(L.v,dt); L.m.rotation.x+=dt*8; L.m.scale.multiplyScalar(Math.max(0,1-dt*0.7)); }); c.collar.position.addScaledVector(c.cv,dt); c.cv.y-=9*dt; c.collar.scale.multiplyScalar(Math.max(0,1-dt*0.7)); } }
  function breakChains(){ const c=chained; if(!c||c.broke) return; c.broke=true; if(typeof SFX!=='undefined') SFX.play('parry');
    c.linkM.emissive.setHex(0xffe6a8); c.links.forEach(L=>L.v.set((Math.random()-0.5)*5,Math.random()*4+1,(Math.random()-0.5)*5)); c.cv=new THREE.Vector3(0.6,3,0.8); }
  // the intro beat: the view goes to him; he lifts his head; then Abaddon mocks you with him, and the fight begins
  function introBeat(){ const c=chained; if(!c) return; b.intro=1e9;
    const VP=new THREE.Vector3(c.x-0.2,1.6,c.z+3.5), VL=new THREE.Vector3(c.x-0.5,0.85,c.z), cp=new THREE.Vector3(), cl=new THREE.Vector3(), dir=new THREE.Vector3(); let T0=0, w=0, back=false;
    lv.cine=(cam,dt)=>{ dt=dt||0.016; T0+=dt; w=back?Math.max(0,w-dt/0.8):Math.min(1,w+dt/1.2); const k=w*w*(3-2*w);
      cam.getWorldDirection(dir); cp.copy(cam.position); cl.copy(cp).addScaledVector(dir,5); cam.position.lerpVectors(cp,VP,k); cam.lookAt(cl.lerp(VL,k));
      c.look=back?Math.max(0,c.look-dt*0.8):Math.min(1,Math.max(0,(T0-1.0)/1.2)); if(back&&w<=0) lv.cine=null; };
    setTimeout(()=>ENGINE.speak('Sir Aldric',['(At the foot of the throne a man in tarnished white plate kneels in a collar and chain, thin and grey. He lifts his head.)',
      '…My child? No — do not look at me. Look to Him.','“Though he slay me, yet will I trust in him.” I have not stopped praying for you. Not one night.'],null,()=>{ back=true;
      ENGINE.speak(NAME(),['Ah. You have found my hound.','Fifteen years he has knelt there and watched me unmake everything he loved. Now he will watch me unmake you.',strip(C.phases[0].taunt),'Read his attacks. Dodge with a double-tap of Guard. End the darkness.'],null,()=>{ if(b&&!b.victory) b.intro=60; }); }),1500); }

  const solid=(x,y)=>!(x<0||y<0||x>=W||y>=H)&&g&&g[y][x]!==PIL&&g[y][x]!==CH;
  lv.ground=(x,z)=>{ const tx=Math.floor(x), ty=Math.floor(z); if(!g||!g[ty]||g[ty][tx]===undefined) return 0; return g[ty][tx]===DAIS?0.18:g[ty][tx]===CH?-0.6:0; };
  lv.canMove=(fx,fz,tx,tz)=>{ if(b&&b.victory) return false; const x=Math.floor(tx), y=Math.floor(tz); if(tx<0.3||tz<0.3||tx>W-0.3||tz>H-0.3) return false; return !g||(g[y][x]!==PIL); };
  lv.zone=()=>b&&!b.victory?`${TAG()} — ${C.phases[b.phase].name}`:(who==='pretender'?'👑 The Usurped Throne':'👑 Abaddon’s Throne');
  lv.clamp=v=>{ v.x=Math.min(W+3,Math.max(-3,v.x)); v.z=Math.min(H+9,Math.max(-1,v.z)); };
  lv.spawn={x:(W/2|0)+0.5,z:H-1.5,face:Math.PI,yaw:0};

  const hurt=(dmg,pierce)=>COMBAT.hurtFromBoss(dmg,pierce);
  COMBAT.arena(lv,{ mode:'finale', W, H, walk:(x,y)=>x>=0&&y>=0&&x<W&&y<H,
    onHit:d=>!(b&&b.shield),
    call:(fn,d,ph)=>{ if(fn==='shield'&&b&&!b.victory) shieldUp(ph); },   /* V180: the new fight calls the shades (bossfight.js 'call') */
    onKill:()=>victory(),
    onDeath:()=>{ b=null; ENGINE.go(spec.exit.level,spec.exit.spawn); setTimeout(()=>UI.toast('💫 Abaddon’s darkness overwhelms you… but you wake at the gate, alive. Try again.',2800),450); },
    tick:()=>tick() });
  lv.combat.tune={dmgMult:1,iframes:34,novaRange:0,novaShots:0,novaSpeed:0,novaLife:0,hotRadius:0,enrageDmg:1};

  function phaseFor(){ const r=foeD.hp/foeD.maxHp; for(let i=C.phases.length-1;i>=0;i--) if(r<=C.phases[i].hpFrom) return i; return 0; }
  function breakFloor(ph){ let n=0; (F.brk[ph]||[]).forEach(([x,y])=>{ if(g[y]&&g[y][x]!==PIL&&g[y][x]!==DAIS){ g[y][x]=CH; n++; } }); if(n){ buildHall(); UI.toast('🕳 The floor gives way.',1600); } }
  function setModel(ph){ const old=foeD.g, m=model(ph); m.position.copy(old.position); m.rotation.y=old.rotation.y; if(old.parent) old.parent.remove(old); scene.add(m); foeD.g=m;
    hemi.color.setHex(ph===0?(who==='pretender'?0xa8786a:0x8a6aa8):hexn(C.phases[ph].color)); hemi.intensity=0.55+ph*0.05; }

  // one step at 60/s: Abaddon's own loop (the game's place.kind==='abaddon' update)
  function ai(d,dx,dz,dist){ if(!b||b.victory) return; const p=P(), ph=b.phase, mv0=C.phases[ph];
    if(b.intro>0){ b.intro--; d.face=Math.atan2(dx,dz); return; }
    if(d.state==='idle'){ d.timer--; d.x+=(d.anchorx-d.x)*0.02; d.z+=(d.anchorz-d.z)*0.02; d.anchorx=(W/2|0)+0.5+Math.sin(Date.now()*0.0006)*3;
      if(d.timer<=0){ const mv=mv0.moves[d.moveIdx%mv0.moves.length]; d.moveIdx++; const rage=d.hp<d.maxHp*0.15?0.65:1; d.move=mv; d.kind=mv.kind; d.state='telegraph'; d.telegraph=Math.round(mv.telegraph*rage); d.telMax=d.telegraph; } }
    else if(d.state==='telegraph'){ d.telegraph--; if(d.kind==='charge'){ d.aimx=dx/dist; d.aimz=dz/dist; }
      if(d.telegraph<=0){ const mv=d.move, col=hexn(C.phases[ph].color);
        if(dist<2.0){ const burst=(b.novaN=(b.novaN||0)+1); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+d.moveIdx*0.4; COMBAT.shot(d.x,d.z,Math.cos(a)*2.8*PX,Math.sin(a)*2.8*PX,26,true,burst,95+ph*25); } }
        if(mv.kind==='volley'){ const a0=Math.atan2(dz,dx); for(let i=0;i<mv.count;i++){ const a=a0+(i-(mv.count-1)/2)*0.16; COMBAT.shot(d.x,d.z,Math.cos(a)*mv.speed*PX,Math.sin(a)*mv.speed*PX,200,false,0,32+ph*10,0xff3a8a); } d.state='idle'; d.timer=40; }
        else if(mv.kind==='spread'){ const off=Math.random()*0.5; for(let i=0;i<mv.count;i++){ const a=off+i/mv.count*Math.PI*2; COMBAT.shot(d.x,d.z,Math.cos(a)*mv.speed*PX,Math.sin(a)*mv.speed*PX,200,false,0,32+ph*10,0xff3a8a); } d.state='idle'; d.timer=42; }
        else if(mv.kind==='charge'){ d.state='charge'; d.timer=28; d.chx=d.aimx*mv.speed*PX; d.chz=d.aimz*mv.speed*PX; }
        else if(mv.kind==='slam'){ d.state='slam'; d.timer=16; d.ring=0; d.anchorx=d.x; d.anchorz=d.z; }
        else if(mv.kind==='shield'){ shieldUp(ph); d.state='idle'; d.timer=50; }
        else if(false){ for(let i=0;i<3;i++){ const ax=2+Math.random()*(W-4)+0.5, az=2+Math.random()*(H-5)+0.5;
            const a=COMBAT.add({x:ax,z:az,hp:14+ph*6,level:20,speed:(1.3+ph*0.2)*PX,dmg:28+ph*8}); a.g.traverse(m=>{ if(m.isMesh&&m.material&&m.material.color) m.material=new THREE.MeshPhongMaterial({color:0x6a1a4a,flatShading:true}); }); }
          UI.toast(`🛡️ ${who==='pretender'?'The Pretender':'Abaddon'} shields himself! Destroy his summoned shades to break it!`,2400); d.state='idle'; d.timer=50; }
        else { d.state='idle'; d.timer=46; } } }
    else if(d.state==='charge'){ d.x+=d.chx; d.z+=d.chz; d.timer--;
      if(d.x<1.5){ d.x=1.5; d.chx*=-1; } if(d.x>W-1.5){ d.x=W-1.5; d.chx*=-1; } if(d.z<1.5){ d.z=1.5; d.chz*=-1; } if(d.z>H-1.5){ d.z=H-1.5; d.chz*=-1; }
      if(Math.hypot(p.x-d.x,p.z-d.z)<0.85) hurt(46+ph*12);
      if(d.timer<=0){ d.state='idle'; d.timer=38; d.anchorx=(W/2|0)+0.5; d.anchorz=2.0; } }
    else if(d.state==='slam'){ d.timer--; if(d.timer<=0&&d.ring===0){ d.ring=1; d.ringR=0; }
      if(d.ring){ d.ringR+=(d.move.ringSpeed||5)*PX; const rd=Math.hypot(p.x-d.anchorx,p.z-d.anchorz); if(Math.abs(rd-d.ringR)<0.55) hurt(40+ph*12);
        if(d.ringR>(d.move.ringMax||150)*PX){ d.ring=0; d.state='idle'; d.timer=40; } } }
    if(Math.hypot(dx,dz)<0.8) hurt(36+ph*10);
    d.face=Math.atan2(dx,dz); }

  function shieldUp(ph){ b.shield=true; for(let i=0;i<3;i++){ const ax=2+Math.random()*(W-4)+0.5, az=2+Math.random()*(H-5)+0.5;
      const a=COMBAT.add({x:ax,z:az,hp:14+ph*6,level:20,speed:(1.3+ph*0.2)*PX,dmg:28+ph*8}); a.g.traverse(m=>{ if(m.isMesh&&m.material&&m.material.color) m.material=new THREE.MeshPhongMaterial({color:0x6a1a4a,flatShading:true}); }); }
    UI.toast(`🛡️ ${who==='pretender'?'The Pretender':'Abaddon'} shields himself! Destroy his summoned shades to break it!`,2400); }
  // what the game checks around the fight each step: phase turns, the shadow margin, the chasms, the shield
  function tick(){ if(foeD){ bossL.position.set(foeD.x,5.2,foeD.z+2.6); bossL2.position.set(foeD.x,4,foeD.z-2.8); if(!foeD.alive||(b&&b.victory)){ bossL.intensity*=0.97; bossL2.intensity*=0.97; } }
    if(!b||!foeD||!foeD.alive||b.victory) return; const p=P(), pl=COMBAT.pl;
    const ph=phaseFor(); if(ph>b.phase){ b.phase=ph; foeD.state='idle'; foeD.timer=70; b.shield=false; lv.combat.shots.forEach(s=>s.life=0); breakFloor(ph); setModel(ph);
      foeD.name=`${TAG()} — ${C.phases[ph].name}`; ENGINE.speak(NAME(),[C.phases[ph].name,strip(C.phases[ph].taunt)]); }
    const target=b.phase===0?0:b.phase===1?2.2:4; b.shrink+=(target-b.shrink)*0.01;
    if(b.shrink>0.3&&pl.iframes<=0){ const m=b.shrink, x=p.x-0.5, z=p.z-0.5; if(x<m||z<m||x>W-m-1||z>H-m-1) hurt(30+b.phase*10); }
    const tx=Math.floor(p.x), ty=Math.floor(p.z);
    if(pl.iframes<=0&&g[ty]&&g[ty][tx]===CH){ hurt(26+b.phase*8); let best=null, bd=1e9;
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(!solid(x,y)) continue; const dd=Math.hypot(x-tx,y-ty); if(dd<bd&&dd>0){ bd=dd; best=[x,y]; } }
      if(best){ p.x=best[0]+0.5; p.z=best[1]+0.5; } UI.toast('🕳 The floor is not there any more.',1400); }
    if(b.shield&&!lv.combat.adds.some(a=>a.alive)){ b.shield=false; UI.toast(`🛡️💥 The shield shatters! Strike ${who==='pretender'?'the Pretender':'Abaddon'} now!`,1800); } }

  // ── the victory beat ──
  function victory(){ const s=S(); b.victory={phase:who==='pretender'?'flee':'death',t:0}; const c=lv.combat, gm=foeD.g;
    c.foes.length=0; c.shots.forEach(q=>q.life=0); c.adds.forEach(a=>a.alive=false); if(!gm.parent) scene.add(gm); gm.position.set(foeD.x,lv.ground(foeD.x,foeD.z),foeD.z); b.shield=false;
    if(who==='pretender'){ pretenderFled(); return; }
    s.abaddonWon=true; s.ownedGear.armor_michael=true; s.skillPoints=(s.skillPoints||0)+5; s.hp=s.maxHp;
    s.barnPets=s.barnPets||[]; if(!(s.pet&&s.pet.id==='unicorn')&&!s.barnPets.some(q=>q&&q.id==='unicorn')) s.barnPets.push({id:'unicorn',form:2});
    GAME.changed(); GAME.save();
    for(let i=0;i<26;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),moteM); m.position.set(foeD.x+(Math.random()-0.5),0.4+Math.random()*1.4,foeD.z+(Math.random()-0.5)); m.userData.vy=0.4+Math.random()*0.9; m.userData.sw=Math.random()*6; scene.add(m); motes.push(m); }
    shaft.position.x=foeD.x; shaft.position.z=foeD.z;
    COMBAT.tint('rgba(255,255,255,0.9)',0.9); setTimeout(()=>COMBAT.tint('rgba(255,255,255,0.9)',0),420); }
  // ── THE PRETENDER: defeat does not slay him — he flees, and his flight tears open the three southern portals; Madison
  //    is seized, and Matthew will run up the moment you're back outside (winAbaddon's pretender branch) ──
  function pretenderFled(){ const s=S(), bs=s.bounties||(s.bounties={active:[],complete:[],nextId:1,perTown:{}});
    Object.assign(bs,{pretenderDefeated:true,portalsOpen:true,madisonTaken:true,matthewIntercept:true});
    const pb=bs.active.find(x=>x.kind==='pretender'); if(pb){ bs.active=bs.active.filter(x=>x!==pb); bs.complete.push({title:'The Pretender King',txt:'👑 driven from the throne'}); if(bs.complete.length>20) bs.complete.shift(); }
    s.hp=s.maxHp; s.skillPoints=(s.skillPoints||0)+3; s.portals=s.portals||{mistral:{unlocked:true,cleared:false},tabor:{unlocked:false,cleared:false},sunfall:{unlocked:false,cleared:false}};
    GAME.changed(); GAME.save(); COMBAT.tint('rgba(40,0,30,0.9)',0.7); }
  lv.anim.push((t,dt)=>{ dt=dt||0.016; emb.forEach((m,i)=>{ m.position.y+=dt*(0.3+(i%5)*0.12); if(m.position.y>5) m.position.y=-4; });
    if(chained) poseChained(Math.min(dt,0.05),t);
    if(!b) return; Object.values(tiles).forEach((m,i)=>m.scale.x=0.9+Math.sin(t*2+i)*0.1);
    if(foeD&&foeD.g.userData.flap) foeD.g.userData.flap(t);
    // the shadow margin
    const m=b.shrink||0, on=m>0.1; strips.forEach(s=>s.visible=on); edge.visible=on;
    if(on){ strips[0].scale.set(W,m,1); strips[0].position.set(W/2,0.03,m/2); strips[1].scale.set(W,m,1); strips[1].position.set(W/2,0.03,H-m/2);
      strips[2].scale.set(m,H-2*m,1); strips[2].position.set(m/2,0.03,H/2); strips[3].scale.set(m,H-2*m,1); strips[3].position.set(W-m/2,0.03,H/2);
      const a=lineG.attributes.position.array, pts=[[m,m],[W-m,m],[W-m,H-m],[m,H-m],[m,m]]; pts.forEach(([x,z],i)=>{ a[i*3]=x; a[i*3+1]=0.05; a[i*3+2]=z; }); lineG.attributes.position.needsUpdate=true; }
    const v=b.victory; if(!v) return; v.t+=dt*1000;
    if(v.phase==='flee'){ const k=Math.min(1,v.t/2200), gm=foeD.g; gm.position.y=-k*0.4; gm.scale.setScalar(Math.max(0.05,(1.05+b.phase*0.08)*(1-k*0.95))); gm.rotation.y+=dt*k*8;
      if(v.t>=2200&&!v.done){ v.done=true; scene.remove(gm); COMBAT.tint('rgba(40,0,30,0.9)',0); ENGINE.go(spec.exit.level,spec.exit.spawn);
        setTimeout(()=>ENGINE.speak('⚔️ THE PRETENDER IS CAST DOWN!',['Abaddon’s stolen throne stands empty once more — but the usurper has fled the world itself, and taken the princess with him.',
          '🌀 He does not flee alone. As shadow swallows him, the pretender flees to Stormgate — and when the dark lifts from King Karl’s keep, Princess Madison is gone with him. “To a world where you cannot follow!” Three portals tear open above the southern islands. The chase is on.']),500); }
      return; }
    if(v.phase==='death'){ const k=Math.min(1,v.t/2600);
      if(foeD.g.parent){ foeD.g.position.y=-k*1.2; foeD.g.scale.setScalar((1+b.phase*0.14)*Math.max(0.05,1-k)); if(k>=1) scene.remove(foeD.g); }
      motes.forEach(o=>{ o.position.y+=o.userData.vy*dt*1.4; o.position.x+=Math.sin(o.position.y*3+o.userData.sw)*0.01; }); moteM.opacity=Math.max(0,1-k);
      shaft.material.opacity=0.18*Math.min(1,v.t/1100);
      const c=chained; if(c){ if(v.t>=900) breakChains(); if(c.broke){ const q=Math.min(1,(v.t-900)/1500); c.mats.forEach(o=>o.m.color.lerpColors(new THREE.Color(o.c).lerp(_grey,0.5),o.c,q*0.8)); c.look=q; c.linkM.emissive.multiplyScalar(0.97); if(c.linkM.emissive.r<0.07) c.linkM.emissive.setHex(0x101014); } }
      if(v.t>=2600){ v.phase='rise'; v.t=0; motes.forEach(o=>scene.remove(o)); motes.length=0; } }
    else if(v.phase==='rise'){ const c=chained; if(!c||v.t>1300){ v.phase='father'; v.t=0; if(c){ const p=P(), dx=c.x-p.x, dz=c.z-p.z, d=Math.hypot(dx,dz)||1; v.tx=p.x+dx/d*1.1; v.tz=p.z+dz/d*1.1; } } else if(v.t>700) c.state='idle'; }
    else if(v.phase==='father'){ const c=chained; shaft.material.opacity=Math.max(0,shaft.material.opacity-dt*0.05);
      const talk=()=>{ if(v.spoke) return; v.spoke=true; if(c){ c.state='idle'; c.g.rotation.y=Math.atan2(P().x-c.x,P().z-c.z); P().face=Math.atan2(c.x-P().x,c.z-P().z); }
        ENGINE.speak('Sir Aldric',F.aldric.map(l=>strip(l.text)),null,()=>{ v.phase='done'; ceremony(); }); };
      if(!c){ talk(); return; }
      const dx=v.tx-c.x, dz=v.tz-c.z, d=Math.hypot(dx,dz);
      if(d>0.08&&!v.spoke){ c.state='walk'; const s=Math.min(d,dt*1.5); c.x+=dx/d*s; c.z+=dz/d*s; c.g.position.set(c.x,Math.max(0,lv.ground(c.x,c.z)),c.z); c.g.rotation.y=Math.atan2(dx,dz); }
      else talk(); } });

  // ── King Karl's grant, in the keep ──
  function ceremony(){ const keep=ENGINE.get(spec.keep); if(!keep) return;
    const banner=keep.banner; keep.banner=null; ENGINE.go(spec.keep,null); setTimeout(()=>keep.banner=banner,900);
    setTimeout(()=>{ const P0=P(), father=addPerson(keep,keep.scene,'knight',P0.x-1,P0.z+0.4,0,'Sir Aldric',[],{her:{main:'#ece8dc',trim:'#e8b93a'},rest:Math.PI}); father.still=true; father.mute=true;
      let walking=true; const top=9.2;
      const step=(t,dt)=>{ if(!walking) return; const p=P(); if(p.z>top){ p.z-=dt*3.0; p.face=Math.PI; father.z=p.z+0.6; father.x+=(p.x-1-father.x)*0.1; father.g.position.set(father.x,0,father.z); ENGINE.K.animate(dt,'walk',0.8); }
        else { walking=false; const kl=F.king.filter(l=>l.speaker==='King Karl').map(l=>strip(l.text)), al=F.king.filter(l=>l.speaker!=='King Karl').map(l=>strip(l.text));
          ENGINE.speak('King Karl',kl,null,()=>ENGINE.speak('Sir Aldric',al,null,()=>{ const i=keep.anim.indexOf(step); if(i>=0) keep.anim.splice(i,1); keep.scene.remove(father.g); keep.folk.splice(keep.folk.indexOf(father),1);
            ENGINE.go(spec.afterKeep.level,spec.afterKeep.spawn);
            setTimeout(()=>ENGINE.speak('King Karl',['One thing more, before you go.','Your father has ridden on ahead of you, down the old lane to the homestead gate. Fifteen years it has stood barred against the dark — he would open it with his own hands.','Go home, knight. Your mother has waited and prayed long enough.']),500); })); } };
      keep.anim.push(step); },450); }

  function enter(){ const s=S();
    if(s.chapels<10){ ENGINE.speak('Abaddon’s Throne',[`🔒 The throne is sealed by dark power. Cleanse all 10 towns and free every general first. (${s.chapels}/10 done)`]); return; }
    const bs=s.bounties||{}; who=(s.abaddonWon&&bs.pretenderUnlocked&&!bs.pretenderDefeated)?'pretender':'abaddon'; C=who==='pretender'?F.pretender:F.cfg; lv.name=who==='pretender'?'The Usurped Throne':'Abaddon’s Throne';
    if(s.abaddonWon&&who==='abaddon'){ ENGINE.speak(bs.pretenderDefeated?'🕊 The Redeemed Throne':'Abaddon’s Throne',[bs.pretenderDefeated?'The hall is quiet and full of light. The tourney marshals keep the lists at the door.':'Abaddon’s throne stands empty. The hall is cold and silent. Whatever ruled here is gone — for now.']); return; }
    g=F.grid.map(r=>r.slice()); b={phase:0,shrink:0,intro:160,shield:false,victory:null}; buildHall();
    strips.forEach(s=>s.visible=false); edge.visible=false; shaft.material.opacity=0; hemi.color.setHex(who==='pretender'?0xa8786a:0x8a6aa8);
    if(aldric){ scene.remove(aldric.g); lv.folk.length=0; aldric=null; }
    lv.cine=null; if(who==='abaddon') chainAldric(); else unchain();
    ENGINE.go(spec.id,lv.spawn);
    setTimeout(()=>{ COMBAT.clear(lv); s.hp=s.maxHp; ENGINE.hud();
      foeD=COMBAT.foe(lv,{x:(W/2|0)+0.5,z:2.0,hp:C.maxHp,level:0,xp:0,boss:true,noEnrage:true,name:`${TAG()} — ${C.phases[0].name}`,model:model(0)});
      if(NEW()){ foeD.bossForm=KEY(); foeD.level=45; foeD.pat={moves:[]}; foeD.held=(d,dist)=>{ if(!b||b.victory) return true; if(b.intro>0){ b.intro--; d.face=Math.atan2(P().x-d.x,P().z-d.z); return true; } return false; }; }   /* V180: the remastered fight (bossfight.js) */
      else foeD.ai=ai;
      foeD.state='idle'; foeD.timer=110; foeD.moveIdx=0; foeD.anchorx=foeD.x; foeD.anchorz=foeD.z; foeD.guardUntil=0; foeD.bar.visible=false;
      if(who==='abaddon'&&chained){ introBeat(); return; }
      ENGINE.speak(NAME(),[strip(C.phases[0].taunt),who==='pretender'?'He is stronger than the dark he stole. Read his attacks; dodge with a double-tap of Guard.':'Read his attacks. Dodge with a double-tap of Guard. End the darkness.']); },420); }
  ENGINE.add(lv);
  return { enter, level:lv };
}
