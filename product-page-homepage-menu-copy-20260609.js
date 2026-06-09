// Product page menu copied to use the same header/menu shell as index.html.
// This is the only product-page menu toggler; older competing togglers were removed.
(function scentivityProductPageHomepageMenuCopy() {
  const getPanel = () => document.getElementById('headerMenuPanel');
  const getToggle = () => document.getElementById('headerMenuToggle');

  function openMenu(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const panel = getPanel();
    const toggle = getToggle();
    if (!panel || !toggle) return false;

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('product-menu-open');
    return false;
  }

  function closeMenu(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const panel = getPanel();
    const toggle = getToggle();
    if (!panel || !toggle) return false;

    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('product-menu-open');
    return false;
  }

  function toggleMenu(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const panel = getPanel();
    if (panel?.classList.contains('open')) return closeMenu(event);
    return openMenu(event);
  }

  function updateCartCounts() {
    try {
      const cart = JSON.parse(localStorage.getItem('scentivityCartV1') || '[]');
      const count = Array.isArray(cart) ? cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0;
      document.querySelectorAll('#cartCount, #cartCountMenu, #productPageBottomCartCount').forEach(el => { el.textContent = String(count); });
    } catch {
      document.querySelectorAll('#cartCount, #cartCountMenu, #productPageBottomCartCount').forEach(el => { el.textContent = '0'; });
    }
  }

  function wireMenu() {
    const toggle = getToggle();
    const close = document.getElementById('headerMenuClose');
    const panel = getPanel();
    const menuSearch = document.getElementById('menuSearchInput');

    if (!toggle || !panel) return false;

    // Hard reset previous inline/library listeners by using a cloned button, preserving the exact same HTML/class look.
    const freshToggle = toggle.cloneNode(true);
    toggle.replaceWith(freshToggle);

    freshToggle.addEventListener('click', toggleMenu, true);
    freshToggle.addEventListener('touchend', toggleMenu, true);
    freshToggle.onclick = toggleMenu;

    close?.addEventListener('click', closeMenu, true);
    panel.addEventListener('click', event => {
      if (event.target === panel) closeMenu(event);
    }, true);

    panel.querySelectorAll('a, button:not(#headerMenuClose)').forEach(item => {
      item.addEventListener('click', () => {
        window.setTimeout(() => closeMenu(), 80);
      });
    });

    menuSearch?.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      const term = menuSearch.value.trim();
      if (!term) return;
      window.location.href = `index.html#products?search=${encodeURIComponent(term)}`;
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(event);
    }, true);

    updateCartCounts();
    return true;
  }

  window.scentivityProductPageOpenMenu = openMenu;
  window.scentivityProductPageCloseMenu = closeMenu;
  window.scentivityProductPageToggleMenu = toggleMenu;
  window.scentivityCloseHeaderMenu = closeMenu;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireMenu, { once: true });
  } else {
    wireMenu();
  }

  window.addEventListener('load', () => {
    wireMenu();
    updateCartCounts();
  }, { once: true });
})();
