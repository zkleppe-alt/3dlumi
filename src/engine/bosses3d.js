// ════════════════════════════════════════════════════════════════
//  BOSSES — the ten guardians of the chapels, each its own monster (no longer a tinted demon a size up):
//   0 the Shadow Imp       a grinning shadow with too-long arms, a crown of black fire, a body that trails into smoke
//   1 the Iron Wraith      a hooded thing in an iron crown, wound in chains, green fire where its face should be
//   2 the Tide Specter     a drowned, glass-green ghost: a coral crown, weed for hair, a tail of tentacles, a trident
//   3 the Root Fiend       a hulk of bark and root, antlers of thorn, a split maw and green fire in its cracks
//   4 the Ember Hollow     an obsidian shell with a furnace where the heart should be, molten seams, horns of flame
//   5 the Frost Revenant   a dead king in ice: crystal spikes for pauldrons, a crown of icicles, a blade of ice
//   6 the Char Demon       the old fire-demon: charred hide split red, ram's horns, burning wings, a mane of fire
//   7 the Thunder Lord     a storm titan in slate armour, lightning crawling over it, a crown of rods, a great hammer
//   8 the Dark Paladin     a knight gone over: spiked black plate, a horned helm with a violet slit, a smoking greatsword
//   9 the Void Champion    black-and-gold armour, an anti-halo of shards turning behind its head, four wings of void
//  BOSS3D.make(town, level) → a THREE.Group the fight can use as it uses a demon: g.userData.mats (struck flashes),
//  g.w1 / g['w-1'] (wings the fight flaps), g.animate(dt,mode) (its idle, its stride, its rage when it winds up a blow:
//  it reads g.userData.foe, set by the fight). About twice the knight's height.
// ════════════════════════════════════════════════════════════════
const BOSS3D=(function(){
  const V3=THREE.Vector3;
  // a little modelling kit: parts are baked per bone into one vertex-coloured mesh; glows stay their own
  function kit(){ const g=new THREE.Group(), bodyM=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:18,specular:0x332233}), bones={root:g}, parts=new Map(), glows=[];
    const bone=(name,parent,x,y,z)=>{ const b=new THREE.Group(); b.position.set(x,y,z); (bones[parent]||g).add(b); bones[name]=b; return b; };
    const add=(bn,geo,col,x,y,z,rx,ry,rz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx!==undefined) m.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz); m.updateMatrix();
      const ge=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(m.matrix); if(!parts.has(bn)) parts.set(bn,[]); parts.get(bn).push([ge,col]); };
    const lit=(bn,geo,col,x,y,z,rx,ry,rz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col})); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx!==undefined) m.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz); (bones[bn]||g).add(m); glows.push(m); return m; };
    const fade=(bn,geo,col,op,x,y,z,rx,ry,rz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx!==undefined) m.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz); (bones[bn]||g).add(m); return m; };
    function finish(){ const c=new THREE.Color(); parts.forEach((list,bn)=>{ const pos=[], nor=[], col=[]; list.forEach(([ge,h])=>{ ge.computeVertexNormals(); const p=ge.attributes.position.array, n=ge.attributes.normal.array; c.setHex(h);
        for(let k=0;k<p.length;k++){ pos.push(p[k]); nor.push(n[k]); } for(let k=0;k<p.length/3;k++) col.push(c.r,c.g,c.b); });
      const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      const m=new THREE.Mesh(bg,bodyM); m.castShadow=true; (bones[bn]||g).add(m); }); g.userData.mats=[bodyM]; return g; }
    return {g,bones,bone,add,lit,fade,finish,bodyM}; }
  const S=(r,w,h)=>new THREE.SphereGeometry(r,w||12,h||9), C=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||8), K=(r,h,s)=>new THREE.ConeGeometry(r,h,s||7), X=(w,h,d)=>new THREE.BoxGeometry(w,h,d), Tor=(r,t,a)=>new THREE.TorusGeometry(r,t,6,18,a||Math.PI*2);
  const dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
  // eyes that mean it: slanted slits lit from within, a haze about them, a brow driven down over them
  function evilEyes(k,bn,col,y,z,w,brow){ w=w||0.12; [-1,1].forEach(s=>{ k.lit(bn,X(w,0.035,0.03),col,s*0.12,y,z,0,0,s*0.38); k.fade(bn,S(0.07,8,6),col,0.45,s*0.12,y,z-0.01,0,0,0,1.6,0.8,0.6);
    if(brow!==undefined) k.add(bn,X(0.2,0.05,0.07),brow,s*0.11,y+0.07,z-0.01,0,0,s*0.5); }); }

  // ── shared bodies ──
  // a brute: hunched, heavy-shouldered, on goat's legs; arms on bones 'aL','aR' (shoulder pivots), head on 'hd'
  function brute(k,o){ const {add,bone}=k, B=o.body, D=o.dark, Bl=o.belly||dk(B,1.25);
    bone('tor','root',0,0,0); bone('hd','tor',0,2.2,0.14); bone('aL','tor',-0.62,1.9,0); bone('aR','tor',0.62,1.9,0);
    add('tor',S(0.55),B,0,1.62,-0.02,0.3,0,0,1.15,1.1,0.85); add('tor',S(0.42),Bl,0,1.3,0.14,0,0,0,1.05,1.0,0.75); add('tor',S(0.4),B,0,1.0,-0.06,0,0,0,1.1,0.8,0.9);
    [-1,1].forEach(s=>{ add('tor',S(0.3),B,s*0.56,1.9,0,0,0,0,1,0.9,1); add('tor',C(0.17,0.13,0.6),B,s*0.24,0.72,0.12,-0.5,0,0); add('tor',C(0.12,0.09,0.55),D,s*0.24,0.32,-0.04,0.5,0,0); add('tor',X(0.2,0.1,0.26),D,s*0.24,0.04,0.04);
      const a=s<0?'aL':'aR'; add(a,C(0.15,0.12,0.62),B,0,-0.32,0.04,0.25,0,s*0.18); add(a,C(0.12,0.09,0.56),B,s*0.08,-0.84,0.18,-0.35,0,s*0.08); add(a,S(0.13),D,s*0.1,-1.14,0.28);
      for(let i=-1;i<=1;i++) add(a,K(0.035,0.22,4),o.claw||0xe8dcc8,s*0.1+i*0.06,-1.27,0.38,2.2,0,0); });
    add('hd',S(0.32),B,0,0,0,0,0,0,1,0.95,1.05); add('hd',X(0.36,0.16,0.28),Bl,0,-0.1,0.24); add('hd',X(0.32,0.08,0.22),D,0,-0.22,0.22); add('hd',X(0.38,0.06,0.08),D,0,0.12,0.27,-0.25,0,0);
    [-1,1].forEach(s=>add('hd',K(0.025,0.1,4),0xf0e8d8,s*0.08,-0.2,0.36,Math.PI,0,0));
    for(let i=0;i<6;i++) add('tor',K(0.07,0.22,5),D,0,2.0-i*0.2,-0.42+i*0.03,-0.7,0,0); }
  // a spectre: no legs — a robe (or a tail) that thins to nothing; it floats. Arms on 'aL','aR', head 'hd'
  function spectre(k,o){ const {add,bone,fade}=k, B=o.body, D=o.dark;
    bone('tor','root',0,0.35,0); bone('hd','tor',0,1.95,0.08); bone('aL','tor',-0.5,1.7,0); bone('aR','tor',0.5,1.7,0);
    add('tor',S(0.42),B,0,1.45,0,0.15,0,0,1.1,1.1,0.8); add('tor',K(0.62,1.5,10),D,0,0.55,0,0,0,0,1,1,0.85);
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, L=0.55+(i%3)*0.25; add('tor',K(0.12,L,4),D,Math.sin(a)*0.56,-0.15-L/2,Math.cos(a)*0.48,Math.PI-0.35*Math.cos(a),0,0.35*Math.sin(a)); }
    [-1,1].forEach(s=>{ const a=s<0?'aL':'aR'; add('tor',S(0.22),D,s*0.48,1.7,0); add(a,C(0.1,0.08,0.7),B,0,-0.35,0.06,0.3,0,s*0.2); add(a,C(0.08,0.06,0.65),B,s*0.08,-0.95,0.2,-0.4,0,s*0.1);
      add(a,K(0.2,0.5,6),D,s*0.05,-0.6,0,0.2,0,s*0.3,1,1,0.6); for(let i=-1;i<=1;i++) add(a,K(0.025,0.28,4),o.claw||0xd8d0c8,s*0.1+i*0.05,-1.36,0.36,2.3,0,0); });
    if(o.wisp) for(let i=0;i<5;i++) fade('tor',K(0.3-i*0.04,0.8,7),o.wisp,0.18,Math.sin(i*2.1)*0.15,-0.25-i*0.12,Math.cos(i*2.1)*0.1,Math.PI,0,0); }
  // a knight of the dark: plate, pauldrons, a helm on 'hd', the sword-arm 'aR' (a blade on it), the shield-arm 'aL'
  function plate(k,o){ const {add,bone}=k, A=o.armour, D=o.dark, T=o.trim;
    bone('tor','root',0,0,0); bone('hd','tor',0,2.15,0.04); bone('aL','tor',-0.6,1.86,0); bone('aR','tor',0.6,1.86,0); bone('cape','tor',0,1.95,-0.32);
    add('tor',C(0.56,0.38,0.85,6),A,0,1.42,0,0,Math.PI/6,0,1,1,0.62); add('tor',X(0.3,0.6,0.08),T,0,1.45,0.3); add('tor',X(0.7,0.3,0.46),D,0,1.0,0); add('tor',K(0.42,0.3,4),A,0,1.84,0.02,0,Math.PI/4,0,1.4,1,1); add('tor',X(0.9,0.08,0.52),T,0,1.04,0);
    for(let i=0;i<4;i++) add('tor',X(0.5,0.16,0.06),i%2?A:D,0,0.86-i*0.12,0.24,-0.15,0,0);   // the tassets
    [-1,1].forEach(s=>{ add('tor',C(0.16,0.14,0.55),A,s*0.22,0.62,0); add('tor',S(0.15),T,s*0.22,0.48,0.08); add('tor',C(0.14,0.13,0.5),D,s*0.22,0.18,0.02); add('tor',X(0.24,0.12,0.4),D,s*0.22,0.04,0.08);
      const a=s<0?'aL':'aR'; add(a,S(0.32),A,0,0.05,0,0,0,s*0.3,1.2,0.8,1.05); add(a,C(0.13,0.11,0.55),D,0,-0.38,0.02,0.15,0,s*0.12); add(a,C(0.13,0.12,0.42),A,s*0.04,-0.8,0.14,-0.5,0,0); add(a,X(0.18,0.18,0.2),D,s*0.05,-1.06,0.3); });
    add('hd',C(0.22,0.25,0.5,8),A,0,0,0); add('hd',K(0.23,0.22,8),A,0,0.33,0); add('hd',X(0.3,0.36,0.08),D,0,-0.02,0.21); add('hd',X(0.06,0.42,0.06),T,0,0.04,0.26); add('hd',C(0.255,0.255,0.05,8),T,0,0.2,0);
    const cape=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.9,1,4),new THREE.MeshLambertMaterial({color:o.cape||D,side:THREE.DoubleSide})); cape.position.set(0,-0.95,0); k.bones.cape.add(cape); k.capeMesh=cape; }

  // ── the ten ──
  const M={};
  M[0]=k=>{ const sh=0x2a1a3a, dk2=0x120a1a, gl=0xc890ff; spectre(k,{body:sh,dark:dk2,wisp:0x8a4ad8,claw:0x2a1a3a});
    const {add,lit,fade}=k; add('hd',S(0.36),sh,0,0,0,0,0,0,1.15,1,1); [-1,1].forEach(s=>{ add('hd',K(0.1,0.6,5),sh,s*0.38,0.18,-0.05,0,0,-s*1.15); add('hd',K(0.06,0.3,4),dk2,s*0.24,0.3,0,0,0,-s*0.5); });
    evilEyes(k,'hd',gl,0.06,0.34,0.15,dk2); add('hd',X(0.4,0.12,0.06),0x08040c,0,-0.13,0.31,0,0,0); lit('hd',X(0.36,0.05,0.02),0x6a20b0,0,-0.15,0.33);
    for(let i=0;i<10;i++){ add('hd',K(0.02,0.09,4),0xf0e8ff,-0.17+i*0.038,-0.08,0.34,Math.PI,0,0); add('hd',K(0.018,0.07,4),0xf0e8ff,-0.15+i*0.034,-0.19,0.34,0,0,0); }
    for(let i=0;i<7;i++){ const a=(i/6-0.5)*1.6; k.crown=k.crown||[]; k.crown.push(fade('hd',K(0.07,0.42,5),0x9a50ff,0.85,Math.sin(a)*0.28,0.42,Math.cos(a)*0.1-0.05,0,0,-a*0.4)); }
    k.extra=(t,g)=>{ k.crown.forEach((c,i)=>{ c.scale.y=1+Math.sin(t*9+i*1.7)*0.3; }); }; return 0x9a50ff; };
  M[1]=k=>{ const ir=0x3a3e46, dk2=0x16181c, gl=0x8affc8; spectre(k,{body:0x2a2e34,dark:dk2,wisp:0x4ad8a0,claw:0x5a5e66});
    const {add,lit,fade}=k; add('hd',S(0.36),dk2,0,0,-0.04,0,0,0,1,1.1,1.05); add('hd',K(0.32,0.5,8),dk2,0,0.32,-0.12,-0.4,0,0); add('hd',S(0.27),0x020304,0,-0.02,0.1,0,0,0,1,1.05,0.7);   // the hood, and the dark inside it
    add('hd',C(0.36,0.34,0.12,10),ir,0,0.24,0); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; add('hd',K(0.05,0.26,4),ir,Math.sin(a)*0.34,0.42,Math.cos(a)*0.34); }   // the iron crown
    evilEyes(k,'hd',gl,0.0,0.27,0.12); fade('hd',S(0.2),gl,0.3,0,-0.04,0.14);
    for(let r=0;r<3;r++){ const tor=new THREE.TorusGeometry(0.5-r*0.05,0.035,5,24); for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; add('tor',Tor(0.05,0.016),0x6a6e78,Math.cos(a)*(0.48-r*0.04),1.1+r*0.3+Math.sin(a*2)*0.05,Math.sin(a)*(0.4-r*0.04),0,a+(i%2)*Math.PI/2,0); } }   // chains wound about it
    // the flail: a chain down from the right hand to an iron ball
    for(let i=0;i<6;i++) add('aR',Tor(0.05,0.016),0x6a6e78,0.12,-1.4-i*0.09,0.4,0,(i%2)*Math.PI/2,0); add('aR',S(0.2),ir,0.12,-2.05,0.4); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; add('aR',K(0.05,0.18,4),ir,0.12+Math.cos(a)*0.2,-2.05+Math.sin(a)*0.2,0.4,0,0,a-Math.PI/2); }
    k.extra=t=>{}; return 0x4ad8a0; };
  M[2]=k=>{ const sea=0x2a6a6a, dk2=0x123a3e, gl=0x6af8f0; spectre(k,{body:sea,dark:dk2,wisp:0x2ac8d8,claw:0xc8e8e0});
    const {add,lit,fade,bone}=k; add('hd',S(0.33),sea,0,0,0,0,0,0,1,1.1,1); add('hd',X(0.3,0.14,0.2),dk2,0,-0.18,0.2);
    evilEyes(k,'hd',gl,0.05,0.31,0.13,dk2);
    for(let i=0;i<7;i++){ const a=(i/6-0.5)*2.2; add('hd',C(0.025,0.04,0.35+(i%2)*0.2,5),[0xe86a6a,0xf09a6a,0xe8e0d0][i%3],Math.sin(a)*0.3,0.34+(i%2)*0.08,Math.cos(a)*0.08-0.06,0,0,-a*0.5); }   // the coral crown
    for(let i=0;i<10;i++){ const a=Math.PI*0.6+i/9*Math.PI*0.8; add('hd',X(0.04,0.9+(i%3)*0.3,0.02),[0x2e6a4a,0x3a7a3a,0x1e5a4a][i%3],Math.sin(a)*0.3,-0.45,Math.cos(a)*0.3,0.1*Math.cos(a),a,0); }   // weed for hair
    // the tail of tentacles under the robe
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, b=bone('tn'+i,'tor',Math.sin(a)*0.3,0.1,Math.cos(a)*0.25); b.rotation.set(Math.cos(a)*0.5,0,-Math.sin(a)*0.5); for(let j=0;j<5;j++) add('tn'+i,S(0.12-j*0.02,8,6),j%2?sea:dk2,0,-j*0.18,0); }
    k.tent=[0,1,2,3,4,5].map(i=>k.bones['tn'+i]);
    // the trident
    add('aR',C(0.03,0.03,2.6,6),0x6a5a3a,0.12,-1.2,0.4,0,0,0); [-0.14,0,0.14].forEach(x=>add('aR',K(0.04,0.3,4),0xd8d0b8,0.12+x,0.18,0.4)); add('aR',X(0.34,0.05,0.05),0xd8d0b8,0.12,0.02,0.4);
    k.extra=t=>{ k.tent.forEach((b,i)=>{ b.rotation.z+=Math.sin(t*2+i)*0.004; b.rotation.x=0.4*Math.cos(i/6*Math.PI*2)+Math.sin(t*2.2+i*1.3)*0.25; }); }; return 0x2ac8d8; };
  M[3]=k=>{ const bark=0x4a3a26, dkb=0x2a2016, moss=0x4a6a2a, gl=0xc8ff50; brute(k,{body:bark,dark:dkb,belly:0x5a4a30,claw:0x6a5a3a});
    const {add,lit,fade,bone}=k;
    // the antlers of thorn
    [-1,1].forEach(s=>{ let x=s*0.18, y=0.2, z=-0.05; for(let i=0;i<4;i++){ add('hd',C(0.04,0.07,0.35,5),dkb,x+s*0.1,y+0.15,z,-0.2,0,-s*(0.5+i*0.15)); x+=s*0.18; y+=0.28; add('hd',K(0.04,0.22,4),0x6a5a2a,x,y,z+0.08,0.6,0,s*0.6); } });
    // moss on the shoulders, roots for feet, the split maw lit from inside
    [-1,1].forEach(s=>{ add('tor',S(0.24,8,6),moss,s*0.56,2.1,0,0,0,0,1,0.45,1); for(let i=0;i<3;i++) add('tor',C(0.03,0.07,0.6,5),dkb,s*0.24+(i-1)*0.12,0.05,0.12+i*0.05,1.2,0,(i-1)*0.6); });
    lit('hd',X(0.22,0.05,0.04),gl,0,-0.17,0.36); evilEyes(k,'hd',gl,0.06,0.33,0.13,dkb);
    for(let i=0;i<9;i++){ const s=lit('tor',X(0.03,0.35+i%3*0.15,0.02),gl,Math.sin(i*1.9)*0.4,1.1+((i*37)%10)/12,0.35+Math.cos(i*1.9)*0.06); s.rotation.z=(i%3-1)*0.5; }   // green fire in the bark's cracks
    for(let i=0;i<5;i++) add('aR',K(0.04,0.2,4),0x6a5a2a,0.1,-0.4-i*0.15,0.15,0,0,1.4); for(let i=0;i<5;i++) add('aL',K(0.04,0.2,4),0x6a5a2a,-0.1,-0.4-i*0.15,0.15,0,0,-1.4);
    k.extra=t=>{}; return 0x84cc16; };
  M[4]=k=>{ const ob=0x241c1c, dk2=0x120c0c, gl=0xff8a2a; brute(k,{body:ob,dark:dk2,belly:0x3a2a22,claw:0x3a2a22});
    const {add,lit,fade}=k;
    // the furnace in the hollow chest, its grate, the heat-haze
    const core=lit('tor',S(0.22),0xffd060,0,1.5,0.3); fade('tor',S(0.4),gl,0.35,0,1.5,0.32); for(let i=-2;i<=2;i++) add('tor',X(0.04,0.5,0.04),dk2,i*0.09,1.5,0.5);
    for(let i=0;i<16;i++){ const a=i*2.4, y=0.6+(i%8)*0.22, s=lit(i%2?'tor':(i%4?'aL':'aR'),X(0.025,0.3,0.02),gl,i%2?Math.sin(a)*0.5:0,i%2?y:-0.3-(i%3)*0.25,i%2?0.3+Math.cos(a)*0.08:0.15); s.rotation.z=(i%3-1)*0.7; }   // molten seams
    [-1,1].forEach(s=>{ for(let i=0;i<3;i++) k.flm=(k.flm||[]).concat([fade('hd',K(0.08-i*0.015,0.45-i*0.08,5),i?0xffd060:gl,0.85,s*(0.2+i*0.12),0.3+i*0.22,-0.02-i*0.04,-0.35,0,-s*(0.4+i*0.15))]); });   // horns of flame
    lit('hd',X(0.1,0.04,0.03),0xffd060,-0.11,0.04,0.3); lit('hd',X(0.1,0.04,0.03),0xffd060,0.11,0.04,0.3); lit('hd',X(0.24,0.05,0.04),gl,0,-0.18,0.36);
    k.extra=t=>{ core.scale.setScalar(1+Math.sin(t*6)*0.12); k.flm.forEach((f,i)=>{ f.scale.y=1+Math.sin(t*11+i)*0.25; }); }; return 0xff8a2a; };
  M[5]=k=>{ const ice=0x9ab8d8, dk2=0x3a4a6a, gl=0xb8f0ff; plate(k,{armour:ice,dark:dk2,trim:0xe8f4ff,cape:0x2a3a6a});
    const {add,lit,fade}=k;
    [-1,1].forEach(s=>{ const a=s<0?'aL':'aR'; for(let i=0;i<5;i++) add(a,K(0.07,0.5+(i%2)*0.3,5),0xd8f0ff,s*(0.05+i*0.06),0.25+(i%2)*0.1,-0.12+i*0.06,-0.3+i*0.15,0,-s*(0.2+i*0.2)); });   // crystal pauldrons
    for(let i=0;i<9;i++){ const a=(i/8-0.5)*2.4; add('hd',K(0.04,0.3+(i%2)*0.25,4),0xe8f8ff,Math.sin(a)*0.22,0.38,Math.cos(a)*0.22-0.02); }   // the crown of icicles
    lit('hd',X(0.3,0.04,0.02),gl,0,0.04,0.23);
    // the blade of ice
    add('aR',X(0.06,0.24,0.3),0x8a9ab8,0.05,-1.2,0.3); const bl=lit('aR',X(0.12,1.8,0.04),0xc8ecff,0.05,-0.27,0.73,0.45,0,0); fade('aR',X(0.3,1.9,0.1),gl,0.25,0.05,-0.27,0.73,0.45,0,0);
    k.extra=t=>{}; return 0x67e8f9; };
  M[6]=k=>{ const ch=0x2a1a18, dk2=0x120a08, gl=0xff4a1a; brute(k,{body:ch,dark:dk2,belly:0x3a221c,claw:0x1a1210});
    const {add,lit,fade,bone}=k;
    [-1,1].forEach(s=>{ let x=s*0.2, y=0.22, z=0; [[0.1,0.3,-0.4],[0.085,0.28,-1.0],[0.07,0.26,-1.7],[0.05,0.24,-2.4],[0.035,0.2,-3.0]].forEach(([r,l,a])=>{ add('hd',C(r*0.8,r,l,6),0x3a2e26,x,y,z,a,0,-s*0.6); y+=Math.cos(a)*l*0.85; z+=Math.sin(a)*l*0.85; x+=s*0.09; }); });   // ram's horns
    for(let i=0;i<12;i++){ const a=i*2.4, s=lit(i%3?'tor':'hd',X(0.03,0.3+i%3*0.15,0.02),gl,Math.sin(a)*0.38,i%3?1.0+((i*37)%10)/10:0.05,i%3?0.32+Math.cos(a)*0.06:0.3); s.rotation.z=(i%3-1)*0.6; }   // the red under the char
    k.mane=[]; for(let i=0;i<9;i++){ const a=(i/8-0.5)*2.6; k.mane.push(fade('tor',K(0.12,0.6,5),i%2?0xffa040:gl,0.8,Math.sin(a)*0.4,2.3,Math.cos(a)*0.2-0.25,-0.3,0,-a*0.4)); }
    evilEyes(k,'hd',0xffd060,0.06,0.33,0.14,dk2);
    // burning wings
    [-1,1].forEach(s=>{ const w=bone('w'+s,'tor',s*0.3,1.95,-0.35); const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(1.5,0.9); sh.lineTo(1.55,0.1); sh.quadraticCurveTo(1.3,-0.2,1.1,-0.6); sh.quadraticCurveTo(0.8,-0.45,0.65,-0.85); sh.quadraticCurveTo(0.4,-0.5,0.1,-0.7); sh.lineTo(0,0);
      const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshPhongMaterial({color:0x2a0a06,emissive:0x5a1004,side:THREE.DoubleSide,flatShading:true})); m.scale.set(s,1,1); m.rotation.y=-s*0.3; w.add(m);
      const e=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:gl,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); e.scale.set(s*1.05,1.05,1); e.rotation.y=-s*0.3; e.position.z=-0.02; w.add(e); });
    // the whip of fire
    for(let i=0;i<10;i++) lit('aR',S(0.045-i*0.003,6,4),i%2?0xffa040:gl,0.12+Math.sin(i*0.5)*0.15,-1.3-i*0.15,0.4+i*0.06);
    k.extra=t=>{ k.mane.forEach((f,i)=>{ f.scale.y=1+Math.sin(t*10+i*1.3)*0.3; }); }; return 0xff4a1a; };
  M[7]=k=>{ const sl=0x3e4656, dk2=0x1c2230, gl=0xc8e0ff; plate(k,{armour:sl,dark:dk2,trim:0xc89048,cape:0x2a2a5a});
    const {add,lit,fade}=k;
    for(let i=0;i<5;i++){ const a=(i/4-0.5)*1.6; add('hd',C(0.02,0.035,0.5+(i%2)*0.2,5),0xc89048,Math.sin(a)*0.2,0.45,Math.cos(a)*0.05-0.05,0,0,-a*0.5); lit('hd',S(0.045,6,5),gl,Math.sin(a)*0.33,0.72+(i%2)*0.1,-0.05); }   // the crown of rods
    lit('hd',X(0.32,0.05,0.02),gl,0,0.04,0.23);
    [-1,1].forEach(s=>{ const a=s<0?'aL':'aR'; for(let i=0;i<3;i++) add(a,C(0.025,0.04,0.4,5),0xc89048,s*(0.1+i*0.12),0.32,-0.05,0,0,-s*0.3); });
    // the hammer
    add('aR',C(0.05,0.05,1.9,6),0x4a3a2a,0.05,-1.1,0.3); add('aR',X(0.6,0.36,0.36),sl,0.05,-0.15,0.3); add('aR',X(0.64,0.08,0.4),0xc89048,0.05,-0.15,0.3); lit('aR',S(0.09,8,6),gl,0.05,-0.15,0.5);
    // lightning crawling over it: a few bright zig-zags, re-thrown every moment
    k.arcs=[]; for(let i=0;i<5;i++){ const pts=[]; for(let j=0;j<6;j++) pts.push(new V3(0,0,0)); const geo=new THREE.BufferGeometry().setFromPoints(pts); const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xe8f4ff})); k.g.add(l); k.arcs.push(l); }
    k.extra=t=>{ if(Math.random()<0.25) k.arcs.forEach(l=>{ const p=l.geometry.attributes.position, a=Math.random()*6.28, y0=0.6+Math.random()*1.8; for(let j=0;j<6;j++) p.setXYZ(j,Math.sin(a)*0.55+(Math.random()-0.5)*0.3,y0+j*0.12*(Math.random()<0.5?1:-1)+(Math.random()-0.5)*0.1,Math.cos(a)*0.4+(Math.random()-0.5)*0.3); p.needsUpdate=true; l.visible=Math.random()<0.7; }); };
    return 0xfbbf24; };
  M[9]=k=>{ const ob=0x18121c, au=0xc89a3a, gl=0xe050ff; plate(k,{armour:ob,dark:0x0a060c,trim:au,cape:0x2a0a2a});
    const {add,lit,fade,bone}=k;
    [-1,1].forEach(s=>{ const a=s<0?'aL':'aR'; add(a,K(0.12,0.5,4),au,s*0.12,0.35,0,0,0,-s*0.4); add(a,K(0.08,0.36,4),au,s*0.28,0.2,0,0,0,-s*0.9); });
    add('hd',K(0.06,0.5,4),au,0,0.5,0.02); [-1,1].forEach(s=>add('hd',K(0.05,0.55,4),au,s*0.2,0.35,-0.04,-0.3,0,-s*0.6)); lit('hd',X(0.3,0.05,0.02),gl,0,0.04,0.23);
    // the anti-halo: shards turning in a ring behind the head
    const halo=bone('halo','hd',0,0.2,-0.4); k.halo=halo; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; add('halo',K(0.06,0.34,4),i%2?0x2a1a2a:au,Math.cos(a)*0.6,Math.sin(a)*0.6,0,0,0,a-Math.PI/2); } const ring=lit('halo',Tor(0.6,0.02),gl,0,0,0);
    fade('halo',new THREE.CircleGeometry(0.52,24),0x0a0010,0.0,0,0,-0.01);
    // four wings of void
    [-1,1].forEach(s=>{ const w=bone('w'+s,'tor',s*0.25,1.9,-0.3); [0,1].forEach(j=>{ const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(1.6,0.5-j*0.9); sh.lineTo(1.2,-0.1-j*0.9); sh.lineTo(0.15,-0.25-j*0.3); sh.lineTo(0,0);
      const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:j?0x6a10a0:0xa020e0,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})); m.scale.set(s,1,1); m.rotation.y=-s*0.35; w.add(m); }); });
    // the great blade, void-edged
    add('aR',X(0.08,0.3,0.4),au,0.05,-1.2,0.3); add('aR',X(0.14,2.0,0.05),0x1a121e,0.05,-1.2,1.35,Math.PI/2,0,0); lit('aR',X(0.03,2.0,0.06),gl,0.05,-1.2,1.35,Math.PI/2,0,0);
    k.extra=t=>{ k.halo.rotation.z=t*0.6; }; return 0xe050ff; };
  // 8 the Dark Paladin: the knight's own body (its swing, its stride) in black, made monstrous
  function paladin(level){ const kn=buildKnight(); kn.setLivery('knight',{TUNIC:'#1a1222',TUNIC_RIM:'#5a2a8a',LEG:'#120c18',PLUME:'#4a1a7a',HELM:'#24202c'});
    // its own darkened copies of the knight's materials (the player's knight keeps his): black plate, a violet sheen
    const mats=[], swap=[], VIO=new THREE.Color(0x3a1a5a); kn.traverse(m=>{ if(!m.isMesh||!m.material||Array.isArray(m.material)) return; m.castShadow=true; const o=m.material, d=o.clone();
      if(d.color){ const l=d.color.getHSL({}).l; d.color.setRGB(0.09,0.07,0.11).lerp(VIO,0.35).multiplyScalar(0.6+l*1.4); } if(d.map&&d.color) d.color.multiplyScalar(0.55); if(d.emissive) d.emissive.setHex(0x0c0414); if('shininess' in d) d.shininess=40;
      m.material=d; swap.push([m,o,d]); mats.push(d); });
    const R=kn.rig||{}, adorn=[], gl=0xb070ff, mk=(par,geo,col,x,y,z,rx,ry,rz)=>{ if(!par) return null; const m=new THREE.Mesh(geo,col.isMaterial?col:new THREE.MeshPhongMaterial({color:col,flatShading:true,shininess:30})); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); par.add(m); if(!col.isMaterial) mats.push(m.material); adorn.push(m); return m; };
    const hd=R.head, tor=R.torso, sc=(kn.height||1.5);
    if(hd){ [-1,1].forEach(s=>{ mk(hd,K(0.05,0.32,5),0x2a2430,s*0.12,0.28,-0.02,-0.3,0,-s*0.7); mk(hd,K(0.035,0.22,5),0x3a3440,s*0.18,0.4,-0.08,-0.7,0,-s*0.9); });
      mk(hd,X(0.2,0.025,0.02),new THREE.MeshBasicMaterial({color:gl}),0,0.0,0.16); }
    if(tor){ [-1,1].forEach(s=>{ for(let i=0;i<3;i++) mk(tor,K(0.04,0.2,4),0x2a2430,s*(0.2+i*0.04),0.42+i*0.02,-0.04+i*0.04,-0.2,0,-s*(0.8+i*0.2)); });
      const au=new THREE.Mesh(new THREE.SphereGeometry(0.55,14,10),new THREE.MeshBasicMaterial({color:0x6a2aaa,transparent:true,opacity:0.06,depthWrite:false,blending:THREE.AdditiveBlending})); au.position.y=0.1; tor.add(au); adorn.push(au); }
    const g=new THREE.Group(); g.add(kn); kn.scale.setScalar(1.6); g.animate=(dt,mode)=>kn.animate(dt,mode,1); g.userData.mats=mats; g.userData.mark=gl; ring(g,0x8a4ad8,1.2); motes(g,0xa070ff,0.6,1.8);
    // the hall of mirrors (guardians.js): when it puts on your shape it must look exactly like you — the horns, the spikes, the size, the glow all go;
    //  when the veil drops (setLivery to its dark colours) they come back
    const evil=on=>{ swap.forEach(([m,o,d])=>m.material=on?d:o); adorn.forEach(m=>m.visible=on); kn.scale.setScalar(on?1.6:1); g.children.forEach(c=>{ if(c!==kn) c.visible=on; }); };
    g.dress=st=>{ if(kn.dress) kn.dress(st); evil(false); }; g.setLivery=(l,c)=>{ kn.setLivery(l,c); evil(true); };
    return g; }

  // the ground under every guardian: a ring of its colour, slowly turning; and motes rising off it
  function ring(g,col,r){ const m=new THREE.Mesh(new THREE.RingGeometry(r*0.82,r,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.45,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); m.rotation.x=-Math.PI/2; m.position.y=0.04; g.add(m);
    const d=new THREE.Mesh(new THREE.CircleGeometry(r*0.8,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false})); d.rotation.x=-Math.PI/2; d.position.y=0.03; g.add(d); g.userData.ring=m; }
  let MT=null; function motes(g,col,rad,h){ if(!MT){ const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d'), gr=x.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,32,32); MT=new THREE.CanvasTexture(c); }
    const N=36, pos=new Float32Array(N*3), seed=[]; for(let i=0;i<N;i++){ seed.push([Math.random()*6.28,Math.random()*rad,Math.random()*h,0.3+Math.random()*0.7]); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const p=new THREE.Points(geo,new THREE.PointsMaterial({size:0.12,map:MT,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); p.frustumCulled=false; g.add(p);
    g.userData.motes={geo,seed,h,rad,pts:p}; }
  function tickMotes(g,dt){ const m=g.userData.motes; if(!m) return; const p=m.geo.attributes.position; m.seed.forEach((s,i)=>{ s[2]+=dt*s[3]; if(s[2]>m.h) s[2]=0; s[0]+=dt*0.4; p.setXYZ(i,Math.cos(s[0])*s[1],s[2],Math.sin(s[0])*s[1]); }); p.needsUpdate=true; }

  // ── V177: the sculpted guardians (BOSSART, tools/sculpt_bosses.py) — a whole hide on each, posed bone by bone by what the
  //    fight is doing: f.pose ('wind' | 'strike' | 'recover' | 'stagger' | 'roar' | 'burrow' | 'cast'), f.poseK (0..1 through it),
  //    f.shape ('arc' | 'thrust' | 'slam' | 'spin' | 'claw'), f.side (±1, which arm leads). Old states ('telegraph', 'charge',
  //    'stunned', the air) pose too, so the guardians still on the old moves move as well as the new.
  const TALL=[3.1,4.0,3.9,4.2,3.9,4.0,3.9,4.3,4.1,4.3], FLOATS=[0,2], LEAN=[0.18,0.12,0.12,0.1,0.1,0.1,0.12,0.09,0.1,0.1];
  // V178: the finale's two as well — BOSS3D.sculpt('ab'|'pk', {tall, mark, lean}) (abaddon.js)
  const OPT={ab:{tall:5.6,mark:0xb026ff,lean:0.07,ring:2.0},ab1:{tall:6.6,mark:0xb026ff,lean:0.07,ring:2.3},ab2:{tall:8.4,mark:0xff2a5a,lean:0.07,ring:2.6},pk:{tall:3.6,mark:0xe0885a,lean:0.1,ring:1.4}};
  function sculpted(town,key,o){ key=key||'b'+town; o=Object.assign({},OPT[key]||{tall:TALL[town],mark:[0x8a4ad8,0x9ae0c0,0x40e0d0,0x9ad040,0xff7a20,0x9ae0ff,0xff4a10,0xa8c0ff,0xa070ff,0xc040ff][town],lean:LEAN[town],ring:town===0?1.1:1.45},o||{}); const TL=o.tall;
    if(typeof BOSSART==='undefined'||!BOSSART.has(key)||(typeof LOOK2!=='undefined'&&!LOOK2)) return null;
    const art=BOSSART.make(key); if(!art) return null; const B=art.userData.bones, g=new THREE.Group(), body=B.body;
    // what isn't a bone (wings, the halo) rides the body, so it leans and turns with it
    art.children.slice().forEach(ch=>{ if(ch!==body) body.attach(ch); });   // the head and arms too: they lean and turn with the trunk
    ['w1','w-1','v1','v-1'].forEach(k=>{ if(art[k]) g[k]=art[k]; });
    const bb=new THREE.Box3(); art.updateMatrixWorld(true); art.traverse(m=>{ if(m.isMesh&&!m.material.transparent&&!m.material.isMeshBasicMaterial) bb.expandByObject(m); });
    const h0=Math.max(0.5,bb.max.y-bb.min.y), s=TL/h0; art.scale.setScalar(s); g.add(art);
    const mark=o.mark;
    g.userData.mark=mark; g.userData.mats=art.userData.mats; g.userData.bones=B; g.userData.sculpt=true; g.userData.tall=TL;
    const float=town!=null&&FLOATS.includes(town); g.userData.float=float; ring(g,mark,o.ring); motes(g,mark,1.0,TL*0.7);
    const base={}; Object.keys(B).forEach(n=>{ base[n]={p:B[n].position.clone(),r:B[n].rotation.clone()}; });
    const cur={}; ['bx','by','bz','ty','hx','hy','lx','lz','rx','rz','sink','spin'].forEach(k=>cur[k]=0);
    let t=Math.random()*10, spinA=0;
    g.animate=(dt,mode)=>{ dt=Math.min(dt||0.016,0.05); t+=dt; const f=g.userData.foe||{}, st=f.state, pose=f.pose, k=f.poseK||0, sh=f.shape||'arc', sd=f.side||1, walk=mode==='walk';
      const L=o.lean; const T={bx:0,by:0,bz:0,ty:0,hx:Math.sin(t*0.9)*0.05,hy:Math.sin(t*0.55)*0.18,lx:Math.sin(t*1.3)*0.08,lz:0.12,rx:-Math.sin(t*1.3)*0.08,rz:-0.12,sink:0,spin:0};
      let rate=7;
      if(float) T.by=0.22+Math.sin(t*1.7)*0.12; else T.by=Math.sin(t*1.9)*0.012;
      if(walk&&!pose){ const w=Math.sin(t*(town===0?11:6.5)); T.lx=w*0.55; T.rx=-w*0.55; T.by+=Math.abs(w)*0.05; T.bx=L*0.5; }
      // the arm that leads a blow; the other follows
      const lead=sd>0?['rx','rz']:['lx','lz'], off=sd>0?['lx','lz']:['rx','rz'], zs=sd>0?-1:1;
      const P=pose||(st==='telegraph'?'wind':st==='charge'?'charge':st==='stunned'?'stagger':st==='slam'?'strike':(st==='rise'||st==='hover'||st==='aim'||st==='dive'||st==='jump')?'air':null);
      if(P==='wind'){ rate=4+k*6;
        if(sh==='slam'){ T.lx=T.rx=-2.7*k; T.lz=0.25; T.rz=-0.25; T.bx=-L*1.3*k; T.hx=-0.3*k; }
        else if(sh==='thrust'){ T[lead[0]]=0.7*k; T[lead[1]]=zs*0.2; T.ty=sd*0.55*k; T.bx=-L*0.4*k; T[off[0]]=-0.6*k; }
        else if(sh==='spin'){ T.lz=1.25*k; T.rz=-1.25*k; T.lx=T.rx=-0.4; T.ty=-1.0*k; T.bx=L*0.3; }
        else if(sh==='claw'){ T.lx=T.rx=-2.2*k; T.lz=0.7*k; T.rz=-0.7*k; T.bx=-L*0.8*k; T.hx=-0.25*k; }
        else { T[lead[0]]=-2.4*k; T[lead[1]]=zs*-0.7*k; T.ty=sd*0.6*k; T.bx=-L*0.6*k; T[off[0]]=0.3*k; }
        T.bz=Math.sin(t*28)*0.012*k; }
      else if(P==='strike'){ rate=22;
        if(sh==='slam'){ T.lx=T.rx=-0.7; T.bx=L*2.2; T.by-=0.08; T.hx=0.25; }
        else if(sh==='thrust'){ T[lead[0]]=-1.65; T[lead[1]]=0; T.ty=-sd*0.35; T.bx=L*1.6; }
        else if(sh==='spin'){ T.lz=1.35; T.rz=-1.35; T.lx=T.rx=-0.3; T.spin=1; }
        else if(sh==='claw'){ T.lx=T.rx=-0.8; T.lz=-0.3; T.rz=0.3; T.bx=L*1.8; }
        else { T[lead[0]]=-1.0; T[lead[1]]=zs*-0.4+(-zs)*1.2*k; T.ty=-sd*0.8; T.bx=L*1.5; } }
      else if(P==='recover'){ rate=6; T.bx=L*1.7; T.hx=0.35; T.lx=T.rx=0.25; T.lz=0.05; T.rz=-0.05; T.by+=Math.sin(t*5)*0.02-0.04; }
      else if(P==='stagger'){ rate=8; T.bx=-L*1.2+Math.sin(t*6)*0.04; T.bz=Math.sin(t*3.2)*0.12; T.hx=0.4+Math.sin(t*4)*0.1; T.lx=0.3; T.rx=0.2; T.lz=0.35; T.rz=-0.35; T.by-=0.1; }
      else if(P==='roar'){ rate=9; T.bx=-L*1.6; T.hx=-0.55; T.lx=T.rx=-0.9; T.lz=1.0; T.rz=-1.0; T.bz=Math.sin(t*40)*0.02; }
      else if(P==='cast'){ rate=6; T.lx=T.rx=-1.9*(0.6+0.4*k); T.lz=0.5; T.rz=-0.5; T.hx=-0.3; T.bx=-L*0.5; }
      else if(P==='burrow'){ rate=5; T.sink=k; T.lx=T.rx=-2.8; T.bx=L; }
      else if(P==='charge'){ rate=8; T.bx=L*2.0; T.lx=T.rx=0.8; T.lz=0.4; T.rz=-0.4; T.hx=-0.2; }
      else if(P==='air'){ T.bx=st==='dive'?L*2.4:-L*0.5; T.lx=T.rx=st==='dive'?-2.6:-0.6; T.lz=0.6; T.rz=-0.6; }
      const e=Math.min(1,dt*rate); Object.keys(T).forEach(n=>{ cur[n]+=(T[n]-cur[n])*e; });
      if(T.spin) spinA+=dt*16; else spinA*=Math.max(0,1-dt*10);
      body.rotation.set(base.body.r.x+cur.bx,base.body.r.y+cur.ty+spinA,base.body.r.z+cur.bz); body.position.y=base.body.p.y+cur.by-cur.sink*TL/s*1.05;
      if(B.hd){ B.hd.rotation.set(base.hd.r.x+cur.hx,base.hd.r.y+cur.hy,base.hd.r.z); }
      if(B.aL){ B.aL.rotation.set(base.aL.r.x+cur.lx,base.aL.r.y,base.aL.r.z+cur.lz); }
      if(B.aR){ B.aR.rotation.set(base.aR.r.x+cur.rx,base.aR.r.y,base.aR.r.z+cur.rz); }
      art.visible=cur.sink<0.96&&!g.userData.disguised; if(g.userData.disguised&&g.userData.kn&&g.userData.kn.animate) g.userData.kn.animate(dt,walk?'walk':'idle');
      if(g.userData.ring){ g.userData.ring.rotation.z=t*0.5; g.userData.ring.material.opacity=P==='wind'?0.5+0.4*k:P==='recover'||P==='stagger'?0.15:0.4+Math.sin(t*2)*0.08; }
      tickMotes(g,dt); art.userData.tickArt(dt); };
    // Shadowmere: under the veil it puts on your shape (guardians.js calls g.dress(S)), and takes it off again (g.setLivery)
    if(town===8){ g.dress=S=>{ if(typeof COMBAT==='undefined'||!COMBAT.knightModel) return; if(!g.userData.kn){ const k=COMBAT.knightModel(); g.add(k); g.userData.kn=k; } const k=g.userData.kn; if(k.dress) k.dress(S); k.visible=true; g.userData.disguised=true; if(g.userData.ring) g.userData.ring.visible=false; if(g.userData.motes) g.userData.motes.pts.visible=false; };
      g.setLivery=()=>{ if(g.userData.kn) g.userData.kn.visible=false; g.userData.disguised=false; if(g.userData.ring) g.userData.ring.visible=true; if(g.userData.motes) g.userData.motes.pts.visible=true; }; }
    return wrap(g,false); }
  function make(town,level){ town=((town|0)%10+10)%10; const sc=sculpted(town); if(sc) return sc; if(town===8) return wrap(paladin(level),true);
    const k=kit(), col=M[town](k), g=k.finish(); g.userData.mark=col;
    const float=town<=2; g.userData.float=float; ring(g,col,1.3); motes(g,col,0.9,2.4);
    // the wings, where it has them, are the fight's to flap
    if(k.bones.w1) g.w1=k.bones.w1; if(k.bones['w-1']) g['w-1']=k.bones['w-1'];
    let t=Math.random()*10; const B=k.bones, base={};
    ['aL','aR','hd','tor'].forEach(n=>{ if(B[n]) base[n]=B[n].rotation.clone(); });
    g.animate=(dt,mode)=>{ t+=dt; const f=g.userData.foe, rage=f&&f.state==='telegraph', charge=f&&f.state==='charge', walk=mode==='walk'||charge;
      if(B.tor){ B.tor.position.y=(float?0.25+Math.sin(t*1.6)*0.12:Math.abs(Math.sin(t*(walk?6:1.4)))*(walk?0.08:0.03)); B.tor.rotation.x=charge?0.35:rage?-0.18:Math.sin(t*1.4)*0.03; }
      if(B.aL&&B.aR){ const up=rage?-2.3:0, sw=walk?Math.sin(t*6)*0.5:Math.sin(t*1.4)*0.08; B.aL.rotation.x+=((up||sw)-B.aL.rotation.x)*Math.min(1,dt*8); B.aR.rotation.x+=((up||-sw)-B.aR.rotation.x)*Math.min(1,dt*8); B.aL.rotation.z=rage?0.5:0; B.aR.rotation.z=rage?-0.5:0; }
      if(B.hd){ B.hd.rotation.x=rage?-0.3:Math.sin(t*0.9)*0.06; B.hd.rotation.y=Math.sin(t*0.6)*0.15; }
      if(B.cape) B.cape.rotation.x=0.15+Math.sin(t*2.2)*0.08+(walk?0.3:0);
      if(g.userData.ring){ g.userData.ring.rotation.z=t*0.5; g.userData.ring.material.opacity=rage?0.85:0.4+Math.sin(t*2)*0.08; }
      tickMotes(g,dt); if(k.extra) k.extra(t,g); };
    return wrap(g,false); }
  // the model sits at ground level; scale it to the fight (the fight multiplies by the view's scale itself)
  function wrap(g,isKnight){ if(isKnight){ const a=g.animate; g.animate=(dt,mode)=>{ a(dt,mode); tickMotes(g,dt); if(g.userData.ring) g.userData.ring.rotation.z+=dt*0.5; }; } g.traverse(m=>{ if(m.isMesh) m.castShadow=m.castShadow||!m.material.transparent; }); return g; }
  return {make,sculpt:(key,o)=>sculpted(null,key,o)};
})();
