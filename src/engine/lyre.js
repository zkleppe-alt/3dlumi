// ════════════════════════════════════════════════════════════════
//  LYRE (V214) — your father's lyre: take it out anywhere, and play. For rest, not for power: nothing it does wins a
//  fight or changes the world; it is only music. (David played for Saul, and he was refreshed — 1 Samuel 16:23.)
//
//  Stage 1–2 of the brief: one plucked-string voice on the game's own audio graph (AUDIO2D), four chords of four notes
//  on four buttons, played in any order, the whole harmony moved up or down a semitone at a time, eight open strings,
//  a playing pose (knight.js mode 'lyre'), and a small prompt. Songwriter, songbook, bards and the gift scene come after.
//
//    controller (while the lyre is out)   Ⓨ Ⓧ Ⓑ Ⓐ  the four chords (press = strum)   RT strum again   LB / RB key down / up
//                                         ✚ the eight strings two at a time (↑ ← → ↓ = 1 3 5 8)        Start  put it away
//    keyboard                             1 2 3 4 chords · Space strum again · Q / E key down / up · Z X C V B N M ,  strings
//                                         L take it out / put it away (Esc also puts it away)
//
//  Built first of all the engine's files so its key listener hears a key before the game's does.
//  Everything here is its own: no other system's state is changed. While it is out the pad's buttons are the lyre's
//  (pad.js hands them over), and the keys it uses are stopped before the game sees them. Musical time is the audio
//  clock's (AudioContext.currentTime), never a frame's.
// ════════════════════════════════════════════════════════════════
const LYRE=(function(){
  const NAMES=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const SCALE=[0,2,4,5,7,9,11,12];                                   // the eight strings: one octave of the key
  // the four slots: scale-degree role and quality (I, IV, V, vi) — the player can re-assign them later
  const SLOTS=[{id:'Y',pad:3,key:'1',deg:0,min:false,role:'I'},{id:'X',pad:2,key:'2',deg:5,min:false,role:'IV'},{id:'B',pad:1,key:'3',deg:7,min:false,role:'V'},{id:'A',pad:0,key:'4',deg:9,min:true,role:'vi'}];
  const GLYPH={Y:'Ⓨ',X:'Ⓧ',B:'Ⓑ',A:'Ⓐ'};
  let on=false, key=0, last=0, vol=0.8, upNext=false, ui=null, btn=null, mesh=null, raf=0, strumAt=-9;
  const live=new Set();                                              // sounding voices, so they can all be stopped at once

  // ── the voice: a plucked string — a bright attack that mellows as it rings ──
  const ctxOf=()=>{ try{ return typeof AUDIO2D!=='undefined'?AUDIO2D.A():null; }catch(e){ return null; } };
  const outOf=c=>(typeof AUDIO2D!=='undefined'&&AUDIO2D.audio&&AUDIO2D.audio.sfxBus)||c.destination;
  const hz=m=>440*Math.pow(2,(m-69)/12);
  // V215: a medieval lyre, not a keyboard — each note is a real plucked string (Karplus–Strong: a burst of noise going round
  //  a delay the length of the string, losing its brightness each lap, as a gut string does), plucked a fifth of the way
  //  along, and heard through a small wooden box (two body resonances, the top rolled off). Built once per pitch and kept.
  const KS={}; function stringBuf(c,midi){ const k=midi+'@'+c.sampleRate; if(KS[k]) return KS[k]; const sr=c.sampleRate, f=hz(midi), N=Math.max(8,Math.round(sr/f)), len=Math.floor(sr*2.4), buf=c.createBuffer(1,len,sr), out=buf.getChannelData(0), line=new Float32Array(N);
    let lp=0, seed=midi*7919+17; const rnd=()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296*2-1; };
    for(let i=0;i<N;i++){ lp+=(rnd()-lp)*0.55; line[i]=lp; } const pk=Math.max(1,Math.round(N*0.2)), tmp=line.slice(); for(let i=0;i<N;i++) line[i]=tmp[i]-0.7*tmp[(i+N-pk)%N];   // the finger a fifth of the way along the string
    let mx=0; for(let i=0;i<N;i++) mx=Math.max(mx,Math.abs(line[i])); for(let i=0;i<N;i++) line[i]/=mx||1;
    const T60=Math.max(1.1,2.3-(midi-48)*0.03), d=Math.pow(10,-3/(f*T60)); let idx=0;
    for(let i=0;i<len;i++){ const cur=line[idx], nx=line[(idx+1)%N]; out[i]=cur; line[idx]=d*(0.56*cur+0.44*nx); idx=(idx+1)%N; }
    return KS[k]={buf,rate:f/(sr/N)}; }
  function pluck(midi,when,vel){ const c=ctxOf(); if(!c) return; const t=Math.max(c.currentTime,when||0), v=(vel==null?1:vel)*vol*0.5, S=stringBuf(c,midi);
    live.forEach(o=>{ if(o.midi===midi){ try{ o.g.gain.cancelScheduledValues(t); o.g.gain.setTargetAtTime(0.0001,t,0.012); o.parts[0].stop(t+0.1); }catch(e){} live.delete(o); } });   // the same string plucked again: the old ring is stopped by the finger
    if(live.size>28){ const o=live.values().next().value; try{ o.g.gain.setTargetAtTime(0.0001,t,0.03); o.parts[0].stop(t+0.2); }catch(e){} live.delete(o); }
    const src=c.createBufferSource(); src.buffer=S.buf; src.playbackRate.value=S.rate*(1+(Math.random()-0.5)*0.0012);
    const b1=c.createBiquadFilter(); b1.type='peaking'; b1.frequency.value=310; b1.Q.value=1.1; b1.gain.value=5;
    const b2=c.createBiquadFilter(); b2.type='peaking'; b2.frequency.value=1150; b2.Q.value=1.6; b2.gain.value=3.5;
    const hs=c.createBiquadFilter(); hs.type='highshelf'; hs.frequency.value=5200; hs.gain.value=-7;
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+0.003); g.gain.setTargetAtTime(v*0.85,t+0.02,0.4);
    src.connect(b1); b1.connect(b2); b2.connect(hs); hs.connect(g); g.connect(outOf(c)); src.start(t);
    const voice={g,parts:[src],midi}; live.add(voice); src.onended=()=>{ live.delete(voice); try{ g.disconnect(); }catch(e){} }; }
  function hush(){ const c=ctxOf(); live.forEach(v=>{ try{ if(c){ v.g.gain.cancelScheduledValues(c.currentTime); v.g.gain.setTargetAtTime(0.0001,c.currentTime,0.03); } v.parts.forEach(o=>o.stop((c?c.currentTime:0)+0.15)); }catch(e){} }); live.clear(); }

  // ── harmony ──
  const tones=s=>{ let r=48+key+s.deg; while(r>58) r-=12; while(r<50) r+=12; return [r,r+7,r+12,r+12+(s.min?3:4)]; };   // four notes, laid open as a lyre's are: root, fifth, octave, and the third above it — kept in the instrument's own range
  const chordName=s=>NAMES[((key+s.deg)%12+12)%12]+(s.min?'m':'');
  function strum(i,vel){ const c=ctxOf(), s=SLOTS[i]; if(!s) return; last=i; const t=c?c.currentTime:0; const up=vel&&vel<1&&(upNext=!upNext), ns=tones(s); (up?ns.slice().reverse():ns).forEach((m,k)=>pluck(m,t+k*0.045+Math.random()*0.006,(vel||1)*(up?0.8:1)*(1-k*0.05))); strumAt=performance.now(); paint(i); }   // rolled like a harp; a repeat strum (RT / Space) goes back up the strings, then down again
  function string(n){ const c=ctxOf(); pluck(62+key+SCALE[n],c?c.currentTime:0,0.9); strumAt=performance.now(); paint(-1,n); }
  function shift(d){ key=Math.max(-6,Math.min(6,key+d)); paint(); }

  // ── the instrument: a small curved lyre of warm wood, eight strings ──
  function build(){ const g=new THREE.Group(), wood=new THREE.MeshLambertMaterial({color:0x8a5a2e}), dark=new THREE.MeshLambertMaterial({color:0x5e3a1c}), gold=new THREE.MeshLambertMaterial({color:0xd8b45a}), str=new THREE.MeshBasicMaterial({color:0xf2ead2});
    const box=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),wood); box.scale.set(1.15,0.7,0.42); box.position.y=-0.13; g.add(box);
    [-1,1].forEach(s=>{ const arm=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.016,6,12,Math.PI*0.62),wood); arm.rotation.z=s>0?-Math.PI*0.12:Math.PI*0.5; arm.position.set(s*0.035-(s>0?0.14:-0.14)*0,-0.05,0); arm.scale.x=s; g.add(arm);
      const tip=new THREE.Mesh(new THREE.SphereGeometry(0.022,6,5),gold); tip.position.set(s*0.115,0.16,0); g.add(tip); });
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.27,6),dark); bar.rotation.z=Math.PI/2; bar.position.y=0.135; g.add(bar);
    for(let i=0;i<8;i++){ const x=-0.077+i*0.022, s=new THREE.Mesh(new THREE.CylinderGeometry(0.0022,0.0022,0.25,3),str); s.position.set(x,0.005,0.012); g.add(s); const peg=new THREE.Mesh(new THREE.SphereGeometry(0.007,4,3),gold); peg.position.set(x,0.146,0.012); g.add(peg); }
    return g; }
  function show(v){ const K=ENGINE.K; if(!K) return; if(v&&!mesh){ mesh=build(); mesh.position.set(0.16,(K.hipY||0.8)+0.3,0.2); mesh.rotation.set(-0.25,-0.35,0.3); K.add(mesh); } if(mesh) mesh.visible=!!v; }

  // ── the prompt ──
  function paint(hit,strN){ if(!ui) return; const kn=NAMES[((key%12)+12)%12];
    ui.innerHTML=`<div class="ly-top"><span>🎵 <b>Key of ${kn}</b></span><span class="ly-dim">LB / Q ◂ key ▸ RB / E</span><button data-ly="away" aria-label="Put the lyre away">✕</button></div>`
      +`<div class="ly-ch">`+SLOTS.map((s,i)=>`<button data-ly="c${i}" class="${hit===i?'hit':i===last?'cur':''}"><i>${GLYPH[s.id]} ${s.key}</i><b>${chordName(s)}</b></button>`).join('')+`</div>`
      +`<div class="ly-st">`+SCALE.map((_,n)=>`<button data-ly="s${n}" class="${strN===n?'hit':''}" aria-label="String ${n+1}"></button>`).join('')+`</div>`
      +`<div class="ly-dim">RT / Space strums again · Start / L puts it away</div>`; }
  function mount(){ if(ui) return; const st=document.createElement('style'); st.textContent=`
#lyre{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:40;width:min(44vw,300px);padding:10px 12px;border-radius:14px;background:rgba(22,32,46,.82);border:1px solid rgba(242,193,78,.55);color:#f2e2b0;font:600 13px var(--f-body,system-ui);box-shadow:0 6px 24px rgba(0,0,0,.35)}
#lyre .ly-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}#lyre .ly-dim{opacity:.7;font-weight:500;font-size:11px;text-align:center}
#lyre button{font:inherit;color:inherit;cursor:pointer;border:1px solid rgba(242,193,78,.45);background:rgba(255,255,255,.06);border-radius:10px}
#lyre .ly-top button{width:28px;height:28px}#lyre .ly-ch{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
#lyre .ly-ch button{padding:8px 2px;display:flex;flex-direction:column;align-items:center;gap:2px}#lyre .ly-ch i{font-style:normal;font-size:11px;opacity:.75}#lyre .ly-ch b{font-size:17px}
#lyre .ly-ch .cur{border-color:#f2c14e}#lyre .hit{background:rgba(242,193,78,.35)!important}
#lyre .ly-st{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-bottom:6px}#lyre .ly-st button{height:30px;border-radius:6px;background:linear-gradient(90deg,transparent 46%,#f2ead2 46%,#f2ead2 54%,transparent 54%)}
#lyreBtn{position:fixed;left:calc(26px + env(safe-area-inset-left,0px));bottom:calc(264px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:1px solid rgba(242,193,78,.8);background:rgba(22,32,46,.6);color:#f2e2b0;font:700 24px var(--f-body,system-ui);cursor:pointer;z-index:30}`;
    document.head.appendChild(st);
    ui=document.createElement('div'); ui.id='lyre'; ui.hidden=true; document.body.appendChild(ui);
    ui.addEventListener('pointerdown',e=>{ const b=e.target.closest('[data-ly]'); if(!b) return; e.preventDefault(); e.stopPropagation(); const a=b.dataset.ly; if(a==='away') set(false); else if(a[0]==='c') strum(+a.slice(1)); else if(a[0]==='s') string(+a.slice(1)); });
    btn=document.createElement('button'); btn.id='lyreBtn'; btn.className='act'; btn.textContent='🎵'; btn.setAttribute('aria-label','Take out or put away the lyre'); document.body.appendChild(btn);
    btn.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); set(!on); }); }

  // ── out and away ──
  const canPlay=()=>{ const L=ENGINE.level; if(!L||ENGINE.busy) return 'Not just now.'; if(L.riding&&(L.riding.mounted||L.riding.moving)) return 'Dismount first.'; if(L._sailing&&L._sailing.boating) return 'Not while sailing.';
    if(typeof COMBAT!=='undefined'&&COMBAT.pl&&(COMBAT.pl.swing>0||COMBAT.pl.dashing>0)) return 'Not in the middle of a fight.'; return ''; };
  function tick(){ if(!on) return; raf=requestAnimationFrame(tick); const K=ENGINE.K; if(K) K._lyreT=(performance.now()-strumAt)/1000; if(ENGINE.busy){ return; } const mc=K&&K.mocap&&!K.mocapOff&&K.mocap.actions&&K.mocap.actions.lyre; if(K) K._lyreOn=!!mc; ENGINE.hold(0.25,mc?null:'lyre');   /* the playing clip where the animation library has loaded; the hand-set pose where it hasn't */ if(mesh&&!mesh.visible) mesh.visible=true; }
  function set(v){ v=!!v; if(v===on) return; mount();
    if(v){ const why=canPlay(); if(why){ if(typeof UI!=='undefined') UI.toast('🎵 '+why,1400); return; } if(ENGINE.K&&ENGINE.K.sheathe) try{ ENGINE.K.sheathe(); }catch(e){}
      if(typeof AUDIO2D!=='undefined') try{ AUDIO2D.audioUnlock(); }catch(e){}
      on=true; show(true); ui.hidden=false; paint(); tick(); }
    else { on=false; cancelAnimationFrame(raf); hush(); show(false); ui.hidden=true; if(ENGINE.K) ENGINE.K._lyreOn=false; ENGINE.hold(0.05,null); } }

  // ── keys (stopped before the game sees them, only while the lyre is out) ──
  const STR='zxcvbnm,';
  addEventListener('keydown',e=>{ if(e._pad) return; const t=e.target&&e.target.tagName; if(t==='INPUT'||t==='TEXTAREA') return; const k=(e.key||'').toLowerCase();
    if(!on){ if(k==='l'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&typeof ENGINE!=='undefined'&&ENGINE.level&&typeof GAME!=='undefined'&&GAME.S){ const p=document.getElementById('sheet'), g=document.getElementById('gm'); if((p&&!p.hidden&&p.getClientRects().length)||(g&&!g.hidden&&g.getClientRects().length)) return; e.stopImmediatePropagation(); set(true); } return; }
    let used=true; if(e.repeat){ e.stopImmediatePropagation(); e.preventDefault(); return; }
    const ci=SLOTS.findIndex(s=>s.key===k), si=STR.indexOf(k);
    if(ci>=0) strum(ci); else if(k===' ') strum(last,0.9); else if(k==='q') shift(-1); else if(k==='e') shift(1); else if(si>=0&&k) string(si); else if(k==='l'||k==='escape') set(false); else used=false;
    if(used){ e.stopImmediatePropagation(); e.preventDefault(); } },true);
  // ── the controller: pad.js hands every button here while the lyre is out ──
  function pad(now,was){ const down=i=>now[i]&&!was[i]; SLOTS.forEach((s,i)=>{ if(down(s.pad)) strum(i); }); if(down(7)) strum(last,0.9); if(down(4)) shift(-1); if(down(5)) shift(1);
    [[12,0],[14,2],[15,4],[13,7]].forEach(([b,n])=>{ if(down(b)) string(n); }); if(down(9)||down(8)) set(false); }
  // put away on leaving a place; show the button once the game is running
  function attachUI(){ mount(); btn.hidden=!(typeof GAME!=='undefined'&&GAME.S); }
  setInterval(()=>{ try{ if(typeof ENGINE==='undefined') return; if(!btn) { if(ENGINE.level&&typeof GAME!=='undefined'&&GAME.S) attachUI(); return; } const vis=id=>{ const e=document.getElementById(id); return !!e&&!e.hidden&&e.getClientRects().length>0; }, menu=vis('gm')||vis('sheet'); btn.hidden=!ENGINE.level||menu||on||!!ENGINE.busy; if(ui) ui.hidden=!on||menu; if(on&&LYRE._lv&&LYRE._lv!==ENGINE.level) set(false); LYRE._lv=ENGINE.level; }catch(e){} },500);
  return { get on(){ return on; }, set, pad, strum, string, shift, pluck, hush, get key(){ return key; }, chordName:i=>chordName(SLOTS[i]), _lv:null };
})();
try{ window.LYRE=LYRE; }catch(e){}
