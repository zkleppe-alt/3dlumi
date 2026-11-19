// ── KLK ARMOUR OF THE TOWNS (3D) — sets sold at Ironhold's Great Forge (V245) ──
// One set for each of the ten towns, released to the smith's stock when that town's chapel is cleansed, sold piece by piece.
//  Each is cut from the patterns already made (Templar, Striker, Guardian, Psalmist, Plain), forged in its own metals and
//  cloths, with something of its town laid on it:
//   Hearthward (Hearthvale) — wool and leather, a wheat-sheaf on the breast      Ironforged (Ironhold) — dark iron and bronze, rivets, crossed hammers
//   Tidecaller (Saltmere)   — sea-green steel, scallop-shell pauldrons, scales     Thornwarden (Thornwood) — leaf mantles, thorned vambraces
//   Sandstrider (Dusthaven) — robes the colour of dunes, the face wrapped         Crystalborn (Crystalpeak) — pale steel set with glowing crystal
//   Emberforged (Ashfield)  — blackened plate, ember-hot trim, horns              Tempest (Stormgate) — bright steel, a winged helm, the bolt on the breast
//   Shade (Shadowmere)      — dark robes, tatters, a violet light in the hood      Archangel (Hellgate) — white and gold, a halo, great wings
// The prices: a helm or tabard dearest, a plume cheapest; a full set ~900 gold, a little more for the farther towns.
(function(){ if(typeof ARMOR==='undefined') return; const {V,surf,band,sweep,bez,facetSphere,tri,piece,mesh,bounds}=ARMOR.H, P=ARMOR.PIECES;
  const MATS={}, mat=(k,o)=>MATS[k]||(MATS[k]=new THREE.MeshPhongMaterial(Object.assign({shininess:30,specular:0x2a2a2a},o)));
  const ext=(sh,d)=>{ const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false}).toNonIndexed(); g.computeVertexNormals(); return g; };
  const PRICE={helm:140,tabard:150,pauldrons:120,legs:100,arms:90,skirt:80,gauntlets:70,sabatons:70,belt:60,cowl:60,plume:40};
  // the torso's breast, for laying emblems on: its front surface z at (x,y)
  const breast=K=>{ const E=bounds(K.rig.torso,o=>/^(tunic|steel)$/.test(o.userData.part),[[-0.279,0.061,-0.168],[0.279,0.469,0.157]]); return {cy:(E.min.y+E.max.y)/2+0.03, z:E.max.z+0.03, x:E.max.x}; };
  const shoulderTop=(A,sd)=>{ const E=bounds(A.sh,o=>/^(paul|gold)$/.test(o.userData.part),sd>0?[[-0.096,-0.126,-0.136],[0.156,0.102,0.136]]:[[-0.157,-0.126,-0.136],[0.097,0.102,0.136]]); return {cx:(E.min.x+E.max.x)/2, top:E.max.y, rx:(E.max.x-E.min.x)/2, rz:(E.max.z-E.min.z)/2}; };
  const headTop=K=>{ const E=bounds(K.rig.head,o=>/^(helm2|gold2|helm|visor|gold)$/.test(o.userData.part),[[-0.118,-0.136,-0.13],[0.118,0.19,0.144]]); return {top:E.max.y, xr:E.max.x, zr:E.max.z, yb:E.min.y}; };

  // ── the motifs, each laid on one slot's piece ──
  const M_={};
  M_.wheat=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.torso), b=breast(K), G=K.M.goldD||K.M.gold;   // three ears of wheat, tied
    [-0.35,0,0.35].forEach(a=>{ const st=mesh(g,new THREE.CylinderGeometry(0.004,0.004,0.12,4).toNonIndexed(),G,'gold'); st.position.set(Math.sin(a)*0.03,b.cy-0.01,b.z); st.rotation.z=-a;
      for(let k=0;k<4;k++){ [-1,1].forEach(sd=>{ const gr=mesh(g,facetSphere(0.008,0.014,0.004,6,4),G,'gold'); gr.position.set(Math.sin(a)*0.03+Math.sin(-a)*(0.03+k*0.016)*-1+sd*0.008,b.cy+0.03+k*0.016,b.z+0.002); gr.rotation.z=-a-sd*0.4; }); } });
    const tie=mesh(g,new THREE.BoxGeometry(0.03,0.01,0.006).toNonIndexed(),K.M.boot,'leather'); tie.position.set(0,b.cy-0.02,b.z+0.003); };
  M_.hammers=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.torso), b=breast(K), G=K.M.goldD||K.M.gold;   // two hammers, crossed
    [-1,1].forEach(sd=>{ const hg=new THREE.Group(); hg.position.set(0,b.cy,b.z+0.002); hg.rotation.z=sd*0.7; g.add(hg); hg.userData.armor=g.userData.armor;
      mesh(hg,new THREE.BoxGeometry(0.012,0.12,0.006).toNonIndexed(),G,'gold'); const hd=mesh(hg,new THREE.BoxGeometry(0.045,0.024,0.01).toNonIndexed(),G,'gold'); hd.position.y=0.055; }); };
  M_.rivets=ctx=>{ const K=ctx.K, G=K.M.goldD||K.M.gold;   // rows of bronze rivets over the pauldrons
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=shoulderTop(A,sd), R=Math.max(e.rx,e.rz)*1.34, cy=e.top+0.03-R*0.7;
      for(let row=0;row<2;row++) for(let i=0;i<9;i++){ const ph=(sd>0?Math.PI/2:-Math.PI/2)+(i/8*2-1)*1.4, th=0.55+row*0.35, rv=mesh(g,facetSphere(0.009,0.009,0.009,6,4),G,'gold');
        rv.position.set(e.cx+sd*0.015+R*Math.sin(th)*Math.sin(ph)*1.02,cy+R*0.72*Math.cos(th)+0.004,R*0.98*Math.sin(th)*Math.cos(ph)); } }); };
  M_.shells=ctx=>{ const K=ctx.K, G=K.M.goldD||K.M.gold, sh=mat('shell',{color:0xf1e6d6,shininess:70,side:THREE.DoubleSide});   // a scallop shell fanned over each shoulder
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=shoulderTop(A,sd), R=0.13;
      const fan=surf((u,v)=>{ const a=-1.2+2.4*u, r=R*(0.25+0.75*v), rib=0.008*Math.abs(Math.sin(u*Math.PI*7)); return V(r*Math.sin(a),r*Math.cos(a)*0.25+rib+0.012*v,r*Math.cos(a)); },28,4,{two:0.003,smooth:true});
      const m=mesh(g,fan,sh,'shell'); m.position.set(e.cx+sd*0.03,e.top+0.04,0); m.rotation.set(0,sd>0?Math.PI/2:-Math.PI/2,sd*0.45); m.rotateX(-0.25);
      const hinge=mesh(g,new THREE.BoxGeometry(0.03,0.014,0.016).toNonIndexed(),G,'gold'); hinge.position.copy(m.position); }); };
  M_.scales=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.torso), b=breast(K), sm=K.M.steel;   // rows of fish-scales across the breast
    for(let r=0;r<4;r++) for(let i=-4;i<=4;i++){ const x=i*0.034+(r%2)*0.017; if(Math.abs(x)>0.15) continue; const sc=mesh(g,(()=>{ let s2=new THREE.SphereGeometry(1,8,5,0,Math.PI*2,0,Math.PI/2); s2.scale(0.019,0.022,0.006); s2.rotateX(Math.PI/2); return s2; })(),sm,'steel');
      sc.position.set(x,b.cy+0.07-r*0.03,b.z-0.012*(x*x)/0.02+0.001); sc.rotation.x=0.15; } };
  M_.leaves=ctx=>{ const K=ctx.K, lf=[mat('leaf',{color:0x4f7a34,shininess:8,side:THREE.DoubleSide}),mat('leaf2',{color:0x3b6128,shininess:8,side:THREE.DoubleSide}),mat('leaf3',{color:0x6a8f3c,shininess:8,side:THREE.DoubleSide})];   // a mantle of leaves on each shoulder
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=shoulderTop(A,sd), R=Math.max(e.rx,e.rz)*1.25, cy=e.top+0.04-R*0.8;
      for(let row=0;row<3;row++) for(let i=0;i<9;i++){ const ph=-Math.PI+i/9*Math.PI*2+row*0.3, th=0.35+row*0.32; const s2=new THREE.Shape(); s2.moveTo(0,0); s2.quadraticCurveTo(0.03,-0.04,0,-0.09); s2.quadraticCurveTo(-0.03,-0.04,0,0);
        const m=mesh(g,new THREE.ShapeGeometry(s2),lf[(i+row)%3],'leaf'); m.position.set(e.cx+R*Math.sin(th)*Math.sin(ph),cy+R*0.85*Math.cos(th),R*Math.sin(th)*Math.cos(ph)); m.lookAt(m.position.clone().multiplyScalar(2).sub(V(e.cx,cy,0))); m.rotateX(-0.9); } }); };
  M_.thorns=ctx=>{ const K=ctx.K, th=mat('thorn',{color:0x3a2a1c,shininess:10});   // thorns along each forearm
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.el); for(let i=0;i<4;i++){ const c=new THREE.ConeGeometry(0.009,0.04,4).toNonIndexed(); c.computeVertexNormals(); const m=mesh(g,c,th,'thorn'); m.position.set(sd*0.062,-0.04-i*0.04,-0.01); m.rotation.z=-sd*Math.PI/2+sd*0.5; } }); };
  M_.wrap=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.head), h=headTop(K), cl=K.M.scarf||K.M.tunic;   // the face wrapped against the sand, below the eyes
    mesh(g,band((ph,y)=>0.15+0.01*Math.sin(ph*6),-1.5,1.5,h.yb-0.02,h.yb+0.13,16,3,{zk:1.05,cz:0.0,smooth:true,two:0.004}),cl,'scarf');
    const tail=mesh(g,sweep(bez(V(0.1,h.yb+0.06,-0.08),V(0.14,h.yb,-0.15),V(0.16,h.yb-0.1,-0.17),V(0.17,h.yb-0.2,-0.16),6),0.03,0.006,4,t=>1-0.5*t),cl,'scarf'); };
  M_.crystals=ctx=>{ const K=ctx.K, cr=mat('crystal',{color:0x9fdcff,emissive:0x2a6a9a,shininess:120,specular:0xffffff,transparent:true,opacity:0.88,flatShading:true});   // crystal shards from shoulders and helm
    const shard=(g,pos,dir,h,r)=>{ const c=new THREE.OctahedronGeometry(1,0); c.scale(r,h,r); const m=mesh(g,c.toNonIndexed(),cr,'crystal'); m.geometry.computeVertexNormals(); m.position.copy(pos); m.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize()); };
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=piece(ctx,A.sh), e=shoulderTop(A,sd); [[0,0.07,0.024],[0.4,0.05,0.018],[-0.4,0.045,0.016]].forEach(([dz,h,r])=>shard(g,V(e.cx+sd*0.03,e.top+0.02,dz*0.12),V(sd*0.5,1,dz),h,r)); });
    const gh=piece(ctx,K.rig.head), h=headTop(K); [[0,0.07,0.02],[0.35,0.05,0.015],[-0.35,0.05,0.015]].forEach(([a,hh,r])=>shard(gh,V(Math.sin(a)*0.06,h.top,Math.cos(a)*0.04),V(Math.sin(a),1,0.2),hh,r)); };
  M_.horns=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.head), h=headTop(K), hm=mat('horn',{color:0x2a221c,shininess:40});   // two horns, curving forward
    [-1,1].forEach(sd=>mesh(g,sweep(bez(V(sd*h.xr*0.95,h.top-0.05,0),V(sd*(h.xr+0.08),h.top+0.0,-0.02),V(sd*(h.xr+0.1),h.top+0.1,0.03),V(sd*(h.xr+0.05),h.top+0.15,0.08),8),0.026,0.026,6,t=>1-0.85*t),hm,'horn')); };
  M_.helmWings=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.head), h=headTop(K), wm=K.M.helm, G=K.M.goldD||K.M.gold;   // wings at the temples
    [-1,1].forEach(sd=>{ for(let k=0;k<4;k++){ const s2=new THREE.Shape(); s2.moveTo(0,0); s2.quadraticCurveTo(0.04,0.02,0.1-k*0.012,0.06+k*0.02); s2.quadraticCurveTo(0.02,0.02-0.0,0,0.012);
      const m=mesh(g,ext(s2,0.006),k===0?G:wm,'wing'); m.position.set(sd*(h.xr+0.004),h.top-0.07+k*0.006,-0.02-k*0.012); m.rotation.y=sd>0?-Math.PI/2+0.25:Math.PI/2-0.25; m.rotation.z=0; if(sd<0) m.scale.x=-1; m.rotateY(sd*0.0); } }); };
  M_.bolt=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.torso), b=breast(K), G=K.M.goldD||K.M.gold;   // the lightning bolt on the breast
    const s2=new THREE.Shape(); s2.moveTo(0.02,0.07); s2.lineTo(-0.025,0.0); s2.lineTo(0.005,0.0); s2.lineTo(-0.02,-0.07); s2.lineTo(0.03,0.012); s2.lineTo(0.0,0.012); s2.closePath();
    const m=mesh(g,ext(s2,0.006),G,'gold'); m.position.set(0,b.cy,b.z); };
  M_.tatters=ctx=>{ const K=ctx.K, cl=K.M.scarf||K.M.tunic;   // ragged strips hanging from the robe's hem
    [[K._skF,0],[K._skB,Math.PI]].forEach(([par,base])=>{ if(!par) return; const g=piece(ctx,par); for(let i=0;i<9;i++){ const ph=base-1.3+2.6*i/8, r=0.26, len=0.12+0.06*((i*7)%3);
      const m=mesh(g,sweep([V(r*Math.sin(ph),-0.42,0.8*r*Math.cos(ph)),V(r*Math.sin(ph)*1.04,-0.42-len*0.5,0.8*r*Math.cos(ph)*1.04),V(r*Math.sin(ph)*1.06,-0.42-len,0.8*r*Math.cos(ph)*1.06)],0.022,0.004,4,t=>1-0.6*t),cl,'scarf'); m.userData.soft=1; } }); };
  M_.halo=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.head), h=headTop(K), hm=mat('halo',{color:0xffd86a,emissive:0x8a6a10,shininess:90});   // a thin gold ring above the helm
    const r=mesh(g,new THREE.TorusGeometry(0.11,0.008,6,28),hm,'halo'); r.position.set(0,h.top+0.07,-0.02); r.rotation.x=Math.PI/2-0.2; };
  M_.wings=ctx=>{ const K=ctx.K, g=piece(ctx,K.rig.torso), fw=[mat('feather',{color:0xf6f3ea,shininess:20,side:THREE.DoubleSide}),mat('feather2',{color:0xe4dccb,shininess:20,side:THREE.DoubleSide})], G=K.M.goldD||K.M.gold;   // great wings, folded, from the shoulder blades
    [-1,1].forEach(sd=>{ const root=V(sd*0.09,0.4,-0.17); for(let row=0;row<3;row++) for(let i=0;i<7;i++){ const t=i/6, len=0.16+row*0.1+t*0.12; let f=new THREE.SphereGeometry(1,8,5); f.scale(0.028,len/2,0.005); f.translate(0,-len/2,0);
      const m=mesh(g,f,row===0&&i===0?G:fw[(i+row)%2],'feather'); m.position.set(root.x+sd*(0.05+t*0.2),root.y+0.12-t*0.05-row*0.03,root.z-0.02-row*0.012); m.rotation.set(0.18,0,sd*(0.25+t*0.6)); m.userData.soft=1; } }); };

  // ── the ten sets ──
  const SETS=[
    {id:'hearth',town:0,name:'Hearthward',pal:{tunic:mat('h_tun',{color:0x5f7a3c,shininess:6}),scarf:mat('h_sc',{color:0x7a5a36,shininess:6,side:THREE.DoubleSide}),hood:mat('h_hd',{color:0x6a5034,shininess:6,side:THREE.DoubleSide}),paul:mat('h_pl',{color:0x7a5232,shininess:12}),steel:mat('h_st',{color:0x8a6a48,shininess:20}),helm:mat('h_hl',{color:0x8a6a48,shininess:20}),gold:mat('h_g',{color:0xc9a24a,shininess:60}),goldD:mat('h_gd',{color:0xc9a24a,shininess:60,side:THREE.DoubleSide})},
      from:{helm:'base',plume:'base',cowl:'psalmist',tabard:'base',belt:'templar',skirt:'base',pauldrons:'striker',arms:'base',gauntlets:'base',legs:'psalmist',sabatons:'psalmist'}, motif:{tabard:['wheat']}},
    {id:'ironforged',town:1,name:'Ironforged',pal:{steel:mat('i_st',{color:0x4b4f55,shininess:60,specular:0x555555}),helm:mat('i_hl',{color:0x4b4f55,shininess:60,specular:0x555555}),paul:mat('i_pl',{color:0x54585e,shininess:60,specular:0x555555}),gold:mat('i_g',{color:0xb07a3a,shininess:70}),goldD:mat('i_gd',{color:0xb07a3a,shininess:70,side:THREE.DoubleSide}),tunic:mat('i_tun',{color:0x33363b,shininess:8}),cross:mat('i_cr',{color:0xb07a3a,shininess:70})},
      from:{helm:'guardian',plume:'guardian',cowl:'templar',tabard:'templar',belt:'guardian',skirt:'guardian',pauldrons:'guardian',arms:'guardian',gauntlets:'guardian',legs:'guardian',sabatons:'guardian'}, motif:{pauldrons:['rivets'],tabard:['hammers']}},
    {id:'tidecaller',town:2,name:'Tidecaller',pal:{steel:mat('t_st',{color:0x7fa6a2,shininess:70}),helm:mat('t_hl',{color:0x7fa6a2,shininess:70}),paul:mat('t_pl',{color:0x88b0ab,shininess:70}),gold:mat('t_g',{color:0xdfe8e4,shininess:90}),goldD:mat('t_gd',{color:0xdfe8e4,shininess:90,side:THREE.DoubleSide}),tunic:mat('t_tun',{color:0x1d5c66,shininess:10}),plume:mat('t_pm',{color:0x3fb0b8,shininess:10}),plumeHi:mat('t_ph',{color:0x8de0e0,shininess:10}),cross:mat('t_cr',{color:0xdfe8e4,shininess:90})},
      from:{helm:'striker',plume:'templar',cowl:'templar',tabard:'templar',belt:'templar',skirt:'templar',pauldrons:'templar',arms:'templar',gauntlets:'templar',legs:'templar',sabatons:'templar'}, motif:{pauldrons:['shells'],tabard:['scales']}},
    {id:'thornwarden',town:3,name:'Thornwarden',pal:{tunic:mat('w_tun',{color:0x3d5a2e,shininess:6}),scarf:mat('w_sc',{color:0x2e4424,shininess:6,side:THREE.DoubleSide}),hood:mat('w_hd',{color:0x34502a,shininess:6,side:THREE.DoubleSide}),steel:mat('w_st',{color:0x6d6a55,shininess:20}),helm:mat('w_hl',{color:0x6d6a55,shininess:20}),paul:mat('w_pl',{color:0x5c4630,shininess:12}),gold:mat('w_g',{color:0x9aa05a,shininess:40}),goldD:mat('w_gd',{color:0x9aa05a,shininess:40,side:THREE.DoubleSide})},
      from:{helm:'base',plume:'base',cowl:'psalmist',tabard:'striker',belt:'striker',skirt:'striker',pauldrons:'psalmist',arms:'striker',gauntlets:'psalmist',legs:'striker',sabatons:'psalmist'}, motif:{pauldrons:['leaves'],arms:['thorns']}},
    {id:'sandstrider',town:4,name:'Sandstrider',pal:{tunic:mat('d_tun',{color:0xcfb48a,shininess:6}),scarf:mat('d_sc',{color:0xa8825a,shininess:6,side:THREE.DoubleSide}),hood:mat('d_hd',{color:0xb89466,shininess:6,side:THREE.DoubleSide}),cross:mat('d_cr',{color:0xc8803e,shininess:40}),gold:mat('d_g',{color:0xc8803e,shininess:50}),goldD:mat('d_gd',{color:0xc8803e,shininess:50,side:THREE.DoubleSide}),boot:mat('d_bt',{color:0x7a5a3a,shininess:10})},
      from:{helm:'base',plume:'base',cowl:'base',tabard:'psalmist',belt:'psalmist',skirt:'psalmist',pauldrons:'base',arms:'psalmist',gauntlets:'base',legs:'base',sabatons:'psalmist'}, motif:{helm:['wrap']}},
    {id:'crystalborn',town:5,name:'Crystalborn',pal:{steel:mat('c_st',{color:0xc4cfdc,shininess:90,specular:0x8899aa}),helm:mat('c_hl',{color:0xc4cfdc,shininess:90,specular:0x8899aa}),paul:mat('c_pl',{color:0xccd6e2,shininess:90,specular:0x8899aa}),gold:mat('c_g',{color:0x8fd0ff,emissive:0x1a3a55,shininess:100}),goldD:mat('c_gd',{color:0x8fd0ff,emissive:0x1a3a55,shininess:100,side:THREE.DoubleSide}),tunic:mat('c_tun',{color:0x5a6f9a,shininess:10}),plume:mat('c_pm',{color:0xbfe8ff,shininess:20}),plumeHi:mat('c_ph',{color:0xffffff,shininess:20}),cross:mat('c_cr',{color:0x8fd0ff,emissive:0x1a3a55})},
      from:{helm:'templar',plume:'templar',cowl:'templar',tabard:'templar',belt:'templar',skirt:'templar',pauldrons:'templar',arms:'templar',gauntlets:'templar',legs:'templar',sabatons:'templar'}, motif:{pauldrons:['crystals']}},
    {id:'emberforged',town:6,name:'Emberforged',pal:{steel:mat('e_st',{color:0x2b2826,shininess:20}),helm:mat('e_hl',{color:0x2b2826,shininess:20}),paul:mat('e_pl',{color:0x312d2a,shininess:20}),gold:mat('e_g',{color:0xff7a2a,emissive:0x802000,shininess:40}),goldD:mat('e_gd',{color:0xff7a2a,emissive:0x802000,shininess:40,side:THREE.DoubleSide}),tunic:mat('e_tun',{color:0x3a1f18,shininess:6}),plume:mat('e_pm',{color:0xff6a1a,emissive:0x401000}),plumeHi:mat('e_ph',{color:0xffc04a,emissive:0x402000}),cross:mat('e_cr',{color:0xff7a2a,emissive:0x802000})},
      from:{helm:'guardian',plume:'striker',cowl:'templar',tabard:'guardian',belt:'guardian',skirt:'guardian',pauldrons:'guardian',arms:'guardian',gauntlets:'guardian',legs:'guardian',sabatons:'guardian'}, motif:{helm:['horns']}},
    {id:'tempest',town:7,name:'Tempest',pal:{steel:mat('s_st',{color:0xd0d6de,shininess:100,specular:0x99a0aa}),helm:mat('s_hl',{color:0xd0d6de,shininess:100,specular:0x99a0aa}),paul:mat('s_pl',{color:0xd6dce4,shininess:100,specular:0x99a0aa}),gold:mat('s_g',{color:0x6a8cff,emissive:0x101840,shininess:80}),goldD:mat('s_gd',{color:0x6a8cff,emissive:0x101840,shininess:80,side:THREE.DoubleSide}),tunic:mat('s_tun',{color:0x2b3a6e,shininess:10}),cross:mat('s_cr',{color:0x9fc0ff,emissive:0x101840})},
      from:{helm:'striker',plume:'base',cowl:'striker',tabard:'templar',belt:'templar',skirt:'striker',pauldrons:'striker',arms:'striker',gauntlets:'striker',legs:'striker',sabatons:'striker'}, motif:{helm:['helmWings'],tabard:['bolt']}},
    {id:'shade',town:8,name:'Shade',pal:{tunic:mat('m_tun',{color:0x23202b,shininess:6}),scarf:mat('m_sc',{color:0x1a1820,shininess:6,side:THREE.DoubleSide}),hood:mat('m_hd',{color:0x1c1a22,shininess:6,side:THREE.DoubleSide}),eyes:0xb48cff,steel:mat('m_st',{color:0x3a3844,shininess:40}),helm:mat('m_hl',{color:0x3a3844,shininess:40}),paul:mat('m_pl',{color:0x3a3844,shininess:40}),gold:mat('m_g',{color:0xb8b6c8,shininess:70}),goldD:mat('m_gd',{color:0xb8b6c8,shininess:70,side:THREE.DoubleSide}),cross:mat('m_cr',{color:0xb8b6c8,shininess:70})},
      from:{helm:'base',plume:'base',cowl:'psalmist',tabard:'psalmist',belt:'striker',skirt:'psalmist',pauldrons:'striker',arms:'striker',gauntlets:'striker',legs:'striker',sabatons:'striker'}, motif:{skirt:['tatters']}},
    {id:'archangel',town:9,name:'Archangel',pal:{steel:mat('a_st',{color:0xe9e4d6,shininess:80,specular:0x998866}),helm:mat('a_hl',{color:0xe9e4d6,shininess:80,specular:0x998866}),paul:mat('a_pl',{color:0xefeadc,shininess:80,specular:0x998866}),gold:mat('a_g',{color:0xffcf4a,emissive:0x332200,shininess:90}),goldD:mat('a_gd',{color:0xffcf4a,emissive:0x332200,shininess:90,side:THREE.DoubleSide}),tunic:mat('a_tun',{color:0xf2efe6,shininess:10}),plume:mat('a_pm',{color:0xffffff,shininess:10}),plumeHi:mat('a_ph',{color:0xffe9a8,shininess:10}),cross:mat('a_cr',{color:0xffcf4a,emissive:0x332200})},
      from:{helm:'templar',plume:'templar',cowl:'templar',tabard:'templar',belt:'templar',skirt:'templar',pauldrons:'templar',arms:'templar',gauntlets:'templar',legs:'templar',sabatons:'templar'}, motif:{helm:['halo'],cowl:['wings']}},
  ];
  SETS.forEach(st=>{ ARMOR.SLOTS.forEach(slot=>{ const from=st.from[slot]; if(!P[slot][from]) return;
    P[slot][st.id]={name:st.name+' '+ARMOR.NAMES[slot].toLowerCase(), set:st.name, town:st.town, price:Math.round(PRICE[slot]*(0.85+0.06*st.town)/5)*5,
      build:ctx=>{ const K2=Object.create(ctx.K); K2.M=Object.assign({},ctx.K.M,st.pal); const c2=Object.assign({},ctx,{K:K2}); P[slot][from].build(c2); (st.motif[slot]||[]).forEach(m=>M_[m](c2)); }}; }); });
  // ── the shop: what's released (a set for each town whose chapel is cleansed), what's owned, buying ──
  const SG=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  ARMOR.TOWN_SETS=SETS.map(s=>({id:s.id,name:s.name,town:s.town}));
  ARMOR.released=id=>{ const st=SETS.find(s=>s.id===id); return !!st&&(SG().chapels|0)>st.town; };
  ARMOR.owned=(id,slot)=>!!(SG().armorOwned&&SG().armorOwned[id+'.'+slot]);
  ARMOR.price=(id,slot)=>P[slot]&&P[slot][id]&&P[slot][id].price||0;
  ARMOR.buy=(id,slot)=>{ const S=SG(), pr=ARMOR.price(id,slot); if(!ARMOR.released(id)||ARMOR.owned(id,slot)) return 'no'; if((S.gold|0)<pr) return 'poor';
    if(GAME.addGold) GAME.addGold(-pr); else S.gold-=pr; S.armorOwned=S.armorOwned||{}; S.armorOwned[id+'.'+slot]=1; S.armorPick=S.armorPick||{}; S.armorPick[slot]=id; if(S.armorOff) delete S.armorOff[slot];
    ARMOR.tryOn(slot,id); GAME.save&&GAME.save(); GAME.changed&&GAME.changed(); return 'ok'; };
})();
