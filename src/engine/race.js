// ════════════════════════════════════════════════════════════════
//  THE KING'S TOURNEY — the steeplechase (KLK module "THE STEEPLECHASE", tag 2026-10-07-sc).
//  Physics are the game's, line for line, in course units: canter at 0.80 of top, URGE once per
//  stride (perfect ±0.06 +15%, good ±0.14 +10%, off-beat ×0.97), stamina and second wind,
//  drafting, the take-off line 24 before each fence, refusals, splashes, rails, and three
//  rivals at fixed PACE[tier] who ease off for tight turns. Drawn in 3D at S units per world unit.
//  raceLevel({id, course:'stormgate', exit}) → level
// ════════════════════════════════════════════════════════════════
function raceLevel(spec){
  const SC=SYS.SC, COURSE=SC.courses.find(c=>c.key===spec.course), PERFECT=SC.perfect, GOOD=SC.good, TAKEOFF=SC.takeoff, TAU=Math.PI*2, s=0.08;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), ang=a=>{ while(a>Math.PI) a-=TAU; while(a<-Math.PI) a+=TAU; return a; };
  const h32=(x,y)=>{ let h=(x*374761393+y*668265263)>>>0; h=(h^(h>>>13))*1274126177>>>0; return (h^(h>>>16))>>>0; };
  // ── the course, as build() makes it ──
  function buildLine(sp){ const P=sp.points, n=P.length, line=[];
    const cr=(p0,p1,p2,p3,t)=>{ const t2=t*t,t3=t2*t; return [0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
      0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]; };
    for(let i=0;i<n;i++){ const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n]; for(let k=0;k<24;k++) line.push(cr(p0,p1,p2,p3,k/24)); }
    const dist=[0]; for(let i=1;i<=line.length;i++){ const a=line[i-1],b=line[i%line.length]; dist.push(dist[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1])); }
    return {line,dist,len:dist[line.length]}; }
  function pointAt(C,d){ d=((d%C.len)+C.len)%C.len; let lo=0,hi=C.line.length; while(hi-lo>1){ const m=(lo+hi)>>1; if(C.dist[m]<=d) lo=m; else hi=m; }
    const a=C.line[lo], b=C.line[(lo+1)%C.line.length], t=(d-C.dist[lo])/((C.dist[lo+1]-C.dist[lo])||1); return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,ang:Math.atan2(b[1]-a[1],b[0]-a[0]),i:lo}; }
  function near(C,x,y,i0){ const N=C.line.length; let best=1e18,bi=i0,bt=0;
    for(let k=-12;k<=24;k++){ const i=((i0+k)%N+N)%N, a=C.line[i], b=C.line[(i+1)%N], dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy||1;
      const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/l2,0,1), qx=a[0]+dx*t, qy=a[1]+dy*t, d2=(x-qx)*(x-qx)+(y-qy)*(y-qy); if(d2<best){ best=d2; bi=i; bt=t; } }
    const a2=C.line[bi], b2=C.line[(bi+1)%N], an=Math.atan2(b2[1]-a2[1],b2[0]-a2[0]);
    return {i:bi,d:C.dist[bi]+(C.dist[bi+1]-C.dist[bi])*bt,lat:(x-a2[0])*(-Math.sin(an))+(y-a2[1])*Math.cos(an),ang:an}; }
  const L=buildLine(COURSE), C={spec:COURSE,line:L.line,dist:L.dist,len:L.len,W:COURSE.width};
  C.jumps=COURSE.jumps.map((J,k)=>{ const d=J[0]*L.len, p=pointAt(L,d); return {n:k+1,d,kind:J[1],x:p.x,y:p.y,ang:p.ang}; });
  { const N=C.line.length, rad=[]; for(let i=0;i<N;i++){ const A=C.line[(i-2+N)%N],B4=C.line[i],D=C.line[(i+2)%N], ab=Math.hypot(B4[0]-A[0],B4[1]-A[1]), bc=Math.hypot(D[0]-B4[0],D[1]-B4[1]), ca=Math.hypot(A[0]-D[0],A[1]-D[1]);
      const ar=Math.abs((B4[0]-A[0])*(D[1]-A[1])-(B4[1]-A[1])*(D[0]-A[0]))/2; rad.push(ar<1e-6?1e6:ab*bc*ca/(4*ar)); }
    C.rad=rad.map((_,i)=>{ let m=1e6; for(let j=0;j<=6;j++) m=Math.min(m,rad[(i+j)%N]); return m; }); }

  // ── the scene ──
  const pal=COURSE.pal, scene=new THREE.Scene(); scene.background=new THREE.Color(hexn(pal.sky)); scene.fog=new THREE.Fog(hexn(pal.skyLow),60,170);
  const lv={id:spec.id,name:'The King’s Tourney',scene,anim:[],folk:[],spots:[],cam:{pitch:0.3,dist:6,min:6,max:6},zone:()=>COURSE.name};
  scene.add(new THREE.HemisphereLight(0xe8f2ff,0x4a6a3a,0.7)); const sun=new THREE.DirectionalLight(hexn(pal.sun),0.85); sun.position.set(-40,60,30); sun.castShadow=true; sun.shadow.mapSize.set(1536,1536);
  Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:160}); scene.add(sun,sun.target);
  { const S=2048, cnv=document.createElement('canvas'); cnv.width=cnv.height=S; const g=cnv.getContext('2d'), N=C.line.length, line=C.line, W=C.W;
    g.fillStyle=pal.meadow; g.fillRect(0,0,S,S);
    for(let y=0;y<S;y+=8) for(let x=0;x<S;x+=8){ const h=h32(x,y); if(h%5===0){ g.fillStyle=h%3?pal.meadowA:pal.meadowB; g.fillRect(x+(h>>>4)%4,y+(h>>>8)%4,3,2); } if(h%97===0){ g.fillStyle=pal.flowers[(h>>>3)%pal.flowers.length]; g.fillRect(x,y,2,2); } }
    (COURSE.ponds||[]).forEach(P=>{ g.fillStyle='#3a7ab4'; g.beginPath(); g.ellipse(P[0],P[1],P[2],P[2]*0.7,0,0,TAU); g.fill(); g.fillStyle='#5a9ad0'; g.beginPath(); g.ellipse(P[0]-P[2]*0.2,P[1]-P[2]*0.15,P[2]*0.5,P[2]*0.3,0,0,TAU); g.fill(); });
    g.lineJoin='round'; g.lineCap='round'; g.beginPath(); line.forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.strokeStyle=pal.turfEdge; g.lineWidth=W+10; g.stroke(); g.strokeStyle=pal.turf; g.lineWidth=W; g.stroke();
    for(let i=0;i<N;i+=2){ if((i>>1)%4>=2) continue; const a=line[i], b=line[(i+1)%N], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l;
      g.strokeStyle='rgba(255,255,255,.07)'; g.lineWidth=l*2.2; g.beginPath(); g.moveTo(a[0]-nx*W/2,a[1]-ny*W/2); g.lineTo(a[0]+nx*W/2,a[1]+ny*W/2); g.stroke(); }
    { const a=line[0], b=line[1], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy), nx=-dy/l, ny=dx/l; for(let s2=-W/2;s2<W/2;s2+=6) for(let r=0;r<2;r++){ g.fillStyle=((Math.floor((s2+W)/6)+r)%2)?'#1a1320':'#f4eede'; g.fillRect(Math.round(a[0]+nx*s2+dx/l*r*6),Math.round(a[1]+ny*s2+dy/l*r*6),6,6); } }
    C.jumps.forEach(j=>{ const nx=-Math.sin(j.ang), ny=Math.cos(j.ang), fx=Math.cos(j.ang), fy=Math.sin(j.ang);
      const quad=(d0,d1,col)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(j.x+fx*d0-nx*W/2,j.y+fy*d0-ny*W/2); g.lineTo(j.x+fx*d0+nx*W/2,j.y+fy*d0+ny*W/2); g.lineTo(j.x+fx*d1+nx*W/2,j.y+fy*d1+ny*W/2); g.lineTo(j.x+fx*d1-nx*W/2,j.y+fy*d1-ny*W/2); g.fill(); };
      if(j.kind==='water'){ quad(2,22,'#3a7ab4'); quad(4,8,'#6aaae0'); } if(j.kind==='ditch'){ quad(2,12,'#4a3a2a'); quad(2,4,'#2a2018'); } quad(-TAKEOFF-1.5,-TAKEOFF+1.5,'rgba(255,255,255,.85)'); });
    const tex=new THREE.CanvasTexture(cnv); tex.anisotropy=8; const gnd=new THREE.Mesh(new THREE.PlaneGeometry(S*s,S*s),new THREE.MeshLambertMaterial({map:tex}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(S*s/2,0,S*s/2); gnd.receiveShadow=true; scene.add(gnd);
    const far=new THREE.Mesh(new THREE.PlaneGeometry(800,800),lam(hexn(pal.meadow))); far.rotation.x=-Math.PI/2; far.position.set(S*s/2,-0.02,S*s/2); scene.add(far);
    // white rails both sides, as posts and a top rail
    const posts=[], rails=[]; for(const sd of [-1,1]) for(let i=0;i<N;i++){ const p=line[i], q=line[(i+1)%N], dx=q[0]-p[0], dy=q[1]-p[1], l=Math.hypot(dx,dy)||1;
      const X=p[0]-dy/l*sd*(W/2+3), Y=p[1]+dx/l*sd*(W/2+3); const p2=line[(i+1)%N], q2=line[(i+2)%N], dx2=q2[0]-p2[0], dy2=q2[1]-p2[1], l2=Math.hypot(dx2,dy2)||1, X2=p2[0]-dy2/l2*sd*(W/2+3), Y2=p2[1]+dx2/l2*sd*(W/2+3);
      if(i%3===0) posts.push([X*s,Y*s]); rails.push([X*s,Y*s,X2*s,Y2*s]); }
    inst(posts,new THREE.BoxGeometry(0.1,0.9,0.1).translate(0,0.45,0),flat(0xf4eede),([x,z],m)=>m.setPosition(x,0,z),scene,true);
    inst(rails,new THREE.BoxGeometry(1,0.08,0.06),flat(0xf4eede),([x,z,x2,z2],m)=>{ const l=Math.hypot(x2-x,z2-z), a=Math.atan2(z2-z,x2-x); m.makeRotationY(-a); m.scale(new THREE.Vector3(l,1,1)); m.setPosition((x+x2)/2,0.82,(z+z2)/2); },scene,true); }
  // fences standing up across the turf, white wings at each end
  C.jumps.forEach(j=>{ const g=group(j.x*s,0,j.y*s,scene), w=C.W*s; g.rotation.y=-j.ang+Math.PI/2;
    if(j.kind==='hedge'){ B(w,1.05,0.7,0x3f7a3a,0,0,0,g); B(w,0.12,0.75,0x4f8a44,0,1.0,0,g); }
    else if(j.kind==='rails'){ [0.35,0.65,0.95].forEach(h=>B(w,0.1,0.1,0xf4eede,0,h,0,g)); for(let x=-w/2;x<=w/2;x+=w/4) B(0.1,1.05,0.1,0xf4eede,x,0,0,g); }
    else if(j.kind==='wall'){ B(w,0.95,0.6,0xa8a49b,0,0,0,g); }
    else { B(w,0.42,0.5,0x6a5a32,0,0,-0.4,g); }
    [-1,1].forEach(sd=>{ B(0.12,1.5,1.2,0xffffff,sd*(w/2+0.1),0,0,g); }); shade(g); });
  // trees, topiary and banners off the turf; the royal park's city on the skyline
  { const N=C.line.length, list=[]; for(let i=0;i<N;i+=4){ const a=C.line[i], b=C.line[(i+1)%N], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l, h=h32(i,7);
      const side=(h&1)?1:-1, off=C.W/2+34+(h>>>3)%100, tx=a[0]+nx*side*off, ty=a[1]+ny*side*off; let ok=true;
      for(let j=0;j<N;j+=3){ const q=C.line[j]; if(Math.hypot(q[0]-tx,q[1]-ty)<C.W/2+22){ ok=false; break; } }
      (COURSE.ponds||[]).forEach(P=>{ if(Math.hypot(P[0]-tx,(P[1]-ty)/0.7)<P[2]+12) ok=false; }); if(ok) list.push([tx*s,ty*s,COURSE.trees[(h>>>9)%COURSE.trees.length]]); }
    list.forEach(([x,z,k])=>{ const g=group(x,0,z,scene);
      if(k==='topiary'){ Cy(0.35,0.3,0.4,8,0xa0583a,0,0,0,g); Sp(0.55,0x3f8a4e,0,0.9,0,g); Sp(0.38,0x4a9a58,0,1.6,0,g); }
      else if(k==='oak'){ Cy(0.18,0.25,1.6,7,0x5b3a1f,0,0,0,g); const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,0),flat(0x3a7a3a)); cr.position.y=2.4; g.add(cr); }
      else { Cy(0.06,0.06,3.4,6,0x5a3c20,0,0,0,g); B(0.04,1.0,0.7,0x2a4a9a,0,2.2,0.36,g); B(0.05,0.15,0.72,0xd8b04a,0,3.05,0.36,g); }
      shade(g); });
    const cx=1050*s, cz=380*s, city=group(cx,0,cz,scene); B(70,6,2,0x8d919b,0,0,0,city); for(let i=-3;i<=3;i++){ Cy(1.8,2,10,8,0x9ba0aa,i*11,0,0,city); Co(2.4,4,8,0x4a6ab0,i*11,10,0,city); }
    B(14,14,8,0xa8a49b,0,0,-8,city); Co(4,6,4,0x4a6ab0,0,14,-8,city); B(0.3,3,0.3,0xf2c14e,0,20,-8,city); }

  // ── state and the riders ──
  let R=null, bank={gold:0,item:null}, sel=0, mounts=[], courseRec=()=>GAME.S.raceRecords[COURSE.key]||SC.par[COURSE.key];
  const hud=$('hudMg'), callEl=$('call'); let callT=0;
  function call(P,txt,col){ P.callout=txt; P.calloutT=1.1; callEl.textContent=txt; callEl.style.color=col||'#f4d878'; callEl.style.opacity=1; callT=1.1; }
  function ownSteed(){ const S=GAME.S; if(!S.pet||S.pet.form<2) return null; const st=SC.steeds[S.pet.id]; if(!st) return null; return Object.assign({id:'own',name:SYS.PETS[S.pet.id].forms[2].name,blurb:st.blurb,silk:'#3b6fd4',silk2:'#f2c14e'},st); }
  function picker(){ R=null; mounts=(ownSteed()?[ownSteed()]:[]).concat(SC.mounts); sel=Math.min(sel,mounts.length-1);
    const bar=(v,c)=>`<span style="display:inline-block;width:60px;height:6px;background:#2a2430;border-radius:3px;vertical-align:middle"><span style="display:block;height:100%;width:${Math.round(v*100)}%;background:${c};border-radius:3px"></span></span>`;
    let h=`<p class="gm-intro"><b>${UI.esc(COURSE.name)}</b> — ${UI.esc(COURSE.feel)}. ${COURSE.laps} laps · ${COURSE.jumps.length} fences · record <b style="color:var(--gold)">${fmt(courseRec())}</b>${GAME.S.raceRecords[COURSE.key]?'':' (par)'}.</p><div class="gm-sec">Choose your mount</div>`;
    mounts.forEach((m,i)=>h+=`<button class="gm-item ${i===sel?'worn':''}" data-act="m:${i}"><span><b>${UI.esc(m.name)}</b> <span class="ds">${UI.esc(m.blurb||'')}</span><br><span class="ds">speed ${bar(m.speed,'#e0b040')} stamina ${bar(m.stamina,'#5fd36a')} jump ${bar(m.jump,'#6aaae0')}</span></span>${i===sel?'<i>riding</i>':''}</button>`);
    if(!ownSteed()) h+='<p class="gm-hint">Your companion can carry you once it reaches its final form (level 12).</p>';
    h+='<p class="gm-hint">Steer with the stick. Tap URGE once a stride as the gold mark crosses the green. Tap JUMP as you cross the white take-off line before each fence. Ease off to get your breath back; ride close behind a rival to draft.</p>';
    h+=`<button class="gm-btn" data-act="go">🏁 Ride</button><button class="gm-btn" data-act="leave">Leave the grounds</button>`;
    UI.sheet({title:'🐎 The King’s Tourney',html:h,noClose:true,act:a=>{ if(a==='go'){ UI.close(); begin(); } else if(a==='leave'){ UI.close(); leave(); } else { sel=+a.split(':')[1]; picker(); } }}); }
  const fmt=ms=>{ const t=ms/1000; return Math.floor(t/60)+':'+(t%60).toFixed(2).padStart(5,'0'); };
  let meM=null, rivM=[];
  function begin(){ const m=mounts[sel], top=120+50*m.speed, pace=SC.pace[COURSE.tier]||SC.pace[1], grid=[[-18,-20],[-18,22],[-44,-30]], meD=-44, meLane=14;
    const riders=SC.mounts.filter(x=>x.id!==m.id).slice(0,3);
    rivM.forEach(r=>scene.remove(r)); if(meM) scene.remove(meM);
    const K=ENGINE.K; K.rotation.set(0,0,0); K.position.set(0,0,0); meM=horseModel(m,K); scene.add(meM);
    rivM=riders.map(h=>{ const g=horseModel(h,jockey(h)); scene.add(g); return g; });
    const rivals=riders.map((h,k)=>{ const p=pointAt(C,grid[k][0]); return {mount:h,prog:grid[k][0],lane0:grid[k][1],lane:grid[k][1],v:0,pace:150*pace[k],x:p.x-Math.sin(p.ang)*grid[k][1],y:p.y+Math.cos(p.ang)*grid[k][1],ang:p.ang,finished:false,place:0,lap:1,air:0,stride:k*0.3}; });
    const p0=pointAt(C,meD);
    R={mount:m,top,rivals,finishOrder:[],laps:COURSE.laps,total:C.len*COURSE.laps,t:0,phase:'countdown',count:3,countT:0,camAng:p0.ang,bank,
      stats:{perfect:0,good:0,miss:0,clean:0,bad:0,hit:0,draft:0},
      P:{x:p0.x-Math.sin(p0.ang)*meLane,y:p0.y+Math.cos(p0.ang)*meLane,h:p0.ang,v:0,lean:0,prog:meD,idx:p0.i,lap:1,stamina:1,tired:false,sinceUrge:9,ph:0.75,lastTap:-1,air:0,stagger:0,jumpsDone:{},draft:false,place:4,finished:false}};
    call(R.P,'3','#fff2c8'); }
  const strideLen=()=>0.62-0.08*R.mount.speed;
  function urge(){ const P=R.P, top=R.top, cyc=Math.floor(P.ph), f=P.ph-cyc, e=Math.min(f,1-f), tgt=f>0.5?cyc+1:cyc;
    if(tgt===P.lastTap) return; P.lastTap=tgt; P.sinceUrge=0;
    if(P.tired||P.stamina<0.03){ call(P,'TOO TIRED — EASE OFF','#e0563a'); return; } const cost=P.draft?0.5:1;
    if(e>GOOD){ P.v*=0.97; P.stamina=Math.max(0,P.stamina-0.03*cost); R.stats.miss++; call(P,'BROKE STRIDE','#e0563a'); }
    else if(e<=PERFECT){ P.v=Math.min(top*1.18,P.v+top*0.15); P.stamina=Math.max(0,P.stamina-0.05*cost); R.stats.perfect++; call(P,'PERFECT STRIDE!','#fff2c8'); }
    else { P.v=Math.min(top*1.18,P.v+top*0.10); P.stamina=Math.max(0,P.stamina-0.06*cost); R.stats.good++; call(P,'GOOD STRIDE!','#5fd36a'); }
    if(P.stamina<=0.0001){ P.tired=true; call(P,'OUT OF BREATH!','#e0563a'); } }
  function nextJumpAhead(P,lim){ let best=null,bd=1e9; C.jumps.forEach(j=>{ const lapBase=Math.floor(P.prog/C.len)*C.len; let d=lapBase+j.d; if(d<P.prog-8) d+=C.len;
      const key=j.n+':'+Math.floor(d/C.len); if(P.jumpsDone[key]) return; const ahead=d-P.prog; if(ahead<bd&&ahead<lim){ bd=ahead; best={j,d,key}; } }); return best; }
  function jump(){ const P=R.P; if(P.air>0) return; const J=nextJumpAhead(P,140), win=0.06+0.08*R.mount.jump;
    if(!J){ P.air=0.32; P.stamina=Math.max(0,P.stamina-0.02); return; }
    const e=((J.d-TAKEOFF)-P.prog)/Math.max(30,P.v); P.air=0.45;
    if(Math.abs(e)<=win*0.45){ P.jumpsDone[J.key]='clean'; P.v*=1.05; R.stats.clean++; call(P,'PERFECT JUMP!','#fff2c8'); }
    else if(Math.abs(e)<=win){ P.jumpsDone[J.key]='clean'; R.stats.clean++; call(P,'CLEAN JUMP!','#5fd36a'); }
    else if(e>0){ P.v*=0.8; R.stats.bad++; call(P,'TOO EARLY!','#f0a050'); }
    else { P.jumpsDone[J.key]='late'; P.v*=0.7; R.stats.bad++; call(P,'TOO LATE — SCRAMBLED OVER','#f0a050'); } }
  function step(dt,inp){ const P=R.P, top=R.top;
    if(R.phase==='countdown'){ R.countT+=dt; if(R.countT>=0.8){ R.countT=0; R.count--; if(R.count<=0){ R.phase='race'; call(P,'THEY’RE OFF!','#fff2c8'); } else call(P,String(R.count),'#fff2c8'); } return; }
    if(R.phase!=='race') return; R.t+=dt;
    if(inp.pressed.A) urge(); if(inp.pressed.B) jump();
    const steer=(P.air>0||P.stagger>0)?0:Math.sign(Math.round(inp.x*1.4)); P.lean+=(steer-P.lean)*Math.min(1,dt*8);
    P.h=ang(P.h+steer*1.6*(0.55+0.45*Math.min(1,P.v/(top*0.6)))*dt);
    const N=near(C,P.x,P.y,P.idx); P.idx=N.i; P.lat=N.lat;
    P.draft=false; for(const rv of R.rivals){ const gap=rv.prog-P.prog; if(gap>6&&gap<48&&Math.abs(rv.lane-N.lat)<14){ P.draft=true; break; } } if(P.draft) R.stats.draft+=dt;
    P.sinceUrge+=dt; if(P.sinceUrge>0.6) P.stamina=Math.min(1,P.stamina+dt*0.10*(0.6+0.8*R.mount.stamina)*(P.draft?2:1));
    if(P.tired&&P.stamina>=0.3){ P.tired=false; call(P,'SECOND WIND','#5fd36a'); }
    let cruise=top*(P.tired?0.72:0.8)*(steer?0.93:1)*(P.draft?1.03:1); if(P.stagger>0){ P.stagger-=dt; cruise*=0.5; }
    P.v+=(cruise-P.v)*Math.min(1,dt*(P.v>cruise?0.9:0.7)); P.ph+=dt/strideLen(); if(P.air>0) P.air-=dt;
    P.x+=Math.cos(P.h)*P.v*dt; P.y+=Math.sin(P.h)*P.v*dt;
    const lim=C.W/2-4; if(Math.abs(N.lat)>lim){ const out=Math.abs(N.lat)-lim; P.x-=-Math.sin(N.ang)*Math.sign(N.lat)*out; P.y-=Math.cos(N.ang)*Math.sign(N.lat)*out; P.v*=0.985; }
    const N2=near(C,P.x,P.y,P.idx); let dd=N2.d-(((P.prog%C.len)+C.len)%C.len); if(dd<-C.len/2) dd+=C.len; if(dd>C.len/2) dd-=C.len;
    const was=P.prog; P.prog+=dd; P.idx=N2.i;
    C.jumps.forEach(j=>{ const d=Math.floor(was/C.len)*C.len+j.d, key=j.n+':'+Math.floor(d/C.len);
      if(was<d-4&&P.prog>=d-4&&!P.jumpsDone[key]){ P.jumpsDone[key]='hit'; R.stats.hit++; if(P.air>0){ P.jumpsDone[key]='clean'; R.stats.hit--; return; }
        if(j.kind==='water'){ P.v*=0.45; call(P,'SPLASH!','#6aaae0'); } else if(j.kind==='ditch'){ P.v*=0.5; call(P,'STUMBLED IN THE DITCH','#f0a050'); } else { P.v*=0.35; P.stagger=0.5; call(P,'REFUSED!','#e0563a'); } } });
    const lap=clamp(Math.floor(P.prog/C.len)+1,1,R.laps); if(lap>P.lap){ P.lap=lap; call(P,'LAP '+lap+'!','#fff2c8'); }
    R.rivals.forEach((r,i)=>{ if(r.finished) return; const rp=pointAt(C,r.prog), cap=1.6*(C.rad[rp.i]+C.W*0.35);
      r.v+=(Math.min(r.pace,cap)-r.v)*Math.min(1,dt*0.8); const rw=r.prog; r.prog+=r.v*dt; r.lane=r.lane0+Math.sin(R.t*0.4+i*2)*6; r.stride+=dt/0.56; if(r.air>0) r.air-=dt;
      C.jumps.forEach(j=>{ const d=Math.floor(rw/C.len)*C.len+j.d; if(rw<d-TAKEOFF&&r.prog>=d-TAKEOFF){ r.air=0.45; r.v*=0.94; } });
      const q=pointAt(C,r.prog); r.x=q.x-Math.sin(q.ang)*r.lane; r.y=q.y+Math.cos(q.ang)*r.lane; r.ang=q.ang;
      const bd=Math.hypot(P.x-r.x,P.y-r.y); if(bd<12&&P.air<=0&&r.air<=0){ const bx=(P.x-r.x)/(bd||1), by=(P.y-r.y)/(bd||1); P.x=r.x+bx*12; P.y=r.y+by*12; P.v*=0.97; r.v*=0.97; }
      r.lap=clamp(Math.floor(r.prog/C.len)+1,1,R.laps); if(r.prog>=R.total&&!r.finished){ r.finished=true; R.finishOrder.push(r); r.place=R.finishOrder.length; } });
    if(P.prog>=R.total&&!P.finished){ P.finished=true; R.finishOrder.push(P); P.place=R.finishOrder.length; finish(); return; }
    let ahead=0; R.rivals.forEach(rr=>{ if(rr.finished||rr.prog>P.prog) ahead++; }); P.place=ahead+1;
    R.camAng=ang(R.camAng+ang(P.h-R.camAng)*Math.min(1,dt*5)); }
  function finish(){ const P=R.P, key=COURSE.key, ms=Math.round(R.t*1000), rec=courseRec(), beat=ms<rec, S=GAME.S;
    const gold=Math.round(({1:250,2:140,3:75}[P.place]||0)*(1+(COURSE.tier-1)*0.3)); let item=null;
    if(beat){ S.raceRecords[key]=ms; if(!S.raceBarding){ item='Seraph’s Pet Barding'; S.raceBarding=true; } }
    R.bank.gold+=gold; if(item) R.bank.item=item; R.phase='finish'; GAME.changed();
    const ord=['1st','2nd','3rd','4th'][P.place-1], st=R.stats;
    UI.sheet({title:P.place===1?'🏆 Victory!':'🏁 Finished '+ord,holdMs:1200,noClose:true,html:`<div class="card ${P.place>3?'lost':''}"><h3>${ord} place</h3><p>${fmt(ms)} · record ${fmt(beat?ms:rec)}${beat?' — <b style="color:var(--gold)">NEW RECORD!</b>':''}</p>
      <p class="gm-hint">Strides: ${st.perfect} perfect · ${st.good} good · ${st.miss} broken. Fences: ${st.clean} clean · ${st.bad} untidy · ${st.hit} not jumped. Drafting ${st.draft.toFixed(1)}s.</p>
      <p>${gold?`<b style="color:var(--gold)">+${gold} gold</b> banked`:'No purse this time'}${item?` · won <b>${item}</b>`:''}. Winnings so far: <b style="color:var(--gold)">${R.bank.gold}g</b>, paid when you leave.</p></div>
      <button class="gm-btn" data-act="again">Ride again</button><button class="gm-btn" data-act="leave">Collect & leave</button>`,act:a=>{ UI.close(); if(a==='again') picker(); else leave(); }}); }
  function leave(){ const b=bank; if(b.gold){ GAME.addGold(b.gold); UI.toast(`+${b.gold} gold from the King’s Tourney`,2400); } R=null; GAME.save(); hud.hidden=true; callEl.style.opacity=0; ENGINE.go(spec.exit.level,spec.exit.spawn); }
  // ── drawing and the camera ──
  const W3=new THREE.Vector3(), T3=new THREE.Vector3();
  lv.custom={ buttons:[{id:'B',label:'JUMP'},{id:'A',label:'URGE',big:true}], knight:false, pet:false,
    onEnter(){ hud.hidden=false; hud.innerHTML=''; R=null; bank={gold:0,item:null}; picker(); },
    tick(dt,t,inp){ if(callT>0){ callT-=dt; if(callT<=0) callEl.style.opacity=0; } if(!R){ hud.innerHTML=''; return; }
      step(dt,inp); const P=R.P;
      meM.position.set(P.x*s,0,P.y*s); meM.rotation.y=-P.h+Math.PI/2; meM.rotation.z=-P.lean*0.12; meM.userData.gallop(t,P.v/R.top,P.air);
      R.rivals.forEach((r,i)=>{ const g=rivM[i]; g.position.set(r.x*s,0,r.y*s); g.rotation.y=-r.ang+Math.PI/2; g.userData.gallop(t+i,r.v/150,r.air); });
      ENGINE.K.animate(dt,'idle'); sun.position.set(P.x*s-30,60,P.y*s+20); sun.target.position.set(P.x*s,0,P.y*s);
      const f=P.ph-Math.floor(P.ph), nj=nextJumpAhead(P,1e9), ord=['1st','2nd','3rd','4th'][P.place-1];
      hud.innerHTML=`<div class="bars"><div class="bar"><small>LAP ${P.lap}/${R.laps} · ${ord} · ${fmt(R.t*1000)}</small><div class="meter"><i style="left:0;width:${(P.stamina*100).toFixed(0)}%;background:${P.tired?'#e0563a':P.draft?'#6aaae0':'#5fd36a'}"></i></div></div></div>
        <div class="meter" style="height:14px"><i style="left:0;width:${GOOD*100}%;background:#2f7a3a"></i><i style="right:0;width:${GOOD*100}%;background:#2f7a3a"></i><i style="left:0;width:${PERFECT*100}%;background:#bff5c4"></i><i style="right:0;width:${PERFECT*100}%;background:#bff5c4"></i><i style="left:calc(${(f*100).toFixed(1)}% - 2px);width:4px;background:#f2c14e"></i></div>
        <small style="display:block;margin-top:4px">${P.draft?'DRAFTING · ':''}${nj?'NEXT FENCE: '+nj.j.kind.toUpperCase()+' · '+Math.max(0,Math.round(nj.d-TAKEOFF-P.prog))+' to the line':''}</small>`; },
    camera(cam,dt){ if(!R){ cam.position.set(C.line[0][0]*s-6,8,C.line[0][1]*s+10); cam.lookAt(C.line[0][0]*s,0,C.line[0][1]*s); return; }
      const P=R.P, a=R.camAng; W3.set(P.x*s-Math.cos(a)*7,3.4,P.y*s-Math.sin(a)*7); cam.position.lerp(W3,Math.min(1,dt*6)); T3.set(P.x*s+Math.cos(a)*6,1.2,P.y*s+Math.sin(a)*6); cam.lookAt(T3); } };
  lv.spawn={x:0,z:0}; lv.ground=()=>0;
  return lv; }
