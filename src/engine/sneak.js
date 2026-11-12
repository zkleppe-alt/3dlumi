// ════════════════════════════════════════════════════════════════
//  SNEAK (V144) — the demon camps. Out in the wild country, away from the towns and the roads, a few bands of demons have
//  made camp: a fire burned down to embers, bedrolls, a lean-to, and a strongbox of what they've taken from the roads. They
//  sleep (lying by the fire, breathing, the odd "z" drifting up). Creep in crouched and they don't stir unless you brush
//  right past them; walk in standing and the nearest wakes within a few paces, and when one wakes the camp wakes.
//  Open the strongbox: its plunder (gold, a potion). Open it with the whole camp still asleep (or put down one by one
//  without a sound) and you've done it UNSEEN: more XP, the camp's verse — "Be sober, be vigilant" (1 Peter 5:8) — and a
//  line in the journal. A sneak strike on a sleeper does double damage (combat.js), and the rest sleep on only if it falls.
//  Each camp once. SNEAK.attach(world) · SNEAK.wake(campId). State: GAME.S.camps = {id:{done,unseen}}
// ════════════════════════════════════════════════════════════════
const SNEAK=(function(){
  const S=()=>GAME.S, st=()=>{ const s=S(); s.camps=s.camps||{}; return s.camps; };
  let W=null; const camps=[];
  function wake(id){ const c=camps.find(q=>q.id===id); if(!c) return; let any=false; c.foes.forEach(d=>{ if(d.asleep){ d.asleep=false; d.alert=true; any=true; } }); c.woke=true;
    if(any&&typeof UI!=='undefined') UI.toast('👹 The camp wakes!',1500); }
  function attach(world){ W=world; const scene=world.scene, T=world.T, TOWNS=world.towns||[], gAt=(x,z)=>world.ground(x,z);
    const roadNear=(x,y)=>{ for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++){ const t=T(x+dx,y+dy); if(t===2||t===12) return true; } return false; };
    const open=(x,y)=>{ for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++){ const t=T(x+dx,y+dy); if(!world.walkTile(x+dx,y+dy)||!(t===0||t===4||t===16)) return false; } return true; };
    // the sites: open ground, well away from every town and off the roads, spread over the realm
    const cands=[], sites=[]; const W0=world.W, H0=world.H;
    for(let gy=20;gy<H0-20;gy+=37) for(let gx=20;gx<W0-20;gx+=41){
      let found=null; for(let k=0;k<30&&!found;k++){ const x=gx+Math.floor(hsh(gx+k,gy)*30), y=gy+Math.floor(hsh(gy+k,gx)*30); if(x<8||y<8||x>W0-8||y>H0-8) continue;
        if(TOWNS.some(([n,tx,ty])=>Math.hypot(tx-x,ty-y)<34)) continue; if(roadNear(x,y)) continue; if(!open(x,y)) continue; found=[x,y]; }
      if(found) cands.push(found); }
    // spread over the whole realm: each next camp the one furthest from all those already chosen
    if(cands.length){ sites.push(cands[Math.floor(cands.length/2)]); while(sites.length<7&&sites.length<cands.length){ let best=null, bd=-1; for(const q of cands){ if(sites.includes(q)) continue; const m=Math.min(...sites.map(s2=>Math.hypot(s2[0]-q[0],s2[1]-q[1]))); if(m>bd){ bd=m; best=q; } } if(!best) break; sites.push(best); } }
    sites.forEach(([x,y],i)=>{ const id='camp'+i, cx=x+0.5, cz=y+0.5, g=new THREE.Group(); g.position.set(cx,gAt(cx,cz),cz); scene.add(g);
      // the fire, down to embers; stones round it; bedrolls; a lean-to; the strongbox
      for(let k=0;k<9;k++){ const a=k/9*6.28; const s=new THREE.Mesh(new THREE.IcosahedronGeometry(0.14,0),new THREE.MeshLambertMaterial({color:0x5a5650})); s.position.set(Math.cos(a)*0.45,0.07,Math.sin(a)*0.45); g.add(s); }
      const emb=Sp(0.13,glow(0xff5a1a),0,0.04,0,g,8,6); emb.scale.set(1.5,0.4,1.5); for(let k=0;k<4;k++){ const lg=Cy(0.035,0.035,0.42,5,0x2a1a10,0,0.04,0,g); lg.rotation.set(Math.PI/2,k*0.8,0); } const L=new THREE.PointLight(0xff7a3a,0.7,6,1.8); L.position.set(0,0.5,0); g.add(L);
      for(let k=0;k<3;k++){ const a=k*2.1+0.6, br=B(0.55,0.08,1.3,[0x6a3a3a,0x4a4a3a,0x5a3a4a][k],Math.cos(a)*1.6,0.0,Math.sin(a)*1.6,g); br.rotation.y=-a; }
      { const lt=prism(1.6,1.1,1.8,0x5a4a3a); lt.position.set(-2.2,0,0.6); lt.rotation.y=0.5; g.add(lt); }
      const box=new THREE.Group(); box.position.set(1.9,0,-1.1); box.rotation.y=-0.4; g.add(box); B(0.7,0.42,0.48,0x5a3a20,0,0,0,box); B(0.74,0.06,0.52,0xb08a3a,0,0.42,0,box); B(0.06,0.44,0.5,0xb08a3a,-0.2,0,0,box); B(0.06,0.44,0.5,0xb08a3a,0.2,0,0,box);
      const lid=B(0.72,0.1,0.5,0x6a4426,0,0.46,0,box);
      g.traverse(m=>{ if(m.isMesh) m.castShadow=true; });
      const zz=[]; for(let k=0;k<3;k++){ const cv=document.createElement('canvas'); cv.width=cv.height=64; const c2=cv.getContext('2d'); c2.fillStyle='rgba(230,235,255,0.95)'; c2.font='bold 44px Georgia,serif'; c2.textAlign='center'; c2.fillText('z',32,46);
        const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false})); sp.scale.setScalar(0.35); sp.visible=false; scene.add(sp); zz.push({sp,ph:k/3}); }
      const c={id,x:cx,z:cz,g,emb,L,lid,box,zz,foes:[],woke:false,spawned:false};
      const done=()=>st()[id]&&st()[id].done;
      if(done()){ lid.rotation.x=-1.2; lid.position.set(0,0.62,-0.2); }
      // the strongbox
      const bx=cx+Math.cos(-0.4)*1.9+0, bz=cz-1.1;
      const spot={x:cx+1.9,z:cz-1.1,r:1.2,label:'Open',who:'A demon strongbox',action:()=>{ if(done()){ ENGINE.speak('The strongbox',['Empty now. You took back what they stole from the roads.']); return; }
        const unseen=!c.woke&&c.foes.every(d=>!d.alive||d.asleep); const s=S(); const lvl=c.lvl||3, gold=40+lvl*12; s.gold=(s.gold||0)+gold;
        const pot=(typeof SYS!=='undefined'&&SYS.POTIONS)?Object.keys(SYS.POTIONS)[0]:null; if(pot){ s.inventory=s.inventory||{}; s.inventory[pot]=(s.inventory[pot]||0)+1; }
        const xp=unseen?90+lvl*10:30+lvl*4, up=GAME.gainXp?GAME.gainXp(xp):null; st()[id]={done:true,unseen}; GAME.changed(); GAME.save(); ENGINE.hud&&ENGINE.hud();
        lid.rotation.x=-1.2; lid.position.set(0,0.62,-0.2);
        const lines=[`Inside, wrapped in a stolen cloak: ${gold} gold${pot?', and a potion':''} — what they took from the travellers on the roads.`];
        if(unseen) lines.push('They never stirred. You lift the lid and are gone before the embers settle.','“Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about, seeking whom he may devour.” — 1 Peter 5:8');
        ENGINE.speak(unseen?'Unseen':'The strongbox',lines,null,()=>{ UI.toast(`${unseen?'🌙 Unseen! ':''}+${gold} gold · +${xp} XP${up&&up.up?' · LEVEL UP!':''}`,2600);
          if(typeof JOURNAL!=='undefined') JOURNAL.write(unseen?'I crept through a sleeping demon camp in the dark and took back what they had stolen from the roads. Not one of them woke. Be sober, be vigilant.':'I broke open a demon camp and took back the plunder they had stolen from the travellers.',{}); });
        if(typeof LIBRARY!=='undefined'&&unseen&&LIBRARY.codexAdd) LIBRARY.codexAdd('The camps','1 Peter 5:8','Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about, seeking whom he may devour.'); }};
      world.spots.push(spot); c.spot=spot; camps.push(c); });
    // spawning the sleepers as you come near, the embers and the drifting z's
    world.anim.push(t=>{ if(ENGINE.level!==world||!world.combat) return; const P=ENGINE.P;
      for(const c of camps){ const d=Math.hypot(c.x-P.x,c.z-P.z), done=st()[c.id]&&st()[c.id].done;
        if(!c.spawned&&!done&&d<42){ c.spawned=true; const zs=world.zone?String(world.zone({x:c.x,z:c.z})||''):''; const m=zs.match(/Lv (\d+)/); c.lvl=m?+m[1]:4; const n=3+(hsh(c.x|0,c.z|0)<0.5?1:0);
          for(let k=0;k<n;k++){ const a=k/n*6.28+0.6, x=c.x+Math.cos(a)*1.6, z=c.z+Math.sin(a)*1.6;
            const f=COMBAT.foe(world,{x,z,hp:6+c.lvl*3,level:c.lvl,xp:6+c.lvl*2,form:k%3}); if(!f) continue; f.asleep=true; f.camp=c.id; f.face=-a+Math.PI/2; c.foes.push(f); } }
        c.L.intensity=0.6+0.15*Math.sin(t*7+c.x)+0.1*Math.sin(t*13);
        const sl=c.foes.filter(f=>f.alive&&f.asleep);
        c.zz.forEach((z,i)=>{ const f=sl[i%Math.max(1,sl.length)]; z.sp.visible=!!f&&d<30; if(!f) return; const u=((t*0.35+z.ph+i*0.13)%1); z.sp.position.set(f.x+0.2+u*0.3,world.ground(f.x,f.z)+0.7+u*1.1,f.z); z.sp.material.opacity=Math.sin(u*Math.PI); z.sp.scale.setScalar(0.22+u*0.25); });
        // all of a camp put down: it's quiet now
        if(c.spawned&&c.foes.length&&c.foes.every(f=>!f.alive)&&!c.cleared){ c.cleared=true; if(!c.woke&&typeof UI!=='undefined') UI.toast('🌙 Not one of them woke. The strongbox is yours.',2200); } } });
    return {camps};
  }
  return {attach,wake,get camps(){ return camps; }};
})();
