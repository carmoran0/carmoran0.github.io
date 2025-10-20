document.addEventListener('DOMContentLoaded', function() {
    if (typeof calculateStreak === 'function') {
        calculateStreak();
        setInterval(calculateStreak, 86400000);
    }
    // Aplicar style="color: beige;" inline a todos los enlaces
    try {
        document.querySelectorAll('a').forEach(function(el) {
            // conservar estilos en línea existentes y añadir color beige
            var existing = el.getAttribute('style') || '';
            // si ya existe un color en inline, lo reemplazamos
            if (/\bcolor\s*:/i.test(existing)) {
                existing = existing.replace(/color\s*:\s*[^;]+;?/i, 'color: beige;');
            } else {
                if (existing && existing.trim() && !/;\s*$/.test(existing)) existing += ';';
                existing += 'color: beige;';
            }
            el.setAttribute('style', existing);
        });
    } catch (e) {
        console.warn('No se pudieron aplicar estilos inline a los enlaces:', e);
    }
});

// Duolingo streak counter
function calculateStreak() {
    const streakStartDate = new Date('2023-12-09');
    const today = new Date();
    const diffTime = Math.abs(today - streakStartDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const node = document.querySelector('#streak-counter .streak-number');
    if (node) node.textContent = `${diffDays} días`;
}