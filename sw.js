const VER='pj-ar-v1';
const CORE=['./','index.html','AR.html','cek-pj-ar.html','theme.js','backup.js','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VER).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VER).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const cdn=/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host);
  if(u.origin!==location.origin&&!cdn)return;
  if(r.mode==='navigate'||u.pathname.endsWith('.html')){
    /* halaman: ambil versi terbaru dulu, offline pakai cache */
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VER).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))));
    return;
  }
  /* file lain: cache dulu, perbarui di belakang */
  e.respondWith(caches.match(r).then(m=>{
    const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(VER).then(x=>x.put(r,c))}return res}).catch(()=>m);
    return m||net;
  }));
});
