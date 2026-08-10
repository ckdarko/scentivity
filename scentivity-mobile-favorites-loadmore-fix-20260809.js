/* Scentivity mobile favorites carousel + Load More jump fix
   - Restarts customer favorites movement on mobile.
   - Keeps the buyer in the products section after tapping LOAD MORE.
   - Does not touch products.json, assets, or uploaded images. */
(() => {
  'use strict';

  if (window.__scentivityMobileFavoritesLoadMoreFixLoaded) return;
  window.__scentivityMobileFavoritesLoadMoreFixLoaded = true;

  const MOBILE_QUERY = '(max-width: 768px)';
  const mobileMq = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : { matches: true, addEventListener: null };

  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function initMobileCustomerFavorites() {
    const track = document.getElementById('homepageProductSlides');
    const prevButton = document.getElementById('showcasePrev');
    const nextButton = document.getElementById('showcaseNext');
    const dotsWrap = document.getElementById('homepageProductDots');

    if (!track || track.dataset.scentivityMobileFavoritesFix === 'active') return;
    track.dataset.scentivityMobileFavoritesFix = 'active';

    let slides = [];
    let currentIndex = 0;
    let autoplayTimer = null;
    let refreshTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let userPausedUntil = 0;

    const isMobile = () => !mobileMq || mobileMq.matches;

    const getSlides = () => Array.from(track.children).filter((item) => {
      if (!(item instanceof HTMLElement)) return false;
      return item.matches('.showcase-slide, article');
    });

    const setDotState = () => {
      if (!dotsWrap) return;
      const dots = Array.from(dotsWrap.querySelectorAll('button'));
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
        dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
      });
    };

    const rebuildDots = () => {
      if (!dotsWrap) return;
      const existing = dotsWrap.querySelectorAll('button').length;
      if (existing === slides.length) {
        setDotState();
        return;
      }

      dotsWrap.innerHTML = '';
      slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show customer favorite ${index + 1}`);
        dot.addEventListener('click', () => {
          pauseBriefly();
          goToSlide(index, true);
          startAutoplay();
        });
        dotsWrap.appendChild(dot);
      });
      setDotState();
    };

    const applyMobileLayout = () => {
      if (!isMobile()) {
        stopAutoplay();
        track.style.transform = '';
        track.style.transition = '';
        track.style.willChange = '';
        slides.forEach((slide) => {
          slide.style.flex = '';
          slide.style.maxWidth = '';
          slide.removeAttribute('aria-hidden');
        });
        return;
      }

      track.style.display = 'flex';
      track.style.transition = 'transform 420ms ease';
      track.style.willChange = 'transform';
      slides.forEach((slide) => {
        slide.style.flex = '0 0 100%';
        slide.style.maxWidth = '100%';
      });
    };

    const goToSlide = (nextIndex, animate = true) => {
      slides = getSlides();
      if (!slides.length) return;

      currentIndex = ((nextIndex % slides.length) + slides.length) % slides.length;
      applyMobileLayout();

      slides.forEach((slide, index) => {
        const active = index === currentIndex;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      if (isMobile()) {
        track.style.transition = animate ? 'transform 420ms ease' : 'none';
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        if (!animate) {
          requestAnimationFrame(() => {
            track.style.transition = 'transform 420ms ease';
          });
        }
      }

      setDotState();
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (!isMobile() || document.hidden || slides.length < 2) return;
      autoplayTimer = setInterval(() => {
        if (Date.now() < userPausedUntil) return;
        goToSlide(currentIndex + 1, true);
      }, 4200);
    };

    const pauseBriefly = () => {
      userPausedUntil = Date.now() + 6500;
    };

    const refresh = () => {
      slides = getSlides();
      if (!slides.length) return;
      currentIndex = clamp(currentIndex, 0, slides.length - 1);
      applyMobileLayout();
      rebuildDots();
      goToSlide(currentIndex, false);
      startAutoplay();
    };

    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 120);
    };

    prevButton?.addEventListener('click', () => {
      pauseBriefly();
      goToSlide(currentIndex - 1, true);
      startAutoplay();
    });

    nextButton?.addEventListener('click', () => {
      pauseBriefly();
      goToSlide(currentIndex + 1, true);
      startAutoplay();
    });

    track.addEventListener('touchstart', (event) => {
      if (!event.touches || !event.touches.length) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      pauseBriefly();
    }, { passive: true });

    track.addEventListener('touchend', (event) => {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        goToSlide(currentIndex + (dx < 0 ? 1 : -1), true);
      }
      startAutoplay();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    if (mobileMq && mobileMq.addEventListener) {
      mobileMq.addEventListener('change', refresh);
    } else if (mobileMq && mobileMq.addListener) {
      mobileMq.addListener(refresh);
    }

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(track, { childList: true });

    refresh();
    setTimeout(refresh, 600);
    setTimeout(refresh, 1500);
  }

  function initLoadMoreJumpFix() {
    if (document.dataset.scentivityLoadMoreJumpFix === 'active') return;
    document.dataset.scentivityLoadMoreJumpFix = 'active';

    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('#productLoadMoreButton, .product-load-more-button') : null;
      if (!button) return;

      const productsSection = document.getElementById('products');
      const productGrid = document.getElementById('productGrid');
      const loadMoreWrap = document.getElementById('productLoadMoreWrap');
      if (!productsSection || !productGrid) return;

      const beforeButtonTop = button.getBoundingClientRect().top;
      const beforeScroll = window.scrollY || window.pageYOffset || 0;
      const beforeProductsTop = productsSection.getBoundingClientRect().top + beforeScroll;
      const beforeProductsBottom = productsSection.getBoundingClientRect().bottom + beforeScroll;

      const keepInProducts = () => {
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const sectionRect = productsSection.getBoundingClientRect();
        const sectionTop = sectionRect.top + currentScroll;
        const sectionBottom = sectionRect.bottom + currentScroll;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 700;

        let desiredScroll;
        if (button.isConnected && !button.hidden) {
          const buttonTopNow = button.getBoundingClientRect().top + currentScroll;
          desiredScroll = buttonTopNow - beforeButtonTop;
        } else if (loadMoreWrap && loadMoreWrap.isConnected) {
          const wrapTopNow = loadMoreWrap.getBoundingClientRect().top + currentScroll;
          desiredScroll = wrapTopNow - beforeButtonTop;
        } else {
          desiredScroll = beforeScroll;
        }

        const minScroll = Math.max(0, sectionTop - 16);
        const maxScroll = Math.max(minScroll, sectionBottom - viewportHeight + 90);
        desiredScroll = clamp(desiredScroll, minScroll, maxScroll);

        const jumpedOutsideProducts = currentScroll < beforeProductsTop - 80 || currentScroll > sectionBottom - 40;
        const jumpedFar = Math.abs(currentScroll - desiredScroll) > 120;
        const movedToNextSection = currentScroll > beforeProductsBottom + 80;

        if (jumpedOutsideProducts || jumpedFar || movedToNextSection) {
          window.scrollTo({ top: desiredScroll, behavior: 'auto' });
        }

        if (document.activeElement === button) button.blur();
      };

      // Let the existing site code load the products first, then correct any mobile jump.
      requestAnimationFrame(() => requestAnimationFrame(keepInProducts));
      setTimeout(keepInProducts, 90);
      setTimeout(keepInProducts, 240);
      setTimeout(keepInProducts, 650);
    }, true);
  }

  ready(() => {
    initMobileCustomerFavorites();
    initLoadMoreJumpFix();
    // Re-check because product slides are populated dynamically from data/products.json.
    setTimeout(initMobileCustomerFavorites, 800);
    setTimeout(initMobileCustomerFavorites, 1800);
  });
})();
