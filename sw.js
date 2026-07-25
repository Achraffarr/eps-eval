// Service worker EPS Éval — met l'appli en cache pour un fonctionnement 100% hors-ligne.
// Toutes les données (élèves, notes, groupes) restent en localStorage sur l'appareil ;
// ce cache ne concerne que le "code" de l'appli (HTML/CSS/JS/icônes).

const CACHE_NAME = 'eps-eval-cache-v2'; // ⚠️ change ce numéro (v2, v3...) à chaque mise à jour de l'appli
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Stratégie "cache d'abord, réseau en secours" : l'appli s'ouvre instantanément
// même sans connexion. Si une ressource n'est pas en cache et qu'il y a du
// réseau, elle est récupérée puis mise en cache pour la prochaine fois.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
