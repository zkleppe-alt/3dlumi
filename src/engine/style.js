// ════════════════════════════════════════════════════════════════
//  ART STYLE — "classic" (the look so far: flat facets, ink lines) or "painted": soft cel-shading in two gentle
//  bands with a warm rim of light on the sunward edge, a cool blue shade side, a gradient sky with drifting clouds,
//  blue distance haze, fields of wind-blown grass, and round, soft-shaded canopies. Off unless chosen
//  (?art=painted, localStorage klk3d_art, or window.KLK_ART), so the game looks exactly as before by default.
// ════════════════════════════════════════════════════════════════
const ART=(function(){
  let mode='painted'; try{ mode=window.KLK_ART||new URLSearchParams(location.search).get('art')||localStorage.getItem('klk3d_art')||'painted'; }catch(e){}   /* V209: painted is the game's look now; ☰ → System switches back to classic */
  const on=mode==='painted', T={value:0};
  if(!on) return { on, mode, set(m){ try{ localStorage.setItem('klk3d_art',m); }catch(e){} location.reload(); } };

  // ── shading: every lit material in the game goes through these chunks, so the whole world changes at once ──
  const SC=THREE.ShaderChunk;
  // V208: the painted look, second pass — after Breath of the Wild's soft cel bands and a hand-painted picture-book wash:
  //  every surface carries a broad watercolour drift of warm and cool and faint brush strokes laid in world space (vArtW),
  //  the shade side goes blue-violet instead of grey, the lit side warm, and the greens lean to sunlit meadow.
  SC.common+=`
varying vec3 vArtW;
float artRamp(float x){ return 0.58*smoothstep(-0.02,0.05,x)+0.42*smoothstep(0.40,0.48,x); }
float artH(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float artN(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(artH(i),artH(i+vec2(1,0)),f.x),mix(artH(i+vec2(0,1)),artH(i+vec2(1,1)),f.x),f.y); }
vec3 artGrade(vec3 c){ vec2 q=vArtW.xz+vArtW.y*vec2(0.37,0.61);
  float w=(artN(q*0.21)+0.5*artN(q*0.63+4.0))/1.5-0.5, st=artN(vec2(dot(q,vec2(0.8,0.6))*0.8,dot(q,vec2(-0.6,0.8))*5.0))-0.5;
  float l=dot(c,vec3(0.299,0.587,0.114)); c*=1.0+w*0.16+st*0.055; c+=vec3(0.05,0.018,-0.045)*w*l*1.6;       // the wash: lighter and warmer here, deeper and cooler there
  c=mix(vec3(l),c,1.02); c=c*0.95+0.03;
  float gx=max(0.0,c.g-max(c.r,c.b)); c.r+=gx*0.3; c.b-=gx*0.1; c.g-=gx*0.22;                                   // greens toward a sunlit meadow, not neon
  c+=vec3(-0.012,0.006,0.05)*(1.0-smoothstep(0.0,0.42,l)); c*=mix(vec3(1.0),vec3(1.05,1.02,0.955),smoothstep(0.45,0.9,l)); return c; }  // blue-violet shade, warm light
`;
  SC.project_vertex+=`
{ vec4 artw=vec4(transformed,1.0);
#ifdef USE_INSTANCING
  artw=instanceMatrix*artw;
#endif
  vArtW=(modelMatrix*artw).xyz; }
`;
  SC.lights_phong_pars_fragment=SC.lights_phong_pars_fragment.split('float dotNL = saturate( dot( geometry.normal, directLight.direction ) );').join('float dotNL = artRamp( dot( geometry.normal, directLight.direction ) );');
  SC.lights_lambert_vertex=SC.lights_lambert_vertex.split('vLightFront += saturate( dotNL ) * directLightColor_Diffuse;').join('vLightFront += artRamp( dotNL ) * directLightColor_Diffuse;');
  SC.envmap_fragment=`#ifdef PHONG
  { float rim=1.0-saturate(dot(normal,normalize(vViewPosition))); outgoingLight+=mix(diffuseColor.rgb,vec3(1.0,0.96,0.86),0.5)*0.32*smoothstep(0.7,0.95,rim)*(1.0-0.75*max(normal.y,0.0)); }   /* the sunlit edge of a silhouette, not the top of every head */
#endif
#if defined(PHONG)||defined(LAMBERT)
  outgoingLight=artGrade(outgoingLight);
#endif
`+SC.envmap_fragment;

  // ── soft canopies: clumps shaded as one round mass (normals from the clump's heart), so a tree reads like cotton, not facets ──
  function mergeSoft(parts){ const pos=[],nor=[],col=[],c=new THREE.Color(), v=new THREE.Vector3();
    parts.forEach(([g,h,sh,ctr,soft])=>{ g.computeVertexNormals(); g=g.index?g.toNonIndexed():g; c.setHex(h); const p=g.attributes.position.array, n=g.attributes.normal.array;
      let y0=1e9,y1=-1e9; for(let i=1;i<p.length;i+=3){ y0=Math.min(y0,p[i]); y1=Math.max(y1,p[i]); }
      for(let i=0;i<p.length;i+=3){ pos.push(p[i],p[i+1],p[i+2]);
        if(ctr){ v.set(p[i]-ctr[0],(p[i+1]-ctr[1])*0.8,p[i+2]-ctr[2]).normalize(); const s=soft===undefined?0.8:soft; v.multiplyScalar(s).add(new THREE.Vector3(n[i],n[i+1],n[i+2]).multiplyScalar(1-s)).normalize(); nor.push(v.x,v.y,v.z); } else nor.push(n[i],n[i+1],n[i+2]);
        const k=sh?1-sh*(1-(p[i+1]-y0)/Math.max(1e-3,y1-y0)):1; col.push(c.r*k,c.g*k,c.b*k); } });
    const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); o.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return o; }
  const blob=(r,x,y,z,d)=>{ const g=new THREE.IcosahedronGeometry(r,d===undefined?2:d); g.translate(x,y,z); return g; };
  if(typeof TREE_GEO!=='undefined'&&!(typeof LOOK2!=='undefined'&&LOOK2)){   /* V208: the new look's own trees are finer than these */
    TREE_GEO.oak=()=>{ const C=[0,1.95,0], P=[[0.66,0,1.85,0],[0.5,0.48,1.72,0.14],[0.5,-0.46,1.76,-0.12],[0.46,0.1,1.8,0.48],[0.44,-0.12,1.82,-0.46],[0.46,0.16,2.3,-0.06],[0.36,-0.3,2.18,0.24],[0.34,0.38,2.12,-0.3]];
      return mergeSoft([[new THREE.CylinderGeometry(0.1,0.2,1.2,8).translate(0,0.6,0),0x6a4426,0.35],[new THREE.CylinderGeometry(0.04,0.08,0.62,6).rotateZ(-0.6).translate(0.18,1.28,0),0x6a4426],[new THREE.CylinderGeometry(0.04,0.07,0.56,6).rotateZ(0.7).translate(-0.16,1.32,0.05),0x6a4426]]
        .concat(P.map(([r,x,y,z],i)=>[blob(r,x,y,z),[0x4f9a3e,0x58a443,0x4a9038,0x5aa846,0x4c943c,0x66b24c,0x55a042,0x5ca846][i],0.42,C,0.85]))); };
    TREE_GEO.pine=()=>mergeSoft([[new THREE.CylinderGeometry(0.08,0.14,1.0,8).translate(0,0.5,0),0x5e3c22,0.3],
      [new THREE.ConeGeometry(0.72,1.05,12).translate(0,1.15,0),0x2f6d3c,0.45,[0,1.4,0],0.35],[new THREE.ConeGeometry(0.6,0.95,12).translate(0,1.6,0),0x34773f,0.42,[0,1.85,0],0.35],
      [new THREE.ConeGeometry(0.46,0.85,11).translate(0,2.05,0),0x3b8247,0.4,[0,2.25,0],0.35],[new THREE.ConeGeometry(0.3,0.7,10).translate(0,2.5,0),0x45904e,0.35,[0,2.65,0],0.35]]);
    TREE_GEO.bush=()=>mergeSoft([[blob(0.44,0,0.34,0),0x4c9842,0.45,[0,0.3,0],0.85],[blob(0.3,0.26,0.3,-0.1),0x55a248,0.45,[0,0.3,0],0.85],[blob(0.26,-0.22,0.28,0.14),0x4a9040,0.45,[0,0.3,0],0.85],
      [blob(0.06,0.2,0.58,0.25,1),0xe0503a],[blob(0.06,-0.22,0.48,0.24,1),0xf0d04a],[blob(0.05,0.05,0.7,-0.1,1),0xe0503a]]);
  }

  // ── grass: tufts of tapered blades, root dark and tip sunlit, swaying together in one wind ──
  const BLADE=(()=>{ const pos=[],col=[],nor=[]; for(let b=0;b<5;b++){ const a=b/5*Math.PI*2+b*1.3, r=0.05+(b%3)*0.05, h=0.17+((b*37)%10)/10*0.13, w=0.026, lean=0.07+(b%2)*0.05, ox=Math.cos(a)*r, oz=Math.sin(a)*r, ca=Math.cos(a+1.57), sa=Math.sin(a+1.57);
      const seg=3, pt=i=>{ const t=i/seg, ww=w*(1-t*0.92); return [ox+Math.cos(a)*lean*t*t, h*t, oz+Math.sin(a)*lean*t*t, ww]; };
      for(let i=0;i<seg;i++){ const [x0,y0,z0,w0]=pt(i), [x1,y1,z1,w1]=pt(i+1), q=[[x0-ca*w0,y0,z0-sa*w0],[x0+ca*w0,y0,z0+sa*w0],[x1+ca*w1,y1,z1+sa*w1],[x1-ca*w1,y1,z1-sa*w1]];
        [[0,1,2],[0,2,3],[0,2,1],[0,3,2]].forEach(tri=>tri.forEach(k=>{ pos.push(...q[k]); const t=q[k][1]/h; col.push(0.62+0.38*t,0.7+0.3*t,0.55+0.25*t); nor.push(0,1,0); })); } }   // both faces wound, so each side takes the light from above
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); return g; })();
  const grassMat=new THREE.MeshLambertMaterial({vertexColors:true});
  grassMat.onBeforeCompile=sh=>{ sh.uniforms.uT=T; sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>',`#include <begin_vertex>
    { vec4 wp=instanceMatrix*vec4(0.,0.,0.,1.); float h=position.y, gust=sin(uT*0.9+wp.x*0.11+wp.z*0.07)*0.5+0.5;
      float w=(sin(uT*1.9+wp.x*0.42+wp.z*0.31)*0.55+sin(uT*3.3+wp.x*1.1-wp.z*0.7)*0.18)*(0.35+gust*0.9);
      vec3 dir=inverse(mat3(instanceMatrix))*vec3(0.8,0.0,0.45); transformed+=dir*w*h*h*0.9; transformed.y-=abs(w)*h*h*0.12;
      #ifdef USE_COLOR
      float wave=smoothstep(0.55,1.0,sin(uT*0.7+wp.x*0.16+wp.z*0.1)*0.5+0.5); vColor.rgb*=1.0+wave*0.3*clamp(h*4.0,0.0,1.0);   /* the wind runs over the field in pale waves */
      #endif
    }`); };
  grassMat.customProgramCacheKey=()=>'artgrass';
  function grassField(lv){ if(!lv.T||!lv.ground||lv.id!=='world') return null; const MAX=9000, im=new THREE.InstancedMesh(BLADE,grassMat,MAX); im.frustumCulled=false; im.receiveShadow=true;
    im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(MAX*3),3); im.count=0;
    const m=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), p=new THREE.Vector3(), c=new THREE.Color(), up=new THREE.Vector3(0,1,0); let cx=-1e9, cz=-1e9;
    const h=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); };
    const TOWNS=(typeof SYS!=='undefined'&&SYS.MAP&&SYS.MAP.towns)||[];
    const build=(px,pz)=>{ cx=px; cz=pz; let n=0; const R=24;
      for(let y=Math.floor(pz-R);y<=pz+R;y++) for(let x=Math.floor(px-R);x<=px+R;x++){ if((x-px)*(x-px)+(y-pz)*(y-pz)>R*R) continue; const tt=lv.T(x,y); if(tt!==0&&tt!==4&&tt!==18) continue; let gr=0.55,gg=0.7,gb=0.3; if(lv.grassOf){ c.setHex(lv.grassOf(x,y)); if(tt!==18&&!(c.g>c.r*1.06&&c.g>c.b*1.06)) continue; if(tt!==18){ gr=c.r; gg=c.g; gb=c.b; } else { gr=0.42; gg=0.62; gb=0.3; } } const lawn=tt===18||TOWNS.some(t=>Math.abs(t[1]-x)<11&&Math.abs(t[2]-y)<10);   // kept short in town, long in the wild
        for(let k=0;k<5&&n<MAX;k++){ const fx=x+h(x+k*0.37,y)*0.98, fz=y+h(y-k*0.71,x)*0.98, gy=lv.ground(fx,fz); if(!(gy>-0.5)) continue;
          q.setFromAxisAngle(up,h(fx,fz)*6.28); const sc=(lawn?0.6:0.95)+h(fz,fx)*(lawn?0.25:0.5); s.set(sc,sc*(0.8+h(x*3,y)*0.45),sc); p.set(fx,gy-0.02,fz); m.compose(p,q,s); im.setMatrixAt(n,m);
          const kv=1.02+h(x+k,y*2)*0.22; c.setRGB(Math.min(1,gr*kv+0.03),Math.min(1,gg*kv+0.04),gb*kv*0.95); im.setColorAt(n,c); n++; } }
      im.count=n; im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; };
    im.userData.update=()=>{ const v=window.__view, P=ENGINE.P, tx=v?v.l[0]:P.x, tz=v?v.l[2]:P.z; if(Math.hypot(tx-cx,tz-cz)>6) build(tx,tz); };
    return im; }

  // ── the sky: a dome that fades from deep blue overhead to a pale, warm horizon, with soft clouds drifting across it ──
  const skyMat=new THREE.ShaderMaterial({ side:THREE.BackSide, depthWrite:false, fog:false,
    uniforms:{ uTop:{value:new THREE.Color()}, uHor:{value:new THREE.Color()}, uT:T, uDay:{value:1}, uSun:{value:new THREE.Vector3(0.3,0.8,0.3)}, uMoon:{value:new THREE.Vector3(-0.3,0.6,0.3)}, uNight:{value:0}, uDusk:{value:0} },
    vertexShader:`varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position.z=gl_Position.w*0.9999; }`,
    fragmentShader:`uniform vec3 uTop; uniform vec3 uHor; uniform float uT; uniform float uDay; uniform vec3 uSun; uniform vec3 uMoon; uniform float uNight; uniform float uDusk; varying vec3 vD;
      float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float ns(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*ns(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return s; }
      void main(){ vec3 d=normalize(vD); float h=d.y; vec3 col=mix(uHor,uTop,pow(clamp(h,0.0,1.0),0.55));
        float sd=max(dot(d,normalize(uSun)),0.0), md=max(dot(d,normalize(uMoon)),0.0);
        col+=vec3(1.0,0.55,0.3)*pow(sd,6.0)*uDusk*0.55*smoothstep(-0.1,0.25,1.0-h);            // the glow of dawn and dusk, low toward the sun
        if(uNight>0.01){ vec3 q=floor(d*260.0); float s=hs(q.xy+q.z*7.13); float tw=0.6+0.4*sin(uT*2.0+s*40.0);
          col+=vec3(0.9,0.93,1.0)*step(0.9965,s)*smoothstep(0.02,0.25,h)*uNight*tw;                      // the stars
          col+=vec3(0.85,0.9,1.0)*(smoothstep(0.9993,0.9997,md)*0.9+pow(md,90.0)*0.25)*uNight; }       // the moon, and its halo
        col+=vec3(1.0,0.95,0.82)*(smoothstep(0.9990,0.9995,sd)*1.2+pow(sd,200.0)*0.5)*(1.0-uNight)*step(-0.02,uSun.y);   // the sun
        if(h>0.0){ vec2 uv=d.xz/(h+0.2)*0.85+vec2(uT*0.006,uT*0.002), sd2=normalize(uSun.xz+vec2(1e-4))*0.1;                 // great heaped clouds, lit on the side toward the sun
          float n=fbm(uv)+0.22*fbm(uv*3.1+2.0)-0.1, n2=fbm(uv+sd2)+0.22*fbm((uv+sd2)*3.1+2.0)-0.1;
          float cov=smoothstep(0.5,0.555,n)*smoothstep(0.0,0.12,h), lit=smoothstep(-0.03,0.05,n-n2), core=smoothstep(0.56,0.78,n);
          vec3 shd=mix(uHor,vec3(0.6,0.68,0.88),0.65), wht=vec3(1.0,0.985,0.95)+vec3(1.0,0.5,0.25)*uDusk*0.25;
          vec3 cc=mix(shd,wht,clamp(0.3+0.7*lit-core*0.3*(1.0-lit),0.0,1.0))*mix(0.3,1.0,uDay); col=mix(col,cc,cov*0.96); }
        gl_FragColor=vec4(col,1.0); }` });
  if(typeof DAYNIGHT!=='undefined') DAYNIGHT.bindSky(skyMat.uniforms);
  function skyDome(lv){ const m=new THREE.Mesh(new THREE.SphereGeometry(290,32,16),skyMat); m.renderOrder=-9.5; m.frustumCulled=false;
    const top=new THREE.Color(), hor=new THREE.Color(), white=new THREE.Color(0xfff6e6), deep=new THREE.Color(0x2f6fd0);
    m.onBeforeRender=(r,sc,cam)=>{ m.position.copy(cam.position); const bg=sc.background; if(!bg||!bg.isColor) return; const l=bg.r*0.3+bg.g*0.59+bg.b*0.11;
      skyMat.uniforms.uDay.value=Math.min(1,l*1.6); hor.copy(bg).lerp(white,0.38*Math.min(1,l*1.5)); top.copy(bg).lerp(deep,0.45*Math.min(1,l*1.4)).multiplyScalar(0.92);
      skyMat.uniforms.uHor.value.copy(hor); skyMat.uniforms.uTop.value.copy(top); if(sc.fog) sc.fog.color.copy(hor).lerp(bg,0.2); };
    return m; }

  // dress each level once: sky and haze outdoors, the lights warmed, ink lines put away (the rim light draws the edges now)
  function dress(lv){ const sc=lv.scene; if(!sc||sc.userData.art) return; sc.userData.art=true;
    const outdoor=sc.background&&sc.background.isColor&&sc.fog&&!lv.close;
    if(outdoor){ sc.add(skyDome(lv)); sc.children.forEach(o=>{ if(o.isSprite&&o.renderOrder===-9) o.visible=false; });   /* the older look's cloud cards */ if(sc.fog.isFog){ sc.fog.near=14; sc.fog.far=92; }   /* a long blue haze: near things clear, the middle distance softening, the far hills pale */ }
    sc.traverse(o=>{ if(o.isHemisphereLight){ o.color.lerp(new THREE.Color(0xcfe2ff),0.6); o.groundColor.lerp(new THREE.Color(0x7a7458),0.5); o.intensity*=1.18; }
      if(o.isDirectionalLight) o.color.lerp(new THREE.Color(0xfff0d6),0.7); });
    const gf=grassField(lv); if(gf){ sc.add(gf); lv.artGrass=gf; } }
  function sweep(){ const L=ENGINE.level; if(!L) return; dress(L); L.scene.traverse(o=>{ if((o.userData.ink||o.userData.outline)&&o.visible) o.visible=false; }); }
  let last=performance.now();
  (function loop(){ const n=performance.now(); T.value+=(n-last)/1000; last=n; try{ const L=ENGINE.level; if(L&&L.artGrass) L.artGrass.userData.update(); }catch(e){} requestAnimationFrame(loop); })();
  setInterval(()=>{ try{ sweep(); }catch(e){} },300);
  return { on, mode, set(m){ try{ localStorage.setItem('klk3d_art',m); }catch(e){} location.reload(); }, sweep, mergeSoft };
})();
