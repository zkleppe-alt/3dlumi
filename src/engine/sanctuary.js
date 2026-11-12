// ════════════════════════════════════════════════════════════════
//  SANCTUARY — any town's cleansed chapel, made a church to stand in: a high nave between two arcades of columns, side aisles,
//  a raised chancel with the altar, the pulpit with the town's sign and an altar rail to kneel at; pews down both sides of a
//  centre aisle; tall lancets throwing coloured light, the rose window over the altar, candle-wheels down the nave.
//  Things to do: kneel at the rail and pray (a verse, and mending), light a votive candle (they stay lit, one for each you've
//  lit here, up to a stand-full), sit in a pew, look into the font, play the organ (the Old Hundredth), toll the bell by the
//  door. The priest teaches from the pulpit; the redeemed general stands before the chancel; Ezra keeps the books.
//  The colours, glass and sign are the town's (SANCT[town]); the people and their words are the game's.
//  sanctuaryLevel(town, {id, exit}) → level
// ════════════════════════════════════════════════════════════════
function sanctuaryLevel(T,spec){
  const S=T.sanct, n=k=>hexn(S[k]), wall=n('wall'), wallL=n('wallL'), wallD=n('wallD'), fA=n('fA'), fB=n('fB'), pew=n('pew'), pewLc=n('pewL'), cloth=n('cloth'), clothL=n('clothL'), glass=S.glass;
  const SW=17, SH=26, CX=8.5, g=[];
  // 12 floor · 15 chancel · 14 step · 17 altar · 13 pew · 58 column · 19 font/stand/organ (solid) · 9 door
  for(let y=0;y<SH;y++){ g.push([]); for(let x=0;x<SW;x++) g[y].push(y===0||y===SH-1||x===0||x===SW-1?5:12); }
  for(let y=1;y<=4;y++) for(let x=1;x<SW-1;x++) g[y][x]=15;
  for(let x=1;x<SW-1;x++) g[5][x]=14;
  for(let x=6;x<=10;x++) g[1][x]=17; for(let x=7;x<=9;x++) g[2][x]=17;
  g[3][5]=19;                                                   // the pulpit
  g[2][14]=19; g[2][15]=19; g[1][14]=19; g[1][15]=19;            // the organ
  for(let y=7;y<=22;y+=3){ g[y][4]=58; g[y][12]=58; }              // the arcades
  for(let y=8;y<=21;y++){ if(y%3===1) continue; for(let x=5;x<=7;x++) g[y][x]=13; for(let x=9;x<=11;x++) g[y][x]=13; }   // the pews
  g[8][2]=19;                                                    // the votive stand, west aisle
  g[22][14]=19;                                                  // the font, by the door
  g[16][14]=19; g[16][15]=19;                                   // Ezra's table of books
  g[SH-1][8]=9;
  const scene=new THREE.Scene(), bg=new THREE.Color(wallD).multiplyScalar(0.18); scene.background=bg; scene.fog=new THREE.Fog(bg,24,52);
  const lv={id:spec.id,name:T.name+' Sanctuary',scene,folk:[],spots:[],anim:[],banner:'The chapel breathes again. Hear the Word; greet the redeemed.',
    interior:true,actorS:0.88,cam:{pitch:0.2,dist:3.0,min:1.5,max:4.8,lookH:0.12}, zone:()=>T.head||''};
  scene.add(new THREE.HemisphereLight(0xfff6e8,0x4a4458,0.62));
  const sKey=new THREE.DirectionalLight(0xf4f0ff,0.32); sKey.position.set(4,14,12); scene.add(sKey);
  const altarL=new THREE.PointLight(0xffd27a,1.3,13,1.4); altarL.position.set(CX,2.6,2.6); scene.add(altarL);
  const naveL=new THREE.PointLight(0xfff2dc,0.5,20,1.2); naveL.position.set(CX,5.6,13); scene.add(naveL);
  const R=group(0,0,0,scene), WH=8, an=lv.anim, ST=()=>GAME.S;
  const fh=(x,y)=>{ const t=g[y]&&g[y][x]; return t===15||t===17||t===19&&y<=4?0.32:t===14?0.16:0; };
  // the floor: flags in two shades, the chancel raised a step and a step
  const cells=[]; for(let y=1;y<SH-1;y++) for(let x=1;x<SW-1;x++) cells.push([x,y]);
  const fg=new THREE.BoxGeometry(0.98,1,0.98); fg.translate(0,0.5,0);
  inst(cells,fg,null,([x,y],m,cc)=>{ const h=fh(x,y)+0.1, chan=y<=5; m.makeScale(1,h,1); m.setPosition(x+0.5,-0.1,y+0.5); cc.setHex(chan?wallL:((x+y)%2?fB:fA)).offsetHSL(0,0,(hsh(x,y)-0.5)*0.03); },R);
  const grout=new THREE.Mesh(new THREE.PlaneGeometry(SW-2,SH-2),new THREE.MeshBasicMaterial({color:new THREE.Color(fB).multiplyScalar(0.7)})); grout.rotation.x=-Math.PI/2; grout.position.set(SW/2,-0.005,SH/2); R.add(grout);
  // the runner up the centre aisle, the chancel carpet
  B(1.0,0.012,SH-7,cloth,CX,0,(SH+5)/2,R); B(0.06,0.014,SH-7,clothL,CX-0.47,0,(SH+5)/2,R); B(0.06,0.014,SH-7,clothL,CX+0.47,0,(SH+5)/2,R);
  B(7,0.012,3.4,cloth,CX,0.32,2.9,R); B(7,0.014,0.06,clothL,CX,0.32,1.2,R); B(7,0.014,0.06,clothL,CX,0.32,4.6,R);
  // the walls, the dado, the cornice
  B(1,WH,SH,wall,0.5,0,SH/2,R); B(1,WH,SH,wall,SW-0.5,0,SH/2,R); B(SW,WH,1,wall,SW/2,0,0.5,R); B(7.5,WH,1,wall,3.75,0,SH-0.5,R); B(7.5,WH,1,wall,SW-3.75,0,SH-0.5,R); B(2,WH-2.6,1,wall,CX,2.6,SH-0.5,R);
  B(1.6,2.55,0.08,pewLc,CX,0,SH-1.06,R); B(0.04,2.4,0.1,0x4a2a18,CX,0,SH-1.04,R); [-0.3,0.3].forEach(dx=>B(0.06,0.06,0.04,clothL,CX+dx,1.1,SH-1.0,R));
  [[1.04,SH/2,0.08,SH-2],[SW-1.04,SH/2,0.08,SH-2]].forEach(([x,z,w,d])=>{ B(w,0.6,d,wallD,x,0,z,R); B(w+0.08,0.14,d,wallL,x,WH-0.3,z,R); });
  B(SW-2,0.6,0.08,wallD,SW/2,0,1.04,R); B(SW-2,0.14,0.16,wallL,SW/2,WH-0.3,1.04,R);
  // the arcades: columns with capitals and bases, round arches between them, the clerestory above
  for(let y=7;y<=22;y+=3) [4.5,12.5].forEach(x=>{ const c=group(x,0,y+0.5,R); Cy(0.3,0.34,WH-2.6,12,wallL,0,0.3,0,c); Cy(0.46,0.46,0.3,12,wallD,0,0,0,c); Cy(0.44,0.32,0.4,12,wallL,0,WH-2.7,0,c); B(0.9,0.12,0.9,wallD,0,WH-2.3,0,c); shade(c); });
  for(let y=7;y<22;y+=3) [4.5,12.5].forEach(x=>{ const a=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.16,6,16,Math.PI),flat(wallL)); a.rotation.y=Math.PI/2; a.position.set(x,WH-2.2,y+2.0); R.add(a); });
  [4.5,12.5].forEach(x=>B(0.5,2.2,SH-8,wall,x,WH-2.2,SH/2+1,R));
  // the vault: a barrel over the nave, ribbed, and lower lean-to roofs over the aisles
  { const r=4, k=0.55; const vg=new THREE.CylinderGeometry(r,r,SH-1,22,1,true,Math.PI/2,Math.PI); vg.rotateX(Math.PI/2); vg.scale(1,k,1); vg.translate(CX,WH,SH/2); R.add(new THREE.Mesh(vg,new THREE.MeshPhongMaterial({color:new THREE.Color(wall).multiplyScalar(0.92).getHex(),flatShading:true,side:THREE.DoubleSide})));
    for(let z=1.5;z<SH-1;z+=3){ const tg=new THREE.TorusGeometry(r-0.05,0.12,4,22,Math.PI); tg.scale(1,k,1); tg.translate(CX,WH,z); R.add(new THREE.Mesh(tg,flat(pew))); }
    B(0.24,0.18,SH-1,pew,CX,WH+r*k-0.14,SH/2,R); [[2.3,1],[SW-2.3,-1]].forEach(([x,s])=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(4.2,0.14,SH),flat(new THREE.Color(wall).multiplyScalar(0.85).getHex())); m.rotation.z=s*0.32; m.position.set(x,WH-1.0,SH/2); R.add(m); }); }
  // the glass: lancets in the outer walls between the columns, two behind the altar, the rose over it, the clerestory row
  const shaftTex=(()=>{ const c=document.createElement('canvas'); c.width=4; c.height=64; const x=c.getContext('2d'); const gr=x.createLinearGradient(0,0,0,64); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,4,64); return new THREE.CanvasTexture(c); })();
  function shaft(x0,z,dir,col){ const geo=new THREE.BufferGeometry(), y0=4.2, x1=x0+dir*5.0, zf=z+1.4, w=0.46;
    geo.setAttribute('position',new THREE.Float32BufferAttribute([x0,y0,z-w, x0,y0,z+w, x1,0.03,zf+w, x1,0.03,zf-w],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,0,1,0,0,0,0],2)); geo.setIndex([0,1,2,0,2,3]);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,map:shaftTex,transparent:true,opacity:0.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); R.add(m);
    an.push(t=>{ const nt=typeof DAYNIGHT!=='undefined'?DAYNIGHT.state().night:0; m.material.opacity=(0.13+0.04*Math.sin(t*0.6+z))*(1-0.85*nt); }); }
  [8.5,11.5,14.5,17.5,20.5].forEach((z,i)=>{ pane(glassTex(glass,i*2,'lancet'),0.9,3.0,1.06,3.4,z,Math.PI/2,R); shaft(1.1,z,1,glass[(i*2)%glass.length]); pane(glassTex(glass,i*2+1,'lancet'),0.9,3.0,SW-1.06,3.4,z,-Math.PI/2,R); shaft(SW-1.1,z,-1,glass[(i*2+7)%glass.length]); });
  [6.5,10.5].forEach((x,i)=>pane(glassTex(glass,3+i*5,'lancet'),1.1,3.8,x,3.4,1.06,0,R));
  pane(glassTex(glass,0,'rose'),2.8,2.8,CX,6.0,1.06,0,R); { const ring=new THREE.Mesh(new THREE.TorusGeometry(1.45,0.1,6,24),flat(wallD)); ring.position.set(CX,6.0,1.07); R.add(ring);
    const gl=new THREE.Mesh(new THREE.CircleGeometry(3.8,24),new THREE.MeshBasicMaterial({color:0xffe8b0,transparent:true,opacity:0.1,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); gl.position.set(CX,4.2,1.12); R.add(gl); }
  for(let z=8;z<SH-2;z+=3) [4.75,12.25].forEach((x,i)=>pane(glassTex(glass,z+i,'lancet'),0.5,1.3,x+(i?-0.26:0.26),WH-1.0,z+1.5,i?-Math.PI/2:Math.PI/2,R));
  // pews
  for(let y=8;y<=21;y++){ if(y%3===1) continue; for(const x0 of [5,9]){ const p=group(x0+1.5,0,y+0.5,R);
    B(2.96,0.1,0.46,pewLc,0,0.42,-0.04,p); B(2.96,0.4,0.06,pew,0,0.1,0.18,p); B(2.96,0.58,0.07,pewLc,0,0.5,0.26,p); B(2.96,0.05,0.1,pew,0,1.08,0.26,p);
    [-1.47,1.47].forEach(ex=>{ B(0.08,0.98,0.62,pew,ex,0,0.05,p); const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.31,0.31,0.08,10,1,false,0,Math.PI),flat(pew)); cap.rotation.set(0,Math.PI/2,Math.PI/2); cap.position.set(ex,0.98,0.05); p.add(cap); });
    if(hsh(x0,y)<0.4) B(0.22,0.05,0.16,cloth,(hsh(y,x0)-0.5)*2,0.52,-0.05,p); shade(p);
    const sx=x0===5?7.85:9.15; lv.spots.push({x:sx,z:y+0.5,r:0.75,label:'Sit',who:'A pew',action:()=>sitAt(x0===5?7.2:9.8,y+0.35,Math.PI,5,'You sit in the quiet. The light moves slowly across the floor.')}); } }
  // the altar: cloth, candles and gold vessels; the altar rail before the chancel with its kneelers
  for(let y=1;y<=2;y++) for(let x=1;x<SW-1;x++){ if(g[y][x]!==17) continue; const a=group(x+0.5,0.32,y+0.5,R);
    B(1,0.92,0.86,wallL,0,0,0,a); B(1.02,0.72,0.88,cloth,0,0.08,0,a); B(1.03,0.1,0.89,clothL,0,0.82,0,a);
    if(x%2===0){ Cy(0.05,0.05,0.42,8,0xf4eee0,0,0.92,0,a); flame(0,1.42,0,a,an); } else { Cy(0.12,0.08,0.06,8,0xe8c25a,0,0.92,0,a); Cy(0.025,0.025,0.16,6,0xe8c25a,0,0.98,0,a); Cy(0.13,0.06,0.16,8,0xf8e08a,0,1.14,0,a); } shade(a); }
  { const cr=group(CX,0.32,1.25,R); B(0.12,1.6,0.08,0xe8c25a,0,0.95,0,cr); B(0.8,0.12,0.08,0xe8c25a,0,1.95,0,cr); }   // the cross over the altar
  [[6.0,2.0],[11.0,2.0]].forEach(([x,z])=>{ const f=group(x,0.32,z,R); Cy(0.16,0.12,0.4,8,0xc9a94a,0,0,0,f); for(let i=0;i<7;i++) Sp(0.08,[0xffffff,0xf4e070,0xe85a7a][i%3],Math.cos(i)*0.12,0.5+((i*3)%4)*0.06,Math.sin(i)*0.12,f,7,5); });   // flowers at the altar
  { for(let x=1.5;x<SW-1;x+=1){ if(Math.abs(x-CX)<1.1) continue; B(0.06,0.7,0.06,pew,x,0.16,5.2,R); } B(6.8,0.08,0.14,pewLc,CX-4.65+0.75,0.86,5.2,R); B(6.8,0.08,0.14,pewLc,CX+4.65-0.75,0.86,5.2,R);
    [CX-2.6,CX+2.6].forEach(x=>{ B(1.2,0.12,0.3,cloth,x,0.16,5.75,R); lv.spots.push({x,z:6.3,r:1.0,label:'Pray',who:'The altar rail',action:()=>pray(x)}); }); }
  an.push(t=>{ altarL.intensity=1.25+Math.sin(t*7)*0.05+Math.sin(t*11.3)*0.04; });
  // the pulpit with the town's sign and the Book open on it
  { const p=group(5.5,0.32,3.5,R); B(0.96,1.12,0.86,pew,0,0,0,p); B(0.76,0.7,0.02,pewLc,0,0.25,0.435,p); B(1.02,0.08,0.92,pewLc,0,1.12,0,p);
    const sg=signRelief(S.sign,cloth,clothL,p); sg.position.set(0,0.62,0.45); const lec=B(0.8,0.06,0.5,pewLc,0,1.22,-0.05,p); lec.rotation.x=0.35; const book=B(0.56,0.04,0.38,0xf4eee0,0,1.28,-0.04,p); book.rotation.x=0.35; shade(p); }
  // the organ: a case of dark wood, its pipes in a fan, the keyboard
  { const o=group(15.0,0.32,1.7,R); B(1.9,1.0,1.2,pew,0,0,0,o); B(1.8,0.1,0.4,0xf4eee0,0,1.0,0.45,o); for(let i=0;i<12;i++) B(0.06,0.04,0.3,i%2?0x1a1a1a:0xf4eee0,-0.82+i*0.15,1.08,0.45,o);
    for(let i=0;i<11;i++){ const h=1.4+Math.sin(i/10*Math.PI)*1.6; Cy(0.07,0.07,h,10,0xd8c890,-0.85+i*0.17,1.0,-0.3,o); Co(0.07,0.12,10,0xd8c890,-0.85+i*0.17,1.0+h,-0.3,o); } B(2.0,0.2,1.3,pew,0,1.0,-0.1,o); shade(o);
    lv.spots.push({x:13.6,z:2.6,r:1.3,label:'Play',who:'The organ',action:()=>organ()}); }
  // the votive stand: a rack of little candles — one more lit for every one you light, and they stay lit
  const votive=[]; { const v=group(2.5,0,8.5,R); B(1.0,0.8,0.5,wallD,0,0,0,v); B(1.1,0.06,0.6,0xc9a94a,0,0.8,0,v); B(1.1,0.06,0.6,0xc9a94a,0,1.05,-0.15,v);
    for(let i=0;i<12;i++){ const x=-0.42+(i%6)*0.17, y=i<6?0.86:1.11, z=i<6?0.12:-0.15; Cy(0.035,0.035,0.08,8,0xc8302a,x,y,z,v); const f=Co(0.018,0.05,5,glow(0xffd27a),x,y+0.1,z,v); f.visible=false; votive.push(f); }
    an.push(t=>votive.forEach((f,i)=>{ if(f.visible) f.scale.y=1+Math.sin(t*12+i*1.3)*0.25; })); shade(v);
    lv.spots.push({x:2.5,z:9.6,r:1.1,label:'Light',who:'The votive candles',action:()=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(`I lit a candle in ${T.name}’s sanctuary, for the people of the town, and stood a while watching it burn.`,{once:'votive:'+T.id}); const s=ST(); s.votives=s.votives||{}; const k=T.id, n=Math.min(12,(s.votives[k]||0)+1); s.votives[k]=n; votive.forEach((f,i)=>f.visible=i<n); GAME.changed();
      UI.toast(n>=12?'🕯 The stand is full of light. Every one of them a prayer.':`🕯 You light a candle (${n} burning here now) and say a prayer for someone far away.`,2200); }}); }
  // the font, by the door: a stone basin of still water
  { const f=group(14.5,0,22.5,R); Cy(0.2,0.3,0.7,8,wallL,0,0,0,f); Cy(0.55,0.35,0.3,12,wallL,0,0.7,0,f); const w=new THREE.Mesh(new THREE.CircleGeometry(0.48,20),new THREE.MeshPhongMaterial({color:0x6a9ac8,shininess:120,specular:0xffffff})); w.rotation.x=-Math.PI/2; w.position.y=0.98; f.add(w); shade(f);
    lv.spots.push({x:13.4,z:22.5,r:1.1,label:'Look',who:'The font',action:()=>ENGINE.speak('The font',['Still water in the stone, the windows trembling in it.','“One Lord, one faith, one baptism, one God and Father of all.” — Ephesians 4:5–6'])}); }
  // the bell-rope by the door
  { B(0.04,3.6,0.04,0xc8b088,3.5,0.9,SH-1.2,R); Sp(0.08,0x8a2a2a,3.5,0.85,SH-1.2,R,8,6);
    lv.spots.push({x:3.5,z:SH-2.0,r:1.0,label:'Toll',who:'The bell-rope',action:()=>{ bell(); UI.toast('🔔 Far above, the bell answers — once, twice, three times — and the town hears it.',2200); }}); }
  // candle-wheels down the nave
  [9.5,14.5,19.5].forEach(z=>{ const c=group(CX,0,z,R); B(0.02,1.6,0.02,0x2a2a2a,0,WH-1.0,0,c); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.8,0.05,6,20),flat(0xc9a94a)); ring.rotation.x=Math.PI/2; ring.position.y=WH-1.6; c.add(ring);
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Cy(0.03,0.03,0.12,6,0xf4eee0,Math.sin(a)*0.8,WH-1.6,Math.cos(a)*0.8,c); flame(Math.sin(a)*0.8,WH-1.4,Math.cos(a)*0.8,c,an,0.9); } });
  // the general's colours hung either side of the chancel arch
  [3.0,14.0].forEach(x=>{ const b=group(x,0,5.2,R); B(0.8,2.0,0.04,hexn(T.generalTint||'#5a3a7a'),0,3.6,0,b); B(0.86,0.06,0.06,0xc9a94a,0,5.6,0,b); B(0.12,0.7,0.05,0xc9a94a,0,4.4,0.03,b); B(0.46,0.12,0.05,0xc9a94a,0,4.8,0.03,b); });
  [[6.0,24.5],[11.0,24.5]].forEach(([x,z])=>{ B(0.42,0.7,0.06,wallD,x,1.0,z+0.47,R); Cy(0.04,0.04,0.25,6,0xf4eee0,x,1.1,z+0.4,R); flame(x,1.42,z+0.4,R,an,0.8); });
  // the people
  let teach=0;
  const pr=addPerson(lv,R,'priest',5.5,4.4,0.32,T.priest,null,{stole:cloth,rest:0}); pr.next=()=>[T.teachings[teach++%T.teachings.length]];
  addPerson(lv,R,'general',10.5,6.6,0.16,T.general,[T.generalLine],{tint:T.generalTint,rest:Math.PI});
  // Ezra at his table of books in the east aisle
  { const t=group(14.5,0,16.0,R); B(1.2,0.08,0.7,pew,0,0.72,0,t); [[-0.5,-0.28],[0.5,-0.28],[-0.5,0.28],[0.5,0.28]].forEach(([a,b])=>B(0.07,0.72,0.07,pew,a,0,b,t)); for(let i=0;i<4;i++){ const bk=B(0.28,0.06,0.2,[0x7a2a22,0x2a4a6a,0x4a5a2a,0x6a4a22][i],-0.3+(i%2)*0.5,0.8+Math.floor(i/2)*0.06,-0.1,t); bk.rotation.y=i*0.4; } shade(t); }
  const ez=addPerson(lv,R,'scribe',14.5,17.1,0,'Ezra the Scribe',['The doctrine you have won is kept here. Study, or browse the wares.'],{rest:Math.PI});
  if(typeof LIBRARY!=='undefined'&&typeof T.id==='number') ez.action=()=>LIBRARY.open(T.id);
  // the things you do here
  const VERSES=['“The LORD bless thee, and keep thee: the LORD make his face shine upon thee, and be gracious unto thee.” — Numbers 6:24–25','“Draw nigh to God, and he will draw nigh to you.” — James 4:8','“Be still, and know that I am God.” — Psalm 46:10','“Cast thy burden upon the LORD, and he shall sustain thee.” — Psalm 55:22'];
  function sitAt(x,z,face,secs,msg){ if(ENGINE.holding) return; const P=ENGINE.P, back={x:P.x,z:P.z}; P.x=x; P.z=z; P.face=face; ENGINE.hold(secs,'sit'); let el=0; const tick=(t,dt)=>{ el+=dt||0.016; P.x=x; P.z=z; P.face=face; if(el>=secs){ an.splice(an.indexOf(tick),1); P.x=back.x; P.z=back.z; } }; an.push(tick); if(msg) UI.toast(msg,1800); }
  function pray(x){ if(typeof JOURNAL!=='undefined') JOURNAL.write(`I knelt at the altar rail in ${T.name}’s sanctuary. Not long ago this chapel was full of darkness; now there is only the light through the glass, and the quiet.`,{once:'pray:'+T.id});
    const s=ST(); s.hp=s.maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed(); ENGINE.hold(2.2,'sit'); ENGINE.speak('You kneel at the rail',[VERSES[Math.floor(Math.random()*VERSES.length)],'You rise with your strength renewed.']); }
  let AC=null; const actx=()=>{ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){ AC=null; } return AC; };
  function organ(){ const A=actx(); if(!A){ UI.toast('🎹 The organ is silent today.',1200); return; } const N={G3:196,D4:293.7,E4:329.6,Fs4:370,G4:392,A4:440,B4:493.9,C5:523.3};
    const tune=[['G4',1],['G4',1],['Fs4',1],['E4',1],['D4',1],['G4',1],['A4',1],['B4',2],['B4',1],['B4',1],['A4',1],['G4',1],['C5',1],['B4',1],['A4',1],['G4',2]];
    let t=A.currentTime+0.1; const out=A.createGain(); out.gain.value=0.12; out.connect(A.destination);
    tune.forEach(([nm,d])=>{ const f=N[nm], len=d*0.5; [1,2,3,4].forEach((h,i)=>{ const o=A.createOscillator(), gg=A.createGain(); o.frequency.value=f*h; gg.gain.setValueAtTime(0.0001,t); gg.gain.linearRampToValueAtTime([0.6,0.3,0.15,0.08][i],t+0.04); gg.gain.setValueAtTime([0.6,0.3,0.15,0.08][i],t+len-0.05); gg.gain.linearRampToValueAtTime(0.0001,t+len); o.connect(gg); gg.connect(out); o.start(t); o.stop(t+len+0.02); });
      const b=A.createOscillator(), bg2=A.createGain(); b.frequency.value=N.G3/2; bg2.gain.value=0.25; b.connect(bg2); bg2.connect(out); b.start(t); b.stop(t+len); t+=len; });
    ENGINE.speak('You play the Old Hundredth',['🎵 Praise God, from whom all blessings flow;','🎵 Praise Him, all creatures here below…']); }
  function bell(){ const A=actx(); if(!A) return; [0,1.4,2.8].forEach(d=>{ const t=A.currentTime+d, g0=A.createGain(); g0.gain.setValueAtTime(0.0001,t); g0.gain.exponentialRampToValueAtTime(0.3,t+0.01); g0.gain.exponentialRampToValueAtTime(0.0001,t+2.6); g0.connect(A.destination);
    [220,440,524,660,880].forEach((f,i)=>{ const o=A.createOscillator(), gg=A.createGain(); o.frequency.value=f; gg.gain.value=[0.5,0.3,0.25,0.15,0.08][i]; o.connect(gg); gg.connect(g0); o.start(t); o.stop(t+2.7); }); }); }
  // the lit votives this town keeps
  lv.onEnter=()=>{ const n=((ST().votives||{})[T.id])||0; votive.forEach((f,i)=>f.visible=i<n); };
  // walking: floor, step, chancel (not the altar, the pulpit, the organ, the font, the stand, the pews or the columns)
  const ok=(x,y)=>{ const t=g[y]&&g[y][x]; return t===9||t===12||t===14||t===15; };
  lv.ground=(x,z)=>fh(Math.floor(x),Math.floor(z));
  lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0,0],[0.22,0],[-0.22,0],[0,0.22],[0,-0.22]]) if(!ok(Math.floor(tx+ox),Math.floor(tz+oz))) return false; if(tz<5.45&&tz>4.95&&Math.abs(tx-CX)>1.0) return false; return true; };   // (the rail: through its gate in the middle)
  lv.clamp=v=>{ v.x=Math.min(SW-1.4,Math.max(1.4,v.x)); v.z=Math.min(SH-1.15,Math.max(1.4,v.z)); v.y=Math.min(WH-0.6,Math.max(0.9,v.y)); };
  lv.camBlock=(x,z,y)=>y>WH+1.5||x<1.2||x>SW-1.2||z<1.2||z>SH-1.1;
  { const panes=[]; R.traverse(o=>{ if(o.isMesh&&o.material&&o.material.map&&o.material.isMeshBasicMaterial&&o.material.blending===THREE.NormalBlending) panes.push(o.material); });
    an.push(()=>{ const nt=typeof DAYNIGHT!=='undefined'?DAYNIGHT.state().night:0; panes.forEach(m=>m.color.setScalar(1-0.62*nt)); sKey.intensity=0.32*(1-nt)+0.05; }); }
  // V96: a leaf of the Greek Scriptures on a lectern in the east aisle (greek.js), one passage to each town
  if(typeof GREEK!=='undefined'){ const pid=GREEK.sanctPassage(T.id); if(pid){ g[10][14]=19; GREEK.place(lv,R,an,14.5,10.5,pid,{y:fh(14,10),r:1.25}); } }
  lv.spawn={x:CX,z:SH-2.5,face:Math.PI,yaw:0};
  lv.spots.push({x:CX,z:SH-1.3,r:1.1,label:'Leave',who:'Leave',auto:[0,1],ar:0.8,action:()=>ENGINE.go(spec.exit.level,spec.exit.spawn)});
  return lv; }
