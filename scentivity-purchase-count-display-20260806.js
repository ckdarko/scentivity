// SCENTIVITY_PURCHASE_COUNT_DISPLAY_20260806
// Displays the live purchase/bought count for product cards and product detail pages.
// Safe: reads data/products.json only; does not edit products, data, or uploaded images.
(function () {
  const PRODUCTS_URL = 'data/products.json';
  const REFRESH_MS = 3 * 60 * 1000;
  let productIndex = null;
  let lastLoaded = 0;
  let loadPromise = null;

  function cleanText(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }

  function normalize(value) {
    return cleanText(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function slugify(value) {
    return cleanText(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function makeProductKey(product, index) {
    return slugify(`${product.name || 'product'}-${product.size || ''}-${product.price || ''}-${index}`) || `product-${index}`;
  }

  function purchaseCount(product) {
    const raw = product?.purchaseCount ?? product?.numberPurchased ?? product?.purchases ?? product?.soldCount ?? product?.boughtCount ?? 0;
    const number = Number(raw);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
  }

  function formatCount(value) {
    const number = Number(value || 0);
    if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
    return String(number);
  }

  function payloadProducts(data) {
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data)) return data;
    return [];
  }

  function keysFor(product, index) {
    const keys = [
      product?._key,
      product?.key,
      product?.id,
      product?.slug,
      makeProductKey(product || {}, index),
      product?.name,
      `${product?.name || ''} ${product?.size || ''}`
    ];
    return keys.filter(Boolean).map(normalize).filter(Boolean);
  }

  function buildIndex(productList) {
    const byKey = new Map();
    const products = Array.isArray(productList) ? productList : [];

    products.forEach((product, index) => {
      if (!product || typeof product !== 'object') return;
      const info = {
        product,
        count: purchaseCount(product),
        name: cleanText(product.name || ''),
        size: cleanText(product.size || ''),
        id: cleanText(product.id || ''),
        slug: cleanText(product.slug || ''),
        key: makeProductKey(product, index)
      };
      keysFor(product, index).forEach(key => byKey.set(key, info));
    });

    return { products, byKey };
  }

  function runtimeProducts() {
    try {
      if (Array.isArray(window.products)) return window.products;
    } catch (_) {}
    try {
      if (Array.isArray(products)) return products;
    } catch (_) {}
    return [];
  }

  async function loadProducts(force) {
    const now = Date.now();
    if (!force && productIndex && now - lastLoaded < REFRESH_MS) return productIndex;
    if (loadPromise && !force) return loadPromise;

    const localProducts = runtimeProducts();
    if (!force && localProducts.length) {
      productIndex = buildIndex(localProducts);
      lastLoaded = now;
      return productIndex;
    }

    loadPromise = fetch(`${PRODUCTS_URL}?v=purchase-count-${Date.now()}`, { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        productIndex = buildIndex(payloadProducts(data));
        lastLoaded = Date.now();
        return productIndex;
      })
      .catch(() => {
        productIndex = buildIndex(localProducts);
        lastLoaded = Date.now();
        return productIndex;
      })
      .finally(() => {
        loadPromise = null;
      });

    return loadPromise;
  }

  function possibleKeysFromCard(card) {
    const keys = [];
    const attrNames = ['productKey', 'productId', 'slug', 'id'];
    attrNames.forEach(name => {
      if (card.dataset?.[name]) keys.push(card.dataset[name]);
    });

    card.querySelectorAll('[data-product-key], [data-product-id], [data-slug], [data-id]').forEach(node => {
      if (node.dataset?.productKey) keys.push(node.dataset.productKey);
      if (node.dataset?.productId) keys.push(node.dataset.productId);
      if (node.dataset?.slug) keys.push(node.dataset.slug);
      if (node.dataset?.id) keys.push(node.dataset.id);
    });

    const title = card.querySelector('h1, h2, h3, .product-title, .product-name, [data-product-name]');
    if (title) keys.push(title.dataset?.productName || title.textContent);

    const image = card.querySelector('img[alt]');
    if (image?.alt) keys.push(image.alt);

    return keys.map(normalize).filter(Boolean);
  }

  function findInfo(index, card) {
    if (!index || !card) return null;
    const keys = possibleKeysFromCard(card);
    for (const key of keys) {
      if (index.byKey.has(key)) return index.byKey.get(key);
    }

    // Soft name match for dynamic cards that do not keep product keys in the DOM.
    const text = normalize(card.textContent || '');
    if (!text) return null;
    let best = null;
    for (const info of index.byKey.values()) {
      const name = normalize(info.name);
      if (name && text.includes(name)) {
        if (!best || name.length > normalize(best.name).length) best = info;
      }
    }
    return best;
  }

  function getMetaContainer(card) {
    return card.querySelector('.compact-product-meta, .showcase-quick-meta, .product-meta, .product-card-meta, .product-info, .showcase-copy, .product-page-meta, .product-detail-meta') || card;
  }

  function updateOrCreateCount(card, count) {
    if (!card) return;
    const textValue = `${formatCount(count)} bought`;
    const existing = Array.from(card.querySelectorAll('[data-purchase-count-display], span, em, small, p'))
      .find(node => /\bbought\b/i.test(node.textContent || ''));

    if (existing) {
      existing.textContent = textValue;
      existing.setAttribute('data-purchase-count-display', 'true');
      existing.setAttribute('aria-label', `${count} purchases`);
      return;
    }

    const container = getMetaContainer(card);
    const span = document.createElement(container.classList?.contains('product-page-content') ? 'p' : 'span');
    span.setAttribute('data-purchase-count-display', 'true');
    span.setAttribute('aria-label', `${count} purchases`);
    span.textContent = textValue;

    if (container !== card && container.children.length) {
      container.appendChild(span);
    } else {
      const title = card.querySelector('h1, h2, h3');
      if (title && title.parentNode) title.insertAdjacentElement('afterend', span);
      else card.appendChild(span);
    }
  }

  function productCardCandidates() {
    const selectors = [
      '.product-card',
      '.product-click-card',
      '.showcase-slide',
      '.catalogue-product-card',
      '.combo-card',
      '.related-product-card',
      '.other-product-card',
      '[data-product-key]',
      '[data-product-id]',
      '#productPageContent'
    ];
    const cards = Array.from(document.querySelectorAll(selectors.join(', ')));
    return Array.from(new Set(cards)).filter(card => {
      if (!card || card.matches?.('#productPageContent')) return !!card?.textContent?.trim();
      return card.querySelector('h1, h2, h3, img[alt], [data-product-key], [data-product-id]');
    });
  }

  async function refreshPurchaseCounts(force) {
    const index = await loadProducts(force);
    if (!index) return;

    productCardCandidates().forEach(card => {
      const info = findInfo(index, card);
      if (!info) return;
      updateOrCreateCount(card, info.count);
    });
  }

  function refreshSoon(force) {
    window.clearTimeout(refreshSoon.timer);
    refreshSoon.timer = window.setTimeout(() => refreshPurchaseCounts(force), 150);
  }

  document.addEventListener('DOMContentLoaded', () => {
    refreshSoon(false);
    setTimeout(() => refreshPurchaseCounts(false), 900);
    setTimeout(() => refreshPurchaseCounts(true), 2500);
  });

  window.addEventListener('load', () => refreshSoon(true));
  document.addEventListener('click', event => {
    if (event.target?.closest?.('#productLoadMoreButton, .product-load-more-button, [data-open-cart], .filter-controls button, .mobile-shop-bar button')) {
      setTimeout(() => refreshPurchaseCounts(false), 400);
      setTimeout(() => refreshPurchaseCounts(true), 1200);
    }
  });

  const observer = new MutationObserver(() => refreshSoon(false));
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.ScentivityPurchaseCountDisplay = {
    refresh: () => refreshPurchaseCounts(true)
  };
})();
