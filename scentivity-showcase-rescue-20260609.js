
(function scentivityShowcaseRescue() {
  const DATA_URL = 'data/products.json';
  function clean(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }
  function slugify(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function productKey(product, index) {
    return clean(product.id || product._key || product.slug || `${slugify(product.name || 'product')}-${index}`);
  }
  function productPageUrl(product, index) {
    const key = productKey(product, index);
    const slug = clean(product.slug || slugify(product.name || key));
    const name = clean(product.name || '');
    return `product.html?product=${encodeURIComponent(key)}&slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
  }
  function slideHtml(product, index, total) {
    const key = productKey(product, index);
    const name = clean(product.name || 'Scentivity product');
    const brand = clean(product.brand || 'Scentivity');
    const price = clean(product.price || (product.available === false ? 'Coming soon' : 'Price on request'));
    const image = clean(product.image || 'assets/scentivity-logo-fused.png');
    const available = product.available !== false;
    const rating = Number(product.rating || 4.8);
    const reviews = Number(product.reviewCount || 0);
    const bought = Number(product.purchaseCount || 0);
    return `
      <article class="showcase-slide ${index === 0 ? 'active' : ''} simplified-showcase-slide product-click-card" data-product-key="${key}" data-product-url="${productPageUrl(product, index)}" tabindex="0" aria-label="View details for ${name}">
        <div class="showcase-image-wrap">
          <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
          <span class="showcase-badge ${available ? 'available' : 'soon'}">${available ? 'Available now' : 'Coming soon'}</span>
        </div>
        <div class="showcase-copy">
          <p class="eyebrow">${available ? 'Available now' : 'Coming soon'} • ${index + 1} of ${total}</p>
          <h3>${name}</h3>
          <div class="compact-product-meta showcase-quick-meta">
            <span class="star-rating-symbol">★</span>
            <span>${Number.isFinite(rating) ? rating.toFixed(1) : '4.8'}</span>
            ${reviews ? `<span>| ${reviews} reviews</span>` : ''}
            ${bought ? `<span>| ${bought} bought</span>` : ''}
          </div>
          <div class="showcase-bottom">
            <strong>${price}</strong>
            ${available ? `<button class="btn primary add-to-cart" type="button" data-product-key="${key}">Add to Cart</button>` : `<button class="btn ghost" type="button" disabled>Coming Soon</button>`}
          </div>
        </div>
      </article>
    `;
  }
  async function rescueShowcase() {
    const track = document.querySelector('#homepageProductSlides');
    if (!track) return;
    const hasRealSlide = track.querySelector('.showcase-slide img');
    if (hasRealSlide && !track.textContent.includes('Loading Scentivity products')) return;
    try {
      const response = await fetch(DATA_URL, { cache: 'no-cache' });
      const data = await response.json();
      const products = Array.isArray(data.products) ? data.products.filter(p => p && p.showOnWebsite !== false && p.hidden !== true) : [];
      const available = products.filter(p => p.available !== false).slice(0, 8);
      const incoming = products.filter(p => p.available === false).slice(0, 4);
      const slides = [...available, ...incoming].slice(0, 10);
      if (!slides.length) return;
      track.innerHTML = slides.map((product, index) => slideHtml(product, index, slides.length)).join('');
      const dots = document.querySelector('#homepageProductDots');
      if (dots) {
        dots.innerHTML = slides.map((_, index) => `<button type="button" class="showcase-dot ${index === 0 ? 'active' : ''}" data-slide-index="${index}" aria-label="Show slide ${index + 1}"></button>`).join('');
      }
    } catch (error) {
      console.warn('Scentivity showcase rescue could not load products:', error);
    }
  }
  document.addEventListener('click', event => {
    const card = event.target.closest('#homepageProductSlides .product-click-card');
    if (!card || event.target.closest('button, a')) return;
    const url = card.dataset.productUrl;
    if (url) window.location.href = url;
  }, true);
  document.addEventListener('DOMContentLoaded', () => window.setTimeout(rescueShowcase, 450));
  window.addEventListener('load', () => window.setTimeout(rescueShowcase, 700));
})();
