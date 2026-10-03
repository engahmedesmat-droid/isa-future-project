/* All sounds are synthesised with WebAudio, so the game ships no audio files. */
(function (root) {
  'use strict';
  var ctx = null, muted = false, noiseBuf = null;

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noise(a) {
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  function burst(delay, dur, freq, gain) {
    var a = ac(); if (!a || muted) return;
    var t0 = a.currentTime + delay;
    var src = a.createBufferSource(); src.buffer = noise(a);
    var f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    var g = a.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  function tone(delay, dur, f0, f1, gain, type) {
    var a = ac(); if (!a || muted) return;
    var t0 = a.currentTime + delay;
    var o = a.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  var api = {
    setMuted: function (m) { muted = m; },
    isMuted: function () { return muted; },
    unlock: function () { ac(); },
    dice: function () {
      for (var i = 0; i < 9; i++) burst(i * 0.07 + Math.random() * 0.03, 0.06, 1800 + Math.random() * 2200, 0.35);
    },
    move: function () { tone(0, 0.09, 220, 110, 0.35, 'triangle'); burst(0, 0.03, 3000, 0.25); },
    hit: function () { tone(0, 0.22, 150, 55, 0.5, 'triangle'); burst(0, 0.1, 900, 0.4); },
    off: function () { tone(0, 0.12, 520, 760, 0.18, 'sine'); },
    tick: function () { tone(0, 0.05, 880, 0, 0.12, 'sine'); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(i * 0.13, 0.35, f, 0, 0.22, 'sine'); }); },
    lose: function () { [392, 330, 262].forEach(function (f, i) { tone(i * 0.18, 0.4, f, 0, 0.2, 'triangle'); }); }
  };
  root.TZ = Object.assign(root.TZ || {}, { audio: api });
})(window);
