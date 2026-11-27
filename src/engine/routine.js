// ════════════════════════════════════════════════════════════════
//  ROUTINE (V286) — the villages' day: at dusk the townsfolk walk home along the lanes and go in at their own doors (the
//  children first); at dawn they come out again and walk back to where they spend the day. The guards keep their posts
//  through the night, but at dusk and dawn the watch changes: the day guard walks off to the barracks (the town's keep or
//  hall, else its inn) and a night guard with a lantern walks out to the post, and back again in the morning.
//  Who lives where: each villager is given a house of their own village (house or cottage, nearest first, a few to a house):
//  f.home = building id. Rooms (rooms.js) read ROUTINE.residents(id) at night to have them indoors.
//    ROUTINE.attach(lv)       — after the overworld is built (luminar.js)
//    ROUTINE.night()          — is it the townsfolk's night (indoors)?
//    ROUTINE.residents(id)    — the villagers who live in that building, for its interior at night
// ════════════════════════════════════════════════════════════════
const ROUTINE=(()=>{ const API={spd:1};
  const S=()=>(typeof GAME!=='undefined'&&GAME.S)||{};
  const frac=()=>{ const f=S().dayFrac; return typeof f==='number'?((f%1)+1)%1:0.4; };
  // the night window, by dayFrac: a little before dusk (0.848) to a little after dawn (0.268)
  const inNight=(f,go,back)=>go>back?(f>=go||f<back):(f>=go&&f<back);
  const night=()=>inNight(frac(),0.845,0.285);
  const RES={};   // building id → [villager]
  let LV=null;
  const hh=(s,k)=>{ let x=2166136261; const t=String(s)+'|'+k; for(let i=0;i<t.length;i++){ x^=t.charCodeAt(i); x=Math.imul(x,16777619); } return ((x>>>0)%10000)/10000; };
  // a walking route between two points, over the tiles you could walk yourself (4-way and safe diagonals), within a box round both
  function route(lv,ax,az,bx,bz){ const x0=Math.floor(Math.min(ax,bx))-22, z0=Math.floor(Math.min(az,bz))-22, x1=Math.floor(Math.max(ax,bx))+22, z1=Math.floor(Math.max(az,bz))+22, W=x1-x0+1, H=z1-z0+1;
    if(W*H>40000) return null; const prev=new Int32Array(W*H).fill(-1), seen=new Uint8Array(W*H), q=[]; const sx=Math.floor(ax), sz=Math.floor(az), ex=Math.floor(bx), ez=Math.floor(bz);
    const id=(x,z)=>(z-z0)*W+(x-x0), ok=(x,z,fx,fz)=>x>=x0&&x<=x1&&z>=z0&&z<=z1&&!(lv.barrierAt&&lv.barrierAt(x,z)>=0)&&lv.canMove(fx+0.5,fz+0.5,x+0.5,z+0.5);
    seen[id(sx,sz)]=1; q.push(sx,sz); let h=0, found=false;
    while(h<q.length){ const x=q[h++], z=q[h++]; if(x===ex&&z===ez){ found=true; break; }
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){ const nx=x+dx, nz=z+dz; if(nx<x0||nx>x1||nz<z0||nz>z1||seen[id(nx,nz)]) continue;
        if(dx&&dz&&!(ok(x+dx,z,x,z)&&ok(x,z+dz,x,z))) continue; if(!ok(nx,nz,x,z)) continue; seen[id(nx,nz)]=1; prev[id(nx,nz)]=id(x,z); q.push(nx,nz); } }
    if(!found) return null; const pts=[]; let k=id(ex,ez); while(k>=0){ pts.push([x0+k%W+0.5,z0+Math.floor(k/W)+0.5]); k=prev[k]; } pts.reverse(); pts[0]=[ax,az]; pts.push([bx,bz]);
    // string-pull: skip a corner where the straight walk past it is clear
    const clear=(p,q2)=>{ const d=Math.hypot(q2[0]-p[0],q2[1]-p[1]), n=Math.ceil(d*3); let px=p[0], pz=p[1]; for(let i=1;i<=n;i++){ const x=p[0]+(q2[0]-p[0])*i/n, z=p[1]+(q2[1]-p[1])*i/n; if(Math.floor(x)!==Math.floor(px)||Math.floor(z)!==Math.floor(pz)){ if(lv.barrierAt&&lv.barrierAt(Math.floor(x),Math.floor(z))>=0) return false; if(!lv.canMove(px,pz,x,z)) return false; } px=x; pz=z; } return true; };
    const out=[pts[0]]; let i=0; while(i<pts.length-1){ let j=Math.min(pts.length-1,i+8); while(j>i+1&&!clear(pts[i],pts[j])) j--; out.push(pts[j]); i=j; } return out; }
  function attach(lv){ if(!lv||typeof WORLD_DATA==='undefined') return; LV=lv; const WD=WORLD_DATA, towns=WD.towns||[];
    const townOf=(x,y)=>{ let bt=null, bd=1e9; towns.forEach(([n,tx,ty])=>{ const d=Math.hypot(tx-x,ty-y); if(d<bd){ bd=d; bt=n; } }); return [bt,bd]; };
    const houses={}; (WD.buildings||[]).forEach(b=>{ if(!/house|cottage/.test(b.style||'')||b.deck!==undefined||!b.interior||b.id==='home_barn'||b.id==='home_house') return; const [t,d]=townOf(b.x+b.w/2,b.y+b.h/2); if(d>48) return; (houses[t]=houses[t]||[]).push(b); });
    const halls={}; (WD.buildings||[]).forEach(b=>{ if(!/keep|inn/.test(b.style||'')) return; const [t,d]=townOf(b.x+b.w/2,b.y+b.h/2); if(d>48) return; const cur=halls[t]; if(!cur||(b.style==='keep'&&cur.style!=='keep')) halls[t]=b; });
    const folk=(lv.folk||[]).filter(f=>f.town&&f.key&&/^v:/.test(f.key));
    const load={}; folk.forEach(f=>{ const guard=/soldier|guard|watcher/.test(f.key.split(':').pop()); f.R={x0:f.x,z0:f.z,rest0:f.rest||0,ph:'out',path:null,i:0,guard,kid:/child/.test(f.key)};
      const H=houses[f.town]||[]; if(guard){ const hb=halls[f.town]||H[0]; f.R.hall=hb; return; }
      const cand=H.map(b=>({b,d:Math.hypot(b.x+b.w/2-f.x,b.y+b.h/2-f.z)})).sort((a,c)=>a.d-c.d); const pick=cand.find(c=>(load[c.b.id]||0)<3)||cand[0]; if(!pick) return;
      f.home=pick.b.id; f.R.house=pick.b; load[pick.b.id]=(load[pick.b.id]||0)+1; (RES[pick.b.id]=RES[pick.b.id]||[]).push(f);
      f.R.go=(f.R.kid?0.80:0.832)+hh(f.key,'go')*0.026; f.R.back=0.272+hh(f.key,'back')*0.04; });
    // the night watch: a second guard for every post, out from the barracks at dusk with a lantern
    folk.filter(f=>f.R&&f.R.guard&&f.R.hall).forEach(f=>{ const D=lv.doorAt(f.R.hall), out=f.key.split(':').pop();
      const n=addPerson(lv,f.chunk?f.chunk.g:lv.scene,out,D.sx,D.sz,lv.ground(D.sx,D.sz)+0.02,'Night Watch',['Night watch, Sir Knight. Keep to the lit streets — the dark has teeth yet.','The day lads are abed. I\'ve the post till dawn.'],{rest:f.rest||0,lazy:typeof folkWake==='function'});
      n.key=f.key+':night'; n.town=f.town; n.idle='guard'; n.lookAbout=0.6; n.breathe=true; n.night=true; n.chunk=f.chunk; n.g.visible=false; n.mute=true; n.ghost=true; n.lantern=true;
      n.R={x0:f.x,z0:f.z,rest0:f.rest||0,ph:'barracks',guard:true,hall:f.R.hall,night:true}; f.R.mate=n; n.R.mate=f;
      f.R.go=0.836+hh(f.key,'go')*0.012; f.R.back=0.27+hh(f.key,'back')*0.012; n.R.go=f.R.go; n.R.back=f.R.back; });
    const all=()=>(lv.folk||[]).filter(f=>f.R);
    const hide=(f,h)=>{ f.atHome=h; f.g.visible=!h; f.mute=h; f.ghost=h; };
    const place=(f,x,z)=>{ f.x=x; f.z=z; f.g.position.set(x,lv.ground(x,z)+0.02,z); };
    const startWalk=(f,tx,tz,then)=>{ const p=route(lv,f.x,f.z,tx,tz); if(!p){ then(true); return; } f.R.path=p; f.R.i=1; f.R.then=then; f.walking=true; f.R.spd=0.95+hh(f.key,'spd')*0.25; };
    const doorOf=b=>lv.doorAt(b);
    // dusk: home (or off duty); dawn: out again (or relieved)
    function goIn(f,far){ const b=f.R.house||f.R.hall; if(!b){ hide(f,true); f.R.ph='home'; return; } const D=doorOf(b);
      if(far){ place(f,D.sx,D.sz); hide(f,true); f.R.ph='home'; return; } f.R.ph='going'; startWalk(f,D.sx,D.sz,(failed)=>{ if(failed) place(f,D.sx,D.sz); f.R.ph='home'; f.walking=false; f.R.fade=1; }); }
    function comeOut(f,far){ const b=f.R.house||f.R.hall; const D=b?doorOf(b):{sx:f.R.x0,sz:f.R.z0};
      if(far){ f.R.fade=0; place(f,f.R.x0,f.R.z0); hide(f,false); f.rest=f.R.rest0; f.R.ph='out'; return; } f.R.fade=0; place(f,D.sx,D.sz); hide(f,false); f.R.ph='coming';
      startWalk(f,f.R.x0,f.R.z0,(failed)=>{ if(failed) place(f,f.R.x0,f.R.z0); f.R.ph='out'; f.walking=false; f.rest=f.R.rest0; }); }
    let acc=0;
    lv.anim.push((t,dt)=>{ dt=Math.min(dt||0.016,0.1); const P=typeof ENGINE!=='undefined'&&ENGINE.P; if(!P) return; const fr=frac();
      // walking
      all().forEach(f=>{ try{ if(f.R.path&&f.walking){ if(typeof ENGINE!=='undefined'&&ENGINE.talking&&ENGINE.talking()===f) return;
          const p=f.R.path[f.R.i]; if(!p){ f.walking=false; const th=f.R.then; f.R.path=null; if(th) th(false); return; }
          const dx=p[0]-f.x, dz=p[1]-f.z, d=Math.hypot(dx,dz), st=f.R.spd*dt*1.4*API.spd;
          if(d<=st){ place(f,p[0],p[1]); f.R.i++; } else { place(f,f.x+dx/d*st,f.z+dz/d*st); f.rest=Math.atan2(dx,dz); } }
        if(f.R.fade){ f.R.fade-=dt*2.5; if(f.R.fade<=0){ f.R.fade=0; hide(f,true); } } }catch(e){ if(!API.err){ API.err='walk '+String(e&&e.stack||e); } } });
      if((acc+=dt)<0.5) return; acc=0; API.ticks=(API.ticks||0)+1; API.fr=fr;
      all().forEach(f=>{ try{ const R=f.R, far=Math.hypot(f.x-P.x,f.z-P.z)>60&&Math.hypot(R.x0-P.x,R.z0-P.z)>60, nt=inNight(fr,R.go||0.84,R.back||0.28);
        if(R.night){   // the night watch
          if(nt&&R.ph==='barracks'){ comeOut(f,far); }
          else if(!nt&&(R.ph==='out'||R.ph==='coming')&&!R.path){ goIn(f,far); R.ph=far?'barracks':R.ph; }
          if(R.ph==='home') R.ph='barracks'; return; }
        if(nt&&R.ph==='out'&&!R.path) goIn(f,far);
        else if(!nt&&R.ph==='home') comeOut(f,far); }catch(e){ if(!API.err){ API.err=String(e&&e.stack||e); console.warn('[routine]',f.who,e); } } });
      // the lanterns of the night watch
      all().forEach(f=>{ if(f.lantern&&f.g&&!f.g.userData.lantern&&f.g.rig){ const r=f.g.rig, l=new THREE.Group(); const c=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.1,0.07),new THREE.MeshBasicMaterial({color:0xffd27a}));
          const top=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.05,4),new THREE.MeshLambertMaterial({color:0x2a2420})); top.position.y=0.075; top.rotation.y=Math.PI/4; l.add(c,top); l.position.set(0,-0.12,0.02); (r.AL&&r.AL.hand||r.torso).add(l);
          const pl=new THREE.PointLight(0xffc070,0.5,4.5,1.8); pl.position.y=-0.02; l.add(pl); f.g.userData.lantern=l; } });
    });
    lv.routine=true; }
  return Object.assign(API,{attach,night,residents:id=>(RES[id]||[]),inNight});
})();
