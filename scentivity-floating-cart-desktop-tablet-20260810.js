/* Scentivity persistent desktop/tablet floating cart button - HOTFIX
   2026-08-10b
   Fixes possible mobile/desktop unresponsive behavior by removing the heavy whole-page MutationObserver loop.
   Safe patch: no product data, uploaded images, or admin files are changed. */
(() => {
  'use strict';

  if (window.__scentivityPersistentFloatingCartHotfix20260810b) return;
  window.__scentivityPersistentFloatingCartHotfix20260810b = true;

  const DESKTOP_TABLET_QUERY = '(min-width: 768px)';
  const CART_STORAGE_KEYS = ['scentivityCartV1', 'scentivityCart', 'cart'];
  const mq = window.matchMedia ? window.matchMedia(DESKTOP_TABLET_QUERY) : { matches: true };

  let lastCount = -1;
  let lastVisible = false;
  let updateTimer = null;
  let pulseTimer = null;

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
    let max = 0;
    document.querySelectorAll('[data-cart-count], #cartCount, #cartCountFooter, #mobileCartCount, #productPageBottomCartCount, #cartCountMenu').forEach((el) => {
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
        right:1.05rem;
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
        transition:opacity .18s ease, transform .18s ease, box-shadow .18s ease;
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
      .scentivity-persistent-cart-button strong{display:block;font-size:.91rem;line-height:1.05;white-space:nowrap;}
      .scentivity-persistent-cart-button small{display:block;font-size:.72rem;line-height:1.1;opacity:.76;margin-top:.1rem;white-space:nowrap;}
      .scentivity-persistent-cart-button.cart-pulse{animation:scentivityCartPulse20260810b .52s ease;}
      @keyframes scentivityCartPulse20260810b{
        0%{transform:translateY(0) scale(1);}
        45%{transform:translateY(-4px) scale(1.06);}
        100%{transform:translateY(0) scale(1);}
      }
      @media(max-width:767px){.scentivity-persistent-cart-button{display:none!important;}}
      @media(min-width:768px) and (max-width:1100px){.scentivity-persistent-cart-button{right:1rem;bottom:5.25rem;}}
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
      <span class="scentivity-cart-icon-wrap" aria-hidden="true">🛒<span class="scentivity-cart-count-badge" id="scentivityPersistentCartCount">0</span></span>
      <span class="scentivity-cart-button-copy"><strong>Cart</strong><small>View items</small></span>
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
    window.location.href = window.location.pathname.includes('product') ? 'index.html?openCart=true#cart' : '/?openCart=true#cart';
  }

  function updateButton({ pulse = false, force = false } = {}) {
    const button = createButton();
    const badge = document.getElementById('scentivityPersistentCartCount');
    const count = getCartCount();
    const visible = isDesktopTablet() && count > 0;

    if (!force && count === lastCount && visible === lastVisible && !pulse) return;
    lastCount = count;
    lastVisible = visible;

    if (badge) badge.textContent = String(count);
    button.setAttribute('aria-label', count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart');
    button.classList.toggle('is-visible', visible);

    if (pulse && visible) {
      clearTimeout(pulseTimer);
      button.classList.remove('cart-pulse');
      // Trigger reflow on only this small button, not the entire page.
      void button.offsetWidth;
      button.classList.add('cart-pulse');
      pulseTimer = setTimeout(() => button.classList.remove('cart-pulse'), 650);
    }
  }

  function scheduleUpdate({ pulse = false, delay = 90, repeat = true } = {}) {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      updateButton({ pulse, force: true });
      if (repeat) {
        setTimeout(() => updateButton({ pulse: false, force: true }), 250);
        setTimeout(() => updateButton({ pulse: false, force: true }), 900);
      }
    }, delay);
  }

  function isCartRelatedClick(event) {
    const target = event.target;
    if (!target || !target.closest) return false;
    return Boolean(target.closest([
      '.add-to-cart',
      '.detail-add-to-cart',
      '.add-combo-to-cart',
      '[data-add-to-cart]',
      '[data-cart-action]',
      '[data-deal-product-key]',
      '[data-deal-combo-key]',
      '#addBuiltBundleToCart',
      '#checkoutForm button',
      '.checkout-submit'
    ].join(',')));
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      if (!isCartRelatedClick(event)) return;
      const pulse = Boolean(event.target.closest?.('.add-to-cart, .detail-add-to-cart, .add-combo-to-cart, [data-add-to-cart], [data-deal-product-key], [data-deal-combo-key], #addBuiltBundleToCart'));
      scheduleUpdate({ pulse, delay: 120, repeat: true });
    }, true);

    window.addEventListener('storage', () => scheduleUpdate({ delay: 50 }));
    window.addEventListener('pageshow', () => scheduleUpdate({ delay: 50 }));
    window.addEventListener('focus', () => scheduleUpdate({ delay: 50 }));
    if (mq && mq.addEventListener) mq.addEventListener('change', () => scheduleUpdate({ delay: 50 }));
    else if (mq && mq.addListener) mq.addListener(() => scheduleUpdate({ delay: 50 }));

    // Light, safe polling only. No MutationObserver loop.
    setInterval(() => updateButton({ force: true }), 4000);
  }

  ready(() => {
    injectStyle();
    createButton();
    bindEvents();
    updateButton({ force: true });
    setTimeout(() => updateButton({ force: true }), 700);
    setTimeout(() => updateButton({ force: true }), 2000);
  });
})();
