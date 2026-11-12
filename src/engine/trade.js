// ════════════════════════════════════════════════════════════════
//  THE SUPPLY WAGON & THE TRADE EMPIRE — opens when the Demon Hunt is done (S.wagon.unlocked); the game's rules
//  (data/pastimes.json → trade):
//   · the Old Mule's cart waits at the Homestead bay (WAGON_HOME). Load it from your packs (WAGON_CAP crates:
//     harvest, catch and every town's material), hitch up and drive: quick on roads and bridges (×1.5), slow on
//     open ground (×0.85), never through the shallow surf, never into a building. Park on solid ground.
//   · each town makes one MATERIAL; its shopkeeper sells it (cheapest there) and becomes your trade partner.
//   · CONTRACTS: 1–3 goods, 3–10 crates, for a cleansed town the cart can drive to, paid by value × 2 ×
//     (1 + distance from home ÷ 60) × variety × bulk. Take them at the Homestead board or a post you own; hold three.
//     Drive to the town's drop-off (its chapel door) and Deliver. 30% of finished contracts add a decoration.
//   · TRADE POSTS for sale after 1,000 g of contract earnings (2,000 g + distance, at most 4,000): the town's own
//     donkey and cart park outside the shop, and the shopkeeper posts contracts too.
//   · after 8 contracts for a town, HIRE its shopkeeper (1,500 g): one contract at a time on a round-trip clock that
//     only turns while you play, profit less a 20% wage, up to ten runs banked until you collect.
//  tradeSystem(world, T, TD) → { unlocked(), shopMenu(tid, openWares), questLine() }
// ════════════════════════════════════════════════════════════════
function tradeSystem(world,T,TD){
  const S=()=>GAME.S, P=ENGINE.P, K=ENGINE.K, E=UI.esc, inv=()=>S().inventory;
  const GOODS=Object.assign({},(typeof PASTIME_DATA!=='undefined'?PASTIME_DATA.goods:{}));
  for(const k in T.materials){ const M=T.materials[k]; GOODS[k]={name:M.name,emoji:M.emoji,value:M.value}; }
  const unlocked=()=>!!(S().wagon&&S().wagon.unlocked);
  const W=()=>{ const s=S(); s.wagon=s.wagon||{}; const w=s.wagon; if(w.x===undefined){ w.x=T.home.x; w.y=T.home.y; } w.cargo=w.cargo||{}; w.cur=w.cur||'homestead'; return w; };
  const EM=()=>{ const s=S(); return s.empire||(s.empire={earned:0,done:{},active:[],offers:{},posts:{},nextId:1,carts:{}}); };
  const cleansed=t=>t<S().chapels;
  const cargoCount=()=>Object.values(W().cargo).reduce((a,b)=>a+b,0);
  const itemsText=(items,got)=>Object.keys(items).map(g=>GOODS[g].emoji+'×'+items[g]+(got&&got[g]?` (${got[g]})`:'')).join(' ');
  const contractLeft=c=>{ let n=0; for(const g in c.items) n+=Math.max(0,c.items[g]-((c.got[g])|0)); return n; };
  const contractCost=items=>{ let c=0; for(const g in items) c+=GOODS[g].value*items[g]; return c; };
  const townDistance=t=>{ const p=T.points[t]; if(!p) return 20; return Math.round(Math.hypot(p.x-T.home.x,p.y-T.home.y)); };
  const cartSkin=id=>id==='homestead'?'homestead':T.towns[+id].cart, cartName=id=>T.carts[cartSkin(id)].name;
  const owns=t=>!!(EM().posts[t]&&EM().posts[t].owned);

  // ── where a cart can go (tradeReachFrom): walkable land, doors, piers and bridges, not the surf; no stairs needed ──
  const reachCache={};
  function reachFrom(x,y){ const k=x+','+y; if(reachCache[k]) return reachCache[k];
    const Wd=world.W, Hd=world.H, seen=new Uint8Array(Wd*Hd), q=[[x,y]]; seen[y*Wd+x]=1;
    const drive=(a,b)=>{ if(a<0||b<0||a>=Wd||b>=Hd) return false; const t=world.T(a,b); if(t===20) return false; return world.WK(a,b)||t===9||t===12; };
    while(q.length){ const [a,b]=q.pop(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const na=a+dx, nb=b+dy; if(na<0||nb<0||na>=Wd||nb>=Hd||seen[nb*Wd+na]||!drive(na,nb)) continue; seen[nb*Wd+na]=1; q.push([na,nb]); } }
    const set={}; for(const t in T.points){ const p=T.points[t]; if(seen[p.y*Wd+p.x]||seen[p.dy*Wd+p.dx]) set[t]=true; } return (reachCache[k]=set); }
  const origin=board=>board==='home'?[T.home.x,T.home.y]:T.towns[+board].spot;

  // ── contracts ──
  function contractPay(items,tid){ let base=0, crates=0, kinds=0; for(const g in items){ base+=GOODS[g].value*items[g]; crates+=items[g]; kinds++; }
    const dist=1+townDistance(tid)/60, variety=1+0.2*(kinds-1), bulk=1+0.02*Math.max(0,crates-5); return Math.round(base*2*dist*variety*bulk*(S().goldMult||1)); }
  function rollContract(board){ const [ox,oy]=origin(board), reach=reachFrom(ox,oy), towns=[];
    for(let t=0;t<9;t++) if(reach[t]&&cleansed(t)&&String(t)!==String(board)) towns.push(t); if(!towns.length) return null;
    const tid=towns[(Math.random()*towns.length)|0], pool=T.goods.concat(Object.keys(T.materials).filter(k=>T.materials[k].town!==tid));
    const kinds=1+((Math.random()*3)|0), total=3+((Math.random()*8)|0), picks=[]; while(picks.length<kinds){ const g=pool[(Math.random()*pool.length)|0]; if(!picks.includes(g)) picks.push(g); }
    const items={}; let left=total; picks.forEach((g,i)=>{ const n=i===picks.length-1?left:Math.max(1,Math.min(left-(picks.length-1-i),1+((Math.random()*Math.ceil(total/kinds))|0))); items[g]=n; left-=n; });
    const c={id:EM().nextId++,tid,who:T.names[(Math.random()*T.names.length)|0],items,got:{},board:String(board)}; c.pay=contractPay(items,tid); return c; }
  function refill(board){ board=String(board); const em=EM(), list=em.offers[board]||(em.offers[board]=[]); for(let n=0;list.length<T.offers&&n<20;n++){ const c=rollContract(board); if(!c) break; list.push(c); } return list; }

  // ── a sheet with tappable rows (the game's tmenu: tap a row, tap again to confirm) ──
  function menu(build){ let sel=-1, msg=''; const draw=()=>{ const m=build(); let h=`<p class="gm-intro">${m.body||''} <b style="color:var(--gold)">🪙 ${S().gold}g</b></p>`; if(msg) h+=`<p class="gm-note">${E(msg)}</p>`;
      m.rows.forEach((r,i)=>{ h+=`<button class="gm-item ${i===sel?'worn':''} ${r.dim?'locked':''}" data-act="${r.dim&&!r.fn?'':i}"><span>${r.label}${r.sub?` <span class="ds">${r.sub}</span>`:''}</span><i>${i===sel&&r.fn?'confirm':''}</i></button>`; });
      UI.sheet({title:m.title,html:h,keepScroll:true,act:a=>{ const i=+a, r=build().rows[i]; if(!r||!r.fn) return; if(i!==sel&&!r.now){ sel=i; msg=''; draw(); return; } sel=-1; const res=r.fn(); if(UI.open&&res!==false){ msg=res||''; draw(); } }}); };
    draw(); }
  function boardMenu(board){ board=String(board); return ()=>{ const em=EM(), offers=refill(board);
    const title=board==='home'?'📜 Homestead Trade Board':`📜 ${TD[+board].name} Trade Post`;
    const mine=em.active.length?'Your contracts: '+em.active.map(c=>`${E(TD[c.tid].name)} ${itemsText(c.items,c.got)}`).join(' · '):`You hold no contracts. Take up to ${T.hold}.`;
    const rows=offers.map(c=>({ label:`${E(c.who)} of <b>${E(TD[c.tid].name)}</b> — ${itemsText(c.items)}`, sub:`🪙 ${c.pay}g · ${townDistance(c.tid)} leagues from home`,
      fn:()=>{ if(em.active.length>=T.hold) return `You can hold ${T.hold} contracts at once.`; em.active.push(c); offers.splice(offers.indexOf(c),1); refill(board); GAME.save();
        return `Taken: ${c.who} of ${TD[c.tid].name}. Load a cart and deliver to the chapel door.`; } }));
    if(!offers.length) rows.push({label:'— nothing posted —',sub:'contracts come from cleansed towns the cart can drive to',dim:true});
    em.active.forEach(c=>rows.push({label:`✕ Drop ${E(c.who)}’s contract (${E(TD[c.tid].name)})`,dim:true,fn:()=>{ em.active=em.active.filter(x=>x!==c); GAME.save(); return 'Dropped. Anything already delivered stays delivered.'; }}));
    return {title,body:mine,rows}; }; }

  // ── trade posts and managers ──
  const postCost=t=>Math.min(4000,2000+Math.round(townDistance(t)*10/50)*50);
  function buyPost(t){ const em=EM(), cost=postCost(t); if(em.earned<T.postUnlock) return `Earn ${T.postUnlock}g from contracts first.`; if(S().gold<cost) return `You need ${cost}g.`;
    GAME.addGold(-cost); const sp=T.towns[t].spot; em.posts[t]={owned:true,mgr:null}; em.carts[String(t)]={x:sp[0],y:sp[1],cargo:{}}; refill(t); GAME.save(); placeCarts();
    UI.toast(`🏷️ ${TD[t].name} Trade Post is yours! ${cartName(t)} waits outside with the cart.`,3600); return `The post is yours. ${cartName(t)} is hitched outside.`; }
  function mgrJob(t){ const [ox,oy]=T.towns[t].spot, c=rollContract(t); if(!c) return null; const p=T.points[c.tid], d=p?Math.hypot(p.x-ox,p.y-oy):40;
    return {to:c.tid,net:Math.max(1,Math.round((c.pay-contractCost(c.items))*(1-T.mgrWage))),dur:Math.round(20+d*2/4),t:0}; }
  function hireMgr(t){ const em=EM(); if(!owns(t)) return 'Buy the trade post first.'; if((em.done[t]|0)<T.mgrAfter) return `Complete ${T.mgrAfter} contracts for ${TD[t].name} first.`;
    if(S().gold<T.mgrCost) return `You need ${T.mgrCost}g.`; GAME.addGold(-T.mgrCost); em.posts[t].mgr={job:null,bank:0,runs:0}; GAME.save(); return `${T.towns[t].keeper} will run the post. Come back for the profits.`; }
  function collect(t){ const em=EM(), m=em.posts[t]&&em.posts[t].mgr; if(!m||!m.bank) return 'Nothing to collect yet.'; const g=m.bank; GAME.addGold(g); em.earned+=g; m.bank=0; m.runs=0; GAME.save(); return `+${g}g collected.`; }
  // the managers' clock turns only while the game runs
  let lastT=performance.now();
  setInterval(()=>{ const now=performance.now(), dt=Math.min(5,(now-lastT)/1000); lastT=now; if(document.hidden||!unlocked()) return; const em=EM();
    for(const t in em.posts){ const m=em.posts[t]&&em.posts[t].mgr; if(!m||m.runs>=T.mgrBank) continue; if(!m.job) m.job=mgrJob(+t); if(!m.job) continue; m.job.t+=dt; if(m.job.t>=m.job.dur){ m.bank+=m.job.net; m.runs++; m.job=null; } } },1000);

  // a shopkeeper after the hunt: wares, the town's material, the post, the manager (shopTradeMenu)
  function shopMenu(t,openWares){ const TT=T.towns[t], mk=Object.keys(T.materials).find(k=>T.materials[k].town===t), M=T.materials[mk];
    menu(()=>{ const em=EM(), rows=[{label:'🛍️ Browse wares',now:true,fn:()=>{ UI.close(); setTimeout(openWares,50); return false; }}];
      const buy=n=>()=>{ const cost=M.value*n; if(S().gold<cost) return 'Not enough gold.'; GAME.addGold(-cost); inv()[mk]=(inv()[mk]||0)+n; GAME.save(); return `Bought ${n} ${M.emoji} ${M.name}. (you have ${inv()[mk]})`; };
      rows.push({label:`Buy ${M.emoji} ${E(M.name)} — ${M.value}g`,sub:`you have ${inv()[mk]||0}`,now:true,fn:buy(1)}); rows.push({label:`Buy 5 ${M.emoji} ${E(M.name)} — ${M.value*5}g`,now:true,fn:buy(5)});
      const post=em.posts[t];
      if(!owns(t)){ if(em.earned<T.postUnlock) rows.push({label:'🔒 Trade post',dim:true,sub:`earn ${T.postUnlock}g from contracts first (${em.earned}/${T.postUnlock})`});
        else rows.push({label:`🏷️ Buy the ${E(TD[t].name)} Trade Post — ${postCost(t)}g`,sub:`your own ${E(cartName(t))} and cart, and contracts here`,fn:()=>buyPost(t)}); }
      else { rows.push({label:'📜 Contracts',sub:`${(em.offers[t]||[]).length} posted here`,now:true,fn:()=>{ menu(boardMenu(t)); return false; }});
        if(!post.mgr){ const d=em.done[t]|0; if(d<T.mgrAfter) rows.push({label:'🔒 Hire a manager',dim:true,sub:`complete ${T.mgrAfter} contracts for ${E(TD[t].name)} (${d}/${T.mgrAfter})`});
          else rows.push({label:`🤝 Hire the ${E(TT.keeper)} to run the post — ${T.mgrCost}g`,sub:`one contract at a time while you adventure · keeps a ${Math.round(T.mgrWage*100)}% wage`,fn:()=>hireMgr(t)}); }
        else { const m=post.mgr, left=m.job?Math.max(0,Math.ceil(m.job.dur-m.job.t)):0;
          rows.push({label:m.bank?`💰 Collect ${m.bank}g (${m.runs} run${m.runs===1?'':'s'})`:'💰 Nothing to collect yet',dim:!m.bank,sub:m.runs>=T.mgrBank?'the strongbox is full — collect to keep them working':(m.job?`on the road to ${E(TD[m.job.to].name)} · back in ${left}s`:'between runs'),fn:()=>collect(t)}); } }
      return {title:`🏪 ${E(TT.keeper)}`,body:`${E(TT.keeper)}: “${M.emoji} ${E(M.name)} is what ${E(TD[t].name)} makes. Cheapest here.”`,rows}; }); }

  // ── the carts: the one in use (S.wagon) and the parked ones (S.empire.carts) ──
  const models={}, board=group(T.board.x+0.5,0,T.board.y+0.5,world.scene);
  { B(0.1,1.5,0.1,0x6a4428,-0.5,0,0,board); B(0.1,1.5,0.1,0x6a4428,0.5,0,0,board); B(1.2,0.8,0.08,0x8a5e3a,0,0.65,0,board); const r=prism(1.4,0.35,0.3,0x7a4a2e); r.position.y=1.5; board.add(r);
    [[-0.3,1.1],[0.15,1.05],[0.35,0.85],[-0.2,0.85]].forEach(([x,y],i)=>{ const p=B(0.26,0.2,0.02,i%2?0xf4ecd8:0xe8dcc0,x,y-0.1,0.05,board); p.rotation.z=(i-1.5)*0.08; }); shade(board); board.visible=false; }
  function model(id){ if(!models[id]){ const m=donkeyCart(T.carts[cartSkin(id)]); world.scene.add(m); models[id]=m; } models[id].scale.setScalar(Math.max(0.6,VIEWMODE.ps(world))); return models[id]; }
  let driving=false;
  function placeCarts(){ const on=unlocked(); board.visible=on; board.position.y=world.ground(T.board.x+0.5,T.board.y+0.5);
    const w=W(), em=EM(), want=new Set(); if(on){ want.add(w.cur); for(const id in em.carts) want.add(id); }
    for(const id in models) models[id].visible=want.has(id);
    if(!on) return; const put=(id,c)=>{ const m=model(id); m.visible=true; if(id===w.cur&&driving) return; m.position.set(c.x+0.5+0.5,world.ground(c.x+0.5,c.y+0.5),c.y+0.5); m.rotation.y=0; };
    put(w.cur,w); for(const id in em.carts) if(id!==w.cur) put(id,em.carts[id]); }
  function useCart(id){ id=String(id); const w=W(), em=EM(); if(w.cur===id||driving) return; em.carts[w.cur]={x:w.x,y:w.y,cargo:w.cargo}; const c=em.carts[id]; if(!c) return;
    w.x=c.x; w.y=c.y; w.cargo=c.cargo; w.cur=id; delete em.carts[id]; placeCarts(); }
  // a parked cart and its donkey fill two tiles; the board one. All solid, as in the game (tradeBlocks)
  const baseMove=world.canMove, baseSpeed=world.speedMult;
  const cartAt=(x,y)=>{ if(!unlocked()) return null; const w=W(), em=EM(); if(!driving&&y===w.y&&(x===w.x||x===w.x+1)) return w.cur; for(const id in em.carts){ const c=em.carts[id]; if(y===c.y&&(x===c.x||x===c.x+1)) return id; } return null; };
  world.canMove=(fx,fz,tx,tz)=>{ const bx=Math.floor(tx), by=Math.floor(tz);
    if(unlocked()&&(bx!==Math.floor(fx)||by!==Math.floor(fz))){ if(bx===T.board.x&&by===T.board.y) return false; if(cartAt(bx,by)!==null) return false; }
    if(driving&&world.T(bx,by)===20) return false; return baseMove(fx,fz,tx,tz); };
  world.driving=()=>driving;
  world.speedMult=()=>{ const b=baseSpeed?baseSpeed():1; if(!driving) return b; const t=world.T(Math.floor(P.x),Math.floor(P.z)); return b*((t===2||t===10||t===11||t===12)?1.5:0.85)/1.0; };

  // ── the wagon menu: load, unload, hitch up ──
  function openOpen(){ const em=EM(), out=[]; for(const c of em.active) for(const g in c.items){ const left=c.items[g]-((c.got[g])|0); if(left>0) out.push({tid:c.tid,good:g,left,pay:c.pay}); } return out.sort((a,b)=>b.pay-a.pay); }
  function wagonMenu(){ menu(()=>{ const w=W(), reqs=openOpen(), rows=[];
      const haul=T.goods.concat(Object.keys(T.materials)).filter(g=>(inv()[g]||0)>0);
      haul.forEach(g=>{ const G=GOODS[g], want=reqs.filter(o=>o.good===g);
        rows.push({label:`Load ${G.emoji} ${E(G.name)} (have ${inv()[g]})`,sub:want.length?`📦 ${E(TD[want[0].tid].name)} needs ${want[0].left}${w.cargo[g]?` · carrying ${w.cargo[g]}`:''} · ~${want[0].pay}g`:'no one is asking for this',now:true,
          fn:()=>{ if(cargoCount()>=T.cap) return `The wagon is full (${T.cap} crates).`; if((inv()[g]||0)<=0) return `You have no ${G.name} to load.`; inv()[g]--; w.cargo[g]=(w.cargo[g]||0)+1; GAME.save(); return `Loaded ${G.emoji} ${G.name}.`; }}); });
      if(cargoCount()>0) rows.push({label:'Unload all back to your packs',now:true,fn:()=>{ for(const k in w.cargo) inv()[k]=(inv()[k]||0)+w.cargo[k]; w.cargo={}; GAME.save(); return 'Unloaded everything back to your packs.'; }});
      const fill=reqs.find(o=>(w.cargo[o.good]||0)>0);
      rows.push({label:`🐎 <b>Hitch up &amp; drive</b>${fill?` → ${E(TD[fill.tid].name)}`:''}`,now:true,fn:()=>{ if(cargoCount()===0) return 'Load at least one crate before you set out.'; UI.close(); hitch(); return false; }});
      const cargo=Object.keys(w.cargo).length?Object.keys(w.cargo).map(k=>GOODS[k].emoji+(w.cargo[k]>1?'×'+w.cargo[k]:'')).join(' '):'empty';
      const unst=reqs.filter(o=>((inv()[o.good]||0)+(w.cargo[o.good]||0))<=0).slice(0,2);
      return {title:`🛒 ${E(cartName(w.cur))} — ${cargoCount()}/${T.cap} crates`,body:`Cargo: ${cargo}${reqs.length?` · ${reqs.length} request${reqs.length===1?'':'s'} open`:' · no contracts held — take some at the board'}${unst.length?`<br>Also wanted: ${unst.map(o=>`${GOODS[o.good].emoji} ${E(GOODS[o.good].name)} → ${E(TD[o.tid].name)}`).join(' · ')}`:''}`,rows}; }); }

  // ── driving ──
  let stash=null; const parkSpot={x:0,z:0,r:0.2,label:'Park',who:'The wagon',action:()=>park()}, delSpot={x:0,z:0,r:0.2,label:'Deliver',who:'Drop-off',action:()=>deliver()};
  function hitch(){ const w=W(); driving=true; S().driving=true; P.x=w.x+0.5; P.z=w.y+0.5; stash=world.spots.slice(); world.spots.length=0; world.spots.push(parkSpot); placeCarts(); GAME.save();
    UI.toast('🛒 Hitched up! Quick on roads, slow on open ground. Water, trees & cliffs block the wagon. Tap Park to step down.',3000); }
  function unstash(){ if(!stash) return; const extra=world.spots.filter(s=>s!==parkSpot&&s!==delSpot&&!stash.includes(s)); world.spots.length=0; stash.forEach(s=>world.spots.push(s)); extra.forEach(s=>world.spots.push(s)); stash=null; }
  function park(){ const tx=Math.floor(P.x), ty=Math.floor(P.z); if(!world.WK(tx,ty)){ UI.toast('Find solid ground before you park!',1600); return; }
    const w=W(); driving=false; S().driving=false; w.x=tx; w.y=ty; unstash(); P.z=ty+1.4>world.H?P.z:ty+1.4; if(!world.WK(tx,Math.floor(P.z))) P.z=ty+0.5; placeCarts(); GAME.save(); UI.toast('🛒 You park the wagon and step down.',1200); }
  function nearPoint(){ const px=Math.floor(P.x), py=Math.floor(P.z); for(let t=0;t<10;t++){ const p=T.points[t]; if(!p||!cleansed(t)) continue; if(Math.abs(px-p.x)+Math.abs(py-p.y)<=1||Math.abs(px-p.dx)+Math.abs(py-p.dy)<=1) return t; } return -1; }
  function deliver(){ const t=nearPoint(); if(t<0) return; const em=EM(), w=W(), mine=em.active.filter(c=>c.tid===t);
    if(!mine.length){ ENGINE.speak('📦 '+TD[t].name,[`No contracts for ${TD[t].name}. Take one at the Homestead board, or at a trade post you own.`]); return; }
    const lines=[]; let paid=0, gave=0;
    for(const c of mine){ for(const g in c.items){ const need=c.items[g]-((c.got[g])|0), give=Math.min(need,w.cargo[g]||0); if(give>0){ c.got[g]=((c.got[g])|0)+give; w.cargo[g]-=give; if(w.cargo[g]<=0) delete w.cargo[g]; gave+=give; } }
      if(contractLeft(c)===0){ GAME.addGold(c.pay); paid+=c.pay; em.earned+=c.pay; em.done[t]=(em.done[t]|0)+1; em.active=em.active.filter(x=>x!==c); lines.push(`✓ ${c.who} — +${c.pay}g`); }
      else lines.push(`${c.who}: ${itemsText(c.items,c.got)} — ${contractLeft(c)} to go`); }
    if(!gave&&!paid){ ENGINE.speak('📦 '+TD[t].name,[`${TD[t].name} is waiting on:\n`+mine.map(c=>c.who+': '+itemsText(c.items,c.got)).join('\n')+'\nYour cart carries none of it.']); return; }
    if(paid&&Math.random()<0.3){ const ks=Object.keys(T.decor), dk=ks[(Math.random()*ks.length)|0], hd=S().homesteadDecor||(S().homesteadDecor={inv:{},placed:[]}); hd.inv=hd.inv||{}; hd.inv[dk]=(hd.inv[dk]||0)+1; lines.push(`A ${T.decor[dk].emoji} ${T.decor[dk].name} for your Homestead, with thanks.`); }
    GAME.save(); ENGINE.speak('📦 '+TD[t].name,[lines.join('\n')]); }
  const kAnim=K.animate; K.animate=function(dt,mode,sp){ return kAnim.call(K,dt,driving&&mode==='walk'?'idle':mode,sp); };

  // ── spots: the board, each cart ──
  const boardSpot={x:T.board.x+0.5,z:T.board.y+0.5,r:1.2,label:'Contracts',who:'Homestead Trade Board',action:()=>menu(boardMenu('home'))};
  const cartSpot={x:0,z:0,r:1.2,label:'Wagon',who:'The wagon',action:()=>{ const id=cartSpot.id; if(id&&id!==W().cur) useCart(id); wagonMenu(); }};
  world.anim.push((t,dt)=>{ if(ENGINE.level!==world) return; const on=unlocked();
    const iB=world.spots.indexOf(boardSpot); if(on&&!driving){ if(iB<0) world.spots.push(boardSpot); } else if(iB>=0) world.spots.splice(iB,1);
    // the nearest cart you could take
    const iC=world.spots.indexOf(cartSpot); let best=null, bd=2.4;
    if(on&&!driving){ const w=W(), em=EM(), all=[[w.cur,w]].concat(Object.entries(em.carts)); all.forEach(([id,c])=>{ const d=Math.hypot(c.x+1-P.x,c.y+0.5-P.z); if(d<bd){ bd=d; best=[id,c]; } }); }
    if(best){ cartSpot.id=best[0]; cartSpot.x=best[1].x+1; cartSpot.z=best[1].y+0.5; cartSpot.label=best[0]===W().cur?'Wagon':'Cart'; cartSpot.who=cartName(best[0]); if(iC<0) world.spots.push(cartSpot); } else if(iC>=0) world.spots.splice(iC,1);
    if(driving){ const m=model(W().cur); m.position.set(P.x,world.ground(P.x,P.z),P.z); m.rotation.y=P.face-Math.PI/2; m.userData.tick(t);
      const vc=Math.max(0.6,VIEWMODE.ps(world)); K.position.x=P.x-Math.sin(P.face)*0.45*vc; K.position.z=P.z-Math.cos(P.face)*0.45*vc; K.position.y=world.ground(P.x,P.z)+0.45*vc;
      parkSpot.x=delSpot.x=P.x; parkSpot.z=delSpot.z=P.z; const nt=nearPoint(), near=nt>=0&&EM().active.some(c=>c.tid===nt&&Object.keys(c.items).some(g=>c.items[g]>((c.got[g])|0)&&(W().cargo[g]||0)>0)), iD=world.spots.indexOf(delSpot), iP=world.spots.indexOf(parkSpot);
      if(near){ if(iD<0) world.spots.push(delSpot); if(iP>=0) world.spots.splice(iP,1); } else { if(iD>=0) world.spots.splice(iD,1); if(iP<0) world.spots.push(parkSpot); } }
    else Object.values(models).forEach(m=>m.visible&&m.userData.tick(t)); });
  const prevEnter=world.onEnter; world.onEnter=sp=>{ driving=!!S().driving&&unlocked(); if(driving){ const w=W(); stash=world.spots.slice(); world.spots.length=0; world.spots.push(parkSpot); } placeCarts(); prevEnter&&prevEnter(sp); };
  const prevLeave=world.onLeave; world.onLeave=()=>{ if(driving){ /* the wagon never enters a building: you leave it where it stands */ const w=W(); w.x=Math.floor(P.x); w.y=Math.floor(P.z); driving=false; S().driving=false; } unstash(); prevLeave&&prevLeave(); };

  function questLine(){ if(!unlocked()) return ''; const em=EM(), owned=Object.keys(em.posts).filter(t=>owns(+t)).length, mgrs=Object.keys(em.posts).filter(t=>em.posts[t]&&em.posts[t].mgr).length;
    const held=em.active.length?em.active.map(c=>E(TD[c.tid].name)+' '+itemsText(c.items,c.got)).join(' · '):'none — visit the board by the Homestead farm stand';
    return `Contracts: <b>${held}</b><br>Earned from contracts: <b>${em.earned}g</b>`+(em.earned<T.postUnlock?` · trade posts open for sale at ${T.postUnlock}g`:` · trade posts owned: <b>${owned}/9</b>`+(mgrs?` · managers: <b>${mgrs}</b>`:'')); }
  const townOf=interior=>{ const i=T.towns.findIndex(t=>t.interior===interior); return i<0?null:i; };
  return { unlocked, shopMenu, questLine, townOf, GOODS, get driving(){ return driving; } };
}
