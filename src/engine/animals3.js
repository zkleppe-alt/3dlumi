// ════════════════════════════════════════════════════════════════
//  ANIM3 (V190) — the realm's animals on real skeletons. The corral horses and the mule, the merchants' donkeys, the
//  shepherds' sheep, the hens by the coop, the deer of the wilds and of the Forest of Disillusionment were boxes and
//  spheres swung about by code; now each wears an artist-made, rigged and hand-animated model (models/look3/*.gltf:
//  Quaternius's animated and farm animals, CC0 — models/look3/LICENSES.md), cel-shaded to match.
//   ANIM3.dress(g, kind, {tint, mane, h, face})  → g keeps its old model until the new one has loaded, then the old one is
//     hidden and the rigged one stands in its place at its true size beside the knight (WH, world units), or h (g's units). kinds: horse, donkey, deer, stag, cow,
//     sheep, chicken, chick, pig.
//  It picks its own clip from how the thing is moving — still: idle and grazing by turns; walking pace: Walk; fast:
//  Gallop / Run — so the code that moves an animal about doesn't need to know. Mixers tick only near the knight.
//  Off in the classic look, with ?noanim3, and wherever the files can't be fetched (the artifact build): the old
//  models simply stay.
// ════════════════════════════════════════════════════════════════
const ANIM3=(function(){
  const on=()=>!(typeof LOOK2!=='undefined'&&!LOOK2)&&!/[?&]noanim3/.test(location.search)&&!window.NO_ANIM3;
  const BASE='models/look3/', FILE={horse:'Horse.gltf',horseW:'Horse_White.gltf',donkey:'Donkey.gltf',deer:'Deer.gltf',stag:'Stag.gltf',cow:'Cow.gltf',sheep:'sheep.glb',chicken:'chicken.glb',chick:'chicken.glb',pig:'pig.glb'};
  const CLIP={walk:['Walk','Run'],run:['Gallop','Run'],idle:['Idle','Idle_2'],graze:['Eating','Idle_Eating','Idle_Peck','Idle_Headlow','Bite_Front','Idle']};
  const src={}, wait={}, live=[]; let libs=null;
  function loadLibs(){ if(libs) return libs; libs=new Promise((res,rej)=>{ const add=(f,next)=>{ const s=document.createElement('script'); s.src=BASE+f; s.onload=next; s.onerror=()=>rej(f); document.head.appendChild(s); };
      add('GLTFLoader.js',()=>add('SkeletonUtils.js',()=>res())); }); return libs; }
  const ramp=(()=>{ const d=new Uint8Array([140,140,140,255, 210,210,210,255, 255,255,255,255]), t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
  function cel(m,skinned){ const t=new THREE.MeshToonMaterial({color:m.color?m.color.clone():new THREE.Color(0xffffff),map:m.map||null,gradientMap:ramp,skinning:skinned,side:m.side}); t.name=m.name;
    if(!m.map){ const c=t.color; c.r=Math.pow(c.r,1/2.2); c.g=Math.pow(c.g,1/2.2); c.b=Math.pow(c.b,1/2.2); }   // r128 takes the file's linear colours as sRGB: put them back
    t.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n  { float rim=pow(1.0-clamp(dot(normalize(vViewPosition),normalize(vNormal)),0.0,1.0),3.0); gl_FragColor.rgb+=vec3(1.0,0.93,0.78)*rim*0.32; }'); };
    return t; }
  /* V199: THE SHEEP — Quaternius's farm sheep is a cube; this one is built here instead, in the realm's own manner: a fleece of
     soft clumps, a dark face with drooping ears and a woolly cap, slim dark legs, a puff of a tail — cel-shaded like the rest,
     with clips of its own (Idle, Eating, Walk, Run) made from keyframes on its parts, so ANIM3 drives it like any other. */
  function sheepSrc(){ const lin=h=>new THREE.Color(h).convertSRGBToLinear(), M=h=>cel(new THREE.MeshLambertMaterial({color:lin(h)}),false);
    const wool=M(0xf1ebdf), woolD=M(0xe2d9c8), face=M(0x3b3431), leg=M(0x2e2a28), hoof=M(0x1e1b1a), ear=M(0x4a403b), eye=M(0x0e0c0c);
    const scene=new THREE.Group(); scene.name='SheepRoot'; const nd=(n,p,x,y,z)=>{ const o=new THREE.Group(); o.name=n; o.position.set(x,y,z); p.add(o); return o; };
    const blob=(p,r,x,y,z,m,sx,sy,sz)=>{ const s=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),m); s.position.set(x,y,z); s.scale.set(sx||1,sy||1,sz||1); s.castShadow=true; p.add(s); return s; };
    const body=nd('body',scene,0,0.56,0);
    [[0,0.02,0,0.27],[0,0.08,0.2,0.22],[0,0.06,-0.2,0.23],[0.13,0,0.08,0.19],[-0.13,0,0.08,0.19],[0.13,0.02,-0.12,0.19],[-0.13,0.02,-0.12,0.19],[0,0.18,0.02,0.19],[0.08,0.16,-0.14,0.15],[-0.08,0.16,0.14,0.15],[0,-0.08,0.02,0.2]]
      .forEach(([x,y,z,r],i)=>blob(body,r,x,y,z,i%3===2?woolD:wool));
    blob(body,0.08,0,0.08,-0.36,wool);                                            // the tail
    const neck=nd('neck',body,0,0.1,0.3), head=nd('head',neck,0,0.06,0.12);
    blob(head,0.1,0,0,0.04,face,1,1.08,1.45); blob(head,0.09,0,0.1,-0.01,wool,1.2,0.75,1.05);   // the face, and the woolly cap
    [-1,1].forEach(sd=>{ const e=blob(head,0.05,sd*0.105,0.04,0,ear,1.5,0.5,0.8); e.rotation.z=sd*0.5; blob(head,0.018,sd*0.06,0.035,0.11,eye); });
    [['legFL',0.11,0.17],['legFR',-0.11,0.17],['legBL',0.11,-0.17],['legBR',-0.11,-0.17]].forEach(([n,x,z])=>{ const l=nd(n,scene,x,0.44,z);
      const c=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.03,0.4,6),leg); c.position.y=-0.2; c.castShadow=true; l.add(c); const h=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.045,0.05,6),hoof); h.position.y=-0.415; l.add(h); });
    const Q=(ax,a)=>new THREE.Quaternion().setFromAxisAngle(ax==='x'?new THREE.Vector3(1,0,0):ax==='y'?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1),a).toArray();
    const qt=(n,times,axs,angs)=>new THREE.QuaternionKeyframeTrack(n+'.quaternion',times,[].concat(...angs.map((a,i)=>Q(Array.isArray(axs)?axs[i]:axs,a))));
    const pt=(n,times,ys,x,z)=>new THREE.VectorKeyframeTrack(n+'.position',times,[].concat(...ys.map(y=>[x||0,y,z||0])));
    const gait=(name,dur,amp,bob)=>{ const t=[0,dur/4,dur/2,dur*3/4,dur], s=[0,amp,0,-amp,0], o=s.map(v=>-v);
      return new THREE.AnimationClip(name,dur,[qt('legFL',t,'x',s),qt('legBR',t,'x',s),qt('legFR',t,'x',o),qt('legBL',t,'x',o),
        pt('body',[0,dur/4,dur/2,dur*3/4,dur],[0.56,0.56+bob,0.56,0.56+bob,0.56]),qt('neck',t,'x',[0.05,-0.08,0.05,-0.08,0.05])]); };
    const idle=new THREE.AnimationClip('Idle',4,[qt('neck',[0,1,2,3,4],['y','y','y','y','y'],[0,0.35,0.35,-0.2,0]),qt('head',[0,1.6,1.8,2,4],'z',[0,0,0.25,0,0])]);
    const eat=new THREE.AnimationClip('Eating',3,[qt('neck',[0,0.5,2.5,3],'x',[0.95,1.05,1.05,0.95]),qt('head',[0,0.4,0.8,1.2,1.6,2,3],'x',[0,0.15,0,0.15,0,0.15,0])]);
    return {scene,animations:[idle,eat,gait('Walk',0.9,0.45,0.025),gait('Run',0.5,0.75,0.06)]}; }
  function get(kind){ if(src[kind]) return Promise.resolve(src[kind]); if(kind==='sheep') return loadLibs().then(()=>src.sheep=sheepSrc()); if(wait[kind]) return wait[kind]; const f=FILE[kind]; if(!f) return Promise.reject(kind);
    return wait[kind]=loadLibs().then(()=>new Promise((res,rej)=>new THREE.GLTFLoader().load(BASE+f,g=>{ g.scene.traverse(o=>{ if(o.isMesh){ o.material=Array.isArray(o.material)?o.material.map(m=>cel(m,!!o.isSkinnedMesh)):cel(o.material,!!o.isSkinnedMesh); } }); src[kind]=g; res(g); },undefined,rej))); }
  const pick=(acts,want)=>{ for(const n of (CLIP[want]||[want])) if(acts[n]) return n; return null; };
  function dress(g,kind,opt){ if(!on()||!g||!FILE[kind]) return null; if(g.userData.a3) return g.userData.a3; opt=opt||{}; const H={ready:false,kind,g,opt,cur:null,state:'idle',t:Math.random()*8,last:null,sp:0};
    g.userData.a3=H; get(kind).then(src=>{ if(!g) return;
      const root=THREE.SkeletonUtils.clone(src.scene); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; if(opt.tint||opt.mane) o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone(); } });
      if(opt.tint||opt.mane) root.traverse(o=>{ if(!o.isMesh) return; (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ const n=m.name||'';
        if(opt.tint&&/^Main$/.test(n)) m.color.set(opt.tint[1]); else if(opt.tint&&/^Main_Light$/.test(n)) m.color.set(opt.tint[2]); else if(opt.tint&&/^Main_Dark$/.test(n)) m.color.set(opt.tint[0]); else if(opt.mane&&/^Hair$/.test(n)) m.color.set(opt.mane); }); });
      // as tall as the model it replaces (measured in g's own space), or opt.h
      const old=g.children.slice(); let h=opt.h; const WH={horse:1.6,horseW:1.6,donkey:1.25,deer:1.25,stag:1.55,cow:1.45,sheep:0.78,chicken:0.36,chick:0.18,pig:0.7};   // true size beside the knight, in world units
      if(!h&&WH[kind]&&!opt.keepSize){ g.updateMatrixWorld(true); const ws=new THREE.Vector3(); g.getWorldScale(ws); h=WH[kind]/(ws.y||1); }
      if(!h){ const bx=new THREE.Box3(), inv=new THREE.Matrix4(); g.updateMatrixWorld(true); inv.copy(g.matrixWorld).invert(); old.forEach(c=>{ if(!c.visible) return; const b=new THREE.Box3().setFromObject(c); if(!b.isEmpty()) bx.union(b.applyMatrix4(inv)); }); h=bx.isEmpty()?1:(bx.max.y-Math.max(0,bx.min.y)); }
      root.updateMatrixWorld(true); const rb=new THREE.Box3().setFromObject(root), k=(h*(opt.k||1))/Math.max(0.01,rb.max.y-rb.min.y); root.scale.multiplyScalar(k); root.position.y=-rb.min.y*k;
      if(opt.face) root.rotation.y=opt.face;
      // a rider (Cody on his grey): taken off the old horse and set in the new one's saddle, sitting astride
      if(opt.rider){ g.add(opt.rider); opt.rider.position.set(0,h*0.56,-h*0.04); opt.rider.rotation.set(0,0,0); }
      old.forEach(c=>{ c.visible=false; }); g.add(root);
      const mx=new THREE.AnimationMixer(root), acts={}; src.animations.forEach(a=>{ acts[a.name.split('|').pop()]=mx.clipAction(a); });   // 'AnimalArmature|…|Walk' → 'Walk'
      Object.assign(H,{ready:true,root,mx,acts}); play(H,'idle',0); live.push(H); }).catch(()=>{});
    return H; }
  function play(H,want,fade){ const n=pick(H.acts,want); if(!n) return; const a=H.acts[n]; if(H.cur===a) return; a.reset(); a.timeScale=H.opt.speed||1; a.fadeIn(fade===undefined?0.3:fade).play(); if(H.cur) H.cur.fadeOut(fade===undefined?0.3:fade); H.cur=a; }
  const wp=new THREE.Vector3(); let last=performance.now();
  function inScene(o){ while(o){ if(o.isScene) return true; if(!o.visible) return false; o=o.parent; } return false; }
  (function tick(){ requestAnimationFrame(tick); const now=performance.now(), dt=Math.min(0.1,(now-last)/1000); last=now; if(!live.length||typeof ENGINE==='undefined'||!ENGINE.P) return; const P=ENGINE.P;
    for(let i=live.length-1;i>=0;i--){ const H=live[i]; if(!H.g){ live.splice(i,1); continue; } if(!inScene(H.g)) continue;
      H.g.getWorldPosition(wp); if(Math.hypot(wp.x-P.x,wp.z-P.z)>48) continue;
      if(H.last){ const v=Math.hypot(wp.x-H.last.x,wp.z-H.last.z)/Math.max(dt,1e-3), s=H.g.getWorldScale(new THREE.Vector3()).y||1; H.sp+=(v/s-H.sp)*Math.min(1,dt*6); } H.last={x:wp.x,z:wp.z};
      const fast=H.opt.fast||2.6, slow=H.opt.slow||0.12; let want;
      if(H.sp>fast) want='run'; else if(H.sp>slow) want='walk'; else { H.t+=dt; want=(Math.floor(H.t/(H.kind==='chicken'||H.kind==='chick'?3.5:7))%2)?'graze':'idle'; }
      if(H.cur&&want==='walk'&&H.acts.Walk===undefined&&H.acts.Run) H.cur.timeScale=0.55; play(H,want); H.mx.update(dt);
      const rd=H.opt.rider; if(rd&&rd.animate){ rd.ride={speed:Math.min(1,H.sp/4),run:H.sp>(H.opt.fast||2.6)?1:0,bob:0,bank:0}; rd.animate(dt,'ride',0.5); } } })();
  return { dress, get on(){ return on(); }, live };
})();
