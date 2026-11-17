// ════════════════════════════════════════════════════════════════
//  RIDING — your companion's final form carries you in the open (toggleMount, petAbility, FLY_PASS / SWIM_PASS):
//   🦁 the Lion rides: double speed · 🦢 the Great Dove and 🦄 the Unicorn fly: over trees, water, fences, bushes,
//   surf, swamp, cliffs and rock (×1.4) · 🐉 the Sea Dragon swims: over water, surf and swamp water (×1.4).
//   Mounted, heights don't stop you (the game ignores elevation for a rider). Dismount only onto solid ground.
//   Indoors, in a chapel, in a minigame, on a boat or driving a cart, you're on foot.
//  Also here: ROBBY'S DEMISE (beastForm) — on foot in the open, fences, gates, water, cliffs, trees and swamp are
//  nothing to him (buildings still are); and nobody will speak to him but Robby.
//  riding(world) → { mounted }
// ════════════════════════════════════════════════════════════════
const FLY_PASS=new Set([1,3,14,15,20,21,29,32,33]), SWIM_PASS=new Set([3,20,21,29]);
const STEED_LOOK={ faithful:{kind:'lion',coat:['#a8702a','#d8a050','#f0c878'],mane:'#7a3a12'}, grace:{kind:'dove',coat:['#c8c8d4','#eeeef4','#ffffff'],mane:'#dcdce8'},
  steadfast:{kind:'dragon',coat:['#17504e','#2a7a74','#4aa09a'],mane:'#123a44'}, unicorn:{kind:'unicorn',coat:['#d8d8e4','#f2f2f8','#ffffff'],mane:'#e8a8d8'} };
function riding(world){
  const S=()=>GAME.S, P=ENGINE.P, K=ENGINE.K;
  const ability=()=>{ const p=S().pet; if(!p) return null; const f=SYS.PETS[p.id]&&SYS.PETS[p.id].forms[p.form]; return f&&f.ability||null; };
  let mounted=false, model=null, modelKey='', air=0, tr=null;
  const btn=document.createElement('button'); btn.className='act'; btn.id='mountBtn'; btn.hidden=true;
  btn.style.cssText='position:fixed;left:calc(26px + env(safe-area-inset-left,0px));bottom:calc(200px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:1px solid rgba(242,193,78,.8);background:rgba(22,32,46,.6);color:#f2e2b0;font:700 24px var(--f-body);cursor:pointer;touch-action:none;z-index:5';
  btn.setAttribute('aria-label','Mount or dismount your companion'); document.body.appendChild(btn);
  const busy=()=>{ const sail=world._sailing&&world._sailing.boating, cart=typeof tradeSystem!=='undefined'&&tradeSystem.current&&tradeSystem.current.driving; return sail||cart; };
  function toggle(){ const ab=ability();
    if(!ab){ UI.toast('Your companion must reach its final form to carry you.',1800); return; }
    if(ENGINE.level!==world){ UI.toast('You can only mount in the open world.',1400); return; }
    if(tr) return;
    if(mounted){ const tx=Math.floor(P.x), ty=Math.floor(P.z); if(!world.WK(tx,ty)){ UI.toast('Find solid ground before dismounting!',1600); return; }
      // V184: THE DISMOUNT — the steed settles (a flyer comes down first), he swings a leg over and drops to the ground at its
      //  left shoulder while it steps aside, and it is your companion at your heels again
      const y0=model?model.position.y:P.y; mounted=false; P.y=baseGround(P.x,P.z); flyY=null;
      if(model&&ENGINE.level===world&&!window.NO_MOUNT_ANIM){ const drop=Math.max(0,y0-P.y), land=Math.min(0.9,drop*0.22); tr={k:'off',t:0,land,dur:land+0.95,y0,face:P.face,x:P.x,z:P.z}; ENGINE.hold(tr.dur,'idle'); }
      UI.toast('🚶 You dismount.',1000); }
    else { if(busy()) return; if(typeof SFX!=='undefined') SFX.play('mount'); const f=SYS.PETS[S().pet.id].forms[S().pet.form]; build();
      // V184: THE MOUNT — your companion trots up to your side, growing to its full size; you take a step, vault, swing a leg
      //  over and settle in the saddle as it takes your weight
      if(model&&!window.NO_MOUNT_ANIM){ const a=(typeof PETS3D!=='undefined'&&PETS3D.at&&PETS3D.at())||null, vs=VIEWMODE.ps(world);
        tr={k:'on',t:0,dur:1.5,face:P.face,x:P.x,z:P.z,fx:a?a.x:P.x-Math.sin(P.face)*1.2*vs,fz:a?a.z:P.z-Math.cos(P.face)*1.2*vs,ff:a?a.face:P.face,fs:a?a.scale:0.5*vs}; ENGINE.hold(tr.dur,'idle'); }
      else mounted=true;
      UI.toast(`${f.emoji} You mount your ${f.name}! ${ab==='ride'?'Gallop — double speed.':ab==='fly'?'Soar over trees, water, and cliffs.':'Swim across water.'} Tap ${f.emoji} again to dismount.`,2400); }
    sync(); }
  btn.addEventListener('pointerdown',e=>{ e.preventDefault(); toggle(); });
  addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='r'&&!UI.open&&!e.repeat) toggle(); });
  function sync(){ const ab=ability(), here=ENGINE.level===world&&!busy(); btn.hidden=!(ab&&here); const p=S().pet;
    btn.textContent=mounted?'🚶':(p?SYS.PETS[p.id].forms[p.form].emoji:'🐎'); if(model) model.visible=(mounted||!!tr)&&here; }
  // ── the rules of the road, mounted and as the beast ──
  const baseMove=world.canMove, baseGround=world.ground, baseSpeed=world.speedMult;
  const inB=(x,y)=>x>=0&&y>=0&&x<world.W&&y<world.H;
  world.canMove=(fx,fz,tx,tz)=>{ const bx=Math.floor(tx), by=Math.floor(tz), ab=mounted&&ability();
    if(ab&&!busy()){ if(!inB(bx,by)) return false; if(world.barrierAt(bx,by)>=0) return false; const t=world.T(bx,by);
      if(world.WK(bx,by)) return baseMove(fx,fz,tx,tz)||true;                      // no heights for a rider
      return ab==='fly'?true:ab==='swim'?SWIM_PASS.has(t):false; }   /* V142: on the wing, over roofs, walls and crags alike (the story's barriers still hold) */
    if(S().livery==='robby'&&!busy()&&inB(bx,by)&&(bx!==Math.floor(fx)||by!==Math.floor(fz))){ const t=world.T(bx,by);
      if((t===39||t===40||FLY_PASS.has(t))&&world.barrierAt(bx,by)<0){ const hf=world.E(Math.floor(fx),Math.floor(fz)), ht=world.E(bx,by); if(ht<=hf||t===33||t===32) return true; } }
    return baseMove(fx,fz,tx,tz); };
  world.mounted=()=>mounted; world.mountT=()=>tr?[tr.k,+tr.t.toFixed(2)]:null;   // (on foot, the grand view slows his pace to his size; mounted it doesn't)
  world.speedMult=()=>{ const b=baseSpeed?baseSpeed():1, ab=mounted&&ability(); return ab?b*(ab==='ride'?2:1.4):b; };
  // V142: FLIGHT ABOVE IT ALL — the height of whatever stands at a spot (the camera's own map of what's solid: roofs, towers,
  //  walls, trees, crags, the watchtowers), and the Dove keeps above the highest of it under her and a little ahead, with a
  //  clear margin over the canopy — climbing quickly to clear a ridge, settling slowly back down after it
  const topAt=(x,z)=>{ const g=Math.max(baseGround(x,z),-0.1), r=world.roll?world.roll(x,z)||0:0; let y=g; if(world.camBlock) while(y<g+22&&world.camBlock(x,z,y-r)) y+=0.5;
    if(world.T(Math.floor(x),Math.floor(z))===1) y=Math.max(y,g+4.8);   /* the crowns of the new trees stand well above the trunk the camera map knows */
    return y; };
  let flyY=null;
  function flyTarget(){ const sx=Math.sin(P.face), sz=Math.cos(P.face); let top=-1e9;
    for(const [f,l] of [[0,0],[1.5,0],[3,0],[4.5,0],[6.5,0],[9,0],[1.5,1.5],[1.5,-1.5],[0,1.5],[0,-1.5],[4,2],[4,-2]]){ const x=P.x+sx*f+sz*l, z=P.z+sz*f-sx*l; top=Math.max(top,topAt(x,z)); }
    return Math.max(top+1.6,Math.max(baseGround(P.x,P.z),-0.1)+3.5); }
  world.ground=(x,z)=>{ const g=baseGround(x,z), ab=mounted&&ability(); if(ab==='fly'){ if(flyY!==null&&x===P.x&&z===P.z) return flyY;   /* only the rider's own spot: the folk and the demons below stay on their ground */ return Math.max(g,-0.1)+0.15; } if(ab==='swim'&&SWIM_PASS.has(world.T(Math.floor(x),Math.floor(z)))) return -0.2; return g; };
  // ── the steed under the knight ──
  function build(){ const p=S().pet; if(!p) return; const key=p.id+':'+p.form+(typeof PETLOOKS!=='undefined'?PETLOOKS.key(S()):''); if(model&&modelKey===key) return; if(model) world.scene.remove(model);
    const L=STEED_LOOK[p.id]||STEED_LOOK.faithful; model=horseModel({kind:L.kind,coat:L.coat,mane:L.mane}); if(typeof petLookApply!=='undefined') petLookApply(model,PETLOOKS.shown(),S().mountSkin,L.kind); model.visible=false; world.scene.add(model); modelKey=key; }
  let lx=0, lz=0;
  world.anim.push((t,dt)=>{ dt=dt||0.016; sync(); if(ENGINE.level!==world) return; if(mounted&&busy()) mounted=false; if(tr){ if(busy()||!model){ tr=null; } else { transit(t,dt); return; } } if(!mounted){ if(model) model.visible=false; return; }
    build(); if(!model) return; const vs=VIEWMODE.ps(world), ab=ability(), raw=Math.min(1,Math.hypot(P.x-lx,P.z-lz)/Math.max(1e-3,dt)/8); lx=P.x; lz=P.z;
    // V99: a smoothed speed and the rate of turn (for the lean into a bend), and the rider coupled to the steed's own back
    spS+=(raw-spS)*Math.min(1,dt*5); let dy=P.face-lf; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); lf=P.face; yawR+=((dy/Math.max(dt,1e-3))-yawR)*Math.min(1,dt*6);
    const bank=Math.max(-0.35,Math.min(0.35,-yawR*0.12*Math.min(1,spS*2.5)));
    if(ab==='fly'){ const tg=flyTarget(); if(flyY===null) flyY=Math.max(baseGround(P.x,P.z),-0.1)+0.15; flyY+=(tg-flyY)*Math.min(1,dt*(tg>flyY?4.5:1.1)); P.y=flyY; } else flyY=null;
    air=ab==='fly'?0.15+Math.sin(t*2)*0.12:0; model.visible=true; const sc=0.85*vs; model.scale.setScalar(sc);
    model.position.set(P.x,(world.ground(P.x,P.z)-(ab==='fly'?0.15:0))+air*vs,P.z); model.rotation.y=P.face; model.userData.gallop(t,spS,ab==='fly'?1:0,bank);
    const body=model.userData.body, seat=model.userData.seat||1.12, by=body?body.position.y:0, bp=body?body.rotation.x:0, bz=body?body.rotation.z:0;
    lagY+=(by-lagY)*Math.min(1,dt*9);   // the rider's seat follows the back with a little give
    const run=Math.max(0,Math.min(1,(spS-0.28)/0.3)), wide=model.userData.kind==='dove'?0.62:model.userData.kind==='dragon'?0.6:0.55;
    K.ride={speed:spS,run,bob:(lagY-by)*0.6+run*0.035*(0.5+0.5*Math.sin(t*(11+4*spS))),bank:bz+bank*0.4,pitch:bp,wide};
    K.rotation.order='YXZ'; K.position.set(P.x,model.position.y+(seat+by)*sc,P.z); K.rotation.set(bp*0.7,P.face,bz*0.8); });
  // ── V184: the mount and the dismount, played out ──
  const ez=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
  // V221: a puff of dust where feet leave the ground and where they land
  const PUFF=new THREE.MeshLambertMaterial({color:0xd8c8a8,transparent:true,opacity:0.5,depthWrite:false});
  function puff(x,y,z,vs){ const sc=world.scene; if(!sc) return; const bits=[]; for(let i=0;i<9;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.09*vs,6,4),PUFF.clone()); const a=i/9*Math.PI*2; m.position.set(x+Math.cos(a)*0.15*vs,y+0.05,z+Math.sin(a)*0.15*vs); m.userData.v=[Math.cos(a)*0.9*vs,0.35*vs,Math.sin(a)*0.9*vs]; sc.add(m); bits.push(m); }
    let t0=performance.now(); const tick=()=>{ const u=(performance.now()-t0)/650; if(u>=1){ bits.forEach(m=>{ sc.remove(m); m.geometry.dispose(); m.material.dispose(); }); return; } bits.forEach(m=>{ const v=m.userData.v; m.position.x+=v[0]*0.016*(1-u); m.position.y+=v[1]*0.016*(1-u); m.position.z+=v[2]*0.016*(1-u); m.scale.setScalar(1+u*1.8); m.material.opacity=0.5*(1-u); }); requestAnimationFrame(tick); }; tick(); }
  function transit(t,dt){ tr.t+=dt; const vs=VIEWMODE.ps(world), full=0.85*vs, U=model.userData, seat=U.seat||1.12, g0=baseGround(tr.x,tr.z), ab=ability();
    const rx=Math.cos(tr.face), rz=-Math.sin(tr.face), SIDE=0.62*vs;   // his right hand; he mounts from the steed's left
    model.visible=true; K.rotation.order='YXZ'; P.face=tr.face;
    if(tr.k==='on'){ const a=ez(tr.t/0.5), v=Math.max(0,Math.min(1,(tr.t-0.64)/0.58)), e=ez(v), cr=ez((tr.t-0.4)/0.22)*(1-ez((tr.t-0.64)/0.08)), st=Math.max(0,Math.min(1,(tr.t-1.22)/0.28)), bo=st>0&&st<1?Math.sin(st*Math.PI)*0.05:0;   // V221: he crouches before the spring, and the saddle gives a little as he lands in it
      // the steed comes from where your companion stood to stand under where you'll sit, turning to face your way
      let df=tr.face-tr.ff; df=Math.atan2(Math.sin(df),Math.cos(df)); const sc=tr.fs+(full-tr.fs)*a;
      model.scale.setScalar(sc); model.position.set(tr.fx+(tr.x-tr.fx)*a,g0,tr.fz+(tr.z-tr.fz)*a); model.rotation.y=tr.ff+df*a; U.gallop(t,a<1?0.4:0,0,0);
      const dip=(v>0.72&&v<1?Math.sin((v-0.72)/0.28*Math.PI)*0.07*sc:0)+bo*sc; if(U.body) U.body.position.y-=dip;   // it takes his weight
      if(tr.t>=0.64&&!tr.sprung){ tr.sprung=1; puff(tr.x-rx*SIDE,g0,tr.z-rz*SIDE,vs); if(K.act) K.act('jump',0.55,{arms:true,u0:0.12,u1:0.5,w:0.75}); if(typeof SFX!=='undefined'&&SFX.play) try{ SFX.play('step'); }catch(_){} }
      if(v>=1&&!tr.sat){ tr.sat=1; puff(tr.x,g0,tr.z,vs*0.7); }
      // he steps aside to make room, then springs: up and over in an arc, leaning in, the far leg swinging across
      const off=SIDE*(a*(1-e)), sy=g0+(seat*sc-dip)*e+Math.sin(v*Math.PI)*0.42*vs;
      tr.pose=v>0.55?'ride':'idle'; K.ride={speed:0,run:0,bob:0,bank:0,pitch:0,wide:(U.kind==='dove'?0.62:U.kind==='dragon'?0.6:0.55)+0.5*(1-ez((v-0.55)/0.45))};
      K.position.set(tr.x-rx*off,v>0?sy:g0-cr*0.09*vs,tr.z-rz*off); K.rotation.set(-Math.sin(v*Math.PI)*0.25+cr*0.18,tr.face+(a-e)*0.5,-Math.sin(v*Math.PI)*0.45-cr*0.12);
      if(tr.t>=tr.dur){ tr=null; mounted=true; spS=0; lf=P.face; lagY=0; lx=P.x; lz=P.z; sync(); } }
    else { const d=tr.land>0?ez(tr.t/tr.land):1, v=Math.max(0,Math.min(1,(tr.t-tr.land)/0.5)), e=ez(v), w=ez((tr.t-tr.land-0.4)/0.35);
      // a flyer settles to the ground with its wings still beating; then the steed steps away to his right as he swings down
      const my=tr.y0+(g0-tr.y0)*d, sc=full+(((typeof PETS3D!=='undefined'&&PETS3D.at&&PETS3D.at())||{scale:full*0.68}).scale-full)*w, sx=tr.x+rx*SIDE*1.5*e-Math.sin(tr.face)*0.5*vs*w, sz=tr.z+rz*SIDE*1.5*e-Math.cos(tr.face)*0.5*vs*w;
      model.scale.setScalar(sc); model.position.set(sx,my,sz); model.rotation.y=tr.face; U.gallop(t,v>0&&v<1?0.3:0,d<1&&ab==='fly'?1:0,0);
      const rise=v<0.3?Math.sin(v/0.3*Math.PI)*0.06*full:0; if(U.body) U.body.position.y+=rise;
      tr.pose=v<0.4?'ride':'idle'; K.ride={speed:0,run:0,bob:0,bank:0,pitch:0,wide:0.55+0.5*ez(v/0.4)};
      const ky=my+seat*full*(1-e)+Math.sin(v*Math.PI)*0.22*vs; K.position.set(tr.x,Math.max(g0,ky),tr.z); K.rotation.set(Math.sin(v*Math.PI)*0.18,tr.face-Math.sin(v*Math.PI)*0.35,Math.sin(v*Math.PI)*0.4);
      if(v>=1&&!tr.thud){ tr.thud=1; puff(tr.x,g0,tr.z,vs); if(K.act) K.act('land',0.55,{arms:true,u0:0.12,u1:0.62,w:0.6}); if(typeof SFX!=='undefined'&&SFX.play) try{ SFX.play('step'); }catch(_){} }
      if(v>=1){ const kb=Math.max(0,Math.min(1,(tr.t-tr.land-0.5)/0.35)); K.position.y-=Math.sin(kb*Math.PI)*0.08*vs; }   // V221: he lands with bent knees and straightens
      if(tr.t>=tr.dur){ if(typeof PETS3D!=='undefined'&&PETS3D.setAt) PETS3D.setAt(sx,sz,tr.face); tr=null; K.rotation.set(0,P.face,0); model.visible=false; sync(); } } }
  let spS=0, lf=0, yawR=0, lagY=0;
  const kAnim=K.animate; K.animate=function(dt,mode,sp){ const on=(mounted||(tr&&tr.pose==='ride'))&&ENGINE.level===world; if(!on&&!tr&&K.rotation.x){ K.rotation.x=0; K.rotation.z=0; }
    return kAnim.call(K,dt,on&&(mode==='walk'||mode==='idle')?'ride':mode,sp); };
  const prevLeave=world.onLeave; world.onLeave=()=>{ mounted=false; tr=null; btn.hidden=true; if(model) model.visible=false; prevLeave&&prevLeave(); };
  // the pet follower steps aside while it carries you
  if(typeof PETS3D!=='undefined'){ const tick=PETS3D.tick; PETS3D.tick=function(dt,t,P0,lv){ if((mounted||tr)&&lv===world){ PETS3D.hide&&PETS3D.hide(true); return; } PETS3D.hide&&PETS3D.hide(false); return tick.apply(this,arguments); }; }
  function mount(v){ tr=null; mounted=!!v&&!!ability()&&ENGINE.level===world&&!busy(); sync(); }
  return { get mounted(){ return mounted; }, get moving(){ return !!tr; }, toggle, mount };
}
