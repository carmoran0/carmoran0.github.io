/**
 * Lazy Loader - Carga scripts y contenido solo cuando es visible
 * Mejora significativa en el rendimiento inicial de la página
 */

(function() {
    'use strict';
    
    // Scripts pesados que se cargarán bajo demanda
    const lazyScripts = {
        'weather': { 
            src: '/js/weather.js', 
            container: 'body',
            priority: 'low' // Se puede cargar más tarde
        },
        'bats': { 
            src: '/js/bats.js', 
            container: '#bats-bouncing-area',
            priority: 'low'
        },
        'moodboard': { 
            src: '/js/moodboard.js', 
            container: '#moodboard',
            priority: 'low'
        },
        'oneko': { 
            src: '/js/oneko.js', 
            container: 'body',
            priority: 'low'
        },
        'badges': { 
            src: '/js/badges-marquee.js', 
            container: '.badges-container',
            priority: 'low'
        },
        'letterboxd': { 
            src: '/js/letterboxd.js', 
            container: '#letterboxd-container',
            priority: 'medium'
        }
    };
    
    const loadedScripts = new Set();
    
    /**
     * Carga un script de manera asíncrona
     */
    function loadScript(config) {
        return new Promise((resolve, reject) => {
            if (loadedScripts.has(config.src)) {
                console.log(`✓ Script ya cargado: ${config.src}`);
                resolve();
                return;
            }
            
            console.log(`Cargando script: ${config.src}`);
            const script = document.createElement('script');
            script.src = config.src;
            script.defer = true;
            script.onload = () => {
                loadedScripts.add(config.src);
                console.log(`Script cargado: ${config.src}`);
                resolve();
            };
            script.onerror = (err) => {
                console.error(`Error cargando: ${config.src}`, err);
                reject(err);
            };
            document.body.appendChild(script);
        });
    }
    
    /**
     * Observa elementos y carga scripts cuando son visibles
     */
    function setupLazyLoading() {
        // Configuración del Intersection Observer
        const observerOptions = {
            root: null,
            rootMargin: '50px', // Comienza a cargar 50px antes de ser visible
            threshold: 0.01
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const scriptName = entry.target.dataset.lazyScript;
                    const config = lazyScripts[scriptName];
                    
                    if (config && !loadedScripts.has(config.src)) {
                        loadScript(config).catch(err => {
                            console.error(`Error cargando ${config.src}:`, err);
                        });
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observar contenedores que requieren scripts
        Object.entries(lazyScripts).forEach(([name, config]) => {
            const elements = document.querySelectorAll(config.container);
            if (elements.length > 0) {
                console.log(`Observando ${elements.length} elemento(s) para: ${name}`);
                elements.forEach(el => {
                    el.dataset.lazyScript = name;
                    observer.observe(el);
                });
            } else {
                console.warn(`No se encontró contenedor para: ${name} (${config.container})`);
            }
        });
        
        // Cargar scripts de prioridad media después de 500ms (reducido de 1000ms)
        setTimeout(() => {
            console.log('Cargando scripts de prioridad media...');
            Object.entries(lazyScripts).forEach(([name, config]) => {
                if (config.priority === 'medium' && !loadedScripts.has(config.src)) {
                    loadScript(config).catch(err => {
                        console.error(`Error cargando ${config.src}:`, err);
                    });
                }
            });
        }, 500);
        
        // Cargar scripts de baja prioridad más rápido (1 segundo en lugar de esperar idle)
        setTimeout(() => {
            console.log('Cargando scripts de baja prioridad...');
            Object.entries(lazyScripts).forEach(([name, config]) => {
                if (config.priority === 'low' && !loadedScripts.has(config.src)) {
                    loadScript(config).catch(err => {
                        console.error(`Error cargando ${config.src}:`, err);
                    });
                }
            });
        }, 1000);
    }
    
    // Inicializar cuando el DOM esté listo
    console.log('Lazy Loader inicializando...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLazyLoading);
    } else {
        setupLazyLoading();
    }
})();
