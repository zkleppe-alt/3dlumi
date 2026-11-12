// ════════════════════════════════════════════════════════════════
//  LIFE ON THE ROADS (V132) — the long country between the towns, lived in:
//   · TRAVELLERS walk the roads between neighbouring towns. The way is found once, over the land itself (A* that keeps to
//     the made roads where it can, fords a stream only if it must, and goes round a steep climb), and they keep to the
//     right of it so two can pass. Merchants lead a mule and a cart; pilgrims walk to the chapels; a patrol of the realm's
//     soldiers walks in file; a farmer or a peddler goes to market. They stop and turn to you when you come near.
//     Now and then a merchant's cart has thrown a wheel: help him set it back (a little gold, his thanks, a verse).
//   · SHEPHERDS keep a flock out on the pasture beyond each of the green towns. One of them has lost a lamb: find it in the
//     hills, carry it home (Luke 15:6), once per shepherd.
//   · WILDLIFE: deer grazing in the open and rabbits in the grass. They lift their heads as you come, and bolt if you
//     come close (sooner if you're riding).
//  Only near you — they are spawned a little way off as you travel and let go when you're far, so the realm stays light.
//  By night the roads empty but for the patrols; in a storm there are fewer on them.
//  ROADLIFE.attach(world). State: GAME.S.roadlife = {lambs:{<town>:true}, wheels:n}.
// ════════════════════════════════════════════════════════════════
const ROADLIFE=(function(){
  const PAIRS=[['Hearthvale','Ironhold'],['Ironhold','Homestead'],['Homestead','Saltmere'],['Hearthvale','Dusthaven'],['Ironhold','Dusthaven'],
    ['Dusthaven','Thornwood'],['Homestead','Thornwood'],['Thornwood','Ashfield'],['Ashfield','Stormgate'],['Saltmere','Stormgate'],['Ashfield','Shadowmere'],['Stormgate','Shadowmere']];
  const GREEN=['Hearthvale','Homestead','Ironhold','Thornwood','Saltmere'];
  const S=()=>GAME.S, st=()=>{ const s=S(); s.roadlife=s.roadlife||{lambs:{},wheels:0}; s.roadlife.lambs=s.roadlife.lambs||{}; return s.roadlife; };
  const rnd=Math.random, pick=a=>a[Math.floor(rnd()*a.length)];
  const LINES={
    merchant:[['Salt from the coast, cloth from the capital, and a little honey for whoever is kind on the road.'],['The roads are safer than they were. I give thanks for every mile of it.'],['A fair price and an honest scale — Proverbs 11:1 says the LORD delights in it, and so do my customers.']],
    pilgrim:[['“Blessed is the man whose strength is in thee; in whose heart are the ways of them.” — Psalm 84:5. We walk to the chapel to give thanks.'],['We go slowly. The road is part of the prayer.'],['Peace to you, knight. May the LORD keep your going out and your coming in.']],
    patrol:[['We walk the king’s road so the farmers needn’t fear it. Carry on, Sir Knight.'],['All quiet from here to the next town. God be thanked.'],['Keep to the road after dark. We will be along it.']],
    walker:[['Off to market with the week’s eggs. Mind you don’t startle the hens.'],['My sister lives in the next town. It is a long walk, but she makes a good stew.'],['Lovely day for the road, isn’t it? Even the hills look kind today.']]};
  function attach(world){
    const W=world.W, H=world.H, scene=world.scene, T=world.T, TOWNS=world.towns||[];
    const WATER=new Set([3,20,21,29]), ROAD=new Set([2,12]);
    const town=n=>TOWNS.find(t=>t[0]===n);
    const vs=()=>(typeof VIEWMODE!=='undefined'&&VIEWMODE.ps)?Math.max(0.6,VIEWMODE.ps(world)):1;
    const gAt=(x,z)=>world.ground(x,z);
    const okT=(x,y)=>x>=1&&y>=1&&x<W-1&&y<H-1&&world.walkTile(x,y);
    const night=()=>(typeof DAYNIGHT!=='undefined')?(DAYNIGHT.state().night||0):0;
    const wx=()=>world.weather&&world.weather.now;
    // ── the routes: A* over the land, roads cheap, fords dear, steep ground dearer ──
    function gate(A,Bt){ const dx=Bt[1]-A[1], dz=Bt[2]-A[2], l=Math.hypot(dx,dz)||1; const cx=A[1]+dx/l*11, cz=A[2]+dz/l*11; let best=null, bd=1e9;
      for(let dy=-9;dy<=9;dy++) for(let dx2=-9;dx2<=9;dx2++){ const x=Math.round(cx)+dx2, y=Math.round(cz)+dy; if(!okT(x,y)||WATER.has(T(x,y))) continue; const d=Math.hypot(dx2,dy)*(ROAD.has(T(x,y))?0.5:1); if(d<bd){ bd=d; best=[x,y]; } }
      return best||nearOk(Math.round(cx),Math.round(cz)); }
    function nearOk(x,y){ for(let r=0;r<9;r++) for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue; if(okT(x+dx,y+dy)&&!WATER.has(T(x+dx,y+dy))) return [x+dx,y+dy]; } return null; }
    function astar(a,b){ const N=W*H, g=new Float32Array(N).fill(1e30), from=new Int32Array(N).fill(-1), shut=new Uint8Array(N);
      const hp=[], hk=[]; const push=(k,f)=>{ hp.push(k); hk.push(f); let i=hp.length-1; while(i>0){ const p=(i-1)>>1; if(hk[p]<=hk[i]) break; [hp[p],hp[i]]=[hp[i],hp[p]]; [hk[p],hk[i]]=[hk[i],hk[p]]; i=p; } };
      const pop=()=>{ const top=hp[0], lk=hp.pop(), lf=hk.pop(); if(hp.length){ hp[0]=lk; hk[0]=lf; let i=0; for(;;){ const l=i*2+1, r=l+1; let m=i; if(l<hp.length&&hk[l]<hk[m]) m=l; if(r<hp.length&&hk[r]<hk[m]) m=r; if(m===i) break; [hp[m],hp[i]]=[hp[i],hp[m]]; [hk[m],hk[i]]=[hk[i],hk[m]]; i=m; } } return top; };
      const s=a[1]*W+a[0], e=b[1]*W+b[0]; g[s]=0; push(s,0); let n=0;
      const cost=(x,y)=>{ const t=T(x,y); return ROAD.has(t)?1:WATER.has(t)?9:2.4; };
      while(hp.length&&n<160000){ const k=pop(); if(shut[k]) continue; shut[k]=1; n++; if(k===e) break; const x=k%W, y=(k/W)|0, h0=gAt(x+0.5,y+0.5);
        for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; const nx=x+dx, ny=y+dy; if(!okT(nx,ny)) continue; if(dx&&dy&&(!okT(x+dx,y)||!okT(x,y+dy))) continue;
          const nk=ny*W+nx; if(shut[nk]) continue; const dh=Math.abs(gAt(nx+0.5,ny+0.5)-h0); if(dh>1.4) continue;
          const c=g[k]+cost(nx,ny)*(dx&&dy?1.414:1)+dh*dh*10; if(c<g[nk]){ g[nk]=c; from[nk]=k; push(nk,c+Math.hypot(nx-b[0],ny-b[1])); } } }
      if(from[e]<0) return null; const out=[]; for(let k=e;k>=0;k=from[k]) out.push([k%W+0.5,((k/W)|0)+0.5]); return out.reverse(); }
    // a polyline with its lengths, eased (every other tile, then a light smoothing so they don't walk the staircase)
    function line(path){ const p=path.filter((q,i)=>i%2===0||i===path.length-1); for(let it=0;it<2;it++) for(let i=1;i<p.length-1;i++) p[i]=[(p[i-1][0]+p[i][0]*2+p[i+1][0])/4,(p[i-1][1]+p[i][1]*2+p[i+1][1])/4];
      const L=[0]; for(let i=1;i<p.length;i++) L.push(L[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1])); return {p,L,len:L[L.length-1]}; }
    function at(R,s,side){ s=Math.max(0,Math.min(R.len-0.001,s)); let lo=0, hi=R.L.length-1; while(hi-lo>1){ const m=(lo+hi)>>1; if(R.L[m]<=s) lo=m; else hi=m; }
      const a=R.p[lo], b=R.p[hi], u=(s-R.L[lo])/((R.L[hi]-R.L[lo])||1), dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1;
      return {x:a[0]+dx*u-dz/l*side, z:a[1]+dz*u+dx/l*side, h:Math.atan2(dx/l,dz/l)}; }
    const routes=[]; const todo=PAIRS.filter(([a,b])=>town(a)&&town(b)).slice(); const CK='klk3d_roads_v132_'+W+'x'+H;
    try{ const c=JSON.parse(localStorage.getItem(CK)||'null'); if(c&&c.length){ c.forEach(q=>{ const R=line(q.p.map(v=>[v[0],v[1]])); R.a=q.a; R.b=q.b; routes.push(R); }); todo.length=0; } }catch(e){}
    const raw=[]; const save=()=>{ if(todo.length) return; try{ localStorage.setItem(CK,JSON.stringify(raw)); }catch(e){} };
    let busyR=false; function nextRoute(){ if(busyR||!todo.length) return; busyR=true; const [a,b]=todo.shift(), A=town(a), Bt=town(b);
      setTimeout(()=>{ try{ const s0=gate(A,Bt), s1=gate(Bt,A); const p=s0&&s1&&astar(s0,s1); if(p&&p.length>12){ raw.push({a,b,p:p.map(v=>[v[0],v[1]])}); const R=line(p); R.a=a; R.b=b; routes.push(R); } save(); }catch(e){} busyR=false; },30); }
    world.roadRoutes=routes;
    // ── the people of the road ──
    const live=[];
    function cartModel(){ const g=new THREE.Group(), wd=0x7a5434, dk=0x4a3220;
      B(0.78,0.1,1.2,wd,0,0.42,0,g); B(0.06,0.24,1.2,dk,-0.38,0.5,0,g); B(0.06,0.24,1.2,dk,0.38,0.5,0,g); B(0.78,0.24,0.06,dk,0,0.5,-0.6,g);
      [[-0.18,0.62,-0.2,0xc8b080],[0.16,0.62,0.05,0xb89a68],[0,0.62,0.32,0xd8c090],[-0.1,0.86,0.1,0xa8885a]].forEach(([x,y,z,c])=>{ const s=Sp(0.17,c,x,y,z,g,7,5); s.scale.set(1,0.8,1.15); });
      const wheels=[-1,1].map(sd=>{ const w=new THREE.Group(); w.position.set(sd*0.46,0.3,-0.12); const r=Cy(0.3,0.3,0.06,12,dk,0,-0.03,0,w); r.rotation.z=Math.PI/2; r.position.y=0;
        const hub=Cy(0.07,0.07,0.1,6,0x2a2018,0,-0.05,0,w); hub.rotation.z=Math.PI/2; hub.position.y=0; for(let i=0;i<4;i++){ const sp=B(0.03,0.56,0.04,wd,0,-0.28,0,w); sp.position.y=0; sp.rotation.x=i*Math.PI/4; } g.add(w); return w; });
      [-1,1].forEach(sd=>{ const sh=B(0.04,0.04,1.1,dk,sd*0.22,0.42,1.1,g); sh.rotation.x=-0.12; });
      g.userData.wheels=wheels; return shade(g); }
    function mule(){ const m=(typeof horseModel==='function')?horseModel({kind:'horse',coat:['#6a5a4a','#8a7a6a','#a89a88'],mane:'#3a3028'}):new THREE.Group(); m.scale.setScalar(0.5); const g=new THREE.Group(); g.add(m); g.userData.h=m; if(typeof ANIM3!=='undefined') ANIM3.dress(g,'donkey'); return g; }
    function folkAt(look,x,z,who,lines,opt){ const f=addPerson(world,scene,look,x,z,gAt(x,z)+0.02,who,lines,Object.assign({rest:0},opt||{})); f.road=true; return f; }
    function drop(o){ (o.folk||[]).forEach(f=>{ const i=world.folk.indexOf(f); if(i>=0) world.folk.splice(i,1); if(f.g.parent) f.g.parent.remove(f.g); }); (o.props||[]).forEach(p=>{ if(p.g.parent) p.g.parent.remove(p.g); }); }
    let force=null; function spawn(P){ if(!routes.length) return; const nt=night(), w=wx(); if(w&&w.kind==='storm'&&w.amount>0.5&&rnd()<0.6) return;
      for(let tries=0;tries<(force?200:14);tries++){ const R=pick(routes), s=rnd()*R.len, dir=rnd()<0.5?1:-1, q=at(R,s,0.4*dir), d=Math.hypot(q.x-P.x,q.z-P.z); if(force?(d<4||d>14):(d<22||d>48)) continue;
        const sg=stage(), kind=force?force.kind:nt>0.55?'patrol':pick(sg===0?['patrol','patrol','merchant','walker']:sg===1?['merchant','merchant','pilgrim','pilgrim','patrol','walker','walker']:['merchant','merchant','merchant','pilgrim','pilgrim','pilgrim','patrol','walker','walker','walker']);   /* V169: under the shadow, only the soldiers and the bold are out */ const o={kind,R,s,dir,folk:[],props:[],sp:kind==='patrol'?1.35:kind==='merchant'?0.95:kind==='pilgrim'?0.8:1.1,pause:0};
        const desert=!!(world.weather&&world.weather.climate&&world.weather.climate(q.x,q.z)==='sand');
        if(kind==='merchant'){ const f=folkAt(desert?'nomad':'merchantD',q.x,q.z,desert?'A caravan trader':'A travelling merchant',pick(LINES.merchant)); o.folk.push(f); o.lead=f;
          const mu=mule(); scene.add(mu); o.props.push({g:mu,back:1.1,kind:'mule'}); const c=cartModel(); scene.add(c); o.props.push({g:c,back:2.45,kind:'cart'});
          if(force?force.stuck:rnd()<0.22){ o.stuck=true; o.cart=c; c.userData.wheels[0].visible=false; const lw=c.userData.wheels[0].clone(); lw.visible=true; lw.rotation.set(0,0,Math.PI/2); lw.position.set(-0.9,0.05,0.2); c.add(lw); o.loose=lw;
            f.lines=null; f.label='Help'; f.action=()=>helpWheel(o); } }
        else if(kind==='pilgrim'){ const n=1+(rnd()<0.6?1:0)+(rnd()<0.3?1:0); for(let i=0;i<n;i++){ const f=folkAt(i===0?'pilgrim':pick(['monk','monkF','pilgrim','peasantF']),q.x,q.z,i===0?'A pilgrim':'A fellow pilgrim',pick(LINES.pilgrim)); f.back=i*1.0; o.folk.push(f); } }
        else if(kind==='patrol'){ const look=(o.R.a==='Stormgate'||o.R.b==='Stormgate')?'royalguard':'soldier'; for(let i=0;i<3;i++){ const f=folkAt(look,q.x,q.z,i===0?'Patrol sergeant':'A soldier of the patrol',pick(LINES.patrol)); f.back=i*1.05; o.folk.push(f); } }
        else { const f=folkAt(pick(['peasant','peasantF','farmer','hunter','woodcutter']),q.x,q.z,'A traveller',pick(LINES.walker)); o.folk.push(f); }
        live.push(o); place(o,ENGINE.P,0); return; } }
    // ── V169: how many are out on the roads: few under the shadow, more once Abaddon has fallen, crowds once the hunt is done —
    //  and fewer where demons still prowl close by (clear them and the road fills again) ──
    const stage=()=>{ const s=S(); return s.hunt&&s.hunt.done?2:s.abaddonWon?1:0; };
    const prowl=P=>{ const c=world.combat; if(!c) return 0; let n=0; for(const d of c.foes) if(d.alive&&!d.boss&&!d.rogue&&Math.hypot(d.x-P.x,d.z-P.z)<32) n++; return n; };
    function cap(P){ const sg=stage(), base=night()>0.55?[1,2,2][sg]:[2,4,8][sg]; return Math.max(1,base-Math.floor(prowl(P)/2)); }
    // ── V169: THE GUARDS FIGHT — a patrol that meets a demon stops and fights it. They are not strong enough to make short work of
    //  it: come and help as you pass. While you keep your distance the demon fights them; come close and it turns on you ──
    const FOES=()=>(world.combat&&world.combat.foes)||[];
    const freeFoe=(x,z,r)=>{ let best=null, bd=r; for(const d of FOES()){ if(!d.alive||d.boss||d.rogue||d.asleep||d.held&&d.heldBy) continue; const dd=Math.hypot(d.x-x,d.z-z); if(dd<bd){ bd=dd; best=d; } } return best; };
    function holdFoe(d,party){ d.heldBy=party; d.held=(d2,dist)=>{ if(d2.heldBy!==party||!party.fighters.some(f=>f.g.parent)) { d2.held=null; d2.heldBy=null; return false; } if(dist<5.5) return false;   /* you're close: it's yours */
        let tg=null, td=1e9; for(const f of party.fighters){ const dd=Math.hypot(f.x-d2.x,f.z-d2.z); if(dd<td){ td=dd; tg=f; } } if(!tg) return false;
        d2.face=Math.atan2(tg.x-d2.x,tg.z-d2.z); d2.walking=td>1.25; if(td>1.25){ const sp=0.035, nx=d2.x+(tg.x-d2.x)/td*sp, nz=d2.z+(tg.z-d2.z)/td*sp; if(world.walkTile(Math.floor(nx),Math.floor(nz))){ d2.x=nx; d2.z=nz; } }
        else if((d2._gcd=(d2._gcd||0)-1)<=0){ d2._gcd=70+Math.floor(rnd()*40); d2.squash=1; tg._flinch=0.35; if(Math.hypot(ENGINE.P.x-d2.x,ENGINE.P.z-d2.z)<18&&typeof SFX!=='undefined') SFX.play('block'); }
        return true; }; }
    function fightStep(party,d,P,dt){ const n=party.fighters.length; party.fighters.forEach((f,i)=>{ const a=Math.atan2(f.x-d.x,f.z-d.z)+(i-(n-1)/2)*0.5, tx=d.x+Math.sin(a)*1.15, tz=d.z+Math.cos(a)*1.15, dd=Math.hypot(tx-f.x,tz-f.z);
        f.walking=dd>0.2; if(dd>0.05){ const sp=Math.min(dd,2.6*dt); f.x+=(tx-f.x)/dd*sp; f.z+=(tz-f.z)/dd*sp; } f.y=gAt(f.x,f.z)+0.02; f.g.position.set(f.x,f.y,f.z); f.rest=Math.atan2(d.x-f.x,d.z-f.z); f.g.rotation.y=f.rest; f.g.alert=true;
        if(f._flinch>0){ f._flinch-=dt; f.g.position.x-=Math.sin(f.rest)*0.08; f.g.position.z-=Math.cos(f.rest)*0.08; }
        f._cd=(f._cd===undefined?rnd()*1.2:f._cd)-dt; if(f._cd<=0&&Math.hypot(d.x-f.x,d.z-f.z)<1.7){ f._cd=1.5+rnd()*0.6; if(f.g.swing) f.g.swing(i%2?2:1,0.45); setTimeout(()=>{ if(d.alive) COMBAT.hitBy(d,Math.max(1,(d.maxHp||d.hp||10)/26),f.x,f.z); },230); } }); }
    function endFight(party,d,P,who){ party.fighters.forEach(f=>{ f.g.alert=false; f.walking=false; }); if(Math.hypot(P.x-d.x,P.z-d.z)<14){ const said=d.byGuard?['Down it goes! My thanks, knight — that one had us pressed.','It’s done. The road’s the safer for your sword.']:['Well struck, knight! It was all we could do to hold it.','God be thanked for you, Sir Knight. Another mile made safe.'];
        UI.toast(`⚔ ${who}: “${pick(said)}”`,2600); } }
    function patrolFight(o,P,dt){ const lead=o.folk[0]; if(!lead) return false;
      if(!o.fight){ if(o.cool>0){ o.cool-=dt; return false; } const d=freeFoe(lead.x,lead.z,8); if(!d) return false; o.fight=d; o.fighters=o.folk; holdFoe(d,o); if(Math.hypot(P.x-lead.x,P.z-lead.z)<30) UI.toast('⚔ A patrol has met a demon on the road — they are fighting it. Help them!',2600); }
      const d=o.fight; if(!d.alive||Math.hypot(d.x-lead.x,d.z-lead.z)>16){ endFight(o,d,P,'The patrol sergeant'); o.fight=null; o.cool=4; o.ret=1.2; if(d.heldBy===o){ d.held=null; d.heldBy=null; } return false; }
      fightStep(o,d,P,dt); return true; }
    // ── V169: THE TOWN WATCH — once a town is cleansed, a demon that strays near it is met at the edge of the town by two of its
    //  guards, who drive it off (and demons can no longer come within its bounds at all: world.guarded) ──
    const watches=[]; let wT=0;
    function watchTick(P,dt){ wT+=dt; if(wT>0.5){ wT=0; const towns=world.watched?world.watched():[], R=world.guardR||12;
        for(const tw of towns){ if(Math.hypot(tw[1]-P.x,tw[2]-P.z)>60||watches.some(w=>w.tw===tw)) continue; let best=null, bd=R+8; for(const d of FOES()){ if(!d.alive||d.boss||d.rogue||d.asleep||d.heldBy) continue; const dd=Math.hypot(d.x-tw[1],d.z-tw[2]); if(dd<bd){ bd=dd; best=d; } } if(!best) continue;
          const a=Math.atan2(best.x-tw[1],best.z-tw[2]), ex=tw[1]+Math.sin(a)*(R-2), ez=tw[2]+Math.cos(a)*(R-2), look=tw[0]==='Stormgate'?'royalguard':'soldier';
          const w={tw,fighters:[0,1].map(i=>folkAt(look,ex+Math.cos(a)*(i?0.8:-0.8),ez-Math.sin(a)*(i?0.8:-0.8),i?'A guard of the watch':'The watch captain of '+tw[0],['The town is clean now, knight. We mean to keep it so.'])),d:best,t:0};
          holdFoe(best,w); watches.push(w); if(Math.hypot(P.x-ex,P.z-ez)<30) UI.toast(`🛡 The watch of ${tw[0]} comes out to meet a demon at the edge of town.`,2600); } }
      for(let i=watches.length-1;i>=0;i--){ const w=watches[i]; w.t+=dt; const d=w.d;
        if(d&&(d.alive)&&Math.hypot(d.x-w.tw[1],d.z-w.tw[2])<(world.guardR||12)+14){ fightStep(w,d,P,dt); continue; }
        if(d){ endFight(w,d,P,'The watch captain'); w.d=null; w.t=0; if(d.heldBy===w){ d.held=null; d.heldBy=null; } }
        // back to their posts, and gone
        w.fighters.forEach(f=>{ const dx=w.tw[1]-f.x, dz=w.tw[2]-f.z, dd=Math.hypot(dx,dz); f.walking=dd>1; if(dd>1){ f.x+=dx/dd*1.6*dt; f.z+=dz/dd*1.6*dt; f.rest=Math.atan2(dx,dz); f.g.rotation.y=f.rest; } f.y=gAt(f.x,f.z)+0.02; f.g.position.set(f.x,f.y,f.z); });
        if(w.t>7||Math.hypot(w.fighters[0].x-P.x,w.fighters[0].z-P.z)>70){ drop({folk:w.fighters,props:[]}); watches.splice(i,1); } } }
    function helpWheel(o){ const f=o.lead; ENGINE.speak('A travelling merchant',['Oh — thank the LORD, a strong pair of arms! The wheel came off on that rut and I can’t lift the cart and fit it both.','(You lift the cart’s corner while he works the wheel back onto its axle and knocks the pin home.)','There! “Bear ye one another’s burdens” — Galatians 6:2. Here, for your trouble — and God speed you.'],f,()=>{
        if(o.loose){ o.loose.parent&&o.loose.parent.remove(o.loose); o.loose=null; } o.cart.userData.wheels[0].visible=true; o.stuck=false; f.action=null; f.label='Talk'; f.lines=['God speed you, knight. I’ll tell the next town who set my wheel.'];
        const s=S(); s.gold=(s.gold||0)+20; const x=GAME.gainXp?GAME.gainXp(35):null; st().wheels=(st().wheels||0)+1; GAME.changed(); ENGINE.hud&&ENGINE.hud();
        UI.toast(`🛞 You helped set the wheel — +20 gold, +35 XP${x&&x.up?' · LEVEL UP!':''}`,2600); if(typeof JOURNAL!=='undefined'&&st().wheels===1) JOURNAL.write('I helped a merchant set a thrown wheel back on his cart on the road. He gave me a few coins and Galatians 6:2.',{}); }); }
    // where each of a party stands: the leader at s, the rest behind; the cart and mule behind the merchant
    function place(o,P,dt){ const vsc=vs(); let stop=o.stuck||o.pause>0;
      for(const f of o.folk){ if(Math.hypot(f.x-P.x,f.z-P.z)<3.2) stop=true; }
      if(!stop) o.s+=o.dir*o.sp*dt; if(o.pause>0) o.pause-=dt;
      const side=0.45*o.dir;
      if(o.ret>0) o.ret=Math.max(0,o.ret-dt);
      for(const f of o.folk){ const q=at(o.R,o.s-(f.back||0)*o.dir,side); if(o.ret>0){ const k=Math.min(1,dt*3.5); q.x=f.x+(q.x-f.x)*k; q.z=f.z+(q.z-f.z)*k; } f.x=q.x; f.z=q.z; f.y=gAt(q.x,q.z)+0.02; f.g.position.x=q.x; f.g.position.z=q.z; f.rest=o.dir>0?q.h:q.h+Math.PI; f.walking=!stop; }
      for(const pr of o.props){ const q=at(o.R,o.s-pr.back*o.dir,side), hd=o.dir>0?q.h:q.h+Math.PI; pr.g.position.set(q.x,gAt(q.x,q.z),q.z); let d=hd-pr.g.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); pr.g.rotation.y+=d*Math.min(1,dt*4); pr.g.scale.setScalar(vsc);
        if(pr.kind==='mule'&&pr.g.userData.h.userData.gallop) pr.g.userData.h.userData.gallop(performance.now()/1000,stop?0:0.3,0,0);
        if(pr.kind==='cart'&&!stop) pr.g.userData.wheels.forEach(w=>{ w.rotation.x+=o.sp*dt/0.3; });
        if(pr.kind==='cart'&&o.stuck) pr.g.rotation.z=0.12; else if(pr.kind==='cart') pr.g.rotation.z=0; }
      return o.s<-0.5||o.s>o.R.len+0.5; }
    // ── shepherds and their flocks ──
    const herds=[];
    function sheepModel(lamb){ const g=new THREE.Group(); if(typeof DECOR_KINDS!=='undefined'&&DECOR_KINDS.mt_sheep) DECOR_KINDS.mt_sheep({v:rnd()<0.12?'black':'white'},g); else Sp(0.32,0xf4f0e8,0,0.45,0,g); if(lamb) g.scale.setScalar(0.62); shade(g); if(typeof ANIM3!=='undefined') ANIM3.dress(g,'sheep',lamb?{h:0.5,keepSize:true}:{}); return g; }
    function grassy(x,y){ const t=T(x,y); return (t===0||t===4)&&okT(x,y); }
    function makeHerd(name){ const tw=town(name); if(!tw) return null; let spot=null;
      for(let i=0;i<60&&!spot;i++){ const a=(i*2.399)+(name.length), r=16+((i*7)%10), x=Math.floor(tw[1]+Math.cos(a)*r), y=Math.floor(tw[2]+Math.sin(a)*r); let ok=true; for(let dy=-2;dy<=2&&ok;dy++) for(let dx=-2;dx<=2;dx++) if(!grassy(x+dx,y+dy)){ ok=false; break; } if(ok) spot=[x+0.5,y+0.5]; }
      if(!spot) return null; const hd={name,x:spot[0],z:spot[1],sheep:[],lamb:null,f:null};
      return hd; }
    function wakeHerd(hd){ if(hd.f) return; const done=st().lambs[hd.name];
      hd.f=folkAt('farmer',hd.x,hd.z,'A shepherd of '+hd.name,done?['The ninety and nine are all here, and the one you brought home. I watch them closer now.']:null,{rest:rnd()*6});
      if(!done){ hd.f.label='Talk'; hd.f.action=()=>{ if(hd.carry){ return; } ENGINE.speak(hd.f.who,['One of my lambs has wandered off — up into the hills, I think, toward the high ground. I have counted them three times.','If you see her, would you carry her home? I can’t leave these.']); hd.asked=true; }; }
      for(let i=0;i<7;i++){ const g=sheepModel(false); scene.add(g); const s={g,x:hd.x+(rnd()-0.5)*5,z:hd.z+(rnd()-0.5)*5,hx:0,hz:0,t:rnd()*4,h:rnd()*6}; s.hx=s.x; s.hz=s.z; hd.sheep.push(s); }
      if(!done){ let lx=0, lz=0; for(let i=0;i<40;i++){ const a=rnd()*6.28, r=11+rnd()*9, x=Math.floor(hd.x+Math.cos(a)*r), y=Math.floor(hd.z+Math.sin(a)*r); if(okT(x,y)&&!WATER.has(T(x,y))){ lx=x+0.5; lz=y+0.5; break; } }
        if(lx){ const g=sheepModel(true); scene.add(g); hd.lamb={g,x:lx,z:lz}; const sp={x:lx,z:lz,r:1.3,label:'Carry',who:'A lost lamb',action:()=>{ hd.carry=true; UI.toast('🐑 You lift the lamb onto your shoulders. Back to the shepherd!',2200); const i=world.spots.indexOf(sp); if(i>=0) world.spots.splice(i,1); }}; hd.lambSpot=sp; world.spots.push(sp); } } }
    function sleepHerd(hd){ if(!hd.f) return; const i=world.folk.indexOf(hd.f); if(i>=0) world.folk.splice(i,1); hd.f.g.parent&&hd.f.g.parent.remove(hd.f.g); hd.f=null;
      hd.sheep.forEach(s=>s.g.parent&&s.g.parent.remove(s.g)); hd.sheep=[]; if(hd.lamb&&!hd.carry){ hd.lamb.g.parent&&hd.lamb.g.parent.remove(hd.lamb.g); hd.lamb=null; const k=world.spots.indexOf(hd.lambSpot); if(k>=0) world.spots.splice(k,1); } }
    function tickHerd(hd,P,t,dt){ const vsc=vs();
      hd.sheep.forEach(s=>{ s.t-=dt; if(s.t<0){ s.t=2+rnd()*5; s.tx=hd.x+(rnd()-0.5)*6; s.tz=hd.z+(rnd()-0.5)*6; } if(s.tx!==undefined){ const dx=s.tx-s.x, dz=s.tz-s.z, l=Math.hypot(dx,dz); if(l>0.1){ s.x+=dx/l*0.4*dt; s.z+=dz/l*0.4*dt; s.h=Math.atan2(dx,dz); } }
        s.g.position.set(s.x,gAt(s.x,s.z),s.z); s.g.rotation.y=s.h; s.g.scale.setScalar(vsc); });
      if(hd.lamb){ const L=hd.lamb; if(hd.carry){ L.g.position.set(P.x,(P.y||0)+1.35*vsc,P.z); L.g.rotation.y=P.face||0; L.g.scale.setScalar(0.62*vsc);
          if(hd.f&&Math.hypot(P.x-hd.f.x,P.z-hd.f.z)<2.6){ hd.carry=false; st().lambs[hd.name]=true; L.g.position.set(hd.f.x+0.9,gAt(hd.f.x+0.9,hd.f.z),hd.f.z); hd.sheep.push({g:L.g,x:hd.f.x+0.9,z:hd.f.z,t:3,h:0}); hd.lamb=null;
            hd.f.action=null; hd.f.lines=['The ninety and nine are all here, and the one you brought home. I watch them closer now.'];
            ENGINE.speak(hd.f.who,['My lamb! Oh, my little one — look at her, not a scratch.','“Rejoice with me; for I have found my sheep which was lost.” — Luke 15:6. That is what the Lord says of every one of us, you know. He goes out after the one.'],hd.f,()=>{
              const x=GAME.gainXp?GAME.gainXp(60):null; GAME.changed(); GAME.save(); UI.toast(`🐑 The lost lamb is home — +60 XP${x&&x.up?' · LEVEL UP!':''}`,2600);
              if(typeof JOURNAL!=='undefined') JOURNAL.write(`I found a shepherd’s lost lamb in the hills above ${hd.name} and carried her home on my shoulders. Luke 15:6.`,{place:hd.name}); }); } }
        else { L.g.position.set(L.x,gAt(L.x,L.z),L.z); L.g.rotation.y=Math.sin(t*0.4)*1.2; L.g.scale.setScalar(0.62*vsc); } } }
    // ── wildlife ──
    const beasts=[];
    function deer(){ const g=new THREE.Group(), c=0x9a6a3e, l=0x7a5030, w=0xf2ead8; const body=Sp(0.26,c,0,0.62,0,g,9,7); body.scale.set(0.8,0.75,1.5);
      const legs=[[-0.13,0.25],[0.13,0.25],[-0.13,-0.25],[0.13,-0.25]].map(([x,z])=>{ const p=new THREE.Group(); p.position.set(x,0.52,z); Cy(0.03,0.025,0.52,5,l,0,-0.52,0,p); g.add(p); return p; });
      const nk=new THREE.Group(); nk.position.set(0,0.72,0.3); g.add(nk); const n=Cy(0.07,0.09,0.36,6,c,0,0,0,nk); n.rotation.x=0.5; n.position.set(0,0.12,0.06); const hd=Sp(0.1,c,0,0.32,0.16,nk,8,6); hd.scale.set(0.8,0.8,1.4);
      Sp(0.04,0x2a2220,0,0.3,0.31,nk,5,4); const buck=rnd()<0.4; [-1,1].forEach(sd=>{ const e=Sp(0.05,c,sd*0.09,0.4,0.08,nk,5,4); e.scale.set(0.5,1.2,0.4); e.rotation.z=-sd*0.6; if(buck){ const ag=new THREE.Group(); ag.position.set(sd*0.04,0.4,0.14); ag.rotation.set(-0.5,0,-sd*0.35); nk.add(ag); Cy(0.01,0.016,0.2,4,0xd8c8a8,0,0,0,ag); const t1=Cy(0.008,0.01,0.1,4,0xd8c8a8,0,0.1,0,ag); t1.rotation.x=0.7; t1.position.set(0,0.12,0.03); const t2=Cy(0.008,0.01,0.08,4,0xd8c8a8,0,0.17,0,ag); t2.rotation.z=sd*0.6; t2.position.set(sd*0.02,0.2,0); } });
      const tl=Sp(0.06,w,0,0.7,-0.38,g,6,5); tl.scale.set(0.8,1,0.6); g.userData={legs,nk}; shade(g); if(typeof ANIM3!=='undefined') ANIM3.dress(g,buck?'stag':'deer',{fast:3.2}); return g; }
    function rabbit(){ const g=new THREE.Group(), c=[0x9a8a78,0x8a7a68,0xb8a890][Math.floor(rnd()*3)]; const b=Sp(0.11,c,0,0.11,0,g,7,6); b.scale.set(0.85,0.85,1.2); Sp(0.07,c,0,0.2,0.1,g,6,5);
      [-1,1].forEach(sd=>{ const e=Sp(0.03,c,sd*0.03,0.32,0.08,g,5,4); e.scale.set(0.6,2.4,0.5); }); Sp(0.04,0xf4f0ea,0,0.14,-0.13,g,5,4); return shade(g); }
    function spawnBeast(P){ for(let i=0;i<10;i++){ const a=rnd()*6.28, r=20+rnd()*16, x=Math.floor(P.x+Math.cos(a)*r), y=Math.floor(P.z+Math.sin(a)*r); if(!grassy(x,y)) continue;
        let far=true; for(const tw of TOWNS) if(Math.hypot(tw[1]-x,tw[2]-y)<20){ far=false; break; } if(!far) continue;
        const kind=rnd()<0.45?'deer':'rabbit', n=kind==='deer'?1+Math.floor(rnd()*3):1+Math.floor(rnd()*2);
        for(let k=0;k<n;k++){ const g=kind==='deer'?deer():rabbit(); scene.add(g); beasts.push({g,kind,x:x+0.5+(rnd()-0.5)*2,z:y+0.5+(rnd()-0.5)*2,h:rnd()*6.28,st:'graze',t:rnd()*3,ph:rnd()*6}); } return; } }
    let lastP=null, pv=0;
    function tickBeasts(P,t,dt){ const vsc=vs(), riding=(world.mounted&&world.mounted())||pv>5.5;
      for(let i=beasts.length-1;i>=0;i--){ const b=beasts[i], d=Math.hypot(b.x-P.x,b.z-P.z);
        if(d>55){ b.g.parent&&b.g.parent.remove(b.g); beasts.splice(i,1); continue; }
        const scare=riding?(b.kind==='deer'?13:8):(b.kind==='deer'?7:4);
        if(b.st!=='flee'&&d<scare){ b.st='flee'; b.h=Math.atan2(b.x-P.x,b.z-P.z)+(rnd()-0.5)*0.6; b.t=4+rnd()*2; }
        if(b.st==='flee'){ const sp=b.kind==='deer'?6.5:5, nx=b.x+Math.sin(b.h)*sp*dt, nz=b.z+Math.cos(b.h)*sp*dt; if(okT(Math.floor(nx),Math.floor(nz))&&!WATER.has(T(Math.floor(nx),Math.floor(nz)))){ b.x=nx; b.z=nz; } else b.h+=1.4; b.t-=dt; if(b.t<0&&d>scare*1.6) b.st='graze'; }
        else { b.t-=dt; if(b.t<0){ b.t=2+rnd()*4; b.walk=rnd()<0.4; if(b.walk) b.h+=(rnd()-0.5)*1.5; } if(b.walk){ const nx=b.x+Math.sin(b.h)*0.5*dt, nz=b.z+Math.cos(b.h)*0.5*dt; if(grassy(Math.floor(nx),Math.floor(nz))){ b.x=nx; b.z=nz; } else b.walk=false; } }
        const gy=gAt(b.x,b.z), run=b.st==='flee';
        if(b.kind==='rabbit'){ const hop=run?Math.abs(Math.sin(t*14+b.ph))*0.25:(b.walk?Math.abs(Math.sin(t*6+b.ph))*0.06:0); b.g.position.set(b.x,gy+hop*vsc,b.z); }
        else { b.g.position.set(b.x,gy+(run?Math.abs(Math.sin(t*9+b.ph))*0.12*vsc:0),b.z); const u=b.g.userData, sw=run?0.9:b.walk?0.35:0, f=run?9:4; u.legs.forEach((L,k)=>{ L.rotation.x=Math.sin(t*f+b.ph+(k%2?Math.PI:0)+(k>1?Math.PI/2:0))*sw; });
          const look=d<scare*1.8&&!run; u.nk.rotation.x=run?-0.2:look?-0.1:(b.walk?0.3:0.75+Math.sin(t*0.7+b.ph)*0.15); }
        let dd=b.h-b.g.rotation.y; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); b.g.rotation.y+=dd*Math.min(1,dt*6); b.g.scale.setScalar(vsc*(b.kind==='deer'?1:1)); } }
    // ── the tick ──
    let spT=0, bT=0, rT=0; const MAXT=6, MAXB=9;
    let lastT=0; world.anim.push(t=>{ const tn=performance.now()/1000, dt=lastT?Math.min(0.25,tn-lastT):0.016; lastT=tn;
      const on=ENGINE.level===world, P=ENGINE.P;
      if(!on){ return; }
      if(lastP){ const v=Math.hypot(P.x-lastP[0],P.z-lastP[1])/Math.max(dt,0.001); pv+=(v-pv)*Math.min(1,dt*3); } lastP=[P.x,P.z];
      rT+=dt; if(rT>0.4){ rT=0; nextRoute(); }
      spT+=dt; if(spT>2.5){ spT=0; if(live.length<cap(P)) spawn(P); }
      watchTick(P,dt);
      bT+=dt; if(bT>3){ bT=0; if(beasts.length<MAXB&&night()<0.6) spawnBeast(P); }
      for(let i=live.length-1;i>=0;i--){ const o=live[i]; const lead=o.folk[0]; const far=lead&&Math.hypot(lead.x-P.x,lead.z-P.z)>70; if(o.kind==='patrol'&&patrolFight(o,P,dt)) continue; if(place(o,P,dt)||far){ drop(o); live.splice(i,1); } }
      for(const hd of herds){ const d=Math.hypot(hd.x-P.x,hd.z-P.z); if(d<45) wakeHerd(hd); else if(d>60&&!hd.carry) sleepHerd(hd); if(hd.f) tickHerd(hd,P,t,dt); }
      tickBeasts(P,t,dt); });
    GREEN.forEach(n=>{ const h=makeHerd(n); if(h) herds.push(h); });
    // leaving the realm lets them all go; they come back fresh next time
    const pl=world.onLeave; world.onLeave=()=>{ live.forEach(drop); live.length=0; watches.forEach(w=>drop({folk:w.fighters,props:[]})); watches.length=0; beasts.forEach(b=>b.g.parent&&b.g.parent.remove(b.g)); beasts.length=0; herds.forEach(h=>{ if(!h.carry) sleepHerd(h); }); if(pl) pl(); };
    const buildAll=()=>{ const out=[]; while(todo.length){ const [a,b]=todo.shift(), A=town(a), Bt=town(b); const s0=gate(A,Bt), s1=gate(Bt,A); const t0=performance.now(); const p=s0&&s1&&astar(s0,s1); out.push([a,b,!!s0,!!s1,p?p.length:0,Math.round(performance.now()-t0)]); if(p&&p.length>12){ const R=line(p); R.a=a; R.b=b; routes.push(R); } } return out; };
    return {routes,live,herds,beasts,buildAll,_spawn:(kind,stuck)=>{ force={kind,stuck}; spawn(ENGINE.P); force=null; return live.length; }};
  }
  return {attach};
})();
