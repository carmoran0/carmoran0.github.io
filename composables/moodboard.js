/**
 * Moodboard - Sistema interactivo para el altar
 * Permite arrastrar elementos y ver imágenes en pantalla completa con carrusel
 */

document.addEventListener('DOMContentLoaded', function() {
    const moodboard = document.getElementById('moodboard');
    if (!moodboard) return;

    let isDragging = false;
    let currentItem = null;
    let offsetX = 0;
    let offsetY = 0;
    let dragStartTime = 0;
    let hasMoved = false;

    // Crear el visor de imágenes
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

        // Event listeners del visor
        imageViewer.querySelector('.image-viewer-close').addEventListener('click', closeImageViewer);
        imageViewer.querySelector('.prev').addEventListener('click', showPreviousImage);
        imageViewer.querySelector('.next').addEventListener('click', showNextImage);
        
        // Cerrar al hacer clic en el fondo
        imageViewer.addEventListener('click', function(e) {
            if (e.target === imageViewer) {
                closeImageViewer();
            }
        });

        // Navegación con teclado
        document.addEventListener('keydown', function(e) {
            if (!imageViewer.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeImageViewer();
            if (e.key === 'ArrowLeft') showPreviousImage();
            if (e.key === 'ArrowRight') showNextImage();
        });
    }

    function openImageViewer(index) {
        if (!imageViewer) createImageViewer();
        
        // Recopilar todas las imágenes del moodboard
        const items = Array.from(moodboard.querySelectorAll('.moodboard-item img'));
        allImages = items.map(img => ({
            src: img.src,
            alt: img.alt
        }));

        currentImageIndex = index;
        updateViewerImage();
        imageViewer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
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

    // Aplicar rotaciones iniciales desde data-rotation
    function applyInitialRotations() {
        const items = moodboard.querySelectorAll('.moodboard-item');
        items.forEach(item => {
            const rotation = item.getAttribute('data-rotation') || '0';
            item.style.transform = `rotate(${rotation}deg)`;
        });
    }

    // Inicializar interacciones para todos los items
    function initDragAndDrop() {
        const items = moodboard.querySelectorAll('.moodboard-item');
        
        items.forEach((item, index) => {
            item.addEventListener('mousedown', startDrag);
            item.addEventListener('touchstart', startDrag, { passive: false });
            
            // Click para abrir visor (solo si no se arrastró)
            item.addEventListener('click', function(e) {
                if (!hasMoved && Date.now() - dragStartTime < 200) {
                    e.preventDefault();
                    openImageViewer(index);
                }
            });
        });
    }

    function startDrag(e) {
        // Solo prevenir default si es touch, para no interferir con clicks
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        
        isDragging = false; // No marcamos como arrastre hasta que se mueva
        hasMoved = false;
        dragStartTime = Date.now();
        currentItem = e.currentTarget;
        currentItem.style.zIndex = '200';

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        const rect = currentItem.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (!currentItem) return;
        
        // Marcar como arrastre al primer movimiento
        if (!isDragging) {
            isDragging = true;
            hasMoved = true;
            currentItem.style.cursor = 'grabbing';
        }

        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const moodboardRect = moodboard.getBoundingClientRect();
        const x = clientX - moodboardRect.left - offsetX;
        const y = clientY - moodboardRect.top - offsetY;

        // Calcular porcentajes relativos al contenedor
        const xPercent = (x / moodboardRect.width) * 100;
        const yPercent = (y / moodboardRect.height) * 100;

        currentItem.style.left = `${xPercent}%`;
        currentItem.style.top = `${yPercent}%`;
    }

    function stopDrag() {
        if (currentItem) {
            currentItem.style.zIndex = '';
            currentItem.style.cursor = '';
        }
        
        // Resetear después de un pequeño delay para permitir que el click se procese
        setTimeout(() => {
            isDragging = false;
            currentItem = null;
        }, 10);

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    // Función para añadir un nuevo elemento al moodboard
    window.addToMoodboard = function(imageUrl, altText = 'Item del altar') {
        const item = document.createElement('div');
        item.className = 'moodboard-item';
        
        // Posición aleatoria
        const randomTop = Math.random() * 70 + 10; // 10% a 80%
        const randomLeft = Math.random() * 70 + 10; // 10% a 80%
        const randomRotation = (Math.random() - 0.5) * 20; // -10 a 10 grados
        
        item.style.top = `${randomTop}%`;
        item.style.left = `${randomLeft}%`;
        item.setAttribute('data-rotation', randomRotation.toFixed(1));
        item.style.transform = `rotate(${randomRotation}deg)`;
        
        item.innerHTML = `
            <img src="${imageUrl}" alt="${altText}">
            <div class="pin"></div>
        `;
        
        // Animación de entrada
        item.style.opacity = '0';
        item.style.transform = `rotate(${randomRotation}deg) scale(0)`;
        moodboard.appendChild(item);
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = `rotate(${randomRotation}deg) scale(1)`;
            
            setTimeout(() => {
                item.style.transition = '';
                initDragAndDrop();
            }, 500);
        }, 10);
    };

    // Función de ayuda disponible globalmente
    window.moodboardHelp = function() {
        alert(
            '🖼️ MOODBOARD DEL ALTAR 🖼️\n\n' +
            '• Arrastra los elementos para moverlos\n' +
            '• Doble click para eliminar un elemento\n' +
            '• Usa addToMoodboard(url, descripción) en la consola para añadir imágenes\n\n' +
            'Ejemplo:\n' +
            'addToMoodboard("/images/mi-imagen.gif", "Mi imagen guay")'
        );
    };

    // Inicializar
    applyInitialRotations();
    initDragAndDrop();

    console.log('🖼️ Moodboard inicializado. Escribe moodboardHelp() para ver las instrucciones.');
});
