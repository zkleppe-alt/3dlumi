// ════════════════════════════════════════════════════════════════
//  LUMINAR — the whole realm, Hearthvale to Hellgate. Wiring only: which door opens which room,
//  who runs which service, where the wood lets you through, and which chapel is still bound.
//  WORLD_DATA is data/world.json (tools/extract_world.py); CHAPELS holds all ten chapels as the game
//  builds them (tools/extract_dungeon.py). A save's `chapels` count decides which are cleansed.
// ════════════════════════════════════════════════════════════════
(function(){ if(!ENGINE) return;
  const WD=WORLD_DATA, I=WD.interiors, S=()=>GAME.S, TD=SYS.TOWN_DATA;
  const cleansed=t=>t<S().chapels;
  const HEARTH=SP({x:32.5,z:25.3,face:0});   // V116: the code's fixed places are in the 2D game's coordinates, shifted by SX/SY to the stretched realm
  const townOfId=id=>{ const k=themeOf(id); return Math.max(0,TOWN_KEYS.indexOf(k)); };

  // ── a knight at each chapter: the level, gear, gold and skills of one who has won the chapels before it ──
  const chapelDoor=t=>WD.buildings.find(b=>WD.chapelTown[b.id]===t);
  const CH_LV=t=>t===0?1:TD[t-1].lvl+2;
  const SKILL_ORDER=['valor0','guard0','faith0','valor1','guard1','faith1','valor2','guard2','faith2','valor3','guard3','faith3'];
  const POST=['','','','','','','','','','','👑 Abaddon’s throne','🕊 After the throne — the Demon Hunt','🛒 The roads at peace — the trade empire','🐟 The Pretender King','🌀 Through the portals — Mistral','🏰 Mistral’s folds freed — the castle gate open','⛰ Mount Tabor — hearts of stone and ice','🌅 Sunfall — the Westering Isles','🕯 Sunfall — five lamps lit, Vesper waits'];
  for(let NN=0;NN<=18;NN++){ const N=Math.min(NN,10); GAME.presets['ch'+NN]={ label:NN===0?'🛡 A new knight — Hearthvale, Lv 1':NN>=10?`${POST[NN]} — Lv ${CH_LV(N)}`:`⚔ ${TD[N].name}’s chapter — Lv ${CH_LV(N)}`, make(s){
    const lv=CH_LV(N); s.level=lv; s.xpNext=GAME.xpForLevel(lv); s.chapels=N; let sp=(lv-1)+2*N, gold=150*N;
    const own=id=>{ if(SYS.EQUIP[id]) s.ownedGear[id]=true; };
    for(let t=0;t<N;t++){ own(WD.generalReward[t]); if(t===5) own('lydia_greaves'); if(t===8) own('samuel_helm');
      Object.values(SYS.CHAPEL_CHESTS[t]||{}).forEach(sets=>sets.forEach(items=>items.forEach(([k,id,n])=>{ if(k==='gear') own(id); else if(k==='gold') gold+=id; else if(k==='pot') s.inventory[id]=(s.inventory[id]||0)+n; }))); }
    // wear the best of what he owns (no bows: a new knight should swing a blade)
    const score=e=>(e.atk||0)*2+(e.def||0)*2+(e.maxHp||0)*0.5+(e.crit||0)*100;
    SYS.GEAR_SLOTS.forEach(([slot])=>{ let best=s.equip[slot], bs=best&&SYS.EQUIP[best]?score(SYS.EQUIP[best]):-1;
      Object.keys(s.ownedGear).forEach(id=>{ const e=SYS.EQUIP[id]; if(!e||e.slot!==slot||e.ranged) return; const v=score(e); if(v>bs){ bs=v; best=id; } }); s.equip[slot]=best; });
    for(const id of SKILL_ORDER){ const n=GAME.skillNode(id), b=id.replace(/\d$/,''), k=+id.slice(-1); if(!n||sp<n.cost||(k>0&&!s.skills[b+(k-1)])) continue; s.skills[id]=true; sp-=n.cost; }
    s.skillPoints=sp; s.gold=gold; s.inventory.potion=(s.inventory.potion||0)+2+N;
    // a companion grown with you (PET_EVOLVE_LV): by Lv 12 it is a steed. The new-journey sheet lets you choose which.
    { const E2=SYS.PET_EVOLVE_LV||[0,6,12]; let fm=0; E2.forEach((l,i)=>{ if(lv>=l) fm=i; }); s.pet={id:'faithful',form:fm,name:SYS.PETS.faithful.name,ribbon:'',equip:{}}; }
    const d=NN>=11?WD.buildings.find(b=>b.id==='home_house'):N===10?WD.buildings.find(b=>b.id==='hg_keep'):N?chapelDoor(N):null; if(d) s.at={x:d.door.x+0.5,z:d.door.y+1.6}; if(N===10) s.ownedGear.armor_michael=true;
    // past the throne: Abaddon fallen (and for the last, the hunt done, the Old Mule hitched, a cart's worth in the packs)
    if(NN>=11){ s.abaddonWon=true; s.skillPoints+=5; s.hunt={active:NN>=12,done:NN>=12,killed:0,remaining:WD.zones.map(()=>NN>=12?0:5)}; s.hunt.total=WD.zones.length*5; }
    if(NN>=13){ s.bounties={active:[],complete:[],nextId:1,perTown:{},pretenderUnlocked:true}; for(let t=0;t<9;t++) s.bounties.perTown[t]=3; }
    if(NN>=14){ Object.assign(s.bounties,{pretenderDefeated:true,portalsOpen:true,madisonTaken:true}); s.skillPoints+=3; s.portals={mistral:{unlocked:true,cleared:false},tabor:{unlocked:false,cleared:false},sunfall:{unlocked:false,cleared:false}}; }
    if(NN>=12){ s.wagon={unlocked:true}; s.gold+=3000; Object.assign(s.inventory,{wheat:6,barley:4,perch:4,seabass:3}); const T=PASTIME_DATA.trade; s.at={x:T.home.x+0.5,z:T.home.y+1.6}; }
    if(NN===13){ const k=WD.buildings.find(b=>b.id==='hg_keep'); s.at={x:k.door.x+0.5,z:k.door.y+1.6}; }
    if(NN>=14){ const p=PASTIME_DATA.finale.portals[0]; s.at={x:p.tx+0.5,z:p.ty+1.8}; }
    if(NN>=15&&typeof PORTAL_WORLDS!=='undefined'&&PORTAL_WORLDS.mistral){ const MW=PORTAL_WORLDS.mistral, vil={}; (MW.villages||[]).forEach(v=>vil[v.id]={guardsDown:5,squareClear:true,cleared:true,lostTotal:(MW.lost||[]).filter(l=>l.village===v.id).length,lostGathered:0,herdDone:false});
      s.mistral={villages:vil,wanderersDown:10,throne:{}}; s.startAt={level:'pw:mistral',x:MW.castle.gate.x+0.5,z:MW.castle.gate.y+2.6}; }
    if(NN>=16&&PORTAL_WORLDS.tabor){ const TW=PORTAL_WORLDS.tabor; s.mistral.throne={fled:true,purified:true}; s.mountSkinOwned={spectral:true}; s.skillPoints+=3; s.portals.mistral.cleared=true; s.portals.tabor.unlocked=true;
      s.startAt={level:'pw:tabor',arrive:true}; }
    if(NN>=17&&PORTAL_WORLDS.sunfall){ const SW=PORTAL_WORLDS.sunfall; s.tabor={thawed:true,bossDown:true,hopeAll:true,summitCine:true,rescues:{}}; ['beset','buried','hearth','ledge','eden'].forEach(k=>s.tabor.rescues[k]={done:true,stage:3});
      s.portals.tabor.cleared=true; s.portals.sunfall={unlocked:true,cleared:false}; s.skillPoints+=3; s.startAt={level:'pw:sunfall',arrive:true};
      if(NN===18){ const f={lamps:{},spans:{},caches:{},waystations:{},tiers:{t1:true,t2:true,t3:true,t4:true,t5:true},metPilgrims:{},debris:{},timber:0,arrived:true}; (SW.lamps||[]).forEach(L=>f.lamps[L.id]={captainDown:true,lit:true}); (SW.spans||[]).forEach(q=>{ f.spans[q.id]=true; f.caches[q.id]=true; }); s.sunfall=f; s.skillPoints+=10;
        const c=SW.town.cath; s.startAt={level:'pw:sunfall',x:c.door.x+0.5,z:c.door.y+2.6}; } } }}; }
  GAME.defaultPreset='ch0';
  GAME.onNew=()=>{ const st=S().startAt; if(st){ delete S().startAt; const wl=PORTALS&&PORTALS.worldLevel(st.level.slice(3)); if(wl){ ENGINE.go(st.level,st.arrive?wl.arrive:{x:st.x,z:st.z,face:Math.PI}); return; } } ENGINE.go('world',S().at?{x:S().at.x,z:S().at.z,face:0}:HEARTH); };

  // ── the realm ──
  let lastBarrier=0;
  const world=ENGINE.add(buildWorld(WD,{ id:'world', name:'Luminar', taborThawed:()=>!!(S().tabor&&S().tabor.thawed),
    sealed:i=>i>=1&&!cleansed(i-1),
    chapelLight:b=>cleansed(WD.chapelTown[b.id]),
    onBarrier:i=>{ if(performance.now()-lastBarrier<2600) return; lastBarrier=performance.now(); UI.toast(`⛔ Abaddon’s barrier seals ${TD[i].name}. Cleanse ${TD[i-1].name} to shatter this dome.`,2600); },
    enter:b=>enterFor(b),
    hollow:(x,y)=> x<SX(60) ? ()=>forest.enter(y<SY(120)?'north':'south') : (x===SX(196)&&y===SY(7)) ? ()=>forest.enterCave() : null }));
  world.speed=5.0;
  // V154: THE HOMESTEAD GATE. The homestead's basin has one way in, the old lane at its south end; the family barred it
  //  against the demons roaming the roads. It stays shut and chained until Abaddon falls; then Sir Aldric rides on ahead
  //  and opens it, and it stands open from then on. (You can always get out from the inside, so an old save inside is never stuck.)
  { const HG={x0:RX(11),x1:RX(16),z:RY(250)+0.5}, open=()=>!!S().abaddonWon, sc=world.scene, gy=(x,z)=>world.ground?world.ground(x,z):0;
    const gate=group((HG.x0+HG.x1)/2,gy((HG.x0+HG.x1)/2,HG.z),HG.z,sc), wood=0x6a4a2a, dark=0x3e2a18, iron=0x2a2a30;
    [HG.x0-0.15-(HG.x0+HG.x1)/2,HG.x1+0.15-(HG.x0+HG.x1)/2].forEach(x=>{ B(0.36,2.1,0.36,0x7a7468,x,0,0,gate); B(0.46,0.16,0.46,0x8a8478,x,2.1,0,gate); });
    const half=(HG.x1-HG.x0)/2, leaves=[-1,1].map(sd=>{ const hinge=group(sd*half,0,0,gate), lf=group(-sd*half/2,0,0,hinge);
      [0.25,0.95,1.6].forEach(y=>B(half-0.06,0.14,0.08,wood,0,y,0,lf)); for(let i=0;i<5;i++) B(0.1,1.75,0.07,dark,(i-2)*(half-0.3)/4,0.12,0.02,lf);
      const br=B(Math.hypot(half-0.2,1.3),0.1,0.06,dark,0,0.95,-0.03,lf); br.rotation.z=sd*Math.atan2(1.3,half-0.2); return {hinge,sd}; });
    // the chain wound through both leaves, and the lock on it
    const chain=group(0,0,0.08,gate), linkM=new THREE.MeshPhongMaterial({color:iron,shininess:70});
    for(let i=0;i<9;i++){ const m=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.018,5,10),linkM); m.position.set((i-4)*0.11,1.05-Math.sin(i/8*Math.PI)*0.12,0); if(i%2) m.rotation.y=Math.PI/2; chain.add(m); }
    B(0.22,0.26,0.1,0x5a4a30,0,0.78,0.02,chain); const shk=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.02,5,10,Math.PI),linkM); shk.position.set(0,1.04,0.02); chain.add(shk);
    let swing=open()?1:0; const pose=()=>{ leaves.forEach(L=>L.hinge.rotation.y=L.sd*swing*1.45); chain.visible=swing<0.02; };
    pose(); world.anim.push((t,dt)=>{ const want=open()?1:0; if(swing!==want){ swing=want>swing?Math.min(1,swing+(dt||0.016)*0.8):0; pose(); } });
    const into=(fz,tz,tx)=>tx>HG.x0-0.3&&tx<HG.x1+0.3&&fz>=HG.z&&tz<HG.z;
    let said=0; const tell=()=>{ if(performance.now()-said<2600) return; said=performance.now();
      UI.toast('🔒 The homestead gate is shut and chained. Your family barred it against the demons on the roads.',2600); };
    const cm=world.canMove; world.canMove=(fx,fz,tx,tz)=>{ if(!open()&&into(fz,tz,tx)){ tell(); return false; } return cm(fx,fz,tx,tz); };
    const wt=world.walkTile; world.walkTile=(x,y)=>wt(x,y)&&!(!open()&&y===Math.floor(HG.z)&&x>=HG.x0&&x<HG.x1);   // no demon slips through either
    world.spots.push({x:(HG.x0+HG.x1)/2,z:HG.z+0.9,r:1.6,label:'Look',who:'The homestead gate',hide:()=>open(),action:()=>ENGINE.speak('The homestead gate',
      ['The old lane ends at a stout gate, shut and wound with chain, a heavy lock through it. Beyond it the lane climbs to the farmhouse.',
       'Your family barred it when the demons began roaming the roads. Fifteen years it has kept them out.','(It will open when the long night is over.)'])});
    GAME.homeOpen=open; }
  // the Forest of Disillusionment between the Ironhold road and the road to Saltmere, Eldan's glade and Robby's hole
  // inside it, and the old monk's cave behind the hollow north of Hellgate
  const MOUTH={north:SP({x:33.5,z:82.5,face:Math.PI}),south:SP({x:33.5,z:187.5,face:0})};
  const forest=forestLevels(FOREST_DATA,{ caveExit:{level:'world',spawn:SP({x:196.5,z:8.6,face:0})},
    exit:(mouth,fell)=>{ ENGINE.go('world',MOUTH[mouth]); setTimeout(()=>UI.toast(fell?'💫 You fall… and wake at the edge of the wood.':mouth==='south'?'🌅 You break through the tree-line at last — the road to Saltmere opens ahead.':'🌅 You emerge from the wood, back on the Ironhold road.',2600),450); } });
  world._forest=forest;
  // V123: the old monk's cave is a cave you can see — a mound of grey rock with a dark mouth facing the path, a little
  //  firelight deep inside (he keeps it lit for friends), moss on the stones and a lantern hung by the way in
  { const cx=SX(196)+0.5, cz=SY(7)+0.5, gy=world.ground(cx,cz+0.6), g=group(cx,gy-0.15,cz-0.2,world.scene), rk=new THREE.MeshLambertMaterial({color:0x6e6a64}), rk2=new THREE.MeshLambertMaterial({color:0x5a5650}), moss=new THREE.MeshLambertMaterial({color:0x4e6a3a});
    const rock=(r,x,y,z,sx,sy,sz,m)=>{ const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),m||rk); o.position.set(x,y,z); o.scale.set(sx||1,sy||1,sz||1); o.rotation.set(hsh(x*9+3,z*7)*3,hsh(z*5,x*3+1)*3,0); o.castShadow=o.receiveShadow=true; g.add(o); return o; };
    rock(1.25,-1.8,0.65,-0.7,1,1.15,1.1); rock(1.2,1.8,0.6,-0.7,1,1.2,1.1,rk2); rock(1.15,0,2.05,-0.8,1.7,0.7,1.0); rock(1.7,0,1.0,-2.0,1.6,1.15,0.9,rk2);   // the two shoulders, the lintel, the back
    rock(0.55,-1.9,0.15,0.9); rock(0.45,1.95,0.1,0.8,1,0.8,1,rk2); rock(0.3,-1.2,0.05,1.15); rock(0.6,2.2,1.3,-0.9,1,1,1,rk2); rock(0.7,-2.3,1.2,-1.1);
    rock(0.9,-0.9,2.25,-0.9,1.3,0.45,1,moss); rock(0.7,0.9,2.3,-0.7,1.2,0.4,1,moss);
    const mouthG=new THREE.CircleGeometry(0.85,20,0,Math.PI), mouth=new THREE.Mesh(mouthG,new THREE.MeshBasicMaterial({color:0x07060a})); mouth.scale.set(1,1.5,1); mouth.position.set(0,0.12,0.3); g.add(mouth);
    const deep=new THREE.Mesh(new THREE.CircleGeometry(0.55,16,0,Math.PI),new THREE.MeshBasicMaterial({color:0x3a1c08})); deep.scale.set(1,1.3,1); deep.position.set(0,0.12,0.22); g.add(deep);
    const fire=new THREE.PointLight(0xff9a40,0.8,4,2); fire.position.set(0,0.5,-0.3); g.add(fire); world.anim.push(t=>{ fire.intensity=0.7+Math.sin(t*7)*0.12+Math.sin(t*13)*0.06; deep.material.color.setRGB(0.22+Math.sin(t*7)*0.03,0.11,0.03); });
    const post=group(1.0,0,0.7,g); Cy(0.05,0.06,1.5,6,0x4a3422,0,0,0,post); B(0.42,0.05,0.05,0x4a3422,-0.18,1.45,0,post); const L=B(0.16,0.22,0.16,glow(0xffd27a),-0.34,1.2,0,post); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(L,1.4);
    const sp=world.spots.find(s=>Math.abs(s.x-cx)<0.6&&Math.abs(s.z-(cz+0.7))<0.8&&s.who==='The wood'); if(sp){ sp.who='A cave in the rocks'; sp.z=cz+1.0; } }
  // the arches at the forest's two hollows, on the realm's side: the way in, named, from the Ironhold road and from the Saltmere road
  forest.gate(world,SX(33.5),SY(84.5),Math.PI,'THE FOREST','of Disillusionment',0x2a4a2a);
  forest.gate(world,SX(33.5),SY(185.7),0,'THE FOREST','of Disillusionment',0x2a4a2a);
  // Old Man Mario's hut at the wood's edge east of the Homestead: once the Homestead is yours, he teaches you Koine Greek
  if(typeof GREEK!=='undefined') GREEK.hut(world,SP({x:40.5,z:143.5}));
  if(typeof NORTH!=='undefined') NORTH.gate(world,SP({x:45.5,z:2.6}));
  // V118: the high roads' arches are retired — the realm itself is the long journey now (an overland Trade Road with its
  // bridge runs from Hearthvale to Dusthaven; see data/stretch.json → roads). ROADS.attach(world) would bring them back.
  if(false&&typeof ROADS!=='undefined') ROADS.attach(world);
  if(typeof TREK!=='undefined') TREK.attach(world);
  /* V137: the knight's motion-captured idle, walk and run (rig.js); ☰ → System can switch back to the hand-keyed gait */
  if(typeof RIG!=='undefined'&&RIG.ok){ try{ ENGINE.K.mocap=RIG.make(); ENGINE.K.footIK=true; ENGINE.K.mocapOff=localStorage.getItem('klk3d_mocap')==='0'; }catch(e){ console.warn('rig',e); } }
  if(typeof WEATHER!=='undefined') world.weather=WEATHER.attach(world);
  if(typeof ROADLIFE!=='undefined') world.roadlife=ROADLIFE.attach(world);
  if(typeof SNEAK!=='undefined') world.sneak=SNEAK.attach(world);
  if(typeof CATACOMB!=='undefined') Object.keys(CATACOMB.LV).map(Number).forEach(t=>{ if(CHAPELS[t]){ const r=CATACOMB.attach(world,{town:t,door:chapelDoor(t),near:t===4?WD.buildings.find(b=>b.id==='dh_bazaar'):t===7?WD.buildings.find(b=>b.id==='sg_keep'):null,td:CHAPELS[t].td,C:CHAPELS[t],tint:WD.generalTints[t],cleansed:q=>cleansed(q),nave:()=>chapel(t).enterTop()}); if(t===0) world.cata=r; } });
  if(typeof SIDEQ!=='undefined') SIDEQ.world(world,{cleansed:q=>cleansed(q)});
  if(typeof WILDS!=='undefined') WILDS.attach(world,WD);   // V175: the heights, the rivers' crossings, the wayside shrines   /* V173: the villagers' errands and hints about the catacombs */   /* V147: Hearthvale's churchyard mausoleum and the catacombs under it */   /* V144: the sleeping demon camps */   /* V132: travellers, shepherds and wildlife on the roads between the towns */   /* V131: rain, snow, sand, ash and mist by the land */
  if(typeof LANDMARKS!=='undefined') LANDMARKS.attach(world);   // V127: watchtowers to climb, camps, the mill, the drowned chapel, a shrine, a spring   // V121: the Pilgrim's Pass — the mountain trek from Shadowmere to Hellgate   // V115: the high roads: the long journeys between distant towns   // V114: the Scholar's Way, the old road north to Mario's tower school
  if(typeof GREEK!=='undefined'){ const gx=SX(46.5), gz=SY(20.5); GREEK.place(world,world.scene,world.anim,gx,gz,'john14_6',{y:world.ground?world.ground(gx,gz):0}); }   // a scrap of John by Hearthvale's chapel door
  if(typeof PASTIME_DATA!=='undefined') pastimes(world,PASTIME_DATA);   // fishing, the farm stand, the fields, the surf, the regatta
  if(typeof PASTIME_DATA!=='undefined') world._sailing=sailing(world,PASTIME_DATA);    // your boat on the open sea, the southern isles, the realm's secrets
  // ⛰ Mount Tabor in Luminar thaws when the mountain behind its gate does (_ttThawAt: the overworld follows taborProgress.thawed)
  { let was=null; world.anim.push(()=>{ const now=!!(S().tabor&&S().tabor.thawed); if(was!==null&&now!==was) world.retile(SX(72),SY(252),SX(118),SY(299)); was=now; }); }
  const RIDING=riding(world); world.riding=RIDING;   // your companion's final form carries you
  const DEEP=(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.deep)?deepSystem(world,PASTIME_DATA.deep,RIDING):null;   // 🌊 the deep: the Sea Dragon dives at five eddies
  minimap(world,()=>{ const out=[], s=S(), c=world.combat, h=s.hunt;   // the round window on the realm, top right
    if(c) c.foes.forEach(d=>{ if(!d.alive||typeof d.zi!=='number'||d.boss) return;
      if(d.cull) out.push({x:d.x,y:d.z,col:'#ffa03a',r:2.6,seek:'cull'});
      else if(h&&h.active&&!h.done) out.push({x:d.x,y:d.z,col:'#d24aff',r:2.6,seek:'hunt'}); });
    const vis=s.uw&&s.uw.visited; if(vis&&PASTIME_DATA&&PASTIME_DATA.deep) PASTIME_DATA.deep.spots.forEach(sp=>{ if(vis[sp.id]) out.push({x:sp.x+0.5,y:sp.y+0.5,col:'#5fd8e0',ring:true}); });
    const gp=GOAL_API.cur&&GOAL_API.cur.pin(); if(gp) out.push(gp);
    return out; });
  const REUBEN=(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.reuben)?reuben(world,PASTIME_DATA.reuben,TD):null;   // the wandering merchant
  const TRADE=(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.trade)?tradeSystem(world,PASTIME_DATA.trade,TD):null;   // the supply wagon and the trade empire
  if(TRADE) tradeSystem.current=TRADE;
  // the open-world fight: KLK's encounter zones, five demons each
  const HUNT=huntSystem(world,WD.zones);   // the Demon Hunt, once Abaddon has fallen
  const BOUNTY=(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.bounty)?bountySystem(world,PASTIME_DATA.bounty,PASTIME_DATA,{respawn:()=>spawnDemons()}):null;   // the hooded strangers, the Homestead's decorations
  if(BOUNTY) BOUNTY_API.cur=BOUNTY;
  /* V169: a cleansed town keeps its own watch — no demon comes within its bounds */
  const TOWN_T={Hearthvale:0,Ironhold:1,Saltmere:2,Thornwood:3,Dusthaven:4,Crystalpeak:5,Ashfield:6,Stormgate:7,Shadowmere:8,Hellgate:9}, GUARD_R=12;
  world.watched=()=>(WD.towns||[]).filter(tw=>TOWN_T[tw[0]]!==undefined&&cleansed(TOWN_T[tw[0]]));
  world.guarded=(x,y)=>{ for(const tw of world.watched()) if(Math.hypot(x+0.5-tw[1],y+0.5-tw[2])<((WD.townR&&WD.townR[tw[0]])||GUARD_R)) return true; return false; };   // V199: a re-planned village is guarded to its edges
  /* V199: THE CLUES — a few villagers (WD.villagers[].clue = the town) have heard the sounds from the catacombs' way in. Hearing one marks the journal
     and turns the quest goal toward it; once the way is found (or the chapel cleansed) they say what they say after. */
  WD.villagers.forEach(v=>{ if(v.clue===undefined) return; const t=v.clue, f=world.folk.find(q=>q.key==='v:'+v.x+','+v.y+':'+v.outfit); if(!f) return; f.label='Talk';
    f.action=()=>{ const s=S(), c=(s.cata&&s.cata[t])||{}, CS=WD.cata&&WD.cata[t]; if((c.seen||cleansed(t))&&v.after){ ENGINE.speak(f.who,v.after,f); return; }
      ENGINE.speak(f.who,v.lines,f,()=>{ const h=s.cataHeard||(s.cataHeard={}); if(h[t]||!CS) return; h[t]=true; GAME.save();
        if(typeof JOURNAL!=='undefined'&&CS.journal) try{ JOURNAL.write(CS.journal); }catch(e){} UI.toast('📜 The sounds come from '+CS.where+'.',2800); }); }; }); world.guardR=GUARD_R;
  COMBAT.arena(world,{ mode:'world', tier:0, W:WD.W, H:WD.H, walk:(x,y)=>world.walkTile(x,y)&&!world.guarded(x,y), onKill:d=>{ HUNT.onKill(d); if(BOUNTY) BOUNTY.onKill(d); },
    onDeath:()=>{ ENGINE.go('world',HEARTH); setTimeout(()=>UI.toast('💫 You fall… and wake safe in Hearthvale.',2000),450); } });
  function spawnDemons(){ COMBAT.clear(world); const P=ENGINE.P;
    WD.zones.forEach((z,zi)=>{ const n=HUNT.count(zi), nb=HUNT.night(); for(let i=0;i<n;i++){ let x,y,tries=0;
      do{ x=z.x0+Math.floor(Math.random()*(z.x1-z.x0)); y=z.y0+Math.floor(Math.random()*(z.y1-z.y0)); tries++; } while((!world.walkTile(x,y)||world.guarded(x,y)||Math.hypot(x+0.5-P.x,y+0.5-P.z)<8)&&tries<40);
      if(tries<40){ const lvl=z.level+(nb?HUNT.BOOST:0), hp=5+lvl*2; COMBAT.foe(world,{x:x+0.5,z:y+0.5,hp,level:lvl,xp:4+lvl*3,atk:6,form:(Math.random()*4)|0,zi,nightBuff:nb}); } } });
    // the roads at peace — except where a bounty's cull has called the dark back (spawnCullDemons)
    if(BOUNTY&&S().hunt&&S().hunt.done) BOUNTY.culls().forEach(({zi,n})=>{ const z=WD.zones[zi]; if(!z) return; const nb=HUNT.night(); for(let i=0;i<n;i++){ let x,y,tries=0;
      do{ x=z.x0+Math.floor(Math.random()*(z.x1-z.x0)); y=z.y0+Math.floor(Math.random()*(z.y1-z.y0)); tries++; } while((!world.walkTile(x,y)||Math.hypot(x+0.5-P.x,y+0.5-P.z)<8)&&tries<40);
      if(tries<40){ const lvl=z.level+(nb?HUNT.BOOST:0), hp=5+lvl*2; COMBAT.foe(world,{x:x+0.5,z:y+0.5,hp,level:lvl,xp:4+lvl*3,atk:6,form:(Math.random()*4)|0,zi,cull:true,nightBuff:nb}); } } }); }
  const prime=world.onEnter; world.onEnter=sp=>{ prime(sp); spawnDemons(); };
  if(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.rogues) world._rogues=rogues(world,PASTIME_DATA.rogues,PASTIME_DATA.doodles);   // Dylan, Ethan, Ranger Cody — and the doodles
  // where you stand is saved, and the warm springs mend you as they do in the game
  let saveT=0, healT=0;
  world.anim.push((t,dt)=>{ dt=dt||0.016; const P=ENGINE.P; saveT+=dt; if(saveT>1){ saveT=0; S().at={x:P.x,z:P.z}; }
    if(world.T(Math.floor(P.x),Math.floor(P.z))===24&&S().hp<S().maxHp){ healT+=dt*1000; if(healT>=120){ healT=0; S().hp=Math.min(S().maxHp,S().hp+Math.max(1,Math.round(2*S().healMult))); ENGINE.hud(); } } else healT=0; });

  // ── every building's way in ──
  const back=id=>({level:'world',spawn:world.doorStep(id)});
  const chapels={};
  function chapel(t){ const viaCata=typeof CATACOMB!=='undefined'&&CATACOMB.has(t); return chapels[t]||(chapels[t]=chapelLevels(CHAPELS[t],{id:'chapel'+t,town:t,tint:WD.generalTints[t],
    down:viaCata?()=>{ const na=CATACOMB.naveAt(t)||{x:8.5,z:5.6}; ENGINE.go('cata'+t+':0',{x:na.x,z:na.z,face:0,yaw:Math.PI}); }:null, raiseWhy:viaCata?CATACOMB.cfg(t).raiseWhy:null, trialDone:viaCata?()=>!!(S().cata&&S().cata[t]&&S().cata[t].trial):null, raise:viaCata,exit:back(Object.keys(WD.chapelTown).find(k=>WD.chapelTown[k]===t)),
    onCleanse:()=>{ spawnDemons(); }})); }
  function enterFor(b){ const id=b.interior||b.id, J=I[id]; if(!J) return null;
    if(J.theme==='chapel'){ const t=WD.chapelTown[b.id]; return ()=>{ if(cleansed(t)) ENGINE.go('sanct'+t); else if(typeof CATACOMB!=='undefined'&&CATACOMB.has(t)&&t<=S().chapels) { const CS=WD.cata&&WD.cata[t]; ENGINE.speak(b.name,CS?(S().cataHeard&&S().cataHeard[t]?CS.doorHeard:CS.door):['The doors are barred from within. A cold shadow seeps out from under them.','The old way in is from below: '+CATACOMB.cfg(t).wayIn]); } else if(CHAPELS[t]&&t===S().chapels) chapel(t).enter();
      else ENGINE.speak(b.name,[t>S().chapels?'The doors will not open. Something waits beyond, for a knight who has cleansed the towns before it.':'The doors are barred.']); }; }
    if(id==='sg_keep') return ()=>ENGINE.go('keep');
    if(id==='home_barn') return ()=>SERVICES.openStables();
    if(id==='hg_keep') return ()=>FINALE&&FINALE.enter();
    return ()=>ENGINE.go('in:'+id+':0'); }
  // cleansed chapels are sanctuaries: the priest, his teaching, the redeemed general, Ezra
  Object.entries(WD.chapelTown).forEach(([cid,t])=>ENGINE.add({id:'sanct'+t,lazy:()=>sanctuaryLevel({id:t,name:TD[t].name,general:TD[t].general,head:TD[t].head,priest:WD.priests[t],teachings:WD.teachings[t],
    generalLine:WD.generalLines[t],generalTint:WD.generalTints[t],sanct:WD.sanct[t]},{id:'sanct'+t,exit:back(cid)})}));
  // the rest: inns, shops, homes, keeps — each floor its own room, stairs between them
  const near=(at)=>lv=>at(lv)?Object.assign({face:Math.PI,yaw:0},at(lv)):lv.spawn;
  WD.buildings.forEach(b=>{ const id=b.interior||b.id, J=I[id]; if(!J||J.theme==='chapel'||id==='sg_keep'||id==='hg_keep') return;
    const town=townOfId(id), st=J.siTown||['#2f4a8f','#e8c766','crown'], pal={accent:hexn(st[0]),trim:hexn(st[1]),cloth:hexn(st[0])}, sign=st[2], L=n=>'in:'+id+':'+n;
    if(J.theme==='inn'){
      ENGINE.add({id:L(0),lazy:()=>{ const lv=objectRoom({id:L(0),name:J.name,theme:'inn',pal,sign,room:WD.siRooms.inn0,npcs:J.npcs,floor:0,zone:'The common room',exit:back(b.id),stairs:{up:{level:L(1),spawn:near(l=>l.downAt)}}});
        lv.folk.filter(f=>f.who==='Innkeeper').forEach(f=>{ f.label='Rest'; f.action=()=>ENGINE.speak('Innkeeper',f.lines,f,()=>SERVICES.openInn('Innkeeper')); });
        if(BOUNTY&&PASTIME_DATA.bounty.innTown[id]!==undefined) BOUNTY.stranger(lv,PASTIME_DATA.bounty.innTown[id]);
        lv.folk.filter(f=>f.who==='Patron').forEach(f=>{ const own=f.lines; f.lines=null; f.next=()=>{ const r=REUBEN&&REUBEN.rumor(); return r?r.concat(own):own; }; }); return lv; }});
      ENGINE.add({id:L(1),lazy:()=>objectRoom({id:L(1),name:J.name,theme:'inn',pal,sign,room:WD.siRooms.inn1,npcs:J.npcs,floor:1,zone:'Upstairs',stairs:{down:{level:L(0),spawn:near(l=>l.upAt)}}})});
      return; }
    if(J.theme==='shop'){ const R=WD.siRooms[J.siRoom[0]], shopTown=WD.shopTown[id]!==undefined?WD.shopTown[id]:town;
      ENGINE.add({id:L(0),lazy:()=>{ const keeper=(J.npcs.find(n=>R.keep&&n.x===R.keep[0]&&n.y===R.keep[1])||J.npcs[0]||{}).name;
        const lv=objectRoom({id:L(0),name:J.name,theme:'shop',pal,sign,room:R,npcs:J.npcs,keeper,exit:back(b.id),zone:J.name});
        lv.folk.filter(f=>f.who===keeper).forEach(f=>{ f.label='Shop'; const tt=TRADE?TRADE.townOf(id):null; f.action=()=>{ const wares=()=>SERVICES.openShop(shopTown,keeper); if(TRADE&&tt!==null&&TRADE.unlocked()) TRADE.shopMenu(tt,wares); else wares(); }; }); return lv; }});
      return; }
    // homes and keeps: rooms whose tiles are the furniture
    J.floors.forEach((f,n)=>ENGINE.add({id:L(n),lazy:()=>gridRoom({id:L(n),name:J.name,theme:J.theme==='keep'?'keep':'home',pal:J.theme==='keep'?{cloth:pal.accent,accent:pal.accent,trim:pal.trim}:undefined,
      blanket:pal.accent,grid:f.g,npcs:J.npcs,floor:n,sign,exit:n===0?back(b.id):null,zone:J.floors.length>1?(n===0?'Ground floor':'Upstairs'):'',
      stairs:{up:J.floors[n+1]?{level:L(n+1),spawn:near(l=>l.downAt)}:null,down:n>0?{level:L(n-1),spawn:near(l=>l.upAt)}:null}})})); });

  // Sir Aldric in the Family Farmhouse: home once Abaddon falls, and the Demon Hunt is his to give
  { const R=ENGINE.levels['in:home_house:0']; if(R&&R.lazy){ const lz=R.lazy; R.lazy=()=>{ const lv=lz(); const f=lv.folk.find(q=>q.who==='Sir Aldric');
      if(f){ HUNT.aldric(f); lv.anim.push(()=>{ const on=!!S().abaddonWon; f.g.visible=on; f.mute=!on; f.ghost=!on; }); }
      // after the wedding: the princess at your family's table (ensureMadisonAtHome)
      const md=addPerson(lv,lv.room||lv.scene,'noble',9.5,5.5,0,'Princess Madison',['Your mother has asked me four times whether the palace fed me properly. I have stopped saying yes; she does not believe it.','I like it here. There is a window in your top room that faces east — I have watched the sun come up from it eleven mornings running, and it has not once failed.','Sunfall is keeping its own watch now. The lamps are theirs again. The boy with the kite writes to me, if you can believe it.'],{her:{main:'#e88ab0',trim:'#f2d27a'},rest:Math.PI});
      lv.anim.push(()=>{ const on=!!S().homecoming; md.g.visible=on; md.mute=!on; md.ghost=!on; }); return lv; }; } }

  // ✦ the knight's own top floor: the lectern (the codex) and the wardrobe glass (HS_LECTERN, HS_WARDROBE)
  { const LB=PASTIME_DATA&&PASTIME_DATA.library, R=ENGINE.levels['in:home_house:'+(LB?LB.lectern.floor:2)]; if(R&&R.lazy&&LB){ const lz=R.lazy; R.lazy=()=>{ const lv=lz(), Lc=LB.lectern, Wd=LB.wardrobe;
      const lec=group(Lc.x+0.5,0,Lc.y+0.5,lv.scene); Cy(0.06,0.1,0.95,6,0x6a4428,0,0,0,lec); B(0.4,0.06,0.4,0x5a3a20,0,0,0,lec); const top=B(0.56,0.05,0.4,0x7a5030,0,0.98,0,lec); top.rotation.x=0.4;
      const bk=B(0.46,0.04,0.32,0xf4eee0,0,1.03,0.0,lec); bk.rotation.x=0.4; B(0.02,0.045,0.33,0x8a2a2a,0,1.035,0,lec).rotation.x=0.4; shade(lec);
      const gl=group(Wd.x+0.5,0,Wd.y+0.5,lv.scene); B(0.7,1.7,0.08,0x5a3a20,0,0,0,gl); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.56,1.4),new THREE.MeshStandardMaterial({color:0xcfe0ea,metalness:0.9,roughness:0.12}));
      m.position.set(0,0.88,0.05); gl.add(m); B(0.8,0.08,0.3,0x5a3a20,0,0,0,gl); shade(gl);
      lv.spots.push({x:Lc.x+0.5,z:Lc.y+1.2,r:1.2,label:'Read',who:'The lectern',action:()=>ENGINE.speak('Your library',LIBRARY.codexPages())});
      lv.spots.push({x:Wd.x+0.5,z:Wd.y+0.9,r:1.2,label:'Change',who:'The wardrobe glass',action:()=>LIBRARY.wardrobe()});
      return lv; }; } }
  // Tobias by his own fire: the two lessons first (TOBIAS_LESSONS, tutorial.step), then whatever the story has him say
  { const R=ENGINE.levels['in:tobias:0']; const T=DIALOGUE.tobias; if(R&&R.lazy&&T){ const lz=R.lazy; R.lazy=()=>{ const lv=lz(); const f=lv.folk.find(q=>q.who==='Tobias');
      if(f){ f.lines=null; f.action=()=>{ const s=S(); s.tutorial=s.tutorial||{step:0,done:false};
        if(!s.tutorial.done){ const i=Math.min(s.tutorial.step,T.lessons.length-1); ENGINE.speak('Tobias',T.lessons[i],f,()=>{ s.tutorial.step++; if(s.tutorial.step>=T.steps) s.tutorial.done=true; GAME.save(); }); return; }
        const d=DIALOGUE.lines(f.key), st=DIALOGUE.stage();
        const after=s.abaddonWon?["Look at you. The realm's champion, sitting at my hearth like a boy again.","Go on home. They have waited long enough."]:st==='c10'?["Every chapel cleansed. Every one. I never thought I'd live to say it.","Hellgate, then. Keep that shield up."]:T.after[(s.tutorial.after=(s.tutorial.after|0)+1)%T.after.length];
        ENGINE.speak('Tobias',after||(d&&d.lines)||['…'],f); }; } return lv; }; } }
  // the keeps' tourney marshals, once the Demon Hunt is done (ensureMarshals): Ironhold's and Hellgate's (Stormgate keeps its own)
  [['ih_keep',-1],['ih_keep',1],['hg_keep',-1],['hg_keep',1]].map(([k,sd])=>{ const ds=world.doorStep(k)||{x:0,z:0,face:0}, a=ds.face||0; return [k,ds.x+Math.cos(a)*2.0*sd+Math.sin(a)*1.2,ds.z-Math.sin(a)*2.0*sd+Math.cos(a)*1.2]; }).forEach(([keep,x,z],i)=>{ const p={x,z};   /* V199: either side of the keep's door, wherever the keep stands */
    const f=addPerson(world,world.scene,'soldier',p.x,p.z,world.ground(p.x,p.z),i%2?'Herald of the Melee':'Marshal of the Lists',['The champions await.'],{rest:0});
    f.label='Contest'; f.action=()=>typeof LISTS!=='undefined'&&LISTS.openMenu(keep);
    world.anim.push(()=>{ const on=!!(S().hunt&&S().hunt.done); if(f.g.visible!==on){ f.g.visible=on; f.mute=!on; f.ghost=!on; } }); });

  // ── Stormgate's services and contests, as in cities/stormgate.js ──
  const at=(x,y)=>({x:SX(x)+0.5,z:SY(y)+0.5});   // (callers give the 2D game's tiles)
  const signTo=(re,label,action)=>{ const s=world.spots.find(q=>re.test(q.who)); if(s){ s.label=label; s.action=action; delete s.lines; } };
  signTo(/PET STYLIST/,'Stylist',()=>SERVICES.openStylist());
  signTo(/PET TOURNAMENT/,'Enter',()=>typeof PETT!=='undefined'&&PETT.open());
  signTo(/KING.S TOURNEY/,'Ride',()=>ENGINE.go('race'));
  [[227,287,'Marshal of the Lists'],[227,292,'Herald of the Melee']].forEach(([x,y,who])=>{ const p={x:RX(x)+0.5,z:RY(y)+0.5};   /* V198: at the tilting yard's west gate (V197 tiles); they were set down twice-shifted, off the map */
    const f=addPerson(world,world.scene,'royalguard',p.x,p.z,world.ground(p.x,p.z),who,['Stormgate’s champions await. Choose how you’ll prove your blade.'],{rest:0});
    f.label='Contest'; f.action=()=>typeof LISTS!=='undefined'&&LISTS.openMenu('sg_keep'); });
  const guards=(I.sg_keep.npcs||[]).filter(n=>n.royalguard).map(n=>n.lines[0]);
  ENGINE.add({id:'keep',lazy:()=>{ const keep=throneLevel({ id:'keep', exit:back('sg_keep'), hall:WD.thall,
    king:{name:'King Karl',lines:['You have come far, knight of Luminar.','The realm’s hope rests on your blade — and on the God who guides it.']},
    guardLines:[guards[0]||'Stand tall before the throne, knight.',guards[1]||guards[0]||'Stand tall before the throne, knight.'] });
    const f=addPerson(keep,keep.scene,'knight',5.5,19.5,0,'Dame Elspeth',['Stormgate’s champions await. Choose how you’ll prove your blade.'],{her:{main:'#2f4a8f',trim:'#e8c766'},rest:Math.PI/2});
    f.label='Contest'; f.action=()=>ENGINE.speak('Dame Elspeth',f.lines,f,()=>typeof LISTS!=='undefined'&&LISTS.openMenu('sg_keep')); return keep; }});
  const raceSign=world.spots.find(q=>/KING.S TOURNEY/.test(q.who)), fromRace=raceSign?{x:raceSign.x,z:raceSign.z+1.2,face:0}:at(167,231);
  ENGINE.add({id:'race',lazy:()=>raceLevel({ id:'race', course:'stormgate', exit:{level:'world',spawn:fromRace} })});
  if(typeof listsLevel==='function') ENGINE.add({id:'lists',lazy:()=>listsLevel({ id:'lists', keep:'sg_keep', exit:{level:'world',spawn:{x:RX(247)+0.5,z:RY(294)+0.5,face:Math.PI}} })});
  if(typeof petTourneyLevel==='function') ENGINE.add({id:'petring',lazy:()=>petTourneyLevel({ id:'petring', exit:{level:'world',spawn:Object.assign(at(155,223),{face:0})} })});

  // ── the finale: Abaddon in the Hellgate keep, then King Karl's grant in Stormgate's ──
  const hgDoor=WD.buildings.find(b=>b.id==='hg_keep');
  const PORTALS=(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.finale&&PASTIME_DATA.finale.portals)?portalSystem(world,PASTIME_DATA.finale.portals,typeof PORTAL_WORLDS!=='undefined'?PORTAL_WORLDS:{}):null;   // the three tears in the sky
  world.portalSys=PORTALS;   /* V133: tests and tools reach the portal worlds through this */
  GOAL_API.cur=goalSystem(world,{portals:PORTALS});   // ➤ the next goal, under the place plate and as a gold star on the map
  const FINALE=(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.finale&&hgDoor)?finaleLevel(PASTIME_DATA.finale,{ id:'finale', exit:back('hg_keep'), keep:'keep', afterKeep:back('sg_keep') }):null;
  world.finale=FINALE;   /* V180: tests and tools reach the throne room through this */

  // ── begin: where this save last stood (or Hearthvale); a first visit picks a knight ──
  const hash=(location.hash||'').slice(1);
  const startAt=()=>S().at?{x:S().at.x,z:S().at.z,face:0}:HEARTH;
  if(['forest','glade','monkcave','robbycave','surf'].includes(hash)){ ENGINE.start('world',startAt()); setTimeout(()=>ENGINE.go(hash),300); }
  else if(hash==='finale'){ ENGINE.start('world',startAt()); setTimeout(()=>FINALE&&FINALE.enter(),300); }
  else if(/^chapel\d$/.test(hash)){ ENGINE.start('world',startAt()); setTimeout(()=>chapel(+hash.slice(6)).enter(),300); }
  else ENGINE.start(ENGINE.levels[hash]&&hash!=='world'?hash:'world',startAt());
  if(DEEP&&!hash) DEEP.restore();   // a save made underwater comes back underwater
  // a save made in a portal world comes back there (S.pwAt, kept while you're through a portal); loading another slot
  // from ☰ System takes you to where that hero stood
  setInterval(()=>{ const lv=ENGINE.level, s=S(); if(!lv||ENGINE.busy) return; if(lv.id.indexOf('pw:')===0) s.pwAt={id:lv.id.slice(3),x:ENGINE.P.x,z:ENGINE.P.z}; else if(lv.id==='world') delete s.pwAt; },1000);
  GAME.resume=()=>{ const s=S(), a=s.pwAt; if(a&&PORTALS&&((s.portals||{})[a.id]||{}).unlocked){ const wl=PORTALS.worldLevel(a.id); if(wl){ ENGINE.go('pw:'+a.id,{x:a.x,z:a.z,face:Math.PI}); return; } }
    if(DEEP&&DEEP.restore()) return; ENGINE.go('world',startAt()); };
  if(!hash&&S().pwAt) setTimeout(()=>GAME.resume(),400);
  // ── a new journey (INTRO): the story crawl for a new knight, then your name and your companion ──
  const INTRO_STORY=['Long ago, the kingdom of Luminar shone bright under heaven’s grace.',
    'Then the demon king Abaddon tore open the dark, and his legions fell upon the land. Ten towns were seized, their faithful generals struck down.',
    'Your father, the knight Sir Aldric, rode out to answer the darkness — and never returned.',
    'Your mother, Lady Elara, fell ill and stayed at the homestead with your newborn brother and sister.',
    'So your grandfather Tobias took you, just three years old, to the quiet village of Hearthvale, and raised you in the sword and the Word.',
    'Now the shadow creeps toward home. The call has come to you, the kingdom’s last knight…'];
  function journey(preset,slotN){ let step=preset==='ch0'?0:INTRO_STORY.length, name='', pick=0;
    const draw=()=>{ if(step<INTRO_STORY.length){ UI.sheet({title:'⚔ Kingdom’s Last Knight',noClose:true,html:`<p class="gm-intro" style="font-size:17px;line-height:1.7;text-align:center;margin:28px 6px">${UI.esc(INTRO_STORY[step])}</p><button class="gm-btn" data-act="next">Continue (${step+1}/${INTRO_STORY.length})</button>`,act:()=>{ step++; draw(); }}); return; }
      if(step===INTRO_STORY.length){ UI.sheet({title:'Name Your Knight',noClose:true,html:`<p class="gm-intro" style="text-align:center">What is your name, young knight?</p><input id="introName" maxlength="14" placeholder="Knight" value="${UI.esc(name)}" style="width:100%;box-sizing:border-box;padding:12px;font-size:18px;text-align:center;border-radius:8px;border:1px solid #5a4a7a;background:#1a1330;color:#fff"><button class="gm-btn" data-act="next">Continue</button>`,
          act:()=>{ const i=document.getElementById('introName'); name=((i&&i.value)||'').trim().slice(0,14); step++; draw(); }}); setTimeout(()=>{ const i=document.getElementById('introName'); if(i) i.focus(); },50); return; }
      const ids=SYS.STARTER_PETS||['faithful','grace','steadfast'];
      let h='<p class="gm-intro" style="text-align:center">A faithful creature will walk with you. As it grows, it will carry you across the land. Choose well.</p>';
      ids.forEach((id,i)=>{ const L=SYS.PETS[id], f3=L.forms[2]; h+=`<button class="gm-item ${i===pick?'worn':''}" data-act="pet:${i}"><span>${L.forms.map(f=>f.emoji).join(' → ')} <b>${UI.esc(L.name)}</b> — ${UI.esc(L.focus||'')}<span class="ds">${UI.esc(L.desc||'')} Final form: ${UI.esc(f3.name)} — ${f3.ability==='ride'?'rides at double speed':f3.ability==='fly'?'flies over trees, water and cliffs':'swims across water'}.</span></span>${i===pick?'<i>✓</i>':''}</button>`; });
      h+='<button class="gm-btn" data-act="go">Begin your journey</button>';
      UI.sheet({title:'Choose Your Companion',noClose:true,html:h,act:a=>{ if(a.indexOf('pet:')===0){ pick=+a.slice(4); draw(); return; } UI.close(); begin(ids[pick]); }}); };
    function begin(pet){ GAME.newGame(slotN||GAME.slot,preset); const s=S(); s.name=name||'Knight'; const form=s.pet?s.pet.form:0; s.pet={id:pet,form,name:SYS.PETS[pet].name,ribbon:'',equip:{}}; GAME.recalc(); GAME.changed(); GAME.save();
      if(preset!=='ch0'){ GAME.onNew(); return; }
      // a new knight wakes in the bed upstairs at Tobias's, and the old man comes up to him
      s.tutorial={step:0,done:false}; const f=SYS.PETS[pet].forms[0];
      ENGINE.go('in:tobias:1'); setTimeout(()=>ENGINE.speak('Tobias',[`Easy now, ${s.name}. You slept like the dead.`,`${f.emoji} And there’s a ${f.name} curled by the fire downstairs that won’t be shooed off. Yours, it seems.`,'Get your legs under you. I’ll be downstairs by the fire — come down and I’ll show you what you need to know.']),700); }
    draw(); }
  /* V179: the title screen (engine/title.js) comes first; choosing an empty slot there brings up the new-game choices for that slot */
  GAME.pickStart=n=>UI.sheet({title:'Kingdom’s Last Knight',noClose:true,html:
    `<p class="gm-intro">The realm of Luminar, Hearthvale to Hellgate. Every chapel is bound, and each town sits under Abaddon’s dome until the one before it is cleansed. Begin at the start, or at any chapter with the strength of a knight who won the ones before.</p>`
    +Array.from({length:19},(_,N)=>`<button class="gm-item" data-act="ch${N}"><span>${UI.esc(GAME.presets['ch'+N].label)} <span class="ds">${N===0?'walk the roads, cleanse General Aiden’s chapel':N===10?'all ten chapels cleansed · the Demon King waits in the Hellgate keep':N===11?'Abaddon fallen · Sir Aldric waits at the Family Farmhouse':N===12?'the Demon Hunt done · the Old Mule’s cart waits at the Homestead, 3,000 g to trade with':N===13?'every inn-town’s bounties done · the usurper sits on Abaddon’s empty throne':N===14?'the Pretender fled with Princess Madison · on Mistral Isle’s summit, by the open gate':N===15?'beyond the Mistral Gate · all five folds cleansed · the castle gate stands open':N===16?'Mistral freed · through the Tabor Gate, at the foot of the frozen mountain':N===17?'Tabor alive · through the Sunfall Gate, at the mouth of the spiral':N===18?'every lamp lit, every span mended · before the cathedral doors in Vesper':`${N} chapel${N>1?'s':''} cleansed · ${UI.esc(TD[N].general)} waits at the chapel door`}</span></span></button>`).join(''),
    act:k=>{ UI.close(); journey(k,n); }});
  const titled=typeof TITLE!=='undefined'&&TITLE.show({build:'V179'});
  if(!titled&&!GAME.peek(GAME.slot)) setTimeout(()=>GAME.pickStart(GAME.slot),600);
})();
