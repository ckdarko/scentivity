// SCENTIVITY_CART_COUNT_BADGE_LITE_20260615
(function () {
  const CART_KEYS = ['scentivityCart', 'scentivity_cart', 'cart'];
  const BUTTON_SELECTOR = '[data-product-key] .compact-cart-button, .compact-cart-button[data-product-key], .add-to-cart[data-product-key]';
  function readCart() {
    for (const key of CART_KEYS) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  }
  function itemKey(item) {
    return String(item?.key || item?._key || item?.productKey || item?.id || item?.name || '').trim();
  }
  function productKeyFromButton(button) {
    return String(button?.dataset?.productKey || button?.closest('[data-product-key]')?.dataset?.productKey || '').trim();
  }
  function qtyForProduct(cart, key) {
    if (!key) return 0;
    return cart.reduce((sum, item) => sum + (itemKey(item) === key ? Number(item.quantity || item.qty || 1) : 0), 0);
  }
  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0);
  }
  function setText(selector, text) {
    document.querySelectorAll(selector).forEach(el => { el.textContent = text; });
  }
  function refresh() {
    const cart = readCart();
    const total = cartTotal(cart);
    setText('[data-cart-count], #cartCount, #cartCountFooter, #mobileCartCount, #cartCountMenu, #productPageBottomCartCount', String(total));
    document.querySelectorAll('#cartToggle, #cartToggleFooter, #mobileCartButton, #productPageMenuCartButton, #productPageBottomCartButton, .cart-nav-button, [data-open-cart]').forEach(btn => {
      btn.classList.toggle('has-cart-items', total > 0);
      btn.setAttribute('data-cart-total', String(total));
    });
    document.querySelectorAll(BUTTON_SELECTOR).forEach(button => {
      const key = productKeyFromButton(button);
      const qty = qtyForProduct(cart, key);
      let badge = button.querySelector('[data-product-cart-badge]');
      if (qty > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.setAttribute('data-product-cart-badge', 'true');
          badge.className = 'product-cart-mini-badge';
          button.appendChild(badge);
        }
        badge.textContent = String(qty);
        button.classList.add('has-product-qty');
      } else {
        badge?.remove();
        button.classList.remove('has-product-qty');
      }
    });
  }
  let timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(refresh, 40);
  }
  window.scentivityRefreshCartBadges = refresh;
  document.addEventListener('DOMContentLoaded', refresh);
  window.addEventListener('storage', refresh);
  document.addEventListener('click', event => {
    if (event.target.closest('.add-to-cart, [data-deal-product-key], [data-deal-combo-key], .add-combo-to-cart, [data-cart-remove], [data-cart-decrease], [data-cart-increase]')) {
      schedule(); setTimeout(refresh, 180); setTimeout(refresh, 500);
    }
  }, true);
})();
