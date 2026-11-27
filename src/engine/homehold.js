// ════════════════════════════════════════════════════════════════
//  HOMEHOLD (V289) — the Homestead's own hours. The family farmhouse is three floors, and its people move between them as the
//  day goes: by day each is about the house as before (Father and Mother and Grandfather in the hall, the twins upstairs);
//  in the early evening (~19:10) the whole family sits down to supper at the long table; after supper (~20:20) Father takes
//  his chair on the rug, Mother her spinning wheel, Grandfather the fireside, the twins the window seat; and from about nine
//  everyone is in bed until morning: Father and Mother in their box bed off the hall, Grandfather in his room off the
//  children's floor, the twins in theirs.
//  After the wedding (S.homecoming) Princess Madison lives here too: about the house by day (baking with Mother of a morning,
//  writing to her father at the desk, reading to the twins, talking with Mother of an afternoon), at the table at supper,
//  out on the bedchamber balcony after, and then in the great bed in your suite — your bed, now hers too.
//  One night in three a friend stays over in the guest bed (Squire Matthew; and, once the realm is at peace, Sir Joshua too),
//  and comes to supper. In the barn, Hal the farmhand forks hay by day, sits on his bale by the lantern of an evening, and sleeps
//  up in the hayloft. Speak to anyone abed and they wake — sleepily — and settle again soon after.
//    HOMEHOLD.attach(lv, spec, items)   — rooms.js, for in:home_house:N and in:home_barn:0
//    HOMEHOLD.phase()                    — 'day' | 'supper' | 'after' | 'bed'
// ════════════════════════════════════════════════════════════════
const HOMEHOLD=(()=>{
  const S=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  const frac=()=>{ const f=S().dayFrac; return typeof f==='number'?((f%1)+1)%1:0.4; };
  const SUP=0.80, AFT=0.845, BED=0.875, DAWN=0.272;   // ~19:12, 20:17, 21:00, 06:30
  const phase=()=>{ const f=frac(); return f>=BED||f<DAWN?'bed':f>=AFT?'after':f>=SUP?'supper':'day'; };
  const day=()=>S().day||1;
  const wed=()=>!!S().homecoming;
  // a friend stays one night in three: the squire, and once the realm is at peace, Sir Joshua turn about
  const guest=()=>{ const d=day(); if(d%3!==0) return null; return wed()&&(d/3)%2===1?'Sir Joshua':'Squire Matthew'; };
  // where everyone is, by the hour: {fl, x, z, face, m:'sit'|'stand'|'lie', bed} (bed: which bed they lie in)
  const SEAT={'Sir Aldric':[5.05,3.5,Math.PI/2],'Lady Elara':[10.95,3.5,-Math.PI/2],'Tobias':[5.5,2.5,0],'Mara':[7.5,2.5,0],'Tobiah':[9.5,2.5,0],'Princess Madison':[6.5,4.5,Math.PI],guest:[9.5,4.5,Math.PI]};
  const AFTER={'Sir Aldric':{fl:0,x:2.5,z:4.5,face:Math.PI,m:'sit'},'Lady Elara':{fl:0,x:2.45,z:6.75,face:-2.2,m:'stand'},'Tobias':{fl:0,x:3.75,z:2.15,face:-2.4,m:'stand'},
    'Mara':{fl:1,x:10.22,z:1.4,face:0,m:'sit'},'Tobiah':{fl:1,x:10.78,z:1.4,face:0,m:'sit'},'Princess Madison':{fl:2,x:6.5,z:9.75,face:0,m:'stand'},guest:{fl:0,x:4.35,z:1.95,face:-2.0,m:'stand'}};
  const BEDS={'Sir Aldric':{fl:0,bed:'p',side:-0.4},'Lady Elara':{fl:0,bed:'p',side:0.4},'Tobias':{fl:1,bed:[14.5,2.0]},'Mara':{fl:1,bed:[2.5,2.0]},'Tobiah':{fl:1,bed:[6.5,2.0]},
    'Princess Madison':{fl:2,bed:'g',side:-0.42},guest:{fl:1,bed:[16.5,2.0]}};
  // the Princess's day about the house
  const MADDAY=[[0.40,{fl:0,x:3.65,z:3.55,face:-2.6,m:'stand',say:'mor'}],[0.52,{fl:2,x:11.85,z:4.5,face:Math.PI/2,m:'sit',say:'desk'}],[0.64,{fl:1,x:10.5,z:1.4,face:0,m:'sit',say:'seat'}],[0.80,{fl:0,x:9.45,z:5.4,face:-0.9,m:'stand',say:'aft'}]];
  const MADLINES={mor:['Good morning, my knight! Your mother is teaching me to bake bread. It is a great deal harder than ruling.'],
    desk:['A letter to Father. I tell him of the farm, the twins, the sunsets… and that I am happy. Truly.'],
    seat:['The twins asked for a story about the Pretender. I told them a better one — about you.'],
    aft:['Your mother says you were a terror at six. I want to hear everything.'],
    home:['Your mother has asked me four times whether the palace fed me properly. I have stopped saying yes; she does not believe it.','I like it here. There is a window in your top room that faces east — I have watched the sun come up from it eleven mornings running, and it has not once failed.','Sunfall is keeping its own watch now. The lamps are theirs again. The boy with the kite writes to me, if you can believe it.'],
    supper:['Sit by me. Your grandfather is about to say grace, and he is not a brief man.'],
    after:['Come and look. The first stars over Luminar… once I thought I would never see the sky again.','“The heavens declare the glory of God; and the firmament sheweth his handywork.” — Psalm 19:1'],
    wake:['Mm… there you are. Come to bed, my knight — the realm can spare you till morning.']};
  const LINES={
    supper:{'Sir Aldric':['Sit, my child. We waited grace for you.'],'Lady Elara':['Eat — you\'re thin as a fence-rail. There\'s more stew in the pot.'],'Tobias':['Pass the bread, young one. And tell us where you\'ve been.'],
      'Mara':['Tell us a story! A real one, with a dragon!'],'Tobiah':['Mara took the biggest piece again.'],'Squire Matthew':['Sir! Your mother\'s stew — I\'d ride a week for it. I nearly did.'],'Sir Joshua':['Your father tells a fine tale of the old wars, friend. Your mother tells it better.']},
    after:{'Sir Aldric':['Fifteen years I dreamed of this chair, and this fire. It is softer than I remembered.'],'Lady Elara':['One more row, then bed. Goodnight, love.'],'Tobias':['The fire\'s low. Mind you get some sleep yourself, young one.'],
      'Mara':['We\'re not tired. …Much.'],'Tobiah':['Can we stay up till the fire\'s out? Please?'],'Squire Matthew':['I\'ll be up with the sun, sir — I promised your grandfather I\'d help with the mule.'],'Sir Joshua':['A good house, this. Strong walls and a warm hearth.']},
    wake:{'Sir Aldric':['Hm? …Is the gate barred? Good. Sleep, child. The night watch is done.'],'Lady Elara':['Can\'t sleep, love? There\'s warm milk on the hob. Go on.'],'Tobias':['Eh? Wha— oh, it\'s you. Go to bed, young one.'],
      'Mara':['*mumbles* …five more minutes…'],'Tobiah':['Is it a demon?! …Oh. It\'s you. Night.'],'Squire Matthew':['Sir! Is it the alarm?— oh. Sorry, sir. Goodnight, sir.'],'Sir Joshua':['Hrmph. Even heroes sleep, friend.']}};
  const pickL=(o,who)=>(o[who]||['Goodnight, knight.']);
  function plan(who,isGuest){ const ph=phase(), k=isGuest?'guest':who;
    if(who==='Princess Madison'&&!wed()) return null;
    if(who==='Sir Aldric'&&!S().abaddonWon) return null;   // home only once Abaddon falls (luminar.js)
    if(isGuest&&guest()!==who) return null;
    if(ph==='day'){ if(isGuest) return null; if(who==='Princess Madison'){ const f=frac(); const e=MADDAY.find(([t])=>f<t)||MADDAY[MADDAY.length-1]; return e[1]; } return {home:true}; }
    if(ph==='supper'){ const s=SEAT[k]; return s?{fl:0,x:s[0],z:s[1],face:s[2],m:'sit',say:'supper'}:{home:true}; }
    if(ph==='after') return Object.assign({say:'after'},AFTER[k]||{home:true});
    const b=BEDS[k]; return b?Object.assign({m:'lie'},b):{home:true}; }
  // ── a floor of the farmhouse ──
  function attachHouse(lv,spec,items){ if(lv._hh) return; lv._hh=true; const FL=+((/:(\d)$/.exec(lv.id)||[])[1]||0), R=lv.room;
    const beds=items.filter(i=>i.k==='bed').map(b=>({x:b.x,z:b.z})); const lift=c=>{ c.position.y+=0.04; c.scale.y=1.4; return c; };
    beds.forEach(b=>{ b.top=SLEEP.topAt(lv,b.x,b.z); b.cov=lift(SLEEP.cover(lv,b,0x6a7aa8)); });
    const pb=items.find(i=>i.k==='pbed'); let pCov=null; if(pb){ pCov=lift(SLEEP.cover(lv,{x:pb.x,z:pb.z+0.1,top:pb.top},0x8a3a4a,1.62)); pCov.scale.z=1.12; }
    const gb=FL===2?{x:11.0,z:2.5}:null; let gCov=null; if(gb){ gb.top=SLEEP.topAt(lv,gb.x-0.42,gb.z); gCov=lift(SLEEP.cover(lv,{x:gb.x,z:gb.z+0.05,top:gb.top},0x7a2a3a,1.5)); gCov.scale.z=1.12; }
    const bedAt=(b)=>{ if(Array.isArray(b)){ let best=null,d=9; beds.forEach(q=>{ const dd=Math.hypot(q.x-b[0],q.z-b[1]); if(dd<d){ d=dd; best=q; } }); return d<1.2?best:null; } return null; };
    // everyone who lives here (and the night's guest), each with a figure on this floor: their own, or one made for this floor
    const ROSTER=['Sir Aldric','Lady Elara','Tobias','Mara','Tobiah','Princess Madison','Squire Matthew','Sir Joshua'];
    const HOMEF={'Sir Aldric':0,'Lady Elara':0,'Tobias':0,'Mara':1,'Tobiah':1}, KEY={'Sir Aldric':'home_house:0:5,4','Lady Elara':'home_house:0:8,4','Tobias':'home_house:0:6,5','Mara':'home_house:1:3,2','Tobiah':'home_house:1:7,2'};
    const people=[];
    ROSTER.forEach(who=>{ const isGuest=who==='Squire Matthew'||who==='Sir Joshua'; let f=lv.folk.find(q=>q.who===who), own=!!f;
      // does this person ever come to this floor?
      const ever=FL===HOMEF[who]||(FL===0)||(FL===1&&['Tobias','Mara','Tobiah','Princess Madison','Squire Matthew','Sir Joshua'].includes(who))||(FL===2&&who==='Princess Madison');
      if(!ever&&!own) return;
      if(!f){ const ls=(typeof DIALOGUE!=='undefined'&&KEY[who]&&DIALOGUE.lines(KEY[who]))||null; f=addPerson(lv,R,'peasant',2,2,0,who,(ls&&ls.lines)||['God keep you.'],{rest:0}); if(KEY[who]) f.key=KEY[who]; f.g.visible=false; f.mute=true; f.ghost=true; }
      f.still=true; f.near=f.near||30; f.lookAbout=0.35; f.breathe=true; f.idle=f.idle||({'Sir Aldric':'behind','Lady Elara':'clasped','Tobias':'behind','Princess Madison':'clasped'}[who]||null);
      people.push({f,who,isGuest,own,day:{x:f.x,z:f.z,rest:f.rest,y:f.g.position.y},act0:f.action||null,key:'',awake:0}); });
    const set=(f,x,z,rest,y)=>{ f.x=x; f.z=z; f.rest=rest; f.g.position.set(x,y||0,z); f.g.rotation.y=rest; };
    const show=(f,v)=>{ f.g.visible=v; f.mute=!v; f.ghost=!v; };
    function place(P){ const p=plan(P.who,P.isGuest), f=P.f; f.lie=false; f.sit=false;
      if(!p||(p.home&&!(P.own&&HOMEF[P.who]===FL))||(p.fl!==undefined&&p.fl!==FL)){ show(f,false); clr(P); return; }
      show(f,true);
      if(p.home){ set(f,P.day.x,P.day.z,P.day.rest,P.day.y); clr(P); return; }
      if(p.m==='lie'){ let x,z,top,s=f.g.scale.x||0.6;
        if(p.bed==='p'&&pb){ x=pb.x+p.side; z=pb.z+0.02; top=pb.top+0.04; if(pb.quilt) pb.quilt.visible=false; if(pCov) pCov.visible=true; }
        else if(p.bed==='g'&&gb){ x=gb.x+p.side; z=gb.z+0.05; top=gb.top; if(gCov) gCov.visible=true; }
        else { const b=bedAt(p.bed); if(!b){ show(f,false); return; } x=b.x; z=b.z+0.08; top=b.top; if(b.cov) b.cov.visible=true; }
        set(f,x,z,0,top-0.11*s); f.lie=true; act(P,()=>wake(P)); return; }
      set(f,p.x,p.z,p.face,p.m==='sit'?0.02:0); if(p.m==='sit') f.sit=true;
      const ls=P.who==='Princess Madison'?(p.say==='mor'||p.say==='desk'||p.say==='seat'||p.say==='aft'?MADLINES[p.say].concat([MADLINES.home[(P.hn=(P.hn||0)+1)%3]]):MADLINES[p.say]||MADLINES.aft):p.say&&LINES[p.say]?pickL(LINES[p.say],P.who):null;
      if(ls) act(P,()=>ENGINE.speak(P.who,ls,f)); else clr(P); }
    // our own words for the evening and the night; their own (and the Demon Hunt's, for Father) by day
    function act(P,fn){ if(!P.ov){ P.saved=P.f.action; P.ov=true; } P.f.action=fn; }
    function clr(P){ if(P.ov){ P.f.action=P.saved; P.ov=false; } }
    function wake(P){ const f=P.f; f.lie=false; f.sit=true; const s=f.g.scale.x||0.6; set(f,f.x+0.5,f.z+0.15,Math.PI/2,0.02); P.awake=25;
      ENGINE.speak(P.who,P.who==='Princess Madison'?MADLINES.wake:pickL(LINES.wake,P.who),f); }
    let lastKey='';
    const tick=(t,dt)=>{ const k=phase()+'|'+wed()+'|'+guest()+'|'+(phase()==='day'&&wed()?(MADDAY.findIndex(([tt])=>frac()<tt)):0);
      people.forEach(P=>{ if(P.awake>0){ P.awake-=Math.min(dt||0.016,0.1); if(P.awake<=0&&!(ENGINE.talking&&ENGINE.talking()===P.f)) P.key=''; } });
      if(k===lastKey&&people.every(P=>P.key===k)) return;
      // covers and quilts back as they were, then everyone to their place
      beds.forEach(b=>{ if(b.cov) b.cov.visible=false; }); if(pCov) pCov.visible=false; if(gCov) gCov.visible=false; if(pb&&pb.quilt) pb.quilt.visible=true;
      people.forEach(P=>{ if(P.awake>0){ return; } place(P); P.key=k; });
      // the beds of anyone awake and sitting on the edge stay turned down
      lastKey=k; };
    lv.anim.push(tick); const oe=lv.onEnter; lv.onEnter=sp=>{ lastKey=''; people.forEach(P=>{ P.key=''; P.awake=0; }); tick(0,0); if(oe) oe(sp); };
    tick(0,0); }
  // ── the barn: Hal the farmhand — forking hay by day, on his bale with the lantern of an evening, up in the loft at night ──
  function attachBarn(lv,spec,items){ if(lv._hh) return; lv._hh=true; const R=lv.room, cot=items.find(i=>i.k==='cot'), bale=items.find(i=>i.k==='bale');
    // the Old Mule was standing in his stall as a man; he is a mule again (the realm's own donkey, rigged), and still answers you
    const mi=lv.folk.findIndex(q=>/Mule/.test(q.who||'')); if(mi>=0&&typeof DECOR_KINDS!=='undefined'&&DECOR_KINDS.mule){ const q=lv.folk[mi]; R.remove(q.g); lv.folk.splice(mi,1);
      const g=group(4.5,0,2.2,R); g.userData.keepScale=true; try{ DECOR_KINDS.mule({x:4,y:2},g,lv.anim); }catch(e){} g.scale.setScalar(0.72); g.rotation.y=Math.PI;
      g.traverse(o=>{ if(o.isGroup&&o!==g&&o.rotation) o.rotation.y=0; });
      lv.spots.push({x:4.5,z:3.3,r:1.1,label:'Pat',who:'Old Mule',action:()=>ENGINE.speak('Old Mule',['(The mule regards you with mild interest, then leans his great head on your shoulder.)'])}); }
    const f=addPerson(lv,R,'vill',5.5,5.0,0,'Hal the farmhand',['Morning, young master. The mule\'s in a mood — always is, before his oats.','Your father took me on the week he came home. Best master I\'ve had.'],{outfit:'farmer',rest:-0.6});
    f.key='home_barn:hal'; f.still=true; f.near=30; f.lookAbout=0.4; f.breathe=true; f.idle='thumbs';
    const fork=group(0,0,0,f.g); B(0.03,1.5,0.03,0x8a6a3a,0.3,0,0.12,fork); [-0.05,0,0.05].forEach(x=>B(0.012,0.2,0.012,0x8a8a90,0.3+x,1.5,0.12,fork));
    const cov=cot?SLEEP.cover(lv,{x:cot.x,z:cot.z-0.15,top:cot.top},0x7a5a3a,0.7):null;
    let lastPh='', awake=0;
    const set=(x,z,rest,y)=>{ f.x=x; f.z=z; f.rest=rest; f.g.position.set(x,y||0,z); f.g.rotation.y=rest; };
    const place=()=>{ const ph=phase(); f.lie=false; f.sit=false; fork.visible=false; f.action=null; if(cov) cov.visible=false;
      if(ph==='day'){ set(5.5,5.0,-0.6,0); fork.visible=true; return; }
      if(ph==='bed'&&cot){ const s=f.g.scale.x||0.6; set(cot.x,cot.z+0.05,0,cot.top-0.11*s); f.lie=true; if(cov) cov.visible=true;
        f.action=()=>{ f.lie=false; f.sit=true; if(cov) cov.visible=false; set(cot.x+0.42,cot.z+0.2,Math.PI/2,cot.top-0.38); awake=25; ENGINE.speak(f.who,['Mmph — the mule out? …No? Then let a man sleep, young master.'],f); }; return; }
      set(bale.x,bale.z+0.05,bale.face||Math.PI,0.02); f.sit=true; f.action=()=>ENGINE.speak(f.who,['Evening, young master. Bread and cheese and a quiet barn — a man needs nothing more.','Your grandfather says the old mule\'s older than me. I believe him.'],f); };
    lv.anim.push((t,dt)=>{ if(awake>0){ awake-=Math.min(dt||0.016,0.1); if(awake<=0) lastPh=''; return; } const ph=phase(); if(ph!==lastPh){ lastPh=ph; place(); } });
    const oe=lv.onEnter; lv.onEnter=sp=>{ lastPh=''; awake=0; if(oe) oe(sp); };
    place(); }
  function attach(lv,spec,items){ try{ if(/^in:home_barn:/.test(lv.id)) attachBarn(lv,spec,items||[]); else attachHouse(lv,spec,items||[]); }catch(e){ console.warn('[homehold]',e); } }
  return {attach,phase,plan,guest};
})();
