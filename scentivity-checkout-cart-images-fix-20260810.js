/* Scentivity checkout cart image fix - 2026-08-10
   Keeps checkout/cart product images visible by loading the real product image immediately in the cart drawer.
   Safe: does not edit product data or uploaded image files. */
(() => {
  const CART_SELECTOR = '#cartItems';
  const FALLBACK_LOGO = 'assets/scentivity-logo-fused.png';
  const PRODUCT_DATA_URL = 'data/products.json';
  let productListPromise = null;
  let scheduled = false;

  const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();
  const normalizeName = (value = '') => clean(value)
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const looksLikeFallback = (value = '') => {
    const src = String(value || '');
    if (!src) return true;
    return src.includes('scentivity-logo-fused') ||
      src.includes('placeholder') ||
      src.startsWith('data:image/svg+xml') ||
      src.includes('Scentivity%3C') ||
      src.includes('Scentivity');
  };

  const normalizePath = (path = '') => {
    const value = clean(path);
    if (!value) return '';
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (value.startsWith('/')) return value;
    return value.replace(/^\.\//, '');
  };

  const extractProducts = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.products)) return payload.products;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const loadProducts = async () => {
    if (!productListPromise) {
      productListPromise = fetch(`${PRODUCT_DATA_URL}?v=${Date.now()}`, { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : null)
        .then((payload) => extractProducts(payload))
        .catch(() => []);
    }
    return productListPromise;
  };

  const findProductImageByName = async (name) => {
    const wanted = normalizeName(name);
    if (!wanted) return '';
    const products = await loadProducts();

    let match = products.find((product) => normalizeName(product?.name) === wanted);
    if (!match) {
      match = products.find((product) => {
        const productName = normalizeName(product?.name);
        return productName && (productName.includes(wanted) || wanted.includes(productName));
      });
    }

    return normalizePath(match?.image || match?.productImage || match?.photo || match?.thumbnail || '');
  };

  const setImage = (img, imagePath) => {
    const realSrc = normalizePath(imagePath);
    if (!img || !realSrc || looksLikeFallback(realSrc)) return false;

    if (img.src && img.getAttribute('src') === realSrc) return true;

    img.loading = 'eager';
    img.decoding = 'async';
    img.removeAttribute('data-src');
    img.dataset.scentivityCartImageFixed = 'true';
    img.classList.remove('scentivity-img-placeholder', 'scentivity-lazy-img-failed');
    img.classList.add('scentivity-cart-real-image');
    img.onerror = () => {
      img.onerror = null;
      img.src = FALLBACK_LOGO;
    };
    img.src = realSrc;
    return true;
  };

  const fixCartImagesNow = async () => {
    const cart = document.querySelector(CART_SELECTOR);
    if (!cart) return;

    const cards = [...cart.querySelectorAll('.cart-item, article, [class*="cart-item"]')];
    for (const card of cards) {
      const img = card.querySelector('img');
      if (!img) continue;

      const dataSrc = normalizePath(img.dataset?.src || img.getAttribute('data-src') || '');
      if (dataSrc && !looksLikeFallback(dataSrc)) {
        setImage(img, dataSrc);
        continue;
      }

      const currentSrc = img.getAttribute('src') || '';
      if (!looksLikeFallback(currentSrc) && !img.classList.contains('scentivity-lazy-img')) continue;

      const itemName = clean(card.querySelector('strong')?.textContent || card.getAttribute('aria-label') || '');
      const imageFromProducts = await findProductImageByName(itemName);
      if (imageFromProducts) setImage(img, imageFromProducts);
    }
  };

  const scheduleFix = () => {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(() => {
      scheduled = false;
      fixCartImagesNow();
    }, 40);
  };

  const start = () => {
    const cart = document.querySelector(CART_SELECTOR);
    if (cart) {
      new MutationObserver(scheduleFix).observe(cart, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'data-src', 'class']
      });
    }

    document.addEventListener('click', (event) => {
      if (event.target.closest('.add-to-cart, [data-open-cart], [data-cart-action], #cartToggle, #cartToggleFooter, #mobileCartButton, #scentivityFloatingCartButton')) {
        scheduleFix();
        window.setTimeout(scheduleFix, 250);
        window.setTimeout(scheduleFix, 800);
      }
    }, true);

    window.addEventListener('load', scheduleFix);
    document.addEventListener('visibilitychange', scheduleFix);
    scheduleFix();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
