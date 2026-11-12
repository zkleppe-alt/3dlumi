// ════════════════════════════════════════════════════════════════
//  THRONE HALL — the walkable Stormgate Keep (KLK's buildKeepGrid + drawThroneHall, quiet mode):
//  17×30, centre column cx; pillars and walls at x≤2 / x≥W-3; throne, dais and back wall at y≤7.
//  throneLevel({id, exit, hall:{W,H,cx}, king:{name,lines}, guardLines:[a,b]}) → level
// ════════════════════════════════════════════════════════════════
function throneLevel(spec){
  const W=spec.hall.W, H=spec.hall.H, cx=spec.hall.cx+0.5;
  const gold=0xe8c766, goldL=0xf8e29a, goldD=0xa8842e, blue=0x2f4a8f, blueL=0x5a78c0, red=0x8f2f2f, redL=0xb04a4a, mA=0xdcd6ca, mB=0xcac2b4, stone=0xb8b0a0;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x1a1714); scene.fog=new THREE.Fog(0x1a1714,24,52);
  const lv={id:spec.id,name:'The Throne Hall',scene,folk:[],spots:[],anim:[],interior:true,actorS:0.9,cam:{pitch:0.2,dist:3.4,min:1.8,max:5.5,lookH:0.15},zone:()=>'Stormgate Keep',   // inside the hall, at your shoulder
    banner:'Walk up to the throne to speak with King Karl. Head back down the hall to leave.'};
  scene.add(new THREE.HemisphereLight(0xfff4e0,0x40342a,0.6));
  const sunIn=new THREE.DirectionalLight(0xfff0d8,0.5); sunIn.position.set(-10,16,14); sunIn.target.position.set(cx,0,H/2); sunIn.castShadow=true; sunIn.shadow.mapSize.set(1536,1536);
  Object.assign(sunIn.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:60}); scene.add(sunIn,sunIn.target);
  const R=group(0,0,0,scene), an=lv.anim, WH=7;
  const THRONE_SHAFT=new THREE.MeshBasicMaterial({color:0xfff4d8,transparent:true,opacity:0.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  an.push(()=>{ const st=typeof ROOM_DAY!=='undefined'?ROOM_DAY():{night:0}; THRONE_SHAFT.opacity=0.07*(1-st.night); sunIn.intensity=0.5*(1-st.night)+0.08; });   // the day through the tall windows, gone at night
  // marble in diamonds, gold inlay at the crossings
  const cells=[]; for(let y=0;y<H;y++) for(let x=1;x<W-1;x++) cells.push([x,y]);
  inst(cells,UNIT,null,([x,y],m,cc)=>{ m.makeScale(1,0.1,1); m.setPosition(x+0.5,-0.1,y+0.5); cc.setHex((x+y)%2?mB:mA).offsetHSL(0,0,(hsh(x,y)-0.5)*0.03); },R);
  const studs=cells.filter(([x,y])=>(x+y)%2===0);
  inst(studs,new THREE.BoxGeometry(0.16,0.012,0.16),flat(gold),([x,y],m)=>{ m.makeRotationY(Math.PI/4); m.setPosition(x,0.006,y); },R,true);
  // outer walls and the back wall
  B(1,WH,H,stone,0.5,0,H/2,R); B(1,WH,H,stone,W-0.5,0,H/2,R); B(W,WH,1,stone,W/2,0,0.5,R);
  B(cx-1.2,WH,1,stone,(cx-1.2)/2,0,H-0.5,R); B(W-cx-1.2,WH,1,stone,W-(W-cx-1.2)/2,0,H-0.5,R); B(2.4,WH-3.0,1,stone,cx,3.0,H-0.5,R);   // the hall closed at the foot, the great door in it
  B(2.4,3.0,0.04,new THREE.MeshBasicMaterial({color:0xdfeeff}),cx,0,H-0.02,R); B(2.8,0.3,0.4,goldD,cx,2.95,H-1.05,R); B(0.3,3.1,0.4,goldD,cx-1.35,0,H-1.05,R); B(0.3,3.1,0.4,goldD,cx+1.35,0,H-1.05,R);   // the light of the court beyond, the door's gilt frame
  // the ceiling: coffers of blue between gilt beams, the length of the hall
  B(W,0.12,H,0x2a3460,W/2,WH,H/2,R);
  for(let y=1;y<H;y+=3){ B(W-2,0.3,0.3,goldD,W/2,WH-0.3,y,R); } for(const x of [W/3,2*W/3]) B(0.3,0.3,H-1,goldD,x,WH-0.3,H/2,R);
  for(let y=2.5;y<H-1;y+=3) for(const x of [W/6,W/2,5*W/6]){ const r=B(0.5,0.04,0.5,gold,x,WH-0.05,y,R); r.rotation.y=Math.PI/4; }
  // gilded pillars along both sides, windows of clear and blue glass between them, crowned banners
  for(const px of [2,W-2]) for(let y=2;y<H;y+=4){ const p=group(px,0,y+0.5,R); Cy(0.55,0.6,WH-0.6,10,0xd4ccbc,0,0.3,0,p); Cy(0.75,0.75,0.3,10,goldD,0,0,0,p); Cy(0.7,0.55,0.35,10,gold,0,WH-0.65,0,p);
    [1.6,3.2,4.8].forEach(h=>Cy(0.58,0.58,0.06,10,gold,0,h,0,p)); shade(p); }
  for(const [wx,ry] of [[1.02,Math.PI/2],[W-1.02,-Math.PI/2]]) for(let y=4;y<H-1;y+=4){
    const win=new THREE.Mesh(new THREE.PlaneGeometry(1.4,3.6),typeof ROOM_GLASS!=='undefined'?ROOM_GLASS:new THREE.MeshBasicMaterial({color:0xcfe0f4,fog:false})); win.position.set(wx,3.4,y+0.5); win.rotation.y=ry; R.add(win);
    const lead=new THREE.Mesh(new THREE.PlaneGeometry(0.06,3.6),glow(0x6a7a9a)); lead.position.set(wx+(ry>0?0.01:-0.01),3.4,y+0.5); lead.rotation.y=ry; R.add(lead);
    const shaft=new THREE.Mesh(new THREE.PlaneGeometry(1.2,6),THRONE_SHAFT);
    shaft.position.set(wx+(ry>0?2.4:-2.4),1.6,y+1.3); shaft.rotation.set(-Math.PI/2,0,0); shaft.rotation.y=ry>0?0.5:-0.5; R.add(shaft); }
  for(const bx of [1.5,W-1.5]) for(let y=4;y<H;y+=6){ const b=group(bx+(bx<W/2?0.4:-0.4),0,y+2.6,R); B(0.04,2.2,0.7,blue,0,2.6,0,b); B(0.05,0.08,0.72,gold,0,4.8,0,b); const c=signRelief('crown',gold,gold,b); c.rotation.y=bx<W/2?Math.PI/2:-Math.PI/2; c.position.set(bx<W/2?0.04:-0.04,3.9,0); }
  // the dais: three broadening tiers, red carpet up the steps
  [[4,W-4,4,8,0.2],[5,W-5,3,7,0.4],[6,W-6,1,6,0.6]].forEach(([x0,x1,y0,y1,h])=>{ B(x1-x0,h,y1-y0,0xd8d0c0,(x0+x1)/2,0,(y0+y1)/2,R); B(x1-x0+0.04,0.04,0.06,gold,(x0+x1)/2,h-0.04,y1,R); });
  B(2.2,0.61,6.6,red,cx,0,4.7,R); B(1.6,0.015,H-8,red,cx,0,8+(H-8)/2,R); B(0.08,0.02,H-8,gold,cx-0.84,0,8+(H-8)/2,R); B(0.08,0.02,H-8,gold,cx+0.84,0,8+(H-8)/2,R);
  for(let y=9;y<H;y+=2){ const d=B(0.36,0.02,0.36,redL,cx,0,y+0.5,R); d.rotation.y=Math.PI/4; }
  // the golden throne under its canopy of state; blue backdrop with a great gold crown; red shields
  B(4.2,4.6,0.06,blue,cx,0.6,1.06,R); { const c=signRelief('crown',gold,gold,R); c.scale.setScalar(3); c.position.set(cx,4.3,1.12); }
  { const t=group(cx,0.6,2.2,R); B(1.4,2.4,0.3,gold,0,0,-0.2,t); B(1.0,1.8,0.04,0x3a4e86,0,0.45,-0.03,t); B(1.3,0.5,0.9,goldD,0,0,0.2,t); B(1.1,0.16,0.8,red,0,0.5,0.22,t);
    [-0.68,0.68].forEach(x=>{ B(0.16,0.9,0.85,gold,x,0,0.2,t); Sp(0.1,goldL,x,0.95,0.6,t); }); B(0.1,0.5,0.1,gold,0,2.4,-0.2,t); B(0.36,0.1,0.1,gold,0,2.65,-0.2,t); shade(t); }
  { const c=group(cx,0,2.2,R); B(2.6,0.12,2.0,blue,0,5.0,0,c); for(let i=-1.2;i<=1.21;i+=0.2) B(0.08,0.18,0.04,gold,i,4.82,1.0,c); B(0.06,5.0,0.06,gold,-1.25,0,-0.9,c); B(0.06,5.0,0.06,gold,1.25,0,-0.9,c); }
  [cx-3.4,cx+3.4].forEach(x=>{ const s=group(x,0,1.1,R); B(0.8,0.95,0.06,red,0,2.6,0,s); B(0.4,0.25,0.07,0xe8e2d0,0,3.05,0,s); B(0.82,0.06,0.07,gold,0,3.53,0,s); });
  // alcoves with pale statues in the top corners
  [2.2,W-2.2].forEach(x=>{ const a=group(x,0,1.4,R); B(1.2,3.2,0.3,blue,0,0.8,-0.2,a); Cy(0.25,0.32,0.9,8,0xd9d2c4,0,0.9,0,a); Sp(0.18,0xeae3d6,0,2.0,0,a); Cy(0.4,0.45,0.9,8,0xb8b0a0,0,0,0,a); });
  // braziers on gold stands: flanking the dais top, and the quiet hall's four by the walls
  const braziers=[[cx-3,4],[cx+3,4],[3,12],[W-3,12],[3,20],[W-3,20]];
  braziers.forEach(([x,y],i)=>{ const b=group(x,y<=4?0.2:0,y+0.5,R); Cy(0.05,0.1,1.0,6,goldD,0,0,0,b); Cy(0.28,0.14,0.22,8,gold,0,1.0,0,b);
    const f=Co(0.2,0.4,6,glow(0xffa040),0,1.16,0,b); an.push(t=>{ f.scale.y=1+Math.sin(t*10+i)*0.2; f.rotation.y=t*2; });
    if(i<4){ const l=new THREE.PointLight(0xffa860,0.55,7,1.6); l.position.y=1.6; b.add(l); an.push(t=>{ l.intensity=0.5+Math.sin(t*9+i)*0.06; }); } shade(b); });
  // chandeliers
  [11,19].forEach(y=>{ const c=group(cx,0,y,R); Cy(0.01,0.01,1.6,4,goldD,0,5.4,0,c); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.05,6,20),flat(gold)); ring.rotation.x=Math.PI/2; ring.position.y=5.3; c.add(ring);
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Cy(0.03,0.03,0.14,6,0xf4eee0,Math.sin(a)*0.9,5.33,Math.cos(a)*0.9,c); flame(Math.sin(a)*0.9,5.53,Math.cos(a)*0.9,c,an,0.9); }
    const l=new THREE.PointLight(0xffe0a8,0.5,10,1.5); l.position.y=5; c.add(l); });
  // the tapestries of the ten chapels down both walls: each hangs veiled until its chapel is cleansed, then shows the town's
  //  colours, its cross and its name in gold (CHAPEL_THEMES); kneel at the foot of the dais; a fanfare when you come in
  const TAPS=[]; { const names=[]; for(let i=0;i<10;i++) names.push(typeof CHAPELS!=='undefined'&&CHAPELS[i]&&CHAPELS[i].td?CHAPELS[i].td.name:null);
    const tapTex=(i,open)=>{ const c=document.createElement('canvas'); c.width=96; c.height=160; const x=c.getContext('2d'), th=typeof CHAPEL_THEMES!=='undefined'?CHAPEL_THEMES[i]:null, col=h=>'#'+new THREE.Color(h).getHexString();
      if(!open){ x.fillStyle='#2a2430'; x.fillRect(0,0,96,160); x.fillStyle='#3a3440'; for(let k=0;k<6;k++) x.fillRect(8+k*14,0,4,160); x.fillStyle='#6a6070'; x.font='bold 40px serif'; x.textAlign='center'; x.fillText('?',48,92); return new THREE.CanvasTexture(c); }
      x.fillStyle=th?col(th.banner):'#2f4a8f'; x.fillRect(0,0,96,150); x.beginPath(); x.moveTo(0,150); x.lineTo(48,160); x.lineTo(96,150); x.fill(); const gd=th?col(th.trim):'#e8c766';
      x.fillStyle=gd; x.fillRect(0,0,96,6); x.fillRect(0,0,5,150); x.fillRect(91,0,5,150); x.fillRect(42,28,12,64); x.fillRect(26,44,44,10);
      x.font='bold 13px serif'; x.textAlign='center'; x.fillText(names[i]||('Chapel '+(i+1)),48,118); x.font='11px serif'; x.fillText('cleansed',48,134); return new THREE.CanvasTexture(c); };
    for(let i=0;i<10;i++){ const side=i<5?0:1, y=6+(i%5)*4.2, wx=side?W-1.06:1.06, ry=side?-Math.PI/2:Math.PI/2; const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.0),new THREE.MeshLambertMaterial({map:tapTex(i,false),side:THREE.DoubleSide}));
      m.position.set(wx,3.1,y+0.5); m.rotation.y=ry; R.add(m); B(0.08,0.08,1.3,gold,wx+(side?-0.04:0.04),4.15,y+0.5,R); TAPS.push({m,i,open:false,x:wx,z:y+0.5});
      lv.spots.push({x:side?W-3.4:3.4,z:y+0.5,r:1.6,label:'Look',who:'A tapestry',action:()=>{ const done=(GAME.S.chapels||0)>i; ENGINE.speak(done?'The tapestry of '+(names[i]||'a chapel'):'A veiled tapestry',done?[`Woven in ${names[i]}'s colours, with the cross in gold. Below it, a line of stitched names: the general, and yours.`,'“Thou hast turned for me my mourning into dancing.” — Psalm 30:11']:['Still under its veil. The weavers wait for word that this chapel is cleansed.']); }}); }
    const showTaps=()=>{ const n=GAME.S.chapels||0; TAPS.forEach(t=>{ const o=n>t.i; if(o!==t.open){ t.open=o; t.m.material.map=tapTex(t.i,o); t.m.material.needsUpdate=true; } }); };
    showTaps(); const oe=lv.onEnter; lv.onEnter=sp=>{ showTaps(); fanfare(); if(oe) oe(sp); }; }
  function fanfare(){ try{ const A=window.__klkAC||(window.__klkAC=new (window.AudioContext||window.webkitAudioContext)()); if(A.state==='suspended') A.resume(); let t=A.currentTime+0.15;
    [[392,0.18],[523,0.18],[659,0.18],[784,0.6]].forEach(([f,d])=>{ [1,1.5].forEach((h,i)=>{ const o=A.createOscillator(), g=A.createGain(), fl=A.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=f*(i?1.005:1); fl.type='lowpass'; fl.frequency.value=1800; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.06,t+0.03); g.gain.setValueAtTime(0.06,t+d-0.04); g.gain.linearRampToValueAtTime(0.0001,t+d); o.connect(fl); fl.connect(g); g.connect(A.destination); o.start(t); o.stop(t+d+0.02); }); t+=d; }); }catch(e){} }
  lv.spots.push({x:cx,z:8.7,r:1.2,label:'Kneel',who:'Before the throne',action:()=>{ ENGINE.hold(1.8,'sit'); ENGINE.speak(spec.king.name||'The King',['Rise, knight. Luminar is in your debt — and it is not to me that you owe your strength.','“Fear God. Honour the king.” — 1 Peter 2:17']); }});
  // King Karl on his throne; the halberd guards
  const king=addPerson(lv,R,'king',cx,2.75,0.72,spec.king.name,spec.king.lines,{rest:0,reach:4.4}); king.still=true; king.key='king'; king.reach=5.6; king.g.scale.setScalar(1.06);
  [[cx-2,8,0],[cx+2,8,1],[cx-2,14,0],[cx+2,14,1]].forEach(([x,y,s])=>addPerson(lv,R,'royalguard',x,y+0.5,0,'Royal Guard',[spec.guardLines[s]],{rest:s?-Math.PI/2:Math.PI/2}));
  lv.folk.forEach(f=>{ if(f.who==='Royal Guard') f.still=true; });
  // walking: buildKeepGrid — floor everywhere except the pillar/wall edges and the dais rows
  lv.ground=()=>0;
  lv.canMove=(fx,fz,tx,tz)=>tx>=3.25&&tx<=W-3.25&&tz>=8.2&&tz<=H-0.4;
  lv.clamp=v=>{ v.x=Math.min(W-1.3,Math.max(1.3,v.x)); v.z=Math.min(H-1.2,Math.max(1.5,v.z)); v.y=Math.min(WH-0.5,Math.max(0.8,v.y)); };
  lv.camBlock=(x,z,y)=>y>WH-0.4||x<1.1||x>W-1.1||z>H-1.05||((Math.abs(x-2)<0.7||Math.abs(x-(W-2))<0.7)&&((z-0.5)%4+4)%4>1.3&&((z-0.5)%4+4)%4<2.7);   // the walls, the roof, the pillars
  lv.spawn={x:cx,z:H-2.5,face:Math.PI,yaw:0};
  lv.spots.push({x:cx,z:H-1.2,r:1.4,label:'Leave',who:'Leave',auto:[0,1],ar:0.8,action:()=>ENGINE.go(spec.exit.level,spec.exit.spawn)});
  return lv; }
