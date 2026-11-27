// Kingdom's Last Knight — offline play (V229). Everything the game loads from its own site (three.js, the models, the music,
// the icons) is kept in a cache that outlives updates and refreshed quietly in the background, so a new version never
// re-downloads the 80MB of models. Fonts from Google are kept too once fetched.
// The page: in a browser tab it's fetched fresh whenever you're online (so updates arrive) and kept for offline.
// V282: installed as an app (the page tells us: {pin:true}), the kept page is used until you choose to update ({update:true}),
// like the desktop launcher — the page shows "Update available" when the site has a newer version.
const PAGE='lk-page', ASSETS='lk-assets', FLAGS='lk-flags';
const pinned=async()=>!!(await caches.match('pinned',{cacheName:FLAGS}));
async function refreshPage(){ const res=await fetch('index.html',{cache:'no-store'}); if(!res.ok) throw new Error(res.status); const c=await caches.open(PAGE); await c.put('index.html',res.clone()); await c.put('./',res); }
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(PAGE).then(async c=>{ if(await c.match('index.html')) return; await c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png']).catch(()=>{}); })); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==PAGE&&k!==ASSETS&&k!==FLAGS) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('message',e=>{ const d=e.data||{};
  if(d.pin) e.waitUntil(caches.open(FLAGS).then(c=>c.put('pinned',new Response('1'))));
  if(d.update) e.waitUntil(refreshPage().then(()=>e.source&&e.source.postMessage({updated:true})).catch(()=>e.source&&e.source.postMessage({updated:false}))); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  const same=u.origin===self.location.origin, font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname), cdn=/cdnjs\.cloudflare\.com$/.test(u.hostname);
  if(!same&&!font&&!cdn) return;
  if(same&&/\/launcher\//.test(u.pathname)) return;   // the release feed: always the network
  if(same&&/\.html$/.test(u.pathname)&&!/\/index\.html$/.test(u.pathname)){   // other pages (download.html): network first, never the game's kept page
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(ASSETS).then(c=>c.put(r,cp)); } return res; }).catch(()=>caches.match(r))); return; }
  if(r.mode==='navigate'||(same&&/\/(index\.html)?$/.test(u.pathname))){
    e.respondWith((async()=>{ const kept=await caches.match('index.html',{cacheName:PAGE});
      if(kept&&await pinned()) return kept;   // installed: the version you have, until you update
      try{ const res=await fetch(r); if(res.ok){ const cp=res.clone(); caches.open(PAGE).then(c=>c.put('index.html',cp)); } return res; }   // a tab: network first, the kept copy when offline
      catch(err){ return kept||caches.match(r); } })()); return; }
  e.respondWith(caches.open(ASSETS).then(async c=>{ const hit=await c.match(r); const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>hit);
    if(hit){ e.waitUntil(net.catch(()=>{})); return hit; } return net; })); });
