// ════════════════════════════════════════════════════════════════
//  CHAPEL THEMES — each of the ten chapels dressed for its town and for the demon that has taken it.
//  They were houses of God before they were bound: the general's banners still hang (a gold cross on the
//  town's colour), light still falls from above onto the dais, the angels still stand guard over it —
//  but the guardian's mark has crept through every hall. Hearthvale's warm sandstone is stained with
//  the Imp's shadow; Ironhold hangs with the Wraith's chains; Saltmere's floors run with the Specter's
//  tide; roots split Thornwood's walls; embers glow in Dusthaven's cracks; ice grows over Crystalpeak;
//  Ashfield is charred and falling ash; Stormgate's spire crackles and the halls flash with lightning;
//  Shadowmere's fallen knights kneel in black marble; and the Void tears through Hellgate's gold.
//  CHAPEL_THEME(town) → theme; CHAPEL_DRESS(X) dresses a floor (built into a few merged draws).
// ════════════════════════════════════════════════════════════════
const CHAPEL_THEMES=[
  // 0 Hearthvale — the Shadow Imp: warm stone, crimson banners, candlelight; purple shadow pooling in the corners
  {key:'hearth',wall:0x8a7258,top:0x9e866a,fA:0x5e4c3c,fB:0x564538,raised:0x6e5a48,stair:0x8a7a68,trim:0xd8b060,bg:0x150e10,fog:[12,34],
   sky:0xf4dcc4,gnd:0x3a2a22,hemiI:0.95,lamp:0xffd8a0,fire:[0xffa040,0xffe08a],banner:0x8a2028,mark:0x6a3a9a,motes:{c:0xffd8a0,vy:0.05,n:70,s:0.06},
   wallKind:'sconce',scatter:['pew','candles','books','urn'],centre:'candelabra',seams:0,shine:0},
  // 1 Ironhold — the Iron Wraith: dark granite and iron, cold torches, chains hung from the vault
  {key:'iron',wall:0x4c5058,top:0x60646e,fA:0x36393f,fB:0x303339,raised:0x44474e,stair:0x5a5e66,trim:0xa8b0c0,bg:0x0a0c10,fog:[10,30],
   sky:0xc8d4e8,gnd:0x1c2026,hemiI:0.9,lamp:0xd8e8ff,fire:[0x7ac8ff,0xe0f4ff],banner:0x223a62,mark:0x9ae0c0,motes:{c:0xb8f0d8,vy:0.12,n:60,s:0.07},
   wallKind:'chains',scatter:['anvil','rack','ironcrate','chainpile'],centre:'forge',seams:0,shine:0.2},
  // 2 Saltmere — the Tide Specter: sea-worn stone, weed and shell, pools of standing water, spectral sea-green fire
  {key:'tide',wall:0x4a6c6a,top:0x5e807c,fA:0x2e4a4c,fB:0x294446,raised:0x3a5a5a,stair:0x5a7a78,trim:0xe0d0a0,bg:0x061218,fog:[10,30],
   sky:0xa8e4e0,gnd:0x163232,hemiI:0.92,lamp:0xa8fff0,fire:[0x40d8c0,0xc8fff0],banner:0x16586a,mark:0x7af0e0,motes:{c:0xc8fff8,vy:0.35,n:80,s:0.06},
   wallKind:'weed',scatter:['shells','coral','pool','urn'],centre:'pools',seams:0,shine:0.7},
  // 3 Thornwood — the Root Fiend: moss on the stone, roots splitting the walls, glowing toadstools, drifting spores
  {key:'root',wall:0x4e5c44,top:0x627050,fA:0x3a4432,fB:0x343e2c,raised:0x46523a,stair:0x5e6a50,trim:0xc8b878,bg:0x08100a,fog:[10,30],
   sky:0xd0e8b8,gnd:0x222a1a,hemiI:0.9,lamp:0xe8ffc0,fire:[0xffa040,0xffe08a],banner:0x2e5a2a,mark:0xa0e050,motes:{c:0xc8ff80,vy:0.08,n:90,s:0.07},
   wallKind:'roots',scatter:['shrooms','knot','leaves','stump'],centre:'rootmass',seams:0,shine:0},
  // 4 Dusthaven — the Ember Hollow: ochre sandstone, drifts of sand, embers glowing in the floor's cracks
  {key:'ember',wall:0x9a7a52,top:0xae8e62,fA:0x6a5034,fB:0x604830,raised:0x7a603e,stair:0x9a8060,trim:0xe8c070,bg:0x1a0e06,fog:[11,32],
   sky:0xffdcaa,gnd:0x4a3018,hemiI:0.95,lamp:0xffc070,fire:[0xff7a20,0xffd060],banner:0xa85a18,mark:0xff7020,motes:{c:0xffa040,vy:0.6,n:90,s:0.06},
   wallKind:'cracks',scatter:['sand','urn','pots','sand'],centre:'emberpit',seams:0xff6a1a,shine:0},
  // 5 Crystalpeak — the Frost Revenant: ice-blue stone, crystal clusters lit from within, blue flame, falling frost
  {key:'frost',wall:0x7a8aa8,top:0x9eaecc,fA:0x4a5a76,fB:0x44536c,raised:0x5a6a88,stair:0x8a9ab8,trim:0xe8f0ff,bg:0x08101e,fog:[11,32],
   sky:0xdceaff,gnd:0x26364e,hemiI:0.95,lamp:0xc8e4ff,fire:[0x5ab0ff,0xd8f0ff],banner:0x2e4e9a,mark:0x9ae0ff,motes:{c:0xf0f8ff,vy:-0.4,n:110,s:0.07},
   wallKind:'ice',scatter:['crystal','snow','crystal','icicles'],centre:'spire',seams:0,shine:0.8},
  // 6 Ashfield — the Char Demon: charred black stone, ash heaps and burnt beams, red fire, ash falling like snow
  {key:'char',wall:0x3a3434,top:0x4c4442,fA:0x2a2626,fB:0x252121,raised:0x342e2e,stair:0x4a4240,trim:0xc07040,bg:0x110707,fog:[10,30],
   sky:0xe8b4a0,gnd:0x2a1610,hemiI:0.88,lamp:0xffa070,fire:[0xff4010,0xffb040],banner:0x5a1414,mark:0xff3a10,motes:{c:0x9a9090,vy:-0.3,n:110,s:0.07},
   wallKind:'scorch',scatter:['ash','beam','ash','pots'],centre:'pyre',seams:0xff3a10,shine:0},
  // 7 Stormgate — the Thunder Lord: wet slate, copper rods, puddles — and the lightning that lights the halls white
  {key:'storm',wall:0x58606c,top:0x6c7482,fA:0x3a4048,fB:0x343a42,raised:0x48505a,stair:0x6a7280,trim:0xd09050,bg:0x090b12,fog:[10,30],
   sky:0xc8d0f0,gnd:0x1e2434,hemiI:0.88,lamp:0xd0dcff,fire:[0x80a8ff,0xe8f0ff],banner:0x3a3a7a,mark:0xb0c8ff,motes:{c:0xa8c0ff,vy:-1.6,n:120,s:0.05},
   wallKind:'conduit',scatter:['rod','pool','rubble','rod'],centre:'tesla',seams:0,shine:0.75,lightning:true},
  // 8 Shadowmere — the Dark Paladin: polished black marble, violet flame, fallen knights' arms, statues kneeling
  {key:'shade',wall:0x302c3a,top:0x44404e,fA:0x221f2a,fB:0x1d1b25,raised:0x2c2836,stair:0x48444e,trim:0xa898c8,bg:0x07060c,fog:[10,30],
   sky:0xc8b8e8,gnd:0x18121e,hemiI:0.9,lamp:0xd8c0ff,fire:[0x9a5aff,0xe0c8ff],banner:0x40225e,mark:0xa070ff,motes:{c:0xb090ff,vy:0.1,n:80,s:0.06},
   wallKind:'tatter',scatter:['armour','swords','rubble','armour'],centre:'kneelers',seams:0,shine:0.6},
  // 9 Hellgate — the Void Champion: obsidian and old gold, the void showing through the cracks, stones hanging in the air
  {key:'void',wall:0x2a2228,top:0x8a6a2a,fA:0x1c161a,fB:0x181216,raised:0x261e24,stair:0x5a4a3a,trim:0xe0b040,bg:0x090308,fog:[10,30],
   sky:0xe8b0b0,gnd:0x22080e,hemiI:0.9,lamp:0xffb0a0,fire:[0xff6020,0xffd080],banner:0x6a1426,mark:0xc040ff,motes:{c:0xd060ff,vy:0.25,n:100,s:0.06},
   wallKind:'rift',scatter:['shard','floater','shard','rubble'],centre:'rift',seams:0xb030ff,shine:0.5}];
const CHAPEL_THEME=t=>CHAPEL_THEMES[((t|0)%10+10)%10];

// a fire in the theme's colours
function themeFire(g,an,x,y,z,s,T){ s=s||1; const f=Co(0.16*s,0.4*s,6,glow(T.fire[0]),x,y,z,g), f2=Co(0.09*s,0.26*s,6,glow(T.fire[1]),x,y,z,g);
  f.userData.keep=f2.userData.keep=true; const k=Math.random()*9; an.push(t=>{ f.scale.y=1+Math.sin(t*11+k)*0.22; f2.scale.y=1+Math.sin(t*14+k)*0.25; }); return f; }
function themeFlame(x,y,z,par,an,s,T){ const f=new THREE.Mesh(new THREE.ConeGeometry(0.045*(s||1),0.13*(s||1),6),glow(T.fire[1])); f.position.set(x,y,z); f.userData.keep=true; par.add(f);
  const k=Math.random()*9; an.push(t=>{ f.scale.y=1+Math.sin(t*12+k)*0.25; }); return f; }

const CHAPEL_DRESS=(function(){
  let SPR=3.6;   // how far apart the guardian's pair stands (wider in the sanctum)
  const dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
  const hs=(x,y,s)=>{ let h=(x*374761393+y*668265263+(s||0)*2147483647)|0; h=(h^(h>>>13))*1274126177; return ((h^(h>>>16))>>>0)/4294967296; };
  // ── the banner: the town's colour, a gold cross, a fringe; one texture per theme ──
  const BT={}; function bannerMat(T){ if(BT[T.key]) return BT[T.key]; const c=document.createElement('canvas'); c.width=64; c.height=160; const x=c.getContext('2d');
    const col='#'+new THREE.Color(T.banner).getHexString(), tr='#'+new THREE.Color(T.trim).getHexString();
    x.fillStyle=col; x.fillRect(0,0,64,140); x.beginPath(); x.moveTo(0,140); x.lineTo(32,160); x.lineTo(64,140); x.fill();
    x.fillStyle=tr; x.fillRect(0,0,64,6); x.fillRect(0,0,4,140); x.fillRect(60,0,4,140); x.fillRect(29,30,6,62); x.fillRect(16,46,32,6);   // the cross
    x.globalAlpha=0.35; x.fillStyle='#'+new THREE.Color(T.mark).getHexString(); for(let i=0;i<9;i++){ x.beginPath(); x.arc(8+((i*37)%50),100+((i*23)%40),3+(i%3)*2,0,7); x.fill(); }   // the guardian's stain creeping up
    const tex=new THREE.CanvasTexture(c); return BT[T.key]=new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide}); }
  // ── motes in the air around you: dust, bubbles, spores, embers, frost, ash, rain, sparks ──
  let MT=null; function moteTex(){ if(MT) return MT; const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d'), g=x.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,0.5)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,32,32); return MT=new THREE.CanvasTexture(c); }
  function motes(X,T){ const m=T.motes, N=m.n, geo=new THREE.BufferGeometry(), pos=new Float32Array(N*3); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({size:m.s,map:moteTex(),color:m.c,transparent:true,depthWrite:false,opacity:0.85,blending:THREE.AdditiveBlending}), pts=new THREE.Points(geo,mat); pts.frustumCulled=false; X.scene.add(pts);
    const S=Array.from({length:N},()=>[Math.random()*16-8,Math.random()*X.CW,Math.random()*16-8,Math.random()*6.28,0.6+Math.random()*0.8]);
    X.an.push((t,dt)=>{ const P=ENGINE.P; dt=dt||0.016; for(let i=0;i<N;i++){ const s=S[i]; s[1]+=m.vy*s[4]*dt; if(s[1]>X.CW) s[1]-=X.CW; if(s[1]<0) s[1]+=X.CW;
        let rx=s[0]+Math.sin(t*0.5*s[4]+s[3])*0.6, rz=s[2]+Math.cos(t*0.4*s[4]+s[3])*0.6; pos[i*3]=P.x+rx; pos[i*3+1]=s[1]+(m.vy<-1?0:Math.sin(t*1.3+s[3])*0.1); pos[i*3+2]=P.z+rz; }
      geo.attributes.position.needsUpdate=true; }); }

  // ── the pieces ──
  const P={
    // things against the walls (o = the way into the room; the piece's back to the wall)
    pew(g,T){ B(1.0,0.42,0.34,dk(T.trim,0.45),0,0,0,g); B(1.0,0.5,0.06,dk(T.trim,0.4),0,0.42,-0.15,g); },
    candles(g,T,an){ for(let i=0;i<4;i++){ const h=0.12+hs(i,7)*0.3, x=-0.25+i*0.16, z=(i%2)*0.14-0.07; Cy(0.03,0.035,h,6,0xf0e8d0,x,0,z,g); Co(0.025,0.07,5,glow(T.fire[1]),x,h,z,g); } },
    books(g,T){ for(let i=0;i<5;i++){ const b=B(0.34,0.07,0.24,[0x7a2a22,0x2a4a6a,0x4a5a2a,0x6a4a22,0x5a2a5a][i],0,i*0.07,0,g); b.rotation.y=(hs(i,3)-0.5)*0.6; } },
    urn(g,T){ Cy(0.16,0.22,0.5,8,dk(T.wall,1.15),0,0,0,g); Cy(0.12,0.16,0.14,8,dk(T.wall,1.15),0,0.5,0,g); Cy(0.2,0.2,0.04,8,T.trim,0,0.34,0,g); },
    anvil(g,T){ B(0.3,0.3,0.24,0x2e3036,0,0,0,g); B(0.62,0.16,0.26,0x3a3c44,0,0.3,0,g); Co(0.12,0.24,4,0x3a3c44,0.4,0.33,0,g).rotation.z=-Math.PI/2; },
    rack(g,T){ B(1.0,0.08,0.1,0x4a3a2a,0,0.9,-0.1,g); B(0.08,1.1,0.08,0x4a3a2a,-0.46,0,-0.1,g); B(0.08,1.1,0.08,0x4a3a2a,0.46,0,-0.1,g); for(let i=0;i<4;i++){ const s=B(0.04,1.0,0.02,0xa8b0bc,-0.3+i*0.2,0.05,0,g); s.rotation.z=0.06; } },
    ironcrate(g,T){ B(0.6,0.5,0.6,0x4a4c54,0,0,0,g); B(0.62,0.06,0.62,0x2a2c30,0,0.22,0,g); B(0.06,0.52,0.62,0x2a2c30,0,0,0,g); },
    chainpile(g,T){ for(let i=0;i<7;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.02,4,8),mt(0x5a5e66)); r.position.set(-0.2+hs(i,1)*0.4,0.04+i*0.02,-0.2+hs(i,2)*0.4); r.rotation.set(Math.PI/2+hs(i,4),hs(i,5)*3,0); g.add(r); } },
    shells(g,T){ for(let i=0;i<6;i++){ const s=Sp(0.06+hs(i,1)*0.05,[0xf0d8c8,0xe8b8a8,0xd8d0c0][i%3],-0.3+hs(i,2)*0.6,0.03,-0.3+hs(i,3)*0.6,g,6,4); s.scale.y=0.45; } },
    coral(g,T){ const c=[0xe86a6a,0xf09a6a,0xc86ab0][Math.floor(hs(g.position.x,g.position.z)*3)]; for(let i=0;i<5;i++){ const b=Cy(0.03,0.05,0.3+hs(i,9)*0.4,5,c,-0.15+hs(i,1)*0.3,0,-0.15+hs(i,2)*0.3,g); b.rotation.z=(hs(i,3)-0.5)*0.9; b.rotation.x=(hs(i,4)-0.5)*0.9; } },
    pool(g,T){ const m=new THREE.Mesh(new THREE.CircleGeometry(0.5+hs(g.position.x,1)*0.3,14),new THREE.MeshPhongMaterial({color:dk(T.fA,0.5),shininess:140,specular:0x9ab8c8})); m.rotation.x=-Math.PI/2; m.position.y=0.015; m.scale.x=1.4; g.add(m); m.userData.keep=true; },
    shrooms(g,T,an){ for(let i=0;i<5;i++){ const h=0.1+hs(i,2)*0.25, x=-0.25+hs(i,3)*0.5, z=-0.2+hs(i,4)*0.4; Cy(0.025,0.035,h,5,0xd8d0b0,x,0,z,g); const c=Sp(0.06+hs(i,5)*0.06,glow(i%2?0x7af0a0:0xb8ff70),x,h,z,g,7,4); c.scale.y=0.5; } },
    knot(g,T){ for(let i=0;i<4;i++){ const r=Cy(0.06,0.1,0.9,5,0x4a3a26,-0.2+i*0.14,0,0,g); r.rotation.z=1.2+(hs(i,1)-0.5); r.rotation.y=hs(i,2)*3; r.position.y=0.15; } },
    leaves(g,T){ for(let i=0;i<9;i++){ const l=B(0.12,0.01,0.08,[0x7a6a2a,0x5a6a2a,0x8a5a22][i%3],-0.4+hs(i,1)*0.8,0.005,-0.3+hs(i,2)*0.6,g); l.rotation.y=hs(i,3)*3; } },
    stump(g,T){ Cy(0.26,0.32,0.4,8,0x4a3a26,0,0,0,g); Cy(0.24,0.24,0.02,8,0x8a7448,0,0.4,0,g); },
    sand(g,T){ const s=Sp(0.6,dk(T.fA,1.35),0,0,0,g,9,5); s.scale.set(1.3,0.28,0.9); },
    pots(g,T){ for(let i=0;i<3;i++){ const x=-0.25+i*0.25; if(i===1){ const b=Cy(0.14,0.12,0.18,7,0x9a5a32,x,0,0.1,g); b.rotation.z=1.4; b.position.y=0.12; } else Cy(0.12,0.16,0.34,7,0x9a5a32,x,0,0,g); } },
    crystal(g,T,an){ for(let i=0;i<4;i++){ const h=0.3+hs(i,1)*0.7, c=Co(0.08+hs(i,2)*0.07,h,5,glow(i%2?0x9ad8ff:0xd0f0ff),-0.2+hs(i,3)*0.4,0,-0.15+hs(i,4)*0.3,g); c.rotation.z=(hs(i,5)-0.5)*0.7; c.rotation.x=(hs(i,6)-0.5)*0.5; } },
    snow(g,T){ const s=Sp(0.55,0xe8f0ff,0,0,0,g,9,5); s.scale.set(1.3,0.22,0.9); },
    icicles(g,T){ Cy(0.2,0.26,0.6,7,dk(T.wall,1.1),0,0,0,g); for(let i=0;i<5;i++){ const c=Co(0.04,0.22,4,0xd8ecff,-0.16+i*0.08,0.4,0.24,g); c.rotation.x=Math.PI; } },
    ash(g,T){ const s=Sp(0.55,0x4a4444,0,0,0,g,9,5); s.scale.set(1.2,0.25,0.9); Sp(0.06,glow(T.fire[0]),0.15,0.1,0.05,g,5,4); },
    beam(g,T){ const b=B(1.4,0.18,0.2,0x1e1a18,0,0.05,0,g); b.rotation.z=0.18; b.rotation.y=hs(g.position.x,g.position.z)*2; B(0.14,0.04,0.14,glow(T.fire[0]),0.4,0.18,0,g); },
    rod(g,T,an){ Cy(0.04,0.06,1.6,6,0xb87040,0,0,0,g); Sp(0.08,0xd09050,0,1.62,0,g); Cy(0.16,0.2,0.1,8,0x3a3a40,0,0,0,g); },
    rubble(g,T){ for(let i=0;i<5;i++){ const r=B(0.18+hs(i,1)*0.2,0.12+hs(i,2)*0.14,0.16+hs(i,3)*0.2,dk(T.wall,0.9+hs(i,4)*0.2),-0.3+hs(i,5)*0.6,0,-0.25+hs(i,6)*0.5,g); r.rotation.y=hs(i,7)*3; } },
    armour(g,T){ const h=Sp(0.13,0x6a6a74,-0.1,0.1,0,g,8,6); h.scale.y=1.1; B(0.36,0.12,0.24,0x5a5a64,0.2,0,0.05,g).rotation.y=0.4; B(0.5,0.05,0.4,T.banner,0.05,0,-0.1,g).rotation.y=-0.3; },
    swords(g,T){ for(let i=0;i<3;i++){ const s=B(0.05,0.02,0.8,0xa8acb8,-0.2+i*0.18,0.01,0,g); s.rotation.y=(hs(i,1)-0.5)*1.2; B(0.2,0.03,0.04,0x6a5a3a,s.position.x,0.02,-0.3,g).rotation.y=s.rotation.y; } },
    shard(g,T){ for(let i=0;i<3;i++){ const c=Co(0.1+hs(i,1)*0.08,0.5+hs(i,2)*0.7,4,i?0x1a141c:0x2a1a2a,-0.2+i*0.2,0,(hs(i,3)-0.5)*0.3,g); c.rotation.z=(hs(i,4)-0.5)*0.6; } Sp(0.05,glow(T.mark),0,0.08,0.1,g,5,4); },
    floater(g,T,an){ const r=B(0.4,0.3,0.36,0x2a2228,0,0.9,0,g); r.rotation.set(0.3,0.5,0.2); r.userData.keep=true; const k=hs(g.position.x,g.position.z)*9; an.push(t=>{ r.position.y=0.9+Math.sin(t*0.9+k)*0.15; r.rotation.y=t*0.2+k; }); Sp(0.05,glow(T.mark),0,0.05,0,g,5,4); } };

  // things fixed to the wall's face (g faces out of the wall along +z)
  const W={
    sconce(g,T,an){ B(0.14,0.3,0.06,T.trim,0,1.4,0,g); Co(0.055,0.17,5,glow(T.fire[1]),0,1.76,0.08,g); Cy(0.03,0.03,0.14,5,0xf0e8d0,0,1.62,0.08,g); },
    chains(g,T,CW){ for(let k=0;k<2;k++){ const x=k?0.18:-0.18, n=6+Math.floor(hs(g.position.x+k,g.position.z)*5); for(let i=0;i<n;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.018,4,8),mt(0x50545c)); r.position.set(x,CW-0.12-i*0.15,0.1); r.rotation.y=i%2?Math.PI/2:0; g.add(r); } } },
    weed(g,T,CW){ for(let i=0;i<4;i++){ const h=0.8+hs(i,g.position.x)*1.8; const s=B(0.08,h,0.02,i%2?0x2e6a4a:0x4a7a3a,-0.3+i*0.2,CW-h-0.2*hs(i,2),0.04,g); s.rotation.z=(hs(i,3)-0.5)*0.15; } B(0.9,0.8,0.01,dk(T.wall,0.7),0,0,0.02,g); },
    roots(g,T,CW){ for(let i=0;i<3;i++){ const len=CW*(0.5+hs(i,g.position.z)*0.5), r=Cy(0.035,0.09,len,5,0x4a3a26,-0.25+i*0.25,CW-len,0.06,g); r.rotation.z=(hs(i,1)-0.5)*0.4; } for(let i=0;i<3;i++) Co(0.025,0.12,4,0x5a4a2a,-0.25+i*0.25,CW*0.5,0.12,g).rotation.x=Math.PI/2; },
    cracks(g,T,CW){ for(let i=0;i<3;i++){ const c=B(0.04,0.5+hs(i,5)*0.6,0.02,glow(T.seams||T.fire[0]),-0.2+i*0.2,0.2+hs(i,6)*1.4,0.03,g); c.rotation.z=(hs(i,7)-0.5)*1.2; } },
    ice(g,T,CW){ for(let i=0;i<5;i++){ const c=Co(0.06+hs(i,1)*0.06,0.3+hs(i,2)*0.5,4,i%2?0xc8e8ff:0xa8d0f8,-0.3+i*0.15,CW-0.5-hs(i,3)*0.3,0.08,g); c.rotation.x=Math.PI; } B(0.9,0.6,0.03,0xd8ecff,0,0,0.02,g); },
    scorch(g,T,CW){ B(0.9,CW*0.6,0.015,0x141010,0,0,0.02,g); B(0.04,0.4,0.02,glow(T.fire[0]),0.1,0.3,0.035,g).rotation.z=0.5; },
    conduit(g,T,CW){ B(0.07,CW,0.07,0xb87040,-0.2,0,0.06,g); B(0.07,CW,0.07,0xb87040,0.2,0,0.06,g); for(let y=0.6;y<CW;y+=0.9) B(0.5,0.06,0.1,0x3a3a40,0,y,0.06,g); },
    tatter(g,T,CW){ const b=B(0.5,1.2,0.02,T.banner,0,CW-1.6,0.06,g); b.rotation.z=0.12; B(0.56,0.05,0.06,0x2a2430,0,CW-0.4,0.06,g); },
    rift(g,T,CW){ for(let i=0;i<3;i++){ const c=B(0.05,0.6+hs(i,5)*0.8,0.02,glow(T.mark),-0.2+i*0.2,0.3+hs(i,6)*1.4,0.03,g); c.rotation.z=(hs(i,7)-0.5)*1.4; } } };

  // ── the plaza's heart: a piece for each guardian (cx,cz the dais, w the plaza's half-width) ──
  const CENTRE={
    candelabra(g,T,an,X){ [-1,1].forEach(s=>{ const c=group(s*SPR,0,0,g); Cy(0.06,0.18,1.8,8,T.trim,0,0,0,c); for(let k=-2;k<=2;k++){ B(0.03,0.03,0.22,T.trim,k*0.14,1.8,0,c); Cy(0.025,0.03,0.18,6,0xf0e8d0,k*0.14,1.82,0,c); Co(0.05,0.15,5,glow(T.fire[1]),k*0.14,2.0,0,c); } B(0.66,0.04,0.06,T.trim,0,1.8,0,c); }); },
    forge(g,T,an){ [-1,1].forEach(s=>{ const f=group(s*SPR,0,0,g); B(1.0,0.8,0.8,0x2e3036,0,0,0,f); B(0.8,0.1,0.6,glow(0xff7a2a),0,0.8,0,f); themeFire(f,an,0,0.85,0,0.8,{fire:[0xff7a2a,0xffd060]}); B(0.2,1.6,0.2,0x3a3c44,0,0.9,-0.3,f); }); },
    pools(g,T){ [-1,1].forEach(s=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(1.3,18),new THREE.MeshPhongMaterial({color:0x123a44,shininess:160,specular:0xa8e0f0})); m.rotation.x=-Math.PI/2; m.position.set(s*(SPR+0.2),0.02,0.4); m.userData.keep=true; g.add(m);
      const r=new THREE.Mesh(new THREE.TorusGeometry(1.3,0.1,5,20),mt(dk(T.wall,1.2))); r.rotation.x=Math.PI/2; r.position.set(s*(SPR+0.2),0.05,0.4); g.add(r); Cy(0.12,0.2,0.9,8,dk(T.wall,1.2),s*(SPR+0.2),0,0.4,g); Sp(0.24,0xf0e0d0,s*(SPR+0.2),1.0,0.4,g,8,5).scale.y=0.5; }); },
    rootmass(g,T){ [-1,1].forEach(s=>{ const r=group(s*SPR,0,0,g); for(let i=0;i<7;i++){ const c=Cy(0.08,0.24,2.6,6,0x4a3a26,0,0,0,r); c.rotation.set((hs(i,s)-0.5)*1.2,i*0.9,(hs(i,s+3)-0.5)*1.2); c.position.set(Math.cos(i)*0.3,0.6,Math.sin(i)*0.3); for(let k=0;k<3;k++) Co(0.04,0.18,4,0x6a5a2a,Math.cos(i)*0.5,0.5+k*0.5,Math.sin(i)*0.5,r).rotation.z=1.4; } }); },
    emberpit(g,T,an){ [-1,1].forEach(s=>{ const p=group(s*SPR,0,0,g); Cy(0.9,1.0,0.3,12,dk(T.wall,0.9),0,0,0,p); Cy(0.78,0.78,0.02,12,glow(0xff6a1a),0,0.3,0,p); themeFire(p,an,0,0.3,0,1.3,T); themeFire(p,an,0.3,0.3,0.2,0.8,T); }); },
    spire(g,T){ [-1,1].forEach(s=>{ const p=group(s*SPR,0,0,g); for(let i=0;i<6;i++){ const c=Co(0.14+hs(i,s)*0.14,1.2+hs(i,s+1)*1.8,5,glow(i%2?0x8ad0ff:0xc8ecff),Math.cos(i*1.1)*0.3,0,Math.sin(i*1.1)*0.3,p); c.rotation.z=(hs(i,s+2)-0.5)*0.5; } }); },
    pyre(g,T,an){ [-1,1].forEach(s=>{ const p=group(s*SPR,0,0,g); for(let i=0;i<6;i++){ const b=B(1.4,0.16,0.16,0x2a1e18,0,0.1+Math.floor(i/2)*0.14,(i%2?0.3:-0.3),p); b.rotation.y=Math.floor(i/2)*1.05; } themeFire(p,an,0,0.45,0,1.6,T); }); },
    tesla(g,T,an,X){ [-1,1].forEach(s=>{ const p=group(s*SPR,0,0,g); Cy(0.3,0.45,0.4,8,0x3a3a40,0,0,0,p); Cy(0.08,0.14,2.4,6,0xb87040,0,0.4,0,p); [0.9,1.5,2.1].forEach((y,k)=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(0.3-k*0.06,0.04,5,12),mt(0xd09050)); r.rotation.x=Math.PI/2; r.position.y=y; p.add(r); });
      const ball=Sp(0.2,glow(0xc8d8ff),0,2.9,0,p,10,8); ball.userData.keep=true; const arc=B(0.04,1.4,0.04,glow(0xe8f0ff),0,2.2,0,p); arc.userData.keep=true; arc.visible=false; an.push(t=>{ const on=Math.sin(t*23+s*5)>0.92; arc.visible=on; arc.rotation.z=Math.sin(t*41)*0.9; ball.scale.setScalar(on?1.3:1); }); }); },
    kneelers(g,T){ [-1,1].forEach(s=>[0,1].forEach(k=>{ const p=group(s*(SPR-0.6+k*1.3),0,-0.6+k*1.4,g); p.rotation.y=s>0?-Math.PI/2:Math.PI/2; const st=0x4a4654;
      B(0.6,0.2,0.6,dk(st,0.8),0,0,0,p); B(0.36,0.3,0.4,st,0,0.2,0.05,p); B(0.4,0.5,0.28,st,0,0.48,-0.05,p); Sp(0.13,st,0,1.1,-0.05,p,8,6); B(0.05,1.1,0.05,st,0.12,0.2,0.18,p); B(0.24,0.04,0.05,st,0.12,0.9,0.18,p); })); },
    rift(g,T,an){ [-1,1].forEach(s=>{ const p=group(s*SPR,0,0,g); const d=new THREE.Mesh(new THREE.CircleGeometry(0.9,20),new THREE.MeshBasicMaterial({color:0x05000a,side:THREE.DoubleSide})); d.position.y=1.6; d.userData.keep=true; p.add(d);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(0.92,0.06,6,24),glow(T.mark)); ring.position.y=1.6; ring.userData.keep=true; p.add(ring); an.push(t=>{ d.lookAt(ENGINE.P.x,1.6,ENGINE.P.z); ring.quaternion.copy(d.quaternion); ring.scale.setScalar(1+Math.sin(t*3+s)*0.05); });
      for(let i=0;i<4;i++){ const r=B(0.3,0.24,0.28,0x2a2228,Math.cos(i*1.6)*1.4,1.0,Math.sin(i*1.6)*1.4,p); r.userData.keep=true; const k=i+s; an.push(t=>{ r.position.y=1.0+Math.sin(t*0.8+k)*0.3; r.rotation.y=t*0.3+k; }); } }); } };

  // an angel of stone either side of the dais, wings up, a sword point-down before it
  function angel(g,T,x,z,face){ const a=group(x,0,z,g); a.rotation.y=face; const st=dk(T.wall,1.35);
    B(0.9,0.5,0.9,dk(T.wall,0.85),0,0,0,a); B(0.96,0.08,0.96,T.trim,0,0.5,0,a); Co(0.36,1.5,8,st,0,0.58,0,a); B(0.4,0.5,0.26,st,0,1.6,0,a); Sp(0.15,st,0,2.28,0,a,10,8);
    [-1,1].forEach(s=>{ const w=B(0.08,1.4,0.5,st,s*0.32,1.4,-0.28,a); w.rotation.z=-s*0.35; w.rotation.x=-0.25; }); B(0.06,1.3,0.04,0xc8c8d0,0,0.6,0.32,a); B(0.32,0.05,0.06,T.trim,0,1.6,0.32,a); B(0.08,0.12,0.08,T.trim,0,1.68,0.32,a); }

  // how solid each piece is (its radius, before the scatter's 1.35×): you walk round these, not through them
  const SOLIDR={pew:0.45,urn:0.25,anvil:0.38,rack:0.45,ironcrate:0.36,chainpile:0.25,coral:0.25,stump:0.34,pots:0.32,crystal:0.3,icicles:0.28,beam:0.45,rod:0.18,armour:0.28,shard:0.3,floater:0.25,knot:0.38,books:0.2,candles:0.2,rubble:0.3,shrooms:0.18};
  // the guardian's pair in the plaza: where each one stands (offsets from the pair's centre) and how wide
  const CENTRER=(k,S)=>({candelabra:[[-S,0,0.3],[S,0,0.3]],forge:[[-S,0,0.62],[S,0,0.62]],pools:[[-(S+0.2),0.4,0.35],[S+0.2,0.4,0.35]],rootmass:[[-S,0,0.75],[S,0,0.75]],emberpit:[[-S,0,1.0],[S,0,1.0]],spire:[[-S,0,0.55],[S,0,0.55]],
    pyre:[[-S,0,0.8],[S,0,0.8]],tesla:[[-S,0,0.45],[S,0,0.45]],kneelers:[[-(S-0.6),-0.6,0.4],[S-0.6,-0.6,0.4],[-(S+0.7),0.8,0.4],[S+0.7,0.8,0.4]],rift:[[-S,0,0.4],[S,0,0.4]]})[k]||[];
  function dress(X){ const T=X.T, f=X.f, at=X.at, CW=X.CW, an=X.an, deco=group(0,0,0,X.room), keep=group(0,0,0,X.room);
    // nothing solid goes near a way in or out, or where you arrive: you must never be set down on top of a furnishing
    const doors=[]; for(let y=0;y<X.H;y++) for(let x=0;x<X.W;x++){ const t=at(x,y); if(t===8||t===2||t===9) doors.push([x+0.5,y+0.5]); } if(f.arrive) doors.push([f.arrive.x+0.5,f.arrive.y+0.5]);
    const nearDoor=(x,z,r)=>doors.some(([a,b])=>Math.hypot(a-x,b-z)<(r||3));
    const BL=X.blockers=X.blockers||[], block=(x,z,r)=>{ if(nearDoor(x,z,2.2+r)) return false; BL.push({x,z,r}); return true; };
    if(f.type==='library') return restRoom(X,deco,keep,block);   // the resting-room: the guardian's mark never reached it
    const OPEN=X.OPEN, lay=f.layout||null, rnd=(x,y,s)=>hs(x,y,s+X.i*31+X.town*97);
    const isFloor=(x,y)=>at(x,y)===0, inRoom=(x,y)=>!lay||lay.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
    // ── against the walls: the theme's growth, and banners in the rooms ──
    X.wl.forEach(([x,y])=>{ const o=[[0,1],[0,-1],[1,0],[-1,0]].find(([a,b])=>isFloor(x+a,y+b)); if(!o) return; const ox=x+o[0], oy=y+o[1];
      const px=x+0.5+o[0]*(0.52-X.WI.m), pz=y+0.5+o[1]*(0.52-X.WI.m), r=rnd(x,y,3), face=Math.atan2(o[0],o[1]);
      if(r<0.1&&inRoom(ox,oy)){ const b=new THREE.Mesh(new THREE.PlaneGeometry(0.8,2.0),bannerMat(T)); const gg=group(px+o[0]*0.04,0,pz+o[1]*0.04,deco); gg.rotation.y=face; b.position.set(0,CW-1.25,0.02); b.userData.keep=true; gg.add(b);   /* kept whole: the merge drops uv */ B(0.96,0.05,0.06,T.trim,0,CW-0.24,0.04,gg); }
      else if(r<0.1+(OPEN?0.24:0.1)){ const gg=group(px,0,pz,deco); gg.rotation.y=face; W[T.wallKind](gg,T,T.wallKind==='sconce'?an:CW); }
      // V194 — GOTHIC: tall pointed windows of stained glass along the halls, lit from without, in a moulded frame
      else if(rnd(x,y,7)<(OPEN?0.2:0.12)&&inRoom(ox,oy)&&CW>2){ const gg=group(px+o[0]*0.03,0,pz+o[1]*0.03,deco); gg.rotation.y=face; const ww=0.5, hh=Math.min(2.0,CW-0.7), y0=0.55;
        const sh=new THREE.Shape(); sh.moveTo(-ww/2,0); sh.lineTo(-ww/2,hh-ww*0.62); sh.quadraticCurveTo(-ww/2,hh-ww*0.12,0,hh); sh.quadraticCurveTo(ww/2,hh-ww*0.12,ww/2,hh-ww*0.62); sh.lineTo(ww/2,0); sh.lineTo(-ww/2,0);
        const gl=new THREE.ShapeGeometry(sh,8), uv=gl.attributes.uv, pp=gl.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,(pp.getX(i)+ww/2)/ww,pp.getY(i)/hh);
        const g2=new THREE.Mesh(gl,lancet(T)); g2.position.set(0,y0,0.01); g2.userData.keep=true; gg.add(g2);
        const fr=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sh.getPoints(16).map(p=>new THREE.Vector3(p.x*1.08,p.y*1.03,0))),40,0.035,4,true),mt(T.trim)); fr.position.set(0,y0-0.02,0.03); gg.add(fr);
        B(ww+0.2,0.08,0.14,dk(T.wall,1.2),0,y0-0.08,0.04,gg); } });
    // ── on the floor: the theme's clutter along the walls of the rooms ──
    const H=X.H, Wd=X.W; for(let y=1;y<H-1;y++) for(let x=1;x<Wd-1;x++){ if(!isFloor(x,y)||!inRoom(x,y)||nearDoor(x+0.5,y+0.5,3)) continue; const nb=[[0,1],[0,-1],[1,0],[-1,0]].filter(([a,b])=>at(x+a,y+b)===1); if(nb.length!==1) continue;
      if(rnd(x,y,5)>(OPEN?0.22:0.06)) continue; const [a,b]=nb[0], kind=T.scatter[Math.floor(rnd(x,y,6)*T.scatter.length)], gg=group(x+0.5+a*0.15,0,y+0.5+b*0.15,deco); gg.rotation.y=Math.atan2(-a,-b); gg.scale.setScalar(1.35); P[kind](gg,T,an); if(SOLIDR[kind]) block(gg.position.x,gg.position.z,SOLIDR[kind]*1.35); }
    // ── seams of light in the floor (embers, the void) ──
    if(T.seams){ for(let y=1;y<H-1;y++) for(let x=1;x<Wd-1;x++){ if(!isFloor(x,y)||rnd(x,y,8)>0.05) continue; let px=x+0.2+rnd(x,y,9)*0.6, pz=y+0.2+rnd(x,y,10)*0.6, a=rnd(x,y,11)*6.28; for(let k=0;k<3;k++){ const L=0.3+rnd(x,y,12+k)*0.35; a+=(rnd(x,y,15+k)-0.5)*1.4; const s=B(L,0.012,0.03,glow(T.seams),px+Math.cos(a)*L/2,0.005,pz-Math.sin(a)*L/2,deco); s.rotation.y=a; px+=Math.cos(a)*L; pz-=Math.sin(a)*L; } } }
    // ── the plaza: a runner up to the dais, light falling on it, an angel either side, the guardian's mark at its heart; a chandelier ──
    const plaza=lay&&lay.find(r=>r.kind==='plaza');
    if(plaza&&f.podium){ const cx=f.podium.x+0.5, cz=f.podium.y+0.5, run=dk(T.banner,0.62);
      for(let y=plaza.y;y<plaza.y+plaza.h;y++){ if(at(f.podium.x,y)!==0) continue; B(1.5,0.02,1.0,run,cx,0.0,y+0.5,deco); B(0.08,0.025,1.0,T.trim,cx-0.78,0,y+0.5,deco); B(0.08,0.025,1.0,T.trim,cx+0.78,0,y+0.5,deco); }
      angel(deco,T,cx-3.0,cz-2.4,0); angel(deco,T,cx+3.0,cz-2.4,0);
      const C=group(cx,0,cz+0.5,keep); CENTRE[T.centre](C,T,an,X); CENTRER(T.centre,SPR).forEach(([dx,dz,r])=>block(cx+dx,cz+0.5+dz,r));
      const V=vault(X,deco,keep,{x:plaza.x,y:plaza.y,w:plaza.w,h:plaza.h},false), VT=CW+V.top;
      const sh=new THREE.Mesh(new THREE.CylinderGeometry(1.0,2.4,VT,10,1,true),new THREE.MeshBasicMaterial({color:T.lamp,transparent:true,opacity:0.04,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      sh.position.set(cx,VT/2,cz); sh.renderOrder=3; keep.add(sh); an.push(t=>{ sh.material.opacity=0.035+Math.sin(t*0.7)*0.01; });
      chandelier(keep,T,an,cx,cz+3.2,CW+V.vh,2.0); }
    if(lay) lay.forEach(r=>{ if(r.kind!=='room'||r.w<9) return; const cx=r.x+r.w/2, cz=r.y+r.h/2; if(isFloor(Math.floor(cx),Math.floor(cz))) chandelier(keep,T,an,cx,cz,CW+(r.raised?1:0)); });
    // the tombs of the faithful in the side rooms: a carved lid, the town's colour laid over it, candles at the head
    (f.tombs||[]).forEach(t=>{ const g=group(t.x+0.5,0,t.y+1,deco), st=dk(T.wall,1.25); B(0.9,0.62,1.86,dk(T.wall,0.95),0,0,0,g); B(1.0,0.1,1.96,st,0,0.62,0,g); B(0.5,0.06,1.5,T.banner,0,0.72,0,g); B(0.08,0.07,0.9,T.trim,0,0.74,0.1,g); B(0.4,0.07,0.08,T.trim,0,0.74,-0.15,g);
      B(1.02,0.12,1.98,dk(T.wall,0.7),0,0,0,g); [-0.3,0.3].forEach(x=>{ Cy(0.04,0.04,0.2,5,0xf0e8d0,x,0.72,-0.82,g); Co(0.04,0.11,5,glow(T.fire[1]),x,0.92,-0.82,g); }); });
    // each chamber: an inlay in the floor (a ring and a cross, in the trim's colour), and a standing lamp in each corner
    if(lay) lay.forEach(r=>{ if(r.kind!=='room'&&r.kind!=='entry') return; const cx=r.x+r.w/2, cz=r.y+r.h/2, y0=r.raised?1.0:0, rr=Math.min(r.w,r.h)/2-1.6;
      if(rr>1.2){ const ring=new THREE.Mesh(new THREE.RingGeometry(rr-0.12,rr,40),mt(dk(T.trim,0.72))); ring.rotation.x=-Math.PI/2; ring.position.set(cx,y0+0.012,cz); deco.add(ring);
        const ring2=new THREE.Mesh(new THREE.RingGeometry(rr-0.5,rr-0.42,40),mt(dk(T.trim,0.55))); ring2.rotation.x=-Math.PI/2; ring2.position.set(cx,y0+0.012,cz); deco.add(ring2);
        if(!(f.tombs||[]).some(t=>t.x>=r.x&&t.x<r.x+r.w&&t.y>=r.y&&t.y<r.y+r.h)){ B(0.14,0.014,(rr-0.5)*2,dk(T.trim,0.72),cx,y0,cz,deco); B((rr-0.5)*1.3,0.014,0.14,dk(T.trim,0.72),cx,y0,cz-(rr-0.5)*0.3,deco); } }
      [[1.5,1.5],[r.w-1.5,1.5],[1.5,r.h-1.5],[r.w-1.5,r.h-1.5]].forEach(([dx,dz])=>{ const x=r.x+dx, z=r.y+dz; if(!isFloor(Math.floor(x),Math.floor(z))&&at(Math.floor(x),Math.floor(z))!==60) return; if(nearDoor(x,z,3)) return; const g=group(x,y0,z,deco);
        block(x,z,0.3); Cy(0.22,0.3,0.12,8,dk(T.wall,0.8),0,0,0,g); Cy(0.05,0.08,1.5,6,T.trim,0,0.12,0,g); Cy(0.26,0.12,0.18,8,T.trim,0,1.62,0,g); Co(0.16,0.4,6,glow(T.fire[0]),0,1.74,0,g); Co(0.09,0.28,6,glow(T.fire[1]),0,1.76,0,g); }); });
    // the stair room: the runner on to the stair
    const st=lay&&lay.find(r=>r.kind==='stair'); if(st){ for(let y=st.y+2;y<st.y+st.h;y++){ const x=f.cxm; if(at(x,y)===0) B(1.5,0.02,1.0,dk(T.banner,0.62),x+0.5,0,y+0.5,deco); } }
    if(lay&&X.addSpot) interact(X,deco,keep,lay,block,(x,y)=>isFloor(x,y)&&!nearDoor(x+0.5,y+0.5,2.5));
    if(X.top) sanctum(X,deco,keep,block);
    if(T.motes) motes(X,T);
    // the lightning: now and then the halls go white, and the thunder follows
    if(T.lightning){ let next=3+Math.random()*5, fl=0; const base=X.hemi.intensity, bgc=X.bg.clone(); an.push((t,dt)=>{ dt=dt||0.016; next-=dt; if(next<0){ fl=1; next=4+Math.random()*7; }
      if(fl>0){ fl=Math.max(0,fl-dt*(fl>0.6?2.5:5)); const k=fl>0.75||(fl>0.3&&fl<0.45)?1:0.25*fl; X.hemi.intensity=base+k*1.6; X.bg.copy(bgc).lerp(new THREE.Color(0x8a90b8),k*0.5); } else { X.hemi.intensity=base; X.bg.copy(bgc); } }); }
    if(typeof mergeStatic==='function') mergeStatic(deco);
    return {deco,vaults:X.vaults||[]}; }
  function chandelier(g,T,an,x,z,CW,ch){ ch=ch||1.1; const c=group(x,CW-ch,z,g); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.04,5,16),mt(T.trim)); ring.rotation.x=Math.PI/2; c.add(ring);
    B(0.03,ch,0.03,0x2a2a2a,0,0,0,c); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; Cy(0.03,0.03,0.12,5,0xf0e8d0,Math.cos(a)*0.6,0.02,Math.sin(a)*0.6,c); Co(0.05,0.15,5,glow(T.fire[1]),Math.cos(a)*0.6,0.14,Math.sin(a)*0.6,c); } }

  // ── things to do in the halls: a stone bench in each side chamber to sit on (it mends you a little), votive jars along the
  //    walls to smash (coins, now and then a mending draught), and a prayer-stand in the hall you arrive in (once a floor) ──
  const VERSES=['“Come unto me, all ye that labour and are heavy laden, and I will give you rest.” — Matthew 11:28','“He giveth power to the faint; and to them that have no might he increaseth strength.” — Isaiah 40:29',
    '“The LORD is my strength and my shield; my heart trusted in him, and I am helped.” — Psalm 28:7','“Be strong and of a good courage; be not afraid… for the LORD thy God is with thee whithersoever thou goest.” — Joshua 1:9',
    '“God is our refuge and strength, a very present help in trouble.” — Psalm 46:1'];
  function interact(X,deco,keep,lay,block,isFloor){ const T=X.T, at=X.at, an=X.an, R=()=>X.R()||{}, S=()=>GAME.S, I=X.i, dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
    const heal=fr=>{ const s=S(), before=s.hp; s.hp=Math.min(s.maxHp,Math.round(s.hp+(s.maxHp-s.hp)*fr+1)); ENGINE.hud&&ENGINE.hud(); GAME.changed(); return s.hp-before; };
    // a wall cell's open side: the bench or jar backs onto the wall and faces the room
    const wallSide=(x,y)=>[[0,-1],[0,1],[-1,0],[1,0]].find(([a,b])=>at(x+a,y+b)===1&&at(x-a,y-b)===0);
    lay.forEach((r,ri)=>{
      if(r.kind==='room'&&!r.raised){   // the bench: centred on the chamber's far wall, if that wall is whole there
        for(const [bx,by] of [[Math.floor(r.x+r.w/2),r.y],[Math.floor(r.x+r.w/2)-2,r.y],[Math.floor(r.x+r.w/2)+2,r.y]]){ if(!isFloor(bx,by)||!isFloor(bx-1,by)||!isFloor(bx+1,by)||at(bx,by-1)!==1||at(bx-1,by-1)!==1||at(bx+1,by-1)!==1) continue;
          const g=group(bx+0.5,0,by+0.42,deco), st=dk(T.wall,1.2); B(1.6,0.08,0.5,st,0,0.38,0,g); [-0.62,0.62].forEach(x=>B(0.22,0.38,0.42,dk(T.wall,0.9),x,0,0,g)); B(1.4,0.06,0.44,T.banner,0,0.46,0,g);
          block(bx+0.5,by+0.42,0.55); block(bx-0.2,by+0.42,0.45); block(bx+1.2,by+0.42,0.45);
          X.addSpot({x:bx+0.5,z:by+1.1,r:1.1,label:'Sit',who:'A stone bench',action:()=>{ const k='b'+I+':'+bx+','+by, Rr=R(); Rr.sat=Rr.sat||{}; const fresh=!Rr.sat[k]||performance.now()-Rr.sat[k]>45000;
            if(X.sitAt(bx+0.5,by+0.55,0,2.6,()=>{ if(fresh){ Rr.sat[k]=performance.now(); const h=heal(0.25); UI.toast(h>0?`🪑 You catch your breath. +${h} HP`:'🪑 You catch your breath.',1500); } else UI.toast('🪑 A moment\'s rest — your legs thank you.',1200); })) UI.toast('🪑 You sit a moment on the cold stone…',1200); }});
          break; } }
      // votive jars: two or three to a chamber, along its walls
      if(r.kind==='room'||r.kind==='plaza'){ let n=0; const want=r.kind==='plaza'?3:2;
        const per=[]; for(let x=r.x+1;x<r.x+r.w-1;x++){ per.push([x,r.y],[x,r.y+r.h-1]); } for(let y=r.y+1;y<r.y+r.h-1;y++){ per.push([r.x,y],[r.x+r.w-1,y]); }
        for(let k=0;k<40&&n<want;k++){ const [x,y]=per[Math.floor(hs(ri,k,7)*per.length)]; if(!isFloor(x,y)||!isFloor(x+1,y)&&!isFloor(x-1,y)) continue; const ws=[[0,-1],[0,1],[-1,0],[1,0]].find(([a,b])=>at(x+a,y+b)===1); if(!ws) continue;
          const id=I+':'+x+','+y, jx=x+0.5+ws[0]*0.2, jz=y+0.5+ws[1]*0.2; if((R().smashed||{})[id]) { n++; continue; }
          const g=group(jx,0,jz,keep), clay=[0x9a5a32,0x8a6a4a,dk(T.banner,1.1)][n%3]; Cy(0.15,0.2,0.42,9,clay,0,0,0,g); Cy(0.1,0.15,0.12,9,clay,0,0.42,0,g); Cy(0.12,0.12,0.04,9,dk(clay,0.7),0,0.54,0,g); Cy(0.205,0.205,0.04,9,T.trim,0,0.22,0,g);
          const bl={x:jx,z:jz,r:0.22}; X.blockers.push(bl);
          const sp={x:jx,z:jz,r:0.95,label:'Smash',who:'A votive jar',action:()=>{ const Rr=R(); Rr.smashed=Rr.smashed||{}; if(Rr.smashed[id]) return; Rr.smashed[id]=true; g.visible=false; bl.r=0; const li=ENGINE.level.spots.indexOf(sp); if(li>=0) ENGINE.level.spots.splice(li,1);
              for(let q=0;q<8;q++){ const sh=B(0.08,0.06,0.05,clay,0,0,0,X.room); sh.position.set(jx,0.3,jz); const v=[Math.cos(q*0.8)*1.6,2.2+Math.random(),Math.sin(q*0.8)*1.6]; let tt=0; const fly=(t,dt)=>{ dt=dt||0.016; tt+=dt; sh.position.x+=v[0]*dt; sh.position.z+=v[2]*dt; v[1]-=9*dt; sh.position.y=Math.max(0.03,sh.position.y+v[1]*dt); sh.rotation.x+=dt*9; if(tt>1.4){ X.room.remove(sh); an.splice(an.indexOf(fly),1); } }; an.push(fly); }
              const roll=hs(jx*7,jz*7,I); if(roll<0.6){ const gp=Math.round((4+X.tier*3)*(0.6+roll)*(S().goldMult||1)); GAME.addGold(gp); UI.toast(`🏺 Crack! ${gp} gold in the shards.`,1300); }
              else if(roll<0.82){ const h=heal(0.3); UI.toast(`🏺 A little flask was hidden inside — +${h} HP.`,1500); } else UI.toast('🏺 Only dust, and a dry flower.',1100); }};
          X.addSpot(sp); n++; } }
      // the prayer-stand, by the wall of the hall you come in by
      if(r.kind==='entry'){ for(const [px,py] of [[r.x,Math.floor(r.y+r.h/2)],[r.x+r.w-1,Math.floor(r.y+r.h/2)]]){ const ws=[[-1,0],[1,0]].find(([a])=>at(px+a,py)===1); if(!isFloor(px,py)||!ws) continue;
          const g=group(px+0.5+ws[0]*0.1,0,py+0.5,deco); g.rotation.y=ws[0]<0?Math.PI/2:-Math.PI/2; B(0.7,0.14,0.4,dk(T.banner,0.8),0,0,0.25,g); B(0.62,0.85,0.12,dk(T.wall,1.15),0,0,-0.12,g); B(0.66,0.06,0.3,T.trim,0,0.85,-0.05,g);
          B(0.06,0.7,0.04,T.trim,0,1.3,-0.38,g); B(0.36,0.06,0.04,T.trim,0,1.75,-0.38,g); Co(0.03,0.08,5,glow(T.fire[1]),-0.22,0.92,-0.05,g); Co(0.03,0.08,5,glow(T.fire[1]),0.22,0.92,-0.05,g);
          block(px+0.5+ws[0]*0.2,py+0.5,0.38);
          X.addSpot({x:px+0.5-ws[0]*0.5,z:py+0.5,r:1.0,label:'Pray',who:'A prayer-stand',action:()=>{ const Rr=R(); Rr.prayed=Rr.prayed||{}; const v=VERSES[(I+X.tier)%VERSES.length];
            if(Rr.prayed[I]){ ENGINE.speak('A prayer-stand',['You kneel again, and the quiet holds.',v]); return; } Rr.prayed[I]=true; ENGINE.hold(1.6,'sit'); const h=heal(0.5); ENGINE.speak('You kneel and pray',[v,`Strength comes back into your arms. (+${h} HP)`]); }});
          break; } }
    }); }
  // ── the resting-room by the fire: a warm, low, timbered hall the guardian never reached. Planked floor, a great round rug,
  //    a hearth in the middle with a copper hood, the deep wing-chair (rest: mended, and you wake here if you fall), a settle across
  //    the fire, shelves of books to the ceiling, moonlit windows with cushioned seats, a long table laid with bread, a cat asleep
  //    on the rug, herbs hung from the beams — and the fire crackling. ──
  const FIRE={ ctx:null, src:null, gain:null,
    start(){ try{ const C=this.ctx||(this.ctx=new (window.AudioContext||window.webkitAudioContext)()); if(C.state==='suspended') C.resume(); if(this.src) return;
        const n=C.sampleRate*4, buf=C.createBuffer(1,n,C.sampleRate), d=buf.getChannelData(0); let lp=0;
        for(let i=0;i<n;i++){ lp=lp*0.985+(Math.random()*2-1)*0.015; d[i]=lp*1.6; if(Math.random()<0.0009){ const L=40+Math.random()*260, a=0.25+Math.random()*0.5; for(let j=0;j<L&&i+j<n;j++) d[i+j]+=(Math.random()*2-1)*a*Math.exp(-j/(L*0.25)); } }
        const s=C.createBufferSource(); s.buffer=buf; s.loop=true; const f=C.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2600; const g=C.createGain(); g.gain.value=0; s.connect(f); f.connect(g); g.connect(C.destination); s.start();
        g.gain.linearRampToValueAtTime(0.32,C.currentTime+1.5); this.src=s; this.gain=g; }catch(e){} },
    stop(){ try{ if(!this.src) return; const s=this.src, g=this.gain, C=this.ctx; g.gain.linearRampToValueAtTime(0,C.currentTime+0.6); setTimeout(()=>{ try{ s.stop(); }catch(e){} },700); this.src=null; }catch(e){} } };
  function rugTex(){ const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'), o=128;
    const rings=['#4a1a1e','#a8844a','#5e2224','#24304a','#6a2e26','#b8955a','#3e1418']; rings.forEach((col,i)=>{ x.fillStyle=col; x.beginPath(); x.arc(o,o,124-i*16,0,7); x.fill(); });
    x.strokeStyle='#c8a868'; x.lineWidth=3; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; x.beginPath(); x.moveTo(o+Math.cos(a)*30,o+Math.sin(a)*30); x.lineTo(o+Math.cos(a)*110,o+Math.sin(a)*110); x.stroke(); }
    x.fillStyle='#c8a868'; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; x.beginPath(); x.arc(o+Math.cos(a)*100,o+Math.sin(a)*100,4,0,7); x.fill(); } return new THREE.CanvasTexture(c); }
  function restRoom(X,deco,keep,block){ const T=X.T, at=X.at, an=X.an, CW=X.CW, W=X.W, H=X.H, f=X.f, R=()=>X.R()||{}, S=()=>GAME.S, dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
    const isF=(x,y)=>{ const t=at(x,y); return t===0; }; let hx=W>>1, hy=H>>1, cx=hx+1, cy=hy; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=at(x,y); if(t===22){ hx=x; hy=y; } if(t===23){ cx=x; cy=y; } }
    const HX=hx+0.5, HZ=hy+0.5;
    // the light: warm through and through
    X.bg.setHex(0x1a0f08); if(X.scene.fog){ X.scene.fog.color.setHex(0x1a0f08); X.scene.fog.near=12; X.scene.fog.far=34; } X.hemi.color.setHex(0xf2e2cc); X.hemi.groundColor.setHex(0x3a2a20); X.hemi.intensity=0.58;
    const fireL=new THREE.PointLight(0xffa860,1.9,12,1.5); fireL.position.set(HX,1.3,HZ); X.scene.add(fireL); const winL=new THREE.PointLight(0x8aa8e8,0.5,9,1.6); winL.position.set(W/2,2.4,2); X.scene.add(winL);
    an.push(t=>{ fireL.intensity=1.8+Math.sin(t*7.3)*0.16+Math.sin(t*13.1)*0.12+Math.sin(t*2.1)*0.1; });
    // the floor: planks, warm and worn
    const PL=[0x5a3e2a,0x63452e,0x523824,0x6a4a32,0x5c4028];
    for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){ if(at(x,y)===1) continue; for(let k=0;k<2;k++){ const c=PL[Math.floor(hs(x,y,k)*PL.length)]; B(1.0,0.03,0.48,c,x+0.5,0.0,y+0.25+k*0.5,deco); } }
    // the timbered roof: boards, and beams across every two paces
    { const rf=new THREE.Mesh(new THREE.PlaneGeometry(W,H),mt(0x3a2416)); rf.rotation.x=Math.PI/2; rf.position.set(W/2,CW,H/2); deco.add(rf);
      for(let y=1;y<H;y+=2) B(W,0.24,0.26,0x4a2e18,W/2,CW-0.24,y,deco); B(0.3,0.3,H,0x54341c,W/2,CW-0.3,H/2,deco); }
    // herbs and lanterns hung from the beams
    for(let i=0;i<14;i++){ const x=2+hs(i,1,3)*(W-4), z=2+hs(i,2,3)*(H-4); if(Math.hypot(x-HX,z-HZ)<2) continue; const y0=CW-0.24; const g=group(x,0,Math.round(z/2)*2,deco);
      if(i%3===0){ B(0.015,0.5,0.015,0x2a2a2a,0,y0-0.5,0,g); Cy(0.09,0.11,0.18,6,0x3a2a1a,0,y0-0.7,0,g); Co(0.04,0.1,5,glow(0xffd27a),0,y0-0.66,0,g); }
      else for(let k=0;k<3;k++){ B(0.01,0.25,0.01,0x6a5a3a,(k-1)*0.08,y0-0.25,0,g); Co(0.05,0.28,5,[0x4a6a2a,0x6a7a3a,0x8a6a8a][(i+k)%3],(k-1)*0.08,y0-0.55,0,g).rotation.x=Math.PI; } }
    // the rug
    { const rug=new THREE.Mesh(new THREE.CircleGeometry(3.1,40),new THREE.MeshLambertMaterial({map:rugTex()})); rug.rotation.x=-Math.PI/2; rug.position.set(HX+0.5,0.04,HZ); rug.userData.keep=true; keep.add(rug); }
    // the hearth: a ring of stones, logs, the fire, a copper hood and its chimney up through the roof, a kettle hung over it
    { const g=group(HX,0,HZ,keep); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; const st=B(0.26,0.2,0.2,[0x6a6260,0x5a5452,0x7a7068][i%3],Math.cos(a)*0.62,0.04,Math.sin(a)*0.62,g); st.rotation.y=-a; }
      const bed=new THREE.Mesh(new THREE.CircleGeometry(0.55,16),new THREE.MeshBasicMaterial({color:0xff6a1a})); bed.rotation.x=-Math.PI/2; bed.position.y=0.06; g.add(bed);
      [0,1.1,2.2].forEach(a=>{ const l=Cy(0.07,0.08,0.9,6,0x4a2e18,0,0.12,0,g); l.rotation.set(Math.PI/2,0,0); l.rotation.y=a; l.position.y=0.14; });
      themeFire(g,an,0,0.12,0,2.6,{fire:[0xff8a2a,0xffe08a]}); themeFire(g,an,0.18,0.12,0.1,1.2,{fire:[0xff6a1a,0xffd060]}); themeFire(g,an,-0.16,0.12,-0.08,1.3,{fire:[0xff7a2a,0xffe08a]});
      const hood=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.95,0.8,14,1,true),new THREE.MeshPhongMaterial({color:0xb8703a,shininess:70,specular:0x8a5a3a,side:THREE.DoubleSide})); hood.position.y=2.25; g.add(hood);
      Cy(0.22,0.22,CW-2.6,12,0x9a5a2e,0,2.65,0,g); Cy(0.97,0.97,0.06,14,0x8a5028,0,1.84,0,g);
      B(0.02,0.5,0.02,0x2a2a2a,0,1.35,0,g); const kt=Sp(0.16,0x2a2a2e,0,1.18,0,g,10,8); kt.scale.y=0.8; Co(0.05,0.14,6,0x2a2a2e,0.17,1.2,0,g).rotation.z=-1.2; block(HX,HZ,0.85);
      X.addSpot({x:HX,z:HZ,r:1.4,label:'Warm',who:'The hearth',action:()=>{ FIRE.start(); UI.toast('🔥 You hold your hands to the fire. The cold of the halls goes out of them.',2000); }}); }
    // the wing-chair (the rest), its side table with a candle and a cup — and, the first time, something left for you
    { const g=group(cx+0.5,0,cy+0.5,keep); g.rotation.y=-Math.PI/2; const red=0x7a2028, rd=0x5a161c;
      B(0.78,0.42,0.7,rd,0,0,0,g); B(0.66,0.12,0.6,red,0,0.42,0.02,g); B(0.78,0.9,0.18,red,0,0.42,-0.3,g); [-1,1].forEach(sd=>{ B(0.12,0.3,0.62,red,sd*0.39,0.42,0,g); B(0.12,0.55,0.26,red,sd*0.37,0.75,-0.2,g); [-1,1].forEach(z=>Cy(0.03,0.025,0.1,6,0x3a2214,sd*0.32,-0.05,z*0.28,g)); });
      B(0.5,0.1,0.42,T.banner,0,0.54,-0.02,g); const q=B(0.5,0.03,0.7,0xd8c8a0,0.39,0.6,0.02,g); q.rotation.z=-0.5; block(cx+0.5,cy+0.5,0.5);
      const tb=group(cx+0.5,0,cy+1.45,keep); Cy(0.24,0.24,0.04,12,0x5a3a20,0,0.62,0,tb); Cy(0.04,0.06,0.62,6,0x4a2e18,0,0,0,tb); Cy(0.03,0.035,0.16,6,0xf0e8d0,-0.1,0.66,0,tb); themeFlame(-0.1,0.86,0,tb,an,1.3,{fire:[0xff9a3a,0xffe08a]});
      Cy(0.05,0.04,0.08,8,0xe8e0d0,0.08,0.66,0.05,tb); block(cx+0.5,cy+1.45,0.28);
      const fl=group(0.06,0.66,-0.1,tb); Sp(0.06,0xc0303a,0,0.06,0,fl,8,6); Cy(0.02,0.025,0.06,6,0xc0303a,0,0.12,0,fl); Cy(0.025,0.025,0.02,6,0x8a5a2a,0,0.17,0,fl);
      if(R().gift) fl.visible=false;
      const sp={x:cx+0.5,z:cy+1.45,r:0.9,label:'Take',who:'A flask on the side table',action:()=>{ const Rr=R(); if(Rr.gift||!fl.visible){ UI.toast('Just the candle and an empty cup now.',1100); return; } Rr.gift=true; fl.visible=false; const s=S(); s.inventory.potion=(s.inventory.potion||0)+1; GAME.changed(); ENGINE.speak('A flask, and a note',['🧪 A healing draught, stoppered with wax. The note under it, in a careful hand:','“For whoever comes up from below. Sit as long as you need. — the keeper of the fire”']); }};
      X.addSpot(sp); }
    // the settle across the fire, to sit a while
    { const sx=HX-2.0, g=group(sx,0,HZ,deco); g.rotation.y=Math.PI/2; B(1.6,0.08,0.5,0x5a3a20,0,0.42,0,g); B(1.6,0.9,0.08,0x5a3a20,0,0.42,-0.24,g); [-0.75,0.75].forEach(x=>B(0.08,0.42,0.5,0x4a2e18,x,0,0,g)); B(1.4,0.08,0.42,T.banner,0,0.5,0.02,g);
      block(sx,HZ-0.55,0.42); block(sx,HZ+0.55,0.42); block(sx,HZ,0.42);
      X.addSpot({x:sx+0.8,z:HZ,r:1.0,label:'Sit',who:'The settle by the fire',action:()=>{ FIRE.start(); if(X.sitAt(sx,HZ,Math.PI/2,4,()=>{ const s=S(); s.hp=Math.min(s.maxHp,s.hp+Math.ceil(s.maxHp*0.2)); ENGINE.hud&&ENGINE.hud(); GAME.changed(); UI.toast('🔥 Warm through. (The wing-chair is the one that keeps your place.)',1800); })) UI.toast('🔥 You sit across the fire and watch it for a while…',1600); }}); }
    // the cat, asleep on the rug
    { const g=group(HX+1.0,0.04,HZ-1.5,keep); g.rotation.y=0.6; const fur=0xc87a3a, fd=0x9a5a2a; const body=Sp(0.22,fur,0,0.12,0,g,12,8); body.scale.set(1.3,0.6,1);
      const head=Sp(0.11,fur,0.22,0.1,0.12,g,10,8); [-1,1].forEach(sd=>Co(0.04,0.08,4,fd,0.22+sd*0.06,0.2,0.12,g)); const tail=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.035,6,14,Math.PI*1.2),mt(fd)); tail.rotation.x=Math.PI/2; tail.position.set(0,0.05,0); g.add(tail);
      an.push(t=>{ body.scale.y=0.6+Math.sin(t*1.8)*0.04; head.position.y=0.1+Math.sin(t*1.8)*0.008; }); block(HX+1.0,HZ-1.5,0.3);
      X.addSpot({x:HX+1.0,z:HZ-1.5,r:0.9,label:'Pet',who:'A cat, asleep',action:()=>{ UI.toast(['🐈 It purrs without opening its eyes.','🐈 One ear turns toward you. The purring gets louder.','🐈 It stretches out a paw, and goes back to sleep.'][Math.floor(Math.random()*3)],1600);
        for(let i=0;i<4;i++){ const h=new THREE.Mesh(new THREE.CircleGeometry(0.05,10),new THREE.MeshBasicMaterial({color:0xff8aa0,transparent:true,depthWrite:false})); h.position.set(HX+1.0+(Math.random()-0.5)*0.3,0.4,HZ-1.5); X.scene.add(h); let tt=0; const up=(t,dt)=>{ tt+=dt||0.016; h.position.y+=0.5*(dt||0.016); h.lookAt(ENGINE.cam.position); h.material.opacity=1-tt/1.5; if(tt>1.5){ X.scene.remove(h); an.splice(an.indexOf(up),1); } }; setTimeout(()=>an.push(up),i*180); } }}); }
    // the long table, laid
    { const tx=Math.max(3,hx-7)+0.5, tz=H-5.5, g=group(tx,0,tz,deco); B(2.4,0.08,0.9,0x6a4428,0,0.78,0,g); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.1,0.78,0.1,0x4a2e18,a*1.08,0,b*0.36,g));
      [-1,1].forEach(b=>{ B(2.2,0.06,0.3,0x5a3a20,0,0.44,b*0.75,g); [-0.95,0.95].forEach(a=>B(0.08,0.44,0.26,0x4a2e18,a,0,b*0.75,g)); });
      const bread=Sp(0.18,0xc8904a,-0.5,0.92,0,g,10,6); bread.scale.set(1.4,0.6,0.9); Cy(0.12,0.12,0.1,10,0xf0d070,0.1,0.82,0.1,g); Cy(0.07,0.09,0.24,8,0x8a6a4a,0.6,0.82,-0.1,g); Cy(0.05,0.05,0.1,8,0xd8d0c0,0.3,0.82,0.25,g); Cy(0.05,0.05,0.1,8,0xd8d0c0,-0.2,0.82,-0.25,g);
      Cy(0.03,0.035,0.2,6,0xf0e8d0,1.0,0.82,0,g); themeFlame(1.0,1.06,0,g,an,1.2,{fire:[0xff9a3a,0xffe08a]});
      block(tx-0.6,tz,0.6); block(tx+0.6,tz,0.6);
      X.addSpot({x:tx,z:tz+1.0,r:1.2,label:'Eat',who:'The long table',action:()=>{ const Rr=R(); const s=S(); if(Rr.ate){ UI.toast('🍞 You have eaten your fill. There will be more next time.',1300); return; } Rr.ate=true; s.hp=Math.min(s.maxHp,s.hp+Math.ceil(s.maxHp*0.4)); ENGINE.hud&&ENGINE.hud(); GAME.changed();
        ENGINE.speak('Bread, and honey, and clean water',['You break the bread. It is still warm.','“I am the bread of life: he that cometh to me shall never hunger.” — John 6:35']); }}); }
    // shelves of books to the ceiling, down both long walls
    { const BK=[0x7a2a22,0x2a4a6a,0x4a5a2a,0x6a4a22,0x5a2a5a,0x8a6a3a,0x2a2a3a,0x6a2a3a];
      [[1,1],[W-2,-1]].forEach(([wx,sd])=>{ for(let y=3;y<H-3;y+=1){ if(!isF(wx,y)||at(wx-sd,y)!==1) continue; if(Math.abs(y-hy)<2) continue; const g=group(wx+0.5-sd*0.3,0,y+0.5,deco); g.rotation.y=sd>0?Math.PI/2:-Math.PI/2;
          B(1.0,2.5,0.36,0x4a2e18,0,0,-0.02,g); for(let k=0;k<5;k++){ B(0.96,0.04,0.34,0x5a3a20,0,0.08+k*0.5,0.02,g); let bx=-0.44; while(bx<0.42){ const w=0.05+hs(y,k,bx*10)*0.05, h=0.28+hs(bx*20,k,y)*0.14; B(w,h,0.26,BK[Math.floor(hs(y*3,k,bx*31)*BK.length)],bx+w/2,0.12+k*0.5,0.04,g); bx+=w+0.008; } }
          block(wx+0.5-sd*0.3,y+0.5,0.42); } }); }
    // the windows in the north wall, moonlit, each with a cushioned seat beneath it
    { const glass=new THREE.MeshBasicMaterial({color:0x8aa8d8}); const sx=[W/2-5,W/2+4];
      sx.forEach((x,k)=>{ if(at(Math.floor(x),1)===undefined) return; const g=group(x+0.5,0,1.02,deco); B(1.2,1.6,0.04,glass,0,1.1,0,g); const top=new THREE.Mesh(new THREE.CircleGeometry(0.6,16,0,Math.PI),glass); top.position.set(0,2.7,0.0); g.add(top);
        B(0.08,1.6,0.08,0x3a2416,0,1.1,0.03,g); B(1.2,0.08,0.08,0x3a2416,0,1.9,0.03,g); B(1.4,0.1,0.14,0x3a2416,0,1.05,0.05,g);
        B(1.4,0.42,0.5,0x5a3a20,0,0,0.3,g); B(1.3,0.12,0.44,T.banner,0,0.42,0.3,g); [-0.45,0.45].forEach(cx2=>Sp(0.14,dk(T.banner,1.3),cx2,0.6,0.18,g,8,6).scale.set(1,0.8,0.6));
        const shaft=new THREE.Mesh(new THREE.BoxGeometry(1.1,3.2,0.9),new THREE.MeshBasicMaterial({color:0xa8c0f0,transparent:true,opacity:0.06,depthWrite:false,blending:THREE.AdditiveBlending})); shaft.position.set(x+0.5,1.2,2.3); shaft.rotation.x=0.55; keep.add(shaft);
        block(x+0.5,1.32,0.5); block(x-0.1,1.32,0.4); block(x+1.1,1.32,0.4);
        X.addSpot({x:x+0.5,z:2.0,r:1.0,label:'Sit',who:'The window seat',action:()=>{ if(X.sitAt(x+0.5,1.4,0,3.5,()=>UI.toast(k?'🌙 The stars are out over the hills. Somewhere down there is home.':'🌙 Moonlight on the roofs of the town below. All is quiet.',2400))) UI.toast('🌙 You sit in the window and look out…',1500); }}); }); }
    // plants in the corners
    [[2,2],[W-3,2],[2,H-3],[W-3,H-3]].forEach(([x,y])=>{ if(!isF(x,y)) return; const g=group(x+0.5,0,y+0.5,deco); Cy(0.22,0.17,0.36,8,0xa85a32,0,0,0,g); for(let i=0;i<7;i++){ const l=Co(0.07,0.6+hs(x,y,i)*0.4,5,i%2?0x3a7a3a:0x4a8a42,Math.cos(i)*0.08,0.3,Math.sin(i)*0.08,g); l.rotation.set(Math.sin(i*2)*0.5,0,Math.cos(i*2)*0.5); } block(x+0.5,y+0.5,0.3); });
    // the warm motes over the fire, and the sound of it
    motes(Object.assign({},X,{CW:CW}),{motes:{c:0xffc070,vy:0.3,n:50,s:0.05}});
    if(typeof mergeStatic==='function') mergeStatic(deco);
    return {deco,vaults:[],warmRoof:true,rest:{enter:()=>FIRE.start(),leave:()=>FIRE.stop()}}; }

  // ── a vault over a great room: the walls carried up past the halls' roof (a clerestory with lit windows), a barrel
  //    vault along the room, ribs across it every two paces, and a rose window in the far lunette ──
  function vault(X,deco,keep,r,grand){ const T=X.T, CW=X.CW, VH=grand?2.6:2.0, x0=r.x, x1=r.x+r.w, z0=r.y, z1=r.y+r.h, w=r.w, R=w/2, rise=Math.min(R,grand?4.2:3.2), k=rise/R, cx=(x0+x1)/2;
    const wallM=bmat(T.wall,'brick'), up=CW;
    // the clerestory: four walls from the halls' roof up to the vault's spring
    [[x0-0.2,z0-0.2,x1+0.2,z0],[x0-0.2,z1,x1+0.2,z1+0.2],[x0-0.2,z0,x0,z1],[x1,z0,x1+0.2,z1]].forEach(([a,b,c,d])=>{ const m=new THREE.Mesh(UNIT,wallM); m.scale.set(c-a,VH,d-b); m.position.set((a+c)/2,up,(b+d)/2); keep.add(m); });
    B(w+0.6,0.16,0.3,T.trim,cx,up-0.08,z0+0.1,deco); B(w+0.6,0.16,0.3,T.trim,cx,up-0.08,z1-0.1,deco); B(0.3,0.16,r.h,T.trim,x0+0.1,up-0.08,(z0+z1)/2,deco); B(0.3,0.16,r.h,T.trim,x1-0.1,up-0.08,(z0+z1)/2,deco);   // a string-course where the walls go up
    B(w+0.4,0.14,0.26,T.trim,cx,up+VH-0.14,z0+0.1,deco); B(w+0.4,0.14,0.26,T.trim,cx,up+VH-0.14,z1-0.1,deco); B(0.26,0.14,r.h,T.trim,x0+0.1,up+VH-0.14,(z0+z1)/2,deco); B(0.26,0.14,r.h,T.trim,x1-0.1,up+VH-0.14,(z0+z1)/2,deco);
    // its windows, lit with the theme's sky, along both long sides
    const win=glow(dk(T.sky,0.75)); for(let z=z0+1.5;z<z1-1;z+=2.5){ [x0+0.02,x1-0.02].forEach(x=>{ B(0.04,VH*0.55,0.7,win,x,up+VH*0.18,z,deco); const a=Co(0.5,0.42,4,win,x,up+VH*0.73,z,deco); a.rotation.y=Math.PI/4; a.scale.set(0.06,1,1); }); }
    // the barrel
    // V194 — GOTHIC: the vault is pointed (two-centred), not a round barrel: steep at its springing, meeting in a ridge
    const N=24, prof=[]; for(let i=0;i<=N;i++){ const u=-1+2*i/N; prof.push([cx+u*R, rise*Math.pow(1-Math.abs(u),0.58)]); }
    const bg=new THREE.BufferGeometry(), vp=[], vi=[]; prof.forEach(([x,y])=>{ vp.push(x,up+VH+y,z0, x,up+VH+y,z1); }); for(let i=0;i<N;i++){ const a=i*2; vi.push(a,a+1,a+2, a+1,a+3,a+2); }
    bg.setAttribute('position',new THREE.Float32BufferAttribute(vp,3)); bg.setIndex(vi); bg.computeVertexNormals();
    const pShape=()=>{ const sh=new THREE.Shape(); sh.moveTo(prof[0][0]-cx,0); prof.forEach(([x,y])=>sh.lineTo(x-cx,y)); sh.lineTo(prof[0][0]-cx,0); return sh; };
    const pCurve=(z,inset)=>new THREE.CatmullRomCurve3(prof.map(([x,y])=>new THREE.Vector3(cx+(x-cx)*(1-inset),up+VH+y*(1-inset*0.6),z)));
    const bm=new THREE.Mesh(bg,new THREE.MeshPhongMaterial({color:dk(T.top,0.78),flatShading:true,shininess:4,side:THREE.DoubleSide})); keep.add(bm);
    // ribs across it, and a spine along its crown
    for(let z=z0+1;z<z1;z+=2){ const m=new THREE.Mesh(new THREE.TubeGeometry(pCurve(z,0.03),28,0.09,5,false),mt(T.trim)); deco.add(m);
      // a clustered column under each rib's foot, three shafts and a capital, carrying it down the wall
      [x0+0.16,x1-0.16].forEach(x=>{ [-0.09,0,0.09].forEach((o,i)=>{ const sh=new THREE.Mesh(new THREE.CylinderGeometry(i===1?0.08:0.055,i===1?0.09:0.06,up+VH,7),mt(dk(T.wall,1.18))); sh.position.set(x+(x<cx?0.02:-0.02),(up+VH)/2,z+o); deco.add(sh); });
        const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.12,0.18,8),mt(T.trim)); cap.position.set(x,up+VH-0.09,z); deco.add(cap); }); }
    B(0.22,0.14,r.h,T.trim,cx,up+VH+rise-0.2,(z0+z1)/2,deco);
    // the lunettes: the half-ellipses closing either end — the far one a rose window
    [z0,z1].forEach((z,e)=>{ const lg=new THREE.ShapeGeometry(pShape()); lg.translate(cx,up+VH,z+(e?-0.01:0.01)); const lm=new THREE.Mesh(lg,new THREE.MeshPhongMaterial({color:dk(T.wall,0.9),flatShading:true,side:THREE.DoubleSide})); keep.add(lm);
      if(!e){ const rw=new THREE.Mesh(new THREE.CircleGeometry(Math.min(1.5,rise*0.42),24),roseMat(T)); rw.position.set(cx,up+VH+rise*0.45,z+0.03); rw.userData.keep=true; keep.add(rw);
        const fr=new THREE.Mesh(new THREE.TorusGeometry(Math.min(1.5,rise*0.42),0.09,5,24),mt(T.trim)); fr.position.copy(rw.position); deco.add(fr); } });
    (X.vaults=X.vaults||[]).push({x0,x1,z0,z1,top:VH+rise});
    return {vh:VH,top:VH+rise}; }
  // a rose window: the theme's colours in a wheel of glass about a gold cross
  const RW={}; function roseMat(T){ if(RW[T.key]) return RW[T.key]; const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), col=h=>'#'+new THREE.Color(h).getHexString();
    const cols=[col(T.banner),col(dk(T.sky,0.8)),col(T.trim),col(dk(T.mark,0.8))]; for(let i=0;i<12;i++){ x.fillStyle=cols[i%4]; x.beginPath(); x.moveTo(64,64); x.arc(64,64,64,i/12*Math.PI*2,(i+1)/12*Math.PI*2); x.fill(); }
    x.fillStyle=col(dk(T.sky,0.95)); x.beginPath(); x.arc(64,64,28,0,7); x.fill(); x.strokeStyle='#1a1410'; x.lineWidth=3; for(let i=0;i<12;i++){ x.beginPath(); x.moveTo(64,64); x.lineTo(64+Math.cos(i/12*Math.PI*2)*64,64+Math.sin(i/12*Math.PI*2)*64); x.stroke(); }
    x.beginPath(); x.arc(64,64,28,0,7); x.stroke(); x.fillStyle=col(T.trim); x.fillRect(59,40,10,48); x.fillRect(48,52,32,9);
    return RW[T.key]=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}); }
  // a tall pointed window of stained glass (the sanctum's east end, behind the general)
  function lancet(T){ const key=T.key+'L'; if(RW[key]) return RW[key]; const c=document.createElement('canvas'); c.width=64; c.height=192; const x=c.getContext('2d'), col=h=>'#'+new THREE.Color(h).getHexString();
    const cols=[col(T.banner),col(dk(T.sky,0.8)),col(T.trim),col(dk(T.mark,0.7)),col(dk(T.banner,1.4))]; for(let j=0;j<12;j++) for(let i=0;i<4;i++){ x.fillStyle=cols[(i*3+j*2+((i+j)%3))%5]; x.fillRect(i*16,j*16,16,16); }
    x.strokeStyle='#1a1410'; x.lineWidth=2; for(let i=0;i<=4;i++){ x.beginPath(); x.moveTo(i*16,0); x.lineTo(i*16,192); x.stroke(); } for(let j=0;j<=12;j++){ x.beginPath(); x.moveTo(0,j*16); x.lineTo(64,j*16); x.stroke(); }
    x.fillStyle=col(T.trim); x.fillRect(28,30,8,90); x.fillRect(14,56,36,8);
    return RW[key]=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}); }

  // ── the sanctum: the guardian's throne-hall, the general bound at its head ──
  function sanctum(X,deco,keep,block){ const T=X.T, f=X.f, CW=X.CW, an=X.an, at=X.at, W=X.W, H=X.H; let gx=W>>1, gy=1;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(at(x,y)===7){ gx=x; gy=y; }
    const cx=gx+0.5, r={x:1,y:1,w:W-2,h:H-2}, V=vault(X,deco,keep,r,true);
    // three lancets of stained glass in the wall behind the general, light pouring down from them onto the dais
    [-2.2,0,2.2].forEach((dx,i)=>{ const h=i===1?3.4:2.6, m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,h),lancet(T)); m.position.set(cx+dx,CW+V.vh*0.1+h/2,1.03); m.userData.keep=true; keep.add(m);
      const fr=B(1.4,0.12,0.12,T.trim,cx+dx,CW+V.vh*0.1+h,1.08,deco); B(0.1,h,0.1,T.trim,cx+dx-0.65,CW+V.vh*0.1,1.08,deco); B(0.1,h,0.1,T.trim,cx+dx+0.65,CW+V.vh*0.1,1.08,deco); });
    { const L=CW+V.vh+1.5, sh=new THREE.Mesh(new THREE.BoxGeometry(5.2,L,1.6),new THREE.MeshBasicMaterial({color:T.lamp,transparent:true,opacity:0.05,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      sh.position.set(cx,L/2*Math.cos(0.5),1.2+L/2*Math.sin(0.5)); sh.rotation.x=0.5; sh.renderOrder=3; keep.add(sh); an.push(t=>{ sh.material.opacity=0.035+Math.sin(t*0.6)*0.01; }); }
    // half-columns along the side walls, carrying the vault's ribs down to the floor
    for(let z=3;z<H-2;z+=4) [1.15,W-1.15].forEach(x=>{ Cy(0.3,0.34,CW+V.vh,10,dk(T.wall,1.15),x,0,z,deco); Cy(0.42,0.42,0.3,10,T.top,x,0,z,deco); Cy(0.4,0.34,0.26,10,T.trim,x,CW+V.vh-0.26,z,deco); });
    // a carpet from the doors to the general's feet
    for(let y=gy+1;y<H-1;y++){ if(at(gx,y)!==0) continue; B(2.2,0.02,1.0,dk(T.banner,0.62),cx,0,y+0.5,deco); B(0.1,0.025,1.0,T.trim,cx-1.12,0,y+0.5,deco); B(0.1,0.025,1.0,T.trim,cx+1.12,0,y+0.5,deco); }
    // the angels at the general's side, the guardian's pair out in the hall
    angel(deco,T,cx-3,gy+0.7,0); angel(deco,T,cx+3,gy+0.7,0);
    SPR=8; const C=group(cx,0,gy+2.6,keep); CENTRE[T.centre](C,T,an,X); CENTRER(T.centre,8).forEach(([dx,dz,r])=>block(cx+dx,gy+2.6+dz,r)); SPR=3.6;
    // the seal in the floor: the guardian's mark burning in it — gold, once the guardian falls
    { const rr=Math.min(W,H)*0.26, mz=H*0.55, ringM=new THREE.MeshBasicMaterial({color:T.mark}), r1=new THREE.Mesh(new THREE.RingGeometry(rr-0.14,rr,48),ringM), r2=new THREE.Mesh(new THREE.RingGeometry(rr*0.62-0.1,rr*0.62,40),ringM);
      [r1,r2].forEach(m=>{ m.rotation.x=-Math.PI/2; m.position.set(cx,0.014,mz); m.userData.keep=true; keep.add(m); });
      const spokes=[]; for(let i=0;i<8;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.012,rr*0.38),ringM); const a=i/8*Math.PI*2; s.position.set(cx+Math.sin(a)*rr*0.81,0.014,mz+Math.cos(a)*rr*0.81); s.rotation.y=a; s.userData.keep=true; keep.add(s); }
      const gold=new THREE.Color(T.trim), mk=new THREE.Color(T.mark); an.push(t=>{ const done=X.bossDead&&X.bossDead(); ringM.color.copy(done?gold:mk).multiplyScalar(done?1:0.75+Math.sin(t*2.2)*0.25); }); }
    chandelier(keep,T,an,cx,H*0.55,CW+V.vh,2.2); chandelier(keep,T,an,cx,H*0.25,CW+V.vh,2.0); }
  return dress;
})();

// ── the key chest: an iron-bound coffer on a plinth that rises out of the dais when the last demon falls; Ⓐ throws back
//    its domed lid on a hinge, light spills out, and the iron key lifts, turns in the air and comes to your hand ──
function CHAPEL_CHEST(T){ const dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex(), g=new THREE.Group(), wood=0x5a3418, iron=0x2e2a2c, gold=T?T.trim:0xe8c766;
  const plinth=group(0,0,0,g); Cy(0.55,0.62,0.32,8,dk(T?T.stair:0x8a8494,1.0),0,0,0,plinth); Cy(0.6,0.6,0.05,8,gold,0,0.32,0,plinth);
  const ch=group(0,0.37,0,g);
  B(0.78,0.4,0.5,wood,0,0,0,ch); [-0.3,0,0.3].forEach(x=>B(0.06,0.42,0.52,iron,x,-0.01,0,ch)); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(0.1,0.1,0.1,gold,a*0.37,0.32,b*0.23,ch));
  B(0.14,0.16,0.03,gold,0,0.16,0.26,ch); const hole=B(0.03,0.06,0.02,new THREE.MeshBasicMaterial({color:0xffe9a0}),0,0.18,0.275,ch);
  const inner=B(0.7,0.02,0.42,new THREE.MeshBasicMaterial({color:0xffd870}),0,0.38,0,ch); inner.visible=false;
  // the lid, hinged along the back edge
  const lid=group(0,0.4,-0.25,ch); const dome=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.78,12,1,false,0,Math.PI),mt(wood)); dome.rotation.z=Math.PI/2; dome.position.set(0,0,0.25); dome.scale.set(1,1,0.55); lid.add(dome);
  [-0.3,0,0.3].forEach(x=>{ const bnd=new THREE.Mesh(new THREE.CylinderGeometry(0.258,0.258,0.06,12,1,true,0,Math.PI),mt(iron)); bnd.rotation.z=Math.PI/2; bnd.position.set(x,0,0.25); bnd.scale.set(1,1,0.56); lid.add(bnd); });
  B(0.16,0.12,0.03,gold,0,0.0,0.52,lid);
  // the key inside
  const key=group(0,0.42,0,ch); key.visible=false; const km=new THREE.MeshPhongMaterial({color:0x4a4448,emissive:0x2a1a06,shininess:60,specular:0xc8a060});
  const bow=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.018,6,14),km); bow.position.y=0.1; key.add(bow); const sh=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.2,0.025),km); sh.position.y=-0.03; key.add(sh);
  [[0.035,-0.1],[0.03,-0.06]].forEach(([w,y])=>{ const t=new THREE.Mesh(new THREE.BoxGeometry(w,0.025,0.02),km); t.position.set(w/2+0.01,y,0); key.add(t); });
  const halo=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,8),new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending})); key.add(halo);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.42,3.2,12,1,true),new THREE.MeshBasicMaterial({color:0xffe9a8,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); beam.position.y=1.9; g.add(beam);
  const light=new THREE.PointLight(0xffd480,0,5,1.6); light.position.y=1.0; g.add(light);
  shade(g); let st=null;
  const api={ g, rising:false,
    set(state){ st=null; g.position.y=state==='down'?-0.75:0; lid.rotation.x=state==='open'?-1.95:0; inner.visible=state==='open'; key.visible=false; beam.material.opacity=0; light.intensity=state==='open'?0.4:0; hole.visible=state!=='open'; },
    rise(){ st={k:'rise',t:0}; }, open(onGot){ st={k:'open',t:0,cb:onGot}; inner.visible=true; key.visible=true; key.position.set(0,0.42,0); },
    tick(){ if(!st) return; const now=performance.now()/1000; if(st.t0===undefined) st.t0=now; st.t=now-st.t0; const dt=0;
      if(st.k==='rise'){ const u=Math.min(1,st.t/1.6), e=1-Math.pow(1-u,3); g.position.y=-0.75*(1-e); beam.material.opacity=0.32*Math.sin(Math.min(1,st.t/2.4)*Math.PI); light.intensity=1.6*Math.sin(Math.min(1,st.t/2.4)*Math.PI); if(st.t>=2.4){ beam.material.opacity=0; light.intensity=0; st=null; } }
      else if(st.k==='open'){ const t=st.t; lid.rotation.x=-1.95*Math.min(1,Math.pow(t/0.55,0.7)); light.intensity=Math.min(1.8,t*3); beam.material.opacity=Math.min(0.28,t*0.4);
        if(t>0.45){ const u=Math.min(1,(t-0.45)/1.3); key.position.y=0.42+u*0.9; key.rotation.y=t*5; halo.scale.setScalar(1+Math.sin(t*9)*0.15); }
        if(t>2.0){ const u=Math.min(1,(t-2.0)/0.4); key.scale.setScalar(1-u); if(u>=1&&key.visible){ key.visible=false; if(st.cb) st.cb(); } }
        if(t>2.6){ light.intensity=0.4; beam.material.opacity=0; st=null; } } } };
  return api; }
