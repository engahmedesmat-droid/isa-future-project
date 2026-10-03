/* Background music: an Umm Kulthum playlist streamed through YouTube's own embedded player.
 * Browsers only allow sound after a tap, so it starts when the player presses Play.
 * If YouTube cannot load (offline file, blocked network) the player simply never appears. */
(function (root) {
  'use strict';
  var PLAYLIST = 'PLXjDZEx-fkT28YuvS_oy-keQc3CWHcfls';
  var player = null, started = false, apiTried = false, off = false;
  try { off = localStorage.getItem('tz-music') === 'off'; } catch (e) { /* storage blocked */ }

  function $(id) { return document.getElementById(id); }

  function giveUp() {
    $('music').hidden = true;
    $('musicBtn').hidden = true;
    document.body.classList.remove('has-music');
  }

  function loadApi(cb) {
    if (root.YT && root.YT.Player) { cb(); return; }
    var prev = root.onYouTubeIframeAPIReady;
    root.onYouTubeIframeAPIReady = function () { if (prev) prev(); cb(); };
    if (apiTried) return;
    apiTried = true;
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = giveUp;
    document.head.appendChild(s);
    setTimeout(function () { if (!(root.YT && root.YT.Player)) giveUp(); }, 10000);
  }

  function refresh() {
    var playing = player && player.getPlayerState && player.getPlayerState() === 1;
    $('musicBtn').setAttribute('aria-pressed', String(!!playing));
  }

  function create() {
    $('music').hidden = false;
    document.body.classList.add('has-music');
    loadApi(function () {
      player = new root.YT.Player('ytp', {
        width: '240', height: '135',
        playerVars: { autoplay: 1, controls: 1, rel: 0, playsinline: 1, listType: 'playlist', list: PLAYLIST },
        events: {
          onReady: function (e) { e.target.setShuffle(true); e.target.playVideo(); },
          onStateChange: refresh,
          onError: function () { try { player.nextVideo(); } catch (e) { /* ignore */ } }
        }
      });
    });
  }

  function start() {
    if (started || off) return;
    started = true;
    create();
  }

  function toggle() {
    if (!started) { off = false; try { localStorage.removeItem('tz-music'); } catch (e) { /* ignore */ } start(); return; }
    if (!player || !player.getPlayerState) return;
    if (player.getPlayerState() === 1) {
      player.pauseVideo();
      try { localStorage.setItem('tz-music', 'off'); } catch (e) { /* ignore */ }
    } else {
      player.playVideo();
      try { localStorage.removeItem('tz-music'); } catch (e) { /* ignore */ }
    }
    setTimeout(refresh, 300);
  }

  $('musicBtn').addEventListener('click', toggle);
  root.TZ = Object.assign(root.TZ || {}, { music: { start: start } });
})(window);
