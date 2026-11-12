// ════════════════════════════════════════════════════════════════
//  LIFE (V111, LOOK2) — the villages and the open country breathing: smoke curling up from every chimney (dark and thick
//  from the forge), birds wheeling high over the land by day, butterflies about the meadows, fireflies in the dusk, and
//  every window in the realm going from daylight glass to warm lamplight as evening falls.
//  LIFE.WINLIT is the one material all the new windows share; LIFE.attach(lv,scene,smokes) runs the rest.
// ════════════════════════════════════════════════════════════════
const LIFE=(function(){
  const WINLIT=new THREE.MeshBasicMaterial({color:0xf2d27a}), DAYG=new THREE.Color(0x8a9cac), WARM=new THREE.Color(0xffd27a);
  let tex=null; function puffTex(){ if(tex) return tex; const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), g=x.createRadialGradient(32,32,2,32,32,30);
    g.addColorStop(0,'rgba(255,255,255,0.9)'); g.addColorStop(0.45,'rgba(255,255,255,0.45)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); tex=new THREE.CanvasTexture(c); return tex; }
  const clamp=v=>Math.max(0,Math.min(1,v)), rnd=Math.random;
  function bird(col){ const b=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:col});
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6),m); body.scale.set(2.2,0.7,0.8); b.add(body); const hd=new THREE.Mesh(new THREE.SphereGeometry(0.045,6,5),m); hd.position.set(0.15,0.03,0); b.add(hd);
    const wings=[-1,1].map(sd=>{ const p=new THREE.Group(); p.position.set(0,0.02,sd*0.03); const w=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.012,0.34),m); w.position.set(-0.01,0,sd*0.17); p.add(w); b.add(p); return p; });
    const tl=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.01,0.1),m); tl.position.set(-0.18,0,0); b.add(tl); b.userData.wings=wings; return b; }
  function butterfly(col){ const b=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}), mk=new THREE.MeshLambertMaterial({color:0x2a2420});
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.12,5),mk); body.rotation.z=Math.PI/2; b.add(body);
    const wings=[-1,1].map(sd=>{ const p=new THREE.Group(); const w=new THREE.Mesh(new THREE.CircleGeometry(0.075,8),m); w.rotation.x=Math.PI/2; w.position.set(0.02,0,sd*0.07); w.scale.set(1,1.15,1); p.add(w);
      const w2=new THREE.Mesh(new THREE.CircleGeometry(0.05,8),m); w2.rotation.x=Math.PI/2; w2.position.set(-0.05,0,sd*0.05); p.add(w2); b.add(p); return p; }); b.userData.wings=wings; return b; }
  function attach(lv,scene,smokes){ const grp=new THREE.Group(); scene.add(grp);
    // ── smoke: a pool of soft puffs, given out to the chimneys near you ──
    const pool=[]; for(let i=0;i<90;i++){ const m=new THREE.SpriteMaterial({map:puffTex(),transparent:true,depthWrite:false,opacity:0,color:0xe8e4dc,fog:true}); const s=new THREE.Sprite(m); s.visible=false; grp.add(s); pool.push({s,m,age:0,life:0,vx:0}); }
    let pi=0; const emit=(c)=>{ const p=pool[pi=(pi+1)%pool.length]; p.age=0; p.life=c.dark?4.6:3.8+rnd()*1.2; p.vx=0.12+rnd()*0.1; p.dark=c.dark; p.s.position.set(c.x+(rnd()-0.5)*0.1,c.y,c.z+(rnd()-0.5)*0.1); p.m.color.setHex(c.dark?0x4e4a48:0xc8c4bc); p.s.visible=true; };
    // ── birds: a few flocks that migrate across the whole land in a V, from one far place to the next (V118) —
    //    they keep to their own way, so you see one pass over now and then rather than birds circling wherever you stand ──
    const LW=lv.W||200, LH=lv.H||200, way=()=>[8+rnd()*(LW-16),8+rnd()*(LH-16)];
    const flocks=[0,1,2,3,4].map(k=>{ const birds=[], n=5+((k*3)%5); for(let i=0;i<n;i++){ const b=bird([0x3a3a44,0x4a4038,0x2e3038,0x3e3a34,0x34383e][k]); b.scale.setScalar(1.5); grp.add(b); birds.push({b,hy:rnd()*0.6,fl:rnd()*6,ph:rnd()*6.28}); }
      const [x,z]=way(); return {birds,x,z,to:way(),hd:rnd()*6.28,sp:3.2+rnd()*1.4,h:8+k*1.1}; });
    // ── butterflies by day, fireflies by night ──
    const BCOL=[0xf2c14e,0xf4f0ea,0xe87a3a,0x8ab0f0,0xe86aa8,0xf2e06a];
    const flies=BCOL.concat(BCOL).slice(0,9).map((c,i)=>{ const b=butterfly(c); grp.add(b); return {b,hx:0,hz:0,ph:rnd()*6.28,set:false}; });
    const ffMat=new THREE.SpriteMaterial({map:puffTex(),color:0xd8ff8a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const fire=[]; for(let i=0;i<18;i++){ const s=new THREE.Sprite(ffMat.clone()); s.scale.setScalar(0.22); grp.add(s); fire.push({s,hx:0,hz:0,ph:rnd()*6.28,set:false}); }
    const BARE=new Set(['dusthaven','crystalpeak','hellgate','ashfield']);
    lv.anim.push((t,dt)=>{ if(ENGINE.level!==lv) return; dt=Math.min(dt||0.016,0.05); const P=ENGINE.P, st=typeof DAYNIGHT!=='undefined'?DAYNIGHT.state():{night:0,dusk:0,dawn:0};
      const nk=clamp(st.night+0.75*(st.dusk||0)+0.4*(st.dawn||0)); WINLIT.color.copy(DAYG).lerp(WARM,nk);
      const G=(x,z)=>lv.ground?lv.ground(x,z):0, reg=lv.region?lv.region(P.x,P.z):'', bare=BARE.has(reg);
      // smoke
      for(const c of smokes){ const d=Math.abs(c.x-P.x)+Math.abs(c.z-P.z); if(d>42) continue; c.t=(c.t||0)-dt; if(c.t<=0){ emit(c); c.t=(c.dark?0.28:0.55)+rnd()*0.35; } }
      for(const p of pool){ if(!p.s.visible) continue; p.age+=dt; if(p.age>=p.life){ p.s.visible=false; continue; } const f=p.age/p.life;
        p.s.position.y+=dt*(p.dark?0.75:0.55)*(1-f*0.4); p.s.position.x+=dt*p.vx; p.s.position.z+=dt*Math.sin(t*0.7+p.vx*40)*0.06;
        p.s.scale.setScalar((p.dark?0.6:0.45)+f*(p.dark?2.0:1.6)); p.m.opacity=(p.dark?0.75:0.62)*(1-f*f)*Math.min(1,p.age/0.3); }
      // birds (by day)
      const day=nk<0.55; flocks.forEach((F,k)=>{
        // fly on toward the next far place, turning gently; a new one when it is reached
        if(Math.hypot(F.to[0]-F.x,F.to[1]-F.z)<6) F.to=way();
        let want=Math.atan2(F.to[1]-F.z,F.to[0]-F.x)-F.hd; want=Math.atan2(Math.sin(want),Math.cos(want)); F.hd+=Math.max(-0.35*dt,Math.min(0.35*dt,want));
        F.x+=Math.cos(F.hd)*F.sp*dt; F.z+=Math.sin(F.hd)*F.sp*dt;
        const near=day&&Math.hypot(F.x-P.x,F.z-P.z)<80, gy=near?G(F.x,F.z):0, cx=Math.cos(F.hd), cz=Math.sin(F.hd);
        F.birds.forEach((B,i)=>{ B.b.visible=near; if(!near) return;
          const row=Math.ceil(i/2), side=i===0?0:(i%2?1:-1), back=row*1.3, wide=row*1.1*side;   // the V: a leader, the rest trailing out to each side
          const x=F.x-cx*back-cz*wide+Math.sin(t*0.9+B.ph)*0.15, z=F.z-cz*back+cx*wide+Math.cos(t*0.8+B.ph)*0.15;
          B.b.position.set(x,Math.max(gy,0)+F.h+B.hy+Math.sin(t*0.6+B.ph)*0.25,z); B.b.rotation.y=-F.hd;
          const glide=Math.sin(t*0.5+B.fl)>0.2, fl=glide?0.1:Math.sin(t*9+B.fl)*0.7; B.b.userData.wings[0].rotation.x=-fl; B.b.userData.wings[1].rotation.x=fl; B.b.rotation.z=0; }); });
      // butterflies (by day, on the green)
      flies.forEach((F,i)=>{ const on=day&&!bare; F.b.visible=on; if(!on) return; if(!F.set||Math.hypot(F.hx-P.x,F.hz-P.z)>13){ const a=rnd()*6.28, r=2.5+rnd()*6; F.hx=P.x+Math.cos(a)*r; F.hz=P.z+Math.sin(a)*r; F.set=true; }
        const x=F.hx+Math.sin(t*0.7+F.ph)*1.3+Math.sin(t*2.3+F.ph)*0.2, z=F.hz+Math.cos(t*0.55+F.ph)*1.3, y=G(x,z)+0.55+Math.abs(Math.sin(t*1.7+F.ph))*0.5;
        F.b.position.set(x,y,z); F.b.rotation.y=Math.atan2(Math.sin(t*0.55+F.ph)*0.7,Math.cos(t*0.7+F.ph)*0.9); const fl=0.15+Math.abs(Math.sin(t*18+F.ph))*1.1; F.b.userData.wings[0].rotation.x=-fl; F.b.userData.wings[1].rotation.x=fl; });
      // fireflies (from dusk, away from the snow and the sand)
      fire.forEach((F,i)=>{ const on=nk>0.45&&!bare; F.s.visible=on; if(!on) return; if(!F.set||Math.hypot(F.hx-P.x,F.hz-P.z)>12){ const a=rnd()*6.28, r=2+rnd()*8; F.hx=P.x+Math.cos(a)*r; F.hz=P.z+Math.sin(a)*r; F.set=true; }
        const x=F.hx+Math.sin(t*0.4+F.ph)*0.9, z=F.hz+Math.cos(t*0.33+F.ph)*0.9; F.s.position.set(x,G(x,z)+0.5+Math.sin(t*0.8+F.ph)*0.35,z); F.s.material.opacity=Math.max(0,Math.sin(t*1.6+F.ph*3))*0.9*nk; }); });
    return grp; }
  return {WINLIT,attach};
})();
