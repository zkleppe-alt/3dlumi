// ════════════════════════════════════════════════════════════════
//  THE STYLIST'S LOOKS AND THE STEEDS' BARDING (data/pastimes.json → looks: PET_LOOKS, PET_LOOK_ICON)
//   🎨 Coats (a three-stop ramp laid over the coat by lightness, so the shading survives), patterns (spots,
//      stripes, starry speckle, patches, dapple — painted on the body), accessories at the head, neck and back,
//      and effects that drift round your companion. Try anything on; buy it once (S.petLooksOwned) and any
//      companion can wear it; what each one WEARS lives on the pet itself (pet.look), as in petLookTap/petLookBuy.
//   ✨ Barding for a steed (S.mountSkin): the Spectral Barding (Mistral's reward, mountSkinOwned.spectral) — a cold
//      blue-white, half-translucent sheen — and the Coral Barding (Tirzah's, mountSkinOwned.uwcoral), the Sea
//      Dragon's only.
//  petLookApply(model, look, skin) · PETLOOKS.stylistTab() / PETLOOKS.act(a) · PETLOOKS.bardingRows(S) · PETLOOKS.key(S)
// ════════════════════════════════════════════════════════════════
const PETLOOKS=(function(){
  const D=()=>(typeof PASTIME_DATA!=='undefined'&&PASTIME_DATA.looks)||null, E=UI.esc;
  const items=slot=>{ const L=D().items; return slot==='coat'?L.coat:slot==='pattern'?L.pattern:slot==='fx'?L.fx:L.acc.filter(a=>a.slot===slot); };
  const find=(slot,id)=>items(slot).find(i=>i.id===id)||null;
  const owned=id=>!!(GAME.S.petLooksOwned&&GAME.S.petLooksOwned[id]);
  let tryOn=null;
  function shown(){ const S=GAME.S, L=Object.assign({},(S.pet&&S.pet.look)||{}); if(tryOn) L[tryOn.slot]=tryOn.id; return L; }
  function key(S){ const p=S.pet; return p?JSON.stringify([(p.look||{}),tryOn,S.mountSkin||'']):''; }
  // ── the tab in the stylist's sheet ──
  function stylistTab(){ const S=GAME.S, f=SYS.PETS[S.pet.id].forms[S.pet.form], W=(S.pet.look)||{}, t=tryOn&&find(tryOn.slot,tryOn.id);
    let h=`<p class="gm-intro" style="text-align:center">${E(SYS.PETS[S.pet.id].name)} · ${E(f.name)} · 🪙 <b style="color:var(--gold)">${S.gold}</b></p>`;
    h+=t?`<button class="gm-item worn" data-act="lbuy"><span>Trying on <b>${E(t.name)}</b>${t.verse?` <span class="ds">· ${E(t.verse)}</span>`:''} — your companion wears it now; look!</span><i>${S.gold>=t.price?'Buy':'Need'} 🪙${t.price}</i></button>`
       :`<p class="gm-hint">Tap anything to try it on — your companion wears it at once. Buy it once and any companion can wear it.</p>`;
    D().sections.forEach(([slot,title])=>{ h+=`<div class="gm-sec">${E(title)}</div>`;
      items(slot).forEach(it=>{ const own=owned(it.id), worn=W[slot]===it.id, trying=tryOn&&tryOn.id===it.id;
        const icon=slot==='coat'?`<span style="display:inline-flex;border:1px solid #1a1410;border-radius:2px;overflow:hidden;vertical-align:middle">${it.ramp.map(c=>`<span style="width:6px;height:12px;background:${c}"></span>`).join('')}</span>`:(D().icon[it.id]||'•');
        h+=`<button class="gm-item ${worn||trying?'worn':''}" data-act="look:${slot}:${it.id}"><span>${icon} ${E(it.name)}</span><i>${worn?'✓ wearing':own?'owned':trying?'trying on':'🪙'+it.price}</i></button>`; }); });
    return h; }
  function act(a){ const S=GAME.S, [k,slot,id]=a.split(':'); if(!S.pet) return '';
    if(k==='look'){ if(owned(id)){ S.pet.look=S.pet.look||{}; if(S.pet.look[slot]===id) delete S.pet.look[slot]; else S.pet.look[slot]=id; tryOn=null; GAME.changed(); GAME.save(); }
      else tryOn=(tryOn&&tryOn.id===id)?null:{slot,id}; return ''; }
    if(k==='lbuy'&&tryOn){ const it=find(tryOn.slot,tryOn.id); if(!it||owned(it.id)) return '';
      if(S.gold<it.price) return `💈 “That one’s ${it.price} gold, dear — come back when your purse is heavier.”`;
      S.gold-=it.price; S.petLooksOwned=S.petLooksOwned||{}; S.petLooksOwned[it.id]=true; S.pet.look=S.pet.look||{}; S.pet.look[tryOn.slot]=it.id; tryOn=null; GAME.changed(); GAME.save();
      return `💈 ${it.name} — it suits them!`; }
    return ''; }
  function endTry(){ if(tryOn){ tryOn=null; GAME.changed(); } }
  // ── the Pet tab's barding rows (spectral · coral) ──
  function bardingRows(S){ const o=S.mountSkinOwned||{}; if(!o.spectral&&!o.uwcoral) return ''; const cur=S.mountSkin||null, sea=S.pet&&S.pet.id==='steadfast';
    let h='<div class="gm-sec">Pet Barding</div>';
    if(o.spectral) h+=`<button class="gm-item ${cur==='spectral'?'worn':''}" data-act="skin:spectral"><span>✨ Spectral Barding <span class="ds">a ghostly blue-white sheen</span></span><i>${cur==='spectral'?'equipped':'tap'}</i></button>`;
    if(o.uwcoral) h+=`<button class="gm-item ${cur==='uwcoral'?'worn':''}" data-act="skin:uwcoral"><span>🪸 Coral Barding <span class="ds">${sea?'coral and pearl, from the deep':'for the Sea Dragon only'}</span></span><i>${cur==='uwcoral'?'equipped':'tap'}</i></button>`;
    h+=`<button class="gm-item ${!cur?'worn':''}" data-act="skin:"><span>Normal <span class="ds">your steed’s true coat</span></span>${!cur?'<i>equipped</i>':''}</button>`;
    return h; }
  return { stylistTab, act, endTry, bardingRows, key, shown, find };
})();

// ── colour helpers ──
function _lkHsl(c){ const o={}; c.getHSL(o); return o; }
function _lkRamp(ramp,t){ const a=new THREE.Color(ramp[0]), b=new THREE.Color(ramp[1]), c=new THREE.Color(ramp[2]); return t<0.5?a.lerp(b,t*2):b.lerp(c,(t-0.5)*2); }
function _lkGlyph(ch,col){ const k=ch+col; _lkGlyph.c=_lkGlyph.c||{}; if(_lkGlyph.c[k]) return _lkGlyph.c[k];
  const cv=document.createElement('canvas'); cv.width=cv.height=64; const g=cv.getContext('2d'); g.textAlign='center'; g.textBaseline='middle';
  if(ch==='•'){ const gr=g.createRadialGradient(32,32,0,32,32,30); gr.addColorStop(0,col); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); }
  else { g.font='44px serif'; g.fillStyle=col||'#fff'; g.fillText(ch,32,36); }
  const t=new THREE.CanvasTexture(cv); return (_lkGlyph.c[k]=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false})); }
const PET_FX={ sparkle:['✦','#fff6c0',1], glow:['•','#fff0a0',0], hearts:['♥','#ff7a9a',1], notes:['♪','#f2e2b0',1], petals:['❀','#ffb0c8',-1], fireflies:['•','#e8ff70',2], bubbles:['○','#c8f0ff',1] };

// dress a companion's (or steed's) model: look = pet.look, skin = S.mountSkin (steeds only)
// the model offers userData.body (the moving group), .head [y,z], .neck [y,z], .back [y,z] and .ls (accessory scale)
function petLookApply(m,look,skin,kind){ look=look||{}; const U=m.userData, body=U.body||m, ls=U.ls||0.3;
  const meshes=[]; m.traverse(o=>{ if(o.isMesh&&o.material&&o.material.color&&!o.userData.lk) meshes.push(o); });
  if(U.sculpt&&U.mats&&U.mats[0]){ const M0=U.mats[0]; M0.color.setHex(0xe9e4dc); M0.transparent=false; M0.opacity=1;   /* V184: a sculpted companion wears its coat as a tint over its own painting */
    if(look.coat){ const it=PETLOOKS.find('coat',look.coat); if(it) M0.color.copy(_lkRamp(it.ramp,0.75)).lerp(new THREE.Color(0xffffff),0.3); }
    if(skin==='spectral'){ M0.color.lerp(new THREE.Color(0xc8ecff),0.65); M0.transparent=true; M0.opacity=0.8; } }
  // 1 · the coat: the most common hue (by surface) among the model's colours, mapped onto the ramp by lightness
  if(look.coat){ const it=PETLOOKS.find('coat',look.coat); if(it){ const bins={};
      meshes.forEach(o=>{ const h=_lkHsl(o.material.color); if(h.l<0.12) return; const g=h.s>0.12?'h'+Math.floor(((h.h*360+15)%360)/30):(h.l>0.5?'nl':'nd');
        o.geometry.computeBoundingBox(); const s=new THREE.Vector3(); o.geometry.boundingBox.getSize(s); (bins[g]=bins[g]||[]).push([o,s.x*s.y+s.y*s.z+s.x*s.z]); });
      let best=null, bn=0; for(const g in bins){ const n=bins[g].reduce((a,[,w])=>a+w,0); if(n>bn){ bn=n; best=g; } }
      if(best){ let set=bins[best]; if(best[0]==='h'){ const b=+best.slice(1); [(b+1)%12,(b+11)%12].forEach(nb=>{ const g=bins['h'+nb]; if(g&&g.reduce((a,[,w])=>a+w,0)>bn*0.25) set=set.concat(g); }); }
        const Ls=set.map(([o])=>_lkHsl(o.material.color).l), lo=Math.min(...Ls), hi=Math.max(...Ls);
        set.forEach(([o],i)=>{ o.material=o.material.clone(); o.material.color.copy(_lkRamp(it.ramp,hi>lo?(Ls[i]-lo)/(hi-lo):0.5)); }); } } }
  // 2 · the pattern: painted on the largest body piece
  if(look.pattern){ let big=null, bv=0; meshes.forEach(o=>{ if(o.parent===m) return; o.geometry.computeBoundingBox(); const s=new THREE.Vector3(); o.geometry.boundingBox.getSize(s); const v=s.x*s.y*s.z; if(v>bv){ bv=v; big=o; } });
    if(big){ const bb=big.geometry.boundingBox, c=big.material.color.clone(), dark=c.clone().multiplyScalar(0.55), light=c.clone().lerp(new THREE.Color(0xffffff),0.6);
      const sx=bb.max.x-bb.min.x, sz=bb.max.z-bb.min.z, top=bb.max.y+0.005, P=look.pattern, add=(geo,col,x,z,ry)=>{ const d=new THREE.Mesh(geo,flat(col.getHex())); d.position.set(x,top,z); d.rotation.y=ry||0; d.userData.lk=1; big.add(d); };
      const rnd=(i,k)=>((Math.sin(i*12.9898+k*78.233)*43758.5453)%1+1)%1;
      if(P==='stripes') for(let i=1;i<5;i++) add(new THREE.BoxGeometry(sx*1.02,0.012,sz*0.07),dark,0,bb.min.z+sz*i/5);
      else for(let i=0;i<(P==='stars'?14:P==='dapple'?10:7);i++){ const x=bb.min.x+sx*(0.12+0.76*rnd(i,1)), z=bb.min.z+sz*(0.1+0.8*rnd(i,2));
        if(P==='stars') add(new THREE.BoxGeometry(0.03,0.012,0.03),new THREE.Color(0xfff6c0),x,z,0.78);
        else if(P==='patches') add(new THREE.BoxGeometry(sx*0.3,0.012,sz*0.18),i%2?light:dark,x*0.7,z,rnd(i,3));
        else { const d=new THREE.Mesh(new THREE.CylinderGeometry(P==='dapple'?sx*0.09:sx*0.13,P==='dapple'?sx*0.09:sx*0.13,0.012,8),flat((P==='dapple'?light:dark).getHex())); d.position.set(x,top,z); d.userData.lk=1; big.add(d); } } } }
  // 3 · accessories at the head, neck and back
  const at=(k,fn)=>{ const a=U[k]; if(!a) return; const g=group(0,a[0],a[1],body); g.scale.setScalar(ls/0.3); fn(g); g.traverse(o=>{ if(o.isMesh) o.userData.lk=1; }); shade(g); };
  if(look.head) at('head',g=>{ const H=look.head;
    if(H==='crown'){ Cy(0.12,0.11,0.07,8,0xe8c040,0,0,0,g); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; Co(0.025,0.06,4,0xf2d060,Math.sin(a)*0.11,0.07,Math.cos(a)*0.11,g); } Sp(0.02,0xd83a4a,0,0.05,0.115,g); }
    else if(H==='laurel'){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.11,0.025,5,14),flat(0x5a9a3a)); r.rotation.x=Math.PI/2; r.position.y=0.02; g.add(r); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; Sp(0.025,0x7ab84a,Math.sin(a)*0.11,0.04,Math.cos(a)*0.11,g); } }
    else if(H==='flowers'){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.11,0.02,5,14),flat(0x4a8a3a)); r.rotation.x=Math.PI/2; r.position.y=0.02; g.add(r); [0xff8ab0,0xfff070,0xffffff,0xc8a0f0,0xff8ab0,0xfff070].forEach((c,i)=>{ const a=i/6*Math.PI*2; Sp(0.032,c,Math.sin(a)*0.11,0.04,Math.cos(a)*0.11,g); }); }
    else if(H==='cap'){ Cy(0.1,0.12,0.06,8,0x3a5a9a,0,0,0,g); Cy(0.16,0.16,0.012,10,0x2a4a8a,0,0,0,g); const f=B(0.02,0.2,0.05,0xd84a3a,0.07,0.04,-0.04,g); f.rotation.z=-0.5; f.rotation.x=-0.3; } });
  if(look.neck) at('neck',g=>{ const N=look.neck;
    const band=(c,t)=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(0.14,t||0.025,6,16),flat(c)); r.rotation.x=Math.PI/2; g.add(r); };
    if(N==='bell'){ band(0x8a2a2a); Sp(0.045,0xe8c040,0,-0.05,0.14,g); }
    else if(N==='scarf'){ band(0xd83a3a,0.04); const t=B(0.07,0.18,0.03,0xd83a3a,0.05,-0.2,0.13,g); t.rotation.z=0.2; }
    else if(N==='pearls'){ for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; Sp(0.022,0xf4f0e8,Math.sin(a)*0.14,-Math.abs(Math.cos(a/2))*0.03,Math.cos(a)*0.14,g); } } });
  if(look.back) at('back',g=>{ const K2=look.back;
    if(K2==='cape'){ B(0.34,0.03,0.4,0x6a2a9a,0,0,-0.05,g); B(0.36,0.2,0.03,0x6a2a9a,0,-0.2,-0.25,g); B(0.36,0.025,0.03,0xe8c040,0,0,0.15,g); }
    else if(K2==='tabard'){ B(0.36,0.025,0.38,0xf4eee0,0,0,0,g); B(0.06,0.03,0.26,0xc82a2a,0,0.003,0,g); B(0.2,0.03,0.06,0xc82a2a,0,0.004,0.04,g); [-1,1].forEach(s=>B(0.03,0.2,0.36,0xf4eee0,s*0.18,-0.2,0,g)); } });
  // 4 · the effect: drifting glyphs (or a holy glow)
  U.fxTick=null;
  if(look.fx&&PET_FX[look.fx]){ const [ch,col,rise]=PET_FX[look.fx], sps=[], top=(U.head?U.head[0]:0.5)+0.1;
    if(look.fx==='glow'){ const s=new THREE.Sprite(_lkGlyph('•',col)); s.scale.setScalar(ls*6); s.position.set(0,top*0.6,0); s.material.opacity=0.55; body.add(s); sps.push(s); }
    else for(let i=0;i<6;i++){ const s=new THREE.Sprite(_lkGlyph(ch,col)); s.scale.setScalar(ls*0.55); s.userData.ph=i/6; body.add(s); sps.push(s); }
    U.fxTick=t=>{ sps.forEach((s,i)=>{ if(look.fx==='glow'){ s.material.opacity=0.42+Math.sin(t*2)*0.12; return; }
      const ph=((t*0.35+s.userData.ph)%1), a=s.userData.ph*Math.PI*2+t*(rise===2?0.6:0.3), r=ls*(rise===2?2.4:1.6);
      s.position.set(Math.sin(a)*r,rise===-1?top+0.4-ph*0.6:rise===2?top*0.6+Math.sin(t*1.7+i)*0.25:top*0.5+ph*0.7,Math.cos(a)*r);
      s.material.opacity=rise===2?(0.4+0.6*Math.abs(Math.sin(t*3+i))):Math.sin(ph*Math.PI); }); }; }
  // 5 · barding: spectral (every coat a cold blue-white, half seen through) or coral (the Sea Dragon's)
  if(skin==='spectral') meshes.forEach(o=>{ o.material=o.material.clone(); o.material.color.lerp(new THREE.Color(0xc8ecff),0.65); o.material.transparent=true; o.material.opacity=0.78; if(o.material.emissive) o.material.emissive.setHex(0x1a3a5a); });
  if(skin==='uwcoral'&&kind==='dragon'&&!U.sculpt){ const g=group(0,0,0,body); B(0.66,0.06,0.72,0xd8586a,0,1.27,0.05,g); B(0.67,0.28,0.7,0xd8586a,0,0.99,0.05,g); B(0.68,0.04,0.71,0xf5a0a8,0,1.26,0.05,g);
    for(let i=0;i<9;i++){ Sp(0.04,0xf4f0e8,-0.34,1.0,-0.28+i*0.08,g); Sp(0.04,0xf4f0e8,0.34,1.0,-0.28+i*0.08,g); } [[-0.2,0.5],[0.2,0.5],[0,0.62]].forEach(([x,z])=>Co(0.05,0.18,5,0xf08a96,x,1.32,z-0.6,g)); shade(g); }
  return m; }
