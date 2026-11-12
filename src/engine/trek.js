// ════════════════════════════════════════════════════════════════
//  THE PILGRIM'S PASS (V121) — open world, step C: the road from Shadowmere to Hellgate is a mountain trek, as the
//   Northern Reach's trail is. world.js raises the crags about the trail (STRETCH.trek.samples, from tools/stretch.py);
//   this puts the places along it:
//    · a waystone at the foot, cut with Psalm 121 ("I will lift up mine eyes unto the hills")
//    · the high camp, halfway up: a fire, a tent, logs — rest there and you rise mended, an hour on
//    · the pass itself: a ruined watchtower on the shoulder and an overlook — the whole realm below, Hellgate ahead
//    · a waystone on the way down, cut with Psalm 23:4, as the valley darkens toward Hellgate
//    · lamps along the trail, and a carved sign at each end
//  TREK.attach(world). State: GAME.S.trek = {saw:{}}.
// ════════════════════════════════════════════════════════════════
const TREK=(function(){
  const S=()=>GAME.S, st=()=>{ const s=S(); s.trek=s.trek||{saw:{}}; s.trek.saw=s.trek.saw||{}; return s.trek; };
  const jw=(t,o)=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(t,o); };
  function attach(world){
    const T=world.trek; if(!T||!T.samples||!T.samples.length) return null;
    const SM=T.samples, N=SM.length, scene=world.scene, gAt=(x,z)=>world.ground(x,z);
    // a point a fraction u of the way up from Shadowmere (the samples run from Shadowmere north to Hellgate), its
    // direction of travel and the normal to it
    const at=u=>{ const i=Math.max(0,Math.min(N-2,Math.round(u*(N-1)))), p=SM[i], q=SM[i+1], dx=q[0]-p[0], dz=q[1]-p[1], l=Math.hypot(dx,dz)||1;
      return {x:p[0],z:p[1],h:p[2],fx:dx/l,fz:dz/l,nx:-dz/l,nz:dx/l,fwd:Math.atan2(dx/l,dz/l)}; };
    let top=0; SM.forEach((p,i)=>{ if(p[2]>SM[top][2]) top=i; }); const uTop=top/(N-1);
    const name=STRETCH.trek.name||'The Pilgrim’s Pass';
    const stone=(u,sd,ref,txt)=>{ const p=at(u), x=p.x+p.nx*2.1*sd, z=p.z+p.nz*2.1*sd, g=group(x,gAt(x,z)-0.1,z,scene); g.rotation.y=p.fwd+(sd>0?-Math.PI/2:Math.PI/2);
      B(0.7,1.3,0.32,0x8a8478,0,0,0,g); B(0.8,0.12,0.4,0x7a7468,0,1.3,0,g); const sp=Sp(0.18,0x8a8478,0,1.45,0,g,8,6); sp.scale.y=0.6; B(0.5,0.05,0.02,0x5a5448,0,0.85,0.17,g); B(0.05,0.4,0.02,0x5a5448,0,0.65,0.17,g);
      world.spots.push({x:p.x+p.nx*1.0*sd,z:p.z+p.nz*1.0*sd,r:1.2,label:'Read',who:'A waystone',lines:[`Cut into the stone: “${txt}” — ${ref}`]}); };
    const sign=(u,sd,txt,sub)=>{ const p=at(u), x=p.x+p.nx*1.9*sd, z=p.z+p.nz*1.9*sd, g=group(x,gAt(x,z),z,scene); g.rotation.y=p.fwd+Math.PI;
      Cy(0.07,0.08,1.9,6,0x5a3c22,-0.6,0,0,g); Cy(0.07,0.08,1.9,6,0x5a3c22,0.6,0,0,g);
      const cv=document.createElement('canvas'); cv.width=512; cv.height=160; const c=cv.getContext('2d'); c.fillStyle='#6a4a2a'; c.fillRect(0,0,512,160); c.strokeStyle='#e8c46a'; c.lineWidth=5; c.strokeRect(8,8,496,144);
      c.fillStyle='#f4e6c0'; c.textAlign='center'; c.font='bold 50px Georgia,serif'; c.fillText(txt,256,74); c.font='italic 30px Georgia,serif'; c.fillText(sub,256,122);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.5),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide})); m.position.set(0,1.55,0); g.add(m); };
    // the signs at each end
    sign(0.02,1,name.toUpperCase(),'over the mountains to Hellgate'); sign(0.985,-1,name.toUpperCase(),'down to Shadowmere');
    // lamps up the trail
    for(let u=0.05;u<0.97;u+=0.045){ const p=at(u), sd=(Math.round(u*44)%2)?1:-1, x=p.x+p.nx*1.7*sd, z=p.z+p.nz*1.7*sd, g=group(x,gAt(x,z),z,scene); Cy(0.05,0.07,1.6,6,0x2e2a26,0,0,0,g);
      const L=B(0.18,0.24,0.18,glow(0xffd27a),0,1.3,0,g); B(0.24,0.05,0.24,0x2e2a26,0,1.55,0,g); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(L,1.5); }
    stone(0.06,-1,'Psalm 121:1–2','I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.');
    stone(Math.min(0.95,uTop+0.28),1,'Psalm 23:4','Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.');
    // ── the high camp, halfway up ──
    { const p=at(uTop*0.55), x=p.x+p.nx*2.6, z=p.z+p.nz*2.6, c=group(x,gAt(x,z),z,scene);
      for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, s=new THREE.Mesh(new THREE.IcosahedronGeometry(0.16,0),new THREE.MeshLambertMaterial({color:0x6a6a64})); s.position.set(Math.cos(a)*0.5,0.08,Math.sin(a)*0.5); c.add(s); }
      for(let i=0;i<4;i++){ const l=Cy(0.06,0.06,0.7,6,0x5a3c22,0,0.08,0,c); l.rotation.z=Math.PI/2; l.rotation.y=i*0.8; }
      const fl=[0,1,2].map(i=>Co(0.2-i*0.05,0.5-i*0.1,6,glow([0xff7a2a,0xffb03a,0xffe08a][i]),0,0.12,0,c)); const L=new THREE.PointLight(0xffa050,1.0,9,1.6); L.position.set(0,0.8,0); c.add(L);
      world.anim.push(t=>{ fl.forEach((f,i)=>{ f.scale.set(1,1+Math.sin(t*9+i*2)*0.2,1); f.rotation.y=t*(1+i); }); L.intensity=0.9+Math.sin(t*11)*0.1; });
      const tt=group(1.9,0,-1.3,c); const tent=prism(1.8,1.3,2.0,0x8a6a4a); tent.rotation.y=0.4; tt.add(tent); B(0.06,1.4,0.06,0x5a3c22,0,0,0,tt);
      [[-1.4,0.4,0.4],[1.2,0.9,-0.5]].forEach(([a,b,r])=>{ const l=Cy(0.18,0.2,1.3,8,0x6a4a2a,a,0.18,b,c); l.rotation.set(0,r,Math.PI/2); });
      c.traverse(m=>{ if(m.isMesh) m.castShadow=true; });
      world.spots.push({x,z:z+1.2,r:1.4,label:'Rest',who:'The high camp',action:()=>{ const P=ENGINE.P, lv=world;
        if(lv.combat&&lv.combat.foes.some(d=>d.alive&&Math.hypot(d.x-P.x,d.z-P.z)<8)){ UI.toast('⚔ Not with demons so close.',1600); return; }
        const s=S(); s.hp=s.maxHp; s.dayFrac=(s.dayFrac||0)+1/24; s.wxWarm=(s.wxN||0)+1;   /* V134: warmed through for this watch and the next */ ENGINE.hud&&ENGINE.hud(); GAME.changed(); GAME.save();
        ENGINE.speak('The high camp',['You sit by the fire with your back to the rock. Below, Shadowmere’s mists; above, the pass, white against the sky. An hour passes; you rise mended.']);
        if(!st().saw.camp){ st().saw.camp=true; jw(`I made camp halfway up ${name}, the fire small against the mountain. The trail goes on up into the snow.`,{place:name}); } }}); }
    // ── the pass: the ruined watchtower and the overlook ──
    { const p=at(uTop), tx=p.x+p.nx*3.4, tz=p.z+p.nz*3.4, g=group(tx,gAt(tx,tz)-0.2,tz,scene), sc=[0x8a8578,0x7e7a6c,0x96907f,0x74706a];
      for(let r=0;r<9;r++){ const n=12, full=r<4?n:n-((r-3)*2); for(let i=0;i<full;i++){ const a=i/n*Math.PI*2+(r%2)*0.26; if(r>=4&&Math.sin(a*1.3+r)>0.55) continue; const s=B(0.62,0.42,0.42,sc[(i+r)%4],Math.cos(a)*1.35,r*0.42,Math.sin(a)*1.35,g); s.rotation.y=-a; } }
      for(let i=0;i<7;i++){ const s=B(0.5+hsh(i,3)*0.3,0.3,0.4,sc[i%4],2.2+hsh(i,7)*1.4,0.1,-0.8+hsh(3,i)*2.2,g); s.rotation.y=hsh(i,9)*3; }   // fallen stones
      const door=B(0.7,1.2,0.5,0x2a2622,0,0.6,1.3,g); door.rotation.y=0;
      g.traverse(m=>{ if(m.isMesh) m.castShadow=true; });
      world.spots.push({x:tx-p.nx*1.6,z:tz-p.nz*1.6,r:1.3,label:'Look',who:'The old watchtower',lines:['A watchtower from the old days, roofless now. Someone kept a fire here once to warn the valleys; the hearth is cold, but the stones still take the wind off you.','Scratched by the doorway, fresh: a cross, and three words — “He is risen.”']});
      const ox=p.x-p.nx*2.4, oz=p.z-p.nz*2.4;
      world.spots.push({x:ox,z:oz,r:1.6,label:'Look',who:'The top of the pass',action:()=>{ const first=!st().saw.pass; st().saw.pass=true;
        ENGINE.speak(name,['You stand at the top of the pass. Behind you, far below, Shadowmere’s mere and the long green realm beyond it, all the way to the sea. Ahead the trail drops into the dark valley, and Hellgate’s towers.',
          '“I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.” — Psalm 121:1–2'],null,()=>{
          if(first){ const x=GAME.gainXp(120); UI.toast(`⛰ You crossed ${name} — +120 XP${x&&x.up?' · LEVEL UP!':''}`,3000); jw(`I stood at the top of ${name}. The whole realm lay behind me in the sun, and Hellgate ahead in the shadow of the crags. My help cometh from the LORD.`,{place:name}); } }); }}); }
    // naming the place as you walk it
    const zone0=world.zone; world.zone=p=>{ const z=zone0?zone0(p):null; const b=T.box; if(p.x>=b[0]&&p.x<=b[2]&&p.z>=b[1]+6&&p.z<=b[3]-6) return '⛰ '+name; return z; };
    return {at,uTop};
  }
  return {attach};
})();
