// SCENTIVITY_PRODUCT_PAGE_RIGHT_SIDE_BLANK_CLICK_FIX_20260608


// RIGHT-SIDE BLANK CLICK FIX for product page
(function scentivityProductPageBlankClickFix() {
  const safeInteractiveSelector = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    'label',
    '[role="button"]',
    '.product-page-detail',
    '.product-detail-section',
    '.related-product-card'
  ].join(',');

  document.addEventListener('click', event => {
    if (event.target.closest(safeInteractiveSelector)) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);
})();


const CART_STORAGE_KEY = 'scentivityCartV1';
const DATA_URL = 'data/products.json';

const productPageContent = document.querySelector('#productPageContent');
const cartCount = document.querySelector('#cartCount');

let products = [];
let customerReviews = [];

function cleanText(value = '') {
  return String(value ?? '').replace(/[<>]/g, '').trim();
}

function slugify(value = '') {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeImagePath(path) {
  if (!path) return 'assets/products/velvet-rose.svg';
  return path.startsWith('/') ? path.slice(1) : path;
}

function parseGHSPrice(price = '') {
  const match = String(price).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function productRating(product = {}) {
  const value = Number(product.rating || product.averageRating || product.stars || 4.8);
  return Number.isFinite(value) ? Math.max(1, Math.min(5, value)) : 4.8;
}

function productReviewCount(product = {}) {
  const value = Number(product.reviewCount || product.reviewsCount || product.numberOfReviews || 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function productPurchaseCount(product = {}) {
  const value = Number(product.purchaseCount || product.numberPurchased || product.purchases || product.soldCount || 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function productAvailableQuantity(product = {}) {
  const value = Number(product.availableQuantity || product.stockQuantity || product.quantityAvailable || product.stock || 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function ratingStars(rating = 5) {
  const rounded = Math.max(1, Math.min(5, Math.round(Number(rating || 5))));
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
}

function formatCompactCount(value = 0) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace('.0', '')}k`;
  return String(Math.round(number));
}

function formatGHS(amount) {
  return `GH₵${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function isProductPublished(product = {}) {
  return product.showOnWebsite !== false && product.hideFromWebsite !== true && product.hidden !== true;
}

function getMainCategory(product = {}) {
  return cleanText(product.mainCategory || product.collection || 'Scentivity');
}

function getSubCategory(product = {}) {
  return cleanText(product.subCategory || product.category || 'Body Care');
}

function makeProductKey(product, index) {
  return slugify(`${product.name || 'product'}-${product.size || ''}-${product.price || ''}-${index}`) || `product-${index}`;
}

function enrichProducts(list = []) {
  return list.map((product, index) => ({
    ...product,
    _key: product.id || product.slug || makeProductKey(product, index),
    slug: product.slug || slugify(product.name || product.id || makeProductKey(product, index)),
    _unitPrice: parseGHSPrice(product.price),
    rating: product.rating ?? product.averageRating ?? 4.8,
    reviewCount: product.reviewCount ?? product.reviewsCount ?? product.numberOfReviews ?? 0,
    purchaseCount: product.purchaseCount ?? product.numberPurchased ?? product.purchases ?? product.soldCount ?? 0,
    availableQuantity: product.availableQuantity ?? product.stockQuantity ?? product.quantityAvailable ?? product.stock ?? 0,
    productDetails: product.productDetails || product.description || product.details || product.notes || '',
    fragranceNotes: product.fragranceNotes || product.scentNotes || product.notes || '',
    ingredients: product.ingredients || '',
    showOnWebsite: product.showOnWebsite !== false
  }));
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    key: cleanText(params.get('product') || params.get('id') || params.get('key') || ''),
    slug: cleanText(params.get('slug') || ''),
    name: cleanText(params.get('name') || '')
  };
}

function findProduct() {
  const query = getQueryParams();
  const nameSlug = slugify(query.name);
  return products.find(product =>
    product._key === query.key ||
    product.id === query.key ||
    product.slug === query.key ||
    product.slug === query.slug ||
    slugify(product.name || '') === query.slug ||
    (nameSlug && slugify(product.name || '') === nameSlug)
  );
}

function productPageUrl(product = {}) {
  const key = cleanText(product._key || product.id || product.slug || '');
  const slug = cleanText(product.slug || slugify(product.name || key));
  const name = cleanText(product.name || '');
  return `product.html?product=${encodeURIComponent(key)}&slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
}

function loadCart() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = JSON.parse(stored || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = loadCart();
  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (cartCount) cartCount.textContent = String(count);
}

function productSnapshot(product) {
  return {
    key: product._key,
    itemType: 'product',
    name: cleanText(product.name || 'Untitled product'),
    brand: cleanText(product.brand || 'Scentivity'),
    mainCategory: getMainCategory(product),
    subCategory: getSubCategory(product),
    size: cleanText(product.size || ''),
    priceText: cleanText(product.price || 'Price on request'),
    unitPrice: Number(product._unitPrice || parseGHSPrice(product.price)),
    image: normalizeImagePath(product.image),
    availableQuantity: productAvailableQuantity(product),
    rating: productRating(product)
  };
}

function addToCart(productKey, quantity = 1) {
  const product = products.find(item => item._key === productKey || item.id === productKey || item.slug === productKey);
  if (!product) return;
  if (product.available === false) {
    alert('This product is currently out of stock.');
    return;
  }

  const desiredQty = Math.max(1, Number(quantity || 1));
  const stock = productAvailableQuantity(product);
  const cart = loadCart();
  const existing = cart.find(item => item.key === product._key);
  const currentQty = existing ? Number(existing.quantity || 0) : 0;
  const addQty = stock > 0 ? Math.max(0, Math.min(desiredQty, stock - currentQty)) : desiredQty;

  if (stock > 0 && addQty <= 0) {
    alert(`Only ${stock} of this product is currently available.`);
    return;
  }

  if (existing) {
    existing.quantity += addQty;
  } else {
    cart.push({ ...productSnapshot(product), quantity: addQty });
  }

  saveCart(cart);
  const added = document.querySelector('#productPageAddToCart');
  if (added) {
    const original = added.textContent;
    added.textContent = 'Added to Cart';
    window.setTimeout(() => { added.textContent = original; }, 1300);
  }
}

function ratingSnapshotHtml(product = {}) {
  const reviews = Math.max(productReviewCount(product), 1);
  const rating = productRating(product);
  const five = Math.round(reviews * Math.min(0.85, rating / 5 * 0.9));
  const four = Math.round(reviews * 0.09);
  const three = Math.round(reviews * 0.03);
  const two = Math.round(reviews * 0.015);
  const one = Math.max(0, reviews - five - four - three - two);
  const rows = [['5 stars', five], ['4 stars', four], ['3 stars', three], ['2 stars', two], ['1 star', one]];
  const max = Math.max(...rows.map(row => row[1]), 1);
  return `
    <div class="rating-snapshot">
      ${rows.map(([label, count]) => `
        <div class="rating-row">
          <span>${label}</span>
          <b><i style="width:${Math.max(4, (count / max) * 100)}%"></i></b>
          <em>${count}</em>
        </div>
      `).join('')}
    </div>
  `;
}

function approvedReviewsForProduct(product = {}) {
  const productName = cleanText(product.name || '').toLowerCase();
  return (customerReviews || [])
    .filter(review => review && (review.approved === true || String(review.approved || '').toLowerCase() === 'true' || String(review.status || '').toLowerCase() === 'approved'))
    .filter(review => {
      const purchased = cleanText(review.productsPurchased || review.product || review.products || '').toLowerCase();
      return !purchased || !productName || purchased.includes(productName);
    })
    .slice(0, 4);
}

function relatedProductsHtml(currentKey = '') {
  const otherProducts = products
    .filter(product => isProductPublished(product) && product._key !== currentKey)
    .slice(0, 4);

  if (!otherProducts.length) {
    return '<p class="cart-small-note">More products will be added soon.</p>';
  }

  return `
    <div class="related-products-grid">
      ${otherProducts.map(product => `
        <a class="related-product-card" href="${productPageUrl(product)}">
          <img src="${normalizeImagePath(product.image)}" alt="${cleanText(product.name || 'Product')}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
          <strong>${cleanText(product.name || 'Scentivity product')}</strong>
          <span>${cleanText(product.price || 'Price on request')}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function renderProductPage() {
  const product = findProduct();

  if (!product || !isProductPublished(product)) {
    productPageContent.innerHTML = `
      <section class="product-unavailable">
        <h1>Product unavailable</h1>
        <p>This product is not currently available on the website.</p>
        <a class="btn primary" href="index.html#products">Back to shop</a>
      </section>
    `;
    document.title = 'Product unavailable | Scentivity';
    return;
  }

  const name = cleanText(product.name || 'Scentivity product');
  const brand = cleanText(product.brand || 'Scentivity');
  const mainCategory = getMainCategory(product);
  const subCategory = getSubCategory(product);
  const price = cleanText(product.price || 'Price on request');
  const size = cleanText(product.size || '');
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const rating = productRating(product);
  const reviewCount = productReviewCount(product);
  const bought = productPurchaseCount(product);
  const stock = productAvailableQuantity(product);
  const details = cleanText(product.productDetails || product.description || product.details || product.notes || 'Sweet, elegant scent selected by Scentivity.');
  const notes = cleanText(product.fragranceNotes || product.scentNotes || product.notes || 'Add fragrance notes in the admin dashboard.');
  const ingredients = cleanText(product.ingredients || 'Ingredients/details may vary by batch. Please check product packaging.');
  const reviews = approvedReviewsForProduct(product);

  document.title = `${name} | Scentivity`;

  productPageContent.innerHTML = `
    <section class="product-page-detail">
      <div class="product-page-gallery">
        <img src="${image}" alt="${name}" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
      </div>
      <div class="product-page-summary">
        <div class="product-tags">
          <span>${brand}</span>
          <span>${mainCategory}</span>
          <span>${subCategory}</span>
          ${size ? `<span>${size}</span>` : ''}
        </div>
        <h1>${name}</h1>
        <div class="product-detail-rating-line">
          <span>${ratingStars(rating)}</span>
          <b>${rating.toFixed(1)}</b>
          ${reviewCount ? `<em>${formatCompactCount(reviewCount)} reviews</em>` : '<em>No reviews yet</em>'}
          ${bought ? `<em>${formatCompactCount(bought)} bought</em>` : ''}
        </div>
        <strong class="product-detail-price">${price}</strong>
        <p class="stock-note">${product.available === false ? 'Currently out of stock' : (stock ? `${stock} available` : 'Available')}</p>
        <div class="product-detail-actions">
          <div class="detail-qty-control" aria-label="Quantity selector">
            <button type="button" id="qtyMinus" aria-label="Decrease quantity">−</button>
            <b id="qtyValue">1</b>
            <button type="button" id="qtyPlus" aria-label="Increase quantity">+</button>
          </div>
          ${product.available !== false
            ? `<button class="btn primary" id="productPageAddToCart" type="button">Add to Cart</button>`
            : `<button class="btn ghost" type="button" disabled>Currently out of stock</button>`
          }
        </div>
        <section class="product-detail-section">
          <h2>Fragrance / Description</h2>
          <p>${notes}</p>
        </section>
        <section class="product-detail-section">
          <h2>Overview / Product information</h2>
          <p>${details}</p>
        </section>
        <section class="product-detail-section">
          <h2>Ingredients</h2>
          <p>${ingredients}</p>
        </section>
      </div>
    </section>

    <section class="product-detail-section product-detail-reviews">
      <h2>Reviews / Rating snapshot</h2>
      <div class="overall-rating-box">
        <strong>${rating.toFixed(1)}</strong>
        <span>${ratingStars(rating)}</span>
        <em>${formatCompactCount(reviewCount)} reviews</em>
      </div>
      ${ratingSnapshotHtml(product)}
      <div class="review-list">
        ${reviews.length
          ? reviews.map(review => `
              <article>
                <span>${ratingStars(Number(review.rating || 5))}</span>
                <h3>${cleanText(review.title || review.name || 'Scentivity customer')}</h3>
                <small>${cleanText(review.name || 'Verified customer')}</small>
                ${cleanText(review.productsPurchased || '') ? `<small class="review-product">Purchased: ${cleanText(review.productsPurchased)}</small>` : ''}
                <p>${cleanText(review.message || review.feedback || review.review || '')}</p>
              </article>
            `).join('')
          : `<p class="cart-small-note">Approved customer reviews for this product will appear here.</p>`
        }
      </div>
    </section>

    <section class="product-detail-section">
      <h2>Other available products</h2>
      ${relatedProductsHtml(product._key)}
    </section>
  `;

  let quantity = 1;
  const maxQty = stock || 99;
  const qtyValue = document.querySelector('#qtyValue');
  const setQty = value => {
    quantity = Math.max(1, Math.min(maxQty, value));
    qtyValue.textContent = String(quantity);
  };
  document.querySelector('#qtyMinus')?.addEventListener('click', () => setQty(quantity - 1));
  document.querySelector('#qtyPlus')?.addEventListener('click', () => setQty(quantity + 1));
  document.querySelector('#productPageAddToCart')?.addEventListener('click', () => addToCart(product._key, quantity));
}

async function initProductPage() {
  updateCartCount();
  document.querySelectorAll('[data-home-logo], .brand').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.location.href = 'index.html?home=' + Date.now();
    });
  });

  try {
    const response = await fetch(`${DATA_URL}?v=${Date.now()}`);
    if (!response.ok) throw new Error('Could not load product data.');
    const data = await response.json();
    products = enrichProducts(data.products || []);
    customerReviews = data.customerReviews || [];
    renderProductPage();
  } catch (error) {
    console.error(error);
    productPageContent.innerHTML = `
      <section class="product-unavailable">
        <h1>Product unavailable</h1>
        <p>Product details could not be loaded. Please go back to the shop and try again.</p>
        <a class="btn primary" href="index.html#products">Back to shop</a>
      </section>
    `;
  }
}

initProductPage();
