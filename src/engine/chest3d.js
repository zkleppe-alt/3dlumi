// ════════════════════════════════════════════════════════════════
//  CHEST3D (V165) — one treasure chest for every dungeon, cave and chapel.
//   A real box you can see into: planked oak sides with iron corner straps and bands, a gilt lock plate and hasp, a
//   rounded barrel lid hinged at the back, and inside a red-velvet lining with a heap of coin and a gem. Opening it
//   swings the lid back (a little bounce on the hinge), lets out a warm light and a puff of gold motes, and plays the
//   chest's own sound — the creak of the hinge, the latch, and a bright chime. Once looted it stays open and empty.
//   CHEST3D.make(parent, x, z, {great, face}) → the handle (the lid's group: set .rotation.x as before, or use these)
//   CHEST3D.open(handle)  — the animated opening (sound, light, motes)
//   CHEST3D.set(handle, open) — at once, as a level is (re)entered: open and empty, or shut
// ════════════════════════════════════════════════════════════════
const CHEST3D=(function(){
  const OPEN=-1.95, dk=(h,f)=>new THREE.Color(h).multiplyScalar(f).getHex();
  const glowM=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending});
  function halfDrum(r,len,col,par,y,z,sy){ const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,14,1,false,0,Math.PI),mt(col)); m.rotation.z=Math.PI/2; m.position.set(0,y,z); m.scale.set(1,1,sy); par.add(m); return m; }
  function make(par,x,z,o){ o=o||{}; const great=!!o.great, k=great?1.25:1;
    const W=0.78*k, H=0.4*k, D=0.52*k, T=0.045*k;
    const wood=great?0x4a2e52:0x7a4a26, wood2=great?0x3e2646:0x6a3e1e, dark=great?0x24142a:0x3a2210, iron=great?0xd8b048:0x34343c, gold=0xe8c45a, velvet=great?0x3a1a5a:0x7a1a24;
    const g=group(x,0,z,par); if(o.face!==undefined) g.rotation.y=o.face;
    // the body: a plinth, then two courses of planks on every side (a dark seam between), hollow within
    B(W+0.03,0.05*k,D+0.03,dark,0,0,0,g);
    const sides=(w,d,cx,cz)=>{ B(w,H*0.5-0.008,d,wood,cx,0.05*k,cz,g); B(w,0.012,d*0.96,dark,cx,0.05*k+H*0.5-0.008,cz,g); B(w,H*0.5-0.05*k+0.004,d,wood2,cx,0.05*k+H*0.5+0.004,cz,g); };
    sides(W,T,0,D/2-T/2); sides(W,T,0,-D/2+T/2); sides(T,D-2*T,W/2-T/2,0); sides(T,D-2*T,-W/2+T/2,0);
    // the lining and the floor of it: red velvet, a shade darker in the corners
    B(W-2*T,0.12*k,D-2*T,velvet,0,0.06*k,0,g);   /* the velvet bed, raised so the treasure sits up where you can see it */
    const lin=dk(velvet,0.75); B(W-2*T,H-0.1*k,0.012,lin,0,0.08*k,D/2-T-0.006,g); B(W-2*T,H-0.1*k,0.012,lin,0,0.08*k,-D/2+T+0.006,g); B(0.012,H-0.1*k,D-2*T,lin,W/2-T-0.006,0.08*k,0,g); B(0.012,H-0.1*k,D-2*T,lin,-W/2+T+0.006,0.08*k,0,g);
    // iron: a strap down each corner, two bands round the front and back, and a gilt lock plate with its keyhole
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([sx,sz])=>{ B(0.06*k,H-0.02,0.016,iron,sx*(W/2-0.03*k),0.04*k,sz*(D/2+0.006),g); B(0.016,H-0.02,0.06*k,iron,sx*(W/2+0.006),0.04*k,sz*(D/2-0.03*k),g); });
    [-0.24,0.24].forEach(bx=>{ B(0.05*k,H-0.04,0.014,iron,bx*k,0.05*k,D/2+0.007,g); B(0.05*k,H-0.04,0.014,iron,bx*k,0.05*k,-D/2-0.007,g); });
    const studs=new THREE.SphereGeometry(0.012*k,6,4); [[-0.36,0.1],[-0.36,0.3],[0.36,0.1],[0.36,0.3],[-0.24,0.18],[0.24,0.18]].forEach(([sx,sy])=>{ const m=new THREE.Mesh(studs,mt(gold)); m.position.set(sx*k,sy*k,D/2+0.016); g.add(m); });
    B(0.14*k,0.15*k,0.02,gold,0,H-0.19*k,D/2+0.01,g); B(0.022*k,0.05*k,0.024,0x141010,0,H-0.15*k,D/2+0.012,g); Sp(0.016*k,0x141010,0,H-0.085*k,D/2+0.022,g,6,4);
    // the treasure inside: a heap of coin (and, in a great chest, a crown of it and a gem)
    const loot=group(0,0.185*k,0,g); const coin=new THREE.CylinderGeometry(0.035*k,0.035*k,0.008,10), gm=flat(0xf2cc58,{shininess:60,specular:0x8a6a20,emissive:0x3a2a08});
    const mound=new THREE.Mesh(new THREE.SphereGeometry(1,14,6,0,Math.PI*2,0,Math.PI/2),flat(0xd8a838,{shininess:40,specular:0x6a5018,emissive:0x2a1c04})); mound.scale.set(W/2-T-0.02,0.09*k,(D/2-T-0.02)); loot.add(mound);   /* the heap itself, under the loose coin */
    const NC=great?64:44; for(let i=0;i<NC;i++){ const a=i*2.399, r=Math.sqrt(i/NC)*(W/2-T-0.05); const m=new THREE.Mesh(coin,gm); const h=0.09*k*Math.sqrt(Math.max(0,1-Math.pow(r/(W/2-T-0.02),2)));
      m.position.set(Math.cos(a)*r,h+0.004,Math.sin(a)*r*0.62); m.rotation.set(((i*1.7)%1-0.5)*0.9,0,((i*2.3)%1-0.5)*0.9); loot.add(m); }
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.04*k,0),flat(great?0x9a5aff:0x3ad08a,{shininess:90,specular:0xffffff,emissive:great?0x30106a:0x0a4a2a})); gem.position.set(0.08*k,0.11*k,-0.03); gem.scale.y=1.4; loot.add(gem);
    if(great){ const cup=Cy(0.04*k,0.03*k,0.1*k,8,gm,-0.16*k,0.01,0.02,loot); }
    // the lid: hinged along the back edge — a rim, the rounded top, its iron bands, the hasp and the dark underside
    const lid=group(0,H,-D/2,g);
    B(W+0.012,0.05*k,D+0.012,wood,0,0,D/2,lid); B(W-2*T,0.012,D-2*T,dk(velvet,0.6),0,-0.008,D/2,lid);
    const rr=D/2+0.006, bandM=flat(iron,{side:THREE.DoubleSide}); halfDrum(rr,W,wood2,lid,0.05*k,D/2,0.5);
    [-0.24,0.24,-0.37,0.37].forEach(bx=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(rr+0.008,rr+0.008,(Math.abs(bx)>0.3?0.04:0.05)*k,14,1,true,0,Math.PI),bandM); m.rotation.z=Math.PI/2; m.position.set(bx*k,0.05*k,D/2); m.scale.set(1,1,0.5); lid.add(m); });
    B(0.1*k,0.1*k,0.02,gold,0,-0.05*k,D+0.012,lid); B(0.05*k,0.02,0.03,gold,0,0.04*k,D+0.006,lid);
    // the light and the motes, for the opening
    const light=new THREE.PointLight(0xffc870,0,2.2*k,2); light.position.set(0,H*0.9,0); g.add(light);
    const motes=[]; for(let i=0;i<14;i++){ const m=new THREE.Mesh(new THREE.OctahedronGeometry(0.018*k,0),glowM(i%3?0xffe08a:0xfff6d0)); m.visible=false; g.add(m); motes.push({m,a:i*2.4,r:0.05+((i*0.37)%1)*0.22,v:0.5+((i*0.61)%1)*0.7,d:0.2+((i*0.13)%1)*0.5}); }
    if(great){ const gl=new THREE.PointLight(0xffd88a,0.45,3,2); gl.position.set(0,1.0,0.35); g.add(gl); }
    shade(g); light.castShadow=false;
    const st={lid,loot,light,motes,great,t0:-1,g};
    lid.userData.chest=st;
    // the opening runs off the clock, ticked as the lid is drawn (no frame hook needed; out of view it simply finishes)
    const tick=()=>{ if(st.t0<0) return; const u=(performance.now()-st.t0)/1000;
      if(u<0.12) lid.rotation.x=-0.07*Math.sin(u/0.12*Math.PI);   /* the latch gives: the lid jumps a little */
      else { const e=Math.min(1,(u-0.12)/0.58); lid.rotation.x=OPEN*(1+2.2*Math.pow(e-1,3)+1.2*Math.pow(e-1,2)); }   /* then swings back, a small bounce on the hinge */
      light.intensity=u<0.3?u/0.3*1.6:Math.max(0,1.6-(u-0.3)*0.7);
      motes.forEach(q=>{ const w=u-q.d*0.4-0.15; q.m.visible=w>0&&w<1.6; if(!q.m.visible) return; q.m.position.set(Math.cos(q.a+w*1.5)*q.r*(1+w*0.5),H*0.6+w*q.v,Math.sin(q.a+w*1.5)*q.r*0.6*(1+w*0.5)); q.m.rotation.y=w*5; q.m.material.opacity=Math.max(0,1-w/1.6); });
      if(u>3.0&&!window.__chestKeep){ const f=Math.max(0,1-(u-3.0)/0.6); loot.scale.setScalar(Math.max(0.001,f)); if(f<=0){ loot.visible=false; } }
      if(u>3.7&&!window.__chestKeep){ st.t0=-1; lid.rotation.x=OPEN; light.intensity=0; motes.forEach(q=>q.m.visible=false); loot.visible=false; } };
    lid.children.forEach(m=>{ if(m.isMesh) m.onBeforeRender=tick; }); g.children.forEach(m=>{ if(m.isMesh) m.onBeforeRender=tick; });
    return lid; }
  function open(h){ const st=h&&h.userData&&h.userData.chest; if(!st){ if(h) h.rotation.x=OPEN; return; }
    st.loot.visible=true; st.loot.scale.setScalar(1); st.t0=performance.now();
    try{ if(typeof SFX!=='undefined'&&SFX.play) SFX.play('chestOpen',st.great); }catch(e){} }
  function set(h,on){ if(!h) return; const st=h.userData&&h.userData.chest; h.rotation.x=on?OPEN:0; if(!st) return; st.t0=-1; st.light.intensity=0; st.motes.forEach(q=>q.m.visible=false); st.loot.visible=!on; st.loot.scale.setScalar(1); }
  return {make,open,set,OPEN};
})();
