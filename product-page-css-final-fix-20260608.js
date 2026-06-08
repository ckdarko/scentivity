// SCENTIVITY_PRODUCT_PAGE_CSS_FINAL_FIX_20260608
const CART_STORAGE_KEY = 'scentivityCartV1';
const EMBEDDED_PRODUCTS = [{"name": "Victoria's Secret Pure Wonder Fragrance Mist", "brand": "Victoria's Secret", "mainCategory": "Victoria's Secret Collection", "subCategory": "Fine Fragrance Mist", "price": "GH₵250", "image": "assets/products/citrus-bloom.svg", "notes": "A bright, feminine mist profile for daily wear. Add exact notes and stock details in the admin dashboard.", "size": "236 mL", "available": true, "paymentLink": "", "isDealOfWeek": false, "_key": "victoria-s-secret-pure-wonder-fragrance-mist-0", "showOnWebsite": true, "rating": 4.9, "reviewCount": 20, "purchaseCount": 8, "availableQuantity": 10, "productDetails": "A bright, feminine mist profile for daily wear. Add exact notes and stock details in the admin dashboard.", "fragranceNotes": "A bright, feminine mist profile for daily wear. Add exact notes and stock details in the admin dashboard.", "ingredients": "Ingredients/details may vary by batch. Please check product packaging.", "slug": "victoria-s-secret-pure-wonder-fragrance-mist"}, {"name": "Bath & Body Works Body Cream", "brand": "Bath & Body Works", "mainCategory": "Bath & Body Works Collection", "subCategory": "Body Lotions and Cream", "price": "GH₵220", "image": "assets/products/velvet-rose.svg", "notes": "Moisturizing body cream options from popular sweet, floral, fresh, and warm scent families.", "size": "226 g / 8 oz", "available": true, "paymentLink": "", "isDealOfWeek": false, "_key": "bath-and-body-works-body-cream-1", "showOnWebsite": true, "rating": 4.8, "reviewCount": 29, "purchaseCount": 13, "availableQuantity": 11, "productDetails": "Moisturizing body cream options from popular sweet, floral, fresh, and warm scent families.", "fragranceNotes": "Moisturizing body cream options from popular sweet, floral, fresh, and warm scent families.", "ingredients": "Ingredients/details may vary by batch. Please check product packaging.", "slug": "bath-and-body-works-body-cream"}, {"name": "Sweet Signature Eau de Parfum", "brand": "Scentivity", "mainCategory": "Designer and Luxury Fragrances", "subCategory": "Home Fragrances", "price": "GH₵450", "image": "assets/products/amber-noir.svg", "notes": "A polished sweet scent profile with soft florals, vanilla, amber, and clean musk.", "size": "50 mL", "available": true, "paymentLink": "", "isDealOfWeek": false, "_key": "sweet-signature-eau-de-parfum-2", "showOnWebsite": true, "rating": 4.9, "reviewCount": 38, "purchaseCount": 18, "availableQuantity": 12, "productDetails": "A polished sweet scent profile with soft florals, vanilla, amber, and clean musk.", "fragranceNotes": "A polished sweet scent profile with soft florals, vanilla, amber, and clean musk.", "ingredients": "Ingredients/details may vary by batch. Please check product packaging.", "slug": "sweet-signature-eau-de-parfum"}, {"name": "Men’s Fresh Body Spray", "brand": "Scentivity", "mainCategory": "Designer and Luxury Fragrances", "subCategory": "Men's Body Care", "price": "GH₵180", "image": "assets/products/oud-muse.svg", "notes": "Fresh, confident masculine scent profile for everyday use and gifting.", "size": "100 mL", "available": true, "paymentLink": "", "isDealOfWeek": false, "_key": "men-s-fresh-body-spray-3", "showOnWebsite": true, "rating": 4.8, "reviewCount": 47, "purchaseCount": 23, "availableQuantity": 13, "productDetails": "Fresh, confident masculine scent profile for everyday use and gifting.", "fragranceNotes": "Fresh, confident masculine scent profile for everyday use and gifting.", "ingredients": "Ingredients/details may vary by batch. Please check product packaging.", "slug": "men-s-fresh-body-spray"}, {"name": "Scented 3-Wick Candle", "brand": "Scentivity", "mainCategory": "Bath & Body Works Collection", "subCategory": "Scented Candles", "price": "GH₵300", "image": "assets/products/velvet-rose.svg", "notes": "Home fragrance candle options for bedrooms, bathrooms, gifts, and cozy spaces.", "size": "3-wick candle", "available": true, "paymentLink": "", "isDealOfWeek": false, "_key": "scented-3-wick-candle-4", "showOnWebsite": true, "rating": 4.9, "reviewCount": 56, "purchaseCount": 28, "availableQuantity": 14, "productDetails": "Home fragrance candle options for bedrooms, bathrooms, gifts, and cozy spaces.", "fragranceNotes": "Home fragrance candle options for bedrooms, bathrooms, gifts, and cozy spaces.", "ingredients": "Ingredients/details may vary by batch. Please check product packaging.", "slug": "scented-3-wick-candle"}, {"name": "Pocket Hand Sanitizer", "brand": "Scentivity", "mainCategory": "Bath & Body Works Collection", "subCategory": "Hand Sanitizers", "price": "GH₵45", "image": "assets/products/citrus-bloom.svg", "notes": "Portable scented sanitizer options for bags, cars, school, work, and gifting.", "size": "Travel size", "available": true, "paymentLink": "", "isDealOfWeek": false, "_key": "pocket-hand-sanitizer-5", "showOnWebsite": true, "rating": 4.8, "reviewCount": 65, "purchaseCount": 33, "availableQuantity": 15, "productDetails": "Portable scented sanitizer options for bags, cars, school, work, and gifting.", "fragranceNotes": "Portable scented sanitizer options for bags, cars, school, work, and gifting.", "ingredients": "Ingredients/details may vary by batch. Please check product packaging.", "slug": "pocket-hand-sanitizer"}];
const EMBEDDED_CUSTOMER_REVIEWS = [];
const EMBEDDED_PENDING_FEEDBACK = [];

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

function enrichProducts(items = []) {
  return items.map((product, index) => ({
    ...product,
    _key: cleanText(product._key || product.id || `${toSlug(product.name || 'product')}-${index}`),
    slug: cleanText(product.slug || toSlug(product.name || product._key || product.id || `product-${index}`)),
    _unitPrice: parseGHSPrice(product.price)
  }));
}

function isProductPublished(product = {}) {
  return product.showOnWebsite !== false &&
    product.hideFromWebsite !== true &&
    product.hidden !== true;
}

function getUrlData() {
  const params = new URLSearchParams(window.location.search);
  return {
    product: cleanText(params.get('product') || params.get('id') || params.get('p') || ''),
    slug: cleanText(params.get('slug') || ''),
    name: cleanText(params.get('name') || '')
  };
}

function productRating(product = {}) {
  const value = Number(product.rating || product.averageRating || product.stars || 4.8);
  return Number.isFinite(value) ? Math.max(1, Math.min(5, value)) : 4.8;
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

function formatCompactCount(value = 0) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace('.0', '')}k`;
  return String(Math.round(number));
}

function ratingStars(rating = 5) {
  const rounded = Math.max(1, Math.min(5, Math.round(Number(rating || 5))));
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
}

function isApprovedReview(review = {}) {
  const value = review.approved ?? review.isApproved ?? review.showOnWebsite ?? review.published ?? review.status;
  if (value === true) return true;
  if (typeof value === 'string') {
    return ['true', 'yes', 'approved', 'publish', 'published', 'show'].includes(value.trim().toLowerCase());
  }
  return false;
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
  if (product.available === false) {
    alert('This product is currently out of stock.');
    return;
  }

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
  alert('Added to cart. Return to the shop to checkout.');
}

function findMatchingProduct(products, urlData) {
  const productKey = cleanText(urlData.product);
  const productSlug = toSlug(urlData.slug || productKey);
  const productNameSlug = toSlug(urlData.name);
  const keyWithoutIndex = productKey.replace(/-\d+$/, '');
  const keyWithoutIndexSlug = toSlug(keyWithoutIndex);

  const visible = products.filter(isProductPublished);

  const exact = visible.find(product =>
    cleanText(product._key) === productKey ||
    cleanText(product.id) === productKey ||
    cleanText(product.slug) === urlData.slug
  );
  if (exact) return exact;

  const slugMatch = visible.find(product => {
    const nameSlug = toSlug(product.name);
    const pSlug = toSlug(product.slug || product._key);
    const pKeySlug = toSlug(product._key);
    return (
      nameSlug === productSlug ||
      nameSlug === productNameSlug ||
      nameSlug === keyWithoutIndexSlug ||
      pSlug === productSlug ||
      pSlug === productNameSlug ||
      pKeySlug === productSlug ||
      pKeySlug === keyWithoutIndexSlug
    );
  });
  if (slugMatch) return slugMatch;

  const containsMatch = visible.find(product => {
    const nameSlug = toSlug(product.name);
    return productSlug && (productSlug.includes(nameSlug) || nameSlug.includes(productSlug) || nameSlug.includes(keyWithoutIndexSlug));
  });
  if (containsMatch) return containsMatch;

  return visible[0] || products[0] || null;
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
  const productName = cleanText(product.name || '').toLowerCase();
  const reviews = (customerReviews || [])
    .filter(review => review && isApprovedReview(review))
    .filter(review => {
      const purchased = cleanText(review.productsPurchased || review.product || review.products || '').toLowerCase();
      return !purchased || !productName || purchased.includes(productName);
    })
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
                ${cleanText(review.productsPurchased || '') ? `<small class="review-product">Purchased: ${cleanText(review.productsPurchased)}</small>` : ''}
                <p>${cleanText(review.message || review.feedback || review.review || '')}</p>
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
        <a class="related-product-card" href="product.html?product=${encodeURIComponent(product._key)}&slug=${encodeURIComponent(product.slug || toSlug(product.name))}&name=${encodeURIComponent(product.name || '')}">
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
  const details = cleanText(product.productDetails || product.description || product.details || product.notes || 'Sweet, elegant scent selected by Scentivity.');
  const notes = cleanText(product.fragranceNotes || product.scentNotes || product.notes || 'Add fragrance notes in the admin dashboard.');
  const ingredients = cleanText(product.ingredients || 'Ingredients information can be added in the admin dashboard.');
  const image = normalizeImagePath(product.image);

  document.title = `${name} | Scentivity`;

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
          <h3>Fragrance notes</h3>
          <p>${notes}</p>
        </section>
        <section class="product-detail-section">
          <h3>Description</h3>
          <p>${details}</p>
        </section>
        <section class="product-detail-section">
          <h3>Product information</h3>
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

  let products = enrichProducts(EMBEDDED_PRODUCTS);
  let reviews = [...EMBEDDED_CUSTOMER_REVIEWS, ...EMBEDDED_PENDING_FEEDBACK];

  try {
    const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const fetchedProducts = enrichProducts(Array.isArray(data.products) ? data.products : []);
      if (fetchedProducts.length) {
        const merged = new Map(products.map(product => [product._key, product]));
        fetchedProducts.forEach(product => merged.set(product._key, product));
        products = Array.from(merged.values());
      }
      if (Array.isArray(data.customerReviews)) reviews = [...reviews, ...data.customerReviews];
      if (Array.isArray(data.reviews)) reviews = [...reviews, ...data.reviews];
      if (Array.isArray(data.testimonials)) reviews = [...reviews, ...data.testimonials];
    }
  } catch (error) {
    console.warn('Using embedded product fallback:', error.message);
  }

  try {
    const pendingResponse = await fetch(`data/pending-feedback.json?v=${Date.now()}`, { cache: 'no-store' });
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      if (Array.isArray(pendingData.pendingFeedback)) reviews = [...reviews, ...pendingData.pendingFeedback];
    }
  } catch {}

  const product = findMatchingProduct(products, getUrlData());

  if (!product) {
    productPageContent.innerHTML = `
      <div class="empty-state">
        <h1>Product unavailable</h1>
        <p>No product information is available yet.</p>
        <a class="btn primary" href="index.html#products">Back to shop</a>
      </div>
    `;
    return;
  }

  renderProductPage(product, products, reviews);
}

initProductPage();
