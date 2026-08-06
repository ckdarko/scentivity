(() => {
  const API_PATH = '/.netlify/functions/scentivity-ai';
  let productCache = null;

  const clean = (value) => String(value || '').trim();

  async function loadProducts() {
    if (productCache) return productCache;
    try {
      const response = await fetch('/data/products.json?v=ai-20260806', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load products');
      const data = await response.json();
      const products = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
      productCache = products.filter((product) => product && product.showOnWebsite !== false).map((product, index) => ({
        id: product.id || product.productId || product.slug || product.key || product.productKey || `${clean(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
        productKey: product.productKey || product.key || product.slug || product.id || '',
        name: product.name || product.productName || product.title || '',
        brand: product.brand || product.collection || '',
        category: product.category || product.type || product.productType || '',
        subcategory: product.subcategory || product.fragranceType || '',
        price: product.price || product.salePrice || product.currentPrice || '',
        status: product.productStatus || product.status || '',
        availableQuantity: product.availableQuantity,
        description: product.description || product.shortDescription || product.notes || '',
        image: product.image || product.imageUrl || product.mainImage || '',
        tags: product.tags || []
      }));
      return productCache;
    } catch (error) {
      console.warn('Scentivity AI product load failed:', error);
      productCache = [];
      return productCache;
    }
  }

  function getCartItems() {
    const keys = ['scentivityCart', 'cart', 'scentivity-cart'];
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed.items)) return parsed.items;
      } catch (_) {}
    }
    return [];
  }

  async function askAI(action, input, options = {}) {
    const products = options.products || await loadProducts();
    const payload = {
      action,
      input,
      products,
      cart: options.cart || getCartItems(),
      pageContext: options.pageContext || document.title || '',
      policies: options.policies || ''
    };

    const response = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'AI request failed.');
    return data.answer || '';
  }

  function formatAnswer(text) {
    const safe = clean(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return safe
      .replace(/^###\s?(.*)$/gm, '<h4>$1</h4>')
      .replace(/^##\s?(.*)$/gm, '<h3>$1</h3>')
      .replace(/^#\s?(.*)$/gm, '<h3>$1</h3>')
      .replace(/\n\s*\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  window.ScentivityAI = {
    askAI,
    loadProducts,
    getCartItems,
    formatAnswer
  };
})();
