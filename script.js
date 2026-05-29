const productTaxonomy = [
  {
    name: 'Victoria’s Secret',
    subcategories: [
      'Perfumes',
      'Eau de Parfum',
      'Body Mist',
      'Hair Mist',
      'Lotions & Oils',
      'Body Care',
      'Travel Size',
      'Gift Sets'
    ]
  },
  {
    name: 'Bath & Body Works',
    subcategories: [
      'Fine Fragrance Mist',
      'Body Lotion & Cream',
      'Body Wash & Shower Gel',
      'Candles',
      'Wallflowers',
      'Room Sprays',
      'Hand Soap',
      'Hand Sanitizers',
      'Men’s Body Care',
      'Gift Sets'
    ]
  },
  {
    name: 'Fragrances',
    subcategories: [
      'Perfumes',
      'Eau de Parfum',
      'Fragrance Mist',
      'Body Mist',
      'Perfume Oil',
      'Roll-On Oils',
      'Travel Size'
    ]
  },
  {
    name: 'Men’s Collection',
    subcategories: [
      'Men’s Fragrance',
      'Men’s Body Spray',
      'Men’s Body Care',
      'Men’s Gift Sets'
    ]
  },
  {
    name: 'Body Care',
    subcategories: [
      'Body Lotion & Cream',
      'Body Oil',
      'Body Wash & Shower Gel',
      'Scrubs',
      'Hand Cream',
      'Hand Soap',
      'Hand Sanitizers'
    ]
  },
  {
    name: 'Home Fragrance',
    subcategories: [
      'Candles',
      'Wallflowers',
      'Room Sprays',
      'Car Fragrance'
    ]
  },
  {
    name: 'Gift Sets',
    subcategories: [
      'Perfume Gift Sets',
      'Body Care Sets',
      'Men’s Gift Sets',
      'Travel Sets'
    ]
  },
  {
    name: 'Others',
    subcategories: [
      'Accessories',
      'New Arrivals',
      'Clearance',
      'Other Products'
    ]
  }
];

const fallbackProducts = [
  {
    name: "Victoria's Secret Pure Wonder Fragrance Mist",
    brand: "Victoria's Secret",
    mainCategory: 'Victoria’s Secret',
    subCategory: 'Body Mist',
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
    mainCategory: 'Bath & Body Works',
    subCategory: 'Body Lotion & Cream',
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
    mainCategory: 'Fragrances',
    subCategory: 'Eau de Parfum',
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
    mainCategory: 'Men’s Collection',
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
    mainCategory: 'Home Fragrance',
    subCategory: 'Candles',
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
    mainCategory: 'Body Care',
    subCategory: 'Hand Sanitizers',
    price: 'GH₵45',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'Portable scented sanitizer options for bags, cars, school, work, and gifting.',
    size: 'Travel size',
    available: true,
    paymentLink: ''
  }
];

let products = [...fallbackProducts];
let activeMainCategory = 'all';
let activeSubCategory = 'all';

const SCENTIVITY_EMAIL = 'scentivitygh@gmail.com';

function buildEmailLink(subject, body) {
  return `mailto:${SCENTIVITY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const productGrid = document.querySelector('#productGrid');
const mainCategoryFilters = document.querySelector('#mainCategoryFilters');
const subCategoryFilters = document.querySelector('#subCategoryFilters');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function cleanText(value = '') {
  return String(value).replace(/[<>]/g, '');
}

function normalizeImagePath(path) {
  if (!path) return 'assets/products/velvet-rose.svg';
  return path.startsWith('/') ? path.slice(1) : path;
}

function legacyMainCategory(product) {
  const category = product.category || '';
  if (['Floral', 'Warm', 'Fresh', 'Luxury', 'Body Mist', 'Perfume Oil'].includes(category)) return 'Fragrances';
  if (category === 'Gift Set') return 'Gift Sets';
  if (category === 'New Arrival') return 'Others';
  return 'Fragrances';
}

function getMainCategory(product) {
  return cleanText(product.mainCategory || legacyMainCategory(product));
}

function getSubCategory(product) {
  return cleanText(product.subCategory || product.category || 'Other Products');
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
    buttonMarkup('All', 'all', activeSubCategory, 'sub'),
    ...subcategories.map(category => buttonMarkup(category, category, activeSubCategory, 'sub'))
  ].join('');
}

function getVisibleProducts() {
  return products.filter(product => {
    const matchesMain = activeMainCategory === 'all' || getMainCategory(product) === activeMainCategory;
    const matchesSub = activeSubCategory === 'all' || getSubCategory(product) === activeSubCategory;
    return matchesMain && matchesSub;
  });
}

function renderProducts() {
  if (!productGrid) return;
  const visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="empty-state">No products in this category yet. Add one from the Scentivity admin page or choose another category.</p>';
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
    const requestMessage = `Hello Scentivity,

I am interested in this product:

Product: ${name}
Brand: ${brand}
Category: ${mainCategory} / ${subCategory}
Size: ${size || 'Not specified'}
Price: ${price}

Please confirm availability and delivery/checkout details.

Customer name:
Phone number:
Delivery address or pickup preference:
Quantity:
Additional notes:`;
    const requestLink = buildEmailLink(`Product request: ${name}`, requestMessage);
    const buyButton = paymentLink
      ? `<a class="btn primary" href="${paymentLink}" target="_blank" rel="noreferrer">Buy now</a>`
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
            ? `<div class="product-actions">${buyButton}<a class="btn ghost" href="${requestLink}">Send Request</a></div>`
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

async function loadProducts() {
  try {
    const response = await fetch('data/products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load product data.');
    const data = await response.json();
    if (Array.isArray(data.products) && data.products.length) {
      products = data.products;
    }
  } catch (error) {
    console.warn('Using fallback products:', error.message);
  }
  refreshShop();
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

if (subCategoryFilters) {
  subCategoryFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-sub]');
    if (!button) return;
    activeSubCategory = button.dataset.sub;
    renderSubCategoryFilters();
    renderProducts();
  });
}

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

const backToTop = document.querySelector('#backToTop');

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


const emailRequestForm = document.querySelector('#emailRequestForm');

if (emailRequestForm) {
  emailRequestForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(emailRequestForm);
    const name = cleanText(formData.get('name') || '');
    const contact = cleanText(formData.get('contact') || '');
    const message = cleanText(formData.get('message') || '');
    const body = `Hello Scentivity,

I would like to send a product request.

Name: ${name}
Email/Phone: ${contact}

Request details:
${message}

Thank you.`;
    window.location.href = buildEmailLink('Scentivity Product Request', body);
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
loadProducts();
