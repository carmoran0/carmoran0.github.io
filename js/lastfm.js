// Last.fm API integration
const lastfmApiKey = 'c34e2201253c0fb7ff1d0b56101b4391'; // RAAAA ME DA IGUAL TODOOOOOO
const lastfmUsername = 'sobaco27'; // Replace with your Last.fm username
const updateInterval = 60000; // Update every 60s (optimizado desde 10s)

// Function to fetch recent tracks from Last.fm API
async function fetchRecentTracks() {
    try {
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUsername}&api_key=${lastfmApiKey}&limit=1&format=json`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Last.fm data:', error);
        return null;
    }
}

// Function to update the UI with the track information
function updateNowPlayingUI(trackData) {
    const container = document.getElementById('lastfm-container');
    
    if (!container || !trackData) {
        return;
    }
    
    try {
        const track = trackData.recenttracks.track[0];
        const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
        const trackName = track.name;
        const artistName = track.artist['#text'];
        const albumName = track.album['#text'];
    const albumArt = track.image[2]['#text'] || '/images/cat-music.gif'; // Medium size image
        
        // Update the UI
        const statusText = isNowPlaying ? 'Escuchando ahora:' : 'Último escuchado:';
        
        container.innerHTML = `
            <div class="lastfm-content">
                <div class="lastfm-album-art">
                    <img src="${albumArt}" alt="Album art for ${albumName}">
                </div>
                <div class="lastfm-info">
                    <div class="lastfm-status">${statusText}</div>
                    <div class="lastfm-track">${trackName}</div>
                    <div class="lastfm-artist">${artistName}</div>
                    <div class="lastfm-album">${albumName}</div>
                </div>
            </div>
        `;

        // Preload album art and update background blur container
        try {
            const bg = document.getElementById('bg-blur');
            if (bg && albumArt) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    // Apply as background with transition
                    bg.style.backgroundImage = `url('${albumArt}')`;
                    // Fade in
                    bg.style.opacity = '1';
                };
                img.onerror = function() {
                    // Fallback: hide bg or use default image if available
                    console.warn('Failed to load album art for bg blur:', albumArt);
                    // Optional fallback: bg.style.backgroundImage = "url('/images/fondo.gif')";
                    bg.style.opacity = '0';
                };
                img.src = albumArt;
            }
        } catch (e) {
            console.error('Error setting bg blur:', e);
        }
    } catch (error) {
        console.error('Error updating Last.fm UI:', error);
        container.innerHTML = `<div class="lastfm-error">No se pudo cargar la información de Last.fm</div>`;
    }
}

// Function to initialize Last.fm integration
function initLastFm() {
    // Initial fetch
    fetchRecentTracks().then(data => {
        updateNowPlayingUI(data);
    });
    
    // Set up periodic updates
    setInterval(() => {
        fetchRecentTracks().then(data => {
            updateNowPlayingUI(data);
        });
    }, updateInterval);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initLastFm();
    });
} else {
    // DOM ya está listo, ejecutar inmediatamente
    initLastFm();
}
