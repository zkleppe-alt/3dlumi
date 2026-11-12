// ════════════════════════════════════════════════════════════════
//  DIALOGUE — what everyone says as the story moves on (tools/extract_dialogue.py → data/dialogue.json).
//  The game rewrites its lines with the story (STORY_SWAPS, kingSpeak, tobiasAfterLines, showIf …); the extractor
//  speaks to every NPC at fifteen points in it and keeps the runs. A save's stage:
//    c0…c10 chapels cleansed · won (Abaddon fallen) · hunt (the Demon Hunt done) · pret (the Pretender on the
//    throne) · taken (Madison taken)
//  DIALOGUE.lines(key) → {who, lines} | null · DIALOGUE.present(key) → bool · DIALOGUE.sign(key) → text | null
//  Keys: '<interior>:<floor>:<x>,<y>' for indoor folk, 'v:<x>,<y>:<outfit>' for villagers, 'king' for the throne.
// ════════════════════════════════════════════════════════════════
const DIALOGUE=(function(){ const D=(typeof DIALOGUE_DATA!=='undefined')?DIALOGUE_DATA:null;
  function stage(){ const s=GAME.S, b=s.bounties||{};
    if(b.madisonTaken&&!b.madisonRescued) return 'taken'; if(b.pretenderUnlocked&&!b.pretenderDefeated) return 'pret';
    if(s.hunt&&s.hunt.done) return 'hunt'; if(s.abaddonWon) return 'won'; return 'c'+Math.min(10,s.chapels|0); }
  const run=(runs)=>{ if(!runs) return undefined; const st=stage(); const r=runs.find(q=>q[0].includes(st)); return r?r[1]:null; };
  function lines(key){ if(!D||!key) return null; const v=run(key==='king'?D.king.map(r=>[r[0],{say:r[1]}]):D.npcs[key]); if(!v||!v.say||v.say.menu||v.say.err||!v.say.lines||!v.say.lines.length||!v.say.lines.join('').trim()) return null;
    return {who:v.say.who||v.name||'',lines:v.say.lines}; }
  function present(key){ if(!D||!key||key==='king'||!D.npcs[key]) return true; return run(D.npcs[key])!==null; }
  function sign(key){ if(!D||!D.signs[key]) return null; return run(D.signs[key]); }
  // NPCs the story brings in later (the marshals at the keeps after the hunt …) that the base map doesn't hold
  function extras(prefix){ if(!D) return []; return Object.keys(D.npcs).filter(k=>k.indexOf(prefix)===0).map(k=>({key:k,runs:D.npcs[k]})); }
  return { stage, lines, present, sign, extras, tobias:D&&D.tobias };
})();
