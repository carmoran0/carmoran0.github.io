/**
 * Image Gallery Viewer - Visor de galería de imágenes
 * Permite ver imágenes en pantalla completa con navegación por carrusel
 */

(function initImageGallery() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupGallery);
    } else {
        setupGallery();
    }

function setupGallery() {
    // Buscar contenedores de galería (tanto #moodboard como #gallery)
    const container = document.getElementById('gallery') || document.getElementById('moodboard');
    if (!container) {
        console.warn('Gallery: contenedor no encontrado');
        return;
    }

    let imageViewer = null;
    let currentImageIndex = 0;
    let allImages = [];

    function createImageViewer() {
        imageViewer = document.createElement('div');
        imageViewer.className = 'image-viewer-overlay';
        imageViewer.innerHTML = `
            <button class="image-viewer-close" aria-label="Cerrar">×</button>
            <button class="image-viewer-nav prev" aria-label="Anterior">‹</button>
            <button class="image-viewer-nav next" aria-label="Siguiente">›</button>
            <div class="image-viewer-content">
                <img src="" alt="Vista previa">
            </div>
            <div class="image-viewer-counter">
                <span class="current">1</span> / <span class="total">1</span>
            </div>
        `;
        document.body.appendChild(imageViewer);

        imageViewer.querySelector('.image-viewer-close').addEventListener('click', closeImageViewer);
        imageViewer.querySelector('.prev').addEventListener('click', showPreviousImage);
        imageViewer.querySelector('.next').addEventListener('click', showNextImage);
        
        imageViewer.addEventListener('click', function(e) {
            if (e.target === imageViewer) {
                closeImageViewer();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (!imageViewer.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeImageViewer();
            if (e.key === 'ArrowLeft') showPreviousImage();
            if (e.key === 'ArrowRight') showNextImage();
        });
    }

    function openImageViewer(index) {
        if (!imageViewer) createImageViewer();
        
        // Buscar imágenes con clase .gallery-img o .draggable-img
        const selector = '.gallery-img, .draggable-img, .moodboard-item img';
        allImages = Array.from(container.querySelectorAll(selector)).map(img => ({
            src: img.src,
            alt: img.alt
        }));

        currentImageIndex = index;
        updateViewerImage();
        imageViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeImageViewer() {
        if (!imageViewer) return;
        imageViewer.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        updateViewerImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
        updateViewerImage();
    }

    function updateViewerImage() {
        if (!imageViewer || allImages.length === 0) return;
        
        const img = imageViewer.querySelector('.image-viewer-content img');
        const current = allImages[currentImageIndex];
        
        img.style.animation = 'none';
        setTimeout(() => {
            img.src = current.src;
            img.alt = current.alt;
            img.style.animation = 'imageZoomIn 0.3s ease';
        }, 10);

        imageViewer.querySelector('.current').textContent = currentImageIndex + 1;
        imageViewer.querySelector('.total').textContent = allImages.length;
    }

    // Inicializar clicks en las imágenes
    function initGalleryImages() {
        // Buscar todas las imágenes clickeables
        const selector = '.gallery-img, .draggable-img, .moodboard-item img';
        const images = container.querySelectorAll(selector);
        
        images.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.preventDefault();
                openImageViewer(index);
            });
        });
    }

    // Inicializar
    initGalleryImages();

    // Mantener compatibilidad con moodboards existentes
    const moodboardItems = container.querySelectorAll('.moodboard-item');
    if (moodboardItems.length > 0) {
        // Aplicar rotaciones iniciales si existen
        moodboardItems.forEach(item => {
            const rotation = item.getAttribute('data-rotation') || '0';
            item.style.transform = `rotate(${rotation}deg)`;
        });
    }
}
})();
