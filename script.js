// SCENTIVITY_LIMITED_DEALWEEK_REVIEWS_UPDATE_20260601
// SCENTIVITY_PERFUMEGH_INSPIRED_RESPONSIVE_UPDATE_20260601
// SCENTIVITY_COMBO_DEALS_UPDATE_20260601
// SCENTIVITY_DELIVERY_FEE_NOTE_UPDATE_20260601
// SCENTIVITY_CACHEPROOF_JS_FIX_20260601
const MAIN_CATEGORY_VS = "Victoria's Secret Collection";
const MAIN_CATEGORY_BBW = 'Bath & Body Works Collection';
const MAIN_CATEGORY_DESIGNER = 'Designer and Luxury Fragrances';

const SCENTIVITY_SUBCATEGORIES = [
  "Body Care",
  "Body Lotions and Cream",
  "Fine Fragrance Mist",
  "Body Washes & Shower Gels",
  "Hand Sanitizers",
  "Men's Body Care",
  "Home Fragrances",
  "Scented Candles",
  "Room Sprays",
  "Car Fragrances",
  "Wallflower Refills & Plugs"
];

const productTaxonomy = [
  { name: MAIN_CATEGORY_VS, subcategories: SCENTIVITY_SUBCATEGORIES },
  { name: MAIN_CATEGORY_BBW, subcategories: SCENTIVITY_SUBCATEGORIES },
  { name: MAIN_CATEGORY_DESIGNER, subcategories: SCENTIVITY_SUBCATEGORIES }
];

const fallbackProducts = [
  {
    name: "Victoria's Secret Pure Wonder Fragrance Mist",
    brand: "Victoria's Secret",
    mainCategory: MAIN_CATEGORY_VS,
    subCategory: 'Fine Fragrance Mist',
    price: 'GH₵250',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'A bright, feminine mist profile for daily wear. Add exact notes and stock details in the admin dashboard.',
    size: '236 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Bath & Body Works Body Cream',
    brand: 'Bath & Body Works',
    mainCategory: MAIN_CATEGORY_BBW,
    subCategory: 'Body Lotions and Cream',
    price: 'GH₵220',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Moisturizing body cream options from popular sweet, floral, fresh, and warm scent families.',
    size: '226 g / 8 oz',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Sweet Signature Eau de Parfum',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_DESIGNER,
    subCategory: 'Home Fragrances',
    price: 'GH₵450',
    image: 'assets/products/amber-noir.svg',
    notes: 'A polished sweet scent profile with soft florals, vanilla, amber, and clean musk.',
    size: '50 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Men’s Fresh Body Spray',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_DESIGNER,
    subCategory: 'Men’s Fragrance',
    price: 'GH₵180',
    image: 'assets/products/oud-muse.svg',
    notes: 'Fresh, confident masculine scent profile for everyday use and gifting.',
    size: '100 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Scented 3-Wick Candle',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_BBW,
    subCategory: 'Scented Candles',
    price: 'GH₵300',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Home fragrance candle options for bedrooms, bathrooms, gifts, and cozy spaces.',
    size: '3-wick candle',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Pocket Hand Sanitizer',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_BBW,
    subCategory: 'Hand Sanitizers',
    price: 'GH₵45',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'Portable scented sanitizer options for bags, cars, school, work, and gifting.',
    size: 'Travel size',
    available: true,
    paymentLink: ''
  }
];


const fallbackCombos = [
  {
    name: 'Sweet Starter Combo',
    description: 'A simple pair for everyday freshness: one fragrance mist and one body care item.',
    includedItems: 'Fragrance mist + body lotion or cream',
    originalPrice: 'GH₵470',
    comboPrice: 'GH₵430',
    discountText: 'Save GH₵40',
    image: 'assets/products/velvet-rose.svg',
    available: true
  },
  {
    name: 'Home & Body Refresh Combo',
    description: 'A refreshing bundle for personal care and a sweet-smelling space.',
    includedItems: 'Body care item + hand sanitizer + room spray or candle',
    originalPrice: 'GH₵565',
    comboPrice: 'GH₵510',
    discountText: 'Save GH₵55',
    image: 'assets/products/citrus-bloom.svg',
    available: true
  },
  {
    name: 'Luxury Gift Combo',
    description: 'A gift-ready set for birthdays, surprises, appreciation packages, and special occasions.',
    includedItems: 'Designer fragrance + fragrance mist/body care add-on',
    originalPrice: 'GH₵700',
    comboPrice: 'GH₵630',
    discountText: 'Save GH₵70',
    image: 'assets/products/amber-noir.svg',
    available: true
  }
];


let products = [];
let combos = [];
let activeMainCategory = 'all';
let activeSubCategory = 'all';
let activeSearchTerm = '';
let showcaseIndex = 0;
let showcaseTimer = null;
let cart = loadCart();

const SCENTIVITY_EMAIL = 'scentivitygh@gmail.com';
const SCENTIVITY_WHATSAPP = '233534584470';
const CART_STORAGE_KEY = 'scentivityCartV1';
const CHECKOUT_PAYMENT_METHOD_CARD = 'card';
const CHECKOUT_PAYMENT_METHOD_MOMO = 'momo';
const CHECKOUT_PAYMENT_METHOD_PICKUP = 'pay_on_pickup';

function buildEmailLink(subject, body) {
  return `mailto:${SCENTIVITY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildWhatsAppLink(message) {
  return `https://wa.me/${SCENTIVITY_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

const productGrid = document.querySelector('#productGrid');
const comboGrid = document.querySelector('#comboGrid');
const mainCategoryFilters = document.querySelector('#mainCategoryFilters');
const subCategoryFilters = document.querySelector('#subCategoryFilters');
const productSearch = document.querySelector('#productSearch');
const navSearchButton = document.querySelector('#navSearchButton');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTop = document.querySelector('#backToTop');
const cartToggle = document.querySelector('#cartToggle');
const cartToggleFooter = document.querySelector('#cartToggleFooter');
const cartCount = document.querySelector('#cartCount');
const cartCountFooter = document.querySelector('#cartCountFooter');
const cartOverlay = document.querySelector('#cartOverlay');
const cartDrawer = document.querySelector('#cartDrawer');
const closeCartButton = document.querySelector('#closeCart');
const cartItemsContainer = document.querySelector('#cartItems');
const cartEmptyMessage = document.querySelector('#cartEmptyMessage');
const cartSubtotal = document.querySelector('#cartSubtotal');
const cartTotal = document.querySelector('#cartTotal');
const checkoutForm = document.querySelector('#checkoutForm');
const fulfillmentRadios = document.querySelectorAll('input[name="fulfillment"]');
const deliveryFields = document.querySelector('#deliveryFields');
const pickupFields = document.querySelector('#pickupFields');
const paymentMethodSelect = document.querySelector('#paymentMethod');
const paymentStatus = document.querySelector('#paymentStatus');
const emailRequestForm = document.querySelector('#emailRequestForm');
const homepageProductSlides = document.querySelector('#homepageProductSlides');
const homepageProductDots = document.querySelector('#homepageProductDots');
const showcasePrev = document.querySelector('#showcasePrev');
const showcaseNext = document.querySelector('#showcaseNext');

function cleanText(value = '') {
  return String(value).replace(/[<>]/g, '').trim();
}

function slugify(value = '') {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeImagePath(path) {
  if (!path) return 'assets/products/velvet-rose.svg';
  return path.startsWith('/') ? path.slice(1) : path;
}

function normalizeMainCategory(product = {}) {
  const main = cleanText(product.mainCategory || product.category || '').toLowerCase();
  const brand = cleanText(product.brand || '').toLowerCase();
  const combined = `${main} ${brand}`;

  if (combined.includes('victoria')) return MAIN_CATEGORY_VS;
  if (combined.includes('bath') || main.includes('body care') || main.includes('home fragrance')) return MAIN_CATEGORY_BBW;
  return MAIN_CATEGORY_DESIGNER;
}

function legacyMainCategory(product) {
  return normalizeMainCategory(product);
}

function getMainCategory(product) {
  return normalizeMainCategory(product);
}

function normalizeSubCategory(value = '') {
  const raw = cleanText(value || '');
  const key = raw.toLowerCase().replace(/[’']/g, "'");
  const map = {
    'body lotion & cream': 'Body Lotions and Cream',
    'body lotion and cream': 'Body Lotions and Cream',
    'body lotions and cream': 'Body Lotions and Cream',
    'body wash & shower gel': 'Body Washes & Shower Gels',
    'body washes & shower gels': 'Body Washes & Shower Gels',
    'candles': 'Scented Candles',
    'scented candles': 'Scented Candles',
    'wallflowers': 'Wallflower Refills & Plugs',
    'wallflower': 'Wallflower Refills & Plugs',
    'wallflower refills & plugs': 'Wallflower Refills & Plugs',
    'men’s body care': "Men's Body Care",
    "men's body care": "Men's Body Care",
    'home fragrance': 'Home Fragrances',
    'home fragrances': 'Home Fragrances',
    'body mist': 'Fine Fragrance Mist',
    'fragrance mist': 'Fine Fragrance Mist',
    'fine fragrance mist': 'Fine Fragrance Mist',
    'hand sanitizers': 'Hand Sanitizers',
    'hand sanitizer': 'Hand Sanitizers',
    'room spray': 'Room Sprays',
    'room sprays': 'Room Sprays',
    'car fragrance': 'Car Fragrances',
    'car fragrances': 'Car Fragrances',
    'body care': 'Body Care'
  };
  return map[key] || raw || 'Body Care';
}

function getSubCategory(product) {
  return normalizeSubCategory(product.subCategory || product.category || 'Body Care');
}

function parseGHSPrice(price = '') {
  const match = String(price).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function formatGHS(amount) {
  return `GH₵${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function makeProductKey(product, index) {
  return slugify(`${product.name || 'product'}-${product.size || ''}-${product.price || ''}-${index}`) || `product-${index}`;
}

function enrichProducts(list) {
  return list.map((product, index) => ({
    ...product,
    _key: product.id || product.slug || makeProductKey(product, index),
    _unitPrice: parseGHSPrice(product.price)
  }));
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function buttonMarkup(label, value, activeValue, dataName) {
  return `<button class="filter ${value === activeValue ? 'active' : ''}" data-${dataName}="${cleanText(value)}">${cleanText(label)}</button>`;
}

function renderMainCategoryFilters() {
  if (!mainCategoryFilters) return;
  const productMainCategories = products.map(getMainCategory);
  const taxonomyNames = productTaxonomy.map(item => item.name);
  const categories = uniqueSorted([...taxonomyNames, ...productMainCategories]);
  mainCategoryFilters.innerHTML = [
    buttonMarkup('All', 'all', activeMainCategory, 'main'),
    ...categories.map(category => buttonMarkup(category, category, activeMainCategory, 'main'))
  ].join('');
}

function getSubcategoriesForActiveMain() {
  const productSubs = products
    .filter(product => activeMainCategory === 'all' || getMainCategory(product) === activeMainCategory)
    .map(getSubCategory);
  const taxonomySubs = activeMainCategory === 'all'
    ? productTaxonomy.flatMap(item => item.subcategories)
    : (productTaxonomy.find(item => item.name === activeMainCategory)?.subcategories || []);
  return uniqueSorted([...taxonomySubs, ...productSubs]);
}

function renderSubCategoryFilters() {
  if (!subCategoryFilters) return;
  const subcategories = getSubcategoriesForActiveMain();
  subCategoryFilters.innerHTML = [
    buttonMarkup('All types', 'all', activeSubCategory, 'sub'),
    ...subcategories.map(category => buttonMarkup(category, category, activeSubCategory, 'sub'))
  ].join('');
}


function enrichCombos(items = []) {
  return items.map((combo, index) => {
    const name = cleanText(combo.name || `Scentivity Combo ${index + 1}`);
    const originalUnitPrice = parseGHSPrice(combo.originalPrice);
    const comboUnitPrice = parseGHSPrice(combo.comboPrice || combo.price);
    return {
      ...combo,
      _key: `combo-${slugify(name)}-${index}`,
      _unitPrice: comboUnitPrice,
      _originalUnitPrice: originalUnitPrice,
      itemType: 'combo'
    };
  });
}

function comboSavings(combo = {}) {
  const original = Number(combo._originalUnitPrice || parseGHSPrice(combo.originalPrice));
  const discounted = Number(combo._unitPrice || parseGHSPrice(combo.comboPrice || combo.price));
  if (original > discounted && discounted > 0) return original - discounted;
  return 0;
}

function comboWhatsAppMessage(combo = {}) {
  const name = cleanText(combo.name || 'Scentivity combo');
  const includedItems = cleanText(combo.includedItems || 'Combo items');
  const price = cleanText(combo.comboPrice || combo.price || 'Price on request');
  const discountText = cleanText(combo.discountText || '');
  return `Hello Scentivity,

I am interested in this combo deal:

Combo: ${name}
Includes: ${includedItems}
Combo price: ${price}
${discountText ? `Discount: ${discountText}` : ''}

Please confirm availability.

Customer name:
Phone number:
Pickup or delivery:
Delivery address if needed:
Quantity:`;
}


function getVisibleProducts() {
  const search = activeSearchTerm.toLowerCase();
  return products.filter(product => {
    const matchesMain = activeMainCategory === 'all' || getMainCategory(product) === activeMainCategory;
    const matchesSub = activeSubCategory === 'all' || getSubCategory(product) === activeSubCategory;
    const searchableText = [
      product.name,
      product.brand,
      getMainCategory(product),
      getSubCategory(product),
      product.size,
      product.notes,
      product.price
    ].join(' ').toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);
    return matchesMain && matchesSub && matchesSearch;
  });
}

function productWhatsAppMessage(product) {
  const name = cleanText(product.name || 'Untitled product');
  const brand = cleanText(product.brand || 'Scentivity');
  const mainCategory = getMainCategory(product);
  const subCategory = getSubCategory(product);
  const price = cleanText(product.price || 'Price on request');
  const size = cleanText(product.size || 'Not specified');
  return `Hello Scentivity,\n\nI am interested in this product:\n\nProduct: ${name}\nBrand: ${brand}\nCategory: ${mainCategory} / ${subCategory}\nSize: ${size}\nPrice: ${price}\n\nPlease confirm availability.\n\nCustomer name:\nPhone number:\nPickup or delivery:\nDelivery address, if needed:\nQuantity:`;
}


function renderCombos() {
  if (!comboGrid) return;
  const visibleCombos = combos.filter(combo => combo.available !== false);
  if (!visibleCombos.length) {
    comboGrid.innerHTML = '<p class="empty-state">No combo deals are available right now. Check back soon or send a custom request.</p>';
    return;
  }

  comboGrid.innerHTML = visibleCombos.map(combo => {
    const name = cleanText(combo.name || 'Scentivity Combo');
    const description = cleanText(combo.description || 'A curated Scentivity bundle at a discounted price.');
    const includedItems = cleanText(combo.includedItems || 'Selected Scentivity products');
    const originalPrice = cleanText(combo.originalPrice || '');
    const comboPrice = cleanText(combo.comboPrice || combo.price || 'Price on request');
    const discountText = cleanText(combo.discountText || '');
    const image = normalizeImagePath(combo.image || 'assets/products/velvet-rose.svg');
    const savings = comboSavings(combo);
    const requestLink = buildWhatsAppLink(comboWhatsAppMessage(combo));
    const savingsLabel = discountText || (savings > 0 ? `Save ${formatGHS(savings)}` : 'Discounted combo');

    return `
      <article class="combo-card">
        <div class="combo-image-wrap">
          <img src="${image}" alt="${name}" loading="lazy" />
          <span class="combo-badge">${savingsLabel}</span>
        </div>
        <div class="combo-info">
          <span class="product-brand">Combo deal</span>
          <h3>${name}</h3>
          <p>${description}</p>
          <div class="combo-includes"><strong>Includes:</strong> ${includedItems}</div>
          <div class="combo-prices">
            ${originalPrice ? `<span class="old-price">${originalPrice}</span>` : ''}
            <strong>${comboPrice}</strong>
          </div>
          <div class="product-actions">
            <button class="btn primary add-combo-to-cart" type="button" data-combo-key="${combo._key}">Add Combo to Cart</button>
            <a class="btn ghost" href="${requestLink}" target="_blank" rel="noreferrer">Ask about combo</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}


function renderProducts() {
  if (!productGrid) return;
  const visibleProducts = getVisibleProducts();
  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="empty-state">No products match this selection yet. Try a different category, clear the search, or add the product from the Scentivity admin page.</p>';
    return;
  }
  productGrid.innerHTML = visibleProducts.map(product => {
    const name = cleanText(product.name || 'Untitled product');
    const brand = cleanText(product.brand || 'Scentivity');
    const mainCategory = getMainCategory(product);
    const subCategory = getSubCategory(product);
    const price = cleanText(product.price || 'Price on request');
    const size = cleanText(product.size || '');
    const notes = cleanText(product.notes || 'Add product details and scent notes in the admin dashboard.');
    const available = product.available !== false;
    const image = normalizeImagePath(product.image);
    const paymentLink = cleanText(product.paymentLink || '');
    const requestLink = buildWhatsAppLink(productWhatsAppMessage(product));
    const directBuyButton = paymentLink
      ? `<a class="btn ghost" href="${paymentLink}" target="_blank" rel="noreferrer">Direct payment link</a>`
      : '';
    return `
      <article class="product-card ${available ? '' : 'is-unavailable'}">
        <img src="${image}" alt="${name}" loading="lazy" />
        <div class="product-info">
          <div class="product-top">
            <div>
              <span class="product-brand">${brand}</span>
              <div class="product-tags">
                <span>${mainCategory}</span>
                <span>${subCategory}</span>
                ${size ? `<span>${size}</span>` : ''}
              </div>
              <h3>${name}</h3>
            </div>
            <span class="price">${price}</span>
          </div>
          <p>${notes}</p>
          ${available
            ? `<div class="product-actions">
                <button class="btn primary add-to-cart" type="button" data-product-key="${product._key}">Add to Cart</button>
                <a class="btn ghost" href="${requestLink}" target="_blank" rel="noreferrer">Request on WhatsApp</a>
                ${directBuyButton}
              </div>`
            : `<span class="sold-out">Currently unavailable</span>`
          }
        </div>
      </article>
    `;
  }).join('');
}


function getHomepageSlides() {
  const availableSlides = products
    .filter(product => product.available !== false)
    .slice(0, 4)
    .map(product => ({ ...product, _slideStatus: 'Available now', _slideType: 'available' }));

  const incomingSlides = products
    .filter(product => product.available === false)
    .slice(0, 3)
    .map(product => ({ ...product, _slideStatus: 'Coming soon', _slideType: 'coming-soon' }));

  const fallbackIncoming = [
    {
      name: 'New fragrance drops',
      brand: 'Scentivity',
      mainCategory: MAIN_CATEGORY_DESIGNER,
      subCategory: 'Fine Fragrance Mist',
      price: 'Coming soon',
      size: 'New arrivals',
      notes: 'Fresh perfume, mist, and luxury fragrance picks will be added soon.',
      image: 'assets/scentivity-logo-fused.png',
      available: false,
      _slideStatus: 'Coming soon',
      _slideType: 'coming-soon'
    },
    {
      name: 'More body care essentials',
      brand: 'Scentivity',
      mainCategory: MAIN_CATEGORY_BBW,
      subCategory: 'Body Care',
      price: 'Coming soon',
      size: 'Body care',
      notes: 'Watch this space for lotions, creams, washes, candles, and home fragrance items.',
      image: 'assets/scentivity-product-photo-background.png',
      available: false,
      _slideStatus: 'Coming soon',
      _slideType: 'coming-soon'
    }
  ];

  const incoming = incomingSlides.length ? incomingSlides : fallbackIncoming;
  return [...availableSlides.slice(0, 4), ...incoming].slice(0, 7);
}

function renderHomepageShowcase() {
  if (!homepageProductSlides) return;
  const slides = getHomepageSlides();
  if (!slides.length) {
    homepageProductSlides.innerHTML = '<p class="empty-state">Add products in the admin dashboard to feature them here.</p>';
    if (homepageProductDots) homepageProductDots.innerHTML = '';
    return;
  }

  if (showcaseIndex >= slides.length) showcaseIndex = 0;
  homepageProductSlides.style.transform = `translateX(-${showcaseIndex * 100}%)`;
  homepageProductSlides.innerHTML = slides.map(product => {
    const name = cleanText(product.name || 'Scentivity product');
    const brand = cleanText(product.brand || 'Scentivity');
    const mainCategory = getMainCategory(product);
    const subCategory = getSubCategory(product);
    const price = cleanText(product.price || (product.available === false ? 'Coming soon' : 'Price on request'));
    const size = cleanText(product.size || '');
    const notes = cleanText(product.notes || 'Scentivity favorite selected for sweet, confident moments.');
    const image = normalizeImagePath(product.image);
    const available = product.available !== false;
    return `
      <article class="showcase-slide" aria-label="${name}">
        <div class="showcase-image-wrap">
          <img src="${image}" alt="${name}" loading="lazy" />
          <span class="showcase-badge ${available ? 'available' : 'soon'}">${available ? 'Available now' : 'Coming soon'}</span>
        </div>
        <div class="showcase-copy">
          <p class="eyebrow">${cleanText(product._slideStatus || (available ? 'Available now' : 'Coming soon'))}</p>
          <h3>${name}</h3>
          <div class="product-tags showcase-tags">
            <span>${brand}</span>
            <span>${mainCategory}</span>
            <span>${subCategory}</span>
            ${size ? `<span>${size}</span>` : ''}
          </div>
          <p>${notes}</p>
          <div class="showcase-bottom">
            <strong>${price}</strong>
            ${available && product._key
              ? `<button class="btn primary add-to-cart" type="button" data-product-key="${product._key}">Add to Cart</button>`
              : `<a class="btn ghost" href="#preorder">Notify me</a>`
            }
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (homepageProductDots) {
    homepageProductDots.innerHTML = slides.map((_, index) => `
      <button type="button" class="showcase-dot ${index === showcaseIndex ? 'active' : ''}" data-slide-index="${index}" aria-label="Show slide ${index + 1}"></button>
    `).join('');
  }
}

function moveShowcase(direction = 1) {
  const total = getHomepageSlides().length;
  if (!total) return;
  showcaseIndex = (showcaseIndex + direction + total) % total;
  renderHomepageShowcase();
}

function startShowcaseAutoplay() {
  if (!homepageProductSlides) return;
  window.clearInterval(showcaseTimer);
  showcaseTimer = window.setInterval(() => moveShowcase(1), 6500);
}

function refreshShop() {
  renderMainCategoryFilters();
  renderSubCategoryFilters();
  renderProducts();
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartQuantity() {
  return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);
}

function getSelectedFulfillment() {
  return document.querySelector('input[name="fulfillment"]:checked')?.value || 'delivery';
}

function updateCartTotals() {
  const total = getCartTotal();
  if (cartSubtotal) cartSubtotal.textContent = formatGHS(total);
  if (cartTotal) cartTotal.textContent = formatGHS(total);
}

function updateCartCount() {
  const quantity = String(getCartQuantity());
  if (cartCount) cartCount.textContent = quantity;
  if (cartCountFooter) cartCountFooter.textContent = quantity;
}

function productSnapshot(product) {
  return {
    key: product._key,
    name: cleanText(product.name || 'Untitled product'),
    brand: cleanText(product.brand || 'Scentivity'),
    mainCategory: getMainCategory(product),
    subCategory: getSubCategory(product),
    size: cleanText(product.size || ''),
    priceText: cleanText(product.price || 'Price on request'),
    unitPrice: Number(product._unitPrice || parseGHSPrice(product.price)),
    image: normalizeImagePath(product.image)
  };
}


function comboSnapshot(combo) {
  const comboPrice = cleanText(combo.comboPrice || combo.price || 'Price on request');
  return {
    key: combo._key,
    itemType: 'combo',
    name: cleanText(combo.name || 'Scentivity Combo'),
    brand: 'Scentivity Combo Deal',
    mainCategory: 'Combo Deal',
    subCategory: 'Discounted Bundle',
    size: cleanText(combo.includedItems || ''),
    priceText: comboPrice,
    originalPriceText: cleanText(combo.originalPrice || ''),
    discountText: cleanText(combo.discountText || ''),
    unitPrice: Number(combo._unitPrice || parseGHSPrice(comboPrice)),
    image: normalizeImagePath(combo.image || 'assets/products/velvet-rose.svg'),
    includedItems: cleanText(combo.includedItems || '')
  };
}


function addToCart(productKey) {
  const product = products.find(item => item._key === productKey);
  if (!product) return;
  const existing = cart.find(item => item.key === productKey);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...productSnapshot(product), quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}


function addComboToCart(comboKey) {
  const combo = combos.find(item => item._key === comboKey);
  if (!combo) return;
  const existing = cart.find(item => item.key === comboKey);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...comboSnapshot(combo), quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}


function updateCartItem(key, action) {
  const item = cart.find(product => product.key === key);
  if (!item) return;
  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;
  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter(product => product.key !== key);
  }
  saveCart();
  renderCart();
}

function renderCart() {
  updateCartCount();
  updateCartTotals();
  if (!cartItemsContainer) return;
  if (!cart.length) {
    cartItemsContainer.innerHTML = '';
    if (cartEmptyMessage) cartEmptyMessage.classList.remove('hidden');
    if (checkoutForm) checkoutForm.classList.add('checkout-disabled');
    return;
  }
  if (cartEmptyMessage) cartEmptyMessage.classList.add('hidden');
  if (checkoutForm) checkoutForm.classList.remove('checkout-disabled');
  cartItemsContainer.innerHTML = cart.map(item => `
    <article class="cart-item ${item.itemType === 'combo' ? 'cart-combo-item' : ''}">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <small>${item.itemType === 'combo' ? 'Combo deal' : item.brand}${item.size ? ` • ${item.size}` : ''}</small>
        <span>
          ${item.originalPriceText ? `<em>${item.originalPriceText}</em> ` : ''}
          ${item.priceText}
          ${item.discountText ? `<b class="cart-discount">${item.discountText}</b>` : ''}
        </span>
        <div class="cart-qty" aria-label="Quantity controls for ${item.name}">
          <button type="button" data-cart-action="decrease" data-cart-key="${item.key}" aria-label="Decrease quantity">−</button>
          <b>${item.quantity}</b>
          <button type="button" data-cart-action="increase" data-cart-key="${item.key}" aria-label="Increase quantity">+</button>
          <button type="button" class="remove" data-cart-action="remove" data-cart-key="${item.key}">Remove</button>
        </div>
      </div>
    </article>
  `).join('');
}

function openCart() {
  renderCart();
  cartDrawer?.classList.add('open');
  cartOverlay?.classList.add('visible');
  cartDrawer?.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartDrawer?.classList.remove('open');
  cartOverlay?.classList.remove('visible');
  cartDrawer?.setAttribute('aria-hidden', 'true');
}

function updateFulfillmentFields() {
  const selected = getSelectedFulfillment();
  if (deliveryFields) deliveryFields.classList.toggle('hidden', selected !== 'delivery');
  if (pickupFields) pickupFields.classList.toggle('hidden', selected !== 'pickup');
  updateCartTotals();
}

function orderSummaryForMessage(order) {
  const itemLines = order.items
    .map(item => `- ${item.itemType === 'combo' ? 'Combo: ' : ''}${item.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${formatGHS(item.unitPrice * item.quantity)}${item.discountText ? ` [${item.discountText}]` : ''}`)
    .join('\n');

  return `Hello Scentivity,

I would like to place this order:

${itemLines}

Total before delivery: ${formatGHS(order.totalGHS)}
Fulfillment: ${order.fulfillment}
Delivery address: ${order.deliveryAddress || 'N/A'}
Pickup note/location: ${order.pickupLocation || 'N/A'}
Delivery fee note: Applies to delivery orders and will be determined after checkout based on location.
Payment method: ${order.paymentMethodLabel}

Customer name: ${order.customer.name}
Phone: ${order.customer.phone}
Additional notes: ${order.notes || 'N/A'}

Please confirm availability and payment/delivery details.`;
}

function showPaymentStatus(message, type = 'info') {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.className = `payment-status ${type}`;
}

function buildOrderFromForm() {
  const formData = new FormData(checkoutForm);
  const fulfillment = formData.get('fulfillment') || 'delivery';
  const paymentMethod = formData.get('paymentMethod') || CHECKOUT_PAYMENT_METHOD_CARD;
  const paymentLabel = paymentMethodSelect?.selectedOptions?.[0]?.textContent?.trim() || paymentMethod;
  const subtotalGHS = getCartTotal();

  return {
    customer: {
      name: cleanText(formData.get('customerName') || ''),
      phone: cleanText(formData.get('customerPhone') || '')
    },
    fulfillment: fulfillment === 'pickup' ? 'Pickup' : 'Delivery',
    deliveryAddress: fulfillment === 'delivery' ? cleanText(formData.get('deliveryAddress') || '') : '',
    pickupLocation: fulfillment === 'pickup' ? cleanText(formData.get('pickupLocation') || '') : '',
    deliveryFeeNote: 'Delivery fee applies to delivery orders and will be determined after checkout based on location.',
    paymentMethod,
    paymentMethodLabel: paymentLabel,
    notes: cleanText(formData.get('orderNotes') || ''),
    items: cart.map(item => ({
      name: item.name,
      brand: item.brand,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      priceText: item.priceText,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      itemType: item.itemType || 'product',
      includedItems: item.includedItems || '',
      originalPriceText: item.originalPriceText || '',
      discountText: item.discountText || ''
    })),
    subtotalGHS,
    totalGHS: subtotalGHS,
    currency: 'GHS'
  };
}

async function checkoutOnline(order) {
  showPaymentStatus(`Opening secure ${order.paymentMethod === CHECKOUT_PAYMENT_METHOD_MOMO ? 'MoMo' : 'card'} checkout...`, 'info');
  const response = await fetch('/.netlify/functions/create-paystack-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.authorization_url) {
    throw new Error(result.error || 'Online payment is not ready yet. Please check Paystack setup or choose Pay on pickup.');
  }
  localStorage.setItem('scentivityLastOrder', JSON.stringify({ ...order, paystackReference: result.reference || '' }));
  window.location.href = result.authorization_url;
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (!cart.length) {
    showPaymentStatus('Your cart is empty. Add a product first.', 'error');
    return;
  }

  const order = buildOrderFromForm();
  if (!order.customer.name || !order.customer.phone) {
    showPaymentStatus('Please enter your name and phone/WhatsApp number.', 'error');
    return;
  }
  if (order.fulfillment === 'Delivery' && !order.deliveryAddress) {
    showPaymentStatus('Please enter the delivery address.', 'error');
    return;
  }

  if (order.paymentMethod === CHECKOUT_PAYMENT_METHOD_CARD || order.paymentMethod === CHECKOUT_PAYMENT_METHOD_MOMO) {
    try {
      await checkoutOnline(order);
      return;
    } catch (error) {
      showPaymentStatus(error.message, 'error');
      return;
    }
  }

  const whatsappMessage = orderSummaryForMessage(order);
  window.open(buildWhatsAppLink(whatsappMessage), '_blank', 'noopener,noreferrer');
  showPaymentStatus('Your order summary has been opened in WhatsApp for pickup confirmation.', 'success');
}

async function loadProducts() {
  products = enrichProducts(fallbackProducts);
  combos = enrichCombos(fallbackCombos);
  try {
    const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load product data.');
    const data = await response.json();
    if (Array.isArray(data.products) && data.products.length) {
      products = enrichProducts(data.products);
    }
    if (Array.isArray(data.combos) && data.combos.length) {
      combos = enrichCombos(data.combos);
    }
  } catch (error) {
    console.warn('Using fallback products:', error.message);
  }
  refreshShop();
  renderCombos();
  renderHomepageShowcase();
  startShowcaseAutoplay();
  renderCart();
}

if (mainCategoryFilters) {
  mainCategoryFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-main]');
    if (!button) return;
    activeMainCategory = button.dataset.main;
    activeSubCategory = 'all';
    refreshShop();
  });
}


productSearch?.addEventListener('input', event => {
  activeSearchTerm = cleanText(event.target.value);
  renderProducts();
});

navSearchButton?.addEventListener('click', () => {
  document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => productSearch?.focus(), 350);
});

if (subCategoryFilters) {
  subCategoryFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-sub]');
    if (!button) return;
    activeSubCategory = button.dataset.sub;
    renderSubCategoryFilters();
    renderProducts();
  });
}

if (productGrid) {
  productGrid.addEventListener('click', event => {
    const addButton = event.target.closest('.add-to-cart');
    if (!addButton) return;
    addToCart(addButton.dataset.productKey);
  });
}


homepageProductSlides?.addEventListener('click', event => {
  const addButton = event.target.closest('.add-to-cart');
  if (!addButton) return;
  addToCart(addButton.dataset.productKey);
});

homepageProductDots?.addEventListener('click', event => {
  const dot = event.target.closest('[data-slide-index]');
  if (!dot) return;
  showcaseIndex = Number(dot.dataset.slideIndex || 0);
  renderHomepageShowcase();
  startShowcaseAutoplay();
});

showcasePrev?.addEventListener('click', () => {
  moveShowcase(-1);
  startShowcaseAutoplay();
});

showcaseNext?.addEventListener('click', () => {
  moveShowcase(1);
  startShowcaseAutoplay();
});

cartToggle?.addEventListener('click', openCart);
cartToggleFooter?.addEventListener('click', openCart);
closeCartButton?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

cartItemsContainer?.addEventListener('click', event => {
  const control = event.target.closest('[data-cart-action]');
  if (!control) return;
  updateCartItem(control.dataset.cartKey, control.dataset.cartAction);
});

fulfillmentRadios.forEach(radio => radio.addEventListener('change', updateFulfillmentFields));
checkoutForm?.addEventListener('submit', handleCheckoutSubmit);

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (emailRequestForm) {
  emailRequestForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(emailRequestForm);
    const name = cleanText(formData.get('name') || '');
    const contact = cleanText(formData.get('contact') || '');
    const message = cleanText(formData.get('message') || '');
    const body = `Hello Scentivity,\n\nI would like to send a product request.\n\nName: ${name}\nEmail/Phone: ${contact}\n\nRequest details:\n${message}\n\nThank you.`;
    window.location.href = buildEmailLink('Scentivity Product Request', body);
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
updateFulfillmentFields();

document.querySelectorAll('[data-scroll-search]').forEach(shortcut => {
  shortcut.addEventListener('click', () => {
    const term = shortcut.dataset.scrollSearch || '';
    if (productSearch && term) {
      productSearch.value = term;
      activeSearchTerm = term.toLowerCase();
      refreshShop();
    }
  });
});


let testimonialIndex = 0;
let testimonialTimer = null;

function renderTestimonialDots() {
  const testimonialSlides = document.querySelector('#testimonialSlides');
  const testimonialDots = document.querySelector('#testimonialDots');
  if (!testimonialSlides || !testimonialDots) return;
  const slides = [...testimonialSlides.children];
  testimonialDots.innerHTML = slides.map((_, index) => `<button type="button" class="${index === testimonialIndex ? 'active' : ''}" data-testimonial-index="${index}" aria-label="Show review ${index + 1}"></button>`).join('');
}

function showTestimonial(index) {
  const testimonialSlides = document.querySelector('#testimonialSlides');
  if (!testimonialSlides) return;
  const slides = [...testimonialSlides.children];
  if (!slides.length) return;
  testimonialIndex = (index + slides.length) % slides.length;
  testimonialSlides.style.transform = `translateX(-${testimonialIndex * 100}%)`;
  renderTestimonialDots();
}

function startTestimonialAutoplay() {
  window.clearInterval(testimonialTimer);
  testimonialTimer = window.setInterval(() => showTestimonial(testimonialIndex + 1), 5500);
}

document.querySelector('#testimonialPrev')?.addEventListener('click', () => {
  showTestimonial(testimonialIndex - 1);
  startTestimonialAutoplay();
});

document.querySelector('#testimonialNext')?.addEventListener('click', () => {
  showTestimonial(testimonialIndex + 1);
  startTestimonialAutoplay();
});

document.querySelector('#testimonialDots')?.addEventListener('click', event => {
  const dot = event.target.closest('[data-testimonial-index]');
  if (!dot) return;
  showTestimonial(Number(dot.dataset.testimonialIndex || 0));
  startTestimonialAutoplay();
});

showTestimonial(0);
startTestimonialAutoplay();

loadProducts();
