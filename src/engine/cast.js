// ════════════════════════════════════════════════════════════════
//  CAST — the main cast rebuilt on the knight's sculpture (tools/sculpt_cast.py → CAST_DATA, the bodies → CAST_BODY):
//  each is the hero's rig and animation (knight.js, bare) with a real body skinned to it ('man', 'woman' or the hero's
//  own), clothes that are that body's skin pushed out and coloured (they bend exactly as it does), a face with eyes,
//  brows and lips, hair and headgear fitted to the head, and rigid pieces — belts, crowns, emblems, a gown or a tunic's
//  skirt that moves as cloth. Sir Joshua is the hero knight himself in his own colours with his own head.
//  castPerson(name,opts) → the figure (a Group the folk code positions and turns); castPose(f,t,dt,P,talking) brings it to life.
// ════════════════════════════════════════════════════════════════
const CAST_LOOKS=new Set(typeof CAST_DATA!=='undefined'?Object.keys(CAST_DATA):[]);
const castPerson=(function(){
  const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
  const HQ=typeof PAINT!=='undefined';
  function mat(kind,color,o){ o=o||{}; if(kind==='hair') kind='fur';
    if(kind==='eye') return new THREE.MeshStandardMaterial(Object.assign({color,roughness:0.28,metalness:0},o));
    if(kind==='gem') return new THREE.MeshStandardMaterial(Object.assign({color,roughness:0.12,metalness:0.3,emissive:new THREE.Color(color).multiplyScalar(0.18),envMap:HQ?PAINT.envMap():null},o));
    if(kind==='glow') return new THREE.MeshBasicMaterial(Object.assign({color},o));
    if(kind==='blush') return new THREE.MeshStandardMaterial(Object.assign({color,roughness:0.7,transparent:true,opacity:0.35,depthWrite:false},o));   /* a soft warmth, barely there */
    if(HQ) return PAINT.mat(kind,color,o);
    return new THREE.MeshPhongMaterial(Object.assign({color,shininess:kind==='gold'||kind==='steel'?50:8},o)); }
  // cloth that moves (as on the knight): the lower the cloth, the further it trails out from the body, a ripple across it
  function cloth(m,U,L){ m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader='uniform float uBend,uWave,uT,uSway;\n'+sh.vertexShader.replace('#include <begin_vertex>',
      'vec3 transformed=vec3(position); float cd=clamp(-position.y/'+L.toFixed(3)+',0.,1.); float cw=sin(position.x*11.0+uT*4.6-cd*5.0)+0.5*sin(position.x*23.0-uT*6.3+cd*3.0);'+
      'vec2 co=normalize(vec2(position.x,position.z)+vec2(0.,1e-4)); transformed.xz+=co*(uBend*'+L.toFixed(3)+'*cd*cd+uWave*cd*cw); transformed.x+=uSway*cd*cd*'+L.toFixed(3)+';'); };
    m.customProgramCacheKey=()=>'castcloth'+L; return m; }
  const MTG={};   // materials shared across figures by kind and colour (a crowd re-uses a handful)
  return function(name,opts){ const D=typeof name==='object'?name:CAST_DATA[name], BD=(typeof CAST_BODY!=='undefined'&&CAST_BODY[D.body])||null;
    const MT={}, base={}; for(const k in D.mats){ const [kind,c]=D.mats[k]; base[k]=[kind,c]; }
    if(opts&&opts.recolor) for(const k in opts.recolor) if(base[k]&&opts.recolor[k]!=null) base[k]=[base[k][0],opts.recolor[k]];   // a livery, a general's colours, a stole
    const rigid=k=>{ const [kind,c]=base[k]||['cloth',0x888888], key='r|'+kind+'|'+c; if(MTG[key]) return MTG[key]; const m=mat(kind,c); m.vertexColors=true; return MTG[key]=m; };
    const skinned=k=>{ const [kind,c]=base[k]||['cloth',0x888888], key='s|'+kind+'|'+c; if(MTG[key]) return MTG[key]; const m=mat(kind,c,{skinning:true}); return MTG[key]=m; };
    if(D.knight){ buildKnight.skipSeg=new Set(['head','plume']); }   /* his own sculpted head replaces the helm */ else buildKnight.bare=true;
    let K; try{ K=buildKnight(); } finally { buildKnight.bare=false; buildKnight.skipSeg=null; buildKnight.showHead=false; buildKnight.headMat=null; }
    const r=K.rig;
    if(!D.knight){ r.sword.visible=false; r.sheathP.visible=false; r.backP.visible=false; r.shM.visible=false; K.setWeapon=()=>{}; K.draw=()=>{}; K.dress=()=>{}; K.setLivery=()=>{}; }   // no knight's kit
    if(D.knight){   // Sir Joshua: the hero knight in his own colours — the swamp-green tabard, no cape — with his own head
      const M=K.M, G=new THREE.Color(base.tabard?base.tabard[1]:0x3f6a32); M.tunic.color.copy(G); if(M.field) M.field.color.copy(G).multiplyScalar(0.9);
      r.cape.visible=false; r.capeP.visible=false; K.shape&&K.shape(null);
      const keepG=K.onAnim; K.onAnim=(...a)=>{ M.tunic.color.copy(G); if(M.field) M.field.color.copy(G).multiplyScalar(0.9); if(keepG) keepG(...a); };   // his colours, whatever recolours the knight
      K.onAnim(0,0,0,0,0);
    }
    else if(BD) K.body=BODY.attach(K,BD,{material:skinned('skin'),keep:D.keep,keep32:D.keep32,keepI:D.keepI,keepKey:D.keepKey,shells:(D.shells||[]).map(sh=>Object.assign({},sh,{material:skinned(sh.mat),_src:sh}))});
    // the rigid pieces, each ridden by its joint; the skirts on their own hinges at the belt, moving as cloth
    const skF=new THREE.Group(), skB=new THREE.Group(); skF.position.set(0,0.06,0); skB.position.set(0,0.06,0); r.torso.add(skF); r.torso.add(skB);
    const U={F:{uBend:{value:0},uWave:{value:0},uT:{value:0},uSway:{value:0}},B:{uBend:{value:0},uWave:{value:0},uT:{value:0},uSway:{value:0}}};
    const seg={hip:{L:r.L.hip,R:r.R.hip},knee:{L:r.L.knee,R:r.R.knee},sh:{L:r.AL.sh,R:r.AR.sh},el:{L:r.AL.el,R:r.AR.el},hand:{L:r.AL.hand,R:r.AR.hand}};
    const clothM={};
    // each piece's geometry built once and shared by everyone wearing it (a hall of guards, a street of folk, is one set)
    // the face's joints (tools/sculpt_cast.py face()): each eye, its iris, its lid, the mouth and the lower lip — so they blink,
    //  look about, and talk
    const FG={}; if(D.face) for(const k in D.face){ const g=new THREE.Group(), p=D.face[k]; g.position.set(p[0],p[1],p[2]); r.head.add(g); FG[k]=g; g.userData.p0=g.position.clone(); }
    if(FG.lidL||FG.mouth){ FG.lidL&&FG.lidL.scale.set(1,0.001,1); FG.lidR&&FG.lidR.scale.set(1,0.001,1); FG.mouth&&FG.mouth.scale.set(1,0.08,1); K.userData.face=FG; }
    D.parts.forEach(pt=>{ const g=pt._g||(pt._g=new THREE.BufferGeometry()), fresh=!g.attributes.position; if(fresh){ const P=bin(pt.p,Int16Array), Q=bin(pt.q,Int8Array), C=bin(pt.c,Uint8Array), I=pt.i32?bin(pt.i,Uint32Array):bin(pt.i,Uint16Array);
      const n=C.length, pos=new Float32Array(n*3), nrm=new Float32Array(n*3), col=new Float32Array(n*3), uv=new Float32Array(n*2);
      for(let i=0;i<n*3;i++){ pos[i]=P[i]/16000; nrm[i]=Q[i]/127; }
      const soft=base[pt.mat]&&(base[pt.mat][0]==='cloth'||base[pt.mat][0]==='hair'||base[pt.mat][0]==='skin');
      for(let i=0;i<n;i++){ const a=Math.pow(C[i]/255,0.8), v=soft?0.6+0.4*a:0.32+0.68*a; col[i*3]=col[i*3+1]=col[i*3+2]=v;
        const ax=Math.abs(nrm[i*3]), az=Math.abs(nrm[i*3+2]); uv[i*2]=(ax>az?pos[i*3+2]:pos[i*3])*4; uv[i*2+1]=pos[i*3+1]*4; }
      g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nrm,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setIndex(new THREE.BufferAttribute(I,1)); }
      let m;
      if(pt.seg==='skirtF'||pt.seg==='skirtB'){ const s=pt.seg==='skirtF'?'F':'B', key=s+pt.mat; m=clothM[key]||(clothM[key]=cloth(rigid(pt.mat).clone(),U[s],0.9)); }
      else m=rigid(pt.mat);
      const par=FG[pt.seg+pt.side]?FG[pt.seg+pt.side]:pt.seg==='torso'?r.torso:pt.seg==='head'?r.head:pt.seg==='plume'?r.plume:pt.seg==='skirtF'?skF:pt.seg==='skirtB'?skB:pt.seg==='cape'?r.capeP:seg[pt.seg][pt.side];
      const mesh=new THREE.Mesh(g,m); mesh.castShadow=true; mesh.userData.mat=pt.mat; par.add(mesh); });
    // the cloth moves with the stride: the hinges follow the thighs, the hems flutter a beat behind them
    const sp=(o,tg,k,c,dt)=>{ const n=Math.max(1,Math.ceil(dt/0.017)), h=dt/n; for(let i=0;i<n;i++){ o.v+=(k*(tg-o.x)-c*o.v)*h; o.x+=o.v*h; } return o.x; };
    const S={f:{x:0,v:0},b:{x:0,v:0},cf:{x:0,v:0},cb:{x:0,v:0}}; let lx0=null;
    const prev=K.onAnim; K.onAnim=(dt,t,a,rf,s)=>{ if(prev) prev(dt,t,a,rf,s); const lx=r.L.hip.rotation.x, rx=r.R.hip.rotation.x; if(lx0===null) lx0=lx; const lv=Math.max(-3,Math.min(3,(lx-lx0)/Math.max(dt,1e-3))); lx0=lx;
      const hk=D.skirtHinge===undefined?1:D.skirtHinge; skF.rotation.x=sp(S.f,Math.min(lx,rx,0)*0.95*hk,240,19,dt); skB.rotation.x=sp(S.b,(Math.max(lx,rx,0)*0.9+0.04*a)*hk,200,16,dt);
      U.F.uBend.value=sp(S.cf,Math.max(-0.2,Math.min(0.25,-lv*0.03)),90,14,dt); U.B.uBend.value=sp(S.cb,Math.max(-0.2,Math.min(0.25,lv*0.03))+0.06*rf,90,14,dt);
      U.F.uWave.value=U.B.uWave.value=0.004+0.008*a; U.F.uT.value=U.B.uT.value=t*(1+a); };
    if(D.headScale) r.head.scale.setScalar(D.headScale);
    K.userData.castD=D; K.userData.castBase=base;   /* V193: body3.js reads what they wear */ K.scale.setScalar(D.scale||1); K.cast=D.name||name; K.userData.castK=K; K.userData.s0=K.scale.x; return K; };
})();
// the face at life: a blink every few seconds (now and then a double), the eyes drifting and settling, finding you when you
//  are near; in talk the mouth opens and closes with the words (the lower lip drops, the dark of the mouth shows), the
//  brows lift a little
function faceLife(K,st,t,dt,ph,talking,P,f){ const FG=K.userData.face; if(!FG) return;
  if(st.bk===undefined){ st.bk=1+((ph*97)%3); st.bl=0; st.lx=0; st.ly=0; st.gx=0; st.gy=0; st.gt=0; st.mo=0; }
  st.bk-=dt; if(st.bk<=0){ st.bl=0.16; st.bk=2.2+((Math.sin(t*1.7+ph*5)+1)*1.8)+(Math.sin(t*0.37+ph)>0.8?-1.9:0); }   // a blink every 2–6 s, now and then twice
  let lid=0; if(st.bl>0){ st.bl-=dt; const u=1-st.bl/0.16; lid=u<0.45?u/0.45:Math.max(0,1-(u-0.45)/0.55); }
  if(FG.lidL){ FG.lidL.scale.y=FG.lidR.scale.y=Math.max(0.001,lid); }
  if(FG.pupilL){ FG.pupilL.scale.y=FG.pupilR.scale.y=1-0.6*lid;
    st.gt-=dt; if(st.gt<=0){ st.gt=0.8+((Math.sin(t*2.3+ph*3)+1)*1.3); st.gx=Math.sin(t*5.1+ph)*0.7; st.gy=Math.sin(t*3.7+ph*2)*0.35; }   // idle saccades
    let tx=st.gx, ty=st.gy;
    if(P&&f){ const wp=new THREE.Vector3(); K.rig.head.getWorldPosition(wp); const a=Math.atan2(P.x-wp.x,P.z-wp.z)-K.rotation.y-K.rig.head.rotation.y-K.rig.torso.rotation.y; tx=Math.max(-1,Math.min(1,Math.sin(a)*1.6)); ty=0.15; }   // he looks at you
    st.lx+=(tx-st.lx)*Math.min(1,dt*14); st.ly+=(ty-st.ly)*Math.min(1,dt*14);
    for(const k of ['pupilL','pupilR']){ const g=FG[k], p0=g.userData.p0; g.position.set(p0.x+st.lx*0.0026,p0.y+st.ly*0.0018,p0.z); } }
  const want=talking?Math.max(0,Math.sin(t*13.0+ph))*(0.55+0.45*Math.abs(Math.sin(t*3.3+ph*2))):0;
  st.mo+=(want-st.mo)*Math.min(1,dt*(talking?22:8));
  if(FG.mouth){ FG.mouth.scale.y=0.08+st.mo*1.0; }
  if(FG.jaw){ const p0=FG.jaw.userData.p0; FG.jaw.position.y=p0.y-st.mo*0.0042; } }
// the cast at life: the hero's own idle (breathing, the weight shifting, glances) and walk; the head turns to you as
//  you come near; in talk they gesture and nod; and some wave as you arrive
function castPose(f,t,dt,P,talking){ const K=f.g, r=K.rig, ph=f.ph||0, d=Math.hypot(f.x-P.x,f.z-P.z);
  const st=K.userData._cs||(K.userData._cs={hy:0,met:false,wave:0,tk:0});
  if(d<3.2&&!st.met){ st.met=true; if(((Math.floor(ph*100)*7)%10)/10<0.45) st.wave=1.6; } if(d>6) st.met=false;
  /* V141: the townsfolk and the cast on the motion-capture rig too (rig.js) — a relaxed idle, a real walk, a nod as they talk —
     and their feet on the slope; each gets its rig the first time you come near (none on the Low graphics tier) */
  if(K.mocap===undefined){ K.npc=true; K.footIK=true; K._tph=ph*3; K.mocap=(typeof RIG!=='undefined'&&RIG.ok&&!(typeof HUD!=='undefined'&&HUD.tier==='low')&&d<18)?RIG.make({only:['idleCalm','walk','agree']}):undefined; }
  K._talk=st.tk;
  K.animate(Math.min(dt,0.05),f.walking?'walk':'idle',0.5);
  let hy=0; if(d<2.6){ let a=Math.atan2(P.x-f.x,P.z-f.z)-K.rotation.y; a=Math.atan2(Math.sin(a),Math.cos(a)); hy=Math.max(-0.75,Math.min(0.75,a)); }
  st.hy+=(hy-st.hy)*Math.min(1,dt*5); r.head.rotation.y+=st.hy*0.8; r.torso.rotation.y+=st.hy*0.2;
  st.tk+=((talking?1:0)-st.tk)*Math.min(1,dt*5);
  if(st.tk>0.01){ const g=Math.max(0,Math.sin(t*2.2+ph)), g2=Math.sin(t*1.4+ph); r.AR.sh.rotation.x+=st.tk*(-0.45-0.35*g); r.AR.el.rotation.x+=st.tk*(-0.7-0.2*g); r.AR.sh.rotation.z+=st.tk*0.15*g2;
    r.AL.sh.rotation.x+=st.tk*(-0.2-0.2*Math.max(0,Math.sin(t*1.9+ph+1.7))); r.AL.el.rotation.x+=st.tk*-0.5; r.head.rotation.x+=st.tk*0.06*Math.sin(t*3.1+ph); }
  faceLife(K,st,t,dt,ph,talking,d<4.5?P:null,f);
  if(st.wave>0&&!talking){ st.wave-=dt; const w=Math.min(1,st.wave*3,(1.6-st.wave)*4); r.AR.sh.rotation.z-=w*1.15; r.AR.sh.rotation.x+=w*-0.35; r.AR.el.rotation.x+=w*(-1.45+Math.sin(t*9)*0.25); }   /* V155: a friendly hand raised, elbow bent — not an arm thrust out */ }
// ════════════════════════════════════════════════════════════════
//  THE FOLK KIT — the townsfolk put together the way the 2D game makes its villagers (tools/sculpt_cast.py kit →
//  KIT_DATA.man / .woman): from the outfit's own colours (OUTFITS_2D: skin, hair, top, bottom, the hat or the apron),
//  the 2D rules for beards and headgear (VILLAGER_BASE), and a stable hash of who they are — which face, which hair, how
//  long the beard, the colour of the eyes, the height — so each looks the same every time and no two neighbours match.
//  folkPerson(outfit,O,L,opts) → a figure like castPerson's (it is one), posed by castPose.
// ════════════════════════════════════════════════════════════════
const KIT_BEARD={peasant:1,farmer:1,nomad:2,merchantD:1,monk:2,pilgrim:1,smith:2,soldier:1,hunter:1,woodcutter:2,survivor:1,embersmith:2,watcher:2,fisher:2,sailor:1};
const KIT_HAT={soldier:'helm',qmaster:'helm',sailor:'cap',hunter:'hood',hunterF:'hood',monk:'hood',monkF:'hood',pilgrim:'hood',shade:'hood',shadeF:'hood',watcher:'hood',nomad:'wrap',nomadF:'wrap',merchantD:'wrap',fisherF:'wrap'};
const KIT_ROBE=new Set(['monk','monkF','pilgrim','nomad','nomadF','shade','shadeF','watcher']);
const folkPerson=(function(){
  const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
  const vhash=s=>{ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };   // the 2D game's own (_vhash)
  const tone=(c,f)=>{ const C=new THREE.Color(c); return (f>=0?C.lerp(new THREE.Color(0xffffff),f):C.multiplyScalar(1+f)).getHex(); };
  const BITS={}, KEEP={}; let n=0;
  const bits=(b64)=>BITS[b64]||(BITS[b64]=bin(b64,Uint8Array));
  function keepFor(kit,names){ const key=kit.body+':'+names.join(','); if(KEEP[key]) return KEEP[key];
    const BD=CAST_BODY[kit.body], P=BD.parts.body, I=P.i32?bin(P.i,Uint32Array):bin(P.i,Uint16Array), covs=[bits(kit.headcov)].concat(names.map(nm=>bits(kit.pieces[nm].cov))), out=[];
    for(let t=0;t<kit.ntri;t++){ let hid=false; for(const c of covs) if((c[t>>3]>>(7-(t&7)))&1){ hid=true; break; } if(!hid) out.push(I[t*3],I[t*3+1],I[t*3+2]); }
    return KEEP[key]={I:P.n>65535?new Uint32Array(out):new Uint16Array(out),key}; }
  return function(ok,O,L,opts){ opts=opts||{}; L=L||{};
    const fem=/F$/.test(ok)||ok==='patronB', kid=ok==='child', kit=KIT_DATA[fem?'woman':'man']; if(!kit) return null;
    const h=vhash((opts.who||'')+'|'+ok+'|'+(opts.who?'':(n++)));
    const robe=KIT_ROBE.has(ok)||!!L.robe, hs=KIT_HAT[ok]||(O.hat?'brim':null);
    const lum=new THREE.Color(O.hair||0x6a4a2a).getHSL({}), old=lum.l>0.5&&lum.s<0.15;
    const pick=['head'+(h%3)];
    if(fem) pick.push(hs==='hood'?'hair_short':hs?['hair_long','hair_bob'][(h>>>11)%2]:['hair_long','hair_bun','hair_bob'][(h>>>11)%3]);
    else pick.push(hs?'hair_short':old&&(h>>>9)%3===0?'hair_ring':['hair_short','hair_mid','hair_swept'][(h>>>11)%3]);
    if(!fem&&!kid){ let b=KIT_BEARD[ok]||(L.beard?1:0); if(b>0) b=Math.max(1,b+((h>>>7)%3)-1); if(b) pick.push(b>=2?'beard_full':'beard_trim'); }
    if(hs) pick.push('hat_'+hs);
    pick.push(...(robe?['robe']:fem?['dress']:['tunic','trousers']));
    if(O.apron&&!robe) pick.push('apron');
    if(!fem&&(L.spear||L.halberd)) pick.push('spear'); if(L.mug) pick.push('mug');
    const names=pick.filter(nm=>kit.pieces[nm]); names.sort();
    const top=O.top||0x9a7a4a, bot=robe?top:(O.bottom||0x6f5436), hair=O.hair||0x6a4a2a, skin=O.skin||0xe0b080, hat=O.hat||O.apron||tone(top,0.2), apr=O.apron||0xe8e0d0;
    const iris=[0x4a6f8a,0x5a7a4a,0x7a5a3a,0x5a5a7a][(h>>>13)%4];
    const col={skin,brow:tone(hair,-0.3),lip:new THREE.Color(skin).lerp(new THREE.Color(0xb04a3a),0.28).getHex(),iris,irisL:tone(iris,0.35),irisD:tone(iris,-0.6),hair,
      top,topD:tone(top,-0.28),topL:tone(top,0.2),bottom:bot,bottomD:tone(bot,-0.3),belt:L.belt||0x4a3220,hat,hatD:tone(hat,-0.3),apron:apr,apronD:tone(apr,-0.2),
      steel:new THREE.Color(O.hat||0x9aa0b0).lerp(new THREE.Color(0xc8ccd4),0.5).getHex()};
    col.steelD=tone(col.steel,-0.35);
    const mats={}; for(const k in kit.mats){ mats[k]=[kit.mats[k][0], col[k]!==undefined?col[k]:kit.mats[k][1]]; }
    if(hs==='brim'&&ok!=='merchantD') mats.hat=['hair',hat];   // a straw hat
    const parts=[], shells=[]; names.forEach(nm=>{ const pc=kit.pieces[nm]; parts.push(...pc.parts); shells.push(...pc.shells); });
    const kp=keepFor(kit,names);
    const S=kid?0.62:(fem?0.92:1.0)*(0.96+((h>>>15)%9)*0.01)*(L.tall||1)*(L.small&&!kid?L.small:1);
    const hp=kit.pieces[names.find(nm=>/^head/.test(nm))]; const D={name:'folk:'+ok, face:hp&&hp.face, body:kit.body, mats, parts, shells, keepI:kp.I, keepKey:kp.key, scale:S, headScale:kid?1.38:0, skirtHinge:(robe||fem)?0.15:1};
    const K=castPerson(D,opts); K.userData.folkKit=names; return K; };
})();
