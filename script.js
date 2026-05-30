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


let products = [];
let activeMainCategory = 'all';
let activeSubCategory = 'all';
let activeSearchTerm = '';
let cart = loadCart();

const SCENTIVITY_EMAIL = 'scentivitygh@gmail.com';
const SCENTIVITY_WHATSAPP = '233534584470';
const CART_STORAGE_KEY = 'scentivityCartV1';
const CHECKOUT_PAYMENT_METHOD_ONLINE = 'online_card_momo';

function buildEmailLink(subject, body) {
  return `mailto:${SCENTIVITY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildWhatsAppLink(message) {
  return `https://wa.me/${SCENTIVITY_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

const productGrid = document.querySelector('#productGrid');
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
const checkoutForm = document.querySelector('#checkoutForm');
const fulfillmentRadios = document.querySelectorAll('input[name="fulfillment"]');
const deliveryFields = document.querySelector('#deliveryFields');
const pickupFields = document.querySelector('#pickupFields');
const paymentMethodSelect = document.querySelector('#paymentMethod');
const paymentStatus = document.querySelector('#paymentStatus');
const emailRequestForm = document.querySelector('#emailRequestForm');

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
  const total = getCartTotal();
  if (cartSubtotal) cartSubtotal.textContent = formatGHS(total);
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
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <small>${item.brand}${item.size ? ` • ${item.size}` : ''}</small>
        <span>${item.priceText}</span>
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
  const selected = document.querySelector('input[name="fulfillment"]:checked')?.value || 'delivery';
  if (deliveryFields) deliveryFields.classList.toggle('hidden', selected !== 'delivery');
  if (pickupFields) pickupFields.classList.toggle('hidden', selected !== 'pickup');
}

function orderSummaryForMessage(order) {
  const itemLines = order.items.map(item => `- ${item.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${formatGHS(item.unitPrice * item.quantity)}`).join('\n');
  return `Hello Scentivity,\n\nI would like to place this order:\n\n${itemLines}\n\nSubtotal: ${formatGHS(order.subtotalGHS)}\nFulfillment: ${order.fulfillment}\nDelivery address: ${order.deliveryAddress || 'N/A'}\nPickup note/location: ${order.pickupLocation || 'N/A'}\nPayment method: ${order.paymentMethodLabel}\n\nCustomer name: ${order.customer.name}\nPhone: ${order.customer.phone}\nEmail: ${order.customer.email}\nAdditional notes: ${order.notes || 'N/A'}\n\nPlease confirm availability and payment/delivery details.`;
}

function showPaymentStatus(message, type = 'info') {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.className = `payment-status ${type}`;
}

function buildOrderFromForm() {
  const formData = new FormData(checkoutForm);
  const fulfillment = formData.get('fulfillment') || 'delivery';
  const paymentMethod = formData.get('paymentMethod') || CHECKOUT_PAYMENT_METHOD_ONLINE;
  const paymentLabel = paymentMethodSelect?.selectedOptions?.[0]?.textContent?.trim() || paymentMethod;
  return {
    customer: {
      name: cleanText(formData.get('customerName') || ''),
      email: cleanText(formData.get('customerEmail') || ''),
      phone: cleanText(formData.get('customerPhone') || '')
    },
    fulfillment: fulfillment === 'pickup' ? 'Pickup' : 'Delivery',
    deliveryAddress: fulfillment === 'delivery' ? cleanText(formData.get('deliveryAddress') || '') : '',
    pickupLocation: fulfillment === 'pickup' ? cleanText(formData.get('pickupLocation') || '') : '',
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
      subCategory: item.subCategory
    })),
    subtotalGHS: getCartTotal(),
    currency: 'GHS'
  };
}

async function checkoutOnline(order) {
  showPaymentStatus('Opening secure online checkout for card or Mobile Money payment...', 'info');
  const response = await fetch('/.netlify/functions/create-paystack-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.authorization_url) {
    throw new Error(result.error || 'Online payment is not ready yet. Please use WhatsApp checkout or check Paystack setup.');
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
  if (!order.customer.name || !order.customer.email || !order.customer.phone) {
    showPaymentStatus('Please enter your name, email, and phone number.', 'error');
    return;
  }
  if (order.fulfillment === 'Delivery' && !order.deliveryAddress) {
    showPaymentStatus('Please enter the delivery address.', 'error');
    return;
  }
  if (order.paymentMethod === CHECKOUT_PAYMENT_METHOD_ONLINE) {
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
  showPaymentStatus('Your order summary has been opened in WhatsApp for confirmation.', 'success');
}

async function loadProducts() {
  products = enrichProducts(fallbackProducts);
  try {
    const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load product data.');
    const data = await response.json();
    if (Array.isArray(data.products) && data.products.length) {
      products = enrichProducts(data.products);
    }
  } catch (error) {
    console.warn('Using fallback products:', error.message);
  }
  refreshShop();
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
loadProducts();
