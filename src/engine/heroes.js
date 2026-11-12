// ════════════════════════════════════════════════════════════════
//  HEROES — the main cast rebuilt in the new knight's language (the Ocarina-era player knight, knight.js): chunky,
//  rounded, smooth-shaded forms; a big friendly head with big oval eyes (white, coloured iris, pupil, catch-light),
//  bold brows and a simple mouth; rounded boots and mitten hands; clothes as soft swelling shapes. The palette is the
//  sprites' own, eased a little toward the knight's steel, navy and gold so they stand together.
//  Same people, same tells: Sir Joshua the tallest of all, in plate with the swamp-green tabard and gold cross, great
//  pauldrons, the open steel cap with its green tuft, stubble and an easy smile; Princess Madison in the rose gown with
//  the gold bodice, long golden hair and the ruby tiara, shorter than the men; King Karl with the man-bun and its red tie,
//  the gold circlet, the full beard darker than his hair, the cream tunic with its golden fish; Robby in the mint cap
//  with the pink patch, the thin moustache, the white tee with the little navy print, khaki shorts and trainers.
//  heroPerson(look,opts) → the same merged, posable figure person() gives (arms 1/2, head 3, legs 4/5 for the pose shader).
// ════════════════════════════════════════════════════════════════
const HERO_LOOKS=new Set(['joshua','madison','king','robby','cheyenne','benji','dylan','ethan','cody','aldric','royalguard','sage','librarian','elijah','matthew','priest']);
function heroPerson(look,opts){ const g=new THREE.Group(), inner=new THREE.Group(); g.add(inner);
  const GL=look.startsWith('g:')?look.slice(2):null, GO=(opts&&opts.G)||{}, WHO=(opts&&opts.who)||'', VO=look.startsWith('v:')?look.slice(2):null, VK=VO==='child', hsv=VO?((VO.length*7+VO.charCodeAt(0)*13)%10)/10:0;
  const H=0.93*(GL?(GO.small||1)*(GO.tall||1)*(GO.plate?1.04:1):VO?(VK?0.66:0.95+hsv*0.07):({joshua:1.16,madison:0.9,king:1.03,robby:1.0,cheyenne:0.92,benji:0.6,dylan:1.07,ethan:0.97,cody:1.02,aldric:1.1,royalguard:1.08,sage:1.0,librarian:0.98,elijah:1.0,matthew:0.88,priest:1.0}[look]||1));   /* Joshua the tallest of all; the knight about Robby's height */ inner.scale.setScalar(H);;
  const mats={}, M=c=>mats[c]||(mats[c]=new THREE.MeshPhongMaterial({color:c}));
  const tag=(m,p)=>{ if(p) m.userData.part=p; inner.add(m); return m; };
  // an ellipsoid (rx,ry,rz), a tapered tube with round ends between two points, a lathed profile, a box
  const E=(c,x,y,z,rx,ry,rz,p,rot)=>{ const big=Math.max(rx,ry,rz)>0.07, m=new THREE.Mesh(new THREE.SphereGeometry(1,big?14:9,big?10:6),M(c)); m.position.set(x,y,z); m.scale.set(rx,ry,rz); if(rot) m.rotation.set(rot[0]||0,rot[1]||0,rot[2]||0); m.userData.noInk=Math.max(rx,ry,rz)<0.075; return tag(m,p); };   // small details carry no ink line (it would show through)
  const limb=(c,a,b,r0,r1,p,caps)=>{ const A=new THREE.Vector3(...a), Bv=new THREE.Vector3(...b), d=Bv.clone().sub(A), L=d.length();
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,12,1,false),M(c)); m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); tag(m,p);
    if(caps!==false){ E(c,...a,r0,r0,r0,p); E(c,...b,r1,r1,r1,p); } return m; };
  const Lt=(c,pts,x,y,z,p,sz,seg,ps,pl)=>{ const m=new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,yy])=>new THREE.Vector2(Math.max(0.0005,r),yy)),seg||20,ps===undefined?Math.PI:ps,pl||Math.PI*2),M(c)); m.position.set(x,y,z); if(sz) m.scale.z=sz; return tag(m,p); };
  const Bx=(c,w,h,d,x,y,z,p,rot)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c)); m.position.set(x,y,z); m.userData.noInk=Math.min(w,h,d)<0.04; if(rot) m.rotation.set(rot[0]||0,rot[1]||0,rot[2]||0); return tag(m,p); };
  const ease=(c,to,k)=>new THREE.Color(c).lerp(new THREE.Color(to),k).getHex();
  const NAVY=0x22365f, STEEL=0x7d8890, GOLD=0xd9ad48;
  // ── the body every hero shares (front is +z; adults about 1.5 tall before their own height) ──
  function body(o){ const W=o.W||1, sk=o.skin;
    [-1,1].forEach(sd=>{ const pt=sd>0?4:5, x=sd*0.115*W;
      if(o.boot!==null){ E(o.boot,x,0.075,0.035,0.095,0.08,0.145,pt); E(o.boot,x,0.17,0.0,0.082,0.07,0.085,pt); }
      limb(o.shin||o.leg,[x,0.17,0],[x,0.46,0],0.068,0.078,pt); limb(o.leg,[x,0.46,0],[x*0.95,0.76,0],0.08,0.1,pt); });
    if(!o.noHips) E(o.hips||o.leg,0,0.78,0,0.175*W,0.085,0.125);
    if(!o.noTorso) Lt(o.top,[[0.0,0.76],[0.17,0.77],[0.19,0.84],[0.198,0.93],[0.212,1.02],[0.215,1.07],[0.19,1.12],[0.12,1.155],[0.0,1.17]].map(([r,y])=>[r*W,y]),0,0,0,0,0.72,24);   // one smooth torso, waist to shoulders
    E(sk,0,1.155,0,0.06,0.05,0.06);                                                                   // neck
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2, s=[sd*0.255*W,1.07,0], e=[sd*0.285*W,0.86,0.01], h=[sd*0.3*W,0.67,0.035];
      E(o.shoulder||o.sleeve,s[0],s[1],0,0.085,0.08,0.085,pt);
      limb(o.sleeve,s,e,0.062,0.054,pt); limb(o.fore||o.sleeve,e,h,0.052,0.044,pt);
      E(o.hand||sk,h[0],h[1]-0.045,h[2]+0.005,0.048,0.058,0.05,pt); });
  }
  // ── the head: big and round, with the big oval eyes ──
  const HY=1.33;
  function head(o){ const sk=o.skin;
    E(sk,0,HY,0,0.19,0.2,0.18,3); [-1,1].forEach(sd=>E(sk,sd*0.183,HY-0.01,-0.005,0.032,0.048,0.03,3));          // the head, its ears
    E(ease(sk,0x8a4a30,0.12),0,HY-0.03,0.172,0.022,0.026,0.024,3);                                          // the nose
    const ey=HY+(o.eyeY||0.012), ex=0.072;
    [-1,1].forEach(sd=>{ const x=sd*ex, w=(o.eyeW||1), h=(o.eyeH||1);
      E(0xfbf8f0,x,ey,0.152,0.043*w,0.05*h,0.024,3);
      E(o.eye,x+sd*0.002,ey-0.004,0.169,0.027*w,0.032*h,0.012,3); E(0x141010,x+sd*0.002,ey-0.004,0.176,0.014*w,0.018*h,0.008,3);
      E(0xffffff,x-0.01,ey+0.01,0.181,0.008,0.008,0.005,3);
      if(o.lids) E(o.lidC||sk,x,ey+0.03*h,0.158,0.047*w,0.032*h,0.027,3);                                     // heavy, half-lowered lids
      if(o.lash) Bx(o.lash,0.07*w,0.012,0.02,x,ey+0.046*h,0.158,3,[0.2,0,-sd*0.12]);                         // a dark lid line (the ladies)
      Bx(o.brow||0x3a2414,0.07,o.browH||0.02,0.022,x,ey+0.075*h,0.152,3,[0.25,0,sd*(o.browTilt||0.08)]); });
    if(o.cheeks) [-1,1].forEach(sd=>E(o.cheeks,sd*0.11,HY-0.04,0.142,0.034,0.022,0.012,3));
    const my=HY-0.095;
    if(o.mouth==='smile'){ const t=new THREE.Mesh(new THREE.TorusGeometry(0.036,0.008,5,12,Math.PI),M(o.lip||0x8a3a30)); t.position.set(0,my+0.02,0.165); t.rotation.set(0.2,0,Math.PI); tag(t,3); }
    else if(o.mouth!=='none') Bx(o.lip||0x8a3a30,0.05,0.012,0.02,0,my,0.165,3); }
  // ── the cast ──
  if(look==='joshua'){   // Sir Joshua: plate in steel, the swamp-green tabard with its gold cross, great pauldrons, the open cap
    const AR=ease(0x9aa0b0,STEEL,0.35), ARL=ease(0xc8ccd8,STEEL,0.3), ARD=ease(0x6a707e,STEEL,0.3), TAB=ease(0x4a7a3a,0x2f5a2a,0.25), TABL=0x5f9a4c, sk=0xd8a878;
    body({skin:sk,leg:ARD,shin:AR,boot:0x3a3e48,top:AR,sleeve:ARD,fore:AR,shoulder:ARL,hand:0x3a3e48,W:1.18,hips:ARD});
    E(ARL,0,0.98,0.035,0.19*1.18,0.17,0.135).userData.noInk=true;                                                                       // the breastplate's swell
    [-1,1].forEach(sd=>{ E(ARL,sd*0.12,0.47,0.06,0.07,0.065,0.05,sd>0?4:5); E(GOLD,sd*0.12,0.47,0.105,0.03,0.035,0.012,sd>0?4:5); });   // knee-cops, their gold studs
    Bx(TAB,0.25,0.58,0.03,0,0.68,0.165); Bx(TABL,0.25,0.04,0.032,0,0.97,0.165); Bx(TAB,0.25,0.5,0.03,0,0.72,-0.15);     // the tabard, front and back
    Bx(GOLD,0.055,0.26,0.012,0,0.75,0.183); Bx(GOLD,0.16,0.05,0.012,0,0.8,0.183);                                    // the gold cross
    E(0x5b3a1f,0,0.82,0,0.215,0.03,0.165); Bx(GOLD,0.06,0.05,0.02,0,0.82,0.17);                                     // sword-belt and buckle
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(ARL,sd*0.29,1.1,0,0.13,0.1,0.12,pt); E(GOLD,sd*0.29,1.05,0.0,0.132,0.016,0.122,pt); });   // the great pauldrons, gold-rimmed
    { const sh=new THREE.Group(); sh.position.set(0.25,0.8,0.02); sh.rotation.set(-2.3,0,-0.2); inner.add(sh); const add=(m,y)=>{ m.position.y=y; sh.add(m); };   // his sword, sheathed at his left hip
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.022,0.62,10),M(0x4a3020)),0.4); add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.12,8),M(0x5b3a1f)),-0.02); add(new THREE.Mesh(new THREE.BoxGeometry(0.17,0.03,0.04),M(GOLD)),0.07); }
    head({skin:sk,eye:0x4a6a9a,brow:0x5a3a20,mouth:'smile'});
    E(0x6a4a2a,0,HY-0.02,-0.06,0.188,0.17,0.13,3);                                                                    // his brown hair under the cap, at the back
    E(ease(sk,0x6a4a2a,0.35),0,HY-0.085,0.05,0.16,0.1,0.135,3);                                                     // the stubble along his jaw
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,10,0,Math.PI*2,0,Math.PI*0.5),M(AR)); cap.position.set(0,HY+0.04,-0.005); cap.scale.set(1,0.88,1); tag(cap,3);   // the open steel cap
    E(ARL,0,HY+0.045,0,0.207,0.022,0.198,3); [-1,1].forEach(sd=>Bx(AR,0.025,0.15,0.11,sd*0.19,HY-0.06,0.0,3));     // its brow-band, cheek-guards
    E(TAB,0,HY+0.25,-0.01,0.035,0.07,0.035,3,[-0.3,0,0]);                                                             // the green tuft
  }
  if(look==='madison'){   // Princess Madison: the rose gown, the gold bodice, long golden hair, the ruby tiara
    const R=0xc85a7a, RL=0xe88aa4, RD=0x9a3a5a, GO=ease(0xe8c766,GOLD,0.3), HC=0xe8c05a, HD=0xc89a3a, sk=0xf4cca8;
    body({skin:sk,leg:R,boot:null,top:R,sleeve:RL,fore:R,W:0.92,noHips:true});
    Lt(R,[[0.0,0.0],[0.36,0.0],[0.37,0.04],[0.33,0.22],[0.26,0.46],[0.2,0.66],[0.15,0.82],[0.0,0.82]],0,0,0,0,0.92,26);   // the gown, belling out
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const f=E(i%2?RL:RD,Math.sin(a)*0.25,0.33,Math.cos(a)*0.23,0.03,0.3,0.03,0,[-Math.cos(a)*0.2,0,Math.sin(a)*0.2]); }   // its folds, light and deep
    E(RD,0,0.025,0,0.375,0.03,0.35);                                                                                  // the hem
    E(GO,0,0.83,0,0.155,0.03,0.125); Bx(GO,0.07,0.3,0.03,0,0.97,0.135); for(let i=0;i<3;i++) E(0xfff8d0,0,0.9+i*0.07,0.152,0.012,0.012,0.008);   // gold waist, placket, buttons
    E(GO,0,1.12,0.02,0.13,0.025,0.11);                                                                                 // the gold neckline
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(RL,sd*0.24,1.06,0,0.1,0.09,0.095,pt); E(GO,sd*0.272,0.85,0.012,0.056,0.016,0.056,pt); });   // puffed sleeves, gold cuffs
    head({skin:sk,eye:0x3a6ab0,brow:0xb08a40,lash:0x2a1a14,mouth:'smile',lip:0xc85060,cheeks:0xf0a0a8,eyeH:1.12});
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,12,0,Math.PI*2,0,Math.PI*0.52),M(HC)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.32; tag(hb,3);   // her hair, its hairline back from the brow
    E(HC,0,HY-0.14,-0.11,0.18,0.3,0.1,3);                                                                              // its long fall down her back
    [-1,1].forEach(sd=>{ for(let i=0;i<4;i++) E(i%2?HC:HD,sd*(0.175-i*0.004),HY-0.06-i*0.1,0.02,0.05-i*0.004,0.07,0.05,3); });   // long locks either side
    for(let i=0;i<5;i++) E(i%2?HC:0xf0d070,(i-2)*0.05,HY+0.15-Math.abs(i-2)*0.012,0.135-Math.abs(i-2)*0.02,0.042,0.03,0.035,3,[-0.5,0,0]);   // a soft fringe
    E(GO,0,HY+0.165,0.03,0.13,0.018,0.12,3,[-0.3,0,0]);
    for(let i=0;i<5;i++){ const a=(i-2)*0.42; E(GO,Math.sin(a)*0.13,HY+0.2+(i===2?0.02:0),0.05+Math.cos(a)*0.1,0.014,i===2?0.04:0.026,0.014,3); }   // the tiara's points
    E(0xd83040,0,HY+0.175,0.165,0.018,0.018,0.012,3); E(0xfff8d0,0,HY+0.245,0.135,0.01,0.01,0.008,3);                // its ruby and pearl
  }
  if(look==='king'){   // King Karl: the man-bun and red tie, gold circlet, full beard darker than his hair, cream tunic with golden fish
    const CR=0xf0ead8, YK=ease(0xf2c14e,GOLD,0.3), BL=ease(0x3a4a8a,NAVY,0.3), BR=0x5b3a1f, HC=0x8a5a30, BD=0x6f4522, sk=0xe6b48c;
    body({skin:sk,leg:BL,boot:BR,top:CR,sleeve:CR,fore:sk,W:1.06,hips:CR});
    Lt(CR,[[0.22,0.6],[0.205,0.74],[0.19,0.82]],0,0,0,0,0.78,24);                                                   // the tunic's skirt
    [-1,1].forEach(sd=>E(BR,sd*0.115,0.25,0.0,0.085,0.1,0.09,sd>0?4:5));                                              // boot tops
    E(YK,0,1.1,0,0.18,0.06,0.13);                                                                                       // the gold yoke
    E(BR,0,0.82,0,0.21,0.03,0.155); Bx(YK,0.07,0.06,0.025,0,0.82,0.16); Bx(BR,0.1,0.12,0.06,-0.19,0.72,0.07);          // belt, buckle, pouch
    for(const [fx,fy,dir] of [[-0.07,1.0,1],[0.08,0.93,-1],[-0.04,0.86,1],[0.1,0.7,-1]]){ E(YK,fx,fy,0.152,0.03,0.016,0.008); const t=new THREE.Mesh(new THREE.ConeGeometry(0.018,0.03,3),M(YK)); t.position.set(fx-dir*0.04,fy,0.15); t.rotation.z=dir*Math.PI/2; t.userData.noInk=true; tag(t); }   // the golden fish
    [-1,1].forEach(sd=>E(YK,sd*0.284*1.06,0.86,0.01,0.056,0.016,0.056,sd>0?1:2));                                       // gold cuffs
    head({skin:sk,eye:0x4a6a3a,brow:0x5a3a20,browH:0.026,mouth:'flat'});
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.203,18,12,0,Math.PI*2,0,Math.PI*0.5),M(HC)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.36; tag(hb,3);
    E(BD,0,HY-0.11,0.09,0.16,0.13,0.11,3); [-1,1].forEach(sd=>E(BD,sd*0.16,HY-0.04,0.04,0.035,0.08,0.05,3));          // the full beard, sideburns into it
    [-1,1].forEach(sd=>E(BD,sd*0.04,HY-0.075,0.17,0.045,0.016,0.02,3,[0,0,-sd*0.25]));                                  // moustache
    E(HC,0,HY+0.19,-0.1,0.07,0.065,0.07,3); E(0xa8703c,0.015,HY+0.225,-0.1,0.03,0.022,0.03,3); E(0xc0432f,0,HY+0.15,-0.105,0.045,0.018,0.045,3,[0.5,0,0]);   // the man-bun, its highlight, its red tie
    E(YK,0,HY+0.075,0,0.2,0.024,0.188,3); E(0xc0432f,0,HY+0.075,0.19,0.02,0.02,0.012,3);                               // the gold circlet, its red gem
  }
  if(look==='robby'){   // Robby: the mint cap with the pink patch, the thin moustache, white tee with the navy print, khaki shorts
    const TEE=0xf4f2ec, KH=0xc8b89a, sk=0xe8b890;
    body({skin:sk,leg:KH,shin:sk,boot:0xf0f0f0,top:TEE,sleeve:TEE,fore:sk,W:1.0,hips:KH});
    [-1,1].forEach(sd=>{ E(0xd2cfc8,sd*0.115,0.04,0.035,0.098,0.03,0.15,sd>0?4:5); E(0xf0f0f0,sd*0.115,0.19,0,0.07,0.03,0.07,sd>0?4:5); });   // trainer soles, socks
    E(0xd2cfc8,0,0.83,0,0.205,0.02,0.15);                                                                             // the tee's hem
    Bx(0x3a5a78,0.1,0.065,0.012,0,0.99,0.15); Bx(TEE,0.045,0.025,0.013,0,1.0,0.152);                                  // the little navy print
    head({skin:sk,eye:0x5a3a20,brow:0x3a2418,mouth:'flat',lip:0xa06048});
    E(0x3a2418,0,HY-0.01,-0.07,0.185,0.16,0.13,3);                                                                    // dark hair below the cap
    [-1,1].forEach(sd=>E(0x4a2a1c,sd*0.03,HY-0.068,0.17,0.035,0.01,0.016,3,[0,0,sd*0.2]));                              // the thin moustache
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.21,18,10,0,Math.PI*2,0,Math.PI*0.5),M(0xa8d4bc)); cap.position.set(0,HY+0.06,-0.01); cap.scale.set(1,0.78,1.02); tag(cap,3);
    E(0x7fae98,0,HY+0.06,0,0.212,0.018,0.205,3);                                                                       // the band
    const bill=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.02,20,1,false,-Math.PI/2,Math.PI),M(0x7fae98)); bill.position.set(0,HY+0.07,0.13); bill.scale.set(1,1,1.05); bill.rotation.x=-0.1; tag(bill,3);
    E(0xf0a0b8,0,HY+0.15,0.17,0.035,0.022,0.01,3,[-0.6,0,0]);                                                          // the pink patch
  }
  if(look==='cheyenne'){   // Cheyenne: the straw hat, blonde hair, dark glasses and a smile, the narrow white summer dress, flowers on her arm, the bag strap and black pouch
    const WH=0xf7f5ef, WD=0xdad7ce, HC=0xecd691, sk=0xf0c49a;
    body({skin:sk,leg:sk,boot:0xe8dcc8,top:WH,sleeve:sk,fore:sk,W:0.88,noHips:true});
    Lt(WH,[[0.0,0.42],[0.27,0.42],[0.25,0.55],[0.2,0.7],[0.165,0.8],[0.0,0.8]],0,0,0,0,0.85,24); E(WD,0,0.425,0,0.272,0.018,0.232);   // the skirt flaring to the knee, its hem
    E(WD,0,0.8,0,0.16,0.02,0.12);                                                                                      // the drawn-in waist
    [-1,1].forEach(sd=>E(WH,sd*0.13,1.1,0.01,0.035,0.05,0.04,sd>0?1:2));                                              // the dress's straps
    Bx(0x3a3a44,0.03,0.5,0.02,0.02,0.94,0.14,0,[0,0,0.62]); Bx(0x2e2e36,0.12,0.12,0.06,0.2,0.74,0.1); Bx(0xe8e4dc,0.12,0.025,0.062,0.2,0.8,0.1);   // the bag strap, the pouch at her hip
    for(let i=0;i<3;i++) E(0x8fb6cf,0.3,0.83+i*0.055,0.05,0.02,0.02,0.02,1);                                           // flowers on her arm
    head({skin:sk,eye:0x5a3a20,brow:0xb08a40,lash:0x2a1a14,mouth:'smile',lip:0xc9806e,cheeks:0xf0a8a0});
    Bx(0x2a2430,0.24,0.06,0.03,0,HY+0.012,0.175,3); [-1,1].forEach(sd=>Bx(0x2a2430,0.015,0.015,0.17,sd*0.16,HY+0.02,0.08,3));   // dark glasses, their arms
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,12,0,Math.PI*2,0,Math.PI*0.55),M(HC)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.34; tag(hb,3);
    E(HC,0,HY-0.08,-0.09,0.19,0.18,0.1,3); [-1,1].forEach(sd=>E(HC,sd*0.175,HY-0.1,0.02,0.05,0.11,0.06,3));          // blonde, falling to the shoulders
    E(0xb08f56,0,HY+0.12,0,0.33,0.018,0.32,3); E(0xd8b478,0,HY+0.18,-0.005,0.17,0.08,0.165,3); E(0xb08f56,0,HY+0.135,0,0.172,0.02,0.168,3);   // the straw hat: brim, crown, band
  }
  if(look==='benji'){   // Benji, two: the junior fire helmet with its wide brim and cream badge, the green striped shirt, khaki dungarees, the unimpressed mouth
    const GR=0x8fbf7a, GD=0x6fa35c, KH=0xcbbd96, RD=0xc0261e, sk=0xf0c49a;
    body({skin:sk,leg:KH,boot:0x8a6a4a,top:GR,sleeve:GR,fore:sk,W:1.1,hips:KH});
    [0.92,1.02].forEach(y=>E(0xe8f0d8,0,y,0,0.215*1.1,0.018,0.15)); E(GD,0,0.97,0,0.218*1.1,0.015,0.152);             // the stripes
    Lt(KH,[[0.0,0.74],[0.19*1.1,0.74],[0.2*1.1,0.86],[0.0,0.86]],0,0,0,0,0.73,20); Bx(KH,0.2,0.16,0.03,0,0.93,0.15); [-1,1].forEach(sd=>Bx(KH,0.03,0.24,0.02,sd*0.08,1.0,0.14));   // dungarees: seat, bib, straps
    head({skin:sk,eye:0x5a3a20,brow:0x5a3a20,mouth:'flat',lip:0xc98a78,cheeks:0xf0a8a0,eyeH:1.1});
    E(0x3a2418,0,HY+0.1,0.1,0.15,0.05,0.08,3);                                                                         // a dark brown fringe
    const hm=new THREE.Mesh(new THREE.SphereGeometry(0.215,18,10,0,Math.PI*2,0,Math.PI*0.5),M(RD)); hm.position.set(0,HY+0.08,0); hm.scale.set(1,0.8,1.05); tag(hm,3);   // the junior fire helmet
    E(0x8f1a14,0,HY+0.08,0,0.22,0.02,0.225,3); E(RD,0,HY+0.075,-0.05,0.3,0.016,0.31,3);                                // its band, the wide brim long at the back
    Bx(0xe8dcbb,0.07,0.08,0.02,0,HY+0.19,0.16,3,[-0.5,0,0]); E(0xa82018,0,HY+0.24,0,0.022,0.03,0.17,3);               // the cream badge, the ridge over the top
  }
  if(look==='dylan'){   // Dylan: broad and tall, shaggy brown hair, stubbled square jaw, sly half-lidded eyes and a lopsided grin, the patched olive coat
    const T=ease(0x77714a,0x5a5a3a,0.15), TL=0x958d5e, TU=0x565132, sk=0xe8b890, HC=0x6b4424;
    body({skin:sk,leg:0x8a6e50,boot:0x4a3a2a,top:T,sleeve:T,fore:TL,W:1.15,hips:T});
    Lt(T,[[0.235,0.42],[0.22,0.6],[0.205,0.78],[0.195,0.85]],0,0,0,0,0.78,24);                                      // the long coat, to the knee
    E(0x8a6a3a,0,0.82,0,0.225,0.03,0.165); Bx(0xcaa06a,0.06,0.05,0.025,0,0.82,0.165);                                // belt and buckle
    Bx(TU,0.03,0.75,0.02,0.04,0.78,0.16); Bx(0xa45e3a,0.1,0.09,0.012,0.12,0.6,0.17,0,[0,0.4,0]); Bx(0xa45e3a,0.09,0.08,0.012,-0.12,1.02,0.15,0,[0,-0.3,0.2]);   // the front edge, the patches
    head({skin:sk,eye:0x3a2a1a,brow:0x452a14,browH:0.026,browTilt:0.2,lids:true,mouth:'flat',lip:0x5a2e22});
    E(ease(sk,0x7a5a3a,0.35),0,HY-0.09,0.04,0.17,0.1,0.14,3);                                                        // the stubbled square jaw
    Bx(0xfbf6ea,0.04,0.012,0.012,0.012,HY-0.09,0.172,3,[0,0,0.2]); Bx(0x5a2e22,0.07,0.014,0.02,0.01,HY-0.094,0.168,3,[0,0,0.22]);   // the lopsided grin
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.212,18,12,0,Math.PI*2,0,Math.PI*0.56),M(HC)); hb.position.set(0,HY+0.035,-0.02); hb.rotation.x=-0.28; tag(hb,3);   // shaggy hair
    for(let i=0;i<9;i++){ const a=(i/8-0.5)*Math.PI*1.25; E(i%3?HC:0x8f6238,Math.sin(a)*0.15,HY+0.15-(i%3)*0.012,Math.cos(a)*0.13,0.045,0.06,0.04,3,[0.6,a,0]); }   // locks falling over the brow
    for(let i=0;i<6;i++){ const a=Math.PI+(i/5-0.5)*Math.PI*0.9; E(0x5a3a1e,Math.sin(a)*0.16,HY-0.02-(i%2)*0.04,Math.cos(a)*0.14,0.05,0.07,0.045,3); }
  }
  if(look==='ethan'){   // Ethan, the wild man: spiky black hair exploding out, wide wild eyes with tiny pupils, a screaming mouth, the torn red tunic, bare arms and feet, his stick
    const RT=0x9a3a2c, RL=0xb8563e, RD=0x6e241c, HH=0x1c1a22, sk=0xe2b88c;
    body({skin:sk,leg:0x6a5a44,shin:sk,boot:null,top:RT,sleeve:sk,fore:sk,W:0.92,hips:0x6a5a44});
    [-1,1].forEach(sd=>E(sk,sd*0.105,0.045,0.04,0.075,0.045,0.12,sd>0?4:5));                                          // bare feet
    for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; const c=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.1,4),M(i%2?RD:RL)); c.position.set(Math.sin(a)*0.165,0.74,Math.cos(a)*0.12); c.rotation.x=Math.PI; c.userData.noInk=true; tag(c); }   // the ragged hem
    E(0xc9a878,0,0.84,0,0.18,0.025,0.135); Bx(0x2c1a1a,0.03,0.12,0.012,-0.06,0.98,0.15); Bx(0x2c1a1a,0.03,0.14,0.012,0.08,1.05,0.15);   // rope belt, rips
    { const st=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.026,1.2,8),M(0x8a5a2c)); st.position.set(-0.3,0.95,0.06); st.rotation.x=-0.15; tag(st,2); E(0x6a4220,-0.3,1.55,0.15,0.035,0.035,0.035,2); }   // the stick, raised
    head({skin:sk,eye:0x3a2a1a,brow:HH,browH:0.024,browTilt:-0.35,eyeW:1.12,eyeH:1.35,mouth:'none'});
    E(0x5a1e1a,0,HY-0.1,0.15,0.05,0.04,0.03,3); Bx(0xf4ece0,0.07,0.016,0.02,0,HY-0.075,0.17,3);                       // the screaming mouth, his teeth
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,10,0,Math.PI*2,0,Math.PI*0.5),M(HH)); cap.position.set(0,HY+0.04,-0.01); cap.rotation.x=-0.3; tag(cap,3);
    for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, sp=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.2,5),M(i%4?HH:0x3a3644)); sp.position.set(Math.sin(a)*0.15,HY+0.12,Math.cos(a)*0.14-0.02); sp.rotation.order='YXZ'; sp.rotation.y=a; sp.rotation.x=i%2?0.75:1.15; sp.userData.noInk=true; tag(sp,3); }   // the spikes, bursting outward
    for(let i=0;i<5;i++){ const sp=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.19,5),M(HH)); sp.position.set((i-2)*0.06,HY+0.24,(i%2)*0.04-0.02); sp.rotation.z=-(i-2)*0.3; sp.userData.noInk=true; tag(sp,3); }
  }
  if(look==='cody'){   // Ranger Cody: the forest-green hood up with its gold edge, steady green eyes, a trimmed beard, steel pauldrons and breastplate over leather, the gold leaf clasp, the green cape
    const G=0x3f5a3a, GD=0x2a3e28, ST=ease(0xb8c0cc,STEEL,0.35), STL=ease(0xe6ebf2,STEEL,0.3), LE=0x7a5634, sk=0xd8a47a;
    body({skin:sk,leg:0x4e3620,boot:0x2e2014,top:LE,sleeve:LE,fore:LE,hand:0x4e3620,W:1.05,hips:LE});
    Lt(LE,[[0.22,0.6],[0.205,0.74],[0.19,0.82]],0,0,0,0,0.78,24);                                                    // the jerkin's skirt
    E(ST,0,1.0,0.03,0.2*1.05,0.15,0.13); E(STL,0,1.13,0.02,0.15,0.025,0.11);                                          // the breastplate over it
    E(0x4e3620,0,0.83,0,0.21,0.03,0.155); Bx(0xd4a93e,0.06,0.05,0.025,0,0.83,0.16);
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(ST,sd*0.27,1.1,0,0.11,0.08,0.105,pt); E(STL,sd*0.27,1.15,0,0.075,0.025,0.07,pt); });   // steel pauldrons
    Lt(GD,[[0.25,0.3],[0.24,0.6],[0.22,0.9],[0.2,1.1]],0,0,-0.03,0,0.75,20,Math.PI*0.62,Math.PI*0.76);               // the green cape, behind
    E(0xd4a93e,0,1.16,0.12,0.045,0.035,0.02,3); E(0xf2d27a,0,1.165,0.135,0.02,0.015,0.01,3);                         // the gold leaf clasp at his throat
    head({skin:sk,eye:0x2a6a4a,brow:0x3a2616,mouth:'smile',lip:0x8a4a38});
    E(0x5a3c22,0,HY-0.11,0.08,0.15,0.1,0.11,3); [-1,1].forEach(sd=>E(0x5a3c22,sd*0.15,HY-0.05,0.04,0.035,0.08,0.05,3));   // the trimmed beard
    E(0x2a1c14,0,HY+0.06,-0.02,0.19,0.13,0.18,3);                                                                     // hair, in the hood's shadow
    const hood=new THREE.Mesh(new THREE.SphereGeometry(0.255,22,14,Math.PI/2+0.78,Math.PI*2-1.56,0,Math.PI*0.84),M(G)); hood.position.set(0,HY+0.02,-0.02); hood.scale.set(1,1.06,1.05); tag(hood,3);   // the hood, pulled up
    const ed=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.013,6,24,Math.PI*1.25),M(0xd4a93e)); ed.position.set(0,HY+0.0,0.15); ed.rotation.set(-0.2,0,-0.125*Math.PI); tag(ed,3);   // its gold edge
    Lt(G,[[0.2,1.1],[0.15,1.2],[0.1,1.22]],0,0,0,0,0.85,20);                                                         // the hood's fall on his shoulders
  }
  // ── shared pieces: a robe to the floor, a closed great helm (no face shows), a hood up, a long beard ──
  const robe=(c,cl,cd,hem,top)=>{ Lt(c,[[0.0,0.0],[0.31,0.0],[0.315,0.03],[0.29,0.25],[0.25,0.55],[0.215,0.8],(top||[0.2,1.0]),[0.17,1.1],[0.1,1.15],[0.0,1.16]],0,0,0,0,0.8,26);
    E(hem,0,0.02,0,0.318,0.025,0.258); for(let i=0;i<5;i++){ const a=(i/5-0.4)*Math.PI*1.3; E(i%2?cl:cd,Math.sin(a)*0.23,0.3,Math.cos(a)*0.185,0.025,0.28,0.025,0,[-Math.cos(a)*0.17,0,Math.sin(a)*0.17]).userData.noInk=true; } };
  const greatHelm=(c,visor,band,crest)=>{ E(c,0,HY-0.12,0,0.085,0.06,0.085,3);
    Lt(c,[[0.17,-0.2],[0.19,-0.12],[0.2,0.0],[0.197,0.07],[0.18,0.13],[0.14,0.18],[0.08,0.205],[0.0,0.212]].map(([r,y])=>[r,HY+y]),0,0,0,3,0.95,24);
    const v=new THREE.Mesh(new THREE.CylinderGeometry(0.203,0.203,0.04,18,1,true,-0.6,1.2),M(visor)); v.position.set(0,HY+0.02,0); v.scale.z=0.95; tag(v,3);
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.206,0.206,0.026,20,1,true,-0.8,1.6),M(band)); b.position.set(0,HY+0.07,0); b.scale.z=0.95; tag(b,3); Bx(band,0.022,0.13,0.02,0,HY-0.06,0.19,3);
    if(crest) crest(); };
  // ── helmets by rank and post ──
  // the general's: white enamel great helm under a gold crown of points, gold filigree bands over the crown, gold wings swept
  //  back from the temples, a gold cross on the visor, and a tall crimson-and-gold plume
  const generalHelm=(c,visor,gold,goldL,plumeC)=>{ greatHelm(c,visor,gold);
    Bx(gold,0.026,0.24,0.022,0,HY-0.03,0.197,3);                                                                          // the visor's gold cross (upright; the slit and band are its arms)
    for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, cn=new THREE.Mesh(new THREE.ConeGeometry(0.03,i%2?0.07:0.12,4),M(i%2?gold:goldL)); cn.position.set(Math.sin(a)*0.15,HY+0.2+(i%2?0.02:0.045),Math.cos(a)*0.14); cn.userData.noInk=true; tag(cn,3); }   // the crown's points
    E(gold,0,HY+0.17,0,0.168,0.026,0.16,3); E(gold,0,HY+0.19,0,0.13,0.035,0.125,3);                                     // the crown's band, its gilded cap
    [-0.6,0.6].forEach(a=>{ const b=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.008,5,18,Math.PI*0.42),M(goldL)); b.position.set(0,HY+0.0,0); b.rotation.set(0,a+Math.PI/2,Math.PI*0.32); b.userData.noInk=true; tag(b,3); });   // filigree bands
    [-1,1].forEach(sd=>{ const wg=new THREE.Group(); wg.position.set(sd*0.2,HY+0.05,-0.02); wg.rotation.set(0,sd*0.35,0); inner.add(wg);   // great gold wings, rooted at the temples
      for(let i=0;i<4;i++){ const L=0.2-i*0.03, f=new THREE.Mesh(new THREE.BoxGeometry(0.03,L,0.05),M(i%2?goldL:gold)); f.geometry.translate(0,L/2,0); f.position.set(0,-i*0.03,-i*0.02); f.rotation.z=-sd*(0.35+i*0.28); f.userData.part=3; f.userData.noInk=true; wg.add(f); } });
    for(let i=0;i<7;i++) E(i%2?goldL:plumeC,0,HY+0.3+i*0.045-i*i*0.005,0.02-i*0.06,0.038,0.065,0.055,3,[-0.28*i,0,0]);   // the tall plume, crimson and gold
  };
  // the town guard: a kettle hat — a round steel crown with a broad brim sloping down all round, a rolled rim, a knob on top
  const kettleHat=(c,band,par,at)=>{ const g2=new THREE.Group(); if(at){ g2.position.set(...at.p); g2.rotation.set(...at.r); } else g2.position.set(0,0,0); 
    const add=(m)=>{ g2.add(m); return m; }, y0=at?0:HY;
    const cr=add(new THREE.Mesh(new THREE.SphereGeometry(0.205,18,10,0,Math.PI*2,0,Math.PI*0.5),M(c))); cr.position.set(0,y0+0.06,0); cr.scale.y=0.78;
    add(new THREE.Mesh(new THREE.LatheGeometry([[0.2,0.055],[0.27,0.015],[0.33,-0.03],[0.335,-0.042],[0.33,-0.05],[0.2,0.045]].map(([r,y])=>new THREE.Vector2(r,y+y0)),24),M(c)));
    const rb=add(new THREE.Mesh(new THREE.TorusGeometry(0.206,0.012,6,24),M(band))); rb.position.y=y0+0.06; rb.rotation.x=Math.PI/2;
    const kn=add(new THREE.Mesh(new THREE.SphereGeometry(0.025,8,6),M(band))); kn.position.y=y0+0.225;
    g2.children.forEach(m=>{ m.userData.noInk=true; }); inner.add(g2); g2.traverse(m=>{ if(m.isMesh) m.userData.part=par; }); return g2; };
  // the quartermaster: a spangenhelm — a steel cone banded in gold, a nasal bar down the nose, a mail aventail round the neck
  const spangen=(c,band,mail)=>{ Lt(c,[[0.205,HY+0.04],[0.2,HY+0.1],[0.16,HY+0.18],[0.09,HY+0.25],[0.02,HY+0.29],[0.0,HY+0.295]],0,0,-0.005,3,1,20);
    E(band,0,HY+0.05,0,0.21,0.02,0.205,3); [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.24,0.02),M(band)); b.position.set(Math.sin(a)*0.13,HY+0.16,Math.cos(a)*0.12); b.rotation.set(Math.cos(a)*-0.62,0,Math.sin(a)*0.62); b.userData.noInk=true; tag(b,3); });
    Bx(c,0.03,0.11,0.02,0,HY-0.01,0.19,3);                                                                                   // the nasal
    Lt(mail,[[0.2,HY+0.05],[0.215,HY-0.05],[0.22,HY-0.15],[0.26,HY-0.2],[0.29,1.12],[0.24,1.1]],0,0,-0.01,3,0.95,22,Math.PI*0.62,Math.PI*0.76); };   // the mail at the back and sides
  // the captain: a sallet with its visor raised — the round bowl sweeping to a tail behind, a gold ridge, a blue-and-white plume
  const sallet=(c,gold,plumeA,plumeB)=>{ Lt(c,[[0.205,HY+0.0],[0.21,HY+0.08],[0.18,HY+0.16],[0.11,HY+0.21],[0.0,HY+0.225]],0,0,-0.01,3,1,22);
    const tl=new THREE.Mesh(new THREE.SphereGeometry(0.22,18,8,Math.PI*0.6,Math.PI*0.8,Math.PI*0.42,Math.PI*0.22),M(c)); tl.position.set(0,HY+0.06,-0.02); tl.scale.set(1,1,1.25); tag(tl,3);   // the tail
    const vz=new THREE.Mesh(new THREE.CylinderGeometry(0.215,0.215,0.07,18,1,true,-0.75,1.5),M(c)); vz.position.set(0,HY+0.165,0.02); vz.rotation.x=-0.35; tag(vz,3);   // the raised visor
    Bx(0x141c2e,0.12,0.012,0.02,0,HY+0.165,0.215,3,[-0.35,0,0]);
    E(gold,0,HY+0.21,-0.02,0.018,0.03,0.17,3); E(plumeA,0,HY+0.28,-0.08,0.04,0.08,0.05,3,[-0.5,0,0]); E(plumeB,0,HY+0.3,-0.14,0.035,0.07,0.045,3,[-0.9,0,0]); };
  // a dame's open bascinet: the pointed bowl, the face open, a mail aventail, her plait over the shoulder
  const bascinet=(c,mail)=>{ Lt(c,[[0.205,HY+0.04],[0.21,HY+0.1],[0.17,HY+0.19],[0.09,HY+0.26],[0.0,HY+0.3]],0,0,-0.01,3,1,22);
    Lt(mail,[[0.2,HY+0.05],[0.215,HY-0.05],[0.22,HY-0.15],[0.26,HY-0.2],[0.29,1.12],[0.24,1.1]],0,0,-0.01,3,0.95,22,Math.PI*0.62,Math.PI*0.76); };
  const beardLong=(c,cd,len)=>{ E(c,0,HY-0.13-len*0.25,0.1,0.15,0.11+len*0.3,0.1,3); E(cd,0,HY-0.24-len*0.4,0.12,0.08,0.06+len*0.15,0.06,3); [-1,1].forEach(sd=>E(c,sd*0.045,HY-0.075,0.172,0.05,0.016,0.02,3,[0,0,-sd*0.25])); };
  const hoodUp=(c,cd)=>{ const hd=new THREE.Mesh(new THREE.SphereGeometry(0.25,22,14,Math.PI/2+0.82,Math.PI*2-1.64,0,Math.PI*0.84),M(c)); hd.position.set(0,HY+0.02,-0.02); hd.scale.set(1,1.06,1.05); tag(hd,3);
    Lt(cd,[[0.2,1.1],[0.15,1.2],[0.1,1.22]],0,0,0,0,0.85,20); E(ease(c,0x000000,0.45),0,HY+0.03,-0.03,0.19,0.17,0.17,3); };
  const sleevesWide=(c,cuff)=>[-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(c,sd*0.27,0.8,0.03,0.09,0.12,0.09,pt); if(cuff) E(cuff,sd*0.28,0.72,0.035,0.075,0.016,0.075,pt); });
  if(look==='aldric'){   // Sir Aldric: white plate gilded at the shoulders, the closed white helm with its navy visor and gold band, the tall gold crest, the crimson cape, a gilded blade at his side
    const W=0xece8dc, WL=0xfffdf4, WD=ease(0xc8c2b0,STEEL,0.2), G=ease(0xe8b93a,GOLD,0.4), GL=0xfff0b0;
    body({skin:0xe8b88a,leg:WD,shin:W,boot:0x2a2a34,top:W,sleeve:WD,fore:W,shoulder:G,hand:0xd8dce4,W:1.12,hips:WD});
    E(WL,0,0.98,0.035,0.2*1.12,0.16,0.13).userData.noInk=true; E(G,0,0.82,0,0.21,0.03,0.16); Bx(G,0.08,0.06,0.03,0,1.12,0.13);
    [-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(G,sd*0.28,1.1,0,0.13,0.095,0.12,pt); E(GL,sd*0.28,1.15,0,0.09,0.03,0.085,pt); E(WL,sd*0.12,0.47,0.06,0.07,0.06,0.05,sd>0?4:5); });
    Lt(0xa02030,[[0.26,0.3],[0.25,0.6],[0.23,0.9],[0.21,1.1]],0,0,-0.03,0,0.75,20,Math.PI*0.62,Math.PI*0.76);          // the crimson cape
    { const sw=new THREE.Group(); sw.position.set(0.26,0.8,0.03); sw.rotation.set(-2.3,0,-0.2); inner.add(sw); const a=(m,y)=>{ m.position.y=y; sw.add(m); }; a(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.022,0.62,10),M(WL)),0.4); a(new THREE.Mesh(new THREE.BoxGeometry(0.17,0.03,0.04),M(G)),0.07); a(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.12,8),M(0xb8902a)),-0.02); }
    generalHelm(W,0x141c2e,G,GL,0xa02030);
  }
  if(look==='royalguard'){   // the Royal Guard: polished steel trimmed in gold, the crimson plume, the royal-blue tabard with its golden fish, the tall halberd
    const A=ease(0xc2cad6,STEEL,0.3), AD=ease(0x828a98,STEEL,0.2), AL=0xe6ecf4, G=ease(0xe8c766,GOLD,0.4), BL=0x2f4a8f;
    body({skin:0xe8b88a,leg:AD,shin:A,boot:0x2a2a34,top:A,sleeve:AD,fore:A,shoulder:G,hand:AD,W:1.1,hips:AD});
    Bx(BL,0.24,0.62,0.03,0,0.66,0.16); Bx(G,0.24,0.04,0.032,0,0.97,0.162); Bx(0x4a68b8,0.24,0.04,0.032,0,0.36,0.162); Bx(BL,0.24,0.5,0.03,0,0.72,-0.15);   // the royal tabard
    E(G,0,0.74,0.18,0.045,0.022,0.01); { const t=new THREE.Mesh(new THREE.ConeGeometry(0.02,0.035,3),M(G)); t.position.set(-0.065,0.74,0.177); t.rotation.z=Math.PI/2; t.userData.noInk=true; tag(t); }   // its golden fish
    E(0xb8912e,0,0.82,0,0.21,0.03,0.16); [-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(G,sd*0.27,1.1,0,0.12,0.085,0.115,pt); });
    { const h=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,2.1,6),M(0x6a4a2a)); h.position.set(0.3,1.0,0.09); tag(h,1); Bx(AL,0.03,0.3,0.2,0.3,1.86,0.15,1); const sp=new THREE.Mesh(new THREE.ConeGeometry(0.034,0.22,4),M(AL)); sp.position.set(0.3,2.15,0.09); tag(sp,1); }   // the halberd
    greatHelm(A,0x22262e,G,()=>{ for(let i=0;i<5;i++) E(i%2?0xd9564a:0xc0392b,0,HY+0.22+i*0.04,0.02-i*0.05,0.035,0.055,0.045,3,[-0.3*i,0,0]); });
  }
  if(look==='sage'){   // Eldan the Sage: the green hood and robe, a long white beard, hands folded, his staff with its lit head
    const Gc=0x4a6a52, GL=0x5f8468, GD=0x35503c, sk=0xe8c9a0;
    body({skin:sk,leg:GD,boot:0x4a3a2a,top:Gc,sleeve:Gc,fore:Gc,hand:sk,W:0.98,noHips:true,noTorso:true});
    robe(Gc,GL,GD,0x2e4534); sleevesWide(Gc,GD);
    head({skin:sk,eye:0x3a2a1a,brow:0xe8e4da,browH:0.026,mouth:'none'}); beardLong(0xeceae0,0xc4c2b6,0.44); hoodUp(Gc,GD);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.03,1.7,6),M(0x7a5636)); st.position.set(0.34,0.85,0.1); tag(st,1);
    const ck=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.022,5,10,Math.PI*1.3),M(0x553a24)); ck.position.set(0.3,1.74,0.1); ck.userData.noInk=true; tag(ck,1);
    const gm=new THREE.Mesh(new THREE.OctahedronGeometry(0.055),new THREE.MeshBasicMaterial({color:0x8fd4a8})); gm.position.set(0.32,1.7,0.1); gm.userData.part=1; inner.add(gm);
  }
  if(look==='librarian'){   // Ezra the Scribe: the green robe with wide sleeves and gold stole bands, the clasped tome with its gilt spine, a great white beard, bushy brows, a shining crown
    const Gc=0x2f5a3a, GL=0x3f7048, GD=0x244630, GO=ease(0xc8a038,GOLD,0.3), sk=0xe0c09a;
    body({skin:sk,leg:GD,boot:0x4a3a2a,top:Gc,sleeve:Gc,fore:Gc,hand:sk,W:0.98,noHips:true,noTorso:true});
    robe(Gc,GL,GD,0x1e3a28); sleevesWide(Gc,GO);
    [-1,1].forEach(sd=>{ Bx(GO,0.065,0.85,0.02,sd*0.08,0.6,0.2,0,[-0.13,0,0]); for(let i=0;i<3;i++) Bx(0xe8c766,0.068,0.03,0.022,sd*0.08,0.35+i*0.22,0.24-i*0.03); });   // the stole bands
    Bx(0x7a3a2a,0.22,0.28,0.07,0,0.78,0.24); Bx(0xe8c766,0.03,0.28,0.074,-0.1,0.78,0.24); Bx(0xe8c766,0.05,0.05,0.02,0.06,0.88,0.28);   // the clasped tome, gilt spine
    head({skin:sk,eye:0x3a2a1a,brow:0x2a1c10,browH:0.032,mouth:'none'}); beardLong(0xf4f2ec,0xc8c2b4,0.5);
    [-1,1].forEach(sd=>E(0xe8e4da,sd*0.17,HY-0.02,-0.03,0.04,0.09,0.08,3)); E(0xfff4e4,0.02,HY+0.17,0.04,0.09,0.03,0.07,3);   // white side hair, the shine on his crown
  }
  if(look==='elijah'){   // Elijah the surfer: the orange shirt with white flowers, a big white beard, cream shorts, the green shell necklace, his board
    const OR=0xe07a4a, CR=0xc8b890, sk=0xc08858;
    body({skin:sk,leg:CR,shin:sk,boot:0xd8c8a0,top:OR,sleeve:OR,fore:sk,W:1.04,hips:CR});
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; E(0xf0e8d0,Math.sin(a)*0.15,0.88+(i%2)*0.14,Math.cos(a)*0.11+0.02,0.022,0.022,0.012); }
    for(let i=0;i<7;i++){ const a=(i-3)*0.28; E(0x3a7a42,Math.sin(a)*0.13,1.13-Math.abs(i-3)*0.015,0.1+Math.cos(a)*0.03,0.016,0.016,0.016); }   // the shell necklace
    head({skin:sk,eye:0x2a1a10,brow:0x2a1c10,mouth:'none'}); beardLong(0xf0e8d0,0xd8d0b8,0.26);
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,12,0,Math.PI*2,0,Math.PI*0.5),M(0x2a1c10)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.36; tag(hb,3);
    E(0xffffff,0.46,0.8,-0.02,0.19,0.75,0.04); Bx(0x3a8a9a,0.05,1.36,0.045,0.46,0.8,0.0); Bx(0xe8c766,0.17,0.05,0.05,0.46,1.12,0.0);   // the board, standing by him
  }
  if(look==='matthew'){   // Squire Matthew: a lad in a blue-grey jerkin over a steel plate, a gold clasp, a gold band with a feather in his hair, his hand-axe
    const J=0x5a6a8a, sk=0xf0c8a0, HC=0xb8862a;
    body({skin:sk,leg:0x4a4a3a,boot:0x2a1c10,top:J,sleeve:J,fore:J,hand:sk,W:0.95,hips:J});
    Lt(J,[[0.2,0.62],[0.19,0.74],[0.18,0.82]],0,0,0,0,0.78,22); E(ease(0x8a8f9e,STEEL,0.3),0,1.0,0.04,0.17,0.13,0.11).userData.noInk=true; Bx(0xe8c766,0.06,0.05,0.03,0,1.11,0.12);
    E(0x8a5c32,0,0.82,0,0.2,0.028,0.15);
    { const t=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.5,6),M(0x8a5c32)); t.position.set(-0.29,0.55,0.08); tag(t,2); Bx(0xc8ccd8,0.05,0.09,0.13,-0.29,0.8,0.12,2); }   // the hand-axe
    head({skin:sk,eye:0x4a6a9a,brow:0x5a3a10,mouth:'smile',lip:0xb07a60});
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.208,18,12,0,Math.PI*2,0,Math.PI*0.52),M(HC)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.3; tag(hb,3);
    for(let i=0;i<5;i++) E(HC,(i-2)*0.05,HY+0.16-Math.abs(i-2)*0.01,0.13-Math.abs(i-2)*0.02,0.04,0.035,0.03,3,[-0.5,0,0]);   // his fringe
    E(0xe8c766,0,HY+0.09,-0.005,0.2,0.018,0.19,3); E(0xe8c766,0.12,HY+0.22,-0.08,0.02,0.08,0.012,3,[0,0,-0.4]);   // the gold band, a feather in it
  }
  if(look==='priest'){   // a priest: grey hair, a white alb, the purple stole with its gold cross, brown shoes; one hand lifts in blessing
    const AL=0xefe9da, ALL=0xf8f4ea, ALD=0xd8d2c0, ST=(opts&&opts.stole)||0x6a3a8a, sk=0xe8b88a;
    body({skin:sk,leg:ALD,boot:0x5b3a1f,top:AL,sleeve:AL,fore:AL,hand:sk,W:1.0,noHips:true,noTorso:true});
    robe(AL,ALL,ALD,ALD); sleevesWide(AL,ALD);
    [-1,1].forEach(sd=>Bx(ST,0.075,0.9,0.02,sd*0.09,0.6,0.2,0,[-0.12,0,0])); Bx(0xf2c14e,0.05,0.13,0.022,-0.09,0.95,0.23); Bx(0xf2c14e,0.12,0.035,0.022,-0.09,0.98,0.23);   // the stole, its gold cross
    head({skin:sk,eye:0x2a221c,brow:0x6a6a72,mouth:'smile',lip:0xc88a6a});
    const hb=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,12,0,Math.PI*2,0,Math.PI*0.48),M(0x8a8a92)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.42; tag(hb,3);
    [-1,1].forEach(sd=>E(0x8a8a92,sd*0.175,HY-0.01,-0.03,0.035,0.08,0.08,3));
  }
  // ── the townsfolk: every 2D outfit, from its own colours (OUTFITS_2D), features (LOOKS) and hat style (VHAT) ──
  if(VO){ const O=opts.O||{}, L=opts.L||{}, fem=/F$/.test(VO)||VO==='patronB', sk=O.skin||0xe0b080, top=O.top||0x9a7a4a, bot=O.bottom||0x6f5436, hair=O.hair||0x6a4a2a;
    const W=fem?0.9:L.round?1.12:1, topD=ease(top,0x000000,0.25), topL=ease(top,0xffffff,0.2);
    body({skin:sk,leg:bot,boot:0x3a2a1e,top,sleeve:top,fore:topL,hand:sk,W,hips:fem?top:bot});
    g.userData.b3spec={fem,kid:VO==='child',skin:sk,top,bot,hair,hat:O.hat||null,hood:!!L.hood,brim:!!(L.brim||O.hat&&!L.hood),apron:O.apron||null,robe:!!(L.robe||L.dress),beard:L.beard||null,H};   /* V193: for the new body (body3.js) */
    if(fem){ Lt(bot,[[0.0,0.36],[0.27,0.36],[0.25,0.5],[0.21,0.66],[0.18,0.8],[0.0,0.8]],0,0,0,0,0.85,22); E(ease(bot,0x000000,0.3),0,0.365,0,0.272,0.018,0.232); }   // the women's skirts, to the knee
    E(topD,0,0.79,0,0.185*W,0.025,0.14);
    if(L.round) E(top,0,0.92,0.04,0.2,0.18,0.15);
    if(O.apron){ Bx(O.apron,0.22,0.5,0.025,0,0.66,0.16+(L.round?0.04:0)); Bx(ease(O.apron,0x000000,0.25),0.2,0.02,0.02,0,0.92,0.155); }
    if(L.belt) E(L.belt,0,0.82,0,0.2*W,0.026,0.15);
    head({skin:sk,eye:0x3a2a1a,brow:ease(hair,0x000000,0.2),lash:fem?0x2a1a14:0,mouth:(hsv>0.45?'smile':'flat'),lip:ease(sk,0x6a2018,0.45),cheeks:fem?0xf0a8a0:0});
    if(L.beard){ E(L.beard,0,HY-0.11,0.09,0.15,0.11,0.1,3); [-1,1].forEach(sd=>E(L.beard,sd*0.04,HY-0.075,0.17,0.045,0.015,0.02,3,[0,0,-sd*0.25])); }
    const hs=O.hat?(VHAT[VO]||'brim'):null, bareGuard=VO==='soldier'&&(WHO==='Off-duty Guard');
    if(hs!=='hood'){ const hb=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,12,0,Math.PI*2,0,Math.PI*0.5),M(hair)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.34; tag(hb,3);
      E(hair,0,HY-0.03,-0.07,0.18,0.15,0.13,3);
      if(fem) [-1,1].forEach(sd=>E(hair,sd*0.17,HY-0.11,-0.01,0.05,0.13,0.06,3)); }
    const steel=ease(O.hat||0x9aa0b0,STEEL,0.35);
    if(VO==='soldier'&&WHO==='Off-duty Guard') kettleHat(steel,ease(steel,0x000000,0.3),1,{p:[0.3,0.62,0.1],r:[0.2,0,1.35]});   // off duty: his kettle hat under his arm, his hair out
    else if(VO==='soldier'&&WHO==='Herald of the Melee'){ E(0xc0392b,0,HY+0.12,-0.01,0.21,0.09,0.2,3); E(0xe8c040,0,HY+0.07,0,0.215,0.025,0.21,3); E(0xc0392b,-0.1,HY+0.12,-0.16,0.06,0.1,0.06,3,[0.8,0,0.5]); E(0xffffff,0.12,HY+0.22,-0.06,0.015,0.11,0.03,3,[-0.6,0,-0.5]);   // the herald's chaperon, its gold roll, the liripipe, a white feather
      Bx(0xc0392b,0.12,0.5,0.02,-0.06,0.78,0.165); Bx(0xe8c040,0.12,0.5,0.02,0.06,0.78,0.165); }                         // his quartered tabard
    else if(VO==='soldier'&&WHO==='Marshal of the Lists'){ greatHelm(steel,0x1a1e26,0xe8c040,()=>{ for(let i=0;i<7;i++){ const a=(i-3)*0.3; E(i%2?0xe8c040:0xc0392b,Math.sin(a)*0.07,HY+0.27+Math.cos(a)*0.06,-0.02,0.022,0.075,0.03,3,[0,0,-a]); } });   // the tourney helm, a fan crest
      const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.42,8),M(0xe8c040)); bt.position.set(0.3,0.66,0.14); bt.rotation.x=0.9; tag(bt,1); }   // the marshal's baton
    else if(VO==='soldier') kettleHat(steel,ease(steel,0x000000,0.3),3);                                                    // the town guard's kettle hat
    else if(VO==='qmaster') spangen(steel,0xc8a038,0x6a707a);
    else if(hs==='helm'){ const hm=new THREE.Mesh(new THREE.SphereGeometry(0.218,18,10,0,Math.PI*2,0,Math.PI*0.5),M(O.hat)); hm.position.set(0,HY+0.05,0); hm.scale.set(1,0.85,1); tag(hm,3); E(ease(O.hat,0x000000,0.2),0,HY+0.05,0,0.222,0.02,0.222,3); E(0xc0392e,0,HY+0.25,-0.01,0.03,0.05,0.03,3); }
    else if(hs==='cap'){ const cp=new THREE.Mesh(new THREE.SphereGeometry(0.212,18,10,0,Math.PI*2,0,Math.PI*0.5),M(O.hat)); cp.position.set(0,HY+0.06,-0.005); cp.scale.set(1,0.62,1.02); tag(cp,3); E(ease(O.hat,0x000000,0.25),0,HY+0.06,0,0.215,0.018,0.212,3);
      const pk=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.02,16,1,false,-Math.PI/2,Math.PI),M(ease(O.hat,0x000000,0.25))); pk.position.set(0,HY+0.07,0.13); tag(pk,3); }
    else if(hs==='hood') hoodUp(O.hat,ease(O.hat,0x000000,0.2));
    else if(hs==='brim'){ E(O.hat,0,HY+0.11,0,0.34,0.02,0.33,3); E(O.hat,0,HY+0.18,-0.005,0.17,0.085,0.165,3); E(ease(O.hat,0x000000,0.3),0,HY+0.13,0,0.172,0.02,0.168,3); }
    if(L.spear){ const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,1.9,5),M(0x6b4a2e)); sp.position.set(0.3,0.95,0.09); tag(sp,1); const tp=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.18,4),M(0xd8dce4)); tp.position.set(0.3,1.98,0.09); tag(tp,1); }
    if(L.mug){ E(0x8a6a42,0.31,0.63,0.1,0.05,0.06,0.05,1); E(0xf4ead0,0.31,0.69,0.1,0.045,0.012,0.045,1); }
  }
  if(GL){ const o=GO, sk=o.skin||0xf2c9a4, top=o.body||0x7a6a5a, bot=o.legs||top, hair=o.hair||0x5a3a20, fem=!!(o.dress||o.longHair)||/Dame|Lady|girl|Princess/.test(WHO), robed=!!(o.robe||o.dress);
    const plate=!!o.plate, ST=ease(0xc9cdd6,STEEL,0.45), STD=ease(0x8a909c,STEEL,0.3), trim=o.trim||GOLD, W=plate?1.1:fem?0.9:o.round?1.1:1;
    body({skin:sk,leg:plate?STD:bot,shin:plate?ST:undefined,boot:plate?0x2a2a34:0x3a2a1e,top:plate?ST:top,sleeve:plate?STD:top,fore:plate?ST:ease(top,0xffffff,0.15),hand:plate?0x4a505c:sk,W,noTorso:robed,noHips:robed,shoulder:plate?trim:undefined});
    g.userData.b3spec={fem,skin:sk,top,bot,hair:o.hood||o.bald?null:hair,hat:o.hat||o.brim||o.hood||o.helm||null,hood:!!o.hood,brim:!!o.brim,helm:!!o.helm,plate,apron:o.apron||null,robe:robed,beard:o.beard||null,H,kid:(o.small||1)<0.75};   /* V193: for the new body (body3.js) */
    if(robed) robe(top,ease(top,0xffffff,0.2),ease(top,0x000000,0.25),ease(top,0x000000,0.32));
    if(plate){ Bx(top,0.24,0.6,0.03,0,0.66,0.16); Bx(trim,0.24,0.035,0.032,0,0.96,0.162); Bx(top,0.24,0.5,0.03,0,0.72,-0.15);   // the tabard in their colours
      Bx(trim,0.045,0.2,0.012,0,0.76,0.177); Bx(trim,0.13,0.04,0.012,0,0.8,0.177);
      [-1,1].forEach(sd=>{ const pt=sd>0?1:2; E(trim,sd*0.27,1.1,0,0.12,0.085,0.115,pt); E(ST,sd*0.115,0.47,0.06,0.065,0.06,0.05,sd>0?4:5); }); }
    if(o.cape) Lt(o.cape,[[0.26,0.3],[0.25,0.6],[0.23,0.9],[0.21,1.1]],0,0,-0.03,0,0.75,20,Math.PI*0.62,Math.PI*0.76);
    if(WHO==='Captain') Lt(top,[[0.27,0.32],[0.25,0.6],[0.23,0.9],[0.21,1.1]],0,0,-0.03,0,0.75,20,Math.PI*0.62,Math.PI*0.76);   // the captain's cloak
    if(o.belt||plate) E(o.belt||0x5b3a1f,0,0.82,0,0.2*W+(robed?0.02:0),0.026,0.155);
    if(o.stole){ [-1,1].forEach(sd=>Bx(o.stole,0.075,0.9,0.02,sd*0.09,0.6,0.2,0,[-0.12,0,0])); if(o.cross){ Bx(o.cross,0.05,0.13,0.022,-0.09,0.95,0.23); Bx(o.cross,0.12,0.035,0.022,-0.09,0.98,0.23); } }
    if(o.apron) Bx(o.apron,0.22,0.5,0.025,0,0.66,0.16+(o.round?0.04:0)); if(o.round) E(top,0,0.92,0.04,0.2,0.18,0.15);
    if(fem&&!robed&&!plate){ Lt(bot,[[0.0,0.36],[0.27,0.36],[0.25,0.5],[0.21,0.66],[0.18,0.8],[0.0,0.8]],0,0,0,0,0.85,22); }
    const closed=plate&&WHO!=='Captain'&&!fem&&!/Dame/.test(WHO);
    if(!closed) head({skin:sk,eye:0x3a2a1a,brow:ease(hair,0x000000,0.2),lash:fem?0x2a1a14:0,mouth:'flat',lip:ease(sk,0x6a2018,0.45),cheeks:fem?0xf0a8a0:0});
    if(o.beard){ if(o.longBeard) beardLong(o.beard,ease(o.beard,0x000000,0.15),0.4); else { E(o.beard,0,HY-0.11,0.09,0.15,0.11,0.1,3); [-1,1].forEach(sd=>E(o.beard,sd*0.04,HY-0.075,0.17,0.045,0.015,0.02,3,[0,0,-sd*0.25])); } }
    const hatted=!!(o.hood||o.helm||plate||o.hat||o.brim);
    if(!o.hood&&!o.bald&&!(plate&&!fem&&WHO!=='Captain')){ const hb=new THREE.Mesh(new THREE.SphereGeometry(0.205,18,12,0,Math.PI*2,0,Math.PI*0.5),M(hair)); hb.position.set(0,HY+0.03,-0.012); hb.rotation.x=-0.34; tag(hb,3); E(hair,0,HY-0.03,-0.07,0.18,0.15,0.13,3);
      if(fem) [-1,1].forEach(sd=>E(hair,sd*0.17,HY-0.11,-0.01,0.05,0.13,0.06,3)); }
    if(o.bald) [-1,1].forEach(sd=>E(hair,sd*0.17,HY-0.02,-0.03,0.04,0.08,0.08,3));
    if(plate){ if(WHO==='Captain') sallet(ST,trim,0x3a5aa8,0xf4f2ec); else if(fem||/Dame/.test(WHO)){ bascinet(ST,0x6a707a); E(hair,0.12,HY-0.2,0.12,0.04,0.14,0.04,3); } else greatHelm(ST,0x1a1e26,trim); }
    else if(o.helm) kettleHat(ease(o.helm,STEEL,0.35),ease(o.helm,0x000000,0.3),3);
    if(o.hood) hoodUp(o.hood,ease(o.hood,0x000000,0.2));
    if(o.brim){ E(o.brim,0,HY+0.11,0,0.34,0.02,0.33,3); E(o.brim,0,HY+0.18,-0.005,0.17,0.085,0.165,3); }
    if(o.hat){ const cp=new THREE.Mesh(new THREE.SphereGeometry(0.212,18,10,0,Math.PI*2,0,Math.PI*0.5),M(o.hat)); cp.position.set(0,HY+0.06,-0.005); cp.scale.set(1,0.62,1.02); tag(cp,3); if(o.feather) E(0xf4f2ec,0.13,HY+0.2,-0.06,0.015,0.1,0.03,3,[-0.5,0,-0.4]); }
    if(o.kerchief) E(o.kerchief,0,HY+0.07,-0.02,0.215,0.15,0.21,3);
    if(o.crown){ E(0xe8c040,0,HY+0.17,0,0.16,0.03,0.15,3); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, cn=new THREE.Mesh(new THREE.ConeGeometry(0.022,0.07,4),M(0xe8c040)); cn.position.set(Math.sin(a)*0.15,HY+0.21,Math.cos(a)*0.14); tag(cn,3); } }
    if(o.circlet){ E(0xe8c25a,0,HY+0.075,0,0.2,0.022,0.19,3); E(0xc0432f,0,HY+0.075,0.188,0.018,0.018,0.012,3); }
    if(o.scroll){ const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.22,10),M(0xf0e6c8)); sc.position.set(0.3,0.62,0.12); sc.rotation.z=Math.PI/2; tag(sc,1); }
    if(o.lute){ E(0xa0703a,-0.05,0.86,0.2,0.12,0.15,0.05,0,[0,0,0.6]); Bx(0x6a4422,0.03,0.3,0.03,0.12,1.06,0.2,0,[0,0,0.6]); }
    if(o.spear||o.halberd){ const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,1.9,5),M(0x6b4a2e)); sp.position.set(0.3,0.95,0.09); tag(sp,1); const tp=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.18,4),M(0xd8dce4)); tp.position.set(0.3,1.98,0.09); tag(tp,1); }
    if(o.staff){ const st=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.03,1.7,6),M(o.staff)); st.position.set(0.32,0.85,0.1); tag(st,1); }
    if(WHO==='Captain'){ const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.4,8),M(trim)); bt.position.set(0.3,0.66,0.14); bt.rotation.x=0.9; tag(bt,1); }
  }
  // a toddler's big head
  if(look==='benji'||VK){ const k=1.4, py=1.13; inner.children.forEach(m=>{ if(m.userData.part!==3) return; m.position.y=py+(m.position.y-py)*k; m.position.x*=k; m.position.z*=k; m.scale.multiplyScalar(k); }); }
  // anything high and central that wasn't tagged belongs to the head
  inner.children.forEach(m=>{ if(m.userData.part) return; if(m.position.y>1.15&&Math.abs(m.position.x)<0.22) m.userData.part=3; });
  const W=GL?(GO.plate?1.1:(GO.dress||GO.longHair)?0.9:GO.round?1.1:1):VO?(/F$/.test(VO)||VO==='patronB'?0.9:(opts.L&&opts.L.round)?1.12:1):({joshua:1.18,madison:0.92,king:1.06,cheyenne:0.88,benji:1.1,dylan:1.15,ethan:0.92,cody:1.05,aldric:1.12,royalguard:1.1,sage:0.98,librarian:0.98,elijah:1.04,matthew:0.95,priest:1}[look]||1);
  g.userData.pivots={1:[0.255*W*H,1.07*H,0],2:[-0.255*W*H,1.07*H,0],3:[0,1.15*H,0],4:[0.115*W*H,0.76*H,0],5:[-0.115*W*H,0.76*H,0]};
  g.userData.hero=look; if(VO) g.userData.outfit=VO;
  return mergePerson(shade(g),opts); }
