// ════════════════════════════════════════════════════════════════
//  ⌨ KEYBOARD CONTROLS — ☰ System → Keyboard Controls, as the game's own (CTL_ACTIONS, ctlKey): every action has
//  two keys; tap one, press the new key (Backspace clears it, Esc leaves it). Saved per computer (localStorage
//  'klk3d_controls'), never in the save. How: a capture-phase listener runs before every other key handler and
//  rewrites a bound key to the action's canonical key — the one the handlers already listen for — and silences an
//  old default key the player has not kept. With the defaults it changes nothing.
// ════════════════════════════════════════════════════════════════
const KEYS=(function(){
  const ACTIONS=[
    {id:'up',label:'▲ Forward',canon:'w',def:['w','arrowup'],grp:'Move'}, {id:'down',label:'▼ Back',canon:'s',def:['s','arrowdown'],grp:'Move'},
    {id:'left',label:'◀ Left',canon:'a',def:['a','arrowleft'],grp:'Move'}, {id:'right',label:'▶ Right',canon:'d',def:['d','arrowright'],grp:'Move'},
    {id:'turnl',label:'↺ Turn the view left',canon:'turnl',def:[',',null],grp:'Move'}, {id:'turnr',label:'↻ Turn the view right',canon:'turnr',def:['.',null],grp:'Move'},
    {id:'jump',label:'⤴ Jump',canon:'jump',def:['space',null],grp:'Move'},
    {id:'sprint',label:'🏃 Sprint on / off',canon:'sprint',def:['v',null],grp:'Move'}, {id:'crouch',label:'🦶 Crouch on / off (creep, unseen)',canon:'crouch',def:['x',null],grp:'Move'},
    {id:'dodge',label:'💨 Dodge roll (the way you are moving)',canon:'dodge',def:['alt','c'],grp:'Fight'},
    {id:'act',label:'Ⓐ Talk · open · next line',canon:'e',def:['e','enter'],grp:'Act'}, {id:'strike',label:'⚔ Swing (or left click)',canon:' ',def:['j',null],grp:'Fight'},
    {id:'guard',label:'🛡 Guard, hold (or right click)',canon:'shift',def:['shift','k'],grp:'Fight'}, {id:'lock',label:'🎯 Lock on / let go (or middle click)',canon:'f',def:['q','f'],grp:'Fight'}, {id:'potion',label:'🧪 Drink a potion',canon:'p',def:['1','h'],grp:'Fight'}, {id:'pet',label:'🐾 Companion’s command',canon:'g',def:['g','2'],grp:'Fight'},
    {id:'mount',label:'🐎 Mount / dismount',canon:'r',def:['r',null],grp:'Act'}, {id:'menu',label:'☰ Menu',canon:'m',def:['m',null],grp:'Menus'},
    {id:'surface',label:'🌊 Surface (underwater)',canon:'u',def:['u',null],grp:'Menus'} ];
  const FIXED={escape:1,tab:1};
  const norm=k=>k==null?'':k===' '?'space':String(k).toLowerCase();
  const defs=()=>{ const b={}; ACTIONS.forEach(a=>b[a.id]=a.def.slice()); return b; };
  let binds=defs(), listen=null, msg='';
  // the mouse: how fast it turns the view, and whether up is up
  let mouse={sens:1,inv:false}; try{ const m=JSON.parse(localStorage.getItem('klk3d_mouse')||'null'); if(m) mouse=Object.assign(mouse,m); }catch(e){}
  const saveM=()=>{ try{ localStorage.setItem('klk3d_mouse',JSON.stringify(mouse)); }catch(e){} };
  try{ const s=JSON.parse(localStorage.getItem('klk3d_controls')||'null'); if(s&&s.binds) ACTIONS.forEach(a=>{ const v=s.binds[a.id]; if(Array.isArray(v)&&v.length===2) binds[a.id]=[v[0]||null,v[1]||null]; }); if(s&&s.binds&&!s.binds.jump){ const d=binds.dodge; ['space'].forEach(k=>{ const i=d.indexOf(k); if(i>=0) d[i]=i===0?'alt':'c'; }); if(d[0]===d[1]) d[1]=d[0]==='c'?null:'c'; } /* saved before the jump: Space goes to the jump, the roll keeps Alt/C */ }catch(e){}
  const save=()=>{ try{ localStorage.setItem('klk3d_controls',JSON.stringify({v:1,binds})); }catch(e){} };
  const GAMEKEYS=new Set(); ACTIONS.forEach(a=>a.def.forEach(k=>k&&GAMEKEYS.add(k)));
  const name=k=>{ if(!k) return '—'; const N={arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',space:'Space',shift:'Shift',control:'Ctrl',alt:'Alt',meta:'⌘',enter:'Enter',backspace:'⌫',capslock:'Caps'}; return N[k]||(k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1)); };
  const setKey=(e,k)=>{ try{ Object.defineProperty(e,'key',{value:k,configurable:true}); }catch(_){} };
  function handle(e){ if(e._pad) return;   /* a controller's press arrives already as the action's own key (pad.js) */ const tg=e.target, tag=tg&&tg.tagName?tg.tagName.toUpperCase():''; if(tag==='INPUT'||tag==='TEXTAREA') return; const k=norm(e.key);
    if(listen&&e.type==='keydown'){ e.preventDefault(); e.stopImmediatePropagation(); const L=listen; listen=null;
      if(k==='escape') msg='Left as it was.'; else if(k==='backspace'||k==='delete'){ binds[L.id][L.slot]=null; msg='Key cleared.'; save(); }
      else if(FIXED[k]) msg='Esc and Tab are fixed — they always close.';
      else { let moved=''; ACTIONS.forEach(a=>{ for(let i=0;i<2;i++) if(binds[a.id][i]===k&&!(a.id===L.id&&i===L.slot)){ binds[a.id][i]=null; moved=a.label; } });
        binds[L.id][L.slot]=k; save(); msg=`${name(k)} → ${ACTIONS.find(a=>a.id===L.id).label}${moved?` (taken from ${moved})`:''}`; }
      if(open) draw(); return; }
    if(listen&&e.type==='keyup'){ e.stopImmediatePropagation(); return; }
    if(FIXED[k]) return;
    const a=ACTIONS.find(q=>binds[q.id][0]===k||binds[q.id][1]===k);
    if(a){ if(norm(a.canon)!==k) setKey(e,a.canon); return; }
    if(GAMEKEYS.has(k)) setKey(e,'Unidentified'); }   // an old key the player gave away is quiet now
  addEventListener('keydown',handle,true); addEventListener('keyup',handle,true);
  let open=false;
  function draw(){ let h='<p class="gm-intro">Tap a key, then press the new one. Backspace clears it; Esc leaves it as it was. Saved on this device only.</p>'+(msg?`<p class="gm-note">${UI.esc(msg)}</p>`:'');
    let grp=''; ACTIONS.forEach(a=>{ if(a.grp!==grp){ grp=a.grp; h+=`<div class="gm-sec">${grp}</div>`; }
      h+=`<div class="gm-item" style="display:flex;gap:6px;align-items:center"><span style="flex:1">${UI.esc(a.label)}</span>`+[0,1].map(i=>{ const on=listen&&listen.id===a.id&&listen.slot===i;
        return `<button class="gm-item ${on?'worn':''}" style="width:84px;justify-content:center;margin:0" data-act="k:${a.id}:${i}">${on?'press…':UI.esc(name(binds[a.id][i]))}</button>`; }).join('')+'</div>'; });
    h+=`<div class="gm-sec">Mouse</div><p class="gm-hint">Click the game to steer the view with the mouse (Esc frees the cursor). Left click swings, hold right click to guard, middle click locks on; scroll to zoom.</p>`
      +`<div class="gm-item" style="display:flex;gap:6px;align-items:center"><span style="flex:1">Look speed</span><button class="gm-item" style="width:44px;justify-content:center;margin:0" data-act="ms:-">−</button><b style="width:44px;text-align:center">${mouse.sens.toFixed(1)}×</b><button class="gm-item" style="width:44px;justify-content:center;margin:0" data-act="ms:+">+</button></div>`
      +`<button class="gm-item ${mouse.inv?'worn':''}" data-act="inv"><span>Invert up and down</span><i>${mouse.inv?'on':'off'}</i></button>`;
    h+=`<div class="gm-sec">Controller</div><p class="gm-hint">Plug in a controller (Xbox, PlayStation, Switch Pro, 8BitDo…) and press any button. Left stick walks · right stick turns the view · (defaults) Ⓐ talk / next line (or jump, when there's nothing to talk to) · Ⓑ dodge roll · Ⓧ or RT swing (hold to charge) · Ⓨ talk / open · LB or LT guard · RB or R3 lock on · L3 or ✚↓ mount · ✚↑ potion · ✚← surface · Start menu. In menus: stick or ✚ to move, Ⓐ to choose, Ⓑ to go back.</p>`;
    h+=`<button class="gm-item" data-act="pad"><span>🎮 Change the controller's buttons</span></button>`;
    h+=`<button class="gm-item" data-act="reset"><span>↩ Reset to the defaults</span></button>`;
    UI.sheet({title:'⌨ Keyboard Controls',html:h,keepScroll:true,act:a=>{ if(a==='ms:-'||a==='ms:+'){ mouse.sens=Math.round(Math.max(0.2,Math.min(3,mouse.sens+(a==='ms:+'?0.1:-0.1)))*10)/10; saveM(); msg=''; draw(); return; } if(a==='inv'){ mouse.inv=!mouse.inv; saveM(); msg=''; draw(); return; }
      if(a==='pad'){ open=false; listen=null; if(typeof PAD!=='undefined') PAD.open(); return; }
      if(a==='reset'){ binds=defs(); save(); msg='All keys back to the defaults.'; listen=null; }
        else { const [,id,i]=a.split(':'); listen={id,slot:+i}; msg=''; } draw(); },close:()=>{ open=false; listen=null; }}); open=true; }
  return { mouse:()=>mouse, open:()=>{ msg=''; draw(); }, keysFor:id=>(binds[id]||[]).filter(Boolean).map(name).join(' / ')||'—' };
})();
