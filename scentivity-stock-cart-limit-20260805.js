// SCENTIVITY_STOCK_CART_LIMIT_20260805_V2
// Strongly prevents buyers from raising checkout/cart quantities above available stock.
// Safe: reads data/products.json and local cart only; does not overwrite products or uploaded images.
(function () {
  const CART_STORAGE_KEY = 'scentivityCartV1';
  const PRODUCTS_URL = 'data/products.json';
  const STOCK_CACHE_MS = 45 * 1000;

  let stockCache = null;
  let stockCacheTime = 0;
  let stockLoadPromise = null;

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

  function isComboLike(item) {
    const type = normalizeCompare(item?.itemType || 'product');
    return type === 'combo' || type === 'bundle' || type === 'custom bundle';
  }

  function getRuntimeProducts() {
    try {
      if (Array.isArray(products)) return products;
    } catch (_) {}
    return [];
  }

  function getRuntimeCart() {
    try {
      if (Array.isArray(cart)) return cart;
    } catch (_) {}
    return null;
  }

  function readStoredCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(item => item && item.name && Number(item.quantity || 0) > 0) : [];
    } catch (_) {
      return [];
    }
  }

  function readCart() {
    return getRuntimeCart() || readStoredCart();
  }

  function writeCart(nextCart) {
    const cleanedCart = Array.isArray(nextCart) ? nextCart.filter(item => item && item.name && Number(item.quantity || 0) > 0) : [];

    try {
      const runtimeCart = getRuntimeCart();
      if (runtimeCart) {
        runtimeCart.length = 0;
        cleanedCart.forEach(item => runtimeCart.push(item));
        if (typeof saveCart === 'function') saveCart();
        if (typeof renderCart === 'function') renderCart();
        if (typeof updateCartCount === 'function') updateCartCount();
        initStockUiSoon();
        return;
      }
    } catch (_) {}

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cleanedCart));
    } catch (_) {}
    updateVisibleCartCount(cleanedCart);
    initStockUiSoon();
  }

  function updateVisibleCartCount(cartItems) {
    const total = (cartItems || readCart()).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    document.querySelectorAll('[data-cart-count], #cartCount, #cartCountFooter, #mobileCartCount').forEach(target => {
      target.textContent = String(total);
    });
  }

  function productKeys(product, index) {
    return [
      product._key,
      product.key,
      product.id,
      product.slug,
      makeProductKey(product, index)
    ].filter(Boolean).map(normalizeCompare);
  }

  function nameSizeKey(name, size) {
    return `${normalizeCompare(name)}||${normalizeCompare(size)}`;
  }

  function buildStockIndex(productList) {
    const byKey = new Map();
    const byNameSize = new Map();

    (Array.isArray(productList) ? productList : []).forEach((product, index) => {
      if (!product || typeof product !== 'object') return;
      const stock = getStockValue(product);
      const stockInfo = {
        stock,
        hasLimit: stock !== null,
        name: cleanText(product.name || 'this product'),
        size: cleanText(product.size || ''),
        status: cleanText(product.productStatus || ''),
        available: product.available !== false && product.showOnWebsite !== false
      };

      productKeys(product, index).forEach(key => {
        if (key) byKey.set(key, stockInfo);
      });
      byNameSize.set(nameSizeKey(product.name, product.size), stockInfo);
      byNameSize.set(nameSizeKey(product.name, ''), stockInfo);
    });

    return { byKey, byNameSize };
  }

  function payloadProducts(data) {
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data)) return data;
    return [];
  }

  async function loadStockIndex(forceFresh) {
    const now = Date.now();
    if (!forceFresh && stockCache && now - stockCacheTime < STOCK_CACHE_MS) return stockCache;

    const runtimeProducts = getRuntimeProducts();
    if (!forceFresh && runtimeProducts.length) {
      stockCache = buildStockIndex(runtimeProducts);
      stockCacheTime = now;
      return stockCache;
    }

    if (stockLoadPromise && !forceFresh) return stockLoadPromise;

    stockLoadPromise = fetch(`${PRODUCTS_URL}?v=stock-limit-${forceFresh ? Date.now() : 'cached'}`, {
      cache: forceFresh ? 'no-store' : 'default'
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        stockCache = buildStockIndex(payloadProducts(data));
        stockCacheTime = Date.now();
        return stockCache;
      })
      .catch(() => {
        stockCache = buildStockIndex(runtimeProducts);
        stockCacheTime = Date.now();
        return stockCache;
      })
      .finally(() => {
        stockLoadPromise = null;
      });

    return stockLoadPromise;
  }

  function stockFromSnapshot(item) {
    const value = item?.availableQuantity ?? item?.stockQuantity ?? item?.quantityAvailable ?? item?.stock;
    if (value === '' || value === null || typeof value === 'undefined') return null;
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
  }

  function findStockInfoFromIndex(index, item) {
    if (!index || !item) return null;
    const possibleKeys = [item.key, item.productKey, item.id, item.slug].filter(Boolean).map(normalizeCompare);
    for (const key of possibleKeys) {
      if (index.byKey.has(key)) return index.byKey.get(key);
    }
    const exactNameSize = index.byNameSize.get(nameSizeKey(item.name, item.size));
    if (exactNameSize) return exactNameSize;
    const nameOnly = index.byNameSize.get(nameSizeKey(item.name, ''));
    if (nameOnly) return nameOnly;
    return null;
  }

  function getStockInfo(index, item) {
    const matched = findStockInfoFromIndex(index, item);
    if (matched) return matched;
    const snapshotStock = stockFromSnapshot(item);
    if (snapshotStock !== null) {
      return { stock: snapshotStock, hasLimit: true, name: cleanText(item?.name || 'this product'), size: cleanText(item?.size || '') };
    }
    return null;
  }

  function setPaymentStatus(message, type) {
    const status = document.querySelector('#paymentStatus, .payment-status');
    if (status) {
      status.textContent = message;
      status.className = `payment-status ${type || 'error'}`;
    }
  }

  function showStockMessage(message) {
    setPaymentStatus(message, 'error');
    window.clearTimeout(showStockMessage.timer);
    showStockMessage.timer = window.setTimeout(() => {
      const status = document.querySelector('#paymentStatus, .payment-status');
      if (status && status.textContent === message) status.textContent = '';
    }, 7000);
    if (window.ScentivityStockLimit?.silentAlerts !== true) alert(message);
  }

  function openCartIfPossible() {
    try {
      if (typeof openCart === 'function') openCart();
    } catch (_) {}
    document.getElementById('cartOverlay')?.classList.add('visible');
    document.getElementById('cartOverlay')?.setAttribute('aria-hidden', 'false');
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'false');
  }

  function disableLimitedPlusButtons(index) {
    const currentCart = readCart();
    document.querySelectorAll('[data-cart-action="increase"][data-cart-key]').forEach(button => {
      const key = button.getAttribute('data-cart-key');
      const item = currentCart.find(entry => entry.key === key);
      const info = getStockInfo(index || stockCache, item);
      if (!item || !info || !info.hasLimit) {
        button.disabled = false;
        button.removeAttribute('aria-disabled');
        button.removeAttribute('title');
        return;
      }
      const stock = Number(info.stock || 0);
      const reached = stock <= 0 || Number(item.quantity || 0) >= stock;
      button.disabled = reached;
      button.setAttribute('aria-disabled', reached ? 'true' : 'false');
      button.title = reached ? `Only ${stock} in stock` : `Increase quantity. ${stock} in stock.`;
    });
  }

  function addStockLabels(index) {
    const currentCart = readCart();
    document.querySelectorAll('[data-cart-action="increase"][data-cart-key]').forEach(button => {
      const key = button.getAttribute('data-cart-key');
      const item = currentCart.find(entry => entry.key === key);
      const info = getStockInfo(index || stockCache, item);
      const qtyWrap = button.closest('.cart-qty');
      if (!qtyWrap || !item || !info || !info.hasLimit) return;
      const itemArticle = button.closest('.cart-item') || qtyWrap.parentElement;
      if (!itemArticle || itemArticle.querySelector('.scentivity-stock-limit-note')) return;
      const note = document.createElement('small');
      note.className = 'scentivity-stock-limit-note';
      note.style.display = 'block';
      note.style.marginTop = '0.35rem';
      note.style.fontWeight = '700';
      note.style.color = '#8a0040';
      note.textContent = `${info.stock} available in stock`;
      qtyWrap.insertAdjacentElement('afterend', note);
    });
  }

  function initStockUiSoon() {
    window.clearTimeout(initStockUiSoon.timer);
    initStockUiSoon.timer = window.setTimeout(() => {
      loadStockIndex(false).then(index => {
        disableLimitedPlusButtons(index);
        addStockLabels(index);
      });
    }, 60);
  }

  async function clampCartToCurrentStock(forceFresh) {
    const index = await loadStockIndex(forceFresh);
    const currentCart = readCart();
    let changed = false;
    const nextCart = [];
    const changedMessages = [];

    for (const item of currentCart) {
      if (isComboLike(item)) {
        nextCart.push(item);
        continue;
      }

      const info = getStockInfo(index, item);
      if (!info || !info.hasLimit) {
        nextCart.push(item);
        continue;
      }

      const stock = Number(info.stock || 0);
      const currentQty = Math.max(1, Math.floor(Number(item.quantity || 1)));
      if (stock <= 0) {
        changed = true;
        changedMessages.push(`${item.name} is now out of stock and was removed from cart.`);
        continue;
      }
      if (currentQty > stock) {
        changed = true;
        nextCart.push({ ...item, quantity: stock, availableQuantity: stock });
        changedMessages.push(`${item.name} was reduced to ${stock}, the current stock limit.`);
        continue;
      }
      nextCart.push(item);
    }

    if (changed) {
      writeCart(nextCart);
      updateVisibleCartCount(nextCart);
      if (changedMessages.length) setPaymentStatus(changedMessages.join(' '), 'error');
    }

    disableLimitedPlusButtons(index);
    addStockLabels(index);
    return { ok: !changed, messages: changedMessages };
  }

  async function handleCheckoutIncrease(button, event) {
    const key = button.getAttribute('data-cart-key');
    if (!key) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const index = await loadStockIndex(false);
    const currentCart = readCart();
    const item = currentCart.find(entry => entry.key === key);
    if (!item) return;

    // Combos/bundles do not use single-product stock limits here.
    if (isComboLike(item)) {
      const nextCart = currentCart.map(entry => entry.key === key ? { ...entry, quantity: Number(entry.quantity || 1) + 1 } : entry);
      writeCart(nextCart);
      return;
    }

    const info = getStockInfo(index, item);
    const currentQty = Math.max(1, Math.floor(Number(item.quantity || 1)));

    if (!info || !info.hasLimit) {
      const nextCart = currentCart.map(entry => entry.key === key ? { ...entry, quantity: currentQty + 1 } : entry);
      writeCart(nextCart);
      return;
    }

    const stock = Number(info.stock || 0);
    if (stock <= 0) {
      const nextCart = currentCart.filter(entry => entry.key !== key);
      writeCart(nextCart);
      showStockMessage(`${item.name} is now out of stock and was removed from cart.`);
      return;
    }

    if (currentQty >= stock) {
      showStockMessage(`Only ${stock} of ${item.name} is currently in stock. The checkout quantity cannot go above ${stock}.`);
      disableLimitedPlusButtons(index);
      addStockLabels(index);
      return;
    }

    const nextQty = Math.min(stock, currentQty + 1);
    const nextCart = currentCart.map(entry => entry.key === key ? { ...entry, quantity: nextQty, availableQuantity: stock } : entry);
    writeCart(nextCart);
    disableLimitedPlusButtons(index);
    addStockLabels(index);
  }

  async function validateCartBeforeCheckout() {
    const result = await clampCartToCurrentStock(true);
    if (!result.ok) {
      openCartIfPossible();
      showStockMessage(result.messages.join('\n') || 'Some cart quantities were above the current stock limit. Please review the checkout window and checkout again.');
      return false;
    }
    return true;
  }

  // Strong checkout-window guard: all cart plus clicks are handled here before the original site script can increase quantity.
  document.addEventListener('click', event => {
    const increaseButton = event.target.closest('[data-cart-action="increase"][data-cart-key]');
    if (!increaseButton) return;
    handleCheckoutIncrease(increaseButton, event);
  }, true);

  // Clamp whenever cart drawer is opened or any cart/product button is used.
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-cart], #cartToggle, #cartToggleFooter, #mobileCartButton, .add-to-cart, .detail-add-to-cart')) {
      window.setTimeout(() => clampCartToCurrentStock(false), 120);
      window.setTimeout(() => clampCartToCurrentStock(false), 500);
    }
  });

  // Final guard before checkout submission: even if the HTML is edited manually, checkout is stopped and corrected.
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form || !(form instanceof HTMLFormElement) || form.id !== 'checkoutForm') return;
    if (form.dataset.scentivityStockLimitChecked === 'true') {
      delete form.dataset.scentivityStockLimitChecked;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    validateCartBeforeCheckout().then(ok => {
      if (!ok) return;
      form.dataset.scentivityStockLimitChecked = 'true';
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    loadStockIndex(false).then(index => {
      disableLimitedPlusButtons(index);
      addStockLabels(index);
      clampCartToCurrentStock(false);
    });

    const cartItems = document.getElementById('cartItems');
    if (cartItems && 'MutationObserver' in window) {
      const observer = new MutationObserver(() => initStockUiSoon());
      observer.observe(cartItems, { childList: true, subtree: true });
    }
  });

  window.ScentivityStockLimit = {
    refresh: () => loadStockIndex(true),
    clampCart: () => clampCartToCurrentStock(true),
    validateCart: validateCartBeforeCheckout,
    silentAlerts: false
  };
})();
