// ════════════════════════════════════════════════════════════════
//  THE GRAND PET TOURNAMENT — Stormgate's lower-town market (KLK: openPetTourney).
//  Turn-based, three rounds of rising purses (50 · 120 · 300). Your companion's numbers are
//  petBStats() — level, form, Bond points and its collar and charm — and its moves are petBMoves():
//  Pounce ×1.0, Fierce Strike ×1.5 (form 1+), Nuzzle (heal 14–28, with Loyal Heart), Holy Charge ×2.0
//  (final form or Guardian Beast). Forfeit any time and keep what you've won. The knight never takes a scratch.
// ════════════════════════════════════════════════════════════════
const PETT=(function(){ return { open(){ const S=GAME.S; if(!S.pet){ ENGINE.speak('Marshal',['🐾 The marshal shakes his head — you need a companion to enter!']); return; } ENGINE.go('petring'); } }; })();
function petTourneyLevel(spec){
  const FOES=[{owner:'Squire Tobin',pet:'Rascal',emoji:'🐈',kind:'cat',lv:-2,purse:50},{owner:'Dame Mira',pet:'Asher',emoji:'🦊',kind:'fox',lv:0,purse:120},{owner:'Captain Bran',pet:'Goliath',emoji:'🦁',kind:'lion',lv:2,purse:300}];
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9cc4e4); scene.fog=new THREE.Fog(0x9cc4e4,25,60);
  const lv={id:spec.id,name:'The Grand Pet Tournament',scene,anim:[],folk:[],spots:[],cam:{pitch:0.4,dist:6},zone:()=>''};
  scene.add(new THREE.HemisphereLight(0xfff4e0,0x6a5a40,0.75)); const sun=new THREE.DirectionalLight(0xfff0d8,0.8); sun.position.set(-8,16,10); sun.castShadow=true; scene.add(sun);
  // a sanded ring in the market square: rope on posts, stalls and townsfolk round about
  { const A=group(0,0,0,scene); const cob=new THREE.Mesh(new THREE.PlaneGeometry(60,60),lam(0xb3ada2)); cob.rotation.x=-Math.PI/2; A.add(cob);
    const sand=new THREE.Mesh(new THREE.CircleGeometry(3.4,32),lam(0xd8c08a)); sand.rotation.x=-Math.PI/2; sand.position.y=0.01; A.add(sand);
    for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; Cy(0.06,0.07,0.9,6,0x6b4a2e,Math.cos(a)*3.6,0,Math.sin(a)*3.6,A); const a2=(i+1)/16*Math.PI*2;
      const r=B(0.04,0.04,2*3.6*Math.sin(Math.PI/16),i%2?0x2f4a8f:0xe8c766,0,0,0,group((Math.cos(a)+Math.cos(a2))*1.8,0.8,(Math.sin(a)+Math.sin(a2))*1.8,A)); r.parent.rotation.y=-(a+a2)/2; }
    [[-7,-4],[7,-4],[-8,3],[8,3]].forEach(([x,z],i)=>{ const g=group(x,0,z,A); B(2.4,0.9,1.2,0x9a6b3f,0,0,0,g); [-1,1].forEach(s=>Cy(0.05,0.05,2.2,6,0x6b4a2e,s*1.1,0,0.5,g)); B(2.6,0.08,1.6,i%2?0xb8402e:0xf3ead6,0,2.2,0.2,g).rotation.x=0.2; });
    ['peasant','peasantF','merchantD','soldier','guest','peasant','patronA','peasantF'].forEach((look,i)=>{ const a=-Math.PI*0.95+i/7*Math.PI*0.9, p=person(look); p.position.set(Math.cos(a)*5,0,Math.sin(a)*5); p.rotation.y=Math.atan2(-p.position.x,-p.position.z); A.add(p);
      const k=i*1.3; lv.anim.push(t=>{ p.position.y=Math.max(0,Math.sin(t*4+k))*0.12; }); });
    const banner=group(0,0,-6,A); B(6,1.4,0.1,0x2f4a8f,0,2.6,0,banner); B(6.1,0.12,0.12,0xe8c766,0,4.0,0,banner); [-3,3].forEach(x=>Cy(0.08,0.08,4.2,6,0x5a3c20,x,0,0,banner)); shade(A); }
  let B_=null, mine=null, foe=null, anim={me:0,foe:0,shake:0,fshake:0,heal:0};
  const E=UI.esc, MY={x:-0.95,z:0.5}, TH={x:0.95,z:-0.5};
  function stats(){ const S=GAME.S, f=S.pet.form, L=S.level; let bonus=0; for(const b in SYS.PET_TREE) for(const n of SYS.PET_TREE[b].nodes) if(S.skills[n.id]&&b===S.pet.id) bonus+=n.cost*1.5;   /* V185: the tourney counts what you've put into this companion's tree */
    let atk=6+L*1.5+f*4+bonus*0.8, def=2+L*0.5+f*2+bonus*0.3, maxHp=30+L*4+f*12+bonus, crit=0.04+f*0.02; const eq=S.pet.equip||{};
    for(const slot of ['collar','charm']){ const g=eq[slot]&&SYS.PET_GEAR[eq[slot]]; if(g&&g.bonus){ atk+=g.bonus.atk||0; def+=g.bonus.def||0; maxHp+=g.bonus.maxHp||0; crit+=g.bonus.crit||0; } }
    return {atk:Math.round(atk),def:Math.round(def),maxHp:Math.round(maxHp),crit}; }
  function moves(){ const S=GAME.S, f=S.pet.form, mv=[{name:'Pounce',icon:'🐾',mult:1.0}]; if(f>=1) mv.push({name:'Fierce Strike',icon:'⚡',mult:1.5});
    if(S.skills.bond1) mv.push({name:'Nuzzle',icon:'💚',heal:true}); if(f>=2||S.skills.devotion2) mv.push({name:'Holy Charge',icon:'✨',mult:2.0}); return mv; }
  function round(){ const fo=FOES[B_.round], L=Math.max(1,GAME.S.level+fo.lv), s=stats(), fhp=Math.round(26+L*3.6+B_.round*8);
    B_.my=Object.assign({},s,{hp:s.maxHp}); B_.foe={name:fo.pet,owner:fo.owner,emoji:fo.emoji,purse:fo.purse,atk:Math.round(5+L*1.3+B_.round*2),def:Math.round(1+L*0.45),maxHp:fhp,hp:fhp};
    B_.done=false; B_.won=false; B_.log=[`🏟 Round ${B_.round+1}: ${fo.owner} sends out ${fo.pet} ${fo.emoji}!`];
    if(foe) scene.remove(foe); foe=petModel(fo.kind,fo.kind==='lion'?2:0,''); foe.position.set(TH.x,0,TH.z); foe.rotation.y=Math.atan2(MY.x-TH.x,MY.z-TH.z); scene.add(foe); draw(); }
  const log=s=>{ B_.log.push(s); B_.log=B_.log.slice(-8); };
  function move(i){ if(!B_||B_.done) return; const S=GAME.S, f=SYS.PETS[S.pet.id].forms[S.pet.form], mv=moves()[i]; if(!mv) return;
    if(mv.heal){ const h=14+Math.floor(Math.random()*15); B_.my.hp=Math.min(B_.my.maxHp,B_.my.hp+h); anim.heal=0.8; log(`💚 ${f.name} nuzzles close — +${h} HP!`); }
    else { const crit=Math.random()<(B_.my.crit||0.04); let dmg=Math.max(1,Math.floor(B_.my.atk*mv.mult)+(Math.floor(Math.random()*9)-3)-B_.foe.def); if(crit) dmg=Math.floor(dmg*1.5);
      B_.foe.hp=Math.max(0,B_.foe.hp-dmg); anim.me=0.5; anim.fshake=0.4; log(`${mv.icon} ${f.name} uses ${mv.name} — ${crit?'CRITICAL! ':''}${dmg} dmg!`); }
    if(B_.foe.hp<=0){ B_.done=true; B_.won=true; S.gold+=B_.foe.purse; B_.paid+=B_.foe.purse; GAME.changed(); log(`🏆 ${B_.foe.name} is defeated! +${B_.foe.purse}g`); draw(); return; }
    setTimeout(()=>{ if(!B_) return; const e=Math.max(1,B_.foe.atk-B_.my.def+(Math.floor(Math.random()*11)-4)); B_.my.hp=Math.max(0,B_.my.hp-e); anim.foe=0.5; anim.shake=0.4;
      const jeers=['strikes back','lunges fiercely','snaps and claws','pounces in fury']; log(`😼 ${B_.foe.name} ${jeers[B_.log.length%jeers.length]} — ${e} dmg!`);
      if(B_.my.hp<=0){ B_.done=true; B_.won=false; log(`💫 ${f.name} is exhausted...`); } draw(); },ENGINE.calm?0:550); draw(true); }
  function bar(hp,max,col){ return `<div class="meter" style="height:9px"><i class="fill" style="left:0;width:${Math.max(0,hp/max*100)}%;background:${col}"></i></div>`; }
  function draw(waiting){ const S=GAME.S, f=SYS.PETS[S.pet.id].forms[S.pet.form], last=B_.won&&B_.round===FOES.length-1;
    let h=`<div class="pbt"><span class="em">${B_.foe.emoji}</span><div class="hp"><small>${E(B_.foe.name)} <span class="ds">(${E(B_.foe.owner)}) · purse ${B_.foe.purse}g</span></small>${bar(B_.foe.hp,B_.foe.maxHp,'#e0563a')}<small class="ds">${B_.foe.hp} / ${B_.foe.maxHp}</small></div></div>`
      +`<div class="pbt"><span class="em">${f.emoji}${S.pet.ribbon||''}</span><div class="hp"><small>${E(f.name)} <span class="ds">atk ${B_.my.atk} · def ${B_.my.def}</span></small>${bar(B_.my.hp,B_.my.maxHp,'#5fd36a')}<small class="ds">${B_.my.hp} / ${B_.my.maxHp}</small></div></div>`
      +`<div class="log">${B_.log.map(E).join('<br>')}</div>`;
    if(!B_.done){ h+='<div class="gm-sec">Moves</div>'+moves().map((m,i)=>`<button class="gm-item ${waiting?'locked':''}" data-act="${waiting?'':'m:'+i}"><span>${m.icon} ${m.name} <span class="ds">${m.heal?'restore 14–28 HP':'×'+m.mult+' power'}</span></span></button>`).join('')+'<p class="gm-hint">✕ forfeits — you keep the gold already won.</p>'; }
    else h+=`<button class="gm-btn" data-act="go">${B_.won?(last?'👑 Claim the championship!':'➡ Next round'):'Leave the ring'}</button>`;
    UI.sheet({title:`🏟 Pet Tournament — Round ${B_.round+1}/${FOES.length}`,html:h,keepScroll:true,short:true,act:a=>{ if(a==='go') advance(); else if(a.startsWith('m:')) move(+a.slice(2)); },close:()=>{ if(B_) leave(false); }});
    const lg=document.querySelector('#sheetBody .log'); if(lg) lg.scrollTop=lg.scrollHeight; }
  function advance(){ if(B_.won&&B_.round<FOES.length-1){ B_.round++; round(); return; } leave(B_.won&&B_.round===FOES.length-1); }
  function leave(champion){ const paid=B_?B_.paid:0, S=GAME.S; B_=null; UI.close(); if(champion) S.wins.petChampion=true; GAME.changed(); GAME.save();
    UI.toast(champion?`👑 TOURNAMENT CHAMPION! ${paid} gold in winnings!`:paid>0?`🐾 Out of the running — but ${paid}g won still shines.`:'🐾 Your companion will grow stronger. Return anytime!',3000);
    ENGINE.go(spec.exit.level,spec.exit.spawn); }
  lv.custom={ buttons:[], noStick:true, knight:false, pet:false,
    onEnter(){ const S=GAME.S; if(!S.pet){ setTimeout(()=>{ ENGINE.go(spec.exit.level,spec.exit.spawn); setTimeout(()=>ENGINE.speak('Marshal',['🐾 The marshal shakes his head — you need a companion to enter!']),700); },50); return; } if(mine) scene.remove(mine); mine=petModel(S.pet.id,S.pet.form,S.pet.ribbon); mine.position.set(MY.x,0,MY.z); mine.rotation.y=Math.atan2(TH.x-MY.x,TH.z-MY.z); scene.add(mine);
      B_={round:0,log:[],done:false,won:false,paid:0}; round(); },
    tick(dt,t){ const lunge=(m,home,to,k)=>{ const p=k>0?Math.sin((0.5-k)/0.5*Math.PI)*0.9:0; m.position.x=home.x+(to.x-home.x)*p*0.5; m.position.z=home.z+(to.z-home.z)*p*0.5; };
      if(mine){ anim.me=Math.max(0,anim.me-dt); anim.shake=Math.max(0,anim.shake-dt); lunge(mine,MY,TH,anim.me); if(anim.shake>0) mine.position.x+=Math.sin(t*60)*0.06; mine.userData.animate(t,anim.me>0); mine.scale.setScalar(1+(anim.heal>0?Math.sin(anim.heal*12)*0.05:0)); anim.heal=Math.max(0,anim.heal-dt); }
      if(foe){ anim.foe=Math.max(0,anim.foe-dt); anim.fshake=Math.max(0,anim.fshake-dt); lunge(foe,TH,MY,anim.foe); if(anim.fshake>0) foe.position.x+=Math.sin(t*60)*0.06; foe.userData.animate(t,anim.foe>0);
        if(B_&&B_.done&&B_.won) foe.rotation.z=Math.min(1.4,foe.rotation.z+dt*3); else foe.rotation.z=0; } },
    camera(cam){ cam.position.set(0.6,3.0,6.2); cam.lookAt(0,-0.9,-0.3); } };
  lv.spawn={x:0,z:0}; lv.ground=()=>0;
  return lv; }
