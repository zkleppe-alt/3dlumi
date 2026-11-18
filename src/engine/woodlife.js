// ════════════════════════════════════════════════════════════════
//  THE LIVING WOODS (V230). The tall woods of the open world are lived in:
//   · WILDLIFE under the trees: deer and stags (the rigged CC0 models, through ANIM3), rabbits, a red fox now and then,
//     and little flocks of birds pecking at the leaf-litter. They're spawned a little way off as you walk the woods and
//     let go when you're far. Come close and they bolt — the birds go up through the canopy and away.
//   · SMALL FINDS, deep in: two dozen places set once for the whole realm (always the same ones), at least forty
//     paces apart — scripture stones cut with a verse of the trees, keepsake chests someone hid long ago, and ruined
//     wayside shrines where you can kneel and be mended. Each is built only while you're near.
//   · THE HERMIT'S GLADE: the walled-off meadow by the southern sea, behind its belt of wood, is a hidden place now —
//     a ruined hermitage with its overgrown garden, a still pool under a little fall of water, an ancient oak, deer
//     grazing without fear among the stones, and butterflies over the flowers.
//  WOODLIFE.attach(world). State: GAME.S.woodFinds = {<id>:true}, GAME.S.glade = {saw, chest, stone, rest}.
// ════════════════════════════════════════════════════════════════
const WOODLIFE=(function(){
  const S=()=>GAME.S, finds=()=>{ const s=S(); return s.woodFinds=s.woodFinds||{}; }, glade=()=>{ const s=S(); return s.glade=s.glade||{}; };
  const rnd=Math.random, pick=a=>a[Math.floor(rnd()*a.length)], TAU=Math.PI*2;
  const jw=(t,o)=>{ if(typeof JOURNAL!=='undefined') JOURNAL.write(t,o); };
  const VERSES=[
    ['“And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither.”','Psalm 1:3'],
    ['“Let the field be joyful, and all that is therein: then shall all the trees of the wood rejoice.”','Psalm 96:12'],
    ['“For ye shall go out with joy, and be led forth with peace: the mountains and the hills shall break forth before you into singing, and all the trees of the field shall clap their hands.”','Isaiah 55:12'],
    ['“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”','Matthew 11:28'],
    ['“He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.”','Psalm 23:2–3'],
    ['“For he shall be as a tree planted by the waters, and that spreadeth out her roots by the river.”','Jeremiah 17:8'],
    ['“The trees of the LORD are full of sap; the cedars of Lebanon, which he hath planted; where the birds make their nests.”','Psalm 104:16–17'],
    ['“Be still, and know that I am God.”','Psalm 46:10'],
    ['“Then shall the trees of the wood sing out at the presence of the LORD.”','1 Chronicles 16:33'],
    ['“Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them.”','Matthew 6:26'],
    ['“But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.”','Isaiah 40:31'],
    ['“Return unto thy rest, O my soul; for the LORD hath dealt bountifully with thee.”','Psalm 116:7'] ];
  const KEEPSAKES=['a child’s carved wooden horse, worn smooth with loving','a pressed flower in a fold of linen, still faintly sweet','a little iron cross on a leather thong','a letter, too faded to read but for the words “come home”','a whistle cut from willow — it still sounds','a wooden spoon with a bird carved on the handle'];

  function attach(world){
    if(world.id!=='world'||!world.fdens||!world.trunkAt) return null;
    const scene=world.scene, T=world.T, W=world.W, H=world.H, gAt=(x,z)=>world.ground(x,z), TOWNS=world.towns||[];
    const vs=()=>(typeof VIEWMODE!=='undefined'&&VIEWMODE.ps)?Math.max(0.6,VIEWMODE.ps(world)):1;
    const inB=(x,y)=>x>=1&&y>=1&&x<W-1&&y<H-1;
    const floor=(x,y)=>inB(x,y)&&T(x,y)===1&&!world.trunkAt(x,y)&&world.walkTile(x,y);
    const night=()=>(typeof DAYNIGHT!=='undefined')?(DAYNIGHT.state().night||0):0;
    // a beast may step to (nx,nz) if it's forest floor and clear of the nearest trunks
    const clear=(nx,nz)=>{ const x=Math.floor(nx), y=Math.floor(nz); if(!inB(x,y)||!world.walkTile(x,y)) return false; const w=T(x,y);
      if(w===3||w===20||w===21||w===29||hit(nx,nz)) return false;
      for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++){ const tr=world.trunkAt(x+a,y+b); if(tr&&Math.hypot(tr.x-nx,tr.z-nz)<tr.r+0.35) return false; } return true; };
    const nearTown=(x,y,r)=>TOWNS.some(t=>Math.hypot(t[1]-x,t[2]-y)<r);
    // ── the beasts ──
    const beasts=[];
    function deer(){ const g=new THREE.Group(), c=0x9a6a3e, l=0x7a5030, buck=rnd()<0.4; const body=Sp(0.26,c,0,0.62,0,g,9,7); body.scale.set(0.8,0.75,1.5);
      [[-0.13,0.25],[0.13,0.25],[-0.13,-0.25],[0.13,-0.25]].forEach(([x,z])=>Cy(0.03,0.025,0.52,5,l,x,0,z,g));
      const n=Cy(0.07,0.09,0.36,6,c,0,0.66,0.32,g); n.rotation.x=0.5; const hd=Sp(0.1,c,0,1.02,0.46,g,8,6); hd.scale.set(0.8,0.8,1.4);
      if(buck) [-1,1].forEach(sd=>{ const a=Cy(0.012,0.016,0.28,4,0xd8c8a8,sd*0.06,1.08,0.42,g); a.rotation.z=-sd*0.4; });
      Sp(0.06,0xf2ead8,0,0.7,-0.38,g,6,5); shade(g); if(typeof ANIM3!=='undefined') ANIM3.dress(g,buck?'stag':'deer',{fast:3.2}); return g; }
    function rabbit(){ const g=new THREE.Group(), c=pick([0x9a8a78,0x8a7a68,0xb8a890]); const b=Sp(0.11,c,0,0.11,0,g,7,6); b.scale.set(0.85,0.85,1.2); Sp(0.07,c,0,0.2,0.1,g,6,5);
      [-1,1].forEach(sd=>{ const e=Sp(0.03,c,sd*0.03,0.32,0.08,g,5,4); e.scale.set(0.6,2.4,0.5); }); Sp(0.04,0xf4f0ea,0,0.14,-0.13,g,5,4); return shade(g); }
    function fox(){ const g=new THREE.Group(), c=0xc8622a, w=0xf4ece0, d=0x2a2220; const b=Sp(0.13,c,0,0.3,0,g,8,6); b.scale.set(0.8,0.8,2.0);
      [[-0.07,0.17],[0.07,0.17],[-0.07,-0.17],[0.07,-0.17]].forEach(([x,z])=>Cy(0.022,0.018,0.24,5,d,x,0,z,g));
      const hd=Sp(0.1,c,0,0.4,0.3,g,8,6); hd.scale.set(0.9,0.85,1.1); const sn=Cy(0.005,0.05,0.14,6,c,0,0.37,0.42,g); sn.rotation.x=Math.PI/2; Sp(0.02,d,0,0.37,0.49,g,5,4); Sp(0.06,w,0,0.36,0.34,g,6,4).scale.set(1,0.6,1);
      [-1,1].forEach(sd=>{ const e=Cy(0.0,0.04,0.09,4,c,sd*0.05,0.46,0.28,g); e.rotation.z=-sd*0.2; });
      const tl=Sp(0.07,c,0,0.32,-0.36,g,7,5); tl.scale.set(0.9,0.9,2.6); tl.rotation.x=-0.35; Sp(0.045,w,0,0.26,-0.52,g,6,4);
      g.userData.tail=tl; return shade(g); }
    function bird(){ const g=new THREE.Group(), c=pick([0x8a5a3a,0x6a6a72,0x3a3a40,0xa86a3a]); const b=Sp(0.06,c,0,0.07,0,g,6,5); b.scale.set(0.9,0.85,1.4); Sp(0.04,c,0,0.12,0.06,g,6,4);
      const bk=Cy(0,0.012,0.04,4,0xe0a040,0,0.11,0.11,g); bk.rotation.x=Math.PI/2; const wg=[-1,1].map(sd=>{ const p=new THREE.Group(); p.position.set(sd*0.04,0.09,0); g.add(p); const m=B(0.12,0.01,0.07,c,sd*0.06,0,0,p); return p; });
      g.userData.wings=wg; return g; }
    function spawn(P){ for(let i=0;i<24;i++){ const a=rnd()*TAU, r=10+rnd()*12, x=Math.floor(P.x+Math.cos(a)*r), y=Math.floor(P.z+Math.sin(a)*r);
        if(!floor(x,y)||world.fdens(x,y)<9||nearTown(x,y,16)) continue;
        const roll=rnd(), kind=roll<0.4?'deer':roll<0.65?'rabbit':roll<0.78?'fox':'bird', n=kind==='deer'?1+Math.floor(rnd()*3):kind==='bird'?3+Math.floor(rnd()*3):1;
        for(let k=0;k<n;k++){ const bx=x+0.5+(rnd()-0.5)*2, bz=y+0.5+(rnd()-0.5)*2; if(!clear(bx,bz)) continue; const g=kind==='deer'?deer():kind==='rabbit'?rabbit():kind==='fox'?fox():bird(); scene.add(g);
          beasts.push({g,kind,x:bx,z:bz,y:0,h:rnd()*TAU,st:'graze',t:rnd()*3,ph:rnd()*6}); } return; } }
    function drop(b){ b.g.parent&&b.g.parent.remove(b.g); }
    let lastP=null, pv=0;
    function tickBeasts(P,t,dt,home){ const vsc=vs(), riding=(world.mounted&&world.mounted())||pv>5.5;
      for(let i=beasts.length-1;i>=0;i--){ const b=beasts[i], d=Math.hypot(b.x-P.x,b.z-P.z);
        if(!b.tame&&(d>35||(b.st==='gone'&&b.y>14))){ drop(b); beasts.splice(i,1); continue; }
        const base={deer:5.5,rabbit:4,fox:5,bird:3.5}[b.kind]*(b.tame?0.55:1), scare=riding?base*1.8:base;
        if(b.st==='graze'&&d<scare){ b.st=b.kind==='bird'?'gone':'flee'; b.h=Math.atan2(b.x-P.x,b.z-P.z)+(rnd()-0.5)*0.7; b.t=b.tame?2:4+rnd()*2; }
        const gy=gAt(b.x,b.z);
        if(b.st==='gone'){ b.vy=(b.vy||2.5)+dt*1.5; b.y+=b.vy*dt; b.x+=Math.sin(b.h)*3.5*dt; b.z+=Math.cos(b.h)*3.5*dt; b.g.position.set(b.x,gy+b.y,b.z); b.g.userData.wings.forEach((w,k)=>w.rotation.z=(k?-1:1)*Math.sin(t*30+b.ph)*0.9); b.g.rotation.y=b.h; b.g.scale.setScalar(vsc); continue; }
        if(b.st==='flee'){ const sp={deer:6.5,rabbit:5,fox:5.5}[b.kind], nx=b.x+Math.sin(b.h)*sp*dt, nz=b.z+Math.cos(b.h)*sp*dt;
          if(clear(nx,nz)&&(!b.tame||!home||Math.hypot(nx-home.x,nz-home.z)<home.r)){ b.x=nx; b.z=nz; } else b.h+=1.3+rnd(); b.t-=dt; if(b.t<0&&d>scare*1.5) b.st='graze'; }
        else { b.t-=dt; if(b.t<0){ b.t=2+rnd()*4; b.walk=rnd()<(b.kind==='bird'?0.6:0.4); if(b.walk) b.h+=(rnd()-0.5)*1.6; if(b.tame&&home&&Math.hypot(b.x-home.x,b.z-home.z)>home.r*0.7) b.h=Math.atan2(home.x-b.x,home.z-b.z); }
          if(b.walk){ const sp=b.kind==='bird'?0.35:b.kind==='fox'?0.9:0.5, nx=b.x+Math.sin(b.h)*sp*dt, nz=b.z+Math.cos(b.h)*sp*dt; if(clear(nx,nz)){ b.x=nx; b.z=nz; } else b.walk=false; } }
        const run=b.st==='flee', g=b.g;
        if(b.kind==='rabbit'){ const hop=run?Math.abs(Math.sin(t*14+b.ph))*0.25:(b.walk?Math.abs(Math.sin(t*6+b.ph))*0.06:0); g.position.set(b.x,gy+hop*vsc,b.z); }
        else if(b.kind==='bird'){ const hop=b.walk?Math.abs(Math.sin(t*10+b.ph))*0.04:0; g.position.set(b.x,gy+hop,b.z); g.rotation.x=b.walk?0:Math.max(0,Math.sin(t*3+b.ph))*0.5; g.userData.wings.forEach(w=>w.rotation.z=0); }
        else if(b.kind==='fox'){ g.position.set(b.x,gy+(run?Math.abs(Math.sin(t*12+b.ph))*0.08*vsc:0),b.z); g.userData.tail.rotation.y=Math.sin(t*(run?6:2)+b.ph)*0.4; }
        else g.position.set(b.x,gy,b.z);
        let dd=b.h-g.rotation.y; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); g.rotation.y+=dd*Math.min(1,dt*6); g.scale.setScalar(vsc); } }

    // ── the small finds: chosen once from the deep woods, the same in every game ──
    const SITES=[];
    { const cand=[]; for(let y=4;y<H-4;y+=3) for(let x=4;x<W-4;x+=3){ if(!floor(x,y)||world.fdens(x,y)<21||nearTown(x,y,30)) continue;
        let ok=true; for(let b=-1;b<=1&&ok;b++) for(let a=-1;a<=1;a++) if(!floor(x+a,y+b)&&!world.trunkAt(x+a,y+b)){ ok=false; break; } if(ok) cand.push([x,y,hsh(x*7+1,y*13+5)]); }
      cand.sort((a,b)=>a[2]-b[2]);
      for(const [x,y] of cand){ if(SITES.length>=24) break; if(SITES.some(s=>Math.hypot(s.x-x,s.z-y)<40)) continue; const k=SITES.length; SITES.push({id:'w'+x+'_'+y,x:x+0.5,z:y+0.5,kind:['stone','chest','shrine'][k%3],v:VERSES[k%VERSES.length],keep:KEEPSAKES[k%KEEPSAKES.length]}); } }
    const stoneM=[0x8a8578,0x7e7a6c,0x96907f].map(c=>new THREE.MeshLambertMaterial({color:c})), mossM=new THREE.MeshLambertMaterial({color:0x5f8f3a});
    function buildSite(s){ const y=gAt(s.x,s.z), g=group(s.x,y,s.z,scene), F=finds(); s.g=g;
      if(s.kind==='stone'){ const st=new THREE.Mesh(new THREE.BoxGeometry(0.7,1.2,0.22),stoneM[0]); st.position.y=0.55; st.rotation.z=0.06; g.add(st); const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.22,10,1,false,0,Math.PI),stoneM[0]); cap.rotation.set(Math.PI/2,0,Math.PI/2); cap.position.y=1.15; g.add(cap);
        const ms=new THREE.Mesh(new THREE.IcosahedronGeometry(0.2,1),mossM); ms.scale.set(1.6,0.5,0.8); ms.position.set(0.15,1.25,0); g.add(ms); B(0.4,0.04,0.02,0xc8b890,0,0.7,0.115,g); B(0.3,0.04,0.02,0xc8b890,0,0.82,0.115,g); B(0.36,0.04,0.02,0xc8b890,0,0.94,0.115,g);
        s.spot={x:s.x,z:s.z+0.9,r:1.2,label:'Read',who:'A scripture stone',action:()=>{ ENGINE.speak('A scripture stone',['Moss has crept over its shoulder, but the letters are clear, cut deep by someone patient:',s.v[0]+' — '+s.v[1]],null,()=>{ if(!F[s.id]){ F[s.id]=true; GAME.gainXp(25); GAME.save(); jw('Deep in the woods I found a stone cut with a verse. '+s.v[1]+'.',{place:'The deep woods'}); } }); }}; }
      else if(s.kind==='chest'){ const roots=Sp(0.5,0x5a4430,0,0.05,-0.45,g,7,5); roots.scale.set(1.4,0.35,0.8); const lid=typeof CHEST3D!=='undefined'?CHEST3D.make(g,0,0,{face:0}):null; if(lid&&F[s.id]) CHEST3D.set(lid,true);
        s.spot={x:s.x,z:s.z+0.9,r:1.2,label:F[s.id]?'Look':'Open',who:'A keepsake chest',action:()=>{ if(F[s.id]){ ENGINE.speak('A keepsake chest',['Empty now but for the smell of cedar. You left it as you found it, more or less.']); return; }
          F[s.id]=true; if(lid) CHEST3D.open(lid); const gold=Math.round((25+rnd()*30)*(S().goldMult||1)); GAME.addGold(gold); GAME.gainXp(20); s.spot.label='Look'; GAME.save();
          ENGINE.speak('A keepsake chest',['Tucked between the roots, a small chest. Inside, wrapped in oilcloth: '+s.keep+' — and '+gold+' gold, left for whoever came.','“For where your treasure is, there will your heart be also.” — Matthew 6:21']);
          jw('Between the roots of a great tree I found a keepsake chest: '+s.keep+'. I hope someone was glad of it once.',{place:'The deep woods'}); }}; }
      else { B(1.4,0.2,1.0,stoneM[1],0,0,0,g); const a=B(0.22,1.3,0.22,stoneM[0],-0.5,0.2,-0.2,g), b=B(0.22,0.8,0.22,stoneM[2],0.5,0.2,-0.2,g); b.rotation.z=-0.12;
        const top=B(0.8,0.16,0.3,stoneM[0],-0.25,1.5,-0.2,g); top.rotation.z=0.18; const fallen=B(0.6,0.18,0.24,stoneM[2],0.75,0,0.35,g); fallen.rotation.y=0.7;
        B(0.06,0.5,0.04,0xe8c46a,0,0.2,-0.2,g); B(0.24,0.06,0.04,0xe8c46a,0,0.55,-0.2,g); for(let i=0;i<4;i++) Sp(0.06,[0xf4f0ea,0xffe060,0xb08ae8][i%3],-0.3+i*0.2,0.25,0.3,g,6,4);
        const ms=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,1),mossM); ms.scale.set(1.4,0.4,1); ms.position.set(-0.5,1.5,-0.2); g.add(ms);
        s.spot={x:s.x,z:s.z+1.1,r:1.3,label:'Kneel',who:'A ruined shrine',action:()=>{ const P=S(); P.hp=P.maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed&&GAME.changed();
          ENGINE.speak('A ruined shrine',['A wayside shrine, fallen half to ruin, the little cross still standing. Someone has left flowers. You kneel a while in the green quiet, and get up mended.',s.v[0]+' — '+s.v[1]],null,()=>{ if(!F[s.id]){ F[s.id]=true; GAME.gainXp(30); GAME.save(); jw('A ruined shrine in the deep woods. I knelt there, and rose mended. '+s.v[1]+'.',{place:'The deep woods'}); } }); }}; }
      shade(g); world.spots.push(s.spot); }
    function dropSite(s){ if(s.g){ s.g.parent&&s.g.parent.remove(s.g); s.g.traverse(o=>{ if(o.isMesh&&o.geometry) o.geometry.dispose(); }); s.g=null; } const k=world.spots.indexOf(s.spot); if(k>=0) world.spots.splice(k,1); s.spot=null; }
    // a find blocks the step onto its stone
    const blockers=[];
    SITES.forEach(s=>blockers.push({x:s.x,z:s.z,r:s.kind==='shrine'?0.75:0.45,on:()=>!!s.g}));

    // ── the Hermit's Glade ──
    let GL=null;
    { const x0=311, y0=722, x1=Math.min(W-3,408), y1=Math.min(H-3,801); const w=x1-x0+1, h=y1-y0+1;
      // the open tile furthest from the trees, the rocks and the sea — out of the snowy fell-side if the meadow allows it
      const far=green=>{ const D=new Int16Array(w*h).fill(-1), q=[]; for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ const k=(y-y0)*w+(x-x0), t=T(x,y); if(!world.walkTile(x,y)||t===1||t===3||(green&&world.bio&&world.bio(x,y)===4)){ D[k]=0; q.push(k); } }
        let qi=0; while(qi<q.length){ const k=q[qi++], x=k%w, y=(k/w)|0; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+a, ny=y+b; if(nx<0||ny<0||nx>=w||ny>=h) continue; const n=ny*w+nx; if(D[n]<0){ D[n]=D[k]+1; q.push(n); } } }
        let best=-1, bk=-1; for(let k=0;k<D.length;k++) if(D[k]>best){ best=D[k]; bk=k; } return {x:x0+(bk%w)+0.5,z:y0+((bk/w)|0)+0.5,open:best}; };
      const g1=far(true), g0=g1.open>=8?g1:far(false); if(g0.open>=8) GL=g0; }
    world.glade=GL;
    if(GL){ GL.pool={x:GL.x+5,z:GL.z+2,r:2.3}; GL.tree={x:GL.x+0.5,z:GL.z-7.5}; GL.hut={x:GL.x-5,z:GL.z-2,w:4.4,d:3.4};
      const hu=GL.hut; [[hu.x,hu.z-hu.d/2,hu.w,0.3],[hu.x-hu.w/2,hu.z,0.3,hu.d],[hu.x+hu.w/2,hu.z,0.3,hu.d],[hu.x-1.4,hu.z+hu.d/2,1.6,0.3],[hu.x+1.4,hu.z+hu.d/2,1.6,0.3]].forEach(([x,z,w,d])=>blockers.push({box:[x-w/2-0.15,z-d/2-0.15,x+w/2+0.15,z+d/2+0.15],on:()=>!!GL.g}));
      blockers.push({x:GL.pool.x,z:GL.pool.z,r:GL.pool.r,on:()=>!!GL.g}); blockers.push({x:GL.pool.x+0.4,z:GL.pool.z-2.9,r:1.0,on:()=>!!GL.g}); blockers.push({x:GL.tree.x,z:GL.tree.z,r:0.9,on:()=>!!GL.g}); }
    const flies=[];
    function buildGlade(){ const G=GL, y=gAt(G.x,G.z), g=group(G.x,y,G.z,scene), st=glade(); G.g=g; const L=(x,z)=>[x-G.x,gAt(x,z)-y,z-G.z];
      // the hermitage: four rough walls, the roof long gone, one gable still up; a doorway to the south
      { const hu=G.hut, [hx,hy,hz]=L(hu.x,hu.z), hg=group(hx,hy,hz,g), M=(i)=>stoneM[i%3];
        const wall=(x,z,w,d,h,i)=>{ const n=Math.max(1,Math.round(Math.max(w,d)/0.6)); for(let k=0;k<n;k++){ const t=(k+0.5)/n-0.5, hh=h*(0.55+0.45*hsh(k*3+i,i*7+2)); const b=new THREE.Mesh(new THREE.BoxGeometry(w>d?w/n+0.02:w,hh,w>d?d:d/n+0.02),M(k+i)); b.position.set(x+(w>d?t*w:0),hh/2,z+(w>d?0:t*d)); hg.add(b); } };
        wall(0,-hu.d/2,hu.w,0.3,2.4,0); wall(-hu.w/2,0,0.3,hu.d,1.8,1); wall(hu.w/2,0,0.3,hu.d,1.3,2); wall(-1.4,hu.d/2,1.6,0.3,1.6,3); wall(1.4,hu.d/2,1.6,0.3,1.1,4);
        const gab=prism(hu.w,1.3,0.3,stoneM[1]); gab.position.set(0,2.2,-hu.d/2-0.15); hg.add(gab); B(0.1,0.5,0.04,0xe8c46a,0,2.5,-hu.d/2+0.16,hg); B(0.3,0.08,0.04,0xe8c46a,0,2.75,-hu.d/2+0.16,hg);
        const beam=B(hu.w+0.6,0.16,0.18,0x4a3422,0,1.75,0.4,hg); beam.rotation.z=0.25;   // a last roof-beam, fallen aslant across the walls
        for(let i=0;i<9;i++){ const iv=Sp(0.22+hsh(i,4)*0.12,i%2?0x3f7a3a:0x4f8a40,(hsh(i,1)-0.5)*hu.w,0.4+hsh(i,2)*1.6,-hu.d/2+0.22,hg,6,4); iv.scale.z=0.25; }   // ivy on the north wall
        // the scripture wall: a slab set in the north wall, lettered; a bench; and the hermit's own chest under the bench
        B(1.2,0.8,0.08,0xc8c0a8,0,0.9,-hu.d/2+0.2,hg); for(let i=0;i<5;i++) B(0.9-hsh(i,9)*0.3,0.03,0.02,0x5a5040,0,1.0+i*0.12,-hu.d/2+0.25,hg);
        B(1.3,0.08,0.4,0x6a4a2a,-1.2,0.42,0.8,hg); B(0.1,0.42,0.3,0x5a3a20,-1.75,0,0.8,hg); B(0.1,0.42,0.3,0x5a3a20,-0.65,0,0.8,hg);
        G.lid=typeof CHEST3D!=='undefined'?CHEST3D.make(hg,1.2,0.6,{face:-Math.PI/2}):null; if(G.lid&&st.chest) CHEST3D.set(G.lid,true);
        // the overgrown garden in front: beds gone wild, herbs and flowers, a broken wattle fence
        for(let i=0;i<26;i++){ const gx=-2.4+hsh(i,11)*4.8, gz=hu.d/2+1.0+hsh(i,13)*2.4; const b=Sp(0.18+hsh(i,7)*0.14,[0x4a8a40,0x3f7a3a,0x5a9a48][i%3],gx,0.12,gz,hg,6,4); b.scale.y=0.7;
          if(i%2) Sp(0.06,[0xf4f0ea,0xffe060,0xe8607a,0xb08ae8][i%4],gx+0.05,0.3,gz,hg,5,4); }
        for(let i=0;i<9;i++){ if(i===4||i===6) continue; const p=Cy(0.04,0.05,0.7,5,0x6a4a2a,-2.6+i*0.65,0,hu.d/2+3.7,hg); p.rotation.z=(hsh(i,3)-0.5)*0.4; } }
      // the pool and the little fall above it
      { const p=G.pool, [px,py,pz]=L(p.x,p.z), pg=group(px,py,pz,g);
        const water=new THREE.Mesh(new THREE.CircleGeometry(p.r,28),new THREE.MeshPhongMaterial({color:0x4aa0bc,shininess:110,transparent:true,opacity:0.88})); water.rotation.x=-Math.PI/2; water.position.y=0.06; pg.add(water);
        const bed=new THREE.Mesh(new THREE.CircleGeometry(p.r*0.8,20),new THREE.MeshLambertMaterial({color:0x2a5a68})); bed.rotation.x=-Math.PI/2; bed.position.y=0.03; pg.add(bed);
        for(let i=0;i<22;i++){ const a=i/22*TAU, s=Sp(0.22+hsh(i,2)*0.16,[0x8a8578,0x7e7a6c,0x96907f][i%3],Math.cos(a)*(p.r+0.1),0.06,Math.sin(a)*(p.r+0.1),pg,6,4); s.scale.y=0.55; }
        for(let i=0;i<5;i++){ const lp=new THREE.Mesh(new THREE.CircleGeometry(0.22,8),new THREE.MeshLambertMaterial({color:0x4f8a3a})); lp.rotation.x=-Math.PI/2; lp.position.set(Math.cos(i*1.7)*p.r*0.6,0.075,Math.sin(i*1.7)*p.r*0.55); pg.add(lp); if(i%2) Sp(0.06,0xf4e8f0,lp.position.x,0.11,lp.position.z,pg,6,4); }
        const rk=[[0.4,-2.9,1.1,1.6],[-0.6,-3.0,0.8,1.1],[1.2,-2.7,0.7,0.8],[0.3,-3.3,0.8,2.3]]; rk.forEach(([x,z,r,h],i)=>{ const s=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),stoneM[i%3]); s.scale.set(1,h/r*0.6,0.9); s.position.set(x,h*0.35,z); s.rotation.y=i; pg.add(s); });
        const fallM=new THREE.MeshBasicMaterial({color:0xdff4ff,transparent:true,opacity:0.7,depthWrite:false}); const fall=new THREE.Mesh(new THREE.PlaneGeometry(0.42,1.5),fallM); fall.position.set(0.35,0.85,-2.05); pg.add(fall);
        const drops=[]; for(let i=0;i<10;i++){ const d=Sp(0.05,0xeaf8ff,0.2+rnd()*0.3,0,-2.0,pg,5,4); drops.push(d); }
        const foam=new THREE.Mesh(new THREE.RingGeometry(0.2,0.5,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5,depthWrite:false})); foam.rotation.x=-Math.PI/2; foam.position.set(0.35,0.08,-1.85); pg.add(foam);
        G.tick=(t)=>{ fallM.opacity=0.55+Math.sin(t*7)*0.12; drops.forEach((d,i)=>{ const u=(t*1.4+i/10)%1; d.position.y=1.6-u*1.55; d.position.z=-2.05+u*0.15; }); const u=(t*0.8)%1; foam.scale.setScalar(0.8+u*0.9); foam.material.opacity=0.5*(1-u); }; }
      // the ancient oak, roots spread over the turf
      { const [tx,ty,tz]=L(G.tree.x,G.tree.z); if(typeof TREE_GEO!=='undefined'&&(TREE_GEO.oakT||TREE_GEO.oak)){ const m=new THREE.Mesh((TREE_GEO.oakT||TREE_GEO.oak)(),new THREE.MeshLambertMaterial({vertexColors:true})); m.scale.set(4.2,2.9,4.2); m.position.set(tx,ty,tz); m.rotation.y=0.7; g.add(m); }
        Cy(0.42,0.8,1.0,10,0x5e3e24,tx,ty-0.05,tz,g); for(let i=0;i<7;i++){ const a=i/7*TAU+0.3, rg=group(tx,ty+0.25,tz,g); rg.rotation.y=-a; const r=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.2,1.7,6),mt(0x5e3e24)); r.rotation.z=-1.25; r.position.set(0.95,-0.2,0); rg.add(r); } }
      // the meadow's flowers, thick here
      for(let i=0;i<70;i++){ const a=rnd()*TAU, r=2+rnd()*10, fx=G.x+Math.cos(a)*r, fz=G.z+Math.sin(a)*r; if(Math.hypot(fx-G.pool.x,fz-G.pool.z)<G.pool.r+0.5) continue; const [x,yy,z]=L(fx,fz); Sp(0.05,pick([0xf4f0ea,0xffe060,0xe8607a,0xb08ae8,0xf0a0c8]),x,yy+0.12,z,g,5,4); Cy(0.008,0.008,0.12,3,0x4a8a40,x,yy,z,g); }
      // butterflies
      const wM=[0xf8f0e0,0xf0c040,0x8ab0f0,0xf08a4a].map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
      for(let i=0;i<12;i++){ const b=new THREE.Group(); const wg=[-1,1].map(sd=>{ const p=new THREE.Group(); b.add(p); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.1),wM[i%4]); m.rotation.x=-Math.PI/2; m.position.x=sd*0.06; p.add(m); return p; }); g.add(b); flies.push({b,wg,cx:-4+rnd()*10,cz:-2+rnd()*8,ph:rnd()*TAU,sp:0.4+rnd()*0.5}); }
      shade(g); g.traverse(o=>{ if(o.material&&o.material.transparent) o.castShadow=false; });
      // the glade's own herd: they've never been hunted here, and hardly lift their heads
      for(let i=0;i<4;i++){ const a=i*1.6+0.4, x=G.x+Math.cos(a)*5, z=G.z+3+Math.sin(a)*3; if(!clear(x,z)) continue; const dg=deer(); scene.add(dg); beasts.push({g:dg,kind:'deer',tame:true,x,z,y:0,h:rnd()*TAU,st:'graze',t:rnd()*3,ph:rnd()*6}); }
      // what you can do here
      const hu=G.hut;
      G.spots=[
        {x:hu.x,z:hu.z-hu.d/2+1.0,r:1.2,label:'Read',who:'The hermit’s wall',action:()=>ENGINE.speak('The hermit’s wall',['A slab of pale stone set in the north wall, lettered by hand over years — the letters of the first lines deep and careful, the last ones shaky:','“The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.” — Psalm 23:1–3','And beneath, small: “I came here to be quiet, and found I was never alone.”'],null,()=>{ if(!st.stone){ st.stone=true; GAME.gainXp(40); GAME.save(); } })},
        {x:hu.x-1.2,z:hu.z+0.8+0.9,r:1.1,label:'Rest',who:'The hermit’s bench',action:()=>{ const P=S(); P.hp=P.maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed&&GAME.changed(); ENGINE.speak('The hermit’s bench',['You sit a while on the old bench. The water falls into the pool, the deer crop the grass, a butterfly settles on your gauntlet and goes again. You rise rested.','“Come ye yourselves apart into a desert place, and rest a while.” — Mark 6:31'],null,()=>{ if(!st.rest){ st.rest=true; GAME.save(); jw('I rested on the hermit’s bench in the hidden glade by the sea. Mark 6:31.',{place:'The Hermit’s Glade'}); } }); }},
        {x:hu.x+1.2,z:hu.z+0.6+0.9,r:1.1,label:st.chest?'Look':'Open',who:'The hermit’s chest',action:()=>{ const sp=G.spots[2]; if(st.chest){ ENGINE.speak('The hermit’s chest',['Empty — you have its gift already.']); return; }
          st.chest=true; if(G.lid) CHEST3D.open(G.lid); const gold=Math.round(150*(S().goldMult||1)); GAME.addGold(gold); GAME.gainXp(80); sp.label='Look'; GAME.save();
          ENGINE.speak('The hermit’s chest',['A plain box of oak under the bench. Inside: a worn psalter, a wooden cross, and a purse of '+gold+' gold with a scrap of parchment — “For the next pilgrim. Freely ye have received, freely give.”','Matthew 10:8']); jw('In the ruined hermitage I found the hermit’s chest, left for the next pilgrim. Matthew 10:8.',{place:'The Hermit’s Glade'}); }},
        {x:G.pool.x,z:G.pool.z+G.pool.r+0.8,r:1.3,label:'Drink',who:'The still pool',action:()=>{ const P=S(); P.hp=P.maxHp; ENGINE.hud&&ENGINE.hud(); GAME.changed&&GAME.changed(); ENGINE.speak('The still pool',['Cold, sweet water, falling clean off the rock. You drink and are whole.','“He leadeth me beside the still waters.” — Psalm 23:2']); }},
        {x:G.tree.x,z:G.tree.z+1.6,r:1.4,label:'Look',who:'The ancient oak',action:()=>ENGINE.speak('The ancient oak',['Older than the realm, maybe. Its roots run out over the turf like the fingers of a great hand, and the deer lie down in its shade.','“For there is hope of a tree, if it be cut down, that it will sprout again.” — Job 14:7'])} ];
      G.spots.forEach(s=>world.spots.push(s)); }
    function dropGlade(){ const G=GL; if(!G.g) return; G.g.parent&&G.g.parent.remove(G.g); G.g.traverse(o=>{ if(o.isMesh&&o.geometry) o.geometry.dispose(); }); G.g=null; flies.length=0; (G.spots||[]).forEach(s=>{ const k=world.spots.indexOf(s); if(k>=0) world.spots.splice(k,1); }); G.spots=null;
      for(let i=beasts.length-1;i>=0;i--) if(beasts[i].tame){ drop(beasts[i]); beasts.splice(i,1); } }

    // the walk knows the stones, the pool, the hermitage walls and the old oak
    const hit=(x,z)=>{ for(const b of blockers){ if(!b.on()) continue; if(b.box){ if(x>b.box[0]&&x<b.box[2]&&z>b.box[1]&&z<b.box[3]) return true; } else if(Math.hypot(x-b.x,z-b.z)<b.r) return true; } return false; };
    const cm0=world.canMove; world.canMove=(fx,fz,tx,tz)=>{ if(hit(tx,tz)&&!hit(fx,fz)) return false; return cm0(fx,fz,tx,tz); };
    const zone0=world.zone; world.zone=p=>{ if(GL&&Math.hypot(p.x-GL.x,p.z-GL.z)<12) return '🌿 The Hermit’s Glade'; return zone0?zone0(p):null; };

    // ── the tick ──
    let lastT=0, spT=0, sT=0;
    world.anim.push(t=>{ const tn=performance.now()/1000, dt=lastT?Math.min(0.25,tn-lastT):0.016; lastT=tn;
      if(ENGINE.level!==world) return; const P=ENGINE.P;
      if(lastP){ const v=Math.hypot(P.x-lastP[0],P.z-lastP[1])/Math.max(dt,0.001); pv+=(v-pv)*Math.min(1,dt*3); } lastP=[P.x,P.z];
      spT+=dt; if(spT>1.6){ spT=0; const wild=beasts.filter(b=>!b.tame).length; if(wild<9&&night()<0.6&&world.fdens(Math.floor(P.x),Math.floor(P.z))>=8) spawn(P); }
      sT+=dt; if(sT>0.7){ sT=0; for(const s of SITES){ const d=Math.hypot(s.x-P.x,s.z-P.z); if(d<45&&!s.g) buildSite(s); else if(d>65&&s.g) dropSite(s); }
        if(GL){ const d=Math.hypot(GL.x-P.x,GL.z-P.z); if(d<55&&!GL.g) buildGlade(); else if(d>80&&GL.g) dropGlade();
          if(d<11){ const st=glade(); if(!st.saw){ st.saw=true; GAME.gainXp(60); GAME.save(); UI.toast('🌿 You have found a hidden place — the Hermit’s Glade',3200); jw('Through the wood by the southern sea I came out into a hidden meadow: a ruined hermitage, a still pool, deer that did not run from me. Psalm 23:2.',{place:'The Hermit’s Glade'}); } } } }
      if(GL&&GL.g){ GL.tick&&GL.tick(t); const vsc=vs(); for(const f of flies){ const a=t*f.sp+f.ph; f.b.position.set(f.cx+Math.sin(a)*2.2+Math.sin(a*2.3)*0.6,gAt(GL.x+f.cx,GL.z+f.cz)-GL.g.position.y+0.6+Math.abs(Math.sin(a*1.7))*0.9,f.cz+Math.cos(a*0.8)*1.8); f.b.rotation.y=-a; f.wg.forEach((w,k)=>w.rotation.z=(k?1:-1)*Math.sin(t*18+f.ph)*0.9); f.b.scale.setScalar(vsc); } }
      tickBeasts(P,t,dt,GL&&GL.g?{x:GL.x,z:GL.z+2,r:9}:null); });
    const pl=world.onLeave; world.onLeave=()=>{ for(let i=beasts.length-1;i>=0;i--) if(!beasts[i].tame){ drop(beasts[i]); beasts.splice(i,1); } if(pl) pl(); };
    return {beasts,sites:SITES,glade:GL,_spawn:()=>spawn(ENGINE.P)};
  }
  return {attach};
})();
