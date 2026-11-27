// ════════════════════════════════════════════════════════════════
//  THRONE HALL — the walkable Stormgate Keep (KLK's buildKeepGrid + drawThroneHall, quiet mode):
//  17×30, centre column cx; pillars and walls at x≤2 / x≥W-3; throne, dais and back wall at y≤7.
//  throneLevel({id, exit, hall:{W,H,cx}, king:{name,lines}, guardLines:[a,b]}) → level
//  V283: rebuilt Romanesque and warm, cel-shaded like the new villages — honey sandstone in big ashlar blocks, drum
//  pillars with cushion capitals carrying round arches, a clerestory of small round-headed windows of amber glass, an
//  open oak roof of tie-beams, king-posts and arched braces, an iron wheel of candles, torches on the pillars, flagstones
//  and a crimson runner, tapestries behind the throne, the ten village shields on the pillars, and the king's minstrels
//  beside the dais (their music: minstrels.js). All textures are painted here on canvases.
// ════════════════════════════════════════════════════════════════
function throneLevel(spec){
  const W=spec.hall.W, H=spec.hall.H, cx=spec.hall.cx+0.5;
  const WH=7, SP=4.78, NH=9.6, RH=12.6;   // aisle wall plate, the arches' springing, the clerestory top, the ridge
  const gold=0xe8c766, goldD=0xa8842e, red=0x8a2424, iron=0x2c2a2a;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x1c130c); scene.fog=new THREE.Fog(0x1c130c,22,50);
  const lv={id:spec.id,name:'The Throne Hall',scene,folk:[],spots:[],anim:[],interior:true,actorS:0.9,cam:{pitch:0.2,dist:3.4,min:1.8,max:5.5,lookH:0.15},zone:()=>'Stormgate Keep',   // inside the hall, at your shoulder
    banner:'Walk up to the throne to speak with King Karl. Head back down the hall to leave.'};
  scene.add(new THREE.HemisphereLight(0xffdcb0,0x3a2416,0.56));
  const sunIn=new THREE.DirectionalLight(0xffe2b0,0.45); sunIn.position.set(-10,18,12); sunIn.target.position.set(cx,0,H/2); sunIn.castShadow=true; sunIn.shadow.mapSize.set(1536,1536);
  Object.assign(sunIn.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:60}); scene.add(sunIn,sunIn.target);
  const R=group(0,0,0,scene), an=lv.anim;
  const THRONE_SHAFT=new THREE.MeshBasicMaterial({color:0xffe2a8,transparent:true,opacity:0.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  an.push(()=>{ const st=typeof ROOM_DAY!=='undefined'?ROOM_DAY():{night:0}; THRONE_SHAFT.opacity=0.08*(1-st.night); sunIn.intensity=0.45*(1-st.night)+0.06; });   // the day through the windows, gone at night

  // ── materials: cel shading (three bands of light and a warm rim, as VILLAGE3), canvas-painted textures ──
  const SRGB=()=>typeof ENGINE!=='undefined'&&ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding;
  const lin=c=>{ c=new THREE.Color(c); return SRGB()?c.convertSRGBToLinear():c; };
  const RAMP=(()=>{ const d=new Uint8Array([118,118,118,255, 188,188,188,255, 245,245,245,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  const TM={}; function tm(col,map,o){ o=o||{}; const key=col+'|'+(map?map.uuid:'-')+'|'+!!o.ds; if(TM[key]) return TM[key];
    const m=new THREE.MeshToonMaterial({color:lin(col),gradientMap:RAMP,map:map||null,side:o.ds?THREE.DoubleSide:THREE.FrontSide});
    m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n { float r=pow(1.0-clamp(dot(normalize(vViewPosition),normalize(vNormal)),0.0,1.0),3.0); gl_FragColor.rgb+=vec3(1.0,0.86,0.62)*r*0.16; }'); };
    m.customProgramCacheKey=()=>'thtoon'; return TM[key]=m; }
  const canvasTex=(w,h,paint,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; paint(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; if(SRGB()) t.encoding=THREE.sRGBEncoding; if(rep) t.repeat.set(rep[0],rep[1]); return t; };
  let seed=7; const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
  // honey sandstone, coursed ashlar: 4 courses to the tile (1.28 m), blocks of differing length, pale mortar, tooling and speckle
  const ASH=canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#d9c4a0'; x.fillRect(0,0,w,h);
    for(let r=0;r<4;r++){ let px=-(r%2)*50; while(px<w){ const bw=70+rnd()*70, v=0.86+rnd()*0.22; x.fillStyle=`rgb(${Math.min(255,214*v)|0},${Math.min(255,186*v)|0},${Math.min(255,142*v)|0})`; x.fillRect(px+2,r*64+2,bw-4,60);
      for(let k=0;k<60;k++){ x.fillStyle=rnd()<0.5?'rgba(80,50,20,0.08)':'rgba(255,240,210,0.1)'; x.fillRect(px+2+rnd()*(bw-6),r*64+2+rnd()*58,1+rnd()*3,1+rnd()*2); }
      const g=x.createLinearGradient(0,r*64,0,r*64+64); g.addColorStop(0,'rgba(255,240,210,0.12)'); g.addColorStop(1,'rgba(60,35,15,0.14)'); x.fillStyle=g; x.fillRect(px+2,r*64+2,bw-4,60);
      if(px+bw<w+80){ for(let k=0;k<2;k++){ const wx=px+bw-2; } } px+=bw; } }
    x.fillStyle='rgba(120,92,60,0.55)'; for(let r=0;r<=4;r++) x.fillRect(0,r*64-1,w,2); });
  const TS=1.28;   // the ashlar tile's size in metres
  const stoneTex=(sx,sy)=>{ const t=ASH.clone(); t.needsUpdate=true; t.repeat.set(sx,sy); return t; };
  const STONE=tm(0xe2c8a0,ASH), STONED=tm(0xa88c68,ASH), STONEL=tm(0xf0dcbc,ASH);
  // flagstones: big worn slabs in a running bond, warm grey-brown
  const FLAG=canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#5a4a3a'; x.fillRect(0,0,w,h); const rows=[0,90,170,256];
    for(let r=0;r<3;r++){ let px=-(r*37%90); while(px<w){ const bw=80+rnd()*60, v=0.85+rnd()*0.25, y0=rows[r]+2, y1=rows[r+1]-2; x.fillStyle=`rgb(${(150*v)|0},${(132*v)|0},${(110*v)|0})`; x.fillRect(px+2,y0,bw-4,y1-y0);
      for(let k=0;k<90;k++){ x.fillStyle=rnd()<0.5?'rgba(40,30,20,0.1)':'rgba(255,240,220,0.08)'; x.fillRect(px+2+rnd()*(bw-6),y0+rnd()*(y1-y0-2),1+rnd()*4,1+rnd()*2); }
      const g=x.createRadialGradient(px+bw/2,(y0+y1)/2,4,px+bw/2,(y0+y1)/2,bw*0.7); g.addColorStop(0,'rgba(255,235,200,0.12)'); g.addColorStop(1,'rgba(30,20,10,0.12)'); x.fillStyle=g; x.fillRect(px+2,y0,bw-4,y1-y0); px+=bw; } } });
  FLAG.repeat.set(W/2.6,H/2.6);
  // oak: planks with grain
  const OAK=canvasTex(128,256,(x,w,h)=>{ x.fillStyle='#6a4426'; x.fillRect(0,0,w,h); for(let p=0;p<4;p++){ const v=0.85+rnd()*0.25; x.fillStyle=`rgb(${(112*v)|0},${(74*v)|0},${(42*v)|0})`; x.fillRect(p*32+1,0,30,h);
    for(let k=0;k<14;k++){ x.strokeStyle=`rgba(40,22,10,${0.12+rnd()*0.15})`; x.lineWidth=1; x.beginPath(); const sx=p*32+3+rnd()*26; x.moveTo(sx,0); for(let y=0;y<=h;y+=16) x.lineTo(sx+Math.sin(y*0.05+k)*2.5,y); x.stroke(); } }
    x.fillStyle='rgba(30,16,8,0.6)'; for(let p=0;p<=4;p++) x.fillRect(p*32-1,0,2,h); });
  const WOOD=tm(0xffffff,OAK), WOODD=tm(0x8a7060,OAK);
  // the crimson runner: a gold border, a deep red field with small gold lozenges, a blue inner band
  const RUN=canvasTex(64,256,(x,w,h)=>{ x.fillStyle='#7e1c1c'; x.fillRect(0,0,w,h); x.fillStyle='#c9a046'; x.fillRect(0,0,6,h); x.fillRect(w-6,0,6,h); x.fillStyle='#2a3a6a'; x.fillRect(8,0,4,h); x.fillRect(w-12,0,4,h);
    x.fillStyle='#d6b058'; for(let y=16;y<h;y+=32){ x.beginPath(); x.moveTo(w/2,y-7); x.lineTo(w/2+7,y); x.lineTo(w/2,y+7); x.lineTo(w/2-7,y); x.fill(); }
    for(let k=0;k<500;k++){ x.fillStyle=rnd()<0.5?'rgba(0,0,0,0.08)':'rgba(255,200,160,0.05)'; x.fillRect(rnd()*w,rnd()*h,1,2); } });
  // world-scaled texture coordinates on a box, so the stone keeps one size whatever the block
  function TB(w,h,d,mat,x,y,z,par,ts){ ts=ts||TS; const g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv; const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
    for(let f=0;f<6;f++) for(let k=0;k<4;k++){ const i=f*4+k; uv.setXY(i,uv.getX(i)*dims[f][0]/ts,uv.getY(i)*dims[f][1]/ts); }
    const m=new THREE.Mesh(g,mat); m.position.set(x,y+h/2,z); m.castShadow=m.receiveShadow=true; par.add(m); return m; }
  const shapeMesh=(shape,depth,mat,par)=>{ const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:14}); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)/TS,uv.getY(i)/TS);
    const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; par.add(m); return m; };
  // a round-headed opening as a path (for holes): width w, springing at y0, centred on x
  const archPath=(P,x,y0,w,yb)=>{ P.moveTo(x-w/2,yb); P.lineTo(x+w/2,yb); P.lineTo(x+w/2,y0); P.absarc(x,y0,w/2,0,Math.PI,false); P.lineTo(x-w/2,yb); return P; };
  // amber glass in little lozenge quarries, self-lit
  const QUARRY=canvasTex(64,64,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#ffe2a0'); g.addColorStop(1,'#f0b860'); x.fillStyle=g; x.fillRect(0,0,w,h);
    x.strokeStyle='#4a3420'; x.lineWidth=2.5; x.beginPath(); x.moveTo(0,0); x.lineTo(w,h); x.moveTo(w,0); x.lineTo(0,h); x.moveTo(w/2,-h/2); x.lineTo(w*1.5,h/2); x.moveTo(-w/2,h/2); x.lineTo(w/2,h*1.5); x.moveTo(w/2,-h/2); x.lineTo(-w/2,h/2); x.moveTo(w*1.5,h/2); x.lineTo(w/2,h*1.5); x.stroke();
    x.fillStyle='rgba(255,255,255,0.18)'; x.fillRect(4,4,8,8); });
  const glassMat=(w,h)=>{ const t=QUARRY.clone(); t.needsUpdate=true; t.repeat.set(w/0.28,h/0.36); return new THREE.MeshBasicMaterial({map:t,fog:false}); };
  const glassPane=(w,y0,par)=>{ const s=new THREE.Shape(); archPath(s,0,y0,w,0); const g=new THREE.ShapeGeometry(s,12); const uv=g.attributes.uv, p=g.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,(p.getX(i)+w/2)/w,p.getY(i)/(y0+w/2));
    const m=new THREE.Mesh(g,glassMat(w,y0+w/2)); par.add(m); return m; };

  // ── the floor: flagstones; the runner from the door to the steps ──
  { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,H),tm(0xffffff,FLAG)); f.rotation.x=-Math.PI/2; f.position.set(W/2,0,H/2); f.receiveShadow=true; R.add(f);
    const rt=RUN.clone(); rt.needsUpdate=true; rt.repeat.set(1,(H-8)/1.8); const r=new THREE.Mesh(new THREE.PlaneGeometry(1.7,H-8),tm(0xffffff,rt)); r.rotation.x=-Math.PI/2; r.position.set(cx,0.012,8+(H-8)/2); r.receiveShadow=true; R.add(r); }

  // ── the outer walls: thick ashlar, round-headed windows low in the aisles (seen through the arches) ──
  for(const side of [0,1]){ const sx=side?W-0.5:0.5, face=side?W-1:1, dir=side?-1:1;
    const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(H,0); s.lineTo(H,NH); s.lineTo(0,NH); s.lineTo(0,0);
    for(let z=4.5;z<H-2;z+=4) s.holes.push(archPath(new THREE.Path(),z,3.9,0.9,2.3));
    const m=shapeMesh(s,1,STONE,R); m.rotation.y=-Math.PI/2; m.position.set(side?W:1,0,0); if(side){ m.rotation.y=-Math.PI/2; m.position.x=W; }
    for(let z=4.5;z<H-2;z+=4){ const gp=group(sx,2.3,z,R); gp.rotation.y=side?-Math.PI/2:Math.PI/2; glassPane(0.9,1.6,gp);
      const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.0,6),THRONE_SHAFT); sh.position.set(face+dir*2.6,1.4,z+1.0); sh.rotation.set(-Math.PI/2,0,dir*0.5); R.add(sh);
      // a sill and the dressed voussoirs of the arch on the inner face
      TB(1.1,0.14,0.4,STONED,0,0,0,group(face+dir*0.1,2.16,z,R)).rotation.y=Math.PI/2;
      const v=new THREE.Shape(); v.absarc(0,0,0.72,0,Math.PI,false); v.lineTo(-0.45,0); v.absarc(0,0,0.45,Math.PI,0,true); v.lineTo(0.72,0);
      const vm=shapeMesh(v,0.08,STONED,R); vm.rotation.y=side?-Math.PI/2:Math.PI/2; vm.position.set(face+dir*0.04,3.9,z); }
    TB(0.6,0.12,H,WOODD,side?W-1.3:1.3,6.45,H/2,R);   // the aisle's plank ceiling
  }
  // ── the arcades: drum pillars with cushion capitals, round arches, the clerestory wall above with its small windows ──
  const pillarZ=[]; for(let z=2.5;z<H;z+=4) pillarZ.push(z); const COLM=tm(0xe2c8a0,stoneTex(2.6,(SP-1)/TS));
  for(const side of [0,1]){ const px=side?W-2:2, inner=side?W-2.45:2.45, dir=side?-1:1;
    const s=new THREE.Shape(); s.moveTo(0,SP);
    for(let i=0;i+1<pillarZ.length;i++){ const zm=(pillarZ[i]+pillarZ[i+1])/2, r=1.325; s.lineTo(zm-r,SP); s.absarc(zm,SP,r,Math.PI,0,true); }
    s.lineTo(H,SP); s.lineTo(H,NH); s.lineTo(0,NH); s.lineTo(0,SP);
    for(let i=0;i+1<pillarZ.length;i++){ const zm=(pillarZ[i]+pillarZ[i+1])/2; s.holes.push(archPath(new THREE.Path(),zm,8.5,0.7,7.35)); }
    const m=shapeMesh(s,0.9,STONE,R); m.rotation.y=-Math.PI/2; m.position.set(px+0.45,0,0);
    // the end bays down to the floor
    TB(0.9,SP,pillarZ[0]-0.55,STONE,px,0,(pillarZ[0]-0.55)/2,R); TB(0.9,SP,H-pillarZ[pillarZ.length-1]-0.55,STONE,px,0,H-(H-pillarZ[pillarZ.length-1]-0.55)/2,R);
    for(let i=0;i+1<pillarZ.length;i++){ const zm=(pillarZ[i]+pillarZ[i+1])/2;
      // voussoirs: a ring of darker dressed stone round each arch, standing a little proud of the wall
      const v=new THREE.Shape(); v.absarc(0,0,1.62,0,Math.PI,false); v.lineTo(-1.325,0); v.absarc(0,0,1.325,Math.PI,0,true); v.lineTo(1.62,0);
      const vm=shapeMesh(v,0.06,STONED,R); vm.rotation.y=side?-Math.PI/2:Math.PI/2; vm.position.set(inner+dir*0.005,SP,zm);
      const g=group(inner,7.35,zm,R); g.rotation.y=side?-Math.PI/2:Math.PI/2; glassPane(0.7,1.15,g);
      const sh=new THREE.Mesh(new THREE.PlaneGeometry(0.8,9),THRONE_SHAFT); sh.position.set(inner+dir*3.6,3.4,zm+1.2); sh.rotation.set(-Math.PI/2+0.5,0,dir*0.4); R.add(sh); }
    TB(0.22,0.2,H,STONED,inner+dir*0.08,SP+1.95,H/2,R);   // the string course above the arches
    TB(0.2,0.16,H,STONED,inner+dir*0.07,7.12,H/2,R);
    for(const z of pillarZ){ const p=group(px,0,z,R);
      TB(1.35,0.28,1.35,STONED,0,0,0,p); Cy(0.66,0.7,0.18,16,STONED,0,0.28,0,p);
      const col=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.57,SP-0.57-0.46,18,1,true),COLM); col.position.y=0.46+(SP-1.03)/2; col.castShadow=col.receiveShadow=true; p.add(col);
      Cy(0.6,0.58,0.1,16,STONED,0,SP-0.57-0.1,0,p);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.92,0.58,0.45,4,1),STONEL); cap.rotation.y=Math.PI/4; cap.position.y=SP-0.57+0.225; cap.castShadow=true; p.add(cap);
      TB(1.4,0.12,1.4,STONED,0,SP-0.12,0,p); } }
  // ── the end walls with their gables; the great door; tapestries behind the throne ──
  { const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(W,0); s.lineTo(W,NH); s.lineTo(cx,RH+0.3); s.lineTo(0,NH); s.lineTo(0,0);
    s.holes.push((()=>{ const p=new THREE.Path(); p.absarc(cx,10.4,0.85,0,Math.PI*2,true); return p; })());
    shapeMesh(s,1,STONE,R);
    const ro=new THREE.Mesh(new THREE.CircleGeometry(0.85,24),glassMat(1.7,1.7)); ro.position.set(cx,10.4,0.6); R.add(ro);   // the oculus over the throne
    const rr=new THREE.Mesh(new THREE.TorusGeometry(0.92,0.1,6,24),STONED); rr.position.set(cx,10.4,1.02); R.add(rr);
    for(let k=0;k<8;k++){ const a=k*Math.PI/4, b=TB(0.05,0.85,0.05,tm(0x3a2a1a),cx,0,1.0,R); b.position.set(cx+Math.cos(a)*0.42,10.4+Math.sin(a)*0.42,0.64); b.rotation.z=a-Math.PI/2; } }
  { const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(W,0); s.lineTo(W,NH); s.lineTo(cx,RH+0.3); s.lineTo(0,NH); s.lineTo(0,0);
    s.holes.push(archPath(new THREE.Path(),cx,2.5,2.6,0));
    const m=shapeMesh(s,1,STONE,R); m.position.z=H-1;
    // the door: two oak leaves under an iron-strapped arch, the archivolts stepping out round it
    const d=new THREE.Shape(); archPath(d,0,2.5,2.6,0); const dm=new THREE.Mesh(new THREE.ShapeGeometry(d,14),WOODD); dm.position.set(cx,0,H-0.55); dm.rotation.y=Math.PI; R.add(dm);
    { const uv=dm.geometry.attributes.uv, p=dm.geometry.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,(p.getX(i)+1.3)/1.3,p.getY(i)/3.8); }
    TB(0.06,3.75,0.05,tm(0x1e140c),cx,0,H-0.57,R);
    [0.5,1.4,2.3].forEach(y=>{ TB(2.4,0.1,0.04,tm(iron),cx,y,H-0.58,R); [-0.9,0.9].forEach(dx=>Sp(0.04,tm(iron),cx+dx,y+0.05,H-0.6,R)); });
    [-0.25,0.25].forEach(dx=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.018,6,14),tm(iron)); r.position.set(cx+dx,1.2,H-0.62); R.add(r); });
    [[1.3,1.52,0.06],[1.52,1.74,0.12]].forEach(([a,b,dz])=>{ const v=new THREE.Shape(); v.absarc(0,0,b,0,Math.PI,false); v.lineTo(-a,0); v.absarc(0,0,a,Math.PI,0,true); v.lineTo(b,0);
      const vm=shapeMesh(v,0.1+dz,STONED,R); vm.position.set(cx,2.5,H-1-0.1-dz); TB(b-a,2.5,0.1+dz,STONED,cx-(a+b)/2,0,H-1-(0.1+dz)/2,R); TB(b-a,2.5,0.1+dz,STONED,cx+(a+b)/2,0,H-1-(0.1+dz)/2,R); }); }
  // tapestries: a great hanging behind the throne (the royal blue, the crown, the cross of the realm), two at its sides
  const tapTex=(kind)=>canvasTex(kind==='great'?256:128,kind==='great'?320:288,(x,w,h)=>{ const main=kind==='great'?'#22336a':'#7a1e22', band=kind==='great'?'#7a1e22':'#22336a';
    x.fillStyle=main; x.fillRect(0,0,w,h); x.fillStyle='#c9a046'; x.fillRect(0,0,w,8); x.fillRect(0,0,8,h); x.fillRect(w-8,0,8,h); x.fillStyle=band; x.fillRect(10,10,w-20,10); x.fillRect(10,h-30,w-20,10);
    x.fillStyle='#c9a046'; for(let y=34;y<h-34;y+=24){ x.beginPath(); x.arc(18,y,5,0,7); x.arc(w-18,y,5,0,7); x.fill(); }
    if(kind==='great'){ const c=w/2; x.beginPath(); x.moveTo(c-60,130); x.lineTo(c-66,82); x.lineTo(c-36,104); x.lineTo(c-18,70); x.lineTo(c,100); x.lineTo(c+18,70); x.lineTo(c+36,104); x.lineTo(c+66,82); x.lineTo(c+60,130); x.closePath(); x.fill(); x.fillRect(c-62,124,124,16);
      x.fillRect(c-6,30,12,44); x.fillRect(c-18,42,36,10); x.fillRect(c-8,170,16,110); x.fillRect(c-40,196,80,16); x.strokeStyle='#c9a046'; x.lineWidth=4; x.beginPath(); x.arc(c,226,62,0,7); x.stroke(); }
    else { const c=w/2; x.strokeStyle='#c9a046'; x.lineWidth=4; for(let k=0;k<3;k++){ const y=70+k*80; x.beginPath(); x.arc(c,y,30,0,7); x.stroke(); x.fillRect(c-3,y-18,6,36); x.fillRect(c-13,y-8,26,6); } }
    for(let y=h-20;y<h;y+=1){ for(let k=0;k<w;k+=6){ x.fillStyle='rgba(201,160,70,0.6)'; x.fillRect(k,y,2,1); } }   // the fringe
    for(let k=0;k<1400;k++){ x.fillStyle=rnd()<0.5?'rgba(0,0,0,0.07)':'rgba(255,255,255,0.04)'; x.fillRect(rnd()*w,rnd()*h,1,2); } });
  const hanging=(tex,w,h,x,yTop,z)=>{ const g=new THREE.PlaneGeometry(w,h,10,6), p=g.attributes.position; for(let i=0;i<p.count;i++){ const u=(p.getX(i)+w/2)/w, v=(h/2-p.getY(i))/h; p.setZ(i,0.035*Math.sin(u*Math.PI*6)*(0.4+v)); } g.computeVertexNormals();
    const m=new THREE.Mesh(g,tm(0xffffff,tex,{ds:true})); m.position.set(x,yTop-h/2,z); m.receiveShadow=true; R.add(m); const rod=Cy(0.035,0.035,w+0.3,8,tm(0x3a2614),x,yTop+0.02,z+0.02,R); rod.rotation.z=Math.PI/2; rod.position.y=yTop+0.02; [-1,1].forEach(s=>Sp(0.06,tm(gold),x+s*(w/2+0.16),yTop+0.02,z+0.02,R)); return m; };
  hanging(tapTex('great'),4.0,5.0,cx,6.7,1.1); hanging(tapTex('side'),1.7,3.9,cx-4.4,5.6,1.08); hanging(tapTex('side'),1.7,3.9,cx+4.4,5.6,1.08);
  hanging(tapTex('side'),1.5,3.4,cx-3.3,5.2,H-1.08).rotation.y=Math.PI; hanging(tapTex('side'),1.5,3.4,cx+3.3,5.2,H-1.08).rotation.y=Math.PI;

  // ── the open oak roof: wall plates, a tie-beam with a king-post and arched braces at every pair of pillars, rafters and boards ──
  { const span=W-4.9, rise=RH-NH, half=span/2, ang=Math.atan2(rise,half), rl=Math.hypot(half,rise)+0.4;
    [2.45,W-2.45].forEach(x=>TB(0.4,0.3,H,WOODD,x+(x<cx?0.15:-0.15),NH,H/2,R));
    for(const z of pillarZ){ TB(span+0.4,0.36,0.34,WOOD,cx,NH-0.15,z,R,1.6); TB(0.3,rise-0.1,0.3,WOOD,cx,NH+0.2,z,R,1.6);
      [-1,1].forEach(s=>{ const st=TB(0.18,1.9,0.2,WOOD,0,0,0,R,1.6); st.position.set(cx+s*1.6,NH+0.95,z); st.rotation.z=s*0.95;   // the struts from the king-post
        const br=new THREE.Mesh(new THREE.TorusGeometry(1.25,0.1,6,10,Math.PI/2),WOOD); br.position.set(cx+s*(half-1.25),NH-1.4,z); br.rotation.z=s>0?0:Math.PI/2; R.add(br);   // an arched brace under each end
        TB(0.24,1.6,0.26,WOODD,cx+s*(half-0.05),NH-1.75,z,R); }); }   // the wall-post it springs from
    for(const s of [-1,1]){ const g=group(cx+s*half/2,NH+rise/2+0.12,H/2,R); g.rotation.z=-s*ang;
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(rl,H),tm(0xb09078,(()=>{ const t=OAK.clone(); t.needsUpdate=true; t.rotation=Math.PI/2; t.repeat.set(H/1.2,rl/2.4); return t; })(),{ds:true})); bd.rotation.x=Math.PI/2; bd.position.y=0.2; g.add(bd);
      for(let z=1.25;z<H;z+=1.25) TB(rl,0.2,0.14,WOODD,0,0,z-H/2,g,1.6);   // the common rafters
      [-0.3,0.3].forEach(o=>TB(0.18,0.22,H,WOODD,o*rl,-0.15,0,g)); }   // purlins
    TB(0.26,0.3,H,WOODD,cx,RH-0.1,H/2,R); }
  // ── the dais: three broadening tiers of dressed stone, the runner up the steps ──
  [[4,W-4,4,8,0.2],[5,W-5,3,7,0.4],[6,W-6,1,6,0.6]].forEach(([x0,x1,y0,y1,h])=>{ TB(x1-x0,h,y1-y0,STONEL,(x0+x1)/2,0,(y0+y1)/2,R); TB(x1-x0+0.04,0.05,0.08,tm(goldD),(x0+x1)/2,h-0.05,y1,R); });
  { TB(1.9,0.615,6.6,tm(0x8a2020),cx,0,4.7,R); [-0.98,0.98].forEach(dx=>TB(0.06,0.62,6.62,tm(goldD),cx+dx,0,4.7,R)); }
  // ── the throne: dark oak and gilt, a round-headed back with a little arcade carved on it, lions' heads on the arms, a red cushion;
  //  over it a canopy of state on oak posts, red with a gold-fringed valance ──
  { const t=group(cx,0.6,2.2,R), O=tm(0x7a4e2c,OAK), G=tm(gold), GD=tm(goldD);
    const bk=new THREE.Shape(); bk.moveTo(-0.7,0); bk.lineTo(0.7,0); bk.lineTo(0.7,1.8); bk.absarc(0,1.8,0.7,0,Math.PI,false); bk.lineTo(-0.7,0);
    const bm=new THREE.Mesh(new THREE.ExtrudeGeometry(bk,{depth:0.3,bevelEnabled:true,bevelSize:0.03,bevelThickness:0.03,bevelSegments:1,curveSegments:16}),O); bm.position.set(0,0,-0.35); bm.castShadow=true; t.add(bm);
    // the back's padding: red velvet, buttoned in a diamond pattern, under a gilt rim
    { const pn=new THREE.Shape(); pn.moveTo(-0.52,0.62); pn.lineTo(0.52,0.62); pn.lineTo(0.52,1.78); pn.absarc(0,1.78,0.52,0,Math.PI,false); pn.lineTo(-0.52,0.62);
      const pm=new THREE.Mesh(new THREE.ExtrudeGeometry(pn,{depth:0.07,bevelEnabled:true,bevelSize:0.035,bevelThickness:0.035,bevelSegments:3,curveSegments:16}),tm(0x9a2626)); pm.position.z=-0.07; pm.castShadow=true; t.add(pm);
      for(let r=0;r<6;r++) for(let k=0;k<(r%2?3:4);k++){ const x=-0.33+k*0.22+(r%2?0.11:0), y=0.78+r*0.22; if(y>1.78&&Math.hypot(x,y-1.78)>0.42) continue; Sp(0.018,G,x,y,0.04,t,6,4); }
      const rim=new THREE.Mesh(new THREE.TorusGeometry(0.56,0.025,5,20,Math.PI),G); rim.position.set(0,1.78,0.0); t.add(rim); [-0.56,0.56].forEach(x=>TB(0.05,1.16,0.05,G,x,0.62,0.0,t)); }
    const ar=new THREE.Mesh(new THREE.TorusGeometry(0.72,0.045,6,24,Math.PI),G); ar.position.set(0,1.8,-0.2); ar.scale.z=1; t.add(ar);
    // the back's corner posts with gilt finials, and a gilt shield of the realm on the peak below the crown
    [-0.74,0.74].forEach(x=>{ Cy(0.07,0.08,2.05,8,O,x,0,-0.2,t); Sp(0.1,G,x,2.15,-0.2,t,10,8); Co(0.05,0.14,6,G,x,2.25,-0.2,t); Cy(0.09,0.09,0.05,8,G,x,1.2,-0.2,t); Cy(0.09,0.09,0.05,8,G,x,0.5,-0.2,t); });
    // the seat: a deep oak box, its front carved with a little gilt arcade, on gilt lion's-paw feet; a plump red cushion with gold piping and tassels
    TB(1.3,0.5,0.7,O,0,0,0.1,t,1); TB(1.36,0.06,0.74,GD,0,0.48,0.1,t);
    for(let k=0;k<5;k++){ const x=-0.48+k*0.24; TB(0.035,0.24,0.03,G,x-0.12,0.1,0.46,t); const a=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.018,5,10,Math.PI),G); a.position.set(x,0.34,0.465); t.add(a); } TB(0.035,0.24,0.03,G,0.6,0.1,0.46,t);
    TB(1.2,0.04,0.03,G,0,0.06,0.465,t);
    [[-0.6,0.4],[0.6,0.4],[-0.6,-0.2],[0.6,-0.2]].forEach(([x,z])=>{ const p=Sp(0.11,G,x,0.03,z,t,10,6); p.scale.set(1,0.55,1.2); [-0.05,0,0.05].forEach(d=>Sp(0.035,G,x+d,0.03,z+0.11,t,6,4)); });
    { const cu=new THREE.Mesh(new THREE.BoxGeometry(1.08,0.16,0.6,6,2,6),tm(0xa82a2a)); const p=cu.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i)/0.54, z=p.getZ(i)/0.3; if(p.getY(i)>0) p.setY(i,p.getY(i)+0.05*(1-x*x)*(1-z*z)); } cu.geometry.computeVertexNormals(); cu.position.set(0,0.58,0.13); cu.castShadow=cu.receiveShadow=true; t.add(cu);
      TB(1.1,0.025,0.025,G,0,0.5,0.43,t); [[-0.54,0.42],[0.54,0.42]].forEach(([x,z])=>{ Co(0.03,0.1,6,G,x,0.42,z,t).rotation.x=Math.PI; Sp(0.022,G,x,0.53,z,t,6,4); }); }
    // the arms: oak, padded in red, each ending in a gilt lion's head
    [-0.68,0.68].forEach(x=>{ TB(0.16,0.9,0.7,O,x,0,0.1,t,1); TB(0.18,0.05,0.72,GD,x,0.88,0.1,t); TB(0.13,0.05,0.5,tm(0x9a2626),x,0.93,0.04,t);
      const h=group(x,0.98,0.46,t); Sp(0.1,G,0,0,0,h,10,8); const mn=new THREE.Mesh(new THREE.TorusGeometry(0.09,0.035,6,12),GD); mn.position.z=-0.02; h.add(mn);
      Sp(0.045,G,0,-0.03,0.08,h,8,6); [-0.05,0.05].forEach(e=>{ Co(0.025,0.05,4,G,e,0.07,0,h); Sp(0.012,tm(0x1a1208),e*0.7,0.02,0.09,h,4,3); }); });
    // the footstool before it, oak and red velvet with a gilt edge
    { const f=group(0,0,0.66,t); TB(0.86,0.3,0.42,O,0,0,0,f,1); const c=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.08,0.38,4,1,4),tm(0xa82a2a)); const p=c.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i)/0.4, z=p.getZ(i)/0.19; if(p.getY(i)>0) p.setY(i,p.getY(i)+0.025*(1-x*x)*(1-z*z)); } c.geometry.computeVertexNormals(); c.position.y=0.34; f.add(c);
      TB(0.88,0.025,0.44,G,0,0.29,0,f); [[-0.38,0.17],[0.38,0.17],[-0.38,-0.17],[0.38,-0.17]].forEach(([x,z])=>{ const p2=Sp(0.045,G,x,0.01,z,f,6,4); p2.scale.y=0.6; }); }
    // the crown on its peak
    { const c=group(0,2.62,-0.2,t); Cy(0.16,0.14,0.1,12,G,0,0,0,c); for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; Co(0.035,0.12,4,G,Math.cos(a)*0.14,0.08,Math.sin(a)*0.14,c); } TB(0.04,0.22,0.04,G,0,0.08,0,c); TB(0.14,0.04,0.04,G,0,0.2,0,c); }
    shade(t); }
  { const c=group(cx,0,2.2,R), P=tm(0x4a2e18,OAK), CL=tm(0x8a2424,null,{ds:true}), G=tm(gold);
    [[-1.3,-0.9],[1.3,-0.9],[-1.3,0.95],[1.3,0.95]].forEach(([x,z])=>{ const p=Cy(0.07,0.08,5.0,8,P,x,0.6,z,c); Sp(0.1,G,x,5.66,z,c); });
    const top=new THREE.Mesh(new THREE.BoxGeometry(2.8,0.1,2.1),CL); top.position.set(0,5.6,0.02); c.add(top);
    [[0,1.05,2.8,0],[0,-0.88,2.8,0],[-1.4,0.08,1.95,Math.PI/2],[1.4,0.08,1.95,Math.PI/2]].forEach(([x,z,w,ry])=>{ const v=new THREE.Mesh(new THREE.PlaneGeometry(w,0.42,16,1),CL); const p=v.geometry.attributes.position; for(let i=0;i<p.count;i++) if(p.getY(i)<0) p.setY(i,p.getY(i)-0.06*Math.abs(Math.sin(p.getX(i)*9)));
      v.position.set(x,5.35,z); v.rotation.y=ry; c.add(v); const f=TB(w,0.05,0.03,G,0,0,0,c); f.position.set(x,5.12,z); f.rotation.y=ry; });
    shade(c); }
  // ── light: iron tripod braziers by the throne, torches on the pillars, two great wheels of candles hung from the tie-beams ──
  [[cx-3,4],[cx+3,4]].forEach(([x,y],i)=>{ const b=group(x,0.2,y+0.5,R); [0,1,2].forEach(k=>{ const a=k*Math.PI*2/3, l=Cy(0.025,0.025,1.15,5,tm(iron),Math.cos(a)*0.2,0,Math.sin(a)*0.2,b); l.rotation.set(Math.sin(a)*0.18,0,-Math.cos(a)*0.18); });
    Cy(0.32,0.16,0.24,10,tm(iron),0,1.0,0,b); const f=Co(0.22,0.46,7,glow(0xffa040),0,1.18,0,b); const f2=Co(0.12,0.32,6,glow(0xffe08a),0,1.2,0,b); an.push(t=>{ f.scale.y=1+Math.sin(t*10+i)*0.2; f.rotation.y=t*2; f2.scale.y=1+Math.sin(t*13+i)*0.25; });
    const l=new THREE.PointLight(0xffa458,0.7,8,1.6); l.position.y=1.7; b.add(l); an.push(t=>{ l.intensity=0.64+Math.sin(t*9+i)*0.07; }); shade(b); });
  pillarZ.filter(z=>z>8&&z<26).forEach((z,j)=>[2,W-2].forEach((px,s)=>{ const t=group(px,3.3,z+0.6,R); TB(0.1,0.3,0.12,tm(iron),0,-0.15,0,t); const h=Cy(0.035,0.05,0.5,6,tm(0x4a2e18),0,0,0.12,t); h.rotation.x=0.35;
    const f=Co(0.07,0.2,6,glow(0xffb050),0,0.48,0.27,t); const f2=Co(0.04,0.13,6,glow(0xfff0b0),0,0.49,0.27,t); an.push(tt=>{ f.scale.y=1+Math.sin(tt*11+j*2+s)*0.25; f2.scale.y=1+Math.sin(tt*15+j+s)*0.3; });
    if(j%2===0){ const l=new THREE.PointLight(0xffb060,0.42,6,1.7); l.position.set(0,0.6,0.35); t.add(l); an.push(tt=>{ l.intensity=0.38+Math.sin(tt*10+j+s)*0.05; }); } }));
  [10.5,18.5].forEach((z,i)=>{ const c=group(cx,0,z,R), Y=5.5;
    [0,1,2,3].forEach(k=>{ const a=k*Math.PI/2+Math.PI/4, ch=Cy(0.012,0.012,NH-0.3-Y,4,tm(iron),0,Y,0,c); ch.position.set(Math.cos(a)*0.6,(Y+NH-0.3)/2,Math.sin(a)*0.6); ch.rotation.set(Math.sin(a)*0.18,0,-Math.cos(a)*0.18); });
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,0.06,6,28),tm(iron)); ring.rotation.x=Math.PI/2; ring.position.y=Y; c.add(ring);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(1.05,0.025,5,28),tm(goldD)); ring2.rotation.x=Math.PI/2; ring2.position.y=Y+0.14; c.add(ring2);
    for(let k=0;k<12;k++){ const a=k/12*Math.PI*2, x=Math.sin(a)*1.05, zz=Math.cos(a)*1.05;
      if(k%3===0){ TB(0.14,0.3,0.14,tm(iron),x,Y,zz,c); Co(0.11,0.16,4,tm(iron),x,Y+0.3,zz,c); }   // the little towers of the heavenly city
      else { Cy(0.025,0.025,0.16,6,tm(0xf4eee0),x,Y+0.05,zz,c); flame(x,Y+0.27,zz,c,an,1.0); } }
    const l=new THREE.PointLight(0xffd8a0,0.6,11,1.5); l.position.y=Y-0.2; c.add(l); shade(c); });

  // ── the shields of the ten villages on the pillars down both sides (CREST): each hangs under a dark cloth until its chapel is
  //  cleansed, then the cloth falls and shows the village's colour with the crest of the realm in gold, its name on a plaque beneath;
  //  kneel at the foot of the dais; a fanfare when you come in ──
  const TAPS=[]; { const names=[]; for(let i=0;i<10;i++) names.push(typeof CHAPELS!=='undefined'&&CHAPELS[i]&&CHAPELS[i].td?CHAPELS[i].td.name:null);
    const plaqueTex=(i,open)=>{ const c=document.createElement('canvas'); c.width=256; c.height=64; const x=c.getContext('2d');
      x.fillStyle='#3a2616'; x.fillRect(0,0,256,64); x.strokeStyle='#c9a046'; x.lineWidth=4; x.strokeRect(4,4,248,56);
      x.fillStyle=open?'#f0d27a':'#6a5a48'; x.font='bold 28px "Palatino Linotype",Georgia,serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(open?(names[i]||('Chapel '+(i+1))):'· · ·',128,34);
      const t=new THREE.CanvasTexture(c); if(SRGB()) t.encoding=THREE.sRGBEncoding; return t; };
    const SZ=[10.5,14.5,18.5,22.5,26.5];
    for(let i=0;i<10;i++){ const side=i<5?0:1, z=SZ[i%5], wx=side?W-2.68:2.68, ry=side?-Math.PI/2:Math.PI/2, th=typeof CHAPEL_THEMES!=='undefined'?CHAPEL_THEMES[i]:null;
      const hang=group(wx,4.05,z,R); hang.rotation.y=ry;
      const sh=CREST.shield(th); sh.rotation.x=-0.07; hang.add(sh);
      [-0.36,0.36].forEach(dx=>B(0.04,0.3,0.03,0x4a3020,dx,-0.02,-0.08,hang));   // the straps it hangs by
      const veil=CREST.veil(); sh.add(veil);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.155),new THREE.MeshLambertMaterial({map:plaqueTex(i,false)})); pl.position.set(0,-CREST.H-0.16,-0.08); hang.add(pl);
      TAPS.push({m:pl,veil,i,open:false,x:wx,z,fall:0});
      lv.spots.push({x:side?W-3.4:3.4,z,r:1.4,label:'Look',who:'A village shield',action:()=>{ const done=(GAME.S.chapels||0)>i; ENGINE.speak(done?'The shield of '+(names[i]||'a village'):'A covered shield',done?[`${names[i]||'The village'}'s colour, with the crest of the realm in gold thread: the rooted tree, the wheel in its crown of thorns, the three drops. It has seen battle.`,'“Above all, taking the shield of faith.” — Ephesians 6:16']:['A dark cloth hangs over it. The heralds wait for word that this village\'s chapel is cleansed.']); }}); }
    an.push(()=>{ for(const t of TAPS) if(t.fall>0&&t.veil.visible){ t.fall+=1/60; const k=Math.min(1,t.fall/1.1); t.veil.position.y=-1.4*k*k; t.veil.scale.y=1-0.7*k; t.veil.rotation.x=0.5*k; if(k>=1) t.veil.visible=false; } });
    let first=true;
    const showTaps=()=>{ const n=GAME.S.chapels||0; TAPS.forEach(t=>{ const o=n>t.i; if(o!==t.open){ t.open=o; t.m.material.map=plaqueTex(t.i,o); t.m.material.needsUpdate=true;
      if(o&&!first) t.fall=0.0001; else { t.veil.visible=!o; t.veil.position.y=0; t.veil.scale.y=1; t.veil.rotation.x=0; t.fall=0; } } }); first=false; };
    showTaps(); const oe=lv.onEnter; lv.onEnter=sp=>{ showTaps(); fanfare(); if(oe) oe(sp); }; }
  function fanfare(){ try{ const A=(typeof AUDIO2D!=='undefined'&&AUDIO2D.A&&AUDIO2D.A())||window.__klkAC||(window.__klkAC=new (window.AudioContext||window.webkitAudioContext)()); if(A.state==='suspended') A.resume(); let t=A.currentTime+0.15;
    [[392,0.18],[523,0.18],[659,0.18],[784,0.6]].forEach(([f,d])=>{ [1,1.5].forEach((h,i)=>{ const o=A.createOscillator(), g=A.createGain(), fl=A.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=f*(i?1.005:1); fl.type='lowpass'; fl.frequency.value=1800; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.06,t+0.03); g.gain.setValueAtTime(0.06,t+d-0.04); g.gain.linearRampToValueAtTime(0.0001,t+d); o.connect(fl); fl.connect(g); g.connect(A.destination); o.start(t); o.stop(t+d+0.02); }); t+=d; }); }catch(e){} }

  // ── the king's minstrels, beside the dais on an oak platform: a harp, a hurdy-gurdy, a lute, a recorder and a frame drum ──
  { const PL=group(0,0,0,R);
    TB(1.5,0.22,4.6,WOOD,3.35,0,6.0,PL,1.4); TB(2.5,0.22,1.6,WOOD,3.85,0,9.0,PL,1.4); TB(2.52,0.04,0.06,tm(goldD),3.85,0.2,9.8,PL);
    const MUS=[
      {look:'monkF',who:'The harpist',x:3.2,z:4.6,rest:0.6,inst:'harp'},
      {look:'pilgrim',who:'The hurdy-gurdy player',x:3.2,z:6.0,rest:0.72,inst:'gurdy'},
      {look:'bard',who:'The lutenist',x:3.25,z:7.4,rest:0.88,inst:null},
      {look:'monk',who:'The recorder player',x:4.4,z:9.0,rest:1.0,inst:'recorder'},
      {look:'peasant',who:'The drummer',x:3.2,z:9.1,rest:1.15,inst:'drum'} ];
    const OK=tm(0xa8703a,OAK), DK=tm(0x4a2c16), GD=tm(goldD), STR=new THREE.MeshBasicMaterial({color:0xe8dcc0});
    // the beat they play to (the band's own clock, minstrels.js); between tunes, a slow sway of their own
    const BEAT=t=>{ const b=typeof MINSTRELS!=='undefined'&&MINSTRELS.beat?MINSTRELS.beat():null; return b!=null&&b>=0?b:null; };
    const hit=b=>b==null?0:Math.exp(-((b%1+1)%1)*6);   // a stroke on each beat, falling away
    // each instrument is held: once the player's arms are in place it is fixed to the hand, the chest or the head that carries it
    const holdOn=(K,part,obj)=>{ if(obj.userData.held) return; K.updateMatrixWorld(true); part.attach(obj); obj.userData.held=true; };
    const SET=(o,x,y,z)=>o.rotation.set(x,y,z);
    MUS.forEach((m,i)=>{ const f=addPerson(lv,R,m.look,m.x,m.z,0.22,m.who,['…'],{mute:true,rest:m.rest}); f.still=true; f.near=40; f.lookAbout=0.35; f.breathe=true;
      const g=f.g; let h=null, cr=null;
      if(m.inst==='harp'){ h=group(0.1,0.5,0.32,g); h.rotation.y=Math.PI/2-0.45; h.scale.setScalar(0.82);
        const pil=Cy(0.03,0.04,0.95,6,OK,-0.22,0,0,h); pil.rotation.z=0.12; const sb=Cy(0.05,0.07,0.85,6,OK,0.18,0,0,h); sb.rotation.z=-0.35;
        const nk=new THREE.Mesh(new THREE.TorusGeometry(0.24,0.03,5,10,Math.PI*0.8),OK); nk.position.set(0.0,0.86,0); nk.rotation.z=0.25; h.add(nk);
        for(let k=0;k<9;k++) Cy(0.003,0.003,0.32+k*0.055,3,STR,-0.18+k*0.042,0.88-(0.32+k*0.055),0,h);
        f.pose=(r,t,dt,talk,K)=>{ const b=BEAT(t), p=b==null?0:Math.sin(b*Math.PI*2)*0.5+0.5;
          SET(r.AR.sh,-0.85,0.2,0.32); r.AR.el.rotation.x=-0.75-0.18*p; SET(r.AL.sh,-0.8,-0.2,-0.3); r.AL.el.rotation.x=-0.8-0.18*(1-p);
          r.AR.hand.rotation.x=-0.2; r.AL.hand.rotation.x=-0.2; r.head.rotation.x+=0.12; holdOn(K,r.torso,h); }; }
      if(m.inst==='gurdy'){ h=group(0,0.92,0.27,g); h.rotation.y=0.15; h.rotation.z=-0.15;
        const body=new THREE.Mesh(new THREE.SphereGeometry(0.17,12,8),OK); body.scale.set(2.0,0.8,1.0); h.add(body); TB(0.28,0.07,0.16,DK,0.25,0.06,0,h); TB(0.5,0.02,0.14,GD,-0.02,0.12,0,h);
        cr=group(-0.34,0,0.0,h); TB(0.02,0.12,0.02,tm(iron),0,0,0.08,cr); Cy(0.015,0.015,0.06,5,DK,0,0.11,0.12,cr).rotation.x=Math.PI/2;
        f.pose=(r,t,dt,talk,K)=>{ const b=BEAT(t), w=b==null?t*1.5:b*Math.PI*2/2;   // the crank turns once in two beats
          if(b!=null||true) cr.rotation.x=-w;
          SET(r.AR.sh,-0.3+0.1*Math.sin(w),0,0.08); r.AR.el.rotation.x=-0.85+0.2*Math.cos(w); SET(r.AL.sh,-0.35,0,-0.08); r.AL.el.rotation.x=-1.0; r.AL.hand.rotation.x=0.1+0.08*hit(b);
          r.head.rotation.x+=0.16; holdOn(K,r.torso,h); }; }
      if(m.inst==='recorder'){ h=group(0,1.4,0.13,g); Cy(0.018,0.024,0.36,8,tm(0xd8a868),0,-0.36,0,h); Cy(0.026,0.026,0.03,8,tm(0x6a4426),0,-0.38,0,h); h.rotation.x=-0.72;
        f.pose=(r,t,dt,talk,K)=>{ const b=BEAT(t);
          SET(r.AR.sh,-0.8,0.2,0.32); r.AR.el.rotation.x=-1.5; SET(r.AL.sh,-0.85,-0.2,-0.32); r.AL.el.rotation.x=-1.62;
          r.AR.hand.rotation.x=0.25; r.AL.hand.rotation.x=0.25; r.head.rotation.x+=0.12+(b==null?0:0.03*Math.sin(b*Math.PI)); r.head.rotation.y*=0.3; holdOn(K,r.head,h); }; }
      if(m.inst==='drum'){ h=group(0.26,1.08,0.2,g); h.rotation.y=-0.6; const rim=Cy(0.2,0.2,0.07,16,OK,0,-0.035,0,h); rim.rotation.x=Math.PI/2; const sk=new THREE.Mesh(new THREE.CircleGeometry(0.19,16),tm(0xe6d2a8,null,{ds:true})); sk.position.z=0.036; h.add(sk);
        f.pose=(r,t,dt,talk,K)=>{ const b=BEAT(t), k=b==null?0:hit(b*(m.drumDiv||1));
          SET(r.AL.sh,-0.55,0,0.25); r.AL.el.rotation.x=-1.35; SET(r.AR.sh,-0.62,0.1,0.05); r.AR.el.rotation.x=-1.05-0.45*(1-k); r.AR.hand.rotation.x=-0.3+0.5*k;
          r.head.rotation.x+=0.06+(b==null?0:0.04*Math.sin(b*Math.PI)); holdOn(K,r.AL.hand,h); }; }
      if(!m.inst){   // the lutenist: his own lute across his belly, left hand up the neck, right hand strumming
        f.pose=(r,t,dt,talk,K)=>{ const b=BEAT(t), k=b==null?0.5+0.5*Math.sin(t*2):hit(b*2);
          SET(r.AR.sh,-0.3,0,0.05); r.AR.el.rotation.x=-1.05-0.22*k; r.AR.hand.rotation.x=0.2*k; SET(r.AL.sh,-0.95,0.1,0.08); r.AL.el.rotation.x=-1.0;
          r.head.rotation.x+=0.12; r.head.rotation.y*=0.4; r.head.rotation.y+=0.25; }; }
      if(h) shade(h); });
    lv.band={x:3.6,z:7.0};
    lv.spots.push({x:5.4,z:10.2,r:1.4,label:'Listen',who:'The minstrels',action:()=>{ const n=typeof MINSTRELS!=='undefined'&&MINSTRELS.now?MINSTRELS.now():null;
      ENGINE.speak('The king\'s minstrels',[n?`They are playing “${n}” — harp, hurdy-gurdy, lute, recorder and drum.`:'They tune their strings, and nod you a welcome.','“Praise him with the timbrel and dance: praise him with stringed instruments and organs.” — Psalm 150:4']); }}); }

  lv.spots.push({x:cx,z:8.7,r:1.2,label:'Kneel',who:'Before the throne',action:()=>{ ENGINE.hold(1.8,'sit'); ENGINE.speak(spec.king.name||'The King',['Rise, knight. Luminar is in your debt — and it is not to me that you owe your strength.','“Fear God. Honour the king.” — 1 Peter 2:17']); }});
  // King Karl on his throne; the halberd guards
  const king=addPerson(lv,R,'king',cx,2.34,0.63,spec.king.name,spec.king.lines,{rest:0,reach:4.4}); king.still=true; an.push(()=>{ const on=typeof SLEEP==='undefined'||SLEEP.phase()!=='night'; if(king.g.visible!==on){ king.g.visible=on; king.mute=!on; king.ghost=!on; } });   // abed at night
  { const mad=addPerson(lv,R,'madison',cx+1.9,5.2,0.6,'Princess Madison',['Welcome, Sir Knight. My father speaks of you every evening at supper.','“The Lord is my light and my salvation; whom shall I fear?” — Psalm 27:1'],{rest:-0.35});
    mad.still=true; mad.near=40; mad.lookAbout=0.45; mad.breathe=true; mad.idle='clasped';
    an.push(()=>{ const b=(GAME.S&&GAME.S.bounties)||{}, here=(!b.madisonTaken||(b.madisonRescued&&!GAME.S.homecoming))&&(typeof SLEEP==='undefined'||SLEEP.phase()!=='night'); if(mad.g.visible!==here){ mad.g.visible=here; mad.mute=!here; mad.ghost=!here; } }); }
  if(!ENGINE.levels['keep_chambers']) ENGINE.add({id:'keep_chambers',lazy:()=>chambersLevel({back:{level:spec.id,spawn:{x:13.75,z:2.4,face:0}}})}); king.sit=true; king.near=40; king.lookAbout=0.5; king.breathe=true; king.key='king'; if(king.g.animate) try{ king.g.animate(0.016,'sit',0.5); }catch(e){} king.reach=5.6; king.g.scale.setScalar(1.06);
  [[cx-2,8,0],[cx+2,8,1],[cx-2,14,0],[cx+2,14,1]].forEach(([x,y,s])=>addPerson(lv,R,'royalguard',x,y+0.5,0,'Royal Guard',[spec.guardLines[s]],{rest:s?-Math.PI/2:Math.PI/2}));
  lv.folk.forEach(f=>{ if(f.who==='Royal Guard'){ f.still=true; f.near=40; f.lookAbout=0.55; f.breathe=true; } });   // at their posts: they shift a little and look about the hall
  // walking: buildKeepGrid — floor everywhere except the pillar/wall edges, the dais rows and the minstrels' platform
  lv.ground=()=>0;
  lv.canMove=(fx,fz,tx,tz)=>(tx>=3.25&&tx<=W-3.25&&tz>=8.2&&tz<=H-0.4&&!(tx<5.35&&tz<10.05))||(tx>=13.3&&tx<=14.25&&tz>=1.5&&tz<=8.4);   // V288: and the way past the dais to the royal chambers
  /* V288: THE ROYAL CHAMBERS — an oak door in the back wall beside the dais, under a round arch with the royal arms over it; through it the
     King's bedchamber and the Princess's. By night the throne stands empty: King Karl is abed, and Madison too (sleep.js). */
  { const dx=13.75, D=group(dx,0,1.02,R); const dr=new THREE.Shape(); dr.moveTo(-0.55,0); dr.lineTo(0.55,0); dr.lineTo(0.55,1.9); dr.absarc(0,1.9,0.55,0,Math.PI,false); dr.lineTo(-0.55,0);
    const dm=new THREE.Mesh(new THREE.ShapeGeometry(dr,12),tm(0x5a3820,OAK)); dm.position.z=0.005; D.add(dm); [0.5,1.3,2.0].forEach(y=>TB(1.0,0.06,0.03,tm(iron),0,y,0.02,D));
    const ar=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.09,6,16,Math.PI),STONED); ar.position.set(0,1.9,0.04); D.add(ar); [-1,1].forEach(sx=>TB(0.16,1.9,0.16,STONED,sx*0.62,0,0.04,D));
    Sp(0.035,tm(gold),0.32,1.0,0.05,D); const cr=new THREE.Mesh(new THREE.CircleGeometry(0.2,16),tm(0x22336a)); cr.position.set(0,2.75,0.03); D.add(cr); TB(0.04,0.22,0.01,tm(gold),0,2.64,0.04,D); TB(0.14,0.04,0.01,tm(gold),0,2.72,0.04,D);
    lv.spots.push({x:dx,z:1.9,r:0.9,label:'Enter',who:'The royal chambers',action:()=>ENGINE.go('keep_chambers',{x:4.5,z:7.6,face:Math.PI})}); }

  lv.clamp=v=>{ v.x=Math.min(W-1.3,Math.max(1.3,v.x)); v.z=Math.min(H-1.2,Math.max(1.5,v.z)); v.y=Math.min(NH-0.6,Math.max(0.8,v.y)); };
  lv.camBlock=(x,z,y)=>y>NH-0.7||x<1.1||x>W-1.1||z>H-1.05||((Math.abs(x-2)<0.7||Math.abs(x-(W-2))<0.7)&&(y>SP-0.2||((z-0.5)%4+4)%4>1.3&&((z-0.5)%4+4)%4<2.7));   // the walls, the roof, the pillars and the clerestory over the arches
  lv.spawn={x:cx,z:H-2.5,face:Math.PI,yaw:0};
  lv.spots.push({x:cx,z:H-1.2,r:1.4,label:'Leave',who:'Leave',auto:[0,1],ar:0.8,action:()=>ENGINE.go(spec.exit.level,spec.exit.spawn)});
  return lv; }

// ════════════════════════════════════════════════════════════════
//  THE ROYAL CHAMBERS (V288) — behind the throne hall: a passage with a guard at the door, King Karl's bedchamber (a canopied bed
//  hung in royal blue, his armour on its stand, his sword on the rack, the hearth, his banner) and Princess Madison's (a canopied bed
//  in rose, her dresser, books, flowers, a window over the city). They are here by night and in the hall by day (sleep.js).
// ════════════════════════════════════════════════════════════════
function chambersLevel(o){
  const G=[
    '5 5 51 5 54 5 51 5 5 5 51 5 44 5 51 5 5',
    '5 13 13 13 13 45 13 13 5 49 13 13 13 13 13 50 5',
    '5 56 13 61 13 13 13 47 5 13 13 61 13 13 13 49 5',
    '5 12 13 62 13 13 13 12 5 47 13 62 13 13 13 12 5',
    '5 55 13 13 13 13 13 12 5 12 13 13 13 13 13 44 5',
    '5 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 5',
    '5 12 12 12 12 12 12 12 5 12 12 12 12 12 12 12 5',
    '5 12 12 12 12 12 12 12 5 12 12 12 12 12 12 12 5',
    '5 5 5 5 9 5 5 5 5 5 5 5 5 5 5 5 5'].map(r=>r.trim().split(/\s+/).map(Number));
  const lv=gridRoom({id:'keep_chambers',name:'The Royal Chambers',theme:'keep',grid:G,npcs:[],floor:0,blanket:0x22336a,zone:'The Royal Chambers',pal:{cloth:0x22336a,accent:0x22336a,trim:0xe8c766},exit:o.back});
  const R=lv.room, gold=0xe8c766;
  // canopies over the two great beds: posts, a tester and hangings (blue and gold for the King, rose and gold for the Princess)
  [[3.5,4,0x22336a],[11.5,4,0xc86a8a]].forEach(([x,z,c])=>{ const g=group(x,0,z,R); [[-0.55,-1.05],[0.55,-1.05],[-0.55,1.0],[0.55,1.0]].forEach(([a,b])=>{ Cy(0.035,0.04,2.05,8,0x4a2c16,a,0,b,g); Sp(0.05,gold,a,2.1,b,g); });
    const top=B(1.3,0.06,2.25,c,0,2.02,0,g); const hang=(w,ang,px,pz)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,0.32,10,1),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide})); const p=m.geometry.attributes.position; for(let i=0;i<p.count;i++) if(p.getY(i)<0) p.setY(i,p.getY(i)-0.04*Math.abs(Math.sin(p.getX(i)*8))); m.position.set(px,1.86,pz); m.rotation.y=ang; g.add(m); B(w,0.03,0.02,gold,px,1.7,pz,g).rotation.y=ang; };
    hang(1.3,0,0,1.12); hang(1.3,0,0,-1.12); hang(2.25,Math.PI/2,0.65,0); hang(2.25,Math.PI/2,-0.65,0);
    // curtains drawn back along the sides at the head, tied with a gold cord, so the sleeper can be seen from the room
    [[-0.6,-0.72],[0.6,-0.72]].forEach(([a,b])=>{ const cu=new THREE.Mesh(new THREE.PlaneGeometry(0.5,1.7,4,6),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide})); const p=cu.geometry.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i), pinch=1-0.55*Math.exp(-((y+0.1)*(y+0.1))*6); p.setX(i,p.getX(i)*pinch); p.setZ(i,0.04*Math.sin(p.getX(i)*24+y*3)); } cu.position.set(a,1.0,b); cu.rotation.y=Math.PI/2; g.add(cu); Cy(0.03,0.03,0.18,6,gold,a,0.82,b,g).rotation.x=Math.PI/2; }); });
  // the King's guard at the passage door; the two sleepers, who are here only by night
  const gd=addPerson(lv,R,'royalguard',4.5,6.3,0,'Royal Guard',['The King sleeps, Sir Knight. Speak softly, if you must speak at all.'],{rest:Math.PI}); gd.still=true; gd.near=30; gd.lookAbout=0.5; gd.breathe=true; gd.idle='guard';
  const king=addPerson(lv,R,'king',3.5,4.0,0,'King Karl',['Mm. Even a king must rest, knight.'],{rest:0}); king.sleeper=true; king.Z0dayVis=false; king.g.scale.setScalar(1.0);
  const mad=addPerson(lv,R,'madison',11.5,4.0,0,'Princess Madison',['Goodnight, Sir Knight. God keep you.'],{rest:0}); mad.sleeper=true; mad.Z0dayVis=false;
  const isHere=()=>{ const b=(GAME.S&&GAME.S.bounties)||{}; return !b.madisonTaken||(b.madisonRescued&&!GAME.S.homecoming); };
  if(typeof SLEEP!=='undefined') SLEEP.room(lv,{theme:'keep',blanket:0x22336a},lv._items||[]);
  lv.anim.push(()=>{ if(!isHere()&&mad.g.visible){ mad.g.visible=false; mad.mute=true; mad.ghost=true; } });
  return lv; }
