// Funcionalidad para mostrar/ocultar la sección Sobre mí
document.addEventListener('DOMContentLoaded', function() {
    const aboutButton = document.getElementById('about-button');
    const aboutSection = document.getElementById('about-section');
    
    // Verificar si los elementos existen
    if (aboutButton && aboutSection) {
        // Manejar el clic en el botón
        aboutButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamiento predeterminado del enlace
            
            // Alternar la clase visible en la sección
            aboutSection.classList.toggle('visible');
            
            // Alternar la clase active en el botón
            aboutButton.classList.toggle('active');
        });
    }
});