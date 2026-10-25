// node --test developer/update-scrobbles.test.js
// Medianoche en Madrid los días de cambio de hora: si falla, el mapa cuenta las escuchas en el día equivocado.
const test = require('node:test');
const assert = require('node:assert');
const { midnight } = require('./update-scrobbles.js');

test('medianoche en Madrid con y sin horario de verano', () => {
    assert.equal(midnight('2026-03-29'), Date.parse('2026-03-28T23:00:00Z') / 1000); // se adelanta la hora
    assert.equal(midnight('2026-10-25'), Date.parse('2026-10-24T22:00:00Z') / 1000); // se atrasa la hora
    assert.equal(midnight('2026-07-01'), Date.parse('2026-06-30T22:00:00Z') / 1000);
    assert.equal(midnight('2026-01-15'), Date.parse('2026-01-14T23:00:00Z') / 1000);
});
