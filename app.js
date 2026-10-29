(function () {
  'use strict';

  /* =====================================================
     DONNÉES
  ===================================================== */
  var ROUTINES = [
    { id: 'mains', title: 'Je me lave les mains', icon: 2,
      steps: ["J'ouvre le robinet", 'Je pompe le savon', 'Je me savonne', 'Je rince mes mains', 'Je ferme le robinet', 'Je sèche mes mains'] },
    { id: 'dents', title: 'Je me lave les dents', icon: 2,
      steps: ['Prendre la brosse à dents', 'Mettre du dentifrice', 'Se brosser les dents', 'Se rincer la bouche', 'Ranger la brosse à dents'] },
    { id: 'habillage', title: "Je m'habille", icon: 1,
      steps: ['Je mets mon sous-vêtement', 'Je mets mon t-shirt', 'Je mets mon pantalon', 'Je mets mes chaussettes', 'Je mets mes chaussures'] },
    { id: 'collation', title: 'La collation', icon: 2,
      steps: ['Se laver les mains', 'Prendre la collation', 'Manger', 'Boire', 'Jeter les déchets'] }
  ];

  var COLORS = [
    { n: 'rouge', h: '#EF7B76' }, { n: 'bleu', h: '#6FB1E6' }, { n: 'vert', h: '#7CCB92' },
    { n: 'jaune', h: '#F7D560' }, { n: 'orange', h: '#F7A860' }, { n: 'violet', h: '#B58BD6' }
  ];
  var SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
  var OBJ_SHAPES = ['circle', 'square', 'triangle', 'rectangle'];
  var INK = '#4E6B7A';
  var NEUTRAL = '#C9D8E0';
  var OBJETS = window.OBJETS || [];

  var GAME_TILES = [
    { id: 'chiffres', title: 'Compter', max: 3 },
    { id: 'formes', title: 'Formes', max: 3 },
    { id: 'couleurs', title: 'Couleurs', max: 3 },
    { id: 'lettres', title: 'Lettres', max: 2 },
    { id: 'objets', title: 'Formes et objets', max: 2 }
  ];

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

  /* =====================================================
     RÉGLAGES (localStorage)
  ===================================================== */
  var S = { sound: true, voice: true, text: true, labels: {}, levels: {} };
  try {
    var saved = JSON.parse(localStorage.getItem('routines-settings') || 'null');
    if (saved) { for (var k in saved) { S[k] = saved[k]; } }
  } catch (e) { /* stockage indisponible */ }
  if (!S.levels) S.levels = {};
  if (!S.labels) S.labels = {};
  function saveS() { try { localStorage.setItem('routines-settings', JSON.stringify(S)); } catch (e) {} }

  /* =====================================================
     SONS
  ===================================================== */
  var ac = null;
  function audio() {
    if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (C) { try { ac = new C(); } catch (e) {} } }
    if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
    return ac;
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
    if (!S.voice || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t);
      u.lang = 'fr-FR'; u.rate = 0.9; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function sndBravo() {
    if (S.sound) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.38, 'triangle', 0.2); }); }
    speak('Bravo !');
  }
  function sndUhUh() {
    if (!S.sound) return;
    tone(330, 0, 0.16, 'triangle', 0.2);
    tone(247, 0.22, 0.26, 'triangle', 0.2);
  }
  function sndStep() {
    if (!S.sound) return;
    tone(660, 0, 0.18, 'triangle', 0.15); tone(880, 0.12, 0.25, 'triangle', 0.15);
  }
  document.addEventListener('pointerdown', function () { audio(); }, true);
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  /* =====================================================
     IMAGES PERSONNALISÉES (IndexedDB) — jamais envoyées en ligne
  ===================================================== */
  var db = null, urlCache = {}, objURL = {};
  function openDB(cb) {
    try {
      var r = indexedDB.open('routines-db', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('img'); };
      r.onsuccess = function () { db = r.result; cb(); };
      r.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function dbGet(key, cb) {
    if (!db) return cb(null);
    try {
      var q = db.transaction('img').objectStore('img').get(key);
      q.onsuccess = function () { cb(q.result || null); };
      q.onerror = function () { cb(null); };
    } catch (e) { cb(null); }
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
  // Chaque image peut être fournie en PNG (prioritaire) ou en SVG : l'application détecte laquelle existe.
  var defMap = {};
  function probeDefaults(cb) {
    var list = [];
    ROUTINES.forEach(function (r) { r.steps.forEach(function (s, i) { list.push('img/' + r.id + '-' + (i + 1)); }); });
    OBJETS.forEach(function (o) { list.push('img/obj/' + o.id); });
    var pending = list.length;
    if (!pending) return cb();
    list.forEach(function (base) {
      var im = new Image();
      im.onload = function () { defMap[base] = base + '.png'; if (--pending === 0) cb(); };
      im.onerror = function () { defMap[base] = base + '.svg'; if (--pending === 0) cb(); };
      im.src = base + '.png';
    });
  }
  function defaultImg(rid, i) { var b = 'img/' + rid + '-' + (i + 1); return defMap[b] || (b + '.svg'); }
  function defaultObj(id) { var b = 'img/obj/' + id; return defMap[b] || (b + '.svg'); }
  function objSrc(id) { return objURL[id] || defaultObj(id); }

  function stepURL(rid, i, cb) {
    var key = rid + ':' + i;
    if (urlCache[key]) return cb(urlCache[key]);
    dbGet(key, function (blob) {
      if (blob) { urlCache[key] = URL.createObjectURL(blob); cb(urlCache[key]); }
      else cb(defaultImg(rid, i));
    });
  }
  function refreshObj(id, cb) {
    if (objURL[id]) { URL.revokeObjectURL(objURL[id]); delete objURL[id]; }
    dbGet('obj:' + id, function (blob) {
      if (blob) objURL[id] = URL.createObjectURL(blob);
      cb();
    });
  }
  function loadObjURLs(cb) {
    var left = OBJETS.length;
    if (!left) return cb();
    OBJETS.forEach(function (o) { refreshObj(o.id, function () { if (--left === 0) cb(); }); });
  }
  function resizeImage(file, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var max = 1000, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
      var c = document.createElement('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (b) { URL.revokeObjectURL(url); cb(b); }, 'image/jpeg', 0.85);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  function stepLabel(rid, i) {
    var r = ROUTINES.filter(function (x) { return x.id === rid; })[0];
    return S.labels[rid + ':' + i] || r.steps[i];
  }

  /* =====================================================
     ÉCRANS : outils communs
  ===================================================== */
  var app = $('#app');
  var G = null, R = null;

  function stopGame() {
    if (G) { G.timers.forEach(clearTimeout); G = null; }
    var f = $('.finger'); if (f && f.parentNode) f.parentNode.removeChild(f);
  }
  function icon(name) {
    var p = {
      home: '<path d="M8 30 L32 9 L56 30 M14 26 V54 H27 V38 H37 V54 H50 V26" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
      back: '<path d="M38 12 L18 32 L38 52" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
      check: '<path d="M10 34 L26 50 L54 16" fill="none" stroke="#5FB08D" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
      speak: '<path d="M10 24 H20 L34 12 V52 L20 40 H10 Z" fill="' + INK + '"/><path d="M42 22 Q50 32 42 42 M48 14 Q62 32 48 50" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>',
      replay: '<path d="M50 32 A18 18 0 1 1 42 17" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M36 8 L46 18 L34 24 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>',
      play: '<path d="M20 12 L52 32 L20 52 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'
    };
    return '<svg viewBox="0 0 64 64">' + p[name] + '</svg>';
  }
  function rbtn(act, ic, cls) {
    return '<button class="rbtn ' + (cls || '') + '" data-act="' + act + '">' + icon(ic) + '</button>';
  }
  function cls() { return S.text ? '' : ' no-text'; }

  /* ---------- formes / groupes ---------- */
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
  function imgTag(id, style) {
    return '<img alt="" draggable="false" ' + (style ? 'style="' + style + '" ' : '') + 'src="' + objSrc(id) + '">';
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
    if (id === 'chiffres') {
      return '<div class="duo"><span class="tl">3</span><div class="grp" style="width:54%">' + imgTag('chat', 'width:50%') + imgTag('chat', 'width:50%') + imgTag('chat', 'width:50%') + '</div></div>';
    }
    if (id === 'formes') {
      return '<div class="duo">' + shapeSVG('circle', '#EF7B76') + '<svg viewBox="0 0 100 100"><polygon points="' + starPts(50, 54, 46, 19) + '" fill="#F7D560" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/></svg></div>';
    }
    if (id === 'couleurs') {
      return '<div class="duo">' + ['#EF7B76', '#F7D560', '#6FB1E6'].map(function (c) { return shapeSVG('circle', c); }).join('') + '</div>';
    }
    if (id === 'lettres') {
      return '<div class="duo"><span class="tl">B</span>' + imgTag('banane') + '</div>';
    }
    return '<div class="duo">' + shapeSVG('circle', NEUTRAL) + imgTag('roue') + '</div>';
  }

  function renderHome() {
    stopGame(); R = null;
    var h = '<div class="view home' + cls() + '">';
    h += '<div class="band"><div class="band-title">Routines</div><div class="grid r">';
    ROUTINES.forEach(function (r) {
      h += '<button class="tile" data-r="' + r.id + '"><div class="pic"><img alt="" src="' + defaultImg(r.id, r.icon) + '"></div><div class="lab">' + esc(r.title) + '</div></button>';
    });
    h += '</div></div><div class="band"><div class="band-title">Jeux</div><div class="grid g">';
    GAME_TILES.forEach(function (g) {
      h += '<button class="tile" data-g="' + g.id + '"><div class="pic">' + gameTileHTML(g.id) + '</div><div class="lab">' + g.title + '</div></button>';
    });
    h += '</div></div><button class="gear" id="gear" aria-label="Parents">⚙︎</button></div>';
    app.innerHTML = h;
    ROUTINES.forEach(function (r) {
      stepURL(r.id, r.icon, function (u) {
        var im = $('.tile[data-r="' + r.id + '"] img'); if (im) im.src = u;
      });
    });
    // accès parent : appui long (1,5 s) sur la roue
    var g = $('#gear'), tm = null;
    function cancel() { clearTimeout(tm); }
    g.addEventListener('pointerdown', function () { tm = setTimeout(renderParent, 1500); });
    g.addEventListener('pointerup', cancel); g.addEventListener('pointerleave', cancel); g.addEventListener('pointercancel', cancel);
  }

  /* ---------- routine ---------- */
  function openRoutine(id) {
    var r = ROUTINES.filter(function (x) { return x.id === id; })[0];
    R = { r: r, idx: 0, urls: [] };
    var left = r.steps.length;
    r.steps.forEach(function (s, i) {
      stepURL(r.id, i, function (u) { R.urls[i] = u; if (--left === 0) renderRoutine(); });
    });
  }
  function renderRoutine() {
    stopGame();
    var r = R.r, i = R.idx, n = r.steps.length, d;
    var h = '<div class="view' + cls() + '"><div class="topbar">' + rbtn('home', 'home', 'small') + '<div class="title">' + esc(r.title) + '</div>' + rbtn('speak', 'speak', 'small') + '</div>';
    h += '<div class="strip">';
    for (d = 0; d < n; d++) {
      h += '<div class="chip ' + (d < i ? 'done' : (d === i ? 'cur' : '')) + '"><img alt="" draggable="false" src="' + R.urls[d] + '"><div class="n">' + (d + 1) + '</div></div>';
    }
    h += '</div><div class="stage"><img alt="" draggable="false" src="' + R.urls[i] + '"><div class="cap">' + esc(stepLabel(r.id, i)) + '</div></div>';
    h += '<div class="actions">' + rbtn('prev', 'back', i === 0 ? 'off' : '') +
      '<button class="cta" data-act="done"><div class="ico">' + icon('check') + '</div><span>' + (i === n - 1 ? "J'ai fini" : 'Étape suivante') + '</span></button>' +
      '<div class="rbtn off"></div></div></div>';
    app.innerHTML = h;
  }

  /* ---------- fin ---------- */
  function renderEnd(kind, info) {
    var replay = kind === 'routine' ? 'again-r' : 'again-g';
    var h = '<div class="view end' + cls() + '"><svg class="big" viewBox="0 0 100 100"><polygon points="' + starPts(50, 53, 46, 20) +
      '" fill="#F7DC7A" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/></svg>' +
      '<div class="msg">Bravo !</div>' + (info ? '<div class="sub">' + info + '</div>' : '') +
      '<div class="row">' + rbtn(replay, 'replay') + rbtn('home', 'home') + '</div></div>';
    app.innerHTML = h;
  }

  /* =====================================================
     JEUX
  ===================================================== */
  var GAMES = {
    chiffres: function (level, prev) {
      var max = level === 1 ? 5 : 10, rev = level === 3, count = level === 3 ? 4 : 3, nums = [], i;
      for (i = 1; i <= max; i++) nums.push(i);
      var n = pickOther(nums, prev), others = [];
      if (level >= 2) {
        [n - 2, n - 1, n + 1, n + 2].forEach(function (x) { if (x >= 1 && x <= max) others.push(x); });
      }
      others = shuffle(others);
      shuffle(nums).forEach(function (x) { if (x !== n && others.indexOf(x) < 0) others.push(x); });
      var chosen = [n].concat(others.slice(0, count - 1));
      var things = OBJETS.filter(function (o) { return o.compter; });
      var th = things[rand(things.length)];
      return {
        topic: n, correct: String(n),
        target: rev ? groupHTML(th.id, n) : numeral(n),
        options: shuffle(chosen).map(function (x) { return { key: String(x), html: rev ? numeral(x) : groupHTML(th.id, x) }; })
      };
    },
    formes: function (level, prev) {
      var shape = pickOther(SHAPES, prev), count = level + 2;
      var shapes = [shape].concat(shuffle(SHAPES.filter(function (s) { return s !== shape; })).slice(0, count - 1));
      var cols = shuffle(COLORS);
      return {
        topic: shape, correct: shape, target: shapeSVG(shape, NEUTRAL),
        options: shuffle(shapes).map(function (s, i) { return { key: s, html: shapeSVG(s, cols[i].h) }; })
      };
    },
    couleurs: function (level, prev) {
      var names = COLORS.map(function (c) { return c.n; }), name = pickOther(names, prev), count = level + 2;
      var chosen = [name].concat(shuffle(names.filter(function (x) { return x !== name; })).slice(0, count - 1));
      var hex = {}; COLORS.forEach(function (c) { hex[c.n] = c.h; });
      return {
        topic: name, correct: name,
        target: '<div class="swatch" style="background:' + hex[name] + '"></div>',
        options: shuffle(chosen).map(function (c) { return { key: c, html: shapeSVG(SHAPES[rand(SHAPES.length)], hex[c]) }; })
      };
    },
    lettres: function (level, prev) {
      var pool = OBJETS.filter(function (o) { return o.lettre; });
      var letters = unique(pool.map(function (o) { return o.lettre; }));
      var L = pickOther(letters, prev), count = level + 2;
      var goods = pool.filter(function (o) { return o.lettre === L; });
      var good = goods[rand(goods.length)], picked = [], seen = {};
      shuffle(pool.filter(function (o) { return o.lettre !== L; })).forEach(function (o) {
        if (picked.length < count - 1 && !seen[o.lettre]) { seen[o.lettre] = 1; picked.push(o); }
      });
      return {
        topic: L, correct: good.id, target: '<div class="letter">' + L + '</div>',
        options: shuffle([good].concat(picked)).map(function (o) { return { key: o.id, html: objCard(o) }; })
      };
    },
    objets: function (level, prev) {
      var pool = OBJETS.filter(function (o) { return o.forme; });
      var shape = pickOther(OBJ_SHAPES, prev), count = level + 2;
      var goods = pool.filter(function (o) { return o.forme === shape; });
      var good = goods[rand(goods.length)], picked = [];
      shuffle(OBJ_SHAPES.filter(function (s) { return s !== shape; })).forEach(function (s) {
        var c = pool.filter(function (o) { return o.forme === s; });
        if (picked.length < count - 1 && c.length) picked.push(c[rand(c.length)]);
      });
      return {
        topic: shape, correct: good.id, target: shapeSVG(shape, NEUTRAL),
        options: shuffle([good].concat(picked)).map(function (o) { return { key: o.id, html: objCard(o) }; })
      };
    }
  };

  function later(fn, ms) {
    var g = G; if (!g) return;
    var id = setTimeout(function () { if (G === g) fn(); }, ms);
    g.timers.push(id);
  }
  function gameMax(id) { return GAME_TILES.filter(function (g) { return g.id === id; })[0].max; }

  function openGame(id) {
    stopGame();
    G = { id: id, level: S.levels[id] || 1, round: 0, total: 6, firstTry: 0, tries: 0, prev: null, locked: true, demoing: true, timers: [] };
    var h = '<div class="view game' + cls() + '"><div class="topbar">' + rbtn('home', 'home', 'small') + '<div class="progress">';
    for (var i = 0; i < G.total; i++) h += '<div class="pdot"></div>';
    h += '</div>' + rbtn('demo', 'play', 'small') + '</div>' +
      '<div class="arena" id="arena"><div class="target" id="target"></div><div class="options" id="options"></div><div class="banner" id="banner"></div></div></div>';
    app.innerHTML = h;
    runDemo();
  }
  function banner(txt, on) {
    var b = $('#banner'); if (!b) return;
    if (txt) b.textContent = txt;
    if (on) b.classList.add('show'); else b.classList.remove('show');
  }
  function setProgress() {
    $$('.pdot').forEach(function (s, i) { if (i < G.round) s.classList.add('on'); else s.classList.remove('on'); });
  }
  function loadRound() {
    var r = GAMES[G.id](G.level, G.prev);
    G.cur = r; G.prev = r.topic; G.tries = 0; G.locked = false;
    var n = r.options.length, arena = $('#arena');
    arena.style.setProperty('--op', n >= 5 ? 'min(18vmin,180px)' : (n === 4 ? 'min(23vmin,215px)' : 'min(28vmin,260px)'));
    arena.style.setProperty('--tg', 'min(32vmin,290px)');
    var t = $('#target'); t.className = 'target'; t.innerHTML = r.target;
    var box = $('#options'); box.innerHTML = '';
    r.options.forEach(function (o) {
      var d = document.createElement('div');
      d.className = 'opt'; d.setAttribute('data-k', o.key); d.innerHTML = o.html;
      box.appendChild(d); makeDraggable(d);
    });
    setProgress();
  }

  function snapTo(d, ms) {
    var prev = d.style.transform;
    d.style.transition = 'none'; d.style.transform = '';
    var r = d.getBoundingClientRect(), oc = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    d.style.transform = prev; void d.offsetWidth;
    var t = $('#target').getBoundingClientRect();
    var dx = t.left + t.width / 2 - oc.x, dy = t.top + t.height / 2 - oc.y, sc = (t.width / r.width) * 0.92;
    d.style.transition = 'transform ' + (ms || 400) + 'ms ease';
    d.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')';
  }
  function springBack(d) { d.classList.remove('drag'); d.style.transition = ''; d.style.transform = ''; }
  function lockAll() { $$('.opt').forEach(function (o) { o.classList.add('locked'); }); }
  function tick() {
    var t = $('#target'), k = document.createElement('div');
    k.className = 'tick'; k.textContent = '✓'; t.appendChild(k);
  }

  function success(d) {
    G.locked = true; lockAll();
    d.classList.remove('hint'); d.classList.add('ok'); d.classList.remove('drag');
    snapTo(d); tick(); sndBravo();
    if (G.tries === 0) G.firstTry++;
    G.round++; setProgress();
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
  function makeDraggable(el) {
    var sx = 0, sy = 0, on = false, pid = null;
    el.addEventListener('pointerdown', function (e) {
      if (!G || G.locked || G.demoing) return;
      on = true; pid = e.pointerId; sx = e.clientX; sy = e.clientY;
      try { el.setPointerCapture(pid); } catch (er) {}
      el.classList.add('drag'); el.style.transition = 'none';
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!on || e.pointerId !== pid) return;
      el.style.transform = 'translate(' + (e.clientX - sx) + 'px,' + (e.clientY - sy) + 'px) scale(1.05)';
    });
    el.addEventListener('pointerup', function (e) {
      if (!on || e.pointerId !== pid) return;
      on = false; onDrop(el, e.clientX, e.clientY);
    });
    el.addEventListener('pointercancel', function () { if (on) { on = false; springBack(el); } });
  }

  /* ---------- démonstration ---------- */
  function runDemo() {
    var g = G;
    g.demoing = true;
    loadRound(); g.locked = true;
    var box = $('#options'); box.classList.add('demo');
    var f = document.createElement('div'); f.className = 'finger'; f.textContent = '👆'; document.body.appendChild(f);
    function put(p, ms) {
      f.style.transition = ms ? 'transform ' + ms + 'ms ease-in-out' : 'none';
      f.style.transform = 'translate(' + (p.x - f.offsetWidth / 2) + 'px,' + (p.y - f.offsetHeight * 0.08) + 'px)';
    }
    function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    var card = null;
    banner('👀', true);
    later(function () {
      banner('', false);
      card = $$('.opt').filter(function (o) { return o.getAttribute('data-k') === g.cur.correct; })[0];
      var c = center(card);
      put({ x: c.x, y: c.y + 140 }, 0); f.style.opacity = '1'; void f.offsetWidth;
      put(c, 1000);
    }, 1200);
    later(function () { snapTo(card, 1100); put(center($('#target')), 1100); }, 2500);
    later(function () {
      card.classList.add('ok'); tick(); sndBravo();
      f.style.opacity = '0';
    }, 3800);
    later(function () {
      box.classList.remove('demo');
      if (f.parentNode) f.parentNode.removeChild(f);
      banner('👆', true);
      g.demoing = false; loadRound();
    }, 5400);
    later(function () { banner('', false); }, 6600);
  }

  function finishGame() {
    var g = G, lv = g.level, up = false, again = g.id;
    if (g.firstTry >= 5 && lv < gameMax(again)) { S.levels[again] = lv + 1; saveS(); up = true; }
    stopGame();
    sndBravo();
    renderEnd('game', S.text ? 'Niveau ' + (S.levels[again] || 1) + (up ? ' — on monte d’un niveau !' : '') : '');
    R = { gameId: again };
  }

  /* =====================================================
     ESPACE PARENT
  ===================================================== */
  function toggleRow(key, label) {
    return '<div class="row" data-act="toggle" data-key="' + key + '"><span>' + label + '</span><div class="sw ' + (S[key] ? 'on' : '') + '"></div></div>';
  }
  function uploadBtn(key) {
    return '<label class="pbtn">Photo<input type="file" accept="image/*" data-up="' + key + '"></label>' +
      '<button class="pbtn grey" data-act="reset-img" data-key="' + key + '">↺</button>';
  }
  function renderParent() {
    stopGame();
    var scroll = $('.parent') ? $('.parent').scrollTop : 0;
    var h = '<div class="view parent"><div class="topbar">' + rbtn('home', 'home', 'small') + '<div class="title">Espace parent</div><div style="width:9vmin"></div></div>';
    h += '<div class="card">' + toggleRow('sound', 'Sons (bravo / uh uh)') + toggleRow('voice', 'Voix « Bravo ! » et lecture des étapes') + toggleRow('text', 'Afficher les textes') + '</div>';
    ROUTINES.forEach(function (r) {
      h += '<h2>' + esc(r.title) + '</h2><div class="card"><div class="steps">';
      r.steps.forEach(function (s, i) {
        var key = r.id + ':' + i;
        h += '<div class="step"><img alt="" data-r="' + r.id + '" data-i="' + i + '" src="' + (urlCache[key] || defaultImg(r.id, i)) + '">' +
          '<div class="nm" data-act="rename" data-key="' + key + '" data-name="' + esc(stepLabel(r.id, i)) + '">' + (i + 1) + '. ' + esc(stepLabel(r.id, i)) + '</div>' +
          '<div class="btns">' + uploadBtn(key) + '</div></div>';
      });
      h += '</div></div>';
    });
    h += '<h2>Images des jeux</h2><div class="card"><p class="note">Remplacez une image par une photo ou une illustration de votre choix. Touchez ↺ pour revenir à l’image d’origine.</p><div class="steps">';
    OBJETS.forEach(function (o) {
      h += '<div class="step"><img alt="" src="' + objSrc(o.id) + '"><div class="nm">' + esc(o.nom) + '</div><div class="btns">' + uploadBtn('obj:' + o.id) + '</div></div>';
    });
    h += '</div></div>';
    h += '<h2>Jeux</h2><div class="card"><div class="row"><span>Niveaux : ' + GAME_TILES.map(function (g) { return g.title.toLowerCase() + ' ' + (S.levels[g.id] || 1); }).join(' · ') + '</span>' +
      '<button class="pbtn grey" data-act="reset-levels">Remettre à 1</button></div>' +
      '<p class="note">Le niveau monte tout seul quand l’enfant réussit presque tout du premier coup.</p></div>';
    h += '<h2>Photos</h2><div class="card"><p class="note">Les photos que vous ajoutez restent <b>uniquement sur cette tablette</b> et ne sont jamais envoyées en ligne. Touchez le nom d’une étape pour changer son texte. Appui long (1,5 s) sur la roue de l’accueil pour revenir ici.</p>' +
      '<div class="btns"><button class="pbtn red" data-act="reset-all">Effacer toutes mes photos</button></div></div></div>';
    app.innerHTML = h;
    var p = $('.parent'); if (p) p.scrollTop = scroll;
    $$('.step img[data-r]').forEach(function (im) {
      stepURL(im.getAttribute('data-r'), +im.getAttribute('data-i'), function (u) { im.src = u; });
    });
    $$('input[data-up]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0]; if (!f) return;
        var key = inp.getAttribute('data-up');
        var busy = document.createElement('div'); busy.className = 'busy'; busy.textContent = '…'; document.body.appendChild(busy);
        function end() { if (busy.parentNode) busy.parentNode.removeChild(busy); renderParent(); }
        resizeImage(f, function (blob) {
          if (!blob) return end();
          dbPut(key, blob, function (ok) { if (ok) afterChange(key, end); else end(); });
        });
      });
    });
  }
  function afterChange(key, cb) {
    if (key.indexOf('obj:') === 0) return refreshObj(key.slice(4), cb);
    if (urlCache[key]) { URL.revokeObjectURL(urlCache[key]); delete urlCache[key]; }
    cb();
  }

  /* =====================================================
     ÉVÉNEMENTS
  ===================================================== */
  app.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== app && !(t.getAttribute && (t.getAttribute('data-act') || (t.classList.contains('tile') && (t.getAttribute('data-r') || t.getAttribute('data-g')))))) t = t.parentNode;
    if (!t || t === app) return;
    var act = t.getAttribute('data-act');
    if (!act) {
      if (t.getAttribute('data-r')) return openRoutine(t.getAttribute('data-r'));
      return openGame(t.getAttribute('data-g'));
    }
    switch (act) {
      case 'home': renderHome(); break;
      case 'prev': if (R && R.idx > 0) { R.idx--; renderRoutine(); } break;
      case 'done':
        if (R.idx >= R.r.steps.length - 1) { var rid = R.r.id; sndBravo(); renderEnd('routine'); R = { routineId: rid }; }
        else { R.idx++; sndStep(); renderRoutine(); }
        break;
      case 'speak': if (R && R.r) speak(stepLabel(R.r.id, R.idx)); break;
      case 'again-r': openRoutine(R.routineId); break;
      case 'again-g': openGame(R.gameId); break;
      case 'demo': if (G) openGame(G.id); break;
      case 'toggle': var k = t.getAttribute('data-key'); S[k] = !S[k]; saveS(); renderParent(); break;
      case 'rename':
        var key = t.getAttribute('data-key'), cur = t.getAttribute('data-name');
        var v = window.prompt('Texte de l’étape', cur);
        if (v !== null) { v = v.trim(); if (v) S.labels[key] = v; else delete S.labels[key]; saveS(); renderParent(); }
        break;
      case 'reset-img':
        var kk = t.getAttribute('data-key');
        dbDel(kk, function () { afterChange(kk, renderParent); });
        break;
      case 'reset-levels': S.levels = {}; saveS(); renderParent(); break;
      case 'reset-all':
        if (window.confirm('Effacer toutes les photos ajoutées sur cette tablette ?')) {
          dbClear(function () {
            for (var u in urlCache) URL.revokeObjectURL(urlCache[u]);
            for (var o in objURL) URL.revokeObjectURL(objURL[o]);
            urlCache = {}; objURL = {}; renderParent();
          });
        }
        break;
    }
  });

  /* =====================================================
     DÉMARRAGE
  ===================================================== */
  openDB(function () {
    probeDefaults(function () {
      loadObjURLs(function () {
        renderHome();
        try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
      });
    });
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
