(function () {
  'use strict';

  var isMobile = function () { return window.matchMedia('(max-width: 700px)').matches; };

  // ---------------------------------------------------------------------------
  // Estado y persistencia de ventanas
  // ---------------------------------------------------------------------------
  var LS_WINDOWS = 'carlos-windows';
  var LS_THEME = 'carlos-theme';

  var desktop = document.getElementById('desktop');
  var windows = {}; // nombre -> { el, name }
  var zCounter = 10;

  // ventanas que nunca se cierran / no aparecen como tab de cierre
  var ALWAYS_OPEN = { mapa: true };

  document.querySelectorAll('.window').forEach(function (el) {
    var key = el.id.replace('win-', '');
    windows[key] = { el: el, name: el.dataset.nombre };
  });

  function loadWindowState() {
    try { return JSON.parse(localStorage.getItem(LS_WINDOWS)) || {}; }
    catch (e) { return {}; }
  }
  function saveWindowState() {
    var state = {};
    Object.keys(windows).forEach(function (key) {
      var el = windows[key].el;
      state[key] = {
        open: !el.hidden,
        left: el.style.left || null,
        top: el.style.top || null
      };
    });
    try { localStorage.setItem(LS_WINDOWS, JSON.stringify(state)); } catch (e) {}
  }

  function bringToFront(key) {
    Object.keys(windows).forEach(function (k) {
      windows[k].el.classList.toggle('focused', k === key);
    });
    zCounter += 1;
    windows[key].el.style.zIndex = zCounter;
  }

  function openWindow(key, focus) {
    var w = windows[key];
    if (!w) return;
    w.el.hidden = false;
    if (focus !== false) bringToFront(key);
    syncUI();
    saveWindowState();
  }

  function closeWindow(key) {
    if (ALWAYS_OPEN[key]) return;
    windows[key].el.hidden = true;
    windows[key].el.classList.remove('focused');
    syncUI();
    saveWindowState();
  }

  function toggleWindow(key) {
    var w = windows[key];
    if (!w) return;
    if (w.el.hidden) {
      openWindow(key, true);
    } else if (w.el.classList.contains('focused')) {
      // ya enfocada -> en escritorio no hacemos nada; en móvil hacemos scroll
      if (isMobile()) w.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      bringToFront(key);
      if (isMobile()) w.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------------------------------------------------------------------------
  // Drag de ventanas por su titlebar
  // ---------------------------------------------------------------------------
  function makeDraggable(key) {
    var el = windows[key].el;
    var bar = el.querySelector('.titlebar');
    if (!bar) return;
    var dragging = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;

    bar.addEventListener('pointerdown', function (ev) {
      if (isMobile()) return;
      if (ev.target.closest('.tb-btn')) return;
      dragging = true;
      bar.setPointerCapture(ev.pointerId);
      bar.style.cursor = 'grabbing';
      bringToFront(key);
      var rect = el.getBoundingClientRect();
      var deskRect = desktop.getBoundingClientRect();
      // Fijar left/top absolutos actuales (por si estaban en right/bottom)
      origLeft = rect.left - deskRect.left;
      origTop = rect.top - deskRect.top;
      el.style.left = origLeft + 'px';
      el.style.top = origTop + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      startX = ev.clientX;
      startY = ev.clientY;
      ev.preventDefault();
    });

    bar.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - startX;
      var dy = ev.clientY - startY;
      var deskRect = desktop.getBoundingClientRect();
      var maxLeft = deskRect.width - 40;
      var maxTop = deskRect.height - 30;
      var newLeft = Math.min(Math.max(origLeft + dx, -el.offsetWidth + 60), maxLeft);
      var newTop = Math.min(Math.max(origTop + dy, 0), maxTop);
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    });

    function endDrag(ev) {
      if (!dragging) return;
      dragging = false;
      bar.style.cursor = 'grab';
      try { bar.releasePointerCapture(ev.pointerId); } catch (e) {}
      saveWindowState();
    }
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);
  }

  // ---------------------------------------------------------------------------
  // UI derivada: explorador-mapa, tabs de taskbar
  // ---------------------------------------------------------------------------
  var treeItems = document.querySelectorAll('.tree-item');
  var tabsContainer = document.getElementById('tabs-ventanas');

  function syncUI() {
    // Árbol: marca abiertas
    treeItems.forEach(function (item) {
      var key = item.dataset.abre;
      var w = windows[key];
      var open = w && !w.el.hidden;
      item.classList.toggle('open', !!open);
      var labels = {
        perfil: 'perfil', musica: 'música', mastodon: 'mastodon',
        pelis: 'pelis_vistas', links: 'links'
      };
      item.textContent = '📂 ' + (labels[key] || key) + (open ? ' ✓' : '');
    });

    // Tabs de taskbar: una por ventana abierta (excepto mapa que es fija)
    tabsContainer.innerHTML = '';
    Object.keys(windows).forEach(function (key) {
      if (key === 'mapa') return;
      var w = windows[key];
      if (w.el.hidden) return;
      var tab = document.createElement('button');
      tab.className = 'tab-ventana';
      if (w.el.classList.contains('focused')) tab.classList.add('pressed');
      tab.textContent = w.name;
      tab.addEventListener('click', function () { toggleWindow(key); syncUI(); });
      tabsContainer.appendChild(tab);
    });
  }

  // Clics en el árbol
  treeItems.forEach(function (item) {
    item.addEventListener('click', function () {
      openWindow(item.dataset.abre, true);
    });
  });

  // Botones cerrar
  document.querySelectorAll('.tb-btn[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var win = btn.closest('.window');
      closeWindow(win.id.replace('win-', ''));
    });
  });
  // Botón minimizar del mapa (no cierra; solo lo trae al frente para simplicidad)
  document.querySelectorAll('.tb-btn:not([data-close])').forEach(function (btn) {
    btn.addEventListener('click', function (ev) { ev.stopPropagation(); });
  });

  // Traer al frente al clicar cualquier ventana
  Object.keys(windows).forEach(function (key) {
    windows[key].el.addEventListener('pointerdown', function () {
      if (!isMobile()) { bringToFront(key); syncUI(); }
    });
    makeDraggable(key);
  });

  // ---------------------------------------------------------------------------
  // Restaurar estado o valores por defecto
  // ---------------------------------------------------------------------------
  function restoreWindows() {
    var saved = loadWindowState();
    var defaults = ['perfil', 'musica', 'mastodon']; // abiertas por defecto (7b)
    Object.keys(windows).forEach(function (key) {
      if (key === 'mapa') { windows.mapa.el.hidden = false; return; }
      var s = saved[key];
      if (s) {
        windows[key].el.hidden = !s.open;
        if (s.left && !isMobile()) {
          windows[key].el.style.left = s.left;
          windows[key].el.style.top = s.top;
          windows[key].el.style.right = 'auto';
          windows[key].el.style.bottom = 'auto';
        }
      } else {
        windows[key].el.hidden = defaults.indexOf(key) === -1;
      }
    });
    // En móvil forzamos abiertas las 4 ventanas del layout CE
    if (isMobile()) {
      ['musica', 'links', 'pelis', 'mastodon'].forEach(function (k) {
        windows[k].el.hidden = false;
      });
    }
    bringToFront('mastodon');
    syncUI();
  }

  // ---------------------------------------------------------------------------
  // Links (grid de iconos)
  // ---------------------------------------------------------------------------
  var LOGO = '/carlos-design-system/assets/logos/';
  var LINKS = [
    { name: 'letterboxd', url: 'https://boxd.it/9uosP', color: '#ff8000', logo: 'letterboxd-svgrepo-com.svg' },
    { name: 'steam', url: 'https://steamcommunity.com/id/poopoopeepeeheehee/', color: '#2a475e', logo: 'steam.svg' },
    { name: 'insta', url: 'https://www.instagram.com/testriculo/', color: '#ff0069', logo: 'instagram-svgrepo-com.svg' },
    { name: 'discord', url: 'https://discordapp.com/users/357955189149532161', color: '#7289da', logo: 'discord-svgrepo-com.svg' },
    { name: 'mastodon', url: 'https://mastodon.social/@copaco', color: '#6364FF', logo: 'mastodon-simple-svgrepo-com.svg' },
    { name: 'bluesky', url: 'https://bsky.app/profile/koljoz.bsky.social', color: '#1185FE', logo: 'Bluesky_Logo.svg' },
    { name: 'email', url: 'mailto:metricas_mensulas.0p@icloud.com', color: '#8a8a8a', logo: 'email-svgrepo-com.svg' },
    { name: 'github', url: 'https://github.com/carmoran0', color: '#6e5494', logo: 'github.svg' },
    { name: 'last.fm', url: 'https://www.last.fm/user/sobaco27', color: '#D51007', logo: 'lastfm-svgrepo-com.svg' },
    { name: 'sndcloud', url: 'https://soundcloud.com/koljoz', color: '#FF5500', logo: 'soundcloud.svg' }
  ];
  function iconHTML(link, size, onDark) {
    var a = document.createElement('a');
    a.className = 'desktop-icon' + (onDark ? ' on-dark' : '');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener';
    var box = document.createElement('span');
    box.className = 'icon-box';
    box.style.width = size + 'px';
    box.style.height = size + 'px';
    box.style.background = link.color;
    var img = document.createElement('img');
    img.src = LOGO + link.logo;
    img.alt = '';
    img.style.width = Math.round(size * 0.53) + 'px';
    box.appendChild(img);
    var label = document.createElement('span');
    label.className = 'icon-label';
    label.textContent = link.name;
    a.appendChild(box);
    a.appendChild(label);
    return a;
  }
  var linksGrid = document.getElementById('links-grid');
  LINKS.forEach(function (l) { linksGrid.appendChild(iconHTML(l, 44, false)); });

  // Accesos directos del escritorio (letterboxd, github, last.fm)
  var atajos = document.getElementById('atajos');
  ['letterboxd', 'github', 'last.fm'].forEach(function (name) {
    var link = LINKS.filter(function (l) { return l.name === name; })[0];
    atajos.appendChild(iconHTML(link, 38, true));
  });

  // ---------------------------------------------------------------------------
  // Last.fm (now playing + scrobbles)
  // ---------------------------------------------------------------------------
  function formatDuration(ms) {
    var totalSec = Math.round(Number(ms) / 1000);
    if (!totalSec) return '';
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function renderHistorial(tracks, key) {
    var el = document.getElementById('musica-historial');
    if (!el) return;
    el.innerHTML = '';
    tracks.forEach(function (track, i) {
      var artist = (track.artist && (track.artist['#text'] || track.artist)) || '';
      var name = track.name || '';
      var div = document.createElement('div');
      div.className = 'historial-linea';
      div.textContent = String(i + 1).padStart(2, '0') + '. ' + artist + ' — ' + name;
      el.appendChild(div);
      var infoUrl = 'https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=' +
        encodeURIComponent(artist) + '&track=' + encodeURIComponent(name) +
        '&api_key=' + key + '&format=json';
      fetch(infoUrl).then(function (r) { return r.json(); }).then(function (info) {
        var dur = info && info.track && info.track.duration;
        if (dur && Number(dur) > 0) div.textContent += ' — ' + formatDuration(dur);
      }).catch(function () {});
    });
  }

  function initLastfm() {
    var key = (document.querySelector('meta[name="lastfm-api-key"]') || {}).content;
    if (!key) return;
    var user = 'sobaco27';
    var url = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' +
      user + '&api_key=' + key + '&format=json&limit=4';
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var rt = data && data.recenttracks;
      var list = rt && rt.track && (Array.isArray(rt.track) ? rt.track : [rt.track]);
      if (!list || !list.length) return;
      var track = list[0];
      var artist = (track.artist && (track.artist['#text'] || track.artist)) || '';
      var name = track.name || '';
      var nowPlaying = track['@attr'] && track['@attr'].nowplaying;
      var prefix = nowPlaying ? '♪ ' : '♪ (últ.) ';
      document.getElementById('musica-marquee').textContent =
        (prefix + artist + ' — ' + name + ' ♪').toUpperCase();
      var total = rt['@attr'] && rt['@attr'].total;
      if (total) {
        document.getElementById('musica-scrobbles').textContent =
          Number(total).toLocaleString('es-ES') + ' scrobbles';
      }
      // Carátula
      var imgs = track.image || [];
      var big = imgs.filter(function (i) { return i.size === 'large' || i.size === 'extralarge'; });
      var src = big.length ? big[big.length - 1]['#text'] : '';
      if (src) document.getElementById('musica-caratula').src = src;
      // Últimas escuchadas
      renderHistorial(list.slice(1, 4), key);
    }).catch(function () {
      document.getElementById('musica-marquee').textContent = '♪ LAST.FM NO DISPONIBLE ♪';
    });
  }

  // ---------------------------------------------------------------------------
  // Mastodon (último toot de @copaco)
  // ---------------------------------------------------------------------------
  function initMastodon() {
    var tootEl = document.getElementById('mastodon-toot');
    fetch('https://mastodon.social/api/v1/accounts/lookup?acct=copaco')
      .then(function (r) { return r.json(); })
      .then(function (acc) {
        if (!acc || !acc.id) throw new Error('sin cuenta');
        return fetch('https://mastodon.social/api/v1/accounts/' + acc.id +
          '/statuses?limit=1&exclude_replies=true&exclude_reblogs=true');
      })
      .then(function (r) { return r.json(); })
      .then(function (statuses) {
        var s = statuses && statuses[0];
        if (!s) { tootEl.textContent = 'sin toots recientes.'; return; }
        var tmp = document.createElement('div');
        tmp.innerHTML = s.content;
        var texto = (tmp.textContent || '').trim() || '(sin texto)';
        var fecha = relativeTime(new Date(s.created_at));
        tootEl.textContent = 'último toot: ' + texto + ' ';
        var span = document.createElement('span');
        span.className = 'toot-fecha';
        span.textContent = '· ' + fecha;
        tootEl.appendChild(span);
        document.querySelector('#win-mastodon .responder').href = s.url || 'https://mastodon.social/@copaco';
      })
      .catch(function () { tootEl.textContent = 'no se pudo cargar el último toot.'; });
  }

  function relativeTime(date) {
    var diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'hace instantes';
    if (diff < 3600) return 'hace ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'hace ' + Math.floor(diff / 3600) + ' h';
    return 'hace ' + Math.floor(diff / 86400) + ' d';
  }

  // ---------------------------------------------------------------------------
  // Letterboxd (pósters vía RSS + proxy CORS)
  // ---------------------------------------------------------------------------
  var PROXIES = [
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  function fetchProxy(url) {
    var i = 0;
    function attempt() {
      if (i >= PROXIES.length) return Promise.reject(new Error('proxies agotados'));
      var p = PROXIES[i++];
      return fetch(p + encodeURIComponent(url)).then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.text();
      }).catch(attempt);
    }
    return attempt();
  }
  function initLetterboxd() {
    var fila = document.getElementById('pelis-fila');
    fetchProxy('https://letterboxd.com/klamstrakur0/rss/').then(function (text) {
      var xml = new DOMParser().parseFromString(text, 'text/xml');
      var items = Array.prototype.slice.call(xml.querySelectorAll('item')).slice(0, 12);
      if (!items.length) { fila.textContent = 'sin actividad reciente.'; return; }
      fila.innerHTML = '';
      items.forEach(function (item) {
        var get = function (tag) { var n = item.querySelector(tag); return n ? n.textContent : ''; };
        var title = get('title') || 'película';
        var link = get('link') || 'https://boxd.it/9uosP';
        var desc = get('description') || '';
        var imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
        var rating = (title.match(/(★+½?|½)/) || [''])[0];
        var cleanTitle = title.replace(/\s*-\s*(★+½?|½).*$/, '').replace(/,\s*\d{4}.*$/, '');

        var a = document.createElement('a');
        a.className = 'peli';
        a.href = link; a.target = '_blank'; a.rel = 'noopener';
        if (imgMatch) {
          var img = document.createElement('img');
          img.src = imgMatch[1]; img.alt = cleanTitle; img.loading = 'lazy';
          a.appendChild(img);
        } else {
          var ph = document.createElement('div');
          ph.className = 'poster-placeholder';
          a.appendChild(ph);
        }
        var t = document.createElement('span');
        t.className = 'peli-titulo';
        t.textContent = cleanTitle;
        a.appendChild(t);
        if (rating) {
          var st = document.createElement('span');
          st.className = 'peli-estrellas';
          st.textContent = rating;
          a.appendChild(st);
        }
        fila.appendChild(a);
      });
    }).catch(function () {
      fila.textContent = 'no se pudo cargar letterboxd.';
    });
  }

  // ---------------------------------------------------------------------------
  // Reloj + bandeja
  // ---------------------------------------------------------------------------
  function tickClock() {
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    var txt = hh + ':' + mm;
    var relojes = [document.getElementById('reloj'), document.querySelector('#topbar-ce .ce-reloj')];
    relojes.forEach(function (el) { if (el) el.textContent = txt; });
  }

  // ---------------------------------------------------------------------------
  // Panel de control (temas)
  // ---------------------------------------------------------------------------
  function loadTheme() {
    try { return JSON.parse(localStorage.getItem(LS_THEME)) || {}; }
    catch (e) { return {}; }
  }
  function applyTheme(theme) {
    var fondo = theme.fondo || 'teal';
    var combo = theme.combo || 'clasico';
    document.body.setAttribute('data-fondo', fondo);
    var html = document.documentElement;
    html.classList.remove('theme-ciruela', 'theme-verde', 'theme-contraste');
    if (combo === 'ciruela') html.classList.add('theme-ciruela');
    else if (combo === 'verde') html.classList.add('theme-verde');
    else if (combo === 'contraste') html.classList.add('theme-contraste');
  }
  function saveTheme(theme) {
    try { localStorage.setItem(LS_THEME, JSON.stringify(theme)); } catch (e) {}
  }

  function initPanel() {
    var current = loadTheme();
    var draft = { fondo: current.fondo || 'teal', combo: current.combo || 'clasico' };
    applyTheme(current);

    var fondos = document.querySelectorAll('#panel-fondos .panel-opcion');
    var combos = document.querySelectorAll('#panel-combos .panel-opcion');
    var monitor = document.getElementById('monitor-preview');

    function refresh() {
      fondos.forEach(function (b) { b.classList.toggle('pressed', b.dataset.fondo === draft.fondo); });
      combos.forEach(function (b) { b.classList.toggle('pressed', b.dataset.combo === draft.combo); });
      // preview del monitor
      var bg = {
        teal: 'radial-gradient(circle at 50% 35%, #2c6e6a, #17383c 70%, #0d2225)',
        ciruela: 'radial-gradient(circle at 50% 35%, #6a2c5e, #3c1738 80%)',
        navy: 'radial-gradient(circle at 50% 35%, #2c3e6a, #17203c 80%)',
        cuadros: 'repeating-conic-gradient(#008080 0 25%, #006666 0 50%)'
      }[draft.fondo];
      monitor.style.background = bg;
      monitor.style.backgroundSize = draft.fondo === 'cuadros' ? '12px 12px' : 'auto';
    }
    refresh();

    fondos.forEach(function (b) {
      b.addEventListener('click', function () { draft.fondo = b.dataset.fondo; refresh(); });
    });
    combos.forEach(function (b) {
      b.addEventListener('click', function () { draft.combo = b.dataset.combo; refresh(); });
    });

    document.getElementById('panel-aplicar').addEventListener('click', function () {
      applyTheme(draft);
      saveTheme(draft);
      closeWindow('panel');
    });
    document.getElementById('panel-cancelar').addEventListener('click', function () {
      draft = { fondo: current.fondo || 'teal', combo: current.combo || 'clasico' };
      refresh();
      closeWindow('panel');
    });
  }

  // ---------------------------------------------------------------------------
  // Menú Inicio
  // ---------------------------------------------------------------------------
  function initStartMenu() {
    var menu = document.getElementById('menu-inicio');
    var btn = document.getElementById('btn-inicio');
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      menu.hidden = !menu.hidden;
      btn.classList.toggle('pressed', !menu.hidden);
    });
    document.addEventListener('click', function () {
      menu.hidden = true; btn.classList.remove('pressed');
    });
    menu.addEventListener('click', function (ev) { ev.stopPropagation(); });
    menu.querySelectorAll('.menu-item[data-abre]').forEach(function (item) {
      item.addEventListener('click', function () {
        openWindow(item.dataset.abre, true);
        menu.hidden = true; btn.classList.remove('pressed');
      });
    });
    document.getElementById('menu-grub').addEventListener('click', function () {
      window.location.href = '/';
    });
  }

  // ---------------------------------------------------------------------------
  // Asistente clippy-gato
  // ---------------------------------------------------------------------------
  var TIPS = [
    'Parece que estás visitando mi web. Prueba a arrastrar las ventanas por su barra de título.',
    '¿Sabías que el panel_de_control.exe puede cambiar el tema? Prueba "Verde fósforo".',
    'Las ventanas recuerdan dónde las dejaste. Vuelve cuando quieras.',
    'El explorador de la izquierda es el mapa del sitio. Un ✓ significa que la ventana está abierta.',
    'Si te aburres, mira mis pelis en la ventana pelis_vistas 🎬.'
  ];
  function initAssistant() {
    var asistente = document.getElementById('asistente');
    var texto = document.getElementById('asistente-texto');
    var idx = 0;
    texto.textContent = TIPS[0];
    asistente.querySelector('.cerrar-asistente').addEventListener('click', function () {
      asistente.hidden = true;
      // reaparece con un tip nuevo tras un rato
      setTimeout(function () {
        idx = (idx + 1) % TIPS.length;
        texto.textContent = TIPS[idx];
        asistente.hidden = false;
      }, 45000);
    });
    // rotar tips periódicamente si sigue abierto
    setInterval(function () {
      if (asistente.hidden) return;
      idx = (idx + 1) % TIPS.length;
      texto.textContent = TIPS[idx];
    }, 30000);
  }

  // ---------------------------------------------------------------------------
  // Salvapantallas (2 min de inactividad)
  // ---------------------------------------------------------------------------
  function initScreensaver() {
    if (isMobile()) return;
    var saver = document.getElementById('salvapantallas');
    var flot = document.getElementById('salva-flotante');
    var idle = null, raf = null;
    var x = 100, y = 100, dx = 2, dy = 1.4;

    function animate() {
      var w = window.innerWidth - flot.offsetWidth;
      var h = window.innerHeight - flot.offsetHeight;
      x += dx; y += dy;
      if (x <= 0 || x >= w) dx = -dx;
      if (y <= 0 || y >= h) dy = -dy;
      x = Math.max(0, Math.min(x, w));
      y = Math.max(0, Math.min(y, h));
      flot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      raf = requestAnimationFrame(animate);
    }
    function start() {
      if (isMobile()) return;
      saver.hidden = false;
      animate();
    }
    function stop() {
      saver.hidden = true;
      if (raf) cancelAnimationFrame(raf);
    }
    function reset() {
      if (!saver.hidden) stop();
      clearTimeout(idle);
      idle = setTimeout(start, 120000);
    }
    ['pointermove', 'keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, reset, { passive: true });
    });
    saver.addEventListener('pointerdown', stop);
    reset();
  }

  // ---------------------------------------------------------------------------
  // Móvil: barra superior y botón ▲
  // ---------------------------------------------------------------------------
  function initMobileExtras() {
    var arriba = document.getElementById('btn-arriba');
    if (arriba) {
      arriba.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Arranque
  // ---------------------------------------------------------------------------
  restoreWindows();
  initStartMenu();
  initPanel();
  initAssistant();
  initScreensaver();
  initMobileExtras();
  tickClock();
  setInterval(tickClock, 15000);
  initLastfm();
  initMastodon();
  initLetterboxd();

  // Re-evaluar layout al cruzar el breakpoint
  var wasMobile = isMobile();
  window.addEventListener('resize', function () {
    var now = isMobile();
    if (now !== wasMobile) { wasMobile = now; restoreWindows(); }
  });
})();
