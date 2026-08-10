/* Scentivity mobile favorites, Load More, media speed, and desktop/tablet cart icon fix
   2026-08-10
   Safe patch: does not touch products.json, assets, or uploaded images. */
(() => {
  'use strict';

  if (window.__scentivityMobileMediaCartFix20260810) return;
  window.__scentivityMobileMediaCartFix20260810 = true;

  const MOBILE_QUERY = '(max-width: 768px)';
  const DESKTOP_TABLET_QUERY = '(min-width: 769px)';
  const mobileMq = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : { matches: true, addEventListener: null };
  const desktopTabletMq = window.matchMedia ? window.matchMedia(DESKTOP_TABLET_QUERY) : { matches: false };

  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  const isMobile = () => !mobileMq || mobileMq.matches;
  const isDesktopOrTablet = () => desktopTabletMq && desktopTabletMq.matches;

  function patchPromoText() {
    document.querySelectorAll('.top-promo span, .top-promo, [role="banner"]').forEach((node) => {
      if (!node || !node.textContent) return;
      if (node.childElementCount && !node.matches('span')) return;
      node.textContent = node.textContent
        .replace(/Secure\s+Card\s*,\s*MoMo\s*&\s*Pay\s+on\s+Pickup/gi, 'Secure Card & MoMo')
        .replace(/Secure\s+Card\s*,\s*MoMo\s+and\s+Pay\s+on\s+Pickup/gi, 'Secure Card & MoMo')
        .replace(/Secure\s+Card\s*&\s*MoMo\s*&\s*Pay\s+on\s+Pickup/gi, 'Secure Card & MoMo');
    });
  }

  function addPreload(href, asType = 'image') {
    if (!href || /^data:/i.test(href)) return;
    const url = href.replace(/^\.\//, '');
    if (document.querySelector(`link[rel="preload"][href="${CSS.escape(url)}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = asType;
    link.href = url;
    if (asType === 'image') link.fetchPriority = 'high';
    document.head.appendChild(link);
  }

  function prioritizeImage(img, high = false) {
    if (!img || img.dataset.scentivityPriorityApplied) return;
    img.dataset.scentivityPriorityApplied = 'true';
    img.decoding = 'async';
    if (high) {
      img.loading = 'eager';
      try { img.fetchPriority = 'high'; } catch (_) {}
    } else {
      img.loading = img.loading || 'lazy';
      try { img.fetchPriority = 'low'; } catch (_) {}
    }
  }

  function prioritizeVisibleImages() {
    const heroShowcase = document.getElementById('homepageProductSlides');
    const productGrid = document.getElementById('productGrid');
    const showcaseImages = heroShowcase ? Array.from(heroShowcase.querySelectorAll('img')) : [];
    const productImages = productGrid ? Array.from(productGrid.querySelectorAll('img')) : [];
    showcaseImages.forEach((img) => prioritizeImage(img, true));
    const highCount = isMobile() ? 4 : 8;
    productImages.forEach((img, index) => prioritizeImage(img, index < highCount));
  }

  function preloadFirstProductImages() {
    fetch('data/products.json?v=media-preload-20260810', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const products = Array.isArray(data) ? data : (Array.isArray(data?.products) ? data.products : []);
        if (!products.length) return;
        const seen = new Set();
        products
          .filter((p) => p && p.showOnWebsite !== false && String(p.showOnWebsite).toLowerCase() !== 'false')
          .map((p) => p.image || p.productImage || p.imageUrl || '')
          .filter(Boolean)
          .slice(0, isMobile() ? 5 : 9)
          .forEach((src) => {
            const href = String(src).replace(/^\/+/, '');
            if (!href || seen.has(href)) return;
            seen.add(href);
            addPreload(href, 'image');
          });
      })
      .catch(() => {});
  }

  function boostHomepageVideo() {
    const video = document.getElementById('homepageVideo');
    if (!video) return;
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const sources = Array.from(video.querySelectorAll('source'));
    sources.forEach((source) => {
      const src = source.getAttribute('src') || source.dataset.src;
      if (src && !source.getAttribute('src')) source.setAttribute('src', src);
    });

    const startLoad = () => {
      try { video.load(); } catch (_) {}
      const playWhenReady = () => {
        const playPromise = video.play?.();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
      };
      if (video.readyState >= 2) playWhenReady();
      else video.addEventListener('canplay', playWhenReady, { once: true });
    };

    requestAnimationFrame(startLoad);
    setTimeout(startLoad, 350);
  }

  function observeMediaChanges() {
    const productGrid = document.getElementById('productGrid');
    const homepageSlides = document.getElementById('homepageProductSlides');
    const observer = new MutationObserver(() => {
      requestAnimationFrame(prioritizeVisibleImages);
      setTimeout(prioritizeVisibleImages, 120);
    });
    if (productGrid) observer.observe(productGrid, { childList: true, subtree: true });
    if (homepageSlides) observer.observe(homepageSlides, { childList: true, subtree: true });
    prioritizeVisibleImages();
    setTimeout(prioritizeVisibleImages, 700);
    setTimeout(prioritizeVisibleImages, 1800);
  }

  function initMobileFavoritesAutoplay() {
    let timer = null;
    let pausedUntil = 0;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const getDotButtons = () => Array.from(document.querySelectorAll('#homepageProductDots button'));

    const activeDotIndex = (dots) => {
      const explicit = dots.findIndex((dot) => dot.classList.contains('active') || dot.getAttribute('aria-current') === 'true');
      if (explicit >= 0) return explicit;
      const fromData = dots.findIndex((dot) => String(dot.dataset.slideIndex || '') === '0');
      return fromData >= 0 ? fromData : 0;
    };

    const moveNext = () => {
      if (!isMobile() || document.hidden || Date.now() < pausedUntil) return;
      const nextButton = document.getElementById('showcaseNext');
      const dots = getDotButtons();
      if (dots.length < 2 && !nextButton) return;

      // Existing site logic controls the Customer Favorites content. Clicking its Next button is safest.
      if (nextButton && !nextButton.disabled) {
        nextButton.click();
        return;
      }

      const index = activeDotIndex(dots);
      const nextDot = dots[(index + 1) % dots.length];
      nextDot?.click();
    };

    const start = () => {
      stop();
      if (!isMobile()) return;
      timer = setInterval(moveNext, 4200);
    };

    const pause = () => { pausedUntil = Date.now() + 6500; };

    document.getElementById('showcasePrev')?.addEventListener('click', pause, true);
    document.getElementById('showcaseNext')?.addEventListener('click', pause, true);
    document.getElementById('homepageProductSlides')?.addEventListener('touchstart', pause, { passive: true, capture: true });
    document.getElementById('homepageProductDots')?.addEventListener('click', pause, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });

    if (mobileMq && mobileMq.addEventListener) mobileMq.addEventListener('change', start);
    else if (mobileMq && mobileMq.addListener) mobileMq.addListener(start);

    start();
    setTimeout(start, 1000);
    setTimeout(start, 2500);
  }

  function initStrongLoadMoreMobileFix() {
    if (window.__scentivityStrongLoadMorePatch) return;
    window.__scentivityStrongLoadMorePatch = true;

    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function patchedScrollIntoView(...args) {
      const suppressUntil = window.__scentivitySuppressLoadMoreScrollUntil || 0;
      if (Date.now() < suppressUntil && isMobile()) {
        const el = this;
        if (el && (el.id === 'productLoadMoreButton' || el.closest?.('#productLoadMoreWrap, #products'))) {
          return;
        }
      }
      return originalScrollIntoView.apply(this, args);
    };

    document.addEventListener('click', (event) => {
      const button = event.target?.closest?.('#productLoadMoreButton, .product-load-more-button');
      if (!button || !isMobile()) return;

      const productsSection = document.getElementById('products');
      const startScroll = window.scrollY || window.pageYOffset || 0;
      const startTop = productsSection ? productsSection.getBoundingClientRect().top + startScroll : startScroll;
      window.__scentivitySuppressLoadMoreScrollUntil = Date.now() + 1800;

      const restore = () => {
        if (!productsSection) return;
        const current = window.scrollY || window.pageYOffset || 0;
        const rect = productsSection.getBoundingClientRect();
        const sectionTop = rect.top + current;
        const sectionBottom = rect.bottom + current;
        const viewportHeight = window.innerHeight || 700;
        const tooLow = current > sectionBottom - Math.min(viewportHeight * 0.25, 160);
        const tooHigh = current < sectionTop - 80;
        const jumpedFar = Math.abs(current - startScroll) > Math.max(220, viewportHeight * 0.35);

        if (tooLow || tooHigh || jumpedFar) {
          window.scrollTo({ top: Math.max(0, Math.max(startTop - 20, startScroll)), behavior: 'auto' });
        }
        if (document.activeElement === button) button.blur();
      };

      requestAnimationFrame(() => requestAnimationFrame(restore));
      setTimeout(restore, 80);
      setTimeout(restore, 180);
      setTimeout(restore, 450);
      setTimeout(restore, 950);
      setTimeout(() => { window.__scentivitySuppressLoadMoreScrollUntil = 0; }, 2000);
    }, true);
  }

  function initDesktopTabletCartToast() {
    if (document.getElementById('scentivityFloatingCartToast')) return;

    const style = document.createElement('style');
    style.textContent = `
      .scentivity-floating-cart-toast{position:fixed;right:1rem;bottom:5.8rem;z-index:9998;display:none;align-items:center;gap:.65rem;border:0;border-radius:999px;padding:.75rem 1rem;background:#fff;color:#3b1023;box-shadow:0 18px 40px rgba(71,21,45,.22);font:inherit;cursor:pointer;min-width:190px;text-align:left;transform:translateY(14px) scale(.96);opacity:0;transition:opacity .22s ease,transform .22s ease}.scentivity-floating-cart-toast.show{display:flex;opacity:1;transform:translateY(0) scale(1)}.scentivity-floating-cart-toast .cart-bubble{width:2.45rem;height:2.45rem;border-radius:50%;display:grid;place-items:center;background:#fff0f6;font-size:1.25rem}.scentivity-floating-cart-toast strong{display:block;font-size:.92rem;line-height:1.1}.scentivity-floating-cart-toast small{display:block;font-size:.76rem;opacity:.78;margin-top:.12rem}@media(max-width:768px){.scentivity-floating-cart-toast{display:none!important}}`;
    document.head.appendChild(style);

    const toast = document.createElement('button');
    toast.id = 'scentivityFloatingCartToast';
    toast.className = 'scentivity-floating-cart-toast';
    toast.type = 'button';
    toast.setAttribute('aria-label', 'Open cart');
    toast.innerHTML = `<span class="cart-bubble" aria-hidden="true">🛒</span><span><strong>Added to cart</strong><small><span id="scentivityFloatingCartCount">0</span> item(s) in cart</small></span>`;
    document.body.appendChild(toast);

    let hideTimer = null;
    const countEl = toast.querySelector('#scentivityFloatingCartCount');

    const getCartCount = () => {
      const counters = Array.from(document.querySelectorAll('[data-cart-count]'));
      for (const counter of counters) {
        const value = parseInt(counter.textContent || '0', 10);
        if (Number.isFinite(value) && value > 0) return value;
      }
      return 0;
    };

    const openCart = () => {
      const opener = document.querySelector('[data-open-cart]');
      if (opener && opener !== toast) {
        opener.click();
      } else {
        document.getElementById('cartOverlay')?.classList.add('visible');
        document.getElementById('cartOverlay')?.setAttribute('aria-hidden', 'false');
        document.getElementById('cartDrawer')?.classList.add('open');
        document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'false');
      }
    };

    const showToast = () => {
      if (!isDesktopOrTablet()) return;
      const count = getCartCount();
      if (countEl) countEl.textContent = String(count || 1);
      toast.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => toast.classList.remove('show'), 5200);
    };

    toast.addEventListener('click', openCart);

    document.addEventListener('click', (event) => {
      const addButton = event.target?.closest?.('.add-to-cart, [data-add-to-cart], #addBuiltBundleToCart');
      if (!addButton) return;
      setTimeout(showToast, 130);
      setTimeout(showToast, 420);
    }, true);
  }

  ready(() => {
    patchPromoText();
    boostHomepageVideo();
    preloadFirstProductImages();
    observeMediaChanges();
    initMobileFavoritesAutoplay();
    initStrongLoadMoreMobileFix();
    initDesktopTabletCartToast();
    setTimeout(patchPromoText, 800);
    setTimeout(prioritizeVisibleImages, 2500);
  });
})();
