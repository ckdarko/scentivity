/* SCENTIVITY OTHER AVAILABLE PRODUCTS RANDOMIZER 20260619
   - Product page only.
   - Replaces the fixed "Other available products" cards with 4 random available products.
   - Pulls from data/products.json, so newly added admin products are included automatically.
   - Keeps mobile opening speed light: one small fetch on product pages only.
*/
(function () {
  'use strict';

  var DATA_URL = 'data/products.json';
  var FALLBACK_IMAGE = 'assets/scentivity-logo-fused.png';
  var productPromise = null;
  var selectedKeysByPage = Object.create(null);

  function cleanText(value) {
    return String(value == null ? '' : value).replace(/[<>]/g, '').trim();
  }

  function escapeHtml(value) {
    return cleanText(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function slugify(value) {
    return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function parsePriceNumber(price) {
    var match = String(price || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  function normalizeImagePath(path) {
    var value = cleanText(path);
    if (!value) return FALLBACK_IMAGE;
    value = value.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(value) || value.indexOf('data:image/') === 0 || value.indexOf('blob:') === 0) return value;
    return value.replace(/^\.\//, '').replace(/^\/+/, '') || FALLBACK_IMAGE;
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

  function productImage(product) {
    var candidates = [
      product && product.image,
      product && product.photo,
      product && product.productPhoto,
      product && product.product_photo,
      product && product.productImage,
      product && product.product_image,
      product && product.imageUrl,
      product && product.imageURL,
      product && product.photoUrl,
      product && product.photoURL,
      product && product.featuredImage,
      product && product.featured_image,
      product && product.thumbnail,
      product && product.thumb,
      product && product.picture,
      product && product.media,
      product && product.images,
      product && product.gallery,
      product && product.uploadedImage,
      product && product.uploaded_image,
      product && product.mainImage,
      product && product.main_image,
      product && product.cover,
      product && product.coverImage
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      var picked = normalizeImagePath(pickImageValue(candidates[i]));
      if (picked && picked !== FALLBACK_IMAGE) return picked;
    }
    return FALLBACK_IMAGE;
  }

  function productStatus(product) {
    var raw = cleanText((product && (product.productStatus || product.status)) || '').toLowerCase().replace(/[_-]+/g, ' ');
    if (raw.indexOf('out') !== -1 || raw.indexOf('sold') !== -1 || raw.indexOf('unavailable') !== -1) return 'Out of Stock';
    if (raw.indexOf('incoming') !== -1 || raw.indexOf('coming') !== -1 || raw.indexOf('preorder') !== -1 || raw.indexOf('pre order') !== -1) return 'Incoming';
    if (raw.indexOf('available') !== -1 || raw.indexOf('stock') !== -1 || raw.indexOf('active') !== -1) return 'Available';
    if (product && product.available === false) return 'Out of Stock';
    return 'Available';
  }

  function isPublished(product) {
    if (!product || typeof product !== 'object') return false;
    if (product.showOnWebsite === false || product.hideFromWebsite === true || product.hidden === true) return false;
    if (String(product.itemType || product.type || '').toLowerCase().indexOf('combo') !== -1) return false;
    if (String(product.isCombo || '').toLowerCase() === 'true') return false;
    return !!cleanText(product.name);
  }

  function isAvailableProduct(product) {
    return isPublished(product) && productStatus(product) === 'Available';
  }

  function productKey(product, index) {
    return cleanText(
      (product && (product._key || product.id || product.slug)) ||
      slugify([product && product.name, product && product.size, product && product.price, index].filter(Boolean).join('-')) ||
      ('product-' + index)
    );
  }

  function productUrl(product, index) {
    var key = productKey(product, index);
    var slug = cleanText((product && product.slug) || slugify(product && product.name) || key);
    var name = cleanText(product && product.name);
    return 'product.html?product=' + encodeURIComponent(key) + '&slug=' + encodeURIComponent(slug) + '&name=' + encodeURIComponent(name);
  }

  function currentProductKeys() {
    var params = new URLSearchParams(window.location.search || '');
    var title = document.querySelector('#productPageContent h1, .product-page-summary h1');
    var values = [
      params.get('product'),
      params.get('id'),
      params.get('key'),
      params.get('slug'),
      params.get('name'),
      title && title.textContent
    ];
    var keys = [];
    values.forEach(function (value) {
      value = cleanText(value);
      if (!value) return;
      if (keys.indexOf(value) === -1) keys.push(value);
      var slug = slugify(value);
      if (slug && keys.indexOf(slug) === -1) keys.push(slug);
    });
    return keys;
  }

  function matchesCurrentProduct(product, index, currentKeys) {
    var keys = [
      productKey(product, index),
      product && product.id,
      product && product.slug,
      product && product.name,
      slugify(product && product.name)
    ].map(cleanText).filter(Boolean);

    return keys.some(function (key) {
      return currentKeys.indexOf(key) !== -1 || currentKeys.indexOf(slugify(key)) !== -1;
    });
  }

  function loadProducts() {
    if (productPromise) return productPromise;
    productPromise = fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (response) { return response.ok ? response.json() : { products: [] }; })
      .then(function (data) { return Array.isArray(data.products) ? data.products : []; })
      .catch(function () { return []; });
    return productPromise;
  }

  function seededShuffle(items, seed) {
    var copy = items.slice();
    var s = 0;
    for (var i = 0; i < seed.length; i += 1) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    s = (s + Date.now() + Math.floor(Math.random() * 100000)) >>> 0;
    function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    }
    for (var j = copy.length - 1; j > 0; j -= 1) {
      var k = Math.floor(rand() * (j + 1));
      var temp = copy[j];
      copy[j] = copy[k];
      copy[k] = temp;
    }
    return copy;
  }

  function findOtherProductsSection() {
    var root = document.getElementById('productPageContent') || document;
    var headings = Array.prototype.slice.call(root.querySelectorAll('h2'));
    for (var i = 0; i < headings.length; i += 1) {
      if (/other\s+available\s+products/i.test(headings[i].textContent || '')) {
        return headings[i].closest('section') || headings[i].parentElement;
      }
    }
    return root.querySelector('.related-products-grid') && root.querySelector('.related-products-grid').closest('section');
  }

  function renderCard(product, originalIndex) {
    var name = cleanText(product.name || 'Scentivity product');
    var price = cleanText(product.price || 'Price on request');
    var image = productImage(product);
    var href = productUrl(product, originalIndex);
    var key = productKey(product, originalIndex);
    return [
      '<a class="related-product-card" data-product-key="' + escapeHtml(key) + '" href="' + escapeHtml(href) + '">',
      '  <img src="' + escapeHtml(image) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\';" />',
      '  <strong>' + escapeHtml(name) + '</strong>',
      '  <span>' + escapeHtml(price) + '</span>',
      '</a>'
    ].join('\n');
  }

  function renderRandomProducts(products) {
    var section = findOtherProductsSection();
    if (!section) return false;

    var currentKeys = currentProductKeys();
    var pageKey = currentKeys.join('|') || window.location.search || 'product-page';

    if (section.getAttribute('data-scentivity-random-other') === pageKey) return true;

    var available = products
      .map(function (product, index) { return { product: product, index: index }; })
      .filter(function (item) { return isAvailableProduct(item.product) && !matchesCurrentProduct(item.product, item.index, currentKeys); });

    // If there are fewer than 4 available products, fill from other published products so the section still looks complete.
    if (available.length < 4) {
      products.map(function (product, index) { return { product: product, index: index }; })
        .filter(function (item) {
          return isPublished(item.product) && !matchesCurrentProduct(item.product, item.index, currentKeys);
        })
        .forEach(function (item) {
          var key = productKey(item.product, item.index);
          if (!available.some(function (existing) { return productKey(existing.product, existing.index) === key; })) {
            available.push(item);
          }
        });
    }

    var shuffled = seededShuffle(available, pageKey).slice(0, 4);
    selectedKeysByPage[pageKey] = shuffled.map(function (item) { return productKey(item.product, item.index); });

    if (!shuffled.length) {
      section.innerHTML = '<h2>Other available products</h2><p class="cart-small-note">More products will be added soon.</p>';
    } else {
      section.innerHTML = '<h2>Other available products</h2><div class="related-products-grid">' +
        shuffled.map(function (item) { return renderCard(item.product, item.index); }).join('') +
        '</div>';
    }

    section.setAttribute('data-scentivity-random-other', pageKey);
    return true;
  }

  function run() {
    if (!document.getElementById('productPageContent')) return;
    loadProducts().then(function (products) {
      renderRandomProducts(products);
    });
  }

  function scheduleRuns() {
    run();
    setTimeout(run, 250);
    setTimeout(run, 800);
    setTimeout(run, 1600);
    setTimeout(run, 3200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRuns);
  } else {
    scheduleRuns();
  }

  var content = document.getElementById('productPageContent');
  if (content && 'MutationObserver' in window) {
    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(run, 100);
    });
    observer.observe(content, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 15000);
  }
})();
