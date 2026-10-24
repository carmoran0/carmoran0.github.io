#!/usr/bin/env node
/**
 * update-scrobbles.js
 * Guarda en data/scrobbles.json cuántas canciones se escucharon cada día (hora de Madrid)
 * durante las últimas 53 semanas, para el mapa de escuchas de la portada.
 *
 * Last.fm no da recuentos por día, pero user.getrecenttracks con from/to y limit=1
 * devuelve el total del intervalo en @attr.total: una petición por día.
 * Solo se piden los días que faltan y los dos últimos (hoy va cambiando).
 *
 * Sin dependencias (Node >= 18 por fetch nativo).
 */

const fs = require('fs');
const path = require('path');

const USER = 'sobaco27';
const KEY = process.env.LASTFM_KEY || 'c34e2201253c0fb7ff1d0b56101b4391';
const FILE = path.join('data', 'scrobbles.json');
const DAYS = 53 * 7;
const TZ = 'Europe/Madrid';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Minutos que Madrid va por delante de UTC en el instante t
const offset = (t) => {
    const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
        .formatToParts(t).find((p) => p.type === 'timeZoneName').value;
    const m = name.match(/([+-])(\d\d):(\d\d)/);
    return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0;
};
// Medianoche en Madrid de un día YYYY-MM-DD, en segundos UNIX
const midnight = (ymd) => {
    const utc = Date.parse(ymd + 'T00:00:00Z');
    return Math.floor((utc - offset(utc) * 60000) / 1000);
};
const ymd = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(t);
const addDays = (day, n) => new Date(Date.parse(day + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

async function count(day) {
    const q = new URLSearchParams({
        method: 'user.getrecenttracks', user: USER, api_key: KEY, format: 'json', limit: '1',
        from: String(midnight(day)), to: String(midnight(addDays(day, 1)) - 1),
    });
    for (let i = 0; i < 3; i++) {
        try {
            const r = await fetch('https://ws.audioscrobbler.com/2.0/?' + q);
            const d = await r.json();
            const total = d?.recenttracks?.['@attr']?.total;
            if (total !== undefined) return +total;
        } catch (e) {}
        await sleep(1500 * (i + 1));
    }
    return null;
}

(async () => {
    let old = {};
    try { old = JSON.parse(fs.readFileSync(FILE, 'utf8')).days || {}; } catch (e) {}

    const today = ymd(Date.now());
    const days = {};
    let fetched = 0, failed = 0;
    for (let i = DAYS - 1; i >= 0; i--) {
        const day = addDays(today, -i);
        if (i > 1 && old[day] !== undefined) {
            days[day] = old[day];
            continue;
        }
        const n = await count(day);
        if (n === null) {
            failed++;
            if (old[day] !== undefined) days[day] = old[day];
        } else {
            days[day] = n;
            fetched++;
        }
        await sleep(220);
    }

    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ updated: new Date().toISOString(), tz: TZ, days }) + '\n');
    console.log(`${FILE}: ${Object.keys(days).length} días, ${fetched} pedidos, ${failed} fallidos`);
    if (failed > DAYS / 2) process.exit(1);
})();
