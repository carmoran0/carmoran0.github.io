// Scripts específicos para la versión formal del sitio

document.addEventListener('DOMContentLoaded', function() {
    // Sobrescribir la función de cambio de color para mantener un color fijo
    // Esta función anula la animación del color de acento definida en scripts.js
    window.changeAccentColor = function() {
        // No hacer nada, manteniendo así el color definido en CSS
        return;
    };
    
    // Cargar la racha de Duolingo
    if (typeof calculateStreak === 'function') {
        calculateStreak();
    }
});