/* SCENTIVITY_IMAGE_VIDEO_SPEED_20260805
   Lightweight performance helper for product images and homepage video.
   It does not change products, delete images, or edit data/products.json. */
(function () {
  'use strict';

  var PRODUCT_JSON_PATTERN = /(?:^|\/)data\/products\.json(?:\?|#|$)/i;
  var PRODUCT_IMG_SELECTORS = [
    '#productGrid img',
    '.product-grid img',
    '#homepageProductSlides img',
    '.showcase-track img',
    '#comboGrid img',
    '.combo-grid img',
    '#bundleBuilderGrid img',
    '.bundle-builder-grid img',
    '#cartItems img',
    'img[src*="assets/products/"]'
  ].join(',');
  var warmedLinks = Object.create(null);
  var productResponsePromise = null;
  var originalFetch = window.fetch ? window.fetch.bind(window) : null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function requestIdle(fn, timeout) {
    if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: timeout || 1200 });
    else window.setTimeout(fn, timeout || 450);
  }

  function getRequestUrl(input) {
    try {
      if (typeof input === 'string') return input;
      if (input && typeof input.url === 'string') return input.url;
    } catch (e) {}
    return '';
  }

  function getRequestMethod(input, init) {
    var method = (init && init.method) || (input && input.method) || 'GET';
    return String(method || 'GET').toUpperCase();
  }

  function isProductDataRequest(input, init) {
    var url = getRequestUrl(input);
    return originalFetch && getRequestMethod(input, init) === 'GET' && PRODUCT_JSON_PATTERN.test(url);
  }

  function safeParseProductData(response) {
    try {
      response.clone().json().then(function (data) {
        window.ScentivityProductData = data;
        warmProductImagesFromData(data);
      }).catch(function () {});
    } catch (e) {}
  }

  // Share the products JSON response between scripts if several helpers request it.
  // Each caller receives a clone, so normal app code can still read the body safely.
  if (originalFetch) {
    window.fetch = function (input, init) {
      if (!isProductDataRequest(input, init)) return originalFetch(input, init);
      if (!productResponsePromise) {
        productResponsePromise = originalFetch(input, init).then(function (response) {
          safeParseProductData(response);
          return response;
        }).catch(function (error) {
          productResponsePromise = null;
          throw error;
        });
      }
      return productResponsePromise.then(function (response) { return response.clone(); });
    };
  }

  function cleanUrl(value) {
    value = String(value || '').trim();
    if (!value || value === '#') return '';
    if (/^data:/i.test(value)) return '';
    return value.replace(/^\.\//, '');
  }

  function addWarmLink(href, rel, priority) {
    href = cleanUrl(href);
    if (!href || warmedLinks[href]) return;
    warmedLinks[href] = true;
    var link = document.createElement('link');
    link.rel = rel || 'prefetch';
    link.as = 'image';
    link.href = href;
    if (priority) link.setAttribute('fetchpriority', priority);
    document.head.appendChild(link);
  }

  function collectImageUrlsFromProduct(product, out) {
    if (!product || typeof product !== 'object') return;
    var fields = [
      'image', 'imageUrl', 'imageURL', 'productImage', 'photo', 'thumbnail', 'mainImage',
      'featuredImage', 'coverImage', 'primaryImage'
    ];
    fields.forEach(function (field) {
      if (typeof product[field] === 'string') out.push(product[field]);
    });
    ['images', 'gallery', 'productImages'].forEach(function (field) {
      var value = product[field];
      if (Array.isArray(value)) {
        value.forEach(function (item) {
          if (typeof item === 'string') out.push(item);
          else if (item && typeof item === 'object') {
            if (typeof item.url === 'string') out.push(item.url);
            if (typeof item.src === 'string') out.push(item.src);
            if (typeof item.image === 'string') out.push(item.image);
          }
        });
      }
    });
  }

  function getProductsArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.products)) return data.products;
    if (data.store && Array.isArray(data.store.products)) return data.store.products;
    return [];
  }

  function warmProductImagesFromData(data) {
    var products = getProductsArray(data);
    if (!products.length) return;
    var urls = [];
    products.forEach(function (product) { collectImageUrlsFromProduct(product, urls); });
    var seen = Object.create(null);
    var unique = urls.map(cleanUrl).filter(function (url) {
      if (!url || seen[url]) return false;
      seen[url] = true;
      return true;
    });
    // Prioritize the first visible product images; gently prefetch a few more.
    unique.slice(0, 4).forEach(function (url) { addWarmLink(url, 'preload', 'high'); });
    unique.slice(4, 14).forEach(function (url) { addWarmLink(url, 'prefetch', 'low'); });
  }

  function isNearViewport(el, distance) {
    try {
      var rect = el.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight || 800;
      return rect.top < h + (distance || 400) && rect.bottom > -150;
    } catch (e) { return false; }
  }

  function optimizeImage(img, index) {
    if (!img || img.nodeType !== 1 || img.dataset.scentivitySpeedOptimized === 'true') return;
    img.dataset.scentivitySpeedOptimized = 'true';
    try { img.decoding = 'async'; } catch (e) {}
    img.setAttribute('decoding', 'async');
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    try { img.loading = img.getAttribute('loading') || 'lazy'; } catch (e) {}

    var shouldPrioritize = index < 8 || isNearViewport(img, 500);
    if (shouldPrioritize) {
      img.setAttribute('loading', 'eager');
      try { img.loading = 'eager'; } catch (e) {}
      try { img.fetchPriority = 'high'; } catch (e) {}
      img.setAttribute('fetchpriority', 'high');
      var src = img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src');
      if (src) addWarmLink(src, 'preload', 'high');
    } else {
      try { img.fetchPriority = 'low'; } catch (e) {}
      img.setAttribute('fetchpriority', 'low');
    }
  }

  function optimizeExistingImages() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll(PRODUCT_IMG_SELECTORS));
    imgs.forEach(function (img, index) { optimizeImage(img, index); });
  }

  function watchNewImages() {
    if (!('MutationObserver' in window) || !document.body) return;
    var observer = new MutationObserver(function (mutations) {
      var needsRefresh = false;
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.matches && node.matches(PRODUCT_IMG_SELECTORS)) {
            optimizeImage(node, 0);
          } else if (node.querySelectorAll) {
            var imgs = node.querySelectorAll(PRODUCT_IMG_SELECTORS);
            if (imgs && imgs.length) needsRefresh = true;
          }
        });
      });
      if (needsRefresh) requestIdle(optimizeExistingImages, 250);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function upgradeImagesNearViewport() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
        try { img.loading = 'eager'; img.fetchPriority = 'high'; } catch (e) {}
        observer.unobserve(img);
      });
    }, { rootMargin: '650px 0px' });
    Array.prototype.forEach.call(document.querySelectorAll(PRODUCT_IMG_SELECTORS), function (img) {
      observer.observe(img);
    });
  }

  function warmHomepageVideoPoster() {
    addWarmLink('assets/scentivity-video-poster.svg', 'preload', 'high');
    var video = document.getElementById('homepageVideo');
    if (!video) return;
    if (!video.getAttribute('poster')) video.setAttribute('poster', 'assets/scentivity-video-poster.svg');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.defaultMuted = true;
  }

  function warmProductsJSON() {
    if (!originalFetch || window.ScentivityProductData) return;
    requestIdle(function () {
      try {
        window.fetch('data/products.json', { cache: 'default' }).then(function () {}).catch(function () {});
      } catch (e) {}
    }, 700);
  }

  ready(function () {
    warmHomepageVideoPoster();
    optimizeExistingImages();
    watchNewImages();
    upgradeImagesNearViewport();
    warmProductsJSON();
    window.addEventListener('load', function () {
      requestIdle(function () {
        optimizeExistingImages();
        upgradeImagesNearViewport();
      }, 400);
    }, { once: true });
  });
})();
