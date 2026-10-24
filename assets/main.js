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

    // Acento sacado de la portada: el tono más vivo del disco, con la luz ajustada
    // para que se lea sobre el papel (contraste 4,5:1 en claro y en oscuro).
    // Portadas grises o casi negras se quedan con el acento de siempre.
    const root = document.documentElement;
    const darkQuery = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches);
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
    const PAPER = { light: lum([251 / 255, 250 / 255, 247 / 255]), dark: lum([23 / 255, 22 / 255, 21 / 255]) };
    let hue = null;
    const applyTint = () => {
        if (!hue) return root.style.removeProperty('--accent');
        const dark = isDark();
        const paper = dark ? PAPER.dark : PAPER.light;
        const ratio = (l) => {
            const a = lum(hsl2rgb(hue.h, hue.s, l)) + 0.05;
            return dark ? a / (paper + 0.05) : (paper + 0.05) / a;
        };
        let l = 0.5;
        while (ratio(l) < 4.5 && l > 0.05 && l < 0.95) l += dark ? 0.02 : -0.02;
        root.style.setProperty('--accent', `hsl(${Math.round(hue.h)} ${Math.round(hue.s * 100)}% ${Math.round(l * 100)}%)`);
    };
    const tintFrom = (src) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => {
            const N = 24;
            const ctx = Object.assign(document.createElement('canvas'), { width: N, height: N }).getContext('2d', { willReadFrequently: true });
            ctx.drawImage(im, 0, 0, N, N);
            let px;
            try { px = ctx.getImageData(0, 0, N, N).data; } catch (e) { return; }
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
        im.src = src;
    };
    new MutationObserver(applyTint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    darkQuery.addEventListener('change', applyTint);

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
            tintFrom(img);
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
            // El RSS trae el cartel a 600×900; a 300×450 sobra para el tamaño al que se ve (y pesa ~3 veces menos)
            const poster = ((get('description').match(/src="([^"]+)"/) || [])[1] || '').replace('-0-600-0-900-', '-0-300-0-450-');
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
