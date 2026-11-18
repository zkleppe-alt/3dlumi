// Kingdom's Last Knight — offline play (V229). The page itself is fetched fresh whenever you're online (so updates arrive) and
// kept for offline; everything else the game loads from its own site (three.js, the models, the music, the icons) is kept in a
// cache that outlives updates and refreshed quietly in the background, so a new version never re-downloads the 80MB of models.
// Fonts from Google are kept too once fetched.
const PAGE='lk-page', ASSETS='lk-assets';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(PAGE).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==PAGE&&k!==ASSETS) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  const same=u.origin===self.location.origin, font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname), cdn=/cdnjs\.cloudflare\.com$/.test(u.hostname);
  if(!same&&!font&&!cdn) return;
  if(r.mode==='navigate'||(same&&/\/(index\.html)?$/.test(u.pathname))){   // the page: network first, the kept copy when offline
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(PAGE).then(c=>c.put('index.html',cp)); } return res; }).catch(()=>caches.match('index.html',{cacheName:PAGE}).then(m=>m||caches.match(r)))); return; }
  e.respondWith(caches.open(ASSETS).then(async c=>{ const hit=await c.match(r); const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>hit);
    if(hit){ e.waitUntil(net.catch(()=>{})); return hit; } return net; })); });
