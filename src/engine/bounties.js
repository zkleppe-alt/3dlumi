// ════════════════════════════════════════════════════════════════
//  BOUNTIES & THE HOMESTEAD'S DECORATIONS (data/pastimes.json → bounty, trade.decor)
//   📜 A Hooded Stranger waits by the hearth of every inn (ensureStrangers). No work until Sir Aldric's Demon Hunt
//      is done; then up to three bounties at once (rollBounty): slay 6/9/12 demons that creep back into one zone
//      (the cull: they resurface there, and only there, on roads otherwise at peace), or win 1–2 tournaments.
//      Rewards: gold (need × (4+level), or 30 + need × (10 + 2·level)), and 30% a piece of gear you lack, 30% a
//      decoration. Claim at any stranger. Three bounties done in every cleansed inn-town wakes the Pretender's
//      rumour (checkPretenderUnlock).
//   🏡 Decorations (DECOR_ITEMS) from bounties and deliveries are placed from ☰ Home while you stand on your land:
//      face plain grass inside the Homestead (HS_BOUNDS), not a crop, the stand or a door, and Place. A placed piece
//      is solid; face it and Pick up to stow it again.
//  bountySystem(world, B, D, opt) → { onKill(d), onTourney(), culls(), quest(), homeTab(), place(id) }
// ════════════════════════════════════════════════════════════════
Object.assign(DECOR_KINDS,{
  angelStatue(d,g){ Cy(0.32,0.38,0.3,8,0xb8b0a0,0,0,0,g); Cy(0.16,0.22,0.9,8,0xe8e4dc,0,0.3,0,g); Sp(0.13,0xeeeae2,0,1.32,0,g);
    [-1,1].forEach(s=>{ const w=B(0.5,0.6,0.05,0xf4f0e8,s*0.28,0.75,-0.08,g); w.rotation.y=s*0.4; w.rotation.z=-s*0.2; }); B(0.26,0.02,0.26,0xf2d27a,0,1.48,0,g).rotation.x=0; },
  sapling(d,g){ Cy(0.04,0.06,0.7,6,0x6a4428,0,0,0,g); const c=new THREE.Mesh(new THREE.IcosahedronGeometry(0.38,0),flat(0x5aa05a)); c.position.y=0.9; g.add(c);
    [[0.2,0.95,0.2],[-0.18,0.8,0.15],[0.05,1.1,-0.2]].forEach(([x,y,z])=>Sp(0.06,0xd83a2a,x,y,z,g,6,4)); B(0.5,0.08,0.5,0x6a4a2a,0,0,0,g); },
  crossSword(d,g){ B(0.5,0.25,0.5,0x9a9488,0,0,0,g); B(0.12,1.5,0.12,0xe8e2d4,0,0.25,0,g); B(0.7,0.12,0.12,0xe8e2d4,0,1.2,0,g);
    const sw=B(0.06,1.0,0.02,0xd8dce4,0.2,0.3,0.1,g); sw.rotation.z=0.15; B(0.24,0.05,0.05,0xe8c25a,0.25,1.0,0.1,g); }
});

function bountySystem(world,BD,D,opt){
  const S=()=>GAME.S, P=ENGINE.P, E=UI.esc, DECOR=D.trade.decor;
  const BS=()=>{ const s=S(); return s.bounties||(s.bounties={active:[],complete:[],nextId:1,perTown:{},pretenderUnlocked:false}); };
  const huntDone=()=>!!(S().hunt&&S().hunt.done), won=()=>!!S().abaddonWon;
  const strip=h=>String(h).replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').trim();
  const cullName=b=>(b&&typeof b.zone==='number'&&BD.zoneNames[b.zone])||'the wilds';
  function pickZone(){ const used=new Set(BS().active.filter(b=>b.kind==='demons'&&typeof b.zone==='number').map(b=>b.zone)), all=BD.zoneNames.map((z,i)=>i), free=all.filter(i=>!used.has(i)), pool=free.length?free:all; return pool[(Math.random()*pool.length)|0]; }
  function roll(town){ const L=S().level, kinds=['demons']; if(huntDone()) kinds.push('tourney'); const kind=kinds[(Math.random()*kinds.length)|0], T=BD.titles[kind];
    const b={id:BS().nextId++,kind,got:0,town,title:T[(Math.random()*T.length)|0]};
    if(kind==='demons'){ b.need=6+3*Math.floor(Math.random()*3); b.reward={gold:b.need*(4+L)}; b.zone=pickZone(); } else { b.need=1+Math.floor(Math.random()*2); b.reward={gold:30+b.need*(10+2*L)}; }
    const pool=(SYS.BOUNTY_GEAR_POOL||[]).filter(g=>!S().ownedGear[g]), r=Math.random();
    if(r<0.30&&pool.length) b.reward.gear=pool[(Math.random()*pool.length)|0]; else if(r<0.60){ const ks=Object.keys(DECOR); b.reward.decor=ks[(Math.random()*ks.length)|0]; }
    return b; }
  const goal=b=>b.kind==='pretender'?'Cast the Pretender King out of Abaddon’s throne, in the Hellgate keep':b.kind==='demons'?`Slay ${b.need} demons — reported in ${cullName(b)}`:`Win ${b.need} tournament${b.need>1?'s':''}`;
  const rewardText=b=>{ const p=['🪙 '+b.reward.gold+' gold']; if(b.reward.gear&&SYS.EQUIP[b.reward.gear]) p.push((SYS.EQUIP[b.reward.gear].emoji||'')+' '+SYS.EQUIP[b.reward.gear].name); if(b.reward.decor) p.push(DECOR[b.reward.decor].emoji+' '+DECOR[b.reward.decor].name); return p.join(' · '); };
  const hd=()=>{ const s=S(); s.homesteadDecor=s.homesteadDecor||{inv:{},placed:[]}; s.homesteadDecor.inv=s.homesteadDecor.inv||{}; s.homesteadDecor.placed=s.homesteadDecor.placed||[]; return s.homesteadDecor; };
  function progress(kind,n){ let done=0; BS().active.forEach(b=>{ if(b.kind!==kind||b.got>=b.need) return; b.got=Math.min(b.need,b.got+n); if(b.got>=b.need) done++; });
    if(done) UI.toast('📜 Bounty complete! Seek a hooded stranger at any inn to claim your due.',2600); GAME.save(); }
  function innTowns(){ return [...new Set(Object.values(BD.innTown))].filter(t=>t<S().chapels); }
  function checkPretender(){ const bs=BS(); if(bs.pretenderUnlocked||!huntDone()||!won()) return; const t=innTowns(); if(!t.length||!t.every(x=>(bs.perTown[x]||0)>=BD.perTown)) return;
    bs.pretenderUnlocked=true; GAME.save(); setTimeout(()=>ENGINE.speak('A hooded stranger grips your arm.',['“The pit does not leave its crown unclaimed. One has taken Abaddon’s throne and calls himself king. Come to any inn hearth when you are ready to end him.”']),600); }
  function pay(b,f){ const bs=BS(), s=S(); bs.active=bs.active.filter(x=>x.id!==b.id); const g=Math.max(1,Math.round(b.reward.gold*s.goldMult)); GAME.addGold(g); let extra='';
    if(b.reward.gear&&!s.ownedGear[b.reward.gear]){ s.ownedGear[b.reward.gear]=true; extra=` The stranger presses ${SYS.EQUIP[b.reward.gear].name} into your hands.`; }
    else if(b.reward.decor){ const h=hd(); h.inv[b.reward.decor]=(h.inv[b.reward.decor]||0)+1; extra=` A ${DECOR[b.reward.decor].emoji} ${DECOR[b.reward.decor].name} for your Homestead.`; }
    if(b.town!==undefined) bs.perTown[b.town]=(bs.perTown[b.town]||0)+1; bs.complete.push({title:b.title,txt:rewardText(b)}); if(bs.complete.length>20) bs.complete.shift();
    GAME.changed(); GAME.save(); ENGINE.speak('📜 '+b.title+' — fulfilled.',[`+${g} gold.${extra}`],f); checkPretender(); }
  function talk(town,f){ const bs=BS(); const fin=bs.active.find(b=>b.kind!=='pretender'&&b.got>=b.need); if(fin){ pay(fin,f); return; }
    if(!huntDone()&&!bs.pretenderUnlocked){ ENGINE.speak('Hooded Stranger',[!won()?'“The demon king still holds Hellgate. Break his grip on the realm first, knight — then seek me out.”':'“The roads still crawl with the fleeing dark. Finish Sir Aldric’s hunt, and I’ll have work worthy of your blade.”'],f); return; }
    if(bs.pretenderUnlocked&&!bs.pretenderDefeated){ if(!bs.active.some(b=>b.kind==='pretender')){ bs.active.push({id:bs.nextId++,kind:'pretender',got:0,need:1,town,title:'The Pretender King',reward:{gold:500}}); GAME.save();
        ENGINE.speak('Hooded Stranger',['“He holds the black throne beneath Hellgate, wearing a crown he did not earn. Go down into the Citadel and cast him out. This is the last hunt.”'],f); }
      else ENGINE.speak('Hooded Stranger',['The pretender waits beneath Hellgate Citadel. End him, knight.'],f); return; }
    if(bs.active.length>=BD.cap){ ENGINE.speak('Hooded Stranger',['“Your hands are full, knight. Finish what you carry — the Quests page remembers it all.”'],f); return; }
    const b=roll(town); bs.active.push(b); GAME.save(); if(b.kind==='demons'&&opt.respawn) opt.respawn();
    const lines=[`“${b.title}.” ${goal(b)}.`]; if(b.kind==='demons') lines.push(`“Word has come from ${cullName(b)} — a number of them have crept back into the open. Hunt them down and put an end to them.”`);
    let gate=''; if(huntDone()&&won()&&town<S().chapels){ const d=bs.perTown[town]||0; gate=d>=BD.perTown?` This town’s debt is paid (${d}/${BD.perTown}).`:` ${(SYS.TOWN_DATA[town]||{}).name}: ${d}/${BD.perTown} bounties done.`; }
    lines.push('Reward: '+rewardText(b)+' · tracked in Quests.'+gate); ENGINE.speak('Hooded Stranger',lines,f); }
  // the demons a cull calls back: [{zi, n}] — what's owed on each demons bounty
  const culls=()=>BS().active.filter(b=>b.kind==='demons'&&typeof b.zone==='number').map(b=>({zi:b.zone,n:Math.max(0,b.need-b.got)}));
  // a stranger in an inn's common room: the free corner nearest the bottom right, clear of the door
  function stranger(lv,town){ const ex=lv.folk.find(f=>f.who==='Hooded Stranger'); if(ex){ ex.label='Talk'; ex.lines=null; ex.action=()=>talk(town,ex); return; } let best=null; for(let y=Math.floor(lv.H||12)-2;y>=1&&!best;y--) for(let x=Math.floor(lv.W||16)-2;x>=1&&!best;x--){ const cx=x+0.5, cz=y+0.5;
      if(!lv.canMove(cx,cz,cx,cz)) continue; if(lv.folk.some(f=>Math.hypot(f.x-cx,f.z-cz)<1.4)) continue; if(lv.spots.some(s=>Math.hypot(s.x-cx,s.z-cz)<1.6)) continue; if(cz>(lv.H||12)-2.2&&Math.abs(cx-(lv.W||16)/2)<3) continue; best={x:cx,z:cz}; }
    if(!best) return; const f=addPerson(lv,lv.room||lv.scene,'shadeTr',best.x,best.z,0,'Hooded Stranger',null,{rest:Math.atan2((lv.W||16)/2-best.x,(lv.H||12)/2-best.z)}); f.label='Talk'; f.action=()=>talk(town,f); }
  function quest(){ const bs=BS(); let h=''; if(!huntDone()&&!bs.pretenderUnlocked) return '<p class="gm-empty">🔒 Locked — the hooded strangers offer no work until Sir Aldric’s Demon Hunt is finished.</p>';
    if(!bs.active.length) h+='<p class="gm-empty">No bounties held — a hooded stranger waits by every inn’s hearth.</p>';
    bs.active.forEach(b=>{ h+=`<div class="gm-q"><b>${E(b.title)}</b> ${b.got>=b.need?'<b class="green">✓ claim at any stranger</b>':`${b.got}/${b.need}`}<br>${E(goal(b))}<br><span class="ds">${E(rewardText(b))}</span></div>`; });
    if(bs.complete.length) h+=`<p class="gm-hint">Fulfilled: ${bs.complete.slice(-5).map(c=>E(c.title)).join(' · ')}</p>`;
    if(won()&&huntDone()) h+=`<p class="gm-hint">Towns: ${innTowns().map(t=>`${E(SYS.TOWN_DATA[t].name)} ${(bs.perTown[t]||0)}/${BD.perTown}`).join(' · ')}</p>`; return h; }

  // ── 🏡 decorations on your land ──
  const HS=BD.hs, inHome=(x,y)=>x>=HS.x0&&x<=HS.x1&&y>=HS.y0&&y<=HS.y1;
  const placedAt=(x,y)=>hd().placed.find(p=>{ const w=DECOR[p.id].w; return x>=p.x&&x<p.x+w&&y>=p.y&&y<p.y+w; });
  const doors=WORLD_DATA.buildings.filter(b=>b.door).map(b=>b.door);
  function ok(id,tx,ty){ const it=DECOR[id]; if(!it) return false; for(let dy=0;dy<it.w;dy++) for(let dx=0;dx<it.w;dx++){ const x=tx+dx, y=ty+dy;
      if(!inHome(x,y)||world.T(x,y)!==0||!world.WK(x,y)) return false; if(S().crops&&S().crops[x+','+y]) return false; if(D.sellSpot===x+','+y) return false;
      if(doors.some(d=>d.x===x&&(d.y===y||d.y+1===y))) return false; if(placedAt(x,y)) return false; if(Math.floor(P.x)===x&&Math.floor(P.z)===y) return false; } return true; }
  const models=[]; function rebuild(){ models.forEach(m=>world.scene.remove(m)); models.length=0;
    hd().placed.forEach(p=>{ const it=DECOR[p.id], fn=DECOR_KINDS[it.kind]; if(!fn) return; const g=new THREE.Group(); fn({x:p.x,y:p.y,w:it.w,kind:it.kind},g,world.anim);
      if(it.kind==='fountain') g.scale.setScalar(0.72); g.position.x+=p.x+(it.w===2?1:0.5); g.position.z+=p.y+(it.w===2?1:0.5); g.position.y=world.ground(p.x+0.5,p.y+0.5); world.scene.add(shade(g)); models.push(g); }); }
  const baseMove=world.canMove; world.canMove=(fx,fz,tx,tz)=>{ const bx=Math.floor(tx), by=Math.floor(tz); if((bx!==Math.floor(fx)||by!==Math.floor(fz))&&inHome(bx,by)&&placedAt(bx,by)) return false; return baseMove(fx,fz,tx,tz); };
  let placing=null; const ghost=new THREE.Mesh(new THREE.BoxGeometry(1,0.06,1),new THREE.MeshBasicMaterial({color:0x6fdf8a,transparent:true,opacity:0.45,depthWrite:false})); ghost.visible=false; world.scene.add(ghost);
  const cancelB=document.createElement('button'); cancelB.className='act'; cancelB.id='stowBtn'; cancelB.textContent='✕ Stow'; cancelB.hidden=true;
  cancelB.style.cssText='position:fixed;right:calc(26px + env(safe-area-inset-right,0px));bottom:calc(200px + env(safe-area-inset-bottom,0px));padding:10px 14px;border-radius:22px;border:1px solid rgba(255,138,138,.8);background:rgba(22,32,46,.75);color:#ffd0d0;font:700 13px var(--f-body);z-index:6';
  document.body.appendChild(cancelB); cancelB.addEventListener('click',()=>{ placing=null; ghost.visible=false; cancelB.hidden=true; UI.toast('Placement stowed.',900); });
  const facing=()=>[Math.floor(P.x+Math.sin(P.face)*1.0),Math.floor(P.z+Math.cos(P.face)*1.0)];
  const spot={x:0,z:0,r:0.2,label:'Place',who:'Your land',action:()=>{ if(placing){ const [fx,fy]=facing(); if(!ok(placing,fx,fy)){ UI.toast('Not here — needs open grass on your land.',1200); return; }
        const h=hd(), id=placing; h.inv[id]--; if(h.inv[id]<=0) delete h.inv[id]; h.placed.push({id,x:fx,y:fy}); rebuild(); GAME.save(); const left=h.inv[id]||0;
        UI.toast(`🏡 ${DECOR[id].emoji} placed!${left>0?` (${left} more)`:''}`,1400); if(left<=0){ placing=null; ghost.visible=false; cancelB.hidden=true; } return; }
      const [fx,fy]=facing(), p=placedAt(fx,fy); if(!p) return; const h=hd(); h.placed.splice(h.placed.indexOf(p),1); h.inv[p.id]=(h.inv[p.id]||0)+1; rebuild(); GAME.save(); UI.toast(`🏡 ${DECOR[p.id].emoji} ${DECOR[p.id].name} stowed.`,1200); }};
  function place(id){ if((hd().inv[id]||0)<=0) return; const tx=Math.floor(P.x), ty=Math.floor(P.z); if(ENGINE.level!==world||!inHome(tx,ty)){ UI.toast('🏡 Bring your decorations home — this is for the Homestead.',1800); return; }
    placing=id; cancelB.hidden=false; UI.toast(`🏡 Placing: ${DECOR[id].emoji} ${DECOR[id].name} — face a grassy spot and tap Place.`,2600); }
  world.anim.push(()=>{ if(ENGINE.level!==world){ if(placing){ placing=null; cancelB.hidden=true; ghost.visible=false; } return; } const L=world.spots, i=L.indexOf(spot), [fx,fy]=facing();
    if(placing){ const w=DECOR[placing].w, good=ok(placing,fx,fy); ghost.visible=true; ghost.scale.set(w,1,w); ghost.position.set(fx+w/2,world.ground(fx+0.5,fy+0.5)+0.04,fy+w/2); ghost.material.color.setHex(good?0x6fdf8a:0xe05a5a);
      spot.label='Place'; spot.x=P.x; spot.z=P.z; if(i<0) L.push(spot); return; }
    ghost.visible=false; const p=inHome(fx,fy)&&placedAt(fx,fy); if(p){ spot.label='Pick up'; spot.who=DECOR[p.id].name; spot.x=P.x; spot.z=P.z; if(i<0) L.push(spot); } else if(i>=0) L.splice(i,1); });
  const prevEnter=world.onEnter; world.onEnter=sp=>{ rebuild(); prevEnter&&prevEnter(sp); };
  function homeTab(){ const h=hd(), kinds=Object.keys(h.inv).filter(k=>h.inv[k]>0&&DECOR[k]), n=h.placed.length, here=ENGINE.level===world&&inHome(Math.floor(P.x),Math.floor(P.z));
    let out=`<div class="gm-row"><span>🏡 The Homestead</span><b>${n} placed · ${kinds.length} kind${kinds.length===1?'':'s'} in store</b></div>`;
    if(!kinds.length) out+='<p class="gm-empty">Nothing in store — bounties and deliveries bring decorations.</p>';
    else if(!here) out+='<p class="gm-empty">You are away from home — travel to the Homestead to place decorations.</p>';
    kinds.forEach(k=>{ out+=`<button class="gm-item ${here?'':'locked'}" data-act="${here?'decor:'+k:''}"><span>${DECOR[k].emoji} ${E(DECOR[k].name)} ×${h.inv[k]} <span class="ds">${DECOR[k].w}×${DECOR[k].w}</span></span><i>${here?'place':''}</i></button>`; });
    if(n) out+='<p class="gm-hint">Face a placed piece at the farm and tap Pick up to stow it.</p>'; return out; }
  return { onKill:()=>progress('demons',1), onTourney:()=>progress('tourney',1), culls, quest, homeTab, place, stranger, rebuild };
}
const BOUNTY_API={cur:null};
