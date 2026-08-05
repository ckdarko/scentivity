const crypto = require('crypto');

const PRODUCTS_PATH = 'data/products.json';
const PROCESSED_PATH = 'data/paystack-stock-processed.json';

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-paystack-signature',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function cleanText(value = '') {
  return String(value || '').replace(/[<>]/g, '').trim();
}

function slugify(value = '') {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeProductKey(product, index) {
  return slugify(`${product.name || 'product'}-${product.size || ''}-${product.price || ''}-${index}`) || `product-${index}`;
}

function normalizeCompare(value = '') {
  return cleanText(value).toLowerCase().replace(/\s+/g, ' ');
}

function getRepoName() {
  const repo = process.env.SCENTIVITY_GITHUB_REPO || process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY || '';
  const cleaned = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();
  if (!cleaned || !cleaned.includes('/')) {
    throw new Error('Missing SCENTIVITY_GITHUB_REPO environment variable. Use owner/repository, for example ckdarko001/scentivity-site.');
  }
  return cleaned;
}

function getGithubHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.SCENTIVITY_GITHUB_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN environment variable with repo contents read/write access.');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'scentivity-stock-webhook'
  };
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      ...getGithubHeaders(),
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = { raw: text }; }

  if (!response.ok) {
    const message = data?.message || `GitHub API error ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function getContentFile(repo, branch, filePath, fallbackText = null) {
  try {
    const data = await githubRequest(`/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`);
    const content = Buffer.from(String(data.content || ''), 'base64').toString('utf8');
    return { content, exists: true };
  } catch (error) {
    if (error.statusCode === 404 && fallbackText !== null) {
      return { content: fallbackText, exists: false };
    }
    throw error;
  }
}

async function getBranchHead(repo, branch) {
  const ref = await githubRequest(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const commitSha = ref?.object?.sha;
  if (!commitSha) throw new Error('Could not read GitHub branch head.');
  const commit = await githubRequest(`/repos/${repo}/git/commits/${commitSha}`);
  if (!commit?.tree?.sha) throw new Error('Could not read GitHub tree SHA.');
  return { commitSha, treeSha: commit.tree.sha };
}

async function createBlob(repo, content) {
  const blob = await githubRequest(`/repos/${repo}/git/blobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, encoding: 'utf-8' })
  });
  return blob.sha;
}

async function commitFiles(repo, branch, files, message) {
  const { commitSha, treeSha } = await getBranchHead(repo, branch);

  const tree = [];
  for (const file of files) {
    const sha = await createBlob(repo, file.content);
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha });
  }

  const newTree = await githubRequest(`/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_tree: treeSha, tree })
  });

  const newCommit = await githubRequest(`/repos/${repo}/git/commits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [commitSha] })
  });

  await githubRequest(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: newCommit.sha, force: false })
  });

  return newCommit.sha;
}

function verifyPaystackSignature(event, secretKey) {
  const signature = event.headers['x-paystack-signature'] || event.headers['X-Paystack-Signature'];
  if (!signature) return false;

  const hash = crypto.createHmac('sha512', secretKey).update(event.body || '').digest('hex');
  const sig = Buffer.from(signature, 'hex');
  const calculated = Buffer.from(hash, 'hex');

  if (sig.length !== calculated.length) return false;
  return crypto.timingSafeEqual(sig, calculated);
}

function getEventItems(payload) {
  const metadata = payload?.data?.metadata || {};
  if (Array.isArray(metadata.items)) return metadata.items;

  if (typeof metadata.items === 'string') {
    try {
      const parsed = JSON.parse(metadata.items);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }

  if (Array.isArray(metadata.cart_items_json)) return metadata.cart_items_json;
  return [];
}

function normalizeOrderItems(items) {
  return items
    .map(item => ({
      key: cleanText(item.key || item.productKey || item.id || item.slug || ''),
      id: cleanText(item.id || ''),
      slug: cleanText(item.slug || ''),
      name: cleanText(item.name || ''),
      size: cleanText(item.size || ''),
      itemType: cleanText(item.itemType || item.type || 'product').toLowerCase(),
      quantity: Math.max(1, Math.floor(Number(item.quantity || 1)))
    }))
    .filter(item => item.itemType !== 'combo' && item.itemType !== 'bundle' && item.name && item.quantity > 0);
}

function findMatchingProduct(products, orderItem) {
  const orderKeys = [orderItem.key, orderItem.id, orderItem.slug].filter(Boolean).map(normalizeCompare);
  const orderName = normalizeCompare(orderItem.name);
  const orderSize = normalizeCompare(orderItem.size);

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index] || {};
    const keys = [product.id, product.slug, makeProductKey(product, index)].filter(Boolean).map(normalizeCompare);
    if (orderKeys.length && keys.some(key => orderKeys.includes(key))) {
      return { product, index };
    }
  }

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index] || {};
    const productName = normalizeCompare(product.name);
    const productSize = normalizeCompare(product.size);
    const nameMatches = productName && productName === orderName;
    const sizeMatches = !orderSize || !productSize || productSize === orderSize;
    if (nameMatches && sizeMatches) {
      return { product, index };
    }
  }

  return null;
}

function hasStockField(product) {
  return Object.prototype.hasOwnProperty.call(product, 'availableQuantity') ||
    Object.prototype.hasOwnProperty.call(product, 'stockQuantity') ||
    Object.prototype.hasOwnProperty.call(product, 'quantityAvailable') ||
    Object.prototype.hasOwnProperty.call(product, 'stock');
}

function getStockValue(product) {
  const value = product.availableQuantity ?? product.stockQuantity ?? product.quantityAvailable ?? product.stock;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
}

function deductStock(productsData, orderItems) {
  const products = Array.isArray(productsData?.products) ? productsData.products : [];
  const changes = [];
  const skipped = [];

  for (const orderItem of orderItems) {
    const match = findMatchingProduct(products, orderItem);
    if (!match) {
      skipped.push({ name: orderItem.name, quantity: orderItem.quantity, reason: 'No matching product found' });
      continue;
    }

    const { product, index } = match;
    if (!hasStockField(product)) {
      skipped.push({ name: product.name || orderItem.name, quantity: orderItem.quantity, reason: 'No stock field on product' });
      continue;
    }

    const before = getStockValue(product);
    if (before === null) {
      skipped.push({ name: product.name || orderItem.name, quantity: orderItem.quantity, reason: 'Stock field is not numeric' });
      continue;
    }

    const after = Math.max(0, before - orderItem.quantity);
    product.availableQuantity = after;
    if (after <= 0) {
      product.productStatus = 'Out of Stock';
      product.available = false;
    }

    changes.push({
      index,
      name: product.name || orderItem.name,
      quantityPurchased: orderItem.quantity,
      before,
      after
    });
  }

  return { changes, skipped };
}

async function triggerOptionalBuildHook() {
  const buildHook = process.env.NETLIFY_BUILD_HOOK_URL || '';
  if (!buildHook) return;
  try {
    await fetch(buildHook, { method: 'POST' });
  } catch (error) {
    console.warn('Netlify build hook failed:', error.message);
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, { ok: true });
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return jsonResponse(500, { error: 'PAYSTACK_SECRET_KEY is not configured.' });
  if (!verifyPaystackSignature(event, secretKey)) return jsonResponse(401, { error: 'Invalid Paystack signature.' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_) {
    return jsonResponse(400, { error: 'Invalid JSON payload.' });
  }

  if (payload.event !== 'charge.success' || payload?.data?.status !== 'success') {
    return jsonResponse(200, { ok: true, ignored: true, reason: 'Not a successful charge event.' });
  }

  const reference = cleanText(payload?.data?.reference || payload?.data?.id || '');
  if (!reference) return jsonResponse(400, { error: 'Missing Paystack transaction reference.' });

  const orderItems = normalizeOrderItems(getEventItems(payload));
  if (!orderItems.length) {
    return jsonResponse(200, { ok: true, ignored: true, reference, reason: 'No product items in Paystack metadata.' });
  }

  try {
    const repo = getRepoName();
    const branch = process.env.GITHUB_BRANCH || 'main';

    const productsFile = await getContentFile(repo, branch, PRODUCTS_PATH);
    const processedFile = await getContentFile(repo, branch, PROCESSED_PATH, JSON.stringify({ processedReferences: [], events: [] }, null, 2));

    const productsData = JSON.parse(productsFile.content || '{}');
    const processedData = JSON.parse(processedFile.content || '{}');
    const processedReferences = Array.isArray(processedData.processedReferences) ? processedData.processedReferences : [];

    if (processedReferences.includes(reference)) {
      return jsonResponse(200, { ok: true, reference, duplicate: true, message: 'Reference already processed.' });
    }

    const { changes, skipped } = deductStock(productsData, orderItems);
    if (!changes.length) {
      processedReferences.push(reference);
      processedData.processedReferences = processedReferences.slice(-1000);
      processedData.events = [...(Array.isArray(processedData.events) ? processedData.events : []), {
        reference,
        processedAt: new Date().toISOString(),
        changes,
        skipped,
        note: 'No stock was changed.'
      }].slice(-1000);

      await commitFiles(repo, branch, [
        { path: PROCESSED_PATH, content: JSON.stringify(processedData, null, 2) + '\n' }
      ], `Record Paystack stock event ${reference}`);

      return jsonResponse(200, { ok: true, reference, changes, skipped, message: 'Webhook processed, but no stock fields were changed.' });
    }

    processedReferences.push(reference);
    processedData.processedReferences = processedReferences.slice(-1000);
    processedData.events = [...(Array.isArray(processedData.events) ? processedData.events : []), {
      reference,
      processedAt: new Date().toISOString(),
      changes,
      skipped
    }].slice(-1000);

    const commitSha = await commitFiles(repo, branch, [
      { path: PRODUCTS_PATH, content: JSON.stringify(productsData, null, 2) + '\n' },
      { path: PROCESSED_PATH, content: JSON.stringify(processedData, null, 2) + '\n' }
    ], `Reduce Scentivity stock after Paystack payment ${reference}`);

    await triggerOptionalBuildHook();

    return jsonResponse(200, { ok: true, reference, changes, skipped, commitSha });
  } catch (error) {
    console.error('Stock webhook failed:', error);
    return jsonResponse(500, { error: error.message || 'Stock update failed.' });
  }
};
