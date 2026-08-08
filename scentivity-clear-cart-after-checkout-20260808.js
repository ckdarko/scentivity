// SCENTIVITY_CLEAR_CART_AFTER_CHECKOUT_20260808
// Clears the saved cart after a completed Paystack checkout return or after a Pay on pickup WhatsApp order is submitted.
(function () {
  const CART_STORAGE_KEY = 'scentivityCartV1';
  const LAST_ORDER_KEY = 'scentivityLastOrder';
  const CLEAR_LOG_KEY = 'scentivityLastCartClear';
  const WHATSAPP_PAYMENT_METHODS = new Set(['pay_on_pickup', 'pay-on-pickup', 'pickup', 'cash_on_pickup']);

  function safeJsonParse(value, fallback) {
    try { return JSON.parse(value || ''); } catch (_) { return fallback; }
  }

  function readCart() {
    const cart = safeJsonParse(localStorage.getItem(CART_STORAGE_KEY), []);
    return Array.isArray(cart) ? cart : [];
  }

  function formatZeroCurrency() {
    return 'GH₵0';
  }

  function setPaymentStatus(message, type) {
    const target = document.querySelector('#paymentStatus, .payment-status');
    if (!target) return;
    target.textContent = message;
    target.className = `payment-status ${type || 'success'}`;
  }

  function updateCartBadges() {
    document.querySelectorAll('[data-cart-count], #cartCount, #cartCountFooter, #mobileCartCount, #productPageBottomCartCount, #cartCountMenu').forEach(target => {
      target.textContent = '0';
    });

    document.querySelectorAll('.has-items').forEach(target => {
      target.classList.remove('has-items');
    });
  }

  function updateCartDrawerEmptyState() {
    const cartItems = document.getElementById('cartItems');
    const cartEmptyMessage = document.getElementById('cartEmptyMessage');
    const cartTotal = document.getElementById('cartTotal');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutForm = document.getElementById('checkoutForm');

    if (cartItems) cartItems.innerHTML = '';
    if (cartEmptyMessage) cartEmptyMessage.classList.remove('hidden');
    if (cartTotal) cartTotal.textContent = formatZeroCurrency();
    if (cartSubtotal) cartSubtotal.textContent = formatZeroCurrency();
    if (checkoutForm) checkoutForm.classList.add('checkout-disabled');
  }

  function clearCart(reason) {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.setItem(CLEAR_LOG_KEY, JSON.stringify({
        reason: reason || 'checkout_complete',
        clearedAt: new Date().toISOString()
      }));
    } catch (_) {}

    updateCartBadges();
    updateCartDrawerEmptyState();

    try {
      window.dispatchEvent(new CustomEvent('scentivity:cart-cleared', {
        detail: { reason: reason || 'checkout_complete' }
      }));
    } catch (_) {}
  }

  function hasPaystackReturnReference() {
    const params = new URLSearchParams(window.location.search || '');
    return Boolean(params.get('reference') || params.get('trxref') || params.get('paystackReference'));
  }

  function clearAfterPaystackReturn() {
    if (!hasPaystackReturnReference()) return;
    const cart = readCart();
    const lastOrder = safeJsonParse(localStorage.getItem(LAST_ORDER_KEY), null);

    // Only clear when there is a saved Scentivity order/cart context.
    if (!cart.length && !lastOrder) return;

    clearCart('paystack_checkout_completed');
    try { localStorage.removeItem(LAST_ORDER_KEY); } catch (_) {}
  }

  function formIsReadyForWhatsAppOrder(form) {
    if (!form) return false;
    const formData = new FormData(form);
    const cart = readCart();
    const name = String(formData.get('customerName') || '').trim();
    const phone = String(formData.get('customerPhone') || '').trim();
    const fulfillment = String(formData.get('fulfillment') || 'delivery').toLowerCase();
    const deliveryAddress = String(formData.get('deliveryAddress') || '').trim();

    if (!cart.length) return false;
    if (!name || !phone) return false;
    if (fulfillment === 'delivery' && !deliveryAddress) return false;
    return true;
  }

  function setupWhatsAppOrderClear() {
    document.addEventListener('submit', function (event) {
      const form = event.target;
      if (!form || !(form instanceof HTMLFormElement) || form.id !== 'checkoutForm') return;

      const formData = new FormData(form);
      const paymentMethod = String(formData.get('paymentMethod') || '').toLowerCase();
      if (!WHATSAPP_PAYMENT_METHODS.has(paymentMethod)) return;

      // Let the existing checkout code open WhatsApp first, then clear the saved cart.
      window.setTimeout(function () {
        if (!formIsReadyForWhatsAppOrder(form)) return;

        clearCart('whatsapp_pay_on_pickup_order_submitted');
        setPaymentStatus('Your WhatsApp order has been opened and your cart has been cleared.', 'success');

        // The main cart array lives inside the original site script, so reload once after clearing storage.
        // This prevents old in-memory cart items from reappearing if the cart is opened again.
        window.setTimeout(function () {
          try {
            window.location.reload();
          } catch (_) {}
        }, 900);
      }, 250);
    });
  }

  function setupBackForwardCacheClear() {
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) return;
      if (hasPaystackReturnReference()) clearAfterPaystackReturn();
    });
  }

  clearAfterPaystackReturn();
  setupWhatsAppOrderClear();
  setupBackForwardCacheClear();

  window.ScentivityClearCartAfterCheckout = {
    clear: clearCart,
    hasPaystackReturnReference
  };
})();
