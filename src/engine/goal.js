// ════════════════════════════════════════════════════════════════
//  ➤ THE NEXT GOAL — a 3D-only help (the 2D game has none): one line under the place plate saying what the story
//  asks of you now, and in the realm a gold star on the minimap where it waits (with the rim arrow when it's out of
//  view, as the hunt's quarry has). Read straight off the save, so it is never out of step:
//   Tobias's lessons → the next chapel in order → Abaddon in the Hellgate keep → Sir Aldric at the farmhouse →
//   the Demon Hunt → the hooded strangers and the lists → the Pretender on Abaddon's throne → the three portals
//   (each world's own progress; inside one, follow its golden trail) → home with Madison → the realm is yours.
//  Hide it from ☰ System if you'd rather find your own way (S.goalOff).
//  goalSystem(world, {portals}) → { now() → {text, at:[x,y]|null} }
// ════════════════════════════════════════════════════════════════
const GOAL_API={cur:null};
function goalSystem(world,opt){
  const S=()=>GAME.S, T=n=>{ const t=(SYS.MAP.towns||[]).find(q=>q[0]===n); return t?[t[1]+0.5,t[2]+0.5]:null; };
  const el=document.createElement('div'); el.id='goal'; el.setAttribute('aria-live','polite');
  el.style.cssText='margin-top:5px;font:700 12px var(--f-body);color:#f3ead6;line-height:1.3;display:flex;gap:5px;align-items:flex-start';
  const plate=document.querySelector('.plate'); if(plate) plate.appendChild(el);
  const gate=id=>{ const P=opt&&opt.portals; const g=P&&P.gates&&P.gates.find(q=>q.pr.id===id); return g?[g.pr.tx+0.5,g.pr.ty+0.5]:null; };
  const pst=id=>(S().portals||{})[id]||{};
  function now(){ const s=S(), b=s.bounties||{}, lv=ENGINE.level, h=s.hunt;
    if(lv&&lv.id&&lv.id.indexOf('pw:')===0){ const id=lv.id.slice(3);
      if(id==='mistral'){ const v=(s.mistral&&s.mistral.villages)||{}, n=Object.values(v).filter(q=>q.cleared).length;
        return {text:n<5?`Free the folds of Mistral — ${n} of 5 cleansed. Follow the golden trail.`:(s.mistral&&s.mistral.throne&&s.mistral.throne.purified)?'Mistral is free. Take the arch home.':'All five folds cleansed — the castle gate stands open in the north.'}; }
      if(id==='tabor'){ const t=s.tabor||{}, r=t.rescues||{}, n=Object.values(r).filter(q=>q.done).length;
        return {text:t.thawed?'Tabor lives. Meet the five you woke, then take the arch home.':n<5?`Warm the frozen hearts of Tabor — ${n} of 5. Follow the golden trail.`:'Every heart is warm. Climb to Eden’s spring at the summit.'}; }
      if(id==='sunfall'){ const f=s.sunfall||{}, all=((typeof PORTAL_WORLDS!=='undefined'&&PORTAL_WORLDS.sunfall&&PORTAL_WORLDS.sunfall.lamps)||[]).length, lit=Object.values(f.lamps||{}).filter(q=>q.lit).length;
        return {text:s.homecoming?'Sunfall’s sun has set. The realm is at peace.':f.rescued?'Walk Madison home — back through the arch.':all&&lit>=all?'Every lamp burns. Climb Vesper’s cathedral to the Pretender.':`Light Sunfall’s lamps${all?` — ${lit} of ${all}`:''}, ring by ring. Follow the golden trail.`}; }
      return {text:'Follow the golden trail.'}; }
    if(s.tutorial&&!s.tutorial.done) return {text:'Speak with Tobias — he has more to teach you.',at:T('Hearthvale')};
    if((s.chapels|0)<10){ const td=SYS.TOWN_DATA[s.chapels|0], ch=s.chapels|0;
      /* V149: a chapel entered from its catacombs: the goal follows you down */
      if(typeof CATACOMB!=='undefined'&&CATACOMB.has(ch)){ const c=(s.cata&&s.cata[ch])||{}, m=CATACOMB.mouthOf?CATACOMB.mouthOf(ch):CATACOMB.mouth, at=m?[m.x,m.z]:T(td.name), inC=lv&&/^cata/.test(lv.id||'');
        const tx=CATACOMB.cfg(ch).goal(c,inC,td);
        return inC?{text:tx}:{text:tx,at}; }
      return {text:`Cleanse ${td.name}’s chapel — ${td.general} is bound within.`,at:T(td.name)}; }
    if(!s.abaddonWon) return {text:'Every chapel stands. Face Abaddon in the Hellgate keep.',at:T('Hellgate')};
    // V118: Mario's letter — the Scholar's Way, north of Hearthvale, until you reach his tower
    if(s.school&&s.school.invited&&!s.school.met&&typeof SX==='function') return {text:'Mario’s letter: climb the Scholar’s Way, north of Hearthvale, to his tower school.',at:[SX(45.5),SY(3.5)]};
    if(b.madisonTaken&&!b.madisonRescued){ const m=pst('mistral'), t=pst('tabor'), f=pst('sunfall');
      if(!m.cleared) return {text:'Madison is taken. Pass through the Mistral Gate after her.',at:gate('mistral')};
      if(!t.cleared) return {text:'Through the gate to Mount Tabor — the trail runs on.',at:gate('tabor')};
      return {text:'Sunfall: the Pretender holds Madison in the city of the setting sun.',at:gate('sunfall')}; }
    if(b.madisonRescued&&!s.homecoming) return {text:'Bring Madison home to King Karl’s keep in Stormgate.',at:T('Stormgate')};
    if(!h||(!h.active&&!h.done)) return {text:'Sir Aldric waits for you at the family farmhouse.',at:T('Homestead')};
    if(h.active&&!h.done){ const n=(h.remaining||[]).reduce((a,c)=>a+c,0); return {text:`Sir Aldric’s Demon Hunt — ${n} demon${n===1?'':'s'} still roam (violet on the map).`}; }
    if(b.pretenderUnlocked&&!b.pretenderDefeated) return {text:'Someone sits on Abaddon’s throne. Go to the Hellgate keep.',at:T('Hellgate')};
    if(s.homecoming) return {text:'The realm is yours — tourneys, bounties, the deep and the trade roads await.'};
    return {text:'The roads are at peace. Hooded strangers in the inns have work; the keeps hold tournaments.'}; }
  let last='', t0=0;
  function draw(){ const s=S(), off=!!s.goalOff||!ENGINE.level||!!ENGINE.level.custom; el.style.display=off?'none':'flex'; if(off) return;
    const g=now(), txt=g?g.text:''; if(txt!==last){ last=txt; el.innerHTML=txt?`<span style="color:#f2c14e">➤</span><span>${UI.esc(txt)}</span>`:''; } }
  const tick=t=>{ if(t-t0<0.4) return; t0=t; draw(); };
  world.anim.push(tick); setInterval(()=>draw(),900);
  return { now, pin:()=>{ const s=S(); if(s.goalOff||ENGINE.level!==world) return null; const g=now(); return g&&g.at?{x:g.at[0],y:g.at[1],col:'#ffd84a',r:4.5,seek:'goal'}:null; } };
}
