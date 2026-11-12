// ════════════════════════════════════════════════════════════════
//  THE NORTH (V114) — the Scholar's Way and the Tower School.
//   When Old Man Mario has taught you all his Greek, he leaves his hut and takes up the old tower in the far north, and
//   a letter comes for you: an invitation to his school. The old road north of Hearthvale opens — a long wooded trail
//   climbing in switchbacks up a mountain, past waystones and a stream and a lookout, to a summit that overlooks the
//   whole realm, and the tower on it.
//   The school: Biblical Greek II and Church History, a lesson at a time (a page to study, then six questions, five to
//   pass), a transcript, and — both courses done — a certificate. More courses are being written.
//  NORTH.gate(world,{x,z}) puts the old road's arch in the realm. State: GAME.S.school = {invited, arrived, done:[], best:{}, cert}.
// ════════════════════════════════════════════════════════════════
const NORTH=(function(){
  const S=()=>GAME.S, sch=()=>{ const s=S(); s.school=s.school||{done:[],best:{}}; s.school.done=s.school.done||[]; s.school.best=s.school.best||{}; return s.school; };
  const greekDone=()=>typeof GREEK!=='undefined'&&GREEK.lessons&&GREEK.lessons.every(L=>(GREEK.st().done||[]).includes(L.id));
  const open=()=>!!sch().invited;
  const jw=(t,o)=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(t,o); };
  const say=(lines,then)=>ENGINE.speak('Old Man Mario',lines,null,then);
  const gk=t=>`<span lang="el" style="font:600 19px 'Gentium Plus','Noto Serif','Times New Roman',serif">${t}</span>`;
  const big=t=>`<div lang="el" style="text-align:center;font:600 24px/1.5 'Gentium Plus','Noto Serif','Times New Roman',serif;margin:8px 0">${t}</div>`;
  const tbl=(rows)=>`<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;margin:8px 0">${rows.map(([a,b])=>`<div>${a}</div><div>${b}</div>`).join('')}</div>`;

  // ═══ the invitation: once the last Greek lesson is learned, a letter finds you in the realm ═══
  setInterval(()=>{ try{ const s=S(); if(!s||!greekDone()) return; const c=sch(); if(c.invited) return; const L=ENGINE.level;
      if(!L||L.id!=='world'||ENGINE.busy||UI.open||!document.getElementById('say').hidden||ENGINE.holding) return;
      c.invited=true; GAME.save();
      ENGINE.speak('✉ A letter',['A boy from Hearthvale runs up, out of breath, with a letter sealed in green wax. Pressed into the seal: an omega.',
        '“Knight — You have learned all that I had to teach in a hut. It is time for a school.”',
        '“There is an old tower in the far north, high on the mountain above the pines. Lucan and I used to dream of it: a place where anyone who wished could learn to read the Word for himself. I have swept it out and lit the lamps.”',
        '“Take the old road north of Hearthvale — the Scholar’s Way. It is a long climb. Bring good boots. The kettle will be on.”','“— M.”'],null,()=>{
        UI.toast('🗺 The Scholar’s Way is open — north of Hearthvale',3600);
        jw('A letter from Mario, sealed with an omega: he has left his hut for an old tower in the far north and is opening a school. The old road north of Hearthvale — the Scholar’s Way — is open to me now.',{once:'school:invite'}); });
    }catch(e){} },3000);

  // ═══ the old road's arch, in the realm north of Hearthvale ═══
  function gate(world,o){ const x=o.x, z=o.z, gy=world.ground?world.ground(x,z):0, g=group(x,gy,z,world.scene), st=[0x8a8578,0x7e7a6c,0x96907f]; g.scale.setScalar(0.62);
    [-1,1].forEach(sd=>{ for(let i=0;i<7;i++) B(0.62,0.36,0.62,st[(i+(sd>0?1:0))%3],sd*1.55,i*0.36,0,g); B(0.74,0.12,0.74,0x6e6a5e,sd*1.55,2.52,0,g); });
    for(let i=0;i<9;i++){ const a=Math.PI*(i+0.5)/9, s=B(0.5,0.34,0.62,st[i%3],0,0,0,g); s.position.set(-Math.cos(a)*1.55,2.6+Math.sin(a)*1.2,0); s.rotation.z=a-Math.PI/2; }
    const cv=document.createElement('canvas'); cv.width=512; cv.height=128; const x2=cv.getContext('2d'); x2.fillStyle='#6a4a2a'; x2.fillRect(0,0,512,128); x2.strokeStyle='#e8c46a'; x2.lineWidth=4; x2.strokeRect(8,8,496,112);
    x2.fillStyle='#f4e6c0'; x2.textAlign='center'; x2.font='bold 46px Georgia,serif'; x2.fillText('THE SCHOLAR’S WAY',256,62); x2.font='italic 26px Georgia,serif'; x2.fillText('to the Tower in the North',256,100);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.55),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv)})); sg.position.set(0,3.25,0.33); sg.rotation.y=Math.PI; g.add(sg); const sg2=sg.clone(); sg2.position.z=-0.33; sg2.rotation.y=0; g.add(sg2);
    // the brambles across it until the letter comes; lanterns lit once it has
    const br=group(0,0,0,g); for(let i=0;i<16;i++){ const b=Sp(0.32+hsh(i,4)*0.2,[0x3e5a2a,0x4a6a30,0x56402a][i%3],-1.1+hsh(i,2)*2.2,0.25+hsh(2,i)*1.5,(hsh(i,9)-0.5)*0.5,br,7,5); b.scale.y=0.7; }
    for(let i=0;i<6;i++){ const l=Cy(0.08,0.12,2.4,6,0x5a4028,-1+i*0.4,0,0,br); l.rotation.z=(i%2?1:-1)*0.9; l.position.y=0.5+i*0.12; }
    const lamps=[-1,1].map(sd=>{ const l=group(sd*2.1,0,0.6,g); Cy(0.05,0.07,1.6,6,0x2e2a26,0,0,0,l); const L=B(0.2,0.26,0.2,glow(0xffd27a),0,1.6,0,l); B(0.28,0.06,0.28,0x2e2a26,0,1.86,0,l); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(L,1.6); return l; });
    const spot={x,z:z+0.2,r:1.3,label:'Enter',who:'The Scholar’s Way',action:()=>{ if(!open()){ ENGINE.speak('The Scholar’s Way',['An old road climbs north into the pines, but brambles and fallen trees choke it. No one has come this way in years.',greekDone()?'(Something tells you a letter is on its way.)':'Perhaps one day someone will clear it — or send for you.']); return; } ENGINE.go('northreach',{x:60,z:157,face:Math.PI,yaw:0}); }};
    world.spots.push(spot);
    world.anim.push(()=>{ const o2=open(); br.visible=!o2; lamps.forEach(l=>l.visible=o2); });
    return g; }

  // ═══ THE NORTHERN REACH — the land itself ═══
  const MX=60, MZ=20, PR=14, TOP=33;   // the summit and its plateau
  const CTRL=[[60,158],[58,146],[56,136],[66,126],[63,116],[51,108],[54,98],[67,90],[76,82],[66,74],[48,70],[42,62],[54,55],[70,50],[71,42],[58,38],[50,32],[56,28]];
  function build(){
    const lv={id:'northreach',name:'The Northern Reach',folk:[],spots:[],anim:[],cam:{pitch:0.5,dist:8,min:4,max:16}};
    const scene=new THREE.Scene(); lv.scene=scene; scene.background=new THREE.Color(0x9cc4e4); scene.fog=new THREE.Fog(0x9cc4e4,50,300);
    const hemi=new THREE.HemisphereLight(0xd8e8ff,0x5a6a3a,0.55); scene.add(hemi); const ground0=new THREE.Color(0x5a6a3a);
    const sun=new THREE.DirectionalLight(0xfff0d8,1.0); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:90}); sun.shadow.bias=-0.0006; scene.add(sun,sun.target);
    lv.anim.push(()=>{ if(typeof DAYNIGHT!=='undefined') DAYNIGHT.drive(lv,{sun,hemi,ground:ground0}); });
    // ── the trail: a curve through the control points, its height climbing steadily to the summit ──
    const cr=(p0,p1,p2,p3,t)=>{ const t2=t*t, t3=t2*t; return 0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3); };
    const PTS=[]; for(let i=0;i<CTRL.length-1;i++){ const a=CTRL[Math.max(0,i-1)], b=CTRL[i], c=CTRL[i+1], d=CTRL[Math.min(CTRL.length-1,i+2)]; for(let k=0;k<12;k++){ const t=k/12; PTS.push([cr(a[0],b[0],c[0],d[0],t),cr(a[1],b[1],c[1],d[1],t)]); } }
    PTS.push(CTRL[CTRL.length-1].slice()); let L=0; PTS.forEach((p,i)=>{ if(i) L+=Math.hypot(p[0]-PTS[i-1][0],p[1]-PTS[i-1][1]); p[2]=L; });
    const ease=u=>u*u*(3-2*u); let RIM=PTS.findIndex(p=>Math.hypot(p[0]-MX,p[1]-MZ)<PR); if(RIM<0) RIM=PTS.length-1; const LR=PTS[RIM][2];
    PTS.forEach(p=>{ const u=Math.min(1,p[2]/LR); p[3]=TOP*(0.1*u+0.9*Math.pow(u,1.25)); });   // a steady climb that tops out exactly at the rim of the summit
    const pathAt=(x,z)=>{ let bd=1e9, bi=0; for(let i=0;i<PTS.length;i+=2){ const d=(PTS[i][0]-x)**2+(PTS[i][1]-z)**2; if(d<bd){ bd=d; bi=i; } } let best=[1e9,0];
      for(let i=Math.max(0,bi-3);i<Math.min(PTS.length-1,bi+3);i++){ const a=PTS[i], b=PTS[i+1], vx=b[0]-a[0], vz=b[1]-a[1], l2=vx*vx+vz*vz||1, t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l2)), px=a[0]+vx*t, pz=a[1]+vz*t, d=Math.hypot(x-px,z-pz);
        if(d<best[0]) best=[d,a[3]+(b[3]-a[3])*t]; } return best; };
    // ── the mountain: a massif rising to the summit, ridges and gullies, the trail cut into it, the summit levelled ──
    const fbm=(x,z)=>Math.sin(x*0.11+Math.sin(z*0.07)*2)*1.6+Math.sin(z*0.13+x*0.05)*1.3+Math.sin((x+z)*0.31)*0.6+Math.sin((x-z)*0.53)*0.3;
    const mount=(x,z)=>{ const d=Math.hypot(x-MX,(z-MZ)*0.9); return Math.max(-1,(TOP+5)/(1+Math.pow(d/42,2.4))-2+fbm(x,z)*(0.4+Math.min(1,d/40))*1.4+Math.max(0,Math.sin(x*0.09+z*0.04)*3)*(d>30?1:0)); };
    const GW=0.5, NX=Math.round(124/GW), NZ=Math.round(170/GW), GH=new Float32Array(NX*NZ), WKM=new Uint8Array(NX*NZ), PD=new Float32Array(NX*NZ);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const x=i*GW-2, z=j*GW-2, k=j*NX+i, [pd,ph]=pathAt(x,z), ds=Math.hypot(x-MX,z-MZ); let h=mount(x,z);
      const wp=pd<2.4?1:pd<7?1-ease((pd-2.4)/4.6):0; h=h*(1-wp)+ph*wp; if(pd>2.4&&pd<7&&h<ph) h=ph-(ph-h)*0.6;   // cut into the hillside, the outer side falls away
      const ws=ds<PR?1:ds<PR+6?1-ease((ds-PR)/6):0; h=h*(1-ws)+TOP*ws;
      if(z>150){ const wf=Math.min(1,(z-150)/8); h=h*(1-wf)+Math.max(0,ph)*wf*0+0*wf; }   // the meadow at the trail's foot
      GH[k]=h; PD[k]=pd; WKM[k]=(pd<1.9&&z<163)||(ds<PR-0.6)?1:0; }
    const gAt=(x,z)=>{ const fx=(x+2)/GW, fz=(z+2)/GW, i=Math.max(0,Math.min(NX-2,Math.floor(fx))), j=Math.max(0,Math.min(NZ-2,Math.floor(fz))), tx=Math.min(1,Math.max(0,fx-i)), tz=Math.min(1,Math.max(0,fz-j)), k=j*NX+i;
      return (GH[k]*(1-tx)+GH[k+1]*tx)*(1-tz)+(GH[k+NX]*(1-tx)+GH[k+NX+1]*tx)*tz; };
    const wAt=(x,z)=>{ const i=Math.round((x+2)/GW), j=Math.round((z+2)/GW); return i>=0&&j>=0&&i<NX&&j<NZ&&WKM[j*NX+i]===1; };
    const pdAt=(x,z)=>{ const i=Math.round((x+2)/GW), j=Math.round((z+2)/GW); return i>=0&&j>=0&&i<NX&&j<NZ?PD[j*NX+i]:99; };
    lv.ground=gAt; lv._pts=PTS;
    // ── the terrain mesh, coloured by height and slope: meadow, forest floor, rock, the snow near the top ──
    { const R=1, nx=Math.round(124/R)+1, nz=Math.round(170/R)+1, pos=new Float32Array(nx*nz*3), col=new Float32Array(nx*nz*3), idx=[], C=new THREE.Color();
      for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const x=i*R-2, z=j*R-2, k=j*nx+i, h=gAt(x,z); pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z;
        const sl=Math.abs(gAt(x+0.6,z)-gAt(x-0.6,z))+Math.abs(gAt(x,z+0.6)-gAt(x,z-0.6)), pd=pdAt(x,z), ds=Math.hypot(x-MX,z-MZ), n=(hsh(i,j)-0.5)*0.05;
        if(ds<PR-0.5) C.setHex(0x8a9a70); else if(pd<1.6) C.setHex(h>24?0xa8a090:0x9a8462); else if(sl>2.2) C.setHex(h>26?0x9aa0ac:0x7a7268); else if(h>28&&ds>PR+3) C.setHex(sl>1.2?0xc8ccd4:0xeef2f6); else if(h>28) C.setHex(0x7e8a64); else if(h>20) C.setHex(sl>1.2?0x7e786c:0x6a8a54); else C.setHex(sl>1.4?0x6e6a5a:z>148?0x7ab060:0x4f8a44);
        C.offsetHSL(0,0,n); col[k*3]=C.r; col[k*3+1]=C.g; col[k*3+2]=C.b; }
      for(let j=0;j<nz-1;j++) for(let i=0;i<nx-1;i++){ const a=j*nx+i, b=a+1, c=a+nx, d=c+1; idx.push(a,c,b,b,c,d); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})); m.receiveShadow=true; scene.add(m); }
    // ── the realm far below: patchwork fields, woods, a river and the sea, the distant towns ──
    { const R0=400, seg=80, g=new THREE.PlaneGeometry(R0*2,R0*2,seg,seg); g.rotateX(-Math.PI/2); const p=g.attributes.position, col=[], C=new THREE.Color();
      for(let i=0;i<p.count;i++){ const x=p.getX(i)+MX, z=p.getZ(i)+MZ+150; p.setX(i,x); p.setZ(i,z); const fx=Math.floor(x/18), fz=Math.floor(z/14), r=hsh(fx+500,fz+500), sea=z>420||x<-160;
        p.setY(i,sea?-6:-4+Math.sin(x*0.02)*1.5); C.setHex(sea?0x3a7aa8:r<0.2?0x3f7a3c:r<0.45?0x7ab060:r<0.6?0xc8b46a:r<0.75?0x8aa858:0x5f9a50); col.push(C.r,C.g,C.b); }
      g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})); scene.add(m);
      for(let i=0;i<9;i++){ const tx=MX-140+i*36+hsh(i,3)*20, tz=230+hsh(3,i)*150, tg=group(tx,-4,tz,scene); for(let k=0;k<6;k++){ B(3,2.5,3,0xe8e0d0,(hsh(i,k)-0.5)*14,0,(hsh(k,i)-0.5)*10,tg); Co(2.4,2,4,0x9a4a36,(hsh(i,k)-0.5)*14,2.5,(hsh(k,i)-0.5)*10,tg); } Co(1.2,8,6,0x5a6a8a,0,0,0,tg); } }
    // ── the trail itself: a beaten earth path, flagged with stone near the top, edged with stones ──
    { const pos=[], col=[], C=new THREE.Color(); for(let i=0;i<PTS.length-1;i++){ const a=PTS[i], b=PTS[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, nx=-dz/l, nz=dx/l, w=1.35;
        const v=(p,s)=>[p[0]+nx*w*s,gAt(p[0]+nx*w*s,p[1]+nz*w*s)+0.05,p[1]+nz*w*s]; const A=v(a,-1), B2=v(a,1), C2=v(b,1), D=v(b,-1);
        C.setHex(a[3]>22?0xa8a090:0x8e7656).offsetHSL(0,0,(hsh(i,7)-0.5)*0.05); for(const q of [A,B2,C2,A,C2,D]){ pos.push(...q); col.push(C.r,C.g,C.b); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); m.receiveShadow=true; scene.add(m);
      const stones=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.22,0),new THREE.MeshLambertMaterial({color:0x8a8478}),Math.ceil(PTS.length*2)); let n=0; const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V3=new THREE.Vector3(), S3=new THREE.Vector3();
      for(let i=0;i<PTS.length-1;i+=1){ const a=PTS[i], b=PTS[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; [-1,1].forEach(sd=>{ if(hsh(i,sd>0?3:5)<0.45||n>=stones.count) return; const x=a[0]-dz/l*1.6*sd, z=a[1]+dx/l*1.6*sd, s=0.7+hsh(i,9)*0.8; Q.setFromAxisAngle(new THREE.Vector3(0,1,0),hsh(i,2)*6); M.compose(V3.set(x,gAt(x,z)+0.05,z),Q,S3.set(s,s*0.7,s)); stones.setMatrixAt(n++,M); }); }
      stones.count=n; stones.castShadow=true; scene.add(stones); }
    // ── the woods: pines and birches and oaks below the tree-line, thinning higher up; boulders ──
    { const kinds={pine:[],oak:[],birch:[]}; for(let i=0;i<2600;i++){ const x=hsh(i,11)*124-2, z=hsh(17,i)*170-2, pd=pdAt(x,z), h=gAt(x,z), ds=Math.hypot(x-MX,z-MZ); if(pd<3.4||ds<PR+3||z>156) continue;
        if(h>27&&hsh(i,3)<0.75) continue; if(h>22&&hsh(i,5)<0.4) continue; const sl=Math.abs(gAt(x+0.6,z)-gAt(x-0.6,z))+Math.abs(gAt(x,z+0.6)-gAt(x,z-0.6)); if(sl>3) continue;
        const k=h>16?'pine':hsh(i,7)<0.5?'pine':hsh(i,8)<0.5?'birch':'oak'; kinds[k].push([x,h,z,0.8+hsh(i,13)*0.6,hsh(i,4)*6.28]); }
      const tm=new THREE.MeshLambertMaterial({vertexColors:true}); if(typeof windSway==='function') windSway(tm,[0.045,1.2]);
      Object.entries(kinds).forEach(([k,list])=>{ if(!list.length||typeof TREE_GEO==='undefined'||!TREE_GEO[k]) return; const im=new THREE.InstancedMesh(TREE_GEO[k](),tm,list.length), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0);
        list.forEach(([x,y,z,s,r],i)=>{ Q.setFromAxisAngle(Y,r); M.compose(new THREE.Vector3(x,y-0.1,z),Q,new THREE.Vector3(s,s*1.15,s)); im.setMatrixAt(i,M); }); im.castShadow=true; im.receiveShadow=true; scene.add(im); });
      const rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.6,1),new THREE.MeshLambertMaterial({color:0x8a8a92}),260), M=new THREE.Matrix4(), Q=new THREE.Quaternion(); let n=0;
      for(let i=0;i<900&&n<260;i++){ const x=hsh(i,31)*124-2, z=hsh(37,i)*170-2; if(pdAt(x,z)<2.8||Math.hypot(x-MX,z-MZ)<PR+1) continue; const s=0.6+hsh(i,5)*1.8; Q.setFromEuler(new THREE.Euler(hsh(i,1),hsh(i,2)*6,hsh(i,3))); M.compose(new THREE.Vector3(x,gAt(x,z)-0.2,z),Q,new THREE.Vector3(s,s*0.7,s*1.1)); rocks.setMatrixAt(n++,M); }
      rocks.count=n; rocks.castShadow=true; scene.add(rocks); }
    // ── along the way: lanterns, waystones with verses, a stream and its footbridge, a lookout bench ──
    const at=u=>{ const s=u*L; let i=PTS.findIndex(p=>p[2]>=s); if(i<1) i=1; const a=PTS[i-1], b=PTS[i], t=(s-a[2])/Math.max(0.001,b[2]-a[2]), x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; return {x,z,nx:-dz/l,nz:dx/l,y:gAt(x,z),fwd:Math.atan2(dx,dz)}; };
    for(let u=0.04;u<0.98;u+=0.075){ const p=at(u), sd=(Math.round(u*40)%2)?1:-1, x=p.x+p.nx*1.9*sd, z=p.z+p.nz*1.9*sd, g=group(x,gAt(x,z),z,scene); Cy(0.05,0.07,1.7,6,0x2e2a26,0,0,0,g); B(0.3,0.04,0.04,0x2e2a26,-sd*0.12,1.66,0,g).rotation.y=p.fwd+Math.PI/2;
      const lamp=B(0.18,0.24,0.18,glow(0xffd27a),0,1.35,0,g); B(0.24,0.05,0.24,0x2e2a26,0,1.6,0,g); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(lamp,1.6); }
    const WAY=[[0.14,'Psalm 121:1','I will lift up mine eyes unto the hills, from whence cometh my help.'],[0.33,'Psalm 121:2','My help cometh from the LORD, which made heaven and earth.'],
      [0.56,'Isaiah 2:3','Come ye, and let us go up to the mountain of the LORD… and he will teach us of his ways, and we will walk in his paths.'],[0.8,'Psalm 119:105','Thy word is a lamp unto my feet, and a light unto my path.']];
    WAY.forEach(([u,ref,txt],i)=>{ const p=at(u), sd=i%2?-1:1, x=p.x+p.nx*2.1*sd, z=p.z+p.nz*2.1*sd, g=group(x,gAt(x,z)-0.1,z,scene); g.rotation.y=p.fwd+(sd>0?-Math.PI/2:Math.PI/2);
      B(0.7,1.3,0.32,0x8a8478,0,0,0,g); B(0.8,0.12,0.4,0x7a7468,0,1.3,0,g); const sp=Sp(0.18,0x8a8478,0,1.45,0,g,8,6); sp.scale.y=0.6; B(0.5,0.05,0.02,0x5a5448,0,0.85,0.17,g); B(0.05,0.4,0.02,0x5a5448,0,0.65,0.17,g); Sp(0.06,0x6a8a4a,0.3,0.1,0.2,g,6,4);
      lv.spots.push({x:p.x+p.nx*1.0*sd,z:p.z+p.nz*1.0*sd,r:1.2,label:'Read',who:'A waystone',lines:[`Cut into the stone: “${txt}” — ${ref}`]}); });
    { const p=at(0.24); const sx=p.x, sz=p.z; const pos=[], col=[]; for(let k=-40;k<40;k++){ const x0=sx+k*1.0, x1=x0+1.0, w=0.9, f=x=>sz+Math.sin(x*0.15)*3+(x-sx)*0.15; [[x0,-w],[x0,w],[x1,w],[x0,-w],[x1,w],[x1,-w]].forEach(([x,o])=>{ const z=f(x)+o; pos.push(x,gAt(x,z)+0.06,z); col.push(0.32,0.62,0.78); }); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); scene.add(new THREE.Mesh(g,new THREE.MeshPhongMaterial({vertexColors:true,shininess:60,side:THREE.DoubleSide})));
      const br=group(sx,p.y,sz,scene); br.rotation.y=p.fwd; for(let i=0;i<9;i++) B(1.9,0.07,0.26,i%2?0x8a6440:0x7a5634,0,0.15+Math.sin(i/8*Math.PI)*0.12,-1.1+i*0.27,br); [-1,1].forEach(sd=>{ B(0.07,0.07,2.6,0x5a3c22,sd*0.92,0.75,0,br); [-1.1,0,1.1].forEach(q=>B(0.08,0.75,0.08,0x5a3c22,sd*0.92,0,q,br)); }); }
    { const p=at(0.47), sd=1, x=p.x+p.nx*2.4*sd, z=p.z+p.nz*2.4*sd, g=group(x,gAt(x,z),z,scene); g.rotation.y=p.fwd-Math.PI/2; B(1.4,0.08,0.4,0x7a5432,0,0.42,0,g); [-0.6,0.6].forEach(q=>B(0.08,0.42,0.36,0x5a3c22,q,0,0,g)); B(1.4,0.36,0.06,0x7a5432,0,0.5,-0.18,g);
      lv.spots.push({x:p.x+p.nx*1.2,z:p.z+p.nz*1.2,r:1.1,label:'Sit',who:'The lookout',lines:['Halfway up. Below, the pines run down to the meadows, and the road you came by is a thread. The air is thin and cold and clean.']}); }
    // ── the summit: a paved court, a low parapet round its rim, the tower and the school hall, the overlook ──
    { const pv=new THREE.Mesh(new THREE.CircleGeometry(PR-0.6,48),new THREE.MeshLambertMaterial({color:0x9a9488})); pv.rotation.x=-Math.PI/2; pv.position.set(MX,TOP+0.04,MZ); pv.receiveShadow=true; scene.add(pv);
      for(let r=3;r<PR-1;r+=2.2){ const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+0.08,64),new THREE.MeshBasicMaterial({color:0x8a8478})); ring.rotation.x=-Math.PI/2; ring.position.set(MX,TOP+0.05,MZ); scene.add(ring); }
      const gapA=Math.atan2(PTS[RIM][0]-MX,PTS[RIM][1]-MZ);
      for(let i=0;i<72;i++){ const a=i/72*Math.PI*2; let da=Math.atan2(Math.sin(a-gapA),Math.cos(a-gapA)); if(Math.abs(da)<0.28) continue; const x=MX+Math.sin(a)*(PR-0.3), z=MZ+Math.cos(a)*(PR-0.3), s=B(1.25,0.6,0.4,i%2?0x9a948a:0x8a8478,x,TOP,z,scene); s.rotation.y=a; }
      const fl=(x,z,c)=>{ const g=group(x,TOP,z,scene); for(let i=0;i<6;i++){ const b=Sp(0.18,0x4f8a44,(hsh(i,1)-0.5)*1.2,0.1,(hsh(1,i)-0.5)*0.6,g,6,4); b.scale.y=0.8; Sp(0.07,c,(hsh(i,1)-0.5)*1.2,0.25,(hsh(1,i)-0.5)*0.6,g,6,4); } B(1.5,0.2,0.8,0x7a7468,0,0,0,g); };
      fl(MX-6,MZ+3,0xe85a6a); fl(MX+6,MZ+3,0xffe060); fl(MX-4,MZ+8,0xb08ae8);
      { const og=group(MX+8.6,TOP,MZ+8.6,scene); B(0.1,1.0,0.1,0x2e2a26,0,0,0,og); const sc=Cy(0.07,0.1,0.7,8,0xc9a94a,0,1.0,0,og); sc.rotation.z=Math.PI/2.6; }   // a brass spyglass on its post
      lv.spots.push({x:MX+7.8,z:MZ+7.8,r:1.3,label:'Look',who:'The Overlook',action:()=>{ window.__view={p:[MX+11,TOP+6,MZ+11],l:[MX+55,TOP-32,MZ+170]}; ENGINE.speak('The Overlook',OVER,null,()=>{ window.__view=null; }); }});
      const OVER=['From the summit the whole realm lies open to the south: the patchwork of the fields, the woods, the river running to the sea, the towns like scattered salt. Somewhere down there is the Homestead.','Mario says Lucan used to stand at a window like this and pray for every roof he could see.'];
      if(typeof JOURNAL!=='undefined') JOURNAL.spot(lv,MX-8,MZ+7,Math.PI*0.75,'The Tower Summit','on the parapet of the tower summit, with the whole realm below');
      // the well, a bench, banners
      { const wg=group(MX+5,TOP,MZ-2,scene); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, s=B(0.28,0.5,0.16,[0x9a9488,0x8a8478][i%2],0,0,0,wg); s.position.set(Math.cos(a)*0.46,0.25,Math.sin(a)*0.46); s.rotation.y=-a+Math.PI/2; } [-0.5,0.5].forEach(x=>B(0.08,1.5,0.08,0x5a3c22,x,0,0,wg)); const r=prism(1.3,0.5,1.0,0x4e5668); r.position.y=1.5; wg.add(r); }
    }
    // ── THE TOWER: coursed stone in bands, string-courses, windows climbing round it, a corbelled gallery, a slate cone with a
    //    gilt finial and a lantern room lit at its crown ("a city that is set on an hill cannot be hid"); the school hall beside it ──
    const TX=MX, TZ=MZ-5, TR=4.2, TH=18;
    { const g=group(TX,TOP,TZ,scene), st=[0xb8b2a4,0xaaa496,0xc4beb0,0xa49e90], sm=c=>softMat(c);
      Cy(TR+0.4,TR+0.6,0.6,28,sm(0x8a8478),0,0,0,g); for(let i=0;i<Math.round(TH/0.45);i++) Cy(TR+(i%2?0.01:0),TR+(i%2?0.01:0),0.45,28,sm(st[i%4]),0,0.6+i*0.45,0,g);
      [4,8.5,13].forEach(y=>Cy(TR+0.14,TR+0.14,0.18,28,sm(0x8a8478),0,y,0,g));
      for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, gc=group(0,0,0,g); gc.rotation.y=a; B(0.4,0.5,0.4,0x9a948a,0,TH+0.2,TR+0.1,gc); B(0.5,0.6,0.5,st[i%4],0,TH+0.7,TR+0.25,gc); if(i%2===0) B(0.5,0.55,0.5,st[(i+1)%4],0,TH+1.3,TR+0.25,gc); }
      Cy(TR+0.5,TR+0.5,0.5,28,sm(0x9a948a),0,TH+0.7,0,g);
      for(let i=0;i<10;i++){ const a=i*2.4+0.6, y=2.4+i*1.5; if(y>TH-1) break; if(Math.cos(a)>0.85) continue; const wg=group(Math.sin(a)*(TR+0.02),y,Math.cos(a)*(TR+0.02),g); wg.rotation.y=a; B(0.5,0.9,0.1,0x2a2a30,0,0,0,wg); B(0.4,0.8,0.02,typeof LIFE!=='undefined'?LIFE.WINLIT:glow(0xf2d27a),0,0.04,0.05,wg); const ar=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.06,6,10,Math.PI),sm(0x8a8478)); ar.position.set(0,0.9,0.06); wg.add(ar); B(0.66,0.08,0.2,0x8a8478,0,-0.06,0.08,wg); }
      // the door, south: a deep arch, oak doors with iron straps, a lamp each side, the school's name over it
      { const dg=group(0,0.6,TR,g); for(let i=0;i<3;i++){ const ar=new THREE.Mesh(new THREE.TorusGeometry(0.85-i*0.12,0.12,6,14,Math.PI),sm(i%2?0x8a8478:0x9a948a)); ar.position.set(0,1.7,0.2-i*0.08); dg.add(ar); [-1,1].forEach(sd=>B(0.24,1.7,0.3,i%2?0x8a8478:0x9a948a,sd*(0.85-i*0.12),0,0.2-i*0.08,dg)); }
        B(1.3,1.8,0.08,0x5a3a22,0,0,-0.02,dg); B(0.06,1.8,0.1,0x3a2414,0,0,0.02,dg); [0.4,1.2].forEach(y=>B(1.3,0.06,0.1,0x2a2a2e,0,y,0.03,dg));
        [-1.25,1.25].forEach(x=>{ const l=B(0.18,0.26,0.18,glow(0xffd27a),x,1.3,0.45,dg); B(0.24,0.05,0.24,0x2a2a2e,x,1.56,0.45,dg); if(typeof DAYNIGHT!=='undefined') DAYNIGHT.lamp(l,1.4); });
        const cv=document.createElement('canvas'); cv.width=512; cv.height=96; const x=cv.getContext('2d'); x.fillStyle='#3a2e22'; x.fillRect(0,0,512,96); x.fillStyle='#e8c46a'; x.textAlign='center'; x.font='bold 44px Georgia,serif'; x.fillText('SCHOLA VERBI',256,52); x.font='italic 22px Georgia,serif'; x.fillText('the School of the Word',256,84);
        const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.42),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv)})); sg.position.set(0,2.85,0.32); dg.add(sg); }
      // the roof and the lantern
      Co(TR+0.9,7,28,sm(0x4e5668),0,TH+1.2,0,g); for(let i=1;i<7;i++){ const r=(TR+0.9)*(1-i/7.3); Cy(r,r+0.03,0.06,28,sm(0x3e4658),0,TH+1.2+i,0,g); }
      const lan=group(0,TH+6.2,0,g); Cy(0.55,0.55,1.0,8,glow(0xffe8a0),0,0,0,lan); [0,1,2,3,4,5,6,7].forEach(i=>{ const a=i/8*Math.PI*2; B(0.08,1.0,0.08,0x2a2a2e,Math.sin(a)*0.58,0,Math.cos(a)*0.58,lan); }); Co(0.75,0.9,8,sm(0x4e5668),0,1.0,0,lan); Sp(0.12,0xe8c050,0,2.0,0,lan,8,6); B(0.05,0.6,0.05,0xe8c050,0,1.9,0,lan); B(0.32,0.05,0.05,0xe8c050,0,2.3,0,lan);
      const LL=new THREE.PointLight(0xffd890,0,22,1.6); LL.position.set(TX,TOP+TH+6.7,TZ); scene.add(LL); lv.anim.push(()=>{ const n=typeof DAYNIGHT!=='undefined'?DAYNIGHT.state().night:0; LL.intensity=n*1.4; });
      // banners
      [-1,1].forEach(sd=>{ const bg=group(Math.sin(sd*0.6)*(TR+0.05),9.6,Math.cos(sd*0.6)*(TR+0.05),g); bg.rotation.y=sd*0.6; B(0.04,0.04,0.3,0x2a2a2e,0,0,0.12,bg); B(0.7,2.2,0.03,0x2a5a3a,0,-2.2,0.28,bg); B(0.7,0.08,0.035,0xe8c050,0,-0.1,0.29,bg);
        const om=new THREE.Mesh(new THREE.TorusGeometry(0.18,0.04,6,14,Math.PI*1.6),new THREE.MeshLambertMaterial({color:0xe8c050})); om.position.set(0,-1.15,0.3); om.rotation.z=-Math.PI*0.3; bg.add(om); });   // an omega in gold on green
      // the hall: a long stone wing to the east under slate
      { const hg=group(6.2,0,1.0,g); B(5.6,4.0,5.2,0xb8b2a4,0,0,0,hg); B(5.8,0.4,5.4,0x8a8478,0,0,0,hg); const r=prism(6.4,2.6,5.8,sm(0x4e5668)); r.rotation.y=Math.PI/2; r.position.y=4.0; hg.add(r);
        [-1.6,0,1.6].forEach(z=>{ const wg=group(2.82,1.6,z,hg); wg.rotation.y=Math.PI/2; B(0.6,1.4,0.1,0x2a2a30,0,0,0,wg); B(0.5,1.3,0.02,typeof LIFE!=='undefined'?LIFE.WINLIT:glow(0xf2d27a),0,0.04,0.05,wg); const ar=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.06,6,10,Math.PI),sm(0x8a8478)); ar.position.set(0,1.4,0.06); wg.add(ar); });
        [-1.6,1.6].forEach(x=>{ const wg=group(x,1.6,2.62,hg); B(0.6,1.4,0.1,0x2a2a30,0,0,0,wg); B(0.5,1.3,0.02,typeof LIFE!=='undefined'?LIFE.WINLIT:glow(0xf2d27a),0,0.04,0.05,wg); });
        B(0.6,1.6,0.6,0x9a948a,1.5,5.0,-1.4,hg); }
      g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); }
    lv.spots.push({x:TX,z:TZ+TR+1.3,r:1.3,label:'Enter',who:'The Tower School',action:()=>ENGINE.go('school:0')});
    // ── where you may walk, and what the camera can't see through ──
    const solid=(x,z)=>Math.hypot(x-TX,z-TZ)<TR+0.5||(x>TX+3.2&&x<TX+9.2&&z>TZ-1.8&&z<TZ+3.8)||Math.hypot(x-(MX+5),z-(MZ-2))<0.8;
    lv.canMove=(fx,fz,tx,tz)=>{ if(!wAt(tx,tz)||solid(tx,tz)) return false; return Math.abs(gAt(tx,tz)-gAt(fx,fz))<0.9; };
    lv.camBlock=(x,z,y)=>y<gAt(x,z)+0.25||(Math.hypot(x-TX,z-TZ)<TR+0.3&&y<TOP+TH+8);
    lv.zone=p=>{ const ds=Math.hypot(p.x-MX,p.z-MZ); if(ds<PR) return 'The Tower Summit'; const [pd]=pathAt(p.x,p.z); return p.z>130?'The Scholar’s Way · the foot of the mountain':p.z>70?'The Scholar’s Way · the pinewoods':'The Scholar’s Way · the high road'; };
    lv.spawn={x:60,z:157,face:Math.PI,yaw:0};
    lv.spots.push({x:60,z:162.4,r:1.6,label:'Leave',who:'Back to the realm',auto:[0,1],action:()=>ENGINE.go('world',SP({x:45.5,z:4.4,face:0}))});
    { const g=group(60,gAt(60,163),163.2,scene); [-1,1].forEach(sd=>{ for(let i=0;i<6;i++) B(0.5,0.36,0.5,[0x8a8578,0x7e7a6c][i%2],sd*1.6,i*0.36,0,g); }); B(3.8,0.4,0.6,0x7e7a6c,0,2.16,0,g); }
    // ── Mario at the summit, on your first arrival ──
    lv.onEnter=()=>{ const c=sch(); if(!c.arrived&&ENGINE.P.z<40){ c.arrived=true; GAME.save(); } };
    lv.anim.push(()=>{ const c=sch(); if(c.met||ENGINE.level!==lv) return; if(Math.hypot(ENGINE.P.x-MX,ENGINE.P.z-MZ)<PR-2){ c.met=true; c.arrived=true; GAME.save();
      say(['Old Man Mario is waiting on the tower steps, a scarf wound three times round his neck and his ink-stained hands round a steaming cup.','“You came! And on foot, all that way. Good — a scholar should know what the climb costs.”','“Come and see the view first. Lucan used to say that a man who studies the Word should look up from the page now and then at the people it is for.”','“Then come inside. The kettle is on, and I have been writing lessons all winter.”'],()=>{
        jw('I climbed the Scholar’s Way to the tower at the top of the world. Mario was waiting on the steps with tea. From the summit you can see the whole realm — every roof, every road. He has named his school Schola Verbi: the School of the Word.',{once:'school:arrive',place:'The Tower Summit'}); UI.toast('🏛 The Tower School is open',2400); }); } });
    return lv; }
  ENGINE.add({id:'northreach',lazy:build});

  // ═══ THE SCHOOL ROOMS ═══
  ENGINE.add({id:'school:0',lazy:()=>{ const grid=[
      [5,5,51,5,5,51,5,5,51,5,5,51,5,5],
      [5,44,44,12,12,12,12,12,12,45,12,44,44,5],
      [5,12,12,12,12,12,12,12,12,12,12,12,12,5],
      [5,12,12,12,12,12,12,12,12,12,12,12,12,5],
      [5,12,40,40,12,40,40,12,40,40,12,12,49,5],
      [5,12,41,41,12,41,41,12,41,41,12,12,12,5],
      [5,12,12,12,12,12,12,12,12,12,12,12,12,5],
      [5,12,40,40,12,40,40,12,40,40,12,12,10,5],
      [5,12,41,41,12,41,41,12,41,41,12,12,12,5],
      [5,49,12,12,12,13,13,13,12,12,12,12,48,5],
      [5,5,5,5,5,5,9,9,5,5,5,5,5,5]];
    const lv=gridRoom({id:'school:0',name:'The Tower School',theme:'home',pal:Object.assign({},ROOM_PALS.home,{wall:0xe6dcc6,cloth:0x2a5a3a,accent:0x2a5a3a,trim:0xe8c766}),sign:'book',grid,npcs:[],floor:0,
      exit:{level:'northreach',spawn:{x:TXp(),z:TZp()+TRp()+1.8,face:0,yaw:Math.PI}},stairs:{up:{level:'school:1',spawn:{x:9.5,z:2.6,face:0}}},zone:'The schoolroom'});
    const room=lv.room;
    // the board on the north wall, chalked with the day's Greek, and the lectern
    const cv=document.createElement('canvas'); cv.width=512; cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#2e3a32'; x.fillRect(0,0,512,256); x.strokeStyle='#8a6440'; x.lineWidth=14; x.strokeRect(0,0,512,256);
    x.fillStyle='#e8ece0'; x.textAlign='center'; x.font='600 40px "Times New Roman",serif'; x.fillText('ἐν ἀρχῇ ἦν ὁ λόγος',256,80); x.font='26px "Times New Roman",serif'; x.fillText('τοῦ λόγου · τῷ λόγῳ · τὸν λόγον',256,140); x.font='italic 22px Georgia,serif'; x.fillText('Today: the genitive & the dative',256,200);
    const bd=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv)})); bd.position.set(4.5,1.6,1.03); room.add(bd);
    const lg=group(7,0,2.6,room); B(0.06,1.0,0.06,0x5a3c22,0,0,0,lg); const tp=B(0.6,0.06,0.45,0x7a5432,0,1.0,0,lg); tp.rotation.x=-0.35; B(0.5,0.02,0.36,0xf2e6c8,0,1.06,0.02,lg).rotation.x=-0.35;
    const f=addPerson(lv,room,'scribe',7,2.0,0,'Old Man Mario',null,{rest:Math.PI}); f.action=()=>talk(); f.label='Talk'; f.reach=1.5;
    [['peasant',1.5,5.5,'A student','“Mario says the genitive is the case of belonging. I belong to the back row, I think.”'],['peasantF',4.5,6.5,'A student','“I walked up from Saltmere. Three days! Worth every blister.”'],['peasant',10.5,6.5,'A student','“Did you know Athanasius was exiled five times? Five! And he still would not change one word of the creed.”']].forEach(([o,px,pz,n,l])=>addPerson(lv,room,o,px,pz,0,n,[l],{rest:Math.PI}));
    if(typeof JOURNAL!=='undefined') JOURNAL.spot(lv,10.5,8.5,Math.PI,'The Tower School','at a desk at the back of Mario’s schoolroom');
    return lv; }});
  ENGINE.add({id:'school:1',lazy:()=>{ const grid=[
      [5,5,51,5,51,5,5,51,5,51,5,5],
      [5,44,44,44,12,12,12,44,44,11,12,5],
      [5,12,12,12,12,12,12,12,12,12,12,5],
      [5,49,12,40,40,12,12,40,40,12,49,5],
      [5,12,12,41,41,12,12,41,41,12,12,5],
      [5,12,12,12,12,13,13,12,12,12,12,5],
      [5,48,12,12,12,13,13,12,12,12,66,5],
      [5,5,5,5,5,5,5,5,5,5,5,5]];
    const lv=gridRoom({id:'school:1',name:'The Tower School',theme:'home',pal:Object.assign({},ROOM_PALS.home,{wall:0xe0d4bc,cloth:0x6a2a2a,accent:0x2a5a3a}),grid,npcs:[],floor:1,stairs:{down:{level:'school:0',spawn:{x:12.5,z:8.6,face:0}}},zone:'The library'});
    if(typeof JOURNAL!=='undefined') JOURNAL.spot(lv,4.5,5.5,Math.PI,'The Tower Library','among the shelves of the tower library');
    lv.spots.push({x:5.5,z:6.0,r:1.2,label:'Read',who:'The library',lines:['Shelves of copies, many still wet: Gospels, Psalters, a half-finished Acts. On the end of each shelf, in Mario’s hand: “Take one. Bring it back. Or bring someone who can read it.”']});
    return lv; }});
  let TXp=()=>60, TZp=()=>15, TRp=()=>4.2;

  // ═══ THE CURRICULUM ═══  each lesson: a page to study, six questions (five to pass)
  // Biblical Greek II follows Greek I (Mario's fourteen lessons in the hut). Church History tells the story of the Church from
  // Pentecost to Chalcedon.
  const COURSES=[
    { id:'gk2', name:'Biblical Greek II', icon:'📜', lessons:[
      { id:'g1', title:'Belonging and giving: the genitive and the dative', reward:120,
        intro:['“In the hut you learned the noun as subject and as object. Two more cases, and you can read most of a sentence.”'],
        teach:()=>`<p class="gm-intro">A Greek noun changes its ending to show its job in the sentence. You know two cases already: the <b>nominative</b> (the subject) and the <b>accusative</b> (the object). Today, two more.</p>
          <p><b>Genitive</b> — “of”: belonging, source, description. <b>Dative</b> — “to, for, in, by”: the indirect object, place, means.</p>
          ${tbl([[gk('ὁ λόγος'),'nominative · the word (subject)'],[gk('τοῦ λόγου'),'genitive · of the word'],[gk('τῷ λόγῳ'),'dative · to / for / in the word'],[gk('τὸν λόγον'),'accusative · the word (object)']])}
          <p>The feminine nouns of the first declension work the same way:</p>
          ${tbl([[gk('ἡ ἀρχή'),'the beginning'],[gk('τῆς ἀρχῆς'),'of the beginning'],[gk('τῇ ἀρχῇ'),'in / to the beginning'],[gk('τὴν ἀρχήν'),'the beginning (object)']])}
          <p class="gm-note">Notice the little iota under the long vowel in the dative — ${gk('τῷ λόγῳ, τῇ ἀρχῇ')}. It is called the <b>iota subscript</b>.</p>
          ${big('ἐν ἀρχῇ ἦν ὁ λόγος')}<p class="ds" style="text-align:center">“In the beginning was the Word.” — John 1:1 (ἀρχῇ is dative: after ἐν)</p>
          ${big('ὁ υἱὸς τοῦ θεοῦ')}<p class="ds" style="text-align:center">“the Son of God” — θεοῦ is genitive</p>`,
        qs:[['What does the genitive usually add to a noun?','“of” — belonging or source','the subject of the sentence','a command','the future tense'],
          ['Which form means “of the word”?','τοῦ λόγου','τῷ λόγῳ','τὸν λόγον','ὁ λόγος'],
          ['In ἐν ἀρχῇ, what case is ἀρχῇ?','dative','genitive','accusative','nominative'],
          ['ὁ υἱὸς τοῦ θεοῦ means…','the Son of God','God the Son','to the Son of God','the sons of God'],
          ['What is the small iota written under ῳ and ῃ called?','iota subscript','rough breathing','circumflex','diaeresis'],
          ['τῷ κόσμῳ most likely means…','to / in the world','of the world','the world (subject)','worlds']],
        journal:'Mario chalked τοῦ λόγου and τῷ λόγῳ on the board and made the whole class say them like a song. Of the Word, to the Word. A student from Saltmere got the giggles; so did Mario.' },
      { id:'g2', title:'Little words that go far: prepositions', reward:120,
        intro:['“Prepositions are the hinges of a sentence. Learn eight, and doors open everywhere.”'],
        teach:()=>`<p class="gm-intro">A preposition tells you <i>where</i> or <i>how</i> — and in Greek it also tells the noun after it which case to take.</p>
          ${tbl([[gk('ἐν')+' + dat.','in, among'],[gk('εἰς')+' + acc.','into, to'],[gk('ἐκ / ἐξ')+' + gen.','out of, from'],[gk('ἀπό')+' + gen.','from, away from'],[gk('πρός')+' + acc.','to, toward, with'],[gk('διά')+' + gen.','through'],[gk('μετά')+' + gen.','with'],[gk('ὑπέρ')+' + gen.','on behalf of, for']])}
          ${big('καὶ ὁ λόγος ἦν πρὸς τὸν θεόν')}<p class="ds" style="text-align:center">“and the Word was with God” — John 1:1 (πρός + accusative)</p>
          ${big('πάντα δι’ αὐτοῦ ἐγένετο')}<p class="ds" style="text-align:center">“all things were made through Him” — John 1:3 (διά + genitive)</p>
          <p class="gm-note">Before a vowel some lose their last letter: ${gk('διά')} becomes ${gk('δι’')}, ${gk('ἐκ')} becomes ${gk('ἐξ')}.</p>`,
        qs:[['εἰς usually means…','into','out of','through','with'],['ἐκ takes which case?','genitive','dative','accusative','nominative'],
          ['In John 1:1, πρὸς τὸν θεόν means…','with God','from God','through God','on behalf of God'],['διά + genitive means…','through','into','in','toward'],
          ['ἐν takes which case?','dative','genitive','accusative','vocative'],['ὑπὲρ ἡμῶν means…','on behalf of us / for us','in us','out of us','into us']],
        journal:'Eight little words today. Mario says πρὸς τὸν θεόν is “face to face with God,” and that a whole sermon hangs on that one preposition.' },
      { id:'g3', title:'What happened: the aorist', reward:140,
        intro:['“The present tells you what is happening. The aorist tells you that it happened — simply, as an event. Most of the Gospels are told in it.”'],
        teach:()=>`<p class="gm-intro">The <b>aorist</b> is the Greek past tense of story-telling: it looks at an action as a whole event. It is usually marked by an <b>augment</b> (an ${gk('ἐ-')} at the front) and, in the first aorist, a ${gk('-σα')}.</p>
          ${tbl([[gk('πιστεύω'),'I believe (present)'],[gk('ἐπίστευσα'),'I believed (aorist)'],[gk('ἐπίστευσεν'),'he / she believed']])}
          <p>Some common verbs have a <b>second aorist</b> — a different stem, learned by heart:</p>
          ${tbl([[gk('ἔρχομαι → ἦλθον'),'I come → I came'],[gk('λέγω → εἶπον'),'I say → I said'],[gk('ὁράω → εἶδον'),'I see → I saw'],[gk('γινώσκω → ἔγνων'),'I know → I knew']])}
          ${big('εἰς τὰ ἴδια ἦλθεν')}<p class="ds" style="text-align:center">“He came unto His own” — John 1:11</p>
          ${big('ἐδάκρυσεν ὁ Ἰησοῦς')}<p class="ds" style="text-align:center">“Jesus wept” — John 11:35</p>`,
        qs:[['The aorist usually presents an action as…','a whole event','still going on','a command','a wish only'],['What is the augment?','an ἐ- added at the front','a -σα ending','an iota subscript','a breathing mark'],
          ['ἐπίστευσα means…','I believed','I believe','I will believe','believe!'],['ἦλθεν means…','he came','he comes','he will come','he says'],
          ['εἶπον is the aorist of…','λέγω, I say','ἔρχομαι, I come','ὁράω, I see','πιστεύω, I believe'],['ἐδάκρυσεν ὁ Ἰησοῦς means…','Jesus wept','Jesus came','Jesus believed','Jesus spoke']],
        journal:'The aorist. “Jesus wept” — ἐδάκρυσεν. Mario read it and then said nothing for a moment, the way he did in the hut when we first read John.' },
      { id:'g4', title:'Reading: “God is love” (1 John 4:7–8)', reward:180,
        intro:['“Now you read. Everything you need is on the board already — the genitive, a preposition, an aorist.”'],
        teach:()=>`<p class="gm-intro">First John 4:7–8, in the Byzantine text. Read it slowly, word by word.</p>
          ${big('Ἀγαπητοί, ἀγαπῶμεν ἀλλήλους· ὅτι ἡ ἀγάπη ἐκ τοῦ θεοῦ ἐστιν')}
          <p class="ds" style="text-align:center">Beloved, let us love one another: for love is of God;</p>
          ${big('Ὁ μὴ ἀγαπῶν οὐκ ἔγνω τὸν θεόν· ὅτι ὁ θεὸς ἀγάπη ἐστίν.')}
          <p class="ds" style="text-align:center">He that loveth not knoweth not God; for God is love.</p>
          ${tbl([[gk('ἀγαπητοί'),'beloved (ones)'],[gk('ἀγαπῶμεν'),'let us love'],[gk('ἀλλήλους'),'one another'],[gk('ἐκ τοῦ θεοῦ'),'from / of God — ἐκ + genitive'],[gk('ὁ ἀγαπῶν'),'the one who loves (a participle)'],[gk('ἔγνω'),'knew — aorist of γινώσκω'],[gk('ἀγάπη ἐστίν'),'is love']])}`,
        qs:[['ἀγαπῶμεν ἀλλήλους means…','let us love one another','we loved them','love one another!','they love us'],['ἐκ τοῦ θεοῦ is…','ἐκ with the genitive: from / of God','ἐκ with the dative','an aorist verb','a command'],
          ['ἔγνω is an aorist of which verb?','γινώσκω, I know','ἔρχομαι, I come','λέγω, I say','ἀγαπάω, I love'],['ὁ θεὸς ἀγάπη ἐστίν means…','God is love','love is a god','God loves us','God was love'],
          ['ὁ μὴ ἀγαπῶν means…','the one who does not love','the one who loved','do not love!','no one loves'],['Which book is this from?','1 John','the Gospel of John','Romans','James']],
        journal:'I read 1 John 4:8 in Greek, all of it, without looking at the page of words. ὁ θεὸς ἀγάπη ἐστίν. Mario wrote it on a slate and gave it to me to keep.' } ]},
    { id:'hist', name:'Church History', icon:'⛪', lessons:[
      { id:'h1', title:'The Church is born (c. AD 30–70)', reward:120,
        intro:['“Before there was a realm, before Stormgate had a wall, the Church began — in a city called Jerusalem, on a feast day.”'],
        teach:()=>`<p class="gm-intro">Fifty days after the Passover at which Jesus was crucified, on the feast of <b>Pentecost</b>, the Holy Spirit came upon the disciples (Acts 2). Peter preached, and about <b>three thousand</b> were baptized that day.</p>
          <p>The believers were first called <b>“Christians” at Antioch</b> (Acts 11:26). From there <b>Paul</b> set out on his missionary journeys, planting churches across Asia Minor and Greece and writing them the letters we still read.</p>
          <p>The first great question: must Gentiles keep the law of Moses to be saved? The <b>Council of Jerusalem</b> (Acts 15, about AD 49) answered no — salvation is by the grace of the Lord Jesus, for Jew and Gentile alike.</p>
          <p>In <b>AD 70</b> Roman armies destroyed Jerusalem and its Temple. By then the Gospel had already gone out to the ends of the empire.</p>`,
        qs:[['On which feast did the Holy Spirit come upon the disciples?','Pentecost','Passover','Tabernacles','Purim'],['About how many were baptized that day (Acts 2)?','about three thousand','twelve','about five hundred','about seventy'],
          ['Where were believers first called “Christians”?','Antioch','Rome','Corinth','Jerusalem'],['What did the Council of Jerusalem decide?','Gentiles need not keep the law of Moses to be saved','Gentiles must be circumcised','Peter would lead from Rome','The Gospels were finished'],
          ['About when did the Council of Jerusalem meet?','about AD 49','about AD 325','about AD 10','about AD 451'],['What happened in AD 70?','Jerusalem and the Temple were destroyed','Paul was converted','Constantine became emperor','The Nicene Creed was written']],
        journal:'Church History, first lesson: Pentecost, Antioch, the Council of Jerusalem. Mario says the whole story of the Church is the Gospel going further than anyone expected it to.' },
      { id:'h2', title:'Faithful unto death: the martyrs (AD 64–313)', reward:130,
        intro:['“For two hundred and fifty years, to be a Christian could cost you your life. They paid it, and the Church grew.”'],
        teach:()=>`<p class="gm-intro">After the great fire of Rome in <b>AD 64</b>, the emperor <b>Nero</b> blamed the Christians. By old tradition, Peter and Paul were both martyred in Rome in those years.</p>
          <p><b>Polycarp</b>, bishop of Smyrna and a disciple of the apostle John, was burned around <b>AD 155</b>. Told to curse Christ, he answered: <i>“Eighty and six years have I served Him, and He never did me any injury: how then can I blaspheme my King and my Saviour?”</i></p>
          <p>At Carthage in <b>AD 203</b>, the young mother <b>Perpetua</b> and the slave <b>Felicity</b> died together in the arena; Perpetua's own prison diary survives.</p>
          <p>The last and worst was the <b>Great Persecution</b> under the emperor <b>Diocletian</b>, from <b>AD 303</b>: churches burned, Scriptures seized. Yet, as <b>Tertullian</b> had written, “the blood of Christians is seed.”</p>`,
        qs:[['Which emperor blamed Christians for the fire of Rome in AD 64?','Nero','Constantine','Diocletian','Augustus'],['Polycarp was bishop of which city?','Smyrna','Carthage','Antioch','Alexandria'],
          ['“Eighty and six years have I served Him…” — who said it?','Polycarp','Perpetua','Augustine','Arius'],['Perpetua and Felicity died at…','Carthage, AD 203','Rome, AD 64','Smyrna, AD 155','Nicaea, AD 325'],
          ['The Great Persecution began under…','Diocletian, AD 303','Nero, AD 64','Constantine, AD 313','Theodosius, AD 381'],['Tertullian wrote that the blood of Christians is…','seed','wasted','a curse','forgotten']],
        journal:'Polycarp: “Eighty and six years have I served Him, and He never did me any injury.” Mario read it twice. I have been carrying it around all day.' },
      { id:'h3', title:'Constantine and the Council of Nicaea (312–325)', reward:140,
        intro:['“And then, almost overnight, the persecuted Church found an emperor at its door. That brought new trials — of a different kind.”'],
        teach:()=>`<p class="gm-intro">In <b>312</b> Constantine won the Battle of the <b>Milvian Bridge</b>, and in <b>313</b> the <b>Edict of Milan</b> gave Christians freedom of worship. The persecutions were over.</p>
          <p>Soon a priest of Alexandria, <b>Arius</b>, began teaching that the Son of God was a created being — “there was when He was not.” The Church was torn.</p>
          <p>In <b>AD 325</b> the first great council of the whole Church met at <b>Nicaea</b>. It confessed that the Son is “begotten, not made,” <b>of one substance with the Father</b> (in Greek, <span lang="el">ὁμοούσιος</span>, <i>homoousios</i>).</p>
          <p>The young deacon <b>Athanasius</b> of Alexandria spent the rest of his life defending the Nicene faith — exiled <b>five times</b>, never giving way. Hence the saying: <i>Athanasius contra mundum</i>, “Athanasius against the world.”</p>`,
        qs:[['What did the Edict of Milan (313) grant?','freedom of worship for Christians','a new Bible','the end of the Empire','a council at Nicaea'],['What did Arius teach?','that the Son was a created being','that there are three gods','that Jesus was not a man','that Scripture is not needed'],
          ['When did the Council of Nicaea meet?','AD 325','AD 70','AD 451','AD 1054'],['ὁμοούσιος (homoousios) means…','of one substance','of like substance','of no substance','of the same family'],
          ['Who defended the Nicene faith through five exiles?','Athanasius','Arius','Polycarp','Jerome'],['The Creed says the Son is “begotten, not…”','made','loved','sent','known']],
        journal:'Nicaea: the Son is ὁμοούσιος with the Father — of one substance. One Greek word, and a man went into exile five times for it. Mario says some words are worth that.' },
      { id:'h4', title:'The Bible and the Fathers (367–430)', reward:140,
        intro:['“Lucan used to say we copyists stand on the shoulders of these men. Today you meet them.”'],
        teach:()=>`<p class="gm-intro">In his <b>Festal Letter of AD 367</b>, Athanasius listed the books of the New Testament — exactly the <b>twenty-seven</b> we have. The councils of <b>Hippo (393)</b> and <b>Carthage (397)</b> affirmed the same books.</p>
          <p><b>Jerome</b> translated the Scriptures into the Latin of ordinary people — the <b>Vulgate</b>, finished around <b>AD 405</b> — working from the Hebrew for the Old Testament. It became the Bible of the West for a thousand years.</p>
          <p><b>Augustine of Hippo</b> was converted in <b>386</b> in a garden in Milan, hearing a child's voice sing “take up and read”; he opened to <b>Romans 13:13–14</b>. His <b>Confessions</b> begins: <i>“Thou hast made us for Thyself, and our heart is restless until it rests in Thee.”</i> He also wrote <b>The City of God</b>.</p>`,
        qs:[['Whose Festal Letter of 367 lists the 27 books of the New Testament?','Athanasius','Augustine','Jerome','Arius'],['How many books are in the New Testament?','27','39','66','12'],
          ['Jerome\'s Latin translation is called…','the Vulgate','the Septuagint','the Confessions','the Creed'],['Augustine heard “take up and read” and opened to…','Romans 13','John 1','Psalm 23','Genesis 1'],
          ['“Our heart is restless until it rests in Thee” is from…','Augustine\'s Confessions','the Nicene Creed','Jerome\'s Vulgate','Polycarp\'s letter'],['Which councils affirmed the New Testament books in 393 and 397?','Hippo and Carthage','Nicaea and Chalcedon','Jerusalem and Antioch','Milan and Rome']],
        journal:'Augustine: “Our heart is restless until it rests in Thee.” Mario has it painted over the library door upstairs. I had walked under it three times without reading it.' },
      { id:'h5', title:'Councils and the Creed (381–451)', reward:160,
        intro:['“Last lesson for this term. How the Church learned to say, as carefully as human words can, who Christ is.”'],
        teach:()=>`<p class="gm-intro">The <b>Council of Constantinople</b> in <b>381</b> confirmed Nicaea and confessed the full deity of the <b>Holy Spirit</b>: “the Lord and Giver of life, who proceeds from the Father, who with the Father and the Son together is worshipped and glorified.” The creed we call the Nicene Creed is the one completed there.</p>
          <p>But how can Christ be both God and man? The <b>Council of Chalcedon</b> in <b>451</b> answered: one Person, the Lord Jesus Christ, <b>truly God and truly man</b>, made known in <b>two natures</b> — “without confusion, without change, without division, without separation.”</p>
          <p class="gm-note">Mario: “The councils did not invent these truths. They guarded what the apostles had written — the way a wall guards a garden.”</p>`,
        qs:[['The Council of Constantinople (381) especially confessed the deity of…','the Holy Spirit','Mary','the apostles','the emperor'],['In the Creed, the Holy Spirit is called “the Lord and Giver of…”','life','law','light','peace'],
          ['When did the Council of Chalcedon meet?','AD 451','AD 325','AD 381','AD 70'],['Chalcedon confessed Christ as one Person in…','two natures, truly God and truly man','two persons','one nature only','three natures'],
          ['“Without confusion, without change, without division, without separation” describes…','Christ\'s two natures','the books of the Bible','the three persons of God','the four Gospels'],['Mario says the councils…','guarded what the apostles had written','invented new teaching','replaced the Scriptures','ended all disagreement']],
        journal:'Chalcedon: truly God and truly man, without confusion, without change, without division, without separation. Mario says it is a wall round a garden, not the garden itself. The garden is Christ.' } ]} ];
  const COMING=['Old Testament Survey','The Life of Christ','Hermeneutics: reading the Bible well','Biblical Greek III'];
  const allLessons=()=>COURSES.flatMap(c=>c.lessons.map(L=>Object.assign({course:c},L)));
  const courseDone=c=>c.lessons.every(L=>sch().done.includes(L.id));
  const nextIn=c=>c.lessons.find(L=>!sch().done.includes(L.id));

  // ── a lesson's page, then its test ──
  let T=null;
  function lessonSheet(L){ UI.sheet({title:L.course.icon+' '+L.title,html:L.teach()+`<button class="gm-item" data-act="test"><span>✎ I’m ready — test me (5 of 6 to pass)</span></button>`,act:a=>{ if(a==='test') quiz(L); }}); }
  function quiz(L){ const qs=L.qs.slice().sort(()=>Math.random()-0.5).map(q=>{ const opts=q.slice(1).map((t,i)=>[t,i===0]).sort(()=>Math.random()-0.5); return {q:q[0],opts}; }); T={L,qs,i:0,right:0,picked:null}; drawQ(); }
  function drawQ(){ const t=T, q=t.qs[t.i]; let h=`<p class="gm-hint">Question ${t.i+1} of ${t.qs.length}</p><p style="font:600 17px/1.4 Georgia,serif">${q.q}</p>`;
    q.opts.forEach(([txt,ok],i)=>{ const st=t.picked===null?'':ok?'background:rgba(90,180,90,.25);border-color:#6c6':i===t.picked?'background:rgba(200,80,80,.25);border-color:#c66':''; h+=`<button class="gm-item" data-act="o:${i}" style="${st}"><span lang="el">${txt}</span></button>`; });
    if(t.picked!==null) h+=`<button class="gm-item" data-act="next"><span>${t.i+1<t.qs.length?'▶ Next question':'▶ Finish'}</span></button>`;
    UI.sheet({title:'✎ '+t.L.title,html:h,act:a=>{ if(a==='next'){ t.i++; t.picked=null; if(t.i>=t.qs.length) finish(); else drawQ(); return; } if(a.startsWith('o:')&&t.picked===null){ t.picked=+a.slice(2); if(q.opts[t.picked][1]) t.right++; drawQ(); } }}); }
  function finish(){ const t=T, L=t.L, c=sch(), n=t.qs.length, r=t.right; T=null; UI.close(); c.best[L.id]=Math.max(c.best[L.id]||0,r);
    if(r>=5){ const first=!c.done.includes(L.id); if(first){ c.done.push(L.id); const x=GAME.gainXp(L.reward); jw(L.journal,{once:'school:'+L.id,place:'The Tower School'}); if(x&&x.up) setTimeout(()=>UI.toast(`Level ${S().level}! A skill point to spend.`,2400),1800); }
      GAME.changed(); GAME.save(); const nx=nextIn(L.course);
      say([`“${r} of ${n}! ${r===n?'Every one — Lucan would have given you a seat at the copying desk.':'Well done.'}”`,first?`🎓 ${L.title} · +${L.reward} XP`:'',nx?`“Next in ${L.course.name}: ${nx.title}.”`:`“That completes ${L.course.name} — for this term.”`].filter(Boolean),()=>checkCert()); }
    else { GAME.save(); say([`“${r} of ${n}. Five to pass — not yet. Read the page again; it will come.”`]); } }
  function checkCert(){ const c=sch(); if(c.cert||!COURSES.every(courseDone)) return; c.cert=true; GAME.save();
    setTimeout(()=>say(['Mario rummages in a chest and comes up with a long roll of parchment, tied in green ribbon.','“By the authority of nobody in particular — except an old scribe who loves you —”','“— the Schola Verbi certifies that this knight has completed Biblical Greek II and Church History, and may read the Word in the tongue it was written in, and knows the story of those who carried it.”','“Now. There are more courses to write. And you, I think, have people to teach.”'],()=>{
      const x=GAME.gainXp(800); GAME.changed(); GAME.save(); UI.toast('📜 Certificate of the Schola Verbi · +800 XP',3400);
      jw('Mario gave me a certificate from the Schola Verbi, tied in green ribbon: Biblical Greek II and Church History. He said I have people to teach now. I think he is right.',{once:'school:cert',place:'The Tower School'}); }),400); }
  function transcript(){ const c=sch(); let h=`<p class="gm-intro">Schola Verbi — the School of the Word. Transcript.</p>`;
    h+=`<div class="gm-sec">📜 Biblical Greek I <span class="ds">(with Mario, in the hut)</span></div>`; if(typeof GREEK!=='undefined') h+=`<p class="gm-hint">${(GREEK.st().done||[]).length} of ${GREEK.lessons.length} lessons ✓</p>`;
    COURSES.forEach(C=>{ h+=`<div class="gm-sec">${C.icon} ${C.name} ${courseDone(C)?'✓':''}</div>`; C.lessons.forEach(L=>{ const d=c.done.includes(L.id); h+=`<p class="gm-hint">${d?'✓':'·'} ${UI.esc(L.title)} ${c.best[L.id]!==undefined?`<span class="ds">best ${c.best[L.id]}/6</span>`:''}</p>`; }); });
    h+=c.cert?`<p class="gm-note">🎓 Certificate of the Schola Verbi — awarded.</p>`:`<p class="gm-hint">Finish both courses for the school’s certificate.</p>`;
    h+=`<div class="gm-sec">Coming soon</div>`+COMING.map(n=>`<p class="gm-hint">· ${n}</p>`).join('');
    UI.sheet({title:'🎓 Transcript',html:h}); }
  function talk(){ const c=sch(); let h=`<p class="gm-intro">Old Man Mario sets down his chalk. “Which shall it be today?”</p>`;
    COURSES.forEach((C,ci)=>{ const nx=nextIn(C), n=C.lessons.filter(L=>c.done.includes(L.id)).length; h+=`<div class="gm-sec">${C.icon} ${C.name} <span class="ds">${n} of ${C.lessons.length}</span></div>`;
      if(nx) h+=`<button class="gm-item" data-act="next:${ci}"><span>▶ ${UI.esc(nx.title)}</span></button>`; else h+=`<p class="gm-hint">✓ Course complete.</p>`;
      C.lessons.forEach((L,li)=>{ if(c.done.includes(L.id)) h+=`<button class="gm-item" data-act="re:${ci}:${li}"><span>✓ ${UI.esc(L.title)} <span class="ds">study again · best ${c.best[L.id]||0}/6</span></span></button>`; }); });
    if(typeof GREEK!=='undefined') h+=`<div class="gm-sec">📜 Biblical Greek I</div><button class="gm-item" data-act="g1"><span>Review your lessons, manuscripts and practice</span></button>`;
    h+=`<button class="gm-item" data-act="tr"><span>🎓 Your transcript</span></button>`;
    UI.sheet({title:'🏛 Schola Verbi',html:h,act:a=>{ if(a==='tr'){ transcript(); return; } if(a==='g1'){ UI.close(); setTimeout(()=>GREEK.talk(),200); return; }
      if(a.startsWith('next:')){ const C=COURSES[+a.slice(5)], L=Object.assign({course:C},nextIn(C)); UI.close(); say(L.intro,()=>lessonSheet(L)); return; }
      if(a.startsWith('re:')){ const [ci,li]=a.slice(3).split(':').map(Number), C=COURSES[ci]; lessonSheet(Object.assign({course:C},C.lessons[li])); } }}); }
  return { gate, open, greekDone, moved:()=>open(), courses:COURSES, talk, transcript, st:sch };
})();
