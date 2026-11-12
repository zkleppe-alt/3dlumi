// ════════════════════════════════════════════════════════════════
//  DAY AND NIGHT — the 2D game's clock (state.js: a day every 72 real minutes, GAME.S.dayFrac) brought into the light:
//  the sun climbs from 6 AM, crosses the sky and sets in gold and rose by half past eight; full night by a quarter past
//  nine (the 2D DAY_TINT keyframes), when the moon rises, the stars come out and the light turns a cool, deep blue.
//  At night the windows of every town are lit, the lanterns burn with a warm pool of light around them, fireflies drift
//  over the grass, the knight carries a soft light of his own — and the demons out on the roads take their night forms
//  (combat.js), bigger, darker and bolder, as in the game.
//  DAYNIGHT.drive(lv,{sun,hemi,base}) each frame for an outdoor level; DAYNIGHT.lamp(obj) registers a lantern;
//  DAYNIGHT.state() → {f, sun, moon, night, dusk, dawn, day}.
// ════════════════════════════════════════════════════════════════
const DAYNIGHT=(function(){
  const C=h=>new THREE.Color(h);
  // the light across the day: [frac, sky, sun colour, sun strength, fill (hemi) sky, fill strength] — after the 2D DAY_TINT
  const KEYS=[
    [0.000, C(0x0e1638), C(0x8aa4e0), 0.30, C(0x3a4a7a), 0.42],   // midnight: the moon high, the world blue
    [0.230, C(0x111a3e), C(0x8aa4e0), 0.26, C(0x3a4a7a), 0.40],
    [0.255, C(0x4a4a72), C(0xffb07a), 0.30, C(0x7a7098), 0.45],   // first light, a little before six
    [0.272, C(0xf0b48a), C(0xffbe7a), 0.62, C(0xd8b8a8), 0.55],   // dawn gold, half past six
    [0.300, C(0x9cc4e4), C(0xfff0d8), 0.92, C(0xd8e8ff), 0.55],   // clear morning by seven
    [0.420, C(0x9cc4e4), C(0xfff4e4), 0.78, C(0xd8e8ff), 0.5],    // midday: the sun high, a touch softer (the ground faces it square)
    [0.680, C(0x9cc4e4), C(0xfff4e4), 0.78, C(0xd8e8ff), 0.5],
    [0.800, C(0x9cc4e4), C(0xfff0d8), 0.92, C(0xd8e8ff), 0.55],
    [0.830, C(0xe8b080), C(0xffb070), 0.75, C(0xe8c0a8), 0.52],   // eight: the sun lowers, gold
    [0.852, C(0xd87860), C(0xff8a5a), 0.48, C(0xb88aa0), 0.48],   // half past eight: the dusk at its height, rose
    [0.872, C(0x3a3460), C(0x9a8ac8), 0.30, C(0x4a4a7a), 0.42],
    [0.890, C(0x0e1638), C(0x8aa4e0), 0.30, C(0x3a4a7a), 0.42],   // full night by a quarter past nine
    [1.000, C(0x0e1638), C(0x8aa4e0), 0.30, C(0x3a4a7a), 0.42]];
  const out={f:0,sky:new THREE.Color(),sunC:new THREE.Color(),sunI:1,fillC:new THREE.Color(),fillI:0.55,sun:new THREE.Vector3(),moon:new THREE.Vector3(),light:new THREE.Vector3(),night:0,dusk:0,dawn:0,day:1};
  const ease=t=>t*t*(3-2*t);
  function state(f){ if(f===undefined) f=(typeof GAME!=='undefined'&&GAME.S&&typeof GAME.S.dayFrac==='number')?GAME.S.dayFrac:0.375; f=((f%1)+1)%1; out.f=f;
    let i=0; while(i<KEYS.length-2&&f>KEYS[i+1][0]) i++; const a=KEYS[i], b=KEYS[i+1], k=ease(Math.min(1,Math.max(0,(f-a[0])/((b[0]-a[0])||1))));
    out.sky.copy(a[1]).lerp(b[1],k); out.sunC.copy(a[2]).lerp(b[2],k); out.sunI=a[3]+(b[3]-a[3])*k; out.fillC.copy(a[4]).lerp(b[4],k); out.fillI=a[5]+(b[5]-a[5])*k;
    // the sun's arc: up at 6, high at noon-ish, down by half past eight (the day is long, as in the game); the moon the other way
    const s=(f-0.25)/(0.865-0.25), el=Math.sin(Math.PI*Math.min(1,Math.max(0,s)))*1.05-0.06, az=Math.PI*(0.15+0.7*Math.min(1.2,Math.max(-0.2,s)));
    out.sun.set(Math.cos(az)*Math.cos(el),Math.sin(el),-Math.sin(az)*Math.cos(el)*0.6+0.35).normalize();
    const m=((f+1-0.865)%1)/(1-0.865+0.25), mel=Math.sin(Math.PI*Math.min(1,Math.max(0,m)))*0.95-0.04, maz=Math.PI*(0.15+0.7*Math.min(1,Math.max(0,m)));
    out.moon.set(Math.cos(maz)*Math.cos(mel),Math.sin(mel),-Math.sin(maz)*Math.cos(mel)*0.6+0.3).normalize();
    out.night=(f>=0.885||f<0.24)?1:(f>0.855&&f<0.885)?ease((f-0.855)/0.03):(f>=0.24&&f<0.28)?1-ease((f-0.24)/0.04):0;
    out.dusk=Math.max(0,1-Math.abs(f-0.848)/0.03); out.dawn=Math.max(0,1-Math.abs(f-0.268)/0.022); out.day=1-out.night;
    out.light.copy(out.night>0.5?out.moon:out.sun); if(out.light.y<0.18){ out.light.y=0.18; out.light.normalize(); }   // the shadows come from whichever is up
    return out; }

  // ── the lamps: the shared glow materials of windows and lanterns (kit.js glow) go dark glass by day, warm light by night ──
  const LAMP_COLS=[0xf2d27a,0xffd27a,0xffd88a], lampDay=C(0x51606e), lampNight=new Map();
  function lampMats(){ const L=[]; if(typeof _BC==='undefined') return L; LAMP_COLS.forEach(h=>{ const m=_BC[h]; if(m){ if(!lampNight.has(m)) lampNight.set(m,C(h)); L.push(m); } }); return L; }
  // a halo for each lamp — a soft sprite, its own material shared by all, faded in with the night
  const haloTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,220,150,0.9)'); g.addColorStop(0.25,'rgba(255,190,110,0.45)'); g.addColorStop(1,'rgba(255,160,80,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
  const haloM=new THREE.SpriteMaterial({map:haloTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
  const LAMPS=[]; let pruneN=0;
  function lamp(o,size){ const s=new THREE.Sprite(haloM); s.scale.setScalar(size||1.6); s.renderOrder=5; o.add(s); LAMPS.push(o); return s; }
  // ── per level: lantern lights (a few real ones, at the lamps nearest the knight), the knight's own light, fireflies ──
  function rig(lv){ if(lv._dn) return lv._dn; const sc=lv.scene, R={pl:[],flies:null};
    for(let i=0;i<4;i++){ const p=new THREE.PointLight(0xffb868,0,7.5,1.6); sc.add(p); R.pl.push(p); }
    R.me=new THREE.PointLight(0xcfd8ff,0,9,1.4); sc.add(R.me);
    if(lv.ground){ const N=90, g=new THREE.BufferGeometry(), pos=new Float32Array(N*3); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const tex=haloTex, m=new THREE.PointsMaterial({size:0.22,map:tex,color:0xd8ff8a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
      const pts=new THREE.Points(g,m); pts.frustumCulled=false; sc.add(pts); R.flies={pts,m,seed:Array.from({length:N},(_,i)=>[Math.random()*30-15,Math.random()*30-15,Math.random()*6.28,0.4+Math.random()*0.8])}; }
    return lv._dn=R; }
  const V=new THREE.Vector3();
  function drive(lv,o){ const st=state(), sun=o.sun, hemi=o.hemi, sc=lv.scene, R=rig(lv), P=(typeof ENGINE!=='undefined'&&ENGINE.P)||{x:0,y:0,z:0}, t=performance.now()/1000;
    sc.background.copy(st.sky); if(sc.fog) sc.fog.color.copy(st.sky);
    const oot=typeof OOT_LOOK!=='undefined'&&OOT_LOOK; sun.color.copy(st.sunC); sun.intensity=st.sunI*(o.k||1)*(oot?0.86:1); hemi.color.copy(st.fillC); hemi.intensity=st.fillI*(oot?1.3:1)*(o.kf||1);
    if(o.ground) hemi.groundColor.copy(o.ground).lerp(C(0x1a2030),st.night*0.6);
    // the lamps
    const N=st.night, lit=Math.max(N,st.dusk*0.6);
    lampMats().forEach(m=>m.color.copy(lampDay).lerp(lampNight.get(m),Math.min(1,0.25+lit*0.95)));
    haloM.opacity=lit*0.85;
    if((++pruneN)%150===0) for(let i=LAMPS.length-1;i>=0;i--){ let q=LAMPS[i]; while(q.parent) q=q.parent; if(!q.isScene) LAMPS.splice(i,1); }   // lamps of chunks since let go
    // the few real lights go to the lamps nearest the knight (they are the ones you can see)
    if(lit>0.02&&LAMPS.length){ const near=[]; for(const L of LAMPS){ if(!L.parent) continue; L.getWorldPosition(V); const d=(V.x-P.x)*(V.x-P.x)+(V.z-P.z)*(V.z-P.z); if(d<900) near.push([d,V.x,V.y,V.z]); }
      near.sort((a,b)=>a[0]-b[0]); R.pl.forEach((p,i)=>{ const n=near[i]; if(n){ p.position.set(n[1],n[2],n[3]); p.intensity=lit*1.25*(0.92+0.08*Math.sin(t*9+i*2)); } else p.intensity=0; }); }
    else R.pl.forEach(p=>p.intensity=0);
    // the knight's own soft light, so the night is dark but never blind (brighter once he has the lamp)
    R.me.position.set(P.x,(P.y||0)+2.2,P.z); R.me.intensity=N*((GAME&&GAME.S&&GAME.S.hasLamp)?1.0:0.55);
    if(R.flies){ const f=R.flies, a=f.pts.geometry.attributes.position; f.m.opacity=N*0.95;
      if(N>0.02) f.seed.forEach((s,i)=>{ const x=P.x+s[0]+Math.sin(t*s[3]+s[2])*1.2, z=P.z+s[1]+Math.cos(t*s[3]*0.8+s[2])*1.2, y=(lv.ground?lv.ground(x,z):0)+0.35+0.35*Math.sin(t*1.3*s[3]+i);
        a.array[i*3]=x; a.array[i*3+1]=isFinite(y)?y:-50; a.array[i*3+2]=z; }), a.needsUpdate=true;
      f.m.size=0.16+0.08*Math.sin(t*3); }
    if(SKY_U){ SKY_U.uSun.value.copy(st.sun); SKY_U.uMoon.value.copy(st.moon); SKY_U.uNight.value=N; SKY_U.uDusk.value=Math.max(st.dusk,st.dawn); }
    return st; }
  let SKY_U=null; const bindSky=u=>{ SKY_U=u; };
  return {state,drive,lamp,bindSky,haloMaterial:haloM,get lamps(){ return LAMPS; }};
})();
