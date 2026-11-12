// ════════════════════════════════════════════════════════════════
//  PAD — plug in a controller (any the browser knows as a "standard" gamepad: Xbox, PlayStation, Switch Pro, 8BitDo…)
//  and play. Left stick walks, right stick turns the view (the same Tears-of-the-Kingdom curve as the touch look-stick).
//  Defaults:  Ⓐ talk / open / next line when there is something to talk to — otherwise jump
//    Ⓑ  dodge roll  (in a menu: back)            Ⓧ / RT  swing (hold to charge)        Ⓨ  talk / open
//    LB / LT  guard (hold)    RB / R3  lock on    ✚↓  mount    L3 sprint (toggle)   ✚→ crouch (toggle)    ✚↑ potion   ✚← surface    Start / View  menu
//  ☰ → 🎮 Controller Controls (V91): every action takes two buttons of your choosing — tap a slot, press the button;
//  plus swap the sticks, invert the look, and look speed. Saved on this device (localStorage 'klk3d_pad').
//  In a menu or a panel the stick and the ✚ move a highlight between its buttons, Ⓐ presses, Ⓑ closes (always).
//  Each press goes in as the action's own key (marked, so keys.js leaves it be), so everything that answers a key answers the pad.
// ════════════════════════════════════════════════════════════════
const PAD=(function(){
  let idx=null, prev=[], focusEl=null, navAt=0, held={}, listen=null, msg='', open=false;
  const ACTIONS=[
    {id:'act',label:'⤴ Talk · next line · or jump',def:[0,null]}, {id:'talk',label:'💬 Talk / open',def:[3,null]},
    {id:'strike',label:'⚔ Swing (hold to charge)',def:[2,7]}, {id:'guard',label:'🛡 Guard (hold)',def:[4,6]}, {id:'dodge',label:'💨 Dodge roll',def:[1,null]},
    {id:'lock',label:'🎯 Lock on / let go',def:[5,11]}, {id:'potion',label:'🧪 Drink a potion',def:[12,null]}, {id:'pet',label:'🐾 Companion’s command',def:[8,null]}, {id:'mount',label:'🐎 Mount / dismount',def:[13,null]}, {id:'sprint',label:'🏃 Sprint on / off',def:[10,null]}, {id:'crouch',label:'🦶 Crouch on / off',def:[15,null]},
    {id:'surface',label:'🌊 Surface (underwater)',def:[14,null]}, {id:'menu',label:'☰ Menu',def:[9,null]} ];
  const BN=['Ⓐ','Ⓑ','Ⓧ','Ⓨ','LB','RB','LT','RT','View','Start','L3','R3','✚↑','✚↓','✚←','✚→','Home'], bname=i=>i==null?'—':(BN[i]||'Button '+i);
  const defs=()=>{ const b={}; ACTIONS.forEach(a=>b[a.id]=a.def.slice()); return b; };
  let binds=defs(), opt={swap:false,inv:false,sens:1};
  try{ const s=JSON.parse(localStorage.getItem('klk3d_pad')||'null'); if(s){ if(s.binds) ACTIONS.forEach(a=>{ const v=s.binds[a.id]; if(Array.isArray(v)&&v.length===2) binds[a.id]=v.map(x=>typeof x==='number'?x:null); }); if(s.opt) opt=Object.assign(opt,s.opt); } }catch(e){}
  const save=()=>{ try{ localStorage.setItem('klk3d_pad',JSON.stringify({v:1,binds,opt})); }catch(e){} };
  const send=(type,key)=>{ const e=new KeyboardEvent(type,{key,bubbles:true,cancelable:true}); e._pad=true; dispatchEvent(e); };
  const press=key=>send('keydown',key), release=key=>send('keyup',key);
  addEventListener('gamepadconnected',e=>{ if(idx===null) idx=e.gamepad.index; UI.toast('🎮 Controller connected — '+(e.gamepad.mapping==='standard'?'ready to play · ☰ → Controller Controls to change the buttons':'(unrecognised layout: the sticks and Ⓐ Ⓑ Ⓧ Ⓨ may be swapped — ☰ → Controller Controls to set them)'),2800); if(open) draw(); });
  addEventListener('gamepaddisconnected',e=>{ if(e.gamepad.index===idx){ idx=null; zero(); UI.toast('🎮 Controller disconnected',1600); if(open) draw(); } });
  const zero=()=>{ const P=ENGINE.pad; if(P){ P.mx=P.mz=P.lx=P.ly=0; } Object.keys(held).forEach(k=>{ if(held[k]){ release(held[k]); held[k]=null; } }); };
  const dz=(v,d)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d);
  const vis=el=>{ if(!el||el.hidden||!el.getClientRects().length) return false; const cs=getComputedStyle(el); return cs.visibility!=='hidden'&&cs.display!=='none'; };   // (fixed panels have no offsetParent)
  // ── a menu or a panel open: move a highlight between its buttons ──
  function panel(){ const sh=document.getElementById('sheet'), gm=document.getElementById('gm'); if(vis(sh)) return sh; if(vis(gm)) return gm; return null; }
  function buttons(root){ return [...root.querySelectorAll('button,[data-act],a[href]')].filter(b=>vis(b)&&!b.disabled); }
  function setFocus(b){ if(focusEl) focusEl.classList.remove('padfocus'); focusEl=b; if(b){ b.classList.add('padfocus'); try{ b.scrollIntoView({block:'nearest'}); }catch(e){} } }
  function nav(root,dx,dy){ const list=buttons(root); if(!list.length) return; if(!focusEl||!list.includes(focusEl)){ setFocus(list.find(b=>!b.classList.contains('x'))||list[0]); return; }
    const r0=focusEl.getBoundingClientRect(), c0={x:r0.left+r0.width/2,y:r0.top+r0.height/2}; let best=null, bd=1e9;
    list.forEach(b=>{ if(b===focusEl) return; const r=b.getBoundingClientRect(), c={x:r.left+r.width/2,y:r.top+r.height/2}, vx=c.x-c0.x, vy=c.y-c0.y, along=vx*dx+vy*dy; if(along<=4) return;
      const across=Math.abs(vx*dy-vy*dx), d=along+across*2.2; if(d<bd){ bd=d; best=b; } });
    if(best) setFocus(best); }
  // ── the settings sheet ──
  function draw(){ const gp=idx!==null; let h=`<p class="gm-intro">${gp?'🎮 Controller connected.':'Plug in a controller and press any button on it.'} Tap a slot, then press the button you want on the controller. Backspace clears a slot; Esc (or tapping it again) leaves it as it was. Saved on this device only.</p>`+(msg?`<p class="gm-note">${UI.esc(msg)}</p>`:'');
    h+='<div class="gm-sec">Buttons</div>';
    ACTIONS.forEach(a=>{ h+=`<div class="gm-item" style="display:flex;gap:6px;align-items:center;box-sizing:border-box;max-width:100%"><span style="flex:1;min-width:0">${UI.esc(a.label)}</span>`+[0,1].map(i=>{ const on=listen&&listen.id===a.id&&listen.slot===i;
      return `<button class="gm-item ${on?'worn':''}" style="width:62px;flex:none;justify-content:center;margin:0;padding-left:4px;padding-right:4px" data-act="b:${a.id}:${i}">${on?'press…':UI.esc(bname(binds[a.id][i]))}</button>`; }).join('')+'</div>'; });
    h+='<div class="gm-sec">Sticks</div>'
      +`<button class="gm-item ${opt.swap?'worn':''}" data-act="swap"><span>Swap sticks (right walks, left looks)</span><i>${opt.swap?'on':'off'}</i></button>`
      +`<button class="gm-item ${opt.inv?'worn':''}" data-act="inv"><span>Invert looking up and down</span><i>${opt.inv?'on':'off'}</i></button>`
      +`<div class="gm-item" style="display:flex;gap:6px;align-items:center"><span style="flex:1">Look speed</span><button class="gm-item" style="width:44px;justify-content:center;margin:0" data-act="s:-">−</button><b style="width:44px;text-align:center">${opt.sens.toFixed(1)}×</b><button class="gm-item" style="width:44px;justify-content:center;margin:0" data-act="s:+">+</button></div>`
      +`<p class="gm-hint">In menus the ✚ or stick moves, Ⓐ chooses and Ⓑ goes back — those stay put so you can always find your way out.</p>`
      +`<button class="gm-item" data-act="reset"><span>↩ Reset the controller to the defaults</span></button>`;
    UI.sheet({title:'🎮 Controller Controls',html:h,keepScroll:true,act:a=>{
      if(a==='swap'){ opt.swap=!opt.swap; } else if(a==='inv'){ opt.inv=!opt.inv; } else if(a==='s:-'||a==='s:+'){ opt.sens=Math.round(Math.max(0.3,Math.min(2.5,opt.sens+(a==='s:+'?0.1:-0.1)))*10)/10; }
      else if(a==='reset'){ binds=defs(); opt={swap:false,inv:false,sens:1}; listen=null; msg='Controller back to the defaults.'; }
      else { const [,id,i]=a.split(':'); if(listen&&listen.id===id&&listen.slot===+i){ listen=null; msg='Left as it was.'; } else { listen={id,slot:+i,armed:false}; msg=idx===null?'Waiting for a controller — press any button on it.':''; } }
      save(); if(a!=='reset'&&!a.startsWith('b:')) msg=''; draw(); },close:()=>{ open=false; listen=null; }}); open=true; }
  // the keyboard while a slot is waiting: Backspace clears it, Esc leaves it
  addEventListener('keydown',e=>{ if(!listen||e._pad) return; const k=(e.key||'').toLowerCase();
    if(k==='backspace'||k==='delete'){ e.preventDefault(); e.stopImmediatePropagation(); binds[listen.id][listen.slot]=null; listen=null; msg='Slot cleared.'; save(); draw(); }
    else if(k==='escape'){ e.preventDefault(); e.stopImmediatePropagation(); listen=null; msg='Left as it was.'; draw(); } },true);
  function assign(i){ const L=listen; listen=null; let moved='';
    ACTIONS.forEach(a=>{ for(let s=0;s<2;s++) if(binds[a.id][s]===i&&!(a.id===L.id&&s===L.slot)){ binds[a.id][s]=null; moved=a.label; } });
    binds[L.id][L.slot]=i; save(); msg=`${bname(i)} → ${ACTIONS.find(a=>a.id===L.id).label}${moved?` (taken from ${moved})`:''}`; draw(); }
  // ── the poll, every frame ──
  const actPrev={};
  function poll(){ requestAnimationFrame(poll); const pads=navigator.getGamepads?navigator.getGamepads():[]; let gp=idx!==null?pads[idx]:null;
    if(!gp){ for(const p of pads) if(p&&p.connected){ gp=p; idx=p.index; if(open) draw(); break; } } if(!gp){ return; }
    const b=i=>{ const x=gp.buttons[i]; return !!x&&(x.pressed||x.value>0.5); }, was=i=>!!prev[i], down=i=>b(i)&&!was(i);
    // a slot waiting for its button: wait until everything is let go (the Ⓐ that chose the slot), then take the next press
    if(listen){ const any=gp.buttons.some((x,i)=>b(i)); if(!listen.armed){ if(!any) listen.armed=true; } else { for(let i=0;i<gp.buttons.length;i++) if(down(i)){ assign(i); break; } }
      prev=gp.buttons.map(x=>x.pressed||x.value>0.5); return; }
    const on=id=>binds[id].some(i=>i!=null&&b(i)), edge=id=>{ const n=on(id), p=!!actPrev[id]; actPrev[id]=n; return n&&!p?1:!n&&p?-1:0; };
    const E={}; ACTIONS.forEach(a=>E[a.id]=edge(a.id));
    const ax=gp.axes, sL=opt.swap?2:0, sR=opt.swap?0:2, LX=dz(ax[sL]||0,0.18), LY=dz(ax[sL+1]||0,0.18), RX=dz(ax[sR]||0,0.15)*opt.sens, RY=dz(ax[sR+1]||0,0.2)*opt.sens*(opt.inv?-1:1), P=ENGINE.pad;
    const root=panel(), menuOpen=!!root;
    if(menuOpen){ if(P){ P.mx=P.mz=P.lx=P.ly=0; } Object.keys(held).forEach(k=>{ if(held[k]){ release(held[k]); held[k]=null; } }); const t=performance.now();
      let dx=(b(15)?1:0)-(b(14)?1:0), dy=(b(13)?1:0)-(b(12)?1:0); if(!dx&&!dy){ if(Math.abs(LX)>0.5) dx=Math.sign(LX); else if(Math.abs(LY)>0.5) dy=Math.sign(LY); }
      if((dx||dy)&&t-navAt>(navAt&&t-navAt<400?140:220)){ nav(root,dx,dy); navAt=t; } if(!dx&&!dy) navAt=0;
      if(Math.abs(RY)>0.2){ const sc=root.querySelector('#gmPane')||root.querySelector('[id^=sheet]:not(#sheetTitle):not(#sheetClose)')||root; sc.scrollTop+=RY*14; }
      if(down(0)){ if(focusEl&&root.contains(focusEl)) focusEl.click(); else nav(root,0,1); }
      if(down(1)){ setFocus(null); press('escape'); release('escape'); }
      if(E.menu===1){ setFocus(null); press('m'); release('m'); } }
    else { setFocus(null);
      if(P){ P.mx=LX; P.mz=LY; P.lx=RX; P.ly=RY; }
      const say=document.getElementById('say'), talk=document.getElementById('talk'), talking=vis(say), canTalk=vis(talk), custom=!!(ENGINE.level&&ENGINE.level.custom);
      const hold=(id,key)=>{ if(E[id]===1){ held[id]=key; press(key); } if(E[id]===-1&&held[id]){ release(held[id]); held[id]=null; } };
      if(E.act===1){ held.act=(talking||canTalk||custom)?'e':'jump'; press(held.act); } if(E.act===-1&&held.act){ release(held.act); held.act=null; }
      hold('dodge',custom?'shift':'dodge'); hold('strike',' '); hold('talk','e'); hold('guard','shift');
      const tap=(id,key)=>{ if(E[id]===1){ press(key); release(key); } };
      tap('lock','f'); tap('mount','r'); tap('sprint','sprint'); tap('crouch','crouch'); tap('potion','p'); tap('pet','g'); tap('surface','u'); tap('menu','m'); }
    prev=gp.buttons.map(x=>x.pressed||x.value>0.5); }
  requestAnimationFrame(poll);
  return { get connected(){ return idx!==null; }, open:()=>{ msg=''; listen=null; draw(); }, binds:()=>binds };
})();
