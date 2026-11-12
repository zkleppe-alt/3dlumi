// ════════════════════════════════════════════════════════════════
//  THE LISTS — KLK's knight tourneys (tags tj / tk / ty), from behind the knight, in 3D.
//  TOURNEY_MODES: The Grand Tournament (the joust, then four bouts) · The Joust (three passes) ·
//  Single Duel · Grand Melee (three waves). The rules are the game's:
//   challengers circle, wind up where you can see it (frames 100–122 of 160), then lunge;
//   a raised guard takes 30%, raised within 220 ms it PARRIES (he staggers, open to punish);
//   an unopened foe takes a fifth of a blow and three clangs in a row bring a riposte;
//   the third blow in quick succession is the Ground Pound; caught mid-swing costs half again.
//   Sizing is LISTS_FOE (duel 16 blows / 12%; ladder and waves scale by round). No potions.
//   The joust: aim with the stick (it drifts), STRIKE as you meet (sweet 14–60, perfect 28–44),
//   hold BRACE to take 34% of his hit for ×0.66 of yours. Three passes.
//  Rewards as exitTourney: ladder 60+12·lv g, 45+9·lv xp, the Champion's Plate · melee 20+6·lv, 12+3·lv ·
//  joust 14+4·lv, 30+6·lv · duel 6+2·lv, 26+6·lv.
// ════════════════════════════════════════════════════════════════
const LISTS=(function(){ let ret=null, keep='sg_keep';
  function openMenu(k){ const G=GAME.S; if(!(G.hunt&&G.hunt.done)){ UI.toast?UI.toast('The marshal eyes you. Finish the Demon Hunt first.'):ENGINE.speak('Marshal',['The marshal eyes you. Finish the Demon Hunt first.']); return; } keep=k||'sg_keep'; const th=SYS.TOURNEY_THEMES[keep]; const lv=ENGINE.level, P=ENGINE.P; if(lv.id!=='lists') ret={level:lv.id,spawn:{x:P.x,z:P.z,face:P.face,yaw:P.face+Math.PI}};
    const h=`<p class="gm-intro">The marshal bows. “${UI.esc(th.name)} — choose how you’ll prove your blade.” No potions in the lists.</p>`
      +SYS.TOURNEY_MODES.map(m=>`<button class="gm-item" data-act="${m.mode}"><span>${m.label} <span class="ds">${UI.esc(m.desc)}</span></span></button>`).join('')
      +`<p class="gm-hint">Duel and the Grand Tournament: stick closes in and circles, STRIKE is your combo (the third blow is the Ground Pound), hold GUARD to block — raise it just as he lunges to parry. Hold GUARD three seconds to yield.</p>`;
    UI.sheet({title:'⚔ '+th.name,html:h,act:m=>{ UI.close(); ENGINE.go('lists',{x:0,z:3,face:Math.PI,mode:m}); }}); }
  return { openMenu, get ret(){ return ret; }, get keep(){ return keep; } };
})();
function listsLevel(spec){
  const PAL=SYS.LISTS_PAL[spec.keep], TH=SYS.TOURNEY_THEMES[spec.keep], FOE=SYS.LISTS_FOE, h=hexn;
  const WAVE_FOES=['A Hedge Knight','A Squire of the Marches','A Sellsword','A Knight of the Vale','A Tourney Veteran','A Knight Errant'];
  const LADDER_FOES=['Squire Bartholomew','Ser Aldwin the Bold','Ser Percival','Dame Cordelia','The Grand Champion'];
  const PX=1/16, RA=7.6, REACH=26*PX, CONTACT=13*PX, PARRY_MS=220, GUARD_CUT=0.30, YIELD_MS=3000;
  const JOUST_GAP=360, JOUST_SPEED=4.2, SWEET=[14,60], PERFECT=[28,44], JS=0.1, LANE=60;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(h(PAL.sky[0])); scene.fog=new THREE.Fog(h(PAL.sky[1]),40,110);
  const lv={id:spec.id,name:TH.name,scene,anim:[],folk:[],spots:[],cam:{pitch:0.3,dist:6,min:6,max:6},zone:()=>''};
  scene.add(new THREE.HemisphereLight(0xfff4e0,0x6a5a40,0.7)); const sun=new THREE.DirectionalLight(0xfff0d8,0.8); sun.position.set(-20,40,20); sun.castShadow=true; sun.shadow.mapSize.set(1536,1536);
  Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:120}); scene.add(sun,sun.target);
  const crowdCols=[0xc82a2a,0x2a4a9a,0xd8b04a,0xf4eede,0x3a7a4a];
  // ── the round arena: sand, a barrier, three tiers of stands with a crowd, banners, the keep's walls beyond ──
  { const A=group(0,0,0,scene); const sand=new THREE.Mesh(new THREE.CircleGeometry(RA+1.2,40),lam(h(PAL.sand))); sand.rotation.x=-Math.PI/2; sand.receiveShadow=true; A.add(sand);
    const rim=new THREE.Mesh(new THREE.RingGeometry(RA+1.2,40,40),lam(h(PAL.outer))); rim.rotation.x=-Math.PI/2; rim.position.y=-0.01; A.add(rim);
    const segs=40; for(let i=0;i<segs;i++){ const a=i/segs*Math.PI*2, a2=(i+1)/segs*Math.PI*2, x=Math.cos(a)*(RA+0.8), z=Math.sin(a)*(RA+0.8), l=2*Math.PI*(RA+0.8)/segs;
      const b=B(l+0.05,0.9,0.15,h(PAL.rail[i%2]),0,0,0,group(x,0,z,A)); b.parent.rotation.y=-a+Math.PI/2; }
    for(let t=0;t<3;t++){ const r=RA+3+t*1.4, n=Math.round(r*4.5); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; if(Math.abs(Math.sin(a))>0.97&&Math.cos(a)<0) continue;
        const g=group(Math.cos(a)*r,0,Math.sin(a)*r,A); g.rotation.y=-a-Math.PI/2; B(1.5,0.6+t*0.7,1.3,h(PAL.stand[(i+t)%2]),0,0,0,g);
        const p=B(0.35,0.5,0.3,crowdCols[(i*7+t*3)%crowdCols.length],(hsh(i,t)-0.5)*0.8,0.6+t*0.7,0,g); Sp(0.14,0xe0b080,p.position.x,1.38+t*0.7,0,g);
        const k=hsh(i,t)*6; lv.anim.push(tt=>{ p.position.y=0.6+t*0.7+Math.max(0,Math.sin(tt*3+k))*0.12; }); } }
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+0.2, g=group(Math.cos(a)*(RA+1.6),0,Math.sin(a)*(RA+1.6),A); Cy(0.05,0.05,3.2,6,0x5a3c20,0,0,0,g); const f=B(0.04,1.0,0.6,h(PAL.banner[i%2]),0,2.0,0.31,g); lv.anim.push(tt=>{ f.rotation.y=Math.sin(tt*2+i)*0.2; }); }
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, g=group(Math.cos(a)*26,0,Math.sin(a)*26,A); g.rotation.y=-a; B(9,7,2,h(PAL.walls),0,0,0,g); Cy(1.6,1.8,9,8,h(PAL.walls),4.5,0,0,g); Co(2.2,3,8,0x4a6ab0,4.5,9,0,g); }
    shade(A); }
  // ── the joust's lists: a long sanded run, the striped tilt, stands either side, the keep at the far end ──
  { const J=group(LANE,0,0,scene); B(8,0.02,70,h(PAL.sand),0,0,0,J); B(60,0.01,90,0x4e8a4a,0,-0.02,0,J);
    for(let z=-30;z<30;z+=1.5){ B(0.25,1.1,1.5,z/1.5%2?0xd8b04a:0x8a1f2a,0,0,z+0.75,J); }
    [-1,1].forEach(sd=>{ for(let z=-32;z<32;z+=2){ for(let t=0;t<3;t++){ const g=group(sd*(6+t*1.2),0,z,J); B(1.2,0.6+t*0.7,2,h(PAL.stand[t%2]),0,0,0,g); for(let k=0;k<2;k++) B(0.3,0.45,0.3,crowdCols[(z*3+t+k+sd)&3],0,0.6+t*0.7,-0.5+k,g); } } });
    const kp=group(0,0,-42,J); B(22,9,4,h(PAL.walls),0,0,0,kp); [-9,9].forEach(x=>{ Cy(2,2.2,13,8,h(PAL.walls),x,0,0,kp); Co(2.8,4,8,0x4a6ab0,x,13,0,kp); }); shade(J); }

  // ── the people in the lists ──
  function foeKnight(i){ const c=PAL.foes[i%PAL.foes.length], k=buildKnight(); k.setLivery('knight',{TUNIC:c.tabard,TUNIC_RIM:c.trim,HELM:c.steel,PLUME:c.plume,PLUME_HI:c.plume}); k.setGearLook({shield:{rim:c.steel,field:c.shield,cross:c.trim}}); return shade(k); }
  const K=ENGINE.K, hud=$('hudMg'), callEl=$('call'); let callT=0;
  function call(t,col){ callEl.textContent=t; callEl.style.color=col||'#f4d878'; callEl.style.opacity=1; callT=1.2; }
  let T=null, meHorse=null, foeHorse=null, foeRider=null, lanceMe=null, lanceFoe=null, ret=null;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.025,6,20),glow(0xfff2c8)), shieldMark=new THREE.Mesh(new THREE.TorusGeometry(0.24,0.03,6,20),glow(0xf4d878));
  const pound=new THREE.Mesh(new THREE.TorusGeometry(1,0.08,6,32),new THREE.MeshBasicMaterial({color:0xffe87a,transparent:true,opacity:0.8})); pound.rotation.x=-Math.PI/2; pound.visible=false; scene.add(pound);
  const sparks=[]; for(let i=0;i<10;i++){ const m=B(0.07,0.07,0.07,glow(0xfff2c8),0,0,0,scene); m.visible=false; sparks.push({m,v:new THREE.Vector3(),t:0}); }
  function spark(x,y,z,col){ sparks.forEach((s,i)=>{ s.m.material=glow(col); s.m.visible=true; s.m.position.set(x,y,z); s.v.set((Math.random()-0.5)*5,Math.random()*4,(Math.random()-0.5)*5); s.t=0.3; }); }
  // ── a contest's foes, sized as tourneyWave + _listsSize do it ──
  function makeFoes(){ T.foes.forEach(f=>scene.remove(f.m)); const S=GAME.S, swing=Math.max(1,Math.round(S.atk)), pm=T.pmax, list=[];
    if(T.mode==='waves'){ const n=1+T.round, sz=FOE.waves?{hits:3+0.5*T.round,dmg:0.05+0.01*T.round}:null;
      for(let i=0;i<n;i++){ const a=T.round>1?i/n*Math.PI*2+0.4:-Math.PI/2+(n>1?(i/(n-1)-0.5)*1.6:0), r=T.round>1?RA*0.75:RA*0.55; list.push({x:Math.cos(a)*r,z:Math.sin(a)*r,title:WAVE_FOES[(T.round-1+i)%WAVE_FOES.length],spd:0.55+0.05*T.round,hits:sz.hits,share:sz.dmg}); } }
    else if(T.mode==='ladder'){ const r=T.round; list.push({x:0,z:-RA*0.15,title:LADDER_FOES[Math.min(r-1,4)],spd:0.74+0.13*r,hits:5+1.0*r,share:0.06+0.014*r}); }
    else list.push({x:0,z:-RA*0.15,title:'The Keep Champion',spd:0.9,hits:16,share:0.12});
    T.foes=list.map((o,i)=>{ const m=foeKnight(i+T.round); scene.add(m); const hp=Math.max(10,Math.round(swing*o.hits));
      return Object.assign(o,{m,hp,maxHp:hp,dmg:Math.max(1,Math.round(pm*o.share)),ai:Math.random()*60,wind:0,lunge:0,cd:0,knock:0,kx:0,kz:0,stagger:0,recover:0,hurt:0,clangs:0,alive:true,_l:false,face:0}); }); }
  function start(mode){ const S=GAME.S; T={mode,round:1,pmax:S.maxHp,php:S.maxHp,foes:[],swing:0,combo:0,comboT:0,pound:0,guard:false,guardT:0,parry:0,inv:0,rest:false,px:0,pz:RA*0.35,heading:-Math.PI/2,t:0,J:null,done:false};
    T.foes=[]; scene.add(K); K.position.set(0,0,0); K.rotation.set(0,0,0);
    if(mode==='joust') joustBegin(WAVE_FOES[(S.level+3)%WAVE_FOES.length].replace(/^A /,'').replace(/^(.)/,c=>c.toUpperCase()),0.62);
    else if(mode==='ladder') joustBegin(LADDER_FOES[0],0.5);
    else { makeFoes(); call(mode==='waves'?'THE MELEE BEGINS!':'TO ARMS!'); } }
  // ── the joust ──
  function joustBegin(name,skill){ T.J={pass:1,passes:3,phase:'charge',gap:JOUST_GAP,me:100,foe:100,name,skill,aimX:0,aimY:0,struck:null,braced:false,t:0,wait:0};
    T.foes.forEach(f=>scene.remove(f.m)); T.foes=[];
    const meM={coat:['#2a3448','#4a5a7a','#6a7a9a'],mane:'#1f2a40',silk:'#3b6fd4',silk2:'#f2c14e'}, fc=PAL.foes[0];
    K.position.set(0,0,0); K.rotation.set(0,0,0); meHorse=horseModel(meM,K); scene.add(meHorse);
    foeRider=foeKnight(0); foeHorse=horseModel({coat:['#5a3a22','#7a5a3a','#9a7a52'],mane:'#3a2a1a',silk:fc.tabard,silk2:fc.trim},foeRider); foeHorse.rotation.y=Math.PI; scene.add(foeHorse);
    lanceMe=Cy(0.05,0.07,4.2,6,0xe8e0cf,0,0,0,group(0,0,0,meHorse)); lanceMe.rotation.x=Math.PI/2; lanceMe.position.set(0.45,2.0,1.6);
    lanceFoe=Cy(0.05,0.07,4.2,6,h(fc.trim),0,0,0,group(0,0,0,foeHorse)); lanceFoe.rotation.x=Math.PI/2; lanceFoe.position.set(0.45,2.0,1.6);
    scene.add(ring,shieldMark); call('LOWER YOUR LANCE!'); }
  const jShield=J=>[Math.sin(J.t*0.05+J.pass*1.7)*0.45,Math.sin(J.t*0.037+J.pass)*0.25];
  function joustTick(f,inp){ const J=T.J; J.t+=f;
    if(J.phase==='charge'){ J.braced=!!inp.held.B; const k=0.035*f; J.aimX+=inp.x*k; J.aimY+=inp.y*k;
      J.aimX+=Math.sin(J.t*0.11)*0.006*f; J.aimY+=Math.cos(J.t*0.16)*0.005*f; J.aimX=Math.max(-1,Math.min(1,J.aimX)); J.aimY=Math.max(-1,Math.min(1,J.aimY));
      if(inp.pressed.A&&!J.struck){ const g=J.gap, timing=(g>=PERFECT[0]&&g<=PERFECT[1])?1:(g>=SWEET[0]&&g<=SWEET[1])?0.65:0, sh=jShield(J), miss=Math.hypot(J.aimX-sh[0],J.aimY-sh[1]), aim=Math.max(0,1-miss/0.55);
        J.struck={timing,aim,dmg:Math.round(48*timing*aim*(J.braced?0.66:1))}; }
      J.gap-=JOUST_SPEED*f*Math.min(1,0.4+J.t/40);
      if(J.gap<=0){ const mine=J.struck?J.struck.dmg:0, pat=[1,0.75,1][(J.pass-1)%3], his=Math.round(42*J.skill*pat*(J.braced?0.34:1));
        J.foe=Math.max(0,J.foe-mine); J.me=Math.max(0,J.me-his);
        const said=mine>=38?'SQUARE ON THE SHIELD! HIS LANCE SHATTERS':mine>=18?'A SOLID HIT':mine>0?'A GLANCING BLOW':J.struck?(J.struck.timing?'MISSED HIS SHIELD':'TOO EARLY — OR TOO LATE'):'YOU NEVER STRUCK';
        J.phase='pass'; J.wait=90; J.gap=0; call(said,mine>=38?'#fff2c8':mine>0?'#5fd36a':'#e0563a'); spark(LANE-1.1,2.0,joustZ().foe+0.6,mine>0?0xf2c14e:0xffffff); } }
    else if(J.phase==='pass'){ J.wait-=f; J.gap-=JOUST_SPEED*f;
      if(J.wait<=0){ if(J.foe<=0||J.me<=0||J.pass>=J.passes){ J.phase='done'; J.wait=80; J.won=J.foe<J.me;
          call(J.won?(J.foe<=0?'UNHORSED! THE LISTS ARE YOURS':'YOU WIN ON THE PASSES'):(J.me<=0?'UNHORSED!':'HE WINS ON THE PASSES'),J.won?'#fff2c8':'#e0563a'); }
        else { J.pass++; J.phase='charge'; J.gap=JOUST_GAP; J.struck=null; J.t=0; call('PASS '+J.pass+' OF '+J.passes); } } }
    else if(J.phase==='done'){ J.wait-=f; if(J.wait<=0){ const won=J.won; endJoust();
        if(T.mode==='ladder'){ if(won) restCard(); else finish(false); } else finish(won); } } }
  function joustZ(){ const J=T.J, ridden=(JOUST_GAP-(J.phase==='done'?0:J.gap))/2, me=18-ridden*JS; return {me, foe:me-Math.max(-60,J.gap)*JS}; }
  function endJoust(){ [meHorse,foeHorse].forEach(m=>m&&scene.remove(m)); scene.add(K); K.position.set(0,0,0); K.rotation.set(0,0,0); scene.remove(ring); scene.remove(shieldMark); T.J=null; }
  // ── bouts on foot ──
  const locked=()=>T.mode!=='waves';
  const isOpen=fo=>fo.alive&&(T.mode==='waves'||fo.wind||fo.knock>0||fo.stagger>0||fo.recover>0);
  function strike(){ const S=GAME.S; if(T.swing>0||T.pound>0) return; T.combo=T.comboT>0?T.combo+1:1; T.comboT=54;
    const before=T.foes.map(f=>f.hp), open=T.foes.map(isOpen); let pounded=false;
    if(T.combo>=3){ T.combo=0; T.swing=14; T.pound=26; pounded=true; K.swing(0,0.42); pound.visible=true; pound.position.set(T.px,0.05,T.pz); pound.scale.setScalar(0.3);
      T.foes.forEach(fo=>{ if(!fo.alive) return; const vx=fo.x-T.px, vz=fo.z-T.pz, d=Math.hypot(vx,vz); if(d>2.3) return; fo.hp-=Math.max(1,Math.round(S.atk*1.6)); fo.hurt=8;
        if(isOpen(fo)){ const m=d||1; fo.kx=vx/m*14*0.6*PX; fo.kz=vz/m*14*0.6*PX; fo.knock=12; } if(fo.hp<=0) fo.alive=false; }); call('GROUND POUND!','#ffe87a'); }
    else { T.swing=12; K.swing(); const fx=Math.cos(T.heading), fz=Math.sin(T.heading);
      T.foes.forEach(fo=>{ if(!fo.alive) return; const vx=fo.x-T.px, vz=fo.z-T.pz, d=Math.hypot(vx,vz); if(d>REACH) return; if(d>0.001&&(vx*fx+vz*fz)/d<0.15) return;
        let dmg=Math.max(1,Math.round(S.atk)+(Math.random()*4|0)); if(Math.random()<S.crit+0.05) dmg=Math.round(dmg*1.8); fo.hp-=dmg; fo.hurt=8;
        const wk=(SYS.EQUIP[S.equip.weapon]||{}).type==='heavy'?8:4, m=d||1; fo.kx=vx/m*wk*0.9*PX; fo.kz=vz/m*wk*0.9*PX; fo.knock=8; if(fo.hp<=0) fo.alive=false; }); }
    let clang=false, landed=false;
    T.foes.forEach((fo,i)=>{ const lost=before[i]-fo.hp; if(lost<=0) return; spark(fo.x,1.2,fo.z,open[i]?0xf2c14e:0xffffff);
      if(!pounded&&(fo.wind||fo.lunge)&&!(fo.stagger>0)){ fo.knock=0; fo.kx=fo.kz=0; }
      if(!open[i]){ fo.knock=0; fo.kx=fo.kz=0; fo.hp=before[i]-Math.max(1,Math.round(lost*(pounded?0.5:0.2))); fo.alive=fo.hp>0; clang=true; fo.clangs++;
        if(fo.clangs>=3&&fo.alive){ fo.clangs=0; const rd=Math.max(1,Math.round(fo.dmg*1.2*(T.guard?GUARD_CUT:1))); T.php-=rd; T.inv=Math.max(T.inv,30); call('RIPOSTE! HE TURNS YOUR BLADE','#e0563a'); } }
      else { landed=true; fo.clangs=0; } });
    if(!pounded){ if(landed) call(T.combo===2?'TWO!':'HIT!','#fff2c8'); else if(clang) call('CLANG — ON HIS SHIELD','#cfd6e0'); } }
  function footTick(f,dt,inp){ const S=GAME.S;
    // the guard, the parry window, and the yield clock
    const g=!!inp.held.B; if(g&&!T.guard){ T.parry=PARRY_MS; T.guardT=0; } T.guard=g; K.guarding=g;
    if(g){ T.parry-=dt*1000; T.guardT+=dt*1000; if(T.guardT>=YIELD_MS){ UI.toast('🏳️ You lower your blade and yield the field.',2000); finish(false,true); return; } }
    if(inp.pressed.A&&!g) strike();
    ['swing','pound','inv'].forEach(k=>{ if(T[k]>0) T[k]-=f; }); if(T.comboT>0) T.comboT-=f; else T.combo=0;
    // moving: locked on he closes and circles; in the melee ◀▶ turn and ▲ goes forward
    const alive=T.foes.filter(fo=>fo.alive), tgt=alive.reduce((b,fo)=>!b||Math.hypot(fo.x-T.px,fo.z-T.pz)<Math.hypot(b.x-T.px,b.z-T.pz)?fo:b,null);
    let moving=false;
    if(locked()&&tgt){ T.heading=Math.atan2(tgt.z-T.pz,tgt.x-T.px); const fx=Math.cos(T.heading), fz=Math.sin(T.heading), d=Math.hypot(tgt.x-T.px,tgt.z-T.pz);
      let mv=-inp.y, ms=inp.x; if(mv>0&&d<0.9) mv=0; if(Math.abs(mv)>0.1||Math.abs(ms)>0.1){ const n=Math.hypot(mv,ms), sp=3.0*dt; T.px+=(fx*mv+(-fz)*ms)/n*sp*Math.min(1,n); T.pz+=(fz*mv+fx*ms)/n*sp*Math.min(1,n); moving=true; } }
    else { T.heading+=inp.x*0.045*f; const mv=(-inp.y>0.1?1:0)-(inp.y>0.1?0.7:0); if(mv){ T.px+=Math.cos(T.heading)*mv*3.2*dt; T.pz+=Math.sin(T.heading)*mv*3.2*dt; moving=true; } }
    const clampIn=o=>{ const d=Math.hypot(o.x,o.z); if(d>RA-0.4){ o.x*= (RA-0.4)/d; o.z*=(RA-0.4)/d; } }; { const o={x:T.px,z:T.pz}; clampIn(o); T.px=o.x; T.pz=o.z; }
    K.position.set(T.px,0,T.pz); K.rotation.y=Math.PI/2-T.heading; K.animate(dt,moving?'walk':'idle',0.8);
    const php0=T.php, wasParry=T.guard&&T.parry>0;
    // the challengers: circle, wind up where you can see it, then lunge
    T.foes.forEach(fo=>{ const m=fo.m; if(!fo.alive){ if(m.visible){ m.rotation.x=Math.min(1.4,(m.rotation.x||0)+dt*3); m.position.y-=dt*0.2; if(m.rotation.x>=1.4) m.visible=false; } return; }
      if(fo.hurt>0) fo.hurt-=f; if(fo.cd>0) fo.cd-=f; if(fo.stagger>0) fo.stagger-=f; if(fo.recover>0) fo.recover-=f;
      if(fo.knock>0){ fo.knock-=f; fo.x+=fo.kx*f; fo.z+=fo.kz*f; fo.kx*=Math.pow(0.78,f); fo.kz*=Math.pow(0.78,f); }
      else { fo.ai=(fo.ai+f)%160; fo.wind=(fo.ai>=100&&fo.ai<122)?1:0; fo.lunge=fo.ai>=122?1:0;
        const vx=T.px-fo.x, vz=T.pz-fo.z, d=Math.hypot(vx,vz)||1, sp=fo.spd*PX;
        if(fo.wind){} else if(fo.ai<100){ const tg=Math.atan2(vz,vx)+Math.PI/2; fo.x+=(Math.cos(tg)*sp*0.7+vx/d*0.25*PX)*f; fo.z+=(Math.sin(tg)*sp*0.7+vz/d*0.25*PX)*f; }
        else if(d>0.55){ fo.x+=vx/d*sp*2.1*f; fo.z+=vz/d*sp*2.1*f; }
        if(d<CONTACT+0.25&&fo.cd<=0&&T.inv<=0&&fo.lunge){ let dmg=fo.dmg*2;
          if(T.guard&&T.parry>0){ dmg=0; fo.cd=70; T.inv=30; fo.kx=-vx/d*9*PX; fo.kz=-vz/d*9*PX; fo.knock=10; fo.wind=fo.lunge=0; fo.ai=0; fo.stagger=50; call('PARRIED! STRIKE NOW','#fff2c8'); }
          else if(T.guard) dmg=Math.max(1,Math.round(dmg*GUARD_CUT));
          if(dmg>0) T.php-=dmg; fo.cd=Math.max(fo.cd,50); T.inv=Math.max(T.inv,40); } }
      if(fo._l&&!fo.lunge) fo.recover=24; fo._l=!!fo.lunge;
      if(fo.wind&&!fo._told){ fo._told=1; if(locked()) call('HE WINDS UP — HOLD GUARD!','#fff2c8'); } if(!fo.wind) fo._told=0;
      clampIn(fo); fo.face=Math.atan2(T.px-fo.x,T.pz-fo.z); m.position.set(fo.x,0,fo.z); m.rotation.y=fo.face;
      m.raise=fo.wind?1:0; if(fo.lunge&&!fo._sw){ m.swing(); fo._sw=1; } if(!fo.lunge) fo._sw=0; m.guarding=!isOpen(fo)&&!fo.lunge;
      m.rotation.x=fo.hurt>0?-0.25:0; m.animate(dt,fo.ai<100&&!fo.knock?'walk':'idle',0.7); });
    if(T.php<php0){ if(!T.guard&&T.swing>0){ T.php-=Math.round((php0-T.php)*0.5); call('COUNTER-HIT!','#e0563a'); } else if(!wasParry||T.inv<29) call(T.guard?'BLOCKED':'HIT!',T.guard?'#cfe0ff':'#e0563a'); }
    if(T.php<=0){ T.php=0; finish(false); return; }
    if(T.foes.every(fo=>!fo.alive)){
      if(T.mode==='waves'&&T.round<3){ T.round++; makeFoes(); call('WAVE '+T.round+'!'); }
      else if(T.mode==='ladder'&&T.round<5) restCard();
      else finish(true); } }
  function restCard(){ T.rest=true; const next=LADDER_FOES[Math.min(T.round,4)];
    UI.sheet({title:'⚔ Bout '+T.round+' won',noClose:true,holdMs:700,html:`<div class="card"><h3>Bout ${T.round} of 5</h3><p>Your wounds are bound — <b>+12%</b> health. Next: <b>${UI.esc(next)}</b>.</p></div><button class="gm-btn" data-act="next">⚔ To arms</button><button class="gm-btn" data-act="yield">Yield and leave</button>`,
      act:a=>{ UI.close(); if(a==='yield'){ finish(false,true); return; } T.rest=false; T.round++; T.php=Math.min(T.pmax,T.php+Math.round(T.pmax*0.12)); T.px=0; T.pz=RA*0.35; makeFoes(); call('BOUT '+T.round+' OF 5'); }}); }
  function finish(win,fled){ if(T.done) return; T.done=true; K.guarding=false; const S=GAME.S, L=S.level; let g=0,xp=0,extra='';
    if(win&&!fled){ if(T.mode==='ladder'){ g=60+12*L; xp=45+9*L; const first=!S.championRobe; S.championRobe=true; if(first){ S.livery='champion'; extra='<p>You are girded with the <b>Champion’s Plate</b>. Change liveries in ☰ Home.</p>'; } }
      else if(T.mode==='waves'){ g=20+6*L; xp=12+3*L; } else if(T.mode==='joust'){ g=14+4*L; xp=30+6*L; } else { g=6+2*L; xp=26+6*L; }
      S.wins[T.mode]=(S.wins[T.mode]||0)+1; S.gold+=g; if(typeof BOUNTY_API!=='undefined'&&BOUNTY_API.cur) BOUNTY_API.cur.onTourney(); }
    const res=win&&!fled?GAME.gainXp(xp):null; GAME.changed(); GAME.save();
    const sub=fled?'You yielded the field.':win?{ladder:'Five bouts, five victories — the Grand Champion falls to your blade!',waves:'The crowd roars!',joust:'Lance true, seat firm — the crowd is on its feet.',duel:'A worthy blade. The heralds sing of you.'}[T.mode]:'Bested in the lists. Rise, and try again.';
    UI.sheet({title:TH.name,noClose:true,holdMs:1200,html:`<div class="card ${win&&!fled?'':'lost'}"><h3>${win&&!fled?(T.mode==='ladder'?'GRAND CHAMPION!':'VICTORY'):fled?'YIELDED':'BESTED'}</h3><p>${sub}</p>${win&&!fled?`<p><b style="color:var(--gold)">+${g} gold</b> · +${xp} XP${res&&res.up?` · <b>LEVEL UP! You are level ${S.level}.</b>`:''}</p>`:''}${extra}</div>
      <button class="gm-btn" data-act="again">Another contest</button><button class="gm-btn" data-act="leave">Leave the lists</button>`,
      act:a=>{ UI.close(); if(a==='again'){ cleanup(); LISTS.openMenu(spec.keep); const r=LISTS.ret; } else { cleanup(); const r=ret||spec.exit; ENGINE.go(r.level,r.spawn); } }}); }
  function cleanup(){ if(T&&T.J) endJoust(); if(T) T.foes.forEach(f=>scene.remove(f.m)); T=null; hud.innerHTML=''; callEl.style.opacity=0; K.raise=0; K.guarding=false; }
  // ── heads-up ──
  function bars(me,meMax,foe,foeMax,foeName){ return `<div class="bars"><div class="bar"><small>YOU</small><div class="meter"><i class="fill" style="left:0;width:${Math.max(0,me/meMax*100)}%;background:#5fd36a"></i></div></div>
    <div class="bar"><small style="text-align:right">${UI.esc(foeName)}</small><div class="meter"><i class="fill" style="right:0;width:${Math.max(0,foe/foeMax*100)}%;background:#e0563a"></i></div></div></div>`; }
  const C3=new THREE.Vector3(), L3=new THREE.Vector3();
  lv.custom={ buttons:[{id:'B',label:'GUARD'},{id:'A',label:'STRIKE',big:true}], knight:false, pet:false,
    onEnter(sp){ ret=LISTS.ret; const mode=sp&&sp.mode||'duel'; hud.hidden=false; start(mode);
      const lab=T.J?['BRACE','STRIKE']:['GUARD','STRIKE']; document.querySelectorAll('#acts .mg').forEach((b,i)=>b.textContent=lab[i]); },
    tick(dt,t,inp){ if(callT>0){ callT-=dt; if(callT<=0) callEl.style.opacity=0; } if(!T||T.done||T.rest) return; const f=dt*60; T.t+=dt;
      sparks.forEach(s=>{ if(s.t>0){ s.t-=dt; s.m.position.addScaledVector(s.v,dt); s.v.y-=9*dt; if(s.t<=0) s.m.visible=false; } });
      if(T.pound>0){ pound.scale.setScalar(0.3+(26-T.pound)/26*2.3); pound.material.opacity=T.pound/26; } else pound.visible=false;
      if(T.J){ joustTick(f,inp); if(!T||!T.J) return; const J=T.J, z=joustZ(), gal=J.phase==='done'?0:1;
        meHorse.position.set(LANE+1.1,0,z.me); meHorse.rotation.y=Math.PI; meHorse.userData.gallop(t,gal,0); K.animate(dt,'idle'); K.guarding=J.braced;
        foeHorse.position.set(LANE-1.1,0,z.foe); foeHorse.rotation.y=0; foeHorse.userData.gallop(t+1,gal,0); foeRider.animate(dt,'idle');
        const sh=jShield(J), base=new THREE.Vector3(LANE-0.8,2.0,z.foe+0.4); shieldMark.position.set(base.x+sh[0]*0.6,base.y-sh[1]*0.6,base.z); ring.position.set(base.x+J.aimX*0.6,base.y-J.aimY*0.6,base.z+0.05);
        ring.visible=shieldMark.visible=J.phase==='charge'&&J.gap<300; ring.material=glow(J.struck?0xa89878:0xfff2c8);
        lanceMe.rotation.y=0.12-J.aimX*0.05; lanceMe.rotation.x=Math.PI/2+J.aimY*0.08;
        const op=Math.max(0.35,Math.min(1,(JOUST_GAP-J.gap)/120)), toX=g=>(1-Math.max(0,Math.min(JOUST_GAP,g))/JOUST_GAP)*100;
        hud.innerHTML=bars(J.me,100,J.foe,100,J.name.toUpperCase()+' · PASS '+J.pass+'/'+J.passes)
          +`<small>THE JOUST${T.mode==='ladder'?' · BOUT 1/5':''}${J.braced?' · BRACED':''}</small>`
          +(J.phase==='charge'?`<div class="meter" style="margin-top:6px;opacity:${op}"><i style="left:${toX(SWEET[1])}%;width:${toX(SWEET[0])-toX(SWEET[1])}%;background:#2f7a3a"></i><i style="left:${toX(PERFECT[1])}%;width:${toX(PERFECT[0])-toX(PERFECT[1])}%;background:#bff5c4"></i><i style="left:calc(${toX(J.gap)}% - 2px);width:4px;background:${J.struck?'#a89878':'#f2c14e'}"></i></div><small>${J.struck?'STRUCK':'STRIKE AS YOU MEET'}</small>`:'');
        return; }
      footTick(f,dt,inp); if(!T||T.done) return;
      const tgt=T.foes.find(fo=>fo.alive)||T.foes[0];
      hud.innerHTML=bars(T.php,T.pmax,tgt?Math.max(0,tgt.hp):0,tgt?tgt.maxHp:1,(tgt&&tgt.title||'').toUpperCase())
        +`<small>${UI.esc(TH.name)} · ${T.mode==='ladder'?'BOUT '+T.round+'/5':T.mode==='waves'?'WAVE '+T.round+'/3 · '+T.foes.filter(f=>f.alive).length+' left':'SINGLE DUEL'}${T.guard?' · GUARD'+(T.guardT>1200?' — HOLD TO YIELD':''):''}</small>`; },
    camera(cam,dt){ if(!T){ cam.position.set(0,10,14); cam.lookAt(0,0,0); return; }
      if(T.J){ const z=joustZ(); C3.set(LANE+2.4,3.4,z.me+6.5); L3.set(LANE-0.6,1.6,z.me-9); cam.position.lerp(C3,Math.min(1,dt*6)); cam.lookAt(L3); return; }
      const hx=Math.cos(T.heading), hz=Math.sin(T.heading), lk=locked(), side=lk?2.1:1.2, back=lk?4.8:4.6; C3.set(T.px-hx*back-hz*side,lk?3.3:2.9,T.pz-hz*back+hx*side); cam.position.lerp(C3,Math.min(1,dt*(lk?6:4)));
      const tg=lk&&T.foes.find(f=>f.alive); if(tg) L3.set((T.px+tg.x)/2,1.1,(T.pz+tg.z)/2); else L3.set(T.px+hx*2.5,1.1,T.pz+hz*2.5); cam.lookAt(L3); },
    pet:false };
  lv.spawn={x:0,z:3}; lv.ground=()=>0; lv.onLeave=()=>cleanup();
  return lv; }
