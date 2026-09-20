const CACHE="controle-saude-v9";
const CORE=["./","./index.html","./style.css","./app.js?v=9","./manifest.json","./icon.svg"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  // Always try the network first for the app shell so GitHub Pages updates are picked up.
  if(url.origin===self.location.origin && (url.pathname.endsWith("/") || /\.(html|js|css)$/.test(url.pathname))){
    event.respondWith(fetch(req,{cache:"no-store"}).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(req)));
    return;
  }
  event.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
