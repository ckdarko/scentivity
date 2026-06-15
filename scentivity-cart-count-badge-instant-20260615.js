// SCENTIVITY_INSTANT_CART_COUNT_BADGE_20260615
// Lightweight cart UI sync: instant visual feedback first, storage reconciliation after.
(function () {
  'use strict';

  const CART_KEYS = ['scentivityCartV1', 'scentivityCart', 'scentivity_cart', 'cart'];
  const COUNT_SELECTOR = [
    '[data-cart-count]',
    '#cartCount',
    '#cartCountFooter',
    '#mobileCartCount',
    '#cartCountMenu',
    '#productPageBottomCartCount'
  ].join(',');
  const CART_BUTTON_SELECTOR = [
    '#cartToggle',
    '#cartToggleFooter',
    '#mobileCartButton',
    '#productPageMenuCartButton',
    '#productPageBottomCartButton',
    '.cart-nav-button',
    '[data-open-cart]'
  ].join(',');
  const PRODUCT_CART_BUTTON_SELECTOR = [
    '.compact-cart-button[data-product-key]',
    '[data-product-key] .compact-cart-button',
    '.add-to-cart[data-product-key]',
    '[data-deal-product-key]'
  ].join(',');
  const ADD_SELECTOR = [
    '.add-to-cart[data-product-key]',
    '[data-deal-product-key]',
    '#productPageAddToCart',
    '.detail-add-to-cart',
    '.add-combo-to-cart[data-combo-key]',
    '[data-deal-combo-key]',
    '#addBuiltBundleToCart'
  ].join(',');
  const MUTATION_SELECTOR = [
    ADD_SELECTOR,
    '[data-cart-action]',
    '[data-cart-remove]',
    '[data-cart-decrease]',
    '[data-cart-increase]'
  ].join(',');

  let rafId = 0;
  let lastTotal = null;
  let localStoragePatched = false;

  function safeParse(value) {
    try { return JSON.parse(value); } catch { return null; }
  }

  function readCart() {
    for (const key of CART_KEYS) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const parsed = safeParse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  }

  function itemKey(item) {
    return String(item?.key || item?._key || item?.productKey || item?.id || item?.slug || item?.name || '').trim();
  }

  function itemQty(item) {
    const value = Number(item?.quantity ?? item?.qty ?? 1);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + itemQty(item), 0);
  }

  function getCurrentVisibleTotal() {
    let max = 0;
    document.querySelectorAll(COUNT_SELECTOR).forEach(node => {
      const value = Number(String(node.textContent || '').replace(/[^0-9.]/g, ''));
      if (Number.isFinite(value)) max = Math.max(max, value);
    });
    return max;
  }

  function productKeyFromButton(button) {
    return String(
      button?.dataset?.productKey ||
      button?.dataset?.dealProductKey ||
      button?.closest('[data-product-key]')?.dataset?.productKey ||
      ''
    ).trim();
  }

  function qtyForProduct(cart, key) {
    if (!key) return 0;
    return cart.reduce((sum, item) => sum + (itemKey(item) === key ? itemQty(item) : 0), 0);
  }

  function setCountNode(node, total) {
    if (!node) return;
    node.textContent = String(total);
    node.classList.toggle('is-empty', total <= 0);
    node.setAttribute('data-count', String(total));
  }

  function setCartTotal(total) {
    const qty = Math.max(0, Number(total || 0));
    lastTotal = qty;
    document.querySelectorAll(COUNT_SELECTOR).forEach(node => setCountNode(node, qty));
    document.querySelectorAll(CART_BUTTON_SELECTOR).forEach(button => {
      button.classList.toggle('has-items', qty > 0);
      button.classList.toggle('has-cart-items', qty > 0);
      button.setAttribute('data-cart-total', String(qty));
    });
  }

  function ensureProductBadge(button, qty) {
    if (!button) return;
    let badge = button.querySelector('[data-product-cart-badge]');
    if (qty > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.setAttribute('data-product-cart-badge', 'true');
        badge.className = 'scentivity-product-cart-badge compact-cart-count-badge';
        badge.setAttribute('aria-hidden', 'true');
        button.appendChild(badge);
      }
      badge.textContent = String(qty);
      badge.hidden = false;
      button.classList.add('has-product-in-cart', 'has-product-qty');
    } else {
      if (badge) badge.remove();
      button.classList.remove('has-product-in-cart', 'has-product-qty');
    }
  }

  function refreshProductBadges(cart) {
    document.querySelectorAll(PRODUCT_CART_BUTTON_SELECTOR).forEach(button => {
      const key = productKeyFromButton(button);
      ensureProductBadge(button, qtyForProduct(cart, key));
    });
  }

  function refreshFromStorage() {
    const cart = readCart();
    setCartTotal(cartTotal(cart));
    refreshProductBadges(cart);
  }

  function scheduleRefresh(delay = 0) {
    if (delay > 0) {
      window.setTimeout(refreshFromStorage, delay);
      return;
    }
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      refreshFromStorage();
    });
  }

  function optimisticAdd(button) {
    const key = productKeyFromButton(button);
    const current = Math.max(lastTotal ?? 0, getCurrentVisibleTotal(), cartTotal(readCart()));
    setCartTotal(current + 1);

    if (key) {
      document.querySelectorAll(PRODUCT_CART_BUTTON_SELECTOR).forEach(candidate => {
        if (productKeyFromButton(candidate) !== key) return;
        const existing = candidate.querySelector('[data-product-cart-badge]');
        const currentQty = Number(existing?.textContent || 0) || 0;
        ensureProductBadge(candidate, currentQty + 1);
      });
    }

    // Reconcile after the real add-to-cart code finishes saving to localStorage.
    scheduleRefresh(80);
    scheduleRefresh(250);
    scheduleRefresh(650);
  }

  function patchLocalStorage() {
    if (localStoragePatched || !window.localStorage) return;
    localStoragePatched = true;
    try {
      const storageProto = Object.getPrototypeOf(window.localStorage);
      if (!storageProto || storageProto.__scentivityCartPatched) return;

      const originalSetItem = storageProto.setItem;
      const originalRemoveItem = storageProto.removeItem;

      storageProto.setItem = function patchedSetItem(key, value) {
        const result = originalSetItem.call(this, key, value);
        if (CART_KEYS.includes(String(key))) scheduleRefresh();
        return result;
      };

      storageProto.removeItem = function patchedRemoveItem(key) {
        const result = originalRemoveItem.call(this, key);
        if (CART_KEYS.includes(String(key))) scheduleRefresh();
        return result;
      };

      Object.defineProperty(storageProto, '__scentivityCartPatched', { value: true, configurable: false });
    } catch {
      // Some browsers can block method patching. The click/pageshow refresh handlers still keep counts synced.
    }
  }

  function init() {
    patchLocalStorage();
    refreshFromStorage();
  }

  window.scentivityRefreshCartBadges = refreshFromStorage;
  window.scentivitySetCartCountInstantly = setCartTotal;

  document.addEventListener('click', event => {
    const addButton = event.target.closest(ADD_SELECTOR);
    if (addButton) {
      optimisticAdd(addButton);
      return;
    }
    if (event.target.closest(MUTATION_SELECTOR)) {
      scheduleRefresh(80);
      scheduleRefresh(250);
    }
  }, true);

  document.addEventListener('DOMContentLoaded', init, { once: true });
  window.addEventListener('pageshow', refreshFromStorage);
  window.addEventListener('storage', refreshFromStorage);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshFromStorage();
  });
})();
