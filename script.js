const fallbackProducts = [
  {
    name: 'Velvet Rose Eau de Parfum',
    category: 'Floral',
    price: 'GH₵450',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Rose petals, peony, soft musk, and vanilla cream.',
    size: '50 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Amber Noir',
    category: 'Warm',
    price: 'GH₵580',
    image: 'assets/products/amber-noir.svg',
    notes: 'Amber, sandalwood, vanilla, tonka, and evening musk.',
    size: '75 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Citrus Bloom Mist',
    category: 'Fresh',
    price: 'GH₵250',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'Mandarin, green tea, white flowers, and clean musk.',
    size: '100 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Oud Muse Gift Set',
    category: 'Luxury',
    price: 'GH₵850',
    image: 'assets/products/oud-muse.svg',
    notes: 'Oud, rosewood, saffron, praline, and soft incense.',
    size: 'Gift set',
    available: true,
    paymentLink: ''
  }
];

let products = [...fallbackProducts];

const SCENTIVITY_WHATSAPP = '233264284238';

function buildWhatsAppLink(message) {
  return `https://wa.me/${SCENTIVITY_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

const productGrid = document.querySelector('#productGrid');
const filters = document.querySelectorAll('.filter');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function cleanText(value = '') {
  return String(value).replace(/[<>]/g, '');
}

function normalizeImagePath(path) {
  if (!path) return 'assets/products/velvet-rose.svg';
  return path.startsWith('/') ? path.slice(1) : path;
}

function renderProducts(filter = 'all') {
  const visibleProducts = filter === 'all'
    ? products
    : products.filter(product => product.category === filter);

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="empty-state">No products in this category yet. Add one from the Scentivity admin page.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts.map(product => {
    const name = cleanText(product.name || 'Untitled perfume');
    const category = cleanText(product.category || 'Perfume');
    const price = cleanText(product.price || 'Price on request');
    const size = cleanText(product.size || '');
    const notes = cleanText(product.notes || 'Beautiful scent profile. Add full notes in the admin dashboard.');
    const available = product.available !== false;
    const image = normalizeImagePath(product.image);
    const paymentLink = cleanText(product.paymentLink || '');
    const whatsappMessage = `Hello Scentivity, I am interested in ${name}${size ? ` (${size})` : ''} priced at ${price}. Please confirm availability and delivery/checkout details.\n\nName:\nPhone:\nDelivery address:\nQuantity:`;
    const whatsappLink = buildWhatsAppLink(whatsappMessage);
    const buyButton = paymentLink
      ? `<a class="btn primary" href="${paymentLink}" target="_blank" rel="noreferrer">Buy now</a>`
      : `<a class="btn primary" href="#contact">Request checkout link</a>`;

    return `
      <article class="product-card ${available ? '' : 'is-unavailable'}">
        <img src="${image}" alt="${name}" loading="lazy" />
        <div class="product-info">
          <div class="product-top">
            <div>
              <span class="product-category">${category}${size ? ` • ${size}` : ''}</span>
              <h3>${name}</h3>
            </div>
            <span class="price">${price}</span>
          </div>
          <p>${notes}</p>
          ${available
            ? `<div class="product-actions">${buyButton}<a class="btn ghost" href="${whatsappLink}" target="_blank" rel="noreferrer">Ask about this scent</a></div>`
            : `<span class="sold-out">Currently unavailable</span>`
          }
        </div>
      </article>
    `;
  }).join('');
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
  renderProducts(document.querySelector('.filter.active')?.dataset.filter || 'all');
}

filters.forEach(button => {
  button.addEventListener('click', () => {
    filters.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    renderProducts(button.dataset.filter);
  });
});

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


const backToTop = document.querySelector('#backToTop');

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
loadProducts();
