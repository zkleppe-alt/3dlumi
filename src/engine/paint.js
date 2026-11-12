// ════════════════════════════════════════════════════════════════
//  PAINT — surface materials for the hero models, painted on canvases when the game loads (no image files): brushed
//  and scratched steel, worn gold, woven cloth, grained leather, riveted mail rings and horsehair. Each comes as a
//  colour map (pale, so a livery's colour tints it), a roughness map and a bump map, on a physically based material
//  that reflects a small painted sky (so polished plate catches the light the way the concept art shows).
//  PAINT.mat(kind,color,opts) → MeshStandardMaterial      kinds: steel gold cloth leather mail hair dark
// ════════════════════════════════════════════════════════════════
const PAINT=(function(){
  const cache={}, S=512;
  let seed=1; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
  const cv=(n)=>{ const c=document.createElement('canvas'); c.width=c.height=n||S; return c; };
  // value-noise fbm into a Float32 field, tiling
  function fbm(n,oct,base){ const f=new Float32Array(n*n); let amp=1, tot=0;
    for(let o=0;o<oct;o++){ const g=base*(1<<o), grid=new Float32Array((g+1)*(g+1)); for(let i=0;i<grid.length;i++) grid[i]=rnd();
      for(let y=0;y<g;y++) for(let x=0;x<g;x++) grid[y*(g+1)+x]=grid[y*(g+1)+x]; for(let i=0;i<=g;i++){ grid[g*(g+1)+i]=grid[i]; grid[i*(g+1)+g]=grid[i*(g+1)]; }
      for(let y=0;y<n;y++){ const gy=y/n*g, y0=gy|0, ty=gy-y0, sy=ty*ty*(3-2*ty); for(let x=0;x<n;x++){ const gx=x/n*g, x0=gx|0, tx=gx-x0, sx=tx*tx*(3-2*tx);
        const a=grid[y0*(g+1)+x0], b=grid[y0*(g+1)+x0+1], c=grid[(y0+1)*(g+1)+x0], d=grid[(y0+1)*(g+1)+x0+1]; f[y*n+x]+=amp*((a+(b-a)*sx)+((c+(d-c)*sx)-(a+(b-a)*sx))*sy); } }
      tot+=amp; amp*=0.5; }
    for(let i=0;i<f.length;i++) f[i]/=tot; return f; }
  function put(c,fn){ const g=c.getContext('2d'), im=g.createImageData(c.width,c.height), d=im.data, n=c.width; for(let y=0;y<n;y++) for(let x=0;x<n;x++){ const v=fn(x,y), i=(y*n+x)*4; d[i]=v[0]; d[i+1]=v[1]; d[i+2]=v[2]; d[i+3]=255; } g.putImageData(im,0,0); return g; }
  const tex=(c,rep)=>{ const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(rep) t.repeat.set(rep,rep); t.anisotropy=4; return t; };
  const clamp=v=>Math.max(0,Math.min(255,v|0));
  function scratches(g,n,count,len,col,w){ g.strokeStyle=col; g.lineWidth=w||1; for(let i=0;i<count;i++){ const x=rnd()*n, y=rnd()*n, a=rnd()*Math.PI, l=len*(0.3+rnd()); g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+Math.cos(a)*l*0.5+(rnd()-0.5)*6,y+Math.sin(a)*l*0.5+(rnd()-0.5)*6,x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } }
  const build={
    // steel, painted: warm and cool patches like a concept painter's brushwork, grime gathered low, worn bright edges and
    //  scratches, a few dents — matte enough that the plate reads as painted metal, not chrome
    steel(){ seed=11; const n=S, A=fbm(n,5,4), B=fbm(n,3,24), W=fbm(n,4,3), map=cv(), rough=cv(), bump=cv();
      const g=put(map,(x,y)=>{ const i=y*n+x, br=(Math.sin(y*0.9+B[i]*6)*0.5+0.5)*8, w=W[i]-0.5, v=206+br-A[i]*58; return [clamp(v+22*w+6),clamp(v+6*w+2),clamp(v-14*w-4)]; });
      for(let i=0;i<90;i++){ const x=rnd()*n, y=rnd()*n, r=8+rnd()*26; const gr=g.createRadialGradient(x,y,0,x,y,r); const warm=rnd()<0.5;
        gr.addColorStop(0,warm?'rgba(150,118,84,0.10)':'rgba(90,104,130,0.09)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); }   // painted patches
      scratches(g,n,90,36,'rgba(255,250,240,0.2)',1); scratches(g,n,50,24,'rgba(50,42,38,0.18)',1.4);
      const gr=put(rough,(x,y)=>{ const v=120+A[y*n+x]*90+B[y*n+x]*30; return [v,v,v]; }); scratches(gr,n,70,36,'rgba(220,220,220,0.35)',1);
      const gb=put(bump,(x,y)=>{ const v=128+(A[y*n+x]-0.5)*34; return [v,v,v]; }); scratches(gb,n,80,30,'rgba(70,70,70,0.35)',1);
      for(let i=0;i<14;i++){ gb.fillStyle=`rgba(90,90,90,${0.15+rnd()*0.2})`; gb.beginPath(); gb.arc(rnd()*n,rnd()*n,2+rnd()*5,0,7); gb.fill(); }   // dents
      return {map:tex(map,1),rough:tex(rough,1),bump:tex(bump,1)}; },
    gold(){ seed=23; const n=S, A=fbm(n,5,5), map=cv(), rough=cv(), bump=cv();
      const g=put(map,(x,y)=>{ const v=1-A[y*n+x]*0.35; return [clamp(255*v),clamp(236*v),clamp(196*v)]; }); scratches(g,n,50,26,'rgba(255,250,220,0.2)',1); scratches(g,n,30,18,'rgba(90,60,20,0.18)',1);
      put(rough,(x,y)=>{ const v=70+A[y*n+x]*110; return [v,v,v]; });
      const gb=put(bump,(x,y)=>{ const v=128+(A[y*n+x]-0.5)*24; return [v,v,v]; }); scratches(gb,n,50,22,'rgba(70,70,70,0.3)',1);
      return {map:tex(map,1),rough:tex(rough,1),bump:tex(bump,1)}; },
    cloth(){ seed=37; const n=S, A=fbm(n,5,3), B=fbm(n,4,12), map=cv(), rough=cv(), bump=cv();
      const weave=(x,y)=>{ const u=x%4, v=y%4, over=((x>>2)+(y>>2))&1; return over?(u===0||u===3?-1:1):(v===0||v===3?-1:1); };
      put(map,(x,y)=>{ const v=232+weave(x,y)*7-A[y*n+x]*40-B[y*n+x]*14+(Math.sin(x*0.05+A[y*n+x]*8)*6); return [clamp(v),clamp(v),clamp(v+4)]; });
      put(rough,(x,y)=>{ const v=225+weave(x,y)*10; return [v,v,v]; });
      put(bump,(x,y)=>{ const v=128+weave(x,y)*40+(B[y*n+x]-0.5)*40; return [clamp(v),clamp(v),clamp(v)]; });
      return {map:tex(map,3),rough:tex(rough,3),bump:tex(bump,3)}; },
    leather(){ seed=51; const n=S, A=fbm(n,6,10), C=fbm(n,3,3), map=cv(), rough=cv(), bump=cv();
      const g=put(map,(x,y)=>{ const v=225-A[y*n+x]*55-C[y*n+x]*40; return [clamp(v),clamp(v*0.95),clamp(v*0.9)]; }); scratches(g,n,120,18,'rgba(255,240,220,0.25)',1);
      put(rough,(x,y)=>{ const v=150+A[y*n+x]*80; return [v,v,v]; });
      put(bump,(x,y)=>{ const v=128+(A[y*n+x]-0.5)*90; return [clamp(v),clamp(v),clamp(v)]; });
      return {map:tex(map,2),rough:tex(rough,2),bump:tex(bump,2)}; },
    mail(){ seed=67; const n=S, A=fbm(n,4,4), map=cv(), rough=cv(), bump=cv();
      const ring=(gg,stroke)=>{ gg.lineWidth=3; for(let row=0;row<n/12+1;row++) for(let col=0;col<n/12+1;col++){ const x=col*12+(row%2)*6, y=row*10; gg.strokeStyle=stroke(row,col); gg.beginPath(); gg.arc(x,y,6,0,7); gg.stroke(); } };
      const g=put(map,(x,y)=>{ const v=70-A[y*n+x]*30; return [clamp(v),clamp(v),clamp(v+4)]; }); ring(g,(r,c)=>`rgb(${170+((r*7+c*3)%5)*12},${172+((r*7+c*3)%5)*12},${180+((r*7+c*3)%5)*12})`);
      const gr=put(rough,()=>[230,230,230]); ring(gr,()=>'rgb(110,110,110)');
      const gb=put(bump,()=>[60,60,60]); ring(gb,()=>'rgb(230,230,230)');
      return {map:tex(map,4),rough:tex(rough,4),bump:tex(bump,4)}; },
    hair(){ seed=79; const n=S, map=cv(), rough=cv(), bump=cv(), lines=new Float32Array(n); for(let i=0;i<n;i++) lines[i]=rnd();
      put(map,(x,y)=>{ const v=200+lines[y]*55-(lines[(y*7)%n]>0.8?50:0); return [clamp(v),clamp(v),clamp(v)]; });
      put(rough,(x,y)=>{ const v=120+lines[y]*100; return [v,v,v]; });
      put(bump,(x,y)=>{ const v=60+lines[y]*190; return [clamp(v),clamp(v),clamp(v)]; });
      return {map:tex(map,1),rough:tex(rough,1),bump:tex(bump,1)}; },
    dark(){ seed=91; const n=S, A=fbm(n,5,6), map=cv(), rough=cv(), bump=cv();
      const g=put(map,(x,y)=>{ const v=150-A[y*n+x]*60; return [clamp(v),clamp(v),clamp(v+6)]; }); scratches(g,n,160,24,'rgba(230,230,240,0.35)',1);
      put(rough,(x,y)=>{ const v=130+A[y*n+x]*90; return [v,v,v]; }); put(bump,(x,y)=>{ const v=128+(A[y*n+x]-0.5)*40; return [v,v,v]; });
      return {map:tex(map,1),rough:tex(rough,1),bump:tex(bump,1)}; } };
  // skin: a soft, warm, faintly mottled surface (a little blush and shadow in it), never shiny
  build.skin=function(){ seed=97; const n=256, A=fbm(n,5,6), B=fbm(n,3,2), map=cv(n), rough=cv(n), bump=cv(n);
    put(map,(x,y)=>{ const i=y*n+x, v=236-A[i]*22, w=B[i]-0.5; return [clamp(v+10*w+4),clamp(v-6-4*w),clamp(v-10-8*w)]; });
    put(rough,(x,y)=>{ const v=150+A[y*n+x]*60; return [v,v,v]; }); put(bump,(x,y)=>{ const v=128+(A[y*n+x]-0.5)*40; return [v,v,v]; });
    return {map:tex(map,2),rough:tex(rough,2),bump:tex(bump,2)}; };
  // fur (hair on a head, a beard): fine strands running down the surface, soft and matte
  build.fur=function(){ seed=101; const n=256, A=fbm(n,4,8), map=cv(n), rough=cv(n), bump=cv(n), col=new Float32Array(n); for(let i=0;i<n;i++) col[i]=rnd();
    put(map,(x,y)=>{ const v=222+col[x]*20-A[y*n+x]*30; return [clamp(v),clamp(v),clamp(v)]; });
    put(rough,(x,y)=>{ const v=170+col[x]*50; return [v,v,v]; }); put(bump,(x,y)=>{ const v=110+col[x]*60; return [clamp(v),clamp(v),clamp(v)]; });
    return {map:tex(map,3),rough:tex(rough,3),bump:tex(bump,3)}; };
  const get=k=>cache[k]||(cache[k]=build[k]());
  // a small painted sky for reflections: blue overhead, a bright horizon, warm earth below
  let env=null;
  function envMap(){ if(env) return env; const face=(top,mid,bot,split)=>{ const c=cv(128), g=c.getContext('2d'), gr=g.createLinearGradient(0,0,0,128);
      if(split){ gr.addColorStop(0,top); gr.addColorStop(0.48,mid); gr.addColorStop(0.52,'#8a8a6a'); gr.addColorStop(1,bot); } else { gr.addColorStop(0,top); gr.addColorStop(1,top); }
      g.fillStyle=gr; g.fillRect(0,0,128,128); if(split){ g.fillStyle='rgba(255,255,255,0.35)'; for(let i=0;i<6;i++){ g.beginPath(); g.ellipse(Math.random()*128,20+Math.random()*30,18+Math.random()*20,6,0,0,7); g.fill(); } } return c; };
    const side=()=>face('#6e9fd8','#e6eef2','#4e5a40',true);
    env=new THREE.CubeTexture([side(),side(),face('#8fb8e6'),face('#4a503c'),side(),side()]); env.needsUpdate=true; return env; }
  const KIND={ steel:{metalness:0.82,roughness:0.46,bump:0.005,env:0.8}, gold:{metalness:1.0,roughness:0.32,bump:0.003,env:1.1}, cloth:{metalness:0,roughness:0.95,bump:0.01,env:0.25},
    leather:{metalness:0,roughness:0.75,bump:0.012,env:0.35}, mail:{metalness:0.85,roughness:0.6,bump:0.02,env:0.8}, hair:{metalness:0,roughness:0.55,bump:0.006,env:0.4}, dark:{metalness:0.8,roughness:0.5,bump:0.004,env:0.7}, skin:{metalness:0,roughness:0.62,bump:0.002,env:0.2}, fur:{metalness:0,roughness:0.75,bump:0.002,env:0.2} };
  function mat(kind,color,o){ const T=get(kind), K=KIND[kind];
    return new THREE.MeshStandardMaterial(Object.assign({color,map:T.map,roughnessMap:T.rough,bumpMap:T.bump,bumpScale:K.bump,metalness:K.metalness,roughness:K.roughness,envMap:envMap(),envMapIntensity:K.env},o||{})); }
  return { mat, envMap };
})();
