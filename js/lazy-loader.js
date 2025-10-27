/**
 * Lazy Loader Optimizado - Solo carga APIs externas
 * CSS content-visibility maneja el renderizado diferido
 */

(function() {
    'use strict';
    
    // Scripts de APIs externas que necesitan cargarse
    const apiScripts = [
        '/js/lastfm.js',
        '/js/letterboxd.js',
        '/js/github-readme.js'
    ];
    
    // Scripts opcionales (widgets, efectos)
    const optionalScripts = [
        '/js/moodboard.js',
        '/js/weather.js',
        '/js/oneko.js'
    ];
    
    /**
     * Carga un script de manera asíncrona
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => resolve(src);
            script.onerror = () => reject(new Error(`Failed to load: ${src}`));
            document.body.appendChild(script);
        });
    }
    
    /**
     * Inicializar carga diferida
     */
    function init() {
        // Cargar APIs externas después de 500ms (contenido prioritario)
        setTimeout(() => {
            apiScripts.forEach(src => {
                loadScript(src).catch(err => console.warn(err));
            });
        }, 500);
        
        // Cargar scripts opcionales después de 2s (baja prioridad)
        setTimeout(() => {
            optionalScripts.forEach(src => {
                loadScript(src).catch(err => console.warn(err));
            });
        }, 2000);
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
