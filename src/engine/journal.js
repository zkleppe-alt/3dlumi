// ════════════════════════════════════════════════════════════════
//  JOURNAL — the Knight's Journal, and study as rest (V97). The game's quiet moments write themselves down, a page at a
//  time, in the knight's own voice: a lesson learned at Old Man Mario's desk, a manuscript read for the first time, a candle
//  lit or a prayer at a sanctuary rail, an evening's study by the fire. Dated by the realm's own days. ☰ → Quests → 📖.
//  Study: sit at a quiet place (Mario's desk, the Homestead hearth, under the great tree in Eldan's glade) and read a little:
//  a passage you can read in Greek (or, before that, a verse in your own tongue), with a quiet thought to sit with. An hour
//  passes; you rise mended; the journal remembers. The first time you study each passage, it settles in (+25 XP).
//  State: GAME.S.journal = [{d (day), h (hour), p (place), x (text)}], S.journalOnce = {key:true}, S.jDay, S.studied.
// ════════════════════════════════════════════════════════════════
const JOURNAL=(function(){
  const S=()=>GAME.S;
  // the realm's days: count each time the clock comes round past midnight
  setInterval(()=>{ const s=S(); if(!s||typeof s.dayFrac!=='number') return; const f=((s.dayFrac%1)+1)%1; if(s.jLastF!==undefined&&f<s.jLastF-0.5) s.jDay=(s.jDay||1)+1; s.jLastF=f; if(!s.jDay) s.jDay=1; },4000);
  const hourName=()=>{ const f=((S().dayFrac%1)+1)%1, h=f*24; return h<5?'late at night':h<8?'at first light':h<12?'in the morning':h<14?'at midday':h<18?'in the afternoon':h<21?'in the evening':'at night'; };
  const placeName=()=>{ const L=ENGINE.level; if(!L) return ''; const z=L.zone?L.zone(ENGINE.P):''; return L.id==='world'?String(z||'').split(' · ')[0]||'the open road':L.name||''; };
  function write(text,o){ o=o||{}; const s=S(); if(!s) return; s.journal=s.journal||[]; s.journalOnce=s.journalOnce||{};
    if(o.once){ if(s.journalOnce[o.once]) return; s.journalOnce[o.once]=true; }
    s.journal.push({d:s.jDay||1,h:hourName(),p:o.place||placeName(),x:text}); if(s.journal.length>240) s.journal.splice(0,s.journal.length-240);
    GAME.changed&&GAME.changed(); if(!o.quiet) UI.toast('📖 A new page in your journal',1600); }
  // ── reading it ──
  function open(){ const s=S(), J=(s.journal||[]).slice().reverse();
    let h=`<p class="gm-intro">${J.length?`${J.length} page${J.length>1?'s':''}, newest first.`:'The pages are still blank. They fill in the quiet moments — at Old Man Mario’s desk, by a fire, at a sanctuary rail.'}</p>`;
    J.forEach(e=>{ h+=`<div style="margin:10px 0;padding:10px 12px;border-radius:8px;background:linear-gradient(135deg,rgba(239,224,184,.10),rgba(216,192,138,.06));border:1px solid rgba(232,199,102,.25)">
      <div class="ds" style="margin-bottom:4px">Day ${e.d} · ${UI.esc(e.h)}${e.p?' · '+UI.esc(e.p):''}</div><div style="font:italic 15px/1.5 Georgia,'Times New Roman',serif">${e.x}</div></div>`; });
    UI.sheet({title:'📖 The Knight’s Journal',html:h}); }
  // ── things to read when studying, and a thought to sit with ──
  const THOUGHT={ john1:'Before anything was made, the Word already was. What would it mean to give Him the first hour of the day?',
    john14_6:'Not a way, but the way — and not only the truth, but the life as well.',
    john1_14:'ἐσκήνωσεν — He pitched His tent among us. God did not stay far off.',
    john3_16:'Οὕτω — so, in this way. The measure of the love is in what was given.',
    matt6a:'The prayer begins not with our needs, but with His name, His kingdom, His will.',
    matt6b:'Bread enough for today. And forgiven, as we forgive.',
    john8_12:'Whoever follows Him will not walk in darkness: the light goes with the one who follows.',
    john10_11:'The good shepherd lays down his life for the sheep — not for himself.',
    john11_25:'He said it to a grieving sister, beside a tomb: I am the resurrection and the life.',
    matt5_3:'The kingdom belongs to the poor in spirit — to those who know they need it.',
    john1_29:'Ἴδε — look! The Lamb who takes away the sin of the world.',
    matt5_8:'The pure in heart will see God; the peacemakers will be called His sons.',
    john8_32:'The truth is not only known. It sets free.',
    john11_35:'Two words. The Lord who would raise Lazarus still stopped to weep with those who wept.' };
  // before any Greek: verses in the King James wording (public domain)
  const PLAIN=[['Psalm 119:105','Thy word is a lamp unto my feet, and a light unto my path.','A lamp for the feet — enough light for the next step, not the whole road.'],
    ['Psalm 23:1','The LORD is my shepherd; I shall not want.','Rest is not idleness. Even a knight is a sheep before he is a soldier.'],
    ['Proverbs 3:5','Trust in the LORD with all thine heart; and lean not unto thine own understanding.','All thine heart — not the part left over after the fighting.'],
    ['Isaiah 40:31','But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.','Waiting is part of the work. Strength comes back to those who wait on Him.'],
    ['Joshua 1:9','Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.','Whithersoever — the dungeons too.']];
  let vig=null; function vignette(on){ if(!vig){ vig=document.createElement('div'); vig.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity 1.2s;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 35%,rgba(20,12,4,.72) 100%)'; document.body.appendChild(vig); } vig.style.opacity=on?'1':'0'; }
  function study(lv,o){ if(ENGINE.holding||(lv.combat&&lv.combat.foes&&lv.combat.foes.some(d=>d.alive&&Math.hypot(d.x-ENGINE.P.x,d.z-ENGINE.P.z)<8))) return;
    const s=S(); s.studied=s.studied||{}; const G=typeof GREEK!=='undefined'?GREEK:null, gs=G?G.st():{done:[],read:{}};
    const can=G?Object.keys(G.passages).filter(id=>id==='john1'?gs.done.includes('l10'):(gs.read||{})[id]):[];
    // prefer one not studied yet, else the one studied longest ago
    let pick=null; if(can.length){ const fresh=can.filter(id=>!s.studied[id]); pick=fresh.length?fresh[(Math.random()*fresh.length)|0]:can.slice().sort((a,b)=>(s.studied[a]||0)-(s.studied[b]||0))[0]; }
    const P=ENGINE.P, back={x:P.x,z:P.z}; P.x=o.x; P.z=o.z; P.face=o.face||0; ENGINE.hold(9999,'sit'); const lock=()=>{ P.x=o.x; P.z=o.z; P.face=o.face||0; }; lv.anim.push(lock);
    vignette(true); if(typeof AMBI!=='undefined'&&AMBI.fire&&o.fire) AMBI.fire(0.3);
    let h, ref, txt;
    if(pick){ const p=G.passages[pick], v=p.verses[0], gr=v[1].map(w=>w[0]).join(' '), en=p.en; ref=p.ref;
      h=`<p class="gm-hint">${UI.esc(o.place)} · ${hourName()}</p><div lang="el" style="text-align:center;font:600 21px/1.6 'Gentium Plus','Noto Serif','Times New Roman',serif;margin:10px 0">${gr}${p.verses.length>1?' …':''}</div>`
        +`<p style="text-align:center;font:italic 15px/1.5 Georgia,serif">${UI.esc(en)}</p><p class="gm-note" style="text-align:center">${UI.esc(THOUGHT[pick]||'')}</p><p class="gm-hint" style="text-align:center">— ${UI.esc(p.ref)}</p>`;
      const AGAIN=['It reads differently each time.','Some small word I had passed over stopped me this time.','I am beginning to hear it, not only to read it.','Mario says the old words are like wells: you never reach the bottom.','I closed my eyes after and could still see the letters.'];
      txt=!s.studied[pick]?`I sat ${o.where} and read ${p.ref} slowly, in Greek, word by word. ${THOUGHT[pick]||''}`:`I sat ${o.where} and read ${p.ref} again. ${AGAIN[(Math.random()*AGAIN.length)|0]}`; }
    else { const q=PLAIN[(s.jDay||1)%PLAIN.length]; ref=q[0];
      h=`<p class="gm-hint">${UI.esc(o.place)} · ${hourName()}</p><p style="text-align:center;font:italic 17px/1.6 Georgia,serif;margin:12px 0">“${UI.esc(q[1])}”</p><p class="gm-hint" style="text-align:center">— ${UI.esc(q[0])}</p><p class="gm-note" style="text-align:center">${UI.esc(q[2])}</p>`
        +(G&&!(gs.done||[]).length?`<p class="gm-hint" style="text-align:center">(Old Man Mario, by the Homestead, could teach you to read the Scriptures in Greek.)</p>`:'');
      txt=`I sat ${o.where} with ${q[0]}: “${q[1]}” ${q[2]}`; }
    h+=`<button class="gm-item" data-act="done"><span>📖 Close the book and rise</span></button>`;
    let closed=false; const end=()=>{ if(closed) return; closed=true; const i=lv.anim.indexOf(lock); if(i>=0) lv.anim.splice(i,1); ENGINE.hold(0); P.x=back.x; P.z=back.z; vignette(false);
      s.hp=s.maxHp; ENGINE.hud&&ENGINE.hud(); s.dayFrac=(s.dayFrac||0)+1/24;   // an hour passes
      const first=pick&&!s.studied[pick]; if(pick) s.studied[pick]=Date.now(); else s.studied['plain:'+ref]=Date.now();
      write(txt,{place:o.place,quiet:true}); if(first){ const r=GAME.gainXp(25); if(r&&r.up) setTimeout(()=>UI.toast(`Level ${S().level}! A skill point to spend.`,2400),1600); }
      GAME.changed(); GAME.save(); UI.toast(first?'📖 An hour passes. The word settles in. (+25 XP · a page in your journal)':'📖 An hour passes. You rise rested. (a page in your journal)',2600); };
    setTimeout(()=>UI.sheet({title:'📖 '+(pick?'Study — ':'')+ref,html:h,act:a=>{ if(a==='done'){ UI.close(); end(); } },close:end}),900); }
  // a quiet place to study: a spot labelled Study
  function spot(lv,x,z,face,place,where,o){ o=o||{}; lv.spots.push({x:o.sx!==undefined?o.sx:x,z:o.sz!==undefined?o.sz:z,r:o.r||0.9,label:'Study',who:place,action:()=>study(lv,{x,z,face,place,where,fire:o.fire})}); }
  return { write, open, study, spot, count:()=>((S()&&S().journal)||[]).length };
})();
