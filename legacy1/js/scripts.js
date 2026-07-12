// ========================================
// Scripts optimizados - Solo funcionalidad esencial
// Estilos de enlaces ahora manejados por CSS
// ========================================

// Duolingo streak counter
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof calculateStreak === 'function') {
            calculateStreak();
            setInterval(calculateStreak, 86400000);
        }
    });
} else {
    if (typeof calculateStreak === 'function') {
        calculateStreak();
        setInterval(calculateStreak, 86400000);
    }
}

function calculateStreak() {
    const streakStartDate = new Date('2023-12-09');
    const today = new Date();
    const diffTime = Math.abs(today - streakStartDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const node = document.querySelector('#streak-counter .streak-number');
    if (node) node.textContent = `${diffDays} días`;
}
