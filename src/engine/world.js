// ════════════════════════════════════════════════════════════════
//  WORLD — the whole realm of Luminar (tools/extract_world.py → data/world.json) as one level.
//  buildWorld(WD, opt) · opt = { id, name, sealed(i)→bool, enter(building)→fn|null, hollow(x,y)→fn|null }
//  The 250×300 map is cut into 16×16 chunks. A chunk's terrain, trees, buildings and street furniture
//  are built the first time the knight comes near and hidden again once he is far away; each chunk's
//  instanced meshes are culled against the camera by hand (r128 cannot cull instances itself).
//  Heights, the walk mask, stairs and ledges are the game's own (canStep, as in city.js).
// ════════════════════════════════════════════════════════════════
// every town's walls in its own stone, roofs and colours — Stormgate's the tallest, Ironhold's the sternest
const TWALL={ stormgate:{h:4.4,tower:1,stone:0xb3b4b8,dark:0x8a8c94,roof:0x2c4c9e,flag:0xf2c14e,every:7},
  ironhold:{h:3.7,tower:0.95,stone:0x83868e,dark:0x62656e,roof:0x3c4452,flag:0xb8402e,every:7},
  hearthvale:{h:3.0,tower:0.8,stone:0xb8ad98,dark:0x928874,roof:0x9a4a36,flag:0xf2c14e},
  saltmere:{h:2.9,tower:0.8,stone:0xc8c4b4,dark:0x9e9a8c,roof:0x2f7a8a,flag:0xf4eede},
  thornwood:{h:2.9,tower:0.8,stone:0x7d8670,dark:0x5e6656,roof:0x3e6a3a,flag:0xd8b24a},
  dusthaven:{h:3.1,tower:0.85,stone:0xc8a878,dark:0xa08458,roof:null,flag:0xc84a2a},
  crystalpeak:{h:3.1,tower:0.9,stone:0xb8c4d0,dark:0x8e9aa8,roof:0x4a6a9a,flag:0x9adcf0,snow:1},
  ashfield:{h:3.1,tower:0.85,stone:0x5e5650,dark:0x443e3a,roof:0x3a2a24,flag:0xd8642a},
  shadowmere:{h:3.1,tower:0.9,stone:0x6e6a80,dark:0x524e62,roof:0x3a2e5a,flag:0xb89ae0},
  hellgate:{h:3.5,tower:1,stone:0x3e3844,dark:0x2a2630,roof:0x2a1a22,flag:0x8a1a1a,slit:0x6a1a10},
  homestead:{h:2.4,tower:0.7,stone:0xa89c84,dark:0x857a66,roof:0x8e4a36,flag:0xf4eede,every:10} };
const PALISADE=new Set(['hearthvale','thornwood','saltmere']);   // the walled-by-a-fence villages, whose ring fences rise to palisades
const TOWN_KEYS=['hearthvale','ironhold','saltmere','thornwood','dusthaven','crystalpeak','ashfield','stormgate','shadowmere','hellgate'];
const TOWN_PREFIX=[['home_','homestead'],['ih_','ironhold'],['sm_','saltmere'],['tw_','thornwood'],['dh_','dusthaven'],['cp_','crystalpeak'],['af_','ashfield'],['sg_','stormgate'],['sh_','shadowmere'],['hg_','hellgate']];
const themeOf=id=>{ for(const [p,k] of TOWN_PREFIX) if(id.indexOf(p)===0) return k; return 'hearthvale'; };
const TABOR_TILE=t=>[16,19,22,34,61,62,63,64,65,68,69,70,71,72,73,74,75,77,98,99,100].includes(t);
const GRASS={mistral:0x78a862,hearthvale:0x6cb065,ironhold:0x6a9a5a,saltmere:0x79b26a,thornwood:0x4f8a48,dusthaven:0xcdb47e,crystalpeak:0x7aa47a,ashfield:0x77725e,stormgate:0x5fa860,shadowmere:0x55645a,hellgate:0x4a3a3a,homestead:0x7ab060};
const TILE_COL={2:0xbd9a66,4:0x6cb065,6:0xb3ada2,7:0x3f7a44,8:0xbd9a5e,9:0xa89c88,10:0xa89c88,11:0xa89c88,12:0x8a6a42,13:0x9a3b4a,17:0x7a6a4a,18:0x5b9e5c,19:0xe0cf9c,20:0x5fb0c8,21:0x3f8ec0,
  91:0x8a5a86,92:0x86b864,96:0xb4ac9c,22:0xeef2f6,23:0xcfe6f2,24:0x7fcad8,25:0x6a6460,26:0xff6a1a,27:0xa8845a,28:0x3a4038,29:0x1e2a2a,30:0x4a5048,31:0x6b4a2e,32:0x9a7a58,33:0x8a6a4a,34:0xd8dce4,35:0x1a2a1a,
  61:0xdde8f0,62:0xbfe0f0,63:0x7aa47a,64:0xf4f8fc,68:0x8a6a42,69:0x5a3c20,70:0x6a4a3a,71:0xf2d27a,72:0x8a6a42,73:0xdde8f0,74:0x9a7a48,75:0xbfe0f0,77:0x5a3c20,80:0xa8a49b};
const CHUNK=16;
const PERSON_SIZED=new Set(['barrel','fishBarrel','crate','bucket','waterjug','planter','scarecrow','snowman','weaponRack','horse','mule','mt_sheep','hsSkep','sandcastle','umbrella']);
// a merged, vertex-coloured geometry from [geometry, colour] parts (for instanced trees)
// a part may carry a shade (0..1): its lower vertices darken by that much, so canopies are lit on top and in shadow beneath
function mergeColoured(parts){ const pos=[],nor=[],col=[],c=new THREE.Color();
  parts.forEach(([g,h,sh])=>{ g=g.index?g.toNonIndexed():g; g.computeVertexNormals(); c.setHex(h); const p=g.attributes.position.array, n=g.attributes.normal.array;
    let y0=1e9,y1=-1e9; if(sh){ for(let i=1;i<p.length;i+=3){ y0=Math.min(y0,p[i]); y1=Math.max(y1,p[i]); } }
    for(let i=0;i<p.length;i++){ pos.push(p[i]); nor.push(n[i]); } for(let i=0;i<p.length/3;i++){ const k=sh?1-sh*(1-(p[i*3+1]-y0)/Math.max(1e-3,y1-y0)):1; col.push(c.r*k,c.g*k,c.b*k); } });
  const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); o.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return o; }
const _tg=(geo,x,y,z,rx,rz)=>{ if(rx) geo.rotateX(rx); if(rz) geo.rotateZ(rz); geo.translate(x,y,z); return geo; };
const TREE_GEO={
  // a fir in four tiers, each turned and lit from above; a flared foot of roots
  pine:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.08,0.14,1.0,7),0,0.5,0),0x5b3a1f,0.35],[_tg(new THREE.CylinderGeometry(0.15,0.22,0.12,7),0,0.06,0),0x4e3219],
    [_tg(new THREE.ConeGeometry(0.7,1.05,9),0,1.15,0),0x2b6236,0.45],[_tg(new THREE.ConeGeometry(0.58,0.95,9).rotateY(0.4),0,1.6,0),0x2f6b3a,0.42],[_tg(new THREE.ConeGeometry(0.44,0.85,8).rotateY(0.8),0,2.05,0),0x367540,0.4],[_tg(new THREE.ConeGeometry(0.28,0.7,7).rotateY(1.2),0,2.5,0),0x3f8048,0.35]]),
  // a broadleaf: a trunk that forks, and a crown of five clumps, darker underneath
  oak:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.1,0.19,1.15,7),0,0.58,0),0x5b3a1f,0.3],[_tg(new THREE.CylinderGeometry(0.04,0.08,0.6,5),0.18,1.25,0,0,-0.6),0x5b3a1f],[_tg(new THREE.CylinderGeometry(0.04,0.07,0.55,5),-0.16,1.3,0.05,0,0.7),0x5b3a1f],
    [_tg(new THREE.IcosahedronGeometry(0.62,1),0,1.75,0),0x3f8a44,0.5],[_tg(new THREE.IcosahedronGeometry(0.45,1),0.42,1.62,0.12),0x3a8040,0.5],[_tg(new THREE.IcosahedronGeometry(0.46,1),-0.4,1.66,-0.1),0x45904a,0.5],
    [_tg(new THREE.IcosahedronGeometry(0.42,1),0.08,1.72,0.42),0x3c8442,0.5],[_tg(new THREE.IcosahedronGeometry(0.4,1),0.12,2.18,-0.08),0x4f9a4c,0.4]]),
  cactus:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.16,0.18,1.3,8),0,0.65,0),0x4a8a4a],[_tg(new THREE.SphereGeometry(0.16,8,4),0,1.3,0),0x4a8a4a],[_tg(new THREE.BoxGeometry(0.34,0.12,0.12),0.15,0.55,0),0x4a8a4a],[_tg(new THREE.CylinderGeometry(0.1,0.1,0.45,6),0.3,0.8,0),0x4a8a4a],[_tg(new THREE.BoxGeometry(0.3,0.1,0.1),-0.14,0.75,0),0x4a8a4a],[_tg(new THREE.CylinderGeometry(0.09,0.09,0.36,6),-0.28,0.95,0),0x4a8a4a]]),
  charred:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.08,0.15,1.7,5),0,0.85,0),0x2a2422],[_tg(new THREE.CylinderGeometry(0.03,0.06,0.7,4),0.2,1.25,0,0,-0.8),0x2a2422],[_tg(new THREE.CylinderGeometry(0.03,0.05,0.6,4),-0.2,1.45,0,0,0.9),0x2a2422]]),
  snow:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.1,0.13,0.7,6),0,0.35,0),0x5b3a1f],[_tg(new THREE.ConeGeometry(0.62,1.4,7),0,1.35,0),0x2f5f42],[_tg(new THREE.ConeGeometry(0.66,0.14,7),0,0.72,0),0xf4f8fc],[_tg(new THREE.ConeGeometry(0.45,1.0,7),0,2.0,0),0x2f5f42],[_tg(new THREE.ConeGeometry(0.26,0.45,7),0,2.45,0),0xf4f8fc]]),
  mere:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.09,0.16,1.6,5),0,0.8,0),0x3a3236],[_tg(new THREE.IcosahedronGeometry(0.62,0),0.1,1.75,0),0x46504a],[_tg(new THREE.CylinderGeometry(0.03,0.05,0.6,4),-0.25,1.2,0,0,0.8),0x3a3236]]),
  palm:()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.08,0.12,2.1,6),0,1.05,0),0x8a6a3a],[_tg(new THREE.ConeGeometry(0.9,0.5,7),0,2.15,0),0x3f8a4e]])
};
// V101 (LOOK2): the nature kit — trees built as the characters are: soft, clustered, a little storybook. Each crown is many
//  rounded leaf-clumps (lighter on top, deeper underneath and inside), on a tapered trunk with a root flare and boughs.
//  The crowns sway in the wind (treeSway, in the vertex shader: the higher a point, the more it moves).
if(typeof LOOK2!=='undefined'&&LOOK2){
  const clump=(r,x,y,z,c,sq)=>{ const g=new THREE.IcosahedronGeometry(r,1); g.scale(1,sq||0.82,1); return [_tg(g,x,y,z),c,0.55]; };
  const trunk=(h,r0,r1,c)=>[[_tg(new THREE.CylinderGeometry(r1,r0,h,8),0,h/2,0),c,0.35],[_tg(new THREE.CylinderGeometry(r0*1.25,r0*1.7,0.16,8),0,0.08,0),c,0.2]];
  TREE_GEO.oak=()=>{ const P=trunk(1.15,0.2,0.11,0x5e3e24); P.push([_tg(new THREE.CylinderGeometry(0.035,0.075,0.75,5),0.24,1.3,0,0,-0.75),0x5e3e24],[_tg(new THREE.CylinderGeometry(0.035,0.07,0.7,5),-0.22,1.35,0.06,0,0.8),0x5e3e24]);
    [[0.7,0,1.85,0,0x478e44],[0.5,0.55,1.62,0.18,0x3f8640],[0.52,-0.52,1.66,-0.12,0x4c9448],[0.46,0.12,1.7,0.55,0x418a42],[0.45,-0.08,1.68,-0.55,0x3c823f],[0.42,0.3,2.25,-0.12,0x58a24f],[0.4,-0.3,2.2,0.2,0x55a04e],[0.34,0,2.55,0,0x62aa56]].forEach(([r,x,y,z,c])=>P.push(clump(r,x,y,z,c)));
    return mergeColoured(P); };
  TREE_GEO.birch=()=>{ const P=[[_tg(new THREE.CylinderGeometry(0.07,0.11,1.9,7),0,0.95,0),0xe8e4da,0.15]]; for(let i=0;i<5;i++) P.push([_tg(new THREE.CylinderGeometry(0.115,0.115,0.05,7),0,0.3+i*0.33,0),0x3a3430]);
    [[0.42,0,2.05,0,0x8ab84e],[0.34,0.3,1.8,0.1,0x7eb046],[0.34,-0.28,1.85,-0.1,0x92c054],[0.3,0.05,2.4,-0.05,0x9ac85a],[0.3,-0.1,1.7,0.3,0x86b44a]].forEach(([r,x,y,z,c])=>P.push(clump(r,x,y,z,c,0.95)));
    return mergeColoured(P); };
  TREE_GEO.pine=()=>{ const P=trunk(0.9,0.15,0.09,0x5b3a1f); [[0.78,0.9,0.95,0x2a5e34],[0.64,0.85,1.45,0x2e6838],[0.5,0.78,1.9,0x34703e],[0.36,0.7,2.3,0x3a7a44],[0.2,0.5,2.65,0x428448]].forEach(([r,h,y,c],i)=>{
      const g=new THREE.ConeGeometry(r,h,11,2); const pa=g.attributes.position; for(let k=0;k<pa.count;k++){ const yy=pa.getY(k); if(yy<-h/2+0.01){ const a=Math.atan2(pa.getZ(k),pa.getX(k)); pa.setY(k,yy-0.06*Math.abs(Math.sin(a*5.5))); } }   // the skirt droops in soft scallops
      g.rotateY(i*0.5); P.push([_tg(g,0,y,0),c,0.45]); }); return mergeColoured(P); };
  TREE_GEO.palm=()=>{ const P=[]; for(let i=0;i<6;i++){ const g=new THREE.CylinderGeometry(0.08+0.01*(5-i),0.09+0.01*(5-i),0.38,7); P.push([_tg(g,0.05*i*i*0.05,0.19+i*0.36,0,0,-0.03*i),i%2?0x9a7a48:0x8a6a3a]); }
    for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, g=new THREE.BoxGeometry(0.9,0.03,0.24); g.translate(0.45,0,0); g.rotateZ(-0.35); g.rotateY(a); P.push([_tg(g,0.1,2.2,0),i%2?0x3f8a4e:0x4a9a56]); }
    P.push([_tg(new THREE.IcosahedronGeometry(0.16,0),0.12,2.12,0.08),0x6a4a2a]); return mergeColoured(P); };
}
// V103 (LOOK2): a softer bush — rounded leaf-clumps like the trees' crowns, with a few berries
const BUSH_GEO2=()=>mergeColoured([[_tg(new THREE.IcosahedronGeometry(0.42,2).scale(1,0.85,1),0,0.36,0),0x3f8a4e,0.5],[_tg(new THREE.IcosahedronGeometry(0.3,2),0.28,0.3,-0.1),0x4a9454,0.5],[_tg(new THREE.IcosahedronGeometry(0.28,2),-0.24,0.3,0.12),0x37804a,0.5],[_tg(new THREE.IcosahedronGeometry(0.22,2),0.05,0.62,0.05),0x52a05c,0.4],[_tg(new THREE.SphereGeometry(0.05,6,4),0.2,0.55,0.28),0xc8402e],[_tg(new THREE.SphereGeometry(0.05,6,4),-0.18,0.46,0.3),0xc8402e]]);
// a flower: a stem, five petals and a golden heart (tinted per flower)
const FLOWER_GEO=col=>{ const parts=[[_tg(new THREE.CylinderGeometry(0.008,0.012,0.12,4),0,0.06,0),0x5a9a3a],[_tg(new THREE.SphereGeometry(0.03,5,3).scale(1.6,0.35,0.7),0.03,0.03,0),0x4f8f36]]; for(let i=0;i<5;i++){ const a=i/5*Math.PI*2, g=new THREE.SphereGeometry(0.04,6,4); g.scale(1,0.35,0.62); g.translate(0.04,0,0); g.rotateY(a); parts.push([_tg(g,0,0.13,0),col]); }
  parts.push([_tg(new THREE.SphereGeometry(0.024,6,4),0,0.135,0),0xf2c03a]); return mergeColoured(parts); };
// the wind: crowns and grass sway — higher points more — in a slow, gusting breeze that moves across the land
/* V135: how lush the sward is, by the graphics tier chosen (read once, as the realm is built: a change shows after a reload) */
const GRASS_K=(()=>{ try{ const p=localStorage.getItem('klk3d_gfx'); const t=p&&p!=='auto'?p:(matchMedia('(any-pointer: coarse)').matches?'medium':'high'); return t==='ultra'?2.6:t==='high'?2:t==='low'?0.6:1; }catch(e){ return 1; } })();
function windSway(mat,amt){ const prev=mat.onBeforeCompile; mat.onBeforeCompile=(sh,r)=>{ if(prev) prev(sh,r); sh.uniforms.uWind={value:0}; sh.uniforms.uWind=DETAIL_TIME;
    sh.vertexShader='uniform float uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      #ifdef USE_INSTANCING
      vec3 wp=vec3(instanceMatrix[3][0],0.0,instanceMatrix[3][2]);
      #else
      vec3 wp=vec3(0.0);
      #endif
      float gust=0.6+0.4*sin(uWind*0.35+wp.x*0.05+wp.z*0.04), hk=max(position.y-${amt[1].toFixed(2)},0.0);
      transformed.x+=sin(uWind*1.6+wp.x*0.5+wp.z*0.3)*${amt[0].toFixed(3)}*hk*gust;
      transformed.z+=cos(uWind*1.3+wp.x*0.4+wp.z*0.6)*${(amt[0]*0.6).toFixed(3)}*hk*gust;`); };
  const key=mat.customProgramCacheKey?mat.customProgramCacheKey.bind(mat):()=>'';
  mat.customProgramCacheKey=()=>key()+'|wind'+amt.join(','); return mat; }
const BUSH_GEO=()=>mergeColoured([[_tg(new THREE.IcosahedronGeometry(0.42,1),0,0.34,0),0x3f8a4e,0.45],[_tg(new THREE.IcosahedronGeometry(0.28,1),0.25,0.3,-0.1),0x37804a,0.45],[_tg(new THREE.IcosahedronGeometry(0.06,0),0.2,0.55,0.25),0xc8402e],[_tg(new THREE.IcosahedronGeometry(0.06,0),-0.22,0.45,0.22),0xc8402e]]);
// a tuft of grass: seven blades fanned out, dark at the root and bright at the tip (tinted per tile)
const TUFT_GEO=()=>{ const parts=[]; for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+i*0.7, r=0.03+(i%3)*0.035, h=0.16+((i*37)%10)/10*0.14, g=new THREE.ConeGeometry(0.022,h,3); g.translate(0,h/2,0); g.rotateZ(0.25+((i*13)%5)*0.06); g.rotateY(a); g.translate(Math.cos(a)*r,0,Math.sin(a)*r); parts.push([g,0xffffff,0.3]); } const m=mergeColoured(parts), n=m.attributes.normal.array; for(let i=0;i<n.length;i+=3){ n[i]=0; n[i+1]=1; n[i+2]=0; } return m; };   // lit like the sward it grows from
// V111 (LOOK2): a split-rail fence in the characters' manner — round weathered posts with domed tops, two rounded rails a little
//  off true, a tuft at the foot of each post
const FENCE_GEO2=()=>mergeColoured([[_tg(new THREE.CylinderGeometry(0.035,0.035,1.04,6),0,0.6,0.01,0,Math.PI/2+0.03),0x9a7a50],[_tg(new THREE.CylinderGeometry(0.035,0.035,1.04,6),0,0.33,-0.01,0,Math.PI/2-0.025),0x8e7048],
  [_tg(new THREE.CylinderGeometry(0.062,0.072,0.78,8),0,0.39,0),0x6f5434],[_tg(new THREE.SphereGeometry(0.064,8,5,0,Math.PI*2,0,Math.PI/2),0,0.78,0),0x7a5e3c],[_tg(new THREE.ConeGeometry(0.1,0.16,5),0.04,0.08,0.05),0x5f9a48],[_tg(new THREE.ConeGeometry(0.08,0.13,5),-0.05,0.065,-0.04),0x6aa850]]);
const FENCE_GEO=()=>mergeColoured([[_tg(new THREE.BoxGeometry(1,0.08,0.08),0,0.62,0),0x9a7a48],[_tg(new THREE.BoxGeometry(1,0.08,0.08),0,0.32,0),0x9a7a48],[_tg(new THREE.BoxGeometry(0.11,0.75,0.11),0,0.37,0),0x6f5128]]);

// how each building type looks in its town: walls, roof and trim from TOWN_THEMES
// (the surfaces: shingled roofs, limewashed or dressed-stone walls, planked doors — kit.js bmat — and the trim a
//  town is built with: door frames and steps, shuttered windows with sills and mullions, corner posts, chimneys)
const _win=(g,x,y,z,frame,ry)=>{ const w=group(x,y,z,g); if(ry) w.rotation.y=ry; B(0.46,0.44,0.04,glow(0xf2d27a),0,0,0,w); B(0.04,0.44,0.05,frame,0,0,0.005,w); B(0.46,0.04,0.05,frame,0,0.2,0.005,w);
  B(0.54,0.05,0.07,frame,0,-0.03,0.01,w); B(0.54,0.05,0.07,frame,0,0.44,0.01,w); B(0.58,0.05,0.12,0xb8ad98,0,-0.07,0.04,w);   // frame, cross-bars, sill
  [-1,1].forEach(sd=>{ const sh=B(0.2,0.46,0.03,frame,sd*0.36,0,0.03,w); sh.rotation.y=sd*0.35; }); return w; };   // shutters, half-open
const _door=(g,x,z,d,frame,ry,h)=>{ const w=group(x,0,z,g); if(ry) w.rotation.y=ry; h=h||0.95; B(0.62,h,0.05,bmat(0x6a4426,'plank'),0,0,d,w); B(0.08,h+0.06,0.08,frame,-0.35,0,d+0.01,w); B(0.08,h+0.06,0.08,frame,0.35,0,d+0.01,w); B(0.78,0.09,0.09,frame,0,h,d+0.01,w);
  Sp(0.03,0xd8b24a,0.2,h*0.5,d+0.04,w,6,4); B(0.84,0.07,0.3,0x9a958c,0,0,d+0.15,w); return w; };   // planked door, frame, latch, a stone step
// V102 (LOOK2, Hearthvale): a storybook thatch — a thick, soft-shouldered straw roof that overhangs deep at the eaves, a
//  rolled ridge with pegged ends, the straw's courses in faintly darker bands; and the cottage trim that goes with it
//  (window boxes of flowers, a hood over the door)
function _thatch(g,w,d,h,rh){ const s=new THREE.Shape(), W2=w/2+0.5, top=rh+0.18; s.moveTo(-W2,0); s.lineTo(-W2+0.05,0.18); s.quadraticCurveTo(-0.35,top-0.15,0,top); s.quadraticCurveTo(0.35,top-0.15,W2-0.05,0.18); s.lineTo(W2,0); s.quadraticCurveTo(0,0.08,-W2,0);
  const geo=new THREE.ExtrudeGeometry(s,{depth:d+0.7,bevelEnabled:true,bevelSize:0.1,bevelThickness:0.12,bevelSegments:3,curveSegments:10}); geo.translate(0,0,-(d+0.7)/2);
  const r=new THREE.Mesh(geo,flat(0xc8984e)); r.position.y=h-0.12; g.add(r);
  for(let i=1;i<4;i++){ const f=i/4, yy=h-0.12+top*f*0.92+0.02, hw=W2*(1-f)+0.02; [-1,1].forEach(sd=>{ const band=B(0.06,0.05,d+0.9,0xb0823e,sd*hw,yy,0,g); band.rotation.z=sd*(0.95-0.25*f); }); }
  const rg=Cy(0.17,0.17,d+0.95,10,0xa87a3a,0,0,0,g); rg.rotation.x=Math.PI/2; rg.position.set(0,h-0.12+top+0.05,0); rg.scale.set(1,1,0.75);
  [-1,1].forEach(sd=>{ Sp(0.19,0x9a6e34,0,h-0.12+top+0.05,sd*(d+0.95)/2,g,8,6); }); }
// V104 (LOOK2): roofs with real craft in them.
//  THATCH: laid in overlapping courses of straw from the eaves up, each a slightly different gold, every course ending in a ragged
//   fringe of straw ends; a thick, cut eave; a ridge rolled and pegged with a crossed hazel "liggers" pattern and a scalloped,
//   pointed ridge-block, finials at either end; plastered, timbered gables under it.
//  TILES: rows of individual overlapping clay tiles (or slates), staggered, each a touch different in tone, with ridge tiles.
function _roofFrame(w,d,rh,over){ const W2=w/2+over, a=Math.atan2(rh,W2), L=Math.hypot(W2,rh); return {W2,a,L}; }
function _gable(g,w,d,h,rh,wall,beam){ [-1,1].forEach(sz=>{ const pr=prism(w,rh*0.98,0.12,wall); pr.position.set(0,h,sz*(d/2-0.06)); g.add(pr);
    if(beam){ B(w,0.1,0.14,beam,0,h-0.02,sz*(d/2-0.02),g); const k=B(0.1,rh*0.8,0.14,beam,0,h,sz*(d/2-0.02),g); [-1,1].forEach(sd=>{ const br=B(0.08,rh*0.75,0.12,beam,sd*w*0.2,h,sz*(d/2-0.01),g); br.rotation.z=sd*0.7; }); } }); }
const _THATCH={};
function _thatch2(g,w,d,h,rh){ const key=[w,d,h,rh].map(v=>v.toFixed(2)).join(','); let src=_THATCH[key];
  if(!src){ const t0=new THREE.Group(); _thatchBuild(t0,w,d,h,rh); soften(t0); src=_THATCH[key]=mergeStatic(t0); }
  src.children.forEach(m=>{ const c=new THREE.Mesh(m.geometry,m.material); c.castShadow=m.castShadow; c.receiveShadow=true; c.userData.keep=true; g.add(c); }); }
function _thatchBuild(g,w,d,h,rh){ const {W2,a,L}=_roofFrame(w,d,rh,0.55), D=d+0.9, N=6, SM=hex=>{ const m=softMat(hex), c=new THREE.Color(hex), hsl={}; c.getHSL(hsl); m.color.setHSL(hsl.h,hsl.s*0.72,hsl.l); return m; };
  const straw=[0xc4a678,0xba9c6e,0xc0a274,0xb59767,0xbea072,0xb89a6b], dark=0x9a7c52, groove=0xb0926a;
  const ca=Math.cos(a), sa=Math.sin(a);
  for(const sd of [-1,1]){ const dir=[sd*ca,-sa], nrm=[sd*sa,ca];
    for(let i=0;i<N;i++){ const cl=L/N*1.6, f=(i+0.5)/N, cx=sd*W2*(1-f), cy=h+rh*f, lift=(N-i)*0.03;
      // the course, laid in bundles along the roof: each a little thicker or thinner, a little lighter or darker
      const nb=Math.max(3,Math.round(D/0.8)); for(let k=0;k<nb;k++){ const bz=-D/2+(k+0.5)*D/nb, t=0.24+hsh(k*7+i,i*3+(sd>0?5:0))*0.07, col=new THREE.Color(straw[(i+k)%straw.length]).offsetHSL(0,0,(hsh(k,i*9)-0.5)*0.05).getHex();
        const m=B(cl,t,D/nb+0.04,SM(col),0,0,0,g); m.position.set(cx+nrm[0]*lift,cy-t/2+nrm[1]*lift,bz); m.rotation.z=-sd*a; }
      // straw grooves running down the course
      const ng=Math.round(D/0.34); for(let k=0;k<ng;k++){ const gz=-D/2+(k+0.5)*D/ng, gm=B(cl*0.7,0.015,0.02,SM(groove),0,0,0,g); gm.position.set(cx+nrm[0]*(lift+0.12),cy+nrm[1]*(lift+0.12)-0.02,gz); gm.rotation.z=-sd*a; }
      // the ragged fringe of straw ends along the course's lower edge
      const ex=cx+dir[0]*cl/2+nrm[0]*lift, ey=cy+dir[1]*cl/2+nrm[1]*lift, nt=Math.round(D/(i===0?0.05:0.065));
      for(let k=0;k<nt;k++){ const tz=-D/2+(k+0.5)*D/nt, ln=(i===0?0.13:0.08)+hsh(k*3+i,i*7+(sd>0?1:0))*(i===0?0.07:0.05), tc=k%3===0?dark:straw[(i+k)%6];
        const tt=B(ln,0.09,0.06,SM(tc),0,0,0,g); tt.position.set(ex+dir[0]*ln*0.3-nrm[0]*0.1,ey+dir[1]*ln*0.3-nrm[1]*0.1-0.12,tz+(hsh(k,i)-0.5)*0.02); tt.rotation.z=-sd*(a+(hsh(i,k)-0.5)*0.2); } }
    // the saddle over the ridge, its lower edge cut in scallops, with the liggers and crossed spars pinning it
    const sf=0.86, scl=L*0.34, sx=sd*W2*(1-sf), sy=h+rh*sf, sl=0.2;
    const sad=B(scl,0.28,D+0.06,SM(0xb48e56),0,0,0,g); sad.position.set(sx+nrm[0]*sl,sy+nrm[1]*sl-0.14,0); sad.rotation.z=-sd*a;
    const lx=sx+dir[0]*scl/2+nrm[0]*sl, ly=sy+dir[1]*scl/2+nrm[1]*sl-0.06, ns=Math.round(D/0.36);
    for(let k=0;k<ns;k++){ const zz=-D/2+(k+0.5)*D/ns, sc=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,6,0,Math.PI*2,0,Math.PI/2),SM(0xb08a52)); sc.scale.set(1,0.5,1); sc.position.set(lx,ly,zz); sc.rotation.set(0,0,-sd*a+sd*Math.PI/2*0); g.add(sc); }
    for(const fr2 of [0.25,0.75]){ const p=[sx+dir[0]*scl*(fr2-0.5)+nrm[0]*(sl+0.15),sy+dir[1]*scl*(fr2-0.5)+nrm[1]*(sl+0.15)];
      const lg=Cy(0.022,0.022,D,5,SM(0x6e5030),0,0,0,g); lg.rotation.x=Math.PI/2; lg.position.set(p[0],p[1]-0.05,0); }
    for(let k=0;k<ns;k++){ const zz=-D/2+(k+0.5)*D/ns; [-1,1].forEach(q=>{ const sp=Cy(0.016,0.016,0.42,4,SM(0x6e5030),0,0,0,g); sp.position.set(sx+nrm[0]*(sl+0.16),sy+nrm[1]*(sl+0.16)-0.21,zz); sp.rotation.set(q*0.75,0,-sd*a); }); }
    const eave=B(0.26,0.24,D+0.04,SM(0xa8834a),0,0,0,g); eave.position.set(sd*(W2+0.04),h-0.12,0); }
  const top=h+rh+0.16, rc=Cy(0.24,0.24,D+0.14,14,SM(0xb08a52),0,0,0,g); rc.rotation.x=Math.PI/2; rc.position.set(0,top,0); rc.scale.set(1,1,0.72);
  [-1,1].forEach(sz=>{ Sp(0.2,SM(0xa07e48),0,top+0.04,sz*(D/2+0.07),g,12,10); Sp(0.09,SM(0x8e6c3e),0,top+0.24,sz*(D/2+0.07),g,10,8); }); }
function _tiles(g,w,d,h,rh,col){ const {W2,a,L}=_roofFrame(w,d,rh,0.4), D=d+0.6, rows=Math.max(5,Math.round(L/0.3)), base=new THREE.Color(col);
  for(const sd of [-1,1]) for(let i=0;i<rows;i++){ const f=(i+0.5)/rows, x=sd*W2*(1-f), y=h+rh*f, n=Math.round(D/0.34), off=(rows-i)*0.012;
    for(let k=0;k<n;k++){ const zz=-D/2+(k+0.5+(i%2?0.5:0))*D/n; if(zz>D/2) continue; const tc=base.clone().offsetHSL(0,0,(hsh(k*5+i,i*3+(sd>0?2:0))-0.5)*0.12).getHex();
      const t=B(L/rows*1.35,0.07,D/n*0.94,tc,0,0,0,g); t.position.set(x+sd*Math.sin(a)*off,y+Math.cos(a)*off,zz); t.rotation.z=-sd*a; } }
  const top=h+rh+0.04, rr=new THREE.Color(col).multiplyScalar(0.75).getHex(); for(let k=0;k<Math.round(D/0.4);k++){ const rt=Cy(0.13,0.13,0.4,8,rr,0,0,0,g,); rt.rotation.x=Math.PI/2; rt.position.set(0,top,-D/2+0.2+k*0.4); rt.scale.set(1,0.8,1); } }
// a cottage in the characters' manner: a footing of real stones, chunky timbers proud of the plaster, deep-set windows with thick
//  frames and shutters, a planked door with iron straps under its hood, a stepped stone chimney with a pot
function _stoneFooting(g,w,d,y0,hgt){ const cols=[0x9a9488,0x8a8478,0xa8a294,0x928c80]; let k=0;
  for(const [len,fz,rot] of [[w+0.12,d/2,0],[w+0.12,-d/2,0],[d+0.12,w/2,1],[d+0.12,-w/2,1]]){ let p=-len/2; while(p<len/2-0.05){ const sw=Math.min(len/2-p,0.32+hsh(k,7)*0.3), sh=hgt*(0.85+hsh(7,k)*0.3);
      const st=B(sw-0.03,sh,0.2,cols[k%4],0,0,0,g); if(rot) st.position.set(fz,y0,p+sw/2), st.rotation.y=Math.PI/2; else st.position.set(p+sw/2,y0,fz); k++; p+=sw; } } }
function _win2(g,x,y,z,fr,ry,sh){ const w=group(x,y,z,g); if(ry) w.rotation.y=ry; if(sh===undefined) sh=0x3f6a8a;
  B(0.5,0.5,0.1,0x2a2a30,0,0,-0.02,w); B(0.42,0.42,0.02,(typeof LIFE!=='undefined'?LIFE.WINLIT:glow(0xf2d27a)),0,0.04,0.02,w);                       // the deep recess and the lit pane
  B(0.06,0.42,0.06,fr,0,0.04,0.05,w); B(0.42,0.06,0.06,fr,0,0.22,0.05,w);                                        // the mullion and transom
  B(0.64,0.1,0.14,fr,0,-0.08,0.05,w); B(0.64,0.1,0.12,fr,0,0.48,0.05,w); B(0.1,0.56,0.12,fr,-0.29,-0.03,0.05,w); B(0.1,0.56,0.12,fr,0.29,-0.03,0.05,w);   // a thick frame
  B(0.72,0.07,0.22,0xa8a294,0,-0.13,0.1,w);                                                                        // the stone sill
  if(sh===null){ for(const xx of [-0.13,0.13]) B(0.025,0.44,0.025,0x2a2a2e,xx,0.03,0.09,w); B(0.44,0.025,0.025,0x2a2a2e,0,0.36,0.09,w); return w; }   // iron bars instead of shutters
  const shD=new THREE.Color(sh).multiplyScalar(0.75).getHex();
  [-1,1].forEach(sd=>{ const s2=B(0.26,0.54,0.05,sh,sd*0.47,-0.03,0.1,w); s2.rotation.y=sd*0.45; B(0.22,0.04,0.055,shD,sd*0.47,0.12,0.12,w).rotation.y=sd*0.45; B(0.22,0.04,0.055,shD,sd*0.47,0.36,0.12,w).rotation.y=sd*0.45; }); return w; }
function _cottage2(b,g,c,low,opt){ opt=opt||{}; const w=b.w-0.4, d=b.h-0.3, h=low?1.45:1.75, fr=0x5a3a22, wall=0xf2e6cc;
  _stoneFooting(g,w,d,0,0.34); B(w-0.04,h-0.3,d-0.04,wall,0,0.3,0,g);                                              // stone footing, plaster above
  const bm=(x,y,z,sx,sy,sz,rz)=>{ const m=B(sx,sy,sz,fr,x,y,z,g); if(rz) m.rotation.z=rz; return m; };
  for(const sz of [-1,1]){ const z=sz*(d/2+0.03); bm(-w/2+0.08,0.3,z,0.18,h-0.3,0.12); bm(w/2-0.08,0.3,z,0.18,h-0.3,0.12); bm(0,0.3,z,w,0.14,0.12); bm(0,h-0.14,z,w+0.1,0.16,0.14); bm(0,0.3+(h-0.3)*0.52,z,w,0.1,0.1);
    [-1,1].forEach(sd=>{ const br=bm(sd*w*0.3,0.4,z,0.1,(h-0.3)*0.7,0.1,sd*0.6); }); }
  for(const sx of [-1,1]){ const x=sx*(w/2+0.03); [[0,0.3,-d/2+0.08],[0,0.3,d/2-0.08]].forEach(([_,y,z])=>{ const p=B(0.12,h-0.3,0.18,fr,x,y,z,g); }); B(0.12,0.14,d,fr,x,0.3,0,g); B(0.14,0.16,d+0.1,fr,x,h-0.14,0,g); }
  _gable(g,w,d,h,low?1.35:1.2,wall,fr);
  _thatch2(g,w,d,h,low?1.35:1.2);
  // the chimney: stepped stone, a cap, a pot
  const cx=-w/4, cz=-d/5; for(let i=0;i<5;i++) B(0.44-(i>2?0.04:0),0.26,0.44-(i>2?0.04:0),[0x9a9488,0x8a8478,0xa49e90][i%3],cx,h+0.4+i*0.26-0.4,cz,g); B(0.54,0.08,0.54,0x7a746a,cx,h+1.3,cz,g); Cy(0.08,0.1,0.2,8,0xa8603a,cx,h+1.38,cz,g); _smokeAt(g,cx,h+1.62,cz);
  // windows, door
  [[w/2-0.65,0.95],[-w/2+0.65,0.95]].forEach(([x,y])=>{ if(Math.abs(x)>0.7) _win2(g,x,y,d/2+0.05,fr); }); if(w>2.4) _win2(g,w/2+0.05,0.95,0,fr,Math.PI/2);
  _cottageTrim(g,w,d,h,fr,b._dx); if(!opt.noWash&&hsh(b.x||3,b.y||5)<0.7) _laundry(g,w/2+0.04,-d/4,w/2+1.25,-d/4+0.2,1.25,(b.x||0)+(b.y||0)); }
// V106 (LOOK2): the Family Farmhouse, as the 2D game has it — two storeys and a balcony. Fieldstone below (coursed stones, a
//  thick plinth, a thatched hood over the green door, the name board, the porch lantern, a bench with the cat, the rain barrel);
//  lime-wash and chunky timbers above, set back so the knight's suite opens through glazed double doors onto a balcony over the
//  porch (turned balusters, stone newels, planters of flowers, a little table set for two); a deep coursed thatch over it all with
//  a dormer either side and two stepped chimneys. Footprint, door and spot unchanged.
function _farmhouse2(b,g,c){ const w=b.w-0.4, d=b.h-0.3, H1=1.6, H2=3.05, rh=1.5, back=0.95, d2=d-back, zc=-back/2, zf=d/2-back, fr=0x5a3a22, wall=0xf2e6cc, wallD=0xe2d4b6;
  const stones=[0x9a9488,0x8a8478,0xa8a294,0x928c80,0xb0a898];
  // ── the ground floor: fieldstone in courses ──
  B(w-0.04,H1-0.02,d-0.04,0x948e80,0,0,0,g); _stoneFooting(g,w,d,0,0.36); let k=0;
  for(const [len,fz,rot,sg] of [[w,d/2,0,1],[w,-d/2,0,-1],[d,w/2,1,1],[d,-w/2,1,-1]]){ for(let y=0.36,r=0;y<H1-0.05;r++){ const rhh=0.2+hsh(r,k)*0.08; let p=-len/2+(r%2?0.14:0);
      while(p<len/2-0.06){ const sw=Math.min(len/2-p,0.26+hsh(k,r*3+1)*0.26), cx=p+sw/2; k++;
        if(!(rot===0&&sg>0&&Math.abs(cx-(b._dx||0))<0.62&&y<1.2)&&!(Math.abs(cx-2.35)<0.42&&rot===0&&y>0.5&&y<1.25)&&!(Math.abs(cx+2.35)<0.42&&rot===0&&y>0.5&&y<1.25)&&!(rot===1&&Math.abs(cx)<0.42&&y>0.5&&y<1.25)){
          const st=B(sw-0.04,Math.min(rhh,H1-y)-0.03,0.08,stones[(k+r)%5],0,y,0,g); if(rot) st.position.set(fz+sg*0.03,y+st.geometry.parameters.height/2,cx), st.rotation.y=Math.PI/2; else st.position.set(cx,y+st.geometry.parameters.height/2,fz+sg*0.03); }
        p+=sw; } y+=rhh; } }
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let i=0;i<4;i++){ const big=i%2===0; B(big?0.4:0.24,0.3,big?0.24:0.4,0xb8b0a0,sx*(w/2-(big?0.16:0.08)+0.04),0.38+i*0.31,sz*(d/2-(big?0.08:0.16)+0.04),g); } });   // big quoins
  [[2.35,0.62,d/2+0.08,0],[-2.35,0.62,d/2+0.08,0],[w/2+0.08,0.62,0,Math.PI/2],[-w/2-0.08,0.62,0,-Math.PI/2],[1.6,0.62,-d/2-0.08,Math.PI],[-1.6,0.62,-d/2-0.08,Math.PI]].forEach(([x,y,z,ry])=>_win2(g,x,y,z,fr,ry));
  // window boxes under the front windows
  [-2.35,2.35].forEach(x=>{ B(0.66,0.15,0.2,0x6a4428,x,0.36,d/2+0.2,g); for(let i=0;i<5;i++) Sp(0.06,[0xe85a6a,0xffe060,0xf4f0ea,0xb08ae8][(i+(x>0?1:0))%4],x-0.24+i*0.12,0.54,d/2+0.2,g,6,4); });
  // ── the floor between: a heavy beam all round, the balcony deck over the porch ──
  B(w+0.12,0.16,d+0.12,fr,0,H1-0.04,0,g);
  B(w+0.1,0.1,back+0.12,0x8a6438,0,H1+0.12,zf+back/2+0.04,g); for(let x=-w/2+0.2;x<w/2;x+=0.3) B(0.02,0.012,back+0.1,0x6a4a28,x,H1+0.22,zf+back/2+0.04,g);   // the plank deck
  // ── the upper floor: lime-wash and timber, set back for the balcony ──
  const g2=group(0,0,zc,g); B(w-0.04,H2-H1-0.12,d2-0.04,wall,0,H1+0.12,0,g2);
  const bm=(x,y,z,sx,sy,sz,rz,par)=>{ const m=B(sx,sy,sz,fr,x,y,z,par||g2); if(rz) m.rotation.z=rz; return m; }, y0=H1+0.12, hh=H2-y0;
  for(const sz of [-1,1]){ const z=sz*(d2/2+0.03); bm(-w/2+0.08,y0,z,0.18,hh,0.12); bm(w/2-0.08,y0,z,0.18,hh,0.12); bm(0,H2-0.14,z,w+0.1,0.16,0.14); bm(0,y0+hh*0.45,z,w,0.1,0.1);
    for(const x of [-1.45,1.45]) bm(x,y0,z,0.12,hh,0.1); [-1,1].forEach(sd=>bm(sd*(w/2-0.55),y0+0.1,z,0.09,hh*0.62,0.09,sd*0.62)); }
  for(const sx of [-1,1]){ const x=sx*(w/2+0.03); B(0.14,0.16,d2+0.1,fr,x,H2-0.14,0,g2); B(0.12,0.1,d2,fr,x,y0+hh*0.45,0,g2); B(0.12,hh,0.18,fr,x,y0,-d2/2+0.08,g2); B(0.12,hh,0.18,fr,x,y0,d2/2-0.08,g2); B(0.12,hh,0.12,fr,x,y0,0,g2); }
  [[2.0,d2/2+0.05,0],[-2.0,d2/2+0.05,0],[w/2+0.05,0.6,Math.PI/2],[-w/2-0.05,0.6,-Math.PI/2],[w/2+0.05,-0.9,Math.PI/2],[-w/2-0.05,-0.9,-Math.PI/2],[1.4,-d2/2-0.05,Math.PI],[-1.4,-d2/2-0.05,Math.PI]].forEach(([x,z,ry])=>_win2(g2,x,H1+0.62,z,fr,ry));
  // the glazed double doors onto the balcony
  { const dz=d2/2+0.03; B(1.16,1.22,0.08,0x2a2a30,0,y0,dz,g2); [-0.27,0.27].forEach(x=>{ B(0.5,1.08,0.03,glow(0xf2d27a),x,y0+0.04,dz+0.03,g2); B(0.06,1.08,0.05,fr,x,y0+0.04,dz+0.05,g2); for(const yy of [0.36,0.72]) B(0.5,0.05,0.05,fr,x,y0+0.04+yy,dz+0.05,g2); });
    B(0.08,1.2,0.07,fr,0,y0,dz+0.06,g2); B(1.3,0.12,0.12,fr,0,y0+1.18,dz+0.05,g2); B(0.1,1.26,0.12,fr,-0.62,y0,dz+0.05,g2); B(0.1,1.26,0.12,fr,0.62,y0,dz+0.05,g2); }
  // ── the balcony: stone newels, turned balusters, a top rail; planters, a little table set for two, a lantern ──
  { const bz=d/2+0.02, yb=H1+0.22, rail=0x7a5430;
    const newel=(x,z)=>{ B(0.2,0.62,0.2,0xb8b0a0,x,yb,z,g); B(0.26,0.08,0.26,0xa8a294,x,yb+0.62,z,g); Sp(0.08,0xb8b0a0,x,yb+0.76,z,g,8,6); };
    const run=(x0,z0,x1,z1)=>{ const L=Math.hypot(x1-x0,z1-z0), n=Math.round(L/0.17), ry=Math.atan2(x1-x0,z1-z0);
      for(let i=1;i<n;i++){ const f=i/n, x=x0+(x1-x0)*f, z=z0+(z1-z0)*f; Cy(0.035,0.045,0.48,6,0x9a6c3a,x,yb+0.04,z,g); Sp(0.05,0x9a6c3a,x,yb+0.3,z,g,6,4); }
      const tr=B(0.1,0.07,L,rail,(x0+x1)/2,yb+0.52,(z0+z1)/2,g); tr.rotation.y=ry; const br=B(0.08,0.05,L,rail,(x0+x1)/2,yb,(z0+z1)/2,g); br.rotation.y=ry; };
    const xs=[-w/2+0.1,-0.9,0.9,w/2-0.1]; xs.forEach(x=>newel(x,bz)); newel(-w/2+0.1,zf+0.05); newel(w/2-0.1,zf+0.05);
    for(let i=0;i<3;i++) run(xs[i],bz,xs[i+1],bz); run(-w/2+0.1,zf+0.05,-w/2+0.1,bz); run(w/2-0.1,zf+0.05,w/2-0.1,bz);
    [[-2.55,bz-0.32],[2.55,bz-0.32]].forEach(([x,z])=>{ B(0.5,0.3,0.34,0x8a5a32,x,yb,z,g); B(0.54,0.05,0.38,0x6a4428,x,yb+0.3,z,g); for(let i=0;i<7;i++) Sp(0.075,[0xe85a6a,0xffe060,0xe85a6a,0xf4f0ea,0x5a9a4a,0xb08ae8,0x5a9a4a][i],x-0.2+(i%4)*0.13,yb+0.4+(i>3?0.06:0),z+(i>3?0.08:-0.06),g,6,4); });
    const tx=-1.55, tz=zf+0.42; Cy(0.03,0.04,0.42,6,0x6a4428,tx,yb,tz,g); Cy(0.24,0.24,0.04,12,0x8a6438,tx,yb+0.42,tz,g); Cy(0.04,0.03,0.08,8,0xf4f0ea,tx-0.08,yb+0.46,tz,g); Cy(0.04,0.03,0.08,8,0xf4f0ea,tx+0.1,yb+0.46,tz+0.04,g); Sp(0.05,0xe85a6a,tx,yb+0.5,tz-0.08,g,6,4);
    [-1,1].forEach(sd=>{ const cx=tx+sd*0.42; B(0.26,0.04,0.26,0x6a4428,cx,yb+0.26,tz,g); [-1,1].forEach(a=>[-1,1].forEach(q=>B(0.03,0.26,0.03,0x5a3a22,cx+a*0.1,yb,tz+q*0.1,g))); B(0.04,0.32,0.26,0x6a4428,cx+sd*0.12,yb+0.28,tz,g); });
    B(0.9,0.05,0.24,0x7a5430,1.6,yb+0.24,zf+0.22,g); [-0.36,0.36].forEach(x=>B(0.05,0.24,0.2,0x5a3a22,1.6+x,yb,zf+0.22,g));   // a bench along the wall
    Sp(0.07,glow(0xffcf6a),0.85,H1+1.28,zf+0.12,g,8,6); B(0.12,0.04,0.12,0x2a2a2a,0.85,H1+1.38,zf+0.12,g); B(0.03,0.2,0.03,0x2a2a2a,0.85,H1+1.4,zf+0.06,g); }
  // ── the roof: gables, a deep thatch, a dormer each side, two chimneys ──
  _gable(g2,w,d2,H2,rh,wall,fr); _thatch2(g2,w,d2,H2,rh);
  [-1,1].forEach(sd=>{ const dz=-0.2, x0=sd*1.95; B(1.05,0.7,0.95,wall,x0,H2+0.35,dz,g2); B(0.1,0.7,0.1,fr,x0+sd*0.5,H2+0.35,dz-0.42,g2); B(0.1,0.7,0.1,fr,x0+sd*0.5,H2+0.35,dz+0.42,g2);
    _win2(g2,x0+sd*0.55,H2+0.47,dz,fr,sd*Math.PI/2).scale.set(0.75,0.75,0.75);
    [-1,1].forEach(q=>{ const r=B(1.25,0.16,0.72,0xb48e56,x0,0,dz+q*0.3,g2); r.position.y=H2+1.14; r.rotation.x=q*0.62; }); B(1.27,0.14,0.14,0xa07e48,x0,H2+1.36,dz,g2); });
  [[-w/2+0.7,-d2/2+0.55],[w/2-0.7,d2/2-0.45]].forEach(([cx,cz],i)=>{ for(let j=0;j<7;j++) B(0.46-(j>4?0.06:0),0.28,0.46-(j>4?0.06:0),stones[(j+i)%5],cx,H2+0.25+j*0.28-0.3,cz,g2);
    B(0.56,0.08,0.56,0x7a746a,cx,H2+1.94,cz,g2); Cy(0.08,0.1,0.22,8,0xa8603a,cx,H2+2.02,cz,g2); _smokeAt(g2,cx,H2+2.28,cz); });
  // ── the porch below: a thatched hood on posts over the green door, the name board, the lantern, the bench and the cat, the barrel ──
  { const pz=d/2; [-0.68,0.68].forEach(x=>{ Cy(0.06,0.07,1.32,8,0x6a4428,x,0,pz+0.5,g); B(0.18,0.06,0.18,0x8a8478,x,0,pz+0.5,g); });
    const hood=B(1.7,0.2,0.68,0xb48e56,0,1.3,pz+0.26,g); hood.rotation.x=0.28; B(1.74,0.08,0.06,0x9a7c52,0,1.26,pz+0.58,g);
    for(let i=0;i<18;i++) B(0.05,0.11,0.04,[0xc4a678,0x9a7c52,0xba9c6e][i%3],-0.82+i*0.0965,1.18,pz+0.6,g);
    B(0.62,0.17,0.04,0x4a3018,0,1.08,pz+0.04,g); B(0.5,0.05,0.045,0xe0b84a,0,1.14,pz+0.05,g);
    Sp(0.06,glow(0xffcf6a),0.52,0.98,pz+0.12,g,8,6); B(0.11,0.03,0.11,0x2a2a2a,0.52,1.06,pz+0.12,g);
    const bx=1.33; B(0.8,0.06,0.28,0x7a5430,bx,0.32,pz+0.22,g); [-0.32,0.32].forEach(x=>B(0.06,0.32,0.22,0x5a3a22,bx+x,0,pz+0.22,g)); B(0.8,0.22,0.05,0x7a5430,bx,0.46,pz+0.06,g);
    Sp(0.11,0xe08a3a,bx-0.15,0.46,pz+0.22,g,8,6).scale.set(1.5,0.8,1); Sp(0.075,0xe08a3a,bx+0.05,0.5,pz+0.24,g,8,6); Co(0.025,0.06,4,0xe08a3a,bx+0.02,0.54,pz+0.24,g); Co(0.025,0.06,4,0xe08a3a,bx+0.08,0.54,pz+0.24,g);
    const rb=Cy(0.24,0.21,0.62,12,0x7a5430,-w/2+0.42,0,pz+0.3,g); Cy(0.25,0.25,0.04,12,0x3a3a3a,-w/2+0.42,0.12,pz+0.3,g); Cy(0.25,0.25,0.04,12,0x3a3a3a,-w/2+0.42,0.48,pz+0.3,g); Cy(0.2,0.2,0.02,12,0x4a7a9a,-w/2+0.42,0.6,pz+0.3,g); } }
// V106 (LOOK2): coursed stone walls with holes left for doors and windows — holes: [[face,x,y0,y1,halfwidth]], face 'f','b','l','r'
function _stoneWalls(g,w,d,y0,y1,holes,cols){ cols=cols||[0x9a9488,0x8a8478,0xa8a294,0x928c80,0xb0a898]; let k=0; holes=holes||[];
  for(const [len,fz,rot,sg,fc] of [[w,d/2,0,1,'f'],[w,-d/2,0,-1,'b'],[d,w/2,1,1,'r'],[d,-w/2,1,-1,'l']]){ for(let y=y0,r=0;y<y1-0.05;r++){ const rhh=0.2+hsh(r,k)*0.08; let p=-len/2+(r%2?0.14:0);
      while(p<len/2-0.06){ const sw=Math.min(len/2-p,0.26+hsh(k,r*3+1)*0.26), cx=p+sw/2, hh=Math.min(rhh,y1-y)-0.03; k++;
        if(!holes.some(([f,x,a,b2,hw])=>f===fc&&Math.abs(cx-x)<hw&&y+hh>a&&y<b2)){ const st=B(sw-0.04,hh,0.08,cols[(k+r)%cols.length],0,y,0,g); if(rot) st.position.set(fz+sg*0.03,y+hh/2,cx), st.rotation.y=Math.PI/2; else st.position.set(cx,y+hh/2,fz+sg*0.03); }
        p+=sw; } y+=rhh; } }
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let y=y0+0.02,i=0;y<y1-0.2;y+=0.31,i++){ const big=i%2===0; B(big?0.4:0.24,0.3,big?0.24:0.4,0xb8b0a0,sx*(w/2-(big?0.16:0.08)+0.04),y,sz*(d/2-(big?0.08:0.16)+0.04),g); } }); }
// V106 (LOOK2): the coaching inn in the characters' manner, after the 2D inn — a stone ground floor with a covered porch across the
//  front, its roof a railed balcony for the upper storey; the upper storey jettied out in chunky timbers and lime-wash with a glazed
//  door onto the balcony; a tiled roof over timbered gables with two stone chimneys; the inn's sign swinging from an iron bracket;
//  lanterns by the door, barrels on the porch. Every town's colours carry through (wall, roof, sign, snow on the ridge up north).
function _inn2(b,g,c){ const w=b.w-0.3, d=b.h-0.3, H1=1.25, H2=2.5, rh=1.45, fr=c.iron?0x2e2e34:c.salt?SALT.trimD:c.wood?TWOOD.dark:c.frost?0x3a3448:c.ash?ASH.timber:c.mere?0x2e2a3a:c.beam||0x5a3a22, wall=c.iron?0x9a9ca4:c.salt?SALT.wall:c.wood?0xc8a878:c.frost?0xd8d4e2:c.ash?ASH.plaster:c.mere?MERE.board:c.wall||0xf2e6cc, shut=c.iron?IRON.ox:c.salt?SALT.trim:c.wood?TWOOD.shut:c.frost?FROST.shut:c.ash?0x8a6a3a:c.mere?0x3a3450:undefined, small=w<3.2, wx=w/2-0.8;
  const stoneCols=[c.wallD,0x9a9488,0x8a8478,0xa8a294,0x928c80].map((v,i)=>i?new THREE.Color(v).lerp(new THREE.Color(c.wallD),0.25).getHex():v);
  B(w-0.04,H1,d-0.04,new THREE.Color(c.wallD).multiplyScalar(0.9).getHex(),0,0,0,g); _stoneFooting(g,w,d,0,0.3);
  const holes=[['f',b._dx||0,0,1.15,0.5]]; if(!small){ holes.push(['f',wx,0.35,0.95,0.42],['f',-wx,0.35,0.95,0.42]); } holes.push(['r',0,0.35,0.95,0.42],['l',0,0.35,0.95,0.42]);
  _stoneWalls(g,w,d,0.3,H1,holes,c.iron?IRON.st:c.frost?FROST.st:c.ash?ASH.st:stoneCols);
  if(!small) [wx,-wx].forEach(x=>_win2(g,x,0.5,d/2+0.08,fr,0,shut)); _win2(g,w/2+0.08,0.5,0,fr,Math.PI/2,shut); _win2(g,-w/2-0.08,0.5,0,fr,-Math.PI/2,shut);
  // the floor beam, and the upper storey jettied out
  B(w+0.2,0.14,d+0.2,fr,0,H1-0.02,0,g); const jw=w+0.24, jd=d+0.24, y0=H1+0.12, hh=H2-y0;
  B(jw-0.04,hh,jd-0.04,wall,0,y0,0,g); for(let x=-jw/2+0.25;x<=jw/2-0.2;x+=0.42) [-1,1].forEach(sz=>{ const j=B(0.1,0.1,0.22,fr,x,H1-0.08,sz*(d/2+0.06),g); });   // the joist ends
  const bm=(x,y,z,sx,sy,sz,rz)=>{ const m=B(sx,sy,sz,fr,x,y,z,g); if(rz) m.rotation.z=rz; return m; };
  for(const sz of [-1,1]){ const z=sz*(jd/2+0.03); bm(-jw/2+0.08,y0,z,0.16,hh,0.12); bm(jw/2-0.08,y0,z,0.16,hh,0.12); bm(0,H2-0.14,z,jw+0.1,0.16,0.14); bm(0,y0,z,jw,0.1,0.1);
    if(!small) [-1,1].forEach(sd=>{ bm(sd*(wx+0.45),y0,z,0.11,hh,0.1); bm(sd*(jw/2-0.32),y0+0.08,z,0.08,hh*0.7,0.08,sd*0.6); }); }
  for(const sx of [-1,1]){ const x=sx*(jw/2+0.03); B(0.12,hh,0.16,fr,x,y0,-jd/2+0.08,g); B(0.12,hh,0.16,fr,x,y0,jd/2-0.08,g); B(0.12,hh,0.12,fr,x,y0,0,g); B(0.14,0.16,jd+0.1,fr,x,H2-0.14,0,g); B(0.12,0.1,jd,fr,x,y0,0,g);
    [-1,1].forEach(q=>{ const br=B(0.08,hh*0.7,0.08,fr,x,y0+0.08,q*jd/4,g); br.rotation.x=q*0.55; }); }
  if(!small) [wx,-wx].forEach(x=>_win2(g,x,y0+0.38,jd/2+0.05,fr,0,shut)); [[jw/2+0.05,Math.PI/2],[-jw/2-0.05,-Math.PI/2]].forEach(([x,ry])=>{ _win2(g,x,y0+0.38,-jd/4,fr,ry,shut); if(d>3.2) _win2(g,x,y0+0.38,jd/4,fr,ry,shut); });
  [-0.9,0.9].forEach(x=>{ if(Math.abs(x)<w/2-0.5) _win2(g,x*Math.min(1,w/4),y0+0.38,-jd/2-0.05,fr,Math.PI,shut); });
  { const dz=jd/2+0.03; B(0.7,1.0,0.08,0x2a2a30,0,y0,dz,g); B(0.56,0.88,0.03,glow(0xf2d27a),0,y0+0.04,dz+0.03,g); B(0.05,0.88,0.05,fr,0,y0+0.04,dz+0.05,g); B(0.56,0.05,0.05,fr,0,y0+0.48,dz+0.05,g);
    B(0.84,0.12,0.12,fr,0,y0+0.98,dz+0.05,g); [-0.38,0.38].forEach(x=>B(0.1,1.04,0.12,fr,x,y0,dz+0.05,g)); }
  // the roof: timbered gables, tiles in the town's colour, snow on the ridge where it falls, two stone chimneys
  _gable(g,jw,jd,H2,rh,wall,c.timber?fr:fr); _tiles(g,jw,jd,H2,rh,c.iron?IRON.slate:c.salt?SALT.roof:c.wood?TWOOD.roof:c.frost?FROST.slate:c.ash?ASH.newTile:c.mere?MERE.roof:c.roof); if(c.ash){ _dove(g,0,H2+rh+0.42,jd/2-0.2); _scaffold(g,-jw/2-0.45,0,H2+0.4,-Math.PI/2); _shoots(g,w/2-0.4,d/2+0.95,5); } if(c.mere){ _holyLamp(g,-w/2-0.35,d/2+0.9,2.4); _reeds(g,w/2+0.25,d/2+0.6,4); _reeds(g,-w/2-0.3,-d/3,8); for(let i=0;i<5;i++){ const x=-w/2+0.4+i*(w-0.8)/4; Sp(0.055,glow(i%2?MERE.lamp:0xfff0c8),x,H1+0.0,d/2+0.6,g,8,6); } B(w-0.2,0.015,0.015,0x2a2a32,0,H1+0.08,d/2+0.6,g); } if(c.wood){ _moss(g,jw,jd,H2,rh,8); _antlers(g,0,H1+1.05,jd/2+0.06); _woodpile(g,-w/2-0.35,0,Math.PI/2,Math.min(d-0.6,1.4)); _shrooms(g,w/2-0.3,d/2+0.9,7); } if(c.frost){ _snowRoof(g,jw,jd,H2,rh); _crystals(g,-w/2-0.15,0,d/2+0.15,2.0,4); _crystals(g,0,H2+rh+0.2,jd/2-0.1,1.4,6); } if(c.salt){ _saltNet(g,-jw/2-0.07,H2-0.15,0,-Math.PI/2,Math.min(jd-0.8,1.8),0.9); _saltPot(g,w/2-0.5,0,d/2+0.95); _saltRope(g,-w/2+0.6,0,d/2+0.95); _saltLantern(g,0.0,y0+1.0,jd/2+0.03); } if(c.iron){ _ironCrest(g,jd+0.4,H2+rh+0.14); _ironBanner(g,jw/2+0.02,H2-0.1,0,Math.PI/2); }
  if(c.snow&&!c.frost){ const {W2,a,L}=_roofFrame(jw,jd,rh,0.4); [-1,1].forEach(sd=>{ const sn=B(L*0.5,0.1,jd+0.66,0xf4f8fc,0,0,0,g); sn.position.set(sd*W2*0.25,H2+rh*0.75+0.12,0); sn.rotation.z=-sd*a; }); Cy(0.16,0.16,jd+0.7,8,0xf4f8fc,0,0,0,g).rotation.x=Math.PI/2; g.children[g.children.length-1].position.set(0,H2+rh+0.1,0); }
  [[-jw/2+0.55,-jd/4],[jw/2-0.55,jd/5]].forEach(([cx,cz],i)=>{ if(small&&i) return; for(let j=0;j<6;j++) B(0.42-(j>3?0.05:0),0.27,0.42-(j>3?0.05:0),stoneCols[(j+i)%5],cx,H2+0.05+j*0.27-0.25,cz,g); B(0.52,0.08,0.52,0x7a746a,cx,H2+1.42,cz,g); Cy(0.07,0.09,0.2,8,0xa8603a,cx,H2+1.5,cz,g); _smokeAt(g,cx,H2+1.74,cz); });
  // the porch: posts, a deck over it railed for a balcony, lanterns, barrels, the sign on its bracket
  { const pz=d/2, pd=0.62, yb=H1+0.08, rail=0x7a5430, pw=small?1.9:w-0.3;
    [-pw/2+0.08,pw/2-0.08].concat(small?[]:[-0.62,0.62]).forEach(x=>{ Cy(0.06,0.07,H1,8,0x6a4428,x,0,pz+pd-0.08,g); B(0.18,0.06,0.18,0x8a8478,x,0,pz+pd-0.08,g); const br=B(0.05,0.36,0.05,0x6a4428,x,H1-0.36,pz+pd-0.22,g); br.rotation.x=0.6; });
    B(pw+0.1,0.1,pd+0.06,0x8a6438,0,H1-0.02,pz+pd/2,g); B(pw+0.12,0.12,0.08,fr,0,H1-0.06,pz+pd,g);
    const n=Math.round(pw/0.17); for(let i=1;i<n;i++){ const x=-pw/2+pw*i/n; Cy(0.03,0.04,0.4,6,0x9a6c3a,x,yb+0.04,pz+pd-0.03,g); }
    B(pw+0.1,0.07,0.1,rail,0,yb+0.44,pz+pd-0.03,g); B(pw+0.1,0.05,0.08,rail,0,yb+0.04,pz+pd-0.03,g);
    [-1,1].forEach(sd=>{ const x=sd*(pw/2+0.02); for(let i=1;i<4;i++) Cy(0.03,0.04,0.4,6,0x9a6c3a,x,yb+0.04,pz+pd*i/4,g); B(0.08,0.07,pd,rail,x,yb+0.44,pz+pd/2,g); });
    [-0.62,0.62].forEach(x=>{ if(small&&Math.abs(x)>0.9) return; Sp(0.06,glow(0xffcf6a),x*0.75,0.98,pz+0.12,g,8,6); B(0.11,0.03,0.11,0x2a2a2a,x*0.75,1.06,pz+0.12,g); });
    if(!small){ const bx=pw/2-0.32; [0,1].forEach(i=>{ const r=Cy(0.17,0.15,0.4,10,0x7a5430,bx-i*0.36,0,pz+0.3,g); Cy(0.175,0.175,0.03,10,0x3a3a3a,bx-i*0.36,0.08,pz+0.3,g); Cy(0.175,0.175,0.03,10,0x3a3a3a,bx-i*0.36,0.3,pz+0.3,g); }); }
    // the sign: an iron arm off the upper corner, the board hanging on two rings
    const sx=-(pw/2-0.05), sz=pz+pd+0.06; B(0.05,0.05,0.62,0x2a2a2a,sx,H2-0.5,sz-0.25,g); const st=B(0.04,0.42,0.04,0x2a2a2a,sx,H2-0.84,sz-0.5,g); st.rotation.x=-0.85;
    [-0.18,0.18].forEach(q=>B(0.02,0.12,0.02,0x2a2a2a,sx,H2-0.62,sz+q*0.0,g));
    const bd=group(sx,H2-1.12,sz,g); bd.rotation.y=Math.PI/2; B(0.62,0.42,0.06,c.sign,0,0,0,bd); B(0.68,0.05,0.08,0x5a3a22,0,0.4,0,bd); B(0.68,0.05,0.08,0x5a3a22,0,-0.02,0,bd); Cy(0.09,0.12,0.14,8,0xd8b24a,0,0.08,0.05,bd); Cy(0.09,0.12,0.14,8,0xd8b24a,0,0.08,-0.05,bd); } }
// V106 (LOOK2): the keep in the characters' manner — coursed ashlar on a battered plinth, big quoins, a parapet carried on corbels
//  with chunky merlons; round corner towers in courses with string-bands, a corbelled walk and a tiled cone with a finial and a
//  pennant; a donjon with a tiled roof and the town's banner; a deep gate of nested arches with a portcullis and lanterns; slits
//  and a few lit windows. The town's stone and roof colours carry through, darkened for Hellgate.
function _keep2(b,g,c){ const w=b.w-0.2, d=b.h-0.2, H=3.2, stone=c.stone||0xa8a49b, sD=new THREE.Color(stone).multiplyScalar(0.82).getHex(), sL=new THREE.Color(stone).lerp(new THREE.Color(0xffffff),0.15).getHex(), roof=c.roof, rD=new THREE.Color(roof).multiplyScalar(0.75).getHex();
  const cols=[stone,sD,sL,new THREE.Color(stone).multiplyScalar(0.92).getHex()], ST=(sx,sy,sz,col,x,y,z,par)=>B(sx,sy,sz,col,x,y,z,par||g);
  // the hall: a battered plinth, coursed walls with the gate left open, a corbelled parapet
  ST(w+0.3,0.3,d+0.3,sD,0,0,0); ST(w+0.18,0.2,d+0.18,sD,0,0.3,0); ST(w-0.04,H,d-0.04,new THREE.Color(stone).multiplyScalar(0.88).getHex(),0,0,0);
  _stoneWalls(g,w,d,0.5,H,[['f',0,0,1.75,0.62]],cols);
  const pw=w+0.24, pd=d+0.24; for(const [L,x,z,ry] of [[pw,0,pd/2,0],[pw,0,-pd/2,0],[pd,pw/2,0,1],[pd,-pw/2,0,1]]){ const n=Math.round(L/0.42);
    for(let i=0;i<n;i++){ const t=-L/2+(i+0.5)*L/n, cx=ry?x:t, cz=ry?t:z; const co=ST(0.18,0.24,0.18,sD,cx-(ry?Math.sign(x)*0.06:0),H-0.12,cz-(ry?0:Math.sign(z)*0.06)); }
    const wl=ST(ry?0.22:L+0.22,0.42,ry?L+0.22:0.22,stone,x,H+0.08,z); }
  ST(pw+0.1,0.08,pd+0.1,sL,0,H+0.5,0);
  for(const [L,x,z,ry] of [[pw,0,pd/2,0],[pw,0,-pd/2,0],[pd,pw/2,0,1],[pd,-pw/2,0,1]]){ for(let t=-L/2+0.3;t<=L/2-0.25;t+=0.55){ const cx=ry?x:t, cz=ry?t:z; ST(0.3,0.34,0.3,cols[Math.round(t*7+L)&3],cx,H+0.58,cz); ST(0.34,0.05,0.34,sL,cx,H+0.92,cz); } }
  // windows and slits along the hall
  for(const x of [-w/4,w/4]){ ST(0.12,0.62,0.06,0x1a1820,x,1.7,d/2+0.02); ST(0.26,0.06,0.1,sL,x,1.64,d/2+0.04); ST(0.26,0.06,0.1,sL,x,2.34,d/2+0.04); }
  if(w>5) for(const x of [-w/3,0,w/3]){ ST(0.34,0.52,0.06,0x2a2a30,x,2.0,-d/2-0.02); ST(0.26,0.42,0.02,glow(0xf2d27a),x,2.05,-d/2-0.05); const ar=_ptArch(0.5,0.72,0.08,0.1,sL); ar.position.set(x,1.92,-d/2-0.04); g.add(ar); }
  // the gate: nested arches, a portcullis, lanterns, a shield over it
  for(let i=0;i<3;i++){ const ar=_ptArch(1.4-i*0.14,1.95-i*0.08,0.12,0.18,i%2?sL:sD); ar.position.set(0,0.02,d/2+0.12-i*0.08); g.add(ar); }
  ST(1.0,1.6,0.06,0x2a2420,0,0,d/2-0.06); for(let i=0;i<6;i++) ST(0.04,1.55,0.05,0x5a5a62,-0.38+i*0.152,0.05,d/2); for(const y of [0.5,1.0,1.4]) ST(0.92,0.05,0.05,0x5a5a62,0,y,d/2);
  [-0.9,0.9].forEach(x=>{ Sp(0.07,glow(0xffcf6a),x,1.45,d/2+0.2,g,8,6); ST(0.13,0.04,0.13,0x2a2a2a,x,1.54,d/2+0.2); ST(0.04,0.04,0.2,0x2a2a2a,x,1.5,d/2+0.08); });
  { const sh=group(0,2.35,d/2+0.12,g); ST(0.5,0.5,0.08,roof,0,0,0,sh); Co(0.25,0.24,4,softMat(roof),0,-0.24,0,sh).rotation.set(Math.PI,Math.PI/4,0); ST(0.08,0.36,0.1,c.flag||0xe8c050,0,0.07,0.02,sh); ST(0.3,0.08,0.1,c.flag||0xe8c050,0,0.27,0.02,sh); }
  // the donjon
  if(b.w>=5&&b.h>=4){ const dw=w*0.46, dd=d*0.46, dz=-0.25, DH=2.1; ST(dw,DH,dd,stone,0,H,dz); for(let y=H+0.3;y<H+DH;y+=0.34){ ST(dw+0.02,0.025,dd+0.02,sD,0,y,dz); }
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let y=H,i=0;y<H+DH-0.1;y+=0.32,i++){ const big=i%2===0; ST(big?0.36:0.22,0.3,big?0.22:0.36,sL,sx*(dw/2-(big?0.14:0.07)+0.03),y,dz+sz*(dd/2-(big?0.07:0.14)+0.03)); } });
    ST(dw+0.2,0.12,dd+0.2,sL,0,H+DH,dz); const r=prism(dw+0.5,1.25,dd+0.2,softMat(roof)); r.position.set(0,H+DH+0.12,dz); r.rotation.y=Math.PI/2*(dw<dd?1:0); g.add(r);
    [-1,1].forEach(sz=>{ const gb=prism(dw+0.1,1.2,0.1,softMat(stone)); gb.position.set(0,H+DH+0.12,dz+sz*(dd/2+0.06)); g.add(gb); });
    ST(0.06,1.5,0.06,0x3a2a1a,0,H+DH+1.2,dz); const fl=ST(0.62,0.4,0.03,c.flag||roof,0.33,H+DH+2.2,dz); fl.rotation.y=-0.25;
    for(const x of [-dw/4,dw/4]){ ST(0.3,0.46,0.06,0x2a2a30,x,H+0.8,dz+dd/2+0.02); ST(0.22,0.36,0.02,glow(0xf2d27a),x,H+0.85,dz+dd/2+0.05); ST(0.36,0.06,0.12,sL,x,H+0.76,dz+dd/2+0.05); } }
  // the round towers
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz],ti)=>{ const tx=sx*(w/2-0.3), tz=sz*(d/2-0.3), R=0.7, TH=4.5, sm=v=>softMat(v);
    Cy(R+0.1,R+0.18,0.5,16,sm(sD),tx,0,tz,g); Cy(R,R+0.06,TH-0.5,16,sm(stone),tx,0.5,tz,g);
    for(let y=0.9,i=0;y<TH-0.3;y+=0.34,i++) Cy(R+0.012,R+0.012,0.03,16,sm(sD),tx,y,tz,g);
    Cy(R+0.04,R+0.04,0.1,16,sm(sL),tx,2.4,tz,g); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; ST(0.16,0.2,0.16,sD,tx+Math.cos(a)*(R+0.02),TH-0.2,tz+Math.sin(a)*(R+0.02)); }
    Cy(R+0.14,R+0.1,0.42,16,sm(stone),tx,TH,tz,g); Cy(R+0.17,R+0.17,0.07,16,sm(sL),tx,TH+0.4,tz,g);
    Co(R+0.26,1.9,16,sm(roof),tx,TH+0.47,tz,g); for(let i=1;i<5;i++){ const rr=(R+0.26)*(1-i/5.2); Cy(rr,rr+0.03,0.05,16,sm(rD),tx,TH+0.47+i*0.38,tz,g); }
    Sp(0.07,sm(0xe8c050),tx,TH+2.42,tz,g,8,6); ST(0.03,0.5,0.03,0x2a2a2a,tx,TH+2.45,tz); const pn=ST(0.36,0.16,0.02,c.flag||roof,tx+0.18,TH+2.75,tz); pn.rotation.y=-0.3+ti*0.2;
    ST(0.05,0.36,0.14,0x1a1820,tx+sx*(R+0.0),3.3,tz); ST(0.14,0.36,0.05,0x1a1820,tx,1.8,tz+sz*(R+0.0)); }); }
// V107 (LOOK2): IRONHOLD — dark stone and iron. Houses of coursed blue-grey stone with stone gables and heavy quoins, slate roofs
//  with an iron cresting along the ridge, barred windows with oxblood shutters, iron lamp brackets and boot-scrapers, sooty chimneys
//  with iron cowls, the town's red-and-black banners. The Great Forge: an open smithy bay under an iron-bound beam, a hearth glowing
//  under its hood, the great chimney, the anvil on its stump, the quench trough, a rack of blades and the bellows.
const IRON={ st:[0x6e7078,0x62646c,0x7a7c84,0x5a5c64,0x686a72], core:0x55575e, quoin:0x8a8c94, slate:0x464a56, iron:0x2a2a30, ox:0x7a2a22, red:0xa83a2a };
function _ironCrest(g,len,y){ B(0.05,0.05,len,IRON.iron,0,y,0,g); for(let z=-len/2+0.15;z<=len/2-0.1;z+=0.3){ B(0.03,0.2,0.03,IRON.iron,0,y,z,g); Co(0.04,0.1,4,IRON.iron,0,y+0.2,z,g); } }
function _ironLamp(g,x,y,z,ry){ const l=group(x,y,z,g); if(ry) l.rotation.y=ry; B(0.04,0.04,0.32,IRON.iron,0,0.3,0.16,l); B(0.03,0.28,0.03,IRON.iron,0,0.02,0.02,l); const br=B(0.03,0.3,0.03,IRON.iron,0,0.05,0.14,l); br.rotation.x=0.8;
  B(0.14,0.03,0.14,IRON.iron,0,0.22,0.32,l); Sp(0.06,glow(0xffb85a),0,0.14,0.32,l,8,6); B(0.12,0.03,0.12,IRON.iron,0,0.04,0.32,l); return l; }
function _ironBanner(g,x,y,z,ry){ const b=group(x,y,z,g); if(ry) b.rotation.y=ry; B(0.04,0.04,0.3,IRON.iron,0,0,0.12,b); B(0.5,0.04,0.04,IRON.iron,0,0,0.28,b);
  B(0.44,0.8,0.02,IRON.red,0,-0.82,0.28,b); B(0.44,0.08,0.025,0x1a1a1e,0,-0.3,0.28,b); B(0.44,0.08,0.025,0x1a1a1e,0,-0.78,0.28,b); Co(0.12,0.16,3,IRON.red,0,-0.98,0.28,b).rotation.z=Math.PI;
  B(0.12,0.26,0.03,0x1a1a1e,0,-0.66,0.29,b); B(0.24,0.06,0.03,0x1a1a1e,0,-0.5,0.29,b); return b; }   // a black hammer on the red
function _stoneGable(g,w,d,h,rh,cols){ let k=0; [-1,1].forEach(sz=>{ for(let y=h,r=0;y<h+rh-0.12;r++){ const rr=0.24, ww=w*(1-(y+rr*0.5-h)/rh)-0.08; let p=-ww/2+(r%2?0.12:0);
      while(p<ww/2-0.05){ const sw=Math.min(ww/2-p,0.24+hsh(k,r*5+3)*0.22); k++; if(sw>0.08) B(sw-0.04,rr-0.03,0.07,cols[(k+r)%cols.length],p+sw/2,y,sz*(d/2+0.0),g); p+=sw; } y+=rr; } }); }
function _ironHouse(b,g,c,low){ const w=b.w-0.4, d=b.h-0.3, h=low?1.8:2.0, rh=1.25, dx=b._dx||0;
  B(w-0.04,h,d-0.04,IRON.core,0,0,0,g); _stoneFooting(g,w,d,0,0.34);
  const wins=[w/2-0.7,-w/2+0.7].filter(x=>Math.abs(x)>0.6&&Math.abs(x-dx)>0.85);
  const holes=[['f',dx,0,1.2,0.52]].concat(wins.map(x=>['f',x,0.5,1.25,0.42])); if(d>2.4) holes.push(['r',0,0.5,1.25,0.42],['l',0,0.5,1.25,0.42]); holes.push(['b',0,0.5,1.25,0.42]);
  _stoneWalls(g,w,d,0.34,h,holes,IRON.st);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let y=0.36,i=0;y<h-0.2;y+=0.31,i++){ const big=i%2===0; B(big?0.4:0.24,0.3,big?0.24:0.4,IRON.quoin,sx*(w/2-(big?0.16:0.08)+0.04),y,sz*(d/2-(big?0.08:0.16)+0.04),g); } });
  B(w+0.16,0.12,d+0.16,IRON.quoin,0,h-0.06,0,g);
  wins.forEach(x=>_win2(g,x,0.72,d/2+0.08,IRON.iron,0,IRON.ox)); if(d>2.4){ _win2(g,w/2+0.08,0.72,0,IRON.iron,Math.PI/2,null); _win2(g,-w/2-0.08,0.72,0,IRON.iron,-Math.PI/2,null); } _win2(g,0,0.72,-d/2-0.08,IRON.iron,Math.PI,null);
  // stone gables, slate, the iron cresting, a sooty chimney with its cowl
  _gable(g,w,d,h,rh,IRON.core,null); _stoneGable(g,w,d,h,rh,IRON.st);
  _tiles(g,w,d,h,rh,IRON.slate); _ironCrest(g,d+0.4,h+rh+0.14);
  const cx=-w/4, cz=-d/5; for(let j=0;j<5;j++) B(0.46-(j>2?0.05:0),0.28,0.46-(j>2?0.05:0),IRON.st[(j+2)%5],cx,h+0.1+j*0.28-0.3,cz,g); B(0.54,0.07,0.54,0x3a3a3e,cx,h+1.12,cz,g);
  B(0.3,0.06,0.3,IRON.iron,cx,h+1.42,cz,g); [-1,1].forEach(q=>[-1,1].forEach(r=>B(0.03,0.24,0.03,IRON.iron,cx+q*0.12,h+1.19,cz+r*0.12,g))); _smokeAt(g,cx,h+1.52,cz);
  // the door's lamp, a boot-scraper, the banner
  _ironLamp(g,dx+(dx>0?-0.55:0.55),1.05,d/2+0.02); B(0.3,0.08,0.06,IRON.iron,dx+(dx>0?0.45:-0.45),0,d/2+0.2,g);
  _ironBanner(g,w/2+0.02,h-0.1,0.0,Math.PI/2); }
function _forge2(b,g,c){ const w=b.w-0.4, d=b.h-0.3, h=2.1, rh=1.3, dx=b._dx||0, sd=dx<=0?1:-1, bx0=sd>0?Math.max(dx+0.6,-0.2):Math.min(dx-0.6,0.2), bx1=sd*(w/2-0.35), bw=Math.abs(bx1-bx0), bcx=(bx0+bx1)/2;
  const BD=1.3, xa=Math.min(bx0,bx1), xb=Math.max(bx0,bx1); B(w-0.04,h,d-BD,IRON.core,0,0,-BD/2,g);                                  // the core, hollowed in front for the smithy bay
  if(xa>-w/2+0.05) B(xa+w/2-0.02,h,BD-0.04,IRON.core,(xa-w/2)/2,0,d/2-BD/2,g); if(xb<w/2-0.05) B(w/2-xb-0.02,h,BD-0.04,IRON.core,(xb+w/2)/2,0,d/2-BD/2,g);
  B(xb-xa,h-1.74,BD-0.04,IRON.core,(xa+xb)/2,1.74,d/2-BD/2,g); B(xb-xa,0.06,BD,0x4a4440,(xa+xb)/2,0,d/2-BD/2,g);
  _stoneFooting(g,w,d,0,0.34);
  _stoneWalls(g,w,d,0.34,h,[['f',dx,0,1.2,0.52],['f',bcx,0,1.75,bw/2],['b',-w/4,0.5,1.25,0.42],['b',w/4,0.5,1.25,0.42]],IRON.st);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let y=0.36,i=0;y<h-0.2;y+=0.31,i++){ const big=i%2===0; B(big?0.4:0.24,0.3,big?0.24:0.4,IRON.quoin,sx*(w/2-(big?0.16:0.08)+0.04),y,sz*(d/2-(big?0.08:0.16)+0.04),g); } });
  [-w/4,w/4].forEach(x=>_win2(g,x,0.72,-d/2-0.08,IRON.iron,Math.PI,null)); _win2(g,-sd*(w/2+0.08),0.72,0,IRON.iron,-sd*Math.PI/2,null);
  // the open bay: dark inside, an iron-bound oak beam over it, posts
  B(bw+0.3,0.26,0.24,0x5a3a22,bcx,1.72,d/2+0.04,g); for(const x of [bx0,bcx,bx1]) B(0.05,0.28,0.26,IRON.iron,x,1.71,d/2+0.04,g); [bx0,bx1].forEach(x=>B(0.2,1.72,0.2,IRON.quoin,x,0,d/2,g));
  // the hearth under its hood, glowing; the great chimney over it
  const hx=bcx+sd*bw*0.18, hz=d/2-BD+0.32; B(0.9,0.5,0.6,IRON.st[3],hx,0,hz,g); B(0.7,0.08,0.44,glow(0xff7a2a),hx,0.5,hz,g); for(let i=0;i<5;i++) Sp(0.07,glow(i%2?0xffb03a:0xff5a1a),hx-0.24+i*0.12,0.6,hz+(i%2?0.08:-0.06),g,6,4);
  const hood=Co(0.6,0.7,4,softMat(IRON.st[1]),hx,1.0,hz,g); hood.rotation.y=Math.PI/4; B(0.36,0.8,0.36,IRON.st[1],hx,1.6,hz,g);
  for(let j=0;j<7;j++) B(0.62-(j>4?0.06:0),0.3,0.62-(j>4?0.06:0),IRON.st[(j+1)%5],hx,h+0.1+j*0.3-0.3,hz-0.2,g); B(0.72,0.08,0.72,0x2a2a2e,hx,h+2.0,hz-0.2,g); B(0.42,0.06,0.42,glow(0xff8a3a),hx,h+2.06,hz-0.2,g); _smokeAt(g,hx,h+2.2,hz-0.2,true);
  // the anvil on its stump, the quench trough, the bellows, a rack of blades
  const ax=bcx-sd*bw*0.12, az=d/2+0.35; Cy(0.2,0.24,0.42,10,0x6a4428,ax,0,az,g); B(0.42,0.12,0.2,IRON.iron,ax,0.42,az,g); B(0.24,0.1,0.14,IRON.iron,ax,0.54,az,g); const hn=Co(0.07,0.22,6,IRON.iron,ax+0.26,0.6,az,g); hn.rotation.z=-Math.PI/2; B(0.16,0.06,0.08,0x5a5a62,ax-0.02,0.66,az,g); B(0.04,0.04,0.3,0x6a4428,ax-0.02,0.68,az+0.12,g);
  const tx=bx1-sd*0.35; B(0.36,0.32,0.7,0x5a3a22,tx,0,d/2+0.2,g); B(0.3,0.02,0.62,0x3a5a6a,tx,0.3,d/2+0.2,g);
  const bel=group(hx-sd*0.62,0.45,hz,g); B(0.5,0.08,0.34,0x6a4428,0,0,0,bel); B(0.5,0.08,0.34,0x6a4428,0,0.22,0,bel); B(0.46,0.16,0.3,0x4a3020,0,0.06,0,bel); Co(0.06,0.24,6,IRON.iron,0.36*sd,0.1,0,bel).rotation.z=-sd*Math.PI/2;
  const rk=group(bx0+sd*0.25,0,d/2+0.12,g); B(0.06,0.9,0.06,0x5a3a22,0,0,0,rk); B(0.06,0.9,0.06,0x5a3a22,sd*0.5,0,0,rk); B(0.62,0.06,0.08,0x5a3a22,sd*0.25,0.75,0,rk);
  for(let i=0;i<3;i++){ const bl=B(0.04,0.8,0.02,0xc8ccd4,sd*(0.1+i*0.15),0.05,0.03,rk); B(0.12,0.03,0.04,0x3a2a1a,sd*(0.1+i*0.15),0.72,0.03,rk); }
  // the roof: stone gables, slate, the cresting; the smithy's sign: an iron anvil on a bracket
  _gable(g,w,d,h,rh,IRON.core,null); _stoneGable(g,w,d,h,rh,IRON.st); _tiles(g,w,d,h,rh,IRON.slate); _ironCrest(g,d+0.4,h+rh+0.14);
  const sg=group(dx-sd*0.7,1.75,d/2+0.02,g); B(0.04,0.04,0.5,IRON.iron,0,0,0.25,sg); B(0.03,0.16,0.03,IRON.iron,0,-0.16,0.48,sg); B(0.36,0.1,0.12,IRON.iron,0,-0.32,0.48,sg); B(0.2,0.12,0.08,IRON.iron,0,-0.44,0.48,sg); B(0.28,0.05,0.12,IRON.iron,0,-0.5,0.48,sg);
  _ironLamp(g,dx+sd*0.55,1.05,d/2+0.02); _ironBanner(g,-sd*(w/2+0.02),h-0.1,0,-sd*Math.PI/2); }
// V108 (LOOK2): SALTMERE — whitewash and blue trim by the sea. Lime-washed walls a little soft at the corners, a sea-blue plinth band,
//  blue doors, frames and shutters, teal slate roofs over white gables, white chimneys banded blue. And the harbour's clutter on
//  every wall: nets hung out to dry with their cork floats, crossed oars, lobster pots, coils of rope, a ship's lantern by the door,
//  a little fish turning on the ridge. The Fish Market: a white hall with an open stall under a blue-and-white awning, fish laid on
//  ice, a line of the day's catch hung up, a scale, barrels and a great painted fish over it all.
const SALT={ wall:0xf4f0e6, wallD:0xe2ddd0, trim:0x2f6aa8, trimD:0x22508a, roof:0x4a6a78, rope:0xc8a46a, cork:0xe8823a, net:0x8a7a5a };
function _saltNet(g,x,y,z,ry,w,h){ const n=group(x,y,z,g); if(ry) n.rotation.y=ry; const sag=k=>-Math.sin(k*Math.PI)*0.12;
  for(let i=0;i<=Math.round(w/0.14);i++){ const t=i/Math.round(w/0.14), xx=-w/2+t*w; B(0.012,h+sag(t)*0.5,0.012,SALT.net,xx,-h+sag(t)*-0.5,0,n); }
  for(let j=0;j<=Math.round(h/0.14);j++){ const yy=-j*h/Math.round(h/0.14); for(let i=0;i<6;i++){ const t0=i/6, t1=(i+1)/6, m=B(w/6+0.01,0.012,0.012,SALT.net,0,0,0,n); m.position.set(-w/2+(t0+t1)/2*w,yy+sag((t0+t1)/2)*(1-j/Math.round(h/0.14))*0.6,0); m.rotation.z=(sag(t1)-sag(t0))*(1-j/Math.round(h/0.14))*0.6/(w/6)*-1; } }
  for(let i=0;i<5;i++) Sp(0.05,SALT.cork,-w/2+0.1+i*(w-0.2)/4,0.02,0.02,n,6,4); B(w+0.1,0.03,0.03,SALT.rope,0,0,0,n); return n; }
function _saltOars(g,x,y,z,ry){ const o=group(x,y,z,g); if(ry) o.rotation.y=ry; [-1,1].forEach(sd=>{ const a=group(0,0,0.04,o); a.rotation.z=sd*0.5; B(0.035,1.2,0.035,0x9a7444,0,-0.6,0,a); B(0.12,0.32,0.02,sd>0?SALT.trim:0xb83a2a,0,-0.68,0,a); }); return o; }
function _saltPot(g,x,y,z){ const p=group(x,y,z,g); B(0.42,0.04,0.3,0x8a6a40,0,0,0,p); for(let i=0;i<5;i++){ const a=i/4*Math.PI, r=0.16; const s=B(0.02,0.02,0.3,0x8a6a40,0,0,0,p); s.position.set(-0.21+i*0.105,0.04+Math.sin(a)*0,0); }
  [-0.2,-0.07,0.07,0.2].forEach(xx=>{ const h=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.012,4,10,Math.PI),softMat(0x8a6a40)); h.rotation.y=Math.PI/2; h.position.set(xx,0.02,0); p.add(h); }); return p; }
function _saltRope(g,x,y,z){ for(let i=0;i<3;i++){ const t=new THREE.Mesh(new THREE.TorusGeometry(0.16-i*0.035,0.03,5,14),softMat(SALT.rope)); t.rotation.x=Math.PI/2; t.position.set(x,y+0.03+i*0.05,z); g.add(t); } }
function _saltLantern(g,x,y,z){ const l=group(x,y,z,g); B(0.03,0.03,0.24,0x2a2a2e,0,0.28,0.12,l); B(0.16,0.04,0.16,SALT.trimD,0,0.22,0.24,l); Cy(0.07,0.07,0.16,8,glow(0xffd27a),0,0.06,0.24,l); B(0.14,0.03,0.14,SALT.trimD,0,0.03,0.24,l); [-1,1].forEach(a=>[-1,1].forEach(b2=>B(0.015,0.18,0.015,SALT.trimD,a*0.065,0.04,0.24+b2*0.065,l))); return l; }
function _saltFish(g,x,y,z,col,s){ const f=group(x,y,z,g); s=s||1; const b=Sp(0.1*s,col||0xb8c4cc,0,0,0,f,8,6); b.scale.set(2.2,0.9,0.55); const t=Co(0.07*s,0.12*s,3,col||0xb8c4cc,-0.24*s,0,0,f); t.rotation.z=Math.PI/2; Sp(0.018*s,0x1a1a1e,0.13*s,0.03*s,0.04*s,f,4,3); return f; }
function _saltWin(g,x,y,z,ry,small){ const w=_win2(g,x,y,z,SALT.trim,ry,SALT.trim); if(small) w.scale.set(0.85,0.85,0.85); return w; }
function _saltHouse(b,g,c,low){ const w=b.w-0.4, d=b.h-0.3, h=low?1.55:1.8, rh=low?1.0:1.15, dx=b._dx||0;
  B(w,h,d,softMat(SALT.wall),0,0,0,g); B(w+0.08,0.28,d+0.08,SALT.trim,0,0,0,g); B(w+0.14,0.08,d+0.14,0xb8b2a4,0,0,0,g);   // whitewash on a blue-painted plinth
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>Cy(0.14,0.16,h,10,softMat(SALT.wallD),sx*(w/2-0.04),0,sz*(d/2-0.04),g));   // soft, buttressed corners
  B(w+0.12,0.1,d+0.12,SALT.wallD,0,h-0.08,0,g);
  const wins=[w/2-0.62,-w/2+0.62].filter(x=>Math.abs(x)>0.55&&Math.abs(x-dx)>0.8); wins.forEach(x=>_saltWin(g,x,0.78,d/2+0.05,0,low));
  if(d>1.9){ _saltWin(g,w/2+0.05,0.78,0,Math.PI/2,low); _saltWin(g,-w/2-0.05,0.78,0,-Math.PI/2,low); } _saltWin(g,0,0.78,-d/2-0.05,Math.PI,low);
  B(0.84,0.1,0.08,SALT.trim,dx,1.12,d/2+0.04,g); [-0.4,0.4].forEach(q=>B(0.08,1.12,0.07,SALT.trim,dx+q,0,d/2+0.04,g));   // the door's blue surround
  _gable(g,w,d,h,rh,SALT.wall,null); _tiles(g,w,d,h,rh,SALT.roof);
  [-1,1].forEach(sz=>{ const {W2,a}=_roofFrame(w,d,rh,0.4); [-1,1].forEach(sd=>{ const bb=B(Math.hypot(W2,rh)+0.06,0.1,0.08,SALT.trim,0,0,0,g); bb.position.set(sd*W2/2,h+rh/2-0.02,sz*(d/2+0.32)); bb.rotation.z=-sd*a; }); });   // blue bargeboards
  const cx=w/4, cz=-d/6; B(0.42,0.95,0.42,softMat(SALT.wall),cx,h+0.25,cz,g); B(0.46,0.1,0.46,SALT.trim,cx,h+1.05,cz,g); B(0.5,0.06,0.5,SALT.wallD,cx,h+1.15,cz,g); Cy(0.07,0.09,0.2,8,0xa8603a,cx,h+1.21,cz,g); _smokeAt(g,cx,h+1.44,cz);
  // the fish on the ridge
  { const top=h+rh+0.08, vz=d/2-0.2; B(0.03,0.36,0.03,0x2a2a2e,0,top,vz,g); const f=_saltFish(g,0,top+0.42,vz,0x3a7a9a,0.9); f.rotation.y=0.5; }
  // the harbour's clutter: a net drying on the side wall, oars over the door side, a lantern, a lobster pot and rope on the step
  if(d>1.9) _saltNet(g,-w/2-0.07,h-0.12,0.15,-Math.PI/2,Math.min(d-0.7,1.8),0.95); else _saltNet(g,w/2-0.9*(dx>0?3:1)*0,h-0.1,-d/2-0.07,Math.PI,1.3,0.85);
  const ox=dx>0?dx-0.95:dx+0.95; if(Math.abs(ox)<w/2-0.3&&!wins.some(x=>Math.abs(x-ox)<0.5)) _saltOars(g,ox,h-0.18,d/2+0.02); else _saltOars(g,w/2+0.03,h-0.15,-0.5,Math.PI/2);
  _saltLantern(g,dx+(dx>0?-0.55:0.55),1.05,d/2+0.02);
  _saltPot(g,dx+(dx>0?0.85:-0.85),0,d/2+0.3); _saltRope(g,dx+(dx>0?-0.85:0.85),0,d/2+0.32); if(d>1.9) _laundry(g,w/2+0.04,-d/4,w/2+1.2,-d/4-0.1,1.3,(b.x||0)*3+(b.y||0)); }
function _fishMarket2(b,g,c){ const w=b.w-0.4, d=b.h-0.3, h=2.0, rh=1.2, dx=b._dx||0, hd=d*0.58, hz=-d/2+hd/2;
  // the white hall at the back, its roof running across
  B(w,h,hd,softMat(SALT.wall),0,0,hz,g); B(w+0.08,0.28,hd+0.08,SALT.trim,0,0,hz,g); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>Cy(0.14,0.16,h,10,softMat(SALT.wallD),sx*(w/2-0.04),0,hz+sz*(hd/2-0.04),g));
  const r2=group(0,0,hz,g); r2.rotation.y=Math.PI/2; _gable(r2,hd,w,h,rh,SALT.wall,null); _tiles(r2,hd,w,h,rh,SALT.roof);
  [-w/4,w/4].forEach(x=>_saltWin(g,x,0.9,-d/2-0.05,Math.PI)); _saltWin(g,w/2+0.05,0.9,hz,Math.PI/2); _saltWin(g,-w/2-0.05,0.9,hz,-Math.PI/2);
  // the walls of the stall run forward to the door; the door is set in a white wall-end of its own
  const fz=d/2; [-1,1].forEach(sd=>{ B(0.24,1.0,d-hd,softMat(SALT.wall),sd*(w/2-0.12),0,hz+hd/2+(d-hd)/2,g); B(0.3,0.12,d-hd+0.04,SALT.trim,sd*(w/2-0.12),1.0,hz+hd/2+(d-hd)/2,g); });
  { const dw=1.1; B(dw,1.3,0.24,softMat(SALT.wall),dx,0,fz-0.12,g); B(dw+0.06,0.1,0.28,SALT.trim,dx,1.3,fz-0.12,g); [-0.4,0.4].forEach(q=>B(0.08,1.12,0.07,SALT.trim,dx+q,0,fz+0.02,g)); B(0.84,0.1,0.08,SALT.trim,dx,1.12,fz+0.02,g); }
  // the counter, ice and the catch
  const cx0=dx<0?dx+0.75:-w/2+0.35, cx1=dx<0?w/2-0.35:dx-0.75, cw=cx1-cx0, ccx=(cx0+cx1)/2, cz=fz-0.32;
  B(cw,0.72,0.5,0x7a5838,ccx,0,cz,g); for(let x=cx0+0.1;x<cx1-0.05;x+=0.3) B(0.02,0.68,0.02,0x5a3e24,x,0.02,cz+0.26,g); B(cw+0.06,0.06,0.56,0x9a7444,ccx,0.72,cz,g);
  B(cw-0.12,0.08,0.44,0xeef4f8,ccx,0.78,cz,g); for(let i=0;i<Math.round(cw/0.12);i++) Sp(0.04,0xffffff,cx0+0.08+i*0.12,0.86,cz+(hsh(i,3)-0.5)*0.3,g,4,3);
  const FC=[0xb8c4cc,0xe8a090,0x9ab0bc,0xd8b070,0xc8d0d8,0xe07a6a]; for(let i=0;i<Math.round(cw/0.36);i++){ const f=_saltFish(g,cx0+0.22+i*0.36,0.9,cz+(i%2?0.1:-0.1),FC[i%6],0.9); f.rotation.y=(i%2?0.4:-0.3); }
  // scale, barrels of salt fish, a crate of crabs
  { const sx=cx1-0.2; B(0.04,0.5,0.04,0x2a2a2e,sx,0.84,cz-0.12,g); B(0.3,0.03,0.03,0x2a2a2e,sx,1.32,cz-0.12,g); [-0.13,0.13].forEach(q=>{ Cy(0.08,0.06,0.03,8,0xc8a040,sx+q,1.08,cz-0.12,g); B(0.01,0.24,0.01,0x2a2a2e,sx+q,1.1,cz-0.12,g); }); }
  [[cx0-0.05,fz+0.35],[cx0+0.35,fz+0.4]].forEach(([x,z])=>{ Cy(0.18,0.16,0.48,10,0x8a6a40,x,0,z,g); Cy(0.185,0.185,0.03,10,0x3a3a3e,x,0.1,z,g); Cy(0.185,0.185,0.03,10,0x3a3a3e,x,0.38,z,g); Cy(0.16,0.16,0.02,10,0xdde4e8,x,0.48,z,g); _saltFish(g,x,0.53,z,0xb8c4cc,0.6).rotation.y=1; });
  { const kx=cx1-0.1, kz=fz+0.38; B(0.44,0.24,0.32,0x9a7444,kx,0,kz,g); for(let i=0;i<4;i++){ const cr=Sp(0.06,0xd84a2a,kx-0.13+i*0.09,0.27,kz+(i%2?0.06:-0.06),g,6,4); cr.scale.set(1.3,0.6,1); } }
  // the striped awning on its posts, the day's catch hung along a line under it, the great fish on the hall
  const az=fz+0.85, ay=1.75; [-1,1].forEach(sd=>{ Cy(0.04,0.05,ay,8,SALT.trim,sd*(w/2-0.08),0,az,g); });
  const n=Math.round(w/0.42); for(let i=0;i<n;i++){ const st=B(w/n+0.01,0.05,1.25,i%2?0xf4f0e6:SALT.trim,-w/2+w/n*(i+0.5),0,0,g); st.position.set(-w/2+w/n*(i+0.5),ay+0.32,az-0.6); st.rotation.x=0.36; }
  for(let i=0;i<n;i++) { const v=Co(w/n*0.5,0.14,3,i%2?0xf4f0e6:SALT.trim,-w/2+w/n*(i+0.5),ay-0.08,az+0.02,g); v.rotation.set(Math.PI,0,0); v.scale.z=0.15; }
  B(w,0.02,0.02,SALT.rope,0,ay-0.08,az-0.12,g); for(let x=-w/2+0.4;x<w/2-0.3;x+=0.5){ B(0.01,0.16,0.01,SALT.rope,x,ay-0.24,az-0.12,g); const f=_saltFish(g,x,ay-0.42,az-0.12,FC[Math.round(x*3+9)%6],0.8); f.rotation.z=Math.PI/2; }
  { const bf=group(0,h+0.2,hz+hd/2+0.55,g); bf.rotation.x=-0.15; B(1.7,0.7,0.06,softMat(SALT.wall),0,0,0,bf); B(1.8,0.07,0.08,SALT.trim,0,0.7,0,bf); B(1.8,0.07,0.08,SALT.trim,0,-0.04,0,bf); [-0.88,0.88].forEach(x=>B(0.07,0.78,0.08,SALT.trim,x,-0.04,0,bf)); [-0.6,0.6].forEach(x=>B(0.05,0.5,0.05,SALT.trimD,x,-0.5,-0.06,bf));
    const f=_saltFish(bf,0.05,0.35,0.05,0x3a7a9a,3.0); f.scale.z=0.12; }
  _saltNet(g,w/2+0.07,h-0.12,hz,Math.PI/2,Math.min(hd-0.3,1.6),1.0); _saltLantern(g,dx+(dx>0?-0.62:0.62),1.0,fz+0.02); }
// V109 (LOOK2): THORNWOOD — log and moss. Cabins of round logs laid in courses, saddle-notched at the corners with their cut
//  ends showing, log gables, green shingle roofs grown over with moss, river-stone chimneys, antlers over the door, firewood
//  stacked under the eaves, a lantern on a post, mushrooms at the foot of the walls.
const TWOOD={ logs:[0x5e4a38,0x544232,0x66503c,0x5a4634,0x6c5640], cut:0xb09a78, roof:0x55684a, moss:[0x4a6038,0x52683c,0x405830,0x58703f], river:[0x8a8a84,0x9a968c,0x7a7a74,0xa8a49a], shut:0x4a6a3a, dark:0x3e2c1a };
function _logRun(g,axis,fixed,len,y,r,gaps,k){ let a=-len/2; const cuts=gaps.filter(([c,hw,y0,y1])=>y>y0&&y<y1).map(([c,hw])=>[c-hw,c+hw]).sort((p,q)=>p[0]-q[0]); const segs=[];
  for(const [c0,c1] of cuts){ if(c0>a) segs.push([a,c0]); a=Math.max(a,c1); } if(a<len/2) segs.push([a,len/2]);
  segs.forEach(([s0,s1],i)=>{ if(s1-s0<0.08) return; const col=TWOOD.logs[(k+i)%5], L=s1-s0, m=Cy(r,r,L,8,softMat(col),0,0,0,g), mid=(s0+s1)/2;
    if(axis==='x'){ m.rotation.z=Math.PI/2; m.position.set(mid,y,fixed); } else { m.rotation.x=Math.PI/2; m.position.set(fixed,y,mid); } }); }
function _logEnds(g,x,z,y,r,axis){ const e=Cy(r*0.92,r*0.92,0.03,8,softMat(TWOOD.cut),0,0,0,g); if(axis==='x'){ e.rotation.z=Math.PI/2; } else e.rotation.x=Math.PI/2; e.position.set(x,y,z); }
function _moss(g,w,d,h,rh,n){ const {W2}=_roofFrame(w,d,rh,0.4), D=d+0.6; for(const sd of [-1,1]) for(let i=0;i<n;i++){ const f=0.12+hsh(i,sd>0?3:7)*0.78, zz=-D/2+0.2+hsh(i*3,sd>0?5:9)*(D-0.4), x=sd*W2*(1-f), y=h+rh*f+0.1;
    const m=Sp(0.22+hsh(i,11)*0.12,softMat(TWOOD.moss[i%4]),x,y,zz,g,8,5); m.scale.set(1.2,0.32,1.4); m.rotation.z=-sd*Math.atan2(rh,W2); } }
function _antlers(g,x,y,z){ const a=group(x,y,z,g); B(0.2,0.12,0.05,0xd8cca8,0,0,0,a); [-1,1].forEach(sd=>{ const t=Cy(0.018,0.025,0.34,5,0xe8dcc0,sd*0.08,0.05,0,a); t.rotation.z=-sd*0.7; for(let i=0;i<3;i++){ const p=Cy(0.012,0.016,0.12,4,0xe8dcc0,sd*(0.12+i*0.06),0.12+i*0.06,0,a); p.rotation.z=sd*0.3; } }); return a; }
function _woodpile(g,x,z,ry,len){ const p=group(x,0,z,g); if(ry) p.rotation.y=ry; [-1,1].forEach(sd=>B(0.06,0.7,0.36,TWOOD.dark,sd*len/2,0,0,p)); for(let r=0;r<4;r++) for(let i=0;i<Math.round(len/0.15);i++){ const l=Cy(0.065,0.065,0.34,6,softMat(TWOOD.logs[(r+i)%5]),-len/2+0.1+i*0.15+(r%2?0.06:0),0.07+r*0.13,0,p); l.rotation.x=Math.PI/2; Cy(0.058,0.058,0.36,6,softMat(TWOOD.cut),-len/2+0.1+i*0.15+(r%2?0.06:0),0.07+r*0.13,0,p).rotation.x=Math.PI/2; }
  const rf=B(len+0.2,0.05,0.5,TWOOD.logs[2],0,0.72,0,p); rf.rotation.x=0.2; return p; }
function _shrooms(g,x,z,k){ for(let i=0;i<3;i++){ const xx=x+(hsh(k,i)-0.5)*0.3, zz=z+(hsh(i,k)-0.5)*0.2; Cy(0.02,0.025,0.08,5,0xf0e8d8,xx,0,zz,g); const c=Sp(0.05,i%2?0xd84a3a:0xc89a5a,xx,0.09,zz,g,6,4); c.scale.y=0.55; } }
function _logHouse(b,g,c,low,opt){ opt=opt||{}; const w=b.w-0.5, d=b.h-0.4, h=low?1.6:1.75, rh=1.2, dx=b._dx||0, r=0.105, step=0.19;
  B(w-0.1,h,d-0.1,TWOOD.dark,0,0,0,g); _stoneFooting(g,w,d,0,0.26);
  const wins=[w/2-0.65,-w/2+0.65].filter(x=>Math.abs(x)>0.55&&Math.abs(x-dx)>0.8);
  const front=[[dx,0.46,0,1.22]].concat(wins.map(x=>[x,0.34,0.5,1.2])), side=d>2.2?[[0,0.34,0.5,1.2]]:[], back=[[0,0.34,0.5,1.2]];
  let k=0; for(let y=0.3+r,row=0;y<h;y+=step,row++){ const ext=0.2; if(row%2===0){ _logRun(g,'x',d/2,w+ext*2,y,r,front,k++); _logRun(g,'x',-d/2,w+ext*2,y,r,back,k++); [-1,1].forEach(sx=>[-1,1].forEach(sz=>_logEnds(g,sx*(w/2+ext),sz*d/2,y,r,'x'))); }
    else { _logRun(g,'z',w/2,d+ext*2,y,r,side,k++); _logRun(g,'z',-w/2,d+ext*2,y,r,side,k++); [-1,1].forEach(sx=>[-1,1].forEach(sz=>_logEnds(g,sx*w/2,sz*(d/2+ext),y,r,'z'))); } }
  // log gables, the roof, the moss
  [-1,1].forEach(sz=>{ for(let y=h+0.02,i=0;y<h+rh-0.15;y+=step,i++){ const L=w*(1-(y-h)/rh)+0.1; const m=Cy(r*0.9,r*0.9,L,8,softMat(TWOOD.logs[(i+(sz>0?2:0))%5]),0,0,0,g); m.rotation.z=Math.PI/2; m.position.set(0,y+r,sz*d/2); } });
  _tiles(g,w,d,h+0.05,rh,TWOOD.roof); _moss(g,w,d,h+0.05,rh,low?6:8);
  [-1,1].forEach(sz=>{ const {W2,a}=_roofFrame(w,d,rh,0.4); [-1,1].forEach(sd=>{ const bb=Cy(0.07,0.07,Math.hypot(W2,rh)+0.1,6,softMat(TWOOD.logs[1]),0,0,0,g); bb.rotation.z=Math.PI/2-sd*a; bb.position.set(sd*W2/2,h+0.05+rh/2,sz*(d/2+0.32)); }); });
  // windows, the antlers, the river-stone chimney up the gable end, firewood, a lantern on a post, mushrooms
  wins.forEach(x=>_win2(g,x,0.72,d/2+0.1,TWOOD.dark,0,TWOOD.shut)); side.length&&[-1,1].forEach(sx=>_win2(g,sx*(w/2+0.1),0.72,0,TWOOD.dark,sx*Math.PI/2,TWOOD.shut)); _win2(g,0,0.72,-d/2-0.1,TWOOD.dark,Math.PI,TWOOD.shut);
  B(0.86,0.1,0.1,TWOOD.dark,dx,1.2,d/2+0.08,g); _antlers(g,dx,1.36,d/2+0.12);
  const chx=opt.noChimney?null:(dx>0?-1:1)*(w/2+0.22); if(chx!==null){ const nst=Math.round((h+rh+0.5)/0.24); for(let i=0;i<nst;i++){ const wd=0.62-Math.min(i,8)*0.03; B(wd*(0.92+hsh(i,2)*0.12),0.24,0.5,TWOOD.river[i%4],chx+(chx>0?-0.02:0.02)*0,i*0.24,-d/6+(hsh(i,5)-0.5)*0.04,g); } B(0.5,0.08,0.46,0x6a6a64,chx,nst*0.24,-d/6,g); _smokeAt(g,chx,nst*0.24+0.2,-d/6); }
  _woodpile(g,-(chx||1)*0+((chx||1)>0?-1:1)*(w/2+0.32),d/6,Math.PI/2,Math.min(d-0.6,1.3));
  { const px=dx+(dx>0?-0.9:0.9), pz=d/2+0.55; Cy(0.05,0.06,1.4,6,TWOOD.dark,px,0,pz,g); B(0.3,0.04,0.04,TWOOD.dark,px+0.13,1.36,pz,g); Sp(0.07,glow(0xffc86a),px+0.26,1.22,pz,g,8,6); B(0.12,0.03,0.12,TWOOD.dark,px+0.26,1.3,pz,g); }
  _shrooms(g,-w/2+0.3,d/2+0.2,b.x||1); _shrooms(g,w/2-0.4,-d/2-0.2,b.y||2); }
// DUSTHAVEN — adobe and awnings: soft mud-plastered walls rounded at every edge, battered at the foot, flat roofs behind rounded
//  parapets with the vigas (roof beams) poking through, turquoise doors and window frames, carved wooden lattices, striped awnings
//  on poles, clay jars, a ladder to the roof, rugs over the parapet; the bazaar with a dome and its spice baskets.
const SAND={ wall:0xdcbc8c, wallL:0xe8cc9e, wallD:0xc4a272, turq:0x2a9a9a, turqD:0x1e7a7a, viga:0x6a4a2a, clay:0xb8643a, cream:0xf2e6cc, awn:[0xc8502e,0xe8b84a,0x2a8a8a,0x8a3a6a] };
function _adobeWin(g,x,y,z,ry){ const w=group(x,y,z,g); if(ry) w.rotation.y=ry; B(0.44,0.58,0.1,0x2a221a,0,0,-0.02,w); B(0.36,0.5,0.02,(typeof LIFE!=='undefined'?LIFE.WINLIT:glow(0xf2c87a)),0,0.04,0.0,w);
  for(let i=-2;i<=2;i++){ B(0.02,0.5,0.03,0x8a5a2a,i*0.07,0.04,0.04,w); } for(let j=0;j<6;j++) B(0.36,0.02,0.03,0x8a5a2a,0,0.08+j*0.08,0.04,w);
  B(0.56,0.08,0.12,SAND.turq,0,-0.06,0.04,w); B(0.56,0.08,0.12,SAND.turq,0,0.58,0.04,w); B(0.08,0.64,0.12,SAND.turq,-0.26,-0.06,0.04,w); B(0.08,0.64,0.12,SAND.turq,0.26,-0.06,0.04,w); return w; }
function _jar(g,x,z,s,col){ s=s||1; const j=Sp(0.16*s,softMat(col||SAND.clay),x,0.16*s,z,g,10,8); j.scale.y=1.15; Cy(0.07*s,0.09*s,0.08*s,8,softMat(col||SAND.clay),x,0.32*s,z,g); Cy(0.09*s,0.09*s,0.02*s,8,softMat(col||SAND.clay),x,0.4*s,z,g); }
function _awning(g,x,y,z,wd,dp,k,ry){ const a=group(x,y,z,g); if(ry) a.rotation.y=ry; const n=Math.max(3,Math.round(wd/0.3)); for(let i=0;i<n;i++){ const st=B(wd/n+0.01,0.04,dp,i%2?SAND.cream:SAND.awn[k%4],-wd/2+wd/n*(i+0.5),0,dp/2,a); st.rotation.x=0.3; }
  [-1,1].forEach(sd=>{ Cy(0.03,0.035,y,6,SAND.viga,sd*(wd/2-0.04),-y,dp-0.06,a); }); for(let i=0;i<n;i++) Co(wd/n*0.45,0.12,3,i%2?SAND.cream:SAND.awn[k%4],-wd/2+wd/n*(i+0.5),-0.36,dp-0.05,a).rotation.x=Math.PI; return a; }
function _adobeBox(g,w,d,y0,h,par){ const W=softMat(SAND.wall); B(w,h,d,W,0,y0,0,g); B(w+0.16,0.3,d+0.16,softMat(SAND.wallD),0,y0,0,g);   // the wall and its battered foot
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>Cy(0.16,0.2,h+(par?0.32:0),10,softMat(SAND.wallL),sx*(w/2-0.06),y0,sz*(d/2-0.06),g));
  if(par){ [[w,0,d/2,0],[w,0,-d/2,0],[d,w/2,0,1],[d,-w/2,0,1]].forEach(([L,x,z,ry])=>{ const pp=B(ry?0.16:L,0.3,ry?L:0.16,W,x,y0+h,z,g); const cap=Cy(0.08,0.08,L,8,softMat(SAND.wallL),0,0,0,g); if(ry){ cap.rotation.x=Math.PI/2; cap.position.set(x,y0+h+0.3,z); } else { cap.rotation.z=Math.PI/2; cap.position.set(x,y0+h+0.3,z); } });
    B(w-0.2,0.06,d-0.2,0xb8986a,0,y0+h-0.02,0,g);
    for(let x=-w/2+0.35;x<w/2-0.2;x+=0.5) [-1,1].forEach(sz=>{ const v=Cy(0.06,0.06,0.42,7,softMat(SAND.viga),x,0,sz*(d/2+0.1),g); v.rotation.x=Math.PI/2; v.position.y=y0+h-0.16; }); } }
function _adobe(b,g,c,low,opt){ opt=opt||{}; const w=b.w-0.4, d=b.h-0.3, h=low?1.75:1.95, dx=b._dx||0;
  _adobeBox(g,w,d,0,h,true);
  const wins=[w/2-0.62,-w/2+0.62].filter(x=>Math.abs(x)>0.55&&Math.abs(x-dx)>0.8); wins.forEach(x=>_adobeWin(g,x,0.72,d/2+0.06));
  if(d>2.2) [-1,1].forEach(sx=>_adobeWin(g,sx*(w/2+0.06),0.72,0,sx*Math.PI/2)); _adobeWin(g,0,0.72,-d/2-0.06,Math.PI);
  // the door's turquoise arch
  { const ar=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.06,6,14,Math.PI),softMat(SAND.turq)); ar.position.set(dx,1.02,d/2+0.06); g.add(ar); [-0.42,0.42].forEach(q=>B(0.12,1.02,0.1,SAND.turq,dx+q,0,d/2+0.05,g)); const tym=new THREE.Mesh(new THREE.CircleGeometry(0.38,14,0,Math.PI),softMat(SAND.turqD)); tym.position.set(dx,1.02,d/2+0.04); g.add(tym); }
  _awning(g,wins[0]!==undefined?wins[0]:-dx,1.45,d/2+0.02,0.9,0.6,(b.x||0)+(b.y||0));
  _jar(g,dx+(dx>0?-0.72:0.72),d/2+0.3,1); _jar(g,dx+(dx>0?-0.98:0.98),d/2+0.22,0.7,0x9a5a34);
  // a ladder up to the roof, a rug over the parapet, a little canopy and jars up top
  { const lx=(dx>0?-1:1)*(w/2+0.18), lz=-d/4; [-0.16,0.16].forEach(q=>{ const r=Cy(0.03,0.03,h+0.9,5,SAND.viga,lx,0,lz+q,g); r.rotation.z=(dx>0?1:-1)*-0.1; }); for(let y=0.3;y<h+0.6;y+=0.3) { const r=Cy(0.02,0.02,0.32,5,SAND.viga,lx+(dx>0?1:-1)*-0.1*y/(h+0.9)*0,y,lz,g); r.rotation.x=Math.PI/2; } }
  { const rx=(dx>0?1:-1)*0.3*0+(-w/4), rug=group(rx,h+0.3,-d/2-0.06,g); B(0.8,0.06,0.2,SAND.awn[1],0,0,0.06,rug); B(0.8,0.7,0.03,SAND.awn[(b.x||0)%4],0,-0.7,0.17,rug); for(let i=0;i<4;i++) B(0.8,0.05,0.035,SAND.cream,0,-0.62+i*0.16,0.18,rug); }
  if(!opt.noCanopy){ const cx=w/4, cz=-d/6, cy=h; [-1,1].forEach(a=>[-1,1].forEach(b2=>Cy(0.03,0.03,0.8,5,SAND.viga,cx+a*0.4,cy,cz+b2*0.4,g))); const cn=B(0.96,0.04,0.96,SAND.awn[2],cx,cy+0.8,cz,g); _jar(g,cx-0.2,cz+0.1,0.6); g.children[g.children.length-1].position.y+=cy; g.children[g.children.length-2].position.y+=cy; g.children[g.children.length-3].position.y+=cy; } }
function _bazaar2(b,g,c){ const w=b.w-0.4, d=b.h-0.3, h=1.95, dx=b._dx||0;
  _adobe(b,g,c,false,{noCanopy:true});
  // the dome on its drum, and a crescent-free gilt finial
  const dr=Math.min(w,d)*0.32; Cy(dr+0.06,dr+0.06,0.4,16,softMat(SAND.wallL),0,h,-0.1,g); const dm=new THREE.Mesh(new THREE.SphereGeometry(dr+0.04,18,10,0,Math.PI*2,0,Math.PI/2),softMat(0x3a8088)); dm.position.set(0,h+0.4,-0.1); g.add(dm);
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; B(0.05,0.26,0.06,SAND.turqD,Math.cos(a)*(dr+0.07),h+0.08,-0.1+Math.sin(a)*(dr+0.07),g).rotation.y=-a; } Sp(0.07,0xe8c050,0,h+0.4+dr+0.08,-0.1,g,8,6); B(0.03,0.3,0.03,0xe8c050,0,h+0.4+dr+0.08,-0.1,g);
  // the stalls along the front: awnings, tables of spice cones and cloth, hanging rugs
  const xs=[-w/2+0.7,w/2-0.7].filter(x=>Math.abs(x-dx)>0.9); xs.forEach((x,i)=>{ _awning(g,x,1.5,d/2+0.02,1.1,0.85,i+1); B(0.9,0.5,0.45,SAND.viga,x,0,d/2+0.5,g); B(0.96,0.04,0.5,0x8a5a2a,x,0.5,d/2+0.5,g);
    [0xc8402e,0xe8b84a,0xd88a3a,0x6a8a3a,0x8a3a2a].forEach((col,j)=>{ const bx=x-0.36+j*0.18; Cy(0.08,0.07,0.08,8,0x9a6a3a,bx,0.54,d/2+0.5,g); Co(0.075,0.12,8,col,bx,0.62,d/2+0.5,g); }); });
  [-1,1].forEach(sx=>{ const rg=group(sx*(w/2+0.08),h-0.1,d/4,g); rg.rotation.y=sx*Math.PI/2; B(0.7,1.0,0.03,SAND.awn[sx>0?3:0],0,-1.0,0,rg); for(let i=0;i<5;i++) B(0.7,0.05,0.035,i%2?SAND.cream:SAND.awn[1],0,-0.9+i*0.2,0.01,rg); }); }
function _adobeInn(b,g,c){ const w=b.w-0.3, d=b.h-0.3, H1=1.6, H2=1.4, dx=b._dx||0, d2=d*0.62, z2=-d/2+d2/2;
  _adobeBox(g,w,d,0,H1,false); B(w+0.02,0.1,d+0.02,softMat(SAND.wallL),0,H1,0,g);
  const g2=group(0,0,z2,g); _adobeBox(g2,w-0.3,d2,H1+0.1,H2,true);
  // the terrace on the lower roof: a parapet, a canopy, cushions
  [[w,0,d/2,0],[(d-d2),w/2,d/2-(d-d2)/2,1],[(d-d2),-w/2,d/2-(d-d2)/2,1]].forEach(([L,x,z,ry])=>{ B(ry?0.16:L,0.36,ry?L:0.16,softMat(SAND.wall),x,H1+0.1,z,g); });
  const tz=z2+d2/2+(d-d2)/2; [-1,1].forEach(a=>[-1,1].forEach(b2=>Cy(0.03,0.03,1.0,5,SAND.viga,a*(w/2-0.25),H1+0.1,tz+b2*(d-d2)/2*0.7,g))); B(w-0.4,0.04,(d-d2)*0.8,SAND.awn[0],0,H1+1.1,tz,g);
  for(let i=0;i<3;i++) B(0.4,0.1,0.3,SAND.awn[(i+1)%4],-w/4+i*w/4,H1+0.12,tz,g);
  [-w/2+0.7,w/2-0.7].forEach(x=>{ if(Math.abs(x-dx)>0.8) _adobeWin(g,x,0.62,d/2+0.06); }); [-1,1].forEach(sx=>_adobeWin(g,sx*(w/2+0.06),0.62,0,sx*Math.PI/2));
  [-0.7,0.7].forEach(x=>_adobeWin(g2,x,H1+0.42,d2/2+0.06)); _adobeWin(g2,0,H1+0.42,-d2/2-0.06,Math.PI);
  { const ar=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.06,6,14,Math.PI),softMat(SAND.turq)); ar.position.set(dx,1.02,d/2+0.06); g.add(ar); [-0.42,0.42].forEach(q=>B(0.12,1.02,0.1,SAND.turq,dx+q,0,d/2+0.05,g)); }
  _awning(g,dx,1.5,d/2+0.02,1.4,0.7,1); _jar(g,-w/2+0.4,d/2+0.3,1); _jar(g,w/2-0.4,d/2+0.3,1.1,0x9a5a34);
  const sg=group(w/2-0.2,1.3,d/2+0.12,g); B(0.04,0.04,0.5,SAND.viga,0,0,0.2,sg); const bd=group(0,-0.3,0.4,sg); bd.rotation.y=Math.PI/2; B(0.56,0.38,0.05,c.sign||SAND.turq,0,0,0,bd); B(0.6,0.04,0.07,SAND.viga,0,0.38,0,bd); }
// CRYSTALPEAK — the frozen monastery town: lavender-grey stone under steep slate heavy with snow, icicles all along the eaves,
//  plum shutters round warm windows, and the mountain's crystals growing out of the corners, glowing on the ridge and lighting
//  the door.
const FROST={ st:[0xa8a4b8,0x9a96aa,0xb4b0c4,0x8e8a9e,0xa09cb0], core:0x8a869a, quoin:0xc4c0d0, slate:0x4e5668, snow:0xf4f8fc, ice:0xd8eef8, shut:0x5a4a7a };
const _CRYM=()=>new THREE.MeshLambertMaterial({color:0xb8f0ff,emissive:0x2a7a9a,transparent:true,opacity:0.86});
let _cryMat=null; function _crystals(g,x,y,z,s,k){ _cryMat=_cryMat||_CRYM(); const cg=group(x,y,z,g); for(let i=0;i<5;i++){ const h=(0.3+hsh(k,i)*0.35)*s, m=new THREE.Mesh(new THREE.OctahedronGeometry(0.1*s,0),_cryMat); m.scale.set(1,h/(0.1*s)*0.5,1); m.position.set((hsh(i,k)-0.5)*0.24*s,h*0.5,(hsh(k+3,i)-0.5)*0.24*s); m.rotation.set((hsh(i,7)-0.5)*0.6,hsh(k,i+2)*3,(hsh(i+5,k)-0.5)*0.6); m.userData.keep=true; cg.add(m); } return cg; }
function _snowRoof(g,w,d,h,rh){ const {W2,a,L}=_roofFrame(w,d,rh,0.4), D=d+0.66; [-1,1].forEach(sd=>{ const sn=B(L*0.9,0.14,D,softMat(FROST.snow),0,0,0,g); sn.position.set(sd*W2*0.5,h+rh*0.5+0.14,0); sn.rotation.z=-sd*a;
    const lip=Cy(0.09,0.09,D,8,softMat(FROST.snow),0,0,0,g); lip.rotation.x=Math.PI/2; lip.position.set(sd*(W2-0.02),h+0.08,0);
    for(let z=-D/2+0.12;z<D/2-0.05;z+=0.17){ const ln=0.12+hsh(Math.round(z*30),sd>0?3:7)*0.3, ic=Co(0.035,ln,5,softMat(FROST.ice),sd*(W2-0.02),h-ln+0.02,z,g); ic.rotation.x=Math.PI; } });
  const rg=Cy(0.17,0.17,D+0.04,10,softMat(FROST.snow),0,0,0,g); rg.rotation.x=Math.PI/2; rg.position.set(0,h+rh+0.12,0); }
function _frostHouse(b,g,c,low,opt){ opt=opt||{}; const w=b.w-0.35, d=b.h-0.3, h=low?1.6:1.75, rh=Math.min(1.7,w*0.62), dx=b._dx||0;
  B(w-0.04,h,d-0.04,FROST.core,0,0,0,g); _stoneFooting(g,w,d,0,0.3);
  const wins=[w/2-0.55,-w/2+0.55].filter(x=>Math.abs(x)>0.45&&Math.abs(x-dx)>0.75);
  const holes=[['f',dx,0,1.2,0.5]].concat(wins.map(x=>['f',x,0.5,1.25,0.4])); if(d>1.9) holes.push(['r',0,0.5,1.25,0.4],['l',0,0.5,1.25,0.4]); holes.push(['b',0,0.5,1.25,0.4]);
  _stoneWalls(g,w,d,0.3,h,holes,FROST.st);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let y=0.32,i=0;y<h-0.2;y+=0.31,i++){ const big=i%2===0; B(big?0.36:0.22,0.3,big?0.22:0.36,FROST.quoin,sx*(w/2-(big?0.14:0.07)+0.04),y,sz*(d/2-(big?0.07:0.14)+0.04),g); } });
  wins.forEach(x=>{ _win2(g,x,0.72,d/2+0.08,0x3a3448,0,FROST.shut).scale.set(0.85,0.85,0.85); B(0.6,0.06,0.2,softMat(FROST.snow),x,0.66,d/2+0.16,g); });
  if(d>1.9) [-1,1].forEach(sx=>_win2(g,sx*(w/2+0.08),0.72,0,0x3a3448,sx*Math.PI/2,FROST.shut).scale.set(0.85,0.85,0.85)); _win2(g,0,0.72,-d/2-0.08,0x3a3448,Math.PI,FROST.shut).scale.set(0.85,0.85,0.85);
  _gable(g,w,d,h,rh,FROST.core,null); _stoneGable(g,w,d,h,rh,FROST.st); _tiles(g,w,d,h,rh,FROST.slate); _snowRoof(g,w,d,h,rh);
  const cx=w/4, cz=-d/5; for(let j=0;j<6;j++) B(0.4-(j>3?0.04:0),0.27,0.4-(j>3?0.04:0),FROST.st[(j+1)%5],cx,h+0.05+j*0.27-0.3,cz,g); const sc=Sp(0.26,softMat(FROST.snow),cx,h+1.4,cz,g,10,6); sc.scale.y=0.4; Cy(0.07,0.09,0.2,8,0xa8603a,cx,h+1.38,cz,g); _smokeAt(g,cx,h+1.62,cz);
  _crystals(g,0,h+rh+0.2,d/2-0.15,1.4,3);   // a crystal on the ridge
  _crystals(g,(dx>0?-1:1)*(w/2+0.2),0,d/2+0.2,2.2,(b.x||0)); _crystals(g,(dx>0?1:-1)*(w/2+0.15),0,-d/2-0.15,1.7,(b.y||0)+5);
  { const lx=dx+(dx>0?-0.55:0.55), l=group(lx,1.05,d/2+0.02,g); B(0.03,0.03,0.24,0x2a2a2e,0,0.24,0.12,l); _crystals(l,0,-0.02,0.24,0.8,9); }
  B(1.0,0.08,0.5,softMat(FROST.snow),dx,0,d/2+0.32,g); }
// STORMGATE — the grand capital: rusticated pale ashlar below, smooth ashlar and pilasters above, a cornice, tall windows under
//  little pediments with iron balconies, a royal-blue slate roof with dormers and gilt finials, banners of blue and gold.
const GRAND={ st:[0xd8d2c4,0xccc6b8,0xe2dccf,0xc4beb0,0xd0cabc], smooth:0xe4dfd2, trim:0xf2eee4, roof:0x3a5288, gold:0xe8c050, iron:0x22242a, blue:0x2c4c9e };
function _grandWin(g,x,y,z,ry,bal){ const w=group(x,y,z,g); if(ry) w.rotation.y=ry; B(0.5,0.86,0.1,0x2a2a30,0,0,-0.02,w); B(0.42,0.78,0.02,(typeof LIFE!=='undefined'?LIFE.WINLIT:glow(0xf2d27a)),0,0.04,0.02,w); B(0.05,0.78,0.05,0xf4f0e8,0,0.04,0.05,w); for(const yy of [0.3,0.56]) B(0.42,0.04,0.05,0xf4f0e8,0,0.04+yy,0.05,w);
  B(0.64,0.08,0.14,GRAND.trim,0,-0.08,0.05,w); [-0.29,0.29].forEach(q=>B(0.08,0.94,0.1,GRAND.trim,q,-0.06,0.05,w)); const pd=prism(0.78,0.24,0.12,softMat(GRAND.trim)); pd.position.set(0,0.92,0.06); w.add(pd);
  if(bal){ B(0.86,0.06,0.36,GRAND.trim,0,-0.1,0.2,w); for(let i=0;i<9;i++) B(0.02,0.36,0.02,GRAND.iron,-0.4+i*0.1,-0.04,0.37,w); B(0.86,0.03,0.03,GRAND.iron,0,0.32,0.37,w); [-0.42,0.42].forEach(q=>B(0.02,0.36,0.34,GRAND.iron,q,-0.04,0.2,w)); } return w; }
function _grandBanner(g,x,y,z,ry){ const b=group(x,y,z,g); if(ry) b.rotation.y=ry; B(0.04,0.04,0.3,GRAND.iron,0,0,0.12,b); B(0.46,0.04,0.04,GRAND.gold,0,0,0.28,b); B(0.4,1.0,0.02,GRAND.blue,0,-1.02,0.28,b); B(0.4,0.06,0.025,GRAND.gold,0,-0.12,0.29,b); B(0.4,0.06,0.025,GRAND.gold,0,-0.98,0.29,b);
  Co(0.11,0.16,3,GRAND.blue,0,-1.18,0.28,b).rotation.z=Math.PI; const cr=group(0,-0.56,0.3,b); B(0.18,0.1,0.02,GRAND.gold,0,0,0,cr); [-0.07,0,0.07].forEach(q=>Co(0.025,0.08,4,GRAND.gold,q,0.1,0,cr)); return b; }   // a gold crown on royal blue
function _grand(b,g,c,kind){ const w=b.w-0.3, d=b.h-0.3, H1=1.5, H2=2.85, rh=1.2, dx=b._dx||0;
  B(w-0.04,H2,d-0.04,0xbab4a6,0,0,0,g); _stoneFooting(g,w,d,0,0.28);
  const wx=[w/2-0.75,-w/2+0.75].filter(x=>Math.abs(x)>0.6), fw=wx.filter(x=>Math.abs(x-dx)>0.85);
  const shopArc=kind==='shop'; const holes=[['f',dx,0,1.3,0.55]]; if(shopArc) wx.filter(x=>Math.abs(x-dx)>0.85).forEach(x=>holes.push(['f',x,0.3,1.35,0.55])); else fw.forEach(x=>holes.push(['f',x,0.4,1.3,0.32]));
  [-1,1].forEach(sx=>holes.push([sx>0?'r':'l',0,0.4,1.3,0.32])); holes.push(['b',-w/4,0.4,1.3,0.32],['b',w/4,0.4,1.3,0.32]);
  _stoneWalls(g,w,d,0.28,H1,holes,GRAND.st);
  B(w+0.16,0.14,d+0.16,GRAND.trim,0,H1,0,g); B(w+0.04,H2-H1-0.14,d+0.04,softMat(GRAND.smooth),0,H1+0.14,0,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ B(0.2,H2-H1-0.14,0.2,GRAND.trim,sx*(w/2-0.06),H1+0.14,sz*(d/2-0.06),g); });
  [-w/6,w/6].forEach(x=>{ if(w>3.4) B(0.14,H2-H1-0.2,0.08,GRAND.trim,x*2.2*0+x,H1+0.16,d/2+0.04,g); });
  B(w+0.24,0.12,d+0.24,GRAND.trim,0,H2-0.04,0,g); B(w+0.32,0.08,d+0.32,0xd8d2c4,0,H2+0.08,0,g); for(let x=-w/2;x<=w/2;x+=0.22) [-1,1].forEach(sz=>B(0.08,0.1,0.08,GRAND.trim,x,H2-0.14,sz*(d/2+0.1),g));
  // ground-floor windows (or the shop's arched windows), the door's porch, the upper floor's windows with balconies
  if(shopArc) wx.filter(x=>Math.abs(x-dx)>0.85).forEach(x=>{ const ar=new THREE.Mesh(new THREE.TorusGeometry(0.52,0.07,6,14,Math.PI),softMat(GRAND.trim)); ar.position.set(x,0.9,d/2+0.06); g.add(ar); B(0.96,0.6,0.04,glow(0xf2d27a),x,0.32,d/2+0.02,g); B(1.0,0.06,0.2,GRAND.trim,x,0.28,d/2+0.08,g);
      [0xd84a3a,0xf2c14e,0x4a8a5a,0x5a7ab8].forEach((col,i)=>B(0.16,0.2,0.12,col,x-0.3+i*0.2,0.34,d/2+0.03,g)); _awning(g,x,1.45,d/2+0.02,1.1,0.55,3+(x>0?1:0)); });
  else fw.forEach(x=>_grandWin(g,x,0.5,d/2+0.08,0,false));
  [-1,1].forEach(sx=>_grandWin(g,sx*(w/2+0.08),0.5,0,sx*Math.PI/2,false)); [-w/4,w/4].forEach(x=>_grandWin(g,x,0.5,-d/2-0.08,Math.PI,false));
  wx.concat(w>3.6?[0]:[]).forEach(x=>_grandWin(g,x,H1+0.32,d/2+0.06,0,true)); [-1,1].forEach(sx=>_grandWin(g,sx*(w/2+0.06),H1+0.32,0,sx*Math.PI/2,false)); [-w/4,w/4].forEach(x=>_grandWin(g,x,H1+0.32,-d/2-0.06,Math.PI,false));
  { const pz=d/2+0.25; [-0.52,0.52].forEach(q=>{ Cy(0.07,0.08,1.3,10,softMat(GRAND.trim),dx+q,0,pz,g); B(0.2,0.08,0.2,GRAND.trim,dx+q,1.28,pz,g); }); B(1.3,0.12,0.5,GRAND.trim,dx,1.36,d/2+0.2,g); const pd=prism(1.4,0.36,0.5,softMat(GRAND.trim)); pd.position.set(dx,1.48,d/2+0.2); g.add(pd); B(0.6,0.12,0.02,GRAND.gold,dx,1.56,d/2+0.46,g); }
  // the roof: royal-blue slate over trim gables, dormers, gilt finials, chimneys
  _gable(g,w,d,H2+0.12,rh,GRAND.smooth,null); _tiles(g,w,d,H2+0.12,rh,GRAND.roof);
  [-1,1].forEach(sz=>{ B(0.06,0.5,0.06,GRAND.gold,0,H2+0.12+rh,sz*(d/2+0.25),g); Sp(0.07,GRAND.gold,0,H2+0.12+rh+0.55,sz*(d/2+0.25),g,8,6); });
  B(0.05,0.05,d+0.4,GRAND.gold,0,H2+0.12+rh+0.06,0,g);
  [-1,1].forEach(sd=>{ if(d<2.8) return; const x0=sd*w*0.26, dzz=0; B(0.6,0.62,0.6,softMat(GRAND.smooth),x0,H2+0.12,dzz,g); const fw2=_grandWin(g,x0+sd*0.31,H2+0.2,dzz,sd*Math.PI/2,false); fw2.scale.set(0.6,0.5,0.6); const dr=prism(0.72,0.36,0.72,softMat(GRAND.roof)); dr.rotation.y=Math.PI/2; dr.position.set(x0,H2+0.74,dzz); g.add(dr); });
  [[-w/2+0.5,-d/2+0.45],[w/2-0.5,-d/2+0.45]].forEach(([cx,cz])=>{ B(0.42,1.2,0.42,GRAND.st[1],cx,H2+0.3,cz,g); B(0.5,0.08,0.5,GRAND.trim,cx,H2+1.5,cz,g); [-0.1,0.1].forEach(q=>Cy(0.06,0.08,0.18,8,0xa8603a,cx+q,H2+1.58,cz,g)); _smokeAt(g,cx,H2+1.8,cz); });
  _grandBanner(g,w/2+0.08,H2-0.2,d/4,Math.PI/2); _grandBanner(g,-w/2-0.08,H2-0.2,d/4,-Math.PI/2);
  if(kind==='inn'){ const sg=group(dx+(dx>0?-1.1:1.1),1.3,d/2+0.12,g); B(0.04,0.04,0.55,GRAND.iron,0,0,0.25,sg); const bd=group(0,-0.32,0.5,sg); bd.rotation.y=Math.PI/2; B(0.6,0.4,0.05,c.sign||GRAND.blue,0,0,0,bd); B(0.64,0.05,0.07,GRAND.gold,0,0.4,0,bd); B(0.64,0.05,0.07,GRAND.gold,0,-0.02,0,bd); } }
function _woodStall(b,g){ const w=b.w-0.5, d=b.h-0.4, dx=b._dx||0, x=dx>0?-w/2+0.75:w/2-0.75; if(Math.abs(x-dx)<0.9) return;   // a herb-and-hide stall under a bark lean-to
  [-0.55,0.55].forEach(q=>Cy(0.05,0.06,1.4,6,TWOOD.dark,x+q,0,d/2+0.85,g)); const rf=B(1.4,0.06,0.95,TWOOD.roof,x,1.42,d/2+0.45,g); rf.rotation.x=0.28; _moss(group(x,1.2,d/2+0.45,g),1.2,0.6,0.1,0.15,2);
  B(1.1,0.5,0.4,TWOOD.logs[0],x,0,d/2+0.55,g); for(let i=0;i<4;i++){ Cy(0.11,0.09,0.14,8,0x9a7a4a,x-0.4+i*0.27,0.5,d/2+0.55,g); Sp(0.08,[0x5a8a3a,0xc84a3a,0xe8c050,0x6a4ab0][i],x-0.4+i*0.27,0.66,d/2+0.55,g,6,4); }
  B(1.2,0.02,0.02,0x8a6a40,x,1.3,d/2+0.9,g); for(let i=0;i<5;i++){ const bn=Co(0.05,0.22,5,[0x6a8a3a,0x8a7a3a,0x5a7a3a][i%3],x-0.48+i*0.24,1.08,d/2+0.9,g); bn.rotation.x=Math.PI; } }
function _frostStall(b,g){ const w=b.w-0.35, d=b.h-0.3, dx=b._dx||0, x=dx>0?-w/2+0.5:w/2-0.5; B(0.7,0.55,0.36,0x6a5a4a,x,0,d/2+0.4,g); B(0.76,0.06,0.4,softMat(FROST.snow),x,0.55,d/2+0.4,g); _crystals(g,x,0.6,d/2+0.4,1.2,11); }
// V110 (LOOK2): ASHFIELD — "what the fire spared, faith keeps". Soot-stained fieldstone below where the old houses stood, and on it
//  a new storey of fresh honey timber and clean plaster; roofs half old and charred, half new red tile; a charred post or two left
//  standing, scaffolding and a ladder where the work goes on, a bucket, green shoots coming up through the ash, and a dove turning
//  on the ridge.
const ASH={ st:[0x5e5854,0x524c48,0x6a6460,0x48423e,0x605a56], soot:0x2a2624, timber:0xa8845a, timberD:0x8a6a44, plaster:0xf2e8d2, newTile:0x9a5a44, oldRoof:0x3a3432, shoot:0x6aa84a };
function _dove(g,x,y,z){ const d=group(x,y,z,g); B(0.03,0.32,0.03,0x2a2a2e,0,-0.32,0,d); const b=Sp(0.08,0xf4f0ea,0,0.04,0,d,8,6); b.scale.set(1.8,0.8,0.8); Sp(0.045,0xf4f0ea,0.13,0.09,0,d,6,5);
  [-1,1].forEach(sd=>{ const w=B(0.18,0.02,0.12,0xf4f0ea,0,0.08,sd*0.09,d); w.rotation.x=sd*0.5; }); Co(0.05,0.1,3,0xf4f0ea,-0.16,0.04,0,d).rotation.z=Math.PI/2; return d; }
function _shoots(g,x,z,k){ for(let i=0;i<5;i++){ const xx=x+(hsh(k,i)-0.5)*0.4, zz=z+(hsh(i,k)-0.5)*0.3, s=Co(0.025,0.14+hsh(i,k+3)*0.12,4,ASH.shoot,xx,0,zz,g); s.rotation.z=(hsh(i,9)-0.5)*0.4; } Sp(0.04,0xf2d24a,x,0.16,z,g,6,4); }
function _scaffold(g,x,z,h,ry){ const s=group(x,0,z,g); if(ry) s.rotation.y=ry; [-0.5,0.5].forEach(a=>[0,0.45].forEach(b2=>Cy(0.03,0.03,h,5,0xb08850,a,0,b2,s))); [0.9,1.8].forEach(y=>{ if(y<h){ B(1.1,0.05,0.5,0xc8a068,0,y,0.22,s); B(1.1,0.03,0.03,0xb08850,0,y+0.4,0.47,s); } }); const xb=B(0.03,1.3,0.03,0xb08850,0,0.3,0.47,s); xb.rotation.z=0.75;
  [-0.18,0.18].forEach(q=>{ const r=Cy(0.02,0.02,h*0.9,4,0x9a7444,-0.75+q,0,0.1,s); r.rotation.z=0.15; }); for(let y=0.25;y<h*0.85;y+=0.25) B(0.4,0.02,0.02,0x9a7444,-0.75+y*0.15*0,y,0.1,s); return s; }
function _ashHouse(b,g,c,low){ const w=b.w-0.4, d=b.h-0.3, H1=1.0, h=low?1.85:2.0, rh=1.2, dx=b._dx||0;
  B(w-0.04,H1,d-0.04,ASH.st[1],0,0,0,g); _stoneFooting(g,w,d,0,0.28);
  const wins=[w/2-0.65,-w/2+0.65].filter(x=>Math.abs(x)>0.55&&Math.abs(x-dx)>0.8);
  _stoneWalls(g,w,d,0.28,H1,[['f',dx,0,1.2,0.5]],ASH.st);
  for(let i=0;i<7;i++){ const sx=(hsh(i,3)-0.5)*w*0.9, sy=0.4+hsh(i,7)*0.5; const sm=Sp(0.22+hsh(i,5)*0.15,ASH.soot,sx,sy,(i%2?1:-1)*(d/2+0.06),g,6,4); sm.scale.set(1.4,1,0.12); sm.material=new THREE.MeshLambertMaterial({color:ASH.soot,transparent:true,opacity:0.55}); }   // soot-stain
  // the new storey: fresh timber and clean plaster
  B(w+0.06,0.12,d+0.06,ASH.timber,0,H1,0,g); B(w-0.02,h-H1-0.12,d-0.02,softMat(ASH.plaster),0,H1+0.12,0,g);
  const bm=(x,y,z,sx,sy,sz,rz)=>{ const m=B(sx,sy,sz,ASH.timber,x,y,z,g); if(rz) m.rotation.z=rz; return m; }, y0=H1+0.12, hh=h-y0;
  for(const sz of [-1,1]){ const z=sz*(d/2+0.03); bm(-w/2+0.08,y0,z,0.14,hh,0.1); bm(w/2-0.08,y0,z,0.14,hh,0.1); bm(0,h-0.12,z,w+0.08,0.14,0.12); [-1,1].forEach(sd=>bm(sd*w*0.32,y0+0.06,z,0.08,hh*0.8,0.08,sd*0.55)); }
  for(const sx of [-1,1]){ const x=sx*(w/2+0.03); B(0.12,hh,0.14,ASH.timber,x,y0,-d/2+0.07,g); B(0.12,hh,0.14,ASH.timber,x,y0,d/2-0.07,g); B(0.14,0.14,d+0.08,ASH.timber,x,h-0.12,0,g); }
  wins.forEach(x=>_win2(g,x,1.1,d/2+0.06,ASH.timberD,0,0x8a6a3a)); _win2(g,0,1.1,-d/2-0.06,ASH.timberD,Math.PI,0x8a6a3a);
  B(0.86,0.1,0.1,ASH.timber,dx,1.2,d/2+0.08,g);
  // the roof: the old charred half and the new half of red tile, a fresh patch on the old
  _gable(g,w,d,h,rh,ASH.plaster,ASH.timber);
  const half=(sd,col)=>{ const t=group(0,0,0,g); _tiles(t,w,d,h,rh,col); t.children.slice().forEach(m=>{ if(Math.sign(m.position.x)!==sd&&Math.abs(m.position.x)>0.05) t.remove(m); }); };
  half(-1,ASH.oldRoof); half(1,ASH.newTile); { const {W2,a}=_roofFrame(w,d,rh,0.4); const pt=B(0.9,0.1,0.8,ASH.newTile,0,0,0,g); pt.position.set(-W2*0.45,h+rh*0.55+0.08,d/5); pt.rotation.z=a; }
  _dove(g,0,h+rh+0.42,d/2-0.25);
  { const cx=-w/4, cz=-d/5; for(let j=0;j<5;j++) B(0.42,0.27,0.42,ASH.st[(j+1)%5],cx,h+0.0+j*0.27-0.3,cz,g); B(0.5,0.07,0.5,ASH.soot,cx,h+1.05,cz,g); _smokeAt(g,cx,h+1.2,cz); }
  // the charred post left standing, the scaffold and ladder, a bucket, shoots
  const sx=(dx>0?-1:1); { const cp=Cy(0.08,0.1,1.6,6,ASH.soot,sx*(w/2+0.55),0,d/2+0.3,g); cp.rotation.z=sx*0.12; Cy(0.07,0.09,0.9,6,ASH.soot,sx*(w/2+0.8),0,d/2-0.4,g).rotation.x=0.2; }
  _scaffold(g,-sx*(w/2+0.42),0,h+0.6,sx>0?Math.PI/2:-Math.PI/2);
  { const bx=dx+sx*0.75, bz=d/2+0.32; Cy(0.11,0.09,0.2,10,0x8a8a92,bx,0,bz,g); Cy(0.1,0.1,0.01,10,0x5a8aaa,bx,0.18,bz,g); }
  _shoots(g,sx*(w/2-0.3),d/2+0.3,(b.x||0)); _shoots(g,-sx*0.3,-d/2-0.3,(b.y||0)); }
// SHADOWMERE — "where faith holds back the dark": dark slate-violet weatherboard on stone, steep pointed roofs, a round window
//  in the gable, grey moss trailing from the eaves, reeds and cattails at the foot, a boardwalk porch on piles — and lamps
//  everywhere, warm at the doors and one tall lamp of clear white light on every house.
const MERE={ board:0x585470, boardD:0x46425c, trim:0xd8d0e8, roof:0x443c50, moss:0x8a9a78, reed:0x6a7a4a, cat:0x5a3a24, pile:0x4a3e34, lamp:0xffe8b0, holy:0xf4f4ff };
function _mereMoss(g,x0,x1,y,z,k){ for(let x=x0;x<x1;x+=0.18){ const ln=0.12+hsh(Math.round(x*20),k)*0.3; const m=Cy(0.02,0.006,ln,4,softMat(MERE.moss),x,y-ln,z,g); } }
function _reeds(g,x,z,k){ for(let i=0;i<7;i++){ const xx=x+(hsh(k,i)-0.5)*0.5, zz=z+(hsh(i,k)-0.5)*0.3, h=0.45+hsh(i,k+1)*0.35, r=Cy(0.012,0.016,h,4,MERE.reed,xx,0,zz,g); r.rotation.z=(hsh(i,4)-0.5)*0.3; if(i%3===0) Cy(0.03,0.03,0.12,6,MERE.cat,xx,h-0.12,zz,g); } }
function _holyLamp(g,x,z,h){ const l=group(x,0,z,g); Cy(0.05,0.07,h,8,0x2a2a32,0,0,0,l); B(0.3,0.04,0.04,0x2a2a32,0.12,h-0.12,0,l); Sp(0.11,glow(MERE.holy),0.24,h-0.32,0,l,10,8); B(0.2,0.04,0.2,0x2a2a32,0.24,h-0.2,0,l);
  [-1,1].forEach(a=>[-1,1].forEach(b2=>B(0.015,0.22,0.015,0x2a2a32,0.24+a*0.09,h-0.44,b2*0.09,l))); B(0.2,0.03,0.2,0x2a2a32,0.24,h-0.46,0,l); B(0.03,0.16,0.02,0xe8c050,0,h,0,l); B(0.1,0.03,0.02,0xe8c050,0,h+0.1,0,l); return l; }
function _mereHouse(b,g,c,low){ const w=b.w-0.4, d=b.h-0.3, h=low?1.7:1.85, rh=Math.min(2.0,w*0.62), dx=b._dx||0;
  B(w-0.02,h,d-0.02,MERE.boardD,0,0,0,g); _stoneFooting(g,w,d,0,0.3);
  for(let y=0.32;y<h-0.05;y+=0.16) [[w,0,d/2,0],[w,0,-d/2,0],[d,w/2,0,1],[d,-w/2,0,1]].forEach(([L,x,z,ry],i)=>{ const bd=B(ry?0.04:L+0.04,0.15,ry?L+0.04:0.04,(Math.round(y*10)+i)%3?MERE.board:MERE.boardD,x+(ry?Math.sign(x)*0.02:0),y,z+(ry?0:Math.sign(z)*0.02),g); bd.rotation[ry?'z':'x']=(ry?-Math.sign(x):Math.sign(z))*0.06; });
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>B(0.1,h,0.1,MERE.trim,sx*(w/2+0.02),0,sz*(d/2+0.02),g));
  const wins=[w/2-0.62,-w/2+0.62].filter(x=>Math.abs(x)>0.55&&Math.abs(x-dx)>0.8); wins.forEach(x=>_win2(g,x,0.75,d/2+0.08,MERE.trim,0,0x3a3450)); if(d>2.2) [-1,1].forEach(sx=>_win2(g,sx*(w/2+0.08),0.75,0,MERE.trim,sx*Math.PI/2,0x3a3450)); _win2(g,0,0.75,-d/2-0.08,MERE.trim,Math.PI,0x3a3450);
  B(0.86,0.1,0.08,MERE.trim,dx,1.12,d/2+0.06,g); [-0.4,0.4].forEach(q=>B(0.07,1.12,0.07,MERE.trim,dx+q,0,d/2+0.06,g));
  _gable(g,w,d,h,rh,MERE.board,null); _tiles(g,w,d,h,rh,MERE.roof);
  { const rw=new THREE.Mesh(new THREE.CircleGeometry(0.2,16),glow(0xf2d27a)); rw.position.set(0,h+rh*0.42,d/2+0.02); g.add(rw); const rr=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.04,6,16),softMat(MERE.trim)); rr.position.set(0,h+rh*0.42,d/2+0.04); g.add(rr); B(0.4,0.03,0.03,MERE.trim,0,h+rh*0.42,d/2+0.05,g); B(0.03,0.4,0.03,MERE.trim,0,h+rh*0.42-0.2,d/2+0.05,g); }
  [-1,1].forEach(sz=>{ B(0.05,0.55,0.05,0x2a2a32,0,h+rh,sz*(d/2+0.25),g); Co(0.06,0.18,4,0x2a2a32,0,h+rh+0.55,sz*(d/2+0.25),g); });   // iron finials
  { const {W2}=_roofFrame(w,d,rh,0.4); [-1,1].forEach(sd=>{ for(let z=-d/2-0.2;z<d/2+0.2;z+=0.2){ const ln=0.15+hsh(Math.round(z*20),sd>0?2:5)*0.3; Cy(0.022,0.006,ln,4,softMat(MERE.moss),sd*(W2-0.05),h-ln-0.02,z,g); } }); }
  // the boardwalk porch on its piles, warm lamps at the door, the tall lamp of white light, reeds
  { const pz=d/2+0.45; B(Math.min(w,2.4),0.06,0.8,0x6a5a48,dx,0.04,pz-0.05,g); for(let x=-Math.min(w,2.4)/2+0.12;x<Math.min(w,2.4)/2;x+=0.14) B(0.12,0.012,0.78,0x5a4a3a,dx+x,0.1,pz-0.05,g);
    [-1,1].forEach(sd=>[pz-0.4,pz+0.32].forEach(zz=>Cy(0.05,0.06,0.16,6,MERE.pile,dx+sd*(Math.min(w,2.4)/2-0.08),0,zz,g))); }
  [-0.55,0.55].forEach(q=>{ Sp(0.06,glow(MERE.lamp),dx+q,1.0,d/2+0.18,g,8,6); B(0.11,0.03,0.11,0x2a2a32,dx+q,1.08,d/2+0.18,g); B(0.03,0.03,0.14,0x2a2a32,dx+q,1.08,d/2+0.1,g); });
  _holyLamp(g,(dx>0?-1:1)*(w/2+0.45),d/2+0.5,2.3);
  _reeds(g,(dx>0?1:-1)*(w/2+0.2),d/2+0.15,(b.x||0)); _reeds(g,-w/2-0.2,-d/2,(b.y||0)+3); _reeds(g,w/2+0.2,-d/3,(b.x||0)+7); }
function _ashStall(b,g){ const w=b.w-0.4, d=b.h-0.3, dx=b._dx||0, x=dx>0?-w/2+0.7:w/2-0.7; if(Math.abs(x-dx)<0.85) return;   // Emberforge: a brazier of embers, new tools on a board, crates
  Cy(0.22,0.14,0.42,8,0x3a3a40,x,0,d/2+0.5,g); Cy(0.2,0.2,0.04,8,glow(0xff7a2a),x,0.42,d/2+0.5,g); for(let i=0;i<4;i++) Sp(0.05,glow(i%2?0xffb03a:0xff5a1a),x-0.1+i*0.07,0.48,d/2+0.5+(i%2?0.05:-0.05),g,5,4);
  B(0.8,0.6,0.05,ASH.timber,x+(x>0?-0.1:0.1),0.5,d/2+0.08,g); [[-0.25,0.9],[0,0.85],[0.25,0.95]].forEach(([q,y])=>{ B(0.03,0.36,0.03,0x8a6a40,x+q,y-0.2,d/2+0.12,g); B(0.1,0.06,0.04,0x6a6a72,x+q,y+0.12,d/2+0.12,g); });
  B(0.36,0.3,0.3,0xa8783a,x+(x>0?0.45:-0.45),0,d/2+0.35,g); B(0.3,0.26,0.26,0xb88848,x+(x>0?0.45:-0.45),0.3,d/2+0.35,g); }
function _mereStall(b,g){ const w=b.w-0.4, d=b.h-0.3, dx=b._dx||0, x=dx>0?-w/2+0.7:w/2-0.7; if(Math.abs(x-dx)<0.85) return;   // the Mistmarket: a stall under a dark awning hung with little lamps
  B(1.0,0.55,0.4,0x4a3e34,x,0,d/2+0.55,g); B(1.06,0.04,0.44,0x5a4a3a,x,0.55,d/2+0.55,g); [0x8a6ab0,0x5aa0a0,0xd8d0e8].forEach((col,i)=>Cy(0.06,0.06,0.18,8,col,x-0.3+i*0.3,0.59,d/2+0.55,g));
  [-0.5,0.5].forEach(q=>Cy(0.035,0.04,1.45,6,0x2a2a32,x+q,0,d/2+0.85,g)); const a=B(1.2,0.04,0.8,MERE.roof,x,1.45,d/2+0.5,g); a.rotation.x=0.25; for(let i=0;i<4;i++) Sp(0.045,glow(MERE.lamp),x-0.42+i*0.28,1.28,d/2+0.88,g,6,5); }
// V111: a washing line — a pole, a sagging line, the week's wash pegged out on it
function _laundry(g,x0,z0,x1,z1,h,k){ const L=Math.hypot(x1-x0,z1-z0), ry=Math.atan2(-(z1-z0),x1-x0), w=group(x0,0,z0,g); w.rotation.y=ry;
  Cy(0.04,0.05,h+0.1,6,0x7a5a3a,L,0,0,w); B(0.2,0.04,0.04,0x7a5a3a,L,h,0,w); const n=Math.max(3,Math.round(L/0.32)), sag=x=>-Math.sin(x/L*Math.PI)*0.16;
  for(let i=0;i<n;i++){ const xa=i*L/n, xb=(i+1)*L/n, sg=B(L/n+0.01,0.012,0.012,0xe8e0d0,(xa+xb)/2,h+(sag(xa)+sag(xb))/2,0,w); sg.rotation.z=(sag(xb)-sag(xa))/(L/n); }
  const C=[0xf4f0ea,0x6a8ac8,0xd8604a,0xf2c14e,0x7ab074,0xe8a0b8,0xb8c4d0]; let x=0.25;
  while(x<L-0.25){ const kind=Math.floor(hsh(k,Math.round(x*10))*3), col=C[(k+Math.round(x*7))%C.length], y=h+sag(x)-0.02;
    if(kind===0){ B(0.36,0.42,0.02,col,x+0.18,y-0.42,0,w); x+=0.46; }                                        // a sheet
    else if(kind===1){ B(0.24,0.26,0.02,col,x+0.12,y-0.28,0,w); B(0.36,0.08,0.02,col,x+0.12,y-0.1,0,w); x+=0.42; }   // a shirt
    else { [-0.05,0.05].forEach(q=>B(0.08,0.3,0.02,col,x+0.1+q,y-0.32,0,w)); B(0.2,0.08,0.02,col,x+0.1,y-0.08,0,w); x+=0.34; }   // breeches
    B(0.02,0.05,0.03,0x8a6a40,x-0.06,y-0.02,0,w); } return w; }
function _smokeAt(g,x,y,z,dark){ const o=new THREE.Object3D(); o.position.set(x,y,z); o.userData.smoke=dark?2:1; g.add(o); return o; }
// V105 (LOOK2): the chapel in the characters' manner — dressed stone in courses with big corner quoins, a stone plinth, stepped
//  buttresses, a tiled roof over stone gables, pointed lancets of real stained glass in moulded surrounds, a rose window in
//  coloured glass, a deep west portal of nested arches, a tower with a pointed belfry, a tiled broach spire, a gilt cross.
//  Dark (bound) and bright (cleansed) as before, footprint unchanged.
function _ptArch(wd,ht,th,dp,col){ const s=new THREE.Shape(), r=wd/2; s.moveTo(-r,0); s.lineTo(-r,ht-r*1.1); s.quadraticCurveTo(-r,ht-r*0.15,0,ht); s.quadraticCurveTo(r,ht-r*0.15,r,ht-r*1.1); s.lineTo(r,0); s.lineTo(r-th,0); s.lineTo(r-th,ht-r*1.1); s.quadraticCurveTo(r-th,ht-r*0.25-th,0,ht-th*1.2); s.quadraticCurveTo(-r+th,ht-r*0.25-th,-r+th,ht-r*1.1); s.lineTo(-r+th,0); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:dp,bevelEnabled:false}); g.translate(0,0,-dp/2); return new THREE.Mesh(g,typeof col==='number'?softMat(col):col); }
function _chapel2(b,g,c){ const w=b.w-0.6, d=b.h-0.3, dark=c.dark, wall=dark?0x4e4860:c.iron?0x8e9098:c.salt?0xf4f0e6:c.wood?0xa8a28e:c.sand?0xe0c49a:c.frost?0xb8b4c8:c.ash?0x8a847e:c.mere?0x7a7690:0xe2dccb, wd=new THREE.Color(wall).multiplyScalar(0.84).getHex(), qn=new THREE.Color(wall).multiplyScalar(0.93).getHex(),
    roof=dark?0x2e2638:c.iron?IRON.slate:c.salt?SALT.roof:c.wood?TWOOD.roof:c.sand?0xb56a3f:c.frost?FROST.slate:c.ash?ASH.newTile:c.mere?MERE.roof:c.roof, tz=d/2-0.6, H=2.7, glassCols=dark?['#3a1a5a','#5a2a7a','#2a1440','#4a2a6a']:['#2f5fb8','#c8402e','#f2c14e','#3a8a5a','#7a4ab0','#5aa0d8'];
  const ST=(sx,sy,sz,col,x,y,z)=>B(sx,sy,sz,col,x,y,z,g);
  // the nave: a plinth of big stones, coursed walls, quoins, a cornice
  _stoneFooting(g,w,d,0,0.42); ST(w-0.02,H-0.4,d-0.02,wall,0,0.4,0);
  for(let y=0.75;y<H-0.1;y+=0.36) [-1,1].forEach(sd=>{ ST(w+0.02,0.025,0.02,wd,0,y,sd*(d/2+0.005)); ST(0.02,0.025,d+0.02,wd,sd*(w/2+0.005),y,0); });   // the courses
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let i=0;i<6;i++){ const big=i%2===0; ST(big?0.42:0.26,0.36,big?0.26:0.42,qn,sx*(w/2-(big?0.17:0.09)),0.42+i*0.38,sz*(d/2-(big?0.09:0.17))); } });
  ST(w+0.2,0.16,d+0.2,wd,0,H-0.06,0);
  _gable(g,w,d,H+0.1,2.0,wall,null); _tiles(g,w,d,H+0.1,2.0,roof);
  // the apse, round behind the altar, with a tiled cone
  Cy(0.92,0.98,H-0.2,16,softMat(wall),0,0.2,-d/2+0.72,g); Cy(1.0,1.0,0.14,16,softMat(wd),0,H-0.04,-d/2+0.72,g); const ac=Co(1.08,1.15,16,softMat(roof),0,H+0.1,-d/2+0.72,g);
  for(let i=1;i<4;i++) Cy(1.08-i*0.27,1.08-i*0.27+0.02,0.04,16,softMat(new THREE.Color(roof).multiplyScalar(0.8).getHex()),0,H+0.1+i*0.28,-d/2+0.72,g);
  // stepped buttresses
  for(let z=-d/2+0.5;z<tz-0.7;z+=1.2) [-1,1].forEach(sd=>{ ST(0.32,1.4,0.36,wd,sd*(w/2+0.14),0,z); ST(0.24,1.0,0.3,wd,sd*(w/2+0.1),1.4,z); const cp=ST(0.26,0.12,0.32,qn,sd*(w/2+0.1),2.4,z); cp.rotation.z=-sd*0.5; });
  // pointed lancets of stained glass, in moulded surrounds
  let k=0; for(let z=-d/2+1.1;z<tz-1.0;z+=1.2){ [-1,1].forEach(sd=>{ const lw=0.38, lh=1.45, x=sd*(w/2+0.02), ry=sd*Math.PI/2;
      const tex=glassTex(glassCols,k++,'lancet'), pn=pane(tex,lw,lh,x,0.85+lh/2,z,ry,g); pn.userData.keep=true; if(dark) pn.material.color.setHex(0x9a7aba);
      const fr=_ptArch(lw+0.16,lh+0.1,0.09,0.12,qn); fr.position.set(x+sd*0.03,0.83,z); fr.rotation.y=ry; g.add(fr); ST(0.18,0.06,lw+0.22,wd,x+sd*0.06,0.78,z); }); }
  // the tower over the west door
  const TW=1.8, TD=1.7; ST(TW,5.0,TD,wall,0,0,tz); for(let y=0.7;y<4.9;y+=0.36) [-1,1].forEach(sd=>{ ST(TW+0.02,0.025,0.02,wd,0,y,tz+sd*(TD/2+0.005)); ST(0.02,0.025,TD+0.02,wd,sd*(TW/2+0.005),y,tz); });
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ for(let i=0;i<12;i++){ const big=i%2===0; ST(big?0.36:0.22,0.36,big?0.22:0.36,qn,sx*(TW/2-(big?0.14:0.07)),0.1+i*0.4,tz+sz*(TD/2-(big?0.07:0.14))); } });
  ST(TW+0.16,0.16,TD+0.16,wd,0,2.7,tz); ST(TW+0.2,0.18,TD+0.2,wd,0,4.95,tz);
  [-1,1].forEach(sd=>{ [[0,TD/2+0.01,0],[TW/2+0.01,0,Math.PI/2]].forEach(([ox,oz,ry])=>{ const x=ry?sd*ox:0, z=tz+(ry?0:sd*oz); const bel=_ptArch(0.62,1.15,0.1,0.14,qn); bel.position.set(x,3.45,z); bel.rotation.y=ry; g.add(bel);
      const lv=B(ry?0.06:0.42,0.9,ry?0.42:0.06,dark?glow(0x5a2a7a):0x2a2630,x,3.5,z,g); }); });
  // a tiled broach spire, pinnacles, the gilt cross
  for(const [a,b2] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ ST(0.26,0.5,0.26,qn,a*0.8,5.13,tz+b2*0.75); Co(0.16,0.42,4,softMat(roof),a*0.8,5.63,tz+b2*0.75,g).rotation.y=Math.PI/4; }
  const sp=Co(1.05,3.4,8,softMat(roof),0,5.13,tz,g); for(let i=1;i<9;i++){ const rr=1.05*(1-i/9.5); Cy(rr,rr+0.03,0.05,8,softMat(new THREE.Color(roof).multiplyScalar(0.78).getHex()),0,5.13+i*0.37,tz,g); }
  if(!dark){ ST(0.1,0.85,0.1,0xe8c050,0,8.5,tz); ST(0.5,0.1,0.1,0xe8c050,0,8.95,tz); Sp(0.07,0xe8c050,0,9.38,tz,g,8,6); }
  // the rose window, and the deep west portal of nested pointed arches
  const rose=pane(glassTex(glassCols,3,'rose'),0.9,0.9,0,3.0,tz+TD/2+0.02,0,g); rose.userData.keep=true; if(dark) rose.material.color.setHex(0x9a7aba);
  const rr=new THREE.Mesh(new THREE.TorusGeometry(0.48,0.08,8,24),softMat(qn)); rr.position.set(0,3.0,tz+TD/2+0.04); g.add(rr);
  for(let i=0;i<3;i++){ const ar=_ptArch(1.3-i*0.14,2.0-i*0.08,0.09,0.16,i%2?qn:wd); ar.position.set(0,0.02,tz+TD/2+0.12-i*0.07); g.add(ar); }
  ST(1.5,0.14,0.5,wd,0,0,tz+TD/2+0.3); }
function _cottageTrim(g,w,d,h,fr,dx){ [w/2-0.65,-w/2+0.65].forEach(x=>{ if(Math.abs(x)<=0.7) return; B(0.62,0.14,0.18,0x6a4428,x,0.55,d/2+0.12,g);
    for(let i=0;i<5;i++) Sp(0.055,[0xe85a6a,0xffe060,0xf4f0ea,0xb08ae8][(i+Math.round(x*3))%4],x-0.24+i*0.12,0.72,d/2+0.13,g,6,4); });
  // V123: the hood over the door is a little gabled roof on two brackets, over the door wherever it stands (dx) — it
  //  read as a table across the doorway when it was a flat board
  dx=dx||0; const hd=prism(1.05,0.34,0.52,0x8a6a48); hd.position.set(dx,1.12,d/2+0.2); g.add(hd); B(1.08,0.05,0.54,0x5a3a22,dx,1.1,d/2+0.2,g);
  [-0.44,0.44].forEach(x=>{ const br=B(0.05,0.3,0.05,fr,dx+x,0.84,d/2+0.12,g); br.rotation.x=-0.6; }); }
// V123 (LOOK2): the Homestead's barn as a barn — red board-and-batten walls on a stone footing, a tall gabled roof of grey
//  shingle with a hay hoist and loft door in the gable, white trim, and big double doors where you go in (dx)
function _barn2(b,g,c){ const w=b.w-0.4, d=b.h-0.3, h=2.0, rh=1.5, dx=b._dx||0, red=bmat(0x9a3a2a,'plank'), white=0xf0ece0;
  _stoneFooting(g,w,d,0,0.28); B(w-0.04,h-0.25,d-0.04,red,0,0.25,0,g);
  for(let x=-w/2+0.2;x<w/2-0.1;x+=0.36) for(const sz of [-1,1]) B(0.05,h-0.3,0.04,0x7a2a1e,x,0.28,sz*(d/2+0.01),g);   // the battens
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c2])=>B(0.12,h-0.25,0.12,white,a*(w/2-0.03),0.25,c2*(d/2-0.03),g)); B(w+0.06,0.1,d+0.06,white,0,h-0.05,0,g);
  _gable(g,w,d,h,rh,0x9a3a2a,white); const roof=prism(w+0.5,rh+0.12,d+0.4,bmat(0x6a6a70,'roof')); roof.position.y=h; g.add(roof);
  // the double doors: two white-framed leaves with the X brace, standing open a little
  const fz=d/2+0.03; B(1.5,1.45,0.06,0x2a1a12,dx,0.28,fz,g); [-1,1].forEach(sd=>{ const lf=group(dx+sd*0.74,0.28,fz+0.02,g); lf.rotation.y=sd*0.35;
    B(0.7,1.4,0.06,red,-sd*0.36,0,0,lf); B(0.7,0.08,0.07,white,-sd*0.36,0,0.01,lf); B(0.7,0.08,0.07,white,-sd*0.36,1.32,0.01,lf); B(0.08,1.4,0.07,white,-sd*0.04,0,0.01,lf); B(0.08,1.4,0.07,white,-sd*0.68,0,0.01,lf);
    const x1=B(0.07,1.5,0.07,white,-sd*0.36,0.0,0.02,lf); x1.position.y=0.66; x1.rotation.z=sd*0.48; });
  B(1.6,0.12,0.1,white,dx,1.73,fz+0.02,g);
  // the loft door and the hay hoist in the gable
  B(0.6,0.6,0.06,0x2a1a12,0,h+0.25,fz+0.01,g); B(0.66,0.06,0.07,white,0,h+0.55,fz+0.02,g); const beam=B(0.1,0.1,0.7,0x5a3a22,0,h+0.95,fz+0.3,g); Cy(0.01,0.01,0.6,4,0x8a7a5a,0,h+0.35,fz+0.6,g);
  for(let i=0;i<3;i++) B(0.42,0.26,0.3,0xd8c070,(i-1)*0.45,h+0.08,fz-0.25,g); }   // hay bales up in the loft
const WSTYLE={
  house(b,g,c,low){ if(c.iron){ _ironHouse(b,g,c,low); return; } if(c.salt){ _saltHouse(b,g,c,low); return; } if(c.wood){ _logHouse(b,g,c,low); return; } if(c.sand){ _adobe(b,g,c,low); return; } if(c.frost){ _frostHouse(b,g,c,low); return; } if(c.grand){ _grand(b,g,c,'house'); return; } if(c.ash){ _ashHouse(b,g,c,low); return; } if(c.mere){ _mereHouse(b,g,c,low); return; } if(c.thatch&&b.id==='home_house'){ _farmhouse2(b,g,c); return; } if(b.id==='home_barn'&&typeof LOOK2!=='undefined'&&LOOK2){ _barn2(b,g,c); return; } if(c.thatch){ _cottage2(b,g,c,low); return; } const w=b.w-0.4, d=b.h-0.3, h=low?1.4:1.7, wl=bmat(c.wall,'plaster'), fr=c.beam||c.wallD;
    B(w,h,d,wl,0,0,0,g); B(w+0.08,0.24,d+0.08,bmat(c.wallD,'brick'),0,0,0,g);                                                // walls on a stone footing
    if(c.timber){ [-w/2+0.07,w/2-0.07].forEach(x=>B(0.12,h,0.06,c.beam,x,0,d/2+0.02,g)); B(w,0.1,0.06,c.beam,0,h*0.55,d/2+0.02,g); B(w,0.1,0.06,c.beam,0,h-0.08,d/2+0.02,g);
      [-1,1].forEach(sd=>{ const br=B(0.08,h*0.62,0.05,c.beam,sd*w*0.3,h*0.5-0.05,d/2+0.03,g); br.rotation.z=sd*0.55; }); }                      // cross-bracing
    else [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>B(0.1,h,0.1,c.wallD,sx*(w/2-0.03),0,sz*(d/2-0.03),g));                        // quoins at the corners
    if(c.thatch){ _thatch(g,w,d,h,low?1.35:1.2); _cottageTrim(g,w,d,h,fr,b._dx); }
    else if(typeof LOOK2!=='undefined'&&LOOK2&&!c.snow){ _gable(g,w,d,h,low?1.4:1.2,c.wall,null); _tiles(g,w,d,h,low?1.4:1.2,c.roof); }
    else { const r=prism(w+0.45,low?1.4:1.2,d+0.35,bmat(c.roof,'roof')); r.position.y=h; g.add(r); B(0.12,0.1,d+0.42,new THREE.Color(c.roof).multiplyScalar(0.7).getHex(),0,h+(low?1.36:1.16),0,g);   // the roof and its ridge
    B(w+0.5,0.06,0.08,fr,0,h-0.02,d/2+0.2,g); B(w+0.5,0.06,0.08,fr,0,h-0.02,-d/2-0.2,g); }                                                       // eaves
    if(c.snow) B(0.25,0.14,d+0.4,0xf4f8fc,0,h+(low?1.32:1.12),0,g);
    B(0.34,0.8,0.34,bmat(c.wallD,'brick'),-w/4,h+0.4,-d/5,g); B(0.42,0.08,0.42,0x5a5048,-w/4,h+1.2,-d/5,g);                               // chimney and its cap
    [[w/2-0.65,0.75],[-w/2+0.65,0.75]].forEach(([x,y])=>{ if(Math.abs(x)>0.7) _win(g,x,y,d/2+0.02,fr); }); if(w>2.4) _win(g,w/2+0.02,0.75,0,fr,Math.PI/2); },
  cottage(b,g,c){ WSTYLE.house(b,g,c,true); },
  shop(b,g,c){ if(c.iron&&b.id==='ih_forge'){ _forge2(b,g,c); return; } if(c.salt&&b.id==='sm_market'){ _fishMarket2(b,g,c); return; } if(c.salt){ _saltHouse(b,g,c); return; } if(c.sand){ _bazaar2(b,g,c); return; } if(c.grand){ _grand(b,g,c,'shop'); return; } if(c.wood){ _logHouse(b,g,c); _woodStall(b,g); return; } if(c.frost){ _frostHouse(b,g,c); _frostStall(b,g); return; } if(c.ash){ _ashHouse(b,g,c); _ashStall(b,g); return; } if(c.mere){ _mereHouse(b,g,c); _mereStall(b,g); return; } if(c.iron){ _ironHouse(b,g,c); return; } WSTYLE.house(b,g,c); const w=b.w-0.4, d=b.h-0.3; for(let i=0;i<7;i++){ const s=B(w/7,0.07,0.9,i%2?0xf3ead6:c.awn,-w/2+w/7*(i+0.5),1.38,d/2+0.42,g); s.rotation.x=0.35; }
    [-w/2+0.05,w/2-0.05].forEach(x=>Cy(0.03,0.03,1.3,6,0x6b4a2e,x,0,d/2+0.8,g));                                                                // awning poles
    B(1.2,0.5,0.4,bmat(0x9a6b3f,'plank'),-w/2+0.9,0,d/2+0.5,g); [[0,0xd84a3a],[0.3,0xf2c14e],[-0.3,0x6cb065]].forEach(([x,col])=>B(0.2,0.16,0.2,col,-w/2+0.9+x,0.5,d/2+0.5,g)); },
  inn(b,g,c){ if(typeof LOOK2!=='undefined'&&LOOK2){ if(c.sand){ _adobeInn(b,g,c); return; } if(c.grand){ _grand(b,g,c,'inn'); return; } _inn2(b,g,c); return; } const w=b.w-0.3, d=b.h-0.3, fr=c.beam||c.wallD; B(w,1.15,d,bmat(c.wallD,'brick'),0,0,0,g); B(w+0.15,1.15,d+0.15,bmat(c.wall,'plaster'),0,1.15,0,g); B(w+0.25,0.08,d+0.25,fr,0,1.13,0,g);   // stone below, a jettied upper storey
    if(c.timber) [-w/2+0.1,0,w/2-0.1].forEach(x=>B(0.14,1.15,0.06,c.beam,x,1.15,d/2+0.09,g)); if(typeof LOOK2!=='undefined'&&LOOK2&&!c.snow){ _gable(g,w+0.15,d+0.15,2.3,1.5,c.wall,c.timber?c.beam:null); _tiles(g,w+0.15,d+0.15,2.3,1.5,c.roof); } else { const r=prism(w+0.6,1.5,d+0.5,bmat(c.roof,'roof')); r.position.y=2.3; g.add(r); B(0.14,0.12,d+0.56,new THREE.Color(c.roof).multiplyScalar(0.7).getHex(),0,3.76,0,g); }
    if(c.snow) B(0.25,0.14,d+0.55,0xf4f8fc,0,3.72,0,g);
    [-w/3,w/3].forEach(x=>{ B(0.36,0.9,0.36,bmat(c.wallD,'brick'),x,3.0,-d/4,g); B(0.44,0.08,0.44,0x5a5048,x,3.9,-d/4,g); });
    B(0.55,0.42,0.06,c.sign,w/2-0.8,1.35,d/2+0.5,g); B(0.06,0.06,0.5,0x5a3c20,w/2-0.8,1.8,d/2+0.3,g);
    for(const x of [-w/2+0.9,w/2-1.6]) _win(g,x,1.5,d/2+0.1,fr); for(const x of [-w/2+0.9,w/2-0.9]) _win(g,x,0.45,d/2+0.02,fr); },
  chapel(b,g,c){ if(typeof LOOK2!=='undefined'&&LOOK2){ _chapel2(b,g,c); return; } const w=b.w-0.6, d=b.h-0.3, wall=c.dark?0x4a4458:0xe8e2d4, roof=c.dark?0x2e2638:c.roof, st=bmat(wall,'brick'), sd2=bmat(new THREE.Color(wall).multiplyScalar(0.8).getHex(),'brick'), rf=bmat(roof,'roof'), tz=d/2-0.6, gl=c.dark?glow(0x5a2a7a):0x5f7ab8;
    B(w,2.7,d,st,0,0,0,g); B(w+0.14,0.3,d+0.14,sd2,0,0,0,g); B(w+0.08,0.12,d+0.08,sd2,0,2.6,0,g); const r=prism(w+0.4,2.1,d+0.2,rf); r.position.y=2.7; g.add(r);   // a high nave on a plinth, a cornice under the roof
    Cy(0.9,0.9,2.3,10,st,0,0,-d/2+0.75,g); Co(1.0,1.2,10,rf,0,2.3,-d/2+0.75,g);                                                     // the apse behind the altar
    for(let z=-d/2+0.5;z<tz-0.7;z+=1.2) [-1,1].forEach(sd=>{ B(0.24,2.2,0.32,st,sd*(w/2+0.09),0,z,g); Co(0.16,0.5,4,rf,sd*(w/2+0.09),2.2,z,g).rotation.y=Math.PI/4; });   // buttresses with pinnacles
    B(1.8,4.8,1.7,st,0,0,tz,g); B(1.94,0.14,1.84,sd2,0,2.7,tz,g); B(1.94,0.16,1.84,sd2,0,4.7,tz,g);
    for(const [a,b2] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(0.3,0.42,0.3,st,a*0.78,4.86,tz+b2*0.72,g);                                 // the tower's corner pinnacles
    Co(1.0,3.2,4,rf,0,4.86,tz,g).rotation.y=Math.PI/4;                                                                              // and its spire
    [-1,1].forEach(sd=>{ B(0.04,0.9,0.3,c.dark?glow(0x5a2a7a):0x3a3a44,sd*0.91,3.4,tz,g); B(0.3,0.9,0.04,c.dark?glow(0x5a2a7a):0x3a3a44,0,3.4,tz+sd*0.86,g); });   // belfry louvres, all four sides
    if(!c.dark){ B(0.1,0.8,0.1,0xf2c14e,0,8.0,tz,g); B(0.45,0.1,0.1,0xf2c14e,0,8.45,tz,g); }
    const rose=new THREE.Mesh(new THREE.CircleGeometry(0.42,14),glow(c.dark?0x7a3aa8:0xf2c14e)); rose.position.set(0,2.95,tz+0.87); g.add(rose);
    const rr=new THREE.Mesh(new THREE.TorusGeometry(0.45,0.06,5,16),flat(new THREE.Color(wall).multiplyScalar(0.75).getHex())); rr.position.set(0,2.95,tz+0.88); g.add(rr);
    B(1.1,0.1,0.2,sd2,0,1.62,tz+0.95,g);                                                                                              // a hood over the door
    for(let z=-d/2+1.1;z<tz-1.0;z+=1.2){ [-1,1].forEach(sd=>{ B(0.05,1.2,0.36,gl,sd*(w/2+0.01),0.8,z,g); Co(0.2,0.26,4,gl,sd*(w/2+0.01),2.0,z,g).rotation.y=Math.PI/4; }); } },   // tall pointed lancets
  keep(b,g,c){ if(typeof LOOK2!=='undefined'&&LOOK2){ _keep2(b,g,c); return; } const w=b.w-0.2, d=b.h-0.2, st=bmat(c.stone,'brick'); B(w,3.2,d,st,0,0,0,g); B(w+0.14,0.36,d+0.14,bmat(c.wallD,'brick'),0,0,0,g); B(w+0.1,0.12,d+0.1,bmat(c.wallD,'brick'),0,3.1,0,g); crenel(g,w,d,3.22,st);
    if(b.w>=5&&b.h>=4){ const dw=w*0.46, dd=d*0.46; B(dw,2.0,dd,st,0,3.2,-0.25,g); crenel(g,dw,dd,5.2,st); B(0.05,1.0,0.05,0x3a2a1a,0,5.5,-0.25,g); B(0.5,0.32,0.03,c.roof,0.27,6.1,-0.25,g);   // a donjon rising out of the hall, the town's banner atop
      for(const x of [-dw/4,dw/4]) B(0.1,0.5,0.06,0x1a1820,x,4.0,-0.25+dd/2+0.01,g); }
    for(const x of [-w/4,w/4]) B(0.1,0.55,0.06,0x1a1820,x,1.9,d/2+0.01,g);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{ Cy(0.64,0.74,4.4,12,bmat(c.wallD,'brick'),sx*(w/2-0.3),0,sz*(d/2-0.3),g); Cy(0.74,0.66,0.16,12,bmat(c.wallD,'brick'),sx*(w/2-0.3),4.3,sz*(d/2-0.3),g); Co(0.84,1.7,12,bmat(c.roof,'roof'),sx*(w/2-0.3),4.42,sz*(d/2-0.3),g);
      B(0.05,0.3,0.12,0x1a1820,sx*(w/2-0.3),3.2,sz*(d/2-0.3)+sz*0.68,g);
      B(0.05,0.3,0.12,0x1a1820,sx*(w/2-0.3),2.2,sz*(d/2-0.3)+sz*0.66,g); });                                                                    // arrow slits
    B(0.8,1.25,0.08,0x2a2420,0,0,d/2+0.01,g); const ar=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.08,12,1,false,0,Math.PI),flat(0x2a2420)); ar.rotation.set(Math.PI/2,0,Math.PI/2); ar.position.set(0,1.25,d/2+0.01); g.add(ar);   // an arched gate
    for(let i=0;i<5;i++) B(0.035,1.25,0.05,0x6a6a72,-0.3+i*0.15,0,d/2+0.06,g); B(0.8,0.05,0.05,0x6a6a72,0,0.9,d/2+0.06,g);                     // the portcullis
    [[-w/4],[w/4]].forEach(([x])=>B(0.36,0.6,0.04,c.roof,x,1.6,d/2+0.02,g)); }               // banners
};

function buildWorld(WD,opt){
  const W=WD.W, H=WD.H, bin=atob(WD.raw), N=W*H, A=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) A[i]=bin.charCodeAt(i);
  const inB=(x,y)=>x>=0&&y>=0&&x<W&&y<H, T=(x,y)=>inB(x,y)?A[y*W+x]:3, E=(x,y)=>inB(x,y)?A[N+y*W+x]&15:0, WK=(x,y)=>inB(x,y)&&((A[N+y*W+x]>>4)===1||A[y*W+x]===40);
  // the capital stands taller than any town: Stormgate's terraces rise 2.2× as high (its keep and cathedral on a high
  // acropolis over the lower town and the harbour), and its walls are a fortress's
  const CPL=typeof LOOK2!=="undefined"&&LOOK2?3.4:2.6;   // V113: Crystalpeak stands taller still in the new look: the town up on a high mountain
  const SGB=opt.land?null:[SX(138),SY(186)-10,SX(198),SY(241)], CPB=opt.land?null:(WD.cpBox||[SX(118),SY(40),SX(190),SY(98)]), inCP=(x,y)=>!!CPB&&x>=CPB[0]&&x<CPB[2]&&y>=CPB[1]&&y<CPB[3],   // Crystalpeak climbs 2.6 times as steep: a real mountain
    LIFT=(x,y)=>SGB&&x>=SGB[0]&&x<SGB[2]&&y>=SGB[1]&&y<SGB[3]?1.8:inCP(x,y)?CPL:1, EH=(x,y)=>E(x,y)*TIER*LIFT(x,y);
  const scene=new THREE.Scene(), sky=0x9cc4e4; scene.background=new THREE.Color(sky); scene.fog=new THREE.Fog(sky,26,58);
  const lv={id:opt.id,name:opt.name,scene,folk:[],spots:[],anim:[],cam:{pitch:0.62,dist:10,min:5,max:19},T,E,WK,W,H};
  const hemi=new THREE.HemisphereLight(0xd8e8ff,0x4a5a3a,0.55); scene.add(hemi);   // a little less fill and a little more sun: the shapes model instead of flattening
  const sun=new THREE.DirectionalLight(0xfff0d8,0.95); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80}); sun.shadow.bias=-0.0006; scene.add(sun,sun.target);
  const daySky=new THREE.Color(sky), nightSky=new THREE.Color(0x1a2440), duskSky=new THREE.Color(0xe8a070), cS=new THREE.Color();
  const ground0=hemi.groundColor.clone();
  lv.anim.push(()=>{ if(opt.sky&&opt.sky(lv)!==false) return; if(typeof DAYNIGHT!=='undefined'){ DAYNIGHT.drive(lv,{sun,hemi,ground:ground0}); return; }   // day and night (daynight.js)
    const f=GAME.S.dayFrac, e=Math.sin((f-0.25)*Math.PI*2), d=Math.max(0.12,Math.min(1,e*2.2+0.35)), dusk=Math.max(0,1-Math.abs(e)*5)*(e>-0.2?1:0);
    cS.copy(nightSky).lerp(daySky,d).lerp(duskSky,dusk*0.35); scene.background.copy(cS); scene.fog.color.copy(cS); sun.intensity=(typeof OOT_LOOK!=='undefined'&&OOT_LOOK?0.82:0.95)*d; hemi.intensity=(typeof OOT_LOOK!=='undefined'&&OOT_LOOK?0.72:0.55)*(0.4+0.6*d); });
  // V100 (LOOK2): a painted sky — a dome graded from a deep zenith down to the haze at the horizon, a warm glow round the sun,
  //  soft clouds drifting high up; warmer sunlight, a cooler, bounced-green fill, and a longer, hazier view
  if(typeof LOOK2!=='undefined'&&LOOK2){ scene.fog.near=30; scene.fog.far=78; hemi.groundColor.setHex(0x6a6440); ground0.copy(hemi.groundColor);
    const U={top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunC:{value:new THREE.Color()},sunD:{value:new THREE.Vector3(0,1,0)}};
    const dome=new THREE.Mesh(new THREE.SphereGeometry(300,32,16),new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,fog:false,
      vertexShader:'varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'uniform vec3 top; uniform vec3 hor; uniform vec3 sunC; uniform vec3 sunD; varying vec3 vD; void main(){ float h=clamp(vD.y,0.0,1.0); vec3 c=mix(hor,top,pow(h,0.55)); float s=max(dot(normalize(vD),normalize(sunD)),0.0); c+=sunC*(pow(s,64.0)*0.9+pow(s,6.0)*0.22); if(vD.y<0.0) c=hor; gl_FragColor=vec4(c,1.0); }'}));
    dome.renderOrder=-10; dome.frustumCulled=false; scene.add(dome);
    const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d'); for(let i=0;i<14;i++){ const px=24+Math.random()*80, py=50+Math.random()*30, r=14+Math.random()*22, gr=x.createRadialGradient(px,py,0,px,py,r); gr.addColorStop(0,'rgba(255,255,255,.85)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,128,128); }
    const cm=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false,opacity:0.85}), clouds=[];
    for(let i=0;i<14;i++){ const sp=new THREE.Sprite(cm); const a=i/14*Math.PI*2+hsh(i,5), r=120+hsh(5,i)*90; sp.userData={a,r,h:55+hsh(i,9)*35}; sp.scale.set(70+hsh(i,2)*50,26+hsh(2,i)*14,1); sp.renderOrder=-9; scene.add(sp); clouds.push(sp); }
    const deep=new THREE.Color(0x3a6ab8), tmp=new THREE.Vector3();
    dome.onBeforeRender=(r,sc2,cam)=>{ dome.position.copy(cam.position); const bg=scene.background; U.hor.value.copy(bg).lerp(new THREE.Color(0xfff2dc),0.12); U.top.value.copy(bg).lerp(deep,0.45).multiplyScalar(0.92);
      U.sunC.value.copy(sun.color).multiplyScalar(Math.min(1,sun.intensity)); U.sunD.value.copy(tmp.copy(sun.position).sub(sun.target.position).normalize());
      const t=performance.now()/1000; clouds.forEach(c=>{ const u=c.userData, a=u.a+t*0.004; c.position.set(cam.position.x+Math.sin(a)*u.r,u.h,cam.position.z+Math.cos(a)*u.r); c.material.color.copy(bg).lerp(new THREE.Color(0xffffff),0.75); }); };
    lv.anim.push(()=>{ sun.intensity*=1.12; sun.color.lerp(new THREE.Color(0xffe0b0),0.15); });
  }
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(W+300,H+300),detailify(new THREE.MeshPhongMaterial({color:0x2f6f9c,shininess:50,specular:0x2a4a66}))); sea.rotation.x=-Math.PI/2; sea.position.set(W/2,-0.3,H/2); sea.receiveShadow=true; scene.add(sea); lv.sea=sea; lv.hemi=hemi; lv.sunLight=sun;
  /* V136: THE WATER, for the High and Ultra tiers (uSQ: 0 on Low/Medium, which keep the old look): the surface carries real
     waves — its normal tipped by layered swells, so the sun glints off their faces — the far water takes the sky's colour
     as you look across it (fresnel), and foam laps along every shore, breathing in and out with the swell. The shore map is
     baked once from the tiles: water next to land is 1, fading to 0 three tiles out. */
  { const SQ={value:0}; lv.seaQ=SQ; const SW=W+2, SH=H+2, sd=new Uint8Array(SW*SH*4), isW=(x,y)=>{ if(x<1||y<1||x>=W-1||y>=H-1) return true; const t=T(x,y); return t===3||t===29||t===21||t===20; };
    for(let y=-1;y<=H;y++) for(let x=-1;x<=W;x++){ let v=0; if(isW(x,y)){ let dmin=9; for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++){ if(!isW(x+dx,y+dy)){ const d=Math.hypot(dx,dy); if(d<dmin) dmin=d; } } v=dmin>3.2?0:Math.max(0,1-(dmin-0.6)/2.6); }
      const k=((y+1)*SW+(x+1))*4; sd[k]=Math.round(v*255); sd[k+3]=255; }
    const shoreT=new THREE.DataTexture(sd,SW,SH,THREE.RGBAFormat); shoreT.magFilter=THREE.LinearFilter; shoreT.minFilter=THREE.LinearFilter; shoreT.needsUpdate=true;
    const sm=sea.material, prev=sm.onBeforeCompile;
    sm.onBeforeCompile=(sh,r)=>{ if(prev) prev(sh,r); sh.uniforms.uSQ=SQ; sh.uniforms.uShore={value:shoreT}; sh.uniforms.uSWH={value:new THREE.Vector2(SW,SH)};
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uSQ; uniform sampler2D uShore; uniform vec2 uSWH;')
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          if(uSQ>0.5){ vec2 p=vDWP.xz; float t=uDT;
            vec2 g=vec2(cos(p.x*0.9+t*1.3+sin(p.y*0.5)*1.2)*0.9, cos(p.y*1.1-t*1.1+sin(p.x*0.4)*1.4)*1.1)*0.09
                  +vec2(cos(p.x*2.7-p.y*1.3+t*2.1), cos(p.y*2.3+p.x*1.7-t*1.9))*0.03
                  +vec2(_dn(p*3.1+vec2(t*0.6,0.0))-0.5,_dn(p*3.3+vec2(0.0,-t*0.5))-0.5)*0.05;
            g*=1.0/(1.0+distance(cameraPosition.xz,p)/22.0); vec3 nW=normalize(vec3(-g.x,1.0,-g.y)); normal=normalize((viewMatrix*vec4(nW,0.0)).xyz); }   /* the swells flatten with distance: no glitter-band at the horizon */`)
        .replace('#include <fog_fragment>',`if(uSQ>0.5){ vec3 V=normalize(cameraPosition-vDWP); vec2 p=vDWP.xz, su=(p+1.0)/uSWH;
            float fr=pow(1.0-clamp(V.y,0.0,1.0),3.0); gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(fogColor,vec3(0.16,0.42,0.62),0.45),fr*0.38);
            float sh0=(su.x<0.0||su.y<0.0||su.x>1.0||su.y>1.0)?0.0:texture2D(uShore,su).r, br=sin(uDT*1.2+_dn(p*0.7)*6.0)*0.5+0.5, n2=_dn(p*4.5+vec2(uDT*0.3,uDT*0.2));
            float foam=smoothstep(0.52,0.8,sh0*(0.75+0.35*br)+n2*0.25-0.05)*(0.55+0.45*n2);
            gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(0.93,0.96,0.98),foam*0.8); }
          #include <fog_fragment>`); };
    sm.customProgramCacheKey=()=>'klk_sea_v136'; sm.needsUpdate=true;
    lv.setSeaQ=on=>{ SQ.value=on?1:0; sm.shininess=on?140:50; sm.specular.setHex(on?0x6a8aa8:0x2a4a66); }; }

  // ── the far ranges ── a ring of blue mountains on the horizon beyond the sea, past the fog, always the same distance off
  // (it follows the camera); they take the sky's colour at their feet, so they fade into the haze, and darken with the dusk
  if(opt.land!=='sunfall'){ const N=180, R0=150, pos=[], col=[], hz=new THREE.Color(), pk=new THREE.Color(0x6a7e9a), sn=new THREE.Color(0xe8eef6);
    const ridge=i=>{ const a=i/N*Math.PI*2; return 9+Math.sin(a*3+1)*6+Math.sin(a*7+2)*4+Math.sin(a*17)*2.2+Math.max(0,Math.sin(a*2-0.5))*10+hsh(i*7,3)*3; };
    for(let L=0;L<2;L++){ const R=R0+L*25, sc=L?1.25:1; for(let i=0;i<N;i++){ const a0=i/N*Math.PI*2, a1=(i+1)/N*Math.PI*2, h0=ridge(i+L*61)*sc, h1=ridge(i+1+L*61)*sc;
      const p0=[Math.sin(a0)*R,-2,Math.cos(a0)*R], p1=[Math.sin(a1)*R,-2,Math.cos(a1)*R], t0=[p0[0],h0,p0[2]], t1=[p1[0],h1,p1[2]];
      pos.push(...p0,...t0,...p1, ...p1,...t0,...t1); const cTop=h=>h>20*sc?sn:pk; [0,1,0, 0,1,1].forEach((up,j)=>{ const h=j===1||j===4?h0:j===5?h1:0, c=up?cTop(h):null; col.push(...(c?[c.r,c.g,c.b]:[-1,-1,-1])); }); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); const cA=new THREE.Float32BufferAttribute(col,3); g.setAttribute('color',cA);
    const far=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide,depthWrite:false})); far.renderOrder=-5; far.frustumCulled=false; scene.add(far);
    const base=col.slice(); let last=-1;
    far.onBeforeRender=(r,sc2,cam)=>{ far.position.set(cam.position.x,0,cam.position.z); const bgc=scene.background, key=bgc.getHex(); if(key===last) return; last=key;
      for(let i=0;i<base.length;i+=3){ if(base[i]<0){ col[i]=bgc.r; col[i+1]=bgc.g; col[i+2]=bgc.b; } else { col[i]=base[i]*0.55+bgc.r*0.45; col[i+1]=base[i+1]*0.55+bgc.g*0.45; col[i+2]=base[i+2]*0.55+bgc.b*0.45; } }
      cA.array.set(col); cA.needsUpdate=true; }; }

  // V126: SUNFALL IN THE SKY — in the right light (the evening hours most of all, and faint at dawn and by night) the
  //  outline of the floating isle shows high in Luminar's western sky: a spiral of ledges on a hanging root of rock, towers
  //  round it and Vesper's cathedral spire at the heart. It keeps its distance, as the far ranges do.
  if(!opt.land&&typeof LOOK2!=='undefined'&&LOOK2){ const cv=document.createElement('canvas'); cv.width=1024; cv.height=512; const x=cv.getContext('2d');
    const sil='rgba(40,24,48,1)'; x.fillStyle=sil;
    x.beginPath(); x.moveTo(140,250); x.bezierCurveTo(260,262,760,262,884,250); x.bezierCurveTo(860,300,760,320,700,360); x.bezierCurveTo(640,410,580,470,520,500); x.bezierCurveTo(470,470,400,410,330,362); x.bezierCurveTo(260,318,170,296,140,250); x.fill();   // the hanging root of rock
    for(let i=0;i<9;i++){ const px=200+i*78, w=60+((i*37)%30); x.fillRect(px-w/2,236-((i%3)*10),w,24); }                    // the ledges, ring on ring
    [[230,150],[330,120],[690,120],[790,150],[520,90]].forEach(([px,top],i)=>{ x.fillRect(px-13,top,26,250-top); x.beginPath(); x.moveTo(px-19,top+2); x.lineTo(px,top-34); x.lineTo(px+19,top+2); x.fill(); });   // the lamp towers
    x.beginPath(); x.moveTo(470,248); x.lineTo(470,150); x.lineTo(500,120); x.lineTo(512,30); x.lineTo(524,120); x.lineTo(554,150); x.lineTo(554,248); x.fill();   // Vesper's cathedral spire
    x.globalCompositeOperation='source-atop'; const rim=x.createLinearGradient(0,0,0,512); rim.addColorStop(0,'rgba(255,190,120,0.55)'); rim.addColorStop(0.5,'rgba(120,60,90,0)'); x.fillStyle=rim; x.fillRect(0,0,1024,512);
    const sfMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false,opacity:0}), sf=new THREE.Mesh(new THREE.PlaneGeometry(110,55),sfMat); sf.renderOrder=-7; sf.frustumCulled=false; scene.add(sf);
    sf.onBeforeRender=(r,s2,cam)=>{ sf.position.set(cam.position.x-210,88,cam.position.z+30); sf.lookAt(cam.position.x,88,cam.position.z); };
    lv.anim.push(()=>{ const f=(GAME.S.dayFrac||0)%1, dk=Math.max(0,1-Math.abs(f-0.84)/0.07), dw=Math.max(0,1-Math.abs(f-0.27)/0.05), nt=(f>0.9||f<0.22)?0.12:0;
      sfMat.opacity=Math.min(0.55,dk*0.55+dw*0.3+nt); sf.visible=sfMat.opacity>0.01; }); }
  // ── the hot spring's steam, and its healing (KLK: standing in tile 24 mends you, a little at a time) ──
  if(!opt.land){ const sp=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(T(x,y)===24) sp.push([x,y]);
    if(sp.length){ const N=Math.min(160,sp.length*12), pos=new Float32Array(N*3), ph=new Float32Array(N), cv=document.createElement('canvas'); cv.width=cv.height=64; const cx2=cv.getContext('2d'), gr=cx2.createRadialGradient(32,32,2,32,32,30);
      gr.addColorStop(0,'rgba(255,255,255,0.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); cx2.fillStyle=gr; cx2.fillRect(0,0,64,64);
      const base=[]; for(let i=0;i<N;i++){ const [x,y]=sp[i%sp.length]; base.push([x+0.15+Math.random()*0.7,y+0.15+Math.random()*0.7]); ph[i]=Math.random(); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const steam=new THREE.Points(g,new THREE.PointsMaterial({size:0.9,map:new THREE.CanvasTexture(cv),transparent:true,opacity:0.32,depthWrite:false,color:0xf4fbff})); steam.frustumCulled=false; scene.add(steam);
      let acc=0, said=false;
      lv.anim.push((t,dt)=>{ if(ENGINE.level!==lv) return; dt=dt||0.016;
        for(let i=0;i<N;i++){ const u=(ph[i]+t*0.18)%1, [bx,bz]=base[i], gy=EH(Math.floor(bx),Math.floor(bz))-0.28; pos[i*3]=bx+Math.sin(t*0.7+i)*0.15*u; pos[i*3+1]=gy+u*2.2; pos[i*3+2]=bz+Math.cos(t*0.6+i*1.3)*0.15*u; }
        g.attributes.position.needsUpdate=true;
        const P=ENGINE.P, S=GAME.S; if(T(Math.floor(P.x),Math.floor(P.z))===24){ acc+=dt; if(acc>=2){ acc=0; if(S.hp<S.maxHp){ S.hp=Math.min(S.maxHp,S.hp+Math.max(1,Math.round(2*(S.healMult||1)))); ENGINE.hud(); if(!said){ UI.toast('♨ The warm waters mend you…',1400); said=true; } } } } else { acc=0; said=false; } }); } }

  // ── where things are ──
  const ellipses=(WD.barriers||[]).map(g=>g&&{cx:g[0],cy:g[1],rx:g[2],ry:g[3]});
  function region(x,y){ if(opt.land) return opt.land; for(let i=1;i<ellipses.length;i++){ const e=ellipses[i]; if(e&&((x-e.cx)/e.rx)**2+((y-e.cy)/e.ry)**2<=1) return TOWN_KEYS[i]; }
    if(Math.hypot(x-26,y-146)<15) return 'homestead'; if(Math.hypot(x-33,y-22)<18) return 'hearthvale'; return null; }
  lv.region=region;
  // how far out a tile sits in its town, 0 at the heart to 1 at the rim (the ring fences that become palisades are out near 1)
  function rimQ(x,y){ if(opt.land) return 0; for(let i=1;i<ellipses.length;i++){ const e=ellipses[i]; if(!e) continue; const q=((x-e.cx)/e.rx)**2+((y-e.cy)/e.ry)**2; if(q<=1) return Math.sqrt(q); }
    const a=Math.hypot(x-26,y-146)/15; if(a<1) return a; const b2=Math.hypot(x-33,y-22)/18; return b2<1?b2:0; }
  /* V197: THE BIOMES — WORLD_DATA.bio (tools/biomes.py) divides the realm into broad countries with wandering borders:
     0 meadow 1 forest 2 desert 3 ash 4 alpine 5 marsh 6 coast 7 highland 8 scorched 9 farmland. The ground's colour, the
     trees, the weather, the footfalls and the place-names all follow it; the classic look and the portal worlds keep theirs. */
  const BIO=(()=>{ if(opt.land||!WD.bio||typeof LOOK2==='undefined'||!LOOK2) return null; const b=atob(WD.bio), a=new Uint8Array(b.length); for(let i=0;i<b.length;i++) a[i]=b.charCodeAt(i); return a; })(), BIOW=WD.bioW||0;
  const bio=(x,y)=>BIO&&x>=0&&y>=0&&x<W&&y<H?BIO[(y>>1)*BIOW+(x>>1)]:-1;
  const desert=BIO?(x,y)=>bio(x,y)===2:(x,y)=>!opt.land&&x>=SX(78)&&x<=SX(107)&&y>=SY(56)&&y<=SY(82), ashland=BIO?(x,y)=>{ const b=bio(x,y); return b===3||b===8; }:(x,y)=>!opt.land&&x>=SX(136)&&x<=SX(180)&&y>=SY(134)&&y<=SY(167);
  lv.bio=bio; lv.BIOME=['meadow','forest','desert','ash','alpine','marsh','coast','highland','scorched','farmland'];
  lv.towns=WD.towns||[]; lv.desert=desert; lv.ashland=ashland; lv.hemi=hemi;   /* V131: weather.js reads these */
  const bAt=new Map(); WD.buildings.forEach(b=>{ if(b.deck!==undefined) return; /* V202: a house up a tree has no footprint on the ground */ for(let y=b.y;y<b.y+b.h;y++) for(let x=b.x;x<b.x+b.w;x++) bAt.set(y*W+x,b); });
  const dAt=new Set(); WD.decor.forEach(d=>{ for(let j=0;j<(d.w||1);j++) for(let i=0;i<(d.w||1);i++) dAt.add((d.y+j)*W+d.x+i); });
  // the barrier rings, as the game keeps them (BARRIERS[i].set, after its own edits)
  const rings={}; Object.entries(WD.barrierSets||{}).forEach(([i,arr])=>{ const s=new Set(); for(let k=0;k<arr.length;k+=2) s.add(arr[k+1]*W+arr[k]); rings[i]=s; });
  lv.barrierAt=(x,y)=>{ for(const i in rings) if(opt.sealed(+i)&&rings[i].has(y*W+x)) return +i; return -1; };

  // V100 (LOOK2): ROLLING MEADOWS — the open country rises and falls in soft swells instead of lying dead flat. Only meadow,
  //  path and woodland roll; the swell fades to nothing within a few tiles of anything built or set down — buildings, decor,
  //  fences, walls, water and every change of level — so doors, steps, quays and streets sit exactly where they did. Everything
  //  that stands in a meadow (trees, grass, flowers, the knight's own feet) rides the same surface: lv.roll(x,z).
  // V119 (LOOK2): THE OPEN COUNTRY — step A of the open world, in the north-west (Hearthvale, Ironhold, Dusthaven and the new
  //  country east to Crystalpeak's foot): the meadows are no longer a soft swell but real land, as the Northern Reach is —
  //  each town's own country around it (Hearthvale's green valley, Ironhold's ridged foothills, Dusthaven's dunes), hills
  //  rising from wherever something is built or set down at no more than a walkable grade (so every door, step and quay
  //  sits where it did, and every hill can be climbed), the roads eased over them, the rivers down in their valleys.
  //  Elsewhere the old swell, until the later steps reach it. All of it one surface: lv.roll(x,z), on top of the tiles.
  // V120 (step B): the open country is the whole realm now — every town's own land around it
  const OW=(()=>{ if(typeof LOOK2==='undefined'||!LOOK2) return null; /* V122: the portal worlds too */ return {X1:W,Y1:H,m:()=>1}; })();
  lv.openWorld=OW;
  const ROLL=(()=>{ const R1=W+1, N=R1*(H+1), U=new Float32Array(N); if(typeof LOOK2==='undefined'||!LOOK2) return null;
    const OPEN=new Set([0,1,2,4,7]), D=new Float32Array(W*H);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const k=y*W+x, t=T(x,y), e=E(x,y); let ok=(OPEN.has(t)||(t===19&&OW&&OW.m(x,y)>0.5))&&!bAt.has(k)&&!dAt.has(k);
      if(ok) for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) if(inB(x+a,y+b)&&E(x+a,y+b)!==e){ ok=false; break; }
      D[k]=ok?1e9:0; }
    (WD.flats||[]).forEach(([x0,y0,x1,y1])=>{ for(let y=Math.max(0,y0);y<=Math.min(H-1,y1);y++) for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++) D[y*W+x]=0; });   // V202: ground kept level (Thornwood's floor under its decks)
    const chamfer=(A,w,h,init)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const k=y*w+x; if(x) A[k]=Math.min(A[k],A[k-1]+1); if(y) A[k]=Math.min(A[k],A[k-w]+1); if(x&&y) A[k]=Math.min(A[k],A[k-w-1]+1.4); if(y&&x<w-1) A[k]=Math.min(A[k],A[k-w+1]+1.4); }
      for(let y=h-1;y>=0;y--) for(let x=w-1;x>=0;x--){ const k=y*w+x; if(x<w-1) A[k]=Math.min(A[k],A[k+1]+1); if(y<h-1) A[k]=Math.min(A[k],A[k+w]+1); if(x<w-1&&y<h-1) A[k]=Math.min(A[k],A[k+w+1]+1.4); if(y<h-1&&x) A[k]=Math.min(A[k],A[k+w-1]+1.4); } };
    chamfer(D,W,H);
    // how far each tile is from a road, so the roads can be eased over the hills
    const DRd=new Float32Array(W*H); for(let k=0;k<W*H;k++){ const t=T(k%W,(k/W)|0); DRd[k]=(t===2||t===12)?0:1e9; } chamfer(DRd,W,H);
    const sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
    // value noise on the tile lattice, and a few octaves of it
    const vn=(x,y,s)=>{ const i=Math.floor(x), j=Math.floor(y), u=x-i, v=y-j, su=u*u*(3-2*u), sv=v*v*(3-2*v), I=i+s*97+4000, J=j+s*61+4000;
      return (hsh(I,J)*(1-su)+hsh(I+1,J)*su)*(1-sv)+(hsh(I,J+1)*(1-su)+hsh(I+1,J+1)*su)*sv; };
    const fbm=(x,y,s)=>vn(x,y,s)*0.56+vn(x*2.07,y*2.07,s+3)*0.29+vn(x*4.3,y*4.3,s+7)*0.15;
    // each town's country, by the land's own character, felt out to a good walk around it
    const KIND={Hearthvale:['vale',3.2],Ironhold:['ridge',9.5],Dusthaven:['dune',3.0],Thornwood:['forest',5.5],Homestead:['vale',2.4],Crystalpeak:['mountain',15],Saltmere:['coast',3.4],
      Ashfield:['ash',3.6],Stormgate:['coast',4.2],Shadowmere:['marsh',1.1],Hellgate:['crag',13]};   // V120: every town's country — Thornwood's wooded knolls, Crystalpeak's range, Saltmere's and Stormgate's headlands, Ashfield's mesas, Shadowmere's flat mere, Hellgate's crags
    // V122: the portal worlds' own country — Mistral's green downs, Tabor's mountain ridges, Sunfall's sea-headlands — and the
    //  three southern isles in the realm (Mistral Isle's downs, Mount Tabor a real peak, Sunfall Atoll low and sandy)
    const LANDK={mistral:['vale',3.8],tabor:['ridge',6.5],sunfall:['coast',2.6]}, LK=opt.land?(LANDK[opt.land]||['vale',3]):null;
    const centres=(WD.towns||[]).filter(t=>LK||KIND[t[0]]).map(t=>({x:t[1],y:t[2],k:LK?LK[0]:KIND[t[0]][0],A:LK?LK[1]:KIND[t[0]][1]}));
    if(!opt.land) [['coast',3.2,40,270,16],['mountain',11,95,274,15],['coast',1.6,155,270,14]].forEach(([k,A,x,y,R])=>centres.push({x:SX(x),y:SY(y),k,A,R}));
    if(BIO) (WD.bioAnchors||[]).forEach(([b,x,y,R])=>{ const q={1:['forest',5.0],2:['dune',3.4],3:['ash',3.2],5:['marsh',1.0],7:['ridge',6.0],0:['vale',3.4],9:['vale',2.8]}[b]; if(q) centres.push({x,y,k:q[0],A:q[1],R:R*0.8}); });   // V197: the wild countries roll their own way — dunes, wooded knolls, mesas, fens (the ranges stay where they were: nothing new is too steep to walk)
    const shape=(k,A,x,y)=>{ if(k==='vale') return A*Math.pow(fbm(x/26,y/26,1),1.2)*1.5;
      if(k==='ridge'){ const n=fbm(x/30,y/30,5), r=1-Math.abs(2*n-1); return A*(Math.pow(r,1.6)*0.85+fbm(x/14,y/14,9)*0.25); }
      if(k==='forest'){ const n=fbm(x/17,y/17,15); return A*(Math.pow(n,1.4)*1.3+fbm(x/40,y/40,16)*0.5); }
      if(k==='mountain'||k==='crag'){ const n=fbm(x/(k==='crag'?22:34),y/(k==='crag'?22:34),k==='crag'?21:17), r=1-Math.abs(2*n-1), r2=1-Math.abs(2*fbm(x/13,y/13,19)-1);   // ridged: sharp crests, saddles between, lesser spurs on the flanks
        return A*(Math.pow(r,k==='crag'?2.6:2.0)*0.85+Math.pow(r2,3)*0.22+fbm(x/60,y/60,23)*0.25); }
      if(k==='coast'){ return A*(Math.pow(fbm(x/22,y/22,25),1.5)*1.4+Math.max(0,fbm(x/9,y/9,27)-0.6)*1.2); }
      if(k==='ash'){ const n=fbm(x/24,y/24,29), q=Math.floor(n*4)/4; return A*(q*0.8+n*0.4); }                       // mesas: flat tops, stepped shoulders
      if(k==='marsh'){ return A*fbm(x/14,y/14,31)*0.8; }
      if(k==='dune'){ const ph=(x*0.82+y*0.36)/9+fbm(x/34,y/34,11)*3.2; return A*(0.35+0.65*Math.pow(0.5+0.5*Math.sin(ph*6.283),1.6))*(0.4+fbm(x/22,y/22,13)); }
      return A*Math.pow(fbm(x/32,y/32,3),1.3)*1.4; };
    const HILL=new Float32Array(N), WR=new Float32Array(N), MM=new Float32Array(N), GR=new Float32Array(N).fill(0.42), MW=new Float32Array(N), DD=new Float32Array(N);
    for(let y=0;y<=H;y++) for(let x=0;x<=W;x++){ let d=1e9, dr=1e9; for(const [a,b] of [[0,0],[-1,0],[0,-1],[-1,-1]]){ const X=x+a, Y=y+b; d=Math.min(d,inB(X,Y)?D[Y*W+X]:0); dr=Math.min(dr,inB(X,Y)?DRd[Y*W+X]:1e9); }
      const v=y*R1+x, m=OW?OW.m(x,y):0; MM[v]=m;
      const env=sm((d-1.0)/6), n=0.6*Math.sin(x*0.14+Math.sin(y*0.09)*1.6)*Math.cos(y*0.12+0.7)+0.28*Math.sin((x-y)*0.23+1.1)+0.12*Math.sin(x*0.41+y*0.37);
      const old=env*1.6*(0.5+0.5*n);
      if(m<=0||d<=0){ U[v]=old*(1-m); continue; }
      let ws=0.35, h=0.35*(LK?shape(LK[0],LK[1],x,y):shape('hill',5.5,x,y)), mw=0; for(const c of centres){ const R=c.R||((c.k==='mountain'||c.k==='crag')?58:44)*(W>500?1.5:1), w=Math.exp(-(((x-c.x)**2+(y-c.y)**2)/(R*R))); if(w<0.01) continue; ws+=w; h+=w*shape(c.k,c.A,x,y); if(c.k==='mountain'||c.k==='crag') mw+=w; }
      HILL[v]=h/ws*sm((d-0.5)/2.5); WR[v]=1-sm((dr-1)/4); U[v]=old*(1-m); MW[v]=Math.min(1,mw/ws*1.6); DD[v]=d; }
    // V199: the hills a village is planned about (WORLD_DATA.hills: [x, y, radius, height]) — the sheep hill above Hearthvale
    if(!opt.land) for(const [hx,hy,hr,ha] of (WD.hills||[])) for(let y=Math.max(0,hy-hr);y<=Math.min(H,hy+hr);y++) for(let x=Math.max(0,hx-hr);x<=Math.min(W,hx+hr);x++){
      const d=Math.hypot(x-hx,y-hy)/hr; if(d>=1) continue; const v=y*R1+x; if(MM[v]<=0||DD[v]<=0) continue; HILL[v]+=ha*sm(1-d)*sm((DD[v]-0.5)/2.5); }
    // the roads ride the land but are eased over it: where one runs, the hill under it is a broad average of the hills about
    const blur=(A,rad)=>{ const B=new Float32Array(N), C=new Float32Array(N); for(let y=0;y<=H;y++){ let acc=0, n=0; for(let x=-rad;x<=W+rad;x++){ if(x+rad<=W){ acc+=A[y*R1+x+rad]; n++; } if(x-rad-1>=0){ acc-=A[y*R1+x-rad-1]; n--; } if(x>=0&&x<=W) B[y*R1+x]=acc/n; } }
      for(let x=0;x<=W;x++){ let acc=0, n=0; for(let y=-rad;y<=H+rad;y++){ if(y+rad<=H){ acc+=B[(y+rad)*R1+x]; n++; } if(y-rad-1>=0){ acc-=B[(y-rad-1)*R1+x]; n--; } if(y>=0&&y<=H) C[y*R1+x]=acc/n; } } return C; };
    const HB=blur(blur(HILL,4),4); for(let v=0;v<N;v++) if(MM[v]>0) U[v]+=MM[v]*(HILL[v]+(HB[v]*0.8-HILL[v])*WR[v]);
    // nowhere steeper than a knight can walk: each point is held to within a grade of every point about it, so the hills
    // climb from the fixed ground (a door, a wall, the water) at a walk, and no swell is a wall
    // V120: in the mountains, well away from roads and anything built, the land may rise steeper than a walk — real crags
    //  and cliffs to go round (lv.canMove keeps you off them); everywhere else, and always near a road or a door, a walk
    for(let v=0;v<N;v++) GR[v]=0.42+0.75*MW[v]*(1-WR[v])*sm((DD[v]-5)/7);
    // V121: THE PILGRIM'S PASS — the road to Hellgate climbs as the Northern Reach's trail does: a winding trail (its curve
    //  and heights from STRETCH.trek.samples) up to a high pass and down into Hellgate's valley, walled on both hands by crags
    //  too steep to climb, rising with their distance from the trail to snowy tops; it blends into the country at the box's edges
    const TK=!opt.land&&typeof STRETCH!=='undefined'&&STRETCH.trek&&STRETCH.trek.samples;
    if(TK){ const [bx0,by0,bx1,by1]=STRETCH.trek.box, SMP=TK;
      lv.trek={samples:SMP,box:STRETCH.trek.box};
      for(let y=Math.max(0,by0-12);y<=Math.min(H,by1+12);y++) for(let x=Math.max(0,bx0-12);x<=Math.min(W,bx1+12);x++){ const v=y*R1+x;
        const wB=sm((x-bx0+12)/12)*sm((bx1+12-x)/12)*sm((y-by0+12)/12)*sm((by1+12-y)/12); if(wB<=0||DD[v]<=0) continue;   // (water, walls and anything built keep their ground)
        let best=1e9, hT=0; for(let i=0;i<SMP.length;i+=2){ const q=SMP[i], dd=(q[0]-x)**2+(q[1]-y)**2; if(dd<best){ best=dd; hT=q[2]; } }
        const dT=Math.sqrt(best), rid=1-Math.abs(2*fbm(x/11,y/11,37)-1);
        const crag=Math.max(0,dT-2.4)*(1.3+0.5*rid)*sm(dT/3)+Math.max(0,dT-6)*fbm(x/7,y/7,41)*0.9;
        const tU=hT+Math.min(30,crag);
        U[v]=U[v]*(1-wB)+tU*wB; GR[v]=dT<3.2?0.42:GR[v]*(1-wB)+1.9*wB; } }
    for(let pass=0;pass<2;pass++){
      for(let y=0;y<=H;y++) for(let x=0;x<=W;x++){ const v=y*R1+x, G=GR[v]; if(x) U[v]=Math.min(U[v],U[v-1]+G); if(y) U[v]=Math.min(U[v],U[v-R1]+G); if(x&&y) U[v]=Math.min(U[v],U[v-R1-1]+G*1.41); if(y&&x<W) U[v]=Math.min(U[v],U[v-R1+1]+G*1.41); }
      for(let y=H;y>=0;y--) for(let x=W;x>=0;x--){ const v=y*R1+x, G=GR[v]; if(x<W) U[v]=Math.min(U[v],U[v+1]+G); if(y<H) U[v]=Math.min(U[v],U[v+R1]+G); if(x<W&&y<H) U[v]=Math.min(U[v],U[v+R1+1]+G*1.41); if(y<H&&x) U[v]=Math.min(U[v],U[v+R1-1]+G*1.41); } }
    if(!opt.land&&typeof WILDS!=='undefined') WILDS.shape({U,GR,DD,R1,W,H,clear:(x,y)=>{ if(!inB(x,y)) return; const t=A[y*W+x]; if(t===1||t===0||t===4||t===7){ if(t===1) A[y*W+x]=0; const NN=W*H; A[NN+y*W+x]=(1<<4)|(A[NN+y*W+x]&15); } }});   // V175: the plateaus, flat-topped on their cliffs, and their paths
    return U; })();
  const roll0=(fx,fz)=>{ if(!ROLL) return 0; const x=Math.floor(fx), y=Math.floor(fz); if(x<0||y<0||x>=W||y>=H) return 0; const u=fx-x, v=fz-y, r=W+1;
    return (ROLL[y*r+x]*(1-u)+ROLL[y*r+x+1]*u)*(1-v)+(ROLL[(y+1)*r+x]*(1-u)+ROLL[(y+1)*r+x+1]*u)*v; };
  // V123 (LOOK2): SOFT TERRACES — in the portal worlds and on the southern isles the land is built of terraces (a level per
  //  tile); there natural ground (snow, sand, turf, ash — anything you can walk that isn't built, set down, a stair or water)
  //  is drawn as one smooth surface: each corner takes the average height of the natural ground about it, so the terraces
  //  run into slopes and Tabor is a mountain. A corner that touches anything built, a stair or water keeps the tile's own
  //  height, so those stand exactly where they did. You can walk the slopes (lv.canMove): Tabor is climbable anywhere.
  const SOFTZ=(()=>{ if(typeof LOOK2==='undefined'||!LOOK2) return null; if(opt.land) return ()=>true; const y0=typeof SY==='function'?SY(252)+120-0:H; const Y0=Math.max(0,H-48); return (x,y)=>y>=Y0&&x<Math.min(W,270); })();
  const isSoft=(x,y)=>{ if(!SOFTZ||!inB(x,y)||!SOFTZ(x,y)) return false; const k=y*W+x, t=T(x,y); if(!WK(x,y)||bAt.has(k)||dAt.has(k)) return false;
    if(STAIRS.has(t)||t===3||t===20||t===21||t===29||t===5||t===40||t===24) return false; return true; };
  const SOFT=new Uint8Array(W*H), SV=new Float32Array((W+1)*(H+1)).fill(NaN);
  // V124: MOUNT TABOR AS ONE MOUNTAIN — its land is drawn from the mountain's own shape (opt.mountain: centre, radius, peak)
  //  rather than its rings of terraces: a single great slope from the shore to the snowy summit with Eden's spring on its
  //  crown, the old terrace cliffs left as bands of crag along it (you still can't walk them; the stairs become slope you can)
  const MTN=(typeof LOOK2!=='undefined'&&LOOK2&&opt.mountain)?opt.mountain:null;
  const MS=new Uint8Array(W*H);   // tiles that ride a mountain's (or an isle's) own shape
  const shapeH=(M,x,y)=>{ const PK=M.PK||13.5, nz=Math.sin(x*0.31+Math.sin(y*0.17)*2.1)*0.5+Math.sin(y*0.27+x*0.11)*0.35+Math.sin((x+y)*0.53)*0.15;
    const dx=x-M.cx, dy=y-M.cy, a=Math.atan2(dy,dx), rr=Math.hypot(dx,dy)*(1+0.07*Math.sin(a*3+1.3)+0.04*Math.sin(a*7)), u=Math.min(1,rr/(M.R*0.98));
    if(u>=1) return 0; const cr=M.crown===undefined?0.12:M.crown, top=u<cr?1:Math.pow(1-(u-cr)/(1-cr),M.ex||1.45); return PK*top+(u>cr&&u<0.92?nz*(M.rough||0.55)*(1-u):0); };
  const mtnH=MTN?((x,y)=>shapeH(MTN,x,y)):null;
  if(MTN){ for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const t=T(x,y); SOFT[y*W+x]=(t===3||t===20||t===21||t===29||bAt.has(y*W+x))?0:1; MS[y*W+x]=SOFT[y*W+x]; }
    // the mountain comes down to the water on every side, whatever the island's shape: it eases to the shore over a few tiles
    const DW=new Float32Array((W+1)*(H+1)).fill(1e9), R1w=W+1; for(let y=0;y<=H;y++) for(let x=0;x<=W;x++){ for(const [a,b] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const X=x+a, Y=y+b; if(!inB(X,Y)||!SOFT[Y*W+X]){ DW[y*R1w+x]=0; break; } } }
    for(let pass=0;pass<2;pass++){ for(let y=0;y<=H;y++) for(let x=0;x<=W;x++){ const v=y*R1w+x; if(x) DW[v]=Math.min(DW[v],DW[v-1]+1); if(y) DW[v]=Math.min(DW[v],DW[v-R1w]+1); if(x&&y) DW[v]=Math.min(DW[v],DW[v-R1w-1]+1.41); if(y&&x<W) DW[v]=Math.min(DW[v],DW[v-R1w+1]+1.41); }
      for(let y=H;y>=0;y--) for(let x=W;x>=0;x--){ const v=y*R1w+x; if(x<W) DW[v]=Math.min(DW[v],DW[v+1]+1); if(y<H) DW[v]=Math.min(DW[v],DW[v+R1w]+1); if(x<W&&y<H) DW[v]=Math.min(DW[v],DW[v+R1w+1]+1.41); if(y<H&&x) DW[v]=Math.min(DW[v],DW[v+R1w-1]+1.41); } }
    const shore=(x,y)=>{ const u=Math.min(1,DW[y*R1w+x]/8); return u*u*(3-2*u); };
    const R1=W+1; for(let y=0;y<=H;y++) for(let x=0;x<=W;x++){ let land=0, crag=0, n=0; for(const [a,b] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const X=x+a, Y=y+b; if(!inB(X,Y)) continue; n++; if(SOFT[Y*W+X]){ land++; if(!WK(X,Y)) crag++; } }
      if(land<n){ continue; } SV[y*R1+x]=mtnH(x,y)*shore(x,y)+(crag===4?0.75:crag>=2?0.3:0)*shore(x,y); } }
  else if(SOFTZ){ for(let y=0;y<H;y++) for(let x=0;x<W;x++) SOFT[y*W+x]=isSoft(x,y)?1:0;
    for(let y=0;y<=H;y++) for(let x=0;x<=W;x++){ let hard=false; for(const [a,b] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const X=x+a, Y=y+b; if(inB(X,Y)&&!SOFT[Y*W+X]) { hard=true; break; } } if(hard) continue;
      let sm=0, n=0; for(let b=-2;b<=1;b++) for(let a=-2;a<=1;a++){ const X=x+a, Y=y+b; if(!inB(X,Y)||!SOFT[Y*W+X]) continue; const w=(a===-1||a===0)&&(b===-1||b===0)?2:1; sm+=EH(X,Y)*w; n+=w; }
      if(n) SV[y*(W+1)+x]=sm/n; } }
  // V125: THE SOUTHERN ISLES — each drawn from its own shape, as Tabor's world is: Mount Tabor's isle a real peak,
  //  Mistral Isle green downs, Sunfall Atoll low dunes; every one easing down to its beaches and the sea
  if(SOFTZ&&!opt.land&&typeof SX==='function'){ const R1=W+1;
    [[40,270,{PK:4.2,ex:1.1,crown:0.0,rough:0.9}],[95,274,{PK:9,ex:1.35}],[155,270,{PK:1.8,ex:0.9,crown:0.0,rough:1.2}]].forEach(([ox,oy,M])=>{
      let cx0=SX(ox), cy0=SY(oy), sx=0, sy=0, n=0; const RR=22, land=(x,y)=>inB(x,y)&&!([3,20,21,29].includes(T(x,y)));
      for(let y=cy0-RR;y<=cy0+RR;y++) for(let x=cx0-RR;x<=cx0+RR;x++) if(land(x,y)){ sx+=x; sy+=y; n++; } if(n<20) return;
      M.cx=sx/n; M.cy=sy/n; let R=0; for(let y=cy0-RR;y<=cy0+RR;y++) for(let x=cx0-RR;x<=cx0+RR;x++) if(land(x,y)) R=Math.max(R,Math.hypot(x+0.5-M.cx,y+0.5-M.cy)); M.R=R+1.5;
      const x0=Math.max(0,Math.floor(M.cx-M.R-2)), x1=Math.min(W-1,Math.ceil(M.cx+M.R+2)), y0=Math.max(0,Math.floor(M.cy-M.R-2)), y1=Math.min(H-1,Math.ceil(M.cy+M.R+2));
      for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ const k=y*W+x; if(land(x,y)&&!bAt.has(k)&&!dAt.has(k)){ MS[k]=1; SOFT[k]=1; } /* the isles' low walls ride the land with it */ }
      const D=new Map(), key=(x,y)=>y*R1+x; const q=[];
      for(let y=y0;y<=y1+1;y++) for(let x=x0;x<=x1+1;x++){ let open=false; for(const [a,b] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const X=x+a,Y=y+b; if(!inB(X,Y)||!MS[Y*W+X]){ open=true; break; } } if(open){ D.set(key(x,y),0); q.push([x,y]); } }
      for(let i=0;i<q.length;i++){ const [x,y]=q[i], d=D.get(key(x,y)); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+a,Y=y+b; if(X<x0||Y<y0||X>x1+1||Y>y1+1) continue; if(!D.has(key(X,Y))){ D.set(key(X,Y),d+1); q.push([X,Y]); } } }
      for(let y=y0;y<=y1+1;y++) for(let x=x0;x<=x1+1;x++){ const d=D.get(key(x,y)); if(!d) continue; const u=Math.min(1,d/5), sh=u*u*(3-2*u); SV[key(x,y)]=Math.max(EH(Math.min(W-1,x),Math.min(H-1,y)),shapeH(M,x,y)*sh+EH(Math.min(W-1,x),Math.min(H-1,y))*(1-sh)); } }); }
  const softOff=(fx,fz)=>{ if(!SOFTZ) return 0; const x=Math.floor(fx), y=Math.floor(fz); if(!inB(x,y)||!SOFT[y*W+x]) return 0; const own=EH(x,y), u=fx-x, v=fz-y, R=W+1;
    const c=(X,Y)=>{ const s0=SV[Y*R+X]; return s0===s0?s0-own:0; };
    return (c(x,y)*(1-u)+c(x+1,y)*u)*(1-v)+(c(x,y+1)*(1-u)+c(x+1,y+1)*u)*v; };
  const softEdge=(x,y,dx,dy)=>{ if(!SOFTZ||!SOFT[y*W+x]||!inB(x+dx,y+dy)||!SOFT[(y+dy)*W+x+dx]) return false; const R=W+1;   // the two corners this side shares
    const cs=dx?[[x+(dx>0?1:0),y],[x+(dx>0?1:0),y+1]]:[[x,y+(dy>0?1:0)],[x+1,y+(dy>0?1:0)]]; return cs.every(([X,Y])=>{ const s0=SV[Y*R+X]; return s0===s0; }); };
  lv.softAt=(x,y)=>!!(SOFTZ&&inB(x,y)&&SOFT[y*W+x]);
  const roll=(fx,fz)=>roll0(fx,fz)+softOff(fx,fz);
  lv.roll=roll;
  // stairs ramp across each pair so the knight walks up rather than popping
  const SD=stairMap(W,H,T,E,(x,y)=>WK(x,y)&&T(x,y)!==5);
  function ground(fx,fz){ const x=Math.floor(fx), y=Math.floor(fz); if(!inB(x,y)) return -0.35; const t=T(x,y), e=E(x,y);
    if(t===3) return -0.35; if(t===20||t===21) return -0.05; if(t===24&&!opt.land) return e*TIER*LIFT(x,y)-0.4;   // waist-deep in the hot spring
    const d=SD.get(y*W+x), TL=TIER*LIFT(x,y); if(!d||MS[y*W+x]) return e*TL+0.02;   // (on Tabor the stairs are part of the one slope)
    const u=fx-x, v=fz-y, s=d.dx>0?u:d.dx<0?1-u:d.dy>0?v:1-v; return e*TL+0.02+TL*(d.lo+(d.hi-d.lo)*s); }
  lv.ground=ROLL?(fx,fz)=>ground(fx,fz)+roll(fx,fz):ground;
  lv.canMove=(fx,fz,tx,tz)=>{ const ax=Math.floor(fx),ay=Math.floor(fz),bx=Math.floor(tx),by=Math.floor(tz);
    if(!WK(bx,by)) return false; if(ax===bx&&ay===by) return true;
    if(lv.barrierAt(bx,by)>=0){ if(opt.onBarrier) opt.onBarrier(lv.barrierAt(bx,by)); return false; }
    const hf=E(ax,ay),ht=E(bx,by),tf=T(ax,ay),tt=T(bx,by);
    if(SOFTZ&&SOFT[ay*W+ax]&&SOFT[by*W+bx]&&hf!==ht){ const up=(ground(tx,tz)+roll(tx,tz))-(ground(fx,fz)+roll(fx,fz)), dd=Math.hypot(tx-fx,tz-fz)||1; return up/dd<=0.9||up<0.05; }   // V123: up the slope between two terraces
    if(ROLL&&!(lv.flying&&lv.flying())){ const up=roll(tx,tz)-roll(fx,fz), dd=Math.hypot(tx-fx,tz-fz)||1; if(up/dd>0.62&&up>0.02) return false; }   // V120: a crag too steep to climb (down is fine)
    if(hf===ht) return true; if(Math.abs(hf-ht)===1&&(STAIRS.has(tf)||STAIRS.has(tt))) return true; return ht<hf&&(tt===32||tf===32); };
  lv.walkTile=(x,y)=>WK(x,y)&&lv.barrierAt(x,y)<0;     // what a demon may stand on (the game's walkable())
  // how tall the walls and the mountains stand: a curtain wall of 2.3 (the knight is 1.5); rock rises with the rock around it,
  // so a lone boulder stays low and the heart of a range climbs to a snowy crag of nearly five
  // ── the high ground ── the hearts of the rock and the big woods rise into real relief: a range climbs with its distance
  // from the open ground (crags at its feet, peaks in its heart, snow on the tall ones), and deep forest swells into wooded
  // hills. Only ground no one walks on rises, so the walk is the game's own; RH is the height over the terrace, RK the kind.
  const RH=new Float32Array(W*H), RK=new Uint8Array(W*H), AH=new Float32Array(W*H); let D;
  { const cls=(x,y)=>{ if(!inB(x,y)||WK(x,y)) return 0; const t=T(x,y); if(inCP(x,y)&&E(x,y)>0||inCP(x,y)&&t===33){ if(t===3||t===20||t===21||t===5||bAt.has(y*W+x)||dAt.has(y*W+x)) return 0; return 3; } if(t===33) return 1; if(t===1&&!opt.land) return 2; return 0; };
    D=new Int16Array(W*H).fill(-1); const q=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(!cls(x,y)){ D[y*W+x]=0; q.push(y*W+x); }
    for(let i=0;i<q.length;i++){ const k=q[i], x=k%W, y=(k/W)|0; for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++){ const X=x+a, Y=y+b; if(!inB(X,Y)) continue; const j=Y*W+X; if(D[j]<0){ D[j]=D[k]+1; q.push(j); } } }
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const c=cls(x,y), k=y*W+x, d=D[k]; if(!c) continue;
      if(c===3){ RK[k]=3; let lo=1e9, hi=-1e9; for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++){ const X=x+a,Y=y+b; if(!inB(X,Y)||cls(X,Y)) continue; const g=EH(X,Y)+0.02; lo=Math.min(lo,g); hi=Math.max(hi,g); }   // the mountainside between two ledges of the trail
        AH[k]=hi>-1e8?(lo+hi)/2+0.15+hsh(x*7,y*5)*0.2:EH(x,y)+0.4; continue; }
      if(c===1){ RK[k]=1; RH[k]=Math.min(10,1.1+d*1.55+hsh(x*3,y*7)*1.1+(d>2?hsh(y,x*5)*1.6:0)); }
      else if(d>=2){ RK[k]=2; const rid=1-Math.abs(Math.sin(x*0.29+Math.sin(y*0.13)*2.2)*Math.cos(y*0.21+Math.sin(x*0.11)*1.7));   // ridges and saddles, so a range isn't one cone
        RH[k]=d<=4?(d-1)*0.7+hsh(x*5,y*3)*0.35:Math.min(13,2.1+(d-4)*1.2*(0.55+0.75*rid)+hsh(x*5,y*3)*0.8); } } }
  lv.reliefD=(x,y)=>inB(x,y)?D[y*W+x]:0;
  // smoothed twice over the high ground, so slopes run from tile to tile instead of rising in a spike from each
  const RS=new Float32Array(RH); for(let pass=0;pass<2;pass++){ const src=RS.slice(); for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const k=y*W+x; if(!RK[k]||RK[k]===3) continue; let sm=0,n=0;
      for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++){ const X=x+a, Y=y+b; if(!inB(X,Y)) continue; const j=Y*W+X; sm+=RK[j]?src[j]:0; n++; } RS[k]=Math.max(src[k]*0.35,sm/n*1.12); } }
  const RB=(x,y)=>EH(x,y)+0.02;   // the ground a relief rises from
  // one vertex of the relief, in half-tile steps: shared by every tile that touches it, so the range is one skin
  function reliefV(vx,vy){ return reliefV0(vx,vy)+(ROLL?roll(vx/2,vy/2):0); }   // V119: the high ground rides the open country's hills
  function reliefV0(vx,vy){ const tx=[], X=vx>>1, Y=vy>>1, ox=vx&1, oy=vy&1; const ts=[]; for(const a of (ox?[X]:[X-1,X])) for(const b of (oy?[Y]:[Y-1,Y])) ts.push([a,b]);
    let open=-1e9, sum=0, base=1e9, k3=false, ah=0; for(const [a,b] of ts){ if(!inB(a,b)) return 0; const k=b*W+a; if(!RK[k]){ open=Math.max(open,RB(a,b)); continue; } sum+=RS[k]; base=Math.min(base,RB(a,b)); if(RK[k]===3){ k3=true; ah+=AH[k]; } else ah+=RB(a,b)+RS[k]; }
    if(open>-1e8) return open;                                                                                  // where it meets walkable ground: that ground's height (the higher, between two ledges)
    if(k3) return ah/ts.length+(hsh(vx*3+17,vy*5+11)-0.5)*0.7;   // a rough face, not a ramp
    const h=sum/ts.length; return base+h+(hsh(vx*3+17,vy*5+11)-0.5)*0.16*Math.min(h,3); }
  const reliefMat=detailify(new THREE.MeshLambertMaterial({vertexColors:true}),{amp:0.2,strata:0.04,grit:0.16});
  function reliefMesh(ch,list){ if(!list.length) return; const pos=[], col=[], C=new THREE.Color();
    const tri=(a,b,c,kind,x,y)=>{ const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2]; let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; const l=Math.hypot(nx,ny,nz)||1; ny/=l;
      const hm=(a[1]+b[1]+c[1])/3-RB(x,y)-(ROLL?roll(x+0.5,y+0.5):0), r=region(x,y), ash=ashland(x,y)||r==='hellgate'||r==='ashfield', sand=desert(x,y), cold=r==='crystalpeak'||r==='hellgate'||bio(x,y)===4||(!opt.land&&x>=SX(72)&&x<=SX(118)&&y>=SY(252)&&y<=SY(299)), jit=(hsh(x*7+Math.round(a[0]*3),y*3+Math.round(a[2]*3))-0.5)*0.06;
      const ya=(a[1]+b[1]+c[1])/3;
      let hex; if(kind===3&&L2&&inCP(x,y)) hex=ny>0.72?(ya>3.2?0xeef3f8:0xa8c890):ny>0.5?(ya>4.5?0xc8d0dc:0x8e8a84):(ya>6?0x8a8e9c:0x78726c);   // V113: Crystalpeak — snow on the ledges, grey rock on the cliffs
      else if(kind===3&&BIO&&bio(x,y)!==4&&!(bio(x,y)===7&&ya>9)) hex=ny<0.55?0x7a7468:ya>5?(ny>0.75?0x8a8c78:0x7e786c):ya>2.5?(ny>0.7?0x8aa070:0x7a7468):(ny>0.6?0x5f9a50:0x766a58);   // V198: warm country's crags are bare rock, no snow
      else if(kind===3) hex=ny<0.55?(ya>7?0x9aa2ae:0x7a7468):ya>8?0xeef2f6:ya>5?(ny>0.75?0xdfe6ee:0x9aa2ae):ya>2.5?(ny>0.7?0x8aa070:0x7a7468):(ny>0.6?0x5f9a50:0x766a58);   // the mountainside: rock on the faces, meadow below, snow above   // the mountainside: meadow, then rock and scree, then snow
      else if(kind===2&&hm<(cold?3.2:5.6)) hex=ny>0.8?0x4f8a44:ny>0.6?0x5a6a3c:0x6c6258;                 // wooded slopes: turf, bare earth on the steeper faces, rock on the steepest
      else if(kind===2&&hm<(cold?4.2:7.4)) hex=ny>0.7?0x7a8a5a:0x7a7062;                                      // the tree line: thin alpine turf and scree
      else if(!ash&&!sand&&(!BIO||cold||bio(x,y)===7&&hm>8.5)&&hm>(cold?3.0:kind===2?9.2:5.4)&&ny>0.35) hex=0xeef2f6; else if(!ash&&!sand&&(!BIO||cold)&&hm>(cold?2.2:kind===2?8.0:4.6)&&ny>0.8) hex=0xe2e8ee;   // snow on the tops and in the gentler hollows high up
      else if(ash) hex=ny<0.6?0x3e3834:0x524a44; else if(sand) hex=ny<0.6?0x9a7450:0xb48a5c; else hex=ny<0.55?0x6c6258:hm<1.2&&ny>0.7?0x6a8a4a:0x857868;   // rock, grassed at the foot
      C.setHex(hex).offsetHSL(0,0,jit); pos.push(...a,...b,...c); for(let i=0;i<3;i++) col.push(C.r,C.g,C.b); };
    // V113 (LOOK2): CRYSTALPEAK as a real mountain — its rock between the trails is cut finer (a quarter-tile skin), roughened
    //  inside each tile, and carved into bands: steep cliff faces with ledges between them where the snow lies; smooth-shaded,
    //  so it reads as one massif rather than facets. Where it meets the trails it meets them exactly, as before.
    const SMOOTH=[], SS=TIER*CPL/3, band=h=>{ const q=h/SS, f=q-Math.floor(q), e=f<0.42?f*0.25:f<0.88?0.105+(f-0.42)/0.46*0.88:0.985+(f-0.88)*0.125; return h+(Math.floor(q)*SS+e*SS-h)*0.75; };
    const fbm=(X,Z)=>Math.sin(X*2.1+Math.sin(Z*1.3)*1.7)*0.5+Math.sin(Z*2.7+X*0.9)*0.3+Math.sin((X-Z)*4.3)*0.2;
    list.forEach(([x,y])=>{ const k=y*W+x, kind=RK[k]; if(kind===3&&L2&&inCP(x,y)){ const HG=[]; for(let j=0;j<3;j++){ HG[j]=[]; for(let i=0;i<3;i++) HG[j][i]=reliefV(x*2+i,y*2+j); }
        const P4=(u,v)=>{ const fx=u/2, fz=v/2, i0=Math.min(1,Math.floor(fx)), j0=Math.min(1,Math.floor(fz)), tx=fx-i0, tz=fz-j0, h0=HG[j0][i0]*(1-tx)+HG[j0][i0+1]*tx, h1=HG[j0+1][i0]*(1-tx)+HG[j0+1][i0+1]*tx;
          let h=h0*(1-tz)+h1*tz, X=x+u*0.25, Z=y+v*0.25; const edge=u===0||u===4||v===0||v===4, half=u%2===0&&v%2===0;
          if(!edge&&!half){ h+=fbm(X,Z)*0.42; X+=(hsh(Math.round(X*8),Math.round(Z*8)+3)-0.5)*0.1; Z+=(hsh(Math.round(Z*8)+7,Math.round(X*8))-0.5)*0.1; } else if(!edge) h+=fbm(X,Z)*0.2;
          return [X,band(h),Z]; };
        const s0=pos.length; for(let v=0;v<4;v++) for(let u=0;u<4;u++){ const A=P4(u,v), Bq=P4(u,v+1), Cq=P4(u+1,v+1), Dq=P4(u+1,v); if((u+v)%2){ tri(A,Bq,Cq,3,x,y); tri(A,Cq,Dq,3,x,y); } else { tri(A,Bq,Dq,3,x,y); tri(Bq,Cq,Dq,3,x,y); } }
        SMOOTH.push([s0,pos.length]); return; }
      const V=(i,j)=>{ const vx=x*2+i, vy=y*2+j, ins=kind===3&&(i===1||j===1)&&!(i!==1&&j!==1)?1:0, jx=ins?(hsh(vx*7+3,vy*3+1)-0.5)*0.4:0, jz=ins?(hsh(vx*5+9,vy*11+5)-0.5)*0.4:0; return [x+i*0.5+(i===1?jx:0),reliefV(vx,vy),y+j*0.5+(j===1?jz:0)]; };
      for(let j=0;j<2;j++) for(let i=0;i<2;i++){ const A=V(i,j), B=V(i,j+1), Cc=V(i+1,j+1), Dd=V(i+1,j); if((i+j)%2){ tri(A,B,Cc,kind,x,y); tri(A,Cc,Dd,kind,x,y); } else { tri(A,B,Dd,kind,x,y); tri(B,Cc,Dd,kind,x,y); } } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); g.computeBoundingSphere();
    if(SMOOTH.length){ const nr=g.attributes.normal.array, acc=new Map(), key=i=>Math.round(pos[i]*40)+','+Math.round(pos[i+1]*40)+','+Math.round(pos[i+2]*40);   // smooth-shade the mountain's skin
      SMOOTH.forEach(([a,b])=>{ for(let i=a;i<b;i+=3){ const kk=key(i); let v=acc.get(kk); if(!v){ v=[0,0,0]; acc.set(kk,v); } v[0]+=nr[i]; v[1]+=nr[i+1]; v[2]+=nr[i+2]; } });
      SMOOTH.forEach(([a,b])=>{ for(let i=a;i<b;i+=3){ const v=acc.get(key(i)), l=Math.hypot(v[0],v[1],v[2])||1; nr[i]=v[0]/l; nr[i+1]=v[1]/l; nr[i+2]=v[2]/l; } }); g.attributes.normal.needsUpdate=true; }
    const me=new THREE.Mesh(g,reliefMat); me.receiveShadow=true; me.castShadow=true; ch.g.add(me); ch.ims.push(me); }
  lv.reliefAt=(x,y)=>inB(x,y)?RS[y*W+x]:0;
  const BLD_EAVE={chapel:2.8,keep:3.6,inn:2.5,house:1.8,shop:1.9,cottage:1.5};
  const BLD_H={chapel:4.9,keep:6.4,inn:4.1,house:3.0,shop:3.3,cottage:2.7,lighthouse:6};   // how tall each kind stands, roof and all, for the camera
  const SIGNT=new Set(); Object.keys(WD.signs||{}).forEach(k=>{ const [sx,sy]=k.split(',').map(Number); for(let b=-4;b<=4;b++) for(let a=-4;a<=4;a++) SIGNT.add((sy+b)*W+sx+a); }), NEARSIGN=(x,y)=>SIGNT.has(y*W+x);
  const ROCK_U=(()=>{ const g=new THREE.IcosahedronGeometry(0.5,1), p=g.attributes.position, key=(x,y,z)=>Math.round(x*97)+','+Math.round(y*97)+','+Math.round(z*97), off={};   // a faceted boulder, the same lumps at every shared corner
    for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i), k=key(x,y,z); if(!off[k]) off[k]=0.82+hsh(Math.round(x*50+60),Math.round(z*50+y*30+60))*0.36; let f=off[k]; p.setXYZ(i,x*f,Math.max(-0.5,y*f*(y<0?0.6:1)),z*f); }
    g.translate(0,0.3,0); g.computeVertexNormals(); return g; })(), rockMat=detailify(new THREE.MeshLambertMaterial(),{amp:0.2,strata:0.18,grit:0.14});
  const CRYSTAL_U=(()=>{ const g=new THREE.OctahedronGeometry(0.5,0); g.scale(1,1.6,1); g.translate(0,0.5,0); return g; })(), crystalMat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x2a6a80,transparent:true,opacity:0.88}), lampMat=new THREE.MeshBasicMaterial({color:0xffffff});
  const WALL_H=2.3, CONE_U=(()=>{ const g=new THREE.ConeGeometry(0.5,1,12); g.translate(0,0.5,0); return g; })(), _rh=new Map(); function rockH(x,y){ const k=y*W+x; let h=_rh.get(k); if(h!==undefined) return h; let n=0;
    for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++) if((a||b)&&T(x+a,y+b)===33) n++; let n2=0; for(const [a,b] of [[2,0],[-2,0],[0,2],[0,-2]]) if(T(x+a,y+b)===33) n2++;
    h=1.2+n*0.27+n2*0.22+hsh(x,y)*0.9; _rh.set(k,h); return h; }
  // what the camera can't see through: a building, a town wall, a tree or a cliff face taller than the ray there
  lv.camBlock=(fx,fz,y)=>{ const x=Math.floor(fx), z=Math.floor(fz); if(!inB(x,z)) return false; const t=T(x,z), top=EH(x,z); if(RK[z*W+x]) return RK[z*W+x]===3?y<AH[z*W+x]+0.4:y<top+RS[z*W+x]*0.9;
    if(typeof LOOK2!=='undefined'&&LOOK2&&!bAt.has(z*W+x)){ for(const [a2,c2] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){ const nb=bAt.get((z+c2)*W+x+a2); if(!nb||nb.id==='sg_keep'||nb.id==='sg_cathedral') continue;   // V105: the deep eaves of the new roofs overhang the footprint — keep the camera out from under them
        const ox=Math.max(nb.x-fx,fx-(nb.x+nb.w),0), oz=Math.max(nb.y-fz,fz-(nb.y+nb.h),0); if(Math.hypot(ox,oz)<0.6&&y>top+(nb.id==='home_house'?3.0:BLD_EAVE[nb.style]||1.8)-0.6&&y<top+(nb.id==='home_house'?4.9:BLD_H[nb.style]||3.2)*0.75) return true; } }
    if(bAt.has(z*W+x)){ const b=bAt.get(z*W+x), F=FACE[b.id], side=F&&(F.dir==='E'||F.dir==='W'), hw=side?b.h/2:b.w/2, ax=side?Math.abs(fz-(b.y+hw)):Math.abs(fx-(b.x+hw)), top2=b.id==='home_house'&&LOOK2?4.9:LOOK2&&/^sg_(inn|shop|home)/.test(b.id)?3.8:BLD_H[b.style]||3.2, eave=b.id==='home_house'&&LOOK2?3.0:LOOK2&&/^sg_(inn|shop|home)/.test(b.id)?2.9:BLD_EAVE[b.style]||1.8;
      if(F&&b.style==='chapel'){ const tx=F.dir==='E'?b.x+b.w-0.75:F.dir==='W'?b.x+0.75:b.x+b.w/2, tz=F.dir==='N'?b.y+0.75:F.dir==='S'?b.y+b.h-0.75:b.y+b.h/2; if(Math.abs(fx-tx)<0.95&&Math.abs(fz-tz)<0.95) return y<top+8.0; return y<top+eave+(top2-eave)*Math.max(0,1-ax/hw); }
      if(b.id==='sg_cathedral') return y<top+(ax<1.0&&Math.abs(fz-(b.y+b.h-0.75))<1.0?12:3.6+2.6*Math.max(0,1-ax/hw));                       // the cathedral's spire and high nave
      if(b.id==='sg_keep') return y<top+(Math.min(fx-b.x,b.x+b.w-fx,fz-b.y,b.y+b.h-fz)<0.9?9:ax<1.6?11:4.8);                                  // King Karl's towers, donjon and hall
      if(b.style==='chapel'&&ax<0.95&&Math.abs(fz-(b.y+b.h-0.75))<0.95) return y<top+8.0;                                                     // the bell tower
      if(b.style==='keep') return y<top+(Math.min(fx-b.x,b.x+b.w-fx,fz-b.y,b.y+b.h-fz)<0.9?7.0:top2);                                       // its corner towers and walls
      return y<top+eave+(top2-eave)*Math.max(0,1-ax/hw); }                                                                                     // the roof: eaves along the sides, the ridge down the middle
    if(t===5){ const tw=TWALL[LIFT(x,z)>1?'stormgate':region(x,z)]; return y<top+(tw?tw.h+0.6:WALL_H+0.3); } if(t===1) return y<top+2.2; if(t===33) return y<top+rockH(x,z)*0.85; if(t===98||t===69||t===70||t===71||t===77) return y<top+2.0; return y<top-0.05; };

  // ── chunks ──
  const NCX=Math.ceil(W/CHUNK), NCY=Math.ceil(H/CHUNK), chunks=[];
  for(let cy=0;cy<NCY;cy++) for(let cx=0;cx<NCX;cx++){ const g=new THREE.Group(); g.visible=false; scene.add(g);
    chunks.push({cx,cy,g,built:false,ims:[],x:cx*CHUNK+CHUNK/2,z:cy*CHUNK+CHUNK/2,sphere:new THREE.Sphere(new THREE.Vector3(cx*CHUNK+CHUNK/2,1,cy*CHUNK+CHUNK/2),CHUNK*0.75)}); }
  const chunkAt=(x,y)=>chunks[Math.min(NCY-1,Math.max(0,Math.floor(y/CHUNK)))*NCX+Math.min(NCX-1,Math.max(0,Math.floor(x/CHUNK)))];
  const L2=typeof LOOK2!=='undefined'&&LOOK2;
  const tuftMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}), boxMat=detailify(new THREE.MeshLambertMaterial()), vcMat=detailify(new THREE.MeshLambertMaterial({vertexColors:true}),{amp:0.12,strata:0,grit:0.06}), geos={};
  const geo=k=>geos[k]||(geos[k]=(TREE_GEO[k]||(k==='bush'?(L2?BUSH_GEO2:BUSH_GEO):k==='tuft'?TUFT_GEO:(L2?FENCE_GEO2:FENCE_GEO)))());
  const treeMat=L2?windSway(detailify(new THREE.MeshLambertMaterial({vertexColors:true}),{amp:0.08,strata:0,grit:0.04}),[0.045,1.2]):vcMat;
  if(L2) windSway(tuftMat,[0.35,0.0]);
  const flowerMat=L2?windSway(new THREE.MeshLambertMaterial({vertexColors:true}),[0.25,0.05]):null;
  const Q=new THREE.Quaternion(), V=new THREE.Vector3(), S3=new THREE.Vector3(), Y=new THREE.Vector3(0,1,0), Cc=new THREE.Color();
  function instList(ch,list,g,mat,cast){ if(!list.length) return; const im=new THREE.InstancedMesh(g,mat,list.length);
    list.forEach((b,i)=>{ Q.setFromAxisAngle(Y,b.ry||0); V.set(b.x,b.y,b.z); S3.set(b.sx,b.h,b.sz); M4.compose(V,Q,S3); im.setMatrixAt(i,M4); if(b.c!==undefined){ Cc.setHex(b.c); if(b.l) Cc.offsetHSL(0,0,b.l); im.setColorAt(i,Cc); } });
    im.frustumCulled=false; im.castShadow=!!cast; im.receiveShadow=true; ch.g.add(im); ch.ims.push(im); }
  /* V197: each country's own turf, run into its neighbours over a few tiles so no border is a line; the high fells whiten
     with height, the highlands grey, the dunes pale on their crests */
  const BCOL=[0x66aa5c,0x4a8a46,0xd2b984,0x77725e,0x86ac84,0x5c7a5c,0x86bc6e,0x7e9860,0x4c3c3a,0x82b458];
  const BGR=(()=>{ if(!BIO) return null; const A=new Float32Array(W*H*3), B=new Float32Array(W*H*3), C=new THREE.Color(), hi=new THREE.Color();
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const b=bio(x,y), k=(y*W+x)*3, r=ROLL?roll0(x+0.5,y+0.5):0; C.setHex(BCOL[b]||BCOL[0]);
      if(b===4) C.lerp(hi.setHex(0xe9eff3),Math.max(0,Math.min(1,(r-0.9)/2.4))); else if(b===7) C.lerp(hi.setHex(0x8f8c7c),Math.max(0,Math.min(0.75,(r-2)/5))); else if(b===2) C.lerp(hi.setHex(0xe2cc98),Math.max(0,Math.min(0.6,(r-0.6)/2.5))); else if(b===1) C.lerp(hi.setHex(0x3c7a3e),hsh(x>>2,y>>2)*0.5);
      A[k]=C.r; A[k+1]=C.g; A[k+2]=C.b; }
    /* V205: turf painted by hand (WD.turf: runs [y,x0,x1,colour,hard]) — the burnt quarter's ash, soft-edged; the sown furrows, crisp */
    const turf=(hard)=>(WD.turf||[]).forEach(([y,x0,x1,hex,hd])=>{ if(!!hd!==hard) return; C.setHex(hex); for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++){ const k=(y*W+x)*3; A[k]=C.r; A[k+1]=C.g; A[k+2]=C.b; } });
    turf(false);
    const R=3; for(let pass=0;pass<2;pass++){ const S=pass?B:A, D=pass?A:B, dx=pass?0:1, dy=pass?1:0;
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ let r=0,g=0,b=0,n=0; for(let i=-R;i<=R;i++){ const X=x+i*dx, Y=y+i*dy; if(X<0||Y<0||X>=W||Y>=H) continue; const q=(Y*W+X)*3; r+=S[q]; g+=S[q+1]; b+=S[q+2]; n++; } const k=(y*W+x)*3; D[k]=r/n; D[k+1]=g/n; D[k+2]=b/n; } }
    turf(true); return A; })(), _bgc=new THREE.Color();
  const grassOf=(x,y)=>{ if(BGR&&x>=0&&y>=0&&x<W&&y<H){ const k=(y*W+x)*3; return _bgc.setRGB(BGR[k],BGR[k+1],BGR[k+2]).getHex(); } if(desert(x,y)) return 0xcdb47e; if(ashland(x,y)) return 0x77725e; return GRASS[region(x,y)]||0x5fa860; };
  function treeKind(x,y){ if(desert(x,y)){ if(BIO) for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[2,0],[0,2],[-2,0],[0,-2]]){ const q=T(x+a,y+b); if(q===3||q===20) return 'palm'; } return 'cactus'; } if(ashland(x,y)) return 'charred'; const r=region(x,y);
    if(BIO){ const b=bio(x,y), hh=hsh(x,y); if(b===4) return (ROLL?roll0(x+0.5,y+0.5):0)>0.9||hh<0.35?'snow':'pine'; if(b===5) return 'mere'; if(b===7) return hh<0.75?'pine':'oak'; if(b===1) return hh<0.42?'pine':hh>0.9?'birch':'oak'; if(b===6&&hh<0.22) return 'palm'; if(b===9||b===0) return hh<0.12?'pine':hh>0.8?'birch':'oak'; }
    if(opt.land) return hsh(x,y)<0.5?'oak':'pine';
    if(r==='crystalpeak'||r==='hellgate') return 'snow'; if(r==='shadowmere') return 'mere'; if(r==='saltmere'&&hsh(x,y)<0.3) return 'palm';
    for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0]]){ const q=T(x+a,y+b); if(q===7) return 'pine'; if(q===22) return 'snow'; } const hh=hsh(x,y); return hh<0.5?'pine':(typeof LOOK2!=='undefined'&&LOOK2&&hh>0.84&&(r==='hearthvale'||r==='stormgate'||r==='mistral'||r==='crystalpeak'))?'birch':'oak'; }
  // ── the ground ── every whole-tile column of a chunk becomes one mesh: a top split in four whose colours run into the
  // neighbours at the same height (so a road wears into the grass, a square into its verges, with no seams between tiles),
  // and side faces only where the ground steps down, each band coloured by the column it belongs to
  const groundMat=detailify(new THREE.MeshLambertMaterial({vertexColors:true})), _gc=new THREE.Color(), _gd=new THREE.Color();
  function groundMesh(ch,cells,mcells){ if(!cells.size) return; const pos=[], col=[], nrm=[];
    [cells,mcells].forEach(M=>M.forEach(q=>{ q.segs.sort((a,b)=>a[1]-b[1]); const t=q.segs[q.segs.length-1]; q.top=t[1]; q.bot=q.segs[0][0]; _gc.setHex(t[2]); if(t[3]) _gc.offsetHSL(0,0,t[3]); q.c=[_gc.r,_gc.g,_gc.b]; if(inCP(q.x,q.y)&&q.top>3.5&&T(q.x,q.y)!==24&&T(q.x,q.y)!==18){ const f=Math.min(1,Math.max(0,(q.top-3.5)/5.5)); q.c=[q.c[0]+(0.93-q.c[0])*f,q.c[1]+(0.95-q.c[1])*f,q.c[2]+(0.97-q.c[2])*f]; } }));   // the high ledges of Crystalpeak lie under snow
    const at=(x,y)=>cells.get(y*W+x)||mcells.get(y*W+x), same=(q,x,y)=>{ const n=at(x,y); return n&&Math.abs(n.top-q.top)<0.03?n:null; };
    const quad=(a,b,c,d,ca,cb,cc,cd,n)=>{ pos.push(...a,...b,...c,...a,...c,...d); col.push(...ca,...cb,...cc,...ca,...cc,...cd); for(let i=0;i<6;i++) nrm.push(...n); };
    const avg=(list)=>{ const r=[0,0,0]; list.forEach(c=>{ r[0]+=c[0]; r[1]+=c[1]; r[2]+=c[2]; }); return r.map(v=>v/list.length); };
    const UP=[0,1,0];
    // the water's edge: low ground slopes down to meet the water in a muddy (or sandy) bank that bulges out over it, and the water
    // paler in the shallows along it — so a river or a shore is never a straight wall of tile edges
    const wet=q=>q.top<0.0&&q.c[2]>q.c[0]*1.15, wl=(x,y)=>{ const n=at(x,y); if(n) return wet(n)?n.top:null; return !opt.land||opt.land!=='sunfall'?(T(x,y)===3?-0.3:null):null; };
    const cornerWL=(cx,cy)=>{ let m=null; for(const [a,b] of [[0,0],[-1,0],[0,-1],[-1,-1]]){ const w=wl(cx+a,cy+b); if(w!==null&&(m===null||w<m)) m=w; } return m; };
    const mixc=(c,d,f)=>[c[0]+(d[0]-c[0])*f,c[1]+(d[1]-c[1])*f,c[2]+(d[2]-c[2])*f], MUD=[0.6,0.53,0.38], SAND=[0.84,0.76,0.56], SHALLOW=[0.48,0.75,0.78], SEA=[0.18,0.44,0.61];
    const tri=(a,b,c,ca,cb,cc)=>{ pos.push(...a,...b,...c); col.push(...ca,...cb,...cc); const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2]; let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; const l=Math.hypot(nx,ny,nz)||1; for(let i=0;i<3;i++) nrm.push(nx/l,ny/l,nz/l); };
    cells.forEach(q=>{ const {x,y}=q, h=q.top, C=q.c, W0=wet(q);
      const E=(dx,dy)=>{ const n=same(q,x+dx,y+dy); return n?avg([C,n.c]):C; };
      const K=(dx,dy)=>{ const l=[C]; [[dx,0],[0,dy],[dx,dy]].forEach(([a,b])=>{ const n=same(q,x+a,y+b); if(n) l.push(n.c); }); return avg(l); };
      const cN=E(0,-1), cS=E(0,1), cW=E(-1,0), cE=E(1,0), cNW=K(-1,-1), cNE=K(1,-1), cSW=K(-1,1), cSE=K(1,1), m=0.5;
      const sat=(Math.max(...C)-Math.min(...C))/Math.max(0.001,Math.max(...C)), bankOK=!W0&&h<0.3&&sat>0.2,   // natural ground only — a stone quay keeps its edge
            bank=c=>(desert(x,y)||c[0]>0.7&&c[1]>0.6&&c[2]<0.55)?SAND:MUD;
      // the nine points of the top: [u,v,colour], lowered and pushed where they meet water
      const pts={}; const pt=(u,v,c)=>{ let px=x+u, pz=y+v, py=h, cc=c;
        if(bankOK){ const onC=(u===0||u===1)&&(v===0||v===1);
          if(onC){ const w=cornerWL(x+u,y+v); if(w!==null&&h-w<0.45){ py=w+0.012; cc=mixc(c,bank(c),0.6); } }
          else if(u!==m||v!==m){ const dx=u===0?-1:u===1?1:0, dy=v===0?-1:v===1?1:0, w=wl(x+dx,y+dy);
            if(w!==null&&h-w<0.45){ const push=0.1+hsh(x*7+dx*3+40,y*5+dy*3+40)*0.28; px+=dx*push; pz+=dy*push; py=w+0.012; cc=mixc(c,bank(c),0.75); } } }
        else if(W0&&(u!==m||v!==m)&&(()=>{ const onC=(u===0||u===1)&&(v===0||v===1), dx=u===0?-1:u===1?1:0, dy=v===0?-1:v===1?1:0;   // shallows running out into the open sea: no step, they shelve away
            const sea=(a,b)=>!at(a,b)&&T(a,b)===3; if(onC?[[0,0],[-1,0],[0,-1],[-1,-1]].some(([a,b])=>sea(x+u+a,y+v+b)):sea(x+dx,y+dy)){ py=-0.295; cc=mixc(c,SEA,0.55); return true; } return false; })()){}
        else if(W0&&(u!==m||v!==m)){ const nb=[[u===0?-1:u===1?1:0,0],[0,v===0?-1:v===1?1:0],[u===0?-1:u===1?1:0,v===0?-1:v===1?1:0]].filter(([a,b])=>a||b);
          if(nb.some(([a,b])=>{ const n=at(x+a,y+b); return n&&!wet(n)&&n.top<0.3; })) cc=mixc(c,SHALLOW,0.35); }
        if(ROLL&&!W0){ const r=roll0(px,pz)+softOff(Math.min(x+0.999,Math.max(x,x+u)),Math.min(y+0.999,Math.max(y,y+v))); if(Math.abs(r)>0.001){ py+=r; }
          const sat=(Math.max(...cc)-Math.min(...cc))/Math.max(0.001,Math.max(...cc));
          if(sat>0.25&&cc[1]>cc[0]&&cc[1]>cc[2]){ const n=0.5+0.35*Math.sin(px*0.37+Math.sin(pz*0.21)*2)*Math.cos(pz*0.29)+0.15*Math.sin((px+pz)*1.1), h=Math.min(1,r/1.6);   // painted meadow: broad patches of lighter and deeper green, sunlit swell-tops warmer
            cc=[cc[0]*(0.9+0.2*n)+0.05*h,cc[1]*(0.92+0.16*n)+0.03*h,cc[2]*(0.85+0.15*n)-0.03*h]; }
          if(OW&&r>1.2){ const mw=OW.m(px,pz); if(mw>0){ const gx=roll(px+0.5,pz)-roll(px-0.5,pz), gz=roll(px,pz+0.5)-roll(px,pz-0.5), st=Math.min(1,Math.hypot(gx,gz)/0.8);   // V119: up on the hills the turf thins
              const up=Math.min(1,(r-1.2)/6)*mw, sandy=cc[0]>0.7&&cc[1]>0.6&&cc[2]<0.55; const to=sandy?[0.86,0.74,0.52]:r>8?[0.93,0.95,0.98]:r>6?[0.55,0.56,0.44]:[0.42,0.56,0.3];   // V120: snow on the high tops
              cc=mixc(cc,to,r>8?Math.min(1,0.6+(r-8)*0.15):up*0.55); if(!sandy&&st>0.55) cc=mixc(cc,[0.52,0.48,0.42],(st-0.55)*1.4*mw); } } }
        return {p:[px,py,pz],c:cc}; };
      const V=[[pt(0,0,cNW),pt(m,0,cN),pt(1,0,cNE)],[pt(0,m,cW),pt(m,m,C),pt(1,m,cE)],[pt(0,1,cSW),pt(m,1,cS),pt(1,1,cSE)]];
      const rolled=ROLL&&!W0&&[0,0.5,1].some(u=>[0,0.5,1].some(v=>Math.abs(roll(x+Math.min(u,0.999),y+Math.min(v,0.999)))>0.001));
      for(let j=0;j<2;j++) for(let i=0;i<2;i++){ const A=V[j][i], B=V[j+1][i], Cq=V[j+1][i+1], D=V[j][i+1]; tri(A.p,B.p,Cq.p,A.c,B.c,Cq.c); tri(A.p,Cq.p,D.p,A.c,Cq.c,D.c);
        if(rolled){ const L=nrm.length; [A,B,Cq,A,Cq,D].forEach((P0,k)=>{ const ex=0.25, gx=(roll(P0.p[0]+ex,P0.p[2])-roll(P0.p[0]-ex,P0.p[2]))/(2*ex), gz=(roll(P0.p[0],P0.p[2]+ex)-roll(P0.p[0],P0.p[2]-ex))/(2*ex), l=Math.hypot(gx,1,gz);
          nrm[L-18+k*3]=-gx/l; nrm[L-18+k*3+1]=1/l; nrm[L-18+k*3+2]=-gz/l; }); } }   // soft normals: the swells shade smoothly, not in facets
      const banked=(dx,dy)=>(bankOK&&wl(x+dx,y+dy)!==null&&h-wl(x+dx,y+dy)<0.45)||(W0&&!at(x+dx,y+dy)&&T(x+dx,y+dy)===3);
      for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){ if(banked(dx,dy)||softEdge(x,y,dx,dy)) continue; const n=at(x+dx,y+dy), from=Math.max(n?n.top:q.bot,q.bot); if(from>=h-0.001) continue;
        const N=[dx,0,dy], a=dx?(dx>0?[x+1,y+1]:[x,y]):(dy>0?[x,y+1]:[x+1,y]), b=dx?(dx>0?[x+1,y]:[x,y+1]):(dy>0?[x+1,y+1]:[x,y]);
        if(typeof LOOK2!=='undefined'&&LOOK2&&inCP(x,y)&&h-from>0.5){   // V113: Crystalpeak's drops are rock faces — cut in rows, pushed in and out, banded grey; edges meet as before
          const NR=Math.max(2,Math.round((h-from)/0.32)), NC=4, RC=[[0.52,0.53,0.58],[0.46,0.47,0.52],[0.58,0.59,0.64],[0.5,0.5,0.54]];
          const P=(u,r)=>{ const X=a[0]+(b[0]-a[0])*u, Z=a[1]+(b[1]-a[1])*u, Y=from+(h-from)*r/NR; const inner=u>0&&u<1&&r<NR; const n=inner?(Math.sin(X*3.1+Y*1.7)*0.5+Math.sin(Z*2.3-Y*2.9)*0.35+Math.sin((X+Z)*5.1+Y)*0.15):0, push=inner?0.05+n*0.12:0; return [X+dx*push,Y+(inner?n*0.05:0),Z+dy*push]; };
          for(let r=0;r<NR;r++){ const cc=RC[(Math.floor((from+(h-from)*r/NR)/0.32)+x+y)&3], ct=r===NR-1?[0.72,0.74,0.8]:cc; for(let u=0;u<NC;u++){ const p0=P(u/NC,r), p1=P((u+1)/NC,r), p2=P((u+1)/NC,r+1), p3=P(u/NC,r+1); tri(p0,p1,p2,cc,cc,ct); tri(p0,p2,p3,cc,ct,ct); } }
          continue; }
        q.segs.forEach(sg=>{ const y0=Math.max(sg[0],from), y1=Math.min(sg[1],h); if(y1-y0<0.002) return; _gd.setHex(sg[2]); if(sg[3]) _gd.offsetHSL(0,0,sg[3]); const lip=y1>=h-0.001;
          const cl=[_gd.r*0.9,_gd.g*0.9,_gd.b*0.9], ct=lip?[_gd.r,_gd.g,_gd.b]:cl;
          quad([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],cl,cl,ct,ct,N); }); } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.computeBoundingSphere(); const me=new THREE.Mesh(g,groundMat); me.receiveShadow=true; me.castShadow=true; ch.g.add(me); ch.ims.push(me); }
  function buildChunk(ch,tilesOnly){ ch.built=true; const boxes=[], trees={}, bush=[], fence=[], lava=[], x0=ch.cx*CHUNK, y0=ch.cy*CHUNK;
    const cellsIn=new Map(), cells=cellsIn, mcells=new Map(), box=(x,z,y,h,c,sx,sz,ry,l)=>{ sx=sx||1; sz=sz||1; const fx=Math.floor(x), fz=Math.floor(z), cells=MG?mcells:cellsIn;
        if(sx===1&&sz===1&&!ry&&Math.abs(x-fx-0.5)<1e-4&&Math.abs(z-fz-0.5)<1e-4){ const kk=fz*W+fx; let q=cells.get(kk); if(!q) cells.set(kk,q={x:fx,y:fz,segs:[]}); q.segs.push([y,y+h,c,l||0]); return; }   // a whole tile's column: part of the ground mesh
        boxes.push({x,z,y,h,c,sx,sz,ry,l}); }, tufts=[], cones=[], rocks=[], relief=[], crystals=[], lamps=[], flowers=[];
    let MG=false; const snap=()=>[boxes.length,bush.length,fence.length,lava.length,tufts.length,cones.length,rocks.length,crystals.length,lamps.length,Object.fromEntries(Object.entries(trees).map(([k,l])=>[k,l.length]))];
    const unsnap=S=>{ boxes.length=S[0]; bush.length=S[1]; fence.length=S[2]; lava.length=S[3]; tufts.length=S[4]; cones.length=S[5]; rocks.length=S[6]; crystals.length=S[7]; lamps.length=S[8]; Object.keys(trees).forEach(k=>trees[k].length=S[9][k]||0); };
    for(let y=Math.max(0,y0-1);y<Math.min(H,y0+CHUNK+1);y++) for(let x=Math.max(0,x0-1);x<Math.min(W,x0+CHUNK+1);x++){ MG=x<x0||y<y0||x>=x0+CHUNK||y>=y0+CHUNK; const S0=MG?snap():null;   // a one-tile margin from the neighbours, read only so the ground meets theirs
     try{ const t=T(x,y), e=E(x,y), k=y*W+x, cx=x+0.5, cz=y+0.5, top=e*TIER*LIFT(x,y)+0.02, sg=LIFT(x,y)>1, jit=(hsh(x,y)-0.5)*0.05;
      if(t===3||(t>=36&&t<=38)) continue;
      // Mistral's own tiles (drawMistralTile): dry-stone walls, gorse, standing stones, stone bases, sea stacks
      if(t===90){ box(cx,cz,top-0.4,0.4,grassOf(x,y),1,1,0,jit); box(cx,cz,top,0.62,0x9a948a,0.9,0.9,0,(hsh(x,y)-0.5)*0.1); box(cx,cz,top+0.62,0.1,0x8a847a,0.95,0.95,0); continue; }
      if(t===93){ box(cx,cz,top-0.4,0.4,grassOf(x,y),1,1,0,jit); bush.push({x:cx,z:cz,y:top,h:0.7,sx:0.9,sz:0.9,ry:hsh(x,y)*6}); box(cx+0.1,cz+0.1,top+0.55,0.08,0xf0c840,0.3,0.3); continue; }
      if(t===94){ box(cx,cz,top-0.4,0.4,grassOf(x,y),1,1,0,jit); box(cx,cz,top,1.9+hsh(x,y)*0.5,0x8a8a90,0.45,0.32,hsh(y,x)*3,0); continue; }
      if(t===95){ box(cx,cz,top-0.4,0.4+0.12,0x8a8478,1,1,0,jit); continue; }
      if(t===97){ box(cx,cz,-0.6,1.6+hsh(x,y)*1.2,0x6a665e,0.85,0.85,hsh(x,y)*2,jit); continue; }
      // Mount Tabor's own tiles (drawTaborTile / the alpine rework), frozen or thawed (opt.thawed)
      // (the overworld's own Mount Tabor, x 72–118 · y 252–299, is drawn the same way, and thaws with the world behind its gate)
      if((opt.land==='tabor'||(!opt.land&&x>=SX(72)&&x<=SX(118)&&y>=SY(252)&&y<=SY(299)))&&TABOR_TILE(t)){ const th=opt.land?(typeof opt.thawed==='function'?!!opt.thawed(x,y):!!opt.thawed):!!(opt.taborThawed&&opt.taborThawed());
        if(e) box(cx,cz,-0.4,top-0.12+0.4,th?0x8a7a62:0x8e9cae,1,1,0,(hsh(y,x)-0.5)*0.08);
        const floor=c=>box(cx,cz,top-0.4,0.4,c,1,1,0,jit), snowC=th?0x7ab65a:0xdde5ee;
        if(MS[k]&&(t===32||t===99||t===100)){ floor(th?(t===32?0x7a6e5e:0x4aa0d0):(t===32?0x8e96a2:0xcfe8f4)); continue; }   // V124: on the one mountain the old terrace drops are bands of crag in the slope
        if(t===22||t===16||t===64||t===65){ floor(snowC); if(th&&t===22&&hsh(x,y)<0.12) box(cx+(hsh(y,x)-0.5)*0.6,cz,top,0.05,[0xf4f4f4,0xf0c040,0xe04a6a,0xa06ae0][(x+y)%4],0.07,0.07); continue; }
        if(t===61){ floor(th?0x8cc070:0xbfdcec); continue; }
        if(t===34){ floor(th?0x9a7a58:0x8e98a8); if(!th&&(x*7+y*13)%9===0) box(cx+0.38,cz+0.38,top,0.55,0xd8642a,0.06,0.06); continue; }   // the packed trail, darker than the snow, a marker pole now and then
        if(t===19){ floor(th?0xe2cf98:0xd8d4c8); continue; }
        if(t===63){ floor(th?0x5cc86a:0xc4ccc0); if(th&&hsh(x,y)<0.35) box(cx+(hsh(y,x)-0.5)*0.6,cz+(hsh(x,y*3)-0.5)*0.6,top,0.05,[0xff8ab0,0xfff070,0xffe0f0,0xc8a0f0][(x*3+y)%4],0.07,0.07); continue; }
        if(t===62&&MS[k]){ floor(th?0x5ab8e8:0xcfeaf8); continue; }   // V125: on a slope the frozen stream lies in the land as ice
        if(t===62){ floor(th?0x5ab8e8:0xd8f0ff); box(cx,cz,top,th?0.08:0.5,th?0xeaf8ff:0xcfeaf8,th?0.9:0.8,th?0.9:0.8,0,(hsh(y,x)-0.5)*0.05); continue; }
        if(t===75||t===100){ box(cx,cz,top-0.45,0.4,th?0x4aa0d0:0xcfe8f4,1,1,0,jit); continue; }
        if(t===99){ box(cx,cz,top-0.9,0.4,th?0x4aa0d0:0x2a4a6a,1,1,0,jit); continue; }
        if(t===98){ floor(snowC); const byWay=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>WK(x+a,y+b)), s=byWay?0.62:1;   // a fir beside the way is drawn slim, so it never seems to stand in it
          (trees[th?'pine':'snow']=trees[th?'pine':'snow']||[]).push({x:cx,z:cz,y:top,h:(0.95+hsh(x,y)*0.4)*(byWay?0.85:1),sx:s,sz:s,ry:hsh(x,y)*6}); continue; }
        if(t===68){ box(cx,cz,-0.12,0.1,(x%2)?0x8a6a48:0x7e6040,1,1,0,jit); continue; }
        if(t===73){ box(cx,cz,-0.12,0.14,0xeef6fa,0.85,0.85,hsh(x,y),jit); continue; }
        if(t===69||t===71||t===77){ floor(snowC); box(cx,cz,top,1.5,0x7a5a3a,1,1,0,jit); for(let i=1;i<5;i++) box(cx,cz,top+i*0.3-0.03,0.05,0x5a4028,1.02,1.02); box(cx,cz,top,0.18,0x6a6460,1.04,1.04);   // log courses on a stone sill
          if(t===71) box(cx,cz+0.5,top+0.6,0.4,0xffd27a,0.45,0.04); if(t===77) box(cx,cz+0.5,top,1.05,0x4a3220,0.5,0.04); continue; }
        if(t===70){ floor(snowC); box(cx,cz,top,1.5,0x7a5a3a,1,1,0,jit); for(let i=1;i<5;i++) box(cx,cz,top+i*0.3-0.03,0.05,0x5a4028,1.02,1.02); box(cx,cz,top+1.45,0.12,0x4a3220,1.24,1.24); box(cx,cz,top+1.57,0.4,th?0x8a4a36:0xf2f6fa,1,1,0,jit); continue; }   // eaves overhanging, then the roof (one sheet with its neighbours)
        if(t===72){ floor(th?0xe2cf98:0xd8d4c8); box(cx,cz,top,0.8,0x8a6a48,0.9,0.7); box(cx,cz,top+1.5,0.08,(x%2)?0xc84a3a:0xf4eee0,1.0,0.9); box(cx-0.42,cz,top,1.5,0x6a4a2e,0.06,0.06); box(cx+0.42,cz,top,1.5,0x6a4a2e,0.06,0.06); continue; }
        if(t===74){ floor(th?0xe2cf98:0xd8d4c8); box(cx,cz,top,0.6,0x8a6a40,0.7,0.7,hsh(x,y)); continue; }
      }
      // Sunfall's own tiles (drawSunfallTile): ledges of warm stone over a drop to a wine-dark sea
      if(opt.land==='sunfall'){ if(t===81) continue;
        { /* V133: the ledges are floating rock, not slabs on posts — a keel under every arm, deepest at its middle, and on the
             open face, strata of warm sandstone stepping back as they go down, with crags breaking out of them */
          let dE=5; for(let r=1;r<=4&&dE===5;r++){ for(let q=-r;q<=r&&dE===5;q++){ if(T(x+q,y-r)===81||T(x+q,y+r)===81||T(x-r,y+q)===81||T(x+r,y+q)===81) dE=r; } }
          const h0=hsh(x*7,y*3), h1=hsh(y*5,x*11), bot=-(3.6+Math.min(dE,4)*2.1+h0*1.4);
          const SC=[0x7e5638,0x6c4832,0x8e6646,0x624230,0x74503a];
          if(dE===1){ const out=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>T(x+a,y+b)===81); const ox=out.reduce((s,q)=>s+q[0],0), oz=out.reduce((s,q)=>s+q[1],0);
            /* the strata run level along the whole face (bands of 1.1, one colour each), each stepping back a little */
            let y1=top-0.4; for(let i=0;y1>bot+0.2;i++){ const band=Math.floor((y1-0.001+40)/1.1), yb=Math.max(bot,band*1.1-40), hh=y1-yb, ins=Math.min(0.55,i*0.06+hsh(x*3+i,y)*0.05), sx=1-Math.abs(ox)*ins, sz=1-Math.abs(oz)*ins;
              box(cx-ox*ins/2,cz-oz*ins/2,yb,hh,SC[((band%SC.length)+SC.length)%SC.length],sx,sz,0,jit*0.4+(hsh(x,y+i)-0.5)*0.03); y1=yb; }
            if(h1<0.5&&!tilesOnly){ const r=hsh(x*13,y*17); rocks.push({x:cx+ox*(0.42+r*0.12),z:cz+oz*(0.42+r*0.12),y:top-1.6-r*3.2,h:0.9+r*1.4,sx:0.55+r*0.5,sz:0.45+h0*0.4,ry:r*17,c:SC[(x+y)%SC.length]}); }
            if(h0<0.12&&!tilesOnly){ const r=hsh(x*19,y*23); rocks.push({x:cx+ox*0.3,z:cz+oz*0.3,y:bot-0.9-r*1.5,h:1.2+r*1.8,sx:0.35+r*0.3,sz:0.3+r*0.25,ry:r*11,c:0x5e3e2c}); } }
          else box(cx,cz,bot,(top-0.4)-bot,0x5a3c2c,1,1,0,jit*0.3); }
        const fl=c=>box(cx,cz,top-0.4,0.4,c,1,1,0,jit);
        if(t===6||t===83||t===85||t===86||t===87||t===84||t===82){ fl(0xb4966f); continue; }
        if(t===25){ fl(0x8a7466); continue; } if(t===27){ fl(0x7a6656); box(cx,cz,top,0.01,0x4a3a30,0.7,0.06,hsh(x,y)*3); continue; }
        if(t===2){ fl(0xd0b070); continue; } if(t===53){ fl((x+y)%2?0xe8c050:0xd8b040); continue; }
        if(t===80){ fl(0xa88a68); const F=(a,b)=>T(x+a,y+b)===80, ew=F(1,0)||F(-1,0), ns=F(0,1)||F(0,-1), lone=!ew&&!ns;   // a balustrade along the ledge: plinth, turned balusters, a moulded rail
          if(lone){ box(cx,cz,top,0.75,0xc0a07a,0.42,0.42); box(cx,cz,top+0.75,0.1,0xd8b890,0.52,0.52); continue; }
          const L=(a,w2,h2,c,y2)=>{ if(ew) box(cx,cz,y2,h2,c,a,w2); if(ns) box(cx,cz,y2,h2,c,w2,a); };
          L(1.0,0.4,0.12,0xa88a68,top); L(1.0,0.3,0.12,0xd8b890,top+0.6); L(1.02,0.36,0.05,0xe0c49a,top+0.72);
          for(const f of [-0.33,0,0.33]){ const bx=ew?cx+f:cx, bz=ns&&!ew?cz+f:cz; box(bx,bz,top+0.12,0.48,0xc8a880,0.12,0.12); box(bx,bz,top+0.3,0.1,0xd8b890,0.17,0.17); }
          if((x+y)%3===0) box(cx,cz,top,0.86,0xc0a07a,0.34,0.34); continue; }
      }
      if(t===24&&!opt.land){ const sp=(a,b)=>T(x+a,y+b)===24;   // Crystalpeak's hot spring: a sunken pool, a rim of frosted stone, crystals standing in it
        box(cx,cz,-0.4,top-0.28+0.4,0x4fb4c8,1,1,0,jit*0.2);
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([a,b],i)=>{ if(sp(a,b)) return; const rx=a?cx+a*0.42:cx, rz=b?cz+b*0.42:cz; box(rx,rz,top-0.3,0.46,i%2?0xb8c2ce:0xd0d8e2,a?0.18:1.04,a?1.04:0.18,0,(hsh(x+i,y)-0.5)*0.05);
          if(hsh(x*3+i,y*7)<0.45) crystals.push({x:rx+(b?(hsh(y,x+i)-0.5)*0.6:0),z:rz+(a?(hsh(x,y+i)-0.5)*0.6:0),y:top+0.05,h:0.5+hsh(x+i*3,y)*0.6,sx:0.16,sz:0.16,ry:hsh(x,y+i)*3,c:i%2?0x9adcf0:0xc8f0ff}); });
        continue; }
      if(RK[k]===3&&!MG&&!tilesOnly){ const r=hsh(x*5,y*9); if(r<0.32) rocks.push({x:cx+(hsh(y,x*3)-0.5)*0.5,z:cz+(r-0.16)*0.8,y:AH[k]-1.1-r,h:1.6+r*2.2,sx:1.1+r*1.2,sz:0.55+hsh(x,y)*0.4,ry:r*19,c:AH[k]>7?0x8a929e:0x6e6458,l:(r-0.16)*0.1}); }   // crags breaking out of the mountainside
      if(RK[k]===3&&!MG&&t===1&&!tilesOnly&&AH[k]<9){ const sc=0.8+hsh(x,y)*0.3; (trees.snow=trees.snow||[]).push({x:cx,z:cz,y:reliefV(x*2+1,y*2+1)-0.05,h:sc,sx:sc,sz:sc,ry:hsh(x,y)*6,rv:1}); }   // firs on the mountainside
      if(!MG&&!tilesOnly&&inCP(x,y)&&WK(x,y)&&!RK[k]&&!SD.has(k)){ const dn=[[1,0],[-1,0],[0,1],[0,-1]].find(([a,b])=>RK[(y+b)*W+x+a]===3&&AH[(y+b)*W+x+a]<top-0.3);   // the trail's edge: a marker pole now and then, a red rag on it
        if(dn&&hsh(x*11,y*13)<0.16){ const px=cx+dn[0]*0.4, pz=cz+dn[1]*0.4; box(px,pz,top,1.15,0x5a4028,0.07,0.07); box(px+0.11,pz,top+0.95,0.16,0xc84a3a,0.2,0.03); } }
      if(RK[k]){ if(!MG){ relief.push([x,y]); if(RK[k]===2&&!tilesOnly&&RH[k]<(region(x,y)==='crystalpeak'?3.2:5.8)-hsh(y,x*3)*0.8){ const hi=RH[k]>3.4, kk=hi?'snow':treeKind(x,y), sc=(0.85+hsh(x,y)*0.35)*(hi?0.8:1), hy=reliefV(x*2+1,y*2+1); (trees[kk]=trees[kk]||[]).push({x:cx+(hsh(y,x)-0.5)*0.2,z:cz,y:hy-0.05,h:sc,sx:sc,sz:sc,ry:hsh(x,y)*6,rv:1}); } } continue; }   // the high ground is its own mesh
      if(e) box(cx,cz,-0.4,top-0.12+0.4,0x9a958c,1,1,0,(hsh(y,x)-0.5)*0.08);
      if(bAt.has(k)){ box(cx,cz,top-0.4,0.4,0x6e6458,1,1,0,jit); continue; }
      // ── Stormgate's harbour: a stone quay with bollards and lamps, piers on pilings, a mole with a parapet and rip-rap,
      //    lighthouses at the harbour mouth, and timber cranes on the pier-heads ──
      if(sg&&!dAt.has(k)&&y>=SY(228)){ const sea=(a,b)=>T(x+a,y+b)===3;
        if(t===5&&y>=SY(237)&&(sea(0,1)||sea(1,0)||sea(-1,0))&&(sea(1,0)||sea(-1,0))){   // a lighthouse where the mole ends at the harbour mouth
          box(cx,cz,-0.6,top+0.6,0x8a8c94,1.2,1.2); for(let i=0;i<5;i++) box(cx,cz,top+i*1.5,1.5,i%2?0xf2f0ea:0xb8402e,0.95-i*0.05,0.95-i*0.05);
          box(cx,cz,top+7.5,0.16,0x3a3a40,1.35,1.35); for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) box(cx+a*0.6,cz+b*0.6,top+7.66,0.4,0x3a3a40,0.05,0.05);
          lamps.push({x:cx,z:cz,y:top+7.66,h:0.9,sx:0.6,sz:0.6,c:0xffe08a}); cones.push({x:cx,z:cz,y:top+8.56,h:1.0,sx:0.95,sz:0.95,c:0x2c4c9e}); box(cx,cz,top+9.5,0.5,0x3a2a1a,0.05,0.05); continue; }
        if(t===5&&y===236){   // a stone pier-head, and a crane on it
          box(cx,cz,-0.6,top+1.6,0xa8aab0,1,1); box(cx,cz,top+1.0,0.14,0x8a8c94,1.1,1.1); const dir=T(x+1,y)===12?1:-1;
          box(cx,cz,top+1.14,2.8,0x6a4a2e,0.22,0.22); box(cx+dir*0.9,cz,top+3.7,0.18,0x6a4a2e,2.2,0.16); box(cx-dir*0.25,cz,top+3.1,0.7,0x5a3e26,0.12,0.12);   // mast, jib, a brace
          box(cx+dir*1.8,cz,top+1.9,1.8,0x2a2018,0.03,0.03); box(cx+dir*1.8,cz,top+1.45,0.45,0x9a6b3f,0.5,0.5); box(cx-dir*0.05,cz,top+1.14,0.5,0x4a3a2a,0.55,0.55); continue; }
        if(t===12){   // a pier: boards with gaps between, on pilings, over the harbour water
          box(cx,cz,-0.6,0.28,0x2f6f9c,1,1);
          const along=T(x,y-1)===12||T(x,y+1)===12; for(let i=0;i<4;i++){ const f=-0.375+i*0.25; box(along?cx+f:cx,along?cz:cz+f,top-0.14,0.14,i%2?0x8a6a42:0x7c5e3a,along?0.22:1,along?1:0.22); }
          for(const [a,b] of [[-0.44,-0.44],[0.44,-0.44],[-0.44,0.44],[0.44,0.44]]){ if(sea(Math.sign(a),0)||sea(0,Math.sign(b))) box(cx+a,cz+b,-0.7,top+0.85,0x4a3422,0.16,0.16); }
          if((y%3===0)&&(sea(1,0)||sea(-1,0))){ const sd=sea(1,0)?1:-1; box(cx+sd*0.4,cz,top,0.36,0x2a2a30,0.16,0.16); box(cx+sd*0.4,cz,top+0.36,0.06,0x3a3a40,0.22,0.22); }   // a bollard
          continue; }
        if(t===6&&(sea(0,1)||sea(0,-1))){ const sd=sea(0,1)?1:-1;   // the quay's edge, or the mole's
          box(cx,cz,top-0.4,0.4,0xb3ada2,1,1); box(cx,cz+sd*0.38,top-0.02,0.2,0xd0ccc2,1.02,0.26);                            // flags, and a coping of dressed granite
          box(cx,cz+sd*0.52,-0.7,top+0.66,0x8a867e,1.02,0.08);                                                                  // the quay wall down into the water
          if(y>=SY(238)){ box(cx,cz+sd*0.42,top,0.55,0xa8a49b,1.02,0.2); rocks.push({x:cx+(hsh(x,y)-0.5)*0.4,z:cz+sd*1.05,y:-0.7,h:0.9+hsh(y,x)*0.5,sx:1.1,sz:0.9,ry:hsh(x,y)*6,c:0x7a7870,l:0}); }   // the mole: a parapet, and rip-rap against the sea
          else { if(x%3===0){ box(cx,cz+sd*0.3,top,0.34,0x2a2a30,0.16,0.16); box(cx,cz+sd*0.3,top+0.34,0.06,0x3a3a40,0.22,0.22); }
            if(x%6===3){ box(cx,cz+sd*0.3,top,2.3,0x2a2a30,0.08,0.08); box(cx,cz+sd*0.3,top+2.3,0.12,0x2a2a30,0.32,0.32); lamps.push({x:cx,z:cz+sd*0.3,y:top+1.96,h:0.34,sx:0.22,sz:0.22,c:0xffd27a});
              box(cx+0.12,cz+sd*0.3,top+1.1,0.8,0x2c4c9e,0.02,0.32); box(cx+0.12,cz+sd*0.3,top+1.04,0.06,0xf2c14e,0.025,0.32); } }   // lamp posts hung with the royal blue
          continue; } }
      const TWk=t===5&&!dAt.has(k)?(sg?'stormgate':region(x,y)):null, tw=TWk&&TWALL[TWk];
      if(tw){ const SH=tw.h, h=top+SH, wc=tw.stone, wd=tw.dark, sl=tw.slit||0x24262c, run=T(x-1,y)===5||T(x+1,y)===5, col=T(x,y-1)===5||T(x,y+1)===5, corner=run&&col&&[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>T(x+a,y+b)===5).length===2, P=tw.every||8,   // (a corner is an L; a thick wall isn't a forest of towers)
            // a town's own walls (Stormgate's the tallest of them)
          end=(run&&!col&&(T(x-1,y)!==5||T(x+1,y)!==5))||(col&&!run&&(T(x,y-1)!==5||T(x,y+1)!==5)), mural=(run&&!col&&x%P===0)||(col&&!run&&y%P===0);
        box(cx,cz,-0.4,h+0.4,wc,1,1,0,jit); box(cx,cz,top,SH*0.25,wd,1.16,1.16,0,0); box(cx,cz,top+SH*0.25,0.16,wd,1.1,1.1,0,0);   // a battered plinth, then the face
        box(cx,cz,top+SH*0.62,0.14,wd,1.06,1.06,0,0);                                                                    // a string course
        if(run&&!col){ box(cx,cz,top+SH*0.41,0.55,sl,0.12,1.04); if(SH>3.5) box(cx,cz,top+SH*0.68,0.4,sl,0.1,1.04); }     // arrow slits through the wall
        else if(col&&!run){ box(cx,cz,top+SH*0.41,0.55,sl,1.04,0.12); if(SH>3.5) box(cx,cz,top+SH*0.68,0.4,sl,1.04,0.1); }
        box(cx,cz,h,0.14,wd,1.12,1.12,0,0);                                                                              // the wall-walk's lip, corbelled out
        if(corner||end||mural){ const tw2=corner?1.7:end?1.55:1.4, th=(corner?3.0:end?2.6:1.8)*tw.tower, tt=h+th, ch=(corner?2.4:1.9)*tw.tower;   // towers at the corners, the gates and along the runs
          box(cx,cz,top,tt-top,wc,tw2,tw2,0,0.03); box(cx,cz,tt-0.5,0.18,wd,tw2+0.14,tw2+0.14,0,0);
          box(cx,cz,top+SH*0.9,0.6,sl,tw2+0.02,0.14); box(cx,cz,top+SH*0.9,0.6,sl,0.14,tw2+0.02);
          for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) box(cx+a*tw2*0.38,cz+b*tw2*0.38,tt-0.32,0.45,wc,tw2*0.22,tw2*0.22,0,0.04);
          if(tw.roof!==null){ cones.push({x:cx,z:cz,y:tt-0.32,h:ch,sx:tw2*1.02,sz:tw2*1.02,c:tw.roof}); if(tw.snow) cones.push({x:cx,z:cz,y:tt-0.32+ch*0.55,h:ch*0.45,sx:tw2*0.47,sz:tw2*0.47,c:0xf4f8fc});
            const ft=tt-0.32+ch; box(cx,cz,ft-0.1,0.95,0x3a2a1a,0.05,0.05); box(cx+0.22,cz,ft+0.45,0.38,(x+y)%2?tw.flag:0xf4eede,0.42,0.03); }   // its cone and a pennant atop
          else box(cx,cz,tt-0.32,0.1,wd,tw2*0.6,tw2*0.6); }
        else for(let i=0;i<2;i++){ const f=0.25+i*0.5; if(run&&!col) box(x+f,cz,h+0.14,0.7,wc,0.36,1.0,0,0.04); else if(col&&!run) box(cx,y+f,h+0.14,0.7,wc,1.0,0.36,0,0.04); else box(cx,cz,h+0.14,0.7,wc,0.6,0.6,0,0.04); }
        continue; }
      if(t===5&&!dAt.has(k)){ const r=region(x,y), wc=r==='dusthaven'?0xc8a878:r==='ashfield'?0x5a524c:r==='shadowmere'?0x6e6a80:r==='hellgate'?0x3a3440:0x8d919b, h=top+WALL_H;   // a curtain wall twice a man's height
        const wd=new THREE.Color(wc).multiplyScalar(0.78).getHex(), run=T(x-1,y)===5||T(x+1,y)===5, col=T(x,y-1)===5||T(x,y+1)===5, corner=run&&col;
        box(cx,cz,-0.4,h+0.4,wc,1,1,0,jit); box(cx,cz,top,0.35,wd,1.04,1.04,0,0);                                    // a darker plinth course
        box(cx,cz,h,0.1,wd,1.06,1.06,0,0);                                                                             // the wall-walk's lip
        if(corner) box(cx,cz,h+0.1,0.75,wc,1.12,1.12,0,0.04);                                                           // a squat tower where walls meet
        else if(run&&!col){ box(x+0.25,cz,h+0.1,0.5,wc,0.42,0.9,0,0.04); if((x+y)%2===0) box(x+0.75,cz,h+0.1,0.5,wc,0.42,0.9,0,0.04); }   // merlons along the run
        else if(col&&!run){ box(cx,y+0.25,h+0.1,0.5,wc,0.9,0.42,0,0.04); if((x+y)%2===0) box(cx,y+0.75,h+0.1,0.5,wc,0.9,0.42,0,0.04); }
        else box(cx,cz,h+0.1,0.5,wc,0.6,0.6,0,0.04);
        continue; }
      if(SD.has(k)&&!MS[k]){ stairBoxes(x,y,SD.get(k),ground,(a,b)=>inB(a,b)&&(T(a,b)===10||T(a,b)===11),q=>boxes.push(q)); continue; }
      if(t===33){ const h=rockH(x,y), ash=ashland(x,y)||region(x,y)==='hellgate'||region(x,y)==='ashfield', snowy=!ash&&(region(x,y)==='crystalpeak'||bio(x,y)===4||T(x+1,y)===22||T(x,y+1)===22||(BIO?bio(x,y)===7&&h>5.2:h>4.2)), rc=ash?0x625a54:snowy?0xa8a4a8:0x8a6a4a, rd=ash?0x4a4440:snowy?0x8c8890:0x765a40, r1=hsh(y,x), r2=hsh(x+7,y), r3=hsh(x*3,y*5);
        // a crag of real rock: a footing that keeps the range whole, then broken faceted masses leaning together, snow on the tall ones
        box(cx,cz,top-0.4,0.4+h*0.18,rd,1,1,0,jit*2); const b0=top+h*0.18;
        rocks.push({x:cx+(r1-0.5)*0.25,z:cz+(r2-0.5)*0.25,y:b0-0.15,h:h*0.72,sx:1.6+r3*0.35,sz:1.5+r1*0.35,ry:r1*6.28,c:rd,l:(r3-0.5)*0.06});
        rocks.push({x:cx+(r2-0.5)*0.4,z:cz+(r3-0.5)*0.4,y:b0+h*0.28,h:h*0.55,sx:1.15+r2*0.3,sz:1.1+r3*0.3,ry:r2*6.28,c:rc,l:(r1-0.5)*0.08});
        if(h>1.6) rocks.push({x:cx+(r3-0.5)*0.3,z:cz+(r1-0.5)*0.3,y:b0+h*0.6,h:h*0.36,sx:0.75+r1*0.2,sz:0.75+r2*0.2,ry:r3*6.28,c:snowy?0xf2f6fa:rc,l:0});
        if(r3<0.35&&!tilesOnly) rocks.push({x:x+0.1+r1*0.8,z:y+0.1+r2*0.8,y:top-0.05,h:0.28,sx:0.35,sz:0.3,ry:r2*5,c:rd,l:0.04});   // a fallen stone at its foot
        continue; }
      // a berth (tile 32 at sea level beside the water): the game draws it as its neighbours — here, harbour water
      if(t===32&&!e&&[[0,1],[0,-1],[1,0],[-1,0]].some(([a,b])=>[3,12,20,21].includes(T(x+a,y+b)))){ box(cx,cz,-0.45,0.4,0x5fb0c8,1,1,0,jit); continue; }
      if(t===32&&MS[k]){ const th=typeof opt.thawed==='function'?!!opt.thawed(x,y):!!opt.thawed; box(cx,cz,top-0.4,0.4,th?0x7a7064:0x9aa4b0,1,1,0,jit); continue; }   // V124: a band of crag in Tabor's one slope
      if(t===32){ box(cx,cz,top-0.4,0.4,0x9a7a58,1,1,0,jit); box(cx,cz,top,0.45,0xa8845e,0.9,0.9,hsh(x,y),jit); continue; }
      if(L2&&inCP(x,y)&&WK(x,y)&&!tilesOnly&&!STAIRS.has(t)) for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+a, Y=y+b; if(!WK(X,Y)||STAIRS.has(T(X,Y))||bAt.has(Y*W+X)||dAt.has(Y*W+X)||NEARSIGN(X,Y)) continue; const dh=EH(x,y)-EH(X,Y); if(dh<0.9) continue;   // V113: the drop from one trail to the next broken by boulders and fallen rock at its foot
        const gy=EH(X,Y)+0.02; for(let i=0;i<3;i++){ const r=hsh(x*7+i+a*3,y*5+i*2+b*3), along=(i-1)*0.34+(r-0.5)*0.1, out=0.04+r*0.12; rocks.push({x:cx+a*(0.5+out)+(b?along:0),z:cz+b*(0.5+out)+(a?along:0),y:gy-0.12,h:Math.min(1.4,dh*(0.3+r*0.35)),sx:0.42+r*0.28,sz:0.36+r*0.2,ry:r*6.3,c:[0x8a8e9c,0x7a7e8a,0x9a9eaa][i%3],l:(r-0.5)*0.06}); }
        const r2=hsh(x*3+a,y*11+b); if(r2<0.5) rocks.push({x:cx+a*(0.5+0.32)+(b?(r2-0.25)*1.2:0),z:cz+b*(0.5+0.32)+(a?(r2-0.25)*1.2:0),y:gy-0.04,h:0.14,sx:0.22,sz:0.18,ry:r2*9,c:0x9a9eaa}); }
      let c, y1=top;
      if(t===0||t===14||t===15||t===16||t===1||t===39||t===40||t===9&&false) c=grassOf(x,y);
      else if(t===4) c=grassOf(x,y);
      else if(t===20||t===21){ c=TILE_COL[t]; y1=-0.05; }
      else if(t===29){ c=0x1e2a2a; y1=-0.08; }
      else c=TILE_COL[t]||0x9a9a9a;
      if(t===26){ lava.push({x:cx,z:cz,y:y1-0.1,h:0.1,sx:1,sz:1}); continue; }
      box(cx,cz,y1-0.4,0.4,c,1,1,0,(t===0||t===4||t===16)?(ROLL?0:jit*0.25):jit);   // the sward barely varies tile to tile, so no checkerboard
      if((t===0||t===4||t===16)&&!desert(x,y)&&!ashland(x,y)&&!tilesOnly){ const n=Math.floor(hsh(x*3,y*5)*3.4*GRASS_K); const gc=new THREE.Color(c).offsetHSL(0.0,0.12,-0.06).getHex();
        for(let i=0;i<n;i++){ const hx=hsh(x*11+i,y*7), hz=hsh(y*13+i,x*5); tufts.push({x:x+0.12+hx*0.76,z:y+0.12+hz*0.76,y:y1,h:0.45+hx*0.4,sx:0.7+hz*0.4,sz:0.7+hz*0.4,ry:hx*6.28,c:gc,l:(hz-0.5)*0.06}); } }
      if((t===0||t===4||t===2)&&!tilesOnly&&!opt.land||(opt.land==='mistral'&&t===0&&!tilesOnly)){ const wd=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>[3,20,21,29].includes(T(x+a,y+b)));   // rushes and stones along the water's edge
        wd.forEach(([a,b],j)=>{ for(let i=0;i<3;i++){ const r=hsh(x*13+i+j*7,y*11+i), sd=(r-0.5)*0.8; if(r<0.3) continue;
          tufts.push({x:cx+a*0.52+(b?sd:0),z:cz+b*0.52+(a?sd:0),y:y1-0.04,h:0.9+r*0.6,sx:0.32,sz:0.32,ry:r*6.28,c:r>0.7?0x8a9a50:0x6a8a42,l:0}); }
          if(hsh(x+j,y*3)<0.35) box(cx+a*0.5+(b?(hsh(y,x)-0.5)*0.6:0),cz+b*0.5+(a?(hsh(x,y)-0.5)*0.6:0),y1-0.08,0.1,0x8a8a84,0.18,0.14,hsh(x,y)*3,0.04); }); }
      if(t===92) for(let i=0;i<4;i++){ const hx=hsh(x*5+i,y), hz=hsh(y*7+i,x); box(x+0.12+hx*0.76,y+0.12+hz*0.76,y1,0.32+hx*0.2,0x9ac870,0.05,0.05,hz*3); }
      if(t===91&&!tilesOnly) for(let i=0;i<4;i++){ const hx=hsh(x*3+i,y), hz=hsh(y*5+i,x); tufts.push({x:x+0.15+hx*0.7,z:y+0.15+hz*0.7,y:y1,h:0.32+hz*0.2,sx:0.9+hx*0.4,sz:0.9+hz*0.4,ry:hx*6.28,c:[0xb07ab0,0x9a62a0,0xc890c8][(i+x)%3],l:0}); }   // heather in flower, in clumps
      if(t===4&&L2&&!tilesOnly&&!MG) for(let i=0;i<5;i++){ const hx=hsh(x*3+i,y), hz=hsh(y*5+i,x); flowers.push({x:x+0.12+hx*0.76,z:y+0.12+hz*0.76,y:y1,h:0.9+hz*0.5,sx:1.3+hx*0.5,sz:1.3+hx*0.5,ry:hx*6.28,k:(i+x*3+y)%5}); }
      else if(t===4) for(let i=0;i<3;i++){ const hx=hsh(x*3+i,y), hz=hsh(y*5+i,x); box(x+0.15+hx*0.7,y+0.15+hz*0.7,y1,0.1,[0xf4f4f4,0xf0c040,0xe04a6a,0xa06ae0][(i+x+y)%4],0.1,0.1); }
      if(t===1){ const kk=treeKind(x,y), s=(0.85+hsh(x,y)*0.35)*(opt.land&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>WK(x+a,y+b))?0.68:1); (trees[kk]=trees[kk]||[]).push({x:cx+(hsh(y,x)-0.5)*0.2,z:cz,y:y1,h:s,sx:s,sz:s,ry:hsh(x,y)*6}); }
      if(t===15) bush.push({x:cx,z:cz,y:y1,h:0.8+hsh(x,y)*0.3,sx:1,sz:1,ry:hsh(x,y)*6});
      if(t===14&&PALISADE.has(region(x,y))&&rimQ(x,y)>0.45){ const F=q=>T(q[0],q[1])===14, run=F([x-1,y])||F([x+1,y]), col=F([x,y-1])||F([x,y+1]), corner=run&&col,   // a village's ring fence, raised to a palisade of sharpened logs
          end=(run&&!col&&(!F([x-1,y])||!F([x+1,y])))||(col&&!run&&(!F([x,y-1])||!F([x,y+1]))), wood=0x7a5a3a, dk=0x5a4028;
        if(corner||end){ for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) box(cx+a*0.42,cz+b*0.42,y1,2.5,dk,0.16,0.16);       // a watchtower: four posts, a deck, a rail, a roof
          box(cx,cz,y1+2.1,0.14,wood,1.2,1.2); for(const [a,b,w2,d2] of [[0,-0.56,1.1,0.08],[0,0.56,1.1,0.08],[-0.56,0,0.08,1.1],[0.56,0,0.08,1.1]]) box(cx+a,cz+b,y1+2.24,0.4,wood,w2,d2);
          cones.push({x:cx,z:cz,y:y1+2.5,h:1.0,sx:1.5,sz:1.5,c:0x8e4a36}); box(cx-0.2,cz+0.3,y1,2.1,dk,0.06,0.06,0.2); }
        else for(let i=0;i<4;i++){ const f=0.125+i*0.25, hh=1.55+hsh(x*4+i,y)*0.3, px=run?x+f:cx, pz=run?cz:y+f;
          box(px,pz,y1,hh,i%2?wood:0x6e5034,0.21,0.21,hsh(x,y*3+i)*0.4); cones.push({x:px,z:pz,y:y1+hh,h:0.28,sx:0.24,sz:0.24,c:0x9a7a52}); }
        if(!corner&&!end) box(cx,cz,y1+0.95,0.09,dk,run?1:0.26,run?0.26:1);
        continue; }
      if(t===14||t===39) fence.push({x:cx,z:cz,y:y1,h:1,sx:1,sz:1,ry:(T(x,y-1)===t||T(x,y+1)===t)&&!(T(x-1,y)===t||T(x+1,y)===t)?Math.PI/2:0});
      if(t===40){ box(cx-0.45,cz,y1,1.1,0x6f5128,0.14,0.14); box(cx+0.45,cz,y1,1.1,0x6f5128,0.14,0.14); }
     } finally { if(MG) unsnap(S0); } }
    if(ROLL){ const lift=o=>{ if(o.rv) return; const r=roll(o.x,o.z); if(r) o.y+=r; }; boxes.forEach(lift); bush.forEach(lift); fence.forEach(lift); tufts.forEach(lift); flowers.forEach(lift); cones.forEach(lift); rocks.forEach(lift); crystals.forEach(lift); lamps.forEach(o=>{ if(o.x!==undefined&&o.y!==undefined) lift(o); }); Object.values(trees).forEach(l=>l.forEach(lift)); }
    groundMesh(ch,cells,mcells); reliefMesh(ch,relief); instList(ch,boxes,UNIT,boxMat,true); if(cones.length) instList(ch,cones,CONE_U,bmat(0xffffff,'roof'),true); if(rocks.length) instList(ch,rocks,ROCK_U,rockMat,true); if(crystals.length) instList(ch,crystals,CRYSTAL_U,crystalMat,false); if(lamps.length){ instList(ch,lamps,UNIT,lampMat,false); if(typeof DAYNIGHT!=='undefined') lamps.forEach(l=>{ const o=new THREE.Object3D(); o.position.set(l.x,l.y+l.h*0.5,l.z); ch.g.add(o); DAYNIGHT.lamp(o,1.2+l.h*1.5); }); };
    Object.entries(trees).forEach(([k,l])=>instList(ch,l,geo(k),treeMat,true));
    if(flowers.length){ const FC=[0xfff8f0,0xf6d040,0xe8607a,0xb08ae8,0xf0a0c8]; for(let k=0;k<5;k++){ const l=flowers.filter(f=>f.k===k); if(l.length) instList(ch,l,geos['flower'+k]||(geos['flower'+k]=FLOWER_GEO(FC[k])),flowerMat,false); } }
    instList(ch,bush,geo('bush'),vcMat,true); if(tufts.length) instList(ch,tufts,geo('tuft'),tuftMat,false); instList(ch,fence,geo('fence'),vcMat,true);
    instList(ch,lava,UNIT,glow(0xff6a1a));
    if(tilesOnly) return;
    // the chunk's buildings, decorations, signs and ships
    WD.buildings.forEach(b=>{ if(b.deck===undefined&&!b.cave&&!b.inca&&chunkAt(b.x+b.w/2,b.y+b.h/2)===ch) buildHouse(b,ch.g); });   /* (the treetops draw their own) */
    WD.decor.forEach(d=>{ if(chunkAt(d.x,d.y)!==ch) return; const fn=DECOR_KINDS[d.kind]; if(!fn) return; const g=new THREE.Group(); fn(d,g,lv.anim); if(PERSON_SIZED.has(d.kind)) g.scale.setScalar(VIEWMODE.ps(lv));
      g.position.x+=d.x+(d.w===2?1:0.5); g.position.z+=d.y+(d.w===2?1:0.5); g.position.y=EH(d.x,d.y)+0.02+(ROLL?roll(d.x+(d.w===2?1:0.5),d.y+(d.w===2?1:0.5)):0); if(d.kind==='lighthouse'&&LIFT(d.x,d.y)>1) g.scale.multiplyScalar(1.7); if(typeof LOOK2!=='undefined'&&LOOK2){ soften(g); g.traverse(o=>{ if(o.isMesh&&o.geometry&&o.geometry.type==='IcosahedronGeometry'&&o.material&&o.material.userData.soft){ const gg=o.geometry.parameters; o.geometry=new THREE.SphereGeometry(gg.radius,14,10); } }); const r=ROLL?roll(d.x+(d.w===2?1:0.5),d.y+(d.w===2?1:0.5)):0; g.position.y+=r; } ch.g.add(shade(g)); });   // the capital's harbour lights stand tall
    signs.forEach(s=>{ if(chunkAt(s.x,s.y)!==ch) return; const g=group(s.wx,EH(Math.floor(s.wx),Math.floor(s.wz))+0.02,s.wz,ch.g);
      if(TOWN_SIGN.test(s.v.split('\n')[0].trim())){ townSign(g,s); shade(g); return; }
      Cy(0.05,0.05,0.9,6,0x5b3a1f,0,0,0,g); B(0.8,0.45,0.07,0xcaa56a,0,0.75,0,g); B(0.8,0.06,0.075,0xe0c089,0,1.17,0,g); shade(g); });
    ships.forEach(s=>{ if(chunkAt(s.x,s.y)===ch) buildShip(s,ch.g); });
  }
  // ── buildings, by town ──
  function colours(b){ const key=themeOf(b.id), th=(WD.themes[key]||{}), p=th.pal||{}, n=(s,d)=>s?hexn(s):d;
    const dark=(b.style==='chapel')&&!opt.chapelLight(b);
    return { wall:n(p.wallLit||p.wall,0xece2c8), wallD:n(p.wallDark,0x9a8a72), roof:n(p.roof,0x8e4a36), beam:n(th.beam,0x6b4a2e), timber:th.wallTex==='timber'||key==='hearthvale', snow:!!th.snowRidge,
      stone:n(p.wall,0xa8a49b), awn:n(p.roofLit,0xb8402e), sign:n(p.roofRidge,0xf2c14e), flag:(typeof TWALL!=='undefined'&&TWALL[key]&&TWALL[key].flag)||null, dark }; }
  // ── which way each building faces ── KLK draws every door on the south face, toward the screen; in 3D a house turns to face
  // the heart of its town (north, east or west instead) wherever the ground on that side is open and joined to its old doorstep,
  // so a village's doors look in on its square. The footprint, and so the walk, is the game's own; only the face turns.
  const FACE={};
  if(!opt.land) WD.buildings.forEach(b=>{ if(b.deck!==undefined||b.cave||b.inca) return; if(b.id==='sg_keep'||b.id==='sg_cathedral'||b.id==='home_house'||b.id==='home_barn') return;
    const bx=b.x+b.w/2, by=b.y+b.h/2; let best=null, bd=1e9; (WD.towns||[]).forEach(([n,tx,ty])=>{ const d=Math.hypot(tx+0.5-bx,ty+0.5-by); if(d<bd){ bd=d; best=[tx+0.5,ty+0.5]; } });
    if(!best||bd>26||bd<2.5) return; const vx=best[0]-bx, vy=best[1]-by;
    const dirs=[['S',0,1],['N',0,-1],['E',1,0],['W',-1,0]].map(([d,a,c])=>[d,a,c,(a*vx+c*vy)/Math.hypot(vx,vy)]).sort((p,q)=>q[3]-p[3]);
    for(const [d,,,dot] of dirs){ if(d==='S') return; if(dot<0.35) return;
      const tx=d==='N'?Math.floor(bx):d==='E'?b.x+b.w:b.x-1, ty=d==='N'?b.y-1:Math.floor(by);
      if(!WK(tx,ty)||bAt.has(ty*W+tx)||dAt.has(ty*W+tx)||Math.abs(E(tx,ty)-E(b.door.x,b.door.y))>0) continue;
      // joined to the old doorstep, by a short walk?
      const s0=[b.door.x,b.door.y+1], seen=new Set([s0[0]+','+s0[1]]), q=[s0]; let ok=false;
      for(let i=0;i<q.length&&i<900&&!ok;i++){ const [x,y]=q[i]; for(const [a,c] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+a,Y=y+c,kk=X+','+Y; if(seen.has(kk)||Math.abs(X-s0[0])>18||Math.abs(Y-s0[1])>18) continue; if(!lv.canMove(x+0.5,y+0.5,X+0.5,Y+0.5)) continue; if(X===tx&&Y===ty){ ok=true; break; } seen.add(kk); q.push([X,Y]); } }
      if(ok){ FACE[b.id]={dir:d,tx,ty}; return; } } });
  lv.facing=FACE;
  const hingeOf={}; WD.buildings.forEach(b=>hingeOf[b.id]=[]); lv._hingeOf=hingeOf; lv._buildings=WD.buildings;
  const SMOKES=[]; if(typeof LOOK2!=='undefined'&&LOOK2&&typeof LIFE!=='undefined') LIFE.attach(lv,scene,SMOKES);   // V111: chimney smoke, birds, butterflies, fireflies, windows lit at night
  function buildHouse(b,par){ const e=E(b.door.x,b.door.y), key=themeOf(b.id);
    const F=FACE[b.id], side=F&&(F.dir==='E'||F.dir==='W');
    const dx=!F?(b.door.x+0.5)-(b.x+b.w/2):F.dir==='N'?-((F.tx+0.5)-(b.x+b.w/2)):F.dir==='E'?-((F.ty+0.5)-(b.y+b.h/2)):(F.ty+0.5)-(b.y+b.h/2);
    const bm=Object.assign({},b,side?{w:b.h,h:b.w}:{},{_dx:dx});   // turned east or west, it's built the other way round to fill the same footprint; _dx: where its door sits
    const make=c=>{ const TID={ironhold:'iron',saltmere:'salt',thornwood:'wood',dusthaven:'sand',crystalpeak:'frost',stormgate:'grand',ashfield:'ash',shadowmere:'mere'}; if(typeof LOOK2!=='undefined'&&LOOK2&&TID[key]) c=Object.assign({},c,{[TID[key]]:true},key==='stormgate'?{stone:0xb3b4b8,roof:0x2c4c9e,flag:0xf2c14e}:{}); if(typeof LOOK2!=='undefined'&&LOOK2&&(key==='hearthvale'||key==='homestead')&&(b.style==='house'||b.style==='cottage'||b.style==='shop'||!WSTYLE[b.style])) c=Object.assign({},c,{thatch:true}); const g=new THREE.Group(); if(key==='stormgate'&&BUILDING_STYLES[b.style]&&!c.dark&&!(c.grand&&(b.style==='house'||b.style==='shop'||b.style==='inn'||b.style==='keep'))) BUILDING_STYLES[b.style](bm,g,{roof:c.roof}); else (WSTYLE[b.style]||WSTYLE.house)(bm,g,c);
      if(!(b.id==='home_barn'&&typeof LOOK2!=='undefined'&&LOOK2)) (hingeOf[b.id]=hingeOf[b.id]||[]).push(doorFace(g,dx,b.id==='sg_cathedral'?bm.h+0.5:b.style==='chapel'?bm.h+0.18:bm.h-0.2,b.style==='chapel'?1.4:b.id==='sg_keep'?1.5:1.0));
      g.rotation.y=!F?0:F.dir==='N'?Math.PI:F.dir==='E'?Math.PI/2:-Math.PI/2;
      g.position.set(b.x+b.w/2,e*TIER*LIFT(b.door.x,b.door.y)+0.02,b.y+b.h/2); if(typeof LOOK2!=='undefined'&&LOOK2){ g.updateMatrixWorld(true); const v=new THREE.Vector3(); g.traverse(o=>{ if(o.userData.smoke){ o.getWorldPosition(v); SMOKES.push({x:v.x,y:v.y,z:v.z,dark:o.userData.smoke===2}); } }); soften(g); } const M0=mergeStatic(shade(g)); par.add(M0);
      if(typeof VILLAGE3!=='undefined') VILLAGE3.swap(M0,par,g,b,bm,c,key);   // V194: the village kit's house takes its place once the pieces have loaded
      return g; };
    if(b.style!=='chapel'){ make(colours(b)); return; }
    // a chapel is drawn both ways — dark while its general is bound, bright once the town is cleansed
    const c=colours(b), lit=make(Object.assign({},c,{dark:false})), dark=make(Object.assign({},c,{dark:true}));
    lv.anim.push(()=>{ const on=!!opt.chapelLight(b); lit.visible=on; dark.visible=!on; }); }
  const doorAt=b=>{ const F=FACE[b.id]; if(!F) return {x:b.door.x+0.5,z:b.door.y+1.2,auto:[0,-1],sx:b.door.x+0.5,sz:b.door.y+1.6,face:0};
    if(F.dir==='N') return {x:F.tx+0.5,z:b.y-0.2,auto:[0,1],sx:F.tx+0.5,sz:b.y-0.6,face:Math.PI};
    if(F.dir==='E') return {x:b.x+b.w+0.2,z:F.ty+0.5,auto:[-1,0],sx:b.x+b.w+0.6,sz:F.ty+0.5,face:Math.PI/2};
    return {x:b.x-0.2,z:F.ty+0.5,auto:[1,0],sx:b.x-0.6,sz:F.ty+0.5,face:-Math.PI/2}; };
  lv.doorAt=doorAt;
  WD.buildings.forEach(b=>{ const into=opt.enter&&opt.enter(b), DA=doorAt(b), x=DA.x, z=DA.z;
    const hide=b.deck!==undefined?()=>!(lv.treeUp&&lv.treeUp()):undefined;   /* V202: a treehouse's door is only at hand up on its deck */
    lv.spots.push(into ? {x,z,r:1.2,label:'Enter',who:b.name,action:into,auto:DA.auto,hinges:hingeOf[b.id]||[],hide} : {x,z,r:1.2,label:'Door',who:b.name,lines:['The door is barred.'],auto:DA.auto,hide}); });
  doorSwing(lv);
  lv.doorStep=id=>{ const b=WD.buildings.find(q=>q.id===id), D=doorAt(b); return {x:D.sx,z:D.sz,face:D.face,yaw:D.face,up:b.deck!==undefined}; };
  lv.chapelLit=b=>!!(opt.chapelLight&&opt.chapelLight(b));
  // ── ships: one hull per run of bow(36) / deck(37) / stern(38) tiles ──
  const ships=[]; for(let y=0;y<H;y++){ let x=0; while(x<W){ const t=T(x,y); if(t===36||t===38){ let x2=x; while(x2+1<W&&T(x2+1,y)>=36&&T(x2+1,y)<=38) x2++;
      const wide=T(x,y+1)>=36&&T(x,y+1)<=38, above=T(x,y-1)>=36&&T(x,y-1)<=38; if(!above) ships.push({x,y,len:x2-x+1,wide,bowEast:T(x2,y)===36}); x=x2+1; } else x++; } }
  function buildShip(s,par){ const g=shipModel(s.len,s.wide); if(!s.bowEast) g.rotation.y=Math.PI; g.position.set(s.x+s.len/2,0,s.y+(s.wide?1:0.5)); par.add(g); const k=s.x;
    lv.anim.push(t=>{ g.position.y=Math.sin(t*0.9+k)*0.05; g.rotation.z=Math.sin(t*0.7+k)*0.02; g.rotation.x=Math.sin(t*0.53+k)*0.012; }); }
  // V106: each town's own sign, where the road comes in — a big painted board on two posts under a little shingled roof, the town's
  //  name and motto lettered on both faces, turned to face the road out (so it greets you arriving and sees you off), a lantern
  const TOWN_SIGN=/^(THE HOMESTEAD|HEARTHVALE|IRONHOLD|SALTMERE|THORNWOOD|CRYSTALPEAK|DUSTHAVEN|ASHFIELD|STORMGATE|SHADOWMERE|HELLGATE CITADEL)$/;
  function townSignTex(title,sub){ const c=document.createElement('canvas'); c.width=512; c.height=224; const x=c.getContext('2d');
    const gr=x.createLinearGradient(0,0,0,224); gr.addColorStop(0,'#c49a5e'); gr.addColorStop(1,'#a87c44'); x.fillStyle=gr; x.fillRect(0,0,512,224);
    x.strokeStyle='rgba(90,58,30,0.35)'; x.lineWidth=2; for(let y=44;y<224;y+=45){ x.beginPath(); x.moveTo(0,y); x.lineTo(512,y); x.stroke(); }
    for(let i=0;i<40;i++){ x.fillStyle='rgba(90,58,30,0.12)'; x.fillRect((i*97)%512,(i*53)%224,40+(i*13)%60,2); }
    x.strokeStyle='#5a3a1e'; x.lineWidth=12; x.strokeRect(6,6,500,212); x.strokeStyle='#e8c46a'; x.lineWidth=3; x.strokeRect(18,18,476,188);
    x.textAlign='center'; x.textBaseline='middle'; let fs=74; x.font=`bold ${fs}px Georgia,'Times New Roman',serif`; while(x.measureText(title).width>440&&fs>30){ fs-=4; x.font=`bold ${fs}px Georgia,'Times New Roman',serif`; }
    x.fillStyle='rgba(40,20,6,0.55)'; x.fillText(title,259,sub?92:115); x.fillStyle='#3a2210'; x.fillText(title,256,sub?88:112);
    if(sub){ let f2=28; x.font=`italic ${f2}px Georgia,serif`; while(x.measureText(sub).width>440&&f2>14){ f2-=2; x.font=`italic ${f2}px Georgia,serif`; } x.fillStyle='#4a2c14'; x.fillText(sub,256,158); }
    const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
  function townSign(g,s){ const L=s.v.split('\n'), title=L[0].trim(), sub=(L[1]||'').trim();
    if(s.ang!==undefined) g.rotation.y=s.ang;
    const wood=0x6a4426, dk=0x4a2e18, BW=2.1, BH=0.92, y0=1.05;
    [-1,1].forEach(sd=>{ Cy(0.08,0.1,y0+BH+0.5,8,wood,sd*(BW/2+0.06),0,0,g); B(0.26,0.12,0.26,0x8a8478,sd*(BW/2+0.06),0,0,g); Sp(0.09,dk,sd*(BW/2+0.06),y0+BH+0.52,0,g,8,6); });
    B(BW+0.36,0.1,0.14,dk,0,y0+BH+0.06,0,g); B(BW+0.36,0.1,0.14,dk,0,y0-0.12,0,g); B(BW,BH,0.08,0x9a7444,0,y0-0.02,0,g);
    const tex=townSignTex(title,sub); [0,Math.PI].forEach(ry=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(BW-0.04,BH-0.04),new THREE.MeshLambertMaterial({map:tex})); m.position.set(0,y0-0.02+BH/2,ry?-0.045:0.045); m.rotation.y=ry; m.userData.keep=true; g.add(m); });
    [-1,1].forEach(q=>{ const r=B(BW+0.6,0.06,0.42,0x7a4a2e,0,0,q*0.17,g); r.position.y=y0+BH+0.42; r.rotation.x=q*0.5; }); B(BW+0.64,0.08,0.08,0x5a3420,0,y0+BH+0.52,0,g);
    Sp(0.07,glow(0xffcf6a),BW/2+0.06,y0+BH+0.14,0.2,g,8,6); B(0.13,0.04,0.13,0x2a2a2a,BW/2+0.06,y0+BH+0.22,0.2,g); B(0.04,0.04,0.16,0x2a2a2a,BW/2+0.06,y0+BH+0.22,0.1,g);
    [-1,1].forEach(sd=>{ for(let i=0;i<4;i++) Sp(0.07,[0xe85a6a,0xffe060,0xf4f0ea,0xb08ae8][(i+(sd>0?2:0))%4],sd*(BW/2+0.06)+Math.cos(i*1.7)*0.24,0.1,Math.sin(i*1.7)*0.24,g,6,4); }); }
  // ── signs: read with Ⓐ (lines that point at something not built are left out) ──
  const signs=Object.entries(WD.signs).map(([k,v])=>{ const [x,y]=k.split(',').map(Number); return {x,y,v,wx:x+0.5,wz:y+0.5}; });
  // V106: a town's sign steps out past its gate to the roadside, turned to the road out, so it's seen as you come in
  signs.forEach(s=>{ if(!TOWN_SIGN.test(s.v.split('\n')[0].trim())) return; let best=null, bd=1e9; (WD.towns||[]).forEach(([n,tx,ty])=>{ const d=Math.hypot(tx-s.x,ty-s.y); if(d<bd){ bd=d; best=[tx,ty]; } });
    if(!best||bd<0.5) return; const a=Math.round(Math.atan2(s.x-best[0],s.y-best[1])/(Math.PI/4))*(Math.PI/4); s.ang=a; const fx=Math.sin(a), fz=Math.cos(a);
    const ok=(X,Z)=>{ const tx=Math.floor(X), tz=Math.floor(Z); return WK(tx,tz)&&!bAt.has(tz*W+tx)&&!dAt.has(tz*W+tx); };
    for(const f of [2.6,2.0,1.5,3.4,4.2,5.0]) for(const sd of [1.4,-1.4]){ const X=s.x+0.5+fx*f+fz*sd, Z=s.y+0.5+fz*f-fx*sd, X2=X+fx, Z2=Z+fz;   // on level ground (not a stair), clear of houses and props
      if(ok(X,Z)&&ok(X2,Z2)&&E(Math.floor(X),Math.floor(Z))===E(Math.floor(X2),Math.floor(Z2))&&E(Math.floor(X),Math.floor(Z))<=E(s.x,s.y)){ s.wx=X; s.wz=Z; return; } } });
  signs.forEach(s=>{ const lines=s.v.split('\n'); lv.spots.push({key:s.x+','+s.y,x:s.wx,z:s.wz,r:0.9,label:'Read',who:lines[0].replace(/^[^A-Za-z—]+/,'').trim()||'Sign',lines:[lines.slice(1).filter(l=>!/Ⓐ/.test(l)).join('\n').trim()||lines[0]]}); });
  // ── townsfolk ──
  WD.villagers.forEach(v=>{ const vk='v:'+v.x+','+v.y+':'+v.outfit, dn=(typeof DIALOGUE!=='undefined'&&DIALOGUE.lines)?DIALOGUE.lines(vk):null;   /* V132: the story's name for him (Old Man Elijah) picks his look */
    const f=addPerson(lv,chunkAt(v.x,v.y).g,v.outfit,v.x+0.5,v.y+0.5,lv.ground(v.x+0.5,v.y+0.5)+0.02,v.name||(dn&&dn.who)||OUTFIT_NAMES[v.outfit]||'Villager',cleanLines(v.lines),{rest:hsh(v.x,v.y)*6}); f.chunk=chunkAt(v.x,v.y); f.key='v:'+v.x+','+v.y+':'+v.outfit; });
  // ── the forest hollows and anything else the wiring hangs off a tile ──
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(T(x,y)===35){ const fn=opt.hollow&&opt.hollow(x,y); if(fn) lv.spots.push({x:x+0.5,z:y+1.2,r:1.3,label:'Enter',who:'The wood',action:fn}); }
  // ── Abaddon's barriers: a dome of dark power over every town still sealed ──
  const domes=[]; ellipses.forEach((e,i)=>{ if(!e) return; const m=new THREE.Mesh(new THREE.SphereGeometry(1,28,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x8a3ad8,transparent:true,opacity:0.16,side:THREE.DoubleSide,depthWrite:false}));
    m.scale.set(e.rx,9,e.ry); m.position.set(e.cx+0.5,-0.2,e.cy+0.5); scene.add(m);
    const r=new THREE.Mesh(new THREE.TorusGeometry(1,0.012,4,60),glow(0xc06aff)); r.rotation.x=Math.PI/2; r.scale.set(e.rx,e.ry,40); r.position.set(e.cx+0.5,0.3,e.cy+0.5); scene.add(r); domes.push({i,m,r}); });
  lv.anim.push(t=>domes.forEach(d=>{ const on=opt.sealed(d.i); d.m.visible=d.r.visible=on; if(on) d.m.material.opacity=0.13+Math.sin(t*1.3+d.i)*0.04; }));
  // ── streaming: build what is near, show what is in range, cull instances against the view ──
  let VIEW=62; const frus=new THREE.Frustum(), PM=new THREE.Matrix4(); let tick=0;
  // V119: THE FAR COUNTRY — the whole realm once more, coarse (a vertex every two tiles), coloured by what lies there, so the
  //  hills and ranges run on past the near chunks into the haze as the Northern Reach's do. It lies a little under the near
  //  ground and is cut away around the knight, where the chunks stand.
  const FAR=(()=>{ if(!OW||opt.land) return null; const S2=W>500?3:2, NX=Math.floor(W/S2)+1, NZ=Math.floor(H/S2)+1, pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), C=new THREE.Color();
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const x=Math.min(W-1,i*S2), y=Math.min(H-1,j*S2), k=y*W+x, t=T(x,y), v=(j*NX+i)*3; let h, hex;
      if(RK[k]){ h=reliefV(x*2+1,y*2+1); const hm=h-RB(x,y)-roll(x+0.5,y+0.5); const sn=!BIO||bio(x,y)===4||bio(x,y)===7&&hm>8; hex=RK[k]===1?(hm>5&&sn?0xdfe6ee:0x7a7468):hm>7&&sn?0xdfe6ee:hm>4.5?0x6a7458:0x2f5a34; if(inCP(x,y)) hex=h>4?0xe8eef4:0x8e8a84; }
      else if(t===3||t===21||t===29){ h=-0.32; hex=0x2f6f9c; } else if(t===20){ h=-0.08; hex=0x5fb0c8; }
      else { const r=roll(x+0.5,y+0.5); h=EH(x,y)+0.02+r; hex=bAt.has(k)?0x8a5a3a:t===19||desert(x,y)?0xc8aa78:t===2||t===12?0xb09060:t===5||t===6?0x9a958c:t===22?0xeef2f6:t===25||t===28?0x4a4440:BGR&&(t===0||t===4||t===1||t===15)?(t===1?new THREE.Color(grassOf(x,y)).multiplyScalar(0.8).getHex():grassOf(x,y)):r>6?0x7c8a5c:0x5e9a4a; }
      pos[v]=i*S2+0.5; pos[v+1]=h-0.45; pos[v+2]=j*S2+0.5; C.setHex(hex).offsetHSL(0,0,(hsh(i,j)-0.5)*0.05); col[v]=C.r; col[v+1]=C.g; col[v+2]=C.b; }
    /* V135: the far mountains, softened: their heights eased over their neighbours (the crags sampled every other tile made
       knife-edged sheets), and the steep faces given rock instead of meadow green */
    { const isR=new Uint8Array(NX*NZ); for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const x=Math.min(W-1,i*S2), y=Math.min(H-1,j*S2); isR[j*NX+i]=RK[y*W+x]?1:0; }
      for(let it=0;it<2;it++){ const hh=new Float32Array(NX*NZ); for(let k=0;k<NX*NZ;k++) hh[k]=pos[k*3+1];
        for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){ const k=j*NX+i; if(!isR[k]) continue; let sum=hh[k]*2, n=2; for(const q of [k-1,k+1,k-NX,k+NX]) if(isR[q]){ sum+=hh[q]; n++; } pos[k*3+1]=sum/n; } }
      const rock=new THREE.Color(0x6e685e), cc=new THREE.Color();
      for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){ const k=j*NX+i; if(!isR[k]) continue; const g=Math.max(Math.abs(pos[(k+1)*3+1]-pos[(k-1)*3+1]),Math.abs(pos[(k+NX)*3+1]-pos[(k-NX)*3+1]))/(2*S2);
        if(g>0.55){ const u=Math.min(1,(g-0.55)/0.6); cc.setRGB(col[k*3],col[k*3+1],col[k*3+2]); if(cc.r+cc.g+cc.b<2.4){ cc.lerp(rock,u*0.85); col[k*3]=cc.r; col[k*3+1]=cc.g; col[k*3+2]=cc.b; } } } }
    const idx=[]; for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, c=a+NX, d=c+1; idx.push(a,c,b,b,c,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
    const m=new THREE.MeshLambertMaterial({vertexColors:true}), U={uC:{value:new THREE.Vector2()},uR:{value:46}};
    m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFW;').replace('#include <project_vertex>','#include <project_vertex>\nvFW=(modelMatrix*vec4(transformed,1.0)).xyz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vFW; uniform vec2 uC; uniform float uR;').replace('void main() {','void main() {\nif(distance(vFW.xz,uC)<uR) discard;'); };
    const mesh=new THREE.Mesh(g,m); mesh.frustumCulled=false; mesh.receiveShadow=false; scene.add(mesh); return {mesh,U}; })();
  lv.setView=v=>{ VIEW=v; if(FAR) FAR.U.uR.value=Math.max(18,v-16); };   // V128: the quality governor (hud.js) draws the near land less far on a slow phone
  lv.sunShadow=sun;
  /* V135: what the graphics tier sets (hud.js): fog near/far, how far things cast shadows, how far the grass tufts are drawn,
     and the size of the sun's shadow box round you */
  lv.gfx={fogN:40,fogF:150,shR:26,tuftR:30};
  lv.setGfx=g=>{ Object.assign(lv.gfx,g); if(g.shadowBox){ const b=g.shadowBox, C=sun.shadow.camera; C.left=-b; C.right=b; C.top=b; C.bottom=-b; lv.gfx.sunD=Math.max(34,b*1.3); C.far=lv.gfx.sunD+b*2.5; C.updateProjectionMatrix(); } };
  /* V132: nobody stands sunk in the hills — anyone set down at a tile's flat height (or later, by a quest) is lifted onto the
     rolled ground under their feet. Only ever raised: folk on a bridge, a deck or a stair keep their height. */
  if(ROLL){ let gT=0; lv.anim.push((t,dt)=>{ gT+=dt||0.016; if(gT<0.5) return; gT=0; if(ENGINE.level!==lv) return;
    for(const f of lv.folk){ const pa=f.g&&f.g.parent; if(!pa||(pa!==scene&&(pa.parent!==scene||pa.position.lengthSq()>0.01))) continue; const gy=lv.ground(f.x,f.z)+0.02; if(f.y<gy-0.03){ f.y=gy; if(f.still&&f.g) f.g.position.y=gy; } } }); }
  lv.follow=p=>{ const G=lv.gfx; if(FAR){ FAR.U.uC.value.set(p.x,p.z); scene.fog.near=G.fogN; scene.fog.far=G.fogF; } if(typeof DAYNIGHT!=='undefined'){ const L=DAYNIGHT.state().light; const SD=G.sunD||34; sun.position.set(p.x+L.x*SD,p.y+L.y*SD,p.z+L.z*SD); } else sun.position.set(p.x-12,p.y+30,p.z+14); sun.target.position.set(p.x,p.y,p.z);
    const cam=ENGINE.cam; cam.updateMatrixWorld(); PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); frus.setFromProjectionMatrix(PM);
    const heavy=(tick++%6)===0;
    chunks.forEach(ch=>{ const d=Math.hypot(ch.x-p.x,ch.z-p.z);
      if(heavy&&!ch.built&&d<VIEW+10&&lv._builds<2){ buildChunk(ch); lv._builds++; }
      const show=d<VIEW+12; ch.g.visible=show&&ch.built; if(!ch.g.visible) return;
      const inView=frus.intersectsSphere(ch.sphere), near=d<G.shR; ch.ims.forEach(im=>{ const tu=im.material===tuftMat; im.visible=inView&&(!tu||d<G.tuftR); im.castShadow=!tu&&(near&&im.material!==boxMat&&im.material!==groundMat||near&&d<G.shR*0.7); }); });
    lv._builds=0;
  // redraw the ground of an area in place (the tiles only — people, buildings and decorations stay)
  lv.retile=(x0,y0,x1,y1)=>chunks.forEach(ch=>{ if(!ch.built) return; const cx0=ch.cx*CHUNK, cy0=ch.cy*CHUNK; if(cx0>x1||cy0>y1||cx0+CHUNK<x0||cy0+CHUNK<y0) return; ch.ims.forEach(im=>ch.g.remove(im)); ch.ims=[]; buildChunk(ch,true); }); };
  lv._builds=0;
  lv.chunks=chunks; lv.prime=p=>{ chunks.forEach(ch=>{ if(!ch.built&&Math.hypot(ch.x-p.x,ch.z-p.z)<VIEW*0.7) buildChunk(ch); }); };
  lv.onEnter=sp=>lv.prime(sp);
  lv.zone=p=>{ const x=Math.floor(p.x), y=Math.floor(p.z); let best=null, bd=1e9; (WD.towns||[]).forEach(([n,tx,ty])=>{ const d=Math.hypot(tx-x,ty-y); if(d<bd){ bd=d; best=n; } });
    const z=(WD.zones||[]).find(q=>x>=q.x0&&x<q.x1&&y>=q.y0&&y<q.y1); const BN=['The open country','The Greenwood','The Dust Sea','The Ashlands','The Frostfells','The Fens','The Sea Meadows','The Iron Hills','The Burning Marches','The Vale'], where=bd<20?best:T(x,y)===7?'The deep wood':BIO?BN[bio(x,y)]||BN[0]:desert(x,y)?'The Dust Road':ashland(x,y)?'The Ashlands':'The open country';
    return z?`${where} · demons Lv ${z.level}`:where; };
  return lv;
}
