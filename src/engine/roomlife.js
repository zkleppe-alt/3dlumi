// ════════════════════════════════════════════════════════════════
//  ROOM LIFE — what makes a house a home, in every interior built by rooms.js (homes, keeps, inns, shops, the forge…):
//  things to do — sit in any chair or settle, warm your hands at the hearth, browse the shelves (a proverb), look out of the
//  window (the hour and the sky), water the plants, check the clock, strike the anvil, listen to the bard, sleep in your own
//  bed (and the inn's, through the keeper), and in your own home search the larder and the chests; everywhere else you may
//  look, but what is in your neighbour's barrel is your neighbour's. And the air of the place: the fire crackling as you come
//  near it, dust turning in the window light, flowers on the tables, pictures and samplers on the walls, herbs drying over the
//  hearth, and now and then a cat asleep in front of the fire.
//  ROOMLIFE(lv, spec, items) — items: [{k, x, z, face, w, h}] in tile units (rooms.js gathers them).
// ════════════════════════════════════════════════════════════════
const AMBI=(function(){   // a little sound, made in the browser: the hearth's crackle (its loudness by how near you are), an anvil's ring
  let C=null, fire=null;
  const ctx=()=>{ try{ C=C||new (window.AudioContext||window.webkitAudioContext)(); if(C.state==='suspended') C.resume(); }catch(e){ C=null; } return C; };
  function fireOn(){ const A=ctx(); if(!A||fire) return; const n=A.sampleRate*4, buf=A.createBuffer(1,n,A.sampleRate), d=buf.getChannelData(0); let lp=0;
    for(let i=0;i<n;i++){ lp=lp*0.985+(Math.random()*2-1)*0.015; d[i]=lp*1.6; if(Math.random()<0.0009){ const L=40+Math.random()*260, a=0.25+Math.random()*0.5; for(let j=0;j<L&&i+j<n;j++) d[i+j]+=(Math.random()*2-1)*a*Math.exp(-j/(L*0.25)); } }
    const s=A.createBufferSource(); s.buffer=buf; s.loop=true; const f=A.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2600; const g=A.createGain(); g.gain.value=0; s.connect(f); f.connect(g); g.connect(A.destination); s.start(); fire={s,g}; }
  return { fire(level){ if(level<=0.001){ if(fire){ const f=fire; fire=null; try{ f.g.gain.linearRampToValueAtTime(0,C.currentTime+0.5); setTimeout(()=>{ try{ f.s.stop(); }catch(e){} },600); }catch(e){} } return; }
      fireOn(); if(fire&&C) fire.g.gain.setTargetAtTime(level,C.currentTime,0.25); },
    drum(){ const A=ctx(); if(!A) return; [0,0.22].forEach((d,i)=>{ const t=A.currentTime+d, o=A.createOscillator(), g=A.createGain(); o.frequency.setValueAtTime(140-i*20,t); o.frequency.exponentialRampToValueAtTime(55,t+0.25); g.gain.setValueAtTime(0.5,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.35); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t+0.4); }); },
    clang(){ const A=ctx(); if(!A) return; const t=A.currentTime, g=A.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.35,t+0.005); g.gain.exponentialRampToValueAtTime(0.0001,t+1.2); g.connect(A.destination);
      [880,1320,2210,3170].forEach((fq,i)=>{ const o=A.createOscillator(); o.type='sine'; o.frequency.value=fq*(1+Math.random()*0.01); const og=A.createGain(); og.gain.value=[0.6,0.35,0.2,0.12][i]; o.connect(og); og.connect(g); o.start(t); o.stop(t+1.3); }); } };
})();

const ROOMLIFE=(function(){
  const S=()=>GAME.S, day=()=>S().day||1, dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
  const PROVERBS=['“Trust in the LORD with all thine heart; and lean not unto thine own understanding.” — Proverbs 3:5','“A soft answer turneth away wrath: but grievous words stir up anger.” — Proverbs 15:1',
    '“Better is a little with the fear of the LORD than great treasure and trouble therewith.” — Proverbs 15:16','“Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.” — Proverbs 27:17',
    '“The name of the LORD is a strong tower: the righteous runneth into it, and is safe.” — Proverbs 18:10','“A merry heart doeth good like a medicine.” — Proverbs 17:22',
    '“Commit thy works unto the LORD, and thy thoughts shall be established.” — Proverbs 16:3','“Through wisdom is an house builded; and by understanding it is established.” — Proverbs 24:3',
    '“A friend loveth at all times, and a brother is born for adversity.” — Proverbs 17:17','“The path of the just is as the shining light, that shineth more and more unto the perfect day.” — Proverbs 4:18'];
  const BOOKS=['An almanac of planting days, its margins full of someone’s notes.','A book of hours, its gold leaf worn thin by fingers.','A ledger of who owes whom — mostly crossed out, forgiven.','A child’s primer, letters traced over and over.','A herbal: comfrey for bruises, sage for the throat.','The Psalms, open at the twenty-third, the page soft with use.'];
  const HYMNS=[['Amazing grace! How sweet the sound','That saved a wretch like me!'],['Holy, holy, holy! Lord God Almighty!','Early in the morning our song shall rise to Thee.'],['A mighty fortress is our God,','A bulwark never failing.'],['Be Thou my vision, O Lord of my heart;','Naught be all else to me, save that Thou art.']];
  const LOOKS={barrel:['Apples, packed in straw.','Salted fish, by the smell of it.','Rainwater, kept for the washing.','Flour, and a scoop.'],crate:['Turnips and onions.','Candles, tallow, wrapped in cloth.','Old tools, oiled against rust.'],cabinet:['Plates, stacked neatly; a cracked one at the back.','Jars of preserves, labelled in a careful hand.'],dresser:['Folded linen that smells of lavender.','Mended shirts, and a needle still in one.'],chest:['Locked, and not yours to open.']};
  const STAY=['You sit a while.','You rest your legs a moment.','You sit, and the house goes on around you.'];
  function sky(){ const st=typeof DAYNIGHT!=='undefined'?DAYNIGHT.state():{night:0,dusk:0,dawn:0}, f=((S().dayFrac%1)+1)%1;
    if(st.night>0.5) return ['🌙 Stars over the rooftops, and a lamp or two still lit across the way.','🌙 The town is asleep. Somewhere a dog barks once, and stops.'][Math.floor(f*97)%2];
    if(st.dusk>0.3) return '🌇 The sun going down in gold and rose; the swallows are out.';
    if(st.dawn>0.3) return '🌅 First light on the roofs. A rooster, then another.';
    return f<0.5?'☀️ A bright morning. People about their business in the street.':'☀️ The afternoon light lies long across the street.'; }
  const clockTxt=()=>{ const f=((S().dayFrac%1)+1)%1, h=Math.floor(f*24), m=Math.floor((f*24-h)*60); return `${((h+11)%12)+1}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`; };
  // the canvas pictures on the walls: a landscape, the sea, a sampler
  const PIC={}; function picMat(kind,pal){ const key=kind; if(PIC[key]) return PIC[key]; const c=document.createElement('canvas'); c.width=96; c.height=72; const x=c.getContext('2d');
    if(kind==='sampler'){ x.fillStyle='#efe6d0'; x.fillRect(0,0,96,72); x.strokeStyle='#9a3a4a'; x.lineWidth=3; x.strokeRect(5,5,86,62); x.fillStyle='#2f4a8f'; x.font='bold 13px serif'; x.textAlign='center'; x.fillText('Bless',48,30); x.fillText('this House',48,48);
      x.fillStyle='#3f8a4e'; for(let i=0;i<6;i++){ x.beginPath(); x.arc(14+i*13.6,60,3,0,7); x.fill(); } }
    else if(kind==='sea'){ const g=x.createLinearGradient(0,0,0,72); g.addColorStop(0,'#9ac4e4'); g.addColorStop(0.5,'#e8d8b8'); g.addColorStop(0.52,'#3a6a8a'); g.addColorStop(1,'#1e3a5a'); x.fillStyle=g; x.fillRect(0,0,96,72);
      x.fillStyle='#f4eee0'; x.beginPath(); x.moveTo(40,34); x.lineTo(50,14); x.lineTo(52,34); x.fill(); x.fillStyle='#5a3a22'; x.fillRect(36,34,22,4); }
    else { const g=x.createLinearGradient(0,0,0,72); g.addColorStop(0,'#f0c890'); g.addColorStop(0.55,'#b8d0e8'); x.fillStyle=g; x.fillRect(0,0,96,72); x.fillStyle='#5a7a4a'; x.beginPath(); x.moveTo(0,50); x.quadraticCurveTo(30,30,60,46); x.quadraticCurveTo(80,36,96,44); x.lineTo(96,72); x.lineTo(0,72); x.fill();
      x.fillStyle='#3f6a3a'; x.beginPath(); x.moveTo(0,62); x.quadraticCurveTo(48,48,96,60); x.lineTo(96,72); x.lineTo(0,72); x.fill(); x.fillStyle='#e8dcc0'; x.fillRect(62,40,8,7); x.fillStyle='#9a3a3a'; x.beginPath(); x.moveTo(60,40); x.lineTo(66,35); x.lineTo(72,40); x.fill(); }
    return PIC[key]=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}); }

  function make(lv,spec,items){ const room=lv.room, an=lv.anim, pal=lv.pal, G=lv.G, W=lv.W, H=lv.H, id=lv.id, home=/^in:home_house:/.test(id)||!!spec.ownHome, inn=spec.theme==='inn', theme=spec.theme||'home';
    const life=group(0,0,0,room); life.userData.keepScale=true; const K=PROP_IN;
    const at=(x,y)=>G[y]&&G[y][x], floorT=t=>t===12||t===13||t===53||t===undefined;
    const spot=(x,z,label,who,action,r)=>lv.spots.push({x,z,r:r||1.05,label,who,action});
    const stateKey=(x,z)=>id+':'+Math.floor(x)+','+Math.floor(z);
    const sit=(x,z,face,secs,msg)=>{ if(ENGINE.holding) return; const P=ENGINE.P, back={x:P.x,z:P.z}; P.x=x; P.z=z; P.face=face; ENGINE.hold(secs,'sit'); let el=0;
      const tick=(t,dt)=>{ el+=dt||0.016; P.x=x; P.z=z; P.face=face; if(el>=secs){ an.splice(an.indexOf(tick),1); P.x=back.x; P.z=back.z; } }; an.push(tick); UI.toast(msg||STAY[Math.floor(Math.random()*STAY.length)],1500); };
    const heal=n=>{ const s=S(); s.hp=Math.min(s.maxHp,s.hp+n); ENGINE.hud&&ENGINE.hud(); GAME.changed(); };
    let hearths=[];
    items.forEach(it=>{ const {k,x,z}=it;
      if(k==='chair'||k==='armchair'||k==='booth'||k==='bench') spot(x,z,'Sit',k==='armchair'?'An armchair':k==='booth'?'A booth':'A chair',()=>sit(x,z,it.face||0,4,k==='armchair'?'You sink into the armchair. Your shoulders come down from your ears.':null));
      else if(k==='hearth'){ hearths.push(it); if(home&&/^in:home_house:/.test(id)&&typeof JOURNAL!=='undefined'&&hearths.length===1){ const sx=floorT(at(Math.floor(x+1.1),Math.floor(z+1.0)))?x+1.1:x-1.1; JOURNAL.spot(lv,sx,z+1.0,Math.atan2(x-sx,-1.0),'The Homestead hearth','by the fire at the Homestead',{fire:true}); } spot(x,z+0.9,'Warm','The hearth',()=>{ heal(Math.ceil(S().maxHp*0.05)); UI.toast(['🔥 You hold your hands to the fire. The cold goes out of them.','🔥 The fire snaps and settles. You could stay here all evening.','🔥 You turn a log with the iron; sparks go up the chimney.'][Math.floor(Math.random()*3)],1800); },1.3);
        // herbs drying over the mantel
        for(let i=0;i<3;i++){ const g=group(x-0.4+i*0.4,0,z+0.05,life); B(0.01,0.18,0.01,0x6a5a3a,0,1.72,0,g); Co(0.05,0.24,5,[0x4a6a2a,0x7a6a3a,0x8a5a6a][i],0,1.5,0,g).rotation.x=Math.PI; } }
      else if(k==='shelf'||k==='goods') spot(x,z+0.7,'Browse',k==='goods'?'The shelves':'The bookshelf',()=>{ if(k==='goods'){ UI.toast('🧺 Good things, neatly priced — ask at the counter.',1500); return; } const r=Math.random(); ENGINE.speak('The bookshelf',r<0.55?[BOOKS[Math.floor(Math.random()*BOOKS.length)],PROVERBS[Math.floor(Math.random()*PROVERBS.length)]]:[PROVERBS[Math.floor(Math.random()*PROVERBS.length)]]); });
      else if(k==='window') spot(x,z+0.7,'Look out','The window',()=>UI.toast(sky(),2400));
      else if(k==='clock') spot(x,z+0.7,'Time','The clock',()=>UI.toast(`🕰 Tick, tock. ${clockTxt()} — Day ${day()}.`,1800));
      else if(k==='plant'){ const sk=stateKey(x,z), wat=S().watered=S().watered||{}, g=group(x,0,z,life), fl=[]; for(let i=0;i<3;i++){ const f=Sp(0.05,[0xe85a7a,0xf0c040,0xffffff][i],Math.cos(i*2.1)*0.14,0.62,Math.sin(i*2.1)*0.14,g,6,4); f.visible=wat[sk]===day(); fl.push(f); }
        spot(x,z,'Water','A potted plant',()=>{ if(wat[sk]===day()){ UI.toast('🌱 Already watered today — it looks happy.',1200); return; } wat[sk]=day(); fl.forEach(f=>f.visible=true); GAME.changed(); UI.toast('💧 You give it a drink. By the time you look again, it has flowered.',1800); },0.9); }
      else if(k==='rack'||k==='armour') spot(x,z,'Admire',k==='rack'?'A weapon rack':'An armour stand',()=>UI.toast(k==='rack'?'⚔ Good steel, oiled and kept. Someone here was a soldier once.':'🛡 Old plate, dented at the shoulder — and polished all the same.',1800));
      else if(k==='anvil'||k==='grind') spot(x,z,k==='anvil'?'Strike':'Sharpen',k==='anvil'?'The anvil':'The grindstone',()=>{ AMBI.clang(); sparks(x,0.75,z); if(k==='grind') UI.toast('✨ You put an edge back on your blade. It sings.',1500); });
      else if(k==='bard') spot(x,z,'Listen','The bard',()=>{ const h=HYMNS[Math.floor(Math.random()*HYMNS.length)]; ENGINE.speak('The bard sings',['🎵 '+h[0],'🎵 '+h[1]]); },1.4);
      else if(k==='bed'){ if(home&&spec.homeFloor===1) spot(x,z,'Look',x<4?'Mara’s bed':'Tobiah’s bed',()=>UI.toast(x<4?'🛏 The rose quilt, and under the pillow a wooden sword she thinks no one knows about.':'🛏 The blue quilt, and a row of carved soldiers keeping watch along the headboard.',2200),1.3); else if(home) spot(x,z,'Sleep','Your bed',()=>sleepSheet(),1.3); else if(inn) spot(x,z,'Sleep','A made-up bed',()=>SERVICES.openInn?SERVICES.openInn('Innkeeper'):UI.toast('Ask at the counter downstairs.',1400),1.3); }
      else if(k==='spin') spot(x,z,'Look','Mother’s spinning wheel',()=>UI.toast('🧶 A skein half spun, the wool soft as breath. The wheel still turns a little from her hand.',2200));
      else if(k==='portrait') spot(x,z,'Look','The family portrait',()=>ENGINE.speak('The family portrait',['Mother and Father with the twins in their arms, newborn — and you at three, trying hard not to smile. It was painted the spring before Father rode out.','“As for me and my house, we will serve the LORD.” — Joshua 24:15']));
      else if(k==='horse') spot(x,z,'Rock','The rocking horse',()=>UI.toast('🐴 It creaks back and forth. Father carved it the winter you were five.',2000));
      else if(k==='toys') spot(x,z+0.6,'Look','The toy box',()=>UI.toast('🧸 A rag doll, a ball, a wooden sword — and a carved knight in blue, with a red plume. Like yours.',2200));
      else if(k==='map') spot(x,z,'Look','Mara’s map',()=>UI.toast('🗺 Luminar, drawn by Mara: the farm a little too big, the dragon in the hills entirely made up.',2200));
      else if(k==='drum') spot(x,z,'Play','Tobiah’s drum',()=>{ AMBI.drum&&AMBI.drum(); UI.toast('🥁 Ba-dum, ba-dum — somewhere downstairs, someone laughs.',1600); });
      else if(k==='seat') spot(x,z+0.5,'Sit','The window seat',()=>sit(x,z,it.face||0,4.5,'🌾 From here you can see the fields, and the road you rode out on.'));
      else if(k==='wardrobe') spot(x+0.6,z,'Dress','Your wardrobe',()=>{ if(typeof LIBRARY!=='undefined'&&LIBRARY.wardrobe) LIBRARY.wardrobe(); else UI.toast('Your liveries hang here.',1200); });
      else if(k==='desk') spot(x-0.6,z,'Write','Your writing desk',()=>ENGINE.speak('A letter, begun',['You dip the pen. “Dear Mother — I am well. The road is long, but I am not alone on it.”','You sand it, fold it, and leave it on the desk for the carrier.']));
      else if(LOOKS[k]){ const sk=stateKey(x,z);
        if(home&&k!=='chest') spot(x,z,'Search',{barrel:'A barrel',crate:'A crate',cabinet:'The cupboard',dresser:'The dresser'}[k],()=>{ const got=S().pantry=S().pantry||{}; if(got[sk]===day()){ UI.toast('Nothing more today — there will be more tomorrow.',1300); return; } got[sk]=day();
            const r=Math.random(); if(r<0.5){ heal(Math.ceil(S().maxHp*0.15)); UI.toast(['🍎 An apple, crisp from the barrel. You eat it standing up.','🍞 Bread, wrapped in a cloth. Your mother’s, by the shape.','🧀 A heel of cheese — you finish it off.'][Math.floor(Math.random()*3)],1800); }
            else { const g=3+Math.floor(Math.random()*6); GAME.addGold(g); UI.toast(`🪙 ${g} gold in a twist of cloth — your own savings, forgotten.`,1700); } GAME.changed(); });
        else spot(x,z,'Look',{barrel:'A barrel',crate:'A crate',cabinet:'A cupboard',dresser:'A dresser',chest:'A chest'}[k],()=>UI.toast('👀 '+LOOKS[k][Math.floor((Math.floor(x)*7+Math.floor(z)*3))%LOOKS[k].length]+(k!=='chest'?' Not yours to take.':''),1800)); }
    });
    function sleepSheet(){ const O={dawn:[6/24,'🌅 Dawn','6:00 AM','You rise with the first light.'],morning:[7/24,'☀️ Morning','7:00 AM','You sleep until morning.'],evening:[20.5/24,'🌇 Evening','8:30 PM','You sleep the day away and wake at dusk.']};
      UI.sheet({title:'🛏 Your own bed',html:'<p class="gm-intro">Home. The quilt your mother made, and the window you watched the stars through as a child. Sleep until…</p>'+Object.entries(O).map(([k,o])=>`<button class="gm-item" data-act="${k}"><span>${o[1]} <span class="ds">${o[2]}</span></span></button>`).join('')+'<button class="gm-item" data-act="no"><span>✋ Not yet</span></button>',
        act:k=>{ UI.close(); if(k==='no') return; const o=O[k], s=S(), fade=document.getElementById('fade'); fade.classList.add('on'); setTimeout(()=>{ if(o[0]<=s.dayFrac) s.day=(s.day||1)+1; s.dayFrac=o[0]; s.hp=s.maxHp; GAME.changed(); GAME.save(); fade.classList.remove('on'); UI.toast(o[3]+' Fully rested — saved. “I will both lay me down in peace, and sleep.” (Psalm 4:8)',3200); },1200); }}); }
    function sparks(x,y,z){ for(let i=0;i<10;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.025,0.025),new THREE.MeshBasicMaterial({color:i%2?0xffd060:0xff8a2a})); m.position.set(x,y*K,z); room.add(m);
        const v=[(Math.random()-0.5)*2.4,1.5+Math.random()*1.5,(Math.random()-0.5)*2.4]; let tt=0; const fly=(t,dt)=>{ dt=dt||0.016; tt+=dt; m.position.x+=v[0]*dt; m.position.z+=v[2]*dt; v[1]-=6*dt; m.position.y+=v[1]*dt; if(tt>0.7){ room.remove(m); an.splice(an.indexOf(fly),1); } }; an.push(fly); } }
    // ── the air of the place ──
    // flowers on the tables, now and then
    items.filter(it=>it.k==='table').forEach(it=>{ if(hsh(Math.floor(it.x*3),Math.floor(it.z*5))>0.45) return; const g=group(it.x+0.15,0.68*K,it.z-0.1,life); Cy(0.04,0.05,0.12,8,[0x6a8ab8,0xe8dcc8,0xb86a4a][Math.floor(it.x)%3],0,0,0,g);
      for(let i=0;i<4;i++){ B(0.006,0.14,0.006,0x3f8a4e,Math.cos(i*1.6)*0.02,0.12,Math.sin(i*1.6)*0.02,g); Sp(0.025,[0xe85a7a,0xf0c040,0xffffff,0xb070e0][i],Math.cos(i*1.6)*0.035,0.27,Math.sin(i*1.6)*0.035,g,6,4); } });
    // pictures and samplers on bare stretches of wall (the back wall and the sides), where nothing stands in front
    { const kinds=theme==='keep'?[]:['country','sea','sampler']; let n=0;
      for(let x=2;x<W-2&&kinds.length;x+=3){ if(at(x,0)!==5||!floorT(at(x,1))||!floorT(at(x,2))||n>=3) continue; if(hsh(x,W)>0.6) continue; const g=group(x+0.5,0,1.03,life), kind=kinds[(x+n)%kinds.length];
        B(0.62,0.5,0.04,0x4a3220,0,1.45,0,g); const pic=new THREE.Mesh(new THREE.PlaneGeometry(0.52,0.4),picMat(kind,pal)); pic.position.set(0,1.7,0.025); g.add(pic); n++; } }
    // a cat asleep before the fire, in about half the homes
    if(theme==='home'&&hearths.length&&hsh(W*7+H,id.length)>0.4){ const h=hearths[0], cx=h.x+0.6, cz=h.z+1.3; if(floorT(at(Math.floor(cx),Math.floor(cz)))){ const g=group(cx,0.01,cz,life); g.rotation.y=hsh(W,H)*6;
        const fur=[0xc87a3a,0x3a3a40,0xe8e0d0,0x8a7a6a][Math.floor(hsh(H,W)*4)], body=Sp(0.15,fur,0,0.08,0,g,10,6); body.scale.set(1.3,0.6,1); const head=Sp(0.075,fur,0.15,0.07,0.08,g,8,6);
        [-1,1].forEach(sd=>Co(0.025,0.055,4,dk(fur,0.8),0.15+sd*0.04,0.14,0.08,g)); const tail=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.022,5,12,Math.PI*1.2),mt(dk(fur,0.85))); tail.rotation.x=Math.PI/2; tail.position.y=0.03; g.add(tail);
        an.push(t=>{ body.scale.y=0.6+Math.sin(t*1.8)*0.04; head.position.y=0.07+Math.sin(t*1.8)*0.006; });
        spot(cx,cz,'Pet','A cat, asleep',()=>UI.toast(['🐈 It purrs without opening its eyes.','🐈 It rolls over to show you its belly. It is a trap.','🐈 One ear turns toward you; the purring gets louder.'][Math.floor(Math.random()*3)],1600),0.85); } }
    // dust turning in the light
    { const N=42, pos=new Float32Array(N*3), sd=[]; for(let i=0;i<N;i++){ sd.push([1+Math.random()*(W-2),0.3+Math.random()*1.8,1+Math.random()*(H-2),Math.random()*6.3]); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const m=new THREE.PointsMaterial({color:0xfff0c8,size:0.025,transparent:true,opacity:0.55,depthWrite:false}); const pts=new THREE.Points(geo,m); pts.frustumCulled=false; room.add(pts);
      an.push(t=>{ sd.forEach((s,i)=>{ pos[i*3]=s[0]+Math.sin(t*0.13+s[3])*0.4; pos[i*3+1]=s[1]+Math.sin(t*0.21+s[3]*2)*0.25; pos[i*3+2]=s[2]+Math.cos(t*0.11+s[3])*0.4; }); geo.attributes.position.needsUpdate=true; }); }
    // the fire's voice: louder as you come near the hearth, gone when you leave
    if(hearths.length){ an.push(()=>{ if(ENGINE.level!==lv) return; const P=ENGINE.P; let d=99; hearths.forEach(h=>d=Math.min(d,Math.hypot(P.x-h.x,P.z-h.z-0.5))); AMBI.fire(Math.max(0,Math.min(0.28,0.34-d*0.045))); });
      const ol=lv.onLeave; lv.onLeave=()=>{ AMBI.fire(0); if(ol) ol(); }; }
    if(typeof ROOMSTYLE!=='undefined'&&!home) try{ ROOMSTYLE(lv,spec,items,spot); }catch(e){ console.warn('roomstyle',e); }
  }
  return make;
})();

// ════════════════════════════════════════════════════════════════
//  THE FAMILY FARMHOUSE — in the game its three floors are painted whole (the furniture is in the picture, and walls stand
//  where it does), so here they are furnished for real: the family hall (the inglenook and its crane, Mother's dresser of
//  blue-and-white plates, the long trestle table laid for supper with its benches, Father's chair on the braided rug and the
//  spinning wheel, the pantry cupboard and barrels, herbs and onions drying on the beam, the family portrait between the
//  windows); the children's floor (Mara's room with the rose quilt, Tobiah's with the blue one and his drum, the window seat
//  and the fern on the landing, the runner down the hall); and your own suite (the shelves and lectern, the stone fireplace
//  and two armchairs, the great four-poster between its nightstands, armour, wardrobe, desk, the chest at the bed's foot,
//  and the balcony's planters and table for two).
//  HOMESTEAD.pre(spec) → spec with its grid made furniture; HOMESTEAD.post(lv) → the pieces drawn, and the things to do.
// ════════════════════════════════════════════════════════════════
const HOMESTEAD=(function(){
  const dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
  // the hall and the children's floor laid out anew for 3D (roomier than the painted rooms they come from); the suite as the game has it
  const GRID={
    0:`5 5 45 5 5 51 5 5 5 5 51 5 51 5 5 5
       5 53 53 53 50 12 12 12 12 12 12 47 12 12 10 5
       5 53 53 53 12 41 12 41 12 41 12 12 12 12 12 5
       5 12 12 12 12 62 62 62 62 62 62 12 12 12 12 5
       5 12 41 12 12 12 41 12 12 41 12 12 12 12 12 5
       5 12 12 12 12 12 12 12 12 12 12 12 12 12 12 5
       5 62 12 12 12 12 12 12 12 12 12 12 12 12 48 5
       5 49 12 12 12 12 12 12 12 12 12 12 12 59 48 5
       5 12 12 12 12 12 12 12 12 12 12 12 12 12 12 5
       5 5 5 5 5 5 5 9 9 5 5 5 5 5 5 5`,
    1:`5 5 5 5 51 5 5 5 5 51 5 5 5 5
       5 12 42 12 12 12 42 62 62 12 62 12 11 5
       5 12 43 12 12 12 43 12 12 12 12 12 12 5
       5 12 66 12 12 12 12 12 12 12 12 62 12 5
       5 12 12 12 41 40 41 12 12 12 12 12 12 5
       5 12 12 12 12 12 12 12 12 12 12 12 12 5
       5 12 12 12 12 12 12 12 12 12 12 12 49 5
       5 10 12 12 12 12 12 12 12 12 12 12 12 5
       5 5 5 5 5 5 5 5 5 5 5 5 5 5`};
  const F={
    2:{ set:[[1,1,44],[2,1,44],[4,1,44],[3,2,62],[6,1,62],[7,1,62],[5,2,62],[8,2,62],[9,1,62],[12,1,62],[10,1,62],[11,1,62],[10,2,62],[11,2,62],[10,3,62],[11,3,62],[1,4,56],[1,5,62],[1,6,62],[1,7,49],[12,4,62],[10,4,66],[11,4,62],[3,9,49],[10,9,49],[9,10,40],[8,10,41]] } };
  function pre(spec){ const m=/^in:home_house:(\d)$/.exec(spec.id||''); if(!m) return spec; const n=+m[1];
    if(GRID[n]){ const g=GRID[n].trim().split('\n').map(r=>r.trim().split(/\s+/).map(Number)); return Object.assign({},spec,{grid:g,ownHome:true,homeFloor:n}); }
    const D=F[n]; if(!D) return spec; const g=spec.grid.map(r=>r.slice());
    D.set.forEach(([x,y,t])=>{ if(g[y]&&g[y][x]!==undefined&&g[y][x]!==10&&g[y][x]!==11&&g[y][x]!==9) g[y][x]=t; });
    if(n===2) for(let y=9;y<=10;y++) for(let x=3;x<=10;x++) if(g[y]&&g[y][x]===12) g[y][x]=53;   // the balcony's flags
    return Object.assign({},spec,{grid:g,ownHome:true,homeFloor:n}); }
  function post(lv,spec){ const items=[]; if(spec.homeFloor===undefined) return items; const room=lv.room, pal=lv.pal, an=lv.anim, K=PROP_IN, f=spec.homeFloor, L=group(0,0,0,room); L.userData.keepScale=true;
    const S=(par,k)=>{ par.scale.setScalar(k||K); return par; };
    if(f===0){
      // the beam across the hall with herbs and onions drying
      B(13,0.14,0.16,0x3e2a1a,8.0,2.3,2.0,L); for(let i=0;i<18;i++){ const g=group(1.9+i*0.7,0,2.0,L); B(0.01,0.2,0.01,0x8a7a5a,0,2.1,0,g); i%3===0?Sp(0.06,0xe8dcb0,0,2.04,0,g,7,5):Co(0.05,0.22,5,i%3===1?0x5a8a3a:0x7a9a4a,0,1.9,0,g).rotation.x=Math.PI; }
      // the long trestle table laid for supper, one board the length of the hall
      { const t=PROP.table(L,8.0,3.5,6.0,0.95,pal); t.scale.setScalar(K); const bowls=group(8.0,0.68*K,3.5,L); for(let i=0;i<6;i++){ Cy(0.07,0.05,0.05,8,0xe8e0d0,-2.2+i*0.88,0,(i%2?0.22:-0.22),bowls); Cy(0.055,0.055,0.01,8,i%2?0xc8783a:0x8aa04a,-2.2+i*0.88,0.045,(i%2?0.22:-0.22),bowls); }
        const loaf=Sp(0.12,0xc89a5a,0.3,0.05,0,bowls,8,6); loaf.scale.set(1.5,0.6,0.9); items.push({k:'table',x:8.0,z:3.5}); }
      // the crane and the pot over the fire
      { const g=group(2.5,0,1.4,L); B(0.03,0.6,0.03,0x2a2a30,-0.25,0.45,0,g); B(0.35,0.03,0.03,0x2a2a30,-0.08,1.03,0,g); B(0.01,0.3,0.01,0x2a2a30,0.08,0.73,0,g); const pot=Sp(0.13,0x2a2a30,0.08,0.62,0,g,10,8); pot.scale.y=0.8; }
      // the braided rug before Father's chair
      { const r=new THREE.Mesh(new THREE.CircleGeometry(0.9,28),mt(0x8a4a3a)); r.rotation.x=-Math.PI/2; r.scale.set(1.5,1,1); r.position.set(2.5,0.012,4.9); L.add(r);
        [0.75,0.5,0.25].forEach((rr,i)=>{ const q=new THREE.Mesh(new THREE.RingGeometry(rr-0.05,rr,28),mt(i%2?0x6a3a2a:0xc8904a)); q.rotation.x=-Math.PI/2; q.scale.set(1.5,1,1); q.position.set(2.5,0.016,4.9); L.add(q); }); }
      // Mother's spinning wheel
      { const g=S(group(1.6,0,6.5,L)); g.rotation.y=1.2; const w=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.03,6,20),mt(0x7a5232)); w.position.y=0.7; g.add(w); for(let i=0;i<6;i++){ const sp=B(0.02,0.62,0.02,0x6a4426,0,0.39,0,g); sp.rotation.z=i*Math.PI/6; }
        B(0.7,0.06,0.2,0x6a4426,0.1,0.25,0,g); [-0.2,0.35].forEach(x=>B(0.05,0.3,0.05,0x6a4426,x,0,0,g)); B(0.04,0.7,0.04,0x6a4426,0.35,0.25,0,g); const tuft=Sp(0.08,0xe8e0d0,0.36,0.98,0,g,7,5);
        an.push(t=>{ w.rotation.z=t*0.4; }); items.push({k:'spin',x:1.6,z:6.5}); }
      // the family portrait between the windows (and, once wed, the wedding portrait)
      { const g=group(7.5,0,1.04,L); B(0.7,0.62,0.04,0xc8a040,0,1.45,0,g); const c=document.createElement('canvas'); c.width=64; c.height=56; const x=c.getContext('2d'); x.fillStyle='#6a8aa8'; x.fillRect(0,0,64,56); x.fillStyle='#e8d8b8'; [[12,24],[26,22],[38,24],[50,26]].forEach(([px,py],i)=>{ x.beginPath(); x.arc(px,py,5-(i>1?1:0),0,7); x.fill(); x.fillRect(px-5,py+5,10-(i>1?2:0),20); });
        x.fillStyle='#8a5a2a'; x.fillRect(7,17,10,4); x.fillStyle='#c8c8c8'; x.fillRect(21,15,10,4); const p=new THREE.Mesh(new THREE.PlaneGeometry(0.58,0.5),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)})); p.position.set(0,1.76,0.025); g.add(p); items.push({k:'portrait',x:7.5,z:1.6}); }
    }
    if(f===1){
      // Tobiah's drum, and the toy knight on Mara's chest
      { const g=S(group(7.5,0,1.5,L)); Cy(0.24,0.24,0.34,12,0xc0392e,0,0,0,g); Cy(0.25,0.25,0.03,12,0xf4ecd8,0,0.34,0,g); [0.08,0.26].forEach(y=>Cy(0.245,0.245,0.02,12,0xd8b04a,0,y,0,g)); const st=B(0.02,0.3,0.02,0xa8845a,0.15,0.36,0.1,g); st.rotation.z=0.6; items.push({k:'drum',x:7.5,z:1.5}); }
      { const g=S(group(2.5,0.33*K,3.5,L)); Cy(0.04,0.05,0.12,6,0xb9bfcc,0,0,0,g); Sp(0.045,0xb9bfcc,0,0.16,0,g,6,5); B(0.02,0.06,0.02,0xc0392e,0,0.22,0,g); B(0.01,0.12,0.01,0xd8dce4,0.06,0.04,0.02,g); }
      // a map of Luminar pinned up in Mara's room; the window seat on the landing
      { const g=group(1.5,0,1.03,L); const c=document.createElement('canvas'); c.width=64; c.height=48; const x=c.getContext('2d'); x.fillStyle='#e8dcb0'; x.fillRect(0,0,64,48); x.fillStyle='#7ab06a'; x.fillRect(8,10,20,14); x.fillStyle='#7aa8d0'; x.fillRect(34,6,12,22); x.strokeStyle='#a8643c'; x.beginPath(); x.moveTo(10,38); x.lineTo(54,34); x.stroke(); x.fillStyle='#c0392e'; x.fillRect(44,30,3,3);
        const p=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.45),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)})); p.position.set(0,1.55,0.02); g.add(p); items.push({k:'map',x:1.5,z:1.6}); }
      // a runner down the floor, a rocking horse, and the toy box
      { B(8.2,0.014,0.8,pal.accent,7.0,0.0,5.5,L); B(7.6,0.016,0.55,dk(pal.accent,1.35),7.0,0.0,5.5,L); [5.12,5.88].forEach(z=>B(8.2,0.018,0.05,pal.trim,7.0,0,z,L)); }
      { const g=S(group(11.5,0,3.5,L)); g.rotation.y=-0.5; const rk=group(0,0,0,g); const arc=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.03,5,16,Math.PI*0.5),mt(0x7a5232)); arc.rotation.z=Math.PI*1.25; arc.position.y=0.5; arc.scale.set(1.3,0.4,1);
        [-0.12,0.12].forEach(z=>{ const a2=arc.clone(); a2.position.z=z; rk.add(a2); }); B(0.6,0.22,0.2,0xe8dcc8,0,0.36,0,rk); B(0.14,0.3,0.14,0xe8dcc8,0.3,0.52,0,rk); B(0.24,0.12,0.12,0xe8dcc8,0.4,0.66,0,rk); B(0.1,0.24,0.06,0x6a4426,0.28,0.6,0,rk); B(0.08,0.16,0.04,0x6a4426,-0.32,0.38,0,rk); [-0.2,0.2].forEach(x=>[-0.06,0.06].forEach(z=>B(0.05,0.24,0.05,0xe8dcc8,x,0.12,z,rk))); B(0.3,0.05,0.22,0xc0392e,-0.02,0.48,0,rk);
        an.push(t=>{ rk.rotation.z=Math.sin(t*1.4)*0.06; }); items.push({k:'horse',x:11.5,z:3.5}); }
      { const g=S(group(8.5,0,1.5,L)); B(0.7,0.42,0.45,0x3a6aa8,0,0,0,g); B(0.72,0.06,0.47,0xe8c766,0,0.42,0,g); Sp(0.1,0xc0392e,-0.15,0.5,0,g,8,6); B(0.12,0.14,0.12,0xe8dcc8,0.12,0.48,0.05,g); B(0.02,0.3,0.02,0xa8845a,0.25,0.45,-0.1,g).rotation.z=0.5; items.push({k:'toys',x:8.5,z:1.5}); }
      { const g=group(10.5,0,1.25,L); B(0.9,0.42,0.42,0x6a4426,0,0,0,g); B(0.84,0.1,0.38,0xc8a040,0,0.42,0,g); [-0.25,0.25].forEach(x=>Sp(0.12,0xe8c766,x,0.58,-0.1,g,8,6).scale.set(1,0.8,0.6)); items.push({k:'seat',x:10.5,z:1.35,face:0}); }
    }
    if(f===2){
      // the stone fireplace (two cells wide) and the two armchairs before it
      { const g=group(7.0,0,2.2,L), hc=P3('hearth',pal); if(hc){ hc.scale.set(1.7*K,1.1*K,1.2*K); g.add(hc); } else B(1.6,1.1,0.4,0x8a8a90,0,0,0,g);
        const fire=Co(0.22,0.4,6,glow(0xffa040),0,0.1,0.12,g); an.push(t=>{ fire.scale.y=1+Math.sin(t*11)*0.2; }); const fl=new THREE.PointLight(0xffa050,0.8,7,1.6); fl.position.set(0,0.6,0.7); g.add(fl); an.push(t=>{ fl.intensity=0.7+Math.sin(t*9)*0.08+Math.sin(t*14.3)*0.06; });
        items.push({k:'hearth',x:7.0,z:1.6}); }
      [[5.5,2.6],[8.5,2.6]].forEach(([x,z])=>{ const g=S(group(x,0,z,L)), fc=Math.atan2(7-x,2.2-z)+Math.PI; g.rotation.y=fc; const red=0x7a2028; B(0.7,0.42,0.62,0x5a161c,0,0,0,g); B(0.62,0.1,0.54,red,0,0.42,0.02,g); B(0.7,0.8,0.16,red,0,0.42,-0.27,g); [-1,1].forEach(sd=>{ B(0.1,0.28,0.56,red,sd*0.35,0.42,0,g); B(0.1,0.5,0.22,red,sd*0.33,0.72,-0.18,g); });
        items.push({k:'armchair',x,z,face:fc}); });
      // the great four-poster between its nightstands
      { const g=S(group(11.0,0,2.5,L),K*1.05); const b=P3('bed',pal,{quilt:0x2f4a8f}); if(b){ b.scale.set(1.9,1,1.25); g.add(b); } else { B(1.7,0.35,2.2,0x5a3a22,0,0,0,g); B(1.6,0.16,2.0,0xf4eee0,0,0.35,0,g); B(1.62,0.1,1.3,0x2f4a8f,0,0.5,0.3,g); }
        [[-0.85,-1.1],[0.85,-1.1],[-0.85,1.1],[0.85,1.1]].forEach(([x,z])=>B(0.08,2.3,0.08,0x4a2e18,x,0,z,g)); B(1.8,0.08,2.3,0x4a2e18,0,2.3,0,g); const can=B(1.75,0.04,2.25,0x7a2a3a,0,2.36,0,g);
        [-0.86,0.86].forEach(x=>{ const cu=B(0.03,1.7,0.5,0x7a2a3a,x,0.62,-0.85,g); }); items.push({k:'bed',x:11.0,z:2.5}); }
      [[9.5,1.5],[12.5,1.5]].forEach(([x,z])=>{ const g=S(group(x,0,z,L)); B(0.5,0.55,0.4,0x5a3a20,0,0,0,g); Cy(0.03,0.035,0.14,6,0xf0e8d0,0,0.55,0,g); const fl=Co(0.03,0.08,5,glow(0xffd27a),0,0.69,0,g); an.push(t=>{ fl.scale.y=1+Math.sin(t*12+x)*0.2; }); });
      // the wardrobe; the writing desk with its chair; the chest at the bed's foot is the tile's own
      { const g=S(group(1.45,0,6.5,L)); g.rotation.y=Math.PI/2; B(0.95,1.95,0.5,0x5a3a20,0,0,0,g); B(0.02,1.7,0.02,0x2a1a10,0,0.12,0.26,g); [-0.08,0.08].forEach(x=>B(0.03,0.1,0.03,0xd8b04a,x,1.0,0.27,g)); B(1.0,0.08,0.55,0x4a2e18,0,1.95,0,g); items.push({k:'wardrobe',x:1.5,z:6.5}); }
      { const g=S(group(12.5,0,4.5,L)); g.rotation.y=-Math.PI/2; B(1.0,0.06,0.55,0x6a4428,0,0.7,0,g); [[-0.45,-0.22],[0.45,-0.22],[-0.45,0.22],[0.45,0.22]].forEach(([x,z])=>B(0.05,0.7,0.05,0x4a2e18,x,0,z,g)); B(0.3,0.02,0.22,0xf4eee0,-0.1,0.73,0,g); Cy(0.03,0.03,0.12,6,0x2a2a30,0.25,0.73,0.05,g); B(0.01,0.18,0.01,0xe8e0d0,0.25,0.85,0.05,g); items.push({k:'desk',x:12.5,z:4.5}); }
    }
    return items; }
  return {pre,post};
})();
