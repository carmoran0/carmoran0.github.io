// CarlOS: racha, Last.fm (ahora suena + top artistas + preview) y Letterboxd.
(() => {
    'use strict';

    const USER = 'sobaco27';
    const KEY = 'c34e2201253c0fb7ff1d0b56101b4391';
    const $ = (id) => document.getElementById(id);
    const h = (tag, props, ...kids) => {
        const el = Object.assign(document.createElement(tag), props);
        el.append(...kids);
        return el;
    };

    // Racha de Duolingo
    $('streak').textContent = Math.floor((Date.now() - new Date('2023-12-09')) / 864e5);

    // Last.fm
    const api = (method, extra) =>
        fetch(`https://ws.audioscrobbler.com/2.0/?method=${method}&user=${USER}&api_key=${KEY}&format=json${extra}`)
            .then((r) => r.json());
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const ago = (uts) => {
        if (!uts) return 'Hace un momento';
        const m = Math.round((Date.now() / 1000 - uts) / 60);
        if (m < 60) return rtf.format(-m, 'minute');
        if (m < 1440) return rtf.format(-Math.round(m / 60), 'hour');
        return rtf.format(-Math.round(m / 1440), 'day');
    };

    let track = null;
    api('user.getrecenttracks', '&limit=1').then((d) => {
        const t = [].concat(d?.recenttracks?.track || [])[0];
        if (!t) return;
        track = { name: t.name, artist: t.artist?.['#text'] || '' };
        const img = (t.image || []).find((i) => i.size === 'extralarge')?.['#text'];
        $('np-when').textContent = '● ' + (t['@attr']?.nowplaying ? 'Sonando ahora' : ago(t.date?.uts));
        Object.assign($('np-title'), { textContent: track.name, href: t.url });
        $('np-artist').textContent = track.artist;
        if (img) {
            $('np-img').src = img;
            $('cover').style.backgroundImage = `url(${JSON.stringify(img)})`;
        }
    }).catch(() => {});

    api('user.gettopartists', '&period=7day&limit=5').then((d) => {
        const artists = d?.topartists?.artist || [];
        if (!artists.length) return;
        $('top-list').replaceChildren(...artists.map((a, i) =>
            h('a', { href: a.url, target: '_blank', rel: 'noopener' },
                h('span', {},
                    h('span', { className: 'rk', textContent: i + 1 }),
                    h('span', { className: 'nm', textContent: a.name })),
                h('span', { className: 'pl', textContent: a.playcount }))));
    }).catch(() => {});

    // Preview de 30 s vía iTunes; si no hay, búsqueda en YouTube
    let audio = null;
    let state = 'idle';
    const setState = (s) => {
        state = s;
        const aria = s === 'playing' ? 'Parar preview' : 'Escuchar preview de 30 s';
        $('play-dot').textContent = s === 'playing' ? '❚❚' : '▶';
        $('prev-btn').textContent = { idle: '▶ Escuchar preview', loading: '▶ Buscando…', playing: '❚❚ Parar' }[s];
        $('cover-btn').setAttribute('aria-label', aria);
        $('cover-btn').title = aria;
        if (s === 'idle') $('bar').style.width = '0';
    };
    const togglePreview = async () => {
        if (!track || state === 'loading') return;
        if (state === 'playing') {
            audio.pause();
            audio.currentTime = 0;
            return setState('idle');
        }
        setState('loading');
        const term = `${track.artist} ${track.name}`;
        try {
            const q = new URLSearchParams({ term, entity: 'song', limit: '1' });
            const d = await fetch('https://itunes.apple.com/search?' + q).then((r) => r.json());
            const url = d?.results?.[0]?.previewUrl;
            if (!url) throw new Error('Sin preview');
            if (!audio) {
                audio = new Audio();
                audio.ontimeupdate = () => {
                    $('bar').style.width = (audio.currentTime / (audio.duration || 30)) * 100 + '%';
                };
                audio.onended = () => setState('idle');
            }
            audio.src = url;
            await audio.play();
            setState('playing');
        } catch (e) {
            setState('idle');
            window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(term), '_blank', 'noopener');
        }
    };
    $('cover-btn').addEventListener('click', togglePreview);
    $('prev-btn').addEventListener('click', togglePreview);

    // Mapa de escuchas del último año: copia local (la actualiza .github/workflows/update-scrobbles.yml)
    fetch('/data/scrobbles.json').then((r) => r.json()).then(({ days }) => {
        const keys = Object.keys(days || {}).sort();
        if (!keys.length) return;
        const noon = (k) => Date.parse(k + 'T12:00:00Z');
        const last = keys[keys.length - 1];
        // 53 columnas de lunes a domingo; la última es la semana de hoy
        const start = noon(last) - ((new Date(noon(last)).getUTCDay() + 6) % 7 + 52 * 7) * 864e5;
        const cells = Array.from({ length: 53 * 7 }, (_, i) => {
            const k = new Date(start + i * 864e5).toISOString().slice(0, 10);
            return { k, n: days[k] };
        });
        // Cuatro niveles por cuartiles de los días con escuchas, para que un día raro no aplane el resto
        const counts = cells.map((c) => c.n).filter((n) => n > 0).sort((a, b) => a - b);
        const q = (p) => counts[Math.floor(p * (counts.length - 1))] || 0;
        const cuts = [q(0.25), q(0.5), q(0.8)];
        const level = (n) => (!n ? 0 : n <= cuts[0] ? 1 : n <= cuts[1] ? 2 : n <= cuts[2] ? 3 : 4);
        const date = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
        const month = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' });
        const num = new Intl.NumberFormat('es-ES');
        const songs = (n) => `${num.format(n)} ${n === 1 ? 'canción' : 'canciones'}`;
        const total = cells.reduce((s, c) => s + (c.n || 0), 0);
        const best = cells.reduce((a, c) => ((c.n || 0) > (a.n || 0) ? c : a));
        const describe = (c) => `${date.format(noon(c.k))}: ${songs(c.n || 0)}`;

        const els = cells.map((c) => {
            const el = h('i', { className: c.n === undefined ? 'off' : '', title: c.n === undefined ? '' : describe(c) });
            el.dataset.l = level(c.n);
            return el;
        });
        const read = $('heat-read');
        const summary = songs(total);
        read.textContent = summary;
        const grid = $('heat');
        grid.replaceChildren(...els);
        Object.assign(grid, { tabIndex: 0 });
        grid.setAttribute('role', 'group');
        grid.setAttribute('aria-label', `Escuchas por día del último año: ${summary}. El día con más, ${describe(best)}. Usa las flechas para recorrerlo.`);

        // Etiquetas de mes sobre la columna de la semana en la que empieza cada mes
        $('heat-m').replaceChildren(...Array.from({ length: 51 }, (_, w) => cells.slice(w * 7, w * 7 + 7).find((c) => c.k.endsWith('-01')))
            .flatMap((c, w) => (c ? [h('span', { textContent: month.format(noon(c.k)), style: `grid-column:${w + 1}` })] : [])));

        // Pasar el ratón o moverse con las flechas muestra el día en la cabecera
        let sel = -1;
        const show = (i) => {
            els[sel]?.classList.remove('on');
            sel = i;
            if (i < 0) return (read.textContent = summary);
            els[i].classList.add('on');
            read.textContent = describe(cells[i]);
        };
        grid.addEventListener('pointerover', (e) => {
            const i = els.indexOf(e.target);
            if (i >= 0 && cells[i].n !== undefined) show(i);
        });
        grid.addEventListener('pointerleave', () => show(-1));
        grid.addEventListener('blur', () => show(-1));
        grid.addEventListener('keydown', (e) => {
            const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[e.key];
            if (!step) return;
            e.preventDefault();
            const from = sel < 0 ? cells.findLastIndex((c) => c.n !== undefined) : sel;
            const to = sel < 0 ? from : from + step;
            if (cells[to]?.n !== undefined) show(to);
        });
        $('heat-box').hidden = false;
    }).catch(() => {});

    // Letterboxd: copia local del RSS (la actualiza .github/workflows/update-letterboxd.yml)
    fetch('/data/letterboxd.xml').then((r) => r.text()).then((txt) => {
        const items = [...new DOMParser().parseFromString(txt, 'text/xml').querySelectorAll('item')]
            .filter((it) => it.getElementsByTagName('letterboxd:filmTitle').length)
            .slice(0, 8);
        if (!items.length) return;
        $('posters').replaceChildren(...items.map((it) => {
            const get = (tag) => it.getElementsByTagName(tag)[0]?.textContent || '';
            const rating = parseFloat(get('letterboxd:memberRating')) || 0;
            const title = `${get('letterboxd:filmTitle')} (${get('letterboxd:filmYear')})`;
            const poster = (get('description').match(/src="([^"]+)"/) || [])[1] || '';
            const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '');
            return h('a', { href: get('link'), target: '_blank', rel: 'noopener', title },
                h('img', { className: 'poster', src: poster, alt: title, loading: 'lazy' }),
                h('span', { className: 'stars', textContent: stars || ' ' }));
        }));
    }).catch(() => {});

    // Pie: «Actualizada hace X», con el último commit hecho a mano.
    // Se saltan los commits de las Actions (Letterboxd y README), que llevan «(autogenerado)».
    fetch('https://api.github.com/repos/carmoran0/carmoran0.github.io/commits?per_page=20')
        .then((r) => r.json())
        .then((commits) => {
            const c = Array.isArray(commits)
                ? commits.find((x) => x.committer?.login !== 'github-actions[bot]' && !/\(autogenerado\)/.test(x.commit?.message || ''))
                : null;
            const date = c?.commit?.committer?.date;
            if (!date) return;
            const msg = c.commit.message.split('\n')[0];
            const when = new Date(date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
            Object.assign($('upd'), {
                href: c.html_url,
                textContent: 'Actualizada ' + ago(Date.parse(date) / 1000),
                title: `«${msg}» · ${when}`,
                hidden: false,
            });
        })
        .catch(() => {});
})();
