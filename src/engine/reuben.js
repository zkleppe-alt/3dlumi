// ════════════════════════════════════════════════════════════════
//  REUBEN — the wandering merchant (data/pastimes.json → reuben). From the first cleansed chapel he camps by
//  the way into a cleansed village, beside his wagon, and moves on every REUBEN_STAY_MS of play (S.playMs),
//  round the cleansed villages in turn. His camp in each village is the game's own reubenFindSpot(t)
//  (open ground, three tiles in a row, blocking nothing): he stands at x, his wagon fills x+1..x+2.
//  He sells REUBEN_WARES: the healing brews, the four tonics and the Murky Flask. Inn patrons know where he is.
//  reuben(world, R, TD) → { here(), rumor() }
// ════════════════════════════════════════════════════════════════
function donkeyCart(c){ const g=new THREE.Group(), H=hexn;
  // the cart (west) and the donkey in the shafts (east), facing +x
  const cart=group(-0.5,0,0,g);
  [-0.42,0.42].forEach(z=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.08,12),flat(0x6a4428)); w.rotation.x=Math.PI/2; w.position.set(0,0.34,z); cart.add(w);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.1,8),flat(0x3a2a1a)); hub.rotation.x=Math.PI/2; hub.position.set(0,0.34,z); cart.add(hub); });
  B(1.1,0.12,0.8,0x8a5e3a,0,0.45,0,cart); B(1.1,0.22,0.05,0x7a5634,0,0.57,0.38,cart); B(1.1,0.22,0.05,0x7a5634,0,0.57,-0.38,cart); B(0.05,0.22,0.8,0x7a5634,-0.55,0.57,0,cart);
  // the striped canopy on hoops
  for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.22,10,1,true,0,Math.PI),new THREE.MeshLambertMaterial({color:i%2?H(c.c):H(c.C),side:THREE.DoubleSide}));
    s.rotation.z=Math.PI/2; s.position.set(-0.44+i*0.22,0.69,0); cart.add(s); }
  B(1.12,0.05,0.06,H(c.T),0,0.68,0.41,cart); B(1.12,0.05,0.06,H(c.T),0,0.68,-0.41,cart);
  // bottles on the bed, red green blue gold, one winking
  const bottles=[]; [0xd03030,0x30a050,0x3060d0,0xe0c030].forEach((col,i)=>{ const b=Cy(0.045,0.05,0.16,6,col,0.42,0.51,-0.27+i*0.18,cart); B(0.04,0.05,0.04,0xe8e0d0,0.42,0.67,-0.27+i*0.18,cart); bottles.push(b); });
  // shafts and the donkey
  B(0.9,0.04,0.04,0x6a4428,0.85,0.5,0.22,g); B(0.9,0.04,0.04,0x6a4428,0.85,0.5,-0.22,g);
  const d=group(0.95,0,0,g), coat=H(c.d), dark=H(c.D), lite=H(c.L), mane=H(c.M);
  B(0.7,0.36,0.32,coat,0,0.5,0,d); [[-0.26,0.12],[-0.26,-0.12],[0.26,0.12],[0.26,-0.12]].forEach(([x,z])=>B(0.08,0.5,0.08,dark,x,0,z,d));
  const nk=group(0.34,0.75,0,d); nk.rotation.z=-0.6; B(0.16,0.34,0.2,coat,0,0,0,nk); B(0.04,0.3,0.06,mane,-0.08,0.02,0,nk);
  const hd=group(0.48,0.98,0,d); B(0.34,0.18,0.18,coat,0,-0.09,0,hd); B(0.12,0.14,0.16,lite,0.17,-0.1,0,hd);
  [-0.05,0.05].forEach(z=>{ const e=B(0.05,0.24,0.04,coat,-0.08,0.04,z,hd); e.rotation.x=z*4; });
  B(0.05,0.3,0.05,mane,-0.38,0.4,0,d).rotation.z=0.4;
  if(typeof ANIM3!=='undefined'&&ANIM3.on) setTimeout(()=>ANIM3.dress(d,'donkey',{face:Math.PI/2}),0);   // V195: Reuben's donkey on the rigged donkey, in the shafts, facing along the road
  g.userData.tick=t=>{ const k=(Math.floor(t/0.4))%4; bottles.forEach((b,i)=>b.material=mt(i===k?0xffffff:[0xd03030,0x30a050,0x3060d0,0xe0c030][i])); hd.rotation.z=Math.sin(t*0.9)*0.06; };
  return shade(g); }

function reuben(world,R,TD){
  const S=()=>GAME.S, P=ENGINE.P;
  const unlocked=()=>S().chapels>=1;
  const towns=()=>{ const t=[]; for(let i=0;i<10;i++) if(i<S().chapels) t.push(i); return t; };
  function town(){ const t=towns(); if(!t.length) return null; const k=Math.floor(Math.max(0,S().playMs||0)/R.stayMs); return t[((k%t.length)+t.length)%t.length]; }
  function here(){ if(!unlocked()) return null; const t=town(); if(t===null) return null; const s=R.spots[t]; return s?{town:t,x:s.x,y:s.y}:null; }
  const cart=donkeyCart(R.cart); world.scene.add(cart); world.anim.push(()=>cart.scale.setScalar(Math.max(0.6,VIEWMODE.ps(world))));
  const f=addPerson(world,world.scene,'reuben',0,0,0,'Reuben',null,{rest:0});
  f.label='Shop'; f.solid=0.45;
  f.action=()=>{ const first=!S().reubenMet; S().reubenMet=true; GAME.save();
    const lines=first?R.first:R.again[Math.floor(Math.random()*R.again.length)];
    ENGINE.speak('Reuben',lines,f,()=>SERVICES.openShop(-1,'Reuben',{items:R.wares,title:'🍶 Reuben’s Wagon',greet:'“Potions, tonics, and a few brews of my own devising!”'})); };
  let at=null;
  function place(){ const h=here(); const key=h?h.town:null; if(at===key) return; at=key; const on=!!h; f.g.visible=cart.visible=on; f.mute=!on; f.ghost=!on;
    if(!on){ f.x=f.z=-99; return; } const y=world.ground(h.x+0.5,h.y+0.5);
    f.x=h.x+0.5; f.z=h.y+0.5; f.y=y; f.g.position.set(f.x,y,f.z); cart.position.set(h.x+2,y,h.y+0.5); }
  // his wagon is solid, as in the game (reubenBlocks): the cart and the donkey's two tiles
  const baseMove=world.canMove;
  world.canMove=(fx,fz,tx,tz)=>{ const h=at!==null&&here(); if(h){ const bx=Math.floor(tx), by=Math.floor(tz); if(by===h.y&&bx>=h.x+1&&bx<=h.x+2) return false; } return baseMove(fx,fz,tx,tz); };
  world.anim.push(t=>{ place(); if(at!==null) cart.userData.tick(t); });
  function rumor(){ const t=town(); if(t===null||!unlocked()) return null; const name=TD[t].name;
    return [`You after potions? Reuben’s wagon is camped outside ${name}, by the way into town.`,
            'The fellow sells brews of every colour. Some of them colours I’ve never seen. Mind the murky ones.']; }
  return { here, rumor };
}
