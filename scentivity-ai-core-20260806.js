(() => {
  let productCache = null;

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const lower = (value) => clean(value).toLowerCase();

  const scentKeywords = {
    sweet: ['sweet', 'sugar', 'vanilla', 'candy', 'caramel', 'cream', 'cake', 'warm'],
    floral: ['floral', 'flower', 'rose', 'cherry blossom', 'jasmine', 'gardenia', 'bloom', 'peony'],
    fruity: ['fruit', 'fruity', 'berry', 'strawberry', 'apple', 'peach', 'cherry', 'citrus', 'mango'],
    fresh: ['fresh', 'clean', 'aqua', 'water', 'cotton', 'shower', 'light', 'air'],
    luxury: ['luxury', 'designer', 'elegant', 'premium', 'classy', 'rich', 'perfume'],
    strong: ['strong', 'long lasting', 'long-lasting', 'bold', 'intense', 'deep'],
    soft: ['soft', 'gentle', 'mild', 'light', 'everyday', 'daily'],
    coconut: ['coconut', 'tropical', 'beach'],
    mist: ['mist', 'spray', 'fragrance mist', 'body mist'],
    lotion: ['lotion', 'cream', 'body cream', 'body care'],
    candle: ['candle', 'home', 'room', 'scented candle'],
    gift: ['gift', 'birthday', 'valentine', 'anniversary', 'mother', 'girlfriend', 'wife', 'friend']
  };

  const policyAnswers = [
    {
      keys: ['payment', 'pay', 'card', 'momo', 'mobile money'],
      answer: 'Scentivity accepts Card and MoMo payments during checkout. Card and MoMo payments open through Paystack, so Scentivity does not collect card PINs or MoMo PINs on the website.'
    },
    {
      keys: ['delivery', 'deliver', 'ship', 'shipping', 'ghana', 'address'],
      answer: 'Delivery is currently focused on Ghana. Delivery fee depends on the customer’s location and is confirmed after checkout.'
    },
    {
      keys: ['pickup', 'pick up'],
      answer: 'Pickup is available as a fulfillment option, but payment should still be made by Card or MoMo during checkout.'
    },
    {
      keys: ['refund', 'return', 'damaged', 'wrong item'],
      answer: 'For refund or return questions, customers should review the Refund Policy page. Hygiene-sensitive beauty and fragrance products may have limited returns, especially after opening or use.'
    },
    {
      keys: ['preorder', 'request', 'not available', 'unavailable'],
      answer: 'For unavailable products or special fragrance requests, customers can use the Preorder/Contact form or WhatsApp Scentivity for support.'
    },
    {
      keys: ['contact', 'whatsapp', 'phone', 'instagram', 'email'],
      answer: 'You can contact Scentivity through WhatsApp at 053 458 4470, Instagram @scentivity, or email scentivitygh@gmail.com.'
    }
  ];

  async function loadProducts() {
    if (productCache) return productCache;
    try {
      const response = await fetch('/data/products.json?v=free-ai-20260806', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load products');
      const data = await response.json();
      const products = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
      productCache = products
        .filter((product) => product && product.showOnWebsite !== false)
        .map((product, index) => normalizeProduct(product, index));
      return productCache;
    } catch (error) {
      console.warn('Scentivity smart assistant product load failed:', error);
      productCache = [];
      return productCache;
    }
  }

  function normalizeProduct(product, index) {
    const name = clean(product.name || product.productName || product.title || '');
    const key = product.productKey || product.key || product.slug || product.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
    const priceValue = product.price ?? product.salePrice ?? product.currentPrice ?? product.discountedPrice ?? '';
    const qty = toNumber(product.availableQuantity);
    const text = [
      name,
      product.brand,
      product.collection,
      product.category,
      product.type,
      product.productType,
      product.subcategory,
      product.fragranceType,
      product.description,
      product.shortDescription,
      product.notes,
      Array.isArray(product.tags) ? product.tags.join(' ') : ''
    ].map(clean).join(' ');
    return {
      raw: product,
      id: product.id || product.productId || product.slug || product.key || product.productKey || key,
      productKey: key,
      name,
      brand: clean(product.brand || product.collection || ''),
      category: clean(product.category || product.type || product.productType || ''),
      subcategory: clean(product.subcategory || product.fragranceType || ''),
      price: priceValue,
      priceNumber: parseMoney(priceValue),
      status: clean(product.productStatus || product.status || ''),
      availableQuantity: qty,
      description: clean(product.description || product.shortDescription || product.notes || ''),
      image: product.image || product.imageUrl || product.mainImage || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      searchText: lower(text)
    };
  }

  function toNumber(value) {
    if (value === '' || value === undefined || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function parseMoney(value) {
    if (typeof value === 'number') return value;
    const n = Number(String(value || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function parseBudget(input) {
    const text = lower(input);
    const matches = [...text.matchAll(/(?:gh₵|ghc|ghs|₵)?\s*([0-9]{2,5})(?:\s*(?:gh₵|ghc|ghs|cedis))?/g)];
    if (!matches.length) return null;
    return Number(matches[matches.length - 1][1]);
  }

  function isAvailable(product) {
    const status = lower(product.status);
    if (status.includes('out') || status.includes('sold')) return false;
    if (product.availableQuantity !== null && product.availableQuantity <= 0) return false;
    return true;
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

  function extractTerms(input) {
    const text = lower(input);
    const terms = new Set();
    Object.entries(scentKeywords).forEach(([group, words]) => {
      if (words.some((word) => text.includes(word))) {
        terms.add(group);
        words.forEach((word) => { if (text.includes(word)) terms.add(word); });
      }
    });
    text.split(/[^a-z0-9₵]+/i)
      .filter((word) => word.length > 2 && !['the', 'and', 'for', 'with', 'under', 'want', 'need', 'good', 'show', 'give', 'that', 'this', 'something', 'product'].includes(word))
      .forEach((word) => terms.add(word));
    return [...terms].slice(0, 25);
  }

  function scoreProduct(product, input, action = 'scent_finder') {
    const text = lower(input);
    const terms = extractTerms(input);
    let score = 0;
    if (isAvailable(product)) score += 3;
    const search = product.searchText;

    terms.forEach((term) => {
      if (!term) return;
      if (search.includes(term)) score += 3;
      if (lower(product.name).includes(term)) score += 4;
      if (lower(product.category).includes(term) || lower(product.subcategory).includes(term)) score += 3;
      if (lower(product.brand).includes(term)) score += 2;
    });

    if (action === 'gift_finder' && (search.includes('gift') || search.includes('set') || search.includes('combo') || search.includes('perfume'))) score += 2;
    if (text.includes('under') || text.includes('budget') || text.includes('less than')) {
      const budget = parseBudget(text);
      if (budget && product.priceNumber) {
        if (product.priceNumber <= budget) score += 5;
        else score -= 6;
      }
    }
    if (text.includes('cheap') || text.includes('affordable')) {
      if (product.priceNumber && product.priceNumber <= 300) score += 2;
    }
    return score;
  }

  function recommendProducts(products, input, action, limit = 5) {
    const available = products.filter((p) => p.name && isAvailable(p));
    const scored = available.map((product) => ({ product, score: scoreProduct(product, input, action) }));
    scored.sort((a, b) => b.score - a.score || (a.product.priceNumber || 999999) - (b.product.priceNumber || 999999));
    const positive = scored.filter((item) => item.score > 2).slice(0, limit);
    return (positive.length ? positive : scored.slice(0, limit)).map((item) => item.product);
  }

  function productLine(product, index, input = '') {
    const reasons = getReasons(product, input);
    const price = product.price ? ` — ${formatPrice(product.price)}` : '';
    const stock = product.availableQuantity !== null ? ` Available quantity: ${product.availableQuantity}.` : '';
    return `${index}. ${product.name}${price}\n   Why it fits: ${reasons}${stock}`;
  }

  function formatPrice(value) {
    const text = clean(value);
    if (!text) return '';
    if (/gh|₵/i.test(text)) return text;
    return `GH₵${text}`;
  }

  function getReasons(product, input) {
    const text = lower(input);
    const reasons = [];
    Object.entries(scentKeywords).forEach(([group, words]) => {
      if (words.some((word) => text.includes(word)) && words.some((word) => product.searchText.includes(word))) {
        reasons.push(`${group} match`);
      }
    });
    if (product.brand) reasons.push(product.brand);
    if (product.category) reasons.push(product.category);
    if (product.subcategory) reasons.push(product.subcategory);
    return [...new Set(reasons)].slice(0, 3).join(', ') || 'It is one of the closest available matches from the Scentivity product list.';
  }

  function buildRecommendationAnswer(action, input, products) {
    const recs = recommendProducts(products, input, action, 5);
    if (!recs.length) {
      return 'I could not find available product matches from the current Scentivity product list. Please contact Scentivity on WhatsApp at 053 458 4470 for help choosing or preordering a scent.';
    }
    const intro = action === 'gift_finder'
      ? 'Here are good gift options from the current Scentivity product list:'
      : action === 'product_search'
        ? 'Here are the closest product matches from the current Scentivity product list:'
        : 'Based on your scent preference, these are good Scentivity matches:';
    return `${intro}\n\n${recs.map((p, i) => productLine(p, i + 1, input)).join('\n\n')}\n\nTip: Add your preferred option to cart and confirm final availability before payment.`;
  }

  function faqAnswer(input) {
    const text = lower(input);
    const found = policyAnswers.find((item) => item.keys.some((key) => text.includes(key)));
    if (found) return found.answer;
    return 'I can help with Scentivity delivery, pickup, payment, refund, preorder, and contact questions. Please ask using one of those topics, or contact Scentivity on WhatsApp at 053 458 4470 for a specific case.';
  }

  function whatsappMessage(input, cartItems) {
    const lines = ['Hello Scentivity, I would like to place an order.'];
    if (cartItems && cartItems.length) {
      lines.push('', 'Order items:');
      cartItems.forEach((item, index) => {
        const name = clean(item.name || item.productName || item.title || item.id || `Item ${index + 1}`);
        const qty = item.quantity || item.qty || 1;
        lines.push(`${index + 1}. ${name} x${qty}`);
      });
    } else if (input) {
      lines.push('', `Request: ${clean(input)}`);
    }
    lines.push('', 'Name:', 'Phone:', 'Delivery or Pickup:', 'Delivery address if delivery:', 'Payment method: Card or MoMo', 'Extra notes:');
    return lines.join('\n');
  }

  function productDescription(input) {
    const text = clean(input);
    return `Short product description:\n${text} is a sweet, gift-ready Scentivity pick for customers who want something beautiful, personal, and easy to love. Add it to your routine or pair it with another body-care favorite for a complete scent experience.\n\nInstagram caption:\nEverything Sweet Scented ✨ New scent pick available at Scentivity. Perfect for daily freshness, gifting, and soft luxury moments. Order now by Card or MoMo.\n\nWhatsApp caption:\nHello dear, this Scentivity product is available now. Kindly share your name, delivery/pickup option, and quantity to order.`;
  }

  function seoAltText(input) {
    const text = clean(input) || 'Scentivity fragrance product';
    const short = text.slice(0, 70);
    return `SEO title:\n${short} | Scentivity Ghana\n\nMeta description:\nShop ${short} from Scentivity Ghana. Discover sweet scented perfumes, fragrance mists, body care, candles, and gift-ready beauty picks.\n\nSuggested tags:\nScentivity, fragrance, perfume, body mist, body care, Ghana, gift, sweet scented\n\nImage alt text:\n${short} product available from Scentivity Ghana.`;
  }

  function reviewSummary(input) {
    const text = lower(input);
    const positives = ['love', 'nice', 'sweet', 'good', 'great', 'beautiful', 'amazing', 'long lasting', 'lasts'].filter((w) => text.includes(w));
    const concerns = ['late', 'delay', 'damaged', 'wrong', 'expensive', 'leak', 'broken'].filter((w) => text.includes(w));
    return `Review summary:\nCustomers appear to mention: ${positives.length ? positives.join(', ') : 'general product experience'}.\n\nPossible concerns to watch: ${concerns.length ? concerns.join(', ') : 'none clearly detected from the text provided'}.\n\nSuggested action:\nPromote products with strong positive feedback and follow up quickly on any delivery, damage, or wrong-item concerns.`;
  }

  function stockInsights(products) {
    const listed = products.filter((p) => p.name);
    const low = listed.filter((p) => p.availableQuantity !== null && p.availableQuantity > 0 && p.availableQuantity <= 2).slice(0, 8);
    const out = listed.filter((p) => !isAvailable(p)).slice(0, 8);
    const available = listed.filter(isAvailable).slice(0, 8);
    return `Stock/restock insights:\n\nLow stock products:\n${low.length ? low.map((p) => `- ${p.name} (${p.availableQuantity} left)`).join('\n') : '- No low-stock products detected from availableQuantity.'}\n\nOut of stock / unavailable:\n${out.length ? out.map((p) => `- ${p.name}`).join('\n') : '- No out-of-stock products detected.'}\n\nPromotion ideas:\n${available.length ? available.map((p) => `- Promote ${p.name}${p.price ? ` (${formatPrice(p.price)})` : ''}`).join('\n') : '- Add available products to generate promotion ideas.'}`;
  }

  async function askAI(action, input, options = {}) {
    const products = options.products || await loadProducts();
    const cart = options.cart || getCartItems();
    switch (action) {
      case 'scent_finder':
      case 'gift_finder':
      case 'product_search':
      case 'similar_products':
        return buildRecommendationAnswer(action, input, products);
      case 'faq_assistant':
        return faqAnswer(input);
      case 'whatsapp_message':
        return whatsappMessage(input, cart);
      case 'product_description':
        return productDescription(input);
      case 'seo_alt_text':
        return seoAltText(input);
      case 'review_summary':
        return reviewSummary(input);
      case 'stock_insights':
        return stockInsights(products);
      default:
        return buildRecommendationAnswer('scent_finder', input, products);
    }
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
    formatAnswer,
    isFreeLocalAssistant: true
  };
})();
