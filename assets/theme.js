// Botón ◐ claro/oscuro, compartido por todas las páginas.
// El <head> de cada página ya aplica ?theme= o localStorage antes de pintar.
(() => {
    'use strict';

    const root = document.documentElement;
    const btn = document.getElementById('theme');
    const label = document.getElementById('theme-label');
    if (!btn || !label) return;

    const darkQuery = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches);
    const syncLabel = () => { label.textContent = isDark() ? 'Claro' : 'Oscuro'; };

    btn.addEventListener('click', () => {
        root.dataset.theme = isDark() ? 'light' : 'dark';
        try { localStorage.setItem('carlos-theme', root.dataset.theme); } catch (e) {}
        syncLabel();
    });
    darkQuery.addEventListener('change', syncLabel);
    syncLabel();
})();
