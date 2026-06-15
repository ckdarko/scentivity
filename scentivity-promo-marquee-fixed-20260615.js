(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function makeSpan(text, hidden) {
    var span = document.createElement('span');
    span.textContent = text;
    if (hidden) span.setAttribute('aria-hidden', 'true');
    return span;
  }

  function getTextsFrom(node) {
    var spans = Array.prototype.slice.call(node.querySelectorAll(':scope > span'));
    if (!spans.length) spans = Array.prototype.slice.call(node.querySelectorAll('span'));
    var texts = spans.map(function (span) { return (span.textContent || '').trim(); }).filter(Boolean);
    var seen = Object.create(null);
    return texts.filter(function (text) {
      var key = text.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function buildTrack(texts) {
    var track = document.createElement('div');
    track.className = 'scentivity-promo-track';
    // Two identical groups allow a smooth translateX(-50%) loop.
    for (var r = 0; r < 2; r += 1) {
      texts.forEach(function (text) { track.appendChild(makeSpan(text, r > 0)); });
    }
    return track;
  }

  function setupTopPromo() {
    var bar = document.querySelector('.top-promo');
    if (!bar || bar.dataset.scentivityPromoFixed === 'true') return;
    var texts = getTextsFrom(bar);
    if (!texts.length) return;
    bar.textContent = '';
    bar.appendChild(buildTrack(texts));
    bar.classList.add('scentivity-promo-shell');
    bar.dataset.scentivityPromoFixed = 'true';
  }

  function setupProductPromo() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('.product-page-promo-bar, .product-page-body .promo-bar'));
    bars.forEach(function (bar) {
      if (!bar || bar.dataset.scentivityPromoFixed === 'true') return;
      var existingTrack = bar.querySelector('.promo-marquee, .product-page-promo-marquee') || bar;
      var texts = getTextsFrom(existingTrack);
      if (!texts.length) return;
      existingTrack.textContent = '';
      existingTrack.classList.add('scentivity-promo-original');
      existingTrack.appendChild(buildTrack(texts));
      bar.classList.add('scentivity-promo-shell');
      bar.dataset.scentivityPromoFixed = 'true';
    });
  }

  ready(function () {
    setupTopPromo();
    setupProductPromo();
    // A very small retry helps if product page scripts rebuild the header after first paint.
    window.setTimeout(function () {
      setupTopPromo();
      setupProductPromo();
    }, 450);
  });
})();
