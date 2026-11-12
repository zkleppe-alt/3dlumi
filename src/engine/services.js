// ════════════════════════════════════════════════════════════════
//  SERVICES — the shop, the inn and the stylist, with KLK's own rules:
//   openShop(town, keeper, {items,title,greet}?): SHOP_ITEMS (or the given wares, e.g. Reuben's) (the lantern once Saltmere is free) + that town's PET_GEAR piece; tap a ware, tap again to buy
//   openInn(who):   a bed until Dawn / Morning / Evening → fade, full heal, save, wake at that hour (REST_OPTS)
//   openStylist():  RIBBONS for your companion, all free
// ════════════════════════════════════════════════════════════════
const SERVICES=(function(){
  const E=UI.esc;
  function shopItems(town){ const items=Object.keys(SYS.SHOP_ITEMS).filter(k=>k!=='lantern'&&!SYS.SHOP_ITEMS[k].reuben);
    for(const k in SYS.PET_GEAR) if(SYS.PET_GEAR[k].town===town) items.push(k);
    if(GAME.S.chapels>1&&!GAME.S.hasLamp) items.push('lantern'); return items; }
  const item=k=>SYS.SHOP_ITEMS[k]||SYS.PET_GEAR[k];
  function owned(k){ const S=GAME.S, it=item(k); if(SYS.PET_GEAR[k]) return !!S.petGear[k]; if(it.lamp) return S.hasLamp; if(it.gear) return !!S.ownedGear[it.gear]; return false; }
  function openShop(town,keeper,o){ o=o||{}; let sel=-1, msg='';
    const draw=()=>{ const S=GAME.S, items=o.items?o.items.slice():shopItems(town); let h=`<p class="gm-intro">${E(keeper||'Merchant')}: ${E(o.greet||'“Wares from every corner of the realm!”')} <b style="color:var(--gold)">You have ${S.gold}g.</b></p>`;
      if(msg) h+=`<p class="gm-note">${E(msg)}</p>`;
      const groups=[['Potions & food',k=>SYS.POTIONS[k]||k==='bread'],['Arms & armour',k=>item(k).gear],['For your companion',k=>SYS.PET_GEAR[k]],['Seed & sundries',()=>true]], used=new Set();
      groups.forEach(([t,f])=>{ const ks=items.filter(k=>!used.has(k)&&f(k)); if(!ks.length) return; ks.forEach(k=>used.add(k)); h+=`<div class="gm-sec">${t}</div>`;
        ks.forEach(k=>{ const it=item(k), i=items.indexOf(k), own=owned(k), have=GAME.S.inventory[k];
          h+=`<button class="gm-item ${i===sel?'worn':''} ${own?'locked':''}" data-act="${own?'':'pick:'+i}"><span>${it.emoji} ${E(it.name)} — <b style="color:var(--gold)">${it.price}g</b> <span class="ds">${E(it.note||'')}${have?` · you carry ${have}`:''}</span></span><i>${own?'owned':i===sel?'buy':''}</i></button>`; }); });
      UI.sheet({title:o.title||'🏪 Capital Market Hall',html:h,keepScroll:true,act:a=>{ const i=+a.split(':')[1]; if(i===sel) buy(items[i]); else { sel=i; msg=item(items[i]).note||''; } draw(); }}); };
    function buy(k){ const S=GAME.S, it=item(k); if(owned(k)){ msg=`You already own the ${it.name}.`; return; } if(S.gold<it.price){ msg=`Not enough gold for ${it.name}.`; return; }
      S.gold-=it.price;
      if(SYS.PET_GEAR[k]){ S.petGear[k]=true; msg=`Bought ${it.emoji} ${it.name}! Equip it from the 🐾 Pet tab.`; }
      else if(it.lamp){ S.hasLamp=true; msg=`Bought ${it.emoji} ${it.name}! Its light will pierce the fog of the deep wood.`; }
      else if(it.gear){ S.ownedGear[it.gear]=true; msg=`Bought ${it.emoji} ${it.name}! Equip it in the ☰ menu.`; }
      else { S.inventory[k]=(S.inventory[k]||0)+1; msg=`Bought ${it.emoji} ${it.name}!`; }
      GAME.changed(); GAME.save(); }
    draw(); }
  const REST_OPTS={ dawn:{frac:6/24,label:'Dawn',time:'6:00 AM',icon:'🌅',phrase:'You rise with the first light.'},
    morning:{frac:7/24,label:'Morning',time:'7:00 AM',icon:'☀️',phrase:'You rest until morning.'},
    evening:{frac:20.5/24,label:'Evening',time:'8:30 PM',icon:'🌇',phrase:'You sleep the day away and rise at dusk.'} };
  function openInn(who){ const h=`<p class="gm-intro">${E(who)}: “A bed’s made up for you, knight. Sleep until…”</p>`
      +Object.entries(REST_OPTS).map(([k,o])=>`<button class="gm-item" data-act="${k}"><span>${o.icon} ${o.label} <span class="ds">${o.time}</span></span></button>`).join('')
      +`<button class="gm-item" data-act="no"><span>✋ Never mind</span></button>`;
    UI.sheet({title:'🛏 The Gilded Gate Inn',html:h,act:k=>{ UI.close(); if(k==='no') return; const o=REST_OPTS[k], S=GAME.S, fade=$('fade');
      fade.classList.add('on'); setTimeout(()=>{ if(o.frac<=S.dayFrac) S.day++; S.dayFrac=o.frac; S.hp=S.maxHp; for(const f in GAME.fx) delete GAME.fx[f]; GAME.changed(); GAME.save();
        fade.classList.remove('on'); UI.toast(o.phrase+' Fully rested — saved.',2600); },1100); }}); }
  const RIBBONS=['','🎀','⭐','🔥','✝','🌊','🍀'];
  function openStylist(){ const S=GAME.S; if(!S.pet){ ENGINE.speak('Pet Stylist',['💈 The stylist smiles — "Bring me a companion to dress, dear!"']); return; }
    let tab='ribbons', note='';   // two tabs, as in renderStylistFrame: 🎀 Ribbons (free) and 🎨 Looks (PET_LOOKS)
    const draw=()=>{ const f=SYS.PETS[S.pet.id].forms[S.pet.form], looks=typeof PETLOOKS!=='undefined'&&PASTIME_DATA&&PASTIME_DATA.looks;
      let h=(looks?`<div style="display:flex;gap:6px;margin-bottom:6px"><button class="gm-item ${tab==='ribbons'?'worn':''}" style="flex:1;justify-content:center" data-act="tab:ribbons">🎀 Ribbons</button><button class="gm-item ${tab==='looks'?'worn':''}" style="flex:1;justify-content:center" data-act="tab:looks">🎨 Looks</button></div>`:'')
        +(note?`<p class="gm-note">${E(note)}</p>`:'');
      if(tab==='looks'&&looks) h+=PETLOOKS.stylistTab();
      else { h+=`<div class="gm-pet">${f.emoji}${S.pet.ribbon||''}</div><p class="gm-intro" style="text-align:center">“Every champion deserves a touch of flair! Pick a ribbon — first one’s free, all of them are free.”</p>`;
        RIBBONS.forEach((rb,i)=>{ const cur=(S.pet.ribbon||'')===rb; h+=`<button class="gm-item ${cur?'worn':''}" data-act="rib:${i}"><span>${rb||'∅'} ${rb?'Ribbon':'No ribbon'}</span>${cur?'<i>✓</i>':''}</button>`; }); }
      UI.sheet({title:'💈 Pet Stylist of Stormgate',html:h+'<p class="gm-hint">Shown on your companion and in the Pet tab.</p>',keepScroll:true,act:a=>{ const [k,v]=a.split(':'); note='';
          if(k==='tab') tab=v; else if(k==='rib'){ S.pet.ribbon=RIBBONS[+v]; GAME.changed(); } else note=PETLOOKS.act(a)||''; draw(); },
        close:()=>{ if(typeof PETLOOKS!=='undefined') PETLOOKS.endTry(); GAME.save(); }}); };
    draw(); }
  // 🐎 the Homestead Stables (openBarn / renderBarn): swap the companion at your side with one resting here
  function openStables(){ const S=GAME.S; S.barnPets=S.barnPets||[];
    const card=(p,label)=>{ if(!p) return `<p class="gm-empty">— ${label} —</p>`; const L=SYS.PETS[p.id], f=L.forms[p.form]; return `<span>${f.emoji}${p.ribbon||''} ${E(L.name)} <span class="ds">${E(f.name)} · ${label}</span></span>`; };
    const draw=()=>{ let h='<p class="gm-intro">Your faithful companions rest here. Bring one out to your side — the one at your side will take its place in the stall.</p><div class="gm-sec">At your side</div>';
      h+=S.pet?`<div class="gm-item worn">${card(S.pet,'active')}</div>`:'<p class="gm-empty">— none —</p>'; h+='<div class="gm-sec">In the stables</div>';
      if(!S.barnPets.length) h+='<p class="gm-empty">The stalls stand empty. Companions you set aside will rest here.</p>';
      S.barnPets.forEach((p,i)=>{ h+=`<button class="gm-item" data-act="${i}">${card(p,'stabled')}<i>bring out</i></button>`; });
      UI.sheet({title:'🐎 The Homestead Stables',html:h,act:a=>{ const i=+a, q=S.barnPets[i]; if(!q) return; S.barnPets.splice(i,1); if(S.pet) S.barnPets.push(S.pet); S.pet=q; GAME.recalc(); GAME.changed(); GAME.save(); draw(); }}); };
    draw(); }
  return { openShop, openInn, openStylist, shopItems, openStables };
})();
