// Estantería: lee /estanteria/libros.json y completa lo que falte con Open Library.
// Campos de cada libro: title (obligatorio), author, pages, year, date ('AAAA' | 'AAAA-MM'),
// rating (0–5, admite .5), review, color (0–8), cover (id de Open Library), reading (true).
(function () {
  const PALETTE = [
    ['oklch(0.5 0.12 35)', '#f7f3ec'], ['oklch(0.7 0.11 80)', '#1a1a1a'], ['oklch(0.5 0.08 125)', '#f7f3ec'],
    ['oklch(0.42 0.07 160)', '#f7f3ec'], ['oklch(0.47 0.07 215)', '#f7f3ec'], ['oklch(0.36 0.07 262)', '#f7f3ec'],
    ['oklch(0.42 0.08 335)', '#f7f3ec'], ['#232220', '#f7f3ec'], ['oklch(0.92 0.03 85)', '#1a1a1a']
  ];
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const OL_CACHE = 'carlos-shelf-ol';
  const SORTS = [['fecha', 'Fecha'], ['autor', 'Autor'], ['tamano', 'Tamaño'], ['nota', 'Nota'], ['color', 'Color']];

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

  let RAW = [], ol = {}, sort = 'fecha', sel = null, width = 0, fresh = true, list = [];
  const spines = new Map();

  const books = () => RAW.map((b, i) => {
    const o = ol[keyOf(b)] || {};
    return { ...b, id: i, author: b.author || o.author || '', pages: b.pages || o.pages || null, year: b.year || o.year || null, cover: b.cover || o.cover || null, olKey: o.key };
  });
  const colorIdx = b => b.color >= 0 ? b.color : hash(b.title + (b.author || '')) % PALETTE.length;
  const dims = b => {
    const p = Math.max(1, +b.pages || 250);
    const j = hash(b.title || '') % 9 - 4;
    const ht = Math.round(146 + Math.min(p, 1100) / 1100 * 66 + j);
    const w = Math.round(Math.min(62, Math.max(18, 14 + p * 0.042)));
    const [bg, fg] = PALETTE[colorIdx(b)];
    return { p, h: ht, w, fs: Math.round(Math.min(17, Math.max(10, w * 0.44))), bg, fg };
  };
  const sorted = l => {
    const dk = b => b.reading ? '9999' : (b.date || '9998');
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
  const spine = (b, d, tag, extra) => h(tag, {
    class: tag === 'button' ? 'lomo' : 'lomo solo',
    style: `width:${d.w}px;height:${d.h}px;background:${d.bg};color:${d.fg};${extra || ''}`,
    ...(tag === 'button' ? { type: 'button', title: tip(b), 'aria-label': tip(b), onclick: () => open(b.id) } : { 'aria-hidden': 'true' })
  },
    h('span', { class: 'fil', 'aria-hidden': 'true' }),
    h('span', { class: 'lt', style: `font-size:${d.fs}px` }, b.title),
    tag === 'button' && d.w >= 24 && b.author ? h('span', { class: 'la' }, surname(b.author)) : null,
    tag === 'button' && b.reading ? h('span', { class: 'cinta', 'aria-hidden': 'true' }) : null
  );
  const tip = b => (b.author ? `${b.title} — ${b.author}` : b.title) + (b.reading ? ' (leyendo)' : '');

  function render() {
    const all = books();
    list = sorted(all);

    // Cabecera
    const done = all.filter(b => !b.reading);
    const pages = done.reduce((t, b) => t + (+b.pages || 0), 0);
    const rated = done.filter(b => +b.rating > 0);
    const avg = rated.length ? comma((rated.reduce((t, b) => t + +b.rating, 0) / rated.length).toFixed(1)) : '—';
    $('stats').replaceChildren(...[[done.length, 'leídos'], [pages.toLocaleString('es-ES'), 'páginas'], [avg, 'nota media']]
      .map(([v, k]) => h('div', null, h('b', null, String(v)), h('span', null, k))));

    for (const btn of $('sorts').querySelectorAll('button')) btn.setAttribute('aria-pressed', btn.dataset.k === sort);

    const reading = all.find(b => b.reading);
    $('reading').hidden = !reading;
    if (reading) { $('reading').lastElementChild.textContent = reading.title; $('reading').onclick = () => open(reading.id); }

    // Baldas: tantas como filas hagan falta
    const avail = Math.max(120, (width || 900) - 28 - 28);
    const rows = []; let cur = [], used = 0;
    for (const b of list) {
      const w = dims(b).w;
      if (cur.length && used + 2 + w > avail) { rows.push(cur); cur = []; used = 0; }
      used += w + (cur.length ? 2 : 0);
      cur.push(b);
    }
    if (cur.length) rows.push(cur);
    if (!rows.length) rows.push([]);

    spines.clear();
    let i = 0;
    $('fondo').replaceChildren(...rows.map((row, r) => h('div', { class: 'balda' },
      h('div', { class: 'hueco' },
        row.map(b => {
          const anim = fresh ? `animation:shelfIn .7s cubic-bezier(.2,.8,.3,1) ${i++ * 90}ms both;` : '';
          const el = spine(b, dims(b), 'button', anim + (sel === b.id ? 'margin-bottom:18px' : ''));
          spines.set(b.id, el);
          return el;
        }),
        row.length && r === rows.length - 1 ? h('span', { class: 'sujeta', 'aria-hidden': 'true' }) : null,
        all.length ? null : h('span', { class: 'vacia caps' }, 'Todavía vacía')
      ),
      h('div', { class: 'tablero', 'aria-hidden': 'true' })
    )));

    if (sel != null) renderCard();
  }

  // Ficha
  let ov = null, card = null, lastFocus = null;
  function open(id) {
    const prev = sel;
    sel = id;
    if (prev != null && spines.get(prev)) spines.get(prev).style.marginBottom = '';
    if (spines.get(id)) spines.get(id).style.marginBottom = '18px';
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
    if (sel != null && spines.get(sel)) spines.get(sel).style.marginBottom = '';
    const id = sel;
    sel = null;
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
    const pad2 = n => String(n).padStart(2, '0');
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
            h('h2', null, b.title),
            h('span', null, b.author)),
          b.reading ? null : h('div', { class: 'rate' },
            h('div', { class: 'stars', role: 'img', 'aria-label': r ? `${comma(r)} de 5 estrellas` : 'Sin valorar' },
              [1, 2, 3, 4, 5].map(i => h('span', { class: 'star', 'aria-hidden': 'true' }, '★',
                h('span', { style: `width:${Math.max(0, Math.min(100, (r - (i - 1)) * 100))}%` }, '★')))),
            h('span', { 'aria-hidden': 'true' }, r ? `${comma(r)} / 5` : 'Sin valorar')),
          h('div', { class: 'meta' },
            [['Páginas', b.pages || '—'], ['Leído', b.reading ? 'Ahora' : fmtDate(b.date)], ['Publicado', b.year || '—']]
              .map(([k, v]) => h('div', null, h('small', { class: 'caps' }, k), h('b', null, String(v))))),
          b.review ? h('p', { class: 'review' }, b.review) : null,
          b.olKey ? h('a', { class: 'ol caps', href: `https://openlibrary.org${b.olKey}`, target: '_blank', rel: 'noopener' }, 'Ver en Open Library ↗') : null))
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
    const missing = RAW.filter(b => !(keyOf(b) in ol));
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
    $('sorts').append(...SORTS.map(([k, label]) => h('button', { type: 'button', 'data-k': k, onclick: () => { sort = k; render(); } }, label)));
    try { RAW = await (await fetch('/estanteria/libros.json', { cache: 'no-cache' })).json(); } catch (e) { RAW = []; }
    try { ol = JSON.parse(localStorage.getItem(OL_CACHE)) || {}; } catch (e) {}
    const fondo = $('fondo');
    width = fondo.clientWidth;
    render();
    setTimeout(() => { fresh = false; }, 900 + RAW.length * 90);
    new ResizeObserver(() => { const w = fondo.clientWidth; if (w !== width) { width = w; render(); } }).observe(fondo);
    loadOl();
  }
  init();
})();
