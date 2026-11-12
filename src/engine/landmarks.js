// ════════════════════════════════════════════════════════════════
//  LANDMARKS (V127) — open world, step D: places to find in the open country between the towns.
//   · three old WATCHTOWERS you can climb in the open world: a stair spiralling round the outside of a crumbling stone
//     tower to the broken top, where you can look out over the realm (the first time: XP, gold and a journal entry; the
//     Old Watch keeps a chest up there). The climb is the overworld's own walk — world.ground and canMove are taught the
//     stair: the height you stand at on it is the turn of the spiral nearest where you are, so you climb by walking round.
//   · the High Roads' set pieces, now on the real map: the drovers' camp under its old oak and the mill (on the Trade Road),
//     the oasis camp under the palms (the way to Crystalpeak), and the drowned chapel with its bell (Shadowmere's fen)
//   · a shepherd's hut, a waystone shrine cut with a verse, and a spring in a hollow that mends you
//  The places stand in the realm's own (stretched) coordinates. LANDMARKS.attach(world). State: GAME.S.landmarks = {saw:{}}.
// ════════════════════════════════════════════════════════════════
const LANDMARKS=(function(){
  const S=()=>GAME.S, st=()=>{ const s=S(); s.landmarks=s.landmarks||{saw:{}}; s.landmarks.saw=s.landmarks.saw||{}; return s.landmarks; };
  const jw=(t,o)=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(t,o); };
  const first=(id,fn)=>{ const s=st(); if(s.saw[id]) return false; s.saw[id]=true; GAME.save(); if(fn) fn(); return true; };
  const TOWERS=[
    {id:'oldwatch', name:'The Old Watch', x:70.5, z:44.5, a0:Math.PI*0.5, chest:true,
     view:'From the broken top you can see Hearthvale’s roofs and the long Trade Road running east over the river to Dusthaven, and far off north the pines of the Scholar’s Way.'},
    {id:'frostwatch', name:'Frostwatch', x:235.5, z:74.5, a0:Math.PI, view:'Crystalpeak’s snows stand close enough to touch. West the desert shimmers; east, past the dark crags, a smudge of smoke — Hellgate.'},
    {id:'southwatch', name:'Southwatch', x:145.5, z:321.5, a0:0, view:'The southern sea, all the way to the isles: Mistral’s downs, the white peak of Tabor, Sunfall’s atoll low on the water. Stormgate’s towers to the east.'} ];
  const H=7.0, RC=1.45, RS=2.65, TURNS=1.25;
  function attach(world){
    if(world.id!=='world') return null;
    const scene=world.scene, g0=world.ground, cm0=world.canMove;
    const base=(x,z)=>g0(x,z);
    // ── the towers' stairs, taught to the world's walk ──
    TOWERS.forEach(T=>{ let lo=1e9; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; lo=Math.min(lo,base(T.x+Math.cos(a)*(RS+0.4),T.z+Math.sin(a)*(RS+0.4))); } T.y0=Math.min(lo,base(T.x+Math.cos(T.a0)*2.05,T.z+Math.sin(T.a0)*2.05)); T.pitch=(H-0.15)/TURNS; });   // the foot of the stair meets the ground where it starts
    const P=ENGINE.P, TAU=Math.PI*2;
    function towerAt(x,z){ for(const T of TOWERS){ const d=Math.hypot(x-T.x,z-T.z); if(d<RS+0.05) return [T,d]; } return null; }
    function stairH(T,x,z,ref){ let a=Math.atan2(z-T.z,x-T.x)-T.a0; a=((a%TAU)+TAU)%TAU; const t0=a/TAU; let best=null, bd=1e9;
      for(let k=0;k<=Math.ceil(TURNS);k++){ const t=t0+k; if(t>TURNS) break; const h=T.y0+0.15+t*T.pitch, dd=Math.abs(h-ref); if(dd<bd){ bd=dd; best=h; } } return best; }
    world.ground=(x,z)=>{ const hit=towerAt(x,z); if(!hit) return g0(x,z); const [T,d]=hit, ref=P&&P.y!==undefined?P.y:T.y0;
      if(d<RC) return ref>T.y0+H-1.2?T.y0+H:T.y0;   // the top of the tower (and its foot, for anything that asks from below)
      const h=stairH(T,x,z,ref); return h===null?g0(x,z):Math.max(g0(x,z),h); };
    world.canMove=(fx,fz,tx,tz)=>{ const hit=towerAt(tx,tz), from=towerAt(fx,fz);
      if(!hit&&!from) return cm0(fx,fz,tx,tz);
      if(hit){ const [T,d]=hit; if(d<RC&&P.y<T.y0+H-1.2) return false; }   // the tower's solid core, unless you're at the top
      const gf=world.ground(fx,fz), gt=world.ground(tx,tz); if(gt-gf>0.7) return false;   // no climbing up its side; stepping off, you fall
      return hit?true:cm0(fx,fz,tx,tz); };
    world.landmarkTowers=TOWERS;
    // V131: the camera knows the towers — their stone stands between it and you, so it pulls in rather than looking through
    const cb0=world.camBlock; world.camBlock=(fx,fz,y)=>{ for(const T of TOWERS){ const d=Math.hypot(fx-T.x,fz-T.z); if(d<RC+0.15&&y<T.y0+H+0.5) return true; } return cb0?cb0(fx,fz,y):false; };
    // and if the stair hugs the stone so close the camera still finds itself in the core, it steps out onto the open side of the
    //  stair, a little above him, and looks back down at him
    const fo0=world.follow; world.follow=P=>{ if(fo0) fo0(P); const C=ENGINE.cam; if(!C||ENGINE.level!==world) return; for(const T of TOWERS){ const d=Math.hypot(C.position.x-T.x,C.position.z-T.z); if(d<RC+0.35&&C.position.y<T.y0+H+0.6){
      const px=P.x-T.x, pz=P.z-T.z, pl=Math.hypot(px,pz)||1; C.position.set(T.x+px/pl*(RS+2.6),Math.max(P.y+2.0,C.position.y),T.z+pz/pl*(RS+2.6)); C.lookAt(P.x,P.y+1.0,P.z); } } };
    // ── the towers themselves ──
    const stone=[0x8a8578,0x7e7a6c,0x96907f,0x74706a], mats=stone.map(c=>new THREE.MeshLambertMaterial({color:c}));
    TOWERS.forEach((T,ti)=>{ const g=group(T.x,T.y0,T.z,scene);
      // the core: courses of stone, the top ragged where it has fallen away
      for(let r=0;r<Math.round(H/0.5);r++){ const y=r*0.5, n=14; for(let i=0;i<n;i++){ const a=i/n*TAU+(r%2)*0.22, top=r>=Math.round(H/0.5)-2; if(top&&hsh(i*7+ti,r)<0.45) continue;
          const b=new THREE.Mesh(new THREE.BoxGeometry(0.72,0.5,0.5),mats[(i+r+ti)%4]); b.position.set(Math.cos(a)*(RC-0.2),y+0.25,Math.sin(a)*(RC-0.2)); b.rotation.y=-a+Math.PI/2; b.castShadow=b.receiveShadow=true; g.add(b); } }
      const fill=new THREE.Mesh(new THREE.CylinderGeometry(RC-0.35,RC-0.35,H,14),mats[1]); fill.position.y=H/2; g.add(fill);
      const deck=new THREE.Mesh(new THREE.CylinderGeometry(RC+0.05,RC+0.05,0.16,16),mats[2]); deck.position.y=H-0.06; deck.receiveShadow=true; g.add(deck);
      // the broken parapet round the top
      for(let i=0;i<16;i++){ if(hsh(i,ti*5+2)<0.4) continue; const a=i/16*TAU, b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.35+hsh(i,ti)*0.5,0.3),mats[i%4]); b.position.set(Math.cos(a)*(RC-0.05),H+0.2,Math.sin(a)*(RC-0.05)); b.rotation.y=-a+Math.PI/2; b.castShadow=true; g.add(b); }
      // the stair: a tread every 12°, from the foot round one and a quarter turns to the top, with a worn rail stone now and then
      const N=Math.round(TURNS*30); for(let i=0;i<N;i++){ const t=(i+0.5)/N*TURNS, a=T.a0+t*TAU, h=0.15+t*T.pitch;
        const tr=new THREE.Mesh(new THREE.BoxGeometry(RS-RC+0.05,0.22,0.62),mats[(i+ti)%4]); tr.position.set(Math.cos(a)*(RC+RS)/2,h-0.11,Math.sin(a)*(RC+RS)/2); tr.rotation.y=-a; tr.castShadow=tr.receiveShadow=true; g.add(tr);
        const sp=new THREE.Mesh(new THREE.BoxGeometry(RS-RC,0.32,0.56),mats[(i+1)%4]); sp.position.set(Math.cos(a)*(RC+RS)/2,h-0.38,Math.sin(a)*(RC+RS)/2); sp.rotation.y=-a; g.add(sp);   // the tread's own slab of stone
        if(i%2===0&&h>0.6){ const cb=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.36),mats[(i+3)%4]); cb.position.set(Math.cos(a)*(RC+0.25),h-0.68,Math.sin(a)*(RC+0.25)); cb.rotation.y=-a; g.add(cb); }   // a corbel carrying it out from the wall
        if(i%3===0&&hsh(i,ti+9)>0.35){ const rl=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.5,0.4),mats[(i+2)%4]); rl.position.set(Math.cos(a)*(RS-0.1),h+0.25,Math.sin(a)*(RS-0.1)); rl.rotation.y=-a; rl.castShadow=true; g.add(rl); } }
      // fallen stones about its foot, a doorway (blocked with rubble), and on top a cold brazier and a flagpole with a rag of a banner
      for(let i=0;i<9;i++){ const a=hsh(i,ti*3)*TAU, r=RS+0.6+hsh(ti,i)*2.4, b=new THREE.Mesh(new THREE.BoxGeometry(0.5+hsh(i,4)*0.3,0.32,0.4),mats[i%4]); b.position.set(Math.cos(a)*r,0.16,Math.sin(a)*r); b.rotation.set(hsh(i,1)*0.5,hsh(i,2)*3,hsh(i,3)*0.4); b.castShadow=true; g.add(b); }
      { const a=T.a0-0.7, d=B(0.9,1.5,0.15,0x2a2622,Math.cos(a)*(RC-0.05),0,Math.sin(a)*(RC-0.05),g); d.rotation.y=-a+Math.PI/2; for(let i=0;i<4;i++){ const r2=Sp(0.2+hsh(i,7)*0.1,stone[i%4],Math.cos(a)*(RC+0.2)+hsh(i,9)*0.3,0.12+i*0.12,Math.sin(a)*(RC+0.2),g,6,4); r2.scale.y=0.7; } }
      Cy(0.32,0.22,0.4,8,0x3a3632,0.4,H,0.3,g); Cy(0.05,0.05,2.4,6,0x4a3422,-0.6,H,-0.5,g); const flag=B(0.7,0.4,0.03,0x7a2a2a,-0.25,H+2.0,-0.5,g); world.anim.push(t=>{ flag.rotation.y=Math.sin(t*1.7+ti)*0.35; });
      // the look from the top; the chest at the Old Watch
      world.spots.push({x:T.x,z:T.z,r:1.4,label:'Look',who:T.name,action:()=>{ if(P.y<T.y0+H-1.2){ ENGINE.speak(T.name,['An old watchtower, its stair winding up round the outside. The top has half fallen away. You could climb it.']); return; }
        ENGINE.speak(T.name,[T.view,'“Watchman, what of the night? The watchman said, The morning cometh.” — Isaiah 21:11–12'],null,()=>{
          first('tower:'+T.id,()=>{ const x=GAME.gainXp(80); GAME.addGold(40); UI.toast(`🗼 You climbed ${T.name} — +80 XP · +40g${x&&x.up?' · LEVEL UP!':''}`,2800); jw(`I climbed ${T.name}, round and round its broken stair to the top. ${T.view}`,{place:T.name}); }); }); }});
      if(T.chest){ const a=T.a0+2.2, cx=T.x+Math.cos(a)*0.6, cz=T.z+Math.sin(a)*0.6, lid=CHEST3D.make(scene,cx,cz); lid.parent.position.y=T.y0+H;   /* V165 */
        CHEST3D.set(lid,!!st().saw['chest:'+T.id]);
        world.spots.push({x:cx,z:cz+0.6,r:0.9,label:'Open',who:'An old chest',action:()=>{ if(P.y<T.y0+H-1.2) return; if(!first('chest:'+T.id)){ ENGINE.speak('An old chest',['Empty now.']); return; } CHEST3D.open(lid);
          const s=S(); s.inventory.greaterPotion=(s.inventory.greaterPotion||0)+2; GAME.addGold(150); GAME.changed(); ENGINE.speak('An old chest',['Left by the last watchman, with a note: “For whoever climbs up after me. Keep watch.” Inside: 150 gold and two greater healing potions.']); }}); }
    });
    // ── the High Roads' set pieces and the other places to find ──
    const at=(x,z)=>({x,z,y:base(x,z)});
    const fire=(c)=>{ for(let i=0;i<10;i++){ const a=i/10*TAU, s=new THREE.Mesh(new THREE.IcosahedronGeometry(0.16,0),new THREE.MeshLambertMaterial({color:0x6a6a64})); s.position.set(Math.cos(a)*0.5,0.08,Math.sin(a)*0.5); c.add(s); }
      for(let i=0;i<4;i++){ const l=Cy(0.06,0.06,0.7,6,0x5a3c22,0,0.08,0,c); l.rotation.z=Math.PI/2; l.rotation.y=i*0.8; }
      const fl=[0,1,2].map(i=>Co(0.2-i*0.05,0.5-i*0.1,6,glow([0xff7a2a,0xffb03a,0xffe08a][i]),0,0.12,0,c)); const L=new THREE.PointLight(0xffa050,1.0,9,1.6); L.position.set(0,0.8,0); c.add(L);
      world.anim.push(t=>{ fl.forEach((f,i)=>{ f.scale.set(1,1+Math.sin(t*9+i*2)*0.2,1); f.rotation.y=t*(1+i); }); L.intensity=0.9+Math.sin(t*11)*0.1; }); };
    const rest=(who,line,jtxt)=>()=>{ if(world.combat&&world.combat.foes.some(d=>d.alive&&Math.hypot(d.x-P.x,d.z-P.z)<8)){ UI.toast('⚔ Not with demons so close.',1600); return; }
      const s=S(); s.hp=s.maxHp; s.dayFrac=(s.dayFrac||0)+1/24; ENGINE.hud&&ENGINE.hud(); GAME.changed(); GAME.save(); ENGINE.speak(who,[line]); first('rest:'+who,()=>jw(jtxt,{place:who})); };
    const tree=(kind,x,z,sc,par)=>{ if(typeof TREE_GEO==='undefined'||!TREE_GEO[kind]) return; const m=new THREE.Mesh(TREE_GEO[kind](),new THREE.MeshLambertMaterial({vertexColors:true})); m.scale.setScalar(sc); m.position.set(x,0,z); m.castShadow=true; par.add(m); };
    const PLACES=[];
    // the drovers' camp, under an old oak by the Trade Road
    { const p=at(95.5,38.5), c=group(p.x,p.y,p.z,scene); fire(c); tree('oak',-2.6,-2.2,2.0,c); const tt=group(2.4,0,-1.4,c); const tent=prism(1.8,1.3,2.0,0xc8b88a); tent.rotation.y=0.3; tt.add(tent); B(0.06,1.4,0.06,0x5a3c22,0,0,0,tt);
      [[-1.5,0.5,0.4],[1.3,0.8,-0.5]].forEach(([a,b,r])=>{ const l=Cy(0.18,0.2,1.3,8,0x6a4a2a,a,0.18,b,c); l.rotation.set(0,r,Math.PI/2); }); B(0.9,0.7,0.6,0x8a6a40,-1.8,0,1.6,c); B(0.9,0.06,0.62,0x6a4a2a,-1.8,0.7,1.6,c);   // a hay-bale, a crate
      world.spots.push({x:p.x,z:p.z+1.3,r:1.3,label:'Rest',who:'The drovers’ camp',action:rest('The drovers’ camp','You sit by the drovers’ fire under the old oak. Somewhere a bell-wether clanks. An hour passes; you rise mended.','I rested at the drovers’ camp under the old oak on the Trade Road, with the cattle-bells going in the dark.')});
      PLACES.push({x:p.x,z:p.z,r:7,name:'⛺ The drovers’ camp'}); }
    // the mill, its wheel turning in a millrace
    { const p=at(113.5,90.5), g=group(p.x,p.y,p.z,scene); B(2.6,2.2,2.2,0xe8dcc4,0,0,0,g); const rf=prism(3.0,1.4,2.6,0x8a4a36); rf.position.y=2.2; g.add(rf); B(0.6,1.2,0.06,0x5a3a22,0,0,1.11,g);
      const race=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.12,3.6),new THREE.MeshPhongMaterial({color:0x4a8ab0,shininess:60})); race.position.set(1.9,0.06,0.2); g.add(race); B(0.12,0.3,3.6,0x7a7468,1.35,0,0.2,g); B(0.12,0.3,3.6,0x7a7468,2.45,0,0.2,g);
      const wheel=group(1.9,1.0,0.2,g), wm=new THREE.MeshLambertMaterial({color:0x6a4a2a});   // the wheel turns on an axle across the race (x); paddles round its rim
      for(const sx of [-0.22,0.22]){ const rim=new THREE.Mesh(new THREE.TorusGeometry(0.85,0.05,6,20),wm); rim.rotation.y=Math.PI/2; rim.position.x=sx; wheel.add(rim); }
      for(let i=0;i<10;i++){ const a=i/10*TAU, pd=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.08,0.3),wm); pd.position.set(0,Math.cos(a)*0.85,Math.sin(a)*0.85); pd.rotation.x=a; wheel.add(pd); const sk=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.85),wm); sk.position.set(0,Math.cos(a)*0.42,Math.sin(a)*0.42); sk.rotation.x=a+Math.PI/2; wheel.add(sk); }
      const ax=Cy(0.08,0.08,0.9,8,0x4a3422,0,0,0,wheel); ax.rotation.z=Math.PI/2; ax.position.set(0,0,0);
      world.anim.push((t,dt)=>{ wheel.rotation.x+=(dt||0.016)*0.9; });
      world.spots.push({x:p.x,z:p.z+1.7,r:1.2,label:'Look',who:'The mill',lines:['The mill on its race, the wheel turning slow. Sacks of flour stacked inside the door, and the smell of it.','“I am the bread of life.” — John 6:35']});
      PLACES.push({x:p.x,z:p.z,r:6,name:'🌾 The mill'}); }
    // the oasis camp, under the palms on the way to Crystalpeak
    { const p=at(150.5,130.5), c=group(p.x,p.y,p.z,scene); fire(c); const pool=new THREE.Mesh(new THREE.CircleGeometry(1.6,20),new THREE.MeshPhongMaterial({color:0x3a9ab8,shininess:80})); pool.rotation.x=-Math.PI/2; pool.position.set(-2.6,0.04,1.2); c.add(pool);
      [[-4.0,0.2],[-1.2,2.9],[-3.6,2.8],[2.6,-2.2]].forEach(([x,z],i)=>tree('palm',x,z,1.1+i*0.1,c)); const tt=group(2.3,0,1.2,c); const tent=prism(1.8,1.2,2.0,0xd8c49a); tent.rotation.y=-0.4; tt.add(tent);
      world.spots.push({x:p.x,z:p.z+1.3,r:1.3,label:'Rest',who:'The oasis',action:rest('The oasis','You rest in the palm-shade by the water. “He leadeth me beside the still waters: he restoreth my soul.” An hour passes; you rise mended.','I rested at the oasis under the palms, where the desert road turns for Crystalpeak.')});
      PLACES.push({x:p.x,z:p.z,r:7,name:'🌴 The oasis'}); }
    // the drowned chapel in Shadowmere's fen, its bell still hanging
    { const p=at(326.5,266.5), g=group(p.x,p.y-0.35,p.z,scene); g.rotation.z=0.06; g.rotation.x=-0.04; B(3.2,2.4,4.2,0x6a6a72,0,0,0,g); const rf=prism(3.4,1.4,4.4,0x3e3a48); rf.position.y=2.4; rf.rotation.z=0.03; g.add(rf);
      B(1.2,3.6,1.2,0x5e5e66,0,0,2.4,g); const bell=Co(0.32,0.5,10,0xc8a040,0,3.0,2.4,g); B(0.9,1.4,0.05,0x1a1820,0,0,2.11,g);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(3.6,24),new THREE.MeshPhongMaterial({color:0x2a3a3a,shininess:70,transparent:true,opacity:0.85})); pool.rotation.x=-Math.PI/2; pool.position.set(p.x,p.y+0.06,p.z+0.6); scene.add(pool);
      const lt=B(0.18,0.24,0.18,glow(0xfff0c8),1.9,1.3,2.6,g); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(lt,1.3);
      let ring=0; world.anim.push((t,dt)=>{ if(ring>0){ ring-=dt||0.016; bell.rotation.z=Math.sin(ring*9)*0.45*Math.min(1,ring); } });
      world.spots.push({x:p.x,z:p.z+3.2,r:1.4,label:'Ring',who:'The drowned chapel',action:()=>{ ring=2.4; ENGINE.speak('The drowned chapel',['You pull the old rope. The bell swings, and its voice goes out over the black water and the fog — clear, and not at all drowned.','“The light shineth in darkness; and the darkness comprehended it not.” — John 1:5'],null,()=>first('chapel:drowned',()=>{ GAME.gainXp(60); UI.toast('🔔 The drowned chapel’s bell rings again — +60 XP',2400); jw('I found the drowned chapel in the fen past Ashfield, sunk to its sills, and rang its bell. Someone keeps a lamp lit there.',{place:'The drowned chapel'}); })); }});
      PLACES.push({x:p.x,z:p.z,r:7,name:'🔔 The drowned chapel'}); }
    // the shepherd's hut, and its shepherd
    { const p=at(118.5,190.5), g=group(p.x,p.y,p.z,scene); B(2.2,1.5,1.8,0x8a7a62,0,0,0,g); const rf=prism(2.6,1.0,2.2,0x6a5a3a); rf.position.y=1.5; g.add(rf); B(0.6,1.1,0.05,0x3a2a1a,0,0,0.91,g);
      for(let i=0;i<10;i++){ const a=i/10*TAU, x=3.4+Math.cos(a)*1.8, z=1.0+Math.sin(a)*1.4; if(i===3) continue; Cy(0.05,0.06,0.8,5,0x6a4a2a,x,0,z,g); }   // the fold
      if(typeof addPerson==='function') addPerson(world,scene,'peasant',p.x+1.6,p.z+1.8,p.y,'Old Shepherd Abner',['Lost a lamb last spring, up among the rocks. Ninety-nine in the fold and I went looking for the one. Found her, too.','“Rejoice with me; for I have found my sheep which was lost.” — Luke 15:6','The towers? Watchmen built them, before my grandfather. You can still climb the stairs, if your knees are younger than mine.'],{rest:Math.PI});
      PLACES.push({x:p.x,z:p.z,r:7,name:'🐑 The shepherd’s hut'}); }
    // the waystone shrine
    { const p=at(220.5,170.5), g=group(p.x,p.y,p.z,scene); B(1.6,0.25,1.6,0x8a8478,0,0,0,g); B(0.7,1.6,0.3,0x9a948a,0,0.25,0,g); const tp=prism(0.9,0.4,0.4,0x8a8478); tp.position.y=1.85; g.add(tp); B(0.08,0.5,0.02,0xe8c46a,0,1.0,0.16,g); B(0.3,0.08,0.02,0xe8c46a,0,1.3,0.16,g);
      for(let i=0;i<5;i++) Sp(0.08,[0xf4f0ea,0xffe060,0xe85a6a][i%3],-0.6+i*0.3,0.3,0.6,g,6,4);
      world.spots.push({x:p.x,z:p.z+1.2,r:1.2,label:'Read',who:'A waystone shrine',action:()=>{ ENGINE.speak('A waystone shrine',['Someone has left wildflowers at its foot. Cut into the stone: “Thou wilt shew me the path of life: in thy presence is fulness of joy.” — Psalm 16:11'],null,()=>first('shrine',()=>{ GAME.gainXp(40); jw('A waystone shrine in the open country between Ashfield and Crystalpeak, flowers at its foot. Psalm 16:11.',{place:'A waystone shrine'}); })); }});
      PLACES.push({x:p.x,z:p.z,r:5,name:'✝ A waystone shrine'}); }
    // the spring in the hollow
    { const p=at(39.5,215.5), g=group(p.x,p.y,p.z,scene); const pool=new THREE.Mesh(new THREE.CircleGeometry(1.1,18),new THREE.MeshPhongMaterial({color:0x6ac0d8,shininess:90})); pool.rotation.x=-Math.PI/2; pool.position.y=0.05; g.add(pool);
      for(let i=0;i<12;i++){ const a=i/12*TAU, s=Sp(0.2+hsh(i,2)*0.1,[0x8a8478,0x7e7a6c,0x96907f][i%3],Math.cos(a)*1.25,0.06,Math.sin(a)*1.25,g,6,4); s.scale.y=0.6; } B(0.25,0.8,0.25,0x8a8478,0,0,-1.4,g); B(0.08,0.06,0.5,0x9a948a,0,0.7,-1.2,g);
      const drip=Sp(0.04,0xbfeaff,0,0.62,-0.95,g,6,4); world.anim.push(t=>{ drip.position.y=0.62-((t*1.6)%1)*0.56; });
      world.spots.push({x:p.x,z:p.z+1.6,r:1.2,label:'Drink',who:'A spring in the hollow',action:()=>{ const s=S(); s.hp=s.maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed(); ENGINE.speak('A spring in the hollow',['Cold and clear, out of the stone. You drink, and you are whole again.','“Whosoever drinketh of the water that I shall give him shall never thirst.” — John 4:14'],null,()=>first('spring',()=>jw('A spring in a hollow near the Homestead, cold and clear out of the stone. I drank and was mended.',{place:'A spring in the hollow'}))); }});
      PLACES.push({x:p.x,z:p.z,r:5,name:'💧 A spring in the hollow'}); }
    TOWERS.forEach(T=>PLACES.push({x:T.x,z:T.z,r:6,name:'🗼 '+T.name}));
    const zone0=world.zone; world.zone=p=>{ for(const q of PLACES) if(Math.hypot(p.x-q.x,p.z-q.z)<q.r) return q.name; return zone0?zone0(p):null; };
    world.landmarks=PLACES;
    return {towers:TOWERS,places:PLACES};
  }
  return {attach};
})();
