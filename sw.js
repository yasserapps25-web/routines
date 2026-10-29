// Service worker : fonctionne hors ligne après la première ouverture.
// Pour forcer une mise à jour après avoir modifié les fichiers, changez le numéro de version ci-dessous.
var VERSION = 'routines-v3';
var ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "objets.js",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "img/collation-1.svg",
  "img/collation-2.svg",
  "img/collation-3.svg",
  "img/collation-4.svg",
  "img/collation-5.svg",
  "img/dents-1.svg",
  "img/dents-2.svg",
  "img/dents-3.svg",
  "img/dents-4.svg",
  "img/dents-5.svg",
  "img/habillage-1.svg",
  "img/habillage-2.svg",
  "img/habillage-3.svg",
  "img/habillage-4.svg",
  "img/habillage-5.svg",
  "img/mains-1.svg",
  "img/mains-2.svg",
  "img/mains-3.svg",
  "img/mains-4.svg",
  "img/mains-5.svg",
  "img/mains-6.svg",
  "img/obj/ballon.svg",
  "img/obj/banane.svg",
  "img/obj/boite.svg",
  "img/obj/chat.svg",
  "img/obj/fenetre.svg",
  "img/obj/fleur.svg",
  "img/obj/fromage.svg",
  "img/obj/livre.svg",
  "img/obj/lune.svg",
  "img/obj/maison.svg",
  "img/obj/poisson.svg",
  "img/obj/pomme.svg",
  "img/obj/porte.svg",
  "img/obj/roue.svg",
  "img/obj/soleil.svg",
  "img/obj/toit.svg",
  "img/obj/voiture.svg"
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Réponse immédiate depuis le cache, puis mise à jour discrète en arrière-plan.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
