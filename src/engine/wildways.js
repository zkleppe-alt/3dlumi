// ════════════════════════════════════════════════════════════════
//  WILDWAYS (V222) — hidden islets out in the realm (tools/villages.py WILDWAYS → WORLD_DATA.wildways):
//   · logs: a great mossy log laid across the water (a treetops stone bridge underneath, drawn here as the log)
//   · hops: stepping stones standing in deep water — jump from one to the next; their rims are worn pale. Come up short
//     facing the next stone and you catch its rim and pull up; fall in, and you scramble back to the last dry footing.
//   · nooks: on each islet a standing stone with a verse cut in it, a mossy place to sit, and an old chest with a keepsake.
//  WILDWAYS.attach(world, WD) — after TREETOPS.
// ════════════════════════════════════════════════════════════════
const WILDWAYS=(function(){
  function attach(world,WD){ const D=WD.wildways; if(!D) return; const scene=world.scene, P=ENGINE.P;
    const MOSS=0x5f8f3a, MOSS2=0x7aa848, PALE=0xe6e0d0, S=()=>{ const s=GAME.S; s.wildNooks=s.wildNooks||{}; return s.wildNooks; };
    const G0=world.ground, M0=world.canMove, key=(x,y)=>x+','+y;
    // ── the logs ──
    (D.logs||[]).forEach(L=>{ const ax=L.a[0]+0.5, az=L.a[1]+0.5, bx=L.b[0]+0.5, bz=L.b[1]+0.5, ya=G0(ax,az), yb=G0(bx,bz), len=Math.hypot(bx-ax,bz-az)+1.1, g=group((ax+bx)/2,0,(az+bz)/2,scene);
      g.rotation.y=Math.atan2(-(bz-az),bx-ax); const y=(ya+yb)/2-0.2;
      const lg=Cy(0.42,0.5,len,12,0x4e3a26,0,0,0,g); lg.rotation.z=Math.PI/2; lg.position.set(0,y,0);
      const top=B(len*0.9,0.07,0.62,MOSS,0,y+0.38,0,g); for(let i=0;i<9;i++){ const tu=B(0.2,0.07,0.2,i%2?MOSS2:MOSS,(i/8-0.5)*len*0.85,y+0.42,(Math.sin(i*2.3))*0.18,g); tu.rotation.y=i; }
      [-1,1].forEach(sd=>{ const st=Cy(0.32,0.36,0.5,8,0x3e2e1e,sd*len/2,y-0.25,0,g); st.rotation.z=Math.PI/2; const rt=Cy(0.05,0.09,0.7,5,0x3e2e1e,sd*(len/2-0.1),y-0.5,0.3,g); rt.rotation.set(0.6,0,sd*0.8); });
      shade(g); });
    // ── the stepping stones ──
    const GAP=new Map(), STONE=new Set(); (D.hops||[]).forEach(h=>{ h.gaps.forEach(([x,y])=>GAP.set(key(x,y),h)); h.stones.forEach(([x,y])=>{ STONE.add(key(x,y)); const g=group(x+0.5,0,y+0.5,scene), gy=G0(x+0.5,y+0.5);
        const st=Cy(0.5,0.62,3.0,8,0x6e6a62,0,gy-3.0,0,g); st.rotation.y=(x*7+y)%6; B(0.92,0.06,0.92,0x76806a,0,gy-0.04,0,g); if((x+y)%2) B(0.34,0.05,0.28,MOSS,0.15,gy+0.0,-0.1,g);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{ if(GAP.has(key(x+a,y+b))||h.gaps.some(q=>q[0]===x+a&&q[1]===y+b)) B(a?0.08:0.86,0.04,a?0.86:0.08,PALE,a*0.44,gy+0.01,b*0.44,g); }); shade(g); }); });
    // pale rims on the banks where a jump begins
    (D.hops||[]).forEach(h=>h.gaps.forEach(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{ const X=x+a, Y=y+b; if(STONE.has(key(X,Y))||GAP.has(key(X,Y))) return; if(!world.WK||!world.WK(X,Y)) return; const gy=G0(X+0.5,Y+0.5); B(a?0.08:0.86,0.04,a?0.86:0.08,PALE,X+0.5-a*0.44,gy+0.01,Y+0.5-b*0.44,scene); })));
    const air=()=>ENGINE.airH||0, me=(x,z)=>x===P.x&&z===P.z;
    world.ground=(x,z)=>{ const h=GAP.get(key(Math.floor(x),Math.floor(z))); if(h&&(air()>0.01||me(x,z))) return G0(h.stones[0][0]+0.5,h.stones[0][1]+0.5); return G0(x,z); };   // over the water mid-jump you keep the stones' height
    world.canMove=(fx,fz,tx,tz)=>{ const k=key(Math.floor(tx),Math.floor(tz)); if(GAP.has(k)) return air()>0.04; return M0(fx,fz,tx,tz); };
    let safe=null; world.anim.push(()=>{ if(ENGINE.level!==world) return; const k=key(Math.floor(P.x),Math.floor(P.z));
      if(GAP.has(k)){ if(air()<0.03){ const fx=Math.sin(P.face), fz=Math.cos(P.face), ax=P.x+fx*0.75, az=P.z+fz*0.75, ka=key(Math.floor(ax),Math.floor(az));
          if(!GAP.has(ka)&&M0(P.x,P.z,ax,az)){ P.x=Math.floor(ax)+0.5-fx*0.3; P.z=Math.floor(az)+0.5-fz*0.3; ENGINE.hold(0.35); if(typeof SFX!=='undefined') try{ SFX.play('step'); }catch(e){} }   // short — catch the rim and pull up
          else if(safe){ P.x=safe[0]; P.z=safe[1]; ENGINE.hold(0.7); UI.toast('🌊 Splash — you haul yourself back onto the stones.',1800); if(typeof SFX!=='undefined') try{ SFX.play('splash'); }catch(e){} } } }
      else if(air()<0.03) safe=[P.x,P.z]; });
    // ── the nooks ──
    (D.nooks||[]).forEach((N,ni)=>{ const id=N.name.replace(/\W+/g,''), at=(p,dx,dz)=>[p[0]+0.5+(dx||0),p[1]+0.5+(dz||0)], gy=(x,z)=>G0(x,z);
      { const [x,z]=at(N.stone), g=group(x,gy(x,z),z,scene); const sl=B(0.78,1.35,0.24,0x8d8a82,0,0,0,g); sl.rotation.x=-0.06; B(0.84,0.12,0.3,0x7a776f,0,1.33,0,g); B(0.9,0.14,0.36,0x6f6c66,0,0,0,g); for(let i=0;i<5;i++) B(0.5-(i%2)*0.12,0.03,0.02,0x55524c,0,0.42+i*0.17,0.125,g); B(0.5,0.3,0.3,MOSS,-0.2,0,0.02,g); shade(g); }
      { const [x,z]=at(N.seat), g=group(x,gy(x,z),z,scene); const st=Cy(0.44,0.5,0.42,8,0x8a867c,0,0,0,g); st.scale.z=0.8; B(0.6,0.04,0.45,MOSS,0.05,0.42,0,g); shade(g); }
      let lid=null; { const [x,z]=at(N.chest), g=group(x,gy(x,z),z,scene); B(0.62,0.34,0.42,0x6a4526,0,0,0,g); lid=Cy(0.21,0.21,0.62,8,0x7a5230,0,0,0,g); lid.rotation.z=Math.PI/2; lid.position.set(0,0.34,0); [-0.24,0.24].forEach(q=>B(0.05,0.36,0.44,0xc8a050,q,0,0,g)); B(0.1,0.1,0.04,0xe8c766,0,0.22,0.22,g); shade(g); }
      const mx=(N.stone[0]+N.seat[0]+N.chest[0])/3+0.5, mz=(N.stone[1]+N.seat[1]+N.chest[1])/3+0.5, my=gy(mx,mz);
      for(let i=0;i<16;i++){ const a=i*2.39, r=0.7+(i%5)*0.5, fx=mx+Math.cos(a)*r, fz=mz+Math.sin(a)*r; if(world.WK&&!world.WK(Math.floor(fx),Math.floor(fz))) continue; const fy=gy(fx,fz); Cy(0.012,0.012,0.22,4,0x4a7a34,fx,fy,fz,scene); const fl=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),mt([0xfff4f0,0xf2c14e,0xc8a0e8][i%3])); fl.position.set(fx,fy+0.24,fz); scene.add(fl); }
      const beam=new THREE.Mesh(new THREE.ConeGeometry(2.0,6,10,1,true),new THREE.MeshBasicMaterial({color:0xfff2c4,transparent:true,opacity:0.06,depthWrite:false,side:THREE.DoubleSide,fog:false})); beam.position.set(mx,my+3,mz); scene.add(beam);
      world.spots.push({x:N.stone[0]+0.5,z:N.stone[1]+1.2,r:1.4,label:'Read',who:'A standing stone',action:()=>ENGINE.speak('A standing stone',['“'+N.verse+'”','— '+N.ref+', cut deep, the letters soft with moss.'],null,()=>{ const s=S(); if(!s[id+'V']){ s[id+'V']=1; GAME.save(); if(typeof JOURNAL!=='undefined') JOURNAL.write('On '+N.name+' I found a standing stone: “'+N.verse+'” — '+N.ref,{}); } })});
      let resting=0; world.spots.push({x:N.seat[0]+0.5,z:N.seat[1]+0.5,r:1.3,label:'Rest',who:'A mossy stone',action:()=>{ if(resting) return; resting=1; P.x=N.seat[0]+0.5; P.z=N.seat[1]+1.05; P.face=Math.atan2(mx-P.x,mz-P.z); if(ENGINE.K.sheathe) ENGINE.K.sheathe(); ENGINE.hold(5,'sit'); UI.toast('🌿 You sit a while, with the water all round you.',2400);
        setTimeout(()=>{ resting=0; const S0=GAME.S; S0.hp=S0.maxHp; ENGINE.hud(); const s=S(), first=!s[id+'Q']; s[id+'Q']=1; GAME.save(); ENGINE.speak('A quiet place',['The water talks quietly round the stones. Nobody knows you are here but God.','(Rested: your strength is full.'+((typeof LYREBOOK!=='undefined'&&LYREBOOK.owned())?' A good place for the lyre — 🎵.)':')')]); if(first&&typeof JOURNAL!=='undefined') JOURNAL.write('I rested on '+N.name+'.',{}); },5000); }});
      world.spots.push({x:N.chest[0]+0.5,z:N.chest[1]+1.0,r:1.3,label:'Open',who:'An old chest',hide:()=>!!S()[id+'K'],action:()=>{ const s=S(); if(s[id+'K']) return; s[id+'K']=1; const g=Math.round((120+ni*20)*(GAME.S.goldMult||1)); GAME.addGold(g); GAME.save(); if(lid) lid.rotation.x=-1.1; if(typeof SFX!=='undefined') try{ SFX.play('chest'); }catch(e){}
        ENGINE.speak('An old chest',['📦 '+g+' gold!','And under the coins, '+N.keep+'.']); if(typeof JOURNAL!=='undefined') JOURNAL.write('In a chest on '+N.name+': '+N.keep+'.',{}); }});
      if(S()[id+'K']&&lid) lid.rotation.x=-1.1; });
  }
  return {attach};
})();
