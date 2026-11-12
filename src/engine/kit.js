// V116: the realm stretched (tools/stretch.py) — new country inserted along seams between the towns. The game's own fixed places
//  in the code are written in the old (2D) coordinates and pass through SX/SY (or SP for a {x,z} spot) to land where they now are.
const _STR=(typeof STRETCH!=='undefined'&&STRETCH)||{x:[],y:[]};
const SX=x=>{ let o=x; for(const [x0,n] of _STR.x) if(x>=x0) o+=n; return o; }, SY=y=>{ let o=y; for(const [y0,n] of _STR.y) if(y>=y0) o+=n; return o; };
const SP=o=>Object.assign({},o,{x:SX(o.x),z:SY(o.z)});
// V198: the realm grew again, into an island (tools/grow.py; STRETCH.grow holds the new seams in V197 tiles). Places written in
//  the code in V197's own tiles (after the first stretch) pass through RX/RY (or RP for a {x,z} spot) to land where they now are.
const _GR=_STR.grow||{x:[],y:[]};
const RX=x=>{ let o=x; for(const [p,n] of _GR.x) if(x>=p) o+=n; return o; }, RY=y=>{ let o=y; for(const [p,n] of _GR.y) if(y>=p) o+=n; return o; };
const RP=o=>Object.assign({},o,{x:RX(o.x),z:RY(o.z)});
// ════════════════════════════════════════════════════════════════
//  KIT — shared materials and low-poly building blocks.
//  Every other module builds with these, so the whole game reads as one set.
//  Colours are numbers (0xRRGGBB) or ready materials; numbers are cached.
// ════════════════════════════════════════════════════════════════
const M4=new THREE.Matrix4(), C=new THREE.Color();
// V100 art upgrade — the new world look (approved Oct 26): rolling meadows and a painted sky
const LOOK2=!/[?&]classic\b/.test(location.search)&&(()=>{ try{ return localStorage.getItem('klk3d_look2')!=='0'; }catch(e){ return true; } })();   // on by default; ☰ → System → Classic ground turns it off
const hsh=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%1000/1000;      // stable 0..1 per tile
const _FC={}, _LC={}, _BC={};
function flat(h,o){ if(!o&&_FC[h]) return _FC[h]; const m=new THREE.MeshPhongMaterial(Object.assign({color:h,flatShading:true,shininess:6,specular:0x111111},o||{})); if(!o) _FC[h]=m; return m; }
function lam(h){ return _LC[h]||(_LC[h]=new THREE.MeshLambertMaterial({color:h})); }
function glow(h){ return _BC[h]||(_BC[h]=new THREE.MeshBasicMaterial({color:h})); }
const mt=c=>typeof c==='number'?flat(c):c;
function B(w,h,d,c,x,y,z,par){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt(c)); m.position.set(x,y+h/2,z); par.add(m); return m; }
function Cy(rt,rb,h,s,c,x,y,z,par){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s),mt(c)); m.position.set(x,y+h/2,z); par.add(m); return m; }
function Co(r,h,s,c,x,y,z,par){ const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,s),mt(c)); m.position.set(x,y+h/2,z); par.add(m); return m; }
function Sp(r,c,x,y,z,par,ws,hs){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,ws||8,hs||6),mt(c)); m.position.set(x,y,z); par.add(m); return m; }
function prism(w,h,d,c){ const s=new THREE.Shape(); s.moveTo(-w/2,0); s.lineTo(w/2,0); s.lineTo(0,h); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}); g.translate(0,0,-d/2); return new THREE.Mesh(g,mt(c)); }
function shade(o){ o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } }); return o; }
function group(x,y,z,par){ const g=new THREE.Group(); g.position.set(x||0,y||0,z||0); if(par) par.add(g); return g; }
// ── surface detail: a world-space grain painted in the shader, so a run of tiles reads as earth, stone or sward rather
//    than flat card — no textures to load, no repeats, no seams. Tops get a soft mottling with a little grit; sides get
//    the same plus faint courses (stone layers / plank lines). detailify(material, {amp, strata}) → the same material ──
const _DETAIL_NOISE=`
float _dh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float _dn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(_dh(i),_dh(i+vec2(1,0)),f.x),mix(_dh(i+vec2(0,1)),_dh(i+vec2(1,1)),f.x),f.y); }
float _dfbm(vec2 p){ return _dn(p)*0.55+_dn(p*2.13+7.1)*0.28+_dn(p*4.7+3.3)*0.17; }`;
const DETAIL_TIME={value:0};   // the clock the water's ripples run on (core.js keeps it)
const _DMODE={auto:0,roof:1,brick:2,plaster:3,plank:4};
function detailify(mat,o){ o=Object.assign({amp:0.16,strata:0.1,grit:0.1,mode:'auto'},o||{}); if(mat.userData.detail) return mat; mat.userData.detail=true;
  mat.onBeforeCompile=sh=>{ sh.uniforms.uDAmp={value:o.amp}; sh.uniforms.uDStr={value:o.strata}; sh.uniforms.uDGrit={value:o.grit}; sh.uniforms.uDMode={value:_DMODE[o.mode]||0}; sh.uniforms.uDT=DETAIL_TIME;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vDWP; varying vec3 vDWN;')
      .replace('#include <project_vertex>',`#include <project_vertex>
        vec4 _dw=vec4(transformed,1.0); vec3 _dnrm=objectNormal;
        #ifdef USE_INSTANCING
          _dw=instanceMatrix*_dw; _dnrm=mat3(instanceMatrix)*_dnrm;
        #endif
        vDWP=(modelMatrix*_dw).xyz; vDWN=normalize(mat3(modelMatrix)*_dnrm);`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vDWP; varying vec3 vDWN; uniform float uDAmp; uniform float uDStr; uniform float uDGrit; uniform int uDMode; uniform float uDT;'+_DETAIL_NOISE)
      .replace('#include <color_fragment>',`#include <color_fragment>
        { vec3 cc=diffuseColor.rgb; float mx=max(cc.r,max(cc.g,cc.b)), mn=min(cc.r,min(cc.g,cc.b)), sat=(mx-mn)/max(mx,0.001);
          float grass=step(cc.r*1.04,cc.g)*step(cc.b*1.04,cc.g)*step(0.18,sat), grey=(1.0-step(0.17,sat))*(1.0-step(0.8,mx)), wet=step(cc.r*1.15,cc.b)*step(cc.g*0.95,cc.b), snow=step(0.8,mx)*(1.0-step(0.2,sat));
          float up=abs(vDWN.y); vec2 q=up>0.5?vDWP.xz:(abs(vDWN.x)>abs(vDWN.z)?vDWP.zy:vDWP.xy);
          float m=_dfbm(q*1.7)-0.5, k; float hz=abs(vDWN.x)>abs(vDWN.z)?vDWP.z:vDWP.x;
          if(uDMode==1){ float r=vDWP.y*5.5, row=floor(r), f=fract(r), u=hz*3.2+row*0.5, j=fract(u);                // roof shingles: overlapping rows, staggered, each tile its own shade
            k=(0.88+_dh(vec2(floor(u),row))*0.2)*(0.78+0.22*smoothstep(0.0,0.35,f))*(1.0-0.18*(1.0-smoothstep(0.0,0.06,min(j,1.0-j))))+m*0.08; }
          else if(uDMode==2){ float r=vDWP.y*4.2, row=floor(r), f=fract(r), u=(up>0.5?vDWP.x:hz)*2.3+row*0.5, j=fract(u);   // dressed stone: courses and staggered joints
            k=(0.9+_dh(vec2(floor(u),row))*0.16)*(1.0-0.25*(1.0-smoothstep(0.0,0.07,min(f,1.0-f))))*(1.0-0.22*(1.0-smoothstep(0.0,0.05,min(j,1.0-j))))+m*0.1; }
          else if(uDMode==3){ k=1.0+m*0.16+(_dn(q*11.0)-0.5)*0.05; k*=0.9+0.1*smoothstep(0.0,0.6,vDWP.y-floor(vDWP.y/8.0)*8.0); }   // limewash plaster, a little grubbier low down
          else if(uDMode==4){ float u=(up>0.5?vDWP.x:vDWP.y)*4.0, j=fract(u); k=(0.9+_dh(vec2(floor(u),0.0))*0.14)*(1.0-0.2*(1.0-smoothstep(0.0,0.08,min(j,1.0-j))))+(_dn(vec2(hz*9.0,u*0.5))-0.5)*0.12; }   // planks and grain
          else if(wet>0.5&&up>0.5){ vec2 w=vDWP.xz*0.6; float a=sin(w.x*2.3+uDT*1.1+sin(w.y*1.7+uDT*0.7)*1.5), b=sin(w.y*2.9-uDT*0.9+sin(w.x*1.3-uDT*0.5)*1.4);   // water: slow swells and the sun glinting off their crests
            float cr=smoothstep(0.62,1.0,a*b)*(1.0-0.7*smoothstep(0.55,0.85,mx)), sw=_dfbm(w*0.35+vec2(uDT*0.04,-uDT*0.03))-0.5; k=1.0+sw*0.12+cr*0.07; diffuseColor.rgb+=vec3(0.035,0.05,0.055)*cr; }
          else if(wet>0.5){ k=1.0+m*0.06; }
          else if(snow>0.5&&up>0.5){ k=1.0+m*0.08+(_dn(q*5.0)-0.5)*0.04; }                                          // snow: barely a ripple
          else if(up>0.5&&grass>0.5){ float b=_dfbm(q*6.0+vec2(3.1,1.7))-0.5, spk=step(0.93,_dh(floor(q*14.0))); k=1.0+m*uDAmp*2.4+b*0.12+spk*0.07; }     // sward: broad mottling, a fine grain, the odd bright blade
          else if(up>0.5&&grey>0.5){ vec2 r=q*vec2(1.6,2.1); r.x+=step(1.0,mod(floor(r.y),2.0))*0.5; vec2 f=fract(r), id=floor(r);                    // flagstones, each its own shade, mortar between
            float edge=min(min(f.x,1.0-f.x)*1.6,min(f.y,1.0-f.y)*2.1); k=(0.92+_dh(id)*0.14)*(1.0-0.22*(1.0-smoothstep(0.02,0.07,edge)))+m*uDAmp; }
          else { float g=_dh(floor(q*9.0))-0.5, peb=step(0.955,_dh(floor(q*7.0+11.0))); k=1.0+m*uDAmp*2.0+g*uDGrit-peb*0.12; }                 // earth, sand, timber, rock: mottled grit and a pebble or two
          if(uDMode==0&&up<0.5){ float c=abs(fract(vDWP.y*2.2)-0.5); k*=1.0-uDStr*smoothstep(0.42,0.5,c); k*=0.86+0.14*smoothstep(-0.3,0.7,fract(vDWP.y)); }  // courses on the sides, a touch darker low in each
          diffuseColor.rgb*=clamp(k,0.6,1.3); }`); };
  mat.customProgramCacheKey=()=>'detail'+o.amp+'_'+o.strata+'_'+o.grit+'_'+o.mode; return mat; }
// a building material: flat-shaded like the rest, with a surface (roof shingles, dressed stone, plaster, planks)
const _BM={}; function bmat(h,mode){ const k=h+':'+mode; return _BM[k]||(_BM[k]=detailify(new THREE.MeshPhongMaterial({color:h,flatShading:true,shininess:6,specular:0x111111}),{mode})); }
// ── bake a static model: every plain flat-coloured part into one vertex-coloured mesh, the rest merged per material
//    (surfaced walls and roofs, glowing windows) — a building of a hundred parts becomes a handful of draws ──
const _VCM=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:6,specular:0x111111});
// V103 (LOOK2): buildings in the characters' own finish — soft, rounded edges that catch the light, clean smooth surfaces with a
//  gentle sheen (no brick or plaster patterning), and colours lifted to the same warmth and richness as the knight's
const _VCMS=new THREE.MeshPhongMaterial({vertexColors:true,shininess:16,specular:0x26221c});
const _SOFT={}; function softMat(hex){ if(_SOFT[hex]) return _SOFT[hex]; const c=new THREE.Color(hex), hsl={}; c.getHSL(hsl); c.setHSL((hsl.h+(hsl.h>0.1&&hsl.h<0.6?0:0.004))%1,Math.min(1,hsl.s*1.18+0.03),Math.min(0.92,hsl.l*1.02));
  const m=new THREE.MeshPhongMaterial({color:c,shininess:16,specular:0x26221c}); m.userData.soft=true; return _SOFT[hex]=m; }
function rbox(w,h,d,r){ const g=new THREE.BoxGeometry(1,1,1,3,3,3), P=g.attributes.position, N=g.attributes.normal, H=[w/2,h/2,d/2], v=[0,0,0], inn=[0,0,0];
  for(let i=0;i<P.count;i++){ v[0]=P.getX(i); v[1]=P.getY(i); v[2]=P.getZ(i);
    for(let k=0;k<3;k++){ const s=Math.sign(v[k]), a=Math.abs(v[k]); v[k]=a>0.4?s*H[k]:s*(H[k]-r); inn[k]=Math.max(-(H[k]-r),Math.min(H[k]-r,v[k])); }
    const dx=v[0]-inn[0], dy=v[1]-inn[1], dz=v[2]-inn[2], l=Math.hypot(dx,dy,dz); if(l>1e-6){ P.setXYZ(i,inn[0]+dx/l*r,inn[1]+dy/l*r,inn[2]+dz/l*r); N.setXYZ(i,dx/l,dy/l,dz/l); } }
  return g; }
function soften(g){ g.traverse(o=>{ if(!o.isMesh||o.userData.keep) return; const mt=o.material; if(!mt||Array.isArray(mt)||mt.transparent||mt.isMeshBasicMaterial||mt.map||mt.vertexColors||(mt.emissive&&mt.emissive.getHex())) return;
    const ge=o.geometry, pr=ge.parameters; if(ge.type==='BoxGeometry'&&pr){ const sx=Math.abs(o.scale.x), sy=Math.abs(o.scale.y), sz=Math.abs(o.scale.z), w=pr.width*sx, h=pr.height*sy, d=pr.depth*sz, mn=Math.min(w,h,d);
      if(mn>=0.05){ const r=Math.min(0.07,mn*0.3); o.geometry=rbox(pr.width,pr.height,pr.depth,Math.min(r/Math.max(sx,sy,sz),Math.min(pr.width,pr.height,pr.depth)*0.3)); } }
    if(mt.color&&(mt.isMeshPhongMaterial||mt.isMeshLambertMaterial)) o.material=softMat(mt.color.getHex()); }); return g; }
function mergeStatic(g){ g.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(), m4=new THREE.Matrix4(), c=new THREE.Color(), buckets=new Map(), drop=[];
  g.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.material||Array.isArray(o.material)||o.userData.keep) return; if(!o.visible){ drop.push(o); return; } const mt=o.material;
    const vc=mt.isMeshPhongMaterial&&!mt.userData.detail&&!mt.transparent&&!mt.map&&!(mt.emissive&&mt.emissive.getHex())&&!mt.vertexColors&&mt.side!==THREE.DoubleSide, sm=vc&&mt.userData.soft, key=vc?(sm?'vcs':'vc'):mt.uuid;
    let bk=buckets.get(key); if(!bk){ bk={mat:vc?(sm?_VCMS:_VCM):mt,pos:[],nor:[],col:[],vc,cast:false}; buckets.set(key,bk); }
    let ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); m4.multiplyMatrices(inv,o.matrixWorld); ge.applyMatrix4(m4); if(!ge.attributes.normal) ge.computeVertexNormals();
    const p=ge.attributes.position.array, n=ge.attributes.normal.array; for(let i=0;i<p.length;i++){ bk.pos.push(p[i]); bk.nor.push(n[i]); } if(vc){ c.copy(mt.color); for(let i=0;i<p.length/3;i++) bk.col.push(c.r,c.g,c.b); }
    bk.cast=bk.cast||o.castShadow; drop.push(o); });
  drop.forEach(o=>o.parent&&o.parent.remove(o));
  buckets.forEach(bk=>{ const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(bk.pos,3)); bg.setAttribute('normal',new THREE.Float32BufferAttribute(bk.nor,3)); if(bk.vc) bg.setAttribute('color',new THREE.Float32BufferAttribute(bk.col,3));
    const m=new THREE.Mesh(bg,bk.mat); m.castShadow=bk.cast; m.receiveShadow=true; g.add(m); });
  return g; }
const UNIT=(()=>{ const g=new THREE.BoxGeometry(1,1,1); g.translate(0,0.5,0); return g; })();
// one InstancedMesh for a list of items; fn(item, matrix, colour) fills each
// a flat floor of tiles as one seamless mesh: each top split in four, its colour running halfway into any neighbour that
// also blends (sand into seagrass, say), while patterned tiles (flags, gold) keep their own crisp colour
function tileFloor(list,y,mat){ const at=new Map(); list.forEach(q=>at.set(q.x+','+q.y,q)); const pos=[], col=[], nrm=[], C=new THREE.Color();
  list.forEach(q=>{ C.setHex(q.c); q.rgb=[C.r,C.g,C.b]; });
  const mix=(q,ns)=>{ if(!q.blend) return q.rgb; const l=[q.rgb]; ns.forEach(([a,b])=>{ const n=at.get((q.x+a)+','+(q.y+b)); if(n&&n.blend) l.push(n.rgb); }); return [0,1,2].map(i=>l.reduce((s,c)=>s+c[i],0)/l.length); };
  list.forEach(q=>{ const {x,y:z}=q, c=q.rgb, P=(u,v)=>[x+u,y,z+v];
    const N=mix(q,[[0,-1]]), S=mix(q,[[0,1]]), Wc=mix(q,[[-1,0]]), E=mix(q,[[1,0]]), NW=mix(q,[[-1,0],[0,-1],[-1,-1]]), NE=mix(q,[[1,0],[0,-1],[1,-1]]), SW=mix(q,[[-1,0],[0,1],[-1,1]]), SE=mix(q,[[1,0],[0,1],[1,1]]);
    const quad=(a,b,cc,d,ca,cb,c3,cd)=>{ pos.push(...a,...b,...cc,...a,...cc,...d); col.push(...ca,...cb,...c3,...ca,...c3,...cd); for(let i=0;i<6;i++) nrm.push(0,1,0); };
    quad(P(0,0),P(0,0.5),P(0.5,0.5),P(0.5,0),NW,Wc,c,N); quad(P(0.5,0),P(0.5,0.5),P(1,0.5),P(1,0),N,c,E,NE);
    quad(P(0,0.5),P(0,1),P(0.5,1),P(0.5,0.5),Wc,SW,S,c); quad(P(0.5,0.5),P(0.5,1),P(1,1),P(1,0.5),c,S,SE,E); });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat||detailify(new THREE.MeshLambertMaterial({vertexColors:true}))); m.receiveShadow=true; return m; }
// an ink outline for a model built of many parts (the knight, his steed, the demons): each solid part gets a dark shell,
// pushed out along its normals and drawn from behind — the line the sprites were drawn with
const _INK={}; function inkMat(th,col){ const k=th+':'+(col||0); if(_INK[k]) return _INK[k]; const m=new THREE.MeshBasicMaterial({color:col||0x1c1418,side:THREE.BackSide});
  m.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed+=normalize(normal)*'+th.toFixed(4)+';'); }; m.customProgramCacheKey=()=>'ink'+k; return _INK[k]=m; }
// THE OCARINA LOOK: no ink lines round anything, and a softer, fuller light (more sky fill, a gentler sun) — set OOT_LOOK=false for the old inked look
const OOT_LOOK=true;
function ootLight(scene){ if(!OOT_LOOK||!scene||scene.userData.oot) return; scene.userData.oot=true;
  scene.traverse(o=>{ if(o.isHemisphereLight){ o.intensity*=1.28; o.groundColor.lerp(o.color,0.22); } else if(o.isDirectionalLight){ o.intensity*=0.86; } }); }
function inkify(g,th,col){ if(OOT_LOOK) return g; const list=[]; g.traverse(o=>{ if(!o.isMesh||o.userData.ink||o.userData.inked||o.userData.outline) return; const mt=o.material; if(!mt||mt.transparent||mt.isMeshBasicMaterial||mt.side===THREE.DoubleSide||!o.geometry.attributes.normal) return; list.push(o); });
  list.forEach(o=>{ const sc=Math.max(0.05,(o.scale.x+o.scale.y+o.scale.z)/3), ol=new THREE.Mesh(o.geometry,inkMat(Math.round((th||0.014)/sc*1000)/1000,col)); ol.userData.ink=true; ol.castShadow=false; ol.receiveShadow=false; o.userData.inked=true; o.add(ol); }); return g; }
// wider halls in close quarters: a wall tile next to open floor is drawn (and walked) shrunk back by m on that side, so a
// one-tile corridor of the game's grid reads, and walks, about 1+2m wide — the grid, and what the demons follow, unchanged
function wallInset(isWall,isFree,m){
  const box=(x,y)=>{ const l=isFree(x-1,y)?m:0, r=isFree(x+1,y)?m:0, u=isFree(x,y-1)?m:0, d=isFree(x,y+1)?m:0; return {cx:x+0.5+(l-r)/2, cz:y+0.5+(u-d)/2, sx:1-l-r, sz:1-u-d}; };
  const free=(fx,fz)=>{ const x=Math.floor(fx), y=Math.floor(fz); if(isFree(x,y)) return true; if(!isWall(x,y)) return false; const u=fx-x, v=fz-y;
    return (u<m&&isFree(x-1,y))||(u>1-m&&isFree(x+1,y))||(v<m&&isFree(x,y-1))||(v>1-m&&isFree(x,y+1)); };
  return {box,free,m}; }
function inst(list,geo,material,fn,par,noColour){ const im=new THREE.InstancedMesh(geo||UNIT,material||detailify(new THREE.MeshLambertMaterial()),Math.max(1,list.length));
  im.count=list.length; list.forEach((it,i)=>{ M4.identity(); C.setHex(0xffffff); fn(it,M4,C); im.setMatrixAt(i,M4); if(!noColour) im.setColorAt(i,C); });
  im.castShadow=true; im.receiveShadow=true; par.add(im); return im; }
// a flame that flickers (register its tick in a level's anim list)
function flame(x,y,z,par,anim,s){ const f=new THREE.Mesh(new THREE.ConeGeometry(0.045*(s||1),0.13*(s||1),6),glow(0xffd27a)); f.position.set(x,y,z); par.add(f);
  const k=Math.random()*9; anim.push(t=>{ f.scale.y=1+Math.sin(t*9+k)*0.18; f.scale.x=1+Math.sin(t*13+k)*0.1; }); return f; }
// canvas-painted stained glass, self-lit: 'lancet' (pointed arch) or 'rose'; cols are '#rrggbb' strings
function glassTex(cols,k,kind){ const c=document.createElement('canvas'), g=c.getContext('2d');
  if(kind==='rose'){ c.width=c.height=128; const R=60; g.fillStyle='#2a2420'; g.beginPath(); g.arc(64,64,R+3,0,7); g.fill();
    for(let i=0;i<12;i++){ const a=i*Math.PI/6; g.fillStyle=cols[i%cols.length]; g.beginPath(); g.moveTo(64,64); g.arc(64,64,R-3,a+0.05,a+Math.PI/6-0.05); g.closePath(); g.fill(); }
    g.fillStyle='#2a2420'; g.beginPath(); g.arc(64,64,30,0,7); g.fill();
    for(let i=0;i<8;i++){ const a=i*Math.PI/4+0.2; g.fillStyle=cols[(i+1)%cols.length]; g.beginPath(); g.moveTo(64,64); g.arc(64,64,27,a+0.06,a+Math.PI/4-0.06); g.closePath(); g.fill(); }
    g.fillStyle='#2a2420'; g.beginPath(); g.arc(64,64,12,0,7); g.fill(); g.fillStyle='#fff6d8'; g.beginPath(); g.arc(64,64,9,0,7); g.fill();
  } else { c.width=64; c.height=160; const arch=()=>{ g.beginPath(); g.moveTo(4,160); g.lineTo(4,50); g.quadraticCurveTo(4,8,32,2); g.quadraticCurveTo(60,8,60,50); g.lineTo(60,160); g.closePath(); };
    g.save(); arch(); g.clip(); for(let i=0;i<8;i++) for(let j=0;j<14;j++){ g.fillStyle=cols[(i+j+k)%cols.length]; g.fillRect(i*8,j*12,8,12); }
    g.fillStyle='rgba(30,24,20,0.55)'; for(let i=0;i<=8;i++) g.fillRect(i*8-1,0,2,160); for(let j=0;j<=14;j++) g.fillRect(0,j*12-1,64,2);
    g.fillStyle='rgba(255,255,255,0.18)'; g.fillRect(0,0,64,40); g.restore(); g.strokeStyle='#2a2420'; g.lineWidth=5; arch(); g.stroke(); }
  const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
function pane(tex,w,h,x,y,z,ry,par){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,fog:false})); m.position.set(x,y,z); m.rotation.y=ry||0; par.add(m); return m; }
const hexn=s=>parseInt(String(s).replace('#',''),16);
// a small gold relief of a town's sign (the pulpit carving, shop boards): crown, wheat, anvil, anchor, rose, star, crystal, sheaf, lamp, rainbow
function signRelief(kind,c,cL,par){ const g=group(0,0,0,par), b=(w,h,x,y,col)=>B(w,h,0.03,col||cL,x,y,0,g);
  switch(kind){
    case 'crown': b(0.4,0.12,0,-0.06); [-0.17,0,0.17].forEach((x,i)=>b(0.07,i===1?0.16:0.11,x,0.06)); break;
    case 'wheat': b(0.04,0.4,0,-0.2); for(let i=0;i<3;i++){ b(0.1,0.05,-0.07,-0.1+i*0.1); b(0.1,0.05,0.07,-0.1+i*0.1); } break;
    case 'anvil': b(0.4,0.1,0,0.02); b(0.18,0.12,0,-0.1); b(0.3,0.05,0,-0.15); break;
    case 'anchor': b(0.04,0.36,0,-0.16); b(0.22,0.04,0,0.12); b(0.3,0.04,0,-0.16); b(0.04,0.08,-0.15,-0.14); b(0.04,0.08,0.15,-0.14); break;
    case 'rose': Sp(0.11,cL,0,0,0.02,g,8,6); b(0.03,0.16,0,-0.24,0x3a6a3a); break;
    case 'star': [0,Math.PI/4,Math.PI/2,-Math.PI/4].forEach(a=>{ const m=b(0.05,0.4,0,-0.2); m.rotation.z=a; m.position.y=0; }); break;
    case 'crystal': { const m=Co(0.12,0.32,4,cL,0,-0.16,0.02,g); } break;
    case 'sheaf': for(let i=-2;i<=2;i++){ const m=b(0.04,0.34,i*0.06,-0.17); m.rotation.z=i*0.12; } b(0.3,0.04,0,-0.05,c); break;
    case 'lamp': b(0.16,0.2,0,-0.1,0x2a2420); b(0.08,0.12,0,-0.06,0xffd27a); break;
    case 'rainbow': [0xe84a4a,0xf0b030,0xf4e040,0x5ac87a,0x4a8ae8,0xa86ae8].forEach((col,i)=>{ const m=new THREE.Mesh(new THREE.TorusGeometry(0.2-i*0.025,0.012,4,16,Math.PI),flat(col)); g.add(m); }); break;
    default: b(0.05,0.36,0,-0.18); b(0.24,0.05,0,0.06);   // a cross
  }
  return g; }
