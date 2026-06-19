/* SCENTIVITY PRODUCT PAGE IMAGE FIX 20260616
   Keeps homepage fast and ensures the product page uses the same uploaded image shown on homepage/product cards. */
(function () {
  'use strict';

  var STORE_KEY = 'scentivityLastClickedProductImageV1';
  var DATA_URL = 'data/products.json';
  var FALLBACK_IMAGE = 'assets/scentivity-logo-fused.png';

  function cleanText(value) {
    return String(value == null ? '' : value).replace(/[<>]/g, '').trim();
  }

  function slugify(value) {
    return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function productKey(product, index) {
    var base = [product && product.name, product && product.size, product && product.price, index].filter(Boolean).join('-');
    return cleanText((product && (product._key || product.id || product.slug)) || slugify(base) || ('product-' + index));
  }

  function pickImageValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) {
        var picked = pickImageValue(value[i]);
        if (picked) return picked;
      }
      return '';
    }
    if (typeof value === 'object') {
      return pickImageValue(value.url || value.src || value.path || value.file || value.image || value.href || value.filename || '');
    }
    return '';
  }

  function resolveProductImage(product) {
    if (!product || typeof product !== 'object') return '';
    var candidates = [
      product.image,
      product.photo,
      product.productPhoto,
      product.productImage,
      product.imageUrl,
      product.imageURL,
      product.photoUrl,
      product.photoURL,
      product.featuredImage,
      product.thumbnail,
      product.picture,
      product.media,
      product.images,
      product.gallery,
      product.uploadedImage,
      product.mainImage
    ];
    for (var i = 0; i < candidates.length; i += 1) {
      var picked = normalizeImagePath(pickImageValue(candidates[i]));
      if (picked) return picked;
    }
    return '';
  }

  function normalizeImagePath(path) {
    var value = cleanText(path);
    if (!value) return '';
    value = value.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(value) || value.indexOf('data:image/') === 0 || value.indexOf('blob:') === 0) return value;
    value = value.replace(/^\.\//, '');
    value = value.replace(/^\/+/g, '');
    return value;
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search || '');
    return {
      product: cleanText(params.get('product') || params.get('id') || params.get('key') || ''),
      slug: cleanText(params.get('slug') || ''),
      name: cleanText(params.get('name') || '')
    };
  }

  function getSessionSnapshot() {
    try {
      var raw = window.sessionStorage.getItem(STORE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveSessionSnapshot(snapshot) {
    try {
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify(snapshot));
    } catch (error) {}
  }

  function currentImageFromCard(card) {
    var img = card && card.querySelector('img');
    if (!img) return '';
    return normalizeImagePath(img.getAttribute('src') || img.currentSrc || img.src || '');
  }

  function titleFromCard(card) {
    if (!card) return '';
    var title = card.querySelector('h1,h2,h3,strong,[data-product-name]');
    return cleanText((title && (title.getAttribute('data-product-name') || title.textContent)) || card.getAttribute('aria-label') || '');
  }

  function captureHomepageProductImage(event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var card = target.closest('[data-product-key], .product-click-card, .product-card, .showcase-slide, .related-product-card, a[href*="product.html"]');
    if (!card) return;
    var image = currentImageFromCard(card);
    if (!image || image.indexOf('scentivity-logo-fused') !== -1) return;
    var key = cleanText(card.getAttribute('data-product-key') || card.dataset.productKey || '');
    var link = target.closest('a[href*="product.html"]') || (card.matches && card.matches('a[href*="product.html"]') ? card : card.querySelector && card.querySelector('a[href*="product.html"]'));
    if (link) {
      try {
        var url = new URL(link.getAttribute('href'), window.location.href);
        key = key || cleanText(url.searchParams.get('product') || url.searchParams.get('id') || url.searchParams.get('key') || '');
      } catch (error) {}
    }
    saveSessionSnapshot({ key: key, image: image, name: titleFromCard(card), savedAt: Date.now() });
  }

  function findProduct(products) {
    var q = getQuery();
    var nameSlug = slugify(q.name);
    for (var i = 0; i < products.length; i += 1) {
      var product = products[i] || {};
      var key = productKey(product, i);
      var id = cleanText(product.id || '');
      var slug = cleanText(product.slug || slugify(product.name || id || key));
      var name = slugify(product.name || '');
      if (
        key === q.product ||
        id === q.product ||
        slug === q.product ||
        slug === q.slug ||
        name === q.slug ||
        (nameSlug && name === nameSlug)
      ) return product;
    }
    return null;
  }

  function setMainProductImage(image, altText) {
    image = normalizeImagePath(image);
    if (!image) return false;
    var img = document.querySelector('.product-page-gallery img, .product-detail-media img, #productPageContent img');
    if (!img) return false;

    var current = normalizeImagePath(img.getAttribute('src') || img.src || '');
    if (current === image && img.complete && img.naturalWidth > 0) return true;

    img.setAttribute('src', image);
    img.setAttribute('loading', 'eager');
    img.setAttribute('decoding', 'async');
    if (altText) img.setAttribute('alt', cleanText(altText));
    img.onerror = function () {
      this.onerror = null;
      this.src = FALLBACK_IMAGE;
    };
    return true;
  }

  function injectProductImageCss() {
    if (document.getElementById('scentivityProductImageFixCss')) return;
    var style = document.createElement('style');
    style.id = 'scentivityProductImageFixCss';
    style.textContent = [
      '.product-page-gallery img,.product-detail-media img{display:block!important;visibility:visible!important;opacity:1!important;width:100%;max-width:100%;height:auto;object-fit:contain;}',
      '.product-page-gallery,.product-detail-media{min-height:220px;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function fixProductPageImage() {
    if (!/product\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search) && !document.querySelector('#productPageContent')) return;
    injectProductImageCss();

    var q = getQuery();
    var snapshot = getSessionSnapshot();
    var snapshotMatches = snapshot && snapshot.image && (
      !snapshot.key || !q.product || snapshot.key === q.product ||
      (snapshot.name && q.name && slugify(snapshot.name) === slugify(q.name))
    );

    if (snapshotMatches) {
      // Fast first pass: use the exact image the customer clicked on the homepage.
      setTimeout(function () { setMainProductImage(snapshot.image, snapshot.name || q.name); }, 120);
      setTimeout(function () { setMainProductImage(snapshot.image, snapshot.name || q.name); }, 700);
    }

    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (response) { return response.ok ? response.json() : Promise.reject(new Error('Product data failed')); })
      .then(function (data) {
        var products = Array.isArray(data.products) ? data.products : [];
        var product = findProduct(products);
        var productImage = resolveProductImage(product);
        if (productImage) {
          var apply = function () { setMainProductImage(productImage, product && product.name); };
          apply();
          setTimeout(apply, 300);
          setTimeout(apply, 1200);
        } else if (snapshotMatches) {
          setTimeout(function () { setMainProductImage(snapshot.image, snapshot.name || q.name); }, 1200);
        }
      })
      .catch(function () {
        if (snapshotMatches) setTimeout(function () { setMainProductImage(snapshot.image, snapshot.name || q.name); }, 1200);
      });

    // If the existing product-page script renders after this file, update again once its DOM changes.
    var content = document.getElementById('productPageContent');
    if (content && 'MutationObserver' in window) {
      var observer = new MutationObserver(function () {
        var snap = getSessionSnapshot();
        if (snap && snap.image) setMainProductImage(snap.image, snap.name || q.name);
      });
      observer.observe(content, { childList: true, subtree: true });
      setTimeout(function () { observer.disconnect(); }, 6000);
    }
  }

  document.addEventListener('click', captureHomepageProductImage, true);
  document.addEventListener('touchstart', captureHomepageProductImage, { capture: true, passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixProductPageImage);
  } else {
    fixProductPageImage();
  }
})();
