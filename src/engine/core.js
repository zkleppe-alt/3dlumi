// ════════════════════════════════════════════════════════════════
//  CORE — one renderer, one knight, many LEVELS, one set of controls.
//
//  A walking level:
//    { id, name, zone(P)→string, scene, spawn:{x,z,face,yaw},
//      ground(x,z)→height, canMove(fx,fz,tx,tz)→bool,
//      folk:[{g,x,z,y,who,lines|next(),rest,action?}], spots:[{x,z,r,label,who,lines|next|action}],
//      anim:[fn(t,dt)], follow(P)?, clamp(v)?, cam:{pitch,dist,min,max}, banner?, onEnter? }
//  A minigame level adds  custom:{ buttons:[{id,label,hold?}], tick(dt,t,input), camera(cam,dt), onEnter? }
//  and the core hands it the stick, the buttons and the camera instead of walking.
//  ENGINE.add(level) · ENGINE.go(id, spawn) · UI.sheet(...) for every panel.
// ════════════════════════════════════════════════════════════════
const $=id=>document.getElementById(id);
// ── panels: shops, the inn, pickers, result cards ──
const UI=(function(){
  const el=$('sheet'), title=$('sheetTitle'), body=$('sheetBody'); let onAct=null, onClose=null, hold=0;
  el.addEventListener('click',e=>{ const a=e.target.closest('[data-act]'); if(a&&onAct&&performance.now()>hold){ onAct(a.dataset.act,a); } });
  $('sheetClose').addEventListener('click',()=>close());
  function sheet(o){ title.textContent=o.title||''; body.innerHTML=o.html||''; onAct=o.act||null; onClose=o.close||null; el.hidden=false; el.classList.toggle('wide',!!o.wide); el.classList.toggle('short',!!o.short);
    $('sheetClose').hidden=!!o.noClose; hold=performance.now()+(o.holdMs||0); body.scrollTop=o.keepScroll?body.scrollTop:0; }
  function close(){ if(el.hidden) return; el.hidden=true; const f=onClose; onAct=null; onClose=null; if(f) f(); }
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let tT=0; function toast(msg,ms){ const t=$('toast'); t.textContent=msg; t.hidden=false; clearTimeout(tT); tT=setTimeout(()=>t.hidden=true,ms||1800); }
  return { sheet, close, esc, toast, get open(){ return !el.hidden; } };
})();

// ── the view: 'classic' (the 2D game's proportions) or 'grand' (people at 0.45×, the world towering over them, the
//    camera low behind the knight). Outdoors only for now; every position, distance and rule stays in tiles. ──
const GRAND_CAM=0.34;
// on foot, his pace suits his size: in the grand view (drawn at 0.45×) he covers a little under half the ground he did, and in close
//  quarters (drawn smaller) a little less — so his legs can carry him at a real run instead of a patter
const FOOT_PACE=(L,ps)=>ps<1?0.47:L.close?0.8:L.actorS?0.78:1;   // Grand: the camera at a third of the Classic distance, close behind the knight
const VIEWMODE=(function(){ let mode='grand'; try{ mode=localStorage.getItem('klk3d_view')||'grand'; }catch(e){} if(/grand/.test(location.hash)) mode='grand';
  const PS={classic:1,grand:0.45};
  return { get mode(){ return mode; }, set(m){ mode=PS[m]?m:'classic'; try{ localStorage.setItem('klk3d_view',mode); }catch(e){} },
    ps(lv){ return lv&&(lv.id==='world'||/^pw:/.test(lv.id))&&!lv.custom?PS[mode]:1; } }; })();
const CLOSE_S=0.62; const ACTOR_S=lv=>lv&&lv.close?CLOSE_S:(lv&&lv.actorS)||1;   // close quarters and interiors draw the people smaller, so the rooms stand roomy round them
 let lockMix=0; const lockPt={x:0,z:0};   // how small the knight, his pet and the folk are drawn in close quarters (dungeons, the deep wood)
const ERR_TXT="3D graphics (WebGL) aren't available in this browser right now. Fully quit and reopen the browser (a graphics hiccup can switch 3D off until then), check that hardware / graphics acceleration is on in its settings.";
const ENGINE=(function(){
  const cv=$('scene');
  // the renderer: tried first in full, then lighter (no antialias, the low-power GPU) before giving up — a browser that has
  //  had a GPU crash will often still give the lighter one. ?lite (or a lighter start) also halves the pixel ratio and
  //  uses cheaper shadows
  let R=null, lite=/[?&]lite\b/.test(location.search);
  for(const o of (lite?[]:[{antialias:true}]).concat([{antialias:false,powerPreference:'low-power'},{antialias:false,powerPreference:'low-power',precision:'mediump',failIfMajorPerformanceCaveat:false}])){
    try{ R=new THREE.WebGLRenderer(Object.assign({canvas:cv},o)); if(R.getContext()){ if(!o.antialias) lite=true; break; } }catch(e){ R=null; } }
  if(!R){ const m=$('err'); m.textContent=ERR_TXT; m.hidden=false; return null; }
  R.setPixelRatio(Math.min(devicePixelRatio,lite?1:2)); R.shadowMap.enabled=true; R.shadowMap.type=lite?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;

  // if the GPU drops the context mid-game, say so and let three.js restore it rather than freezing on a dead canvas
  cv.addEventListener('webglcontextlost',e=>{ e.preventDefault(); const m=$('err'); m.textContent='The graphics card took a breather — restoring the 3D view…'; m.hidden=false; },false);
  cv.addEventListener('webglcontextrestored',()=>{ const m=$('err'); m.hidden=true; m.textContent=ERR_TXT; },false);
  const cam=new THREE.PerspectiveCamera(55,1,0.1,400);
  const K=buildKnight(); K.traverse(o=>{ if(o.isMesh) o.receiveShadow=true; });
  const P={x:0,z:0,y:0,face:Math.PI};
  const levels={}; let L=null, yaw=0, pitch=0.55, dist=9, lookT=0, kS=1, camPa=0, camYa=0, airLook=0;
  const PMIN=()=>L&&L.interior?0.02:L&&L.custom?0.12:-0.42;   // V113: the look reaches below level — the camera drops toward the ground and tilts up at the sky
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── HUD ──
  const plateH=$('placeName'), zoneEl=$('zone'), talkB=$('talk'), swingB=$('swing'), say=$('say'), sayWho=$('sayWho'), sayText=$('sayText'), sayMore=$('sayMore'), fade=$('fade'), acts=$('acts');
  let lastZone='', near=null, convo=null, busy=false, ps=1, presT=0, holdT=0, holdMode=null;
  // V140: THE PACE — on foot he walks (a brisk walk, the stick's push for slower); sprint is a toggle (V / L3 / the 🏃 button),
  //  and crouch is a toggle (X / ✚→ / the 🦶 button): a slow creep, low, that the demons are slower to notice. Either one turns
  //  the other off; mounting, swimming and the rest keep their own pace. Remembered for the session.
  const PACE={ sprint:false, crouch:false,
    mult(Lv){ if(Lv&&(Lv.interior||Lv.close)) return this.crouch?0.45:this.sprint?1:0.66; return this.crouch?0.27:this.sprint?1:0.38; },
    toggle(k){ if(k==='sprint'){ this.sprint=!this.sprint; if(this.sprint) this.crouch=false; } else { this.crouch=!this.crouch; if(this.crouch) this.sprint=false; }
      K.crouch=this.crouch; if(typeof UI!=='undefined') UI.toast(this.crouch?'🦶 Crouching — creeping low':this.sprint?'🏃 Sprinting':(k==='crouch'?'🚶 Standing — walking':'🚶 Walking'),1100); this.paint(); },
    paint(){ const s=document.getElementById('sprintBtn'), c=document.getElementById('crouchBtn'); if(s) s.classList.toggle('on',this.sprint); if(c) c.classList.toggle('on',this.crouch); } };
  function show(){ sayWho.textContent=convo.who; sayText.textContent=convo.lines[convo.i]; sayMore.textContent=convo.i<convo.lines.length-1?'Tap to continue':'Tap to close'; say.hidden=false; }
  function speak(who,lines,f,then){ convo={who,lines,i:0,f,then}; show(); }
  function act(){
    if(UI.open) return;
    if(convo){ convo.i++; if(convo.i>=convo.lines.length){ const th=convo.then; convo=null; say.hidden=true; if(th) th(); } else show(); return; }
    if(!near||busy) return;
    if(near.f&&GAME.S.livery==='robby'&&!/Robby/.test(near.f.who||'')){ UI.toast('…they will not look at you. Whatever you are wearing, it is not a knight.',1600); return; }
    if(near.action){ near.action(); return; }
    if(near.f&&near.f.action){ near.f.action(near.f); return; }
    // the story's own words for this person or sign, as it stands now (engine/dialogue.js)
    const key=near.f?near.f.key:near.key; if(key&&typeof DIALOGUE!=='undefined'&&!(near.f&&near.f.next)){ if(near.key&&!near.f){ const t=DIALOGUE.sign(key); if(t){ const ls=t.split('\n'); speak(near.who,[ls.slice(1).join('\n').trim()||ls[0]]); return; } }
      else { const d=DIALOGUE.lines(key); if(d){ speak(near.who,d.lines,near.f); return; } } }
    speak(near.who, near.lines||near.next(), near.f); }
  // the time of day by the gold, as the 2D HUD has it: the hour, and the sun, the dusk or the moon
  let clockS=''; function clock(){ const S=GAME.S, f=((S.dayFrac%1)+1)%1, h=Math.floor(f*24), m=Math.floor((f*24-h)*60), ap=h<12?'AM':'PM', hh=((h+11)%12)+1;
    const ic=f>=0.25&&f<0.292?'🌅':f>=0.292&&f<0.833?'☀️':f>=0.833&&f<0.875?'🌇':'🌙', s=ic+' '+hh+':'+String(m).padStart(2,'0')+ap; if(s!==clockS){ clockS=s; const e=$('clockTxt'); if(e) e.textContent=s; } }
  setInterval(()=>{ try{ clock(); }catch(e){} },1000);
  function hud(){ const S=GAME.S; clock(); $('lv').textContent='Lv '+S.level; $('hpTxt').textContent=S.hp+' / '+S.maxHp; $('hpBar').style.width=Math.max(0,Math.min(100,S.hp/S.maxHp*100))+'%'; $('goldTxt').textContent=S.gold+'g'; }
  GAME.on(()=>{ hud(); dressKnight(); });

  // the knight wears his livery and the colours of the gear he has on
  function dressKnight(){ K.dress(GAME.S); }   // livery, its shapes, the gear worn and the weapon in hand (knight.js)

  // ── levels ──
  function add(lv){ levels[lv.id]=lv; if(lv.lazy) return lv; lv.folk=lv.folk||[]; lv.spots=lv.spots||[]; lv.anim=lv.anim||[]; lv.cam=Object.assign({pitch:0.55,dist:9,min:4,max:18},lv.cam||{}); return lv; }
  // ── unstick: the nearest spot (in rings outward) you can walk away from — for a spawn with none given, a surfacing
  //    without the Sea Dragon, or anything else that leaves you penned (☰ System → Unstick me) ──
  const freeN=(lv,x,z)=>{ let n=0; for(let a=0;a<8;a++){ const dx=Math.cos(a*Math.PI/4)*0.35, dz=Math.sin(a*Math.PI/4)*0.35; try{ if(lv.canMove(x,z,x+dx,z+dz)) n++; }catch(e){ return 8; } } return n; }, freeAt=(lv,x,z)=>freeN(lv,x,z)>=3&&standable(lv,x,z), standable=(lv,x,z)=>{ try{ return !!lv.canMove(x,z,x,z); }catch(e){ return true; } };   // standable: the spot itself is clear (no furnishing underfoot)
  function unstick(lv,quiet){ lv=lv||L; if(!lv||lv.custom) return false; if(freeAt(lv,P.x,P.z)&&!blocked(P.x,P.z)) return false; const cx=P.x, cz=P.z;
    for(let r=0.5;r<40;r+=0.5){ const n=Math.max(8,Math.round(r*8)); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r; if(freeAt(lv,x,z)&&!blocked(x,z)){ P.x=x; P.z=z; P.y=lv.ground?lv.ground(x,z):0; if(!quiet) UI.toast('🧭 Back on open ground.',1200); return true; } } }
    return false; }
  function get(id){ let lv=levels[id]; if(lv&&lv.lazy){ const b=lv.lazy(); b.id=id; lv=add(b); } return lv; }
  function place(lv,sp){ if(typeof ootLight==='function') ootLight(lv.scene); if(typeof COMBAT!=='undefined') COMBAT.reset(); K.guarding=false; K.alert=false; L=lv; if(typeof sp==='function') sp=sp(lv); sp=sp||lv.spawn||{x:0,z:0};
    if(!lv.custom||lv.custom.knight!==false) lv.scene.add(K);
    (lv.spots||[]).forEach(q=>{ q._armed=false; q._t0=0; });   // a door you arrive by won't take you straight back out
    P.x=sp.x; P.z=sp.z; P.face=sp.face!==undefined?sp.face:Math.PI; P.y=lv.ground?lv.ground(P.x,P.z):0; J.on=false; J.h=0; J.v=0;
    if(!lv.custom&&lv.canMove&&!standable(lv,P.x,P.z)) unstick(lv,true);   // arriving on top of a furnishing: step straight off it
    if(!lv.custom&&lv.canMove) setTimeout(()=>{ if(L===lv&&!busy&&(freeN(lv,P.x,P.z)===0||!standable(lv,P.x,P.z))) unstick(lv,true); },700);   // truly penned on arrival (after a mount has had its chance)
    yaw=sp.yaw!==undefined&&!lv.close&&!lv.interior?sp.yaw:P.face+Math.PI; /* in close quarters, always from behind him */ ps=VIEWMODE.ps(lv); pitch=ps<1?Math.min(lv.cam.pitch,0.3):lv.cam.pitch; dist=lv.cam.dist*(ps<1?GRAND_CAM:1); K.scale.setScalar(ps*ACTOR_S(lv)); kS=1; camPa=0; camYa=0; { const fv=lv.interior?66:55; if(cam.fov!==fv){ cam.fov=fv; cam.updateProjectionMatrix(); } }   // indoors, a wider lens: more of the room, less of his back   // in close quarters he's drawn a little smaller, so the walls stand over him
    plateH.textContent=lv.name; lastZone=null; convo=null; say.hidden=true;
    const c=lv.custom; document.body.classList.toggle('mg',!!c); $('hudMg').hidden=!c; talkB.hidden=true; swingB.hidden=!!c; $('stick').hidden=!!(c&&c.noStick); buildButtons(c?c.buttons:[]);
    cam.position.set(P.x+Math.sin(yaw)*dist*Math.cos(pitch),P.y+1+Math.sin(pitch)*dist,P.z+Math.cos(yaw)*dist*Math.cos(pitch));
    if(lv.clamp) lv.clamp(cam.position);
    if(PETS3D) PETS3D.place(lv);
    if(lv.onEnter) lv.onEnter(sp);
    if(c&&c.onEnter) c.onEnter(sp);
    if(lv.banner) speak(lv.name,[lv.banner]); }
  function go(id,sp){ if(busy) return; const lv=get(id); if(!lv) return; busy=true; convo=null; say.hidden=true; UI.close(); fade.classList.add('on');
    setTimeout(()=>{ if(L&&L.onLeave) L.onLeave(); place(lv, sp||lv.spawn); GAME.save(); fade.classList.remove('on'); setTimeout(()=>busy=false,200); }, calm?10:380); }
  function start(id,sp){ hud(); dressKnight(); const lv=get(id); place(lv, sp||lv.spawn); requestAnimationFrame(frame); }

  // ── input: keys, joystick, drag to turn, wheel to zoom, and action buttons ──
  const keys={}, held={}, pressed={}; let mvx=0, mvz=0;
  const keyBtn={ ' ':'A', dodge:'A', e:'A', enter:'A', j:'A', z:'A', shift:'B', k:'B', x:'B' };
  addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); if(e.repeat){ return; } keys[k]=1;
    if(k==='m'||k==='escape'){ if(UI.open) UI.close(); else if(MENU&&!L.custom) MENU.toggle(); return; }
    if(UI.open) return;
    if(L&&L.custom){ const b=keyBtn[k]; if(b){ held[b]=true; pressed[b]=true; e.preventDefault(); } return; }
    if(keyBtn[k]==='B'&&L&&L.combat){ COMBAT.bDown(); e.preventDefault(); return; }
    if(k==='jump'){ e.preventDefault(); jump(); return; }
    if(k==='sprint'||k==='crouch'){ e.preventDefault(); if(!e.repeat) PACE.toggle(k); return; }
    if(k==='dodge'){ e.preventDefault(); if(L&&L.combat&&!convo&&!busy) COMBAT.dodge(moveDir()); return; }
    if(k===' '){ if(!e.repeat){ strike(); if(L&&L.combat) COMBAT.chargeStart(); } e.preventDefault(); } if(k==='e'||k==='enter') act(); });
  // the way the keys are pushing you, in the world (for a dodge roll that goes where you're heading)
  function moveDir(){ let ix=sv.x+PAD.mx, iz=sv.y+PAD.mz; if(keys.a||keys.arrowleft) ix-=1; if(keys.d||keys.arrowright) ix+=1; if(keys.w||keys.arrowup) iz-=1; if(keys.s||keys.arrowdown) iz+=1; const l=Math.hypot(ix,iz); if(l<0.2) return null;
    const sn=Math.sin(yaw), cs=Math.cos(yaw); return {x:(ix*cs+iz*sn)/l, z:(-ix*sn+iz*cs)/l}; }
  addEventListener('keyup',e=>{ const k=e.key.toLowerCase(); keys[k]=0; if(k===' '&&typeof COMBAT!=='undefined') COMBAT.chargeRelease(); const b=keyBtn[k]; if(b) held[b]=false; if(b==='B'&&typeof COMBAT!=='undefined') COMBAT.bUp(); });
  // ── the jump: a hop up and over — onto a ledge a little higher than you, down off any height ──
  const J={h:0,v:0,on:false,lx:0,lz:0};
  function jump(){ if(J.on||holdT>0||convo||busy||UI.open||(MENU&&MENU.open)||!L||L.custom||L.noJump) return; if(L.mounted&&L.mounted()) return; if(L.driving&&L.driving()) return;
    if(typeof COMBAT!=='undefined'&&(COMBAT.pl.leap||COMBAT.pl.dashing>0)) return; J.on=true; J.v=4.9; J.h=Math.max(J.h,0.001); if(typeof SFX!=='undefined'&&SFX.play) try{ SFX.play('step'); }catch(_){} }
  { const jb=document.createElement('button'); jb.id='jumpBtn'; jb.className='act'; jb.textContent='⤴'; jb.setAttribute('aria-label','Jump');
    jb.style.cssText='right:calc(104px + env(safe-area-inset-right,0px));bottom:calc(152px + env(safe-area-inset-bottom,0px));width:56px;height:56px;font-size:22px';
    jb.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); jump(); }); document.body.appendChild(jb); }
  function strike(){ if(holdT>0||convo||busy||UI.open||(MENU&&MENU.open)) return; if(L&&L.combat) COMBAT.attack(); else K.swing((K._sn=(K._sn||0)+1)%2?1:2); }
  const stick=$('stick'), knob=$('knob'); let sv={x:0,y:0}, sid=null;
  function stickMove(e){ const r=stick.getBoundingClientRect(); let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); const l=Math.hypot(dx,dy), M=Math.max(30,r.width*0.37); if(l>M){dx*=M/l;dy*=M/l;} sv={x:dx/M,y:dy/M}; knob.style.transform=`translate(${dx}px,${dy}px)`; }
  stick.addEventListener('pointerdown',e=>{ sid=e.pointerId; stick.setPointerCapture(sid); stickMove(e); e.preventDefault(); });
  stick.addEventListener('pointermove',e=>{ if(e.pointerId===sid) stickMove(e); });
  const endS=e=>{ if(e.pointerId!==sid) return; sid=null; sv={x:0,y:0}; knob.style.transform=''; stick.classList.remove('live'); if(stick._home) stick._home(); }; stick.addEventListener('pointerup',endS); stick.addEventListener('pointercancel',endS);
  // V128: on a touch screen the stick FLOATS, as most phone games' do: put your left thumb down anywhere in the lower-left of
  //  the screen and the stick comes to it; let go and it settles back to its corner (hud.js places that corner)
  { const zone=document.createElement('div'); zone.id='stickZone'; document.body.insertBefore(zone,stick);
    zone.addEventListener('pointerdown',e=>{ if(sid!==null) return; const w=stick.offsetWidth||110; stick.style.setProperty('left',(e.clientX-w/2)+'px','important'); stick.style.setProperty('top',(e.clientY-w/2)+'px','important'); stick.style.setProperty('bottom','auto','important');
      stick.classList.add('live'); sid=e.pointerId; try{ zone.setPointerCapture(sid); }catch(_){} stickMove(e); e.preventDefault(); });
    zone.addEventListener('pointermove',e=>{ if(e.pointerId===sid) stickMove(e); }); zone.addEventListener('pointerup',endS); zone.addEventListener('pointercancel',endS); }
  // the look stick (right thumb): turn and tilt the view smoothly while the left thumb walks
  const look=$('look'), lknob=$('lknob'); let lv2={x:0,y:0}, lid=null; const lookV={y:0,p:0};
  const PAD={mx:0,mz:0,lx:0,ly:0};   // a plugged-in controller's sticks (pad.js writes them)
  function lookMove(e){ const r=look.getBoundingClientRect(); let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); const l=Math.hypot(dx,dy), M=36; if(l>M){dx*=M/l;dy*=M/l;} lv2={x:dx/M,y:dy/M}; lknob.style.transform=`translate(${dx}px,${dy}px)`; }
  let lt0=0, lx0=0, ly0=0, lmax=0;   // a quick tap on the look stick (no drag) locks on, as clicking the right stick does
  if(look){ look.addEventListener('pointerdown',e=>{ lid=e.pointerId; look.setPointerCapture(lid); lt0=performance.now(); lx0=e.clientX; ly0=e.clientY; lmax=0; lv2={x:0,y:0}; e.preventDefault(); e.stopPropagation(); });
    look.addEventListener('pointermove',e=>{ if(e.pointerId!==lid) return; lmax=Math.max(lmax,Math.hypot(e.clientX-lx0,e.clientY-ly0)); if(lmax>6) lookMove(e); });
    const endL=e=>{ if(e.pointerId!==lid) return; lid=null; lv2={x:0,y:0}; lknob.style.transform=''; if(e.type==='pointerup'&&performance.now()-lt0<260&&lmax<10&&typeof COMBAT!=='undefined') COMBAT.toggleLock(); }; look.addEventListener('pointerup',endL); look.addEventListener('pointercancel',endL); }
  let did=null,lx=0,ly=0;
  cv.addEventListener('pointerdown',e=>{ if(document.pointerLockElement) return; did=e.pointerId; lx=e.clientX; ly=e.clientY; try{ cv.setPointerCapture(did); }catch(_){} });
  cv.addEventListener('pointermove',e=>{ if(e.pointerId!==did||(L&&L.custom)) return; yaw-=(e.clientX-lx)*0.006; pitch=Math.min(1.3,Math.max(PMIN(),pitch+(e.clientY-ly)*0.004)); lx=e.clientX; ly=e.clientY; });
  const endD=e=>{ if(e.pointerId===did) did=null; }; cv.addEventListener('pointerup',endD); cv.addEventListener('pointercancel',endD);
  // ── mouse and keyboard: click the game to steer the view with the mouse (pointer lock), as a PC action game does —
  //    left click swings (or reads on, in a conversation), hold right click to guard, middle click locks on; while locked on,
  //    a sharp flick of the mouse switches to the next foe that side. Esc (or any menu) frees the cursor. ──
  let mlock=false, flick=0, flickT=0; const MS=()=>typeof KEYS!=='undefined'&&KEYS.mouse?KEYS.mouse():{sens:1,inv:false};
  const lockable=()=>L&&!L.custom&&!UI.open&&!(MENU&&MENU.open)&&!busy;
  cv.addEventListener('mousedown',e=>{ if(!mlock){ if(e.button===0&&lockable()&&matchMedia('(pointer:fine)').matches&&cv.requestPointerLock){ try{ const r=cv.requestPointerLock(); if(r&&r.catch) r.catch(()=>{}); }catch(_){} } return; }
    e.preventDefault(); if(UI.open) return;
    if(e.button===0){ if(convo){ act(); return; } strike(); if(L&&L.combat) COMBAT.chargeStart(); }
    else if(e.button===2){ if(L&&L.combat) COMBAT.bDown(); else K.guarding=true; }
    else if(e.button===1){ if(L&&L.combat) COMBAT.toggleLock(); } });
  addEventListener('mouseup',e=>{ if(e.button===0&&typeof COMBAT!=='undefined') COMBAT.chargeRelease(); if(!mlock) return; if(e.button===2){ if(typeof COMBAT!=='undefined') COMBAT.bUp(); K.guarding=false; } });
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('pointerlockchange',()=>{ mlock=document.pointerLockElement===cv; document.body.classList.toggle('mlook',mlock); if(!mlock&&typeof COMBAT!=='undefined'&&COMBAT.pl.bDown) COMBAT.bUp(); });
  addEventListener('mousemove',e=>{ if(!mlock||!L||L.custom) return; const m=MS(), dx=e.movementX||0, dy=e.movementY||0; if(Math.abs(dx)>300||Math.abs(dy)>300) return;   // (a jump some browsers send on lock)
    if(Math.abs(dx)>1) lookT=performance.now();
    yaw-=dx*0.0024*m.sens; pitch=Math.min(1.3,Math.max(PMIN(),pitch+dy*0.0019*m.sens*(m.inv?-1:1)));
    if(typeof COMBAT!=='undefined'&&COMBAT.lockTarget()){ const t=performance.now(); if(t-flickT>350) flick=0; flickT=t; flick+=dx; if(Math.abs(flick)>140){ COMBAT.switchLock(Math.sign(flick)); flick=0; flickT=t+250; } } });
  const mouseFree=()=>{ if(mlock&&document.exitPointerLock) document.exitPointerLock(); };
  // two fingers on the screen: pinch to zoom (phones have no wheel)
  let pinch=0; cv.addEventListener('touchmove',e=>{ if(L.custom||e.touches.length!==2) { pinch=0; return; } const a=e.touches[0], b=e.touches[1], d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    if(pinch){ const k=ps<1?GRAND_CAM:1; dist=Math.min(L.cam.max*k,Math.max(L.cam.min*k*0.6,dist*pinch/d)); } pinch=d; did=null; e.preventDefault(); },{passive:false});
  cv.addEventListener('touchend',()=>{ pinch=0; });
  cv.addEventListener('wheel',e=>{ if(L.custom) return; const k=ps<1?GRAND_CAM:1; dist=Math.min(L.cam.max*k,Math.max(L.cam.min*k,dist+e.deltaY*0.01*k)); e.preventDefault(); },{passive:false});
  swingB.addEventListener('pointerdown',e=>{ e.preventDefault(); strike(); if(L&&L.combat) COMBAT.chargeStart(); });   // hold the button to charge the Spin Attack
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>swingB.addEventListener(ev,()=>{ if(typeof COMBAT!=='undefined') COMBAT.chargeRelease(); }));
  talkB.addEventListener('click',act); say.addEventListener('click',act);
  $('help').addEventListener('click',()=>{ const t=$('tips'); t.hidden=!t.hidden; $('help').setAttribute('aria-expanded',String(!t.hidden)); });
  $('menuBtn').addEventListener('click',()=>{ if(MENU&&L&&!L.custom) MENU.toggle(); });
  function buildButtons(list){ acts.innerHTML=''; (list||[]).forEach(b=>{ const el=document.createElement('button'); el.className='act mg'+(b.big?' big':''); el.textContent=b.label; el.dataset.id=b.id;
      const down=e=>{ e.preventDefault(); held[b.id]=true; pressed[b.id]=true; el.classList.add('on'); }, up=()=>{ held[b.id]=false; el.classList.remove('on'); };
      el.addEventListener('pointerdown',down); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); el.addEventListener('pointerleave',up); acts.appendChild(el); });
    acts.hidden=!(list&&list.length); }

  // ── what's in reach ──
  function nearest(){ let best=null, bd=1.7;
    L.folk.forEach(f=>{ if(f.mute) return; const d=Math.hypot(f.x-P.x,f.z-P.z)-(f.reach||0); if(d<bd){ bd=d; best={label:f.label||'Talk',who:f.who,lines:f.lines,next:f.next,f}; } });
    L.spots.forEach(s=>{ if(s.far||(s.hide&&s.hide())) return; const d=Math.hypot(s.x-P.x,s.z-P.z)-(s.r||1)+1.0; if(d<bd){ bd=d; best=s; } });
    if(!best) L.spots.forEach(s=>{ if(!s.far||(s.hide&&s.hide())) return; const d=Math.hypot(s.x-P.x,s.z-P.z)-(s.r||1)+1.0; if(d<bd){ bd=d; best=s; } });   /* V149: a far reach (the crook) only when nothing is close at hand */
    return best; }
  // folk are solid, but only a step INTO them is refused — a step away always is allowed, so you can never be stuck inside
  // someone who walked into you (and the foes of a fight are solid the same way, COMBAT.solid)
  function blocked(tx,tz){ const r0=f=>(f.solid||0.45)*Math.max(0.6,ps); return L.folk.some(f=>{ if(f.ghost||(f.g&&f.g.visible===false)) return false; const dn=Math.hypot(f.x-tx,f.z-tz), r=r0(f); return dn<r&&dn<Math.hypot(f.x-P.x,f.z-P.z)-1e-4; })||(typeof COMBAT!=='undefined'&&L.combat&&COMBAT.solid(tx,tz)); }

  function resize(){ const w=innerWidth,h=innerHeight; R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); if(window.KLK_POST) window.KLK_POST.resize(w,h); }
  addEventListener('resize',resize); resize();
  let last=performance.now(); const tmp=new THREE.Vector3();
  function frame(now){ if(window.TITLE_UP){ last=now; requestAnimationFrame(frame); return; }   /* V179: the title is up — the realm waits behind it, the clock stopped */
    const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now; const t=now/1000; DETAIL_TIME.value=t%1000;
    GAME.tick();
    const paused=UI.open||(MENU&&MENU.open);
    if(!L.custom&&!paused){ const dz=(v,d)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d), tx=dz(lv2.x,0.1)+PAD.lx+(keys.turnr?1:0)-(keys.turnl?1:0), ty=dz(lv2.y,0.2)+PAD.ly;   // the look stick and the turn keys
      // as Tears of the Kingdom turns its camera: a curved response (fine aim near the centre), ~3.4 rad/s at full tilt, swelling
      // to ~4 as you hold it there (a half-turn in under a second), a quick ~0.12s spin-up and a quicker settle when you let go — no float, no snap
      const cv=v=>Math.sign(v)*Math.pow(Math.min(1,Math.abs(v)),1.7), wantY=cv(Math.max(-1,Math.min(1,tx)))*3.4*(1+0.18*Math.min(1,(lookV.full=Math.abs(tx)>0.94?(lookV.full||0)+dt:0)/0.5)), wantP=cv(ty)*1.5;
      const ease=(v,w,up,dn)=>v+(w-v)*(1-Math.exp(-(Math.abs(w)>Math.abs(v)&&Math.sign(w)!==-Math.sign(v)?up:dn)*dt));
      lookV.y=ease(lookV.y,wantY,11,20); lookV.p=ease(lookV.p,wantP,11,20); if(Math.abs(lookV.y)<0.01&&!wantY) lookV.y=0; if(Math.abs(lookV.p)<0.01&&!wantP) lookV.p=0;
      if(lookV.y){ yaw-=lookV.y*dt; lookT=performance.now(); } if(lookV.p) pitch=Math.min(1.3,Math.max(PMIN(),pitch+lookV.p*dt)); } else { lookV.y=lookV.p=lookV.full=0; }
    let ix=sv.x+PAD.mx, iz=sv.y+PAD.mz; if(keys.a||keys.arrowleft) ix-=1; if(keys.d||keys.arrowright) ix+=1; if(keys.w||keys.arrowup) iz-=1; if(keys.s||keys.arrowdown) iz+=1;
    if(L.custom){ const input={x:Math.max(-1,Math.min(1,ix)),y:Math.max(-1,Math.min(1,iz)),held:Object.assign({},held),pressed:Object.assign({},pressed)};
      for(const k in pressed) delete pressed[k];
      if(!paused&&!busy) L.custom.tick(dt,t,input);
      L.anim.forEach(fn=>fn(t,dt)); if(L.custom.camera) L.custom.camera(cam,dt);
      if(PETS3D) PETS3D.tick(dt,t,P,L);
      R.render(L.scene,cam); requestAnimationFrame(frame); return; }
    if(mlock&&!lockable()) mouseFree();
    if(holdT>0) holdT-=dt; const hold=holdT>0;   // ENGINE.hold(s): sat in a chair and the like — no walking, swinging or guarding
    if(typeof COMBAT!=='undefined') COMBAT.frame(dt,!!(convo||busy||paused||hold));
    const l=(convo||busy||paused||hold)?0:Math.hypot(ix,iz);
    if(l>0.08){ const onFoot=!(L.mounted&&L.mounted())&&!(L.driving&&L.driving()), sp=(L.speed||4.3)*(onFoot?FOOT_PACE(L,ps)*PACE.mult(L):1)*(GAME.fx.swift?1.3:1)*(L.speedMult?L.speedMult():1)*(L.combat?(COMBAT.moveMul?COMBAT.moveMul():COMBAT.pl.blocking?0.6:1):1), s=Math.min(1,l)*sp*dt/l, sn=Math.sin(yaw), cs=Math.cos(yaw), mx=(ix*cs+iz*sn)*s, mz=(-ix*sn+iz*cs)*s;
      const okX=L.canMove(P.x,P.z,P.x+mx,P.z)&&!blocked(P.x+mx,P.z); if(okX) P.x+=mx; const okZ=L.canMove(P.x,P.z,P.x,P.z+mz)&&!blocked(P.x,P.z+mz); if(okZ) P.z+=mz;
      // corner help: pushing into a wall beside an opening slides you onto the opening's line, so a one-tile
      // corridor can be entered without lining up by hand
      if(L.cornerHelp!==false){ const big=Math.max(Math.abs(mx),Math.abs(mz)), sl=big;
        if(!okX&&Math.abs(mx)>=Math.abs(mz)*0.5&&Math.abs(mx)>1e-4){ for(const c of [Math.floor(P.z)+0.5,Math.floor(P.z)+(P.z%1<0.5?-0.5:1.5)]){ const dz=c-P.z; if(Math.abs(dz)>0.62) continue;
            if(L.canMove(P.x,c,P.x+Math.sign(mx)*0.3,c)){ const st=Math.sign(dz)*Math.min(Math.abs(dz),sl); if(L.canMove(P.x,P.z,P.x,P.z+st)){ P.z+=st; break; } } } }
        if(!okZ&&Math.abs(mz)>=Math.abs(mx)*0.5&&Math.abs(mz)>1e-4){ for(const c of [Math.floor(P.x)+0.5,Math.floor(P.x)+(P.x%1<0.5?-0.5:1.5)]){ const dx=c-P.x; if(Math.abs(dx)>0.62) continue;
            if(L.canMove(c,P.z,c,P.z+Math.sign(mz)*0.3)){ const st=Math.sign(dx)*Math.min(Math.abs(dx),sl); if(L.canMove(P.x,P.z,P.x+st,P.z)){ P.x+=st; break; } } } } }
      let d=Math.atan2(mx,mz)-P.face; d=Math.atan2(Math.sin(d),Math.cos(d)); P.face+=d*Math.min(1,dt*12);
      mvx=mx; mvz=mz; }
    // walk into a door to go through it (no button): a doorway spot with .auto=[dx,dz] (or 'any') fires when you're on it and
    //  pushing that way. It arms once you've stepped clear of it, or stood a moment not pushing through it — so the door you
    //  arrive by never throws you straight back, yet turning round in the doorway takes you out again
    { const moving=l>0.08&&!(convo||busy||paused||hold), ml=Math.hypot(mvx,mvz)||1, now=performance.now();
      for(const q of L.spots){ if(!q.auto) continue; const dd=Math.hypot(q.x-P.x,q.z-P.z), ar=q.ar||0.6, push=moving&&(q.auto==='any'||(mvx*q.auto[0]+mvz*q.auto[1])/ml>0.55);
        if(!q._armed){ if(!q._t0) q._t0=now; if(dd>ar+0.45||(now-q._t0>650&&!push)) q._armed=true; continue; }
        if(dd<ar&&push){ q._armed=false; q._t0=now; if(q.action) q.action(q); else if(q.lines) speak(q.who,q.lines); break; } } }
    const gy=L.ground(P.x,P.z); if(Math.hypot(P.x-J.lx,P.z-J.lz)>1.5){ J.on=false; J.h=0; J.v=0; P.y=gy; } J.lx=P.x; J.lz=P.z;   // set down somewhere new: no falling from where you were
    if(J.on&&J.fall&&J.fvx!==undefined){ const nx=P.x+J.fvx*dt, nz=P.z+J.fvz*dt; if(!L.canMove||L.canMove(P.x,P.z,nx,nz)){ P.x=nx; P.z=nz; J.lx=P.x; J.lz=P.z; } else { J.fvx*=0.3; J.fvz*=0.3; } J.fvx*=Math.max(0,1-dt*1.2); J.fvz*=Math.max(0,1-dt*1.2); }
    if(J.on){ const top=P.y+J.h; J.peak=Math.max(J.peak||top,top); J.v-=(J.fall?(J.v>0?11:13):17)*dt; if(J.fall) J.v=Math.max(J.v,-9.5); J.fallT=(J.fallT||0)+dt; let nh=top+J.v*dt;   /* V165: a drop off a ledge hangs a moment, then falls — softer than a hop's gravity, and never faster than a man falls in a few yards */ if(J.v<0&&nh<=gy){ J.on=false; J.v=0; J.h=0; P.y=gy; J.fall=false; J.fvx=J.fvz=undefined; if(typeof COMBAT!=='undefined'&&COMBAT.landed) COMBAT.landed();
        /* V143: a long drop lands hard — he takes it on bent knees and a hand, and needs a moment to rise */
        const drop=(J.peak||gy)-gy; J.peak=0; if(typeof SFX!=='undefined'&&SFX.play) SFX.play(drop>1.6?'stairStep':'step'); const free=!(L.mounted&&L.mounted())&&!(typeof COMBAT!=='undefined'&&COMBAT.pl.leap); K.landK=free?Math.min(1,Math.max(0,(drop-0.4)/2.2)):0; K.landT=0;   /* V165: the knees take it — a dip for a hop, a deep crouch with a hand down for a long drop */
        if(free&&drop>2.0&&K.act&&K.act('land',0.95,{arms:true,w:0.4,u0:0.08,u1:0.85})){ holdT=Math.max(holdT,0.45); holdMode=null; K.landK*=0.6; } J.fallT=0; }   /* the hard landing's clip carries most of a long drop; the knee dip the rest */ else if(J.fall){ P.y=nh; J.h=0; }   /* V165: falling, he and the camera go down together — before, the body hung at the ledge's height and then snapped to the floor */
      else { if(gy>P.y) P.y=gy; J.h=nh-P.y; if(J.h<0){ if(gy<P.y-0.5){ J.fall=true; J.fallT=0.3; P.y=nh; J.h=0; } else { J.on=false; J.h=0; P.y=gy; } } } }   /* a hop off an edge carries on down as a fall */
    else { if(gy<P.y-0.5){ J.on=true; J.v=2.6; J.h=0; J.fall=true; J.fallT=0; const sp=Math.min(1,Math.hypot(P.x-(J.px||P.x),P.z-(J.pz||P.z))/Math.max(dt,0.001)/4); J.fvx=Math.sin(P.face)*(1.6+1.6*sp); J.fvz=Math.cos(P.face)*(1.6+1.6*sp); } else P.y+=(gy-P.y)*Math.min(1,dt*(gy>P.y?16:10)); }   // stepping off a ledge: you fall, not float down — V159: a small hop out over the edge, your stride carried into the fall
    if(J.kt>0){ J.kt-=dt; const sp=1.5*Math.max(0,J.kt/0.55), nx=P.x+J.kx*sp*dt, nz=P.z+J.kz*sp*dt; if(!L.canMove||L.canMove(P.x,P.z,nx,nz)){ P.x=nx; P.z=nz; J.lx=P.x; J.lz=P.z; } }   // the shove carries him back a step or two as he goes over
    J.px=P.x; J.pz=P.z;
    // close quarters (a dungeon, the deep wood): the camera rides low behind your shoulder, and when you walk it settles in behind
    //  you again by itself unless you've looked about in the last moment — so a corridor stays ahead of you, walls on either hand
    if((L.close||L.interior)&&l>0.08&&!(convo||busy||paused||hold)&&performance.now()-lookT>1400&&!(typeof COMBAT!=='undefined'&&COMBAT.lockTarget())){ const ml=Math.hypot(mvx,mvz)||1, fwd=(-mvx*Math.sin(yaw)-mvz*Math.cos(yaw))/ml;   // only while you head away from the camera: walking back toward it or across, it holds still
      if(fwd>0.4){ let dy=(P.face+Math.PI)-yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); yaw+=dy*Math.min(1,dt*1.1*fwd); } }
    if(typeof COMBAT!=='undefined'&&L.combat){ const tg=COMBAT.lockTarget(); if(tg&&!(convo||busy||paused||hold)){   // locked on: face the foe, and the camera swings round behind you to frame it (the look stick still nudges it)
        const want=Math.atan2(tg.x-P.x,tg.z-P.z); if(!COMBAT.pl.dashing){ let d=want-P.face; d=Math.atan2(Math.sin(d),Math.cos(d)); P.face+=d*Math.min(1,dt*14); }
        if(!lookV.y){ let dy=(want+Math.PI)-yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); yaw+=dy*Math.min(1,dt*5); } } }
    K.animate(dt,hold&&holdMode?holdMode:l>0.08?'walk':'idle',Math.min(1,l)/ps); K.position.set(P.x,P.y+J.h+(typeof COMBAT!=='undefined'?COMBAT.pl.jumpY*ps:0),P.z); K.falling=J.on&&J.fall?J.fallT:0; if(J.on) K.air=Math.max(K.air||0,J.fall?1:Math.min(1,J.h*1.4+0.25)); else if(!L.combat) K.air=0; K.rotation.y=P.face+(K.spinA||0);   // (small legs step faster to cover the same ground)
    if(typeof DIALOGUE!=='undefined'&&(++presT%20)===0) L.folk.forEach(f=>{ if(!f.key) return; const on=DIALOGUE.present(f.key);   // who the story has here now
      if(!on&&!f._phide){ f._phide=true; f.g.visible=false; f.mute=true; f.ghost=true; } else if(on&&f._phide){ f._phide=false; f.g.visible=true; f.mute=false; f.ghost=false; } });
    L.folk.forEach(f=>{ const u=f.g.userData, fs=ps*ACTOR_S(L); if(u.vs!==fs){ if(u.s0===undefined) u.s0=f.g.scale.x; f.g.scale.setScalar(u.s0*fs); u.vs=fs; } if(f.still) return; f.g.position.y=f.y+Math.abs(Math.sin(t*1.3+(f.ph||0)))*0.02;
      const want=(convo&&convo.f===f)||Math.hypot(f.x-P.x,f.z-P.z)<2.5 ? Math.atan2(P.x-f.x,P.z-f.z) : (f.rest||0);
      let d=want-f.g.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); f.g.rotation.y+=d*Math.min(1,dt*5); if(typeof folkPose==='function'&&Math.hypot(f.x-P.x,f.z-P.z)<24) folkPose(f,t,dt,P,!!(convo&&convo.f===f)); });
    L.anim.forEach(fn=>fn(t,dt));
    if(PETS3D) PETS3D.tick(dt,t,P,L);
    document.body.classList.toggle('saying',!say.hidden); near=(convo||busy||paused)?null:hold?((L.spots||[]).find(q=>q.holdOK)||null):nearest(); /* V130: while sat, only what belongs to the sitting (the fishing rod's Reel / Stand) */ talkB.hidden=!near&&!convo; if(near) talkB.textContent=near.label||'Talk'; else if(convo) talkB.textContent='Next';
    if(convo&&convo.f&&Math.hypot(convo.f.x-P.x,convo.f.z-P.z)>3.2){ convo=null; say.hidden=true; }
    const z=L.zone?L.zone(P):''; if(z!==lastZone){ lastZone=z; zoneEl.textContent=z; }
    const CQ=L.close||L.interior, AS=ACTOR_S(L), EYE=L.interior?1.6*AS:L.close?0.9:1, HY=L.interior?1.2*AS:L.close?0.9*CLOSE_S:0.9;   // indoors: a low camera at his shoulder, as in Hyrule's houses
    { const tg=typeof COMBAT!=='undefined'&&L.combat&&COMBAT.lockTarget(); const want=tg&&tg.alt>0.6?tg.alt:0; airLook+=(want-airLook)*Math.min(1,dt*(want>airLook?3:1.5)); }   // V113: locked on a foe in the air, the camera sinks and tilts up to keep it in view
    const PIT=pitch-airLook*0.09;
    tmp.set(P.x+Math.sin(yaw)*Math.cos(PIT)*dist, P.y+(ps<1?1.2*ps+0.25:EYE)+Math.sin(PIT)*dist, P.z+Math.cos(yaw)*Math.cos(PIT)*dist);
    if(L.clamp) L.clamp(tmp);
    // pull in when a wall, a house or a tree stands between the knight and the camera; boxed in close (a forest
    // mouth, an alley), rise over it instead
    if(L.camBlock){ const hy=P.y+(ps<1?0.9*ps+0.35:HY);
      const hitAt=(cx,cy,cz)=>{ const dx=cx-P.x, dy=cy-hy, dz=cz-P.z, D=Math.hypot(dx,dz), n=Math.ceil(D/0.25); for(let i=2;i<=n;i++){ const f=i/n; if(L.camBlock(P.x+dx*f,P.z+dz*f,hy+dy*f)) return Math.max(0.12,(i-1.5)/n-0.7/Math.max(0.5,D)); } return 1; };
      const pose=(pa,ya)=>{ const pp=Math.min(1.35,PIT+pa), yy=yaw+ya; return {cx:P.x+Math.sin(yy)*Math.cos(pp)*dist, cy:P.y+(ps<1?1.2*ps+0.25:EYE)+Math.sin(pp)*dist, cz:P.z+Math.cos(yy)*Math.cos(pp)*dist}; };
      let best=null;
      if(CQ){ best=pose(0,0); best.k=hitAt(best.cx,best.cy,best.cz); }
      else {   // V110, the Hyrule way: keep the angle you chose and pull in along it; failing that, slide a little round the corner;
               //  only as a last resort lift over the top. The slide and the lift ease in and out, so the camera glides, never jumps.
        let bs=-9, bp=0, by=0; outer: for(const pa of [0,0.22,0.45,0.8]) for(const ya of [0,-0.32,0.32,-0.65,0.65]){ const q=pose(pa,ya), k=Math.min(1,hitAt(q.cx,q.cy,q.cz)), sc=(k>=0.42?k:k*0.5)-pa*0.5-Math.abs(ya)*0.28;
          if(sc>bs){ bs=sc; bp=pa; by=ya; } if(pa===0&&ya===0&&k>=0.98) break outer; }
        camPa+=(bp-camPa)*Math.min(1,dt*2.6); camYa+=(by-camYa)*Math.min(1,dt*2.6); best=pose(camPa,camYa); best.k=hitAt(best.cx,best.cy,best.cz); }
      kS+=(best.k-kS)*Math.min(1,dt*(best.k<kS?14:1.8)); best.k=Math.min(best.k,kS);   // pull in at once, ease back out slowly: no pumping in and out at every corner
      tmp.set(P.x+(best.cx-P.x)*best.k,hy+(best.cy-hy)*best.k+(best.k<1?0.15:0)+(L.interior?Math.max(0,0.85-best.k)*1.1*AS:0),P.z+(best.cz-P.z)*best.k); 
      // V160: a hard stop — whatever the easing, the camera never ends inside stone: walk in along the line to the last clear point
      { const HB=L.camHard; if(HB&&HB(tmp.x,tmp.z,tmp.y)){   /* only where the level knows exactly what is stone (the catacombs, the chapels) */ const dx=tmp.x-P.x, dy=tmp.y-hy, dz=tmp.z-P.z, D=Math.hypot(dx,dy,dz)||1; let f=0.2/D;
        for(let i=1;i<=40;i++){ const u=i/40; if(u*D<0.2) continue; if(HB(P.x+dx*u,P.z+dz*u,hy+dy*u)){ f=Math.max(0.2/D,(i-1.5)/40); break; } f=u; }
        tmp.set(P.x+dx*f,hy+dy*f,P.z+dz*f); kS=Math.min(kS,f); } } }   // indoors, backed against a wall: up, and looking down over his shoulder
    if(!L.interior&&L.ground){ const gy=L.ground(tmp.x,tmp.z)+0.35; if(tmp.y<gy) tmp.y=gy; }
    if(CQ){ const sh=L.interior?0.52*AS:0.22; tmp.x+=Math.cos(yaw)*sh; tmp.z-=Math.sin(yaw)*sh; if(L.clamp) L.clamp(tmp); }   // over his right shoulder, so the way ahead isn't all helmet
    K.visible=!CQ||cam.position.distanceTo(K.position)>(L.interior?0.7*AS:0.85);   // backed against a wall, the camera would sit inside him
    { const tg=typeof COMBAT!=='undefined'&&L.combat&&COMBAT.lockTarget(); const want=tg?Math.min(0.5,0.12+Math.hypot(tg.x-P.x,tg.z-P.z)*0.05):0; lockMix+=(want-lockMix)*Math.min(1,dt*4); if(tg){ lockPt.x=tg.x; lockPt.z=tg.z; }   // locked on: frame the foe as well as you
      if(lockMix>0.005){ tmp.x-=(lockPt.x-P.x)*lockMix*0.6; tmp.z-=(lockPt.z-P.z)*lockMix*0.6; tmp.y+=lockMix*0.8; } }
    if(!Number.isFinite(P.y)) P.y=L.ground?L.ground(P.x,P.z)||0:0; if(!Number.isFinite(tmp.x+tmp.y+tmp.z)) tmp.set(P.x,P.y+2.5,P.z+3.5); if(!Number.isFinite(cam.position.x+cam.position.y+cam.position.z)) cam.position.copy(tmp);   /* V176c: a bad height never sticks the camera in nowhere */
    cam.position.lerp(tmp,Math.min(1,dt*8)); { const HB=L.camHard; if(HB&&HB(cam.position.x,cam.position.z,cam.position.y)&&!HB(tmp.x,tmp.z,tmp.y)) cam.position.copy(tmp); }   /* V160: gliding after the knight, never through the stone: if the glide is in a wall, go straight to the clear spot */ const upK=Math.max(0,0.14-PIT)*dist*1.15+airLook*0.55; cam.lookAt(P.x+(lockPt.x-P.x)*lockMix+(CQ?-Math.sin(yaw)*(L.interior?2.6*AS:1.2):0),P.y+(ps<1?0.9*ps+0.35:HY)+(L.cam.lookH||0)+upK,P.z+(lockPt.z-P.z)*lockMix+(CQ?-Math.cos(yaw)*(L.interior?2.6*AS:1.2):0));   // in close quarters, look past him down the way ahead
    if(typeof COMBAT!=='undefined'&&COMBAT.shakeAmt>0.001&&!calm){ const a=COMBAT.shakeAmt*(ps<1?0.6:1); cam.position.x+=(Math.random()-0.5)*a; cam.position.y+=(Math.random()-0.5)*a; cam.position.z+=(Math.random()-0.5)*a; }   // the blow lands
    if(L.follow) L.follow(P);
    if(L.cine) L.cine(cam,dt);   /* V150: a level's own cutscene camera (it blends from the follow camera and back) */
    if(window.__view){ cam.position.set(...window.__view.p); cam.lookAt(...window.__view.l); }
    { const PO=window.KLK_POST; if(PO&&PO.on) PO.render(L.scene,cam); else R.render(L.scene,cam); } requestAnimationFrame(frame); }   /* V135: High/Ultra draw through post.js */

  return { pace:PACE, add, get, go, start, speak, P, K, cam, renderer:R, moveInput:()=>moveDir()||{x:0,z:0}, levels, hud, dressKnight, get level(){ return L; }, unstick:(q)=>unstick(L,q), get yaw(){ return yaw; }, get busy(){ return busy; }, hold(s,mode){ holdT=s; holdMode=mode||null; }, knock(fx,fz){ if(J.on||(L&&L.mounted&&L.mounted())) return false; const dx=P.x-fx, dz=P.z-fz, d=Math.hypot(dx,dz)||1; P.face=Math.atan2(-dx,-dz); holdT=2.65; holdMode='knock'; K._kn=0; K._kmode=false; J.kx=dx/d; J.kz=dz/d; J.kt=0.55; if(typeof SFX!=='undefined'&&SFX.play) try{ SFX.play('knock'); }catch(_){} return true; },   /* V165: shoved over (Dylan): he faces the shove and goes down backwards */ get holding(){ return holdT>0; }, calm, get ps(){ return ps; }, get airH(){ return J.h; }, pad:PAD, get airborne(){ return J.on; }, jump, plunge(){ if(J.on&&J.h>0.15){ J.v=Math.min(J.v,-10); return true; } return false; } };
})();
