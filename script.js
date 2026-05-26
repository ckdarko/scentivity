const fallbackProducts = [
  {
    name: 'Velvet Rose Eau de Parfum',
    category: 'Floral',
    price: '$45',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Rose petals, peony, soft musk, and vanilla cream.',
    size: '50 mL',
    available: true
  },
  {
    name: 'Amber Noir',
    category: 'Warm',
    price: '$58',
    image: 'assets/products/amber-noir.svg',
    notes: 'Amber, sandalwood, vanilla, tonka, and evening musk.',
    size: '75 mL',
    available: true
  },
  {
    name: 'Citrus Bloom Mist',
    category: 'Fresh',
    price: '$25',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'Mandarin, green tea, white flowers, and clean musk.',
    size: '100 mL',
    available: true
  },
  {
    name: 'Oud Muse Gift Set',
    category: 'Luxury',
    price: '$85',
    image: 'assets/products/oud-muse.svg',
    notes: 'Oud, rosewood, saffron, praline, and soft incense.',
    size: 'Gift set',
    available: true
  }
];

let products = [...fallbackProducts];

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
    const orderSubject = encodeURIComponent(`Perfume Order Request: ${name}`);
    const orderBody = encodeURIComponent(`Hello Scentivity,\n\nI would like to order ${name}. Please confirm availability, payment, and delivery options.\n\nName:\nPhone:\nQuantity:\nDelivery or pickup:`);

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
            ? `<a class="btn ghost" href="mailto:abenaoppongampofo@gmail.com?subject=${orderSubject}&body=${orderBody}">Request this scent</a>`
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

document.querySelector('#year').textContent = new Date().getFullYear();
loadProducts();
