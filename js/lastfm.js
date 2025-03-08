// Last.fm API integration
const lastfmApiKey = 'c34e2201253c0fb7ff1d0b56101b4391'; // Replace with your Last.fm API key
const lastfmUsername = 'sobaco27'; // Replace with your Last.fm username
const updateInterval = 10000; // Update every 10s

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
        const albumArt = track.image[2]['#text'] || 'images/music-placeholder.png'; // Medium size image
        
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
document.addEventListener('DOMContentLoaded', function() {
    initLastFm();
});