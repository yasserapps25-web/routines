// Service worker : fonctionne hors ligne après la première ouverture.
// Pour forcer une mise à jour après avoir modifié les fichiers, changez le numéro de version ci-dessous.
var VERSION = 'routines-v6';
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
  "img/dents-1.png",
  "img/dents-2.png",
  "img/dents-3.png",
  "img/dents-4.png",
  "img/dents-5.png",
  "img/ecole-1.png",
  "img/ecole-2.png",
  "img/ecole-3.png",
  "img/ecole-4.png",
  "img/ecole-5.png",
  "img/ecole-6.png",
  "img/ecole-7.png",
  "img/ecole-8.png",
  "img/fini.jpg",
  "img/mains-1.jpg",
  "img/mains-2.jpg",
  "img/mains-3.jpg",
  "img/mains-4.jpg",
  "img/mains-5.jpg",
  "img/mains-6.jpg",
  "img/manger-1.png",
  "img/manger-2.png",
  "img/manger-3.png",
  "img/manger-4.png",
  "img/obj/avion.svg",
  "img/obj/ballon.svg",
  "img/obj/banane.svg",
  "img/obj/bateau.svg",
  "img/obj/boite.svg",
  "img/obj/bouche.svg",
  "img/obj/bus.svg",
  "img/obj/camion.svg",
  "img/obj/carotte.svg",
  "img/obj/casquette.svg",
  "img/obj/cat-animaux.svg",
  "img/obj/cat-corps.svg",
  "img/obj/cat-nourriture.svg",
  "img/obj/cat-transports.svg",
  "img/obj/cat-vetements.svg",
  "img/obj/chat.svg",
  "img/obj/chaussette.svg",
  "img/obj/chaussure.svg",
  "img/obj/cheval.svg",
  "img/obj/chien.svg",
  "img/obj/cochon.svg",
  "img/obj/fenetre.svg",
  "img/obj/fleur.svg",
  "img/obj/fromage.svg",
  "img/obj/lait.svg",
  "img/obj/livre.svg",
  "img/obj/lune.svg",
  "img/obj/main.svg",
  "img/obj/maison.svg",
  "img/obj/mouton.svg",
  "img/obj/nez.svg",
  "img/obj/oeil.svg",
  "img/obj/oreille.svg",
  "img/obj/pain.svg",
  "img/obj/pantalon.svg",
  "img/obj/pied.svg",
  "img/obj/poisson.svg",
  "img/obj/pomme.svg",
  "img/obj/porte.svg",
  "img/obj/poule.svg",
  "img/obj/robe.svg",
  "img/obj/roue.svg",
  "img/obj/soleil.svg",
  "img/obj/toit.svg",
  "img/obj/train.svg",
  "img/obj/tshirt.svg",
  "img/obj/vache.svg",
  "img/obj/velo.svg",
  "img/obj/voiture.svg",
  "img/toilette-1.png",
  "img/toilette-2.png",
  "img/toilette-3.png",
  "img/toilette-4.png",
  "img/toilette-5.png",
  "img/toilette-6.png"
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
