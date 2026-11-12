// ════════════════════════════════════════════════════════════════
//  WEATHER (V131) — each land has the sky it should:
//   · the green vales (Hearthvale, the Homestead, Ironhold, Thornwood): soft rain some days, gone again by the next watch
//   · the coast (Saltmere, Stormgate): rain off the sea, and at Stormgate a storm, with lightning far out over the water
//   · the peaks (Crystalpeak, the Pilgrim's Pass, Hellgate): snow drifting down
//   · the Dust Road and Dusthaven: sand blowing low and fast, and the far country lost in a tan haze
//   · the Ashlands: ash falling slow and grey
//   · Shadowmere: the mist rising off the mere
//  The weather turns every third of a day (a "watch", 24 real minutes); whether a land has weather in a watch, and how much,
//  is decided once for the watch, so walking back and forth doesn't reroll it. Crossing from one land into the next, the
//  old weather fades out and the new fades in. The particles fall in a box about the camera; the fog and the light follow.
//  WEATHER.attach(world). Never in rooms or portal worlds — only the open realm.
// ════════════════════════════════════════════════════════════════
const WEATHER=(function(){
  const CLIMATE={Hearthvale:'rain',Homestead:'rain',Ironhold:'rain',Thornwood:'rain',Saltmere:'rain',Stormgate:'storm',Dusthaven:'sand',Crystalpeak:'snow',Ashfield:'ash',Shadowmere:'mist',Hellgate:'snow'};
  // chance a watch has weather, the fog it brings (near, far, colour), how much it dims the sun
  const KIND={
    rain:{p:0.28,near:16,far:85,col:0x9aa4b0,dim:0.32,msg:'🌧 Rain sets in, soft and steady.'},
    storm:{p:0.45,near:10,far:58,col:0x6a7482,dim:0.58,msg:'⛈ A storm comes in off the sea.'},
    snow:{p:0.6,near:8,far:52,col:0xd8e0ea,dim:0.3,msg:'❄ Snow begins to fall.'},
    sand:{p:0.45,near:3,far:32,col:0xc8a878,dim:0.35,msg:'🌪 The wind lifts the sand.'},
    ash:{p:0.7,near:10,far:58,col:0x8a7a70,dim:0.4,msg:'🌫 Ash drifts down from a grey sky.'},
    mist:{p:0.7,near:2,far:30,col:0xb8c0c4,dim:0.25,msg:'🌫 Mist rises off the mere.'}};
  const hsh=(a,b)=>{ let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  function attach(world){
    const scene=world.scene, TOWNS=world.towns||[];
    const climate=(x,z)=>{ const tk=world.trek; if(tk&&tk.box){ const b=tk.box; if(x>=b[0]&&x<=b[2]&&z>=b[1]&&z<=b[3]) return 'snow'; }
      if(world.desert&&world.desert(Math.floor(x),Math.floor(z))) return 'sand'; if(world.ashland&&world.ashland(Math.floor(x),Math.floor(z))) return 'ash';
      let best=null, bd=1e9; TOWNS.forEach(([n,tx,ty])=>{ const d=Math.hypot(tx-x,ty-z); if(d<bd){ bd=d; best=n; } });
      return (best&&bd<70&&CLIMATE[best])||'rain'; };
    // the watch's weather for a climate: 0 (clear) .. 1 (heavy)
    const strength=(c,w)=>{ if(c==='storm'&&GAME.S.wxCalm===w) return 0; const K=KIND[c], ci=Object.keys(KIND).indexOf(c); const r=hsh(w,ci+11); if(r>K.p) return 0; return 0.45+0.55*hsh(w,ci+37); };
    const watch=()=>{ const S=GAME.S; const f=typeof S.dayFrac==='number'?S.dayFrac:0.4; const seg=Math.floor(((f%1)+1)%1*3);
      if(S.wxSeg!==seg){ S.wxSeg=seg; S.wxN=(S.wxN||0)+1; } return S.wxN||0; };
    // ── the particles ──
    const R=13, HT=13, NR=1800, NP=1800;
    const rainPos=new Float32Array(NR*6), rainG=new THREE.BufferGeometry(); rainG.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
    const rainM=new THREE.LineBasicMaterial({color:0xdce6f2,transparent:true,opacity:0,depthWrite:false,fog:false});
    const rain=new THREE.LineSegments(rainG,rainM); rain.frustumCulled=false; rain.visible=false; scene.add(rain);
    const ptPos=new Float32Array(NP*3), ptG=new THREE.BufferGeometry(); ptG.setAttribute('position',new THREE.BufferAttribute(ptPos,3));
    const dotCv=document.createElement('canvas'); dotCv.width=dotCv.height=32; { const c=dotCv.getContext('2d'), g=c.createRadialGradient(16,16,0,16,16,16); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.5,'rgba(255,255,255,0.6)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,32,32); }
    const ptM=new THREE.PointsMaterial({color:0xffffff,size:0.14,map:new THREE.CanvasTexture(dotCv),transparent:true,opacity:0,depthWrite:false,fog:false});
    const pts=new THREE.Points(ptG,ptM); pts.frustumCulled=false; pts.visible=false; scene.add(pts);
    const seedR=new Float32Array(NR*3), seedP=new Float32Array(NP*4);
    for(let i=0;i<NR;i++){ seedR[i*3]=(Math.random()*2-1)*R; seedR[i*3+1]=Math.random()*HT; seedR[i*3+2]=(Math.random()*2-1)*R; }
    for(let i=0;i<NP;i++){ seedP[i*4]=(Math.random()*2-1)*R; seedP[i*4+1]=Math.random()*HT; seedP[i*4+2]=(Math.random()*2-1)*R; seedP[i*4+3]=Math.random()*6.28; }
    const wrap=v=>((v+R)%(2*R)+2*R)%(2*R)-R;
    let cur=null, amt=0, want=null, wantS=0, told={}, flash=0, nextBolt=0;
    const col=new THREE.Color(), tmpC=new THREE.Color(), nightK=()=>(typeof DAYNIGHT!=='undefined')?(DAYNIGHT.state().night||0):0;
    let lastT=0; world.anim.push(t=>{ const tn=performance.now()/1000; let dt=lastT?Math.min(0.25,tn-lastT):0.016; lastT=tn; const on=ENGINE.level===world;
      if(!on){ rain.visible=pts.visible=false; return; }
      const P=ENGINE.P, c=climate(P.x,P.z), w=watch(); want=c; wantS=strength(c,w); if(world.wxForce){ want=world.wxForce[0]; wantS=world.wxForce[1]; if(world.wxForce[2]){ cur=want; amt=wantS; } }
      // fade the old weather out before the new comes in
      if(cur!==want){ amt=Math.max(0,amt-dt/3); if(amt<=0){ cur=want; } }
      else amt+=(wantS-amt)*Math.min(1,dt/5);
      if(cur&&amt>0.25&&wantS>0&&cur===want&&!told[cur+w]){ told[cur+w]=1; UI.toast(KIND[cur].msg,2200); }
      const C=ENGINE.cam.position, sc=Math.max(0.22,Math.min(1,Math.hypot(C.x-P.x,C.y-P.y,C.z-P.z)/7)), lite=(typeof HUD!=='undefined'&&HUD.quality>=2)?0.5:1;
      const isRain=cur==='rain'||cur==='storm', isPts=cur==='snow'||cur==='sand'||cur==='ash'||cur==='mist';
      rain.visible=isRain&&amt>0.02; pts.visible=isPts&&amt>0.02;
      if(rain.visible){ const n=Math.floor(NR*lite*Math.min(1,amt*1.2)*(cur==='storm'?0.7:0.4)),   /* V156: a thinner rain */ sp=cur==='storm'?24:18, wx=cur==='storm'?5:1.5, L=cur==='storm'?1.3:1.0;
        for(let i=0;i<n;i++){ let y=seedR[i*3+1]-sp*dt; if(y<0) y+=HT; seedR[i*3+1]=y; seedR[i*3]=wrap(seedR[i*3]+wx*dt);
          const x=P.x+seedR[i*3]*sc, yy=P.y+(y-1)*sc, z=P.z+seedR[i*3+2]*sc, k=i*6;
          rainPos[k]=x; rainPos[k+1]=yy; rainPos[k+2]=z; rainPos[k+3]=x-wx*L/sp*sc; rainPos[k+4]=yy+L*sc; rainPos[k+5]=z; }
        rainG.setDrawRange(0,n*2); rainG.attributes.position.needsUpdate=true; rainM.opacity=(cur==='storm'?0.65:0.45)*Math.min(1,amt*1.3); rainM.color.setHex(0xdce6f2).multiplyScalar(1-0.55*nightK()); }
      if(pts.visible){ const n=Math.floor(NP*lite*Math.min(1,amt*1.2)*(cur==='mist'?0.35:1));
        const fall=cur==='snow'?1.4:cur==='ash'?0.6:cur==='mist'?-0.15:0.3, wx=cur==='sand'?11:cur==='snow'?0.8:cur==='ash'?0.5:0.3, low=cur==='sand'?0.3:cur==='mist'?0.4:0.7;
        for(let i=0;i<n;i++){ const k4=i*4; let y=seedP[k4+1]-fall*dt; if(y<0) y+=HT; if(y>HT) y-=HT; seedP[k4+1]=y;
          seedP[k4]=wrap(seedP[k4]+wx*dt+Math.sin(t*0.8+seedP[k4+3])*0.4*dt); seedP[k4+2]=wrap(seedP[k4+2]+Math.cos(t*0.7+seedP[k4+3])*0.3*dt);
          ptPos[i*3]=P.x+seedP[k4]*sc; ptPos[i*3+1]=P.y+(y*low-0.5)*sc; ptPos[i*3+2]=P.z+seedP[k4+2]*sc; }
        ptG.setDrawRange(0,n); ptG.attributes.position.needsUpdate=true;
        ptM.color.setHex(cur==='snow'?0xffffff:cur==='sand'?0xc0905a:cur==='ash'?0x5a524c:0xe8ecee); ptM.size=(cur==='snow'?0.24:cur==='sand'?0.13:cur==='ash'?0.18:1.4)*Math.max(0.45,sc);
        ptM.opacity=(cur==='mist'?0.22:0.95)*Math.min(1,amt*1.3); ptM.color.multiplyScalar(1-0.6*nightK()); }
      // a storm: lightning far out, now and then
      if(cur==='storm'&&amt>0.5){ if(t>nextBolt){ nextBolt=t+6+Math.random()*12; flash=1; } } flash=Math.max(0,flash-dt*3.2);
    });
    // the fog and the light, after the day's own sky has been set (DAYNIGHT in the anims, world.follow after them)
    let wN=-1, wF=-1, bN=40, bF=150;
    const fo0=world.follow; world.follow=P=>{ if(fo0) fo0(P); if(ENGINE.level!==world) return; const f=scene.fog; if(!f) return;
      if(f.near!==wN||f.far!==wF){ bN=f.near; bF=f.far; }
      const K=cur&&KIND[cur], a=K?Math.min(1,amt):0;
      if(a>0.001){ col.setHex(K.col); const night=(typeof DAYNIGHT!=='undefined')?DAYNIGHT.state().night||0:0; tmpC.copy(col).multiplyScalar(1-0.75*night);
        f.color.lerp(tmpC,a*0.75); if(scene.background&&scene.background.isColor) scene.background.lerp(tmpC,a*0.6);
        f.near=bN+(K.near-bN)*a; f.far=bF+(K.far-bF)*a;
        if(world.sunShadow) world.sunShadow.intensity*=1-K.dim*a; if(world.hemi) world.hemi.intensity*=1-K.dim*0.4*a; }
      else { f.near=bN; f.far=bF; }
      if(flash>0&&world.hemi){ world.hemi.intensity+=flash*1.4; if(scene.background&&scene.background.isColor) scene.background.lerp(tmpC.setHex(0xe8ecff),flash*0.5); }
      wN=f.near; wF=f.far; };
    // ── V134: weather that asks something of you ──
    //  · CALM THE STORM: in a storm on the Stormgate coast, stand at the water's edge and pray — "Peace, be still" (Mark 4:39) —
    //    and the wind drops and the sea goes still, for the rest of the watch.
    //  · THE COLD: in snow out in the open (the Pilgrim's Pass, the high country round Crystalpeak and Hellgate) the cold
    //    creeps in while you walk and slows you; the fire at the high camp warms you through for the next two watches.
    const nearSea=(x,z)=>{ for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){ const t=world.T(Math.floor(x)+dx,Math.floor(z)+dy); if(t===3||t===29) return true; } return false; };
    const nearTown=(x,z)=>TOWNS.some(([n,tx,ty])=>Math.hypot(tx-x,ty-z)<16);
    const calmSpot={x:-999,z:-999,r:1.2,label:'Pray',who:'The storm',action:()=>{ const w=watch(), first=!GAME.S.wxCalmed;
      ENGINE.speak('The storm',['The wind howls off the sea and the waves break white against the stones. You plant your feet at the water’s edge and lift your voice over it.','“And he arose, and rebuked the wind, and said unto the sea, Peace, be still. And the wind ceased, and there was a great calm.” — Mark 4:39','(The wind falls away. The rain thins to nothing. The sea lies down like a tired dog.)'],null,()=>{
        GAME.S.wxCalm=w; GAME.S.wxCalmed=true; flash=0; nextBolt=1e9; GAME.changed();
        if(first){ const x=GAME.gainXp?GAME.gainXp(80):null; UI.toast(`🌊 Peace, be still — the storm is calmed. +80 XP${x&&x.up?' · LEVEL UP!':''}`,3000); if(typeof JOURNAL!=='undefined') JOURNAL.write('A storm came in on the Stormgate coast. I stood at the water and said the words from Mark 4:39, and the wind ceased, and there was a great calm. It was not my voice that did it.',{place:'Stormgate'}); if(typeof LIBRARY!=='undefined'&&LIBRARY.codexAdd) LIBRARY.codexAdd('Weather','Mark 4:39','Peace, be still. And the wind ceased, and there was a great calm.'); }
        else UI.toast('🌊 Peace, be still — the wind drops and the sea goes calm.',2400); }); }};
    world.spots.push(calmSpot);
    let cold=0, coldSaid=false, warmSaid=false;
    const warm=()=>(GAME.S.wxWarm||-9)>=watch();
    const sm0=world.speedMult; world.speedMult=()=>(sm0?sm0():1)*(1-0.28*cold);
    world.anim.push(t=>{ if(ENGINE.level!==world){ calmSpot.x=-999; return; } const P=ENGINE.P, dt=0.016*Math.max(1,Math.min(15,(performance.now()-(world._wxT||performance.now()))/16)); world._wxT=performance.now();
      if(cur==='storm'&&amt>0.45&&!ENGINE.holding&&nearSea(P.x,P.z)){ calmSpot.x=P.x; calmSpot.z=P.z; } else calmSpot.x=-999;
      const riding=world.mounted&&world.mounted();
      const chill=cur==='snow'&&amt>0.3&&!riding&&!warm()&&!nearTown(P.x,P.z);
      cold=Math.max(0,Math.min(1,cold+(chill?dt/45:-dt/12)));
      if(cold>0.5&&!coldSaid){ coldSaid=true; UI.toast('❄ The cold bites through your mail and slows your step. The fire at the high camp would warm you.',3200); }
      if(cold<0.1) coldSaid=false;
      if(warm()&&cur==='snow'&&!warmSaid){ warmSaid=true; UI.toast('🔥 Warm from the fire, you shrug off the cold.',2200); } });
    return { get cold(){ return cold; }, get now(){ return {kind:cur,amount:amt,want,wantS}; }, climate, _pts:pts, _rain:rain };
  }
  return {attach};
})();
