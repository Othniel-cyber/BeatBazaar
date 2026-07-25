const P=[
  {n:'CodeLux Academy',d:'Apprends à coder gratuitement',i:'💻',c:'#a855f7',p:'https://othniel-cyber.github.io/CodeLux-Academy/'},
  {n:'Othniel2TO',d:"Dactylographie - Tape plus vite",i:'⌨️',c:'#6c63ff',p:'https://othniel-cyber.github.io/Othniel2TO/'},
  {n:'EduConnect',d:'Plateforme éducative connectée',i:'📚',c:'#f59e0b',p:'https://othniel-cyber.github.io/educonnect/'},
  {n:'LA MANNE DE VIE',d:'Église chrétienne Porto-Novo',i:'⛪',c:'#C9A84C',p:'https://othniel-cyber.github.io/eglise-manne-de-vie/'},
  {n:'PredictX',d:'Pronostics football IA',i:'⚽',c:'#10b981',p:'https://othniel-cyber.github.io/PredictX/'},
]

const CATEGORIES=[
  {n:'Afrobeat',q:'Davido Wizkid Burna Boy',i:'🌍'},
  {n:'Hip-Hop',q:'Drake Kendrick Lamar J Cole',i:'🎤'},
  {n:'Pop',q:'Taylor Swift Ed Sheeran Dua Lipa',i:'🌟'},
  {n:'RnB',q:'SZA Frank Ocean The Weeknd',i:'🎵'},
  {n:'Reggae',q:'Bob Marley Koffee Chronixx',i:'🌴'},
  {n:'Rock',q:'Queen Led Zeppelin Nirvana',i:'🎸'},
  {n:'Jazz',q:'Miles Davis John Coltrane',i:'🎷'},
  {n:'Electronic',q:'Daft Punk Calvin Harris David Guetta',i:'🎛️'},
  {n:'Afro Pop',q:'Rema Ayra Starr CKay',i:'🔥'},
  {n:'Gospel',q:'Sinach Mercy Chinwo Travis Greene',i:'🙌'},
]

const E=s=>document.getElementById(s)
const $=E.bind(null)

const _s=$('splash'),_a=$('app'),_si=$('splashInstall'),_sb=$('splashBtn')
const _rg=$('resultsGrid'),_rc=$('resultsCount'),_rq=$('resultsQuery'),_es=$('emptyState'),_ld=$('loadingSpinner'),_of=$('offlineBanner')
const _ca=$('categoriesGrid'),_tr=$('trendingGrid'),_ad=$('adsTrack'),_lib=$('libraryGrid'),_lb=$('libEmpty'),_bd=$('libBadge'),_lc=$('libCount'),_ns=$('nowPlayingBar'),_pr=$('progressFill')
const _sr=$('headerSearch'),_sr2=$('pageSearch'),_sr3=$('heroSearch')

let Q='',M='all',V='grid',A=null,PC=null,R=[],DP=null,ON=navigator.onLine,DI=new Set,PL=[],PI=-1

window.addEventListener('online',()=>{ON=true;u()});window.addEventListener('offline',()=>{ON=false;u()})
function u(){_of.style.display=ON?'none':'block'}

function t(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2500)}

async function loadLib(){const s=await getAllSongs();DI=new Set(s.map(s=>s.id));renderLib(s)}
function renderLib(s){_bd.textContent=s.length;if(!s.length){_lib.innerHTML='';_lib.appendChild(_lb);_lc.textContent='';return}_lb.remove();_lib.innerHTML='';_lc.textContent=`${s.length} titre${s.length>1?'s':''} dans ta bibliothèque`
s.forEach(s=>{const d=document.createElement('div');d.className='ls';d.innerHTML=`
<img class="ca" src="${h(s.artUrl||'')}" alt="${h(s.title)}" onerror="this.style.display='none'"/>
<div class="ci"><div class="ct">${h(s.title)}</div><div class="car">${h(s.artist||'')}</div><div class="lib-off"><i class="fas fa-check-circle"></i> Hors ligne</div></div>
<div class="la"><button class="lb pb" data-p="${h(s.audioUrl)}" data-t="${h(s.title)}" data-ar="${h(s.artist||'')}" data-a="${h(s.artUrl||'')}"><i class="fas fa-play"></i></button>
<button class="lb" data-i="${s.id}" style="background:rgba(239,68,68,.15);color:#ef4444"><i class="fas fa-trash"></i></button></div>`
d.querySelector('.pb').onclick=e=>{e.stopPropagation();const b=e.currentTarget;const p=b.dataset.p;if(p)play({dataset:b.dataset,querySelector:()=>b.querySelector('i')})}
d.querySelector('[data-i]').onclick=async e=>{e.stopPropagation();await removeSong(e.currentTarget.dataset.i);DI.delete(e.currentTarget.dataset.i);t('Titre supprimé');loadLib()}
_lib.appendChild(d)})}

function sp(p){document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));document.querySelector(`[data-p="${p}"]`).classList.add('active');document.getElementById('page-home').classList.toggle('active',p==='home');
document.getElementById('page-search').classList.toggle('active',p==='search');document.getElementById('page-library').classList.toggle('active',p==='library');if(p==='library')loadLib()}

async function search(q,m){if(!q.trim())return;Q=q.trim();M=m;_rg.innerHTML='';_es.style.display='none'
if(!ON){_ld.style.display='none';const l=await searchLocalSongs(q);if(l.length){showEmpty(`Hors ligne : ${l.length} titre(s) dans ta bibliothèque`);l.forEach(s=>_rg.appendChild(cl(s)));_rc.textContent=l.length;_rq.textContent=q}else showEmpty('Hors ligne. Aucun résultat.')}
else{_ld.style.display='block';const e=encodeURIComponent(q.trim());let d=null
for(const p of['','https://api.allorigins.win/raw?url=','https://corsproxy.io/?url=']){const u=p?p+encodeURIComponent(`https://api.deezer.com/search?q=${e}&limit=50`):`https://api.deezer.com/search?q=${e}&limit=50`;d=await fetch2(u);if(d&&d.data)break}
_ld.style.display='none';if(!d||!d.data||!d.data.length){if(M!=='all'){R=[];r();return}
let d2=null;for(const p of['','https://api.allorigins.win/raw?url=','https://corsproxy.io/?url=']){const u=p?p+encodeURIComponent(`https://itunes.apple.com/search?term=${e}&media=music&entity=song,album,musicArtist&limit=50`):`https://itunes.apple.com/search?term=${e}&media=music&entity=song,album,musicArtist&limit=50`;d2=await fetch2(u);if(d2&&d2.results)break}
if(!d2||!d2.results||!d2.results.length){showEmpty('Aucun résultat trouvé.');return}
R=d2.results.map(i=>({id:String(i.trackId||i.collectionId||i.artistId||Math.random()),title:i.trackName||i.collectionName||i.artistName||'Inconnu',artist:i.artistName||'',album:i.collectionName||'',art:i.artworkUrl100||i.artworkUrl60||'',preview:i.previewUrl||'',link:i.trackViewUrl||i.collectionViewUrl||'',type:i.kind==='song'?'song':i.wrapperType==='collection'?'album':'artist',source:'itunes'}));r();return}
R=d.data.map(i=>({id:String(i.id),title:i.title||'Inconnu',artist:i.artist&&i.artist.name||'',album:i.album&&i.album.title||'',art:i.album&&i.album.cover_medium||i.artist&&i.artist.picture_medium||'',preview:i.preview||'',link:i.link||'',type:'song',source:'deezer',duration:i.duration||0}));r()}}

function cl(s){const d=document.createElement('div');d.className='card';d.innerHTML=`<img class="ca" src="${h(s.artUrl||'')}" onerror="this.style.display='none'"/>
<div class="ci"><div class="ct">${h(s.title)}</div><div class="car">${h(s.artist||'')}</div><div class="lib-off"><i class="fas fa-check-circle"></i> Bibliothèque</div></div>
<div class="ca2"><button class="cb pb" data-p="${h(s.audioUrl)}" data-t="${h(s.title)}" data-ar="${h(s.artist||'')}" data-a="${h(s.artUrl||'')}"><i class="fas fa-play"></i></button></div>`
d.querySelector('.pb').onclick=e=>{e.stopPropagation();play({dataset:e.currentTarget.dataset,querySelector:()=>e.currentTarget.querySelector('i')})};return d}

async function fetch2(u){try{const r=await fetch(u,{headers:{Accept:'application/json'}});if(!r.ok)return null;const t=await r.text();try{return JSON.parse(t)}catch{return null}}catch{return null}}

function r(){const f=R.filter(i=>{if(M==='music')return i.type==='song';if(M==='album')return i.type==='album';if(M==='musicArtist')return i.type==='artist';return true})
_rc.textContent=f.length;_rq.textContent=Q;if(!f.length){showEmpty('Aucun résultat.');return}
_es.style.display='none';_rg.innerHTML='';_rg.className=`results ${V}`;let ai=4
f.forEach((i,idx)=>{if(idx&&idx%ai===0){const a=ia();if(a)_rg.appendChild(a);ai=Math.floor(Math.random()*4)+3}
const d=document.createElement('div');d.className=`card ${V==='grid'?'g':''}`
const isS=i.type==='song',isA=i.type==='album',isAr=i.type==='artist',did=DI.has(i.id)
d.innerHTML=`
${i.art?`<img class="ca" src="${i.art}" alt="${h(i.title)}" loading="lazy"/>`:`<div class="ca-p"><i class="fas fa-music"></i></div>`}
<div class="ci"><div class="ct">${h(i.title)}</div>${i.artist?`<div class="car">${h(i.artist)}</div>`:''}${i.album?`<div class="cal">${h(i.album)}</div>`:''}${i.duration?`<div class="cal">${Math.floor(i.duration/60)}:${String(i.duration%60).padStart(2,'0')}</div>`:''}<span class="ctp">${isS?'SONG':isA?'ALBUM':isAr?'ARTISTE':''}</span></div>
<div class="ca2">${i.preview&&isS?`<button class="cb pb" data-p="${i.preview}" data-t="${h(i.title)}" data-ar="${h(i.artist||'')}" data-a="${i.art}"><i class="fas fa-play"></i></button>`:''}
${i.preview&&isS?`<button class="cb db ${did?'done':''}" data-id="${i.id}" data-p="${i.preview}" data-t="${h(i.title)}" data-ar="${h(i.artist||'')}" data-al="${h(i.album||'')}" data-a="${i.art}" title="${did?'Dans bibliothèque':'Télécharger'}" ${did?'disabled':''}><i class="fas ${did?'fa-check':'fa-download'}"></i></button>`:''}
${i.link?`<a href="${i.link}" target="_blank" class="cb eb" title="Voir"><i class="fas fa-external-link-alt"></i></a>`:''}</div>`
const pb=d.querySelector('.pb');if(pb)pb.onclick=e=>{e.stopPropagation();play({dataset:e.currentTarget.dataset,querySelector:()=>e.currentTarget.querySelector('i')})}
const db=d.querySelector('.db:not(.done)');if(db)db.onclick=async e=>{e.stopPropagation();const b=e.currentTarget;b.innerHTML='<i class="fas fa-spinner fa-spin"></i>';await dl(b.dataset);b.innerHTML='<i class="fas fa-check"></i>';b.classList.add('done');b.disabled=true;b.title='Dans bibliothèque'}
_rg.appendChild(d)})}

function ia(){if(!P.length)return null;const p=P[Math.floor(Math.random()*P.length)];const a=document.createElement('a');a.className='ad-inline';a.href=p.p;a.target='_top'
a.innerHTML=`<span class="ai">${p.i}</span><div class="ax"><div class="at" style="color:${p.c}">${p.n}</div><div class="ad">${p.d}</div></div><span class="ag">Voir <i class="fas fa-arrow-right"></i></span>`;return a}

async function dl(d){const s={id:d.id,title:d.title,artist:d.ar,album:d.al,artUrl:d.a,audioUrl:d.p}
try{await addSong(s);DI.add(d.id)}catch{}
let audioBlob=null;let audioOk=false
for(const p of['','https://api.allorigins.win/raw?url=','https://corsproxy.io/?url=']){try{const u=p?p+encodeURIComponent(d.p):d.p;const r=await fetch(u,{mode:'cors'});if(r.ok&&(r.headers.get('content-type')||'').startsWith('audio/')){audioBlob=await r.blob();audioOk=true;break}}catch{}}
if(audioOk&&audioBlob&&audioBlob.size>1000){const name=`${d.ar||'Artiste'} - ${d.title||'Titre'}.mp3`;const url=URL.createObjectURL(audioBlob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),5e3);t(`✓ "${d.title}" téléchargé sur l'appareil`)}
else{try{if('serviceWorker'in navigator&&navigator.serviceWorker.controller){const c=await caches.open('beatbazaar-audio');const r=await fetch(d.p);if(r.ok){c.put(d.p,r);audioOk=true}}}catch{};if(audioOk)t(`✓ "${d.title}" sauvegardé (lecture offline)`);else t(`✓ "${d.title}" ajouté à la bibliothèque (hors ligne disponible après lecture)`)}}

function play(b){const p=b.dataset.p,ti=b.dataset.t,ar=b.dataset.ar,au=b.dataset.a;if(!p){if(b.querySelector)b.querySelector('i').className='fas fa-play';return}
if(A&&A.src===p){if(A.paused){A.play().catch(()=>{});if(b.querySelector)b.querySelector('i').className='fas fa-pause';npU(true)}else{A.pause();if(b.querySelector)b.querySelector('i').className='fas fa-play';npU(false)}return}
if(A){A.pause();A.currentTime=0;if(PC){const pb=PC.querySelector('.pb,.lb.pb');if(pb)pb.querySelector('i').className='fas fa-play'}}
A=new Audio(p);PC=b.closest?.('.card,.ls')||null;A.play().catch(()=>{if(b.querySelector)b.querySelector('i').className='fas fa-play';t('Lecture impossible pour ce titre')});if(b.querySelector)b.querySelector('i').className='fas fa-pause';npS(ti,ar,au)
A.ontimeupdate=()=>{if(A&&_pr){const p=(A.currentTime/A.duration)*100||0;_pr.style.width=p+'%';const t=_ns.querySelectorAll('.bar-time span');if(t.length>1){t[0].textContent=fmt(A.currentTime);t[1].textContent=fmt(A.duration)}}};A.onended=()=>{if(b.querySelector)b.querySelector('i').className='fas fa-play';npU(false);_pr.style.width='0%';const t=_ns.querySelectorAll('.bar-time span');if(t.length>1){t[0].textContent='0:00';t[1].textContent='0:00'}}
A.onerror=()=>{if(b.querySelector)b.querySelector('i').className='fas fa-play';t('Erreur de lecture. Essaie un autre titre.')}}

function fmt(s){const m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+String(sec).padStart(2,'0')}

function npS(t,ar,a){_ns.classList.add('active');_ns.innerHTML=`
<div class="bar-top">${a?`<img class="ba" src="${a}" alt="${h(t)}"/>`:'<div class="ba" style="background:var(--bg2);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--fg3)"><i class="fas fa-music"></i></div>'}
<div class="bi"><div class="bt">${h(t)}</div><div class="ba2">${h(ar)}</div></div>
<div class="bc"><button class="b-btn" id="npShuffleBtn"><i class="fas fa-random"></i></button><button class="b-btn" id="npPrevBtn"><i class="fas fa-step-backward"></i></button>
<button class="b-btn primary" id="npPlayBtn"><i class="fas fa-pause"></i></button>
<button class="b-btn" id="npNextBtn"><i class="fas fa-step-forward"></i></button><button class="b-btn" id="npCloseBtn"><i class="fas fa-times"></i></button></div></div>
<div class="prog" id="progBar"><div class="prog-fill" id="progressFill" style="width:0%"></div></div>
<div class="bar-time"><span id="npCurrent">0:00</span><span id="npDuration">0:00</span></div>`
$('npPlayBtn').onclick=()=>{if(A.paused){A.play();$('npPlayBtn').innerHTML='<i class="fas fa-pause"></i>';if(PC){const b=PC.querySelector('.pb,.lb.pb');if(b)b.querySelector('i').className='fas fa-pause'}}else{A.pause();$('npPlayBtn').innerHTML='<i class="fas fa-play"></i>';if(PC){const b=PC.querySelector('.pb,.lb.pb');if(b)b.querySelector('i').className='fas fa-play'}}}
$('npCloseBtn').onclick=()=>{if(A){A.pause();A.currentTime=0}if(PC){const b=PC.querySelector('.pb,.lb.pb');if(b)b.querySelector('i').className='fas fa-play'}_ns.classList.remove('active')}
$('npPrevBtn').onclick=()=>{if(PL.length&&PI>0){PI--;playFromList(PL[PI])}}
$('npNextBtn').onclick=()=>{if(PL.length&&PI<PL.length-1){PI++;playFromList(PL[PI])}}
$('progBar').onclick=e=>{if(!A||!A.duration)return;const r=e.currentTarget.getBoundingClientRect();const pct=(e.clientX-r.left)/r.width;A.currentTime=pct*A.duration}}

function playFromList(item){if(!item)return;const fake={dataset:{p:item.preview,t:item.title,ar:item.artist||'',a:item.art||''},querySelector:()=>null,closest:()=>null};play(fake)}
function npU(p){const b=$('npPlayBtn');if(b)b.innerHTML=p?'<i class="fas fa-pause"></i>':'<i class="fas fa-play"></i>'}

function showEmpty(m){_rg.innerHTML=`<div class="empty"><i class="fas fa-search"></i><p>${m}</p></div>`}
function h(s){if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML}

function initAds(){_ad.innerHTML='';P.forEach(p=>{const a=document.createElement('a');a.href=p.p;a.target='_top'
a.innerHTML=`<span class="ai" style="font-size:24px">${p.i}</span><div><div style="font-size:13px;font-weight:600;color:${p.c}">${p.n}</div><div style="font-size:11px;color:var(--fg3)">${p.d}</div></div>`;_ad.appendChild(a)})}

function initCats(){_ca.innerHTML='';CATEGORIES.forEach(c=>{const d=document.createElement('div');d.className='cat'
d.innerHTML=`<div class="ci">${c.i}</div><span>${c.n}</span>`;d.onclick=()=>{_sr.value=c.q;doSearch(_sr)};_ca.appendChild(d)})}

async function initTrending(){_tr.innerHTML=`<div class="loading"><div class="spinner"></div><p>Chargement des tendances...</p></div>`
let d=null;for(const p of['','https://api.allorigins.win/raw?url=','https://corsproxy.io/?url=']){const u=p?p+encodeURIComponent('https://api.deezer.com/chart/0/tracks?limit=10'):'https://api.deezer.com/chart/0/tracks?limit=10';d=await fetch2(u);if(d&&d.data)break}
_tr.innerHTML='';if(!d||!d.data||!d.data.length){_tr.innerHTML='<div class="empty"><p>Impossible de charger les tendances</p></div>';return}
d.data.forEach(i=>{const s={id:String(i.id),title:i.title||'Inconnu',artist:i.artist&&i.artist.name||'',album:i.album&&i.album.title||'',art:i.album&&i.album.cover_medium||'',preview:i.preview||'',type:'song',source:'deezer'}
const c=document.createElement('div');c.className=`card ${V==='grid'?'g':''}`
c.innerHTML=`<img class="ca" src="${s.art}" alt="${h(s.title)}" loading="lazy"/>
<div class="ci"><div class="ct">${h(s.title)}</div><div class="car">${h(s.artist)}</div></div>
<div class="ca2"><button class="cb pb" data-p="${s.preview}" data-t="${h(s.title)}" data-ar="${h(s.artist)}" data-a="${s.art}"><i class="fas fa-play"></i></button>
<button class="cb db ${DI.has(s.id)?'done':''}" data-id="${s.id}" data-p="${s.preview}" data-t="${h(s.title)}" data-ar="${h(s.artist)}" data-al="${h(s.album)}" data-a="${s.art}" title="${DI.has(s.id)?'Dans bibliothèque':'Télécharger'}" ${DI.has(s.id)?'disabled':''}><i class="fas ${DI.has(s.id)?'fa-check':'fa-download'}"></i></button></div>`
c.querySelector('.pb').onclick=e=>{e.stopPropagation();play({dataset:e.currentTarget.dataset,querySelector:()=>e.currentTarget.querySelector('i')})}
const db=c.querySelector('.db:not(.done)');if(db)db.onclick=async e=>{e.stopPropagation();const b=e.currentTarget;b.innerHTML='<i class="fas fa-spinner fa-spin"></i>';await dl(b.dataset);b.innerHTML='<i class="fas fa-check"></i>';b.classList.add('done');b.disabled=true;b.title='Dans bibliothèque'}
_tr.appendChild(c)})}

const hi=()=>{[$('installHeaderBtn'),$('installHeroBtn'),_si].forEach(el=>{if(el)el.style.display='none'})}
const si=()=>{[$('installHeaderBtn'),$('installHeroBtn'),_si].forEach(el=>{if(el)el.style.display='flex'})}
if(window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true)hi()
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();DP=e;si()})
window.addEventListener('appinstalled',()=>{DP=null;hi()})
async function installApp(){if(!DP)return;DP.prompt();const r=await DP.userChoice;DP=null;hi()}
$('installHeaderBtn')?.addEventListener('click',installApp);$('installHeroBtn')?.addEventListener('click',installApp);_si?.addEventListener('click',installApp)

if(window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true){_s.style.display='none';_a.style.display='flex'}
_sb.onclick=()=>{_s.style.display='none';_a.style.display='flex';setTimeout(()=>{if(_sr)_sr.focus()},300)}

function doSearch(input){const v=input.value.trim();if(v){search(v,M);sp('search')}}
$('headerSearchForm').addEventListener('submit',e=>{e.preventDefault();doSearch(_sr)})
$('pageSearchBtn').addEventListener('click',()=>doSearch(_sr2));_sr2.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();doSearch(_sr2)}})
$('heroSearchBtn').addEventListener('click',()=>doSearch(_sr3));_sr3.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();doSearch(_sr3)}})

document.querySelectorAll('.filters button').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));b.classList.add('active');M=b.dataset.m
if(R.length)r();else if(Q)search(Q,M)}})

document.querySelectorAll('.views button').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.views button').forEach(b=>b.classList.remove('active'));b.classList.add('active');V=b.dataset.v
const c=_rg.querySelectorAll('.card');if(c.length){_rg.className=`results ${V}`;c.forEach(c=>c.classList.toggle('g',V==='grid'))}}})

document.querySelectorAll('.nav button').forEach(b=>{b.onclick=()=>{sp(b.dataset.p)}})

document.querySelectorAll('.cta button').forEach(b=>{b.onclick=()=>{const s=document.getElementById('pageSearch');if(s)s.focus();sp('search')}})

u();initAds();initCats();initTrending();loadLib()

document.addEventListener('contextmenu',e=>e.preventDefault())
document.addEventListener('dragstart',e=>e.preventDefault())
document.addEventListener('copy',e=>e.preventDefault())
document.addEventListener('cut',e=>e.preventDefault())
document.addEventListener('paste',e=>e.preventDefault())
document.addEventListener('selectstart',e=>e.preventDefault())
document.onkeydown=function(e){if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].includes(e.key.toUpperCase()))||(e.ctrlKey&&e.key==='u')){e.preventDefault();return false}}
setInterval(()=>{const d=document;if(d.body.contentEditable==='true'||d.designMode==='on'){d.body.contentEditable='false';d.designMode='off'}},100)
try{Object.defineProperty(document,'documentURI',{get:()=>location.href})}catch{}
try{console.log('%c🚫 Inspection désactivée','font-size:24px;color:#a855f7');console.log=function(){};console.warn=function(){};console.error=function(){}}catch{}