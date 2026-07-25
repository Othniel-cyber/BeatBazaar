const CACHE = 'beatbazaar-v2'
const SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/db.js',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]
const AUDIO_CACHE = 'beatbazaar-audio'
const API_CACHE = 'beatbazaar-api'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE && k !== AUDIO_CACHE && k !== API_CACHE).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  if (e.request.url.includes('itunes.apple.com') || e.request.url.includes('aod.itunes.apple.com') || e.request.url.match(/\.m4a|\.mp3|\.m4r/)) {
    e.respondWith(cacheAudio(e.request))
    return
  }

  if (url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/') || url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(cacheFirst(e.request))
    return
  }

  e.respondWith(networkFirst(e.request))
})

async function cacheFirst(req) {
  const cached = await caches.match(req)
  return cached || fetch(req)
}

async function networkFirst(req) {
  try {
    const res = await fetch(req)
    const cache = await caches.open(API_CACHE)
    cache.put(req, res.clone())
    return res
  } catch {
    const cached = await caches.match(req)
    return cached || new Response('{"resultCount":0,"results":[]}', { headers: { 'Content-Type': 'application/json' } })
  }
}

async function cacheAudio(req) {
  try {
    const res = await fetch(req)
    const cache = await caches.open(AUDIO_CACHE)
    cache.put(req, res.clone())
    return res
  } catch {
    const cached = await caches.match(req)
    if (cached) return cached
    return new Response('', { status: 404 })
  }
}
