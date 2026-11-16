#!/usr/bin/env node
/**
 * csp.js
 * La CSP va en una <meta> (GitHub Pages no deja poner cabeceras) y permite los <script> en línea
 * por su hash. Si cambia uno de esos scripts, el hash deja de valer y el navegador lo bloquea.
 *
 *   node developer/csp.js        → recalcula y escribe la <meta> de cada página
 *   node --test "developer/*.test.js" → csp.test.js comprueba que están al día
 *
 * Solo restringe scripts, <object> y <base>: los estilos en línea (style="…") siguen permitidos.
 */

const fs = require('fs');
const crypto = require('crypto');

const PAGES = ['index.html', '404.html', 'uso/index.html', 'estanteria/index.html'];
const META = /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(">)/;

// Contenido de cada <script> sin src (incluidas las speculation rules), con los saltos de línea
// como los deja el parser de HTML: CRLF y CR pasan a LF antes de calcular el hash
const inlineScripts = (html) => [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1].replace(/\r\n?/g, '\n'));
const hash = (text) => `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;

const policy = (html) => {
    const hashes = [...new Set(inlineScripts(html).map(hash))];
    return [
        `script-src 'self' https://cloud.umami.is ${hashes.join(' ')}`,
        "object-src 'none'",
        "base-uri 'none'",
    ].join('; ');
};

const current = (html) => (html.match(META) || [])[2];

if (require.main === module) {
    for (const page of PAGES) {
        const html = fs.readFileSync(page, 'utf8');
        if (!META.test(html)) throw new Error(`${page}: falta <meta http-equiv="Content-Security-Policy">`);
        const next = html.replace(META, `$1${policy(html)}$3`);
        if (next !== html) fs.writeFileSync(page, next);
        console.log(`${page}: ${next === html ? 'sin cambios' : 'actualizada'}`);
    }
} else {
    module.exports = { PAGES, policy, current };
}
