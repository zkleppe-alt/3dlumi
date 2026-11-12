// ════════════════════════════════════════════════════════════════
//  ROOM STYLE — each kind of public room dressed for its trade, and given a thing or two to do:
//   the tavern (antlers and shields, a shelf of tankards, hops and tankards hung from the beams, the slate of today's fare,
//     a dartboard), the inn's upper floor (candles and basins by the beds), the general store (shelves of jars and bolts,
//     baskets and garlic from the rafters, a barrel of apples, brooms, the bell on the counter), the forge (chains and
//     horseshoes overhead, shields on the wall, ingots stacked — and the anvil ringing with sparks while the smith works),
//     the fish market (fish hung on lines, oars and a life-ring, crates on ice, rope), the bazaar (bunting under the roof,
//     patterned rugs, an incense burner smoking), the fine goods house (gilt frames, crystal drops), the keep's hall (shields
//     and crossed swords, stag heads, iron candle-wheels, burning wall torches, the war table) and the barracks (the duty roll).
//  ROOMSTYLE(lv, spec, items, spot) — called by ROOMLIFE once the room is furnished.
// ════════════════════════════════════════════════════════════════
const ROOMSTYLE=(function(){
  const dk=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
  function kindOf(spec,items){ const R=spec.room, ks=new Set(R?R.objs.map(o=>o[0]):[]);
    if(spec.theme==='inn') return ks.has('bed')?'innrooms':'tavern'; if(spec.theme==='keep') return items.filter(i=>i.k==='bed').length>=3?'barracks':'hall';
    if(ks.has('furnace')) return 'forge'; if(ks.has('ice')) return 'fish'; if(ks.has('spice')||ks.has('cushions')) return 'bazaar'; if(ks.has('perfume')||ks.has('vitrine')) return 'fine'; if(spec.theme==='shop') return 'store'; return null; }
  // ── canvas pictures for the boards ──
  const TX={}; function slate(key,lines,bg,fg){ if(TX[key]) return TX[key]; const c=document.createElement('canvas'); c.width=128; c.height=96; const x=c.getContext('2d'); x.fillStyle=bg; x.fillRect(0,0,128,96); x.strokeStyle='#8a6440'; x.lineWidth=6; x.strokeRect(0,0,128,96);
    x.fillStyle=fg; x.textAlign='center'; lines.forEach((l,i)=>{ x.font=(i===0?'bold 15px':'12px')+' serif'; x.fillText(l,64,24+i*17); }); return TX[key]=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}); }
  function dartTex(){ if(TX.dart) return TX.dart; const c=document.createElement('canvas'); c.width=c.height=96; const x=c.getContext('2d'); [['#1a1a1a',46],['#e8dcc0',40],['#c0392e',30],['#e8dcc0',24],['#2a7a3a',12],['#c0392e',5]].forEach(([col,r])=>{ x.fillStyle=col; x.beginPath(); x.arc(48,48,r,0,7); x.fill(); });
    x.strokeStyle='#1a1a1a'; for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; x.beginPath(); x.moveTo(48,48); x.lineTo(48+Math.cos(a)*40,48+Math.sin(a)*40); x.stroke(); } return TX.dart=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}); }
  function rugTex(seed,a,b,c2){ const key='rug'+seed; if(TX[key]) return TX[key]; const c=document.createElement('canvas'); c.width=128; c.height=96; const x=c.getContext('2d'); x.fillStyle=a; x.fillRect(0,0,128,96); x.fillStyle=b; x.fillRect(8,8,112,80); x.fillStyle=a; x.fillRect(14,14,100,68);
    x.fillStyle=c2; for(let i=0;i<5;i++){ x.beginPath(); x.moveTo(30+i*17,48); x.lineTo(38+i*17,34); x.lineTo(46+i*17,48); x.lineTo(38+i*17,62); x.fill(); } x.fillStyle=b; for(let i=0;i<14;i++){ x.fillRect(4+i*9,1,4,5); x.fillRect(4+i*9,90,4,5); } return TX[key]=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}); }

  function style(lv,spec,items,spot){ const kind=kindOf(spec,items); if(!kind) return; const room=lv.room, an=lv.anim, pal=lv.pal, W=lv.W, H=lv.H, G=lv.G, Rm=spec.room;
    const deco=group(0,0,0,room), keep=group(0,0,0,room); deco.userData.keepScale=keep.userData.keepScale=true; const WH=typeof WALL_H!=='undefined'?WALL_H:2.75;
    const free=(x,z)=>lv.canMove(x,z,x,z); const BL=lv._blk=lv._blk||[];
    // the north wall's bare stretches (no window, no wall-piece, floor open before it), and the side walls'
    const used=new Set(); (Rm&&Rm.wall||[]).forEach(([k,x,w])=>{ for(let i=-1;i<(w||1)+1;i++) used.add(x+i); }); for(let x=0;x<W;x++) if(G[0]&&G[0][x]!==5) { used.add(x-1); used.add(x); used.add(x+1); }
    const north=[]; for(let x=1;x<W-1;x++) if(G[0][x]===5&&!used.has(x)&&free(x+0.5,1.5)) north.push(x+0.5);
    const sides=[]; for(let y=2;y<H-2;y++){ if(G[y][0]===5&&free(1.5,y+0.5)) sides.push([1.0,y+0.5,Math.PI/2]); if(G[y][W-1]===5&&free(W-1.5,y+0.5)) sides.push([W-1.0,y+0.5,-Math.PI/2]); }
    const take=(arr,n,seed)=>{ const out=[]; const a=arr.slice(); for(let i=0;i<n&&a.length;i++){ const k=Math.floor(hsh(seed+i*7,W+H)*a.length); out.push(a.splice(k,1)[0]); } return out; };
    // something hung on the wall: g faces into the room
    const onNorth=(x,fn)=>{ const g=group(x,0,1.02,deco); fn(g); return g; }, onSide=([x,z,r],fn)=>{ const g=group(x+(r>0?0.02:-0.02),0,z,deco); g.rotation.y=r; fn(g); return g; };
    const onWall=(slot,fn)=>typeof slot==='number'?onNorth(slot,fn):onSide(slot,fn);
    const slotXZ=slot=>typeof slot==='number'?{x:slot,z:1.6}:{x:slot[0]+(slot[2]>0?0.6:-0.6),z:slot[1]};
    // under the roof: points between the beams
    const rafters=[]; for(let x=2;x<W-1;x+=2) for(let z=2;z<H-1.5;z+=2.2) rafters.push([x+(hsh(x,z*3)-0.5)*0.4,z]);
    const hang=(x,z,len,fn)=>{ const g=group(x,0,z,deco); B(0.012,len,0.012,0x3a2a1a,0,WH-0.2-len,0,g); const h=group(0,WH-0.2-len,0,g); fn(h); return g; };
    // a floor piece against a wall, out of the way: a cell open, its wall behind it, and the cells either side open too
    const floorSlots=[]; for(let y=1;y<H-3;y++) for(let x=1;x<W-1;x++){ const cx=x+0.5, cz=y+0.5; if(!free(cx,cz)) continue; const back=[[0,-1],[-1,0],[1,0]].find(([a,b])=>G[y+b]&&G[y+b][x+a]===5); if(!back) continue; if(!free(cx-back[1],cz-back[0])&&!free(cx+back[1],cz+back[0])) continue; if(!free(cx-back[0],cz-back[1])) continue; floorSlots.push([cx+back[0]*0.15,cz+back[1]*0.15,back]); }
    const onFloor=(n,seed,fn,r)=>take(floorSlots,n,seed).forEach(([x,z,b])=>{ const g=group(x,0,z,deco); g.rotation.y=Math.atan2(-b[0],-b[1]); fn(g,x,z); BL.push({x,z,r:r||0.32}); });
    // ── pieces ──
    const P={
      antlers:g=>{ B(0.3,0.36,0.05,0x5a3a20,0,1.6,0,g); [-1,1].forEach(s=>{ for(let i=0;i<4;i++){ const t=Cy(0.012,0.02,0.22,5,0xe8dcc0,s*(0.08+i*0.06),1.85+i*0.05,0.04,g); t.rotation.z=-s*(0.5-i*0.15); } }); },
      shields:g=>{ [-0.22,0.22].forEach((x,i)=>{ const s=Cy(0.2,0.2,0.04,12,i?pal.accent:0x8a2a2a,x,1.55,0.03,g); s.rotation.x=Math.PI/2; Cy(0.05,0.05,0.06,8,0xc9a94a,x,1.55,0.05,g).rotation.x=Math.PI/2; }); [-1,1].forEach(s=>{ const b=B(0.04,0.9,0.02,0xd8dce4,0,1.25,0.07,g); b.rotation.z=s*0.6; }); },
      mugs:g=>{ B(1.1,0.05,0.22,0x5a3a20,0,1.4,0.1,g); for(let i=0;i<6;i++) Cy(0.05,0.045,0.12,8,i%2?0xa8a8b0:0x8a6a42,-0.45+i*0.18,1.45,0.1,g); B(1.1,0.05,0.22,0x5a3a20,0,1.75,0.1,g); for(let i=0;i<4;i++) Cy(0.04,0.06,0.2,8,[0x3a6a3a,0x6a2a2a,0x2a4a6a,0x6a5a2a][i],-0.35+i*0.24,1.8,0.1,g); },
      jars:g=>{ for(let r=0;r<2;r++){ B(1.2,0.05,0.24,0x5a3a20,0,1.1+r*0.45,0.1,g); for(let i=0;i<5;i++) Cy(0.06,0.07,0.16+(i%2)*0.06,8,[0xc8a070,0x6a8ab8,0xe8dcc8,0x8a5a3a,0x9ab06a][(i+r)%5],-0.45+i*0.22,1.15+r*0.45,0.1,g); } },
      bolts:g=>{ B(1.2,0.05,0.3,0x5a3a20,0,1.0,0.12,g); for(let i=0;i<5;i++){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.28,8),mt([0x8a2a5a,0x2f4a8f,0xe8c766,0x3a8a6a,0xc8402e][i])); c.rotation.x=Math.PI/2; c.position.set(-0.46+i*0.23,1.13,0.12); g.add(c); } },
      shoes:g=>{ for(let i=0;i<6;i++){ const h=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.014,4,10,Math.PI*1.4),mt(0x4a4a52)); h.position.set(-0.4+(i%3)*0.4,1.3+Math.floor(i/3)*0.3,0.03); h.rotation.z=Math.PI*0.8; g.add(h); } },
      oars:g=>{ [-1,1].forEach(s=>{ const o=B(0.05,1.3,0.03,0x8a6a42,0,1.5,0.04,g); o.rotation.z=s*0.45; const bl=B(0.12,0.3,0.02,0x8a6a42,s*-0.26,2.05,0.04,g); bl.rotation.z=s*0.45; }); const r=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.05,6,16),mt(0xe8e0d0)); r.position.set(0,1.45,0.06); g.add(r); [0,1,2,3].forEach(i=>{ const q=B(0.05,0.11,0.11,0xc0392e,Math.cos(i*Math.PI/2)*0.17,1.45+Math.sin(i*Math.PI/2)*0.17,0.06,g); q.rotation.z=i*Math.PI/2; }); },
      frame:g=>{ B(0.6,0.75,0.05,0xc9a94a,0,1.45,0,g); B(0.5,0.65,0.02,0x5a6a8a,0,1.5,0.03,g); },
      stag:g=>{ B(0.28,0.34,0.05,0x5a3a20,0,1.75,0,g); Sp(0.1,0x7a5232,0,1.8,0.1,g,8,6).scale.set(0.8,1,1.3); [-1,1].forEach(s=>{ for(let i=0;i<3;i++){ const t=Cy(0.012,0.02,0.24,5,0xe8dcc0,s*(0.07+i*0.06),1.98+i*0.07,0.08,g); t.rotation.z=-s*(0.6-i*0.2); } }); },
      torch:g=>{ B(0.06,0.3,0.06,0x2a2a2a,0,1.35,0.06,g); const f=Co(0.05,0.16,6,glow(0xffb050),0,1.7,0.08,g); f.userData.keep=true; an.push(t=>{ f.scale.y=1+Math.sin(t*12+g.position.x)*0.25; }); },
      tapestry:g=>{ B(0.8,1.3,0.03,pal.accent,0,0.9,0.02,g); B(0.84,0.06,0.05,pal.trim,0,2.2,0.02,g); B(0.5,0.5,0.035,pal.trim,0,1.6,0.03,g); }
    };
    const LIFE={
      menu:(slot)=>{ const g=onWall(slot,g=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.52),slate('menu',['Today’s Fare','Lamb & barley stew','Brown bread, butter','Cider · Ale · Milk'],'#2a2a28','#f0ecd8')); m.position.set(0,1.55,0.03); m.userData.keep=true; g.add(m); }); const p=slotXZ(slot);
        spot(p.x,p.z,'Read','The slate',()=>ENGINE.speak('Today’s fare',['Lamb and barley stew, with brown bread and butter.','Cider, ale, or warm milk with honey.','“Every man should eat and drink, and enjoy the good of all his labour, it is the gift of God.” — Ecclesiastes 3:13'])); },
      dart:(slot)=>{ onWall(slot,g=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(0.22,24),dartTex()); d.position.set(0,1.55,0.03); d.userData.keep=true; g.add(d); }); const p=slotXZ(slot); let best=0;
        spot(p.x,p.z+(typeof slot==='number'?0.6:0),'Throw','The dartboard',()=>{ const sc=[0,0,5,10,20,25,50]; const r=[0,1,2].map(()=>sc[Math.floor(Math.random()*Math.random()*sc.length*1.3)%sc.length]); const t=r.reduce((a,b)=>a+b,0); best=Math.max(best,t);
          UI.toast(`🎯 Thunk, thunk, thunk — ${r.join(' + ')} = ${t}${t>=60?'. The room cheers!':t===0?'. A patron hides a smile.':'.'} (Best tonight: ${best})`,2200); },1.3); },
      map:(x,z)=>{ const g=group(x,0,z,deco); B(1.6,0.08,1.0,0x5a3a20,0,0.76,0,g); [[-0.7,-0.4],[0.7,-0.4],[-0.7,0.4],[0.7,0.4]].forEach(([a,b])=>B(0.08,0.76,0.08,0x4a2e18,a,0,b,g));
        const c=document.createElement('canvas'); c.width=160; c.height=100; const q=c.getContext('2d'); q.fillStyle='#e8dcb0'; q.fillRect(0,0,160,100); q.fillStyle='#8ab06a'; q.beginPath(); q.moveTo(10,80); q.quadraticCurveTo(40,10,90,20); q.quadraticCurveTo(150,25,150,80); q.fill(); q.fillStyle='#7aa8d0'; q.fillRect(60,40,18,30);
        q.fillStyle='#c0392e'; for(let i=0;i<10;i++){ q.beginPath(); q.arc(24+i*12,40+Math.sin(i)*18,3,0,7); q.fill(); } const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.92),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)})); m.rotation.x=-Math.PI/2; m.position.y=0.81; m.userData.keep=true; g.add(m);
        [[0.3,0.2],[-0.4,-0.1],[0.1,-0.3]].forEach(([a,b],i)=>Co(0.03,0.1,5,i?0x2f4a8f:0xc0392e,a,0.81,b,g)); BL.push({x,z,r:0.75});
        spot(x,z+0.9,'Study','The war table',()=>ENGINE.speak('The war table',['Luminar, from Hearthvale to Hellgate, with a red pin in every chapel.','The pins come out one by one as the chapels are cleansed. Someone has been keeping count.'])); },
      roster:(slot)=>{ onWall(slot,g=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.75),slate('roster',['Duty Roll','First watch — Gareth','Second — Hollis','Dawn — Bram','“Be watchful” 1 Cor 16:13'],'#e8dcb0','#3a2a1a')); m.position.set(0,1.5,0.03); m.userData.keep=true; g.add(m); }); const p=slotXZ(slot);
        spot(p.x,p.z,'Read','The duty roll',()=>ENGINE.speak('The duty roll',['First watch: Gareth. Second: Hollis. Dawn: Bram.','Underneath, in a different hand: “Watch ye, stand fast in the faith, quit you like men, be strong.” — 1 Corinthians 16:13'])); },
      bell:(x,z)=>{ const g=group(x,0.95*PROP_IN+0.03,z,deco); Cy(0.05,0.05,0.02,10,0x5a3a20,0,0,0,g); const b=Co(0.045,0.07,10,0xd8b04a,0,0.02,0,g); spot(x,z+0.8,'Ring','The counter bell',()=>{ AMBI.clang&&AMBI.clang(); UI.toast('🔔 Ding! “Coming, coming — what can I get you?”',1500); },0.9); },
      apples:(x,z)=>{ const g=group(x,0,z,deco); Cy(0.28,0.24,0.5,10,0x7a5432,0,0,0,g); for(let i=0;i<9;i++) Sp(0.07,i%3?0xc0392e:0x8ab04a,Math.cos(i*2.2)*0.15,0.52,Math.sin(i*2.2)*0.15,g,6,5); spot(x,z+0.4,'Look','A barrel of apples',()=>UI.toast('🍎 Red and green, a copper for three. The keeper keeps count.',1500),0.95); },
      incense:(x,z)=>{ const g=group(x,0,z,deco); Cy(0.04,0.15,0.6,8,0xc9a94a,0,0,0,g); Cy(0.14,0.08,0.12,8,0xc9a94a,0,0.6,0,g); const sm=[]; for(let i=0;i<6;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,5),new THREE.MeshBasicMaterial({color:0xd8d0e0,transparent:true,opacity:0.3,depthWrite:false})); p.position.y=0.75; keep.add(p); p.position.x=x; p.position.z=z; sm.push(p); }
        an.push(t=>sm.forEach((p,i)=>{ const k=(t*0.25+i/6)%1; p.position.set(x+Math.sin(t+i)*0.08*k,0.75+k*1.3,z+Math.cos(t*0.7+i)*0.08*k); p.scale.setScalar(1+k*2.5); p.material.opacity=0.3*(1-k); })); BL.push({x,z,r:0.25});
        spot(x,z+0.5,'Smell','The incense',()=>UI.toast('🌫 Frankincense and myrrh. You think of the wise men, and a long road under a star.',2000),0.9); }
    };
    // ── by kind ──
    const N=take(north,north.length,3), S=take(sides,sides.length,5);
    if(kind==='tavern'){ const ws=N.concat(S); if(ws.length) LIFE.menu(ws.shift()); const di=ws.findIndex(s=>typeof s!=='number'); if(di>=0) LIFE.dart(ws.splice(di,1)[0]); else if(ws.length) LIFE.dart(ws.shift()); ws.slice(0,4).forEach((s,i)=>onWall(s,[P.antlers,P.mugs,P.shields,P.antlers][i]));
      take(rafters,8,1).forEach(([x,z],i)=>hang(x,z,0.35,h=>{ if(i%2){ for(let k=0;k<4;k++) Cy(0.04,0.035,0.1,8,0x8a6a42,(k-1.5)*0.1,-0.1-(k%2)*0.05,0,h); B(0.45,0.02,0.02,0x5a3a20,0,0,0,h); } else for(let k=0;k<5;k++) Sp(0.05,0x8ab04a,(k-2)*0.08,-0.05-Math.abs(k-2)*0.03,0,h,6,4); })); }
    if(kind==='innrooms'){ items.filter(i=>i.k==='bed').forEach(b=>{ const x=b.x+0.75, z=b.z-0.5; if(!free(x,z)) return; const g=group(x,0,z,deco); B(0.36,0.5,0.32,0x5a3a20,0,0,0,g); Cy(0.025,0.03,0.12,6,0xf0e8d0,0,0.5,0,g); const f=Co(0.025,0.07,5,glow(0xffd27a),0,0.64,0,g); f.userData.keep=true; an.push(t=>{ f.scale.y=1+Math.sin(t*12+x)*0.25; }); BL.push({x,z,r:0.22}); }); }
    if(kind==='store'){ N.concat(S).slice(0,5).forEach((s,i)=>onWall(s,[P.jars,P.bolts,P.jars,P.frame,P.bolts][i]));
      take(rafters,9,2).forEach(([x,z],i)=>hang(x,z,0.4,h=>{ if(i%3===0){ const b=Cy(0.16,0.12,0.16,10,0xb8945a,0,-0.2,0,h); } else if(i%3===1){ for(let k=0;k<6;k++) Sp(0.045,0xf0e8d8,0,-0.05-k*0.07,0,h,6,4); } else for(let k=0;k<4;k++) Co(0.04,0.22,5,[0xc04a6a,0xe8c040,0x8a5ab8,0xe8e0d0][k],(k-1.5)*0.06,-0.25,0,h).rotation.x=Math.PI; }));
      const fs=take(floorSlots,2,9); if(fs[0]) LIFE.apples(fs[0][0],fs[0][1]), BL.push({x:fs[0][0],z:fs[0][1],r:0.3}); if(fs[1]){ const g=group(fs[1][0],0,fs[1][1],deco); Cy(0.2,0.18,0.5,10,0x7a5432,0,0,0,g); for(let i=0;i<3;i++){ B(0.03,1.1,0.03,0x8a6a42,(i-1)*0.07,0.3,0,g); Co(0.08,0.28,6,0xc8a868,(i-1)*0.07,1.32,0,g); } BL.push({x:fs[1][0],z:fs[1][1],r:0.25}); }
      const ctr=(Rm.objs||[]).find(o=>o[0]==='counter'); if(ctr){ const [k,x,y,w,h]=ctr; LIFE.bell(x+(w||1)-0.4,y+(h||1)/2); } }
    if(kind==='forge'){ N.concat(S).slice(0,4).forEach((s,i)=>onWall(s,[P.shields,P.shoes,P.shields,P.shoes][i]));
      take(rafters,6,3).forEach(([x,z],i)=>hang(x,z,0.6,h=>{ for(let k=0;k<6;k++){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.035,0.01,4,8),mt(0x4a4a52)); r.position.y=-k*0.06; r.rotation.y=k%2?Math.PI/2:0; h.add(r); } if(i%2) { const hk=new THREE.Mesh(new THREE.TorusGeometry(0.05,0.012,4,10,Math.PI*1.3),mt(0x4a4a52)); hk.position.y=-0.4; h.add(hk); } }));
      const fs=take(floorSlots,1,7); if(fs[0]){ const g=group(fs[0][0],0,fs[0][1],deco); for(let i=0;i<6;i++) B(0.24,0.07,0.1,0x8a8a92,(i%3-1)*0.12,Math.floor(i/3)*0.07,(i%2)*0.02,g); BL.push({x:fs[0][0],z:fs[0][1],r:0.25}); }
      // the smith at work: the anvil rings and the sparks fly, every few seconds, while you are in the room
      const av=items.find(i=>i.k==='anvil'); if(av){ let nx=2; an.push((t,dt)=>{ if(ENGINE.level!==lv||ENGINE.busy) return; nx-=dt||0.016; if(nx<0){ nx=2.5+Math.random()*3; const P0=ENGINE.P, d=Math.hypot(P0.x-av.x,P0.z-av.z); if(d<9&&AMBI.clang) AMBI.clang();
          for(let i=0;i<8;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.02,0.02),new THREE.MeshBasicMaterial({color:i%2?0xffd060:0xff8a2a})); m.position.set(av.x,0.62*PROP_IN,av.z); room.add(m); const v=[(Math.random()-0.5)*2,1.2+Math.random(),(Math.random()-0.5)*2]; let tt=0; const fly=(t2,d2)=>{ d2=d2||0.016; tt+=d2; m.position.x+=v[0]*d2; m.position.z+=v[2]*d2; v[1]-=6*d2; m.position.y+=v[1]*d2; if(tt>0.6){ room.remove(m); an.splice(an.indexOf(fly),1); } }; an.push(fly); } } }); } }
    if(kind==='fish'){ N.concat(S).slice(0,3).forEach(s=>onWall(s,P.oars));
      take(rafters,8,4).forEach(([x,z],i)=>hang(x,z,0.5,h=>{ for(let k=0;k<3;k++){ const f=Sp(0.06,[0x8ab0c8,0x9a8a6a,0xb8c8d0][k],(k-1)*0.1,-0.12-k*0.03,0,h,8,5); f.scale.set(0.6,1.8,0.4); Co(0.04,0.06,3,0x6a8aa0,(k-1)*0.1,-0.32-k*0.03,0,h).rotation.x=Math.PI; } }));
      take(floorSlots,2,5).forEach(([x,z])=>{ const g=group(x,0,z,deco); B(0.6,0.32,0.45,0x8a6a42,0,0,0,g); B(0.56,0.04,0.41,0xdff2fa,0,0.3,0,g); for(let i=0;i<4;i++){ const f=Sp(0.06,0x9ab0c0,-0.18+i*0.12,0.36,0,g,8,5); f.scale.set(0.5,0.5,2.2); } BL.push({x,z,r:0.32});
        spot(x,z+0.5,'Look','A crate of fish',()=>UI.toast('🐟 Herring and mackerel on ice, caught this morning. The gulls are furious about it.',1800),0.9); }); }
    if(kind==='bazaar'){ // bunting under the roof, and the incense
      for(let z=2;z<H-2;z+=2.4){ const cols=[0xc8402e,0xe8c766,0x2f6a8a,0x8a5ab8,0x3a8a6a]; for(let x=1.2;x<W-1.2;x+=0.45){ const t=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.22,3),new THREE.MeshLambertMaterial({color:cols[Math.floor(x*2.2)%5],side:THREE.DoubleSide})); t.rotation.x=Math.PI; t.scale.z=0.15; t.position.set(x,WH-0.55-Math.sin((x-1)/(W-2.4)*Math.PI)*0.35,z); deco.add(t); } }
      const fs=take(floorSlots,1,8); if(fs[0]) LIFE.incense(fs[0][0],fs[0][1]);
      (Rm.objs||[]).filter(o=>o[0]==='rugs'||o[0]==='carpet').forEach(([k,x,y,w,h],i)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry((w||1)-0.25,(h||1)-0.25),rugTex(i%3,['#8a2a3a','#2a3a6a','#6a3a1a'][i%3],'#d8a040','#e8dcc0')); m.rotation.x=-Math.PI/2; m.position.set(x+(w||1)/2,0.025,y+(h||1)/2); keep.add(m); }); }
    if(kind==='fine'){ N.concat(S).slice(0,4).forEach(s=>onWall(s,P.frame)); take(rafters,5,6).forEach(([x,z])=>hang(x,z,0.3,h=>{ for(let k=0;k<5;k++) Co(0.03,0.1,6,0xd8ecff,(k-2)*0.06,-0.08-Math.abs(k-2)*0.04,0,h).rotation.x=Math.PI; })); }
    if(kind==='hall'||kind==='barracks'){ const ws=N.concat(S); if(kind==='barracks'&&ws[0]!==undefined) LIFE.roster(ws.shift()); ws.slice(0,6).forEach((s,i)=>onWall(s,[P.shields,P.torch,P.stag,P.torch,P.tapestry,P.shields][i]));
      // iron candle-wheels from the beams
      take(rafters,2,7).forEach(([x,z])=>hang(x,z,0.5,h=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.03,5,16),mt(0x2a2a30)); r.rotation.x=Math.PI/2; h.add(r); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; Cy(0.02,0.02,0.09,5,0xf0e8d0,Math.cos(a)*0.4,0.01,Math.sin(a)*0.4,h); const f=Co(0.02,0.06,5,glow(0xffd27a),Math.cos(a)*0.4,0.1,Math.sin(a)*0.4,h); f.userData.keep=true; } }));
      if(kind==='hall'){ // the war table, where there is room for it
        let spotM=null; for(let y=2;y<H-3&&!spotM;y++) for(let x=2;x<W-3&&!spotM;x++){ let ok=true; for(let dy=-1;dy<=1&&ok;dy++) for(let dx=-1;dx<=1&&ok;dx++) if(!free(x+0.5+dx,y+0.5+dy)) ok=false; if(ok) spotM=[x+0.5,y+0.5]; }
        if(spotM) LIFE.map(spotM[0],spotM[1]); } }
    if(typeof mergeStatic==='function') mergeStatic(deco);
    // the pieces on the floor are solid
    if(BL.length&&!lv._blkWrapped){ lv._blkWrapped=true; const cm=lv.canMove; lv.canMove=(fx,fz,tx,tz)=>{ if(!cm(fx,fz,tx,tz)) return false; for(const b of BL){ const d=Math.hypot(tx-b.x,tz-b.z); if(d<b.r+0.2&&d<=Math.hypot(fx-b.x,fz-b.z)) return false; } return true; }; }
  }
  return style;
})();

// ── more to the trade's floor: the templates the shops and inns share were laid out for a 2D screen and stand half empty
//    in 3D; these pieces fill their floors with goods and seats, keeping the aisle to the door clear ──
const ROOMSTYLE_EXTRA=(function(){
  const X={
    store:[['display',3,5,2,1],['display',9,5,2,1],['crate',11,8]],
    forge:[['crates',9,4,2,1],['swordbarrel',3,8]],
    fish:[['icetable',10,5,2,1],['crate',3,8]],
    bazaar:[['spice',3,5,2,1],['pot',11,8]],
    tavern:[] };   // (the tavern's floor is full enough — and the spot by its door must stay clear)
  return function(spec){ const R=spec.room; if(!R||R._extra) return spec; const ks=new Set(R.objs.map(o=>o[0]));
    const kind=spec.theme==='inn'?(ks.has('bed')?null:'tavern'):ks.has('furnace')?'forge':ks.has('ice')?'fish':ks.has('spice')?'bazaar':ks.has('perfume')?null:spec.theme==='shop'?'store':null;
    if(!kind||!X[kind]) return spec; return Object.assign({},spec,{room:Object.assign({},R,{objs:R.objs.concat(X[kind]),_extra:true})}); };
})();
// the new pieces' drawings
Object.assign(OBJECTS,{
  display:(p,o)=>{ const g=PROP.table(p,o.cx,o.cz,o.w,o.h,o.pal);
    const goods=[t=>{ for(let i=0;i<7;i++) Sp(0.06,i%3?0xc0392e:0x8ab04a,-0.2+(i%4)*0.12,0.06,(i>3?0.08:-0.06),t,6,5); }, t=>{ for(let i=0;i<3;i++){ const b=Sp(0.1,0xc8904a,-0.22+i*0.2,0.05,0,t,8,6); b.scale.set(1.4,0.6,0.8); } }, t=>{ for(let i=0;i<4;i++) Cy(0.05,0.07,0.16+(i%2)*0.06,8,[0xb86a4a,0x6a8ab8,0xe8dcc8,0x8a5a3a][i],-0.24+i*0.16,0,0,t); }, t=>{ for(let i=0;i<3;i++) Cy(0.1,0.1,0.07,10,0xf0d070,-0.2+i*0.2,0,0,t); }];
    const k=Math.floor(o.cx*3); goods[k%4](group(-o.w*0.25,0.68,0,g)); goods[(k+1)%4](group(o.w*0.25,0.68,0,g)); },
  swordbarrel:(p,o)=>{ const g=group(o.cx,0,o.cz,p); Cy(0.24,0.22,0.6,10,0x7a5432,0,0,0,g); [0.1,0.45].forEach(y=>Cy(0.25,0.25,0.04,10,0x3a3a40,0,y,0,g)); for(let i=0;i<4;i++){ const s=B(0.04,0.9,0.015,0xd8dce4,Math.cos(i*1.6)*0.08,0.35,Math.sin(i*1.6)*0.08,g); s.rotation.z=(i%2?0.1:-0.1); B(0.16,0.03,0.04,0xc9a94a,Math.cos(i*1.6)*0.08,1.2,Math.sin(i*1.6)*0.08,g); } }
});
