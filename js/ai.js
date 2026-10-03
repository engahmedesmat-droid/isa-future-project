/* CPU opponent: scores every complete turn with a simple heuristic.
 * Difficulty adds noise to the scores so weaker levels make mistakes. */
(function (root) {
  'use strict';
  var E = typeof module !== 'undefined' && module.exports ? require('./engine') : root.TZ.engine;

  var NOISE = { easy: 30, normal: 6, hard: 0 };

  function evaluate(s, c) {
    var o = 1 - c;
    var score = (E.pips(s, o) - E.pips(s, c)) * 1.0;
    score += (s.off[c] - s.off[o]) * 6;

    var blots = 0, made = 0, prisonersHeld = 0, prisonersLost = 0, run = 0, bestRun = 0;
    for (var r = 23; r >= 0; r--) {
      var p = s.pts[E.abs(r, c)];
      if (p.o === c && p.n === 1 && p.p === 0) blots++;
      if (p.o === c && p.n >= 2) { made++; run++; bestRun = Math.max(bestRun, run); } else run = 0;
      if (p.o === c && p.p > 0) prisonersHeld++;
      if (p.o === o && p.p > 0) prisonersLost++;
    }
    var racing = s.variant === 'mahbusa' ? false : E.allHome(s, c);
    if (s.variant === 'mahbusa') {
      score += prisonersHeld * 14 - prisonersLost * 14 - blots * 3;
    } else {
      score += (s.bar[o] * 10 - s.bar[c] * 12);
      if (!racing) score += made * 2.5 + bestRun * 2 - blots * 6;
    }
    return score;
  }

  function chooseTurn(s, c, dice, difficulty) {
    var turns = E.enumerateTurns(s, c, dice);
    if (!turns.length) return null;
    var noise = NOISE[difficulty] != null ? NOISE[difficulty] : NOISE.normal;
    var best = null, bestScore = -Infinity;
    for (var i = 0; i < turns.length; i++) {
      var sc = evaluate(turns[i].state, c) + (Math.random() - 0.5) * 2 * noise;
      if (sc > bestScore) { bestScore = sc; best = turns[i]; }
    }
    return best;
  }

  var api = { chooseTurn: chooseTurn, evaluate: evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TZ = Object.assign(root.TZ || {}, { ai: api });
})(typeof window !== 'undefined' ? window : globalThis);
