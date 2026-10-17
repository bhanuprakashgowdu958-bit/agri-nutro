// Serverless Function for Vercel: /api/config
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();

  return res.status(200).json({
    googleClientId: clientId,
    hasGoogleAuth: Boolean(clientId)
  });
};
