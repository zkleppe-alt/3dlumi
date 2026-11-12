// ════════════════════════════════════════════════════════════════
//  MENU — KLK's ☰ menu: Character · Gear · Items · Skills · Pet · Quests · Map · Home · System.
//  Same rows and wording as renderMenu() in index.html, working on the 3D save.
// ════════════════════════════════════════════════════════════════
const MENU=(function(){
  const TABS=['Character','Gear','Items','Skills','Pet','Quests','Map','Home','System'];
  const el=$('gm'), rail=$('gmRail'), pane=$('gmPane'), head=$('gmHead'); let tab=0, open=false, note='', sub=null;
  const E=UI.esc, pct=v=>Math.round(v*100)+'%';
  const row=(k,v,cls)=>`<div class="gm-stat ${cls||''}"><span>${k}</span><b>${v}</b></div>`;
  const sec=t=>`<div class="gm-sec">${t}</div>`;
  const statLine=e=>{ const p=[]; if(e.atk!==undefined&&e.slot==='weapon') p.push(`+${e.atk||0} atk`); else if(e.atk) p.push(`+${e.atk} atk`); if(e.def!==undefined||e.slot!=='weapon') p.push(`+${e.def||0} def`); if(e.maxHp) p.push(`+${e.maxHp} hp`); if(e.crit) p.push(`+${Math.round(e.crit*100)}% crit`); return p.join(' · '); };
  const SLOT_NAMES={weapon:['🗡','Weapon'],shield:['🛡','Shield'],helm:['⛑','Helm'],body:['🦺','Breastplate'],legs:['🥾','Legs']};
  const R={
    Character(S){ let h=row('Level',S.level)+row('XP',`${S.xp} / ${S.xpNext}`)+row('❤ Max HP',S.maxHp)+row('⚔ Attack',S.atk)+row('🛡 Defense',S.def)+row('✦ Crit',pct(S.crit))
        +row('🩹 Dmg Reduce',pct(S.dmgReduce))+row('🪙 Gold',S.gold)+row('★ Skill Points',S.skillPoints,'gold');
      h+=sec('Equipped'); for(const [s] of SYS.GEAR_SLOTS){ const e=SYS.EQUIP[S.equip[s]], [ic,nm]=SLOT_NAMES[s];
        h+=row(`${ic} ${nm}`, e&&!/^none/.test(S.equip[s])?E(e.name)+(s==='weapon'?` <span class="tag">[${e.type}]</span>`:''):(s==='body'&&e?E(e.name):'— none —'));
        if(s==='weapon') h+=row('✦ Combo Special','Ground Pound','gold'); }
      return h; },
    Gear(S){ let h=sec('Worn'), tot={atk:0,def:0,hp:0};
      for(const [s] of SYS.GEAR_SLOTS){ const id=S.equip[s], e=SYS.EQUIP[id], [ic,nm]=SLOT_NAMES[s];
        if(e){ tot.atk+=e.atk||0; tot.def+=e.def||0; tot.hp+=e.maxHp||0; } h+=row(`${ic} ${e?E(e.name):nm+' — none'}`, e?statLine(e):''); }
      h+=row('From gear',`+${tot.atk} atk · +${tot.def} def · +${tot.hp} hp`,'band');
      const aog=GAME.aogWorn(); if(SYS.AOG_SET.some(id=>S.ownedGear[id])) h+=row('✝ Armor of God',`${aog} / ${SYS.AOG_SET.length} worn`+(aog===5?' — Stand firm':''));
      for(const [s] of SYS.GEAR_SLOTS){ const own=Object.keys(SYS.EQUIP).filter(id=>S.ownedGear[id]&&SYS.EQUIP[id].slot===s); if(!own.length) continue;
        h+=sec(SLOT_NAMES[s][1]); own.forEach(id=>{ const e=SYS.EQUIP[id], worn=S.equip[s]===id;
          h+=`<button class="gm-item ${worn?'worn':''}" data-act="wear:${id}"><span>${e.emoji||'•'} ${E(e.name)}${e.type?` <span class="tag">[${e.type}]</span>`:''} <span class="ds">${statLine(e)}</span></span>${worn?'<i>worn</i>':''}</button>`; }); }
      return h+'<p class="gm-hint">Tap to wear a piece · tap a worn piece to take it off. Pieces show on the knight.</p>'; },
    Items(S){ let h=sec('Potions'); const pots=Object.keys(SYS.POTIONS).filter(k=>S.inventory[k]>0);
      if(!pots.length) h+='<p class="gm-empty">— none · Healing Potions at any village shop, and more from Reuben’s wagon —</p>';
      pots.forEach(k=>{ const P=SYS.POTIONS[k]; h+=`<button class="gm-item" data-act="drink:${k}"><span>${P.emoji} ${E(P.name)} ×${S.inventory[k]} <span class="ds">${E(P.note)}</span></span><i>drink</i></button>`; });
      const fx=Object.keys(GAME.fx); if(fx.length) h+=`<p class="gm-hint">Active: ${fx.map(k=>k+' '+Math.ceil(GAME.fx[k])+'s').join(' · ')}</p>`;
      h+=sec('Food'); h+= S.inventory.bread>0?`<button class="gm-item" data-act="eat:bread"><span>🍞 Loaf of Bread ×${S.inventory.bread}</span><i>eat</i></button>`:'<p class="gm-empty">— none —</p>';
      const seeds=['mustardSeed','wheatSeed','barleySeed','grapeSeed'].filter(k=>S.inventory[k]>0);
      h+=sec('Seed Pouch')+(seeds.length?seeds.map(k=>row(`${SYS.SHOP_ITEMS[k].emoji} ${SYS.SHOP_ITEMS[k].name}`,'×'+S.inventory[k])).join(''):'<p class="gm-empty">— empty · seed is sold at any village shop —</p>');
      const G0={wheat:['🌾','Wheat'],mustard:['🌱','Mustard'],barley:['🌾','Barley'],grapes:['🍇','Grapes']}, F0={perch:['🐟','Pond Perch'],trout:['🐟','Forest Trout'],oasisCarp:['🐠','Oasis Carp'],seabass:['🐟','Sea Bass'],kingfish:['🐠','Kingfish'],goldenFish:['🪙','Golden Fish']};
      const list=(T)=>{ const k=Object.keys(T).filter(k=>S.inventory[k]>0); return k.length?k.map(k=>row(`${T[k][0]} ${T[k][1]}`,'×'+S.inventory[k])).join(''):'<p class="gm-empty">— empty —</p>'; };
      const M0={}; if(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.trade) for(const k in PASTIME_DATA.trade.materials){ const M=PASTIME_DATA.trade.materials[k]; M0[k]=[M.emoji,M.name]; }
      h+=sec('Larder')+list(G0)+sec('The Catch')+list(F0)+(Object.keys(M0).some(k=>S.inventory[k]>0)?sec('Trade Goods')+list(M0):'')+(S.inventory.sacredScroll>0?sec('Carried')+row('📜 Sacred Scroll','for the forgotten one in the wood'):'');
      if(S.hasLamp) h+=sec('Carried')+row('🏮 Forester’s Lantern','lifts the fog of the deep wood');
      return h; },
    Skills(S){ return skills(S); },
    Pet(S){ if(!S.pet){ let h='<p class="gm-intro">No companion walks with you yet. Choose one to raise — it grows as you level, and fights in the Grand Pet Tournament.</p>';
        SYS.STARTER_PETS.forEach(id=>{ const L=SYS.PETS[id], f=L.forms[0]; h+=`<button class="gm-item" data-act="adopt:${id}"><span>${f.emoji} ${E(L.name)} <span class="ds">${E(f.name)} · ${E(L.focus)} · ${E(L.desc||'')}</span></span><i>choose</i></button>`; }); return h; }
      const L=SYS.PETS[S.pet.id], f=L.forms[S.pet.form], b=f.bonus||{}, parts=[]; if(b.atk)parts.push(`+${b.atk} atk`); if(b.def)parts.push(`+${b.def} def`); if(b.maxHp)parts.push(`+${b.maxHp} hp`); if(b.crit)parts.push(`+${Math.round(b.crit*100)}% crit`); if(b.healMult)parts.push(`+${Math.round(b.healMult*100)}% heal`); if(b.dmgReduce)parts.push(`${Math.round(b.dmgReduce*100)}% reduce`);
      let h=`<div class="gm-pet">${f.emoji}${S.pet.ribbon||''}</div><div class="gm-sec" style="text-align:center">${E(f.name)} (${E(L.name)})</div>${L.desc?`<p class="gm-intro">${E(L.desc)}</p>`:''}`+row('Companion bonus',parts.join(' · ')||'—');
      h+=sec('Evolution'); L.forms.forEach((F,i)=>{ const lv=SYS.PET_EVOLVE_LV[i]; h+=row(`${F.emoji} ${E(F.name)}${F.abilityName?' — '+E(F.abilityName):''}`, i<S.pet.form?'✓':i===S.pet.form?'current':'Lv '+lv); });
      const owned=Object.keys(SYS.PET_GEAR).filter(k=>S.petGear[k]);
      if(owned.length){ h+=sec('Companion Gear <span class="ds">(one collar · one charm)</span>'); owned.forEach(k=>{ const G=SYS.PET_GEAR[k], eq=S.pet.equip&&S.pet.equip[G.slot]===k;
        h+=`<button class="gm-item ${eq?'worn':''}" data-act="petgear:${k}"><span>${G.emoji} ${E(G.name)} <span class="ds">[${G.slot}] ${E(G.note)}</span></span>${eq?'<i>equipped</i>':''}</button>`; }); }
      if(typeof PETLOOKS!=='undefined') h+=PETLOOKS.bardingRows(S);
      const C=SYS.PET_CMD&&SYS.PET_CMD[S.pet.id];
      if(C) h+=sec('In a fight')+`<p class="gm-intro">${E(SYS.PET_TREE[S.pet.id].style||'')} <b>${C.emoji} ${E(C.name)}</b>: press <b>G</b> (or the 🐾 button) — ready every ${typeof PETFIGHT!=='undefined'?PETFIGHT.cdOf():C.cd} s.</p>`;
      return h+`<button class="gm-item" data-act="goskills"><span>✦ ${E(SYS.PET_TREE[S.pet.id].name)} <span class="ds">your companion’s skills — on the Skills page</span></span><i>open ▸</i></button>`; },
    Quests(S){ const lv=ENGINE.level; const here=lv&&!lv.custom&&lv.zone?(lv.zone(ENGINE.P)||lv.name):(lv?lv.name:''), nx=SYS.TOWN_DATA[S.chapels];
      let h=(typeof JOURNAL!=='undefined'?`<button class="gm-item" data-act="journal"><span>📖 The Knight’s Journal <span class="ds">${JOURNAL.count()} page${JOURNAL.count()===1?'':'s'} · the quiet moments</span></span></button>`:'')+quest('⚔ The Journey',`You are in: <b>${E(String(here).split(' · ')[0])}</b>`)+(S.abaddonWon?quest('✓ The Shadow Over the Realm','Abaddon is fallen. The realm draws breath again.'):quest('⚔ The Shadow Over the Realm','Defeat Abaddon in Hellgate Citadel.'))
        +(()=>{ const hu=S.hunt; if(!S.abaddonWon) return ''; const n=hu?hu.remaining.reduce((a,b)=>a+b,0):0;
          if(hu&&hu.done) return quest('✓ The Demon Hunt','Complete. The roads are at peace.');
          if(hu&&hu.active) return quest('⚔ The Demon Hunt',`Wandering demons remaining: <b>${n}</b> of ${hu.total}.`);
          return quest('⚔ A Father Returned','Sir Aldric awaits you at the Family Farmhouse in the Homestead.'); })()
        +(()=>{ const T=typeof tradeSystem!=='undefined'&&tradeSystem.current; const l=T&&T.questLine(); return l?quest('🏪 The Trade Empire',l):''; })()
        +quest('⚔ The Ten Chapels',`Cleanse the realm’s chapels in order — <b>${S.chapels}/10</b> restored.${nx?` Next: <b>${E(nx.name)}</b> — ${E(nx.general)} is bound in the chapel.`:' The realm’s chapels all stand cleansed.'}`)
        +(S.hunt&&S.hunt.done?quest('⚔ Knight Tournaments',`Open — Stormgate’s marshals stand at the tilting yard rail, Dame Elspeth waits in the Throne Hall, and the keeps of Ironhold and Hellgate host their own.${winsLine(S)}`):quest('🔒 Knight Tournaments','The marshals will open the lists once Sir Aldric’s Demon Hunt is done.'))
        +(()=>{ const b=S.bounties||{}, P=S.portals||{}; if(!b.madisonTaken) return ''; if(S.homecoming) return quest('✓ The Princess Brought Home','Madison is home, and the wedding is past. The realm is at peace.');
          if(b.madisonRescued) return quest('⚔ The Long Way Home','Madison is free. Bring her home to the keep in Stormgate.');
          const w=[['mistral','🌬 Mistral Isle'],['tabor','🏔 Mount Tabor'],['sunfall','🌅 Sunfall']].map(([k,n])=>`${(P[k]||{}).cleared?'✓':(P[k]||{}).unlocked?'➤':'🔒'} ${n}`).join(' · ');
          return quest('⚔ After the Princess',`The Pretender has taken Princess Madison through the portals. ${w}`); })()
        +quest('🐎 The King’s Tourney',`The Stormgate Royal Park steeplechase. Record: <b>${fmt(S.raceRecords.stormgate||SYS.SC.par.stormgate)}</b>${S.raceRecords.stormgate?'':' (par)'}.${S.raceBarding?' Seraph’s Pet Barding won.':''}`)
        +quest('🏟 The Grand Pet Tournament',S.wins.petChampion?'Champion of the market ring.':'Three rounds in the lower town, rising purses. A companion is needed.');
      h+=(typeof DEEP_API!=='undefined'&&DEEP_API.cur?DEEP_API.cur.quest():'');
      return h+'<hr><div class="gm-q"><b class="purple">📜 Bounties</b> — hooded strangers wait in the realm’s inns</div>'+(BOUNTY_API.cur?BOUNTY_API.cur.quest():'<p class="gm-empty">🔒 Locked — the hooded strangers offer no work until Sir Aldric’s Demon Hunt is finished.</p>'); },
    Map(S){ return `<div class="gm-map"><img id="gmMapImg" src="${SYS.MAP.map}" alt="The realm of Luminar"><div id="gmMapPins"></div><div id="gmMapTip" hidden></div></div>`
        +`<div id="gmTravel"></div><p class="gm-hint">🔴 you · ⭐ your next goal · towns: <span class="green">green = cleansed</span>, <span class="red">red = still bound</span> — tap a town for its name; a cleansed town can be travelled to.</p>`; },
    Home(S){ let h=(BOUNTY_API.cur?BOUNTY_API.cur.homeTab():row('🏡 The Homestead','0 placed · 0 kinds in store'))+sec('Liveries');
      Object.entries(SYS.LIVERIES).forEach(([k,L])=>{ const own=liveryOwned(S,k), cur=S.livery===k;
        if(!own&&!['champion','crimson','forest','sable','argent','gilt','stormward','fallen','robby'].includes(k)) return;
        h+=`<button class="gm-item ${cur?'worn':''} ${own?'':'locked'}" data-act="${own?'livery:'+k:''}"><span><span class="sw" style="background:${L.TUNIC||'#3b6fd4'}"></span> ${E(L.name)} <span class="ds">${E(L.note||'')}</span></span>${cur?'<i>worn</i>':own?'':'<i>🔒</i>'}</button>`; });
      return h+'<p class="gm-hint">Champion’s Plate is won in the Grand Tournament. The other liveries come from the 2D game’s quests.</p>'; },
    System(S){ const slot=GAME.slot, hh=Math.floor(S.dayFrac*24), mm=Math.floor((S.dayFrac*24-hh)*60), ap=hh<12?'AM':'PM', h12=((hh+11)%12)+1;
      let h=row('Playing',`Slot ${slot} · ${E(S.name)} · Lv ${S.level} · ${S.chapels}/10`)+row('Time',`☀️ Day ${S.day} · ${h12}:${String(mm).padStart(2,'0')}${ap} · ⏱ ${Math.floor(S.playMs/3600000)}H${String(Math.floor(S.playMs/60000)%60).padStart(2,'0')}M played`);
      h+=sec('View')+['classic','grand'].map(m=>`<button class="gm-item ${VIEWMODE.mode===m?'worn':''}" data-act="view:${m}"><span>${m==='classic'?'🗺 Classic — the 2D game’s proportions':'🏔 Grand — people at 0.45×, the world towering over them (outdoors, for testing)'}</span>${VIEWMODE.mode===m?'<i>✓</i>':''}</button>`).join('')
        +`<button class="gm-item ${S.goalOff?'':'worn'}" data-act="goal"><span>➤ Show the next goal <span class="ds">a line under the place name, and a gold star on the minimap</span></span><i>${S.goalOff?'off':'on'}</i></button>`
        +`<button class="gm-item" data-act="unstick"><span>🧭 Unstick me <span class="ds">step out to the nearest open ground</span></span></button>`
        +sec('Controls')+`<button class="gm-item" data-act="keys"><span>⌨ Keyboard Controls <span class="ds">see and change every key · 🧪 potion is ${typeof KEYS!=='undefined'?KEYS.keysFor('potion'):'P'}</span></span></button>`
          +(typeof SFX!=='undefined'?sec('Sound')+`<button class="gm-item" data-act="vol:music"><span>🎵 Music ${SFX.volBar(SFX.musicVol)} ${Math.round(SFX.musicVol*100)}% <span class="ds">tap to change · the 2D game's own themes</span></span></button>`
            +`<button class="gm-item" data-act="vol:sfx"><span>🔊 Sound effects ${SFX.volBar(SFX.sfxVol)} ${Math.round(SFX.sfxVol*100)}% <span class="ds">tap to change · blows, footsteps, wind and weather</span></span></button>`:'')
          +sec('Graphics')+['auto','low','medium','high','ultra'].map(t=>{ const cur=typeof HUD!=='undefined'?HUD.pref:'auto', act=typeof HUD!=='undefined'?HUD.tier:'medium';
            const lab={auto:`✨ Auto <span class="ds">chosen for this device — now ${act[0].toUpperCase()+act.slice(1)}</span>`,low:'Low <span class="ds">older phones: short view, plain light</span>',medium:'Medium <span class="ds">phones and tablets</span>',high:'High <span class="ds">computers: soft wide shadows, long views, glow and colour grading</span>',ultra:'Ultra <span class="ds">a strong graphics card: the longest views, the sharpest shadows</span>'}[t];
            return `<button class="gm-item ${cur===t?'worn':''}" data-act="gfx:${t}"><span>${lab}</span>${cur===t?'<i>✓</i>':''}</button>`; }).join('')
          +`<button class="gm-item" data-act="mocap"><span>🏃 Knight’s movement: ${ENGINE.K&&ENGINE.K.mocapOff?'classic (hand-keyed)':'motion-captured (new)'} <span class="ds">tap to switch</span></span></button>`
          +`<button class="gm-item" data-act="look2"><span>🌄 World look: ${typeof LOOK2!=='undefined'&&LOOK2?'rolling meadows (new)':'classic flat ground'} <span class="ds">tap to switch · reloads the page</span></span></button>`
          +`<button class="gm-item" data-act="pad"><span>🎮 Controller Controls <span class="ds">choose the button for every action · swap sticks · invert look</span></span></button>`
        +sec('Save Profiles')+`<button class="gm-item" data-act="save"><span>💾 Save Game <span class="ds">write your progress to Slot ${slot}</span></span></button>`;
      for(let n=1;n<=GAME.SLOTS;n++){ const o=GAME.peek(n); h+=`<button class="gm-item ${n===slot?'worn':''}" data-act="slot:${n}"><span>${o?'📜':'🆕'} Slot ${n}${n===slot?' ★':''} — ${o?`${E(o.name)} · Lv ${o.level} · ${o.gold}g`:'Empty'} <span class="ds">${o?(n===slot?'playing':'tap to load'):'begin a brand-new journey'}</span></span></button>`; }
      h+=`<button class="gm-item" data-act="export"><span>📤 Export Save Code <span class="ds">back up this hero as a code you can keep</span></span></button>`
        +`<button class="gm-item" data-act="import"><span>📥 Import Save Code <span class="ds">restore a hero from a code (into this slot)</span></span></button>`
        +`<button class="gm-item" data-act="erase"><span>🗑 Erase a slot… <span class="ds">clear a profile to start fresh</span></span></button>`;
      if(sub==='export') h+=`<textarea id="gmCode" readonly rows="4">${GAME.exportCode()}</textarea><button class="gm-btn" data-act="copy">Copy code</button>`;
      if(sub==='import') h+=`<textarea id="gmCode" rows="4" placeholder="Paste a save code"></textarea><button class="gm-btn" data-act="doimport">Restore into Slot ${slot}</button>`;
      if(sub==='erase') h+=`<p class="gm-hint">Erase which slot? This cannot be undone.</p>`+[1,2,3].map(n=>`<button class="gm-btn danger" data-act="doerase:${n}">Erase Slot ${n}</button>`).join(' ');
      if(sub&&sub.startsWith('confirm:')){ const n=+sub.split(':')[1]; h+=`<p class="gm-hint">Slot ${n} is empty. Begin a brand-new journey there?</p><button class="gm-btn" data-act="newgame:${n}">Begin in Slot ${n}</button>`+(GAME.presets?Object.entries(GAME.presets).map(([k,p])=>`<button class="gm-btn" data-act="preset:${n}.${k}">${E(p.label)}</button>`).join(''):''); }
      return h+'<p class="gm-hint">Profiles live in this browser on this device. Back up with 📤 Export Save Code. Auto-saves when you leave a building or finish a contest.</p>'; }
  };
  const fmt=ms=>{ const s=ms/1000; return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0'); };
  const quest=(t,d)=>`<div class="gm-q"><b>${t}</b><br>${d}</div>`;
  function winsLine(S){ const w=S.wins, p=[]; ['joust','duel','waves','ladder'].forEach(k=>{ if(w[k]) p.push(`${k==='ladder'?'Grand Tournament':k==='waves'?'Grand Melee':k[0].toUpperCase()+k.slice(1)} ×${w[k]}`); }); return p.length?'<br>Won: '+p.join(' · '):''; }
  // ── V186: THE SKILLS PAGE, a constellation. The knight's three ways fan out from his crest (wide screens) or climb in
  //  three columns (narrow ones); the companion's one branch winds out from its own emblem on a second leaf. A node is
  //  dim (locked), ringed and pulsing (you can learn it now), or lit (learned); the line to it lights with it. Hover or
  //  tap a node to read it below; the gold button learns it.
  const GLYPH={atk:'⚔',crit:'✦',openDmg:'⚡',staggerK:'💫',punish:'🎯',heavyK:'🌀',critMult:'✝',def:'🛡',maxHp:'♥',dmgReduce:'🛡',parryMs:'⏱',counter:'↩',blockK:'🧱',redBlock:'🟥',healMult:'✚',goldMult:'🪙',cmdCd:'🐾',mend:'🌿',burst:'☀',regen:'💧',revive:'🕊',petDmg:'🦷',petHeal:'💗',petGuard:'🐢',roar:'📣',gbreak:'💥',dive:'🪽',cleanse:'✨',wallT:'⏳',wallShots:'🏹',wallHeal:'💚',wallK:'🧱',cmdPow:'⬆'};
  const PLAINK={atk:1,def:1,maxHp:1,crit:1,healMult:1,goldMult:1,dmgReduce:1};
  const glyph=n=>{ const ks=Object.keys(n.bonus||{}), k=ks.find(q=>!PLAINK[q])||ks[0]; return GLYPH[k]||'✦'; };
  let skSub='knight', skSel=null, skJust=null;
  const brOf=id=>{ for(const T of [SYS.SKILL_TREE,SYS.PET_TREE]) for(const b in T){ const i=T[b].nodes.findIndex(n=>n.id===id); if(i>=0) return {br:T[b],key:b,i,n:T[b].nodes[i],pet:T===SYS.PET_TREE}; } return null; };
  function detail(S,id){ const q=id&&brOf(id); if(!q) return `<div class="sk-detail"><div class="tx"><span class="ds">Choose a skill to read it.</span></div></div>`;
    const {br,i,n}=q, own=!!S.skills[n.id], can=GAME.canBuy(n.id), prev=i>0?br.nodes[i-1]:null; let btn;
    if(own) btn=`<span class="sk-buy got">✓ Learned</span>`; else if(can) btn=`<button class="sk-buy" data-act="skill:${n.id}">Learn · ${n.cost}★</button>`;
    else btn=`<span class="sk-buy off">${prev&&!S.skills[prev.id]?'Needs '+E(prev.name):`Needs ${n.cost}★ — you have ${S.skillPoints}`}</span>`;
    return `<div class="sk-detail" style="--c:${br.color}"><div class="ic">${glyph(n)}</div><div class="tx"><div class="br">${E(br.name)} · ${i+1} of ${br.nodes.length}${i===br.nodes.length-1?' · ultimate':''}</div><div class="nm">${E(n.name)}</div><span class="ds">${E(n.desc.replace(/^ULT: /,''))}</span></div>${btn}</div>`; }
  function constellation(S,T,wide,emblem){ const keys=Object.keys(T), one=keys.length===1; let W, H, cx, cy, pos;
    if(one){ if(wide){ W=1200; H=420; cx=120; cy=210; pos=(b,i,N)=>[270+i*(860/(N-1)),210+Math.sin(i*1.25+0.4)*105]; } else { W=620; H=900; cx=310; cy=830; pos=(b,i,N)=>[310+(i%2?78:-78)*(0.6+0.4*Math.sin(i)),720-i*(640/(N-1))]; } }
    else if(wide){ W=1200; H=690; cx=600; cy=628; const ANG=[152,90,28], STEP=[56,50,56]; pos=(b,i)=>{ const a=ANG[b]*Math.PI/180, r=104+i*STEP[b], z=(i%2?1:-1)*(b===1?34:24); return [cx+Math.cos(a)*r-Math.sin(a)*z,cy-Math.sin(a)*r-Math.cos(a)*z]; }; }
    else { W=620; H=1000; cx=310; cy=940; const X=[112,310,508]; pos=(b,i)=>[X[b]+(i%2?26:-26),842-i*82]; }
    let h=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Skill tree">`;
    for(let i=0;i<70;i++){ const r1=Math.abs(Math.sin(i*127.1+3.3)*43758.5)%1, r2=Math.abs(Math.sin(i*311.7+1.7)*24634.6)%1; h+=`<circle cx="${(r1*W).toFixed(0)}" cy="${(r2*H).toFixed(0)}" r="${(0.6+((i*7)%10)/9).toFixed(1)}" fill="#fff" opacity="${(0.12+((i*3)%7)/22).toFixed(2)}"/>`; }
    keys.forEach((k,b)=>{ const br=T[k], N=br.nodes.length, pts=br.nodes.map((n,i)=>pos(b,i,N)), got=br.nodes.filter(n=>S.skills[n.id]).length, end=pts[N-1], mid=pts[Math.floor(N/2)];
      h+=`<g style="--c:${br.color}"><circle cx="${mid[0].toFixed(0)}" cy="${mid[1].toFixed(0)}" r="${one?240:210}" fill="${br.color}" opacity=".07"/>`;
      let px=cx, py=cy; pts.forEach(([x,y],i)=>{ h+=`<path class="sk-line ${S.skills[br.nodes[i].id]?'on':''}" d="M${px.toFixed(1)} ${py.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}"/>`; px=x; py=y; });
      br.nodes.forEach((n,i)=>{ const [x,y]=pts[i], own=!!S.skills[n.id], can=GAME.canBuy(n.id), ult=i===N-1, r=ult?30:22;
        h+=`<g class="sk-n ${own?'own':can?'can':'lock'} ${skSel===n.id?'sel':''} ${skJust===n.id?'just':''}" data-sk="${n.id}" data-act="sksel:${n.id}" tabindex="0" role="button" aria-label="${E(n.name)}: ${E(n.desc)}${own?' (learned)':''}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="halo" r="${r+13}"/><circle class="selr" r="${r+8}"/>`
          +(ult?`<rect class="ring" x="${-r*0.8}" y="${-r*0.8}" width="${r*1.6}" height="${r*1.6}" rx="6" transform="rotate(45)"/>`:`<circle class="ring" r="${r}"/>`)+`<text class="gl" y="1">${glyph(n)}</text>${own?'':`<text class="cost" y="${r+17}">${n.cost}★</text>`}</g>`; });
      const nm=br.name.split(' · '), lx=Math.max(100,Math.min(W-100,one?(wide?W/2:cx):(wide?end[0]+(b===0?-6:b===2?6:0):[112,310,508][b]))), ly=one?34:(wide?Math.max(24,end[1]-(b===1?60:54)):36);
      h+=`<text class="sk-lab" x="${lx.toFixed(0)}" y="${ly.toFixed(0)}" fill="${br.color}">${br.icon} ${E(one||wide?nm[0]:nm[0].split(' ')[0])} ${got}/${N}</text>${nm[1]&&wide&&!one?`<text class="sk-sub" x="${lx.toFixed(0)}" y="${(ly+17).toFixed(0)}">${E(nm[1])}</text>`:''}</g>`; });
    h+=`<g transform="translate(${cx} ${cy})"><circle r="${one?46:40}" fill="#12101e" stroke="#f2c14e" stroke-width="2.5"/><circle r="${one?54:48}" fill="none" stroke="#f2c14e" stroke-opacity=".3"/><text y="2" text-anchor="middle" dominant-baseline="central" font-size="${one?40:30}">${emblem}</text></g></svg>`; return h; }
  function skills(S){ const wide=(pane.clientWidth||innerWidth)>=720, sp=GAME.spent(), rc=GAME.respecCost(), hasPet=!!(S.pet&&SYS.PET_TREE[S.pet.id]); if(skSub==='pet'&&!hasPet) skSub='knight';
    const T=skSub==='pet'?{[S.pet.id]:SYS.PET_TREE[S.pet.id]}:SYS.SKILL_TREE, ids=[].concat(...Object.keys(T).map(k=>T[k].nodes.map(n=>n.id)));
    if(!ids.includes(skSel)) skSel=ids.find(id=>GAME.canBuy(id))||ids.find(id=>!S.skills[id])||ids[0];
    const tn=S.treeNote?`<p class="gm-note">The skill trees were remade. Your ${S.treeNote} spent points are returned, and your first respec is free.</p>`:''; delete S.treeNote;
    const pf=hasPet?SYS.PETS[S.pet.id].forms[S.pet.form]:null, C=hasPet&&SYS.PET_CMD&&SYS.PET_CMD[S.pet.id];
    let h=`<div class="gm-col" style="max-width:${wide?1010:560}px">${tn}<div class="sk-tabs"><button class="sk-tab ${skSub==='knight'?'sel':''}" data-act="sksub:knight">⚔ Knight</button>${hasPet?`<button class="sk-tab ${skSub==='pet'?'sel':''}" data-act="sksub:pet">${pf.emoji} ${E(pf.name)}</button>`:''}</div>`;
    h+=`<div class="sk-wrap">${constellation(S,T,wide,skSub==='pet'?pf.emoji:'⚜')}</div><div id="skDetail">${detail(S,skSel)}</div>`;
    h+=`<div class="sk-foot"><span>${skSub==='pet'&&C?`<b>${C.emoji} ${E(C.name)}</b> · G or the 🐾 button · every ${typeof PETFIGHT!=='undefined'?PETFIGHT.cdOf():C.cd} s`:`★ <b style="color:var(--gold)">${S.skillPoints}</b> to spend · ${sp} spent · a whole journey earns about half the tree`}</span><button class="gm-btn ${sp?'':'locked'}" data-act="respec">↺ Respec · ${rc?rc+'g':'free'}</button></div></div>`;
    skJust=null; return h; }
  function tree(T,S){ let h=''; for(const b in T){ const br=T[b], got=br.nodes.filter(n=>S.skills[n.id]).length; h+=`<div class="gm-sec" style="color:${br.color}">${br.icon} ${E(br.name)} <span class="ds">${got}/${br.nodes.length}${br.style&&T===SYS.SKILL_TREE?' · '+E(br.style):''}</span></div>`;
      br.nodes.forEach(n=>{ const own=S.skills[n.id], can=GAME.canBuy(n.id);
        h+=`<button class="gm-item ${own?'worn':can?'':'locked'}" data-act="${own?'':'skill:'+n.id}"><span>${E(n.name)} <span class="ds">${E(n.desc)}</span></span><i>${own?'✓':n.cost+'★'}</i></button>`; }); } return h; }
  const ICON={Character:'⚜',Gear:'🛡',Items:'🎒',Skills:'✦',Pet:'🐾',Quests:'📜',Map:'🗺',Home:'🏠',System:'⚙'};
  function render(keep){ const S=GAME.S;
    head.innerHTML=`<div class="gh-lv" title="Level">${S.level}</div><div class="gh-id"><div class="gh-name">${E(S.name)}</div><div class="gh-xp"><i style="width:${Math.max(0,Math.min(100,S.xp/S.xpNext*100)).toFixed(1)}%"></i></div><div class="gh-xpt">LEVEL ${S.level} · ${S.xp} / ${S.xpNext} XP</div></div>`
      +`<div class="gh-chips"><span class="gh-chip">♥ ${S.hp} / ${S.maxHp}</span><span class="gh-chip">🪙 ${S.gold}</span>${S.skillPoints>0?`<span class="gh-chip pts">★ ${S.skillPoints}</span>`:''}</div>`;
    rail.innerHTML=TABS.map((t,i)=>`<button class="gm-rt ${i===tab?'sel':''}" data-tab="${i}"><b>${ICON[t]||''}</b>${t}${t==='Skills'&&S.skillPoints>0?'<span class="dot"></span>':''}</button>`).join('');
    const top=pane.scrollTop, nt=note?`<p class="gm-note">${UI.esc(note)}</p>`:'', body=R[TABS[tab]](S), page=TABS[tab]==='Skills'?(nt?`<div class="gm-col">${nt}</div>`:'')+body:`<div class="gm-col">${nt}${body}</div>`;
    pane.innerHTML=page; if(keep) pane.scrollTop=top; else { pane.scrollTop=0; pane.classList.remove('turn'); void pane.offsetWidth; pane.classList.add('turn'); const sb=rail.querySelector('.sel'); if(sb&&sb.scrollIntoView) sb.scrollIntoView({inline:'center',block:'nearest'}); }
    if(TABS[tab]==='Map') pins(); }
  function pins(){ const box=$('gmMapPins'), tip=$('gmMapTip'), W=SYS.MAP.W, H=SYS.MAP.H, S=GAME.S;
    box.innerHTML=SYS.MAP.towns.map(([n,x,y])=>{ const ti=SYS.TOWN_DATA.findIndex(t=>t.name===n), col=ti<0?'#ffe04a':ti<S.chapels?'#6fdf8a':'#ff6a7a';
      return `<button class="pin" style="left:${x/W*100}%;top:${y/H*100}%;background:${col}" data-town="${UI.esc(n)}" aria-label="${UI.esc(n)}"></button>`; }).join('')
      +(()=>{ const g=GOAL_API.cur&&!S.goalOff&&GOAL_API.cur.now(); return g&&g.at?`<span class="pin" style="left:${g.at[0]/W*100}%;top:${g.at[1]/H*100}%;background:#ffd84a;border-radius:50%;pointer-events:none" title="Next goal"></span>`:''; })()
      +(()=>{ const lv=ENGINE.level, w=lv&&lv.id==="world", at=w?{x:ENGINE.P.x,z:ENGINE.P.z}:(S.at||SP({x:172,z:222})); return `<span class="pin you" style="left:${at.x/W*100}%;top:${at.z/H*100}%"></span>`; })();
    box.querySelectorAll('[data-town]').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); const n=b.dataset.town, ti=SYS.TOWN_DATA.findIndex(t=>t.name===n);
      tip.textContent=n+(ti<0?(n==='Homestead'&&!S.abaddonWon?' — the gate is barred':''):ti<S.chapels?' — cleansed':' — still bound'); tip.style.left=b.style.left; tip.style.top=b.style.top; tip.hidden=false;
      // 🕊 travel (3D only — the realm is far wider to walk than the 2D map): to any cleansed town, the Homestead or Hearthvale, from the open realm
      const tv=$('gmTravel'), ok=(ti>=0&&ti<S.chapels)||(n==='Homestead'&&!!S.abaddonWon)||n==='Hearthvale', lv=ENGINE.level, here=lv&&lv.id==='world', fight=here&&lv.combat&&lv.combat.foes.some(d=>d.alive&&Math.hypot(d.x-ENGINE.P.x,d.z-ENGINE.P.z)<7);
      if(tv) tv.innerHTML=ok?(here?(fight?`<p class="gm-note">Not with demons this close.</p>`:`<button class="gm-btn" data-act="travel:${UI.esc(n)}">🕊 Travel to ${UI.esc(n)}</button>`):`<p class="gm-hint">Travel from the open realm, outdoors.</p>`):''; })); }
  function act(a){ const [k,v]=a.split(':'), S=GAME.S; note='';
    if(k==='wear') GAME.wear(v);
    else if(k==='drink'){ note=GAME.drink(v)||''; }
    else if(k==='eat'){ note=GAME.eat(v)||''; }
    else if(k==='sksel'){ skSel=v; render(true); return; }
    else if(k==='sksub'){ skSub=v; skSel=null; render(true); return; }
    else if(k==='goskills'){ tab=TABS.indexOf('Skills'); skSub='pet'; skSel=null; render(); return; }
    else if(k==='skill'){ const n=GAME.skillNode(v); if(GAME.buySkill(v)){ skJust=v; skSel=v; if(typeof SFX!=='undefined') try{ SFX.play('parry'); }catch(_){} const q=brOf(v), nx=q&&q.br.nodes[q.i+1]; if(nx&&GAME.canBuy(nx.id)) skSel=nx.id; } else note=S.skillPoints<n.cost?'Not enough skill points.':'Learn the skill above it first.'; }
    else if(k==='respec'){ const r=GAME.respec(); note=r==='ok'?'Every point is yours to spend again.':r==='gold'?`A respec costs ${GAME.respecCost()} gold.`:'Nothing spent yet.'; if(r==='ok') GAME.save&&GAME.save(); }
    else if(k==='adopt'){ const L=SYS.PETS[v], E2=SYS.PET_EVOLVE_LV||[0,6,12]; let fm=0; E2.forEach((lv,i)=>{ if(S.level>=lv) fm=i; }); S.pet={id:v,form:fm,name:L.name,ribbon:'',equip:{}}; GAME.recalc(); const ev=GAME.gainXp(0); note=`${L.forms[0].emoji} ${L.name} bounds to your side!`; GAME.changed(); }
    else if(k==='petgear'){ const G=SYS.PET_GEAR[v]; S.pet.equip=S.pet.equip||{}; S.pet.equip[G.slot]=S.pet.equip[G.slot]===v?null:v; GAME.changed(); }
    else if(k==='livery'){ S.livery=v; GAME.changed(); }
    else if(k==='skin'){ S.mountSkin=v||null; GAME.changed(); GAME.save(); }
    else if(k==='view'){ VIEWMODE.set(v); note=v==='grand'?'Grand view: rebuilding the realm…':'Classic view: rebuilding the realm…'; render(true); setTimeout(()=>location.reload(),600); return; }
    else if(k==='decor'){ if(BOUNTY_API.cur){ toggle(false); BOUNTY_API.cur.place(v); } return; }
    else if(k==='travel'){ const t=SYS.MAP.towns.find(q=>q[0]===v); if(!t) return; toggle(false); ENGINE.go('world',{x:t[1]+0.5,z:t[2]+1.5,face:Math.PI}); setTimeout(()=>{ ENGINE.unstick(true); UI.toast(`🕊 You travel the roads to ${v}.`,1600); },900); return; }
    else if(k==='unstick'){ toggle(false); setTimeout(()=>{ if(!ENGINE.unstick()) UI.toast('You can already move from here.',1200); },60); return; }
    else if(k==='goal'){ S.goalOff=!S.goalOff; GAME.save(); render(true); return; }
    else if(k==='keys'){ toggle(false); if(typeof KEYS!=='undefined') KEYS.open(); return; }
    else if(k==='gfx'){ if(typeof HUD!=='undefined') HUD.setTier(v); note='Graphics: '+v; render(true); return; }
    else if(k==='vol'&&typeof SFX!=='undefined'){ SFX.stepVol(v); SFX.play('menu',true); render(true); return; }
    else if(k==='mocap'){ const K=ENGINE.K; K.mocapOff=!K.mocapOff; try{ localStorage.setItem('klk3d_mocap',K.mocapOff?'0':'1'); }catch(e){} render(true); return; }
    else if(k==='look2'){ try{ localStorage.setItem('klk3d_look2',(typeof LOOK2!=='undefined'&&LOOK2)?'0':'1'); }catch(e){} GAME.save&&GAME.save(); location.reload(); return; }
    else if(k==='journal'){ toggle(false); if(typeof JOURNAL!=='undefined') JOURNAL.open(); return; }
    else if(k==='pad'){ toggle(false); if(typeof PAD!=='undefined') PAD.open(); return; }
    else if(k==='save'){ note=GAME.save()?'Saved to Slot '+GAME.slot+'.':'This browser would not store the save — use Export Save Code.'; }
    else if(k==='slot'){ const n=+v; if(n===GAME.slot){ note='You are playing Slot '+n+'.'; } else if(GAME.peek(n)){ GAME.save(); GAME.load(n); note='Loaded Slot '+n+'.'; if(GAME.resume){ toggle(false); UI.toast(`📜 Slot ${n} — ${GAME.S.name}, Lv ${GAME.S.level}`,1600); GAME.resume(); return; } } else sub='confirm:'+n; render(true); return; }
    else if(k==='newgame'){ GAME.save(); GAME.newGame(+v); sub=null; note='A brand-new journey begins in Slot '+v+'.'; if(GAME.onNew) GAME.onNew(); }
    else if(k==='preset'){ const [n,pk]=v.split('.'); GAME.save(); GAME.newGame(+n,pk); sub=null; note=GAME.presets[pk].label+' — Slot '+n+'.'; if(GAME.onNew) GAME.onNew(); }
    else if(k==='export'||k==='import'||k==='erase'){ sub=sub===k?null:k; render(true); return; }
    else if(k==='copy'){ const t=$('gmCode'); navigator.clipboard&&navigator.clipboard.writeText(t.value).then(()=>{ note='Copied.'; render(true); }).catch(()=>{ t.select(); }); return; }
    else if(k==='doimport'){ const ok=GAME.importCode($('gmCode').value); note=ok?'Hero restored. Save to keep it in this slot.':'That code didn’t read as a save.'; sub=null; }
    else if(k==='doerase'){ GAME.erase(+v); note='Slot '+v+' erased.'; sub=null; }
    render(true); }
  rail.addEventListener('click',e=>{ const b=e.target.closest('[data-tab]'); if(!b) return; tab=+b.dataset.tab; note=''; sub=null; render(); });
  pane.addEventListener('click',e=>{ const b=e.target.closest('[data-act]'); if(b&&b.dataset.act) act(b.dataset.act); });
  // hover (or keyboard focus) reads a skill without a click; Enter learns the one in hand
  pane.addEventListener('pointerover',e=>{ if(e.pointerType==='touch') return; const g=e.target.closest&&e.target.closest('.sk-n'); if(!g||g.dataset.sk===skSel) return; skSel=g.dataset.sk; pane.querySelectorAll('.sk-n.sel').forEach(x=>x.classList.remove('sel')); g.classList.add('sel'); const d=$('skDetail'); if(d) d.innerHTML=detail(GAME.S,skSel); });
  pane.addEventListener('keydown',e=>{ const g=e.target.closest&&e.target.closest('.sk-n'); if(g&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); act(GAME.canBuy(g.dataset.sk)&&skSel===g.dataset.sk?'skill:'+g.dataset.sk:'sksel:'+g.dataset.sk); } });
  addEventListener('resize',()=>{ if(open&&TABS[tab]==='Skills') render(true); });
  el.addEventListener('pointerdown',e=>{ if(e.target===el) toggle(false); });
  $('gmClose').addEventListener('click',()=>toggle(false));
  function toggle(v){ open=v===undefined?!open:v; el.hidden=!open; if(open){ note=''; sub=null; render(); } else { GAME.save(); } }
  GAME.on(()=>{ if(open) render(true); });
  return { toggle, get open(){ return open; }, show:t=>{ tab=TABS.indexOf(t); toggle(true); } };
})();
