/* SCENTIVITY_MOBILE_VIDEO_STARTUP_20260615 - speed refresh 2026-08-05
   Faster startup: begins loading the default homepage MP4 immediately after first paint instead
   of waiting for products.json settings first. Does not edit or delete media files. */
(function () {
  'use strict';

  var VIDEO_DEFAULT = 'assets/scentivity-homepage-video.mp4';
  var POSTER_DEFAULT = 'assets/scentivity-video-poster.svg';
  var STARTED = false;
  var SETTINGS_PROMISE = null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function isSlowConnection() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    if (c.saveData) return true;
    return /(^|\s)(slow-2g|2g)(\s|$)/i.test(String(c.effectiveType || ''));
  }

  function cleanPath(value, fallback) {
    value = String(value || '').trim();
    if (!value) return fallback;
    if (/^(https?:)?\/\//i.test(value) || value.indexOf('data:') === 0 || value.charAt(0) === '/') return value;
    return value.replace(/^\.\//, '');
  }

  function getEls() {
    var section = document.getElementById('homepageVideoSection');
    var video = document.getElementById('homepageVideo');
    var card = section ? section.querySelector('.homepage-video-card') : null;
    var source = video ? video.querySelector('source') : null;
    return { section: section, video: video, card: card, source: source };
  }

  function prepareShell() {
    var els = getEls();
    if (!els.section || !els.video) return null;

    document.body.classList.add('scentivity-mobile-video-startup-enabled');
    document.body.classList.add('scentivity-mobile-video-enabled');

    els.section.classList.remove('hidden', 'mobile-video-disabled');
    els.section.setAttribute('aria-hidden', 'false');

    if (els.card) {
      els.card.classList.add('video-paused');
      els.card.classList.remove('video-ready', 'video-playing');
    }

    els.video.muted = true;
    els.video.defaultMuted = true;
    els.video.loop = true;
    els.video.playsInline = true;
    els.video.autoplay = true;
    els.video.setAttribute('muted', '');
    els.video.setAttribute('playsinline', '');
    els.video.setAttribute('webkit-playsinline', '');
    els.video.setAttribute('autoplay', '');
    els.video.setAttribute('preload', isSlowConnection() ? 'metadata' : 'auto');
    if (!els.video.getAttribute('poster')) els.video.setAttribute('poster', POSTER_DEFAULT);
    return els;
  }

  function readVideoSettings() {
    if (SETTINGS_PROMISE) return SETTINGS_PROMISE;
    SETTINGS_PROMISE = fetch('data/products.json', { cache: 'default' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var config = data && data.homepageVideo && typeof data.homepageVideo === 'object' ? data.homepageVideo : {};
        return {
          enabled: config.enabled !== false,
          videoFile: cleanPath(config.videoFile || config.video || config.src || VIDEO_DEFAULT, VIDEO_DEFAULT),
          posterImage: cleanPath(config.posterImage || config.poster || POSTER_DEFAULT, POSTER_DEFAULT),
          buttonText: String(config.buttonText || '').trim(),
          buttonLink: String(config.buttonLink || '').trim()
        };
      })
      .catch(function () {
        return { enabled: true, videoFile: VIDEO_DEFAULT, posterImage: POSTER_DEFAULT };
      });
    return SETTINGS_PROMISE;
  }

  function setOverlay(settings) {
    var button = document.querySelector('#homepageVideoSection .homepage-video-overlay .btn');
    if (!button || !settings) return;
    if (settings.buttonText) button.textContent = settings.buttonText;
    if (settings.buttonLink) button.setAttribute('href', settings.buttonLink);
  }

  function setVideoSource(els, src, poster) {
    if (!els || !els.video || !src) return;
    var source = els.source || els.video.querySelector('source');
    var current = source ? source.getAttribute('src') : els.video.getAttribute('src');
    if (poster) els.video.setAttribute('poster', poster);
    if (source) {
      if (current !== src) source.setAttribute('src', src);
    } else if (current !== src) {
      els.video.setAttribute('src', src);
    }
    try { els.video.load(); } catch (e) {}
  }

  function attemptPlay(video, card) {
    if (!video) return;
    try {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (card) card.classList.add('video-paused');
          var resume = function () {
            video.play().catch(function () {});
            window.removeEventListener('touchstart', resume, true);
            window.removeEventListener('pointerdown', resume, true);
            window.removeEventListener('scroll', resume, true);
          };
          window.addEventListener('touchstart', resume, { once: true, passive: true, capture: true });
          window.addEventListener('pointerdown', resume, { once: true, passive: true, capture: true });
          window.addEventListener('scroll', resume, { once: true, passive: true, capture: true });
        });
      }
    } catch (e) {
      if (card) card.classList.add('video-paused');
    }
  }

  function attachVideoEvents(els) {
    if (!els || !els.video || els.video.dataset.scentivityVideoEventsAttached === 'true') return;
    els.video.dataset.scentivityVideoEventsAttached = 'true';
    var markReady = function () {
      if (els.card) {
        els.card.classList.add('video-ready');
        els.card.classList.remove('video-paused');
      }
    };
    els.video.addEventListener('loadeddata', markReady);
    els.video.addEventListener('canplay', markReady);
    els.video.addEventListener('playing', function () {
      if (els.card) {
        els.card.classList.add('video-ready', 'video-playing');
        els.card.classList.remove('video-paused');
      }
    });
    els.video.addEventListener('error', function () {
      if (els.card) els.card.classList.add('video-paused');
    });
  }

  function startHomepageVideo() {
    if (STARTED) return;
    STARTED = true;

    var els = prepareShell();
    if (!els || !els.video) return;
    attachVideoEvents(els);

    // Fast path: use the HTML data-src/default MP4 immediately.
    var fastSrc = cleanPath(
      (els.source && (els.source.getAttribute('data-src') || els.source.getAttribute('src'))) || els.video.getAttribute('data-src') || VIDEO_DEFAULT,
      VIDEO_DEFAULT
    );
    setVideoSource(els, fastSrc, els.video.getAttribute('poster') || POSTER_DEFAULT);
    attemptPlay(els.video, els.card);

    // Settings path: update poster/button/custom video after the first load has already started.
    readVideoSettings().then(function (settings) {
      if (!settings || settings.enabled === false) return;
      setOverlay(settings);
      els = getEls();
      if (!els.video) return;
      attachVideoEvents(els);
      if (settings.posterImage) els.video.setAttribute('poster', settings.posterImage);
      if (settings.videoFile && settings.videoFile !== fastSrc) {
        setVideoSource(els, settings.videoFile, settings.posterImage || POSTER_DEFAULT);
        attemptPlay(els.video, els.card);
      }
    });
  }

  function boot() {
    prepareShell();
    var startAfterPaint = function () { window.setTimeout(startHomepageVideo, 120); };
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(function () { requestAnimationFrame(startAfterPaint); });
    } else {
      window.setTimeout(startHomepageVideo, 260);
    }
    ['touchstart', 'pointerdown', 'scroll'].forEach(function (name) {
      window.addEventListener(name, startHomepageVideo, { once: true, passive: true });
    });
  }

  ready(boot);
})();
