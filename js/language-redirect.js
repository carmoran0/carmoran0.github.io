/**
 * Language detection and redirect for multi-language site
 * Detects browser language and redirects to appropriate version
 */

(function() {
    'use strict';
    
    // Get browser language (first 2 characters, e.g., "es" from "es-ES")
    const browserLang = navigator.language.substring(0, 2);
    
    // Check if user has previously selected a language
    const savedLang = localStorage.getItem('preferred-language');
    
    // Get current path
    const currentPath = window.location.pathname;
    
    // If we're on a language-specific page, save that preference
    if (currentPath.startsWith('/es/')) {
        localStorage.setItem('preferred-language', 'es');
        return; // Don't redirect if already on a language page
    } else if (currentPath.startsWith('/en/')) {
        localStorage.setItem('preferred-language', 'en');
        return; // Don't redirect if already on a language page
    }
    
    // Determine which language to use
    let targetLang;
    if (savedLang) {
        targetLang = savedLang;
    } else if (browserLang === 'es' || browserLang === 'ca' || browserLang === 'gl' || browserLang === 'eu') {
        // Spanish and related languages go to Spanish version
        targetLang = 'es';
    } else {
        // Everything else goes to English
        targetLang = 'en';
    }
    
    // Build redirect URL
    let redirectPath;
    if (currentPath === '/' || currentPath === '/index.html') {
        redirectPath = `/${targetLang}/`;
    } else if (currentPath.endsWith('.html')) {
        // Extract filename and redirect to language folder
        const filename = currentPath.split('/').pop();
        redirectPath = `/${targetLang}/${filename}`;
    } else {
        redirectPath = `/${targetLang}/`;
    }
    
    // Redirect
    window.location.replace(redirectPath);
})();
