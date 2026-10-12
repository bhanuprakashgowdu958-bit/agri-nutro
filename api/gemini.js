// Vercel Serverless Function: Gemini AI Proxy
const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_CANDIDATES = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash'
];

function callModel(model, payload) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const body = JSON.stringify(payload);
    const url = new URL(endpoint);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 20000
    };

    const request = https.request(options, (response) => {
      let resData = '';
      response.on('data', chunk => { resData += chunk; });
      response.on('end', () => {
        try {
          const json = JSON.parse(resData);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve({ model, json });
          } else {
            reject({ status: response.statusCode, body: json, model });
          }
        } catch (e) {
          reject({ status: response.statusCode, body: resData, model });
        }
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Model ${model} timed out`));
    });

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

async function callGeminiWithFailover(payload) {
  let lastError = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      const result = await callModel(model, payload);
      return result.json;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All models failed');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const geminiPayload = {
      system_instruction: body.system_instruction || undefined,
      contents: body.contents || [],
      generationConfig: body.generationConfig || {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 600
      }
    };

    const geminiResponse = await callGeminiWithFailover(geminiPayload);
    return res.status(200).json(geminiResponse);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gemini proxy error' });
  }
};
