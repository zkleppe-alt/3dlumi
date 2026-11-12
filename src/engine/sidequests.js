// ════════════════════════════════════════════════════════════════
//  SIDE QUESTS (V173) — every catacomb town has more to do than its chapel. Three villagers in each of the eight towns with
//  catacombs ask an errand that takes you down into them (data/sidequests.json):
//   · a FAMILY TOMB: someone's mother, father, grandfather buried below — find the tomb, say the name, bring back a keepsake
//     (a decoration for the Homestead)
//   · a LOST PERSON: someone went down and has not come up — find them, and they go home (and are there beside the one who asked)
//   · a RELIC RUMOUR: something hidden, in a place only that town's own relic can reach (across the chasm, behind the lightning…)
//  Each ends in a journal entry and a verse. And the town's villagers say something new as you go: where the way down is; what
//  waits below; what the general's relic is for; and, once the chapel is clean, what has come back to life.
//  State: GAME.S.sideq = {<id>: 1 asked · 2 found · 3 done}.
//  SIDEQ.world(world,{cleansed}) · SIDEQ.cata(lv,town,level,{scene,room,an,hAt,at})
// ════════════════════════════════════════════════════════════════
const SIDEQ=(function(){
  const D=typeof SIDEQUEST_DATA!=='undefined'?SIDEQUEST_DATA:null;
  const TOWNS=['Hearthvale','Ironhold','Saltmere','Thornwood','Dusthaven','Crystalpeak','Ashfield','Stormgate','Shadowmere','Hellgate'];
  const S=()=>GAME.S, st=()=>{ const s=S(); return s.sideq||(s.sideq={}); }, qs=id=>st()[id]||0;
  const all=()=>{ const out=[]; if(D) for(const t in D.quests) D.quests[t].forEach(q=>out.push(Object.assign({town:+t},q))); return out; };
  // the keepsakes: Homestead decorations, and how each is built
  if(D&&typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.trade&&PASTIME_DATA.trade.decor) Object.assign(PASTIME_DATA.trade.decor,D.keepsakes);
  if(typeof DECOR_KINDS!=='undefined') Object.assign(DECOR_KINDS,{
    keepLamb(d,g){ B(0.5,0.3,0.4,0x8a8478,0,0,0,g); const b=Sp(0.2,0xf0ece0,0,0.48,0,g,10,8); b.scale.set(1.3,0.9,0.9); Sp(0.1,0x3a3430,0.24,0.58,0,g,8,6); [-0.12,0.12].forEach(x=>[-0.08,0.08].forEach(z=>Cy(0.025,0.025,0.14,5,0x3a3430,x,0.3,z,g))); },
    keepAnvil(d,g){ Cy(0.2,0.26,0.4,8,0x5a3a22,0,0,0,g); B(0.5,0.16,0.24,0x4a4a52,0,0.4,0,g); const h=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.24,6),mt(0x4a4a52)); h.rotation.z=Math.PI/2; h.position.set(0.36,0.48,0); g.add(h); },
    keepNet(d,g){ [-0.45,0.45].forEach(x=>Cy(0.04,0.05,1.3,6,0x6a4a2a,x,0,0,g)); B(1.0,0.05,0.05,0x6a4a2a,0,1.25,0,g); const c=document.createElement('canvas'); c.width=c.height=64; const x2=c.getContext('2d'); x2.strokeStyle='rgba(200,184,150,0.95)'; x2.lineWidth=1.5; for(let i=0;i<=64;i+=8){ x2.beginPath(); x2.moveTo(i,0); x2.lineTo(i,64); x2.stroke(); x2.beginPath(); x2.moveTo(0,i); x2.lineTo(64,i); x2.stroke(); }
      const n=new THREE.Mesh(new THREE.PlaneGeometry(0.86,0.9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,side:THREE.DoubleSide,depthWrite:false})); n.position.set(0,0.8,0); g.add(n); },
    keepAxe(d,g){ Cy(0.3,0.34,0.4,10,0x6a4a2a,0,0,0,g); const r=new THREE.Mesh(new THREE.CircleGeometry(0.3,12),mt(0xb89a68)); r.rotation.x=-Math.PI/2; r.position.y=0.401; g.add(r); const ax=group(0.05,0.4,0,g); ax.rotation.z=0.5; B(0.05,0.7,0.05,0x7a5a3a,0,0,0,ax); B(0.24,0.14,0.04,0x6a6a72,0.1,0.58,0,ax); },
    keepJar(d,g){ const b=Sp(0.26,0xb0683a,0,0.4,0,g,12,9); b.scale.y=1.4; Cy(0.09,0.14,0.2,10,0xb0683a,0,0.72,0,g); Cy(0.12,0.1,0.05,10,0x9a5a30,0,0.92,0,g); Cy(0.1,0.1,0.02,10,0x8a2a1a,0,0.97,0,g); },
    keepCairn(d,g){ [[0.34,0.14],[0.28,0.12],[0.22,0.11],[0.16,0.1],[0.11,0.09]].reduce((y,[r,h],i)=>{ const s=Sp(r,[0x8a8478,0x7a766c,0x9a9488,0x6a665e,0xa8a294][i],(i%2-0.5)*0.04,y+h/2,0,g,8,6); s.scale.y=h/r; return y+h; },0); },
    keepHearth(d,g){ Cy(0.42,0.44,0.14,14,0x4a4440,0,0,0,g); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Sp(0.08,0x6a6460,Math.cos(a)*0.36,0.16,Math.sin(a)*0.36,g,6,5); } const e=new THREE.Mesh(new THREE.CircleGeometry(0.28,12),new THREE.MeshBasicMaterial({color:0xff7a2a})); e.rotation.x=-Math.PI/2; e.position.y=0.15; g.add(e); const L=new THREE.PointLight(0xff8a3a,0.6,4,1.6); L.position.y=0.5; g.add(L); },
    keepHelm(d,g){ Cy(0.05,0.06,0.9,6,0x5a3a22,0,0,0,g); B(0.3,0.06,0.3,0x5a3a22,0,0,0,g); const h=new THREE.Mesh(new THREE.SphereGeometry(0.2,14,10,0,Math.PI*2,0,Math.PI*0.62),mt(0x8a8a96)); h.position.y=1.02; g.add(h); Cy(0.205,0.205,0.18,14,0x8a8a96,0,0.84,0,g); B(0.24,0.03,0.05,0x1a1a20,0,0.96,0.19,g); B(0.03,0.16,0.04,0x1a1a20,0,0.86,0.2,g); B(0.04,0.06,0.3,0x6a5ac0,0,1.22,0,g); },   /* V174 */
    keepScallop(d,g){ const st=Cy(0.03,0.035,1.5,6,0x7a5a3a,0,0,0,g); st.rotation.z=0.08; Sp(0.05,0x7a5a3a,0.06,1.5,0,g,6,5); const sh=new THREE.Mesh(new THREE.CircleGeometry(0.16,12,0,Math.PI),mt(0xf0e0c8)); sh.position.set(0.04,1.05,0.05); sh.rotation.z=Math.PI; g.add(sh); for(let i=0;i<5;i++){ const r=B(0.01,0.14,0.012,0xc8b090,0.04+(i-2)*0.05,0.98,0.06,g); r.rotation.z=(i-2)*0.3; } Cy(0.012,0.012,0.3,4,0xb09868,0.04,1.1,0.03,g); },   /* V174 */
    keepShield(d,g){ B(0.5,0.1,0.3,0x5a3a22,0,0,0,g); B(0.06,0.9,0.06,0x5a3a22,0,0.1,0,g); const s=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.05,18),mt(0x2f4a8f)); s.rotation.x=Math.PI/2; s.position.set(0,0.78,0.06); g.add(s); const bs=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.07,10),mt(0xe8c766)); bs.rotation.x=Math.PI/2; bs.position.set(0,0.78,0.1); g.add(bs); } });
  // a mark over a head: ! an errand to ask · ? an errand to finish
  const markTex={}; function markMat(ch){ if(markTex[ch]) return markTex[ch]; const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'); x.fillStyle='rgba(20,16,10,0.55)'; x.beginPath(); x.arc(32,32,26,0,Math.PI*2); x.fill(); x.fillStyle=ch==='?'?'#ffd84a':'#fff0b0'; x.font='bold 40px serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(ch,32,34);
    return markTex[ch]=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}); }
  const strip=h=>String(h).replace(/<[^>]+>/g,'');
  function reward(q){ const s=S(); st()[q.id]=3; GAME.changed&&GAME.changed(); GAME.save();
    if(q.keepsake&&D.keepsakes[q.keepsake]){ const h=s.homesteadDecor||(s.homesteadDecor={inv:{},placed:[]}); h.inv=h.inv||{}; h.inv[q.keepsake]=(h.inv[q.keepsake]||0)+1; const k=D.keepsakes[q.keepsake]; setTimeout(()=>UI.toast(`${k.emoji} ${k.name} — a keepsake for your Homestead (☰ Home to place it).`,3600),400); }
    if(typeof JOURNAL!=='undefined'&&q.journal) JOURNAL.write(q.journal+' '+(q.verse||''),{});
    if(typeof SFX!=='undefined') SFX.play('levelUp'); }
  // ── in the realm: the hints in the villagers' mouths, and the three who ask ──
  function world(W,o){ if(!D) return; const cleansed=o.cleansed||(()=>false);
    const townOf=(x,z)=>{ let best=-1, bd=34; (W.towns||[]).forEach(tw=>{ const t=TOWNS.indexOf(tw[0]); if(t<0) return; const d=Math.hypot(tw[1]-x,tw[2]-z); if(d<bd){ bd=d; best=t; } }); return best; };
    const stage=t=>{ if(cleansed(t)) return 'clean'; const c=(S().cata&&S().cata[t])||{}, cf=typeof CATACOMB!=='undefined'&&CATACOMB.cfg(t); if(c.trial||(cf&&c[cf.tool.flag])) return 'tool'; if(c.seen) return 'in'; return 'out'; };
    const hint=(t,salt)=>{ const H=D.hints[t]; if(!H) return null; const L=H[stage(t)]||[]; return L.length?L[Math.abs(salt)%L.length]:null; };
    // every villager of a catacomb town says one thing about it first, changing as you go
    const wrapV=f=>{ if(f._sq||!f.key||!/^v:/.test(f.key)) return; const t=townOf(f.x,f.z); if(t<0||!(typeof CATACOMB!=='undefined'&&CATACOMB.has(t))) return; f._sq=true; const base=f.lines, salt=Math.round(f.x*7+f.z*3);
      Object.defineProperty(f,'lines',{configurable:true,get(){ const h=hint(t,salt); const b=Array.isArray(base)?base:base?[base]:[]; return h?[h].concat(b):b; },set(v){} }); };
    let vT=0; W.anim.push(()=>{ const nw=performance.now(); if(nw-vT<800) return; vT=nw; W.folk.forEach(wrapV); });
    // the three who ask, in the middle of each town
    const placed={};
    function spotNear(cx,cz,i){ for(let r=4;r<14;r+=0.5){ for(let k=0;k<16;k++){ const a=i*2.1+k*0.39, x=Math.floor(cx+Math.cos(a)*r), z=Math.floor(cz+Math.sin(a)*r); let ok=true; for(let dy=-1;dy<=1&&ok;dy++) for(let dx=-1;dx<=1;dx++) if(!W.walkTile(x+dx,z+dy)){ ok=false; break; } if(ok&&!Object.values(placed).some(p=>Math.hypot(p[0]-x,p[1]-z)<3)) return [x+0.5,z+0.5]; } } return null; }
    for(const t in D.quests){ const tw=(W.towns||[]).find(q=>q[0]===TOWNS[+t]); if(!tw) continue;
      D.quests[t].forEach((q0,i)=>{ const q=Object.assign({town:+t},q0), at=spotNear(tw[1],tw[2],i+(+t)); if(!at) return; placed[q.id]=at;
        let f=null; try{ f=addPerson(W,W.scene,q.giver.look,at[0],at[1],W.ground(at[0],at[1])+0.02,q.giver.name,[],{rest:Math.atan2(tw[1]-at[0],tw[2]-at[1])}); }catch(e){ return; } f.still=true; f.sideq=q.id; f.label='Talk';
        const mk=new THREE.Sprite(markMat('!')); mk.scale.setScalar(0.5); mk.position.y=2.25; f.g.add(mk);
        f.action=()=>{ const s0=qs(q.id); const sp=(lines,after)=>ENGINE.speak(q.giver.name,lines.map(strip),f,after);
          if(q.giver.needs==='helper'&&!(S().cata&&S().cata[q.town]&&S().cata[q.town].helper)&&s0===0){ sp(['(He is not here yet — he is still below, in the cage. Come back when he is free.)']); return; }
          if(s0===0){ sp(q.ask,()=>{ st()[q.id]=1; GAME.save(); UI.toast(`📜 ${q.giver.name}'s errand — in ${TOWNS[q.town]}'s catacombs.`,2600); }); return; }
          if(s0===1){ sp(q.wait); return; }
          if(s0===2){ sp(q.done.concat(q.verse?[q.verse]:[]),()=>reward(q)); return; }
          sp(['God bless you, knight. I will not forget it.']); };
        // the one who was lost, home beside the one who asked
        let home=null;
        W.anim.push(()=>{ const s0=qs(q.id); mk.visible=s0===0||s0===2; mk.material=markMat(s0===2?'?':'!'); mk.position.y=2.25+Math.sin(performance.now()/400)*0.06;
          if(q.kind==='lost'&&s0>=2&&!home){ try{ home=addPerson(W,W.scene,q.lost.look,at[0]+0.9,at[1]+0.5,W.ground(at[0]+0.9,at[1]+0.5)+0.02,q.lost.name,[s0===3?'I’m home. I’m not going down there again on my own — not ever.':'I came straight up. I’m home now.'],{rest:Math.PI}); home.still=true; }catch(e){ home={}; } } }); }); } }
  // ── in the catacombs: the tomb, the one who is lost, the thing that was hidden ──
  function cata(lv,t,n,X){ if(!D||!D.quests[t]) return; const glintM=()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,250,210,1)'); gr.addColorStop(0.3,'rgba(255,220,140,0.6)'); gr.addColorStop(1,'rgba(255,200,100,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); return new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}); };
    D.quests[t].forEach(q=>{ if(q.level!==n) return; const [x,y]=q.at, cx=x+0.5, cz=y+0.5, gy=()=>X.hAt(x,y), act=()=>qs(q.id)===1;
      const gl=new THREE.Sprite(glintM()); gl.scale.setScalar(0.6); gl.visible=false; X.room.add(gl);
      X.an.push(t2=>{ const on=act(); gl.visible=on&&q.kind!=='lost'; if(gl.visible){ gl.position.set(cx,gy()+(X.at(x,y)==='T'?1.0:0.5)+Math.sin(t2*3)*0.08,cz); gl.material.opacity=0.6+Math.sin(t2*5)*0.3; } });
      if(q.kind==='tomb'){ if(X.at(x,y)!=='T'){ const s=group(cx,0,cz,X.room); B(0.8,0.04,1.0,0x7a7468,0,0,0,s); B(0.06,0.02,0.5,0x3a3630,0,0.04,0,s); B(0.3,0.02,0.06,0x3a3630,0,0.04,-0.1,s); }   /* a grave cut in the floor */
        lv.spots.push({x:cx,z:cz+(X.at(x,y)==='T'?1.25:0.9),r:1.4,label:'Kneel',who:'A name you were asked to find',hide:()=>!act(),action:()=>{ const P=ENGINE.P; P.face=Math.atan2(cx-P.x,cz-P.z); ENGINE.hold(1.8,'kneel');
          ENGINE.speak(q.giver.name+'’s errand',q.found.map(strip),null,()=>{ st()[q.id]=2; GAME.save(); UI.toast(`📜 Found — take it back to ${q.giver.name} in ${TOWNS[t]}.`,2600); }); }}); }
      else if(q.kind==='relic'){ lv.spots.push({x:cx,z:cz,r:1.25,label:'Search',who:'Something hidden',hide:()=>!act(),action:()=>{ const P=ENGINE.P; P.face=Math.atan2(cx-P.x,cz-P.z); ENGINE.hold(1.0,'kneel');
          ENGINE.speak(q.giver.name+'’s errand',q.found.map(strip),null,()=>{ st()[q.id]=2; GAME.save(); UI.toast(`📜 Found — take it back to ${q.giver.name} in ${TOWNS[t]}.`,2600); }); }}); }
      else if(q.kind==='lost'){ let f=null; try{ f=addPerson(lv,X.scene,q.lost.look,cx,cz,gy()+0.02,q.lost.name,[],{rest:Math.PI}); f.still=true; f.mute=true; }catch(e){ f=null; }
        if(f){ X.an.push(()=>{ f.g.visible=act(); });
          lv.spots.push({x:cx,z:cz,r:1.4,label:'Talk',who:q.lost.name,hide:()=>!act(),action:()=>ENGINE.speak(q.lost.name,q.meet.map(strip),f,()=>{ st()[q.id]=2; GAME.save(); f.g.visible=false; UI.toast(`📜 ${q.lost.name} is on the way home — tell ${q.giver.name} in ${TOWNS[t]}.`,2800); })}); } } }); }
  return {world,cata,all,state:id=>qs(id)};
})();
