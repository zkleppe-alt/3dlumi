// ════════════════════════════════════════════════════════════════
//  LYREBOOK (V216) — the songwriter and the songbook (stage 3 of the lyre brief).
//  A song is sixteen steps (eighth notes): at each step one of the four chords may sound, and any of the eight strings.
//  It plays on the lyre's own strings (LYRE.chordAt / LYRE.noteAt) against the audio clock — steps are queued a quarter
//  of a second ahead on AudioContext.currentTime; nothing musical is timed by a frame or an interval.
//  Songs are kept on this device under 'restfulKnight.lyre.v1', apart from the game's save, and can be exported and
//  imported as JSON (checked field by field; never run). Four moods set a suggested tempo and the way the chords are struck.
//  LYREBOOK.open() / close() · play(song,{loop,onStep,onEnd}) / stop() · songs() · get(id) — the bards use the last four.
// ════════════════════════════════════════════════════════════════
const LYREBOOK=(function(){
  const KEY='restfulKnight.lyre.v1', STEPS=16, NS=8;
  const MOODS={ cozy:{name:'Cozy folk',tempo:84,vel:0.85,swing:0}, adventure:{name:'Adventure',tempo:112,vel:1,swing:0}, sacred:{name:'Sacred',tempo:66,vel:0.72,swing:0}, playful:{name:'Playful folk',tempo:126,vel:0.9,swing:0.16} };
  const blank=()=>({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:'A new song',key:0,tempo:90,mood:'cozy',fav:false,created:Date.now(),modified:Date.now(),steps:Array.from({length:STEPS},()=>({c:-1,m:new Array(NS).fill(false)}))});
  // ── storage (its own, versioned; the game's save is never touched) ──
  let db={v:1,songs:[],bards:{}};
  const clampI=(v,a,b,d)=>{ v=Math.round(Number(v)); return isFinite(v)?Math.max(a,Math.min(b,v)):d; };
  function clean(o){ if(!o||typeof o!=='object'||!Array.isArray(o.steps)||o.steps.length!==STEPS) return null; const s=blank();
    s.title=String(o.title==null?'Untitled':o.title).replace(/[\u0000-\u001f<>]/g,'').slice(0,48)||'Untitled'; s.key=clampI(o.key,-6,6,0); s.tempo=clampI(o.tempo,60,160,90); s.mood=MOODS[o.mood]?o.mood:'cozy'; s.fav=!!o.fav;
    if(typeof o.id==='string'&&/^[a-z0-9]{4,24}$/i.test(o.id)) s.id=o.id; if(isFinite(o.created)) s.created=+o.created; if(isFinite(o.modified)) s.modified=+o.modified;
    for(let i=0;i<STEPS;i++){ const st=o.steps[i]||{}; s.steps[i].c=clampI(st.c,-1,3,-1); if(Array.isArray(st.m)) for(let n=0;n<NS;n++) s.steps[i].m[n]=!!st.m[n]; } return s; }
  function load(){ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&o.v===1){ db.songs=(Array.isArray(o.songs)?o.songs:[]).map(clean).filter(Boolean).slice(0,200); db.bards={}; if(o.bards&&typeof o.bards==='object') for(const k in o.bards){ if(/^[\w:.-]{1,60}$/.test(k)&&Array.isArray(o.bards[k])) db.bards[k]=o.bards[k].filter(x=>typeof x==='string').slice(0,40); } } }catch(e){} }
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(db)); return true; }catch(e){ return false; } }
  load();
  const get=id=>db.songs.find(s=>s.id===id)||null;

  // ── the player ──
  let P=null;
  function stop(){ if(!P) return; clearTimeout(P.timer); cancelAnimationFrame(P.raf); const p=P; P=null; try{ LYRE.hush(); }catch(e){} if(p.onStep) p.onStep(-1); if(p.onEnd) p.onEnd(false); }
  function play(song,o){ stop(); o=o||{}; const c=LYRE.ctx(); if(!c){ if(typeof UI!=='undefined') UI.toast('🎵 Tap or press a key once to wake the sound.',1600); return false; }
    const md=MOODS[song.mood]||MOODS.cozy, sd=60/song.tempo/2; const p=P={song,loop:!!o.loop,onStep:o.onStep,onEnd:o.onEnd,step:0,next:c.currentTime+0.1,marks:[],timer:0,raf:0,done:false,endAt:0};
    const pump=()=>{ if(P!==p) return; if(p.next<c.currentTime-0.05) p.next=c.currentTime+0.05;   /* the page stalled (a hidden tab, a long frame): pick the tune up from now rather than firing the missed steps all at once */
      while(!p.done&&p.next<c.currentTime+0.25){ const st=song.steps[p.step], t=p.next+(p.step%2?md.swing*sd:0); if(st.c>=0) LYRE.chordAt(st.c,song.key,t,md.vel); for(let n=0;n<NS;n++) if(st.m[n]) LYRE.noteAt(n,song.key,t,md.vel*0.95);
        p.marks.push([t,p.step]); p.step++; p.next+=sd; if(p.step>=STEPS){ if(p.loop) p.step=0; else { p.done=true; p.endAt=p.next+1.2; } } }
      if(!p.done||c.currentTime<p.endAt) p.timer=setTimeout(pump,60); else { P=null; if(p.onStep) p.onStep(-1); if(p.onEnd) p.onEnd(true); } };
    const head=()=>{ if(P!==p) return; p.raf=requestAnimationFrame(head); let cur=-1; while(p.marks.length&&p.marks[0][0]<=c.currentTime){ cur=p.marks.shift()[1]; } if(cur>=0&&p.onStep) p.onStep(cur); };
    pump(); head(); return true; }

  // ── the book ──
  let el=null, view='list', ed=null, dirty=false, loop=false, msg='';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){ if(el) return; const st=document.createElement('style'); st.textContent=`
#lyreBook{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(8,12,18,.55);font:500 14px var(--f-body,system-ui);color:#f2e2b0}
#lyreBook .lb{width:min(96vw,760px);max-height:94vh;overflow:auto;background:rgba(22,32,46,.96);border:1px solid rgba(242,193,78,.55);border-radius:16px;padding:14px 16px;box-shadow:0 10px 40px rgba(0,0,0,.5)}
#lyreBook h3{margin:0;font:700 19px var(--f-display,serif)}#lyreBook .top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}
#lyreBook button{font:inherit;color:inherit;cursor:pointer;border:1px solid rgba(242,193,78,.45);background:rgba(255,255,255,.06);border-radius:9px;padding:6px 10px}
#lyreBook button.on{background:rgba(242,193,78,.3);border-color:#f2c14e}#lyreBook button.padfocus{outline:2px solid #fff;outline-offset:1px}
#lyreBook .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}#lyreBook .song{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px;border-radius:10px;background:rgba(255,255,255,.04);margin:6px 0}
#lyreBook .song b{flex:1;min-width:140px}#lyreBook .dim{opacity:.7;font-size:12px}#lyreBook input[type=text]{font:inherit;color:#f2e2b0;background:rgba(0,0,0,.3);border:1px solid rgba(242,193,78,.45);border-radius:8px;padding:6px 8px;flex:1;min-width:160px}
#lyreBook .val{min-width:74px;text-align:center;font-weight:700}
#lyreBook .grid{display:grid;grid-template-columns:54px repeat(16,1fr);gap:3px;margin:10px 0;align-items:center}
#lyreBook .grid .lab{font-size:12px;opacity:.85;text-align:right;padding-right:4px;white-space:nowrap}
#lyreBook .grid button{padding:0;height:24px;min-width:0;border-radius:5px;border-color:rgba(242,193,78,.22)}#lyreBook .grid button.b4{border-left-color:rgba(242,193,78,.7)}
#lyreBook .grid button.c.on{background:#d8a43a;border-color:#ffe08a}#lyreBook .grid button.n.on{background:#8fd0c8;border-color:#d8fff8}#lyreBook .grid button.now{box-shadow:0 0 0 2px #fff inset}
#lyreBook .gap{grid-column:1/-1;height:4px}`; document.head.appendChild(st);
    el=document.createElement('div'); el.id='lyreBook'; el.hidden=true; document.body.appendChild(el);
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-a]'); if(!b) return; e.preventDefault(); act(b.dataset.a,b); });
    el.addEventListener('change',e=>{ if(e.target.id==='lbFile'&&e.target.files&&e.target.files[0]){ const f=e.target.files[0]; if(f.size>200000){ msg='That file is too large to be a song.'; draw(); return; } const r=new FileReader(); r.onload=()=>importText(String(r.result)); r.readAsText(f); e.target.value=''; } });
    el.addEventListener('input',e=>{ if(e.target.id==='lbTitle'&&ed){ ed.title=e.target.value.replace(/[\u0000-\u001f<>]/g,'').slice(0,48); dirty=true; } }); }
  function importText(t){ let o=null; try{ o=JSON.parse(t); }catch(e){ msg='That file is not a song.'; draw(); return; } const list=Array.isArray(o)?o:(o&&Array.isArray(o.songs))?o.songs:[o]; let n=0;
    list.slice(0,50).forEach(x=>{ const s=clean(x); if(s){ if(get(s.id)) s.id=blank().id; db.songs.push(s); n++; } }); save(); msg=n?`Brought in ${n} song${n>1?'s':''}.`:'Nothing in that file was a song.'; draw(); }
  function exportSong(s){ const text=JSON.stringify({app:'The Restful Knight — lyre song',v:1,title:s.title,key:s.key,tempo:s.tempo,mood:s.mood,steps:s.steps},null,1);
    try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'application/json'})); a.download=(s.title.replace(/[^\w\- ]+/g,'').trim()||'song')+'.lyre.json'; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); msg='Saved “'+s.title+'” as a file.'; }catch(e){ msg='Could not save a file here.'; }
    try{ navigator.clipboard&&navigator.clipboard.writeText(text); }catch(e){} }
  function draw(){ if(!el) return; let h='<div class="lb">';
    if(view==='list'){ h+=`<div class="top"><h3>📖 Songbook</h3><button class="x" data-a="close" aria-label="Close">✕</button></div><div class="row"><button data-a="new">＋ New song</button><button data-a="import">⬆ Bring in a song file</button><input id="lbFile" type="file" accept=".json,application/json" hidden></div>`;
      if(msg) h+=`<div class="dim">${esc(msg)}</div>`;
      const list=db.songs.slice().sort((a,b)=>(b.fav-a.fav)||(b.modified-a.modified));
      if(!list.length) h+=`<p class="dim">No songs yet. Start a new one — four chords and eight strings over sixteen steps. Nothing here is for winning anything; it is only for making music.</p>`;
      list.forEach(s=>{ const pl=P&&P.song.id===s.id; h+=`<div class="song"><b>${s.fav?'★ ':''}${esc(s.title)}</b><span class="dim">${LYRE.keyName(s.key)} · ${s.tempo} · ${MOODS[s.mood].name}</span>`
        +`<button data-a="play:${s.id}" class="${pl?'on':''}">${pl?'■ Stop':'▶ Play'}</button><button data-a="edit:${s.id}">✎ Edit</button><button data-a="fav:${s.id}">${s.fav?'★':'☆'}</button><button data-a="dup:${s.id}">⧉ Copy</button><button data-a="exp:${s.id}">⬇ File</button><button data-a="del:${s.id}">${b_del===s.id?'Sure? 🗑':'🗑'}</button></div>`; }); }
    else { const s=ed, pl=!!P;
      h+=`<div class="top"><h3>✎ Songwriter</h3><button class="x" data-a="back" aria-label="Back to the songbook">✕</button></div>`
        +`<div class="row"><input id="lbTitle" type="text" maxlength="48" value="${esc(s.title)}" aria-label="Song title"></div>`
        +`<div class="row"><span class="dim">Key</span><button data-a="k-">◂</button><span class="val">${LYRE.keyName(s.key)}</span><button data-a="k+">▸</button><span class="dim">Tempo</span><button data-a="t-">◂</button><span class="val">${s.tempo}</span><button data-a="t+">▸</button></div>`
        +`<div class="row"><span class="dim">Mood</span>`+Object.keys(MOODS).map(k=>`<button data-a="mood:${k}" class="${s.mood===k?'on':''}">${MOODS[k].name}</button>`).join('')+`</div>`
        +`<div class="row"><button data-a="pl" class="${pl?'on':''}">${pl?'■ Stop':'▶ Play'}</button><button data-a="loop" class="${loop?'on':''}">🔁 Loop</button><button data-a="save">💾 Save${dirty?' •':''}</button><button data-a="clear">${b_clear?'Sure? Clear':'Clear'}</button></div>`;
      if(msg) h+=`<div class="dim">${esc(msg)}</div>`;
      h+='<div class="grid">'; for(let c=0;c<4;c++){ h+=`<span class="lab">${esc(LYRE.slotName(c,s.key))}</span>`; for(let i=0;i<STEPS;i++) h+=`<button class="c ${i%4===0?'b4':''} ${s.steps[i].c===c?'on':''}" data-a="c:${c}:${i}" data-st="${i}" aria-label="${esc(LYRE.slotName(c,s.key))} at step ${i+1}"></button>`; }
      h+='<span class="gap"></span>'; for(let n=NS-1;n>=0;n--){ h+=`<span class="lab">string ${n+1}</span>`; for(let i=0;i<STEPS;i++) h+=`<button class="n ${i%4===0?'b4':''} ${s.steps[i].m[n]?'on':''}" data-a="n:${n}:${i}" data-st="${i}" aria-label="String ${n+1} at step ${i+1}"></button>`; }
      h+='</div><div class="dim">Gold rows are the four chords (one a step); the rest are the eight strings, low to high. Tap a square to set it and hear it.</div>'; }
    el.innerHTML=h+'</div>'; }
  let b_del=null, b_clear=false;
  const onStep=i=>{ if(!el||el.hidden||view!=='edit') return; el.querySelectorAll('.grid button.now').forEach(b=>b.classList.remove('now')); if(i>=0) el.querySelectorAll('.grid button[data-st="'+i+'"]').forEach(b=>b.classList.add('now')); };
  function act(a,btn){ const [k,x,y]=a.split(':'); msg=''; const keepDel=k==='del', keepClr=k==='clear'; if(!keepDel) b_del=null; if(!keepClr) b_clear=false;
    if(k==='close'){ close(); return; }
    if(k==='new'){ ed=blank(); dirty=true; view='edit'; }
    else if(k==='import'){ const f=document.getElementById('lbFile'); if(f) f.click(); return; }
    else if(k==='edit'){ const s=get(x); if(s){ stop(); ed=clean(s); dirty=false; view='edit'; } }
    else if(k==='play'){ const s=get(x); if(P&&P.song.id===x) stop(); else if(s) play(s,{onEnd:()=>draw()}); }
    else if(k==='fav'){ const s=get(x); if(s){ s.fav=!s.fav; save(); } }
    else if(k==='dup'){ const s=get(x); if(s){ const c=clean(s); c.id=blank().id; c.title=(s.title+' (copy)').slice(0,48); c.created=c.modified=Date.now(); c.fav=false; db.songs.push(c); save(); } }
    else if(k==='exp'){ const s=get(x); if(s) exportSong(s); }
    else if(k==='del'){ if(b_del===x){ if(P&&P.song.id===x) stop(); db.songs=db.songs.filter(s=>s.id!==x); for(const b in db.bards) db.bards[b]=db.bards[b].filter(i=>i!==x); save(); b_del=null; } else b_del=x; }
    else if(k==='back'){ if(dirty&&!b_back){ b_back=true; msg='Not saved yet — ✕ again to leave it, or 💾 Save.'; draw(); return; } b_back=false; stop(); view='list'; ed=null; }
    else if(ed){ const live=()=>{ if(P){ P.song=ed; } };
      if(k==='k-'||k==='k+'){ ed.key=Math.max(-6,Math.min(6,ed.key+(k==='k+'?1:-1))); dirty=true; live(); }
      else if(k==='t-'||k==='t+'){ ed.tempo=Math.max(60,Math.min(160,ed.tempo+(k==='t+'?4:-4))); dirty=true; if(P){ const lp=P.loop; play(ed,{loop:lp,onStep,onEnd:()=>draw()}); } }
      else if(k==='mood'){ ed.mood=x; ed.tempo=MOODS[x].tempo; dirty=true; if(P) play(ed,{loop,onStep,onEnd:()=>draw()}); }
      else if(k==='pl'){ if(P) stop(); else play(ed,{loop,onStep,onEnd:()=>draw()}); }
      else if(k==='loop'){ loop=!loop; if(P) P.loop=loop; }
      else if(k==='save'){ ed.modified=Date.now(); const i=db.songs.findIndex(s=>s.id===ed.id); const c=clean(ed); if(i>=0) db.songs[i]=c; else db.songs.push(c); dirty=!save(); msg=dirty?'Could not save on this device.':'Saved.'; }
      else if(k==='clear'){ if(b_clear){ ed.steps.forEach(s=>{ s.c=-1; s.m.fill(false); }); dirty=true; b_clear=false; } else b_clear=true; }
      else if(k==='c'){ const st=ed.steps[+y]; st.c=st.c===+x?-1:+x; dirty=true; const c=LYRE.ctx(); if(st.c>=0&&c&&!P) LYRE.chordAt(st.c,ed.key,c.currentTime,0.85); btn.parentNode.querySelectorAll('button.c[data-st="'+y+'"]').forEach(b=>b.classList.toggle('on',b===btn&&st.c>=0)); return; }
      else if(k==='n'){ const st=ed.steps[+y]; st.m[+x]=!st.m[+x]; dirty=true; const c=LYRE.ctx(); if(st.m[+x]&&c&&!P) LYRE.noteAt(+x,ed.key,c.currentTime,0.85); btn.classList.toggle('on',st.m[+x]); return; } }
    if(k!=='back') b_back=false; draw(); }
  let b_back=false;
  function open(){ mount(); view='list'; ed=null; msg=''; b_del=null; el.hidden=false; draw(); }
  function close(){ if(!el||el.hidden) return; stop(); el.hidden=true; }
  // keys: nothing typed in the book reaches the game; Esc (or Ⓑ on the pad) steps back
  addEventListener('keydown',e=>{ if(!el||el.hidden) return; const k=(e.key||'').toLowerCase(); e.stopImmediatePropagation(); if(k==='escape'){ e.preventDefault(); if(view==='edit') act('back'); else close(); } },true);
  addEventListener('keyup',e=>{ if(el&&!el.hidden) e.stopImmediatePropagation(); },true);
  // ── V217: the bards. An inn's bard knows only what you have taught him (kept with the songs, by the inn's own id).
  //  Ask, and he plays it on these same strings, swaying as he plays; left alone he goes on through what he knows, a
  //  short rest between songs, for as long as you stay in the room. Leave, or ask him to stop, and the music stops at once.
  let gig=null;
  const bardOf=lv=>lv&&lv.folk&&lv.folk.find(f=>f.who==='Bard');
  function gigStop(){ if(!gig) return; const g=gig; gig=null; clearTimeout(g.wait); cancelAnimationFrame(g.raf); if(g.f&&g.f.g){ g.f.g.rotation.z=0; g.f.g.position.y=g.y0; } stop(); }
  function perform(lv,id,auto){ const s=get(id); if(!s) return false; gigStop(); const f=bardOf(lv), g=gig={lv,f,y0:f&&f.g?f.g.position.y:0,wait:0,raf:0};
    const sway=()=>{ if(gig!==g) return; g.raf=requestAnimationFrame(sway); if(typeof ENGINE!=='undefined'&&ENGINE.level!==lv){ gigStop(); return; } if(f&&f.g&&P){ const t=performance.now()/1000, b=60/s.tempo; f.g.rotation.z=Math.sin(t*Math.PI/b)*0.05; f.g.position.y=g.y0+Math.abs(Math.sin(t*Math.PI/b))*0.02; } };
    const ok=play(s,{onEnd:done=>{ if(gig!==g) return; if(f&&f.g){ f.g.rotation.z=0; f.g.position.y=g.y0; } if(!done){ gig=null; cancelAnimationFrame(g.raf); return; }
      const rep=bard(lv.id); if(!rep.length){ gigStop(); return; } const nx=rep[(rep.indexOf(id)+1)%rep.length]; g.wait=setTimeout(()=>{ if(gig===g&&ENGINE.level===lv) perform(lv,nx,true); else gigStop(); },5200); }});
    if(!ok){ gig=null; return false; } sway(); if(!auto&&typeof UI!=='undefined') UI.toast('🎵 The bard plays “'+s.title+'”.',1800); return true; }
  const bard=id=>(db.bards[id]||[]).filter(x=>get(x));
  const owned=()=>{ try{ const S=GAME.S; return !!(S&&(S.lyre||(S.tutorial&&S.tutorial.done))); }catch(e){ return false; } };
  function bardMenu(lv,hymn){ if(typeof UI==='undefined'||!UI.sheet){ hymn&&hymn(); return; } const id=lv.id, rep=bard(id), has=owned(), mine=db.songs.filter(x=>!rep.includes(x.id));
    let h='<p class="gm-intro">'+(has?(rep.length?'“I know '+rep.length+' of yours now. Shall I play one — or have you another to teach me?”':'“You carry a lyre! Teach me one of your songs, and this room will hear it long after you have gone.”'):'“A hymn for the road, friend?”')+'</p>';
    if(gig&&gig.lv===lv) h+='<button class="gm-item" data-act="stop"><span>■ Enough for now</span></button>';
    h+='<button class="gm-item" data-act="hymn"><span>🎶 Sing a hymn</span></button>';
    if(has){ if(rep.length){ h+='<div class="gm-sec">Ask to hear a song</div>'; rep.forEach(x=>{ const s=get(x); h+='<button class="gm-item" data-act="hear:'+x+'"><span>▶ '+esc(s.title)+' <span class="ds">'+LYRE.keyName(s.key)+' · '+MOODS[s.mood].name+'</span></span></button>'; }); }
      h+='<div class="gm-sec">Teach a song</div>'; if(!db.songs.length) h+='<p class="gm-hint">You have written no songs yet. Take out the lyre (🎵) and open 📖 Songs to write one.</p>'; else if(!mine.length) h+='<p class="gm-hint">He knows every song in your book.</p>';
      mine.forEach(s=>{ h+='<button class="gm-item" data-act="teach:'+s.id+'"><span>📜 '+esc(s.title)+'</span></button>'; });
      if(rep.length){ h+='<div class="gm-sec">Ask him to forget one</div>'; rep.forEach(x=>{ h+='<button class="gm-item" data-act="forget:'+x+'"><span>✕ '+esc(get(x).title)+'</span></button>'; }); } }
    UI.sheet({title:'🎵 The bard',html:h,act:a=>{ const [k,x]=a.split(':');
      if(k==='hymn'){ gigStop(); UI.close(); hymn&&hymn(); } else if(k==='stop'){ gigStop(); UI.close(); }
      else if(k==='hear'){ UI.close(); perform(lv,x); }
      else if(k==='teach'){ const r=db.bards[id]=db.bards[id]||[]; if(get(x)&&!r.includes(x)) r.push(x); save(); UI.toast('🎵 “'+get(x).title+'” — he has it by heart.',1800); bardMenu(lv,hymn); }
      else if(k==='forget'){ if(db.bards[id]) db.bards[id]=db.bards[id].filter(y=>y!==x); save(); if(P&&P.song.id===x) gigStop(); bardMenu(lv,hymn); } }}); }
  return { bardMenu, perform, gigStop, owned, open, close, play, stop, get, songs:()=>db.songs.slice(), get isOpen(){ return !!el&&!el.hidden; }, get playing(){ return P?P.song:null; }, bard, teach(id,songId){ if(!get(songId)) return false; const r=db.bards[id]=db.bards[id]||[]; if(!r.includes(songId)) r.push(songId); return save(); }, forget(id,songId){ if(db.bards[id]) db.bards[id]=db.bards[id].filter(x=>x!==songId); save(); }, MOODS };
})();
try{ window.LYREBOOK=LYREBOOK; }catch(e){}
