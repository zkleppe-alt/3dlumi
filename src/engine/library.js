// ════════════════════════════════════════════════════════════════
//  THE LIBRARY, THE CODEX AND THE WARDROBE (data/pastimes.json → library)
//   📚 Ezra the Scribe, in every cleansed sanctuary, opens the town's library (openLibrary): study the DEEP_DOCTRINE
//      of any town you have cleansed (◀ ▶), or browse its progression wares (LIBRARY_WARES — a suit sold as its
//      pieces — at LIBRARY_PRICE, only what you don't own yet). Tap a ware, tap again to buy.
//   📖 The codex (codexAdd / codexPages): every scripture you stand and read on the road is written up, in the
//      order you met it (S.codex.seen), and read at the lectern on the top floor of your house (HS_LECTERN).
//   🧥 The wardrobe glass beside it (HS_WARDROBE) puts on the next livery you have earned.
//  LIBRARY → { open(town), codexAdd(where,ref,text), codexPages(), wardrobe(), owned(S,k) }
// ════════════════════════════════════════════════════════════════
function liveryOwned(S,k){ const L=SYS.LIVERIES[k]; if(!L) return false; if(k==='azure') return true;
  const FL={stormward:S.stormward,fallen:S.fallenPlate,robby:S.robbysDemise,champion:S.championRobe,glory:S.ownedGear&&S.ownedGear.armor_michael,
    ranger:S.roadRogues&&S.roadRogues.jailed,deepwater:S.uw&&S.uw.livery,homecoming:S.homecoming};
  return L.flag?!!FL[L.flag]:(L.req>0&&(S.tradeSold||0)>=L.req); }
const LIBRARY=(function(){
  const E=UI.esc, D=()=>(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.library)||null;
  const strip=h=>String(h).replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'');
  // ── the codex ──
  const cx=()=>{ const S=GAME.S; return S.codex||(S.codex={seen:[]}); };
  function codexAdd(where,ref,text){ if(!ref) return; const c=cx(); if(c.seen.some(e=>e.ref===ref)) return; c.seen.push({where:where||'',ref,text:text||''});
    UI.toast(`📖 Written into your codex: ${ref}`,1800); GAME.save(); }
  function codexPages(){ const c=cx(); if(!c.seen.length) return ['Empty shelves, and a good lamp. Every scripture you stand and read on the road will be written up here, in the order you met it.'];
    return c.seen.map((e,i)=>`✧ ${e.ref}${e.where?' — '+e.where:''} (${i+1}/${c.seen.length})\n“${e.text}”`); }
  // ── the wardrobe glass ──
  function wardrobe(){ const S=GAME.S, all=Object.keys(SYS.LIVERIES), have=all.filter(k=>liveryOwned(S,k)), i=have.indexOf(S.livery), next=have[(i+1)%have.length];
    S.livery=next; GAME.changed(); GAME.save(); const L=SYS.LIVERIES[next], locked=all.filter(k=>!liveryOwned(S,k)&&k!=='deepwater');
    ENGINE.speak('The wardrobe glass',[`🧥 ${L.name} — ${L.note||''}`,`${have.length} of ${all.length} liveries · 🌾 ${S.tradeSold||0} goods traded.`+(locked.length?`\nStill to earn: ${locked.map(k=>SYS.LIVERIES[k].name+' ('+SYS.LIVERIES[k].note+')').join(' · ')}`:'\nEvery livery earned.')]); }
  // ── the library ──
  function open(town){ const L=D(); if(!L){ ENGINE.speak('Ezra the Scribe',['The doctrine you have won is kept here.']); return; }
    const S=GAME.S, td=SYS.TOWN_DATA[town]||{name:'The'}, studyable=()=>SYS.TOWN_DATA.map((t,i)=>i).filter(i=>i<S.chapels);
    let doc=town, view='study', sel=-1, msg='';
    const draw=()=>{ const st=studyable(); if(!st.includes(doc)) doc=st.includes(town)?town:st[0]; let h='';
      if(view==='study'){ const cur=L.doctrine[doc]; if(!cur){ UI.close(); return; }
        h+=`<p class="gm-intro">Ezra the Scribe keeps these shelves. The town is cleansed; its library is open — study the doctrine you've mastered.</p>`
          +`<div style="display:flex;gap:6px;align-items:center"><button class="gm-item" style="flex:0 0 44px;justify-content:center" data-act="nav:-1">◀</button><div class="gm-sec" style="flex:1;text-align:center;margin:0">${E(strip(cur.head))}</div><button class="gm-item" style="flex:0 0 44px;justify-content:center" data-act="nav:1">▶</button></div>`;
        cur.points.forEach(p=>{ const c=p.indexOf(':'), term=c>0&&c<40?p.slice(0,c):'', body=term?p.slice(c+1):p; h+=`<p class="gm-intro" style="margin:6px 2px">${term?`<b style="color:var(--gold)">${E(strip(term))}:</b>`:''}${E(strip(body))}</p>`; });
        h+=`<button class="gm-item" data-act="wares"><span>📜 Browse progression wares <span class="ds">rare gear for gold</span></span></button><p class="gm-hint">◀ ▶ doctrine (${st.indexOf(doc)+1}/${st.length})</p>`; }
      else { const items=(L.wares[town]||[]).filter(id=>!S.ownedGear[id]&&SYS.EQUIP[id]);
        if(!items.length){ view='study'; msg=''; UI.toast('📜 The librarian has no new wares for you — study on, knight.',1800); draw(); return; }
        h+=`<p class="gm-intro">Ezra: “Deeper towns, stronger wares.” <b style="color:var(--gold)">You have ${S.gold}g.</b></p>`+(msg?`<p class="gm-note">${E(msg)}</p>`:'');
        items.forEach((id,i)=>{ const e=SYS.EQUIP[id], pr=L.price[id]||100; h+=`<button class="gm-item ${i===sel?'worn':''}" data-act="pick:${id}:${i}"><span>${e.emoji} ${E(e.name)} — <b style="color:var(--gold)">${pr}g</b> <span class="ds">${e.slot==='weapon'?`[${e.type}] +${e.atk} atk`:`+${e.def} def`}</span></span><i>${i===sel?'tap to buy':''}</i></button>`; });
        h+=`<button class="gm-item" data-act="back"><span>📚 Back to study</span></button>`; }
      UI.sheet({title:`📚 ${td.name} Library`,html:h,keepScroll:true,act:a=>{ const [k,v,ix]=a.split(':');
        if(k==='nav'){ const st=studyable(); let j=st.indexOf(doc); j=(j+(+v)+st.length)%st.length; doc=st[j]; }
        else if(k==='wares'){ view='wares'; sel=-1; msg=''; } else if(k==='back'){ view='study'; }
        else if(k==='pick'){ if(+ix!==sel){ sel=+ix; msg=''; } else { const e=SYS.EQUIP[v], pr=L.price[v]||100;
            if(S.gold<pr) msg='Not enough gold.'; else { S.gold-=pr; S.ownedGear[v]=true; sel=-1; msg=`Bought ${e.emoji} ${e.name}! Equip it in ☰.`; GAME.changed(); GAME.save(); } } }
        draw(); }}); };
    if(!studyable().length){ ENGINE.speak('Ezra the Scribe',['The shelves wait for a cleansed town.']); return; }
    draw(); }
  return { open, codexAdd, codexPages, wardrobe, owned:liveryOwned };
})();
