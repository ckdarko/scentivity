// SCENTIVITY_STOCK_SAFE_CHECKOUT_METADATA_20260805
// Adds stable product keys to Paystack order metadata and checks current stock before online checkout.
(function () {
  const CART_STORAGE_KEY = 'scentivityCartV1';
  const ONLINE_PAYMENT_METHODS = new Set(['card', 'momo', 'mobile_money']);
  const PRODUCTS_URL = 'data/products.json';

  function cleanText(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }

  function normalizeCompare(value) {
    return cleanText(value).toLowerCase().replace(/\s+/g, ' ');
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

  function hasStockField(product) {
    return Object.prototype.hasOwnProperty.call(product, 'availableQuantity') ||
      Object.prototype.hasOwnProperty.call(product, 'stockQuantity') ||
      Object.prototype.hasOwnProperty.call(product, 'quantityAvailable') ||
      Object.prototype.hasOwnProperty.call(product, 'stock');
  }

  function getStockValue(product) {
    if (!product || !hasStockField(product)) return null;
    const raw = product.availableQuantity ?? product.stockQuantity ?? product.quantityAvailable ?? product.stock;
    if (raw === '' || raw === null || typeof raw === 'undefined') return null;
    const number = Number(raw);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
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

  function writeCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.filter(item => item && item.name && Number(item.quantity || 0) > 0)));
    } catch (_) {}
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

  function payloadProducts(data) {
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data)) return data;
    return [];
  }

  function productKeyList(product, index) {
    return [product._key, product.key, product.id, product.slug, makeProductKey(product, index)].filter(Boolean).map(normalizeCompare);
  }

  function nameSizeKey(name, size) {
    return `${normalizeCompare(name)}||${normalizeCompare(size)}`;
  }

  function buildStockIndex(products) {
    const byKey = new Map();
    const byNameSize = new Map();
    products.forEach((product, index) => {
      if (!product || typeof product !== 'object') return;
      const stock = getStockValue(product);
      const info = {
        stock,
        hasLimit: stock !== null,
        name: cleanText(product.name || 'this product'),
        size: cleanText(product.size || '')
      };
      productKeyList(product, index).forEach(key => byKey.set(key, info));
      byNameSize.set(nameSizeKey(product.name, product.size), info);
      byNameSize.set(nameSizeKey(product.name, ''), info);
    });
    return { byKey, byNameSize };
  }

  async function loadStockIndex() {
    try {
      const response = await fetch(`${PRODUCTS_URL}?v=checkout-stock-${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not read current product stock.');
      const data = await response.json();
      return buildStockIndex(payloadProducts(data));
    } catch (error) {
      console.warn('Stock check could not fetch products.json:', error.message);
      return null;
    }
  }

  function findStockInfo(index, item) {
    if (!index || !item) return null;
    const keys = [item.key, item.productKey, item.id, item.slug].filter(Boolean).map(normalizeCompare);
    for (const key of keys) {
      if (index.byKey.has(key)) return index.byKey.get(key);
    }
    return index.byNameSize.get(nameSizeKey(item.name, item.size)) || index.byNameSize.get(nameSizeKey(item.name, '')) || null;
  }

  async function validateCartStock(order) {
    const index = await loadStockIndex();
    if (!index) return true;

    const cart = readCart();
    let changed = false;
    const messages = [];
    const nextCart = [];

    for (const item of cart) {
      const itemType = normalizeCompare(item.itemType || 'product');
      if (itemType === 'combo' || itemType === 'bundle' || itemType === 'custom bundle') {
        nextCart.push(item);
        continue;
      }
      const info = findStockInfo(index, item);
      if (!info || !info.hasLimit) {
        nextCart.push(item);
        continue;
      }
      const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
      if (info.stock <= 0) {
        changed = true;
        messages.push(`${item.name} is now out of stock and was removed from cart.`);
        continue;
      }
      if (quantity > info.stock) {
        changed = true;
        nextCart.push({ ...item, quantity: info.stock, availableQuantity: info.stock });
        messages.push(`${item.name} has only ${info.stock} in stock. Quantity was reduced.`);
        continue;
      }
      nextCart.push(item);
    }

    if (changed) {
      writeCart(nextCart);
      setPaymentStatus(messages.join(' ') + ' Please review your cart and checkout again.', 'error');
      if (window.ScentivityStockLimit && typeof window.ScentivityStockLimit.clampCart === 'function') {
        window.ScentivityStockLimit.clampCart();
      }
      return false;
    }

    // Also check the order payload that will be sent to Paystack.
    for (const orderItem of order.items || []) {
      const itemType = normalizeCompare(orderItem.itemType || 'product');
      if (itemType === 'combo' || itemType === 'bundle' || itemType === 'custom bundle') continue;
      const info = findStockInfo(index, orderItem);
      if (!info || !info.hasLimit) continue;
      const quantity = Math.max(1, Math.floor(Number(orderItem.quantity || 1)));
      if (quantity > info.stock) {
        setPaymentStatus(`${orderItem.name} has only ${info.stock} in stock. Please reduce the quantity before checkout.`, 'error');
        return false;
      }
    }
    return true;
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

    const stockOk = await validateCartStock(order);
    if (!stockOk) return;

    try {
      setPaymentStatus('Opening secure Paystack checkout...', 'info');
      await submitStockSafeCheckout(order);
    } catch (error) {
      setPaymentStatus(error.message || 'Checkout could not open.', 'error');
    }
  }, true);
})();
