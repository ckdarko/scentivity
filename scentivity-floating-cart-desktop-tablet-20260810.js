/* Scentivity persistent desktop/tablet floating cart button
   2026-08-10
   Safe patch: no product data, assets, or uploaded images are changed. */
(() => {
  'use strict';

  if (window.__scentivityPersistentFloatingCart20260810) return;
  window.__scentivityPersistentFloatingCart20260810 = true;

  const CART_STORAGE_KEYS = ['scentivityCartV1', 'scentivityCart', 'cart'];
  const DESKTOP_TABLET_QUERY = '(min-width: 768px)';
  const mq = window.matchMedia ? window.matchMedia(DESKTOP_TABLET_QUERY) : { matches: true };

  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  const isDesktopTablet = () => !mq || mq.matches;

  function parseCount(value) {
    const n = parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  }

  function countFromVisibleCounters() {
    const selectors = [
      '[data-cart-count]',
      '#cartCount',
      '#cartCountFooter',
      '#mobileCartCount',
      '#productPageBottomCartCount',
      '#cartCountMenu',
      '#floatingCartCount'
    ];
    let max = 0;
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (!el || el.id === 'scentivityPersistentCartCount') return;
      max = Math.max(max, parseCount(el.textContent));
    });
    return max;
  }

  function countFromStorage() {
    try {
      for (const key of CART_STORAGE_KEYS) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          return data.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || item?.qty || 0)), 0);
        }
        if (data && Array.isArray(data.items)) {
          return data.items.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || item?.qty || 0)), 0);
        }
      }
    } catch (_) {}
    return 0;
  }

  function getCartCount() {
    return Math.max(countFromVisibleCounters(), countFromStorage());
  }

  function injectStyle() {
    if (document.getElementById('scentivityPersistentFloatingCartStyle')) return;
    const style = document.createElement('style');
    style.id = 'scentivityPersistentFloatingCartStyle';
    style.textContent = `
      .scentivity-floating-cart-toast{display:none!important;}
      .scentivity-persistent-cart-button{
        position:fixed;
        right:1.1rem;
        bottom:5.7rem;
        z-index:2147483000;
        display:none;
        align-items:center;
        gap:.55rem;
        min-width:86px;
        min-height:56px;
        padding:.62rem .82rem .62rem .7rem;
        border:0;
        border-radius:999px;
        background:#fff;
        color:#3b1023;
        box-shadow:0 18px 45px rgba(57,14,35,.26), 0 0 0 1px rgba(224,0,91,.12);
        cursor:pointer;
        font:inherit;
        text-align:left;
        transform:translateY(8px) scale(.98);
        opacity:0;
        transition:opacity .2s ease, transform .2s ease, box-shadow .2s ease;
      }
      .scentivity-persistent-cart-button.is-visible{
        display:flex;
        opacity:1;
        transform:translateY(0) scale(1);
      }
      .scentivity-persistent-cart-button:hover,
      .scentivity-persistent-cart-button:focus-visible{
        box-shadow:0 22px 55px rgba(57,14,35,.32), 0 0 0 3px rgba(224,0,91,.18);
        outline:none;
      }
      .scentivity-persistent-cart-button .scentivity-cart-icon-wrap{
        position:relative;
        width:2.45rem;
        height:2.45rem;
        border-radius:50%;
        display:grid;
        place-items:center;
        background:#fff0f6;
        font-size:1.25rem;
        flex:0 0 auto;
      }
      .scentivity-persistent-cart-button .scentivity-cart-count-badge{
        position:absolute;
        top:-.45rem;
        right:-.45rem;
        min-width:1.45rem;
        height:1.45rem;
        padding:0 .35rem;
        border-radius:999px;
        display:grid;
        place-items:center;
        background:#e0005b;
        color:#fff;
        font-size:.78rem;
        line-height:1;
        font-weight:800;
        box-shadow:0 8px 20px rgba(224,0,91,.28);
      }
      .scentivity-persistent-cart-button strong{
        display:block;
        font-size:.91rem;
        line-height:1.05;
        white-space:nowrap;
      }
      .scentivity-persistent-cart-button small{
        display:block;
        font-size:.72rem;
        line-height:1.1;
        opacity:.76;
        margin-top:.1rem;
        white-space:nowrap;
      }
      .scentivity-persistent-cart-button.cart-pulse{
        animation:scentivityCartPulse20260810 .52s ease;
      }
      @keyframes scentivityCartPulse20260810{
        0%{transform:translateY(0) scale(1);}
        45%{transform:translateY(-4px) scale(1.06);}
        100%{transform:translateY(0) scale(1);}
      }
      @media(max-width:767px){
        .scentivity-persistent-cart-button{display:none!important;}
      }
      @media(min-width:768px) and (max-width:1100px){
        .scentivity-persistent-cart-button{right:1rem;bottom:5.25rem;}
      }
    `;
    document.head.appendChild(style);
  }

  function createButton() {
    let button = document.getElementById('scentivityPersistentFloatingCartButton');
    if (button) return button;
    button = document.createElement('button');
    button.id = 'scentivityPersistentFloatingCartButton';
    button.className = 'scentivity-persistent-cart-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open cart');
    button.innerHTML = `
      <span class="scentivity-cart-icon-wrap" aria-hidden="true">
        🛒
        <span class="scentivity-cart-count-badge" id="scentivityPersistentCartCount">0</span>
      </span>
      <span class="scentivity-cart-button-copy">
        <strong>Cart</strong>
        <small>View items</small>
      </span>
    `;
    document.body.appendChild(button);
    button.addEventListener('click', openCart);
    return button;
  }

  function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (drawer && overlay) {
      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cart-open');
      return;
    }

    const opener = document.querySelector('#cartToggleFooter, #cartToggle, #mobileCartButton, [data-open-cart]');
    if (opener && opener.id !== 'scentivityPersistentFloatingCartButton') {
      opener.click();
      return;
    }

    // Product pages do not always have the cart drawer. Send buyer to homepage cart safely.
    const base = window.location.pathname.includes('product') ? 'index.html' : '/';
    window.location.href = `${base}?openCart=true#cart`;
  }

  function updateButton(options = {}) {
    const button = createButton();
    const badge = document.getElementById('scentivityPersistentCartCount');
    const count = getCartCount();

    if (badge) badge.textContent = String(count);
    button.setAttribute('aria-label', count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart');
    button.classList.toggle('is-visible', isDesktopTablet() && count > 0);

    if (options.pulse && count > 0) {
      button.classList.remove('cart-pulse');
      void button.offsetWidth;
      button.classList.add('cart-pulse');
    }
  }

  function scheduleUpdate(pulse = false) {
    updateButton({ pulse });
    requestAnimationFrame(() => updateButton({ pulse }));
    setTimeout(() => updateButton({ pulse }), 80);
    setTimeout(() => updateButton({ pulse }), 220);
    setTimeout(() => updateButton({ pulse }), 600);
  }

  function watchCartChanges() {
    document.addEventListener('click', (event) => {
      const addButton = event.target?.closest?.([
        '.add-to-cart',
        '.detail-add-to-cart',
        '.add-combo-to-cart',
        '[data-add-to-cart]',
        '[data-deal-product-key]',
        '[data-deal-combo-key]',
        '#addBuiltBundleToCart'
      ].join(','));
      const cartQtyButton = event.target?.closest?.('[data-cart-action]');
      if (addButton) scheduleUpdate(true);
      if (cartQtyButton) scheduleUpdate(false);
    }, true);

    const observer = new MutationObserver(() => scheduleUpdate(false));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    window.addEventListener('storage', () => scheduleUpdate(false));
    window.addEventListener('pageshow', () => scheduleUpdate(false));
    window.addEventListener('focus', () => scheduleUpdate(false));
    if (mq && mq.addEventListener) mq.addEventListener('change', () => scheduleUpdate(false));
    else if (mq && mq.addListener) mq.addListener(() => scheduleUpdate(false));

    // Fallback for cart updates that happen without DOM mutation timing.
    setInterval(() => updateButton(), 1500);
  }

  ready(() => {
    injectStyle();
    createButton();
    watchCartChanges();
    scheduleUpdate(false);
    setTimeout(() => scheduleUpdate(false), 900);
    setTimeout(() => scheduleUpdate(false), 2200);
  });
})();
