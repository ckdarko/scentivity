const PAYSTACK_INITIALIZE_URL = 'https://api.paystack.co/transaction/initialize';

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function cleanText(value = '') {
  return String(value).replace(/[<>]/g, '').trim();
}

function toPesewas(amountGHS) {
  return Math.round(Number(amountGHS || 0) * 100);
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, { ok: true });
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return jsonResponse(500, {
      error: 'Online payment is not configured yet. Add PAYSTACK_SECRET_KEY in Netlify environment variables, then clear cache and redeploy.'
    });
  }

  let order;
  try {
    order = JSON.parse(event.body || '{}');
  } catch (_) {
    return jsonResponse(400, { error: 'Invalid order payload.' });
  }

  const customer = order.customer || {};
  const name = cleanText(customer.name);
  const phone = cleanText(customer.phone);
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotalGHS = Number(order.subtotalGHS || 0);
  const deliveryFeeGHS = Number(order.deliveryFeeGHS || 0);
  const totalGHS = Number(order.totalGHS || (subtotalGHS + deliveryFeeGHS));
  const amount = toPesewas(totalGHS);

  if (!items.length) return jsonResponse(400, { error: 'Cart is empty.' });
  if (!name || !phone) return jsonResponse(400, { error: 'Customer name and phone number are required.' });
  if (!amount || amount < 100) return jsonResponse(400, { error: 'Order total is too low or invalid.' });

  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://scentivitygh.com';
  const reference = `SCENTIVITY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const phoneDigits = phone.replace(/\D/g, '').slice(-12) || reference.toLowerCase();
  const email = cleanText(customer.email || '') || `customer-${phoneDigits}@scentivitygh.com`;
  const cartSummary = items.map(item => `${item.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity}`).join('; ');
  const paymentMethod = cleanText(order.paymentMethod || 'card');
  const channels = paymentMethod === 'momo' ? ['mobile_money'] : ['card'];

  const payload = {
    email,
    amount: String(amount),
    currency: 'GHS',
    reference,
    callback_url: `${siteUrl.replace(/\/$/, '')}/thank-you.html`,
    channels,
    metadata: {
      business: 'Scentivity',
      customer_name: name,
      customer_phone: phone,
      fulfillment: cleanText(order.fulfillment || ''),
      delivery_address: cleanText(order.deliveryAddress || ''),
      pickup_location: cleanText(order.pickupLocation || ''),
      order_notes: cleanText(order.notes || ''),
      subtotal_ghs: subtotalGHS,
      delivery_fee_ghs: deliveryFeeGHS,
      total_ghs: totalGHS,
      payment_method: paymentMethod,
      cart_items: cartSummary,
      items,
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: name },
        { display_name: 'Customer Phone', variable_name: 'customer_phone', value: phone },
        { display_name: 'Payment Method', variable_name: 'payment_method', value: paymentMethod === 'momo' ? 'MoMo' : 'Card' },
        { display_name: 'Fulfillment', variable_name: 'fulfillment', value: cleanText(order.fulfillment || '') },
        { display_name: 'Delivery Address', variable_name: 'delivery_address', value: cleanText(order.deliveryAddress || 'N/A') },
        { display_name: 'Delivery Fee', variable_name: 'delivery_fee', value: `GH₵${deliveryFeeGHS}` },
        { display_name: 'Cart Items', variable_name: 'cart_items', value: cartSummary }
      ]
    }
  };

  try {
    const response = await fetch(PAYSTACK_INITIALIZE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.status || !data.data?.authorization_url) {
      return jsonResponse(502, { error: data.message || 'Paystack could not initialize checkout.' });
    }
    return jsonResponse(200, {
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference
    });
  } catch (error) {
    return jsonResponse(500, { error: error.message || 'Payment initialization failed.' });
  }
};
