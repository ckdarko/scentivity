/* SCENTIVITY_MOBILE_VIDEO_LAZY_SHOW_20260615
   Shows the homepage video on mobile/tablet while preserving fast first load.
   It shows the lightweight poster/fallback first, then loads the MP4 after the page is interactive. */
(function () {
  'use strict';

  var VIDEO_DEFAULT = 'assets/scentivity-homepage-video.mp4';
  var POSTER_DEFAULT = 'assets/scentivity-video-poster.svg';
  var STARTED = false;
  var SETTINGS_LOADED = false;
  var SETTINGS = null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
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

  function showVideoShell() {
    var els = getEls();
    if (!els.section || !els.video) return;
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
    els.video.setAttribute('muted', '');
    els.video.setAttribute('playsinline', '');
    els.video.setAttribute('webkit-playsinline', '');
    els.video.setAttribute('preload', 'none');
    if (!els.video.getAttribute('poster')) els.video.setAttribute('poster', POSTER_DEFAULT);
  }

  function readVideoSettings() {
    if (SETTINGS_LOADED) return Promise.resolve(SETTINGS);
    SETTINGS_LOADED = true;
    return fetch('data/products.json', { cache: 'default' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var config = data && data.homepageVideo && typeof data.homepageVideo === 'object' ? data.homepageVideo : {};
        SETTINGS = {
          enabled: config.enabled !== false,
          videoFile: cleanPath(config.videoFile || config.video || config.src || VIDEO_DEFAULT, VIDEO_DEFAULT),
          posterImage: cleanPath(config.posterImage || config.poster || POSTER_DEFAULT, POSTER_DEFAULT),
          buttonText: String(config.buttonText || '').trim(),
          buttonLink: String(config.buttonLink || '').trim()
        };
        return SETTINGS;
      })
      .catch(function () {
        SETTINGS = { enabled: true, videoFile: VIDEO_DEFAULT, posterImage: POSTER_DEFAULT };
        return SETTINGS;
      });
  }

  function setOverlay(settings) {
    if (!settings) return;
    var button = document.querySelector('#homepageVideoSection .homepage-video-overlay .btn');
    if (button) {
      if (settings.buttonText) button.textContent = settings.buttonText;
      if (settings.buttonLink) button.setAttribute('href', settings.buttonLink);
    }
  }

  function loadAndPlayVideo() {
    if (STARTED) return;
    STARTED = true;

    var els = getEls();
    if (!els.section || !els.video) return;
    showVideoShell();

    readVideoSettings().then(function (settings) {
      if (!settings || settings.enabled === false || !settings.videoFile) return;
      setOverlay(settings);

      els = getEls();
      if (!els.video) return;
      var source = els.source || els.video.querySelector('source');

      els.video.poster = settings.posterImage || POSTER_DEFAULT;
      els.video.preload = 'metadata';
      els.video.muted = true;
      els.video.defaultMuted = true;
      els.video.playsInline = true;
      els.video.setAttribute('muted', '');
      els.video.setAttribute('playsinline', '');
      els.video.setAttribute('webkit-playsinline', '');

      if (source) {
        if (source.getAttribute('src') !== settings.videoFile) {
          source.setAttribute('src', settings.videoFile);
        }
      } else if (!els.video.getAttribute('src')) {
        els.video.setAttribute('src', settings.videoFile);
      }

      var markReady = function () {
        if (els.card) {
          els.card.classList.add('video-ready');
          els.card.classList.remove('video-paused');
        }
      };

      els.video.addEventListener('loadeddata', markReady, { once: true });
      els.video.addEventListener('canplay', markReady, { once: true });
      els.video.addEventListener('playing', function () {
        if (els.card) {
          els.card.classList.add('video-playing', 'video-ready');
          els.card.classList.remove('video-paused');
        }
      }, { once: true });
      els.video.addEventListener('error', function () {
        if (els.card) {
          els.card.classList.add('video-paused');
          els.card.classList.remove('video-ready', 'video-playing');
        }
      }, { once: true });

      try { els.video.load(); } catch (e) {}
      try {
        var playPromise = els.video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            // Some phones block autoplay in Low Power/Data Saver mode. Keep poster/fallback visible and allow tap-to-play.
            if (els.card) els.card.classList.add('video-paused');
            els.video.addEventListener('click', function () { els.video.play().catch(function () {}); }, { once: true });
          });
        }
      } catch (e) {
        if (els.card) els.card.classList.add('video-paused');
      }
    });
  }

  function scheduleVideoLoad() {
    showVideoShell();

    var startSoon = function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadAndPlayVideo, { timeout: 3200 });
      } else {
        window.setTimeout(loadAndPlayVideo, 1800);
      }
    };

    if (document.readyState === 'complete') startSoon();
    else window.addEventListener('load', startSoon, { once: true });

    // If the visitor interacts before idle time, start the video earlier.
    ['touchstart', 'pointerdown', 'scroll'].forEach(function (name) {
      window.addEventListener(name, loadAndPlayVideo, { once: true, passive: true });
    });

    // If the video section is near/inside the viewport, allow lazy start once browser is idle.
    var els = getEls();
    if ('IntersectionObserver' in window && els.section) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            window.setTimeout(loadAndPlayVideo, 900);
            observer.disconnect();
          }
        });
      }, { rootMargin: '180px 0px' });
      observer.observe(els.section);
    }
  }

  ready(scheduleVideoLoad);
})();
