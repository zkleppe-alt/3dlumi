// ════════════════════════════════════════════════════════════════
//  DUNGEON GEN — open dungeons in place of the mazes: halls and chambers joined by wide passages (and, in the wood,
//  glades on broad trails), with loops to explore rather than one thread to follow, raised galleries up flights of
//  stairs, colonnades in the great halls. The same things the game puts on a floor are all here, in the same tiles:
//  the way in (8), the stair up (2) behind its stone (16), the plaza (45) with its podium and step (46), the tablet (20),
//  the chests (5) in the far chambers, the demons on their posts — and the floors grow with the chapel: more rooms,
//  more demons, more loops, more height, a third floor at the last two. Seeded, so a chapel is the same every visit.
//  DGEN.crypt(floor, tier, seed) rewrites a maze floor in place;  DGEN.forest(D, seed) the Forest of Disillusionment.
//  Tiles new here: 60 a raised floor (1.0 up), 61 a stair between (its ramp in floor.ramps), 58 a pillar.
// ════════════════════════════════════════════════════════════════
const DGEN=(function(){
  function rng(seed){ let s=(seed>>>0)||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
  const ri=(R,a,b)=>a+Math.floor(R()*(b-a+1)), odd=v=>v|1;
  // rooms on a grid, kept apart; then joined by a tree of passages plus a few loops (A* round the other rooms)
  function layout(W,H,R,want,fixed,gap){ const rooms=fixed.slice();
    const free=(r)=>rooms.every(o=>r.x+r.w+gap<=o.x||o.x+o.w+gap<=r.x||r.y+r.h+gap<=o.y||o.y+o.h+gap<=r.y)&&r.x>=2&&r.y>=2&&r.x+r.w<=W-2&&r.y+r.h<=H-2;
    for(let tries=0;tries<want*60&&rooms.length<fixed.length+want;tries++){ const w=odd(ri(R,7,13)), h=odd(ri(R,7,11)), r={x:ri(R,2,W-w-2),y:ri(R,2,H-h-2),w,h,kind:'room'}; if(free(r)) rooms.push(r); }
    return rooms; }
  const ctr=r=>({x:r.x+(r.w>>1),y:r.y+(r.h>>1)});
  function edges(rooms,R,loops,leaf){ const n=rooms.length, inT=[0], E=[], d=(a,b)=>{ const A=ctr(rooms[a]),B=ctr(rooms[b]); return Math.abs(A.x-B.x)+Math.abs(A.y-B.y); };
    const pool=[...Array(n).keys()].filter(i=>i!==0);
    while(pool.length){ let best=null; for(const a of inT) for(const b of pool){ if(leaf.has(a)) continue; const k=d(a,b); if(!best||k<best[2]) best=[a,b,k]; } if(!best) break; E.push([best[0],best[1]]); inT.push(best[1]); pool.splice(pool.indexOf(best[1]),1); }
    const extra=[]; for(let a=0;a<n;a++) for(let b=a+1;b<n;b++){ if(leaf.has(a)||leaf.has(b)) continue; if(E.some(([p,q])=>(p===a&&q===b)||(p===b&&q===a))) continue; extra.push([a,b,d(a,b)]); }
    extra.sort((p,q)=>p[2]-q[2]); for(let k=0;k<loops&&k<extra.length;k++){ const j=Math.min(extra.length-1,k*2+Math.floor(R()*2)); E.push(extra[j].slice(0,2)); }
    return E; }
  // a passage `wid` wide from room a to room b, round the other rooms (A* on the grid; the rooms and a margin are walls)
  function passage(g,W,H,rooms,a,b,wid,carveT){ const A=ctr(rooms[a]), B=ctr(rooms[b]), block=new Uint8Array(W*H), m=1+(wid>>1);
    rooms.forEach((r,i)=>{ if(i===a||i===b) return; for(let y=r.y-m-1;y<=r.y+r.h+m;y++) for(let x=r.x-m-1;x<=r.x+r.w+m;x++) if(x>=0&&y>=0&&x<W&&y<H) block[y*W+x]=1; });
    const lo=m, hiX=W-1-m, hiY=H-1-m, open=[[A.x,A.y,0,Math.abs(A.x-B.x)+Math.abs(A.y-B.y)]], came=new Int32Array(W*H).fill(-1), cost=new Float32Array(W*H).fill(1e9); cost[A.y*W+A.x]=0;
    let found=false, guard=0;
    while(open.length&&guard++<40000){ let bi=0; for(let i=1;i<open.length;i++) if(open[i][3]<open[bi][3]) bi=i; const [x,y,c]=open.splice(bi,1)[0]; if(x===B.x&&y===B.y){ found=true; break; }
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<lo||ny<lo||nx>hiX||ny>hiY) continue; const k=ny*W+nx; if(block[k]) continue;
        const turn=came[y*W+x]>=0&&((came[y*W+x]%W)!==x-dx||((came[y*W+x]/W)|0)!==y-dy)?0.6:0, nc=c+1+turn;   // straight runs, few bends
        if(nc<cost[k]){ cost[k]=nc; came[k]=y*W+x; open.push([nx,ny,nc,nc+Math.abs(nx-B.x)+Math.abs(ny-B.y)]); } } }
    if(!found) return false;
    for(let k=B.y*W+B.x;k>=0&&k!==A.y*W+A.x;k=came[k]){ const x=k%W, y=(k/W)|0; for(let dy=-(wid>>1);dy<=(wid>>1);dy++) for(let dx=-(wid>>1);dx<=(wid>>1);dx++){ const X=x+dx, Y=y+dy; if(X>0&&Y>0&&X<W-1&&Y<H-1&&g[Y][X]===1) g[Y][X]=carveT; } }
    return true; }
  const inRoom=(r,x,y,pad)=>x>=r.x+(pad||0)&&x<r.x+r.w-(pad||0)&&y>=r.y+(pad||0)&&y<r.y+r.h-(pad||0);

  // ── a chapel's maze floor, made a crypt of halls ──
  function crypt(f,tier,seed){ const R=rng(seed), W=odd(53+tier*3), H=odd(55+tier*3), g=[]; for(let y=0;y<H;y++) g.push(new Array(W).fill(1));
    const cxm=W>>1;
    const entry={x:cxm-4,y:H-10,w:9,h:7,kind:'entry'}, plaza={x:cxm-7,y:(H>>1)-6,w:15,h:13,kind:'plaza'}, stair={x:cxm-4,y:2,w:9,h:7,kind:'stair'};
    const rooms=layout(W,H,R,5+tier,[entry,stair,plaza],3);
    rooms.forEach(r=>{ for(let y=r.y;y<r.y+r.h;y++) for(let x=r.x;x<r.x+r.w;x++) g[y][x]=0; });
    // passages: the stair room hangs off the plaza alone (its way in is the stone's doorway)
    const sI=rooms.indexOf(stair), pI=rooms.indexOf(plaza), E=edges(rooms,R,1+Math.floor(tier/2),new Set([sI])).filter(([a,b])=>a!==sI&&b!==sI);
    E.forEach(([a,b])=>passage(g,W,H,rooms,a,b,3,0));
    // plaza → stair: straight up, three wide; the stone fills the doorway
    for(let y=stair.y+stair.h;y<plaza.y;y++) for(let x=cxm-1;x<=cxm+1;x++) g[y][x]=0;
    for(let x=cxm-1;x<=cxm+1;x++) g[stair.y+stair.h][x]=16;
    // the way in, the stair, the plaza's dais and podium and its step, the tablet on the plaza's back wall
    g[entry.y+entry.h-1][cxm]=8; g[stair.y+1][cxm]=2;
    for(let y=plaza.y+4;y<plaza.y+7;y++) for(let x=cxm-2;x<=cxm+2;x++) g[y][x]=45;
    g[plaza.y+7][cxm]=46; f.podium={x:cxm,y:plaza.y+5,risen:false};
    { const tx=cxm+4; if(g[plaza.y-1][tx]===1) g[plaza.y-1][tx]=20; }
    // the plaza's statuary (chapel_themes.js draws it): an angel either side of the dais, the guardian's mark beyond them
    { const py=plaza.y+5; [-3,3].forEach(dx=>{ if(g[py-2][cxm+dx]===0) g[py-2][cxm+dx]=57; }); for(const s of [-1,1]) for(let dx=3;dx<=5;dx++) for(let y=py;y<=py+1;y++) if(g[y][cxm+s*dx]===0) g[y][cxm+s*dx]=62; }   // 62: kept clear of demons' posts, but walkable — the pieces themselves are solid (their own footprint)
    // colonnades in the great rooms (aisles left clear); raised galleries up stairs from tier 2
    const ramps={};
    rooms.forEach(r=>{ if(r.kind==='stair'||r.kind==='entry') return; if(r.w<11&&r.kind!=='plaza') return;
      for(let y=r.y+2;y<r.y+r.h-2;y+=3) for(const x of [r.x+2,r.x+r.w-3]) if(g[y][x]===0) g[y][x]=58; });
    const side=rooms.filter(r=>r.kind==='room'); const nRaise=tier>=2?Math.min(side.length-2,1+Math.floor(tier/3)):0;
    side.slice(0,Math.max(0,nRaise)).forEach(r=>{ r.raised=true; for(let y=r.y;y<r.y+r.h;y++) for(let x=r.x;x<r.x+r.w;x++) if(g[y][x]===0) g[y][x]=60;
      // where a passage meets the room, its last three cells become a stair up into it
      for(let y=r.y;y<r.y+r.h;y++) for(let x=r.x;x<r.x+r.w;x++){ if(!(x===r.x||y===r.y||x===r.x+r.w-1||y===r.y+r.h-1)) continue;
        const out=x===r.x?[-1,0]:x===r.x+r.w-1?[1,0]:y===r.y?[0,-1]:[0,1];
        for(let k=1;k<=3;k++){ const X=x+out[0]*k, Y=y+out[1]*k; if(g[Y]&&g[Y][X]===0){ g[Y][X]=61; ramps[X+','+Y]={dx:-out[0],dy:-out[1],h0:(3-k)/3,h1:(4-k)/3}; } else break; } } });
    // chests in the farthest chambers; demons through the rooms (more, deeper)
    const far=side.slice().sort((a,b)=>(ctr(b).y-ctr(a).y)*0+((Math.abs(ctr(b).x-cxm)+Math.abs(ctr(b).y-(H>>1)))-(Math.abs(ctr(a).x-cxm)+Math.abs(ctr(a).y-(H>>1)))));
    const chests=(f.chests||[]).slice(); while(chests.length<2+Math.floor(tier/3)) chests.push({items:[['gold',30+tier*12],['pot','potion',1]]});
    chests.forEach((c,k)=>{ const r=far[k%Math.max(1,far.length)]||plaza; let x=ctr(r).x, y=r.y+1; if(k>=far.length){ x+=2*(k-far.length+1); } if(g[y][x]===0||g[y][x]===60){ c.x=x; c.y=y; g[y][x]=5; } });
    f.chests=chests.filter(c=>typeof c.x==='number');
    const proto=(f.demons||[]).filter(d=>!d.boss), want=Math.max(proto.length,proto.length+tier+2), out=[];
    // a tomb at the heart of each broad side room (chapel_themes.js draws it, carved for the town)
    f.tombs=[]; rooms.forEach(r=>{ if(r.kind!=='room'||r.w<9||r.h<9) return; const c=ctr(r); if(g[c.y][c.x]===0&&g[c.y+1][c.x]===0){ g[c.y][c.x]=57; g[c.y+1][c.x]=57; f.tombs.push({x:c.x,y:c.y}); } });
    const posts=[]; rooms.forEach(r=>{ if(r.kind==='entry') return; const n=r.kind==='plaza'?3:r.kind==='stair'?0:r.raised?2:ri(R,1,2);   // none behind the stone: the stone opens only once every demon has fallen
      for(let k=0;k<n;k++){ for(let t=0;t<30;t++){ const x=ri(R,r.x+1,r.x+r.w-2), y=ri(R,r.y+1,r.y+r.h-2); if((g[y][x]===0||g[y][x]===60)&&!posts.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)<3)){ posts.push({x,y}); break; } } } });
    for(let k=0;k<want&&posts.length;k++){ const p=posts.splice(Math.floor(R()*posts.length),1)[0], d=Object.assign({},proto[k%proto.length]||{hp:30,level:3,xp:9,atk:7,patrol:5}); d.x=p.x; d.y=p.y; d.patrol=Math.max(d.patrol||5,6); out.push(d); }
    // and none anywhere you couldn't walk to from the way in (the stone shut): every demon on a floor must be reachable to clear it
    { const SOL=new Set([1,16,20,58,57,5,2]), seen=new Set(), q=[[cxm,entry.y+entry.h-2]]; seen.add(q[0]+'');
      while(q.length){ const [x,y]=q.pop(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy, k=X+','+Y; if(seen.has(k)||!g[Y]||g[Y][X]===undefined||SOL.has(g[Y][X])) continue; seen.add(k); q.push([X,Y]); } }
      for(let k=out.length-1;k>=0;k--) if(!seen.has(out[k].x+','+out[k].y)) out.splice(k,1); }
    f.demons=out; f.grid=g; f.arrive={x:cxm,y:entry.y+entry.h-2}; f.ramps=ramps; f.open=true; f.columns=[]; f.rooms=rooms.length; f.layout=rooms.map(r=>({x:r.x,y:r.y,w:r.w,h:r.h,kind:r.kind,raised:!!r.raised})); f.cxm=cxm; return f; }

  // ── the Forest of Disillusionment: glades on broad trails, the hollow and Robby's tree at the two farthest ──
  function forest(D,seed){ const R=rng(seed), W=61, H=97, g=[]; for(let y=0;y<H;y++) g.push(new Array(W).fill(1));
    const mid=W>>1, start={x:mid-4,y:2,w:9,h:7,kind:'entry'}, end={x:mid-4,y:H-9,w:9,h:7,kind:'exit'};
    const rooms=layout(W,H,R,12,[start,end],4);
    // glades round, not square
    rooms.forEach(r=>{ const c=ctr(r); for(let y=r.y;y<r.y+r.h;y++) for(let x=r.x;x<r.x+r.w;x++){ const u=(x-c.x)/(r.w/2), v=(y-c.y)/(r.h/2); if(u*u+v*v<=1.08) g[y][x]=0; } });
    const E=edges(rooms,R,4,new Set()); E.forEach(([a,b])=>passage(g,W,H,rooms,a,b,3,0));
    // the trails wander: nibble their edges
    for(let y=2;y<H-2;y++) for(let x=2;x<W-2;x++) if(g[y][x]===1){ const n=[g[y-1][x],g[y+1][x],g[y][x-1],g[y][x+1]].filter(t=>t===0).length; if(n>=2&&R()<0.18) g[y][x]=0; }
    g[start.y+1][mid]=8; g[end.y+end.h-2][mid]=2;
    // the hollow at the farthest glade, Robby's tree at the next (by trail from the way in)
    const dist=new Int32Array(W*H).fill(-1), q=[[mid,start.y+1]]; dist[(start.y+1)*W+mid]=0;
    while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(g[ny]&&g[ny][nx]!==undefined&&g[ny][nx]!==1&&dist[ny*W+nx]<0){ dist[ny*W+nx]=dist[y*W+x]+1; q.push([nx,ny]); } } }
    const glades=rooms.filter(r=>r.kind==='room').map(r=>({r,d:dist[ctr(r).y*W+ctr(r).x]})).filter(o=>o.d>0).sort((a,b)=>b.d-a.d);
    if(glades[0]){ const c=ctr(glades[0].r); g[glades[0].r.y+1][c.x]=35; }
    if(glades[1]){ const r=glades[1].r; let best=null; for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x;x<=r.x+r.w;x++) if(g[y][x]===1&&g[y][x-1]===0&&(!best||x>best[0])) best=[x,y]; if(best) g[best[1]][best[0]]=78; }   // the glades are round: the tree on its east rim
    // chests and demons in the glades
    const others=glades.slice(2).map(o=>o.r); let nc=0;
    others.forEach((r,k)=>{ if(nc<4&&k%2===0){ const c=ctr(r); g[c.y][c.x+1]=5; nc++; } });
    let nd=0; rooms.forEach(r=>{ if(r.kind!=='room') return; const n=ri(R,0,2); for(let k=0;k<n&&nd<12;k++){ const x=ri(R,r.x+1,r.x+r.w-2), y=ri(R,r.y+1,r.y+r.h-2); if(g[y][x]===0){ g[y][x]=6; nd++; } } });
    D.forest=g; D.forestOpen=true; return D; }
  return {crypt,forest,rng};
})();
