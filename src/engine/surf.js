// ════════════════════════════════════════════════════════════════
//  SALTMERE POINT — the surf (V265, our own code). Replaces the old side-on Knight's Wave.
//  A set of D.surfWaves waves peels left-to-right along the point. Each wave:
//   LINEUP  the swell rises behind you — tap RIDE to paddle; catch it with enough paddle speed.
//   POP UP  a ring closes on the board — tap RIDE in the green to stand (a clean pop keeps your speed).
//   RIDE    the stick points where the board goes: up the face, down to the trough, along the line.
//           Speed comes from dropping down the face and from staying near the curl; climbing costs it.
//           Turns score by themselves — bottom turn, snap off the lip, cutback toward the curl.
//           Hit the lip fast going up → AIR: tap RIDE to spin (180° a tap), hold STALL to grab; land
//           facing down the line or you wipe out. On a hollow wave hold STALL to sit back into the
//           barrel — points pile up while you're covered, paid only when you come out.
//           Chained tricks build a combo (×1 … ×5), banked after a breath without tricks or when the
//           wave ends; a wipeout loses the combo still in hand. Fall behind the curl and the whitewater
//           takes you.
//  Scoring and rewards are the old surf's: D.surfTiers, D.surfTricks, GAME.S.surfBest.
//  The wave lives in the curl's frame: x′ = along the wave (curl at 0, shoulder +x), z = shoreward of the
//  crest (face 0…F), y up. Everything is drawn in that frame; the sea's texture scrolls to sell the motion.
//  surfWave({D, S, world, from}) → level
// ════════════════════════════════════════════════════════════════
function surfWave(o){
  const D=o.D, S=o.S, TR=D.surfTricks, TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const angD=a=>{ while(a>Math.PI) a-=TAU; while(a<-Math.PI) a+=TAU; return a; };
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x86c4ea); scene.fog=new THREE.Fog(0xa8d4ee,70,190);
  scene.add(new THREE.HemisphereLight(0xeaf6ff,0x1a4a6a,0.75)); const sunL=new THREE.DirectionalLight(0xfff0d8,0.85); sunL.position.set(-30,40,40); scene.add(sunL);
  // the sky: a gradient dome, a sun, and Saltmere's headland on the horizon
  { const g=new THREE.SphereGeometry(400,24,12), c=[], col=new THREE.Color(), pa=g.attributes.position;
    for(let i=0;i<pa.count;i++){ const f=clamp(pa.getY(i)/260,0,1); col.set(0xcfe6f4).lerp(new THREE.Color(0x3a86c8),Math.pow(f,0.7)); c.push(col.r,col.g,col.b); }
    g.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); scene.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false}))); }
  const sky=new THREE.Group(); scene.add(sky);
  { const sun=new THREE.Mesh(new THREE.CircleGeometry(9,24),new THREE.MeshBasicMaterial({color:0xfff4d0,fog:false})); sun.position.set(-90,70,-300); sun.lookAt(0,0,0); sky.add(sun);
    const cliff=new THREE.MeshLambertMaterial({color:0x5a6a52,fog:false}), rock=new THREE.MeshLambertMaterial({color:0x7a746a,fog:false}), cap=new THREE.MeshLambertMaterial({color:0x4a7a40,fog:false});
    [[-190,-330,46,16],[-120,-360,30,10],[170,-330,52,18],[110,-370,26,9],[250,-300,40,22]].forEach(([x,z,w,h],i)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(w*0.6,w,h,7),i%2?rock:cliff); m.position.set(x,h/2-1,z); sky.add(m);
      const t=new THREE.Mesh(new THREE.CylinderGeometry(w*0.62,w*0.6,2.5,7),cap); t.position.set(x,h+0.2,z); sky.add(t); });
    // a lighthouse on the far point
    const lh=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.4,16,10),new THREE.MeshLambertMaterial({color:0xf0ece0,fog:false})); lh.position.set(170,26,-330); sky.add(lh);
    const top=new THREE.Mesh(new THREE.ConeGeometry(2.6,4,10),new THREE.MeshLambertMaterial({color:0xb83a2a,fog:false})); top.position.set(170,36,-330); sky.add(top); }
  // the water's ripple texture (self-made noise), scrolled each frame
  const rip=(()=>{ const N=256, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'); g.fillStyle='#d8eef8'; g.fillRect(0,0,N,N);
    let h=1234567; const r=()=>((h=(h*1103515245+12345)>>>0)/4294967296);
    for(let i=0;i<900;i++){ const x=r()*N, y=r()*N, w=6+r()*26; g.strokeStyle=`rgba(${r()<0.5?'255,255,255':'120,170,200'},${0.25+r()*0.35})`; g.lineWidth=1+r()*1.5; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+w/2,y-2-r()*3,x+w,y); g.stroke();
      [[x-N,y],[x+N,y],[x,y-N],[x,y+N]].forEach(([a,b])=>{ g.beginPath(); g.moveTo(a,b); g.quadraticCurveTo(a+w/2,b-3,a+w,b); g.stroke(); }); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; })();

  // ── the wave's shape, in the curl's frame ──
  const NX=120, NZ=64, X0=-40, X1=90, Z0=-34, Z1=26;
  let W={A0:3.2,F:6.5,hollow:true,peel:7,life:0,dur:22,close:0};    // per-wave, set in newWave()
  const Ax=x=>{ const A=W.A0*clamp((x-X0)/18,0,1)*clamp((X1-x)/30,0,1); return x>=0?A*(0.32+0.68*Math.exp(-x/24)):A*(0.42+0.58*Math.exp(x/2.2)); };   // tallest at the curl, tapering down the shoulder; broken behind
  const faceP=z=>z>=0?(z<W.F?Math.pow(1-z/W.F,1.6):0):Math.exp(-(z/7)*(z/7));
  const hAt=(x,z)=>Ax(x)*faceP(z);
  const zOf=s=>W.F*(1-s);                                                            // s: 0 = trough, 1 = lip
  // one mesh for the whole swell: rows across the wave, columns along it
  const wgeo=new THREE.PlaneGeometry(1,1,NX,NZ); wgeo.rotateX(-Math.PI/2);
  const wcol=new Float32Array((NX+1)*(NZ+1)*3); wgeo.setAttribute('color',new THREE.BufferAttribute(wcol,3));
  { const uv=wgeo.attributes.uv, pa=wgeo.attributes.position; for(let i=0;i<pa.count;i++){ uv.setXY(i,0,0); } }
  const wmat=new THREE.MeshPhongMaterial({vertexColors:true,map:rip,shininess:40,specular:0x2a4a60,side:THREE.DoubleSide});
  const wave=new THREE.Mesh(wgeo,wmat); wave.frustumCulled=false; scene.add(wave);
  const flats=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshPhongMaterial({color:0x1f78a8,map:rip,shininess:30,specular:0x223a4a})); flats.rotation.x=-Math.PI/2; flats.position.y=-0.22; scene.add(flats);
  rip.repeat.set(1,1); const flatTex=rip.clone(); flatTex.needsUpdate=true; flatTex.repeat.set(70,70); flats.material.map=flatTex;
  const cDeep=new THREE.Color(0x0e4a78), cFace=new THREE.Color(0x1d80aa), cLip=new THREE.Color(0x48b8c4), cFoam=new THREE.Color(0xf2f8fb), cBack=new THREE.Color(0x1a6a98);
  const CT=new THREE.Color();
  function shapeWave(t){ const pa=wgeo.attributes.position, uv=wgeo.attributes.uv; let k=0;
    for(let j=0;j<=NZ;j++){ const z=Z0+(Z1-Z0)*j/NZ; for(let i=0;i<=NX;i++,k++){ const x=X0+(X1-X0)*i/NX;
      let y=hAt(x,z); const broken=x<0?clamp(-x/3,0,1):0;
      if(broken>0&&z>-3&&z<W.F+10){ const foam=Math.exp(-Math.pow((z-W.F*0.5)/(W.F*0.9),2)); y+=foam*broken*(0.35*Math.sin(x*1.7+t*5+z)+0.3*Math.sin(z*2.1-t*4)+0.2); }
      y+=0.06*Math.sin(x*0.7+t*1.3)+0.05*Math.sin(z*0.9-t*1.7);
      pa.setXYZ(k,x,y,z); uv.setXY(k,(x+t*W.peel*0.5)/16,(z-t*2.5)/16);
      const hh=y/Math.max(0.5,W.A0), up=z>=0&&z<W.F?1-z/W.F:0, c=CT;
      if(z<0) c.copy(cBack).lerp(cDeep,clamp(-z/18,0,1)); else c.copy(cDeep).lerp(cFace,clamp(hh*1.4,0,1)).lerp(cLip,clamp((up-0.75)*3,0,1)*clamp(hh,0,1));
      const fz=broken*Math.exp(-Math.pow((z-W.F*0.45)/(W.F*0.9+2),2)); const lipFoam=x>=0&&x<5&&Math.abs(z)<0.8?(1-x/5)*0.8:0; c.lerp(cFoam,clamp(Math.max(fz,lipFoam),0,1));
      wcol[k*3]=c.r; wcol[k*3+1]=c.g; wcol[k*3+2]=c.b; } }
    pa.needsUpdate=true; uv.needsUpdate=true; wgeo.attributes.color.needsUpdate=true; wgeo.computeVertexNormals(); }
  // the lip, pitching over the face when the wave is hollow: a curl surface from x′ = -9 … +3
  const LU=36, LV=14, lgeo=new THREE.PlaneGeometry(1,1,LU,LV), lcol=new Float32Array((LU+1)*(LV+1)*3); lgeo.setAttribute('color',new THREE.BufferAttribute(lcol,3));
  const lip=new THREE.Mesh(lgeo,new THREE.MeshPhongMaterial({vertexColors:true,map:rip,shininess:40,specular:0x2a4a60,side:THREE.DoubleSide,transparent:true,opacity:0.9,depthWrite:false})); lip.frustumCulled=false; scene.add(lip);
  const lipR=x=>{ const k=clamp((3-x)/3.2,0,1); return k*W.F*0.52; };                 // how far the lip has thrown out, by x′
  function shapeLip(t,open){ const pa=lgeo.attributes.position, uv=lgeo.attributes.uv; let k=0;
    for(let j=0;j<=LV;j++){ const v=j/LV; for(let i=0;i<=LU;i++,k++){ const x=-9+12*i/LU, R=lipR(x)*open, A=Ax(Math.max(0,x))*1.02, a=v*Math.PI*1.05;
      // up from the crest, over and down toward the face: a circle of radius R/2 hung from the crest, forward
      const cz=R*0.5, cy=A-0.05+R*0.02, z=cz-Math.cos(a)*R*0.5, y=cy+Math.sin(a)*R*0.62-(a>Math.PI/2?(a-Math.PI/2)*R*0.25:0);
      const wob=0.06*Math.sin(x*2.3+t*7+v*4); pa.setXYZ(k,x,y+wob,z); uv.setXY(k,(x+t*3)/10,(v*5-t*3)/10);
      const c=cFace.clone().lerp(cLip,0.4+0.4*v).lerp(cFoam,v>0.82?(v-0.82)*5:x<-6?(-6-x)/3:0); lcol[k*3]=c.r; lcol[k*3+1]=c.g; lcol[k*3+2]=c.b; } }
    pa.needsUpdate=true; uv.needsUpdate=true; lgeo.attributes.color.needsUpdate=true; lgeo.computeVertexNormals(); lip.visible=open>0.05; }
  // spray and foam: one pool of little white sprites
  const sprayTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'), gr=g.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.5,'rgba(240,250,255,.6)'); gr.addColorStop(1,'rgba(240,250,255,0)'); g.fillStyle=gr; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })();
  const POOL=[]; for(let i=0;i<160;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:sprayTex,transparent:true,depthWrite:false,opacity:0})); sp.visible=false; scene.add(sp); POOL.push({sp,life:0,v:new THREE.Vector3()}); }
  let poolI=0; function puff(x,y,z,vx,vy,vz,size,life){ const p=POOL[poolI=(poolI+1)%POOL.length]; p.sp.position.set(x,y,z); p.v.set(vx,vy,vz); p.life=p.max=life||0.8; p.size=size||0.5; p.sp.visible=true; }
  function puffs(dt){ POOL.forEach(p=>{ if(p.life<=0) return; p.life-=dt; p.sp.position.addScaledVector(p.v,dt); p.v.y-=6*dt; p.v.multiplyScalar(1-dt*1.2); const f=Math.max(0,p.life/p.max); p.sp.material.opacity=f*0.85; p.sp.scale.setScalar(p.size*(1.6-f*0.6)); if(p.life<=0) p.sp.visible=false; }); }

  // ── the rider ──
  const rider=new THREE.Group(); scene.add(rider); const tilt=new THREE.Group(); rider.add(tilt);
  const boardG=new THREE.Group(); tilt.add(boardG);
  { const sh=new THREE.Shape(); sh.moveTo(-0.95,0); sh.bezierCurveTo(-0.95,0.2,-0.4,0.27,0.1,0.27); sh.bezierCurveTo(0.7,0.27,1.0,0.12,1.05,0); sh.bezierCurveTo(1.0,-0.12,0.7,-0.27,0.1,-0.27); sh.bezierCurveTo(-0.4,-0.27,-0.95,-0.2,-0.95,0);
    const g=new THREE.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.02,bevelSegments:2,curveSegments:12}); g.rotateX(Math.PI/2); g.translate(0,0.05,0);
    const bm=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0xf2e6c8,shininess:90})); boardG.add(bm);
    const str=new THREE.Mesh(new THREE.BoxGeometry(1.95,0.012,0.04),new THREE.MeshLambertMaterial({color:0x8a5f22})); str.position.y=0.075; boardG.add(str);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.012,0.5),new THREE.MeshLambertMaterial({color:0x2a5ab8})); stripe.position.set(0.55,0.076,0); boardG.add(stripe);
    const fin=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.14,0.02),new THREE.MeshLambertMaterial({color:0x2a5ab8})); fin.position.set(-0.8,-0.04,0); boardG.add(fin); }
  const pose=new THREE.Group(); tilt.add(pose); const kn=COMBAT.knightModel(); kn.scale.setScalar(0.6); pose.add(kn); kn.position.set(-0.05,0.08,0);

  // ── state ──
  const hud=$('hudMg'), callEl=$('call'); let callT=0, g=null;
  function call(txt,col){ callEl.textContent=txt; callEl.style.color=col||'#f4f8ff'; callEl.style.opacity=1; callT=1.2; }
  function newWave(){ const n=g.wavesRidden; W={A0:2.7+Math.random()*1.0+n*0.12,F:6.2+Math.random()*1.2,hollow:Math.random()<0.6||n===D.surfWaves-1,peel:6.5+Math.random()*1.5,life:0,dur:19+Math.random()*7,close:0}; }
  function lineup(){ newWave(); Object.assign(g,{phase:'lineup',swell:0,paddle:0,popT:0,popRing:0,pop:null,
    x:6,s:0,th:0,v:0,air:null,stall:false,tube:0,tubeBank:0,combo:[],comboT:0,lastTh:0,turn:{bottom:false,top:false,back:false},speedPts:0,wipe:0,fall:null,lipT:0}); }
  const mult=()=>Math.min(5,1+Math.floor(g.combo.length/2));
  const pending=()=>Math.round(g.combo.reduce((a,c)=>a+c.pts,0)*mult());
  function trick(name,pts){ g.combo.push({name,pts}); g.comboT=2.6; g.bestTrick=Math.max(g.bestTrick,pts); call(name+' +'+pts+(g.combo.length>1?' ×'+mult():''),'#fff2c8'); }
  function bank(why){ const p=pending(); if(p>0){ g.score+=p; if(why) call(why+' +'+p,'#bff5c4'); } g.combo=[]; g.comboT=0; }
  function wipeout(why){ if(g.phase!=='ride') return; const lost=pending(); g.combo=[]; g.comboT=0; g.tubeBank=0; g.phase='wipe'; g.wipe=1.6; g.fall={x:g.x,y:riderY(),z:zOf(g.s),vy:2};
    call(why+(lost?' — lost '+lost:''),'#e0563a'); for(let i=0;i<24;i++) puff(g.x,riderY()+0.5,zOf(g.s),(Math.random()-0.5)*4,2+Math.random()*4,(Math.random()-0.5)*4,0.8,1.0); }
  function endWave(clean){ if(clean){ bank('RODE IT OUT'); } g.wavesRidden++; g.phase='fade'; g.fadeT=1.6; }
  function results(){ g.phase='results'; g.tier=D.surfTiers.find(t=>g.score>=t.min); if(!g.awarded){ g.awarded=true; const s=S(); GAME.addGold(g.tier.gold); GAME.gainXp(g.tier.xp); if(g.tier.sp) s.skillPoints+=g.tier.sp; g.newBest=g.score>(s.surfBest||0); if(g.newBest) s.surfBest=g.score; GAME.save(); } }
  function leave(){ const t=g.tier||D.surfTiers[D.surfTiers.length-1]; ENGINE.go('world',o.from()||o.world.spawn); setTimeout(()=>UI.toast(`🏄 ${t.name} — ${g.score} GRACE · +${t.gold}g · +${t.xp} XP${t.sp?` · ⭐ +${t.sp} skill point`:''}${g.newBest?' · NEW BEST!':''}`,3400),450); }
  const riderY=()=>hAt(g.x,zOf(g.s))+0.02;

  // ── the ride's physics ──
  function ride(dt,inp){ W.life+=dt; const A=Ax(g.x)/W.A0, F=W.F;
    // the curl peels on: you hold your place only with speed along the line
    if(g.air){ const a=g.air; a.t+=dt; a.vy-=16*dt; a.y+=a.vy*dt; g.x+=g.v*Math.cos(g.th)*dt-W.peel*dt;
      if(inp.pressed.A){ a.spinT+=Math.PI; } a.spin+=clamp(a.spinT-a.spin,0,dt*Math.PI*3.2); if(inp.held.B) a.grab+=dt;
      const ground=hAt(g.x,zOf(g.s)); if(a.y<=ground&&a.vy<0){ const off=Math.abs(angD(a.spin%TAU)), clean=off<0.6||Math.abs(off-Math.PI)<0.5&&a.spin>=Math.PI-0.1;
        if(a.spinT-a.spin>0.3||!clean){ g.air=null; wipeout('OVER-ROTATED'); return; }
        const turns=Math.round(a.spin/Math.PI), pts=120+turns*90+Math.round(Math.min(1.2,a.grab)*80);
        g.air=null; g.s=0.82; g.th=-0.5; g.v*=0.9; trick((turns?turns*180+' ':'')+TR.air+(a.grab>0.25?' · GRAB':''),pts); trick(TR.land,40); }
      return; }
    // steer: the stick points where you want the nose — right is down the line, up is up the face
    const mag=Math.hypot(inp.x,inp.y); let want=g.th;
    if(mag>0.3) want=Math.atan2(-inp.y,inp.x); else want=g.th+angD(0-g.th)*Math.min(1,dt*0.8);
    const rate=(2.6+1.4*clamp(g.v/12,0,1))*dt, d=clamp(angD(want-g.th),-rate,rate); g.th=angD(g.th+d);
    const turnRate=Math.abs(d)/dt;
    // speed: down the face is free speed, up costs it; near the curl the wave drives you; stalling sheds it
    g.stall=!!inp.held.B; const steep=A*(1.3-0.6*g.s), near=Math.exp(-Math.max(0,g.x)/10);
    g.v+= (-Math.sin(g.th)*9.5*steep + 3.2*near*A - (g.v-4)*0.35 - (g.stall?6:0) - turnRate*0.25*Math.max(0,g.v-6)*0.2)*dt;
    g.v=clamp(g.v,1.5,17);
    g.s+=g.v*Math.sin(g.th)/F*dt; g.x+=(g.v*Math.cos(g.th)-W.peel)*dt;
    if(g.s<0){ g.s=0; if(Math.sin(g.th)<0) g.th*=0.9; g.v-=dt*2; }
    // up through the lip: fast enough and you fly; slow and you stall on the lip
    if(g.s>=1){ if(g.v*Math.sin(g.th)>5.5&&!(W.hollow&&g.x<2)){ g.s=1; g.air={t:0,y:riderY()+0.1,vy:g.v*Math.sin(g.th)*0.9,spin:0,spinT:0,grab:0}; call('AIRBORNE! RIDE spins · STALL grabs','#bfe8ff'); for(let i=0;i<12;i++) puff(g.x,riderY()+0.2,zOf(1),(Math.random()-0.5)*2,3+Math.random()*3,1+Math.random()*2,0.6,0.9); return; }
      g.s=1; g.th=Math.min(g.th,0.2); g.v-=dt*4; g.lipT+=dt; if(g.lipT>0.9){ g.lipT=0; call(TR.missLip,'#cfe0ff'); } }
    else g.lipT=0;
    // turns score themselves
    const sn=Math.sin(g.th), cs=Math.cos(g.th);
    if(g.s<0.3&&sn<-0.3) g.turn.bottom=true; if(g.turn.bottom&&sn>0.35){ g.turn.bottom=false; if(g.v>6) trick('BOTTOM TURN',30+Math.round(g.v*2)); }
    if(g.s>0.72&&sn>0.3) g.turn.top=true; if(g.turn.top&&sn<-0.25&&g.s>0.6){ g.turn.top=false; trick('SNAP OFF THE LIP',50+Math.round(g.v*5)); for(let i=0;i<14;i++) puff(g.x,riderY()+0.3,zOf(g.s),-cs*2+(Math.random()-0.5)*2,3+Math.random()*3,-2-Math.random()*2,0.55,0.9); }
    if(g.s<0.3&&sn>0) g.turn.top=false;
    if(cs<-0.45&&g.x>2) g.turn.back=true; if(g.turn.back&&cs>0.45){ g.turn.back=false; trick(TR.cutback,90+Math.round(g.v*4)); }
    // spray off the tail on a hard carve
    if(turnRate>1.2&&g.v>6&&Math.random()<turnRate*0.25) puff(g.x-cs*0.8,riderY()+0.2,zOf(g.s)+sn*0.4,-cs*2+(Math.random()-0.5),1.5+Math.random()*2,1+Math.random()*1.5,0.45,0.7);
    // the barrel: covered when the lip is thrown over you
    const open=W.hollow?lipOpen():0, covered=open>0.4&&g.x<1.2&&g.x>-8&&g.s>0.2&&g.s<0.75;
    if(covered){ if(!g.tube){ call('COVERED! — hold your line','#8ef0ff'); } g.tube+=dt; g.tubeBank+=dt*(110+40*Math.max(0,-g.x)); if(Math.random()<0.4) puff(g.x+1,riderY()+1.4,zOf(g.s)-0.6,3+Math.random()*2,(Math.random()-0.5),1,0.4,0.5); }
    else if(g.tube){ if(g.x>=0.8){ const pts=Math.round(g.tubeBank)+60; g.barrelsMade++; trick(TR.barrel+' '+g.tube.toFixed(1)+'s',pts); call('MADE IT OUT! '+TR.barrel,'#8ef0ff'); } g.tube=0; g.tubeBank=0; }
    // the whitewater: fall behind it and you're taken (deep in the barrel it takes you too)
    if(g.x<(covered?-8:-1.6)){ wipeout(covered?'THE BARREL CLOSED ON YOU':'CAUGHT BY THE WHITEWATER'); return; }
    if(g.x>W.peel*7){ g.v-=dt*3; }                                                          // out on the flat shoulder the wave has nothing left
    // a little score for speed in the pocket
    if(g.x>-1&&g.x<7&&g.v>7){ g.speedPts+=dt*14*(g.v/10); if(g.speedPts>=1){ const k=Math.floor(g.speedPts); g.score+=k; g.speedPts-=k; } }
    if(g.comboT>0){ g.comboT-=dt; if(g.comboT<=0) bank(g.combo.length>1?'COMBO ×'+mult():''); }
    if(W.life>W.dur){ endWave(true); }
  }
  const lipOpen=()=>W.hollow?clamp(0.55+0.45*Math.sin(W.life*0.45),0,1):0;

  // ── the level ──
  const lv={id:'surf',name:'Saltmere Point',scene,folk:[],spots:[],anim:[],cam:{pitch:0,dist:12},
    custom:{ knight:false, pet:false, buttons:[{id:'B',label:'STALL'},{id:'A',label:'RIDE',big:true}],
      onEnter(){ const s=S(); kn.dress&&kn.dress(s); hud.hidden=false; g={score:0,wavesRidden:0,bestTrick:0,barrelsMade:0,awarded:false,tier:null,newBest:false,t:0}; lineup(); call('🏄 Saltmere Point — a '+D.surfWaves+'-wave set','#fff2c8'); },
      tick(dt,t,inp){ if(!g) return; dt=Math.min(dt,0.05); g.t+=dt; if(callT>0){ callT-=dt; if(callT<=0) callEl.style.opacity=0; }
        if(g.phase==='results'){ g.resT=(g.resT||0)+dt; if(g.resT>1&&(inp.pressed.A||inp.pressed.B)) leave(); draw(dt); return; }
        if(g.phase==='lineup'){ g.swell+=dt/3.4; if(inp.pressed.A){ g.paddle=Math.min(1,g.paddle+0.16); } g.paddle=Math.max(0,g.paddle-dt*0.22);
          if(inp.pressed.B&&g.swell<0.25){ results(); draw(dt); return; }
          if(g.swell>=1){ if(g.paddle>=0.5){ g.phase='pop'; g.popT=0; call('POP UP!','#fff2c8'); } else { call('THE WAVE ROLLED UNDER YOU','#e0563a'); g.wavesRidden++; g.phase='fade'; g.fadeT=1.2; } } }
        else if(g.phase==='pop'){ g.popT+=dt; const r=1-g.popT/1.1; g.popRing=r;
          if(inp.pressed.A||r<=-0.15){ const e=Math.abs(r-0.18), q=r<=-0.15?0:e<0.1?2:e<0.24?1:0;
            g.phase='ride'; g.x=4.5; g.s=0.95; g.th=-1.15; g.v=q===2?9:q===1?7:4.5; if(q) trick(TR.drop,q===2?80:40); else call('A WOBBLY DROP','#f0a050'); } }
        else if(g.phase==='ride') ride(dt,inp);
        else if(g.phase==='wipe'){ g.wipe-=dt; const f=g.fall; f.vy-=10*dt; f.y+=f.vy*dt; W.life+=dt; if(g.wipe<=0){ g.wavesRidden++; g.phase='fade'; g.fadeT=0.8; } }
        else if(g.phase==='fade'){ g.fadeT-=dt; if(g.fadeT<=0){ if(g.wavesRidden>=D.surfWaves) results(); else lineup(); } }
        draw(dt); },
      camera(cam,dt){ if(!g) return; const k=Math.min(1,dt*3.5); let px,py,pz,lx,ly,lz;
        if(g.phase==='lineup'||g.phase==='pop'||g.phase==='results'){ const sw=g.phase==='results'?0.5:clamp(g.swell,0,1); px=-3; py=2.6+sw*1.2; pz=W.F+12; lx=4; ly=1.2+sw*1.5; lz=0; }
        else { const rx=g.phase==='wipe'&&g.fall?g.fall.x:g.x, rz=zOf(g.s), ry=hAt(rx,rz); px=rx-7.5; py=ry*0.55+2.6; pz=W.F+8.5; lx=rx+4.5; ly=ry*0.6+0.8; lz=rz-1.5; }
        camP.set(px,py,pz); cam.position.lerp(camP,k); camL.lerp(camT.set(lx,ly,lz),k); cam.lookAt(camL); sky.position.set(cam.position.x,0,cam.position.z*0.2); } } };
  const camP=new THREE.Vector3(), camL=new THREE.Vector3(0,1,0), camT=new THREE.Vector3();
  const qB=new THREE.Quaternion(), M4=new THREE.Matrix4(), vF=new THREE.Vector3(), vU=new THREE.Vector3(), vR=new THREE.Vector3();
  function surfNormal(x,z,out){ const e=0.15; out.set(-(hAt(x+e,z)-hAt(x-e,z))/(2*e),1,-(hAt(x,z+e)-hAt(x,z-e))/(2*e)).normalize(); return out; }
  function draw(dt){ const t=g.t;
    // between waves the swell builds; out on the ride the wave stands full
    const grow=g.phase==='lineup'?0.35+0.65*clamp(g.swell,0,1):g.phase==='fade'?Math.max(0.35,g.fadeT/1.6):g.phase==='results'?0.35:1;
    const A0=W.A0; W.A0=A0*grow; shapeWave(t); shapeLip(t,(g.phase==='ride'||g.phase==='wipe')?lipOpen():0); W.A0=A0;
    flatTex.offset.set(t*W.peel*0.5/12.9,t*2.5/12.9);
    puffs(dt);
    // whitewater spray along the broken section, and the curl's feathering lip
    if(g.phase==='ride'||g.phase==='wipe'){ if(Math.random()<0.9) puff(-1-Math.random()*8,Ax(0)*0.7+Math.random()*0.8,W.F*(0.2+Math.random()*0.6),(Math.random()-0.5)*2,1+Math.random()*2,1.5+Math.random()*2,0.9+Math.random()*0.6,0.9);
      if(Math.random()<0.6) puff(Math.random()*4,Ax(0)*1.02,0.2,(Math.random()-0.5),1.5,-1.2,0.45,0.6); }
    // the rider
    if(g.phase==='ride'){ const z=zOf(g.s); let y=riderY(); if(g.air) y=g.air.y;
      rider.position.set(g.x,y,z); surfNormal(g.x,z,vU); if(g.air) vU.set(0,1,0);
      vF.set(Math.cos(g.th),0,-Math.sin(g.th)); vF.addScaledVector(vU,-vF.dot(vU)).normalize(); vR.crossVectors(vF,vU).normalize();
      M4.makeBasis(vF,vU,vR); qB.setFromRotationMatrix(M4); rider.quaternion.slerp(qB,Math.min(1,dt*10));
      const spin=g.air?g.air.spin:0, lean=g.air?0:clamp(angD(g.th-g.lastTh)/Math.max(dt,1e-3)*0.08,-0.5,0.5); g.lastTh=g.th;
      tilt.rotation.set(-lean,spin,0); pose.rotation.set(0,0,0); kn.rotation.set(0,0,0); kn.position.x=-0.05; kn.position.y=0.08-(g.stall||g.tube?0.12:0)-(g.air&&g.air.grab>0?0.1:0); kn.animate(dt,'idle',0); rider.visible=true; }
    else if(g.phase==='wipe'&&g.fall){ rider.position.set(g.fall.x-=W.peel*dt*0.2,Math.max(hAt(g.fall.x,g.fall.z)-0.4,g.fall.y),g.fall.z+=dt*2); tilt.rotation.z+=dt*6; tilt.rotation.x+=dt*3; kn.animate(dt,'idle',0); }
    else { // lying on the board, paddling in ahead of the swell
      const z=W.F*0.6, x=6; rider.position.set(x,hAt(x,z)+0.02,z); rider.quaternion.setFromAxisAngle(vU.set(0,1,0),-Math.PI*0.5); tilt.rotation.set(0,0,0);
      pose.rotation.set(0,Math.PI/2,0); kn.rotation.set(Math.PI/2-0.12,0,0); kn.position.set(0,0.14,-0.35); kn.animate(dt,g.phase==='lineup'&&g.paddle>0.05?'walk':'idle',0.6);
      if(g.phase==='pop'){ const k=clamp(g.popT/0.6,0,1); pose.rotation.set(0,Math.PI/2*(1-k),0); kn.rotation.set((Math.PI/2-0.12)*(1-k),0,0); kn.position.set(0,0.08+0.06*(1-k),-0.35*(1-k)); } }
    if(g.phase!=='ride'&&g.phase!=='wipe'){ tilt.rotation.set(0,0,0); }
    // the HUD
    const P=pending(), wv=Math.min(D.surfWaves,g.wavesRidden+(g.phase==='results'?0:1));
    let tip='';
    if(g.phase==='lineup') tip=`<b>PADDLE!</b> tap RIDE — <span class="meter" style="display:inline-block;width:110px;height:8px;vertical-align:middle"><i style="left:0;width:${Math.round(g.paddle*100)}%;background:${g.paddle>=0.5?'#5fd36a':'#f2c14e'}"></i><i style="left:50%;width:2px;background:#fff"></i></span> ${g.swell<0.25?'· STALL now ends the set':''}`;
    else if(g.phase==='pop'){ const r=Math.max(0,g.popRing); tip=`<b>POP UP</b> — tap RIDE as the ring hits the green <span class="meter" style="display:inline-block;width:120px;height:10px;vertical-align:middle"><i style="left:0;width:42%;background:#2f7a3a"></i><i style="left:8%;width:20%;background:#bff5c4"></i><i style="left:calc(${(r*100).toFixed(0)}% - 2px);width:4px;background:#f2c14e"></i></span>`; }
    else if(g.phase==='ride') tip=g.air?'RIDE: spin 180° · hold STALL: grab · land facing the shoulder':g.tube?'<b style="color:#8ef0ff">COVERED</b> — stay low on the face, keep your line, get out the end':'stick: point the board · drop for speed, climb to the lip, snap back · hold STALL to slow into the barrel';
    else if(g.phase==='results') tip=`<b style="color:${g.tier.col}">${g.tier.name}</b> — ${g.tier.line} · +${g.tier.gold}g +${g.tier.xp} XP${g.tier.sp?' ⭐+1':''} · tap to come ashore`;
    hud.innerHTML=`<div class="bars"><div class="bar"><small>🏄 ${g.score} GRACE · WAVE ${wv}/${D.surfWaves}${P?` · <b style="color:#fff2c8">+${P}${g.combo.length>1?' ×'+mult():''}</b>`:''}${g.tube?` · <b style="color:#8ef0ff">BARREL ${g.tube.toFixed(1)}s</b>`:''}</small>`
      +(g.phase==='ride'?`<div class="meter"><i style="left:0;width:${Math.round(clamp(g.v/17,0,1)*100)}%;background:${g.v>11?'#8ef0ff':g.v>6?'#5fd36a':'#e0a040'}"></i></div>`:'')+`</div></div><small style="display:block;margin-top:4px;color:#d8e6f4">${tip}</small>`; }
  lv.spawn={x:0,z:0}; lv.ground=()=>0; lv.onLeave=()=>{ hud.innerHTML=''; callEl.style.opacity=0; };
  lv._dbg=()=>({g,W,ride,hAt,zOf});
  return lv; }
