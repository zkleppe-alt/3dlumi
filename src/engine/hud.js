// ════════════════════════════════════════════════════════════════
//  HUD (V128) — the controls laid out as phone games lay theirs, and fitted to whatever screen you have:
//   · one UI scale from the screen's size (a small phone, a big tablet, a laptop all get controls that fit)
//   · the left thumb: a floating stick (core.js) — it rests in the lower-left corner and comes to your thumb
//   · the right thumb: the sword is the big button in the corner; everything else sits in an arc round it, nearest first —
//     the context action (Talk, Enter, Read…) gold and largest, then Guard and Jump; potion, mount, lock-on, stow on the
//     outer arc. Only what you can use now is shown, so the arc closes up instead of leaving gaps.
//   · drag anywhere on the right of the screen to look about (the look stick is retired on phones; it crowded the buttons);
//     the 🎯 lock-on button appears beside the arc when foes are near
//   · on a computer with no touch screen the stick is hidden (WASD/arrows walk) and the buttons sit smaller
//  QUALITY — the governor watches the frame rate for the first while in the realm and eases the load if a device struggles:
//   sharper → lighter pixel ratio, then the near land drawn less far and smaller shadows. One toast says so; ☰ never shows it.
// ════════════════════════════════════════════════════════════════
const HUD=(function(){
  const $=id=>document.getElementById(id);
  const touch=()=>('ontouchstart' in window)||navigator.maxTouchPoints>0||matchMedia('(any-pointer: coarse)').matches;
  const css=document.createElement('style'); css.textContent=`
    #stickZone{position:fixed;left:0;bottom:0;width:44vw;height:58vh;z-index:1;touch-action:none;display:none}
    body.touch #stickZone{display:block} body.touch #look{display:none!important} body.mg #stickZone{display:none!important}
    #stick{z-index:2;transition:opacity .25s;opacity:.7} #stick.live{opacity:1;transition:none} body.notouch #stick{display:none!important}
    .act{touch-action:none;transition:width .15s,height .15s} #lockBtn{font-size:20px}
    .paceBtn{font-size:18px} .paceBtn.on{background:rgba(242,193,78,.85)!important;color:#1a1410!important} body.notouch .paceBtn{display:none!important} body.mg .paceBtn{display:none!important}
    body.notouch #mhint{display:block}`;
  document.head.appendChild(css);
  let s=1, ready=false;
  const px=v=>Math.round(v)+'px';
  const put=(el,o)=>{ if(!el) return; for(const k in o) el.style.setProperty(k,o[k],'important'); };
  function scale(){ const w=innerWidth, h=innerHeight, m=Math.min(w,h); const t=touch(); document.body.classList.toggle('touch',t); document.body.classList.toggle('notouch',!t);
    s=t?Math.max(0.74,Math.min(1.25,m/430)):Math.max(0.7,Math.min(0.95,m/900)); return {w,h}; }
  // the lock-on button (phones): beside the arc, only when foes are near
  let lockB=null;
  function lockBtn(){ if(lockB) return lockB; lockB=document.createElement('button'); lockB.className='act'; lockB.id='lockBtn'; lockB.textContent='🎯'; lockB.hidden=true; lockB.setAttribute('aria-label','Lock on');
    lockB.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); if(typeof COMBAT!=='undefined'&&COMBAT.toggleLock) COMBAT.toggleLock(); }); document.body.appendChild(lockB); return lockB; }
  // V140: the pace toggles for the left thumb (keyboard: V sprint, X crouch; controller: L3, ✚→) — two small buttons over the stick
  let paceB=null;
  function paceBtns(){ if(paceB) return paceB; paceB=[['sprintBtn','🏃','sprint','Sprint'],['crouchBtn','🦶','crouch','Crouch']].map(([id,ic,k,lab])=>{ const b=document.createElement('button'); b.className='act paceBtn'; b.id=id; b.textContent=ic; b.setAttribute('aria-label',lab);
      b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); if(typeof ENGINE!=='undefined'&&ENGINE.pace) ENGINE.pace.toggle(k); }); document.body.appendChild(b); return b; }); return paceB; }
  function foesNear(){ const L=typeof ENGINE!=='undefined'&&ENGINE.level; if(!L||!L.combat||!L.combat.foes) return false; const P=ENGINE.P; return L.combat.foes.some(f=>f.alive&&Math.hypot(f.x-P.x,f.z-P.z)<14); }
  function layout(){ const {w,h}=scale(); const sa=v=>`calc(${px(v)} + env(safe-area-inset-right,0px))`, sb=v=>`calc(${px(v)} + env(safe-area-inset-bottom,0px))`, sl=v=>`calc(${px(v)} + env(safe-area-inset-left,0px))`;
    const vis=el=>el&&!el.hidden&&el.style.display!=='none'&&getComputedStyle(el).display!=='none';
    const S=78*s, m=16*s, cx=m+S/2, cy=m+S/2;   // the sword's centre, from the bottom-right corner
    const swing=$('swing'); put(swing,{width:px(S),height:px(S),right:sa(m),bottom:sb(m),'font-size':px(15*s)});
    // the inner arc, then the outer: [element, size, preferred order]
    const I=58*s, O=46*s, R1=S/2+I/2+10*s, R2=R1+I/2+O/2+6*s;
    const inner=[['talk',66*s],['guardBtn',I],['jumpBtn',I],['surfaceBtn',I]].map(([id,z])=>[$(id),z]).filter(([e])=>vis(e));
    const outer=[['potBtn',O],['petBtn',O],['mountBtn',O],['lockBtn',O],['stowBtn',O]].map(([id,z])=>[$(id),z]).filter(([e])=>vis(e));
    const IA=[180,135,90,225], OA=[160,118,76,200,236];   // degrees, from the sword's left round to straight above
    const place=(list,R,angs)=>list.forEach(([el,z],i)=>{ const a=(angs[i]!==undefined?angs[i]:angs[angs.length-1])*Math.PI/180;
      // x: distance from the right edge to the button's centre; the arc runs leftward (cos 180° = -1) and up
      const right=cx-Math.cos(a)*R, bottom=cy+Math.sin(a)*R; put(el,{width:px(z),height:px(z),right:sa(Math.max(m*0.5,right-z/2)),bottom:sb(Math.max(m*0.5,bottom-z/2)),left:'auto',top:'auto','font-size':px((el.id==='talk'?14:el.id==='jumpBtn'||el.id==='mountBtn'||el.id==='surfaceBtn'||el.id==='lockBtn'?20:12)*s)}); });
    // the context action leads; then the rest in order
    place(inner,R1,IA); place(outer,R2,OA);
    // the stick's resting corner, and its size
    const st=$('stick'), SK=Math.round(118*s); if(st){ st._home=()=>{ put(st,{width:px(SK),height:px(SK),left:sl(22*s),bottom:sb(22*s),top:'auto'}); }; if(!st.classList.contains('live')) st._home(); const kn=$('knob'); put(kn,{width:px(SK*0.42),height:px(SK*0.42),margin:`${px(-SK*0.21)} 0 0 ${px(-SK*0.21)}`}); }
    { const PB=paceBtns(), z=40*s; PB.forEach((b,i)=>put(b,{width:px(z),height:px(z),left:sl(22*s+SK+10*s),bottom:sb(22*s+i*(z+8*s)),right:'auto',top:'auto'})); }
    // the dialogue box sits clear of both thumbs
    const say=$('say'); if(say){ const side=Math.max(SK+30*s, R2+O+m); const free=w-2*side; if(free>=280) put(say,{bottom:sb(10*s),width:px(Math.min(460,free)),left:'50%',transform:'translateX(-50%)'}); else put(say,{bottom:sb(Math.max(SK, R1+S/2)+24*s),width:`min(calc(100vw - 24px),440px)`,left:'50%',transform:'translateX(-50%)'}); }
    ready=true; }
  function tick(){ try{ const lb=lockBtn(); const want=touch()&&foesNear()&&!(document.body.classList.contains('mg')); if(lb.hidden===want) lb.hidden=!want; layout(); }catch(e){} }
  addEventListener('resize',()=>setTimeout(tick,60)); addEventListener('orientationchange',()=>setTimeout(tick,200));
  setInterval(tick,250); setTimeout(tick,50);
  // ── V135: GRAPHICS TIERS — Low / Medium / High / Ultra ──
  //  Auto by default: phones and tablets start on Medium, a computer on High (a software renderer starts on Low). The ☰
  //  menu's Graphics choice overrides it, remembered on this device. On Auto, the governor still watches the frame rate in
  //  the realm and steps down a tier if the device struggles (one toast says so).
  const TIERS=['low','medium','high','ultra'];
  const SPEC={ low:{dpr:1,view:40,shadow:512,box:18,fog:[30,110],shR:16,tuftR:20,post:false},
    medium:{dpr:1.5,view:62,shadow:1024,box:20,fog:[40,150],shR:26,tuftR:30,post:false},
    high:{dpr:2,view:92,shadow:2048,box:30,fog:[62,230],shR:40,tuftR:46,post:true,bloom:0.42},
    ultra:{dpr:2,view:124,shadow:4096,box:42,fog:[84,300],shR:56,tuftR:62,post:true,bloom:0.5} };
  let pref='auto', tier='medium', tried=0;
  const R=()=>typeof ENGINE!=='undefined'&&ENGINE.renderer;
  function gpuSlow(){ try{ const r=R(); const gl=r&&r.getContext(); const ext=gl&&gl.getExtension('WEBGL_debug_renderer_info'); const n=ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):''; return /swiftshader|llvmpipe|software|microsoft basic/i.test(n); }catch(e){ return false; } }
  function autoTier(){ if(gpuSlow()) return 'low'; return touch()?'medium':'high'; }
  function apply(t){ const r=R(); if(!r||!SPEC[t]) return; tier=t; const q=SPEC[t], dpr=devicePixelRatio||1;
    r.setPixelRatio(Math.min(dpr,q.dpr)); if(r.shadowMap) r.shadowMap.type=THREE.PCFSoftShadowMap;
    const W=ENGINE.get&&ENGINE.get('world');
    if(W){ if(W.setView) W.setView(q.view); if(W.setSeaQ) W.setSeaQ(!!q.post); if(W.setGfx) W.setGfx({fogN:q.fog[0],fogF:q.fog[1],shR:q.shR,tuftR:q.tuftR,shadowBox:q.box});
      if(W.sunShadow){ const sz=q.shadow; if(W.sunShadow.shadow.mapSize.x!==sz){ W.sunShadow.shadow.mapSize.set(sz,sz); if(W.sunShadow.shadow.map){ W.sunShadow.shadow.map.dispose(); W.sunShadow.shadow.map=null; } } } }
    if(window.KLK_POST){ window.KLK_POST.attach(r); window.KLK_POST.enable(q.post,{bloom:q.bloom||0}); window.KLK_POST.resize(innerWidth,innerHeight); }
    if(typeof ENGINE!=='undefined'&&ENGINE.cam){ ENGINE.cam.far=Math.max(400,q.fog[1]+60); ENGINE.cam.updateProjectionMatrix(); } }
  try{ const p0=localStorage.getItem('klk3d_gfx'); if(p0&&(p0==='auto'||SPEC[p0])) pref=p0; }catch(e){}
  setTimeout(()=>apply(pref==='auto'?autoTier():pref),1500);
  function setTier(p){ pref=p; tried=0; try{ localStorage.setItem('klk3d_gfx',p); }catch(e){} apply(p==='auto'?autoTier():p); }
  let frames=0, t0=0;
  function watch(t){ requestAnimationFrame(watch); const L=typeof ENGINE!=='undefined'&&ENGINE.level; if(pref!=='auto'||!L||L.id!=='world'||document.hidden||ENGINE.busy){ frames=0; t0=t; return; }
    frames++; if(t-t0>4000){ const fps=frames*1000/(t-t0); frames=0; t0=t; const i=TIERS.indexOf(tier);
      if(fps<34&&i>0&&tried<3){ tried++; apply(TIERS[i-1]); if(tried===1&&typeof UI!=='undefined') UI.toast('⚙️ Graphics eased a little for smoother play on this device (☰ → Graphics to choose)',2800); } } }
  requestAnimationFrame(watch);
  return { layout:tick, get scale(){ return s; }, get quality(){ return ({low:3,medium:1,high:0,ultra:0})[tier]; }, get tier(){ return tier; }, get pref(){ return pref; }, setTier, TIERS };
})();
