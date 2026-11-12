// ════════════════════════════════════════════════════════════════
//  RIG (V137) — motion capture for the knight. A real skeleton (the Mixamo rig — the same bones Mixamo's clips use, so
//  new clips drop straight in) plays its clips in an AnimationMixer, blended by how fast he moves:
//    idle (breathing, the weight shifting) · walk · run — the walk and run kept in step on one shared phase, and played at
//    the speed that matches the ground he covers, so the feet don't slide
//  The knight himself is still built of rigid parts on pivots (knight.js), so the skeleton isn't skinned to him: each frame
//  its pose is RETARGETED onto his pivots — the pelvis, chest and head take the bones' turn from their bind pose; each limb
//  segment is pointed along the bone's own direction (so the Mixamo T-pose and his arms-down rest don't matter); the pelvis
//  rides up and down and sways with the hips. Clips today come from three.js's Xbot sample (engine/anim_base.js); RIG.addClip
//  takes any Mixamo clip (an AnimationClip on the same bone names) to replace or add to them.
//  RIG.make() → rig · rig.step(dt, move, run, speedInHipHeights) · rig.q(name) model-space turn from bind · rig.p(name)
// ════════════════════════════════════════════════════════════════
const RIG=(function(){
  // V192: the clips are now Quaternius' Universal Animation Library (CC0; models/anim_ual.js — baked onto these same bone
  //  names, so nothing else changes): a hand-animated, game-made set — the walk, the jog, the sword stance and blows, the
  //  shield guard, the roll, the jump. Where that file hasn't loaded (or with ?oldanim / the classic look) the old clips play.
  const OLDA=(function(){ try{ return /[?&]oldanim/.test(location.search)||localStorage.getItem('klk3d_anim')==='old'; }catch(e){ return false; } })();
  const D=(typeof ANIM_UAL!=='undefined'&&ANIM_UAL&&!OLDA)?ANIM_UAL:(typeof ANIM_BASE!=='undefined'?ANIM_BASE:null);
  const ok=!!(D&&THREE.AnimationMixer);
  function clipFrom(name,c){ const tr=[];
    c.q.forEach((v,i)=>tr.push(new THREE.QuaternionKeyframeTrack(D.bones[i][0]+'.quaternion',c.T,v)));
    if(c.p) tr.push(new THREE.VectorKeyframeTrack('Hips.position',c.T,c.p));
    return new THREE.AnimationClip(name,c.dur,tr); }
  // V141: the clips are built once and shared by every rig (the knight's and the townsfolk's), and each gait's measured speed
  //  is kept once for them all; a rig for one of the folk takes only the clips the folk use
  const CLIPS={}, NAT={}; const clipOf=n=>CLIPS[n]||(CLIPS[n]=clipFrom(n,D.clips[n]));
  function make(opts){ if(!ok) return null; opts=opts||{};
    const root=new THREE.Group(); root.scale.setScalar(D.unit||0.01); const B={}, list=[];
    D.bones.forEach(([n,p,t,r])=>{ const b=new THREE.Bone(); b.name=n; b.position.fromArray(t); b.quaternion.fromArray(r); B[n]=b; list.push(b); (p<0?root:list[p]).add(b); });
    root.updateMatrixWorld(true);
    // the bind pose, in the rig's own space
    const QB={}, PB={}, _m=new THREE.Vector3(), _s=new THREE.Vector3();
    const grab=(Q,P)=>{ for(const n in B){ const q=Q[n]||(Q[n]=new THREE.Quaternion()), p=P[n]||(P[n]=new THREE.Vector3()); B[n].matrixWorld.decompose(p,q,_s); } };
    grab(QB,PB);
    const mixer=new THREE.AnimationMixer(root), A={}, dur={};
    function addClip(name,clip){ if(A[name]){ A[name].stop(); } const ac=mixer.clipAction(clip); ac.play(); ac.weight=0; A[name]=ac; dur[name]=clip.duration; }
    for(const n in D.clips) if(!opts.only||opts.only.includes(n)) addClip(n,clipOf(n));
    // how fast each gait really travels (in hip heights a second): the reach of a foot's swing over the part of the cycle
    //  it stands on the ground
    const hipH=PB.Hips.y, nat=NAT;
    const Q={}, P={};
    // how fast each gait really travels (hip heights a second), and where in its cycle the left foot is furthest forward — so
    //  every gait is played from the same moment of the stride, and blending a walk into a run never crosses the feet
    const PH0=NAT.__ph||(NAT.__ph={});
    function measure(n,stance){ const ac=A[n]; if(!ac) return 1; for(const k in A) A[k].weight=0; ac.weight=1; let zmin=1e9, zmax=-1e9, at=0;
      for(let i=0;i<=24;i++){ ac.time=dur[n]*i/24; mixer.update(0); root.updateMatrixWorld(true); B.LeftFoot.getWorldPosition(_m); const z=_m.z-B.Hips.getWorldPosition(_s).z; if(z<zmin) zmin=z; if(z>zmax){ zmax=z; at=i/24; } }
      PH0[n]=at; ac.weight=0; return ((zmax-zmin)/(stance*dur[n]))/hipH; }
    const stanceOf=n=>/run/i.test(n)?0.36:0.6; const natOf=n=>nat[n]!==undefined?nat[n]:(nat[n]=A[n]?measure(n,stanceOf(n)):1);
    natOf('walk'); if(A.run) natOf('run');
    let ph=Math.random(), tIdle=Math.random()*5, cpsS=0.8;
    // V142: every clip's weight eases toward where it's wanted (a crossfade, never a cut), and the weights always add up to
    //  one (short of one, the mixer would drift toward the T-pose); a clip fading out keeps the time it had
    const W={}, TT={};
    const rig={ root, bones:B, actions:A, nat, hipH, dur, ual:!!(typeof ANIM_UAL!=='undefined'&&D===ANIM_UAL),
      addClip(name,clip){ addClip(name,clip); delete nat[name]; },
      // blend and pose: move 0..1 (standing → moving), run 0..1 (walk → run), v the ground speed in hip heights a second
      // ov: a clip laid over the gaits — {n:name, t:its time (seconds, or u 0..1 of it), w:how much, fade:per second} — a blow, the guard, a fall
      //  set: which clips stand for the idle, the walk and the run just now ({idle,walk,run,idleAt} — sword drawn or sheathed, hurt)
      step(dt,move,run,v,ov,set){ const S0=set||{}, nI=A[S0.idle]?S0.idle:A.idle?'idle':'idleCalm', nW=A[S0.walk]?S0.walk:'walk', nR=A[S0.run]?S0.run:A.run?'run':nW;
        const ow=ov&&A[ov.n]?Math.max(0,Math.min(1,ov.w)):0, keep=1-ow;
        const vW=natOf(nW), vR=natOf(nR), cpsW=(vW>0?v/vW:1)/dur[nW], cpsR=(vR>0?v/vR:1)/dur[nR];
        // the cadence: what the ground asks for, within what looks like a stride (past it the feet give a little), and eased
        const cpsT=Math.max(0.45/dur[nW],Math.min(1.5/((1-run)*dur[nW]+run*dur[nR]),cpsW*(1-run)+cpsR*run)); cpsS+=(cpsT-cpsS)*Math.min(1,dt*4);
        if(move>0.02) ph=(ph+cpsS*dt)%1; tIdle+=dt;
        const tg={}; const add=(n,w)=>{ if(A[n]&&w>0) tg[n]=(tg[n]||0)+w; };
        add(nW,move*(1-run)*keep); add(nR,move*run*keep); add(nI,(1-move)*keep); if(ow>0) add(ov.n,ow);
        const rate=dt*(ov&&ov.fade?ov.fade:9); let sum=0;
        for(const k in A){ const w0=W[k]||0, w1=w0+((tg[k]||0)-w0)*Math.min(1,rate); W[k]=w1<0.002&&!tg[k]?0:w1; sum+=W[k]; }
        for(const k in A){ const a2=A[k], w=sum>0?W[k]/sum:0; a2.weight=w; if(w<=0) continue;
          if(ov&&k===ov.n&&ow>0) TT[k]=ov.u!==undefined?Math.max(0,Math.min(0.999,ov.u))*dur[k]:(ov.t%dur[k]);
          else if(k===nW||k===nR) TT[k]=(((ph+(PH0[k]||0))%1+1)%1)*dur[k];
          else if(k===nI) TT[k]=S0.idleAt!==undefined&&nI===nW?S0.idleAt*dur[k]:tIdle%dur[k];
          a2.time=TT[k]!==undefined?TT[k]:0; }
        mixer.update(0); root.updateMatrixWorld(true); grab(Q,P); },
      q(n,out){ return out.copy(Q[n]).multiply(_inv.copy(QB[n]).invert()); },   // its turn from the bind pose, in the rig's space
      p(n){ return P[n]; }, pb(n){ return PB[n]; } };
    const _inv=new THREE.Quaternion();
    return rig; }
  return { ok, make, ual:!!(D&&typeof ANIM_UAL!=='undefined'&&D===ANIM_UAL) };
})();
