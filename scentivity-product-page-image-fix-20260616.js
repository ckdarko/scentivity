/* SCENTIVITY PRODUCT PAGE IMAGE + RELATED PRODUCTS IMAGE FIX V2 20260619
   - Keeps homepage/mobile speed light.
   - Captures the clicked product image before moving to product.html.
   - Restores main product image.
   - Repairs images inside "Other available products" cards using only data/products.json.
*/
(function () {
  'use strict';

  var STORE_KEY = 'scentivityLastClickedProductImageV2';
  var DATA_URL = 'data/products.json';
  var FALLBACK_IMAGE = 'assets/scentivity-logo-fused.png';
  var PLACEHOLDER_HINTS = ['data:image/svg', 'scentivity-logo-fused'];
  var productDataPromise = null;

  function cleanText(value) {
    return String(value == null ? '' : value).replace(/[<>]/g, '').trim();
  }

  function slugify(value) {
    return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function normalizeImagePath(path) {
    var value = cleanText(path);
    if (!value) return '';
    value = value.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(value) || value.indexOf('data:image/') === 0 || value.indexOf('blob:') === 0) return value;
    value = value.replace(/^\.\//, '').replace(/^\/+/, '');
    return value;
  }

  function isPlaceholder(src) {
    src = cleanText(src);
    if (!src) return true;
    return PLACEHOLDER_HINTS.some(function (hint) { return src.indexOf(hint) !== -1; });
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
      return pickImageValue(
        value.url || value.src || value.path || value.file || value.image ||
        value.href || value.filename || value.publicUrl || value.downloadUrl || ''
      );
    }
    return '';
  }

  function resolveProductImage(product) {
    if (!product || typeof product !== 'object') return '';
    var candidates = [
      product.image,
      product.photo,
      product.productPhoto,
      product.product_photo,
      product.productImage,
      product.product_image,
      product.imageUrl,
      product.imageURL,
      product.photoUrl,
      product.photoURL,
      product.featuredImage,
      product.featured_image,
      product.thumbnail,
      product.thumb,
      product.picture,
      product.media,
      product.images,
      product.gallery,
      product.uploadedImage,
      product.uploaded_image,
      product.mainImage,
      product.main_image,
      product.cover,
      product.coverImage
    ];
    for (var i = 0; i < candidates.length; i += 1) {
      var picked = normalizeImagePath(pickImageValue(candidates[i]));
      if (picked && !isPlaceholder(picked)) return picked;
    }
    return '';
  }

  function productKey(product, index) {
    var base = [product && product.name, product && product.size, product && product.price, index].filter(Boolean).join('-');
    return cleanText((product && (product._key || product.id || product.slug)) || slugify(base) || ('product-' + index));
  }

  function getProductKeys(product, index) {
    var keys = [];
    function add(value) {
      value = cleanText(value);
      if (!value) return;
      if (keys.indexOf(value) === -1) keys.push(value);
      var s = slugify(value);
      if (s && keys.indexOf(s) === -1) keys.push(s);
    }
    add(productKey(product, index));
    add(product && product.id);
    add(product && product.slug);
    add(product && product.name);
    add(product && [product.name, product.size, product.price, index].filter(Boolean).join('-'));
    return keys;
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search || '');
    return {
      product: cleanText(params.get('product') || params.get('id') || params.get('key') || ''),
      slug: cleanText(params.get('slug') || ''),
      name: cleanText(params.get('name') || '')
    };
  }

  function fetchProducts() {
    if (productDataPromise) return productDataPromise;
    productDataPromise = fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (response) { return response.ok ? response.json() : { products: [] }; })
      .then(function (data) { return Array.isArray(data.products) ? data.products : []; })
      .catch(function () { return []; });
    return productDataPromise;
  }

  function findProduct(products) {
    var q = getQuery();
    var possible = [q.product, q.slug, q.name, slugify(q.name)].filter(Boolean);
    for (var i = 0; i < products.length; i += 1) {
      var keys = getProductKeys(products[i], i);
      for (var j = 0; j < possible.length; j += 1) {
        if (keys.indexOf(possible[j]) !== -1 || keys.indexOf(slugify(possible[j])) !== -1) return products[i];
      }
    }
    return null;
  }

  function getSessionSnapshot() {
    try {
      var parsed = JSON.parse(window.sessionStorage.getItem(STORE_KEY) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveSessionSnapshot(snapshot) {
    try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(snapshot)); } catch (error) {}
  }

  function currentImageFromCard(card) {
    var img = card && card.querySelector('img');
    if (!img) return '';
    return normalizeImagePath(img.getAttribute('data-src') || img.getAttribute('src') || img.currentSrc || img.src || '');
  }

  function titleFromCard(card) {
    if (!card) return '';
    var title = card.querySelector('h1,h2,h3,strong,[data-product-name],.product-title,.product-name');
    return cleanText((title && (title.getAttribute('data-product-name') || title.textContent)) || card.getAttribute('aria-label') || '');
  }

  function captureProductCardImage(event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var card = target.closest('[data-product-key], .product-click-card, .product-card, .showcase-slide, .related-product-card, a[href*="product.html"]');
    if (!card) return;
    var image = currentImageFromCard(card);
    if (!image || isPlaceholder(image)) return;
    var key = cleanText(card.getAttribute('data-product-key') || (card.dataset && card.dataset.productKey) || '');
    var link = target.closest('a[href*="product.html"]') || (card.matches && card.matches('a[href*="product.html"]') ? card : card.querySelector && card.querySelector('a[href*="product.html"]'));
    if (link) {
      try {
        var url = new URL(link.getAttribute('href') || link.href || '', window.location.href);
        key = key || cleanText(url.searchParams.get('product') || url.searchParams.get('id') || url.searchParams.get('key') || '');
      } catch (error) {}
    }
    saveSessionSnapshot({ key: key, image: image, name: titleFromCard(card), savedAt: Date.now() });
  }

  function setImageElement(img, image, altText, eager) {
    image = normalizeImagePath(image);
    if (!img || !image) return false;
    img.classList.remove('scentivity-lazy-img');
    img.removeAttribute('data-src');
    img.setAttribute('src', image);
    img.setAttribute('loading', eager ? 'eager' : 'lazy');
    img.setAttribute('decoding', 'async');
    if (altText) img.setAttribute('alt', cleanText(altText));
    img.style.display = 'block';
    img.style.visibility = 'visible';
    img.style.opacity = '1';
    img.onerror = function () {
      this.onerror = null;
      this.src = FALLBACK_IMAGE;
    };
    return true;
  }

  function setMainProductImage(image, altText) {
    var img = document.querySelector('.product-page-gallery img, .product-detail-media img, #productPageContent .product-page-detail img');
    return setImageElement(img, image, altText, true);
  }

  function linkKeys(linkOrCard) {
    var keys = [];
    function add(value) {
      value = cleanText(value);
      if (!value) return;
      if (keys.indexOf(value) === -1) keys.push(value);
      var s = slugify(value);
      if (s && keys.indexOf(s) === -1) keys.push(s);
    }
    var link = linkOrCard && (linkOrCard.matches && linkOrCard.matches('a[href]') ? linkOrCard : linkOrCard.querySelector && linkOrCard.querySelector('a[href]'));
    if (link || (linkOrCard && linkOrCard.getAttribute)) {
      var href = (link && (link.getAttribute('href') || link.href)) || (linkOrCard.getAttribute && linkOrCard.getAttribute('href')) || '';
      try {
        var url = new URL(href, window.location.href);
        ['product', 'id', 'key', 'slug', 'name'].forEach(function (param) { add(url.searchParams.get(param)); });
      } catch (error) {}
    }
    add(titleFromCard(linkOrCard));
    return keys;
  }

  function buildLookup(products) {
    var lookup = Object.create(null);
    products.forEach(function (product, index) {
      var image = resolveProductImage(product);
      var name = cleanText(product && product.name);
      var item = { product: product, image: image, name: name };
      getProductKeys(product, index).forEach(function (key) { lookup[key] = item; });
    });
    return lookup;
  }

  function injectCss() {
    if (document.getElementById('scentivityProductImageFixCssV2')) return;
    var style = document.createElement('style');
    style.id = 'scentivityProductImageFixCssV2';
    style.textContent = [
      '.product-page-gallery img,.product-detail-media img{display:block!important;visibility:visible!important;opacity:1!important;width:100%;max-width:100%;height:auto;object-fit:contain;}',
      '.product-page-gallery,.product-detail-media{min-height:220px;}',
      '.related-products-grid .related-product-card img{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;aspect-ratio:1/1;object-fit:contain;background:#fff6fa;border-radius:18px;margin-bottom:.75rem;}',
      '.related-products-grid .related-product-card{overflow:hidden;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function repairRelatedProducts(products) {
    var root = document.getElementById('productPageContent') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.related-product-card'));
    if (!cards.length) return;

    var lookup = buildLookup(products || []);
    cards.forEach(function (card) {
      var img = card.querySelector('img');
      var existingReal = img && normalizeImagePath(img.getAttribute('data-src') || '');
      var current = img && normalizeImagePath(img.getAttribute('src') || img.currentSrc || img.src || '');

      if (existingReal && !isPlaceholder(existingReal)) {
        setImageElement(img, existingReal, titleFromCard(card), false);
        return;
      }
      if (current && !isPlaceholder(current)) return;

      var keys = linkKeys(card);
      var item = null;
      for (var i = 0; i < keys.length; i += 1) {
        if (lookup[keys[i]]) { item = lookup[keys[i]]; break; }
      }
      if (!item) return;
      if (!img) {
        img = document.createElement('img');
        card.insertBefore(img, card.firstChild);
      }
      if (item.image) setImageElement(img, item.image, item.name || titleFromCard(card), false);
    });
  }

  function runFix() {
    var isProductPage = /product\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search) || document.getElementById('productPageContent');
    injectCss();

    if (isProductPage) {
      var q = getQuery();
      var snap = getSessionSnapshot();
      var snapMatches = snap && snap.image && (!q.product || !snap.key || snap.key === q.product || (snap.name && q.name && slugify(snap.name) === slugify(q.name)));
      if (snapMatches) {
        setTimeout(function () { setMainProductImage(snap.image, snap.name || q.name); }, 100);
        setTimeout(function () { setMainProductImage(snap.image, snap.name || q.name); }, 650);
      }

      fetchProducts().then(function (products) {
        var product = findProduct(products);
        var image = resolveProductImage(product);
        if (image) {
          setMainProductImage(image, product && product.name);
          setTimeout(function () { setMainProductImage(image, product && product.name); }, 600);
        }
        repairRelatedProducts(products);
        setTimeout(function () { repairRelatedProducts(products); }, 350);
        setTimeout(function () { repairRelatedProducts(products); }, 1400);
        setTimeout(function () { repairRelatedProducts(products); }, 3000);
      });

      var content = document.getElementById('productPageContent');
      if (content && 'MutationObserver' in window) {
        var pending = false;
        var observer = new MutationObserver(function () {
          if (pending) return;
          pending = true;
          setTimeout(function () {
            pending = false;
            fetchProducts().then(function (products) { repairRelatedProducts(products); });
          }, 80);
        });
        observer.observe(content, { childList: true, subtree: true });
        setTimeout(function () { observer.disconnect(); }, 12000);
      }
    }
  }

  document.addEventListener('click', captureProductCardImage, true);
  document.addEventListener('touchstart', captureProductCardImage, { capture: true, passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFix);
  } else {
    runFix();
  }
})();
