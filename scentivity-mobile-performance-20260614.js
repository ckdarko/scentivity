/* Scentivity mobile performance helper
   Safe add-on: does not change products, admin data, cart data, or page layout.
   It delays heavy video loading and optimizes images created by the page scripts. */
(function () {
  'use strict';

  var PERF_FLAG = 'data-scentivity-perf-20260614';
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var saveData = !!(connection && connection.saveData);

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function idle(fn, timeout) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout: timeout || 2000 });
    } else {
      window.setTimeout(fn, Math.min(timeout || 600, 1200));
    }
  }

  function isCriticalImage(img) {
    return !!(
      img.closest('.site-header') ||
      img.closest('.brand') ||
      img.hasAttribute('data-no-lazy') ||
      img.getAttribute('fetchpriority') === 'high'
    );
  }

  function optimizeImage(img) {
    if (!img || img.nodeType !== 1 || img.hasAttribute(PERF_FLAG)) return;
    img.setAttribute(PERF_FLAG, 'true');

    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

    if (!isCriticalImage(img)) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
    } else if (!img.hasAttribute('fetchpriority')) {
      img.setAttribute('fetchpriority', 'high');
    }

    // Prevent very large dynamic product images from forcing huge layout calculations.
    if (!img.hasAttribute('sizes') && (img.closest('.product-card') || img.closest('.showcase') || img.closest('.combo') || img.closest('.feedback'))) {
      img.setAttribute('sizes', '(max-width: 768px) 50vw, 320px');
    }
  }

  function optimizeImages(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('img').forEach(optimizeImage);
  }

  function setupVideo(video) {
    if (!video || video.hasAttribute('data-scentivity-video-optimized')) return;
    video.setAttribute('data-scentivity-video-optimized', 'true');
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'none');

    var sources = Array.prototype.slice.call(video.querySelectorAll('source'));
    sources.forEach(function (source) {
      var src = source.getAttribute('src');
      if (src && !source.dataset.src) {
        source.dataset.src = src;
        source.removeAttribute('src');
      }
    });

    var loaded = false;
    function loadVideo() {
      if (loaded) return;
      loaded = true;
      sources.forEach(function (source) {
        if (!source.getAttribute('src') && source.dataset.src) {
          source.setAttribute('src', source.dataset.src);
        }
      });
      try { video.load(); } catch (e) {}
      if (!prefersReducedMotion && !saveData) {
        var playPromise = video.play && video.play();
        if (playPromise && playPromise.catch) playPromise.catch(function () {});
      }
    }

    // On reduced-motion or data-saver devices, do not spend data on the video unless the user touches/clicks it.
    if (prefersReducedMotion || saveData) {
      video.addEventListener('click', loadVideo, { once: true });
      video.addEventListener('touchstart', loadVideo, { once: true, passive: true });
      return;
    }

    function scheduleLoad() {
      // Mobile: let the text/products/menu become interactive first, then load video.
      var delay = isMobile ? 2200 : 500;
      window.setTimeout(function () { idle(loadVideo, 1800); }, delay);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            observer.disconnect();
            scheduleLoad();
          }
        });
      }, { rootMargin: '250px 0px' });
      observer.observe(video);
    } else {
      scheduleLoad();
    }

    // User intent should start the video immediately.
    ['pointerdown', 'touchstart', 'scroll'].forEach(function (evt) {
      window.addEventListener(evt, loadVideo, { once: true, passive: true });
    });
  }

  function setupVideos(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('video').forEach(setupVideo);
  }

  function observeDynamicMedia() {
    if (!('MutationObserver' in window)) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === 'IMG') optimizeImage(node);
          if (node.tagName === 'VIDEO') setupVideo(node);
          optimizeImages(node);
          setupVideos(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  onReady(function () {
    optimizeImages(document);
    setupVideos(document);
    observeDynamicMedia();

    // Re-check after page scripts render product cards/slides.
    [400, 1200, 2500].forEach(function (delay) {
      window.setTimeout(function () {
        optimizeImages(document);
        setupVideos(document);
      }, delay);
    });
  });
})();
