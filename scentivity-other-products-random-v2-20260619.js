/* SCENTIVITY OTHER AVAILABLE PRODUCTS TRUE RANDOM V2 - 20260619
   Product page only.
   Fixes cases where the old fixed cards overwrite the random cards after the page loads.
   Shows 4 random products from data/products.json and includes newly added admin products.
*/
(function () {
  'use strict';

  var DATA_URL = 'data/products.json';
  var FALLBACK_IMAGE = 'assets/scentivity-logo-fused.png';
  var RUN_ID = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
  var productsPromise = null;
  var chosenByPage = Object.create(null);
  var renderCount = 0;

  function text(value) {
    return String(value == null ? '' : value).replace(/[<>]/g, '').trim();
  }

  function esc(value) {
    return text(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function slugify(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function firstImage(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) {
        var image = firstImage(value[i]);
        if (image) return image;
      }
      return '';
    }
    if (typeof value === 'object') {
      return firstImage(value.url || value.src || value.path || value.file || value.image || value.photo || value.href || value.filename || value.publicUrl || value.downloadUrl || '');
    }
    return '';
  }

  function cleanImagePath(path) {
    var value = text(path).replace(/\\/g, '/');
    if (!value) return '';
    if (/^(https?:|data:image\/|blob:)/i.test(value)) return value;
    value = value.replace(/^\.\//, '').replace(/^\/+/, '');
    return value;
  }

  function productImage(product) {
    var fields = [
      'image', 'photo', 'productPhoto', 'product_photo', 'productImage', 'product_image',
      'imageUrl', 'imageURL', 'photoUrl', 'photoURL', 'featuredImage', 'featured_image',
      'thumbnail', 'thumb', 'picture', 'media', 'images', 'gallery', 'uploadedImage',
      'uploaded_image', 'mainImage', 'main_image', 'cover', 'coverImage'
    ];
    for (var i = 0; i < fields.length; i += 1) {
      var picked = cleanImagePath(firstImage(product && product[fields[i]]));
      if (picked) return picked;
    }
    return FALLBACK_IMAGE;
  }

  function statusOf(product) {
    var raw = text((product && (product.productStatus || product.status || product.availability)) || '').toLowerCase().replace(/[_-]+/g, ' ');
    if (product && product.available === false) return 'Out of Stock';
    if (/out|sold|unavailable/.test(raw)) return 'Out of Stock';
    if (/incoming|coming|preorder|pre order/.test(raw)) return 'Incoming';
    if (/available|stock|active/.test(raw)) return 'Available';
    return 'Available';
  }

  function showOnWebsite(product) {
    if (!product || typeof product !== 'object') return false;
    var hiddenFlags = [product.showOnWebsite === false, product.show_on_website === false, product.hideFromWebsite === true, product.hidden === true, product.draft === true];
    if (hiddenFlags.some(Boolean)) return false;
    var kind = text(product.itemType || product.type || product.productType || '').toLowerCase();
    if (/combo|bundle/.test(kind)) return false;
    if (product.isCombo === true || product.isBundle === true) return false;
    return !!text(product.name || product.title);
  }

  function productName(product) {
    return text(product && (product.name || product.title)) || 'Scentivity product';
  }

  function productKey(product, index) {
    return text((product && (product._key || product.id || product.slug || product.key)) || slugify([productName(product), product && product.size, product && product.price, index].filter(Boolean).join('-')) || ('product-' + index));
  }

  function productUrl(product, index) {
    var key = productKey(product, index);
    var slug = text((product && product.slug) || slugify(productName(product)) || key);
    var name = productName(product);
    return 'product.html?product=' + encodeURIComponent(key) + '&slug=' + encodeURIComponent(slug) + '&name=' + encodeURIComponent(name);
  }

  function currentKeys() {
    var params = new URLSearchParams(window.location.search || '');
    var heading = document.querySelector('#productPageContent h1, .product-page-content h1, .product-title, .product-page-summary h1');
    var list = [params.get('product'), params.get('id'), params.get('key'), params.get('slug'), params.get('name'), heading && heading.textContent];
    var keys = [];
    list.forEach(function (item) {
      item = text(item);
      if (!item) return;
      [item, slugify(item)].forEach(function (k) {
        if (k && keys.indexOf(k) === -1) keys.push(k);
      });
    });
    return keys;
  }

  function isCurrentProduct(product, index, keys) {
    var checks = [productKey(product, index), product && product.id, product && product.key, product && product.slug, productName(product), slugify(productName(product))]
      .map(text).filter(Boolean);
    return checks.some(function (k) { return keys.indexOf(k) !== -1 || keys.indexOf(slugify(k)) !== -1; });
  }

  function normalizeProducts(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.products)) return data.products;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.collection)) return data.collection;
    return [];
  }

  function loadProducts() {
    if (productsPromise) return productsPromise;
    // Timestamp keeps new admin products from being hidden by stale browser/CDN cache on product pages.
    var url = DATA_URL + '?v=random-other-v2-' + Date.now();
    productsPromise = fetch(url, { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : {}; })
      .then(normalizeProducts)
      .catch(function () { return []; });
    return productsPromise;
  }

  function randomNumber(max) {
    if (max <= 0) return 0;
    if (window.crypto && window.crypto.getRandomValues) {
      var arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] / 4294967296 * max;
    }
    return Math.random() * max;
  }

  function shuffle(items) {
    var out = items.slice();
    for (var i = out.length - 1; i > 0; i -= 1) {
      var j = Math.floor(randomNumber(i + 1));
      var temp = out[i];
      out[i] = out[j];
      out[j] = temp;
    }
    return out;
  }

  function findSection() {
    var root = document.getElementById('productPageContent') || document;
    var headings = Array.prototype.slice.call(root.querySelectorAll('h2, h3, .section-title'));
    for (var i = 0; i < headings.length; i += 1) {
      if (/other\s+available\s+products/i.test(headings[i].textContent || '')) {
        return headings[i].closest('section') || headings[i].parentElement;
      }
    }
    var grid = root.querySelector('.related-products-grid, .other-products-grid, [data-related-products], [data-other-products]');
    return grid && (grid.closest('section') || grid.parentElement);
  }

  function pageSignature() {
    return currentKeys().join('|') || window.location.href;
  }

  function alreadyRenderedByV2(section, signature) {
    if (!section || section.getAttribute('data-scentivity-random-v2-page') !== signature) return false;
    var cards = section.querySelectorAll('[data-scentivity-random-v2-card="true"]');
    return cards && cards.length > 0;
  }

  function productCard(item) {
    var p = item.product;
    var idx = item.index;
    var name = productName(p);
    var price = text(p && (p.price || p.amount || p.cost)) || 'Price on request';
    var status = statusOf(p);
    var image = productImage(p);
    var href = productUrl(p, idx);
    return [
      '<a class="related-product-card" data-scentivity-random-v2-card="true" data-product-key="' + esc(productKey(p, idx)) + '" href="' + esc(href) + '">',
      '  <img src="' + esc(image) + '" alt="' + esc(name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\';" />',
      '  <strong>' + esc(name) + '</strong>',
      '  <span>' + esc(price) + '</span>',
      status !== 'Available' ? '  <em class="product-status-pill">' + esc(status) + '</em>' : '',
      '</a>'
    ].join('\n');
  }

  function chooseProducts(products, signature) {
    if (chosenByPage[signature]) return chosenByPage[signature];
    var keys = currentKeys();
    var all = products.map(function (product, index) { return { product: product, index: index }; })
      .filter(function (item) { return showOnWebsite(item.product) && !isCurrentProduct(item.product, item.index, keys); });

    var available = all.filter(function (item) { return statusOf(item.product) === 'Available'; });
    var pool = available.length >= 4 ? available : available.concat(all.filter(function (item) {
      var key = productKey(item.product, item.index);
      return !available.some(function (a) { return productKey(a.product, a.index) === key; });
    }));

    // Deduplicate by product key/name so repeated admin copies do not dominate the random list.
    var seen = Object.create(null);
    pool = pool.filter(function (item) {
      var key = productKey(item.product, item.index) || slugify(productName(item.product));
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });

    chosenByPage[signature] = shuffle(pool).slice(0, 4);
    return chosenByPage[signature];
  }

  function render(products) {
    var section = findSection();
    if (!section) return false;
    var signature = pageSignature();
    if (alreadyRenderedByV2(section, signature)) return true;

    var chosen = chooseProducts(products, signature);
    if (!chosen.length) {
      section.innerHTML = '<h2>Other available products</h2><p class="cart-small-note">More products will be added soon.</p>';
    } else {
      section.innerHTML = '<h2>Other available products</h2><div class="related-products-grid">' + chosen.map(productCard).join('') + '</div>';
    }
    section.setAttribute('data-scentivity-random-v2-page', signature);
    section.setAttribute('data-scentivity-random-v2-run', RUN_ID);
    return true;
  }

  function run() {
    if (!document.getElementById('productPageContent')) return;
    renderCount += 1;
    loadProducts().then(render);
  }

  function schedule() {
    run();
    [150, 400, 900, 1600, 3000, 5000, 8000].forEach(function (ms) { setTimeout(run, ms); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      chosenByPage = Object.create(null);
      productsPromise = null;
    }
    setTimeout(schedule, 50);
  });

  // Product page scripts can inject or re-inject the fixed related cards after this file loads.
  // This observer replaces them again, but stops once the page has settled to keep mobile fast.
  var root = document.getElementById('productPageContent') || document.body;
  if (root && 'MutationObserver' in window) {
    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(run, 80);
    });
    observer.observe(root, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 30000);
  }
})();
