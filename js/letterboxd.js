// Letterboxd RSS feed integration
// Fetches recent activity from Letterboxd RSS feed and displays it

const LETTERBOXD_USERNAME = 'klamstrakur0';
const LETTERBOXD_RSS_URL = `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`;

async function fetchLetterboxdActivity() {
    const container = document.getElementById('letterboxd-container');
    
    if (!container) return;

    try {
        // Using a CORS proxy to fetch the RSS feed
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(LETTERBOXD_RSS_URL));
        
        if (!response.ok) {
            throw new Error('Failed to fetch Letterboxd feed');
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const items = xml.querySelectorAll('item');
        
        if (items.length === 0) {
            container.innerHTML = '<p class="letterboxd-error">No hay actividad reciente en Letterboxd</p>';
            return;
        }

        // Display the most recent 4 items
        const recentItems = Array.from(items).slice(0, 4);
        
        let html = '<div class="letterboxd-feed">';
        
        recentItems.forEach(item => {
            const title = item.querySelector('title')?.textContent || 'Unknown';
            const link = item.querySelector('link')?.textContent || '#';
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            // Extract image from description if available
            const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
            const imageUrl = imgMatch ? imgMatch[1] : null;
            
            // Parse description to remove HTML tags for preview text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const previewText = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
            
            // Format date
            const date = new Date(pubDate);
            const formattedDate = date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
            
            html += `
                <div class="letterboxd-item">
                    ${imageUrl ? `<div class="letterboxd-poster"><img src="${imageUrl}" alt="${title}" loading="lazy"></div>` : ''}
                    <div class="letterboxd-info">
                        <h3 class="letterboxd-title"><a href="${link}" target="_blank" rel="noopener">${title}</a></h3>
                        <p class="letterboxd-date">${formattedDate}</p>
                        ${previewText ? `<p class="letterboxd-preview">${previewText}</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching Letterboxd feed:', error);
        container.innerHTML = '<p class="letterboxd-error">Error al cargar la actividad de Letterboxd</p>';
    }
}

// Load Letterboxd activity when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLetterboxdActivity);
} else {
    fetchLetterboxdActivity();
}
