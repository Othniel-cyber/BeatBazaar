const C='beatbazaar-v4',A='beatbazaar-audio',X='beatbazaar-api'
const S=['/','/index.html','/css/style.css','/js/app.js','/js/db.js','/manifest.json','/icons/icon-192.svg']

self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(S)).then(()=>self.skipWaiting()))})
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(k=>Promise.all(k.filter(k=>k!==C&&k!==A&&k!==X).map(k=>caches.delete(k)))),self.clients.claim()]))})

self.addEventListener('fetch',e=>{
  const u=e.request.url
  if(e.request.destination==='audio'||e.request.url.match(/\.(mp3|m4a|aac|ogg|wav|m4r|flac)(\?|$)/i)||e.request.url.includes('audio')||e.request.url.includes('preview')||e.request.url.includes('media')) {
    e.respondWith(cacheAudio(e.request));return
  }
  if(u.includes('deezer.com')||u.includes('itunes.apple.com')||u.includes('allorigins')||u.includes('corsproxy')||u.includes('codetabs')) {
    e.respondWith(networkCache(e.request));return
  }
  if(e.request.mode==='navigate'||S.includes(new URL(u).pathname)){e.respondWith(cacheFirst(e.request));return}
  e.respondWith(networkFirst(e.request))
})

async function cacheAudio(req){
  try{
    const res=await fetch(req)
    if(res.ok&&res.headers.get('content-type')?.startsWith('audio/')){
      const c=await caches.open(A);c.put(req,res.clone())
    }
    return res
  }catch{
    const cached=await caches.match(req)
    if(cached)return cached
    const all=await caches.open(A);const keys=await all.keys()
    for(const k of keys){
      if(k.url===req.url||decodeURIComponent(k.url).includes(encodeURIComponent(req.url).split('?')[0])){
        const r=await all.match(k);if(r)return r
      }
    }
    return new Response('',{status:404})
  }
}

async function networkCache(req){try{const res=await fetch(req);const c=await caches.open(X);c.put(req,res.clone());return res}catch{const c=await caches.match(req);return c||new Response(JSON.stringify({data:[],results:[]}),{headers:{'Content-Type':'application/json'}})}}
async function cacheFirst(req){const c=await caches.match(req);return c||fetch(req)}
async function networkFirst(req){try{return await fetch(req)}catch{const c=await caches.match(req);return c||new Response('',{status:404})}}