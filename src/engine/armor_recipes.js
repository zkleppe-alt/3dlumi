// ── KLK ARMOUR RECIPES (3D) — V262 ──
// The skill-tree sets and the ten town sets, rebuilt from the kit (armor.js KIT): each piece is a kit style laid on the knight's measured
//  body, in the set's own metals and cloths (the town palettes of armor_town.js), with its motifs placed on the same measurements.
//  A slot a recipe leaves out keeps its old builder (the plumes, the pelts, the Psalmist's hood). Each set has its own silhouette:
//   Striker (fox duelist)      — fox-eared sallet, studded brigandine, bladed spaulder and forearm blades, split tassets, tall boots
//   Guardian (bear tank)       — flat-topped great helm with a cross, huge pauldrons with haute-pieces, cuirass, tassets, heavy plate
//   Psalmist (dove cleric)     — hood and circlet, ankle robe and stole, feathered mantles, mail sleeves, soft boots
//   Hearthward (Hearthvale)    — kettle hat, quilted gambeson with a wheat-sheaf, leather guards, a pleated skirt
//   Ironforged (Ironhold)      — riveted barbute, heavy dark plate in bronze, crossed hammers, a mail skirt
//   Tidecaller (Saltmere)      — finned sallet, a coat of sea-green scales, scallop-shell pauldrons
//   Thornwarden (Thornwood)    — the ranger's hood, leather jerkin, leaf mantles, thorned bracers, tall boots
//   Sandstrider (Dusthaven)    — turban and face-wrap, a long robe and sash, leather bracers, sandal-shoes
//   Crystalborn (Crystalpeak)  — pale steel bascinet crowned with crystal, crystal-shard pauldrons, tassets
//   Emberforged (Ashfield)     — horned great helm, blackened plate with ember trim, spiked pauldrons
//   Tempest (Stormgate)        — winged sallet, bright plate, the bolt on the tabard
//   Shade (Shadowmere)         — the dark hood, a tattered jerkin, dark spaulders and gloves
//   Archangel (Hellgate)       — white-and-gold plate, the great helm with a halo, great folded wings
(function(){ if(typeof ARMOR==='undefined'||!ARMOR.KIT) return; const P=ARMOR.PIECES, KIT=ARMOR.KIT, H=ARMOR.H, {V,surf,sweep,bez,facetSphere,piece,mesh}=H;
  const MATS={}, mat=(k,o)=>MATS[k]||(MATS[k]=new THREE.MeshPhongMaterial(Object.assign({shininess:30,specular:0x2a2a2a},o)));
  const ext=(sh,d)=>{ const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false}).toNonIndexed(); g.computeVertexNormals(); return g; };
  const grp=(ctx,par)=>{ const g=piece(ctx,par); g.userData.fitted=true; return g; };   // a motif's group: placed on measurements, never re-fitted
  // ── where things are, from the measured body ──
  const breast=K=>{ const TR=H.bodyRings(K,K.rig.torso,['chest','belly'],0.3,0.5,4,16,0.32); if(!TR) return {x:0,cy:0.4,z:0.1}; const [cx,cz]=TR.c(0.4); return {x:cx,cy:0.4,z:cz+TR.r(0,0.4)+0.04}; };
  const head=K=>{ const b=H.headBox(K,0.02); if(!b) return null; const c=b.getCenter(new THREE.Vector3()); return {c,xr:(b.max.x-b.min.x)/2,zr:(b.max.z-b.min.z)/2,top:b.max.y,yb:b.min.y,brow:b.min.y+0.62*(b.max.y-b.min.y)}; };
  const shoulders=(K,fn)=>[[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const S=H.shoulderShape(K,A,sd); if(S) fn(A,sd,S); });
  // ── the motifs ──
  const MO={};
  MO.foxEars=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), G=K.M.goldD||K.M.gold, ST=K.M.helm||K.M.steel;   // two tall ears, gold-edged, swept back
    [-1,1].forEach(sd=>{ const s2=new THREE.Shape(); s2.moveTo(-0.03,0); s2.lineTo(0.03,0); s2.lineTo(0.004,0.1); s2.closePath(); const m=mesh(g,ext(s2,0.008),ST,'helm'); m.position.set(h.c.x+sd*h.xr*0.62,h.top-0.025,h.c.z-0.01); m.rotation.set(-0.35,sd*0.25,-sd*0.28);
      const e=mesh(g,ext((()=>{ const s3=new THREE.Shape(); s3.moveTo(-0.018,0.005); s3.lineTo(0.018,0.005); s3.lineTo(0.003,0.075); s3.closePath(); return s3; })(),0.004),G,'gold'); e.position.copy(m.position).add(V(0,0.006,0.008)); e.rotation.copy(m.rotation); }); };
  MO.helmCross=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), G=K.M.goldD||K.M.gold, z=h.c.z+h.zr+0.012;   // a gold cross on the face
    [[0.016,0.15,0,h.brow-0.03],[0.11,0.016,0,h.brow-0.005]].forEach(([w,hh,x,y])=>{ const m=mesh(g,new THREE.BoxGeometry(w,hh,0.008).toNonIndexed(),G,'gold'); m.position.set(h.c.x+x,y,z); }); };
  MO.fin=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), G=K.M.goldD||K.M.gold;   // a fin from brow to nape, like a fish's
    const s2=new THREE.Shape(); s2.moveTo(0,0); for(let i=0;i<=6;i++){ const t=i/6; s2.lineTo(-0.22*t,0.05+0.03*Math.sin(t*Math.PI)+(i%2?0.012:0)); } s2.lineTo(-0.24,0); s2.closePath();
    const m=mesh(g,ext(s2,0.006),G,'gold'); m.position.set(h.c.x-0.003,h.top-0.015,h.c.z+h.zr*0.9); m.rotation.y=Math.PI/2; };
  MO.horns=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), hm=mat('horn',{color:0x2a221c,shininess:40});   // horns, curving up and forward
    [-1,1].forEach(sd=>mesh(g,sweep(bez(V(h.c.x+sd*h.xr*0.9,h.top-0.06,h.c.z),V(h.c.x+sd*(h.xr+0.09),h.top-0.01,h.c.z-0.02),V(h.c.x+sd*(h.xr+0.11),h.top+0.09,h.c.z+0.03),V(h.c.x+sd*(h.xr+0.05),h.top+0.15,h.c.z+0.08),8),0.026,0.026,6,t=>1-0.85*t),hm,'horn')); };
  MO.helmWings=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), wm=K.M.helm||K.M.steel, G=K.M.goldD||K.M.gold;   // wings at the temples
    [-1,1].forEach(sd=>{ for(let k=0;k<4;k++){ const s2=new THREE.Shape(); s2.moveTo(0,0); s2.quadraticCurveTo(0.04,0.02,0.11-k*0.014,0.07+k*0.022); s2.quadraticCurveTo(0.02,0.022,0,0.012);
      const m=mesh(g,ext(s2,0.006),k===0?G:wm,'wing'); m.position.set(h.c.x+sd*(h.xr+0.004),h.brow+0.01+k*0.006,h.c.z-0.02-k*0.012); m.rotation.y=sd>0?-Math.PI/2+0.25:Math.PI/2-0.25; if(sd<0) m.scale.x=-1; } }); };
  MO.halo=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), hm=mat('halo',{color:0xffd86a,emissive:0x8a6a10,shininess:90});
    const r=mesh(g,new THREE.TorusGeometry(Math.max(h.xr,h.zr)*1.15,0.008,6,28),hm,'halo'); r.position.set(h.c.x,h.top+0.07,h.c.z-0.03); r.rotation.x=Math.PI/2-0.25; };
  MO.crown=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), cr=mat('crystal',{color:0x9fdcff,emissive:0x2a6a9a,shininess:120,specular:0xffffff,transparent:true,opacity:0.88,flatShading:true});   // a crown of crystal shards round the helm
    for(let i=0;i<7;i++){ const a=-1.2+2.4*i/6, hh=i===3?0.09:0.05+0.015*(i%2), c=new THREE.OctahedronGeometry(1,0); c.scale(0.016,hh,0.016); const m=mesh(g,c.toNonIndexed(),cr,'crystal'); m.geometry.computeVertexNormals();
      m.position.set(h.c.x+Math.sin(a)*h.xr*0.95,h.brow+0.05+hh*0.4,h.c.z+Math.cos(a)*h.zr*0.95); m.rotation.z=-Math.sin(a)*0.3; } };
  MO.shards=ctx=>{ const K=ctx.K, cr=mat('crystal',{color:0x9fdcff,emissive:0x2a6a9a,shininess:120,specular:0xffffff,transparent:true,opacity:0.88,flatShading:true});   // shards rising from the pauldrons
    shoulders(K,(A,sd,S)=>{ const g=grp(ctx,A.sh); [[0.3,0,0.08,0.022],[0.6,0.6,0.06,0.017],[0.6,-0.6,0.055,0.016]].forEach(([el,da,hh,r])=>{ const p0=S.at(el,S.outAz+da,0.045), n=p0.clone().sub(S.c).normalize(), c=new THREE.OctahedronGeometry(1,0); c.scale(r,hh,r);
      const m=mesh(g,c.toNonIndexed(),cr,'crystal'); m.geometry.computeVertexNormals(); m.position.copy(p0).addScaledVector(n,hh*0.4); m.quaternion.setFromUnitVectors(V(0,1,0),n.clone().add(V(0,0.8,0)).normalize()); }); }); };
  MO.shells=ctx=>{ const K=ctx.K, sh=mat('shell',{color:0xf1e6d6,shininess:70,side:THREE.DoubleSide}), G=K.M.goldD||K.M.gold;   // a scallop shell fanned over each shoulder
    shoulders(K,(A,sd,S)=>{ const g=grp(ctx,A.sh), R=S.R2(0.2,S.outAz)+0.07; const fan=surf((u,v)=>{ const a=-1.25+2.5*u, r=R*(0.2+0.8*v), rib=0.009*Math.abs(Math.sin(u*Math.PI*7)); return V(r*Math.sin(a),r*Math.cos(a)*0.32+rib+0.014*v,r*Math.cos(a)); },28,4,{two:0.003,smooth:true});
      const m=mesh(g,fan,sh,'shell'); m.position.copy(S.at(0.0,0,0.045)); m.position.y-=0.01; m.rotation.set(0,S.outAz,0); m.rotateX(0.45); m.scale.setScalar(0.8);   /* hinged at the inner shoulder, fanned out and down over the top */ const hg=mesh(g,new THREE.BoxGeometry(0.03,0.014,0.016).toNonIndexed(),G,'gold'); hg.position.copy(m.position); }); };
  MO.leaves=ctx=>{ const K=ctx.K, lf=[mat('leaf',{color:0x4f7a34,shininess:8,side:THREE.DoubleSide}),mat('leaf2',{color:0x3b6128,shininess:8,side:THREE.DoubleSide}),mat('leaf3',{color:0x6a8f3c,shininess:8,side:THREE.DoubleSide})];   // a mantle of leaves on each shoulder
    shoulders(K,(A,sd,S)=>{ const g=grp(ctx,A.sh); for(let row=0;row<3;row++) for(let i=0;i<11;i++){ const az=-Math.PI+i/11*Math.PI*2+row*0.3, el=0.3+row*0.33; if(Math.cos(az-S.outAz)<-0.4&&row>0) continue;
      const s2=new THREE.Shape(); s2.moveTo(0,0); s2.quadraticCurveTo(0.03,-0.04,0,-0.09); s2.quadraticCurveTo(-0.03,-0.04,0,0); const p0=S.at(el,az,0.03+row*0.006), n=p0.clone().sub(S.c).normalize();
      const m=mesh(g,new THREE.ShapeGeometry(s2),lf[(i+row)%3],'leaf'); m.position.copy(p0); m.lookAt(p0.clone().add(n)); m.rotateX(-0.9); } }); };
  MO.armBlades=ctx=>{ const K=ctx.K, ST=K.M.steel, G=K.M.goldD||K.M.gold;   // three blades swept back along the outside of each forearm
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=grp(ctx,A.el), F=H.armSeg(K,A.el,['forearm'],g,0.03,0.02); if(!F) return; for(let k=0;k<3;k++){ const y=F.y0+0.03+k*(F.y1-F.y0-0.06)/2, p0=F.at(sd*Math.PI/2,y,0.016);
      const s2=new THREE.Shape(); s2.moveTo(0,0); s2.lineTo(0.012,0); s2.lineTo(0.004,0.07-k*0.01); s2.closePath(); const m=mesh(F.f,ext(s2,0.004),k===1?G:ST,'steel'); m.position.copy(p0); m.rotation.set(0,sd>0?Math.PI/2:-Math.PI/2,sd*0.35); } }); };
  MO.thorns=ctx=>{ const K=ctx.K, th=mat('thorn',{color:0x3a2a1c,shininess:10});   // thorns along each forearm
    [[K.rig.AL,1],[K.rig.AR,-1]].forEach(([A,sd])=>{ const g=grp(ctx,A.el), F=H.armSeg(K,A.el,['forearm'],g,0.03,0.02); if(!F) return; for(let k=0;k<5;k++){ const y=F.y0+0.02+k*(F.y1-F.y0-0.04)/4, ph=sd*Math.PI/2+(k%2?0.4:-0.4), p0=F.at(ph,y,0.012);
      const c=new THREE.ConeGeometry(0.008,0.035,4).toNonIndexed(); c.computeVertexNormals(); const m=mesh(F.f,c,th,'thorn'); m.position.copy(p0); m.quaternion.setFromUnitVectors(V(0,1,0),V(Math.sin(ph),0.5,Math.cos(ph)).normalize()); } }); };
  const emblem=(fn)=>ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), b=breast(K), G=K.M.goldD||K.M.gold; fn(g,b,G,K); };
  MO.wheat=emblem((g,b,G,K)=>{ [-0.35,0,0.35].forEach(a=>{ const st=mesh(g,new THREE.CylinderGeometry(0.004,0.004,0.12,4).toNonIndexed(),G,'gold'); st.position.set(b.x+Math.sin(a)*0.03,b.cy-0.01,b.z); st.rotation.z=-a;
      for(let k=0;k<4;k++) [-1,1].forEach(sd=>{ const gr=mesh(g,facetSphere(0.008,0.014,0.004,6,4),G,'gold'); gr.position.set(b.x+Math.sin(a)*(0.06+k*0.016)+sd*0.008,b.cy+0.03+k*0.016,b.z+0.002); gr.rotation.z=-a-sd*0.4; }); }); });
  MO.hammers=emblem((g,b,G)=>{ [-1,1].forEach(sd=>{ const hg=new THREE.Group(); hg.position.set(b.x,b.cy,b.z); hg.rotation.z=sd*0.7; g.add(hg); hg.userData.armor=g.userData.armor;
      mesh(hg,new THREE.BoxGeometry(0.012,0.12,0.006).toNonIndexed(),G,'gold'); const hd=mesh(hg,new THREE.BoxGeometry(0.045,0.024,0.01).toNonIndexed(),G,'gold'); hd.position.y=0.055; }); });
  MO.bolt=emblem((g,b,G)=>{ const s2=new THREE.Shape(); s2.moveTo(0.02,0.07); s2.lineTo(-0.025,0.0); s2.lineTo(0.005,0.0); s2.lineTo(-0.02,-0.07); s2.lineTo(0.03,0.012); s2.lineTo(0.0,0.012); s2.closePath(); const m=mesh(g,ext(s2,0.006),G,'gold'); m.position.set(b.x,b.cy,b.z); });
  MO.wings=ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), fw=[mat('feather',{color:0xf6f3ea,shininess:20,side:THREE.DoubleSide}),mat('feather2',{color:0xe4dccb,shininess:20,side:THREE.DoubleSide})], G=K.M.goldD||K.M.gold;   // great wings, folded, from the shoulder blades
    const TR=H.bodyRings(K,K.rig.torso,['chest'],0.4,0.5,2,16,0.32), bz=TR?TR.c(0.45)[1]-TR.r(Math.PI,0.45)-0.04:-0.2;
    [-1,1].forEach(sd=>{ const root=V(sd*0.09,0.47,bz); for(let row=0;row<3;row++) for(let i=0;i<7;i++){ const t=i/6, len=0.16+row*0.1+t*0.12; let f=new THREE.SphereGeometry(1,8,5); f.scale(0.028,len/2,0.005); f.translate(0,-len/2,0);
      const m=mesh(g,f,row===0&&i===0?G:fw[(i+row)%2],'feather'); m.position.set(root.x+sd*(0.05+t*0.2),root.y+0.12-t*0.05-row*0.03,root.z-0.02-row*0.012); m.rotation.set(0.18,0,sd*(0.25+t*0.6)); m.userData.soft=1; } }); };
  MO.tatters=ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), cl=K.M.scarf||K.M.tunic, TR=H.bodyRings(K,K.rig.torso,['pelvis','thigh'],-0.1,0.05,3,16,0.32); if(!TR) return;   // ragged strips hanging from the coat's hem
    for(let i=0;i<14;i++){ const ph=-Math.PI+i/14*Math.PI*2, [cx,cz]=TR.c(0.0), r=TR.r(ph,0.0)+0.03, len=0.1+0.06*((i*7)%3), y0=0.02;
      const m=mesh(g,sweep([V(cx+r*Math.sin(ph),y0,cz+r*Math.cos(ph)),V(cx+r*1.04*Math.sin(ph),y0-len*0.5,cz+r*1.04*Math.cos(ph)),V(cx+r*1.06*Math.sin(ph),y0-len,cz+r*1.06*Math.cos(ph))],0.022,0.004,4,t=>1-0.6*t),cl,'scarf'); m.userData.soft=1; m.userData.clothPin=0.03; } };
  MO.sash=ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), cl=K.M.scarf||K.M.tunic, TR=H.bodyRings(K,K.rig.torso,['belly','pelvis'],0.02,0.14,3,24,0.32); if(!TR) return;   // a broad sash, knotted at the side, its ends falling
    mesh(g,surf((u,v)=>{ const ph=-Math.PI+u*Math.PI*2, y=0.04+0.07*v, [cx,cz]=TR.c(y), r=TR.r(ph,y)+0.045; return V(cx+r*Math.sin(ph),y,cz+r*Math.cos(ph)); },36,2,{smooth:true,two:0.004}),cl,'scarf');
    [0,1].forEach(k=>{ const [cx,cz]=TR.c(0.06), ph=0.9, r=TR.r(ph,0.06)+0.05, m=mesh(g,sweep(bez(V(cx+r*Math.sin(ph),0.06,cz+r*Math.cos(ph)),V(cx+(r+0.02)*Math.sin(ph+0.1*k),-0.02,cz+(r+0.02)*Math.cos(ph)),V(cx+(r+0.03)*Math.sin(ph+0.15*k),-0.12,cz+r*Math.cos(ph)),V(cx+(r+0.03)*Math.sin(ph+0.2*k),-0.2-0.04*k,cz+r*Math.cos(ph)),6),0.03,0.005,4,t=>1-0.3*t),cl,'scarf'); m.userData.soft=1; m.userData.clothPin=0.05; }); };

  // ── V263: motifs for the earned sets and the liveries ──
  const cape=(o)=>ctx=>{ const K=ctx.K; H.mantle(ctx,Object.assign({},o,{mat:typeof o.mat==='function'?o.mat(K):o.mat||K.M.cape||K.M.tunic,trim:typeof o.trim==='function'?o.trim(K):o.trim===true?(K.M.goldD||K.M.gold):o.trim})); };
  MO.breastCross=emblem((g,b,G)=>{ [[0.03,0.2,0,0],[0.15,0.03,0,0.04]].forEach(([w,hh,x,y])=>{ const m=mesh(g,new THREE.BoxGeometry(w,hh,0.012).toNonIndexed(),G,'gold'); m.position.set(b.x+x,b.cy-0.02+y,b.z-0.02); }); });
  MO.sunburst=emblem((g,b,G)=>{ const c=mesh(g,new THREE.CylinderGeometry(0.03,0.03,0.008,16).toNonIndexed(),G,'gold'); c.rotation.x=Math.PI/2; c.position.set(b.x,b.cy,b.z-0.01);
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, s2=new THREE.Shape(); s2.moveTo(-0.008,0); s2.lineTo(0.008,0); s2.lineTo(0,i%2?0.045:0.07); s2.closePath(); const r=mesh(g,ext(s2,0.004),G,'gold'); r.position.set(b.x+Math.sin(a)*0.032,b.cy+Math.cos(a)*0.032,b.z-0.012); r.rotation.z=-a; } });
  MO.crossPendant=emblem((g,b,G)=>{ const ch=mesh(g,new THREE.TorusGeometry(0.075,0.003,4,24,Math.PI).toNonIndexed(),G,'gold'); ch.position.set(b.x,b.cy+0.13,b.z-0.03); ch.rotation.z=Math.PI; ch.rotation.x=-0.5;
    [[0.012,0.07,0,0],[0.045,0.012,0,0.012]].forEach(([w,hh,x,y])=>{ const m=mesh(g,new THREE.BoxGeometry(w,hh,0.008).toNonIndexed(),G,'gold'); m.position.set(b.x+x,b.cy+0.03+y,b.z-0.005); }); });
  MO.bevor=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), ST=K.M.helm||K.M.steel, G=K.M.goldD||K.M.gold;   // a plate over the mouth and chin, to the sight
    mesh(g,surf((u,v)=>{ const ph=-1.25+2.5*u, y=h.yb+0.01+(h.brow-0.035-h.yb-0.01)*v, k=1.1+0.04*Math.cos(ph*1.5); return V(h.c.x+h.xr*k*Math.sin(ph),y,h.c.z+h.zr*k*Math.cos(ph)+0.012*Math.max(0,Math.cos(ph))); },16,4,{smooth:true,two:0.004}),ST,'helm');
    mesh(g,surf((u,v)=>{ const ph=-1.25+2.5*u; return V(h.c.x+h.xr*1.15*Math.sin(ph),h.brow-0.04+0.008*v,h.c.z+h.zr*1.15*Math.cos(ph)+0.012); },16,1,{two:0.002}),G,'gold'); };
  MO.foxCollar=ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), F1=mat('foxR',{color:0xc4652a,shininess:4,side:THREE.DoubleSide}), F2=mat('foxW',{color:0xf2eee6,shininess:4,side:THREE.DoubleSide}), NR=H.bodyRings(K,K.rig.torso,['head'],0.6,0.68,2,16,0.16); if(!NR) return;   // a fox-fur collar, white at its edge
    const [nx,nz]=NR.c(0.63); for(let i=0;i<26;i++){ const ph=-Math.PI+i/26*Math.PI*2, r=NR.r(ph,0.63)+0.05, f=new THREE.SphereGeometry(1,7,5); f.scale(0.035,0.03,0.02); const m=mesh(g,f,i%3?F1:F2,'fur'); m.position.set(nx+r*Math.sin(ph),0.585+0.012*(i%2),nz+r*Math.cos(ph)); m.rotation.y=ph; } };
  MO.leadBlades=ctx=>{ const K=ctx.K, ST=K.M.steel, G=K.M.goldD||K.M.gold;   // the leading shoulder fanned with three swept blades
    shoulders(K,(A,sd,S)=>{ if(sd<0) return; const g=grp(ctx,A.sh); for(let k=0;k<3;k++){ const el=0.35+k*0.28, p0=S.at(el,S.outAz,0.04), n=p0.clone().sub(S.c).normalize(), s2=new THREE.Shape(); s2.moveTo(0,0); s2.lineTo(0.03,0); s2.quadraticCurveTo(0.02,0.07,-0.04,0.15-k*0.02); s2.closePath();
      const m=mesh(g,ext(s2,0.005),k===0?G:ST,'steel'); m.position.copy(p0); m.lookAt(p0.clone().add(n)); m.rotateY(Math.PI/2); m.rotateZ(-0.9); } }); };
  MO.redVisor=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), R2=new THREE.MeshBasicMaterial({color:0xff2030});   // eyes burning red behind the slit
    [-1,1].forEach(sd=>{ const m=mesh(g,new THREE.SphereGeometry(0.008,8,6),R2,'eye'); m.position.set(h.c.x+sd*0.025,h.brow-0.015,h.c.z+h.zr+0.005); }); };
  MO.batWings=ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), W=mat('bat',{color:0x1c141c,shininess:20,side:THREE.DoubleSide}), B=mat('batB',{color:0x0c080c,shininess:30}), TR=H.bodyRings(K,K.rig.torso,['chest'],0.4,0.5,2,16,0.32), bz=TR?TR.c(0.45)[1]-TR.r(Math.PI,0.45)-0.05:-0.2;
    [-1,1].forEach(sd=>{ const root=V(sd*0.08,0.48,bz), tips=[V(sd*0.42,0.62,bz-0.12),V(sd*0.5,0.4,bz-0.14),V(sd*0.42,0.18,bz-0.12),V(sd*0.26,0.06,bz-0.08)];
      const s2=new THREE.Shape(); s2.moveTo(0,0); tips.forEach((t,i)=>{ const p=t.clone().sub(root); if(i===0) s2.lineTo(p.x*sd,p.y); else { const q=tips[i-1].clone().sub(root); s2.quadraticCurveTo((q.x*sd+p.x*sd)/2*0.8,(q.y+p.y)/2*0.85,p.x*sd,p.y); } }); s2.lineTo(0,-0.02); s2.closePath();
      const m=mesh(g,new THREE.ShapeGeometry(s2),W,'wing'); m.position.copy(root); m.scale.x=sd; m.rotation.y=sd*0.35; m.userData.soft=1;
      tips.forEach(t=>{ const b2=mesh(g,sweep([root.clone(),t.clone()],0.006,0.006,4,u=>1-0.6*u),B,'wing'); }); }); };
  const crestOn=(build)=>ctx=>{ const K=ctx.K, h=head(K); if(!h) return; build(grp(ctx,K.rig.head),h,K); };
  MO.sunCrest=crestOn((g,h,K)=>{ const G=mat('sun',{color:0xffd86a,emissive:0x6a4a08,shininess:90});   // rays of the sun behind the helm
    for(let i=0;i<11;i++){ const a=-1.35+2.7*i/10, s2=new THREE.Shape(); s2.moveTo(-0.012,0); s2.lineTo(0.012,0); s2.lineTo(0,i%2?0.08:0.13); s2.closePath(); const m=mesh(g,ext(s2,0.004),G,'gold'); m.position.set(h.c.x+Math.sin(a)*(h.xr+0.01),h.c.y+Math.cos(a)*(h.top-h.c.y),h.c.z-h.zr*0.6); m.rotation.z=-a; } });
  MO.stormCrest=crestOn((g,h,K)=>{ const G=mat('storm',{color:0x9ad8ff,emissive:0x1a4a80,shininess:90}); const s2=new THREE.Shape(); s2.moveTo(0,0); s2.lineTo(0.04,0.1); s2.lineTo(0.01,0.09); s2.lineTo(0.05,0.2); s2.lineTo(-0.03,0.07); s2.lineTo(0.0,0.08); s2.lineTo(-0.04,0); s2.closePath();   // a crest like a bolt
    const m=mesh(g,ext(s2,0.008),G,'gold'); m.position.set(h.c.x-0.004,h.top-0.02,h.c.z); m.rotation.y=Math.PI/2; });
  MO.jagCrown=crestOn((g,h,K)=>{ const R=mat('ember',{color:0xb02734,emissive:0x400008,shininess:40}); for(let i=0;i<7;i++){ const a=-1.2+2.4*i/6, c=new THREE.ConeGeometry(0.012,i===3?0.11:0.05+0.03*(i%2),4).toNonIndexed(); c.computeVertexNormals(); const m=mesh(g,c,R,'crest'); m.position.set(h.c.x+Math.sin(a)*h.xr*0.9,h.top-0.005,h.c.z+Math.cos(a)*h.zr*0.6); m.rotation.z=-Math.sin(a)*0.35; } });
  MO.bigPlume=crestOn((g,h,K)=>{ const pm=[mat('chP',{color:0xffffff,shininess:5}),mat('chP2',{color:0xd8a828,shininess:5})];   // the tourney plume, tall and full
    for(let i=0;i<14;i++){ const s=(i/13)*2-1, pts=bez(V(h.c.x+s*0.02,h.top,h.c.z),V(h.c.x+s*0.05,h.top+0.2,h.c.z-0.05),V(h.c.x+s*0.08,h.top+0.18,h.c.z-0.22),V(h.c.x+s*0.1,h.top-0.02,h.c.z-0.32),10); mesh(g,sweep(pts,0.024,0.012,6,t=>Math.pow(1-t,0.5)*0.9+0.1),pm[i%4===0?1:0],'hair'); } });
  MO.redFeather=crestOn((g,h,K)=>{ const R=mat('feathR',{color:0xc0392e,shininess:10}); mesh(g,sweep(bez(V(h.c.x+h.xr*0.9,h.brow+0.04,h.c.z-0.02),V(h.c.x+h.xr*1.1,h.top+0.08,h.c.z-0.06),V(h.c.x+h.xr*1.0,h.top+0.14,h.c.z-0.16),V(h.c.x+h.xr*0.8,h.top+0.12,h.c.z-0.24),8),0.02,0.004,5,t=>Math.sin(Math.min(1,t*1.4)*Math.PI*0.5+0.2)),R,'hair'); });
  MO.pearls=ctx=>{ const K=ctx.K, h=head(K); if(!h) return; const g=grp(ctx,K.rig.head), PR=mat('pearl',{color:0xf4f0e8,shininess:120,specular:0xffffff});   // a string of pearls round the brow
    for(let i=0;i<18;i++){ const a=-Math.PI+i/18*Math.PI*2, m=mesh(g,new THREE.SphereGeometry(0.009,8,6),PR,'pearl'); m.position.set(h.c.x+Math.sin(a)*(h.xr+0.005),h.brow-0.03,h.c.z+Math.cos(a)*(h.zr+0.005)); } };
  MO.belt=ctx=>{ const K=ctx.K, g=grp(ctx,K.rig.torso), G=K.M.goldD||K.M.gold, TR=H.bodyRings(K,K.rig.torso,['belly','pelvis'],0.04,0.12,3,24,0.32); if(!TR) return;   // the belt of truth: gold plaques round the waist
    for(let i=0;i<14;i++){ const ph=-Math.PI+i/14*Math.PI*2, [cx,cz]=TR.c(0.08), r=TR.r(ph,0.08)+0.05, m=mesh(g,new THREE.BoxGeometry(0.04,0.035,0.008).toNonIndexed(),G,'gold'); m.position.set(cx+r*Math.sin(ph),0.08,cz+r*Math.cos(ph)); m.rotation.y=ph; } };
  MO.smoke=ctx=>{};   // (the beast's smoke stays the old knight's)
  // ── the recipes: slot → [kit, style, options, motifs]; options may name palette keys ('$steel' → the set's steel) ──
  const LE=c=>H.leatherM({M:{}},c);
  KIT.hood=(ctx,tint)=>{ if(typeof OUTFIT3==='undefined'||!OUTFIT3.baseReady||!OUTFIT3.baseReady(ctx.K)) return false; const g=piece(ctx,ctx.K.rig.torso); g.userData.garmentSlot='cowl'; g.userData.hoodTint=tint; g.userData.fitted=true; if(H.shroud&&ctx.K._shroud!==false) H.shroud(ctx,tint); return true; };   // the artist's hood, dyed
  const R={
    striker:{helm:['helm','sallet',{},['foxEars','bevor']],tabard:['torso','brigandine',{},['foxCollar',cape({kind:'side',side:-1,hem:-0.2,top:0.6,mat:()=>mat('foxCape',{color:0xb85a26,shininess:4,side:THREE.DoubleSide}),trim:()=>mat('foxW',{color:0xf2eee6,shininess:4,side:THREE.DoubleSide}),rag:0.03})]],skirt:['skirt','tassets',{lames:2}],pauldrons:['shoulder','spaulder',{},['leadBlades']],arms:['arm','vambraces',{},['armBlades']],gauntlets:['hand','gloves',{}],legs:['leg','greaves',{}],sabatons:['foot','tall',{}]},
    guardian:{helm:['great','great',{flat:true},['helmCross']],tabard:['torso','cuirass',{},['breastCross']],skirt:['skirt','tassets',{lames:4}],pauldrons:['shoulder','heavy',{bulk:0.05}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    psalmist:{cowl:['none',null,{},[cape({kind:'shroud',mat:()=>mat('psShroud',{color:0xf1ece0,shininess:6,side:THREE.DoubleSide}),trim:true,hem:-0.6,top:0.6,rag:0})]],tabard:['torso','robe',{},['crossPendant']],pauldrons:['shoulder','feather',{}],arms:['arm','mail',{}],gauntlets:['hand','gloves',{}],legs:['leg','greaves',{}],sabatons:['foot','ankle',{}],skirt:null},
    hearth:{helm:['helm','kettle',{}],tabard:['torso','gambeson',{cloth:LE(0xc7b48c)}],skirt:['skirt','kilt',{}],pauldrons:['shoulder','leather',{}],arms:['arm','bracers',{}],gauntlets:['hand','gloves',{}],legs:null,sabatons:['foot','ankle',{}],motif:{tabard:['wheat']}},
    ironforged:{helm:['helm','barbute',{rivets:true}],tabard:['torso','cuirass',{}],skirt:['skirt','mail',{}],pauldrons:['shoulder','heavy',{bulk:0.045}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}],motif:{tabard:['hammers']}},
    tidecaller:{cowl:null,helm:['helm','sallet',{},['fin']],tabard:['torso','scale',{cloth:'$tunic',scale:'$steel'}],skirt:null,pauldrons:['shoulder','spaulder',{},['shells']],arms:['arm','vambraces',{}],gauntlets:['hand','gloves',{}],legs:['leg','greaves',{}],sabatons:['foot','tall',{}]},
    thornwarden:{cowl:['hood','moss'],helm:null,tabard:['torso','jerkin',{cloth:'$tunic'}],skirt:['skirt','kilt',{}],pauldrons:['shoulder','leather',{},['leaves']],arms:['arm','bracers',{},['thorns']],gauntlets:['hand','gloves',{}],legs:null,sabatons:['foot','tall',{}]},
    sandstrider:{helm:['helm','turban',{}],tabard:['torso','robe',{cloth:'$tunic',stole:'$scarf'}],skirt:null,pauldrons:null,arms:['arm','bracers',{}],gauntlets:['hand','wraps',{}],legs:null,sabatons:['foot','shoes',{}],motif:{belt:['sash']}},
    crystalborn:{helm:['helm','bascinet',{},['crown']],tabard:['torso','templar',{}],skirt:['skirt','tassets',{}],pauldrons:['shoulder','round',{},['shards']],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    emberforged:{helm:['great','great',{},['horns']],tabard:['torso','cuirass',{}],skirt:['skirt','tassets',{}],pauldrons:['shoulder','spiked',{bulk:0.045}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    tempest:{helm:['helm','sallet',{},['helmWings']],tabard:['torso','templar',{}],skirt:['skirt','tassets',{lames:3}],pauldrons:['shoulder','round',{}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}],motif:{tabard:['bolt']}},
    shade:{cowl:['hood','ash'],helm:null,tabard:['torso','jerkin',{cloth:'$tunic'}],skirt:null,pauldrons:['shoulder','spaulder',{}],arms:['arm','bracers',{}],gauntlets:['hand','gloves',{}],legs:['leg','greaves',{}],sabatons:['foot','tall',{}],motif:{tabard:['tatters']}},
    archangel:{helm:['great','great',{},['halo']],tabard:['torso','templar',{}],skirt:['skirt','tassets',{}],pauldrons:['shoulder','heavy',{bulk:0.045}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}],motif:{cowl:['wings']}},
  };
  KIT.none=()=>true;
  // ── V263: THE EARNED LIVERIES as sets: put on with the livery at the wardrobe glass (armor.js liverySync), each piece yours once the
  //  livery is (liveryOwned). Their colours are the livery's own (it recolours the knight's materials); their shapes are their own. ──
  const LVM=(k,c,o)=>mat('lv_'+k,Object.assign({color:c,shininess:40},o||{}));
  Object.assign(R,{
    lv_gilt:{plume:['none',null],helm:['great','great',{},['sunCrest']],tabard:['torso','templar',{},['sunburst',cape({kind:'half',hem:0.0,mat:()=>LVM('giltCape',0xd8b050,{side:THREE.DoubleSide}),trim:true})]],skirt:['skirt','tassets',{}],pauldrons:['shoulder','round',{}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    lv_stormward:{plume:['none',null],helm:['helm','sallet',{},['stormCrest','bevor']],tabard:['torso','cuirass',{},[cape({kind:'cape',hem:-0.3,mat:()=>LVM('stormCape',0x2c4a6e,{side:THREE.DoubleSide}),trim:()=>LVM('stormTrim',0x7fd0ff,{emissive:0x10406a})})]],skirt:['skirt','tassets',{lames:3}],pauldrons:['shoulder','heavy',{bulk:0.045}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}],motif:{tabard:['bolt']}},
    lv_fallen:{plume:['none',null],helm:['helm','barbute',{},['jagCrown','redVisor']],tabard:['torso','cuirass',{},[cape({kind:'cape',hem:-0.4,rag:0.05,mat:()=>LVM('fallenCape',0x1e1620,{side:THREE.DoubleSide}),trim:()=>LVM('fallenTrim',0xb02734)})]],skirt:['skirt','tassets',{}],pauldrons:['shoulder','spiked',{bulk:0.04}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    lv_robby:{plume:['none',null],helm:['great','great',{flat:true},['horns','redVisor']],tabard:['torso','cuirass',{},['batWings']],skirt:['skirt','mail',{}],pauldrons:['shoulder','spiked',{bulk:0.05}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    lv_champion:{plume:['none',null],helm:['great','great',{},['bigPlume']],tabard:['torso','templar',{},[cape({kind:'cape',hem:-0.45,mat:()=>LVM('chCape',0xf3f5fa,{side:THREE.DoubleSide}),trim:true})]],skirt:['skirt','tassets',{}],pauldrons:['shoulder','heavy',{bulk:0.04}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}]},
    lv_ranger:{plume:['none',null],cowl:['hood','brown',{}],helm:null,tabard:['torso','brigandine',{}],skirt:['skirt','kilt',{}],pauldrons:['shoulder','leather',{},['leaves']],arms:['arm','bracers',{}],gauntlets:['hand','gloves',{}],legs:['leg','greaves',{}],sabatons:['foot','tall',{}],motif:{cowl:['redFeather']}},
    lv_glory:{plume:['none',null],helm:['great','great',{},['halo']],tabard:['torso','cuirass',{},['sunburst','belt',cape({kind:'cape',hem:-0.45,mat:()=>LVM('aogCape',0xf7f9fd,{side:THREE.DoubleSide}),trim:true})]],skirt:['skirt','tassets',{}],pauldrons:['shoulder','heavy',{bulk:0.045}],arms:['arm','plate',{}],gauntlets:['hand','gauntlet',{}],legs:['leg','plate',{}],sabatons:['foot','sabaton',{}],motif:{cowl:['wings']}},
    lv_deepwater:{plume:['none',null],helm:['helm','sallet',{},['fin','pearls']],tabard:['torso','scale',{cloth:'$tunic',scale:'$helm'},[cape({kind:'cape',hem:-0.4,mat:()=>LVM('dwCape',0x1c6464,{side:THREE.DoubleSide}),trim:()=>LVM('pearlT',0xf4f0e8,{shininess:120})})]],skirt:['skirt','mail',{}],pauldrons:['shoulder','round',{},['shells']],arms:['arm','vambraces',{}],gauntlets:['hand','gloves',{}],legs:['leg','greaves',{}],sabatons:['foot','tall',{}]},
  });
  const LVN={lv_gilt:'Sunfall Gilt',lv_stormward:'Stormward',lv_fallen:'Fallen',lv_robby:"Robby's Demise",lv_champion:"Champion's",lv_ranger:"Ranger's Watch",lv_glory:'Armour of God',lv_deepwater:'Deepwater'};
  Object.keys(LVN).forEach(id=>ARMOR.SLOTS.forEach(slot=>{ if(!P[slot][id]&&(R[id][slot]!==undefined||(R[id].motif&&R[id].motif[slot]))) P[slot][id]={name:LVN[id]+' '+ARMOR.NAMES[slot].toLowerCase(),set:LVN[id],livery:id.slice(3),build:ctx=>P[slot].templar.build(ctx)}; }));
  const PAL={striker:null,guardian:null,psalmist:null}; Object.assign(PAL,ARMOR.TOWN_PAL||{});
  Object.keys(R).forEach(id=>{ const rc=R[id], pal=PAL[id];
    ARMOR.SLOTS.forEach(slot=>{ const old=P[slot][id]; if(!old) return; const r=rc[slot], extra=(rc.motif&&rc.motif[slot])||[]; if(r===undefined&&!extra.length) return;
      const b0=old.build; old.build=ctx=>{ const K2=pal?Object.create(ctx.K):ctx.K; if(pal) K2.M=Object.assign({},ctx.K.M,pal); const c2=pal?Object.assign({},ctx,{K:K2}):ctx;
        if(r===null){ if(slot!=='cowl'&&slot!=='skirt'&&P[slot].base) P[slot].base.build(c2); }   /* the slot left plain in this set: the plain clothes (or nothing, for a hood or skirt) */
        else if(r){ const o={}; Object.entries(r[2]||{}).forEach(([k,v])=>{ o[k]=typeof v==='string'&&v[0]==='$'?K2.M[v.slice(1)]:v; }); let ok=false; try{ ok=ctx.K._armFit!==false&&KIT[r[0]](c2,r[1],o); }catch(e){ console.warn('armour recipe',id,slot,e); ok=false; }
          if(!ok){ c2.groups.splice(0); b0(c2); } (r[3]||[]).forEach(m=>{ try{ (typeof m==='function'?m:MO[m])(c2); }catch(e){ console.warn('motif',m,e); } }); }
        else b0(c2);
        extra.forEach(m=>{ try{ MO[m](c2); }catch(e){ console.warn('motif',m,e); } });
        if(c2!==ctx) ctx.groups=c2.groups; };
    }); });
  ARMOR.RECIPES=R; ARMOR.MOTIFS=MO;
})();
