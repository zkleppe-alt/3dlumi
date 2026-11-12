// ════════════════════════════════════════════════════════════════
//  THE HIGH ROADS (V115) — the realm spread out: the long journeys between distant towns. Each is a land of its own,
//   entered by a milestone arch where the road leaves a town and left by the arch at the far end, by the next town:
//    · The Old Trade Road — Hearthvale ↔ Dusthaven: rolling farmland and orchards, a mill on a stream, a wayside camp
//    · The Sand Road — Dusthaven ↔ Crystalpeak: dunes and red rock, an oasis camp, then the foothills and the first pines
//    · The Mire Road — Ashfield ↔ Shadowmere: ash flats giving way to fen and fog, boardwalks, lanterns, the drowned chapel
//   Along each: lamps, waystones cut with verses, a camp halfway (rest by the fire: an hour passes, you rise mended, the
//   journal remembers), a chest off the road, demons on the way (stronger by night), and the land's own scenery.
//   Nothing in the realm moves: the arches stand beside the roads, and the old ways across the open country are still there.
//  ROADS.attach(world) — the arches in the realm. State: GAME.S.roads = {id:{chest, walked}}.
// ════════════════════════════════════════════════════════════════
const ROADS=(function(){
  const S=()=>GAME.S, RS=id=>{ const s=S(); s.roads=s.roads||{}; return s.roads[id]=s.roads[id]||{}; };
  const jw=(t,o)=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(t,o); };
  const DEFS=[
    { id:'trade', name:'The Old Trade Road', biome:'meadow', lvl:6, seed:3,
      a:SP({town:'Hearthvale', x:43.5, z:35.5, rot:-0.6}), b:SP({town:'Dusthaven', x:77.5, z:58.5, rot:-0.6}),
      verses:[['Proverbs 3:6','In all thy ways acknowledge him, and he shall direct thy paths.'],['Isaiah 30:21','This is the way, walk ye in it.'],['Psalm 37:23','The steps of a good man are ordered by the LORD: and he delighteth in his way.']],
      camp:'a drovers’ camp under an old oak', feature:'mill',
      walked:'I walked the Old Trade Road from end to end — orchards and hayfields, a mill turning on its stream, and a fire at the drovers’ camp. The towns are further apart than they look on a map.' },
    { id:'sand', name:'The Sand Road', biome:'desert', lvl:12, seed:7,
      a:SP({town:'Dusthaven', x:108.5, z:69.5, rot:Math.PI/2}), b:SP({town:'Crystalpeak', x:143.5, z:95.5, rot:-0.4}),
      verses:[['Isaiah 35:1','The desert shall rejoice, and blossom as the rose.'],['Isaiah 43:19','I will even make a way in the wilderness, and rivers in the desert.'],['John 4:14','Whosoever drinketh of the water that I shall give him shall never thirst.']],
      camp:'the oasis under the palms', feature:'oasis',
      walked:'The Sand Road: dunes, red rock, the oasis under its palms, and then, at last, the cold green of the foothills and Crystalpeak’s snow ahead. My boots are full of sand.' },
    { id:'mire', name:'The Mire Road', biome:'marsh', lvl:22, seed:11,
      a:SP({town:'Ashfield', x:167.5, z:144.5, rot:0.2}), b:SP({town:'Shadowmere', x:201.5, z:148.5, rot:Math.PI/2}),
      verses:[['Psalm 23:4','Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.'],['John 1:5','And the light shineth in darkness; and the darkness comprehended it not.'],['Psalm 18:28','For thou wilt light my candle: the LORD my God will enlighten my darkness.']],
      camp:'a lamplit hut on stilts above the fen', feature:'chapel',
      walked:'The Mire Road, end to end: ash, then fen and fog, boardwalks over black water, and the drowned chapel with its bell still hanging. Someone keeps the lanterns lit along the way. I would like to know who.' } ];
  const LW=300, LD=96;
  // ── the arch, in the realm and at each end of a road ──
  function arch(par,x,y,z,rot,title,sub,col){ const g=group(x,y,z,par); g.rotation.y=rot||0; const st=[0x8a8578,0x7e7a6c,0x96907f];
    [-1,1].forEach(sd=>{ for(let i=0;i<7;i++) B(0.62,0.36,0.62,st[(i+(sd>0?1:0))%3],sd*1.55,i*0.36,0,g); B(0.74,0.12,0.74,0x6e6a5e,sd*1.55,2.52,0,g); });
    for(let i=0;i<9;i++){ const a=Math.PI*(i+0.5)/9, s=B(0.5,0.34,0.62,st[i%3],0,0,0,g); s.position.set(-Math.cos(a)*1.55,2.6+Math.sin(a)*1.2,0); s.rotation.z=a-Math.PI/2; }
    const cv=document.createElement('canvas'); cv.width=512; cv.height=128; const x2=cv.getContext('2d'); x2.fillStyle=col||'#6a4a2a'; x2.fillRect(0,0,512,128); x2.strokeStyle='#e8c46a'; x2.lineWidth=4; x2.strokeRect(8,8,496,112);
    x2.fillStyle='#f4e6c0'; x2.textAlign='center'; let fs=46; x2.font=`bold ${fs}px Georgia,serif`; while(x2.measureText(title).width>470&&fs>24){ fs-=2; x2.font=`bold ${fs}px Georgia,serif`; } x2.fillText(title,256,62); x2.font='italic 26px Georgia,serif'; x2.fillText(sub,256,100);
    const mat=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv)}); [[0.33,Math.PI],[-0.33,0]].forEach(([zz,ry])=>{ const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.55),mat); sg.position.set(0,3.25,zz); sg.rotation.y=ry; g.add(sg); });
    [-1,1].forEach(sd=>{ const l=group(sd*2.1,0,0.6,g); Cy(0.05,0.07,1.6,6,0x2e2a26,0,0,0,l); const L=B(0.2,0.26,0.2,glow(0xffd27a),0,1.6,0,l); B(0.28,0.06,0.28,0x2e2a26,0,1.86,0,l); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(L,1.6); });
    return g; }
  function attach(world){ DEFS.forEach(D=>{ ['a','b'].forEach(end=>{ const e=D[end], o=D[end==='a'?'b':'a'], gy=world.ground?world.ground(e.x,e.z):0;
      arch(world.scene,e.x,gy,e.z,e.rot,D.name.toUpperCase(),'the long road to '+o.town).scale.setScalar(0.62);   // drawn to the realm's (grand) scale
      world.spots.push({x:e.x,z:e.z,r:1.3,label:'Travel',who:D.name+' → '+o.town,action:()=>ENGINE.go('road:'+D.id,lv=>lv._arrive(end))}); }); }); }

  // ═══ one road's land ═══
  function build(D){
    const lv={id:'road:'+D.id,name:D.name,folk:[],spots:[],anim:[],cam:{pitch:0.5,dist:8,min:4,max:16},W:LW,H:LD};
    const B_=D.biome, scene=new THREE.Scene(); lv.scene=scene; const skyC=B_==='marsh'?0x8a96a0:B_==='desert'?0xc8d8e8:0x9cc4e4; scene.background=new THREE.Color(skyC); scene.fog=new THREE.Fog(skyC,B_==='marsh'?12:40,B_==='marsh'?70:190);
    const hemi=new THREE.HemisphereLight(0xd8e8ff,B_==='desert'?0x8a7050:0x5a6a3a,0.55); scene.add(hemi); const ground0=hemi.groundColor.clone();
    const sun=new THREE.DirectionalLight(0xfff0d8,1.0); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:90}); sun.shadow.bias=-0.0006; scene.add(sun,sun.target);
    lv.anim.push(()=>{ if(typeof DAYNIGHT!=='undefined'){ DAYNIGHT.drive(lv,{sun,hemi,ground:ground0}); if(B_==='marsh'){ scene.fog.color.lerp(new THREE.Color(0x7a8890),0.5); scene.background.copy(scene.fog.color); } } });
    lv.follow=p=>{ sun.position.set(p.x-12,p.y+30,p.z+14); sun.target.position.set(p.x,p.y,p.z); };
    const R=(a,b)=>hsh(a+D.seed*101,b+D.seed*37);
    // ── the line of the road: across the land from west to east, wandering ──
    const CTRL=[]; for(let i=0;i<=15;i++){ const x=6+i*(LW-12)/15, z=LD/2+(i===0||i===15?0:(R(i,1)-0.5)*44+Math.sin(i*1.3+D.seed)*8); CTRL.push([x,z]); }
    const cr=(p0,p1,p2,p3,t)=>{ const t2=t*t, t3=t2*t; return 0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3); };
    const PTS=[]; for(let i=0;i<CTRL.length-1;i++){ const a=CTRL[Math.max(0,i-1)], b=CTRL[i], c=CTRL[i+1], d=CTRL[Math.min(CTRL.length-1,i+2)]; for(let k=0;k<14;k++){ const t=k/14; PTS.push([cr(a[0],b[0],c[0],d[0],t),cr(a[1],b[1],c[1],d[1],t)]); } }
    PTS.push(CTRL[CTRL.length-1].slice()); let L=0; PTS.forEach((p,i)=>{ if(i) L+=Math.hypot(p[0]-PTS[i-1][0],p[1]-PTS[i-1][1]); p[2]=L; }); D._z0=PTS[0][1]; D._z1=PTS[PTS.length-1][1];
    // ── the land's shape for the biome ──
    const fbm=(x,z)=>Math.sin(x*0.07+Math.sin(z*0.05)*2)*1.0+Math.sin(z*0.09+x*0.04)*0.8+Math.sin((x+z)*0.21)*0.35+Math.sin((x-z)*0.43)*0.15;
    const des=x=>B_==='desert'?Math.max(0,Math.min(1,(LW*0.68-x)/30)):0;   // the desert gives way to foothills toward its eastern end
    const raw=(x,z)=>{ if(B_==='marsh') return fbm(x,z)*0.7-0.2+Math.max(0,(x-LW*0.35))*0; if(B_==='desert'){ const dn=Math.sin(x*0.16+Math.sin(z*0.11)*1.6)*1.4+Math.abs(Math.sin(z*0.07+x*0.03))*2.2; const hills=fbm(x,z)*3.4+Math.max(0,(Math.abs(z-LD/2)-20))*0.25; const k=des(x); return dn*k+hills*(1-k)+0.4; }
      return fbm(x,z)*3.2+Math.max(0,Math.abs(z-LD/2)-30)*0.12; };
    // the road keeps an easy grade: its height is the land's, smoothed along it
    { const hs=PTS.map(p=>raw(p[0],p[1])); PTS.forEach((p,i)=>{ let s=0,n=0; for(let k=-14;k<=14;k++){ const j=Math.max(0,Math.min(PTS.length-1,i+k)); s+=hs[j]; n++; } p[3]=B_==='marsh'?Math.max(0.12,s/n):s/n; }); }
    const pathAt=(x,z)=>{ let bd=1e9, bi=0; for(let i=0;i<PTS.length;i+=3){ const d=(PTS[i][0]-x)**2+(PTS[i][1]-z)**2; if(d<bd){ bd=d; bi=i; } } let best=[1e9,0,0];
      for(let i=Math.max(0,bi-4);i<Math.min(PTS.length-1,bi+4);i++){ const a=PTS[i], b=PTS[i+1], vx=b[0]-a[0], vz=b[1]-a[1], l2=vx*vx+vz*vz||1, t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l2)), px=a[0]+vx*t, pz=a[1]+vz*t, d=Math.hypot(x-px,z-pz);
        if(d<best[0]) best=[d,a[3]+(b[3]-a[3])*t,(a[2]+(b[2]-a[2])*t)/L]; } return best; };
    const ease=u=>u*u*(3-2*u), GW=0.5, NX=Math.round((LW+4)/GW), NZ=Math.round((LD+4)/GW), GH=new Float32Array(NX*NZ), WKM=new Uint8Array(NX*NZ), PD=new Float32Array(NX*NZ);
    // the places along the way that need flat ground beside the road
    const at=u=>{ const s=u*L; let i=PTS.findIndex(p=>p[2]>=s); if(i<1) i=1; const a=PTS[i-1], b=PTS[i], t=(s-a[2])/Math.max(0.001,b[2]-a[2]), x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; return {x,z,nx:-dz/l,nz:dx/l,y:a[3]+(b[3]-a[3])*t,fwd:Math.atan2(dx,dz)}; };
    const PADS=[]; const pad=(u,side,off,r)=>{ const p=at(u), x=p.x+p.nx*off*side, z=p.z+p.nz*off*side; PADS.push({x,z,r,y:p.y}); return {x,z,y:p.y,p}; };
    const CAMP=pad(0.5,1,6,4.6), CHEST=pad(0.71,-1,6.5,1.6), FEAT=pad(D.feature==='mill'?0.27:0.3,-1,8,D.feature==='oasis'?6:4.2);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const x=i*GW-2, z=j*GW-2, k=j*NX+i, [pd,ph]=pathAt(x,z); let h=raw(x,z);
      const wp=pd<2.2?1:pd<6?1-ease((pd-2.2)/3.8):0; h=h*(1-wp)+ph*wp; let walk=pd<1.9;
      for(const P of PADS){ const d=Math.hypot(x-P.x,z-P.z); if(d<P.r+3){ const w=d<P.r?1:1-ease((d-P.r)/3); h=h*(1-w)+P.y*w; } if(d<P.r) walk=true; }
      if(x<4||x>LW-4){ const w=x<4?(4-x)/6:(x-LW+4)/6; }   // the arches
      GH[k]=h; PD[k]=pd; WKM[k]=walk&&x>2&&x<LW-2?1:0; }
    const gAt=(x,z)=>{ const fx=(x+2)/GW, fz=(z+2)/GW, i=Math.max(0,Math.min(NX-2,Math.floor(fx))), j=Math.max(0,Math.min(NZ-2,Math.floor(fz))), tx=Math.min(1,Math.max(0,fx-i)), tz=Math.min(1,Math.max(0,fz-j)), k=j*NX+i;
      return (GH[k]*(1-tx)+GH[k+1]*tx)*(1-tz)+(GH[k+NX]*(1-tx)+GH[k+NX+1]*tx)*tz; };
    const wAt=(x,z)=>{ const i=Math.round((x+2)/GW), j=Math.round((z+2)/GW); return i>=0&&j>=0&&i<NX&&j<NZ&&WKM[j*NX+i]===1; };
    const pdAt=(x,z)=>{ const i=Math.round((x+2)/GW), j=Math.round((z+2)/GW); return i>=0&&j>=0&&i<NX&&j<NZ?PD[j*NX+i]:99; };
    lv.ground=gAt; lv._pts=PTS;
    // ── the land, coloured by biome, height and slope ──
    { const RS=1, nx=Math.round((LW+4)/RS)+1, nz=Math.round((LD+4)/RS)+1, pos=new Float32Array(nx*nz*3), col=new Float32Array(nx*nz*3), idx=[], C=new THREE.Color();
      for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const x=i*RS-2, z=j*RS-2, k=j*nx+i, h=gAt(x,z); pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z;
        const sl=Math.abs(gAt(x+0.6,z)-gAt(x-0.6,z))+Math.abs(gAt(x,z+0.6)-gAt(x,z-0.6)), n=(R(i,j)-0.5)*0.06, pd=pdAt(x,z);
        if(B_==='meadow'){ const f=Math.floor(x/14)+Math.floor(z/11)*7, r=R(f,3); C.setHex(sl>1.6?0x7a7058:r<0.18&&Math.abs(z-LD/2)<34?0xd8c070:r<0.3?0x8ab858:0x6cb05a); }
        else if(B_==='desert'){ const k2=des(x); C.setHex(k2>0.5?(sl>1.4?0xb8704a:0xdcbc84):(sl>1.4?0x8a7a6a:h>4?0x8a9a6a:0x7aa060)); }
        else { C.setHex(h<0.05?0x3a4a3a:sl>1.2?0x5a564e:x<LW*0.3?0x6a645c:0x4e6048); }
        C.offsetHSL(0,0,n); col[k*3]=C.r; col[k*3+1]=C.g; col[k*3+2]=C.b; }
      for(let j=0;j<nz-1;j++) for(let i=0;i<nx-1;i++){ const a=j*nx+i, b=a+1, c=a+nx, d=c+1; idx.push(a,c,b,b,c,d); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})); m.receiveShadow=true; scene.add(m); }
    // the fen's black water, or the far haze of the land beyond
    if(B_==='marsh'){ const w=new THREE.Mesh(new THREE.PlaneGeometry(LW+80,LD+80),new THREE.MeshPhongMaterial({color:0x2a3a38,shininess:90,specular:0x5a7070,transparent:true,opacity:0.88})); w.rotation.x=-Math.PI/2; w.position.set(LW/2,0.02,LD/2); scene.add(w); }
    { const fl=new THREE.Mesh(new THREE.PlaneGeometry(LW+600,LD+600),new THREE.MeshLambertMaterial({color:B_==='desert'?0xc8a878:B_==='marsh'?0x3a4a40:0x5a8a4a})); fl.rotation.x=-Math.PI/2; fl.position.set(LW/2,-3,LD/2); scene.add(fl); }
    // ── the road: beaten earth (sand-packed in the desert, planked over the fen), edged with stones ──
    { const pos=[], col=[], C=new THREE.Color(); for(let i=0;i<PTS.length-1;i++){ const a=PTS[i], b=PTS[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, nx=-dz/l, nz=dx/l, w=1.35;
        const v=(p,s)=>[p[0]+nx*w*s,Math.max(gAt(p[0]+nx*w*s,p[1]+nz*w*s),B_==='marsh'?0.14:-9)+0.05,p[1]+nz*w*s]; const A=v(a,-1), B2=v(a,1), C2=v(b,1), Dd=v(b,-1);
        C.setHex(B_==='marsh'?(i%2?0x6a5440:0x5e4a38):B_==='desert'&&des(a[0])>0.5?0xc8a46e:0x9a7e5a).offsetHSL(0,0,(R(i,7)-0.5)*0.05); for(const q of [A,B2,C2,A,C2,Dd]){ pos.push(...q); col.push(C.r,C.g,C.b); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); m.receiveShadow=true; scene.add(m);
      if(B_==='marsh'){ const pl=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07,0.08,0.7,5),new THREE.MeshLambertMaterial({color:0x4a3a2a}),Math.ceil(PTS.length/2)*2); let n=0; const M=new THREE.Matrix4();
        for(let i=0;i<PTS.length-1;i+=2){ const a=PTS[i], b=PTS[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; if(gAt(a[0],a[1])>0.1) continue; [-1,1].forEach(sd=>{ M.makeTranslation(a[0]-dz/l*1.3*sd,-0.2,a[1]+dx/l*1.3*sd); pl.setMatrixAt(n++,M); }); } pl.count=n; scene.add(pl); }
      const stones=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.22,0),new THREE.MeshLambertMaterial({color:B_==='desert'?0xb08060:0x8a8478}),PTS.length*2); let n=0; const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V3=new THREE.Vector3(), S3=new THREE.Vector3(), Y=new THREE.Vector3(0,1,0);
      for(let i=0;i<PTS.length-1;i++){ const a=PTS[i], b=PTS[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; [-1,1].forEach(sd=>{ if(R(i,sd>0?3:5)<0.6) return; const x=a[0]-dz/l*1.6*sd, z=a[1]+dx/l*1.6*sd, s=0.7+R(i,9)*0.8; if(B_==='marsh'&&gAt(x,z)<0.05) return; Q.setFromAxisAngle(Y,R(i,2)*6); M.compose(V3.set(x,gAt(x,z)+0.05,z),Q,S3.set(s,s*0.7,s)); stones.setMatrixAt(n++,M); }); }
      stones.count=n; stones.castShadow=true; scene.add(stones); }
    // ── the scenery: trees and plants by biome, rocks ──
    const clear=(x,z,m)=>pdAt(x,z)>(m||3.2)&&PADS.every(P=>Math.hypot(x-P.x,z-P.z)>P.r+1.2)&&x>8&&x<LW-8;
    { const kinds={}, put=(k,x,z,s,r)=>(kinds[k]=kinds[k]||[]).push([x,gAt(x,z),z,s,r]);
      for(let i=0;i<5200;i++){ const x=R(i,11)*LW, z=R(17,i)*LD; if(!clear(x,z)) continue; const h=gAt(x,z), u=R(i,4);
        if(B_==='meadow'){ const orch=Math.floor(x/26)%3===1&&Math.abs(z-LD/2)<22; if(orch){ if(i%3) continue; const gx=Math.round(x/3)*3, gz=Math.round(z/3)*3; if(!clear(gx,gz)) continue; put('oak',gx,gz,0.65,u*6); continue; } if(u<0.55) continue; put(u<0.75?'oak':u<0.9?'birch':'pine',x,z,0.8+R(i,13)*0.5,R(i,3)*6.28); }
        else if(B_==='desert'){ const k2=des(x); if(k2>0.5){ if(u<0.93) continue; put('palm',x,z,0.7+R(i,13)*0.4,R(i,3)*6.28); } else { if(u<0.6) continue; put(u<0.85?'pine':'birch',x,z,0.8+R(i,13)*0.5,R(i,3)*6.28); } }
        else { if(u<0.8||h<0.02) continue; put('pine',x,z,0.6+R(i,13)*0.4,R(i,3)*6.28); } }
      const tm=new THREE.MeshLambertMaterial({vertexColors:true}); if(typeof windSway==='function') windSway(tm,[0.045,1.2]);
      Object.entries(kinds).forEach(([k,list])=>{ if(!list.length||typeof TREE_GEO==='undefined'||!TREE_GEO[k]) return; const im=new THREE.InstancedMesh(TREE_GEO[k](),tm,list.length), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0);
        list.forEach(([x,y,z,s,r],i)=>{ Q.setFromAxisAngle(Y,r); M.compose(new THREE.Vector3(x,y-0.1,z),Q,new THREE.Vector3(s,s*1.12,s)); im.setMatrixAt(i,M); }); im.castShadow=true; im.receiveShadow=true; scene.add(im); });
      // biome extras: cacti and red rocks; dead trees, reeds and wisps; flowers and hay
      const ex=new THREE.Group(); scene.add(ex);
      for(let i=0;i<1400;i++){ const x=R(i,51)*LW, z=R(53,i)*LD; if(!clear(x,z,2.6)) continue; const y=gAt(x,z), u=R(i,57);
        if(B_==='desert'&&des(x)>0.5){ if(u<0.93) continue; if(u<0.97){ const c=group(x,y,z,ex); Cy(0.14,0.16,1.1+u,8,0x5a8a4a,0,0,0,c); [-1,1].forEach(sd=>{ if(R(i,sd>0?1:2)<0.4) return; const a=Cy(0.09,0.1,0.5,7,0x5a8a4a,sd*0.24,0.5,0,c); B(0.26,0.12,0.12,0x5a8a4a,sd*0.12,0.42,0,c); }); }
          else { const r=new THREE.Mesh(new THREE.IcosahedronGeometry(0.9+u,1),new THREE.MeshLambertMaterial({color:0xa85a3a})); r.position.set(x,y,z); r.scale.set(1,1.6+R(i,3),1); r.rotation.y=u*9; ex.add(r); } }
        else if(B_==='marsh'){ if(u<0.86) continue; if(u<0.9){ const t=group(x,y,z,ex); Cy(0.07,0.12,2.2,6,0x3a3430,0,0,0,t); [-1,1].forEach(sd=>{ const b=Cy(0.03,0.05,0.9,5,0x3a3430,sd*0.25,1.4,0,t); b.rotation.z=-sd*0.8; }); }
          else for(let k=0;k<6;k++){ const r=Cy(0.012,0.016,0.6+R(i,k)*0.4,4,0x6a7a4a,x+(R(k,i)-0.5)*0.5,Math.max(y,0),z+(R(i+k,3)-0.5)*0.4,ex); if(k%3===0) Cy(0.03,0.03,0.12,6,0x5a3a24,x+(R(k,i)-0.5)*0.5,Math.max(y,0)+0.5,z+(R(i+k,3)-0.5)*0.4,ex); } }
        else if(B_==='meadow'){ if(u<0.9) continue; for(let k=0;k<4;k++) Sp(0.06,[0xe85a6a,0xffe060,0xf4f0ea,0xb08ae8][k],x+(R(k,i)-0.5)*0.6,y+0.12,z+(R(i,k)-0.5)*0.6,ex,5,4); } }
      ex.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); mergeStatic(ex); }
    // ── along the way: lamps, waystones, the camp, the chest, the land's own feature, the arches at the ends ──
    for(let u=0.03;u<0.98;u+=0.06){ const p=at(u), sd=(Math.round(u*50)%2)?1:-1, x=p.x+p.nx*1.9*sd, z=p.z+p.nz*1.9*sd, g=group(x,Math.max(gAt(x,z),B_==='marsh'?0.1:-9),z,scene); Cy(0.05,0.07,1.7,6,0x2e2a26,0,0,0,g);
      const lamp=B(0.18,0.24,0.18,glow(B_==='marsh'?0xfff0c8:0xffd27a),0,1.35,0,g); B(0.24,0.05,0.24,0x2e2a26,0,1.6,0,g); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(lamp,1.6); }
    D.verses.forEach(([ref,txt],i)=>{ const p=at([0.17,0.42,0.86][i]), sd=i%2?-1:1, x=p.x+p.nx*2.1*sd, z=p.z+p.nz*2.1*sd, g=group(x,gAt(x,z)-0.1,z,scene); g.rotation.y=p.fwd+(sd>0?-Math.PI/2:Math.PI/2);
      B(0.7,1.3,0.32,0x8a8478,0,0,0,g); B(0.8,0.12,0.4,0x7a7468,0,1.3,0,g); const sp=Sp(0.18,0x8a8478,0,1.45,0,g,8,6); sp.scale.y=0.6; B(0.5,0.05,0.02,0x5a5448,0,0.85,0.17,g); B(0.05,0.4,0.02,0x5a5448,0,0.65,0.17,g);
      lv.spots.push({x:p.x+p.nx*1.0*sd,z:p.z+p.nz*1.0*sd,r:1.2,label:'Read',who:'A waystone',lines:[`Cut into the stone: “${txt}” — ${ref}`]}); });
    // milestones every tenth of the way
    for(let i=1;i<10;i++){ const p=at(i/10), x=p.x-p.nx*1.75, z=p.z-p.nz*1.75, g=group(x,Math.max(gAt(x,z),B_==='marsh'?0.1:-9),z,scene); B(0.3,0.6,0.2,0x9a948a,0,0,0,g); const t=Cy(0.15,0.15,0.2,10,0x9a948a,0,0.5,0,g); t.rotation.x=Math.PI/2; g.rotation.y=p.fwd; }
    // the camp: a ring of stones and a fire, logs to sit on, a tent or shelter
    { const c=group(CAMP.x,CAMP.y,CAMP.z,scene); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, s=new THREE.Mesh(new THREE.IcosahedronGeometry(0.16,0),new THREE.MeshLambertMaterial({color:0x6a6a64})); s.position.set(Math.cos(a)*0.5,0.08,Math.sin(a)*0.5); c.add(s); }
      for(let i=0;i<4;i++){ const l=Cy(0.06,0.06,0.7,6,0x5a3c22,0,0.08,0,c); l.rotation.z=Math.PI/2; l.rotation.y=i*0.8; }
      const fl=[0,1,2].map(i=>{ const f=Co(0.2-i*0.05,0.5-i*0.1,6,glow([0xff7a2a,0xffb03a,0xffe08a][i]),0,0.12,0,c); return f; }); const L=new THREE.PointLight(0xffa050,1.0,9,1.6); L.position.set(0,0.8,0); c.add(L);
      lv.anim.push(t=>{ fl.forEach((f,i)=>{ f.scale.set(1,1+Math.sin(t*9+i*2)*0.2,1); f.rotation.y=t*(1+i); }); L.intensity=0.9+Math.sin(t*11)*0.1; });
      [[-1.6,0.3,0.4],[1.5,0.6,-0.5],[0.2,-1.7,1.6]].forEach(([x,z,r])=>{ const l=Cy(0.18,0.2,1.3,8,0x6a4a2a,x,0.18,z,c); l.rotation.set(0,r,Math.PI/2); l.position.y=0.18; });
      if(B_==='marsh'){ const h=group(2.6,0,-1.8,c); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>Cy(0.06,0.07,1.2,5,0x4a3a2a,a*0.9,0,b*0.7,h)); B(2.1,0.1,1.7,0x6a5440,0,1.2,0,h); B(1.9,1.2,1.5,0x5a5068,0,1.3,0,h); const r=prism(2.3,0.9,1.9,0x3e3448); r.position.y=2.5; h.add(r); const w=B(0.3,0.3,0.04,glow(0xffd27a),0.4,1.8,0.77,h); }
      else { const tt=group(2.6,0,-1.6,c); const tent=prism(1.8,1.3,2.0,B_==='desert'?0xd8c49a:0xc8b88a); tent.rotation.y=0.3; tt.add(tent); B(0.06,1.4,0.06,0x5a3c22,0,0,0,tt); }
      if(B_==='meadow'){ /* the old oak */ if(typeof TREE_GEO!=='undefined'&&TREE_GEO.oak){ const m=new THREE.Mesh(TREE_GEO.oak(),new THREE.MeshLambertMaterial({vertexColors:true})); m.scale.setScalar(1.8); m.position.set(-3.2,0,-2.4); c.add(m); } }
      c.traverse(m=>{ if(m.isMesh) m.castShadow=true; });
      lv.spots.push({x:CAMP.x,z:CAMP.z+1.3,r:1.3,label:'Rest',who:'The camp — '+D.camp,action:()=>rest(lv,D)});
      if(typeof JOURNAL!=='undefined') JOURNAL.spot(lv,CAMP.x-1.6,CAMP.z+0.3,Math.PI/2,D.name,'by the fire at '+D.camp); }
    // the chest, a little off the road
    { const lid=CHEST3D.make(scene,CHEST.x,CHEST.z); lid.parent.position.y=CHEST.y||0; CHEST3D.set(lid,!!RS(D.id).chest);   /* V165 */
      lv.spots.push({x:CHEST.x,z:CHEST.z+0.9,r:1.1,label:'Open',who:'An old chest',action:()=>{ const st=RS(D.id); if(st.chest){ ENGINE.speak('An old chest',['Empty — you took what was in it.']); return; } st.chest=true; CHEST3D.open(lid); const g2=Math.round((60+D.lvl*12)*(S().goldMult||1)); GAME.addGold(g2); const inv=S().inventory; inv.potion=(inv.potion||0)+2; GAME.changed(); GAME.save(); UI.toast(`📦 Chest: ${g2} gold · 2 🧪 potions`,2400); }}); }
    // the land's own feature
    { const F=FEAT, g=group(F.x,F.y,F.z,scene);
      if(D.feature==='mill'){ B(3,2.6,3,0xe8dcc0,0,0,0,g); _stoneFooting(g,3,3,0,0.3); const r=prism(3.6,1.6,3.6,0x8e4a36); r.position.y=2.6; g.add(r); const wh=group(1.65,1.3,0,g); wh.rotation.y=Math.PI/2; const rim=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.08,6,18),new THREE.MeshLambertMaterial({color:0x6a4a2a})); wh.add(rim);
        for(let i=0;i<8;i++){ const p=B(0.12,2.3,0.4,0x7a5432,0,-1.15,0,wh); p.geometry.translate(0,0,0); p.rotation.z=i*Math.PI/8; p.position.set(0,0,0); } lv.anim.push((t,dt)=>{ wh.rotation.x=t*0.8; });
        B(0.4,0.6,0.04,0x2a2a30,0,0.8,1.52,g); B(0.8,1.2,0.05,0x5a3a22,-0.8,0,1.52,g);
        lv.spots.push({x:F.x-0.8,z:F.z+2.4,r:1.2,label:'Read',who:'The old mill',lines:['The wheel still turns, though the mill has been shut for years. Someone has chalked on the door: “Back by harvest.” It does not say which harvest.']}); }
      else if(D.feature==='oasis'){ const w=new THREE.Mesh(new THREE.CircleGeometry(3.6,24),new THREE.MeshPhongMaterial({color:0x3a9ab8,shininess:80})); w.rotation.x=-Math.PI/2; w.position.y=0.04; g.add(w); const rim=new THREE.Mesh(new THREE.RingGeometry(3.5,4.3,24),new THREE.MeshLambertMaterial({color:0x6a9a50})); rim.rotation.x=-Math.PI/2; rim.position.y=0.03; g.add(rim);
        if(typeof TREE_GEO!=='undefined'&&TREE_GEO.palm) for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+0.3, m=new THREE.Mesh(TREE_GEO.palm(),new THREE.MeshLambertMaterial({vertexColors:true})); m.position.set(Math.cos(a)*4.6,0,Math.sin(a)*4.6); m.scale.setScalar(0.8+R(i,4)*0.3); g.add(m); }
        lv.spots.push({x:F.x,z:F.z+4.4,r:1.4,label:'Drink',who:'The oasis',action:()=>{ S().hp=S().maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed(); ENGINE.speak('The oasis',['Cold, clear water, out of the rock under the sand. You drink, and you are whole again.','“Whosoever drinketh of the water that I shall give him shall never thirst.”']); }}); }
      else { _stoneFooting(g,3.4,5,0,0.3); B(3.4,0.8,5,0x6a6a64,0,0,0,g); [-1,1].forEach(sd=>{ for(let i=0;i<3;i++) B(0.4,1.6+R(i,sd)*1.2,0.5,0x7a7670,sd*1.5,0.8,-1.8+i*1.8,g); }); B(1.2,3.2,1.2,0x7a7670,0,0,-2.2,g); B(0.5,0.6,0.08,0x2a2a30,0,2.2,-1.55,g);
        const bell=Co(0.25,0.4,10,0x8a7a4a,0,2.6,-1.6,g); const L2=new THREE.PointLight(0xfff0c8,0.6,6,1.6); L2.position.set(0,1.6,0); g.add(L2); const cand=[]; for(let i=0;i<5;i++) cand.push(Cy(0.03,0.03,0.2,6,glow(0xfff0c8),-0.8+i*0.4,0.8,1.6,g));
        lv.spots.push({x:F.x,z:F.z+3.1,r:1.3,label:'Pray',who:'The drowned chapel',action:()=>{ S().hp=S().maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed(); ENGINE.speak('The drowned chapel',['Half of it has gone down into the fen; the other half still stands, and someone has lit candles on what is left of the rail.','You kneel. “The light shineth in darkness; and the darkness comprehended it not.” You rise mended.']); jw('At the drowned chapel on the Mire Road someone had lit candles on the broken rail. I prayed there. The fen was very quiet.',{once:'road:mirechapel',place:D.name}); }}); }
      g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); }
    // the arches at each end, and the ways out
    const endA=at(0.0), endB=at(1.0);
    arch(scene,PTS[1][0]+1.5,gAt(PTS[1][0]+1.5,PTS[1][1]),PTS[1][1],Math.PI/2,D.name.toUpperCase(),'back to '+D.a.town); arch(scene,PTS[PTS.length-2][0]-1.5,gAt(PTS[PTS.length-2][0]-1.5,PTS[PTS.length-2][1]),PTS[PTS.length-2][1],Math.PI/2,D.name.toUpperCase(),'on to '+D.b.town);
    const leave=(end)=>{ const e=D[end], st=RS(D.id); st['saw'+end]=true; if(st.sawa&&st.sawb&&!st.walked){ st.walked=true; jw(D.walked,{once:'road:'+D.id,place:D.name}); const x=GAME.gainXp(60+D.lvl*5); UI.toast(`🗺 ${D.name} walked end to end · +${60+D.lvl*5} XP`,2600); }
      GAME.save(); const fx=Math.sin(e.rot), fz=Math.cos(e.rot); ENGINE.go('world',{x:e.x+fx*1.8,z:e.z+fz*1.8,face:e.rot,yaw:e.rot+Math.PI}); };
    lv.spots.push({x:3.6,z:PTS[0][1],r:1.4,label:'Leave',who:'To '+D.a.town,auto:[-1,0],action:()=>leave('a')});
    lv.spots.push({x:LW-3.6,z:PTS[PTS.length-1][1],r:1.4,label:'Leave',who:'To '+D.b.town,auto:[1,0],action:()=>leave('b')});
    lv.onEnter=sp=>{ const st=RS(D.id), x=sp&&typeof sp==='object'?sp.x:ENGINE.P.x; if(x<LW/2) st.sawa=true; else st.sawb=true; spawn(); };
    // ── the way's dangers: demons along the road, back each time you set out (stronger by night) ──
    const arena=COMBAT.arena(lv,{mode:'world',tier:Math.min(9,Math.floor(D.lvl/3)),W:LW,H:LD,walk:(x,y)=>wAt(x+0.5,y+0.5)||wAt(x,y),
      onDeath:()=>{ ENGINE.go(lv.id,lv._arrive('a')); setTimeout(()=>UI.toast('💫 You fall… and wake by the arch at the road’s start.',2200),450); } });
    function spawn(){ COMBAT.clear(lv); const night=typeof DAYNIGHT!=='undefined'&&DAYNIGHT.state().night>0.5; [0.16,0.29,0.38,0.58,0.66,0.8,0.92].forEach((u,i)=>{ const p=at(u), sd=i%2?1:-1, x=p.x+p.nx*0.9*sd, z=p.z+p.nz*0.9*sd, lvl=D.lvl+(night?2:0)+(i%3===2?1:0), hp=6+lvl*3;
      COMBAT.foe(lv,{x,z,hp,level:lvl,xp:4+lvl*3,atk:5+Math.round(lvl*0.8),form:i%4}); }); }
    // where you may walk, what the camera can't see through, where you are
    const solid=(x,z)=>{ if(Math.hypot(x-CAMP.x,z-CAMP.z)<0.75) return true; if(Math.hypot(x-CHEST.x,z-CHEST.z)<0.55) return true; if(D.feature==='mill'&&Math.abs(x-FEAT.x)<1.7&&Math.abs(z-FEAT.z)<1.6) return true; if(D.feature==='oasis'&&Math.hypot(x-FEAT.x,z-FEAT.z)<3.7) return true; if(D.feature==='chapel'&&Math.abs(x-FEAT.x)<1.8&&Math.abs(z-FEAT.z)<2.6) return true; return false; };
    lv.canMove=(fx,fz,tx,tz)=>{ if(!wAt(tx,tz)||solid(tx,tz)) return false; return Math.abs(gAt(tx,tz)-gAt(fx,fz))<0.9; };
    lv.walkTile=(x,y)=>wAt(x+0.5,y+0.5);
    lv.camBlock=(x,z,y)=>y<Math.max(gAt(x,z),B_==='marsh'?0.05:-9)+0.25;
    lv.zone=p=>{ const [,,u]=pathAt(p.x,p.z); return D.name+' · '+(u<0.12?'leaving '+D.a.town:u>0.88?'nearing '+D.b.town:u>0.43&&u<0.57?'halfway':Math.round(u*100)+'% of the way'); };
    lv._arrive=end=>{ const p=at(end==='a'?0.025:0.975); return {x:p.x,z:p.z,face:end==='a'?p.fwd:p.fwd+Math.PI,yaw:end==='a'?p.fwd+Math.PI:p.fwd}; };
    lv.spawn=lv._arrive('a');
    return lv; }
  function rest(lv,D){ if(lv.combat&&lv.combat.foes.some(d=>d.alive&&Math.hypot(d.x-ENGINE.P.x,d.z-ENGINE.P.z)<8)){ UI.toast('⚔ Not with demons so close.',1600); return; }
    const s=S(); s.hp=s.maxHp; s.dayFrac=(s.dayFrac||0)+1/24; ENGINE.hud&&ENGINE.hud(); GAME.changed(); GAME.save();
    ENGINE.speak('The camp',[`You sit by the fire at ${D.camp}. The road behind you, the road ahead. An hour passes; you rise mended.`]);
    jw(`I rested by the fire at ${D.camp}, halfway along ${D.name}.`,{place:D.name,quiet:true}); }
  DEFS.forEach(D=>ENGINE.add({id:'road:'+D.id,lazy:()=>build(D)}));
  return { attach, defs:DEFS };
})();
