(function () {
    'use strict';

    const API_ENDPOINT = 'https://ws.audioscrobbler.com/2.0/';
    const DEFAULT_LIMIT = 50;
    const IMAGE_FALLBACK = 'https://lastfm.freetls.fastly.net/i/u/64s/2a96cbd8b46e442fc41c2b86b821562f.png';
    const ITUNES_ENDPOINT = 'https://itunes.apple.com/search';

    const STRINGS = {
        es: {
            loadMore: 'Cargar más',
            preview: 'Escuchar preview',
            stopPreview: 'Detener preview',
            nowPlaying: 'Reproduciendo ahora',
            scrobbledAgo: 'Scrobbleado',
            justNow: 'Hace instantes',
            countLabel: (visible, total, formatter) => {
                if (!total) {
                    return `Mostrando ${formatter.format(visible)} scrobbles`;
                }
                return `Mostrando ${formatter.format(visible)} de ${formatter.format(total)} scrobbles`;
            },
            missingKey: 'Falta la clave de API de Last.fm. Define window.__LASTFM_API_KEY__ o data-lastfm-api-key antes de cargar la página.',
            errorLoading: 'No se pudo cargar la actividad de Last.fm.',
            tryAgain: 'Reintentar',
            empty: 'No hay scrobbles registrados todavía.',
            previewError: 'No hay preview disponible. Abriendo búsqueda en YouTube…',
            close: 'Cerrar',
            openLastfm: 'Ver en Last.fm'
        },
        en: {
            loadMore: 'Load more',
            preview: 'Play preview',
            stopPreview: 'Stop preview',
            nowPlaying: 'Now playing',
            scrobbledAgo: 'Scrobbled',
            justNow: 'Moments ago',
            countLabel: (visible, total, formatter) => {
                if (!total) {
                    return `Showing ${formatter.format(visible)} scrobbles`;
                }
                return `Showing ${formatter.format(visible)} of ${formatter.format(total)} scrobbles`;
            },
            missingKey: 'Missing Last.fm API key. Define window.__LASTFM_API_KEY__ or data-lastfm-api-key before loading the page.',
            errorLoading: 'Failed to load Last.fm activity.',
            tryAgain: 'Try again',
            empty: 'No scrobbles yet.',
            previewError: 'No preview available. Opening a YouTube search…',
            close: 'Close',
            openLastfm: 'View on Last.fm'
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const container = document.getElementById('lastfm-container');
        if (!container) return;
        if (container.dataset.initialized === 'true') return;

        const language = (document.documentElement.lang || 'en').toLowerCase();
        const locale = language.startsWith('es') ? 'es' : 'en';
        const text = STRINGS[locale];

        const apiKey = resolveApiKey(container);
        if (!apiKey) {
            container.innerHTML = `<div class="lastfm-error-box">${text.missingKey}</div>`;
            return;
        }

        const username = container.dataset.lastfmUser || 'sobaco27';
        const limit = Number(container.dataset.lastfmLimit) || DEFAULT_LIMIT;

        container.dataset.initialized = 'true';

        const numberFormatter = new Intl.NumberFormat(locale);
        const absoluteFormatter = new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        const relativeFormatter = new Intl.RelativeTimeFormat(locale, {
            numeric: 'auto'
        });


        // Limpiar el contenedor pero mantener el propio div para conservar el layout
        while (container.firstChild) container.removeChild(container.firstChild);

        const historyEl = document.createElement('div');
        historyEl.className = 'lastfm-history';
        historyEl.setAttribute('role', 'list');

        const controls = document.createElement('div');
        controls.className = 'lastfm-controls';

        const statusBanner = document.createElement('span');
        statusBanner.className = 'lastfm-status-banner';
        statusBanner.textContent = '';

        const loader = document.createElement('div');
        loader.className = 'lastfm-loader';
        loader.setAttribute('hidden', '');

        const loadMoreButton = document.createElement('button');
        loadMoreButton.type = 'button';
        loadMoreButton.className = 'lastfm-load-more';
        loadMoreButton.textContent = text.loadMore;

        controls.appendChild(statusBanner);
        controls.appendChild(loader);
        controls.appendChild(loadMoreButton);

        container.appendChild(historyEl);
        container.appendChild(controls);

        const state = {
            page: 0,
            totalPages: null,
            totalCount: null,
            loading: false,
            tracks: [],
            seen: new Set(),
            backgroundSet: false
        };

        let errorBox = null;

        loadMoreButton.addEventListener('click', () => {
            if (state.loading) return;
            fetchPage(state.page + 1);
        });

        fetchPage(1);

        async function fetchPage(page) {
            if (state.loading) return;
            toggleLoading(true);

            const params = new URLSearchParams({
                method: 'user.getrecenttracks',
                user: username,
                api_key: apiKey,
                format: 'json',
                limit: String(limit),
                page: String(page),
                extended: '0'
            });

            try {
                const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const payload = await response.json();
                const attr = payload?.recenttracks?.['@attr'];
                const tracks = Array.isArray(payload?.recenttracks?.track)
                    ? payload.recenttracks.track
                    : [];

                state.page = Number(attr?.page) || page;
                state.totalPages = Number(attr?.totalPages) || state.totalPages;
                state.totalCount = Number(attr?.total) || state.totalCount;

                clearError();

                if (tracks.length === 0 && state.page === 1) {
                    showEmptyState();
                    toggleLoading(false);
                    return;
                }

                const newTracks = tracks.filter((track) => {
                    const key = buildTrackKey(track);
                    if (state.seen.has(key)) return false;
                    state.seen.add(key);
                    return true;
                });

                if (newTracks.length === 0 && state.tracks.length === 0) {
                    showEmptyState();
                    toggleLoading(false);
                    return;
                }

                state.tracks.push(...newTracks);
                renderTracks(newTracks);
                updateStatus();
                updateBackground(newTracks);
                updateControls();
            } catch (error) {
                console.warn('Last.fm error', error);
                showError(text.errorLoading);
            } finally {
                toggleLoading(false);
            }
        }

        function renderTracks(tracks) {
            const fragment = document.createDocumentFragment();


            tracks.forEach((track, idx) => {
                const card = document.createElement('article');
                card.className = 'lastfm-track-card';
                card.setAttribute('role', 'listitem');

                const { artistName, trackName, albumName } = extractNames(track);
                const imageUrl = resolveImage(track) || IMAGE_FALLBACK;
                const trackUrl = track?.url || '#';
                const timestamp = extractTimestamp(track);

                if (timestamp.isNowPlaying) {
                    card.classList.add('is-now-playing');
                }

                const art = document.createElement('div');
                art.className = 'lastfm-card-art';
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${artistName} - ${trackName}`;
                img.loading = 'lazy';
                art.appendChild(img);

                const meta = document.createElement('div');
                meta.className = 'lastfm-track-meta';

                const title = document.createElement('h3');
                title.className = 'lastfm-track-title';
                // Tooltip solo para la primera tarjeta no actual
                if (!timestamp.isNowPlaying && idx === 0 && timestamp.label) {
                    title.setAttribute('data-timestamp', timestamp.label);
                }
                if (trackUrl && trackUrl !== '#') {
                    const link = document.createElement('a');
                    link.href = trackUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = trackName;
                    link.title = text.openLastfm;
                    title.appendChild(link);
                } else {
                    title.textContent = trackName;
                }

                const artist = document.createElement('p');
                artist.className = 'lastfm-track-artist';
                artist.textContent = artistName;

                const timeLabel = document.createElement('small');
                timeLabel.className = 'lastfm-track-time';
                timeLabel.textContent = timestamp.label;
                if (timestamp.datetime) {
                    timeLabel.dateTime = timestamp.datetime;
                }

                meta.appendChild(title);
                meta.appendChild(artist);
                if (albumName) {
                    const album = document.createElement('p');
                    album.className = 'lastfm-track-album';
                    album.textContent = albumName;
                    meta.appendChild(album);
                }
                meta.appendChild(timeLabel);

                const actions = document.createElement('div');
                actions.className = 'lastfm-track-actions';

                const previewButton = document.createElement('button');
                previewButton.type = 'button';
                previewButton.className = 'lastfm-preview-btn';
                previewButton.textContent = text.preview;
                previewButton.addEventListener('click', () => {
                    handlePreview({
                        artistName,
                        trackName,
                        albumName,
                        button: previewButton
                    });
                });

                actions.appendChild(previewButton);

                card.appendChild(art);
                card.appendChild(meta);
                card.appendChild(actions);

                fragment.appendChild(card);
            });

            historyEl.appendChild(fragment);
        }

        function updateStatus() {
            const visible = state.tracks.length;
            statusBanner.textContent = text.countLabel(visible, state.totalCount, numberFormatter);
        }

        function updateControls() {
            if (state.totalPages && state.page >= state.totalPages) {
                loadMoreButton.hidden = true;
            } else {
                loadMoreButton.hidden = false;
            }
        }

        function toggleLoading(isLoading) {
            state.loading = isLoading;
            if (isLoading) {
                loader.removeAttribute('hidden');
                loadMoreButton.disabled = true;
            } else {
                loader.setAttribute('hidden', '');
                loadMoreButton.disabled = false;
            }
        }

        function showError(message) {
            if (!errorBox) {
                errorBox = document.createElement('div');
                errorBox.className = 'lastfm-error-box';

                const textNode = document.createElement('p');
                textNode.textContent = message;
                errorBox.appendChild(textNode);

                const retry = document.createElement('button');
                retry.type = 'button';
                retry.textContent = text.tryAgain;
                retry.addEventListener('click', () => {
                    clearError();
                    fetchPage(Math.max(1, state.page || 1));
                });

                errorBox.appendChild(retry);
                container.insertBefore(errorBox, container.firstChild);
            } else {
                errorBox.querySelector('p').textContent = message;
            }
        }

        function clearError() {
            if (errorBox && errorBox.parentElement) {
                errorBox.parentElement.removeChild(errorBox);
            }
            errorBox = null;
        }

        function showEmptyState() {
            historyEl.innerHTML = `<div class="lastfm-empty-state">${text.empty}</div>`;
            loadMoreButton.hidden = true;
        }

        function updateBackground(tracks) {
            if (state.backgroundSet) return;
            const candidate = tracks.find((track) => track?.['@attr']?.nowplaying) || tracks[0];
            if (!candidate) return;
            const backgroundUrl = resolveImage(candidate);
            if (!backgroundUrl || backgroundUrl.includes('2a96cbd8b46e442fc41c2b86b821562f')) return;
            const blur = document.getElementById('bg-blur');
            if (!blur) return;
            blur.style.backgroundImage = `url('${backgroundUrl}')`;
            blur.style.opacity = '1';
            state.backgroundSet = true;
        }

        const previewCache = new Map();
        const previewState = {
            currentId: null,
            button: null,
            card: null
        };

        const audio = new Audio();
        audio.preload = 'none';

        audio.addEventListener('ended', () => {
            resetPreviewState();
        });

        audio.addEventListener('error', () => {
            if (!previewState.button) return;
            statusBanner.textContent = text.previewError;
            window.setTimeout(updateStatus, 5000);
            resetPreviewState();
        });

        async function handlePreview({ artistName, trackName, albumName, button }) {
            if (button.disabled) return;

            const card = button.closest('.lastfm-track-card');
            const previewId = `${artistName.toLowerCase()}|${trackName.toLowerCase()}|${albumName ? albumName.toLowerCase() : ''}`;

            if (previewState.currentId === previewId) {
                stopCurrentPreview();
                return;
            }

            stopCurrentPreview();

            button.disabled = true;

            let previewData;
            try {
                previewData = await fetchPreview(artistName, trackName);
            } catch (error) {
                console.warn('Preview lookup failed', error);
                button.disabled = false;
                redirectToSearch(artistName, trackName);
                return;
            }

            if (!previewData?.previewUrl) {
                button.disabled = false;
                redirectToSearch(artistName, trackName);
                return;
            }

            previewState.currentId = previewId;
            previewState.button = button;
            previewState.card = card || null;

            if (card) {
                card.classList.add('is-previewing');
            }

            button.disabled = false;
            button.classList.add('is-active');
            button.textContent = text.stopPreview;
            button.setAttribute('aria-pressed', 'true');

            try {
                await playPreview(previewData.previewUrl);
            } catch (error) {
                console.warn('Preview playback failed', error);
                statusBanner.textContent = text.previewError;
                window.setTimeout(updateStatus, 5000);
                redirectToSearch(artistName, trackName);
                stopCurrentPreview();
            }
        }

        function stopCurrentPreview() {
            if (!previewState.button) return;
            audio.pause();
            audio.currentTime = 0;
            resetPreviewState();
        }

        async function playPreview(url) {
            audio.src = url;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') {
                await playPromise;
            }
        }

        function resetPreviewState() {
            if (previewState.button) {
                previewState.button.classList.remove('is-active');
                previewState.button.textContent = text.preview;
                previewState.button.setAttribute('aria-pressed', 'false');
                previewState.button.disabled = false;
            }
            if (previewState.card) {
                previewState.card.classList.remove('is-previewing');
            }
            previewState.currentId = null;
            previewState.button = null;
            previewState.card = null;
        }

        async function fetchPreview(artistName, trackName) {
            const cacheKey = `${artistName.toLowerCase()}__${trackName.toLowerCase()}`;
            if (previewCache.has(cacheKey)) {
                return previewCache.get(cacheKey);
            }

            const query = new URLSearchParams({
                term: `${artistName} ${trackName}`,
                entity: 'song',
                limit: '1'
            });

            const response = await fetch(`${ITUNES_ENDPOINT}?${query.toString()}`);
            if (!response.ok) {
                throw new Error(`iTunes HTTP ${response.status}`);
            }

            const data = await response.json();
            const [first] = Array.isArray(data?.results) ? data.results : [];
            if (!first || !first.previewUrl) {
                throw new Error('No preview found');
            }

            const previewPayload = {
                previewUrl: first.previewUrl,
                artistName: first.artistName,
                trackName: first.trackName,
                artworkUrl: first.artworkUrl100 ? first.artworkUrl100.replace('100x100', '400x400') : null,
                trackUrl: first.trackViewUrl
            };

            previewCache.set(cacheKey, previewPayload);
            return previewPayload;
        }

        function redirectToSearch(artistName, trackName) {
            if (typeof window !== 'undefined') {
                statusBanner.textContent = text.previewError;
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artistName} ${trackName}`)}`;
                window.open(searchUrl, '_blank', 'noopener');
                window.setTimeout(updateStatus, 5000);
            }
        }

        function extractNames(track) {
            const trackName = track?.name || 'Untitled';
            const artistName = track?.artist?.['#text'] || track?.artist || 'Unknown artist';
            const albumName = track?.album?.['#text'] || '';
            return { trackName, artistName, albumName };
        }

        function extractTimestamp(track) {
            if (track?.['@attr']?.nowplaying) {
                return { label: text.nowPlaying, datetime: new Date().toISOString(), isNowPlaying: true };
            }
            const uts = Number(track?.date?.uts);
            if (!Number.isFinite(uts)) {
                return { label: text.justNow, datetime: null, isNowPlaying: false };
            }
            const date = new Date(uts * 1000);
            const relative = formatRelative(date, relativeFormatter);
            const absolute = absoluteFormatter.format(date);
            return {
                label: `${text.scrobbledAgo} ${relative}`,
                datetime: date.toISOString(),
                absolute,
                isNowPlaying: false
            };
        }

        function resolveImage(track) {
            const images = Array.isArray(track?.image) ? track.image : [];
            const priorities = ['extralarge', 'large', 'medium', 'small'];
            for (const size of priorities) {
                const source = images.find((img) => img?.size === size)?.['#text'];
                if (source && source.trim().length) {
                    return source;
                }
            }
            const first = images.find((img) => typeof img?.['#text'] === 'string');
            return first?.['#text'] || '';
        }

        function buildTrackKey(track) {
            const names = extractNames(track);
            const uts = track?.date?.uts || (track?.['@attr']?.nowplaying ? 'now' : '');
            const mbid = track?.mbid || '';
            return `${mbid}|${names.artistName.toLowerCase()}|${names.trackName.toLowerCase()}|${uts}`;
        }
    }

    function formatRelative(date, formatter) {
        const diff = date - Date.now();
        const absDiff = Math.abs(diff);
        const thresholds = [
            { limit: 60 * 1000, divisor: 1000, unit: 'second' },
            { limit: 60 * 60 * 1000, divisor: 60 * 1000, unit: 'minute' },
            { limit: 24 * 60 * 60 * 1000, divisor: 60 * 60 * 1000, unit: 'hour' },
            { limit: 7 * 24 * 60 * 60 * 1000, divisor: 24 * 60 * 60 * 1000, unit: 'day' },
            { limit: 30 * 24 * 60 * 60 * 1000, divisor: 7 * 24 * 60 * 60 * 1000, unit: 'week' },
            { limit: 365 * 24 * 60 * 60 * 1000, divisor: 30 * 24 * 60 * 60 * 1000, unit: 'month' },
            { limit: Infinity, divisor: 365 * 24 * 60 * 60 * 1000, unit: 'year' }
        ];

        for (const threshold of thresholds) {
            if (absDiff < threshold.limit) {
                const value = Math.round(diff / threshold.divisor);
                return formatter.format(value, threshold.unit);
            }
        }
        return formatter.format(0, 'second');
    }

    function resolveApiKey(container) {
        const inlineKey = container.dataset.lastfmApiKey;
        if (inlineKey && inlineKey.trim().length) {
            return inlineKey.trim();
        }
        if (typeof window !== 'undefined' && window.__LASTFM_API_KEY__) {
            return window.__LASTFM_API_KEY__;
        }
        const meta = document.querySelector('meta[name="lastfm-api-key"]');
        if (meta && meta.content) {
            return meta.content.trim();
        }
        return '';
    }
})();
