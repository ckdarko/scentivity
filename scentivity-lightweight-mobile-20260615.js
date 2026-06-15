
// SCENTIVITY_LIGHTWEIGHT_MOBILE_BOOTSTRAP_20260615
(function () {
  const PLACEHOLDER = 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20600%20420%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%27%20x2%3D%271%27%3E%3Cstop%20stop-color%3D%27%23fff5fa%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ffe3ec%27%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%27p%27%20x1%3D%270%27%20x2%3D%271%27%3E%3Cstop%20stop-color%3D%27%23e0005b%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff8a8a%27%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27600%27%20height%3D%27420%27%20rx%3D%2732%27%20fill%3D%27url%28%23g%29%27%2F%3E%3Ccircle%20cx%3D%27300%27%20cy%3D%27200%27%20r%3D%27110%27%20fill%3D%27none%27%20stroke%3D%27url%28%23p%29%27%20stroke-width%3D%2710%27%20opacity%3D%27.65%27%2F%3E%3Cpath%20d%3D%27M325%2093c-50%2038-58%2074-12%20101%2039%2023%2032%2061-31%2096%27%20fill%3D%27none%27%20stroke%3D%27url%28%23p%29%27%20stroke-width%3D%2726%27%20stroke-linecap%3D%27round%27%2F%3E%3Ctext%20x%3D%27300%27%20y%3D%27332%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2730%27%20font-weight%3D%27700%27%20fill%3D%27%23e0005b%27%3EScentivity%3C%2Ftext%3E%3C%2Fsvg%3E';
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  function optimizeStaticImages(root) {
    (root || document).querySelectorAll('img').forEach((img, index) => {
      if (!img.hasAttribute('loading')) img.loading = index < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (!img.getAttribute('src') && img.dataset.src) img.src = PLACEHOLDER;
      if (!img.dataset.scentivitySafeError) {
        img.dataset.scentivitySafeError = 'true';
        img.addEventListener('error', () => {
          if (img.src && !img.src.endsWith('/' + PLACEHOLDER) && !img.src.endsWith(PLACEHOLDER)) img.src = PLACEHOLDER;
        }, { once: false });
      }
    });
  }

  function disableMobileVideo() {
    const section = document.querySelector('#homepageVideoSection');
    const video = document.querySelector('#homepageVideo');
    if (!video) return;
    video.preload = 'none';
    if (isMobile) {
      try { video.pause(); } catch {}
      video.removeAttribute('autoplay');
      video.querySelectorAll('source').forEach(source => {
        if (source.getAttribute('src')) {
          source.dataset.src = source.getAttribute('src');
          source.removeAttribute('src');
        }
      });
      section?.classList.add('mobile-video-disabled');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    disableMobileVideo();
    optimizeStaticImages(document);
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === 1) optimizeStaticImages(node);
      }));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
})();
