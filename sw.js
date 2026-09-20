const CACHE="controle-saude-v10";
self.addEventListener("install",e=>{self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 const req=event.request;if(req.method!=="GET")return;const url=new URL(req.url);
 if(url.origin===self.location.origin){
   // Never let the service worker serve stale HTML/JS/CSS. This makes GitHub Pages updates visible.
   if(url.pathname.endsWith("/")||/\.(html|js|css)$/.test(url.pathname)){event.respondWith(fetch(req,{cache:"no-store"}).then(r=>r).catch(()=>caches.match(req)));return}
 }
 event.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})))
});
