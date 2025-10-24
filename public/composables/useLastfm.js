export const useLastfm = () => {
  const lastfmApiKey = 'c34e2201253c0fb7ff1d0b56101b4391'
  const lastfmUsername = 'sobaco27'

  const fetchRecentTracks = async () => {
    try {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUsername}&api_key=${lastfmApiKey}&limit=1&format=json`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching Last.fm data:', error)
      return null
    }
  }

  const updateNowPlayingUI = (trackData) => {
    const container = document.getElementById('lastfm-container')
    
    if (!container || !trackData) {
      return
    }
    
    try {
      const track = trackData.recenttracks.track[0]
      const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true'
      const trackName = track.name
      const artistName = track.artist['#text']
      const albumName = track.album['#text']
      const albumArt = track.image[2]['#text'] || '/images/screamer.gif'
      const trackUrl = track.url
      
      const statusText = isNowPlaying ? 'Escuchando ahora:' : 'Último escuchado:'
      
      container.innerHTML = `
        <div class="lastfm-content">
          <div class="lastfm-album-art">
            <img src="${albumArt}" alt="Album art for ${albumName}">
          </div>
          <div class="lastfm-info">
            <div class="lastfm-status">${statusText}</div>
            <div class="lastfm-track">
              <a href="${trackUrl}" target="_blank" rel="noopener noreferrer">${trackName}</a>
            </div>
            <div class="lastfm-artist">${artistName}</div>
            <div class="lastfm-album">${albumName}</div>
          </div>
        </div>
      `
      
      // Update background blur with album art
      const bgBlur = document.getElementById('bg-blur')
      if (bgBlur && albumArt && !albumArt.includes('screamer')) {
        bgBlur.style.backgroundImage = `url(${albumArt})`
        bgBlur.style.opacity = '1'
      }
    } catch (error) {
      console.error('Error updating Last.fm UI:', error)
    }
  }

  const startLastfmUpdates = (interval = 10000) => {
    const update = async () => {
      const data = await fetchRecentTracks()
      if (data) {
        updateNowPlayingUI(data)
      }
    }
    
    update()
    return setInterval(update, interval)
  }

  return {
    fetchRecentTracks,
    updateNowPlayingUI,
    startLastfmUpdates
  }
}
