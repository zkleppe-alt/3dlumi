// ════════════════════════════════════════════════════════════════
//  CRESTS (V283) — the village shields of the throne hall, from Zak's own "Battle Worn" crest (Restful Knight Gaming art,
//  cut from his sheet by tools/crest_art.py into CREST_ART): the steel-rimmed, riveted shield with the rooted tree, the
//  three drops, the wheel in the crown of thorns and the crowned cross in gold. Each village's shield is that picture with
//  its navy field repainted in the village's colour, and the field just inside the rim embroidered with the village's own
//  sign in its trim colour. The gold, the steel and the wear are left exactly as he drew them.
//  CREST.tex(theme) → canvas texture   CREST.shield(theme) → group (face +z, 1.1 wide, hangs from y=0 down)   CREST.veil()
// ════════════════════════════════════════════════════════════════
const CREST=(()=>{
  const A=typeof CREST_ART!=='undefined'?CREST_ART:null;
  const H=A?A.H:1.5;
  // the village motifs for the embroidered band, drawn about (0,0) at ~10px (scaled up on the 2× picture)
  const MOTIF={
    hearth:(x)=>{ x.beginPath(); x.moveTo(0,-9); x.quadraticCurveTo(7,-1,3,7); x.quadraticCurveTo(0,4,-3,7); x.quadraticCurveTo(-7,-1,0,-9); x.fill(); },   // candle flames
    iron:(x)=>{ x.lineWidth=2.6; x.beginPath(); x.ellipse(0,0,4,8,0,0,Math.PI*2); x.stroke(); },   // chain links
    tide:(x)=>{ x.lineWidth=2.6; x.beginPath(); x.moveTo(-9,3); x.quadraticCurveTo(-4,-7,0,0); x.quadraticCurveTo(4,7,9,-3); x.stroke(); },   // waves
    root:(x)=>{ x.beginPath(); x.ellipse(0,0,4,9,0.6,0,Math.PI*2); x.fill(); },   // leaves on a vine
    ember:(x)=>{ x.beginPath(); x.moveTo(0,-10); x.quadraticCurveTo(8,0,0,9); x.quadraticCurveTo(-8,0,0,-10); x.fill(); },
    frost:(x)=>{ x.lineWidth=2.2; for(let k=0;k<3;k++){ x.save(); x.rotate(k*Math.PI/3); x.beginPath(); x.moveTo(0,-9); x.lineTo(0,9); x.moveTo(-3,-6); x.lineTo(0,-3); x.lineTo(3,-6); x.stroke(); x.restore(); } },   // snowflakes
    char:(x)=>{ x.beginPath(); for(let k=0;k<4;k++){ const a=k*Math.PI/2; x.lineTo(Math.cos(a)*9,Math.sin(a)*9); x.lineTo(Math.cos(a+Math.PI/4)*3,Math.sin(a+Math.PI/4)*3); } x.closePath(); x.fill(); },   // sparks
    storm:(x)=>{ x.beginPath(); x.moveTo(2,-10); x.lineTo(-5,1); x.lineTo(0,1); x.lineTo(-2,10); x.lineTo(5,-2); x.lineTo(0,-2); x.closePath(); x.fill(); },   // lightning
    shade:(x)=>{ x.beginPath(); for(let k=0;k<10;k++){ const a=k*Math.PI/5-Math.PI/2, r=k%2?3.6:9; x.lineTo(Math.cos(a)*r,Math.sin(a)*r); } x.closePath(); x.fill(); },   // stars
    void:(x)=>{ x.fillRect(-1.8,-9,3.6,18); x.fillRect(-6,-4.5,12,3.6); }   // small crosses
  };
  let img=null, imgReady=false; const waiting=[];
  if(A){ img=new Image(); img.onload=()=>{ imgReady=true; waiting.splice(0).forEach(f=>f()); }; img.src=A.img; }
  const SRGB=()=>typeof ENGINE!=='undefined'&&ENGINE.renderer&&ENGINE.renderer.outputEncoding===THREE.sRGBEncoding;
  // the outline in picture pixels, moved inward by d
  function inset(d){ const W=A.w, Hh=A.h, P=A.poly.map(p=>[p[2]*W,(1-p[3])*Hh]), n=P.length, out=[];
    for(let i=0;i<n;i++){ const a=P[(i-1+n)%n], b=P[i], c=P[(i+1)%n]; let nx=-(c[1]-a[1]), ny=c[0]-a[0]; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l;
      const mx=W/2-b[0], my=Hh*0.45-b[1]; if(nx*mx+ny*my<0){ nx=-nx; ny=-ny; } out.push([b[0]+nx*d,b[1]+ny*d]); }   // inward: toward the middle
    return out; }
  const cache={};
  function paint(c,th){ const x=c.getContext('2d'), W=c.width, Hh=c.height;
    x.drawImage(img,0,0,W,Hh);
    const id=x.getImageData(0,0,W,Hh), D=id.data, F=new Float32Array(W*Hh);
    const col=new THREE.Color(th?th.banner:0x1e2a52), tr=col.r*255, tg=col.g*255, tb=col.b*255, Lref=46;
    for(let i=0,j=0;i<D.length;i+=4,j++){ const r=D[i], g=D[i+1], b=D[i+2], L=(r+g+b)/3, mx=Math.max(r,g,b), mn=Math.min(r,g,b);
      const gold=Math.min(1,Math.max(0,(r-b-22)/50)), steel=Math.min(1,Math.max(0,(L-88)/30))*Math.min(1,Math.max(0,(40-(mx-mn))/25));
      const f=(1-gold)*(1-steel)*Math.min(1,Math.max(0,(118-L)/38)); F[j]=f; if(f<=0) continue;
      const k=L/Lref; D[i]=r+(Math.min(255,tr*k)-r)*f; D[i+1]=g+(Math.min(255,tg*k)-g)*f; D[i+2]=b+(Math.min(255,tb*k)-b)*f; }
    // the embroidered band: the village's sign in its trim colour, laid only on the painted field (never over gold or steel)
    const L2=document.createElement('canvas'); L2.width=W; L2.height=Hh; const g=L2.getContext('2d'); const trim='#'+new THREE.Color(th?th.trim:0xd8b060).getHexString();
    g.strokeStyle=trim; g.fillStyle=trim; g.lineCap='round'; g.lineJoin='round';
    const ring=(d,w)=>{ const p=inset(d); g.lineWidth=w; g.beginPath(); p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); g.stroke(); };
    const s=W/353, rim=24*s; ring(rim+4*s,2.2*s); ring(rim+21*s,2.2*s);
    { const m=MOTIF[th&&th.key]||MOTIF.void, p=inset(rim+12.5*s), per=[]; let tot=0; for(let i=0;i<p.length;i++){ const a=p[i], b=p[(i+1)%p.length], d=Math.hypot(b[0]-a[0],b[1]-a[1]); per.push([a,b,d]); tot+=d; }
      const n=40, step=tot/n; let acc=step/2, k=0, run=0;
      for(const [a,b,d] of per){ while(acc<=run+d&&k<n){ const t=(acc-run)/d; g.save(); g.translate(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t); g.rotate(Math.atan2(b[1]-a[1],b[0]-a[0])); g.scale(s*0.62,s*0.62); m(g); g.restore(); acc+=step; k++; } run+=d; } }
    const E=g.getImageData(0,0,W,Hh).data;
    for(let i=0,j=0;i<D.length;i+=4,j++){ const a=E[i+3]/255*Math.min(1,F[j]*1.4)*0.9; if(a<=0) continue;
      const px=j%W, py=(j/W)|0, sh=(px+py)%3===0?1:0.84;   // a little thread texture
      D[i]+=(E[i]*sh-D[i])*a; D[i+1]+=(E[i+1]*sh-D[i+1])*a; D[i+2]+=(E[i+2]*sh-D[i+2])*a; }
    x.putImageData(id,0,0); }
  function tex(th){ const key=th&&th.key||'x'; if(cache[key]) return cache[key];
    const c=document.createElement('canvas'); c.width=A?A.w:256; c.height=A?A.h:330; const x=c.getContext('2d'); x.fillStyle='#'+new THREE.Color(th?th.banner:0x1e2a52).getHexString(); x.fillRect(0,0,c.width,c.height);
    const t=new THREE.CanvasTexture(c); t.anisotropy=8; if(SRGB()) t.encoding=THREE.sRGBEncoding;
    if(A){ const go=()=>{ paint(c,th); t.needsUpdate=true; }; if(imgReady) go(); else waiting.push(go); }
    return cache[key]=t; }
  // a gentle convex curve across the shield, like a real one
  const bend=(geo,k)=>{ const p=geo.attributes.position; for(let i=0;i<p.count;i++){ const u=p.getX(i)/0.55; p.setZ(i,p.getZ(i)-k*u*u); } p.needsUpdate=true; geo.computeVertexNormals(); return geo; };
  let STEEL=null, WOOD=null;
  const outline=()=>A?A.poly.map(p=>new THREE.Vector2(p[0],p[1])):[];
  function shield(th){
    STEEL=STEEL||new THREE.MeshPhongMaterial({color:0x8c9098,shininess:30,specular:0x555a60});
    WOOD=WOOD||new THREE.MeshLambertMaterial({color:0x2a1c12});
    const grp=new THREE.Group(); if(!A) return grp;
    const body=new THREE.Mesh(bend(new THREE.ExtrudeGeometry(new THREE.Shape(outline()),{depth:0.05,bevelEnabled:false}),0.1),[WOOD,STEEL]); body.position.z=-0.051; grp.add(body);
    const fg=new THREE.ShapeGeometry(new THREE.Shape(outline())); const uv=fg.attributes.uv, pp=fg.attributes.position;
    for(let i=0;i<pp.count;i++) uv.setXY(i,pp.getX(i)/1.1+0.5,1+pp.getY(i)/H);
    const face=new THREE.Mesh(bend(fg,0.1),new THREE.MeshLambertMaterial({map:tex(th)})); grp.add(face);
    grp.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } });
    grp.userData.face=face; grp.userData.H=H; return grp; }
  // the dark cloth over a shield not yet earned: hangs from the top, sags over the boss, narrows and frays toward the point
  function veil(){ const VH=H+0.14, geo=new THREE.PlaneGeometry(1.26,VH,12,16); const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){ const X=p.getX(i), Y=p.getY(i), v=(VH/2-Y)/VH, u=X/0.63;
      p.setZ(i,0.07+0.06*Math.sin(v*Math.PI)*(1-u*u)+0.03*Math.sin(X*19+v*2)*v-0.1*u*u*0.6);
      p.setX(i,X*(1-0.42*v*v)+0.02*Math.sin(v*9+X*4)*v); p.setY(i,Y-0.16*Math.pow(v,3)*(1-Math.abs(u))-(v>0.97?0.025*Math.abs(Math.sin(X*31)):0)); }
    geo.translate(0,-VH/2+0.04,0); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x2a2430,side:THREE.DoubleSide})); m.castShadow=true; m.receiveShadow=true; return m; }
  return {tex,shield,veil,H};
})();
