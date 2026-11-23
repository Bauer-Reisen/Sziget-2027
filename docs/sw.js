// Offline-Speicher der App-Dateien (wie in der Sportplatz-App).
// - Dateien dieser Version kommen sofort aus dem Handy, ohne aufs Netz zu warten.
// - Nach dem vollständigen Speichern legt er die Marke „bereit" ab → die App zeigt „Offline bereit ✓".
// - Updates: app.js merkt eine neue Version (version.json) und lädt mit ?v=<neu> – das geht übers Netz.
// - Daten aus der Datenbank (Worker) werden hier NICHT gespeichert, die hebt die App selbst auf.

const VERSION = '0.6.0';
const CACHE = 'insel-' + VERSION;
const BILDER = 'bilder-insel'; // bleibt über Updates erhalten
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest', 'style.css', 'version.json',
  'js/app.js', 'js/config.js', 'js/store.js', 'js/api.js', 'js/ui.js', 'js/ctx.js', 'js/tabs.js',
  'js/hilfe.js', 'js/tour.js', 'js/news.js', 'js/install.js', 'js/offline.js', 'js/start.js', 'js/mehr.js',
  'js/sync.js', 'js/lineup.js', 'js/actinfo.js', 'js/infos.js', 'js/heute.js', 'js/teilen.js',
  'icons/favicon-64.png', 'icons/qr.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(DATEIEN.map((u) => new Request(u, { cache: 'reload' })));
    await c.put('bereit', new Response(VERSION));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('insel-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Netz fragen, höchstens `ms` lang; danach (oder ohne Netz) die Kopie aus dem Handy.
async function netzZuerst(req, cache, ms) {
  const netz = fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  });
  netz.catch(() => { /* offline */ });
  const zeit = new Promise((resolve) => setTimeout(resolve, ms, null));
  try {
    const res = await Promise.race([netz, zeit]);
    if (res) return res;
  } catch { /* offline */ }
  const kopie = await cache.match(req, { ignoreSearch: true });
  return kopie || netz;
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Bilder der Acts (von Spotify): einmal laden, dann vom Handy – so gibt es sie auch ohne Netz
  if (url.hostname.endsWith('spotifycdn.com') || url.hostname === 'i.scdn.co') {
    ev.respondWith((async () => {
      const c = await caches.open(BILDER);
      const kopie = await c.match(req);
      if (kopie) return kopie;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    })());
    return;
  }
  if (url.origin !== location.origin) return; // Worker und fremde Dienste nicht anfassen
  if (url.pathname.endsWith('/version.json')) return; // Update-Prüfung immer frisch

  const v = url.searchParams.get('v');
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (v && v !== VERSION) return netzZuerst(req, cache, 8000); // gerade ein Update
    const kopie = await cache.match(req, { ignoreSearch: true });
    if (kopie) {
      if (!v) {
        ev.waitUntil(fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') return cache.put(req, res);
        }).catch(() => {}));
      }
      return kopie;
    }
    return netzZuerst(req, cache, 8000);
  })());
});
