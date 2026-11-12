// ════════════════════════════════════════════════════════════════
//  VILLAGE3 (V194) — houses built from Quaternius's Medieval Village MegaKit (CC0; models/look3/village/, licence in
//  models/look3/LICENSE-medieval-village-megakit.txt): real modelled walls, doors, windows with shutters, corner posts,
//  round-tiled roofs with their gable ends, and chimneys — assembled to each house's own footprint and height in the
//  world (so its walls, roof line, doors and collisions stay exactly where the game has them), cel-shaded like the cast.
//  Each town keeps its colours: the kit's textures are taken to grey and tinted by the town's plaster, timber, stone and
//  roof colours.
//   VILLAGE3.house(g, {w, d, h, low, c})  g: the house's group (front at +z), w × d its walls' footprint, h the eave.
//  The old house stays until the pieces have loaded, and wherever they can't be (the artifact, the classic look,
//  ?novillage3).
// ════════════════════════════════════════════════════════════════
const VILLAGE3=(function(){
  const on=()=>!(typeof LOOK2!=='undefined'&&!LOOK2)&&!/[?&]novillage3/.test(location.search)&&!window.NO_VILLAGE3;
  const BASE='models/look3/', DIR=BASE+'village/';
  let libs=null; const src={}, wait={};
  function loadLibs(){ if(libs) return libs; if(THREE.GLTFLoader) return libs=Promise.resolve();
    libs=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=BASE+'GLTFLoader.js'; s.onload=()=>res(); s.onerror=()=>rej(); document.head.appendChild(s); }); return libs; }
  function get(n){ if(src[n]) return Promise.resolve(src[n]); if(wait[n]) return wait[n];
    return wait[n]=loadLibs().then(()=>new Promise((res,rej)=>new THREE.GLTFLoader().load(DIR+n+'.gltf',g=>{ src[n]=g.scene; res(g.scene); },undefined,rej))); }
  // ── cel shading over the kit's own painted textures, taken to grey so a town's colours can tint them ──
  const RAMP=(()=>{ const d=new Uint8Array([120,120,120,255, 190,190,190,255, 245,245,245,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  const SRGB=()=>typeof ENGINE!=='undefined'&&ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding;
  const lin=c=>{ c=new THREE.Color(c); return SRGB()?c.convertSRGBToLinear():c; };
  const GREY=new Map();
  function grey(tex){ if(!tex||!tex.image) return tex; if(GREY.has(tex)) return GREY.get(tex); const im=tex.image, cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height; const x=cv.getContext('2d'); x.drawImage(im,0,0);
    const D=x.getImageData(0,0,cv.width,cv.height), a=D.data; let sum=0; for(let i=0;i<a.length;i+=4) sum+=0.3*a[i]+0.59*a[i+1]+0.11*a[i+2]; const mean=sum/(a.length/4)||128, k=200/mean;   // grey, normalised so the tint reads true
    for(let i=0;i<a.length;i+=4){ const v=Math.min(255,(0.3*a[i]+0.59*a[i+1]+0.11*a[i+2])*k); a[i]=a[i+1]=a[i+2]=v; } x.putImageData(D,0,0);
    const t=new THREE.CanvasTexture(cv); t.wrapS=tex.wrapS; t.wrapT=tex.wrapT; t.flipY=tex.flipY; t.encoding=tex.encoding; GREY.set(tex,t); return t; }
  const MATS=new Map();
  function toon(srcMat,col){ const key=(srcMat.name||'')+'|'+col; if(MATS.has(key)) return MATS.get(key);
    const glass=/Glass/i.test(srcMat.name||''), m=new THREE.MeshToonMaterial({color:lin(glass?0x2a3448:col),gradientMap:RAMP,map:glass?null:grey(srcMat.map),side:srcMat.side});
    m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n { float r=pow(1.0-clamp(dot(normalize(vViewPosition),normalize(vNormal)),0.0,1.0),3.0); gl_FragColor.rgb+=vec3(1.0,0.94,0.8)*r*0.18; }'); };
    m.customProgramCacheKey=()=>'v3toon'; MATS.set(key,m); return m; }
  // the town's colours for each of the kit's materials
  function palette(c){ c=c||{}; const wood=c.beam||0x6b4a2e;
    return {MI_Plaster:c.wall||0xeee4cc, MI_WoodTrim:wood, MI_WoodTrim_Wear:wood, MI_RoundTiles:c.roof||0xb4553a, MI_UnevenBrick:c.wallD||0xa49c8e, MI_RockTrim:c.wallD||0xa49c8e, MI_Brick:c.wallD||0x9a8f80, MI_MetalOrnaments:0x3a3a40, MI_WindowGlass:0x2a3448}; }
  function piece(n,P){ const s=src[n]; if(!s) return null; const o=s.clone(true); o.traverse(m=>{ if(m.isMesh){ const sm=m.material; m.material=Array.isArray(sm)?sm.map(x=>toon(x,P[x.name]!==undefined?P[x.name]:0xffffff)):toon(sm,P[sm.name]!==undefined?P[sm.name]:0xffffff); m.castShadow=true; m.receiveShadow=true; } }); return o; }
  const ROOFS=[[4,4],[4,6],[4,8],[6,6],[6,8],[6,10],[8,8],[8,10]];
  const NEED=['Wall_Plaster_Straight','Wall_Plaster_Window_Wide_Round','Wall_Plaster_Door_Round','Wall_UnevenBrick_Straight','Wall_UnevenBrick_Window_Wide_Round','Wall_UnevenBrick_Door_Round',
    'Corner_Exterior_Wood','Corner_Exterior_Brick','Door_1_Round','Window_Wide_Round1','WindowShutters_Wide_Round_Open','Roof_Front_Brick4','Roof_Front_Brick6','Roof_Front_Brick8','Prop_Chimney','Wall_Plaster_WoodGrid','Prop_Crate',...ROOFS.map(([a,b])=>'Roof_RoundTiles_'+a+'x'+b)];
  let all=null; const ready=()=>all||(all=Promise.all(NEED.map(get)));
  // ── a house, in the kit's metres, then scaled to the game's footprint ──
  function assemble(o){ const P=palette(o.c), stone=!!(o.c&&(o.c.stone||o.c.brick)), K='Wall_'+(stone?'UnevenBrick':'Plaster')+'_';
    // the walls: as many 2 m panels as best fit each side; the ridge runs along the longer side, the gables on the shorter
    const nw=Math.max(2,Math.min(4,Math.round(o.w/1.25))), nd=Math.max(2,Math.min(5,Math.round(o.d/1.25))), Wk=nw*2, Dk=nd*2, H=new THREE.Group();
    const wall=(n,x,z,ry)=>{ const p=piece(n,P); if(!p) return; p.position.set(x,0,z); p.rotation.y=ry; H.add(p); return p; };
    // front (+z): the door in the middle, windows either side; back: windows; the sides: a window in the middle
    const NS=o.storeys||1;
    for(let i=0;i<nw;i++){ const x=-Wk/2+1+2*i, mid=i===Math.floor((nw-1)/2);
      wall(mid?K+'Door_Round':K+'Window_Wide_Round',x,Dk/2,0); if(mid){ const d=piece('Door_1_Round',P); if(d){ d.position.set(x-0.55,0,Dk/2-0.04); H.add(d); } } else { const w=piece('Window_Wide_Round1',P), s=piece('WindowShutters_Wide_Round_Open',P); [w,s].forEach(q=>{ if(q){ q.position.set(x,0,Dk/2); H.add(q); } }); }
      wall(i%2?K+'Straight':K+'Window_Wide_Round',x,-Dk/2,Math.PI); }
    for(let j=0;j<nd;j++){ const z=-Dk/2+1+2*j, win=j===Math.floor(nd/2); wall(win?K+'Window_Wide_Round':K+'Straight',Wk/2,z,Math.PI/2); wall(win&&nd>2?K+'Window_Wide_Round':K+'Straight',-Wk/2,z,-Math.PI/2); }
    // an upper storey: timber-framed panels and windows all round
    for(let s=1;s<NS;s++){ const y=3.12*s; for(let i=0;i<nw;i++){ const x=-Wk/2+1+2*i; [[x,Dk/2,0],[x,-Dk/2,Math.PI]].forEach(([px,pz,ry],k)=>{ const p=piece(i%2===k%2?'Wall_Plaster_Window_Wide_Round':'Wall_Plaster_WoodGrid',P)||piece('Wall_Plaster_Straight',P); if(p){ p.position.set(px,y,pz); p.rotation.y=ry; H.add(p); } }); }
      for(let j=0;j<nd;j++){ const z=-Dk/2+1+2*j; [[Wk/2,Math.PI/2],[-Wk/2,-Math.PI/2]].forEach(([px,ry])=>{ const p=piece(j===Math.floor(nd/2)?'Wall_Plaster_Window_Wide_Round':'Wall_Plaster_WoodGrid',P)||piece('Wall_Plaster_Straight',P); if(p){ p.position.set(px,y,z); p.rotation.y=ry; H.add(p); } }); } }
    for(let s=0;s<NS;s++) [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ const c=piece(stone&&s===0?'Corner_Exterior_Brick':'Corner_Exterior_Wood',P); if(c){ c.position.set(a*Wk/2,3.12*s,b*Dk/2); H.add(c); } });
    // a shop: crates and a wagon by the door
    if(o.shop){ [[-Wk/2+0.9,Dk/2+0.9],[-Wk/2+1.9,Dk/2+0.7]].forEach(([x,z])=>{ const cr=piece('Prop_Crate',P); if(cr){ cr.position.set(x,0,z); H.add(cr); } }); }
    // the roof: the kit's size nearest the house, ridge along the longer side; the gable ends to match
    const along=Dk>=Wk, short=along?Wk:Dk, long=along?Dk:Wk; let best=ROOFS[0], bs=1e9; ROOFS.forEach(r=>{ const s=Math.abs(r[0]-short)*2+Math.abs(r[1]-long); if(s<bs){ bs=s; best=r; } });
    const roof=piece('Roof_RoundTiles_'+best[0]+'x'+best[1],P); const T=3.12*NS;
    if(roof){ roof.scale.set(short/best[0],1,long/best[1]); if(!along) roof.rotation.y=Math.PI/2; roof.position.y=T; H.add(roof); }
    const gk=Math.min(8,Math.max(4,Math.round(short/2)*2)), gab='Roof_Front_Brick'+gk;
    [1,-1].forEach(sd=>{ const g=piece(gab,P); if(!g) return; g.scale.set(short/gk,1,1); g.position.y=T; if(along){ g.position.z=sd*Dk/2; g.rotation.y=sd>0?0:Math.PI; } else { g.position.x=sd*Wk/2; g.rotation.y=sd>0?Math.PI/2:-Math.PI/2; } H.add(g); });
    const ch=piece('Prop_Chimney',P); if(ch){ ch.position.set(along?-Wk/4:-Wk/3,T+0.4,along?-Dk/4:0); ch.scale.setScalar(0.8); H.add(ch); }
    // to the game's size: the footprint, and the eave at the house's own height
    H.scale.set(o.w/Wk,(o.h||1.8)/T,o.d/Dk); return H; }
  function house(g,o){ if(!on()||!g) return; const old=g.children.slice(); ready().then(()=>{ const H=assemble(o); old.forEach(c=>{ c.visible=false; }); g.add(H); g.userData.v3=H; }).catch(()=>{}); }
  // ── the world's towns: every house, cottage, shop and inn, in its town's colours ──
  const KINDS={house:1.8,cottage:1.5,shop:1.9,inn:2.5}, KEEP=new Set(['home_house','home_barn','sg_keep','sg_cathedral','ih_forge','sm_market']);
  // what each town is made of: the kit tinted (plaster, timber, stone, roof); stone: the walls in rubble-stone panels
  const TOWN={ ironhold:{wall:0x8a8680,wallD:0x5c5854,beam:0x2e2a28,roof:0x4a4e58,stone:1}, saltmere:{wall:0xf4f0e6,wallD:0xb8b0a0,beam:0x3e5a78,roof:0x3a6aa8},
    thornwood:{wall:0xc49a6a,wallD:0x7a6248,beam:0x4a3220,roof:0x5a7a3a}, dusthaven:{wall:0xe6c48e,wallD:0xc09a66,beam:0x8a5a32,roof:0xc0683a},
    crystalpeak:{wall:0xe8eef4,wallD:0xb8c4d0,beam:0x4a5a6a,roof:0xf0f4f8}, stormgate:{wall:0xd8d4cc,wallD:0xb3b4b8,beam:0x3a3430,roof:0x2c4c9e,slate:0x2c4c9e,stone:1},
    ashfield:{wall:0x9a948c,wallD:0x6a645e,beam:0x3a2a22,roof:0x6a2a24,stone:1}, shadowmere:{wall:0x7a7486,wallD:0x4e4a58,beam:0x2a2630,roof:0x3e5a46},
    hearthvale:{wall:0xf2e6c8,wallD:0xb0a48e,beam:0x6b4a2e,roof:0x9a7a42}, homestead:{wall:0xf0e2c4,wallD:0xa8987e,beam:0x5a3c24,roof:0x8a6a3a} };
  function swap(M0,par,g,b,bm,c,key){ if(!on()||!M0||KEEP.has(b.id)) return; const chapel=b.style==='chapel'; if(!chapel&&!KINDS[b.style]) return;
    const pal=Object.assign({},{wall:c.wall,wallD:c.wallD,beam:c.beam,roof:c.roof},TOWN[key]||{}), kids=M0.children.slice();
    const o=chapel?{w:bm.w-0.6,d:bm.h-0.3,c:pal,dark:!!c.dark}:{w:bm.w-0.4,d:bm.h-0.3,h:KINDS[b.style],c:pal,storeys:KINDS[b.style]>2.2?2:1,shop:b.style==='shop'};
    // the kit's building goes inside the merged one (mergeStatic keeps the house's own group), so whatever shows or hides it
    //  (a chapel's bound and cleansed forms) does the same to the new one
    ready().then(()=>{ const H=chapel?gothic(o):assemble(o); kids.forEach(k=>{ k.visible=false; }); M0.add(H); M0.userData.v3=b.id; }).catch(e=>{ if(window.DEBUG_V3) console.error('VILLAGE3',e&&e.message||e); }); }
  // ── V195: THE CHAPELS, GOTHIC — a tall nave between lower aisles, flying buttresses with pinnacles leaning in to it,
  //  lancets of stained glass, the west front with a pointed portal and a rose window under a spired tower, a polygonal
  //  apse at the east end. Stone from the kit's rubble-stone texture, slate roofs; while the general is bound it stands
  //  in the dark stone of the realm's shadow, its glass a dim red, and lit gold once the town is cleansed ──
  const SH={}; function stoneMap(){ if(SH.st) return SH.st; let m=null; const s=src['Wall_UnevenBrick_Straight']; if(s) s.traverse(o=>{ if(o.isMesh&&!m){ const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(x=>{ if(/UnevenBrick/.test(x.name)&&x.map) m=x.map; }); } });
    if(m){ const t=grey(m).clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.needsUpdate=true; SH.st=t; } return SH.st; }
  const GM={}; function gmat(col,tex,glow){ const key=col+'|'+!!tex+'|'+!!glow; if(GM[key]) return GM[key];
    const m=glow?new THREE.MeshBasicMaterial({color:new THREE.Color(col),map:glowTex(),side:THREE.DoubleSide}):new THREE.MeshToonMaterial({color:lin(col),gradientMap:RAMP,map:tex?stoneMap():null});
    if(!glow){ m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n { float r=pow(1.0-clamp(dot(normalize(vViewPosition),normalize(vNormal)),0.0,1.0),3.0); gl_FragColor.rgb+=vec3(1.0,0.94,0.8)*r*0.16; }'); }; m.customProgramCacheKey=()=>'v3toon'; }
    return GM[key]=m; }
  let GT=null; function glowTex(){ if(GT) return GT; const c=document.createElement('canvas'); c.width=32; c.height=96; const x=c.getContext('2d'), cols=['#c83a3a','#3a5ac8','#e8c048','#3aa868','#9a4ac8'];
    for(let j=0;j<12;j++) for(let i=0;i<4;i++){ x.fillStyle=cols[(i*3+j*2+((i+j)%3))%5]; x.fillRect(i*8,j*8,8,8); } x.strokeStyle='#1a1410'; x.lineWidth=1.5; for(let i=0;i<=4;i++){ x.beginPath(); x.moveTo(i*8,0); x.lineTo(i*8,96); x.stroke(); } for(let j=0;j<=12;j++){ x.beginPath(); x.moveTo(0,j*8); x.lineTo(32,j*8); x.stroke(); }
    GT=new THREE.CanvasTexture(c); return GT; }
  function gothic(o){ const G=new THREE.Group(), w=o.w, d=o.d, dark=o.dark, P=o.c||{};
    const stone=dark?0x4e4a5a:(P.stone?P.wallD||0xb8b4ac:0xd6cfc0), stoneD=new THREE.Color(stone).multiplyScalar(0.78).getHex(), slate=dark?0x2a2434:(P.slate||0x4f5a6e), gold=dark?0x6a5a3a:0xe0b048, glass=dark?0x6a2a3a:0xffffff;
    const S=gmat(stone,true), SD=gmat(stoneD,true), R=gmat(slate,false), GD=gmat(gold,false), GL=gmat(glass,false,true), DK=gmat(0x14121a,false);
    const box=(bw,bh,bd,m,x,y,z,par)=>{ const ge=new THREE.BoxGeometry(bw,bh,bd), uv=ge.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*Math.max(bw,bd)*0.42,uv.getY(i)*bh*0.42);   /* bigger stones: calmer walls */ const me=new THREE.Mesh(ge,m); me.position.set(x,y+bh/2,z); me.castShadow=me.receiveShadow=true; (par||G).add(me); return me; };
    const prism=(pw,ph,pd,m,x,y,z,ry)=>{ const s=new THREE.Shape(); s.moveTo(-pw/2,0); s.lineTo(0,ph); s.lineTo(pw/2,0); s.lineTo(-pw/2,0); const ge=new THREE.ExtrudeGeometry(s,{depth:pd,bevelEnabled:false}); ge.translate(0,0,-pd/2); const me=new THREE.Mesh(ge,m); me.position.set(x,y,z); me.rotation.y=ry||0; me.castShadow=true; G.add(me); return me; };
    const cone=(r,h,n,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.ConeGeometry(r,h,n),m); me.position.set(x,y+h/2,z); me.castShadow=true; G.add(me); return me; };
    const lancet=(lw,lh,x,y,z,ry)=>{ const sh=new THREE.Shape(); sh.moveTo(-lw/2,0); sh.lineTo(-lw/2,lh-lw*0.7); sh.quadraticCurveTo(-lw/2,lh-lw*0.12,0,lh); sh.quadraticCurveTo(lw/2,lh-lw*0.12,lw/2,lh-lw*0.7); sh.lineTo(lw/2,0); sh.lineTo(-lw/2,0);
      const ge=new THREE.ShapeGeometry(sh,6), uv=ge.attributes.uv, pp=ge.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,(pp.getX(i)+lw/2)/lw,pp.getY(i)/lh); const me=new THREE.Mesh(ge,GL); me.position.set(x,y,z); me.rotation.y=ry||0; G.add(me);
      const fr=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sh.getPoints(12).map(p=>new THREE.Vector3(p.x*1.12,p.y*1.04-0.02,0)),true),36,0.03,4,true),SD); fr.position.copy(me.position); fr.rotation.y=me.rotation.y; fr.translateZ(0.015); G.add(fr); return me; };
    // the plan: the tower at the west front (+z, the door), the nave behind it, aisles either side, the apse at the east
    const TW=Math.min(1.7,w*0.32), nw=Math.min(w*0.5,2.6), aw=(w-nw)/2-0.15, z0=-d/2+0.5, z1=d/2-TW-0.05, nl=z1-z0, NH=3.0, AH=1.8, nz=(z0+z1)/2;
    box(nw,NH,nl,S,0,0,nz); prism(nw+0.3,1.6,nl+0.3,R,0,NH,nz);
    [-1,1].forEach(sd=>{ const ax=sd*(nw/2+aw/2); box(aw,AH,nl-0.4,S,ax,0,nz);   // the aisle, and its lean-to roof
      const lr=new THREE.Mesh(new THREE.BoxGeometry(aw+0.3,0.12,nl-0.2),R); lr.position.set(ax,AH+0.42,nz); lr.rotation.z=-sd*Math.atan2(0.85,aw); lr.castShadow=true; G.add(lr);
      const bays=Math.max(2,Math.floor(nl/1.15)); for(let k=0;k<bays;k++){ const z=z0+0.5+(k+0.5)*(nl-1)/bays, px=sd*(nw/2+aw+0.1);
        lancet(0.34,1.15,px+sd*0.02,0.35,z,sd*Math.PI/2);                                   // a lancet in the aisle wall
        lancet(0.3,0.85,sd*(nw/2+0.02),AH+0.55,z,sd*Math.PI/2);                             // and one in the clerestory above it
        if(k===bays-1) continue; const bz=z+(nl-1)/bays/2;                                       // between the bays: a buttress, a pinnacle, a flying arch to the nave
        box(0.26,AH+0.5,0.34,SD,px+sd*0.08,0,bz); cone(0.15,0.75,4,SD,px+sd*0.08,AH+0.5,bz); cone(0.03,0.12,4,GD,px+sd*0.08,AH+1.25,bz);
        const fa=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,Math.hypot(aw+0.1,0.9)),SD); fa.rotation.y=Math.PI/2; fa.rotation.x=0; fa.position.set(sd*(nw/2+(aw+0.1)/2),AH+0.95,bz); fa.rotation.z=sd*Math.atan2(0.9,aw+0.1); G.add(fa); } });
    // the apse: a half-polygon at the east end, its own conical roof, three lancets
    const ap=new THREE.Mesh(new THREE.CylinderGeometry(nw/2,nw/2,NH*0.92,7,1,false,Math.PI/2,Math.PI),S); ap.position.set(0,NH*0.46,z0); ap.castShadow=true; G.add(ap);
    const ar=new THREE.Mesh(new THREE.ConeGeometry(nw/2+0.12,1.3,7,1,false,Math.PI/2,Math.PI),R); ar.position.set(0,NH*0.92+0.65,z0); G.add(ar);
    [-0.6,0,0.6].forEach(a=>lancet(0.24,1.1,Math.sin(a+Math.PI)*nw/2*1.01,0.7,z0+Math.cos(a+Math.PI)*nw/2*1.01,a+Math.PI));
    // the west front: the tower and its spire, the portal, the rose window
    const tz=d/2-TW/2; box(TW,NH+1.6,TW,S,0,0,tz); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>{ box(0.2,NH+1.6,0.2,SD,a*TW/2,0,tz+c*TW/2); cone(0.12,0.6,4,SD,a*TW/2,NH+1.6,tz+c*TW/2); });
    box(TW+0.12,0.14,TW+0.12,SD,0,NH+1.6,tz); cone(TW*0.42,3.2,8,R,0,NH+1.74,tz); const cr=new THREE.Group(); box(0.06,0.5,0.06,GD,0,0,0,cr); box(0.28,0.06,0.06,GD,0,0.3,0,cr); cr.position.set(0,NH+4.94,tz); G.add(cr);
    [-1,1].forEach(sd=>lancet(0.22,0.9,sd*TW/2*1.01,NH+0.35,tz,sd*Math.PI/2)); lancet(0.24,0.9,0,NH+0.35,tz+TW/2+0.01,0);   // the belfry's openings
    const pz=d/2+0.01; const pd=new THREE.Shape(); const pw=0.62, ph=1.35; pd.moveTo(-pw/2,0); pd.lineTo(-pw/2,ph-pw*0.6); pd.quadraticCurveTo(-pw/2,ph-0.05,0,ph); pd.quadraticCurveTo(pw/2,ph-0.05,pw/2,ph-pw*0.6); pd.lineTo(pw/2,0); pd.lineTo(-pw/2,0);
    const door=new THREE.Mesh(new THREE.ShapeGeometry(pd,6),DK); door.position.set(0,0.02,pz); G.add(door);
    [0.1,0.2].forEach((e,i)=>{ const ar2=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pd.getPoints(14).slice(1,-1).map(p=>new THREE.Vector3(p.x*(1+e*1.5),p.y*(1+e*0.5),0))),30,0.045,4,false),i?SD:GD); ar2.position.set(0,0.02,pz+0.02+e*0.1); G.add(ar2); });
    const rose=new THREE.Mesh(new THREE.CircleGeometry(0.42,16),GL); rose.position.set(0,NH-0.6,pz); G.add(rose); const rr=new THREE.Mesh(new THREE.TorusGeometry(0.44,0.05,5,20),SD); rr.position.copy(rose.position); rr.position.z+=0.01; G.add(rr);
    G.traverse(m=>{ if(m.isMesh&&m.material!==GL) m.castShadow=true; }); return G; }
  return { house, swap, get on(){ return on(); }, ready, assemble };
})();
