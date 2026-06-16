/* Scentivity feedback product selector V2
   Fixes empty dropdown on click by opening immediately, then loading site products.
   Uses data/products.json when available and falls back to products already rendered on the page.
*/
(() => {
  'use strict';

  const SCRIPT_ID = 'scentivity-feedback-products-site-only-v2';
  if (window.__scentivityFeedbackProductsV2Installed) return;
  window.__scentivityFeedbackProductsV2Installed = true;

  const PRODUCT_DATA_PATHS = [
    'data/products.json',
    './data/products.json',
    '/data/products.json',
    'products.json',
    './products.json',
    '/products.json'
  ];

  let productCache = null;
  let loadPromise = null;
  let lastOpenState = false;
  let renderLock = false;

  const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
  const lower = (value) => clean(value).toLowerCase();
  const isFalseLike = (value) => value === false || /^(false|no|off|0|hidden)$/i.test(clean(value));
  const isComboLike = (item) => /combo|bundle/i.test(clean(item?.type || item?.kind || item?.itemType || item?.mainCategory || item?.category || ''));

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return clean(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function installStyle() {
    if (document.getElementById(`${SCRIPT_ID}-style`)) return;
    const style = document.createElement('style');
    style.id = `${SCRIPT_ID}-style`;
    style.textContent = `
      #feedbackProductChoices.feedback-product-choices.open,
      #feedbackProductChoices[data-scentivity-open="true"] {
        display: grid !important;
        gap: 0.55rem !important;
        max-height: min(46vh, 360px);
        overflow: auto;
        padding: 0.75rem;
        margin-top: 0.65rem;
        border: 1px solid rgba(224, 0, 91, 0.14);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.94);
      }
      #feedbackProductChoices.feedback-product-choices[hidden]:not([data-scentivity-open="true"]) {
        display: none !important;
      }
      .feedback-product-option-site-only {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        padding: 0.55rem 0.65rem;
        border-radius: 12px;
        background: #fff7fb;
        border: 1px solid rgba(224, 0, 91, 0.08);
        cursor: pointer;
        line-height: 1.3;
      }
      .feedback-product-option-site-only input {
        margin-top: 0.15rem;
        flex: 0 0 auto;
      }
      .feedback-product-option-site-only strong {
        display: block;
        color: #3d1025;
        font-size: 0.92rem;
      }
      .feedback-product-option-site-only small {
        display: block;
        color: #8a4c67;
        font-size: 0.78rem;
        margin-top: 0.15rem;
      }
      .feedback-product-loading,
      .feedback-product-empty,
      .feedback-product-error {
        margin: 0;
        padding: 0.75rem;
        border-radius: 12px;
        background: #fff7fb;
        color: #7b3150;
        font-size: 0.9rem;
      }
    `;
    document.head.appendChild(style);
  }

  function getEls() {
    return {
      form: $('#customerFeedbackForm'),
      field: $('.feedback-products-field'),
      toggle: $('#toggleFeedbackProducts'),
      count: $('#feedbackProductCount'),
      choices: $('#feedbackProductChoices'),
      hidden: $('#feedbackProductsPurchased'),
      modal: $('#feedbackModal')
    };
  }

  function removeOtherProductField() {
    // Remove older optional field if it still exists in a previously deployed HTML version.
    $all('.feedback-other-product').forEach((el) => el.remove());
    $all('input[name="productsPurchasedOther"], textarea[name="productsPurchasedOther"]').forEach((input) => {
      const label = input.closest('label');
      (label || input).remove();
    });
    $all('label').forEach((label) => {
      if (/other product\s*\/\s*combo not listed/i.test(label.textContent || '')) label.remove();
    });
  }

  function setOpen(isOpen) {
    const { choices, toggle } = getEls();
    if (!choices || !toggle) return;
    lastOpenState = Boolean(isOpen);
    if (lastOpenState) {
      choices.hidden = false;
      choices.removeAttribute('hidden');
      choices.classList.add('open');
      choices.setAttribute('data-scentivity-open', 'true');
    } else {
      choices.classList.remove('open');
      choices.removeAttribute('data-scentivity-open');
      choices.hidden = true;
      choices.setAttribute('hidden', '');
    }
    toggle.setAttribute('aria-expanded', String(lastOpenState));
  }

  function setMessage(message, type = 'loading') {
    const { choices } = getEls();
    if (!choices) return;
    const className = type === 'error' ? 'feedback-product-error' : type === 'empty' ? 'feedback-product-empty' : 'feedback-product-loading';
    choices.innerHTML = `<p class="${className}">${escapeHTML(message)}</p>`;
  }

  function shouldIncludeProduct(product) {
    if (!product || typeof product !== 'object') return false;
    if (!clean(product.name || product.title)) return false;
    if (isComboLike(product)) return false;
    // Include Available, Incoming, and Out of Stock. Only exclude items explicitly hidden from the website.
    if (isFalseLike(product.showOnWebsite) || isFalseLike(product.visible) || product.hidden === true || product.isHidden === true) return false;
    return true;
  }

  function normalizeProduct(product) {
    const name = clean(product.name || product.title);
    const brand = clean(product.brand || product.vendor || '');
    const size = clean(product.size || product.volume || '');
    const status = clean(product.productStatus || product.status || '');
    const category = clean(product.mainCategory || product.category || '');
    const id = clean(product.id || product.slug || name);
    const meta = [brand, size, status].filter(Boolean).join(' • ');
    return { id, name, meta, category };
  }

  function uniqueProducts(products) {
    const out = [];
    const seen = new Set();
    products.filter(shouldIncludeProduct).forEach((product) => {
      const item = normalizeProduct(product);
      const key = lower(item.id || item.name);
      if (!item.name || seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  function extractProductsFromData(data) {
    if (Array.isArray(data)) return uniqueProducts(data);
    if (!data || typeof data !== 'object') return [];
    const possibleArrays = [
      data.products,
      data.items,
      data.productItems,
      data.storeProducts,
      data.catalogueProducts,
      data.catalogProducts
    ];
    for (const list of possibleArrays) {
      if (Array.isArray(list) && list.length) return uniqueProducts(list);
    }
    return [];
  }

  async function fetchProductsFromJson() {
    for (const path of PRODUCT_DATA_PATHS) {
      try {
        const response = await fetch(path, { cache: 'default' });
        if (!response.ok) continue;
        const data = await response.json();
        const products = extractProductsFromData(data);
        if (products.length) return products;
      } catch (error) {
        // Try the next path.
      }
    }

    // If a cache or deploy issue returns an empty list, try one fresh request to the main data file.
    try {
      const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const products = extractProductsFromData(await response.json());
        if (products.length) return products;
      }
    } catch (error) {
      // Fall back to the rendered page below.
    }

    return [];
  }

  function productsFromRenderedPage() {
    const candidates = [];
    const selectors = [
      '#productGrid article',
      '#productGrid .product-card',
      '.product-card',
      '.product-click-card',
      '.showcase-slide',
      '[data-product-key]'
    ];

    selectors.forEach((selector) => {
      $all(selector).forEach((card) => {
        const heading = card.querySelector('h2, h3, .product-card-title, .product-title');
        const name = clean(card.getAttribute('aria-label') || heading?.textContent || '');
        const cleanedName = name.replace(/^View details for\s+/i, '');
        if (!cleanedName || /combo|bundle/i.test(cleanedName)) return;
        candidates.push({
          id: clean(card.dataset.productKey || card.dataset.slug || cleanedName),
          name: cleanedName,
          brand: clean(card.querySelector('.product-brand, .eyebrow')?.textContent || ''),
          productStatus: clean(card.querySelector('.showcase-badge, .status-badge')?.textContent || '')
        });
      });
    });

    return uniqueProducts(candidates);
  }

  async function loadProducts() {
    if (productCache) return productCache;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      let products = await fetchProductsFromJson();
      if (!products.length) products = productsFromRenderedPage();
      productCache = products;
      return productCache;
    })();
    return loadPromise;
  }

  function selectedValues() {
    return $all('input[name="feedbackProductChoice"]:checked')
      .map((input) => clean(input.value))
      .filter(Boolean);
  }

  function updateSelectedValues() {
    const { count, hidden } = getEls();
    const selected = selectedValues();
    if (hidden) hidden.value = selected.join('; ');
    if (count) count.textContent = selected.length === 1 ? '1 selected' : `${selected.length} selected`;
  }

  function renderChoices(products) {
    const { choices } = getEls();
    if (!choices) return;
    renderLock = true;
    removeOtherProductField();

    if (!products.length) {
      choices.innerHTML = '<p class="feedback-product-empty">No site products were found yet. Add products in admin, then refresh this page.</p>';
      updateSelectedValues();
      renderLock = false;
      return;
    }

    choices.innerHTML = products.map((item) => {
      const label = item.meta ? `${item.name} • ${item.meta}` : item.name;
      return `
        <label class="feedback-product-option feedback-product-option-site-only">
          <input type="checkbox" name="feedbackProductChoice" value="${escapeHTML(label)}" />
          <span>
            <strong>${escapeHTML(item.name)}</strong>
            ${item.meta ? `<small>${escapeHTML(item.meta)}</small>` : ''}
          </span>
        </label>
      `;
    }).join('');

    updateSelectedValues();
    renderLock = false;
  }

  async function refreshAndOpen(open = true) {
    const { choices } = getEls();
    if (!choices) return;
    removeOtherProductField();
    setOpen(open);
    if (open && !productCache) setMessage('Loading site products...');
    try {
      const products = await loadProducts();
      renderChoices(products);
      setOpen(open);
    } catch (error) {
      setMessage('Products could not load. Please refresh the page and try again.', 'error');
      setOpen(open);
    }
  }

  function install() {
    installStyle();
    removeOtherProductField();

    const { form, choices, toggle } = getEls();
    if (!form || !choices || !toggle) return;

    // Prepare the list quietly after the main site has opened, but do not block startup.
    const warmLoad = () => loadProducts().then(renderChoices).catch(() => {});
    if ('requestIdleCallback' in window) {
      requestIdleCallback(warmLoad, { timeout: 3500 });
    } else {
      setTimeout(warmLoad, 1400);
    }

    // Capture the toggle click before older scripts can close the dropdown again.
    document.addEventListener('click', (event) => {
      const toggleButton = event.target?.closest?.('#toggleFeedbackProducts');
      if (!toggleButton) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true' || choices.getAttribute('data-scentivity-open') === 'true';
      refreshAndOpen(!isOpen);
    }, true);

    // Refresh product list when the feedback modal is opened.
    document.addEventListener('click', (event) => {
      if (event.target?.closest?.('#openFeedbackButton, .nav-feedback-button')) {
        removeOtherProductField();
        loadProducts().then(renderChoices).catch(() => {});
      }
    }, true);

    document.addEventListener('change', (event) => {
      if (event.target?.matches?.('input[name="feedbackProductChoice"]')) updateSelectedValues();
    });

    form.addEventListener('submit', (event) => {
      updateSelectedValues();
      if (!clean(getEls().hidden?.value || '')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        refreshAndOpen(true);
        alert('Please select at least one product purchased.');
      }
    }, true);

    const observer = new MutationObserver(() => {
      if (renderLock) return;
      removeOtherProductField();
    });
    observer.observe(form, { childList: true, subtree: true });

    window.scentivityRefreshFeedbackProducts = () => {
      productCache = null;
      loadPromise = null;
      return refreshAndOpen(lastOpenState);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
