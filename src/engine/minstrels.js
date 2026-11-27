// ════════════════════════════════════════════════════════════════
//  MINSTRELS (V283) — the king's musicians in the throne hall: a small medieval band playing old hymns, made here on the
//  game's own audio graph (AUDIO2D's music bus), nothing recorded. Five voices:
//    recorder (the tune) · lute (the chords, struck and broken) · harp (rippling chord tones, the second time through)
//    hurdy-gurdy (the drone on the keynote and its fifth, with its buzzing trompette) · frame drum (soft, on the strong beats)
//  all through a stone-hall reverb. The tunes are public domain: Old Hundredth (Genevan Psalter, 1551), New Britain
//  ("Amazing Grace", 1829) and Greensleeves ("What Child Is This", 16th century). Each is played twice, then a breath,
//  then the next. Notes are queued a little ahead on the audio clock (AudioContext.currentTime), never timed by a frame.
//    MINSTRELS.on(want, vol)  — called every frame by sound.js: want = the hall's music should be playing; vol 0…1
// ════════════════════════════════════════════════════════════════
const MINSTRELS=(()=>{
  const N=n=>{ const m=/^([A-G])(#|b)?(\d)$/.exec(n); return 12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0); };
  const hz=m=>440*Math.pow(2,(m-69)/12);
  const ROOT={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const chordNotes=(c,oct)=>{ const r=ROOT[c[0]]+(c[1]==='#'?1:0), minor=/m$/.test(c); return [0,minor?3:4,7].map(i=>12*(oct+1)+r+i); };
  // a tune: tempo (quarter notes a minute), beats a bar, the pickup in beats, notes [name|null, beats], a chord for each bar (or half-bar for 4/4: 'G|Em')
  const SONGS=[
    { name:'Old Hundredth', tempo:76, bar:4, pick:0, key:'G', notes:[
      ['G4',1],['G4',1],['F#4',1],['E4',1],['D4',2],['G4',1],['A4',1],['B4',3],[null,1],
      ['B4',1],['B4',1],['B4',1],['A4',1],['G4',2],['C5',1],['B4',1],['A4',3],[null,1],
      ['G4',1],['A4',1],['B4',1],['A4',1],['G4',2],['E4',1],['F#4',1],['G4',3],[null,1],
      ['D5',1],['B4',1],['G4',1],['A4',1],['C5',2],['B4',1],['A4',1],['G4',3],[null,1]],
      chords:['G|Em','D|G','G|G','G|D','G|C','D|D','G|D','Em|D','G|G','G|D','C|D','G|G'] },
    { name:'Amazing Grace', tempo:88, bar:3, pick:1, key:'G', notes:[['D4',1],
      ['G4',2],['B4',.5],['G4',.5],['B4',2],['A4',1],['G4',2],['E4',1],['D4',2],['D4',1],['G4',2],['B4',.5],['G4',.5],['B4',2],['A4',1],['D5',3],
      ['D5',2],['B4',1],['D5',2],['B4',.5],['D5',.5],['B4',2],['G4',1],['D4',2],['E4',1],['G4',2],['E4',1],['D4',2],['D4',1],['G4',2],['B4',.5],['G4',.5],['B4',2],['A4',1],['G4',3],['G4',2],[null,1]],
      chords:['G','G','C','G','G','G','D','G','G','G','G','C','G','G','D','G','G'] },
    { name:'What Child Is This', tempo:100, bar:3, pick:1, key:'A', minor:true, notes:[['A4',1],
      ['C5',2],['D5',1],['E5',1.5],['F5',.5],['E5',1],['D5',2],['B4',1],['G4',1.5],['A4',.5],['B4',1],['C5',2],['A4',1],['A4',1.5],['G#4',.5],['A4',1],['B4',2],['G#4',1],['E4',2],['A4',1],
      ['C5',2],['D5',1],['E5',1.5],['F5',.5],['E5',1],['D5',2],['B4',1],['G4',1.5],['A4',.5],['B4',1],['C5',1.5],['B4',.5],['A4',1],['G#4',1.5],['F#4',.5],['G#4',1],['A4',3],['A4',2],[null,1],
      ['G5',3],['G5',1.5],['F#5',.5],['E5',1],['D5',2],['B4',1],['G4',1.5],['A4',.5],['B4',1],['C5',2],['A4',1],['A4',1.5],['G#4',.5],['A4',1],['B4',2],['G#4',1],['E4',3],
      ['G5',3],['G5',1.5],['F#5',.5],['E5',1],['D5',2],['B4',1],['G4',1.5],['A4',.5],['B4',1],['C5',1.5],['B4',.5],['A4',1],['G#4',1.5],['F#4',.5],['G#4',1],['A4',3],['A4',2],[null,1]],
      chords:['Am','Am','G','G','F','E','E','E','Am','Am','G','G','Am','E','Am','Am','C','C','G','G','Am','E','E','E','C','C','G','G','Am','E','Am','Am'] } ];
  let cur=null, songT=0, songB=0.6, A=null, out=null, wet=null, dry=null, playing=false, si=0, pass=0, tNext=0, evs=[], lvl=0, level=0;
  function setup(){ if(out) return true; A=typeof AUDIO2D!=='undefined'&&AUDIO2D.A?AUDIO2D.A():null; const bus=AUDIO2D&&AUDIO2D.audio&&AUDIO2D.audio.musicBus; if(!A||!bus) return false;
    out=A.createGain(); out.gain.value=0; out.connect(bus);
    dry=A.createGain(); dry.gain.value=0.8; dry.connect(out);
    // the hall: a long stone room, about two and a half seconds of tail
    const len=Math.floor(A.sampleRate*2.6), ir=A.createBuffer(2,len,A.sampleRate);
    for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++){ const t=i/A.sampleRate; d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2)*Math.exp(-t*1.6)*(t<0.012?0:1); } }
    const cv=A.createConvolver(); cv.buffer=ir; wet=A.createGain(); wet.gain.value=0.42; const lp=A.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3800;
    wet.connect(cv); cv.connect(lp); lp.connect(out);
    return true; }
  const send=(node,amt)=>{ node.connect(dry); const s=A.createGain(); s.gain.value=amt; node.connect(s); s.connect(wet); };
  // ── the voices ──
  function pluck(f,t,vel,o){ o=o||{}; const g=A.createGain(), lp=A.createBiquadFilter(), dec=o.dec||1.6;
    lp.type='lowpass'; lp.frequency.setValueAtTime(o.bright||3200,t); lp.frequency.exponentialRampToValueAtTime(Math.max(300,(o.bright||3200)*0.18),t+dec*0.7); lp.Q.value=0.7;
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vel,t+0.004); g.gain.exponentialRampToValueAtTime(vel*0.35,t+0.09); g.gain.exponentialRampToValueAtTime(0.0001,t+dec);
    [[o.harp?'sine':'sawtooth',1,1],['triangle',2,0.35],[o.harp?'triangle':'square',1.003,o.harp?0.4:0.12]].forEach(([ty,m,a])=>{ const os=A.createOscillator(), ga=A.createGain(); os.type=ty; os.frequency.value=f*m; ga.gain.value=a; os.connect(ga); ga.connect(lp); os.start(t); os.stop(t+dec+0.05); });
    lp.connect(g); send(g,o.harp?0.6:0.35); }
  function recorder(f,t,d,vel){ const g=A.createGain(), os=A.createOscillator(), o2=A.createOscillator(), g2=A.createGain(), vib=A.createOscillator(), vg=A.createGain();
    os.type='sine'; os.frequency.value=f; o2.type='triangle'; o2.frequency.value=f*2; g2.gain.value=0.06;
    vib.frequency.value=5.2; vg.gain.setValueAtTime(0,t); vg.gain.linearRampToValueAtTime(0,t+Math.min(0.35,d*0.5)); vg.gain.linearRampToValueAtTime(f*0.006,t+Math.min(0.7,d)); vib.connect(vg); vg.connect(os.frequency); vg.connect(o2.frequency);
    const end=t+d*0.94; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vel*1.15,t+0.035); g.gain.linearRampToValueAtTime(vel,t+0.1); g.gain.setValueAtTime(vel,Math.max(t+0.1,end-0.06)); g.gain.linearRampToValueAtTime(0.0001,end);
    os.connect(g); o2.connect(g2); g2.connect(g);
    // the breath at the start of each note
    const nb=A.createBufferSource(), buf=A.createBuffer(1,Math.floor(A.sampleRate*0.12),A.sampleRate), bd=buf.getChannelData(0); for(let i=0;i<bd.length;i++) bd[i]=(Math.random()*2-1)*(1-i/bd.length);
    nb.buffer=buf; const bp=A.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=f*3; bp.Q.value=2; const bg=A.createGain(); bg.gain.value=vel*0.25; nb.connect(bp); bp.connect(bg); bg.connect(g); nb.start(t);
    [os,o2,vib].forEach(o=>{ o.start(t); o.stop(end+0.05); }); send(g,0.5); }
  function drum(t,vel){ const g=A.createGain(), os=A.createOscillator(); os.type='sine'; os.frequency.setValueAtTime(110,t); os.frequency.exponentialRampToValueAtTime(58,t+0.18);
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vel,t+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t+0.45); os.connect(g); os.start(t); os.stop(t+0.5);
    const nb=A.createBufferSource(), buf=A.createBuffer(1,Math.floor(A.sampleRate*0.08),A.sampleRate), d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
    nb.buffer=buf; const bp=A.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=900; const ng=A.createGain(); ng.gain.value=vel*0.35; nb.connect(bp); bp.connect(ng); ng.connect(g); nb.start(t); send(g,0.3); }
  // the hurdy-gurdy: a held drone for the whole tune, swelling in, with the trompette's buzz pulsing on the beat
  function drone(root,t,dur,beat,vel){ const g=A.createGain(), lp=A.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=950; lp.Q.value=1.2;
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vel,t+1.2); g.gain.setValueAtTime(vel,t+dur-1.0); g.gain.linearRampToValueAtTime(0.0001,t+dur);
    [[root-12,0.5],[root-5,0.35],[root,0.18]].forEach(([m,a])=>{ const os=A.createOscillator(), ga=A.createGain(); os.type='sawtooth'; os.frequency.value=hz(m)*(1+(Math.random()-0.5)*0.002); ga.gain.value=a; os.connect(ga); ga.connect(lp); os.start(t); os.stop(t+dur+0.05); });
    const tr=A.createOscillator(), tg=A.createGain(), trg=A.createGain(); tr.type='square'; tr.frequency.value=hz(root); trg.gain.value=0;
    for(let k=t+0.6;k<t+dur-0.8;k+=beat){ trg.gain.setValueAtTime(0.0001,k); trg.gain.linearRampToValueAtTime(0.05,k+0.02); trg.gain.exponentialRampToValueAtTime(0.0001,k+beat*0.45); }
    tr.connect(tg); tg.gain.value=1; tg.connect(trg); const tlp=A.createBiquadFilter(); tlp.type='bandpass'; tlp.frequency.value=hz(root)*4; trg.connect(tlp); tlp.connect(lp); tr.start(t); tr.stop(t+dur);
    lp.connect(g); send(g,0.3); }
  // ── one pass of a tune, queued from time t; returns its length in seconds ──
  function queue(S,t,withHarp){ const b=60/S.tempo, ev=[];
    let at=0; for(const [n,d] of S.notes){ if(n) ev.push([at,'rec',N(n),d]); at+=d; }
    const total=at, root=N(S.key+'3');
    ev.push([0,'drone',root,total]);
    const bars=Math.ceil((total-S.pick)/S.bar);
    for(let i=0;i<bars;i++){ const b0=S.pick+i*S.bar, cs=(S.chords[i]||S.chords[S.chords.length-1]).split('|');
      cs.forEach((c,k)=>{ const s0=b0+k*(S.bar/cs.length), ns=chordNotes(c,3);
        ev.push([s0,'strum',ns,1]); if(S.bar===4&&cs.length===1) ev.push([s0+2,'strum',ns,0.6]);
        if(S.bar===3) ev.push([s0+2,'lute1',ns[2]+(Math.random()<0.5?0:-12),0.5]);
        if(withHarp){ const ar=[ns[0]+12,ns[1]+12,ns[2]+12,ns[0]+24]; const steps=(S.bar/cs.length)*2; for(let s=0;s<steps;s++) ev.push([s0+s*0.5,'harp',ar[s%4],1]); } });
      if(withHarp||i%2===0){ ev.push([b0,'drum',0,1]); if(S.bar===4) ev.push([b0+2,'drum',0,0.5]); else ev.push([b0+2,'drum',0,0.35]); } }
    ev.forEach(e=>{ e[0]=t+e[0]*b; }); ev.sort((a,c)=>a[0]-c[0]); return {ev,len:total*b,beat:b}; }
  function fire(e,beat){ const [t,k,v,d]=e;
    if(k==='rec') recorder(hz(v),t,d*beat,0.11);
    else if(k==='drone') drone(v,t,d*beat,beat,0.045);
    else if(k==='strum') v.forEach((m,i)=>pluck(hz(m),t+i*0.028,0.07*d,{dec:2.0,bright:2600}));
    else if(k==='lute1') pluck(hz(v),t,0.05,{dec:1.2,bright:2200});
    else if(k==='harp') pluck(hz(v),t,0.035,{harp:true,dec:2.4,bright:4200});
    else if(k==='drum') drum(t,0.16*d); }
  let beatNow=0.6;
  function tick(){ if(!A) return; const now=A.currentTime;
    if(playing&&evs.length===0&&now>tNext-0.5){ const S=SONGS[si]; cur=S.name; const t0=Math.max(now+0.1,tNext); const q=queue(S,t0,pass===1); songT=t0; songB=q.beat; evs=q.ev; beatNow=q.beat; tNext=Math.max(now+0.1,tNext)+q.len+(pass===1?3.2:0.6);
      if(pass===1){ pass=0; si=(si+1)%SONGS.length; } else pass=1; }
    while(evs.length&&evs[0][0]<now+0.35){ const e=evs.shift(); if(e[0]>=now-0.02) fire(e,beatNow); } }
  function on(want,vol){ level=want?Math.max(0,Math.min(1,vol)):0;
    if(!want&&!playing) return; if(!setup()) return;
    if(want&&!playing){ playing=true; tNext=A.currentTime+0.4; evs=[]; pass=0; }
    const now=A.currentTime, dt=Math.min(0.25,Math.max(0,now-(on.t||now))); on.t=now; lvl+=(level-lvl)*(1-Math.exp(-dt*2.2)); out.gain.value=lvl;   // a second or so to swell in or fade away
    if(!want&&lvl<0.004){ playing=false; evs=[]; out.gain.value=0; return; }
    if(playing) tick(); }
  return {on,SONGS,beat:()=>playing&&A&&lvl>0.02?(A.currentTime-songT)/songB:null,now:()=>playing?cur:null,state:()=>({playing,song:cur,ctx:A&&A.state,t:A&&+A.currentTime.toFixed(1),gain:out&&+out.gain.value.toFixed(3)})};
})();
if(typeof window!=='undefined') window.__MINSTRELS=MINSTRELS;
