(function () {
  'use strict';

  /* =====================================================
     DONNÉES
  ===================================================== */
  // t = titre de l'étape, d = petite description (facultative)
  var ROUTINES = [
    { id: 'mains', title: 'Je me lave les mains', icon: 2, steps: [
      { t: 'Ouvrir le robinet' }, { t: 'Mettre du savon' }, { t: 'Frotter les mains' },
      { t: 'Rincer les mains' }, { t: 'Fermer le robinet' }, { t: 'Essuyer les mains' }
    ] },
    { id: 'toilette', title: 'Je vais aux toilettes', icon: 4, steps: [
      { t: 'Descendre les vêtements' }, { t: "S'asseoir sur la toilette" }, { t: "S'essuyer avec le papier toilette" },
      { t: 'Remonter les vêtements' }, { t: "Tirer la chasse d'eau" }, { t: 'Laver les mains' }
    ] },
    { id: 'dents', title: 'Je me lave les dents', icon: 2, steps: [
      { t: 'Prendre la brosse à dents' }, { t: 'Mettre le dentifrice' }, { t: 'Se brosser les dents' },
      { t: 'Se rincer la bouche' }, { t: 'Ranger la brosse à dents', d: 'Dans un bocal.' }
    ] },
    { id: 'manger', title: 'Je mange', icon: 1, steps: [
      { t: 'Rester assis' }, { t: 'Manger' }, { t: 'Essuyer' }, { t: 'Desservir la table' }
    ] },
    { id: 'ecole', title: "J'arrive à l'école", icon: 1, steps: [
      { t: 'Je range ma boîte à lunch' }, { t: 'Je range mon sac' }, { t: 'Je range mon manteau' }, { t: 'Je range mes souliers' },
      { t: 'Je vais aux toilettes' }, { t: 'Je mange' }, { t: 'Je lave mes mains' }, { t: 'Je prends une pause' }
    ] }
  ];

  var COLORS = [
    { n: 'rouge', h: '#EF7B76' }, { n: 'bleu', h: '#6FB1E6' }, { n: 'vert', h: '#7CCB92' },
    { n: 'jaune', h: '#F7D560' }, { n: 'orange', h: '#F7A860' }, { n: 'violet', h: '#B58BD6' }
  ];
  var CAR_COLORS = COLORS.slice(0, 5);
  var COLOR_F = { bleu: 'bleue', vert: 'verte', violet: 'violette' };
  var SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
  var OBJ_SHAPES = ['circle', 'square', 'triangle', 'rectangle'];
  var SHAPE_FR = { circle: 'cercle', square: 'carré', triangle: 'triangle', star: 'étoile', heart: 'cœur', rectangle: 'rectangle' };
  var SHAPE_FEM = { star: true };
  var NUM_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
  var LETTER_FR = { a: 'a', b: 'bé', c: 'cé', d: 'dé', e: 'e', f: 'effe', g: 'gé', h: 'ache', i: 'i', j: 'ji', k: 'ka', l: 'elle',
    m: 'emme', n: 'enne', o: 'o', p: 'pé', q: 'ku', r: 'erre', s: 'esse', t: 'té', u: 'u', v: 'vé', w: 'double vé', x: 'ix', y: 'i grec', z: 'zède' };
  var SIM = ['bdpq', 'mnuh', 'ijlt', 'ceoa', 'vwy', 'ft', 'gqy'];
  var INK = '#4E6B7A';
  var NEUTRAL = '#CFDCE3';

  var OBJETS = window.OBJETS || [];
  var CATEGORIES = window.CATEGORIES || [];

  // max = niveau maximal ; multi = jeu où l'on place plusieurs pièces
  var GAME_TILES = [
    { id: 'chiffres', title: 'Compter', max: 3 },
    { id: 'formes', title: 'Formes', max: 3 },
    { id: 'couleurs', title: 'Couleurs', max: 3 },
    { id: 'lettres', title: 'Lettres', max: 2 },
    { id: 'casse', title: 'Majuscule et minuscule', max: 3 },
    { id: 'objets', title: 'Formes et objets', max: 2 },
    { id: 'categories', title: 'Catégories', max: 3, multi: true },
    { id: 'voitures', title: 'Les voitures', max: 3, multi: true },
    { id: 'tableau', title: 'Le tableau', max: 3, multi: true },
    { id: 'mots', title: 'Les mots', max: 3, multi: true },
    { id: 'ordre', title: 'Ordre des chiffres', max: 3, multi: true },
    { id: 'dix', title: 'Compter jusqu\u2019à 10', max: 2, count: true }
  ];
  function tileOf(id) { return GAME_TILES.filter(function (g) { return g.id === id; })[0]; }

  /* =====================================================
     OUTILS
  ===================================================== */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function rand(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rand(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function starPts(cx, cy, ro, ri) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? ro : ri, a = Math.PI / 5 * i - Math.PI / 2;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  function pickOther(list, avoid) {
    var pool = list.filter(function (x) { return x !== avoid; });
    if (!pool.length) pool = list;
    return pool[rand(pool.length)];
  }
  function unique(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }
  function norm(s) { return s && s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s; }
  function hexOf(name) { return COLORS.filter(function (c) { return c.n === name; })[0].h; }
  function colorSay(name, fem) { return fem && COLOR_F[name] ? COLOR_F[name] : name; }
  function shapeColorSay(shape, color) { return SHAPE_FR[shape] + ' ' + colorSay(color, SHAPE_FEM[shape]); }

  /* =====================================================
     RÉGLAGES (localStorage)
  ===================================================== */
  var S = { sound: true, voice: true, text: true, desc: true, labels: {}, levels: {}, custom: [] };
  try {
    var saved = JSON.parse(localStorage.getItem('routines-settings') || 'null');
    if (saved) { for (var k in saved) { S[k] = saved[k]; } }
  } catch (e) { /* stockage indisponible */ }
  if (!S.levels) S.levels = {};
  if (!S.labels) S.labels = {};
  if (!S.custom) S.custom = [];
  function saveS() { try { localStorage.setItem('routines-settings', JSON.stringify(S)); } catch (e) {} }

  /* =====================================================
     SONS ET VOIX
  ===================================================== */
  var ac = null, speechReady = false;
  function audio() {
    if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (C) { try { ac = new C(); } catch (e) {} } }
    if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
    return ac;
  }
  function unlockSpeech() {
    if (speechReady || !window.speechSynthesis) return;
    speechReady = true;
    try { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); } catch (e) {}
  }
  function tone(freq, start, dur, type, vol) {
    var a = audio(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + start;
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol || 0.2, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function speak(t) {
    if (!S.voice || !t || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(t));
      u.lang = 'fr-FR'; u.rate = 0.85; u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function sndBravo(mute) {
    if (S.sound) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.38, 'triangle', 0.2); }); }
    if (!mute) speak('Bravo !');
  }
  function sndChime() {
    if (!S.sound) return;
    tone(784, 0, 0.2, 'triangle', 0.18); tone(1047, 0.1, 0.3, 'triangle', 0.18);
  }
  function sndUhUh() {
    if (!S.sound) return;
    tone(330, 0, 0.16, 'triangle', 0.2);
    tone(247, 0.22, 0.26, 'triangle', 0.2);
  }
  document.addEventListener('pointerdown', function () { audio(); unlockSpeech(); }, true);
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  /* =====================================================
     IMAGES : fichiers fournis (png > jpg > svg) et photos ajoutées (IndexedDB)
     Les photos ajoutées ne quittent jamais la tablette.
  ===================================================== */
  var db = null, blobURL = {}, defMap = {};

  function openDB(cb) {
    try {
      var r = indexedDB.open('routines-db', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('img'); };
      r.onsuccess = function () { db = r.result; cb(); };
      r.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function dbPut(key, blob, cb) {
    if (!db) return cb(false);
    try {
      var tx = db.transaction('img', 'readwrite');
      tx.objectStore('img').put(blob, key);
      tx.oncomplete = function () { cb(true); };
      tx.onerror = function () { cb(false); };
    } catch (e) { cb(false); }
  }
  function dbDel(key, cb) {
    if (!db) return cb();
    try {
      var tx = db.transaction('img', 'readwrite');
      tx.objectStore('img').delete(key);
      tx.oncomplete = function () { cb(); };
      tx.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function dbClear(cb) {
    if (!db) return cb();
    try {
      var tx = db.transaction('img', 'readwrite');
      tx.objectStore('img').clear();
      tx.oncomplete = function () { cb(); };
      tx.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function loadBlobs(cb) {
    if (!db) return cb();
    try {
      var req = db.transaction('img').objectStore('img').openCursor();
      req.onsuccess = function () {
        var c = req.result;
        if (c) { blobURL[c.key] = URL.createObjectURL(c.value); c.continue(); } else cb();
      };
      req.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function putBlob(key, blob, cb) {
    dbPut(key, blob, function (ok) {
      if (ok) { if (blobURL[key]) URL.revokeObjectURL(blobURL[key]); blobURL[key] = URL.createObjectURL(blob); }
      cb(ok);
    });
  }
  function delBlob(key, cb) {
    dbDel(key, function () {
      if (blobURL[key]) { URL.revokeObjectURL(blobURL[key]); delete blobURL[key]; }
      cb();
    });
  }
  function probe(base, cb) {
    var ex = ['png', 'jpg', 'svg'];
    (function next(i) {
      if (i >= ex.length) return cb();
      var im = new Image();
      im.onload = function () { defMap[base] = base + '.' + ex[i]; cb(); };
      im.onerror = function () { next(i + 1); };
      im.src = base + '.' + ex[i];
    })(0);
  }
  function probeAll(cb) {
    var list = [];
    ROUTINES.forEach(function (r) { r.steps.forEach(function (s, i) { list.push('img/' + r.id + '-' + (i + 1)); }); });
    list.push('img/fini');
    OBJETS.forEach(function (o) { list.push('img/obj/' + o.id); });
    CATEGORIES.forEach(function (c) { list.push('img/obj/' + c.icone); });
    var left = list.length, done = false;
    function fin() { if (!done) { done = true; cb(); } }
    setTimeout(fin, 4000);
    list.forEach(function (b) { probe(b, function () { if (--left === 0) fin(); }); });
  }
  function defImg(base) { return defMap[base] || (base + '.svg'); }
  function stepSrc(rid, i) { return blobURL[rid + ':' + i] || defImg('img/' + rid + '-' + (i + 1)); }
  function finiSrc() { return blobURL['fini'] || defImg('img/fini'); }
  function objSrc(id) { return blobURL['obj:' + id] || defImg('img/obj/' + id); }
  function imgTag(id, style) {
    return '<img alt="" draggable="false" ' + (style ? 'style="' + style + '" ' : '') + 'src="' + objSrc(id) + '">';
  }
  // recadre au centre au format voulu (largeur / hauteur) puis réduit
  function resizeImage(file, ratio, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight, sw = w, sh = h, sx = 0, sy = 0;
      if (w / h > ratio) { sw = Math.round(h * ratio); sx = Math.round((w - sw) / 2); }
      else { sh = Math.round(w / ratio); sy = Math.round((h - sh) / 2); }
      var ow = ratio >= 1 ? 800 : 800, oh = Math.round(ow / ratio);
      var k = Math.min(1, sw / ow); ow = Math.round(Math.min(ow, sw)); oh = Math.round(ow / ratio);
      var c = document.createElement('canvas'); c.width = ow; c.height = oh;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, ow, oh);
      x.drawImage(img, sx, sy, sw, sh, 0, 0, ow, oh);
      c.toBlob(function (b) { URL.revokeObjectURL(url); cb(b); }, 'image/jpeg', 0.86);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  function stepLabel(rid, i) {
    var r = ROUTINES.filter(function (x) { return x.id === rid; })[0];
    return S.labels[rid + ':' + i] || r.steps[i].t;
  }
  // objets du jeu : fournis + cartes personnelles (nom + photo) ajoutées dans l'espace parent
  function allObjets() {
    var mine = S.custom.filter(function (o) { return blobURL['obj:' + o.id]; })
      .map(function (o) { return { id: o.id, nom: o.nom, cat: o.cat || undefined, custom: true }; });
    return OBJETS.concat(mine);
  }
  function initial(o) {
    if (o.lettre === false) return null;
    if (o.lettre) return String(o.lettre).toUpperCase();
    var c = norm(o.nom || '').charAt(0).toUpperCase();
    return /[A-Z]/.test(c) ? c : null;
  }

  /* =====================================================
     ÉCRANS : outils communs
  ===================================================== */
  var app = $('#app');
  var G = null, R = null;

  function stopGame() {
    if (G) { G.timers.forEach(clearTimeout); G = null; }
    removeFinger();
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
  function icon(name) {
    var p = {
      home: '<path d="M8 30 L32 9 L56 30 M14 26 V54 H27 V38 H37 V54 H50 V26" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
      back: '<path d="M38 12 L18 32 L38 52" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
      speak: '<path d="M10 24 H20 L34 12 V52 L20 40 H10 Z" fill="' + INK + '"/><path d="M42 22 Q50 32 42 42 M48 14 Q62 32 48 50" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>',
      replay: '<path d="M50 32 A18 18 0 1 1 42 17" fill="none" stroke="#3F7DB5" stroke-width="7" stroke-linecap="round"/><path d="M36 8 L46 18 L34 24 Z" fill="#3F7DB5" stroke="#3F7DB5" stroke-width="3" stroke-linejoin="round"/>',
      play: '<path d="M20 12 L52 32 L20 52 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>',
      next: '<path d="M14 32 H46 M32 16 L48 32 L32 48" fill="none" stroke="#5FB08D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
      smile: '<circle cx="32" cy="32" r="24" fill="none" stroke="#4E9E7C" stroke-width="5"/><circle cx="24" cy="27" r="3.4" fill="#4E9E7C"/><circle cx="40" cy="27" r="3.4" fill="#4E9E7C"/><path d="M20 37 Q32 50 44 37" fill="none" stroke="#4E9E7C" stroke-width="5" stroke-linecap="round"/>'
    };
    return '<svg viewBox="0 0 64 64">' + p[name] + '</svg>';
  }
  function arrowSVG(dir) {
    var d = dir === 'left' ? 'M24 14 H6 M13 6 L5 14 L13 22' : 'M4 14 H22 M15 6 L23 14 L15 22';
    return '<svg viewBox="0 0 28 28"><path d="' + d + '" fill="none" stroke="#5FB08D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function rbtn(act, ic, cls) {
    return '<button class="rbtn ' + (cls || '') + '" data-act="' + act + '">' + icon(ic) + '</button>';
  }
  function cls() { return S.text ? '' : ' no-text'; }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2400);
  }

  /* ---------- formes / groupes / voitures ---------- */
  function shapeSVG(shape, fill) {
    var s = 'stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"', b;
    if (shape === 'circle') b = '<circle cx="50" cy="50" r="42" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'square') b = '<rect x="10" y="10" width="80" height="80" rx="10" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'rectangle') b = '<rect x="24" y="8" width="52" height="84" rx="8" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'triangle') b = '<path d="M50 10 L92 86 L8 86 Z" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'star') b = '<polygon points="' + starPts(50, 54, 46, 19) + '" fill="' + fill + '" ' + s + '/>';
    else b = '<path d="M50 88 C10 58 6 32 24 20 C38 12 48 22 50 30 C52 22 62 12 76 20 C94 32 90 58 50 88 Z" fill="' + fill + '" ' + s + '/>';
    return '<svg viewBox="0 0 100 100">' + b + '</svg>';
  }
  function carSVG(hex, dir) {
    var st = 'stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"';
    var g = '<rect x="6" y="52" width="148" height="30" rx="12" fill="' + hex + '" ' + st + '/>' +
      '<path d="M30 52 L44 28 Q47 24 53 24 L100 24 Q106 24 110 29 L128 52 Z" fill="' + hex + '" ' + st + '/>' +
      '<path d="M41 50 L52 30 L72 30 L72 50 Z" fill="#EAF6FF" ' + st + '/>' +
      '<path d="M80 50 L80 30 L99 30 Q103 30 106 34 L118 50 Z" fill="#EAF6FF" ' + st + '/>' +
      '<rect x="144" y="58" width="9" height="9" rx="3" fill="#FBE59A" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="42" cy="84" r="14" fill="#6E8793" ' + st + '/><circle cx="42" cy="84" r="5" fill="#DCE4EA"/>' +
      '<circle cx="118" cy="84" r="14" fill="#6E8793" ' + st + '/><circle cx="118" cy="84" r="5" fill="#DCE4EA"/>';
    if (dir === 'left') g = '<g transform="translate(160 0) scale(-1 1)">' + g + '</g>';
    return '<svg viewBox="0 0 160 100">' + g + '</svg>';
  }
  function groupHTML(id, n) {
    var cols = n <= 4 ? 2 : (n <= 9 ? 3 : 4);
    var w = (100 / cols).toFixed(2), h = '<div class="grp">';
    for (var i = 0; i < n; i++) h += imgTag(id, 'width:' + w + '%');
    return h + '</div>';
  }
  function numeral(n) { return '<div class="numeral">' + n + '</div>'; }
  function objCard(o) { return imgTag(o.id) + '<div class="cap">' + esc(o.nom) + '</div>'; }

  /* ---------- accueil ---------- */
  function gameTileHTML(id) {
    var shp = function (s, c) { return shapeSVG(s, c); };
    if (id === 'chiffres') return '<div class="duo"><span class="tl">3</span><div class="grp" style="width:54%">' + imgTag('chat', 'width:50%') + imgTag('chat', 'width:50%') + imgTag('chat', 'width:50%') + '</div></div>';
    if (id === 'formes') return '<div class="duo">' + shp('circle', '#EF7B76') + shp('star', '#F7D560') + '</div>';
    if (id === 'couleurs') return '<div class="duo">' + ['#EF7B76', '#F7D560', '#6FB1E6'].map(function (c) { return shp('circle', c); }).join('') + '</div>';
    if (id === 'lettres') return '<div class="duo"><span class="tl">B</span>' + imgTag('banane') + '</div>';
    if (id === 'casse') return '<div class="duo"><span class="tl">A</span><span class="tl low">a</span></div>';
    if (id === 'objets') return '<div class="duo">' + shp('circle', NEUTRAL) + imgTag('roue') + '</div>';
    if (id === 'ordre') return '<div class="duo"><span class="tl">1</span><span class="tl low">2</span><span class="tl">3</span></div>';
    if (id === 'dix') return '<div class="duo"><span class="tl low">10</span>' + imgTag('pomme') + '</div>';
    if (id === 'categories') return '<div class="duo">' + imgTag('cochon') + imgTag('velo') + '</div>';
    if (id === 'voitures') return '<div class="duo cars">' + carSVG(hexOf('bleu'), 'right') + carSVG(hexOf('jaune'), 'right') + carSVG(hexOf('rouge'), 'right') + '</div>';
    if (id === 'tableau') return '<div class="duo"><div class="mini">' + shp('circle', '#EF7B76') + shp('circle', '#6FB1E6') + shp('star', '#EF7B76') + shp('star', '#6FB1E6') + '</div></div>';
    return '<div class="duo">' + imgTag('pomme') + '<span class="tl w">pomme</span></div>';
  }

  function renderHome() {
    stopGame(); R = null;
    var h = '<div class="view home' + cls() + '">';
    h += '<div class="band b1"><div class="band-title">Routines</div><div class="grid r">';
    ROUTINES.forEach(function (r) {
      h += '<button class="tile" data-r="' + r.id + '"><div class="pic"><img alt="" src="' + stepSrc(r.id, r.icon) + '"></div><div class="lab">' + esc(r.title) + '</div></button>';
    });
    h += '</div></div><div class="band b2"><div class="band-title">Jeux</div><div class="grid g">';
    GAME_TILES.forEach(function (g) {
      h += '<button class="tile" data-g="' + g.id + '"><div class="pic">' + gameTileHTML(g.id) + '</div><div class="lab">' + g.title + '</div></button>';
    });
    h += '</div></div><button class="gear" id="gear" aria-label="Parents">⚙︎</button></div>';
    app.innerHTML = h;
    // accès parent : clic simple à la souris (ordinateur), appui long au doigt (tablette)
    var g = $('#gear'), tm = null, ptype = '';
    g.addEventListener('pointerdown', function (e) {
      ptype = e.pointerType || 'touch';
      if (ptype !== 'mouse') tm = setTimeout(function () { tm = null; renderParent(); }, 1500);
    });
    g.addEventListener('pointerup', function () {
      if (tm) { clearTimeout(tm); tm = null; if (ptype !== 'mouse') toast('Maintenez le doigt 2 secondes'); }
    });
    g.addEventListener('pointerleave', function () { if (tm) { clearTimeout(tm); tm = null; } });
    g.addEventListener('pointercancel', function () { if (tm) { clearTimeout(tm); tm = null; } });
    g.addEventListener('click', function () { if (ptype === 'mouse') renderParent(); });
  }

  /* ---------- routine : cartes numérotées avec flèches ---------- */
  function openRoutine(id) {
    var r = ROUTINES.filter(function (x) { return x.id === id; })[0];
    R = { r: r, idx: 0 };
    renderRoutine();
  }
  function renderRoutine() {
    stopGame();
    var r = R.r, i = R.idx, n = r.steps.length;
    var portrait = window.innerHeight > window.innerWidth;
    var rows = (n >= 7 || (n >= 5 && portrait)) ? 2 : 1;
    var cols = Math.ceil(n / rows);
    var h = '<div class="view rt' + cls() + '">';
    h += '<div class="rt-head">' + rbtn('home', 'back', 'small') + '<div class="rt-titles"><div class="rt-title">' + esc(r.title) +
      '</div><div class="rt-sub">Je suis les étapes une par une</div></div>' + rbtn('speak', 'speak', 'small') + '</div>';
    h += '<div class="rt-cards" style="--cols:' + cols + ';--ar:' + (rows === 1 ? '125%' : '100%') + '">';
    r.steps.forEach(function (st, d) {
      var state = d < i ? 'done' : (d === i ? 'cur' : '');
      var lastInRow = (d % cols === cols - 1) || d === n - 1;
      h += '<div class="rc ' + state + '" data-act="say-step" data-i="' + d + '"><div class="rw"><div class="rimg"><img alt="" draggable="false" src="' + stepSrc(r.id, d) +
        '"><div class="badge">' + (d < i ? '✓' : (d + 1)) + '</div></div>' + (lastInRow ? '' : '<div class="arr">' + arrowSVG() + '</div>') +
        '</div><div class="rtx"><div class="rt1">' + esc(stepLabel(r.id, d)) + '</div>' +
        ((S.desc && st.d) ? '<div class="rt2">' + esc(st.d) + '</div>' : '') + '</div></div>';
    });
    h += '</div><div class="rt-foot"><button class="pill" data-act="restart">' + icon('replay') + '<span>Revoir la routine</span></button>' +
      '<button class="cta" data-act="done"><div class="ico">' + icon(i >= n - 1 ? 'smile' : 'next') + '</div><div class="ctx"><b>' + (i >= n - 1 ? 'Fini !' : 'Étape suivante') + '</b></div></button>' +
      rbtn('home', 'home', '') + '</div></div>';
    app.innerHTML = h;
    sizeCards(cols, rows);
  }
  function sizeCards(cols, rows) {
    var box = $('.rt-cards'); if (!box) return;
    var W = box.clientWidth, H = box.clientHeight, vm = Math.min(window.innerWidth, window.innerHeight) / 100;
    var ratio = rows === 1 ? 1.25 : 1.0, textH = (R.r.steps.some(function (x) { return x.d; }) && S.desc ? 15 : 9) * vm;
    if (!S.text) textH = 0;
    var colw = (W - 4 * vm - (cols - 1) * 4.4 * vm) / cols;
    var imgH = H / rows - 2 * vm - textH - 2.4 * vm - 1.6 * vm;
    var imgW = Math.max(8 * vm, Math.min(colw - 2.4 * vm, imgH / ratio));
    var cw = Math.round(imgW + 2.4 * vm);
    box.style.gridTemplateColumns = 'repeat(' + cols + ',' + cw + 'px)';
    box.style.justifyContent = 'center';
  }
  var rzTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () { if (R && R.r && $('.rt')) renderRoutine(); }, 200);
  });

  /* ---------- fin ---------- */
  function renderEnd(kind, info) {
    var replay = kind === 'routine' ? 'again-r' : 'again-g';
    if (kind === 'routine') {
      app.innerHTML = '<div class="view end fin' + cls() + '"><div class="fini-pic"><img alt="" src="' + finiSrc() + '"></div>' +
        '<div class="msg">Fini !</div><div class="row">' + rbtn(replay, 'replay') + rbtn('home', 'home') + '</div></div>';
      return;
    }
    var h = '<div class="view end' + cls() + '"><svg class="big" viewBox="0 0 100 100"><polygon points="' + starPts(50, 53, 46, 20) +
      '" fill="#F7DC7A" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/></svg>' +
      '<div class="msg">Bravo !</div>' + (info ? '<div class="sub">' + info + '</div>' : '') +
      '<div class="row">' + rbtn(replay, 'replay') + rbtn('home', 'home') + '</div></div>';
    app.innerHTML = h;
  }

  /* =====================================================
     JEUX À UNE CIBLE : on glisse la bonne carte sur le modèle
  ===================================================== */
  var GAMES = {
    chiffres: function (level, prev) {
      var max = level === 1 ? 5 : 10, rev = level === 3, count = level === 3 ? 4 : 3, nums = [], i;
      for (i = 1; i <= max; i++) nums.push(i);
      var n = pickOther(nums, prev), others = [];
      if (level >= 2) { [n - 2, n - 1, n + 1, n + 2].forEach(function (x) { if (x >= 1 && x <= max) others.push(x); }); }
      others = shuffle(others);
      shuffle(nums).forEach(function (x) { if (x !== n && others.indexOf(x) < 0) others.push(x); });
      var chosen = [n].concat(others.slice(0, count - 1));
      var things = allObjets().filter(function (o) { return o.compter; });
      var th = things[rand(things.length)];
      return {
        topic: n, correct: String(n), say: NUM_FR[n],
        target: rev ? groupHTML(th.id, n) : numeral(n),
        options: shuffle(chosen).map(function (x) { return { key: String(x), html: rev ? numeral(x) : groupHTML(th.id, x) }; })
      };
    },
    formes: function (level, prev) {
      var shape = pickOther(SHAPES, prev), count = level + 2;
      var shapes = [shape].concat(shuffle(SHAPES.filter(function (s) { return s !== shape; })).slice(0, count - 1));
      var cols = shuffle(COLORS);
      return {
        topic: shape, correct: shape, say: SHAPE_FR[shape], target: shapeSVG(shape, NEUTRAL),
        options: shuffle(shapes).map(function (s, i) { return { key: s, html: shapeSVG(s, cols[i].h) }; })
      };
    },
    couleurs: function (level, prev) {
      var names = COLORS.map(function (c) { return c.n; }), name = pickOther(names, prev), count = level + 2;
      var chosen = [name].concat(shuffle(names.filter(function (x) { return x !== name; })).slice(0, count - 1));
      return {
        topic: name, correct: name, say: name,
        target: '<div class="swatch" style="background:' + hexOf(name) + '"></div>',
        options: shuffle(chosen).map(function (c) { return { key: c, html: shapeSVG(SHAPES[rand(SHAPES.length)], hexOf(c)) }; })
      };
    },
    lettres: function (level, prev) {
      var pool = allObjets().filter(function (o) { return initial(o); });
      var letters = unique(pool.map(initial));
      var L = pickOther(letters, prev), count = level + 2;
      var goods = pool.filter(function (o) { return initial(o) === L; });
      var good = goods[rand(goods.length)], picked = [], seen = {};
      shuffle(pool.filter(function (o) { return initial(o) !== L; })).forEach(function (o) {
        var i = initial(o);
        if (picked.length < count - 1 && !seen[i]) { seen[i] = 1; picked.push(o); }
      });
      return {
        topic: L, correct: good.id, say: LETTER_FR[L.toLowerCase()] || L, target: '<div class="letter">' + L + '</div>',
        options: shuffle([good].concat(picked)).map(function (o) { return { key: o.id, html: objCard(o), say: o.nom }; })
      };
    },
    casse: function (level, prev) {
      var alpha = 'abcdefghijklmnopqrstuvwxyz'.split(''), rev = level === 3, count = level === 1 ? 3 : 4;
      var l = pickOther(alpha, prev);
      var sim = [];
      SIM.forEach(function (g) { if (g.indexOf(l) >= 0) g.split('').forEach(function (c) { if (c !== l && sim.indexOf(c) < 0) sim.push(c); }); });
      var others = [];
      if (level >= 2) shuffle(sim).slice(0, 2).forEach(function (c) { others.push(c); });
      shuffle(alpha).forEach(function (c) {
        if (c !== l && others.indexOf(c) < 0 && (level >= 2 || sim.indexOf(c) < 0)) others.push(c);
      });
      var chosen = [l].concat(others.slice(0, count - 1));
      var shown = function (c) { return rev ? c : c.toUpperCase(); };
      var opt = function (c) { return rev ? c.toUpperCase() : c; };
      return {
        topic: l, correct: l, say: LETTER_FR[l],
        target: '<div class="letter">' + shown(l) + '</div>',
        options: shuffle(chosen).map(function (c) { return { key: c, html: '<div class="lt">' + opt(c) + '</div>', say: LETTER_FR[c] }; })
      };
    },
    objets: function (level, prev) {
      var pool = allObjets().filter(function (o) { return o.forme; });
      var shape = pickOther(OBJ_SHAPES, prev), count = level + 2;
      var goods = pool.filter(function (o) { return o.forme === shape; });
      var good = goods[rand(goods.length)], picked = [];
      shuffle(OBJ_SHAPES.filter(function (s) { return s !== shape; })).forEach(function (s) {
        var c = pool.filter(function (o) { return o.forme === s; });
        if (picked.length < count - 1 && c.length) picked.push(c[rand(c.length)]);
      });
      return {
        topic: shape, correct: good.id, say: SHAPE_FR[shape], target: shapeSVG(shape, NEUTRAL),
        options: shuffle([good].concat(picked)).map(function (o) { return { key: o.id, html: objCard(o), say: o.nom }; })
      };
    }
  };

  function later(fn, ms) {
    var g = G; if (!g) return;
    var id = setTimeout(function () { if (G === g) fn(); }, ms);
    g.timers.push(id);
  }

  function frameHTML() {
    return '<div class="view game' + cls() + '"><div class="topbar">' + rbtn('home', 'home', 'small') +
      '<div class="progress" id="progress"></div>' + rbtn('demo', 'play', 'small') + '</div><div class="arena" id="arena"></div></div>';
  }
  function setDots() {
    var p = $('#progress'); if (!p || !G) return;
    var total = G.total, done = G.kind === 'single' ? G.round : G.placed;
    if (p.childNodes.length !== total) {
      var s = ''; for (var i = 0; i < total; i++) s += '<div class="pdot"></div>'; p.innerHTML = s;
    }
    $$('.pdot', p).forEach(function (d, i) { if (i < done) d.classList.add('on'); else d.classList.remove('on'); });
  }
  function banner(txt, on) {
    var b = $('#banner'); if (!b) return;
    if (txt) b.textContent = txt;
    if (on) b.classList.add('show'); else b.classList.remove('show');
  }

  function openGame(id) {
    stopGame();
    if (tileOf(id).multi) return openMulti(id);
    if (tileOf(id).count) return openCount(id);
    G = { kind: 'single', id: id, level: S.levels[id] || 1, round: 0, total: 6, firstTry: 0, tries: 0, prev: null, locked: true, demoing: true, timers: [] };
    app.innerHTML = frameHTML();
    $('#arena').innerHTML = '<div class="target" id="target" data-act="say-target"></div><div class="options" id="options"></div><div class="banner" id="banner"></div>';
    setDots();
    runDemo();
  }
  function loadRound() {
    var r = GAMES[G.id](G.level, G.prev);
    G.cur = r; G.prev = r.topic; G.tries = 0; G.locked = false;
    var n = r.options.length, arena = $('#arena');
    arena.style.setProperty('--op', n >= 5 ? 'min(18vmin,180px)' : (n === 4 ? 'min(23vmin,215px)' : 'min(28vmin,260px)'));
    arena.style.setProperty('--tg', 'min(32vmin,290px)');
    var t = $('#target'); t.className = 'target'; t.innerHTML = r.target;
    var box = $('#options'); box.innerHTML = ''; if (!G.demoing) box.classList.remove('demo');
    r.options.forEach(function (o) {
      var d = document.createElement('div');
      d.className = 'opt'; d.setAttribute('data-k', o.key); d.innerHTML = o.html;
      box.appendChild(d);
      attachDrag(d, {
        ok: function () { return G && !G.locked && !G.demoing; },
        start: function () { if (o.say) speak(o.say); },
        drop: function (x, y) { onDrop(d, x, y); }
      });
    });
    setDots();
    var round = G.round;
    later(function () { if (G.round === round && !G.locked) speak(r.say); }, 350);
  }

  function springBack(d) { d.classList.remove('drag'); d.style.transition = ''; d.style.transform = ''; }
  // déplace l'élément jusqu'au centre de la cible (en le réduisant pour qu'il y tienne)
  function flyTo(d, targetEl, ms, fitScale) {
    var prev = d.style.transform;
    d.style.transition = 'none'; d.style.transform = '';
    var r = d.getBoundingClientRect(), oc = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    d.style.transform = prev; void d.offsetWidth;
    var t = targetEl.getBoundingClientRect();
    var dx = t.left + t.width / 2 - oc.x, dy = t.top + t.height / 2 - oc.y;
    var sc = fitScale === undefined ? Math.min(1, (Math.min(t.width, t.height) * 0.92) / Math.max(r.width, r.height)) : fitScale;
    d.style.transition = 'transform ' + (ms || 400) + 'ms ease';
    d.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')';
  }
  function attachDrag(el, cfg) {
    var sx = 0, sy = 0, on = false, pid = null;
    el.addEventListener('pointerdown', function (e) {
      if (!cfg.ok()) return;
      on = true; pid = e.pointerId; sx = e.clientX; sy = e.clientY;
      try { el.setPointerCapture(pid); } catch (er) {}
      el.classList.add('drag'); el.style.transition = 'none';
      if (cfg.start) cfg.start();
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!on || e.pointerId !== pid) return;
      el.style.transform = 'translate(' + (e.clientX - sx) + 'px,' + (e.clientY - sy) + 'px) scale(1.05)';
    });
    el.addEventListener('pointerup', function (e) {
      if (!on || e.pointerId !== pid) return;
      on = false; cfg.drop(e.clientX, e.clientY);
    });
    el.addEventListener('pointercancel', function () { if (on) { on = false; springBack(el); } });
  }
  function lockAll() { $$('.opt').forEach(function (o) { o.classList.add('locked'); }); }
  function tick() {
    var t = $('#target'); if (!t) return;
    var k = document.createElement('div'); k.className = 'tick'; k.textContent = '✓'; t.appendChild(k);
  }

  function success(d) {
    G.locked = true; lockAll();
    d.classList.remove('hint'); d.classList.add('ok'); d.classList.remove('drag');
    flyTo(d, $('#target'), 400); tick(); sndBravo();
    if (G.tries === 0) G.firstTry++;
    G.round++; setDots();
    later(function () { if (G.round >= G.total) finishGame(); else loadRound(); }, 1800);
  }
  function wrong(d) {
    G.tries++; sndUhUh();
    var t = $('#target'); t.classList.remove('wiggle'); void t.offsetWidth; t.classList.add('wiggle');
    springBack(d);
    if (G.tries >= 2) {
      $$('.opt').forEach(function (o) { if (o.getAttribute('data-k') === G.cur.correct) o.classList.add('hint'); });
    }
  }
  function onDrop(d, x, y) {
    if (!G || G.locked) { springBack(d); return; }
    var t = $('#target').getBoundingClientRect(), pad = Math.min(t.width, t.height) * 0.25;
    var inside = x > t.left - pad && x < t.right + pad && y > t.top - pad && y < t.bottom + pad;
    if (!inside) { springBack(d); return; }
    if (d.getAttribute('data-k') === G.cur.correct) success(d); else wrong(d);
  }

  /* ---------- démonstration (main qui montre) ---------- */
  function newFinger() {
    removeFinger();
    var f = document.createElement('div'); f.className = 'finger'; f.textContent = '👆'; document.body.appendChild(f);
    return f;
  }
  function removeFinger() { var f = $('.finger'); if (f && f.parentNode) f.parentNode.removeChild(f); }
  function putFinger(f, p, ms) {
    f.style.transition = ms ? 'transform ' + ms + 'ms ease-in-out' : 'none';
    f.style.transform = 'translate(' + (p.x - f.offsetWidth / 2) + 'px,' + (p.y - f.offsetHeight * 0.08) + 'px)';
  }
  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  function runDemo() {
    var g = G;
    g.demoing = true;
    loadRound(); g.locked = true;
    var box = $('#options'); box.classList.add('demo');
    var f = newFinger(), card = null;
    banner('👀', true);
    later(function () {
      banner('', false);
      card = $$('.opt').filter(function (o) { return o.getAttribute('data-k') === g.cur.correct; })[0];
      var c = center(card);
      putFinger(f, { x: c.x, y: c.y + 140 }, 0); f.style.opacity = '1'; void f.offsetWidth;
      putFinger(f, c, 1000);
    }, 1200);
    later(function () { flyTo(card, $('#target'), 1100); putFinger(f, center($('#target')), 1100); }, 2500);
    later(function () { card.classList.add('ok'); tick(); sndChime(); f.style.opacity = '0'; }, 3800);
    later(function () {
      removeFinger(); g.demoing = false; loadRound(); banner('👆', true);
    }, 5400);
    later(function () { banner('', false); }, 6600);
  }
  function skipDemo() {
    if (!G || !G.demoing) return;
    G.timers.forEach(clearTimeout); G.timers = [];
    removeFinger(); G.demoing = false;
    if (G.kind === 'single') loadRound(); else buildBoard();
  }

  function finishGame() {
    var g = G, again = g.id, tile = tileOf(again), up = false;
    var good = g.kind === 'single' ? g.firstTry >= 5 : g.firstTry >= g.total - 1;
    if (good && g.level < tile.max) { S.levels[again] = g.level + 1; saveS(); up = true; }
    stopGame();
    renderEnd('game', S.text ? 'Niveau ' + (S.levels[again] || 1) + (up ? ' — on monte d’un niveau !' : '') : '');
    R = { gameId: again };
  }

  /* =====================================================
     JEUX À PLUSIEURS PIÈCES : catégories, voitures, tableau, mots
     Chaque pièce a une zone d'arrivée (zone) ; on la glisse jusqu'à la bonne.
  ===================================================== */
  var MULTI = {
    categories: function (level) {
      var ncat = level === 1 ? 2 : 3, per = level === 3 ? 3 : 2, objs = allObjets();
      var cats = shuffle(CATEGORIES.filter(function (c) {
        return objs.filter(function (o) { return o.cat === c.id; }).length >= per;
      })).slice(0, ncat);
      var zones = '', pieces = [];
      cats.forEach(function (c) {
        zones += '<div class="zone cz" data-z="' + c.id + '" data-cap="n" data-act="say-zone" data-say="' + esc(c.nom) + '"><div class="zh">' +
          imgTag(c.icone) + '<div class="zt">' + esc(c.nom) + '</div></div><div class="zin"></div></div>';
        shuffle(objs.filter(function (o) { return o.cat === c.id; })).slice(0, per).forEach(function (o) {
          pieces.push({ key: o.id, zone: c.id, html: imgTag(o.id), say: o.nom });
        });
      });
      return { cls: 'cats', board: zones, pieces: shuffle(pieces), poolMax: 6, pw: 15, ph: 15 };
    },
    voitures: function (level) {
      var n = level + 2, cols = shuffle(CAR_COLORS).slice(0, n), dir = rand(2) ? 'left' : 'right';
      var strip = '<div class="cstrip" data-act="say-strip" data-say="' + cols.map(function (c) { return c.n; }).join(', ') + '">';
      cols.forEach(function (c) { strip += '<span class="cdot" style="background:' + c.h + '"></span>'; });
      strip += '<span class="carrow">' + arrowSVG(dir) + '</span></div>';
      var road = '<div class="road">';
      for (var i = 0; i < n; i++) road += '<div class="zone slot" data-z="' + i + '"><div class="zin"></div></div>';
      road += '</div>';
      var order = shuffle(cols);
      while (n > 1 && order.map(function (c) { return c.n; }).join() === cols.map(function (c) { return c.n; }).join()) order = shuffle(cols);
      var pieces = order.map(function (c) { return { key: c.n, zone: String(cols.indexOf(c)), html: carSVG(c.h, dir), say: c.n }; });
      var w = n >= 5 ? 17 : 21;
      return { cls: 'cars', board: strip + road, pieces: pieces, poolMax: n, pw: w, ph: w * 0.64 };
    },
    tableau: function (level) {
      var nc = level === 1 ? 2 : (level === 2 ? 3 : 4), nr = level === 1 ? 2 : 3;
      var cols = shuffle(COLORS).slice(0, nc), shapes = shuffle(SHAPES).slice(0, nr);
      var h = '<div class="tbl" style="--cols:' + (nc + 1) + '"><div class="tc"></div>';
      cols.forEach(function (c) { h += '<div class="tc hd" data-act="say-strip" data-say="' + c.n + '">' + shapeSVG('circle', c.h) + '</div>'; });
      var pieces = [];
      shapes.forEach(function (s, r) {
        h += '<div class="tc hd" data-act="say-strip" data-say="' + SHAPE_FR[s] + '">' + shapeSVG(s, NEUTRAL) + '</div>';
        cols.forEach(function (c, ci) {
          h += '<div class="tc"><div class="zone cell" data-z="' + r + '-' + ci + '"><div class="zin"></div></div></div>';
          pieces.push({ key: s + c.n, zone: r + '-' + ci, html: shapeSVG(s, c.h), say: shapeColorSay(s, c.n) });
        });
      });
      return { cls: 'tbl-board', board: h + '</div>', pieces: shuffle(pieces), poolMax: 5, pw: 11, ph: 11 };
    },
    ordre: function (level) {
      var n = level === 1 ? 5 : 10, given = level === 1 ? [1] : (level === 2 ? [1, 3, 5, 7, 10] : [1, 10]);
      var h = '<div class="numstrip">', pieces = [];
      for (var i = 1; i <= n; i++) {
        if (given.indexOf(i) >= 0) h += '<div class="zone nz filled" data-z="' + i + '"><div class="zin"><div class="placed"><span class="wt nm">' + i + '</span></div></div></div>';
        else { h += '<div class="zone nz" data-z="' + i + '"><div class="zin"></div></div>'; pieces.push({ key: String(i), zone: String(i), html: '<span class="wt nm">' + i + '</span>', say: NUM_FR[i] }); }
      }
      return { cls: 'numbers', board: h + '</div>', pieces: shuffle(pieces), poolMax: Math.min(5, pieces.length), pw: 14, ph: 14 };
    },
    mots: function (level) {
      var n = level === 1 ? 3 : (level === 2 ? 4 : 6), items = shuffle(allObjets()).slice(0, n);
      var zones = '', pieces = [];
      items.forEach(function (o) {
        var w = o.nom.toLowerCase();
        zones += '<div class="zone wcard" data-z="' + o.id + '" data-act="say-zone" data-say="' + esc(o.nom) + '"><div class="wimg">' + imgTag(o.id) +
          '</div><div class="wword">' + esc(w) + '</div><div class="zin"></div></div>';
        pieces.push({ key: o.id, zone: o.id, html: '<span class="wt">' + esc(w) + '</span>', say: o.nom });
      });
      return { cls: 'words', board: zones, style: '--wc:' + (n === 4 ? 4 : 3), pieces: shuffle(pieces), poolMax: n, pw: 23, ph: 9.5 };
    }
  };

  function openCount(id) {
    var lvl = S.levels[id] || 1, n = lvl === 1 ? 5 : 10;
    G = { kind: 'count', id: id, level: lvl, timers: [], locked: false, demoing: false, placed: 0, total: n, firstTry: n };
    app.innerHTML = frameHTML();
    var things = allObjets().filter(function (o) { return o.compter; }), th = things[rand(things.length)];
    var sz = n === 5 ? 24 : 19, h = '<div class="cnum" id="cnum"></div><div class="cgrid" style="--cs:' + sz + 'vmin">';
    for (var i = 0; i < n; i++) h += '<div class="cobj" data-act="count-it">' + imgTag(th.id) + '<div class="cb"></div></div>';
    $('#arena').innerHTML = h + '</div><div class="banner" id="banner"></div>';
    setDots();
    speak('Comptons');
  }
  function countIt(el) {
    if (!G || G.kind !== 'count' || el.classList.contains('on') || G.locked) return;
    G.placed++; var n = G.placed;
    el.classList.add('on'); el.querySelector('.cb').textContent = n;
    $('#cnum').textContent = n; setDots();
    if (n >= G.total) { G.locked = true; if (S.sound) sndChime(); speak(NUM_FR[n]); sndBravoLater(); }
    else { sndChime(); speak(NUM_FR[n]); }
  }
  function sndBravoLater() { later(function () { sndBravo(); }, 900); later(finishGame, 2600); }

  function openMulti(id) {
    G = { kind: 'multi', id: id, level: S.levels[id] || 1, timers: [], locked: true, demoing: true, placed: 0, firstTry: 0, bad: {}, total: 0 };
    app.innerHTML = frameHTML();
    runDemoMulti();
  }
  function buildBoard() {
    var b = MULTI[G.id](G.level);
    G.b = b; G.queue = b.pieces.slice(); G.total = b.pieces.length; G.placed = 0; G.locked = false; G.bad = {}; G.firstTry = 0;
    var arena = $('#arena');
    arena.style.setProperty('--pw', b.pw + 'vmin'); arena.style.setProperty('--ph', b.ph + 'vmin');
    arena.innerHTML = '<div class="board ' + b.cls + '" id="board"' + (b.style ? ' style="' + b.style + '"' : '') + '>' + b.board +
      '</div><div class="pool" id="pool"></div><div class="banner" id="banner"></div>';
    var pool = $('#pool'), n = Math.min(b.poolMax, G.queue.length);
    for (var i = 0; i < n; i++) {
      var slot = document.createElement('div'); slot.className = 'pslot'; pool.appendChild(slot); fillSlot(slot);
    }
    setDots();
  }
  function fillSlot(slot) {
    var p = G.queue.shift();
    if (!p) { slot.className = 'pslot empty'; slot.innerHTML = ''; return; }
    slot.className = 'pslot';
    slot.innerHTML = '<div class="piece pop" data-k="' + esc(p.key) + '" data-z="' + esc(p.zone) + '">' + p.html + '</div>';
    var el = slot.firstChild; el.__p = p;
    attachDrag(el, {
      ok: function () { return G && !G.locked && !G.demoing && !el.classList.contains('ok'); },
      start: function () { speak(p.say); },
      drop: function (x, y) { dropMulti(el, x, y); }
    });
  }
  function dropMulti(el, x, y) {
    if (!G || G.locked) { springBack(el); return; }
    var hit = null, best = 1e9;
    $$('#board .zone').forEach(function (z) {
      var r = z.getBoundingClientRect(), pad = Math.min(r.width, r.height) * 0.06;
      if (x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad) {
        var d = Math.abs(x - (r.left + r.width / 2)) + Math.abs(y - (r.top + r.height / 2));
        if (d < best) { best = d; hit = z; }
      }
    });
    if (!hit) { springBack(el); return; }
    if (hit.getAttribute('data-z') === el.getAttribute('data-z') && !hit.classList.contains('filled')) placeOK(el, hit);
    else placeBad(el, hit);
  }
  function placeBad(el, zone) {
    var k = el.getAttribute('data-k');
    G.bad[k] = (G.bad[k] || 0) + 1;
    sndUhUh();
    zone.classList.remove('wiggle'); void zone.offsetWidth; zone.classList.add('wiggle');
    springBack(el);
    if (G.bad[k] >= 2) {
      var good = $('#board .zone[data-z="' + el.getAttribute('data-z') + '"]');
      if (good) good.classList.add('hint');
    }
  }
  function placeOK(el, zone) {
    var p = el.__p, slot = el.parentNode;
    el.classList.add('ok'); el.classList.remove('drag');
    zone.classList.remove('hint');
    if (!G.bad[p.key]) G.firstTry++;
    G.placed++; setDots();
    var last = G.placed >= G.total;
    if (last) { G.locked = true; sndBravo(); } else { sndChime(); }
    var zin = zone.querySelector('.zin');
    flyTo(el, zin || zone, 380);
    later(function () {
      var t = document.createElement('div'); t.className = 'placed'; t.innerHTML = p.html; zin.appendChild(t);
      if (zone.getAttribute('data-cap') !== 'n') zone.classList.add('filled');
      fillSlot(slot);
      if (last) later(finishGame, 1000);
    }, 420);
  }

  function runDemoMulti() {
    var g = G;
    g.demoing = true;
    buildBoard(); g.locked = true;
    var f = newFinger(), piece = null, zone = null;
    banner('👀', true);
    later(function () {
      banner('', false);
      piece = $('#pool .piece');
      zone = $('#board .zone[data-z="' + piece.getAttribute('data-z') + '"]');
      var c = center(piece);
      putFinger(f, { x: c.x, y: c.y + 140 }, 0); f.style.opacity = '1'; void f.offsetWidth;
      putFinger(f, c, 1000); speak(piece.__p.say);
    }, 1200);
    later(function () { var tg = zone.querySelector('.zin') || zone; flyTo(piece, tg, 1100); putFinger(f, center(tg), 1100); }, 2500);
    later(function () { piece.classList.add('ok'); zone.classList.add('hint'); sndChime(); f.style.opacity = '0'; }, 3800);
    later(function () { removeFinger(); g.demoing = false; buildBoard(); banner('👆', true); }, 5400);
    later(function () { banner('', false); }, 6600);
  }

  /* =====================================================
     ESPACE PARENT
  ===================================================== */
  function toggleRow(key, label) {
    return '<div class="row" data-act="toggle" data-key="' + key + '"><span>' + label + '</span><div class="sw ' + (S[key] ? 'on' : '') + '"></div></div>';
  }
  function uploadBtn(key, ratio) {
    return '<label class="pbtn">Photo<input type="file" accept="image/*" data-up="' + key + '" data-ratio="' + ratio + '"></label>' +
      '<button class="pbtn grey" data-act="reset-img" data-key="' + key + '">↺</button>';
  }
  function renderParent() {
    stopGame();
    var scroll = $('.parent') ? $('.parent').scrollTop : 0;
    var h = '<div class="view parent"><div class="topbar">' + rbtn('home', 'home', 'small') + '<div class="title">Espace parent</div><div style="width:9vmin"></div></div>';
    h += '<div class="card">' + toggleRow('sound', 'Sons (bravo / uh uh)') + toggleRow('voice', 'Voix : dit les mots, les couleurs, les formes… et « Bravo ! »') +
      toggleRow('text', 'Afficher les textes') + toggleRow('desc', 'Afficher les petites explications sous les étapes') + '</div>';
    ROUTINES.forEach(function (r) {
      h += '<h2>' + esc(r.title) + '</h2><div class="card"><div class="steps">';
      r.steps.forEach(function (s, i) {
        var key = r.id + ':' + i;
        h += '<div class="step"><img alt="" src="' + stepSrc(r.id, i) + '">' +
          '<div class="nm" data-act="rename" data-key="' + key + '" data-name="' + esc(stepLabel(r.id, i)) + '">' + (i + 1) + '. ' + esc(stepLabel(r.id, i)) + '</div>' +
          '<div class="btns">' + uploadBtn(key, 0.8) + '</div></div>';
      });
      h += '</div></div>';
    });
    h += '<h2>Image de fin (« Fini ! »)</h2><div class="card"><div class="steps"><div class="step"><img alt="" src="' + finiSrc() + '"><div class="btns">' + uploadBtn('fini', 0.75) + '</div></div></div></div>';
    h += '<h2>Images des jeux</h2><div class="card"><p class="note">Remplacez une image par votre photo. Touchez ↺ pour revenir à l’image d’origine.</p><div class="steps">';
    OBJETS.forEach(function (o) {
      h += '<div class="step sq"><img alt="" src="' + objSrc(o.id) + '"><div class="nm">' + esc(o.nom) + '</div><div class="btns">' + uploadBtn('obj:' + o.id, 1) + '</div></div>';
    });
    h += '</div></div>';
    // cartes personnelles
    h += '<h2>Mes cartes (nom + photo)</h2><div class="card"><p class="note">Ajoutez une photo avec son nom (par exemple le prénom de l’enfant, sa famille, ses jouets). Ces cartes apparaissent dans les jeux « Les mots », « Lettres » et « Catégories » (si vous choisissez une catégorie).</p>' +
      '<div class="addrow"><input id="cname" type="text" placeholder="Nom (ex. Iyed)" maxlength="24"><select id="ccat"><option value="">Sans catégorie</option>' +
      CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.nom) + '</option>'; }).join('') +
      '</select><label class="pbtn big">+ Choisir la photo<input id="cfile" type="file" accept="image/*"></label></div><div class="steps">';
    S.custom.forEach(function (o) {
      if (!blobURL['obj:' + o.id]) return;
      h += '<div class="step sq"><img alt="" src="' + blobURL['obj:' + o.id] + '"><div class="nm">' + esc(o.nom) + '</div><div class="btns"><button class="pbtn red" data-act="del-custom" data-id="' + o.id + '">Supprimer</button></div></div>';
    });
    h += '</div></div>';
    h += '<h2>Niveaux</h2><div class="card"><div class="row"><span>' + GAME_TILES.map(function (g) { return g.title.toLowerCase() + ' ' + (S.levels[g.id] || 1); }).join(' · ') + '</span>' +
      '<button class="pbtn grey" data-act="reset-levels">Remettre à 1</button></div>' +
      '<p class="note">Le niveau monte tout seul quand l’enfant réussit presque tout du premier coup.</p></div>';
    h += '<h2>Photos</h2><div class="card"><p class="note">Les photos que vous ajoutez restent <b>uniquement sur cette tablette</b> et ne sont jamais envoyées en ligne. Touchez le nom d’une étape pour changer son texte. Sur ordinateur, un clic sur la roue ⚙ de l’accueil ouvre cet espace ; sur la tablette, un appui long.</p>' +
      '<div class="btns"><button class="pbtn red" data-act="reset-all">Effacer toutes mes photos</button></div></div>';
    h += '<p class="note credit">Illustrations provisoires des jeux : Twemoji © Twitter, Inc. et contributeurs, licence CC-BY 4.0 (creativecommons.org/licenses/by/4.0). Photos des étapes des mains et dessins des routines : fournis par la famille.</p></div>';
    app.innerHTML = h;
    var p = $('.parent'); if (p) p.scrollTop = scroll;
    $$('input[data-up]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0]; if (!f) return;
        var key = inp.getAttribute('data-up'), ratio = parseFloat(inp.getAttribute('data-ratio')) || 1;
        withBusy(function (end) {
          resizeImage(f, ratio, function (blob) {
            if (!blob) return end();
            putBlob(key, blob, function () { end(); });
          });
        });
      });
    });
    var cf = $('#cfile');
    if (cf) cf.addEventListener('change', function () {
      var f = cf.files && cf.files[0]; if (!f) return;
      var name = ($('#cname').value || '').trim();
      if (!name) { toast('Écrivez d’abord le nom'); cf.value = ''; return; }
      var cat = $('#ccat').value, id = 'c' + Date.now();
      withBusy(function (end) {
        resizeImage(f, 1, function (blob) {
          if (!blob) return end();
          putBlob('obj:' + id, blob, function (ok) { if (ok) { S.custom.push({ id: id, nom: name, cat: cat }); saveS(); } end(); });
        });
      });
    });
  }
  function withBusy(fn) {
    var busy = document.createElement('div'); busy.className = 'busy'; busy.textContent = '…'; document.body.appendChild(busy);
    fn(function () { if (busy.parentNode) busy.parentNode.removeChild(busy); renderParent(); });
  }

  /* =====================================================
     ÉVÉNEMENTS
  ===================================================== */
  // toucher l'écran pendant la démonstration = la passer
  app.addEventListener('pointerdown', function (e) {
    if (G && G.demoing && e.target.closest && e.target.closest('#arena')) skipDemo();
  });
  app.addEventListener('click', function (e) {
    var t = e.target;
    function hasAct(n) {
      return n.getAttribute && (n.getAttribute('data-act') || (n.classList.contains('tile') && (n.getAttribute('data-r') || n.getAttribute('data-g'))));
    }
    while (t && t !== app && !hasAct(t)) t = t.parentNode;
    if (!t || t === app) return;
    var act = t.getAttribute('data-act');
    if (!act) {
      if (t.getAttribute('data-r')) return openRoutine(t.getAttribute('data-r'));
      return openGame(t.getAttribute('data-g'));
    }
    switch (act) {
      case 'home': renderHome(); break;
      case 'restart': R.idx = 0; renderRoutine(); break;
      case 'done':
        if (R.idx >= R.r.steps.length - 1) { var rid = R.r.id; sndBravo(true); speak('Fini !'); renderEnd('routine'); R = { routineId: rid }; }
        else { R.idx++; sndChime(); renderRoutine(); }
        break;
      case 'count-it': countIt(t); break;
      case 'say-step': speak(stepLabel(R.r.id, +t.getAttribute('data-i'))); break;
      case 'speak': if (R && R.r) speak(stepLabel(R.r.id, R.idx)); break;
      case 'say-target': if (G && G.cur && !G.demoing) speak(G.cur.say); break;
      case 'say-zone': case 'say-strip': if (G && !G.demoing) speak(t.getAttribute('data-say')); break;
      case 'again-r': openRoutine(R.routineId); break;
      case 'again-g': openGame(R.gameId); break;
      case 'demo': if (G) openGame(G.id); break;
      case 'toggle': var k = t.getAttribute('data-key'); S[k] = !S[k]; saveS(); renderParent(); break;
      case 'rename':
        var key = t.getAttribute('data-key'), cur = t.getAttribute('data-name');
        var v = window.prompt('Texte de l’étape', cur);
        if (v !== null) { v = v.trim(); if (v) S.labels[key] = v; else delete S.labels[key]; saveS(); renderParent(); }
        break;
      case 'reset-img': delBlob(t.getAttribute('data-key'), renderParent); break;
      case 'del-custom':
        var cid = t.getAttribute('data-id');
        delBlob('obj:' + cid, function () { S.custom = S.custom.filter(function (o) { return o.id !== cid; }); saveS(); renderParent(); });
        break;
      case 'reset-levels': S.levels = {}; saveS(); renderParent(); break;
      case 'reset-all':
        if (window.confirm('Effacer toutes les photos ajoutées sur cette tablette ?')) {
          dbClear(function () {
            for (var u in blobURL) URL.revokeObjectURL(blobURL[u]);
            blobURL = {}; S.custom = []; saveS(); renderParent();
          });
        }
        break;
    }
  });
  // aide aux tests et au dépannage : bonne réponse du tour en cours
  window.__correct = function () { return G && G.cur ? G.cur.correct : null; };

  /* =====================================================
     DÉMARRAGE
  ===================================================== */
  openDB(function () {
    loadBlobs(function () {
      probeAll(function () {
        renderHome();
        try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
      });
    });
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
