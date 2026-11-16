// CarlOS: racha, Last.fm (ahora suena + top artistas + preview) y Letterboxd.
(() => {
    'use strict';

    const USER = 'sobaco27';
    const KEY = 'c34e2201253c0fb7ff1d0b56101b4391';
    const PROFILE = `https://www.last.fm/user/${USER}`;
    const BOXD = 'https://boxd.it/9uosP';
    const $ = (id) => document.getElementById(id);
    const h = (tag, props, ...kids) => {
        const el = Object.assign(document.createElement(tag), props);
        el.append(...kids);
        return el;
    };
    // Lo que llega de las APIs y del RSS solo va a un href o un src si es https
    const safe = (url, fallback) => {
        try { return new URL(url).protocol === 'https:' ? url : fallback; } catch (e) { return fallback; }
    };
    const comma = (n) => String(n).replace('.', ',');

    // Racha de Duolingo: días de calendario en Madrid, como el mapa de escuchas
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(Date.now());
    $('streak').textContent = Math.round((Date.parse(today) - Date.parse('2023-12-09')) / 864e5);

    // Last.fm. A veces responde 200 con { error, message }: eso también es un fallo.
    const api = (method, extra) =>
        fetch(`https://ws.audioscrobbler.com/2.0/?method=${method}&user=${USER}&api_key=${KEY}&format=json${extra}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.error) throw new Error(d.message);
                return d;
            });
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const ago = (uts) => {
        if (!uts) return 'hace un momento';
        const m = Math.round((Date.now() / 1000 - uts) / 60);
        if (m < 60) return rtf.format(-m, 'minute');
        if (m < 1410) return rtf.format(-Math.round(m / 60), 'hour'); // desde 23,5 h ya es «ayer», no «hace 24 horas»
        return rtf.format(-Math.round(m / 1440), 'day');
    };

    // Acento sacado de la portada: el tono más vivo del disco, con la luz ajustada
    // para que se lea sobre el papel (contraste 4,5:1 en claro y en oscuro).
    // Portadas grises o casi negras se quedan con el acento de siempre.
    // El papel se lee del propio .card, así no hay que repetir aquí los colores de base.css.
    const root = document.documentElement;
    const card = document.querySelector('.card');
    const hsl2rgb = (h, s, l) => {
        const f = (n) => {
            const k = (n + h / 30) % 12;
            return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        };
        return [f(0), f(8), f(4)];
    };
    const lum = ([r, g, b]) => {
        const c = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
    };
    const paperLum = () => lum(getComputedStyle(card).backgroundColor.match(/[\d.]+/g).slice(0, 3).map((v) => v / 255));
    let hue = null;
    const applyTint = () => {
        if (!hue) return root.style.removeProperty('--accent');
        const paper = paperLum();
        const dark = paper < 0.5;
        const ratio = (l) => {
            const a = lum(hsl2rgb(hue.h, hue.s, l)) + 0.05;
            return dark ? a / (paper + 0.05) : (paper + 0.05) / a;
        };
        let l = 0.5;
        while (ratio(l) < 4.5 && l > 0.05 && l < 0.95) l += dark ? 0.02 : -0.02;
        root.style.setProperty('--accent', `hsl(${Math.round(hue.h)} ${Math.round(hue.s * 100)}% ${Math.round(l * 100)}%)`);
    };
    // Se lee de la carátula ya cargada (con CORS): no hace falta pedir la imagen otra vez
    const tintFrom = (im) => {
        const N = 24;
        const ctx = Object.assign(document.createElement('canvas'), { width: N, height: N }).getContext('2d', { willReadFrequently: true });
        let px;
        try {
            ctx.drawImage(im, 0, 0, N, N);
            px = ctx.getImageData(0, 0, N, N).data;
        } catch (e) { return; }
        // 24 cubos de tono; cada píxel pesa más cuanto más saturado y menos extremo de luz
        const bins = Array.from({ length: 24 }, () => ({ w: 0, x: 0, y: 0, s: 0 }));
        let vivid = 0;
        for (let i = 0; i < px.length; i += 4) {
            const r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
            const l = (max + min) / 2;
            const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
            if (s < 0.3 || l < 0.12 || l > 0.9) continue;
            const h = (max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
            const w = s * (1 - Math.abs(2 * l - 1));
            const bin = bins[Math.floor(h / 15) % 24];
            bin.w += w;
            bin.x += Math.cos(h * Math.PI / 180) * w;
            bin.y += Math.sin(h * Math.PI / 180) * w;
            bin.s += s * w;
            vivid++;
        }
        const top = bins.reduce((a, b) => (b.w > a.w ? b : a));
        if (vivid < N * N * 0.04) return;
        hue = {
            h: (Math.atan2(top.y, top.x) * 180 / Math.PI + 360) % 360,
            s: Math.min(top.s / top.w, 0.8),
        };
        applyTint();
    };
    new MutationObserver(applyTint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTint);

    // Carátula: con CORS para poder leer el color. Si el servidor dejara de mandar CORS,
    // se vuelve a pedir sin él (se ve igual, solo se pierde el acento).
    const showCover = (url) => {
        const img = $('np-img');
        const cover = $('cover');
        img.addEventListener('load', () => {
            cover.crossOrigin = img.crossOrigin;
            cover.src = img.currentSrc;
            cover.hidden = false;
            tintFrom(img);
        }, { once: true });
        img.addEventListener('error', () => {
            if (img.crossOrigin === null) return;
            img.removeAttribute('crossorigin');
            img.src = url;
        }, { once: true });
        img.src = url;
    };

    let track = null;
    api('user.getrecenttracks', '&limit=1').then((d) => {
        const t = [].concat(d?.recenttracks?.track || [])[0];
        if (!t) throw new Error('Sin escuchas');
        track = { name: t.name, artist: t.artist?.['#text'] || '' };
        const img = (t.image || []).find((i) => i.size === 'extralarge')?.['#text'];
        $('np-when').textContent = t['@attr']?.nowplaying ? '● Sonando ahora' : 'Escuchado ' + ago(t.date?.uts);
        Object.assign($('np-title'), { textContent: track.name, href: safe(t.url, PROFILE) });
        $('np-artist').textContent = track.artist;
        if (img && safe(img, '')) showCover(img);
    }).catch(() => {
        $('np-when').textContent = 'Last.fm no responde';
        $('np-title').textContent = 'Ver el perfil en Last.fm';
        $('np-artist').textContent = '';
        $('cover-btn').hidden = true;
    });

    api('user.gettopartists', '&period=7day&limit=5').then((d) => {
        const artists = d?.topartists?.artist || [];
        $('top-list').replaceChildren(...(artists.length
            ? artists.map((a, i) =>
                h('li', {},
                    h('a', { className: 'row', href: safe(a.url, PROFILE), target: '_blank', rel: 'noopener' },
                        h('span', {},
                            h('span', { className: 'rk', ariaHidden: 'true', textContent: i + 1 }),
                            h('span', { className: 'nm', textContent: a.name })),
                        h('span', { className: 'pl', textContent: a.playcount }, h('span', { className: 'sr', textContent: ' escuchas' })))))
            : [h('li', { className: 'empty', textContent: 'Nada esta semana' })]));
    }).catch(() => {
        $('top-list').replaceChildren(h('li', { className: 'empty', textContent: 'Last.fm no responde' }));
    });

    // Preview de 30 s vía iTunes; si no hay, búsqueda en YouTube
    let audio = null;
    let state = 'idle';
    const setState = (s) => {
        state = s;
        const aria = { idle: 'Escuchar preview de 30 s', loading: 'Buscando preview…', playing: 'Parar preview' }[s];
        $('play-dot').dataset.s = s;
        $('cover-btn').setAttribute('aria-label', aria);
        $('cover-btn').title = aria;
        if (s === 'idle') $('prog').style.width = '0';
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
            const url = safe(d?.results?.[0]?.previewUrl, '');
            if (!url) throw new Error('Sin preview');
            if (!audio) {
                audio = new Audio();
                audio.ontimeupdate = () => {
                    $('prog').style.width = (audio.currentTime / (audio.duration || 30)) * 100 + '%';
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

    // Mapa de escuchas del último año: copia local (la actualiza .github/workflows/update-scrobbles.yml)
    // En pantallas estrechas, 53 semanas dejan celdas de 4px y los meses se pisan: ahí se enseñan 26.
    fetch('/data/scrobbles.json').then((r) => r.json()).then(({ days }) => {
        const keys = Object.keys(days || {}).sort();
        if (!keys.length) return;
        const noon = (k) => Date.parse(k + 'T12:00:00Z');
        const last = keys[keys.length - 1];
        const date = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
        const month = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' });
        const num = new Intl.NumberFormat('es-ES');
        const songs = (n) => `${num.format(n)} ${n === 1 ? 'canción' : 'canciones'}`;
        const describe = (c) => `${date.format(noon(c.k))}: ${songs(c.n || 0)}`;
        const read = $('heat-read');
        const grid = $('heat');
        Object.assign(grid, { tabIndex: 0 });
        grid.setAttribute('role', 'group');

        let cells = [], els = [], summary = '', sel = -1;
        const draw = (weeks) => {
            // Columnas de lunes a domingo; la última es la semana del último día guardado
            const start = noon(last) - ((new Date(noon(last)).getUTCDay() + 6) % 7 + (weeks - 1) * 7) * 864e5;
            cells = Array.from({ length: weeks * 7 }, (_, i) => {
                const k = new Date(start + i * 864e5).toISOString().slice(0, 10);
                return { k, n: days[k] };
            });
            // Cuatro niveles por cuartiles de los días con escuchas, para que un día raro no aplane el resto
            const counts = cells.map((c) => c.n).filter((n) => n > 0).toSorted((a, b) => a - b);
            const q = (p) => counts[Math.floor(p * (counts.length - 1))] || 0;
            const cuts = [q(0.25), q(0.5), q(0.8)];
            const level = (n) => (!n ? 0 : n <= cuts[0] ? 1 : n <= cuts[1] ? 2 : n <= cuts[2] ? 3 : 4);
            const total = cells.reduce((s, c) => s + (c.n || 0), 0);
            const best = cells.reduce((a, c) => ((c.n || 0) > (a.n || 0) ? c : a));
            const range = weeks === 53 ? 'Un año de escuchas' : 'Medio año de escuchas';

            els = cells.map((c) => {
                const el = h('i', { className: c.n === undefined ? 'off' : '', title: c.n === undefined ? '' : describe(c) });
                el.dataset.l = level(c.n);
                return el;
            });
            sel = -1;
            summary = songs(total);
            read.textContent = summary;
            $('heat-t').textContent = range;
            grid.replaceChildren(...els);
            grid.setAttribute('aria-label', `${range}, día a día: ${summary}. El día con más, ${describe(best)}. Usa las flechas para recorrerlo.`);

            // Etiquetas de mes sobre la columna de la semana en la que empieza cada mes
            // (no en las dos últimas, que no hay sitio); «sept» se recorta a tres letras como los demás
            $('heat-m').style.setProperty('--weeks', weeks);
            $('heat-m').replaceChildren(...Array.from({ length: weeks - 2 }, (_, w) => cells.slice(w * 7, w * 7 + 7).find((c) => c.k.endsWith('-01')))
                .flatMap((c, w) => (c ? [h('span', { textContent: month.format(noon(c.k)).slice(0, 3), style: `grid-column:${w + 1}` })] : [])));
        };

        // Pasar el ratón o moverse con las flechas muestra el día en la cabecera
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
        // Las flechas solo se capturan si mueven la selección: en un borde, o con Alt/Ctrl/⌘/Mayús,
        // hacen lo de siempre (desplazar la página, volver atrás…)
        grid.addEventListener('keydown', (e) => {
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[e.key];
            if (!step) return;
            const to = sel < 0 ? cells.findLastIndex((c) => c.n !== undefined) : sel + step;
            if (to === sel || cells[to]?.n === undefined) return;
            e.preventDefault();
            show(to);
        });
        const box = $('heat-box');
        box.hidden = false;
        let weeks = 0;
        new ResizeObserver(() => {
            const w = box.clientWidth < 420 ? 26 : 53;
            if (w !== weeks) draw((weeks = w));
        }).observe(box);
    }).catch(() => {});

    // Pósters: con la música al lado, tantas filas como quepan en su altura (así no queda hueco debajo).
    // Se prueba con 4, 5 y 6 por fila y se queda la que menos sobra, sin bajar de 64px por póster.
    // En una sola columna, 4 por fila y 2 filas.
    const fitPosters = () => {
        const box = $('posters'), films = box.parentElement, music = films.previousElementSibling;
        const posters = [...box.children];
        const setCols = (n) => { box.style.gridTemplateColumns = `repeat(${n},minmax(0,1fr))`; };
        const show = (n) => posters.forEach((a, i) => { a.hidden = i >= n; });
        if (films.offsetTop !== music.offsetTop) {
            setCols(4);
            return show(8);
        }
        show(6); // una fila para medir
        const top = films.getBoundingClientRect().top;
        const musicH = Math.max(...[...music.children].filter((c) => !c.hidden).map((c) => c.getBoundingClientRect().bottom)) - top;
        const gap = parseFloat(getComputedStyle(box).rowGap) || 0;
        const avail = musicH - (box.getBoundingClientRect().top - top) - parseFloat(getComputedStyle(films).paddingBottom);
        let best;
        for (const cols of [4, 5, 6]) {
            if (cols > 4 && (box.clientWidth - (cols - 1) * gap) / cols < 64) break;
            setCols(cols);
            const rowH = posters[0].getBoundingClientRect().height;
            const rows = Math.max(1, Math.floor((avail + gap) / (rowH + gap)));
            const left = avail - rows * rowH - (rows - 1) * gap;
            if (!best || left < best.left - 8) best = { cols, rows, left }; // más columnas solo si se nota
        }
        setCols(best.cols);
        show(best.cols * best.rows);
    };
    let fitting = 0;
    const refit = () => { cancelAnimationFrame(fitting); fitting = requestAnimationFrame(fitPosters); };
    new ResizeObserver(refit).observe($('posters').parentElement.previousElementSibling);

    // Letterboxd: copia local del RSS (la actualiza .github/workflows/update-letterboxd.yml)
    // El RSS trae el cartel a 600×900; Letterboxd sirve también 150, 230 y 300 de ancho,
    // y con srcset el navegador elige según el tamaño al que se ve (de 56 a ~130 px).
    const SIZES = [[150, 225], [230, 345], [300, 450]];
    fetch('/data/letterboxd.xml').then((r) => r.text()).then((txt) => {
        const items = [...new DOMParser().parseFromString(txt, 'text/xml').querySelectorAll('item')]
            .filter((it) => it.getElementsByTagName('letterboxd:filmTitle').length)
            .slice(0, 40);
        if (!items.length) return;
        $('posters').replaceChildren(...items.map((it) => {
            const get = (tag) => it.getElementsByTagName(tag)[0]?.textContent || '';
            const rating = parseFloat(get('letterboxd:memberRating')) || 0;
            const title = `${get('letterboxd:filmTitle')} (${get('letterboxd:filmYear')})`;
            const big = safe((get('description').match(/src="([^"]+)"/) || [])[1], '');
            const at = ([w, hh]) => big.replace('-0-600-0-900-', `-0-${w}-0-${hh}-`);
            const resizable = big.includes('-0-600-0-900-');
            const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '');
            return h('a', { href: safe(get('link'), BOXD), target: '_blank', rel: 'noopener', title },
                h('img', {
                    className: 'poster', alt: title, loading: 'lazy', width: 300, height: 450,
                    src: resizable ? at(SIZES[2]) : big,
                    ...(resizable && { srcset: SIZES.map((s) => `${at(s)} ${s[0]}w`).join(', '), sizes: 'auto, (min-width: 47.5em) 120px, 23vw' }),
                }),
                h('span', { className: 'stars', ariaHidden: 'true', textContent: stars || ' ' }),
                rating ? h('span', { className: 'sr', textContent: `, ${comma(rating)} de 5` }) : '');
        }));
        fitPosters();
    }).catch(() => {});

    // Pie: «Actualizada hace X», con el último commit hecho a mano.
    // author= deja fuera los de las Actions (autor github-actions[bot]), por muchos que haya seguidos,
    // y cuenta los hechos en github.com (ahí el committer es GitHub, no carmoran0).
    fetch('https://api.github.com/repos/carmoran0/carmoran0.github.io/commits?author=carmoran0&per_page=1', { priority: 'low' })
        .then((r) => r.json())
        .then(([c]) => {
            const date = c?.commit?.committer?.date;
            if (!date) return;
            const msg = c.commit.message.split('\n')[0];
            const when = new Date(date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
            Object.assign($('upd'), {
                href: safe(c.html_url, 'https://github.com/carmoran0/carmoran0.github.io/commits/main'),
                textContent: 'Actualizada ' + ago(Date.parse(date) / 1000),
                title: `«${msg}» · ${when}`,
                hidden: false,
            });
        })
        .catch(() => {});
})();
