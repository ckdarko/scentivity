const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function safeParse(value, fallback = {}) {
  try { return JSON.parse(value || '{}'); } catch (_) { return fallback; }
}

function trimText(value, max = 2500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function money(value) {
  if (value === undefined || value === null || value === '') return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function cleanProducts(products) {
  const list = Array.isArray(products) ? products : [];
  return list.slice(0, 120).map((p, index) => ({
    id: p.id || p.productId || p.slug || p.key || p.productKey || `product-${index + 1}`,
    name: trimText(p.name || p.productName || p.title, 120),
    brand: trimText(p.brand || p.collection || '', 80),
    category: trimText(p.category || p.type || p.productType || '', 80),
    subcategory: trimText(p.subcategory || p.fragranceType || '', 80),
    price: money(p.price || p.salePrice || p.currentPrice),
    status: trimText(p.productStatus || p.status || '', 50),
    availableQuantity: p.availableQuantity,
    description: trimText(p.description || p.shortDescription || p.notes || '', 320),
    tags: Array.isArray(p.tags) ? p.tags.slice(0, 10) : []
  })).filter((p) => p.name);
}

const actionLabels = {
  scent_finder: 'AI Scent Finder',
  gift_finder: 'Gift Finder',
  product_search: 'Smart Product Search',
  faq_assistant: 'FAQ Assistant',
  similar_products: 'Similar Products',
  whatsapp_message: 'WhatsApp Message Builder',
  product_description: 'Product Description Generator',
  seo_alt_text: 'SEO and Alt Text Helper',
  review_summary: 'Review Summary',
  stock_insights: 'Stock and Restock Insights'
};

function buildPrompt(payload) {
  const action = payload.action || 'scent_finder';
  const actionLabel = actionLabels[action] || 'Scentivity AI Assistant';
  const products = cleanProducts(payload.products || []);
  const input = trimText(payload.input, 4000);
  const cart = payload.cart || [];
  const pageContext = trimText(payload.pageContext, 2000);
  const policies = trimText(payload.policies, 2500);

  return `You are ${actionLabel} for Scentivity, a Ghana fragrance and beauty boutique with the tagline "Everything Sweet Scented".

Rules:
- Recommend only from the provided Scentivity product list when products are provided.
- Do not invent prices, stock, policies, delivery promises, discounts, or payment rules.
- Payment options are Card and MoMo only.
- Delivery is currently Ghana-focused unless the provided policy text says otherwise.
- Keep answers short, warm, practical, and sales-friendly.
- If stock is 0 or product status says out of stock, do not recommend it as immediately available.
- If information is missing, say what is missing and suggest contacting Scentivity on WhatsApp.
- For customer-facing answers, avoid technical AI wording.

Action: ${action}
Customer/Admin request: ${input || 'No request provided.'}
Page context: ${pageContext || 'No page context provided.'}
Policy context: ${policies || 'No policy context provided.'}
Cart items: ${JSON.stringify(cart).slice(0, 2500)}
Available product list: ${JSON.stringify(products).slice(0, 12000)}

Return a helpful response with headings only when useful. For recommendations, include product name, why it fits, and any known price/status. For admin generation, produce ready-to-copy text.`;
}

function extractText(data) {
  if (!data) return '';
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const pieces = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') pieces.push(content.text);
      if (typeof content.output_text === 'string') pieces.push(content.output_text);
    }
  }
  return pieces.join('\n').trim();
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'OPENAI_API_KEY is missing in Netlify environment variables.' });
  }

  const payload = safeParse(event.body);
  const prompt = buildPrompt(payload);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: 'You are a concise, trustworthy ecommerce assistant for Scentivity. Follow the provided rules exactly.',
        input: prompt,
        max_output_tokens: 700
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return json(response.status, { error: data.error?.message || 'OpenAI request failed.' });
    }

    const answer = extractText(data);
    return json(200, { answer: answer || 'Sorry, I could not generate a response. Please try again.' });
  } catch (error) {
    return json(500, { error: error.message || 'AI request failed.' });
  }
};
