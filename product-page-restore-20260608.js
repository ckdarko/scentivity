// SCENTIVITY_PRODUCT_PAGE_RESTORE_20260608
// SCENTIVITY_PRODUCT_PAGE_20260608
const CART_STORAGE_KEY = 'scentivityCartV1';
const productPageContent = document.querySelector('#productPageContent');
const cartCountTarget = document.querySelector('#productPageCartCount');

const cleanText = value => String(value ?? '').trim();

function toSlug(value = '') {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeImagePath(path = '') {
  const clean = cleanText(path);
  if (!clean) return 'assets/scentivity-logo-fused.png';
  if (/^(https?:)?\/\//i.test(clean) || clean.startsWith('data:')) return clean;
  return clean.replace(/^\/+/, '');
}

function parseGHSPrice(price = '') {
  const match = cleanText(price).replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function formatCompactCount(value = 0) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace('.0', '')}k`;
  return String(Math.round(number));
}

function enrichProducts(items = []) {
  return items.map((product, index) => ({
    ...product,
    _key: product._key || `${toSlug(product.name || 'product')}-${index}`,
    _unitPrice: parseGHSPrice(product.price)
  }));
}

function isProductPublished(product = {}) {
  return product.showOnWebsite !== false &&
    product.hideFromWebsite !== true &&
    product.hidden !== true;
}

function getProductKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return cleanText(params.get('product') || params.get('id') || params.get('p') || '');
}

function productRating(product = {}) {
  const value = Number(product.rating || product.averageRating || product.stars || 4.8);
  if (!Number.isFinite(value)) return 4.8;
  return Math.max(1, Math.min(5, value));
}

function productReviewCount(product = {}) {
  const value = Number(product.reviewCount || product.reviewsCount || product.numberOfReviews || 0);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function productPurchaseCount(product = {}) {
  const value = Number(product.purchaseCount || product.numberPurchased || product.purchases || product.soldCount || 0);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function productAvailableQuantity(product = {}) {
  const value = Number(product.availableQuantity || product.stockQuantity || product.quantityAvailable || product.stock || 0);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function ratingStars(rating = 5) {
  const rounded = Math.max(1, Math.min(5, Math.round(Number(rating || 5))));
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
}

function loadCart() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
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
  const total = loadCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (cartCountTarget) cartCountTarget.textContent = String(total);
}

function productSnapshot(product) {
  return {
    key: product._key,
    itemType: 'product',
    name: cleanText(product.name || 'Untitled product'),
    brand: cleanText(product.brand || 'Scentivity'),
    mainCategory: cleanText(product.mainCategory || ''),
    subCategory: cleanText(product.subCategory || ''),
    size: cleanText(product.size || ''),
    priceText: cleanText(product.price || 'Price on request'),
    unitPrice: Number(product._unitPrice || parseGHSPrice(product.price)),
    image: normalizeImagePath(product.image),
    availableQuantity: productAvailableQuantity(product),
    rating: productRating(product)
  };
}

function addToCart(product, quantity = 1) {
  const stock = productAvailableQuantity(product);
  const qty = Math.max(1, Number(quantity || 1));
  const cart = loadCart();
  const existing = cart.find(item => item.key === product._key);
  const currentQty = existing ? Number(existing.quantity || 0) : 0;
  const addQty = stock > 0 ? Math.max(0, Math.min(qty, stock - currentQty)) : qty;

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
  alert('Added to cart. You can return to the shop to checkout.');
}

function ratingSnapshotHtml(product = {}) {
  const rating = productRating(product);
  const reviews = Math.max(productReviewCount(product), 1);
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

function renderReviews(product = {}, customerReviews = []) {
  const reviews = (customerReviews || [])
    .filter(review => review && review.approved !== false)
    .slice(0, 4);

  return `
    <section class="product-detail-section product-detail-reviews">
      <h3>Reviews</h3>
      <div class="overall-rating-box">
        <strong>${productRating(product).toFixed(1)}</strong>
        <span>${ratingStars(productRating(product))}</span>
        <em>${formatCompactCount(productReviewCount(product))} reviews</em>
      </div>
      ${ratingSnapshotHtml(product)}
      <div class="review-list">
        ${reviews.length
          ? reviews.map(review => `
              <article>
                <span>${ratingStars(Number(review.rating || 5))}</span>
                <h4>${cleanText(review.title || review.name || 'Scentivity customer')}</h4>
                <small>${cleanText(review.name || 'Verified customer')}</small>
                <p>${cleanText(review.message || review.feedback || '')}</p>
              </article>
            `).join('')
          : `<p class="cart-small-note">Approved customer reviews for this product will appear here.</p>`
        }
      </div>
    </section>
  `;
}

function relatedProductsHtml(products = [], currentKey = '') {
  const others = products.filter(product => isProductPublished(product) && product._key !== currentKey).slice(0, 4);
  if (!others.length) return '<p class="cart-small-note">More products will be added soon.</p>';
  return `
    <div class="related-products-grid">
      ${others.map(product => `
        <a class="related-product-card" href="product.html?product=${encodeURIComponent(product._key)}">
          <img src="${normalizeImagePath(product.image)}" alt="${cleanText(product.name || 'Product')}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
          <strong>${cleanText(product.name || 'Scentivity product')}</strong>
          <span>${cleanText(product.price || 'Price on request')}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function renderProductPage(product, allProducts, customerReviews) {
  const name = cleanText(product.name || 'Scentivity product');
  const brand = cleanText(product.brand || 'Scentivity');
  const mainCategory = cleanText(product.mainCategory || '');
  const subCategory = cleanText(product.subCategory || '');
  const price = cleanText(product.price || 'Price on request');
  const size = cleanText(product.size || '');
  const stock = productAvailableQuantity(product);
  const rating = productRating(product);
  const reviews = productReviewCount(product);
  const purchased = productPurchaseCount(product);
  const details = cleanText(product.productDetails || product.description || product.details || product.notes || 'Sweet, elegant scent selected by Scentivity for everyday freshness, gifting, and memorable moments.');
  const notes = cleanText(product.fragranceNotes || product.scentNotes || product.notes || 'Add fragrance notes in the admin dashboard.');
  const ingredients = cleanText(product.ingredients || 'Ingredients information can be added in the admin dashboard.');
  const image = normalizeImagePath(product.image);

  productPageContent.innerHTML = `
    <article class="product-detail-layout product-page-detail">
      <div class="product-detail-media">
        <img src="${image}" alt="${name}" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
      </div>
      <div class="product-detail-main">
        <div class="product-tags">
          ${brand ? `<span>${brand}</span>` : ''}
          ${mainCategory ? `<span>${mainCategory}</span>` : ''}
          ${subCategory ? `<span>${subCategory}</span>` : ''}
          ${size ? `<span>${size}</span>` : ''}
        </div>
        <h1 id="productDetailTitle">${name}</h1>
        <div class="product-detail-rating-line">
          <span>${ratingStars(rating)}</span>
          <b>${rating.toFixed(1)}</b>
          ${reviews ? `<a href="#reviews">${formatCompactCount(reviews)} reviews</a>` : '<em>No reviews yet</em>'}
          ${purchased ? `<em>${formatCompactCount(purchased)} bought</em>` : ''}
        </div>
        <strong class="product-detail-price">${price}</strong>
        <p class="stock-note">${product.available === false ? 'Currently out of stock' : (stock ? `${stock} available` : 'Available')}</p>

        <div class="product-detail-actions">
          <div class="detail-qty-control">
            <button type="button" id="decreaseQty" aria-label="Decrease quantity">−</button>
            <b id="detailQty">1</b>
            <button type="button" id="increaseQty" aria-label="Increase quantity">+</button>
          </div>
          ${product.available !== false
            ? `<button class="btn primary" type="button" id="addProductPageToCart">Add to Cart</button>`
            : `<button class="btn ghost" type="button" disabled>Currently out of stock</button>`
          }
        </div>

        <section class="product-detail-section">
          <h3>Fragrance</h3>
          <p>${notes}</p>
        </section>
        <section class="product-detail-section">
          <h3>Overview</h3>
          <p>${details}</p>
        </section>
        <section class="product-detail-section">
          <h3>Ingredients</h3>
          <p>${ingredients}</p>
        </section>
      </div>
    </article>

    <div id="reviews">
      ${renderReviews(product, customerReviews)}
    </div>

    <section class="product-detail-section">
      <h3>Other available products</h3>
      ${relatedProductsHtml(allProducts, product._key)}
    </section>
  `;

  let qty = 1;
  const qtyTarget = document.querySelector('#detailQty');
  const maxQty = stock || 99;
  const setQty = value => {
    qty = Math.max(1, Math.min(maxQty, value));
    qtyTarget.textContent = String(qty);
  };

  document.querySelector('#decreaseQty')?.addEventListener('click', () => setQty(qty - 1));
  document.querySelector('#increaseQty')?.addEventListener('click', () => setQty(qty + 1));
  document.querySelector('#addProductPageToCart')?.addEventListener('click', () => addToCart(product, qty));
}

async function initProductPage() {
  updateCartCount();
  try {
    const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load product data.');
    const data = await response.json();
    const products = enrichProducts(Array.isArray(data.products) ? data.products : []);
    const key = getProductKeyFromUrl();
    const product = products.find(item => item._key === key || toSlug(item.name || '') === key);

    if (!product || !isProductPublished(product)) {
      productPageContent.innerHTML = `
        <div class="empty-state">
          <h1>Product unavailable</h1>
          <p>This product is currently unavailable or hidden from the website.</p>
          <a class="btn primary" href="index.html#products">Back to shop</a>
        </div>
      `;
      return;
    }

    renderProductPage(product, products, Array.isArray(data.customerReviews) ? data.customerReviews : []);
  } catch (error) {
    productPageContent.innerHTML = `
      <div class="empty-state">
        <h1>Could not load product</h1>
        <p>Please go back to the shop and try again.</p>
        <a class="btn primary" href="index.html#products">Back to shop</a>
      </div>
    `;
  }
}

initProductPage();
