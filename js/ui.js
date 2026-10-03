(function () {
  'use strict';
  var E = TZ.engine, AI = TZ.ai, I = TZ.i18n, A = TZ.audio, T = I.t;
  var OFF = E.OFF, BAR = E.BAR;
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---- board geometry (SVG viewBox 1060 x 640) ----
  var VW = 1060, PW = 72, XL = 40, XR = 536, TOPY = 30, BOTY = 610, PH = 250, R = 30;
  var BARX = 504, TRAYX = 1006, MIDY = 320;

  // ---- opponents: each one is a fixed difficulty level ----
  var OPPS = [
    { id: 'esmat', idx: 0, diff: 'easy' },
    { id: 'yasser', idx: 2, diff: 'normal' },
    { id: 'abdelazim', idx: 1, diff: 'hard' }
  ];
  function oppById(id) { return OPPS.filter(function (o) { return o.id === id; })[0] || OPPS[1]; }

  // ---- settings ----
  var settings = { variant: '3ada', mode: 'cpu', opp: 'yasser', lang: 'ar', muted: false };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('tz-settings') || '{}')); } catch (e) { /* storage blocked */ }
  function save() { try { localStorage.setItem('tz-settings', JSON.stringify(settings)); } catch (e) { /* ignore */ } }

  // ---- game state ----
  var G = null;

  function isHuman(c) { return G.mode === 'local' || c === 0; }

  function playerName(c) {
    if (G.mode === 'local') return T(c === 0 ? 'p1' : 'p2');
    return c === 0 ? T('you') : I.cpuNameAt(G.cpuName);
  }

  // =========================================================
  // Rendering the board
  // =========================================================
  function slot(idx) {
    var top = idx >= 12;
    var col = top ? idx - 12 : 11 - idx;
    var x = (col < 6 ? XL + col * PW : XR + (col - 6) * PW);
    return { top: top, left: x, x: x + PW / 2 };
  }

  function stackItems(idx, pt) {
    var s = slot(idx), items = [];
    var pr = pt.p > 0 ? 1 : 0;
    var units = pt.n + (pr ? 0.6 : 0);
    var sp = units > 1 ? Math.min(58, 200 / (units - 1)) : 58;
    function y(pos) { return s.top ? TOPY + R + 6 + pos * sp : BOTY - R - 6 - pos * sp; }
    if (pr) items.push({ x: s.x, y: y(0), c: 1 - pt.o, prisoner: true });
    for (var k = 0; k < pt.n; k++) items.push({ x: s.x, y: y((pr ? 0.6 : 0) + k), c: pt.o });
    return items;
  }

  function barItems(st, c) {
    var out = [], n = st.bar[c];
    var sp = Math.min(58, 190 / Math.max(1, n));
    for (var k = 0; k < n; k++) {
      out.push({ x: BARX, y: c === 0 ? MIDY + 38 + k * sp : MIDY - 38 - k * sp, c: c });
    }
    return out;
  }

  function trayPos(c, k) {
    return { x: TRAYX, y: c === 0 ? BOTY - 10 - k * 16 : TOPY + 10 + k * 16 };
  }

  function chk(x, y, c, extra) {
    var cls = 'chk' + (extra && extra.prisoner ? ' prisoner' : '');
    var fill = c === 0 ? 'url(#gIce)' : 'url(#gSap)';
    var rim = c === 0 ? 'var(--ice-rim)' : 'var(--sap-rim)';
    var core = c === 0 ? 'rgba(232,244,255,.8)' : 'rgba(23,71,168,.55)';
    var s = '<g class="' + cls + '" transform="translate(' + x + ' ' + y + ')"' + (extra && extra.prisoner ? ' opacity=".78"' : '') + '>' +
      '<circle r="' + R + '" fill="' + fill + '" stroke="' + rim + '" stroke-width="3"' + (extra && extra.prisoner ? ' stroke-dasharray="5 4"' : '') + '/>' +
      '<circle r="21" fill="none" stroke="' + core + '" stroke-width="1.5"/>' +
      '<polygon points="0,-12 3.5,-3.5 12,0 3.5,3.5 0,12 -3.5,3.5 -12,0 -3.5,-3.5" fill="' + core + '"/>' +
      '</g>';
    return s;
  }

  function highlightedSets() {
    var sources = {}, dests = {};
    if (G.phase === 'move' && !G.busy && isHuman(G.turn)) {
      G.legal.forEach(function (m) { sources[m.f] = true; });
      if (G.sel !== null) G.legal.forEach(function (m) { if (m.f === G.sel) dests[m.t] = true; });
    }
    return { sources: sources, dests: dests };
  }

  function render() {
    var st = G.state, hl = highlightedSets(), h = [];
    h.push(
      '<defs>' +
      '<linearGradient id="gFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a56b8"/><stop offset="1" stop-color="#0a1d47"/></linearGradient>' +
      '<radialGradient id="gIce" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#6aa5ff"/><stop offset="1" stop-color="#1747a8"/></radialGradient>' +
      '<radialGradient id="gSap" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d4e6ff"/></radialGradient>' +
      '<linearGradient id="gFelt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2660"/><stop offset="1" stop-color="#071a45"/></linearGradient>' +
      '</defs>' +
      '<rect x="0" y="0" width="' + VW + '" height="640" rx="26" fill="url(#gFrame)"/>' +
      '<rect x="8" y="8" width="' + (VW - 16) + '" height="624" rx="20" fill="none" stroke="rgba(156,201,255,.25)" stroke-width="2"/>' +
      '<rect x="32" y="22" width="448" height="596" rx="8" fill="url(#gFelt)"/>' +
      '<rect x="528" y="22" width="448" height="596" rx="8" fill="url(#gFelt)"/>' +
      '<rect x="472" y="14" width="64" height="612" fill="var(--bar)"/>' +
      '<rect x="' + (TRAYX - 28) + '" y="22" width="56" height="258" rx="8" fill="var(--bar)"/>' +
      '<rect x="' + (TRAYX - 28) + '" y="360" width="56" height="258" rx="8" fill="var(--bar)"/>'
    );

    // triangles + numbers
    var i;
    for (i = 0; i < 24; i++) {
      var s = slot(i), x0 = s.left, x1 = s.left + PW, xm = s.left + PW / 2;
      var cls = i % 2 === 0 ? 'ptA' : 'ptB';
      var pts = s.top
        ? x0 + ',' + TOPY + ' ' + x1 + ',' + TOPY + ' ' + xm + ',' + (TOPY + PH)
        : x0 + ',' + BOTY + ' ' + x1 + ',' + BOTY + ' ' + xm + ',' + (BOTY - PH);
      h.push('<polygon class="' + cls + '" points="' + pts + '"/>');
      if (hl.dests[i]) h.push('<polygon class="dest-glow" points="' + pts + '"/>');
      if (G.sel === i) h.push('<polygon class="sel-glow" points="' + pts + '"/>');
      h.push('<text class="ptnum" x="' + xm + '" y="' + (s.top ? 17 : 633) + '" text-anchor="middle">' + (i + 1) + '</text>');
    }
    if (hl.dests[OFF]) {
      var c0 = G.turn;
      h.push('<rect class="dest-glow" x="' + (TRAYX - 28) + '" y="' + (c0 === 0 ? 360 : 22) + '" width="56" height="258" rx="8"/>');
    }

    // checkers on points
    for (i = 0; i < 24; i++) {
      var pt = st.pts[i];
      if (!pt.n) continue;
      var items = stackItems(i, pt);
      var lastIdx = items.length - 1;
      items.forEach(function (it, k) {
        if (G.hide && G.hide.pt === i && k === lastIdx) return;
        h.push(chk(it.x, it.y, it.c, it));
      });
      var top = items[lastIdx];
      if (pt.n > 5 && !(G.hide && G.hide.pt === i)) {
        h.push('<text class="cnt s' + pt.o + '" x="' + top.x + '" y="' + top.y + '">' + pt.n + '</text>');
      }
      if (hl.sources[i] && !(G.hide && G.hide.pt === i)) {
        h.push('<circle class="ring" cx="' + top.x + '" cy="' + top.y + '" r="' + (R + 4) + '"/>');
      }
    }

    // destination marker at the next free spot
    Object.keys(hl.dests).forEach(function (k) {
      var t = parseInt(k, 10);
      if (t === OFF) return;
      var p = st.pts[t], s2 = slot(t);
      var n = p.n + (p.p ? 1 : 0);
      var items2 = stackItems(t, { o: p.o, n: Math.max(1, n + 1), p: p.p });
      var next = items2[items2.length - 1];
      h.push('<circle class="dest-dot" cx="' + s2.x + '" cy="' + next.y + '" r="' + (R - 4) + '"/>');
    });

    // bar
    [0, 1].forEach(function (c) {
      var items3 = barItems(st, c);
      items3.forEach(function (it, k) {
        if (G.hide && G.hide.bar === c && k === items3.length - 1) return;
        h.push(chk(it.x, it.y, c));
      });
      if (hl.sources[BAR] && c === G.turn && items3.length) {
        var tp = items3[items3.length - 1];
        h.push('<circle class="ring" cx="' + tp.x + '" cy="' + tp.y + '" r="' + (R + 4) + '"/>');
      }
    });

    // bear-off trays
    [0, 1].forEach(function (c) {
      var n = st.off[c];
      for (var k = 0; k < n; k++) {
        if (G.hide && G.hide.off === c && k === n - 1) continue;
        var p2 = trayPos(c, k);
        var fill = c === 0 ? 'url(#gIce)' : 'url(#gSap)';
        var rim = c === 0 ? 'var(--ice-rim)' : 'var(--sap-rim)';
        h.push('<rect x="' + (p2.x - 22) + '" y="' + (p2.y - 8) + '" width="44" height="14" rx="5" fill="' + fill + '" stroke="' + rim + '" stroke-width="2"/>');
      }
    });

    // hit zones (topmost)
    for (i = 0; i < 24; i++) {
      var s3 = slot(i);
      h.push('<rect class="hit" data-t="p' + i + '" x="' + s3.left + '" y="' + (s3.top ? TOPY : BOTY - PH - 20) + '" width="' + PW + '" height="' + (PH + 20) + '"/>');
    }
    h.push('<rect class="hit" data-t="bar" x="472" y="200" width="64" height="240"/>');
    h.push('<rect class="hit" data-t="off" x="' + (TRAYX - 28) + '" y="' + (G.turn === 0 ? 360 : 22) + '" width="56" height="258"/>');

    $('board').innerHTML = h.join('');
    updatePanel();
  }

  // ---- animation of one checker flying between two spots ----
  function fly(from, to, c, done) {
    var svg = $('board');
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('pointer-events', 'none');
    g.innerHTML = chk(0, 0, c);
    svg.appendChild(g);
    var t0 = null, dur = 280;
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = ease(k);
      var lift = Math.sin(Math.PI * k) * 26;
      g.setAttribute('transform', 'translate(' + (from.x + (to.x - from.x) * e) + ' ' + (from.y + (to.y - from.y) * e - lift) + ') scale(' + (1 + 0.12 * Math.sin(Math.PI * k)) + ')');
      if (k < 1) requestAnimationFrame(step);
      else { if (g.parentNode) g.parentNode.removeChild(g); done(); }
    }
    g.setAttribute('transform', 'translate(' + from.x + ' ' + from.y + ')');
    requestAnimationFrame(step);
  }

  function topPos(st, f, c) {
    if (f === BAR) {
      var it = barItems(st, c);
      return it[it.length - 1];
    }
    var items = stackItems(f, st.pts[f]);
    return items[items.length - 1];
  }

  // =========================================================
  // Panel (names, pips, dice, buttons)
  // =========================================================
  var PIPS = { 0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function dieHTML(v, cls) {
    var s = '<div class="die ' + (cls || '') + '" aria-label="' + v + '">';
    for (var i = 0; i < 9; i++) s += '<i class="' + (PIPS[v].indexOf(i) >= 0 ? 'on' : '') + '"></i>';
    return s + '</div>';
  }

  function renderDice(rolling) {
    var el = $('dice');
    if (rolling) {
      el.innerHTML = dieHTML(rolling[0], 'rolling') + dieHTML(rolling[1], 'rolling');
      return;
    }
    if (!G.dice) { el.innerHTML = dieHTML(0) + dieHTML(0); return; }
    var dbl = G.dice[0] === G.dice[1];
    var used0, used1;
    if (dbl) { used0 = used1 = G.rem.length === 0; }
    else {
      used0 = G.rem.indexOf(G.dice[0]) < 0; used1 = G.rem.indexOf(G.dice[1]) < 0;
    }
    el.innerHTML = dieHTML(G.dice[0], used0 ? 'used' : '') + dieHTML(G.dice[1], used1 ? 'used' : '') +
      (dbl && G.rem.length ? '<span class="badge">×' + G.rem.length + '</span>' : '');
  }

  function statusText() {
    if (G.phase === 'over') return '';
    if (G.notice) return G.notice;
    var c = G.turn, nm = playerName(c);
    if (G.phase === 'roll') return isHuman(c) ? (G.mode === 'local' ? T('turnOf', { n: nm }) : T('yourTurn')) : T('thinking', { n: nm });
    if (!isHuman(c)) return T('thinking', { n: nm });
    return G.sel === null ? T('pickChecker') : T('pickTarget');
  }

  function updatePanel() {
    if (!G) return;
    [0, 1].forEach(function (c) {
      $('name' + c).textContent = playerName(c) + ' · ' + T(c === 0 ? 'ice' : 'sapphire');
      $('pips' + c).textContent = T('pips') + ': ' + E.pips(G.state, c);
      $('off' + c).innerHTML = T('borneOff') + ' <b>' + G.state.off[c] + '</b>/15' + (G.state.bar[c] ? '<br>' + T('onBar') + ' <b>' + G.state.bar[c] + '</b>' : '');
      $('card' + c).classList.toggle('active', G.phase !== 'over' && G.turn === c);
      var isOpp = G.mode === 'cpu' && c === 1;
      var photo = isOpp && TZ.avatars && TZ.avatars[G.oppId];
      var sw = $('card' + c).querySelector('.swatch');
      sw.classList.toggle('photo', !!photo);
      sw.classList.toggle('initial', isOpp && !photo);
      sw.textContent = isOpp && !photo ? playerName(c).charAt(0) : '';
      sw.style.backgroundImage = photo ? 'url(' + photo + ')' : '';
    });
    if (!G.rolling) renderDice();
    $('status').textContent = statusText();
    var canRoll = G.phase === 'roll' && isHuman(G.turn) && !G.busy;
    $('rollBtn').disabled = !canRoll;
    $('rollBtn').textContent = G.rolling ? T('rolling') : T('roll');
    $('undoBtn').textContent = T('undo');
    $('undoBtn').disabled = !(G.phase === 'move' && isHuman(G.turn) && !G.busy && G.hist.length);
    $('rulesText').textContent = T(G.variant === 'mahbusa' ? 'rulesMahbusa' : 'rules3ada');
  }

  // =========================================================
  // Game flow
  // =========================================================
  function startGame() {
    G = {
      variant: settings.variant, mode: settings.mode, diff: oppById(settings.opp).diff, oppId: oppById(settings.opp).id,
      state: E.newState(settings.variant), turn: Math.random() < 0.5 ? 0 : 1,
      phase: 'roll', dice: null, rem: [], legal: [], sel: null, hist: [], busy: false,
      hide: null, notice: '', rolling: false, cpuName: oppById(settings.opp).idx
    };
    $('menu').classList.add('hidden');
    $('game').classList.remove('hidden');
    $('menuBtn').classList.remove('hidden');
    $('overlay').classList.add('hidden');
    beginTurn();
  }

  function beginTurn() {
    G.phase = 'roll'; G.dice = null; G.rem = []; G.legal = []; G.sel = null; G.hist = []; G.notice = '';
    G.busy = !isHuman(G.turn);
    render();
    if (!isHuman(G.turn)) setTimeout(function () { if (G && G.phase === 'roll') rollDice(); }, 800);
  }

  function rollDice() {
    if (G.phase !== 'roll' || G.rolling) return;
    A.unlock();
    G.rolling = true; G.busy = true;
    updatePanel();
    A.dice();
    var n = 0, timer = setInterval(function () {
      renderDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
      if (++n >= 9) {
        clearInterval(timer);
        G.rolling = false;
        var a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
        G.dice = [a, b]; G.rem = E.diceFor(a, b);
        G.legal = E.legalMoves(G.state, G.turn, G.rem);
        G.phase = 'move';
        if (!G.legal.length) {
          G.notice = T('noMoves');
          render();
          setTimeout(endTurn, 1500);
          return;
        }
        if (isHuman(G.turn)) { G.busy = false; render(); }
        else { render(); setTimeout(cpuPlay, 600); }
      }
    }, 70);
  }

  function cpuPlay() {
    var choice = AI.chooseTurn(G.state, G.turn, G.rem.slice(), G.diff);
    if (!choice) { endTurn(); return; }
    var seq = choice.seq, i = 0;
    (function next() {
      if (!G || G.phase === 'over') return;
      if (i >= seq.length) { setTimeout(endTurn, 450); return; }
      var m = seq[i++];
      playMove(m, function () {
        if (G.state.off[G.turn] === 15) { finish(G.turn); return; }
        setTimeout(next, 320);
      });
    })();
  }

  function playMove(m, done) {
    var c = G.turn;
    G.busy = true;
    var from = topPos(G.state, m.f, c);
    var info = E.doMove(G.state, c, m);
    G.rem.splice(G.rem.indexOf(m.d), 1);
    var to;
    if (m.t === OFF) { to = trayPos(c, G.state.off[c] - 1); G.hide = { off: c }; }
    else { var it = stackItems(m.t, G.state.pts[m.t]); to = it[it.length - 1]; G.hide = { pt: m.t }; }
    G.sel = null;
    render();
    if (info.hit) A.hit(); else if (m.t === OFF) A.off(); else A.move();
    fly(from, to, c, function () { G.hide = null; render(); done(info); });
  }

  function humanMove(m) {
    G.hist.push({ state: E.clone(G.state), rem: G.rem.slice() });
    playMove(m, function () {
      var c = G.turn;
      if (G.state.off[c] === 15) { finish(c); return; }
      G.legal = G.rem.length ? E.legalMoves(G.state, c, G.rem) : [];
      if (!G.legal.length) { setTimeout(endTurn, 450); return; }
      G.busy = false;
      render();
    });
  }

  function undo() {
    if (!G || G.busy || G.phase !== 'move' || !G.hist.length) return;
    var h = G.hist.pop();
    G.state = h.state; G.rem = h.rem; G.sel = null;
    G.legal = E.legalMoves(G.state, G.turn, G.rem);
    A.tick();
    render();
  }

  function endTurn() {
    if (!G || G.phase === 'over') return;
    G.turn = 1 - G.turn;
    beginTurn();
  }

  function finish(c) {
    G.phase = 'over'; G.busy = true; G.hide = null;
    render();
    var loser = 1 - c;
    var gammon = G.variant === '3ada' && G.state.off[loser] === 0;
    var humanWon = G.mode === 'cpu' ? c === 0 : true;
    $('winTitle').textContent = G.mode === 'cpu' ? T(c === 0 ? 'youWin' : 'youLose') : T('wins', { n: playerName(c) });
    $('winSub').textContent = gammon ? T('gammon') : '';
    $('rematchBtn').textContent = T('rematch');
    $('toMenuBtn').textContent = T('backToMenu');
    setTimeout(function () {
      $('overlay').classList.remove('hidden');
      if (humanWon) A.win(); else A.lose();
      $('rematchBtn').focus();
    }, 500);
  }

  // =========================================================
  // Input
  // =========================================================
  function onBoardClick(e) {
    var t = e.target.closest ? e.target.closest('[data-t]') : null;
    if (!t || !G || G.busy || G.phase !== 'move' || !isHuman(G.turn)) return;
    var v = t.getAttribute('data-t');
    var tg = v === 'bar' ? BAR : v === 'off' ? OFF : parseInt(v.slice(1), 10);

    if (G.sel !== null) {
      var cands = G.legal.filter(function (m) { return m.f === G.sel && m.t === tg; });
      if (cands.length) {
        cands.sort(function (a, b) { return a.d - b.d; }); // use the smaller die, keep the bigger
        humanMove(cands[0]);
        return;
      }
    }
    if (tg !== OFF && G.legal.some(function (m) { return m.f === tg; })) {
      G.sel = G.sel === tg ? null : tg;
      A.tick();
    } else {
      G.sel = null;
    }
    render();
  }

  // =========================================================
  // Menu + static text
  // =========================================================
  function buildMenu() {
    var games = $('optGames');
    games.innerHTML = '';
    [['3ada', 'g3ada', 'g3adaDesc'], ['mahbusa', 'gMahbusa', 'gMahbusaDesc']].forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gcard'; b.dataset.v = g[0];
      b.setAttribute('aria-pressed', String(settings.variant === g[0]));
      b.innerHTML = '<b>' + T(g[1]) + '</b><span>' + T(g[2]) + '</span>';
      b.onclick = function () { settings.variant = g[0]; save(); buildMenu(); };
      games.appendChild(b);
    });
    seg($('optMode'), [['cpu', 'vsCpu'], ['local', 'vsLocal']], 'mode');
    buildOpps();
    $('diffField').classList.toggle('hidden', settings.mode !== 'cpu');
  }

  function avatarFill(el, id, name) {
    var photo = TZ.avatars && TZ.avatars[id];
    if (photo) { el.style.backgroundImage = 'url(' + photo + ')'; el.classList.add('photo'); }
    else { el.classList.add('initial'); el.textContent = name.charAt(0); }
  }

  function buildOpps() {
    var box = $('optOpp');
    box.innerHTML = '';
    OPPS.forEach(function (o) {
      var name = I.cpuNameAt(o.idx);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opp';
      b.setAttribute('aria-pressed', String(settings.opp === o.id));
      var av = document.createElement('span'); av.className = 'oav';
      avatarFill(av, o.id, name);
      var nm = document.createElement('b'); nm.textContent = name;
      var lv = document.createElement('span'); lv.className = 'lvl ' + o.diff; lv.textContent = T(o.diff);
      b.appendChild(av); b.appendChild(nm); b.appendChild(lv);
      b.onclick = function () { settings.opp = o.id; save(); buildMenu(); };
      box.appendChild(b);
    });
  }

  function seg(el, opts, key) {
    el.innerHTML = '';
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = T(o[1]);
      b.setAttribute('aria-pressed', String(settings[key] === o[0]));
      b.onclick = function () { settings[key] = o[0]; save(); buildMenu(); };
      el.appendChild(b);
    });
  }

  var SND_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var SND_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>';

  function applyLang() {
    I.setLang('ar');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T(el.getAttribute('data-i18n')); });
    document.title = T('title');
    $('brandName').textContent = T('title');
    $('soundBtn').setAttribute('aria-label', T('sound'));
    buildMenu();
    if (G) {
      $('rematchBtn').textContent = T('rematch'); $('toMenuBtn').textContent = T('backToMenu');
      render();
    }
  }

  function applySound() {
    A.setMuted(settings.muted);
    $('soundBtn').innerHTML = settings.muted ? SND_OFF : SND_ON;
    $('soundBtn').setAttribute('aria-pressed', String(!settings.muted));
  }

  function toMenu() {
    G = null;
    $('game').classList.add('hidden');
    $('menu').classList.remove('hidden');
    $('menuBtn').classList.add('hidden');
    $('overlay').classList.add('hidden');
  }

  function init() {
    applyLang(); applySound();
    $('soundBtn').onclick = function () { settings.muted = !settings.muted; save(); applySound(); A.tick(); };
    $('playBtn').onclick = function () { A.unlock(); if (TZ.music) TZ.music.start(); startGame(); };
    $('menuBtn').onclick = toMenu;
    $('brandBtn').onclick = function () { if (G) toMenu(); };
    $('toMenuBtn').onclick = toMenu;
    $('rematchBtn').onclick = startGame;
    $('rollBtn').onclick = rollDice;
    $('undoBtn').onclick = undo;
    $('board').addEventListener('click', onBoardClick);
    document.addEventListener('keydown', function (e) {
      if (!G) return;
      if ((e.key === ' ' || e.key === 'Enter') && G.phase === 'roll' && isHuman(G.turn) && !G.busy && document.activeElement === document.body) { e.preventDefault(); rollDice(); }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
    });
  }

  init();

  // test hook: lets a console/test script inspect or seed the running game
  TZ.debug = { game: function () { return G; }, render: function () { render(); }, beginTurn: function () { beginTurn(); } };
})();
