// ════════════════════════════════════════════════════════════════
//  THE DEMON HUNT — after Abaddon falls (S.abaddonWon), the game's hunt: initHuntRoster gives every encounter
//  zone 5 stragglers (S.hunt.remaining[zi]); demons killed are struck off and do not come back. Sir Aldric
//  waits in the Family Farmhouse: the first word starts the hunt (S.hunt.active), then he counts what is left.
//  When the last falls: hunt.done, the roads are at peace (no wild demons), the tournaments open, and the
//  supply wagon comes out at the Homestead (S.wagon.unlocked, unlockWagonIfReady).
//  Night demons (isNight: 9 PM to 6 AM) come out NIGHT_LVL_BOOST levels bolder, as in the game.
//  huntSystem(world, zones) → { count(zi), onKill(d), start(), left(), night(), aldric(f) }
// ════════════════════════════════════════════════════════════════
function huntSystem(world,zones){
  const S=()=>GAME.S, BOOST=2;
  const H=()=>S().hunt||null;
  function start(){ const s=S(); s.hunt={active:false,done:false,killed:0,remaining:zones.map(()=>5)}; s.hunt.total=s.hunt.remaining.reduce((a,b)=>a+b,0); }
  const left=()=>{ const h=H(); return h?h.remaining.reduce((a,b)=>a+b,0):0; };
  function count(zi){ const s=S(); if(!s.abaddonWon) return 5; if(!H()) start(); const h=H(); return h.done?0:(h.remaining[zi]||0); }
  function onKill(d){ const s=S(), h=H(); if(!s.abaddonWon||!h||h.done||typeof d.zi!=='number') return;
    if(h.remaining[d.zi]>0) h.remaining[d.zi]--; h.killed++; const n=left();
    if(n<=0){ h.done=true; h.active=false; GAME.save();
      UI.toast('🏆 The last wandering demon falls! Word spreads through the realm — the keeps prepare KNIGHT TOURNAMENTS in your honor.',4600);
      setTimeout(()=>{ if(!s.wagon) s.wagon={}; if(!s.wagon.unlocked){ s.wagon.unlocked=true; GAME.save();
        UI.toast('🛒 The roads are at peace — the trade roads open! Take contracts at the board by the farm stand, buy each town’s goods from its shopkeeper, and haul them in the Old Mule’s cart.',5600); } },4800); }
    else if(h.active) UI.toast(`⚔ Demon Hunt: ${n} remain`,1200);
    GAME.save(); }
  const night=()=>{ const f=S().dayFrac; return f>=0.875||f<0.25; };
  // night falls and lifts: the demons out there change with it (applyNightDemons)
  let wasNight=null;
  world.anim.push(()=>{ if(ENGINE.level!==world||!world.combat) return; const n=night(); if(n===wasNight) return; wasNight=n;
    world.combat.foes.forEach(d=>{ if(!d.alive||d.boss) return; if(n&&!d.nightBuff){ d.nightBuff=true; d.level+=BOOST; } else if(!n&&d.nightBuff){ d.nightBuff=false; d.level-=BOOST; } else return;
      const r=d.hp/d.maxHp; d.maxHp=5+d.level*2; d.hp=Math.max(1,Math.round(d.maxHp*r)); d.xp=4+d.level*3; COMBAT.nightify(d,n); }); });   // and they change shape
  // Sir Aldric, home at last (hidden until Abaddon falls: he was the Destroyer's prisoner)
  function aldric(f){ f.label='Talk'; f.lines=null;
    f.action=()=>{ const s=S(); if(!H()) start(); const h=H();
      if(h.done) ENGINE.speak('Sir Aldric',['You have cleansed the roads, my child. The keeps sound their trumpets — go, and let the realm see its champion.'],f);
      else if(!h.active){ h.active=true; GAME.save(); ENGINE.speak('Sir Aldric',['I opened the gate with my own hands. Fifteen years it stood barred against the dark.','The fall of Abaddon broke the chains that held me.',`But his stragglers still haunt the wilds — ${left()} demons remain. Hunt them all, and the keeps will honor you with tournaments.`],f); }
      else ENGINE.speak('Sir Aldric',[`${left()} demons still roam. Steel and faith, my child.`],f); }; }
  return { count, onKill, start, left, night, aldric, get state(){ return H(); }, BOOST };
}
