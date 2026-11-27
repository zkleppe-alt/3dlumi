// ════════════════════════════════════════════════════════════════
//  VANQUISH (V290) — the war table in Ironhold Keep. "Plan the campaign" opens Vanquish, a chess-like strategy game by
//  theoriginalkarl (a friend of Zak's, included with permission; games/vanquish/index.html, the itch.io build unmodified),
//  full screen in a frame over the game. The knight stands still, the realm's sound hushes, and "Leave the table" closes it.
//  Vanquish keeps its own saves (vq-* in this site's storage) and its own online play.
//    VANQUISH.open()  ·  VANQUISH.close()  ·  VANQUISH.isOpen()
// ════════════════════════════════════════════════════════════════
const VANQUISH=(()=>{
  let box=null, holdI=null, vol0=null;
  function close(){ if(!box) return; box.remove(); box=null; clearInterval(holdI); holdI=null;
    try{ const m=AUDIO2D.audio.master; if(m&&vol0!==null) m.gain.setTargetAtTime(vol0,AUDIO2D.audio.ctx.currentTime,0.2); }catch(e){} vol0=null; try{ window.focus(); }catch(e){} }
  function open(){ if(box) return;
    box=document.createElement('div'); box.id='vqBox';
    box.style.cssText='position:fixed;inset:0;z-index:9000;background:#120e0a;display:flex;flex-direction:column';
    const f=document.createElement('iframe'); f.src='games/vanquish/index.html'; f.title='Vanquish'; f.allow='fullscreen';
    f.style.cssText='flex:1;width:100%;border:0;background:#120e0a';
    const bar=document.createElement('div'); bar.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 12px;background:#1c1610;border-top:1px solid #4a3a24;color:#d8c8a0;font:13px/1.2 Georgia,serif';
    const who=document.createElement('span'); who.textContent='⚔ The war table, Ironhold Keep — Vanquish, by theoriginalkarl';
    const x=document.createElement('button'); x.textContent='✕ Leave the table'; x.style.cssText='background:#7a1c1c;color:#f4e8d0;border:1px solid #c0a060;border-radius:6px;padding:6px 14px;font:600 14px Georgia,serif;cursor:pointer';
    x.onclick=close; bar.append(who,x); box.append(f,bar); document.body.appendChild(box);
    // stand at the table while it's open; the hall's music hushes
    try{ ENGINE.hold&&ENGINE.hold(1); holdI=setInterval(()=>{ try{ ENGINE.hold&&ENGINE.hold(1); }catch(e){} },500); }catch(e){}
    try{ const m=AUDIO2D.audio.master; if(m){ vol0=m.gain.value; m.gain.setTargetAtTime(0,AUDIO2D.audio.ctx.currentTime,0.15); } }catch(e){}   // the realm hushes (not saved to the volume settings)
    setTimeout(()=>{ try{ f.focus(); }catch(e){} },300); }
  window.addEventListener('keydown',e=>{ if(box&&e.key==='Escape'){ e.stopImmediatePropagation(); close(); } },true);
  return {open,close,isOpen:()=>!!box};
})();
