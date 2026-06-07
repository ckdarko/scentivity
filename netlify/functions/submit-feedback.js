// Saves customer feedback submissions into data/pending-feedback.json.
// To make submissions appear in /admin automatically, set these Netlify environment variables:
// GITHUB_TOKEN = GitHub fine-grained token with Contents: Read and write
// GITHUB_REPO = owner/repo, for example ckdarko001/scentivity-site
// GITHUB_BRANCH = main
const querystring = require('querystring');

function parseBody(event) {
  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  if (contentType.includes('application/json')) {
    return JSON.parse(event.body || '{}');
  }
  return querystring.parse(event.body || '');
}

function cleanText(value) {
  return String(value || '').trim();
}

async function githubRequest(url, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'scentivity-feedback-function',
      ...(options.headers || {})
    }
  });
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, message: 'Method not allowed' })
    };
  }

  try {
    const body = parseBody(event);
    const name = cleanText(body.name);
    const message = cleanText(body.message);
    const productsPurchased = cleanText(body.productsPurchased || body.product || body.products || '');
    const rating = Math.min(5, Math.max(1, Number(body.rating || 5)));

    if (!name || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, message: 'Name and feedback message are required.' })
      };
    }

    const review = {
      id: `feedback-${Date.now()}`,
      name,
      rating,
      productsPurchased,
      message,
      approved: false,
      date: new Date().toISOString(),
      source: 'customer_submission'
    };

    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const filePath = process.env.FEEDBACK_FILE_PATH || 'data/pending-feedback.json';

    if (!repo || !token) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          savedToAdminQueue: false,
          message: 'Feedback received. Add GITHUB_TOKEN and GITHUB_REPO in Netlify to auto-save it to the /admin pending queue.'
        })
      };
    }

    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const getUrl = `${apiUrl}?ref=${encodeURIComponent(branch)}`;
    const getResponse = await githubRequest(getUrl);

    let fileData = { pendingFeedback: [] };
    let sha = null;

    if (getResponse.ok) {
      const existing = await getResponse.json();
      sha = existing.sha;
      const decoded = Buffer.from(existing.content || '', 'base64').toString('utf8');
      try {
        fileData = JSON.parse(decoded || '{"pendingFeedback":[]}');
      } catch {
        fileData = { pendingFeedback: [] };
      }
    } else if (getResponse.status !== 404) {
      const errorText = await getResponse.text();
      throw new Error(`GitHub read failed: ${getResponse.status} ${errorText}`);
    }

    if (!Array.isArray(fileData.pendingFeedback)) {
      fileData.pendingFeedback = [];
    }

    fileData.pendingFeedback.unshift(review);

    const putBody = {
      message: `Add Scentivity customer feedback from ${name}`,
      content: Buffer.from(JSON.stringify(fileData, null, 2)).toString('base64'),
      branch
    };
    if (sha) putBody.sha = sha;

    const putResponse = await githubRequest(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });

    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      throw new Error(`GitHub write failed: ${putResponse.status} ${errorText}`);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, savedToAdminQueue: true, review })
    };
  } catch (error) {
    console.error('Feedback submission error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        savedToAdminQueue: false,
        message: 'Feedback received, but automatic admin queue saving is not configured correctly yet.'
      })
    };
  }
};
