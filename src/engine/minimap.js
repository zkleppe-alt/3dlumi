// ════════════════════════════════════════════════════════════════
//  THE MINIMAP — a round window on the realm's own map (SYS.MAP: one pixel a tile), north up, centred on you.
//  Towns are pinned green (cleansed) or red (still bound); a gold ring marks a moored boat, the dive eddies
//  show once you've been down. Tap it for the full ☰ Map. Hidden indoors, in minigames and in the deep. The portal worlds get their own (MINIMAP.add), drawn from their tiles.
//  minimap(world, extras?) — extras() → [{x,y,col,r,ring?,seek?}] more pins; a 'seek' group none of whose pins is in view
//  gets an arrow on the rim to the nearest. The realm marks the hunt's stragglers (violet), a bounty's cull (amber)
//  and every eddy you've dived (a teal ring).
// ════════════════════════════════════════════════════════════════
const MINIMAP={add(){}};
// a picture of a world's tiles, a pixel a tile (for the portal worlds)
function tileMap(W,H,T,col){ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'), im=g.createImageData(W,H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const v=col(T(x,y),x,y), i=(y*W+x)*4; if(v==null){ im.data[i+3]=0; continue; } im.data[i]=v>>16&255; im.data[i+1]=v>>8&255; im.data[i+2]=v&255; im.data[i+3]=255; }
  g.putImageData(im,0,0); return c; }
function minimap(world,extras){
  const M=SYS.MAP; if(!M||!M.map) return;
  const size=112, scale=3, cv=document.createElement('canvas'), dpr=Math.min(2,devicePixelRatio||1);
  cv.width=cv.height=size*dpr; cv.id='minimap'; cv.setAttribute('aria-label','Minimap — tap for the full map'); cv.setAttribute('role','button');
  cv.style.cssText=`position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:calc(60px + env(safe-area-inset-top,0px));width:${size}px;height:${size}px;border-radius:50%;border:2px solid rgba(242,193,78,.75);box-shadow:0 2px 10px rgba(0,0,0,.45);z-index:4;cursor:pointer;touch-action:none;background:#16202e`;
  document.body.appendChild(cv); const g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
  const img=new Image(); img.src=M.map;
  cv.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); if(typeof MENU!=='undefined') MENU.show('Map'); });
  let t0=0;
  // every level with a map: the realm (SYS.MAP), and each portal world (MINIMAP.add, drawn from its own tiles)
  const maps=new Map([[world,{img,W:M.W,H:M.H,pins:()=>M.towns.map(([n,x,y])=>{ const ti=SYS.TOWN_DATA.findIndex(t=>t.name===n); return {x:x+0.5,y:y+0.5,col:ti<0?'#ffe04a':ti<GAME.S.chapels?'#6fdf8a':'#ff6a7a'}; }).concat(extras?extras():[]),bg:'#1a3a5a'}]]);
  MINIMAP.add=(lv,e)=>{ maps.set(lv,e); lv.anim.push(t=>{ if(t-t0<0.08&&ENGINE.level===lv) return; t0=t; draw(); }); };
  function draw(){ const P=ENGINE.P, e=maps.get(ENGINE.level), here=!!e&&!document.body.classList.contains('mg')&&!(UI.open);
    cv.style.display=here?'block':'none'; if(!here||(e.img.complete===false)) return;
    g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,size,size); g.save(); g.beginPath(); g.arc(size/2,size/2,size/2,0,7); g.clip();
    g.fillStyle=e.bg||'#1a3a5a'; g.fillRect(0,0,size,size);
    const ox=size/2-P.x*scale, oy=size/2-P.z*scale; g.imageSmoothingEnabled=false; g.drawImage(e.img,ox,oy,e.W*scale,e.H*scale);
    const ring=(x,y,col,r)=>{ const px=ox+x*scale, py=oy+y*scale; if(Math.hypot(px-size/2,py-size/2)>size/2+6) return; g.strokeStyle='#06141c'; g.lineWidth=3; g.beginPath(); g.arc(px,py,r||4.5,0,7); g.stroke(); g.strokeStyle=col; g.lineWidth=1.6; g.stroke(); };
    const pin=(x,y,col,r)=>{ const px=ox+x*scale, py=oy+y*scale; if(Math.hypot(px-size/2,py-size/2)>size/2+4) return; g.fillStyle=col; g.strokeStyle='#120c08'; g.lineWidth=1.2; g.beginPath(); g.arc(px,py,r||3.5,0,7); g.fill(); g.stroke(); };
    const ps=e.pins?e.pins():[]; ps.forEach(p=>p.ring?ring(p.x,p.y,p.col,p.r):pin(p.x,p.y,p.col,p.r));
    g.restore();
    // a quarry none of which is in the window gets a pulsing arrow on the rim, pointing to the nearest (as the game's hunt does)
    const far={}; ps.forEach(p=>{ if(!p.seek) return; const d=Math.hypot(p.x-P.x,p.y-P.z), on=d*scale<=size/2-4, f=far[p.seek]||(far[p.seek]={shown:0,near:null,nd:1e9,col:p.col}); if(on) f.shown++; if(d<f.nd){ f.nd=d; f.near=p; } });
    Object.values(far).forEach(f=>{ if(f.shown||!f.near) return; const a=Math.atan2(f.near.y-P.z,f.near.x-P.x), R=size/2-8;
      g.save(); g.translate(size/2+Math.cos(a)*R,size/2+Math.sin(a)*R); g.rotate(a); g.globalAlpha=0.6+0.4*Math.sin(performance.now()/220);
      g.fillStyle='#1a0a14'; g.beginPath(); g.moveTo(7.5,0); g.lineTo(-5,-4.6); g.lineTo(-2.6,0); g.lineTo(-5,4.6); g.closePath(); g.fill();
      g.fillStyle=f.col; g.beginPath(); g.moveTo(5.6,0); g.lineTo(-3.6,-3); g.lineTo(-1.6,0); g.lineTo(-3.6,3); g.closePath(); g.fill(); g.restore(); g.globalAlpha=1; });
    g.save(); g.translate(size/2,size/2); g.rotate(Math.PI-P.face); g.fillStyle='#ffffff'; g.strokeStyle='#c8202a'; g.lineWidth=1.6;
    g.beginPath(); g.moveTo(0,-7); g.lineTo(5,5); g.lineTo(0,2.5); g.lineTo(-5,5); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.fillStyle='rgba(242,226,176,.9)'; g.font='700 9px system-ui,sans-serif'; g.textAlign='center'; g.fillText('N',size/2,10); }
  world.anim.push(t=>{ if(t-t0<0.08&&ENGINE.level===world) return; t0=t; draw(); });
  setInterval(()=>{ if(!maps.has(ENGINE.level)) cv.style.display='none'; },300);
  return { draw };
}

// ════════════════════════════════════════════════════════════════
//  THE DUNGEON MAP — in close quarters (the chapels' floors, the deep wood, the monk's cave) a small square map, north up,
//  that fills in as you go: halls you've seen in grey, the ground you've actually walked in gold (so you can trace your
//  steps and see when you're going in circles), the walls as you meet them, and the ways out and down marked once seen.
//  It remembers each floor for the rest of your session. Tap it to see the whole floor large.
// ════════════════════════════════════════════════════════════════
const DUNMAP=(function(){ const seen={}, cv=document.createElement('canvas'), dpr=Math.min(2,devicePixelRatio||1); let big=false, last=0;
  const size=()=>big?Math.min(320,innerWidth-40):128;
  cv.id='dunmap'; cv.setAttribute('aria-label','Map of where you have been — tap to enlarge'); cv.setAttribute('role','button');
  const place=()=>{ const z=size(); cv.width=cv.height=z*dpr; cv.style.cssText=`position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:calc(60px + env(safe-area-inset-top,0px));width:${z}px;height:${z}px;border-radius:10px;border:2px solid rgba(242,193,78,.75);box-shadow:0 2px 10px rgba(0,0,0,.5);background:rgba(10,8,14,.78);z-index:6;display:none;touch-action:none`; };
  place(); document.body.appendChild(cv); const g=cv.getContext('2d');
  cv.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); big=!big; place(); last=0; });
  function draw(){ const L=ENGINE.level, D=L&&L.dmap, show=!!(L&&(L.close||L.dmapShow)&&D)&&!document.body.classList.contains('mg')&&!(typeof UI!=='undefined'&&UI.open);
    cv.style.display=show?'block':'none'; if(!show) return;
    const P=ENGINE.P, k=L.id, m=seen[k]||(seen[k]={s:new Uint8Array(D.W*D.H)}), S=m.s, px=Math.floor(P.x), pz=Math.floor(P.z);
    // reveal what's around you (a few tiles, not through walls), and mark the tile you're standing on as walked
    const R=D.reveal||(D.trees?2:3); for(let dy=-R;dy<=R;dy++) for(let dx=-R;dx<=R;dx++){ const x=px+dx, y=pz+dy; if(x<0||y<0||x>=D.W||y>=D.H||dx*dx+dy*dy>R*R+1) continue;
      let clear=true; const n=Math.max(Math.abs(dx),Math.abs(dy)); for(let i=1;i<n;i++){ const ix=px+Math.round(dx*i/n), iy=pz+Math.round(dy*i/n); if(D.wall(ix,iy)){ clear=false; break; } }
      if(clear&&S[y*D.W+x]<1) S[y*D.W+x]=1; }
    if(px>=0&&pz>=0&&px<D.W&&pz<D.H) S[pz*D.W+px]=2;
    const z=size(), cell=big?Math.max(3,Math.min(10,Math.floor(z/Math.max(D.W,D.H)))):(D.cell||7), ox=big?(z-D.W*cell)/2:z/2-P.x*cell, oy=big?(z-D.H*cell)/2:z/2-P.z*cell;
    g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,z,z); g.save(); g.beginPath(); g.rect(0,0,z,z); g.clip();
    for(let y=0;y<D.H;y++) for(let x=0;x<D.W;x++){ const v=S[y*D.W+x]||(D.known&&D.known()?1:0); if(!v) continue; const X=ox+x*cell, Y=oy+y*cell; if(X<-cell||Y<-cell||X>z||Y>z) continue;
      g.fillStyle=D.wall(x,y)?(D.trees?'#2f5a34':'#6a6478'):D.solid(x,y)?'#8a7a5a':v===2?'#d8b24a':'#4a4652'; g.fillRect(X,Y,cell,cell); }
    // the ways out, down and up, the chests and the people, once you've seen them
    L.spots.forEach(q=>{ const x=Math.floor(q.x), y=Math.floor(q.z); if(x<0||y<0||x>=D.W||y>=D.H||!S[y*D.W+x]) return; const lb=q.label||'';
      const c=/Leave|Exit|Out/.test(lb)?'#6fdf8a':/Climb|Up|Descend|Down|Stair|Enter/.test(lb)?'#7ac8ff':/Open|Chest/.test(lb)?'#ffd84a':null; if(!c) return;
      g.fillStyle=c; g.beginPath(); g.arc(ox+(x+0.5)*cell,oy+(y+0.5)*cell,Math.max(2,cell*0.42),0,7); g.fill(); });
    (D.marks||[]).forEach(k=>{ const X=ox+k.x*cell, Y=oy+k.y*cell, r=Math.max(4,cell*0.9); if(X<-r||Y<-r||X>z+r||Y>z+r) return; g.fillStyle=k.col; g.strokeStyle='#0a0a0a'; g.lineWidth=1.5; g.beginPath(); g.moveTo(X,Y-r); g.lineTo(X+r,Y); g.lineTo(X,Y+r); g.lineTo(X-r,Y); g.closePath(); g.fill(); g.stroke(); });   // the ways out, always shown
    if(L.combat) L.combat.foes.forEach(d=>{ if(!d.alive) return; const x=Math.floor(d.x), y=Math.floor(d.z); if(x<0||y<0||x>=D.W||y>=D.H||S[y*D.W+x]<1||Math.hypot(d.x-P.x,d.z-P.z)>R+0.5) return; g.fillStyle='#ff5a5a'; g.beginPath(); g.arc(ox+d.x*cell,oy+d.z*cell,Math.max(2,cell*0.32),0,7); g.fill(); });
    // you: an arrow the way you face
    const ax=ox+P.x*cell, ay=oy+P.z*cell, f=P.face, r=Math.max(4,cell*0.75); g.fillStyle='#ffffff'; g.strokeStyle='#1a141c'; g.lineWidth=1.5; g.beginPath();
    g.moveTo(ax+Math.sin(f)*r,ay+Math.cos(f)*r); g.lineTo(ax+Math.sin(f+2.5)*r*0.7,ay+Math.cos(f+2.5)*r*0.7); g.lineTo(ax+Math.sin(f-2.5)*r*0.7,ay+Math.cos(f-2.5)*r*0.7); g.closePath(); g.fill(); g.stroke();
    g.restore(); }
  setInterval(()=>{ try{ draw(); }catch(e){} },120);
  return { seen, draw }; })();
