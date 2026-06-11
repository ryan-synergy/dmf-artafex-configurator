const CACHE='dmf-fieldtool-v4';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='cacheUrls'){e.waitUntil(caches.open(CACHE).then(c=>Promise.all(e.data.urls.map(u=>c.add(u).catch(()=>{})))));}});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ e.respondWith(fetch(req).catch(()=>caches.match('index.html'))); return; }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;}).catch(()=>caches.match('index.html'))));
});
