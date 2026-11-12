// ════════════════════════════════════════════════════════════════
//  LOOK3 (V188, a TEST — off unless the page is opened with ?look3) — what the game could look like with models an
//  artist made and rigged, instead of the ones sculpted by code:
//   · models/look3/Horse_White.gltf, Wolf.gltf, Stag.gltf — Quaternius, "Ultimate Animated Animals" (CC0): one skinned
//     mesh each on a real skeleton, with Walk / Gallop / Idle / Eating / Attack … clips made by hand;
//   · models/look3/AnimationLibrary_Godot_Standard.gltf(+.bin) — Quaternius, Universal Animation Library, free standard
//     edition (CC0): a plain mannequin of ordinary human proportions on a humanoid rig, 46 clips (sword, roll, jump, crouch,
//     walk / jog / sprint, swim, sit …). His free 'Modular Character Outfits – Fantasy' dress this same skeleton.
//     (Knight.glb, the chibi KayKit knight of the first test, is still in the folder but no longer loaded.)
//   · models/look3/GLTFLoader.js — three.js r128's own loader.
//  They stand in a little paddock in front of where you are when the world loads: the horse walks and gallops a ring, the
//  wolf and the stag idle and graze, the knight runs through his sword drill. Each is shaded the way Breath of the Wild
//  shades its cast: two soft bands of light (a toon ramp), a warm rim of light on the edge away from the camera, and
//  no texture noise. Nothing else in the game is touched; this file can be deleted without a trace.
// ════════════════════════════════════════════════════════════════
(function(){
  if(!/[?&]look3/.test(location.search)&&!window.LOOK3) return;
  const BASE='models/look3/', MAN='AnimationLibrary_Godot_Standard.gltf', cast=[]; let ready=false, placed=null, last=performance.now();
  const ramp=(()=>{ const d=new Uint8Array([120,120,120,255, 200,200,200,255, 255,255,255,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  // the cel look: the model's own colours, banded light, and a rim
  function celify(root){ root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=true; o.receiveShadow=false; o.frustumCulled=false;
      const ms=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{ const t=new THREE.MeshToonMaterial({color:m.color?m.color.clone():new THREE.Color(0xffffff),map:m.map||null,gradientMap:ramp,skinning:!!o.isSkinnedMesh,side:m.side});
        if(!m.map){ const c=t.color; c.r=Math.pow(c.r,1/2.2); c.g=Math.pow(c.g,1/2.2); c.b=Math.pow(c.b,1/2.2); }   // r128 reads the file's linear colours as if they were sRGB: put them back
        t.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n  { float rim=pow(1.0-clamp(dot(normalize(vViewPosition),normalize(vNormal)),0.0,1.0),3.0); gl_FragColor.rgb+=vec3(1.0,0.93,0.78)*rim*0.42; }'); };
        return t; }); o.material=Array.isArray(o.material)?ms:ms[0]; }); }
  function fit(root,tall){ root.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(root), h=b.max.y-b.min.y||1, k=tall/h; root.scale.multiplyScalar(k); const g=new THREE.Group(); root.position.y-=b.min.y*k; g.add(root); return g; }
  function load(file,tall,clips,setup){ return new Promise(res=>{ new THREE.GLTFLoader().load(BASE+file,g=>{ const root=g.scene; celify(root); const holder=fit(root,tall), mx=new THREE.AnimationMixer(root), acts={};
        g.animations.forEach(a=>{ acts[a.name]=mx.clipAction(a); }); const c={file,holder,mx,acts,cur:null,t:0,play(n,fade){ const a=acts[n]; if(!a||c.cur===a) return; a.reset().fadeIn(fade===undefined?0.3:fade).play(); if(c.cur) c.cur.fadeOut(fade===undefined?0.3:fade); c.cur=a; }};
        if(setup) setup(c,root); c.play(clips[0],0); c.clips=clips; cast.push(c); res(c); },undefined,e=>{ console.warn('look3: could not load',file,e); res(null); }); }); }
  const sc=document.createElement('script'); sc.src=BASE+'GLTFLoader.js'; sc.onload=()=>{
    Promise.all([ load('Horse_White.gltf',1.75,['Walk','Gallop','Idle','Eating']), load('Wolf.gltf',0.95,['Idle','Eating','Idle_2','Attack']), load('Stag.gltf',1.9,['Eating','Idle','Idle_Headlow']),
      load('AnimationLibrary_Godot_Standard.gltf',1.32,['Idle_Loop','Sword_Idle','Sword_Attack','Sword_Idle','Roll','Walk_Loop','Jog_Fwd_Loop','Sprint_Loop','Jump_Start','Jump_Land','Crouch_Idle_Loop','Crouch_Fwd_Loop']) ]).then(()=>{ ready=true; window.__LOOK3=cast; window.__LOOK3_again=()=>{ placed=null; }; }); };
  sc.onerror=()=>console.warn('look3: no loader'); document.head.appendChild(sc);
  function place(lv){ const P=ENGINE.P, f=P.face, fx=Math.sin(f), fz=Math.cos(f), rx=Math.cos(f), rz=-Math.sin(f), at=(a,b)=>({x:P.x+fx*a+rx*b,z:P.z+fz*a+rz*b});
    placed={lv,c:at(4.3,0),spots:{'Wolf.gltf':at(1.5,-2.7),'Stag.gltf':at(5.6,4.4),'AnimationLibrary_Godot_Standard.gltf':at(1.5,2.3)},face:f}; cast.forEach(c=>{ if(c.file==='Horse_White.gltf'){ c.a=Math.atan2(P.z-placed.c.z,P.x-placed.c.x)-0.9; c.t=0; } }); cast.forEach(c=>{ lv.scene.add(c.holder); }); }
  (function tick(){ requestAnimationFrame(tick); const now=performance.now(), dt=Math.min(0.1,(now-last)/1000); last=now; if(!ready||typeof ENGINE==='undefined'||!ENGINE.level) return; const lv=ENGINE.level;
    if(lv.id!=='world'){ return; } if(!placed||placed.lv!==lv) place(lv); const gy=(x,z)=>lv.ground?lv.ground(x,z):0;
    cast.forEach(c=>{ c.t+=dt; c.mx.update(dt); const h=c.holder;
      if(c.file==='Horse_White.gltf'){ const cyc=c.t%26, gal=cyc>10&&cyc<20, rest=cyc>=20, R=2.2; if(!rest){ c.a=(c.a||0)+dt*(gal?1.5:0.42); } c.play(rest?(cyc>23?'Eating':'Idle'):gal?'Gallop':'Walk');
        const x=placed.c.x+Math.cos(c.a||0)*R, z=placed.c.z+Math.sin(c.a||0)*R; h.position.set(x,gy(x,z),z); h.rotation.y=-(c.a||0); }
      else { const s=placed.spots[c.file]; h.position.set(s.x,gy(s.x,s.z),s.z); h.rotation.y=c.file===MAN?placed.face+Math.PI*0.85:c.file==='Wolf.gltf'?placed.face+2.2:placed.face-2.0;
        const n=c.clips.length, i=Math.floor(c.t/(c.file===MAN?2.4:6))%n; c.play(c.clips[i]); } }); })();
})();
