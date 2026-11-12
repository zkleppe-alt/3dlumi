// ════════════════════════════════════════════════════════════════
//  SKIN (V177) — a hide for every sculpted thing: each vertex knows what it is (attribute 'skin', baked by
//  tools/sculpt_demons.py) and the shader grows that surface on it in 3D, no textures needed:
//   0 hide — wrinkled, pored, leathery      4 cloth — a coarse weave, a little worn
//   1 scales — overlapping cells, a ridge   5 stone/obsidian — cracked plates, rough between
//   2 bark — deep grain run lengthwise      6 bone/horn — growth rings, fine pits
//   3 metal — hammered plate, scratches     7 smoke/spirit — soft roiling, a little lit
//   8 fur — short and soft (V181)          9 feathers — rows of rounded tips (V181)
//  The relief bends the light (a bump from the pattern's own slopes) and darkens the creases; metal and scale catch a
//  hard highlight. HIDE.apply(material, scale) — scale: how many pattern-units per model-unit (bosses ~1, demons ~1.8).
// ════════════════════════════════════════════════════════════════
const HIDE=(function(){
  const GLSL=`
varying float vSkin; varying vec3 vOP;
float skH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float skN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(skH(i),skH(i+vec3(1,0,0)),f.x),mix(skH(i+vec3(0,1,0)),skH(i+vec3(1,1,0)),f.x),f.y),mix(mix(skH(i+vec3(0,0,1)),skH(i+vec3(1,0,1)),f.x),mix(skH(i+vec3(0,1,1)),skH(i+vec3(1,1,1)),f.x),f.y),f.z); }
float skF(vec3 p){ return skN(p)*0.5+skN(p*2.03)*0.25+skN(p*4.01)*0.125+skN(p*8.07)*0.0625; }
vec2 skV(vec3 p){ vec3 i=floor(p), f=fract(p); float d1=8.0, d2=8.0;
  for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec3 g=vec3(float(x),float(y),float(z)); vec3 o=vec3(skH(i+g),skH(i+g+11.3),skH(i+g+27.1)); float d=length(g+o-f); if(d<d1){ d2=d1; d1=d; } else if(d<d2) d2=d; }
  return vec2(d1,d2); }
uniform float uSkinScale, uSkinAmt;
float skinHeight(float k, vec3 p){ p*=uSkinScale;
  if(k<0.5){ float w=1.0-abs(skN(p*vec3(3.0,8.0,3.0))*2.0-1.0); return w*0.6+skF(p*7.0)*0.32+skN(p*22.0)*0.08; }
  if(k<1.5){ vec2 v=skV(p*vec3(7.0,9.0,7.0)); return smoothstep(0.0,0.2,v.y-v.x)*0.75+(1.0-v.x)*0.25; }
  if(k<2.5){ float g=abs(skN(vec3(p.x*9.0,p.y*1.4,p.z*9.0))*2.0-1.0); return g*0.72+skF(p*9.0)*0.28; }
  if(k<3.5){ return skN(p*7.0)*0.5+skF(p*2.5)*0.4+skN(vec3(p.x*36.0,p.y*3.0,p.z*36.0))*0.1; }
  if(k<4.5){ float fold=1.0-abs(skN(vec3(p.x*5.0,p.y*0.7,p.z*5.0))*2.0-1.0); float a=sin((p.x+p.z)*110.0)*sin(p.y*110.0); return fold*0.8+skF(p*3.0)*0.2+a*0.0; }
  if(k<5.5){ vec2 v=skV(p*3.4); return smoothstep(0.0,0.09,v.y-v.x)*0.65+skF(p*8.0)*0.35; }
  if(k<6.5){ return (sin(p.y*34.0+skN(p*3.0)*5.0)*0.5+0.5)*0.6+skN(p*18.0)*0.4; }
  if(k<7.5) return skF(p*5.0);
  if(k<8.5){ return skN(vec3(p.x*30.0,p.y*6.0,p.z*30.0))*0.55+skF(p*6.0)*0.45; }   /* 8 fur: short, soft, lying downward */
  { vec3 q=p*vec3(9.0,11.0,9.0); q.x+=floor(q.y)*0.5; vec2 f=fract(q.xy)-vec2(0.5,0.0); float d=length(f*vec2(1.0,0.9)); return smoothstep(0.62,0.3,d)*0.7+skN(p*20.0)*0.3; } }   /* 9 feathers: rows of rounded tips, each overlapping the next */
`;
  function apply(m,scale,amt){ if(!m||m.userData.skin) return m; m.userData.skin=true; const U={uSkinScale:{value:scale||1},uSkinAmt:{value:amt==null?1:amt}};   /* amt: how deep the relief reads (1 a boss; ~0.4 a gentle creature) */
    m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
      sh.vertexShader='attribute float skin;\nvarying float vSkin; varying vec3 vOP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSkin=skin; vOP=position;');
      sh.fragmentShader=GLSL+sh.fragmentShader
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          float skK=floor(vSkin+0.5), skh=skinHeight(skK,vOP);
          float skAmt = (skK<0.5?0.9: skK<1.5?1.1: skK<2.5?1.4: skK<3.5?0.35: skK<4.5?0.7: skK<5.5?1.2: skK<6.5?0.55: skK<7.5?0.0: skK<8.5?0.3: 0.3)*uSkinAmt;
          { vec3 sp=-vViewPosition, sx=dFdx(sp), sy=dFdy(sp), R1=cross(sy,normal), R2=cross(normal,sx); float det=dot(sx,R1); vec2 dh=clamp(vec2(dFdx(skh),dFdy(skh)),-0.25,0.25)*skAmt*0.22;
            normal=normalize(abs(det)*normal-sign(det)*(dh.x*R1+dh.y*R2)); }`)
        .replace('#include <color_fragment>',`#include <color_fragment>
          { float k=floor(vSkin+0.5), h=skinHeight(k,vOP); float cav = k<2.5? mix(0.7,1.12,h) : k<3.5? mix(0.88,1.08,h) : k<4.5? mix(0.8,1.08,h) : k<5.5? mix(0.62,1.1,h) : k<6.5? mix(0.86,1.08,h) : k<7.5? (0.8+0.4*h) : k<8.5? mix(0.9,1.05,h) : mix(0.9,1.04,h);
            diffuseColor.rgb*=mix(1.0,cav,uSkinAmt); }`)
        .replace('#include <lights_phong_fragment>',`#include <lights_phong_fragment>
          { float k=floor(vSkin+0.5); if(k>2.5&&k<3.5){ material.specularStrength*=1.8; material.specularShininess=max(material.specularShininess,60.0); } else if(k>0.5&&k<1.5) material.specularStrength*=1.3; else if(k>3.5&&k<4.5) material.specularStrength*=0.25; else if(k<0.5||(k>1.5&&k<2.5)) material.specularStrength*=0.55; }`);
    };
    m.customProgramCacheKey=()=>'skin'+(scale||1); m.needsUpdate=true; return m; }
  // the 'skin' attribute from a sculpt's packed bytes
  function attr(g,b64){ if(!b64) return; const s=atob(b64), a=new Float32Array(s.length); for(let i=0;i<s.length;i++) a[i]=s.charCodeAt(i); g.setAttribute('skin',new THREE.BufferAttribute(a,1)); }
  return {apply,attr};
})();
