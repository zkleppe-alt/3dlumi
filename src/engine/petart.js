// ════════════════════════════════════════════════════════════════
//  PETART (V184) — the companions as sculpts (tools/sculpt_pets.py → data/pets.json → models/pet_models.js, PET_DATA):
//   faithful f0 cub · f1 young lion · f2 lion (ride)      grace g0 dove · g1 falcon · g2 great dove (fly)
//   steadfast s0 sea turtle · s1 tortoise · s2 the shelled sea reptile (swim)      u the unicorn (fly)
//  Each is cut at its joints ('body', 'hd', legs 'lf' 'rf' 'lb' 'rb', 'tl', a bird's folded wings 'wL' 'wR' and spread
//  wings 'fL' 'fR'), and this file moves them: a walk and a bounding gallop for the cats and the unicorn, a waddle and
//  a wingbeat for the birds, a plod for the tortoise, paddling flippers for the turtle and the sea reptile.
//  PETART.pet(id, form, ribbon) → the companion at your heels (the same userData petModel gives: animate, body, head,
//  neck, back, ls). PETART.steed(kind, rider) → the final form that carries you (the same as steedModel: gallop, seat,
//  body, kind). Both return null where the sculpts haven't loaded or the classic look is on — the old models stand in.
// ════════════════════════════════════════════════════════════════
const PETART=(function(){
  const LINE={faithful:'f',grace:'g',steadfast:'s'}, STEED={lion:'f2',dove:'g2',dragon:'s2',unicorn:'u'}, KIND={f:'lion',g:'dove',s:'dragon',u:'unicorn'};
  // how big each stands in the world beside the knight (the sculpts are true size; the little ones are shown a little larger to read)
  const SHOW={f0:1.05,f1:0.9,f2:1.12,g0:1.7,g1:1.45,g2:0.84,s0:0.95,s1:0.8,s2:1.0,u:0.72}, SZ={f0:0.4,f1:0.72,f2:1,u:1,g0:0.15,g1:0.22,g2:1,s0:0.45,s1:1,s2:1};
  const ok=k=>!!k&&typeof PET_DATA!=='undefined'&&!!PET_DATA&&!!PET_DATA[k]&&typeof BOSSART!=='undefined'&&(typeof LOOK2==='undefined'||!!LOOK2);
  const keyOf=(id,form)=>id==='unicorn'?'u':(LINE[id]?LINE[id]+Math.max(0,Math.min(2,form|0)):null);
  const sm=(a,b,x)=>{ x=Math.max(0,Math.min(1,(x-a)/(b-a))); return x*x*(3-2*x); };
  function make(k,rider){ if(!ok(k)) return null; const art=BOSSART.make(k,{data:PET_DATA,skinScale:1.5/SZ[k],skinAmt:k[0]==='g'?0.012:0.03,toon:true}); if(!art) return null; art.userData.mats[0].color.setHex(0xe9e4dc);   /* a touch under white: the open world's sun is bright */
    const R=PET_DATA[k], M=R.meta, BN=art.userData.bones, g=new THREE.Group(), body=new THREE.Group(), S=SHOW[k]; body.scale.setScalar(S); g.add(body); body.add(art);
    art.traverse(o=>{ if(o.isMesh){ o.userData.lk=1; o.castShadow=true; } });   // looks.js leaves the sculpt's own meshes alone (the coat is a tint: see petLookApply)
    // where a crown, a collar and a saddle-cloth sit (model units, inside `body`): the top of the head, the neck's root, the back
    const box=n=>{ const m=BN[n]&&BN[n].children[0]; if(!m) return null; m.geometry.computeBoundingBox(); return m.geometry.boundingBox; };
    const hb=box('hd'), bb=box('body'), pv=R.piv.hd||[0,bb.max.y,bb.max.z];
    const head=hb?[hb.max.y-(hb.max.y-hb.min.y)*0.06,(hb.max.z+hb.min.z)/2-(hb.max.z-hb.min.z)*0.12]:[bb.max.y,bb.max.z*0.8], ls=hb?Math.max(0.05,(hb.max.x-hb.min.x)*0.8):0.3;
    const seat=M.seat?M.seat[1]:bb.max.y*0.92, back=[M.seat?seat-0.04:bb.max.y*0.96,M.seat?-0.3*(bb.max.z-bb.min.z)*0.5:-0.05];
    Object.assign(g.userData,{body,head,neck:[pv[1]-(hb?(hb.max.y-hb.min.y)*0.18:0),pv[2]],back,ls,kind:KIND[k[0]],seat:seat*S,sculpt:true,mats:art.userData.mats,petKey:k,bones:BN});
    if(rider){ const rg=new THREE.Group(); rg.position.set(0,seat,M.seat?M.seat[2]:0); rg.scale.setScalar(1/S); body.add(rg); rider.position.set(0,0,0); rg.add(rider); }
    // ── the gaits ──
    const gait=M.gait||'cat', bird=gait==='bird', L=['lf','rf','lb','rb'].map(n=>BN[n]||null), hd=BN.hd, tl=BN.tl, hd0=hd?hd.position.clone():null; let last=0;
    const leg=(i,x,y,z)=>{ if(L[i]) L[i].rotation.set(x||0,y||0,z||0); };
    if(bird){ BN.fL.visible=BN.fR.visible=false; }
    g.userData.gallop=(t,s,air,bank)=>{ s=Math.max(0,Math.min(1,s||0)); const dt=Math.min(0.05,Math.max(0,t-last)); last=t; art.userData.tickArt(dt);
      const mv=Math.min(1,s*2.6), up=air>0; let by=0, bx=0, bz=(bank||0)*0.4;
      if(gait==='cat'||gait==='horse'){ const run=sm(0.5,0.75,s), ph=t*(5.5+7*s), a=0.5*mv*(1-run), b=0.8*run;
        if(up){ const p=Math.sin(t*3)*0.12; leg(0,-0.75+p); leg(1,-0.75-p); leg(2,0.7-p); leg(3,0.7+p); by=Math.sin(t*2)*0.04/S; bx=-0.06; }   // aloft: the legs gathered, treading the air
        else { // the walk: each foot in its turn (left hind, left fore, right hind, right fore); the gallop: the fore pair reach, then the hind pair drive
          leg(0,Math.sin(ph+1.57)*a+Math.sin(ph*1.25)*b); leg(1,Math.sin(ph+4.71)*a+Math.sin(ph*1.25-0.45)*b);
          leg(2,Math.sin(ph)*a+Math.sin(ph*1.25+2.5)*b);  leg(3,Math.sin(ph+3.14)*a+Math.sin(ph*1.25+2.05)*b);
          by=(Math.abs(Math.sin(ph))*0.02*mv*(1-run)+(0.5+0.5*Math.sin(ph*1.25+1.2))*0.1*run)/S*0.6; bx=Math.sin(ph*1.25+0.4)*0.07*run; }
        if(hd) hd.rotation.set(-bx*0.8+Math.sin(t*0.9)*0.03*(1-mv),Math.sin(t*0.6)*0.14*(1-mv),0);
        if(tl) tl.rotation.set((gait==='horse'?0.05:-0.15)+0.25*run+Math.sin(t*1.7)*0.06,Math.sin(t*(gait==='horse'?2.2:1.4))*(0.3-0.15*run),0); }
      else if(bird){ const fly=up; if(BN.fL.visible!==fly){ BN.fL.visible=BN.fR.visible=fly; BN.wL.visible=BN.wR.visible=!fly; }
        const ph=t*(9+6*s);
        if(fly){ const f=Math.sin(t*(k==='g2'?5.5:11)); BN.fL.rotation.set(0,0,-(0.12+f*0.62)); BN.fR.rotation.set(0,0,0.12+f*0.62); leg(0,1.15); leg(1,1.15); by=-f*0.05/S*(k==='g2'?1:0.5); bx=-0.1-0.12*s; }
        else { leg(0,Math.sin(ph)*0.6*mv); leg(1,-Math.sin(ph)*0.6*mv); bz+=Math.sin(ph)*0.07*mv; by=Math.abs(Math.sin(ph))*0.012*mv/S; }
        if(hd){ hd.position.copy(hd0); if(!fly) hd.position.z+=Math.sin(ph*2)*0.035*mv*(hd0.y||0.2); hd.rotation.set(fly?0.12:0,Math.sin(t*0.8)*0.2*(1-mv),0); } }
      else if(gait==='turtle'&&k==='s1'){ const ph=t*(3+4*s), a=0.42*mv;   // the tortoise plods, corner by corner, the shell rocking
        leg(0,Math.sin(ph)*a); leg(3,Math.sin(ph)*a); leg(1,-Math.sin(ph)*a); leg(2,-Math.sin(ph)*a); bz+=Math.sin(ph)*0.03*mv; by=Math.abs(Math.cos(ph))*0.012*mv/S;
        if(hd) hd.rotation.set(Math.sin(t*0.7)*0.05,Math.sin(t*0.5)*0.2*(1-mv*0.6),0); if(tl) tl.rotation.y=Math.sin(ph)*0.3*mv; }
      else { const ph=t*(2.4+3*s), w=0.25+0.75*mv, big=k==='s2';   // flippers: the fore pair sweep like wings, the hind pair steer
        leg(0,Math.cos(ph)*0.22*w,-Math.sin(ph)*0.3*w,-Math.sin(ph)*0.38*w); leg(1,Math.cos(ph)*0.22*w,Math.sin(ph)*0.3*w,Math.sin(ph)*0.38*w);
        leg(2,0,-Math.sin(ph+1.6)*0.25*w,-Math.sin(ph+1.6)*0.2*w); leg(3,0,Math.sin(ph+1.6)*0.25*w,Math.sin(ph+1.6)*0.2*w);
        by=Math.sin(ph)*0.035*w*(big?1:0.25)/S; bx=Math.cos(ph)*0.035*w*(big?1:0.4); bz+=Math.sin(t*1.1)*0.025;
        if(hd) hd.rotation.set(-bx+Math.sin(t*0.9)*0.05,Math.sin(t*0.6)*0.22*(1-mv*0.5),0); if(tl) tl.rotation.y=Math.sin(ph-1)*0.35*w; }
      body.position.y=by*S; body.rotation.x=bx; body.rotation.z=bz; if(g.userData.fxTick) g.userData.fxTick(t); };
    return g; }
  // the companion at your heels: the little birds take wing when you move and settle when you stop
  function pet(id,form,ribbon){ const k=keyOf(id,form), g=make(k); if(!g) return null; const U=g.userData, flies=k==='g0'||k==='g1'; let lift=0, lt=0;
    U.animate=(t,moving)=>{ const dt=Math.min(0.05,Math.max(0,t-lt)); lt=t; if(flies){ lift+=((moving?1:0)-lift)*Math.min(1,dt*4); U.gallop(t,moving?0.5:0,lift>0.12?1:0,0); U.body.position.y+=lift*0.75; } else U.gallop(t,moving?0.38:0,0,0); };
    if(ribbon&&typeof RIBBON_COL!=='undefined'&&RIBBON_COL[ribbon]){ const r=group(0,U.neck[0],U.neck[1]+U.ls*0.45,U.body); r.scale.setScalar(U.ls/0.3); const c=RIBBON_COL[ribbon]; B(0.12,0.08,0.03,c,-0.06,0,0,r).rotation.z=0.4; B(0.12,0.08,0.03,c,0.06,0,0,r).rotation.z=-0.4; Sp(0.035,c,0,0.04,0,r); r.traverse(o=>{ if(o.isMesh) o.userData.lk=1; }); }
    return g; }
  function steed(kind,rider){ return make(STEED[kind],rider); }
  return { pet, steed, has:(id,form)=>ok(keyOf(id,form)), hasSteed:kind=>ok(STEED[kind]) };
})();
