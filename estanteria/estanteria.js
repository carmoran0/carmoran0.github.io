// Estantería: lee /estanteria/libros.json y completa lo que falte con Open Library.
// Campos de cada libro: title (obligatorio), author, pages, year, date ('AAAA' | 'AAAA-MM'),
// rating (0–5, admite .5), review, color (0–8), cover (id de Open Library), reading (true),
// pending (true: va a la pila «Por leer»), slug (enlace directo /estanteria/#slug; por defecto sale del título)
// y ol (clave de Open Library, '/works/…'; si el campo está, aunque sea null, no se consulta Open Library).
(function () {
  const PALETTE = [
    ['oklch(0.5 0.12 35)', '#f7f3ec'], ['oklch(0.7 0.11 80)', '#1a1a1a'], ['oklch(0.5 0.08 125)', '#f7f3ec'],
    ['oklch(0.42 0.07 160)', '#f7f3ec'], ['oklch(0.47 0.07 215)', '#f7f3ec'], ['oklch(0.36 0.07 262)', '#f7f3ec'],
    ['oklch(0.42 0.08 335)', '#f7f3ec'], ['#232220', '#f7f3ec'], ['oklch(0.92 0.03 85)', '#1a1a1a']
  ];
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const OL_CACHE = 'carlos-shelf-ol';
  const THIS_YEAR = new Date().getFullYear();
  // Reparto en baldas: ancho de la placa entre años, del sujetalibros y separación entre piezas. Alto máximo de una pila.
  const SEP_W = 12, END_W = 25, GAP = 2, PILE_MAX = 192;

  const $ = id => document.getElementById(id);
  const h = (tag, props, ...kids) => {
    const e = document.createElement(tag);
    for (const k in props || {}) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
    return e;
  };
  const hash = s => { let n = 7; for (const c of String(s)) n = (n * 31 + c.charCodeAt(0)) | 0; return Math.abs(n); };
  const surname = a => (a || '').trim().split(/\s+/).pop() || '';
  const fmtDate = d => { if (!d) return '—'; const [y, m] = String(d).split('-'); return m ? `${MONTHS[+m - 1]} ${y}` : y; };
  const keyOf = b => `${b.title}|${b.author || ''}`;
  const comma = n => String(n).replace('.', ',');
  const pad2 = n => String(n).padStart(2, '0');
  const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const makeSlugs = l => {
    const seen = {};
    return l.map(b => { const s = slugify(b.slug || b.title) || 'libro'; seen[s] = (seen[s] || 0) + 1; return seen[s] > 1 ? `${s}-${seen[s]}` : s; });
  };
  // Año del separador. El que se está leyendo cuenta como del año actual.
  const groupOf = b => b.reading ? String(THIS_YEAR) : b.date ? String(b.date).slice(0, 4) : 'S/F';

  let RAW = [], SLUGS = [], ol = {}, sort = 'fecha', sel = null, width = 0, fresh = true, list = [];
  const spines = new Map();

  const books = () => RAW.map((b, i) => {
    const o = ol[keyOf(b)] || {};
    return { ...b, id: i, slug: SLUGS[i], pending: !!b.pending && !b.reading, author: b.author || o.author || '', pages: b.pages || o.pages || null, year: b.year || o.year || null, cover: b.cover || o.cover || null, olKey: b.ol || o.key };
  });
  const colorIdx = b => b.color >= 0 ? b.color : hash(b.title + (b.author || '')) % PALETTE.length;
  const dims = b => {
    const p = Math.max(1, +b.pages || 250);
    const j = hash(b.title || '') % 9 - 4;
    const ht = Math.round(146 + Math.min(p, 1100) / 1100 * 66 + j);
    // Nunca menos de 24 px: es el mínimo de un objetivo táctil (WCAG 2.5.8)
    const w = Math.round(Math.min(62, Math.max(24, 14 + p * 0.042)));
    const [bg, fg] = PALETTE[colorIdx(b)];
    return { p, h: ht, w, fs: Math.round(Math.min(17, Math.max(10, w * 0.44))), bg, fg };
  };
  const sorted = l => {
    // Sin fecha al principio. El que se está leyendo, el último de su año (pegado al sujetalibros).
    const dk = b => b.reading ? `${THIS_YEAR}-13` : String(b.date || '0000');
    const by = {
      fecha: (x, y) => dk(x).localeCompare(dk(y)),
      autor: (x, y) => surname(x.author).localeCompare(surname(y.author), 'es'),
      tamano: (x, y) => (+y.pages || 0) - (+x.pages || 0),
      nota: (x, y) => (+y.rating || 0) - (+x.rating || 0),
      color: (x, y) => colorIdx(x) - colorIdx(y) || (+y.pages || 0) - (+x.pages || 0)
    }[sort];
    return [...l].sort(by);
  };

  // Lomo: en la balda es un botón; en la ficha, un bloque con borde completo.
  // El nombre accesible es el texto visible (título y apellido); el autor completo va en el title.
  const spine = (b, d, tag, extra) => h(tag, {
    class: tag === 'button' ? 'lomo' : 'lomo solo',
    style: `width:${d.w}px;height:${d.h}px;background:${d.bg};color:${d.fg};${extra || ''}`,
    ...(tag === 'button' ? { type: 'button', title: tip(b), onclick: () => open(b.id) } : { 'aria-hidden': 'true' })
  },
    h('span', { class: 'fil', 'aria-hidden': 'true' }),
    h('span', { class: 'lt', style: `font-size:${d.fs}px` }, b.title),
    tag === 'button' && b.author ? h('span', { class: 'la' }, surname(b.author)) : null,
    tag === 'button' && b.reading ? h('span', { class: 'cinta', 'aria-hidden': 'true' }) : null,
    tag === 'button' && b.reading ? h('span', { class: 'sr' }, ' (leyendo)') : null
  );
  // Libro tumbado (pila «Por leer»): las medidas de su lomo, giradas. La cabeza (doble filete) queda a la derecha.
  const tumbado = (b, d, len, extra) => h('button', {
    class: 'tumbado', type: 'button', title: tip(b), onclick: () => open(b.id),
    style: `--off:${hash(b.title) % 13}px;width:${len}px;height:${d.w}px;background:${d.bg};color:${d.fg};${extra || ''}`
  },
    h('span', { class: 'ta' }, surname(b.author)),
    h('span', { class: 'tt', style: `font-size:${d.fs}px` }, b.title),
    h('span', { class: 'tf', 'aria-hidden': 'true' }),
    h('span', { class: 'sr' }, ' (por leer)')
  );
  const tip = b => (b.author ? `${b.title} — ${b.author}` : b.title) + (b.reading ? ' (leyendo)' : b.pending ? ' (por leer)' : '');

  function render() {
    const all = books();
    const shelf = sorted(all.filter(b => !b.pending));
    const pend = all.filter(b => b.pending);
    list = [...shelf, ...pend]; // orden de navegación de la ficha: lomos y después la pila

    // Cabecera
    const done = all.filter(b => !b.reading && !b.pending);
    const pages = done.reduce((t, b) => t + (+b.pages || 0), 0);
    const rated = done.filter(b => +b.rating > 0);
    const avg = rated.length ? comma((rated.reduce((t, b) => t + +b.rating, 0) / rated.length).toFixed(1)) : '—';
    $('stats').replaceChildren(...[[done.length, 'leídos'], [pages.toLocaleString('es-ES'), 'páginas'], [avg, 'nota media']]
      .map(([v, k]) => h('div', null, h('b', null, String(v)), h('span', null, k))));

    for (const btn of $('sorts').querySelectorAll('button')) btn.setAttribute('aria-pressed', btn.dataset.k === sort);

    const reading = all.find(b => b.reading);
    $('reading').hidden = !reading;
    if (reading) { $('reading').lastElementChild.textContent = reading.title; $('reading').onclick = () => open(reading.id); }

    // Baldas: tantas como filas hagan falta.
    // Piezas: lomos (+ placa entre años con orden Fecha) + sujetalibros y, al final, la pila.
    // La placa va pegada al lomo que le sigue y el sujetalibros al último lomo: si el bloque no cabe, salta entero.
    const avail = Math.max(120, (width || 900) - 28 - 4);
    const seq = []; let lastG = null;
    for (const b of shelf) {
      const g = sort === 'fecha' ? groupOf(b) : null;
      if (g && lastG && g !== lastG) seq.push({ k: 'sep', g, w: SEP_W, glueNext: true });
      lastG = g;
      seq.push({ k: 'book', b, g, w: dims(b).w });
    }
    if (shelf.length) seq.push({ k: 'end', w: END_W, gluePrev: true });
    const units = [];
    for (let i = 0; i < seq.length; i++) {
      const u = [seq[i]];
      while (i + 1 < seq.length && (seq[i].glueNext || seq[i + 1].gluePrev)) u.push(seq[++i]);
      units.push(u);
    }
    // Pila «Por leer»: si pasa de PILE_MAX de alto, otra pila al lado.
    const piles = []; let pile = [], ph = 0;
    for (const b of pend) {
      const t = dims(b).w;
      if (pile.length && ph + t > PILE_MAX) { piles.push(pile); pile = []; ph = 0; }
      pile.push(b); ph += t - 1;
    }
    if (pile.length) piles.push(pile);
    const lenOf = b => Math.min(dims(b).h, avail - 44);
    piles.forEach((p, pi) => {
      const pw = Math.max(...p.map(lenOf)) + 28;
      units.push([{ k: 'pile', books: p, pi, pw, w: pw + (pi ? 10 : 16) }]);
    });
    const rows = []; let cur = [], used = 0;
    for (const u of units) {
      const w = u.reduce((t, it, j) => t + it.w + (j ? GAP : 0), 0);
      if (cur.length && used + GAP + w > avail) { rows.push(cur); cur = []; used = 0; }
      used += (cur.length ? GAP : 0) + w;
      cur.push(...u);
    }
    if (cur.length) rows.push(cur);
    if (!rows.length) rows.push([]);

    spines.clear();
    let n = 0;
    const anim = () => fresh ? `animation:shelfIn .7s cubic-bezier(.2,.8,.3,1) ${n++ * 90}ms both;` : '';
    const mark = (b, el) => { if (sel === b.id) el.classList.add('sel'); spines.set(b.id, el); return el; };
    $('fondo').replaceChildren(...rows.map(row => {
      const items = row[0] && row[0].k === 'sep' ? row.slice(1) : row; // una placa al principio de balda sobra
      const labels = []; let x = 14, prevG = null;
      const kids = items.map((it, j) => {
        if (j) x += GAP;
        // Año en el canto de la balda: bajo el primer lomo de cada año (y al empezar balda)
        if (it.k === 'book' && it.g && it.g !== prevG) labels.push(h('span', { class: 'canto caps', style: `left:${x}px` }, it.g));
        if (it.k === 'book') prevG = it.g;
        x += it.w;
        if (it.k === 'sep') return h('span', { class: 'placa', role: 'separator', 'aria-label': it.g });
        if (it.k === 'end') return h('span', { class: 'sujeta', 'aria-hidden': 'true' });
        if (it.k === 'book') return mark(it.b, spine(it.b, dims(it.b), 'button', anim()));
        // Pila: el primero de libros.json abajo y el último arriba; entran de abajo arriba
        const els = it.books.map(b => mark(b, tumbado(b, dims(b), lenOf(b), anim()))).reverse();
        return h('div', { class: 'pila', style: `width:${it.pw}px;margin-left:${it.pi ? '10px' : 'auto'}` },
          it.pi ? null : h('span', { class: 'pila-tag caps' }, `Por leer · ${pend.length}`), els);
      });
      return h('div', { class: 'balda' },
        h('div', { class: 'hueco' }, kids, all.length ? null : h('span', { class: 'vacia caps' }, 'Todavía vacía')),
        h('div', { class: 'tablero', 'aria-hidden': 'true' }, labels)
      );
    }));

    if (sel != null) renderCard();
  }

  // Enlace directo: /estanteria/#slug. replaceState no crea entradas en el historial.
  const setHash = id => {
    try { history.replaceState(history.state, '', location.pathname + location.search + (id != null ? '#' + SLUGS[id] : '')); } catch (e) {}
  };
  function fromHash() {
    let s = '';
    try { s = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    const id = s ? SLUGS.indexOf(s) : -1;
    if (id >= 0) { if (id !== sel) open(id); }
    else if (!s && sel != null) close();
  }
  async function copyLink(e) {
    const btn = e.currentTarget, url = location.href;
    try { await navigator.clipboard.writeText(url); } catch (err) {
      const t = h('textarea', { style: 'position:fixed;opacity:0' }, url);
      document.body.append(t); t.select();
      try { document.execCommand('copy'); } catch (err2) {}
      t.remove();
    }
    btn.textContent = 'Copiado ✓';
    setTimeout(() => { btn.textContent = 'Copiar enlace'; }, 1600);
  }

  // Ficha
  let ov = null, card = null, lastFocus = null;
  function open(id) {
    const prev = sel;
    sel = id;
    if (prev != null) spines.get(prev)?.classList.remove('sel');
    spines.get(id)?.classList.add('sel');
    setHash(id);
    if (!ov) {
      lastFocus = document.activeElement;
      card = h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true', onclick: e => e.stopPropagation() });
      ov = h('div', { id: 'ov', onclick: close }, card);
      document.body.append(ov);
    }
    renderCard();
    card.querySelector('[aria-label=Cerrar]').focus();
  }
  function close() {
    if (sel != null) spines.get(sel)?.classList.remove('sel');
    const id = sel;
    sel = null;
    setHash(null);
    if (ov) { ov.remove(); ov = card = null; }
    (spines.get(id) || lastFocus)?.focus();
  }
  function step(dir) {
    if (!list.length) return;
    const i = list.findIndex(b => b.id === sel);
    open(list[(i + dir + list.length) % list.length].id);
  }
  function renderCard() {
    const b = list.find(x => x.id === sel);
    if (!b || !card) return;
    const d = dims(b);
    const cw = Math.round(d.h * 0.66);
    const r = +b.rating || 0;
    const pos = list.indexOf(b) + 1;
    card.setAttribute('aria-label', b.title);
    card.replaceChildren(
      h('div', { class: 'dbar caps' },
        h('span', null, `Nº ${pad2(pos)} / ${pad2(list.length)}`),
        h('div', null,
          h('button', { type: 'button', 'aria-label': 'Anterior', onclick: () => step(-1) }, '←'),
          h('button', { type: 'button', 'aria-label': 'Siguiente', onclick: () => step(1) }, '→'),
          h('button', { type: 'button', 'aria-label': 'Cerrar', onclick: close }, '✕'))),
      h('div', { class: 'dbody' },
        h('div', { class: 'dl' },
          h('div', null,
            spine(b, d, 'div'),
            b.cover
              ? h('img', { class: 'portada', src: `https://covers.openlibrary.org/b/id/${b.cover}-M.jpg`, alt: `Portada de ${b.title}`, width: cw, height: d.h, style: `width:${cw}px;height:${d.h}px` })
              : h('div', { class: 'portada-ph', style: `width:${cw}px;height:${d.h}px;background:${d.bg};color:${d.fg}` },
                  h('b', null, b.title), h('small', { class: 'caps' }, b.author))),
          h('span', { class: 'caps' }, `${b.pages ? d.p + ' págs' : 'Páginas desconocidas'} · lomo ${d.w} × ${d.h} px`)),
        h('div', { class: 'dr' },
          h('header', null,
            b.reading ? h('span', { class: 'now caps' }, '● Leyendo ahora') : null,
            b.pending ? h('span', { class: 'todo caps' }, '○ Por leer') : null,
            h('h2', null, b.title),
            h('span', null, b.author)),
          b.reading || b.pending ? null : h('div', { class: 'rate' },
            h('div', { class: 'stars', role: 'img', 'aria-label': r ? `${comma(r)} de 5 estrellas` : 'Sin valorar' },
              [1, 2, 3, 4, 5].map(i => h('span', { class: 'star', 'aria-hidden': 'true' }, '★',
                h('span', { style: `width:${Math.max(0, Math.min(100, (r - (i - 1)) * 100))}%` }, '★')))),
            h('span', { 'aria-hidden': 'true' }, r ? `${comma(r)} / 5` : 'Sin valorar')),
          h('div', { class: 'meta' },
            [['Páginas', b.pages || '—'], ['Leído', b.reading ? 'Ahora' : b.pending ? 'Pendiente' : fmtDate(b.date)], ['Publicado', b.year || '—']]
              .map(([k, v]) => h('div', null, h('small', { class: 'caps' }, k), h('b', null, String(v))))),
          b.review ? h('p', { class: 'review' }, b.review) : null,
          h('div', { class: 'acc caps' },
            h('button', { type: 'button', 'aria-live': 'polite', onclick: copyLink }, 'Copiar enlace'),
            b.olKey ? h('a', { href: `https://openlibrary.org${b.olKey}`, target: '_blank', rel: 'noopener' }, 'Ver en Open Library ↗') : null)))
    );
  }

  addEventListener('keydown', e => {
    if (sel == null) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  async function loadOl() {
    try { ol = JSON.parse(localStorage.getItem(OL_CACHE)) || {}; } catch (e) {}
    const missing = RAW.filter(b => !('ol' in b) && !(keyOf(b) in ol));
    if (!missing.length) return;
    await Promise.all(missing.map(async b => {
      try {
        const q = encodeURIComponent(`${b.title} ${b.author || ''}`.trim());
        const r = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1&fields=key,author_name,number_of_pages_median,first_publish_year,cover_i`);
        const doc = (await r.json()).docs?.[0] || {};
        ol[keyOf(b)] = { pages: doc.number_of_pages_median || null, year: doc.first_publish_year || null, cover: doc.cover_i || null, author: (doc.author_name || [])[0] || null, key: doc.key || null };
      } catch (e) {}
    }));
    try { localStorage.setItem(OL_CACHE, JSON.stringify(ol)); } catch (e) {}
    render();
  }

  async function init() {
    // Los botones de ordenar ya vienen en el HTML (así no se mueve nada al cargar)
    for (const btn of $('sorts').querySelectorAll('button')) btn.onclick = () => { sort = btn.dataset.k; render(); };
    try { RAW = await (await fetch('/estanteria/libros.json', { cache: 'no-cache' })).json(); } catch (e) { RAW = []; }
    SLUGS = makeSlugs(RAW);
    try { ol = JSON.parse(localStorage.getItem(OL_CACHE)) || {}; } catch (e) {}
    const fondo = $('fondo');
    width = fondo.clientWidth;
    render();
    fromHash();
    addEventListener('hashchange', fromHash);
    // Al acabar la entrada se quita la animación: con fill-mode both seguía aplicada y anulaba el hover.
    setTimeout(() => { fresh = false; for (const el of spines.values()) el.style.animation = ''; }, 900 + RAW.length * 90);
    new ResizeObserver(() => { const w = fondo.clientWidth; if (w !== width) { width = w; render(); } }).observe(fondo);
    loadOl();
  }
  init();
})();
