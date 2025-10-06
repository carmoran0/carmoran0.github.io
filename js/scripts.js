document.addEventListener('DOMContentLoaded', function() {
    if (typeof calculateStreak === 'function') {
        calculateStreak();
        setInterval(calculateStreak, 86400000);
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