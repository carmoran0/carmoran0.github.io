// Letterboxd RSS feed integration
// Fetches recent activity from Letterboxd RSS feed and displays it

const LETTERBOXD_USERNAME = 'klamstrakur0';
const LETTERBOXD_RSS_URL = `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`;

// Cache para evitar múltiples requests
let letterboxdCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const PROXY_URLS = [
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://proxy.cors.sh/'
];

async function fetchWithFallback(url) {
    for (const proxy of PROXY_URLS) {
        try {
            const response = await fetch(proxy + encodeURIComponent(url));
            if (response.ok) {
                return response;
            }
        } catch (e) {
            console.warn(`Proxy ${proxy} falló, intentando siguiente...`);
        }
    }
    throw new Error('Todos los proxies fallaron');
}

async function fetchLetterboxdActivity() {
    const container = document.getElementById('letterboxd-container');
    
    if (!container) return;
    
    // Usar cache si está disponible y es reciente
    const now = Date.now();
    if (letterboxdCache && (now - cacheTimestamp) < CACHE_DURATION) {
        container.innerHTML = letterboxdCache;
        // Agregar listeners también cuando se usa cache
        setTimeout(addFlipListeners, 100);
        // Hide spinner
        hideLetterboxdSpinner();
        return;
    }

    try {
        // Using a CORS proxy to fetch the RSS feed
        const response = await fetchWithFallback(LETTERBOXD_RSS_URL);
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const items = xml.querySelectorAll('item');
        
        if (items.length === 0) {
            container.innerHTML = '<p class="letterboxd-error">No hay actividad reciente en Letterboxd</p>';
            hideLetterboxdSpinner();
            return;
        }

        // Display the most recent 10 items
        const recentItems = Array.from(items);
        
        let html = '<div class="letterboxd-feed">';
        const fragment = document.createDocumentFragment(); // Para mejor rendimiento
        
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
                <div class="letterboxd-item card">
                    <div class="card-inner">
                        <div class="card-front">
                            ${imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy">` : '<p>Sin póster</p>'}
                        </div>
                        <div class="card-back">
                            <div class="letterboxd-info">
                                <h3 class="letterboxd-title"><a href="${link}" target="_blank" rel="noopener">${title}</a></h3>
                                <p class="letterboxd-date">${formattedDate}</p>
                                ${previewText ? `<p class="letterboxd-preview">${previewText}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Agregar tarjeta "Ver más..." al final
        html += `
            <a href="https://boxd.it/9uosP" target="_blank" rel="noopener" class="letterboxd-item letterboxd-more">
                <div class="letterboxd-more-content">
                    <p class="letterboxd-more-text">Ver más...</p>
                </div>
            </a>
        `;
        
        html += '</div>';
        container.innerHTML = html;
        
        // Guardar en cache
        letterboxdCache = html;
        cacheTimestamp = Date.now();
        
        // Agregar event listeners para flip en móvil/tablet después de un pequeño delay
        // para asegurar que el DOM esté listo
        setTimeout(addFlipListeners, 100);
        
        // Hide spinner after content is loaded
        hideLetterboxdSpinner();
        
    } catch (error) {
        console.error('Error fetching Letterboxd feed:', error);
        container.innerHTML = '<p class="letterboxd-error">Error al cargar la actividad de Letterboxd</p>';
        hideLetterboxdSpinner();
    }
}

// Función para agregar listeners de click/tap para voltear tarjetas
function addFlipListeners() {
    const cards = document.querySelectorAll('.letterboxd-item.card');
    
    cards.forEach(card => {
        // Usar touchstart para mejor respuesta en móvil, click como fallback
        card.addEventListener('click', function(e) {
            // Prevenir que el click en el enlace voltee la tarjeta
            if (e.target.tagName === 'A') return;
            
            // Toggle la clase flipped
            this.classList.toggle('flipped');
        });
        
        // Prevenir que el hover interfiera en dispositivos táctiles
        card.addEventListener('touchstart', function(e) {
            // Prevenir que el click en el enlace voltee la tarjeta
            if (e.target.tagName === 'A') return;
            
            this.classList.toggle('flipped');
            e.preventDefault(); // Prevenir el hover en touch devices
        }, { passive: false });
    });
}

// Function to hide the spinner when content is loaded
function hideLetterboxdSpinner() {
    const section = document.querySelector('.letterboxd-section');
    if (section) {
        section.classList.add('loaded');
    }
}

// Load Letterboxd activity when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLetterboxdActivity);
} else {
    // DOM ya está listo, ejecutar inmediatamente
    fetchLetterboxdActivity();
}
