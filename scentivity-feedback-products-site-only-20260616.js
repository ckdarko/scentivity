/* Scentivity feedback product selector
   - Shows only products uploaded to the site (data/products.json)
   - Includes Available, Incoming, and Out of Stock products
   - Excludes combos and removes the “Other product / combo not listed” field
   - Loads lazily so mobile opening speed is not affected
*/
(() => {
  'use strict';

  const DATA_PATHS = ['data/products.json', '/data/products.json', 'products.json'];
  let productsCache = null;
  let loadingPromise = null;
  let rendering = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const isFalseLike = value => value === false || /^(false|no|off|0|hidden)$/i.test(clean(value));

  function escapeHTML(value) {
    return clean(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    $$('.feedback-other-product').forEach(el => el.remove());
    $$('input[name="productsPurchasedOther"]').forEach(el => el.closest('label')?.remove() || el.remove());
  }

  function shouldIncludeProduct(product) {
    if (!product || !clean(product.name)) return false;
    // Show only products meant to appear on the website, but do not filter by stock/status.
    if (isFalseLike(product.showOnWebsite) || isFalseLike(product.visible) || product.hidden === true) return false;
    return true;
  }

  function productLabel(product) {
    const parts = [
      clean(product.name),
      clean(product.brand),
      clean(product.size),
      clean(product.productStatus || product.status || '')
    ].filter(Boolean);
    return parts.join(' • ');
  }

  async function fetchProducts() {
    if (productsCache) return productsCache;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      for (const path of DATA_PATHS) {
        try {
          const response = await fetch(path, { cache: 'no-cache' });
          if (!response.ok) continue;
          const data = await response.json();
          const products = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
          productsCache = products.filter(shouldIncludeProduct);
          return productsCache;
        } catch (error) {
          // Try the next possible data path.
        }
      }
      productsCache = [];
      return productsCache;
    })();

    return loadingPromise;
  }

  function updateSelectedValues() {
    const { count, hidden } = getEls();
    const selected = $$('input[name="feedbackProductChoice"]:checked')
      .map(input => clean(input.value))
      .filter(Boolean);

    if (hidden) hidden.value = selected.join('; ');
    if (count) count.textContent = selected.length === 1 ? '1 selected' : `${selected.length} selected`;
  }

  function setChoicesOpen(open) {
    const { choices, toggle } = getEls();
    if (!choices || !toggle) return;
    choices.hidden = !open;
    choices.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  function renderProductChoices(products) {
    const { choices } = getEls();
    if (!choices) return;

    rendering = true;
    removeOtherProductField();

    const unique = [];
    const seen = new Set();
    products.forEach(product => {
      const label = productLabel(product);
      const key = clean(product.id || product.slug || label).toLowerCase();
      if (!label || seen.has(key)) return;
      seen.add(key);
      unique.push({ label, status: clean(product.productStatus || product.status || '') });
    });

    if (!unique.length) {
      choices.innerHTML = '<p class="empty-state">Products will appear here after they are added in admin.</p>';
      updateSelectedValues();
      rendering = false;
      return;
    }

    choices.innerHTML = unique.map(item => `
      <label class="feedback-product-option feedback-product-option-site-only">
        <input type="checkbox" name="feedbackProductChoice" value="${escapeHTML(item.label)}" />
        <span class="feedback-product-name">${escapeHTML(item.label)}</span>
      </label>
    `).join('');

    updateSelectedValues();
    rendering = false;
  }

  async function refreshChoices({ open = null } = {}) {
    const { choices } = getEls();
    if (!choices) return;
    removeOtherProductField();
    if (!productsCache) choices.innerHTML = '<p class="empty-state">Loading site products...</p>';
    const products = await fetchProducts();
    renderProductChoices(products);
    if (open !== null) setChoicesOpen(open);
  }

  function install() {
    const { form, choices, toggle, modal } = getEls();
    if (!form || !choices) return;

    removeOtherProductField();

    // Load after first paint, but do not block mobile startup.
    const lazyStart = () => refreshChoices({ open: false });
    if ('requestIdleCallback' in window) {
      requestIdleCallback(lazyStart, { timeout: 3000 });
    } else {
      setTimeout(lazyStart, 1200);
    }

    toggle?.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      refreshChoices({ open: !isOpen });
    }, { passive: true });

    $('#openFeedbackButton')?.addEventListener('click', () => {
      refreshChoices({ open: false });
    }, { passive: true });

    modal?.addEventListener('transitionend', () => {
      if (modal.classList.contains('open')) refreshChoices({ open: false });
    }, { passive: true });

    document.addEventListener('change', event => {
      if (event.target?.matches?.('input[name="feedbackProductChoice"]')) {
        updateSelectedValues();
      }
    });

    // Prevent the old script's outdated validation text from showing if no product is selected.
    form.addEventListener('submit', event => {
      updateSelectedValues();
      if (!clean($('#feedbackProductsPurchased')?.value || '')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        alert('Please select at least one product purchased.');
      }
    }, true);

    // If an older script tries to repopulate with combos, put the site-only product list back.
    const observer = new MutationObserver(() => {
      if (rendering || !productsCache) return;
      const hasCombo = choices.textContent.toLowerCase().includes('combo');
      const hasOther = !!$('input[name="productsPurchasedOther"]');
      if (hasCombo || hasOther) renderProductChoices(productsCache);
    });
    observer.observe(choices, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
