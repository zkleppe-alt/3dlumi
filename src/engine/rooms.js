// ════════════════════════════════════════════════════════════════
//  ROOMS — KLK interiors as dollhouse levels (no ceiling, low front wall,
//  camera above the walls). Two ways in, matching the game's two systems:
//    gridRoom(spec)  — INTERIORS floors whose tiles ARE the furniture (homes, barracks):
//                      5 wall · 12 wood · 53 stone · 13 rug · 9 door · 10/11 stairs ·
//                      40 table · 41 chair · 42/43 bed head/foot · 44 bookshelf · 45 fireplace ·
//                      46 counter · 47 cabinet · 48 barrel · 49 plant · 50 dresser · 51 window ·
//                      54 banner · 55 weapon rack · 56 armour stand · 66 footlocker
//    objectRoom(spec)— SI_ROOMS templates (shops, inns): a bare shell plus a list of
//                      [kind, x, y, w, h, solid] objects and [kind, x, w] wall pieces.
//  spec = { id, name, theme, pal, grid|room, npcs, floor, exit:{level,spawn}, stairs:{up,down} }
// ════════════════════════════════════════════════════════════════
const ROOM_PALS={
  home:  {wall:0xe8dcc0,wallD:0x6b4a2e,floorA:0x9a7048,floorB:0x8e663f,cloth:0x9a3a4a,accent:0x2f4a8f,trim:0xe8c766,light:0xffd9a0},
  keep:  {wall:0x9a9aa4,wallD:0x6a6a74,floorA:0x8c8c94,floorB:0x82828a,cloth:0x2f4a8f,accent:0x2f4a8f,trim:0xe8c766,light:0xffe2b0},
  inn:   {wall:0xe4d6b8,wallD:0x5e3e24,floorA:0x8a6038,floorB:0x7e5832,cloth:0x2f4a8f,accent:0x2f4a8f,trim:0xe8c766,light:0xffcf8a},
  shop:  {wall:0xeae4d8,wallD:0x8a7a62,floorA:0xc8ae86,floorB:0xbaa07a,cloth:0x2f4a8f,accent:0x2f4a8f,trim:0xe8c766,light:0xfff0d0}
};
const ACTOR_IN=0.68, PROP_IN=0.76;   // indoors the people are drawn at 0.68 and the furniture at 0.76 of its tile: the same rooms, roomy round them
const WALL_H=2.75;   // indoors the camera stands with you, at your shoulder: the rooms are closed — four walls and a ceiling
const ROOM_HAZE={home:0x3a2a1c,keep:0x2a2a30,inn:0x3a281a,shop:0x3a3226};
const _floorM={}, _wallM={};
const floorMat=k=>_floorM[k]||(_floorM[k]=detailify(new THREE.MeshLambertMaterial(),{mode:k==='keep'?'brick':'plank'}));
const wallMat=k=>_wallM[k]||(_wallM[k]=detailify(new THREE.MeshLambertMaterial(),{mode:k==='keep'?'brick':'plaster'}));
// the windows of a room: their glass lit by the day outside, dark at night — and the sun coming through them in shafts of haze
const ROOM_GLASS=new THREE.MeshBasicMaterial({color:0xcfe6ff}), ROOM_SHAFT=new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:0.07,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const ROOM_DAY=(()=>{ let last=-1; const dayC=new THREE.Color(0xdff0ff), duskC=new THREE.Color(0xffb880), nightC=new THREE.Color(0x1a2448);
  return ()=>{ const st=typeof DAYNIGHT!=='undefined'?DAYNIGHT.state():{night:0,dusk:0,dawn:0}; const k=Math.round((st.night*100+st.dusk*7+st.dawn*3)); if(k===last) return st; last=k;
    ROOM_GLASS.color.copy(dayC).lerp(duskC,Math.max(st.dusk,st.dawn)*0.7).lerp(nightC,st.night); ROOM_SHAFT.opacity=0.075*(1-st.night)*(1-0.4*Math.max(st.dusk,st.dawn)); return st; }; })();
function roomWindow(par,x,z,pal,lv,wide){ const g=group(x,0,z,par), w=wide||0.7;
  B(w,0.9,0.03,ROOM_GLASS,0,1.15,0.01,g); B(w+0.1,0.07,0.08,(pal.frame||pal.wallD),0,1.1,0.04,g); B(w+0.1,0.07,0.08,(pal.frame||pal.wallD),0,2.05,0.04,g); B(0.05,0.9,0.06,(pal.frame||pal.wallD),0,1.15,0.04,g); B(w,0.05,0.05,(pal.frame||pal.wallD),0,1.58,0.04,g);
  B(w+0.24,0.06,0.18,(pal.frame||pal.wallD),0,1.08,0.09,g);   // its sill
  const sh=new THREE.Mesh(new THREE.BoxGeometry(w*0.9,0.85,3.2),ROOM_SHAFT); sh.position.set(0,1.0,1.45); sh.rotation.x=0.42; sh.renderOrder=3; g.add(sh);   // the light falling in
  return g; }
// a lantern on a chain from a beam, its light real
function roomLantern(par,x,z,lv,pal,col){ const g=group(x,0,z,par); Cy(0.008,0.008,0.5,4,0x2a2420,0,WALL_H-0.5,0,g);
  B(0.2,0.04,0.2,0x2a2420,0,WALL_H-0.56,0,g); const gl=B(0.15,0.24,0.15,glow(0xffd27a),0,WALL_H-0.82,0,g); B(0.2,0.04,0.2,0x2a2420,0,WALL_H-0.86,0,g); Co(0.13,0.1,4,0x2a2420,0,WALL_H-0.54,0,g).rotation.y=Math.PI/4;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.02,0.24,0.02,0x2a2420,a*0.08,WALL_H-0.82,b*0.08,g));
  const L=new THREE.PointLight(col||pal.light,0.85,9,1.5); L.position.set(0,WALL_H-0.75,0); g.add(L); const ph=x*1.7+z;
  lv.anim.push(t=>{ L.intensity=(0.8+Math.sin(t*7.3+ph)*0.04+Math.sin(t*13.1+ph)*0.03)*(lv.lampK||1); g.rotation.z=Math.sin(t*0.9+ph)*0.015; });
  if(typeof DAYNIGHT!=='undefined'){ const h=new THREE.Sprite(DAYNIGHT.haloMaterial.clone()); h.material.opacity=0.55; h.scale.setScalar(1.3); h.position.y=WALL_H-0.72; g.add(h); }
  return g; }
// V112 (LOOK2): the rooms inside match the towns outside — each town's walls, floors and timber: Ironhold's dark coursed stone and
//  iron-black beams on flags, Saltmere's whitewash and sea-blue timbers, Thornwood's log walls, Dusthaven's adobe over terracotta
//  tiles, Crystalpeak's lavender stone with crystals glowing in the corners, Stormgate's pale ashlar over a marble chequer,
//  Ashfield's sooty stone with fresh honey timber above, Shadowmere's violet boards with white lamps. Hearthvale and the Homestead
//  keep their timber and plaster. (pal.frame is the beams and trim; pal.wallD stays the furniture's wood.)
const TOWN_ROOM={
  ironhold:{wall:0x6e7078,frame:0x2e2e34,floorA:0x80808a,floorB:0x74747e,floor:'keep',fin:'stone',st:[0x6e7078,0x62646c,0x7a7c84,0x5a5c64,0x686a72],light:0xffc890},
  saltmere:{wall:0xf4f0e6,frame:0x2f6aa8,floorA:0xc8b494,floorB:0xbca888,fin:'plaster'},
  thornwood:{wall:0x6a5040,frame:0x3e2c1a,floorA:0x7a5a3a,floorB:0x6e5034,fin:'log'},
  dusthaven:{wall:0xdcbc8c,frame:0x6a4a2a,floorA:0xa8724e,floorB:0x9c6a48,floor:"keep",fin:"adobe",light:0xffd4a0},
  crystalpeak:{wall:0xa8a4b8,frame:0x3a3448,floorA:0x9a96aa,floorB:0x8e8a9e,floor:'keep',fin:'stone',st:[0xa8a4b8,0x9a96aa,0xb4b0c4,0x8e8a9e,0xa09cb0],crystal:true,light:0xe8f0ff},
  stormgate:{wall:0xe4dfd2,frame:0x4a3a2a,floorA:0xe2dccf,floorB:0xb4ac9e,floor:"keep",fin:"plaster"},
  ashfield:{wall:0xf2e8d2,frame:0xa8845a,floorA:0x9a7a58,floorB:0x8e7050,fin:'half',st:[0x5e5854,0x524c48,0x6a6460,0x48423e,0x605a56]},
  shadowmere:{wall:0x585470,frame:0x2e2a3a,floorA:0x5a5048,floorB:0x504840,fin:'board',light:0xf0f0ff}
};
const _RTP=[['ih_','ironhold'],['sm_','saltmere'],['tw_','thornwood'],['dh_','dusthaven'],['cp_','crystalpeak'],['sg_','stormgate'],['af_','ashfield'],['sh_','shadowmere']];
function roomTown(spec){ const m=/^in:([a-z0-9_]+?):\d+$/.exec(spec.id||''); const b=m?m[1]:''; const hit=_RTP.find(([p])=>b.startsWith(p)); return hit?hit[1]:null; }
function roomFinish(room,inner,T,W,H){ const fin=new THREE.Group(); room.add(fin); let k=0;
  inner.forEach(([x,z,ry])=>{ const g=group(x,0,z,fin); g.rotation.y=ry;
    if(T.fin==='stone'||T.fin==='half'){ const top=T.fin==='half'?1.05:WALL_H-0.16; for(let y=0,r=0;y<top-0.04;r++){ const rh=Math.min(0.24+hsh(r,k)*0.07,top-y); let p=-0.5+(r%2?0.18:0);
        while(p<0.5-0.04){ const sw=Math.min(0.5-p,0.26+hsh(k,r*3)*0.22); k++; if(sw>0.06) B(sw-0.035,rh-0.035,0.05,T.st[(k+r)%T.st.length],p+sw/2,y,0.03,g); p+=sw; } y+=rh; }
      if(T.fin==='half') B(1.0,0.1,0.08,T.frame,0,1.05,0.05,g); }
    else if(T.fin==='log'){ for(let y=0.11;y<WALL_H-0.1;y+=0.21){ const c=Cy(0.105,0.105,1.0,7,[0x6a5040,0x5e4a38,0x725640,0x66503c][(Math.round(y*10)+k++)%4],0,0,0,g); c.rotation.z=Math.PI/2; c.position.set(0,y,0.06); } }
    else if(T.fin==='board'){ for(let y=0;y<WALL_H-0.1;y+=0.17){ const b=B(1.0,0.16,0.04,(Math.round(y*10)+k++)%3?0x585470:0x4c4864,0,y,0.03,g); b.rotation.x=-0.05; } }
    else if(T.fin==='adobe'){ if(hsh(Math.round(x*7),Math.round(z*5))<0.18){ B(0.42,0.5,0.04,0xc4a272,0,1.0,0.02,g); const ar=new THREE.Mesh(new THREE.CircleGeometry(0.21,10,0,Math.PI),new THREE.MeshLambertMaterial({color:0xc4a272})); ar.position.set(0,1.5,0.045); g.add(ar); B(0.5,0.05,0.1,0x2a9a9a,0,0.96,0.06,g); } } });
  fin.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); mergeStatic(fin); }
function roomShell(spec,G){
  const W=G[0].length, H=G.length, theme=spec.theme||'home', TT=typeof LOOK2!=='undefined'&&LOOK2?TOWN_ROOM[roomTown(spec)]:null, pal=Object.assign({},ROOM_PALS[theme]||ROOM_PALS.home,TT?{wall:TT.wall,floorA:TT.floorA,floorB:TT.floorB}:{},TT&&TT.light?{light:TT.light}:{},spec.pal||{}); pal.frame=TT?TT.frame:pal.wallD;
  const haze=new THREE.Color(ROOM_HAZE[theme]||0x3a2a1c);
  const scene=new THREE.Scene(); scene.background=haze.clone().multiplyScalar(0.45); scene.fog=new THREE.Fog(haze.clone().lerp(new THREE.Color(pal.light),0.25),6,Math.max(W,H)*2.2);   // a warm haze in the air
  const lv={id:spec.id,name:spec.name,scene,folk:[],spots:[],anim:[],pal,W,H,G,interior:true,actorS:ACTOR_IN,cam:{pitch:0.24,dist:2.2,min:1.1,max:3.4,lookH:0.07}};
  const hemi=new THREE.HemisphereLight(0xfff0dc,0x4a3828,0.42); scene.add(hemi);
  const key=new THREE.DirectionalLight(0xfff2e0,0.32); key.position.set(W*0.35,WALL_H+5,2); key.target.position.set(W/2,0,H/2); key.castShadow=true; key.shadow.mapSize.set(1024,1024);   // the day through the back windows
  Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:40}); scene.add(key,key.target);
  lv.anim.push(()=>{ const st=ROOM_DAY(); key.intensity=0.34*(1-st.night)+0.04; hemi.intensity=0.2+0.26*(1-st.night); lv.lampK=1+0.35*st.night; });   // at night the lanterns carry the room
  const room=group(0,0,0,scene); lv.room=room;
  const perim=(x,y)=>x===0||y===0||x===W-1||y===H-1, isWall=(x,y)=>{ const t=G[y]&&G[y][x]; return t===5||(perim(x,y)&&(t===45||t===51||t===54)); };
  // floor: planks (flags in the keep), each board its own shade
  const fl=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x]; if(isWall(x,y)&&perim(x,y)) continue; fl.push([x,y,t]); }
  inst(fl,UNIT,floorMat(TT&&TT.floor||theme),([x,y,t],m,cc)=>{ m.makeScale(1,0.1,1); m.setPosition(x+0.5,-0.1,y+0.5);
    cc.setHex(t===53?((x+y)%2?0x8c8c94:0x80808a):((x+y)%2?pal.floorA:pal.floorB)).offsetHSL(0,0,(hsh(x,y)-0.5)*0.05); },room);
  // walls: full height all round (the partitions too), plaster over a timber frame
  const wl=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(isWall(x,y)) wl.push([x,y]);
  inst(wl,UNIT,wallMat(TT&&TT.fin==='stone'?'keep':theme),([x,y],m,cc)=>{ m.makeScale(1,WALL_H,1); m.setPosition(x+0.5,0,y+0.5); cc.setHex(pal.wall).offsetHSL(0,0,(hsh(x,y)-0.5)*0.03); },room).castShadow=false;   // (the day comes in through the windows: the walls themselves throw no shade across the floor)
  // the frame and the trim on the inside faces: a wainscot of boards low down, posts, a beam along the top; the ceiling of
  //  planks on beams across the room
  const frame0=room.children.length;
  const inner=[]; for(let x=1;x<W-1;x++){ if(isWall(x,0)) inner.push([x+0.5,1.0,0]); if(isWall(x,H-1)) inner.push([x+0.5,H-1,Math.PI]); }
  for(let y=1;y<H-1;y++){ if(isWall(0,y)) inner.push([1.0,y+0.5,Math.PI/2]); if(isWall(W-1,y)) inner.push([W-1,y+0.5,-Math.PI/2]); }
  const FR=pal.frame, wains=!TT||TT.fin==='plaster'||TT.fin==='adobe';
  inner.forEach(([x,z,ry],i)=>{ const g=group(x,0,z,room); g.rotation.y=ry; if(wains){ B(1.0,0.6,0.04,TT&&TT.fin==='adobe'?0xc4a272:FR,0,0,0.02,g); B(1.0,0.06,0.07,FR,0,0.6,0.03,g); }
    if(i%3===0&&(!TT||TT.fin!=='log')){ B(0.14,WALL_H,0.1,FR,0.5,0,0.05,g); } B(1.0,0.16,0.12,FR,0,WALL_H-0.16,0.06,g); });
  if(TT) roomFinish(room,inner,TT,W,H);
  B(W,0.05,H,new THREE.MeshLambertMaterial({color:new THREE.Color(FR).lerp(new THREE.Color(pal.floorB),0.4).getHex()}),W/2,WALL_H,H/2,room);   // the ceiling boards
  for(let x=2;x<W-1;x+=2) B(0.16,0.2,H-2,FR,x,WALL_H-0.2,H/2,room);                                                                    // its beams
  B(W-2,0.22,0.24,FR,W/2,WALL_H-0.42,H/2,room);
  if(TT&&TT.crystal){ const cm=new THREE.MeshLambertMaterial({color:0xb8f0ff,emissive:0x2a7a9a,transparent:true,opacity:0.86}); [[1.15,1.15],[W-1.15,1.15]].forEach(([cx,cz],j)=>{ const cg=group(cx,0,cz,room);
      for(let i=0;i<5;i++){ const hh=0.3+hsh(j,i)*0.4, m=new THREE.Mesh(new THREE.OctahedronGeometry(0.12,0),cm); m.scale.set(1,hh/0.12*0.5,1); m.position.set((hsh(i,j)-0.5)*0.3,hh*0.5,(hsh(j+3,i)-0.5)*0.3); m.rotation.set((hsh(i,7)-0.5)*0.6,i,(hsh(i+5,j)-0.5)*0.6); cg.add(m); }
      const L=new THREE.PointLight(0x8ae0ff,0.35,4,1.6); L.position.y=0.6; cg.add(L); }); }                                                                                       // the ridge beam
  room.traverse(o=>{ if(o.isMesh&&o.position.y>WALL_H-1) o.castShadow=false; }); room.children.slice(frame0).forEach(o=>o.traverse(m=>{ if(m.isMesh) m.castShadow=false; }));
  lv.ground=()=>0;
  const inX=v=>Math.min(W-1.18,Math.max(1.18,v)), inZ=v=>Math.min(H-1.18,Math.max(1.18,v));
  lv.clamp=v=>{ v.x=inX(v.x); v.z=inZ(v.z); v.y=Math.max(0.55,Math.min(WALL_H-0.3,v.y)); };
  lv.camBlock=(x,z,y)=>y>WALL_H-0.25||isWall(Math.floor(x),Math.floor(z));   // the camera stays in the room: a wall between, and it pulls in
  lv.zone=()=>spec.zone||'';
  // the way out, and stairs between floors; the doorway shows the light outside
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x];
    if(t===9&&(x===0||G[y][x-1]!==9)&&spec.exit){ const w=G[y][x+1]===9?2:1; B(w*0.9,0.02,0.6,pal.cloth,x+w/2,0,y+0.3,room);
      if(y===H-1){ const DH=1.7; B(w,DH,0.02,ROOM_GLASS,x+w/2,0,y+0.95,room); B(w+0.3,0.16,0.2,(pal.frame||pal.wallD),x+w/2,DH,y+0.85,room); B(0.14,DH+0.1,0.2,(pal.frame||pal.wallD),x-0.04,0,y+0.85,room); B(0.14,DH+0.1,0.2,(pal.frame||pal.wallD),x+w+0.04,0,y+0.85,room);
        B(w,WALL_H-DH-0.1,1,pal.wall,x+w/2,DH+0.1,y+0.5,room); }   // the lintel and the wall above the door
      lv.spots.push({x:x+w/2,z:y-0.2,r:1.1,label:'Leave',who:'Leave',auto:[0,1],ar:0.75,action:()=>ENGINE.go(spec.exit.level,spec.exit.spawn)});   // walk out through the door to leave
      if(!lv.spawn) lv.spawn={x:x+w/2,z:y-1.5,face:Math.PI,yaw:0}; }
    if(t===10&&spec.stairs&&spec.stairs.up){ stairsUp(room,x,y,pal); const s=spec.stairs.up; lv.spots.push({x:x+0.5,z:y+1.2,r:1.0,label:'Upstairs',who:'Upstairs',action:()=>ENGINE.go(s.level,s.spawn)}); lv.upAt={x:x+0.5,z:y+1.6}; }
    if(t===11&&spec.stairs&&spec.stairs.down){ stairsDown(room,x,y,pal); const s=spec.stairs.down; lv.spots.push({x:x+0.5,z:y+1.2,r:1.0,label:'Downstairs',who:'Downstairs',action:()=>ENGINE.go(s.level,s.spawn)}); lv.downAt={x:x+0.5,z:y+1.6}; } }
  // the lanterns: one to every few paces of floor, hung from the beams (four at most: they are real lights)
  { const nx=Math.max(1,Math.min(2,Math.round((W-2)/6))), nz=Math.max(1,Math.min(2,Math.round((H-2)/6)));
    for(let a=0;a<nx;a++) for(let b=0;b<nz;b++){ let lx=1+(W-2)*(a+0.5)/nx, lz=1+(H-2)*(b+0.5)/nz; lx=Math.round(lx/2)*2; if(isWall(Math.floor(lx),Math.floor(lz))) continue; roomLantern(room,lx,lz,lv,pal); } }
  lv.shellN=room.children.length; return lv; }
// the furniture drawn to the people's size: each piece shrunk about its foot (its place on the floor stays), the shell untouched
function propsToScale(lv){ const r=lv.room; r.children.slice(lv.shellN||0).forEach(c=>{ if(c.userData.castK||c.userData.keepScale) return; c.scale.multiplyScalar(PROP_IN); c.position.y*=PROP_IN; });
  if(typeof LOOK2!=='undefined'&&LOOK2) r.children.slice(lv.shellN||0).forEach(c=>{ let inst=false; c.traverse(o=>{ if(o.isInstancedMesh||o.isSkinnedMesh) inst=true; }); if(!inst&&!c.userData.castK) soften(c); }); }   // V112: the furniture rounded like the rest
function stairsUp(par,x,y,pal){ for(let i=0;i<5;i++) B(0.9,0.22*(i+1),0.2,i%2?pal.floorA:pal.floorB,x+0.5,0,y+0.95-i*0.2,par); B(0.06,1.4,1,pal.wallD,x+0.05,0,y+0.5,par); }
function stairsDown(par,x,y,pal){ B(0.9,0.02,0.9,0x1a1410,x+0.5,0,y+0.5,par); for(let i=0;i<3;i++) B(0.86,0.05,0.18,pal.floorB,x+0.5,-0.05-i*0.05,y+0.2+i*0.25,par);
  B(1,0.7,0.06,pal.wallD,x+0.5,0,y+1.0,par); }
// shared props: the sculpted furniture (props3d.js) where it's loaded, the older block-built pieces otherwise
const P3=(name,pal,extra)=>typeof PROPS3D!=='undefined'&&PROPS3D.ready?PROPS3D.make(name,PROPS3D.palette(pal,extra)):null;
const PROP0={};
const PROP={
  table(par,x,z,w,d,pal){ const g=group(x,0,z,par); B(w-0.1,0.08,d-0.1,pal.wallD,0,0.62,0,g); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.07,0.62,0.07,pal.wallD,a*(w/2-0.15),0,b*(d/2-0.15),g));
    if(w*d>0.9){ Cy(0.05,0.05,0.14,6,0xf4eee0,0,0.7,0,g); } else Cy(0.07,0.06,0.1,8,0x8a6a42,0.1,0.7,0.1,g); return g; },
  chair(par,x,z,face,pal){ const g=group(x,0,z,par); g.rotation.y=face; B(0.4,0.06,0.4,pal.wallD,0,0.4,0,g); B(0.4,0.5,0.06,pal.wallD,0,0.46,-0.18,g); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.05,0.4,0.05,pal.wallD,a*0.16,0,b*0.16,g)); return g; },
  bed(par,x,z,len,pal,blanket){ const g=group(x,0,z,par); B(0.86,0.3,len-0.06,pal.wallD,0,0,0,g); B(0.8,0.14,len-0.16,0xf4eee0,0,0.3,0,g); B(0.82,0.08,len*0.62,blanket||pal.cloth,0,0.42,len*0.17,g);
    B(0.56,0.1,0.26,0xffffff,0,0.44,-len/2+0.24,g); B(0.9,0.75,0.08,pal.wallD,0,0,-len/2+0.02,g); return g; },
  barrel(par,x,z){ const g=group(x,0,z,par); Cy(0.27,0.24,0.75,10,0x7a5432,0,0,0,g); [0.12,0.6].forEach(y=>Cy(0.285,0.285,0.05,10,0x3a3a40,0,y,0,g)); return g; },
  plant(par,x,z){ const g=group(x,0,z,par); Cy(0.2,0.15,0.35,8,0xa0583a,0,0,0,g); const l=new THREE.Mesh(new THREE.IcosahedronGeometry(0.34,0),flat(0x3f8a4e)); l.position.y=0.62; g.add(l); return g; },
  palm(par,x,z){ const g=group(x,0,z,par); Cy(0.24,0.18,0.4,8,0xd8c8a8,0,0,0,g); Cy(0.04,0.05,0.9,6,0x7a5a32,0,0.35,0,g);
    for(let i=0;i<6;i++){ const f=B(0.12,0.03,0.6,0x3f8a4e,0,1.2,0.25,group(0,0,0,g)); f.parent.rotation.y=i*Math.PI/3; f.rotation.x=0.45; } return g; },
  shelf(par,x,z,w,face,pal,books){ const g=group(x,0,z,par); g.rotation.y=face||0; B(w-0.05,2.0,0.36,pal.wallD,0,0,0,g);
    for(let r=0;r<4;r++){ B(w-0.15,0.04,0.3,0x4a3220,0,0.3+r*0.45,0.03,g); if(books!==false) for(let i=0;i<Math.floor((w-0.2)/0.09);i++){ const c=[0x8a2a2a,0x2a4a8a,0x3a6a3a,0x8a6a2a,0x5a3a6a][(i+r*3)%5]; B(0.07,0.28+((i*7+r)%3)*0.04,0.22,c,-w/2+0.14+i*0.09,0.34+r*0.45,0.05,g); } } return g; },
  counter(par,x,z,w,pal,top){ const g=group(x,0,z,par); B(w,0.95,0.7,pal.wallD,0,0,0,g); B(w+0.06,0.07,0.78,top||pal.trim,0,0.95,0,g); B(w-0.1,0.5,0.02,pal.accent,0,0.25,0.36,g); return g; },
  chest(par,x,z,pal){ const g=group(x,0,z,par); B(0.7,0.4,0.45,0x6a4424,0,0,0,g); B(0.72,0.04,0.47,0x3a3a40,0,0.32,0,g); B(0.08,0.1,0.02,pal.trim,0,0.22,0.235,g); return g; }
};
// the sculpted pieces over the old: the same footprint and facing, a good deal more to look at
Object.assign(PROP0,PROP);
Object.assign(PROP,{
  table(par,x,z,w,d,pal){ const top=P3('table_top',pal); if(!top) return PROP0.table(par,x,z,w,d,pal); const g=group(x,0,z,par); top.scale.set(Math.max(0.6,w-0.08),1,Math.max(0.6,d-0.08)); g.add(top);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ const l=P3('table_leg',pal); l.position.set(a*(w/2-0.16),0,b*(d/2-0.16)); g.add(l); });
    const h=hsh(Math.floor(x*3),Math.floor(z*3)), set=(n,dx,dz,ry)=>{ const o=P3(n,pal); if(o){ o.position.set(dx,0.68,dz); o.rotation.y=ry||0; g.add(o); } return o; };
    if(w*d>0.9){ const c=set('candle',0,0); if(c) flameAt(c,0,0.17,0); set('plate',-w*0.25,d*0.18,h*6); set('mug',w*0.22,-d*0.15,h*9); if(w>1.5){ set('plate',w*0.3,d*0.2,h*3); set('bottle',-w*0.18,-d*0.2); } }
    else { set('mug',0.12,0.1,h*6); if(h>0.5) set('plate',-0.12,-0.08,h*4); }
    return g; },
  chair(par,x,z,face,pal){ const c=P3('chair',pal); if(!c) return PROP0.chair(par,x,z,face,pal); const g=group(x,0,z,par); g.rotation.y=face; g.add(c); return g; },
  bed(par,x,z,len,pal,blanket){ const b=P3('bed',pal,{quilt:blanket||pal.cloth}); if(!b) return PROP0.bed(par,x,z,len,pal,blanket); const g=group(x,0,z,par); b.scale.z=len/1.9; g.add(b); return g; },
  barrel(par,x,z){ const b=P3('barrel',ROOM_PALS.inn); if(!b) return PROP0.barrel(par,x,z); const g=group(x,0,z,par); g.rotation.y=hsh(Math.floor(x*5),Math.floor(z*5))*6; g.add(b); return g; },
  shelf(par,x,z,w,face,pal,books){ const b=P3('bookcase',pal); if(!b) return PROP0.shelf(par,x,z,w,face,pal,books); const g=group(x,0,z,par); g.rotation.y=face||0; b.scale.x=w; g.add(b); return g; },
  counter(par,x,z,w,pal,top){ if(!P3('table_leg',pal)) return PROP0.counter(par,x,z,w,pal,top); const g=group(x,0,z,par), n=Math.max(1,Math.round(w));
    for(let i=0;i<n;i++){ const c=P3('counter',pal,top?{woodL:top}:null); c.scale.x=w/n; c.position.x=-w/2+(i+0.5)*w/n; g.add(c); } return g; },
  chest(par,x,z,pal){ const c=P3('chest',pal); if(!c) return PROP0.chest(par,x,z,pal); const g=group(x,0,z,par); g.add(c); return g; }
});
function flameAt(o,x,y,z){ const f=new THREE.Mesh(new THREE.ConeGeometry(0.018,0.05,6),glow(0xffd27a)); f.position.set(x,y,z); o.add(f); return f; }
function faceTo(x,z,tx,tz){ return Math.atan2(tx-x,tz-z); }
function cleanLines(lines){ const l=(lines||[]).filter(s=>!/^\(.*\)$/.test(String(s).trim())); return l.length?l:['…']; }
function placeNpcs(lv,npcs,floor){ (npcs||[]).filter(n=>(n.floor||0)===floor).forEach(n=>{
  const look=n.look==='vill'?'vill':(n.look||(n.king?'king':n.royalguard?'royalguard':'peasant'));
  const f=addPerson(lv,lv.room,look,n.x+0.5,n.y+0.5,0,n.name,cleanLines(n.lines),{outfit:n.voutfit,her:n.her,rest:0,reach:n.reach||0}); f.key=lv.id.replace(/^in:/,'')+':'+n.x+','+n.y;
  f.rest=faceTo(f.x,f.z,lv.W/2,lv.H-1); }); }

// ── tile-coded rooms ──
function gridRoom(spec){ if(typeof HOMESTEAD!=='undefined') spec=HOMESTEAD.pre(spec);   // the farmhouse, furnished for real
  const G=spec.grid, lv=roomShell(spec,G), {W,H,room,pal}=lv, at=(x,y)=>G[y]&&G[y][x];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x], cx=x+0.5, cz=y+0.5;
    switch(t){
      case 13: B(0.98,0.015,0.98,pal.cloth,cx,0,cz,room); if(at(x,y-1)!==13) B(0.98,0.018,0.06,pal.trim,cx,0,y+0.04,room); if(at(x,y+1)!==13) B(0.98,0.018,0.06,pal.trim,cx,0,y+0.96,room); break;
      case 40: PROP.table(room,cx,cz,1,1,pal); break;
      case 41: { const tt=[[1,0],[-1,0],[0,1],[0,-1]].find(([a,b])=>at(x+a,y+b)===40)||[0,-1]; PROP.chair(room,cx,cz,Math.atan2(tt[0],tt[1]),pal); break; }
      case 42: PROP.bed(room,cx,y+(at(x,y+1)===43?1:0.5),at(x,y+1)===43?1.9:0.95,pal,spec.blanket); break;
      case 44: PROP.shelf(room,cx,y+0.3,0.95,0,pal); break;
      case 45: { const g=group(cx,0,y+1.2,room), hc=P3('hearth',pal); if(hc){ hc.position.z=-0.02; g.add(hc); } else { B(1.0,1.1,0.4,0x8a8a90,0,0,0,g); B(0.62,0.62,0.06,0x1a1410,0,0.1,0.2,g); B(1.15,0.12,0.5,pal.wallD,0,1.1,0,g); }
        const fire=Co(0.18,0.34,6,glow(0xffa040),0,0.12,0.12,g); lv.anim.push(t=>{ fire.scale.y=1+Math.sin(t*11)*0.2; }); const fl=new THREE.PointLight(0xffa050,0.7,6,1.6); fl.position.set(0,0.6,0.6); g.add(fl);
        lv.anim.push(t=>{ fl.intensity=0.6+Math.sin(t*9)*0.08+Math.sin(t*14.3)*0.06; }); break; }
      case 46: PROP.counter(room,cx,cz,1,pal); break;
      case 47: { const g=group(cx,0,y+0.35,room), c=P3('cabinet',pal); if(c){ g.add(c); break; } B(0.9,1.5,0.5,pal.wallD,0,0,0,g); B(0.02,1.3,0.02,0x2a1a10,0,0.1,0.26,g); B(0.06,0.06,0.03,pal.trim,0.1,0.75,0.26,g); break; }
      case 48: PROP.barrel(room,cx,cz); break;
      case 49: PROP.plant(room,cx,cz); break;
      case 50: { const g=group(cx,0,y+0.35,room), c=P3('dresser',pal); if(c){ g.add(c); const b=P3('bottle',pal); if(b){ b.position.set(0.28,0.92,0); g.add(b); } break; } B(0.9,0.9,0.5,pal.wallD,0,0,0,g); [0.25,0.6].forEach(h=>B(0.8,0.02,0.02,0x2a1a10,0,h,0.26,g)); Cy(0.08,0.06,0.18,8,0xc0d0e0,0.25,0.9,0,g); break; }
      case 51: { if(y===0) roomWindow(room,cx,y+1.0,pal,lv); else { const g=group(cx,0,y+1.0,room); B(0.7,0.9,0.03,ROOM_GLASS,0,1.0,0.01,g); B(0.8,0.06,0.06,pal.wallD,0,0.97,0.03,g); B(0.8,0.06,0.06,pal.wallD,0,1.9,0.03,g); } break; }
      case 54: { const g=group(cx,0,y+1.0,room); B(0.6,1.2,0.03,pal.accent,0,0.9,0.03,g); B(0.62,0.06,0.04,pal.trim,0,2.1,0.03,g); const r=signRelief(spec.sign||'crown',pal.trim,pal.trim,g); r.position.set(0,1.55,0.06); break; }
      case 55: { const g=group(cx,0,cz,room); B(0.9,0.08,0.12,pal.wallD,0,0.9,-0.2,g); B(0.08,1.0,0.08,pal.wallD,-0.4,0,-0.2,g); B(0.08,1.0,0.08,pal.wallD,0.4,0,-0.2,g);
        [-0.25,0,0.25].forEach(x2=>{ const s=B(0.05,1.3,0.02,0xd8dce4,x2,0.05,-0.12,g); s.rotation.x=-0.1; B(0.18,0.04,0.05,0xc9a94a,x2,1.0,-0.14,g); }); break; }
      case 56: { const g=group(cx,0,cz,room); Cy(0.04,0.04,1.2,6,pal.wallD,0,0,0,g); Cy(0.2,0.25,0.6,7,0xc9cdd6,0,0.7,0,g); Cy(0.16,0.15,0.28,8,0xc9cdd6,0,1.32,0,g); B(0.2,0.04,0.04,0x1a2740,0,1.45,0.14,g); Cy(0.25,0.25,0.06,8,pal.wallD,0,0,0,g); break; }
      case 66: PROP.chest(room,cx,cz,pal); break;
      // Robby's hole: crates, the bed, the television, the console on its shelf, pizza boxes, the card table
      case 59: B(0.72,0.62,0.72,0x9a7a48,cx,0,cz,room); B(0.74,0.06,0.06,0x6a5030,cx,0.3,cz+0.36,room); break;
      case 61: if(at(x,y+1)===62) PROP.bed(room,cx,y+1,1.9,pal,0x6a2a3a); else PROP.bed(room,cx,cz,0.95,pal,0x6a2a3a); break;
      case 70: { const g=group(cx,0,y+0.45,room); B(0.8,0.5,0.4,0x3a3a40,0,0,0,g); const sc=B(0.92,0.62,0.12,0x18181c,0,0.55,0,g); const im=B(0.8,0.5,0.02,glow(0x6a9ad8),0,0.61,0.07,g);
        lv.anim.push(t=>{ im.material=glow([0x6a9ad8,0x8ab0e0,0x5a8ac8,0x9ac0f0][Math.floor(t*3+x)%4]); }); break; }
      case 71: { const g=group(cx,0,y+0.4,room); B(0.85,0.55,0.4,0x5a3a22,0,0,0,g); B(0.42,0.12,0.24,0x2a2a30,0,0.55,0,g); B(0.12,0.16,0.2,0xc8402e,-0.27,0.55,0,g); B(0.12,0.16,0.2,0x3a6ad8,0.27,0.55,0,g); B(0.3,0.06,0.04,glow(0x6af0a0),0,0.6,0.13,g); break; }
      case 72: { const g=group(cx,0,cz,room); [[0,0,0],[0.08,0.08,0.3],[-0.05,0.16,-0.2]].forEach(([dx,y2,r])=>{ const b=B(0.5,0.06,0.5,0xc8a070,dx,y2,0,g); b.rotation.y=r; }); break; }
      case 73: { if(at(x-1,y)===73||at(x,y-1)===73) break; const g=group(x+1,0,y+1,room); Cy(0.9,0.9,0.08,16,0x2a6a3a,0,0.72,0,g); Cy(0.95,0.95,0.06,16,0x5a3a22,0,0.68,0,g); Cy(0.12,0.2,0.68,8,0x4a3020,0,0,0,g);
        [[0.4,0.2,0xc8402e],[-0.3,0.3,0xf4f4f4],[0.1,-0.4,0x3a6ad8]].forEach(([a,b2,c])=>Cy(0.06,0.06,0.08,10,c,a,0.8,b2,g)); B(0.16,0.01,0.22,0xf4f1e8,-0.2,0.81,-0.1,g); break; }
    } }
  const solid=new Set([5,40,41,42,43,44,45,46,47,48,49,50,51,54,55,56,66,59,62,70,71,73]);
  lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0.2,0],[-0.2,0],[0,0.2],[0,-0.2]]){ const t=at(Math.floor(tx+ox),Math.floor(tz+oz)); if(t===undefined||solid.has(t)) return false; } return true; };
  propsToScale(lv); placeNpcs(lv,spec.npcs,spec.floor||0); landings(lv);
  if(typeof ROOMLIFE!=='undefined'){ const items=[], K={40:'table',44:'shelf',45:'hearth',47:'cabinet',48:'barrel',49:'plant',50:'dresser',51:'window',55:'rack',56:'armour',66:'chest',59:'crate'};
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=G[y][x], cx=x+0.5, cz=y+0.5;
      if(t===41){ const tt=[[1,0],[-1,0],[0,1],[0,-1]].find(([a,b])=>at(x+a,y+b)===40)||[0,-1]; items.push({k:'chair',x:cx,z:cz,face:Math.atan2(tt[0],tt[1])}); }
      else if(t===42) items.push({k:'bed',x:cx,z:y+(at(x,y+1)===43?1:0.5)});
      else if(t===51) items.push({k:'window',x:cx,z:y===0?y+1.0:cz});
      else if(t===45) items.push({k:'hearth',x:cx,z:y+0.6});
      else if(t===44) items.push({k:'shelf',x:cx,z:y+0.3});
      else if(K[t]) items.push({k:K[t],x:cx,z:cz}); }
    try{ if(typeof HOMESTEAD!=='undefined') items.push(...HOMESTEAD.post(lv,spec)); ROOMLIFE(lv,spec,items); }catch(e){ console.warn('roomlife',e); } }
  return lv; }
// a stair's landing must be floor you can stand on: the nearest open cell to the stair, in front of it if it can be
function landings(lv){ ['upAt','downAt'].forEach(k=>{ const p=lv[k]; if(!p||lv.canMove(p.x,p.z,p.x,p.z)) return; const sx=Math.floor(p.x), sy=Math.floor(p.z-1.6); let best=null, bd=99;
  for(let y=sy-2;y<=sy+3;y++) for(let x=sx-2;x<=sx+2;x++){ const cx=x+0.5, cz=y+0.5; if(!lv.canMove(cx,cz,cx,cz)) continue; const d=Math.hypot(x-sx,(y-sy-1)*0.8); if(d<bd&&(x!==sx||y!==sy)){ bd=d; best={x:cx,z:cz}; } }
  if(best) lv[k]=best; }); }

// ── object-list rooms (shops and inns) ──
function siGrid(R){ const g=[]; for(let y=0;y<R.H;y++){ g.push([]); for(let x=0;x<R.W;x++) g[y].push(y===0||y===R.H-1||x===0||x===R.W-1?5:12); }
  (R.door||[]).forEach(x=>g[R.H-1][x]=9); (R.stairs||[]).forEach(([x,y,t])=>g[y][x]=t);
  if(R.rooms){ for(let y=1;y<=4;y++) for(const x of [5,10,13]) g[y][x]=5; for(let x=1;x<=13;x++) if(![2,7,11].includes(x)) g[5][x]=5; }
  return g; }
function objectRoom(spec){ if(typeof ROOMSTYLE_EXTRA!=='undefined') spec=ROOMSTYLE_EXTRA(spec);   // the shared templates, filled out for 3D
  const R=spec.room, G=siGrid(R), lv=roomShell(spec,G), {room,pal}=lv, solid=G.map(r=>r.map(t=>t===5));
  const tables=R.objs.filter(o=>o[0]==='table'||o[0]==='btable').map(([k,x,y,w,h])=>({x:x+(w||1)/2,z:y+(h||1)/2}));
  R.objs.forEach(([k,x,y,w,h,s])=>{ w=w||1; h=h||1; const cx=x+w/2, cz=y+h/2;
    if(s!==0) for(let j=0;j<h;j++) for(let i=0;i<w;i++) if(solid[y+j]) solid[y+j][x+i]=true;
    const O=OBJECTS[k]; if(O) O(room,{x,y,w,h,cx,cz,pal,lv,tables,spec}); });
  (R.wall||[]).forEach(([k,x,w])=>{ const O=WALL_PIECES[k]; if(O) O(room,{x,w:w||1,cx:x+(w||1)/2,pal,lv,spec}); });
  lv.canMove=(fx,fz,tx,tz)=>{ for(const [ox,oz] of [[0.2,0],[-0.2,0],[0,0.2],[0,-0.2]]){ const X=Math.floor(tx+ox),Y=Math.floor(tz+oz); if(!solid[Y]||solid[Y][X]===undefined||solid[Y][X]) return false; } return true; };
  propsToScale(lv); placeNpcs(lv,spec.npcs,spec.floor||0); landings(lv);
  // anyone the new furniture has landed on steps to the nearest open floor
  lv.folk.forEach(f=>{ if(lv.canMove(f.x,f.z,f.x,f.z)) return; let best=null,bd=9; for(let y=1;y<lv.H-1;y++) for(let x=1;x<lv.W-1;x++){ const cx=x+0.5, cz=y+0.5, d=Math.hypot(cx-f.x,cz-f.z); if(d<bd&&lv.canMove(cx,cz,cx,cz)){ bd=d; best=[cx,cz]; } } if(best){ f.x=best[0]; f.z=best[1]; f.g.position.x=f.x; f.g.position.z=f.z; } });
  lv.folk.forEach(f=>{ const behind=R.keep&&Math.floor(f.x)===R.keep[0]&&Math.floor(f.z)===R.keep[1]; if(behind||spec.keeper===f.who){ f.reach=1.0; f.rest=0; } });
  if(typeof ROOMLIFE!=='undefined'){ const items=[], M={chair:'chair',armchair:'armchair',booth:'booth',bed:'bed',barrel:'barrel',kegs2:'barrel',crates:'crate',crate:'crate',plant:'plant',palm:'plant',pot:'plant',anvil:'anvil',grind:'grind',bard:'bard',shelf:'shelf',chest:'chest',rack:'rack',plate:'armour',table:'table',btable:'table'};
    R.objs.forEach(([k,x,y,w,h])=>{ w=w||1; h=h||1; const cx=x+w/2, cz=y+h/2, m=M[k]; if(!m) return; let face=0;
      if(m==='chair'){ let best=null,bd=9; tables.forEach(t=>{ const d=Math.hypot(t.x-cx,t.z-cz); if(d<bd){bd=d;best=t;} }); face=best?faceTo(cx,cz,best.x,best.z):0; } if(m==='armchair') face=Math.PI;
      items.push({k:m,x:cx,z:cz,face,w,h}); });
    (R.wall||[]).forEach(([k,x,w])=>{ w=w||1; if(k==='window') for(let i=0;i<w;i++) items.push({k:'window',x:x+i+0.5,z:1.0}); else if(k==='hearth') items.push({k:'hearth',x:x+w/2,z:0.75}); else if(k==='clock') items.push({k:'clock',x:x+w/2,z:1.05}); else if(k==='goods') items.push({k:'goods',x:x+w/2,z:1.2}); });
    try{ ROOMLIFE(lv,spec,items); }catch(e){ console.warn('roomlife',e); } }
  return lv; }
const OBJECTS={
  counter:(p,o)=>PROP.counter(p,o.cx,o.cz,o.w,o.pal), bar:(p,o)=>PROP.counter(p,o.cx,o.cz,o.w,o.pal,0x6b4426),
  gilt:(p,o)=>{ const g=PROP.counter(p,o.cx,o.cz,o.w,o.pal,o.pal.trim); for(let i=0;i<o.w;i+=2){ const b=Cy(0.08,0.1,0.14,8,[0xe8c766,0x8a5ab8,0xc8402e][i%3],-o.w/2+0.5+i,0.95,0,g); } },
  table:(p,o)=>PROP.table(p,o.cx,o.cz,o.w,o.h,o.pal), btable:(p,o)=>PROP.table(p,o.cx,o.cz,o.w,o.h,o.pal), lowtable:(p,o)=>PROP.table(p,o.cx,o.cz,o.w,o.h,o.pal),
  chair:(p,o)=>{ let best=null,bd=9; o.tables.forEach(t=>{ const d=Math.hypot(t.x-o.cx,t.z-o.cz); if(d<bd){bd=d;best=t;} }); PROP.chair(p,o.cx,o.cz,best?faceTo(o.cx,o.cz,best.x,best.z):0,o.pal); },
  armchair:(p,o)=>{ const a=P3('armchair',o.pal); if(a){ const g=group(o.cx,0,o.cz,p); g.add(a); return; } const g=group(o.cx,0,o.cz,p); g.rotation.y=Math.PI; B(0.7,0.42,0.6,o.pal.cloth,0,0,0,g); B(0.7,0.55,0.15,o.pal.cloth,0,0.4,0.22,g); B(0.12,0.25,0.6,o.pal.cloth,-0.3,0.42,0,g); B(0.12,0.25,0.6,o.pal.cloth,0.3,0.42,0,g); },
  booth:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w*0.9,0.42,o.h-0.05,o.pal.wallD,0,0,0,g); B(0.12,1.1,o.h-0.05,o.pal.wallD,o.w*0.4,0,0,g); B(o.w*0.7,0.08,o.h-0.15,o.pal.cloth,-0.05,0.42,0,g); },
  hearthrug:(p,o)=>{ B(o.w-0.2,0.015,o.h-0.2,0x8a3a2a,o.cx,0,o.cz,p); B(o.w-0.5,0.018,o.h-0.5,0xb8643a,o.cx,0,o.cz,p); },
  carpet:(p,o)=>{ B(o.w-0.1,0.015,o.h-0.1,o.pal.accent,o.cx,0,o.cz,p); B(o.w-0.4,0.018,o.h-0.4,o.pal.trim,o.cx,0,o.cz,p); B(o.w-0.5,0.02,o.h-0.5,o.pal.accent,o.cx,0,o.cz,p); },
  hallrunner:(p,o)=>{ B(o.w-0.2,0.015,o.h-0.6,o.pal.accent,o.cx,0,o.cz,p); B(o.w-0.2,0.017,0.05,o.pal.trim,o.cx,0,o.cz-o.h/2+0.33,p); B(o.w-0.2,0.017,0.05,o.pal.trim,o.cx,0,o.cz+o.h/2-0.33,p); },
  rugs:(p,o)=>B(o.w-0.2,0.015,o.h-0.2,0xa8402e,o.cx,0,o.cz,p),
  plant:(p,o)=>PROP.plant(p,o.cx,o.cz), palm:(p,o)=>PROP.palm(p,o.cx,o.cz), pot:(p,o)=>PROP.plant(p,o.cx,o.cz),
  barrel:(p,o)=>PROP.barrel(p,o.cx,o.cz),
  kegs2:(p,o)=>{ for(let i=0;i<o.w;i++){ const k=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.7,10),flat(0x7a5432)); k.rotation.x=Math.PI/2; k.position.set(o.x+i+0.5,0.32,o.cz); p.add(k); } },
  crates:(p,o)=>{ for(let i=0;i<o.w;i++){ const c=P3('crate',o.pal); if(c){ c.position.set(o.x+i+0.5,0,o.cz); c.rotation.y=(i%2)*0.3; p.add(c); } else B(0.7,0.6,0.7,0x9a7a48,o.x+i+0.5,0,o.cz,p); } }, crate:(p,o)=>{ const c=P3('crate',o.pal); if(c){ c.position.set(o.cx,0,o.cz); p.add(c); } else B(0.7,0.6,0.7,0x9a7a48,o.cx,0,o.cz,p); },
  sacks:(p,o)=>{ for(let i=0;i<o.w;i++) Sp(0.3,0xc8b088,o.x+i+0.5,0.25,o.cz,p); },
  silk:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(0.6,1.6,o.h-0.1,o.pal.wallD,-0.1,0,0,g); const cols=[0x8a2a5a,0x2f4a8f,0xe8c766,0x3a8a6a,0xc8402e,0xf0e8f8];
    for(let i=0;i<Math.floor(o.h*2.2);i++){ const r=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.5,8),flat(cols[i%cols.length])); r.rotation.x=Math.PI/2; r.rotation.z=Math.PI/2; r.position.set(0.1,0.3+(i%3)*0.45,-o.h/2+0.3+Math.floor(i/3)*0.55); g.add(r); } },
  perfume:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(0.5,1.7,o.h-0.1,o.pal.wallD,0.1,0,0,g); for(let r=0;r<3;r++) for(let i=0;i<o.h*2;i++){ const c=[0xc8a0e8,0xf0b0c8,0xa0d8e8,0xe8d080][(i+r)%4];
      const b=Cy(0.05,0.06,0.16,8,new THREE.MeshPhongMaterial({color:c,transparent:true,opacity:0.8,shininess:90}),-0.1,0.3+r*0.5,-o.h/2+0.25+i*0.48,g); Cy(0.02,0.02,0.06,6,0xe8c766,-0.1,0.46+r*0.5,-o.h/2+0.25+i*0.48,g); } },
  vitrine:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w-0.1,0.75,o.h-0.2,o.pal.wallD,0,0,0,g);
    B(o.w-0.14,0.35,o.h-0.24,new THREE.MeshPhongMaterial({color:0xddeeff,transparent:true,opacity:0.3,shininess:120}),0,0.75,0,g);
    [[0xe8c766,-0.4],[0xc8402e,0],[0x5a8ad8,0.4]].forEach(([c,dx])=>Sp(0.08,c,dx*(o.w/2),0.84,0,g)); },
  chandelier:(p,o,lvl)=>{ const g=group(o.cx,0,o.cz,p); const r=new THREE.Mesh(new THREE.TorusGeometry(Math.min(o.w,2)/2,0.04,6,20),flat(o.pal.trim)); r.rotation.x=Math.PI/2; r.position.y=2.5; g.add(r);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, rr=Math.min(o.w,2)/2; Cy(0.03,0.03,0.12,6,0xf4eee0,Math.sin(a)*rr,2.52,Math.cos(a)*rr,g); flame(Math.sin(a)*rr,2.7,Math.cos(a)*rr,g,o.lv.anim,0.8); }
    const l=new THREE.PointLight(0xffe0a8,0.6,8,1.5); l.position.y=2.3; g.add(l); },
  wheel:(p,o)=>OBJECTS.chandelier(p,o),
  lamps:()=>{},
  sconces:(p,o)=>{ for(let i=0;i<o.w;i+=3){ const x=o.x+i+0.5; B(0.12,0.2,0.08,o.pal.trim,x,1.5,o.y+0.05,p); flame(x,1.78,o.y+0.08,p,o.lv.anim,0.8); } },
  bed:(p,o)=>PROP.bed(p,o.cx,o.cz,o.h*0.95,o.pal,o.pal.accent),
  chest:(p,o)=>PROP.chest(p,o.cx,o.cz,o.pal),
  wash:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(0.5,0.75,0.4,o.pal.wallD,0,0,0,g); Cy(0.18,0.12,0.1,10,0xf4eee0,0,0.75,0,g); Cy(0.06,0.08,0.22,8,0xf4eee0,0.18,0.75,0.1,g); },
  bard:(p,o)=>{ addPerson(o.lv,p,'bard',o.cx,o.cz,0,'Bard',['…'],{mute:true,rest:Math.PI*0.75});
    const notes=[]; for(let i=0;i<2;i++){ const n=B(0.06,0.18,0.02,0xf4eee0,o.cx+0.3,1.6,o.cz,p); notes.push(n); }
    o.lv.anim.push(t=>notes.forEach((n,i)=>{ const k=(t*0.5+i*0.5)%1; n.position.set(o.cx+0.3+k*0.4,1.5+k*0.8,o.cz); n.material.opacity=1; n.visible=k<0.9; })); },
  board:(p,o)=>{},
  ladder:()=>{}
};
const WALL_PIECES={
  window:(p,o)=>{ for(let i=0;i<o.w;i++) roomWindow(p,o.x+i+0.5,1.0,o.pal,o.lv); },
  banner:(p,o)=>{ const g=group(o.cx,0,1.0,p); B(0.6,1.3,0.03,o.pal.accent,0,0.9,0.03,g); B(0.62,0.06,0.04,o.pal.trim,0,2.2,0.03,g); const r=signRelief(o.spec.sign||'crown',o.pal.trim,o.pal.trim,g); r.position.set(0,1.6,0.06); },
  tapestry:(p,o)=>{ const g=group(o.cx,0,1.0,p); B(o.w-0.2,1.4,0.03,0x7a2a3a,0,0.75,0.03,g); B(o.w-0.5,1.1,0.035,o.pal.accent,0,0.9,0.03,g); B(o.w-0.2,0.06,0.05,o.pal.trim,0,2.17,0.03,g);
    const r=signRelief(o.spec.sign||'crown',o.pal.trim,o.pal.trim,g); r.scale.setScalar(1.6); r.position.set(0,1.45,0.06); },
  hearth:(p,o)=>{ const g=group(o.cx,0,1.25,p), hc=P3('hearth',o.pal); if(hc){ hc.scale.set((o.w+0.2)/1.2,1.08,1.2); g.add(hc); } else { B(o.w+0.2,1.3,0.5,0x8a8a90,0,0,0,g); B(o.w-0.4,0.75,0.06,0x1a1410,0,0.1,0.25,g); B(o.w+0.4,0.12,0.6,o.pal.wallD,0,1.3,0,g); }
    const fire=Co(0.25,0.45,6,glow(0xffa040),0,0.12,0.15,g); o.lv.anim.push(t=>{ fire.scale.y=1+Math.sin(t*11)*0.2; });
    const fl=new THREE.PointLight(0xffa050,0.8,7,1.5); fl.position.set(0,0.7,0.8); g.add(fl); o.lv.anim.push(t=>{ fl.intensity=0.7+Math.sin(t*9)*0.1+Math.sin(t*14.3)*0.07; }); },
  kegs:(p,o)=>{ for(let i=0;i<o.w;i+=1){ const k=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.55,10),flat(0x7a5432)); k.rotation.x=Math.PI/2; k.position.set(o.x+i+0.5,1.45,1.3); p.add(k);
      Cy(0.03,0.03,0.12,6,0xc9a94a,o.x+i+0.5,1.3,1.58,p); } B(o.w,0.08,0.6,o.pal.wallD,o.cx,1.12,1.3,p); },
  clock:(p,o)=>{ const g=group(o.cx,0,1.05,p); B(0.5,1.8,0.3,o.pal.wallD,0,0,0,g); const f=new THREE.Mesh(new THREE.CircleGeometry(0.18,16),flat(0xf4eee0)); f.position.set(0,1.45,0.16); g.add(f); },
  goods:(p,o)=>PROP.shelf(p,o.cx,1.2,o.w,0,o.pal)
};
// ── the plain shop, the forge, the fishmonger and the bazaar (SI_ROOMS plain / forge / fish / bazaar) ──
Object.assign(OBJECTS,{
  shelf:(p,o)=>{ const g=PROP.shelf(p,o.cx,o.cz,o.h,0,o.pal); g.rotation.y=o.x<7?Math.PI/2:-Math.PI/2; },
  runner:(p,o)=>B(o.w-0.2,0.015,o.h-0.2,o.pal.accent,o.cx,0,o.cz,p),
  low:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w,0.5,0.7,0x8a5a32,0,0,0,g); B(o.w+0.04,0.05,0.75,0xc8402e,0,0.5,0,g); for(let i=0;i<o.w;i++) Sp(0.12,[0xe8c766,0xc8402e,0x8a5ab8,0x3a8a6a][i%4],-o.w/2+0.5+i,0.62,0,g,6,4); },
  spice:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w,0.55,0.7,0x7a5432,0,0,0,g); [0xd8742a,0xc8402e,0xe8c040,0x6a8a3a,0x8a4a2a,0xd8a050].forEach((c,i)=>{ const x=-o.w/2+0.3+i*(o.w-0.6)/5; Cy(0.15,0.13,0.12,8,0x9a6a3a,x,0.55,0,g); Co(0.13,0.14,8,c,x,0.67,0,g); }); },
  rolls:(p,o)=>OBJECTS.silk(p,o),
  cushions:(p,o)=>{ [[0,0,0xc8402e],[1,1,0x2f6a8a],[2,0,0xe8c766],[0,2,0x8a5ab8],[2,2,0x3a8a6a]].forEach(([a,b,c])=>B(0.6,0.16,0.6,c,o.x+a+0.5,0,o.y+b+0.5,p)); },
  brass:(p,o)=>{ for(let i=0;i<o.w;i+=2){ const g=group(o.x+i+0.5,0,o.cz,p); Cy(0.01,0.01,0.8,4,0x3a2a1a,0,1.7,0,g); const l=Sp(0.13,glow(0xffc86a),0,1.62,0,g,8,6); l.scale.y=1.3; } },
  furnace:(p,o)=>{ const g=group(o.cx,0,o.y+1.2,p); B(o.w,1.6,1.2,0x6a5a52,0,0,0,g); B(o.w-1,0.6,0.1,0x1a0a08,0,0.3,0.6,g); B(o.w-1.2,0.4,0.11,glow(0xff7a2a),0,0.35,0.6,g); Cy(0.4,0.5,1.2,8,0x5a4a44,0,1.6,0,g);
    const fl=new THREE.PointLight(0xff8a3a,0.9,7,1.5); fl.position.set(0,0.6,1.2); g.add(fl); o.lv.anim.push(t=>{ fl.intensity=0.8+Math.sin(t*8)*0.15; }); },
  bellows:(p,o)=>{ const g=group(o.cx,0,o.cz,p); const b=B(0.5,0.25,0.7,0x6a3a22,0,0.3,0,g); b.rotation.x=0.1; B(0.06,0.3,0.06,0x3a2a1a,0,0,0.2,g); },
  anvil:(p,o)=>{ const g=group(o.cx,0,o.cz,p); Cy(0.25,0.3,0.45,8,0x5a3a22,0,0,0,g); B(0.3,0.2,0.24,0x3a3a42,0,0.45,0,g); B(0.62,0.16,0.28,0x3a3a42,0,0.62,0,g); Co(0.12,0.26,4,0x3a3a42,0.42,0.62,0,g).rotation.z=-Math.PI/2; },
  trough:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w-0.1,0.5,0.6,0x5a3a22,0,0,0,g); B(o.w-0.3,0.02,0.45,0x2f5f7c,0,0.46,0,g); },
  quench:(p,o)=>{ Cy(0.3,0.26,0.6,10,0x5a3a22,o.cx,0,o.cz,p); Cy(0.27,0.27,0.02,10,0x2f5f7c,o.cx,0.56,o.cz,p); },
  rack:(p,o)=>{ const g=group(o.cx,0,o.cz,p); g.rotation.y=Math.PI/2; B(o.h-0.1,0.08,0.12,o.pal.wallD,0,1.0,-0.2,g); for(let i=0;i<o.h*2;i++){ const s=B(0.05,1.3,0.02,0xd8dce4,-o.h/2+0.3+i*0.45,0.1,-0.12,g); s.rotation.x=-0.1; } },
  plate:(p,o)=>OBJECTS.armourStand?OBJECTS.armourStand(p,o):(()=>{ const g=group(o.cx,0,o.cz,p); Cy(0.04,0.04,1.2,6,o.pal.wallD,0,0,0,g); Cy(0.2,0.25,0.6,7,0xc9cdd6,0,0.7,0,g); Cy(0.16,0.15,0.28,8,0xc9cdd6,0,1.32,0,g); Cy(0.25,0.25,0.06,8,o.pal.wallD,0,0,0,g); })(),
  blades:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w-0.1,0.7,0.6,o.pal.wallD,0,0,0,g); for(let i=0;i<o.w;i++){ const s=B(0.08,0.02,0.7,0xd8dce4,-o.w/2+0.5+i,0.72,0,g); s.rotation.y=0.3; B(0.2,0.04,0.05,0xc9a94a,-o.w/2+0.5+i,0.72,0.3,g); } },
  grind:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(0.5,0.5,0.3,0x5a3a22,0,0,0,g); const w=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.1,14),flat(0x9a9aa2)); w.rotation.z=Math.PI/2; w.position.y=0.75; g.add(w); },
  coal:(p,o)=>{ for(let i=0;i<o.w;i++) Sp(0.3,0x1a1a1e,o.x+i+0.5,0.1,o.cz,p,6,4).scale.y=0.5; },
  ice:(p,o)=>{ const g=group(o.cx,0,o.cz,p); B(o.w,0.8,o.h,0x8a7a62,0,0,0,g); B(o.w-0.1,0.08,o.h-0.1,0xdff2fa,0,0.8,0,g); for(let i=0;i<Math.max(o.w,o.h)*2;i++){ const f=B(0.1,0.06,0.32,[0x9ab0c0,0xc0a080,0x8aa0b0][i%3],-o.w/2+0.3+(i%Math.max(1,o.w*2))*0.45,0.88,-o.h/2+0.3+Math.floor(i/Math.max(1,o.w*2))*0.45,g); f.rotation.y=i*0.7; } },
  icetable:(p,o)=>OBJECTS.ice(p,o),
  trap:(p,o)=>{ const g=group(o.cx,0,o.cz,p); const c=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.6,8,1,true),new THREE.MeshLambertMaterial({color:0x8a6a42,wireframe:true})); c.rotation.z=Math.PI/2; c.position.y=0.3; g.add(c); },
  buckets:(p,o)=>{ Cy(0.2,0.16,0.32,10,0x8a6a42,o.cx,0,o.cz,p); Cy(0.17,0.17,0.02,10,0x2f5f7c,o.cx,0.3,o.cz,p); },
  floats:(p,o)=>{ for(let i=0;i<o.w;i+=2) Sp(0.12,i%4?0xc8402e:0xf4eee0,o.x+i+0.5,2.0,o.cz,p,8,6); }
});
Object.assign(WALL_PIECES,{
  carpetw:(p,o)=>{ const g=group(o.x+1.5,0,1.0,p); B(2.4,1.6,0.03,0x8a2a3a,0,0.6,0.03,g); B(2.0,1.2,0.035,0xd8a040,0,0.8,0.03,g); B(1.6,0.8,0.04,0x2f4a8f,0,1.0,0.03,g); },
  tools:(p,o)=>{ const g=group(o.x+1,0,1.0,p); B(2.0,1.0,0.04,o.pal.wallD,0,0.9,0.04,g); [-0.6,-0.2,0.2,0.6].forEach((x,i)=>{ B(0.05,0.6,0.03,0x5a3a22,x,1.0,0.07,g); B(0.22,0.14,0.04,0x3a3a42,x,1.5-i%2*0.05,0.07,g); }); },
  nets:(p,o)=>{ const n=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.4),new THREE.MeshLambertMaterial({color:0x8a7a5a,transparent:true,opacity:0.7})); n.position.set(o.x+1.2,1.6,1.04); p.add(n); },
  swordfish:(p,o)=>{ const g=group(o.x+1.5,1.7,1.06,p); const b=Sp(0.3,0x4a6a8a,0,0,0,g,8,6); b.scale.set(2.2,0.6,0.3); B(1.0,0.04,0.04,0xd8dce4,-1.1,0,0,g); Co(0.2,0.3,3,0x4a6a8a,0.75,0.1,0,g).rotation.z=-1.2; }
});
