// SCENTIVITY_PREORDER_WHATSAPP_PROMO_UPDATE_20260604
// SCENTIVITY_NOTIFY_FEEDBACK_ADMIN_UPDATE_20260604
// SCENTIVITY_CATALOGUE_ADMIN_MARQUEE_UPDATE_20260603
// SCENTIVITY_SEARCH_UNDER_COMBO_UPDATE_20260603
// SCENTIVITY_REVIEWS_BUNDLE_TOGGLE_UPDATE_20260603
// SCENTIVITY_DEAL_OF_WEEK_ADMIN_UPDATE_20260602
// SCENTIVITY_CATALOGUE_SHIPPING_UPDATE_20260602
// SCENTIVITY_BUTTONS_SLIDES_FIX_UPDATE_20260602
// SCENTIVITY_LOGO_SLIDESHOW_CONTACT_FIX_UPDATE_20260602
// SCENTIVITY_LAYOUT_CLEANUP_UPDATE_20260602
// SCENTIVITY_MOBILE_UI_FIXES_UPDATE_20260602
// SCENTIVITY_MOBILE_OVERFLOW_FIX_UPDATE_20260602
// SCENTIVITY_MOBILE_PERFUMEGH_STYLE_UPDATE_20260602
// SCENTIVITY_MOBILE_COMBO_BUNDLE_UPDATE_20260601
// SCENTIVITY_COMBO_VISIBLE_CONTENTS_UPDATE_20260601
// SCENTIVITY_COMBO_CART_FIX_UPDATE_20260601
// SCENTIVITY_LIMITED_DEALWEEK_REVIEWS_UPDATE_20260601
// SCENTIVITY_PERFUMEGH_INSPIRED_RESPONSIVE_UPDATE_20260601
// SCENTIVITY_COMBO_DEALS_UPDATE_20260601
// SCENTIVITY_DELIVERY_FEE_NOTE_UPDATE_20260601
// SCENTIVITY_CACHEPROOF_JS_FIX_20260601
const MAIN_CATEGORY_VS = "Victoria's Secret Collection";
const MAIN_CATEGORY_BBW = 'Bath & Body Works Collection';
const MAIN_CATEGORY_DESIGNER = 'Designer and Luxury Fragrances';
const CATALOGUE_GIFT_SETS = 'gift_sets';
const CATALOGUE_COMBOS = 'combos';

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

const defaultProductCatalogue = [
  { label: 'BBW', name: MAIN_CATEGORY_BBW, categoryName: MAIN_CATEGORY_BBW, subcategories: SCENTIVITY_SUBCATEGORIES, showInCatalogue: true },
  { label: 'VICTORIA SECRET', name: MAIN_CATEGORY_VS, categoryName: MAIN_CATEGORY_VS, subcategories: SCENTIVITY_SUBCATEGORIES, showInCatalogue: true },
  { label: 'DESIGNER FRAGRANCE', name: MAIN_CATEGORY_DESIGNER, categoryName: MAIN_CATEGORY_DESIGNER, subcategories: SCENTIVITY_SUBCATEGORIES, showInCatalogue: true },
  { label: 'GIFT SETS', name: CATALOGUE_GIFT_SETS, categoryName: CATALOGUE_GIFT_SETS, subcategories: ['Gift Sets', 'Fine Fragrance Mist', 'Body Care', 'Designer Fragrance'], showInCatalogue: true }
];

let productCatalogue = [...defaultProductCatalogue];

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




const fallbackBundleBuilderSettings = {
  enabled: false,
  discountTwoItems: 5,
  discountThreeOrMore: 10,
  note: ''
};


const fallbackDealOfWeek = {
  enabled: true,
  itemType: 'combo',
  productName: '',
  comboName: 'Sweet Starter Combo',
  badgeText: 'Deal of the Week',
  title: 'Bundle your favorites and save.',
  description: 'Fresh picks. Sweet savings.',
  buttonText: 'Add Deal to Cart',
  image: ''
};


let products = [];
let combos = [];
let dealOfWeek = { ...fallbackDealOfWeek };
let bundleBuilderSettings = { ...fallbackBundleBuilderSettings };
let customerReviews = [];
let activeMainCategory = 'all';
let activeSubCategory = 'all';
let activeSearchTerm = '';
let showcaseIndex = 0;
let showcaseTimer = null;
let cart = loadCart();
let selectedBundleProductKeys = new Set();

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

const dealOfWeekCard = document.querySelector('#dealOfWeekCard') || document.querySelector('.hero-deal-card');
const productGrid = document.querySelector('#productGrid');
const comboGrid = document.querySelector('#comboGrid');
const bundleBuilderSection = document.querySelector('#bundleBuilder');
const bundleBuilderGrid = document.querySelector('#bundleBuilderGrid');
const bundleBuilderSummary = document.querySelector('#bundleBuilderSummary');
const addBuiltBundleToCartButton = document.querySelector('#addBuiltBundleToCart');
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
const mobileCartButton = document.querySelector('#mobileCartButton');
const mobileCartCount = document.querySelector('#mobileCartCount');
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
emailRequestForm?.addEventListener('submit', event => {
  event.preventDefault();

  const formData = new FormData(emailRequestForm);
  const name = cleanText(formData.get('name') || '');
  const message = cleanText(formData.get('message') || '');

  if (!name || !message) {
    alert('Please enter your name and fragrance request.');
    return;
  }

  const whatsappMessage = [
    'Hello Scentivity,',
    '',
    'I would like to send a preorder / fragrance request.',
    '',
    `Name: ${name}`,
    `Request: ${message}`
  ].join('\n');

  window.open(buildWhatsAppLink(whatsappMessage), '_blank', 'noopener,noreferrer');
  emailRequestForm.reset();
});


const customerFeedbackForm = document.querySelector('#customerFeedbackForm');
customerFeedbackForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const submitButton = customerFeedbackForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || 'Submit Feedback';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  const formData = new FormData(customerFeedbackForm);
  if (!formData.get('form-name')) {
    formData.set('form-name', customerFeedbackForm.getAttribute('name') || 'customer-feedback');
  }

  let posted = false;
  try {
    const response = await fetch('/.netlify/functions/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });
    posted = response.ok;
  } catch (error) {
    console.warn('Feedback submission could not be posted automatically.', error);
  }

  customerFeedbackForm.reset();

  let note = customerFeedbackForm.querySelector('.feedback-submit-note');
  if (!note) {
    note = document.createElement('p');
    note.className = 'feedback-submit-note cart-small-note';
    customerFeedbackForm.appendChild(note);
  }
  note.textContent = posted
    ? 'Thank you. Your feedback has been submitted.'
    : 'Thank you. Your feedback has been received.';

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});


// Coming-soon Notify Me buttons open the Contact/Preorder popup and prefill the request.
document.addEventListener('click', event => {
  const notifyButton = event.target.closest('.notify-me-button, a[href="#preorder"]');
  if (!notifyButton) return;

  event.preventDefault();

  if (typeof openContactModal === 'function') {
    openContactModal();
  } else {
    document.querySelector('#contactModal')?.classList.add('open');
    document.querySelector('#contactModal')?.setAttribute('aria-hidden', 'false');
  }

  const productName = notifyButton.dataset.notifyProduct || 'this product';
  const productBrand = notifyButton.dataset.notifyBrand || '';
  const productSize = notifyButton.dataset.notifySize || '';
  const messageBox = document.querySelector('#emailRequestForm textarea[name="message"]');

  if (messageBox) {
    messageBox.value = `Hello Scentivity, please notify me when this coming-soon item becomes available:\n\nProduct: ${productName}${productBrand ? `\nBrand: ${productBrand}` : ''}${productSize ? `\nSize: ${productSize}` : ''}\n\nMy preferred pickup/delivery option is:`;
    window.setTimeout(() => messageBox.focus(), 150);
  }

  document.querySelector('#emailRequestForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

loadProducts();
