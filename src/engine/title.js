// ════════════════════════════════════════════════════════════════
//  TITLE (V179) — the boot, as the 2D game has it: the Restful Knight crest, "kspearproductions presents", the title (the
//  knight's sword sweeps across, KINGDOM'S LAST KNIGHT slams in, PRESS Ⓐ), then CHOOSE YOUR KNIGHT (three slots), then a
//  load-in card while the realm comes up behind it. The title is a real 3D scene, not pixel art: the knight himself — the
//  game's own model, in your livery — sits on a root under the great oak with the Word open on his knees, the valley and its
//  village below, clouds going over, birds, the Homestead theme.
//  Skipped for a #hash start (tests, dev links), ?notitle, or window.NO_TITLE.
//  TITLE.show() · TITLE.up (true while it's on screen: the game's frame loop holds, the clock doesn't run)
// ════════════════════════════════════════════════════════════════
const TITLE=(function(){
  const LOGO='data:image/png;base64,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';
  let el=null, cv=null, R=null, scene=null, cam=null, kn=null, phase='off', t0=0, cursor=0, padPrev={}, raf=0, busy=false, onDone=null;
  const now=()=>performance.now();
  const skip=()=>!!(location.hash&&location.hash.length>1)||/notitle/.test(location.search)||window.NO_TITLE;
  const CSS=`
#ttl{position:fixed;inset:0;z-index:9000;background:#0d0208;overflow:hidden;font-family:var(--f-body,system-ui);color:#f3ead6;user-select:none;-webkit-user-select:none;cursor:pointer}
#ttl canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#ttl .lay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .5s}
#ttl .hid{opacity:0;pointer-events:none}
#ttlLogo img{width:min(46vmin,340px);image-rendering:pixelated;filter:drop-shadow(0 0 24px rgba(242,193,78,.18))}
#ttlSplash .who{font-family:var(--f-display,serif);font-size:clamp(20px,3.4vw,34px);color:#e8dcff;text-shadow:0 0 14px rgba(200,170,255,.6)}
#ttlSplash .pr{margin-top:10px;font-size:clamp(12px,1.5vw,16px);color:#8a7aa8;letter-spacing:.3em}
#ttl #ttlTitle{justify-content:flex-start;padding-top:6vh}
#ttlTitle .k1{font-family:var(--f-display,serif);font-size:clamp(18px,3vw,34px);color:#f2c14e;letter-spacing:.12em;text-shadow:0 2px 0 #3a2a10,0 0 2px #3a2a10,2px 2px 0 #3a2a10,-1px -1px 0 #3a2a10;opacity:0;transform:translateY(-14px);transition:all .45s ease-out}
#ttlTitle .k2{font-family:var(--f-display,serif);font-size:clamp(40px,8.4vw,104px);color:#f7f9fd;line-height:1;margin-top:2px;letter-spacing:.03em;text-shadow:0 3px 0 #141c2e,3px 3px 0 #141c2e,-2px -2px 0 #141c2e,2px -2px 0 #141c2e,-2px 2px 0 #141c2e,0 0 30px rgba(20,28,46,.6);opacity:0;transform:translateX(40vw);transition:transform .42s cubic-bezier(.2,1.4,.4,1),opacity .2s}
#ttlTitle.on .k1{opacity:1;transform:none;transition-delay:.62s}
#ttlTitle.on .k2{opacity:1;transform:none;transition-delay:.36s}
#ttlSword{position:absolute;top:calc(6vh + clamp(18px,3vw,34px)*1.3 + clamp(40px,8.4vw,104px)*1.02);left:50%;width:min(64vw,760px);transform:translateX(-170vw);filter:drop-shadow(0 3px 2px rgba(0,0,0,.35))}
#ttlTitle.on #ttlSword{animation:ttlSw .62s cubic-bezier(.25,.9,.35,1.08) forwards}
@keyframes ttlSw{0%{transform:translateX(-170vw)}80%{transform:translateX(-47%)}100%{transform:translateX(-50%)}}
#ttlFlash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
#ttlTitle.on #ttlFlash{animation:ttlFl .5s .3s ease-out}
@keyframes ttlFl{0%{opacity:.8}100%{opacity:0}}
#ttlPress{position:absolute;bottom:9vh;font-family:var(--f-display,serif);font-size:clamp(18px,2.4vw,28px);color:#ffe9c0;text-shadow:0 2px 0 #1c2e1a,2px 2px 0 #1c2e1a,-1px -1px 0 #1c2e1a;opacity:0}
#ttlTitle.on #ttlPress{animation:ttlBl 1s 1.3s steps(1) infinite}
@keyframes ttlBl{0%{opacity:1}50%{opacity:0}}
#ttlFoot{position:absolute;bottom:2.4vh;font-size:12px;color:#2e4a2c;text-shadow:0 1px 0 rgba(255,255,255,.3)}
#ttlSel{background:rgba(8,5,16,.72)}
#ttlSel h2{font-family:var(--f-display,serif);font-weight:400;color:#f2c14e;font-size:clamp(22px,3.2vw,36px);margin:0 0 3vh;letter-spacing:.06em;text-shadow:0 2px 0 #3a2a10}
.ttlSlot{width:min(560px,86vw);box-sizing:border-box;margin:0 0 14px;padding:14px 18px 14px 44px;background:rgba(24,18,40,.92);border:2px solid #4a3e66;border-radius:10px;position:relative;transition:transform .12s,border-color .12s,background .12s}
.ttlSlot.cur{background:rgba(60,40,90,.94);border-color:#e94560;transform:scale(1.025)}
.ttlSlot.cur:before{content:'▶';position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#ffe9c0}
.ttlSlot .n{font-family:var(--f-display,serif);font-size:20px;color:#b8aed0}.ttlSlot.cur .n{color:#eef0f4}
.ttlSlot .m{font-size:14px;color:#6a8a6e;margin-top:4px}.ttlSlot.cur .m{color:#8fd692}
.ttlSlot .e{font-family:var(--f-display,serif);font-size:19px;color:#7a6a9a}.ttlSlot.cur .e{color:#c7a6ff}
#ttl .ttlSub,#ttl .ttlBox{width:min(520px,82vw);box-sizing:border-box;margin:-6px 0 14px;padding:10px 12px;background:rgba(14,10,26,.95);border:1px solid #4a3e66;border-radius:0 0 10px 10px}
#ttl .ttlOpt{padding:9px 14px;border-radius:7px;color:#b8aed0;font-size:16px;cursor:pointer}
#ttl .ttlOpt.cur{background:rgba(233,69,96,.22);color:#fff;box-shadow:inset 0 0 0 1px #e94560}
#ttl .ttlOpt.red{color:#ff8a8a}
#ttl .q{color:#e8dcbb;font-size:14px;margin:2px 4px 8px}
#ttl .ttlBox textarea{width:100%;box-sizing:border-box;background:#0a0612;color:#e8dcbb;border:1px solid #5a4a7a;border-radius:6px;padding:8px;font:12px/1.4 monospace;resize:none;user-select:text;-webkit-user-select:text}
#ttl .ttlBox .row{display:flex;gap:8px;margin-top:8px}
#ttl .ttlMsg{color:#8fd692;font-size:14px;margin-top:4px;text-align:center}
#ttlSel .hint{margin-top:2vh;color:#7a6a9a;font-size:14px}
#ttl #ttlLoad{background:#0a0612 radial-gradient(ellipse at center,#1d1430 0%,#0a0612 75%);z-index:2}
#ttlLoad img{width:min(22vmin,150px);image-rendering:pixelated;opacity:.9;animation:ttlBr 2.4s ease-in-out infinite}
@keyframes ttlBr{50%{opacity:.6;transform:scale(.97)}}
#ttlLoad .who{font-family:var(--f-display,serif);font-size:clamp(22px,3vw,32px);color:#f2c14e;margin-top:18px}
#ttlLoad .where{color:#b8aed0;margin-top:4px;font-size:15px}
#ttlLoad .vs{max-width:min(560px,84vw);text-align:center;margin-top:4vh;font-style:italic;color:#e8dcbb;line-height:1.5;font-size:clamp(15px,1.8vw,19px)}
#ttlLoad .rf{color:#8a7aa8;font-style:normal;font-size:13px;margin-top:6px}
#ttl #ttlLoad .ttlBar{width:min(360px,70vw);height:6px;min-height:0;max-height:6px;border-radius:3px;background:#2a2040;margin-top:4vh;overflow:hidden;padding:0;border:0;position:static}
#ttl #ttlLoad .ttlBar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#c9a94a,#f2c14e);transition:width 1.5s cubic-bezier(.3,.6,.4,1)}
#ttlVeil{position:absolute;inset:0;background:#05030a;opacity:0;pointer-events:none;transition:opacity .5s}`;
  const VERSES=[['Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.','Joshua 1:9'],
    ['Your word is a lamp to my feet and a light to my path.','Psalm 119:105'],['Put on the full armor of God, so that you can take your stand against the devil’s schemes.','Ephesians 6:11'],
    ['The light shines in the darkness, and the darkness has not overcome it.','John 1:5'],['Those who hope in the Lord will renew their strength. They will soar on wings like eagles.','Isaiah 40:31'],
    ['The Lord is my shepherd; I shall not want.','Psalm 23:1'],['I can do all this through him who gives me strength.','Philippians 4:13']];
  const SWORD=`<svg viewBox="0 0 760 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tbl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#e3e6ee"/><stop offset=".55" stop-color="#b9c0cc"/><stop offset="1" stop-color="#8a92a2"/></linearGradient>
    <linearGradient id="tgd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#d8b24a"/><stop offset="1" stop-color="#8a6a20"/></linearGradient></defs>
    <circle cx="14" cy="20" r="10" fill="url(#tgd)" stroke="#5a4210" stroke-width="2"/><rect x="22" y="14" width="68" height="12" rx="4" fill="#6a3e1c" stroke="#3a200c" stroke-width="2"/>
    <path d="M30 14v12M42 14v12M54 14v12M66 14v12M78 14v12" stroke="#4a2a10" stroke-width="2"/><rect x="90" y="3" width="16" height="34" rx="4" fill="url(#tgd)" stroke="#5a4210" stroke-width="2"/>
    <path d="M106 11 H700 L752 20 L700 29 H106 Z" fill="url(#tbl)" stroke="#59606e" stroke-width="2"/><path d="M114 20 H690" stroke="#9aa2b2" stroke-width="3"/><path d="M106 12 H700" stroke="#fff" stroke-width="1.5" opacity=".9"/></svg>`;

  // ── the scene, in the concept art's hand (Breath of the Wild by way of Luminar): soft cel bands, a wind-combed meadow, haze
  //    that turns the far ranges blue, a keep on a far ridge, painted cumulus, the sun behind it all and a bloom on the light ──
  let comp=null, grassU=null;
  const C0={x:3.1,z:4.7}, AX=Math.atan2(-0.371,-0.928);   // the camera's foot and its heading: bearings below are degrees right of it
  const at=(b,D)=>{ const a=AX-b*Math.PI/180; return [C0.x+Math.sin(a)*D,C0.z+Math.cos(a)*D]; };
  const hillY=(x,z)=>{ let y=-2.2; [[-3,1,11,2.25,9],[-8,5,10,2.4,8]].forEach(([cx,cz,sx,sy,sz])=>{ const q=1-((x-cx)/sx)**2-((z-cz)/sz)**2; if(q>0) y=Math.max(y,-2.2+sy*Math.sqrt(q)); }); return y; };
  let GM=null; function toonMap(){ if(GM) return GM; const d=new Uint8Array([78,78,78,255,140,140,140,255,196,196,196,255,224,224,224,255]); GM=new THREE.DataTexture(d,4,1,THREE.RGBAFormat); GM.minFilter=GM.magFilter=THREE.NearestFilter; GM.needsUpdate=true; return GM; }
  const toon=(c,o)=>new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:toonMap()},o||{}));
  function cloudTex(seed){ const c=document.createElement('canvas'); c.width=512; c.height=256; const x=c.getContext('2d'); let s=seed*9301+49297; const r=()=>((s=(s*9301+49297)%233280)/233280);
    const puffs=[]; for(let i=0;i<26;i++){ const px=70+r()*372, py=150-Math.pow(r(),0.7)*95-Math.max(0,1-Math.abs(px-256)/200)*25, pr=26+r()*44*(1-Math.abs(px-256)/300); puffs.push([px,py,pr]); }
    puffs.forEach(([px,py,pr])=>{ const g=x.createRadialGradient(px,py+pr*0.35,pr*0.2,px,py,pr); g.addColorStop(0,'rgba(196,212,232,1)'); g.addColorStop(0.55,'rgba(226,236,246,1)'); g.addColorStop(1,'rgba(240,246,252,0)'); x.fillStyle=g; x.beginPath(); x.arc(px,py,pr,0,7); x.fill(); });
    puffs.forEach(([px,py,pr])=>{ const g=x.createRadialGradient(px-pr*0.2,py-pr*0.35,0,px,py-pr*0.2,pr*0.8); g.addColorStop(0,'rgba(255,255,255,0.95)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.beginPath(); x.arc(px,py-pr*0.2,pr*0.8,0,7); x.fill(); });
    const t=new THREE.CanvasTexture(c); return t; }
  function build(){ R=new THREE.WebGLRenderer({canvas:cv,antialias:true}); R.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
    scene=new THREE.Scene(); scene.fog=new THREE.Fog(0xc8dde6,70,620); cam=new THREE.PerspectiveCamera(38,1,0.1,1200);
    // the sky: a painted dome, deep at the top, pale and a little warm at the horizon, the sun's glow off to the right
    const sunB=34, sunE=17*Math.PI/180, sa=AX-sunB*Math.PI/180, SUN=new THREE.Vector3(Math.sin(sa)*Math.cos(sunE),Math.sin(sunE),Math.cos(sa)*Math.cos(sunE));
    const sky=new THREE.Mesh(new THREE.SphereGeometry(900,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{uSun:{value:SUN}},
      vertexShader:'varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:`uniform vec3 uSun; varying vec3 vD; void main(){ float h=clamp(vD.y,0.0,1.0); vec3 top=vec3(0.22,0.52,0.86), mid=vec3(0.52,0.76,0.93), hor=vec3(0.90,0.94,0.90);
        vec3 c=mix(hor,mid,smoothstep(0.0,0.18,h)); c=mix(c,top,smoothstep(0.18,0.75,h)); float s=max(dot(normalize(vD),uSun),0.0); c+=vec3(1.0,0.86,0.6)*pow(s,10.0)*0.22+vec3(1.0,0.95,0.8)*smoothstep(0.9985,0.9995,s)*1.3; if(vD.y<0.0) c=hor; gl_FragColor=vec4(c,1.0); }`}));
    scene.add(sky);
    scene.add(new THREE.HemisphereLight(0xcfe6ff,0x6a8a4a,0.42));
    const sun=new THREE.DirectionalLight(0xffeccb,0.78); sun.position.set(16,20,9); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); const sc=sun.shadow.camera; sc.left=-9; sc.right=9; sc.top=9; sc.bottom=-9; sc.near=1; sc.far=80; sun.shadow.bias=-0.0005; scene.add(sun);
    const rim=new THREE.DirectionalLight(0xffe2b0,0.3); rim.position.copy(SUN).multiplyScalar(30); scene.add(rim);   // the sun behind: a rim of light on him and the oak
    // the far ranges: the farthest blue and snow-capped, the nearer greener; a keep on a ridge, small in the haze
    const peak=(b,D,r,h,col,snow,seg)=>{ const g=new THREE.ConeGeometry(r,h,seg||9,4); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i); if(y<h/2-0.01){ const k=1+(Math.sin(i*12.9898)*0.5)*0.22; p.setX(i,p.getX(i)*k); p.setZ(i,p.getZ(i)*k); p.setY(i,y+Math.sin(i*7.1)*h*0.04); } } g.computeVertexNormals();
      const m=new THREE.Mesh(g,toon(col,{flatShading:true})); const [x,z]=at(b,D); m.position.set(x,-2.2+h/2-h*0.08,z); m.rotation.y=b; scene.add(m);
      if(snow){ const s=new THREE.Mesh(new THREE.ConeGeometry(r*0.36,h*0.36,seg||9,1),toon(0xeef4fb,{flatShading:true})); s.position.set(x,-2.2+h-h*0.08-h*0.18+0.4,z); s.rotation.y=b; scene.add(s); } return m; };
    [[-40,330,90,95,0xa9c0d8,1],[-12,360,110,150,0xb2c6dc,1],[16,340,95,110,0xa9c0d8,1],[44,320,85,80,0xb2c8dc,0],[-62,300,70,60,0xb4c8da,0],[60,300,80,70,0xb0c4d6,0]].forEach(a=>peak(...a));
    [[-30,170,55,34,0x8fb0b0],[-6,190,60,40,0x94b4b6],[22,175,58,30,0x8fb0ae],[46,160,50,26,0x96b6b2],[-52,150,45,24,0x98b8b4]].forEach(a=>peak(a[0],a[1],a[2],a[3],a[4],0,12));
    // the keep on its ridge (Luminar's: walls, two towers, a spire), hazed with distance
    { const [kx,kz]=at(6,230), g=new THREE.Group(), km=toon(0x9eb0c0,{flatShading:true}), rm=toon(0x7d90b0,{flatShading:true}); const rg=new THREE.Mesh(new THREE.ConeGeometry(30,12,10),toon(0x8eb0a8,{flatShading:true})); rg.position.y=4; g.add(rg);
      [[0,0,7,5,6],[-6,1,2.2,11,2.2],[6,-1,2.2,10,2.2],[0,-3,2.6,15,2.6]].forEach(([x,z,w,h,d])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),km); b.position.set(x,9.5+h/2,z); g.add(b); if(h>8){ const c=new THREE.Mesh(new THREE.ConeGeometry(w*0.85,w*1.6,4),rm); c.position.set(x,9.5+h+w*0.8,z); c.rotation.y=Math.PI/4; g.add(c); } });
      g.position.set(kx,-2.2,kz); scene.add(g); }
    // the valley floor and its fields; his hill
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),toon(0x86b86c)); fl.rotation.x=-Math.PI/2; fl.position.y=-2.2; fl.receiveShadow=true; scene.add(fl);
    for(let i=0;i<10;i++){ const [x,z]=at(-30+i*7+((i*13)%5),45+((i*17)%5)*14); const f=new THREE.Mesh(new THREE.PlaneGeometry(14+((i*5)%7)*3,8+((i*3)%4)*3),toon([0xa8c870,0x94c070,0xc0cc78,0x7fb066][i%4])); f.rotation.x=-Math.PI/2; f.rotation.z=i*0.7; f.position.set(x,-2.18,z); scene.add(f); }
    const lump=(c,x,z,sx,sy,sz)=>{ const g=new THREE.SphereGeometry(1,64,24); const m=new THREE.Mesh(g,toon(c)); m.position.set(x,-2.2,z); m.scale.set(sx,sy,sz); m.receiveShadow=true; scene.add(m); };
    lump(0x6fae55,-3,1,11,2.25,9); lump(0x7ab85e,-8,5,10,2.4,8);
    // a path worn down the hill toward the village
    { const pts=[]; for(let i=0;i<=24;i++){ const u=i/24, x=1.6+u*7+Math.sin(u*5)*1.2, z=1.2-u*14; pts.push([x,z]); } const pos=[]; for(let i=0;i<pts.length-1;i++){ const [x0,z0]=pts[i], [x1,z1]=pts[i+1], w=0.55+i*0.05, nx=-(z1-z0), nz=x1-x0, L=Math.hypot(nx,nz); const ax=nx/L*w, az=nz/L*w;
        const q=[[x0-ax,z0-az],[x0+ax,z0+az],[x1+ax,z1+az],[x1-ax,z1-az]].map(([x,z])=>[x,hillY(x,z)+0.03,z]); pos.push(...q[0],...q[1],...q[2],...q[0],...q[2],...q[3]); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.computeVertexNormals(); const m=new THREE.Mesh(g,toon(0xd8c08a,{side:THREE.DoubleSide})); m.receiveShadow=true; scene.add(m); }
    // the meadow: blades combed by the wind, darker at the root, sun-yellow at the tips; flowers among them
    { const bl=new THREE.PlaneGeometry(0.06,0.42,1,3); bl.translate(0,0.21,0); const p=bl.attributes.position, col=[]; for(let i=0;i<p.count;i++){ const y=p.getY(i)/0.42; p.setX(i,p.getX(i)*(1-y*0.9)); const c=new THREE.Color(0x3e7a32).lerp(new THREE.Color(0xc8e070),y*y); col.push(c.r,c.g,c.b); } bl.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      const N=9000, mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}); grassU={value:0};
      mat.onBeforeCompile=sh=>{ sh.uniforms.uT=grassU; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vec4 ip=instanceMatrix*vec4(0.0,0.0,0.0,1.0); float hk=position.y/0.42; float w=sin(uT*1.6+ip.x*0.35+ip.z*0.22)*0.5+sin(uT*3.1+ip.x*1.3)*0.18; transformed.x+=w*hk*hk*0.16; transformed.z+=w*hk*hk*0.08;'); };
      const im=new THREE.InstancedMesh(bl,mat,N), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), S3=new THREE.Vector3(), P3=new THREE.Vector3(), cc=new THREE.Color(); let n=0, s=7;
      const rnd=()=>((s=(s*16807)%2147483647)/2147483647);
      while(n<N){ const a=rnd()*Math.PI*2, r=Math.sqrt(rnd())*13, x=-1.5+Math.cos(a)*r, z=1+Math.sin(a)*r*0.9; const y=hillY(x,z); if(y<-2.1) continue; if(Math.hypot(x+0.32,z+0.12)<0.75||Math.hypot(x-3.1,z-4.4)<2.6) continue;
        E.set((rnd()-0.5)*0.4,rnd()*6.3,(rnd()-0.5)*0.4); Q.setFromEuler(E); const h=0.6+rnd()*0.9+(r>6?0.3:0); S3.set(1,h,1); P3.set(x,y-0.02,z); M.compose(P3,Q,S3); im.setMatrixAt(n,M); cc.setHSL(0.24+rnd()*0.06,0.5+rnd()*0.2,0.42+rnd()*0.14); im.setColorAt(n,cc); n++; }
      im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; im.frustumCulled=false; scene.add(im);
      const fg=new THREE.IcosahedronGeometry(0.06,0), fm=new THREE.MeshLambertMaterial(), F=new THREE.InstancedMesh(fg,fm,420); const FC=[0xffffff,0xfff1a0,0xff9ab8,0xa8c8ff,0xffd060]; for(let i=0;i<420;i++){ let x,z,y; do{ const a=rnd()*6.283, r=Math.sqrt(rnd())*12; x=-1.5+Math.cos(a)*r; z=1+Math.sin(a)*r*0.9; y=hillY(x,z); }while(y<-2.1);
        M.makeTranslation(x,y+0.2+rnd()*0.12,z); F.setMatrixAt(i,M); cc.setHex(FC[i%5]); F.setColorAt(i,cc); } scene.add(F); }
    // the great oak: a gnarled trunk that forks, a crown of clumped leaves lit from above, darker beneath
    { const g=new THREE.Group(), bark=toon(0x6a4a2e,{flatShading:true}); const seg=(a,b,r0,r1)=>{ const v=new THREE.Vector3().subVectors(b,a), L=v.length(); const c=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,8),bark); c.position.copy(a).addScaledVector(v,0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()); c.castShadow=true; g.add(c); };
      const V=(x,y,z)=>new THREE.Vector3(x,y,z); seg(V(0,-0.3,0),V(0.1,2.4,0.05),0.72,0.5); seg(V(0.1,2.3,0.05),V(-1.4,4.6,0.4),0.5,0.24); seg(V(0.1,2.3,0.05),V(1.5,4.3,-0.3),0.45,0.22); seg(V(0.05,2.6,0),V(0.3,5.2,-0.9),0.38,0.18); seg(V(-1.3,4.4,0.4),V(-2.6,5.0,1.1),0.22,0.1);
      [[0.8,0,0.4],[-0.7,0,-0.5],[0.2,0,-0.8],[-0.4,0,0.7]].forEach(([x,,z])=>seg(V(0,0.25,0),V(x*1.3,-0.25,z*1.3),0.42,0.14));
      const lm=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:toonMap()}), top=new THREE.Color(0x9ad468), bot=new THREE.Color(0x2f6a32);
      const clumps=[[0,5.6,0,2.0],[-1.8,5.1,0.6,1.7],[1.8,5.0,-0.3,1.6],[-0.4,6.6,-0.6,1.6],[1.0,6.1,0.9,1.4],[-2.9,4.9,1.4,1.25],[2.8,4.6,0.5,1.15],[0.6,4.7,-1.6,1.4],[-1.2,4.5,-1.5,1.3],[-0.8,5.4,1.8,1.3],[2.0,5.9,-1.3,1.2],[-2.3,6.0,-0.4,1.2],[0.3,7.2,0.5,1.1],[3.4,5.2,-0.9,0.9],[-3.5,5.5,0.2,0.95]];
      clumps.forEach(([x,y,z,r],i)=>{ const geo=new THREE.SphereGeometry(r,18,12); const p=geo.attributes.position, col=[]; for(let j=0;j<p.count;j++){ const k=1+Math.sin(p.getX(j)*2.1+p.getZ(j)*1.7+i)*0.05; p.setXYZ(j,p.getX(j)*k,p.getY(j)*k*0.84,p.getZ(j)*k); const u=Math.min(1,Math.max(0,(p.getY(j)/r+1)/2*0.8+(y-4.4)/4)); const c=bot.clone().lerp(top,u); col.push(c.r,c.g,c.b); }
        geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); geo.computeVertexNormals(); const m=new THREE.Mesh(geo,lm); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; g.add(m); });
      g.position.set(-2.8,hillY(-2.8,-3.0)-0.1,-3.0); g.rotation.y=0.5; g.scale.setScalar(0.7); scene.add(g); scene.userData.oak=g; }
    // the stone he sits on, moss on its shoulder
    const st=new THREE.Mesh(new THREE.DodecahedronGeometry(0.5,1),toon(0x9a9a94,{flatShading:true})); st.scale.set(1.25,0.62,1.0); st.position.set(-0.32,0.13,-0.12); st.rotation.y=0.4; st.castShadow=st.receiveShadow=true; scene.add(st);
    const ms=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,6),toon(0x5a8a42,{flatShading:true})); ms.scale.set(1.5,0.3,1.0); ms.position.set(-0.55,0.38,-0.32); scene.add(ms);
    // the village: Hearthvale's plaster and thatch, a chapel, a windmill turning
    const house=(x,z,w,d,h,ry,roof)=>{ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),toon(0xf2e8d0)); b.position.y=h/2; b.castShadow=true; g.add(b);
      [-w/2+0.08,w/2-0.08].forEach(px=>{ const tb=new THREE.Mesh(new THREE.BoxGeometry(0.14,h,d+0.02),toon(0x6b4a2e)); tb.position.set(px,h/2,0); g.add(tb); });
      const rs=new THREE.Shape(); rs.moveTo(-w/2-0.35,0); rs.lineTo(0,h*0.8); rs.lineTo(w/2+0.35,0); rs.lineTo(-w/2-0.35,0); const rg=new THREE.ExtrudeGeometry(rs,{depth:d+0.5,bevelEnabled:true,bevelSize:0.12,bevelThickness:0.1,bevelSegments:2}); rg.translate(0,0,-(d+0.5)/2); const r=new THREE.Mesh(rg,toon(roof||0xd8b860)); r.position.y=h; r.castShadow=true; g.add(r);
      const ch=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.9,0.4),toon(0x9a968e)); ch.position.set(w*0.25,h+h*0.5,0); g.add(ch);
      g.position.set(x,-2.2,z); g.rotation.y=ry; scene.add(g); return g; };
    [[-2,-30,3,2.4,2,0.3],[2,-34,2.6,2.2,1.8,0.1,0xc9a050],[6,-29,3.2,2.4,2.1,-0.2],[-5,-37,2.6,2.2,1.8,0.5,0xb85a3a],[9,-37,2.8,2.2,1.9,0.2],[1,-41,3,2.4,2,-0.1,0xc9a050],[13,-32,2.4,2,1.7,0.4,0xb85a3a]].forEach(a=>house(...a));
    { const g=house(5,-45,3,5,3.2,0.05,0x6a7a9a); const tw=new THREE.Mesh(new THREE.BoxGeometry(1.4,3,1.4),toon(0xe2dccc)); tw.position.set(0,1.5,2.2); const sp=new THREE.Mesh(new THREE.ConeGeometry(0.9,3.4,4),toon(0x6a7a9a,{flatShading:true})); sp.position.set(0,4.7,2.2); sp.rotation.y=Math.PI/4; g.add(tw); g.add(sp);
      const cr=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.6,0.08),toon(0xf2c14e)); cr.position.set(0,6.6,2.2); g.add(cr); const cr2=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.08,0.08),toon(0xf2c14e)); cr2.position.set(0,6.7,2.2); g.add(cr2); }
    { const g=new THREE.Group(); const t=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.3,4.6,8),toon(0xece2c8)); t.position.y=2.3; g.add(t); const cp=new THREE.Mesh(new THREE.ConeGeometry(1.15,1.4,8),toon(0x8a5a36)); cp.position.y=5.3; g.add(cp);
      const hub=new THREE.Group(); hub.position.set(0,4.4,1.05); g.add(hub); for(let i=0;i<4;i++){ const a=new THREE.Group(); a.rotation.z=i*Math.PI/2; const sp=new THREE.Mesh(new THREE.BoxGeometry(0.12,3.0,0.06),toon(0x6b4a2e)); sp.position.y=1.5; a.add(sp); const sl=new THREE.Mesh(new THREE.BoxGeometry(0.62,2.3,0.03),toon(0xf6f0e0)); sl.position.set(0.36,1.75,0); a.add(sl); hub.add(a); }
      g.position.set(17,-2.2,-40); g.rotation.y=-0.5; scene.add(g); scene.userData.mill=hub; }
    // trees about the valley, toon-lit like the oak
    const tree=(x,z,s,pine)=>{ const g=new THREE.Group(); const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.2,pine?1.0:1.3,6),toon(0x6a4a2e)); tr.position.y=pine?0.5:0.65; g.add(tr);
      if(pine) [[0.85,1.3,1.1],[0.66,1.15,1.7],[0.46,1.0,2.25]].forEach(([r,h,y])=>{ const c=new THREE.Mesh(new THREE.ConeGeometry(r,h,8),toon(0x2f6a3a,{flatShading:true})); c.position.y=y; g.add(c); });
      else [[0,1.75,0,0.75],[0.42,1.55,0.2,0.55],[-0.4,1.6,-0.2,0.55],[0.05,2.15,0.1,0.5]].forEach(([a,b,c2,r])=>{ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),toon(0x5aa048,{flatShading:true})); m.position.set(a,b,c2); g.add(m); });
      g.position.set(x,-2.2,z); g.scale.setScalar(s); scene.add(g); };
    [[-8,-26,1.6],[11,-40,1.8,1],[17,-35,1.7],[-9,-41,2,1],[-1,-48,1.9],[20,-44,2.1,1],[-12,-20,1.4],[15,-27,1.3],[-16,-34,2.2,1],[24,-30,1.6],[-20,-28,1.8],[28,-38,2,1],[-24,-44,2.3,1],[33,-26,1.5]].forEach(a=>tree(...a));
    // painted cumulus, far and slow; pollen in the light; leaves off the oak; two birds
    scene.userData.clouds=[]; [[-38,420,170,70,1],[-10,460,230,90,2],[22,430,180,72,3],[48,400,150,60,4],[-60,380,140,56,5],[5,300,90,36,6]].forEach(([b,D,w,h,sd])=>{ const [x,z]=at(b,D); const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex(sd),fog:false,depthWrite:false,transparent:true})); sp.scale.set(w,h,1); sp.position.set(x,40+((sd*37)%5)*9,z); scene.add(sp); scene.userData.clouds.push({sp,b,D,v:0.004+sd*0.0008}); });
    { const N=180, pos=new Float32Array(N*3), sd=[]; for(let i=0;i<N;i++){ sd.push([Math.random()*12-4,Math.random()*4,Math.random()*9-6,Math.random()*6.28]); }
      const cvp=document.createElement('canvas'); cvp.width=cvp.height=32; const xx=cvp.getContext('2d'), gr=xx.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(255,250,220,1)'); gr.addColorStop(1,'rgba(255,240,200,0)'); xx.fillStyle=gr; xx.fillRect(0,0,32,32);
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:0.07,map:new THREE.CanvasTexture(cvp),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xfff2c0})); pts.frustumCulled=false; scene.add(pts); scene.userData.pollen={geo,sd}; }
    scene.userData.leaves=[]; for(let i=0;i<8;i++){ const lf=new THREE.Mesh(new THREE.PlaneGeometry(0.07,0.045),new THREE.MeshLambertMaterial({color:i%3?0x7ab848:0xc8b850,side:THREE.DoubleSide})); scene.add(lf); scene.userData.leaves.push({m:lf,t:Math.random()*10,x:-3+Math.random()*4,z:-3+Math.random()*3}); }
    scene.userData.birds=[0,1,2].map(i=>{ const g=new THREE.Group(), m=new THREE.MeshBasicMaterial({color:0x3a4a5a,side:THREE.DoubleSide}); [-1,1].forEach(sd=>{ const w=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.12),m); w.position.x=sd*0.3; g.add(w); g['w'+sd]=w; }); scene.add(g); return g; });
    // the knight: the game's own, in this save's livery, sat on the stone with the Word open on his knees
    if(typeof COMBAT!=='undefined'&&COMBAT.knightModel){ kn=COMBAT.knightModel(); if(kn.dress&&typeof GAME!=='undefined') try{ kn.dress(GAME.S); }catch(e){}
      kn.position.set(-0.22,0.22,0.12); kn.rotation.y=0.95; kn.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); scene.add(kn);
      const bk=new THREE.Group(), pg=toon(0xfbf6ea), cov=toon(0x7a2a1e); [-1,1].forEach(sd=>{ const c=new THREE.Mesh(new THREE.BoxGeometry(0.17,0.012,0.24),cov); c.position.set(sd*0.085,0,0); c.rotation.z=-sd*0.18; bk.add(c); const p=new THREE.Mesh(new THREE.BoxGeometry(0.155,0.02,0.22),pg); p.position.set(sd*0.08,0.012,0); p.rotation.z=-sd*0.18; bk.add(p); });
      const gl=new THREE.Mesh(new THREE.BoxGeometry(0.31,0.006,0.005),toon(0xc9a94a)); gl.position.set(0,0.005,0.112); bk.add(gl);
      bk.position.set(0,0.66,0.34); bk.rotation.x=-0.75; kn.add(bk); kn.userData.book=bk; }
    // the finish: bloom on the light, and a grade that warms it and draws the eye in (as the High tier's post pass)
    try{ if(THREE.EffectComposer&&THREE.UnrealBloomPass&&THREE.ShaderPass&&THREE.RenderPass){ comp=new THREE.EffectComposer(R); comp.addPass(new THREE.RenderPass(scene,cam)); comp.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.28,0.55,0.93));
      comp.addPass(new THREE.ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb*0.98; float l=dot(c,vec3(0.2126,0.7152,0.0722)); c=mix(vec3(l),c,1.16); c=(c-0.5)*1.05+0.5; c+=vec3(0.022,0.008,-0.012)*(1.0-l); vec2 d=vUv-0.5; c*=1.0-0.30*dot(d,d)*1.6; gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }'})); } }catch(e){ comp=null; }
    resize(); }
  function resize(){ if(!R) return; const w=innerWidth, h=innerHeight; R.setSize(w,h,false); if(comp){ comp.setPixelRatio(R.getPixelRatio()); comp.setSize(w,h); } cam.aspect=w/h; cam.fov=w/h<1?58:38; cam.updateProjectionMatrix(); }
  let tl=0;
  function draw(){ const t=(now()-t0)/1000, dt=Math.min(0.05,(now()-(tl||now()))/1000); tl=now();
    if(R&&scene&&(phase==='title'||phase==='select')){
      // the camera eases in a little over the first seconds, then breathes
      const k=Math.min(1,t/6), e=1-Math.pow(1-k,3), por=innerWidth/innerHeight<1;
      if(por){ cam.position.set(1.1+Math.sin(t*0.13)*0.08,1.25,5.6-e*0.4); cam.lookAt(-0.6,2.3,-6); }
      else { cam.position.set(3.4-e*0.3+Math.sin(t*0.13)*0.1, 1.45+Math.sin(t*0.17)*0.04, 5.2-e*0.5); cam.lookAt(-3.6,2.9,-13.6); }
      if(kn&&kn.animate){ kn.animate(dt,'sit',1); const rg=kn.rig; if(rg){ if(rg.sh) rg.sh.visible=false; if(rg.sword) rg.sword.visible=false; if(rg.head) rg.head.rotation.x=0.42+Math.sin(t*0.4)*0.03; if(rg.AL&&rg.AR){ rg.AL.sh.rotation.x=rg.AR.sh.rotation.x=-0.75; rg.AL.el.rotation.x=rg.AR.el.rotation.x=-0.55; } } }   // his shield and sword set by; his eyes on the page
      if(grassU) grassU.value=now()/1000;
      const U=scene.userData; (U.clouds||[]).forEach(c=>{ c.b+=c.v*dt*60*0.02; if(c.b>75) c.b=-75; const [x,z]=at(c.b,c.D); c.sp.position.x=x; c.sp.position.z=z; });
      if(U.mill) U.mill.rotation.z-=dt*0.6;
      if(U.oak) U.oak.rotation.z=Math.sin(now()/1000*0.7)*0.006;
      if(U.pollen){ const p=U.pollen.geo.attributes.position, T=now()/1000; U.pollen.sd.forEach((s,i)=>{ p.setXYZ(i,s[0]+Math.sin(T*0.3+s[3])*0.6+((T*0.12+s[3])%8)-2,s[1]+Math.sin(T*0.5+s[3]*2)*0.4,s[2]+Math.cos(T*0.25+s[3])*0.5); }); p.needsUpdate=true; }
      (U.leaves||[]).forEach((l,i)=>{ l.t+=dt; const u=(l.t*0.11+i*0.07)%1; l.m.position.set(l.x+u*3.2+Math.sin(l.t*1.6)*0.4,6.5-u*7.0,l.z+Math.cos(l.t*1.2)*0.3); l.m.rotation.set(l.t*2.1,l.t*1.3,l.t*0.7); });
      (U.birds||[]).forEach((b,i)=>{ const u=(t*0.03+i*0.12)%1; b.position.set(-40+u*100,16+i*1.4+Math.sin(t*0.6+i)*0.6,-46-i*4); const f=Math.sin(t*7+i*2)*0.5; b['w-1'].rotation.y=f; b['w1'].rotation.y=-f; });
      if(comp) comp.render(); else R.render(scene,cam); }
    pad(); raf=requestAnimationFrame(draw); }
  // ── input: keys, a click or tap, a pad ──
  function pad(){ const gp=navigator.getGamepads?[...navigator.getGamepads()].find(g=>g&&g.connected):null; if(!gp) return; const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed), ay=gp.axes[1]||0;
    const st={a:b(0)||b(9),b:b(1),up:b(12)||ay<-0.6,dn:b(13)||ay>0.6}; Object.keys(st).forEach(k=>{ if(st[k]&&!padPrev[k]) press(k==='a'?'ok':k==='b'?'back':k); }); padPrev=st; }
  // e.code, not e.key: the controls layer (keys.js) renames keys to the actions they're bound to
  function key(e){ if(phase==='off'||phase==='load') return; const k=e.code; const tg=e.target&&e.target.tagName; if(tg==='TEXTAREA'||tg==='INPUT'){ if(k==='Escape'){ press('back'); e.preventDefault(); } e.stopImmediatePropagation(); return; } if(k==='Enter'||k==='NumpadEnter'||k==='Space'||k==='KeyZ'){ press('ok'); e.preventDefault(); } else if(k==='Escape'||k==='Backspace'||k==='KeyX'){ press('back'); e.preventDefault(); }
    else if(k==='ArrowUp'||k==='KeyW'){ press('up'); e.preventDefault(); } else if(k==='ArrowDown'||k==='KeyS'){ press('dn'); e.preventDefault(); } e.stopImmediatePropagation(); }
  function press(a){ if(busy) return; unlock();
    if(phase==='logo'||phase==='splash'){ if(a==='ok') go(phase==='logo'?'splash':'title'); return; }
    if(phase==='title'){ if(a==='ok'&&now()-t0>700){ blip(); go('select'); } return; }
    if(phase==='select'){
      if(box){ if(a==='back'){ box=null; slots(); } return; }
      if(sub){ const n=sub.opts.length; if(a==='up'){ sub.cur=(sub.cur+n-1)%n; slots(); blip(); } else if(a==='dn'){ sub.cur=(sub.cur+1)%n; slots(); blip(); } else if(a==='back'){ sub=null; slots(); } else if(a==='ok'){ blip(); act(sub.opts[sub.cur][0]); } return; }
      if(a==='up'){ cursor=(cursor+2)%3; slots(); blip(); } else if(a==='dn'){ cursor=(cursor+1)%3; slots(); blip(); } else if(a==='back'){ go('title',true); } else if(a==='ok'){ blip(); openSub(); } } }
  // ── a slot's choices: play it, take its save code, erase it; or, empty, begin anew or bring a knight in from a code ──
  let sub=null, box=null, msg='';
  function openSub(){ const n=cursor+1, has=!!GAME.peek(n); msg='';
    sub={n,cur:0,opts:has?[['play','▶ Continue'],['copy','⧉ Copy save code'],['erase','✕ Erase this knight']]:[['new','✦ New game'],['code','⤓ Load a save code']]}; slots(); }
  function act(k){ const n=sub.n;
    if(k==='play'||k==='new'){ sub=null; choose(n); return; }
    if(k==='erase'){ sub={n,cur:0,confirm:true,opts:[['back','Keep this knight'],['erase!','Erase forever']]}; slots(); return; }
    if(k==='erase!'){ GAME.erase(n); msg=`Slot ${n} erased.`; sub=null; slots(); return; }
    if(k==='back'){ sub=null; slots(); return; }
    if(k==='copy'){ let code=''; try{ code=btoa(unescape(encodeURIComponent(JSON.stringify(GAME.peek(n))))); }catch(e){} box={n,kind:'copy',code}; sub=null; slots(); return; }
    if(k==='code'){ box={n,kind:'code'}; sub=null; slots(); setTimeout(()=>{ const ta=el&&el.querySelector('#ttlCode'); if(ta) ta.focus(); },60); return; } }
  function boxAct(k){ if(!box) return; const n=box.n;
    if(k==='cancel'){ box=null; slots(); return; }
    if(k==='copyit'){ const ta=el.querySelector('#ttlCode'); try{ navigator.clipboard.writeText(ta.value).then(()=>{ msg='Copied — keep it somewhere safe.'; slots(); },()=>{ ta.select(); document.execCommand('copy'); msg='Copied.'; slots(); }); }catch(e){ ta.select(); try{ document.execCommand('copy'); }catch(_){} msg='Copied.'; } box=null; slots(); return; }
    if(k==='loadit'){ const v=(el.querySelector('#ttlCode')||{}).value||''; if(GAME.importCode(v)){ GAME.save(n); box=null; msg=`Restored to Slot ${n} — ${UI.esc((GAME.S.name||'Knight'))}, Lv ${GAME.S.level}.`; cursor=n-1; }
      else msg='That code didn’t read as a save. Check it was copied whole.'; slots(); } }
  const unlock=()=>{ try{ if(typeof AUDIO2D!=='undefined'&&AUDIO2D.audioUnlock) AUDIO2D.audioUnlock(); }catch(e){} };
  const blip=()=>{ try{ if(typeof SFX!=='undefined') SFX.play('select'); }catch(e){} };
  // ── the phases ──
  const $l=id=>el.querySelector('#'+id);
  function go(p,quiet){ phase=p; t0=now(); ['ttlLogo','ttlSplash','ttlTitle','ttlSel','ttlLoad'].forEach(id=>$l(id).classList.add('hid'));
    const on={logo:'ttlLogo',splash:'ttlSplash',title:'ttlTitle',select:'ttlSel',load:'ttlLoad'}[p]; if(on) $l(on).classList.remove('hid');
    cv.style.opacity=(p==='title'||p==='select')?1:0;
    if(p==='title'){ const T=$l('ttlTitle'); if(quiet){ T.classList.add('on'); } else { T.classList.remove('on'); void T.offsetWidth; T.classList.add('on'); try{ if(typeof SFX!=='undefined') setTimeout(()=>SFX.play('swing'),280); }catch(e){} } }
    if(p==='select'){ sub=null; box=null; msg=''; const a=typeof GAME!=='undefined'?GAME.slot:1; cursor=Math.max(0,Math.min(2,(a||1)-1)); slots(); }
    if(p==='logo') setTimeout(()=>{ if(phase==='logo') go('splash'); },2300);
    if(p==='splash') setTimeout(()=>{ if(phase==='splash') go('title'); },2000); }
  const fmt=ms=>{ const m=Math.floor((ms||0)/60000), h=Math.floor(m/60); return h?`${h}h ${m%60}m`:`${m}m`; };
  function slots(){ const bx=$l('ttlSlots'); let h=''; for(let i=1;i<=3;i++){ const sv=typeof GAME!=='undefined'?GAME.peek(i):null, cur=i-1===cursor;
      h+=`<div class="ttlSlot${cur?' cur':''}" data-i="${i-1}">`+(sv?`<div class="n">Slot ${i} · ${UI.esc((sv.name||'Knight').slice(0,14))}</div><div class="m">Lv ${sv.level||1} · ${sv.chapels||0}/10 chapels${sv.abaddonWon?' · 👑':''} · ⏱ ${fmt(sv.playMs)}${sv.pet&&sv.pet.name?' · '+UI.esc(sv.pet.name):''}</div>`:`<div class="e">Slot ${i} — New Game —</div>`)+'</div>';
      if(sub&&sub.n===i) h+=`<div class="ttlSub">${sub.confirm?`<div class="q">Erase ${UI.esc((sv&&sv.name)||'this knight')} from Slot ${i}? This can’t be undone.</div>`:''}`+sub.opts.map(([k,l],j)=>`<div class="ttlOpt${j===sub.cur?' cur':''}${k==='erase!'?' red':''}" data-k="${k}">${l}</div>`).join('')+'</div>';
      if(box&&box.n===i) h+=`<div class="ttlBox"><div class="q">${box.kind==='copy'?'Slot '+i+'’s save code — copy it to keep this knight safe, or to carry him to another device:':'Paste a save code to bring that knight into Slot '+i+':'}</div><textarea id="ttlCode" rows="3" ${box.kind==='copy'?'readonly':''} spellcheck="false">${box.kind==='copy'?UI.esc(box.code):''}</textarea><div class="row"><div class="ttlOpt cur" data-b="${box.kind==='copy'?'copyit':'loadit'}">${box.kind==='copy'?'⧉ Copy':'⤓ Load into Slot '+i}</div><div class="ttlOpt" data-b="cancel">Cancel</div></div></div>`; }
    bx.innerHTML=h+(msg?`<div class="ttlMsg">${msg}</div>`:''); }
  // a slot chosen: a saved knight comes in through the load-in card; an empty one goes to the new-game choices
  function choose(n){ const s=GAME.peek(n);
    if(!s){ busy=true; veil(1); setTimeout(()=>{ close(); if(GAME.pickStart) GAME.pickStart(n); else { GAME.newGame(n); if(GAME.onNew) GAME.onNew(); } veil(0); busy=false; },520); return; }
    busy=true; veil(1); setTimeout(()=>{ go('load'); veil(0); const v=VERSES[(Math.random()*VERSES.length)|0];
      $l('ttlLoadWho').textContent=s.name||'Knight'; $l('ttlLoadWhere').textContent=`Lv ${s.level||1} · ${s.chapels||0}/10 chapels cleansed`; $l('ttlLoadVs').innerHTML=`“${UI.esc(v[0])}”<div class="rf">${v[1]}</div>`;
      const bar=$l('ttlLoadBar'); bar.style.width='0'; void bar.offsetWidth; bar.style.width='100%';
      setTimeout(()=>{ try{ GAME.load(n); window.TITLE_UP=false; if(GAME.resume) GAME.resume(); }catch(e){ console.error(e); } },350);
      setTimeout(()=>{ veil(1); setTimeout(()=>{ close(); busy=false; },520); },1750); },520); }
  const veil=v=>{ $l('ttlVeil').style.opacity=v; };
  function close(){ window.TITLE_UP=false; phase='off'; cancelAnimationFrame(raf); removeEventListener('keydown',key,true); removeEventListener('resize',resize);
    if(el){ el.style.transition='opacity .5s'; el.style.opacity=0; setTimeout(()=>{ if(el&&el.parentNode) el.parentNode.removeChild(el); el=null; if(R){ R.dispose(); R.forceContextLoss&&R.forceContextLoss(); R=null; } },520); }
    if(onDone) onDone(); }
  function show(o){ if(skip()||el) return false; o=o||{}; onDone=o.done||null; window.TITLE_UP=true;
    const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    el=document.createElement('div'); el.id='ttl'; el.innerHTML=`<canvas id="ttlCv"></canvas>
      <div class="lay" id="ttlLogo"><img alt="Restful Knight Gaming" src="${LOGO}"></div>
      <div class="lay hid" id="ttlSplash"><div class="who">kspearproductions</div><div class="pr">PRESENTS</div></div>
      <div class="lay hid" id="ttlTitle"><div id="ttlFlash"></div><div class="k1">KINGDOM’S</div><div class="k2">LAST KNIGHT</div><div id="ttlSword">${SWORD}</div><div id="ttlPress">PRESS Ⓐ</div><div id="ttlFoot">© 2026 kspearproductions${o.build?' · '+UI.esc(o.build):''}</div></div>
      <div class="lay hid" id="ttlSel"><h2>CHOOSE YOUR KNIGHT</h2><div id="ttlSlots"></div><div class="hint">▲▼ choose · Ⓐ confirm · Ⓑ back</div></div>
      <div class="lay hid" id="ttlLoad"><img alt="" src="${LOGO}"><div class="who" id="ttlLoadWho"></div><div class="where" id="ttlLoadWhere"></div><div class="vs" id="ttlLoadVs"></div><div class="ttlBar"><i id="ttlLoadBar"></i></div></div>
      <div id="ttlVeil"></div>`;
    document.body.appendChild(el); cv=$l('ttlCv'); cv.style.transition='opacity .6s'; cv.style.opacity=0;
    try{ build(); }catch(e){ console.error('title scene',e); }
    addEventListener('keydown',key,true); addEventListener('resize',resize);
    el.addEventListener('pointerdown',e=>{ unlock(); if(e.target.tagName==='TEXTAREA') return; const C=q=>e.target.closest&&e.target.closest(q);
      if(phase==='select'){ const b=C('[data-b]'); if(b){ e.preventDefault(); boxAct(b.dataset.b); return; } const o=C('.ttlOpt[data-k]'); if(o&&sub){ sub.cur=sub.opts.findIndex(x=>x[0]===o.dataset.k); blip(); act(o.dataset.k); return; }
        if(C('.ttlBox')||C('.ttlSub')) return; const s=C('.ttlSlot'); if(s){ const i=+s.dataset.i; box=null; if(i===cursor&&!sub) press('ok'); else { cursor=i; sub=null; slots(); blip(); } return; } return; }
      press('ok'); });
    $l('ttlSel').addEventListener('pointerdown',e=>{ if(e.target.id==='ttlSel'){ e.stopPropagation(); if(sub||box){ sub=null; box=null; slots(); } else go('title',true); } });
    go('logo'); tl=now(); draw(); return true; }
  const api={show,get up(){ return !!window.TITLE_UP; },get phase(){ return phase; }}; window.__TITLE=api; return api;
})();
