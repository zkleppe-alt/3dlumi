// ════════════════════════════════════════════════════════════════
//  DEMONS (V176) — every kind its own shape, so you can read a fight at a glance:
//   POUNCER — the Hound: low and lean on four legs, a long jackal skull thrust forward, haunches bunched to spring,
//             a whip of a tail. No wings. It comes at you in a leap.
//   CLAWER  — the Raker: tall, starved, stooped; arms longer than its body ending in three bone sickles; a crest of
//             spines and ragged little wings. It rears up and rakes.
//   BRUTE   — the Ogre: a hill of a back and shoulders, a small head sunk low between them, bull's horns swept forward,
//             fists like boulders on the ground, stone plates with the fire showing through the cracks. It heaves up
//             and comes down.
//   SPITTER — the Gorger: thin-legged and bloated, a hood flared round its head like an adder's, a throat-sac and
//             a gaping mouth glowing with what it spits; big wings, a barbed tail.
//  After dark each takes one of the four night forms over its own shape (the Loomer's third eye, the Maw's ring of fangs,
//  the Husk's sickness, the Watcher's mass of eyes), purpled, with the aura at its feet.
//  DEMONS.make(kind, level, {night, tint, boss}) → THREE.Group, as COMBAT's demonModel was: one baked body mesh (its own
//  material, for the hit flash: userData.mats), glowing eyes, and wings on g.w1 / g['w-1'] where it has them.
// ════════════════════════════════════════════════════════════════
const DEMONS=(function(){
  const KINDS=['pounce','claw','brute','spit'];
  const bin=(b64,T)=>{ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return new T(u.buffer); };
  function sculpt(D){ if(D._g) return D._g; const g=new THREE.BufferGeometry(), P=bin(D.p,Int16Array), Q=bin(D.q,Int8Array), C=bin(D.c,Uint8Array), I=D.i32?bin(D.i,Uint32Array):bin(D.i,Uint16Array);
    const pos=new Float32Array(P.length), nor=new Float32Array(Q.length), col=new Float32Array(C.length); const QS=D.s||16000; for(let i=0;i<P.length;i++) pos[i]=P[i]/QS; for(let i=0;i<Q.length;i++) nor[i]=Q[i]/127; for(let i=0;i<C.length;i++) col[i]=C[i]/255;
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(new THREE.BufferAttribute(I,1)); if(typeof HIDE!=='undefined') HIDE.attr(g,D.k); g.computeBoundingSphere(); return D._g=g; }
  const PAL={ pounce:{body:0x4a2a62,belly:0x8a6a8a,dark:0x1e1028,horn:0xd8c8a8,eye:0xffc83a},
              claw:  {body:0x6a1e2e,belly:0x9a5a5a,dark:0x220a12,horn:0xeee2cc,eye:0xff4a3a},
              brute: {body:0x3a3644,belly:0x5a5262,dark:0x18161e,horn:0xc8b898,eye:0xff7a2a,ember:0xff6a1a},
              spit:  {body:0x2a4250,belly:0x4a6a6a,dark:0x101a20,horn:0xb8c8b8,eye:0xa8ff5a,sac:0x8aff4a} };
  const _HALO={}; function haloMat(h){ if(_HALO[h]) return _HALO[h]; const cv=document.createElement('canvas'); cv.width=cv.height=32; const x=cv.getContext('2d'), gr=x.createRadialGradient(16,16,0,16,16,16), col=new THREE.Color(h);
    gr.addColorStop(0,`rgba(${col.r*255|0},${col.g*255|0},${col.b*255|0},0.9)`); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,32,32);
    return _HALO[h]=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.55}); }
  const AURA=new THREE.MeshBasicMaterial({color:0x7a2ad0,transparent:true,opacity:0.32,depthWrite:false,blending:THREE.AdditiveBlending});
  function make(kind,level,o){ o=o||{}; kind=KINDS.includes(kind)?kind:KINDS[(kind|0)%4]; const NF=o.night==null?-1:o.night%4, g=new THREE.Group(), parts=[], EYES=[], glows=[];
    const pl=Object.assign({},PAL[kind]); if(o.tint){ const t=new THREE.Color(o.tint).multiplyScalar(0.55); pl.body=t.getHex(); pl.belly=t.clone().lerp(new THREE.Color(0xc89a7a),0.25).getHex(); }
    if(NF>=0){ const n=new THREE.Color(pl.body).lerp(new THREE.Color(0x4a1258),0.7); pl.body=n.getHex(); pl.belly=n.clone().lerp(new THREE.Color(0x9a6aaa),0.3).getHex(); pl.dark=0x1e0628; pl.eye=0xffd05a; }
    const {body:BODY,belly:BELLY,dark:DARK,horn:HORN}=pl, CLAW=0xeee2cc, EYE=pl.eye;
    const bodyM=((typeof LOOK2!=='undefined'&&!LOOK2)?new THREE.MeshPhongMaterial({vertexColors:true,shininess:12,specular:0x1a1016}):new THREE.MeshToonMaterial({vertexColors:true,gradientMap:(typeof BOSSART!=='undefined'&&BOSSART.toonMap)?BOSSART.toonMap():null})), wingM=new THREE.MeshPhongMaterial({color:NF>=0?0x2a0838:new THREE.Color(DARK).lerp(new THREE.Color(BODY),0.35).getHex(),flatShading:true,side:THREE.DoubleSide,shininess:4});
    const P=(geo,col,x,y,z,rx,ry,rz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx) m.scale.set(sx,sy||sx,sz||sx); m.updateMatrix(); parts.push([(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(m.matrix),col]); };
    const S=(r,col,x,y,z,sx,sy,sz,rx)=>P(new THREE.SphereGeometry(r,16,12),col,x,y,z,rx||0,0,0,sx||1,sy||1,sz||1);
    const L=(r0,r1,len,col,x,y,z,rx,ry,rz)=>P(new THREE.CylinderGeometry(r1,r0,len,10),col,x,y,z,rx,ry,rz);
    const K=(r,len,col,x,y,z,rx,ry,rz,seg)=>P(new THREE.ConeGeometry(r,len,seg||7),col,x,y,z,rx,ry,rz);
    const VEINS=[];   /* lines of fire, or of sickness, that glow on their own: [a,b,r,hex] */
    const vein=(a,b,r,h)=>VEINS.push([a,b,r,h]);
    // a limb from a to b (a cylinder laid between two points)
    const V=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0), Q=new THREE.Quaternion(), E3=new THREE.Euler();
    const seg=(a,b,r0,r1,col)=>{ V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const len=V.length(); Q.setFromUnitVectors(UP,V.normalize()); E3.setFromQuaternion(Q); L(r0,r1,len,col,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,E3.x,E3.y,E3.z); S(Math.max(r0,r1)*1.05,col,b[0],b[1],b[2]); };
    const tail=(x,y,z,n,len,r,col,lift,swing)=>{ let p=[x,y,z]; for(let i=0;i<n;i++){ const q=[p[0]+Math.sin(i*0.6)*swing,p[1]+lift*(i<n/2?1:-0.4)*len,p[2]-len]; seg(p,q,r*(1-i/n*0.7),r*(1-(i+1)/n*0.7),col); p=q; } return p; };
    let head=[0,1,0.2], eyeR=0.03, wings=null;
    const SD=(typeof DEMON_DATA!=='undefined'&&DEMON_DATA&&DEMON_DATA[kind])||null;   /* V176: the sculpted hide (tools/sculpt_demons.py), where it has loaded */
    if(SD){ head=SD.head.slice(); SD.eyes.forEach(e=>EYES.push(e.slice())); (SD.glows||[]).forEach(e=>glows.push(e.slice())); (SD.veins||[]).forEach(v=>VEINS.push(v)); wings=SD.wings?Object.assign({},SD.wings):null; eyeR=SD.eyes[0]?SD.eyes[0][3]:0.02;
      if(typeof HIDE!=='undefined') HIDE.apply(bodyM,1.8); const sm=new THREE.Mesh(sculpt(SD),bodyM); g.add(sm);
      if(NF>=0) bodyM.color.setHex(0xa880d0); else if(o.tint){ bodyM.color.set(o.tint).lerp(new THREE.Color(0xffffff),0.45); } }
    else if(kind==='pounce'){   // ── the Hound ──
      S(0.27,BODY,0,0.55,0.12,1,0.85,1.35,-0.12); S(0.22,BELLY,0,0.47,0.16,0.9,0.7,1.1); S(0.24,BODY,0,0.58,-0.22,1.05,0.95,1.05);   // chest, belly, haunches
      for(let i=0;i<6;i++) K(0.035,0.13,DARK,0,0.78-i*0.012,0.28-i*0.1,-0.5,0,0);   // the spine-ridge
      [-1,1].forEach(sd=>{ seg([sd*0.15,0.55,0.3],[sd*0.17,0.28,0.4],0.06,0.05,BODY); seg([sd*0.17,0.28,0.4],[sd*0.16,0.05,0.38],0.05,0.04,DARK); for(let k=-1;k<=1;k++) K(0.016,0.09,CLAW,sd*0.16+k*0.025,0.03,0.46,1.7,0,0);   // forelegs
        seg([sd*0.18,0.55,-0.22],[sd*0.2,0.32,-0.02],0.1,0.07,BODY); seg([sd*0.2,0.32,-0.02],[sd*0.19,0.16,-0.3],0.06,0.045,DARK); seg([sd*0.19,0.16,-0.3],[sd*0.18,0.03,-0.22],0.045,0.04,DARK); for(let k=-1;k<=1;k++) K(0.016,0.08,CLAW,sd*0.18+k*0.025,0.02,-0.15,1.7,0,0); });   // the sprung hind legs
      L(0.12,0.09,0.24,BODY,0,0.7,0.42,-1.1,0,0);   // the neck, thrust forward
      head=[0,0.78,0.6]; S(0.15,BODY,0,0.78,0.56,1,0.9,1.15); P(new THREE.ConeGeometry(0.09,0.3,6),BODY,0,0.74,0.76,Math.PI/2,0,0,1,1,0.8); P(new THREE.ConeGeometry(0.07,0.24,6),DARK,0,0.68,0.73,Math.PI/2,0,0,1.1,1,0.5);   // the long jackal skull and its jaw
      K(0.02,0.1,0x0a0608,0,0.75,0.92,Math.PI/2,0,0); [-1,1].forEach(sd=>{ K(0.012,0.06,CLAW,sd*0.04,0.68,0.84,Math.PI,0,0); K(0.045,0.2,BODY,sd*0.1,0.94,0.48,-0.5,0,-sd*0.45); seg([sd*0.06,0.88,0.5],[sd*0.1,0.98,0.36],0.03,0.022,HORN); K(0.022,0.14,HORN,sd*0.11,1.02,0.26,-1.1,0,0); EYES.push([sd*0.065,0.82,0.67,0.024]); });
      { const tp=tail(0,0.58,-0.42,6,0.13,0.035,DARK,0.18,0.05); K(0.06,0.14,DARK,tp[0],tp[1],tp[2]-0.06,-1.57,0,0,3); }
      [-1,1].forEach(sd=>{ for(let i=0;i<5;i++) S(0.022,DARK,sd*0.235,0.52+Math.sin(i)*0.01,0.26-i*0.075,0.55,2.6,0.55,0.15);   // its ribs, starved through the hide
        for(let k=0;k<6;k++){ K(0.009,0.045,CLAW,sd*0.042,0.715,0.64+k*0.035,Math.PI,0,0); K(0.008,0.035,CLAW,sd*0.036,0.665,0.64+k*0.033,0,0,0); }   // the lips drawn back off rows of teeth
        S(0.03,0x0a0508,sd*0.09,0.76,0.58,1,0.7,0.8); });   // hollows behind the eyes
      for(let i=0;i<8;i++) S(0.03,BELLY,0,0.81-Math.abs(i-3)*0.008,0.36-i*0.09,1,0.7,1.2);   // the knuckles of its spine
      eyeR=0.024; }
    else if(kind==='claw'){   // ── the Raker ──
      S(0.2,BODY,0,0.82,0.02,1,1.3,0.75,0.35); S(0.15,BELLY,0,0.74,0.1,0.85,1.1,0.6); S(0.17,BODY,0,0.52,-0.05,1,0.8,0.85);   // a starved, stooped chest; the ribs; the hips
      for(let i=0;i<4;i++) P(new THREE.TorusGeometry(0.13-i*0.01,0.012,4,10,Math.PI),DARK,0,0.84-i*0.07,0.08,0,0,0,1,0.6,1);   // ribs showing
      [-1,1].forEach(sd=>{ S(0.09,BODY,sd*0.2,1.0,0.02); K(0.04,0.18,HORN,sd*0.24,1.12,-0.02,0.3,0,-sd*0.6);   // spiked shoulders
        seg([sd*0.22,0.98,0.03],[sd*0.36,0.66,0.16],0.05,0.04,BODY); seg([sd*0.36,0.66,0.16],[sd*0.38,0.34,0.32],0.04,0.035,BODY); S(0.05,DARK,sd*0.38,0.3,0.34);   // arms longer than its body
        for(let k=0;k<3;k++){ const sx=sd*(0.35+k*0.03); P(new THREE.ConeGeometry(0.022,0.32,4),CLAW,sx,0.2,0.4,2.4,0,sd*(k-1)*0.15); }   // three bone sickles
        seg([sd*0.1,0.45,-0.05],[sd*0.13,0.25,0.05],0.06,0.045,BODY); seg([sd*0.13,0.25,0.05],[sd*0.12,0.05,-0.06],0.045,0.035,DARK); P(new THREE.BoxGeometry(0.07,0.04,0.14),DARK,sd*0.12,0.02,0.0); });
      head=[0,1.13,0.14]; S(0.13,BODY,0,1.14,0.12,0.85,1.15,1); P(new THREE.BoxGeometry(0.12,0.08,0.12),DARK,0,1.02,0.22);   // a narrow skull, a long jaw
      [-1,1].forEach(sd=>{ K(0.03,0.14,CLAW,sd*0.07,0.98,0.27,2.6,0,sd*0.5); EYES.push([sd*0.045,1.17,0.235,0.022]); });   // mandible hooks
      for(let i=0;i<5;i++) K(0.03,0.2-i*0.02,DARK,0,1.25-i*0.12,0.0-i*0.06,-0.9,0,0);   // the crest of spines down the back
      tail(0,0.48,-0.2,4,0.12,0.03,DARK,-0.2,0.02); wings={y:1.0,z:-0.12,s:0.6,ragged:true};
      S(0.11,BODY,0,1.22,0.0,0.8,0.85,1.5,-0.4);   // the skull runs long and back
      [-1,1].forEach(sd=>{ S(0.032,0x0a0508,sd*0.075,1.08,0.21,0.7,1.2,0.6); for(let i=0;i<4;i++) S(0.02,DARK,sd*0.12,0.88-i*0.07,0.14,0.6,1,0.6); });   // hollow cheeks; the ribs again, down its sides
      P(new THREE.BoxGeometry(0.05,0.13,0.03),0x200810,0,1.02,0.235); for(let k=0;k<4;k++) [-1,1].forEach(sd=>K(0.007,0.04,CLAW,sd*0.018,0.97+k*0.03,0.25,0,0,sd*Math.PI/2));   // a mouth that opens up and down, teeth either side
      for(let i=0;i<7;i++) S(0.028,BELLY,0,1.0-i*0.08,-0.1-Math.sin(i*0.45)*0.05,1,0.8,1.1);   // the knuckled spine of its stoop
      eyeR=0.018; }
    else if(kind==='brute'){   // ── the Ogre ──
      S(0.44,BODY,0,0.8,-0.1,1.25,1.0,0.95,0.3); S(0.3,BELLY,0,0.6,0.16,1.1,0.9,0.7); S(0.28,BODY,0,0.42,-0.05,1.1,0.8,0.9);   // a hill of a back; the gut; the hips
      [-1,1].forEach(sd=>{ S(0.24,BODY,sd*0.46,0.98,0.02,1.05,0.9,1);   // great shoulders
        P(new THREE.DodecahedronGeometry(0.2,0),DARK,sd*0.48,1.12,0.0,0.3,0.4,0,1.2,0.6,1.1);   // a stone plate on each
        seg([sd*0.5,0.92,0.06],[sd*0.6,0.55,0.22],0.13,0.11,BODY); seg([sd*0.6,0.55,0.22],[sd*0.58,0.18,0.3],0.11,0.1,BODY); S(0.15,DARK,sd*0.58,0.12,0.32,1.1,0.9,1.1);   // arms to the ground; fists like boulders
        seg([sd*0.2,0.38,-0.05],[sd*0.24,0.08,0.04],0.13,0.11,BODY); P(new THREE.BoxGeometry(0.2,0.08,0.24),DARK,sd*0.24,0.04,0.08); });
      head=[0,1.06,0.4]; S(0.16,BODY,0,1.04,0.38,1.15,0.9,1); P(new THREE.BoxGeometry(0.28,0.08,0.14),DARK,0,1.1,0.48,-0.15,0,0); P(new THREE.BoxGeometry(0.24,0.11,0.14),BELLY,0,0.95,0.48);   // the small head, sunk low; the brow; the jaw
      [-1,1].forEach(sd=>{ K(0.025,0.08,CLAW,sd*0.08,1.0,0.55,0,0,0); seg([sd*0.13,1.12,0.38],[sd*0.25,1.17,0.4],0.06,0.05,HORN); seg([sd*0.25,1.17,0.4],[sd*0.3,1.3,0.48],0.05,0.035,HORN); K(0.035,0.16,HORN,sd*0.3,1.42,0.56,0.6,0,-sd*0.1); EYES.push([sd*0.065,1.06,0.52,0.026]); });   // bull's horns swept forward
      for(let i=0;i<5;i++){ const a=-0.8+i*0.4; P(new THREE.DodecahedronGeometry(0.16,0),DARK,Math.sin(a)*0.34,1.12-Math.abs(a)*0.08,-0.28-Math.cos(a)*0.06,0.4,a,0,1.1,0.55,0.9); }   // plates down the back
      [-1,1].forEach(sd=>{ for(let k=0;k<3;k++) glows.push([sd*(0.42+k*0.05),1.16-k*0.03,0.12-k*0.06,0.028,pl.ember]); }); for(let i=0;i<5;i++) glows.push([-0.2+i*0.1,0.62+((i*37)%10)/40,0.36,0.022,pl.ember]);   // the fire showing through the cracks
      [-1,1].forEach(sd=>{ seg([sd*0.08,0.93,0.5],[sd*0.12,1.04,0.56],0.022,0.012,HORN);   // tusks from the underjaw
        vein([sd*0.08,0.9,0.4],[sd*0.2,0.72,0.4],0.012,pl.ember); vein([sd*0.2,0.72,0.4],[sd*0.14,0.55,0.42],0.01,pl.ember); vein([sd*0.5,0.95,0.2],[sd*0.58,0.7,0.28],0.012,pl.ember); vein([sd*0.58,0.7,0.28],[sd*0.6,0.45,0.32],0.01,pl.ember); vein([sd*0.42,1.1,0.12],[sd*0.3,1.0,0.25],0.01,pl.ember); });   // the fire under the skin, in cracks
      eyeR=0.02; }
    else {   // ── the Gorger ──
      S(0.28,BODY,0,0.66,-0.02,1,1.05,0.95); S(0.24,BELLY,0,0.6,0.1,1,0.95,0.8);   // bloated
      [-1,1].forEach(sd=>{ seg([sd*0.14,0.42,0],[sd*0.16,0.22,0.08],0.06,0.04,BODY); seg([sd*0.16,0.22,0.08],[sd*0.15,0.04,-0.04],0.04,0.03,DARK); P(new THREE.BoxGeometry(0.07,0.04,0.12),DARK,sd*0.15,0.02,0.0);   // spindly legs
        seg([sd*0.24,0.8,0.05],[sd*0.32,0.6,0.16],0.045,0.035,BODY); seg([sd*0.32,0.6,0.16],[sd*0.3,0.48,0.24],0.035,0.03,BODY); for(let k=-1;k<=1;k++) K(0.014,0.07,CLAW,sd*0.3+k*0.02,0.45,0.28,1.9,0,0); });   // little grasping arms
      head=[0,1.02,0.14]; S(0.15,BODY,0,1.02,0.1,1,0.95,1); P(new THREE.BoxGeometry(0.18,0.14,0.12),0x2a0a14,0,0.94,0.2);   // the head; the gaping mouth
      glows.push([0,0.93,0.25,0.06,pl.sac]); S(0.15,pl.sac,0,0.8,0.18,1.05,0.85,0.7);   // the throat-sac, glowing
      for(let i=0;i<9;i++){ const a=-1.4+i*0.35; P(new THREE.ConeGeometry(0.05,0.3,3),i%2?BODY:DARK,Math.sin(a)*0.2,1.06+Math.cos(a)*0.08,0.02-Math.abs(Math.sin(a))*0.04,0,0,-a*1.1,1,1,0.25); }   // the hood, flared like an adder's
      [-1,1].forEach(sd=>{ EYES.push([sd*0.06,1.08,0.235,0.026]); K(0.012,0.06,CLAW,sd*0.05,0.98,0.26,Math.PI,0,0); });
      const tp=tail(0,0.5,-0.25,5,0.13,0.04,DARK,0.15,0.04); K(0.07,0.14,DARK,tp[0],tp[1],tp[2]-0.05,-1.2,0,0,3);   // a barbed tail
      wings={y:0.9,z:-0.2,s:1.25};
      for(let i=0;i<5;i++){ const a=-0.9+i*0.45; vein([Math.sin(a)*0.12,0.9,0.22],[Math.sin(a)*0.16,0.72,0.24],0.006,0x4a8a1a); }   // the veins over the sac
      for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; K(0.008,0.04,CLAW,Math.cos(a)*0.08,0.94+Math.sin(a)*0.06,0.265,Math.PI/2,0,-a+Math.PI/2); }   // a ring of teeth round the gape
      [[-0.05,0.16],[0.02,0.22],[0.06,0.12]].forEach(([x,l])=>vein([x,0.88,0.27],[x,0.88-l,0.28],0.006,pl.sac));   // and it drools
      eyeR=0.02; }
    // ── after dark: one of the four night forms, over its own shape ──
    const [hx,hy,hz]=head;
    if(NF===0){ EYES.push([hx,hy+0.075,hz+0.07,eyeR*1.3]); K(0.045,0.26,HORN,hx+0.1,hy+0.17,hz-0.06,-0.5,0,-0.7); }   // the Loomer: a third eye, a horn grown wrong
    if(NF===1){ for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; K(0.011,0.07,CLAW,hx+Math.cos(a)*0.085,hy-0.08+Math.sin(a)*0.06,hz+0.13,Math.PI/2,0,-a+Math.PI/2); } glows.push([hx,hy-0.08,hz+0.12,0.045,0x6a0a1a]); }   // the Maw: a ring of fangs where its mouth was
    if(NF===2){ for(let i=0;i<9;i++){ const a=i*2.1; glows.push([hx+Math.sin(a)*0.2,hy-0.3-((i*37)%10)/40,hz-0.15+Math.cos(a)*0.14,0.022+(i%3)*0.008,0x9ac83a]); } }   // the Husk: sickness breaking out on it
    if(NF===3){ for(let i=0;i<10;i++){ const a=i*2.4, r=0.03+0.08*Math.sqrt(i/10); EYES.push([hx+Math.sin(a)*r,hy+Math.cos(a)*r*0.9,hz+0.09,0.011+((i*7)%3)*0.005]); } }   // the Watcher: eyes, and eyes
    if(NF>=0){ const au=new THREE.Mesh(new THREE.CircleGeometry(0.75,28),AURA); au.rotation.x=-Math.PI/2; au.position.y=0.03; au.renderOrder=2; g.add(au); }
    // bake the body into one mesh
    const pos=[], nor=[], col=[], c=new THREE.Color(), lit0=new Set([pl.sac,pl.ember,0x0a0508]);
    const mot=(x,y,z)=>0.5+0.25*Math.sin(x*23+Math.sin(y*17)*2)*Math.cos(z*19+x*7)+0.25*Math.sin((x+y*1.3-z)*41);   /* blotched skin */
    parts.forEach(([ge,h])=>{ if(!ge.attributes.normal) ge.computeVertexNormals(); const p=ge.attributes.position.array, n=ge.attributes.normal.array; c.setHex(h); const raw=lit0.has(h)||h===CLAW||h===HORN;
      for(let k=0;k<p.length;k++){ pos.push(p[k]); nor.push(n[k]); }
      for(let k=0;k<p.length/3;k++){ const x=p[k*3], y=p[k*3+1], z=p[k*3+2], ny=n[k*3+1];
        if(lit0.has(h)){ col.push(Math.min(1,c.r*1.6),Math.min(1,c.g*1.6),Math.min(1,c.b*1.6)); continue; }
        const m=raw?0.92+0.1*mot(x,y,z):0.72+0.42*mot(x,y,z), under=0.62+0.38*Math.max(0,Math.min(1,ny*0.6+0.55)), foot=raw?1:0.75+0.25*Math.min(1,y/0.6), f=m*under*foot;
        const red=raw?0:Math.max(0,0.5-ny)*0.06;   /* a raw red in the folds and under the jaw */
        col.push(Math.min(1,c.r*f+red),c.g*f*0.97,c.b*f); } });
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    if(pos.length) g.add(new THREE.Mesh(bg,bodyM));
    const halo=haloMat(EYE);
    EYES.forEach(([x,y,z,r])=>{ const so=new THREE.Mesh(new THREE.SphereGeometry(r*1.9,10,8),glow(0x050204)); so.scale.set(1,0.8,0.45); so.position.set(x,y,z-r*0.2); g.add(so);
      const e=new THREE.Mesh(new THREE.SphereGeometry(r*0.62,8,6),glow(EYE)); e.position.set(x,y,z+r*0.25); g.add(e);
      const hs=new THREE.Sprite(halo); hs.scale.setScalar(r*9); hs.position.set(x,y,z+r*0.5); g.add(hs); });
    VEINS.forEach(([a,b,r,h])=>{ V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const len=V.length(), m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*0.7,len,5),glow(h)); Q.setFromUnitVectors(UP,V.normalize()); m.quaternion.copy(Q); m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); g.add(m); });
    glows.forEach(([x,y,z,r,h])=>{ const e=new THREE.Mesh(new THREE.SphereGeometry(r,6,4),glow(h)); e.position.set(x,y,z); g.add(e); });
    if(wings){ const W2=wings; [-1,1].forEach(sd=>{ const w=new THREE.Group(); w.position.set(sd*0.14,W2.y,W2.z); g.add(w); g['w'+sd]=w;
      const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(0.62,0.32); sh.lineTo(0.6,0.0);
      if(W2.ragged){ sh.lineTo(0.5,-0.1); sh.lineTo(0.47,-0.24); sh.lineTo(0.38,-0.12); sh.lineTo(0.3,-0.3); sh.lineTo(0.22,-0.14); sh.lineTo(0.08,-0.26); }
      else { sh.quadraticCurveTo(0.5,-0.06,0.45,-0.22); sh.quadraticCurveTo(0.33,-0.18,0.28,-0.34); sh.quadraticCurveTo(0.16,-0.22,0.04,-0.3); } sh.lineTo(0,0);
      const mem=new THREE.Mesh(new THREE.ShapeGeometry(sh),wingM); mem.scale.set(sd*W2.s,W2.s,1); mem.rotation.y=-sd*0.25; w.add(mem);
      [[0.62,0.32],[0.45,-0.22],[0.28,-0.34]].forEach(([x,y])=>{ const Ln=Math.hypot(x,y)*W2.s, b=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.02,Ln,4),wingM); b.position.set(sd*x*W2.s/2,y*W2.s/2,0.005); b.rotation.z=-sd*(Math.PI/2-Math.atan2(y,x)); w.add(b); }); }); }
    const s=(0.9+Math.min(0.5,(level||1)*0.012))*(NF>=0?1.25:1)*(kind==='brute'?1.12:kind==='pounce'?1.05:1); g.scale.setScalar(s*(o.boss?1.5:1));
    g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); g.userData.mats=[bodyM,wingM]; g.userData.kind=kind;
    // ── V176: each kind's own way of standing there: the Hound pants and sniffs, the Raker sways in its stoop, the Ogre heaves
    //  for breath and lumbers, the Gorger's throat-sac swells and glows and it rocks on its thin legs ──
    const inner=new THREE.Group(); [...g.children].forEach(c=>{ if(c.geometry&&c.geometry.type==='CircleGeometry') return; inner.add(c); }); g.add(inner);
    const sacs=[]; inner.children.forEach(c=>{ if(c.material&&c.material.color&&(c.material.color.getHex()===(pl.sac||-1))) sacs.push(c); });
    let t=Math.random()*10, mv=0;
    g.animate=(dt,mode)=>{ dt=Math.min(0.1,dt||0.016); t+=dt; mv+=((mode==='walk'?1:0)-mv)*Math.min(1,dt*6);
      if(kind==='pounce'){ inner.scale.y=1+0.018*Math.sin(t*9); inner.rotation.x=Math.sin(t*1.3)*0.035-mv*0.05; inner.position.y=Math.abs(Math.sin(t*9))*0.03*mv; }
      else if(kind==='claw'){ inner.rotation.z=Math.sin(t*1.5)*0.07*(1-mv*0.5); inner.rotation.x=0.04+Math.sin(t*0.9)*0.04; inner.position.y=Math.abs(Math.sin(t*6))*0.02*mv; }
      else if(kind==='brute'){ const b=Math.sin(t*1.8); inner.scale.set(1+0.03*b,1+0.018*b,1+0.03*b); inner.rotation.z=Math.sin(t*4.2)*0.07*mv; inner.position.y=Math.abs(Math.sin(t*4.2))*0.03*mv; }
      else { const p=0.5+0.5*Math.sin(t*3.6); sacs.forEach(m=>m.scale.setScalar(1+0.35*p)); inner.rotation.z=Math.sin(t*2.1)*0.05; inner.position.y=0.02*Math.sin(t*2.1); } };
    return g; }
  return {make,KINDS};
})();
