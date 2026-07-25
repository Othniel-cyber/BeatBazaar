const CODELUX_PROJECTS = [
  { name: 'CodeLux Academy', desc: 'Apprends à coder gratuitement', icon: '💻', color: '#a855f7', path: '../CodeLux-Academy/index.html' },
  { name: 'Othniel2TO', desc: 'Dactylographie - Tape plus vite !', icon: '⌨️', color: '#6c63ff', path: '../Othniel2TO/index.html' },
  { name: 'PredictX', desc: 'Pronostics football IA', icon: '⚽', color: '#10b981', path: '../PredictX/index.html' },
  { name: 'EduConnect', desc: 'Plateforme éducative connectée', icon: '📚', color: '#f59e0b', path: '../EDUCONNECT/index.html' },
  { name: 'LA MANNE DE VIE', desc: 'Église chrétienne Porto-Novo', icon: '⛪', color: '#C9A84C', path: '../EGLISE/index.html' },
]

const CONFIG = {
  proxies: [
    '',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
  ],
  itunesApi: 'https://itunes.apple.com/search',
  limit: 50,
}

const elements = {
  splash: document.getElementById('splash'),
  splashBtn: document.getElementById('splashBtn'),
  splashInstallBtn: document.getElementById('splashInstallBtn'),
  app: document.getElementById('app'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  resultsGrid: document.getElementById('resultsGrid'),
  resultsSection: document.getElementById('resultsSection'),
  resultsCount: document.getElementById('resultsCount'),
  resultsQuery: document.getElementById('resultsQuery'),
  emptyState: document.getElementById('emptyState'),
  loadingSpinner: document.getElementById('loadingSpinner'),
  offlineBanner: document.getElementById('offlineBanner'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  viewBtns: document.querySelectorAll('.view-btn'),
  nowPlayingBar: document.querySelector('.now-playing-bar'),
  navTabs: document.querySelectorAll('.nav-tab'),
  pageSearch: document.getElementById('page-search'),
  pageLibrary: document.getElementById('page-library'),
  libraryGrid: document.getElementById('libraryGrid'),
  libEmpty: document.getElementById('libEmpty'),
  libBadge: document.getElementById('libBadge'),
  libCount: document.getElementById('libCount'),
  adsTrack: document.getElementById('adsTrack'),
  toast: document.getElementById('toast'),
}

let currentQuery = ''
let currentMedia = 'all'
let currentView = 'grid'
let currentAudio = null
let currentPlayingCard = null
let allResults = []
let deferredPrompt = null
let isOnline = navigator.onLine
let downloadedIds = new Set()

window.addEventListener('online', () => { isOnline = true; updateOnlineStatus() })
window.addEventListener('offline', () => { isOnline = false; updateOnlineStatus() })

function updateOnlineStatus() {
  elements.offlineBanner.style.display = isOnline ? 'none' : 'block'
}

function showToast(msg) {
  const t = elements.toast
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(t._hide)
  t._hide = setTimeout(() => t.classList.remove('show'), 2500)
}

async function loadLibrary() {
  const songs = await getAllSongs()
  downloadedIds = new Set(songs.map(s => s.id))
  renderLibrary(songs)
}

function renderLibrary(songs) {
  const grid = elements.libraryGrid
  const empty = elements.libEmpty
  const badge = elements.libBadge
  const count = elements.libCount

  badge.textContent = songs.length

  if (songs.length === 0) {
    grid.innerHTML = ''
    grid.appendChild(empty)
    count.textContent = ''
    return
  }

  empty.remove()
  grid.innerHTML = ''
  count.textContent = `${songs.length} titre${songs.length > 1 ? 's' : ''} dans ta bibliothèque`

  songs.forEach(song => {
    const div = document.createElement('div')
    div.className = 'lib-song'
    div.innerHTML = `
      <img class="card-art" src="${song.artUrl || ''}" alt="${escapeHtml(song.title)}" onerror="this.style.display='none'" />
      <div class="card-info">
        <div class="card-title">${escapeHtml(song.title)}</div>
        <div class="card-artist">${escapeHtml(song.artist || '')}</div>
        <div class="lib-offline-badge"><i class="fas fa-check-circle"></i> Disponible hors ligne</div>
      </div>
      <div class="lib-actions">
        <button class="lib-action-btn lib-play-btn" data-id="${song.id}" data-preview="${escapeHtml(song.audioUrl)}" data-title="${escapeHtml(song.title)}" data-artist="${escapeHtml(song.artist || '')}" data-art="${escapeHtml(song.artUrl || '')}" title="Écouter"><i class="fas fa-play"></i></button>
        <button class="lib-action-btn lib-del-btn" data-id="${song.id}" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div>
    `

    div.querySelector('.lib-play-btn').addEventListener('click', (e) => {
      e.stopPropagation()
      const btn = e.currentTarget
      const previewUrl = btn.dataset.preview
      if (previewUrl) {
        const fakeBtn = { dataset: btn.dataset, querySelector: () => null, closest: () => null }
        fakeBtn.querySelector = (s) => {
          if (s === 'i') return btn.querySelector('i')
          return null
        }
        playPreview(fakeBtn)
      }
    })

    div.querySelector('.lib-del-btn').addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = e.currentTarget.dataset.id
      await removeSong(id)
      downloadedIds.delete(id)
      showToast('Titre supprimé de la bibliothèque')
      loadLibrary()
    })

    grid.appendChild(div)
  })
}

function goToLibrary() {
  elements.navTabs.forEach(t => t.classList.remove('active'))
  document.querySelector('[data-page="library"]').classList.add('active')
  elements.pageSearch.classList.remove('active')
  elements.pageLibrary.classList.add('active')
}

function showPage(page) {
  elements.navTabs.forEach(t => t.classList.remove('active'))
  document.querySelector(`[data-page="${page}"]`).classList.add('active')
  elements.pageSearch.classList.toggle('active', page === 'search')
  elements.pageLibrary.classList.toggle('active', page === 'library')
  if (page === 'library') loadLibrary()
}

elements.navTabs.forEach(tab => {
  tab.addEventListener('click', () => showPage(tab.dataset.page))
})

async function searchMusic(query, media) {
  if (!query.trim()) return

  currentQuery = query.trim()
  currentMedia = media

  elements.resultsGrid.innerHTML = ''
  elements.emptyState.style.display = 'none'

  if (!isOnline) {
    elements.loadingSpinner.style.display = 'none'
    const local = await searchLocalSongs(query)
    if (local.length > 0) {
      showEmpty(`Recherche hors ligne : ${local.length} titre(s) trouvé(s) dans ta bibliothèque`)
      elements.resultsGrid.innerHTML = ''
      local.forEach(s => elements.resultsGrid.appendChild(createLocalCard(s)))
      elements.resultsCount.textContent = local.length
      elements.resultsQuery.textContent = query
    } else {
      showEmpty('Hors ligne. Aucun titre trouvé dans ta bibliothèque.')
    }
    return
  }

  elements.loadingSpinner.style.display = 'block'

  const term = encodeURIComponent(query.trim())
  const searchUrl = `${CONFIG.itunesApi}?term=${term}&media=music&entity=song,album,musicArtist&limit=${CONFIG.limit}`

  let data = null

  for (const proxy of CONFIG.proxies) {
    const url = proxy ? proxy + encodeURIComponent(searchUrl) : searchUrl
    data = await tryFetch(url)
    if (data && data.results) break
    if (typeof data === 'string') {
      try { data = JSON.parse(data); if (data && data.results) break } catch {}
    }
  }

  elements.loadingSpinner.style.display = 'none'

  if (!data || !data.results || data.resultCount === 0) {
    showEmpty('Aucun résultat trouvé. Essaie un autre mot-clé.')
    return
  }

  allResults = data.results
  renderResults()
}

function createLocalCard(song) {
  const card = document.createElement('div')
  card.className = 'result-card'
  card.innerHTML = `
    <img class="card-art" src="${escapeHtml(song.artUrl || '')}" alt="${escapeHtml(song.title)}" onerror="this.style.display='none'" />
    <div class="card-info">
      <div class="card-title">${escapeHtml(song.title)}</div>
      <div class="card-artist">${escapeHtml(song.artist || '')}</div>
      <div class="lib-offline-badge"><i class="fas fa-check-circle"></i> Dans ta bibliothèque</div>
    </div>
    <div class="card-actions">
      <button class="action-btn play-btn" data-preview="${escapeHtml(song.audioUrl)}" data-title="${escapeHtml(song.title)}" data-artist="${escapeHtml(song.artist || '')}" data-art="${escapeHtml(song.artUrl || '')}" title="Écouter"><i class="fas fa-play"></i></button>
    </div>
  `

  const playBtn = card.querySelector('.play-btn')
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      playPreview(playBtn)
    })
  }

  return card
}

async function tryFetch(url) {
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function renderResults() {
  const filtered = allResults.filter(item => {
    if (currentMedia === 'music' || currentMedia === 'all') {
      return item.kind === 'song' || item.wrapperType === 'collection' || item.wrapperType === 'artist'
    }
    if (currentMedia === 'album') return item.wrapperType === 'collection' || item.collectionType === 'Album'
    if (currentMedia === 'musicArtist') return item.wrapperType === 'artist'
    return true
  })

  elements.resultsCount.textContent = filtered.length
  elements.resultsQuery.textContent = currentQuery

  if (filtered.length === 0) {
    showEmpty('Aucun résultat trouvé. Essaie un autre mot-clé.')
    return
  }

  elements.emptyState.style.display = 'none'
  elements.resultsGrid.innerHTML = ''
  elements.resultsGrid.className = `results-grid ${currentView}`

  let adIndex = 4

  filtered.forEach((item, i) => {
    if (i > 0 && i % adIndex === 0) {
      const ad = createInlineAd()
      if (ad) elements.resultsGrid.appendChild(ad)
      adIndex = Math.floor(Math.random() * 4) + 3
    }
    const card = createCard(item)
    elements.resultsGrid.appendChild(card)
  })
}

function createInlineAd() {
  if (CODELUX_PROJECTS.length === 0) return null
  const p = CODELUX_PROJECTS[Math.floor(Math.random() * CODELUX_PROJECTS.length)]
  const a = document.createElement('a')
  a.className = 'ad-inline'
  a.href = p.path
  a.target = '_top'
  a.innerHTML = `
    <span class="ad-icon">${p.icon}</span>
    <div class="ad-info">
      <div class="ad-title" style="color:${p.color}">${p.name}</div>
      <div class="ad-desc">${p.desc}</div>
    </div>
    <span class="ad-go">Découvrir <i class="fas fa-arrow-right"></i></span>
  `
  return a
}

function createCard(item) {
  const isGrid = currentView === 'grid'
  const card = document.createElement('div')
  card.className = `result-card ${isGrid ? 'grid-layout' : ''}`

  const isSong = item.kind === 'song'
  const isAlbum = item.wrapperType === 'collection'
  const isArtist = item.wrapperType === 'artist'
  const trackId = String(item.trackId || item.collectionId || item.artistId || '')
  const artUrl = item.artworkUrl100 || item.artworkUrl60 || ''
  const title = item.trackName || item.collectionName || item.artistName || 'Inconnu'
  const artist = isArtist ? '' : (item.artistName || '')
  const album = isAlbum ? '' : (item.collectionName || '')
  const previewUrl = item.previewUrl || ''
  const trackViewUrl = item.trackViewUrl || item.collectionViewUrl || item.artistLinkUrl || ''
  const typeLabel = isSong ? 'SONG' : isAlbum ? 'ALBUM' : isArtist ? 'ARTISTE' : ''
  const alreadyDownloaded = downloadedIds.has(trackId)

  card.innerHTML = `
    ${artUrl
      ? `<img class="card-art" src="${artUrl}" alt="${title}" loading="lazy" />`
      : `<div class="card-art-placeholder"><i class="fas fa-music"></i></div>`
    }
    <div class="card-info">
      <div class="card-title">${escapeHtml(title)}</div>
      ${artist ? `<div class="card-artist">${escapeHtml(artist)}</div>` : ''}
      ${album ? `<div class="card-album">${escapeHtml(album)}</div>` : ''}
      <span class="card-type">${typeLabel}</span>
    </div>
    <div class="card-actions">
      ${previewUrl && isSong ? `<button class="action-btn play-btn" data-preview="${previewUrl}" data-title="${escapeHtml(title)}" data-artist="${escapeHtml(artist || '')}" data-art="${artUrl}" title="Écouter"><i class="fas fa-play"></i></button>` : ''}
      ${previewUrl && isSong ? `<button class="action-btn dl-btn ${alreadyDownloaded ? 'downloaded' : ''}" data-id="${trackId}" data-preview="${previewUrl}" data-title="${escapeHtml(title)}" data-artist="${escapeHtml(artist || '')}" data-album="${escapeHtml(album || '')}" data-art="${artUrl}" title="${alreadyDownloaded ? 'Déjà téléchargé' : 'Télécharger'}" ${alreadyDownloaded ? 'disabled' : ''}><i class="fas ${alreadyDownloaded ? 'fa-check' : 'fa-download'}"></i></button>` : ''}
      ${trackViewUrl ? `<a href="${trackViewUrl}" target="_blank" class="action-btn ext-link-btn" title="Voir sur Apple Music"><i class="fas fa-external-link-alt"></i></a>` : ''}
    </div>
  `

  const playBtn = card.querySelector('.play-btn')
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      playPreview(playBtn)
    })
  }

  const dlBtn = card.querySelector('.dl-btn')
  if (dlBtn && !alreadyDownloaded) {
    dlBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      dlBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
      await downloadSong(dlBtn.dataset)
      dlBtn.innerHTML = '<i class="fas fa-check"></i>'
      dlBtn.classList.add('downloaded')
      dlBtn.disabled = true
      dlBtn.title = 'Déjà téléchargé'
    })
  }

  return card
}

async function downloadSong(data) {
  const song = {
    id: data.id,
    title: data.title,
    artist: data.artist,
    album: data.album,
    artUrl: data.art,
    audioUrl: data.preview,
  }

  try {
    await addSong(song)
    downloadedIds.add(data.id)
    showToast(`✓ "${song.title}" ajouté à ta bibliothèque`)
  } catch {
    showToast('Erreur lors du téléchargement')
  }
}

function playPreview(btn) {
  const previewUrl = btn.dataset.preview
  const title = btn.dataset.title
  const artist = btn.dataset.artist
  const art = btn.dataset.art

  if (!previewUrl) return

  if (currentAudio && currentAudio.src === previewUrl) {
    if (currentAudio.paused) {
      currentAudio.play()
      btn.querySelector('i').className = 'fas fa-pause'
      updateNowPlayingBar(true)
    } else {
      currentAudio.pause()
      btn.querySelector('i').className = 'fas fa-play'
      updateNowPlayingBar(false)
    }
    return
  }

  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    if (currentPlayingCard) {
      const prevBtn = currentPlayingCard.querySelector('.play-btn, .lib-play-btn')
      if (prevBtn) prevBtn.querySelector('i').className = 'fas fa-play'
    }
  }

  currentAudio = new Audio(previewUrl)
  currentPlayingCard = btn.closest('.result-card, .lib-song')

  currentAudio.play()
  btn.querySelector('i').className = 'fas fa-pause'
  showNowPlayingBar(title, artist, art)

  currentAudio.addEventListener('ended', () => {
    btn.querySelector('i').className = 'fas fa-play'
    updateNowPlayingBar(false)
  })
}

function showNowPlayingBar(title, artist, art) {
  const bar = elements.nowPlayingBar
  bar.classList.add('active')
  bar.innerHTML = `
    ${art ? `<img class="np-art" src="${art}" alt="${title}" />` : `<div class="np-art" style="background:var(--bg-input);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-music"></i></div>`}
    <div class="np-info">
      <div class="np-title">${escapeHtml(title)}</div>
      <div class="np-artist">${escapeHtml(artist)}</div>
    </div>
    <div class="np-controls">
      <button class="np-play-btn" id="npPlayBtn"><i class="fas fa-pause"></i></button>
      <button class="np-close-btn" id="npCloseBtn"><i class="fas fa-times"></i></button>
    </div>
  `

  document.getElementById('npPlayBtn').addEventListener('click', () => {
    if (currentAudio.paused) {
      currentAudio.play()
      document.getElementById('npPlayBtn').innerHTML = '<i class="fas fa-pause"></i>'
      if (currentPlayingCard) {
        const btn = currentPlayingCard.querySelector('.play-btn, .lib-play-btn')
        if (btn) btn.querySelector('i').className = 'fas fa-pause'
      }
    } else {
      currentAudio.pause()
      document.getElementById('npPlayBtn').innerHTML = '<i class="fas fa-play"></i>'
      if (currentPlayingCard) {
        const btn = currentPlayingCard.querySelector('.play-btn, .lib-play-btn')
        if (btn) btn.querySelector('i').className = 'fas fa-play'
      }
    }
  })

  document.getElementById('npCloseBtn').addEventListener('click', () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    if (currentPlayingCard) {
      const btn = currentPlayingCard.querySelector('.play-btn, .lib-play-btn')
      if (btn) btn.querySelector('i').className = 'fas fa-play'
    }
    bar.classList.remove('active')
  })
}

function updateNowPlayingBar(isPlaying) {
  const playBtn = document.getElementById('npPlayBtn')
  if (playBtn) playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'
}

function showEmpty(msg) {
  elements.resultsGrid.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <i class="fas fa-search"></i>
      <p>${msg}</p>
    </div>
  `
}

function escapeHtml(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function initAds() {
  const track = elements.adsTrack
  track.innerHTML = ''
  CODELUX_PROJECTS.forEach(p => {
    const a = document.createElement('a')
    a.className = 'ad-card'
    a.href = p.path
    a.target = '_top'
    a.innerHTML = `
      <span class="ad-icon">${p.icon}</span>
      <div class="ad-info">
        <div class="ad-title" style="color:${p.color}">${p.name}</div>
        <div class="ad-desc">${p.desc}</div>
      </div>
      <span class="ad-go"><i class="fas fa-arrow-right"></i></span>
    `
    track.appendChild(a)
  })
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  document.querySelectorAll('.install-header-btn, .install-hero-btn, #splashInstallBtn').forEach(el => {
    if (el) el.style.display = 'flex'
  })
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  document.querySelectorAll('.install-header-btn, .install-hero-btn, #splashInstallBtn').forEach(el => {
    if (el) el.style.display = 'none'
  })
})

async function installApp() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice
  deferredPrompt = null
  if (result.outcome === 'accepted') {
    document.querySelectorAll('.install-header-btn, .install-hero-btn, #splashInstallBtn').forEach(el => {
      if (el) el.style.display = 'none'
    })
  }
}

document.getElementById('installHeaderBtn')?.addEventListener('click', installApp)
document.getElementById('installHeroBtn')?.addEventListener('click', installApp)
document.getElementById('splashInstallBtn')?.addEventListener('click', installApp)

elements.splashBtn.addEventListener('click', () => {
  elements.splash.style.display = 'none'
  elements.app.style.display = 'flex'
  elements.searchInput.focus()
})

elements.searchForm.addEventListener('submit', (e) => {
  e.preventDefault()
  searchMusic(elements.searchInput.value, currentMedia)
})

elements.filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.filterBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentMedia = btn.dataset.media
    if (allResults.length > 0) {
      renderResults()
    } else if (currentQuery) {
      searchMusic(currentQuery, currentMedia)
    }
  })
})

elements.viewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.viewBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentView = btn.dataset.view
    const cards = elements.resultsGrid.querySelectorAll('.result-card')
    if (cards.length > 0) {
      elements.resultsGrid.className = `results-grid ${currentView}`
      cards.forEach(c => c.classList.toggle('grid-layout', currentView === 'grid'))
    }
  })
})

updateOnlineStatus()
initAds()
loadLibrary()
