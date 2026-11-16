// Botón ◐ claro/oscuro, compartido por todas las páginas.
// El <head> de cada página ya aplica ?theme= o localStorage antes de pintar.
// Dos estados: seguir al sistema (no se guarda nada) o el contrario del sistema (se guarda).
// Si al pulsar se vuelve a lo que dice el sistema, se borra lo guardado y la web lo sigue otra vez.
(() => {
    'use strict';

    const KEY = 'carlos-theme';
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="color-scheme"]');
    const label = document.getElementById('theme-label');
    const darkQuery = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches);

    const apply = (theme) => {
        if (theme === 'dark' || theme === 'light') root.dataset.theme = theme;
        else delete root.dataset.theme;
        if (meta) meta.content = root.dataset.theme || 'light dark';
        if (label) label.textContent = isDark() ? 'Claro' : 'Oscuro';
    };

    document.getElementById('theme')?.addEventListener('click', () => {
        const target = isDark() ? 'light' : 'dark';
        const theme = target === (darkQuery.matches ? 'dark' : 'light') ? null : target;
        try {
            if (theme) localStorage.setItem(KEY, theme);
            else localStorage.removeItem(KEY);
        } catch (e) {}
        apply(theme);
    });
    darkQuery.addEventListener('change', () => apply(root.dataset.theme));
    // Otra pestaña cambió el modo
    addEventListener('storage', (e) => { if (e.key === KEY) apply(e.newValue); });
    apply(root.dataset.theme);
})();
