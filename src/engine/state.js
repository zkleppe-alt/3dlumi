// ════════════════════════════════════════════════════════════════
//  STATE — the save: KLK's player, gold, inventory, gear, skills, pet and records,
//  with the game's own rules (recalcStats, gainXp, xpForLevel, canBuySkill, potions).
//  SYS is data/systems.json (tools/extract_systems.py). Saves live in this browser.
// ════════════════════════════════════════════════════════════════
const GAME=(function(){
  const SLOTS=3, KEY='klk3d_slot_', ACTIVE='klk3d_active';
  const STR=(typeof STRETCH!=='undefined'&&STRETCH)||{x:[],y:[]};
  const STRV=Math.max(0,...STR.x.map(s=>s[2]||1),...STR.y.map(s=>s[2]||1));
  const xpForLevel=lv=>Math.floor(20+7*lv*lv);
  function fresh(){ const p=SYS.player;   // the game's new-game knight, field for field
    return { v:1, stretchV:STRV, treeV:2, name:p.name||'Knight', level:1, xp:0, xpNext:p.xpNext||20, hp:p.maxHp, maxHp:p.maxHp,
      baseMaxHp:p.baseMaxHp, baseAtk:p.baseAtk, baseDef:p.baseDef, baseCrit:p.baseCrit, atk:p.atk, def:p.def, crit:p.crit,
      healMult:1, goldMult:1, dmgReduce:0, skillPoints:0, skills:{}, equip:Object.assign({},p.equip), ownedGear:Object.assign({},p.ownedGear),
      gold:0, inventory:Object.assign({},SYS.INVENTORY_DEFAULTS), quickPot:'potion', pet:null, petGear:{}, livery:'azure',
      hasLamp:false, raceRecords:{}, raceBarding:false, championRobe:false, playMs:0, day:1, dayFrac:9/24, chapels:8, wins:{} }; }
  let S=fresh(), slot=1;
  try{ slot=Math.min(SLOTS,Math.max(1,+localStorage.getItem(ACTIVE)||1)); }catch(e){}
  const listeners=[]; const changed=()=>listeners.forEach(f=>f(S));

  // ── KLK's recalcStats ──
  const skillNode=id=>{ for(const T of [SYS.SKILL_TREE,SYS.PET_TREE]) for(const b in T) for(const n of T[b].nodes) if(n.id===id) return n; return null; };
  const aogWorn=()=>SYS.AOG_SET.filter(id=>Object.values(S.equip).includes(id)).length;
  // V185: THE TREES. Three ways to be a knight (SKILL_TREE: striker, guardian, psalmist — 50 points each, and a whole
  //  game earns about half of the 150), and one tree for the companion at your side (PET_TREE, keyed by its line: only
  //  your present companion's nodes count). A node's `bonus` holds the old plain stats and the new PERKS the fight reads
  //  (S.perk: openDmg, staggerK, punish, heavyK, critMult · parryMs, counter, blockK, redBlock · mend, burst, regen,
  //  revive, cmdCd · petDmg, petHeal, petGuard, roar, gbreak, dive, cleanse, wallT, wallShots, wallHeal, wallK, cmdPow).
  //  Damage reduction from everything together stops at 35%.
  const PLAIN={atk:1,def:1,maxHp:1,crit:1,healMult:1,goldMult:1,dmgReduce:1,petBonus:1}, DR_CAP=0.35;
  const petLine=id=>{ for(const b in SYS.PET_TREE) if(SYS.PET_TREE[b].nodes.some(n=>n.id===id)) return b; return null; };
  function recalc(){ let atk=S.baseAtk, def=S.baseDef, maxHp=S.baseMaxHp, crit=S.baseCrit, healMult=1, goldMult=1, dmgReduce=0, petBonus=0; const perk={};
    const lv=S.level-1; atk+=lv*3; def+=Math.floor(lv*3/2); maxHp+=lv*12;
    for(const id in S.skills){ if(!S.skills[id]) continue; const n=skillNode(id); if(!n) continue; const b=n.bonus; const pl_=petLine(id); if(pl_&&(!S.pet||S.pet.id!==pl_)) continue; for(const k in b) if(!PLAIN[k]) perk[k]=(perk[k]||0)+b[k];
      atk+=b.atk||0; def+=b.def||0; maxHp+=b.maxHp||0; crit+=b.crit||0; healMult+=b.healMult||0; goldMult+=b.goldMult||0; dmgReduce+=b.dmgReduce||0; petBonus+=b.petBonus||0; }
    for(const [s] of SYS.GEAR_SLOTS){ const e=SYS.EQUIP[S.equip[s]]; if(!e) continue; atk+=e.atk||0; crit+=e.crit||0; def+=e.def||0; maxHp+=e.maxHp||0; }
    if(aogWorn()===SYS.AOG_SET.length){ def+=SYS.AOG_BONUS.def; maxHp+=SYS.AOG_BONUS.maxHp; dmgReduce+=SYS.AOG_BONUS.dmgReduce; }
    if(S.pet){ const L=SYS.PETS[S.pet.id], f=L.forms[S.pet.form], b=f.bonus||{};
      atk+=b.atk||0; def+=b.def||0; maxHp+=b.maxHp||0; crit+=b.crit||0; healMult+=b.healMult||0; dmgReduce+=b.dmgReduce||0;
      if(petBonus>0){ if(L.focus==='offense') atk+=petBonus; else if(L.focus==='defense'){ def+=petBonus; maxHp+=petBonus; } else maxHp+=petBonus*2; } }
    const ratio=S.maxHp>0?S.hp/S.maxHp:1;
    Object.assign(S,{atk,def,crit:Math.min(0.75,crit),maxHp,healMult,goldMult,dmgReduce:Math.min(DR_CAP,dmgReduce),perk}); S.hp=Math.min(S.maxHp,Math.round(S.maxHp*ratio)); }
  // ── gainXp: one skill point per level, full heal, pets evolve at PET_EVOLVE_LV ──
  function gainXp(n){ S.xp+=n; let up=0; while(S.xp>=S.xpNext){ S.xp-=S.xpNext; S.level++; up++; S.skillPoints++; S.xpNext=xpForLevel(S.level); }
    let evolved=null; if(up){ recalc(); S.hp=S.maxHp; evolved=petEvolve(); } changed(); return {up,evolved}; }
  function petEvolve(){ if(!S.pet) return null; let t=0; SYS.PET_EVOLVE_LV.forEach((lv,i)=>{ if(S.level>=lv) t=i; });
    if(t>S.pet.form){ S.pet.form=t; recalc(); return SYS.PETS[S.pet.id].forms[t]; } return null; }
  function addGold(n){ S.gold=Math.max(0,S.gold+Math.round(n)); changed(); }
  // ── skills: tier 0 is open, each later tier needs the one before in its branch ──
  function canBuy(id){ const n=skillNode(id); if(!n||S.skills[id]||S.skillPoints<n.cost) return false; const pl_=petLine(id); if(pl_&&(!S.pet||S.pet.id!==pl_)) return false; if(n.tier===0) return true;
    for(const T of [SYS.SKILL_TREE,SYS.PET_TREE]) for(const b in T){ const ns=T[b].nodes; const i=ns.findIndex(q=>q.id===id); if(i>0) return !!S.skills[ns[i-1].id]; } return false; }
  // V185: a respec gives every spent point back. The first is free (old saves were refunded and given one); after that it costs gold.
  const spent=()=>{ let n=0; for(const id in S.skills){ if(!S.skills[id]) continue; const q=skillNode(id); if(q) n+=q.cost; } return n; };
  const respecCost=()=>S.freeRespec>0?0:150+25*S.level;
  function respec(){ const n=spent(), c=respecCost(); if(!n) return 'none'; if(S.gold<c) return 'gold'; if(c) S.gold-=c; else S.freeRespec=Math.max(0,(S.freeRespec||0)-1); S.skills={}; S.skillPoints+=n; recalc(); changed(); return 'ok'; }
  function buySkill(id){ if(!canBuy(id)) return false; S.skillPoints-=skillNode(id).cost; S.skills[id]=true; recalc(); changed(); return true; }
  // ── gear: Ⓐ wears a piece; Ⓐ on a worn piece takes it off (a weapon goes back to bare fists) ──
  function wear(id){ const e=SYS.EQUIP[id]; if(!e||!S.ownedGear[id]) return; const slot=e.slot;
    if(S.equip[slot]===id) S.equip[slot]= slot==='weapon'?'none_w':slot==='body'?'none_a':null; else S.equip[slot]=id; recalc(); changed(); }
  // ── potions: heal ×healMult; tonics are timed (not saved, as in the game) ──
  const fx={};
  function drink(id){ const P=SYS.POTIONS[id]; if(!P||!(S.inventory[id]>0)) return null; S.inventory[id]--; let msg='';
    if(P.heal){ const h=Math.round(P.heal*S.healMult); const before=S.hp; S.hp=Math.min(S.maxHp,S.hp+h); msg=`+${S.hp-before} HP`; if(P.cure) for(const k in fx) delete fx[k]; }
    else if(P.fx){ fx[P.fx]=P.ms/1000; msg=P.note; }
    else if(P.murky){ const roll=Math.random()*100; let acc=0, out='heal'; for(const [w,k] of SYS.MURKY_TABLE){ acc+=w; if(roll<acc){ out=k; break; } }
      if(out==='heal'){ S.hp=Math.min(S.maxHp,S.hp+60); msg='It tastes of honey. +60 HP'; } else if(out==='gold'){ const g=15+Math.floor(Math.random()*26); S.gold+=g; msg=`A coin at the bottom! +${g}g`; }
      else if(out==='full'){ S.hp=S.maxHp; msg='Clear and cold. Full health!'; } else msg='Hic! "A merry heart doeth good like a medicine." — Prov 17:22'; }
    changed(); return msg||P.note; }
  function eat(id){ if(id!=='bread'||!(S.inventory.bread>0)) return null; S.inventory.bread--; const h=Math.round(15*S.healMult); /* 'restores 15 HP' */ S.hp=Math.min(S.maxHp,S.hp+h); changed(); return `+${h} HP`; }
  // ── saves ──
  // V116: the realm grew (tools/stretch.py) — a save from before carries the old map's tiles, so its places
  // on the overworld move with the land, once: where you stood, your crops, the Homestead's pieces, the boat and the wagon
  // Each seam is [at, width, version], at in the 2D game's own tiles; a save remembers the last version it was moved to
  // (stretchV: none = the 2D-sized realm) and takes each later version's seams in turn, so any old save lands right.
  // V185: an old save's trees are gone — every point it had spent comes back (the old nodes cost 1, 1, 2, 3 by tier), with one free respec
  function retree(o){ if(!o||o.treeV>=2) return o; let back=0; for(const id in (o.skills||{})){ if(!o.skills[id]) continue; const m=/^(valor|guard|faith|bond|instinct|devotion)([0-3])$/.exec(id); if(m) back+=[1,1,2,3][+m[2]]; }
    o.skills={}; o.skillPoints=(o.skillPoints||0)+back; o.freeRespec=1; o.treeV=2; if(back) o.treeNote=back; return o; }
  function restretch(o){ if(!o) return o; retree(o); const from=o.stretchV||0; o.stretchV=Math.max(from,STRV);
    for(let v=from+1;v<=STRV;v++){
      // this version's seams, placed in the realm as the earlier versions left it
      const at=(L,a)=>a+L.filter(s=>(s[2]||1)<v&&a>=s[0]).reduce((t,s)=>t+s[1],0);
      const sx=STR.x.filter(s=>(s[2]||1)===v).map(s=>[at(STR.x,s[0]),s[1]]), sy=STR.y.filter(s=>(s[2]||1)===v).map(s=>[at(STR.y,s[0]),s[1]]);
      if(!sx.length&&!sy.length) continue;
      const X=q=>{ let d=0; for(const [a,n] of sx) if(Math.floor(q)>=a) d+=n; return q+d; }, Y=q=>{ let d=0; for(const [a,n] of sy) if(Math.floor(q)>=a) d+=n; return q+d; };
      if(o.at&&typeof o.at.x==='number'){ o.at.x=X(o.at.x); o.at.z=Y(o.at.z); }
      if(o.crops){ const c={}; for(const k in o.crops){ const [a,b]=k.split(',').map(Number); c[X(a)+','+Y(b)]=o.crops[k]; } o.crops=c; }
      if(o.homesteadDecor&&o.homesteadDecor.placed) o.homesteadDecor.placed.forEach(q=>{ q.x=X(q.x); q.y=Y(q.y); });
      [o.boat,o.wagon].forEach(q=>{ if(q&&typeof q.x==='number'){ q.x=X(q.x); q.y=Y(q.y); } }); }
    return o; }
  const exportCode=()=>btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  function importCode(code){ try{ const o=JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if(!o||o.v!==1) return false; S=Object.assign(fresh(),restretch(o)); recalc(); changed(); return true; }catch(e){ return false; } }
  function save(n){ n=n||slot; try{ localStorage.setItem(KEY+n,JSON.stringify(S)); localStorage.setItem(ACTIVE,String(n)); slot=n; return true; }catch(e){ return false; } }
  function peek(n){ try{ const r=localStorage.getItem(KEY+n); return r?JSON.parse(r):null; }catch(e){ return null; } }
  function load(n){ const o=peek(n); if(!o) return false; S=Object.assign(fresh(),restretch(o)); slot=n; try{ localStorage.setItem(ACTIVE,String(n)); }catch(e){} recalc(); changed(); return true; }
  // a ready-made knight: presets[k].make(S) fills in a fresh save (the wiring file registers them)
  const presets={};
  let defaultPreset=null;
  function newGame(n,preset){ preset=preset||defaultPreset; S=fresh(); slot=n||slot; if(preset&&presets[preset]) presets[preset].make(S); recalc(); if(preset) S.hp=S.maxHp; save(slot); changed(); }
  function erase(n){ try{ localStorage.removeItem(KEY+n); }catch(e){} }
  if(!load(slot)) recalc();
  // the clock: play time, and the hour (the inn sets it)
  let last=performance.now();
  function tick(){ const now=performance.now(), dt=Math.min(1,(now-last)/1000); last=now; S.playMs+=dt*1000; S.dayFrac+=dt/(72*60);   // a full day every 72 real minutes, as in the game if(S.dayFrac>=1){ S.dayFrac-=1; S.day++; }
    for(const k in fx){ fx[k]-=dt; if(fx[k]<=0) delete fx[k]; } }
  return { get S(){ return S; }, get slot(){ return slot; }, SLOTS, recalc, gainXp, addGold, canBuy, buySkill, respec, respecCost, spent, wear, drink, eat, fx, skillNode, aogWorn,
    save, load, peek, newGame, presets, set defaultPreset(k){ defaultPreset=k; }, erase, exportCode, importCode, tick, on:f=>listeners.push(f), changed, xpForLevel };
})();
