/* Scentivity cart count + product-card badge live sync fix.
   Safe add-on: does not change products, images, videos, admin data, or checkout logic. */
(function scentivityCartCountBadgeFix() {
  const CART_STORAGE_KEY = 'scentivityCartV1';
  const PRODUCT_BUTTON_SELECTOR = '.compact-cart-button.add-to-cart[data-product-key], button.add-to-cart.compact-cart-button[data-product-key]';
  const CART_ACTION_SELECTOR = [
    '.add-to-cart[data-product-key]',
    '.detail-add-to-cart[data-product-key]',
    '#productPageAddToCart',
    '[data-deal-product-key]',
    '.add-combo-to-cart[data-combo-key]',
    '[data-deal-combo-key]',
    '[data-cart-action]'
  ].join(',');

  let observerStarted = false;
  let refreshTimer = null;

  function readCart() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function totalCartQuantity(cart) {
    return cart.reduce((sum, item) => sum + Math.max(0, Number(item && item.quantity ? item.quantity : 0)), 0);
  }

  function productQuantity(cart, productKey) {
    if (!productKey) return 0;
    return cart.reduce((sum, item) => {
      if (!item) return sum;
      const itemKey = String(item.key || item.productKey || item.id || '');
      return itemKey === String(productKey) ? sum + Math.max(0, Number(item.quantity || 0)) : sum;
    }, 0);
  }

  function decorateProductCartButtons(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(PRODUCT_BUTTON_SELECTOR).forEach(button => {
      const key = button.dataset.productKey;
      if (!key) return;
      button.classList.add('scentivity-cart-badge-button');
      button.style.position = button.style.position || 'relative';
      button.style.overflow = 'visible';

      let badge = button.querySelector('[data-product-cart-badge]');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'compact-cart-count-badge scentivity-product-cart-badge';
        badge.setAttribute('data-product-cart-badge', key);
        badge.setAttribute('aria-label', 'Quantity of this product in cart');
        badge.hidden = true;
        badge.textContent = '0';
        button.appendChild(badge);
      } else {
        badge.setAttribute('data-product-cart-badge', key);
      }
    });
  }

  function updateCartButtons(count) {
    const countText = String(count);
    const selector = [
      '[data-cart-count]',
      '#cartCount',
      '#cartCountFooter',
      '#mobileCartCount',
      '#cartCountMenu',
      '#productPageBottomCartCount'
    ].join(',');

    document.querySelectorAll(selector).forEach(node => {
      node.textContent = countText;
      node.classList.toggle('is-empty', count <= 0);
      node.setAttribute('aria-label', `${countText} item${count === 1 ? '' : 's'} in cart`);
    });

    document.querySelectorAll('#cartToggle, #cartToggleFooter, #mobileCartButton, #productPageMenuCartButton, #productPageBottomCartButton, .cart-nav-button, [data-open-cart]').forEach(button => {
      button.classList.toggle('has-items', count > 0);
      button.classList.add('cart-count-ready');
    });
  }

  function updateProductCartBadges(cart) {
    decorateProductCartButtons(document);
    document.querySelectorAll('[data-product-cart-badge]').forEach(badge => {
      const key = badge.getAttribute('data-product-cart-badge');
      const quantity = productQuantity(cart, key);
      badge.textContent = String(quantity);
      badge.hidden = quantity <= 0;
      badge.classList.toggle('is-visible', quantity > 0);
      const button = badge.closest('button, a, .compact-cart-button');
      if (button) button.classList.toggle('has-product-in-cart', quantity > 0);
    });
  }

  function refreshCartIndicators() {
    const cart = readCart();
    const count = totalCartQuantity(cart);
    updateCartButtons(count);
    updateProductCartBadges(cart);
  }

  function refreshSoon() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshCartIndicators, 0);
    [60, 160, 360, 750].forEach(delay => window.setTimeout(refreshCartIndicators, delay));
  }

  function startObserver() {
    if (observerStarted || !document.body || typeof MutationObserver === 'undefined') return;
    observerStarted = true;
    const observer = new MutationObserver(mutations => {
      let shouldRefresh = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length) {
          shouldRefresh = true;
          break;
        }
      }
      if (shouldRefresh) refreshSoon();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Patch localStorage writes so cart indicators update immediately after add/remove actions.
  try {
    const originalSetItem = Storage.prototype.setItem;
    if (!window.__scentivityCartBadgeStoragePatched) {
      window.__scentivityCartBadgeStoragePatched = true;
      Storage.prototype.setItem = function patchedSetItem(key, value) {
        const result = originalSetItem.apply(this, arguments);
        if (key === CART_STORAGE_KEY) refreshSoon();
        return result;
      };
    }
  } catch (error) {
    // Some browsers may block patching Storage. Event listeners below still handle updates.
  }

  ['click', 'pointerup', 'touchend'].forEach(eventName => {
    document.addEventListener(eventName, event => {
      if (event.target && event.target.closest && event.target.closest(CART_ACTION_SELECTOR)) {
        refreshSoon();
      }
    }, true);
  });

  window.addEventListener('storage', event => {
    if (event.key === CART_STORAGE_KEY) refreshSoon();
  });

  document.addEventListener('DOMContentLoaded', () => {
    decorateProductCartButtons(document);
    startObserver();
    refreshCartIndicators();
  });

  window.addEventListener('load', () => {
    startObserver();
    refreshCartIndicators();
  });

  // Also run immediately in case this file loads after DOMContentLoaded.
  if (document.readyState !== 'loading') {
    decorateProductCartButtons(document);
    startObserver();
    refreshCartIndicators();
  }

  window.scentivityRefreshCartIndicators = refreshCartIndicators;
})();
