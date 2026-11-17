// ════════════════════════════════════════════════════════════════
//  ARMS (V215) — the flag of Luminar, after Zak's own shield patch: a crown with a cross above a cart-wheel, a wreath of
//  thorns beneath it and three drops of blood — and over all, in Greek as a hand of the first century would have written it
//  (capitals, no spaces between the letters of a word, the sigma written as a crescent: C), ΧΡΙCΤΟC ΒΑCΙΛΕΥC — Christ the King.
//  Every town flies it in its own colours. Drawn once per town on a canvas; ARMS.on(mesh,key,w,h,side) lays it on a flag.
//  The King named here is Christ. (King Karl is a king under Him, never Him.)
// ════════════════════════════════════════════════════════════════
const ARMS=(function(){
  // field, border, lettering/wheel, per town
  const COL={ stormgate:['#1c2a52','#d8b24a','#f2ead2'], hearthvale:['#efe6d2','#1a1a1a','#1a1a1a'], ironhold:['#7d8188','#16181c','#16181c'], saltmere:['#1f6f7c','#efe6d2','#f2ead2'],
    thornwood:['#4d5a34','#15170f','#15170f'], dusthaven:['#b88a4e','#5a3c1e','#2a1c10'], crystalpeak:['#cfe6f2','#27406e','#1c2a52'], ashfield:['#2a2624','#d8642a','#f0d8b8'],
    shadowmere:['#3a2e5a','#c8c2dc','#e6e0f4'], hellgate:['#151214','#8a1a1a','#d8c8a8'], homestead:['#efe6d2','#6a4a2a','#2a1c10'] };
  const TEX={};
  function draw(key){ const [field,edge,ink]=COL[key]||COL.stormgate, W=256, H=320, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
    x.fillStyle=edge; x.fillRect(0,0,W,H); x.fillStyle=field; x.fillRect(9,9,W-18,H-18);
    // the weave of the cloth
    x.globalAlpha=0.06; x.fillStyle='#000'; for(let i=12;i<H-10;i+=4) x.fillRect(9,i,W-18,1); x.globalAlpha=1;
    // the words, on an arc: ΧΡΙCΤΟC ΒΑCΙΛΕΥC (sigma as the crescent C of the papyri)
    const words='ΧΡΙCΤΟC ΒΑCΙΛΕΥC', cx=W/2, cy=178, R=132, span=1.86; x.fillStyle=ink; x.font='700 23px Georgia,"Times New Roman",serif'; x.textAlign='center'; x.textBaseline='middle';
    for(let i=0;i<words.length;i++){ const a=-span/2+span*i/(words.length-1); x.save(); x.translate(cx+Math.sin(a)*R,cy-Math.cos(a)*R); x.rotate(a); x.fillText(words[i],0,0); x.restore(); }
    // the crown, gold, with its cross
    const gold='#e2b53a', gd='#a87a1c'; x.fillStyle=gold; x.strokeStyle=gd; x.lineWidth=2; x.beginPath(); x.moveTo(88,150); x.lineTo(84,116); x.lineTo(104,134); x.lineTo(116,108); x.lineTo(128,130); x.lineTo(140,108); x.lineTo(152,134); x.lineTo(172,116); x.lineTo(168,150); x.closePath(); x.fill(); x.stroke();
    x.fillRect(86,146,84,10); x.strokeRect(86,146,84,10); x.fillRect(124,84,8,26); x.fillRect(116,91,24,7); x.fillStyle='#fff'; x.fillRect(125,134,6,12); x.fillRect(122,137,12,6);
    // the wheel: a rim, a hub, eight spokes
    const wx=128, wy=206, wr=40; x.strokeStyle=ink; x.lineWidth=7; x.beginPath(); x.arc(wx,wy,wr,0,Math.PI*2); x.stroke(); x.lineWidth=4; for(let i=0;i<8;i++){ const a=i*Math.PI/4+Math.PI/8; x.beginPath(); x.moveTo(wx,wy); x.lineTo(wx+Math.cos(a)*wr,wy+Math.sin(a)*wr); x.stroke(); } x.fillStyle=ink; x.beginPath(); x.arc(wx,wy,6,0,Math.PI*2); x.fill();
    // the thorns: two woven boughs under the wheel, barbed
    x.strokeStyle='#6e431e'; x.lineWidth=5; for(const k of [0,1]){ x.beginPath(); for(let i=0;i<=40;i++){ const a=Math.PI*(0.04+0.92*i/40), r=58+Math.sin(i*0.9+k*Math.PI)*4; const px=wx+Math.cos(a)*r, py=wy+10+Math.sin(a)*r*0.72; i?x.lineTo(px,py):x.moveTo(px,py); } x.stroke(); }
    x.lineWidth=2; for(let i=0;i<13;i++){ const a=Math.PI*(0.06+0.88*i/12), r=58, px=wx+Math.cos(a)*r, py=wy+10+Math.sin(a)*r*0.72, o=(i%2?1:-1)*9; x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*o-4,py+Math.sin(a)*o-5); x.stroke(); }
    // three drops
    x.fillStyle='#c0181c'; for(const [dx,dy] of [[-12,278],[0,288],[12,278]]){ x.beginPath(); x.moveTo(wx+dx,dy-9); x.quadraticCurveTo(wx+dx+7,dy+3,wx+dx,dy+7); x.quadraticCurveTo(wx+dx-7,dy+3,wx+dx,dy-9); x.fill(); }
    const t=new THREE.CanvasTexture(cv); t.anisotropy=4; if(THREE.sRGBEncoding!==undefined&&t.encoding!==undefined&&typeof KLK_SRGB!=='undefined') t.encoding=THREE.sRGBEncoding; return t; }
  const tex=key=>TEX[key]||(TEX[key]=draw(key));
  const MAT={}; const mat=key=>MAT[key]||(MAT[key]=new THREE.MeshLambertMaterial({map:tex(key),side:THREE.DoubleSide}));
  // the nearest town's colours
  function keyAt(x,y){ try{ const T=(typeof WORLD_DATA!=='undefined'&&WORLD_DATA.towns)||[]; let b=null, bd=1e9; T.forEach(([n,tx,ty])=>{ const d=Math.hypot(tx-x,ty-y); if(d<bd){ bd=d; b=n; } }); const k=b?String(b).toLowerCase().replace(/[^a-z]/g,''):''; return COL[k]?k:'stormgate'; }catch(e){ return 'stormgate'; } }
  // lay the arms on a flag: a plate w × h on each face. side 'x' = the flag is thin along x (faces ±x), 'z' = thin along z
  function on(mesh,key,w,h,side,off,dy){ if(typeof document==='undefined'||!mesh) return; const o=off==null?0.02:off; try{ mesh.material=mesh.material.clone(); mesh.material.color.set((COL[key]||COL.stormgate)[0]); }catch(e){}   /* the cloth itself in the town's colour */
    for(const s of [1,-1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat(key)); if(side==='x'){ p.rotation.y=s*Math.PI/2; p.position.set(s*o,dy||0,0); } else { p.rotation.y=s>0?0:Math.PI; p.position.set(0,dy||0,s*o); } mesh.add(p); } }
  return { on, keyAt, tex, COL };
})();
