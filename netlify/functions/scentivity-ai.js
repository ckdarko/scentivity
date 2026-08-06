const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      answer: 'Scentivity is using the free browser-based smart scent helper. No paid OpenAI API request was made.'
    })
  };
};
