// ════════════════════════════════════════════════════════════════
//  AUDIO2D (V145) — the 2D game's own sound, brought over whole: its mixer (music and effects buses, a limiter, the
//  levels saved in localStorage 'klk_audio' — shared with the 2D game), its recorded themes (two decks each, crossfaded
//  at the loop so the seam never shows), its chiptune sequencer for the places that have no recording, and every one of its
//  synthesised effects. Taken from the 2D index.html as it stands; only the file paths (music/) and the exports are new.
//  sound.js decides what plays where in the 3D world.
// ════════════════════════════════════════════════════════════════
const AUDIO2D=(function(){
  let musicUpdate=null;
const VOL_STEPS=[0,0.25,0.5,0.75,1];
let _audioPrefs={sfx:true,music:true,sfxVol:1,musicVol:1};
try{ const p=JSON.parse(localStorage.getItem('klk_audio')||'{}');
  if(typeof p.sfx==='boolean')_audioPrefs.sfx=p.sfx;
  if(typeof p.music==='boolean')_audioPrefs.music=p.music;
  if(typeof p.sfxVol==='number')_audioPrefs.sfxVol=Math.min(1,Math.max(0,p.sfxVol));
  if(typeof p.musicVol==='number')_audioPrefs.musicVol=Math.min(1,Math.max(0,p.musicVol));
  // an older save carried only the booleans: a muted flag means level 0
  if(typeof p.sfxVol!=='number' && p.sfx===false)_audioPrefs.sfxVol=0;
  if(typeof p.musicVol!=='number' && p.music===false)_audioPrefs.musicVol=0;
}catch(e){}
_audioPrefs.sfx   = _audioPrefs.sfxVol>0;
_audioPrefs.music = _audioPrefs.musicVol>0;
const audio = {
  ctx:null, master:null, musicBus:null, sfxBus:null,
  sfxOn:_audioPrefs.sfx, musicOn:_audioPrefs.music,
  sfxVol:_audioPrefs.sfxVol, musicVol:_audioPrefs.musicVol,
  MUSIC_BUS_BASE:0.85, SFX_BUS_BASE:1.45,   // the mix at 100% — levels scale these
  track:null, trackId:null, step:0, nextTime:0, stepDur:0.15,
  lastStep:0, voices:0,
};
// ── LUMINAR'S THEME ───────────────────────────────────────────────
// The open world's song is a real recording (theme-luminar.mp3, sitting beside
// index.html) rather than a chiptune pattern. It streams progressively and loops.
// If the file is absent — index.html uploaded on its own, or opened locally —
// we fall back to the chiptune 'overworld' track so the world is never silent.
const THEME = { src:'music/theme-luminar.mp3', el:null, dead:false, want:false, vol:0.50 };
// _legacy themeEl/themeStart/themePause built ONE looping element per track and
// let the browser wrap it. They now delegate to the two-deck crossfade system
// below so nothing can create a second, conflicting element for THEME.
function themeEl(){ return rtEl(THEME); }
function themeStart(){ return rtStart(THEME); }
function themePause(){ rtPause(THEME); }
// ── RECORDED WORLD THEMES ── each world can carry its own recording sitting
//    beside index.html. A missing file marks that track dead and the world falls
//    back to what it had before: Luminar -> chiptune, portal worlds -> silence.
const RTRACKS = {
  theme:   THEME,                                                                    // Luminar's open world
  mistral: { src:'music/theme-mistral.mp3',       el:null, dead:false, want:false, vol:0.50 },
  tabor:   { src:'music/theme-tabor.mp3',         el:null, dead:false, want:false, vol:0.50 },
  sunfall: { src:'music/last-knight-sunfall.mp3', el:null, dead:false, want:false, vol:0.50 },
  //  the morning music. Export the unused 47-second section of the overworld theme
  //  as theme-dawn.mp3 and it plays from the moment the sun is released through the
  //  walk home; if the file is absent, Sunfall's own theme simply keeps going.
  //  ── v66 recordings ──
  //  forest:     the wooded dungeons, the Forest of Disillusionment, the glade
  //  inn:        every inn hearth (INTERIORS[...].theme==='inn')
  //  home:       the Homestead, the title screen, and the closing credits
  //  taborclean: Tabor once it is thawed — the uncleansed loop is deliberately
  //              short and anxious; this one breathes.
  forest:     { src:'music/theme-forest.mp3',         el:null, dead:false, want:false, vol:0.50 },
  inn:        { src:'music/theme-inn.mp3',            el:null, dead:false, want:false, vol:0.46 },
  home:       { src:'music/theme-homestead.mp3',      el:null, dead:false, want:false, vol:0.50 },
  taborclean: { src:'music/theme-tabor-cleansed.mp3', el:null, dead:false, want:false, vol:0.50 },
  uw:         { src:'music/underwater.mp3',          el:null, dead:false, want:false, vol:0.48 },
  //  ── v81 recordings ──
  //  dungeon: every chapel dungeon floor EXCEPT the forest-flagged ones (those already
  //           carry `forest`) and except an active boss fight (still the 'boss' chiptune).
  //  chapel:  a cleansed town's sanctuary AND the un-cleansed chapel interior alike —
  //           both carry INTERIORS[id].theme==='sanctuary'.
  dungeon:    { src:'music/last-knight---dungeon-theme.mp3', el:null, dead:false, want:false, vol:0.50 },
  chapel:     { src:'music/last-knight-chapel-theme.mp3',    el:null, dead:false, want:false, vol:0.50 },
};
// ── CROSSFADE LOOPING ──────────────────────────────────────────────────
// A track's tail rarely sits at the same level as its head, so a plain
// loop=true wrap is audible — and MP3 adds a small frame-boundary gap on top.
// Each recording therefore runs TWO decks: as the lead nears its end the other
// starts from zero and the pair equal-power crossfade over XFADE seconds. The
// seam becomes a musical overlap instead of a cut.
const XFADE = 1.6;                     // seconds of overlap at the wrap
function rtDecks(t){
  if(t.dead) return null;
  if(!t.decks){
    try{
      const d=[null,null];
      for(let i=0;i<2;i++){
        const a=new Audio();
        a.loop=false;                  // WE own the wrap now, not the browser
        a.preload='auto';
        a.addEventListener('error', ()=>{ t.dead=true; t.decks=null; });
        a.src=t.src;
        d[i]=a;
      }
      t.decks=d; t.cur=0; t.xfading=false; t.gain=[1,0];
    }catch(e){ t.dead=true; t.decks=null; return null; }
    rtApplyVol(t);
  }
  return t.decks;
}
// the one place a deck's .volume is ever written: track vol x device level x
// this deck's crossfade gain
function rtApplyVol(t){
  if(!t.decks || !t.gain) return;
  const full=t.vol*audio.musicVol*(t.fk===undefined?1:t.fk);
  for(let i=0;i<2;i++){ const a=t.decks[i];
    if(a) a.volume=Math.min(1,Math.max(0, full*t.gain[i])); }
}
function rtEl(t){ const d=rtDecks(t); return d ? d[t.cur] : null; }   // the lead deck
function rtStart(t){
  if(t.dead || !audio.musicOn) return false;
  const d=rtDecks(t); if(!d) return false;
  t.want=true;
  rtApplyVol(t);
  const lead=d[t.cur];
  // iOS refuses playback without a gesture; the rejection is harmless and the
  // next input path calls audioUnlock(), which retries.
  if(lead.paused){ try{ const p=lead.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} }
  return true;
}
function rtPause(t){
  t.want=false; t.xfading=false;
  if(!t.decks) return;
  for(let i=0;i<2;i++){ const a=t.decks[i]; if(a&&!a.paused){ try{ a.pause(); }catch(e){} } }
  t.gain=[t.cur===0?1:0, t.cur===1?1:0];   // leave it ready to resume cleanly
  rtApplyVol(t);
}
function rtPauseAll(){ for(const k in RTRACKS) rtPause(RTRACKS[k]); }
// one frame of crossfade bookkeeping for a playing track
function rtTick(t){
  if(t.dead || !t.want || !t.decks || !t.gain) return;
  const lead=t.decks[t.cur], other=t.decks[1-t.cur];
  if(!lead) return;
  const dur=lead.duration;
  if(!isFinite(dur) || dur<=0) return;            // metadata not in yet
  const remain=dur-lead.currentTime;
  // the tab slept through the whole overlap: wrap hard rather than fall silent
  if(lead.ended && !t.xfading){
    try{ lead.currentTime=0; const p=lead.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
    return;
  }
  if(!t.xfading && remain<=XFADE && remain>0){
    t.xfading=true;
    try{ other.currentTime=0; }catch(e){}
    t.gain[1-t.cur]=0; rtApplyVol(t);
    try{ const p=other.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
  }
  if(t.xfading){
    let p=1-Math.max(0,remain)/XFADE; p=Math.min(1,Math.max(0,p));
    t.gain[t.cur]=Math.cos(p*Math.PI/2);          // equal power: no dip mid-fade
    t.gain[1-t.cur]=Math.sin(p*Math.PI/2);
    rtApplyVol(t);
    if(remain<=0.02 || lead.ended){               // the handover is done
      try{ lead.pause(); lead.currentTime=0; }catch(e){}
      t.cur=1-t.cur; t.xfading=false;
      t.gain=[t.cur===0?1:0, t.cur===1?1:0];
      rtApplyVol(t);
    }
  }
}
function rtTickAll(){ for(const k in RTRACKS){ const t=RTRACKS[k]; if(t.want) rtTick(t); } }
// ── THE MIXER ──────────────────────────────────────────────────────────
// One entry point per bus. Applies the level to the Web Audio gain AND to
// every live <audio> recording, keeps the legacy on/off booleans in sync,
// and writes the choice to localStorage.
function audioSavePrefs(){
  try{ localStorage.setItem('klk_audio', JSON.stringify({
    sfx:audio.sfxOn, music:audio.musicOn, sfxVol:audio.sfxVol, musicVol:audio.musicVol })); }catch(e){}
}
function setMusicVol(v){
  audio.musicVol=Math.min(1,Math.max(0,v));
  audio.musicOn=audio.musicVol>0;
  if(audio.musicBus) audio.musicBus.gain.value=audio.MUSIC_BUS_BASE*audio.musicVol;
  for(const k in RTRACKS) rtApplyVol(RTRACKS[k]);
  if(!audio.musicOn){ musicStop(); rtPauseAll(); }
  else if(typeof musicUpdate==='function') musicUpdate();   // silence -> sound again, straight away
  audioSavePrefs();
}
function setSfxVol(v){
  audio.sfxVol=Math.min(1,Math.max(0,v));
  audio.sfxOn=audio.sfxVol>0;
  if(audio.sfxBus) audio.sfxBus.gain.value=audio.SFX_BUS_BASE*audio.sfxVol;
  audioSavePrefs();
}
// step to the next level, wrapping past 100% back to off
function stepVol(which){
  const cur = which==='music' ? audio.musicVol : audio.sfxVol;
  let i = VOL_STEPS.findIndex(s=>Math.abs(s-cur)<0.001);
  i = (i<0 ? VOL_STEPS.length-1 : i+1) % VOL_STEPS.length;
  (which==='music' ? setMusicVol : setSfxVol)(VOL_STEPS[i]);
  return VOL_STEPS[i];
}
// a five-cell bar for the menu readout
function volBar(v){
  const n=Math.round(v*4);
  let s='';
  for(let i=0;i<4;i++) s += i<n ? '█' : '░';
  return s;
}
function A(){   // lazily build the graph; returns a running context or null
  if(audio.ctx){ if(audio.ctx.state==='suspended') audio.ctx.resume(); return audio.ctx.state==='running'?audio.ctx:null; }
  try{
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    const c=new C();
    // a limiter on the master: lets the mix run hot without overlapping sounds clipping
    const comp=c.createDynamicsCompressor();
    comp.threshold.value=-3; comp.knee.value=8; comp.ratio.value=6;
    comp.attack.value=0.003; comp.release.value=0.14;
    comp.connect(c.destination);
    audio.master=c.createGain(); audio.master.gain.value=0.9; audio.master.connect(comp);
    audio.musicBus=c.createGain(); audio.musicBus.gain.value=audio.MUSIC_BUS_BASE*audio.musicVol; audio.musicBus.connect(audio.master);
    audio.sfxBus=c.createGain();   audio.sfxBus.gain.value=audio.SFX_BUS_BASE*audio.sfxVol;       audio.sfxBus.connect(audio.master);
    audio.ctx=c; if(c.state==='suspended') c.resume();
    return c.state==='running'?c:null;
  }catch(e){ audio.ctx=null; return null; }
}
function audioUnlock(){ A(); for(const k in RTRACKS){ if(RTRACKS[k].want) rtStart(RTRACKS[k]); } }   // called from every input path (iOS needs a gesture)

// ── tiny synth helpers ────────────────────────────────────────────
function hz(n){ return 440*Math.pow(2,(n-69)/12); }               // midi → frequency
function noiseBuf(c, secs, decay){
  const len=Math.max(1,Math.floor(c.sampleRate*secs)), b=c.createBuffer(1,len,c.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++){ const e=decay?Math.pow(1-i/len,decay):1; d[i]=(Math.random()*2-1)*e; }
  return b;
}
// one shaped oscillator note
function tone(bus, o){
  const c=A(); if(!c) return;
  const t0=c.currentTime+(o.delay||0);
  const osc=c.createOscillator(); osc.type=o.type||'square';
  osc.frequency.setValueAtTime(o.f0, t0);
  if(o.f1 && o.f1!==o.f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.f1), t0+o.dur);
  const g=c.createGain();
  const peak=o.gain||0.2, atk=o.attack||0.004;
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(peak, t0+atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+o.dur);
  let node=osc;
  if(o.filter){ const f=c.createBiquadFilter(); f.type=o.filter; f.frequency.setValueAtTime(o.fc||1200,t0);
    if(o.fc1) f.frequency.exponentialRampToValueAtTime(Math.max(1,o.fc1), t0+o.dur);
    if(o.q!==undefined) f.Q.value=o.q; node.connect(f); node=f; }
  node.connect(g); g.connect(bus||audio.sfxBus);
  osc.start(t0); osc.stop(t0+o.dur+0.02);
}
// one shaped noise burst
function noise(bus, o){
  const c=A(); if(!c) return;
  const t0=c.currentTime+(o.delay||0);
  const src=c.createBufferSource(); src.buffer=noiseBuf(c, o.dur, o.decay===undefined?1.6:o.decay);
  let node=src;
  if(o.filter!==null){ const f=c.createBiquadFilter(); f.type=o.filter||'bandpass';
    f.frequency.setValueAtTime(o.fc||900,t0);
    if(o.fc1) f.frequency.exponentialRampToValueAtTime(Math.max(1,o.fc1), t0+o.dur);
    f.Q.value=o.q===undefined?1.0:o.q; src.connect(f); node=f; }
  const g=c.createGain(); g.gain.setValueAtTime(o.gain||0.2,t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+o.dur);
  node.connect(g); g.connect(bus||audio.sfxBus);
  src.start(t0);
}
const sfxAllowed=()=>audio.sfxOn && A();

// ── COMBAT ────────────────────────────────────────────────────────
function sfxSwing(type){ if(!sfxAllowed()) return;      // the blade cuts only AIR — a swish
  const heavy=type==='heavy';
  noise(null,{ dur:heavy?0.24:0.16, fc:heavy?900:1600, fc1:heavy?2200:3400, q:0.8, gain:heavy?0.3:0.22, decay:1.1 });
  noise(null,{ dur:heavy?0.18:0.12, fc:heavy?400:700, fc1:heavy?900:1400, q:0.9, gain:heavy?0.14:0.1, decay:1.4, delay:0.01 });
}
function sfxHit(crit){ if(!sfxAllowed()) return;        // steel MEETS something — the ting
  // the metal rings on contact: inharmonic bell partials (crits ring higher & longer)
  const f=crit?1864:1568;
  tone(null,{ type:'triangle', f0:f,      f1:f,      dur:crit?0.26:0.16, gain:crit?0.3:0.24, attack:0.001 });
  tone(null,{ type:'sine',     f0:f*1.83, f1:f*1.83, dur:crit?0.18:0.11, gain:crit?0.17:0.13, attack:0.001 });
  tone(null,{ type:'sine',     f0:f*2.71, f1:f*2.71, dur:0.08,           gain:0.06, attack:0.001 });
  // …with a small thud of the blow landing beneath it
  noise(null,{ dur:0.08, fc:1200, fc1:300, q:0.7, gain:crit?0.2:0.14, decay:2.4 });
  tone(null,{ type:'square', f0:crit?220:170, f1:crit?70:60, dur:0.09, gain:0.1, filter:'lowpass', fc:900 });
}
function sfxBlock(){ if(!sfxAllowed()) return;          // a bright shield clang
  tone(null,{ type:'square', f0:1500, f1:900, dur:0.16, gain:0.26, filter:'bandpass', fc:2200, q:3 });
  tone(null,{ type:'triangle', f0:2400, f1:1500, dur:0.22, gain:0.18, delay:0.008 });
  noise(null,{ dur:0.09, fc:3400, fc1:1400, q:2.4, gain:0.26, decay:2 });
}
function sfxDodge(){ if(!sfxAllowed()) return;          // a quick cloth-and-air swish
  noise(null,{ dur:0.2, fc:700, fc1:2600, q:0.6, gain:0.4675, decay:0.7 });
}
function sfxHurt(){ if(!sfxAllowed()) return;           // the knight takes one
  tone(null,{ type:'sawtooth', f0:340, f1:110, dur:0.22, gain:0.208, filter:'lowpass', fc:1400, fc1:400 });
  noise(null,{ dur:0.12, fc:600, q:0.8, gain:0.13, decay:2 });
}
// ── DEMONS ────────────────────────────────────────────────────────
function sfxDemonGrowl(level,kind){ if(!sfxAllowed()) return;
  if(kind==='pounce'){   // V176: the Hound — a snarl, then a yip as it springs
    noise(null,{ dur:0.32, fc:900, fc1:420, q:3.5, gain:0.06, decay:1.2 }); tone(null,{ type:'sawtooth', f0:210, f1:170, dur:0.3, gain:0.05, filter:'bandpass', fc:600, q:5 });
    tone(null,{ type:'triangle', f0:620, f1:1180, dur:0.12, gain:0.06, delay:0.3 }); return; }
  if(kind==='claw'){   // the Raker — a long dry hiss, with a click of the jaw in it
    noise(null,{ dur:0.55, fc:4200, fc1:2600, q:0.9, gain:0.07, decay:0.8 }); noise(null,{ dur:0.04, fc:2400, q:4, gain:0.12, decay:4, delay:0.12 }); noise(null,{ dur:0.04, fc:2200, q:4, gain:0.1, decay:4, delay:0.28 }); return; }
  if(kind==='brute'){   // the Ogre — a grunt from the gut, heaving
    tone(null,{ type:'sawtooth', f0:70, f1:46, dur:0.6, gain:0.11, filter:'lowpass', fc:300, fc1:160, q:3 }); tone(null,{ type:'square', f0:38, f1:30, dur:0.62, gain:0.07, filter:'lowpass', fc:180 });
    noise(null,{ dur:0.5, fc:220, fc1:90, q:1.4, gain:0.06, decay:1.0 }); return; }
  if(kind==='spit'){   // the Gorger — a wet gurgle swelling in the throat
    for(let i=0;i<5;i++) tone(null,{ type:'sine', f0:180+i*30, f1:120+i*60, dur:0.09, gain:0.06, delay:i*0.07, filter:'lowpass', fc:900 });
    noise(null,{ dur:0.45, fc:700, fc1:1500, q:6, gain:0.05, decay:0.9 }); return; }
  const deep=Math.min(1,(level||3)/22);                 // bigger demons growl lower
  const base=150-deep*55;
  tone(null,{ type:'sawtooth', f0:base*1.5, f1:base*0.7, dur:0.42, gain:0.085, filter:'lowpass', fc:700, fc1:220, q:4 });
  tone(null,{ type:'square', f0:base*0.52, f1:base*0.4, dur:0.46, gain:0.0595, filter:'lowpass', fc:400 });
  noise(null,{ dur:0.4, fc:320, fc1:130, q:2.2, gain:0.0425, decay:1.1 });
}
function sfxDemonDie(){ if(!sfxAllowed()) return;       // a shriek collapsing inward
  tone(null,{ type:'sawtooth', f0:900, f1:70, dur:0.5, gain:0.208, filter:'lowpass', fc:2600, fc1:300 });
  noise(null,{ dur:0.42, fc:1800, fc1:180, q:1.1, gain:0.192, decay:1.5, delay:0.03 });
}
function sfxBossRoar(){ if(!sfxAllowed()) return;       // the guardian wakes
  tone(null,{ type:'sawtooth', f0:110, f1:52, dur:1.1, gain:0.25, filter:'lowpass', fc:900, fc1:180, q:6 });
  tone(null,{ type:'square', f0:74, f1:38, dur:1.2, gain:0.175, filter:'lowpass', fc:420 });
  noise(null,{ dur:1.0, fc:420, fc1:110, q:1.6, gain:0.1375, decay:0.9 });
  tone(null,{ type:'sawtooth', f0:220, f1:104, dur:0.9, gain:0.0875, filter:'lowpass', fc:1200, fc1:300, delay:0.05 });
}
function sfxBossTelegraph(){ if(!sfxAllowed()) return;  // it plants itself — a rising warning
  tone(null,{ type:'square', f0:180, f1:640, dur:0.4, gain:0.2, filter:'bandpass', fc:700, q:1.4 });
  tone(null,{ type:'triangle', f0:90, f1:320, dur:0.42, gain:0.1 });
}
function sfxBossStrike(){ if(!sfxAllowed()) return;     // and unleashes
  noise(null,{ dur:0.34, fc:2200, fc1:220, q:0.8, gain:0.312, decay:1.5 });
  tone(null,{ type:'sawtooth', f0:190, f1:48, dur:0.34, gain:0.228, filter:'lowpass', fc:1000, fc1:200 });
}
// ── MOVEMENT ──────────────────────────────────────────────────────
let _stepFlip=0;
function sfxStep(){ if(!sfxAllowed()) return;           // a soft boot on earth
  _stepFlip^=1;
  noise(null,{ dur:0.075, fc:_stepFlip?380:300, fc1:150, q:0.8, gain:0.112, decay:2.6 });
  tone(null,{ type:'sine', f0:_stepFlip?95:80, f1:52, dur:0.07, gain:0.053 });
}
function sfxStairStep(){ if(!sfxAllowed()) return;      // boot on cut stone — brighter, harder
  noise(null,{ dur:0.09, fc:1500, fc1:520, q:1.0, gain:0.168, decay:2.4 });
  tone(null,{ type:'triangle', f0:300, f1:150, dur:0.08, gain:0.059 });
}
function sfxHoof(){ if(!sfxAllowed()) return;           // a hoof-fall at the gallop
  _stepFlip^=1;
  noise(null,{ dur:0.09, fc:_stepFlip?520:430, fc1:170, q:1.2, gain:0.206, decay:3 });
  tone(null,{ type:'sine', f0:_stepFlip?150:120, f1:62, dur:0.09, gain:0.098 });
}
function sfxWagon(){ if(!sfxAllowed()) return;          // axle creak + a wheel over ruts
  tone(null,{ type:'sawtooth', f0:210+Math.random()*70, f1:150, dur:0.3, gain:0.150, filter:'bandpass', fc:420, q:1.6 });
  noise(null,{ dur:0.16, fc:240, fc1:120, q:0.7, gain:0.102, decay:1.6 });
}
function sfxMount(){ if(!sfxAllowed()) return;          // a whinny as you swing up
  tone(null,{ type:'sawtooth', f0:520, f1:880, dur:0.14, gain:0.336, filter:'bandpass', fc:1200, q:1.4 });
  tone(null,{ type:'sawtooth', f0:880, f1:420, dur:0.36, gain:0.352, filter:'bandpass', fc:1000, q:1.3, delay:0.13 });
  noise(null,{ dur:0.3, fc:1100, fc1:500, q:0.9, gain:0.128, decay:1.2, delay:0.13 });
}
// ── WORLD ─────────────────────────────────────────────────────────
function sfxDoor(open){ if(!sfxAllowed()) return;       // hinges, then the latch
  if(open){
    tone(null,{ type:'sawtooth', f0:150, f1:260, dur:0.34, gain:0.375, filter:'bandpass', fc:420, q:1.5 });
    noise(null,{ dur:0.3, fc:500, fc1:900, q:0.9, gain:0.135, decay:1 });
    noise(null,{ dur:0.1, fc:220, fc1:90, q:0.6, gain:0.45, decay:2.4, delay:0.3 });
  } else {
    tone(null,{ type:'sawtooth', f0:260, f1:140, dur:0.26, gain:0.36, filter:'bandpass', fc:400, q:1.5 });
    noise(null,{ dur:0.12, fc:200, fc1:80, q:0.6, gain:0.465, decay:2.4, delay:0.24 });
  }
}
function sfxBleat(){ if(!sfxAllowed()) return;          // a soft pastoral sheep bleat
  tone(null,{ type:'sawtooth', f0:420, f1:360, dur:0.16, gain:0.05, filter:'bandpass', fc:900, q:3 });
  tone(null,{ type:'sawtooth', f0:360, f1:300, dur:0.22, gain:0.045, delay:0.14, filter:'bandpass', fc:800, q:3 });
}
function sfxPortal(){ if(!sfxAllowed()) return;         // a rising otherworldly shimmer + airy whoosh
  [0,0.08,0.16,0.24].forEach((d,i)=>tone(null,{ type:'sine', f0:320+i*140, f1:900+i*220, dur:0.5, gain:0.12, delay:d, filter:'bandpass', fc:1200, fc1:2600, q:2 }));
  tone(null,{ type:'triangle', f0:180, f1:70, dur:0.7, gain:0.14, delay:0.1, filter:'lowpass', fc:900 });
  noise(null,{ dur:0.7, fc:600, fc1:3200, q:0.7, gain:0.1, decay:0.7 });
  noise(null,{ dur:0.4, fc:2400, fc1:400, q:1.2, gain:0.07, decay:1.2, delay:0.3 });
}
function sfxClick(){ if(!sfxAllowed()) return;          // the gentle tick of text advancing
  tone(null,{ type:'square', f0:1250, f1:1250, dur:0.03, gain:0.0704, attack:0.001, filter:'bandpass', fc:1400, q:0.8 });
}
function sfxMenu(up){ if(!sfxAllowed()) return;
  tone(null,{ type:'square', f0:up?680:480, dur:0.05, gain:0.09, filter:'lowpass', fc:2400 });
}
function sfxPotion(){ if(!sfxAllowed()) return;         // cork, glug, and warmth returning
  noise(null,{ dur:0.05, fc:2000, q:3, gain:0.297, decay:3 });
  for(let i=0;i<3;i++) tone(null,{ type:'sine', f0:300+i*40, f1:200+i*30, dur:0.09, gain:0.231, delay:0.06+i*0.07, filter:'lowpass', fc:1200 });
  [72,76,79].forEach((n,i)=>tone(null,{ type:'triangle', f0:hz(n), dur:0.22, gain:0.198, delay:0.26+i*0.05 }));
}
function sfxCoin(){ if(!sfxAllowed()) return;
  tone(null,{ type:'square', f0:hz(88), dur:0.07, gain:0.168 });
  tone(null,{ type:'square', f0:hz(93), dur:0.16, gain:0.168, delay:0.06 });
}
function sfxLevelUp(){ if(!sfxAllowed()) return;        // the knight grows
  [72,76,79,84].forEach((n,i)=>{
    tone(null,{ type:'square', f0:hz(n), dur:0.16, gain:0.225, delay:i*0.08 });
    tone(null,{ type:'triangle', f0:hz(n-12), dur:0.2, gain:0.15, delay:i*0.08 });
  });
  tone(null,{ type:'square', f0:hz(88), dur:0.5, gain:0.225, delay:0.34 });
}
// ── THE FLOOR FALLS QUIET ── the chest appears on the plaza.
// _legacy: this moment borrowed sfxLevelUp(). It read as a reward, but it read
//   as the WRONG reward — the same fanfare as gaining a level, in a game where
//   you gain levels constantly. This is its own sound: a rising perfect fifth
//   answered an octave up, over a held low drone, so it lands as ANNOUNCEMENT
//   rather than congratulation. Deliberately slower than sfxLevelUp (0.11s
//   between notes vs 0.08) and on triangle rather than square, so the two are
//   not mistaken for one another even through a phone speaker.
function sfxRevealChest(){ if(!sfxAllowed()) return;
  [67,74,79].forEach((n,i)=>{                                  // G, D, G — a fifth, then the octave
    tone(null,{ type:'triangle', f0:hz(n),    dur:0.22, gain:0.20, delay:i*0.11 });
    tone(null,{ type:'sine',     f0:hz(n+12), dur:0.18, gain:0.08, delay:i*0.11 });
  });
  tone(null,{ type:'triangle', f0:hz(86), dur:0.62, gain:0.20, delay:0.34 });   // the answer, up high
  tone(null,{ type:'sine',     f0:hz(43), dur:0.85, gain:0.13, delay:0.00 });   // the drone beneath
}
// ── FISHING ───────────────────────────────────────────────────────
function sfxCast(){ if(!sfxAllowed()) return;           // the line whips out and plops
  noise(null,{ dur:0.22, fc:1200, fc1:3000, q:1.6, gain:0.144, decay:0.8 });
  tone(null,{ type:'sine', f0:700, f1:220, dur:0.1, gain:0.176, delay:0.22, filter:'lowpass', fc:1600 });
  noise(null,{ dur:0.16, fc:900, fc1:300, q:1.2, gain:0.112, decay:1.4, delay:0.22 });
}
function sfxBite(){ if(!sfxAllowed()) return;           // something takes it — look sharp
  tone(null,{ type:'square', f0:hz(81), dur:0.07, gain:0.216 });
  tone(null,{ type:'square', f0:hz(88), dur:0.1, gain:0.216, delay:0.08 });
  noise(null,{ dur:0.1, fc:800, fc1:1800, q:2, gain:0.144, decay:1.4 });
}
function sfxCatch(){ if(!sfxAllowed()) return;          // it breaks the surface
  noise(null,{ dur:0.3, fc:600, fc1:2400, q:1, gain:0.434, decay:0.9 });
  [76,79,84].forEach((n,i)=>tone(null,{ type:'square', f0:hz(n), dur:0.18, gain:0.248, delay:0.14+i*0.07 }));
}
function sfxFishAway(){ if(!sfxAllowed()) return;       // ...and it's gone
  tone(null,{ type:'triangle', f0:hz(72), f1:hz(60), dur:0.3, gain:0.147 });
  noise(null,{ dur:0.18, fc:700, fc1:260, q:1.2, gain:0.126, decay:1.4 });
}

// ── MUSIC: a tiny chiptune sequencer ──────────────────────────────
//  Patterns are 32 sixteenth-steps. lead = pulse melody, bass = triangle,
//  drum = noise ('k' kick · 's' snare · 'h' hat · '.' rest). Scheduled a
//  quarter-second ahead off the game loop, so no stray timers.
const _=null;
const MUSIC = {
  // the open road: a wandering minstrel's lyre — plucked broken chords, no drums,
  // A minor → F → C → G, mixed low so it stays behind the game
  overworld:{ bpm:92, vol:0.55, pluck:true, wave:'triangle',
    lead:[57,_,60,_,64,_,69,_, 53,_,57,_,60,_,65,_, 60,_,64,_,67,_,72,_, 55,_,59,_,62,_,67,64],
    bass:[45,_,_,_,52,_,_,_, 41,_,_,_,48,_,_,_, 48,_,_,_,55,_,_,_, 43,_,_,_,50,_,_,_],
    drum:'................................' },
  // town: the same air, lighter on its feet
  town:{ bpm:112, lead:[79,_,81,_,83,_,81,_, 79,_,76,_,74,_,76,_, 77,_,79,_,81,_,79,_, 77,_,74,_,72,_,_,_],
    bass:[48,_,55,_,48,_,55,_, 53,_,48,_,53,_,48,_, 50,_,57,_,50,_,57,_, 55,_,43,_,55,_,_,_],
    drum:'k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.hh', wave:'square' },
  // the crypts: slow, minor, a held breath
  dungeon:{ bpm:76, lead:[69,_,_,_,71,_,_,_, 72,_,_,_,_,_,_,_, 68,_,_,_,69,_,_,_, _,_,_,_,_,_,_,_],
    bass:[33,_,_,_,_,_,_,_, 33,_,_,_,_,_,_,_, 32,_,_,_,_,_,_,_, 32,_,_,_,31,_,_,_],
    drum:'k.......k.......k.......k......s', wave:'triangle' },
  // under the leaves: modal, curious, wandering
  forest:{ bpm:88, lead:[64,_,67,_,71,_,_,_, 69,_,67,_,64,_,_,_, 62,_,64,_,67,_,_,_, 66,_,_,_,_,_,_,_],
    bass:[40,_,_,_,47,_,_,_, 45,_,_,_,40,_,_,_, 38,_,_,_,45,_,_,_, 43,_,_,_,_,_,_,_],
    drum:'k...h...k...h...k...h...k...h.h.', wave:'triangle' },
  // the Great Sea: a rolling swell
  sail:{ bpm:96, lead:[74,_,_,78,_,_,81,_, _,_,78,_,74,_,_,_, 76,_,_,79,_,_,83,_, _,_,79,_,76,_,_,_],
    bass:[38,_,_,45,_,_,50,_, 45,_,_,38,_,_,_,_, 40,_,_,47,_,_,52,_, 47,_,_,40,_,_,_,_],
    drum:'k..h..h.k..h..h.k..h..h.k..h..h.', wave:'square' },
  // a guardian stirs: driving, chromatic, no rest
  boss:{ bpm:140, lead:[69,69,_,72,_,71,_,69, 68,_,69,_,_,_,_,_, 69,69,_,74,_,72,_,71, 69,_,68,_,69,_,_,_],
    bass:[33,33,_,33,_,33,_,33, 32,32,_,32,_,32,_,32, 33,33,_,33,_,33,_,33, 31,31,_,31,_,32,_,32],
    drum:'k.h.s.h.k.h.s.h.k.h.s.h.k.h.sshh', wave:'square' },
  // the Destroyer: the same engine, lower and meaner
  finale:{ bpm:152, lead:[68,68,_,71,_,70,_,68, 67,_,68,_,63,_,_,_, 68,68,_,73,_,71,_,70, 68,_,67,_,68,_,_,_],
    bass:[32,32,_,32,_,32,_,32, 31,31,_,31,_,31,_,31, 32,32,_,32,_,32,_,32, 30,30,_,30,_,31,_,31],
    drum:'ksh.s.h.ksh.s.h.ksh.s.h.ksh.sshh', wave:'sawtooth' },
};
function musicPlay(id){
  if(audio.trackId===id) return;
  audio.trackId=id; audio.track=MUSIC[id]||null; audio.step=0;
  const c=A(); if(!c || !audio.track) return;
  audio.stepDur = 60/audio.track.bpm/4;                 // sixteenth notes
  audio.nextTime = c.currentTime + 0.06;
}
function musicStop(){ audio.trackId=null; audio.track=null; }
function musicNote(t, n, wave, gain, dur, bus, pluck){
  const c=audio.ctx;
  const osc=c.createOscillator(); osc.type=wave;
  osc.frequency.setValueAtTime(hz(n), t);
  const g=c.createGain();
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain, t+(pluck?0.002:0.012));   // a pluck bites instantly
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  osc.connect(g); g.connect(bus);
  osc.start(t); osc.stop(t+dur+0.02);
  if(pluck){ // a faint octave shimmer, like the paired course of a lyre string
    const o2=c.createOscillator(); o2.type='triangle'; o2.frequency.setValueAtTime(hz(n+12), t);
    const g2=c.createGain(); g2.gain.setValueAtTime(0.0001,t);
    g2.gain.exponentialRampToValueAtTime(gain*0.25, t+0.002);
    g2.gain.exponentialRampToValueAtTime(0.0001, t+dur*0.6);
    o2.connect(g2); g2.connect(bus); o2.start(t); o2.stop(t+dur);
  }
}
function musicDrum(t, ch){
  const c=audio.ctx, bus=audio.musicBus;
  if(ch==='k'){ const o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(45,t+0.11);
    const g=c.createGain(); g.gain.setValueAtTime(0.34,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.13);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t+0.15); return; }
  const dur = ch==='s'?0.13:0.035;
  const src=c.createBufferSource(); src.buffer=noiseBuf(c,dur,ch==='s'?2:3);
  const f=c.createBiquadFilter(); f.type=ch==='s'?'bandpass':'highpass';
  f.frequency.value= ch==='s'?1500:7000; f.Q.value=ch==='s'?0.9:0.7;
  const g=c.createGain(); g.gain.setValueAtTime(ch==='s'?0.2:0.075,t);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  src.connect(f); f.connect(g); g.connect(bus); src.start(t);
}
function musicPump(){   // called once per frame from loop(); schedules ~250ms ahead
  const c=audio.ctx;
  if(!c || !audio.track || !audio.musicOn || c.state!=='running') return;
  // if the tab slept (phone lock), nextTime is far in the past — resync rather
  // than burst-playing every missed note at once on refocus
  if(audio.nextTime < c.currentTime) audio.nextTime = c.currentTime + 0.05;
  const tr=audio.track, bus=audio.musicBus;
  while(audio.nextTime < c.currentTime + 0.25){
    const s=audio.step % 32, t=audio.nextTime;
    const v=tr.vol||1;
    const ln=tr.lead[s]; if(ln!==null && ln!==undefined) musicNote(t, ln, tr.wave, 0.13*v, audio.stepDur*(tr.pluck?2.2:3.2), bus, tr.pluck);
    const bn=tr.bass[s]; if(bn!==null && bn!==undefined) musicNote(t, bn, 'triangle', 0.22*v, audio.stepDur*3.6, bus, tr.pluck);
    const dc=tr.drum[s]; if(dc && dc!=='.') musicDrum(t, dc);
    audio.nextTime += audio.stepDur; audio.step++;
  }
}

  return { audio, RTRACKS, rtStart, rtPause, rtPauseAll, rtTick, rtTickAll, rtApplyVol, setMusicVol, setSfxVol, stepVol, volBar, A, audioUnlock, hz, noiseBuf, tone, noise, musicPlay, musicStop, musicPump, MUSIC, sfx:{swing:sfxSwing, hit:sfxHit, block:sfxBlock, dodge:sfxDodge, hurt:sfxHurt, demonGrowl:sfxDemonGrowl, demonDie:sfxDemonDie, bossRoar:sfxBossRoar, bossTelegraph:sfxBossTelegraph, bossStrike:sfxBossStrike, step:sfxStep, stairStep:sfxStairStep, hoof:sfxHoof, wagon:sfxWagon, mount:sfxMount, door:sfxDoor, bleat:sfxBleat, portal:sfxPortal, click:sfxClick, menu:sfxMenu, potion:sfxPotion, coin:sfxCoin, levelUp:sfxLevelUp, revealChest:sfxRevealChest, cast:sfxCast, bite:sfxBite, catch:sfxCatch, fishAway:sfxFishAway},
    set onUpdate(f){ musicUpdate=f; } };
})();
