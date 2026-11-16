// node --test developer/csp.test.js
// Si falla, algún <script> en línea cambió y su hash ya no está en la CSP: el navegador lo bloquearía.
// Arreglo: node developer/csp.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { PAGES, policy, current } = require('./csp.js');

for (const page of PAGES) {
    test(`CSP al día en ${page}`, () => {
        const html = fs.readFileSync(page, 'utf8');
        assert.equal(current(html), policy(html), 'ejecuta: node developer/csp.js');
    });
}
