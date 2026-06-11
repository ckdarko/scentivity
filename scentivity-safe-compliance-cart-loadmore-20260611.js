
(function scentivitySafeRecoveryPatch() {
  'use strict';

  const CART_KEY = 'scentivityCartV1';
  const PAGE_SIZE = 8;
  let displayLimit = PAGE_SIZE;
  let productGridObserver = null;
  let loadMoreButton = null;
  let loadMoreNote = null;
  let applyingProductLimit = false;

  function safeJson(value, fallback) {
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }

  function readCart() {
    const stored = window.localStorage ? window.localStorage.getItem(CART_KEY) : null;
    const items = safeJson(stored || '[]', []);
    return Array.isArray(items) ? items : [];
  }

  function totalCartQuantity() {
    return readCart().reduce((sum, item) => sum + Number(item && item.quantity || 0), 0);
  }

  function productQuantity(productKey) {
    if (!productKey) return 0;
    const found = readCart().find(item => String(item && item.key) === String(productKey));
    return found ? Number(found.quantity || 0) : 0;
  }

  function pulse(node) {
    if (!node) return;
    node.classList.remove('cart-count-pulse');
    void node.offsetWidth;
    node.classList.add('cart-count-pulse');
  }

  function updateGlobalCartCounts() {
    const count = totalCartQuantity();
    document.querySelectorAll('[data-cart-count], #cartCount, #cartCountFooter, #mobileCartCount').forEach(node => {
      if (!node) return;
      if (node.textContent !== String(count)) pulse(node);
      node.textContent = String(count);
      node.classList.toggle('is-empty', count <= 0);
      node.setAttribute('aria-label', `${count} item${count === 1 ? '' : 's'} in cart`);
    });
    document.querySelectorAll('#mobileCartButton, #cartToggle, #cartToggleFooter, .cart-nav-button, [data-open-cart]').forEach(button => {
      button.classList.toggle('has-items', count > 0);
    });
  }

  function ensureProductBadge(button) {
    if (!button || button.querySelector('.product-cart-count-badge, .compact-cart-count-badge')) return;
    const badge = document.createElement('span');
    badge.className = button.classList.contains('compact-cart-button') ? 'compact-cart-count-badge' : 'product-cart-count-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.hidden = true;
    badge.textContent = '0';
    button.appendChild(badge);
  }

  function updateProductBadges() {
    document.querySelectorAll('.add-to-cart[data-product-key], [data-deal-product-key]').forEach(button => {
      const key = button.dataset.productKey || button.dataset.dealProductKey;
      ensureProductBadge(button);
      const badge = button.querySelector('.product-cart-count-badge, .compact-cart-count-badge');
      const qty = productQuantity(key);
      if (badge) {
        badge.textContent = String(qty);
        badge.hidden = qty <= 0;
      }
      button.classList.toggle('has-product-in-cart', qty > 0);
    });
  }

  function refreshCartIndicators() {
    updateGlobalCartCounts();
    updateProductBadges();
  }

  function scheduleCartRefresh() {
    [0, 80, 180, 420, 900].forEach(delay => window.setTimeout(refreshCartIndicators, delay));
  }

  function ensureLoadMoreElements() {
    const grid = document.querySelector('#productGrid');
    if (!grid) return null;
    let wrap = document.querySelector('#productLoadMoreWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'productLoadMoreWrap';
      wrap.className = 'product-load-more-wrap';
      wrap.setAttribute('aria-live', 'polite');
      grid.insertAdjacentElement('afterend', wrap);
    }
    loadMoreButton = document.querySelector('#productLoadMoreButton');
    if (!loadMoreButton) {
      loadMoreButton = document.createElement('button');
      loadMoreButton.id = 'productLoadMoreButton';
      loadMoreButton.className = 'btn ghost product-load-more-button';
      loadMoreButton.type = 'button';
      loadMoreButton.textContent = 'LOAD MORE';
      wrap.appendChild(loadMoreButton);
    }
    loadMoreNote = document.querySelector('#productLoadMoreNote');
    if (!loadMoreNote) {
      loadMoreNote = document.createElement('p');
      loadMoreNote.id = 'productLoadMoreNote';
      loadMoreNote.className = 'product-load-more-note';
      wrap.appendChild(loadMoreNote);
    }
    if (!loadMoreButton.dataset.safePatchBound) {
      loadMoreButton.dataset.safePatchBound = 'true';
      loadMoreButton.addEventListener('click', () => {
        displayLimit += PAGE_SIZE;
        applyProductLimit();
      });
    }
    return grid;
  }

  function productCards(grid) {
    if (!grid) return [];
    return Array.from(grid.children).filter(child => child && child.matches && child.matches('article, .compact-product-card, .product-card, [data-product-key]'));
  }

  function applyProductLimit() {
    if (applyingProductLimit) return;
    applyingProductLimit = true;
    try {
      const grid = ensureLoadMoreElements();
      if (!grid) return;
      const cards = productCards(grid);
      const total = cards.length;
      if (!total) {
        if (loadMoreButton) loadMoreButton.hidden = true;
        if (loadMoreNote) loadMoreNote.textContent = '';
        return;
      }
      const shown = Math.min(displayLimit, total);
      cards.forEach((card, index) => {
        card.hidden = index >= shown;
        card.style.display = index >= shown ? 'none' : '';
      });
      const remaining = Math.max(0, total - shown);
      if (loadMoreButton) {
        loadMoreButton.hidden = remaining <= 0;
        loadMoreButton.disabled = remaining <= 0;
        loadMoreButton.textContent = remaining > 0 ? `LOAD MORE (${remaining} MORE)` : 'ALL PRODUCTS LOADED';
        loadMoreButton.setAttribute('aria-label', remaining > 0 ? `Load ${Math.min(PAGE_SIZE, remaining)} more products` : 'All products loaded');
      }
      if (loadMoreNote) {
        loadMoreNote.textContent = total > PAGE_SIZE ? `Showing ${shown} of ${total} matching products.` : '';
      }
    } finally {
      applyingProductLimit = false;
    }
  }

  function resetAndApplyProductLimit() {
    displayLimit = PAGE_SIZE;
    window.setTimeout(applyProductLimit, 80);
    window.setTimeout(applyProductLimit, 250);
  }

  function observeProductGrid() {
    const grid = ensureLoadMoreElements();
    if (!grid || productGridObserver) return;
    productGridObserver = new MutationObserver(() => {
      window.requestAnimationFrame(() => {
        applyProductLimit();
        updateProductBadges();
      });
    });
    productGridObserver.observe(grid, { childList: true });
  }

  function bindResetTriggers() {
    document.querySelector('#productSearch')?.addEventListener('input', resetAndApplyProductLimit, true);
    document.querySelector('#mainCategoryFilters')?.addEventListener('click', resetAndApplyProductLimit, true);
    document.querySelector('#subCategoryFilters')?.addEventListener('click', resetAndApplyProductLimit, true);
    document.querySelector('#catalogueMainFilters')?.addEventListener('click', resetAndApplyProductLimit, true);
    document.querySelector('#catalogueSubFilters')?.addEventListener('click', resetAndApplyProductLimit, true);
    document.addEventListener('click', event => {
      if (event.target.closest('[data-scroll-search], [data-main], [data-sub]')) resetAndApplyProductLimit();
    }, true);
  }

  function init() {
    observeProductGrid();
    bindResetTriggers();
    applyProductLimit();
    refreshCartIndicators();
    [250, 700, 1400, 2500].forEach(delay => window.setTimeout(() => {
      applyProductLimit();
      refreshCartIndicators();
    }, delay));
  }

  ['pointerdown', 'touchstart', 'mousedown'].forEach(eventName => {
    document.addEventListener(eventName, event => {
      if (event.target.closest('.add-to-cart[data-product-key], [data-deal-product-key], .add-combo-to-cart[data-combo-key], [data-deal-combo-key], [data-cart-action]')) {
        scheduleCartRefresh();
      }
    }, true);
  });

  window.addEventListener('storage', event => {
    if (event.key === CART_KEY) refreshCartIndicators();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  window.addEventListener('load', () => window.setTimeout(init, 250), { once: true });
})();
