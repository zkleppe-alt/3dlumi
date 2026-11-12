// ════════════════════════════════════════════════════════════════
//  POST (V135) — the finishing pass for the High and Ultra graphics tiers (hud.js decides the tier):
//   · the scene is drawn into a multisampled target (WebGL2), so the edges stay clean through the effects
//   · BLOOM: only what truly shines — lamps, flames, the Sunfall sun, glowing glass — gets a soft halo
//   · the GRADE: a little more contrast and colour, a warm lift, and a gentle vignette, so the frame reads as a painting
//     rather than a screen of flat colour
//  Low and Medium draw straight to the screen as before. window.KLK_POST = { on, enable(b,{bloom}), render(scene,cam), resize }
// ════════════════════════════════════════════════════════════════
const POST=(function(){
  let R=null, comp=null, rp=null, bloom=null, grade=null, on=false, want=false, opts={bloom:0.42};
  const Grade={ uniforms:{tDiffuse:{value:null},uVig:{value:0.24},uSat:{value:1.12},uCon:{value:1.06},uWarm:{value:0.018},uExp:{value:1.04}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:`uniform sampler2D tDiffuse; uniform float uVig,uSat,uCon,uWarm,uExp; varying vec2 vUv;
      void main(){ vec4 c=texture2D(tDiffuse,vUv); vec3 col=c.rgb*uExp; float l=dot(col,vec3(0.2126,0.7152,0.0722)); col=mix(vec3(l),col,uSat);
        col=(col-0.5)*uCon+0.5; col+=vec3(uWarm,uWarm*0.35,-uWarm*0.6)*(1.0-l); vec2 d=vUv-0.5; col*=1.0-uVig*dot(d,d)*1.6; gl_FragColor=vec4(clamp(col,0.0,1.0),1.0); }`};
  function build(){ if(comp||!R||typeof THREE.EffectComposer==='undefined') return !!comp;
    const w=innerWidth, h=innerHeight, pr=R.getPixelRatio(); let rt;
    if(R.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget){ rt=new THREE.WebGLMultisampleRenderTarget(w*pr,h*pr,{format:THREE.RGBAFormat}); rt.samples=4; }
    comp=new THREE.EffectComposer(R,rt); comp.setPixelRatio(pr); comp.setSize(w,h);
    rp=new THREE.RenderPass(new THREE.Scene(),new THREE.PerspectiveCamera()); comp.addPass(rp);
    bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w,h),opts.bloom,0.55,0.8); comp.addPass(bloom);
    grade=new THREE.ShaderPass(Grade); comp.addPass(grade); return true; }
  function enable(b,o){ want=!!b; if(o) Object.assign(opts,o); if(want&&!build()){ on=false; return; } on=want; if(bloom) bloom.strength=opts.bloom; }
  function render(scene,cam){ if(rp.scene!==scene) rp.scene=scene; rp.camera=cam;
    /* by day only the brightest things glow (the sun, flames); as night falls the lamps and windows bloom more */
    const n=(typeof DAYNIGHT!=='undefined'&&DAYNIGHT.state)?(DAYNIGHT.state().night||0):0; bloom.threshold=0.86-0.32*n; bloom.strength=opts.bloom*(0.55+1.0*n);
    comp.render(); }
  function resize(w,h){ if(!comp) return; comp.setPixelRatio(R.getPixelRatio()); comp.setSize(w,h); }
  const api={ get on(){ return on&&!!comp; }, enable, render, resize, attach(r){ R=r; if(want) enable(true); } };
  window.KLK_POST=api; return api;
})();
