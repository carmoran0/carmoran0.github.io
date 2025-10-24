<template>
  <div>
    <!-- Announcement bar -->
    <div class="announcement" role="region" aria-label="anuncio">
      <a href="https://github.com/carmoran0/MOOdleUnizarCSS" style="color: beige;">¡Descarga mi extensión para Moodle!</a>
    </div>

    <!-- Background blur container -->
    <div id="bg-blur" aria-hidden="true" style="position:fixed;inset:0;z-index:0;pointer-events:none;background-size:cover;background-position:center;filter:blur(4px) brightness(0.6);transition:opacity 800ms ease;opacity:0"></div>

    <div class="page-wrapper" style="position:relative;z-index:1;">
      <!-- Left column: Header -->
      <div class="left-column">
        <div class="main-container header-container">
          <header>
            <h1 id="texto">
              <span class="online-indicator">
                <span class="online-dot"></span>
                <span class="online-text">En línea</span>
              </span>
              Caldo 
              <a class="link-button duolingo" href="https://www.duolingo.com/profile/Cosaco27" id="streak-counter">
                <img src="/streakico.svg" class="streak-icon" alt="Racha"> 
                <span class="streak-number">{{ streakDays }} días</span>
              </a>
            </h1>
          </header>
          <p class="ultima-actualizacion">
            Última actualización de esta página web: 21/10/2025 a las 23:53<br>
            <a href="/legacy/index.html" style="color: beige;">(versión legacy)</a>
          </p>
          <div class="github-readme-container">
            <div class="profile-labels" aria-label="etiquetas-personales" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;justify-content:center;align-items:center;">
              <div class="label" style="background:rgba(255,255,255,0.06);padding:6px 10px;border-radius:6px;font-size:0.95rem;text-align:center;">
                <strong>2005</strong> <span id="label-age"></span>
              </div>
              <div class="label" style="background:rgba(255,255,255,0.06);padding:6px 10px;border-radius:6px;font-size:0.95rem;text-align:center;">
                <strong>he/they/she</strong> <span id="label-pronouns"></span>
              </div>
              <div class="label" style="background:rgba(255,255,255,0.06);padding:6px 10px;border-radius:6px;font-size:0.95rem;text-align:center;">
                <strong>Zaragoza</strong> <span id="label-location"></span>
              </div>
              <img src="/images/76776271_q9G81Q2ghI4CVDF.png" alt="Imagen de perfil" style="height: 29px;opacity: 0.8;">
            </div>
            <p> carmoran0/README.md </p>
            <div id="readme-content">
              <img src="/images/screamer.gif">
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Social Links & Last.fm -->
      <div class="right-column">
        <div class="main-container social-container">
          <h2>Links:</h2>
          <section class="social-links">
            <p><a class="link-button letterbox" href="https://boxd.it/9uosP">Letterbox</a></p>
            <p><a class="link-button steam" href="https://steamcommunity.com/id/poopoopeepeeheehee/">Steam</a></p>
            <p><a class="link-button instagram" href="https://www.instagram.com/testriculo/">Instagram</a></p>
            <p><a class="link-button discord" href="https://discordapp.com/users/357955189149532161">Discord</a></p>
            <p><a class="link-button mastodon" rel="me" href="https://mastodon.social/@copaco">Mastodon</a></p>
            <p><a class="link-button bluesky" href="https://bsky.app/profile/koljoz.bsky.social">Bluesky</a></p>
            <p><a class="link-button correo" href="mailto:metricas_mensulas.0p@icloud.com">Correo</a></p>
            <p><a class="link-button github" href="https://github.com/carmoran0">GitHub</a></p>
            <p><a class="link-button lastfm" href="https://www.last.fm/user/sobaco27">Last.fm</a></p>
            <p><a class="link-button soundcloud" href="https://soundcloud.com/koljoz">SoundCloud</a></p>
          </section>
        </div>

        <img id="freddy-trigger" src="/images/freddy.gif" style="position: absolute; top: 200px; right: -50px; z-index: -1; width: 100px; height: auto;" @click="triggerScreamer">

        <div class="main-container lastfm-container-wrapper">
          <h2>
            <a href="https://open.spotify.com/user/21ekd643rqqyxhssbnqjycrfy?si=f6f29d6814664eab">Spotify:</a>
          </h2>
          <section class="lastfm-section">
            <div id="lastfm-container"></div>
          </section>
        </div>
      </div>
    </div>

    <!-- Letterboxd and Mastodon section -->
    <div class="bottom-containers first-row">
      <div class="main-container letterboxd-container-wrapper">
        <h2><a href="https://boxd.it/9uosP">Letterboxd:</a></h2>
        <section class="letterboxd-section">
          <div id="letterboxd-container"></div>
        </section>
      </div>

      <div class="main-container mastodon-container">
        <h2><a href="https://mastodon.social/@copaco">Mastodon:</a></h2>
        <section class="mastodon-section">
          <div class="mastodon-feed-wrapper">
            <a class="mastodon-feed" href="https://mastodon.social/@copaco" data-toot-limit="3">follow me into the Fediverse</a>
          </div>
          <a href="https://mastodon.social/@copaco" class="mastodon-view-more" target="_blank" rel="noopener noreferrer">
            Ver más en mi perfil →
          </a>
        </section>
      </div>

      <div class="main-container">
        <img v-for="n in 10" :key="n" src="/images/under_construction_header.gif" alt="Espacio en construcción" style="width:100%;border-radius:8px;">
      </div>
    </div>

    <!-- Uses, Shrine and Now section -->
    <div class="bottom-containers">
      <div class="main-container uses-container">
        <h2>Cosillas que uso:</h2>
        <div class="uses-content">
          <div class="uses-section">
            <h3>Software</h3>
            <ul>
              <li><strong>Navegador:</strong> LibreWolf + Firefox (Chromium si no queda remedio)</li>
              <li><strong>Correo:</strong> Proton Mail</li>
              <li><strong>Buscador:</strong> Qwant</li>
              <li><strong>Cliente torrent:</strong> qBittorrent</li>
              <li><strong>OS:</strong> Windows (<a href="https://github.com/ravendevteam/talon">Talon</a> para debloatear) + Arch Linux</li>
              <li><strong>Para leer:</strong> <a href="https://github.com/readest/readest">Readest</a> (lo que mejor me ha funcionado)</li>
              <li><strong>Youtube:</strong> En ordenador las tipicas extensiones guays PERO EN ANDROID TV <a href="https://github.com/yuliskov/SmartTube">SmartTube</a> (cliente sin anuncios)</li>
            </ul>
          </div>
          <div class="uses-section">
            <h3>Webs guays</h3>
            <ul>
              <li><strong>Descargar juegos:</strong> <a href="https://fitgirl-repacks.site/">FitGirl Repacks</a> / <a href="https://dodi-repacks.site/">Dodi</a></li>
              <li><strong>Activar Windows:</strong> <a href="https://github.com/massgravel/Microsoft-Activation-Scripts">MAS</a> (mola mucho y también activa office pero eso no lo he probado)</li>
              <li><strong>Desbloquear DLC steam:</strong> <a href="https://github.com/acidicoala/SmokeAPI">SmokeAPI</a> y a lo mejor necesitas <a href="https://cs.rin.ru/forum/">cs.rin.ru</a></li>
              <li><strong>Descargar juegos online:</strong> <a href="https://online-fix.me/">Online-Fix</a></li>
              <li><strong>Descargar Pelis/Software:</strong> La piratebay!!!! (merece mucho la pena los <a href="https://github.com/qbittorrent/search-plugins/wiki/Unofficial-search-plugins">plugins de qbittorrent</a>)</li>
              <li><strong>Menciones honorables:</strong> <a href="https://fmhy.net/">esta pedazo de web</a> que me pasó un amigo</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="main-container shrine-container">
        <h2>Altar:</h2>
        <div id="moodboard" class="moodboard-area">
          <div class="moodboard-item" style="top: 7%; left: 9%;" data-rotation="-5">
            <img src="/images/gato.escuchando.gif" alt="Item del altar">
            <div class="pin"></div>
          </div>
          <div class="moodboard-item" style="top: 45%; left: 10%;" data-rotation="8">
            <img src="https://mdtheatreguide.com/wp-content/uploads/2023/04/01_LES_MIS_TOUR_2022_S2_4793_MM_EDIT_RESIZE-768x511-1.jpg" alt="Item del altar">
            <div class="pin"></div>
          </div>
          <div class="moodboard-item" style="top: 25%; left: 55%;" data-rotation="-3">
            <img src="/images/fallout.jpg" alt="Item del altar">
            <div class="pin"></div>
          </div>
          <div class="moodboard-item" style="top: 8%; left: 55%;" data-rotation="12">
            <img src="/legacy/images/logoministerioMOD.png" alt="Item del altar">
            <div class="pin"></div>
          </div>
          <div class="moodboard-item" style="top: 70%; left: 19%;" data-rotation="-5">
            <img src="/images/patos.jpg" alt="Item del altar">
            <div class="pin"></div>
          </div>
          <div class="moodboard-item" style="top: 55%; left: 60%;" data-rotation="8">
            <img src="/images/sos.jpg" alt="Item del altar">
            <div class="pin"></div>
          </div>
        </div>
      </div>

      <div class="main-container now-container">
        <h2>Qué hago ahora:</h2>
        <div class="now-content">
          <p class="now-date">Actualizado: 20 de octubre de 2025</p>
          <div class="now-section">
            <h3>Leyendo</h3>
            <ul>
              <li>"The palestine laboratory" - Antony Loewenstein</li>
            </ul>
          </div>
          <div class="now-section">
            <h3>Viendo</h3>
            <ul>
              <li>Me estoy viendo la de Weeds que es como si breaking bad y modern family tuvieran un hijo que odian</li>
              <li>Smiling friends la temporada nueva</li>
            </ul>
          </div>
          <div class="now-section">
            <h3>Jugando</h3>
            <ul>
              <li>Baldur's Gate 3 como ansia oscura</li>
              <li>Stellaris</li>
              <li>Y esperando a que en nada saquen <a href="https://store.steampowered.com/app/3315530/Crusader_Kings_III_All_Under_Heaven/">el nuevo dlc del crusader kings 3</a></li>
            </ul>
          </div>
          <div class="now-section">
            <h3>Otros</h3>
            <ul>
              <li>Haciendo un caldo perpetuo</li>
              <li>Esta web</li>
              <li>La extensión de Moodle</li>
              <li>Estudiando (a lo mejor)</li>
              <li>Leyendo/Editando wikipedia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Bats, Chatango and Badges section -->
    <div class="bottom-containers">
      <div class="main-container bats-container">
        <h2>
          <p><a class="link-button bat-counter" href="#" @click.prevent="addBat">Murciélago</a></p>
        </h2>
        <div id="bats-bouncing-area">
          <img src="/legacy/images/ANI3DbatHover.gif" class="bouncing-bat" id="bat1" alt="Murciélago animado">
          <img src="/legacy/images/ANI3DbatHover.gif" class="bouncing-bat" id="bat2" alt="Murciélago animado">
        </div>
      </div>

      <div class="main-container chat-container" aria-label="chatango-chat" style="padding-top: 18px;display:flex;flex-direction:column;align-items:stretch;justify-content:center;">
        <p style="opacity: 0.8;margin-top: 0;margin-bottom: 7px;font-size: 14px;">preguntame lo que quieras, pideme lo que quieras, di lo que quieras o deja un mensaje para otros visitantes; el chat es anónimo.</p>
        <div class="chatango-wrapper" style="height:250px;min-height:160px;">
          <div id="chatango-container" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <div class="main-container badges-container" aria-label="badges">
        <div class="badges-grid">
          <img src="/images/getfirefox.gif" alt="Get Firefox badge" loading="lazy">
          <img src="/images/fucknazis.gif" alt="Badge" loading="lazy">
          <img src="/images/lesmiz.png" alt="Badge" loading="lazy">
          <img src="/images/genitals.gif" alt="Badge" loading="lazy">
          <img src="/images/nerd.gif" alt="Badge" loading="lazy">
          <img src="/images/bald10.gif" alt="Badge" loading="lazy">
          <img src="/images/8015_familyguy.png" alt="Badge" loading="lazy">
          <img src="/images/0028-computer.gif" alt="Badge" loading="lazy">
          <img src="/images/bestviewedcomp.gif" alt="Badge" loading="lazy">
          <img src="/images/archlinux.gif" alt="Badge" loading="lazy">
          <img src="/images/745784dfedrf30su.gif" alt="Badge" loading="lazy">
          <img src="/images/firefox1.gif" alt="Badge" loading="lazy">
          <img src="/images/jellyfin.gif" alt="Badge" loading="lazy">
          <img src="/images/vlc.png" alt="Badge" loading="lazy">
          <img src="/images/water.gif" alt="Badge" loading="lazy">
          <img src="/images/anythingbut.gif" alt="Badge" loading="lazy">
          <img src="/images/antifa.gif" alt="Badge" loading="lazy">
          <img src="/images/theythemsnail.jpg" alt="Badge" loading="lazy">
          <img src="/images/queer.png" alt="Badge" loading="lazy">
          <img src="/images/graphicdesign.png" alt="Badge" loading="lazy">
          <img src="/images/nonbinary.gif" alt="Badge" loading="lazy">
          <img src="/images/Piracyblinkie.gif" alt="Badge" loading="lazy">
          <img src="/images/wrenderblinkie.gif" alt="Badge" loading="lazy">
          <img src="/images/gec.gif" alt="Badge" loading="lazy">
          <img src="/images/lovebugs.gif" alt="Badge" loading="lazy">
        </div>
      </div>
    </div>

    <a href="https://www.cursors-4u.com/cursor/2012/01/29/pink-bobblehead-bunny.html" target="_blank" title="Pink Bobblehead Bunny">
      <img src="/images/cursor.png" border="0" alt="Pink Bobblehead Bunny" style="position:absolute; top: 0px; right: 0px;" />
    </a>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const streakDays = ref('Cargando...')
let lastfmInterval = null
let batsInstance = null

const calculateStreak = () => {
  const streakStartDate = new Date('2023-12-09')
  const today = new Date()
  const diffTime = Math.abs(today - streakStartDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  streakDays.value = diffDays
}

const triggerScreamer = () => {
  const bg = document.getElementById('bg-blur')
  if (!bg) return
  
  const prevBackground = bg.style.backgroundImage || ''
  const prevFilter = bg.style.filter || ''
  const prevOpacity = bg.style.opacity || ''
  
  bg.style.backgroundImage = "url('/images/screamer.gif')"
  bg.style.filter = 'none'
  bg.style.opacity = '1'
  
  setTimeout(() => {
    bg.style.backgroundImage = prevBackground
    bg.style.filter = prevFilter
    bg.style.opacity = prevOpacity
  }, 5000)
}

const addBat = () => {
  if (batsInstance) {
    batsInstance.addNewBat()
  }
}

const loadOtherScripts = () => {
  if (typeof window === 'undefined') return

  const scripts = [
    '/composables/zipbomb.js',
    '/composables/moodboard.js',
    '/composables/oneko.js',
    '/composables/badges-marquee.js'
  ]

  scripts.forEach(src => {
    const script = document.createElement('script')
    script.src = src
    script.defer = true
    document.body.appendChild(script)
  })

  // Chatango
  setTimeout(() => {
    const cfg = {"handle":"cald0","arch":"js","styles":{"c":"000000","d":"000000","f":0,"i":0,"l":"FFFFFF","m":"FFFFFF","p":"10","usricon":0,"surl":0,"cnrs":"0.48"}}
    const s = document.createElement('script')
    s.id = 'cid0020000420850072125'
    s.setAttribute('data-cfasync','false')
    s.async = true
    s.src = '//st.chatango.com/js/gz/emb.js'
    s.style.width = '100%'
    s.style.height = '100%'
    s.text = JSON.stringify(cfg)
    const mount = document.getElementById('chatango-container')
    if(mount) mount.appendChild(s)
  }, 1000)

  // Apply color to links
  setTimeout(() => {
    document.querySelectorAll('a').forEach(el => {
      let existing = el.getAttribute('style') || ''
      if (/\bcolor\s*:/i.test(existing)) {
        existing = existing.replace(/color\s*:\s*[^;]+;?/i, 'color: beige;')
      } else {
        if (existing && existing.trim() && !/;\s*$/.test(existing)) existing += ';'
        existing += 'color: beige;'
      }
      el.setAttribute('style', existing)
    })
  }, 500)
}

onMounted(() => {
  // Duolingo streak
  calculateStreak()
  setInterval(calculateStreak, 86400000)
  
  // Last.fm integration
  const { startLastfmUpdates } = useLastfm()
  lastfmInterval = startLastfmUpdates(10000)
  
  // GitHub README
  const { loadReadme } = useGithubReadme()
  loadReadme()
  
  // Letterboxd
  const { fetchLetterboxdActivity } = useLetterboxd()
  fetchLetterboxdActivity()
  
  // Bats animation
  const { initBats, addNewBat, cleanup } = useBats()
  batsInstance = { initBats, addNewBat, cleanup }
  setTimeout(() => initBats(), 100)
  
  // Other scripts
  loadOtherScripts()
})

onUnmounted(() => {
  if (lastfmInterval) {
    clearInterval(lastfmInterval)
  }
  if (batsInstance) {
    batsInstance.cleanup()
  }
})
</script>
