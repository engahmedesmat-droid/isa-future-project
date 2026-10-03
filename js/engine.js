/* Rules engine for 3ada (standard backgammon) and Ma7boussa.
 *
 * Board: 24 points, index 0..23. Player 0 moves from high to low index
 * (home = 0..5), player 1 moves low to high (home = 18..23).
 * Each point: { o: owner (-1 empty), n: owner's checkers, p: prisoners (Ma7boussa) }.
 * A move: { f: from index or -1 for the bar, t: target index or -2 for bearing off, d: die }.
 */
(function (root) {
  'use strict';

  var OFF = -2;
  var BAR = -1;

  function rel(i, c) { return c === 0 ? i : 23 - i; }
  function abs(r, c) { return c === 0 ? r : 23 - r; }

  function put(s, i, c, n) { s.pts[i].o = c; s.pts[i].n = n; }

  function newState(variant) {
    var pts = [];
    for (var i = 0; i < 24; i++) pts.push({ o: -1, n: 0, p: 0 });
    var s = { variant: variant, pts: pts, bar: [0, 0], off: [0, 0] };
    if (variant === 'mahbusa') {
      put(s, 23, 0, 15);
      put(s, 0, 1, 15);
    } else {
      put(s, 23, 0, 2); put(s, 12, 0, 5); put(s, 7, 0, 3); put(s, 5, 0, 5);
      put(s, 0, 1, 2); put(s, 11, 1, 5); put(s, 16, 1, 3); put(s, 18, 1, 5);
    }
    return s;
  }

  function clone(s) {
    return {
      variant: s.variant,
      pts: s.pts.map(function (p) { return { o: p.o, n: p.n, p: p.p }; }),
      bar: s.bar.slice(),
      off: s.off.slice()
    };
  }

  function key(s) {
    var k = s.bar[0] + ',' + s.bar[1] + ',' + s.off[0] + ',' + s.off[1] + '|';
    for (var i = 0; i < 24; i++) {
      var p = s.pts[i];
      k += p.n ? p.o + '' + p.n + (p.p ? 'p' : '') + '.' : '.';
    }
    return k;
  }

  function canLand(s, j, c) {
    var p = s.pts[j];
    if (p.n === 0 || p.o === c) return true;
    // a lone opposing checker can be hit (3ada) or imprisoned (Ma7boussa)
    return p.n === 1 && p.p === 0;
  }

  function allHome(s, c) {
    if (s.bar[c] > 0) return false;
    for (var i = 0; i < 24; i++) {
      if (rel(i, c) <= 5) continue;
      var p = s.pts[i];
      if (p.o === c && p.n > 0) return false;
      if (p.o === 1 - c && p.p > 0) return false;
    }
    return true;
  }

  function singleMoves(s, c, d) {
    var out = [];
    if (s.bar[c] > 0) {
      var j = abs(24 - d, c);
      if (canLand(s, j, c)) out.push({ f: BAR, t: j, d: d });
      return out;
    }
    var home = allHome(s, c);
    var maxR = -1, i, p, r;
    for (i = 0; i < 24; i++) {
      p = s.pts[i];
      if (p.o === c && p.n > 0) maxR = Math.max(maxR, rel(i, c));
    }
    for (i = 0; i < 24; i++) {
      p = s.pts[i];
      if (p.o !== c || p.n === 0) continue;
      r = rel(i, c);
      var t = r - d;
      if (t >= 0) {
        var tj = abs(t, c);
        if (canLand(s, tj, c)) out.push({ f: i, t: tj, d: d });
      } else if (home && (t === -1 || r === maxR)) {
        out.push({ f: i, t: OFF, d: d });
      }
    }
    return out;
  }

  // Mutates s. Returns { hit } where hit means a checker was hit / imprisoned.
  function doMove(s, c, m) {
    var hit = false;
    if (m.f === BAR) {
      s.bar[c]--;
    } else {
      var src = s.pts[m.f];
      src.n--;
      if (src.n === 0) {
        if (src.p > 0) { src.o = 1 - c; src.n = src.p; src.p = 0; } // prisoner freed
        else src.o = -1;
      }
    }
    if (m.t === OFF) { s.off[c]++; return { hit: false }; }
    var q = s.pts[m.t];
    if (q.n === 0) { q.o = c; q.n = 1; }
    else if (q.o === c) { q.n++; }
    else {
      if (s.variant === 'mahbusa') { q.o = c; q.n = 1; q.p = 1; }
      else { s.bar[1 - c]++; q.o = c; q.n = 1; }
      hit = true;
    }
    return { hit: hit };
  }

  function applyMove(s, c, m) {
    var n = clone(s);
    doMove(n, c, m);
    return n;
  }

  function without(arr, x) { return arr.slice(0, x).concat(arr.slice(x + 1)); }

  // Most dice that can be played from this position (memoised).
  function maxUse(s, c, dice, memo) {
    if (dice.length === 0) return 0;
    var k = key(s) + '#' + dice.slice().sort().join('');
    var hit = memo.get(k);
    if (hit !== undefined) return hit;
    var best = 0, seen = {};
    for (var x = 0; x < dice.length && best < dice.length; x++) {
      var d = dice[x];
      if (seen[d]) continue;
      seen[d] = true;
      var rest = without(dice, x);
      var ms = singleMoves(s, c, d);
      for (var y = 0; y < ms.length; y++) {
        var n = clone(s);
        doMove(n, c, ms[y]);
        var v = 1 + maxUse(n, c, rest, memo);
        if (v > best) { best = v; if (best === dice.length) break; }
      }
    }
    memo.set(k, best);
    return best;
  }

  // Legal first moves for the remaining dice, honouring "use as many dice as
  // possible" and "if only one die can be played, play the larger".
  function legalMoves(s, c, dice) {
    var memo = new Map();
    var total = maxUse(s, c, dice, memo);
    if (total === 0) return [];
    var res = [], seen = {};
    for (var x = 0; x < dice.length; x++) {
      var d = dice[x];
      if (seen[d]) continue;
      seen[d] = true;
      var rest = without(dice, x);
      var ms = singleMoves(s, c, d);
      for (var y = 0; y < ms.length; y++) {
        var n = clone(s);
        doMove(n, c, ms[y]);
        if (1 + maxUse(n, c, rest, memo) === total) res.push(ms[y]);
      }
    }
    if (total === 1 && dice.length === 2 && dice[0] !== dice[1]) {
      var hi = Math.max(dice[0], dice[1]);
      var big = res.filter(function (m) { return m.d === hi; });
      if (big.length) return big;
    }
    return res;
  }

  // Every distinct complete turn: [{ seq: [moves], state }]
  function enumerateTurns(s, c, dice) {
    var memo = new Map();
    var total = maxUse(s, c, dice, memo);
    var out = new Map();
    if (total === 0) return [];
    var visited = new Set();
    function rec(st, rem, seq) {
      if (seq.length === total) {
        var kk = key(st);
        if (!out.has(kk)) out.set(kk, { seq: seq.slice(), state: st });
        return;
      }
      var vk = key(st) + '#' + rem.slice().sort().join('') + '#' + seq.length;
      if (visited.has(vk)) return;
      visited.add(vk);
      var moves = legalMoves(st, c, rem);
      for (var i = 0; i < moves.length; i++) {
        var m = moves[i];
        var n = clone(st);
        doMove(n, c, m);
        var idx = rem.indexOf(m.d);
        seq.push(m);
        rec(n, without(rem, idx), seq);
        seq.pop();
      }
    }
    rec(s, dice, []);
    return Array.from(out.values());
  }

  function pips(s, c) {
    var total = s.bar[c] * 25;
    for (var i = 0; i < 24; i++) {
      var p = s.pts[i];
      if (p.o === c) total += p.n * (rel(i, c) + 1);
      else if (p.o === 1 - c && p.p > 0) total += p.p * (rel(i, c) + 1);
    }
    return total;
  }

  function diceFor(a, b) { return a === b ? [a, a, a, a] : [a, b]; }

  var api = {
    OFF: OFF, BAR: BAR, rel: rel, abs: abs, newState: newState, clone: clone, key: key,
    singleMoves: singleMoves, doMove: doMove, applyMove: applyMove, legalMoves: legalMoves,
    enumerateTurns: enumerateTurns, pips: pips, diceFor: diceFor, allHome: allHome
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TZ = Object.assign(root.TZ || {}, { engine: api });
})(typeof window !== 'undefined' ? window : globalThis);
