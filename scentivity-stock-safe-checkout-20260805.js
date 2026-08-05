// SCENTIVITY_STOCK_SAFE_CHECKOUT_METADATA_20260805
// Adds stable product keys to Paystack order metadata so the stock webhook can safely reduce availableQuantity.
(function () {
  const CART_STORAGE_KEY = 'scentivityCartV1';
  const ONLINE_PAYMENT_METHODS = new Set(['card', 'momo', 'mobile_money']);

  function cleanText(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }

  function parseGHSPrice(value) {
    const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(item => item && item.name && Number(item.quantity || 0) > 0) : [];
    } catch (_) {
      return [];
    }
  }

  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.unitPrice || parseGHSPrice(item.priceText || item.price)) * Number(item.quantity || 1)), 0);
  }

  function setPaymentStatus(message, type) {
    const target = document.querySelector('#paymentStatus, .payment-status');
    if (!target) return;
    target.textContent = message;
    target.className = `payment-status ${type || 'info'}`;
  }

  function selectedValue(selector, fallback) {
    return document.querySelector(selector)?.value || fallback || '';
  }

  function checkedValue(selector, fallback) {
    return document.querySelector(selector + ':checked')?.value || fallback || '';
  }

  function buildStockSafeOrder(form) {
    const formData = new FormData(form);
    const cart = readCart();
    const fulfillmentValue = formData.get('fulfillment') || checkedValue('input[name="fulfillment"]', 'delivery');
    const paymentMethod = formData.get('paymentMethod') || selectedValue('[name="paymentMethod"]', 'card');
    const subtotalGHS = cartTotal(cart);

    return {
      customer: {
        name: cleanText(formData.get('customerName') || selectedValue('[name="customerName"]')),
        phone: cleanText(formData.get('customerPhone') || selectedValue('[name="customerPhone"]')),
        email: cleanText(formData.get('customerEmail') || selectedValue('[name="customerEmail"]'))
      },
      fulfillment: fulfillmentValue === 'pickup' ? 'Pickup' : 'Delivery',
      shippingCountry: fulfillmentValue === 'delivery' ? 'Ghana' : '',
      deliveryAddress: fulfillmentValue === 'delivery' ? cleanText(formData.get('deliveryAddress') || selectedValue('[name="deliveryAddress"]')) : '',
      pickupLocation: fulfillmentValue === 'pickup' ? cleanText(formData.get('pickupLocation') || selectedValue('[name="pickupLocation"]')) : '',
      deliveryFeeNote: 'Delivery fee applies to delivery orders and will be determined after checkout based on location.',
      paymentMethod,
      paymentMethodLabel: paymentMethod === 'momo' ? 'MoMo' : 'Card',
      notes: cleanText(formData.get('orderNotes') || selectedValue('[name="orderNotes"]')),
      items: cart.map(item => ({
        key: cleanText(item.key || item.id || item.slug || ''),
        id: cleanText(item.id || ''),
        slug: cleanText(item.slug || ''),
        name: cleanText(item.name),
        brand: cleanText(item.brand),
        size: cleanText(item.size),
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || parseGHSPrice(item.priceText || item.price)),
        priceText: cleanText(item.priceText || item.price),
        mainCategory: cleanText(item.mainCategory),
        subCategory: cleanText(item.subCategory),
        itemType: cleanText(item.itemType || 'product'),
        includedItems: cleanText(item.includedItems),
        originalPriceText: cleanText(item.originalPriceText),
        discountText: cleanText(item.discountText)
      })),
      subtotalGHS,
      totalGHS: subtotalGHS,
      currency: 'GHS'
    };
  }

  async function submitStockSafeCheckout(order) {
    const response = await fetch('/.netlify/functions/create-paystack-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.authorization_url) {
      throw new Error(result.error || 'Online payment is not ready yet. Please check Paystack setup or choose Pay on pickup.');
    }
    localStorage.setItem('scentivityLastOrder', JSON.stringify({ ...order, paystackReference: result.reference || '' }));
    window.location.href = result.authorization_url;
  }

  document.addEventListener('submit', async function (event) {
    const form = event.target;
    if (!form || !(form instanceof HTMLFormElement)) return;
    if (!(form.matches('#checkoutForm') || form.id === 'checkoutForm')) return;

    const paymentMethod = new FormData(form).get('paymentMethod') || selectedValue('[name="paymentMethod"]', 'card');
    if (!ONLINE_PAYMENT_METHODS.has(String(paymentMethod))) return;

    const order = buildStockSafeOrder(form);
    if (!order.items.length) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!order.customer.name || !order.customer.phone) {
      setPaymentStatus('Please enter your name and phone/WhatsApp number.', 'error');
      return;
    }
    if (order.fulfillment === 'Delivery' && !order.deliveryAddress) {
      setPaymentStatus('Please enter the delivery address.', 'error');
      return;
    }

    try {
      setPaymentStatus('Opening secure Paystack checkout...', 'info');
      await submitStockSafeCheckout(order);
    } catch (error) {
      setPaymentStatus(error.message || 'Checkout could not open.', 'error');
    }
  }, true);
})();
