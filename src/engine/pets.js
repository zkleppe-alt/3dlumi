// ════════════════════════════════════════════════════════════════
//  PETS — KLK companions in 3D. petModel(kind, form, ribbon) for every line and form
//  (faithful: cub → young lion → lion · grace: dove → falcon → great dove ·
//   steadfast: turtle → tortoise → sea dragon · the unicorn), plus the Pet Tournament's
//  cat, fox and lion. PETS3D keeps your companion at your heels in every walking level.
// ════════════════════════════════════════════════════════════════
const RIBBON_COL={'🎀':0xe86a9a,'⭐':0xf2c14e,'🔥':0xe8642a,'✝':0xf4eede,'🌊':0x3a8ad8,'🍀':0x3aa85a};
// a rounded horse, shared by the steeds of the steeplechase and the joust (mounts.js) and the unicorn companion: chest,
// barrel and quarters as one smooth body, a tapered neck with its mane, a long head with muzzle, eyes and ears, and legs
// that taper to a fetlock and a hoof. Returns its joints: legs [{hip,knee,front}], neck, head, tail.
function equine(body,c0,c1,mane,hoof){ const legs=[];
  Sp(0.36,c1,0,1.02,0,body,14,10).scale.set(0.92,0.86,1.85); Sp(0.31,c1,0,1.08,0.52,body,12,9).scale.set(0.95,1,1); Sp(0.33,c1,0,1.12,-0.52,body,12,9).scale.set(1,1,1.05);
  Sp(0.2,new THREE.Color(c1).lerp(new THREE.Color(0xffffff),0.12).getHex(),0,0.86,0,body,10,7).scale.set(1,0.5,2.6);   // a paler belly
  const neck=group(0,1.36,0.6,body); neck.rotation.x=0.65; Cy(0.14,0.22,0.9,10,c1,0,-0.05,0,neck); for(let i=0;i<6;i++){ const m=B(0.07,0.18,0.16,i%2?mane:new THREE.Color(mane).multiplyScalar(0.8).getHex(),(i%2?0.03:-0.03),0.0+i*0.15,-0.17,neck); m.rotation.z=i%2?0.2:-0.2; }
  const head=group(0,0.85,0.06,neck); head.rotation.x=-1.1; Cy(0.1,0.15,0.62,10,c1,0,-0.4,0.06,head); Sp(0.115,c0,0,-0.42,0.08,head,10,7).scale.set(1,0.9,1.1); Sp(0.15,c1,0,0.12,0.04,head,10,8).scale.set(1,1.1,1);
  [-1,1].forEach(sd=>{ Sp(0.03,0x1a1410,sd*0.12,0.06,0.09,head,8,6); Sp(0.009,0xffffff,sd*0.128,0.07,0.11,head,4,3); Sp(0.022,0x2a1a14,sd*0.05,-0.48,0.15,head,5,4); const e=Co(0.045,0.14,5,c1,sd*0.07,0.3,-0.02,head); e.rotation.z=-sd*0.2; });   // eyes, nostrils, ears
  B(0.08,0.16,0.1,mane,0,0.25,0.1,head);                                                                                   // forelock
  for(const [x,z,front] of [[-0.19,0.56,1],[0.19,0.56,1],[-0.19,-0.56,0],[0.19,-0.56,0]]){ const hip=group(x,1.02,z,body); Cy(0.075,front?0.11:0.13,0.55,8,c1,0,-0.55,0,hip);
    const knee=group(0,-0.55,0,hip); Cy(0.05,0.065,0.46,8,c0,0,-0.46,0,knee); Sp(0.07,c0,0,-0.46,0.01,knee,8,6); B(0.14,0.1,0.16,hoof||0x2a2018,0,-0.54,0.02,knee); legs.push({hip,knee,front}); }
  const tail=group(0,1.22,-0.84,body); tail.rotation.x=-2.5; Cy(0.07,0.04,0.25,6,mane,0,0,0,tail); for(let i=0;i<3;i++){ const st=Cy(0.05,0.02,0.62,5,i===1?mane:new THREE.Color(mane).multiplyScalar(0.85).getHex(),(i-1)*0.04,0.15,0,tail); st.rotation.z=(i-1)*0.1; }
  return {legs,neck,head,tail}; }
function petModel(kind,form,ribbon){ if(typeof PETART!=='undefined'){ const a=PETART.pet(kind,form,ribbon); if(a) return a; }   /* V184: the sculpted companions (petart.js); these blocks stand in where they haven't loaded */
  const g=new THREE.Group(), body=group(0,0,0,g), legs=[], flap=[]; let headY=0.5, headZ=0.3;
  const quad=(c,len,h,w,leg)=>{ B(w,h,len,c,0,leg,0,body); for(const [x,z] of [[-w/2+0.06,len/2-0.08],[w/2-0.06,len/2-0.08],[-w/2+0.06,-len/2+0.08],[w/2-0.06,-len/2+0.08]]){ const p=group(x,leg,z,body); B(0.08,leg,0.08,c,0,-leg,0,p); legs.push(p); } };
  if(kind==='faithful'||kind==='lion'||kind==='cat'||kind==='fox'){
    const s=kind==='cat'?0.7:kind==='fox'?0.85:[0.75,1.0,1.35][form||0], c=kind==='cat'?0x8a8a94:kind==='fox'?0xd8743a:0xd8a050, cl=new THREE.Color(c).lerp(new THREE.Color(0xfff4e0),0.45).getHex(), cd=new THREE.Color(c).multiplyScalar(0.7).getHex();
    const inner=group(0,0,0,body); inner.scale.setScalar(s); const cub=kind==='faithful'&&!(form>0);
    // a rounded body: chest, barrel and haunch, a paler belly, and four tapered legs with paws (cubs a little rounder and bigger-headed)
    Sp(0.19,c,0,0.26,0.13,inner,12,9).scale.set(0.95,0.95,1.1); Sp(0.17,c,0,0.25,-0.12,inner,12,9).scale.set(1,0.95,1.15); Sp(0.13,cl,0,0.19,0.02,inner,10,7).scale.set(1,0.7,1.6);
    [[-0.1,0.2,1],[0.1,0.2,1],[-0.1,-0.2,0],[0.1,-0.2,0]].forEach(([x,z,fr])=>{ const p=group(x,0.22,z,inner); Cy(fr?0.05:0.06,0.04,0.2,8,c,0,-0.2,0,p); Sp(0.05,fr?cl:c,0,-0.2,0.015,p,8,6).scale.set(1,0.7,1.25); legs.push(p); });
    const hs=cub?1.2:1, hd=group(0,0.42,0.3,inner); hd.scale.setScalar(hs); Sp(0.15,c,0,-0.06,0,hd,14,10).scale.set(1.05,0.95,0.98);
    Sp(0.08,cl,0,-0.11,0.12,hd,10,7).scale.set(1.15,0.75,0.9); Sp(0.026,0x2a1a14,0,-0.075,0.2,hd,6,4);                                    // muzzle and nose
    [-1,1].forEach(sd=>{ Sp(0.034,0xffffff,sd*0.062,-0.025,0.122,hd,8,6); Sp(0.024,0x1a1410,sd*0.064,-0.025,0.14,hd,8,6); Sp(0.008,0xffffff,sd*0.056,-0.015,0.161,hd,4,3); });   // big bright eyes
    if(kind==='cat'||kind==='fox'){ [-1,1].forEach(sd=>{ const e=Co(0.055,0.12,4,c,sd*0.09,0.05,-0.01,hd); e.rotation.z=-sd*0.25; Co(0.03,0.07,4,0xf0b0a8,sd*0.09,0.05,0.005,hd).rotation.z=-sd*0.25; }); if(kind==='fox') Sp(0.07,0xf4eede,0,-0.13,0.1,hd,8,6).scale.set(1.2,0.6,1); }
    else { [-1,1].forEach(sd=>Sp(0.045,cd,sd*0.11,0.05,-0.02,hd,8,6).scale.set(1,1,0.6));                                                 // round lion's ears
      if((form||0)>=1||kind==='lion'){ const mc=0x8a4a1a, md=0x6a3410; for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, r=0.15; const m=Co(0.07,0.17,5,i%2?mc:md,Math.cos(a)*r,-0.06+Math.sin(a)*r,-0.04,hd); m.rotation.set(Math.PI/2,0,a-Math.PI/2); m.rotation.order='ZXY'; }   // a mane of tufts all round the face
        Sp(0.17,mc,0,-0.08,-0.09,hd,10,8).scale.set(1.2,1.2,0.7); } }
    const tail=group(0,0.3,-0.3,inner); const tl=Cy(0.022,0.03,0.32,6,c,0,0,-0.16,tail); tl.rotation.x=Math.PI/2; Sp(kind==='fox'?0.09:0.045,kind==='fox'?0xf4eede:kind==='cat'?c:0x6a3410,0,0,-0.33,tail,8,6).scale.set(1,1,kind==='fox'?1.5:1); tail.rotation.x=-0.5;
    headY=0.42*s+0.1; headZ=0.34*s; g.userData.tail=tail; g.userData.back=[0.47*s,-0.08*s]; g.userData.ls=0.3*s;
  } else if(kind==='grace'){ const s=[0.7,0.9,1.25][form||0], c=form===1?0xa8805a:0xeef2f8, inner=group(0,0.35,0,body); inner.scale.setScalar(s);
    const b=Sp(0.18,c,0,0,0,inner); b.scale.set(0.9,0.9,1.3); Sp(0.11,c,0,0.14,0.18,inner); Co(0.04,0.1,4,0xe8b040,0,0.1,0.32,inner).rotation.x=Math.PI/2; [-1,1].forEach(sd=>{ Sp(0.022,0x1a1410,sd*0.075,0.17,0.24,inner,6,4); Sp(0.007,0xffffff,sd*0.07,0.18,0.258,inner,4,3); });
    [-1,1].forEach(sd=>{ const w=group(sd*0.14,0.03,0,inner); for(let i=0;i<4;i++){ const f=B(0.42-i*0.07,0.025,0.09,i%2?new THREE.Color(c).multiplyScalar(0.9).getHex():c,sd*(0.21-i*0.035),-i*0.006,0.08-i*0.07,w); f.rotation.y=-sd*(0.05+i*0.12); } flap.push([w,sd]); });   // feathers fanned along the wing
    B(0.12,0.02,0.2,c,0,0,-0.26,inner); headY=0.35+0.22*s; headZ=0.18*s; g.userData.fly=true; g.userData.back=[0.35+0.16*s,-0.05*s]; g.userData.ls=0.18*s;
  } else if(kind==='steadfast'){ const f=form||0, s=[0.7,1.0,1.3][f], inner=group(0,0,0,body); inner.scale.setScalar(s);
    if(f<2){ const sh=Sp(0.3,f?0x6a5a3a:0x3a7a4a,0,0.16,0,inner,10,6); sh.scale.set(1,0.55,1.2); Sp(0.09,0x8ab86a,0,0.14,0.38,inner);
      [[-0.2,0.2],[0.2,0.2],[-0.2,-0.2],[0.2,-0.2]].forEach(([x,z])=>{ const p=group(x,0.1,z,inner); B(0.1,0.1,0.1,0x8ab86a,0,-0.1,0,p); legs.push(p); }); headY=0.24*s; headZ=0.38*s; g.userData.back=[0.33*s,-0.05*s]; g.userData.ls=0.22*s; }
    else { const C=0x3a8a5a, CL=0x9ad8a8, CD=0x1e5a3a;   // the sea dragon: a long sinuous body tapering to the tail, a crest of fins along the spine, a horned head
      for(let i=0;i<6;i++){ const z=0.42-i*0.2, r=0.2-i*0.024; Sp(r,C,0,0.32+Math.sin(i*0.9)*0.05,z,inner,12,8).scale.set(1,0.9,1.25); Sp(r*0.7,CL,0,0.32+Math.sin(i*0.9)*0.05-r*0.45,z,inner,8,6).scale.set(1,0.5,1.2); if(i<5) Co(0.06-i*0.008,0.18,4,0x7ac08a,0,0.32+r*0.9,z,inner); }
      const hd=group(0,0.52,0.62,inner); Sp(0.15,C,0,0,0,hd,12,9).scale.set(1,0.9,1.25); Sp(0.09,C,0,-0.04,0.16,hd,10,7).scale.set(1,0.8,1.3);
      [-1,1].forEach(sd=>{ Sp(0.035,0xffe070,sd*0.085,0.04,0.09,hd,8,6); Sp(0.017,0x1a1410,sd*0.095,0.045,0.11,hd,6,4); const h=Co(0.03,0.2,5,0xe8dcc8,sd*0.07,0.12,-0.08,hd); h.rotation.x=-0.9; h.rotation.z=-sd*0.25; });
      [[-0.14,0.25],[0.14,0.25],[-0.14,-0.25],[0.14,-0.25]].forEach(([x,z])=>{ const p=group(x,0.25,z,inner); Cy(0.05,0.04,0.25,6,CD,0,-0.25,0,p); legs.push(p); });
      [-1,1].forEach(sd=>{ const w=group(sd*0.17,0.42,0.2,inner); for(let i=0;i<3;i++){ const f=B(0.42-i*0.08,0.02,0.1,i%2?CL:0x7ac08a,sd*(0.2-i*0.03),0,0.06-i*0.09,w); f.rotation.y=-sd*0.2*i; } flap.push([w,sd]); });
      headY=0.7*s; headZ=0.5*s; g.userData.back=[0.56*s,-0.15*s]; g.userData.ls=0.3*s; }
  } else { // the unicorn: a small white horse, a golden spiral horn, a lilac mane
    const inner=group(0,0,0,body); inner.scale.setScalar(0.5); const E=equine(inner,0xe8e2d8,0xf4f0ea,0xc8a0e8,0xe8c050); E.legs.forEach(L=>legs.push(L.hip));
    const hg=group(0,0.3,0.12,E.head); hg.rotation.x=0.4; Co(0.06,0.5,7,0xf2c14e,0,0,0,hg); g.userData.tail=E.tail;
    headY=1.15; headZ=0.52; g.userData.back=[0.62,-0.1]; g.userData.ls=0.3; }
  if(ribbon&&RIBBON_COL[ribbon]){ const r=group(0,headY+0.04,headZ-0.05,g); B(0.12,0.08,0.03,RIBBON_COL[ribbon],-0.06,0,0,r).rotation.z=0.4; B(0.12,0.08,0.03,RIBBON_COL[ribbon],0.06,0,0,r).rotation.z=-0.4; Sp(0.035,RIBBON_COL[ribbon],0,0.04,0,r); }
  g.userData.legs=legs; g.userData.flap=flap; g.userData.body=body; g.userData.head=[headY,headZ]; g.userData.neck=[headY-0.16*(g.userData.ls||0.3)/0.3,headZ-0.06];
  g.userData.animate=(t,moving)=>{ legs.forEach((p,i)=>p.rotation.x=moving?Math.sin(t*12+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*0.6:0);
    flap.forEach(([w,sd])=>w.rotation.z=sd*(g.userData.fly||moving?Math.sin(t*14)*0.6:0.2)); if(g.userData.tail) g.userData.tail.rotation.y=Math.sin(t*3)*0.4;
    body.position.y=g.userData.fly?0.35+Math.sin(t*3)*0.08:(moving?Math.abs(Math.sin(t*12))*0.05:0); if(g.userData.fxTick) g.userData.fxTick(t); };
  return inkify(shade(g),0.014); }

const PETS3D=(function(){ let m=null, key='', st={x:0,z:0,face:0}, lvId=null; const kOf=S=>S.pet.id+S.pet.form+(S.pet.ribbon||'')+(typeof PETLOOKS!=='undefined'?PETLOOKS.key(S):'');
  function place(lv){ const S=GAME.S; if(m&&m.parent) m.parent.remove(m); m=null; lvId=lv.id;
    if(!S.pet||lv.noPet||(lv.custom&&!lv.custom.pet)) return; const k=kOf(S); if(k!==key||!m){ key=k; const L=(S.pet.form>=2&&typeof STEED_LOOK!=='undefined')?STEED_LOOK[S.pet.id]:null;   // a final form walks at your side in its full shape (steeds.js), smaller than when it carries you
      if(L&&typeof horseModel==='function'){ m=horseModel({kind:L.kind,coat:L.coat,mane:L.mane}); m.userData.petScale=0.58; const fly=L.kind==='dove'; m.userData.animate=(t,moving)=>m.userData.gallop(t,moving?0.45:0,0); }
      else m=petModel(S.pet.id,S.pet.form,S.pet.ribbon);
      if(typeof petLookApply!=='undefined') petLookApply(m,PETLOOKS.shown(),SYS.PETS[S.pet.id].forms[S.pet.form].ability?S.mountSkin:null,L&&L.kind); }
    const P=ENGINE.P; st={x:P.x-0.8,z:P.z+0.8,face:P.face}; m.scale.setScalar(VIEWMODE.ps(lv)*ACTOR_S(lv)*(m.userData.petScale||1)); lv.scene.add(m); }
  function tick(dt,t,P,lv){ const S=GAME.S; if(lv.id!==lvId) return;
    if(lv.noPet) return; if(S.pet&&(!m||key!==kOf(S))){ place(lv); }
    if(!m) return; if(lv.custom&&!lv.custom.pet) return;
    const vs=VIEWMODE.ps(lv); let tx=P.x-(Math.sin(P.face)*0.9-Math.cos(P.face)*0.5)*vs, tz=P.z-(Math.cos(P.face)*0.9+Math.sin(P.face)*0.5)*vs, fast=0;
    if(st.dartT>0){ st.dartT-=dt; tx=st.dx; tz=st.dz; fast=1; }   /* V185: darting in to strike (petfight.js) */
    const d=Math.hypot(tx-st.x,tz-st.z);
    const moving=d>0.15; if(moving){ const k=Math.min(1,dt*(fast?11:d>3?6:3)); st.x+=(tx-st.x)*k; st.z+=(tz-st.z)*k; st.face=Math.atan2(tx-st.x,tz-st.z)||st.face; } else { let a=P.face-st.face; a=Math.atan2(Math.sin(a),Math.cos(a)); st.face+=a*dt*2; }
    const y=lv.ground?lv.ground(st.x,st.z):0; m.position.set(st.x,y,st.z); m.rotation.y=st.face; m.userData.animate(t,moving); }
  function hide(on){ if(m) m.visible=!on; }
  return { place, tick, hide, dart(x,z,sec){ st.dx=x; st.dz=z; st.dartT=sec||0.4; }, get shown(){ return !!(m&&m.parent&&m.visible); }, at:()=>m?{x:st.x,z:st.z,face:st.face,scale:m.scale.x}:null, setAt(x,z,face){ st.x=x; st.z=z; if(face!==undefined) st.face=face; if(m){ m.position.x=x; m.position.z=z; m.rotation.y=st.face; } } };   /* V184: the mount and dismount hand the companion over where it stands */
})();
