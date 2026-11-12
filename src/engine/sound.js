// ════════════════════════════════════════════════════════════════
//  SOUND (V145) — the 2D game's music and effects (audio2d.js), set to the 3D world:
//   · MUSIC by place — Luminar's theme out on the realm (the Homestead's own song on your land), the inn hearth, the chapel
//     song in a sanctuary, the dungeon recording on a chapel's floors (the boss chiptune when its guardian is up and near),
//     the forest recording in the woods, each portal world's own (Tabor breathes out once it's thawed), the Deep's
//     underwater song, the sail tune on the water, the finale at Abaddon's throne; the town tune in other rooms. Moving
//     between places the recordings fade across one another (a recording you leave keeps its place, and picks up where it
//     left off when you come back).
//   · EFFECTS on what happens — every swing, blow, guard, roll, the knight hurt, a demon's growl as it winds up, its fall,
//     the boss's roar; footsteps by the ground underfoot (earth, stone, planks, sand, snow, shallows); hooves; doors and
//     portals; coins and levelling up; potions; the fish biting; the menus and the turning of a dialogue page.
//   · AMBIENCE, made on the fly: wind (stronger high up, on the wing and in storms), rain and thunder, the sea on a shore,
//     birds by day, crickets at night, a crackling hearth in an inn or by a camp's embers.
//  The levels are the 2D game's own (☰ → Sound; saved in 'klk_audio', shared with the 2D game). SFX.play(name, ...args)
// ════════════════════════════════════════════════════════════════
const SFX=(function(){
  const AU=AUDIO2D, au=AU.audio, RT=AU.RTRACKS, X=AU.sfx;
  const lv=()=>ENGINE.level, id=()=>(lv()&&lv().id)||'', S=()=>GAME.S||{};
  /* V146: the parry — steel turned on steel, ringing high and clean */
  X.parry=()=>{ if(!au.sfxOn||!AU.A()) return; [2637,3951,5274].forEach((f,i)=>AU.tone(null,{type:i?'sine':'triangle',f0:f,f1:f*0.98,dur:0.45-i*0.12,gain:[0.26,0.12,0.06][i],attack:0.001})); AU.noise(null,{dur:0.06,fc:4200,q:0.8,gain:0.18,decay:2.5}); AU.tone(null,{type:'square',f0:180,f1:60,dur:0.1,gain:0.1,filter:'lowpass',fc:900}); };
  /* V165: a chest opening — the latch gives, the hinge creaks, the lid thumps back on its stop, and a bright chime of
     treasure (a fuller one, and a shimmer, for a great chest) */
  X.chestOpen=(great)=>{ if(!au.sfxOn||!AU.A()) return; const tn=o=>AU.tone(null,o), nz=o=>AU.noise(null,o);
    nz({dur:0.05,fc:2400,q:2.2,gain:0.26,decay:3}); tn({type:'triangle',f0:980,f1:520,dur:0.05,gain:0.1});
    tn({type:'sawtooth',f0:190,f1:310,dur:0.42,gain:0.05,filter:'bandpass',fc:820,fc1:1500,q:7,delay:0.1,attack:0.06});
    tn({type:'sawtooth',f0:300,f1:200,dur:0.26,gain:0.035,filter:'bandpass',fc:1300,fc1:900,q:8,delay:0.4,attack:0.04});
    nz({dur:0.14,fc:320,fc1:160,q:1.2,gain:0.22,decay:2.2,delay:0.66}); tn({type:'sine',f0:120,f1:60,dur:0.16,gain:0.14,delay:0.66});
    const notes=great?[784,1047,1319,1568,2093,2637]:[1047,1319,1568,2093];
    notes.forEach((f,i)=>{ tn({type:'triangle',f0:f,dur:0.75,gain:0.075,delay:0.42+i*0.075,attack:0.005}); tn({type:'sine',f0:f*2,dur:0.4,gain:0.025,delay:0.42+i*0.075}); });
    if(great) for(let i=0;i<8;i++) tn({type:'sine',f0:2600+((i*977)%1400),dur:0.18,gain:0.03,delay:0.9+i*0.06}); };
  /* V165: knocked down — a scuffle of feet, the clank of armour hitting the ground, a grunt */
  X.knock=()=>{ if(!au.sfxOn||!AU.A()) return; const tn=o=>AU.tone(null,o), nz=o=>AU.noise(null,o);
    nz({dur:0.12,fc:1800,fc1:700,q:0.8,gain:0.12,decay:2}); nz({dur:0.25,fc:900,fc1:260,q:0.7,gain:0.3,decay:2.4,delay:0.6}); tn({type:'sine',f0:140,f1:55,dur:0.22,gain:0.22,delay:0.6});
    [1900,2500,3300].forEach((f,i)=>tn({type:'triangle',f0:f,f1:f*0.97,dur:0.35,gain:0.05,delay:0.62+i*0.03})); tn({type:'sawtooth',f0:180,f1:120,dur:0.18,gain:0.04,filter:'lowpass',fc:700,delay:0.58}); };
  function play(n,...a){ try{ const f=X[n]; if(f) f(...a); }catch(e){} }
  // ── where am I: the music for this place ──
  function bossNear(){ const L=lv(), c=L&&L.combat; if(!c||!c.foes) return false; const P=ENGINE.P;
    return c.foes.some(d=>d.alive&&d.boss&&!d.asleep&&Math.hypot(d.x-P.x,d.z-P.z)<16); }
  const RIDE=()=>{ const L=lv(); return L&&L.riding; };
  function musicFor(){ if(window.TITLE_UP) return 'rt:home';   /* V179: the title carries the Homestead theme, as in the 2D game */
    const i=id(), s=S();
    if(i==='finale') return 'finale';
    if(/^deep:/.test(i)) return 'rt:uw';
    if(bossNear()) return 'boss';
    if(/^(forest|glade|monkcave|robbycave)$/.test(i)) return 'rt:forest';
    if(/^chapel\d+:/.test(i)||/^cata\d/.test(i)||/^mistral:chapel/.test(i)||/^sunfall:lamp/.test(i)) return 'rt:dungeon';
    if(/^sanct\d/.test(i)||/^sunfall:cath/.test(i)) return 'rt:chapel';
    if(/^in:/.test(i)){ if(/inn/.test(i)) return 'rt:inn'; if(/^in:home_/.test(i)) return 'rt:home'; return 'town'; }
    if(i==='surf'||i==='regatta') return 'sail';
    if(i==='pw:mistral') return 'rt:mistral';
    if(i==='pw:tabor') return s.tabor&&s.tabor.thawed?'rt:taborclean':'rt:tabor';
    if(i==='pw:sunfall'||/^sunfall:/.test(i)) return 'rt:sunfall';
    if(/^(keep|lists|petring|school:|marioHut|mistral:throne|sunfall:house)/.test(i)) return 'town';
    if(i==='world'){ if(s.boating) return 'sail'; const L=lv(), P=ENGINE.P; if(L.region&&L.region(Math.floor(P.x),Math.floor(P.z))==='homestead') return 'rt:home'; return 'rt:theme'; }
    return 'rt:theme'; }
  // ── playing it: the recordings fade across one another; the chiptunes start and stop on the beat ──
  let want=null, lastT=performance.now();
  function musicTick(dt){ want=musicFor(); const rk=want&&want.slice(0,3)==='rt:'?want.slice(3):null, ok=rk&&RT[rk]&&!RT[rk].dead&&au.musicOn;
    for(const k in RT){ const t=RT[k]; if(t.dead) continue; const on=ok&&k===rk; if(t.fk===undefined) t.fk=0;
      if(on){ if(!t.want) AU.rtStart(t); t.fk=Math.min(1,t.fk+dt/1.4); }
      else if(t.want){ t.fk=Math.max(0,t.fk-dt/1.1); if(t.fk<=0) AU.rtPause(t); }
      if(t.want){ AU.rtApplyVol(t); AU.rtTick(t); } }
    /* no recording (or the file's missing): the 2D game's chiptune for it (Luminar's theme falls back to the overworld tune) */
    let seq=ok?null:(rk?({theme:'overworld',home:'overworld',dungeon:'dungeon',forest:'forest',inn:'town',chapel:'town'}[rk]||null):want);
    if(!au.musicOn) seq=null;
    if(seq!==au.trackId){ if(seq) AU.musicPlay(seq); else AU.musicStop(); }
    AU.musicPump(); }
  AU.onUpdate=()=>{ for(const k in RT){ const t=RT[k]; if(t.want&&!au.musicOn) AU.rtPause(t); } };
  // ── a sound for the ground underfoot ──
  const tn=(o)=>AU.tone(null,o), nz=(o)=>AU.noise(null,o);
  let flip=0;
  function step(surf,soft){ if(!au.sfxOn||!AU.A()) return; flip^=1; const k=soft?0.55:1;
    if(surf==='stone') { nz({dur:0.08,fc:flip?1500:1300,fc1:520,q:1.0,gain:0.12*k,decay:2.4}); tn({type:'triangle',f0:flip?290:260,f1:140,dur:0.07,gain:0.04*k}); }
    else if(surf==='wood'){ nz({dur:0.09,fc:flip?700:600,fc1:240,q:1.4,gain:0.12*k,decay:2.2}); tn({type:'sine',f0:flip?150:130,f1:70,dur:0.1,gain:0.07*k}); }
    else if(surf==='sand'){ nz({dur:0.13,fc:2600,fc1:900,q:0.6,gain:0.07*k,decay:1.4}); }
    else if(surf==='snow'){ nz({dur:0.16,fc:flip?900:760,fc1:300,q:0.9,gain:0.1*k,decay:1.2}); nz({dur:0.06,fc:3200,q:2,gain:0.025*k,decay:2,delay:0.04}); }
    else if(surf==='water'){ nz({dur:0.22,fc:1800,fc1:600,q:0.7,gain:0.1*k,decay:1.3}); nz({dur:0.1,fc:3600,q:1.2,gain:0.04*k,decay:2,delay:0.05}); }
    else { nz({dur:0.075,fc:flip?380:300,fc1:150,q:0.8,gain:0.1*k,decay:2.6}); tn({type:'sine',f0:flip?95:80,f1:52,dur:0.07,gain:0.045*k}); nz({dur:0.06,fc:2400,q:1.5,gain:0.016*k,decay:2.5}); } }
  const WATER=new Set([3,20,21,29]), ROAD=new Set([2,12]);
  function surface(){ const i=id(), L=lv(), P=ENGINE.P;
    if(/^in:/.test(i)) return /keep|forge|guard/.test(i)?'stone':'wood';
    if(/^(chapel|cata|sanct|keep|deep|mistral:|sunfall:|finale|monkcave|robbycave|school)/.test(i)) return 'stone';
    if(!L||!L.T) return 'earth'; const tx=Math.floor(P.x), tz=Math.floor(P.z), t=L.T(tx,tz);
    if(WATER.has(t)) return 'water'; if(ROAD.has(t)) return 'stone';
    if(L.desert&&L.desert(tx,tz)) return 'sand'; if(i==='pw:tabor'&&!(S().tabor&&S().tabor.thawed)) return 'snow';
    if(L.weather&&L.weather.climate&&L.weather.climate(P.x,P.z)==='snow'&&L.trek&&L.trek.box){ const b=L.trek.box; if(P.x>=b[0]&&P.x<=b[2]&&P.z>=b[1]&&P.z<=b[3]) return 'snow'; }
    return 'earth'; }
  // ── the ambience: wind, rain, the sea, birds, crickets, a hearth — all made here, nothing to load ──
  let amb=null;
  function loopSrc(c,buf,type,fc,q){ const s=c.createBufferSource(); s.buffer=buf; s.loop=true; const f=c.createBiquadFilter(); f.type=type; f.frequency.value=fc; f.Q.value=q||0.7; const g=c.createGain(); g.gain.value=0; s.connect(f); f.connect(g); g.connect(amb.bus); s.start(); return {s,f,g}; }
  function buildAmb(){ const c=AU.A(); if(!c||amb) return amb; amb={bus:c.createGain()}; amb.bus.gain.value=1; amb.bus.connect(au.sfxBus);
    const n=c.sampleRate*4; const brown=c.createBuffer(1,n,c.sampleRate), white=c.createBuffer(1,n,c.sampleRate), fire=c.createBuffer(1,n,c.sampleRate);
    { const d=brown.getChannelData(0); let l=0; for(let i=0;i<n;i++){ l=(l+0.02*(Math.random()*2-1))/1.02; d[i]=l*3.2; } }
    { const d=white.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; }
    { const d=fire.getChannelData(0); let lp=0; for(let i=0;i<n;i++){ lp=lp*0.985+(Math.random()*2-1)*0.015; d[i]=lp*1.6; if(Math.random()<0.0009){ const L=40+Math.random()*260, a=0.25+Math.random()*0.5; for(let j=0;j<L&&i+j<n;j++) d[i+j]+=(Math.random()*2-1)*a*Math.exp(-j/(L*0.25)); } } }
    amb.wind=loopSrc(c,brown,'lowpass',520,0.6); amb.rain=loopSrc(c,white,'bandpass',3200,0.35); amb.sea=loopSrc(c,brown,'lowpass',900,0.5); amb.fire=loopSrc(c,fire,'lowpass',2600,0.7);
    amb.t={wind:0,rain:0,sea:0,fire:0}; amb.nextBird=2; amb.nextCrick=1; amb.nextThunder=12; amb.seaN=0; amb.scan=0; return amb; }
  function ease(node,v){ const c=au.ctx; node.g.gain.setTargetAtTime(v,c.currentTime,0.6); }
  function chirp(){ const b=2200+Math.random()*1800, n=2+(Math.random()*4|0); for(let i=0;i<n;i++) tn({type:'sine',f0:b*(1+Math.random()*0.1),f1:b*(1.25+Math.random()*0.35),dur:0.06+Math.random()*0.05,gain:0.018+Math.random()*0.012,delay:i*(0.09+Math.random()*0.05),attack:0.006}); }
  function crickets(){ for(let i=0;i<3;i++) tn({type:'sine',f0:4300,f1:4300,dur:0.03,gain:0.008,delay:i*0.05,attack:0.003}); }
  function thunder(){ nz({dur:2.6,fc:220,fc1:60,q:0.5,gain:0.34,decay:1.0,filter:'lowpass',delay:0.3+Math.random()*1.4}); nz({dur:0.5,fc:900,fc1:200,q:0.6,gain:0.12,decay:2,filter:'lowpass'}); }
  function ambTick(dt){ if(!au.sfxOn){ if(amb) for(const k of ['wind','rain','sea','fire']) ease(amb[k],0); return; } if(!buildAmb()) return;
    const i=id(), L=lv(), P=ENGINE.P, s=S(); const out=i==='world'||/^pw:/.test(i)||/^road:/.test(i)||i==='northreach'||i==='glade'||i==='forest'||i==='surf'||i==='regatta';
    const wx=L&&L.weather&&L.weather.now, kind=wx?wx.kind:null, amt=wx?(wx.amount||0):0, R=RIDE(), flying=R&&R.mounted&&P.y>(L.ground?L.ground(P.x,P.z):0)+1.5;
    const night=(typeof DAYNIGHT!=='undefined'&&DAYNIGHT.state)?(DAYNIGHT.state().night||0):0;
    /* the sea: how much water lies round you (looked at a few times a second) */
    amb.scan-=dt; if(amb.scan<=0){ amb.scan=0.4; let w=0; if(out&&L&&L.T){ const tx=Math.floor(P.x), tz=Math.floor(P.z); for(let dz=-7;dz<=7;dz+=2) for(let dx=-7;dx<=7;dx+=2) if(WATER.has(L.T(tx+dx,tz+dz))) w++; } amb.seaN=w/64; }
    const high=Math.max(0,Math.min(1,((P.y||0)-3)/10));
    ease(amb.wind,out?0.035+high*0.07+(flying?0.12:0)+((kind==='storm'||kind==='snow'||kind==='sand')?0.09*amt:0):(/^(chapel|sanct)/.test(i)?0.012:0));
    amb.wind.f.frequency.setTargetAtTime(380+high*500+(flying?600:0)+Math.sin(performance.now()/2700)*120,au.ctx.currentTime,0.8);
    ease(amb.rain,out&&(kind==='rain'||kind==='storm')?0.11*amt:0);
    const sw=0.6+0.4*Math.sin(performance.now()/1000*0.7)*Math.sin(performance.now()/1000*0.23+1);
    ease(amb.sea,out?Math.min(0.16,(s.boating?0.12:0)+amb.seaN*0.22)*sw:0);
    const camp=L&&L.sneak&&L.sneak.camps?L.sneak.camps.some(c=>Math.hypot(c.x-P.x,c.z-P.z)<7):false;
    ease(amb.fire,/^in:.*inn/.test(i)?0.07:camp?0.09:0);
    if(out&&!kind&&night<0.4&&!/^pw:sunfall/.test(i)){ amb.nextBird-=dt; if(amb.nextBird<=0){ amb.nextBird=2+Math.random()*6; chirp(); } }
    if(out&&night>0.6&&kind!=='rain'&&kind!=='storm'&&kind!=='snow'){ amb.nextCrick-=dt; if(amb.nextCrick<=0){ amb.nextCrick=0.5+Math.random()*0.9; crickets(); } }
    if(out&&kind==='storm'&&amt>0.5){ amb.nextThunder-=dt; if(amb.nextThunder<=0){ amb.nextThunder=9+Math.random()*16; thunder(); } } }
  // ── footsteps and hooves: a step each stride's worth of ground covered ──
  let px=null, pz=null, acc=0, lastLv=null;
  function feetTick(dt){ const P=ENGINE.P, L=lv(); if(!P||!L) return; if(L!==lastLv||px===null){ lastLv=L; px=P.x; pz=P.z; acc=0; return; }
    const d=Math.hypot(P.x-px,P.z-pz); px=P.x; pz=P.z; if(d>1.2||dt<=0) return; const v=d/dt, R=RIDE();
    if(ENGINE.airH>0.05||GAME.S.boating||/^deep:/.test(id())) { acc=0; return; }
    if(R&&R.mounted){ acc+=d; if(acc>1.25){ acc=0; play('hoof'); } return; }
    const stride=0.42+Math.min(0.5,v*0.08); acc+=d; if(acc>=stride){ acc=0; step(surface(),!!ENGINE.K.crouch); } }
  // ── the knight's world, watched for what it says out loud ──
  let gold=null, level=null;
  function watch(){ const s=S(); if(gold!==null&&s.gold>gold) play('coin'); if(level!==null&&s.level>level) play('levelUp'); gold=s.gold; level=s.level; }
  function hookUI(){
    const toast=UI.toast; UI.toast=function(m,...a){ try{ const t=String(m); if(/A bite!/.test(t)) play('bite'); else if(/You caught/.test(t)) play('catch'); else if(/got away|slipped (off|free)/i.test(t)) play('fishAway'); else if(/chest|strongbox/i.test(t)) play('revealChest'); }catch(e){} return toast.call(this,m,...a); };
    const sheet=UI.sheet; UI.sheet=function(...a){ play('menu',true); return sheet.apply(this,a); };
    const go=ENGINE.go; ENGINE.go=function(to,...a){ try{ const from=id(); if(to!==from&&!ENGINE.busy){ if(/^pw:/.test(to)||/^pw:/.test(from)&&to==='world') play('portal'); else play('door',true); } }catch(e){} return go.call(this,to,...a); };
    const say=document.getElementById('say'); if(say) say.addEventListener('click',()=>play('blip'),true);
    if(typeof GAME!=='undefined'&&GAME.save){ } }
  // ── the first touch or key opens the sound (a browser rule) ──
  const unlock=()=>{ AU.audioUnlock(); };
  ['pointerdown','keydown','touchstart'].forEach(k=>addEventListener(k,unlock,{capture:true,passive:true}));
  let hooked=false;
  function frame(){ const t=performance.now(), dt=Math.min(0.1,(t-lastT)/1000); lastT=t;
    try{ if(typeof ENGINE!=='undefined'&&ENGINE.level&&typeof GAME!=='undefined'&&GAME.S){ if(!hooked){ hooked=true; hookUI(); } musicTick(dt); if(au.ctx&&au.ctx.state==='running'){ ambTick(dt); feetTick(dt); watch(); } } }catch(e){ if(!frame._e){ frame._e=1; console.warn('sound',e); } }
    requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
  return { play, step, get music(){ return want; }, setMusic:AU.setMusicVol, setSfx:AU.setSfxVol, stepVol:AU.stepVol, volBar:AU.volBar, get musicVol(){ return au.musicVol; }, get sfxVol(){ return au.sfxVol; } };
})();
